/**
 * Seed priority ranks + delivery suggestions onto the live Adsomnia workshop session.
 *
 *   node scripts/seed-priority-suggestions.mjs
 */

import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE_URL || 'https://www.blablabuild.com').replace(/\/$/, '');
const SESSION = process.env.SESSION_ID || 'adsomnia-workshop';

function calcScore(s) {
  return (
    s.businessImpact * 0.3 +
    s.frequency * 0.2 +
    s.aiSuitability * 0.2 +
    s.implementation * 0.1 +
    s.risk * 0.1 +
    s.adoption * 0.1
  );
}

async function loadSuggestions() {
  // Compile-free: duplicate the require via dynamic import of .ts with tsx runner.
  // This script is meant to be run with: npx tsx scripts/seed-priority-suggestions.mjs
  const mod = await import(
    pathToFileURL(
      path.join(__dirname, '../app/[locale]/tools/ai-matrix/deliverySuggestions.ts')
    ).href
  );
  return mod.suggestionFor;
}

async function main() {
  const suggestionFor = await loadSuggestions();
  const get = await fetch(`${BASE}/api/matrix-sessions/${SESSION}`);
  const data = await get.json();
  const cases = data.useCases || [];
  console.log('before', cases.length);

  if (cases.length === 0) {
    console.error('No cases found — aborting so we do not write empty state.');
    process.exit(1);
  }

  const sorted = [...cases].sort((a, b) => {
    const diff = calcScore(b.scores) - calcScore(a.scores);
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });

  const items = sorted.map((uc, i) => {
    const sug = suggestionFor(uc.id);
    return {
      id: uc.id,
      priorityRank: typeof uc.priorityRank === 'number' ? uc.priorityRank : i,
      priorityStatus: uc.priorityStatus ?? sug.priorityStatus ?? 'backlog',
      deliveryPartners: uc.deliveryPartners?.length
        ? uc.deliveryPartners
        : sug.deliveryPartners,
    };
  });

  const res = await fetch(`${BASE}/api/matrix-sessions/${SESSION}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'batch', items }),
  });
  const out = await res.json();
  console.log('batch', { status: res.status, ok: out.ok, kv: out.kv, returned: out.useCases?.length });

  const get2 = await fetch(`${BASE}/api/matrix-sessions/${SESSION}`);
  const data2 = await get2.json();
  const c2 = data2.useCases || [];
  console.log('after', {
    count: c2.length,
    ranked: c2.filter((c) => typeof c.priorityRank === 'number').length,
    delivery: c2.filter((c) => c.deliveryPartners?.length).length,
    now: c2.filter((c) => c.priorityStatus === 'now').length,
    backlog: c2.filter((c) => c.priorityStatus === 'backlog').length,
    kill: c2.filter((c) => c.priorityStatus === 'kill').length,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
