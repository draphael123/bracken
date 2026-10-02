// src/bandit-king.js - THE BANDIT KING, THE WELL TOWN's boss (claude/welltown, 2026-10-01). Pure: no DOM, no main.js. His hands (the world, the
// drawing) are src/bandit-king-hands.js; the level lays his courtyard with stageBanditKing (src/well-town.js, the Kasbah).
//
// HIS MOVES ARE THE DESERT ENGINE'S (src/desert-bosses.js BANDIT_KING, proved in tools/desert-bosses.mjs): SCIMITAR SWEEP (! - block, or step
// back), KNIFE FAN (! - block, or jump the low throw), OIL JAR (a red mark where you stand: it shatters and burns there - move), THE CHARGE (red:
// shoulder first across the courtyard - jump it or get out of the line). This file runs that engine in his courtyard's coordinates and adds what
// the house rules ask of a wired boss (docs/NEW-LEVEL-CHECKLIST.md, the Puppeteer lessons):
//   THE OPENING IS CAUSED, BY THE LEVEL'S VERB: after an oil jar he walks through his own fire and BURNS. Pour your skin on him while he burns
//     (INTERACT within reach) and the steam blinds him and softens his mud plate: OPEN for KING.openT seconds (>= 3, tools/boss-openings.mjs) at
//     KING.openMul. A pour while he is not burning runs off him and opens nothing. A pour costs a sip: refill at the courtyard well.
//   x0.05 CHIP OTHERWISE: COMBAT3's game-wide rule (src/boss-greed.js OPEN_RULE.banditking = his steam opening). His own local chip went when
//     the global one landed (claude/welltown-fix), so there is one chip and one line (A SCRATCH: WAIT FOR HIS OPENING), never a chip of a chip;
//     greed (4 blows outside the steam) is answered by the global reprisal.
//   HE ALWAYS FIGHTS: the engine never idles him; between attacks he walks you down.
//   EVERY CYCLE CHANGES: each pass of his chain is a different order (CHAINS[phase][cycle % n]): the jar first, then the knives first with a
//     charge after the jar, then a charge into a jar; in phase two (half health) two jars at once and THE LIEUTENANTS: two of his knives come
//     to hold the courtyard well (win it back to refill).
//   THE TOUCH RULE: his body never hurts; only his told blows and his fire.
import { BANDIT_KING, makeBoss, bossStep, FLOOR, ARENA } from './desert-bosses.js';

export const KING = {
  hp: 640, w: 22, h: 40, markH: 54,
  openMul: 2.6, openT: 3.0,          /* THE OPENING: three seconds (the house floor), the blow x2.6 in it (tuned with the human-bot pilot, tools/welltown-pilot.mjs); everything else the global x0.05 */
  dmg: { sweep: 12, knives: 8, jar: 10, burn: 3, charge: 14 }, p2: 1.15,   /* each told blow, and his fire's tick; phase two hits harder */
  burnTick: 0.6, fireR: 20, pourR: 44, wellR: 26, douse: 40,
  lieutenants: 2, chargeH: 28,
};
/* EVERY CYCLE CHANGES: the order of each pass, phase one and phase two (cycle k uses [k % n]) */
export const CHAINS = {
  1: [['jar', 'sweep', 'knives', 'charge'], ['knives', 'jar', 'charge', 'sweep'], ['charge', 'jar', 'sweep', 'knives', 'jar']],
  2: [['jar', 'jar', 'sweep', 'charge', 'knives'], ['charge', 'jar', 'knives', 'jar', 'sweep'], ['knives', 'jar', 'charge', 'jar', 'sweep', 'jar']],
};
const clampX = x => Math.max(ARENA.x0 + 20, Math.min(ARENA.x1 - 20, x));
const at = (x, half, h = 40) => [x - half, x + half, FLOOR - h, FLOOR];

