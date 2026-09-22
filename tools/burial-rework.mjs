/* tools/burial-rework.mjs — THE BURIAL CAVERNS GO DOWN (batch 4b, 2026-09-22). Brief: .claude/briefs/burial-rework.md.
   Daniel: "it's mostly just walk right". Proves, by the map:
     1. the reachable band spans 40+ rows (it was 22-48), and the road really goes down: seal the rotten floor and the Buried
        Dead cannot be reached - the descent is the only way on
     2. the three depths are walked: the Barrow, the Charnel Galleries (rows 37-58), the Drowned Ossuary (rows 64-100)
     3. the grave candles: three, one a depth, each with its silver, all reachable; the quest is theirs
     4. THE GRAVE WARDEN holds his vault: reachable with his door shut, and his door holds the way on
     5. one sealed-crypt ambush (the house rule is one a level), coffin lifts and swinging chains in the deep, the new mix
   The Warden's fight and opening: tools/boss-openings.mjs; his pilot (21+ runs, normal health): tools/grave-warden-pilot.mjs. */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { DESCENT } from '../src/burial-rework.js';

const build = () => LEVELS.find(l => l.id === 'burial').build();
const L = build(), R = floodReach(L, T, { rides: true }), seen = [...R.seen].map(k => k.split(',').map(Number));
const reached = (x, y) => R.seen.has(x + ',' + y), rows = seen.map(([, y]) => y);
const band = [Math.min(...rows), Math.max(...rows)];
assert.ok(L.H >= 100, 'the hill is deep now: H ' + L.H);
assert.ok(band[1] - band[0] >= 40, 'the reachable band spans 40+ rows: ' + band.join('-'));
// 1. the descent is the only way on
{ const S = build(); for (let x = 599; x <= 602; x++) S.grid[32 * S.W + x] = T.SOLID;
  const Rs = floodReach(S, T, { rides: true }), t = Math.floor(S.arena.trigger / 16);
  assert.ok(![...Rs.seen].some(k => +k.split(',')[0] >= t), 'seal the rotten floor and the Buried Dead cannot be reached'); }
// 2. the three depths
const inRows = (a, b, x0, x1) => seen.filter(([x, y]) => y >= a && y <= b && x >= x0 && x <= x1).length;
assert.ok(inRows(16, 48, 0, 597) > 200, 'the Barrow is walked');
assert.ok(inRows(37, 58, DESCENT.x0, DESCENT.x1) > 150, 'the Charnel Galleries are walked: ' + inRows(37, 58, DESCENT.x0, DESCENT.x1));
assert.ok(inRows(64, 100, DESCENT.oss[0], DESCENT.oss[1]) > 100, 'the Drowned Ossuary is walked: ' + inRows(64, 100, DESCENT.oss[0], DESCENT.oss[1]));
// 3. the candles
const candles = L.ents.filter(e => e.t === 'stray' && e.kind === 'lamp'), silvers = L.ents.filter(e => e.t === 'silver');
assert.equal(candles.length, 3, 'three grave candles'); assert.equal(L.quest.n, 3); assert.equal(L.quest.item, 'lamp');
for (const c of candles) { assert.ok(reached(c.x, c.y), 'candle reachable at ' + c.x + ',' + c.y); assert.ok(silvers.some(s => Math.abs(s.x - c.x) <= 3 && Math.abs(s.y - c.y) <= 1), 'a silver beside the candle at ' + c.x); }
const depthOf = y => y <= 48 ? 'barrow' : y <= 60 ? 'charnel' : 'ossuary';
assert.deepEqual(new Set(candles.map(c => depthOf(c.y))).size, 3, 'one candle a depth');
assert.equal(silvers.length, 3, 'three silvers');
// 4. the Grave Warden
assert.equal(L.mini.boss, 'gravewarden'); const W = L.ents.find(e => e.t === 'gravewarden' && e.mini); assert.ok(W, 'he is placed, marked the mini');
assert.equal(L.grid[(L.mini.floor / 16 - 1) * L.W + L.mini.gate], T.PORT, 'his door is a portcullis');
{ const S = build(); for (let i = 0; i < S.grid.length; i++) if (S.grid[i] === T.PORT && i % S.W < 800) S.grid[i] = T.SOLID;
  const Rs = floodReach(S, T, { rides: true }), t = Math.floor(S.arena.trigger / 16);
  assert.ok(Rs.jumpNear(W.x, W.y), 'he can be reached with his door shut');
  assert.ok(![...Rs.seen].some(k => +k.split(',')[0] >= t), 'and his door holds the way on'); }
assert.equal((L.graves || []).length, 3, 'three open graves in his floor');
// 5. the rest of the brief
assert.equal((L.ambushes || []).length, 1, 'one sealed-crypt ambush (the house rule)');
assert.ok(L.ents.filter(e => e.t === 'mover' && e.vert).length >= 6, 'coffin lifts in the ossuary and the shaft');
assert.ok((L.moversExtra || []).filter(m => m.kind === 'swing').length >= 3, 'swinging chains over the black water');
const n = t => L.ents.filter(e => e.t === t).length;
assert.ok(n('zombie') < 50, 'fewer walking dead: ' + n('zombie')); assert.ok(n('bonearcher') >= 10 && n('bonegob') >= 10 && n('spider') >= 6, 'archers, skull-throwers, ceiling spiders: ' + [n('bonearcher'), n('bonegob'), n('spider')]);
assert.ok(!L.pools.some(p => p.deadly), 'no deadly water in the caverns');
console.log('the caverns go down: band ' + band.join('-') + ', zombies ' + n('zombie') + ', archers ' + n('bonearcher') + ', skull-throwers ' + n('bonegob') + ', spiders ' + n('spider'));
