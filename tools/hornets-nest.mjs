// tools/hornets-nest.mjs - THE HORNET'S NEST and THE HORNET QUEEN 2, in Node (claude/hornetsnest; claude/hornetsnest2: main road level 2, ONE ARENA, the fat honey hornet;
// src/hornets-nest.js, src/hornets-nest-hands.js, src/hornet-swarm.js, src/honey-hornet.js, src/hornet-queen.js, src/hornet-queen-plan.js). No page.
//   A  THE LEVEL: MAIN ROAD LEVEL 2 (needs the Lumber Trail; MARSH WOOD needs it), seven named areas end to end, the rule line, three shrines (the gate's exam, the stair's
//      exam before her door, the foot of the falling nest), ONE arena (her hall, both phases; no outside room), the falling nest's ledges crumbling, the marsh's edge and its
//      gate (opened by her death), every comb's landing on footing three rows under where it is cut from; hornets only (no venom spitter: Daniel 10-23)
//   B  THE LOCKS: every required comb, for ALL NINE heroes (src/reachcore.js opts.hero) - without it landed the way on is not reached; with every comb landed the gate is
//   C  THE SWARM: told rising, its sting a drain only while you stand in it, smoke quiets it (x2 then), it goes home past its leash
//   C2 THE FAT HONEY HORNET: slow, armoured abdomen (a cut behind clanks, never immune), its told RAM, its honey globs (sticky patches), smoke makes it drowsy - down, open
//   D  HER FIGHT (B15 / B3 / B5 / B16): never invulnerable, P1 never cut below its share (the hall tears), her openings and their ward, the stoop that sticks in comb (and
//      not in the floor or the honey), THE HALL TEARS (the torn combs and the last comb hang, the honey floods), a comb dropped on her pins her (capped; the last comb is
//      the big one), a pose for every mode
//   E  THE BOT: a plan in every phase, from a standing start; in P2 it works the combs (a torn comb cut as she passes under it; the last comb from a cut comb)
//   node tools/hornets-nest.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';
import * as HN from '../src/hornets-nest.js';
import * as SW from '../src/hornet-swarm.js';
import * as HH from '../src/honey-hornet.js';
import * as HQM from '../src/hornet-queen.js';
import { hqPlan } from '../src/hornet-queen-plan.js';
import { POSE } from '../src/hornet-queen-hands.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'hornetsnest'), L = lv.build(), TS = 16, W = L.W, at = (x, y) => L.grid[y * W + x];
const foot = v => v === T.SOLID || v === T.ONEWAY || v === T.PLANK || v === T.SPIKE;

/* ---------- A. THE LEVEL ---------- */
ok(lv.needs === 'wood' && !lv.spurOf && !lv.opensOn && LEVELS.find(l => l.id === 'marsh').needs === 'hornetsnest', "MAIN ROAD LEVEL 2: THE LUMBER TRAIL -> THE HORNET'S NEST -> MARSH WOOD (no spur)");
{ const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/if \(!PROG\.nestRoadMig\) \{ PROG\.nestRoadMig = 1; if \(\(PROG\.wood && PROG\.wood\.cleared\) \|\| \(PROG\.marsh && PROG\.marsh\.cleared\)\) PROG\.marshOpen = 1; \}/.test(main) && main.includes("!(lv.id === 'marsh' && PROG.marshOpen)"), 'OLD SAVES: a save past the Lumber Trail keeps MARSH WOOD open (PROG.marshOpen, once)');
  const node = main.match(/\{ id: 'hornetsnest', kind: 'level'[^}]*\}/); ok(node && !/spur: true/.test(node[0]), 'the map node is ON the road (no spur)');
  const order = ['wood', 'hornetsnest', 'store', 'marsh'].map(id => main.indexOf("{ id: '" + id + "', kind:")); ok(order.every((v, i) => v > 0 && (i === 0 || v > order[i - 1])), 'the map walks wood -> the nest -> (the store) -> the marsh'); }
