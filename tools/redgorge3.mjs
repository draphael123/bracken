// tools/redgorge3.mjs - RED GORGE 3's own check (claude/redgorge3, 11-06): THE MATRIARCH'S NEW ARENA, THE THREE FALLS (src/gorge-falls.js). Node only: no page, seconds.
//   node tools/redgorge3.mjs            the proofs
//   node tools/redgorge3.mjs --sim=6    + the toy duel (a kinematic point-hero driven by fallsPlan; NOT the win rate - the tune lane's bossLab is)
//   - FLAG OFF: the level is master's cell for cell (a hash of grid + ents + movers + arena taken at 5f28d2603), her fight is RG2's (no falls, the lever's wave)
//   - FLAG ON: the arena (48 wide, every top two rows over the channel, three falls over the channel floor, three levers: low / on the ledge / across the floor,
//     each in reach of its fall and reached by the knight's legs), one standpipe basket under the centre fall, no new checkpoint
//   - KITE + PULL: no pull = no big opening; a pour on her grounded = STUNNED (open >= 3 s, the verb's cap), its ward after (x0.4, never nothing - B15);
//     in the air it misses (said); she SHIES from the fall that stunned her (walk + leap); each sluice refills on its own told clock; the HOLD until the first stun;
//     phase two's standpipe (any lever, the basket eased, the knock); phase three drowns the sluices; the passes (no lure, no screech, no perch; >= 4 told attacks)
import { createHash } from 'node:crypto';
import { LEVELS, T } from '../src/level.js';
import * as RM from '../src/raptor-matriarch.js';
import * as GF from '../src/gorge-falls.js';
import { floodReach } from '../src/reachcore.js';
import { BY_HAND } from '../src/marks.js';

const fails = [], ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const { MAT } = RM, { F3, STAGE3 } = GF, TS = 16;
const lv = LEVELS.find(l => l.id === 'redgorge');
const BASE_HASH = 'a427447a753ca37a0ac6528aac8e27d484cfe419';   /* master's red gorge at claude/colossus4 5f28d2603 (grid + ents + movers + arena) */
const hashOf = L => { const h = createHash('sha1'); h.update(Buffer.from(L.grid)); h.update(JSON.stringify(L.ents)); h.update(JSON.stringify(L.moversExtra)); h.update(JSON.stringify(L.arena)); return h.digest('hex'); };

/* ---------- FLAG OFF ---------- */
delete globalThis.BRACKEN_RG3; delete process.env.BRACKEN_RG3;
ok(!GF.rg3On() && GF.RG3_SHIPS === false, 'the flag is off by default (RG3_SHIPS false, no override)');
const L0 = lv.build();
ok(hashOf(L0) === BASE_HASH && L0.W === 144, 'FLAG OFF: the red gorge is master\'s cell for cell (grid, ents, movers, arena: ' + hashOf(L0).slice(0, 10) + ')');
{ const G0 = RM.geom(L0.arena), S0 = RM.newFight(G0); ok(!G0.falls && S0.sluice.W === 1 && S0.sluice.E === 1 && RM.pull(S0, 'W') === 'released' && S0.pending.length === 1, 'FLAG OFF: her fight is RG2\'s (no falls; E at the W lever lets the banked flood go as a wave)');
  ok(RM.wardTake(S0, 100) === 0, 'FLAG OFF: her ward is RG2\'s (0) - unchanged'); }

