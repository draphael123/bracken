/* tools/one-new-foe.mjs — DOES EVERY LEVEL BRING A FOE THE GAME HAS NEVER SEEN? Node only: no page, no port, no Chrome.

   THE RULE (RULES-LEVELS-AND-BOSSES.md, F10). "Not a recolour and not the same creature with more health: one new
   kind, with its own silhouette, its own told blow and its own place in the gaps the roster already has." A level
   built entirely out of foes you have already fought is a level about its geometry, and geometry alone does not
   carry 400-700 columns. The rule names its own check: A SET DIFFERENCE - every level's roster against the union of
   every EARLIER level's.

   WHY IT EXISTS. THE ORE ROAD shipped with nine foe kinds of which exactly ONE was new, and Daniel's playtest verdict
   was "no new enemies/idea other than riding lifts". It walks at INDEX 59 between neighbours at 92-113 and is the
   worst level in the game. Nobody knew until he played it, which is the most expensive way to find anything.

   THE TRAP THIS CHECK HAD TO AVOID, AND IT IS THE WHOLE DESIGN. Read F10 literally - "at least one foe the game has
   never seen" - and count everything a level places, and THE ORE ROAD PASSES. Its one new kind is THE WINCHMASTER:
   its own boss. Every level in this game ends on a boss of its own and most carry a mini as well (F7 calls both of
   them furniture: "a mini at roughly a third, the boss at the end"), so a check that lets a level's own boss be its
   new foe can never fail anywhere, on any level, ever. It would have gone green on the exact level that earned the
   rule. So: A LEVEL'S OWN ARENA BOSS AND ITS OWN MINI-BOSS DO NOT COUNT AS ITS NEW FOE. They still enter the seen
   set - you have fought them, and a later level that places one as rank-and-file is not introducing anything - they
   simply cannot be the evidence that the level obeyed F10. What has to be new is a foe you meet ON THE LEVEL.

   WHAT "EARLIER" MEANS. The walk order, not the order of a declaration: the NODES lists in src/main.js, in the order
   NODES concatenates its regions, which is the order the map token walks and which this tool checks agrees with
   every level's own `needs` chain. A level's seen set is the union of the rosters of the levels BEFORE IT ON THE
   ROAD. Spur levels (`spur: true` - the Burning Village, Underleaf, the Undercrown) are optional side branches a
   player may never take, so what they contain is NOT charged against a later road level: a foe you could have
   skipped is a foe you may never have fought. A spur itself is judged against the road up to where it hangs off,
   which is the earliest a player can reach it. PARKED, and reported below: a player may also come back to a spur
   at the very end, so "earlier" for a spur is a genuine question rather than an oversight.

   WHAT IS COUNTED. What is actually PLACED in the built level, the way tools/threat-holes.mjs reads it, rather than
   any table that might not list everything: ents (including the goblin behind a window), ambush waves, the alarm
   garrisons, the swim garrison, the arena boss and the mini. A creature is something with health - main.js's own
   EHP table - which is the same definition threat-holes uses, so a creature added there is covered here that day.

   STORMWRECK HARBOR is not measured. It is the only level in LEVELS with no map node, it is deliberately unreachable
   and docs/QUEUE.md section 6 says leave it alone. Any OTHER level that ends up off the map is a loud failure here,
   because a metric that quietly skips its input returns a confident smaller number instead of failing. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* WHAT COUNTS AS A CREATURE: it has health. EHP is main.js's own list and is not exported, so it is read from the
   source - the same parse tools/threat-holes.mjs uses, and it guards itself the same way. */
const ehpLine = src.slice(src.indexOf('const EHP = {'));
const EHP = new Set([...ehpLine.slice(0, ehpLine.indexOf('};')).matchAll(/([a-zA-Z][a-zA-Z0-9]*)\s*:/g)].map(m => m[1]));
assert.ok(EHP.size > 80, 'only ' + EHP.size + ' creatures were read out of EHP: the parse has stopped working, and this check is now guarding nothing');

/* ---------- THE WALK ORDER, read off the map ---------- */
/* main.js cannot be imported in Node (it wants a document), so the NODES lists are read out of the source. Balanced
   brackets rather than a line match, because COAST_NODES closes with `}];` on the same line as its last node. */
