// lumber_trail_far.js - THE LUMBER TRAIL's OWN far + mid parallax layers (claude/lumberbackdrop). The first level wore the shared round-canopied forest; it now has its own skyline,
// area by area (L.sections, tiles): the cabin glade and the hive pines a ridge of tall STRAIGHT-TRUNKED pines (a bare shaft, a small crown at the top), the ford's pale birches and
// a drifting mist, the LUMBER CAMP a cut-back hillside (stumps, slash, bare earth, a bunkhouse, the SAWMILL with its chimney, a SPAR POLE with guy lines and a flag, log stacks and
// a timber flume), the TARN a grey flat of water with the pines upside-down in it, drowned snags and a mist bank. Two layers (far 0.15, mid 0.30), every static picture baked ONCE;
// a frame is ~40 drawImage calls and ~90 fillRects. Colours stay mid-value and hazy so foes, hazards and pickups pop against it (readability first). Art only.
//   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full)      campChimneys(VH, dY) -> [{wx, y}] where the camp's smoke columns start
import { canvas, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hx = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + hx(A[0] + (B[0] - A[0]) * t) + hx(A[1] + (B[1] - A[1]) * t) + hx(A[2] + (B[2] - A[2]) * t); };

/* THE AREAS, in tiles (src/lumber-trail.js SECTIONS), and each one's far-hill / mid-ground colour */
const ZONES = [
  { x0: 0, x1: 104, far: [124, 166, 146], mid: [92, 132, 98] },      /* cabin glade */
  { x0: 105, x1: 205, far: [120, 162, 164], mid: [86, 128, 122] },   /* the ford */
  { x0: 206, x1: 300, far: [156, 146, 116], mid: [136, 114, 84] },   /* the camp: cut-back, bare earth */
  { x0: 301, x1: 409, far: [92, 130, 116], mid: [62, 98, 82] },      /* the hive pines */
  { x0: 410, x1: 509, far: [124, 138, 150], mid: [100, 112, 124] },  /* the tarn */
  { x0: 510, x1: 549, far: [112, 124, 98], mid: [86, 100, 70] },     /* the hive clearing */
];
/* weights of each zone at tile t: a crossfade over 24 tiles at every seam, normalised */
const W6 = new Float32Array(6);
function weights(t) { let s = 0; for (let i = 0; i < 6; i++) { const z = ZONES[i]; const k = Math.max(0, Math.min(1, Math.min(t - z.x0 + 12, z.x1 + 1 - t + 12) / 24)); W6[i] = k; s += k; } if (s < 0.001) { W6[t < 0 ? 0 : 5] = 1; s = 1; } for (let i = 0; i < 6; i++) W6[i] /= s; return W6; }
const zoneOf = t => { for (let i = 0; i < 6; i++) if (t <= ZONES[i].x1) return i; return 5; };
const zmix = (key, w) => { let r = 0, g = 0, b = 0; for (let i = 0; i < 6; i++) { const c = ZONES[i][key]; r += c[0] * w[i]; g += c[1] * w[i]; b += c[2] * w[i]; } return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')'; };

