// src/redraw/sporewood_knot.js - THE MOTHER'S KNOT on Sporewood's skyline (claude/sporewood2, the greybox landmark; the recipe's change 5: "ONE LANDMARK THAT IS ALSO
// THE DESTINATION"). A cap-cathedral: a great violet cap on a trunk of twisted roots, the KNOT where the roots meet glowing under it, her gills lit, roots reaching
// down into the wood. From the first screen it stands far off on the right third, small and blue in the spore haze; it GROWS and warms and its knot burns brighter
// as you climb toward it, and over her hollow it fills the sky. Art only, far layer, a handful of fills a frame; the Sonnet art pass repaints it.
import { canvas } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };

/* one silhouette 260 x 240, its foot at the bottom centre: a broad domed cap (gills underneath), a trunk of roots twisting into THE KNOT, roots spreading at the foot */
function bakeKnot() {
  const W = 260, H = 240, CX = 130, [c, g] = canvas(W, H);
  /* the cap: a dome, darker at the rim, spotted */
  for (let y = 0; y < 76; y++) { const t = y / 76, w = Math.round(124 * Math.sqrt(Math.min(1, t * 1.6)) * (t > 0.85 ? 1 - (t - 0.85) * 1.2 : 1));
    for (let x = -w; x <= w; x++) { const n = hash(x + 400, y) % 9, e = Math.abs(x) / Math.max(1, w); R(g, e > 0.85 || t > 0.8 ? (n < 2 ? '#3a2a54' : '#2a1f3c') : t < 0.3 ? (n < 3 ? '#8a6ab0' : '#6e529a') : (n < 3 ? '#5e4886' : '#4e3a6e'), CX + x, 8 + y, 1, 1); } }
  for (const [sx, sy, r] of [[CX - 60, 34, 7], [CX - 20, 20, 9], [CX + 30, 28, 8], [CX + 76, 46, 6], [CX - 92, 54, 5], [CX + 6, 50, 6]]) for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) R(g, '#c9b8e8', sx + x, sy + y, 1, 1);
  /* the gills: a band of pale lines under the rim (lit in the draw) */
  for (let x = -110; x <= 110; x += 3) R(g, '#9a7ab8', CX + x, 84, 1, 6 + (hash(x, 3) % 4));
  /* the trunk: roots twisting down from the cap to the knot and on to the foot */
  for (let y = 90; y < H; y++) { const t = (y - 90) / (H - 90), w = 15 + Math.abs(Math.sin(t * 3.2)) * 6 + (y > H - 26 ? (y - (H - 26)) * 2.6 : 0);
    for (let x = -w; x <= w; x++) { const s = Math.sin((x + y * 0.7) * 0.35); R(g, s > 0.3 ? '#4a3a38' : s > -0.4 ? '#3a2c2c' : '#2a1f22', CX + x, y, 1, 1); } }
  /* roots reaching out from the foot */
  for (const [dx, len] of [[-1, 70], [1, 74], [-1, 44], [1, 40]]) for (let i = 0; i < len; i++) { const x = CX + dx * (14 + i), y = H - 4 - Math.round(Math.sin(i / len * Math.PI) * (6 + len / 10)) + Math.round(i * 0.06); R(g, '#3a2c2c', x, y, 2, 3); }
  /* THE KNOT: a swelling of roots two thirds down the trunk (its glow is drawn over it) */
  for (let y = -16; y <= 16; y++) for (let x = -24; x <= 24; x++) if ((x * x) / 576 + (y * y) / 256 <= 1) R(g, hash(x, y) % 5 < 2 ? '#5a4640' : '#4a3a38', CX + x, 150 + y, 1, 1);
  return c;
}

export function drawKnot(g, cx, cy, VW, VH, L, time, dY) {
  const Wpx = L.W * 16, mid = cx + VW / 2, kx = (L.knot && L.knot.x) || Wpx * 0.92, p = Math.max(0, Math.min(1, mid / kx)), dd = (dY || 0) * 0.3;
  const sc = 0.38 + p * 1.0, hh = Math.round(240 * sc), ww = Math.round(260 * sc);
  const gx = Math.round(VW * 0.7 - ww / 2 - (p - 0.5) * 70), gy = Math.round(VH - 60 - hh + dd + 34 * (1 - p));
  g.globalAlpha = 0.38 + p * 0.42; g.drawImage(once('knot', bakeKnot), 0, 0, 260, 240, gx, gy, ww, hh);
  /* her gills lit, and THE KNOT burning brighter as you come */
  const pulse = 0.5 + 0.5 * Math.sin(time * 1.6);
  g.globalAlpha = (0.18 + 0.3 * p) * (0.7 + 0.3 * pulse); R(g, '#e0b0f0', gx + 20 * sc, gy + 84 * sc, 220 * sc, 5 * sc);
  const kxs = gx + 130 * sc, kys = gy + 150 * sc, kr = (10 + 8 * p) * sc * (0.9 + 0.2 * pulse);
  g.globalAlpha = (0.25 + 0.45 * p) * (0.6 + 0.4 * pulse); g.fillStyle = '#ff7a9a'; g.beginPath(); g.ellipse(kxs, kys, kr * 1.8, kr, 0, 0, 7); g.fill();
  g.globalAlpha = (0.4 + 0.5 * p); g.fillStyle = '#fff1a8'; g.beginPath(); g.ellipse(kxs, kys, kr * 0.6, kr * 0.35, 0, 0, 7); g.fill();
  /* spores drifting off the rim */
  for (let i = 0; i < 9; i++) { const t = (time * 0.12 + i / 9) % 1, x = gx + (30 + ((i * 53) % 200)) * sc + Math.sin(t * 6 + i) * 6 * sc, y = gy + (88 + t * 120) * sc;
    g.globalAlpha = (1 - t) * (0.3 + p * 0.3); R(g, i % 2 ? '#c9a0ff' : '#fff1ff', x, y, Math.max(1, sc * 1.5), Math.max(1, sc * 1.5)); }
  g.globalAlpha = 1;
}