ok(lv.rule === HN.NEST_RULE && /STICKY/.test(lv.rule) && /CUT A HANGING COMB/.test(lv.rule) && /SMOKE POT/.test(lv.rule), 'the rule line says what the hands do: sticky comb, a cut comb drops, a smoke pot quiets');
ok(L.sections.length === 7 && L.sections[0].x0 === 0 && L.sections.every((s, i) => i === 0 || s.x0 === L.sections[i - 1].x1 + 1) && L.sections[6].x1 === W - 1, 'seven named areas end to end: ' + L.sections.map(s => s.name).join(' / '));
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
ok(checks.length === 3 && checks[0] > 150 && checks[0] < 170 && checks[1] > 280 && checks[1] < 295 && checks[2] > 340 && checks[2] < 354, 'three shrines: the gate\'s exam (' + checks[0] + '), the stair\'s exam before her door (' + checks[1] + '), the foot of the falling nest (' + checks[2] + ')');
ok(L.ents.filter(e => e.t === 'hornetqueen').length === 1 && L.arena.boss === 'hornetqueen' && !L.arena2 && !L.escape, 'ONE ARENA: her brood hall, both phases (no outside room, no escape between rooms)');
ok(L.arena.perches.length === 5 && L.arena.perches.filter(p => !p.fall).length === 2 && L.arena.perches.every(p => at(p.x0, p.row) === T.ONEWAY), 'the hall\'s five comb perches (two in the walls that never fall)');
{ const p2 = L.arena.p2, fl = HN.HALL.floor; ok(p2 && p2.torn.length === 2 && p2.last && p2.honey, 'THE HALL TEARS: two torn combs, THE LAST COMB, the honey\'s span');
  for (const c of p2.torn) ok(fl - (c.row + c.rows) === 3 && c.x0 > HN.HALL.x0 + 4 && c.x1 < HN.HALL.x1 - 4, c.id + ': its foot three rows over the hall floor (a rising cut from the honey reaches it)');
  const near = p2.torn.filter(c => c.x1 + 1 === p2.last.x0 || c.x0 - 1 === p2.last.x1); ok(near.length === 2 && (fl - p2.torn[0].rows) - (p2.last.row + p2.last.rows) === 3, 'THE LAST COMB: its foot three rows over a torn comb cut down into the honey, beside both');
  for (let x = p2.last.x0; x <= p2.last.x1; x++) for (let y = p2.last.row; y < p2.last.row + p2.last.rows; y++) assert.ok(at(x, y) === T.AIR || L.arena.perches.some(p => p.row === y && x >= p.x0 && x <= p.x1 && p.fall), 'the last comb hangs in the air (or where a perch that tears loose was) at ' + x + ',' + y); n++;
  ok(p2.honey[0] > L.arena.perches.find(p => p.id === 'L1').x1 && p2.honey[1] < L.arena.perches.find(p => p.id === 'R1').x0 && p2.honey[2] === fl, 'the honey floods the floor between the wall perches'); }
ok(L.crumbles.length === HN.LEDGES.length && L.crumbles.every(c => at(c.x0, c.row) === T.ONEWAY) && L.descent && L.descent.ledges.length === HN.LEDGES.length, 'THE FALLING NEST (after her death): ' + L.crumbles.length + ' comb ledges, each one gives way');
ok(L.gateAfterBoss && L.ents.some(e => e.t === 'gate' && e.x > 400 && e.x < W) && L.pools.length >= 2 && L.pools.every(p => p.shallow), 'THE MARSH EDGE: the first shallow water, and the gate at its end (her death opens the way: gateAfterBoss)');
ok([...L.grid].some((v, i) => v === T.REED && i % W >= 354), 'THE MARSH EDGE: reeds');
for (const c of L.combs) {
  ok(c.land > c.row + c.rows - 1, c.id + ': hangs over where it lands (row ' + c.row + ' -> ' + c.land + ')');
  for (let y = c.row; y < c.row + c.rows; y++) for (let x = c.x0; x <= c.x1; x++) assert.equal(at(x, y), T.AIR, c.id + ': a hanging comb is not footing (air at ' + x + ',' + y + ')');
  const under = c.on ? L.combs.find(o => o.id === c.on) : null, base = under ? under.land : (() => { for (let y = c.row + c.rows; y < L.H; y++) for (let x = c.x0; x <= c.x1; x++) if (foot(at(x, y))) return y; return L.H; })();
  ok(base - (c.row + c.rows) <= 3 + (c.id === 'first' ? 2 : 0), c.id + ': its foot is ' + (base - (c.row + c.rows)) + ' rows over what it is cut from (a rising cut reaches it)'); }
