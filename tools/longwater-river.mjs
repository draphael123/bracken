// tools/longwater-river.mjs - THE LONG WATER IS A RIVER UNTIL SALTREACH (docs/briefs/long-water-river.md, 2026-09-25). What the level
// review found by eye, asked of the built level so it cannot drift back:
//   fresh     the fresh water (L.fresh) runs to Saltreach, and nothing of the sea is in it: no SEA_ONLY creature, no coral, kelp,
//             barnacle rock or shell (any level with L.fresh)
//   bore      the Bore is told before it is met: a sign that names it stands upstream of where its roar carries (x0 - 200 px) (C1),
//             and on the dry ground it runs over, a stone to stand on is never more than six tiles away (any level with L.bore)
//   lesson    the first swim pool, which comes before the swim sign, is empty
//   rocks     no two creatures on one tile, and no creature on or beside a checkpoint
//   spacing   checkpoints 40..100 route columns apart (RULES S4, B6), except the one at the Herald's door
import { LEVELS, T, TS, SEA_ONLY } from '../src/level.js';

const SEA_DECO = new Set(['coralTuft', 'barnacleRock', 'kelp', 'shell']);
const NOT_FOE = new Set(['coin', 'deco', 'sign', 'check', 'npc', 'mover', 'silver', 'stray', 'gate', 'sluice', 'relic', 'key', 'mend', 'lockgate', 'doorway', 'seabell']);
const fails = [], say = (rule, msg) => fails.push(rule.padEnd(8) + ' ' + msg);
const solid = t => t === T.SOLID || t === T.CRATE || t === T.PLANK || t === T.ONEWAY || t === T.PORT;

for (const lv of LEVELS) {
  if (!lv.build) continue;
  const L = lv.build(); if (!L.fresh && !L.bore && lv.id !== 'longwater') continue;
  const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
  if (L.fresh) {
    const [a, b] = L.fresh, inF = e => e.x >= a && e.x <= b;
    for (const e of L.ents) { if (!inF(e)) continue;
      if (SEA_ONLY.has(e.t)) say('fresh', lv.id + ': a ' + e.t + ' at ' + e.x + ',' + e.y + ' in fresh water (' + a + '-' + b + ')');
      if (e.t === 'deco' && SEA_DECO.has(e.kind)) say('fresh', lv.id + ': ' + e.kind + ' at ' + e.x + ',' + e.y + ' in fresh water'); }
    if (lv.id === 'longwater') { const town = L.ents.find(e => e.t === 'sign' && /^SALTREACH\./.test(e.text || ''));
      if (!town) say('fresh', 'longwater: no SALTREACH sign to measure the river to');
      else if (b < town.x - 4) say('fresh', 'longwater: the fresh water stops at ' + b + ', ' + (town.x - b) + ' columns short of Saltreach (' + town.x + '): the river between is dressed as the sea'); }
  }
  if (L.bore) {
    const B = L.bore, told = L.ents.filter(e => e.t === 'sign' && /\bBORE\b/.test(e.text || '') && e.x * TS < B.x0 - 200);
    if (!told.length) say('bore', lv.id + ': nothing says what the Bore is before its roar carries (x < ' + Math.floor((B.x0 - 200) / TS) + ')');
    const crest = B.surface - B.h, safeRow = Math.floor((crest + 2) / TS);   /* a hero whose feet are at or over crest + 2 is not hit (updateBore) */
    const swimAt = x => (L.pools || []).some(p => p.swim && x * TS + 8 > p.x0 && x * TS + 8 < p.x1 && (p.bottom || 0) > B.surface);
    const x0 = Math.ceil(B.x0 / TS), x1 = Math.floor(B.x1 / TS) - 1, safe = [], low = [];
    for (let x = x0; x <= x1; x++) { let top = -1; for (let y = 1; y < L.H; y++) if (solid(at(x, y)) && !solid(at(x, y - 1))) { top = y; break; }
      if (top < 0) continue; if (top <= safeRow) safe.push(x); else if (!swimAt(x)) low.push(x); }
    for (const x of low) if (!safe.some(s => Math.abs(s - x) <= 6)) { say('bore', lv.id + ': dry ground at ' + x + ' under the Bore with no stone within six tiles'); break; }
  }
  if (lv.id !== 'longwater') continue;
  // lesson: the first swim pool, left of the swim sign, holds nothing
  const swimSign = L.ents.find(e => e.t === 'sign' && /YOU CAN SWIM/.test(e.text || ''));
  const first = (L.pools || []).filter(p => p.swim).sort((p, q) => p.x0 - q.x0)[0];
  if (first && swimSign && first.x0 < swimSign.x * TS)
    for (const e of L.ents) if (!NOT_FOE.has(e.t) && e.x * TS + 8 > first.x0 && e.x * TS + 8 < first.x1 && (e.y + 1) * TS > first.y) say('lesson', 'longwater: a ' + e.t + ' at ' + e.x + ',' + e.y + ' in the first swim pool, before the swim sign');
  // rocks: one thing to a tile, and nobody standing on a checkpoint
  const foes = L.ents.filter(e => !NOT_FOE.has(e.t)), checks = L.ents.filter(e => e.t === 'check');
  const seen = new Map(); for (const e of foes) { const k = e.x + ',' + e.y; if (seen.has(k)) say('rocks', 'longwater: ' + seen.get(k) + ' and ' + e.t + ' on one tile, ' + k); else seen.set(k, e.t); }
  for (const c of checks) for (const e of foes) if (Math.abs(e.x - c.x) <= 1 && Math.abs(e.y - c.y) <= 1) say('rocks', 'longwater: a ' + e.t + ' at ' + e.x + ',' + e.y + ' on the checkpoint at ' + c.x + ',' + c.y);
  // spacing: RULES S4 (40) and B6 (100), the Herald's door excepted
  const door = L.arena ? L.arena.wallL : Infinity, xs = checks.map(c => c.x).sort((a, b) => a - b);
  for (let i = 1; i < xs.length; i++) { const d = xs[i] - xs[i - 1];
    if (d > 100) say('spacing', 'longwater: ' + d + ' columns from the checkpoint at ' + xs[i - 1] + ' to ' + xs[i] + ' (B6: 100)');
    if (d < 40 && !(xs[i] < door && door - xs[i] <= 8)) say('spacing', 'longwater: only ' + d + ' columns from the checkpoint at ' + xs[i - 1] + ' to ' + xs[i] + ' (RULES S4: 40)'); }
}
if (fails.length) { for (const f of fails) console.log(f); console.log('\n' + fails.length + ' thing(s) wrong with the river.'); process.exitCode = 1; }
else console.log('longwater-river: the river is fresh to Saltreach, the Bore is told and has stones, the lesson pool is empty, one thing to a rock, checkpoints 40-100 apart.');
