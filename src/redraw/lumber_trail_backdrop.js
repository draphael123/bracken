// lumber_trail_backdrop.js - THE LUMBER TRAIL's landmark and area skyline (claude/lumbertrailart). THE GREAT HIVE PINE stands on the far horizon from the first screen
// (the Queen's pine, her comb hung in its crown) and GROWS as you come: small and blue-grey over the cabin, huge and dark over the tarn. Along the way the camp's
// smoke columns rise out of the far trees (the woodsmen's fires) and the tarn's drowned snags stand grey against the sky. Art only, far layers, a handful of fills a frame.
import { canvas, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };

/* the great pine, one silhouette (blue-grey), its comb: 120 x 260, foot at the bottom centre */
function bakeGreatPine() {
  const W = 120, H = 260, CX = 60, [c, g] = canvas(W, H);
  for (let y = 40; y < H; y++) { const t = (y - 40) / (H - 40), w = 4 + t * 7 + (y > H - 22 ? (y - (H - 22)) * 0.5 : 0); R(g, '#34524c', Math.round(CX - w), y, Math.round(w * 2), 1); R(g, '#4a6c62', Math.round(CX - w), y, 2, 1); }
  for (let i = 0; i < 11; i++) { const ty = 14 + i * 17, tw = 8 + i * 4.6;
    for (let k = -tw; k <= tw; k++) { const e = Math.abs(k) / tw, bot = Math.round(ty + 15 - e * 11 + (hash(k + 90, i) % 3)), top = Math.round(ty - 8 + Math.abs(k) * 0.38);
      for (let y = top; y <= bot; y++) { const t2 = (y - top) / Math.max(1, bot - top); R(g, t2 < 0.3 ? '#6f9a8c' : t2 < 0.65 ? '#4d7a6a' : '#355d52', CX + k, y, 1, 1); } } }
  /* her comb, hung in the crown on the lean side: grey paper, gold at its mouth */
  const cx0 = CX + 12, cy0 = 118; for (let j = 0; j < 30; j++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow((j - 11) / 19, 2))) * 11); for (let i = -hw; i < hw; i++) R(g, ((i + j * 2) % 5 === 0 || j % 4 === 0) ? '#8a7a58' : (i < 0 ? '#d8c488' : '#b09a62'), cx0 + i, cy0 + j, 1, 1); }
  R(g, '#2a2014', cx0 - 3, cy0 + 16, 7, 5); R(g, '#f0b840', cx0 - 2, cy0 + 30, 2, 3); R(g, '#f0b840', cx0 + 3, cy0 + 29, 2, 2);
  return c;
}
function bakeSnag(seed) {
  const [c, g] = canvas(30, 90), r = mulberry(seed);
  for (let y = 10; y < 90; y++) { const w = 3 + (y / 90) * 3; R(g, '#59655f', Math.round(15 - w), y, Math.round(w * 2), 1); R(g, '#7a8880', Math.round(15 - w), y, 1, 1); }
  for (let k = 0; k < 6; k++) { const by = 20 + k * 11, d = k % 2 ? 1 : -1, l = 6 + ((r() * 9) | 0); for (let i = 0; i < l; i++) R(g, '#59655f', 15 + d * (3 + i), by - (i >> 1), 1, 2); }
  R(g, '#59655f', 14, 0, 2, 12);
  return c;
}

