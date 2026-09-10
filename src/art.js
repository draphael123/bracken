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

export function bakeThorns(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  for (let i = 0; i < 6; i++) {
    const x0 = (rnd() * T) | 0, y0 = 6 + ((rnd() * 8) | 0), x1 = (rnd() * T) | 0, y1 = 8 + ((rnd() * 8) | 0);
    line(g, x0, y0, x1, y1, C.vine, 2);
  }
  rect(g, 0, 14, T, 2, C.vine);
  for (let i = 0; i < 7; i++) { const x = (rnd() * T) | 0, y = 4 + ((rnd() * 8) | 0); px(g, x, y, C.thorn); px(g, x, y + 1, '#7a7660'); }
  if (rnd() < 0.5) { const x = (rnd() * 14) | 0; rect(g, x, 9 + ((rnd() * 4) | 0), 2, 2, C.berry); }
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
export function bakeMap(w, h, nodes, path, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
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
    if (nd.id === 'wood') { for (let i = 0; i < 6; i++) px(g, (ox - 20 + rnd() * 40) | 0, (oy + 10 + rnd() * 10) | 0, ['#f4d35e', '#e8788a', '#fbf6ea'][(rnd() * 3) | 0]); }
  }
  // a parchment vignette so the edges read as the edge of the map
  const vg = g.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 0.95); vg.addColorStop(0, 'rgba(60,40,20,0)'); vg.addColorStop(1, 'rgba(60,40,20,0.35)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  // node discs
  for (const nd of nodes) { circle(g, nd.x, nd.y + 1, 8, 'rgba(20,40,20,0.35)'); circle(g, nd.x, nd.y, 7, '#5e3b21'); circle(g, nd.x, nd.y, 5.5, nd.kind === 'store' ? '#e0b040' : '#c9b27c'); px(g, nd.x - 2, nd.y - 2, '#fff1c0'); }
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
  const [cap, g] = canvas(160, 56);
  const rnd = mulberry(77);
  const sag = x => Math.round(((x - 80) / 80) * 5); // the right side droops
  // underside gills, weeping
  for (let x = 0; x < 160; x++) { const dx = (x - 80) / 78; if (Math.abs(dx) > 1) continue; const h = Math.sqrt(1 - dx * dx); const yb = 40 + sag(x) + Math.round(h * 9); for (let y = 34 + sag(x); y < yb; y++) px(g, x, y, (x >> 2) % 2 ? '#5a4a3a' : '#3a2e2c'); }
  for (let x = 6; x < 156; x += 4) line(g, x, 34 + sag(x), 80 + (x - 80) * 0.72, 47 + sag(x), x % 8 === 2 ? '#8a7a4a' : '#5a4a3a', 1);
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
  outline(cap, OUT);
  const [stalk, s] = canvas(32, 100);
  rect(s, 2, 0, 28, 100, '#4a4436'); rect(s, 2, 0, 5, 100, '#6a6450'); rect(s, 25, 0, 5, 100, '#2c2820');
  for (let i = 0; i < 50; i++) { const x = 4 + ((rnd() * 24) | 0), y = (rnd() * 96) | 0; rect(s, x, y, 1, 2 + ((rnd() * 5) | 0), rnd() < 0.5 ? '#5a5444' : '#3a3428'); }
  // veins of rot climbing the stalk, a split ring, oozing boils
  for (let i = 0; i < 4; i++) { let x = 6 + ((rnd() * 20) | 0), y = 95; while (y > 10) { px(s, x, y, '#5a3a5a'); if (rnd() < 0.5) px(s, x + 1, y, '#3a2a3a'); y--; x += rnd() < 0.3 ? (rnd() < 0.5 ? -1 : 1) : 0; x = Math.max(4, Math.min(27, x)); } }
  rect(s, 0, 34, 32, 5, '#6a6450'); rect(s, 0, 39, 32, 2, '#2c2820'); rect(s, 14, 33, 3, 8, '#2c2820');
  for (const [bx, by] of [[9, 55], [20, 70], [12, 84], [23, 22]]) { ellipse(s, bx, by, 3, 2.5, '#8a8a54', '#4a3a2a'); px(s, bx, by - 1, '#b8c060'); }
  fillPoly(s, [[2, 100], [2, 86], [-4, 100]], '#4a4436'); fillPoly(s, [[30, 100], [30, 84], [36, 100]], '#4a4436'); rect(s, 0, 96, 32, 4, '#3a3428');
  outline(stalk, OUT);
  return { cap, stalk };
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
export function bakeWarBanner(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(44, 72);
  rect(g, 20, 0, 4, 72, '#5c3a1d'); rect(g, 20, 0, 1, 72, '#7a4e28'); rect(g, 6, 2, 32, 3, '#5c3a1d');
  fillPoly(g, [[7, 5], [37, 5], [37, 52], [22, 62], [7, 52]], '#8f2f28'); fillPoly(g, [[9, 7], [35, 7], [35, 50], [22, 58], [9, 50]], '#c9463d');
  // a goblin face
  ellipse(g, 22, 26, 9, 8, '#1b1626'); rect(g, 17, 22, 3, 3, '#e0b040'); rect(g, 24, 22, 3, 3, '#e0b040'); rect(g, 18, 30, 8, 2, '#e8dcc0'); px(g, 19, 32, '#e8dcc0'); px(g, 24, 32, '#e8dcc0');
  for (let i = 0; i < 8; i++) px(g, 9 + ((rnd() * 26) | 0), 40 + ((rnd() * 16) | 0), '#8f2f28');
  rect(g, 2, 4, 6, 2, '#e8dcc0'); rect(g, 36, 4, 6, 2, '#e8dcc0');
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
export function bakeDoor(shut) { const [c, g] = canvas(16, 22); rect(g, 0, 0, 16, 22, '#3a2618'); ellipse(g, 8, 8, 7, 8, shut ? '#5c3a1d' : '#1b1626', '#241a10'); if (shut) { for (let y = 2; y < 18; y += 4) rect(g, 3, y, 10, 1, '#3d2712'); px(g, 11, 10, '#e0b040'); } return outline(c, OUT); }
// A red carpet strip for the throne room (drawn on the floor row).
export function bakeCarpet() { const [c, g] = canvas(T, 6); rect(g, 0, 0, T, 6, '#8f2f28'); rect(g, 0, 0, T, 1, '#c9463d'); rect(g, 0, 5, T, 1, '#5a1a1a'); for (let x = 2; x < T; x += 5) px(g, x, 3, '#e0b040'); return c; }
// Rust-dawn sky.
export function bakeSkyAutumn(h) { const [c, g] = canvas(1, h); for (let y = 0; y < h; y++) { const t = y / (h - 1), q = Math.round(t * 8) / 8; const r = 70 + q * 170, gg = 40 + q * 120, b = 90 + q * 40; px(g, 0, y, 'rgb(' + (r | 0) + ',' + (gg | 0) + ',' + (b | 0) + ')'); } return c; }
