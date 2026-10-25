// palisade_backdrop.js - THE PALISADE WOOD's OWN SKY, FAR WOOD, MID ROW, LANDMARKS and NEAR TRUNKS (claude/palisadeart). The greybox wore the shared autumn hills. This is an AUTUMN WOOD BEING WALLED IN:
//   SKY       a low gold afternoon that goes from honey to rust as the road runs toward the gate (palisade_pal.js: five places crossfading), a low sun, long slanted light through the leaves
//   FAR (0.12)  the far wood: russet / ochre / gold crowns in haze, a smoke column or two from the work camps
//   THE PALISADE LINE (0.18)  the wall under construction across the skyline: a ragged row of sharpened logs with gaps still to fill, scaffold lattices, a roofed watchtower, a half-built one, a crane
//   THE HALF-BUILT GATEHOUSE  the landmark, ON SCREEN FROM THE FIRST FRAME and growing as you come: one tower roofed, the gate's lintel up with one leaf hung, the other tower still a frame of posts and braces
//                             with workers on it, a crane arm and a log on a rope. Baked at three sizes; the rust pennant flies live
//   MID (0.30)  the place's own trees and what is stacked among them: stumps and wood-piles at the felled edge; stake pyramids, canvas lean-tos and carts in the yard; scaffold lattices and cranes at the wall;
//               siege engines and rust banners at the gatehouse; thick crowns and the palisade's raw end at the old gate
//   NEAR (0.55) a few dark trunks you walk past, leaf clusters at the top edge, drifting gold motes
// Everything static is baked once; a frame is a handful of drawImage calls.   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full)   drawNear(g, cx, cy, VW, VH, L, time, dY)
import { canvas, rect as R, mulberry } from '../px.js';
import { PAL, WOOD, ROPE, RUST, IRON, LEAF, palAt, mix, rgbStr, hash } from './palisade_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const lerp = (a, b, t) => a + (b - a) * t;
const farBase = (VH, dY) => Math.round(VH * 0.5 + dY * 0.05), midBase = (VH, dY) => Math.round(VH * 0.74 + dY * 0.12);

/* ---- a crown of leaves: pixel-mottled, lit from the up-left, a few accents (gold, red) dabbed in ---- */
function crown(g, cx, cy, rw, rh, cols, seed, acc) {
  const r = mulberry(seed);
  for (let y = -rh; y <= rh; y++) for (let x = -rw; x <= rw; x++) {
    const nx = x / rw, ny = y / rh, e = nx * nx + ny * ny, an = Math.atan2(ny, nx), wob = 1 + 0.16 * Math.sin(an * 5 + seed) + 0.09 * Math.sin(an * 11 + seed * 2);
    if (e > wob * wob) continue;
    const lit = -ny * 0.75 - nx * 0.3 + (r() - 0.5) * 1.0; let c = lit > 0.4 ? cols[2] : lit > -0.2 ? cols[1] : cols[0];
    if (acc && r() < 0.06) c = acc[(r() * acc.length) | 0];
    R(g, cx + x, cy + y, 1, 1, c); }
  for (let i = 0; i < rw * 0.6; i++) { const a = r() * 6.28, d = (0.9 + r() * 0.22), x = Math.round(cx + Math.cos(a) * rw * d), y = Math.round(cy + Math.sin(a) * rh * d); R(g, x, y, 2, 1, cols[a < 4 ? 1 : 0]); }   /* ragged leaf-tips round the rim */
}
/* a trunk: tapering, lit on the left, a fork or two */
function trunk(g, x, y0, y1, w, cols, seed) {
  const r = mulberry(seed);
  for (let y = y0; y < y1; y++) { const t = (y - y0) / Math.max(1, y1 - y0), ww = Math.round(w * (0.7 + 0.5 * t * t) + Math.sin(y * 0.11 + seed)), xl = Math.round(x - ww / 2);
    R(g, xl, y, ww, 1, cols[1]); R(g, xl, y, Math.max(1, ww >> 2), 1, cols[2]); R(g, xl + ww - Math.max(1, ww >> 2), y, Math.max(1, ww >> 2), 1, cols[0]); if (r() < 0.15) R(g, xl + 1 + ((r() * Math.max(1, ww - 2)) | 0), y, 1, 2, cols[0]); }
}
const haze = (c, h, a) => mix(c, h, a);

