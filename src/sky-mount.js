// src/sky-mount.js - THE DRAKE'S BACK (lane S1 SKYMOUNT, claude/skymount, 11-04; design scratch/lane-reports/heartplan.md section 3 "The arena").
// The Demon King's sky fight is fought standing on the Fire Drake's back as it flies over the erupting volcano. This file is the arena as
// pure logic (no DOM, no main.js): the back as a moving platform, its walls, the BANK, the knock-DOWN rule, the parallax sky as data, the
// phase-change climb, and the hooks the Demon King (lane S2, src/demon-king.js) reads. Proved by tools/sky-mount.mjs (node, no browser).
// main.js wires it through src/sky-mount-hands.js (a handful of one-line hooks) and draws it with src/sky-mount-draw.js (greybox).
//
// THE RULES (Daniel 11-04: the hero rides the flying drake's back; it BANKS; NO FALLING OFF; three phases; every hero; co-op both on it):
//   THE BACK   a 192 px platform from the tail root (x0) to the wing-root ridge behind the neck (x1). It BOBS with the wingbeat. The hero
//              walks, jumps, dodges and fights with his own kit on it: it is his mover (P.onMover = the back), so every kit check that
//              treats "on a mover" as footing treats the back as footing.
//   THE WALLS  the neck's spines (x1) and the tail fin (x0). Nothing passes them: a dash, a roll, a vault, a knock - clamped every step.
//   NO FALL    the hero can never be below the back's surface: anything that would put him there puts him ON it. There is no pit, no fall
//              damage, no kill zone. A jump's arc is capped at the sky box top (SKY_TOP px above the back).
//   KNOCK-DOWN a blow that would knock you BACK knocks you DOWN where you stand: prone 0.5 s, i-frames >= 0.6 s, no travel.
//   THE BANK   told 1.0 s (the head turns, a roar, the near wing dips), then the back tilts +-8 deg for 1.6 s and levels over 0.3 s.
//              Standing on it you slide 30 px/s downhill (every hero's legs beat it: walk against it). P1 every ~12 s, P2 ~9, P3 ~7.
//              NEVER during a knockdown window: S2 calls holdBank(back, s) while the King is down.
//   THE SKY    scrolls past; the hero does not. Four parallax layers per altitude, three altitudes (P1 the crater rim, P2 higher with
//              the lava bombs, P3 above the ash column). A phase change is a 5 s CLIMB between altitudes with no bank.
//   CO-OP      both heroes (an AI partner too) stand on the same back; spawn slots, the AI's walk on it, and the King's knockdown
//              landing spot "between you and the neck" (between the two of you in co-op) are here.

export const SKM = {
  VIEW: { w: 320, h: 180, backAt: 120 / 180 },        // the camera holds the back at y 120 of a 320x180 view, its middle at the middle
  BACK: { len: 192, wall: 6, pad: 1 },                // the platform's length; each end wall's thickness (the spines, the fin)
  SKY_TOP: 96,                                        // a hero's HEAD never rises more than this over the back (the sky box's top)
  BOB: { amp: 2, hz: 0.55 },                          // the wingbeat: +-2 px, a beat every ~1.8 s
  BANK: { tell: 1.0, hold: 1.6, ease: 0.25, recover: 0.3, deg: 8, slide: 30, every: [12, 9, 7], jitter: 0.15, afterHold: 2.0 },
  KNOCK: { prone: 0.5, inv: 0.6 },
  CLIMB: { t: 5.0, rise: 60 },                        // the phase change: 5 s, the sky slides down 60 px past you
  SCROLL: 70,                                         // px/s of the NEAREST sky layer (k = 1); a layer moves at k x this
  KING: { gap: 28, half: 20 },                        // the King's knockdown landing: at least `gap` px from a hero; his half-width
  AI: { dead: 6 },                                    // the AI partner walks to its goal until within this many px
  ALT: ['rim', 'high', 'ash'],                        // phase 1..3 -> altitude
};

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const D2R = Math.PI / 180;
/* a small seeded random, so the bank's cadence can be replayed in the node check (main.js passes Math.random) */
export function seeded(seed = 1) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

/* THE BACK. cfg (world px): { x0, y, len?, phase?, skyTop? }. The object doubles as the hero's mover: x/w/y/dx/dy are what main.js's
   mover code reads (y is set per hero to the surface under him by preStep, dx/dy stay 0 - the back carries a hero by being where he is). */