/* his def for one fight: the engine's, with the cycle's chain and phase two's second jar (BANDIT_KING itself is left as tools/desert-bosses.mjs proves it) */
export function kingDef() {
  const J = BANDIT_KING.attacks.jar;
  const jar = { ...J,
    start: (B, w) => { J.start(B, w); B.data.mark2 = B.phase === 2 ? clampX(B.data.mark + (B.data.mark < 320 ? 72 : -72)) : null; },
    hit: B => { const r = J.hit(B); if (B.phase === 2 && B.data.mark2 != null) B.data.fires.push({ x: B.data.mark2, t: 6 }); return r; } };
  /* THE CHARGE, SHOULDER FIRST: low (28 px, the engine's is 36), so a jump in time carries over his shoulder - the answer the tell asks for, with a hero's own jump */
  const charge = { ...BANDIT_KING.attacks.charge, hit: B => ({ box: at(B.x, 16, KING.chargeH) }) };
  return { ...BANDIT_KING, hp: KING.hp, openT: KING.openT, chain: CHAINS[1][0].slice(), chain2: CHAINS[2][0].slice(), attacks: { ...BANDIT_KING.attacks, jar, charge } };
}

/* THE COURTYARD. sx: its first column; R: its floor row. Forty columns (sx..sx+39), his walls at sx-1 and sx+40 (each a six-row door the fight
   shuts), the courtyard well in the middle, a stone trough each side (a step up, one row). W = { set, block, ent, air } of the level's painter */
export const STAGE = { W: 40, door: 6, well: 19, troughs: [[6, 9], [30, 33]], king: 28 };
export function stageBanditKing(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + STAGE.W;
  air(sx, ex - 1, 0, R - 1);
  block(sx - 1, sx - 1, R - 16, R - STAGE.door - 1); block(ex, ex, R - 16, R - STAGE.door - 1);   /* the walls over his two doors */
  for (const [a, b] of STAGE.troughs) for (let x = sx + a; x <= sx + b; x++) set(x, R - 1, T.ONEWAY);   /* the troughs: a row up, boards you stand on */
  ent('skinwell', sx + STAGE.well, R - 1, { arena: true });
  ent('banditking', sx + STAGE.king, R - 1, { face: -1 });
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 5) * TS, wallL: sx - 1, wallR: ex, boss: 'banditking', music: 'banditking',
    tint: '#e8dcc0', tintA: 0.06, start: [sx + 3, R - 1], well: (sx + STAGE.well) * TS + 8 };
  return { arena };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(A, hp) {
  const def = kingDef(); def.hp = hp;
  const B = makeBoss(def, STAGE.king * 16 + 8); B.hp = hp;
  return { A, def, B, cycle: 0, lastI: 0, phase: 1, burnCd: 0, pour: false, pourFx: 0, steam: 0, hitKeys: new Set(), act: 0,
    n: { opens: 0, pours: 0, wasted: 0, cycles: 0, jars: 0, burns: 0 }, said: {}, lts: 0 };
}
export const local = (F, x) => x - F.A.x0;
export const world = (F, lx) => lx + F.A.x0;
export const worldY = (F, ly) => ly - FLOOR + F.A.floor;
export const kingOpen = F => !!F && F.B.mode === 'open';
export const kingBurning = F => !!F && (F.B.data.burning || 0) > 0;
/* the game's multiplier on a blow: x KING.openMul in the opening; outside it the blow is left to the global chip (src/boss-greed.js) */
export const kingTake = F => kingOpen(F) ? KING.openMul : 1;
/* the mode the game sees: 'jarTell' while he tells the jar, 'jar' as it flies, 'walk', 'recover', 'open' */
export const kingMode = B => B.mode === 'tell' ? B.a.name + 'Tell' : B.mode === 'act' ? B.a.name : B.mode;

/* one frame: hero = { x, y, ground } (world px), hp (the game's health of him). Returns the engine's events, in world coordinates, and swaps the
   chain when a pass is done (EVERY CYCLE CHANGES) */
