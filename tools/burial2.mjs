/* tools/burial2.mjs — THE BURIAL CAVERNS, SECOND REWORK (claude/burial2, 2026-09-26; docs/briefs/burial-rework-2.md). Node only.
   Daniel, 2026-09-25: "The level with the buried boss still feels too long and repetitive." FAILS when:
     - it grows back past about 700 cols (curve.mjs spanOf: W + 3 x (H - 30)), or is not seven named sections of 60-130 (F1);
     - a section's backdrop is not its own, two neighbours share one, the skull-niche wall is anywhere but THE OSSUARY, or two
       backdrops meet side by side without a pillar over the join (the review's "hard vertical seams");
     - THE MACHINE is missing a part: vents that are grates in open floor, candles to take fire from, the lesson on open ground
       (a candle before the first vent and one of the dead in its light, nothing else near), dark vaults you light your way
       through (vents and a candle at the door), the dead buried where a lit vent keeps them down, and the lair's vents and
       candles (the Buried Dead's opening is a burning vent: tools/buried-dead.mjs, tools/boss-openings.mjs);
     - the sea's dead or the fields' dead stand under the hill, or no barrow soldier (THE FALLEN) does;
     - RULE S: fewer than five placements where a foe and the ground are one problem (S1); fewer than six three-tile jumps on the
       road with two over green water, or one wider than three (S2 - the real jump for every hero is tools/burial-route.mjs);
       THE ROTTEN BRIDGES is not an exam, or has a checkpoint or a free heart in it (S3); two checkpoints on the walked route
       closer than 40 tiles, or a run over 120 (S4); more free hearts than one per two checkpoints (S5). */
import assert from 'node:assert/strict';
import { LEVELS, T, TS } from '../src/level.js';
import { pacing } from './pacing.mjs';
import { VENT } from '../src/burial-expansion.js';

const lv = LEVELS.find(l => l.id === 'burial'), L = lv.build(), out = [];
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const floorish = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK;
// 1. THE CUT, AND SEVEN SECTIONS
const span = L.W + 3 * Math.max(0, L.H - 30);
assert(span <= 720, 'the caverns grew back: ' + L.W + 'x' + L.H + ' is ' + span + ' cols (it was 1,386; the plan is about 700)');
const S = L.burialSections || [], EXAM = (S.find(s => s[0] === 'THE ROTTEN BRIDGES') || []).slice(1, 3);
assert.equal(S.length, 7, 'F1 wants seven named sections: ' + S.map(s => s[0]));
for (const [name, x0, x1] of S) assert(x1 - x0 + 1 >= 60 && x1 - x0 + 1 <= 130, name + ' is ' + (x1 - x0 + 1) + ' cols (F1: 60-100, a descent 130 at most)');
out.push(span + ' cols (' + L.W + 'x' + L.H + '), ' + S.length + ' sections');
// 2. ONE BACKDROP A SECTION, AND A PILLAR AT EVERY SEAM
{ const LOOKS = new Set(['barrow', 'ossuary', 'crypt', 'bonestair', 'procession']);
  for (const r of L.interiors) assert(LOOKS.has(r[4]), 'a room in the caverns wears ' + r[4]);
  const secOf = r => S.find(([, x0, x1, y0, y1]) => r[0] >= x0 - 1 && r[1] <= x1 + 1 && r[2] >= y0 - 1 && r[3] <= y1 + 1);
  for (const r of L.interiors) { const s = secOf(r); assert(s, 'a room outside every section: ' + r.join(','));
    assert.equal(r[4], s[5], 'a room in ' + s[0] + ' wears ' + r[4] + ', not its own ' + s[5]); }
  for (let i = 1; i < S.length; i++) assert.notEqual(S[i][5], S[i - 1][5], S[i - 1][0] + ' and ' + S[i][0] + ' share a backdrop');
  assert.equal(S.filter(s => s[5] === 'ossuary').length, 1, 'the skull-niche wall belongs to THE OSSUARY alone');
  assert.equal(new Set(S.map(s => s[5])).size, 5, 'five backdrops: ' + [...new Set(S.map(s => s[5]))]);
  let seams = 0; for (const a of L.interiors) for (const b of L.interiors) if (a[4] !== b[4] && a[1] + 1 === b[0] && Math.min(a[3], b[3]) > Math.max(a[2], b[2])) { seams++;
    assert(L.structures.some(z => z.kind === 'seam' && z.x0 <= b[0] && z.x1 >= b[0] - 1 && z.top <= Math.max(a[2], b[2]) && z.floor >= Math.min(a[3], b[3])), 'a bare seam at column ' + b[0] + ' between ' + a[4] + ' and ' + b[4]); }
  assert(seams >= 2, 'the section walls meet in fewer places than they should: ' + seams);
  out.push(new Set(S.map(s => s[5])).size + ' backdrops, ' + seams + ' seams pillared'); }
