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
import { MC, BOOST_GAP, SECTIONS, ARCS, cartSpeed, runeAt, runeHits } from '../src/minecart.js';
import { isCallout } from '../src/hint-lines.js';
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
/* (fix pass, review: fork A's default WAS the safe low line - a test passed by doing nothing. Daniel's reviewer asked for the default to be the risky line and
   the low line to cost: the same strictness, the other way round) */
ok(P('forkA') && P('forkA').dflt === 'set', 'fork A is a risk / reward fork whose default is NOT the free line (set: the high line, ore and arrows)');
{ const fa = P('forkA'), low = [...L.mcCrushers, ...L.mcGates].filter(h => h.row > fa.prow && h.x > fa.x && h.x < fa.x + 45);
  ok(low.length >= 3, 'fork A low line is not a free pass: ' + low.length + ' crushers / gates on it'); }
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
ok(L.mcCrushers.length >= 6 && L.mcGates.length >= 3 && L.mcRocks.length >= 6 && L.mcBeams.length >= 3, 'crushers, gates, rockfalls and three beams (duck taught, tested, remixed)');
ok(L.mcBeams.some(b => b.x0 < ARCS.points.teach[0]) && L.mcBeams.some(b => b.x0 >= SECTIONS[2][1] && b.x0 < SECTIONS[3][1]) && L.mcBeams.some(b => b.x0 >= SECTIONS[5][1] && b.x0 < SECTIONS[6][1]), 'a beam in the yard, one in the goblin line, one in the exam');
for (const c of L.mcCrushers) { const up = c.period - c.down - 0.45; ok(up >= 0.6, 'crusher ' + c.id + ' is up long enough to pass at a boost (' + up.toFixed(2) + ' s)'); }
for (const [a, b] of L.mcExam) ok(L.mcBoost.some(g => g.x0 >= a && g.x1 <= b), 'the exam zone ' + a + '-' + b + ' holds a boost gap (a real death)');
ok(L.mcExam.some(([a, b]) => a >= SECTIONS[4][1] && b < SECTIONS[5][1]), 'the crusher works has its own exam (a real-death gap)');
/* THE TELLS (review MF1): every hazard is told in the hint box BEFORE it can hurt - no modal sign read at speed */
const T_ = L.mcTells, cps = MC.cruise / TS;   /* columns a second at cruise */
ok(T_.length >= 20 && T_.every(t => isCallout(t.text)), T_.length + ' tells, every one a line the hint box draws (src/hint-lines.js)');
for (const t of T_) { ok(t.text.replace(/[:,.!-]/g, ' ').trim().split(/s+/).length <= 5, 'tell "' + t.text + '" is five words or fewer');
  const lead = (t.at - t.x) / cps; ok(t.x <= L.START.x || (lead >= 2.2 && lead <= 5.2), 'tell "' + t.text + '" comes ' + lead.toFixed(1) + ' s at cruise before what it tells (2.2..5.2)'); }
for (let i = 1; i < T_.length; i++) { const sec = T_[i - 1].x <= L.START.x ? (T_[i].x - L.START.x) / cps + MC.hold : (T_[i].x - T_[i - 1].x) / cps;   /* (the start's tell is read while the cart waits MC.hold) */
  ok(T_[i].x > T_[i - 1].x && sec >= 1.8, 'tells "' + T_[i - 1].text + '" and "' + T_[i].text + '" are ' + sec.toFixed(1) + ' s apart (one is never written over another)'); }
