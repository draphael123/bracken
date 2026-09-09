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
  const last = nodes[nodes.length - 1]; ellipse(g, last.x, last.y + 12, 30, 12, '#c9b27c'); ellipse(g, last.x, last.y + 12, 27, 10, '#2a5f8a'); ellipse(g, last.x, last.y + 12, 23, 8, '#3b7fae', '#5aa6c9'); ellipse(g, last.x - 8, last.y + 9, 8, 2, '#8fd160', '#4f9a58'); ellipse(g, last.x + 10, last.y + 14, 6, 2, '#4f9a58', '#2f6e3a');
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
