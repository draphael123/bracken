// src/redraw/gqueen_art.js - THE GOBLIN QUEEN 3's ART PASS (claude/gq2art, over the greybox claude/gq2 / claude/gqueen3).
// DRAWING ONLY: no tile, entity, number or timer changes. src/gqueen-hands.js drawWorld calls these (each call in try/catch; the old rects stay as the fallback).
// Everything is plain fillRect / px.js pixels (no paths), so tools/gqueen-art.mjs can render the lot in Node with no browser.
//   the CROWN (flying / home / on the floor / the storm's orbiting crowns), the ROCK SHARDS (a portal's thrown stone; gold-white once parried), the PORTALS (hall, escape, her own,
//   the ambush), the BURNING HALL (floor fire, rafter fire, scorched slate), the ROOF SHRINE (a cold stone brazier that takes light), the HATCH (an iron-strapped oak trap in the slates),
//   the GEYSER (a cracked, glowing slate - then a spout of slate chunks and fire), the BANNER LASH, the STUN stars, the TOWER TOP's BACKDROP (a night of smoke over her burning keep, far
//   below) and its deck dressing (crenel teeth, the chimney stack, scorch and cracks).
// Palette: the Queen's own - purple 5a2a7a / b28cff, gold e0b040, iron 5a6270, ember ff6b2c - and the Highcrown stone (STONE in highcrown2_art.js).
import { canvas, rect, px, mulberry, outline } from '../px.js';
import { OUT } from '../art.js';
import { STONE as S } from './highcrown2_art.js';

const R = rect;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const ri = Math.round;
const wave = (t, f, p = 0) => 0.5 + 0.5 * Math.sin(t * f + p);

// ---------------- THE CROWN ----------------
// 17 x 12: an iron-banded gold circlet, five points with a red stone in each, a violet glint. home = the crown on her head's colours gone white-gold (the parry window).
function crownSprite(home) {
  return once('crown' + home, () => { const [c, g] = canvas(19, 14);
    const gold = home ? '#fff6c8' : '#e0b040', dark = home ? '#e8c860' : '#a0781c', hi = home ? '#ffffff' : '#ffd36b';
    R(g, 2, 8, 15, 4, dark); R(g, 2, 8, 15, 2, gold); R(g, 2, 8, 15, 1, hi); R(g, 3, 11, 13, 1, '#5a6270');
    for (const k of [3, 6, 9, 12, 15]) { const mid = k === 9; for (let y = 0; y < (mid ? 8 : 6); y++) { const w = y > (mid ? 5 : 3) ? 3 : y > (mid ? 2 : 1) ? 2 : 1; R(g, k - Math.floor(w / 2), (mid ? 0 : 2) + y, w, 1, y < 2 ? hi : gold); }
      px(g, k, 9, '#c9463d'); }
    px(g, 9, 3, '#7a1c24'); px(g, 5, 10, '#b28cff'); px(g, 13, 10, '#b28cff');
    return outline(c, OUT); });
}
export const CROWN_W = 19, CROWN_H = 14;
// x, y = the crown's centre. ang: the spin (radians; 0 = upright, no rotate call). state 'floor' lies on its side.
export function drawCrown(g, x, y, t, o = {}) {
  const { ang = 0, home = false, glow = 0 } = o, s = crownSprite(!!home);
  if (home || glow) { g.globalAlpha = (home ? 0.35 : 0.22 * glow) * (0.6 + 0.4 * wave(t, 14)); R(g, ri(x) - 11, ri(y) - 9, 22, 18, home ? '#fff6c8' : '#ffd36b'); g.globalAlpha = (home ? 0.25 : 0.14 * glow); R(g, ri(x) - 14, ri(y) - 12, 28, 24, home ? '#fff6c8' : '#e0b040'); g.globalAlpha = 1; }
  g.save(); g.translate(ri(x), ri(y)); if (ang) g.rotate(ang); g.drawImage(s, -9, -7); g.restore();
}

