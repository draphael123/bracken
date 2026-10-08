// src/sunstroke.js — THE SUN, the desert's shared rule (THE SUNKEN CARAVAN, THE WELL TOWN, THE GLASS SEA's day, THE BANDIT KSAR). Pure, no DOM.
//
// Open sand is sunlight, and standing in it builds SUNSTROKE. SHADE resets it: awnings, a wagon's lee, a rock overhang, a palm, a wall, the
// moving shadow of a vulture. Every screen asks "where is the next shade?" Named SUNSTROKE, never heat: the pyromancer owns P.heat.
// The player's field is P.sun = { v, acc }.
// THE SUN v2 (claude/ksar2, Daniel 10-08: "game-wide, one shared module; exposure DRAINS hp steadily - no stun, no flinch - stronger than today,
// and much clearer"): the meter no longer ends in ticks of damage that land like blows (a flinch, a mercy window, a cancelled swing). Out in
// the sun the hero HEATS from the first moment (src/sun-hands.js draws it: a red glow, sweat, the sizzle, the HUD sun filling), and after
// SUN.drainAt of the meter his health DRAINS - a share of his max health a second, growing with the meter - straight off the bar: no blow,
// no knock, no hurt pose, no invulnerability after it. Shade cools it in SUN.cool s and stops the drain at once.
//
//   sunStep(s, dt, shaded)      -> { swim, drain, rate, stage, warm }   advance the meter. swim 0..1 drives the haze; drain is the share of max
//                                  health to take THIS frame (rate * dt); rate the share a second; stage 0 (no drain) or 1..3 (the drain's third)
//   drainRate(v)                -> the share of max health a second at meter v (0 under SUN.drainAt)
//   roofShade(tileAt, x, headY) -> true when rock hangs over the head within SUN.roof rows (an overhang, a cave, a bridge)
//   shadeZones(L)               -> the level's static shade as [x0, x1, y0, y1] px boxes (props via SHADE_OF, L.shade rects)
//   inShade(zones, x, y)        -> is (x, y) inside one
//   vultureShade(v, groundY)    -> the moving shade under a vulture as a box
//   sunStretches(route, isShaded) -> the walks in the sun along a route, in seconds at RUN: the level check
//   walkCost(s)                 -> the share of max health a walk of s seconds in the sun from cool costs (the level check's toll)
import { SHADE_OF } from './redraw/desert.js';

export const SUN = {
  fill: 5,        // seconds of open sun from cool to full (1.0). (v1: 6 s and then ticks of 3/5/8)
  swimAt: 0.2,    // the view starts to swim here (1 s in): the hero is already glowing and sweating from the first step out
  drainAt: 0.4,   // THE DRAIN starts here (2 s in): a short dash shade to shade is free, a fight in the sun is not
  drain: [0.012, 0.045],   // the share of max health a second: 1.2% as it starts, rising to 4.5% at full (ten seconds out: ~30% of the bar)
  cool: 1.2,      // seconds of shade from full to cool: SHADE RESETS IT
  roof: 5,        // rock this many rows over the head is shade
  maxWalk: 4,     // the level rule: no walk in the sun longer than this (s at RUN) between two shades (v1: 5 s). More shade: a shade route
                  // always exists, and a walk the rule allows costs at most walkCost(maxWalk) (~5% of the bar)
  RUN: 92,
  hurtEvery: 1,   // (v1's tick period: the HUD's sizzle beat and the drain's number are said this often)
};
export const drainRate = v => (v < SUN.drainAt ? 0 : SUN.drain[0] + (SUN.drain[1] - SUN.drain[0]) * Math.min(1, (v - SUN.drainAt) / (1 - SUN.drainAt)));
export function sunStep(s, dt, shaded) {
  if (shaded) s.v = Math.max(0, s.v - dt / SUN.cool);
  else s.v = Math.min(1, s.v + dt / SUN.fill);
  const rate = shaded ? 0 : drainRate(s.v);   /* in the shade the drain stops at once, whatever the meter still says */
  const swim = s.v <= SUN.swimAt ? 0 : (s.v - SUN.swimAt) / (1 - SUN.swimAt);
  const stage = rate <= 0 ? 0 : s.v >= 0.999 ? 3 : s.v >= SUN.drainAt + (1 - SUN.drainAt) / 2 ? 2 : 1;
  return { swim, drain: rate * dt, rate, stage, warm: s.v };
}
export function walkCost(secs, dt = 1 / 60) { const s = { v: 0 }; let c = 0; for (let t = 0; t < secs; t += dt) c += sunStep(s, dt, false).drain; return c; }
export function roofShade(tileAt, x, headY, rockish) {
  const tx = Math.floor(x / 16), r0 = Math.floor(headY / 16) - 1;
  for (let ty = r0; ty >= r0 - SUN.roof + 1; ty--) if (rockish(tileAt(tx, ty))) return true;
  return false;
}
export function shadeZones(L) {
  const Z = [];
  for (const e of (L.ents || [])) { const S = e.t === 'wagon' ? SHADE_OF.wagon : e.t === 'awning' ? SHADE_OF.awning : null; if (!S) continue;
    /* a prop's ent stands with its bottom-centre on (e.x, e.y+1) in tiles; its canvas is (64 | 52) wide */
    const w = e.t === 'wagon' ? 64 : 52, left = e.x * 16 + 8 - w / 2, ground = (e.y + 1) * 16;
    Z.push([left + S.x0, left + S.x1, ground - S.h, ground + 1]); }
  for (const r of (L.shade || [])) Z.push(r);
  return Z;
}
export const inShade = (zones, x, y) => zones.some(([x0, x1, y0, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
export const vultureShade = (v, groundY) => [v.x - 14, v.x + 14, groundY - 30, groundY + 1];
/* THE LEVEL CHECK: walk a route (a list of foot positions [x, y] in px, left to right, e.g. from the reach fill's footing
   along the main road), and time each stretch between shades at RUN. Returns [{ x0, x1, s }], longest first. */
export function sunStretches(route, isShaded) {
  const out = []; let start = null;
  for (let i = 0; i < route.length; i++) { const [x, y] = route[i], sh = isShaded(x, y);
    if (!sh && start === null) start = x;
    if ((sh || i === route.length - 1) && start !== null) { out.push({ x0: start, x1: x, s: (x - start) / SUN.RUN }); start = null; } }
  return out.sort((a, b) => b.s - a.s);
}
