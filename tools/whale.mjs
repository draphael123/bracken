// tools/whale.mjs - THE WHALE + THE GASTRIC POLYP + THE PARASITE QUEEN, the Node proofs (claude/whale, 11-06). NO PAGE, NO BROWSER, no port.
// What a page cannot be trusted to show cheaply, proved here on the game's own numbers (src/hero-move.js) and the kit's own engines (src/tide-kit.js, src/pull-field.js):
//   1. the row: appended, hidden, needs 'keep', no map node; WH_SHIPS off; the level builds and lints (its own lint, the tide kit's, the pull field's)
//   2. THE ONE BREATH: every breath tide is one cycle (its phases in order, 16 s) and stays in step through a thousand forced breaths
//   3. THE NERVE (through the real hands, on a stub world): what a strike does at every phase, told first (the flare), the cooldown, the kit verbs it uses
//   4. THE MEMBRANES: open on the inhale, shut on the exhale; the SEALED cardia only after a FORCED inhale (the one required strike), never shut on a body
//   5. THE TONGUE and THE RAFTS ride the breath to their ledges; the gut leech is torn loose on the inhale
//   6. reach: start -> both shrines -> the chamber -> the gate, three silvers; with the cardia shut the stomach is out of reach (the strike is required)
//   7. THE RIB CAGE: every rib gap, every hero - crossed in still air and on the inhale, thrown back on the exhale (the gust exam is real)
//   8. THE GASTRIC POLYP: out by the breath, x0.3 in the flesh, its spit told before it hurts
//   9. THE PARASITE QUEEN: never under 0.4x; the whale's own breath never opens her; a forced exhale flushes her (P1/P3), a forced breath strands her on the floor
//      (P2), the inhale drags her down; the ward after; phases at 66 / 33; one new move a phase; every move told and marked; a toy fight flow
// Run: node tools/whale.mjs   (~3 s)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { WH, WH_SHIPS, BREATH, BREATH_NAME, BREATH_LEN, ARCS, lintWhale } from '../src/whale.js';
import { tideInit, tideStep, tideStrike, lintTide, liftY, floatY, TIDE } from '../src/tide-kit.js';
import { pullInit, pullStep, pullBodies, lintPulls, classOf } from '../src/pull-field.js';
import { MOVE, HERO_MOVE_IDS, heroRunMul } from '../src/hero-move.js';
import { floodReach } from '../src/reachcore.js';
import { makeWhaleHands, NERVE_DOES } from '../src/whale-hands.js';
import * as GPM from '../src/gastric-polyp.js';
import * as PQM from '../src/parasite-queen.js';
import { MARK, ANSWER } from '../src/marks.js';
import { THREAT } from '../src/threat.js';
import { OPEN_RULE, FULL_DAMAGE } from '../src/boss-greed.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const TS = 16, DT = MOVE.DT;

/* ---------- 1. THE ROW, THE FLAG, THE BUILD ---------- */
const row = LEVELS.find(d => d.id === 'whale');
ok(row, 'whale is in LEVELS'); ok(LEVELS.slice(LEVELS.indexOf(row) + 1).every(d => d.hidden), 'appended (saves count by index): nothing live after it');
ok(row.hidden === true && !row.secret, 'hidden: off the road until its art pass (art before live)'); ok(row.needs === 'keep', "needs 'keep' (Keep -> Whale -> Causeway)");
ok(WH_SHIPS === false, 'WH_SHIPS is off: the live game is unchanged');
ok(!LEVELS.some(d => d.needs === 'whale'), 'no live level needs it (the Causeway still needs the Keep: the road insert is claude/greatdune\'s table, at flip)');
const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
{ const i = mainSrc.indexOf('COAST_NODES'), cn = mainSrc.slice(i, i + 4000); ok(!/'whale'/.test(cn), 'no map node'); }
ok((mainSrc.match(/\(claude\/whale\)/g) || []).length >= 15, 'main.js hunks present'); ok(/WHH\.on\(\)/.test(mainSrc), 'main.js reads WHH.on()');
{ const i = mainSrc.indexOf('const EHP = {'); ok(/gastricpolyp: WH_GP\.hp/.test(mainSrc.slice(i, mainSrc.indexOf('};', i))), 'gastricpolyp is in the EHP literal (tools/one-new-foe reads it)'); }
const L = row.build();
ok(L.whale && L.W === WH.W && L.H === WH.H, 'builds ' + L.W + 'x' + L.H);
{ const p = lintWhale(L, T); ok(!p.length, 'lintWhale: ' + p.join('; ')); }
{ const p = lintPulls({ pulls: L.whPulls }); ok(!p.length, 'lintPulls: ' + p.join('; ')); }
{ const p = lintTide({ tides: L.whTides, pools: L.pools, checkpoints: L.ents.filter(e => e.t === 'check') }); ok(!p.length, 'lintTide: ' + p.join('; ')); }
ok(!L.pulls && !L.tides, 'kept off L.pulls / L.tides (a second generic wiring would step them twice)');
ok(L.ents.filter(e => e.t === 'check').length === 2, 'START + two shrines (fewer checkpoints)');
for (const k of ['gastricpolyp', 'parasitequeen', 'nerve', 'membrane']) ok(k in THREAT, 'THREAT knows ' + k);
ok(OPEN_RULE.parasitequeen && FULL_DAMAGE.parasitequeen, 'boss-greed: OPEN_RULE + FULL_DAMAGE parasitequeen');
for (const e of L.ents) ok(!/gob|goblin/.test(e.t), 'no goblins: ' + e.t);
ok(L.reskin.leech === 'gutleech' && L.reskin.crab === 'barnaclecrab', 'the gut leech and the barnacle crab are reskins (L.reskin), not new foes');
{ const kinds = new Set(L.ents.filter(e => !['sign', 'coin', 'silver', 'check', 'gate', 'nerve', 'membrane'].includes(e.t)).map(e => e.t));
  ok([...kinds].every(k => ['gastricpolyp', 'leech', 'crab', 'merrowbrute', 'parasitequeen'].includes(k)), 'the cast: polyp (new), gut leech, barnacle crab, merrow brute, the Queen: ' + [...kinds]); }
