// src/gorge-crab.js - THE GREAT RED CRAB, THE RED GORGE's boss (claude/redgorge, 2026-10-02). Pure: no DOM, no main.js. His hands (the world,
// the drawing) are src/gorge-crab-hands.js; the level lays his plateau with stageGorgeCrab (src/red-gorge.js, the old dam). The desert-arc
// concept (2026-10-01): a NEW FLOOD-TIED GROUND BOSS for the gorge (THE ROC stays for THE SKY ROAD) - the flood washes him off his feet.
//
// HE RUNS ON THE DESERT ENGINE (src/desert-bosses.js makeBoss/bossStep, as THE BANDIT KING does): he walks at you, picks the next blow of his
// chain, TELLS it, ACTS, RECOVERS. His blows:
//   THE PINCH (!)     a claw snapped in front of him: block it, or step back
//   THE CRUSH (X)     both claws slammed on the ground in front of him, low: jump it, or be out of reach
//   THE BOULDER (X)   he flings a rock up off the plateau: a red mark where you stand, and it comes down there - move (phase two: two)
//   THE SCUTTLE (X)   sideways, low and fast, to where you stood when he told it - jump it. At its end his legs dig in (DUG) for a moment
// THE OPENING IS CAUSED, BY THE LEVEL'S MACHINE (docs/NEW-LEVEL-CHECKLIST.md: short, earned, told, >= 3 s): the dam's SLUICE GATE stands over the
//   plateau's channel (the old spillway). Shut it (E at a wheel) and the next flood BANKS behind it. Released (E again) the banked water comes
//   down the spillway at once: if he is IN THE CHANNEL it throws him on his back - OPEN for CRAB.openT at CRAB.openMul. A natural flood never
//   does it: he hears the horn and walks out of the channel (and he will not walk into running water). A release with him out of the channel
//   is water wasted - the gate must bank the next flood again.
// x0.05 CHIP OTHERWISE: the GLOBAL rule (src/boss-greed.js OPEN_RULE, claude/combat3) - a blow outside the opening is a scratch, and four of them
//   in a hurry bring his greed reprisal.
// HE ALWAYS FIGHTS: the engine never idles him. EVERY CYCLE CHANGES: each pass of his chain is a new order (CHAINS[phase][cycle % n]).
// PHASE TWO (half health): the floods come faster; two boulders at once; and he WILL NOT WALK INTO THE CHANNEL WHILE THE GATE HOLDS WATER - he
//   smells it. Only his SCUTTLE carries him in: stand in the channel, make him scuttle at you, jump him - he digs in where you stood - and run
//   for a wheel.
// THE TOUCH RULE: his shell never hurts; only his told blows.
import { makeBoss, bossStep, FLOOR } from './desert-bosses.js';

export const CRAB = {
  hp: 1900, w: 46, h: 28, markH: 44,
  openMul: 1.6, openT: 3.5, openRest: 2.0,     /* THE OPENING: three and a half seconds on his back (the house floor is 3), a blow x1.6 in it (tuned with the human-bot pilot, tools/redgorge-pilot.mjs); x0.05 outside (the global rule) */
  dmg: { pinch: 30, crush: 38, boulder: 30, scuttle: 31 }, p2: 1.3,   /* each told blow; phase two hits harder */
  speed: 58, scuttleV: 250, dugT: 1.4, keep: 40,
  dryP2: 4.5,                                   /* phase two: the dry spell between floods (src/red-gorge-hands.js GORGE.dry otherwise) */
};
/* EVERY CYCLE CHANGES: the order of each pass, phase one and phase two (cycle k uses [k % n]) */
export const CHAINS = {
  1: [['pinch', 'boulder', 'scuttle', 'crush'], ['boulder', 'scuttle', 'pinch', 'crush', 'boulder'], ['scuttle', 'crush', 'boulder', 'pinch']],
  2: [['boulder', 'scuttle', 'crush', 'boulder', 'pinch'], ['scuttle', 'boulder', 'scuttle', 'crush'], ['crush', 'scuttle', 'boulder', 'pinch', 'boulder']],
};
/* THE PLATEAU (local px; the engine's arena is 0..640): the old spillway's channel, and the two wheels either side of it */
export const STAGE = { W: 40, door: 6, ch: [17, 21], wheels: [14, 24], crab: 32, gateRow: 6 };
export const CH = { x0: STAGE.ch[0] * 16, x1: (STAGE.ch[1] + 1) * 16 };
const clampX = x => Math.max(24, Math.min(616, x));
/* is he in the channel? (his body over its middle: a crab half in the spillway is in it) */
export const inChannel = x => x > CH.x0 - CRAB.w * 0.25 && x < CH.x1 + CRAB.w * 0.25;
const front = (B, len, h = 30, lo = 0) => [B.face > 0 ? B.x : B.x - len, B.face > 0 ? B.x + len : B.x, FLOOR - h, FLOOR - lo];
const at = (x, half, h = 40) => [x - half, x + half, FLOOR - h, FLOOR];