export function newBack(cfg, rnd = Math.random) {
  const len = cfg.len || SKM.BACK.len, x0 = cfg.x0, y0 = cfg.y;
  const b = { skm: true, kind: 'drakeback', x0, x1: x0 + len, len, cx: x0 + len / 2, y0, x: x0, w: len, h: 8, y: y0, dx: 0, dy: 0,
    wall: SKM.BACK.wall, skyTop: y0 - (cfg.skyTop || SKM.SKY_TOP), t: 0, bob: 0, scroll: 0, phase: cfg.phase || 1, alt: SKM.ALT[(cfg.phase || 1) - 1],
    bank: { state: 'level', t: 0, dir: 0, ang: 0, n: 0 }, nextBank: 0, hold: 0, climb: null, lit: true, rnd, events: [] };
  b.nextBank = bankGap(b);
  return b;
}
export function resetBack(b, phase = 1) {
  Object.assign(b, { t: 0, bob: 0, scroll: 0, phase, alt: SKM.ALT[phase - 1], hold: 0, climb: null, y: b.y0, dx: 0, dy: 0, events: [] });
  b.bank = { state: 'level', t: 0, dir: 0, ang: 0, n: 0 }; b.nextBank = bankGap(b); return b;
}
/* the time to the next bank's tell, by phase, +- jitter */
export function bankGap(b) { const B = SKM.BANK, base = B.every[clamp(b.phase, 1, 3) - 1]; return base * (1 + (b.rnd() * 2 - 1) * B.jitter); }
export const bankDeg = b => b.bank.ang / D2R;
/* the back's surface height at x (world px): the flat line, the wingbeat, and the bank's tilt about the middle (positive angle = the
   right side, the neck's, is LOWER: y grows to the right) */
export function surfaceY(b, x) { return b.y0 + b.bob + (clamp(x, b.x0, b.x1) - b.cx) * Math.tan(b.bank.ang); }
/* which way is downhill on the back: +1 toward the neck, -1 toward the tail, 0 level */
export const downhill = b => (Math.abs(b.bank.ang) < 1e-4 ? 0 : Math.sign(b.bank.ang));
/* the walkable span for a body w px wide: inside the walls */
export function walkable(b, w = 10) { const h = w / 2 + SKM.BACK.pad; return [b.x0 + b.wall + h, b.x1 - b.wall - h]; }
export const banking = b => b.bank.state === 'tilt' || b.bank.state === 'recover';
export const bankTelling = b => b.bank.state === 'tell';

/* ONE STEP of the drake: the wingbeat, the sky's scroll, the bank, the hold and the climb. o: { phase? } (S2 sets the phase).
   Returns this step's events: 'tell' (start the drake's tell: head turn, roar, wing dip - and its sound), 'tilt', 'level', 'climbEnd'. */
export function stepBack(b, dt, o = {}) {
  const ev = []; b.t += dt; if (o.phase && o.phase !== b.phase && !b.climb) b.phase = o.phase;
  b.bob = Math.sin(b.t * Math.PI * 2 * SKM.BOB.hz) * SKM.BOB.amp;
  b.scroll += SKM.SCROLL * dt;
  b.hold = Math.max(0, b.hold - dt);
  if (b.climb) { const c = b.climb; c.t += dt; if (c.t >= c.T) { b.alt = c.to; b.climb = null; b.nextBank = bankGap(b); ev.push('climbEnd'); } }
  const B = SKM.BANK, k = b.bank;
  if (k.state === 'level') {
    if (!b.climb) { if (b.hold > 0) b.nextBank = Math.max(b.nextBank, B.afterHold); else b.nextBank -= dt; }
    if (b.nextBank <= 0 && b.hold <= 0 && !b.climb) { k.state = 'tell'; k.t = 0; k.n++; k.dir = o.dir || (k.n % 2 ? 1 : -1) * (b.rnd() < 0.25 ? -1 : 1); ev.push('tell'); }
  } else if (k.state === 'tell') {
    k.t += dt;
    if (b.hold > 0 || b.climb) { k.state = 'level'; k.t = 0; b.nextBank = B.afterHold; }          // a knockdown or a climb takes the bank back
    else if (k.t >= B.tell) { k.state = 'tilt'; k.t = 0; ev.push('tilt'); }
  } else if (k.state === 'tilt') {
    k.t += dt; const max = B.deg * D2R * k.dir;
    k.ang = max * Math.min(1, k.t / B.ease);
    if (k.t >= B.hold || b.hold > 0 || b.climb) { k.state = 'recover'; k.t = 0; k.from = k.ang; }
  } else if (k.state === 'recover') {
    k.t += dt; const u = Math.min(1, k.t / B.recover); k.ang = (k.from || 0) * (1 - u);
    if (u >= 1) { k.state = 'level'; k.t = 0; k.ang = 0; k.dir = 0; b.nextBank = bankGap(b); ev.push('level'); }
  }
  b.events = ev; return ev;
}
/* S2's hook: no bank for s seconds (the King's knockdown window, his repulse, a scene). A tell in progress is called off, a tilt levels. */
export function holdBank(b, s) { b.hold = Math.max(b.hold, s); }
/* the phase change: the drake climbs to the next altitude over CLIMB.t s; no bank while it does */
export function beginClimb(b, toPhase) { const to = SKM.ALT[clamp(toPhase, 1, 3) - 1]; b.climb = { t: 0, T: SKM.CLIMB.t, from: b.alt, to }; b.phase = clamp(toPhase, 1, 3); }
/* how far through the climb (0..1, eased), for the sky's blend and its vertical slide */
export function climbK(b) { if (!b.climb) return 0; const u = clamp(b.climb.t / b.climb.T, 0, 1); return u * u * (3 - 2 * u); }