for (const [name, a] of Object.entries(ARCS)) ok(a.teach && a.exam && a.teach[0] <= a.exam[0] || name === 'gust' || name === 'tongue', 'arc ' + name + ': taught before it is examined');
/* no timber except the swallowed ships: the level paints no PLANK, no CRATE, no PALISADE */
ok(![...L.grid].some(v => v === T.PLANK || v === T.CRATE || v === T.PALISADE), 'no timber tiles (the wreck rafts and hulls are movers / one-way decks: ships)');

/* ---------- 2. THE ONE BREATH ---------- */
const BR = L.whTides.filter(t => t.breath);
ok(BR.length >= 6, BR.length + ' breath tides (every basin)'); ok(Math.abs(BREATH_LEN - 16) < 1e-9, 'the breath is 16 s');
for (const ph of Object.keys(BREATH)) ok(BREATH_NAME[ph], 'named: ' + ph + ' = ' + BREATH_NAME[ph]);
ok(BREATH.warn >= TIDE.minTell && BREATH.turn >= TIDE.minTell, 'both tells (THE HEART QUICKENS, IT GASPS) >= ' + TIDE.minTell + ' s');
{ const K = tideInit({ tides: L.whTides.map(t => ({ ...t })), pools: L.pools }), seen = []; let t = 0;
  for (let i = 0; i < 60 * 40; i++) { for (const ev of tideStep(K, DT)) if (ev.t === 'phase' && ev.id === BR[0].id) seen.push(ev.ph); t += DT; }
  ok(seen.slice(0, 6).join() === 'warn,rise,high,turn,fall,low', 'the cycle: HOLD -> QUICKENS -> EXHALE -> REST -> GASPS -> INHALE -> HOLD (' + seen.slice(0, 6) + ')'); }
/* a thousand forced breaths, put to every breath tide in the same frame (as the hands do): they never drift apart */
{ const K = tideInit({ tides: L.whTides.map(t => ({ ...t })), pools: L.pools }), bt = K.tides.filter(s => s.T.breath); let drift = 0, forced = 0;
  const hit = (s, t) => { const v = s.verbs.find(q => q.hidden && q.t === t); v.cool = 0; const x = v.x * TS + 8, y = (v.y + 1) * TS; return { l: x - 2, r: x + 2, t: y - 20, b: y - 10 }; };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60 * 600; i++) {
    if (rnd() < 0.006) { const does = NERVE_DOES[bt[0].ph]; if (does !== 'already') { forced++; for (const s of bt) tideStrike(K, hit(s, does === 'exhale' ? 'bell' : 'sluice')); } }   /* (tideStrike walks every tide; the hidden props are apart, so one blow lands on one tide's verb) */
    tideStep(K, DT);
    for (const s of bt) if (s.ph !== bt[0].ph || Math.abs(s.k - bt[0].k) > 1e-9 || Math.abs(s.t - bt[0].t) > 1e-9) drift++;
  }
  ok(forced > 100, forced + ' forced breaths'); ok(drift === 0, 'every breath tide in step through them all (' + drift + ' frames apart)'); }