const arrayAfter = name => {
  const i = src.indexOf('const ' + name + ' = [');
  assert.notEqual(i, -1, 'src/main.js no longer declares ' + name + ': the map has been restructured and this check cannot read the walk order any more');
  const s = src.indexOf('[', i);
  let d = 0;
  for (let k = s; k < src.length; k++) {
    const c = src[k];
    if (c === '[') d++; else if (c === ']') { d--; if (!d) return src.slice(s, k + 1); }
  }
  assert.fail(name + ' is not closed in src/main.js');
};
const decl = src.match(/const NODES = ([^;]*);/);
assert.ok(decl, 'src/main.js no longer has a `const NODES = ...` line: the walk order cannot be read');
const regions = [...decl[1].matchAll(/([A-Za-z_]+_NODES)\.map/g)].map(m => m[1]);
assert.ok(regions.length >= 4, 'only ' + regions.length + ' region node lists were found in the NODES concat: the parse has stopped working');

const ORDER = [];
for (const r of regions) for (const m of arrayAfter(r).matchAll(/\{[^{}]*\}/g)) {
  const o = m[0];
  if (!/kind:\s*'level'/.test(o)) continue;                 /* stores and other furniture are not levels */
  const id = (o.match(/id:\s*'([^']+)'/) || [])[1];
  assert.ok(id, 'a level node in ' + r + ' has no id: ' + o.slice(0, 80));
  const num = (o.match(/level:\s*(\d+)\s*,/) || [])[1];
  ORDER.push({ id, region: r, spur: /spur:\s*true/.test(o), num: num === undefined ? null : +num });
}
assert.ok(ORDER.length >= 25, 'only ' + ORDER.length + ' level nodes were read off the map: the parse has stopped working, and this check is now measuring a fraction of the campaign');

/* ---------- THE ORDER HAS TO BE THE REAL ONE, or every set difference below is drawn against the wrong past ---------- */
const HARBOR = 'harbor';                                     /* shelved on purpose: QUEUE.md section 6 */
const at = new Map(ORDER.map((n, i) => [n.id, i]));
const bad = [];
for (const n of ORDER) {
  const lv = LEVELS.find(l => l.id === n.id);
  if (!lv) { bad.push('the map has a level node "' + n.id + '" and LEVELS has no such level'); continue; }
  /* a node that names its level by INDEX must still be the level its id says it is */
  if (n.num !== null && (LEVELS[n.num] || {}).id !== n.id) bad.push('map node "' + n.id + '" points at LEVELS[' + n.num + '] which is "' + (LEVELS[n.num] || {}).id + '"');
  /* and the walk order must agree with the unlock chain, or "earlier" is a guess */
  if (lv.needs && at.has(lv.needs) && at.get(lv.needs) >= at.get(n.id)) bad.push('"' + n.id + '" needs "' + lv.needs + '" and stands BEFORE it in the NODES walk order');
}
const offMap = LEVELS.filter(l => !l.hidden && !at.has(l.id)).map(l => l.id);
for (const id of offMap) if (id !== HARBOR) bad.push('level "' + id + '" is in LEVELS, is not hidden, and has no map node - so this check would silently not measure it (only STORMWRECK HARBOR is allowed off the map, QUEUE.md section 6). Give it a node, or mark it hidden.');
if (bad.length) assert.fail('THE WALK ORDER CANNOT BE TRUSTED, so no set difference below would mean anything:\n    ' + bad.join('\n    '));

/* ---------- EVERY LEVEL'S ROSTER, as actually placed ---------- */
const roster = lv => {
  const L = lv.build();
  const all = new Set(), setPieces = new Set();
  const add = t => { if (typeof t === 'string' && EHP.has(t)) all.add(t); };
  for (const e of L.ents || []) if (e) { add(e.t); add(e.gob); }          /* e.gob: the goblin that comes out of a window */
  for (const A of L.ambushes || []) for (const w of A.waves || []) for (const row of w) add(row && row[0]);
  for (const A of L.alarms || []) for (const g of A.garrison || []) add(g && g.t);
  for (const t of L.swimGarrison || []) add(t);
  for (const b of [L.arena && L.arena.boss, L.mini && L.mini.boss]) if (typeof b === 'string' && EHP.has(b)) { all.add(b); setPieces.add(b); }
  return { all, setPieces };
};

const rows = [], unreadable = [];
for (const n of ORDER) {
  const lv = LEVELS.find(l => l.id === n.id);
  let r;
  try { r = roster(lv); } catch (e) { unreadable.push(n.id + ': build() threw - ' + e.message); continue; }
  if (!r.all.size) { unreadable.push(n.id + ': built, but not one creature could be read out of it'); continue; }
  rows.push({ ...n, ...r });
}
/* A LEVEL WHOSE ROSTER CANNOT BE READ IS NOT A SMALLER NUMBER, IT IS A HOLE. */
if (unreadable.length) assert.fail(unreadable.length + ' of ' + ORDER.length + ' campaign levels could not be scored, so the union of "every earlier roster" is short and every verdict after them is wrong:\n    '
  + unreadable.join('\n    ') + '\n  Fix the build, or this check is measuring ' + (ORDER.length - unreadable.length) + ' levels and reporting on ' + ORDER.length + '.');

