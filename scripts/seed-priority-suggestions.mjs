/**
 * Apply roadmap proposal (Now / Near / Next / Later / Kill) to live Adsomnia session.
 *
 *   npx tsx scripts/seed-priority-suggestions.mjs
 */

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE_URL || 'https://www.blablabuild.com').replace(/\/$/, '');
const SESSION = process.env.SESSION_ID || 'adsomnia-workshop';

async function main() {
  const { proposeRoadmap } = await import(
    pathToFileURL(
      path.join(__dirname, '../app/[locale]/tools/ai-matrix/roadmapProposal.ts')
    ).href
  );

  const get = await fetch(`${BASE}/api/matrix-sessions/${SESSION}`);
  const data = await get.json();
  const cases = data.useCases || [];
  console.log('before', cases.length);

  if (cases.length === 0) {
    console.error('No cases found — aborting.');
    process.exit(1);
  }

  const next = proposeRoadmap(cases);
  const items = next.map((uc) => ({
    id: uc.id,
    priorityRank: uc.priorityRank,
    priorityStatus: uc.priorityStatus,
    deliveryPartners: uc.deliveryPartners,
  }));

  const res = await fetch(`${BASE}/api/matrix-sessions/${SESSION}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'batch', items }),
  });
  const out = await res.json();
  console.log('batch', { status: res.status, ok: out.ok, returned: out.useCases?.length });

  const get2 = await fetch(`${BASE}/api/matrix-sessions/${SESSION}`);
  const c2 = (await get2.json()).useCases || [];
  const counts = c2.reduce((acc, c) => {
    const s = c.priorityStatus || 'none';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  console.log('after counts', counts);
  console.log(
    'Now sample:',
    c2
      .filter((c) => c.priorityStatus === 'now')
      .sort((a, b) => a.priorityRank - b.priorityRank)
      .map((c) => c.name)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