for (const [x, row] of L.smokers) ok(foot(at(x, row + 1)), 'a smoke stand at ' + x + ',' + row + ' stands on footing');
for (const [x0, x1, row] of L.wax) for (let x = x0; x <= x1; x++) assert.ok(foot(at(x, row)), 'wax at ' + x + ',' + row + ' is on footing');
ok(L.wax.length >= 8, L.wax.length + ' wax shelves and floors (fresh comb)');
ok(L.ents.filter(e => e.t === 'swarm').length >= 5 && L.ents.some(e => e.t === 'shield' && e.cnSkin === 'nestguard' && e.elite && e.gate), 'the swarms, and THE NEST-GUARD (an elite holding the gate\'s chamber)');
ok(!L.ents.some(e => e.cnSkin === 'venomspitter') && L.ents.filter(e => e.t === 'spit').every(e => e.cnSkin === 'stinger'), 'NO VENOM SPITTER (Daniel 10-23: it read as a mage) - its machine is a STINGER HORNET now: hornets only');
{ const hh = L.ents.filter(e => e.t === 'honeyhornet'); ok(hh.length >= 3 && hh.length <= 5 && hh.every(e => e.x < HN.HALL.x0 || e.x > HN.HALL.x1), hh.length + ' FAT HONEY HORNETS on the climb (taught, tested, examined), none in her hall');
  ok(hh[0].x < 170 && L.smokers.some(([x]) => Math.abs(x - hh[0].x) < 25), 'the first fat honey hornet meets you near a smoke stand (its answer, taught)'); }

/* ---------- B. THE LOCKS ---------- */
const reached = (R, col, row) => [...R.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= col && Math.abs(y - row) <= 3; });
const without = ids => ({ ...L, reachSpans: L.combs.filter(c => !ids.includes(c.id)).map(c => [c.x0, c.x1, c.land]) });
const LOCKS = [[['first'], 54, 56, 'the buttress root'], [['bridge'], 126, 33, 'past the waste pit'], [['chainA'], 211, 13, 'the wall over the ledge'], [['chainB'], 211, 13, 'the wall over the ledge'], [['lastA'], 230, 7, 'the high wall'], [['lastB'], 230, 7, 'the high wall']];
for (const hero of HERO_MOVE_IDS) {
  ok(reached(floodReach(L, T, { hero }), 414, 65), hero + ': every comb landed - the whole level, to the gate at the marsh\'s edge');
  for (const [ids, col, row, what] of LOCKS) ok(!reached(floodReach(without(ids), T, { hero }), col, row), hero + ': ' + ids.join('+') + ' is a LOCK (' + what + ' is not reached without it)'); }

/* ---------- C. THE SWARM ---------- */
{ const calmAt = { on: false }, drains = []; const X = { heroes: () => [H], calm: () => calmAt.on, drainOn: (e, p) => drains.push('on'), drainOff: (e, p) => drains.push('off'), mark() {}, sfx: {}, hint() {} };
  const H = { x: 400, y: 200, dead: false }; const e = SW.newSwarm({ x: 200, y: 200, hp: SW.SWARM.hp, maxHp: SW.SWARM.hp });
  for (let i = 0; i < 30; i++) SW.stepSwarm(e, 1 / 60, X); ok(e.mode === 'idle', 'a swarm keeps its post while nobody is near');
  H.x = 230; H.y = 205; SW.stepSwarm(e, 1 / 60, X); ok(e.mode === 'rise', 'a hero near: it RISES (told: bunched, red, !!) before it stings');
  for (let i = 0; i < 60 * SW.SWARM.rise + 2; i++) SW.stepSwarm(e, 1 / 60, X); ok(e.mode === 'angry', 'then it is angry');
  for (let i = 0; i < 90; i++) SW.stepSwarm(e, 1 / 60, X); ok(drains.includes('on') && e.onHero === H, 'it drifts onto you and stings: a drain, only while you stand in it');
  calmAt.on = true; SW.stepSwarm(e, 1 / 60, X); ok(e.mode === 'calm' && drains[drains.length - 1] === 'off', 'smoke: it goes quiet at once and stops stinging');
  ok(SW.swarmTake(e) === SW.SWARM.calmK && SW.SWARM.calmK > 1, 'a quiet swarm scatters easily (x' + SW.SWARM.calmK + ')');
  calmAt.on = false; for (let i = 0; i < 60 * (SW.SWARM.calmHold + 0.5); i++) SW.stepSwarm(e, 1 / 60, X); ok(e.mode !== 'calm', 'it stays quiet ' + SW.SWARM.calmHold + ' s after the smoke, then wakes');
  const e2 = SW.newSwarm({ x: 200, y: 200, hp: 16, maxHp: 16 }); ok(SW.swarmTake(e2) === 1 && e2.mode === 'rise', 'a blade on an idle swarm lands whole - and rouses it (never an immune body)'); }

