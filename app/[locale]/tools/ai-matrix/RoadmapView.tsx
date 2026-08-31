'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import {
  type PriorityStatus,
  type UseCase,
  PRIORITY_STATUS_META,
  ROADMAP_STATUSES,
  getDeptColor,
  normalizePriorityStatus,
  sortUseCasesByPriority,
} from './types';
import {
  HORIZON_WINDOW,
  ROADMAP_START,
  TIMELINE_MONTHS,
  estimateMonths,
  formatDuration,
  monthLabel,
  monthRangeLabel,
} from './RoadmapTimeline';

type HorizonFocus = 'now' | 'now-near' | 'all';

interface Props {
  useCases: UseCase[];
  onBack: () => void;
  onGoPrioritize?: () => void;
}

export default function RoadmapView({ useCases, onBack, onGoPrioritize }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<HorizonFocus>('now');

  const visibleHorizons = useMemo(() => {
    if (focus === 'now') return ['now'] as const;
    if (focus === 'now-near') return ['now', 'near'] as const;
    return ROADMAP_STATUSES;
  }, [focus]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { now: 0, near: 0, next: 0, later: 0, kill: 0 };
    useCases.forEach((uc) => {
      c[normalizePriorityStatus(uc.priorityStatus)] += 1;
    });
    return c;
  }, [useCases]);

  const selected = selectedId ? useCases.find((u) => u.id === selectedId) : null;

  const monthTicks = useMemo(
    () => Array.from({ length: TIMELINE_MONTHS }, (_, i) => i),
    []
  );

  const lanes = useMemo(() => {
    const ordered = sortUseCasesByPriority(useCases);
    return visibleHorizons.map((horizon) => {
      const items = ordered.filter(
        (uc) => normalizePriorityStatus(uc.priorityStatus) === horizon
      );
      const months = items.reduce((sum, uc) => sum + estimateMonths(uc), 0);
      return { horizon, items, months };
    });
  }, [useCases, visibleHorizons]);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[15px] font-medium text-white/85 transition-colors hover:border-bla-lime/40 hover:bg-bla-lime/10 hover:text-bla-lime"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to matrix
      </button>

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bla-lime/70">
            § roadmap · internal
          </p>
          <h2 className="mt-1 font-host text-2xl font-light text-white md:text-3xl">Timeline</h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Calendar {monthLabel(0, ROADMAP_START)} → {monthLabel(TIMELINE_MONTHS - 1, ROADMAP_START)}.
            Rank cases in <span className="text-white/75">Prioritize</span> first — start here with{' '}
            <span className="text-bla-lime">Now</span>, then open Near / full year when ready.
          </p>
        </div>
        {onGoPrioritize && (
          <button
            type="button"
            onClick={onGoPrioritize}
            className="rounded-full border border-white/15 px-4 py-2 text-[13px] text-white/70 hover:border-bla-lime/30 hover:text-bla-lime"
          >
            Open Prioritize →
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">Show</span>
        {(
          [
            { id: 'now' as const, label: `Now only (${counts.now})` },
            { id: 'now-near' as const, label: `Now + Near (${counts.now + counts.near})` },
            { id: 'all' as const, label: `Full year (${counts.now + counts.near + counts.next + counts.later})` },
          ]
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setFocus(opt.id)}
            className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
              focus === opt.id
                ? 'border-bla-lime/35 bg-bla-lime/10 text-bla-lime'
                : 'border-white/10 text-white/45 hover:text-white/75'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f12]">
        <div className="border-b border-white/8 px-5 py-3">
          <div className="relative ml-[min(42%,280px)] h-7 md:ml-[280px]">
            {monthTicks.map((m) => (
              <div
                key={m}
                className="absolute top-0 flex flex-col items-start"
                style={{ left: `${(m / TIMELINE_MONTHS) * 100}%` }}
              >
                <span className="font-mono text-[9px] text-white/40">{monthLabel(m)}</span>
                <span className="mt-1 h-2 w-px bg-white/15" />
              </div>
            ))}
          </div>
          <div className="relative mt-1 ml-[min(42%,280px)] h-2 overflow-hidden rounded-full bg-white/[0.04] md:ml-[280px]">
            {ROADMAP_STATUSES.map((h) => {
              const win = HORIZON_WINDOW[h];
              const meta = PRIORITY_STATUS_META[h];
              const left = (win.start / TIMELINE_MONTHS) * 100;
              const width = ((win.end - win.start) / TIMELINE_MONTHS) * 100;
              const active = (visibleHorizons as readonly string[]).includes(h);
              return (
                <div
                  key={h}
                  title={`${meta.label} · ${monthRangeLabel(win.start, win.end)}`}
                  className={`absolute inset-y-0 ${meta.bg} ${active ? 'opacity-80' : 'opacity-20'}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}
          </div>
        </div>

        <div className="divide-y divide-white/6">
          {lanes.map(({ horizon, items, months }) => {
            const meta = PRIORITY_STATUS_META[horizon];
            const win = HORIZON_WINDOW[horizon];

            return (
              <div key={horizon} className="px-4 py-4 md:px-5">
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${meta.border} ${meta.bg} ${meta.color}`}
                  >
                    {meta.label}
                  </span>
                  <span className="font-mono text-[11px] text-white/35">
                    {monthRangeLabel(win.start, win.end)}
                  </span>
                  <span className="text-[12px] text-white/40">
                    {items.length} · ~{months.toFixed(months % 1 ? 1 : 0)} mo load
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className="py-3 text-[13px] text-white/30">
                    Nothing in {meta.label} yet — set horizons in Prioritize.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((uc, idx) => {
                      const dur = estimateMonths(uc);
                      const slot = items.length <= 1 ? 0 : idx / Math.max(1, items.length - 1);
                      const windowSpan = win.end - win.start;
                      const maxStart = Math.max(0, windowSpan - dur);
                      const start = win.start + slot * maxStart;
                      const widthPct = Math.max(8, (dur / TIMELINE_MONTHS) * 100);
                      const leftPct = (start / TIMELINE_MONTHS) * 100;
                      const isSelected = selectedId === uc.id;
                      const color = getDeptColor(uc.label || 'General');
                      const durLabel = formatDuration(dur);

                      return (
                        <li key={uc.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedId((prev) => (prev === uc.id ? null : uc.id))
                            }
                            className={`grid w-full grid-cols-1 items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors md:grid-cols-[280px_1fr] md:gap-4 ${
                              isSelected
                                ? 'border-bla-lime/40 bg-bla-lime/[0.04]'
                                : 'border-white/8 bg-white/[0.02] hover:border-white/15'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
                                  {uc.label || 'General'}
                                </span>
                              </div>
                              <p className="mt-1 truncate font-host text-[14px] font-medium text-white md:text-[15px]">
                                {uc.name}
                              </p>
                              <p className="mt-0.5 font-mono text-[11px] text-white/40">{durLabel}</p>
                            </div>

                            <div className="relative hidden h-9 md:block">
                              <div
                                className="absolute inset-y-1 rounded-md border px-2"
                                style={{
                                  left: `${leftPct}%`,
                                  width: `${widthPct}%`,
                                  minWidth: 48,
                                  backgroundColor: `${color}33`,
                                  borderColor: `${color}66`,
                                }}
                              />
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {selected && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0d0f12] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                {selected.label || 'General'} ·{' '}
                {PRIORITY_STATUS_META[normalizePriorityStatus(selected.priorityStatus)].label}
              </p>
              <h3 className="mt-1 font-host text-lg text-white">{selected.name}</h3>
            </div>
            <span className="shrink-0 font-mono text-[12px] text-bla-lime">
              {formatDuration(estimateMonths(selected))}
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-white/55">
            {selected.description || 'No description.'}
          </p>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-white/35">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Duration comes from Speed to build (workshop score). Many cases can run in parallel — load is
        not one single queue.
      </p>
    </div>
  );
}