/* ---------- a stub world for the real hands ---------- */
function world(level) {
  const W = { L: level, grid: level.grid, said: [], sounds: [], hurt: [], parts: [], enemies: [], t: 0 };
  const P = { x: 0, y: 0, w: 10, h: 14, face: 1, dead: false, ground: true };
  W.P = P; W.players = [P];
  const at = (x, y) => (x < 0 || y < 0 || x >= level.W || y >= level.H) ? T.SOLID : level.grid[y * level.W + x];
  const ctx = { get L() { return level; }, get players() { return W.players; }, get boss() { return W.boss || null; }, get bossActive() { return !!W.bossActive; }, T, EHP: { gastricpolyp: GPM.GP.hp, parasitequeen: PQM.PQ.hp },
    hero: () => P, time: () => W.t, poolLevel: (p, y) => { p.y = y; const d = p.base - y; p.dry = d <= 1; p.depth = Math.max(0, d); p.shallow = d < 18; }, moveBody: (b, dx, dy) => { b.x += dx; b.y += dy; return {}; },
    enemies: () => W.enemies, parts: () => W.parts, isSolid: (x, y) => at(x, y) === T.SOLID || at(x, y) === T.PORT, cellSet: (x, y, v) => { level.grid[y * level.W + x] = v; },
    spawnEnt: e => W.enemies.push({ t: e.t, x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true, mode: 'lurk' }), leechOff: (e, pp) => { W.said.push('leechOff'); void pp; },
    VW: () => 384, view: () => ({ x0: 0, y0: 0, x1: 384, y1: 216 }), number: (x, y, t) => W.said.push(t), text: () => {}, burst: () => {}, shake: () => {}, ring: () => {}, turned: (e, x, w) => W.said.push('turned:' + w),
    damagePlayer: (x, d, o) => { W.hurt.push({ d, name: o.name }); return 'hit'; }, asPlayer: (p, fn) => fn(), upright: p => !p.dead, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    box: b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y }), sound: k => W.sounds.push(k) };
  W.H = makeWhaleHands(ctx); W.H.clear();
  W.step = (s, fn) => { for (let i = 0; i < Math.round(s / DT); i++) { W.t += DT; if (fn) fn(); W.H.update(DT); } };
  return W;
}
const fresh = () => row.build();
const hbAt = (x, y) => ({ l: x * TS, r: x * TS + 16, t: y * TS, b: (y + 1) * TS });   /* a blow on the tile the nerve sits in */
const master = W => W.H.kit().tides.find(s => s.T.breath);
const cellsAre = (Lv, m, v) => { for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) if (Lv.grid[y * Lv.W + x] !== v) return false; return true; };
const waitPh = (W, ph, max = 20) => { let t = 0; while (master(W).ph !== ph && t < max) { W.step(DT); t += DT; } return master(W).ph === ph; };

/* ---------- 3. THE NERVE ---------- */
{ const W = world(fresh()), n1 = W.L.whNerves.find(q => q.id === 'n1');
  ok(master(W).ph === 'low', 'the whale wakes HOLDING (a respawn too: safe = low)');
  W.H.strike(hbAt(n1.x, n1.y)); const st = W.H.state().nerves.n1;
  ok(st.flare > 0 && master(W).ph === 'low', 'struck at HOLD: it FLARES first (told), the breath has not moved yet');
  W.step(WH.nerve.flare - 0.05); ok(master(W).ph === 'low', 'still holding inside the flare (' + WH.nerve.flare + ' s told)');
  W.step(0.1); ok(master(W).ph === 'warn', 'then it CALLS THE EXHALE: the kit bell (the quickening starts now, still told)');
  ok(W.H.kit().tides.filter(s => s.T.breath).every(s => s.ph === 'warn'), 'every breath tide called at once');
  W.H.strike(hbAt(n1.x, n1.y)); ok(W.H.state().nerves.n1.flare === 0, 'a spent nerve does nothing (cooling ' + WH.nerve.cool + ' s)');
  ok(waitPh(W, 'rise'), 'the exhale comes'); W.step(1);
  const n2 = W.L.whNerves.find(q => q.id === 'n2'); W.H.strike(hbAt(n2.x, n2.y)); W.step(WH.nerve.flare + 0.05);
  ok(master(W).ph === 'fall' || master(W).ph === 'low', 'struck in the EXHALE: it CALLS THE INHALE (the kit sluice turns the bile back): ' + master(W).ph);
  ok(master(W).hold > 0, 'and holds it drawn in a while (' + WH.nerve.hold + ' s)');
  const W2 = world(fresh()); ok(waitPh(W2, 'fall', 30), 'an inhale comes'); const n3 = W2.L.whNerves.find(q => q.id === 'n3');
  W2.H.strike(hbAt(n3.x, n3.y)); ok(W2.H.state().nerves.n3.flare === 0 && W2.H.state().nerves.n3.cool === 0, 'struck in the INHALE: "it is drawing in already" - nothing spent');
  for (const [ph, does] of Object.entries(NERVE_DOES)) ok(does === (ph === 'low' ? 'exhale' : ph === 'turn' || ph === 'fall' ? 'already' : 'inhale'), 'nerve at ' + ph + ' -> ' + does); }

