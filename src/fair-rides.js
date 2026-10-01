// src/fair-rides.js - THE HARVEST FAIR's two new rides (claude/fairfix3; Daniel 2026-10-01: "wants more rides" - real platforming, of the fair's own age). Pure, no DOM:
// tools/harvest-fair.mjs proves it headless; src/main.js holds the hands (the movers), src/redraw/fair_newrides.js draws them.
//
//   THE SWINGBOATS     a Victorian fairground's boats on an A-frame, over a spiked pit (stall row, 216-228). The boat is a swing mover (main.js swings it on the
//                      game's clock; a jump off it keeps the pace it gave you). Its seat runs a fixed arc (BOAT.amp radians each way): at the TOP of its swing it is
//                      high enough that the high stall past the pit is a hop up; at the bottom it is a pit's depth under it. So you LET GO AT THE TOP.
//   THE CHAIR-O-PLANE  the Edwardian swing carousel: chairs on chains flung out from a turning crown on a mast, over a spiked pit (the harvest, 446-464). Seen from the
//                      road the ring is an ellipse: the NEAR chairs (front) are platforms and come TOWARD the road you came by (right to left), the far ones go round
//                      behind the mast, up under the crown, where nobody can stand. You cross against it, chair to chair. A rider still on a chair as it swings round
//                      behind is let go (main.js).
export const BOAT = { amp: 0.9 };   /* the swing's arc, radians each way (main.js's swing mover: sin(t) * 0.9) */
/* where a swingboat's seat is at time t: its middle x, its top y, and how far up its arc it is (0 at the bottom, 1 at the top) */
export function boatAt(b, t) {
  const th = Math.sin(t * 2 * Math.PI / b.period + (b.phase || 0)) * BOAT.amp;
  return { x: b.px + Math.sin(th) * b.arm, y: b.py + Math.cos(th) * b.arm, up: Math.abs(th) / BOAT.amp, th };
}
export const CHAIRO = { w: 36, h: 6, lift: 24, front: 0.15 };   /* a chair's seat; how far up the far side of the ring rides (under the crown); the share of the ring's front that bears a rider */
/* where chair i of a chair-o-plane c { cx, cy, R, period, n, phase } is at time t: its middle x, its seat's top y, whether it is on the near side (a platform), and its depth
   (0 nearest, 1 farthest). The angle grows with time; the near side is sin > 0, where x = cx + R cos(a) falls: the near chairs come right to left */
export function chairAt(c, i, t) {
  const a = (c.phase || 0) + t * 2 * Math.PI / c.period + i * 2 * Math.PI / c.n, s = Math.sin(a), depth = (1 - s) / 2;
  return { x: c.cx + c.R * Math.cos(a), y: c.cy - depth * CHAIRO.lift, front: s > CHAIRO.front, depth, a };
}
/* the speed a near chair crosses the middle at (px/s): the ride must be hopped against, not out-walked */
export const chairSpeed = c => 2 * Math.PI * c.R / c.period;