/* ---- THE HERO ON IT ----
   mount(P, b, x): onto the back at x. A field on the hero, P.mount = the back; main.js's mover code carries him. */
export function mount(P, b, x) {
  P.mount = b; const [a, z] = walkable(b, P.w || 10); P.x = clamp(x ?? b.cx, a, z); P.y = surfaceY(b, P.x); P.vx = 0; P.vy = 0;
  P.ground = true; P.onMover = b; P.mountDown = 0; P.carpet = null; P.climb = false; P.cling = false; P.swim = false;
}
export function dismount(P) { if (P.onMover && P.onMover.skm) P.onMover = null; P.mount = null; P.mountDown = 0; }
/* BEFORE the hero's own step (main.js, ahead of its mover carry): the back is put where his feet are, so the carry keeps him and adds
   nothing - the surface's own motion (the wingbeat, the tilt) is applied here by standing him on it. Walls first. */
export function preStep(P, b) {
  const [a, z] = walkable(b, P.w || 10); if (P.x < a) P.x = a; if (P.x > z) P.x = z;
  b.x = b.x0; b.w = b.len; b.dx = 0; b.dy = 0;
  if (P.onMover === b) { P.y = surfaceY(b, P.x); b.y = P.y; } else b.y = surfaceY(b, P.x);
}
/* AFTER the hero's own step (main.js, after the mover landing): the walls, the sky box's top, NO FALLING THROUGH, the landing, the
   bank's slide and the prone clock. o: { dt, block, dodging, coyote, solid } (solid = main.js's T.SOLID for P.groundTile).
   Returns { landed, wall: 'l'|'r'|null, capped, slid } for the hands' dust and sounds. */
