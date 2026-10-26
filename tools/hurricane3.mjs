// tools/hurricane3.mjs - THE HURRICANE DECK 3 (claude/hurricane3): the storm CHANGES the level, and every one of its systems is a REQUIRED verb (A4). Node only.
// (the page half is tools/storm-ship-runtime.mjs: tools/fixtures/ship-browser.js plays the foremast, the flood, the lashing, rod 1, the sinking and the Captain 3.)
//   1 SHE SINKS: the outside sea is deadly (harm + swim + seaKill: the quiet drain) and its steps only rise; every shrine names the step it wakes to; his fight's sea
//     climbs his yards (the topsail at phase two, the topgallant at three) and never reaches the royal.
//   2 THE REQUIRED USES: with one system taken away the road is cut where the level says it is - the waist's FLOOD (the galley roof), the freed CASK (the fore house
//     roof), ROD 1 (the tarred net: the gun deck and the eye), ROD 2 (the felled mizzen topmast: the stays) - and with all of them the boss is reached (reach-heroes:
//     every hero).
//   3 THE ROLL and THE WIND carry the jumps they are built for: every roll gap and gust gap is wider than every hero's plain jump and inside its carry.
//   4 THE MAINMAST TOP: three yards, every pair joined by a net, the masthead rod's column across every yard, the royal at least 16 wide.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
const TS = 16, lv = LEVELS.find(l => l.id === 'hurricane'), L = lv.build(), K = L.h3;
assert(K, 'L.h3: the Hurricane 3 systems');
// 1. SHE SINKS
const sea = L.pools.find(p => p.h3sea); assert(sea && sea.harm && sea.swim && sea.seaKill, 'the sea outside her is deadly: harm + swim (the drain) + seaKill (no road in it)');
const st = K.sink.steps; for (let i = 1; i < st.length; i++) assert(st[i] < st[i - 1], 'her sinking steps only rise: ' + st.join(','));
assert(K.sink.rise.cap < st[st.length - 1], 'the rising sea climbs past the last step');
assert.equal(K.sink.at.length, st.length - 1, 'every step after the first is crossed somewhere (a told trigger box)');
for (const e of L.ents.filter(e => e.t === 'check')) assert(K.checkSteps.some(([x, y]) => Math.hypot(x - e.x, y - e.y) < 3), 'the shrine at ' + e.x + ',' + e.y + ' names the step it wakes to (L.h3.checkSteps)');
const A = L.arena, tiers = A.tiers; assert.equal(tiers.length, 3, 'three yards: topsail, topgallant, royal');
const fy = K.sink.fight; assert(fy[1] < tiers[0].row * TS - 8 && fy[2] < tiers[1].row * TS - 8 && fy[2] > tiers[2].row * TS + 16, 'his fight\'s sea drowns the topsail at phase two, the topgallant at three, and never the royal: ' + fy.join(','));
assert(K.sink.rise.cap > (L.ents.find(e => e.t === 'check' && e.y === 23) || { y: 23 }).y * TS + TS, 'the rising sea stops under the main top\'s shrine before his fight');
// 2. THE REQUIRED USES
const reach = (Lx, x, y) => floodReach(Lx, T, { rides: true }).jumpNear(x, y);
assert(reach(L, 306, 18) || reach(L, 300, 18), 'with every system the Captain\'s yard is reached');
{ const L2 = lv.build(); const p = L2.pools.find(q => q.h3flood); p.y = p.base; assert(!reach(L2, 158, 32), 'the waist DRAINED: the galley roof is not reached (the flood is the way on)'); assert(reach(L, 158, 32), 'flooded, the galley roof is reached'); }
{ const L2 = lv.build(); L2.caskSteps = []; assert(!reach(L2, 84, 31), 'no cask fetched up: the fore house roof is not reached (the lashing is the way on)'); assert(reach(L, 84, 31), 'the freed cask is a step to the fore house roof'); }
{ const L2 = lv.build(); L2.reachDoors = L2.reachDoors.filter(d => d.x0 !== 286); assert(!reach(L2, 352, 35), 'the tarred net unburnt: the eye is not reached (rod 1 is the way on)'); }
{ const L2 = lv.build(); L2.felled = L2.felled.filter(F => F.rod !== 'r2'); assert(!reach(L2, 436, 23), 'the mizzen topmast standing: the stays are not reached (rod 2 is the way on)'); assert(reach(L, 436, 23), 'felled, the stays are reached'); }
const rod2 = L.felled.find(F => F.rod === 'r2'); assert(rod2 && K.rods.find(r => r.id === 'r2' && r.fell === L.felled.indexOf(rod2)), 'rod 2 fells the mizzen topmast (L.felled[rod 2])');
const r1 = K.rods.find(r => r.id === 'r1'); for (let y = r1.burn[2]; y <= r1.burn[3]; y++) for (let x = r1.burn[0]; x <= r1.burn[1]; x++) assert.equal(L.grid[y * L.W + x], T.PORT, 'rod 1 burns the tarred net (laid as a barred door, open in the full fill): ' + x + ',' + y);
// 3. THE ROLL AND THE WIND
for (const z of L.rollGaps) { const row = Math.round(z.y1 / TS); let x = Math.floor(z.x0 / TS), run = 0, best = 0; for (; x <= Math.ceil(z.x1 / TS); x++) { const t = L.grid[row * L.W + x]; if (t === T.AIR) { run++; best = Math.max(best, run); } else run = 0; }
  assert(best >= 5 && best <= 3 + z.carry, 'a roll gap is wider than any plain jump (5+) and inside her heel\'s carry: ' + best + ' at ' + z.x0 / TS); }
for (const z of L.gusts.filter(g => g.h3 === 'g1' || g.h3 === 'g2')) assert(z.told && z.air && z.carry >= 3, 'a gust over the stays is told and carries a jump: ' + z.h3);
assert(K.sails.length >= 4 && K.sails.every(s => L.gusts[s.gust]), 'every gust that matters has a sail that snaps in its tell');
// 4. THE MAINMAST TOP
for (let i = 0; i + 1 < tiers.length; i++) assert(A.nets.some(([x0, x1, y0, y1]) => y0 <= tiers[i + 1].row && y1 >= tiers[i].row - 1), 'a net joins yard ' + i + ' to yard ' + (i + 1));
for (const t of tiers) assert(A.rod[0] >= t.x0 && A.rod[1] <= t.x1, 'the rod\'s column crosses every yard');
assert(tiers[2].x1 - tiers[2].x0 + 1 >= 16, 'the royal yard, his last, is at least 16 wide');
console.log('hurricane3: she sinks in ' + st.length + ' told steps then chases you up to the main top; the flood, the lashing, rod 1 and rod 2 are each the only way on; ' + L.rollGaps.length + ' roll gaps and the stays\' gusts carry what they are built for; his three yards are joined and under the rod.');
