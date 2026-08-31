import { PROJECT_CLUSTERS } from '../app/[locale]/tools/ai-matrix/projectClusters.ts';

async function main() {
  const res = await fetch('https://www.blablabuild.com/api/matrix-sessions/adsomnia-workshop');
  const { useCases } = await res.json();
  const ids = new Set(useCases.map((u) => u.id));
  const nameById = Object.fromEntries(useCases.map((u) => [u.id, u.name]));

  let missing = 0;
  for (const p of PROJECT_CLUSTERS) {
    console.log('\n##', p.name, `(${p.caseIds.length})`);
    for (const id of p.caseIds) {
      if (!ids.has(id)) {
        console.log('  MISSING', id);
        missing++;
      } else console.log('  ok', String(nameById[id]).slice(0, 60));
    }
  }
  const allClustered = new Set(PROJECT_CLUSTERS.flatMap((p) => p.caseIds));
  const unc = useCases.filter((u) => !allClustered.has(u.id));
  console.log('\nUnclustered', unc.length);
  unc.forEach((u) => console.log(' -', u.id, String(u.name).slice(0, 55), u.priorityStatus));
  console.log('missing refs', missing, 'total cases', useCases.length);
}

main();