/* his def for one fight */
export function crabDef() {
  return {
    name: 'THE GREAT RED CRAB', hp: CRAB.hp, speed: CRAB.speed, cd: 0.8, openT: CRAB.openT, openRest: CRAB.openRest, phase2: 0.5, keep: CRAB.keep, patience: 1.6,
    chain: CHAINS[1][0].slice(), chain2: CHAINS[2][0].slice(),
    attacks: {
      pinch: { mark: '!', tell: 0.55, act: 0.25, range: [0, 66], hit: B => ({ box: front(B, 60, 30) }) },
      crush: { mark: 'X', tell: 0.85, act: 0.3, range: [0, 84], hit: B => ({ box: front(B, 78, 22) }) },
      boulder: { mark: 'X', tell: 0.95, act: 0.3, range: [70, 640],
        start: (B, w) => { B.data.mark = clampX(w.px); B.data.mark2 = B.phase === 2 ? clampX(w.px + (w.px < 320 ? 80 : -80)) : null; },
        hit: B => ({ box: at(B.data.mark, 22, 44) }) },
      scuttle: { mark: 'X', tell: 0.8, act: 1.4, recover: CRAB.dugT, range: [60, 640],
        start: (B, w) => { B.data.to = clampX(w.px); B.data.dir = Math.sign(B.data.to - B.x) || 1; },
        move: (B, w, dt) => { const d = B.data.to - B.x, st = CRAB.scuttleV * dt; if (Math.abs(d) <= st) { B.x = B.data.to; B.t = 0; } else B.x = clampX(B.x + Math.sign(d) * st); B.face = B.data.dir; },
        each: true, hit: B => ({ box: at(B.x, 22, 22) }) },
    },
    /* THE OPENING: a RELEASED burst down the spillway while he is in it (w.swept: the hands say the burst is on him) */
    rule: (B, w) => !!w.swept && inChannel(B.x),
    /* he hears the horn: out of the channel, and no blow begun while he walks out */
    pick: (B, w) => (w.horn || w.running) && inChannel(B.x) ? 'hold' : null,
    /* he never walks INTO water that is coming or running, and in phase two not into the channel while the gate holds water */
    blocked: (B, w, nx) => !inChannel(B.x) && inChannel(nx) && (w.horn || w.running || (B.phase === 2 && w.held)),
  };
}

/* THE PLATEAU. sx: its first column; R: its floor row. Forty columns (sx..sx+39), his walls at sx-1 and sx+40 (each a six-row door the fight
   shuts), the spillway's channel in the middle (a slot in the back cliff, its gate high in it), a wheel each side. W = { set, block, ent, air } */
export function stageGorgeCrab(W, T, TS, sx, R) {
  const { block, ent, air } = W, ex = sx + STAGE.W;
  air(sx, ex - 1, 4, R - 1);
  block(sx - 1, sx - 1, 0, R - STAGE.door - 1); block(ex, ex, 0, R - STAGE.door - 1);   /* the walls over his two doors */
  air(sx - 1, sx - 1, R - STAGE.door, R - 1); air(ex, ex, R - STAGE.door, R - 1);
  block(sx - 1, ex, R, R + 2);
  for (const lx of STAGE.wheels) ent('sluice', sx + lx, R - 1, { gate: 'dam', arena: true });
  ent('gorgecrab', sx + STAGE.crab, R - 1, { face: -1 });
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 5) * TS, wallL: sx - 1, wallR: ex, boss: 'gorgecrab', music: 'gorgecrab',
    tint: '#d0704a', tintA: 0.07, start: [sx + 3, R - 1], ch: [(sx + STAGE.ch[0]) * TS, (sx + STAGE.ch[1] + 1) * TS], wheels: STAGE.wheels.map(lx => (sx + lx) * TS + 8) };
  return { arena, channel: [sx + STAGE.ch[0], sx + STAGE.ch[1]], gateRow: STAGE.gateRow };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(A, hp) {
  const def = crabDef(); def.hp = hp;
  const B = makeBoss(def, STAGE.crab * 16 + 8); B.hp = hp;
  return { A, def, B, cycle: 0, lastI: 0, phase: 1, act: 0, n: { opens: 0, releases: 0, wasted: 0, cycles: 0, scuttles: 0, boulders: 0 }, said: {} };
}
export const local = (F, x) => x - F.A.x0;
export const world = (F, lx) => lx + F.A.x0;
export const worldY = (F, ly) => ly - FLOOR + F.A.floor;
export const crabOpen = F => !!F && F.B.mode === 'open';
export const crabDug = F => !!F && F.B.mode === 'recover' && !!F.B.a && F.B.a.name === 'scuttle';
/* the game's multiplier on a blow (on top of the global chip): x CRAB.openMul in the opening */
export const crabTake = F => crabOpen(F) ? CRAB.openMul : 1;
/* the mode the game sees: 'boulderTell' while he tells it, 'scuttle' as he goes, 'dug' dug in after a scuttle, 'walk', 'recover', 'open' */
export const crabMode = B => B.mode === 'tell' ? B.a.name + 'Tell' : B.mode === 'act' ? B.a.name : B.mode === 'recover' && B.a && B.a.name === 'scuttle' ? 'dug' : B.mode;

