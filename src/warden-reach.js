// src/warden-reach.js - WARDEN'S REACH, SEEN (claude/wardenult, Daniel 11-07 08:04 "should look like the Warden WIELDING the spear").
// For its six seconds the Warden is drawn gripping a HUGE ghostly spear in BOTH HANDS: the body is her bare set (no baked spear) in frames that put each hand on the shaft,
// and main.js draws the ghost spear through those two hands (drawReachShaft / drawReachFx). This file is the one table both read: chars.js bakes the arms from it, main.js
// reads the same hand points to lay the shaft, so the spear can never drift off the hands. No world here: tools/warden-reach.mjs checks it without a page.
//
// Units: every hand is a SHOULDER OFFSET in the baked frame (fx, fy = the lead hand off the lead shoulder, rx, ry = the rear hand), exactly what chars.js feeds arm / arm2.
// reachGeom turns them into px off her FEET (x forward-positive, y up-negative), the frame main.js draws in. T = where the point is, px forward of her centre.
export const SH = { X: 19, Y: 13, FEET_X: 16, FEET_Y: 22 };   /* the shoulder in the frame (BX + 8, BY + 7), and the anchor (KNIGHT_ANCHOR) */
const run = ['run1', 'run2', 'run3', 'run4', 'run5', 'run6'];
export const RPOSE = {
  /* READY: the spear levelled across her, point out, a hand at the grip and a hand a forearm up the shaft; the breath is the second frame */
  reachHold: [{ legs: 'wide', dx: -1, fx: 8, fy: 3, rx: 0, ry: 4, T: 88, plume: 1 }, { legs: 'wide', dx: -1, fx: 8, fy: 2, rx: 0, ry: 3, T: 88, plume: 2 }],
  /* RUN / AIR: carried level, point leading, both hands on it */
  reachRun: run.map((l, i) => ({ legs: l, dy: i === 1 || i === 4 ? -1 : 0, fx: 7, fy: 2, rx: -1, ry: 4, T: 86, plume: i % 3 })),
  reachJump: [{ legs: 'jump', fx: 7, fy: 1, rx: 0, ry: 3, T: 86, plume: 2 }, { legs: 'fall', fx: 7, fy: 2, rx: 0, ry: 4, T: 86, plume: 1 }],
  /* THE THRUST (X, the first cut): coiled back over the heel, DRIVEN with the whole of her behind it (the point at the full 90), the haul home */
  reachA: [{ legs: 'wide', dx: -2, dy: 1, wide: 8, fx: 0, fy: 3, rx: -5, ry: 4, T: 56, plume: 1 },
    { legs: 'runC', dx: 1, wide: 8, fx: 8, fy: 2, rx: 2, ry: 3, T: 78, plume: 2 },
    { legs: 'runC', dx: 3, wide: 8, fx: 11, fy: 2, rx: 5, ry: 3, T: 96, plume: 2 },
    { legs: 'wide', dx: 1, wide: 8, fx: 7, fy: 3, rx: 1, ry: 4, T: 86, plume: 0 }],
  /* THE SWEEP (the backhand): the shaft swung up from low behind her, through the line, and carried high and across */
  reachB: [{ legs: 'wide', dx: -2, dy: 1, wide: 8, fx: 2, fy: 8, rx: -5, ry: 6, T: 60, plume: 1 },
    { legs: 'runC', dx: 1, wide: 8, fx: 8, fy: 4, rx: 2, ry: 5, T: 80, plume: 2 },
    { legs: 'runC', dx: 3, wide: 8, fx: 10, fy: -2, rx: 4, ry: 0, T: 92, plume: 2 },
    { legs: 'wide', dx: 1, wide: 8, fx: 7, fy: -1, rx: 1, ry: 1, T: 84, plume: 0 }],
  /* THE LONG DRIVE (the third cut): down on the back leg, the point drawn right back, then the arms locked straight and the shaft gone out to its full length */
  reachC: [{ legs: 'crouch', dx: -4, dy: 2, wide: 10, sho: 1, fx: -1, fy: 4, rx: -7, ry: 5, T: 46, plume: 1 },
    { legs: 'runC', dx: 3, dy: 1, wide: 10, fx: 10, fy: 3, rx: 4, ry: 3, T: 90, plume: 2 },
    { legs: 'runC', dx: 5, dy: 1, wide: 10, fx: 13, fy: 3, rx: 7, ry: 3, T: 100, plume: 2 },
    { legs: 'wide', dx: 2, dy: 1, wide: 10, fx: 8, fy: 3, rx: 2, ry: 4, T: 88, plume: 0 }],
  /* THE THROW INSIDE IT: the giant spear heaved back over the shoulder in both hands (the pip stage shakes it), then flung level with both arms after it */
  reachWind: [{ s: 0.3, legs: 'wide', dx: -3, dy: 1, wide: 4, sho: 1, fx: 2, fy: -5, rx: -7, ry: -3, T: 72, plume: 1 }],
  reachThrow: [{ legs: 'runC', dx: 3, wide: 10, fx: 12, fy: 0, rx: 6, ry: 1, T: 98, plume: 2 }, { legs: 'wide', dx: 2, dy: 1, wide: 10, fx: 8, fy: 2, rx: 2, ry: 3, T: 90, plume: 0 }],
};
/* the shaft's two ends and the hands, px off her feet (x forward-positive): { rx, ry (rear hand), fx, fy (lead hand), bx, by (the butt), tx, ty (the point) } */
export function reachGeom(key, frame) {
  const p = RPOSE[key] && RPOSE[key][Math.max(0, Math.min(RPOSE[key].length - 1, frame | 0))]; if (!p) return null;
  const ox = SH.X - SH.FEET_X, oy = SH.Y - SH.FEET_Y;   /* the hands are given in the frame's own pixels: dy moves the body, not them */
  const rx = ox + p.rx, ry = oy + p.ry, fx = ox + p.fx, fy = oy + p.fy;
  /* the shaft passes through the MIDDLE of the two hands at the slope they make, held to p.s (default 0.04): the hit line is flat, so the visible spear is near level and the hands sit on it to within a pixel or two */
  const mx = (rx + fx) / 2, my = (ry + fy) / 2, lim = p.s || 0.04, raw = fx === rx ? 0 : (fy - ry) / (fx - rx), slope = Math.max(-lim, Math.min(lim, raw)), nrm = Math.hypot(1, slope), ux = 1 / nrm;
  const at = x => my + (x - mx) * slope;
  return { rx, ry, fx, fy, bx: rx - 15 * ux, by: at(rx - 15 * ux), tx: p.T, ty: at(p.T) };
}
/* which pose the body is in, from the key/frame the draw chose for the hero this frame (null = leave it: a hurt, a dodge, a climb is drawn as it always was) */
export function reachPoseFor(key, frame, o = {}) {
  const fr = Math.max(0, frame | 0);
  switch (key) {
    case 'atk': return fr >= 4 ? ['reachHold', 0] : ['reachA', fr];   /* beat 4 of a swing is the rest pose */
    case 'atkB': return fr >= 4 ? ['reachHold', 0] : ['reachB', fr];
    case 'atkC': return fr >= 4 ? ['reachHold', 0] : ['reachC', fr];
    case 'heavy': case 'windup': return ['reachC', [0, 2, 3][Math.min(fr, 2)]];
    case 'javWind': return ['reachWind', 0];
    case 'javThrow': return ['reachThrow', Math.min(fr, 1)];
    case 'follow': case 'deflect': case 'block': case 'blast': case 'cast': case 'idle': case 'fidget': case 'parry': case 'ripo': case 'land': case 'skid': case 'wPerch':
      return ['reachHold', o.breath ? 1 : 0];
    case 'run': return ['reachRun', fr % 6];
    case 'jump': case 'jump2': case 'takeoff': case 'apex': case 'air': return ['reachJump', 0];
    case 'fall': case 'fall2': return ['reachJump', 1];
    default: return null;
  }
}
