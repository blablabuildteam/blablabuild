'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  ArrowLeft,
  Filter,
  GripVertical,
  Info,
  Map,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  type DeliveryPartner,
  type PriorityStatus,
  type Scores,
  type UseCase,
  ALL_DELIVERY_PARTNERS,
  ALL_PRIORITY_STATUSES,
  DELIVERY_META,
  PRIORITY_STATUS_META,
  Q_META,
  ROADMAP_STATUSES,
  calcScore,
  getDeptColor,
  getQuadrant,
  normalizePriorityStatus,
  sortUseCasesByPriority,
  sortUseCasesByScore,
} from './types';
import { suggestionFor } from './deliverySuggestions';
import {
  ensureRanks,
  migrateLegacyStatuses,
  proposeRoadmap,
} from './roadmapProposal';

const IMPACT_HINT =
  'Business upside if this works well — hours saved, fewer errors, more revenue or margin. 1 = small improvement · 5 = big, material impact on the team or P&L. (Workshop score: Impact.)';

const SPEED_HINT =
  'How fast can we ship a useful first version? 1 = many months / heavy integrations · 5 = days or weeks (Slack helper, draft tool, local Claude skill).';

const DETAIL_SCORE_KEYS: { key: keyof Scores; label: string }[] = [
  { key: 'frequency', label: 'Frequency' },
  { key: 'aiSuitability', label: 'AI fit' },
  { key: 'risk', label: 'Safety' },
  { key: 'adoption', label: 'Adoption' },
];

interface Props {
  useCases: UseCase[];
  sessionId: string;
  onBack: () => void;
  onUpdate: (uc: UseCase) => void | Promise<void>;
  onReplaceAll: (cases: UseCase[]) => void;
}

function ScoreStepper({
  value,
  onChange,
  label,
  hint,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  hint?: string;
}) {
  const [showHint, setShowHint] = useState(false);

  return (
    <label className="relative flex min-w-[88px] flex-col gap-1.5">
      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
        {label}
        {hint && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowHint((v) => !v);
            }}
            className="grid h-4 w-4 place-items-center rounded-full border border-white/20 text-white/45 hover:border-white/40 hover:text-white/80"
            aria-label={`Info: ${label}`}
          >
            <Info className="h-2.5 w-2.5" />
          </button>
        )}
      </span>
      {hint && showHint && (
        <div className="absolute left-0 top-6 z-20 w-64 rounded-xl border border-white/15 bg-[#12141a] p-3 text-[12px] font-normal normal-case tracking-normal text-white/70 shadow-xl">
          {hint}
          <button
            type="button"
            className="mt-2 block text-[11px] text-bla-lime/80"
            onClick={(e) => {
              e.preventDefault();
              setShowHint(false);
            }}
          >
            Got it
          </button>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onChange(Math.max(1, value - 1));
          }}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
        >
          −
        </button>
        <span className="w-7 text-center font-mono text-base text-white">{value}</span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onChange(Math.min(5, value + 1));
          }}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"
        >
          +
        </button>
      </div>
    </label>
  );
}

