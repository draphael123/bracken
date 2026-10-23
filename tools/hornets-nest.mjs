// tools/hornets-nest.mjs - THE HORNET'S NEST and THE HORNET QUEEN 2, in Node (claude/hornetsnest; src/hornets-nest.js, src/hornets-nest-hands.js, src/hornet-swarm.js,
// src/hornet-queen.js, src/hornet-queen-plan.js). No page.
//   A  THE LEVEL: a spur off THE LUMBER TRAIL (spurOf + opensOn), seven named areas end to end, the rule line, three shrines (the gate's exam, the stair's exam before
//      her door, the foot of the falling nest), her two rooms, the drop's ledges crumbling, every comb's landing on footing three rows under where it is cut from
//   B  THE LOCKS: every required comb, for ALL NINE heroes (src/reachcore.js opts.hero) - without it landed the way on is not reached; with every comb landed the gate is
//   C  THE SWARM: told rising, its sting a drain only while you stand in it, smoke quiets it (x2 then), it goes home past its leash
//   D  HER FIGHT (B15 / B3 / B5 / B16): never invulnerable outside her rooms' seam, the hall never cut below its share (she tears out), her openings and their ward,
//      the stoop that sticks in comb (and not in the floor), a felled pine across her flight and the last comb pin her (capped), her cloak, a pose for every mode
//   E  THE BOT: a plan for every stage, from a standing start
//   node tools/hornets-nest.mjs
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';
import * as HN from '../src/hornets-nest.js';
import * as SW from '../src/hornet-swarm.js';
import * as HQM from '../src/hornet-queen.js';
import { hqPlan } from '../src/hornet-queen-plan.js';
import { POSE } from '../src/hornet-queen-hands.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'hornetsnest'), L = lv.build(), TS = 16, W = L.W, at = (x, y) => L.grid[y * W + x];
const foot = v => v === T.SOLID || v === T.ONEWAY || v === T.PLANK || v === T.SPIKE;

/* ---------- A. THE LEVEL ---------- */
ok(lv.needs === 'wood' && lv.spurOf === 'wood' && lv.opensOn && lv.opensOn.level === 'wood', "a spur off THE LUMBER TRAIL: it opens when the trail is cleared, and the road does not go through it");
ok(lv.rule === HN.NEST_RULE && /STICKY/.test(lv.rule) && /CUT A HANGING COMB/.test(lv.rule) && /SMOKE POT/.test(lv.rule), 'the rule line says what the hands do: sticky comb, a cut comb drops, a smoke pot quiets');
ok(L.sections.length === 7 && L.sections[0].x0 === 0 && L.sections.every((s, i) => i === 0 || s.x0 === L.sections[i - 1].x1 + 1) && L.sections[6].x1 === W - 1, 'seven named areas end to end: ' + L.sections.map(s => s.name).join(' / '));
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
ok(checks.length === 3 && checks[0] > 150 && checks[0] < 170 && checks[1] > 230 && checks[1] < 250 && checks[2] > 340 && checks[2] < 354, 'three shrines: the gate\'s exam (' + checks[0] + '), the stair\'s exam before her door (' + checks[1] + '), the foot of the falling nest (' + checks[2] + ')');
ok(L.ents.filter(e => e.t === 'hornetqueen').length === 1 && L.arena.boss === 'hornetqueen' && L.arena2 && L.arena2.boss === 'hornetqueen', 'her two rooms: the brood hall (arena) and the great pine (arena2)');
ok(L.arena.perches.length === 5 && L.arena.perches.filter(p => !p.fall).length === 2 && L.arena.perches.every(p => at(p.x0, p.row) === T.ONEWAY), 'the hall\'s five comb perches (two in the walls that never fall)');
ok(L.arena2.pines.length === 4 && L.arena2.lastComb && L.arena2.bough, 'the great pine: four marked pines, the last comb, the bough');
{ const lines = L.arena2.pines.map(p => { const x = p.col * TS + 8, a = x + p.dir * 8, b = x + p.dir * (p.len || 6) * TS; return { x, lo: Math.min(a, b), hi: Math.max(a, b) }; });
  ok(lines.every(q => lines.every(o => o === q || q.x < o.lo || q.x > o.hi)), 'no marked pine stands in another\'s fall line'); }
ok(L.crumbles.length === HN.LEDGES.length && L.crumbles.every(c => at(c.x0, c.row) === T.ONEWAY), 'the falling nest: ' + L.crumbles.length + ' comb ledges, each one gives way (L.crumbles)');
for (const c of L.combs) {
  ok(c.land > c.row + c.rows - 1, c.id + ': hangs over where it lands (row ' + c.row + ' -> ' + c.land + ')');
  for (let y = c.row; y < c.row + c.rows; y++) for (let x = c.x0; x <= c.x1; x++) assert.equal(at(x, y), T.AIR, c.id + ': a hanging comb is not footing (air at ' + x + ',' + y + ')');
  const under = c.on ? L.combs.find(o => o.id === c.on) : null, base = under ? under.land : (() => { for (let y = c.row + c.rows; y < L.H; y++) for (let x = c.x0; x <= c.x1; x++) if (foot(at(x, y))) return y; return L.H; })();
  ok(base - (c.row + c.rows) <= 3 + (c.id === 'first' ? 2 : 0), c.id + ': its foot is ' + (base - (c.row + c.rows)) + ' rows over what it is cut from (a rising cut reaches it)'); }