/* ---------- FLAG ON: THE ARENA ---------- */
globalThis.BRACKEN_RG3 = true;
ok(GF.rg3On(), 'globalThis.BRACKEN_RG3 turns it on (as ?rg3=1 on the page, BRACKEN_RG3=1 in a tool)');
const L = lv.build(), A = L.arena, G = RM.geom(A), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const sx = A.mat.sx, R = A.mat.R, top = A.mat.top, solid = (c, y) => at(sx + c, y) === T.SOLID;
ok(A.mat.v3 && A.boss === 'matriarch' && L.W === 152 && A.x1 - A.x0 === STAGE3.W * TS && G.falls && G.falls.length === 3, 'FLAG ON: her arena is THE THREE FALLS, 48 columns wide (the level 8 columns wider east for it)');
ok(STAGE3.tops.every(t => { for (let x = t.x0; x <= t.x1; x++) if (!solid(x, top) || solid(x, top - 1) || !solid(x, R - 1)) return false; return true; }) && R - top === 2,
  'every top is solid to the bed, two rows over the channel (one jump out for every hero)');
ok(G.falls.every(q => !G.tops.some(t => t.r > q.l && t.l < q.r)) && G.falls.every((q, i) => i === 0 || q.cx - G.falls[i - 1].cx >= 12 * TS),
  'three falls, each over the channel floor (never a top), spread out (' + G.falls.map(q => (q.cx - G.x0) / TS).join(' / ') + ' columns)');
{ const lv3 = G.levers, row = l => l.y / TS - 1, cell = l => [Math.floor(l.x / TS), row(l)];
  const A_ = lv3.find(l => l.id === 'A'), B_ = lv3.find(l => l.id === 'B'), C_ = lv3.find(l => l.id === 'C');
  ok(A_.where === 'floor' && at(...cell(A_)) === T.AIR && at(cell(A_)[0], row(A_) + 1) === T.SOLID && !RM.topAt(G, A_.x, 2), 'lever A is LOW: on the channel floor');
  ok(typeof B_.where === 'number' && at(cell(B_)[0], row(B_) + 1) === T.ONEWAY && (top - (row(B_) + 1)) === 3, 'lever B is ON A LEDGE: a one-way sandstone lip three rows over the broad pillar under it (a plain jump)');
  ok(C_.where === 'top' && RM.topAt(G, C_.x, 2) && RM.topAt(G, C_.x, 2).kind === 'bank' && C_.x - G.falls[2].cx > 0, 'lever C is ACROSS THE FLOOR: on the east bank, past its fall');
  const dist = G.falls.map(q => { const l = lv3.find(v => v.id === q.lever); return Math.abs(l.x - q.cx); });
  ok(dist.every(d => d >= F3.hw + 16 && d <= 90), 'each lever is out from under its fall and in a short run of it (' + dist.map(d => R2(d)).join(' / ') + ' px: the knight runs 92 px/s)');
  ok(L.ents.filter(e => e.t === 'mlever').length === 3 && lv3.every(l => L.ents.some(e => e.t === 'mlever' && e.x === cell(l)[0] && e.y === cell(l)[1])), 'the three lever ents stand where the fight reads them');
  const RCH = floodReach(L, T, { rides: true }), foot = RCH.footing;
  ok(lv3.every(l => foot.has(cell(l)[0] + ',' + cell(l)[1])), 'the knight\'s legs reach every lever (reachcore: ' + lv3.map(l => l.id + (foot.has(cell(l)[0] + ',' + cell(l)[1]) ? ' ok' : ' NO')).join(', ') + ')'); }
ok(L.moversExtra.filter(m => m.mbasket).length === 1 && Math.abs(G.baskets[0].cx - G.falls[1].cx) <= TS && L.moversExtra.filter(m => m.mplank).length === 2, 'ONE standpipe basket, under the centre fall; the dam\'s two loose slabs in the wide reaches');
ok(L.ents.filter(e => e.t === 'check').length === L0.ents.filter(e => e.t === 'check').length, 'no new checkpoint (Daniel: fewer) - the arena adds none (' + L.ents.filter(e => e.t === 'check').length + ' in the level, as master)');
ok(L.ents.some(e => e.t === 'gate' && e.x === sx + STAGE3.W + 3), 'the road out to THE GLASS SEA moved east with the wider arena');
ok(G.bridges.length === 0, 'the rope bridges are trimmed (two verbs: KITE + PULL)');

