// art.js — every tile, prop and background layer for BRACKEN, baked once.
import { canvas, px, rect, line, circle, ellipse, fillPoly, fromGrid, outline, mulberry } from './px.js';

export const OUT = '#1b1626';
export const C = {
  grass: '#5aa33e', grassL: '#8fd160', grassD: '#3f7a2c',
  dirt: '#7a5230', dirtL: '#8f6540', dirtD: '#5e3b21', stone: '#8b8378', stoneD: '#5f5a52', stoneL: '#b3aca0',
  wood: '#8a5a32', woodL: '#a8743f', woodD: '#5c3a1d',
  vine: '#2f3d2a', thorn: '#d8d2b8', berry: '#c9463d',
  gold: '#ffd36b',
};

const T = 16;

// ---------- ground ----------
function dirtBase(g, rnd, w = T, h = T) {
  rect(g, 0, 0, w, h, C.dirt);
  for (let i = 0; i < w * h / 6; i++) {
    const x = (rnd() * w) | 0, y = (rnd() * h) | 0;
    px(g, x, y, rnd() < 0.5 ? C.dirtD : C.dirtL);
  }
  for (let i = 0; i < 2; i++) if (rnd() < 0.5) { const x = (rnd() * (w - 3)) | 0, y = (rnd() * (h - 2)) | 0; rect(g, x, y, 3, 2, C.stone); px(g, x, y, C.stoneL); px(g, x + 2, y + 1, C.stoneD); }
}
export function bakeDirt(seed) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); dirtBase(g, rnd); return c; }

// Grass-top dirt. eL/eR: air on that side → grass wraps down the edge.
export function bakeGrassTop(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  dirtBase(g, rnd);
  for (let x = 0; x < T; x++) {
    const d = 3 + (rnd() < 0.35 ? 1 : 0);
    for (let y = 0; y < d; y++) px(g, x, y, C.grass);
    px(g, x, d, ((x + d) & 1) ? C.grassD : C.dirtD);
    if (rnd() < 0.3) px(g, x, 0, C.grassL);
    if (rnd() < 0.15) px(g, x, 1, C.grassL);
  }
  for (let i = 0; i < 3; i++) { const x = (rnd() * T) | 0; px(g, x, 1 + ((rnd() * 2) | 0), C.grassD); }
  const side = (x0, dir) => { for (let y = 0; y < 10; y++) { const w = y < 4 ? 2 : y < 7 ? 1 : (rnd() < 0.5 ? 1 : 0); for (let i = 0; i < w; i++) px(g, x0 + i * dir, y, y < 2 ? C.grass : ((y + i) & 1 ? C.grass : C.grassD)); } };
  if (eL) side(0, 1); if (eR) side(T - 1, -1);
  return c;
}
// Side edges on inner dirt (air beside but not above) get a darker fringe.
export function bakeDirtEdge(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T); dirtBase(g, rnd);
  // cliff face: a darker stony strip with moss patches clinging to it
  const side = (x0, dir) => {
    for (let y = 0; y < T; y++) { px(g, x0, y, rnd() < 0.7 ? C.stoneD : C.dirtD); if (rnd() < 0.4) px(g, x0 + dir, y, C.dirtD); }
    for (let i = 0; i < 3; i++) { const y = (rnd() * 12) | 0, h = 2 + ((rnd() * 4) | 0); for (let k = 0; k < h; k++) { px(g, x0, y + k, k & 1 ? C.grassD : C.grass); if (rnd() < 0.5) px(g, x0 + dir, y + k, C.grassD); } }
    if (rnd() < 0.5) { const y = 4 + ((rnd() * 8) | 0); px(g, x0 + dir * 2, y, C.stone); px(g, x0 + dir * 3, y, C.stoneL); }
  };
  if (eL) side(0, 1); if (eR) side(T - 1, -1);
  return c;
}
// Dirt just under the grass line: a root or two curling down.
export function bakeDirtRoots(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T); dirtBase(g, rnd);
  const n = 1 + ((rnd() * 2) | 0);
  for (let i = 0; i < n; i++) {
    let x = 2 + ((rnd() * 12) | 0), y = 0; const dir = rnd() < 0.5 ? -1 : 1;
    for (let k = 0; k < 10 + ((rnd() * 5) | 0) && y < T; k++) { px(g, x, y, C.woodD); if (k < 4) px(g, x + 1, y, C.wood); if (rnd() < 0.4) x += dir; if (x < 0 || x > 15) break; y++; }
  }
  if (rnd() < 0.4) { const x = (rnd() * 12) | 0, y = 8 + ((rnd() * 6) | 0); rect(g, x, y, 3, 2, C.stone); px(g, x, y, C.stoneL); }
  return c;
}

export function bakeLog(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 1, T, 7, C.wood); rect(g, 0, 1, T, 1, C.woodL); rect(g, 0, 6, T, 2, C.woodD);
  for (let i = 0; i < 4; i++) { const x = (rnd() * T) | 0; rect(g, x, 3 + ((rnd() * 2) | 0), 2 + ((rnd() * 3) | 0), 1, C.woodD); }
  rect(g, 0, 0, T, 1, C.woodD);
  if (rnd() < 0.5) { px(g, 3, 0, C.grassD); px(g, 4, 0, C.grass); }
  return c;
}
export function bakeLogEnd(seed, right) {
  const c = bakeLog(seed); const g = c.getContext('2d');
  const x = right ? T - 4 : 0;
  rect(g, x, 1, 4, 7, C.woodL); rect(g, x + 1, 2, 2, 5, C.wood); rect(g, x + 1, 4, 2, 1, C.woodD); rect(g, right ? T - 1 : 0, 1, 1, 7, OUT);
  return c;
}

export function bakeThorns(seed) { // a bed of bramble, and thorns standing up out of it: pale, sharp and outlined - the one thing in the wood that says NOT HERE
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  for (let i = 0; i < 4; i++) { const x0 = (rnd() * T) | 0, y0 = 10 + ((rnd() * 4) | 0), x1 = (rnd() * T) | 0, y1 = 12 + ((rnd() * 3) | 0); line(g, x0, y0, x1, y1, '#4a2a24', 2); }
  rect(g, 0, 13, T, 3, '#4a2a24'); rect(g, 0, 13, T, 1, '#6a3a2a');
  for (const bx of [2, 6, 10, 14]) { const x = Math.min(14, bx + ((rnd() * 2) | 0) - 1), h = 6 + ((rnd() * 4) | 0), top = 13 - h;
    for (let r = top; r < 13; r++) { const w = 1 + Math.min(2, Math.floor((r - top) / 3)), x0 = x - (w >> 1); rect(g, x0 - 1, r, w + 2, 1, '#1b1210'); rect(g, x0, r, w, 1, r - top < 2 ? '#fff6e0' : '#d8ccb0'); }
    px(g, x, top - 1, '#1b1210'); px(g, x, top, '#ff6b6b'); }
  if (rnd() < 0.5) { const x = (rnd() * 14) | 0; rect(g, x, 11, 2, 2, C.berry); }
  return c;
}

export function bakeCrate() {
  const [c, g] = canvas(T, T);
  rect(g, 1, 1, 14, 14, C.wood);
  for (let y = 4; y < 15; y += 4) rect(g, 1, y, 14, 1, C.woodD);
  rect(g, 1, 1, 14, 1, C.woodL); rect(g, 1, 1, 1, 14, C.woodL);
  line(g, 2, 2, 13, 13, C.woodD, 1); line(g, 13, 2, 2, 13, C.woodD, 1);
  px(g, 2, 2, C.stoneD); px(g, 13, 2, C.stoneD); px(g, 2, 13, C.stoneD); px(g, 13, 13, C.stoneD);
  return outline(c, OUT);
}

// ---------- props ----------
export function bakeAcorn() {
  const rows = ['..ww..', '.wwww.', 'WWWWWW', '.bbbb.', '.bLbb.', '.bbbb.', '..bb..'];
  return outline(fromGrid(rows, { w: '#6b4a2a', W: '#4c2c17', b: '#b97a3c', L: '#e0a45f' }, 1), OUT);
}
export function bakeShrine(lit) {
  const [c, g] = canvas(20, 34);
  rect(g, 3, 28, 14, 5, C.stone); rect(g, 3, 28, 14, 1, C.stoneL); rect(g, 3, 32, 14, 1, C.stoneD);
  rect(g, 7, 14, 6, 14, C.stone); rect(g, 7, 14, 1, 14, C.stoneL); rect(g, 12, 14, 1, 14, C.stoneD);
  rect(g, 4, 6, 12, 8, C.stoneD); rect(g, 6, 7, 8, 6, lit ? C.gold : '#2a2f3d');
  if (lit) { rect(g, 8, 8, 4, 4, '#fff1c0'); }
  rect(g, 2, 4, 16, 2, C.stone); rect(g, 4, 2, 12, 2, C.stone); rect(g, 7, 0, 6, 2, C.stoneL);
  px(g, 5, 15, C.grassD); px(g, 6, 20, C.grass); px(g, 13, 17, C.grassD);
  return outline(c, OUT);
}
export function bakeGate() {
  const [c, g] = canvas(48, 52);
  const pillar = x => { rect(g, x, 12, 10, 40, C.stone); rect(g, x, 12, 2, 40, C.stoneL); rect(g, x + 8, 12, 2, 40, C.stoneD); for (let y = 16; y < 52; y += 6) rect(g, x + 2, y, 6, 1, C.stoneD); };
  pillar(2); pillar(36);
  for (let x = 0; x < 48; x++) { const t = (x - 24) / 24; const y = 12 - Math.round(10 * Math.sqrt(Math.max(0, 1 - t * t))); rect(g, x, y, 1, 14 - (y - 2), C.stone); if (x % 5 === 0) px(g, x, y + 3, C.stoneD); }
  rect(g, 0, 10, 48, 1, C.stoneL);
  for (let i = 0; i < 40; i++) { const x = (i * 37) % 48, y = 4 + (i * 13) % 20; px(g, x, y, i & 1 ? C.grass : C.grassD); }
  for (let i = 0; i < 10; i++) { const x = 4 + (i * 11) % 40; line(g, x, 14, x + (i & 1 ? 1 : -1), 22 + (i * 7) % 12, C.grassD, 1); }
  rect(g, 20, 20, 8, 6, C.gold); rect(g, 22, 22, 4, 2, '#fff1c0');
  return outline(c, OUT);
}
export function bakeSign() {
  const [c, g] = canvas(18, 18);
  rect(g, 8, 8, 2, 10, C.woodD);
  rect(g, 1, 1, 16, 8, C.wood); rect(g, 1, 1, 16, 1, C.woodL); rect(g, 1, 8, 16, 1, C.woodD);
  rect(g, 3, 3, 8, 1, C.woodD); rect(g, 3, 5, 11, 1, C.woodD);
  return outline(c, OUT);
}
export function bakeTuft(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(8, 6);
  for (let i = 0; i < 4; i++) { const x = 1 + i * 2; const h = 2 + ((rnd() * 3) | 0); line(g, x, 5, x + (rnd() < 0.5 ? -1 : 1), 5 - h, rnd() < 0.5 ? C.grass : C.grassL, 1); }
  return c;
}
export function bakeFlower(seed) {
  const rnd = mulberry(seed); const col = ['#f4d35e', '#e8788a', '#fbf6ea', '#9ec7ff'][(rnd() * 4) | 0];
  const [c, g] = canvas(5, 7); line(g, 2, 6, 2, 2, C.grassD, 1); px(g, 1, 4, C.grass);
  rect(g, 1, 1, 3, 3, col); px(g, 2, 2, '#e0a45f'); px(g, 0, 2, col); px(g, 4, 2, col); px(g, 2, 0, col);
  return c;
}
export function bakeMushroom(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(7, 7);
  const cap = rnd() < 0.5 ? C.berry : '#d9a55b';
  rect(g, 2, 3, 3, 4, '#f0e6c8'); rect(g, 0, 1, 7, 3, cap); rect(g, 1, 0, 5, 1, cap); px(g, 2, 1, '#fff1c0'); px(g, 5, 2, '#fff1c0');
  return outline(c, OUT);
}
export function bakeBush(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(26, 16);
  ellipse(g, 13, 10, 12, 6, C.grassD); ellipse(g, 9, 8, 7, 6, C.grass); ellipse(g, 17, 7, 7, 6, C.grass);
  ellipse(g, 12, 5, 6, 4, C.grassL, C.grass);
  for (let i = 0; i < 5; i++) if (rnd() < 0.6) px(g, 4 + ((rnd() * 18) | 0), 4 + ((rnd() * 8) | 0), C.berry);
  return outline(c, OUT);
}
export function bakeShadow(w, h) { const [c, g] = canvas(w * 2, h * 2); ellipse(g, w, h, w, h, 'rgba(20,20,40,0.35)'); return c; }

// ---------- background layers ----------
export function bakeSky(h, top = [104, 170, 220], bot = [205, 232, 210]) {
  const [c, g] = canvas(1, h);
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1), tt = Math.min(1, t * 1.15);
    const q = Math.round(tt * 6) / 6;
    const r = top[0] + (bot[0] - top[0]) * q, gg = top[1] + (bot[1] - top[1]) * q, b = top[2] + (bot[2] - top[2]) * q;
    px(g, 0, y, 'rgb(' + (r | 0) + ',' + (gg | 0) + ',' + (b | 0) + ')');
  }
  return c;
}
// Rolling far tree-line silhouette, tileable across w.
export function bakeFar(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const col = '#7fb0a4', colD = '#6a9c90';
  const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
  const yAt = x => { const u = x / w * Math.PI * 2; return Math.round(36 + 10 * Math.sin(u * 2 + ph[0]) + 6 * Math.sin(u * 5 + ph[1]) + 3 * Math.sin(u * 13 + ph[2])); };
  for (let x = 0; x < w; x++) {
    const y = yAt(x);
    rect(g, x, y, 1, h - y, col);
    if ((x % 7) < 2) rect(g, x, y + 4, 1, h, colD);
  }
  for (let i = 0; i < w / 6; i++) { const x = (rnd() * w) | 0; const y = yAt(x); rect(g, x, y - 3, 2, 4, col); px(g, x, y - 4, col); }
  return c;
}
// Mid canopies: round blobs with trunks.
export function bakeMid(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const col = '#4f8a5a', colD = '#3d6e46', trunk = '#385236';
  const blobs = [];
  for (let i = 0; i < w / 22; i++) blobs.push({ x: rnd() * w, y: 44 + rnd() * 30, r: 13 + rnd() * 10 });
  for (const b of blobs) for (const dx of [-w, 0, w]) rect(g, Math.round(b.x + dx) - 2, Math.round(b.y), 4, h, trunk);
  for (const b of blobs) for (const dx of [-w, 0, w]) {
    circle(g, b.x + dx, b.y, b.r, colD); circle(g, b.x + dx - 3, b.y - 4, b.r * 0.7, col, colD);
    circle(g, b.x + dx + b.r * 0.4, b.y - 2, b.r * 0.5, colD);
  }
  rect(g, 0, h - 8, w, 8, colD);
  return c;
}
// Near trees: tall dark trunks with rounded broadleaf canopies in the band the camera sees (layer y 90..190).
export function bakeNear(w, h, seed, canopy = ['#264a2f', '#2f5e3a', '#3f7a48', '#57964f']) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const trunk = '#2b3f2a', trunkL = '#3a5438', trunkD = '#1f2f20';
  const [L1, L2, L3, L4] = canopy;
  const trees = [];
  for (let i = 0; i < w / 84; i++) trees.push({ x: rnd() * w, wd: 10 + rnd() * 7, s: rnd() });
  // a lobe = a cluster of circles that reads as one rounded leaf mass with a lit top
  const lobe = (x, y, r) => {
    circle(g, x, y, r, L1);
    circle(g, x - r * 0.15, y - r * 0.25, r * 0.8, L2, L1);
    circle(g, x - r * 0.3, y - r * 0.45, r * 0.45, L3, L2);
    if (r > 8) circle(g, x - r * 0.4, y - r * 0.6, r * 0.2, L4, L3);
  };
  for (const t of trees) for (const dx of [-w, 0, w]) {
    const x = Math.round(t.x + dx), wd = Math.round(t.wd);
    rect(g, x, 0, wd, h, trunk); rect(g, x, 0, 2, h, trunkL); rect(g, x + wd - 2, 0, 2, h, trunkD);
    for (let k = 0; k < h / 5; k++) { const bx = x + 2 + ((rnd() * (wd - 4)) | 0), by = (rnd() * h) | 0; rect(g, bx, by, 1, 3 + ((rnd() * 5) | 0), rnd() < 0.5 ? trunkL : trunkD); }
    for (let k = 0; k < 3; k++) { const ky = 190 + rnd() * (h - 200); ellipse(g, x + wd / 2, ky, 2.5, 3, trunkD); px(g, (x + wd / 2) | 0, ky | 0, trunkL); }
    const cx = x + wd / 2, cy = 118 + rnd() * 10, R = 30 + rnd() * 10;
    // limbs reach out from the trunk and end inside a leaf lobe, so nothing floats
    for (let k = 0; k < 2; k++) {
      const right = (k + (t.s < 0.5 ? 1 : 0)) & 1; const y = 128 + k * 26 + rnd() * 6;
      const bx = right ? x + wd + 16 + rnd() * 10 : x - 16 - rnd() * 10, by = y - 10 - rnd() * 6;
      line(g, right ? x + wd - 1 : x + 1, y, bx, by, trunk, 3);
      lobe(bx, by - 2, 9 + rnd() * 3);
    }
    // crown: a ring of lobes around the centre, big ones low, smaller ones on top
    lobe(cx, cy + 6, R * 0.75);
    for (let k = 0; k < 5; k++) { const a = Math.PI + k * (Math.PI / 4); lobe(cx + Math.cos(a) * R * 0.85, cy + 4 + Math.sin(a) * R * 0.45, R * 0.42 + rnd() * 4); }
    for (let k = 0; k < 3; k++) lobe(cx + (k - 1) * R * 0.5 + (rnd() - 0.5) * 6, cy - R * 0.35 - rnd() * 4, R * 0.36 + rnd() * 3);
    lobe(cx - R * 0.1, cy - R * 0.62, R * 0.3);
  }
  return c;
}
// Foreground: fern fronds and grass along the bottom, a few hanging leaf clusters at the top. Drawn over everything.
export function bakeFG(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const D = '#173523', M = '#1f4a2c', Lt = '#2b6236';
  for (let i = 0; i < w / 14; i++) {
    const x = rnd() * w, base = h + 2, n = 4 + ((rnd() * 4) | 0), tall = 9 + rnd() * 9;
    for (let f = 0; f < n; f++) {
      const a = -Math.PI / 2 + (f - n / 2) * 0.38 + (rnd() - 0.5) * 0.2, len = tall * (0.6 + rnd() * 0.5);
      const ex = x + Math.cos(a) * len, ey = base + Math.sin(a) * len;
      line(g, x, base, ex, ey, f & 1 ? D : M, 2);
      for (let k = 2; k < len; k += 3) { const px_ = x + Math.cos(a) * k, py_ = base + Math.sin(a) * k; const s = 2 + (len - k) * 0.12; line(g, px_, py_, px_ + Math.cos(a + 1.2) * s, py_ + Math.sin(a + 1.2) * s, f & 1 ? M : Lt, 1); line(g, px_, py_, px_ + Math.cos(a - 1.2) * s, py_ + Math.sin(a - 1.2) * s, f & 1 ? M : Lt, 1); }
    }
  }
  for (let i = 0; i < w / 6; i++) { const x = (rnd() * w) | 0; const hh = 3 + ((rnd() * 6) | 0); line(g, x, h, x + (rnd() < 0.5 ? -1 : 1), h - hh, rnd() < 0.5 ? D : M, 1); }
  return c;
}
export function bakeSkyDusk(h) {
  const [c, g] = canvas(1, h);
  const top = [62, 40, 96], mid = [170, 84, 92], bot = [255, 160, 90];
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1); const q = Math.round(t * 8) / 8;
    const a = q < 0.55 ? top : mid, b = q < 0.55 ? mid : bot, k = q < 0.55 ? q / 0.55 : (q - 0.55) / 0.45;
    px(g, 0, y, 'rgb(' + ((a[0] + (b[0] - a[0]) * k) | 0) + ',' + ((a[1] + (b[1] - a[1]) * k) | 0) + ',' + ((a[2] + (b[2] - a[2]) * k) | 0) + ')');
  }
  return c;
}
export function bakeSun() {
  const [c, g] = canvas(40, 40);
  circle(g, 20, 20, 19, 'rgba(255,200,120,0.25)'); circle(g, 20, 20, 14, 'rgba(255,210,140,0.5)'); circle(g, 20, 20, 10, '#ffe9b0', '#ffd98a');
  return c;
}
// Sun-shaft overlay: soft diagonal light bands.
export function bakeShafts(w, h) {
  const [c, g] = canvas(w, h);
  for (let i = 0; i < 5; i++) {
    const x0 = i * (w / 5) + 20; const pts = [[x0, 0], [x0 + 26, 0], [x0 - 4, h], [x0 - 30, h]];
    g.globalAlpha = 0.07; g.fillStyle = '#fff6c8'; g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  }
  return c;
}

// Gold coin, four-frame spin (wide, mid, edge, mid).
export function bakeCoin() {
  const pal = { y: '#ffd34a', Y: '#fff1a0', d: '#c98a1c', D: '#8a5a12' };
  const f = rows => outline(fromGrid(rows, pal, 1), OUT);
  return [
    f(['.yyyy.', 'yYyyyy', 'yYdddy', 'yydddy', 'ydyyyd', '.dddd.']),
    f(['..yy..', '.Yyyd.', '.Ydyd.', '.yyyd.', '.dyyd.', '..dd..']),
    f(['..y...', '..Yd..', '..Yd..', '..yd..', '..yd..', '..d...']),
    f(['..yy..', '.Yyyd.', '.Ydyd.', '.yyyd.', '.dyyd.', '..dd..']),
  ];
}

// ---------- Marsh Wood props ----------
// Lily pad: a green disc with a notch, 24×6. Frame 2 is the sunk, darker version.
export function bakeLilyPad() {
  const mk = (col, colD, colL) => { const [c, g] = canvas(24, 7); ellipse(g, 12, 3.5, 11.5, 3, col, colD); ellipse(g, 10, 2.5, 6, 1.5, colL, col); line(g, 12, 3, 22, 1, colD, 1); px(g, 22, 0, 'rgba(0,0,0,0)'); return outline(c, OUT); };
  return [mk('#4f9a58', '#2f6e3a', '#8fd160'), mk('#3a7a48', '#264a2f', '#4f9a58')];
}
// Reed mat: a floating peat slab (its top is the platform) with reeds growing out of it. 16×16, draw 8px up.
export function bakeReeds(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 8, T, 8, '#4a3a2a'); rect(g, 0, 8, T, 2, '#6f8a3a'); rect(g, 0, 10, T, 1, '#5e4a34'); rect(g, 0, 15, T, 1, '#2f2418');
  for (let i = 0; i < 5; i++) px(g, (rnd() * T) | 0, 11 + ((rnd() * 4) | 0), rnd() < 0.5 ? '#3d3128' : '#5e4a34');
  for (let i = 0; i < 4; i++) { const x = 2 + i * 4 + ((rnd() * 2) | 0); const h = 5 + ((rnd() * 4) | 0); line(g, x, 9, x + (rnd() < 0.5 ? -1 : 1), 9 - h, rnd() < 0.5 ? '#6f8a3a' : '#8aa848', 1); if (rnd() < 0.6) rect(g, x + (rnd() < 0.5 ? -1 : 1), 9 - h - 2, 2, 3, '#6b4a2a'); }
  return c;
}
// Raft: lashed planks, 48×8.
export function bakeRaft() {
  const [c, g] = canvas(48, 8);
  rect(g, 0, 1, 48, 6, C.wood); rect(g, 0, 1, 48, 1, C.woodL); rect(g, 0, 6, 48, 1, C.woodD);
  for (let x = 6; x < 48; x += 6) rect(g, x, 1, 1, 6, C.woodD);
  for (const x of [8, 24, 40]) { rect(g, x - 1, 0, 3, 8, '#b8a888'); rect(g, x, 0, 1, 8, '#8a7a5a'); }
  return outline(c, OUT);
}
// Frog throne pad: a big lily pad, 64×10.
export function bakeThronePad() {
  const [c, g] = canvas(64, 10); ellipse(g, 32, 5, 31, 4.5, '#4f9a58', '#2f6e3a'); ellipse(g, 28, 3.5, 16, 2, '#8fd160', '#4f9a58'); line(g, 32, 5, 60, 2, '#2f6e3a', 1); return outline(c, OUT);
}
// Wooden plank for the title logo, 140×30.
export function bakePlank() {
  const [c, g] = canvas(140, 30);
  rect(g, 2, 2, 136, 26, C.wood); rect(g, 2, 2, 136, 2, C.woodL); rect(g, 2, 26, 136, 2, C.woodD); rect(g, 2, 2, 2, 26, C.woodL); rect(g, 136, 2, 2, 26, C.woodD);
  for (let i = 0; i < 9; i++) rect(g, 8 + i * 15, 6 + (i % 3) * 5, 6 + (i % 4) * 3, 1, C.woodD);
  for (const x of [8, 130]) { rect(g, x, 8, 2, 2, C.stoneD); rect(g, x, 20, 2, 2, C.stoneD); }
  return outline(c, OUT);
}
// Rain drop streaks baked once, 4×8.
export function bakeDrop() { const [c, g] = canvas(3, 8); line(g, 2, 0, 0, 7, 'rgba(200,230,255,0.75)', 1); return c; }

