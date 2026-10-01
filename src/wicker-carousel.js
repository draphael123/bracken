// src/wicker-carousel.js - THE WICKER QUEEN'S CAROUSEL (claude/fairboss; Daniel 2026-09-30: "I'd like the boss to be in a moving carousel and you have to
// jump on horses to avoid some attacks" - the platform SPINS and the painted horses BOB on their poles as moving platforms).
//
// THE RIDE: the whole maypole green is one great carousel. Its floor ring TURNS: everything standing on the boards (a hero, and the Queen herself - but not
// while she walks: she strides against it at her own pace) is carried
// the ride's way (RING.dir, toward the far wall) at the ride's speed; a hero walks against it (he runs 92, the fastest ride is 42). The ride starts when she
// wakes and stops when she falls. Each of her phases QUICKENS it (RING.speed), and the quickening is TOLD: the bulbs flash and the organ calls for
// RING.warn s before the new speed comes in (and then it eases up to it).
// THE HORSES: RING.horses painted horses go round the ring on brass poles. The ones on the FRONT run (the side toward you) are platforms: they ride the
// ride's way at its speed and BOB up and down on their poles between RING.lo and RING.hi px over the boards (always inside a jump: a hero's jump rises 51),
// each on its own beat; stand on one and it carries you, up, down and along. At the end of the front run a horse goes ROUND THE BACK (drawn small and dim
// behind the centre column, not a platform) and comes round again at the near end; a rider still on it at the corner is set down on the boards.
// The bob TIMING changes with her phase (RING.bob: faster; RING.beat: phase one the neighbours alternate, two a rolling quarter-step, three in thirds).
// THE READ (src/wicker-queen.js): what sweeps the FLOOR (her low lash, the floor burning) is answered by getting UP on a horse; what flies HIGH (her high
// lash, her thrown sickle) catches a rider and a standing hero alike, and is answered by getting DOWN on the boards and ducking.
// THE OPENING (src/wicker-queen.js, the bonfire kept): her firebox sits on the centre column's engine. Look at her while she stands on its embers and the
// wicker catches. The ride is the other half of it: look at her while she stands UPSTREAM of the fire and the ride brings her onto it for you; downstream,
// you turn your back and she walks to you, against the ride, across it.
// PURE: no DOM. main.js holds the hands (carries the heroes, moves the horse movers, draws); tools/wicker-queen.mjs proves every line above.
export const RING = {
  dir: 1,                          // the ride's way: toward the far wall (the Queen's end: she starts downstream of her fire)
  speed: [16, 24, 34],             // px/s by her phase (a hero runs 92; she walks 58, alight 88: against the ride she still comes to you)
  ease: 16,                        // px/s per second: the ride eases up to a new speed, never jumps
  warn: 1.5,                       // THE QUICKENING is told this long before it comes in
  horses: 10, w: 22, h: 6,         // the horses on the ring (five on the front run), and a saddle's platform
  pad: 14,                         // a horse's middle comes no nearer the walls than this
  lo: 16, hi: 40,                  // the saddle's height over the boards, bottom and top of its bob (a hero stands 14: he walks under a low one)
  bob: [3.6, 2.8, 2.2],            // seconds a bob, by phase
  beat: [i => (i % 2) * Math.PI, i => i * Math.PI / 2, i => i * Math.PI * 2 / 3],   /* (ten horses: the alternation and the quarter-steps come round even; the thirds leave one pair in step at the join) */   // each horse's place in the bob, by phase
  beatEase: 1.2,                   // radians per second a horse moves toward its new beat when the phase changes (no horse jumps)
};
/* a fresh ride over the arena A {x0, x1, floor}: standing still until she wakes */
export function newRing(A) {
  const x0 = A.x0 + RING.pad, x1 = A.x1 - RING.pad;
  return { x0, x1, len: x1 - x0, floor: A.floor, u: 0, t: 0, ang: 0, speed: 0, want: 0, phase: 1, on: false, quickT: 0, off: Array.from({ length: RING.horses }, (_, i) => RING.beat[0](i)) };
}
/* the speed the ride wants in a phase */
export const ringSpeed = ph => RING.speed[Math.max(0, Math.min(2, (ph || 1) - 1))];
/* SET THE RIDE for her state: on (she is awake and standing) and her phase. A new phase is TOLD first: quickT counts RING.warn down, then the new speed.
   Returns 'quicken' on the frame the warning starts, 'start' when the ride starts, 'stop' when it stops, else null */
export function ringFor(r, on, phase) {
  let ev = null;
  if (on && !r.on) { r.on = true; r.phase = phase || 1; r.want = ringSpeed(r.phase); ev = 'start'; }
  else if (!on && r.on) { r.on = false; r.want = 0; r.quickT = 0; ev = 'stop'; }
  else if (on && phase && phase !== r.phase) { r.phase = phase; r.quickT = RING.warn; ev = 'quicken'; }
  return ev;
}
/* one frame of the ride: the quickening's warning runs out into the new speed, the speed eases toward what is wanted, the ring and the bob turn */
export function ringStep(r, dt) {
  if (r.quickT > 0) { r.quickT = Math.max(0, r.quickT - dt); if (r.quickT === 0) r.want = ringSpeed(r.phase); }
  const d = r.want - r.speed; r.speed += Math.sign(d) * Math.min(Math.abs(d), RING.ease * dt);
  r.u = (r.u + r.speed * dt) % (2 * r.len); r.t += dt;
  if (r.speed > 0) r.ang += dt * 2 * Math.PI / RING.bob[Math.max(0, Math.min(2, r.phase - 1))];
  const beat = RING.beat[Math.max(0, Math.min(2, r.phase - 1))];
  for (let i = 0; i < r.off.length; i++) { const want = beat(i); let d2 = ((want - r.off[i]) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI; r.off[i] += Math.sign(d2) * Math.min(Math.abs(d2), RING.beatEase * dt); }
}
/* the carry: px/s along x for anything standing on the boards */
export const ringCarry = r => (r ? r.speed * RING.dir : 0);
/* WHERE HORSE i IS: its middle x, its saddle's top y, whether it is on the front run (a platform) and how far round the back it is (0 front .. 1 middle of the back) */
export function horseAt(r, i) {
  const L2 = 2 * r.len, s = ((r.u + i * L2 / RING.horses) % L2 + L2) % L2, front = s < r.len;
  const x = RING.dir > 0 ? (front ? r.x0 + s : r.x1 - (s - r.len)) : (front ? r.x1 - s : r.x0 + (s - r.len));
  const k = 0.5 - 0.5 * Math.cos(r.ang + r.off[i]), lift = RING.lo + (RING.hi - RING.lo) * k;
  return { x, y: r.floor - lift, lift, front, back: front ? 0 : Math.sin(Math.PI * (s - r.len) / r.len), s };
}
/* is a body standing on the ring's boards (its feet on the floor row, inside the ring)? */
export const onBoards = (r, x, y) => !!r && Math.abs(y - r.floor) < 3 && x >= r.x0 - RING.pad && x <= r.x1 + RING.pad;
/* THE BAND ORGAN'S RATE for the music (1 at the first ride, faster as it quickens): the hook the boss track reads (src/main.js calls music.tempo with it when there is one) */
export const organRate = r => (r && r.speed > 0 ? r.speed / RING.speed[0] : 1);
