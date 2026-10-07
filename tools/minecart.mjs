// tools/minecart.mjs - THE DEEP RAILS' own check (claude/minecart). Node only: no page, no port, no Chrome. The built level and the pure modules:
//   - the rule line is the code's (LEVELS row == src/minecart.js header); a side road off the Ore Road (a map spur); the arcs teach -> test -> remix -> exam
//   - THE POINTS: a REQUIRED fork (its default line runs into a fall-in), a risk/reward fork, a hidden lever in the roof, the smelter's lever wants 8 ore
//   - SPEED: every boost gap is wider than a cruising jump and narrower than a boosted one (the cart's numbers; tools/minecart-route.mjs --probe measures
//     it in the page), a crusher on the line before the first fork, a timed gate, rockfalls; each EXAM zone holds a boost gap (a real death)
//   - CART COMBAT: the riders are EXISTING foes (archer, gobmage) on a line that exists where they wait; no new foe type
//   - the collectible: ten ore, the quest wants eight, three silvers, no relic; stations one a section (80..200 route tiles: tools/checkpoint-gaps.mjs)
//   - THE GREAT DRILL (src/great-drill.js): an ore cart on the LOW line jams it, on the MID line it is eaten; the jam opens the cab (x2, capped), a told ward
//     follows and the points are knocked back; the cab is hittable whenever it is not warded (B13); the bot sets the points for an ore cart
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { THREAT } from '../src/threat.js';
import { MC, BOOST_GAP, SECTIONS, ARCS, cartSpeed } from '../src/minecart.js';
import * as GD from '../src/great-drill.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'minecart'); ok(lv, 'minecart is in LEVELS'); ok(lv.needs === 'oreroad', 'THE DEEP RAILS needs THE ORE ROAD (it is ' + lv.needs + ')');
ok(LEVELS.find(l => l.id === 'storm').needs === 'oreroad', 'Stormhold still needs the Ore Road: the Deep Rails is a side road, not the road');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(/id: 'minecart', kind: 'level'[^\n]*spur: true/.test(main), 'the map node is a SPUR off the road');
const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const stand = t => t === T.SOLID || t === T.RAIL || t === T.ONEWAY || (t >= 20 && t <= 25);
/* THE RULE LINE is the code's */
const src = readFileSync(new URL('../src/minecart.js', import.meta.url), 'utf8');
ok(src.includes('// THE RULE: ' + lv.rule), 'the rule line in LEVELS is the one src/minecart.js states: ' + lv.rule);
ok(/POINTS/.test(lv.rule) && /BRAKES/.test(lv.rule) && /BOOSTS/.test(lv.rule), 'the rule line names the verb (the points) and the cart (brake, boost)');
ok(L.minecart && L.music === 'mineworks', "all cart (L.minecart) and its own track ('mineworks', HorrorPen, CC-BY)");
/* THE ARCS */
for (const k of ['points', 'speed', 'combat']) ok(['teach', 'test', 'remix', 'exam', 'boss'].every(s => ARCS[k][s]), 'the ' + k + ' arc is taught, tested, remixed, examined and in the boss');
ok(SECTIONS.length === 8 && SECTIONS.every((s, i) => i === 0 || s[1] > SECTIONS[i - 1][1]), 'seven sections and the arena, in order');
/* THE POINTS */
const P = id => L.mcPoints.find(p => p.id === id);
const req = L.mcPoints.filter(p => p.req);
ok(req.length >= 2, 'at least two REQUIRED forks (' + req.map(p => p.id).join(', ') + ')');
for (const p of req) { ok(p.dflt === 'open' && p.retry, p.id + ': open by default, with a retry spot');
  const w = L.mcWalls.find(q => q.x > p.x1 && q.x - p.x1 < 30); ok(w, p.id + ': a fall-in on the low line within 30 columns past its points');
  ok(w.y1 > p.prow, p.id + ': the fall-in is UNDER the line the points keep you on (row ' + p.prow + ')'); }