/* ---------- THE PURE FIGHT ---------- */
const dt = 1 / 60;
function world(hero, said = []) { let raptors = 0, young = 0;
  return { said, hero, c: { number: (x, y, t) => said.push(t), mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {},
    hit: b => !hero.dodge && hero.x + 6 > b[0] && hero.x - 6 < b[1] && hero.y > b[2] && hero.y - 24 < b[3], band: b => !hero.dodge && hero.x + 6 > b[0] && hero.x - 6 < b[1] && hero.y > b[2] && hero.y - 24 < b[3],
    spawnRaptor: () => { raptors++; return {}; }, raptors: () => raptors + young, spawnYoung: () => { young++; return {}; }, young: () => young, dismissYoung: () => { young = 0; }, solid: () => false,
    horn: () => true, flood: () => false, sweep: () => {} } }; }   /* (horn: true - the gorge's horn must NOT move her on the falls' floor) */
const fight = () => { const S = RM.newFight(G), e = { x: G.tops[5].cx, y: G.topY, w: MAT.w, h: MAT.h, hp: MAT.hp, maxHp: MAT.hp, face: -1, mode: 'walk', modeT: 0.5, open: 0, phase: 1 }; return { S, e }; };
const step = (F, W, n, each) => { for (let i = 0; i < n; i++) { RM.stepMatriarch(F.e, F.S, dt, [{ x: W.hero.x, y: W.hero.y, ground: true, alive: true, air: false }], W.c); if (each && each(i) === false) break; } };
const fall = id => G.falls.find(q => q.id === id);
/* a. two minutes, nothing pulled */
{ const W = world({ x: G.tops[0].cx, y: G.topY }), F = fight(); let big = 0;
  step(F, W, 120 * 60, () => { if (RM.matBig(F.e)) big++; F.e.hp = MAT.hp; });
  ok(big === 0 && !F.S.n.lures && !(F.S.n.moves.screechTell), 'two minutes of her with no lever pulled opens nothing big; no lure, no screech (' + F.S.n.pounces + ' pounces)');
  ok(F.S.horn === false && F.S.flood === false, 'the gorge\'s horn does not move her on the falls\' floor (the arena\'s water is yours)'); }
/* b. a pour on her grounded = STUNNED; its ward is x0.4 */
{ const W = world({ x: fall('A').cx + 120, y: G.floorY }), F = fight(), q = fall('A');
  F.e.x = q.cx + 20; F.e.y = G.floorY; F.e.mode = 'recover'; F.e.modeT = 9;
  ok(RM.pull(F.S, 'B') === 'released' && RM.pull(F.S, 'A') === 'released' && F.S.falls.A.st === 'trickle' && RM.pull(F.S, 'A') === 'busy', 'E at a full lever opens ITS sluice (a told trickle first); again while it runs: busy');
  let before = 0, openT = 0, ward = 0, saw = null, spent = null;
  step(F, W, 60 * 12, () => { if (!saw && !RM.matBig(F.e)) before += dt; if (RM.matBig(F.e)) { openT += dt; saw = saw || F.e.mode; } if (F.S.ward > 0 && !RM.matBig(F.e)) ward += dt; F.e.hp = MAT.hp; if (spent == null && F.S.falls.A.st === 'refill') spent = RM.pull(F.S, 'A'); });
  ok(saw === 'staggered' && before >= F3.trickleT - 0.02 && openT >= 3 && F.S.n.fallStuns.A === 1 && W.said.includes(GF.SAY3.stun), 'the fall crashes down on her under it: STUNNED after the trickle (' + before.toFixed(2) + ' s), open ' + openT.toFixed(1) + ' s (>= 3), said');
  ok(F.S.openCap === MAT.verbCap && ward >= 3, 'the stun pays the verb\'s cap (' + MAT.verbCap + ' of her), then her TOLD ward ' + ward.toFixed(1) + ' s');
  ok(F.S.shy === 'A', 'she now SHIES from fall A');
  ok(RM.wardTake(F.S, 100) === 100 * MAT.talonMul && MAT.talonMul >= 0.4 && MAT.hideMul >= 0.4, 'B15: her ward on the falls turns a blow to x' + MAT.talonMul + ' (never nothing); outside openings x' + MAT.hideMul + ' / x' + MAT.talonMul);
  ok(spent === 'empty', 'a spent sluice says so (refilling) - its gauge runs');
  step(F, W, Math.ceil(F3.refillT * 60) + 10, () => { F.e.hp = MAT.hp; });
  ok(F.S.falls.A.st === 'full' && F.S.sluice.A === 1, 'each sluice refills on its own told clock (' + F3.refillT + ' s), and says FULL'); }
