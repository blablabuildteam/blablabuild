import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { buildInsightsSummary } from '@/lib/site-insights';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AUTH_COOKIE_NAME = 'site_auth';

async function isAuthed() {
  const token = process.env.AUTH_TOKEN;
  if (!token) return true;
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value === token;
}

/**
 * GET /api/insights/summary?days=14
 * Internal dashboard data — requires site password when AUTH_TOKEN is set.
 */
export async function GET(req: NextRequest) {
  try {
    if (!(await isAuthed())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const days = Number(req.nextUrl.searchParams.get('days') || '14');
    const summary = await buildInsightsSummary(Number.isFinite(days) ? days : 14);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[insights/summary]', error);
    return NextResponse.json({ error: 'Failed to load insights' }, { status: 500 });
  }
}