/* ---------- C2. THE FAT HONEY HORNET ---------- */
{ const H0 = { x: 600, y: 300, dead: false, ground: true }, log = []; let calm = false;
  const X = { heroes: () => [H0], calm: () => calm, solidAt: (x, y) => y >= 300, floorAt: () => 300, hit: (e, box, d, o) => log.push(['hit', d, o && o.blockable]), glob: (x, y) => log.push(['glob', x, y]), mark: (e, t) => log.push(['mark', t]), sfx: {}, hint() {} };
  const e = HH.newHoneyHornet({ x: 300, y: 240, hp: HH.HONEY.hp, maxHp: HH.HONEY.hp, face: 1 });
  for (let i = 0; i < 60; i++) HH.stepHoneyHornet(e, 1 / 60, X); ok(e.mode === 'patrol', 'it keeps its beat while nobody is near (slow, heavy)');
  ok(HH.HONEY.hp >= 3 * 12 && HH.HONEY.speed < 50, 'tanky (' + HH.HONEY.hp + ' hp) and slow (' + HH.HONEY.speed + ' px/s)');
  H0.x = 300; H0.y = 300; for (let i = 0; i < 60 * 3 && !log.some(l => l[0] === 'glob'); i++) HH.stepHoneyHornet(e, 1 / 60, X);
  ok(log.some(l => l[0] === 'mark') && log.some(l => l[0] === 'glob'), 'over you it DRIPS (told: its sac swells, a !) and drops a HONEY GLOB (it splashes into a sticky patch)');
  const e2 = HH.newHoneyHornet({ x: 300, y: 270, hp: HH.HONEY.hp, maxHp: HH.HONEY.hp, face: 1 }); H0.x = 380; H0.y = 300; log.length = 0; let told = false, rammed = false;
  for (let i = 0; i < 60 * 10 && !rammed; i++) { HH.stepHoneyHornet(e2, 1 / 60, X); if (e2.mode === 'ramTell') told = true; if (e2.mode === 'ram') rammed = true; }
  ok(told && rammed && HH.HONEY.ramTell >= 0.6, 'beside you it RAMS - told first (a wind-up buzz and a lean back, ' + HH.HONEY.ramTell + ' s)');
  for (let i = 0; i < 60 && !log.some(l => l[0] === 'hit'); i++) { H0.x = e2.x + e2.face * 4; HH.stepHoneyHornet(e2, 1 / 60, X); }
  ok(log.some(l => l[0] === 'hit' && l[2]), 'the ram strikes (a shield turns it)');
  ok(HH.HONEY_POSE.ramTell !== HH.HONEY_POSE.ram && HH.HONEY_POSE.dripTell !== HH.HONEY_POSE.drop, 'B16: its own windup and release poses (ram, drip)');
  const e3 = HH.newHoneyHornet({ x: 300, y: 240, hp: HH.HONEY.hp, maxHp: HH.HONEY.hp, face: 1 }); const front = HH.honeyTake(e3, 300 + 20), back = HH.honeyTake(e3, 300 - 20);
  ok(front === 1 && back >= 0.4 && back < 1, 'its ARMOURED ABDOMEN: a cut from behind turns (x' + back + ', told, never immune); the head takes it whole');
  calm = true; for (let i = 0; i < 60 * 1.5; i++) HH.stepHoneyHornet(e3, 1 / 60, X); ok(e3.mode === 'drowsy' && e3.y >= 300 - 2 && HH.honeyTake(e3, 280) >= 1.5, 'SMOKE makes it DROWSY: it sinks to the ground, open (x' + HH.honeyTake(e3, 280) + ')');
  calm = false; for (let i = 0; i < 60 * (HH.HONEY.drowsy + 2); i++) HH.stepHoneyHornet(e3, 1 / 60, X); ok(e3.mode !== 'drowsy', 'then it rouses and climbs back up'); }

