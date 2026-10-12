// tools/minecart.mjs - THE DEEP RAILS' own check (claude/minecart; DEEP RAILS 2, claude/deeprails2). Node only: no page, no port, no Chrome. The built level and the pure modules:
//   - THE ROAD: on the MAIN ROAD (Daniel 10-09) - it needs the Ore Road, Stormhold needs it, its map node is on the road (no spur); the rule line is the code's
//   - ALWAYS FORWARD (DKC): the brake bites to a crawl and never stops the cart or backs it; pump / brake / cruise numbers; the ram pace sits between cruise and pump
//   - THE ARCS teach -> test -> remix -> exam for the points, speed and combat; the areas (lamp-lit, a pitch drift with a dark zone, the glow cavern's lava, the flood)
//   - THE POINTS: required forks (their default line runs into a fall-in), a risk/reward fork, a hidden lever in the roof, the smelter's lever wants 8 ore
//   - SPEED: every pump gap is wider than a cruising jump and narrower than a pumped one; THE LAUNCH RAMP (a cruising launch falls short, a pumped one clears);
//     THE RAILS THAT BREAK (a cruising cart is caught, a pumping one gets away); crushers, gates, rockfalls; each EXAM zone holds a real-death gap
//   - CART COMBAT: the ram taught on a goblin on the line off the first pump gap; riders are EXISTING foes (archer, gobmage, a miner throwing off a ledge); a rider at
//     his own pace (pump to catch him); a thrower's mark is dodged by a brake or a pump; (deeprails3) the foes that come TO your line - a perched goblin's chop,
//     a rider who swings his hook in, a goblin who leaps onto the line - each told, each ducked / braked / rammed
//   - THE FOREMAN (deeprails3: THE MINI, src/foreman.js): his loop (the treadmill, no gap in it), his armoured cart (x0.4 a blade, B15), a landing on him from above
//     BOARDS him (a stomp: a share of him; OPEN while you stand there), the told lurch throws you back into your own cart, a told brace after (B3); every move told
//   - DUCK + SWITCH (deeprails3): taught, tested, remixed, examined; under a LOW ROOF (no jump over the bridge), the bridge out until its switch; cheap falls, the exam real
//   - THE ON-FOOT STRETCHES: two (a derailment, a lift), each a big platform with a station and a cart waiting at its end; the lift reaches its top line
//   - the collectible: ten ore, the quest wants eight, three silvers, no relic; stations one a section
//   - THE GREAT DRILL 3 (src/great-drill.js; deeprails3): ITS CHUTE'S POINTS LEVER thrown (the level's verb, from any line) JAMS it - a rammed ore cart is the bonus way;
//     x2 on the cab, capped; a told ward follows; never totally invulnerable (B15: x0.4 outside the jam, in the ward too); every move told; one new a phase (dynamite /
//     the spin-up lunge + the grapple chain / the roof collapse), each dodged by a cart verb; P3 takes the HIGH line; the bot throws the lever, ducks the lunge, rams
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { THREAT } from '../src/threat.js';
import { MC, BOOST_GAP, SECTIONS, ARCS, FOOT, cartSpeed, runeAt, runeHits, rampFlight } from '../src/minecart.js';
import { isCallout } from '../src/hint-lines.js';
import * as GD from '../src/great-drill.js';
import * as FMG from '../src/foreman.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'minecart'); ok(lv, 'minecart is in LEVELS'); ok(lv.needs === 'oreroad', 'THE DEEP RAILS needs THE ORE ROAD (it is ' + lv.needs + ')');
ok(LEVELS.find(l => l.id === 'storm').needs === 'minecart', 'Stormhold needs THE DEEP RAILS: it is ON THE MAIN ROAD, Ore Road -> Deep Rails -> Stormhold (Daniel 10-09)');
ok(!lv.hidden && !lv.secret && !lv.needsKills && !lv.needsTime, 'no hidden, secret or kill/time gate: a main-road level');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
{ const line = main.split(/\r?\n/).find(l => /\{ id: 'minecart', kind: 'level'/.test(l)); ok(line && !/spur: true/.test(line), 'its map node is ON THE ROAD (not a spur)');
  const m = /x: (\d+), y: (\d+)/.exec(line), path = /const CRAG_PATH = (\[\[.*?\]\]);/.exec(main); ok(m && path && JSON.parse(path[1]).some(([x, y]) => x === +m[1] && y === +m[2]), 'and the crag road runs through its node'); }
const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const stand = t => t === T.SOLID || t === T.RAIL || t === T.ONEWAY || (t >= 20 && t <= 25);
/* THE RULE LINE is the code's */
const src = readFileSync(new URL('../src/minecart.js', import.meta.url), 'utf8'), hands = readFileSync(new URL('../src/minecart-hands.js', import.meta.url), 'utf8');
ok(src.includes('// THE RULE: ' + lv.rule), 'the rule line in LEVELS is the one src/minecart.js states: ' + lv.rule);
ok(/POINTS/.test(lv.rule) && /PUMP/.test(lv.rule) && /BRAKE/.test(lv.rule) && /NEVER STOPS/.test(lv.rule), 'the rule line names the verb (the points) and the cart (pump, brake, it never stops)');
ok(L.minecart && L.music === 'mineworks', "all cart (L.minecart) and its own track ('mineworks', HorrorPen, CC-BY)");
/* ALWAYS FORWARD */
{ let v = MC.cruise; for (let i = 0; i < 600; i++) v = cartSpeed(v, { brake: true }, 1 / 60); ok(v === MC.crawl && MC.crawl > 0, 'a brake held ten seconds leaves the cart at its crawl (' + v + '), never stopped');
  let w = 0; for (let i = 0; i < 60; i++) w = cartSpeed(w, { brake: true }, 1 / 60); ok(w > 0, 'from a standstill even a held brake rolls it on (always forward)'); }
ok(!/REVERSE:|c\.v = Math\.max\(-MC\.reverse/.test(hands) && MC.reverse === undefined, 'no reverse gear: the cart never backs (Daniel 10-09: always forward)');
ok(MC.ramV > MC.cruise + 20 && MC.ramV < MC.boost, 'the RAM pace (' + MC.ramV + ') is past cruise and short of full pump: you pump to ram');
ok(cartSpeed(MC.cruise, { boost: true }, 1) === MC.boost && cartSpeed(0, {}, 10) === MC.cruise, 'the cart: pump to ' + MC.boost + ', cruise at ' + MC.cruise);
/* THE ARCS */
for (const k of ['points', 'speed', 'combat', 'switch']) ok(['teach', 'test', 'remix', 'exam', 'boss'].every(s => ARCS[k][s]), 'the ' + k + ' arc is taught, tested, remixed, examined and in the boss');
ok(SECTIONS.length === 10 && SECTIONS.every((s, i) => i === 0 || s[1] > SECTIONS[i - 1][1]), 'nine sections and the arena, in order');
const sec = name => { const i = SECTIONS.findIndex(s => s[0] === name); return [SECTIONS[i][1], SECTIONS[i + 1][1]]; };
/* THE AREAS (A8: dark and light stretches) */
{ const dz = (L.darkZones || [])[0], [d0, d1] = sec('THE DARK DRIFT'); ok(dz && dz.dark >= 0.8 && dz.x0 <= (d0 + 6) * TS && dz.x1 >= (d1 - 6) * TS && L.dark > 0, 'THE DARK DRIFT is pitch (dark ' + (dz && dz.dark) + ': the headlamp cone, src/minecart-hands.js holes)');
  ok(/H\.holes = /.test(hands) && /MCH\.holes\(hole, cx, cy, dg\)/.test(main), 'the dark has holes: the headlamp cone, the goblins\' lamps, every lever and crusher');
  ok(L.decor.some(d => d.kind === 'lava') && L.decor.some(d => d.kind === 'flood') && (L.mcAreas || []).length >= 8, 'THE GLOW CAVERN has its lava, THE FLOODED RUN its water, ' + (L.mcAreas || []).length + ' named areas'); }
/* THE POINTS */
const P = id => L.mcPoints.find(p => p.id === id);
const req = L.mcPoints.filter(p => p.req);
ok(req.length >= 2, 'at least two REQUIRED forks (' + req.map(p => p.id).join(', ') + ')');
for (const p of req) { ok(p.dflt === 'open' && p.retry, p.id + ': open by default, with a retry spot');
  const w = L.mcWalls.find(q => q.x > p.x1 && q.x - p.x1 < 30); ok(w, p.id + ': a fall-in on the low line within 30 columns past its points');
  ok(w.y1 > p.prow, p.id + ': the fall-in is UNDER the line the points keep you on (row ' + p.prow + ')'); }
ok(P('forkA') && P('forkA').dflt === 'set', 'fork A is a risk / reward fork whose default is NOT the free line (set: the high line, ore and arrows)');
{ const fa = P('forkA'), low = [...L.mcCrushers, ...L.mcGates].filter(h => h.row > fa.prow && h.x > fa.x && h.x < fa.x + 45);
  ok(low.length >= 3, 'fork A low line is not a free pass: ' + low.length + ' crushers / gates on it'); }
ok(P('hidden') && P('hidden').hang && P('hidden').dflt === 'set', 'the hidden lever hangs in the roof and opens points in the line (down to the old spur)');
ok(P('smelter') && P('smelter').ore === 8 && L.quest.n === 10 && L.quest.item === 'orenugget', 'the smelter\'s lever wants 8 ore, and the quest counts all ten');
ok(L.mcPoints.every(p => L.ents.some(e => e.t === 'mcpoints' && e.id === p.id)), 'every lever is an ent the tools can see');
/* SPEED: the pump gaps */
const air = 2 * 320 / 1000, cruiseReach = MC.cruise * air + 12, boostReach = MC.boost * air;
ok(cruiseReach < BOOST_GAP * TS && boostReach > BOOST_GAP * TS, 'a pump gap (' + BOOST_GAP + ' wide) is longer than a cruising jump (' + Math.round(cruiseReach) + ' px) and shorter than a pumped one (' + Math.round(boostReach) + ' px)');
const gaps = L.mcBoost.filter(g => !g.ramp);
ok(gaps.length >= 5, gaps.length + ' pump gaps');
for (const g of L.mcBoost) { let open = true; for (let x = g.x0; x <= g.x1; x++) for (let y = g.row - 2; y < L.H; y++) if (stand(at(x, y))) open = false; ok(open, 'gap ' + g.x0 + ' is open to the bottom (from its lip down)');
  ok(stand(at(g.x0 - 1, g.row)) || stand(at(g.x0 - 1, g.row - 3)) || stand(at(g.x0 - 1, g.row + 3)), 'gap ' + g.x0 + ' has a lip'); }
ok(gaps[0].x0 < P('yard').x, 'the first pump gap is taught before the first fork');
ok(L.mcCrushers.some(c => c.x < P('yard').x), 'a crusher is taught before the first fork');
ok(L.mcCrushers.length >= 6 && L.mcGates.length >= 3 && L.mcRocks.length >= 6 && L.mcBeams.length >= 3, 'crushers, gates, rockfalls and three beams (duck taught, tested, remixed)');
{ const [g0, g1] = sec('THE GOBLIN LINE'), [f0, f1] = sec('THE FLOODED RUN'); ok(L.mcBeams.some(b => b.x0 < ARCS.points.teach[0]) && L.mcBeams.some(b => b.x0 >= g0 && b.x0 < g1) && L.mcBeams.some(b => b.x0 >= f0 && b.x0 < f1), 'a beam in the yard, one in the goblin line, one in the exam'); }
for (const c of L.mcCrushers) { const up = c.period - c.down - 0.45; ok(up >= 0.6, 'crusher ' + c.id + ' is up long enough to pass at a pump (' + up.toFixed(2) + ' s)'); }
for (const [a, b] of L.mcExam) ok(gaps.some(g => g.x0 >= a && g.x1 <= b), 'the exam zone ' + a + '-' + b + ' holds a pump gap (a real death)');
{ const [w0, w1] = sec('THE CRUSHER WORKS'); ok(L.mcExam.some(([a, b]) => a >= w0 && b < w1), 'the crusher works has its own exam (a real-death gap)'); }
/* THE LAUNCH RAMP (deeprails2) */
ok(L.mcRamps.length >= 1, 'a launch ramp');
for (const r of L.mcRamps) { const span = r.w * TS; ok(rampFlight(MC.cruise) < span && rampFlight(MC.boost) > span + TS, 'the ramp at ' + r.x + ': a cruising launch flies ' + Math.round(rampFlight(MC.cruise)) + ' px and falls short of its ' + span + ' px pit, a pumped one flies ' + Math.round(rampFlight(MC.boost)) + ' px and clears it');
  ok(stand(at(r.x, r.row)) && stand(at(r.x + r.w + 1, r.row)) && stand(at(r.x + r.w + 2, r.row)), 'it has its lip and a landing past the pit'); }
/* THE RAILS THAT BREAK (deeprails2) */
ok(MC.breakV > MC.cruise && MC.breakV < MC.boost, 'the break runs up the line faster than a cruising cart (' + MC.breakV + ') and slower than a pumping one');
ok(L.mcBreaks.length >= 2, L.mcBreaks.length + ' rails that break (taught, and remixed under the cave-in)');
for (const b of L.mcBreaks) { const len = (b.x1 - b.x0 + 1) * TS, caught = MC.breakLead / (MC.breakV - MC.cruise) * MC.cruise;
  ok(caught < len, 'the break at ' + b.x0 + ': a cruising cart is caught ' + Math.round(caught) + ' px in (the rail is ' + len + ' px)');
  let open = true; for (let x = b.x0; x <= b.x1; x++) for (let y = b.row + 1; y < L.H; y++) if (stand(at(x, y)) && y < b.row + 3) open = false; ok(open, 'and under it the line falls away'); }
/* THE TELLS (review MF1): every hazard is told in the hint box BEFORE it can hurt - no modal sign read at speed */
const T_ = L.mcTells, cps = MC.cruise / TS;
ok(T_.length >= 26 && T_.every(t => isCallout(t.text)), T_.length + ' tells, every one a line the hint box draws (src/hint-lines.js)');
for (const t of T_) { ok(t.text.replace(/[:,.!-]/g, ' ').trim().split(/\s+/).length <= 5, 'tell "' + t.text + '" is five words or fewer');
  const lead = (t.at - t.x) / cps; ok(t.x <= L.START.x || (lead >= 2.2 && lead <= 5.2), 'tell "' + t.text + '" comes ' + lead.toFixed(1) + ' s at cruise before what it tells (2.2..5.2)'); }
for (let i = 1; i < T_.length; i++) { const s2 = T_[i - 1].x <= L.START.x ? (T_[i].x - L.START.x) / cps + MC.hold : (T_[i].x - T_[i - 1].x) / cps;
  ok(T_[i].x > T_[i - 1].x && s2 >= 1.8, 'tells "' + T_[i - 1].text + '" and "' + T_[i].text + '" are ' + s2.toFixed(1) + ' s apart (one is never written over another)'); }
const toldFor = x => T_.some(t => t.x <= x && t.at >= x - 1 && (t.at - t.x) / cps <= 5.2 + 1e-9);
const firstOf = a => a.slice().sort((p, q) => p.x - q.x)[0];
ok(toldFor(firstOf(L.mcCrushers).x), 'the first crusher is told'); ok(toldFor(L.mcBeams[0].x0), 'the first beam is told'); ok(toldFor(firstOf(L.mcRocks.map(r => ({ x: r.x }))).x), 'the first rockfall is told');
for (const g of gaps) { const deadly = L.mcExam.some(([a, b]) => g.x0 >= a && g.x1 <= b) || L.chases.some(c => g.x0 * TS >= c.trigger && g.x0 * TS <= c.end); if (deadly || g === gaps[0]) ok(toldFor(g.x0), 'pump gap ' + g.x0 + (deadly ? ' (a real death)' : '') + ' is told'); }
for (const r of L.mcRamps) ok(toldFor(r.x), 'the ramp at ' + r.x + ' is told');
for (const b of L.mcBreaks) if (b.x0 < L.chases[0].trigger / TS) ok(T_.some(t => t.x < b.x0 && t.at >= b.x0 && /BREAK/.test(t.text)), 'the first rail that breaks is told');
for (const p of req) ok(toldFor(L.mcWalls.find(q => q.x > p.x1 && q.x - p.x1 < 30).x) || toldFor(p.x), 'the required points ' + p.id + ' are told');
for (const f of FOOT) ok(T_.some(t => t.x < f.x0 && t.at >= f.x0 && /DERAIL|LIFT/.test(t.text)), 'the ' + f.name + ' stretch is told before the cart stops');
ok(T_.some(t => t.x >= 900 && t.at >= 940 && /BORE/.test(t.text)), 'the drill is told before its arena (B8)');
ok(['scar', 'rumble', 'headlight', 'spoil'].every(k => L.decor.some(d => d.kind === k)), 'its approach: bore scars, a rumble, its headlight through the rock, spoil (B8)');
ok(L.decor.some(d => d.kind === 'crumble' && d.x0 <= 530 && d.x1 >= P('cavein').x1), 'the cave-in low line crumbles in view from 530 (review MF5)');
{ const tc = T_.find(t => t.at >= P('cavein').x && t.x < P('cavein').x); ok(tc && (L.mcWalls.find(q => q.x > P('cavein').x1).x - tc.x) / cps >= 4, 'the cave-in fork is told ~4 s before its fall-in (' + (tc && tc.x) + ')'); }
/* CART COMBAT */
const riders = L.ents.filter(e => e.ride);
ok(riders.length >= 12 && riders.every(e => ['archer', 'gobmage', 'miner', 'brute'].includes(e.t)), riders.length + ' goblins on carts and ledges, every one an EXISTING foe (archer / gobmage / miner / brute)');
for (const e of riders) { const x = e.ride.at !== undefined ? e.ride.at : e.x; ok(e.ride.perch ? L.decor.some(d => d.kind === 'perch' && x >= d.x0 && x <= d.x1 && d.row === e.ride.row) : e.ride.ledge ? at(x, e.ride.row) === T.SOLID : [e.ride.row - 1, e.ride.row, e.ride.row + 1].some(y => stand(at(x, y))), 'the rider at ' + x + ' waits on a line, a ledge or a roof timber (row ' + e.ride.row + ')'); }
ok(riders.some(e => e.ride.slow), 'a slow goblin cart on your own line (ram it, or jump into it)');
ok(riders.some(e => e.ride.pace > MC.cruise && e.ride.pace < MC.boost), 'a rider at his OWN pace, past cruise and short of pump: pump to catch him');
{ const th = riders.filter(e => e.ride.ledge); ok(th.length >= 1 && th.every(e => e.t === 'miner'), 'a goblin miner throws from a ledge'); }
{ const ram = L.ents.find(e => e.t === 'miner' && !e.ride && e.x > gaps[0].x1 && e.x < gaps[0].x1 + 16); ok(ram, 'THE RAM is taught: a miner on the line just past the first pump gap (you land at full pump)'); ok(toldFor(ram.x) || T_.some(t => /RAM/.test(t.text) && t.at >= ram.x - 1 && t.x < ram.x), 'and told'); }
/* THE THROW and THE RUNE: laid where your cart will be - a held pace is hit; a brake or a pump dodges */
ok(runeAt(100, 150) === 100 + 150 * MC.runeT, 'the rune is laid at x + v * runeT');
ok(runeHits(0, 150, {}), 'a cart that holds its cruise is under the rune when it bursts');
ok(runeHits(0, 230, { boost: true }), 'a cart already at full pump that holds it is under the rune');
ok(!runeHits(0, 150, { boost: true }), 'cruising, a PUMP past the rune dodges it');
ok(!runeHits(0, 150, { brake: true }) && !runeHits(0, 230, { brake: true }), 'a BRAKE short of the rune dodges it (from cruise and from a pump)');
ok(!runeHits(0, 150, { jump: MC.runeT - 0.35 }), 'a JUMP over the rune as it bursts dodges it');
ok(runeHits(0, 150, {}, 1 / 60, MC.throwT, MC.throwR) && !runeHits(0, 150, { brake: true }, 1 / 60, MC.throwT, MC.throwR) && !runeHits(0, 150, { boost: true }, 1 / 60, MC.throwT, MC.throwR), 'a THROWN PICK: cruise held is hit, a brake (or a pump) off his mark dodges it');
const kinds = new Set(L.ents.filter(e => THREAT[e.t] > 0 && e.t !== 'greatdrill').map(e => e.t));
ok([...kinds].every(t => ['archer', 'gobmage', 'tippler', 'miner', 'brute', 'sapper', 'bat'].includes(t)), 'no new foe type: ' + [...kinds].join(', '));
/* CART COMBAT 2 (deeprails3): foes that come TO your line - each told, each answered with the cart's own verbs */
{ const perch = riders.filter(e => e.ride.perch), swing = riders.filter(e => e.ride.swing), jump = riders.filter(e => e.ride.jumper);
  ok(perch.length >= 1 && swing.length >= 1 && jump.length >= 1, 'a goblin on a roof timber (' + perch.length + '), a rider who swings in (' + swing.length + '), a goblin who leaps onto the line (' + jump.length + ')');
  ok(MC.perchTell >= 0.4 && MC.swingTell >= 0.5 && MC.leapTell >= 0.5, 'every one told: the chop ' + MC.perchTell + ' s, the hook ' + MC.swingTell + ' s, the leap ' + MC.leapTell + ' s (and its shadow on the rail)');
  for (const e of perch) ok(L.mcBeams.some(b => Math.abs(b.x0 - e.ride.at) <= 4 && b.row === e.ride.line), 'the perched goblin at ' + e.ride.at + ' chops over a low beam: one duck answers both');
  ok(/chopAt\(/.test(hands) && /duckClears\(P, cy\)/.test(hands), 'a chop is ducked (the beam\'s own duckClears test)'); }
/* DUCK + SWITCH (deeprails3, Daniel 10-10): under a low roof a beam to duck and a SWITCH whose bridge is out - taught, tested, remixed, examined */
{ const sw = L.mcPoints.filter(p => p.sw).sort((p, q) => p.x - q.x), [a0, a1, a2, a3] = ['teach', 'test', 'remix', 'exam'].map(k => ARCS.switch[k]);
  ok(sw.length >= 4, sw.length + ' switches (teach, test, remix, exam)');
  ok(a0[1] < a1[0] && a1[1] < a2[0] && a2[1] < a3[0], 'the switch arc runs teach -> test -> remix -> exam in order');
  for (const p of sw) { const span = (p.x1 - p.x0 + 1) * TS, roofH = 2 * TS - 14, hop = 2 * Math.sqrt(2 * roofH / 1000), roofed = []; for (let x = p.x0 - 2; x <= p.x1 + 1; x++) roofed.push(at(x, p.prow - 3) === T.SOLID);
    ok(p.dflt === 'open', p.id + ': its bridge is OUT by default (the switch lays it)');
    ok(roofed.every(Boolean), p.id + ': a low roof over its bridge and the lip (rock three rows up from ' + (p.x0 - 2) + ' to ' + (p.x1 + 1) + ')');
    ok(MC.boost * hop < span, p.id + ': under the roof a pumped hop flies ' + Math.round(MC.boost * hop) + ' px - short of its ' + span + ' px bridge (the switch is the only way over)');
    let pit = true; for (let x = p.x0; x <= p.x1; x++) for (let y = p.prow + 1; y < L.H; y++) if (stand(at(x, y))) pit = false; ok(pit, p.id + ': nothing under its bridge but the drop');
    ok(L.mcBeams.some(b => b.row === p.prow && b.x0 < p.x && p.x - b.x1 <= 5), p.id + ': a beam to duck just before its switch');
    ok(toldFor(p.x) || T_.some(t => t.x < p.x && t.at >= p.x - 6 && /SWITCH|BRIDGE/.test(t.text)), p.id + ': told before it');
    const exam = L.mcExam.some(([a, b]) => p.x0 >= a && p.x1 <= b); ok(p.x0 >= a3[0] ? exam : !exam, p.id + (exam ? ': in the exam - a fall is a REAL death (told)' : ': a fall here is cheap (A10)')); } }
/* THE FOREMAN (deeprails3: THE MINI, src/foreman.js) */
{ const fm = L.ents.find(e => e.mini && e.ride && e.ride.foreman), M_ = L.mini, F = FMG.FOREMAN, G = FMG.geom(TS);
  ok(fm && fm.t === 'brute' && M_ && M_.boss === 'brute' && M_.name === 'THE FOREMAN' && !fm.elite, 'THE FOREMAN is the level\'s MINI (a goblin captain - a brute - in an armoured cart), no longer an elite');
  ok(M_.x0 === G.x0 && M_.x1 === G.x1 && L.mcExam.some(([a, b]) => F.cols[0] >= a && F.cols[1] <= b), 'his loop (' + F.cols.join('-') + ') is the mini\'s room, inside the flooded run\'s exam');
  for (let x = F.cols[0]; x < F.cols[1]; x++) ok(at(x, F.low) === T.SOLID && [1, 2, 3, 4].every(d => at(x, F.low - d) === T.AIR), 'the loop at ' + x + ': its line solid (no gap: a lurch never drops you), nothing over it to catch a jump (the jump goes ON him)');
  ok([...Array(9)].every((_, i) => at(M_.gate, F.low - 1 - i) === T.PORT), 'the way on is shut while he rides (his gate at ' + M_.gate + ')');
  ok(T_.some(t => t.x < M_.trigger / TS && t.at >= F.cols[0] && /FOREMAN/.test(t.text)), 'he is told before his loop');
  ok(F.armour >= 0.4 && F.armour < 1, 'a blade from your cart takes x' + F.armour + ' (B15: never nothing)');
  ok(F.stompK >= 0.25 && F.stompK <= 0.34, 'a stomp takes ' + Math.round(F.stompK * 100) + '% of him: three good boardings (four at most) win');
  ok(F.driftTell >= 0.4 && F.pickTell >= 0.6 && F.ramTell >= 0.8 && F.lurchTell >= 0.6, 'every move told: his drift ' + F.driftTell + ' s, the pick ' + F.pickTell + ' s, the ram ' + F.ramTell + ' s, the lurch ' + F.lurchTell + ' s');
  ok(F.wardT >= 2.5, 'a told brace after every boarding (B3: ' + F.wardT + ' s)');
  ok(F.ramV * F.ramT + F.halfW < F.homeR - 100, 'his ram sweeps ' + Math.round(F.ramV * F.ramT) + ' px: room behind it to brake out of its reach');
  ok(F.chain[0].every(m => m !== 'ram') && F.chain[1].includes('ram'), 'the ram is his new move once he has been stomped (B5)');
  /* the fight, pure */
  const mk = () => { const S = FMG.newFight(G), e = { hp: 400, maxHp0: 400, alive: true }; S.mode = 'idle'; S.cd = 99; return { S, e }; };
  const log = [], C = (x = {}) => ({ ramV: MC.ramV, ramDmg: MC.ramDmg, hit: (h, d) => (x.hit = (x.hit || 0) + d), bounce: () => (x.bounce = (x.bounce || 0) + 1), stomp: (h, d, br) => { x[br ? 'braced' : 'stomp'] = d; },
    board: () => (x.board = 1), release: (b, how) => (x.release = how), lob: () => (x.lob = 1), number: (a, b, t) => log.push(t), sound: () => {}, chip: d => (x.chip = d) });
  { const { S, e } = mk(), x = {}, fx = FMG.foremanX(S), h = { x: fx - 6, y: G.topY + 2, prevY: G.topY - 3, vy: 120, ground: false, alive: true, riding: true, v: MC.cruise, pp: {} };
    FMG.stepForeman(S, e, 1 / 60, [h], C(x)); ok(x.board && x.stomp === Math.ceil(400 * F.stompK) && S.mode === 'boarded' && FMG.foremanOpen(S), 'a hero landing on his cart from above BOARDS it: a stomp (' + x.stomp + ' of 400) and he is OPEN');
    ok(FMG.takeBlade(S, 10) === 10, 'while you stand on his cart a blade is whole');
    for (let i = 0; i < 200 && !x.release; i++) FMG.stepForeman(S, e, 1 / 60, [], C(x)); ok(x.release === 'lurch' && S.ward > 0 && log.includes(FMG.FOREMAN_LINES.lurch), 'then a told LURCH throws you off - back into your own cart - and he braces');
    const y = {}; FMG.stepForeman(S, e, 1 / 60, [{ ...h, x: FMG.foremanX(S) - 6 }], C(y)); ok(y.braced > 0 && !y.board && S.n.braced === 1, 'a landing on him while he is braced is turned (a clank, a sliver: B15)');
    ok(FMG.takeBlade(S, 10) === Math.round(10 * F.armour), 'and a blade from the cart is x' + F.armour + ' again'); }
  { const { S, e } = mk(), x = {}; const h = { x: FMG.foremanX(S) - 18, y: G.lowY, prevY: G.lowY, vy: 0, ground: true, alive: true, riding: true, v: MC.cruise, pp: {} };
    FMG.stepForeman(S, e, 1 / 60, [h], C(x)); ok(x.hit === F.bumpDmg && x.bounce === 1 && !x.board, 'met in your cart on the LOW line he is a BUMP (armoured: it hurts you and throws you back)'); }
  { const { S, e } = mk(), x = {}; S.mode = 'ramTell'; S.mT = 0.01; S.R = 250; const h = { x: G.x0 + 250 - F.ramV * F.ramT - F.halfW - 40, y: G.lowY, prevY: G.lowY, vy: 0, ground: true, alive: true, riding: true, v: MC.cruise, pp: {} };
    for (let i = 0; i < 60; i++) FMG.stepForeman(S, e, 1 / 60, [h], C(x)); ok(!x.hit, 'his ram stops short of a cart braked back out of its reach'); }
  { const { S, e } = mk(); S.mode = 'drift'; S.R = 160; const mem = {}, ask = t => FMG.foremanPlan({ P: { x: G.x0 + 118, y: G.lowY, ground: true, vy: 0, atk: -1, v: MC.cruise, lane: 0 }, S, rng: () => 0.9, mem, t });
    ask(1); const pl = ask(1.5); ok(pl.jump, 'the bot jumps on him as he drops back to it (' + pl.why + ')'); } }
/* THE ON-FOOT STRETCHES (deeprails2) */
ok(FOOT.length === 2 && FOOT.some(f => f.derail) && FOOT.some(f => !f.derail), 'two on-foot stretches: a derailment and a lift (Daniel 10-09)');
for (const f of FOOT) { ok(L.ents.some(e => e.t === 'mccart' && e.x === f.board), f.name + ': a cart waits at its end (column ' + f.board + ')');
  ok(f.board - f.x0 >= 20, f.name + ' is a short stretch on a big platform (' + (f.board - f.x0) + ' columns)');
  ok(L.ents.some(e => e.t === 'check' && e.x > f.x0 && e.x < f.board), f.name + ': a station on it'); }
ok(L.decor.some(d => d.kind === 'buffer' && d.x === FOOT[0].x0 + 1) && at(FOOT[0].x0 + 1, 36) === T.SOLID, 'THE WRECK: the buffer stop the cart hits');
{ const mv = L.ents.find(e => e.t === 'mover' && e.vert && e.x > FOOT[1].x0 && e.x < FOOT[1].board); ok(mv, 'THE LIFT: a cage lift (a vertical mover)');
  ok(mv && stand(at(mv.x + mv.len, mv.y - mv.rise)) && at(mv.x + mv.len, mv.y - mv.rise - 1) === T.AIR, 'its top meets the high line (' + (mv.y - mv.rise) + ')'); }
/* COLLECTIBLES, STATIONS */
ok(L.ents.filter(e => e.t === 'stray' && e.kind === 'orenugget').length === 10, 'ten ore nuggets');
ok(L.ents.filter(e => e.t === 'silver').length === 3 && !L.ents.some(e => e.t === 'relic'), 'three silvers, no relic');
const st = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
ok(st.length >= 6, st.length + ' stations');
/* THE GREAT DRILL (2 and 3) */
const A = L.arena; ok(A && A.boss === 'greatdrill' && A.music === 'greatdrill' && L.ents.some(e => e.t === 'greatdrill'), 'THE GREAT DRILL in its arena, its own theme');
const G = GD.geom(A, TS); ok(G.laneY.every((y, i) => i === 0 ? stand(at(A.drill.sx + 5, G.F)) : at(A.drill.sx + 5, G.F - GD.DRILL_STAGE.lanes[i]) === T.RAIL), 'three lines in the tunnel (low floor, mid and high rail)');
const ghands = readFileSync(new URL('../src/great-drill-hands.js', import.meta.url), 'utf8');
ok(/MCA\.tunnel\(g, x0, x1/.test(ghands) && /fight \? 0 : /.test(ghands), 'the tunnel is drawn edge to edge while it fights, one loop at one pace (no half-moving scenery)');
const world = (log, x = {}) => ({ hit: () => false, number: (a, b, t) => log.push(t), sound: () => {}, shake: () => {}, music: () => {}, crash: () => { x.crash = (x.crash || 0) + 1; }, shove: () => {}, rammed: () => { x.ram = (x.ram || 0) + 1; }, arena: k => (x.arena = k), ramV: MC.ramV });
const fight = () => { const S = GD.newFight(G), e = { hp: 600, maxHp: 600, mode: 'idle', modeT: 0, open: 0 }; S.cd = 99; S.oreT = 99; return { S, e }; };
const hero = (S, v, lane = 0, dx = -40) => [{ x: S.ores.length ? S.ores[0].x + dx : G.x0 + 100, y: G.laneY[lane], ground: true, alive: true, lane, v }];
{ const { S, e } = fight(), log = [], x = {}; S.ores.push({ x: G.x0 + 160, lane: 0, id: 1, y: G.laneY[0], fly: false, vy: 0, dy: 0 });
  for (let i = 0; i < 240 && !GD.drillOpen(e); i++) GD.stepDrill(e, S, 1 / 60, [{ x: S.ores.length ? S.ores[0].x - 10 : G.x0, y: G.laneY[0], ground: true, alive: true, lane: 0, v: MC.boost }], world(log, x));
  ok(x.ram === 1 && GD.drillOpen(e) && S.n.jams === 1, 'an ore cart RAMMED at full pump flies up the line into its gears: JAMMED');
  const d = GD.takeBlow(e, S, 10); ok(d === 10 * GD.DRILL.jamMul, 'jammed, the cab takes x' + GD.DRILL.jamMul + ' (' + d + ')');
  for (let i = 0; i < 400 && GD.drillOpen(e); i++) GD.stepDrill(e, S, 1 / 60, [], world(log)); ok(!GD.drillOpen(e) && S.ward > 0 && log.some(t => /PLATES ARE UP/.test(t)), 'the jam ends in a told ward');
  ok(GD.takeBlow(e, S, 10) === 10 * GD.DRILL.armour, 'in the ward a blow still bites (x' + GD.DRILL.armour + ', B15: never totally invulnerable)');
  S.ores.push({ x: GD.rearX(S) - 30, lane: 0, id: 2, y: G.laneY[0], fly: true, vy: 0, dy: 0 }); for (let i = 0; i < 30; i++) GD.stepDrill(e, S, 1 / 60, [], world(log));
  ok(!GD.drillOpen(e) && S.n.shrugged === 1, 'an ore cart rammed into it while its plates are up is shrugged off (B3: the opening\'s verb is warded)');
  for (let i = 0; i < 300 && S.ward > 0; i++) GD.stepDrill(e, S, 1 / 60, [], world(log)); ok(GD.takeBlow(e, S, 10) === 10 * GD.DRILL.armour && GD.DRILL.armour >= 0.4, 'out of the ward the cab is ARMOURED: x' + GD.DRILL.armour + ' (B15)'); }
{ const { S, e } = fight(), log = [], x = {}; S.ores.push({ x: G.x0 + 160, lane: 0, id: 1, y: G.laneY[0], fly: false, vy: 0, dy: 0 });
  for (let i = 0; i < 240 && S.ores.length; i++) GD.stepDrill(e, S, 1 / 60, [{ x: S.ores.length ? S.ores[0].x - 10 : G.x0, y: G.laneY[0], ground: true, alive: true, lane: 0, v: MC.cruise }], world(log, x));
  ok(x.crash === 1 && !GD.drillOpen(e) && S.n.crashed === 1, 'met at cruise the ore cart is a CRASH (it spills; no jam)'); }
{ const { S, e } = fight(), log = []; S.ores.push({ x: G.x0 + 200, lane: 0, id: 1, y: G.laneY[0], fly: false, vy: 0, dy: 0 });
  for (let i = 0; i < 240 && S.ores.length; i++) GD.stepDrill(e, S, 1 / 60, [{ x: G.x0 + 100, y: G.laneY[1], ground: true, alive: true, lane: 1, v: MC.boost }], world(log));
  ok(!GD.drillOpen(e) && S.n.rammed === 0, 'an ore cart passes under a hero on the MID line (only the LOW line rams it)'); }
for (const mode of ['sleep', 'wake', 'idle', 'rockTell', 'revTell', 'reverse', 'dynTell', 'lunge', 'chain', 'collapseTell', 'phase']) { const { S, e } = fight(); e.mode = mode; ok(GD.takeBlow(e, S, 10) > 0, 'B15: a blow in "' + mode + '" takes something (never totally invulnerable)'); }
ok(GD.DRILL.stackX - GD.DRILL.revV * GD.DRILL.revT > GD.DRILL.cabIn && GD.DRILL.cabH < GD.DRILL_STAGE.lanes[2] * 16 - GD.DRILL_STAGE.lanes[1] * 16, 'the reverse ram has a jump: on the HIGH line its roof passes under you and its stack is ' + GD.DRILL.stackX + ' px in');
{ const D = GD.DRILL; ok(D.revTell >= 0.9 && D.rockTell >= 1.0 && D.chuteTell >= 1.0 && D.dynTell + D.dynFuse >= 1.2 && D.lungeTell >= 0.9 && D.chainTell >= 0.8 && D.collapseTell >= 1.0,
  'every move told: the reverse ' + D.revTell + ' s, the boulders ' + D.rockTell + ' s, the chute ' + D.chuteTell + ' s, the dynamite ' + (D.dynTell + D.dynFuse) + ' s, the lunge ' + D.lungeTell + ' s, the hook ' + D.chainTell + ' s, the roof ' + D.collapseTell + ' s'); }
ok(GD.DRILL.revV * GD.DRILL.revT < GD.DRILL.homeR - 40, 'the reverse ram sweeps ' + Math.round(GD.DRILL.revV * GD.DRILL.revT) + ' px: room behind it to brake out of its way');
{ const C = GD.DRILL.chain, has = (p, m) => C[p].includes(m); ok(has(1, 'dynamite') && has(1, 'reverse') && has(1, 'rocks') && !has(1, 'lunge') && !has(1, 'chain') && !has(1, 'collapse'), 'P1: NEW the DYNAMITE (with the reverse ram and the boulders)');
  ok(has(2, 'lunge') && has(2, 'chain') && !has(2, 'collapse'), 'P2: NEW the SPIN-UP LUNGE and the GRAPPLE CHAIN'); ok(has(3, 'collapse'), 'P3: NEW the ROOF COLLAPSE (and the roof takes the HIGH line)');
  ok(!Object.values(C).flat().includes('sparks'), 'the spark spray is retired (the lunge is its rear\'s line attack now)'); }
{ const { S, e } = fight(), log = []; S.ph = 2; e.hp = e.maxHp * 0.29; const x = {}; GD.stepDrill(e, S, 1 / 60, [], world(log, x)); ok(S.ph === 3 && S.highDown && x.arena === 'highDown' && GD.lanesOf(S).join() === '0,1', 'P3 brings the roof down on the HIGH line: two lines left (the arena changes)');
  ok(log.some(t => /HIGH LINE/.test(t)) && isCallout('THE ROOF TAKES THE HIGH LINE: TWO LINES LEFT'), 'and says so'); }
/* GREAT DRILL 3: THE OPENING IS THE LEVEL'S VERB - its chute's POINTS LEVER thrown (a blow or E, from any line) dumps its own ore into its gears: JAMMED */
const H0 = (x, lane = 1) => [{ x, y: G.laneY[lane], ground: true, alive: true, lane, v: MC.cruise }];
{ const { S, e } = fight(), log = []; S.oreT = 0.01; S.cd = 99;
  GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), world(log)); ok(S.lever && !S.lever.thrown && S.chute && log.some(t => /ORE!/.test(t)), 'each cycle its chute rattles (ORE!) and its POINTS LEVER comes down the tunnel at you');
  const lb = GD.leverBox(G, S.lever); ok(lb.t <= G.laneY[2] - 30 && lb.b >= G.laneY[0], 'the lever is a tall trackside post: a blow from the LOW, MID or HIGH line reaches it');
  ok(S.lever.x - (G.x0 + 100) >= 150 && (S.lever.x - (G.x0 + 100)) / GD.DRILL.cruise >= 1.0, 'it rises ' + Math.round(S.lever.x - G.x0 - 100) + ' px ahead of you: over a second to be ready for it');
  ok(GD.throwLever(S, world(log)) && !GD.throwLever(S, world(log)), 'thrown once (a second blow does nothing)');
  for (let i = 0; i < 120 && !GD.drillOpen(e); i++) GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), world(log));
  ok(GD.drillOpen(e) && S.n.jams === 1 && S.ores.length === 0 && log.some(t => /ITS OWN ORE IN ITS GEARS/.test(t)), 'the chute dumps its own ore into its gears: JAMMED (no ore cart needed)'); }
{ const { S, e } = fight(), log = []; S.oreT = 0.01; S.cd = 99;
  for (let i = 0; i < 400 && !S.ores.length; i++) GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), world(log));
  ok(!GD.drillOpen(e) && S.ores.length === 1 && !S.lever, 'a lever let go by unthrown: it kicks a loaded ORE CART off its back instead (the ram, the bonus way)'); }
{ const { S, e } = fight(), log = []; S.ward = 2; S.oreT = 0.01; S.cd = 99; GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), world(log)); ok(!S.lever, 'no lever comes while its plates are up (B3)'); }
/* THE NEW MOVES, pure: each dodged by the cart's own verbs */
const hits = () => { const got = []; return { got, w: Object.assign(world([]), { hit: (b, d, name, o) => { got.push({ b, name, o }); return true; } }) }; };
{ const { S, e } = fight(); S.cd = 0; S.i = 0; const { got, w } = hits(), hx = G.x0 + 100;
  GD.stepDrill(e, S, 1 / 60, H0(hx), w); ok(e.mode === 'dynTell', 'DYNAMITE: the arm back first (told)');
  for (let i = 0; i < 200 && !got.length; i++) GD.stepDrill(e, S, 1 / 60, H0(hx), w);
  const b = got.find(g => g.name === 'DYNAMITE'); ok(b && hx > b.b[0] && hx < b.b[1] && b.b[2] >= G.laneY[1] - 30, 'held on its line, the stick bursts where you are; its blast is on the line (a jump clears it)');
  const { S: S2, e: e2 } = fight(); S2.cd = 0; const h2 = hits(); let x2 = hx; for (let i = 0; i < 200 && !h2.got.length; i++) { x2 -= 110 / 60; GD.stepDrill(e2, S2, 1 / 60, H0(x2), h2.w); }
  const b2 = h2.got.find(g => g.name === 'DYNAMITE'); ok(b2 && !(x2 > b2.b[0] && x2 < b2.b[1]), 'braked back off it, it bursts ahead of you'); }
{ const { S, e } = fight(); S.ph = 2; S.cd = 0; S.i = 0; const { got, w } = hits(); for (let i = 0; i < 120 && !got.length; i++) GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), w);
  const b = got.find(g => g.name === 'THE SPIN-UP LUNGE'); ok(b && b.o.duck === G.laneY[1] - GD.DRILL.lungeHead && b.b[3] <= G.laneY[1] - 8, 'THE SPIN-UP LUNGE comes at head height on your line (a ducked tub is under it: the hands\' duckClears)'); }
{ const { S, e } = fight(); S.ph = 2; S.cd = 0; S.i = 2; const { got, w } = hits(); let snag = null; for (let i = 0; i < 120 && !S.snag; i++) GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), w);
  ok(S.snag && S.n.snags === 1, 'THE GRAPPLE CHAIN snags a cart on its line');
  ok(GD.freeSnag(S, 'cut') && !S.snag && S.n.cuts === 1, 'struck, the chain is cut (or a jump off the line slips it)');
  const { S: S3, e: e3 } = fight(); S3.ph = 2; S3.cd = 0; S3.i = 2; for (let i = 0; i < 120 && !S3.snag && S3.n.chain < 2; i++) GD.stepDrill(e3, S3, 1 / 60, [{ x: G.x0 + 100, y: G.laneY[1] - 30, ground: false, alive: true, lane: -1, v: MC.cruise }], world([]));
  ok(!S3.snag, 'a cart in the air when the hook lands is not snagged'); }
{ const { S, e } = fight(); S.ph = 3; S.highDown = true; S.cd = 0; S.i = 0; const { got, w } = hits(); for (let i = 0; i < 200 && !got.length; i++) GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), w);
  const b = got.find(g => g.name === 'THE ROOF'); ok(b && b.b[2] <= G.ceilY && b.b[3] >= G.laneY[0] && G.x0 + 100 > b.b[0] && G.x0 + 100 < b.b[1], 'ROOF COLLAPSE: rubble through every line on its told spot - where you hold');
  ok(GD.DRILL.collapseApart > (MC.boost - MC.cruise) * GD.DRILL.collapseTell + GD.DRILL.collapseW, 'its spots are far enough apart that a pump runs through between them'); }
{ const { S, e } = fight(); S.lever = { x: G.x0 + 120, id: 1, thrown: false }; S.chute = { t: 1, R: 300 }; const mem = {}, ask = t => GD.drillPlan({ P: { x: G.x0 + 100, y: G.laneY[0], ground: true, face: 1, atk: -1, lane: 0, v: 150 }, e, S, reach: 22, rng: () => 0.9, mem, t });
  ask(5); const pl = ask(5.5); ok(pl.talk && /lever/.test(pl.why), 'the bot throws the points lever as it passes (E, from the LOW line)'); }
{ const { S, e } = fight(); S.lunge = { lane: 1, t: 0.6, on: false }; S.n.lunge = 1; const mem = {}, ask = t => GD.drillPlan({ P: { x: G.x0 + 100, y: G.laneY[1], ground: true, face: 1, atk: -1, lane: 1, v: 150 }, e, S, reach: 22, rng: () => 0.9, mem, t });
  ask(5); const pl = ask(5.5); ok(pl.duck, 'the bot ducks in its tub under the lunge'); }
{ const { S, e } = fight(); S.chute = { x: G.x0 + 200, t: 0.6 }; const mem = {}, ask = t => GD.drillPlan({ P: { x: G.x0 + 120, y: G.laneY[1], ground: true, face: 1, atk: -1, lane: 1, v: 150 }, e, S, reach: 22, rng: () => 0.9, mem, t });
  ask(5); const pl = ask(5.5); ok(/ore/.test(pl.why) && pl.drop, 'the bot drops to the LOW line to ram when the chute rattles with no lever left'); }
ok(GD.DRILL.hp >= 1900 && GD.DRILL.jamCap >= 0.15, 'the drill\'s health is never lowered under the greybox floor (' + GD.DRILL.hp + ')');
console.log('minecart: ' + n + ' checks ok');