// ---------- world map ----------
// An overhead forest: meadows and dark woods, hills, a river with banks, and a dirt path through the nodes.
// THE COAST, above the crags: the mountain's back face runs down to a river, the river to Saltreach at its mouth, and past it
// the open sea with the reef, the wrecks and the islands the next part of the story goes out to.
function bakeCoastMap(c, g, w, h, nodes, path, rnd) {
  rect(g, 0, 0, w, h, '#2e7a88');
  for (let i = 0; i < w * h / 10; i++) px(g, (rnd() * w) | 0, (rnd() * h) | 0, rnd() < 0.5 ? '#3a8a98' : '#276e7c'); // the sea's grain
  const coast = [[w, 0], [w, h], [0, h], [0, 150], [30, 142], [58, 150], [86, 138], [112, 128], [128, 112], [150, 104], [176, 112], [200, 96], [226, 84], [252, 62], [276, 40], [300, 18], [w, 8]];
  fillPoly(g, coast.map(([x, y]) => [x, y + 6]), '#d0bc88'); fillPoly(g, coast, '#6e8a5a', '#5a7a4a'); // a beach under the land
  for (let i = 0; i < 10; i++) { const x = 170 + rnd() * 140, y = 110 + rnd() * 60; ellipse(g, x, y, 12 + rnd() * 16, 6 + rnd() * 6, '#5a7a4a', '#4a6a40'); }
  // the mountain's back face in the bottom right, with snow
  fillPoly(g, [[w, h], [200, h], [236, 150], [262, 130], [290, 138], [w, 118]], '#6f7a84', '#555e68'); fillPoly(g, [[252, 136], [262, 130], [272, 134], [266, 138]], '#e8f0f4');
  // the Long Water: from the falls down to the town
  const riv = [[270, 150], [236, 140], [206, 128], [176, 118], [152, 108]];
  for (let i = 0; i + 1 < riv.length; i++) { line(g, riv[i][0], riv[i][1], riv[i + 1][0], riv[i + 1][1], '#3a8a98', 5); line(g, riv[i][0], riv[i][1], riv[i + 1][0], riv[i + 1][1], '#7cc8c8', 2); }
  for (const [x, y] of [[268, 144], [262, 146]]) rect(g, x, y, 2, 6, '#e8f4f0'); // the falls
  // Saltreach: white houses and a bell tower at the river mouth
  for (let k = 0; k < 6; k++) { const x = 136 + k * 5 + (k % 2), y = 100 + (k % 3); rect(g, x, y, 4, 3, '#f0ece0'); rect(g, x, y - 1, 4, 1, '#4a5664'); }
  rect(g, 150, 94, 2, 7, '#8a96a0'); px(g, 150, 93, '#4a9a8a');
  // the open sea: islands, a lighthouse, the reef and its wrecks
  for (const [x, y, rx, ry] of [[46, 40, 16, 7], [96, 22, 10, 5], [150, 50, 8, 4], [22, 88, 9, 4]]) { ellipse(g, x, y + 2, rx + 2, ry + 1, '#d0bc88'); ellipse(g, x, y, rx, ry, '#6e8a5a', '#5a7a4a'); }
  rect(g, 95, 14, 2, 7, '#f0ece0'); rect(g, 95, 16, 2, 1, '#c9463d'); px(g, 95, 13, '#ffd36b'); px(g, 96, 13, '#ffd36b'); // the lighthouse
  for (let i = 0; i < 14; i++) { const x = 60 + rnd() * 70, y = 70 + rnd() * 30; px(g, x | 0, y | 0, '#e8f4f0'); } // the reef breaking
  for (const [x, y] of [[82, 80], [104, 74]]) { line(g, x, y, x + 6, y - 2, '#6e604e', 1); line(g, x + 3, y - 1, x + 3, y - 6, '#6e604e', 1); } // wrecks
  for (let i = 0; i < 24; i++) { const x = rnd() * w, y = rnd() * 90; if (y < 140) rect(g, x | 0, y | 0, 3, 1, 'rgba(232,244,240,0.5)'); } // whitecaps
  return c;
}
export function bakeMap(w, h, nodes, path, seed, style = 'wood') {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  if (style === 'crag') return bakeCragMap(c, g, w, h, nodes, path, rnd);
  if (style === 'coast') return bakeCoastMap(c, g, w, h, nodes, path, rnd);
  rect(g, 0, 0, w, h, '#4f8a3a');
  // meadow patches and dark wood regions
  for (let i = 0; i < 7; i++) ellipse(g, rnd() * w, rnd() * h, 30 + rnd() * 50, 14 + rnd() * 20, '#5e9a44', '#4f8a3a');
  for (let i = 0; i < 4; i++) ellipse(g, rnd() * w, rnd() * h, 40 + rnd() * 50, 20 + rnd() * 22, '#3f7a30', '#4f8a3a');
  for (let i = 0; i < w * h / 12; i++) px(g, (rnd() * w) | 0, (rnd() * h) | 0, rnd() < 0.5 ? '#5a9a42' : '#457a33');
  // hills top-left
  for (let i = 0; i < 4; i++) { const hx = 20 + i * 34 + rnd() * 10, hy = 26 + rnd() * 8, r = 14 + rnd() * 6; circle(g, hx, hy, r, '#5e9a44'); circle(g, hx - 3, hy - 3, r * 0.6, '#79b25a', '#5e9a44'); line(g, hx - r, hy + 2, hx + r, hy + 2, '#3f7a30', 1); }
  // river with banks, from top-right down past the pond
  const river = [[w - 34, -4], [w - 58, 40], [w - 26, 82], [w - 70, 122], [w - 44, h + 4]];
  const seg = (col, wd) => { for (let i = 0; i + 1 < river.length; i++) line(g, river[i][0], river[i][1], river[i + 1][0], river[i + 1][1], col, wd); };
  seg('#c9b27c', 13); seg('#2a5f8a', 10); seg('#3b7fae', 7); seg('#5aa6c9', 2);
  const last = nodes[2] || nodes[nodes.length - 1]; ellipse(g, last.x, last.y + 12, 30, 12, '#c9b27c'); ellipse(g, last.x, last.y + 12, 27, 10, '#2a5f8a'); ellipse(g, last.x, last.y + 12, 23, 8, '#3b7fae', '#5aa6c9'); ellipse(g, last.x - 8, last.y + 9, 8, 2, '#8fd160', '#4f9a58'); ellipse(g, last.x + 10, last.y + 14, 6, 2, '#4f9a58', '#2f6e3a');
  // trees: three sizes, lit from the top-left, denser inside the dark regions
  const tree = (x, y, r) => { circle(g, x + 1, y + 2, r, 'rgba(20,40,20,0.45)'); circle(g, x, y, r, '#2f6e3a', '#264a2f'); circle(g, x - r * 0.3, y - r * 0.35, r * 0.55, '#3f8a48', '#2f6e3a'); px(g, (x - r * 0.4) | 0, (y - r * 0.5) | 0, '#57964f'); };
  const spots = [];
  for (let i = 0; i < 110; i++) { const x = rnd() * w, y = 18 + rnd() * (h - 18); let near = false; for (const p of path) if (Math.hypot(p[0] - x, p[1] - y) < 20) near = true; for (const nd of nodes) if (Math.hypot(nd.x - x, nd.y - y) < 26) near = true; if (Math.hypot(x - (w - 50), y - 60) < 40) near = true; if (!near) spots.push([x, y, 3 + rnd() * 6]); }
  spots.sort((a, b) => a[1] - b[1]); for (const [x, y, r] of spots) tree(x, y, r);
  // flowers, rocks, stumps
  for (let i = 0; i < 40; i++) { const x = (rnd() * w) | 0, y = (rnd() * h) | 0; px(g, x, y, ['#f4d35e', '#e8788a', '#fbf6ea'][(rnd() * 3) | 0]); }
  for (let i = 0; i < 10; i++) { const x = (rnd() * w) | 0, y = (rnd() * h) | 0; rect(g, x, y, 3, 2, '#8b8378'); px(g, x, y, '#b3aca0'); }
  // path: dark edge, sand, pebbles, footprints
  for (let i = 0; i + 1 < path.length; i++) line(g, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], '#5e3b21', 8);
  for (let i = 0; i + 1 < path.length; i++) line(g, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], '#c9b27c', 5);
  for (let i = 0; i + 1 < path.length; i++) { const dx = path[i + 1][0] - path[i][0], dy = path[i + 1][1] - path[i][1], n = Math.hypot(dx, dy) / 5; for (let k = 1; k < n; k++) { const x = Math.round(path[i][0] + dx * k / n), y = Math.round(path[i][1] + dy * k / n); px(g, x + (k & 1 ? 1 : -1), y, '#8f6540'); if (k % 3 === 0) px(g, x, y + 1, '#e0d0a0'); } }
  // plank bridge where the path crosses the river
  for (let i = 0; i + 1 < path.length; i++) { const a = path[i], b = path[i + 1]; for (let k = 0; k <= 10; k++) { const x = a[0] + (b[0] - a[0]) * k / 10, y = a[1] + (b[1] - a[1]) * k / 10; for (let j = 0; j + 1 < river.length; j++) { const p = river[j], q = river[j + 1]; const t = Math.max(0, Math.min(1, ((x - p[0]) * (q[0] - p[0]) + (y - p[1]) * (q[1] - p[1])) / ((q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2))); const rx = p[0] + (q[0] - p[0]) * t, ry = p[1] + (q[1] - p[1]) * t; if (Math.hypot(rx - x, ry - y) < 4) { rect(g, Math.round(rx) - 7, Math.round(ry) - 3, 14, 6, C.wood); rect(g, Math.round(rx) - 7, Math.round(ry) - 3, 14, 1, C.woodL); rect(g, Math.round(rx) - 7, Math.round(ry) + 2, 14, 1, C.woodD); } } } }
  // each wood dresses its own corner of the map
  for (const nd of nodes) {
    const ox = nd.x, oy = nd.y;
    if (nd.id === 'marsh') { for (let i = 0; i < 9; i++) { const x = ox - 30 + rnd() * 60, y = oy + 8 + rnd() * 14; line(g, x, y, x + (rnd() < 0.5 ? -1 : 1), y - 5 - rnd() * 4, '#5a8a3a', 1); px(g, x, y - 5, '#6b4a2a'); } ellipse(g, ox + 34, oy - 6, 9, 4, '#3b7fae', '#2a5f8a'); }
    if (nd.id === 'stockade') { for (let i = 0; i < 7; i++) { const x = ox - 22 + i * 7; rect(g, x, oy + 8, 2, 7, '#5c3a1d'); px(g, x, oy + 7, '#8a5a32'); } fillPoly(g, [[ox + 18, oy + 14], [ox + 26, oy + 4], [ox + 34, oy + 14]], '#6b4a2a'); fillPoly(g, [[ox + 26, oy + 4], [ox + 34, oy + 14], [ox + 26, oy + 14]], '#3d2c1a'); px(g, ox - 30, oy + 10, '#ff9a5c'); px(g, ox - 31, oy + 9, '#ffd36b'); }
    if (nd.id === 'spore') { for (const [dx, dy, r, col] of [[-26, 12, 5, '#c9463d'], [-16, 16, 3, '#9a5aa8'], [24, 10, 6, '#c9463d'], [34, 16, 3, '#4aa0b0'], [8, 18, 3, '#9a5aa8']]) { rect(g, ox + dx - 1, oy + dy, 2, 5, '#e8e0d0'); ellipse(g, ox + dx, oy + dy, r, r * 0.6, col, '#4a2a5a'); px(g, ox + dx - 2, oy + dy - 1, '#fff6e0'); } }
    if (nd.id === 'kings') { for (let i = 0; i < 6; i++) { const x = ox - 34 + rnd() * 68, y = oy + 6 + rnd() * 16, r = 5 + rnd() * 4; circle(g, x, y, r, ['#a83a2a', '#d9782a', '#e0b040'][(rnd() * 3) | 0], '#7a2a1a'); px(g, (x - r * 0.4) | 0, (y - r * 0.5) | 0, '#f0a040'); } rect(g, ox - 3, oy - 17, 7, 4, '#e0b040'); for (const x of [-3, 0, 3]) px(g, ox + x, oy - 18, '#e0b040'); px(g, ox, oy - 15, '#c9463d'); }
    if (nd.id === 'scree') { for (const [dx, dy, w, h] of [[-30, 8, 22, 26], [-8, 4, 26, 34], [16, 10, 20, 22], [34, 6, 18, 28]]) { fillPoly(g, [[ox + dx - w / 2, oy + dy + 10], [ox + dx, oy + dy - h + 10], [ox + dx + w / 2, oy + dy + 10]], '#6a6f8a'); fillPoly(g, [[ox + dx - w / 2, oy + dy + 10], [ox + dx, oy + dy - h + 10], [ox + dx - w * 0.1, oy + dy + 10]], '#7a7f9a'); fillPoly(g, [[ox + dx - w * 0.18, oy + dy - h * 0.55 + 10], [ox + dx, oy + dy - h + 10], [ox + dx + w * 0.18, oy + dy - h * 0.55 + 10]], '#e8ecf4'); } for (let i = 0; i < 8; i++) px(g, (ox - 30 + rnd() * 60) | 0, (oy + 12 + rnd() * 8) | 0, '#a07ab8'); }
    if (nd.id === 'wood') { for (let i = 0; i < 6; i++) px(g, (ox - 20 + rnd() * 40) | 0, (oy + 10 + rnd() * 10) | 0, ['#f4d35e', '#e8788a', '#fbf6ea'][(rnd() * 3) | 0]); }
  }
  // a parchment vignette so the edges read as the edge of the map
  const vg = g.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 0.95); vg.addColorStop(0, 'rgba(60,40,20,0)'); vg.addColorStop(1, 'rgba(60,40,20,0.35)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  // node discs
  for (const nd of nodes) { circle(g, nd.x, nd.y + 1, 8, 'rgba(20,40,20,0.35)'); circle(g, nd.x, nd.y, 7, '#5e3b21'); circle(g, nd.x, nd.y, 5.5, nd.kind === 'store' ? '#e0b040' : '#c9b27c'); px(g, nd.x - 2, nd.y - 2, '#fff1c0'); }
  return c;
}
// The Crags map: grey fells, snow on the tops, peaks instead of trees, the same path and node discs.
function bakeCragMap(c, g, w, h, nodes, path, rnd) {
  rect(g, 0, 0, w, h, '#5e5e6c');
  for (let i = 0; i < 8; i++) ellipse(g, rnd() * w, 30 + rnd() * (h - 30), 30 + rnd() * 50, 12 + rnd() * 18, '#6a6a78', '#5e5e6c');
  for (let i = 0; i < 5; i++) ellipse(g, rnd() * w, 30 + rnd() * (h - 30), 26 + rnd() * 40, 10 + rnd() * 16, '#4e4e5a', '#5e5e6c');
  for (let i = 0; i < w * h / 14; i++) px(g, (rnd() * w) | 0, (rnd() * h) | 0, rnd() < 0.5 ? '#68687a' : '#525260');
  for (let i = 0; i < 60; i++) { const x = (rnd() * w) | 0, y = 20 + ((rnd() * (h - 20)) | 0); px(g, x, y, ['#7a5a8a', '#6a4a7a', '#c9b84a'][(rnd() * 3) | 0]); }
  for (let y = 0; y < 34; y++) for (let x = 0; x < w; x++) if (rnd() < (34 - y) / 34 * 0.9) px(g, x, y, (x + y) & 1 ? '#dfe8ee' : '#c9d4dc');
  const peaks = [];
  for (let i = 0; i < 40; i++) { const x = rnd() * w, y = 30 + rnd() * (h - 30); let near = false; for (const p of path) if (Math.hypot(p[0] - x, p[1] - y) < 22) near = true; for (const nd of nodes) if (Math.hypot(nd.x - x, nd.y - y) < 30) near = true; if (!near) peaks.push([x, y, 10 + rnd() * 16]); }
  peaks.sort((a, b) => a[1] - b[1]);
  for (const [x, y, r] of peaks) { fillPoly(g, [[x - r * 0.9, y + 4], [x, y - r * 1.4], [x + r * 0.9, y + 4]], '#4a4a58'); fillPoly(g, [[x - r * 0.8, y + 2], [x, y - r * 1.3], [x + r * 0.8, y + 2]], '#6a6f8a', '#5a5f7a'); fillPoly(g, [[x - r * 0.3, y - r * 0.85], [x, y - r * 1.3], [x + r * 0.3, y - r * 0.85]], '#dfe8ee'); }
  for (let i = 0; i + 1 < path.length; i++) line(g, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], '#3a3a44', 8);
  for (let i = 0; i + 1 < path.length; i++) line(g, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], '#a09a8c', 5);
  for (let i = 0; i + 1 < path.length; i++) { const dx = path[i + 1][0] - path[i][0], dy = path[i + 1][1] - path[i][1], n = Math.hypot(dx, dy) / 5; for (let k = 1; k < n; k++) { const x = Math.round(path[i][0] + dx * k / n), y = Math.round(path[i][1] + dy * k / n); if (rnd() < 0.5) px(g, x + ((rnd() * 3) | 0) - 1, y + ((rnd() * 3) | 0) - 1, '#6a6f8a'); } }
  for (const nd of nodes) { const ox = nd.x, oy = nd.y;
    if (nd.id === 'scree') { for (const [dx, dy] of [[-26, 10], [-10, 14], [12, 12], [28, 8]]) { rect(g, ox + dx, oy + dy, 5, 3, '#8a8478'); px(g, ox + dx + 1, oy + dy - 1, '#a8a090'); } for (let i = 0; i < 5; i++) px(g, (ox - 20 + rnd() * 40) | 0, (oy + 6 + rnd() * 12) | 0, '#c9b84a'); }
    if (nd.kind === 'pass') { fillPoly(g, [[ox - 22, oy + 12], [ox - 12, oy - 8], [ox - 2, oy + 12]], '#4a4a58'); fillPoly(g, [[ox + 2, oy + 12], [ox + 12, oy - 8], [ox + 22, oy + 12]], '#4a4a58'); } }
  const vg = g.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 0.95); vg.addColorStop(0, 'rgba(20,20,40,0)'); vg.addColorStop(1, 'rgba(20,20,40,0.45)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  for (const nd of nodes) { circle(g, nd.x, nd.y + 1, 8, 'rgba(20,20,40,0.35)'); circle(g, nd.x, nd.y, 7, '#3a3a44'); circle(g, nd.x, nd.y, 5.5, nd.kind === 'pass' ? '#dfe8ee' : '#c9b27c'); px(g, nd.x - 2, nd.y - 2, '#fff1c0'); }
  return c;
}
// Soft cloud puffs for level skies and the map, three sizes.
export function bakeClouds() {
  return [[28, 10], [40, 13], [56, 16]].map(([w, h], i) => {
    const [c, g] = canvas(w, h + 2);
    ellipse(g, w * 0.5, h * 0.7, w * 0.48, h * 0.32, 'rgba(255,255,255,0.85)');
    ellipse(g, w * 0.35, h * 0.5, w * 0.24, h * 0.42, 'rgba(255,255,255,0.9)');
    ellipse(g, w * 0.62, h * 0.45, w * 0.22, h * 0.4, 'rgba(255,255,255,0.9)');
    ellipse(g, w * 0.5, h * 0.85, w * 0.42, h * 0.2, 'rgba(200,215,235,0.7)');
    return c;
  });
}
// A tiny signpost for map node labels, 10×12.
export function bakeMapSign() { const [c, g] = canvas(10, 12); rect(g, 4, 5, 2, 7, C.woodD); rect(g, 0, 0, 10, 6, C.wood); rect(g, 0, 0, 10, 1, C.woodL); rect(g, 2, 2, 6, 1, C.woodD); return outline(c, OUT); }
// A little fish, 5×3, silver.
export function bakeFish() { const [c, g] = canvas(6, 4); rect(g, 1, 1, 3, 2, '#c9d1dc'); px(g, 0, 0, '#9aa39a'); px(g, 0, 3, '#9aa39a'); px(g, 4, 1, '#dfe8ff'); px(g, 2, 1, '#2a2f3d'); return c; }
// A hut for the store node, 20×18.
export function bakeHut() {
  const [c, g] = canvas(20, 18);
  fillPoly(g, [[10, 0], [19, 8], [1, 8]], '#8f2f28'); fillPoly(g, [[10, 1], [17, 7], [3, 7]], '#c9463d');
  rect(g, 3, 8, 14, 9, C.wood); rect(g, 3, 8, 14, 1, C.woodL); rect(g, 8, 11, 4, 6, C.woodD); rect(g, 13, 11, 2, 2, '#ffd36b');
  rect(g, 4, 9, 12, 1, C.woodD); px(g, 10, 4, '#ffd36b');
  return outline(c, OUT);
}
// A tiny flag for cleared nodes.
export function bakeFlag() { const [c, g] = canvas(7, 10); rect(g, 1, 0, 1, 10, '#b3aca0'); fillPoly(g, [[2, 0], [7, 2], [2, 4]], '#8fd160'); return outline(c, OUT); }

// Hive vine wall: hanging vines with leaves and a few amber comb cells. Closes the boss arenas.
export function bakeVineWall(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  for (let i = 0; i < 4; i++) { const x = 1 + i * 4 + ((rnd() * 2) | 0); line(g, x, 0, x + (rnd() < 0.5 ? -1 : 1), T, rnd() < 0.5 ? '#2f5e3a' : '#264a2f', 2); }
  for (let i = 0; i < 6; i++) { const x = (rnd() * 14) | 0, y = (rnd() * 14) | 0; rect(g, x, y, 3, 2, rnd() < 0.5 ? '#3f7a48' : '#57964f'); }
  if (rnd() < 0.6) { const x = 3 + ((rnd() * 8) | 0), y = 2 + ((rnd() * 9) | 0); rect(g, x, y, 5, 4, '#e0b040'); rect(g, x + 1, y + 1, 3, 2, '#ffd36b'); px(g, x + 2, y + 2, '#b8541c'); }
  return c;
}

// Silt: the floor of a shallow pool. Dark wet mud, pebbles, a little algae. No grass.
export function bakeSilt(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, '#4a3f30');
  for (let i = 0; i < 30; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? '#3a3024' : '#5a4d3a');
  for (let i = 0; i < 3; i++) { const x = (rnd() * 13) | 0, y = (rnd() * 13) | 0; rect(g, x, y, 3, 2, '#7a7368'); px(g, x, y, '#9a9388'); }
  for (let i = 0; i < 4; i++) px(g, (rnd() * T) | 0, (rnd() * 4) | 0, '#3f6e50');
  rect(g, 0, 0, T, 1, '#3a5a48');
  return c;
}

