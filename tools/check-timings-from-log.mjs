// tools/check-timings-from-log.mjs - THE SHARD MAP FROM A SUITE LOG'S OWN CLOCKS (suite2 11-11: partial / tiered logs + tier tags kept).
//   node tools/check-timings-from-log.mjs <log> [--dry] [--strict] [--new-nightly]
// * Reads every ' ok  <name>  1234ms' / 'FAIL <name>  1234ms' line. A tier run (--tier=deploy, a shard, --also) logs only its own checks: those
//   get their new clocks and every other check KEEPS its committed clock (the old tool threw 'log missed ...', so only a full serial log worked).
//   --strict restores the old rule: the log must answer every name in the map.
// * TIER TAGS live in tools/check-tiers.json, not here, and this tool never removes one. A check that is NEW to the map (first timed run) was
//   implicitly in the DEPLOY tier ('absent from check-timings.json'); once it is timed it would silently drop out, so it is written into
//   check-tiers.json "deploy" (--new-nightly: leave it nightly-only instead). A name in a tier list but not in the map is reported, not dropped.
// * FAIL lines: the clock of a check that failed is kept as the old value when there is one (a crash at 3 s must not shrink a 300 s check).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2), path = args.find(a => !a.startsWith('--')); if (!path) throw new Error('give the suite log');
const DRY = args.includes('--dry'), STRICT = args.includes('--strict'), NEW_NIGHTLY = args.includes('--new-nightly');
const TIMINGS = new URL('./check-timings.json', import.meta.url), TIERS_F = new URL('./check-tiers.json', import.meta.url);
const old = JSON.parse(readFileSync(TIMINGS, 'utf8')), tiers = JSON.parse(readFileSync(TIERS_F, 'utf8'));
const found = new Map(), verdicts = new Map();
for (const line of readFileSync(join(root, path), 'utf8').split(/\r?\n/)) {
  const m = /^( ok  |FAIL )([a-z0-9][a-z0-9-]*)\s+(\d+)ms\b/.exec(line); if (!m) continue;
  if (found.has(m[2])) throw new Error('duplicate result line for ' + m[2]);
  found.set(m[2], +m[3]); verdicts.set(m[2], m[1] === ' ok  ');
}
if (!found.size) throw new Error('no result lines in ' + path);
const missing = Object.keys(old).filter(n => !found.has(n));
if (STRICT && missing.length) throw new Error('log missed ' + missing.join(', '));
const next = { ...old }, fresh = [];
for (const [n, ms] of found) { if (!(n in old)) fresh.push(n); if (verdicts.get(n) || !(n in old)) next[n] = ms; }
const timed = Object.fromEntries(Object.entries(next).sort((a, b) => a[0].localeCompare(b[0])));
const tagged = new Set([...tiers.deploy, ...tiers.weekly, ...Object.values(tiers.feature).flat()]);
const addDeploy = NEW_NIGHTLY ? [] : fresh.filter(n => !tagged.has(n));
const arr = a => '[' + a.map(x => JSON.stringify(x)).join(', ') + ']';
const fmtTiers = t => '{\n' + Object.entries(t).map(([k, v]) => ' ' + JSON.stringify(k) + ': ' + (k === 'feature'
  ? '{\n' + Object.entries(v).map(([f, a]) => '  ' + JSON.stringify(f) + ': ' + arr(a)).join(',\n') + '\n }' : Array.isArray(v) ? arr(v) : JSON.stringify(v))).join(',\n') + '\n}';
const fmt2 = t => fmtTiers(t).replace('",\n "deploy"', '", "deploy"');   /* (the committed file keeps _doc and deploy on one line) */
if (!DRY) {
  writeFileSync(TIMINGS, JSON.stringify(timed, null, 2) + '\n');
  if (addDeploy.length) { tiers.deploy = [...new Set([...tiers.deploy, ...addDeploy])].sort(); writeFileSync(TIERS_F, fmt2(tiers) + '\n'); }
}
const orphans = [...tagged].filter(n => !(n in timed));
console.log((DRY ? '[dry] ' : '') + found.size + ' timings read (' + fresh.length + ' new, ' + missing.length + ' kept from the committed map); ' + [...verdicts].filter(([, ok]) => !ok).map(([n]) => n).join(', ') + ' failed on this run.');
if (addDeploy.length) console.log('new checks tagged deploy in check-tiers.json: ' + addDeploy.join(', '));
if (orphans.length) console.log('tagged in check-tiers.json but absent from the timings map (they stay deploy via the new-check rule): ' + orphans.join(', '));
