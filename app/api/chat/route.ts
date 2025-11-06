import { NextRequest, NextResponse } from 'next/server';
import { ConversationOrchestrator } from '@/lib/orchestrator';
import { supabaseAdmin } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Initialize or load orchestrator
    let orchestrator: ConversationOrchestrator;
    let newSessionId = sessionId;

    if (sessionId) {
      // Load existing session
      orchestrator = new ConversationOrchestrator(sessionId);
      await orchestrator.loadState(sessionId);
    } else {
      // Create new session
      newSessionId = `session_${nanoid()}`;
      orchestrator = new ConversationOrchestrator(newSessionId);

      // Create session record
      await supabaseAdmin.from('sessions').insert({
        id: newSessionId,
        locale: 'nl',
        consent: true,
      });

      // Track event
      await supabaseAdmin.from('events').insert({
        session_id: newSessionId,
        type: 'session_started',
        payload: { timestamp: new Date().toISOString() },
      });
    }

    // Process the message
    const response = await orchestrator.processMessage(message);

    // Track message event
    await supabaseAdmin.from('events').insert({
      session_id: newSessionId,
      type: 'message_sent',
      payload: { 
        message_length: message.length,
        step: response.step,
      },
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error in chat API:', error);
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
    // Get session data
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    const { data: ideas } = await supabaseAdmin
      .from('ideas')
      .select('*')
      .eq('session_id', sessionId);

    return NextResponse.json({
      session,
      messages,
      ideas,
    });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

