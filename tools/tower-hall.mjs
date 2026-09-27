// tools/tower-hall.mjs - THE UNDEAD ARCHMAGE'S HALL IS AT THE TOP OF THE TOWER, AND NOTHING WALKS INTO IT (Falling Tower round 3).
// Node only. Daniel (2026-09-27): "move his arena higher in the tower so walking foes cannot wander in". It sat on the crown - its
// burning floor at row 50, the parapet walk at row 51 - so what walked the crown's last tiers stood with its head in his fire.
//   GAP      the built grid: across the hall's whole width, the highest ground under its floor is HALL_GAP rows down or more
//            (more than twice any walker's jump), and nothing at all is built inside the hall's own rows
//   SPAWNS   no creature but him starts in the hall or in the gap under it
//   SEALED   while his fight is on, a creature below the hall's floor is held (src/tower-hall.js hallHolds), and main.js asks it in
//            the foe loop BEFORE the 420 px freeze - which is horizontal, and would let the crown's flyers rise straight up into it
//   PLACE    the hall is over the crown and under the desert, and the desert is still ten rows over it (round 2's rule, kept)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { TOWER, SAND } from '../src/tower-ascent.js';
import { HALL_GAP, hallHolds } from '../src/tower-hall.js';
import { carpetBox } from '../src/carpet.js';

const L = LEVELS.find(l => l.id === 'fallingtower').build(), A = L.arena, TS = 16, W = L.W;
const at = (x, y) => L.grid[y * W + x];
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
ok(A && A.carpet && A.hall, 'the sky fight is not flagged as his hall (arena.hall)');
const fr = Math.round(A.floor / TS), top = Math.floor(A.y0 / TS), c0 = Math.floor(A.x0 / TS), c1 = Math.ceil(A.x1 / TS) - 1;

// ---- GAP ----
let minGap = Infinity, where = null;
for (let x = Math.max(0, c0); x <= Math.min(W - 1, c1); x++) {
  for (let y = top; y < fr; y++) if (at(x, y) !== T.AIR) ok(false, 'something is built inside his hall at ' + x + ',' + y + ' (tile ' + at(x, y) + ')');
  let y = fr; while (y < L.H && at(x, y) === T.AIR) y++;
  if (y - fr < minGap) { minGap = y - fr; where = [x, y]; } }
ok(minGap >= HALL_GAP, 'the highest ground under his hall is ' + minGap + ' rows below its floor (at ' + where + '): a walker on it has its head in his fire (need ' + HALL_GAP + ')');

// ---- SPAWNS ----
const NOT = new Set(['undeadmage', 'coin', 'silver', 'check', 'sign', 'gate', 'deco', 'glyph', 'stal', 'torch', 'mend']);
for (const e of L.ents) { if (NOT.has(e.t)) continue;
  if (e.x >= c0 && e.x <= c1 && e.y >= top && e.y < fr + HALL_GAP) ok(false, e.t + ' starts in his hall or the gap under it: ' + e.x + ',' + e.y); }
ok(L.ents.some(e => e.t === 'undeadmage' && e.y >= top && e.y < fr), 'he does not wait in his own hall');
const box = carpetBox(A, 0), sp = L.sanctum.spawn; ok(sp.x > box.x0 && sp.x < box.x1 && sp.y > box.y0 && sp.y < box.y1, 'the door does not put you in the hall');

// ---- SEALED ----
const boss = { t: 'undeadmage' }, below = { t: 'tome', y: A.floor + 40 }, inside = { t: 'tome', y: A.floor - 40 };
ok(hallHolds(A, true, below, boss), 'a creature below the floor is not held while he fights');
ok(!hallHolds(A, false, below, boss), 'the crown is held when there is no fight');
ok(!hallHolds(A, true, boss, boss), 'he is held in his own fight');
ok(!hallHolds(A, true, inside, boss), 'something already in the hall is held (it must still be fought)');
ok(!hallHolds({ ...A, hall: false }, true, below, boss), 'another arena is held by a rule that is only his');
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), i = src.indexOf('if (hallSealed(e)) continue;'), j = src.indexOf('if (Math.abs(e.x - P.x) > 420 && (!SETTLED_FOES');
  ok(i > 0 && j > i && j - i < 400, "main.js's foe loop does not hold the crown out of his hall before the 420 px freeze");
  ok(/const hallSealed = e => hallHolds\(L\.arena, bossActive, e, boss\)/.test(src), 'hallSealed does not ask hallHolds with the live fight'); }

// ---- PLACE ----
ok(fr < TOWER.SKY - HALL_GAP, 'the hall is not over the crown');
ok(top - SAND.deep >= 10, 'the desert is less than ten rows over his hall (' + (top - SAND.deep) + '): the fight would see it');

if (fails.length) { for (const f of fails) console.log('FAIL ' + f); console.log(fails.length + ' FAILED'); process.exitCode = 1; }
else console.log('ok  tower-hall   his hall is rows ' + top + '-' + fr + ', ' + minGap + ' rows clear over the crown, nothing starts in it or under it, and the crown is held out while he fights');