export function stepFight(F, hero, hp, dt) {
  const B = F.B; B.hp = hp;
  const w = { px: clampX(local(F, hero.x)), trail: [local(F, hero.x)], pour: F.pour };
  F.pour = false;
  const evs = bossStep(B, w, dt);
  /* a pass of the chain is done when the engine's index wraps: the next pass is the next order */
  if (B.i < F.lastI) { F.cycle++; F.n.cycles++; const set = CHAINS[B.phase]; const ch = set[F.cycle % set.length].slice(); if (B.phase === 2) F.def.chain2 = ch; else F.def.chain = ch; B.i = 0; }
  F.lastI = B.i;
  if (B.phase === 2 && F.phase === 1) { F.phase = 2; F.cycle = 0; F.def.chain2 = CHAINS[2][0].slice(); }
  const out = [];
  for (const v of evs) {
    if (v.t === 'tell') { F.act++; if (v.what === 'jar') F.n.jars++; out.push({ t: 'tell', what: v.what, mark: v.mark, x: v.x != null ? world(F, v.x) : null, x2: v.what === 'jar' && B.data.mark2 != null ? world(F, B.data.mark2) : null }); }
    else if (v.t === 'act') out.push({ t: 'act', what: v.what });
    else if (v.t === 'hit') out.push({ t: 'hit', what: v.what, blockable: v.blockable, key: F.act, box: [world(F, v.box[0]), world(F, v.box[1]), worldY(F, v.box[2]), worldY(F, v.box[3])] });
    else if (v.t === 'open') { F.n.opens++; out.push({ t: 'open', x: world(F, v.x) }); }
    else if (v.t === 'phase2') out.push({ t: 'phase2' });
  }
  if ((B.data.burning || 0) > 0 && !F.wasBurning) F.n.burns++;
  F.wasBurning = (B.data.burning || 0) > 0;
  return out;
}
/* the fires his jars left, in world px: [{ x, t }] */
export const kingFires = F => (F.B.data.fires || []).filter(f => f.t > 0).map(f => ({ x: world(F, f.x), t: f.t }));
/* A POUR AT HIM (the hero's INTERACT with a sip in the skin, within KING.pourR): it opens him only while he burns. Returns 'open' or 'wasted' */
export function pourAt(F, heroX) {
  if (Math.abs(local(F, heroX) - F.B.x) > KING.pourR) return null;
  F.n.pours++; F.pourFx = 0.6;
  if (kingBurning(F) && F.B.mode !== 'open' && F.B.openCd <= 0) { F.pour = true; F.steam = KING.openT;
    F.B.data.fires = (F.B.data.fires || []).filter(f => Math.abs(f.x - F.B.x) > KING.douse);   /* the steam: the fire he stands in goes out with his */
    return 'open'; }
  F.n.wasted++; return 'wasted';
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT (the Puppeteer's lesson): it sees a tell PLAN.react s after it began and misreads some (PLAN.missDodge); it lets some burns go
   (PLAN.missPour) and is late to some. It fills at the well when the skin is empty, baits the jar so he walks through his own fire, pours while
   he burns, cuts in the opening, and keeps out of the fire.
   s = { P: { x, y, face, ground, atk }, F, e, sips, wellX, reach, shield, t, rng, mem, adds: [{x, y, w}] } -> { gx, face, atk, jump, block, talk, why } */
export const PLAN = { react: 0.25, missDodge: 0.12, missPour: 0.18, stand: 70 };
export function banditKingPlan(s) {
  const { P, F, e, reach } = s, B = F.B, out = { gx: null, face: P.face, atk: false, jump: false, block: false, talk: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = key => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const A = F.A, lo = A.x0 + 14, hi = A.x1 - 14, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, fires = kingFires(F), inFire = x => fires.some(f => Math.abs(f.x - x) < KING.fireR + 8);
  const safeFrom = x => { if (!inFire(x)) return x; for (let d = 8; d < 400; d += 8) for (const q of [x + d * side, x - d * side]) if (q > lo && q < hi && !inFire(q)) return q; return x; };
  /* 1. THE BLOWS COMING (a quarter-second late, some misread) */
  if (B.mode === 'tell' || B.mode === 'act') {
    const name = B.a.name, key = 'k' + F.act;
    if (seenFor(key) && !roll(key + 'd', PLAN.missDodge)) {
      if (name === 'jar') { const m = world(F, B.data.mark), m2 = B.data.mark2 != null ? world(F, B.data.mark2) : null;
        const near = Math.abs(P.x - m) < 44 || (m2 != null && Math.abs(P.x - m2) < 44);
        if (near) { let gx = clamp(m + (Math.sign(m - kx) || side) * 36); if (m2 != null && Math.abs(gx - m2) < 34) gx = clamp(m - (Math.sign(m - kx) || side) * 36); out.gx = gx; out.why = 'off the jar\'s mark'; return out; } }
      if (name === 'charge') { const d = Math.abs(kx - P.x), coming = Math.sign(P.x - kx) === Math.sign(B.data.dir || side); if (B.mode === 'act' && coming && d < 140) { if (P.ground && d < 100) out.jump = true; out.gx = clamp(kx - side * 80); out.why = 'over the charge'; return out; }
        if (B.mode === 'tell' && B.t < 0.1 && d < 140 && P.ground) { out.jump = true; out.gx = clamp(kx - side * 80); out.why = 'jump the charge early'; return out; } }
      if (name === 'knives' && Math.abs(kx - P.x) < 280) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the knives'; return out; }
        if (B.mode === 'tell' && B.t < 0.2 && P.ground) { out.jump = true; out.why = 'jump the knives'; return out; } if (B.mode === 'act') { out.jump = P.ground; out.why = 'over the knives'; return out; } }
      if (name === 'sweep' && Math.abs(kx - P.x) < 70) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the sweep'; return out; }
        out.gx = clamp(kx + side * 84); out.why = 'back off the sweep'; return out; }
    }
  }
  /* 2. THE OPENING: on him */
  if (B.mode === 'open') { let gx = clamp(kx - side * Math.max(10, reach * 0.6)); if (inFire(gx)) { const q = [reach * 0.8, reach, reach * 0.4, reach + 6].flatMap(d => [clamp(kx - side * d), clamp(kx + side * d)]).find(c => !inFire(c)); if (q !== undefined) gx = q; }
    out.gx = gx; out.face = Math.sign(kx - gx) || -side; out.atk = Math.abs(kx - P.x) < reach + 14 && P.atk < 0; out.why = 'cut him: he is open'; return out; }
  /* 3. THE ADDS (his lieutenants): cut the one in the way */
  const add = (s.adds || []).filter(a => Math.abs(a.x - P.x) < 60).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  /* 4. HE BURNS: pour (if there is water) */
  if (kingBurning(F) && s.sips > 0 && B.openCd <= 0 && !roll('p' + F.n.burns, PLAN.missPour)) {
    if (Math.abs(kx - P.x) < KING.pourR - 6) { out.face = Math.sign(kx - P.x) || 1; out.talk = true; out.why = 'pour on him'; return out; }
    out.gx = safeFrom(clamp(kx - side * 26)); out.why = 'to him: he burns'; return out; }
  /* 5. NO WATER: the well (cut a lieutenant off it) */
  if (s.sips <= 0) { if (add && Math.abs(add.x - P.x) < reach + 12) { out.face = Math.sign(add.x - P.x) || 1; out.atk = P.atk < 0; out.why = 'the lieutenant'; return out; }
    if (Math.abs(P.x - s.wellX) < KING.wellR - 8) { out.talk = true; out.why = 'fill the skin'; return out; }
    out.gx = safeFrom(clamp(s.wellX)); out.why = 'to the well'; return out; }
  if (add && Math.abs(add.x - P.x) < reach + 12) { out.face = Math.sign(add.x - P.x) || 1; out.atk = P.atk < 0; out.why = 'the lieutenant'; return out; }
  /* 6. BAIT THE FIRE: stand past a fire from him, so he walks through it to reach you */
  const f = fires.filter(q => q.t > 1.2).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (f) { const s2 = Math.sign(f.x - kx) || side; out.gx = safeFrom(clamp(f.x + s2 * 46)); out.why = 'past the fire from him'; return out; }
  /* 7. otherwise keep a little way off: a chip is nothing, and the jar comes to where you stand */
  out.gx = safeFrom(clamp(kx + side * PLAN.stand)); out.why = 'keep off';
  return out;
}
