// src/redraw/sporewood_knot.js - THE MOTHER'S KNOT on Sporewood's skyline (claude/sporewood2art; the greybox's landmark repainted). "ONE LANDMARK THAT IS ALSO THE DESTINATION": a cap-cathedral, a
// great spotted plum cap over a ring of cream gills, on a trunk of twisted roots, THE KNOT where the roots gather glowing foxfire; spore falls from the gills like rain. From the first screen it
// stands far off on the right third, small and pale in the spore haze; it GROWS, darkens and warms, and its knot burns brighter, as you climb toward it; over her hollow it fills the sky.
// Drawn from sporewood2_backdrop.js between the far line and the mid row.  Art only: a few drawImage calls a frame.
//   drawKnot(g, cx, cy, VW, VH, L, time, dY)
import { canvas, mulberry } from '../px.js';
import { PAL, GLOW, hash, mix } from './sporewood2_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0)); };

/* one silhouette 260 x 240, its foot at the bottom centre: a broad spotted dome (gills under the rim), a trunk of roots twisting into THE KNOT, roots spreading at the foot, a foxfire seam up the trunk */
export function bakeKnot() {
  const W = 260, H = 240, CX = 130, [c, g] = canvas(W, H), P = PAL[5], cap = P.cap, r = mulberry(7);
  /* THE CAP: a dome, lit from the upper left, banded darker toward the rim, a scalloped lower edge */
  for (let y = 0; y < 78; y++) { const t = y / 78, w = Math.round(125 * Math.sqrt(Math.min(1, t * 1.55)) * (t > 0.88 ? 1 - (t - 0.88) * 1.4 : 1));
    for (let x = -w; x <= w; x++) { const n = hash(x + 400, y) % 9, e = Math.abs(x) / Math.max(1, w), lit = (-x / 125) * 0.6 + (1 - t) * 0.6;
      R(g, t > 0.82 ? cap[0] : lit > 0.62 ? (n < 4 ? cap[2] : cap[1]) : lit > 0.2 ? (n < 3 ? cap[1] : mix(cap[1], cap[0], 0.3)) : e > 0.8 ? mix(cap[0], '#000', 0.25) : cap[0], CX + x, 6 + y, 1, 1); } }
  /* the spots */
  for (const [sx, sy, rad] of [[-62, 34, 8], [-22, 18, 10], [30, 28, 9], [78, 48, 6], [-96, 56, 5], [4, 52, 7], [58, 14, 5], [-48, 60, 4]]) for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) if (x * x * 1.3 + y * y <= rad * rad) R(g, x + y < -rad * 0.5 ? '#f4e6f4' : '#c9a8d4', CX + sx + x, 6 + sy + y, 1, 1);
  /* the gills: a band of cream lines under the rim, lit in the draw */
  for (let x = -112; x <= 112; x += 2) { const e = Math.abs(x) / 112, len = 7 + Math.round((1 - e) * 5) + (hash(x, 3) % 3); R(g, mix('#e8ddc0', cap[1], e * 0.5), CX + x, 80 + Math.round(e * e * 3), 1, len); if (x % 4 === 0) R(g, mix('#9c8c66', cap[0], 0.4), CX + x + 1, 82 + Math.round(e * e * 3), 1, len - 3); }
  /* the trunk: roots twisting down from the cap to the knot and on to the foot */
  for (let y = 90; y < H; y++) { const t = (y - 90) / (H - 90), w = 15 + Math.abs(Math.sin(t * 3.2)) * 6 + (y > H - 26 ? (y - (H - 26)) * 2.6 : 0);
    for (let x = -w; x <= w; x++) { const s = Math.sin((x + y * 0.7) * 0.35 + Math.sin(y * 0.05) * 2), e = x / w; R(g, e < -0.45 ? (s > 0.2 ? '#7a5648' : '#5e4236') : s > 0.3 ? '#5e4236' : s > -0.4 ? '#46322a' : '#2e211c', CX + x, y, 1, 1); } }
  /* the roots reaching out from the foot */
  for (const [dx, len] of [[-1, 78], [1, 82], [-1, 50], [1, 46], [-1, 28], [1, 30]]) for (let i = 0; i < len; i++) { const x = CX + dx * (14 + i), y = H - 4 - Math.round(Math.sin(i / len * Math.PI) * (6 + len / 10)) + Math.round(i * 0.06); R(g, i < 4 ? '#5e4236' : '#46322a', x, y, 2, 3); R(g, '#7a5648', x, y, 1, 1); }
  /* THE KNOT: a swelling of roots two thirds down the trunk (its glow is drawn over it) */
  for (let y = -17; y <= 17; y++) for (let x = -25; x <= 25; x++) { const d = (x * x) / 625 + (y * y) / 289; if (d <= 1) R(g, d > 0.8 ? '#3a2a22' : hash(x, y) % 5 < 2 ? '#7a5648' : '#5e4236', CX + x, 152 + y, 1, 1); }
  /* the foxfire seam: a broken glowing line up the trunk from the knot to the cap's stem */
  for (let y = 100; y < 136; y++) if (y % 4 !== 3) R(g, GLOW.lo, CX + Math.round(Math.sin(y * 0.3) * 3), y, 1, 1);
  void r; return c;
}

