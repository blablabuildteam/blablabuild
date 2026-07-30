export type QuadrantKey = 'quick' | 'strategic' | 'low' | 'later';
export type ClaudeFit = 'good' | 'stretch' | 'blocked';
export type ReviewStatus = 'pending' | 'reviewed' | 'needs-split' | 'deferred';

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

export function sortByDeptThenName(a: UseCase, b: UseCase): number {
  const dept = (a.label || 'General').localeCompare(b.label || 'General');
  if (dept !== 0) return dept;
  const name = a.name.localeCompare(b.name);
  return name !== 0 ? name : a.id.localeCompare(b.id);
}

export function textChanged(a?: string, b?: string): boolean {
  return (a || '').trim() !== (b || '').trim();
}