/* ------------------------------------------------------------------ baked pieces ------------------------------------------------------------------ */
/* a conifer crown: ragged drooping tiers, lit on top */
function crown(g, cx, y0, h, wmax, c0, c1, c2, seed) {
  const r = mulberry(seed), n = Math.max(3, Math.round(h / 8));
  for (let k = 0; k < n; k++) { const ty = y0 + (k / n) * h * 0.9, th = Math.max(5, (h / n) * 2.1), hw = wmax * (0.22 + 0.78 * (k + 1) / n);
    for (let dy = 0; dy < th; dy++) { const half = Math.max(1, Math.round(hw * (dy / th) + (r() < 0.45 ? 1 : 0))), c = dy < th * 0.28 ? c0 : dy < th * 0.7 ? c1 : c2;
      R(g, c, cx - half, ty + dy, half * 2, 1); if (dy > th * 0.35) R(g, c0, cx - half, ty + dy, 1, 1); }
    for (let i = 0; i < 3; i++) R(g, c2, cx - hw + r() * hw * 2, ty + th, 1, 1 + ((r() * 2) | 0)); }
}
/* a straight trunk, bark ridged, sun on the left, a flare at the foot */
function shaft(g, cx, y0, y1, wTop, wBase, col, lit, dark, seed) {
  const r = mulberry(seed); for (let y = y0; y < y1; y++) { const t = (y - y0) / Math.max(1, y1 - y0), w = wTop + (wBase - wTop) * t + (y > y1 - 10 ? (y - (y1 - 10)) * 0.35 : 0), xl = Math.round(cx - w), wd = Math.max(1, Math.round(w * 2));
    R(g, col, xl, y, wd, 1); R(g, lit, xl, y, 1, 1); if (wd > 5) R(g, dark, xl + wd - 2, y, 2, 1); if (wd > 6 && r() < 0.18) R(g, dark, xl + 2 + ((r() * (wd - 5)) | 0), y, 1, 2); }
}
const FAR_C = ['#9cc0ae', '#86ae9c', '#6f9a89'];   /* lit / body / shade of a far pine's crown (haze) */
const FAR_T = '#7c9c8c';
function bakeFarPine(seed) {
  const h = 56 + (seed % 5) * 10, [c, g] = canvas(26, h), r = mulberry(seed * 7 + 3);
  shaft(g, 13, 14, h, 1, 1.5, FAR_T, '#9ab8a6', '#6a8a7c', seed);
  crown(g, 13, 0, 28 + ((r() * 8) | 0), 8 + ((r() * 3) | 0), FAR_C[0], FAR_C[1], FAR_C[2], seed);
  return c;
}
function bakeFarStump(seed) { const [c, g] = canvas(14, 8), r = mulberry(seed); for (let i = 0; i < 3; i++) { const x = 1 + i * 4 + ((r() * 2) | 0), h = 2 + ((r() * 3) | 0); R(g, '#8a7a62', x, 8 - h, 3, h); R(g, '#c8b88e', x, 8 - h, 3, 1); } return c; }
const MID_C = ['#5f9070', '#427a58', '#2f6048'], MID_T = '#6a4c38', MID_L = '#92694a', MID_D = '#45301f';
function bakeMidPine(seed) {
  const r = mulberry(seed * 13 + 1), h = 112 + (seed % 4) * 12, [c, g] = canvas(46, h);
  shaft(g, 23, 34, h, 3, 4.6, MID_T, MID_L, MID_D, seed);
  for (let i = 0; i < 3; i++) { const by = 40 + i * 22 + ((r() * 8) | 0), d = i % 2 ? 1 : -1; for (let k = 0; k < 6; k++) R(g, MID_D, 23 + d * (4 + k), by - (k >> 1), 1, 1); }   /* dead stubs */
  crown(g, 23, 0, 46 + ((r() * 12) | 0), 16 + ((r() * 4) | 0), MID_C[0], MID_C[1], MID_C[2], seed);
  return c;
}
function bakeBirch(seed) {
  const r = mulberry(seed * 5 + 9), h = 120 + (seed % 3) * 14, [c, g] = canvas(40, h);
  for (let y = 24; y < h; y++) { const w = 2 + (y - 24) / h * 2; R(g, '#d9d6c6', Math.round(20 - w), y, Math.round(w * 2), 1); R(g, '#f0eedc', Math.round(20 - w), y, 1, 1); R(g, '#a4a28e', Math.round(20 + w) - 1, y, 1, 1); }
  for (let y = 30; y < h - 4; y += 6 + ((r() * 5) | 0)) R(g, '#3b3a34', 20 - 3, y, 3 + ((r() * 3) | 0), 1);
  for (let i = 0; i < 9; i++) { const bx = 20 + Math.round((r() - 0.5) * 22), by = 4 + Math.round(r() * 26), br = 5 + ((r() * 4) | 0); R(g, '#7ab088', bx - br, by, br * 2, br - 1); R(g, '#a4d0a0', bx - br + 1, by, br, 2); R(g, '#5c9470', bx - br, by + br - 2, br * 2, 1); }
  return c;
}
function bakeMidStump(seed) {
  const r = mulberry(seed), w = 9 + ((r() * 5) | 0), h = 7 + ((r() * 8) | 0), [c, g] = canvas(w + 8, h + 5);
  R(g, '#6a4c38', 4, 3, w, h); R(g, '#92694a', 4, 3, 2, h); R(g, '#45301f', 4 + w - 2, 3, 2, h); R(g, '#d8c08a', 4, 1, w, 3); R(g, '#b49a62', 5, 2, w - 2, 1); R(g, '#8a7040', 4 + (w >> 1), 2, 1, 1);
  R(g, '#6a4c38', 2, h + 2, 3, 3); R(g, '#6a4c38', 4 + w, h + 2, 3, 3); return c;
}
function bakeSlash(seed) {
  const r = mulberry(seed), [c, g] = canvas(30, 12); for (let i = 0; i < 22; i++) { const x = 2 + ((r() * 24) | 0), y = 11 - ((r() * (6 - Math.abs(x - 15) / 3)) | 0), l = 4 + ((r() * 8) | 0), d = r() < 0.5 ? 1 : -1; for (let k = 0; k < l; k++) R(g, r() < 0.3 ? '#3e5a38' : '#5a4630', x + k * d, y - (k >> 1) * (r() < 0.5 ? 1 : 0), 1, 1); }
  return c;
}
function bakeSnag(seed) {
  const r = mulberry(seed), [c, g] = canvas(34, 92);
  for (let y = 8; y < 92; y++) { const w = 2 + (y / 92) * 3; R(g, '#7e8a88', Math.round(17 - w), y, Math.round(w * 2), 1); R(g, '#a4afac', Math.round(17 - w), y, 1, 1); }
  for (let k = 0; k < 5; k++) { const by = 18 + k * 13, d = k % 2 ? 1 : -1, l = 5 + ((r() * 8) | 0); for (let i = 0; i < l; i++) R(g, '#7e8a88', 17 + d * (3 + i), by - (i >> 1), 1, 2); }
  R(g, '#7e8a88', 16, 0, 2, 12); return c;
}
function bakeLogStack(seed) {
  const r = mulberry(seed), rows = 3 + (seed % 2), [c, g] = canvas(36, rows * 7 + 3); R(g, '#3a2a1c', 1, rows * 7 + 1, 34, 2);
  for (let j = 0; j < rows; j++) { const n = 5 - (j > 2 ? 1 : 0), x0 = 2 + (j & 1) * 3; for (let i = 0; i < n; i++) { const x = x0 + i * 7, y = rows * 7 - (j + 1) * 7 + 1; R(g, '#5a3e28', x, y, 7, 7); R(g, '#c9a870', x + 1, y + 1, 5, 5); R(g, '#a08450', x + 2, y + 2, 3, 3); R(g, '#e0c88c', x + 3, y + 3, 1, 1); } }
  return c;
}
function bakeSpar() {   /* the high-lead spar: a stripped pole, guy lines to the ground, a block on a crossarm, a flag */
  const W = 96, H = 130, [c, g] = canvas(W, H), cx = 48;
  for (let y = 10; y < H; y++) { const w = 2.4 + (y / H) * 2; R(g, '#7a5a3c', Math.round(cx - w), y, Math.round(w * 2), 1); R(g, '#a07a50', Math.round(cx - w), y, 1, 1); R(g, '#4a3624', Math.round(cx + w) - 1, y, 1, 1); }
  R(g, '#6a4c34', cx - 12, 18, 24, 2); R(g, '#2a2014', cx - 12, 20, 2, 5); R(g, '#2a2014', cx + 10, 20, 2, 5); R(g, '#5a5650', cx - 2, 4, 4, 6); R(g, '#c0462a', cx + 3, 4, 10, 4); R(g, '#e06a40', cx + 3, 4, 10, 1);
  const wire = (x1, y1) => { const n = Math.max(Math.abs(x1 - cx), Math.abs(y1 - 12)); for (let i = 0; i <= n; i++) R(g, '#3c3a36', cx + (x1 - cx) * i / n, 12 + (y1 - 12) * i / n, 1, 1); };
  wire(2, H - 4); wire(W - 3, H - 4); wire(14, H - 4); wire(W - 15, H - 4);
  for (let i = 0; i < 5; i++) R(g, '#2a2014', 34 + i * 7, H - 6 + (i & 1), 3, 2);
  return c;
}
function bakeMill() {   /* the sawmill: a long shed, a gabled roof, a stone chimney, a lit saw-window, a log ramp up its left */
  const W = 96, H = 66, [c, g] = canvas(W, H);
  for (let i = 0; i < 28; i++) R(g, '#6e5034', 2 + i, H - 12 - (i >> 1), 2, 3);   /* the ramp */
  for (let i = 0; i < 4; i++) { R(g, '#d8bc84', 8 + i * 6, H - 18 - i * 2, 4, 4); R(g, '#a08450', 9 + i * 6, H - 17 - i * 2, 2, 2); }
  R(g, '#5a4430', 30, 26, 60, 38); for (let x = 30; x < 90; x += 4) R(g, '#46341f', x, 26, 1, 38); R(g, '#6e5034', 30, 26, 60, 2);
  for (let y = 0; y < 14; y++) R(g, y < 3 ? '#8a6a48' : '#4e3b2a', 26 + y, 26 - y, 68 - y * 2, 1);   /* roof */
  R(g, '#e8b858', 40, 36, 12, 10); R(g, '#fff0b0', 42, 38, 4, 4); R(g, '#3a2a1c', 40, 40, 12, 1); R(g, '#3a2a1c', 45, 36, 1, 10);
  R(g, '#2c2218', 66, 44, 12, 20); R(g, '#8a6a48', 64, 42, 16, 2);
  R(g, '#6a6660', 76, 0, 9, 24); R(g, '#8a867c', 76, 0, 2, 24); R(g, '#4a4640', 83, 0, 2, 24); R(g, '#3a3632', 74, 0, 13, 2);
  return c;
}
function bakeBunk() {
  const W = 46, H = 34, [c, g] = canvas(W, H); R(g, '#5e4632', 4, 14, 34, 20); for (let x = 4; x < 38; x += 4) R(g, '#46341f', x, 14, 1, 20);
  for (let y = 0; y < 11; y++) R(g, y < 2 ? '#8a6a48' : '#4e3b2a', 1 + y, 14 - y, 40 - y * 2, 1); R(g, '#e8b858', 10, 22, 6, 6); R(g, '#2c2218', 26, 22, 8, 12);
  R(g, '#6a6660', 32, 0, 5, 16); R(g, '#8a867c', 32, 0, 1, 16); R(g, '#3a3632', 31, 0, 7, 1); return c;
}
function bakeFlume() {   /* a timber chute running down a slope on trestles, 64 x 40 */
  const [c, g] = canvas(64, 40); for (let i = 0; i < 64; i++) { const y = 4 + Math.round(i * 0.42); R(g, '#8a6a48', i, y, 1, 3); R(g, '#4e3b2a', i, y + 3, 1, 1); }
  for (let x = 4; x < 64; x += 14) { const y = 4 + Math.round(x * 0.42) + 4; R(g, '#4e3b2a', x, y, 2, 40 - y); R(g, '#6e5034', x - 3, y + 6, 8, 1); } return c;
}
function bakeDryRack() { const [c, g] = canvas(30, 20); R(g, '#4e3b2a', 2, 4, 2, 16); R(g, '#4e3b2a', 26, 4, 2, 16); R(g, '#6e5034', 0, 3, 30, 2); for (let i = 0; i < 5; i++) R(g, i % 2 ? '#a89a7a' : '#8e7a5e', 5 + i * 5, 5, 3, 8 + (i % 3)); return c; }
function bakeReed(seed) { const r = mulberry(seed), [c, g] = canvas(24, 18); for (let i = 0; i < 9; i++) { const x = 1 + ((r() * 22) | 0), h = 7 + ((r() * 10) | 0); R(g, '#6a7e66', x, 18 - h, 1, h); if (i % 3 === 0) R(g, '#7a5a40', x - 1, 18 - h - 1, 3, 3); } return c; }
/* a soft band: a 1 x 48 vertical gradient (mist), stretched across the view */
function bakeMist(rgb) { const [c, g] = canvas(1, 48); for (let y = 0; y < 48; y++) { const a = Math.sin((y / 47) * Math.PI); g.fillStyle = 'rgba(' + rgb + ',' + (a * a * 0.55).toFixed(3) + ')'; g.fillRect(0, y, 1, 1); } return c; }

