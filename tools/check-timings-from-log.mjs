// tools/check-timings-from-log.mjs - A SHARD MAP FROM THE WHOLE, SERIAL SUITE'S OWN CLOCKS.
// Run after a full unsharded gate: node tools/check-timings-from-log.mjs work/codex-lane-done/baseline-suite.log
// The name list already committed in check-timings.json is the inventory. A missing or repeated answer is an error,
// never a smaller map that silently drops a release check from both shards.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const path = process.argv[2]; if (!path) throw new Error('give the complete suite log');
const old = JSON.parse(readFileSync(new URL('./check-timings.json', import.meta.url), 'utf8'));
const names = Object.keys(old).sort((a, b) => b.length - a.length || a.localeCompare(b));
const found = new Map(), verdicts = new Map();
for (const line of readFileSync(join(root, path), 'utf8').split(/\r?\n/)) {
  const prefix = line.startsWith(' ok  ') ? ' ok  ' : line.startsWith('FAIL ') ? 'FAIL ' : null;
  if (!prefix) continue;
  const rest = line.slice(prefix.length), name = names.find(n => rest.startsWith(n) && /^\s*\d+ms\b/.test(rest.slice(n.length)));
  if (!name) continue; if (found.has(name)) throw new Error('duplicate result line for ' + name);
  found.set(name, +rest.slice(name.length).trim().match(/^(\d+)ms/)[1]); verdicts.set(name, prefix === ' ok  ');
}
const missing = names.filter(n => !found.has(n)); if (missing.length) throw new Error('log missed ' + missing.join(', '));
const timed = Object.fromEntries([...found].sort((a, b) => a[0].localeCompare(b[0])));
writeFileSync(new URL('./check-timings.json', import.meta.url), JSON.stringify(timed, null, 2) + '\n');
console.log(found.size + ' timings saved; ' + [...verdicts].filter(([, ok]) => !ok).map(([n]) => n).join(', ') + ' failed on this run.');