/* ---------- 4. THE MEMBRANES ---------- */
{ const W = world(fresh()), m1 = W.L.whMembranes.find(m => m.id === 'm1'), car = W.L.whMembranes.find(m => m.id === 'cardia');
  ok(cellsAre(W.L, m1, T.AIR), 'm1 open while it HOLDS (drawn in)'); ok(cellsAre(W.L, car, T.PORT), 'the cardia sealed from the start');
  ok(waitPh(W, 'rise'), 'exhale'); W.step(0.1); ok(cellsAre(W.L, m1, T.PORT), 'm1 shut on the exhale');
  ok(waitPh(W, 'fall', 30), 'inhale'); W.step(0.1); ok(cellsAre(W.L, m1, T.AIR), 'm1 opens on the inhale'); ok(cellsAre(W.L, car, T.PORT), 'the cardia stays sealed on the whale\'s OWN inhale');
  /* a body in it: it waits */
  ok(waitPh(W, 'warn', 30), 'quickening'); W.P.x = (m1.x0 + 1) * TS; W.P.y = (m1.y1 + 1) * TS; ok(waitPh(W, 'rise'), 'exhale with a body in it'); W.step(0.5); ok(cellsAre(W.L, m1, T.AIR), 'it never shuts on a body');
  W.P.x = 0; W.step(0.1); ok(cellsAre(W.L, m1, T.PORT), 'it shuts when the body is out');
  /* THE REQUIRED STRIKE */
  const nr = W.L.whNerves.find(q => q.id === 'nreq'); W.P.x = 0; W.P.y = 0;
  ok(waitPh(W, 'high', 30), 'rest (flooded)'); W.H.strike(hbAt(nr.x, nr.y)); W.step(WH.nerve.flare + 0.1);
  ok(cellsAre(W.L, car, T.AIR), 'a FORCED inhale opens the cardia (the one required strike)'); ok(W.said.includes('THE CARDIA OPENS'), 'and says so');
  ok(waitPh(W, 'rise', 40), 'the next exhale'); W.step(0.1); ok(cellsAre(W.L, car, T.PORT), 'seals it again (call it again if you come back)'); }

/* ---------- 5. THE TONGUE, THE RAFTS, THE GUT LEECH ---------- */
{ const W = world(fresh()), K = W.H.kit();
  const tg = W.L.moversExtra.find(m => m.wh === 'lift'); W.H.mover(tg, DT); ok(liftY(K, 'tg1') === 40 * TS, 'the tongue lies low at HOLD (row 40, under the ledges)');
  const r1 = W.L.moversExtra.find(m => m.fid === 'rB1');
  ok(waitPh(W, 'high', 30), 'rest'); W.H.mover(tg, DT); W.H.mover(r1, DT);
  ok(liftY(K, 'tg1') === 36 * TS && tg.y === 36 * TS, 'the exhale lifts the tongue LEVEL with both ledges (row 36)');
  ok(floatY(K, 'rB1') === 33 * TS && floatY(K, 'raft1') === 33 * TS, 'the rafts ride the bile up level with their far ledges (row 33)');
  ok(waitPh(W, 'low', 30), 'hold'); ok(floatY(K, 'rB1') > 41 * TS, 'and lie on the bed when it is drawn in');
  /* the gut leech */
  const P = W.P, lee = { t: 'leech', cnSkin: 'gutleech', mode: 'latched', host: P, alive: true, x: P.x, y: P.y }; P.leech = lee; W.enemies.push(lee);
  ok(waitPh(W, 'rise', 30), 'exhale'); W.step(0.2); ok(lee.mode === 'latched', 'a gut leech holds on through the exhale');
  ok(waitPh(W, 'fall', 30), 'inhale'); W.step(0.05); ok(lee.mode === 'flop' && !P.leech && W.said.includes('leechOff'), 'THE INHALE TEARS IT LOOSE (off the hero, its drain stopped)'); }

/* ---------- 6. REACH ---------- */
{ const R = floodReach(L, T, { rides: true }), at = (x, y) => R.seen.has(x + ',' + y);
  for (const e of L.ents.filter(q => q.t === 'check' || q.t === 'silver' || q.t === 'gate')) ok(at(e.x, e.y) || at(e.x, e.y + 1), 'reach: ' + e.t + ' @' + e.x + ',' + e.y);
  ok(L.ents.filter(q => q.t === 'silver').length >= 3, 'three silvers or more (a sailor\'s strongbox among them)');
  ok(at(WH.AS + 10, WH.AF - 1), 'reach: the chamber floor');
  /* the strike is REQUIRED: with the cardia shut (not opened by the fill) nothing past it is reached */
  /* (the fill also starts from every shrine: shrine two is past the cardia, so it is left out - the question is whether a player coming from the start gets past) */
  /* (the fill walks a T.PORT cell as open ground unless it is SOLID: a sealed cardia is modelled as flesh) */
  const car = L.whMembranes.find(m => m.kind === 'sealed'), g2 = Uint8Array.from(L.grid); for (let y = car.y0; y <= car.y1; y++) for (let x = car.x0; x <= car.x1; x++) g2[y * L.W + x] = T.SOLID;
  const shut = { ...L, grid: g2, ents: L.ents.filter(e => !(e.t === 'check' && e.x > 153)), reachDoors: L.reachDoors.filter((d, i) => L.whMembranes[i].kind !== 'sealed') }, R2 = floodReach(shut, T, { rides: true });
  const open = { ...L, ents: shut.ents }, R3 = floodReach(open, T, { rides: true });
  ok(R3.seen.has('394,39'), 'from the start alone (no shrine two), with the cardia opened, the gate is reached');
  ok(!R2.seen.has('394,39') && !R2.seen.has('394,40'), 'with the cardia sealed the gate is out of reach: the nerve strike is required');
  ok(R2.seen.has('125,22') || R2.seen.has('125,23'), '(and shrine one before it still is)'); }

