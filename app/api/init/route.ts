import { NextRequest, NextResponse } from 'next/server';
import { GeminiChat } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { utm_source, utm_medium, utm_campaign } = await req.json();

    // Create new session
    const sessionId = `session_${nanoid()}`;
    
    await supabaseAdmin.from('sessions').insert({
      id: sessionId,
      locale: 'nl',
      utm_source,
      utm_medium,
      utm_campaign,
      consent: true,
    });

    // Initialize Gemini chat
    const chat = new GeminiChat(sessionId);
    
    // Get initial message (empty message triggers welcome)
    const response = await chat.chat('');

    // Track event
    await supabaseAdmin.from('events').insert({
      session_id: sessionId,
      type: 'widget_opened',
      payload: { 
        utm_source,
        utm_medium,
        utm_campaign,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error initializing session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
