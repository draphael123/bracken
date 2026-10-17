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
import { MC, BOOST_GAP, SECTIONS, ARCS, FOOT, ARENA_X, gateX, cartSpeed, runeAt, runeHits, rampFlight } from '../src/minecart.js';
import { STUCK_HANDS } from '../src/stuck-spots.js';
import { isCallout } from '../src/hint-lines.js';
import * as GD from '../src/great-drill.js';
import * as FMG from '../src/foreman.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'minecart'); ok(lv, 'minecart is in LEVELS'); ok(lv.needs === 'oreroad', 'THE DEEP RAILS needs THE ORE ROAD (it is ' + lv.needs + ')');
ok(LEVELS.find(l => l.id === 'storm').needs === 'minecart', 'Stormhold needs THE DEEP RAILS: it is ON THE MAIN ROAD, Ore Road -> Deep Rails -> Stormhold (Daniel 10-09)');
ok(!lv.hidden && !lv.secret && !lv.needsKills && !lv.needsTime, 'no hidden, secret or kill/time gate: a main-road level');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
{ const line = main.split(/\r?\n/).find(l => /\{ id: 'minecart', kind: 'level'/.test(l)); ok(line && !/spur: true/.test(line), 'its map node is ON THE ROAD (not a spur)');
  const m = /x: (\d+), y: (\d+)/.exec(line), path = /const CRAG_PATH = (\[\[.*?\]\]);/.exec(main); ok(m && path && new Function('UC_ROAD', 'return ' + path[1])(!!(LEVELS.find(l => l.id === 'undercrown') || {}).needs).some(([x, y]) => x === +m[1] && y === +m[2]), 'and the crag road runs through its node'); }
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
ok(SECTIONS.length === 12 && SECTIONS.find(s => s[0] === 'THE TWIN LINES') && SECTIONS.find(s => s[0] === 'THE SPOIL PITS') && SECTIONS.every((s, i) => i === 0 || s[1] > SECTIONS[i - 1][1]), 'eleven sections (deeprails4: THE TWIN LINES went in before the flooded run; deeprails5: THE SPOIL PITS after it) and the arena, in order');
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
for (const f of FOOT) ok(T_.some(t => t.x < f.x0 && t.at >= f.x0 && /DERAIL|LIFT|ON FOOT/.test(t.text)), 'the ' + f.name + ' stretch is told before the cart stops');
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
    /* (deeprails4, Daniel 10-12 'duck + switch timing too tight'): from the beam's far edge to the bridge is room to unduck and throw it - >= 0.6 s at cruise, and E
       reaches a switch from MC.swReach (>= 44 px); a held brake (a crawl) is always more */
    { const b = L.mcBeams.filter(q => q.row === p.prow && q.x1 < p.x).sort((q, r) => r.x1 - q.x1)[0], room = (p.x0 - (b.x1 + 1)) * TS;
      ok(room / MC.cruise >= 0.6, p.id + ': ' + room + ' px (' + (room / MC.cruise).toFixed(2) + ' s at cruise) from its beam to its bridge'); }
    const exam = L.mcExam.some(([a, b]) => p.x0 >= a && p.x1 <= b); ok(p.x0 >= a3[0] ? exam : !exam, p.id + (exam ? ': in the exam - a fall is a REAL death (told)' : ': a fall here is cheap (A10)')); } }
/* SWITCH SIDES (deeprails4, Daniel 10-12): THE TWIN LINES - each stretch blocked on both sides (a LOW BEAM on the low line, DUCK; a GAP in the high line over it, JUMP);
   a SIDE SWITCH (a points lever, the level's verb) drops you to the low line, the cart's jump puts you back up; some of it only one side's; teach -> test -> remix -> exam */
{ const A = ARCS.sides; ok(A && A.teach[1] < A.test[0] && A.test[1] < A.remix[0] && A.remix[1] < A.exam[0], 'the sides arc runs teach -> test -> remix -> exam in order');
  const HI = 27, LO = 30, twin = SECTIONS.find(q => q[0] === 'THE TWIN LINES')[1], end = SECTIONS.find(q => q[0] === 'THE FLOODED RUN')[1];
  const splits = L.mcBeams.filter(b => b.row === LO && b.x0 >= twin && b.x0 < end), gapAt = x => !stand(at(x, HI)) && !stand(at(x, HI - 1)) && !stand(at(x, HI + 1));
  ok(splits.length >= 3, splits.length + ' splits in the twin lines (teach, test, remix)');
  for (const b of splits) { ok([b.x0, b.x1].every(gapAt) && stand(at(b.x0 - 4, HI)) && stand(at(b.x1 + 4, HI)), 'the split at ' + b.x0 + ': a GAP in the high line over the low line\'s BEAM (jump high, or duck low)');
    ok(stand(at(b.x0, LO)) && stand(at(b.x0 - 3, LO)) && stand(at(b.x1 + 3, LO)), 'the split at ' + b.x0 + ': the low line runs on under it (a fall from the high gap lands on it)');
    const sw = L.mcPoints.find(p => p.side && p.x < b.x0 && b.x0 - p.x <= 10); ok(sw && sw.dflt === 'set' && sw.prow === HI, 'the split at ' + b.x0 + ': a SIDE SWITCH before it on the high line (' + (sw && sw.id) + ': set - stay high; thrown - drop low)'); }
  ok(splits.some(b => b.x0 >= A.teach[0] && b.x0 <= A.teach[1]) && splits.some(b => b.x0 >= A.test[0] && b.x0 <= A.test[1]) && splits.some(b => b.x0 >= A.remix[0] && b.x0 <= A.remix[1]), 'a split taught, tested and remixed');
  ok(L.ents.some(e => e.t === 'sign' && e.x >= twin && e.x <= A.teach[1] && /TWIN|DUCK/.test(e.text)) && T_.some(t => t.x < A.teach[1] && t.at >= A.teach[0] && /JUMP/.test(t.text) && /DUCK/.test(t.text)), 'taught: a sign and a tell (jump high, duck low)');
  const oreHi = L.ents.filter(e => e.t === 'stray' && e.x >= twin && e.x < end); ok(oreHi.length >= 1 && oreHi.every(e => (LO * TS - 51 - 26) > (e.y + 1) * TS && (HI * TS - 51 - 26) < (e.y + 1) * TS), 'ore only the HIGH side reaches (a jump off the high line takes it, the low line\'s cannot)');
  ok(L.ents.some(e => (e.t === 'coin' || e.t === 'mend') && e.x >= twin && e.x < end && e.y === LO - 2), 'and the low side has its own (coins, a mend)');
  /* THE EXAM'S SIDES: the flooded run's fork - high: a gap over the low beam, then a crusher; low: the beam, then a gate */
  const xb = L.mcBeams.find(b => b.x0 >= A.exam[0] && b.x0 <= A.exam[1] && b.row === LO); ok(xb && gapAt(xb.x0) && L.mcCrushers.some(c => c.row === HI && c.x > xb.x1 && c.x - xb.x1 <= 6) && L.mcGates.some(g => g.row === LO && g.x > xb.x1 && g.x - xb.x1 <= 10), 'the exam\'s fork is a split too: high - a gap then a crusher, low - a beam then a gate'); }