export function footStep(P, b, prevY, o = {}) {
  const dt = o.dt || 1 / 60, r = { landed: false, wall: null, capped: false, slid: 0 };
  const was = P.onMover === b && !!P.ground;
  const [a, z] = walkable(b, P.w || 10);
  if (P.x < a) { P.x = a; if (P.vx < 0) P.vx = 0; r.wall = 'l'; }
  if (P.x > z) { P.x = z; if (P.vx > 0) P.vx = 0; r.wall = 'r'; }
  const head = P.h || 14, top = b.skyTop + head;
  if (P.y < top) { P.y = top; if (P.vy < 0) P.vy = 0; r.capped = true; }
  let s = surfaceY(b, P.x);
  /* NO FALLING OFF, NO FALLING THROUGH: at or under the surface going down is standing on it; under it going up (a rising cut started
     from a tilted back's low side, a knock) is put on top of it too - the back is the only floor there is */
  if (P.y >= s - 0.01 && (P.vy >= 0 || P.y > s + 0.01 || (P.onMover === b && P.ground))) {
    P.y = s; if (P.vy > 0) P.vy = 0; P.ground = true; P.onMover = b; if (o.solid !== undefined) P.groundTile = o.solid;
    P.coyote = Math.max(P.coyote || 0, o.coyote ?? 0.1); P.kicked = false; if (!was && (prevY ?? s) < s - 0.5) r.landed = true;
  }
  /* THE BANK'S SLIDE: standing, you go downhill at 30 px/s at the full tilt (half behind a guard); a dodge is your own way */
  if (P.ground && P.onMover === b && banking(b) && !o.dodging) {
    const d = downhill(b), k = Math.abs(b.bank.ang) / (SKM.BANK.deg * D2R);
    if (d) { const v = SKM.BANK.slide * k * (o.block ? 0.5 : 1) * d; const nx = clamp(P.x + v * dt, a, z); r.slid = nx - P.x; P.x = nx; P.y = surfaceY(b, P.x); }
  }
  /* KNOCKED DOWN: flat on the back for the prone time, going nowhere */
  if ((P.mountDown || 0) > 0) { P.mountDown = Math.max(0, P.mountDown - dt); if (P.ground) P.vx = 0; }
  if (P.onMover === b) b.y = P.y;
  return r;
}
/* THE KNOCK-DOWN RULE (main.js damagePlayer0, in place of the knock-back throw): where you stand, flat, for KNOCK.prone; never off. */
export function knockDown(P) {
  P.vx = 0; if (P.vy < 0 || P.ground) P.vy = 0;
  P.mountDown = SKM.KNOCK.prone; P.hurt = Math.max(P.hurt || 0, SKM.KNOCK.prone); P.inv = Math.max(P.inv || 0, SKM.KNOCK.inv);
  return 'down';
}
export const prone = P => (P.mountDown || 0) > 0;
/* anything that would PLANT on a floor (a stone, a consecrated patch, a dropped arrow, a glyph ring, a lava bomb's ring) plants on the
   back here: the nearest point on its surface. Kits read it through the hands (lane S3 wires the per-kit ones). */
export function plantOnBack(b, x) { const [a, z] = walkable(b, 2); const px = clamp(x, a, z); return { x: px, y: surfaceY(b, px) }; }
/* the sky fight is lit (the eruption, the ash glow): THE SUN PRIEST's radiance fills on the back (rec - the report's question) */
export const litAt = b => !!b.lit;

/* ---- CO-OP ---- */
/* where n heroes stand at the mount-up: tail half, 24 px apart, all inside the walls */
export function spawnSlots(b, n = 1) { const [a, z] = walkable(b, 10), out = []; for (let i = 0; i < n; i++) out.push(clamp(b.x0 + b.len * 0.32 + i * 24, a, z)); return out; }
/* THE AI PARTNER ON THE BACK: no ledge-walker (it reads tiles; the back has none) - left or right toward its goal, inside the walls */
export function aiKeys(p, b, goal, keys) {
  const [a, z] = walkable(b, p.w || 10), g = clamp(goal, a, z), d = g - p.x;
  keys.left = d < -SKM.AI.dead; keys.right = d > SKM.AI.dead; return keys;
}
/* THE KING'S KNOCKDOWN LANDING (S2): always on the back, BETWEEN YOU AND THE NECK; in co-op, between the two of you when there is room.
   heroes: [{ x, dead?, down? }]. Returns { x, side: 'between' | 'neck' | 'tail' }. */
export function kingLandX(b, heroes) {
  const K = SKM.KING, lo = b.x0 + b.wall + K.half, hi = b.x1 - b.wall - K.half;
  const xs = (heroes || []).filter(h => h && !h.dead && !(h.down > 0)).map(h => h.x).sort((p, q) => p - q);
  if (!xs.length) return { x: clamp(b.cx, lo, hi), side: 'neck' };
  if (xs.length >= 2) { const a = xs[0], z = xs[xs.length - 1]; if (z - a >= K.gap * 2) return { x: clamp((a + z) / 2, lo, hi), side: 'between' }; }
  const front = xs[xs.length - 1];
  if (hi - front >= K.gap) return { x: clamp(Math.max(front + K.gap, (front + hi) / 2), lo, hi), side: 'neck' };
  const back = xs[0];   /* pressed against the neck: no room in front, so he crashes down BEHIND you (toward the tail) */
  return { x: clamp(Math.min(back - K.gap, (back + lo) / 2), lo, hi), side: 'tail' };
}

