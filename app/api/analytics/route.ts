import { NextRequest, NextResponse } from 'next/server';
import { sessionStore, messageStore, eventStore } from '@/lib/storage';

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
      const { data: messages } = await messageStore.getBySession(sessionId);
      const { data: events } = await eventStore.getBySession(sessionId);

      return NextResponse.json({
        sessionId,
        messageCount: messages?.length || 0,
        eventCount: events?.length || 0,
        messages,
        events,
      });
    }

    // Get overall stats
    const { count: sessionCount } = await sessionStore.count();
    const { count: messageCount } = await messageStore.count();

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