for (const [x, row] of L.smokers) ok(foot(at(x, row + 1)), 'a smoke stand at ' + x + ',' + row + ' stands on footing');
for (const [x0, x1, row] of L.wax) for (let x = x0; x <= x1; x++) assert.ok(foot(at(x, row)), 'wax at ' + x + ',' + row + ' is on footing');
ok(L.wax.length >= 8, L.wax.length + ' wax shelves and floors (fresh comb)');
ok(L.ents.filter(e => e.t === 'swarm').length >= 5 && L.ents.some(e => e.t === 'shield' && e.cnSkin === 'nestguard' && e.elite && e.gate), 'the swarms, and THE NEST-GUARD (an elite holding the gate\'s chamber)');

/* ---------- B. THE LOCKS ---------- */
const reached = (R, col, row) => [...R.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= col && Math.abs(y - row) <= 3; });
const without = ids => ({ ...L, reachSpans: L.combs.filter(c => !ids.includes(c.id)).map(c => [c.x0, c.x1, c.land]) });
const LOCKS = [[['first'], 54, 56, 'the buttress root'], [['bridge'], 126, 33, 'past the waste pit'], [['chainA'], 211, 13, 'the wall over the ledge'], [['chainB'], 211, 13, 'the wall over the ledge'], [['lastA'], 230, 7, 'the high wall'], [['lastB'], 230, 7, 'the high wall']];
for (const hero of HERO_MOVE_IDS) {
  ok(reached(floodReach(L, T, { hero }), 400, 65), hero + ': every comb landed - the whole level, to the gate under the great pine');
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

/* ---------- D. HER FIGHT ---------- */
const said = []; const Wd = { number: (x, y, t) => said.push(t), sound() {}, shake() {}, music() {}, say: m => said.push(m), mark() {}, dust() {}, fx() {}, hit() {}, hitHero() {}, hatch() {}, drones: () => 0,
  perchGone() {}, tearWall() {}, escapeBegin() { said.push('ESCAPE'); }, woodAt: () => false, splinter() {}, combLand: c => S0.G.p.floor, combHeap() {} };
const fresh = (stage = 1) => { const S = HQM.newFight(HQM.geom(L.arena, L.arena2, L.escape, TS)); S.stage = stage; const e = { t: 'hornetqueen', x: S.G.h.mid, y: S.G.h.floor - 70, hp: 400, maxHp: 400, face: -1, mode: 'hover', modeT: 1, alive: true, anim: 0, vx: 0, vy: 0 }; return { S, e }; };
const S0 = fresh().S;
{ const { S, e } = fresh(); const [d, w] = HQM.takeBlow(e, S, 20, false); ok(d === 10 && w === HQM.HQ_SAY.shell, 'her shell: a cut lands at x0.5 and says HARD SHELL (B15)');
  ok(HQM.takeBlow(e, S, 20, true)[0] === 20, 'a plunge from above lands whole (FROM ABOVE)');
  S.ward = 1; ok(HQM.takeBlow(e, S, 20, false)[0] === 8, 'warded: 0.4, never nothing'); S.ward = 0;
  for (const [m, k] of [['stuck', 1.5], ['winded', 2], ['dazed', 1.5]]) { e.mode = m; ok(HQM.takeBlow(e, S, 20, false)[0] === 20 * k, m + ': x' + k); }
  e.mode = 'hover'; for (const m of ['hover', 'aim', 'dive', 'sweepTell', 'sweep', 'buzzTell', 'buzz', 'rise', 'skim', 'thrash']) { e.mode = m; assert.ok(HQM.takeBlow(e, S, 10, false)[0] >= 4, m + ': >= 0.4'); } n++;
  e.mode = 'hover'; e.hp = Math.ceil(e.maxHp * HQ_P1()) + 3; ok(HQM.takeBlow(e, S, 50, false)[0] === 3, 'the hall is never cut below its share: at ' + Math.round(HQ_P1() * 100) + '% she tears out'); }
function HQ_P1() { return HQM.HQ.p1End; }
{ const { S, e } = fresh(2); S.cloak = 3; ok(HQM.takeBlow(e, S, 20, false)[0] === 8 && HQM.takeBlow(e, S, 20, false)[1] === HQM.HQ_SAY.cloaked, 'her swarm cloak: 0.4 (the B15 floor), told CLOAKED');
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
/* the tear-out */
{ const { S, e } = fresh(); said.length = 0; e.hp = Math.ceil(e.maxHp * HQM.HQ.p1End); e.mode = 'hover';
  for (let i = 0; i < 60 * (HQM.HQ.tear.tell + HQM.HQ.tear.fly) + 10; i++) HQM.stepQueen(e, S, 1 / 60, [{ x: S.G.h.x0 + 40, y: S.G.h.floor, ground: true, alive: true }], Wd);
  ok(S.stage === 'escape' && e.mode === 'away' && said.includes('ESCAPE') && said.includes(HQM.HQ_SAY.tear), 'at her share she TEARS OUT (told), and the escape begins'); }
/* P2: a felled pine across her flight pins her; the last comb pins her; both capped */
{ const { S, e } = fresh(2); e.mode = 'circle'; e.modeT = 99; const p = S.pines[1]; const [lo, hi] = HQM.lineOf(p);
  S.loop.dir = 1; let th = 0; for (; th < Math.PI * 2; th += 0.01) { const q = HQM.loopAt(S, th); if (q.x > lo + 10 && q.x < hi - 10 && S.G.p.floor - q.y < 60) break; }
  S.loop.th = th - (2 * Math.PI / HQM.HQ.circle.lap) * (HQM.HQ.pine.fall - 0.05); for (let k = 0; k < HQM.HQ.pine.strokes; k++) HQM.strokePine(S, p, Wd);
  ok(p.st === 'fall', 'four strokes fell a marked pine');
  for (let i = 0; i < 60 * (HQM.HQ.pine.fall + 0.3) && e.mode !== 'pinned'; i++) HQM.stepQueen(e, S, 1 / 60, [{ x: S.G.p.x0 + 8, y: S.G.p.floor, ground: true, alive: true }], Wd);
  ok(e.mode === 'pinned' && S.n.pinPine === 1, 'felled across her flight: GROUNDED + PINNED');
  let got = 0; for (let k = 0; k < 60 && e.mode === 'pinned' && e.modeT > 0; k++) got += HQM.takeBlow(e, S, 30, false)[0];
  ok(got <= e.maxHp * HQM.HQ.pin.cap + 1 && e.modeT === 0, 'a pin is worth ' + HQM.HQ.pin.cap + ' of her at most (' + got + ')'); }
{ const { S, e } = fresh(2); const c = S.comb; e.mode = 'circle'; e.modeT = 99; e.x = (c.x0 + c.x1) / 2; e.y = S.G.p.floor - 30; S.loop.th = 3 * Math.PI / 2; S.loop.dir = 0;
  ok(HQM.cutComb(S, Wd) && c.st === 'fall', 'THE LAST COMB: cut, it falls');
  for (let i = 0; i < 90 && e.mode !== 'pinned'; i++) { e.x = (c.x0 + c.x1) / 2; e.y = S.G.p.floor - 30; HQM.stepQueen(e, S, 1 / 60, [{ x: S.G.p.x0 + 8, y: S.G.p.floor, ground: true, alive: true }], Wd); }
  ok(e.mode === 'pinned' && S.n.pinComb === 1 && !HQM.cutComb(S, Wd), 'it comes down on her: PINNED (and there is only the one)'); }
/* B16: a pose for every mode she wears; every attack told */
{ const modes = new Set(); const src = (await import('node:fs')).readFileSync(new URL('../src/hornet-queen.js', import.meta.url), 'utf8');
  for (const m of src.matchAll(/case '([a-zA-Z0-9]+)'/g)) modes.add(m[1]); for (const m of src.matchAll(/e\.mode = '([a-zA-Z0-9]+)'/g)) modes.add(m[1]);
  const missing = [...modes].filter(m => !POSE[m] && m !== 'default'); ok(!missing.length, 'B16: every mode she wears has its own pose (' + modes.size + ' modes)' + (missing.length ? ': missing ' + missing.join(', ') : ''));
  for (const [tell, k] of [['aim', HQM.HQ.dive.aim[0]], ['sweepTell', HQM.HQ.sweep.tell], ['buzzTell', HQM.HQ.buzz.tell], ['volleyTell', HQM.HQ.volley.tell], ['cloakTell', HQM.HQ.cloakT.tell], ['tearTell', HQM.HQ.tear.tell]]) ok(k >= 0.6, tell + ': told for ' + k + ' s (its own windup pose: ' + JSON.stringify(POSE[tell]) + ')'); }

/* ---------- E. THE BOT: a plan in every stage ---------- */
for (const stage of [1, 'escape', 2]) { const { S, e } = fresh(stage === 1 ? 1 : 2); S.stage = stage; const P = stage === 1 ? { x: S.G.h.mid, y: S.G.h.floor, ground: true, face: 1, atk: -1, vy: 0 } : stage === 'escape' ? { x: S.G.h.x1 - 8, y: S.G.h.floor, ground: true, face: 1, atk: -1, vy: 0 } : { x: S.G.p.mid, y: S.G.p.floor, ground: true, face: 1, atk: -1, vy: 0 };
  if (stage === 2) { e.mode = 'circle'; e.x = S.G.p.mid; e.y = S.G.p.floor - 80; }
  const out = hqPlan({ P, e, S, reach: 22, shield: false, dodge: true, t: 1, mem: {}, stands: L.smokers.map(([x, r]) => ({ x: x * TS + 8, y: (r + 1) * TS })) });
  ok(out && typeof out.why === 'string' && out.why.length > 0, 'the bot has a plan in the ' + stage + ' stage: "' + out.why + '"'); }

console.log('hornets-nest: ' + n + ' checks ok');
