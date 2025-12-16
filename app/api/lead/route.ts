import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sessionStore, eventStore, slotStore, messageStore } from '@/lib/storage';
import { trackWidgetEvent } from '@/lib/analytics';
import { generateConversationSummary } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Resend only when needed
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

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

    // Send email notification directly (don't rely on async HTTP call)
    try {
      console.log('📧 Attempting to send lead notification email...');
      
      // Generate conversation summary using Gemini
      const summary = await generateConversationSummary(sessionId);
      console.log('📝 Summary generated:', { 
        hasSummary: !!summary.summary, 
        domains: summary.domains.length,
        hasChallenge: !!summary.challenge 
      });

      // Get conversation messages for context
      const { data: messages } = await messageStore.getBySession(sessionId);
      console.log('💬 Retrieved messages:', messages?.length || 0);

      // Send internal notification email to team
      const resend = getResendClient();
      if (resend) {
        // Use verified domain or Resend's test domain
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const internalEmail = process.env.RESEND_INTERNAL_EMAIL || 'team@blablabuild.com';
        
        console.log('📤 Sending email to:', internalEmail, 'from:', fromEmail);
        
        // Send internal notification with lead info and chat content
        const result = await resend.emails.send({
          from: `blablabuild <${fromEmail}>`,
          to: internalEmail,
          subject: `🎯 Nieuwe lead: ${companyName || name || email}`,
          html: generateInternalNotificationHtml({
            email,
            name,
            companyName,
            phone,
            sessionId,
            summary,
            messages: messages || [],
          }),
        });
        console.log('✅ Lead notification sent to team:', result);

        // Track email sent event
        await eventStore.insert({
          session_id: sessionId,
          type: 'email_sent',
          payload: { email, name, companyName, phone, to: internalEmail },
        });
      } else {
        console.warn('⚠️ Resend API key not configured - email sending skipped');
        console.log('💡 To enable email notifications, set RESEND_API_KEY in your environment variables');
      }
    } catch (emailError: any) {
      console.error('❌ Error sending email notification:', emailError.message || emailError);
      // Don't throw - lead was saved successfully, email is secondary
    }

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

interface InternalNotificationData {
  email: string;
  name?: string;
  companyName?: string;
  phone?: string;
  sessionId: string;
  summary: {
    summary: string;
    domains: string[];
    goldenTip: string;
    challenge: string;
  };
  messages: any[];
}

function generateInternalNotificationHtml(data: InternalNotificationData): string {
  const { email, name, companyName, phone, sessionId, summary, messages } = data;
  
  const conversationHtml = messages
    .map((m: any) => `
      <div style="margin: 10px 0; padding: 10px; background: ${m.role === 'user' ? '#e3f2fd' : '#f5f5f5'}; border-radius: 8px;">
        <strong>${m.role === 'user' ? '👤 Klant' : '🤖 AI'}:</strong>
        <p style="margin: 5px 0 0;">${m.content}</p>
      </div>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #CEFF00; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 8px; }
    .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">🎉 Nieuwe Lead via AI Intake!</h2>
  </div>

  <div class="section">
    <h3>📋 Contactgegevens</h3>
    <p><span class="label">Email:</span> ${email}</p>
    ${name ? `<p><span class="label">Naam:</span> ${name}</p>` : ''}
    ${companyName ? `<p><span class="label">Bedrijf:</span> ${companyName}</p>` : ''}
    ${phone ? `<p><span class="label">Telefoon:</span> ${phone}</p>` : ''}
    <p><span class="label">Session ID:</span> ${sessionId}</p>
  </div>

  <div class="section">
    <h3>🎯 Uitdaging</h3>
    <p>${summary.challenge || 'Niet gespecificeerd'}</p>
  </div>

  <div class="section">
    <h3>📊 Domeinen</h3>
    <p>${summary.domains.length > 0 ? summary.domains.join(', ') : 'Niet gespecificeerd'}</p>
  </div>

  <div class="section">
    <h3>💡 Gouden Tip Gegeven</h3>
    <p>${summary.goldenTip || 'Niet gespecificeerd'}</p>
  </div>

  <div class="section">
    <h3>📝 AI Samenvatting</h3>
    <p>${summary.summary || 'Niet beschikbaar'}</p>
  </div>

  <div class="section">
    <h3>💬 Volledig Gesprek</h3>
    ${conversationHtml || '<p>Geen berichten beschikbaar</p>'}
  </div>

  <p style="margin-top: 20px; text-align: center;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://blablabuild.com'}/admin/sessions/${sessionId}" 
       style="background: #0a0a0a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
      Bekijk in Dashboard
    </a>
  </p>
</body>
</html>
  `;
}
