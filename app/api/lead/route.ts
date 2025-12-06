import { NextRequest, NextResponse } from 'next/server';
import { sessionStore, eventStore, slotStore } from '@/lib/storage';
import { trackWidgetEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, email, name, companyName, phone, role, notes } = await req.json();

    if (!sessionId || !email) {
      return NextResponse.json(
        { error: 'Session ID and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Update session with lead information
    await sessionStore.update(sessionId, {
      email,
      completed_at: new Date().toISOString(),
    });

    // Save lead data to slots
    const leadData: Record<string, string> = {};
    if (name) leadData.name = name;
    if (companyName) leadData.company_name = companyName;
    if (phone) leadData.phone = phone;
    if (role) leadData.role = role;
    if (notes) leadData.notes = notes;

    // Save lead data to slots
    for (const [key, value] of Object.entries(leadData)) {
      await slotStore.upsert({
        session_id: sessionId,
        key,
        value,
        confidence: 1.0,
      });
    }

    // Track lead creation event
    await eventStore.insert({
      session_id: sessionId,
      type: 'lead_created',
      payload: {
        email,
        name,
        company_name: companyName,
        phone,
        role,
        timestamp: new Date().toISOString(),
      },
    });

    // Track analytics
    trackWidgetEvent(sessionId, 'lead_created', {
      has_name: !!name,
      has_company: !!companyName,
      has_phone: !!phone,
    });

    // Trigger email sending with conversation summary (async, don't wait)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    fetch(`${appUrl}/api/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId, 
        email,
        name,
        companyName,
        phone,
      }),
    }).catch(err => console.error('Error triggering email:', err));

    return NextResponse.json({
      success: true,
      message: 'Lead information saved successfully',
    });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json(
      { error: 'Failed to save lead information' },
      { status: 500 }
    );
  }
}
