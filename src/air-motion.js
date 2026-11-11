// src/air-motion.js - THE BODY IN MOTION (claude/airmotion, Daniel 11-09: "the player is kind of not in motion there", then
// "yes, all four": the hit, the skid, the slide and the crouch, each a pose held still while the move played out).
// From the take-off to the landing every hero held one air frame for most of a second, a statue sliding along the arc.
// Now the air frame is DRAWN moving with the arc:
//   - a LEAN into the way he is travelling, eased so it swings over when he turns in the air;
//   - a STRETCH with the climb and with the drop, and a little squash at the top where he hangs;
//   - both scaled by the hero's weight (src/jump-feel.js): the paladin barely leans, the Pyromancer flies.
// The same for four more held poses (MOVES below): THROWN BACK by a hit, LEANING BACK into a skid, STRETCHED LONG on a slide,
// SQUASHED going down into a crouch and stretched coming up out of it.
// ART ONLY. Nothing here is read by physics, boxes or timers: it returns how the frame is drawn, and keeps its own art values
// on the hero (P.airLeanA, P.hurtArtMax, P.skidArtMax, P.crArtWas, P.crInT, P.crOutT). Reduce motion turns it all off.
export const AIR = {
  lean: 0.17,              /* radians of lean at full run speed, rising (about 10 degrees; the knight, heavier, about 8) */
  leanFall: 0.7,           /* the lean on the way down, as a share of the rising lean (the legs come under him to land) */
  leanBack: 0.35,          /* turned against his drift (braking in the air): only this much of it, or he leans over backwards */
  runV: 95,                /* the horizontal speed that counts as full lean */
  leanStep: Math.PI / 90,  /* the lean turns in 2-degree steps: a sprite turned smoothly shimmers pixel by pixel */
  ease: 12,                /* how fast the lean follows the target (per second) */
  stretch: 0.08,           /* the tallest stretch, at full climb or a hard drop */
  climbV: 310,             /* the take-off speed: full stretch */
  dropV: 420,              /* the fall speed that counts as a hard drop */
  hangV: 70,               /* under this vertical speed he is at the top of the arc */
  hang: 0.04,              /* the squash at the very top */
  sStep: 1 / 32,           /* the stretch moves a pixel at a time on a ~30 px hero */
  pivot: 12,               /* he turns about his middle, not his feet (px above the feet) */
};
/* the air frames this tilts; any other key (a swing, a plunge, a cast) is drawn as baked */
export const AIR_KEYS = new Set(['jump', 'apex', 'fall', 'takeoff']);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const q = (v, s) => Math.round(v / s) * s;
/** the lean (radians) the hero wants this frame: into his travel, less on the drop, less for a heavy hero (w > 1) */
export function leanTarget(vx, vy, w = 1, face = 0) {
  let k = clamp(vx / AIR.runV, -1, 1) * AIR.lean / Math.max(0.6, w);
  if (face && Math.sign(vx) === -Math.sign(face)) k *= AIR.leanBack;
  return vy > 0 ? k * AIR.leanFall : k;
}
/** the vertical stretch (0 = none; > 0 tall; < 0 squashed) for this vertical speed, before the hero's weight */
export function stretchFor(vy) {
  if (Math.abs(vy) < AIR.hangV) return -AIR.hang * (1 - Math.abs(vy) / AIR.hangV);
  return vy < 0 ? AIR.stretch * clamp((-vy - AIR.hangV) / (AIR.climbV - AIR.hangV), 0, 1)
                : AIR.stretch * clamp((vy - AIR.hangV) / (AIR.dropV - AIR.hangV), 0, 1);
}
/* THE OTHER HELD POSES. Each is a fraction k (1 at the start of the move, 0 at its end) times a size. */
export const MOVES = {
  hurt:  { lean: 0.2 },                        /* THROWN BACK: the top of him goes with the knock, righting as the hurt runs out */
  skid:  { lean: 0.12, squash: 0.06 },         /* THE SKID: leaning back against the slide, sat down into it */
  slide: { stretch: 0.08, fullV: 140 },        /* THE SLIDE: drawn long and low along the ground at speed */
  crouch: { down: 0.1, up: 0.07, t: 0.09 },    /* THE CROUCH: squashed for a beat going down, stretched for a beat coming up */
};
const STAND = new Set(['idle', 'run', 'walk']);   /* what coming up out of a crouch may stretch: never a swing */
const tracked = (P, val, name) => { const prev = P[name + 'Prev'] || 0; if (val > prev + 0.005) P[name + 'Max'] = val; P[name + 'Prev'] = val; return val > 0 ? clamp(val / (P[name + 'Max'] || val), 0, 1) : 0; };
const pack = (rot, sx, sy, c) => ({ rot, sx, sy, ox: -c * Math.sin(rot), oy: -c * (1 - Math.cos(rot)) });
const facing = (P, w) => clamp(1 / Math.max(0.6, w), 0.6, 1.4);   /* a heavy hero is moved less */
/** the four held poses: how this frame is drawn, or null */
export function moveMotion(P, key, dt, f, opts = {}) {
  const w = facing(P, f.w || 1), c = AIR.pivot * (opts.scale || 1), st = f.stretch || 1;
  const hk = tracked(P, P.hurt > 0 ? P.hurt : 0, 'hurtArt'), sk = tracked(P, P.skidT > 0 ? P.skidT : 0, 'skidArt');
  const down = !!opts.crouching || key === 'crouch', was = !!P.crArtWas; P.crArtWas = down; P.crInT = Math.max(0, (P.crInT || 0) - dt); P.crOutT = Math.max(0, (P.crOutT || 0) - dt);
  if (down && !was) P.crInT = MOVES.crouch.t;
  if (was && !down && P.ground) P.crOutT = MOVES.crouch.t;
  if (opts.reduce || P.swim || P.climb || P.flip || P.dead) return null;
  if (key === 'hurt' && !(P.flatT > 0) && hk > 0) {
    const dir = Math.abs(P.vx || 0) > 10 ? Math.sign(P.vx) : -(P.face || 1);
    return pack(q(dir * MOVES.hurt.lean * hk * w, AIR.leanStep), 1, 1, P.ground ? 0 : c);   /* about his feet on the ground, his middle in the air */
  }
  if (key === 'skid' && sk > 0) {
    const dir = Math.abs(P.vx || 0) > 5 ? -Math.sign(P.vx) : (P.face || 1), sq = opts.squashing ? 0 : q(MOVES.skid.squash * sk * st, AIR.sStep);
    return pack(q(dir * MOVES.skid.lean * sk * w, AIR.leanStep), 1 + sq * 0.6, 1 - sq, 0);
  }
  if (key === 'slide' && P.ground && !opts.squashing) {
    const s = q(MOVES.slide.stretch * clamp(Math.abs(P.vx || 0) / MOVES.slide.fullV, 0, 1) * st, AIR.sStep);
    return s ? pack(0, 1 + s, 1 - s * 0.6, 0) : null;
  }
  if (opts.squashing) return null;
  if (down && P.crInT > 0) { const s = q(MOVES.crouch.down * (P.crInT / MOVES.crouch.t) * st, AIR.sStep); return s ? pack(0, 1 + s * 0.6, 1 - s, 0) : null; }
  if (STAND.has(key) && P.crOutT > 0 && P.ground) { const s = q(MOVES.crouch.up * (P.crOutT / MOVES.crouch.t) * st, AIR.sStep); return s ? pack(0, 1 - s * 0.6, 1 + s, 0) : null; }
  return null;
}
/**
 * How this frame of the hero is drawn in the air, or null when it is drawn as baked.
 * f: the hero's jump-feel row ({ w, stretch }); squashing: a take-off / landing squash is playing (sqSx / sqSy: its scale this frame).
 * Returns { rot, sx, sy, ox, oy }: rot about his middle, so (ox, oy) is the shift that keeps the middle where it was.
 */
