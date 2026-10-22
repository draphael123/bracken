// src/redraw/kingswood_oak.js - THE GREAT OAK on Kingswood's skyline (claude/kingswood2 greybox; REPAINTED by claude/kingswood2art). Daniel 10-14: "ONE LANDMARK: his GREAT OAK visible
// across the level (the same tree as his phase 2)". From the first screen it stands far off on the right third, small and blue-red in the haze; it GROWS and warms as you come, cages and
// the court's pennants hang in its boughs, the court's smoke rises from its foot, and over the King's hall it fills the sky behind the roof.
// The painting: a crown of fifty leaf-clumps (lit gold on top, red through the middle, maroon under, dark gaps and sky showing through), the great limbs forking under it, a trunk of ridged bark
// that flares into roots, and the hollow at its foot - THE KING'S DOOR, arched, with a warm light in it and steps up to it. Alive and whole now. `burn` (0..1, from L.oakBurn) is the seam for
// Gorm's phase 2 and the escape: the right half of the crown goes to char and ember, limbs blacken, smoke thickens - nothing in the level sets it yet.
// One baked silhouette per burn step (far layer, a handful of drawImage calls a frame, the swaying cages and pennants are fills).
import { canvas, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const OW = 320, OH = 280, CX = 160;
export const OAK_SIZE = [OW, OH];
/* where the cages and pennants hang from (baked-sprite pixels) */
export const OAK_HANG = [[44, 128], [262, 130], [84, 96], [220, 92], [160, 70], [112, 118], [208, 120]];

/* leaf palettes: lit, red, deep, gap - and the burnt right-hand set */
const LIVE = [['#f6b04a', '#e08a30', '#d9782a'], ['#c9463d', '#b83a30', '#a83a2a'], ['#7a2a1a', '#5a1e14', '#4a1810']];
const CHAR = [['#6a3a22', '#e0601a', '#8a4a2a'], ['#3a2018', '#2a1410', '#4a2418'], ['#1a0e0c', '#120808', '#241210']];

function clump(g, cx, cy, rx, ry, seed, burnSide) {
  for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry)));
    for (let x = -w; x <= w; x++) { const n = hash(seed + x, seed * 3 + y), t = (y + ry) / (2 * ry) + ((x + rx) / (2 * rx) - 0.5) * 0.18;   /* light from the top left */
      const pal = burnSide ? CHAR : LIVE, band = t < 0.32 ? 0 : t < 0.68 ? 1 : 2, c = pal[band][n % 3 === 0 ? 0 : n % 7 === 0 ? 2 : 1];
      R(g, c, cx + x, cy + y, 1, 1); } }
  /* the leaf texture: little lit flecks along the top and dark ones under, to break the ellipse */
  for (let i = 0; i < rx * 2; i++) { const n = hash(seed, i + 40), x = ((n % (rx * 2)) - rx), y = -ry + ((n >> 8) % Math.max(2, ry)); if (Math.abs(x) < rx * 0.9) { R(g, burnSide ? '#ff9a3c' : '#ffd27a', cx + x, cy + y, 2, 1); R(g, burnSide ? '#1a0e0c' : '#5a1e14', cx + x + 1, cy + y + ry, 3, 1); } }
}