// ---------------- THE ROCK SHARD ----------------
function shardSprite(home, v) {
  return once('shard' + home + v, () => { const [c, g] = canvas(11, 11), rock = home ? '#d8d0b8' : '#6c6a82', lit = home ? '#fff6c8' : '#a4a2bc', dk = home ? '#a89860' : '#3c3a52';
    const polys = [[[5, 0], [9, 3], [10, 7], [6, 10], [1, 8], [0, 4]], [[5, 0], [10, 4], [8, 9], [3, 10], [0, 6], [2, 1]]][v & 1];
    for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) { // even-odd fill of the polygon
      let ins = false; for (let i = 0, j = polys.length - 1; i < polys.length; j = i++) { const [xi, yi] = polys[i], [xj, yj] = polys[j]; if ((yi > y + 0.5) !== (yj > y + 0.5) && x + 0.5 < (xj - xi) * (y + 0.5 - yi) / (yj - yi) + xi) ins = !ins; }
      if (ins) px(g, x, y, (x + y) % 5 === 0 ? dk : x + y < 8 ? (x + y < 5 ? lit : rock) : dk); }
    R(g, 3, 5, 5, 1, home ? '#ffd36b' : '#b28cff'); px(g, 5, 4, home ? '#ffffff' : '#e8dcff'); px(g, 6, 6, home ? '#ffd36b' : '#b28cff');   // the violet vein she charged it with
    return outline(c, OUT); });
}
export function drawShard(g, x, y, t, o = {}) {
  const { home = false, vx = 0, vy = 0, id = 0 } = o, s = shardSprite(!!home, id);
  const sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp;
  for (let i = 1; i <= 4; i++) { g.globalAlpha = 0.45 - i * 0.09; R(g, ri(x - ux * i * 4) - 1, ri(y - uy * i * 4) - 1, 3 - (i > 2 ? 1 : 0), 3 - (i > 2 ? 1 : 0), home ? '#ffd36b' : '#b28cff'); } g.globalAlpha = 1;
  if (home) { g.globalAlpha = 0.3 * (0.6 + 0.4 * wave(t, 16)); R(g, ri(x) - 8, ri(y) - 8, 16, 16, '#fff6c8'); g.globalAlpha = 1; }
  g.drawImage(s, ri(x) - 5, ri(y) - 5);
}

// ---------------- THE PORTAL ----------------
// x, y = its centre; k = how open (0 a seam, 1 full, up to 2 a flash); col = the rim colour. A black-violet well, two arms of light winding in, a rim that travels, sparks flung off.
export function drawPortal(g, x, y, t, k = 1, col = '#b28cff') {
  x = ri(x); y = ri(y); const rx = 4 + 5 * k, ry = 8 + 6 * k;
  for (let dy = -ry; dy <= ry; dy++) { const f = Math.sqrt(Math.max(0, 1 - (dy / ry) * (dy / ry))), w = Math.floor(rx * f); R(g, x - w, y + dy, w * 2 + 1, 1, '#0c0614');
    const w2 = Math.floor((rx - 2) * f); if (w2 > 0) R(g, x - w2, y + dy, w2 * 2 + 1, 1, '#1d1030'); const w3 = Math.floor((rx - 4) * f); if (w3 > 0 && Math.abs(dy) < ry - 3) R(g, x - w3, y + dy, w3 * 2 + 1, 1, '#2e1850'); }
  for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 16; i++) { const s = i / 15, a = t * 3.2 + arm * Math.PI + s * 5.5, r = 1 - s * 0.9;   // winds IN to the centre
    const px_ = x + Math.cos(a) * (rx - 2) * r, py = y + Math.sin(a) * (ry - 2) * r; g.globalAlpha = 0.35 + 0.6 * (1 - s); R(g, ri(px_), ri(py), s < 0.4 ? 2 : 1, 1, s < 0.25 ? '#ffffff' : col); }
  g.globalAlpha = 1;
  const n = 30; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, hot = ((i / n) + t * 0.9) % 1 < 0.22;   // the rim, a bright run travelling round it
    R(g, ri(x + Math.cos(a) * (rx + 0.5)), ri(y + Math.sin(a) * (ry + 0.5)), 1 + (hot ? 1 : 0), hot ? 2 : 1, hot ? '#e8dcff' : col); }
  for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * 0.37) % 1, a = i * 2.4 + Math.floor(t * 1.3 + i * 0.37) * 1.7; g.globalAlpha = 1 - ph; R(g, ri(x + Math.cos(a) * (rx + ph * 9)), ri(y + Math.sin(a) * (ry + ph * 9)), 1, 1, '#e8dcff'); } g.globalAlpha = 1;
}
// the lines a hall portal means to fire down (the greybox's fan, kept: the AIM is a rule, the portal is the picture) - dotted, drifting
export function drawAimLine(g, x, y, ang, len, t, a) {
  g.globalAlpha = a; for (let d = 12; d < len; d += 6) { const o = ((d - t * 40) % 6 + 6) % 6; if (o < 3) R(g, ri(x + Math.cos(ang) * d), ri(y + Math.sin(ang) * d), 1, 1, '#e8dcff'); } g.globalAlpha = 1;
}