// 3. THE MACHINE
const V = L.gasVents || [], C = L.candles || [], vx = v => v.x, inX = (x, a, b) => x >= a && x <= b;
const buried = L.ents.filter(e => (e.t === 'zombie' || e.t === 'husk') && e.buried);
const lightOf = (x, y) => V.find(v => Math.hypot((x - v.x) * TS, (y - v.y + 1) * TS) < VENT.light);
{ assert(V.length >= 10, 'gas vents: ' + V.length); assert(C.length >= 5, 'candles: ' + C.length);
  for (const v of V) { assert(at(v.x, v.y) === T.SOLID && at(v.x, v.y - 1) === T.AIR && at(v.x, v.y - 2) === T.AIR, 'the vent at ' + v.x + ',' + v.y + ' is not a grate in open floor'); assert(!(v.litT > 0), 'a vent starts lit'); }
  for (const c of C) assert(at(c.x, c.y) === T.AIR && floorish(at(c.x, c.y + 1)), 'the candle at ' + c.x + ',' + c.y + ' does not stand on floor');
  /* THE LESSON: the first vent on the road, a candle before it, one of the dead in its light, and nothing else that fights within twelve tiles */
  const first = V.slice().sort((a, b) => a.x - b.x)[0], FOES = new Set(['zombie', 'husk', 'corpse', 'bonearcher', 'bonegob', 'boo', 'bat', 'spider', 'wight', 'haunt']);
  assert(C.some(c => c.x < first.x && first.x - c.x <= 10), 'no candle before the first vent: the lesson has no fire');
  const lessonFoes = L.ents.filter(e => FOES.has(e.t) && Math.abs(e.x - first.x) <= 12 && Math.abs(e.y - first.y) <= 8);
  assert(lessonFoes.length === 1 && lessonFoes[0].buried && lightOf(lessonFoes[0].x, lessonFoes[0].y) === first, 'the lesson is not on open ground with one of the dead in the vent\'s light: ' + lessonFoes.map(e => e.t + '@' + e.x).join(' '));
  /* THE DARK VAULTS: you light your way through them */
  assert((L.darkZones || []).length >= 2, 'dark vaults: ' + (L.darkZones || []).length);
  for (const z of L.darkZones) { const a = z.x0 / TS, b = z.x1 / TS, vs = V.filter(v => inX(v.x, a, b));
    assert(vs.length >= 2, z.name + ' has ' + vs.length + ' vents: nothing to light your way with');
    assert(C.some(c => inX(c.x, a - 2, a + 8)), z.name + ' has no candle at its door');
    assert(buried.some(e => inX(e.x, a, b) && lightOf(e.x, e.y)), z.name + ' has none of the dead where a lit vent keeps them down'); }
  const kept = buried.filter(e => lightOf(e.x, e.y));
  assert(kept.length >= 5, 'the dead buried where a lit vent keeps them down: ' + kept.length);
  /* THE LAIR: three vents in his floor and a candle at each wall - the opening is lit, not waited for (A11) */
  const A = L.arena, av = V.filter(v => v.x * TS > A.x0 && v.x * TS < A.x1 && v.y === A.floor / TS), ac = C.filter(c => c.x * TS >= A.x0 && c.x * TS < A.x1);
  assert(av.length >= 3, 'the lair has ' + av.length + ' vents in his floor'); assert(ac.length >= 2, 'the lair has ' + ac.length + ' candles');
  out.push(V.length + ' vents, ' + C.length + ' candles, ' + kept.length + ' of the dead in a vent\'s light, ' + L.darkZones.length + ' dark vaults, the lair ' + av.length + '/' + ac.length); }
// 4. WHO IS UNDER THE HILL
{ const wrong = L.ents.filter(e => ['bonecorsair', 'tidemarauder', 'lanternshade', 'wight'].includes(e.t)).map(e => e.t + '@' + e.x + ',' + e.y);
  assert.deepEqual(wrong, [], 'the sea\'s dead or the fields\' dead under the hill: ' + wrong.join(' '));
  const soldiers = L.ents.filter(e => e.t === 'corpse'); assert(soldiers.length >= 3 && soldiers.every(e => e.risen || L.risenDead), 'barrow soldiers (THE FALLEN, risen): ' + soldiers.length);
  out.push(soldiers.length + ' barrow soldiers, no sea dead'); }
