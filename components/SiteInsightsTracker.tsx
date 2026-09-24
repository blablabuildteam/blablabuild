'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { hasConsent } from '@/lib/consent';

const VISITOR_KEY = 'bla_visitor_id';
const SESSION_KEY = 'bla_session_id';
const UTM_KEY = 'bla_utm';
const QUEUE_KEY = 'bla_insights_queue';

type Utm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

function rid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/** Stable anonymous visitor id (localStorage). Safe to call from lead forms. */
export function getSiteVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = rid('v');
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return rid('v');
  }
}

function getVisitorId() {
  return getSiteVisitorId();
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = rid('s');
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return rid('s');
  }
}

function captureUtm(searchParams: URLSearchParams | null): Utm | undefined {
  if (!searchParams) return undefined;
  const utm: Utm = {
    source: searchParams.get('utm_source') || undefined,
    medium: searchParams.get('utm_medium') || undefined,
    campaign: searchParams.get('utm_campaign') || undefined,
    content: searchParams.get('utm_content') || undefined,
    term: searchParams.get('utm_term') || undefined,
  };
  if (!utm.source && !utm.medium && !utm.campaign) {
    try {
      const stored = sessionStorage.getItem(UTM_KEY);
      return stored ? (JSON.parse(stored) as Utm) : undefined;
    } catch {
      return undefined;
    }
  }
  try {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  } catch {
    // ignore
  }
  return utm;
}

function enqueue(event: Record<string, unknown>) {
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    const queue = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
    queue.push(event);
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-80)));
  } catch {
    // ignore
  }
}

async function flushQueue() {
  if (!hasConsent('analytics')) return;
  let queue: Record<string, unknown>[] = [];
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    queue = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
    sessionStorage.removeItem(QUEUE_KEY);
  } catch {
    return;
  }
  if (queue.length === 0) return;

  try {
    const body = JSON.stringify({ events: queue });
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/insights/collect', blob);
      return;
    }
    await fetch('/api/insights/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // re-queue on failure
    try {
      sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // ignore
    }
  }
}

export function trackSiteInsight(
  type: string,
  name: string,
  meta?: Record<string, string | number | boolean | null>
) {
  if (typeof window === 'undefined') return;
  if (!hasConsent('analytics')) return;

  let utm: Utm | undefined;
  try {
    const stored = sessionStorage.getItem(UTM_KEY);
    utm = stored ? (JSON.parse(stored) as Utm) : undefined;
  } catch {
    utm = undefined;
  }

  enqueue({
    type,
    name,
    path: window.location.pathname + window.location.search,
    title: document.title,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    referrer: document.referrer || undefined,
    utm,
    meta,
    ts: new Date().toISOString(),
  });

  // Debounced flush
  window.setTimeout(() => {
    void flushQueue();
  }, 400);
}

/**
 * First-party tracker: pageviews, CTA/link clicks, scroll depth.
 * Only runs after analytics cookie consent.
 */
export default function SiteInsightsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollMarks = useRef(new Set<number>());
  const lastPath = useRef<string>('');

  useEffect(() => {
    const onConsent = () => {
      if (hasConsent('analytics')) void flushQueue();
    };
    window.addEventListener('consentUpdated', onConsent);
    return () => window.removeEventListener('consentUpdated', onConsent);
  }, []);

  // Page views
  useEffect(() => {
    if (!pathname) return;
    if (!hasConsent('analytics')) return;

    const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    if (lastPath.current === path) return;
    lastPath.current = path;
    scrollMarks.current = new Set();

    captureUtm(searchParams);
    trackSiteInsight('page_view', 'page_view', {
      locale: pathname.split('/')[1] || '',
    });
  }, [pathname, searchParams]);

  // Clicks + scroll
  useEffect(() => {
    if (!hasConsent('analytics')) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest('a,button,[data-track]') as HTMLElement | null;
      if (!el) return;

      const track = el.getAttribute('data-track');
      if (track) {
        trackSiteInsight('cta', track, {
          label: (el.textContent || '').trim().slice(0, 80),
        });
        return;
      }

      if (el.tagName === 'A') {
        const href = (el as HTMLAnchorElement).href || '';
        const text = (el.textContent || '').trim().slice(0, 80);
        const external =
          href.startsWith('http') && !href.includes(window.location.hostname);
        trackSiteInsight(external ? 'outbound' : 'click', external ? 'outbound_link' : 'nav_link', {
          href: href.slice(0, 300),
          label: text,
        });
      } else if (el.tagName === 'BUTTON') {
        const text = (el.textContent || '').trim().slice(0, 80);
        if (text) {
          trackSiteInsight('click', 'button_click', { label: text });
        }
      }
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const height = doc.scrollHeight - window.innerHeight;
      if (height <= 0) return;
      const pct = Math.round((scrollTop / height) * 100);
      for (const mark of [25, 50, 75, 100]) {
        if (pct >= mark && !scrollMarks.current.has(mark)) {
          scrollMarks.current.add(mark);
          trackSiteInsight('scroll', `scroll_${mark}`, { depth: mark });
        }
      }
    };

    const onHide = () => {
      void flushQueue();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onHide();
    });

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', onHide);
    };
  }, [pathname]);

  return null;
}