/* THE RAIL RAIDERS (deeprails4: CART COMBAT 3) - goblins in carts alongside on the other line: EXISTING foes, told throws and told boardings */
{ const rr = L.ents.filter(e => e.ride && e.ride.raid); ok(rr.length >= 2 && rr.every(e => e.t === 'miner') && new Set(rr.map(e => e.ride.row)).size === 2, rr.length + ' raiders (existing goblin miners in carts), one on each line');
  ok(MC.raidTell >= 0.6 && MC.boardTell >= 0.8 && MC.leapT >= 0.8, 'a raider\'s throw is told ' + MC.raidTell + ' s, his boarding ' + MC.boardTell + ' s + his leap ' + MC.leapT + ' s (his shadow on your rail)');
  ok(/cart\.raid/.test(hands) && /M\.shadows\.push\(\{ x: runeAt\(P\.x, heroV, MC\.boardTell/.test(hands) && /A RAIDER'S PICK/.test(hands), 'he throws at your mark and boards onto your line (his shadow first)');
  ok(T_.some(t => /RAIDERS/.test(t.text) && t.x < Math.min(...rr.map(e => e.ride.trig)) + 2), 'they are told before they come'); }
ok(MC.swReach >= 44 && MC.swReach > MC.leverReach, 'a SWITCH answers E from ' + MC.swReach + ' px (deeprails4: wider than a points lever)');
/* THE FOREMAN (deeprails3: THE MINI, src/foreman.js) */
{ { const st = L.ents.filter(e => e.t === 'check').map(e => e.x), F0 = FMG.FOREMAN.cols[1], ex = L.mcPoints.find(p => p.id === 'examSw');
    ok(st.some(x => x > F0 && x <= F0 + 4 && x < ex.x - 6), 'a STATION right after the Foreman gate (' + F0 + '), before the exam duck + switch (deeprails4, Daniel 10-12): a later death never redoes him');
    { const nx = st.filter(x => x > F0 + 4).sort((a, b) => a - b)[0]; ok(nx === undefined || nx - (F0 + 2) >= 134, 'and the next station is a section on (A10b: ' + (nx === undefined ? 'none' : nx - (F0 + 2)) + ' columns - deeprails5: STATION SEVEN after THE SPOIL PITS exam)'); } }
 const fm = L.ents.find(e => e.mini && e.ride && e.ride.foreman), M_ = L.mini, F = FMG.FOREMAN, G = FMG.geom(TS);
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
  const log = [], C = (x = {}) => ({ ramV: MC.ramV, ramDmg: MC.ramDmg, hit: (h, d) => (x.hit = (x.hit || 0) + d), bounce: () => (x.bounce = (x.bounce || 0) + 1), stomp: (h, d, br) => { x[br ? 'braced' : 'stomp'] = d; }, spiked: (h, d) => (x.spiked = (x.spiked || 0) + d),
    board: () => (x.board = 1), release: (b, how) => (x.release = how), lob: () => (x.lob = 1), number: (a, b, t) => log.push(t), sound: () => {}, chip: d => (x.chip = d) });
  { const { S, e } = mk(), x = {}, fx = FMG.foremanX(S), h = { x: fx - 6, y: G.topY + 2, prevY: G.topY - 3, vy: 120, ground: false, alive: true, riding: true, v: MC.cruise, pp: {} };
    FMG.stepForeman(S, e, 1 / 60, [h], C(x)); ok(x.board && x.stomp === Math.ceil(400 * F.stompK) && S.mode === 'boarded' && FMG.foremanOpen(S), 'a hero landing on his cart from above BOARDS it: a stomp (' + x.stomp + ' of 400) and he is OPEN');
    ok(FMG.takeBlade(S, 10) === 10, 'while you stand on his cart a blade is whole');
    for (let i = 0; i < 200 && !x.release; i++) FMG.stepForeman(S, e, 1 / 60, [], C(x)); ok(x.release === 'lurch' && S.ward > 0 && log.includes(FMG.FOREMAN_LINES.lurch), 'then a told LURCH throws you off - back into your own cart - and he braces');
    const y = {}; FMG.stepForeman(S, e, 1 / 60, [{ ...h, x: FMG.foremanX(S) - 6 }], C(y)); ok(y.braced > 0 && !y.board && S.n.braced === 1, 'a landing on him while he is braced is turned (a clank, a sliver: B15)');
    ok(FMG.takeBlade(S, 10) === Math.round(10 * F.armour), 'and a blade from the cart is x' + F.armour + ' again');
    /* THE MISSED BOARDING (Daniel 10-12): once the spikes have RISEN (drawn, a sound, the word) a landing on his rim costs the full bump and throws you back */
    ok(log.includes(FMG.FOREMAN_LINES.spikesUp), 'the spikes come up TOLD: ' + FMG.FOREMAN_LINES.spikesUp);
    for (let i = 0; i < Math.ceil(F.spikeRise * 60) + 2; i++) FMG.stepForeman(S, e, 1 / 60, [], C({}));
    const z = {}; FMG.stepForeman(S, e, 1 / 60, [{ ...h, x: FMG.foremanX(S) - 6 }], C(z)); ok(z.spiked === F.bumpDmg && F.spikeDmg === F.bumpDmg && !z.board && !z.braced && S.n.spiked === 1, 'a landing on his rim with the spikes up costs the FULL BUMP (' + z.spiked + ') and throws you back');
    ok(F.spikeRise <= 0.5 && F.spikeBack > 0, 'the spikes are told ' + F.spikeRise + ' s before they bite');
    S.mode = 'idle'; S.cd = 0; S.i = 2; log.length = 0; FMG.stepForeman(S, e, 1 / 60, [{ ...h, x: FMG.foremanX(S) - 60, y: G.lowY, prevY: G.lowY, vy: 0, ground: true }], C({})); ok(S.mode === 'driftTell' && log.includes(FMG.FOREMAN_LINES.spikesWait) && !log.includes(FMG.FOREMAN_LINES.slows), 'his drift with the spikes up says so (SPIKES UP: WAIT), not JUMP ON HIM');
    { const hb = { ...h, x: FMG.foremanX(S) - 60, y: G.lowY, prevY: G.lowY, vy: 0, ground: true, riding: true, v: MC.cruise }, xb = {}; for (let i = 0; i < 400 && S.mode !== 'away'; i++) FMG.stepForeman(S, e, 1 / 60, [hb], C(xb));
      ok(S.mode === 'away' && !xb.hit && S.ward > 0 && S.n.bumps === 0, 'and WAIT is the answer (deeprails5): a hero held on the low line is never bumped - the braced drift stops short of him and pulls away'); }
    for (let i = 0; i < Math.ceil(F.wardT * 60) + 5; i++) FMG.stepForeman(S, e, 1 / 60, [], C({})); ok(S.ward === 0 && log.includes(FMG.FOREMAN_LINES.spikesDown), 'and the spikes coming DOWN are told too'); }
  { const { S, e } = mk(), x = {}; const h = { x: FMG.foremanX(S) - 18, y: G.lowY, prevY: G.lowY, vy: 0, ground: true, alive: true, riding: true, v: MC.cruise, pp: {} };
    FMG.stepForeman(S, e, 1 / 60, [h], C(x)); ok(x.hit === F.bumpDmg && x.bounce === 1 && !x.board, 'met in your cart on the LOW line he is a BUMP (armoured: it hurts you and throws you back)'); }
  { const { S, e } = mk(), x = {}; S.mode = 'ramTell'; S.mT = 0.01; S.R = 250; const h = { x: G.x0 + 250 - F.ramV * F.ramT - F.halfW - 40, y: G.lowY, prevY: G.lowY, vy: 0, ground: true, alive: true, riding: true, v: MC.cruise, pp: {} };
    for (let i = 0; i < 60; i++) FMG.stepForeman(S, e, 1 / 60, [h], C(x)); ok(!x.hit, 'his ram stops short of a cart braked back out of its reach'); }
  { const { S, e } = mk(); S.mode = 'drift'; S.R = 160; const mem = {}, ask = t => FMG.foremanPlan({ P: { x: G.x0 + 118, y: G.lowY, ground: true, vy: 0, atk: -1, v: MC.cruise, lane: 0 }, S, rng: () => 0.9, mem, t });
    ask(1); const pl = ask(1.5); ok(pl.jump, 'the bot jumps on him as he drops back to it (' + pl.why + ')'); } }
/* THE ON-FOOT STRETCHES (deeprails2) */
ok(FOOT.length === 3 && FOOT.some(f => f.derail) && FOOT.some(f => !f.derail) && FOOT.some(f => f.id === 'pits'), 'three on-foot stretches: a derailment, a lift (Daniel 10-09) and THE SPOIL PITS (deeprails5, Daniel 10-14)');
for (const f of FOOT) { ok(L.ents.some(e => e.t === 'mccart' && e.x === f.board), f.name + ': a cart waits at its end (column ' + f.board + ')');
  ok(f.board - f.x0 >= 20, f.name + ' is a short stretch on a big platform (' + (f.board - f.x0) + ' columns)');
  ok(L.ents.some(e => e.t === 'check' && e.x > f.x0 && e.x < f.board), f.name + ': a station on it'); }
ok(L.decor.some(d => d.kind === 'buffer' && d.x === FOOT[0].x0 + 1) && at(FOOT[0].x0 + 1, 36) === T.SOLID, 'THE WRECK: the buffer stop the cart hits');
{ const mv = L.ents.find(e => e.t === 'mover' && e.vert && e.x > FOOT[1].x0 && e.x < FOOT[1].board); ok(mv, 'THE LIFT: a cage lift (a vertical mover)');
  ok(mv && stand(at(mv.x + mv.len, mv.y - mv.rise)) && at(mv.x + mv.len, mv.y - mv.rise - 1) === T.AIR, 'its top meets the high line (' + (mv.y - mv.rise) + ')'); }
/* THE SPOIL PITS (deeprails5, Daniel 10-14 #1): a PIT section on foot after the Foreman - lots of pits; hazards in the way you JUMP UP over or DROP DOWN under; high or low;
   A14 platforming with its own exam; teach -> test -> remix -> exam; A10b kept; the cart parked at its end */
{ const [p0, p1] = sec('THE SPOIL PITS'), A = ARCS.pits, D = 30, U = 26, f = FOOT.find(q => q.id === 'pits'), SP = T.SPIKE;
  ok(p0 > FMG.FOREMAN.cols[1] && p1 <= ARENA_X && f && f.x0 >= p0 && f.board < p1, 'THE SPOIL PITS stand after the Foreman (and his station) and before the drill, on foot (' + f.x0 + '-' + f.board + ')');
  ok(A && A.teach[1] < A.test[0] && A.test[1] < A.remix[0] && A.remix[1] < A.exam[0] && A.exam[1] < f.board, 'the pits arc runs teach -> test -> remix -> exam in order');
  const pits = L.mcPits.filter(([a]) => a >= p0 && a < p1); ok(pits.length >= 6, pits.length + ' pits');
  for (const [a, b] of pits) { ok(b - a + 1 <= 4, 'the pit at ' + a + ' is ' + (b - a + 1) + ' wide (every hero clears it with base movement)');
    let floor = -1; for (let y = D; y < L.H; y++) if (at(a, y) === SP) { floor = y; break; } ok(floor > D && at(a, floor + 1) === T.SOLID && [a, b].every(x => !stand(at(x, D))), 'the pit at ' + a + ' has a floor of spoil (spikes) under it - never a bottomless drop'); }
  ok(L.examSpans.length === 1 && L.examSpans[0][0] === A.exam[0] && L.examSpans[0][1] === A.exam[1] && pits.some(([a]) => a >= A.exam[0] && a <= A.exam[1]), 'its exam is an exam span: the pits kill there (src/survival.js examAt)');
  ok(pits.some(([a]) => a < A.exam[0]) && T_.some(t => /PITS KILL/.test(t.text) && t.at <= A.exam[0] + 1 && t.at >= A.exam[0] - 1), 'taught first where they only bite, and the exam is told before it kills (never an untold death)');
  { const cat = c => at(c, U) === T.ONEWAY, low = c => at(c, D) === T.SOLID, cols = []; for (let c = A.teach[0]; c <= A.exam[1]; c++) cols.push(c);
    ok(cols.filter(cat).length >= 50 && cols.filter(low).length >= 50, 'TWO LINES across it: the high catwalk (' + cols.filter(cat).length + ' columns, one-way planks: down + jump drops) and the low walk (' + cols.filter(low).length + ')');
    ok(D - U >= 4, 'the low walk is ' + (D - U) + ' rows under the catwalk: a jump never takes you back up through it (a step does)');
    const spoilHi = cols.filter(c => cat(c) && at(c, U - 1) === SP), spoilLo = cols.filter(c => low(c) && at(c, D - 1) === SP), crHi = L.mcCrushers.filter(k => k.row === U && k.x >= p0 && k.x < p1);
    ok(spoilHi.length >= 4 && spoilLo.length >= 4 && crHi.length >= 2, 'IN THE WAY on each line: spoil on the planks (' + spoilHi.length + ', jump it), crushers over the catwalk (' + crHi.length + ', time them or drop under), spoil on the walk (' + spoilLo.length + ')');
    for (const k of crHi) ok([k.x, k.x + 1].every(low) && ![k.x, k.x + 1].some(c => at(c, D - 1) === SP), 'the crusher at ' + k.x + ' over the catwalk has the low walk clear under it (drop down)');
    const steps = cols.filter(c => at(c, D - 2) === T.SOLID && at(c, D - 3) === T.AIR && low(c)); ok(steps.length >= 4, 'steps off the low walk back up to the catwalk (' + steps.length + ' columns)');
    ok(L.ents.some(e => e.t === 'sign' && e.x >= p0 && e.x <= A.teach[1] && /HIGH/.test(e.text) && /LOW/.test(e.text)) && L.ents.some(e => e.t === 'sign' && e.x >= p0 && e.x <= A.teach[1] && /DROP/.test(e.text)), 'taught by signs at the point of use (high / low; drop under the crusher)'); }
  { const el = L.ents.filter(e => e.elite && e.x >= A.exam[0] && e.x <= A.exam[1]); ok(el.length === 1 && el[0].t === 'brute' && pits.some(([a, b]) => b < el[0].x && el[0].x - b <= 4), 'its exam: one weighty elite (an elite brute) on the last pier, a pit at your back');
    const stp = L.ents.filter(e => e.t === 'check' && e.x > A.exam[1] && e.x < f.board); ok(stp.length === 1, 'a station after the exam (CP after), before the parked cart'); }
  ok(!L.ents.some(e => e.t === 'stray' && e.x >= p0 && e.x < p1), 'no ore here: the quest\'s ten stand where they were'); }
/* THE HAND-OFF (deeprails5, Daniel 10-14 #4): at the end of EVERY on-foot stretch the cart is PARKED (visible: drawn on its own rail, not the column's first rock), you JUMP INTO it,
   and a GATE shuts the line past its nose until you do; taught once (THE WRECK: a sign, a tell, a glint at once) */
{ for (const f of FOOT) { const e = L.ents.find(q => q.t === 'mccart' && q.x === f.board); ok(e && stand(at(f.board, e.y + 1)), f.name + ': its cart is parked ON its rail (row ' + (e && e.y + 1) + ')');
    ok(gateX(f, TS) > f.board * TS + 8 + 8 && gateX(f, TS) < (f.board + 2) * TS, f.name + ': its gate stands just past the cart\'s nose');
    const sp = (STUCK_HANDS.minecart || []).find(s => s.id === 'mc-board-' + f.id); ok(sp && sp.steps[0].is[0] === 'board.' + f.id && sp.steps[0].is[1] === 'out', f.name + ': its cart glints until you are in it (stuck spot ' + (sp && sp.id) + ')'); }
  const w = FOOT[0], spw = STUCK_HANDS.minecart.find(s => s.id === 'mc-board-wreck');
  ok(!spw.steps[0].glint && L.ents.some(e => e.t === 'sign' && e.x > w.x0 && e.x <= w.board && /JUMP INTO/.test(e.text)) && T_.some(t => /JUMP INTO/.test(t.text) && t.at === w.board), 'taught once, at THE WRECK: a sign, a tell and a glint at once (the later carts glint after a stall)');
  ok(/c\.wasAir && P\.vy >= 0 && Math\.abs\(P\.x - cx0\) <= 14/.test(hands) && /P\.mcIn = f\.id/.test(hands) && /else if \(P\.x > gx - 6\) \{ P\.x = gx - 6;/.test(hands), 'the hands board you only on a LANDING in the tub, and the gate holds the line until then');
  ok(/const cartRow = f =>/.test(hands) && !/for \(let y = 0; y < ctx\.LH\(\); y\+\+\) \{ const t = ctx\.cellGet\(f\.board, y\)/.test(hands), 'the parked cart is drawn on its rail (it was drawn at the roof\'s first rock and never showed)'); }
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
  ask(5); const pl = ask(5.5); ok(pl.duck, 'the bot ducks in its tub under the lunge');
  S.lunge.on = true; ok(ask(5.6).duck, 'and while it sweeps'); }
{ const { S, e } = fight(); S.chute = { x: G.x0 + 200, t: 0.6 }; const mem = {}, ask = t => GD.drillPlan({ P: { x: G.x0 + 120, y: G.laneY[1], ground: true, face: 1, atk: -1, lane: 1, v: 150 }, e, S, reach: 22, rng: () => 0.9, mem, t });
  ask(5); const pl = ask(5.5); ok(/ore/.test(pl.why) && pl.drop, 'the bot drops to the LOW line to ram when the chute rattles with no lever left'); }
ok(GD.DRILL.hp >= 1900 && GD.DRILL.jamCap >= 0.15, 'the drill\'s health is never lowered under the greybox floor (' + GD.DRILL.hp + ')');
/* GREAT DRILL 5 (deeprails5, Daniel 10-14: +2 told attacks tied to the gears / rails) - THE SPARE CUTTER (strike it back, or jump it) and THE RAIL CLAW (pump and jump the torn rail, or change line) */
{ const D = GD.DRILL, air = 2 * 320 / 1000 - 0.02;
  ok(D.chain[2].includes('cutter') && D.chain[3].includes('claw') && !D.chain[1].includes('cutter') && !D.chain[1].includes('claw'), 'the spare cutter comes in P2, the rail claw in P3');
  ok(GD.moveGear('cutter').id === 'lunge' && GD.moveGear('claw').id === 'chain', 'each new attack is driven by a gear bank (the cutter by the spin-up gear, the claw by the chain winch): break it and it is gone for the phase');
  ok(D.cutterTell >= 0.8 && D.clawTell >= 0.9, 'both told: the cutter ' + D.cutterTell + ' s, the claw ' + D.clawTell + ' s');
  ok((D.clawW + 12) / D.cruise > air && (D.clawW + 12) / MC.boost < air - 0.12, 'THE TORN RAIL (' + D.clawW + ' px) is too long to clear from a cruising jump and clears from a pumped one (the level\'s pump gap)');
  /* the cutter: told on your line, bowled, it hits a cart that holds; struck back it bites its own gear */
  { const { S, e } = fight(); S.ph = 2; GD.armGears(S); S.cd = 0; S.i = D.chain[2].indexOf('cutter'); const log = [], { got, w } = hits(); w.number = (a, b, t) => log.push(t);
    GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), w); ok(e.mode === 'cutterTell' && log.some(t => /CUTTER: STRIKE IT BACK/.test(t)), 'THE SPARE CUTTER: told first (its boom lifts it) - ' + log.join(' / '));
    for (let i = 0; i < 200 && !got.some(g => g.name === 'THE SPARE CUTTER'); i++) GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), w);
    const b = got.find(g => g.name === 'THE SPARE CUTTER'); ok(b && b.b[2] >= G.laneY[1] - D.cutterH - 1 && b.b[3] <= G.laneY[1] + 2, 'held on its line, the cutter rolls into you at shin height (a jump clears it)');
    const { S: S2, e: e2 } = fight(); S2.ph = 2; GD.armGears(S2); S2.cd = 0; S2.i = D.chain[2].indexOf('cutter'); const lg = [], w2 = Object.assign(world(lg), { hit: () => false });
    for (let i = 0; i < 160 && !(S2.cutters.length && !(S2.cutters[0].fly > 0)); i++) GD.stepDrill(e2, S2, 1 / 60, H0(G.x0 + 100), w2);   /* (bowled: it flies off the boom first - harmless - and lands ahead of you) */
    ok(Math.abs(S2.cutters[0].x - (G.x0 + 100 + D.cutterLead)) < 6, 'it lands ' + D.cutterLead + ' px ahead of you on your line (its landing marked through the flight)');
    const cu = S2.cutters[0], bx = GD.cutterBox(G, cu); ok(GD.strikeCutter(S2, { l: bx.l - 2, r: bx.l + 6, t: bx.t + 2, b: bx.b - 2 }) && cu.back, 'a blow that lands on it strikes it back');
    const hp0 = S2.gears.lunge.hp; for (let i = 0; i < 120 && S2.cutters.length; i++) GD.stepDrill(e2, S2, 1 / 60, H0(G.x0 + 100), w2);
    ok(S2.gears.lunge.hp === hp0 - D.cutterBite && lg.includes('STRUCK BACK: INTO ITS GEARS'), 'struck back, it flies into its own spin-up gear (' + D.cutterBite + ' off it)'); }
  /* the claw: its stretch marked through the tell, then torn: a grounded cart on it is hit */
  { const { S, e } = fight(); S.ph = 3; S.highDown = true; GD.armGears(S); S.cd = 0; S.i = D.chain[3].indexOf('claw'); const log = [], { got, w } = hits(); w.number = (a, b, t) => log.push(t);
    GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), w); ok(e.mode === 'clawTell' && S.clawPend && S.clawPend.lane === 1 && log.some(t => /THE CLAW: PUMP AND JUMP/.test(t)), 'THE RAIL CLAW: told first, on your line (its stretch marked)');
    for (let i = 0; i < 200 && !S.tears.length; i++) GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), w);
    ok(S.tears.length === 1 && Math.abs(S.tears[0].x + D.clawW - (GD.rearX(S) - 8)) < 8, 'then that stretch of rail is torn, just behind the rig');
    for (let i = 0; i < 200 && !got.some(g => g.name === 'THE TORN RAIL'); i++) GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 100), w);
    const b = got.find(g => g.name === 'THE TORN RAIL'); ok(b && b.b[2] >= G.laneY[1] - 6, 'the torn rail comes down the tunnel at you: met on the line it hits (in the air over it you are clear)');
    const o = {}; const { S: S3, e: e3 } = fight(); S3.ph = 3; S3.highDown = true; GD.armGears(S3); S3.cd = 0; S3.i = D.chain[3].indexOf('claw'); GD.stepDrill(e3, S3, 1 / 60, H0(G.x0 + 100), world([]));
    GD.hitGear(e3, S3, 'chain', 999, world([]), o); ok(o.broke && !S3.clawPend && e3.mode !== 'clawTell', 'break the chain winch and a coming claw is gone (its gear drives it)'); }
  /* the bot: strikes a cutter back as it reaches it; with no other line, pumps and jumps a torn rail */
  { const { S, e } = fight(); S.ph = 2; S.cutters = [{ x: G.x0 + 118, lane: 1, id: 7, back: false }]; const mem = {}, ask = t => GD.drillPlan({ P: { x: G.x0 + 100, y: G.laneY[1], ground: true, face: 1, atk: -1, lane: 1, v: 150 }, e, S, reach: 22, rng: () => 0.9, mem, t });
    ask(5); const pl = ask(5.5); ok(pl.atk && /strike it back/.test(pl.why), 'the bot strikes the spare cutter back as it reaches it (' + pl.why + ')'); }
  { const { S, e } = fight(); S.ph = 3; S.highDown = true; S.tears = [{ x: G.x0 + 115, lane: 1, id: 3 }, { x: G.x0 + 115, lane: 0, id: 4 }]; const mem = {}, ask = t => GD.drillPlan({ P: { x: G.x0 + 100, y: G.laneY[1], ground: true, face: 1, atk: -1, lane: 1, v: 150 }, e, S, reach: 22, rng: () => 0.9, mem, t });
    ask(5); const pl = ask(5.5); ok(pl.boost && pl.jump, 'torn on both lines, the bot pumps and jumps it (' + pl.why + ')'); } }