// ---------- the Stockade ----------
// Palisade: sharpened logs lashed together. Solid, but a barrel bomb breaks it.
export function bakePalisade(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  for (let i = 0; i < 4; i++) { const x = i * 4; rect(g, x, 0, 4, T, C.wood); rect(g, x, 0, 1, T, C.woodL); rect(g, x + 3, 0, 1, T, C.woodD); if (rnd() < 0.5) px(g, x + 1 + ((rnd() * 2) | 0), (rnd() * T) | 0, C.woodD); }
  rect(g, 0, 5, T, 1, '#b8a888'); rect(g, 0, 11, T, 1, '#b8a888');
  return c;
}
export function bakePalisadeTop() { const [c, g] = canvas(T, 6); for (let i = 0; i < 4; i++) fillPoly(g, [[i * 4, 6], [i * 4 + 2, 0], [i * 4 + 4, 6]], C.woodL); return c; }
// Plank: a rope-bridge deck tile (one-way), rope along the top.
export function bakeBridgePlank(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 2, T, 4, C.wood); rect(g, 0, 2, T, 1, C.woodL); rect(g, 0, 5, T, 1, C.woodD); rect(g, 7, 2, 1, 4, C.woodD);
  rect(g, 0, 0, T, 1, '#b8a888'); if (rnd() < 0.5) px(g, (rnd() * T) | 0, 3, C.woodD);
  return c;
}
export function bakeNet() { const [c, g] = canvas(T, T); for (let x = 0; x < T; x += 4) line(g, x, 0, x, 8, '#b8a888', 1); for (let y = 0; y < 8; y += 4) line(g, 0, y, T, y, '#b8a888', 1); return c; }
// Watchtower cap: a roofed platform, 32×18.
export function bakeTowerTop() {
  const [c, g] = canvas(32, 18);
  fillPoly(g, [[16, 0], [31, 8], [1, 8]], '#5c3a1d'); fillPoly(g, [[16, 1], [28, 7], [4, 7]], '#8a5a32');
  rect(g, 4, 8, 2, 8, C.wood); rect(g, 26, 8, 2, 8, C.wood); rect(g, 0, 16, 32, 2, C.wood); rect(g, 0, 16, 32, 1, C.woodL);
  return outline(c, OUT);
}
// Treehouse in the canopy (background prop), 40×30.
export function bakeTreehouse(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(40, 30);
  rect(g, 4, 10, 32, 16, C.wood); rect(g, 4, 10, 32, 1, C.woodL); rect(g, 4, 25, 32, 1, C.woodD);
  fillPoly(g, [[20, 0], [39, 11], [1, 11]], '#5c3a1d'); fillPoly(g, [[20, 2], [35, 10], [5, 10]], '#6b4a2a');
  rect(g, 10, 15, 6, 6, '#ffd36b'); rect(g, 24, 15, 6, 6, rnd() < 0.5 ? '#ffd36b' : '#2a2f3d'); rect(g, 12, 17, 2, 2, '#fff1c0');
  for (let i = 0; i < 3; i++) rect(g, 6 + i * 12, 26, 2, 4, C.woodD);
  return outline(c, OUT);
}
export function bakeTorch() { const [c, g] = canvas(6, 14); rect(g, 2, 4, 2, 10, C.woodD); rect(g, 1, 2, 4, 3, '#b8a888'); rect(g, 1, 0, 4, 2, '#ffd36b'); px(g, 2, 0, '#fff1c0'); return outline(c, OUT); }
export function bakeCage() { const [c, g] = canvas(16, 16); rect(g, 1, 1, 14, 14, 'rgba(20,16,30,0.3)'); for (let x = 1; x < 16; x += 3) rect(g, x, 1, 1, 14, '#8b8378'); rect(g, 1, 1, 14, 1, '#b3aca0'); rect(g, 1, 14, 14, 1, '#5f5a52'); rect(g, 6, 0, 4, 2, '#5f5a52'); return outline(c, OUT); }
export function bakeBarrel() { const [c, g] = canvas(12, 14); rect(g, 1, 1, 10, 12, C.wood); rect(g, 1, 1, 2, 12, C.woodL); rect(g, 9, 1, 2, 12, C.woodD); rect(g, 0, 3, 12, 1, '#8b8378'); rect(g, 0, 10, 12, 1, '#8b8378'); rect(g, 4, 5, 4, 4, '#1b1626'); px(g, 6, 5, '#c9463d'); return outline(c, OUT); }
export function bakeBrazier(lit) { const [c, g] = canvas(14, 16); rect(g, 6, 10, 2, 6, '#5f5a52'); rect(g, 3, 15, 8, 1, '#5f5a52'); rect(g, 2, 7, 10, 4, '#8b8378'); rect(g, 2, 7, 10, 1, '#b3aca0'); if (lit) { fillPoly(g, [[7, 0], [11, 7], [3, 7]], '#ff9a5c'); fillPoly(g, [[7, 2], [9, 7], [5, 7]], '#ffd36b'); } return outline(c, OUT); }
export function bakeCrank() { const [c, g] = canvas(12, 14); rect(g, 4, 6, 4, 8, C.woodD); rect(g, 2, 2, 8, 5, '#8b8378'); rect(g, 2, 2, 8, 1, '#b3aca0'); line(g, 6, 4, 11, 0, '#5f5a52', 2); px(g, 11, 0, '#ffd36b'); return outline(c, OUT); }
export function bakeLift() { const [c, g] = canvas(32, 8); rect(g, 0, 2, 32, 5, C.wood); rect(g, 0, 2, 32, 1, C.woodL); rect(g, 0, 6, 32, 1, C.woodD); for (let x = 8; x < 32; x += 8) rect(g, x, 2, 1, 5, C.woodD); rect(g, 15, 0, 2, 2, '#b8a888'); return outline(c, OUT); }
export function bakeHorn() { const [c, g] = canvas(10, 8); fillPoly(g, [[0, 2], [9, 0], [9, 7], [0, 5]], '#e8dcc0'); rect(g, 0, 2, 2, 3, '#b8a888'); return outline(c, OUT); }
// Fire: three flame frames, 16×16, drawn on the ground.
export function bakeFire() {
  return [0, 1, 2].map(f => { const [c, g] = canvas(T, T); const rnd = mulberry(400 + f);
    for (let i = 0; i < 4; i++) { const x = 2 + i * 4 + ((rnd() * 2) | 0), h = 7 + ((rnd() * 8) | 0); fillPoly(g, [[x - 2, 16], [x, 16 - h], [x + 2, 16]], '#ff6b2c'); fillPoly(g, [[x - 1, 16], [x, 16 - h * 0.6], [x + 1, 16]], '#ffd36b'); }
    for (let i = 0; i < 3; i++) px(g, (rnd() * T) | 0, (rnd() * 6) | 0, '#ffb060');
    return c; });
}
// Night sky for the stockade: deep blue to a torch-orange horizon.
export function bakeSkyNight(h) {
  const [c, g] = canvas(1, h); const top = [18, 22, 48], mid = [48, 40, 78], bot = [140, 70, 50];
  for (let y = 0; y < h; y++) { const t = y / (h - 1); const q = Math.round(t * 8) / 8; const a = q < 0.6 ? top : mid, b = q < 0.6 ? mid : bot, k = q < 0.6 ? q / 0.6 : (q - 0.6) / 0.4; px(g, 0, y, 'rgb(' + ((a[0] + (b[0] - a[0]) * k) | 0) + ',' + ((a[1] + (b[1] - a[1]) * k) | 0) + ',' + ((a[2] + (b[2] - a[2]) * k) | 0) + ')'); }
  return c;
}

// ---------- Sporewood ----------
// Giant mushrooms for the near layer: thick stalks, wide caps with glowing gills underneath.
export function bakeNearMushrooms(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const stalk = '#3a3444', stalkL = '#5a5468', stalkD = '#241f2c';
  const caps = [['#6a3a7a', '#4a2a5a', '#9a5aa8'], ['#2a6a7a', '#1a4a5a', '#4aa0b0'], ['#7a3a4a', '#5a2a34', '#b05a6a']];
  const shrooms = [];
  for (let i = 0; i < w / 80; i++) shrooms.push({ x: rnd() * w, wd: 14 + rnd() * 10, cw: 44 + rnd() * 24, cy: 96 + rnd() * 26, k: (rnd() * 3) | 0 });
  for (const m of shrooms) for (const dx of [-w, 0, w]) {
    const x = Math.round(m.x + dx), wd = Math.round(m.wd), [C1, C2, C3] = caps[m.k];
    rect(g, x, m.cy, wd, h, stalk); rect(g, x, m.cy, 3, h, stalkL); rect(g, x + wd - 3, m.cy, 3, h, stalkD);
    for (let k = 0; k < h / 6; k++) { const bx = x + 3 + ((rnd() * (wd - 6)) | 0), by = m.cy + (rnd() * (h - m.cy)) | 0; rect(g, bx, by, 1, 2 + ((rnd() * 4) | 0), rnd() < 0.5 ? stalkL : stalkD); }
    // ring on the stalk
    rect(g, x - 2, m.cy + 14, wd + 4, 3, stalkL); rect(g, x - 2, m.cy + 17, wd + 4, 1, stalkD);
    // gills under the cap, glowing
    const cx = x + wd / 2; ellipse(g, cx, m.cy + 2, m.cw / 2, 7, C2);
    for (let gx = -m.cw / 2 + 3; gx < m.cw / 2; gx += 4) line(g, cx + gx, m.cy, cx + gx * 0.6, m.cy + 7, C3, 1);
    // cap
    ellipse(g, cx, m.cy - 6, m.cw / 2, 14, C1, C2); ellipse(g, cx - m.cw * 0.12, m.cy - 12, m.cw * 0.28, 6, C3, C1);
    for (let k = 0; k < 6; k++) { const sx = cx + (rnd() - 0.5) * m.cw * 0.8, sy = m.cy - 6 - rnd() * 10; ellipse(g, sx, sy, 2 + rnd() * 2, 1.5 + rnd(), '#e8e0f0'); }
    ellipse(g, cx, m.cy - 6, m.cw / 2 + 1, 15, 'rgba(0,0,0,0)');
  }
  return c;
}
// Mycelium ground: pale threads over dark loam. Replaces the grass top.
export function bakeMycTop(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, '#3a3040'); for (let i = 0; i < 40; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? '#2a2230' : '#4a4050');
  for (let x = 0; x < T; x++) { const d = 2 + (rnd() < 0.4 ? 1 : 0); for (let y = 0; y < d; y++) px(g, x, y, y === 0 ? '#e8f0e0' : '#b8c8b8'); }
  for (let i = 0; i < 5; i++) { let x = (rnd() * T) | 0, y = 3; for (let k = 0; k < 6 + ((rnd() * 6) | 0) && y < T; k++) { px(g, x, y, '#a8b8b0'); if (rnd() < 0.5) x += rnd() < 0.5 ? -1 : 1; y++; } }
  for (let i = 0; i < 2; i++) if (rnd() < 0.6) px(g, (rnd() * T) | 0, 2 + ((rnd() * 10) | 0), '#4aa0b0');
  const side = (x0, dir) => { for (let y = 0; y < 8; y++) if (y < 3 || rnd() < 0.5) px(g, x0, y, '#b8c8b8'); };
  if (eL) side(0, 1); if (eR) side(T - 1, -1);
  return c;
}
export function bakeMycDirt(seed) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); rect(g, 0, 0, T, T, '#3a3040'); for (let i = 0; i < 40; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? '#2a2230' : '#4a4050'); for (let i = 0; i < 3; i++) { let x = (rnd() * T) | 0, y = (rnd() * T) | 0; for (let k = 0; k < 5; k++) { px(g, x, y, '#6a6a78'); x += rnd() < 0.5 ? -1 : 1; y += rnd() < 0.5 ? 1 : 0; } } return c; }
// Bouncer cap: a springy red cap you land on. 16×16 (top 10 px used), frame 2 = squashed.
export function bakeBouncer() {
  const mk = (sq) => { const [c, g] = canvas(T, T); const h = sq ? 5 : 8; ellipse(g, 8, 10, 8, h * 0.6, '#c9463d', '#8f2f28'); ellipse(g, 6, 10 - h * 0.3, 4, 1.5, '#ff9a9a', '#c9463d'); px(g, 3, 9, '#fff1c0'); px(g, 11, 8, '#fff1c0'); px(g, 8, 11, '#fff1c0'); rect(g, 6, 13, 4, 3, '#f0e6c8'); return outline(c, OUT); };
  return [mk(false), mk(true)];
}
// Shelf fungus: a one-way ledge that snaps after you stand on it.
export function bakeShelf(seed) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); rect(g, 0, 2, T, 5, '#d9a55b'); rect(g, 0, 2, T, 1, '#f0d090'); rect(g, 0, 6, T, 1, '#8a5a32'); for (let i = 0; i < 4; i++) rect(g, 2 + i * 4, 4, 1, 2, '#b8813a'); if (rnd() < 0.5) px(g, (rnd() * T) | 0, 3, '#fff1c0'); return c; }
// Puffball: a pale ball that bursts into spores.
export function bakePuffball() { const [c, g] = canvas(14, 12); ellipse(g, 7, 7, 6.5, 5, '#e8e0d0', '#c8bcb0'); ellipse(g, 5, 5, 3, 2, '#fff8f0'); px(g, 7, 2, '#b8a8a0'); rect(g, 5, 11, 4, 1, '#a89890'); return outline(c, OUT); }
// Glow mushroom: teal light. Frame 1 = dark.
export function bakeGlowShroom(lit) { const [c, g] = canvas(12, 14); rect(g, 5, 7, 2, 7, lit ? '#8ad0d8' : '#4a5a5c'); ellipse(g, 6, 5, 6, 4, lit ? '#4aa0b0' : '#2a4a50', lit ? '#2a6a7a' : '#1a3038'); if (lit) { ellipse(g, 4, 3, 2.5, 1.5, '#bff0f0'); px(g, 9, 6, '#bff0f0'); } return outline(c, OUT); }
// Gill pod: the Mother Cap's soft spot, 12×10, pulses.
export function bakeGillPod() { return [0, 1].map(f => { const [c, g] = canvas(12, 10); ellipse(g, 6, 5, 5.5 + f, 4 + f * 0.5, '#9a5aa8', '#6a3a7a'); ellipse(g, 5, 4, 2.5, 1.5, '#e0b0f0'); px(g, 8, 6, '#ffd0ff'); return outline(c, OUT); }); }
// Sleep spore mote and spore mote: tiny.
export function bakeMote(col) { const [c, g] = canvas(3, 3); px(g, 1, 0, col); px(g, 0, 1, col); px(g, 1, 1, '#ffffff'); px(g, 2, 1, col); px(g, 1, 2, col); return c; }
export function bakeSkyTeal(h) { const [c, g] = canvas(1, h); const top = [12, 22, 34], mid = [26, 50, 62], bot = [60, 100, 100]; for (let y = 0; y < h; y++) { const t = y / (h - 1); const q = Math.round(t * 8) / 8; const a = q < 0.6 ? top : mid, b = q < 0.6 ? mid : bot, k = q < 0.6 ? q / 0.6 : (q - 0.6) / 0.4; px(g, 0, y, 'rgb(' + ((a[0] + (b[0] - a[0]) * k) | 0) + ',' + ((a[1] + (b[1] - a[1]) * k) | 0) + ',' + ((a[2] + (b[2] - a[2]) * k) | 0) + ')'); } return c; }

// ---------- Round 20: dressing, critters, impact, and the Mother Cap proper ----------
// The Mother Cap as pixel art: a 160x52 cap and a 32x100 stalk. Drawn from shapes but with dither, rim light, outlined spots and eyes.
export function bakeMotherCap() {
  // A sick giant: the cap sags to one side, mottled with rot, cracked, weeping. Sallow flesh where it used to be purple.
  // Three states, because her breath is the whole fight: 0 SEALED (breathing in, gills clamped, she pulls you),
  // 1 OPEN (breathing out, the gills flared and lit — the window you cut in), 2 TORN (the dome split, the heart showing).
  const rnd0 = mulberry(77);
  const makeCap = state => {
  const [cap, g] = canvas(160, 56);
  const rnd = mulberry(77);
  const sag = x => Math.round(((x - 80) / 80) * 5); // the right side droops
  // underside gills. Sealed they clamp to a dark seam; open they flare and light up from inside.
  const deep = state === 0 ? 5 : 11, glow = state === 1;
  for (let x = 0; x < 160; x++) { const dx = (x - 80) / 78; if (Math.abs(dx) > 1) continue; const h = Math.sqrt(1 - dx * dx); const yb = 34 + sag(x) + Math.round(h * deep); for (let y = 34 + sag(x); y < yb; y++) px(g, x, y, glow ? (((x >> 2) % 2) ? '#c9a0ff' : '#5a3a6a') : ((x >> 2) % 2 ? '#4a3e34' : '#2c2420')); }
  if (glow) { for (let x = 0; x < 160; x++) { const dx = (x - 80) / 78; if (Math.abs(dx) > 1) continue; const h = Math.sqrt(1 - dx * dx); const yb = 34 + sag(x) + Math.round(h * deep); for (let y = yb - 2; y < yb; y++) px(g, x, y, ((x + y) & 1) ? '#e0b0f0' : '#9a5aa8'); } }
  for (let x = 6; x < 156; x += 4) line(g, x, 34 + sag(x), 80 + (x - 80) * 0.72, (state === 0 ? 40 : 49) + sag(x), x % 8 === 2 ? (glow ? '#e0b0f0' : '#6a5a48') : (glow ? '#8a5aa0' : '#4a3e34'), 1);
  // dome: sallow flesh with a purple memory in the shadows
  for (let x = 0; x < 160; x++) { const dx = (x - 80) / 78; if (Math.abs(dx) > 1) continue; const h = Math.sqrt(1 - dx * dx); const top = 30 + sag(x) - Math.round(h * 22); for (let y = top; y <= 34 + sag(x); y++) { const k = (y - top) / Math.max(1, 34 + sag(x) - top); const col = k < 0.18 ? '#b8b070' : k < 0.5 ? '#8a8a54' : k < 0.8 ? '#6a6a44' : '#4a3a4a'; px(g, x, y, ((x + y) & 1) && k > 0.4 && k < 0.6 ? '#7a7a4a' : col); } }
  // rot blotches with dark rims, and cracks
  for (const [sx, sy, r] of [[30, 22, 7], [58, 12, 9], [92, 10, 6], [118, 18, 9], [142, 30, 6], [76, 26, 5], [104, 28, 6], [46, 30, 4]]) { ellipse(g, sx, sy + sag(sx), r, r * 0.7, '#4a3a2a', '#2c221c'); ellipse(g, sx - 1, sy + sag(sx) - 1, r * 0.5, r * 0.35, '#6a4a2a'); if (rnd() < 0.7) px(g, sx + 1, sy + sag(sx), '#b8c060'); }
  for (let i = 0; i < 7; i++) { let x = 14 + ((rnd() * 132) | 0), y = 20 + ((rnd() * 10) | 0) + sag(x); for (let k = 0; k < 6 + ((rnd() * 8) | 0); k++) { px(g, x, y, '#2c221c'); x += rnd() < 0.6 ? 1 : 0; y += rnd() < 0.5 ? 1 : -1; } }
  // pus-yellow weeping at the rim, drips hanging off the low side
  for (let x = 10; x < 150; x += 3) if (rnd() < 0.5) px(g, x, 34 + sag(x), '#b8c060');
  for (const x of [98, 116, 131, 146, 152]) { const h = 3 + ((rnd() * 6) | 0); rect(g, x, 40 + sag(x), 2, h, '#b8c060'); px(g, x, 40 + sag(x) + h, '#d8e080'); }
  // a few pale spots that survived, the eyes' sockets dark
  for (const [sx, sy, r] of [[40, 10, 3], [70, 6, 3], [128, 12, 2]]) ellipse(g, sx, sy + sag(sx), r, r * 0.7, '#d8d0c0', '#a8a090');
  // TORN: the dome splits down the middle and the pink of her shows through
  if (state === 2) { for (let y = 4; y < 40; y++) { const w = 2 + Math.round(Math.sin(y * 0.4) * 2) + Math.round(y * 0.18); for (let x = 80 - w; x <= 80 + w; x++) px(g, x, y + sag(x), ((x + y) & 1) ? '#ff7a9a' : '#8f2f28'); px(g, 80 - w - 1, y, '#2c221c'); px(g, 80 + w + 1, y, '#2c221c'); } for (let i = 0; i < 20; i++) { const x = 66 + ((rnd() * 28) | 0), y = 6 + ((rnd() * 30) | 0); px(g, x, y, '#ffd0ff'); } }
  outline(cap, OUT);
  return cap;
  };
  const cap = makeCap(0), capOpen = makeCap(1), capTorn = makeCap(2);
  const [stalk, s] = canvas(32, 100);
  const rnd = rnd0;
  rect(s, 2, 0, 28, 100, '#4a4436'); rect(s, 2, 0, 5, 100, '#6a6450'); rect(s, 25, 0, 5, 100, '#2c2820');
  for (let i = 0; i < 50; i++) { const x = 4 + ((rnd() * 24) | 0), y = (rnd() * 96) | 0; rect(s, x, y, 1, 2 + ((rnd() * 5) | 0), rnd() < 0.5 ? '#5a5444' : '#3a3428'); }
  // veins of rot climbing the stalk, a split ring, oozing boils
  for (let i = 0; i < 4; i++) { let x = 6 + ((rnd() * 20) | 0), y = 95; while (y > 10) { px(s, x, y, '#5a3a5a'); if (rnd() < 0.5) px(s, x + 1, y, '#3a2a3a'); y--; x += rnd() < 0.3 ? (rnd() < 0.5 ? -1 : 1) : 0; x = Math.max(4, Math.min(27, x)); } }
  rect(s, 0, 34, 32, 5, '#6a6450'); rect(s, 0, 39, 32, 2, '#2c2820'); rect(s, 14, 33, 3, 8, '#2c2820');
  for (const [bx, by] of [[9, 55], [20, 70], [12, 84], [23, 22]]) { ellipse(s, bx, by, 3, 2.5, '#8a8a54', '#4a3a2a'); px(s, bx, by - 1, '#b8c060'); }
  fillPoly(s, [[2, 100], [2, 86], [-4, 100]], '#4a4436'); fillPoly(s, [[30, 100], [30, 84], [36, 100]], '#4a4436'); rect(s, 0, 96, 32, 4, '#3a3428');
  outline(stalk, OUT);
  return { cap, capOpen, capTorn, stalk };
}
// Impact star: two frames, 16x16, white-hot then thinning.
export function bakeImpact(col = '#fff6e0') {
  return [0, 1].map(f => { const [c, g] = canvas(16, 16); const r = f ? 7 : 4; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const L = i % 2 ? r * 0.55 : r; line(g, 8, 8, 8 + Math.cos(a) * L, 8 + Math.sin(a) * L, col, 1); } if (!f) rect(g, 7, 7, 2, 2, '#ffffff'); return c; });
}
// ---- dressing ----
export function bakeFern(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(14, 10);
  for (let i = 0; i < 5; i++) { const a = -1.9 + i * 0.5, L = 6 + rnd() * 3; const x1 = 7 + Math.cos(a) * L, y1 = 9 + Math.sin(a) * L; line(g, 7, 9, x1, y1, C.grassD, 1); for (let k = 2; k < L; k += 2) { const bx = 7 + Math.cos(a) * k, by = 9 + Math.sin(a) * k; px(g, Math.round(bx - 1), Math.round(by), C.grass); px(g, Math.round(bx + 1), Math.round(by), C.grassL); } }
  return c;
}
export function bakeStump(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(14, 10);
  rect(g, 2, 3, 10, 7, '#5c3a1d'); rect(g, 2, 3, 2, 7, '#7a4e28'); rect(g, 10, 3, 2, 7, '#3d2712');
  ellipse(g, 7, 3, 5, 2.5, '#c9b27c', '#8a5a32'); ellipse(g, 7, 3, 3, 1.5, '#b89a68'); ellipse(g, 7, 3, 1.5, 0.7, '#8a5a32');
  for (let i = 0; i < 3; i++) rect(g, 3 + ((rnd() * 8) | 0), 5 + ((rnd() * 4) | 0), 1, 2, '#3d2712');
  return outline(c, OUT);
}
export function bakeRock(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(12, 7);
  const w = 6 + ((rnd() * 5) | 0), h = 3 + ((rnd() * 3) | 0);
  ellipse(g, 6, 6 - h / 2, w / 2, h / 2, '#7c8797', '#5a6270'); ellipse(g, 5, 5 - h / 2, w / 4, h / 4, '#9aa3b0');
  if (rnd() < 0.6) px(g, 4 + ((rnd() * 4) | 0), 6, C.grass);
  return outline(c, OUT);
}
export function bakeCattail(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(10, 22);
  const x = 4 + ((rnd() * 2) | 0);
  line(g, x, 21, x, 6, '#5a8a3a', 1); line(g, x + 2, 21, x + 4, 4, '#4a7a30', 1); line(g, x - 2, 21, x - 3, 8, '#6a9a44', 1);
  rect(g, x - 1, 3, 3, 7, '#5c3a1d'); rect(g, x, 3, 1, 7, '#7a4e28'); px(g, x, 2, '#c9b27c');
  return c;
}
export function bakeLilyFlower() { const [c, g] = canvas(8, 6); ellipse(g, 4, 4, 4, 1.5, '#4f9a58', '#2f6e3a'); px(g, 3, 2, '#ff9ab0'); px(g, 4, 1, '#ffd0dc'); px(g, 5, 2, '#ff9ab0'); px(g, 4, 2, '#ffd36b'); return c; }
export function bakeSkullPost() {
  const [c, g] = canvas(10, 24);
  rect(g, 4, 8, 2, 16, '#5c3a1d'); rect(g, 4, 8, 1, 16, '#7a4e28');
  ellipse(g, 5, 4, 4, 3.5, '#e8dcc0', '#b8a888'); rect(g, 3, 4, 2, 2, OUT); rect(g, 6, 4, 2, 2, OUT); rect(g, 3, 7, 5, 1, '#b8a888'); px(g, 4, 8, OUT); px(g, 6, 8, OUT);
  line(g, 2, 12, 8, 14, '#8a5a32', 1); px(g, 8, 15, '#c9463d');
  return outline(c, OUT);
}
export function bakeTent(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(40, 22);
  const col = rnd() < 0.5 ? '#6b4a2a' : '#5a4a3a', dark = '#3d2c1a', light = '#8a6a44';
  fillPoly(g, [[2, 21], [20, 2], [38, 21]], col); fillPoly(g, [[20, 2], [38, 21], [20, 21]], dark);
  fillPoly(g, [[20, 4], [14, 21], [26, 21]], '#241a10'); line(g, 20, 2, 20, 21, light, 1); line(g, 2, 21, 20, 2, light, 1);
  for (let i = 0; i < 6; i++) px(g, 4 + ((rnd() * 14) | 0), 8 + ((rnd() * 12) | 0), light);
  rect(g, 19, 0, 2, 3, '#8a5a32'); rect(g, 21, 0, 4, 2, '#c9463d');
  return outline(c, OUT);
}
export function bakeCampfire() {
  return [0, 1, 2].map(f => { const [c, g] = canvas(14, 14); rect(g, 2, 11, 10, 2, '#5c3a1d'); rect(g, 1, 12, 5, 2, '#3d2712'); rect(g, 8, 12, 5, 2, '#7a4e28');
    const h = 6 + f * 2; fillPoly(g, [[3, 11], [7, 11 - h], [11, 11]], '#ff9a5c'); fillPoly(g, [[5, 11], [7 + (f === 1 ? 1 : -1), 11 - h + 3], [9, 11]], '#ffd36b'); px(g, 7 + (f - 1), 11 - h - 1, '#ff6b2c'); px(g, 4 - f, 4 - f, '#ffd36b');
    return outline(c, OUT); });
}
export function bakeTinyCap(col, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(7, 7); const w = 2 + ((rnd() * 2) | 0);
  rect(g, 3, 4, 1, 3, '#d8d0c8'); ellipse(g, 3, 4, w + 0.5, 1.8, col); px(g, 2, 3, '#ffffff');
  return c;
}
export function bakeMoss(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(10, 14);
  for (let i = 0; i < 4; i++) { const x = 1 + i * 2 + ((rnd() * 2) | 0), h = 5 + ((rnd() * 9) | 0); line(g, x, 0, x + (rnd() < 0.5 ? 1 : 0), h, rnd() < 0.5 ? '#3a5a4a' : '#4a7a5a', 1); px(g, x, h, '#7fd1a0'); }
  return c;
}
export function bakeButterfly(col) {
  return [0, 1].map(f => { const [c, g] = canvas(7, 5); if (f) { rect(g, 0, 1, 3, 3, col); rect(g, 4, 1, 3, 3, col); px(g, 1, 1, '#ffffff'); px(g, 5, 1, '#ffffff'); } else { rect(g, 1, 0, 2, 4, col); rect(g, 4, 0, 2, 4, col); } rect(g, 3, 1, 1, 3, OUT); return c; });
}
export function bakeDragonfly() {
  return [0, 1].map(f => { const [c, g] = canvas(10, 5); rect(g, 0, 2, 8, 1, '#3a6aa0'); px(g, 8, 2, '#6fa0d8'); px(g, 9, 2, '#1b1626'); if (f) { rect(g, 2, 0, 5, 1, 'rgba(200,230,255,0.8)'); rect(g, 2, 4, 5, 1, 'rgba(200,230,255,0.8)'); } else { rect(g, 3, 1, 4, 1, 'rgba(200,230,255,0.6)'); rect(g, 3, 3, 4, 1, 'rgba(200,230,255,0.6)'); } return c; });
}
export function bakeCrow() {
  const f = rows => outline(fromGrid(rows, { b: '#1b1626', B: '#2c2736', y: '#e0b040', e: '#c9463d' }, 1), '#0a0810');
  return [f(['......', '..bB..', '.bbbBy', '..bb..', '.b..b.']), f(['B....B', '.BbbB.', '..bbBy', '......', '......']), f(['......', '..bb..', 'BBbbBy', '......', '......'])];
}

