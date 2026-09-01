import type { ProjectCluster } from './projectClusters';

export type ProjectDecisionKind = 'pending' | 'keep' | 'split' | 'park' | 'kill';

export interface ProjectDecisionEntry {
  decision: ProjectDecisionKind;
  note: string;
  updatedAt?: string;
}

export interface PrioritizeMetaState {
  projectDecisions?: Record<string, ProjectDecisionEntry>;
  checklist?: Record<string, boolean>;
  /** Editable project grouping (v2 draft). Null/absent = use code defaults. */
  clusters?: ProjectCluster[] | null;
  clustersUpdatedAt?: string;
}

export function lsMetaKey(sessionId: string) {
  return `ai-matrix-prioritize-meta:${sessionId}`;
}

export async function loadPrioritizeMeta(sessionId: string): Promise<PrioritizeMetaState> {
  let local: PrioritizeMetaState | null = null;
  try {
    const raw = window.localStorage.getItem(lsMetaKey(sessionId));
    if (raw) local = JSON.parse(raw) as PrioritizeMetaState;
  } catch {
    local = null;
  }
  try {
    const res = await fetch(`/api/matrix-sessions/${sessionId}`);
    const data = await res.json();
    const remote = (data.meta as PrioritizeMetaState | null) || null;
    return {
      projectDecisions: {
        ...(local?.projectDecisions || {}),
        ...(remote?.projectDecisions || {}),
      },
      checklist: {
        ...(local?.checklist || {}),
        ...(remote?.checklist || {}),
      },
      // Prefer remote clusters if present, else local draft
      clusters:
        remote?.clusters && remote.clusters.length > 0
          ? remote.clusters
          : local?.clusters && local.clusters.length > 0
            ? local.clusters
            : null,
      clustersUpdatedAt: remote?.clustersUpdatedAt || local?.clustersUpdatedAt,
    };
  } catch {
    return local || {};
  }
}

export async function savePrioritizeMeta(
  sessionId: string,
  next: PrioritizeMetaState
): Promise<PrioritizeMetaState> {
  try {
    window.localStorage.setItem(lsMetaKey(sessionId), JSON.stringify(next));
  } catch {
    // ignore
  }
  try {
    const res = await fetch(`/api/matrix-sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'meta', meta: next }),
    });
    const data = await res.json();
    if (data?.meta && typeof data.meta === 'object') {
      return data.meta as PrioritizeMetaState;
    }
  } catch {
    // local already written
  }
  return next;
}
