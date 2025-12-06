import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/debug/logs - Query application logs
 * Note: Database logging disabled - logs only go to console
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    logs: [],
    pagination: {
      limit: 100,
      offset: 0,
      total: 0,
      hasMore: false,
    },
    filters: {
      level: null,
      sessionId: null,
      endpoint: null,
      since: null,
      before: null,
    },
    message: 'Database logging disabled. Logs are only available in console.',
  });
}

/**
 * DELETE /api/debug/logs - Clear old logs
 * Note: Database logging disabled
 */
export async function DELETE(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Database logging disabled. No logs to delete.',
  });
}
