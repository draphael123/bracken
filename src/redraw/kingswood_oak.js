// src/redraw/kingswood_oak.js - THE GREAT OAK on Kingswood's skyline (claude/kingswood2, the greybox landmark; Daniel 10-14: "ONE LANDMARK: his GREAT OAK visible
// across the level (the same tree as his phase 2)"). From the first screen it stands far off on the right third, small and blue-red in the haze; it GROWS and
// warms as you come, cages and the court's pennants hang in its boughs, and the court's smoke rises out of its foot (the burning wood to come). Over the King's
// hall it fills the sky behind the roof. Art only, far layer, a handful of fills a frame; the Sonnet art pass repaints it (one baked silhouette here).
import { canvas } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };

/* the oak, one silhouette 240 x 220, its foot at the bottom centre: a short massive trunk, roots spread, a broad low crown in autumn red */
function bakeOak() {
  const W = 240, H = 220, CX = 120, [c, g] = canvas(W, H);
  /* the crown: overlapping lumps, darker underneath */
  const lumps = [[120, 70, 74, 46], [62, 92, 46, 32], [178, 92, 48, 34], [92, 52, 44, 30], [150, 48, 46, 32], [120, 34, 40, 24], [34, 112, 28, 18], [206, 112, 28, 18], [120, 104, 70, 30]];
  for (const [lx, ly, rx, ry] of lumps) for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry))); for (let x = -w; x <= w; x++) { const n = hash(lx + x, ly + y) % 7, t = (y + ry) / (2 * ry);
    R(g, t < 0.25 ? (n < 2 ? '#d9782a' : '#c9463d') : t < 0.6 ? (n < 2 ? '#c9463d' : '#a83a2a') : (n < 3 ? '#7a2a1a' : '#5a1e14'), lx + x, ly + y, 1, 1); } }
  /* the trunk and the great boughs */
  for (let y = 96; y < H; y++) { const t = (y - 96) / (H - 96), w = 13 + t * 9 + (y > H - 18 ? (y - (H - 18)) * 2.2 : 0); R(g, '#3a2418', Math.round(CX - w), y, Math.round(w * 2), 1); R(g, '#5c3a26', Math.round(CX - w), y, 3, 1); }
  for (const [x0, y0, x1, y1, w] of [[CX - 6, 120, 52, 96, 5], [CX + 6, 120, 190, 98, 5], [CX - 4, 108, 84, 70, 4], [CX + 4, 108, 160, 66, 4], [CX, 104, CX + 2, 50, 4]]) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n, ww = Math.max(2, w * (1 - i / n * 0.6)); R(g, '#3a2418', Math.round(x - ww / 2), Math.round(y), Math.round(ww), 2); } }
  /* the hollow at its foot: the King's door */
  R(g, '#1a0e08', CX - 6, H - 30, 12, 24); R(g, '#e0b040', CX - 1, H - 34, 2, 3);
  return c;
}

export function drawOak(g, cx, cy, VW, VH, L, time, dY) {
  const W = L.W * 16, mid = cx + VW / 2, p = Math.max(0, Math.min(1, mid / W)), dd = (dY || 0) * 0.3;
  const sc = 0.42 + p * 1.0, hh = Math.round(220 * sc), ww = Math.round(240 * sc);
  const gx = Math.round(VW * 0.72 - ww / 2 - (p - 0.5) * 60), gy = Math.round(VH - 70 - hh + dd + 30 * (1 - p));
  g.globalAlpha = 0.40 + p * 0.45; g.drawImage(once('oak', bakeOak), 0, 0, 240, 220, gx, gy, ww, hh);
  /* the cages hung in its boughs and the court's pennants: they sway */
  const hang = [[52, 100], [190, 102], [84, 74], [160, 70], [122, 60]];
  for (let i = 0; i < hang.length; i++) { const [bx, by] = hang[i], sw = Math.sin(time * 1.3 + i) * 1.5 * sc, x = gx + bx * sc, y = gy + by * sc, l = (8 + (i % 3) * 4) * sc;
    R(g, '#2a1a10', x, y, Math.max(1, sc), l); if (i % 2 === 0) { R(g, '#4a4440', x - 3 * sc + sw, y + l, 7 * sc, 7 * sc); R(g, '#2a2420', x - 2 * sc + sw, y + l + sc, 5 * sc, 5 * sc); } else { R(g, '#c9463d', x + sw, y + l, 5 * sc, 3 * sc); R(g, '#e0b040', x + sw, y + l, 5 * sc, Math.max(1, sc * 0.6)); } }
  g.globalAlpha = 1;
  /* THE COURT'S SMOKE out of its foot (the fires of his court; in the brief's escape, the wood burns) */
  const fx = gx + ww / 2, fy = gy + hh - 8 * sc;
  for (let i = 0; i < 10; i++) { const t = (time * 0.16 + i / 10) % 1, rr = (2 + t * 7) * sc, x = fx + Math.sin(t * 5 + i) * 6 * sc + t * 26 * sc, y = fy - t * 120 * sc;
    g.globalAlpha = (1 - t) * (0.22 + p * 0.18); R(g, i % 2 ? '#a89888' : '#8a7a70', x - rr, y - rr * 0.6, rr * 2, rr * 1.2); }
  g.globalAlpha = 1;
}
