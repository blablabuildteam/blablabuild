'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import {
  type PriorityStatus,
  type UseCase,
  PRIORITY_STATUS_META,
  ROADMAP_STATUSES,
  calcScore,
  getDeptColor,
  normalizePriorityStatus,
  sortUseCasesByScore,
} from './types';
import {
  ensureRanks,
  migrateLegacyStatuses,
  proposeRoadmap,
} from './roadmapProposal';
import {
  PROJECT_CLUSTERS,
  projectAccent,
  resolveProjectHorizon,
  unclusteredCaseIds,
} from './projectClusters';
import PrioritizePlaybook from './PrioritizePlaybook';

export type CaseInterest = 'yes' | 'maybe' | 'no';

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

function CaseRow({
  uc,
  onUpdate,
}: {
  uc: UseCase;
  onUpdate: (uc: UseCase) => void;
}) {
  const interest = getInterest(uc);
  const total = calcScore(uc.scores);

  const setInterest = (next: CaseInterest) => {
    onUpdate({
      ...uc,
      interest: next,
      priorityStatus: next === 'no' ? 'kill' : normalizePriorityStatus(uc.priorityStatus) === 'kill' ? 'later' : uc.priorityStatus,
    });
  };

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:justify-between ${
        interest === 'no'
          ? 'border-white/8 bg-white/[0.015] opacity-50'
          : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: getDeptColor(uc.label || 'General') }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
            {uc.label || 'General'}
          </span>
          <span className="font-mono text-[10px] text-white/30">score {total.toFixed(1)}</span>
        </div>
        <p className="mt-1 font-host text-[14px] font-medium text-white">{uc.name}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        {(
          [
            { id: 'yes' as const, label: 'Yes', cls: 'border-bla-lime/35 bg-bla-lime/10 text-bla-lime' },
            { id: 'maybe' as const, label: 'Maybe', cls: 'border-amber-400/35 bg-amber-400/10 text-amber-300' },
            { id: 'no' as const, label: 'No', cls: 'border-red-400/35 bg-red-400/10 text-red-300' },
          ]
        ).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setInterest(opt.id)}
            className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${
              interest === opt.id ? opt.cls : 'border-white/10 text-white/35 hover:text-white/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectBlock({
  projectId,
  name,
  summary,
  rationale,
  members,
  expanded,
  onToggle,
  onUpdate,
  onSetHorizon,
}: {
  projectId: string;
  name: string;
  summary: string;
  rationale: string;
  members: UseCase[];
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (uc: UseCase) => void;
  onSetHorizon: (status: PriorityStatus) => void;
}) {
  const accent = projectAccent(projectId);
  const horizon = resolveProjectHorizon(
    { id: projectId, name, summary, rationale, caseIds: members.map((m) => m.id) },
    members
  );
  const hMeta = PRIORITY_STATUS_META[horizon];
  const yes = members.filter((m) => getInterest(m) === 'yes').length;
  const maybe = members.filter((m) => getInterest(m) === 'maybe').length;
  const no = members.filter((m) => getInterest(m) === 'no').length;

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
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-host text-[17px] font-medium text-white md:text-lg">{name}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${hMeta.border} ${hMeta.bg} ${hMeta.color}`}
            >
              {hMeta.short}
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-white/50">{summary}</p>
          <p className="mt-2 font-mono text-[11px] text-white/35">
            {members.length} cases · yes {yes} · maybe {maybe} · no {no}
          </p>
        </div>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-white/8 px-4 pb-4 pt-3 md:px-5">
          <p className="text-[12px] leading-relaxed text-white/40">
            <span className="text-white/55">Why together:</span> {rationale}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
              Project horizon
            </span>
            {ROADMAP_STATUSES.map((s) => {
              const meta = PRIORITY_STATUS_META[s];
              const active = horizon === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSetHorizon(s)}
                  className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${
                    active
                      ? `${meta.border} ${meta.bg} ${meta.color}`
                      : 'border-white/10 text-white/35 hover:text-white/60'
                  }`}
                >
                  {meta.short}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-[13px] text-white/35">
                Alle cases hier zijn No (of verborgen). Zet “Show No cases” aan om ze te zien.
              </p>
            ) : (
              members.map((uc) => <CaseRow key={uc.id} uc={uc} onUpdate={onUpdate} />)
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
  const [expandedId, setExpandedId] = useState<string | null>(PROJECT_CLUSTERS[0]?.id ?? null);
  const [hideNo, setHideNo] = useState(true);
  const initDone = useRef(false);

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
    const hasLegacyBacklog = useCases.some((uc) => (uc.priorityStatus as string | undefined) === 'backlog');
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

  const projects = useMemo(() => {
    return PROJECT_CLUSTERS.filter((cluster) =>
      useCases.some((u) => cluster.caseIds.includes(u.id))
    );
  }, [useCases]);

  const unclusteredIds = useMemo(
    () => unclusteredCaseIds(useCases.map((u) => u.id)),
    [useCases]
  );

  const unclustered = useMemo(() => {
    let list = useCases.filter((u) => unclusteredIds.includes(u.id));
    if (hideNo) list = list.filter((u) => getInterest(u) !== 'no');
    return sortUseCasesByScore(list);
  }, [useCases, hideNo, unclusteredIds]);

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
          Eerst use cases: <span className="text-white/80">Yes / Maybe / No</span>. Daarna projecten
          bevestigen. Pas daarna Now-shortlist met Sietse.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
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
        </div>
      </div>

      <PrioritizePlaybook sessionId={sessionId} useCases={useCases} />

      <div className="mt-2 mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
          Projects · open to triage cases
        </p>
      </div>

      <div className="space-y-3">
        {projects.map((cluster) => {
          const allMembers = useCases.filter((u) => cluster.caseIds.includes(u.id));
          const visible = hideNo
            ? allMembers.filter((u) => getInterest(u) !== 'no')
            : allMembers;
          return (
            <ProjectBlock
              key={cluster.id}
              projectId={cluster.id}
              name={cluster.name}
              summary={cluster.summary}
              rationale={cluster.rationale}
              members={sortMembers(visible)}
              expanded={expandedId === cluster.id}
              onToggle={() => setExpandedId((id) => (id === cluster.id ? null : cluster.id))}
              onUpdate={onUpdate}
              onSetHorizon={(status) => setProjectHorizon(cluster.caseIds, status)}
            />
          );
        })}

        {unclusteredIds.length > 0 && (
          <ProjectBlock
            projectId="unclustered"
            name="Unclustered"
            summary="Cases zonder projectbucket — triage of later toewijzen."
            rationale="Nog geen cluster; Yes/Maybe hier houden tot je weet waar ze horen."
            members={unclustered}
            expanded={expandedId === 'unclustered'}
            onToggle={() => setExpandedId((id) => (id === 'unclustered' ? null : 'unclustered'))}
            onUpdate={onUpdate}
            onSetHorizon={(status) => setProjectHorizon(unclusteredIds, status)}
          />
        )}
      </div>

      <p className="mt-6 text-[12px] text-white/30">
        Open een project → Yes / Maybe / No per case → daarna Keep / Split / Park in de playbook.
      </p>
    </div>
  );
}