// ---------- landmarks: one or two big set-pieces per level, drawn behind the play layer ----------
export function bakeOldOak(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(72, 80);
  // trunk with a hollow
  rect(g, 26, 30, 20, 50, '#5c3a1d'); rect(g, 26, 30, 4, 50, '#7a4e28'); rect(g, 42, 30, 4, 50, '#3d2712');
  fillPoly(g, [[26, 80], [18, 80], [26, 62]], '#5c3a1d'); fillPoly(g, [[46, 80], [54, 80], [46, 60]], '#5c3a1d'); fillPoly(g, [[18, 80], [10, 80], [22, 70]], '#3d2712');
  ellipse(g, 36, 62, 6, 9, '#1b1626'); ellipse(g, 36, 60, 4, 6, '#0e0a14');
  for (let i = 0; i < 30; i++) rect(g, 28 + ((rnd() * 16) | 0), 32 + ((rnd() * 46) | 0), 1, 2 + ((rnd() * 3) | 0), rnd() < 0.5 ? '#7a4e28' : '#3d2712');
  // limbs and canopy lobes
  line(g, 30, 34, 10, 16, '#5c3a1d', 3); line(g, 42, 32, 60, 12, '#5c3a1d', 3); line(g, 36, 30, 36, 10, '#5c3a1d', 3);
  const lobes = [[14, 16, 15], [36, 10, 17], [58, 14, 14], [26, 22, 13], [48, 20, 13]];
  for (const [x, y, r] of lobes) ellipse(g, x, y, r, r * 0.75, C.canopy ? C.canopy[1] : '#2a5e46');
  for (const [x, y, r] of lobes) ellipse(g, x - r * 0.25, y - r * 0.3, r * 0.55, r * 0.35, C.canopy ? C.canopy[2] : '#3a7a55');
  for (let i = 0; i < 14; i++) px(g, 4 + ((rnd() * 64) | 0), 4 + ((rnd() * 24) | 0), C.canopy ? C.canopy[3] : '#4f9a68');
  return outline(c, OUT);
}
export function bakeBoat(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(44, 16);
  fillPoly(g, [[2, 4], [42, 6], [36, 15], [8, 15]], '#5c3a1d'); fillPoly(g, [[4, 5], [40, 7], [35, 12], [9, 12]], '#7a4e28');
  for (let x = 6; x < 38; x += 5) line(g, x, 6, x + 1, 14, '#3d2712', 1);
  rect(g, 2, 4, 40, 2, '#8a5a32'); rect(g, 18, 0, 2, 6, '#5c3a1d');
  for (let i = 0; i < 6; i++) px(g, 6 + ((rnd() * 32) | 0), 7 + ((rnd() * 5) | 0), '#4f9a58');
  return outline(c, OUT);
}
export function bakeHeron() {
  const P2 = { b: '#c9d1dc', B: '#7c8797', k: '#3a3040', y: '#e0b040', e: '#1b1626' };
  const f = rows => outline(fromGrid(rows, P2, 1), OUT);
  const stand = f(['....bb..', '...bebyy', '...bb...', '...b....', '..Bb....', '.BBbb...', 'BBBBbb..', '.BBBB...', '...k....', '...k....', '...k....', '..kk....']);
  const fly1 = f(['BBBB....', '.BBBb...', '..BBbb..', '...bbbyy', 'BBBBbb..', '.BBBBB..', '....k...', '....k...']);
  const fly2 = f(['........', '........', '..bb....', '..bbbbyy', 'BBBBbb..', '.BBBBB..', 'BBBBk...', 'BBB.k...']);
  return [stand, fly1, fly2];
}
export function bakeTotem(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(14, 40);
  rect(g, 4, 6, 6, 34, '#5c3a1d'); rect(g, 4, 6, 2, 34, '#7a4e28');
  // three faces stacked
  for (let i = 0; i < 3; i++) { const y = 8 + i * 10; rect(g, 3, y, 8, 8, i === 1 ? '#c9463d' : '#6faa4a'); rect(g, 4, y + 2, 2, 2, '#1b1626'); rect(g, 8, y + 2, 2, 2, '#1b1626'); rect(g, 5, y + 5, 4, 1, '#1b1626'); if (rnd() < 0.5) rect(g, 6, y + 6, 2, 1, '#e8dcc0'); }
  rect(g, 1, 4, 12, 3, '#e8dcc0'); rect(g, 0, 2, 3, 4, '#e8dcc0'); rect(g, 11, 2, 3, 4, '#e8dcc0'); rect(g, 6, 0, 2, 5, '#e8dcc0');
  return outline(c, OUT);
}
export function bakeGiantCap(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(96, 44);
  // a fallen cap on its side: stalk lying left, cap disc facing us
  rect(g, 4, 28, 40, 12, '#3a3444'); rect(g, 4, 28, 40, 3, '#5a5468'); rect(g, 4, 37, 40, 3, '#241f2c');
  for (let i = 0; i < 12; i++) rect(g, 6 + ((rnd() * 36) | 0), 30 + ((rnd() * 8) | 0), 2, 1, '#4e4860');
  ellipse(g, 66, 26, 28, 18, '#6a3a7a', '#4a2a5a'); ellipse(g, 66, 26, 22, 13, '#4a2a5a');
  for (let a = 0; a < 6.28; a += 0.32) line(g, 66, 26, 66 + Math.cos(a) * 21, 26 + Math.sin(a) * 12, '#8a4a9a', 1);
  ellipse(g, 66, 26, 5, 3, '#3a2246');
  for (const [sx, sy, r] of [[46, 14, 3], [60, 9, 4], [80, 12, 3], [90, 24, 3], [84, 38, 3]]) ellipse(g, sx, sy, r, r * 0.7, '#e8e0f0', '#c8b8d8');
  for (let i = 0; i < 8; i++) px(g, 40 + ((rnd() * 52) | 0), 8 + ((rnd() * 34) | 0), '#9a5aa8');
  return outline(c, OUT);
}

// ---------- boss arena set dressing ----------
// The hive: a great papery nest of hex cells, dripping. Background.
export function bakeHiveBg(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(120, 96);
  ellipse(g, 60, 50, 56, 44, '#b8913a', '#8a6a28'); ellipse(g, 56, 44, 44, 34, '#d0a848'); ellipse(g, 50, 36, 26, 18, '#e0c060');
  for (let y = 12; y < 92; y += 8) for (let x = 8 + (y / 8 % 2) * 5; x < 112; x += 10) { const dx = (x - 60) / 56, dy = (y - 50) / 44; if (dx * dx + dy * dy > 0.85) continue; const dark = rnd() < 0.25; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.5, a2 = a + Math.PI / 3; line(g, x + Math.cos(a) * 4, y + Math.sin(a) * 4, x + Math.cos(a2) * 4, y + Math.sin(a2) * 4, '#6a4a18', 1); } if (dark) ellipse(g, x, y, 2.5, 2.5, '#3a2a10'); else if (rnd() < 0.3) ellipse(g, x, y, 2, 2, '#f0d070'); }
  for (let i = 0; i < 5; i++) { const x = 20 + ((rnd() * 80) | 0); rect(g, x, 88, 2, 4 + ((rnd() * 5) | 0), '#e0b040'); px(g, x, 93 + ((rnd() * 3) | 0), '#ffe080'); }
  return outline(c, OUT);
}
export function bakeHoneyDrip() { return [0, 1, 2].map(f => { const [c, g] = canvas(4, 12); rect(g, 1, 0, 2, 4 + f * 3, '#e0b040'); ellipse(g, 2, 4 + f * 3, 2, 2.5, '#ffd36b', '#e0b040'); px(g, 1, 3 + f * 3, '#fff0a0'); return c; }); }
// The court: stone frog statues, mossy, and lily lanterns that glow on the water.
export function bakeFrogStatue(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(22, 28);
  rect(g, 2, 20, 18, 8, '#7c8797'); rect(g, 2, 20, 18, 2, '#9aa3b0'); rect(g, 4, 26, 14, 2, '#5a6270');
  ellipse(g, 11, 14, 9, 6, '#8a9aa0', '#5a6a70'); ellipse(g, 11, 8, 6, 4, '#8a9aa0', '#5a6a70'); ellipse(g, 7, 6, 2, 2, '#5a6a70'); ellipse(g, 15, 6, 2, 2, '#5a6a70'); px(g, 7, 6, OUT); px(g, 15, 6, OUT);
  for (let i = 0; i < 10; i++) px(g, 2 + ((rnd() * 18) | 0), 6 + ((rnd() * 20) | 0), rnd() < 0.5 ? '#4f9a58' : '#2f6e3a');
  return outline(c, OUT);
}
export function bakeLilyLantern() { return [0, 1].map(f => { const [c, g] = canvas(12, 10); ellipse(g, 6, 8, 6, 2, '#4f9a58', '#2f6e3a'); fillPoly(g, [[6, 1], [3, 7], [9, 7]], f ? '#ffd0dc' : '#ff9ab0'); fillPoly(g, [[6, 3], [4, 7], [8, 7]], f ? '#fff6e0' : '#ffd0dc'); px(g, 6, 5, '#ffd36b'); return outline(c, OUT); }); }
// The hall: a war banner, a throne of bones, skull piles, hanging cages.
export function bakeWarBanner(seed, hung = false) { // hung: from a ceiling on two cords, no pole standing under it
  const rnd = mulberry(seed); const [c, g] = canvas(44, 72); const o = hung ? 7 : 0;
  if (hung) { rect(g, 20, 0, 4, 2, '#5a5460'); for (let i = 0; i <= 7; i++) { px(g, 21 - i * 2, i, '#3a2618'); px(g, 22 + i * 2, i, '#3a2618'); } rect(g, 6, 2 + o, 32, 3, '#5c3a1d'); }
  else { rect(g, 20, 0, 4, 72, '#5c3a1d'); rect(g, 20, 0, 1, 72, '#7a4e28'); rect(g, 6, 2, 32, 3, '#5c3a1d'); }
  fillPoly(g, [[7, 5 + o], [37, 5 + o], [37, 52 + o], [22, 62 + o], [7, 52 + o]], '#8f2f28'); fillPoly(g, [[9, 7 + o], [35, 7 + o], [35, 50 + o], [22, 58 + o], [9, 50 + o]], '#c9463d');
  // a goblin face
  ellipse(g, 22, 26 + o, 9, 8, '#1b1626'); rect(g, 17, 22 + o, 3, 3, '#e0b040'); rect(g, 24, 22 + o, 3, 3, '#e0b040'); rect(g, 18, 30 + o, 8, 2, '#e8dcc0'); px(g, 19, 32 + o, '#e8dcc0'); px(g, 24, 32 + o, '#e8dcc0');
  for (let i = 0; i < 8; i++) px(g, 9 + ((rnd() * 26) | 0), 40 + o + ((rnd() * 16) | 0), '#8f2f28');
  rect(g, 2, 4 + o, 6, 2, '#e8dcc0'); rect(g, 36, 4 + o, 6, 2, '#e8dcc0');
  return outline(c, OUT);
}
export function bakeBoneThrone() {
  const [c, g] = canvas(40, 40);
  rect(g, 4, 20, 32, 20, '#b8a888'); rect(g, 6, 6, 28, 16, '#c9b998'); rect(g, 4, 20, 32, 2, '#e8dcc0');
  for (const [x, y] of [[8, 8], [18, 4], [28, 8], [6, 26], [30, 26], [18, 30]]) { ellipse(g, x + 3, y + 3, 4, 3.5, '#e8dcc0', '#b8a888'); rect(g, x + 1, y + 2, 2, 2, OUT); rect(g, x + 4, y + 2, 2, 2, OUT); }
  for (let i = 0; i < 6; i++) rect(g, 6 + i * 5, 12, 2, 8, '#e8dcc0');
  rect(g, 2, 0, 3, 24, '#e8dcc0'); rect(g, 35, 0, 3, 24, '#e8dcc0'); px(g, 3, 0, '#c9463d'); px(g, 36, 0, '#c9463d');
  return outline(c, OUT);
}
export function bakeSkullPile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(26, 12);
  for (let i = 0; i < 7; i++) { const x = 3 + ((rnd() * 18) | 0), y = 4 + ((rnd() * 5) | 0); ellipse(g, x, y, 3.5, 3, '#e8dcc0', '#b8a888'); px(g, x - 1, y, OUT); px(g, x + 1, y, OUT); }
  rect(g, 2, 10, 22, 2, '#b8a888');
  return outline(c, OUT);
}
// A great bough of the old tree over the Chieftain's hall, 220×24: the cages hang from it.
export function bakeBough() {
  const [c, g] = canvas(220, 24);
  fillPoly(g, [[0, 4], [40, 2], [110, 6], [180, 3], [220, 6], [220, 16], [180, 20], [110, 18], [40, 21], [0, 17]], '#3a2618');
  fillPoly(g, [[0, 6], [40, 4], [110, 8], [180, 5], [220, 8], [220, 11], [180, 9], [110, 11], [40, 8], [0, 9]], '#5a3a24');
  for (let x = 6; x < 214; x += 9) { rect(g, x, 12 + ((x / 9) % 3), 4, 1, '#241a10'); rect(g, x + 4, 9 + ((x / 9) % 2), 3, 1, '#6a4a30'); }
  for (let x = 14; x < 210; x += 22) { rect(g, x, 0, 2, 5, '#3a2618'); for (let k = 0; k < 3; k++) rect(g, x - 3 + k * 3, 0 + k, 3, 2, ['#16301f', '#2a5e36', '#3a7a48'][k]); }
  for (let x = 30; x < 200; x += 37) { rect(g, x, 18, 2, 6, '#3a2618'); rect(g, x - 2, 22, 6, 2, '#2a5e36'); }
  return outline(c, OUT);
}
// a cage on the ground needs something to hang from: a gibbet, a post with an arm and a brace
export function bakeGibbet() {
  const [c, g] = canvas(32, 64);
  rect(g, 3, 2, 4, 62, '#4a3220'); rect(g, 3, 2, 1, 62, '#6a4a2c'); rect(g, 1, 60, 8, 4, '#3a2618'); // the post and its foot
  rect(g, 3, 2, 26, 4, '#4a3220'); rect(g, 3, 2, 26, 1, '#6a4a2c'); line(g, 7, 16, 16, 6, '#4a3220', 2); // the arm and its brace
  for (let y = 6; y < 16; y += 3) rect(g, 22, y, 2, 2, '#8b8378'); // the chain
  rect(g, 17, 16, 12, 24, '#3a3040'); rect(g, 18, 17, 10, 22, '#1b1626'); for (let x = 18; x < 28; x += 3) rect(g, x, 17, 1, 22, '#8b8378'); rect(g, 17, 16, 12, 1, '#b3aca0'); rect(g, 17, 39, 12, 1, '#b3aca0');
  ellipse(g, 23, 24, 3, 3, '#e8dcc0'); px(g, 22, 24, OUT); px(g, 24, 24, OUT); rect(g, 22, 28, 2, 8, '#e8dcc0'); rect(g, 20, 30, 6, 1, '#e8dcc0');
  return outline(c, OUT);
}
// an eyrie on the crags: a heap of sticks the size of a cart, bones in it and two eggs
export function bakeEyrie() {
  const [c, g] = canvas(44, 18);
  ellipse(g, 22, 13, 21, 6, '#4a3a2a'); ellipse(g, 22, 11, 18, 5, '#6a5238');
  for (let i = 0; i < 26; i++) { const x = 3 + ((i * 37) % 38), y = 8 + ((i * 11) % 9); line(g, x, y, x + 6 - ((i * 5) % 12), y + 2 - ((i * 3) % 4), i % 3 ? '#7a6044' : '#3a2c1e', 1); }
  ellipse(g, 22, 9, 12, 3, '#2a2018'); ellipse(g, 18, 8, 3, 4, '#e8e0d0'); ellipse(g, 25, 8, 3, 4, '#d8d0c0'); px(g, 17, 6, '#fff6e0');
  rect(g, 30, 7, 6, 1, '#e8dcc0'); rect(g, 35, 6, 1, 3, '#e8dcc0'); // a bone over the rim
  return outline(c, OUT);
}
// the engine of a siege that failed: a trebuchet on its side, its arm snapped, one wheel off
export function bakeSiege() {
  const [c, g] = canvas(56, 34);
  line(g, 4, 32, 22, 8, '#5c3a1d', 3); line(g, 40, 32, 22, 8, '#5c3a1d', 3); line(g, 10, 22, 34, 22, '#4a3220', 2); // the A-frame
  rect(g, 2, 30, 50, 3, '#4a3220'); rect(g, 2, 30, 50, 1, '#6a4a2c'); // the base beam
  line(g, 22, 8, 50, 2, '#6a4a2c', 2); line(g, 22, 8, 14, 16, '#6a4a2c', 2); // the arm, snapped at the far end
  line(g, 50, 2, 53, 6, '#8a6a44', 1); line(g, 50, 2, 54, 1, '#8a6a44', 1); // splinters
  rect(g, 10, 14, 7, 6, '#3a3040'); rect(g, 11, 15, 5, 4, '#5a5460'); // the counterweight box
  circle(g, 46, 29, 4, '#3a2618'); circle(g, 46, 29, 2, '#6a4a2c'); // a wheel, lying against it
  rect(g, 30, 27, 4, 3, '#7c8797'); // a stone it never threw
  return outline(c, OUT);
}
export function bakeHangCage() {
  const [c, g] = canvas(16, 44);
  for (let y = 0; y < 16; y += 3) rect(g, 7, y, 2, 2, '#8b8378');
  rect(g, 2, 16, 12, 24, '#3a3040'); rect(g, 3, 17, 10, 22, '#1b1626'); for (let x = 3; x < 13; x += 3) rect(g, x, 17, 1, 22, '#8b8378'); rect(g, 2, 16, 12, 1, '#b3aca0'); rect(g, 2, 39, 12, 1, '#b3aca0');
  ellipse(g, 8, 24, 3, 3, '#e8dcc0'); px(g, 7, 24, OUT); px(g, 9, 24, OUT); rect(g, 7, 28, 2, 8, '#e8dcc0'); rect(g, 5, 30, 6, 1, '#e8dcc0');
  return outline(c, OUT);
}
// The hollow: roots across the floor, glowing spore pods, and the bones of what she ate.
export function bakeRootDecor(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(44, 10);
  let x = 0, y = 7; while (x < 44) { const y2 = Math.max(2, Math.min(9, y + ((rnd() * 3) | 0) - 1)); line(g, x, y, x + 4, y2, '#4a4436', 2); line(g, x, y - 1, x + 4, y2 - 1, '#6a6450', 1); x += 4; y = y2; }
  for (let i = 0; i < 4; i++) px(g, (rnd() * 44) | 0, 2 + ((rnd() * 6) | 0), '#5a3a5a');
  return c;
}
export function bakeSporePod() { return [0, 1].map(f => { const [c, g] = canvas(12, 16); rect(g, 5, 0, 2, 5, '#5a5468'); ellipse(g, 6, 10, 5, 5.5, f ? '#b070c0' : '#9a5aa8', '#6a3a7a'); ellipse(g, 5, 8, 2, 2, f ? '#ffd0ff' : '#e0b0f0'); px(g, 8, 12, '#e0b0f0'); return outline(c, OUT); }); }

