// harpy-motion.js - HARPY MOTION (claude/harpyanim, 2026-11-05; Daniel 11-05: "their animations before seemed very stiff and janky").
// The profile harpies (gust, gale, carrier, crag, moor, shrieker foes: src/redraw/gale_harpy_art.js) used to have SIX frames and two of them were the flap (wings up / wings down, a hard flip). This module is pure (no canvas, no DOM:
// node-checkable) and owns THE TIMING AND FEEL, never the fight:
//   - the option tables for the frames the art file bakes (an 8-frame FLAP cycle with a body lift on the down-beat and hair / skirt / tail LAGGING the body; an 8-frame small-beat CARRY cycle for the carrier; the transition frames);
//   - which frame a harpy wears NOW (frameOf): tell = a GATHER beat, then the told pose, which quivers (never shorter, never quieter); the strike = a one-frame sweep, then the strike pose; after it a FLARE and a GLIDE
//     before the flap resumes; a dazed flutter for the grounded; a hurt frame for a blow;
//   - poseFx: the facing TURN (two squashed frames), the dive's stretch and a tumble while she falls (about her body's centre, easing to upright as she lands).
// No timer, hitbox, damage or decision of the AI is read-and-written here: only e.mode / e.gMode / e.face / e.flash / e.vy are READ (and a private e.__hm is kept for the animation's own state).
export const NFLAP = 8, FLAP0 = 8, CARRYFLAP0 = 16;
export const F = { GATHER: 24, CLAP_IN: 25, GLIDE: 26, FLARE: 27, DIVE_IN: 28, DAZE_A: 29, DAZE_B: 30, TELL_B: 31 };
export const NFRAMES = 32;
const ease = t => t * t * (3 - 2 * t);
/* +1 = wings up .. -1 = down; the down-beat takes 40% of the stroke, the up-stroke 60% (a bird pulls down hard and recovers slowly) */
export const waveOf = u => { u = ((u % 1) + 1) % 1; return u < 0.4 ? 1 - 2 * ease(u / 0.4) : -1 + 2 * ease((u - 0.4) / 0.6); };
const sOf = u => (1 - waveOf(u)) / 2;                               /* 0 = wings up, 1 = wings down */
const lagSin = u => Math.sin(2 * Math.PI * (u - 0.22));             /* the body's vertical velocity, a little late: + while the body rises (hair and hem trail DOWN), - while it falls */
/* THE FLAP CYCLE, NFLAP frames: option objects for gale_harpy_art's bird(). base = the hover frames' shared options (tilt, cy, tail, plume ...) */
export function flapOpts(i, o = {}) {
  const u = i / NFLAP, s = sOf(u), dS = sOf(u + 1 / NFLAP) - sOf(u - 1 / NFLAP), r = lagSin(u), lift = Math.pow(Math.sin(Math.PI * ((u - 0.1 + 1) % 1)), 2);
  const a0 = -2.35 - 1.38 * s;                                                         /* up-and-back (-2.35) ... straight back (-pi) ... down-and-back (2.55 == -3.73) */
  return { tilt: 0.3 - 0.1 * dS, cy: 14.8 - 1.8 * lift, wing: [a0, 8 - s, a0 + 0.05 + 0.5 * dS, 1.05 - 0.15 * s, 7, 12 - s], plume: 0.2 - 0.35 * r, tail: 2.1 - 0.15 * r, drag: r, ...o };
}
/* THE CARRIER'S CARRY CYCLE: steady, small beats; the body (and so the saddle, and the rider's feet) never moves - only the wings, the hair, the cloth and the tail */
export function carryOpts(i, o = {}) {
  const u = i / NFLAP, s = sOf(u), dS = sOf(u + 1 / NFLAP) - sOf(u - 1 / NFLAP), r = lagSin(u);
  const a0 = -2.15 - 0.7 * s;
  return { tilt: 1.25, cy: 15, wing: [a0, 8, a0 + 0.1 + 0.4 * dS, 0.8, 8, 15], plume: -0.2 - 0.2 * r, tail: 3.0 + 0.1 * r, carry: true, drag: 0.5 * r, ...o };
}
/* the transition frames (indices F.*), as bird() options */
export const TRANSITIONS = {
  GATHER: { tilt: -0.05, cy: 15, wing: [1.3, 6, 1.5, 0.7, 6, 10], legIn: true, tail: 1.9, plume: 0.3, chest: false },                                  /* the wind-up: wings drawn down and in, a crouch (before the wings fling wide) */
  CLAP_IN: { tilt: 0.0, cy: 14, wing: [-1.4, 8, -1.2, 1.0, 7, 14], legIn: true, tail: 1.95, plume: -0.1, beak: true },                               /* halfway between the flung-up tell and the clap */
  GLIDE: { tilt: 0.2, cy: 14, wing: [-3.0, 9, -3.0, 0.7, 8, 14], tail: 2.15, plume: 0.05 },                                                         /* wings level, spread: coming out of a dive */
  FLARE: { tilt: -0.3, cy: 14, wing: [-1.8, 8, -1.6, 1.2, 7, 13], tail: 1.7, plume: -0.35, beak: true },                                           /* wings flung up and cupped: braking */
  DIVE_IN: { tilt: 0.6, cy: 14.5, wing: [-2.6, 8, -2.5, 0.9, 7, 12], tail: 2.6, plume: 0.1 },                                                       /* tipping over into the dive */
  DAZE_A: { tilt: 1.3, cy: 15, wing: [-2.5, 5, -2.1, 1.6, 6, 8], dizzy: true, legIn: true, tail: 3.0, tumble: true },
  DAZE_B: { tilt: 1.18, cy: 15, wing: [-2.9, 5, -2.55, 1.6, 6, 8], dizzy: true, legIn: true, tail: 2.95, tumble: true },
  TELL_B: { tilt: 0.06, cy: 14, wing: [-2.78, 9, -2.9, 0.95, 8, 15], chest: true, beak: true, eye: 'red', plume: -0.05 },                           /* the tell's quiver partner: wings a hair lower and more swept */
};
/* the foes this animates: every harpy that wears the profile sheets (gust, gale, carrier / crag / moor harpy, shrieker foe) */
const KINDS = new Set(['harpy', 'shrieker', 'galeharpy', 'gustharpy']);
export const animated = e => KINDS.has(e.t);
/* ---------- which frame ---------- */
const FLAP_HZ = 2.6, CARRY_HZ = 2.0;
const seedOf = e => (((e.hx || e.x || 0) * 0.37) % 1 + 1) % 1;
export const flapFrame = (e, time) => FLAP0 + Math.floor((((time * FLAP_HZ + seedOf(e)) % 1) + 1) % 1 * NFLAP) % NFLAP;
export const carryFrame = (e, time) => CARRYFLAP0 + Math.floor((((time * CARRY_HZ + seedOf(e)) % 1) + 1) % 1 * NFLAP) % NFLAP;
/* a stunned bird: the body still (frame 3), a wing twitch and a head nod in bursts */
export const dazeFrame = (e, time) => { const k = Math.floor(time * 4 + seedOf(e) * 8) % 8; return k === 2 ? F.DAZE_A : k === 5 ? F.DAZE_B : k === 6 ? F.DAZE_A : 3; };
/* the animation's own state on the entity: the mode she is in, since when, and the one before */
function track(e, time, mode) { const h = e.__hm || (e.__hm = { mode, t0: time, prev: mode }); if (h.mode !== mode) { h.prev = h.mode; h.mode = mode; h.t0 = time; } return h; }
/* which flavour of mode: the harpy family spells its modes four ways (galeTell/gust, gustTell/gust, aim/dive, ...) */
const TELLS = new Set(['galeTell', 'gustTell', 'aim']), STRIKES = new Set(['gust', 'dive']);
export function frameOf(e, time, opt = {}) {
  const mode = e.mode, h = track(e, time, mode), age = time - h.t0, prev = h.prev;
  if (e.flash > 0.02 && mode !== 'perch') return 5;                                               /* a blow: the hurt frame (the white flash is the game's own) */
  if (mode === 'perch' && opt.carrier) return 6;
  if (mode === 'carry' && opt.carrier) return carryFrame(e, time);
  if (TELLS.has(mode)) return age < 0.14 ? F.GATHER : Math.floor(time * 14) % 2 ? 4 : F.TELL_B;   /* the gather, then the told pose, held and quivering */
  if (mode === 'gust') return age < 0.07 ? F.CLAP_IN : 2;                                       /* the strike: one sweep frame, then the clap */
  if (mode === 'dive') return age < 0.09 ? F.DIVE_IN : 2;
  if (mode === 'downed') return age < 0.25 ? 3 : dazeFrame(e, time);
  if (STRIKES.has(prev) && age < 0.45) return age < 0.22 ? F.FLARE : F.GLIDE;                   /* off a strike: flare to brake, glide out ... */
  if (prev === 'downed' && age < 0.3) return age < 0.15 ? F.GLIDE : flapFrame(e, time);       /* ... or up off the ground: wings opening */
  return flapFrame(e, time);
}
/* ---------- the pose effects (draw-time: facing turn, dive stretch, the tumble) ---------- */
const wrapPi = a => { a = ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a; };
export function poseFx(o, e, time) {
  const h = e.__hm || (e.__hm = { mode: e.mode, t0: time, prev: e.mode });
  /* THE TURN: two frames (the old side squeezed to 45%, then the new at 75%); a flip inside 0.35 s of the last is instant */
  if (h.face === undefined) { h.face = e.face; h.faceAt = -9; h.turnT = -9; h.facePrev = e.face; }
  if (e.face !== h.face) { const quick = time - h.faceAt < 0.35; h.faceAt = time; h.turnT = quick ? -9 : time; h.facePrev = h.face; h.face = e.face; }
  const k = (time - h.turnT) / 0.1;
  if (k >= 0 && k < 1) { if (k < 0.5) { o.face = h.facePrev; o.sx *= 0.45; } else o.sx *= 0.75; }
  if (e.mode === 'dive') o.sx *= 1.05;                                                          /* a hair of stretch along the dive */
  /* THE TUMBLE: while she is knocked out of the air and still falling she spins about her middle; as she lands it eases out to upright by the nearest whole turn */
  const falling = e.gMode === 'downed' || ((e.t === 'harpy' || e.t === 'shrieker') && e.mode === 'downed' && Math.abs(e.vy || 0) > 8);
  if (falling) { if (!h.fall) { h.fall = true; h.fallT0 = time; h.spin = 0; } h.spin = (time - h.fallT0) * 7.5; h.rotNow = h.spin; h.landT = undefined; }
  else if (h.fall) { if (h.landT === undefined) { h.landT = time; h.landRot = h.spin; h.landTo = Math.round(h.spin / (2 * Math.PI)) * 2 * Math.PI; } const q = Math.min(1, (time - h.landT) / 0.22); h.rotNow = h.landRot + (h.landTo - h.landRot) * ease(q); if (q >= 1) { h.fall = false; h.rotNow = 0; } }
  if (h.fall) { const th = h.rotNow * -(e.face || 1); o.rot = (o.rot || 0) + th; o.dx += -14 * Math.sin(th); o.dy += -14 + 14 * Math.cos(th); }   /* (about her middle, 14 px above the feet) */
  return o;
}