function bakeOak(burn) {
  const [c, g] = canvas(OW, OH), r = mulberry(4401);
  /* the roots flare from the foot across the ground, the trunk's ridged bark above them */
  const foot = OH - 6, top = 118;
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const len = 34 + k * 14 + (r() * 12 | 0), dy = k * 2; for (let i = 0; i < len; i++) { const t = i / len, x = CX + s * (26 + i), y = foot - 6 - (1 - t) * (1 - t) * (22 - k * 3) + dy, w = Math.max(2, 10 - t * 8 - k);
    R(g, '#2a1410', x, y - w, 1, w + 3); R(g, '#4a2a1e', x, y - w + 1, 1, w); if (s < 0) R(g, '#6a3a2a', x, y - w + 1, 1, 1); } }
  for (let y = top; y < OH - 4; y++) { const t = (y - top) / (OH - top), w = 24 + t * t * 16 + (y > OH - 30 ? (y - (OH - 30)) * 0.6 : 0), sw = Math.round(Math.sin(y * 0.05) * 1.5);
    for (let x = -Math.round(w); x <= Math.round(w); x++) { const ax = CX + x + sw, band = Math.floor((x + 80) / 3), n = hash(band, 11) % 100, lit = x < -w * 0.3, c0 = n < 30 ? '#2a1410' : n > 80 ? '#5a3224' : '#3e2218';
      R(g, lit ? (n < 30 ? '#4a2a1e' : '#7a4a34') : (x > w * 0.55 ? '#1a0c0a' : c0), ax, y, 1, 1); if (x % 4 === 0 && (hash(x, y >> 3) % 3) !== 0) R(g, '#150a08', ax, y, 1, 1); } }
  /* the limbs forking up under the crown */
  const limbs = [[CX - 14, 150, 40, 108, 9], [CX + 14, 150, 280, 110, 9], [CX - 8, 130, 96, 80, 7], [CX + 8, 130, 224, 78, 7], [CX, 124, CX, 60, 7], [CX - 20, 140, 14, 150, 5], [CX + 20, 140, 306, 152, 5]];
  for (const [x0, y0, x1, y1, w] of limbs) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 6, ww = Math.max(2, w * (1 - t * 0.7)); const dead = burn > 0 && x > CX + 6;
    R(g, dead ? '#0e0806' : '#2a1410', x - ww / 2 - 1, y, ww + 2, 3); R(g, dead ? '#1e100c' : '#4a2a1e', x - ww / 2, y, ww, 2); if (!dead) R(g, '#7a4a34', x - ww / 2, y, 1, 2); } }
  /* the crown: clumps in ranks, back first (dark) to front (lit), the right half burnt when it is */
  const L = [];
  for (let i = 0; i < 52; i++) { const a = r() * Math.PI, d = r(), x = CX + Math.cos(a) * (60 + d * 96), y = 78 - Math.sin(a) * (34 + d * 38) + 40 * d * d, rx = 22 + (r() * 22 | 0), ry = 14 + (r() * 14 | 0); L.push([x, y, rx, ry, i * 17 + 3]); }
  for (let i = 0; i < 16; i++) L.push([CX - 100 + i * 14, 124 + (r() * 18 | 0), 18 + (r() * 10 | 0), 12 + (r() * 6 | 0), i * 29 + 700]);   /* the skirt of the crown, low */
  L.sort((a, b) => a[1] - b[1]);
  for (const [x, y, rx, ry, sd] of L) clump(g, Math.round(x), Math.round(y), rx, ry, sd, burn > 0 && x > CX + 8 + (hash(sd, 2) % 20) * (1 - burn) );
  /* gaps: the sky showing through, dark pockets deep inside */
  g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 30; i++) { const x = 40 + (r() * 240 | 0), y = 50 + (r() * 70 | 0); if (hash(i, 8) % 3) R(g, '#000', x, y, 2 + (r() * 3 | 0), 1 + (r() * 2 | 0)); } g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 40; i++) R(g, '#2a0e0a', 50 + (r() * 220 | 0), 70 + (r() * 60 | 0), 3 + (r() * 4 | 0), 2);
  /* THE KING'S DOOR: the hollow at its foot, arched, a warm light in it, three steps up */
  const dx = CX - 2, dy = OH - 52;
  for (let y = 0; y < 44; y++) { const w = y < 14 ? Math.round(13 * Math.sqrt(1 - Math.pow((14 - y) / 14, 2))) : 13; R(g, '#0a0504', dx - w - 2, dy + y, w * 2 + 4, 1); R(g, '#1a0e08', dx - w, dy + y, w * 2, 1); }
  const gr = g.createLinearGradient(0, dy + 8, 0, dy + 44); gr.addColorStop(0, 'rgba(255,200,110,0)'); gr.addColorStop(1, 'rgba(255,190,100,0.75)'); g.fillStyle = gr; g.fillRect(dx - 10, dy + 8, 20, 36);
  R(g, '#e0b040', dx - 1, dy - 5, 3, 6); R(g, '#fff0a8', dx - 1, dy - 5, 3, 1);   /* a crown cut over the door */
  for (let s = 0; s < 3; s++) { R(g, '#3a2a28', dx - 16 - s * 3, dy + 44 - s * 0 + s * 1, 32 + s * 6, 3); R(g, '#7a6a5a', dx - 16 - s * 3, dy + 44 + s, 32 + s * 6, 1); }
  if (burn > 0) for (let i = 0; i < 40; i++) R(g, i % 3 ? '#e0601a' : '#ffb04a', CX + 10 + (r() * 140 | 0), 60 + (r() * 80 | 0), 2, 1);   /* embers in the char */
  return c;
}

