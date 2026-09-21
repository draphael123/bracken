// src/sunstroke.js — THE SUN, the Sunken Caravan's rule (not wired in: the level batch does that). Pure, no DOM.
//
// Open sand is sunlight, and standing in it builds SUNSTROKE: first the view swims, then health goes. SHADE resets it:
// awnings, a wagon's lee, a rock overhang, the moving shadow of a vulture. Every screen asks "where is the next shade?"
// Named SUNSTROKE, never heat: the pyromancer already owns P.heat. The player's field is P.sun = { v, tick }.
//
//   sunStep(s, dt, shaded)      -> { swim, hurt }   advance the meter; swim 0..1 drives the haze, hurt is damage to deal now
//   roofShade(tileAt, x, headY) -> true when rock hangs over the head within SUN.roof rows (an overhang, a cave, a bridge)
//   shadeZones(L)               -> the level's static shade as [x0, x1, y0, y1] px boxes (props via SHADE_OF, L.shade rects)
//   inShade(zones, x, y)        -> is (x, y) inside one
//   vultureShade(v, groundY)    -> the moving shade under a vulture as a box
//   sunStretches(L, zones, tileAt, route) -> the walks in the sun along a route, in seconds at RUN: the level check
import { SHADE_OF } from './redraw/desert.js';

export const SUN = {
  fill: 9,        // seconds of open sun from cool to the swim's peak (1.0)
  swimAt: 0.55,   // the view starts to swim here: the WARNING, a good few seconds before anything hurts
  cool: 1.2,      // seconds of shade from full to cool: SHADE RESETS IT (at 2.2 s a run of long walks with short stops crept up to harm)
  hurtEvery: 1.4, dmg: 3,   // at 1.0, this much every this often (unblockable, no knock; name SUNSTROKE)
  roof: 5,        // rock this many rows over the head is shade
  maxWalk: 7.5,   // the level rule: no walk in the sun longer than this (s at RUN) between two shades
  RUN: 92,
};
export function sunStep(s, dt, shaded) {
  if (shaded) { s.v = Math.max(0, s.v - dt / SUN.cool); s.tick = SUN.hurtEvery * 0.5; }
  else s.v = Math.min(1, s.v + dt / SUN.fill);
  let hurt = 0;
  if (s.v >= 1) { s.tick = (s.tick ?? SUN.hurtEvery * 0.5) - dt; if (s.tick <= 0) { s.tick += SUN.hurtEvery; hurt = SUN.dmg; } }
  const swim = s.v <= SUN.swimAt ? 0 : (s.v - SUN.swimAt) / (1 - SUN.swimAt);
  return { swim, hurt };
}
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
