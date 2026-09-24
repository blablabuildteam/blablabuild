import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { nanoid } from 'nanoid';

export type SiteEventType =
  | 'page_view'
  | 'click'
  | 'scroll'
  | 'cta'
  | 'chat'
  | 'lead'
  | 'outbound'
  | 'custom';

export type SiteUtm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

export type SiteEvent = {
  id: string;
  ts: string;
  type: SiteEventType;
  name: string;
  path: string;
  title?: string;
  visitorId: string;
  sessionId: string;
  referrer?: string;
  referrerHost?: string;
  utm?: SiteUtm;
  meta?: Record<string, string | number | boolean | null>;
};

export type SiteIdentity = {
  visitorId: string;
  email?: string;
  name?: string;
  company?: string;
  linkedAt: string;
};

type DbEventRow = {
  id: string;
  ts: string;
  type: string;
  name: string;
  path: string;
  title: string | null;
  visitor_id: string;
  session_id: string;
  referrer: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  meta: Record<string, unknown> | null;
};

function getSql(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  return neon(url);
}

function hostFromReferrer(ref?: string | null): string | undefined {
  if (!ref) return undefined;
  try {
    return new URL(ref).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export function normalizeIncomingEvent(
  raw: Partial<SiteEvent> & {
    type?: string;
    name?: string;
    path?: string;
    visitorId?: string;
    sessionId?: string;
  }
): SiteEvent | null {
  if (!raw.type || !raw.name || !raw.path || !raw.visitorId || !raw.sessionId) return null;
  const type = raw.type as SiteEventType;
  const allowed: SiteEventType[] = [
    'page_view',
    'click',
    'scroll',
    'cta',
    'chat',
    'lead',
    'outbound',
    'custom',
  ];
  if (!allowed.includes(type)) return null;

  return {
    id: raw.id || nanoid(12),
    ts: raw.ts || new Date().toISOString(),
    type,
    name: String(raw.name).slice(0, 120),
    path: String(raw.path).slice(0, 300),
    title: raw.title ? String(raw.title).slice(0, 200) : undefined,
    visitorId: String(raw.visitorId).slice(0, 64),
    sessionId: String(raw.sessionId).slice(0, 64),
    referrer: raw.referrer ? String(raw.referrer).slice(0, 500) : undefined,
    referrerHost: raw.referrerHost || hostFromReferrer(raw.referrer),
    utm: raw.utm,
    meta: raw.meta,
  };
}

function fromRow(row: DbEventRow): SiteEvent {
  return {
    id: row.id,
    ts: typeof row.ts === 'string' ? row.ts : new Date(row.ts).toISOString(),
    type: row.type as SiteEventType,
    name: row.name,
    path: row.path,
    title: row.title || undefined,
    visitorId: row.visitor_id,
    sessionId: row.session_id,
    referrer: row.referrer || undefined,
    referrerHost: row.referrer_host || undefined,
    utm:
      row.utm_source || row.utm_medium || row.utm_campaign
        ? {
            source: row.utm_source || undefined,
            medium: row.utm_medium || undefined,
            campaign: row.utm_campaign || undefined,
            content: row.utm_content || undefined,
            term: row.utm_term || undefined,
          }
        : undefined,
    meta: (row.meta || {}) as SiteEvent['meta'],
  };
}

export async function recordSiteEvents(
  events: SiteEvent[]
): Promise<{ ok: boolean; db: boolean; stored: number }> {
  const sql = getSql();
  if (!sql || events.length === 0) {
    return { ok: true, db: Boolean(sql), stored: 0 };
  }

  try {
    let stored = 0;
    for (const ev of events) {
      await sql`
        INSERT INTO site_events (
          id, ts, type, name, path, title, visitor_id, session_id,
          referrer, referrer_host, utm_source, utm_medium, utm_campaign,
          utm_content, utm_term, meta
        ) VALUES (
          ${ev.id},
          ${ev.ts},
          ${ev.type},
          ${ev.name},
          ${ev.path},
          ${ev.title || null},
          ${ev.visitorId},
          ${ev.sessionId},
          ${ev.referrer || null},
          ${ev.referrerHost || null},
          ${ev.utm?.source || null},
          ${ev.utm?.medium || null},
          ${ev.utm?.campaign || null},
          ${ev.utm?.content || null},
          ${ev.utm?.term || null},
          ${JSON.stringify(ev.meta || {})}
        )
        ON CONFLICT (id) DO NOTHING
      `;
      stored += 1;
    }
    return { ok: true, db: true, stored };
  } catch (error) {
    console.error('[site-insights] insert failed', error);
    return { ok: false, db: true, stored: 0 };
  }
}

export async function linkVisitorIdentity(identity: SiteIdentity): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO site_identities (visitor_id, email, name, company, linked_at)
    VALUES (
      ${identity.visitorId},
      ${identity.email || null},
      ${identity.name || null},
      ${identity.company || null},
      ${identity.linkedAt || new Date().toISOString()}
    )
    ON CONFLICT (visitor_id) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, site_identities.email),
      name = COALESCE(EXCLUDED.name, site_identities.name),
      company = COALESCE(EXCLUDED.company, site_identities.company),
      linked_at = EXCLUDED.linked_at
  `;
}

function companyFromEmail(email?: string): string | undefined {
  if (!email || !email.includes('@')) return undefined;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return undefined;
  const free = new Set([
    'gmail.com',
    'googlemail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'yahoo.com',
    'icloud.com',
    'me.com',
    'proton.me',
    'protonmail.com',
  ]);
  if (free.has(domain)) return undefined;
  return domain;
}

export type InsightsSummary = {
  /** true when Neon Postgres (DATABASE_URL) is reachable */
  db: boolean;
  /** @deprecated alias for dashboard banner */
  kv: boolean;
  rangeDays: number;
  from: string;
  to: string;
  totals: {
    events: number;
    pageViews: number;
    visitors: number;
    sessions: number;
    clicks: number;
    ctas: number;
    chats: number;
    leads: number;
  };
  topPages: { path: string; views: number; visitors: number }[];
  topSources: { source: string; visits: number; kind: 'utm' | 'referrer' | 'direct' }[];
  topEvents: { name: string; count: number; type: string }[];
  topClicks: { label: string; count: number }[];
  scrollDepth: { depth: string; count: number }[];
  knownVisitors: {
    company?: string;
    email?: string;
    name?: string;
    lastPath?: string;
    linkedAt: string;
  }[];
  lessons: {
    id: string;
    title: string;
    detail: string;
    severity: 'info' | 'watch' | 'opportunity';
  }[];
};

function countMapInc(map: Map<string, number>, key: string, n = 1) {
  map.set(key, (map.get(key) || 0) + n);
}

export async function buildInsightsSummary(rangeDays = 14): Promise<InsightsSummary> {
  const days = Math.min(Math.max(rangeDays, 1), 90);
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(to.getUTCDate() - (days - 1));
  const fromIso = from.toISOString();
  const toIso = to.toISOString();

  const sql = getSql();
  let events: SiteEvent[] = [];

  if (sql) {
    try {
      const data = (await sql`
        SELECT *
        FROM site_events
        WHERE ts >= ${fromIso} AND ts <= ${toIso}
        ORDER BY ts DESC
        LIMIT 20000
      `) as DbEventRow[];
      events = data.map(fromRow);
    } catch (error) {
      console.error('[site-insights] summary query failed', error);
    }
  }

  const visitors = new Set<string>();
  const sessions = new Set<string>();
  const pageViews = events.filter((e) => e.type === 'page_view');
  const clicks = events.filter(
    (e) => e.type === 'click' || e.type === 'cta' || e.type === 'outbound'
  );
  const ctas = events.filter((e) => e.type === 'cta');
  const chats = events.filter(
    (e) => e.type === 'chat' || e.name.startsWith('chat_') || e.name.startsWith('v2_chat')
  );
  const leads = events.filter((e) => e.type === 'lead' || e.name.includes('lead'));

  events.forEach((e) => {
    visitors.add(e.visitorId);
    sessions.add(e.sessionId);
  });

  const pageViewsByPath = new Map<string, number>();
  const pageVisitorsByPath = new Map<string, Set<string>>();
  for (const e of pageViews) {
    countMapInc(pageViewsByPath, e.path);
    const set = pageVisitorsByPath.get(e.path) || new Set();
    set.add(e.visitorId);
    pageVisitorsByPath.set(e.path, set);
  }

  const sourceCounts = new Map<string, { visits: number; kind: 'utm' | 'referrer' | 'direct' }>();
  for (const e of pageViews) {
    let source = 'direct / none';
    let kind: 'utm' | 'referrer' | 'direct' = 'direct';
    if (e.utm?.source) {
      source = `${e.utm.source}${e.utm.medium ? ` / ${e.utm.medium}` : ''}${
        e.utm.campaign ? ` · ${e.utm.campaign}` : ''
      }`;
      kind = 'utm';
    } else if (e.referrerHost) {
      source = e.referrerHost;
      kind = 'referrer';
    }
    const prev = sourceCounts.get(source) || { visits: 0, kind };
    prev.visits += 1;
    sourceCounts.set(source, prev);
  }

  const eventCounts = new Map<string, { count: number; type: string }>();
  for (const e of events) {
    const key = `${e.type}:${e.name}`;
    const prev = eventCounts.get(key) || { count: 0, type: e.type };
    prev.count += 1;
    eventCounts.set(key, prev);
  }

  const clickCounts = new Map<string, number>();
  for (const e of clicks) {
    const label =
      (typeof e.meta?.label === 'string' && e.meta.label) ||
      (typeof e.meta?.href === 'string' && e.meta.href) ||
      e.name;
    countMapInc(clickCounts, String(label).slice(0, 120));
  }

  const scrollCounts = new Map<string, number>();
  for (const e of events.filter((x) => x.type === 'scroll')) {
    countMapInc(scrollCounts, e.name);
  }

  const knownVisitors: InsightsSummary['knownVisitors'] = [];
  const seenEmails = new Set<string>();

  if (sql) {
    try {
      const identities = (await sql`
        SELECT visitor_id, email, name, company, linked_at
        FROM site_identities
        WHERE linked_at >= ${fromIso}
        ORDER BY linked_at DESC
        LIMIT 40
      `) as {
        visitor_id: string;
        email: string | null;
        name: string | null;
        company: string | null;
        linked_at: string;
      }[];

      for (const row of identities) {
        const email = row.email;
        if (email && seenEmails.has(email.toLowerCase())) continue;
        if (email) seenEmails.add(email.toLowerCase());
        knownVisitors.push({
          email: email || undefined,
          name: row.name || undefined,
          company: row.company || companyFromEmail(email || undefined),
          linkedAt:
            typeof row.linked_at === 'string'
              ? row.linked_at
              : new Date(row.linked_at).toISOString(),
        });
      }
    } catch (error) {
      console.error('[site-insights] identities query failed', error);
    }
  }

  for (const e of leads) {
    const email = typeof e.meta?.email === 'string' ? e.meta.email : undefined;
    if (email && seenEmails.has(email.toLowerCase())) continue;
    if (email) seenEmails.add(email.toLowerCase());
    knownVisitors.push({
      email,
      name: typeof e.meta?.name === 'string' ? e.meta.name : undefined,
      company:
        (typeof e.meta?.company === 'string' && e.meta.company) || companyFromEmail(email),
      lastPath: e.path,
      linkedAt: e.ts,
    });
  }

  const lessons: InsightsSummary['lessons'] = [];
  const totalViews = pageViews.length;
  const uniqueVisitors = visitors.size || 1;
  const chatRate = chats.length / uniqueVisitors;
  const leadRate = leads.length / uniqueVisitors;
  const avgScroll75 = (scrollCounts.get('scroll_75') || 0) / Math.max(totalViews, 1);

  if (!sql) {
    lessons.push({
      id: 'no-db',
      title: 'Database niet gekoppeld',
      detail: 'Zet DATABASE_URL (Neon) op Vercel Production + Preview.',
      severity: 'watch',
    });
  } else if (totalViews === 0) {
    lessons.push({
      id: 'no-data',
      title: 'Nog weinig data',
      detail:
        'Zodra bezoekers analytics-cookies accepteren, vullen pageviews, bronnen en acties zich.',
      severity: 'info',
    });
  }

  if (totalViews > 20 && avgScroll75 < 0.2) {
    lessons.push({
      id: 'low-scroll',
      title: 'Weinig diepe scroll',
      detail:
        'Minder dan ~20% haalt 75% scroll. Hero/CTA bovenaan aanscherpen of content inkorten.',
      severity: 'watch',
    });
  }

  if (chats.length > 5 && leadRate < chatRate * 0.15) {
    lessons.push({
      id: 'chat-friction',
      title: 'Chat opent, weinig leads',
      detail:
        'Relatief veel chat-opens vs leads. Frictie in intake verminderen of sneller naar Calendly/email.',
      severity: 'opportunity',
    });
  }

  const topPage = [...pageViewsByPath.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topPage && topPage[1] > 10 && !topPage[0].includes('cases')) {
    lessons.push({
      id: 'push-cases',
      title: 'Cases meer pushen vanaf top-pagina',
      detail: `“${topPage[0]}” krijgt de meeste views. Zet daar een duidelijke Cases/proof CTA.`,
      severity: 'opportunity',
    });
  }

  const linkedin = [...sourceCounts.entries()].find(([s]) => s.includes('linkedin'));
  if (linkedin && linkedin[1].visits > 3) {
    lessons.push({
      id: 'linkedin-works',
      title: 'LinkedIn levert verkeer',
      detail: `${linkedin[1].visits} hits via LinkedIn. Dubbel down op posts met Cases/CTA-links.`,
      severity: 'info',
    });
  }

  if (knownVisitors.length > 0) {
    lessons.push({
      id: 'known-visitors',
      title: 'Bekende bezoekers via leads',
      detail:
        'Personen via lead-emails (bedrijfsdomein), niet via tracking zonder toestemming. Voor IP→bedrijf later RB2B/Clearbit.',
      severity: 'info',
    });
  }

  const topPages = [...pageViewsByPath.entries()]
    .map(([path, views]) => ({
      path,
      views,
      visitors: pageVisitorsByPath.get(path)?.size || 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);

  const topSources = [...sourceCounts.entries()]
    .map(([source, v]) => ({ source, visits: v.visits, kind: v.kind }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 12);

  const topEvents = [...eventCounts.entries()]
    .map(([key, v]) => ({
      name: key.split(':').slice(1).join(':'),
      count: v.count,
      type: v.type,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const topClicks = [...clickCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const scrollDepth = ['scroll_25', 'scroll_50', 'scroll_75', 'scroll_100'].map((depth) => ({
    depth,
    count: scrollCounts.get(depth) || 0,
  }));

  return {
    db: Boolean(sql),
    kv: Boolean(sql),
    rangeDays: days,
    from: fromIso.slice(0, 10),
    to: toIso.slice(0, 10),
    totals: {
      events: events.length,
      pageViews: pageViews.length,
      visitors: visitors.size,
      sessions: sessions.size,
      clicks: clicks.length,
      ctas: ctas.length,
      chats: chats.length,
      leads: leads.length,
    },
    topPages,
    topSources,
    topEvents,
    topClicks,
    scrollDepth,
    knownVisitors: knownVisitors.slice(0, 25),
    lessons,
  };
}