ok(P('forkA') && P('forkA').dflt === 'open', 'fork A is a risk / reward fork (open: the safe low line)');
ok(P('hidden') && P('hidden').hang && P('hidden').dflt === 'set', 'the hidden lever hangs in the roof and opens points in the line (down to the old spur)');
ok(P('smelter') && P('smelter').ore === 8 && L.quest.n === 10 && L.quest.item === 'orenugget', 'the smelter\'s lever wants 8 ore, and the quest counts all ten');
ok(L.mcPoints.every(p => L.ents.some(e => e.t === 'mcpoints' && e.id === p.id)), 'every lever is an ent the tools can see');
/* SPEED */
const air = 2 * 320 / 1000, cruiseReach = MC.cruise * air + 12, boostReach = MC.boost * air;
ok(cruiseReach < BOOST_GAP * TS && boostReach > BOOST_GAP * TS, 'a boost gap (' + BOOST_GAP + ' wide) is longer than a cruising jump (' + Math.round(cruiseReach) + ' px) and shorter than a boosted one (' + Math.round(boostReach) + ' px)');
ok(L.mcBoost.length >= 5, L.mcBoost.length + ' boost gaps');
for (const g of L.mcBoost) { let open = true; for (let x = g.x0; x <= g.x1; x++) for (let y = g.row - 2; y < L.H; y++) if (stand(at(x, y))) open = false; ok(open, 'boost gap ' + g.x0 + ' is open to the bottom (from its lip down)');
  ok(stand(at(g.x0 - 1, g.row)) || stand(at(g.x0 - 1, g.row - 3)) || stand(at(g.x0 - 1, g.row + 3)), 'boost gap ' + g.x0 + ' has a lip'); }