/* THE FOREMAN 5 (deeprails5): +2 told attacks - HIS BOOM (duck) and HIS TIPPED ORE (jump) */
{ const F = FMG.FOREMAN, G5 = FMG.geom(TS);
  ok(F.chain[0].includes('boom') && F.chain[2].includes('tip') && !F.chain[0].includes('tip') && !F.chain[1].includes('tip'), 'the boom from the start, the tipped ore from his second stomp (one new move a stage, B5)');
  ok(F.boomTell >= 0.6 && F.tipTell >= 0.6, 'both told: the boom ' + F.boomTell + ' s, the ore ' + F.tipTell + ' s');
  const mk5 = () => { const S = FMG.newFight(G5), e = { hp: 400, maxHp0: 400, alive: true }; S.mode = 'idle'; S.cd = 0; return { S, e }; };
  const C5 = (x, log) => ({ ramV: MC.ramV, ramDmg: MC.ramDmg, hit: (h, d, name) => { x[name] = (x[name] || 0) + d; }, bounce: () => { x.bounce = (x.bounce || 0) + 1; }, stomp: () => {}, spiked: () => {}, board: () => {}, release: () => {}, lob: () => {}, number: (a, b, t) => log.push(t), sound: () => {}, chip: () => {} });
  const hero5 = (o = {}) => ({ x: G5.x0 + 120, y: G5.lowY, prevY: G5.lowY, vy: 0, ground: true, alive: true, riding: true, v: MC.cruise, pp: { id: 1 }, ...o });
  const BOOM = 'THE FOREMAN\'S BOOM', ORE = 'THE FOREMAN\'S ORE';
  { const { S, e } = mk5(), x = {}, log = []; S.i = F.chain[0].indexOf('boom'); FMG.stepForeman(S, e, 1 / 60, [hero5()], C5(x, log)); ok(S.mode === 'boomTell' && log.includes(FMG.FOREMAN_LINES.boom), 'HIS BOOM: told first (' + FMG.FOREMAN_LINES.boom + ')');
    for (let i = 0; i < 120; i++) FMG.stepForeman(S, e, 1 / 60, [hero5()], C5(x, log)); ok(x[BOOM] === F.boomDmg, 'it swings back down the loop at head height: a cart sitting up is hit (once)');
    const y = {}, { S: S2, e: e2 } = mk5(); S2.i = F.chain[0].indexOf('boom'); for (let i = 0; i < 120; i++) FMG.stepForeman(S2, e2, 1 / 60, [hero5({ duckAt: yy => yy === FMG.boomY(G5) })], C5(y, []));
    ok(!y[BOOM], 'a ducked tub is under it'); }
  { const { S, e } = mk5(), x = {}, log = []; S.stomps = 2; S.i = F.chain[2].indexOf('tip'); FMG.stepForeman(S, e, 1 / 60, [hero5()], C5(x, log)); ok(S.mode === 'tipTell' && log.includes(FMG.FOREMAN_LINES.tip), 'HIS TIPPED ORE: told first (' + FMG.FOREMAN_LINES.tip + ')');
    for (let i = 0; i < 240; i++) FMG.stepForeman(S, e, 1 / 60, [hero5()], C5(x, log)); ok(x[ORE] >= F.tipDmg && x.bounce >= 1, 'its lumps roll back down the line into a cart that holds');
    const y = {}, { S: S2, e: e2 } = mk5(); S2.stomps = 2; S2.i = F.chain[2].indexOf('tip'); for (let i = 0; i < 240; i++) FMG.stepForeman(S2, e2, 1 / 60, [hero5({ ground: false, y: G5.lowY - 30 })], C5(y, []));
    ok(!y[ORE], 'a cart in the air over them is clear'); }
  { const { S } = mk5(); S.mode = 'boom'; S.mT = 0.2; S.n.boom = 1; const mem = {}, ask = t => FMG.foremanPlan({ P: { x: G5.x0 + 120, y: G5.lowY, ground: true, vy: 0, atk: -1, v: MC.cruise, lane: 0 }, S, rng: () => 0.9, mem, t });
    ask(1); ok(ask(1.5).duck, 'the bot ducks his boom');
    S.mode = 'idle'; S.lumps = [{ x: G5.x0 + 140, id: 4 }]; ask(2); ok(ask(2.5).jump, 'and jumps his ore'); } }