export function bakeSkullMini() { const [c, g] = canvas(9, 9); ellipse(g, 4, 3.5, 3.5, 3, '#e8dcc0', '#b8a888'); rect(g, 2, 3, 2, 2, OUT); rect(g, 5, 3, 2, 2, OUT); rect(g, 2, 6, 5, 1, '#b8a888'); px(g, 3, 7, OUT); px(g, 5, 7, OUT); return outline(c, OUT); }
export function bakeCompass() { const [c, g] = canvas(26, 26); ellipse(g, 13, 13, 12, 12, 'rgba(230,210,170,0.5)', '#5c3a1d'); fillPoly(g, [[13, 2], [16, 13], [10, 13]], '#c9463d'); fillPoly(g, [[13, 24], [16, 13], [10, 13]], '#e8dcc0'); fillPoly(g, [[2, 13], [13, 10], [13, 16]], '#e8dcc0'); fillPoly(g, [[24, 13], [13, 10], [13, 16]], '#e8dcc0'); px(g, 13, 13, OUT); return outline(c, OUT); }

// Comb ledge: a bright wax slab you can stand on, for the hive clearing. Reads against the dark hive behind it.
export function bakeCombPlat(seed, end) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 2, T, 7, '#f0c860'); rect(g, 0, 2, T, 1, '#fff0a0'); rect(g, 0, 8, T, 1, '#b8842a'); rect(g, 0, 9, T, 1, '#6a4a18');
  for (let x = 2; x < T; x += 6) { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.5, a2 = a + Math.PI / 3; line(g, x + Math.cos(a) * 2.5, 5 + Math.sin(a) * 2.5, x + Math.cos(a2) * 2.5, 5 + Math.sin(a2) * 2.5, '#b8842a', 1); } }
  if (rnd() < 0.5) { rect(g, 4 + ((rnd() * 8) | 0), 9, 2, 3, '#e0b040'); }
  if (end === 'L') rect(g, 0, 1, 2, 9, '#6a4a18'); if (end === 'R') rect(g, T - 2, 1, 2, 9, '#6a4a18');
  return outline(c, OUT);
}

// Relics: five small icons, 10x12.
export function bakeRelics() {
  const mk = f => { const [c, g] = canvas(10, 12); f(g); return outline(c, OUT); };
  return {
    crown: mk(g => { rect(g, 1, 5, 8, 6, '#e0b040'); for (const x of [1, 4, 7]) rect(g, x, 2, 2, 3, '#e0b040'); px(g, 2, 2, '#fff6c8'); px(g, 5, 2, '#c9463d'); px(g, 8, 2, '#fff6c8'); rect(g, 2, 8, 6, 1, '#b8842a'); }),
    charm: mk(g => { rect(g, 4, 0, 2, 3, '#8a5a32'); ellipse(g, 5, 7, 4, 4, '#ffd34a', '#b8842a'); px(g, 4, 6, '#fff6c8'); rect(g, 4, 8, 2, 1, '#b8842a'); }),
    gauntlet: mk(g => { rect(g, 2, 1, 6, 10, '#c9d1dc'); rect(g, 2, 1, 6, 1, '#7c8797'); rect(g, 3, 4, 1, 6, '#7c8797'); rect(g, 5, 4, 1, 6, '#7c8797'); rect(g, 0, 5, 3, 3, '#c9d1dc'); px(g, 3, 2, '#fff6e0'); }),
    lantern: mk(g => { rect(g, 4, 0, 2, 2, '#5c3a1d'); rect(g, 2, 2, 6, 8, '#4aa0b0'); rect(g, 3, 3, 4, 6, '#bff0f0'); rect(g, 2, 10, 6, 1, '#5c3a1d'); px(g, 4, 5, '#ffffff'); }),
    cloak: mk(g => { fillPoly(g, [[5, 0], [0, 9], [10, 9]], '#6a3aa0'); fillPoly(g, [[5, 2], [2, 8], [8, 8]], '#40206a'); rect(g, 3, 9, 4, 2, '#6a3aa0'); px(g, 5, 1, '#ffd36b'); }),
  };
}

// ---------- Kingswood props ----------
// Alarm bell on a post. Frames: still, swinging left, swinging right; broken.
export function bakeBell() {
  const mk = (tilt, broken) => { const [c, g] = canvas(16, 24); rect(g, 7, 6, 2, 18, '#5c3a1d'); rect(g, 2, 4, 12, 3, '#5c3a1d'); rect(g, 2, 4, 12, 1, '#7a4e28');
    if (broken) { fillPoly(g, [[5, 8], [11, 8], [13, 16], [3, 16]], '#8a7a3a'); rect(g, 4, 17, 3, 2, '#b8842a'); rect(g, 9, 18, 3, 2, '#b8842a'); return outline(c, OUT); }
    g.save(); g.translate(8, 7); g.rotate(tilt); fillPoly(g, [[-3, 0], [3, 0], [5, 8], [-5, 8]], '#e0b040'); rect(g, -5, 8, 10, 2, '#b8842a'); rect(g, -1, 10, 2, 2, '#5c3a1d'); px(g, -2, 2, '#fff6c8'); g.restore(); return outline(c, OUT); };
  return [mk(0, false), mk(-0.5, false), mk(0.5, false), mk(0, true)];
}
// Portcullis tile: iron bars.
export function bakePortcullis(seed) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); for (let x = 1; x < T; x += 4) rect(g, x, 0, 2, T, '#5a6270'); for (let y = 2; y < T; y += 6) rect(g, 0, y, T, 2, '#7c8797'); for (let i = 0; i < 3; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, '#9aa3b0'); return c; }
// The log ram: a heavy log with iron bands, drawn along its swing.
export function bakeRamLog() { const [c, g] = canvas(12, 40); rect(g, 2, 0, 8, 40, '#5c3a1d'); rect(g, 2, 0, 2, 40, '#7a4e28'); rect(g, 8, 0, 2, 40, '#3d2712'); for (const y of [6, 20, 34]) { rect(g, 1, y, 10, 3, '#5a6270'); rect(g, 1, y, 10, 1, '#9aa3b0'); } for (let i = 0; i < 6; i++) px(g, 4 + (i % 3), 3 + i * 6, '#3d2712'); rect(g, 0, 36, 12, 4, '#7c8797'); return outline(c, OUT); }
// A lever post for the ram.
export function bakeLever(on) { const [c, g] = canvas(10, 14); rect(g, 3, 6, 4, 8, '#5a6270'); rect(g, 3, 6, 4, 1, '#9aa3b0'); line(g, 5, 8, on ? 9 : 1, 1, '#c9d1dc', 2); px(g, on ? 9 : 1, 1, '#c9463d'); return outline(c, OUT); }
// Pressure plate.
export function bakePlate(down) { const [c, g] = canvas(T, 6); rect(g, 1, down ? 4 : 2, T - 2, down ? 2 : 4, '#7c8797'); rect(g, 1, down ? 4 : 2, T - 2, 1, '#9aa3b0'); return c; }
// The King's palanquin: a gilded throne on carrying poles. 48×30; the bearers are drawn separately.
export function bakePalanquin() {
  const [c, g] = canvas(48, 30);
  rect(g, 0, 22, 48, 3, '#5c3a1d'); rect(g, 0, 22, 48, 1, '#7a4e28');
  rect(g, 10, 4, 28, 20, '#8f2f28'); rect(g, 12, 6, 24, 16, '#c9463d'); rect(g, 12, 6, 24, 2, '#e07060');
  rect(g, 8, 2, 4, 22, '#e0b040'); rect(g, 36, 2, 4, 22, '#e0b040'); rect(g, 8, 0, 32, 3, '#e0b040'); rect(g, 8, 0, 32, 1, '#fff6c8');
  for (const x of [9, 22, 37]) px(g, x, 1, '#c9463d');
  rect(g, 14, 18, 20, 6, '#b8842a'); rect(g, 14, 18, 20, 1, '#e0b040');
  return outline(c, OUT);
}
// Autumn tree canopy for the near layer: rust, amber and gold lobes on dark trunks.
export function bakeNearAutumn(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const trunks = []; for (let i = 0; i < w / 72; i++) trunks.push({ x: rnd() * w, wd: 10 + rnd() * 6, cy: 60 + rnd() * 50 });
  const cols = [['#8a3a1a', '#b8541c', '#d9782a', '#f0a040'], ['#7a2a1a', '#a83a2a', '#c9463d', '#e07060'], ['#8a5a1a', '#b8842a', '#e0b040', '#ffd36b']];
  for (const t of trunks) for (const dx of [-w, 0, w]) { const x = Math.round(t.x + dx), wd = Math.round(t.wd); rect(g, x, t.cy, wd, h, '#3a2618'); rect(g, x, t.cy, 3, h, '#5a3a24'); rect(g, x + wd - 3, t.cy, 3, h, '#241a10'); for (let k = 0; k < h / 5; k++) rect(g, x + 3 + ((rnd() * (wd - 6)) | 0), t.cy + ((rnd() * (h - t.cy)) | 0), 1, 2 + ((rnd() * 4) | 0), rnd() < 0.5 ? '#5a3a24' : '#241a10');
    const pal = cols[(rnd() * 3) | 0]; const cx = x + wd / 2;
    for (let k = 0; k < 5; k++) { const lx = cx + (rnd() - 0.5) * 60, ly = t.cy - 6 - rnd() * 30, r = 16 + rnd() * 14; ellipse(g, lx, ly, r, r * 0.7, pal[1], pal[0]); ellipse(g, lx - r * 0.25, ly - r * 0.3, r * 0.5, r * 0.3, pal[2]); for (let q = 0; q < 6; q++) px(g, Math.round(lx + (rnd() - 0.5) * r * 1.4), Math.round(ly + (rnd() - 0.5) * r), pal[3]); } }
  return c;
}
// Wooden hall interior tiles: planked wall for the ceilings and inner walls.
export function bakeHallWall(seed) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); rect(g, 0, 0, T, T, '#4a3020'); for (let y = 0; y < T; y += 4) { rect(g, 0, y, T, 3, rnd() < 0.5 ? '#5a3a24' : '#513320'); rect(g, 0, y + 3, T, 1, '#2c1a10'); } for (let i = 0; i < 3; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, '#6a4a30'); return c; }
// A goblin door in a trunk (bg), open and shut.
// A goblin house against the trunk: timber walls, a thatched roof, a lit window, a chimney, and a round door that slams. 34×34, open and shut.
export function bakeDoor(shut) {
  const [c, g] = canvas(34, 34);
  rect(g, 3, 14, 28, 20, '#5a3a24'); for (let y = 16; y < 34; y += 4) rect(g, 3, y, 28, 1, '#3d2712'); for (let x = 6; x < 30; x += 8) rect(g, x, 14, 2, 20, '#3a2618');
  fillPoly(g, [[0, 15], [17, 1], [34, 15]], '#8a6a2a'); fillPoly(g, [[3, 14], [17, 3], [31, 14]], '#b8842a'); for (let x = 4; x < 31; x += 3) px(g, x, 6 + (Math.abs(x - 17) >> 1), '#e0b040'); for (let x = 2; x < 33; x += 2) px(g, x, 15, '#5c3a1d');
  rect(g, 24, 2, 4, 9, '#5a6270'); rect(g, 23, 1, 6, 2, '#7c8797');
  rect(g, 21, 19, 7, 7, '#ffd36b'); rect(g, 24, 19, 1, 7, '#3d2712'); rect(g, 21, 22, 7, 1, '#3d2712'); px(g, 22, 20, '#fff6c8');
  ellipse(g, 11, 26, 6, 7, shut ? '#7a4e28' : '#1b1626', '#3d2712'); if (shut) { for (let y = 21; y < 32; y += 3) rect(g, 7, y, 8, 1, '#5c3a1d'); px(g, 14, 27, '#e0b040'); } else { rect(g, 16, 20, 2, 12, '#7a4e28'); px(g, 17, 27, '#e0b040'); }
  rect(g, 6, 12, 2, 2, '#ffd36b'); px(g, 6, 11, '#5c3a1d');
  return outline(c, OUT);
}
// A red carpet strip for the throne room (drawn on the floor row).
export function bakeCarpet() { const [c, g] = canvas(T, 6); rect(g, 0, 0, T, 6, '#8f2f28'); rect(g, 0, 0, T, 1, '#c9463d'); rect(g, 0, 5, T, 1, '#5a1a1a'); for (let x = 2; x < T; x += 5) px(g, x, 3, '#e0b040'); return c; }
// Rust-dawn sky.
export function bakeSkyAutumn(h) { const [c, g] = canvas(1, h); for (let y = 0; y < h; y++) { const t = y / (h - 1), q = Math.round(t * 8) / 8; const r = 70 + q * 170, gg = 40 + q * 120, b = 90 + q * 40; px(g, 0, y, 'rgb(' + (r | 0) + ',' + (gg | 0) + ',' + (b | 0) + ')'); } return c; }

// ---------- The Crags ----------
// Dusk over the hills: violet up top, rose, then a gold band at the horizon.
export function bakeSkyCrag(h) { const [c, g] = canvas(1, h); for (let y = 0; y < h; y++) { const t = y / (h - 1), q = Math.round(t * 9) / 9; const r = 60 + q * 190, gg = 40 + q * 120, b = 110 + q * 20 - Math.max(0, q - 0.7) * 150; px(g, 0, y, 'rgb(' + (r | 0) + ',' + (gg | 0) + ',' + (Math.max(30, b) | 0) + ')'); } return c; }
// Far ridge: blue-grey peaks with snow on the tops. Tiles horizontally.
export function bakeFarCrags(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const ph = [rnd() * 6, rnd() * 6, rnd() * 6];
  const yAt = x => { const u = x / w * Math.PI * 2; return Math.round(30 + 14 * Math.abs(Math.sin(u * 3 + ph[0])) + 8 * Math.abs(Math.sin(u * 7 + ph[1])) + 3 * Math.sin(u * 17 + ph[2])); };
  for (let x = 0; x < w; x++) { const y = yAt(x); rect(g, x, y, 1, h - y, '#6a6f8a'); if (y < 40) rect(g, x, y, 1, Math.min(4, 40 - y), '#e8ecf4'); if ((x % 5) < 2) rect(g, x, y + 6, 1, h, '#5e6380'); }
  for (let x = 0; x < w; x += 3) { const y = yAt(x); if (rnd() < 0.3) px(g, x, y + 8 + ((rnd() * 20) | 0), '#7a7f9a'); }
  return c;
}
// Mid ridge: heather-purple shoulder of the hill with scree runs and a wind-bent tree or two.
export function bakeMidCrags(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const ph = [rnd() * 6, rnd() * 6];
  const yAt = x => { const u = x / w * Math.PI * 2; return Math.round(44 + 18 * Math.sin(u * 2 + ph[0]) + 8 * Math.sin(u * 5 + ph[1])); };
  for (let x = 0; x < w; x++) { const y = yAt(x); rect(g, x, y, 1, h - y, '#5a4a6a'); rect(g, x, y, 1, 3, '#7a5a8a'); if ((x % 9) < 3) rect(g, x, y + 10, 1, h, '#4e4060'); }
  for (let i = 0; i < w / 6; i++) { const x = (rnd() * w) | 0, y = yAt(x) + 4 + ((rnd() * 30) | 0); px(g, x, y, rnd() < 0.5 ? '#8a6aa0' : '#6a7a8a'); }
  for (let i = 0; i < w / 60; i++) { const x = (rnd() * w) | 0, y = yAt(x); rect(g, x, y - 10, 2, 12, '#3a2e3a'); for (let k = 0; k < 4; k++) rect(g, x + 2 + k * 2, y - 8 - k, 3, 1, '#3a2e3a'); }
  return c;
}
// Near layer: rocky outcrops, boulders, gorse and heather, the odd rowan. Content sits in the bottom 180px.
export function bakeNearCrag(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const base = h - 120;
  for (let i = 0; i < w / 90; i++) { const x = rnd() * w, wd = 40 + rnd() * 50, ht = 30 + rnd() * 60; for (const dx of [-w, 0, w]) { fillPoly(g, [[x + dx, h], [x + dx + wd * 0.2, base + 120 - ht], [x + dx + wd * 0.55, base + 110 - ht], [x + dx + wd, h]], '#4a4458'); fillPoly(g, [[x + dx + wd * 0.2, base + 120 - ht], [x + dx + wd * 0.55, base + 110 - ht], [x + dx + wd * 0.5, base + 120 - ht + 8], [x + dx + wd * 0.25, base + 128 - ht]], '#5e5870'); for (let k = 0; k < 8; k++) px(g, Math.round(x + dx + wd * (0.2 + rnd() * 0.6)), Math.round(h - rnd() * ht * 0.8), '#3a3448'); } }
  for (let i = 0; i < w / 40; i++) { const x = rnd() * w, y = h - 8 - rnd() * 30, r = 4 + rnd() * 6; for (const dx of [-w, 0, w]) { ellipse(g, x + dx, y, r, r * 0.6, '#6a6f7a', '#4a4f5a'); ellipse(g, x + dx - r * 0.3, y - r * 0.2, r * 0.4, r * 0.25, '#8a8f9a'); } }
  for (let i = 0; i < w / 18; i++) { const x = rnd() * w, y = h - 4 - rnd() * 40; const heather = rnd() < 0.6; for (const dx of [-w, 0, w]) { ellipse(g, x + dx, y, 6 + rnd() * 5, 3 + rnd() * 2, heather ? '#6a4a7a' : '#4a6a3a', heather ? '#4a3a5a' : '#3a4a2a'); for (let k = 0; k < 4; k++) px(g, Math.round(x + dx + (rnd() - 0.5) * 8), Math.round(y - 1 - rnd() * 3), heather ? '#a07ab8' : '#e0c040'); } }
  for (let i = 0; i < w / 160; i++) { const x = rnd() * w, y = h - 20 - rnd() * 30; for (const dx of [-w, 0, w]) { rect(g, x + dx, y, 3, 40, '#3a2e2a'); rect(g, x + dx + 3, y + 6, 8, 2, '#3a2e2a'); rect(g, x + dx + 9, y + 2, 6, 2, '#3a2e2a'); ellipse(g, x + dx + 8, y - 4, 12, 7, '#7a4a3a', '#5a3a2a'); ellipse(g, x + dx + 4, y - 7, 6, 4, '#a86a4a'); for (let k = 0; k < 6; k++) px(g, Math.round(x + dx + (rnd() - 0.5) * 20 + 8), Math.round(y - 4 + (rnd() - 0.5) * 8), '#c9463d'); } }
  return c;
}
// Ground dressing: heather tuft, gorse bush, thistle, standing stone, cairn.
export function bakeHeather(seed) { const rnd = mulberry(seed); const [c, g] = canvas(12, 7); ellipse(g, 6, 5, 5, 2.5, '#5a4a6a', '#3a2e3a'); for (let i = 0; i < 7; i++) { const x = 1 + ((rnd() * 10) | 0), y = 1 + ((rnd() * 4) | 0); px(g, x, y, rnd() < 0.5 ? '#a07ab8' : '#c9a0e0'); } return c; }
export function bakeGorse(seed) { const rnd = mulberry(seed); const [c, g] = canvas(18, 12); ellipse(g, 9, 8, 8, 4, '#3a5a2a', '#2a3a1a'); ellipse(g, 7, 5, 5, 3, '#4a6a3a'); for (let i = 0; i < 9; i++) px(g, 2 + ((rnd() * 14) | 0), 2 + ((rnd() * 8) | 0), rnd() < 0.7 ? '#e0c040' : '#ffe070'); return outline(c, OUT); }
export function bakeThistle(seed) { const rnd = mulberry(seed); const [c, g] = canvas(8, 14); rect(g, 3, 5, 2, 9, '#4a6a3a'); for (let i = 0; i < 3; i++) rect(g, rnd() < 0.5 ? 0 : 5, 7 + i * 2, 3, 1, '#4a6a3a'); ellipse(g, 4, 4, 2.5, 3, '#6a8a4a'); ellipse(g, 4, 2, 2.5, 2, '#b070d0', '#8a4aa0'); px(g, 3, 1, '#e0a0f0'); return outline(c, OUT); }
export function bakeStandingStone(seed) { const rnd = mulberry(seed); const [c, g] = canvas(16, 30); const w = 8 + ((rnd() * 5) | 0); fillPoly(g, [[3, 30], [4, 4], [4 + w * 0.4, 1], [3 + w, 3], [4 + w, 30]], '#7c8797'); fillPoly(g, [[4, 30], [5, 5], [5 + w * 0.3, 3], [5, 30]], '#9aa3b0'); for (let i = 0; i < 6; i++) px(g, 5 + ((rnd() * (w - 2)) | 0), 4 + ((rnd() * 24) | 0), rnd() < 0.5 ? '#5a6270' : '#8fb060'); return outline(c, OUT); }
export function bakeCairn() { const [c, g] = canvas(12, 14); for (const [x, y, w] of [[1, 11, 10], [2, 8, 8], [3, 5, 6], [4, 2, 4]]) { rect(g, x, y, w, 3, '#7c8797'); rect(g, x, y, w, 1, '#9aa3b0'); rect(g, x, y + 2, w, 1, '#5a6270'); } return outline(c, OUT); }
// Dry-stone wall tile and its cap: flat stones stacked without mortar.
export function bakeDrystone(seed) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); rect(g, 0, 0, T, T, '#4a4f5a'); for (let y = 0; y < T; y += 4) { let x = (y / 4) % 2 ? 2 : 0; while (x < T) { const w = 3 + ((rnd() * 4) | 0); rect(g, x, y, Math.min(w, T - x), 3, rnd() < 0.5 ? '#7c8797' : '#6a707c'); px(g, x, y, '#9aa3b0'); x += w + 1; } } return c; }
export function bakeDrystoneTop(seed) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); rect(g, 0, 0, T, T, '#4a4f5a'); for (let y = 3; y < T; y += 4) { let x = (y / 4) % 2 ? 2 : 0; while (x < T) { const w = 3 + ((rnd() * 4) | 0); rect(g, x, y, Math.min(w, T - x), 3, rnd() < 0.5 ? '#7c8797' : '#6a707c'); px(g, x, y, '#9aa3b0'); x += w + 1; } } for (let x = 0; x < T; x += 3) { rect(g, x, 0, 2, 3, '#8a919c'); px(g, x, 0, '#b0b8c4'); } return c; }
// Scree: a loose grey top tile. Anything standing on it slides.
export function bakeScreeTop(seed, dir) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); rect(g, 0, 0, T, T, '#4a4f5a'); rect(g, 0, 0, T, 5, '#6a707c'); for (let i = 0; i < 14; i++) { const x = (rnd() * T) | 0, y = (rnd() * T) | 0; rect(g, x, y, 2, 1, rnd() < 0.5 ? '#8a919c' : '#5a6270'); } for (let i = 0; i < 3; i++) { const x = 2 + i * 5; px(g, x + (dir > 0 ? 1 : 0), 2, '#b0b8c4'); px(g, x, 3, '#9aa3b0'); } return c; }
// A falling boulder, 14×12, and its shatter is particles.
export function bakeBoulder() { const [c, g] = canvas(14, 12); ellipse(g, 7, 6, 6.5, 5.5, '#6a707c', '#4a4f5a'); ellipse(g, 5, 4, 3, 2, '#9aa3b0'); px(g, 9, 8, '#4a4f5a'); px(g, 3, 8, '#4a4f5a'); return outline(c, OUT); }
// The shepherd's bothy: a stone hut with a turf roof, a lit window and a chimney. 56×40.
export function bakeBothy() {
  const [c, g] = canvas(56, 40);
  rect(g, 4, 16, 48, 24, '#6a707c'); for (let y = 16; y < 40; y += 4) for (let x = 4; x < 52; x += 6) { rect(g, x + ((y / 4) % 2 ? 3 : 0), y, 5, 3, ((x + y) % 5) ? '#7c8797' : '#5e6470'); }
  fillPoly(g, [[0, 18], [28, 2], [56, 18]], '#4a6a3a'); fillPoly(g, [[3, 17], [28, 4], [53, 17]], '#5a7a4a'); for (let x = 6; x < 50; x += 5) px(g, x, 10 + Math.abs(x - 28) / 4 | 0, '#6a8a4a');
  rect(g, 40, 2, 5, 12, '#5a6270'); rect(g, 39, 1, 7, 2, '#7c8797');
  rect(g, 10, 24, 10, 16, '#3a2e22'); rect(g, 11, 25, 8, 14, '#2c2018'); px(g, 17, 32, '#e0b040');
  rect(g, 30, 24, 12, 10, '#ffd36b'); rect(g, 35, 24, 2, 10, '#5a4a3a'); rect(g, 30, 28, 12, 2, '#5a4a3a'); rect(g, 31, 25, 3, 2, '#fff6c8');
  return outline(c, OUT);
}
// The windmill tower: tapered stone, a door, and the hub the sails turn on at the top. 44×80.
export function bakeMill() {
  const [c, g] = canvas(44, 80);
  fillPoly(g, [[6, 80], [12, 14], [32, 14], [38, 80]], '#6a707c'); fillPoly(g, [[8, 80], [13, 16], [20, 16], [18, 80]], '#7c8797');
  for (let y = 18; y < 80; y += 5) for (let x = 12; x < 32; x += 6) { const inset = (y - 14) / 66 * 6; rect(g, x - inset + ((y / 5) % 2 ? 2 : 0), y, 4, 3, ((x + y) % 7) ? '#6e7480' : '#5a6070'); }
  fillPoly(g, [[8, 16], [22, 2], [36, 16]], '#4a3a2a'); fillPoly(g, [[11, 15], [22, 4], [33, 15]], '#5c4a34');
  rect(g, 17, 62, 10, 18, '#3a2e22'); rect(g, 18, 63, 8, 16, '#2c2018');
  rect(g, 19, 30, 6, 8, '#2a2f3d'); rect(g, 20, 31, 2, 2, '#ffd36b');
  circle(g, 22, 22, 4, '#3a2e22'); circle(g, 22, 22, 2, '#8a5a32');
  return outline(c, OUT);
}
// A sail arm: drawn along +y from the hub, 10×46 — rotated in place by the drawer.
export function bakeSail() { const [c, g] = canvas(10, 46); rect(g, 4, 0, 2, 46, '#5c3a1d'); for (let y = 6; y < 44; y += 5) rect(g, 0, y, 9, 4, '#e8dcc0'); for (let y = 6; y < 44; y += 5) rect(g, 0, y, 9, 1, '#c9b27c'); rect(g, 0, 6, 1, 38, '#5c3a1d'); return c; }
// The sheep-fold gate at the Ram Lord's arena: two stone posts with a hurdle. 24×22.
export function bakeFoldGate() { const [c, g] = canvas(24, 22); rect(g, 0, 2, 4, 20, '#7c8797'); rect(g, 20, 2, 4, 20, '#7c8797'); rect(g, 0, 2, 4, 1, '#9aa3b0'); rect(g, 20, 2, 4, 1, '#9aa3b0'); for (let y = 6; y < 20; y += 4) rect(g, 4, y, 16, 2, '#8a5a32'); rect(g, 11, 4, 2, 16, '#5c3a1d'); return outline(c, OUT); }
// A fleece for the relic set.
export function bakeFleeceIcon() { const [c, g] = canvas(10, 12); ellipse(g, 5, 6, 4.5, 4, '#ffe6a0', '#c9a83a'); for (const [x, y] of [[2, 4], [5, 3], [8, 5], [4, 8], [7, 8]]) px(g, x, y, '#fff6c8'); px(g, 5, 6, '#e0b040'); return outline(c, OUT); }

