// src/redraw/gorm_glade.js - THE KING'S GLADE and THE BURNING WOOD, painted (claude/gorm2art, Sonnet art pass). Art only: no number, timer or hitbox here (src/gorm-hands.js owns them and calls these).
//   THE GLADE   the GREAT OAK's long boughs (bark limbs out over the clearing that every hanging hangs from, charred on the right as L.oakBurn rises; the TRUNK and CROWN are src/redraw/kingswood_oak.js - the SAME
//               tree as the skyline's, so the level's one landmark is the glade's oak), the hunting lodge (logs, a shingled roof, antlers, hides, a lit door), his stump throne (rings, roots, a gold-fringed cushion,
//               an antler back), the beehive (a woven skep, the bees), the burning cone, the log trap rolling on fire, the quake's crest, the bees
//   THE BURNING WOOD  the wall of fire (a baked column of flame in three sway frames, a heat wash before it), a branch (a charred limb with leaves still lit), the marked spot (a scorch and a cross), the torch
// Everything static bakes once; per frame a handful of drawImage calls (flames come from src/redraw/gorm_fx.js).
import { canvas, rect, line, circle, outline, mulberry } from '../px.js';
import * as FX from './gorm_fx.js';
import { hash } from './kingswood_tiles.js';

const R = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const f = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const OUT = '#1b1626';

/* ---------------- the oak's long boughs: left and right, one baked strip each burn step. Local coords: x from the trunk (centre = BW/2), y = world y (0 = the world's top). ---------------- */
export const BOUGH_W = 800, BOUGH_H = 130;
const LEAF = [['#7a2a1a', '#a83a2a', '#c9463d', '#e07a30'], ['#1a0e0c', '#2a1410', '#3a2018', '#e0601a']];
function limbLine(g, x0, y0, x1, y1, w0, w1, dead, seed) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * 6 + seed) * 1.6 - Math.sin(t * Math.PI) * 3, w = w0 + (w1 - w0) * t, d = dead && x > BOUGH_W / 2;
    f(g, d ? '#0e0806' : '#1a0c08', x, y - w / 2 - 1, 1, w + 2); f(g, d ? '#2a1612' : '#4a2a1e', x, y - w / 2, 1, w); f(g, d ? '#3e2018' : '#7a4a34', x, y - w / 2, 1, 2); f(g, d ? '#150a08' : '#2a1410', x, y + w / 2 - 2, 1, 2);
    if (i % 9 === 4) f(g, d ? '#e0601a' : '#150a08', x, y - w / 4, 1, 1); }
}
function leafMass(g, cx, cy, rx, ry, seed, dead) {
  const pal = LEAF[dead ? 1 : 0];
  for (let i = 0; i < rx * 2; i++) { const h = hash(seed, i), a = (h % 628) / 100, d = (((h >> 8) % 100) / 100), x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d * 0.8;
    f(g, pal[(h >> 16) % 3 + (y < cy - ry * 0.2 ? 1 : 0)], x - 2, y - 1, 4, 3); }
  for (let i = 0; i < rx / 2; i++) { const h = hash(seed + 7, i); f(g, dead ? '#ff9a3c' : '#f6c060', cx + ((h % 100) / 100 - 0.5) * rx * 2, cy - ry * 0.5 + ((h >> 7) % 100) / 100 * ry * 0.6, 2, 1); }
}
function bakeBoughs(burn) {
  const [c, g] = canvas(BOUGH_W, BOUGH_H), CX = BOUGH_W / 2, dead = burn > 0.2;
  const limbs = [[CX - 10, 60, CX - 392, 44, 11, 3, 1], [CX - 12, 72, CX - 300, 62, 10, 3, 2], [CX + 12, 86, CX + 340, 72, 11, 3, 3], [CX + 10, 54, CX + 230, 34, 9, 3, 4]];
  for (const [x0, y0, x1, y1, w0, w1, sd] of limbs) limbLine(g, x0, y0, x1, y1, w0, w1, dead, sd);
  /* twigs and leaf masses along each, the right-hand ones char and ember */
  for (const [x0, y0, x1, y1, , , sd] of limbs) for (let k = 1; k <= 5; k++) { const t = k / 5.5, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - 8 - (k % 2) * 5, d = dead && x > CX; leafMass(g, x, y, 24 + (k % 3) * 6, 11 + (k % 2) * 3, sd * 31 + k, d); }
  return outline(c, OUT);
}
export const boughs = burn => once('bgh' + (Math.round(burn * 4) / 4), () => bakeBoughs(burn));

