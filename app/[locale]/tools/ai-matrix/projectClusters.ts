import type { PriorityStatus } from './types';
import { PROJECT_CLUSTERS_V2 } from './projectClustersEnhanced';

/**
 * Proposed delivery projects for Adsomnia (not department folders).
 * Seed source of truth is PROJECT_CLUSTERS_V2 (enhanced names + splits).
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

/** Bump when seed titles/summaries/structure change — refreshes draft copy. */
export const CLUSTERS_SEED_VERSION = 18;

/** Active seed — mirrors enhanced V2 (names and theme folds). */
export const PROJECT_CLUSTERS: ProjectCluster[] = PROJECT_CLUSTERS_V2.map((c) => ({
  id: c.id,
  name: c.name,
  summary: c.summary,
  rationale: c.rationale,
  caseIds: [...c.caseIds],
  suggestedHorizon: c.suggestedHorizon,
  primaryDelivery: c.primaryDelivery ? [...c.primaryDelivery] : undefined,
}));

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

/** Stable accent per project for cards / timeline bars — one hue family each. */
export const PROJECT_ACCENT: Record<string, string> = {
  'email-ongage': '#f97316',
  'affiliate-partner-ops': '#d946ef',
  'partner-activation': '#d946ef',
  'partner-intelligence': '#d946ef',
  'media-buy-performance': '#3b82f6',
  'mb-campaign-launch': '#3b82f6',
  'mb-performance-ops': '#ef4444',
  'adops-tracker': '#84cc16',
  'bi-pricing-payouts': '#8b5cf6',
  'finance-intel': '#eab308',
  'hr-enablement': '#fb7185',
  'api-growth': '#2dd4bf',
  'crm-platform': '#94a3b8',
  'meeting-productivity': '#a8a29e',
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
 * Project horizon = cluster.suggestedHorizon when set, else earliest member status.
 */
export function resolveProjectHorizon(
  cluster: ProjectCluster,
  cases: { id: string; priorityStatus?: string }[]
): Exclude<PriorityStatus, 'kill'> {
  if (cluster.suggestedHorizon && cluster.suggestedHorizon !== 'kill') {
    return cluster.suggestedHorizon;
  }
  const members = cases.filter(
    (c) => cluster.caseIds.includes(c.id) && c.priorityStatus !== 'kill'
  );
  if (members.length === 0) return 'later';
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