// ---------------- FIRE ----------------
// one tongue: base centre (x, y), height h; three heats, a white-gold core, sways with t
export function drawFlame(g, x, y, h, t, ph = 0, w = 5) {
  h = Math.max(2, ri(h)); x = ri(x); y = ri(y);
  for (let i = 0; i < h; i++) { const f = i / h, ww = Math.max(1, Math.round(w * (1 - f * f))), sway = Math.round(Math.sin(t * 9 + ph + f * 3) * f * 1.6);
    const cx = x + sway - Math.floor(ww / 2); R(g, cx, y - 1 - i, ww, 1, f < 0.55 ? '#c9462a' : f < 0.85 ? '#ff6b2c' : '#ff9a5c');
    if (f < 0.75 && ww > 2) R(g, cx + 1, y - 1 - i, ww - 2, 1, f < 0.35 ? '#ffd36b' : '#ff8a2c'); if (f < 0.4 && ww > 3) R(g, x + sway, y - 1 - i, 1, 1, '#fff6c8'); }
}
// the hall floor alight along A.x0..x1 (floor = world y of the floor; the camera origin cx, cy)
export function drawFloorFire(g, x0, x1, floorY, cx, cy, t, VW) {
  const a = Math.max(x0, Math.floor(cx / 7) * 7 - 7), b = Math.min(x1, cx + VW + 7);
  g.globalAlpha = 0.28; R(g, ri(a - cx), ri(floorY - cy) - 12, ri(b - a), 12, '#ff6b2c'); g.globalAlpha = 1;
  for (let x = Math.ceil(a / 7) * 7; x < b; x += 7) { const w = wave(t, 5, x * 0.9), h = 6 + 8 * wave(t, 8.3, x * 0.37) + 4 * w + ((x / 7) % 3 === 0 ? 5 : 0); drawFlame(g, x - cx, floorY - cy, h, t, x * 0.5, 6); }
  for (let i = 0; i < 12; i++) { const ph = (t * 0.7 + i * 0.131) % 1, ex = a + ((i * 197 + 41) % Math.max(1, ri(b - a))); g.globalAlpha = 1 - ph; R(g, ri(ex - cx + Math.sin(t * 2 + i) * 4), ri(floorY - cy - 8 - ph * 60), 1, 1, i & 1 ? '#ffd36b' : '#ff9a5c'); } g.globalAlpha = 1;
}
// a burning rafter: x0..x1 in tiles, row; flames lick along the top, the beam under it glows and chars
export function drawRafterFire(g, tier, TS, cx, cy, t) {
  const y = tier.row * TS - cy;
  for (let x = tier.x0 * TS + 4; x < (tier.x1 + 1) * TS - 4; x += 6) { const h = 3 + 5 * wave(t, 10, x * 1.3) + (tier.collapse ? 3 * wave(t, 17, x) : 0); drawFlame(g, x - cx, y, h, t, x * 0.7, 4); }
  g.globalAlpha = 0.5 + 0.3 * wave(t, 6); R(g, ri(tier.x0 * TS - cx), ri(y + 1), (tier.x1 - tier.x0 + 1) * TS, 1, '#ff6b2c'); R(g, ri(tier.x0 * TS - cx), ri(y + 4), (tier.x1 - tier.x0 + 1) * TS, 1, '#7a2a1a'); g.globalAlpha = 1;
  if (tier.collapse) for (let x = tier.x0 * TS + 7; x < (tier.x1 + 1) * TS - 4; x += 16) R(g, ri(x - cx), ri(y + 2), 2, 5 + ((x * 7) % 4), '#2a1a14');   // the cracked, hanging char
}
// a roof slate about to go: it glows hot a few frames, then drops (k 0..1 = how far gone)
export function drawSlateCrack(g, x, y, k, t) {
  g.globalAlpha = 0.5 + 0.4 * k; R(g, ri(x) + 1, ri(y) + 2, 14, 1, '#ff6b2c'); R(g, ri(x) + 4, ri(y) + 3, 1, 4, '#ff9a5c'); R(g, ri(x) + 10, ri(y) + 3, 1, 3, '#ff9a5c'); g.globalAlpha = 1;
  if (k > 0.5) for (let i = 0; i < 3; i++) R(g, ri(x) + 3 + i * 5, ri(y) + 15 + ((t * 40 + i * 5) % 6), 1, 2, '#c9a878');
}