/* ---- THE TREES: three families of autumn crown (russet, gold, orange), each a ramp dark..lit; a place leans them toward its own mid ramp ---- */
const FAM = [['#4a1a10', '#8a3418', '#c4562a'], ['#6a4c10', '#b88426', '#e8bc4c'], ['#58220e', '#b0541c', '#e08838']];
function bakeTree(z, v, far) {
  return once('tr' + z + '_' + v + (far ? 'f' : ''), () => {
    const P = PAL[z], s = far ? 0.62 : 1, W = Math.round(130 * s), H = Math.round((far ? 190 : 270) * (0.85 + (v % 3) * 0.1)), [c, g] = canvas(W, H), r = mulberry(v * 31 + z * 7 + (far ? 99 : 0));
    const fam = FAM[(v + z) % 3], zt = PAL[z].mid, base = far ? fam.map(q => haze(q, P.far[1], 0.35)) : fam.map((q, i) => mix(q, zt[i], 0.22)), cols = far ? [haze(base[0], P.haze, 0.38), haze(base[1], P.haze, 0.34), haze(base[2], P.haze, 0.28)] : base;
    const trCols = far ? [haze('#4a2c18', P.haze, 0.5), haze('#6a4220', P.haze, 0.5), haze('#8a5a30', P.haze, 0.45)] : ['#1a0e08', '#3a2212', '#6a4426'];
    const acc = [LEAF[3], LEAF[4], LEAF[2], v % 3 === 0 ? LEAF[5] : LEAF[3]].map(q => far ? haze(q, P.haze, 0.5) : q), tx = W >> 1, tw = Math.round((far ? 5 : 9) + (v % 3) * (far ? 1 : 2));
    trunk(g, tx, Math.round(H * 0.42), H, tw, trCols, v + 5);
    const rw = Math.round((far ? 34 : 54) + (v % 4) * (far ? 3 : 5)), rh = Math.round(rw * 0.62);
    /* two boughs and three crowns */
    const crowns = [[0, Math.round(H * 0.3), 1], [-Math.round(rw * 0.6), Math.round(H * 0.42), 0.7], [Math.round(rw * 0.6), Math.round(H * 0.4), 0.72]];
    for (const [dx, cyy, k] of crowns) { if (dx) for (let q = 0; q < 14; q++) R(g, tx + Math.round(dx * q / 14), Math.round(lerp(H * 0.55, cyy + 6, q / 14)), Math.max(1, tw >> 1), 2, trCols[1]);
      crown(g, tx + dx, cyy, Math.round(rw * k), Math.round(rh * k), cols, v * 13 + dx + z, acc); }
    return c; });
}
/* ---- the PALISADE LINE: a baked strip (480 x 130), baseline at its foot ---- */
const LINE_W = 480, LINE_H = 130;
function bakeLine(tone) {
  return once('line' + tone, () => {
    const [c, g] = canvas(LINE_W, LINE_H), r = mulberry(404), hz = PAL[tone].haze, k = 0.42, base = LINE_H - 2;
    const wood = ['#3a2616', '#5a3a1e', '#8a5e32', '#b08648'].map(q => haze(q, hz, k)), fresh = ['#7a5428', '#b88a48', '#dcb068', '#f0d090'].map(q => haze(q, hz, k * 0.8)), rope = haze(ROPE[1], hz, k), dark = haze('#1e120a', hz, 0.3);
    /* THE LINE: a stake every 5 px, 26-34 high, sharp; whole stretches are still gaps (to be filled) and a stretch is only half-height (the work this week) */
    const gaps = [[84, 112], [214, 262], [352, 398]];
    for (let x = 0; x < LINE_W; x += 5) { if (gaps.some(([a, b]) => x >= a && x < b)) continue; const half = x > 150 && x < 214 && ((x / 5) | 0) % 2 === 0, hgt = (half ? 14 : 28) + ((hash(x, 3) >> 4) % 7), isF = x > 262;
      const C = isF ? fresh : wood; R(g, x, base - hgt, 4, hgt, C[2]); R(g, x, base - hgt, 1, hgt, C[3]); R(g, x + 3, base - hgt, 1, hgt, C[1]); R(g, x + 1, base - hgt - 3, 2, 3, C[2]); R(g, x + 1, base - hgt - 5, 1, 2, C[3]); }
    for (const ry of [8, 17]) { R(g, 0, base - ry, LINE_W, 2, rope); for (const [a, b] of gaps) R(g, a, base - ry, b - a, 2, 'rgba(0,0,0,0)'); g.clearRect(0, 0, 0, 0); }   /* the rails lashed across */
    for (const [a, b] of gaps) { g.clearRect(a, base - 20, b - a, 20); }
    /* the lattices that stand in the gaps: posts, braces, a rope */
    for (const [a, b] of gaps) { for (let x = a; x <= b; x += 14) R(g, x, base - 44, 3, 44, wood[1]); for (let x = a; x < b - 14; x += 14) { for (let q = 0; q < 44; q++) { const t = q / 44; R(g, Math.round(x + (((x / 14) | 0) % 2 ? 1 - t : t) * 14), base - q - 1, 2, 1, wood[0]); } }
      R(g, a, base - 44, b - a, 3, wood[2]); R(g, a, base - 22, b - a, 2, wood[1]); }
    /* WATCHTOWERS: [x, built] - a roofed one, a half-built one, a frame */
    const tower = (x, state) => { const w = 34, top = base - 78; R(g, x, top + 30, 3, 48, wood[1]); R(g, x + w - 3, top + 30, 3, 48, wood[1]);
      if (state === 'roofed') { R(g, x - 3, top + 20, w + 6, 12, wood[2]); R(g, x - 3, top + 20, w + 6, 2, wood[3]); for (let k = 0; k < 8; k++) R(g, x + 1 + k * 4, top + 22, 2, 8, wood[0]); for (let q = 0; q < 14; q++) R(g, x - 6 + q, top + 19 - q, w + 12 - q * 2, 1, q < 3 ? RUST[2] : RUST[1]); R(g, x + (w >> 1), top - 4, 1, 14, dark); R(g, x + (w >> 1) + 1, top - 3, 8, 4, RUST[2]); }
      else { R(g, x - 2, top + 34, w + 4, 3, wood[2]); for (let q = 0; q < 6; q++) { R(g, x + 3 + q * 5, top + 14, 2, 20, wood[1]); } R(g, x + 1, top + 12, w - 2, 3, fresh[2]); for (let q = 0; q < 20; q++) R(g, x + 3 + Math.round(q * (w - 6) / 20), top + 34 - q, 2, 1, wood[0]); if (state === 'crane') { R(g, x + w - 4, top - 14, 2, 28, wood[1]); R(g, x + w - 4, top - 14, 26, 2, wood[2]); R(g, x + w + 20, top - 12, 1, 18, rope); R(g, x + w + 17, top + 6, 8, 4, fresh[2]); } }
      for (let q = 0; q < 5; q++) { R(g, x + 6 + q * 5, top + 45, 2, 2, dark); }   /* ladder rungs / gaps */ };
    tower(28, 'roofed'); tower(182, 'half'); tower(412, 'crane');
    /* smoke from a camp behind the line: pale wisps */
    g.globalAlpha = 0.28; for (let q = 0; q < 14; q++) R(g, 150 + Math.round(Math.sin(q * 0.5) * 4), base - 60 - q * 4, 6 + (q >> 1), 4, haze('#d8c0a0', hz, 0.4)); g.globalAlpha = 1;
    return c; });
}
/* ---- THE HALF-BUILT GATEHOUSE: procedural at unit u (so the three sizes are all hand-snapped), ~126 x 124 at u = 1; the baseline is the foot ---- */
function bakeGate(tone, u) {
  return once('gate' + tone + '_' + u, () => {
    const W = Math.round(140 * u), H = Math.round(140 * u), [c, g] = canvas(W, H), hz = PAL[tone].haze, k = 0.3, base = H - 1, X = v => Math.round(v * u);
    const wood = ['#2e1c10', '#52341c', '#8a5e32', '#b08648'].map(q => haze(q, hz, k)), fresh = ['#7a5428', '#b88a48', '#dcb068', '#f0d090'].map(q => haze(q, hz, k * 0.7)), dark = haze('#140c06', hz, 0.2), rope = haze(ROPE[1], hz, k);
    const rect = (x, y, w, h, col) => R(g, X(x), base - X(y) - Math.max(1, X(h)) + 1, Math.max(1, X(w)), Math.max(1, X(h)), col);
    /* the left tower: hewn courses, roofed, an arrow slit, a pennant pole */
    rect(4, 0, 38, 92, wood[2]); for (let y = 0; y < 92; y += 6) { rect(4, y, 38, 1, wood[1]); rect(4, y + 5, 38, 1, wood[3]); } rect(4, 0, 2, 92, wood[3]); rect(40, 0, 2, 92, wood[0]);
    for (let y = 0; y < 92; y += 12) for (const x of [2, 40]) rect(x, y, 4, 3, y % 24 ? fresh[2] : wood[3]);   /* the notched log-ends at the corners */
    rect(18, 54, 4, 14, dark); rect(10, 30, 22, 3, wood[0]);
    rect(0, 92, 46, 4, wood[1]); rect(0, 95, 46, 1, wood[3]);
    for (let q = 0; q < 26; q++) rect(-4 + q, 96 + q, 54 - q * 2, 1, q < 3 ? RUST[2] : q % 6 < 3 ? RUST[1] : RUST[0]);   /* the roof: rust shingles */
    rect(22, 122, 1, 14, dark); rect(23, 130, 14, 6, RUST[2]); rect(23, 130, 14, 2, haze('#f08a5a', hz, k));
    /* the gate between: posts, the lintel, one leaf hung with iron straps, the other leaf not yet, a log on a rope */
    rect(46, 0, 7, 70, wood[1]); rect(46, 0, 2, 70, wood[3]); rect(80, 0, 7, 70, wood[1]); rect(80, 0, 2, 70, wood[3]);
    rect(42, 70, 49, 9, wood[2]); rect(42, 77, 49, 2, wood[3]); rect(42, 70, 49, 1, wood[0]); for (let x = 46; x < 88; x += 8) rect(x, 71, 2, 6, wood[0]);
    rect(53, 4, 14, 66, wood[2]); for (let y = 4; y < 70; y += 5) rect(53, y, 14, 1, wood[1]); rect(53, 20, 14, 3, IRON[1]); rect(53, 48, 14, 3, IRON[1]); for (const y of [21, 49]) rect(56, y, 1, 1, IRON[3]);
    rect(67, 0, 13, 69, dark); rect(70, 0, 1, 40, wood[0]);
    rect(70, 79, 1, 12, rope); rect(66, 66, 9, 5, fresh[2]); rect(66, 70, 9, 1, wood[0]);   /* a log hanging on its rope from the crane */
    /* the right tower: still a frame - four posts, X braces, two decks, a ladder, a crane arm with a pulley, three workers */
    for (const x of [96, 110, 124]) rect(x, 0, 4, 84, wood[1]); for (const x of [96, 110, 124]) rect(x, 0, 1, 84, wood[3]);
    for (const [y0, y1] of [[0, 30], [30, 58]]) for (const [xa, xb] of [[96, 110], [110, 124]]) for (let q = 0; q <= 14; q++) rect(xa + q, y0 + Math.round((q * (y1 - y0)) / 14), 2, 2, wood[0]);
    rect(94, 30, 34, 3, fresh[2]); rect(94, 32, 34, 1, wood[0]); rect(94, 58, 34, 3, fresh[2]); rect(94, 60, 34, 1, wood[0]);
    rect(94, 84, 34, 3, fresh[1]); for (let y = 0; y < 30; y += 3) rect(100, y, 6, 1, rope);
    rect(122, 84, 3, 30, wood[1]); rect(100, 112, 28, 2, wood[2]); rect(100, 100, 1, 12, rope); rect(98, 94, 5, 6, fresh[3]);   /* the crane arm and its load */
    for (const [wx, wy] of [[100, 33], [112, 33], [104, 61]]) { rect(wx, wy, 3, 5, dark); rect(wx, wy + 5, 3, 2, RUST[1]); }
    /* a stack of logs and a cart at the foot */
    for (let i = 0; i < 3; i++) for (let j = 0; j <= 2 - i; j++) rect(2 + j * 8 + i * 4, i * 5, 8, 5, j % 2 ? fresh[2] : wood[2]);
    g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(' + rgbStr(hz) + ',0.04)'); gr.addColorStop(1, 'rgba(' + rgbStr(hz) + ',0.34)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
    return c; });
}
/* ---- the mid row's own things (each baked small) ---- */
function bakeProp(kind, z, v) {
  return once('pp' + kind + z + v, () => {
    const P = PAL[z], hz = P.haze, k = 0.22, wood = ['#26160c', '#4a2e18', '#7a5230', '#a07644'].map(q => haze(q, hz, k)), fresh = ['#7a5428', '#b88a48', '#dcb068', '#f0d090'].map(q => haze(q, hz, k * 0.6)), dark = haze('#140c06', hz, 0.15), rope = haze(ROPE[1], hz, k);
    const [c, g] = canvas(130, 110), r = mulberry(v * 17 + z * 3 + kind.length), B = 108;
    if (kind === 'stump') { const w = 22 + (v % 3) * 6; R(g, 60 - w / 2, B - 22, w, 22, wood[1]); R(g, 60 - w / 2, B - 22, 3, 22, wood[2]); R(g, 60 + w / 2 - 3, B - 22, 3, 22, wood[0]); for (let q = 0; q < w; q++) R(g, 60 - w / 2 + q, B - 26 - Math.round(Math.sin(q / w * 3.14) * 3), 1, 6, fresh[2]); R(g, 60 - 6, B - 25, 12, 1, fresh[0]); R(g, 60 - 3, B - 24, 6, 1, fresh[3]);
      R(g, 60 + w / 2, B - 6, 8, 3, wood[1]); R(g, 60 - w / 2 - 8, B - 5, 8, 3, wood[1]); R(g, 60 + w / 2 - 6, B - 40, 2, 18, wood[0]); R(g, 60 + w / 2 - 12, B - 42, 9, 4, IRON[2]); }   /* a stump with an axe left in it */
    else if (kind === 'logpile') { for (let i = 0; i < 4; i++) for (let j = 0; j < 6 - i; j++) { const x = 18 + j * 11 + i * 5, y = B - 9 - i * 9, col = (i + j) % 3 ? wood[2] : fresh[2]; R(g, x - 5, y - 5, 10, 10, wood[0]); R(g, x - 4, y - 4, 8, 8, col); R(g, x - 2, y - 2, 4, 4, fresh[3]); R(g, x - 1, y - 1, 2, 2, wood[1]); } R(g, 14, B - 2, 100, 2, wood[0]); }
    else if (kind === 'stakes') { for (let i = 0; i < 17; i++) { const lean = (i - 8) * 1.1, x0 = 64 + lean * 2, len = 70 - Math.abs(i - 8) * 2.4; for (let q = 0; q < len; q++) R(g, Math.round(64 + (i - 8) * 3.2 + lean * q / len * 6 - 1), B - q, 3, 1, q > len - 6 ? fresh[3] : i % 2 ? fresh[2] : fresh[1]); }
      R(g, 40, B - 22, 50, 2, rope); R(g, 44, B - 44, 42, 2, rope); R(g, 30, B - 3, 70, 3, wood[0]); }
    else if (kind === 'tent') { for (let q = 0; q < 40; q++) { const w = Math.round((q / 40) * 54); R(g, 64 - w, B - 40 + q, w * 2, 1, q % 8 < 4 ? RUST[1] : haze('#d8b878', hz, 0.2)); R(g, 64 - w, B - 40 + q, 2, 1, RUST[2]); } R(g, 63, B - 46, 2, 8, wood[1]); R(g, 64, B - 44, 14, 5, RUST[2]); R(g, 56, B - 14, 16, 14, dark); R(g, 14, B - 2, 100, 1, rope); R(g, 8, B - 4, 2, 4, wood[1]); R(g, 118, B - 4, 2, 4, wood[1]); }
    else if (kind === 'cart') { R(g, 24, B - 26, 62, 6, wood[2]); R(g, 24, B - 26, 62, 1, wood[3]); R(g, 24, B - 32, 3, 8, wood[1]); R(g, 83, B - 32, 3, 8, wood[1]); for (let i = 0; i < 4; i++) { R(g, 30 + i * 13, B - 40, 10, 10, wood[0]); R(g, 31 + i * 13, B - 39, 8, 8, i % 2 ? fresh[2] : wood[2]); R(g, 33 + i * 13, B - 37, 4, 4, fresh[3]); } R(g, 40, B - 20, 22, 2, wood[0]);
      for (const wx of [38, 72]) { for (let a = 0; a < 24; a++) { const t = a / 24 * 6.283; R(g, Math.round(wx + Math.cos(t) * 11), Math.round(B - 12 + Math.sin(t) * 11), 2, 2, wood[0]); } R(g, wx - 1, B - 13, 3, 3, wood[3]); for (let a = 0; a < 3; a++) { const t = a * 1.047; for (let q = -10; q <= 10; q += 2) R(g, Math.round(wx + Math.cos(t) * q), Math.round(B - 12 + Math.sin(t) * q), 1, 1, wood[1]); } } R(g, 92, B - 22, 22, 2, wood[1]); }
    else if (kind === 'scaffold') { const h = 84 + (v % 3) * 8; for (const x of [34, 74]) R(g, x, B - h, 4, h, wood[1]); for (const x of [34, 74]) R(g, x, B - h, 1, h, wood[3]); for (let y = 0; y < h - 14; y += 28) for (let q = 0; q <= 40; q++) R(g, 38 + q, B - y - Math.round(q * 28 / 40) - 2, 2, 2, wood[0]);
      for (const y of [h - 34, h - 4]) { R(g, 26, B - y, 60, 3, fresh[2]); R(g, 26, B - y + 2, 60, 1, wood[0]); } R(g, 30, B - h + 4, 52, 2, rope); R(g, 56, B - h, 1, 16, rope); R(g, 53, B - h + 14, 7, 5, fresh[2]);
      R(g, 36, B - h + 30, 3, 5, dark); R(g, 36, B - h + 35, 3, 2, RUST[1]); }
    else if (kind === 'crane') { R(g, 30, B - 100, 5, 100, wood[1]); R(g, 30, B - 100, 1, 100, wood[3]); R(g, 30, B - 100, 70, 4, wood[2]); R(g, 30, B - 100, 70, 1, wood[3]); for (let q = 0; q < 28; q++) R(g, 35 + q, B - 76 + q - 28 + 20, 2, 2, wood[0]); R(g, 96, B - 98, 1, 38, rope); R(g, 90, B - 62, 13, 6, fresh[2]); R(g, 90, B - 57, 13, 1, wood[0]); R(g, 24, B - 4, 18, 4, wood[0]); }
    else if (kind === 'trebuchet') { R(g, 20, B - 3, 90, 3, wood[0]); for (const x of [34, 76]) for (let q = 0; q <= 56; q++) { R(g, x + Math.round(q * 0.35), B - q, 3, 1, wood[1]); R(g, x + 22 - Math.round(q * 0.35), B - q, 3, 1, wood[2]); } R(g, 40, B - 58, 40, 4, wood[2]);
      for (let q = 0; q < 70; q++) R(g, 54 - Math.round(q * 0.52), B - 58 - Math.round(q * 0.62), 3, 2, wood[2]); R(g, 14, B - 100, 14, 14, wood[0]); R(g, 16, B - 98, 10, 10, IRON[1]); R(g, 16, B - 98, 10, 1, IRON[3]);
      for (let q = 0; q < 40; q++) R(g, 54 + Math.round(q * 0.4), B - 58 + Math.round(q * 0.1), 1, 2, rope); R(g, 70, B - 56, 8, 8, wood[1]); }
    else if (kind === 'ramshed') { R(g, 18, B - 36, 80, 30, wood[2]); for (let y = 0; y < 30; y += 5) R(g, 18, B - 36 + y, 80, 1, wood[1]); R(g, 18, B - 36, 80, 2, wood[3]); for (let q = 0; q < 16; q++) R(g, 12 + q, B - 36 - q, 92 - q * 2, 1, q < 2 ? RUST[2] : q % 5 < 3 ? RUST[1] : RUST[0]);
      R(g, 28, B - 6, 14, 14, wood[0]); R(g, 29, B - 5, 12, 12, wood[1]); R(g, 74, B - 6, 14, 14, wood[0]); R(g, 75, B - 5, 12, 12, wood[1]); R(g, 98, B - 20, 22, 8, wood[2]); R(g, 112, B - 22, 8, 12, IRON[1]); R(g, 112, B - 22, 8, 1, IRON[3]); }
    else if (kind === 'banner') { R(g, 62, B - 90, 3, 90, wood[1]); R(g, 62, B - 90, 1, 90, wood[3]); R(g, 65, B - 88, 28, 22, RUST[1]); R(g, 65, B - 88, 28, 2, RUST[2]); for (let i = 0; i < 4; i++) R(g, 65 + i * 7, B - 66, 4, 4, RUST[1]); R(g, 72, B - 82, 10, 8, haze('#e8c070', hz, 0.2)); R(g, 75, B - 80, 4, 4, RUST[0]); }
    else if (kind === 'fruit') { trunk(g, 60, B - 44, B, 7, ['#26160c', '#4a2e18', '#7a5230'].map(q => haze(q, hz, k)), v); crown(g, 60, B - 62, 40, 28, [haze(P.mid[0], hz, 0.1), haze(P.mid[1], hz, 0.1), haze(P.mid[2], hz, 0.05)], v * 5, [haze('#c0402a', hz, 0.1), haze('#d86030', hz, 0.1), haze(LEAF[4], hz, 0.1)]);
      for (let i = 0; i < 8; i++) R(g, 34 + ((r() * 52) | 0), B - 40 - ((r() * 40) | 0), 3, 3, '#c0402a'); }
    else if (kind === 'gatearch') { for (const x of [18, 96]) { R(g, x, B - 100, 14, 100, wood[1]); R(g, x, B - 100, 3, 100, wood[3]); for (let y = 0; y < 100; y += 12) R(g, x, B - y, 14, 1, wood[0]); } R(g, 12, B - 108, 108, 12, wood[2]); R(g, 12, B - 108, 108, 2, wood[3]); for (let x = 20; x < 110; x += 10) R(g, x, B - 96, 3, 6, wood[0]);
      for (let q = 0; q < 50; q++) R(g, 32 + (q >> 1), B - 96 + Math.round(Math.sin(q * 0.4) * 2), 1, 6 + (q % 5), haze('#5a7a2a', hz, 0.3)); }   /* the old gate: grown over with vine */
    return c; });
}
/* the places' mid props and their spacing / density: [kind, share] */
const MIDSET = [
  [['stump', 3], ['logpile', 2], ['fruit', 2], ['tent', 0]],
  [['stakes', 3], ['tent', 3], ['cart', 2], ['logpile', 1], ['stump', 1]],
  [['scaffold', 4], ['crane', 2], ['stakes', 1], ['logpile', 1]],
  [['trebuchet', 3], ['ramshed', 2], ['banner', 3], ['cart', 1]],
  [['banner', 1], ['stakes', 2], ['logpile', 1]],
];
const pickProp = (z, hs) => { const set = MIDSET[z], tot = set.reduce((a, q) => a + q[1], 0); let n = (hs >>> 4) % tot; for (const [k, w] of set) { if (n < w) return k; n -= w; } return set[0][0]; };

