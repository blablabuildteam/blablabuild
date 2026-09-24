import { NextRequest, NextResponse } from 'next/server';
import { buildInsightsSummary } from '@/lib/site-insights';
import { isSiteAuthed } from '@/lib/site-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/insights/summary?days=14
 * Internal dashboard data — requires site password when SITE_PASSWORD is set.
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isSiteAuthed())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const days = Number(req.nextUrl.searchParams.get('days') || '14');
    const summary = await buildInsightsSummary(Number.isFinite(days) ? days : 14);
    const res = NextResponse.json(summary);
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res;
  } catch (error) {
    console.error('[insights/summary]', error);
    return NextResponse.json({ error: 'Failed to load insights' }, { status: 500 });
  }
}