export function drawKnot(g, cx, cy, VW, VH, L, time, dY) {
  const Wpx = L.W * 16, mid = cx + VW / 2, kx = (L.knot && L.knot.x) || Wpx * 0.92, p = Math.max(0, Math.min(1, mid / kx)), dd = (dY || 0) * 0.3;
  const fade = L.arena ? Math.max(0, Math.min(1, (L.arena.x0 + 6 * 16 - mid) / (36 * 16))) : 1;   /* over her hollow the real one stands: the landmark gives way to her */
  if (fade <= 0.01) return;
  const sc = 0.46 + p * 0.95, hh = Math.round(240 * sc), ww = Math.round(260 * sc);
  const gx = Math.round(VW * 0.72 - ww / 2 - (p - 0.5) * 80), gy = Math.round(VH - 56 - hh + dd + 30 * (1 - p));
  const haze = mix('#9ab0a0', '#6a4878', p);   /* pale and grey-green in the glade's air, plum in hers */
  g.globalAlpha = (0.5 + p * 0.4) * fade; g.drawImage(once('knot', bakeKnot), 0, 0, 260, 240, gx, gy, ww, hh);
  /* the air between: the glade's haze laid over the far thing, thinning as you come */
  g.globalAlpha = 0.38 * (1 - p) * fade; g.fillStyle = haze; g.fillRect(gx, gy, ww, hh); g.globalAlpha = 1;
  /* her gills lit (foxfire cream), and THE KNOT burning brighter as you come */
  const pulse = 0.5 + 0.5 * Math.sin(time * 1.6);
  g.globalAlpha = (0.2 + 0.3 * p) * (0.7 + 0.3 * pulse) * fade; R(g, '#d6fff0', gx + 22 * sc, gy + 82 * sc, 216 * sc, 5 * sc);
  const kxs = gx + 130 * sc, kys = gy + 152 * sc, kr = (10 + 9 * p) * sc * (0.9 + 0.2 * pulse);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.globalAlpha = (0.2 + 0.4 * p) * (0.6 + 0.4 * pulse) * fade; g.fillStyle = GLOW.mid; g.beginPath(); g.ellipse(kxs, kys, kr * 2.4, kr * 1.5, 0, 0, 7); g.fill();
  g.globalAlpha = (0.35 + 0.5 * p) * fade; g.fillStyle = GLOW.c; g.beginPath(); g.ellipse(kxs, kys, kr * 1.1, kr * 0.7, 0, 0, 7); g.fill();
  g.restore(); g.globalAlpha = (0.55 + 0.4 * p) * fade; g.fillStyle = GLOW.hi; g.beginPath(); g.ellipse(kxs, kys, kr * 0.45, kr * 0.28, 0, 0, 7); g.fill();
  /* spore falling off the rim like a fine rain */
  for (let i = 0; i < 14; i++) { const t = (time * 0.1 + i / 14) % 1, x = gx + (26 + ((i * 53) % 210)) * sc + Math.sin(t * 6 + i) * 5 * sc, y = gy + (88 + t * 130) * sc;
    g.globalAlpha = (1 - t) * (0.3 + p * 0.35) * fade; R(g, i % 2 ? '#e8d8f4' : '#fff1ff', x, y, Math.max(1, sc * 1.5), Math.max(1, sc * 1.5)); }
  g.globalAlpha = 1;
}
