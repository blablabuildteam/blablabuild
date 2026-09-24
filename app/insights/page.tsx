'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import PasswordGate from '@/components/PasswordGate';
import type { InsightsSummary } from '@/lib/site-insights';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-4 shadow-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/40">{label}</p>
      <p className="mt-2 font-host text-3xl font-light text-black">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-black/45">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BarList({
  rows,
  valueKey = 'count',
  labelKey = 'label',
}: {
  rows: Record<string, string | number>[];
  valueKey?: string;
  labelKey?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => Number(r[valueKey] || 0)));
  if (rows.length === 0) {
    return <p className="text-sm text-black/40">Nog geen data in deze periode.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => {
        const label = String(row[labelKey] ?? '');
        const value = Number(row[valueKey] || 0);
        return (
          <li key={label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-black/80">{label}</span>
              <span className="shrink-0 font-mono text-[12px] text-black/45">{value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-[#ceff00]"
                style={{ width: `${Math.max(4, (value / max) * 100)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function InsightsDashboard() {
  const [days, setDays] = useState(14);
  const [data, setData] = useState<InsightsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/insights/summary?days=${days}`);
      if (res.status === 401) {
        setError('Niet ingelogd — vernieuw de pagina en vul het site-wachtwoord in.');
        setData(null);
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Laden mislukt');
      setData(json as InsightsSummary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm text-black/50 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar site
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-black/40">
              § internal · insights
            </p>
            <h1 className="mt-1 font-host text-3xl font-light md:text-4xl">Site dashboard</h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-black/55">
              Aantallen, herkomst, clicks en scroll — first-party (na cookie-consent). Personen alleen
              via leads (email/bedrijfsdomein), niet via sneaky tracking.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] ${
                  days === d
                    ? 'border-black bg-black text-white'
                    : 'border-black/15 text-black/50 hover:border-black/40'
                }`}
              >
                {d}d
              </button>
            ))}
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1.5 text-sm text-black/60 hover:border-black/40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && !data.db && !data.kv && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Neon niet bereikbaar. Zet{' '}
            <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> op Vercel
            (Production + Preview) en redeploy. GA4/PostHog blijven parallel lopen.
          </div>
        )}

        {loading && !data ? (
          <p className="text-black/40">Laden…</p>
        ) : data ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
              <Stat label="Visitors" value={data.totals.visitors} />
              <Stat label="Sessions" value={data.totals.sessions} />
              <Stat label="Pageviews" value={data.totals.pageViews} />
              <Stat label="Clicks" value={data.totals.clicks} />
              <Stat label="CTAs" value={data.totals.ctas} />
              <Stat label="Chat" value={data.totals.chats} />
              <Stat label="Leads" value={data.totals.leads} />
              <Stat label="Events" value={data.totals.events} />
            </div>

            <p className="mb-6 font-mono text-[11px] text-black/35">
              {data.from} → {data.to} · {data.rangeDays} dagen
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Top pages">
                <BarList
                  rows={data.topPages.map((p) => ({
                    label: p.path,
                    count: p.views,
                  }))}
                />
              </Panel>
              <Panel title="Traffic sources (UTM / referrer)">
                <BarList
                  rows={data.topSources.map((s) => ({
                    label: `${s.source} · ${s.kind}`,
                    count: s.visits,
                  }))}
                />
              </Panel>
              <Panel title="Top actions / events">
                <BarList
                  rows={data.topEvents.map((e) => ({
                    label: `${e.type} · ${e.name}`,
                    count: e.count,
                  }))}
                />
              </Panel>
              <Panel title="Where they click">
                <BarList rows={data.topClicks} />
              </Panel>
              <Panel title="Scroll depth">
                <BarList
                  rows={data.scrollDepth.map((s) => ({
                    label: s.depth.replace('scroll_', '') + '%',
                    count: s.count,
                  }))}
                />
              </Panel>
              <Panel title="Bekende bezoekers (via leads)">
                {data.knownVisitors.length === 0 ? (
                  <p className="text-sm text-black/40">
                    Nog geen gelinkte leads. Zodra iemand email achterlaat in chat/intake, zie je hier
                    bedrijfsdomein + pad.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.knownVisitors.map((v, i) => (
                      <li
                        key={`${v.email || v.company || i}`}
                        className="rounded-xl border border-black/8 bg-black/[0.02] px-3 py-2.5"
                      >
                        <p className="text-sm font-medium text-black">
                          {v.company || v.email || 'Lead'}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-black/45">
                          {[v.name, v.email, v.lastPath].filter(Boolean).join(' · ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            <div className="mt-4">
              <Panel title="Lessen / kansen">
                <ul className="space-y-3">
                  {data.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className={`rounded-xl border px-4 py-3 ${
                        lesson.severity === 'opportunity'
                          ? 'border-[#ceff00]/60 bg-[#ceff00]/15'
                          : lesson.severity === 'watch'
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-black/8 bg-black/[0.02]'
                      }`}
                    >
                      <p className="text-sm font-medium text-black">{lesson.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-black/60">
                        {lesson.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <PasswordGate
      title="Site insights"
      description="Intern overzicht van verkeer, bronnen en acties op blablabuild.com."
    >
      <InsightsDashboard />
    </PasswordGate>
  );
}
