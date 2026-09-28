// tools/ambush-listed.mjs — every ambush's SOURCE wave table vs what singleAmbush() actually spawns.
// singleAmbush() (src/ambush.js) keeps 1 elite + the first three non-elite, non-overlapping foes in source
// order and silently drops the rest of whatever the level's wave table lists (claude/hanging2, 2026-09-28:
// the Hanging Village's archer + cutter never spawned in the live game because of exactly this). This check
// builds every level, reads what each ambush's own wave table LISTS, compares it with what L.ambushes
// actually SPAWNS, and is red whenever a foe TYPE the table lists never spawns at all.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LEVELS } from '../src/level.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// ---- 1) what's LISTED: scan the source for every `waves: [...]` block and the ambush `name:` it belongs to.
function findBalanced(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  throw new Error('unbalanced brackets at ' + start);
}
function extractListed(file) {
  const text = readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
  const out = [];
  const re = /waves:\s*(\[)/g;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].length - 1;
    const block = findBalanced(text, start);
    // window widened from 600 to 2000 (2026-09-28, ambushfix): hanging/kings/wood's follow-up comments
    // pushed the gap between an entry's own `name:` and its `waves:` past 600 chars (up to 1015 observed),
    // which silently dropped those three ambushes from this check's own report - false negatives, not passes.
    const before = text.slice(Math.max(0, m.index - 2000), m.index);
    const names = [...before.matchAll(/name:\s*(?:'([^']+)'|"([^"]+)")/g)];
    const name = names.length ? (names[names.length - 1][1] ?? names[names.length - 1][2]) : null;
    if (!name) continue;   // not an ambush's own waves (shouldn't happen given the 600-char window)
    const types = [...block.matchAll(/\[\s*'([a-zA-Z]+)'/g)].map(x => x[1]);
    out.push({ name, types, file });
  }
  return out;
}
const listedAll = [
  ...extractListed('level.js'),
  ...extractListed('burial-caverns.js'),
  ...extractListed('ore-road.js'),
  ...extractListed('sunken-caravan.js'),
  ...extractListed('unburied-field.js'),
];
const listedByName = new Map(listedAll.map(a => [a.name, a]));

// ---- 2) what's SPAWNED: build every level for real and read L.ambushes (already through singleAmbush).
const spawnedByName = new Map();
for (const lv of LEVELS) {
  let L;
  try { L = lv.build(); } catch { continue; }
  for (const A of L.ambushes || []) {
    spawnedByName.set(A.name, { id: lv.id, types: A.waves.flat().map(f => f[0]) });
  }
}

// ---- 3) compare, per ambush, listed multiset vs spawned multiset. Flag any TYPE fully dropped.
// haunted-coast.js renames a surviving 'wight' to 'lanternshade'/'bonecorsair' at runtime for lamplit only -
// that substitution is intentional (level review, 2026-09-24), not a silent drop, so treat it as satisfied.
const RENAMED = { lamplit: { wight: ['lanternshade', 'bonecorsair'] } };
// hanging/spore/spire/oreroad were excused here while their reworks were in flight on other branches; all four
// are on master as of batch38 (claude/ambushfix, 2026-09-28), so the excuse list is empty - every ambush is
// checked for real now.
const LEFT_TO_BRANCH = {};
function counts(arr) { const m = new Map(); for (const t of arr) m.set(t, (m.get(t) || 0) + 1); return m; }

const rows = [];
let offenders = 0;
for (const [name, spawned] of spawnedByName) {
  const listed = listedByName.get(name);
  if (!listed) continue;   // an ambush built with no static wave table we can find (shouldn't happen) — not our concern here
  const lc = counts(listed.types), sc = counts(spawned.types);
  const renames = RENAMED[spawned.id] || {};
  const droppedTypes = [];
  for (const [t, n] of lc) {
    const satisfied = (sc.get(t) || 0) > 0 || (renames[t] || []).some(alt => (sc.get(alt) || 0) > 0);
    if (!satisfied) droppedTypes.push(t + ' x' + n);
  }
  const row = { id: spawned.id, name, listed: listed.types, spawned: spawned.types, droppedTypes, left: LEFT_TO_BRANCH[spawned.id] };
  rows.push(row);
  if (droppedTypes.length && !row.left) offenders++;
}
rows.sort((a, b) => a.id.localeCompare(b.id));

for (const r of rows) {
  console.log(r.id + ' | ' + r.name + (r.left ? '  [LEFT TO ' + r.left + ']' : ''));
  console.log('  listed:  ' + r.listed.join(','));
  console.log('  spawned: ' + r.spawned.join(','));
  console.log('  dropped: ' + (r.droppedTypes.length ? r.droppedTypes.join(', ') : '-'));
}
console.log('\n' + rows.length + ' ambushes checked, ' + offenders + ' drop at least one listed foe TYPE entirely (excluding levels left to their own branches).');

const OFFENDER_NAMES = rows.filter(r => r.droppedTypes.length && !r.left).map(r => r.id + ':' + r.name);
assert.equal(offenders, 0, 'ambushes losing a listed foe type entirely: ' + OFFENDER_NAMES.join('; '));