// ---------------- THE ROOF SHRINE ----------------
// the brazier at the end of the escape: a cold iron-bound stone bowl on a plinth, a purple-black ember; lit once you have been there (a checkpoint)
export function drawShrine(g, bx, by, lit, t) {
  bx = ri(bx); by = ri(by);
  R(g, bx - 7, by - 3, 14, 3, S.c); R(g, bx - 7, by - 3, 14, 1, S.f); R(g, bx - 5, by - 12, 10, 9, S.b); R(g, bx - 5, by - 12, 2, 9, S.d); R(g, bx + 3, by - 12, 2, 9, S.a);   // plinth, shaft
  R(g, bx - 8, by - 16, 16, 4, S.d); R(g, bx - 8, by - 16, 16, 1, S.g); R(g, bx - 7, by - 12, 14, 1, S.a);   // the bowl's lip
  R(g, bx - 3, by - 8, 6, 1, '#6a5a2a'); px(g, bx - 1, by - 7, '#e0b040'); px(g, bx, by - 9, '#e0b040'); px(g, bx + 1, by - 7, '#e0b040');   // a worn gold sigil of the crown
  if (lit) { g.globalAlpha = 0.16 + 0.07 * wave(t, 12); R(g, bx - 22, by - 40, 44, 40, '#ffd36b'); g.globalAlpha = 0.12; R(g, bx - 34, by - 52, 68, 52, '#ff9a5c'); g.globalAlpha = 1;
    R(g, bx - 6, by - 17, 12, 2, '#3a1a10'); drawFlame(g, bx, by - 16, 14 + 4 * wave(t, 12), t, 1, 8); drawFlame(g, bx - 4, by - 16, 8, t, 3, 4); drawFlame(g, bx + 4, by - 16, 9, t, 5, 4);
    for (let i = 0; i < 4; i++) { const ph = (t * 0.8 + i * 0.27) % 1; g.globalAlpha = 1 - ph; R(g, ri(bx - 4 + Math.sin(t * 3 + i * 2) * 5), ri(by - 20 - ph * 28), 1, 1, '#ffd36b'); } g.globalAlpha = 1; }
  else { R(g, bx - 6, by - 17, 12, 2, '#1a1620'); px(g, bx - 2, by - 17, '#4a2a6a'); px(g, bx + 2, by - 17, '#4a2a6a'); if (Math.sin(t * 2) > 0.2) px(g, bx, by - 18, '#7a4aa8'); }
}