export function drawLandmark(g, cx, cy, VW, VH, L, time, dY) {
  const W = L.W * 16, mid = cx + VW / 2, p = Math.max(0, Math.min(1, mid / W)), dd = (dY || 0) * 0.3, sxOf = (wx, f) => Math.round(VW / 2 + (wx - mid) * f);
  /* THE GREAT HIVE PINE: far, on the screen's right third (it is where you are going), scaling and darkening as you come */
  const sc = 0.34 + p * 0.82, hh = Math.round(260 * sc), ww = Math.round(120 * sc), gx = Math.round(VW * 0.74 - ww / 2 - (p - 0.5) * 36), gy = Math.round(VH - 96 - hh + dd + 40 * (1 - p));
  g.globalAlpha = 0.42 + p * 0.38; g.drawImage(once('gp', bakeGreatPine), 0, 0, 120, 260, gx, gy, ww, hh); g.globalAlpha = 1;
  /* the wasps round her comb, a few specks that wheel (only where it is big enough to see them) */
  if (sc > 0.6) { const bx = gx + ww / 2 + 12 * sc, by = gy + 138 * sc; g.fillStyle = '#3a2c14'; for (let i = 0; i < 6; i++) { const a = time * (1.3 + (i % 3) * 0.4) + i * 1.9; g.fillRect(Math.round(bx + Math.cos(a) * (10 + i * 2) * sc), Math.round(by + Math.sin(a * 1.3) * (9 + i) * sc), 1, 1); } }
  const mx = mid / 16;
  /* THE CABIN's chimney smoke, world-fixed, rising out over the shed roof and drifting off through the pines */
  if (mx < 40) { const X = Math.round(192 - cx), base = 300 - cy; for (let i = 0; i < 9; i++) { const t = (time * 0.22 + i / 9) % 1, rr = 2 + t * 5; g.globalAlpha = (1 - t) * 0.5; g.fillStyle = '#d8d4c8'; g.fillRect(Math.round(X + Math.sin(t * 6 + i) * 3 + t * 14 - rr), Math.round(base - t * 54 - rr * 0.6), Math.round(rr * 2), Math.round(rr * 1.2)); } g.globalAlpha = 1; }
  /* the woodsman's CHOP: now and then a bite of the axe at the block, chips flying (the verb you will be doing); the saw frame's SAWDUST drifting down into the pit */
  if (mx < 40) { const t = (time * 0.42) % 1; if (t < 0.5) { g.fillStyle = t < 0.08 ? '#fff2b0' : '#e2cb92'; for (let i = 0; i < 6; i++) { const a = -1.1 + i * 0.5, v = 26 + (i % 3) * 8, u = t * 1.2; g.fillRect(Math.round(248 - cx + Math.cos(a) * v * u), Math.round(338 - cy + Math.sin(a) * v * u + 40 * u * u), 1 + (i & 1), 1); } } }
  if (mx > 214 && mx < 246) { for (let i = 0; i < 8; i++) { const t = (time * 0.6 + i / 8) % 1; g.globalAlpha = 0.8 * (1 - t); g.fillStyle = i % 2 ? '#e2cb92' : '#f4e6bd'; g.fillRect(Math.round(3688 - cx - 10 + ((i * 7) % 22)), Math.round(268 - cy + t * 34), 1, 1); } g.globalAlpha = 1; }
  /* THE CAMP: three smoke columns standing out of the far trees (the woodsmen's fires), only while the camp is in view */
  if (mx > 186 && mx < 322) { const fade = Math.min(1, (mx - 186) / 24, (322 - mx) / 24), base = VH - 118 + dd;
    for (const [wx, k] of [[222, 0], [248, 1], [276, 2]]) { const X = sxOf(wx * 16, 0.3);
      for (let i = 0; i < 12; i++) { const t = (time * 0.18 + i / 12 + k * 0.31) % 1, yy = base - t * 96, xx = X + Math.round(Math.sin(t * 5 + k * 2 + i) * 5 + t * 18), rr = 2 + t * 5;
        g.globalAlpha = (1 - t) * 0.30 * fade; g.fillStyle = k === 1 ? '#bfb8a8' : '#a8a89c'; g.fillRect(Math.round(xx - rr), Math.round(yy - rr * 0.6), Math.round(rr * 2), Math.round(rr * 1.2)); }
      g.globalAlpha = 1; } }
  /* THE TARN: drowned snags, grey against the sky, standing in the far water */
  if (mx > 396 && mx < 520) { const fade = Math.min(1, (mx - 396) / 20, (520 - mx) / 20); g.globalAlpha = 0.55 * fade;
    for (let i = 0; i < 5; i++) { const sn = once('sn' + (i % 3), () => bakeSnag(50 + (i % 3))); g.drawImage(sn, sxOf((412 + i * 21) * 16 + (hash(i, 3) % 90), 0.5) - 15, Math.round(VH - 160 + dd + (hash(i, 4) % 20))); }
    g.globalAlpha = 1; }
}