/* ---- placement: a deterministic list of world-anchored items on a parallax layer ---- */
function row(cx, VW, f, s, salt) {
  const out = [], mid = cx + VW / 2, i0 = Math.floor((mid * f - VW / 2 - 90) / s), i1 = Math.ceil((mid * f + VW / 2 + 90) / s);
  for (let i = i0; i <= i1; i++) { const hs = hash(i, salt), U = i * s + (hs % Math.max(2, s >> 1)); out.push({ sx: Math.round(VW / 2 + U - mid * f), hs }); }
  return out;
}
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const progress = (cx, VW, L) => Math.max(0, Math.min(1, (cx + VW / 2) / Math.max(1, ((L && L.W) || 443) * 16 - VW / 2)));
/* the SKY gradient and a low sun */
function sky(g, A, cx, VW, VH, k, time) {
  const c0 = mix(A.P.sky[0], A.Q.sky[0], A.k), c1 = mix(A.P.sky[1], A.Q.sky[1], A.k), c2 = mix(A.P.sky[2], A.Q.sky[2], A.k);
  const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, c0); gr.addColorStop(0.55, c1); gr.addColorStop(0.88, c2); gr.addColorStop(1, mix(c2, A.P.s[3], 0.35)); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  const sx = Math.round(VW * 0.24 - cx * 0.02), sy = Math.round(VH * 0.5 - 6 * k), sg = g.createRadialGradient(sx, sy, 0, sx, sy, 150); sg.addColorStop(0, 'rgba(255,224,150,0.5)'); sg.addColorStop(0.35, 'rgba(255,190,110,0.18)'); sg.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = sg; g.fillRect(sx - 150, sy - 150, 300, 300);
  g.fillStyle = 'rgba(255,238,190,0.85)'; g.beginPath(); g.arc(sx, sy, 10, 0, 7); g.fill(); g.fillStyle = 'rgba(255,214,140,0.6)'; g.beginPath(); g.arc(sx, sy, 14, 0, 7); g.fill();
  /* slow slanted light through the leaves */
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) { const x0 = ((i * 120 - cx * 0.06 + Math.sin(time * 0.05 + i) * 12) % (VW + 160) + VW + 160) % (VW + 160) - 70, w = 16 + i * 6; g.globalAlpha = 0.07 + 0.025 * Math.sin(time * 0.3 + i * 2);
    g.fillStyle = '#ffd890'; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + w, 0); g.lineTo(x0 + w - 70, VH); g.lineTo(x0 - 70, VH); g.fill(); }
  g.restore(); g.globalAlpha = 1;
}

