'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import {
  type PriorityStatus,
  type UseCase,
  PRIORITY_STATUS_META,
  ROADMAP_STATUSES,
  SCORE_DIMENSIONS,
  calcScore,
  getDeptColor,
  hasV2CopyChange,
  normalizePriorityStatus,
  sortUseCasesByScore,
  workshopDescription,
  workshopName,
} from './types';
import {
  ensureRanks,
  migrateLegacyStatuses,
  proposeRoadmap,
} from './roadmapProposal';
import {
  projectAccent,
  resolveProjectHorizon,
  type ProjectCluster,
} from './projectClusters';
import {
  createProject,
  mergeProjectInto,
  moveCase,
  resolveClusters,
  unclusteredIds,
  updateProjectFields,
} from './projectDraft';
import {
  loadPrioritizeMeta,
  savePrioritizeMeta,
  type PrioritizeMetaState,
} from './prioritizeMeta';
import PrioritizePlaybook from './PrioritizePlaybook';

export type CaseInterest = 'yes' | 'maybe' | 'no';
type Mode = 'triage' | 'grouping';

interface Props {
  useCases: UseCase[];
  sessionId: string;
  onBack: () => void;
  onUpdate: (uc: UseCase) => void | Promise<void>;
  onReplaceAll: (cases: UseCase[]) => void;
}

function getInterest(uc: UseCase): CaseInterest {
  if (uc.interest === 'yes' || uc.interest === 'maybe' || uc.interest === 'no') return uc.interest;
  if (normalizePriorityStatus(uc.priorityStatus) === 'kill') return 'no';
  return 'yes';
}

function deptsInCases(members: UseCase[]): string[] {
  const set = new Set<string>();
  members.forEach((m) => set.add(m.label || 'General'));
  return [...set].sort((a, b) => a.localeCompare(b));
}