/* ---------- 7. THE RIB CAGE: the gust exam ---------- */
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const solid = (x, y) => at(x, y) === T.SOLID || at(x, y) === T.PORT, oneway = (x, y) => at(x, y) === T.ONEWAY;
function body(x, y) { return { x, y, w: MOVE.BODY_W, h: MOVE.BODY_H, vx: 0, vy: 0, ground: false }; }
function moveX(b, dx) { const st = Math.sign(dx); let left = Math.abs(dx);
  while (left > 0) { const d = Math.min(1, left) * st, nx = b.x + d, edge = Math.floor((nx + st * b.w / 2) / TS), r0 = Math.floor((b.y - b.h) / TS), r1 = Math.floor((b.y - 1) / TS);
    let hit = false; for (let r = r0; r <= r1; r++) if (solid(edge, r)) hit = true; if (hit) { b.vx = 0; return; } b.x = nx; left -= 1; } }
function moveY(b, dy) { const st = Math.sign(dy); let left = Math.abs(dy);
  while (left > 0) { const d = Math.min(1, left) * st, ny = b.y + d, c0 = Math.floor((b.x - b.w / 2 + 1) / TS), c1 = Math.floor((b.x + b.w / 2 - 1) / TS);
    if (st > 0) { const r = Math.floor(ny / TS), was = Math.floor((b.y - 0.001) / TS); let land = false;
      if (r !== was || ny % TS === 0) for (let c = c0; c <= c1; c++) if (solid(c, r) || (oneway(c, r) && b.y <= r * TS)) land = true;
      if (land && ny >= r * TS) { b.y = r * TS; b.vy = 0; return; } }
    else { const r = Math.floor((ny - b.h) / TS); let hit = false; for (let c = c0; c <= c1; c++) if (solid(c, r)) hit = true; if (hit) { b.vy = 0; return; } }
    b.y = ny; left -= 1; } }
const standing = b => { const c0 = Math.floor((b.x - b.w / 2 + 1) / TS), c1 = Math.floor((b.x + b.w / 2 - 1) / TS), r = Math.floor(b.y / TS); if (b.y % TS !== 0) return false; for (let c = c0; c <= c1; c++) if (solid(c, r) || oneway(c, r)) return true; return false; };
function stepHero(b, hero, dir, jump) {
  b.ground = standing(b); const cap = MOVE.RUN * heroRunMul(hero, b.ground);
  if (dir) { b.vx += dir * (b.ground ? MOVE.ACC_GROUND : MOVE.ACC_AIR) * DT; if (Math.abs(b.vx) > cap) b.vx = Math.sign(b.vx) * cap; }
  if (jump && b.ground) { b.vy = MOVE.JUMPV; b.ground = false; }
  const g = Math.abs(b.vy) < MOVE.APEX_VY ? MOVE.GRAV * MOVE.APEX_G : b.vy > 0 ? MOVE.GRAV * MOVE.FALL_G : MOVE.GRAV;
  b.vy = Math.min(MOVE.MAX_FALL, b.vy + g * DT); moveX(b, b.vx * DT); moveY(b, b.vy * DT);
}
const RIBS = [[263, 262, 266], [266, 268, 272], [272, 274, 278], [278, 280, 284], [284, 286, 290], [290, 292, 296], [296, 298, 302], [302, 304, 308], [308, 310, 314]];
const g3 = L.whPulls.find(p => p.id === 'g3');
ok(classOf(g3) === 'strong', 'the rib gust is STRONG (you lean into it; it is not a rip that needs a post): ' + classOf(g3));
function ribJump(hero, from0, from1, to0, ph) {
  const F = pullInit({ pulls: [g3] }), S = F.fields[0]; for (let i = 0; i < 120; i++) pullStep(F, DT, { tidePh: ph });
  const fr = (() => { for (let y = 17; y < L.H; y++) if (solid(from1, y)) return y; return null; })(), b = body((from0 + 0.5) * TS, fr * TS);
  let jumped = false;
  for (let i = 0; i < 60 * 5; i++) { pullStep(F, DT, { tidePh: ph });
    /* a player jumps at every lip (off a high rib too): standing, and no footing a step ahead */
    const ahead = Math.floor((b.x + 7) / TS), r = Math.floor(b.y / TS), lip = standing(b) && !(solid(ahead, r) || oneway(ahead, r)) && b.x >= from1 * TS; if (lip) jumped = 'now';
    pullBodies(F, [b], DT, { inWater: () => false, holding: () => false, kind: () => 'hero', dashing: () => false, move: (bb, dx, dy) => { if (dx) moveX(bb, dx); if (dy) moveY(bb, dy); } });
    stepHero(b, hero, 1, jumped === 'now'); if (jumped === 'now') jumped = true;
    if (jumped && standing(b) && Math.floor(b.x / TS) >= to0) return true;
    if (b.y > 44 * TS) return false; }
  void S; return false;
}
{ let thrown = 0, total = 0;
  for (const hero of HERO_MOVE_IDS) for (const [f0, f1, t0] of RIBS) { const fromStart = f0 === 263 ? 258 : f0, fromEnd = f0 === 263 ? 262 : f1;
    ok(ribJump(hero, fromStart, fromEnd, t0, 'low'), hero + ' crosses ' + fromEnd + '->' + t0 + ' in still air (HOLD)');
    ok(ribJump(hero, fromStart, fromEnd, t0, 'fall'), hero + ' crosses ' + fromEnd + '->' + t0 + ' on the inhale');
    total++; if (!ribJump(hero, fromStart, fromEnd, t0, 'rise')) thrown++; }
  ok(thrown >= total * 0.8, 'the exhale throws you back off ' + thrown + ' of ' + total + ' rib jumps (cross on the inhale, or call it)'); console.log('  ribs: the exhale throws back ' + thrown + ' of ' + total + ' hero x rib jumps; still air and inhale cross all'); }

