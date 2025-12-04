import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics - Get basic analytics
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get session-specific analytics
      const { data: messages } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      const { data: events } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      return NextResponse.json({
        sessionId,
        messageCount: messages?.length || 0,
        eventCount: events?.length || 0,
        messages,
        events,
      });
    }

    // Get overall stats
    const { count: sessionCount } = await supabaseAdmin
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    const { count: messageCount } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      totalSessions: sessionCount || 0,
      totalMessages: messageCount || 0,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