/* ---------------- the hunting lodge ---------------- */
export function lodge() {
  return once('lodge', () => { const [c, g] = canvas(112, 96);
    /* log walls: rows of round-ended logs, a stone footing */
    f(g, '#2a2228', 12, 78, 88, 14); f(g, '#463a3a', 12, 78, 88, 3); for (let x = 14; x < 100; x += 11) f(g, '#1e181c', x, 81, 1, 11);
    for (let r = 0; r < 8; r++) { const y = 38 + r * 5; f(g, '#1a0e08', 16, y, 80, 5); f(g, r % 2 ? '#6a4424' : '#7a5230', 16, y, 80, 4); f(g, '#a8723a', 16, y, 80, 1); f(g, '#3a2214', 16, y + 3, 80, 1);
      for (const ex of [12, 94]) { f(g, '#1a0e08', ex, y, 6, 5); f(g, '#c9a060', ex + 1, y + 1, 4, 3); f(g, '#8a5a32', ex + 2, y + 2, 2, 1); } }
    /* the roof: a deep shingled gable, red with gold trim, the barge-boards carved */
    for (let i = 0; i < 20; i++) { const w = 108 - i * 4.6, y = 38 - i * 1.7; f(g, '#2a0e0a', 56 - w / 2, y - 2, w, 3); f(g, i % 2 ? '#7a2a1a' : '#a83a2a', 56 - w / 2 + 1, y - 2, w - 2, 2); f(g, '#d9583c', 56 - w / 2 + 1, y - 2, w - 2, 1); }
    f(g, '#e0b040', 3, 38, 106, 2); f(g, '#8a6a20', 3, 40, 106, 1); f(g, '#e0b040', 55, 4, 2, 6); circle(g, 56, 4, 3, '#e0b040');
    /* the door: a pointed arch, dark inside with a fire's light in it; a stag's skull over it; shuttered windows */
    f(g, '#0a0504', 44, 54, 24, 30); for (let i = 0; i < 9; i++) { const w = 24 * Math.sqrt(1 - Math.pow((9 - i) / 9, 2)); f(g, '#0a0504', 56 - w / 2, 46 + i, w, 1); }
    f(g, '#e0702a', 47, 62, 18, 22); f(g, '#ffc474', 50, 70, 12, 14); f(g, '#fff0a8', 53, 76, 6, 8);
    f(g, '#c9b27c', 53, 40, 6, 5); f(g, '#c9b27c', 47, 37, 3, 6); f(g, '#c9b27c', 62, 37, 3, 6); f(g, '#c9b27c', 45, 35, 3, 3); f(g, '#c9b27c', 64, 35, 3, 3);
    for (const wx of [22, 80]) { f(g, '#1a0e08', wx, 56, 14, 14); f(g, '#ffc474', wx + 2, 58, 10, 10); f(g, '#fff0a8', wx + 2, 58, 10, 2); f(g, '#3a2214', wx - 3, 56, 3, 14); f(g, '#3a2214', wx + 14, 56, 3, 14); f(g, '#6a4424', wx - 3, 56, 1, 14); f(g, '#3a2214', wx + 6, 58, 2, 10); }
    /* a boar's hide pegged to the wall, a bow and a spear leaning by the door, a chopping block */
    f(g, '#5a3a24', 16, 60, 11, 15); f(g, '#7a5236', 17, 61, 9, 5); f(g, '#3a2214', 16, 74, 11, 2);
    f(g, '#3a2214', 90, 50, 1, 34); f(g, '#c9d1dc', 89, 46, 3, 5); f(g, '#c9a060', 94, 56, 1, 28); f(g, '#c9a060', 94, 56, 4, 1);
    f(g, '#5a3a24', 100, 82, 8, 8); f(g, '#8a5a32', 100, 82, 8, 2); f(g, '#c9a060', 101, 83, 6, 1);
    return outline(c, OUT); });
}
/* ---------------- the stump throne ---------------- */
export function stump() {
  return once('stump', () => { const [c, g] = canvas(68, 40);
    for (const s of [-1, 1]) for (let i = 0; i < 14; i++) { const t = i / 14, x = 34 + s * (22 + i), y = 36 + t * 3 - (1 - t) * 8; f(g, '#2a1410', x, y - 4 * (1 - t), 1, 4 * (1 - t) + 3); }
    f(g, '#1a0e08', 12, 12, 44, 26); f(g, '#3e2218', 13, 14, 42, 24); f(g, '#5a3a24', 14, 14, 10, 24); f(g, '#2a1410', 46, 14, 9, 24);
    for (let x = 17; x < 54; x += 5) f(g, '#1a0e08', x, 20 + ((x * 3) % 10), 1, 12);
    f(g, '#1a0e08', 10, 8, 48, 8); f(g, '#c9a060', 11, 9, 46, 6); f(g, '#e0c08a', 11, 9, 46, 1);   /* the cut top: pale rings */
    for (const r of [3, 6, 9]) { g.strokeStyle = '#8a5a32'; g.lineWidth = 1; g.beginPath(); g.ellipse(34.5, 12.5, r * 2.2, r * 0.6, 0, 0, 6.283); g.stroke(); }
    f(g, '#6a1e18', 16, 5, 36, 6); f(g, '#a83a2a', 17, 4, 34, 6); f(g, '#d9583c', 17, 4, 34, 1); f(g, '#e0b040', 17, 10, 34, 2); for (let x = 18; x < 50; x += 3) f(g, '#e0b040', x, 12, 1, 3);   /* the cushion and its fringe */
    /* an antler back-rest carved into the stump's edge */
    f(g, '#3a2214', 29, 2, 10, 6); for (const s of [-1, 1]) for (let k = 0; k < 11; k++) { f(g, '#cdb88a', 34 + s * (4 + k) - (s > 0 ? 0 : 1), 3 - (k * 0.8 | 0) - 2, 2, 2); if (k % 4 === 3) f(g, '#cdb88a', 34 + s * (4 + k) - (s > 0 ? 0 : 1), -2 - (k * 0.8 | 0), 2, 3); }
    return outline(c, OUT); });
}