/* ------------------------------------------------------------------ the frame ------------------------------------------------------------------ */
/* the ground lines (screen y), laid for the 28-row level: the far ridge's foot and the mid ground's foot, each moving with its own parallax */
const farBase = (VH, dY) => Math.round(VH * 0.56 + dY * 0.06), midBase = (VH, dY) => Math.round(VH * 0.62 + dY * 0.12);
export function campChimneys(VH, dY) { const mb = midBase(VH, dY); return [{ wx: 222, y: mb - 8 - 32 }, { wx: 248, y: mb - 8 - 64 }, { wx: 276, y: mb - 8 - 17 }]; }

function hillH(u, seed, amp) { return Math.round(Math.sin(u * 0.011 + seed) * amp + Math.sin(u * 0.027 + seed * 2.3) * amp * 0.5 + Math.sin(u * 0.05 + seed * 4.1) * amp * 0.2); }

export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  const mid = cx + VW / 2, fb = farBase(VH, dY), mb = midBase(VH, dY), sxOf = (wx, f) => Math.round(VW / 2 + (wx - mid) * f);
  /* ---------------- FAR (0.15): the ridge ---------------- */
  if (full) {
    for (let x = 0; x < VW; x += 8) { const P = (mid + (x - VW / 2) / 0.15) / 16, w = weights(P), campW = w[2], tarnW = w[4], u = x + mid * 0.15;
      const hh = Math.round(14 + hillH(u, 1.3, 5) * (1 - tarnW) - campW * 6 + tarnW * 6 - Math.floor(campW * 3) * 0);
      g.fillStyle = zmix('far', w); g.fillRect(x, fb - hh, 8, VH - fb + hh + 40); g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(x, fb - hh, 8, 1); }
    const s = 17, i0 = Math.floor((mid * 0.15 - VW / 2 - 20) / s), i1 = Math.ceil((mid * 0.15 + VW / 2 + 20) / s);
    for (let i = i0; i <= i1; i++) { const hs = hash(i, 11), U = i * s + (hs % 9), P = U / 0.15, t = P / 16 + ((hs >> 8) % 25) - 12, z = zoneOf(t), sx = Math.round(VW / 2 + U - mid * 0.15), w = weights(P / 16);
      const hh = Math.round(14 + hillH(U, 1.3, 5) * (1 - w[4]) - w[2] * 6 + w[4] * 6);
      if (z === 2) { if (hs % 5 === 0) g.drawImage(once('fs' + (hs % 3), () => bakeFarStump(hs % 3 + 2)), sx - 7, fb - hh - 6); else if (hs % 11 === 0) g.drawImage(once('fp' + (hs % 5), () => bakeFarPine(hs % 5)), sx - 13, fb - hh - 56 - (hs % 5) * 10 + 6); continue; }
      if (z === 4 && hs % 3) continue;   /* the tarn: far shore pines are few */
      const sp = once('fp' + (hs % 5), () => bakeFarPine(hs % 5)); g.drawImage(sp, sx - 13, fb - hh - sp.height + 6); }
    /* the tarn's far water: a pale flat with light streaks, only where the tarn is */
    { const w4 = weights(mid / 16)[4]; if (w4 > 0.02) { g.globalAlpha = w4 * 0.5; g.fillStyle = '#aab6c0'; g.fillRect(0, fb - 2, VW, 5); g.globalAlpha = 1; } }
  }
  /* ---------------- MID (0.30): the near treeline, the camp ---------------- */
  for (let x = 0; x < VW; x += 8) { const P = (mid + (x - VW / 2) / 0.3) / 16, w = weights(P), campW = w[2], tarnW = w[4], u = x + mid * 0.3;
    const hh = Math.round(10 + hillH(u, 2.1, 5) * (1 - tarnW) * (1 - campW * 0.4) - Math.floor(campW * 2) * 0 + (((u / 24) | 0) & 1) * campW * 3);
    g.fillStyle = zmix('mid', w); g.fillRect(x, mb - hh, 8, VH - mb + hh + 40);
    if (tarnW > 0.05) { g.fillStyle = 'rgba(214,226,236,' + (0.35 * tarnW).toFixed(2) + ')'; const ph = Math.round(((u * 0.7 + time * 6) % 22 + 22) % 22); g.fillRect(x, mb - hh + 4 + (ph % 11), 8, 1); } }
  { const s = 36, i0 = Math.floor((mid * 0.3 - VW / 2 - 30) / s), i1 = Math.ceil((mid * 0.3 + VW / 2 + 30) / s);
    for (let i = i0; i <= i1; i++) { const hs = hash(i, 23), U = i * s + (hs % 15), P = U / 0.3, tt = P / 16 + ((hs >> 8) % 25) - 12, z = zoneOf(tt), sx = Math.round(VW / 2 + U - mid * 0.3), w = weights(P / 16), r = (hs >> 4) % 100;
      const hh = Math.round(10 + hillH(U, 2.1, 5) * (1 - w[4]) * (1 - w[2] * 0.4) + (((U / 24) | 0) & 1) * w[2] * 3);
      const pine = () => { const sp = once('mp' + (hs % 6), () => bakeMidPine(hs % 6)); g.drawImage(sp, sx - 23, mb - hh - sp.height + 4); };
      if (z === 0 || z === 3 || z === 5) { if (z === 3 || r < 82) pine(); else g.drawImage(once('ms' + (hs % 3), () => bakeMidStump(hs % 3)), sx - 10, mb - hh - 10); }
      else if (z === 1) { if (r < 55) pine(); else if (r < 88) { const sp = once('bi' + (hs % 3), () => bakeBirch(hs % 3)); g.drawImage(sp, sx - 20, mb - hh - sp.height + 4); } else g.drawImage(once('re' + (hs % 2), () => bakeReed(hs % 2)), sx - 12, mb - hh - 10); }
      else if (z === 2) { if (r < 12) pine(); else if (r < 62) g.drawImage(once('ms' + (hs % 3), () => bakeMidStump(hs % 3)), sx - 10, mb - hh - 10); else if (r < 84) g.drawImage(once('sl' + (hs % 2), () => bakeSlash(hs % 2)), sx - 15, mb - hh - 9); else if (r < 94) g.drawImage(once('ls' + (hs % 2), () => bakeLogStack(hs % 2)), sx - 18, mb - hh - 20); }
      else if (z === 4) { if (r < 40) { const sp = once('sn' + (hs % 3), () => bakeSnag(hs % 3 + 40)); g.globalAlpha = 0.75; g.drawImage(sp, sx - 17, mb - hh - sp.height + 6); g.globalAlpha = 0.28; g.save(); g.translate(sx, mb - hh + 7); g.scale(1, -0.35); g.drawImage(sp, -17, -sp.height); g.restore(); g.globalAlpha = 1; } else if (r < 62) g.drawImage(once('re' + (hs % 2), () => bakeReed(hs % 2 + 4)), sx - 12, mb - hh - 12); } } }
  /* THE CAMP's fixed works, in the world where the smoke columns rise (tiles 222 / 248 / 276), and its timber flume + stacks between */
  { const mx = mid / 16; if (mx > 170 && mx < 330) { const base = mb - 8 - 0;
      g.drawImage(once('flume', bakeFlume), sxOf(235 * 16, 0.3) - 32, base - 38); g.drawImage(once('spar', bakeSpar), sxOf(290 * 16, 0.3) - 48, base - 126 + 2);
      g.drawImage(once('ls0', () => bakeLogStack(0)), sxOf(258 * 16, 0.3) - 18, base - 20); g.drawImage(once('ls1', () => bakeLogStack(1)), sxOf(266 * 16, 0.3) - 18, base - 22);
      g.drawImage(once('rack', bakeDryRack), sxOf(276 * 16, 0.3) - 15, base - 17);
      g.drawImage(once('bunk', bakeBunk), sxOf(222 * 16, 0.3) - 34, base - 32); g.drawImage(once('mill', bakeMill), sxOf(248 * 16, 0.3) - 80, base - 64); } }
  /* the mist: a pale bank along the mid foot - the ford's cool drift and the tarn's thick fog (it moves) */
  { const w = weights(mid / 16), k = w[1] * 0.6 + w[4] * 1.0, ph = Math.sin(time * 0.15) * 14; if (k > 0.03) { g.globalAlpha = Math.min(1, k); g.drawImage(once('mistA', () => bakeMist('222,234,240')), 0, 0, 1, 48, Math.round(ph) - 14, mb - 56, VW + 28, 48); g.globalAlpha = 1; } }
}