/* ---------- D. HER FIGHT ---------- */
const said = [], torn = []; const Wd = { number: (x, y, t) => said.push(t), sound() {}, shake() {}, music() {}, say: m => said.push(m), mark() {}, dust() {}, fx() {}, hit() {}, hitHero() {}, hatch() {}, drones: () => 0,
  perchGone() {}, tearHall() { torn.push('TORN'); } };
const fresh = (stage = 1) => { const S = HQM.newFight(HQM.geom(L.arena, L.descent, TS)); S.stage = stage; const e = { t: 'hornetqueen', x: S.G.h.mid, y: S.G.h.floor - 70, hp: 400, maxHp: 400, face: -1, mode: 'hover', modeT: 1, alive: true, anim: 0, vx: 0, vy: 0 }; return { S, e }; };
{ const { S, e } = fresh(); const [d, w] = HQM.takeBlow(e, S, 20, false); ok(d === 10 && w === HQM.HQ_SAY.shell, 'her shell: a cut lands at x0.5 and says HARD SHELL (B15)');
  ok(HQM.takeBlow(e, S, 20, true)[0] === 20, 'a plunge from above lands whole (FROM ABOVE)');
  S.ward = 1; ok(HQM.takeBlow(e, S, 20, false)[0] === 8, 'warded: 0.4, never nothing'); S.ward = 0;
  for (const [m, k] of [['stuck', 1.5], ['winded', 2], ['dazed', 1.5]]) { e.mode = m; ok(HQM.takeBlow(e, S, 20, false)[0] === 20 * k, m + ': x' + k); }
  e.mode = 'hover'; for (const m of ['hover', 'aim', 'dive', 'sweepTell', 'sweep', 'buzzTell', 'buzz', 'rise', 'skim', 'thrash']) { e.mode = m; assert.ok(HQM.takeBlow(e, S, 10, false)[0] >= 4, m + ': >= 0.4'); } n++;
  e.mode = 'hover'; e.hp = Math.ceil(e.maxHp * HQM.HQ.p1End) + 3; ok(HQM.takeBlow(e, S, 50, false)[0] === 3, 'P1 is never cut below its share: at ' + Math.round(HQM.HQ.p1End * 100) + '% the hall tears'); }
{ const { S, e } = fresh(2); for (const m of ['circle', 'rejoin', 'aim', 'dive', 'volleyTell', 'cloakTell', 'skim']) { e.mode = m; assert.ok(HQM.takeBlow(e, S, 10, false)[0] >= 4, 'P2 ' + m + ': >= 0.4'); } n++;
  S.cloak = 3; e.mode = 'circle'; ok(HQM.takeBlow(e, S, 20, false)[0] === 8 && HQM.takeBlow(e, S, 20, false)[1] === HQM.HQ_SAY.cloaked, 'her swarm cloak: 0.4 (the B15 floor), told CLOAKED');
  ok(HQM.dazed(e, S, Wd) && S.cloak === 0 && e.mode !== 'dazed', 'smoke under her strips the cloak first'); }