/* ---------------- the beehive: a woven straw skep ---------------- */
export function hive(broken) {
  return once('hive' + !!broken, () => { const [c, g] = canvas(26, 30);
    if (!broken) { for (let y = 0; y < 26; y++) { const t = y / 25, w = Math.round(12 * Math.sin(Math.min(1, t * 1.25 + 0.15) * Math.PI / 2 + (t > 0.8 ? 0 : 0)) * (1 - (t > 0.85 ? (t - 0.85) * 0.8 : 0))) + 1; f(g, '#6a4a10', 13 - w, 3 + y, w * 2, 1); f(g, y % 4 < 2 ? '#e0b040' : '#c9a040', 13 - w + 1, 3 + y, w * 2 - 2, 1); f(g, '#f6d070', 13 - w + 1, 3 + y, 3, 1); f(g, '#8a6a20', 13 + w - 4, 3 + y, 3, 1); }
      f(g, '#5a3a10', 12, 0, 2, 4); f(g, '#c9a060', 11, 0, 4, 2); f(g, '#1a0e08', 10, 18, 6, 5); f(g, '#0a0504', 11, 19, 4, 4);
      for (let k = 0; k < 4; k++) { f(g, '#e0b040', 4 + k * 6, 24 + (k % 2), 1, 1); } }
    else { f(g, '#6a4a10', 3, 18, 20, 9); f(g, '#c9a040', 4, 18, 18, 7); f(g, '#f6d070', 5, 18, 6, 2); f(g, '#1a0e08', 13, 22, 5, 4); f(g, '#d98a1a', 0, 26, 26, 3); f(g, '#f0b030', 2, 26, 20, 1); }
    return outline(c, OUT); });
}
export function bees(g, x, y, n, rad, time) {
  for (let k = 0; k < n; k++) { const a = time * (3 + k % 4) + k * 0.9, bx = x + R(Math.cos(a) * rad * ((k % 5) / 5 + 0.3)), by = y + R(Math.sin(a * 1.4) * rad * 0.7);
    f(g, '#1a0e08', bx, by, 1, 1); f(g, '#e0b040', bx + 1, by, 2, 1); if ((Math.floor(time * 30) + k) & 1) f(g, '#e8eef8', bx + 1, by - 1, 1, 1); }
}