/* GREAT DRILL 4 (deeprails4, Daniel 10-12): THE GEARS - each bank drives one attack; break it and that attack is gone for the phase; the fight half gears, half body */
{ const ids = p => GD.phaseGears(p).map(g => g.id).sort().join();
  ok(GD.GEARS.length === 4 && new Set(GD.GEARS.flatMap(g => g.moves)).size === GD.GEARS.flatMap(g => g.moves).length, 'four gear banks, each driving its own attack(s): ' + GD.GEARS.map(g => g.id + '=' + g.moves.join('+')).join(', '));
  ok(ids(1) === 'dyn,roof' && ids(2) === 'chain,dyn,lunge' && ids(3) === 'chain,dyn,lunge,roof', 'a phase shows the banks of the attacks it uses (P1 ' + ids(1) + ' / P2 ' + ids(2) + ' / P3 ' + ids(3) + ')');
  ok([1, 2, 3].every(p => GD.gearsNeed(p) === Math.ceil(GD.phaseGears(p).length / 2)), 'its gears hold each phase line until HALF the phase\'s banks are broken');
  ok(!GD.moveGear('reverse'), 'the reverse ram is the drive itself: no gear stops it');
  /* every bank is reachable by every hero with base kit: a standing swing on its line (the knight's box, the shortest: y-28..y) or a jump off the line under it (apex 51 px) */
  const { S } = fight(); GD.armGears(S); S.ph = 3; GD.armGears(S); const swing = (y) => ({ t: y - 28, b: y }), over = (a, b) => a.t < b.b && a.b > b.t;
  for (const g of GD.GEARS) { const b = GD.gearBoxOf(G, S, g), st = GD.gearStand({ ...S, highDown: false }, g), stand = swing(G.laneY[st.lane]);
    if (!st.jump) ok(over(stand, b), g.id + ': struck standing on the ' + GD.LANE_NAME[st.lane] + ' line');
    else { ok(!over(stand, b) && over(swing(G.laneY[st.lane] - 30), b), g.id + ': out of a standing swing, struck from a JUMP off the ' + GD.LANE_NAME[st.lane] + ' line'); }
    for (const l of [0, 1, 2]) if (l !== st.lane && !(st.jump && l === 0)) ok(!over(swing(G.laneY[l]), b) || (g.lane === l), g.id + ': a standing swing from the ' + GD.LANE_NAME[l] + ' line does not reach it (the choice is where you stand)'); }
  { const g = GD.GEARS.find(k => k.id === 'roof'), st = GD.gearStand({ highDown: true }, g); ok(st.lane === 1 && st.jump && over(swing(G.laneY[1] - 51), GD.gearBoxOf(G, S, g)), 'P3 (the high line down): the roof winch is struck from a jump off the MID line'); }
  ok(GD.gearBoxOf(G, S, GD.GEARS[0]).r - GD.DRILL.gearW <= GD.rearX(S) && GD.gearBoxOf(G, S, GD.GEARS[0]).l >= GD.rearX(S) - 22, 'the banks stand on its rear face, in front of where a hero on the LOW line is stopped (its contact)'); }
{ const { S, e } = fight(), log = []; e.hp = 2400; e.maxHp = 2400; GD.armGears(S); S.cd = 0; S.i = 0;
  ok(GD.hitGear(e, S, 'dyn', 30, world(log)) === 30 && !S.gears.dyn.broken, 'a blow on a gear takes it whole (no armour)');
  const o = {}; GD.hitGear(e, S, 'dyn', 999, world(log), o); ok(S.gears.dyn.broken && o.broke && log.some(t => /DYNAMITE FEED BROKEN/.test(t)), 'a few blows and it breaks - and says which attack is gone');
  ok(GD.drillOpen(e) && S.openKind === 'gear' && e.open >= 3 && log.some(t => /IT STALLS/.test(t)), 'a gear broken STALLS it: the shared open read, ' + e.open + ' s');
  ok(GD.takeBlow(e, S, 10000) <= e.maxHp * GD.DRILL.gearStallCap + 1e-6, 'the stall has its own smaller purse (' + GD.DRILL.gearStallCap + ' of it)');
  for (let i = 0; i < 400 && (GD.drillOpen(e) || S.ward > 0); i++) GD.stepDrill(e, S, 1 / 60, [], world(log));
  let dyn = 0; S.oreT = 999; for (let i = 0; i < 60 * 40; i++) { GD.stepDrill(e, S, 1 / 60, [{ x: G.x0 + 60, y: G.laneY[0], ground: true, alive: true, lane: 0, v: 150 }], world([])); if (e.mode === 'dynTell') dyn++; }
  ok(dyn === 0 && S.n.reverse + S.n.rocks > 3, 'its dynamite is GONE for the phase (40 s: ' + S.n.reverse + ' reverses, ' + S.n.rocks + ' rockfalls, no dynamite)'); }
{ const { S, e } = fight(), log = []; e.hp = 2400; e.maxHp = 2400; GD.armGears(S); const fl = GD.gateFloor(S, e); e.hp = fl + 50; const out = {};
  const d = GD.gateBlow(e, S, 200, out); ok(d === 50 && S.held === 150 && /HIT THE GEARS/.test(out.word), 'THE GEARS HOLD IT: a blow past the 60% line, its gears whole, stops at the line and the rest is HELD (B15: not lost) - "' + out.word + '"');
  e.hp -= d; GD.stepDrill(e, S, 1 / 60, [], world(log)); ok(S.ph === 1, 'and the phase does not turn');
  const o = {}; GD.hitGear(e, S, 'roof', 999, world(log), o); ok(!GD.gateShut(S) && o.release === 150 && S.pass === 150, 'one of its two banks broken: the gate opens and the held blows are passed');
  ok(GD.takeBlow(e, S, 5) === 150 && S.pass === 0, 'the held blows land (THE DRIVE GIVES)'); e.hp -= 150; e.open = 0; e.mode = 'idle'; S.ward = 0; for (let i = 0; i < 4; i++) GD.stepDrill(e, S, 1 / 60, [], world(log));
  ok(S.ph === 2 && GD.gateShut(S) && Object.keys(S.gears).sort().join() === 'chain,dyn,lunge' && !Object.values(S.gears).some(q => q.broken), 'the next phase bolts on new gears (the gate shut again)');
  e.hp = GD.gateFloor(S, e) + 10; ok(GD.gateBlow(e, S, 100) === 10, 'the 30% line holds the same way'); }
{ const { S, e } = fight(); e.hp = 2400; e.maxHp = 2400; S.ph = 3; S.highDown = true; GD.armGears(S); S.cd = 0; const seen = new Set(); for (let i = 0; i < 60 * 60; i++) { GD.stepDrill(e, S, 1 / 60, H0(G.x0 + 60), world([])); seen.add(e.mode); if (e.mode === 'jammed') { e.open = 0; } }
  ok(!seen.has('rockTell'), 'P3 never drops the boulders (its chain has the roof collapse)'); }
{ const { S, e } = fight(); e.hp = 2400; e.maxHp = 2400; GD.armGears(S); const mem = {}, pl = GD.drillPlan({ P: { x: G.x0 + 60, y: G.laneY[1], ground: true, face: 1, atk: -1, lane: 1, v: 150 }, e, S, reach: 22, rng: () => 0.9, mem, t: 5 });
  ok(/gear dyn/.test(pl.why), 'the bot goes for a gear while its gears hold it (' + pl.why + ')'); }
console.log('minecart: ' + n + ' checks ok');
