// src/redraw/hornets_nest_art.js - THE HORNET'S NEST's FOE SKINS, GREYBOX (claude/hornetsnest). The art lane redraws them; these keep each reskin's FRAMES (the
// machine under it reads them by index) and give it its own colours, so a reskin reads as its own creature and dies in its own skin (src/main.js reskinSet):
//   hornet     the river wasp's machine (sting: true - a told ! dart from its post): a big brown-and-amber nest hornet         - SPR.wasp's 4 frames (3 wing beats, hurt)
//   combdrone  the sprig's machine (a walker with a told bite): a fat amber-and-black worker crawling the comb               - SPR.sprig's 8 frames (walk x4, look, tell, bite, hurt)
//   nestguard  the shieldbearer's machine (guards his front, a slow turn, a told shove): a soldier hornet behind a wax plate - SPR.shield's 8 frames
// recolor(pack, fn) maps every pixel of every frame through fn([r, g, b]) -> [r, g, b] (its outline kept): a palette swap that keeps the drawing.
import { canvas, flipX, whiten } from '../px.js';
function recolor(P, fn) {
  const map = c => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const d = g.getImageData(0, 0, c.width, c.height), a = d.data;
    for (let i = 0; i < a.length; i += 4) { if (a[i + 3] === 0) continue; const [r, gg, b] = fn([a[i], a[i + 1], a[i + 2]]); a[i] = r; a[i + 1] = gg; a[i + 2] = b; } g.putImageData(d, 0, 0); return o; };
  const R = P.R.map(map), white = R.map(c => whiten(c));
  return { R, L: R.map(flipX), white: { R: white, L: white.map(flipX) }, ax: P.ax, ay: P.ay, w: P.w, h: P.h };
}
const lum = ([r, g, b]) => (r * 0.3 + g * 0.59 + b * 0.11) / 255;
const dark = ([r, g, b]) => r + g + b < 90;   /* the outline and the darkest ink stay */
/* amber-brown body by brightness, the wings a cold grey */
const HORNET = c => { if (dark(c)) return c; const [r, g, b] = c, l = lum(c); if (b > r && b > g - 10) return [196 + l * 40, 206 + l * 30, 214 + l * 30];   /* wings */
  return l > 0.62 ? [236, 170, 52] : l > 0.42 ? [176, 96, 30] : [74, 40, 20]; };
const DRONE = c => { if (dark(c)) return c; const l = lum(c), [r, g, b] = c; if (g > r + 20 && g > b) return l > 0.45 ? [222, 158, 40] : [120, 72, 22];   /* the sprig's green is the worker's amber */
  if (r > g + 30) return [40, 26, 16];   /* the cloth: black bands */ return c; };
const GUARD = c => { if (dark(c)) return c; const [r, g, b] = c, l = lum(c); if (g > r + 15 && g > b) return l > 0.45 ? [196, 120, 36] : [96, 56, 20];   /* skin -> hornet amber */
  if (b > r + 10 && b > g) return [60, 36, 22];   /* tabard -> the dark thorax */ if (l > 0.7) return [240, 200, 110];   /* the shield -> a wax plate */ if (r > g + 30) return [42, 28, 18]; return c; };
export function bakeNestSkins(SPR) {
  return { hornet: recolor(SPR.wasp, HORNET), combdrone: recolor(SPR.sprig, DRONE), nestguard: recolor(SPR.shield, GUARD) };
}