/* ---- THE CAMERA: locked on the drake ---- */
export function camFor(b, VW = SKM.VIEW.w, VH = SKM.VIEW.h) { return { x: Math.round(b.cx - VW / 2), y: Math.round(b.y0 - VH * SKM.VIEW.backAt) }; }

/* ---- THE SKY, AS DATA (the art lane S4 paints these ids; the greybox fills them flat) ----
   per altitude: the gradient (top, bottom) and four layers far -> near. k = the parallax share of SCROLL; y/h = the band, as fractions
   of the view height; kind = what the greybox draws (band, ridge, cone, motes); fx = the animated part the art lane owes. */
export const SKY = {
  rim: { top: '#26121a', bot: '#8a3218', glow: '#ff7a2a', layers: [
    { id: 'rim-ash', k: 0.04, kind: 'band', y: 0.10, h: 0.16, col: '#3a2026' },
    { id: 'rim-ranges', k: 0.12, kind: 'ridge', y: 0.58, h: 0.20, col: '#2c1a1e' },
    { id: 'rim-cone', k: 0.28, kind: 'cone', y: 0.62, h: 0.46, col: '#3c1e16', fx: 'eruption' },
    { id: 'rim-embers', k: 1.3, kind: 'motes', y: 0, h: 1, col: '#ffb04a' } ] },
  high: { top: '#1c1018', bot: '#6a2a1c', glow: '#ff6a2a', layers: [
    { id: 'high-ash', k: 0.05, kind: 'band', y: 0.18, h: 0.22, col: '#34202a' },
    { id: 'high-ranges', k: 0.10, kind: 'ridge', y: 0.78, h: 0.14, col: '#24161a' },
    { id: 'high-cone', k: 0.20, kind: 'cone', y: 0.86, h: 0.34, col: '#34180f', fx: 'bombs' },
    { id: 'high-cloud', k: 1.1, kind: 'band', y: 0.92, h: 0.10, col: '#4a2c2c' } ] },
  ash: { top: '#120c14', bot: '#3a1c22', glow: '#d04a3a', layers: [
    { id: 'ash-column', k: 0.03, kind: 'band', y: 0.40, h: 0.60, col: '#24181e' },
    { id: 'ash-ranges', k: 0.06, kind: 'ridge', y: 0.97, h: 0.06, col: '#1c1216' },
    { id: 'ash-cone', k: 0.10, kind: 'cone', y: 0.99, h: 0.12, col: '#2a1410', fx: 'lightning' },
    { id: 'ash-embers', k: 1.4, kind: 'motes', y: 0, h: 1, col: '#ff8a5a' } ] },
};
/* a layer's horizontal offset (px, <= 0) for a repeating strip `period` px wide: the sky goes LEFT past a drake flying right */
export function layerShift(layer, scroll, period) { const p = Math.max(1, period | 0), v = (scroll * layer.k) % p; return -v; }
/* which altitude(s) to draw and how much of each: { a, b, k } - during a climb a fades into b while the sky slides down CLIMB.rise px */
export function skyNow(b) { if (!b.climb) return { a: b.alt, b: null, k: 0, rise: 0 }; const k = climbK(b); return { a: b.climb.from, b: b.climb.to, k, rise: k * SKM.CLIMB.rise }; }

/* ---- the lab level: one screen of open sky with the drake in it (level.js appends it hidden as 'skylab'). painter + T from level.js. ---- */
export const LAB = { W: 40, H: 24, backCol: 14, backRow: 15 };
export function buildSkyLab({ painter }) {
  const L = painter(LAB.W, LAB.H);   // all air: the back is the only floor
  const x0 = LAB.backCol * 16, y = LAB.backRow * 16;
  return { W: LAB.W, H: LAB.H, grid: L.grid, ents: L.ents, START: { x: LAB.backCol + 4, y: LAB.backRow - 1 }, pools: [], falls: [], moversExtra: [], interiors: [],
    skyMount: { x0, y, len: SKM.BACK.len, phase: 1, lab: true }, duskStart: -1, duskLen: 1, noFallDeath: true,
    palette: { set: 'arena', sky: 'autumn', near: 'none', noFg: true, noNear: true, haze: 'rgba(200,90,40,0.10)', grass: '#3a2a26', grassL: '#5a3a30', grassD: '#24161a', dirt: '#24161a', dirtL: '#3a2a26', dirtD: '#160e12' } };
}