// ---------- scenery pass ----------
// A fallen log with a broken end and moss, 30×10.
export function bakeFallenLog(seed) { const rnd = mulberry(seed); const [c, g] = canvas(30, 10); rect(g, 0, 2, 28, 7, C.wood); rect(g, 0, 2, 28, 1, C.woodL); rect(g, 0, 7, 28, 2, C.woodD); fillPoly(g, [[27, 2], [30, 4], [29, 7], [27, 9]], C.woodD); for (let i = 0; i < 6; i++) rect(g, 2 + ((rnd() * 22) | 0), 3 + ((rnd() * 4) | 0), 3, 1, C.woodD); for (let i = 0; i < 4; i++) px(g, 1 + ((rnd() * 24) | 0), 1 + ((rnd() * 2) | 0), '#5aa33e'); rect(g, 3, 0, 4, 2, '#2f5e3a'); return outline(c, OUT); }
// A stretch of wooden fence, 32×12.
export function bakeFence(seed) { const rnd = mulberry(seed); const [c, g] = canvas(32, 12); for (const x of [1, 15, 29]) { rect(g, x, 0, 2, 12, C.wood); px(g, x, 0, C.woodL); } rect(g, 0, 3, 32, 2, C.woodL); rect(g, 0, 7, 32, 2, C.wood); for (let i = 0; i < 3; i++) px(g, (rnd() * 32) | 0, 3 + ((rnd() * 6) | 0), C.woodD); return outline(c, OUT); }
// A hand cart with a load, 24×16.
export function bakeCart(seed) { const rnd = mulberry(seed); const [c, g] = canvas(24, 16); rect(g, 2, 4, 18, 7, C.wood); rect(g, 2, 4, 18, 1, C.woodL); rect(g, 19, 8, 5, 1, C.woodD); for (let i = 0; i < 5; i++) ellipse(g, 5 + i * 3, 3 - ((rnd() * 2) | 0), 2, 2, rnd() < 0.5 ? '#c9b27c' : '#8a5a32'); circle(g, 7, 12, 3, '#3a2618', '#5c3a1d'); circle(g, 16, 12, 3, '#3a2618', '#5c3a1d'); px(g, 7, 12, C.woodL); px(g, 16, 12, C.woodL); return outline(c, OUT); }
// A stone well with a roof, 20×24.
export function bakeWell() { const [c, g] = canvas(20, 24); rect(g, 3, 14, 14, 10, '#6a707c'); for (let y = 14; y < 24; y += 3) for (let x = 3; x < 17; x += 5) rect(g, x + ((y / 3) % 2 ? 2 : 0), y, 4, 2, '#7c8797'); rect(g, 5, 16, 10, 3, '#1b1626'); rect(g, 2, 4, 2, 12, C.wood); rect(g, 16, 4, 2, 12, C.wood); fillPoly(g, [[0, 6], [10, 0], [20, 6]], C.woodD); fillPoly(g, [[2, 6], [10, 2], [18, 6]], C.wood); rect(g, 9, 6, 2, 8, '#5a6270'); rect(g, 8, 10, 4, 3, '#8a5a32'); return outline(c, OUT); }

// ---------- the store as a room, and more scenery ----------
// The keeper's counter: a plank top on a panelled front, coins and a ledger on it. 48×18.
export function bakeCounter() { const [c, g] = canvas(48, 18); rect(g, 2, 6, 44, 12, C.wood); rect(g, 2, 6, 44, 1, C.woodL); for (let x = 6; x < 46; x += 8) rect(g, x, 9, 1, 8, C.woodD); rect(g, 0, 4, 48, 3, C.woodL); rect(g, 0, 6, 48, 1, C.woodD); rect(g, 8, 1, 10, 3, '#e8dcc0'); rect(g, 8, 1, 10, 1, '#c9b27c'); for (const x of [30, 34, 38]) { rect(g, x, 2, 3, 2, '#e0b040'); px(g, x, 2, '#fff6c8'); } return outline(c, OUT); }
// Shelves of wares: bottles, a helm, a shield, sacks. 32×30, two arrangements.
export function bakeWares(v) { const [c, g] = canvas(32, 30); rect(g, 0, 0, 32, 30, '#3a2618'); for (const y of [8, 18, 28]) { rect(g, 0, y, 32, 2, C.wood); rect(g, 0, y, 32, 1, C.woodL); }
  if (v === 0) { rect(g, 3, 3, 3, 5, '#4aa0b0'); rect(g, 8, 2, 3, 6, '#c9463d'); rect(g, 13, 4, 3, 4, '#8fd160'); rect(g, 20, 1, 8, 7, '#c9d1dc'); rect(g, 21, 4, 6, 2, '#1b1626'); rect(g, 2, 12, 6, 6, '#c9b27c'); rect(g, 12, 11, 5, 7, '#8a5a32'); ellipse(g, 24, 14, 5, 4, '#c9463d', '#8f2f28'); px(g, 24, 13, '#e0b040'); rect(g, 4, 22, 8, 6, '#b8a888'); rect(g, 18, 21, 4, 7, '#7c8797'); rect(g, 25, 23, 5, 5, '#e0b040'); }
  else { rect(g, 2, 2, 8, 6, '#8a5a32'); rect(g, 14, 1, 3, 7, '#e0b040'); rect(g, 20, 3, 4, 5, '#9a5aa8'); rect(g, 27, 2, 3, 6, '#4aa0b0'); rect(g, 3, 11, 10, 7, '#5a6270'); rect(g, 4, 12, 8, 1, '#9aa3b0'); rect(g, 18, 12, 5, 6, '#c9b27c'); rect(g, 26, 10, 4, 8, '#3f6e2c'); rect(g, 2, 22, 5, 6, '#c9463d'); rect(g, 10, 21, 8, 7, '#b8a888'); rect(g, 22, 23, 8, 5, '#8a5a32'); }
  return outline(c, OUT); }
// The shop door, 20×30: a heavy plank door with a lit fanlight.
export function bakeShopDoor() { const [c, g] = canvas(20, 30); rect(g, 0, 0, 20, 30, '#3a2618'); rect(g, 2, 6, 16, 24, C.wood); for (let y = 8; y < 30; y += 5) rect(g, 2, y, 16, 1, C.woodD); rect(g, 9, 6, 2, 24, C.woodD); ellipse(g, 10, 4, 7, 3, '#ffd36b', '#b8842a'); px(g, 14, 18, '#e0b040'); return outline(c, OUT); }
// A lantern on a post, lit. 8×28.
export function bakeLanternPost() { const [c, g] = canvas(8, 28); rect(g, 3, 6, 2, 22, C.wood); rect(g, 1, 4, 6, 3, C.woodD); rect(g, 2, 7, 4, 6, '#ffd36b'); rect(g, 3, 8, 2, 3, '#fff6c8'); rect(g, 1, 13, 6, 1, C.woodD); rect(g, 3, 0, 2, 4, C.woodD); return outline(c, OUT); }
// A straw skep beehive on a stand. 12×14.
export function bakeBeehive() { const [c, g] = canvas(12, 14); rect(g, 1, 12, 10, 2, C.woodD); ellipse(g, 6, 7, 5.5, 6, '#e0b040', '#b8842a'); for (let y = 3; y < 12; y += 2) rect(g, 2, y, 8, 1, '#b8842a'); rect(g, 5, 9, 2, 2, '#3a2618'); px(g, 9, 2, '#1b1626'); px(g, 2, 5, '#1b1626'); return outline(c, OUT); }
// A birdhouse on a pole with a bird on the perch. 10×22.
export function bakeBirdhouse() { const [c, g] = canvas(10, 22); rect(g, 4, 10, 2, 12, C.wood); fillPoly(g, [[0, 4], [5, 0], [10, 4]], '#8f2f28'); rect(g, 1, 4, 8, 7, C.wood); rect(g, 1, 4, 8, 1, C.woodL); circle(g, 5, 7, 1.5, '#1b1626'); rect(g, 3, 10, 4, 1, C.woodD); px(g, 8, 9, '#4aa0b0'); px(g, 9, 9, '#4aa0b0'); px(g, 8, 8, '#4aa0b0'); return outline(c, OUT); }
// A wicker fish trap on the bank. 16×10.
export function bakeFishTrap(seed) { const rnd = mulberry(seed); const [c, g] = canvas(16, 10); ellipse(g, 8, 6, 7, 3.5, '#8a5a32', '#5c3a1d'); for (let x = 2; x < 14; x += 3) rect(g, x, 3, 1, 6, '#5c3a1d'); for (let y = 4; y < 9; y += 2) rect(g, 1, y, 14, 1, '#a86a4a'); rect(g, 14, 4, 2, 4, '#3a2618'); if (rnd() < 0.5) px(g, 6, 5, '#c9d1dc'); return outline(c, OUT); }
// A rack of goblin spears. 18×18.
export function bakeSpearRack() { const [c, g] = canvas(18, 18); rect(g, 1, 14, 16, 2, C.woodD); rect(g, 1, 8, 16, 1, C.wood); for (let i = 0; i < 4; i++) { const x = 3 + i * 4; rect(g, x, 3, 1, 13, '#8a5a32'); rect(g, x - 1, 0, 3, 4, '#c9d1dc'); px(g, x, 0, '#fff6e0'); } return outline(c, OUT); }
// Three barrels stacked. 26×20.
export function bakeBarrelStack() { const [c, g] = canvas(26, 20); const b = (x, y) => { rect(g, x, y, 10, 10, C.wood); rect(g, x, y + 2, 10, 1, '#5a6270'); rect(g, x, y + 7, 10, 1, '#5a6270'); rect(g, x + 4, y, 1, 10, C.woodD); rect(g, x, y, 1, 10, C.woodL); }; b(2, 10); b(14, 10); b(8, 0); return outline(c, OUT); }
// Scattered bones. 16×6.
export function bakeBones(seed) { const rnd = mulberry(seed); const [c, g] = canvas(16, 6); rect(g, 1, 3, 8, 1, '#e8dcc0'); px(g, 0, 2, '#e8dcc0'); px(g, 9, 4, '#e8dcc0'); rect(g, 10, 1, 5, 1, '#c9b27c'); px(g, 15, 0, '#c9b27c'); circle(g, 12, 4, 1.5, '#e8dcc0'); if (rnd() < 0.5) px(g, 4, 5, '#c9b27c'); return outline(c, OUT); }
// Charm icons for the store: lucky, iron, feather, heart, swift.
export function bakeCharms() {
  const mk = f => { const [c, g] = canvas(10, 12); f(g); return outline(c, OUT); };
  return {
    lucky: mk(g => { rect(g, 4, 0, 2, 2, '#8a5a32'); circle(g, 5, 7, 4, '#ffd34a', '#b8842a'); px(g, 3, 5, '#fff6c8'); rect(g, 4, 6, 2, 3, '#b8842a'); }),
    iron: mk(g => { rect(g, 2, 1, 6, 9, '#7c8797'); rect(g, 2, 1, 6, 1, '#c9d1dc'); rect(g, 2, 1, 1, 9, '#c9d1dc'); rect(g, 4, 4, 2, 4, '#3a3448'); }),
    feather: mk(g => { fillPoly(g, [[8, 0], [2, 6], [1, 11], [6, 6]], '#c9d1dc'); fillPoly(g, [[8, 0], [4, 5], [3, 9]], '#e8ecf4'); rect(g, 1, 10, 2, 2, '#7c8797'); }),
    heart: mk(g => { rect(g, 1, 3, 3, 3, '#e04848'); rect(g, 6, 3, 3, 3, '#e04848'); rect(g, 1, 5, 8, 3, '#e04848'); rect(g, 2, 8, 6, 2, '#e04848'); rect(g, 4, 10, 2, 1, '#e04848'); px(g, 2, 4, '#ff9a9a'); }),
    swift: mk(g => { rect(g, 1, 2, 7, 2, '#8fd160'); rect(g, 3, 5, 6, 2, '#8fd160'); rect(g, 1, 8, 8, 2, '#8fd160'); px(g, 8, 2, '#dfffa0'); px(g, 9, 8, '#dfffa0'); }),
  };
}


// ---------- The lower woods: quest items, the woodsman's cabin, the felled pine, the sluice, the siege engine, the puffball nest ----------
export function bakeHoneyPot() { const [c, g] = canvas(12, 12); rect(g, 3, 4, 6, 6, '#c9a83a'); rect(g, 2, 5, 8, 4, '#e0b040'); rect(g, 4, 2, 4, 3, '#b8a888'); rect(g, 3, 3, 6, 1, '#e8dcc0'); px(g, 3, 6, '#fff6c8'); px(g, 4, 6, '#fff6c8'); return outline(c); }
export function bakeCoffer() { const [c, g] = canvas(14, 11); rect(g, 2, 4, 10, 5, C.wood); rect(g, 2, 2, 10, 3, C.woodL); rect(g, 2, 4, 10, 1, C.woodD); rect(g, 6, 2, 2, 7, '#7c8797'); px(g, 6, 5, '#e0b040'); px(g, 7, 5, '#e0b040'); return outline(c); }
export function bakeBrightCap() { const [c, g] = canvas(12, 13); rect(g, 5, 7, 2, 5, '#e8e0d0'); ellipse(g, 6, 5, 4.5, 3.5, '#7fe0e8', '#4aa0b0'); px(g, 4, 3, '#ffffff'); px(g, 5, 3, '#ffffff'); px(g, 8, 5, '#fff6c8'); return outline(c); }
export function bakeQuestIcon() { const [c, g] = canvas(10, 10); rect(g, 2, 1, 6, 8, '#e8dcc0'); rect(g, 1, 1, 2, 8, '#c9b27c'); rect(g, 7, 1, 2, 8, '#c9b27c'); for (const y of [3, 5, 7]) rect(g, 3, y, 4, 1, '#8a5a32'); return c; }
// The woodsman's log cabin. 44×32, background.
export function bakeCabin() { const [c, g] = canvas(44, 32); rect(g, 4, 14, 36, 18, C.wood); for (let y = 15; y < 32; y += 4) rect(g, 4, y, 36, 1, C.woodD); rect(g, 4, 14, 36, 1, C.woodL); fillPoly(g, [[0, 15], [22, 0], [44, 15]], '#5c3a1d'); fillPoly(g, [[3, 14], [22, 2], [41, 14]], '#7a4e28', '#5c3a1d'); rect(g, 30, 5, 5, 8, '#6a707c'); rect(g, 30, 4, 5, 1, '#8b8378'); rect(g, 19, 20, 7, 12, '#2a1a10'); rect(g, 20, 21, 5, 11, '#3a2618'); px(g, 24, 26, '#e0b040'); rect(g, 8, 18, 6, 6, '#ffd36b'); rect(g, 10, 18, 1, 6, C.woodD); rect(g, 8, 20, 6, 1, C.woodD); return c; }
// A tall pine, 18×66, base at the bottom centre. Four sword strokes fell it.
export function bakePine() { const [c, g] = canvas(18, 66); rect(g, 7, 24, 5, 42, '#5c3a1d'); rect(g, 7, 24, 1, 42, '#7a4e28'); rect(g, 11, 24, 1, 42, '#3a2214'); for (let y = 28; y < 64; y += 9) px(g, 9, y, '#3a2214'); fillPoly(g, [[9, 0], [2, 16], [16, 16]], '#2f5e3a', '#264a2f'); fillPoly(g, [[9, 8], [1, 26], [17, 26]], '#3f7a48', '#2f5e3a'); fillPoly(g, [[9, 16], [0, 34], [18, 34]], '#57964f', '#3f7a48'); return outline(c); }
// The same pine lying across a gap: len tiles long, crown to the right.
export function bakeFallenPine(len) { const w = len * 16; const [c, g] = canvas(w, 16); rect(g, 0, 4, w - 26, 9, '#5c3a1d'); rect(g, 0, 4, w - 26, 1, '#7a4e28'); rect(g, 0, 12, w - 26, 1, '#3a2214'); for (let x = 6; x < w - 26; x += 11) rect(g, x, 6, 1, 5, '#3a2214'); ellipse(g, 1, 8, 2, 4.5, '#c9b27c', '#8a5a32'); fillPoly(g, [[w - 30, 8], [w - 14, 0], [w - 14, 16]], '#2f5e3a', '#264a2f'); fillPoly(g, [[w - 22, 8], [w - 6, 1], [w - 6, 15]], '#3f7a48', '#2f5e3a'); fillPoly(g, [[w - 14, 8], [w - 1, 3], [w - 1, 13]], '#57964f', '#3f7a48'); return outline(c); }
// The sluice wheel on its post. 16×24. Closed: spokes upright; open: spokes turned.
export function bakeSluice(open) { const [c, g] = canvas(16, 24); rect(g, 7, 10, 3, 14, '#5c3a1d'); rect(g, 7, 10, 1, 14, '#7a4e28'); rect(g, 2, 21, 12, 3, '#6a707c'); rect(g, 2, 21, 12, 1, '#8b8378'); circle(g, 8, 7, 6, '#8b8378'); circle(g, 8, 7, 4, '#b3aca0'); if (open) { line(g, 4, 3, 12, 11, OUT); line(g, 12, 3, 4, 11, OUT); } else { line(g, 8, 1, 8, 13, OUT); line(g, 2, 7, 14, 7, OUT); } px(g, 8, 7, '#5f5a52'); return outline(c); }
// The goblins' siege engine. 36×28. Frames: cocked, fired, wrecked.
export function bakeCatapult(f) { const [c, g] = canvas(36, 28); rect(g, 3, 20, 30, 4, C.wood); rect(g, 3, 20, 30, 1, C.woodL); circle(g, 8, 24, 3.5, '#5f5a52'); circle(g, 28, 24, 3.5, '#5f5a52'); px(g, 8, 24, '#8b8378'); px(g, 28, 24, '#8b8378');
  if (f < 2) { fillPoly(g, [[12, 20], [17, 6], [19, 6], [24, 20]], '#7a4e28', '#5c3a1d'); rect(g, 15, 9, 6, 2, '#5f5a52');
    if (f === 0) { line(g, 24, 19, 6, 5, '#8a5a32', 2); rect(g, 3, 2, 6, 4, '#8b8378'); rect(g, 4, 3, 4, 2, '#5f5a52'); ellipse(g, 6, 1, 3, 1.5, C.wood, C.woodD); }
    else { line(g, 14, 19, 33, 3, '#8a5a32', 2); rect(g, 29, 0, 6, 4, '#8b8378'); rect(g, 30, 1, 4, 2, '#5f5a52'); } }
  else { fillPoly(g, [[12, 20], [15, 12], [17, 12], [20, 20]], '#7a4e28', '#5c3a1d'); line(g, 4, 18, 32, 14, '#8a5a32', 2); rect(g, 22, 12, 5, 4, '#8b8378'); px(g, 10, 17, '#c9b27c'); px(g, 26, 11, '#c9b27c'); px(g, 30, 19, '#c9b27c'); }
  return outline(c); }
// A puffball nest: three ripe balls on a bed of mycelium. 24×18.
export function bakeNest() { const [c, g] = canvas(24, 18); rect(g, 2, 14, 20, 3, '#9a5aa8'); rect(g, 4, 13, 16, 1, '#b07ac0'); ellipse(g, 7, 10, 5.5, 4.5, '#e8e0d0', '#c8bcb0'); ellipse(g, 16, 9, 6, 5, '#e8e0d0', '#c8bcb0'); ellipse(g, 11, 5, 4.5, 3.5, '#f0e8dc', '#d0c4b8'); px(g, 5, 8, '#fff6f0'); px(g, 14, 6, '#fff6f0'); px(g, 10, 3, '#fff6f0'); return outline(c); }

// The kennel chain post: a stake with an iron ring and a hanging chain. 10×26.
export function bakeChainPost() { const [c, g] = canvas(12, 28); rect(g, 4, 2, 4, 26, C.woodD); rect(g, 4, 2, 1, 26, C.wood); rect(g, 2, 0, 8, 3, '#5f5a52'); circle(g, 6, 8, 2.5, '#7c8797'); for (let i = 0; i < 5; i++) { rect(g, 8 + (i % 2), 10 + i * 3, 2, 2, '#8b8378'); } return outline(c); }
// A floor grate for a fire pit. 16×6.
export function bakeGrate() { const [c, g] = canvas(16, 6); rect(g, 0, 2, 16, 4, '#3a3a44'); for (let x = 1; x < 16; x += 3) rect(g, x, 1, 1, 5, '#6a707c'); rect(g, 0, 1, 16, 1, '#8b8378'); return c; }