/* where the gatehouse stood this frame (the live pennant and the crew's smoke are drawn over it by PWH.drawSky: src/palisade-hands.js) */
let LM = null;
export function drawLive(g, time) {
  if (!LM) return; const u = LM.w / 140 / (1 / 1), hz = LM.haze;
  /* the rust pennant on the roofed tower, fluttering: a flag of five ragged strips */
  const fx = LM.x + Math.round(23 * u), fy = LM.y + Math.round(4 * u);
  for (let i = 0; i < 14; i++) { const w = Math.sin(time * 5 - i * 0.5) * (1 + i * 0.12); g.fillStyle = i % 5 === 4 ? RUST[0] : RUST[2]; g.fillRect(fx + Math.round(i * u * 1.1), fy + Math.round(w) + (i > 9 ? 1 : 0), Math.max(1, Math.round(u * 1.2)), Math.max(2, Math.round(7 * u - i * 0.3))); }
  /* the smoke of the crew's fire: pale squares rising and thinning */
  g.globalAlpha = 0.2; for (let q = 0; q < 8; q++) { const t = (time * 0.12 + q * 0.125) % 1, sz = 3 + Math.round(t * 7 * u); g.fillStyle = mix('#e8d0b0', hz, 0.4); g.fillRect(LM.x + Math.round(LM.w * 0.82 + Math.sin(time * 0.6 + q) * 4 + t * 16), LM.y + Math.round(LM.h * 0.9 - t * 70 * u), sz, sz); } g.globalAlpha = 1;
}
/* ---- the frame ---- */
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  const tM = (cx + VW / 2) / 16, A = palAt(tM), z = A.z, nz = A.nz, seam = A.k > 0.02, fb = farBase(VH, dY), mb = midBase(VH, dY), k = progress(cx, VW, L);
  sky(g, A, cx, VW, VH, k, time);
  /* FAR WOOD (0.12) */
  if (full) for (const [zz, al] of seam ? [[z, 1 - A.k], [nz, A.k]] : [[z, 1]]) { g.globalAlpha = al;
    for (const o of row(cx, VW, 0.12, 44, 13)) { if ((o.hs >>> 5) % 100 >= 86) continue; const sp = bakeTree(zz, o.hs % 6, true); g.drawImage(sp, o.sx - (sp.width >> 1), fb - sp.height + 52 + (o.hs % 9)); } }
  g.globalAlpha = 1; g.fillStyle = mix(A.P.haze, A.P.s[2], 0.35); g.globalAlpha = 0.5; g.fillRect(0, fb + 44, VW, VH - fb); g.globalAlpha = 1;
  /* THE PALISADE LINE (0.18): the wall under construction across the skyline */
  { const sp = bakeLine(z), w = LINE_W, y = fb + 26 - LINE_H + 36 - Math.round(k * 6); let x = ((-cx * 0.18) % w + w) % w; if (x > 0) x -= w; for (let xx = x; xx < VW; xx += w) g.drawImage(sp, Math.round(xx), y);
    if (seam) { g.globalAlpha = A.k; const sp2 = bakeLine(nz); for (let xx = x; xx < VW; xx += w) g.drawImage(sp2, Math.round(xx), y); g.globalAlpha = 1; } }
  /* THE HALF-BUILT GATEHOUSE (landmark): small and far from the first screen, growing and drawing nearer as you come */
  { const s = 0.55 + k * 0.7, u = s < 0.72 ? 0.55 : s < 1.0 ? 0.85 : 1.2, sp = bakeGate(z, u), ratio = s / u, gx = Math.round(VW * 0.8 - k * VW * 0.22), gy = fb + 28 - Math.round(k * 4) + Math.round((dY * 0.02));
    g.drawImage(sp, gx - Math.round(sp.width * ratio / 2), gy - Math.round(sp.height * ratio), Math.round(sp.width * ratio), Math.round(sp.height * ratio));
    LM = { x: gx - Math.round(sp.width * ratio / 2), y: gy - Math.round(sp.height * ratio), w: sp.width * ratio, h: sp.height * ratio, s: ratio * u / 1.0, haze: A.P.haze }; }
  /* a bank of the place's air between the far line and the mid row */
  { const gr = g.createLinearGradient(0, fb + 20, 0, mb); gr.addColorStop(0, 'rgba(' + rgbStr(A.P.haze) + ',0)'); gr.addColorStop(1, 'rgba(' + rgbStr(A.P.haze) + ',0.2)'); g.fillStyle = gr; g.fillRect(0, fb + 20, VW, mb - fb - 20); }
  /* MID ROW (0.30): the place's trees, and what is stacked among them (a seam draws both places) */
  for (const [zz, al] of seam ? [[z, 1 - A.k], [nz, A.k]] : [[z, 1]]) { g.globalAlpha = al;
    for (const o of row(cx, VW, 0.3, 64, 71)) { const dens = zz === 4 ? 92 : 78; if ((o.hs >>> 5) % 100 >= dens) continue; const sp = bakeTree(zz, o.hs % 6, false); g.drawImage(sp, o.sx - (sp.width >> 1), mb - sp.height + 6 - (o.hs & 3)); }
    for (const o of row(cx, VW, 0.3, 120, 233)) { if ((o.hs >>> 5) % 100 >= 82) continue; const kind = pickProp(zz, o.hs); if (zz === 0 && kind === 'tent') continue; const sp = bakeProp(kind, zz, o.hs % 3); g.drawImage(sp, o.sx - (sp.width >> 1) + 18, mb - sp.height + 12); }
    if (zz === 4) for (const o of row(cx, VW, 0.3, 700, 913)) { const sp = bakeProp('gatearch', 4, 0); g.drawImage(sp, o.sx - 60, mb - sp.height + 10); } }
  g.globalAlpha = 1;
  /* a low bank of mist laid over the mid foot */
  { const gr = g.createLinearGradient(0, mb - 40, 0, mb + 20); gr.addColorStop(0, 'rgba(' + rgbStr(A.P.haze) + ',0)'); gr.addColorStop(0.7, 'rgba(' + rgbStr(A.P.haze) + ',0.22)'); gr.addColorStop(1, 'rgba(' + rgbStr(A.P.haze) + ',0.05)'); g.fillStyle = gr; g.fillRect(0, mb - 40, VW, 60); }
}
/* the pennant on the roofed tower, drawn over the baked landmark in drawBackdrop's last pass is not needed: the baked one carries it; this flutters a second small flag on the far line */