/* the stoop: it sticks in a comb perch, it pulls up off the floor */
{ const { S, e } = fresh(); const p = S.perches.find(q => q.id === 'L1'); const hero = { x: (p.x0p + p.x1p) / 2, y: p.y, ground: true, alive: true };
  e.x = hero.x; e.y = S.G.h.floor - 96; e.mode = 'aim'; e.modeT = 0.01; for (let i = 0; i < 120 && e.mode !== 'stuck'; i++) HQM.stepQueen(e, S, 1 / 60, [hero], Wd);
  ok(e.mode === 'stuck' && Math.abs(e.y - p.y) < 1 && HQM.hqOpen(e), 'a stoop at a hero on a comb perch drives her sting into it: STUCK (open)');
  for (let i = 0; i < 60 * (HQM.HQ.stuck.t[0] + HQM.HQ.thrash) + 4; i++) HQM.stepQueen(e, S, 1 / 60, [{ ...hero, x: S.G.h.x0 + 30, y: S.G.h.floor }], Wd);
  ok(S.ward > 0 && !HQM.hqOpen(e), 'B3: the opening ends in a thrash and a told ward'); }
{ const { S, e } = fresh(); const hero = { x: S.G.h.mid, y: S.G.h.floor, ground: true, alive: true }; e.x = hero.x; e.y = S.G.h.floor - 96; e.mode = 'aim'; e.modeT = 0.01;
  for (let i = 0; i < 120 && e.mode !== 'skim'; i++) HQM.stepQueen(e, S, 1 / 60, [hero], Wd); ok(e.mode === 'skim' && S.n.stuck === 0, 'a stoop at the bare floor: she pulls up (the floor does not hold her sting)'); }
/* the held dive: one in three */
{ const { S, e } = fresh(); let held = 0; for (let k = 0; k < 9; k++) { e.mode = 'hover'; e.modeT = 0; S.buzzCool = 99; S.last = []; HQM.stepQueen(e, S, 1 / 60, [{ x: e.x, y: S.G.h.floor, ground: true, alive: true }], Wd); if (e.mode === 'aim' && e.held) held++; }
  ok(held >= 1 && S.n.held === held, 'a HELD stoop now and then (one dive in ' + HQM.HQ.dive.heldEvery + ': its aim lasts longer, its sting pulses) - ' + held + ' of 9 picks'); }
/* THE HALL TEARS */
{ const { S, e } = fresh(); said.length = 0; torn.length = 0; e.hp = Math.ceil(e.maxHp * HQM.HQ.p1End); e.mode = 'hover'; let toldShake = false;
  for (let i = 0; i < 60 * (HQM.HQ.tear.tell + HQM.HQ.tear.rip) + 10; i++) { HQM.stepQueen(e, S, 1 / 60, [{ x: S.G.h.x0 + 40, y: S.G.h.floor, ground: true, alive: true }], Wd); if (e.mode === 'tearTell' && S.perches.some(p => p.st === 'shake')) toldShake = true; }
  ok(S.stage === 2 && torn.length === 1 && said.includes(HQM.HQ_SAY.tear) && toldShake && HQM.HQ.tear.tell >= 0.6, 'at her share THE HALL TEARS (told: she rears, the inner perches shake) - and she fights on in the same hall (P2)');
  ok(S.perches.filter(p => p.st !== 'gone').length === 2 && S.perches.filter(p => p.st !== 'gone').every(p => !p.fall), 'the inner perches tore loose (they hang as the torn combs); the wall perches stand'); }