// Silver coin: three hide in every wood. Four spin frames like the gold one.
export function bakeSilver() {
  const pal = { y: '#c9d1dc', Y: '#ffffff', d: '#7c8797', D: '#4a5260' };
  const f = rows => outline(fromGrid(rows, pal, 1), OUT);
  return [f(['.yyyy.', 'yYyyyy', 'yYdddy', 'yydddy', 'ydyyyd', '.dddd.']), f(['..yy..', '.Yyyd.', '.Ydyd.', '.yyyd.', '.dyyd.', '..dd..']), f(['..y...', '..Yd..', '..Yd..', '..yd..', '..yd..', '..d...']), f(['..yy..', '.Yyyd.', '.Ydyd.', '.yyyd.', '.dyyd.', '..dd..'])];
}
// A hill cottage: stone walls, slate roof, a lit window, a door the folk slam. 36×32.
export function bakeCottage(shut) { const [c, g] = canvas(36, 32); rect(g, 3, 14, 30, 18, '#8a8478'); for (let y = 15; y < 32; y += 4) for (let x = 3 + ((y / 4) | 0) % 2 * 3; x < 33; x += 6) rect(g, x, y, 4, 3, '#7a7468'); rect(g, 3, 14, 30, 1, '#a09a8c'); fillPoly(g, [[0, 15], [18, 0], [36, 15]], '#3a3a48'); fillPoly(g, [[3, 14], [18, 3], [33, 14]], '#4a4a5a', '#3a3a48'); rect(g, 25, 4, 5, 9, '#5a5448'); rect(g, 25, 3, 5, 1, '#8b8378'); if (shut) { rect(g, 15, 20, 7, 12, C.wood); rect(g, 15, 20, 1, 12, C.woodL); px(g, 20, 26, '#e0b040'); } else { rect(g, 15, 20, 7, 12, '#1e1a22'); rect(g, 16, 21, 5, 11, '#2c2630'); } rect(g, 6, 18, 6, 6, '#ffd36b'); rect(g, 8, 18, 1, 6, '#5a5448'); rect(g, 6, 20, 6, 1, '#5a5448'); return c; }

// A dead tree for the rotting half of Sporewood: bare grey trunk, broken limbs, mycelium threads. 28×56, background.
export function bakeDeadTree(seed) { const rnd = mulberry(seed); const [c, g] = canvas(28, 56); rect(g, 11, 14, 6, 42, '#5a5468'); rect(g, 11, 14, 1, 42, '#6e6878'); rect(g, 16, 14, 1, 42, '#3a3444'); line(g, 13, 20, 2, 8, '#5a5468', 2); line(g, 15, 26, 26, 12, '#5a5468', 2); line(g, 13, 14, 9, 2, '#5a5468', 2); line(g, 15, 14, 20, 4, '#5a5468', 1); for (let i = 0; i < 5; i++) { const x = 4 + ((rnd() * 20) | 0), y = 10 + ((rnd() * 20) | 0); line(g, x, y, x, y + 6 + ((rnd() * 8) | 0), 'rgba(200,180,220,0.55)', 1); } for (let i = 0; i < 4; i++) px(g, 10 + ((rnd() * 8) | 0), 30 + ((rnd() * 22) | 0), '#9a5aa8'); return c; }

// A hand lantern, dark: the lamplighter's quest item. 10×12.
// A goblet off Gorm's table: gold, dented, a garnet in the bowl. 10x12.
export function bakeCupIcon() { const [c, g] = canvas(10, 12); rect(g, 2, 1, 6, 5, '#e0b040'); rect(g, 2, 1, 6, 1, '#fff6c8'); rect(g, 3, 6, 4, 1, '#c9a83a'); rect(g, 4, 7, 2, 3, '#c9a83a'); rect(g, 2, 10, 6, 2, '#e0b040'); px(g, 3, 3, '#c9463d'); px(g, 6, 4, '#fff6c8'); return outline(c); }
// A ground lens in a brass ring, off the glassworks benches. 12x12.
export function bakeLensIcon() { const [c, g] = canvas(12, 12); ellipse(g, 6, 6, 5, 5, '#c9a83a'); ellipse(g, 6, 6, 3.6, 3.6, '#bfe6f5', '#7aa8c8'); px(g, 4, 4, '#ffffff'); px(g, 5, 4, '#ffffff'); px(g, 8, 8, '#eefaff'); return outline(c); }
// Climbing spurs: two iron claws on leather straps. 10x12.
export function bakeSpursIcon() { const [c, g] = canvas(10, 12); rect(g, 1, 1, 8, 2, '#8a5a32'); rect(g, 1, 6, 8, 2, '#8a5a32'); for (const y of [3, 8]) for (const x of [2, 5, 7]) { rect(g, x, y, 1, 2, '#c9d1dc'); px(g, x, y + 2, '#7c8797'); } px(g, 1, 1, '#c9b27c'); px(g, 8, 6, '#c9b27c'); return outline(c); }
// The three keys of Stormhold. 9x11 each, hung on a ring.
export function bakeKeyIcon(kind) {
  const C2 = { brass: ['#e0b040', '#c9962a', '#fff1a0'], iron: ['#c9d1dc', '#7c8797', '#eef4ff'], bone: ['#e8e0d0', '#b8a888', '#fff6e0'] }[kind] || ['#e0b040', '#c9962a', '#fff1a0'];
  const [c, g] = canvas(9, 11);
  ellipse(g, 4, 2, 3, 2.5, C2[0], C2[1]); px(g, 4, 2, '#2a2018');
  rect(g, 4, 4, 2, 6, C2[0]); rect(g, 4, 4, 1, 6, C2[2]);
  rect(g, 6, 7, 2, 1, C2[0]); rect(g, 6, 9, 3, 1, C2[0]); px(g, 4, 4, C2[2]);
  return outline(c, OUT);
}
// A lock plate on a barred gate: iron, a keyhole, four rivets. 13x15.
export function bakeLockPlate() {
  const [c, g] = canvas(13, 15); rect(g, 1, 1, 11, 13, '#5f5a52'); rect(g, 1, 1, 11, 1, '#8a8378'); rect(g, 1, 13, 11, 1, '#3a3444');
  for (const [x, y] of [[2, 2], [10, 2], [2, 12], [10, 12]]) px(g, x, y, '#b0b8c4');
  ellipse(g, 6, 6, 2.5, 2.5, '#241e18'); rect(g, 5, 7, 2, 5, '#241e18'); px(g, 6, 5, '#12100c');
  return outline(c, OUT);
}
// A goblin doorway: a plank door in a stone frame, and the same door barred. 20x28, two frames.
export function bakeDoorway() {
  return [0, 1].map(barred => { const [c, g] = canvas(20, 28);
    rect(g, 0, 0, 20, 28, '#4a4440'); rect(g, 0, 0, 20, 2, '#6a6458'); rect(g, 0, 26, 20, 2, '#2c2820');
    rect(g, 2, 2, 16, 26, '#241c14');
    rect(g, 3, 3, 14, 25, '#5c3a1d'); for (let x = 3; x < 17; x += 4) rect(g, x, 3, 1, 25, '#3a2214');
    rect(g, 3, 8, 14, 2, '#7a4e28'); rect(g, 3, 20, 14, 2, '#7a4e28');
    ellipse(g, 14, 15, 1.5, 1.5, '#c9a83a');
    if (barred) { for (const y of [7, 14, 21]) { rect(g, 1, y, 18, 3, '#5f5a52'); rect(g, 1, y, 18, 1, '#8a8378'); } rect(g, 8, 12, 4, 6, '#3a3444'); }
    else { rect(g, 5, 5, 10, 20, 'rgba(255,180,90,0.10)'); }
    return outline(c, OUT); });
}
// A corner of cobweb, three sizes, for a hollow nothing has swept in years. 28x22.
export function bakeCobweb(v) {
  const [c, g] = canvas(28, 22); const r = 10 + v * 6;
  g.strokeStyle = 'rgba(232,220,200,0.55)'; g.lineWidth = 1;
  for (let i = 0; i <= 6; i++) { const a2 = i / 6 * (Math.PI / 2); g.beginPath(); g.moveTo(0.5, 0.5); g.lineTo(Math.cos(a2) * r * 2.4, Math.sin(a2) * r * 2.2); g.stroke(); }
  for (let k = 1; k <= 4; k++) { const rr = r * 0.5 * k; g.beginPath();
    for (let i = 0; i <= 6; i++) { const a2 = i / 6 * (Math.PI / 2), x = Math.cos(a2) * rr * 1.2, y = Math.sin(a2) * rr * 1.1; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke(); }
  g.fillStyle = 'rgba(255,246,224,0.35)'; for (let i = 0; i < 10; i++) g.fillRect((i * 7) % 26, (i * 5) % 20, 1, 1);
  return c;
}
// A spider's orb web, where she hangs: eight spokes and four rings of silk, crisp pixels. 29x29, centre 14,14.
export function bakeOrbWeb() {
  const [c, g] = canvas(29, 29), S = '#eeeaf4', D = '#b8b4c8';
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; line(g, 14, 14, 14 + Math.cos(a) * 13.5, 14 + Math.sin(a) * 13.5, i % 2 ? D : S); }
  for (const r of [4, 7, 10, 13]) { let px0 = null; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2, x = 14 + Math.cos(a) * r, y = 14 + Math.sin(a) * r; if (px0) line(g, px0[0], px0[1], x, y, r === 13 ? S : D); px0 = [x, y]; } }
  px(g, 14, 14, '#ffffff'); for (const [x, y] of [[9, 6], [21, 11], [7, 19], [18, 22]]) px(g, x, y, '#ffffff'); // dew
  return c;
}
// Her sheet on the ground under the drop: a flat tangle of silk and a strand going up. 22x7, bottom row on the floor.
export function bakeGroundWeb() {
  const [c, g] = canvas(22, 7), S = '#eeeaf4', D = '#b8b4c8';
  line(g, 1, 6, 20, 6, D); line(g, 3, 5, 18, 5, S); line(g, 2, 6, 7, 3, S); line(g, 19, 6, 14, 3, S); line(g, 7, 3, 14, 3, D);
  for (const x of [5, 9, 13, 17]) line(g, x, 5, x + (x < 11 ? 2 : -2), 3, D);
  line(g, 10, 3, 11, 0, S); px(g, 11, 0, '#ffffff'); px(g, 6, 5, '#ffffff'); px(g, 15, 4, '#ffffff');
  return c;
}
// A causeway stilt: a tarred pile driven into the bog, a lashing where the plank sits on it. 6x64, top row under the board.
export function bakeStilt() {
  const [c, g] = canvas(6, 64);
  rect(g, 1, 0, 4, 64, '#5c3a1d'); rect(g, 1, 0, 1, 64, '#8a5a32'); rect(g, 4, 0, 1, 64, '#3a2214');
  for (const y of [14, 30, 46]) rect(g, 1, y, 4, 1, '#3a2214');
  rect(g, 0, 2, 6, 3, '#c9b27c'); rect(g, 0, 2, 6, 1, '#e8dcc0'); // the lashing
  rect(g, 1, 48, 4, 16, '#2e3a2a'); // bog-black where it goes in
  return outline(c, OUT);
}
// ---------- THE SUNSPIRE'S FROST ----------
// An icicle under a ledge: a tapered spike, pale at the root. 7 wide, v = 0/1/2 -> 8/11/14 long. Hangs from its top row.
export function bakeIcicle(v) { const len = [8, 11, 14][v % 3], [c, g] = canvas(7, len);
  for (let y = 0; y < len; y++) { const w = Math.max(1, Math.round(5 * (1 - y / len))), x0 = 3 - Math.floor(w / 2); rect(g, x0, y, w, 1, y < 2 ? '#eaf6ff' : '#bfe0f0'); if (w > 1) px(g, x0 + w - 1, y, '#8ab8d4'); if (w > 2 && y % 3 === 1) px(g, x0 + 1, y, '#ffffff'); }
  return c; }
// A frost cluster on the ground: three little shards of ice. 10x7, bottom row on the ground.
export function bakeFrost(v) { const [c, g] = canvas(10, 7);
  const shard = (x, h, col) => { for (let y = 0; y < h; y++) { const w = y < h - 2 ? 1 : 2; rect(g, x - (w > 1 ? 0 : 0), 7 - h + y, w, 1, y === 0 ? '#ffffff' : col); } };
  if (v % 2) { shard(2, 5, '#bfe0f0'); shard(5, 7, '#a8d4ec'); shard(7, 4, '#d6eefa'); } else { shard(1, 4, '#d6eefa'); shard(4, 6, '#a8d4ec'); shard(8, 5, '#bfe0f0'); }
  rect(g, 0, 6, 10, 1, '#8ab8d4'); return c; }
// Someone who came up for the glass and stayed: a block of ice with a figure in it. 18x22, bottom on the ground. v 0 = a goblin, 1 = a climber with a pick.
export function bakeFrozen(v) { const [c, g] = canvas(18, 22);
  rect(g, 1, 2, 16, 20, '#a8d4ec'); rect(g, 2, 3, 14, 18, '#bfe0f0');
  if (v % 2 === 0) { rect(g, 6, 6, 6, 5, '#4f7a58'); rect(g, 4, 7, 2, 2, '#4f7a58'); rect(g, 12, 7, 2, 2, '#4f7a58'); px(g, 7, 8, '#dff2ff'); px(g, 10, 8, '#dff2ff'); rect(g, 6, 11, 6, 6, '#4a3f6a'); rect(g, 5, 12, 1, 4, '#4f7a58'); rect(g, 12, 11, 2, 1, '#4f7a58'); rect(g, 13, 9, 1, 3, '#4f7a58'); rect(g, 6, 17, 2, 3, '#3c5a44'); rect(g, 10, 17, 2, 3, '#3c5a44'); }
  else { rect(g, 7, 5, 4, 4, '#c9a07a'); rect(g, 6, 4, 6, 2, '#6a4a3a'); rect(g, 6, 9, 6, 7, '#7a3a34'); rect(g, 11, 6, 1, 9, '#6a4a2a'); rect(g, 10, 5, 4, 1, '#9aa0aa'); rect(g, 6, 16, 2, 4, '#3a3a44'); rect(g, 10, 16, 2, 4, '#3a3a44'); }
  g.globalAlpha = 0.55; rect(g, 2, 3, 14, 18, '#dff2ff'); g.globalAlpha = 1; // the ice over them
  rect(g, 3, 4, 1, 12, '#ffffff'); rect(g, 4, 4, 3, 1, '#ffffff'); rect(g, 14, 14, 1, 5, '#eaf6ff');
  for (const [x, y] of [[1, 0], [5, 1], [11, 0], [16, 1], [8, 1]]) rect(g, x, y, 2, 3 - (x % 2), '#bfe0f0'); // a rough top
  rect(g, 0, 21, 18, 1, '#8ab8d4'); return outline(c, OUT); }
// ---------- STORMHOLD ----------
// A bridge post: a stone stump with the rope made off round it. 10x22.
export function bakeBridgePost() { const [c, g] = canvas(10, 22); rect(g, 1, 4, 8, 18, '#5a6270'); rect(g, 1, 4, 8, 2, '#8a919c'); rect(g, 1, 20, 8, 2, '#3a3e48');
  for (const y of [8, 12, 16]) { rect(g, 0, y, 10, 2, '#c9b27c'); rect(g, 0, y, 10, 1, '#e8dcc0'); }
  rect(g, 3, 0, 4, 4, '#5a6270'); return outline(c, OUT); }
// A watch tower on a pier: stone, a shutter, a brazier on top. 22x46, background.
export function bakeBridgeTower() { // a pier's watchtower, as wide as the lookout slab it carries. 84x64: the slab sits on rows 16-24, the deck at the bottom
  const [c, g] = canvas(84, 64), S = '#4a4e58', SL = '#6a6e7a', SD = '#2c303a', M = '#3a3e48';
  // the body, rising from the pier to the slab
  rect(g, 16, 24, 52, 40, S); rect(g, 16, 24, 3, 40, SL); rect(g, 65, 24, 3, 40, SD);
  for (let y = 32; y < 62; y += 6) { rect(g, 19, y, 46, 1, M); for (let x = 20 + ((y / 6) % 2 ? 6 : 0); x < 64; x += 12) rect(g, x, y + 1, 1, 5, M); }
  // the machicolations: a corbelled gallery flaring out under the slab, dark murder-holes between the corbels
  rect(g, 6, 24, 72, 6, SL); rect(g, 6, 29, 72, 1, SD);
  for (let x = 8; x < 76; x += 8) { rect(g, x, 30, 4, 3, S); rect(g, x + 1, 33, 2, 2, S); rect(g, x + 4, 30, 4, 2, '#1b1626'); }
  // an arrow slit with a watch-fire behind it, and the door the Lance rides through
  rect(g, 40, 38, 4, 10, '#1b1626'); rect(g, 41, 40, 2, 6, '#ff9a5c'); rect(g, 41, 41, 2, 2, '#ffd36b');
  rect(g, 34, 52, 16, 12, '#1b1626'); rect(g, 36, 50, 12, 2, '#1b1626'); rect(g, 35, 54, 14, 10, '#241e18'); rect(g, 41, 54, 2, 10, '#1b1626');
  rect(g, 33, 50, 1, 14, SL); rect(g, 50, 50, 1, 14, SD);
  // the Queen's banner off the gallery, and the posts of the parapet above the slab at either end
  rect(g, 20, 30, 7, 14, '#8f2f28'); rect(g, 20, 30, 7, 2, '#c9463d'); rect(g, 22, 36, 3, 3, '#ffd36b'); rect(g, 20, 44, 2, 2, '#8f2f28'); rect(g, 25, 44, 2, 2, '#8f2f28');
  for (const x of [2, 78]) { rect(g, x, 8, 4, 8, S); rect(g, x, 8, 4, 1, SL); rect(g, x + 3, 9, 1, 7, SD); }
  return outline(c, OUT); }
// The gatehouse at the far end: the way off the bridge and into the castle. 40x54, background.
export function bakeGatehouse() { const [c, g] = canvas(40, 54); rect(g, 0, 6, 40, 48, '#4a4e58'); rect(g, 0, 6, 40, 2, '#6a6e7a');
  for (let y = 12; y < 52; y += 8) { rect(g, 0, y, 40, 1, '#3a3e48'); for (let x = ((y / 8) % 2 ? 6 : 0); x < 40; x += 12) rect(g, x, y + 1, 10, 6, '#565a66'); }
  fillPoly(g, [[12, 54], [12, 30], [20, 22], [28, 30], [28, 54]], '#1a1620');
  rect(g, 13, 32, 14, 22, '#241e18'); for (let x = 14; x < 27; x += 4) rect(g, x, 32, 2, 22, '#3a3040');
  for (let x = 0; x < 40; x += 7) rect(g, x, 0, 5, 7, '#5a6270');
  rect(g, 4, 18, 5, 7, '#241e18'); rect(g, 31, 18, 5, 7, '#241e18');
  return outline(c, OUT); }
// A goblin forge and an anvil, for Smoke Row. 26x22 and 14x12.
export function bakeForge() { const [c, g] = canvas(26, 22); rect(g, 1, 8, 24, 14, '#4a4440'); rect(g, 1, 8, 24, 2, '#6a6458');
  rect(g, 5, 12, 14, 9, '#241e18'); rect(g, 6, 15, 12, 6, '#ff6b2c'); rect(g, 7, 17, 10, 4, '#ffd36b'); rect(g, 9, 18, 6, 2, '#fff6c8');
  rect(g, 18, 0, 6, 9, '#3a3444'); rect(g, 18, 0, 6, 1, '#5a5468'); rect(g, 2, 6, 22, 2, '#5a5448');
  return outline(c, OUT); }
export function bakeAnvil() { const [c, g] = canvas(14, 12); rect(g, 2, 8, 10, 4, '#3a3e48'); rect(g, 4, 5, 6, 3, '#4a4e58'); rect(g, 1, 2, 12, 3, '#5a6270'); rect(g, 1, 2, 12, 1, '#8a919c');
  fillPoly(g, [[0, 3], [1, 2], [1, 5]], '#5a6270'); return outline(c, OUT); }
// One of the hill folk, locked in a cellar. 10x12 - the quest icon for Stormhold.
export function bakeFolkIcon() { const [c, g] = canvas(10, 12); rect(g, 3, 0, 4, 3, '#8a5a32'); rect(g, 2, 3, 6, 4, '#f1c9a0'); px(g, 3, 4, OUT); px(g, 6, 4, OUT);
  rect(g, 1, 7, 8, 4, '#6a5a8a'); rect(g, 2, 11, 2, 1, '#5c3a1d'); rect(g, 6, 11, 2, 1, '#5c3a1d'); return outline(c, OUT); }
// Iron shoes: the planks do not give under you. 11x10.
export function bakeShoesIcon() { const [c, g] = canvas(11, 10); for (const x of [0, 6]) { rect(g, x, 4, 5, 4, '#5a6270'); rect(g, x, 4, 5, 1, '#8a919c'); rect(g, x, 8, 5, 1, '#3a3e48'); rect(g, x + 1, 2, 3, 2, '#8a5a32'); }
  return outline(c, OUT); }
// THE CASTLE, on the mountain over Stormhold. It is drawn behind everything and it grows as you climb.
export function bakeCastle(seed) { const rnd = mulberry(seed || 5); const [c, g] = canvas(150, 120);
  fillPoly(g, [[0, 120], [26, 52], [58, 74], [86, 30], [116, 66], [150, 120]], '#4e4e66', '#3c3c50'); // the mountain it stands on
  for (let i = 0; i < 60; i++) { const x = (rnd() * 150) | 0, y = 40 + ((rnd() * 78) | 0); px(g, x, y, rnd() < 0.5 ? '#5a5a74' : '#42425a'); }
  fillPoly(g, [[62, 46], [86, 24], [110, 46]], '#eef4fa'); // snow on the peak
  const keep = (x, w, top) => { rect(g, x, top, w, 60, '#6a6e86'); rect(g, x, top, w, 2, '#8e93ab'); rect(g, x + w - 2, top, 2, 60, '#4a4e62');
    for (let y = top + 6; y < top + 58; y += 9) for (let bx = x + ((y % 2) ? 3 : 0); bx < x + w - 3; bx += 8) rect(g, bx, y, 6, 6, '#767b93');
    for (let bx = x; bx < x + w; bx += 6) rect(g, bx, top - 4, 4, 4, '#6a6e86');
    for (let y = top + 12; y < top + 50; y += 16) { rect(g, x + (w >> 1) - 1, y, 3, 6, '#1a1826'); if (rnd() < 0.7) { rect(g, x + (w >> 1) - 1, y + 1, 3, 4, '#ffb84a'); px(g, x + (w >> 1), y + 2, '#fff6c8'); } } };
  keep(58, 18, 40); keep(78, 26, 28); keep(106, 16, 44);
  fillPoly(g, [[76, 28], [91, 12], [106, 28]], '#57455f', '#3d3145'); // the great roof
  rect(g, 90, 2, 2, 12, '#5c3a1d'); rect(g, 92, 3, 8, 5, '#c9463d'); // her banner
  return outline(c, OUT); }
