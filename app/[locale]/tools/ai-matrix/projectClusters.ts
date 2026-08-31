import type { PriorityStatus } from './types';

/**
 * Proposed initiative / project buckets for Adsomnia.
 * Multiple use cases → one delivery project (shared stack, owner, or outcome).
 * IDs match the live adsomnia-workshop session.
 */
export interface ProjectCluster {
  id: string;
  name: string;
  summary: string;
  /** Why these belong together */
  rationale: string;
  caseIds: string[];
  /** Suggested roadmap horizon for the project as a whole */
  suggestedHorizon?: PriorityStatus;
  primaryDelivery?: Array<
    'adsomnia' | 'blablabuild' | 'harlem-next' | 'bending-the-rules' | 'tbd'
  >;
}

export const PROJECT_CLUSTERS: ProjectCluster[] = [
  {
    id: 'email-ongage',
    name: 'Email & Ongage operating system',
    summary: 'Message generation, HTML templates, ESP ops and delivery monitoring in one stack.',
    rationale:
      'All Ongage/Email craft + send-infrastructure. Shared ESP, same team, same compliance surface.',
    suggestedHorizon: 'now',
    primaryDelivery: ['adsomnia', 'bending-the-rules', 'blablabuild'],
    caseIds: [
      '6wwxlvke', // Compliant flirting variants
      'zbvbw4s5', // Creating Ongage messages
      '0zzpakqt', // Static HTML email page
      'hss1gydb', // Slack delivery issues
      'yax6ipd9', // Daily send quota
      'q8t5rvsh', // Server distribution
    ],
  },
  {
    id: 'affiliate-partner-ops',
    name: 'Affiliate partner ops & messaging',
    summary: 'Partner activation, digests, follow-ups, Telegram notes and payout pause comms.',
    rationale:
      'Same Affiliate workflow: communicate with partners, surface offer/payout signals, keep CRM knowledge.',
    suggestedHorizon: 'near',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      's01zg1dt', // Personalised activation copy
      '7oexv73t', // Morning reports
      'nq108m56', // Payout pause campaigns
      'aiqyvin4', // Weekly partner digest
      '24lddyfa', // Following up new offers
      'qa6wbwif', // Telegram Notetaker
      '07g9fjmq', // Partner Knowledge CRM
      '0pk6tzpv', // HarlemNext sync digest
      'c2tybb1k', // TG LP performance alerts
      'nuftl8dc', // Automatic PO setting
      '3z1pgtaa', // Payment cycle updates
      '6xgc2yoh', // Affiliate lead generator
    ],
  },
  {
    id: 'media-buy-performance',
    name: 'Media Buying performance loop',
    summary: 'Optimize, brief creatives, report and alert across trackers / networks / YP.',
    rationale:
      'One MB loop: launch → optimize → creative → report → alert. Shared trackers and buyer workflow.',
    suggestedHorizon: 'now',
    primaryDelivery: ['adsomnia', 'harlem-next', 'blablabuild'],
    caseIds: [
      'px4a19ax', // Campaign Management / optimization across trackers (name may vary)
      'pfnizv8a', // Ad network auto optimization
      'bcutgw41', // Creative strategy brief pack
      'cy7gzjyt', // Campaign launch via Claude
      'ytfkqqwj', // MB Performance Reporting
      '1y16z6b7', // Performance alarming
      'ldfa53nk', // Financial MB Reporting
      'mg6vhvhm', // Autofill daily stats
      'jj12rux9', // Offer auto upload trackers
      'id1vevde', // YP auto-optimization
      '2e5qnofn', // YP alert system
    ],
  },
  {
    id: 'adops-tracker',
    name: 'Ad Ops tracker & flow control',
    summary: 'Flow playbooks, CPM/TSD signals, Voluum/ExAds uploads.',
    rationale:
      'Ad Ops owns tracker hygiene and flow decisions; alerting + upload tools share the same systems.',
    suggestedHorizon: 'near',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      'zvnakelf', // Flow optimization playbook
      '52k9ejik', // CPM performance drops alerting
      'fr8ri4kx', // TSD optimization
      '0xnq9umd', // Upload offers Voluum
      '6nwxxw5m', // ExAds banners
      '1gbuvwx4', // Adding CPMs in doc (merge/kill into alerting)
    ],
  },
  {
    id: 'bi-pricing-payouts',
    name: 'BI, pricing & payout intelligence',
    summary: 'Data quality, payout automation, price experiments and offline SQL assist.',
    rationale:
      'BI/Pricing owns data truth and commercial rules; payouts and pricing sims share Looker/DB context.',
    suggestedHorizon: 'near',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      'bidqcl01', // Data quality investigation in Claude (Now)
      'pnsh385v', // Text-to-SQL draft from schema docs (offline)
      '5wq983os', // Data Quality Triage Agent
      'l32k9os0', // Payout defaults
      'ge20ac29', // Payout increases/decreases
      'yr4x9ymq', // Price experimentation
      'd49ghn33', // Pricing simulation sandbox
    ],
  },
  {
    id: 'finance-intel',
    name: 'Finance intelligence pack',
    summary: 'KYC dossiers, CoS scenarios, cashflow and P&L anomaly briefs.',
    rationale: 'Finance decision-support on exports/models — not live banking rails in v1.',
    suggestedHorizon: 'next',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      'i6n2lr3x', // KYC dossier
      'trvcvu9j', // business modelling / CoS modeller
      'gbs3hxtt', // cashflow forecasting
      'mu3ctc3n', // P&L anomaly brief
    ],
  },
  {
    id: 'hr-enablement',
    name: 'HR enablement (Claude-first)',
    summary: 'Recruitment screening, handbook Q&A, weekly goals, onboarding plans.',
    rationale: 'HR content/skills in Claude; merge handbook duplicates into one agent.',
    suggestedHorizon: 'now',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      'yluy9f0i', // CV screening / Recruitment
      '0x7wpyj2', // Weekly HR checks/goals
      'wt3mt2xj', // Handbook Q&A
      'hus4qepz', // Employee handbook dup
      'urvwa7mq', // HR handbook dup
      'xh4zjeeb', // Onboarding personalization
      'f7x2rz3z', // Workflow integration
    ],
  },
  {
    id: 'api-growth',
    name: 'API growth & funnel monitoring',
    summary: 'Funnel monitor, growth insights, partner onboarding bot, traffic radar.',
    rationale: 'API commercial motion + technical funnel visibility.',
    suggestedHorizon: 'next',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      '3ylknke6', // API Funnel Monitor
      '80h0qak5', // API Growth insights
      '3mtuqw72', // Onboarding bot API partners
      'uexqvvwe', // Traffic Start/Scale Radar
      '89rj00th', // Automating adding offers
    ],
  },
  {
    id: 'crm-platform',
    name: 'Client CRM platform (big rock)',
    summary: 'Central client database pulling multiple systems — treat as program, not a sprint.',
    rationale: 'Multi-system integration; keep as later/program with phased slices.',
    suggestedHorizon: 'later',
    primaryDelivery: ['tbd', 'adsomnia', 'blablabuild'],
    caseIds: ['9qpxrbua'], // Central CRM
  },
  {
    id: 'pm-intake',
    name: 'Idea intake & validation',
    summary: 'PM intake triage and idea-box validation assist.',
    rationale: 'Same PM process surface; lightweight Claude assists.',
    suggestedHorizon: 'later',
    primaryDelivery: ['adsomnia', 'blablabuild'],
    caseIds: [
      '3qylko3t', // Idea Intake
      'vv8diyde', // Idea Box validation
    ],
  },
  {
    id: 'meeting-productivity',
    name: 'Meeting productivity',
    summary: 'Meeting effectiveness booster (notes / structure).',
    rationale: 'Standalone enablement; confirm stack (Gemini vs Claude) before bundling.',
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