function ScoreBreakdown({ uc }: { uc: UseCase }) {
  const [open, setOpen] = useState(false);
  const total = calcScore(uc.scores);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 hover:text-white/70"
      >
        score {total.toFixed(1)} / 5
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="normal-case tracking-normal text-white/25">how scored</span>
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
          <p className="text-[11px] leading-relaxed text-white/45">
            Workshop scores (1–5), weighted into one total. Same formula as the matrix.
          </p>
          {SCORE_DIMENSIONS.map((d) => {
            const raw = uc.scores[d.key] ?? 0;
            const contrib = raw * d.weight;
            return (
              <div
                key={d.key}
                className="flex items-baseline justify-between gap-3 font-mono text-[10px]"
              >
                <span className="min-w-0 text-white/55">
                  {d.label}{' '}
                  <span className="text-white/30">×{(d.weight * 100).toFixed(0)}%</span>
                </span>
                <span className="shrink-0 tabular-nums text-white/70">
                  {raw}/5 → {contrib.toFixed(2)}
                </span>
              </div>
            );
          })}
          <div className="flex justify-between border-t border-white/8 pt-1.5 font-mono text-[10px] text-bla-lime/80">
            <span>Total</span>
            <span className="tabular-nums">{total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CaseRow({
  uc,
  onUpdate,
  mode,
  clusters,
  currentProjectId,
  onMove,
}: {
  uc: UseCase;
  onUpdate: (uc: UseCase) => void;
  mode: Mode;
  clusters: ProjectCluster[];
  currentProjectId: string | 'unclustered';
  onMove: (caseId: string, target: string | 'unclustered') => void;
}) {
  const interest = getInterest(uc);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(uc.name);
  const [description, setDescription] = useState(uc.description || '');
  const v1Name = workshopName(uc);
  const v1Desc = workshopDescription(uc);
  const changed = hasV2CopyChange(uc);

  useEffect(() => {
    setName(uc.name);
    setDescription(uc.description || '');
  }, [uc.name, uc.description]);

  const setInterest = (next: CaseInterest) => {
    onUpdate({
      ...uc,
      interest: next,
      priorityStatus:
        next === 'no'
          ? 'kill'
          : normalizePriorityStatus(uc.priorityStatus) === 'kill'
            ? 'later'
            : uc.priorityStatus,
    });
  };

  const saveEdit = () => {
    const nextName = name.trim() || uc.name;
    const nextDesc = description.trim();
    if (nextName === uc.name && nextDesc === (uc.description || '')) {
      setEditing(false);
      return;
    }
    onUpdate({
      ...uc,
      name: nextName,
      description: nextDesc,
    });
    setEditing(false);
  };

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border px-3 py-3 ${
        interest === 'no'
          ? 'border-white/8 bg-white/[0.015] opacity-50'
          : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: getDeptColor(uc.label || 'General') }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
              Dept · {uc.label || 'General'}
            </span>
            {interest === 'no' && (
              <span className="rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-red-300">
                Killed · v2
              </span>
            )}
            {changed && (
              <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-sky-300">
                Edited · v2
              </span>
            )}
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
                v2 working copy — matrix overview keeps workshop v1
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-2 text-[14px] text-white"
                placeholder="v2 title"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/15 bg-[#0a0b0e] px-3 py-2 text-[12px] text-white/80"
                placeholder="v2 description"
              />
              <div className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-[11px] text-white/40">
                <span className="font-mono uppercase tracking-[0.1em] text-white/30">v1 · </span>
                {v1Name}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-full border border-bla-lime/35 bg-bla-lime/10 px-3 py-1 text-[12px] text-bla-lime"
                >
                  Save v2
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName(uc.name);
                    setDescription(uc.description || '');
                    setEditing(false);
                  }}
                  className="rounded-full border border-white/10 px-3 py-1 text-[12px] text-white/45"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 font-host text-[14px] font-medium text-white">{uc.name}</p>
              {uc.description ? (
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/40">
                  {uc.description}
                </p>
              ) : null}
              <ScoreBreakdown uc={uc} />
              {changed && (
                <p className="mt-1.5 font-mono text-[10px] text-white/30">
                  Workshop v1: {v1Name}
                  {v1Desc && v1Desc !== uc.description
                    ? ` · ${v1Desc.slice(0, 80)}${v1Desc.length > 80 ? '…' : ''}`
                    : ''}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                {
                  id: 'yes' as const,
                  label: 'Yes',
                  cls: 'border-bla-lime/35 bg-bla-lime/10 text-bla-lime',
                },
                {
                  id: 'maybe' as const,
                  label: 'Maybe',
                  cls: 'border-amber-400/35 bg-amber-400/10 text-amber-300',
                },
                {
                  id: 'no' as const,
                  label: 'Kill',
                  cls: 'border-red-400/35 bg-red-400/10 text-red-300',
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setInterest(opt.id)}
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${
                  interest === opt.id
                    ? opt.cls
                    : 'border-white/10 text-white/35 hover:text-white/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 hover:text-white/70"
              >
                Edit
              </button>
            )}
          </div>

          {mode === 'grouping' && (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
                Move to project
              </span>
              <select
                value={currentProjectId}
                onChange={(e) =>
                  onMove(uc.id, e.target.value as string | 'unclustered')
                }
                className="max-w-[220px] rounded-lg border border-white/15 bg-[#0a0b0e] px-2 py-1.5 text-[12px] text-white/85"
              >
                <option value="unclustered">Unclustered</option>
                {clusters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectBlock({
  cluster,
  members,
  expanded,
  onToggle,
  onUpdate,
  onSetHorizon,
  mode,
  allClusters,
  onMove,
  onRename,
  onMergeInto,
}: {
  cluster: ProjectCluster;
  members: UseCase[];
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (uc: UseCase) => void;
  onSetHorizon: (status: PriorityStatus) => void;
  mode: Mode;
  allClusters: ProjectCluster[];
  onMove: (caseId: string, target: string | 'unclustered') => void;
  onRename: (name: string, summary: string) => void;
  onMergeInto: (intoId: string) => void;
}) {
  const accent = projectAccent(cluster.id);
  const horizon = resolveProjectHorizon(cluster, members);
  const hMeta = PRIORITY_STATUS_META[horizon];
  const yes = members.filter((m) => getInterest(m) === 'yes').length;
  const maybe = members.filter((m) => getInterest(m) === 'maybe').length;
  const no = members.filter((m) => getInterest(m) === 'no').length;
  const depts = deptsInCases(members);
  const [draftName, setDraftName] = useState(cluster.name);
  const [draftSummary, setDraftSummary] = useState(cluster.summary);

  useEffect(() => {
    setDraftName(cluster.name);
    setDraftSummary(cluster.summary);
  }, [cluster.name, cluster.summary]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        expanded ? 'border-white/20 bg-[#0d0f12]' : 'border-white/10 bg-[#0d0f12]/80'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left md:px-5"
      >
        <span className="mt-1 text-white/40">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/50">
              Project
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${hMeta.border} ${hMeta.bg} ${hMeta.color}`}
            >
              {hMeta.short}
            </span>
          </div>
          <h3 className="mt-1.5 font-host text-[17px] font-medium text-white md:text-lg">
            {cluster.name}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-white/50">{cluster.summary}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/30">
              Depts involved
            </span>
            {depts.length === 0 ? (
              <span className="font-mono text-[10px] text-white/25">—</span>
            ) : (
              depts.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white/55"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: getDeptColor(d) }}
                  />
                  {d}
                </span>
              ))
            )}
          </div>
          <p className="mt-2 font-mono text-[11px] text-white/35">
            {members.length} features · yes {yes} · maybe {maybe} · no {no}
            {depts.length > 1 ? ' · multi-dept' : ''}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-white/8 px-4 pb-4 pt-3 md:px-5">
          <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
              Why this is one project (not a department)
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/50">{cluster.rationale}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-white/35">
              Features keep their workshop department label. The project name is a delivery
              initiative (shared stack, owner, or outcome) — rename freely in Grouping if the
              label feels like “just a dept bucket”.
            </p>
          </div>

          {mode === 'grouping' && (
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                Edit project
              </p>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => {
                  if (draftName.trim() && draftName !== cluster.name) {
                    onRename(draftName.trim(), draftSummary);
                  }
                }}
                className="w-full rounded-lg border border-white/10 bg-[#0a0b0e] px-3 py-2 text-[14px] text-white"
                placeholder="Project name"
              />
              <textarea
                value={draftSummary}
                onChange={(e) => setDraftSummary(e.target.value)}
                onBlur={() => {
                  if (draftSummary !== cluster.summary) {
                    onRename(draftName.trim() || cluster.name, draftSummary);
                  }
                }}
                rows={2}
                className="w-full resize-none rounded-lg border border-white/10 bg-[#0a0b0e] px-3 py-2 text-[12px] text-white/80"
                placeholder="Short summary"
              />
              <label className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                  Merge into
                </span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onMergeInto(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="rounded-lg border border-white/15 bg-[#0a0b0e] px-2 py-1.5 text-[12px] text-white/85"
                >
                  <option value="" disabled>
                    Choose project…
                  </option>
                  {allClusters
                    .filter((c) => c.id !== cluster.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          )}

          {mode === 'triage' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                Project horizon
              </span>
              {ROADMAP_STATUSES.map((s) => {
                const m = PRIORITY_STATUS_META[s];
                const active = horizon === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSetHorizon(s)}
                    className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${
                      active
                        ? `${m.border} ${m.bg} ${m.color}`
                        : 'border-white/10 text-white/35 hover:text-white/60'
                    }`}
                  >
                    {m.short}
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-[13px] text-white/35">
                Geen cases hier. Verplaats cases in Grouping, of zet “Show No cases” aan.
              </p>
            ) : (
              members.map((uc) => (
                <CaseRow
                  key={uc.id}
                  uc={uc}
                  onUpdate={onUpdate}
                  mode={mode}
                  clusters={allClusters}
                  currentProjectId={cluster.id}
                  onMove={onMove}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrioritizeView({
  useCases,
  sessionId,
  onBack,
  onUpdate,
  onReplaceAll,
}: Props) {
  const [mode, setMode] = useState<Mode>('triage');
  const [meta, setMeta] = useState<PrioritizeMetaState>({});
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hideNo, setHideNo] = useState(true);
  const initDone = useRef(false);

  const clusters = useMemo(() => resolveClusters(meta.clusters), [meta.clusters]);
  const isCustomDraft = Boolean(meta.clusters && meta.clusters.length > 0);

  const persistMeta = useCallback(
    async (next: PrioritizeMetaState) => {
      setMeta(next);
      setSavingMeta(true);
      try {
        const saved = await savePrioritizeMeta(sessionId, next);
        setMeta(saved);
      } finally {
        setSavingMeta(false);
      }
    },
    [sessionId]
  );

  const persistClusters = useCallback(
    (nextClusters: ProjectCluster[]) => {
      void persistMeta({
        ...meta,
        clusters: nextClusters,
        clustersUpdatedAt: new Date().toISOString(),
      });
    },
    [meta, persistMeta]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadPrioritizeMeta(sessionId);
      if (cancelled) return;
      setMeta(loaded);
      setMetaLoaded(true);
      const resolved = resolveClusters(loaded.clusters);
      setExpandedId(resolved[0]?.id ?? 'unclustered');
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const persistBatch = useCallback(
    async (next: UseCase[]) => {
      if (next.length === 0) return;
      onReplaceAll(next);
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
              interest: uc.interest,
            })),
          }),
        });
      } catch {
        // local already updated
      }
    },
    [onReplaceAll, sessionId]
  );

  useEffect(() => {
    if (initDone.current || useCases.length === 0) return;
    initDone.current = true;
    const hasLegacyBacklog = useCases.some(
      (uc) => (uc.priorityStatus as string | undefined) === 'backlog'
    );
    const needsDelivery = useCases.some((uc) => !uc.deliveryPartners?.length);
    const needsRank = useCases.some((uc) => typeof uc.priorityRank !== 'number');
    const hasRoadmapSpread = useCases.some((uc) => {
      const s = normalizePriorityStatus(uc.priorityStatus);
      return s === 'now' || s === 'near' || s === 'next';
    });
    if (hasLegacyBacklog || needsDelivery || needsRank || !hasRoadmapSpread) {
      if (!hasRoadmapSpread) void persistBatch(proposeRoadmap(useCases));
      else void persistBatch(ensureRanks(migrateLegacyStatuses(useCases)));
    }
  }, [useCases, persistBatch]);

  const visibleProjects = useMemo(() => {
    return clusters.filter((cluster) => useCases.some((u) => cluster.caseIds.includes(u.id)));
  }, [clusters, useCases]);

  const orphanIds = useMemo(
    () => unclusteredIds(clusters, useCases.map((u) => u.id)),
    [clusters, useCases]
  );

  const unclustered = useMemo(() => {
    let list = useCases.filter((u) => orphanIds.includes(u.id));
    if (hideNo) list = list.filter((u) => getInterest(u) !== 'no');
    return sortUseCasesByScore(list);
  }, [useCases, hideNo, orphanIds]);

  const sortMembers = (list: UseCase[]) =>
    [...list].sort((a, b) => {
      const order = { yes: 0, maybe: 1, no: 2 };
      const d = order[getInterest(a)] - order[getInterest(b)];
      return d !== 0 ? d : calcScore(b.scores) - calcScore(a.scores);
    });

  const stats = useMemo(() => {
    let yes = 0;
    let maybe = 0;
    let no = 0;
    useCases.forEach((u) => {
      const i = getInterest(u);
      if (i === 'yes') yes++;
      else if (i === 'maybe') maybe++;
      else no++;
    });
    return { yes, maybe, no };
  }, [useCases]);

  const setProjectHorizon = (caseIds: string[], status: PriorityStatus) => {
    const next = useCases.map((uc) => {
      if (!caseIds.includes(uc.id)) return uc;
      if (getInterest(uc) === 'no') return uc;
      return { ...uc, priorityStatus: status };
    });
    void persistBatch(next);
  };

  const handleMove = (caseId: string, target: string | 'unclustered') => {
    persistClusters(moveCase(clusters, caseId, target));
  };

  if (!metaLoaded) {
    return (
      <div className="mx-auto w-full max-w-[1100px] py-16 text-center text-white/40">
        Loading prioritize…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[15px] font-medium text-white/85 transition-colors hover:border-bla-lime/40 hover:bg-bla-lime/10 hover:text-bla-lime"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to matrix
      </button>

      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bla-lime/70">
          § prioritize · internal
        </p>
        <h2 className="mt-1 font-host text-2xl font-light text-white md:text-3xl">Prioritize</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/55">
          {mode === 'triage'
            ? 'v2 triage (Yes / Maybe / Kill). Workshop submissions stay frozen in Matrix as v1.'
            : 'v2 grouping draft: move, merge, rename, kill. Matrix overview keeps the original workshop cases untouched.'}
        </p>

        <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bla-lime/70">
              Project ≠ department
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/50">
              A <span className="text-white/75">project</span> is a delivery initiative (shared
              stack, owner, or outcome). Features keep their workshop{' '}
              <span className="text-white/75">dept</span> label — one project can mix depts. If a
              name feels like “just Email” or “just HR”, rename it in Grouping.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bla-lime/70">
              Score · workshop formula
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/50">
              Open <span className="text-white/75">how scored</span> on a feature: Impact 30%, How
              often 20%, Fit for AI 20%, Speed / Low risk / Adoption 10% each. Same as the matrix —
              scores don’t change when you regroup.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => setMode('triage')}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] ${
                mode === 'triage' ? 'bg-bla-lime/20 text-bla-lime' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Triage
            </button>
            <button
              type="button"
              onClick={() => setMode('grouping')}
              className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] ${
                mode === 'grouping'
                  ? 'bg-bla-lime/20 text-bla-lime'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Grouping
            </button>
          </div>

          {mode === 'triage' && (
            <>
              <span className="rounded-full border border-bla-lime/25 bg-bla-lime/10 px-3 py-1 font-mono text-[11px] text-bla-lime">
                Yes {stats.yes}
              </span>
              <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 font-mono text-[11px] text-amber-300">
                Maybe {stats.maybe}
              </span>
              <span className="rounded-full border border-red-400/25 bg-red-400/10 px-3 py-1 font-mono text-[11px] text-red-300">
                No {stats.no}
              </span>
              <button
                type="button"
                onClick={() => setHideNo((v) => !v)}
                className="rounded-full border border-white/10 px-3 py-1 text-[12px] text-white/45 hover:text-white/70"
              >
                {hideNo ? 'Show No cases' : 'Hide No cases'}
              </button>
            </>
          )}

          {mode === 'grouping' && (
            <>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-white/45">
                {isCustomDraft ? 'Draft saved' : 'Seed defaults'}
                {savingMeta ? ' · saving…' : ''}
              </span>
              <button
                type="button"
                onClick={() => {
                  const name = window.prompt('New project name');
                  if (!name?.trim()) return;
                  const next = createProject(clusters, name.trim());
                  persistClusters(next);
                  setExpandedId(next[next.length - 1]?.id ?? null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-bla-lime/30 bg-bla-lime/10 px-3 py-1 text-[12px] text-bla-lime hover:bg-bla-lime/15"
              >
                <Plus className="h-3.5 w-3.5" />
                New project
              </button>
              {isCustomDraft && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !window.confirm(
                        'Reset grouping to the original seed projects? Your draft moves will be lost.'
                      )
                    ) {
                      return;
                    }
                    void persistMeta({
                      ...meta,
                      clusters: null,
                      clustersUpdatedAt: new Date().toISOString(),
                    });
                  }}
                  className="rounded-full border border-white/10 px-3 py-1 text-[12px] text-white/40 hover:text-white/70"
                >
                  Reset to seed
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <PrioritizePlaybook
        useCases={useCases}
        clusters={clusters}
        meta={meta}
        saving={savingMeta}
        onMetaChange={setMeta}
        onPersist={(next) => void persistMeta(next)}
      />

      <div className="mt-2 mb-3 flex flex-wrap items-end justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
          {mode === 'triage'
            ? 'Delivery projects · open to triage features'
            : 'Delivery projects · rename / move / merge (not dept folders)'}
        </p>
        <p className="font-mono text-[10px] text-white/30">
          {visibleProjects.length} projects · {orphanIds.length} unclustered
        </p>
      </div>

      <div className="space-y-3">
        {(mode === 'grouping' ? clusters : visibleProjects).map((cluster) => {
          const allMembers = useCases.filter((u) => cluster.caseIds.includes(u.id));
          const visible =
            mode === 'triage' && hideNo
              ? allMembers.filter((u) => getInterest(u) !== 'no')
              : allMembers;
          return (
            <ProjectBlock
              key={cluster.id}
              cluster={cluster}
              members={sortMembers(visible)}
              expanded={expandedId === cluster.id}
              onToggle={() => setExpandedId((id) => (id === cluster.id ? null : cluster.id))}
              onUpdate={onUpdate}
              onSetHorizon={(status) => setProjectHorizon(cluster.caseIds, status)}
              mode={mode}
              allClusters={clusters}
              onMove={handleMove}
              onRename={(name, summary) =>
                persistClusters(updateProjectFields(clusters, cluster.id, { name, summary }))
              }
              onMergeInto={(intoId) => {
                if (
                  !window.confirm(
                    `Merge “${cluster.name}” into the selected project? Cases move over; this project is removed.`
                  )
                ) {
                  return;
                }
                persistClusters(mergeProjectInto(clusters, cluster.id, intoId));
                setExpandedId(intoId);
              }}
            />
          );
        })}

        {(orphanIds.length > 0 || mode === 'grouping') && (
          <div
            className={`overflow-hidden rounded-2xl border ${
              expandedId === 'unclustered'
                ? 'border-amber-400/25 bg-[#0d0f12]'
                : 'border-white/10 bg-[#0d0f12]/80'
            }`}
          >
            <button
              type="button"
              onClick={() =>
                setExpandedId((id) => (id === 'unclustered' ? null : 'unclustered'))
              }
              className="flex w-full items-start gap-3 px-4 py-4 text-left md:px-5"
            >
              <span className="mt-1 text-white/40">
                {expandedId === 'unclustered' ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400/80" />
              <div className="min-w-0 flex-1">
                <h3 className="font-host text-[17px] font-medium text-white md:text-lg">
                  Unclustered
                </h3>
                <p className="mt-1 text-[13px] text-white/50">
                  Cases without a project — assign in Grouping.
                </p>
                <p className="mt-2 font-mono text-[11px] text-white/35">
                  {unclustered.length} shown · {orphanIds.length} total
                </p>
              </div>
            </button>
            {expandedId === 'unclustered' && (
              <div className="space-y-2 border-t border-white/8 px-4 pb-4 pt-3 md:px-5">
                {unclustered.length === 0 ? (
                  <p className="text-[13px] text-white/35">All cases are in a project.</p>
                ) : (
                  unclustered.map((uc) => (
                    <CaseRow
                      key={uc.id}
                      uc={uc}
                      onUpdate={onUpdate}
                      mode={mode}
                      clusters={clusters}
                      currentProjectId="unclustered"
                      onMove={handleMove}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-[12px] text-white/30">
        Tip: Grouping eerst kloppend maken → Triage Yes/Maybe/No → playbook Keep/Split → Now
        shortlist.
      </p>
    </div>
  );
}