const toldFor = x => T_.some(t => t.x <= x && t.at >= x - 1 && (t.at - t.x) / cps <= 5.2 + 1e-9);
const firstOf = a => a.slice().sort((p, q) => p.x - q.x)[0];
ok(toldFor(firstOf(L.mcCrushers).x), 'the first crusher is told'); ok(toldFor(L.mcBeams[0].x0), 'the first beam is told'); ok(toldFor(firstOf(L.mcRocks.map(r => ({ x: r.x }))).x), 'the first rockfall is told');
for (const g of L.mcBoost) { const deadly = L.mcExam.some(([a, b]) => g.x0 >= a && g.x1 <= b) || L.chases.some(c => g.x0 * TS >= c.trigger && g.x0 * TS <= c.end); if (deadly || g === L.mcBoost[0]) ok(toldFor(g.x0), 'boost gap ' + g.x0 + (deadly ? ' (a real death)' : '') + ' is told'); }
for (const p of req) ok(toldFor(L.mcWalls.find(q => q.x > p.x1 && q.x - p.x1 < 30).x) || toldFor(p.x), 'the required points ' + p.id + ' are told');
ok(T_.some(t => t.x >= 900 && t.at >= 940 && /BORE/.test(t.text)), 'the drill is told before its arena (B8)');
ok(['scar', 'rumble', 'headlight', 'spoil'].every(k => L.decor.some(d => d.kind === k)), 'its approach: bore scars, a rumble, its headlight through the rock, spoil (B8)');
ok(L.decor.some(d => d.kind === 'crumble' && d.x0 <= 530 && d.x1 >= P('cavein').x1), 'the cave-in low line crumbles in view from 530 (review MF5)');
{ const tc = T_.find(t => t.at >= P('cavein').x && t.x < P('cavein').x); ok(tc && (L.mcWalls.find(q => q.x > P('cavein').x1).x - tc.x) / cps >= 4, 'the cave-in fork is told ~4 s before its fall-in (' + (tc && tc.x) + ')'); }
/* CART COMBAT */
const riders = L.ents.filter(e => e.ride);
ok(riders.length >= 10 && riders.every(e => e.t === 'archer' || e.t === 'gobmage'), riders.length + ' goblins on carts, every one an EXISTING foe (archer / gobmage)');
for (const e of riders) { const x = e.ride.at !== undefined ? e.ride.at : e.x; ok([e.ride.row - 1, e.ride.row, e.ride.row + 1].some(y => stand(at(x, y))), 'the rider at ' + x + ' waits on a line (row ' + e.ride.row + ')'); }
ok(riders.some(e => e.ride.slow), 'a slow goblin cart on your own line (jump into it)');
/* THE CASTER'S RUNE (review MF2): laid where your cart will be - a held pace is hit; a jump, a brake, a boost dodge it */
ok(runeAt(100, 150) === 100 + 150 * MC.runeT, 'the rune is laid at x + v * runeT');
ok(runeHits(0, 150, {}), 'a cart that holds its cruise is under the rune when it bursts');
ok(!runeHits(0, 60, {}) && runeAt(0, 60) < runeAt(0, 150), 'laid for a slow cart (60) it lands short, and letting the cart run on to cruise rides past it - every change of pace dodges it');
ok(runeHits(0, 230, { boost: true }), 'a cart already at full boost that holds it is under the rune');
ok(!runeHits(0, 150, { boost: true }), 'cruising, a BOOST past the rune dodges it');
ok(!runeHits(0, 150, { brake: true }) && !runeHits(0, 230, { brake: true }), 'a BRAKE short of the rune dodges it (from cruise and from a boost)');
ok(!runeHits(0, 150, { jump: MC.runeT - 0.35 }), 'a JUMP over the rune as it bursts dodges it');
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
/* P3 CHANGES THE ARENA (B5; fix pass): the HIGH line comes down - two lines left, the chute and the roof work on the two */
{ const { S, e } = fight(), log = [], arena = []; const w = { ...world(log), arena: k => arena.push(k) }; S.cd = 99; e.hp = e.maxHp * 0.62; e.mode = 'idle'; S.ph = 2;
  e.hp = e.maxHp * 0.29; GD.stepDrill(e, S, 1 / 60, [], w); ok(S.ph === 3 && S.highDown && arena.includes('highDown') && GD.lanesOf(S).join() === '0,1', 'P3 brings the roof down on the HIGH line: two lines left');
  ok(log.some(t => /HIGH LINE/.test(t)) && isCallout('THE ROOF TAKES THE HIGH LINE: TWO LINES LEFT'), 'and says so');
  for (let i = 0; i < 6; i++) { S.chute = null; S.ores = []; S.oreT = 0; GD.stepDrill(e, S, 1 / 60, [], w); ok(!S.chute || S.chute.lane === 1, 'P3: the chute drops on the MID line'); } }
ok(GD.DRILL.jamCap >= 0.15 && GD.DRILL.jamMul >= 2.5 && GD.DRILL.boreTell >= 1.2 && GD.DRILL.boreTell3 >= 1.0 && GD.DRILL.hp >= 1900, 'the drill at the fix pass numbers (the key pays more; the bore told long enough for a hero with a slow recovery - the pyro - to change line; hp never lowered)');
console.log('minecart: ' + n + ' checks ok');