/* ---------------- a burning cone ---------------- */
export function cone() {
  return once('cone', () => { const [c, g] = canvas(9, 13);
    for (let y = 0; y < 12; y++) { const w = Math.round(1 + Math.sin(y / 11 * Math.PI) * 3.4) ; f(g, '#2a1408', 4 - w, 1 + y, w * 2 + 1, 1); f(g, (y + 1) % 3 ? '#7a4a1e' : '#a8742e', 4 - w + 1, 1 + y, Math.max(1, w * 2 - 1), 1); if (y % 3 === 0) f(g, '#e0601a', 4 - w + 1, 1 + y, 1, 1); }
    f(g, '#3a2214', 4, 0, 1, 2); return c; });
}
/* the marked spot: a scorch with a cross and four ember dashes - drawn pulsing by the caller's alpha */
export function mark(g, x, y, k, tell) {
  const s = once('mark', () => { const [c, gg] = canvas(32, 10); for (let i = 0; i < 32; i++) { const t = (i - 15.5) / 16, h = Math.sqrt(Math.max(0, 1 - t * t)) * 4; f(gg, 'rgba(20,6,4,0.7)', i, 5 - h, 1, h * 2); }
    f(gg, '#c9401a', 8, 4, 16, 1); f(gg, '#c9401a', 15, 2, 2, 5); f(gg, '#ff9a3c', 10, 5, 4, 1); f(gg, '#ff9a3c', 18, 5, 4, 1); return c; });
  g.save(); g.globalAlpha = (tell ? 0.65 : 0.3) + 0.3 * k; g.drawImage(s, R(x) - 16, R(y) - 6); g.restore();
  if (tell) { g.save(); g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = '#ff4a3c'; g.lineWidth = 1; g.beginPath(); g.ellipse(R(x) + 0.5, R(y) - 1.5, 13, 4, 0, 0, 6.283); g.stroke(); g.restore(); }
}
/* a burning limb (a charred bough, leaves still alight): w px long */
export function branch(w) {
  return once('br' + w, () => { const [c, g] = canvas(w + 8, 16);
    for (let i = 0; i < w; i++) { const t = i / w, y = 8 + Math.sin(t * 5) * 1.2, th = 6 - t * 2; f(g, '#150a08', 4 + i, y - th / 2 - 1, 1, th + 2); f(g, i % 6 < 3 ? '#3a2018' : '#2a1410', 4 + i, y - th / 2, 1, th); f(g, '#6a3a1e', 4 + i, y - th / 2, 1, 1); if (i % 5 === 2) f(g, '#e0601a', 4 + i, y, 1, 1); }
    for (const [t, up] of [[0.25, -1], [0.55, 1], [0.8, -1]]) { const bx = 4 + w * t, by = 8; line(g, bx, by, bx + 4, by + up * 5, '#2a1410', 2); rect(g, bx + 2, by + up * 5 - 1, 5, 3, '#c9463d'); rect(g, bx + 3, by + up * 5 - 1, 2, 2, '#ff9a3c'); }
    for (let k = 0; k < 4; k++) rect(g, 2 + k * 2, 5 + (k * 3) % 7, 4, 3, k % 2 ? '#7a2a1a' : '#a83a2a');
    return outline(c, OUT); });
}
/* the quake's crest: a slab of ground heaved up, cracked, lit from inside; dust is the caller's */
export function crest() {
  return once('crest', () => { const [c, g] = canvas(22, 16);
    for (let y = 0; y < 15; y++) { const w = Math.round(10 * Math.sin((y + 2) / 16 * Math.PI)) ; f(g, '#1a0e08', 11 - w, y + 1, w * 2, 1); f(g, y < 3 ? '#a8723a' : y % 4 < 2 ? '#7a5236' : '#5a3a24', 11 - w + 1, y + 1, Math.max(1, w * 2 - 2), 1); }
    f(g, '#e0601a', 7, 6, 8, 1); f(g, '#ffb04a', 9, 6, 4, 1); f(g, '#e0601a', 11, 7, 1, 4); f(g, '#c9a060', 6, 2, 5, 1);
    return c; });
}

/* ---------------- THE WALL OF FIRE: a baked column of flames three frames, a heat wash before it (drawn by the caller as one fillRect with a baked gradient) ---------------- */
export function fireWall(VH) {
  return once('wall' + VH, () => {
    const H = VH + 40, W = 72, frames = [];
    for (let k = 0; k < 3; k++) { const [c, g] = canvas(W, H); let seed = 31 + k * 17; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      /* a body of heat, then flame tongues stacked up the whole height, big at the foot, ragged at the edge facing you */
      const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, 'rgba(150,26,10,0.95)'); gr.addColorStop(0.55, 'rgba(220,80,24,0.85)'); gr.addColorStop(1, 'rgba(255,150,50,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (let y = 8; y < H; y += 7 + (rnd() * 8 | 0)) { const sz = rnd() < 0.3 ? 'L' : rnd() < 0.6 ? 'M' : 'S', x = 24 + (rnd() * 36 | 0); FX.flame(g, x, y + 10, sz, k * 0.12 + y * 0.01, y + k * 7); }
      for (let y = 0; y < H; y += 3) if (rnd() < 0.4) rect(g, 40 + (rnd() * 28 | 0), y, 2, 2, rnd() < 0.5 ? '#ffd27a' : '#ff9a3c');
      frames.push(c); }
    return frames; });
}
/* the heat wash behind the wall: the screen warms and the trunks go black before it (one gradient, baked) */
export function heatWash() {
  return once('heat', () => { const [c, g] = canvas(160, 4), gr = g.createLinearGradient(0, 0, 160, 0); gr.addColorStop(0, 'rgba(120,16,6,0.9)'); gr.addColorStop(0.5, 'rgba(190,50,16,0.5)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, 160, 4); return c; });
}
