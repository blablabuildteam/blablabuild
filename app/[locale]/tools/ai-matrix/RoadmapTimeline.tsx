'use client';

import { useMemo } from 'react';
import {
  type PriorityStatus,
  type UseCase,
  PRIORITY_STATUS_META,
  ROADMAP_STATUSES,
  effortFromImplementation,
  getDeptColor,
  normalizePriorityStatus,
  sortUseCasesByPriority,
} from './types';

/** Rough duration from workshop Speed/Effort score (planning hint, not a quote). */
export function estimateWeeks(uc: UseCase): number {
  const effort = effortFromImplementation(uc.scores.implementation);
  // effort 1→1w, 2→2w, 3→3w, 4→5w, 5→8w
  const map = [0, 1, 2, 3, 5, 8];
  return map[Math.min(5, Math.max(1, effort))] ?? 3;
}

/** Horizon windows on a shared week axis (story pacing). */
export const HORIZON_WINDOW: Record<
  Exclude<PriorityStatus, 'kill'>,
  { start: number; end: number; label: string }
> = {
  now: { start: 0, end: 4, label: '0–4 wks' },
  near: { start: 4, end: 12, label: '4–12 wks' },
  next: { start: 12, end: 24, label: '12–24 wks' },
  later: { start: 24, end: 40, label: '24+ wks' },
};

const TIMELINE_END = 40;

interface Props {
  useCases: UseCase[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onFilterHorizon?: (status: PriorityStatus | 'all') => void;
  activeFilter?: PriorityStatus | 'all';
}

export default function RoadmapTimeline({
  useCases,
  selectedId,
  onSelect,
  onFilterHorizon,
  activeFilter = 'all',
}: Props) {
  const lanes = useMemo(() => {
    const ordered = sortUseCasesByPriority(useCases);
    return ROADMAP_STATUSES.map((horizon) => {
      const items = ordered.filter(
        (uc) => normalizePriorityStatus(uc.priorityStatus) === horizon
      );
      const weeks = items.reduce((sum, uc) => sum + estimateWeeks(uc), 0);
      return { horizon, items, weeks };
    });
  }, [useCases]);

  const totalActive = lanes.reduce((n, l) => n + l.items.length, 0);

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f12]">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bla-lime/70">
            § roadmap timeline
          </p>
          <h3 className="mt-1 font-host text-xl font-light text-white">When & how long</h3>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-white/45">
            Horizons on a week axis. Bar length ≈ effort from Speed score (1–8 wks). Parallel work
            possible — totals are load hints, not a single critical path.
          </p>
        </div>
        <p className="font-mono text-[11px] text-white/35">
          {totalActive} initiatives · axis {TIMELINE_END} wks
        </p>
      </div>

      {/* Week ruler */}
      <div className="relative border-b border-white/8 px-5 py-3">
        <div className="relative h-6">
          {[0, 4, 8, 12, 16, 20, 24, 32, 40].map((w) => (
            <div
              key={w}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${(w / TIMELINE_END) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <span className="font-mono text-[9px] text-white/35">w{w}</span>
              <span className="mt-1 h-2 w-px bg-white/15" />
            </div>
          ))}
        </div>
        <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-white/[0.04]">
          {ROADMAP_STATUSES.map((h) => {
            const win = HORIZON_WINDOW[h];
            const meta = PRIORITY_STATUS_META[h];
            const left = (win.start / TIMELINE_END) * 100;
            const width = ((win.end - win.start) / TIMELINE_END) * 100;
            return (
              <button
                key={h}
                type="button"
                title={`${meta.label} · ${win.label}`}
                onClick={() => onFilterHorizon?.(activeFilter === h ? 'all' : h)}
                className={`absolute inset-y-0 transition-opacity hover:opacity-100 ${
                  activeFilter !== 'all' && activeFilter !== h ? 'opacity-30' : 'opacity-80'
                } ${meta.bg}`}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="divide-y divide-white/6">
        {lanes.map(({ horizon, items, weeks }) => {
          const meta = PRIORITY_STATUS_META[horizon];
          const win = HORIZON_WINDOW[horizon];
          const dimmed = activeFilter !== 'all' && activeFilter !== horizon;

          return (
            <div
              key={horizon}
              className={`px-5 py-4 transition-opacity ${dimmed ? 'opacity-35' : ''}`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onFilterHorizon?.(activeFilter === horizon ? 'all' : horizon)}
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${meta.border} ${meta.bg} ${meta.color}`}
                  >
                    {meta.label}
                  </button>
                  <span className="font-mono text-[11px] text-white/35">{win.label}</span>
                  <span className="text-[12px] text-white/40">
                    {items.length} cases · ~{weeks}w load
                  </span>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="py-2 text-[13px] text-white/25">Nothing in this horizon yet.</p>
              ) : (
                <div className="relative space-y-1.5">
                  {/* horizon band background */}
                  <div
                    className="pointer-events-none absolute inset-y-0 rounded-lg opacity-40"
                    style={{
                      left: `${(win.start / TIMELINE_END) * 100}%`,
                      width: `${((win.end - win.start) / TIMELINE_END) * 100}%`,
                      background: `linear-gradient(90deg, transparent, ${
                        horizon === 'now'
                          ? 'rgba(206,255,0,0.06)'
                          : horizon === 'near'
                            ? 'rgba(34,211,238,0.06)'
                            : horizon === 'next'
                              ? 'rgba(56,189,248,0.05)'
                              : 'rgba(255,255,255,0.03)'
                      }, transparent)`,
                    }}
                  />
                  {items.map((uc, idx) => {
                    const dur = estimateWeeks(uc);
                    // Stack start within horizon window so bars don't all overlap at left edge
                    const slot = items.length <= 1 ? 0 : idx / Math.max(1, items.length - 1);
                    const windowSpan = win.end - win.start;
                    const maxStart = Math.max(0, windowSpan - dur);
                    const start = win.start + slot * maxStart;
                    const widthPct = Math.max(4, (dur / TIMELINE_END) * 100);
                    const leftPct = (start / TIMELINE_END) * 100;
                    const selected = selectedId === uc.id;
                    const color = getDeptColor(uc.label || 'General');

                    return (
                      <button
                        key={uc.id}
                        type="button"
                        onClick={() => onSelect(uc.id)}
                        className="group relative block h-9 w-full text-left"
                        title={`${uc.name} · ~${dur}w · ${uc.label || 'General'}`}
                      >
                        <span
                          className={`absolute top-0.5 flex h-8 items-center overflow-hidden rounded-md border px-2.5 transition-shadow ${
                            selected
                              ? 'border-bla-lime/50 shadow-[0_0_0_1px_rgba(206,255,0,0.25)]'
                              : 'border-white/10 group-hover:border-white/25'
                          }`}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            minWidth: 72,
                            backgroundColor: `${color}22`,
                            borderColor: selected ? undefined : `${color}55`,
                          }}
                        >
                          <span className="truncate font-host text-[12px] text-white/90">
                            {uc.name}
                          </span>
                          <span className="ml-auto shrink-0 pl-2 font-mono text-[10px] text-white/45">
                            {dur}w
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