/* ---------- THE SET DIFFERENCE ---------- */
const seenRoad = new Set();      /* what a player who walked only the road has fought */
const seenEver = new Set();      /* what the game has shown anywhere, spurs included - reported, not enforced */
const table = [], failures = [], thin = [];
for (const r of rows) {
  const freshRoad = [...r.all].filter(t => !seenRoad.has(t) && !r.setPieces.has(t));
  const freshEver = [...r.all].filter(t => !seenEver.has(t) && !r.setPieces.has(t));
  r.fresh = freshRoad; r.freshEver = freshEver;
  r.spurOnly = freshRoad.filter(t => !freshEver.includes(t));   /* new to the road, already met on an optional spur */
  table.push('  ' + r.id.padEnd(14) + (r.spur ? 'spur ' : 'road ') + String(r.all.size).padStart(3) + ' kinds  '
    + String(freshRoad.length).padStart(2) + ' new  ' + (freshRoad.join(', ') || '- NOTHING BUT ' + [...r.setPieces].join(' and ') + ' -')
    + (r.spurOnly.length ? '   [' + r.spurOnly.join(', ') + ' first met on an optional spur]' : ''));
  if (!freshRoad.length) failures.push(r); else if (freshRoad.length === 1) thin.push(r.id + ' (' + freshRoad[0] + ')');
  if (!r.spur) for (const t of r.all) seenRoad.add(t);
  for (const t of r.all) seenEver.add(t);
}

const kinds = seenEver.size;
/* WHAT FRACTION OF THE INPUT ACTUALLY SCORED. It is 100% or this tool has already failed above, but it is printed
   every run, because a number that quietly measured 26 of 29 levels looks exactly like a number that measured 29. */
const coverage = rows.length + ' of ' + ORDER.length + ' campaign levels scored ('
  + Math.round(rows.length / ORDER.length * 100) + '%, every roster read), ' + kinds + ' creature kinds'
  + (offMap.length ? '; off the map and not measured: ' + offMap.join(', ') + ' (shelved on purpose, QUEUE.md section 6)' : '');
/* THE PARKED QUESTION, MADE CONCRETE: which verdicts would change if an optional spur DID count as "earlier". */
const spurSwing = rows.filter(r => r.fresh.length && !r.freshEver.length).map(r => r.id);

if (failures.length) {
  console.error('LEVELS THAT BRING THE GAME NOTHING IT HAS NOT ALREADY FOUGHT (F10):\n');
  for (const f of failures) {
    console.error('  ' + f.id.toUpperCase() + ' - ' + f.all.size + ' foe kinds, and every one of them has been fought before.');
    console.error('      the only kinds the road had not met are ' + [...f.setPieces].join(' and ') + ', which '
      + (f.setPieces.size === 1 ? 'is its own boss' : 'are its own boss and its own mini') + ' - furniture every level carries (F7), not a new foe.');
    console.error('      its roster: ' + [...f.all].sort().join(', '));
  }
  console.error('\n  THE WHOLE TABLE, in walk order:');
  console.error(table.join('\n'));
  console.error('\n  WHAT TO DO. Give each of these levels one kind the road has never fought: its own silhouette, its own');
  console.error('  told blow, and a gap in the roster that it fills (F10 says fill GAPS, not variety). Not a recolour, not the');
  console.error('  same creature with more health, and NOT the boss or the mini - those are furniture and cannot be the answer.');
  console.error('  Fixing the levels is content work; this check only says which ones owe it.');
  console.error('\n  Spurs are optional, so what is on one is not charged against a later road level. Levels that would flip to a'
    + ' failure if they were: ' + (spurSwing.length ? spurSwing.join(', ') : 'none - the reading changes no verdict today') + '.');
  console.error('  ' + coverage + '.');
  process.exit(1);
}

console.log(table.join('\n'));
console.log('ok  one-new-foe    ' + coverage + ', and every level brings at least one foe the road has never fought'
  + ' (its own boss and mini do not count).'
  + (thin.length ? ' Clearing it by exactly one: ' + thin.join(', ') + '.' : '')
  + (spurSwing.length ? ' Leaning on an optional spur: ' + spurSwing.join(', ') + '.' : ''));