function PriorityRow({
  uc,
  rankDisplay,
  selected,
  onSelect,
  onUpdate,
}: {
  uc: UseCase;
  rankDisplay: number;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (uc: UseCase) => void;
}) {
  const controls = useDragControls();
  const status = normalizePriorityStatus(uc.priorityStatus);
  const statusMeta = PRIORITY_STATUS_META[status];
  const q = getQuadrant(uc);
  const total = calcScore(uc.scores);
  const partners = uc.deliveryPartners?.length ? uc.deliveryPartners : (['tbd'] as DeliveryPartner[]);

  const patchScores = (key: keyof Scores, value: number) => {
    onUpdate({ ...uc, scores: { ...uc.scores, [key]: value } });
  };

  const togglePartner = (partner: DeliveryPartner) => {
    const current = new Set(uc.deliveryPartners ?? []);
    if (current.has(partner)) current.delete(partner);
    else current.add(partner);
    if (partner !== 'tbd') current.delete('tbd');
    if (current.size === 0) current.add('tbd');
    onUpdate({ ...uc, deliveryPartners: Array.from(current) });
  };

  return (
    <Reorder.Item
      value={uc}
      id={uc.id}
      dragListener={false}
      dragControls={controls}
      className={`rounded-2xl border bg-[#0d0f12] ${
        selected ? 'border-bla-lime/40' : 'border-white/10'
      } ${status === 'kill' ? 'opacity-55' : ''}`}
    >
      <div className="flex gap-4 p-4 md:gap-5 md:p-5">
        <div className="flex shrink-0 flex-col items-center gap-2 pt-0.5">
          <button
            type="button"
            onPointerDown={(e) => controls.start(e)}
            className="grid h-10 w-10 cursor-grab place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45 active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="font-mono text-[12px] text-white/40">#{rankDisplay}</span>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          {/* Title band */}
          <button type="button" onClick={onSelect} className="w-full text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: getDeptColor(uc.label || 'General') }}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
                {uc.label || 'General'}
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]"
                style={{ color: Q_META[q].dot, backgroundColor: `${Q_META[q].dot}22` }}
              >
                {Q_META[q].label}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${statusMeta.border} ${statusMeta.bg} ${statusMeta.color}`}
              >
                {statusMeta.label}
              </span>
            </div>
            <p className="mt-2 font-host text-lg font-medium leading-snug text-white md:text-xl">
              {uc.name}
            </p>
            <p className="mt-1.5 text-[13px] text-white/40">
              Owner: {uc.owner?.trim() ? uc.owner : '—'}
            </p>
          </button>

          {/* Metrics + roadmap */}
          <div className="grid gap-4 border-t border-white/8 pt-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-wrap items-end gap-4 sm:gap-5">
              <ScoreStepper
                label="Impact"
                hint={IMPACT_HINT}
                value={uc.scores.businessImpact}
                onChange={(n) => patchScores('businessImpact', n)}
              />
              <ScoreStepper
                label="Speed to build"
                hint={SPEED_HINT}
                value={uc.scores.implementation}
                onChange={(n) => patchScores('implementation', n)}
              />
              <div className="flex min-w-[56px] flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Total</span>
                <span className="font-mono text-base text-bla-lime">{total.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Roadmap
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_PRIORITY_STATUSES.map((s) => {
                    const meta = PRIORITY_STATUS_META[s];
                    const active = status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        title={meta.hint}
                        onClick={() => onUpdate({ ...uc, priorityStatus: s })}
                        className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                          active
                            ? `${meta.border} ${meta.bg} ${meta.color}`
                            : 'border-white/10 text-white/35 hover:text-white/65'
                        }`}
                      >
                        {meta.short}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Delivery
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DELIVERY_PARTNERS.map((p) => {
                    const meta = DELIVERY_META[p];
                    const active = partners.includes(p);
                    if (p === 'tbd' && !active) return null;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePartner(p)}
                        className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
                          active
                            ? `${meta.border} ${meta.bg} ${meta.color}`
                            : 'border-white/10 text-white/30 hover:text-white/55'
                        }`}
                      >
                        {meta.short}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function PrioritizeView({
  useCases,
  sessionId,
  onBack,
  onUpdate,
  onReplaceAll,
}: Props) {
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | PriorityStatus>('now');
  const [filterDelivery, setFilterDelivery] = useState<'all' | DeliveryPartner>('all');
  const [hideKill, setHideKill] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const initDone = useRef(false);

  const depts = useMemo(() => {
    const set = new Set<string>();
    useCases.forEach((uc) => set.add(uc.label || 'General'));
    return Array.from(set).sort();
  }, [useCases]);

  const ordered = useMemo(() => sortUseCasesByPriority(useCases), [useCases]);

  const filtered = useMemo(() => {
    return ordered.filter((uc) => {
      if (filterDept !== 'all' && (uc.label || 'General') !== filterDept) return false;
      const status = normalizePriorityStatus(uc.priorityStatus);
      if (hideKill && status === 'kill') return false;
      if (filterStatus !== 'all' && status !== filterStatus) return false;
      if (filterDelivery !== 'all') {
        const partners = uc.deliveryPartners?.length ? uc.deliveryPartners : ['tbd'];
        if (!partners.includes(filterDelivery)) return false;
      }
      return true;
    });
  }, [ordered, filterDept, filterStatus, filterDelivery, hideKill]);

  const counts = useMemo(() => {
    const c: Record<PriorityStatus, number> = {
      now: 0,
      near: 0,
      next: 0,
      later: 0,
      kill: 0,
    };
    useCases.forEach((uc) => {
      c[normalizePriorityStatus(uc.priorityStatus)] += 1;
    });
    return c;
  }, [useCases]);

  const selected = selectedId ? useCases.find((uc) => uc.id === selectedId) : null;
  const selectedSuggestion = selected ? suggestionFor(selected.id) : null;

  const persistBatch = useCallback(
    async (next: UseCase[]) => {
      if (next.length === 0) return;
      onReplaceAll(next);
      setSaving(true);
      try {
        await fetch(`/api/matrix-sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'batch',
            items: next.map((uc) => ({
              id: uc.id,
              priorityRank: uc.priorityRank,
              priorityStatus: uc.priorityStatus,
              deliveryPartners: uc.deliveryPartners,
              owner: uc.owner,
              scores: uc.scores,
            })),
          }),
        });
      } finally {
        setSaving(false);
      }
    },
    [onReplaceAll, sessionId]
  );

  const persistReorder = useCallback(
    async (next: UseCase[]) => {
      if (next.length === 0) return;
      const ranked = next.map((uc, i) => ({ ...uc, priorityRank: i }));
      onReplaceAll(ranked);
      setSaving(true);
      try {
        await fetch(`/api/matrix-sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reorder',
            items: ranked.map((uc) => ({ id: uc.id, priorityRank: uc.priorityRank })),
          }),
        });
      } finally {
        setSaving(false);
      }
    },
    [onReplaceAll, sessionId]
  );

  // First open: migrate legacy backlog → later, fill delivery/ranks; propose roadmap if still all "later"/backlog-ish
  useEffect(() => {
    if (initDone.current || useCases.length === 0) return;
    initDone.current = true;

    const hasLegacyBacklog = useCases.some((uc) => (uc.priorityStatus as string | undefined) === 'backlog');
    const needsDelivery = useCases.some((uc) => !uc.deliveryPartners?.length);
    const needsRank = useCases.some((uc) => typeof uc.priorityRank !== 'number');
    const onlyLaterOrMissing = useCases.every((uc) => {
      const s = uc.priorityStatus as string | undefined;
      return !s || s === 'backlog' || s === 'later' || s === 'kill';
    });
    const hasRoadmapSpread = useCases.some((uc) => {
      const s = normalizePriorityStatus(uc.priorityStatus);
      return s === 'now' || s === 'near' || s === 'next';
    });

    if (hasLegacyBacklog || needsDelivery || needsRank || !hasRoadmapSpread) {
      if (!hasRoadmapSpread || onlyLaterOrMissing) {
        void persistBatch(proposeRoadmap(useCases));
      } else {
        const migrated = ensureRanks(migrateLegacyStatuses(useCases));
        void persistBatch(migrated);
      }
    }
  }, [useCases, persistBatch]);

  const applyRoadmapProposal = () => {
    void persistBatch(proposeRoadmap(useCases));
  };

  const applyDeliveryOnly = () => {
    const next = sortUseCasesByPriority(useCases).map((uc) => {
      const sug = suggestionFor(uc.id);
      return {
        ...uc,
        priorityStatus: normalizePriorityStatus(
          sug.priorityStatus === 'kill' ? 'kill' : uc.priorityStatus
        ),
        deliveryPartners: sug.deliveryPartners,
      };
    });
    void persistBatch(next);
  };

  const resetRanksByScore = () => {
    const next = sortUseCasesByScore(useCases).map((uc, i) => ({ ...uc, priorityRank: i }));
    void persistReorder(next);
  };

  const handleReorderFiltered = (newFiltered: UseCase[]) => {
    const filteredIds = new Set(filtered.map((uc) => uc.id));
    const full = sortUseCasesByPriority(useCases);
    let fi = 0;
    const merged = full.map((uc) => {
      if (!filteredIds.has(uc.id)) return uc;
      return newFiltered[fi++];
    });
    void persistReorder(merged);
  };

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
            § prioritize · internal
          </p>
          <h2 className="mt-1 font-host text-2xl font-light text-white md:text-3xl">Prioritize</h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/55">
            Go through cases calmly: rank, set{' '}
            <span className="text-white/75">Now → Near → Next → Later</span>, assign delivery. When
            the shortlist feels right, open the <span className="text-white/75">Roadmap</span> tab for
            the calendar view.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ROADMAP_STATUSES.map((s) => {
            const meta = PRIORITY_STATUS_META[s];
            return (
              <div
                key={s}
                className={`min-w-[64px] rounded-xl border px-3 py-2 text-center ${meta.border} ${meta.bg}`}
              >
                <p className={`font-mono text-[9px] uppercase tracking-[0.12em] ${meta.color}`}>{meta.short}</p>
                <p className={`font-host text-lg ${meta.color}`}>{counts[s]}</p>
              </div>
            );
          })}
          <div className="min-w-[64px] rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-red-300">Kill</p>
            <p className="font-host text-lg text-red-300">{counts.kill}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-white/35" />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#0d0f12] px-2.5 py-1.5 text-[12px] text-white/80"
        >
          <option value="all">All depts</option>
          {depts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | PriorityStatus)}
          className="rounded-lg border border-white/10 bg-[#0d0f12] px-2.5 py-1.5 text-[12px] text-white/80"
        >
          <option value="all">All horizons</option>
          {ALL_PRIORITY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PRIORITY_STATUS_META[s].label}
            </option>
          ))}
        </select>
        <select
          value={filterDelivery}
          onChange={(e) => setFilterDelivery(e.target.value as 'all' | DeliveryPartner)}
          className="rounded-lg border border-white/10 bg-[#0d0f12] px-2.5 py-1.5 text-[12px] text-white/80"
        >
          <option value="all">All delivery</option>
          {ALL_DELIVERY_PARTNERS.map((p) => (
            <option key={p} value={p}>
              {DELIVERY_META[p].label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setHideKill((v) => !v)}
          className={`rounded-lg border px-2.5 py-1.5 text-[12px] ${
            hideKill
              ? 'border-red-400/30 bg-red-400/10 text-red-300'
              : 'border-white/10 text-white/50 hover:text-white/80'
          }`}
        >
          {hideKill ? 'Kills hidden' : 'Show kills'}
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={applyRoadmapProposal}
          className="inline-flex items-center gap-1.5 rounded-lg border border-bla-lime/25 bg-bla-lime/10 px-3 py-1.5 text-[12px] text-bla-lime hover:bg-bla-lime/15"
        >
          <Map className="h-3.5 w-3.5" />
          Apply roadmap proposal
        </button>
        <button
          type="button"
          onClick={applyDeliveryOnly}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[12px] text-white/50 hover:text-white/80"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Re-apply delivery
        </button>
        <button
          type="button"
          onClick={resetRanksByScore}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[12px] text-white/50 hover:text-white/80"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Sort by score
        </button>
        {saving && <span className="font-mono text-[10px] text-white/35">Saving…</span>}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {useCases.length === 0 ? (
          <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-5 py-8 text-center">
            <p className="font-host text-base text-amber-200">No use cases loaded in this session.</p>
            <p className="mt-2 text-[13px] text-white/50">
              Join session code{' '}
              <span className="font-mono text-white/80">adsomnia-workshop</span>.
            </p>
            <a
              href="?s=adsomnia-workshop"
              className="mt-4 inline-flex rounded-full border border-bla-lime/30 bg-bla-lime/10 px-4 py-2 text-sm text-bla-lime"
            >
              Open adsomnia-workshop
            </a>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={filtered}
            onReorder={handleReorderFiltered}
            className="flex flex-col gap-3"
          >
            {filtered.length === 0 && (
              <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-white/40">
                No cases match these filters. ({useCases.length} total in session)
              </p>
            )}
            {filtered.map((uc) => {
              const rankDisplay = (uc.priorityRank ?? 0) + 1;
              return (
                <PriorityRow
                  key={uc.id}
                  uc={uc}
                  rankDisplay={rankDisplay}
                  selected={selectedId === uc.id}
                  onSelect={() => setSelectedId(uc.id === selectedId ? null : uc.id)}
                  onUpdate={onUpdate}
                />
              );
            })}
          </Reorder.Group>
        )}

        <aside className="xl:sticky xl:top-24 xl:self-start">
          {selected ? (
            <div className="rounded-2xl border border-white/10 bg-[#0d0f12] p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">Detail</p>
                  <h3 className="mt-1 font-host text-lg font-medium text-white">{selected.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/50 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-white/55">
                {selected.description || 'No description.'}
              </p>
              {selected.solution && (
                <div className="mt-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-bla-lime/60">Solution</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/60">{selected.solution}</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                {DETAIL_SCORE_KEYS.map(({ key, label }) => (
                  <ScoreStepper
                    key={key}
                    label={label}
                    value={selected.scores[key]}
                    onChange={(n) =>
                      onUpdate({
                        ...selected,
                        scores: { ...selected.scores, [key]: n },
                      })
                    }
                  />
                ))}
              </div>

              <label className="mt-4 block">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                  Owner (Adsomnia)
                </span>
                <input
                  value={selected.owner || ''}
                  onChange={(e) => onUpdate({ ...selected, owner: e.target.value })}
                  placeholder="Name at Adsomnia"
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/25"
                />
              </label>

              {selectedSuggestion?.note && (
                <div className="mt-4 rounded-xl border border-bla-lime/20 bg-bla-lime/[0.06] px-3 py-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-bla-lime/70">
                    Our suggestion
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/65">
                    {selectedSuggestion.note}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center text-[13px] text-white/35">
              Select a case for detail scores, owner, and our delivery note.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