// ---------------- THE HATCH ----------------
// x = left edge (world - cx), floorY = the deck's top. open = a guard is coming out: the door thrown back, a red-lit hole under it
export function drawHatch(g, x, floorY, open, t) {
  x = ri(x); floorY = ri(floorY);
  if (!open) { R(g, x - 1, floorY - 4, 24, 4, S.dk); R(g, x, floorY - 4, 22, 1, S.f);   // a trap flush with the slates: a stone frame, oak planks, two iron straps and a ring
    R(g, x + 1, floorY - 3, 20, 3, '#4a3620'); for (let i = 0; i < 4; i++) R(g, x + 1 + i * 5, floorY - 3, 1, 3, '#2a1a0c'); R(g, x + 3, floorY - 3, 2, 3, '#2a2a34'); R(g, x + 17, floorY - 3, 2, 3, '#2a2a34'); R(g, x + 9, floorY - 4, 4, 1, '#a0a0b8'); px(g, x + 10, floorY - 5, '#a0a0b8'); px(g, x + 11, floorY - 5, '#a0a0b8'); }
  else { R(g, x - 1, floorY - 7, 24, 7, S.dk); R(g, x + 1, floorY - 6, 20, 6, '#08060a'); g.globalAlpha = 0.5 + 0.3 * wave(t, 9); R(g, x + 2, floorY - 5, 18, 5, '#7a2a1a'); R(g, x + 5, floorY - 3, 12, 3, '#ff6b2c'); g.globalAlpha = 1;
    R(g, x + 21, floorY - 14, 4, 12, '#4a3620'); R(g, x + 21, floorY - 14, 1, 12, '#6a4a2a'); R(g, x + 21, floorY - 11, 4, 2, '#2a2a34'); R(g, x + 21, floorY - 5, 4, 2, '#2a2a34');   // the door, thrown back on its hinge
    for (let i = 0; i < 3; i++) { const ph = (t * 1.1 + i * 0.33) % 1; g.globalAlpha = 1 - ph; R(g, x + 5 + i * 5, floorY - 8 - ri(ph * 14), 1, 1, '#ffd36b'); } g.globalAlpha = 1; }
}

// ---------------- THE GEYSER ----------------
// tell (done = false): the slate cracks open and glows, dust jumping. erupt (k 1 -> 0 as it falls): a column of broken slate and fire, wider at the foot
export function drawGeyser(g, gx, floorY, done, k, t) {
  gx = ri(gx); floorY = ri(floorY);
  if (!done) { const p = 0.5 + 0.5 * Math.sin(t * 24);
    g.globalAlpha = 0.45 + 0.4 * p; R(g, gx - 6, floorY - 1, 12, 1, '#ff6b2c'); R(g, gx - 3, floorY - 2, 1, 1, '#ffd36b'); R(g, gx + 2, floorY - 2, 1, 1, '#ffd36b'); R(g, gx - 1, floorY - 1, 2, 1, '#fff6c8'); g.globalAlpha = 1;
    R(g, gx - 8, floorY, 5, 1, '#1a1620'); R(g, gx - 3, floorY, 7, 1, '#08060a'); R(g, gx + 4, floorY, 5, 1, '#1a1620'); px(g, gx - 5, floorY - 1, '#3c3a52'); px(g, gx + 6, floorY - 1, '#3c3a52');   // the crack
    for (let i = 0; i < 3; i++) { const ph = (t * 3 + i * 0.4) % 1; g.globalAlpha = 0.6 * (1 - ph); R(g, gx - 5 + i * 5, floorY - 2 - ri(ph * 6), 1, 1, '#c9a878'); } g.globalAlpha = 1; return; }
  if (k <= 0) return; const H = ri(34 * k);
  g.globalAlpha = 0.5; R(g, gx - 9, floorY - 4, 18, 4, '#ff6b2c'); g.globalAlpha = 1;
  for (let y = 0; y < H; y++) { const f = y / 34, w = Math.max(3, ri(11 - f * 6)); R(g, gx - Math.floor(w / 2), floorY - 1 - y, w, 1, y % 5 === 0 ? '#3c3a52' : y % 3 === 0 ? '#6c6a82' : '#8a88a0');
    R(g, gx - Math.floor(w / 2) + 1, floorY - 1 - y, Math.max(1, w - 4), 1, f < 0.6 ? '#ff9a5c' : '#ffd36b'); R(g, gx - Math.floor(w / 2), floorY - 1 - y, 1, 1, '#1b1626'); R(g, gx + Math.ceil(w / 2) - 1, floorY - 1 - y, 1, 1, '#1b1626'); }
  for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4 + (i & 1 ? 0.2 : 0), r = (1 - k) * 18 + i * 3; R(g, ri(gx + Math.sin(a) * r), ri(floorY - H - Math.cos(a) * r * 0.6 + (1 - k) * 22), 3 - (i % 2), 3 - (i % 2), i % 3 ? '#8a88a0' : '#ff9a5c'); }
}

