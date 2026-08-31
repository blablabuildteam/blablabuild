export type QuadrantKey = 'quick' | 'strategic' | 'low' | 'later';
export type ClaudeFit = 'good' | 'stretch' | 'blocked';
export type ReviewStatus = 'pending' | 'reviewed' | 'needs-split' | 'deferred';
export type PriorityStatus = 'now' | 'near' | 'next' | 'later' | 'kill';

export function normalizePriorityStatus(
  status?: string | null
): PriorityStatus {
  if (status === 'backlog') return 'later';
  if (
    status === 'now' ||
    status === 'near' ||
    status === 'next' ||
    status === 'later' ||
    status === 'kill'
  ) {
    return status;
  }
  return 'later';
}
export type DeliveryPartner =
  | 'adsomnia'
  | 'blablabuild'
  | 'harlem-next'
  | 'bending-the-rules'
  | 'tbd';

export interface Scores {
  businessImpact: number;
  frequency: number;
  aiSuitability: number;
  implementation: number;
  risk: number;
  adoption: number;
}

export interface KnockoutAnswers {
  recurring: boolean | null;
  costly: boolean | null;
  dataAvailable: boolean | null;
  standardized: boolean | null;
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  addedBy?: string;
  knockout: KnockoutAnswers;
  scores: Scores;
  label?: string;
  solution?: string;
  owner?: string;
  isWinner?: boolean;
  presented?: boolean;
  buildInClaudeCode?: boolean;
  claudeFit?: ClaudeFit;
  claudeFitReason?: string;
  reviewNotes?: string;
  reviewStatus?: ReviewStatus;
  howToGuide?: string;
  definitionOfDone?: string;
  claudeReviewedByBlaBlaBuild?: boolean;
  /** Manual backlog order — lower = higher priority. Drag source of truth. */
  priorityRank?: number;
  priorityStatus?: PriorityStatus;
  /** Who delivers / builds (multi). */
  deliveryPartners?: DeliveryPartner[];
  originalInput?: {
    name?: string;
    description?: string;
    solution?: string;
    label?: string;
    knockout?: KnockoutAnswers;
    scores?: Scores;
    savedAt?: string;
  };
}

export const PRIORITY_STATUS_META: Record<
  PriorityStatus,
  { label: string; short: string; color: string; bg: string; border: string; hint: string }
> = {
  now: {
    label: 'Now',
    short: 'Now',
    color: 'text-bla-lime',
    bg: 'bg-bla-lime/10',
    border: 'border-bla-lime/35',
    hint: 'Start this horizon',
  },
  near: {
    label: 'Near',
    short: 'Near',
    color: 'text-cyan-300',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    hint: 'Right after Now',
  },
  next: {
    label: 'Next',
    short: 'Next',
    color: 'text-sky-300',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/30',
    hint: 'Following wave',
  },
  later: {
    label: 'Later',
    short: 'Later',
    color: 'text-white/55',
    bg: 'bg-white/5',
    border: 'border-white/15',
    hint: 'Parked / later horizon',
  },
  kill: {
    label: 'Kill',
    short: 'Kill',
    color: 'text-red-300',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    hint: 'Drop or merge',
  },
};

/** Roadmap stages only (no Kill) — for filters / counts */
export const ROADMAP_STATUSES: PriorityStatus[] = ['now', 'near', 'next', 'later'];

export const DELIVERY_META: Record<
  DeliveryPartner,
  { label: string; short: string; color: string; bg: string; border: string }
> = {
  adsomnia: {
    label: 'Adsomnia',
    short: 'Ads',
    color: 'text-pink-300',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/30',
  },
  blablabuild: {
    label: 'blablabuild',
    short: 'bla',
    color: 'text-bla-lime',
    bg: 'bg-bla-lime/10',
    border: 'border-bla-lime/30',
  },
  'harlem-next': {
    label: 'Harlem Next',
    short: 'HN',
    color: 'text-violet-300',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/30',
  },
  'bending-the-rules': {
    label: 'Bending the Rules',
    short: 'BtR',
    color: 'text-orange-300',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
  },
  tbd: {
    label: 'TBD',
    short: 'TBD',
    color: 'text-white/50',
    bg: 'bg-white/5',
    border: 'border-white/15',
  },
};

export const ALL_DELIVERY_PARTNERS = Object.keys(DELIVERY_META) as DeliveryPartner[];
export const ALL_PRIORITY_STATUSES = Object.keys(PRIORITY_STATUS_META) as PriorityStatus[];

export const DEPT_COLORS: Record<string, string> = {
  'Affiliate Management': '#f472b6',
  'Media Buying': '#60a5fa',
  'BI / Pricing': '#a78bfa',
  'Finance': '#34d399',
  'HR': '#fbbf24',
  'E-mail Marketing': '#f97316',
  'General': '#6b7280',
};

export function getDeptColor(label: string): string {
  return DEPT_COLORS[label] || DEPT_COLORS['General'];
}

export const Q_META: Record<QuadrantKey, { dot: string; bg: string; label: string; desc: string }> = {
  quick:     { dot: '#ceff00', bg: 'rgba(206,255,0,0.06)',   label: 'Quick Wins',     desc: 'High impact, low effort' },
  strategic: { dot: '#60a5fa', bg: 'rgba(96,165,250,0.06)',  label: 'Major Projects', desc: 'High impact, more effort' },
  low:       { dot: '#6b7280', bg: 'rgba(107,114,128,0.04)', label: 'Fill-ins',       desc: 'Low impact, low effort' },
  later:     { dot: '#f59e0b', bg: 'rgba(245,158,11,0.05)',  label: 'Backlog',        desc: 'Low impact, high effort' },
};

export function calcScore(s: Scores): number {
  return s.businessImpact * 0.3 + s.frequency * 0.2 + s.aiSuitability * 0.2 +
    s.implementation * 0.1 + s.risk * 0.1 + s.adoption * 0.1;
}

export function getQuadrant(uc: UseCase): QuadrantKey {
  const impact = uc.scores.businessImpact;
  const effort = 6 - uc.scores.implementation;
  if (impact >= 3 && effort <= 3) return 'quick';
  if (impact >= 3) return 'strategic';
  if (effort <= 3) return 'low';
  return 'later';
}

export function sortUseCasesByScore(cases: UseCase[]): UseCase[] {
  return [...cases].sort((a, b) => {
    const diff = calcScore(b.scores) - calcScore(a.scores);
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });
}

export function sortUseCasesByPriority(cases: UseCase[]): UseCase[] {
  const allRanked = cases.every((uc) => typeof uc.priorityRank === 'number');
  if (!allRanked) return sortUseCasesByScore(cases);
  return [...cases].sort((a, b) => {
    const diff = (a.priorityRank ?? 0) - (b.priorityRank ?? 0);
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });
}

export function effortFromImplementation(implementation: number): number {
  return 6 - implementation;
}

export function sortByDeptThenName(a: UseCase, b: UseCase): number {
  const dept = (a.label || 'General').localeCompare(b.label || 'General');
  if (dept !== 0) return dept;
  const name = a.name.localeCompare(b.name);
  return name !== 0 ? name : a.id.localeCompare(b.id);
}

export function textChanged(a?: string, b?: string): boolean {
  return (a || '').trim() !== (b || '').trim();
}