/* ---------- 8. THE GASTRIC POLYP ---------- */
{ const e = GPM.spawnPolyp({ x: 100, y: 200, alive: true }, { face: -1 }), hits = [];
  let br = { k: 0, ph: 'low' }; const c = { breath: () => br, mark: m => hits.push('mark' + m), sound: () => {}, hit: (bx, d, name) => { hits.push(name); return 'hit'; }, floorY: () => 200 };
  ok(GPM.gpIn(e) && GPM.polypTake(e) === GPM.GP.inK, 'held in the flesh while the whale holds: x' + GPM.GP.inK + ' (never nothing)');
  br = { k: 0.2, ph: 'warn' }; for (let i = 0; i < 40; i++) GPM.stepPolyp(e, DT, null, c); ok(e.mode === 'out' && GPM.polypTake(e) === 1, 'it swells out on the quickening/exhale: whole');
  for (let i = 0; i < 180; i++) { GPM.stepPolyp(e, DT, { x: 60, y: 200, alive: true }, c); if (hits.includes('THE BILE SPIT')) break; }
  ok(hits[0] === 'mark!' && hits.indexOf('mark!') < hits.indexOf('THE BILE SPIT'), 'its spit is marked (!) before it can hurt'); ok(MARK['gastricpolyp|spitTell'] === '!' && ANSWER['gastricpolyp|spitTell'] === 'block', 'marks.js row: spitTell ! block');
  br = { k: 0.2, ph: 'fall' }; for (let i = 0; i < 60; i++) GPM.stepPolyp(e, DT, null, c); ok(e.mode === 'in', 'the inhale shuts it back in the flesh'); }