// 5. S1: A FOE WHERE THE GROUND MAKES IT WORSE
const harm = (L.pools || []).filter(p => p.harm), pitOf = p => [p.x0 / TS, p.x1 / TS - 1, p.y / TS - 1];
{ const why = [];
  for (const e of L.ents) { if (!['zombie', 'husk', 'corpse', 'bonearcher', 'bonegob', 'boo', 'spider'].includes(e.t) || e.garrison) continue;
    const landing = harm.find(p => { const [a, b, fl] = pitOf(p); return Math.abs(e.y - fl) <= 1 && e.x > b && e.x - b <= 4; });
    const covering = (e.t === 'bonearcher' || e.t === 'bonegob') && harm.find(p => { const [a, b, fl] = pitOf(p); return e.y <= fl - 3 && Math.abs(e.x - (a + b) / 2) <= 14; });
    const pier = (L.crumble || []).length > 1 && L.crumble.some((z, i) => i && e.x > L.crumble[i - 1].x1 && e.x < z.x0 && Math.abs(e.y - (z.row - 1)) <= 1);
    const r = landing ? 'at the landing of a jump over green water' : covering ? 'shooting over a jump' : pier ? 'holding the pier between two rotten spans' : null;
    if (r) why.push(e.t + '@' + e.x + ',' + e.y + ' ' + r); }
  assert(why.length >= 5, 'S1 wants five placements where a foe and the ground are one problem: ' + why.join('; '));
  out.push('S1: ' + why.length + ' placements'); }
// 6. S2: JUMPS THAT CAN FAIL, NONE PAST THREE
{ const jumps = [];
  for (const p of harm) { const [a, b, fl] = pitOf(p), w = b - a + 1; if ((L.crumble || []).some(z => z.x0 > a && z.x1 < b)) continue;   /* a span with boards is walked, not jumped */
    if (floorish(at(a - 1, fl + 1)) && floorish(at(b + 1, fl + 1))) jumps.push({ a, b, w, fl }); }
  assert(jumps.length >= 6, 'S2 wants six jumps of 2.5 tiles or more: ' + jumps.length);
  assert(jumps.filter(j => j.w >= 3).length >= 6 && jumps.every(j => j.w <= 3), 'S2: every road jump three tiles, never more: ' + jumps.map(j => j.a + '+' + j.w).join(' '));
  out.push('S2: ' + jumps.length + ' three-tile jumps over green water'); }
// 7. S3: THE ROTTEN BRIDGES IS THE EXAM
{ const [x0, x1] = EXAM, inE = e => e.x > x0 + 3 && e.x <= x1, A = L.arena;
  assert(V.filter(v => inX(v.x, x0, x1)).length >= 3, 'the exam has fewer than three vents'); assert((L.crumble || []).every(z => inX(z.x0, x0, x1)), 'the rotten bridges are not in the exam');
  assert(harm.filter(p => inX(p.x0 / TS, x0, x1)).length >= 4, 'the exam has too little green water');
  assert(L.ents.some(e => e.t === 'check' && Math.abs(e.x - x0) <= 3), 'no checkpoint at the exam\'s door');
  assert(L.ents.some(e => e.t === 'check' && e.x < A.wallL && e.x >= A.wallL - 4), 'no checkpoint outside the arena');
  assert.deepEqual(L.ents.filter(e => e.t === 'check' && inE(e)).map(e => e.x), [], 'checkpoints inside the exam');
  assert(!L.ents.some(e => e.t === 'mend' && !e.stash && inE(e)), 'a free heart in the exam (S5)');
  assert(x1 - x0 + 1 >= 60 && x1 - x0 + 1 <= 100, 'the exam is ' + (x1 - x0 + 1) + ' cols (S3: the last 60-100)');
  out.push('S3: the exam ' + x0 + '-' + x1); }
// 8. S4 and S5 along the walked route
{ const r = pacing(lv), c = r.stats.checkAt, gaps = c.slice(1).map((v, i) => [c[i], v]), close = gaps.filter(([a, b], i) => b - a < 40 && i < gaps.length - 1);
  assert.deepEqual(close, [], 'S4: checkpoints closer than 40 route tiles: ' + JSON.stringify(close));
  assert(r.stats.maxCheckGap <= 120, 'S4/B6: a run of ' + r.stats.maxCheckGap + ' route tiles with no checkpoint');
  assert.equal(r.stats.checksOnRoute, r.stats.checksTotal, 'a checkpoint off the walked route');
  const free = L.ents.filter(e => e.t === 'mend' && !e.stash).length;
  assert(free <= Math.floor(c.length / 2), 'S5: ' + free + ' free hearts for ' + c.length + ' checkpoints');
  out.push('S4: ' + c.length + ' checkpoints over ' + Math.round(r.cum[r.cum.length - 1]) + ' route tiles, closest pair ' + Math.min(...gaps.slice(0, -1).map(([a, b]) => b - a)) + ', worst gap ' + r.stats.maxCheckGap + '; S5: ' + free + ' free hearts'); }
console.log('burial2  ' + out.join('; '));
