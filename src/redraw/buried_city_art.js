// buried_city_art.js - THE BURIED CITY's cast, GREYBOX skins (claude/buriedcity, the Opus greybox, 2026-10-08; the Sonnet art pass replaces these). Each reskin is
// its proven machine's own sheet with its colours shifted (every frame keeps its pose, its tells and its hit box), so the city's dead and its vermin read apart
// from the caravan's and the Ksar's at a glance. THE CLOCKWORK CONSTRUCT (the one new foe) is desert_glass.js's bakeConstruct; THE HOURGLASS KING draws himself
// live in his fight (src/hourglass-king-hands.js) - his bestiary card is his idle frame.
//   SAND-DROWNED     the caravan ambusher, bleached to the colour of the drift (the city's dead, risen out of the sand)
//   SAND-FOLK SLINGER the slinger in a dust-blue wrap (a man of the city's last folk - no goblin past the Goblin Queen)
//   BRASS SCORPION   the scorpion in tarnished brass (the city's clockwork vermin)
import { canvas, flipX, whiten } from '../px.js';
import * as DG from './desert_glass.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
/* every pixel through fn([r, g, b]) -> [r, g, b] (skin-ish warm light tones are kept so faces stay faces, unless keepSkin is false) */
function shift(base, fn, keepSkin = true) {
  if (!base || !base.R) return null;
  const frames = base.R.map(c => { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
    for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2];
      if (keepSkin && r > 150 && gg > 100 && b > 60 && r > b + 40 && r - gg < 70) continue;
      const [nr, ng, nb] = fn([r, gg, b]); p[i] = Math.max(0, Math.min(255, nr | 0)); p[i + 1] = Math.max(0, Math.min(255, ng | 0)); p[i + 2] = Math.max(0, Math.min(255, nb | 0)); }
    g.putImageData(img, 0, 0); return d; });
  return pack(frames, base.ax, base.ay, base.w, base.h);
}
const lum = ([r, g, b]) => 0.3 * r + 0.55 * g + 0.15 * b;
export const bakeSandDrowned = base => shift(base, c => { const l = lum(c); return [l * 1.05 + 52, l * 0.92 + 40, l * 0.62 + 18]; }, false);
export const bakeSandSlinger = base => shift(base, c => { const l = lum(c); return [l * 0.72 + 8, l * 0.86 + 12, l * 1.12 + 26]; });
export const bakeBrassScorpion = base => shift(base, c => { const l = lum(c); return [l * 1.3 + 30, l * 1.02 + 14, l * 0.4]; }, false);

/* every set at once (main.js: for (const k in K) SPR[k] = K[k]) */
export function bakeBuriedCitySets(SPR) {
  const out = { construct: DG.bakeConstruct() };
  const king = DG.bakeHourglassKing(0); out.hourglassking = { R: [king.R[0], king.R[1]], L: [king.L[0], king.L[1]], white: { R: [king.white.R[0], king.white.R[1]], L: [king.white.L[0], king.white.L[1]] }, ax: king.ax, ay: king.ay, w: king.w, h: king.h };
  const add = (k, v) => { if (v) out[k] = v; };
  add('sanddrowned', bakeSandDrowned(SPR.ambusher)); add('sandslinger', bakeSandSlinger(SPR.slinger)); add('brassscorpion', bakeBrassScorpion(SPR.scorpion));
  return out;
}