/* ---------- 9. THE PARASITE QUEEN ---------- */
const A = L.arena;
function queen() {
  const G = { x0: A.x0, x1: A.x1, floor: A.floor, heartX: A.heartX, spots: [{ x: (A.shelves[0][0] + 3) * TS, y: 36 * TS, floor: false }, { x: A.x0 + 18 * TS, y: A.floor, floor: true }] };
  const S = PQM.newFight(G), e = { t: 'parasitequeen', x: A.heartX, y: A.floor, w: PQM.PQ.w, h: PQM.PQ.h, hp: PQM.PQ.hp, maxHp: PQM.PQ.hp, face: -1, mode: 'idle', modeT: 0.5, open: 0, alive: true };
  const said = [], hits = [], c = { number: (x, y, t) => said.push(t), sound: () => {}, mark: m => said.push('mark' + m), hit: (bx, d, name) => { hits.push(name); return true; }, floorY: () => A.floor, fx: () => {}, rate: () => said.push('rate'), leeches: () => 0, hatch: () => said.push('hatch'), ringWard: () => {} };
  return { S, e, c, said, hits };
}
{ /* the floor: every mode, every phase, warded or not */
  let low = 9; const modes = ['idle', 'lashTell', 'lash', 'spitTell', 'thrumTell', 'constrictTell', 'constrict', 'broodTell', 'crushTell', 'crush', 'skitter', 'hop', 'flushed', 'stranded', 'uprootTell', 'rerootTell'];
  for (const ph of [1, 2, 3]) for (const m of modes) for (const ward of [0, 1]) for (const open of [0, 2]) for (const fx of [A.heartX - 40, A.heartX + 40]) { const { S, e } = queen(); S.ph = ph; e.mode = m; S.ward = ward; e.open = open; low = Math.min(low, PQM.takeK(e, S, fx)); }
  ok(low >= PQM.PQ.k.floor && PQM.PQ.k.floor === 0.4, 'never under 0.4x anywhere (lowest ' + low + ')'); }
{ const { S, e, c } = queen(); ok(PQM.takeAt(e, S).k === 0.4 && PQM.takeAt(e, S).word === 'ROOTED', 'P1 rooted: x0.4, the word names the key');
  PQM.breathNatural(e, S, c); ok(!PQM.pqOpen(e), 'the whale\'s OWN exhale never opens her (she braces: told)');
  ok(PQM.breathForced(e, S, c, 'inhale') === 'braced' && !PQM.pqOpen(e), 'a forced INHALE in P1 does not either');
  ok(PQM.breathForced(e, S, c, 'exhale') === 'flushed' && PQM.pqOpen(e) && PQM.takeK(e, S) === 1.5, 'a FORCED EXHALE flushes her off her roots: OPEN x1.5');
  const x0 = e.x; for (let i = 0; i < Math.round(PQM.PQ.flushed / DT) + 2; i++) PQM.stepQueen(e, S, DT, [{ x: x0 - 30, y: A.floor, alive: true }], c);
  ok(e.x === x0, 'stagger means still: she stays where she is while open');
  ok(!PQM.pqOpen(e) && S.ward > 0 && PQM.takeK(e, S) === 0.4, 'then her roots re-grip: a told WARD (x0.4, ' + PQM.PQ.ward + ' s)');
  ok(PQM.breathForced(e, S, c, 'exhale') === null, 'no opening inside the ward (no chain-lock)'); }
{ const { S, e, c, said } = queen(); e.hp = PQM.PQ.hp * 0.6; PQM.stepQueen(e, S, DT, [{ x: A.heartX - 80, y: A.floor, alive: true }], c);
  ok(e.mode === 'uprootTell', 'at 66% the exhale tears her loose (told: ' + PQM.PQ.uproot + ' s)'); for (let i = 0; i < 120; i++) PQM.stepQueen(e, S, DT, [{ x: A.heartX - 80, y: A.floor, alive: true }], c);
  ok(S.ph === 2, 'P2 THE SKITTER'); ok(PQM.takeAt(e, S, e.x - 50 * (e.face || 1)).k === 1 && PQM.takeAt(e, S, e.x + 50 * (e.face || 1)).k === 0.6, 'her shell x0.6, the root-knot behind her x1.0');
  e.mode = 'idle'; e.y = 36 * TS; ok(PQM.breathForced(e, S, c, 'exhale') === null, 'up on a shelf a forced exhale does not catch her');
  ok(PQM.breathForced(e, S, c, 'inhale') === 'dragged' && e.mode === 'hop', 'a forced INHALE drags her down to the floor');
  for (let i = 0; i < 40; i++) PQM.stepQueen(e, S, DT, [], c); ok(PQM.onFloor(e, S), 'she is on the floor');
  ok(PQM.breathForced(e, S, c, 'exhale') === 'stranded' && PQM.takeK(e, S) === 1.5, 'a forced breath with her ON THE FLOOR strands her: OPEN x1.5');
  ok(said.includes(PQM.PQ_SAY.stranded), 'told'); }
{ const { S, e, c, said } = queen(); S.ph = 2; e.hp = PQM.PQ.hp * 0.3; e.mode = 'idle'; e.modeT = 0; PQM.stepQueen(e, S, DT, [{ x: A.heartX, y: A.floor, alive: true }], c);
  ok(e.mode === 'rerootTell', 'at 33% she re-roots in the heart (told)'); for (let i = 0; i < 120; i++) PQM.stepQueen(e, S, DT, [{ x: A.heartX - 90, y: A.floor, alive: true }], c);
  ok(S.ph === 3 && said.includes('rate'), 'P3 THE FLAYED HEART: the heart\'s breath runs fast'); ok(PQM.breathForced(e, S, c, 'exhale') === 'flushed', 'flushed again by a forced exhale');
  const t0 = e.open; ok(PQM.breathForced(e, S, c, 'inhale') === 'pair' && e.open > t0, 'THE PAIR: a second nerve while she is flushed holds her off longer');
  ok(PQM.breathForced(e, S, c, 'inhale') === null, 'once an opening'); }
