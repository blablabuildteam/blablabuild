import { NextRequest, NextResponse } from 'next/server';
import { GeminiChat } from '@/lib/gemini';
import { sessionStore, eventStore, messageStore } from '@/lib/storage';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('📨 POST /api/chat - Request received');
  try {
    const body = await req.json();
    console.log('📦 Request body:', { message: body.message?.substring(0, 50), sessionId: body.sessionId });
    const { message, sessionId } = body;

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
      console.log('🆕 Creating new session');
      activeSessionId = `session_${nanoid()}`;

      await sessionStore.insert({
        id: activeSessionId,
        locale: 'nl',
        consent: true,
      });

      await eventStore.insert({
        session_id: activeSessionId,
        type: 'session_started',
        payload: { timestamp: new Date().toISOString() },
      });
    }

    // Initialize Gemini chat and load history
    const chat = new GeminiChat(activeSessionId);
    await chat.loadHistory();

    console.log('🤖 Processing message with Gemini...');
    const response = await chat.chat(message);
    console.log('✅ Gemini response:', { 
      message: response.message?.substring(0, 50), 
      step: response.step,
      progress: response.progress,
    });

    // Track message event
    try {
      await eventStore.insert({
        session_id: activeSessionId,
        type: 'message_sent',
        payload: { 
          message_length: message.length,
          step: response.step,
        },
      });
    } catch (err) {
      console.error('Error tracking event:', err);
    }

    console.log('📤 Sending response to client');
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Error in chat API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    const { data: session } = await sessionStore.get(sessionId);
    const { data: messages } = await messageStore.getBySession(sessionId);

    return NextResponse.json({
      session,
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
