import { CLUSTERS_SEED_VERSION, PROJECT_CLUSTERS, type ProjectCluster } from './projectClusters';

/** Deep-ish clone of default proposal (code seed). */
export function cloneDefaultClusters(): ProjectCluster[] {
  return PROJECT_CLUSTERS.map((c) => ({
    ...c,
    caseIds: [...c.caseIds],
    primaryDelivery: c.primaryDelivery ? [...c.primaryDelivery] : undefined,
  }));
}

/**
 * Active draft, or seed defaults.
 * When seed version bumps, refresh name/summary/rationale for known ids (keep caseIds).
 */
export function resolveClusters(
  draft: ProjectCluster[] | null | undefined,
  seedVersion?: number | null
): ProjectCluster[] {
  if (!Array.isArray(draft) || draft.length === 0) {
    return cloneDefaultClusters();
  }
  const refreshCopy = !seedVersion || seedVersion < CLUSTERS_SEED_VERSION;
  return draft.map((c) => {
    const seed = PROJECT_CLUSTERS.find((s) => s.id === c.id);
    if (!seed || c.id.startsWith('custom-')) {
      return {
        ...c,
        caseIds: [...(c.caseIds || [])],
        primaryDelivery: c.primaryDelivery ? [...c.primaryDelivery] : undefined,
      };
    }
    return {
      ...seed,
      caseIds: [...(c.caseIds || [])],
      // Keep user rename if they already customized after latest seed
      name: refreshCopy ? seed.name : c.name || seed.name,
      summary: refreshCopy ? seed.summary : c.summary || seed.summary,
      rationale: refreshCopy ? seed.rationale : c.rationale || seed.rationale,
      primaryDelivery: seed.primaryDelivery ? [...seed.primaryDelivery] : undefined,
    };
  });
}

export function unclusteredIds(clusters: ProjectCluster[], allCaseIds: string[]): string[] {
  const assigned = new Set(clusters.flatMap((c) => c.caseIds));
  return allCaseIds.filter((id) => !assigned.has(id));
}

export function projectIdForCase(clusters: ProjectCluster[], caseId: string): string | null {
  for (const c of clusters) {
    if (c.caseIds.includes(caseId)) return c.id;
  }
  return null;
}

/** Remove case from all projects, optionally place into target (or leave unclustered). */
export function moveCase(
  clusters: ProjectCluster[],
  caseId: string,
  targetProjectId: string | 'unclustered'
): ProjectCluster[] {
  const next = clusters.map((c) => ({
    ...c,
    caseIds: c.caseIds.filter((id) => id !== caseId),
  }));
  if (targetProjectId === 'unclustered') return next;
  return next.map((c) =>
    c.id === targetProjectId && !c.caseIds.includes(caseId)
      ? { ...c, caseIds: [...c.caseIds, caseId] }
      : c
  );
}

export function createProject(
  clusters: ProjectCluster[],
  name: string,
  seedCaseIds: string[] = []
): ProjectCluster[] {
  const base = name.trim() || 'New project';
  const id = `custom-${Date.now().toString(36)}`;
  let next = clusters.map((c) => ({
    ...c,
    caseIds: c.caseIds.filter((cid) => !seedCaseIds.includes(cid)),
  }));
  next = [
    ...next,
    {
      id,
      name: base,
      summary: 'Custom project — refine scope.',
      rationale: 'Created in Prioritize grouping draft.',
      caseIds: [...seedCaseIds],
      suggestedHorizon: 'later',
    },
  ];
  return next;
}

export function mergeProjectInto(
  clusters: ProjectCluster[],
  fromId: string,
  intoId: string
): ProjectCluster[] {
  if (fromId === intoId) return clusters;
  const from = clusters.find((c) => c.id === fromId);
  const into = clusters.find((c) => c.id === intoId);
  if (!from || !into) return clusters;
  const mergedIds = Array.from(new Set([...into.caseIds, ...from.caseIds]));
  return clusters
    .filter((c) => c.id !== fromId)
    .map((c) => (c.id === intoId ? { ...c, caseIds: mergedIds } : c));
}

export function updateProjectFields(
  clusters: ProjectCluster[],
  projectId: string,
  patch: Partial<Pick<ProjectCluster, 'name' | 'summary' | 'rationale'>>
): ProjectCluster[] {
  return clusters.map((c) => (c.id === projectId ? { ...c, ...patch } : c));
}

export function removeProject(clusters: ProjectCluster[], projectId: string): ProjectCluster[] {
  return clusters.filter((c) => c.id !== projectId);
}

export function slugId(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || `project-${Date.now().toString(36)}`
  );
}
