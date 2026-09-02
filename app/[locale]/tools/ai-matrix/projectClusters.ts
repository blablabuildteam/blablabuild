import type { PriorityStatus } from './types';

/**
 * Proposed delivery projects for Adsomnia (not department folders).
 * Multiple use cases → one initiative (shared stack, owner, or outcome).
 * IDs match the live adsomnia-workshop session.
 */
export interface ProjectCluster {
  id: string;
  name: string;
  summary: string;
  /** Why these belong together as one delivery project */
  rationale: string;
  caseIds: string[];
  /** Suggested roadmap horizon for the project as a whole */
  suggestedHorizon?: PriorityStatus;
  primaryDelivery?: Array<
    'adsomnia' | 'blablabuild' | 'harlem-next' | 'bending-the-rules' | 'tbd'
  >;
}

/** Bump when seed titles/summaries change — refreshes draft copy while keeping caseIds. */
export const CLUSTERS_SEED_VERSION = 2;

export const PROJECT_CLUSTERS: ProjectCluster[] = [
  {
    id: 'email-ongage',
    name: 'Compliant Ongage send & craft',
    summary:
      'Ship reliable ESP ops (quota, servers, Slack alerts) plus compliant message/HTML craft in one Ongage stack.',
    rationale:
      'Shared Ongage/ESP surface — delivery reliability and message craft land as one initiative, not “Email dept”.',
    suggestedHorizon: 'now',
    primaryDelivery: ['adsomnia', 'bending-the-rules', 'blablabuild'],
    caseIds: [
      '6wwxlvke',
      'zbvbw4s5',
      '0zzpakqt',
      'hss1gydb',
      'yax6ipd9',
      'q8t5rvsh',
    ],
  },
  {
    id: 'affiliate-partner-ops',
    name: 'Partner activation & signal desk',
    summary:
      'Activate partners, digest offers/payouts, follow up, and capture partner knowledge — one Affil operating desk.',
    rationale:
      'Same partner communication loop (activation → digest → follow-up → CRM notes), not a dump of every Affil idea.',
    suggestedHorizon: 'near',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      's01zg1dt',
      '7oexv73t',
      'nq108m56',
      'aiqyvin4',
      '24lddyfa',
      'qa6wbwif',
      '07g9fjmq',
      '0pk6tzpv',
      'c2tybb1k',
      'nuftl8dc',
      '3z1pgtaa',
      '6xgc2yoh',
    ],
  },
  {
    id: 'media-buy-performance',
    name: 'MB launch → optimize → alert loop',
    summary:
      'Close the media-buying loop: launch, optimize networks/YP, brief creatives, report, and alert on the same trackers.',
    rationale:
      'One buyer workflow on shared trackers — launch through alert — not “everything Media Buying”.',
    suggestedHorizon: 'now',
    primaryDelivery: ['adsomnia', 'harlem-next', 'blablabuild'],
    caseIds: [
      'px4a19ax',
      'pfnizv8a',
      'bcutgw41',
      'cy7gzjyt',
      'ytfkqqwj',
      '1y16z6b7',
      'ldfa53nk',
      'mg6vhvhm',
      'jj12rux9',
      'id1vevde',
      '2e5qnofn',
    ],
  },
  {
    id: 'adops-tracker',
    name: 'Tracker hygiene & flow playbooks',
    summary:
      'Keep Voluum/ExAds flows clean: playbooks, CPM/TSD signals, uploads — Ad Ops control plane.',
    rationale:
      'Tracker hygiene + flow decisions share systems; fold “CPM in a doc” into alerting rather than a side quest.',
    suggestedHorizon: 'near',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      'zvnakelf',
      '52k9ejik',
      'fr8ri4kx',
      '0xnq9umd',
      '6nwxxw5m',
      '1gbuvwx4',
    ],
  },
  {
    id: 'bi-pricing-payouts',
    name: 'Payout & pricing intelligence',
    summary:
      'Data-quality triage, payout defaults/moves, and pricing experiments on Looker/DB truth.',
    rationale:
      'BI/Pricing owns commercial rules + data truth — one initiative for payout/pricing decisions.',
    suggestedHorizon: 'near',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      'bidqcl01',
      'pnsh385v',
      '5wq983os',
      'l32k9os0',
      'ge20ac29',
      'yr4x9ymq',
      'd49ghn33',
    ],
  },
  {
    id: 'finance-intel',
    name: 'Finance decision briefs',
    summary:
      'KYC dossiers, CoS scenarios, cashflow and P&L anomaly briefs on exports — not live banking rails.',
    rationale: 'Finance decision-support pack: same export/model surface, Claude-assisted briefs.',
    suggestedHorizon: 'next',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: ['i6n2lr3x', 'trvcvu9j', 'gbs3hxtt', 'mu3ctc3n'],
  },
  {
    id: 'hr-enablement',
    name: 'Claude HR enablement kit',
    summary:
      'Handbook Q&A (merge dups), CV screening, weekly goals, onboarding plans — Claude-first HR kit.',
    rationale:
      'Content/skills in Claude with HR as owner; handbook duplicates collapse into one agent.',
    suggestedHorizon: 'now',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      'yluy9f0i',
      '0x7wpyj2',
      'wt3mt2xj',
      'hus4qepz',
      'urvwa7mq',
      'xh4zjeeb',
      'f7x2rz3z',
    ],
  },
  {
    id: 'api-growth',
    name: 'API funnel & growth radar',
    summary:
      'See and grow the API funnel: monitor, insights, partner onboarding assist, traffic radar.',
    rationale: 'API commercial motion + funnel visibility as one growth initiative.',
    suggestedHorizon: 'next',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: ['3ylknke6', '80h0qak5', '3mtuqw72', 'uexqvvwe', '89rj00th'],
  },
  {
    id: 'crm-platform',
    name: 'Unified client CRM (program)',
    summary:
      'Central client database across systems — treat as a multi-phase program, not a sprint.',
    rationale: 'Big-rock integration; keep Later until phased slices and owner are clear.',
    suggestedHorizon: 'later',
    primaryDelivery: ['tbd', 'adsomnia', 'blablabuild'],
    caseIds: ['9qpxrbua'],
  },
  {
    id: 'pm-intake',
    name: 'Idea intake desk',
    summary: 'Triage new ideas and validate the idea box with lightweight Claude assists.',
    rationale: 'Same PM intake surface — keep small and Later unless it unblocks Now work.',
    suggestedHorizon: 'later',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: ['3qylko3t', 'vv8diyde'],
  },
  {
    id: 'meeting-productivity',
    name: 'Meeting notes & structure assist',
    summary:
      'Boost meeting effectiveness with notes/structure — confirm Gemini vs Claude before scaling.',
    rationale: 'Standalone enablement slice; stack choice is the open question.',
    suggestedHorizon: 'next',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: ['jtzx6rw7'],
  },
];