export function drawOak(g, cx, cy, VW, VH, L, time, dY) {
  const W = L.W * 16, mid = cx + VW / 2, p = Math.max(0, Math.min(1, mid / W)), dd = (dY || 0) * 0.3, burn = Math.max(0, Math.min(1, +L.oakBurn || 0)), bk = Math.round(burn * 4) / 4;
  const sc = 0.44 + p * 0.8, ww = Math.round(OW * sc), hh = Math.round(OH * sc);
  const gx = Math.round(VW * 0.72 - ww / 2 - (p - 0.5) * 60), gy = Math.round(VH - 66 - hh + dd + 30 * (1 - p));
  g.globalAlpha = 0.52 + p * 0.4; g.drawImage(once('oak' + bk, () => bakeOak(bk)), 0, 0, OW, OH, gx, gy, ww, hh);
  /* the cages hung in its boughs and the court's pennants: they sway */
  for (let i = 0; i < OAK_HANG.length; i++) { const [bx, by] = OAK_HANG[i], sw = Math.sin(time * 1.3 + i) * 1.6 * sc, x = gx + bx * sc, y = gy + by * sc, l = (10 + (i % 3) * 5) * sc;
    R(g, '#2a1a10', x, y, Math.max(1, sc), l);
    if (i % 2 === 0) { R(g, '#1e1e26', x - 4 * sc + sw, y + l, 9 * sc, 9 * sc); R(g, '#4a4a54', x - 3 * sc + sw, y + l + sc, 7 * sc, 7 * sc); R(g, '#14100e', x - 2 * sc + sw, y + l + 2 * sc, 5 * sc, 5 * sc); R(g, '#9a9aa6', x - 4 * sc + sw, y + l, 9 * sc, Math.max(1, sc * 0.7)); }
    else { R(g, '#a83a2a', x + sw, y + l, 6 * sc, 4 * sc); R(g, '#e0b040', x + sw, y + l, 6 * sc, Math.max(1, sc * 0.7)); R(g, '#6a1e18', x + sw + 4 * sc, y + l + 2 * sc, 2 * sc, 3 * sc); } }
  g.globalAlpha = 1;
  /* THE KING'S DOOR's light, a breath of it, and the court's smoke out of the foot (the fires of his court; in the brief's escape, the wood burns) */
  const fx = gx + ww / 2, fy = gy + hh - 8 * sc;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (0.12 + p * 0.14) * (0.85 + 0.15 * Math.sin(time * 3)); { const rr = Math.max(8, 36 * sc); const gr = g.createRadialGradient(fx, fy - 22 * sc, 0, fx, fy - 22 * sc, rr); gr.addColorStop(0, 'rgba(255,190,100,1)'); gr.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = gr; g.fillRect(fx - rr, fy - 22 * sc - rr, rr * 2, rr * 2); } g.restore();
  const smoke = 10 + Math.round(Math.max(0, Math.min(1, +L.oakBurn || 0)) * 8);
  for (let i = 0; i < smoke; i++) { const t = (time * 0.16 + i / smoke) % 1, rr = (2 + t * 7) * sc, x = fx + Math.sin(t * 5 + i) * 6 * sc + t * 26 * sc, y = fy - t * 120 * sc;
    g.globalAlpha = (1 - t) * (0.22 + p * 0.18); R(g, i % 2 ? '#a89888' : '#8a7a70', x - rr, y - rr * 0.6, rr * 2, rr * 1.2); }
  g.globalAlpha = 1;
}