export function airMotion(P, key, dt, f, opts = {}) {
  const mv = moveMotion(P, key, dt, f, opts);
  const on = !opts.reduce && !P.ground && !P.swim && !P.climb && !P.flip && !P.dead && AIR_KEYS.has(key);
  const target = on ? leanTarget(P.vx || 0, P.vy || 0, f.w || 1, P.face || 0) : 0;
  P.airLeanA = (P.airLeanA || 0) + (target - (P.airLeanA || 0)) * Math.min(1, AIR.ease * dt);
  if (!on) { if (P.ground) P.airLeanA = 0; return mv; }
  const rot = q(P.airLeanA, AIR.leanStep);
  const s = q(stretchFor(P.vy || 0) * (f.stretch || 1), AIR.sStep), hy = opts.sqSy || 1, hx = opts.sqSx || 1;
  /* the take-off stretch (jump-feel) is fading over the same beats: whichever is the bigger stretch is drawn, never one then the other */
  const mine = Math.abs(s) > Math.abs(hy - 1), sy = mine ? (1 + s) / hy : 1, sx = mine ? (1 - s * 0.6) / hx : 1;   /* taller is thinner: the body keeps its bulk */
  const c = AIR.pivot * (opts.scale || 1);
  return { rot, sx, sy, ox: -c * Math.sin(rot), oy: -c * (1 - Math.cos(rot)) };
}