/* ---------------- NEAR (0.55): the dark trunks you walk past, leaves along the top edge, drifting gold motes ---------------- */
function bakeNear(z, v) {
  return once('nr' + z + '_' + v, () => {
    const P = PAL[z], w = 12 + (v % 3) * 5, H = 260, [c, g] = canvas(w * 2 + 90, H), r = mulberry(v * 5 + 11), cols = ['#120a05', '#26160c', '#3e2614'].map(q => mix(q, P.s[0], 0.2));
    trunk(g, (w * 2 + 90) >> 1, 14, H, w, cols, v + 3);
    for (let i = 0; i < 5; i++) { const lx = ((w * 2 + 90) >> 1) + Math.round((r() - 0.5) * 70), ly = 4 + ((r() * 40) | 0); crown(g, lx, ly, 14 + ((r() * 12) | 0), 8 + ((r() * 7) | 0), [mix(P.mid[0], '#000', 0.4), mix(P.mid[1], '#000', 0.3), mix(P.mid[2], '#000', 0.15)], v * 9 + i, [LEAF[2], LEAF[3]]); }
    return c; });
}
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  const tM = (cx + VW / 2) / 16, A = palAt(tM), yoff = Math.round(VH - 262 + Math.min(80, dY * 0.16));
  for (const o of row(cx, VW, 0.55, 150, 41)) { if ((o.hs >>> 5) % 100 >= 52) continue; const sp = bakeNear(A.z, o.hs % 3); g.globalAlpha = 0.74; g.drawImage(sp, o.sx - (sp.width >> 1), yoff); }
  g.globalAlpha = 1;
  /* drifting gold motes in the low sun (additive) */
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 12; i++) { const hs = hash(i, 777), a = time * (0.18 + (hs % 5) * 0.04) + hs, X = ((hs % 500) - cx * 0.5 % 500 + 500) % 500 - 30 + Math.round(Math.sin(a) * 16), Y = 20 + (hs >> 4) % Math.round(VH * 0.7) + Math.round(Math.sin(a * 1.3) * 9), tw = 0.5 + 0.5 * Math.sin(time * 1.4 + hs);
    g.globalAlpha = 0.5 * tw; g.fillStyle = i % 3 ? '#ffd890' : '#ffb868'; g.fillRect(X % (VW + 30), Y, 2, 2); }
  g.restore(); g.globalAlpha = 1;
}
export { palAt, smooth };