/* every move: told, its own tell long enough, a marks.js row, one new a phase */
for (const [k, M] of Object.entries(PQM.MOVES)) { ok(PQM.PQ[k].tell >= 0.45, k + ' tell ' + PQM.PQ[k].tell + ' s'); ok(MARK['parasitequeen|' + M.tell] === M.mark, 'marks row ' + M.tell + ' ' + M.mark); ok(ANSWER['parasitequeen|' + M.tell], 'answer row ' + M.tell); }
ok(PQM.PHASE_MOVES[1].length >= 4, 'P1 has four told moves (B17)'); ok(PQM.PHASE_NEW[2].length === 1 && PQM.PHASE_NEW[3].length === 1, 'one new move in P2 (brood) and in P3 (crush)');
ok(L.arena.nerves.length === 3 && L.whNerves.filter(q => q.arena).every(q => q.tides === 'heart'), 'three chamber nerves on the heart\'s own breath');
{ const R = floodReach(L, T, { rides: true }); for (const q of L.whNerves.filter(z => z.arena)) ok(R.seen.has(q.x + ',' + q.y), 'reach: chamber nerve ' + q.id + ' (base movement)'); }
/* a toy fight flow (a perfect-read bot: NOT the rate - boss-rates owed): it strikes a nerve when she can be opened and cuts her open, chips her otherwise */
{ const times = []; for (let run = 0; run < 6; run++) { const { S, e, c } = queen(); let t = 0, cd = 0, hp0 = e.hp; void hp0;
    const swing = 22, rate = 2.2;   /* a mid hero's blade (px of damage a blow) and blows a second when in reach */
    while (e.hp > 0 && t < 600) { t += DT; cd -= DT; const heartPh = ((t % 16) < 1.5) ? 'low' : 'x';
      PQM.stepQueen(e, S, DT, [{ x: e.x - 30, y: A.floor, alive: true }], c);
      if (cd <= 0 && S.ward <= 0 && !PQM.pqOpen(e) && (S.ph === 2 ? PQM.onFloor(e, S) : heartPh === 'low')) { PQM.breathForced(e, S, c, S.ph === 2 ? 'inhale' : 'exhale'); cd = WH.nerve.coolArena / 3 + WH.nerve.flare; }
      if (Math.random() < rate * DT) e.hp -= swing * PQM.takeK(e, S, e.x - 30 * (e.face || 1)); }
    times.push(t); }
  ok(times.every(t => t < 600), 'the toy fight always ends (' + times.map(t => t.toFixed(0)).join(', ') + ' s; boss-rates WITH flasks owed for the real band)'); console.log('  toy fight (perfect-read bot, not the rate): ' + times.map(t => t.toFixed(0) + ' s').join(', ')); }

/* ---------- 10. THE HANDS RUN THE FIGHT AND THE FOES (stub world, no throw) ---------- */
{ const W = world(fresh()), A2 = W.L.arena, qe = W.L.ents.find(e => e.t === 'parasitequeen');
  const B = W.H.spawnEnt({ x: qe.x * TS + 8, y: (qe.y + 1) * TS, alive: true, hurtT: 0 }, qe); ok(B && B.t === 'parasitequeen' && B.hp === PQM.PQ.hp, 'the hands spawn her');
  W.boss = B; W.bossActive = true; W.enemies.push(B); B.mode = 'wake'; B.modeT = 1.6;
  W.P.x = A2.x0 + 2 * TS + 8; W.P.y = 36 * TS;
  const ht = () => W.H.kit().tides.find(s => s.id === 'heart');
  W.step(2, () => W.H.updateEnt(B, DT)); ok(B.mode !== 'wake' && B.mode !== 'sleep', 'she wakes and fights (' + B.mode + ')');
  let t = 0; while (!(ht().ph === 'low' && !/Tell$/.test(B.mode) && !PQM.COMMITTED.has(B.mode)) && t < 40) { W.step(DT, () => W.H.updateEnt(B, DT)); t += DT; }
  const a1 = W.L.whNerves.find(q => q.id === 'A1'); W.H.strike(hbAt(a1.x, a1.y)); W.step(WH.nerve.flare + 0.05, () => W.H.updateEnt(B, DT));
  ok(PQM.pqOpen(B) && B.mode === 'flushed', 'a chamber nerve struck while the heart holds: FLUSHED (through the hands: flare -> the heart tide bell -> her): ' + B.mode);
  ok(ht().ph === 'warn', 'the chamber nerve drives the heart\'s own breath (' + ht().ph + ')');
  ok(W.H.take(B, 100, 'slash') === 150, 'a blow on her open: x1.5 through the hands');
  W.step(PQM.PQ.flushed + 0.2, () => W.H.updateEnt(B, DT)); ok(W.H.take(B, 100, 'slash') === 40, 'warded after: x0.4');
  for (let i = 0; i < 60 * 30; i++) { W.t += DT; W.H.updateEnt(B, DT); W.H.update(DT); }
  ok(W.hurt.length > 0, 'she lands blows in 30 s on a hero who stands still (' + [...new Set(W.hurt.map(h => h.name))].join(', ') + ')');
  const pe = W.L.ents.find(e => e.t === 'gastricpolyp'), P1 = W.H.spawnEnt({ x: pe.x * TS + 8, y: (pe.y + 1) * TS, alive: true, hurtT: 0 }, pe); W.enemies.push(P1);
  W.hurt.length = 0; W.P.x = P1.x - 60; W.P.y = P1.y; for (let i = 0; i < 60 * 20; i++) { W.t += DT; W.H.updateEnt(P1, DT); W.H.update(DT); }
  ok(W.hurt.some(h => h.name === 'THE BILE SPIT'), 'a polyp on its ledge spits at a hero through the hands'); W.H.end(B); }

console.log('whale: ' + n + ' ok');