ok(L.mcBoost[0].x0 < P('yard').x, 'the first boost gap is taught before the first fork');
ok(L.mcCrushers.some(c => c.x < P('yard').x), 'a crusher is taught before the first fork');
ok(L.mcCrushers.length >= 6 && L.mcGates.length >= 3 && L.mcRocks.length >= 6 && L.mcBeams.length >= 1, 'crushers, gates, rockfalls and a beam');
for (const c of L.mcCrushers) { const up = c.period - c.down - 0.45; ok(up >= 0.6, 'crusher ' + c.id + ' is up long enough to pass at a boost (' + up.toFixed(2) + ' s)'); }
for (const [a, b] of L.mcExam) ok(L.mcBoost.some(g => g.x0 >= a && g.x1 <= b), 'the exam zone ' + a + '-' + b + ' holds a boost gap (a real death)');
/* CART COMBAT */
const riders = L.ents.filter(e => e.ride);
ok(riders.length >= 10 && riders.every(e => e.t === 'archer' || e.t === 'gobmage'), riders.length + ' goblins on carts, every one an EXISTING foe (archer / gobmage)');
for (const e of riders) { const x = e.ride.at !== undefined ? e.ride.at : e.x; ok([e.ride.row - 1, e.ride.row, e.ride.row + 1].some(y => stand(at(x, y))), 'the rider at ' + x + ' waits on a line (row ' + e.ride.row + ')'); }
ok(riders.some(e => e.ride.slow), 'a slow goblin cart on your own line (jump into it)');
const kinds = new Set(L.ents.filter(e => THREAT[e.t] > 0 && e.t !== 'greatdrill').map(e => e.t));
ok([...kinds].every(t => ['archer', 'gobmage', 'tippler', 'miner', 'brute', 'sapper', 'bat'].includes(t)), 'no new foe type: ' + [...kinds].join(', '));
/* COLLECTIBLES, STATIONS */
ok(L.ents.filter(e => e.t === 'stray' && e.kind === 'orenugget').length === 10, 'ten ore nuggets');
ok(L.ents.filter(e => e.t === 'silver').length === 3 && !L.ents.some(e => e.t === 'relic'), 'three silvers, no relic');
const st = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
ok(st.length >= 6, st.length + ' stations');
/* THE CART */
ok(cartSpeed(MC.cruise, { boost: true }, 1) === MC.boost && cartSpeed(MC.cruise, { brake: true }, 1) === 0 && cartSpeed(0, {}, 10) === MC.cruise, 'the cart: boost to ' + MC.boost + ', brake to a stop, cruise at ' + MC.cruise);
/* THE GREAT DRILL */
const A = L.arena; ok(A && A.boss === 'greatdrill' && A.music === 'greatdrill' && L.ents.some(e => e.t === 'greatdrill'), 'THE GREAT DRILL in its arena, its own theme');
const G = GD.geom(A, TS); ok(G.laneY.every((y, i) => i === 0 ? stand(at(A.drill.sx + 5, G.F)) : at(A.drill.sx + 5, G.F - GD.DRILL_STAGE.lanes[i]) === T.RAIL), 'three lines in the bore (low floor, mid and high rail)');
const world = (log) => ({ hit: () => false, number: (x, y, t) => log.push(t), sound: () => {}, shake: () => {}, music: () => {}, crash: () => {} });
const fight = () => { const S = GD.newFight(G), e = { hp: 600, maxHp: 600, mode: 'idle', modeT: 0, open: 0 }; S.D = G.x0 + 60; S.cd = 99; return { S, e }; };
{ const { S, e } = fight(), log = []; S.ores.push({ x: S.D + 30, lane: 0, id: 1, y: G.laneY[0], drop: false }); for (let i = 0; i < 60 && !GD.drillOpen(e); i++) GD.stepDrill(e, S, 1 / 60, [], world(log));
  ok(GD.drillOpen(e) && S.n.jams === 1, 'an ore cart that reaches it on the LOW line JAMS its gears');
  const d = GD.takeBlow(e, S, 10); ok(d === 10 * GD.DRILL.jamMul, 'jammed, the cab takes double (' + d + ')');
  for (let i = 0; i < 400 && GD.drillOpen(e); i++) GD.stepDrill(e, S, 1 / 60, [], world(log)); ok(!GD.drillOpen(e) && S.ward > 0, 'the jam ends in a told ward');
  ok(GD.takeBlow(e, S, 10) === 0, 'warded, a blow is turned (and said)'); S.points = true; for (let i = 0; i < 300 && S.ward > 0; i++) GD.stepDrill(e, S, 1 / 60, [], world(log));
  ok(!S.points && log.some(t => /KNOCKS THE POINTS BACK/.test(t)), 'after the ward it knocks the points back (each opening wants a fresh throw)');
  ok(GD.takeBlow(e, S, 10) === 10, 'out of the ward the cab takes a whole blow again (always hittable - no chip waiting room)'); }
{ const { S, e } = fight(), log = []; S.ores.push({ x: S.D + 30, lane: 1, id: 1, y: G.laneY[1], drop: false }); for (let i = 0; i < 90; i++) GD.stepDrill(e, S, 1 / 60, [], world(log));
  ok(!GD.drillOpen(e) && S.n.eaten === 1, 'an ore cart on the MID line is eaten by the bit (the gears are on the low line)'); }
{ const { S, e } = fight(), log = []; S.points = true; S.ores.push({ x: G.pointsX + 20, lane: 2, id: 1, y: G.laneY[2], drop: false }); for (let i = 0; i < 400 && !GD.drillOpen(e); i++) GD.stepDrill(e, S, 1 / 60, [], world(log));
  ok(GD.drillOpen(e), 'SET POINTS drop an ore cart from the HIGH line to the low line, and on into the gears'); }
{ const { S, e } = fight(); S.chute = { lane: 1, t: 0.5 }; const mem = {}, ask = t => GD.drillPlan({ P: { x: G.x0 + 120, y: G.laneY[1], ground: true, face: 1, atk: -1, lane: 1 }, e, S, reach: 22, rng: () => 0.9, mem, t });
  ask(5); const pl = ask(5.5);   /* (a quarter-second to see the chute, as a player does) */
  ok(pl.why === 'points' && pl.gx > G.pointsX - 10, 'the bot goes to the points mast when the chute rattles'); }
console.log('minecart: ' + n + ' checks ok');