// ---------------- THE BANNER LASH ----------------
// her banner-cloth as a whip: from (x, y) out along face * reach, k 0..1 = how far it has cracked; a wave runs down it, gold fringe, a weighted gold tassel at the tip
export function drawLash(g, x, y, face, reach, k, t, high) {
  const n = 22, len = reach * Math.min(1, k * 3), life = 1 - Math.max(0, (k - 0.55) / 0.45);
  g.globalAlpha = Math.max(0.2, life);
  for (let i = 0; i < n; i++) { const f = i / (n - 1), px0 = x + face * len * f, amp = (high ? 7 : 3) * Math.sin(f * 9 - t * 70) * (1 - f * 0.5) + (high ? f * f * 14 * (1 - k) : 0);
    const py = y + amp; R(g, ri(px0), ri(py), 4 + (i & 1), 3 - (f > 0.6 ? 1 : 0), i % 6 < 3 ? '#7a3a9a' : '#5a2a7a'); R(g, ri(px0), ri(py), 4, 1, '#b28cff'); R(g, ri(px0), ri(py) + (f > 0.6 ? 1 : 2), 4, 1, '#e0b040'); }
  const tx = x + face * len, ty = y + (high ? 14 * (1 - k) : 0); R(g, ri(tx) - 2, ri(ty) - 2, 5, 5, '#a0781c'); R(g, ri(tx) - 1, ri(ty) - 1, 3, 3, '#ffd36b'); px(g, ri(tx), ri(ty), '#fff6c8');
  g.globalAlpha = 1;
}
// the tell: where the lash will land, a gold-edged purple tatter fluttering at her fist (high = over the head, low = along the floor)
export function drawLashTell(g, x, y, face, high, t) {
  for (let i = 0; i < 6; i++) { const f = i / 5; R(g, ri(x + face * (4 + i * 3)), ri(y + (high ? -6 - f * 8 : f * 3) + Math.sin(t * 40 + i) * 1.5), 3, 2, i & 1 ? '#7a3a9a' : '#e0b040'); }
}

// ---------------- THE STUN ----------------
export function drawStunStars(g, x, y, t) {
  for (let k = 0; k < 3; k++) { const a = t * 4 + k * 2.09, sx = ri(x + Math.cos(a) * 16), sy = ri(y + Math.sin(a) * 4), big = Math.sin(a) > 0; R(g, sx - 1, sy, 3, 1, '#ffd36b'); R(g, sx, sy - 1, 1, 3, '#ffd36b'); if (big) px(g, sx, sy, '#fff6c8'); }
}
// the cast tell on her crown toss: the crown's glint gathers in her fist
export function drawGlint(g, x, y, t) { const p = wave(t, 30); g.globalAlpha = 0.5 + 0.4 * p; R(g, ri(x) - 1, ri(y) - 1, 3, 3, '#fff6c8'); R(g, ri(x) - 3, ri(y), 7, 1, '#fff6c8'); R(g, ri(x), ri(y) - 3, 1, 7, '#fff6c8'); g.globalAlpha = 1; }