/* ---------------- THE FOREGROUND STRIP (BG.fg, 0.3 alpha behind the actors): russet BRACKEN fronds, dry grass-heads and a few fallen leaves, not the green fern of the shared wood ---------------- */
export function bakeFG(w, h, seed) {
  const r = mulberry(seed), [c, g] = canvas(w, h), D = '#1c0c06', M = '#3a1a0c', Lt = '#6a3412', Tp = '#9a5a20';
  for (let i = 0; i < w / 16; i++) {
    const x = r() * w, base = h + 2, n = 4 + ((r() * 4) | 0), tall = 10 + r() * 10;
    for (let f = 0; f < n; f++) {
      const a = -Math.PI / 2 + (f - n / 2) * 0.4 + (r() - 0.5) * 0.2, len = tall * (0.6 + r() * 0.5);
      for (let k = 0; k < len; k++) { const t = k / len, bend = t * t * 0.7 * Math.sign(a + Math.PI / 2 || 1); R(g, Math.round(x + Math.cos(a + bend) * k), Math.round(base + Math.sin(a + bend) * k), 2, 1, f & 1 ? D : M);
        if (k > 2 && k % 3 === 0) { const s = Math.max(1, Math.round(2 + (len - k) * 0.12)), px_ = Math.round(x + Math.cos(a + bend) * k), py_ = Math.round(base + Math.sin(a + bend) * k); R(g, px_ - s, py_ - 1, s, 1, f & 1 ? M : Lt); R(g, px_ + 1, py_ - 1, s, 1, k > len * 0.6 ? Tp : Lt); } } } }
  for (let i = 0; i < w / 7; i++) { const x = (r() * w) | 0, hh = 3 + ((r() * 7) | 0); R(g, x, h - hh, 1, hh, r() < 0.5 ? D : M); if (hh > 6 && r() < 0.4) { R(g, x - 1, h - hh - 2, 3, 2, Tp); R(g, x, h - hh - 3, 1, 1, '#c89a40'); } }   /* dry grass with a seed-head */
  for (let i = 0; i < w / 60; i++) { const x = (r() * w) | 0, y = h - 3 - ((r() * 5) | 0), col = [LEAF[1], LEAF[2], LEAF[3]][(r() * 3) | 0]; R(g, x, y, 4, 2, col); R(g, x + 1, y - 1, 2, 1, mix(col, '#fff0b0', 0.35)); }   /* fallen leaves */
  return c;
}