// THE CASTLE ON ITS MOUNTAIN, as a backdrop: the same keeps and banner, but the mountain goes on down past
// the foot of the frame between two lower shoulders, and the bottom of it fades into the haze. (The old art
// was a cut-out: a triangle with a flat bottom edge, hanging in the sky.)
export function bakeCastleRange(seed) { const rnd = mulberry(seed || 5), W = 300, H = 230, ox = 75; const [c, g] = canvas(W, H);
  // the far shoulders, paler because they are further off
  fillPoly(g, [[0, H], [0, 128], [22, 112], [48, 124], [70, 150], [230, 150], [256, 118], [280, 104], [300, 116], [300, H]], '#5e607a', '#54566e');
  fillPoly(g, [[8, 118], [22, 112], [34, 118]], '#dfe6f0'); fillPoly(g, [[268, 110], [280, 104], [292, 110]], '#dfe6f0');
  // her mountain, all the way down
  fillPoly(g, [[18, H], [60, 150], [ox + 26, 52], [ox + 58, 74], [ox + 86, 30], [ox + 116, 66], [240, 148], [284, H]], '#4e4e66', '#3c3c50');
  for (let i = 0; i < 140; i++) { const x = (rnd() * W) | 0, y = 40 + ((rnd() * (H - 40)) | 0); px(g, x, y, rnd() < 0.5 ? '#5a5a74' : '#42425a'); }
  for (let i = 0; i < 14; i++) { const x = 60 + ((rnd() * 180) | 0), y = 96 + ((rnd() * 90) | 0); line(g, x, y, x + 6 + ((rnd() * 8) | 0), y + 10 + ((rnd() * 10) | 0), '#3a3a4e', 1); } // gullies
  fillPoly(g, [[ox + 62, 46], [ox + 86, 24], [ox + 110, 46]], '#eef4fa');
  // the road up to her gate, switchbacking, a few torches on it
  let rx = 150, ry = 206; for (let k = 0; k < 6; k++) { const nx = k % 2 ? rx + 34 - k * 3 : rx - 34 + k * 3, ny = ry - 22; line(g, rx, ry, nx, ny, '#6a6658', 1); if (k % 2) px(g, nx, ny - 1, '#ffb84a'); rx = nx; ry = ny; }
  const keep = (x, w, top) => { rect(g, x, top, w, 60, '#6a6e86'); rect(g, x, top, w, 2, '#8e93ab'); rect(g, x + w - 2, top, 2, 60, '#4a4e62');
    for (let y = top + 6; y < top + 58; y += 9) for (let bx = x + ((y % 2) ? 3 : 0); bx < x + w - 3; bx += 8) rect(g, bx, y, 6, 6, '#767b93');
    for (let bx = x; bx < x + w; bx += 6) rect(g, bx, top - 4, 4, 4, '#6a6e86');
    for (let y = top + 12; y < top + 50; y += 16) { rect(g, x + (w >> 1) - 1, y, 3, 6, '#1a1826'); if (rnd() < 0.7) { rect(g, x + (w >> 1) - 1, y + 1, 3, 4, '#ffb84a'); } } };
  keep(ox + 58, 18, 40); keep(ox + 78, 26, 28); keep(ox + 106, 16, 44);
  fillPoly(g, [[ox + 76, 28], [ox + 91, 12], [ox + 106, 28]], '#57455f', '#3d3145');
  rect(g, ox + 90, 2, 2, 12, '#5c3a1d'); rect(g, ox + 92, 3, 8, 5, '#c9463d');
  outline(c, OUT);
  // and it goes into the haze: the lower third fades out
  g.globalCompositeOperation = 'destination-out'; const gr = g.createLinearGradient(0, 150, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 150, W, H - 150); g.globalCompositeOperation = 'source-over';
  return c; }
// ---------- THE SUNSPIRE ----------
// A crystal ledge, in three states: whole, crazed, and about to go. `lit` is above the cloud line,
// where the sun is on it and everything happens faster.
export function bakeCrystalTile(state, lit) {
  const T2 = 16; const [c, g] = canvas(T2, T2);
  const base = lit ? ['#bfe6f5', '#8fc8e8', '#6aa0c8'] : ['#8fa8c0', '#6a86a0', '#4e6480'];
  const glint = lit ? '#ffffff' : '#cfe0ee';
  for (let y = 0; y < T2; y++) for (let x = 0; x < T2; x++) { const k = ((x * 5 + y * 3) % 7);
    px(g, x, y, k < 2 ? base[0] : k < 5 ? base[1] : base[2]); }
  // facets: a few long diagonals catching the light
  for (let i = 0; i < 4; i++) { const x0 = (i * 5) % T2; line(g, x0, 0, x0 + 6, T2, glint, 1); }
  rect(g, 0, 0, T2, 1, base[0]); rect(g, 0, T2 - 2, T2, 2, base[2]);
  if (state >= 1) { // crazed: a web of cracks
    const rnd = mulberry(41 + state * 7);
    for (let i = 0; i < 5 + state * 4; i++) { let x = (rnd() * T2) | 0, y = (rnd() * T2) | 0;
      for (let k = 0; k < 4 + state * 2; k++) { px(g, x, y, state >= 2 ? '#1e2a38' : '#3a4e64'); x += rnd() < 0.5 ? 1 : 0; y += rnd() < 0.5 ? 1 : -1; if (y < 0 || y >= T2) break; } } }
  if (state >= 2) { rect(g, 0, 0, T2, 1, '#ffffff'); for (let x = 0; x < T2; x += 3) px(g, x, T2 - 1, '#1e2a38'); }
  return c;
}
// A crystal spire growing off the mountain, for scenery and for the Suncatcher to raise. 14x40.
export function bakeSpire(v, lit) {
  const [c, g] = canvas(14, 40); const col = lit ? ['#dff2ff', '#a8d8f0', '#6aa0c8'] : ['#a8c0d4', '#7e97b0', '#54687f'];
  fillPoly(g, [[7, 0], [13, 22], [10, 40], [4, 40], [1, 22]], col[1], col[2]);
  fillPoly(g, [[7, 0], [10, 22], [8, 40], [6, 40], [5, 22]], col[0]);
  for (let y = 6; y < 38; y += 7) px(g, 6 + ((y / 7) % 2), y, '#ffffff');
  if (v % 2) { fillPoly(g, [[2, 14], [6, 26], [3, 40], [0, 40]], col[1], col[2]); }
  return outline(c, OUT);
}
// A sunshard: a splinter of the peak, still warm. 10x12.
export function bakeSunshardIcon() { const [c, g] = canvas(10, 12); fillPoly(g, [[5, 0], [9, 6], [6, 12], [3, 12], [1, 6]], '#bfe6f5', '#7aa8c8');
  fillPoly(g, [[5, 1], [7, 6], [5, 11], [4, 6]], '#eefaff'); px(g, 5, 3, '#ffffff'); px(g, 4, 8, '#ffe6a0'); return outline(c, OUT); }
export function bakeLampIcon() { const [c, g] = canvas(10, 12); rect(g, 4, 0, 2, 2, '#8b8378'); rect(g, 2, 2, 6, 1, '#5f5a52'); rect(g, 2, 3, 6, 7, '#3a3444'); rect(g, 3, 4, 4, 5, '#6a5a3a'); px(g, 4, 6, '#ffd36b'); rect(g, 2, 10, 6, 1, '#5f5a52'); return outline(c); }
// A lit or dark lantern on a tall post for the crown of the tree. 12×36.
export function bakeCrownLantern(lit) { const [c, g] = canvas(12, 36); rect(g, 5, 8, 2, 28, C.woodD); rect(g, 5, 8, 1, 28, C.wood); rect(g, 2, 34, 8, 2, C.woodD); rect(g, 3, 0, 6, 2, '#5f5a52'); rect(g, 2, 2, 8, 8, lit ? '#ffd36b' : '#3a3444'); rect(g, 3, 3, 6, 6, lit ? '#fff6c8' : '#2a2630'); rect(g, 2, 10, 8, 1, '#5f5a52'); return outline(c); }

// A great trunk for the tree-city: one tier tall (224 px) so a stack of them reads as one tree passing through every bough. 48×224, background.
export function bakeTrunk(seed) { const rnd = mulberry(seed); const [c, g] = canvas(48, 300); rect(g, 12, 0, 24, 300, '#4c2c17'); rect(g, 12, 0, 4, 300, '#6a4020'); rect(g, 31, 0, 5, 300, '#2e1a0c'); for (let y = 0; y < 300; y += 6) { const w = 2 + ((rnd() * 4) | 0); rect(g, 16 + ((rnd() * 12) | 0), y, w, 1, '#3a2214'); } for (let i = 0; i < 4; i++) { const y = 20 + ((rnd() * 240) | 0); ellipse(g, 18 + ((rnd() * 12) | 0), y, 3, 4, '#2e1a0c', '#3a2214'); } const b1 = 90 + ((rnd() * 60) | 0), b2 = 180 + ((rnd() * 70) | 0); line(g, 14, b1, 0, b1 - 10, '#4c2c17', 3); line(g, 34, b2, 47, b2 - 12, '#4c2c17', 3); ellipse(g, 6, b1 - 14, 8, 6, '#2f5e3a', '#264a2f'); ellipse(g, 42, b2 - 16, 8, 6, '#3f7a48', '#2f5e3a'); return c; }

// Crag rock face with hand-holds: hold into it to cling, jump to kick up it. 16×16, two variants.
export function bakeClimbFace(v) { // ochre handhold rock: warm against the grey crag, carved notches with bright lips, an iron piton. You can cling to this.
  const rnd = mulberry(700 + v); const [c, g] = canvas(T, T); rect(g, 0, 0, T, T, '#8a7650'); for (let i = 0; i < 16; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? '#9c8862' : '#6e5c3c');
  for (const [x, y] of v ? [[2, 3], [9, 8], [4, 12]] : [[8, 2], [2, 8], [10, 12]]) { rect(g, x, y, 6, 3, '#3a3020'); rect(g, x, y, 6, 1, '#241c10'); rect(g, x, y + 3, 6, 1, '#f0e4c0'); }
  if (v) { rect(g, 12, 4, 2, 2, '#c9d1dc'); px(g, 13, 3, '#8a919c'); } else { rect(g, 3, 6, 2, 2, '#c9d1dc'); px(g, 4, 5, '#8a919c'); }
  rect(g, 0, 0, 1, T, '#b09a6e'); rect(g, T - 1, 0, 1, T, '#4a3e2c'); return c; }
// A hanging vine: a twisting stem with leaves, climbed like a rope. 16×16, tiles vertically.
export function bakeVine(v) { const [c, g] = canvas(T, T); const sx = v ? 7 : 8; for (let y = 0; y < T; y++) { const x = sx + Math.round(Math.sin((y + v * 8) * 0.5)); rect(g, x, y, 3, 1, '#3f6e2c'); px(g, x, y, '#6faa4a'); } for (const [lx, ly, side] of v ? [[3, 2, -1], [11, 9, 1], [2, 13, -1]] : [[10, 3, 1], [2, 8, -1], [11, 12, 1]]) { rect(g, lx, ly, 4, 3, '#6faa4a'); rect(g, lx + (side > 0 ? 0 : 1), ly + 1, 3, 1, '#8fd160'); px(g, lx + (side > 0 ? 3 : 0), ly + 1, '#3f6e2c'); } px(g, sx + (v ? 4 : -2), 6, '#8fd160'); return c; }
// Stone-slab ledges for the Crags in place of the wood's log platforms. 16×16; end = 'L' | 'R' | null.
export function bakeLedge(seed, end) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); const x0 = end === 'L' ? 2 : 0, x1 = end === 'R' ? T - 2 : T; rect(g, x0, 3, x1 - x0, 6, '#7c8797'); rect(g, x0, 3, x1 - x0, 1, '#a8b0bc'); rect(g, x0, 8, x1 - x0, 1, '#4a4f5a'); rect(g, x0 + 1, 9, x1 - x0 - 2, 2, '#3a3e48'); for (let i = 0; i < 3; i++) px(g, x0 + 1 + ((rnd() * (x1 - x0 - 2)) | 0), 4 + ((rnd() * 4) | 0), rnd() < 0.5 ? '#8a919c' : '#c9b84a'); if (end === 'L') { rect(g, 1, 4, 1, 5, '#a8b0bc'); } if (end === 'R') { rect(g, T - 2, 4, 1, 5, '#4a4f5a'); } return c; }

// A rope ladder tile: two ropes with wooden rungs and knots. side = 'L' | 'R' for the halves of a two-wide ladder, or null for a single column.
export function bakeRopeLadder(v, side) { const rnd = mulberry(650 + v); const [c, g] = canvas(T, T); const rope = (x) => { rect(g, x, 0, 2, T, '#c9b27c'); rect(g, x, 0, 1, T, '#e0d0a0'); for (let y = (v ? 2 : 4); y < T; y += 6) rect(g, x, y, 2, 1, '#8a7a5a'); }; if (side !== 'R') rope(2); if (side !== 'L') rope(12); const x0 = side === 'R' ? 0 : 3, x1 = side === 'L' ? T : 13; for (const y of [3, 11]) { rect(g, x0, y, x1 - x0, 3, '#8a5a32'); rect(g, x0, y, x1 - x0, 1, '#b07a44'); rect(g, x0, y + 2, x1 - x0, 1, '#5c3a1d'); if (side !== 'R') { px(g, 2, y - 1, '#e0d0a0'); px(g, 3, y + 3, '#8a7a5a'); } if (side !== 'L') { px(g, 13, y - 1, '#e0d0a0'); px(g, 12, y + 3, '#8a7a5a'); } } if (rnd() < 0.4) px(g, 7 + ((rnd() * 4) | 0), 3 + ((rnd() * 2) | 0), '#5c3a1d'); return c; }
// A knotted rope net for the wide nets under bridges. 16×16.
export function bakeRopeNet(v) { const [c, g] = canvas(T, T); for (let i = -T; i < T * 2; i += 8) { line(g, i, 0, i + T, T, '#c9b27c', 1); line(g, i + T, 0, i, T, '#c9b27c', 1); } for (let y = 0; y < T; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < T; x += 8) { rect(g, x - 1 + (v ? 4 : 0), y - 1, 3, 3, '#8a7a5a'); px(g, x + (v ? 4 : 0), y, '#e0d0a0'); } rect(g, 0, 0, T, 2, '#c9b27c'); rect(g, 0, 0, T, 1, '#e0d0a0'); return c; }

// A bough bracket: the branch that holds a bough-tier up against its trunk. 40×18, background, drawn under the band.
export function bakeBracket(v) { const [c, g] = canvas(40, 18); const flip = v === 1; const X = x => flip ? 39 - x : x; fillPoly(g, [[X(0), 0], [X(39), 0], [X(39), 4], [X(8), 17], [X(0), 17]], '#4c2c17'); fillPoly(g, [[X(2), 2], [X(36), 2], [X(36), 4], [X(9), 15], [X(2), 15]], '#5e3a20', '#4c2c17'); rect(g, X(0), 0, flip ? 40 : 40, 1, '#6a4020'); return c; }

// The axle of a tree-city water wheel: an iron hub on a beam braced into the trunk. 96×32, background; the hub is at (48,16).
export function bakeAxle() { const [c, g] = canvas(96, 32); rect(g, 48, 12, 48, 8, '#4c2c17'); rect(g, 48, 12, 48, 1, '#6a4020'); rect(g, 48, 19, 48, 1, '#2e1a0c'); line(g, 60, 20, 84, 31, '#4c2c17', 3); line(g, 60, 12, 84, 1, '#4c2c17', 3); circle(g, 48, 16, 9, '#5f5a52'); circle(g, 48, 16, 6, '#8b8378'); circle(g, 48, 16, 2.5, '#3a3444'); for (const [dx, dy] of [[-6, 0], [6, 0], [0, -6], [0, 6]]) px(g, 48 + dx, 16 + dy, '#b3aca0'); return c; }

// A rock pillar for the mountain village: one tier and a half tall, so a stack reads as one cliff face behind every ledge. 48×300, background.
export function bakeRockPillar(seed) { const rnd = mulberry(seed); const [c, g] = canvas(48, 300); rect(g, 10, 0, 28, 300, '#5a5f6e'); rect(g, 10, 0, 3, 300, '#7c8797'); rect(g, 34, 0, 4, 300, '#3a3e48'); for (let y = 0; y < 300; y += 5) { const w = 3 + ((rnd() * 8) | 0), x = 12 + ((rnd() * 20) | 0); rect(g, x, y, Math.min(w, 36 - x), 1, rnd() < 0.5 ? '#4a4f5a' : '#6a707c'); } for (let i = 0; i < 6; i++) { const y = 10 + ((rnd() * 280) | 0), x = 12 + ((rnd() * 18) | 0); rect(g, x, y, 6, 2, '#2e3038'); rect(g, x, y + 2, 6, 1, '#8a919c'); } for (let i = 0; i < 5; i++) px(g, 12 + ((rnd() * 22) | 0), ((rnd() * 300) | 0), '#c9b84a'); return c; }
// A timber strut that holds a mountain ledge against the rock. 40×18, background.
export function bakeStrut(v) { const [c, g] = canvas(40, 18); const flip = v === 1; const X = x => flip ? 39 - x : x; line(g, X(2), 2, X(36), 15, '#5c3a1d', 3); line(g, X(2), 1, X(36), 14, '#8a5a32', 1); rect(g, X(0), 0, flip ? 40 : 40, 2, '#5c3a1d'); rect(g, X(0), 2, flip ? 6 : 6, 16, '#5c3a1d'); px(g, X(3), 4, '#8b8378'); px(g, X(3), 12, '#8b8378'); return c; }
// The whole world on one sheet: the Crags stacked above the Wood, joined by the pass. Each region bakes in its own style with its own share of the path.
export function bakeWorldMap(w, h, regions, connectors) { const [c, g] = canvas(w, h); for (const r of regions) { const part = bakeMap(r.w, r.h, r.nodes, r.path, r.seed, r.style); g.drawImage(part, r.x, r.y); } for (const [a, b] of connectors) { line(g, a[0], a[1], b[0], b[1], '#5e3b21', 8); line(g, a[0], a[1], b[0], b[1], '#b8a888', 5); } for (const r of regions) if (r.seam) { const gr = g.createLinearGradient(0, r.seam - 26, 0, r.seam + 6); gr.addColorStop(0, 'rgba(94,94,108,0)'); gr.addColorStop(0.5, 'rgba(94,110,80,0.5)'); gr.addColorStop(1, 'rgba(79,138,58,0)'); g.fillStyle = gr; g.fillRect(0, r.seam - 26, w, 32); } return c; }

// ---------- The Mineworks ----------
// Rails on sleepers over rock. 16×16, standable like a plank.
export function bakeRail(v) { const [c, g] = canvas(T, T); rect(g, 0, 6, T, 10, '#4a4f5a'); for (let x = v ? 2 : 0; x < T; x += 6) rect(g, x, 5, 4, 5, '#5c3a1d'); rect(g, 0, 3, T, 2, '#8a919c'); rect(g, 0, 3, T, 1, '#b0b8c4'); rect(g, 0, 8, T, 1, '#3a3e48'); for (let i = 0; i < 4; i++) px(g, 1 + i * 4 + (v ? 1 : 0), 11 + (i % 2), '#6a707c'); return c; }
// A mine cart: an iron tub on four wheels. 28×14, frames: still, rolling (wheels turned).
export function bakeMineCart() { return [0, 1].map(f => { const [c, g] = canvas(30, 16); rect(g, 3, 2, 24, 9, '#5a6270'); rect(g, 3, 2, 24, 1, '#8a919c'); rect(g, 3, 2, 1, 9, '#7c8797'); rect(g, 26, 2, 1, 9, '#3a3e48'); rect(g, 5, 4, 20, 2, '#3a3e48'); rect(g, 6, 3, 18, 2, '#8a5a32'); for (let i = 0; i < 5; i++) px(g, 7 + i * 4, 3, '#c9b27c'); for (const x of [8, 22]) { circle(g, x, 12, 3, '#3a3e48'); circle(g, x, 12, 1.5, f ? '#8a919c' : '#6a707c'); if (f) px(g, x + 1, 11, '#b0b8c4'); else px(g, x, 10, '#b0b8c4'); } return outline(c); }); }
// Soft rock a miner can dig through. 16×16.
export function bakeSoftRock(seed) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); rect(g, 0, 0, T, T, '#6a5a4a'); for (let i = 0; i < 16; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? '#7a6a58' : '#5a4a3a'); for (let i = 0; i < 3; i++) { const x = (rnd() * 12) | 0, y = (rnd() * 12) | 0; rect(g, x, y, 3, 2, '#8a7a68'); } rect(g, 0, 0, T, 1, '#8a7a68'); return c; }
// A canary in a cage. 10×12, two frames (the bird hops).
export function bakeCanary() { return [0, 1].map(f => { const [c, g] = canvas(12, 14); rect(g, 5, 0, 2, 2, '#8b8378'); rect(g, 2, 2, 8, 11, 'rgba(20,16,30,0.25)'); for (let x = 2; x <= 10; x += 2) rect(g, x, 2, 1, 11, '#8b8378'); rect(g, 2, 2, 9, 1, '#b3aca0'); rect(g, 2, 12, 9, 1, '#5f5a52'); rect(g, 5, 7 - f, 4, 3, '#ffd34a'); px(g, 8, 7 - f, '#e0b040'); px(g, 6, 7 - f, OUT); px(g, 4, 8 - f, '#ffd34a'); return c; }); }
// A gas seam in the floor: a crack with a green vent. 16×8.
export function bakeGasSeam() { const [c, g] = canvas(T, 8); rect(g, 2, 5, 12, 3, '#3a3e48'); rect(g, 4, 3, 8, 3, '#2e3038'); for (let x = 3; x < 13; x += 3) px(g, x, 4, '#6a9a5a'); rect(g, 6, 2, 4, 1, '#8fd160'); return c; }
// A hanging miner's lamp. 8×12.
// A mine's timber set: two posts and a lintel, a brace in each corner. h px tall, 40 wide. Drawn behind the knight.
export function bakeTimberFrame(h) { const [c, g] = canvas(40, h); rect(g, 0, 0, 40, 6, '#5c3a1d'); rect(g, 0, 0, 40, 1, '#8a5a32'); rect(g, 0, 5, 40, 1, '#3a2214'); rect(g, 2, 6, 5, h - 6, '#4a3626'); rect(g, 33, 6, 5, h - 6, '#4a3626'); rect(g, 2, 6, 1, h - 6, '#6a4a2a'); rect(g, 33, 6, 1, h - 6, '#6a4a2a'); rect(g, 6, 6, 1, h - 6, '#2a1a10'); rect(g, 37, 6, 1, h - 6, '#2a1a10'); for (let y = 12; y < h; y += 14) { px(g, 4, y, '#2a1a10'); px(g, 35, y, '#2a1a10'); } line(g, 7, 6, 13, 12, '#5c3a1d', 2); line(g, 32, 6, 26, 12, '#5c3a1d', 2); return c; }
export function bakeMinerLamp(lit) { const [c, g] = canvas(8, 12); rect(g, 3, 0, 2, 2, '#8b8378'); rect(g, 2, 2, 4, 1, '#5f5a52'); rect(g, 1, 3, 6, 7, lit ? '#ffd36b' : '#3a3444'); rect(g, 2, 4, 4, 5, lit ? '#fff6c8' : '#2a2630'); rect(g, 1, 10, 6, 2, '#5f5a52'); return outline(c); }
// The ore lift pan: a chained iron platform. 64×10.
export function bakeOrePan() { const [c, g] = canvas(64, 10); rect(g, 0, 3, 64, 6, '#5a6270'); rect(g, 0, 3, 64, 1, '#8a919c'); rect(g, 0, 8, 64, 1, '#3a3e48'); for (let x = 4; x < 64; x += 8) rect(g, x, 4, 2, 4, '#4a4f5a'); rect(g, 2, 0, 2, 3, '#8b8378'); rect(g, 60, 0, 2, 3, '#8b8378'); return c; }
// The forge's hammer head and the boiler.
export function bakeHammer() { const [c, g] = canvas(28, 24); rect(g, 12, 0, 4, 10, '#4a4f5a'); rect(g, 2, 10, 24, 14, '#3a3e48'); rect(g, 2, 10, 24, 2, '#8a919c'); rect(g, 2, 22, 24, 2, '#1e2028'); rect(g, 4, 13, 20, 8, '#5a6270'); for (let i = 0; i < 3; i++) px(g, 6 + i * 8, 15, '#b0b8c4'); return outline(c); }
export function bakeBoiler(burst) { const [c, g] = canvas(30, 40); rect(g, 4, 6, 22, 30, burst ? '#8a4a3a' : '#6a4a3a'); rect(g, 4, 6, 22, 2, '#a07060'); rect(g, 4, 34, 22, 2, '#3a2a24'); for (let y = 12; y < 34; y += 7) rect(g, 4, y, 22, 1, '#3a2a24'); rect(g, 8, 0, 14, 6, '#5a6270'); rect(g, 12, 36, 6, 4, '#3a3e48'); circle(g, 15, 20, 5, '#3a3e48'); circle(g, 15, 20, 3, burst ? '#ff6b6b' : '#ffd36b'); if (burst) { for (let i = 0; i < 6; i++) rect(g, 6 + i * 3, 2 - (i % 2) * 2, 2, 3, '#e8e0d0'); } return outline(c); }