/* P2: her loop keeps over a comb cut down into the honey; her stoop sticks in it; a comb that falls on her pins her (capped); the last comb is the big one */
const p2fight = () => { const { S, e } = fresh(2); const G = S.G.h; for (const p of S.perches) if (p.fall) p.st = 'gone';   /* (the tear took the inner perches) */ S.combs = [...G.torn, G.last].map(c => ({ id: c.id, x0p: c.x0p, x1p: c.x1p, y: c.y, rows: c.rows, st: 'hang', last: c.last })); return { S, e, G }; };
{ const { S, e, G } = p2fight(); const c = S.combs.find(q => q.id === 'tornW'); const low = HQM.loopAt(S, 3 * Math.PI / 2);
  let under = false; for (let th = 0; th < 2 * Math.PI; th += 0.02) { const q = HQM.loopAt(S, th); if (HQM.underComb(c, q)) under = true; } ok(under && G.floor - low.y <= 30, 'her low pass goes under the torn combs (' + Math.round(G.floor - low.y) + ' px over the honey)');
  c.st = 'down'; c.y = (HN.HALL.floor - c.rows) * TS; const over = HQM.loopAt(S, Math.PI + Math.acos(((c.x0p + c.x1p) / 2 - G.mid) / ((G.x1 - G.x0) / 2 - HQM.HQ.circle.edge)) * 0 + 0);
  let clear = true; for (let th = 0; th < 2 * Math.PI; th += 0.01) { const q = HQM.loopAt(S, th); if (q.x > c.x0p && q.x < c.x1p && q.y > c.y - 2) clear = false; } ok(clear, 'a comb cut down into the honey: her loop rises over it'); void over;
  const hero = { x: (c.x0p + c.x1p) / 2, y: c.y, ground: true, alive: true }; e.x = hero.x; e.y = c.y - 96; e.mode = 'aim'; e.modeT = 0.01;
  for (let i = 0; i < 120 && e.mode !== 'stuck'; i++) HQM.stepQueen(e, S, 1 / 60, [hero], Wd); ok(e.mode === 'stuck' && S.n.stuckHeap === 1, 'P2: a stoop at a hero on a cut comb drives her sting into it: STUCK'); }
{ const { S, e, G } = p2fight(); const hero = { x: G.mid, y: G.floor, ground: true, alive: true }; e.x = hero.x; e.y = G.floor - 96; e.mode = 'aim'; e.modeT = 0.01;
  for (let i = 0; i < 120 && e.mode !== 'skim'; i++) HQM.stepQueen(e, S, 1 / 60, [hero], Wd); ok(e.mode === 'skim' && S.n.stuck === 0, 'P2: a stoop at a hero in the honey: she pulls up (honey does not hold her sting)'); }
for (const id of ['tornW', 'last']) { const { S, e } = p2fight(); const c = S.combs.find(q => q.id === id); e.mode = 'circle'; e.modeT = 99; e.x = (c.x0p + c.x1p) / 2; e.y = c.y + c.rows * 16 + HQM.HQ.h + 2;
  c.st = 'fall'; let k = 0; for (; k < 40 && e.mode !== 'pinned'; k++) { c.y += 6; HQM.stepQueen(e, S, 1 / 60, [{ x: S.G.h.x0 + 8, y: S.G.h.floor, ground: true, alive: true }], Wd); }
  ok(e.mode === 'pinned' && S.n[id === 'last' ? 'pinLast' : 'pinComb'] === 1 && e.modeT === (id === 'last' ? HQM.HQ.pin.last : HQM.HQ.pin.t), (id === 'last' ? 'THE LAST COMB' : 'a torn comb') + ' cut down onto her: PINNED' + (id === 'last' ? ' (the big one: longer)' : ''));
  let got = 0; for (let j = 0; j < 60 && e.mode === 'pinned' && e.modeT > 0; j++) got += HQM.takeBlow(e, S, 30, false)[0];
  const cap = id === 'last' ? HQM.HQ.pin.capLast : HQM.HQ.pin.cap; ok(got <= e.maxHp * cap + 1 && e.modeT === 0, 'a pin is worth ' + cap + ' of her at most (' + got + ')');
  for (let j = 0; j < 30; j++) HQM.stepQueen(e, S, 1 / 60, [{ x: S.G.h.x0 + 8, y: S.G.h.floor, ground: true, alive: true }], Wd); ok(e.mode !== 'pinned', 'one comb pins her once'); }
{ const { S, e } = p2fight(); const c = S.combs.find(q => q.id === 'tornE'); e.mode = 'dazed'; e.modeT = 2; e.x = (c.x0p + c.x1p) / 2; e.y = S.G.h.floor; c.st = 'fall';
  for (let k = 0; k < 40 && e.mode !== 'pinned'; k++) { c.y += 6; HQM.stepQueen(e, S, 1 / 60, [{ x: S.G.h.x0 + 8, y: S.G.h.floor, ground: true, alive: true }], Wd); }
  ok(e.mode === 'pinned', 'a comb dropped on her while she is DAZED under it turns the daze into the pin'); }