/* c. in the air under a pour: it misses her (said) */
{ const W = world({ x: G.x0 + 30, y: G.topY }), F = fight(), q = fall('B');
  F.e.x = q.cx; F.e.y = G.topY - 60; F.e.mode = 'fly'; F.S.fly = { x0: q.cx, y0: G.topY - 60, tx: q.cx, ty: G.topY - 60, t: 5, t0: 5, arc: 0, then: 'walk' };
  RM.pull(F.S, 'B'); let big = false; step(F, W, 60 * 2, () => { if (RM.matBig(F.e)) big = true; });
  ok(!big && W.said.includes(GF.SAY3.air), 'a fall on her in the air misses her (said: ' + GF.SAY3.air + ')'); }
/* d. the shy: her walk stops at the fall she knows, her leap lands beside it; another fall still stuns her */
{ const W = world({ x: fall('A').cx - 70, y: G.floorY }), F = fight(); F.S.shy = 'A'; F.e.x = fall('A').cx + 110; F.e.y = G.floorY; F.e.mode = 'walk'; F.e.modeT = 3; F.S.script = ['pounce']; F.S.step = 0;
  let inA = 0; step(F, W, 60 * 3, () => { if (F.e.mode === 'walk' && GF.fallOver(G, F.e.x, MAT.w / 2, q => q.id === 'A')) inA++; F.e.hp = MAT.hp; });
  ok(inA === 0, 'she will not walk into the fall that stunned her');
  W.hero.x = fall('A').cx; F.e.mode = 'pounceTell'; F.e.modeT = 0.3; F.S.pAt = null; let landX = null;
  step(F, W, 60 * 2, () => { if (F.S.fly && F.S.fly.then === 'land' && landX == null) landX = F.S.fly.tx; F.e.hp = MAT.hp; });
  ok(landX != null && !GF.fallOver(G, landX, MAT.w / 2, q => q.id === 'A') && F.S.n.shied >= 1 && W.said.includes(GF.SAY3.shy), 'her pounce at you under it lands beside it (' + R2(landX - fall('A').cx) + ' px off its centre), said once');
  const F2 = fight(); F2.S.shy = 'A'; F2.e.x = fall('C').cx; F2.e.y = G.floorY; F2.e.mode = 'recover'; F2.e.modeT = 9; RM.pull(F2.S, 'C'); let big = false;
  step(F2, W, 60 * 2, () => { if (RM.matBig(F2.e)) big = true; F2.e.hp = MAT.hp; });
  ok(big && F2.S.shy === 'C', 'another fall still stuns her (and she shies from that one now)'); }
/* e. the HOLD until the first fall stun */
{ const F = fight(); F.e.hp = F.e.maxHp * MAT.p2 + 30; const d = RM.holdDmg(F.e, F.S, 200); F.S.n.sluiceStuns = 1; const d2 = RM.holdDmg(F.e, F.S, 200);
  ok(d < 31 && d2 === 200, 'she will not break past the phase-two line until a fall has stunned her once (' + R2(d) + ' of 200; after: 200)'); }
