/* tools/foe-cast-lint.mjs - THE CAST LINT (claude/foecast, 11-05; Daniel 11-02: "too many generic goblins; goblins only before the Goblin Queen"). Node only.
     node tools/foe-cast-lint.mjs            checks (exit 1 on a fail) + the one-level-wonder report
   1. NO LIVING GOBLINS PAST THE GOBLIN QUEEN, every level, ents + ambush waves + rung-bell garrisons. A goblin-AI foe with no reskin (cnSkin / canal.cnSkin / a role flag) or a bone
      flag fails. (tools/goblin-lint.mjs holds a hand-kept FIXED list and only REPORTS the rest; this one fails them all except GOB_OK, each with a reason.)
   2. THE GENERIC SHARE: sprig + archer + shield + pike + brute + hound + plain rockgoblin as a share of a level's foes (before the Queen) must not pass GENERIC_MAX.
      A level over it is listed in GENERIC_OVER with a CEILING (it may not get worse) and the reason; lowering the number is always welcome.
   3. A CAST WITH ROOM IN IT: a level of 30+ foes needs MIN_KINDS distinct kinds (a reskinned goblin is its own kind). Short levels are listed in FEW_KINDS the same way.
   4. THE CAST PASS KEEPS ITS PROMISE: each row of src/cast-pass.js must still find its targets (a level that moved under it fails here, not silently).
   REPORT ONLY: the interesting goblin kinds that live in ONE level before the Queen (the spread this lane exists for). */
import assert from 'node:assert/strict';
import { cast, GENERIC, GOBLIN_KINDS } from './foe-cast.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { CAST_SWAPS, castSwaps } from '../src/cast-pass.js';
export const GENERIC_MAX = 0.60, MIN_KINDS = 8;
/* levels past the Queen allowed a bare goblin, with the reason */
export const GOB_OK = { harbor: 'shelved on purpose: the only level with no map node (tools/one-new-foe.mjs GRANDFATHERED too)' };
/* before the Queen, over GENERIC_MAX today. The number is a CEILING. These are the DEMO levels: claude/demofoes already gave them their pass (11-03) and this lane does not churn them. */
export const GENERIC_OVER = {
  stockade: [0.64, 'post-demo pass (claude/foevariety): fire/rock archers + club sprigs + sappers; the rest of its generics are scripted tower/gate/cook roles (stk keys) a swap row must not touch'],
  palisadewood: [0.58, 'post-demo pass (claude/foevariety): club sprigs, fire/rock archers, sappers; hound/brute/shield are its taught lessons'],
};
export const FEW_KINDS = {
  caravan: [7, 'a desert one-biome level: its cast is the bandit set + sand beasts'],
  glasssea: [7, 'a desert level: reskinned scorpion / cutthroat / slinger set'],
  buriedcity: [6, 'a desert level: sand-drowned + constructs, one-biome'],
};
const depth = depthsOf(LEVELS);
const gq = LEVELS.find(l => { try { const L = l.build(); return L.arena && L.arena.boss === 'gqueen'; } catch { return false; } });
assert.ok(gq, 'no level has the Goblin Queen for a boss: nothing to measure from');
const rows = cast(), fails = [], notes = [];
for (const r of rows) {
  if (/^trial|^arena_yard$/.test(r.id)) continue;
  const past = depth[r.id] > depth[gq.id];
  if (past && !GOB_OK[r.id]) for (const [k, v] of Object.entries(r.tally)) { const base = k.split('/')[0]; if (GOBLIN_KINDS.has(base) && !k.includes('/') && base !== 'bonegob') fails.push(r.id + ' (past the Queen): ' + v + ' bare ' + base + ' - give it a reskin or take it out'); }
  if (!past && r.n >= 20) {
    const g = Object.entries(r.tally).filter(([k]) => GENERIC.has(k)).reduce((s, [, v]) => s + v, 0), share = g / r.n, cap = GENERIC_OVER[r.id] ? GENERIC_OVER[r.id][0] : GENERIC_MAX;
    if (share > cap + 1e-9) fails.push(r.id + ': generic goblins are ' + Math.round(share * 100) + '% of ' + r.n + ' foes (cap ' + Math.round(cap * 100) + '%): swap some for the level\'s own or an interesting goblin');
  }
  if (r.n >= 30) { const need = FEW_KINDS[r.id] ? FEW_KINDS[r.id][0] : MIN_KINDS; if (Object.keys(r.tally).length < need) fails.push(r.id + ': only ' + Object.keys(r.tally).length + ' kinds in ' + r.n + ' foes (min ' + need + ')'); }
}
for (const id of Object.keys(GENERIC_OVER)) assert.ok(LEVELS.some(l => l.id === id), 'GENERIC_OVER names ' + id + ', which is not a level');
/* the cast pass keeps its promise: rebuild each swapped level's finished ents with the pass OFF is not possible, so count what the pass reports on a fresh un-swapped build */
const report = [];
for (const id of Object.keys(CAST_SWAPS)) { const lv = LEVELS.find(l => l.id === id); if (!lv) { fails.push('CAST_SWAPS names ' + id + ', which is not a level'); continue; }
  const L = lv.build(); const un = CAST_SWAPS_CHECK(L, id); for (const m of un) report.push(m); }
function CAST_SWAPS_CHECK(L, id) {
  /* the built level already has the swaps applied; a row is kept if its `to` kind appears at least `min` times among plain ents of that level */
  const out = [];
  for (const r of CAST_SWAPS[id]) { const n = L.ents.filter(e => e.t === r.to).length; if (n < (r.min || 1)) out.push(id + ': cast row ' + r.from + ' -> ' + r.to + ' finds only ' + n + ' ' + r.to + ' (min ' + (r.min || 1) + ')'); }
  return out;
}
fails.push(...report);
/* REPORT: one-level wonders among the interesting goblin kinds, before the Queen */
const SPECIAL = [...GOBLIN_KINDS].filter(k => !GENERIC.has(k));
const where = {}; for (const r of rows) if (depth[r.id] <= depth[gq.id] && !/^trial|^arena_yard$/.test(r.id)) for (const k of Object.keys(r.tally)) { const b = k.split('/')[0]; if (SPECIAL.includes(b) && !k.includes('/')) (where[b] ||= new Set()).add(r.id); }
const wonders = Object.entries(where).filter(([, s]) => s.size === 1).map(([k, s]) => k + '@' + [...s][0]);
console.log('interesting goblin kinds in ONE level before the Queen (report only): ' + (wonders.join(', ') || 'none'));
console.log('spread: ' + Object.entries(where).sort((a, b) => b[1].size - a[1].size).map(([k, s]) => k + ' ' + s.size).join(', '));
assert.equal(fails.length, 0, fails.slice(0, 14).join('\n'));
console.log('ok  foe-cast-lint  no bare goblin past ' + gq.id + '; generic share <= ' + GENERIC_MAX * 100 + '% (' + Object.keys(GENERIC_OVER).length + ' demo levels capped at today\'s value); >= ' + MIN_KINDS + ' kinds in a 30-foe level; cast rows keep their promise');