/* a swarm cut down while it is on a hero takes its sting with it (the drain was once left running for the rest of the level) */
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'); ok(src.includes("e.alive = false; if (e.t === 'swarm' && e.onHero) { SWX.drainOff(e, e.onHero)"), 'a dead swarm stops its drain');
  ok(src.includes('function hqDown()') && /L\.hqDown = true/.test(src), 'her death: the falling nest begins (main.js hqDown), and she stays dead through a death on the way down'); }
/* B16: a pose for every mode she wears; every attack told */
{ const modes = new Set(); const src = readFileSync(new URL('../src/hornet-queen.js', import.meta.url), 'utf8');
  for (const m of src.matchAll(/case '([a-zA-Z0-9]+)'/g)) modes.add(m[1]); for (const m of src.matchAll(/e\.mode = '([a-zA-Z0-9]+)'/g)) modes.add(m[1]);
  const missing = [...modes].filter(m => !POSE[m] && m !== 'default'); ok(!missing.length, 'B16: every mode she wears has its own pose (' + modes.size + ' modes)' + (missing.length ? ': missing ' + missing.join(', ') : ''));
  for (const [tell, k] of [['aim', HQM.HQ.dive.aim[0]], ['sweepTell', HQM.HQ.sweep.tell], ['buzzTell', HQM.HQ.buzz.tell], ['volleyTell', HQM.HQ.volley.tell], ['cloakTell', HQM.HQ.cloakT.tell], ['tearTell', HQM.HQ.tear.tell]]) ok(k >= 0.6, tell + ': told for ' + k + ' s (its own windup pose: ' + JSON.stringify(POSE[tell]) + ')'); }

/* ---------- E. THE BOT: a plan in every phase ---------- */
for (const stage of [1, 2]) { const { S, e } = stage === 1 ? fresh(1) : p2fight(); const P = { x: S.G.h.mid, y: S.G.h.floor, ground: true, face: 1, atk: -1, vy: 0 };
  if (stage === 2) { e.mode = 'circle'; e.x = S.G.h.mid; e.y = S.G.h.floor - 80; }
  const out = hqPlan({ P, e, S, reach: 22, shield: false, dodge: true, t: 1, mem: {}, stands: L.smokers.map(([x, r]) => ({ x: x * TS + 8, y: (r + 1) * TS })) });
  ok(out && typeof out.why === 'string' && out.why.length > 0, 'the bot has a plan in phase ' + stage + ': "' + out.why + '"'); }
{ const { S, e } = p2fight(); const c = S.combs.find(q => q.id === 'tornW'); const P = { x: (c.x0p + c.x1p) / 2, y: S.G.h.floor, ground: true, face: 1, atk: -1, vy: 0 }; e.mode = 'circle'; e.modeT = 9;
  let th = 0; for (; th < 2 * Math.PI; th += 0.01) { S.loop.th = th; const q = HQM.loopAhead(S, 0.1); if (HQM.underComb(c, q)) break; } const q0 = HQM.loopAt(S, S.loop.th); e.x = q0.x; e.y = q0.y;
  const out = hqPlan({ P, e, S, reach: 22, shield: true, dodge: true, t: 1, mem: {}, rng: () => 0.99, v2: true, stands: [] }); ok(out.atk && out.up && /torn comb/.test(out.why), 'P2: under a torn comb it cuts it as she comes under ("' + out.why + '")');
  c.st = 'down'; c.y = (HN.HALL.floor - c.rows) * TS; const last = S.combs.find(q => q.last); const P2 = { x: c.x1p - 5, y: c.y, ground: true, face: 1, atk: -1, vy: 0 };
  for (th = 0; th < 2 * Math.PI; th += 0.01) { S.loop.th = th; const q = HQM.loopAhead(S, 0.25); if (HQM.underComb(last, q)) break; } const q1 = HQM.loopAt(S, S.loop.th); e.x = q1.x; e.y = q1.y;
  const out2 = hqPlan({ P: P2, e, S, reach: 22, shield: true, dodge: true, t: 2, mem: {}, rng: () => 0.99, v2: true, stands: [] }); ok(out2.atk && out2.up && /last comb/.test(out2.why), 'P2: from the cut comb it cuts THE LAST COMB as she comes under ("' + out2.why + '")'); }

console.log('hornets-nest: ' + n + ' checks ok');