/* one frame: hero = { x }, hp (the game's health of him), water = { horn, running, held, swept } (from src/red-gorge-hands.js). Returns the
   engine's events in world coordinates, and swaps the chain when a pass is done (EVERY CYCLE CHANGES) */
export function stepFight(F, hero, hp, water, dt) {
  const B = F.B; B.hp = hp;
  const w = { px: clampX(local(F, hero.x)), trail: [local(F, hero.x)], horn: !!water.horn, running: !!water.running, held: !!water.held, swept: !!water.swept };
  /* the horn: he walks out of the channel (to the nearer bank), his blows wait */
  if ((w.horn || w.running) && B.mode === 'walk' && inChannel(B.x)) { const mid = (CH.x0 + CH.x1) / 2, dir = B.x < mid ? -1 : 1; B.x = clampX(B.x + dir * CRAB.speed * 1.8 * dt); B.face = dir; }
  const evs = bossStep(B, w, dt);
  if (B.i < F.lastI) { F.cycle++; F.n.cycles++; const set = CHAINS[B.phase]; const ch = set[F.cycle % set.length].slice(); if (B.phase === 2) F.def.chain2 = ch; else F.def.chain = ch; B.i = 0; }
  F.lastI = B.i;
  if (B.phase === 2 && F.phase === 1) { F.phase = 2; F.cycle = 0; F.def.chain2 = CHAINS[2][0].slice(); }
  const out = [];
  for (const v of evs) {
    if (v.t === 'tell') { F.act++; if (v.what === 'boulder') F.n.boulders++; if (v.what === 'scuttle') F.n.scuttles++;
      out.push({ t: 'tell', what: v.what, mark: v.mark, x: v.what === 'boulder' ? world(F, B.data.mark) : v.what === 'scuttle' ? world(F, B.data.to) : null, x2: v.what === 'boulder' && B.data.mark2 != null ? world(F, B.data.mark2) : null }); }
    else if (v.t === 'act') out.push({ t: 'act', what: v.what });
    else if (v.t === 'hit') { const box = [world(F, v.box[0]), world(F, v.box[1]), worldY(F, v.box[2]), worldY(F, v.box[3])];
      out.push({ t: 'hit', what: v.what, blockable: v.blockable, key: F.act, box });
      if (v.what === 'boulder' && B.data.mark2 != null) { const m2 = world(F, B.data.mark2); out.push({ t: 'hit', what: 'boulder', blockable: false, key: F.act + 0.5, box: [m2 - 22, m2 + 22, box[2], box[3]] }); } }
    else if (v.t === 'open') { F.n.opens++; out.push({ t: 'open', x: world(F, v.x) }); }
    else if (v.t === 'phase2') out.push({ t: 'phase2' });
  }
  return out;
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT (the Puppeteer's lesson): it sees a tell PLAN.react s after it began and misreads some (PLAN.missDodge); it is late to some
   releases (PLAN.missRelease). It shuts the gate when it is open, keeps off him while the flood banks, baits him into the channel by standing at
   a wheel across it (phase one) or by standing in the channel for his scuttle (phase two), releases the banked water when he is in it, and cuts
   him while he is on his back - from the bank, never into the burst.
   s = { P: { x, y, face, ground, atk }, F, e, water: { phase, horn, running, held, burst, gate }, wheels: [x..], ch: [x0, x1], reach, shield, t, rng, mem }
   -> { gx, face, atk, jump, block, talk, why } */
export const PLAN = { react: 0.25, missDodge: 0.12, missRelease: 0.15 };
export function gorgeCrabPlan(s) {
  const { P, F, e, reach, water } = s, B = F.B, out = { gx: null, face: P.face, atk: false, jump: false, block: false, talk: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = key => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const A = F.A, lo = A.x0 + 14, hi = A.x1 - 14, clamp = x => Math.max(lo, Math.min(hi, x));
  const [c0, c1] = s.ch, cmid = (c0 + c1) / 2, inCh = x => x > c0 - 6 && x < c1 + 6, wet = water.horn || water.running || water.burst;
  const kx = e.x, side = Math.sign(P.x - kx) || 1;
  const wheels = s.wheels.slice().sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x)), near = wheels[0];
  const atWheel = Math.abs(P.x - near) < 14;
  /* 1. THE BLOWS COMING (a quarter-second late, some misread) */
  if (B.mode === 'tell' || B.mode === 'act') {
    const name = B.a.name, key = 'k' + F.act;
    if (seenFor(key) && !roll(key + 'd', PLAN.missDodge)) {
      if (name === 'boulder') { const m = world(F, B.data.mark), m2 = B.data.mark2 != null ? world(F, B.data.mark2) : null;
        if (Math.abs(P.x - m) < 40 || (m2 != null && Math.abs(P.x - m2) < 40)) { let gx = clamp(m + (P.x >= m ? 1 : -1) * 48); if (m2 != null && Math.abs(gx - m2) < 40) gx = clamp(m - (P.x >= m ? 1 : -1) * 48);
          if (wet && inCh(gx)) gx = clamp(gx < cmid ? c0 - 24 : c1 + 24); out.gx = gx; out.why = 'off the boulder\'s mark'; return out; } }
      if (name === 'scuttle') { const d = Math.abs(kx - P.x); if (B.mode === 'act' && d < 120) { if (P.ground && d < 70) out.jump = true; out.why = 'over the scuttle'; return out; }
        if (B.mode === 'tell') { out.why = 'wait for the scuttle'; return out; } }
      if (name === 'crush' && Math.abs(kx - P.x) < 100) { if (B.mode === 'act' && P.ground) out.jump = true; else out.gx = clamp(kx + side * 104); out.why = 'off the crush'; return out; }
      if (name === 'pinch' && Math.abs(kx - P.x) < 80) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the pinch'; return out; }
        out.gx = clamp(kx + side * 90); out.why = 'back off the pinch'; return out; }
    }
  }
  /* 2. ON HIS BACK: cut him - from the bank while the burst still runs */
  if (B.mode === 'open') { let gx = clamp(kx - side * Math.max(10, reach * 0.6)); if (water.burst && inCh(gx)) gx = clamp(kx < cmid ? Math.max(gx, c1 + 6) : Math.min(gx, c0 - 6));
    if (water.burst && P.x > c0 - 4 && P.x < c1 + 4) gx = P.x < cmid ? c0 - 12 : c1 + 12;
    out.gx = gx; out.face = Math.sign(kx - gx) || -side; out.atk = Math.abs(kx - P.x) < reach + CRAB_HALF && P.atk < 0; out.why = 'cut him: he is on his back'; return out; }
  /* 3. NEVER IN THE CHANNEL WHILE WATER COMES */
  if (wet && inCh(P.x)) { out.gx = clamp(P.x < cmid ? c0 - 20 : c1 + 20); out.why = 'out of the channel'; return out; }
  /* 4. THE GATE IS OPEN (nothing held): shut it */
  if (water.gate === 'open') { if (atWheel) { out.talk = true; out.why = 'shut the gate'; return out; } out.gx = clamp(near); out.why = 'to a wheel: shut it'; return out; }
  /* 5. WATER HELD: bait him into the channel, and release */
  if (water.gate === 'full') {
    const inNow = kx > c0 - 10 && kx < c1 + 10, dug = B.mode === 'recover' && B.a && B.a.name === 'scuttle';
    if (inNow && B.openCd <= 0 && (dug || B.phase === 1) && !roll('r' + F.act, PLAN.missRelease)) { if (atWheel) { out.talk = true; out.why = 'release: he is in the channel'; return out; }
      if (dug) { out.gx = clamp(near); out.why = 'to the wheel: he is dug in'; return out; } }
    if (B.phase === 2 && !wet) { /* stand in the channel for his scuttle (when he is out of it) */ if (!inNow) { out.gx = clamp(cmid); out.why = 'bait the scuttle'; return out; } out.gx = clamp(kx < cmid ? c1 + 30 : c0 - 30); out.why = 'clear of him'; return out; }
    /* phase one: stand at the wheel across the channel from him: he walks in to fight you */
    const far = kx < cmid ? s.wheels.reduce((a, b) => (b > a ? b : a)) : s.wheels.reduce((a, b) => (b < a ? b : a));
    out.gx = clamp(far); out.face = Math.sign(kx - far) || 1; out.why = 'at the wheel across from him'; return out; }
  /* 6. THE GATE IS SHUT, WAITING ON A FLOOD: keep near a wheel and off him */
  const away = Math.abs(kx - near) < 90 ? wheels.find(w => Math.abs(kx - w) >= 90) || near : near;
  out.gx = clamp(away); out.why = 'wait by a wheel for the flood to bank';
  return out;
}
const CRAB_HALF = CRAB.w / 2;