/* f. phase two: any full lever fills THE STANDPIPE; the basket rises only ridden, eased; a blow from it knocks her off */
{ const W = world({ x: G.baskets[0].cx, y: G.floorY }), F = fight(); F.S.ph = 2; F.e.hp = MAT.hp * 0.5; F.e.mode = 'wallRun'; F.e.modeT = 9; F.e.y = G.wallY;
  ok(RM.pull(F.S, 'C') === 'pressed' && F.S.press.P.charge > 0 && RM.pull(F.S, 'A') === 'busy' && F.S.falls.C.st === 'refill', 'phase two: ANY full lever fills the one standpipe (its sluice is spent); a second pull while it holds: busy');
  const b = G.baskets[0]; let hHalf = null;
  for (let i = 0; i < 60 * 2; i++) { RM.stepMatriarch(F.e, F.S, dt, [{ x: b.cx, y: RM.basketY(G, F.S, 'P'), ground: true, alive: true, onBasket: 'P' }], W.c); F.e.hp = MAT.hp * 0.5; if (hHalf == null && F.S.press.P.h >= 0.25) hHalf = RM.basketY(G, F.S, 'P'); }
  const lin = b.y0 - (b.y0 - b.y1) * 0.25;
  ok(F.S.press.P.h >= 1 && Math.abs(RM.basketY(G, F.S, 'P') - b.y1) < 1 && hHalf > lin, 'the basket rides up to her wall, eased (a quarter in: ' + R2(b.y0 - hHalf) + ' px up vs ' + R2(b.y0 - lin) + ' linear) - one smooth ride');
  F.e.mode = 'wallRun'; F.e.x = b.cx + 20; ok(RM.knock(F.e, F.S, W.c) === true, 'a blow from the raised basket knocks her off the wall (RG2\'s verb, kept)'); }
/* g. phase three: the sluices are drowned, all three falls run */
{ const W = world({ x: G.tops[1].cx, y: G.topY }), F = fight(); F.S.ph = 3; step(F, W, 10, () => { F.e.hp = MAT.hp * 0.2; });
  ok(RM.pull(F.S, 'A') === 'drowned' && G.falls.every(q => F.S.falls[q.id].st === 'flood'), 'phase three: the dam cracks - all three falls run, the sluices are drowned'); }
/* h. the passes */
{ const P1 = new Set(GF.CYCLES3_P1.flat()), P2 = new Set(GF.CYCLES3_P2.flat()), atk = ['pounce', 'rake', 'sweep', 'scree'];
  ok(!P1.has('lure') && !P1.has('screech') && atk.every(m => P1.has(m)) && !P2.has('perch'), 'the passes: phase one is her four told attacks (+ the follow-up), no lure, no screech; phase two has no perch');
  const bad = Object.entries(RM.MOVES).filter(([m, v]) => BY_HAND['matriarch|' + m] !== v.mark); ok(!bad.length, 'every told move still wears its mark in src/marks.js (no new move names)'); }