// ---------------- THE TOWER TOP: BACKDROP ----------------
// VW x VH, drawn over the shared sky when the camera is over the deck. A night sky stained red from below, smoke rolling up past the parapet, and far below the keep and her
// hall burning: towers and curtain wall in silhouette, lit windows, roof-fires, the smoke column. Parallax: far smoke 0.1, the ruin 0.22.
const ruin = (W) => once('ruin' + W, () => { const [c, g] = canvas(W, 150), rnd = mulberry(77);
  const wall = (x0, x1, top) => { R(g, x0, top, x1 - x0, 150 - top, '#17101c'); for (let x = x0; x < x1 - 3; x += 6) R(g, x, top - 3, 3, 3, '#17101c'); };
  wall(0, W, 112);
  for (let x = 6; x < W - 30;) { const w = 16 + ri(rnd() * 22), top = 56 + ri(rnd() * 40), kind = rnd();
    R(g, x, top, w, 150 - top, kind < 0.5 ? '#1e1424' : '#22162a'); R(g, x, top, 2, 150 - top, '#2e1c34');
    if (kind < 0.55) { for (let i = 0; i < w - 3; i += 5) R(g, x + i, top - 3, 3, 3, '#1e1424'); }   // a crenelled tower
    else { for (let i = 0; i < w / 2; i++) R(g, x + i, top - ri((w / 2 - Math.abs(i - w / 4)) * 0.7) + 1, 1, ri((w / 2 - Math.abs(i - w / 4)) * 0.7), '#22162a'); }   // a steep roof, half fallen
    for (let wy = top + 8; wy < 140; wy += 12) for (let wx = x + 4; wx < x + w - 4; wx += 8) if (rnd() < 0.6) { R(g, wx, wy, 2, 4, rnd() < 0.5 ? '#ff9a3c' : '#c9462a'); }
    x += w + 3 + ri(rnd() * 8); }
  return c; });
export function drawRoofBack(g, cx, cy, VW, VH, t) {
  const hz = ri(VH * 0.78 - cy * 0.12), bands = ['#0e0a18', '#140c1c', '#1a0f20', '#261226', '#3a1828', '#541f26', '#7a2a24', '#a8402a', '#d8683a'];
  const bh = Math.ceil(hz / bands.length);
  for (let i = 0; i < bands.length; i++) { R(g, 0, i * bh, VW, bh + 1, bands[i]); if (i) for (let x = (i & 1); x < VW; x += 2) R(g, x, i * bh, 1, 1, bands[i - 1]); }   // dithered seams
  R(g, 0, hz, VW, VH - hz, '#2e1418');
  const rnd = mulberry(9);   // the stars that are left (a few; the smoke has most)
  for (let i = 0; i < 26; i++) { const sx = ri(rnd() * VW), sy = ri(rnd() * hz * 0.5); if (Math.sin(t * 2 + i) > -0.6) R(g, sx, sy, 1, 1, i % 5 ? '#6a5a7a' : '#e8dcff'); }
  const W = Math.max(VW + 80, 420), r = ruin(W), ox = -ri((cx * 0.22) % W);   /* (gq3 8.4) whole pixels */
  g.globalAlpha = 0.9; g.drawImage(r, ri(ox), hz - 100); if (ox + W < VW) g.drawImage(r, ri(ox + W), hz - 100); g.globalAlpha = 1;
  g.globalAlpha = 0.5 + 0.1 * wave(t, 3); R(g, 0, hz - 18, VW, 20, '#ff6b2c'); g.globalAlpha = 1;   // the glow of the fires, along the whole horizon
  for (let i = 0; i < 9; i++) { const fx = ri(((i * 83 + 20 - cx * 0.22) % (VW + 60) + VW + 60) % (VW + 60)) - 30; drawFlame(g, fx, hz - 30 - (i * 17) % 22, 8 + 7 * wave(t, 7, i * 1.9), t, i, 6); }
  for (let i = 0; i < 6; i++) { const sx = (i * 71 + 15 - cx * 0.1) % (VW + 80), c0 = wave(t, 0.3, i * 2) ;   // smoke columns climbing the sky: stacked soft squares drifting up and sideways
    for (let j = 0; j < 14; j++) { const ph = (t * 0.06 + j * 0.07 + i * 0.13) % 1, w = 10 + ph * 34; g.globalAlpha = 0.5 * (1 - ph) * (0.7 + 0.3 * c0); R(g, ri(((sx + ph * 40 + Math.sin(j) * 8) % (VW + 80)) - 40 - w / 2), ri(hz - 10 - ph * hz * 0.85), ri(w), ri(w * 0.55), j & 1 ? '#1a1018' : '#2a1820'); } }
  g.globalAlpha = 1;
  for (let i = 0; i < 22; i++) { const ph = (t * 0.25 + i * 0.047) % 1, ex = ((i * 97 + 31 - cx * 0.3 + Math.sin(t + i) * 6) % VW + VW) % VW; g.globalAlpha = Math.min(1, (1 - ph) * 1.5); R(g, ri(ex), ri(hz - ph * hz), 1, 1, i % 3 ? '#ff9a5c' : '#ffd36b'); } g.globalAlpha = 1;   // embers drifting up past the deck
}