const CASE_TO_PROJECT = (() => {
  const map = new Map<string, ProjectCluster>();
  for (const p of PROJECT_CLUSTERS) {
    for (const id of p.caseIds) map.set(id, p);
  }
  return map;
})();

export function projectForCase(caseId: string): ProjectCluster | undefined {
  return CASE_TO_PROJECT.get(caseId);
}

export function unclusteredCaseIds(allIds: string[]): string[] {
  return allIds.filter((id) => !CASE_TO_PROJECT.has(id));
}

/** Stable accent per project for cards / timeline bars */
export const PROJECT_ACCENT: Record<string, string> = {
  'email-ongage': '#f97316',
  'affiliate-partner-ops': '#f472b6',
  'media-buy-performance': '#60a5fa',
  'adops-tracker': '#a3e635',
  'bi-pricing-payouts': '#a78bfa',
  'finance-intel': '#34d399',
  'hr-enablement': '#fbbf24',
  'api-growth': '#22d3ee',
  'crm-platform': '#94a3b8',
  'pm-intake': '#e879f9',
  'meeting-productivity': '#fb7185',
};

export function projectAccent(projectId: string): string {
  return PROJECT_ACCENT[projectId] || '#ceff00';
}

const HORIZON_RANK: Record<string, number> = {
  now: 0,
  near: 1,
  next: 2,
  later: 3,
  kill: 4,
};

/**
 * Project horizon = earliest non-kill member status, else suggestedHorizon.
 */
export function resolveProjectHorizon(
  cluster: ProjectCluster,
  cases: { id: string; priorityStatus?: string }[]
): Exclude<PriorityStatus, 'kill'> {
  const members = cases.filter(
    (c) => cluster.caseIds.includes(c.id) && c.priorityStatus !== 'kill'
  );
  if (members.length === 0) {
    const s = cluster.suggestedHorizon;
    return s && s !== 'kill' ? s : 'later';
  }
  let best: Exclude<PriorityStatus, 'kill'> = 'later';
  let bestRank = 99;
  for (const m of members) {
    const raw = m.priorityStatus === 'backlog' ? 'later' : m.priorityStatus || 'later';
    if (raw === 'kill') continue;
    const status = (['now', 'near', 'next', 'later'].includes(raw) ? raw : 'later') as Exclude<
      PriorityStatus,
      'kill'
    >;
    const r = HORIZON_RANK[status] ?? 3;
    if (r < bestRank) {
      bestRank = r;
      best = status;
    }
  }
  return best;
}
