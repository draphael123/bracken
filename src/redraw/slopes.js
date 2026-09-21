// ============================================================================================
// SAND SLOPES — the dunes' own tiles (phase 1: baked here, not wired in; phase 2 draws them in drawWorld).
//
// A slope tile is only believable if the SAND reads as one body running under the whole hill, not a stack of wedges
// on a grid. So nothing in these tiles lines up with a tile edge: the character is all in a thin SKIN that follows the
// surface (see sandAt), and under the skin every tile - slope, flat top and fill - is the same fill colour with loose
// grain. (A first bake laid strata bands through each tile, and a dune of them read as a stepped pyramid.)
//
// What makes it read as a slope at sixteen pixels:
//   * a pale CRUST along the surface, two pixels deep, following it pixel for pixel (the wind-packed skin of a dune);
//   * the lit face and the shaded face: the sun is up and to the LEFT, so a slope rising to the right faces it and is
//     brighter, a slope rising to the left is turned away and a step darker - which also tells the player which way is
//     downhill before he is on it;
//   * WIND RIPPLES: short dark dashes laid parallel to the surface, a few pixels under it;
//   * the odd pebble or dry root in the fill, seeded, so no two tiles are the same.
// Above the surface the tile is clear, so the sky and the parallax show through the wedge.
//
// bakeSandSlopes() -> { [kind]: [3 variants], under: { [kind]: [3] }, top: [3], fill: [3] }  (16x16 canvases)   (kind = SLOPE.* from src/slopes.js)
// ============================================================================================
import { canvas, px, mulberry } from '../px.js';
import { SLOPE, heightAt, slopeRise } from '../slopes.js';

const T = 16;
export const SAND = { crust: '#f6e2ae', crustL: '#fff1c8', lit: '#e8c784', base: '#dcb676', mid: '#cc9f62', deep: '#b8894f', band: '#a87a46', dark: '#8c6238', ripple: '#bf955c', fill: '#d0a66a', grain: '#c49860', pebble: '#8a7d6e', pebbleL: '#b0a491', root: '#6e5236' };
/* THE SKIN, NOT STRATA. The first bake laid bands through the whole tile, and a hill of them read as a stepped
   pyramid: every fill tile carried its band at the same place, so the tile grid drew itself across the dune. The sand's
   character is all in a thin SKIN that follows the surface - crust, the lit layer, the base - and under it every tile
   is the same fill colour with loose grain, so nothing lines up with a tile edge and the dune reads as one mass. */
function sandAt(depth, x, rnd, shade, S = SAND) {
  if (depth < 1) return shade ? S.crust : S.crustL;
  if (depth < 2) return S.crust;
  const d = depth + Math.sin(x * 0.7) * 0.6;
  let c = d < 4 ? (shade ? S.base : S.lit) : d < 6.5 ? S.base : S.fill;
  if (rnd() < 0.07) c = c === S.lit ? S.base : c === S.base ? S.fill : S.grain;   // grain
  return c;
}
/* one tile: `surf(x)` = the surface in the tile (px down from its top) at column x; `shade` = the face turned from the sun;
   S = the material's palette (SAND, or ROCK in redraw/desert.js) */
export function skinTile(seed, surf, shade, S = SAND) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  for (let x = 0; x < T; x++) { const s = surf(x + 0.5), top = Math.ceil(s - 0.001);
    for (let y = Math.max(0, top); y < T; y++) px(g, x, y, sandAt(y - s, x, rnd, shade, S)); }
  // wind ripples: dashes three to six pixels under the surface, following its slope
  for (let i = 0; i < 3; i++) { const x0 = (rnd() * (T - 4)) | 0, dep = 3 + ((rnd() * 4) | 0), len = 2 + ((rnd() * 3) | 0);
    for (let k = 0; k < len; k++) { const x = x0 + k; if (x >= T) break; const y = Math.round(surf(x + 0.5) + dep); if (y < T) px(g, x, y, S.ripple); } }
  // a pebble, sometimes a root, deep in the fill
  if (rnd() < 0.5) { const x = 2 + ((rnd() * 11) | 0), y = Math.max(Math.ceil(surf(x + 0.5)) + 6, 10 + ((rnd() * 4) | 0)); if (y < T - 1) { px(g, x, y, S.pebble); px(g, x + 1, y, S.pebble); px(g, x, y - 1, S.pebbleL); } }
  if (rnd() < 0.25) { const x = 1 + ((rnd() * 13) | 0); let y = Math.ceil(surf(x + 0.5)) + 3; for (let k = 0; k < 4 && y < T; k++, y++) px(g, x + (k >> 1), y, S.root); }
  return c;
}
export function bakeSandSlopes(S = SAND, seed0 = 9100) {
  const out = {};
  for (const kind of Object.values(SLOPE)) {
    const shade = slopeRise(kind) < 0;   // rising to the left: turned from a sun in the upper left
    out[kind] = [0, 1, 2].map(i => skinTile(seed0 + kind * 7 + i * 3, x => heightAt(kind, x), shade, S));
  }
  /* THE TILE UNDER A SLOPE carries the slope's skin on down into it: where a slope's surface is low in its tile, its
     skin runs past the tile's bottom, and a plain fill tile under it cut the skin off in a straight line (a notch at
     every join of a gentle pair). under[kind] is the tile to draw under a slope of that kind. */
  out.under = {};
  for (const kind of Object.values(SLOPE)) out.under[kind] = [0, 1, 2].map(i => skinTile(seed0 + 100 + kind * 7 + i * 3, x => heightAt(kind, x) - T, slopeRise(kind) < 0, S));
  out.top = [0, 1, 2].map(i => skinTile(seed0 + 200 + i * 3, () => 0, false, S));      // the flat beside a slope: the same skin
  out.fill = [0, 1, 2].map(i => skinTile(seed0 + 300 + i * 3, () => -12, false, S));   // sand under sand: the fill colour and its grain, no skin
  return out;
}