// ---------------- THE TOWER TOP: DECK DRESSING ----------------
// over the tiles, under the creatures: the deck (tile cols x0..x1 at floor row `floorRow`), crenel teeth along both end parapets and a wall-walk lip, the chimney stack's cap and soot, flag seams,
// scorch marks and the cracks the geysers will use. Deterministic from the column.
export function drawRoofFront(g, A, TS, cx, cy, t, VW) {
  const fy = ri(A.floor - cy), x0 = ri(A.x0 - cx), x1 = ri(A.x1 - cx);
  if (x1 < -20 || x0 > VW + 20) return;
  const rnd = mulberry(3);
  for (let x = Math.max(x0, -16); x < Math.min(x1, VW + 16); x += 16) { const k = ((x - x0) / 16) | 0, h = (k * 5 + 3) % 4;   // flag seams and a missing corner, a scorch every few
    R(g, x, fy, 1, 3, S.dk); if (h === 0) { R(g, x + 3, fy, 7, 1, '#08060a'); px(g, x + 5, fy + 1, S.dk); } if (h === 2) { g.globalAlpha = 0.35; R(g, x + 2, fy - 1, 12, 1, '#1a0e08'); g.globalAlpha = 1; } }
  for (const bx of [x0, x1]) {   // the two battlements (cols 612 and 660, rows 17-19): merlons on their tops, a fire-lit face turned to the deck, a sooty cap
    for (const mx of [0, 8]) { R(g, bx + mx, fy - 54, 8, 6, S.e); R(g, bx + mx, fy - 54, 8, 1, S.g); R(g, bx + mx + 7, fy - 54, 1, 6, S.b); }
    R(g, bx, fy - 48, 16, 1, '#08060a'); g.globalAlpha = 0.22 + 0.06 * wave(t, 5, bx); R(g, bx + (bx === x0 ? 8 : 0), fy - 47, 8, 47, '#ff6b2c'); g.globalAlpha = 1; for (let s = 0; s < 3; s++) R(g, bx + 2 + s * 5, fy - 46, 1, 8 + s * 6, '#0e0c12'); }
  for (const sc of (A.tower ? [] : (A.stack || [])).slice(0, 1)) { const sx = ri(sc * TS - cx); if (sx < -40 || sx > VW + 40) continue;   // the chimney stack: a stone cap with a draw-hole, soot streaks, a smoulder
    R(g, sx - 3, fy - 52, 38, 5, S.d); R(g, sx - 3, fy - 52, 38, 1, S.g); R(g, sx, fy - 47, 32, 2, S.dk); R(g, sx + 8, fy - 58, 16, 6, S.c); R(g, sx + 8, fy - 58, 16, 1, S.f); R(g, sx + 11, fy - 56, 10, 2, '#08060a');
    for (let i = 0; i < 4; i++) R(g, sx + 4 + i * 8, fy - 45, 1, 14 + i * 5, '#0e0c12'); for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i * 0.33) % 1; g.globalAlpha = 0.5 * (1 - ph); R(g, ri(sx + 14 + Math.sin(t + i) * 4), ri(fy - 60 - ph * 40), ri(6 + ph * 10), ri(4 + ph * 6), '#1a1218'); } g.globalAlpha = 1; }
  for (const gx of (A.geyserCracks || [])) { const X = ri(gx - cx); R(g, X - 5, fy, 10, 1, '#1a0c10'); }
  void rnd;
}