/* ---------- THE TOY DUEL (--sim=N): a kinematic point-hero on fallsPlan; hp 300, 18 a swing, 3 flasks ---------- */
function R2(v) { return Math.round(v); }
const simN = +((process.argv.find(a => a.startsWith('--sim=')) || '').split('=')[1] || 0);
if (simN) { const res = [];
  for (let k = 0; k < simN; k++) { let seed = 7 + k * 101; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const S = RM.newFight(G), e = { x: G.tops[5].cx, y: G.topY, w: MAT.w, h: MAT.h, hp: MAT.hp, maxHp: MAT.hp, face: -1, mode: 'walk', modeT: 0.8, open: 0, phase: 1 };
    const P = { x: G.x0 + 40, y: G.topY, vy: 0, ground: true, face: 1, atk: -1, hp: 300, flasks: 3, dodgeT: 0, dodgeV: 0, cd: 0, block: false }, mem = {};
    let t = 0, hits = 0, swings = 0; const said = [];
    const box = () => [P.x - 6, P.x + 6, P.y - 24, P.y];
    const hurt = (b, d, o = {}) => { if (P.dodgeT > 0) return false; const hb = box(); if (!(hb[0] < b[1] && hb[1] > b[0] && hb[2] < b[3] && hb[3] > b[2])) return false; mem.keys = mem.keys || new Set(); if (o.key && mem.keys.has(o.key)) return false; if (o.key) mem.keys.add(o.key);
      if (P.block && o.blockable) d *= 0.2; P.hp -= d; return true; };
    const c = { number: (x, y, s) => said.push(s), mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {}, hit: (b, d, n, o = {}) => hurt(b, d, o), band: (b, d, n, key) => hurt(b, d, { key }),
      spawnRaptor: () => ({}), raptors: () => 0, spawnYoung: () => ({}), young: () => 0, dismissYoung: () => {}, solid: () => false, horn: () => false, flood: () => false, sweep: () => { const tp = RM.nearestTop(G, P.x); P.x = tp.cx; P.y = G.topY; P.hp -= 6; } };
    const ground = (x, y0, y1) => { /* the highest surface under x that the feet crossed from y0 to y1 (falling) */ let best = null; const cand = [];
      const tp = RM.topAt(G, x, 4); if (tp) cand.push(G.topY); cand.push(G.pits.some(([l, r]) => x >= l && x < r) ? G.pitY : G.floorY);
      for (const s of G.ledges) if (x > s.l && x < s.r) cand.push(s.y);
      for (const b of G.baskets) if (x > b.l - 2 && x < b.r + 2) cand.push(RM.basketY(G, S, b.id));
      for (const y of cand) if (y >= y0 - 0.5 && y <= y1 + 0.5 && (best == null || y < best)) best = y; return best; };
    for (; t < 300 && P.hp > 0 && e.hp > 0; t += dt) {
      if (P.hp < 110 && P.flasks > 0 && P.ground) { P.flasks--; P.hp = Math.min(300, P.hp + 110); }
      const onB = G.baskets.find(b => P.x > b.l - 4 && P.x < b.r + 4 && Math.abs(P.y - RM.basketY(G, S, b.id)) < 3);
      RM.stepMatriarch(e, S, dt, [{ x: P.x, y: P.y, ground: P.ground, alive: true, air: !P.ground, dodge: P.dodgeT > 0, onBasket: onB ? onB.id : null }], c);
      const pl = RM.matPlan({ P: { x: P.x, y: P.y, face: P.face, ground: P.ground, atk: P.atk, vy: P.vy }, e, S, reach: 30, shield: false, t, rng, mem });
      P.block = !!pl.block;
      if (pl.talk) { const l = G.levers.find(q => Math.abs(q.x - P.x) <= 22 && Math.abs(q.y - P.y) <= 20); if (l) RM.pull(S, l.id); }
      if (pl.dodge && P.ground && P.dodgeT <= 0 && !(mem.dodgeCd > t)) { P.dodgeT = 0.3; mem.dodgeCd = t + 0.5; P.dodgeV = (Math.sign((pl.gx ?? P.x + P.face) - P.x) || P.face) * 200; }
      let vx = 0; if (P.dodgeT > 0) { P.dodgeT -= dt; vx = P.dodgeV; } else if (pl.gx != null && Math.abs(pl.gx - P.x) > 3 && !pl.block) vx = Math.sign(pl.gx - P.x) * 92;
      if (vx) P.face = Math.sign(vx);
      /* walls: a top's side stops you on the floor (jump it) */
      const nx = Math.max(G.x0 + 6, Math.min(G.x1 - 6, P.x + vx * dt)), tpN = RM.topAt(G, nx, 6);
      if (!(tpN && P.y > G.topY + 2 && !RM.topAt(G, P.x, 6))) P.x = nx;
      if (pl.jump && P.ground) { P.vy = -320; P.ground = false; }
      const rideB = onB && P.ground && !pl.jump && P.x > onB.l - 4 && P.x < onB.r + 4;   /* standing on the basket: it carries you */
      if (rideB) { P.y = RM.basketY(G, S, onB.id); P.vy = 0; } else if (!P.ground || !ground(P.x, P.y, P.y + 1)) { P.ground = false; const y0 = P.y; P.vy += 1000 * dt; P.y += P.vy * dt; if (P.vy > 0) { const gy = ground(P.x, y0, P.y); if (gy != null) { P.y = gy; P.vy = 0; P.ground = true; } } }
      if (S.ph === 3 && S.water > 0.5 && !RM.topAt(G, P.x, 4) && P.y > G.topY + 4) c.sweep();
      if (pl.face) P.face = pl.face;
      if (P.atk >= 0) { P.atk -= dt; if (P.atk < 0) P.atk = -1; }
      if (pl.atk && P.atk < 0) { P.atk = 0.4; swings++; const reach = 30 + MAT.w / 2;
        if (Math.abs(e.x - P.x) < reach && Math.abs(P.y - e.y) < (onB ? 48 : 30) && (P.face || 1) * (e.x - P.x) > -4) { let d = 18;
          if (e.mode === 'sleep') d = 0; else if (S.ward > 0) d = RM.wardTake(S, d); else if (RM.matUnder(e)) d = 0;
          else if (onB && S.ph === 2 && S.press.P.h >= 0.85 && RM.wallMode(e) && RM.knock(e, S, c)) d = 18;
          else if (RM.matBig(e)) { const cap = e.maxHp * (S.openCap || MAT.openCap); d = Math.min(d * MAT.openMul, Math.max(0, cap - S.openTaken)); S.openTaken += d; }
          else if (RM.matBeat(e)) { const kk = S.act + e.mode; if (S.beatKey !== kk) { S.beatKey = kk; S.beatTaken = 0; } d = Math.min(d, Math.max(0, e.maxHp * MAT.beatCap - S.beatTaken)); S.beatTaken += d; }
          else if (RM.guarded(e, P.x, P.y, !P.ground)) d *= MAT.talonMul; else d *= MAT.hideMul;
          d = RM.holdDmg(e, S, d); e.hp -= d; if (d > 0) hits++; } }
    }
    res.push({ win: e.hp <= 0, t: Math.round(t), heroHp: Math.max(0, Math.round(P.hp)), flasks: P.flasks, ph: S.ph, stuns: { ...(S.n.fallStuns || {}) }, knocks: S.n.knocks || 0, pulls: { ...(S.n.pulls || {}) }, shied: S.n.shied || 0, bossHp: Math.max(0, Math.round(e.hp)) }); }
  const wins = res.filter(r => r.win).length; console.log('  TOY DUEL n=' + simN + ': ' + wins + '/' + simN + ' wins, avg ' + Math.round(res.reduce((a, r) => a + r.t, 0) / simN) + ' s');
  for (const r of res) console.log('    ' + JSON.stringify(r));
  const used = new Set(res.flatMap(r => Object.keys(r.stuns)));
  ok(res.every(r => Object.values(r.stuns).reduce((a, b) => a + b, 0) >= 1) && used.size >= 2, 'the toy duel: the bot KITES + PULLS - every duel stuns her under a fall, and more than one fall is used (' + [...used].join(', ') + ')');
  ok(res.some(r => r.ph >= 2), 'the toy duel reaches phase two'); }

console.log(fails.length ? '\nRED GORGE 3: ' + fails.length + ' FAIL' : '\nRED GORGE 3: flag off = master; THE THREE FALLS, kite + pull, the shy, the refill, the hold, the standpipe, the drowned sluices hold.');
process.exit(fails.length ? 1 : 0);
