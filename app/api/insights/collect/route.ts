import { NextRequest, NextResponse } from 'next/server';
import {
  linkVisitorIdentity,
  normalizeIncomingEvent,
  recordSiteEvents,
  type SiteEvent,
  type SiteIdentity,
} from '@/lib/site-insights';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/insights/collect
 * First-party site events (only called after analytics consent on the client).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const batch: unknown[] = Array.isArray(body?.events)
      ? body.events
      : body?.event
        ? [body.event]
        : [];

    if (batch.length === 0) {
      return NextResponse.json({ ok: false, error: 'No events' }, { status: 400 });
    }

    const normalized: SiteEvent[] = [];
    for (const item of batch.slice(0, 40)) {
      const ev = normalizeIncomingEvent(item as Partial<SiteEvent>);
      if (ev) normalized.push(ev);
    }

    if (normalized.length === 0) {
      return NextResponse.json({ ok: false, error: 'Invalid events' }, { status: 400 });
    }

    const result = await recordSiteEvents(normalized);

    // Optional identity link (lead form)
    if (body?.identity && typeof body.identity === 'object') {
      const id = body.identity as Partial<SiteIdentity>;
      if (id.visitorId) {
        await linkVisitorIdentity({
          visitorId: String(id.visitorId),
          email: id.email ? String(id.email) : undefined,
          name: id.name ? String(id.name) : undefined,
          company: id.company ? String(id.company) : undefined,
          linkedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[insights/collect]', error);
    return NextResponse.json({ ok: false, error: 'Failed' }, { status: 500 });
  }
}