/* ---------------- NEAR (0.55): the trunks you walk past, and the boughs overhead ---------------- */
function bakeNearTrunk(seed) {
  const r = mulberry(seed * 3 + 5), [c, g] = canvas(18, 256), cx = 9, w0 = 3 + (seed % 3);
  for (let y = 0; y < 256; y++) { const w = w0 + (y > 236 ? (y - 236) * 0.3 : 0), xl = Math.round(cx - w), wd = Math.round(w * 2); R(g, '#5a4332', xl, y, wd, 1); R(g, '#8a6848', xl, y, 1, 1); R(g, '#3a2a1e', xl + wd - 2, y, 2, 1); if (r() < 0.2) R(g, '#3a2a1e', xl + 1 + ((r() * (wd - 2)) | 0), y, 1, 2); if (r() < 0.04) R(g, '#7a5a3c', xl + 1, y, 1, 3); }
  for (let i = 0; i < 4; i++) { const by = 30 + i * 52 + ((r() * 20) | 0), d = i % 2 ? 1 : -1; for (let k = 0; k < 5; k++) R(g, '#3a2a1e', cx + d * (w0 + k), by - (k >> 1), 1, 2); }
  return c;
}
function bakeBough(seed) {   /* a drooping spray of pine needles hanging from the top of the frame */
  const r = mulberry(seed * 9 + 2), [c, g] = canvas(70, 30);
  for (let i = 0; i < 40; i++) { const x = 4 + ((r() * 62) | 0), len = 6 + ((r() * 18) | 0) * (1 - Math.abs(x - 35) / 60); for (let k = 0; k < len; k++) R(g, k > len - 3 ? '#2f6048' : k < 3 ? '#5f9070' : '#427a58', x + (k >> 3) * (x < 35 ? -1 : 1), k, 1, 1); }
  R(g, '#3a2a1e', 0, 0, 70, 2); return c;
}
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  const mid = cx + VW / 2, f = 0.55, s = 78, i0 = Math.floor((mid * f - VW / 2 - 20) / s), i1 = Math.ceil((mid * f + VW / 2 + 20) / s), yoff = Math.round(VH - 256 + Math.min(76, dY * 0.17));
  for (let i = i0; i <= i1; i++) { const hs = hash(i, 41), U = i * s + (hs % 40), P = U / f, t = P / 16 + ((hs >> 8) % 25) - 12, z = zoneOf(t), sx = Math.round(VW / 2 + U - mid * f), r = (hs >> 4) % 100;
    const keep = z === 3 ? 78 : z === 0 || z === 5 ? 52 : z === 1 ? 46 : z === 4 ? 24 : 12;   /* the ridge is dense, the camp is cut back */
    if (r >= keep) continue;
    g.globalAlpha = z === 4 ? 0.55 : 0.78; g.drawImage(once('nt' + (hs % 4), () => bakeNearTrunk(hs % 4 + 1)), sx - 9, yoff);
    if (z !== 2 && z !== 4 && (hs >> 12) % 3) { g.globalAlpha = 0.9; g.drawImage(once('bo' + (hs % 3), () => bakeBough(hs % 3)), sx - 35 + ((hs >> 14) % 30) - 15, Math.min(0, Math.round(dY * 0.1 - 8)) - 2); } }
  g.globalAlpha = 1;
}
