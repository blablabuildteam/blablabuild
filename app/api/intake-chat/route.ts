import { NextRequest, NextResponse } from 'next/server';
import { GeminiIntakeChat } from '@/lib/gemini';
import { sessionStore, eventStore, messageStore } from '@/lib/storage';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/intake-chat
 * Chat endpoint specifically for the intake page
 * Uses GeminiIntakeChat with optimized prompts for intake flow
 */
export async function POST(req: NextRequest) {
  console.log('📨 POST /api/intake-chat - Request received');
  try {
    const body = await req.json();
    console.log('📦 Request body:', { message: body.message?.substring(0, 50), sessionId: body.sessionId });
    const { message, sessionId, locale } = body;

    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message:', message);
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate sessionId format if provided
    if (sessionId && typeof sessionId === 'string') {
      const isValidSessionId = sessionId.startsWith('session_') || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
      if (!isValidSessionId) {
        console.error('❌ Invalid session ID format:', sessionId);
        return NextResponse.json(
          { error: 'Invalid session ID format' },
          { status: 400 }
        );
      }
    }

    let activeSessionId = sessionId;

    // Create new session if none provided
    if (!sessionId) {
      console.log('🆕 Creating new intake session');
      activeSessionId = `session_${nanoid()}`;

      await sessionStore.insert({
        id: activeSessionId,
        locale: locale || 'nl',
        consent: true,
      });

      await eventStore.insert({
        session_id: activeSessionId,
        type: 'intake_session_started',
        payload: { timestamp: new Date().toISOString(), source: 'intake_page' },
      });
    }

    // Get locale from session if it exists, otherwise use provided locale
    let sessionLocale = locale || 'nl';
    if (activeSessionId) {
      try {
        const { data: session } = await sessionStore.get(activeSessionId);
        if (session?.locale) {
          sessionLocale = session.locale;
        }
      } catch (error) {
        console.log('Could not fetch session locale, using provided locale');
      }
    }
    
    // Initialize Gemini intake chat and load history
    const chat = new GeminiIntakeChat(activeSessionId, sessionLocale);
    await chat.loadHistory();

    console.log('🤖 Processing intake message with Gemini...');
    const response = await chat.chat(message);
    console.log('✅ Gemini intake response:', { 
      message: response.message?.substring(0, 50), 
      step: response.step,
      progress: response.progress,
    });

    // Track message event
    try {
      await eventStore.insert({
        session_id: activeSessionId,
        type: 'intake_message_sent',
        payload: { 
          message_length: message.length,
          step: response.step,
          source: 'intake_page',
        },
      });
    } catch (err) {
      console.error('Error tracking event:', err);
    }

    console.log('📤 Sending intake response to client');
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Error in intake-chat API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
