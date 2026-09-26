/* tools/burial-rework.mjs — THE BURIAL CAVERNS GO DOWN (batch 4b, 2026-09-22; re-laid by claude/burial2, 2026-09-26, into
   src/burial-caverns.js, the descent kept whole under a road cut to half its length). Proves, by the map:
     1. the reachable band spans 40+ rows, and the road really goes down: seal the rotten floor and the Buried Dead cannot be
        reached - the descent is the only way on
     2. the three depths are walked: the road (the Candle Path and the Ossuary), the Charnel Galleries, the Drowned Ossuary
     3. the grave candles: three, one a depth, each with its silver, all reachable; the quest is theirs
     4. THE GRAVEYARD KEEPER holds his vault: reachable with his door shut, and his door holds the way on
     5. one sealed-gallery ambush (the house rule is one a level), coffin lifts and swinging chains in the deep, the mix of the dead
   The Keeper's fight and opening: tools/boss-openings.mjs; his pilot: tools/grave-warden-pilot.mjs. The level's rule S and its machine:
   tools/burial2.mjs. */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { DESCENT } from '../src/burial-caverns.js';

const build = () => LEVELS.find(l => l.id === 'burial').build();
const L = build(), R = floodReach(L, T, { rides: true }), seen = [...R.seen].map(k => k.split(',').map(Number));
const reached = (x, y) => R.seen.has(x + ',' + y), rows = seen.map(([, y]) => y);
const band = [Math.min(...rows), Math.max(...rows)];
assert.ok(band[1] - band[0] >= 40, 'the reachable band spans 40+ rows: ' + band.join('-'));
// 1. the descent is the only way on
{ const S = build(); for (let x = DESCENT.hole[0]; x <= DESCENT.hole[1]; x++) S.grid[22 * S.W + x] = T.SOLID;
  const Rs = floodReach(S, T, { rides: true }), t = Math.floor(S.arena.trigger / 16);
  assert.ok(![...Rs.seen].some(k => +k.split(',')[0] >= t), 'seal the rotten floor and the Buried Dead cannot be reached'); }
// 2. the three depths
const inRows = (a, b, x0, x1) => seen.filter(([x, y]) => y >= a && y <= b && x >= x0 && x <= x1).length;
assert.ok(inRows(6, 21, 0, DESCENT.hole[1]) > 200, 'the road is walked');
assert.ok(inRows(DESCENT.hall[2], 44, DESCENT.hall[0], DESCENT.hall[1]) > 150, 'the Charnel Galleries are walked: ' + inRows(DESCENT.hall[2], 44, DESCENT.hall[0], DESCENT.hall[1]));
assert.ok(inRows(DESCENT.oss[2], DESCENT.oss[3], DESCENT.oss[0], DESCENT.oss[1]) > 100, 'the Drowned Ossuary is walked: ' + inRows(DESCENT.oss[2], DESCENT.oss[3], DESCENT.oss[0], DESCENT.oss[1]));
// 3. the candles
const candles = L.ents.filter(e => e.t === 'stray' && e.kind === 'lamp'), silvers = L.ents.filter(e => e.t === 'silver');
assert.equal(candles.length, 3, 'three grave candles'); assert.equal(L.quest.n, 3); assert.equal(L.quest.item, 'lamp');
for (const c of candles) { assert.ok(reached(c.x, c.y), 'candle reachable at ' + c.x + ',' + c.y); assert.ok(silvers.some(s => Math.abs(s.x - c.x) <= 3 && Math.abs(s.y - c.y) <= 1), 'a silver beside the candle at ' + c.x); }
const depthOf = y => y <= 24 ? 'road' : y <= 44 ? 'charnel' : 'ossuary';
assert.deepEqual(new Set(candles.map(c => depthOf(c.y))).size, 3, 'one candle a depth');
assert.equal(silvers.length, 3, 'three silvers');
// 4. the Graveyard Keeper
assert.equal(L.mini.boss, 'gravewarden'); const W = L.ents.find(e => e.t === 'gravewarden' && e.mini); assert.ok(W, 'he is placed, marked the mini');
assert.equal(L.grid[(L.mini.floor / 16 - 1) * L.W + L.mini.gate], T.PORT, 'his door is a portcullis');
{ const S = build(); for (let i = 0; i < S.grid.length; i++) if (S.grid[i] === T.PORT && i % S.W < S.arena.wallL) S.grid[i] = T.SOLID;
  const Rs = floodReach(S, T, { rides: true }), t = Math.floor(S.arena.trigger / 16);
  assert.ok(Rs.jumpNear(W.x, W.y), 'he can be reached with his door shut');
  assert.ok(![...Rs.seen].some(k => +k.split(',')[0] >= t), 'and his door holds the way on'); }
assert.equal((L.graves || []).length, 3, 'three open graves in his floor');
// 5. the rest of the brief
assert.equal((L.ambushes || []).length, 1, 'one sealed-gallery ambush (the house rule)');
assert.ok(L.ents.filter(e => e.t === 'mover' && e.vert).length >= 6, 'coffin lifts in the ossuary and the shaft');
assert.ok((L.moversExtra || []).filter(m => m.kind === 'swing').length >= 3, 'swinging chains over the black water');
const n = t => L.ents.filter(e => e.t === t).length;
assert.ok(n('zombie') < 50, 'fewer walking dead: ' + n('zombie')); assert.ok(n('bonearcher') >= 8 && n('bonegob') >= 5 && n('spider') >= 5, 'archers, skull-throwers, ceiling spiders: ' + [n('bonearcher'), n('bonegob'), n('spider')]);
assert.ok(!L.pools.some(p => p.deadly), 'no deadly water in the caverns');
console.log('the caverns go down: band ' + band.join('-') + ', zombies ' + n('zombie') + ', archers ' + n('bonearcher') + ', skull-throwers ' + n('bonegob') + ', spiders ' + n('spider'));
