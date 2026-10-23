// src/redraw/gorm_fx.js - FIRE AND SMOKE for KING GORM 2 (claude/gorm2art, Sonnet art pass). Art only: nothing here is a hitbox, a timer or a number.
// Every flame, ember, torch and smoke puff is BAKED ONCE into a small sprite sheet (a teardrop of four hot layers in five sway frames, three sizes) and a frame is a handful of drawImage calls:
// the mobile budget (>= 40 fps at 4x CPU) holds on the burning run and the glade because nothing here walks pixels at draw time and the ember field is CAPPED (EMBER_CAP).
//   flame(g, x, y, size, time, seed)      a standing flame, base at (x, y): size 'S' 8x14, 'M' 12x20, 'L' 16x28
//   bed(g, x0, x1, y, time)               a bed of flames along the floor (tiled baked strips)
//   torch(g, x, y, face, time, lit)       a goblin's torch: stick, wrapped head, flame (lit: a big one)
//   glow(g, x, y, r, a)                   one baked additive glow
//   smoke(g, x, y, t, s)                  a puff at age t 0..1
//   embers(g, cx, cy, VW, VH, time, n)    a capped field of rising embers over the screen
import { canvas, rect } from '../px.js';

const R = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const EMBER_CAP = 22;
const LAYERS = ['#7a1a10', '#c9401a', '#f08a2a', '#ffd27a', '#fff6c8'];
const SZ = { S: [8, 14], M: [12, 20], L: [16, 28] };

/* one flame frame: a teardrop that sways, in layers (dark red rim, red, orange, yellow, a white-hot core), a flicked tongue off one side */
function bakeFlame(w, h, k, seed) {
  const [c, g] = canvas(w, h);
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1);                                           /* 0 tip .. 1 base */
    const half = (w / 2) * Math.pow(t, 0.62) * (1 - 0.22 * t * t * t) + 0.4;
    const sway = Math.sin(k * 1.256 + seed + t * 3.2) * (1 - t) * (w * 0.14) + Math.sin(k * 2.5 + t * 7) * (1 - t) * 0.6;
    for (let l = 0; l < 5; l++) {
      const sc = [1, 0.78, 0.56, 0.36, 0.18][l], lo = [0, 0.08, 0.2, 0.34, 0.5][l];
      if (t < lo) continue;
      const hw = Math.max(0, half * sc - (l > 2 ? 0.3 : 0)), x0 = Math.round(w / 2 + sway * (1 - l * 0.12) - hw), ww = Math.max(l === 0 ? 1 : 0, Math.round(hw * 2));
      if (ww > 0) rect(g, x0, y, ww, 1, LAYERS[l]);
    }
  }
  /* a tongue flicking off the tip on alternate frames, and a few sparks above it */
  if (h > 16) { const tx = Math.round(w / 2 + (k % 2 ? 3 : -3) + Math.sin(seed) * 1.2); rect(g, tx, 1 + (k % 3), 1, 3, LAYERS[2]); rect(g, tx, 1 + (k % 3), 1, 1, LAYERS[3]); }
  return c;
}
const FRAMES = 5;
const sheet = size => once('fl' + size, () => { const [w, h] = SZ[size]; return Array.from({ length: FRAMES }, (_, k) => bakeFlame(w, h, k, k * 1.7 + w)); });
export function flame(g, x, y, size, time, seed) {
  const [w, h] = SZ[size] || SZ.M, fr = sheet(size || 'M'), k = (Math.floor(time * 11 + (seed || 0) * 0.37) % FRAMES + FRAMES) % FRAMES;
  g.drawImage(fr[k], R(x - w / 2), R(y - h));
}
export const FLAME_H = { S: 14, M: 20, L: 28 };

/* a flame bed: 96x22 strips, four frames, a dozen flames of three sizes packed in a row */
function bakeBed(k) {
  const [c, g] = canvas(96, 22);
  let seed = 7 + k * 13;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  rect(g, 0, 19, 96, 3, '#3a0e08'); rect(g, 0, 20, 96, 2, '#7a1a10');
  for (let x = 2; x < 96; x += 5 + (rnd() * 4 | 0)) { const sz = rnd() < 0.25 ? 'L' : rnd() < 0.55 ? 'M' : 'S', [w, h] = SZ[sz]; g.drawImage(sheet(sz)[(k + x) % FRAMES], x - (w >> 1), 21 - h + 2); }
  for (let x = 0; x < 96; x += 3) if (rnd() < 0.6) rect(g, x, 20, 2, 1, rnd() < 0.5 ? '#ff9a3c' : '#ffd27a');
  return c;
}
export function bed(g, x0, x1, y, time) {
  const bs = once('bed', () => [0, 1, 2, 3].map(bakeBed)), k = Math.floor(time * 9) & 3;
  for (let x = x0; x < x1; x += 96) { const w = Math.min(96, x1 - x); g.drawImage(bs[(k + ((x / 96) | 0)) & 3], 0, 0, w, 22, R(x), R(y) - 20, w, 22); }
}

/* a glow: one baked radial (additive) */
export function glow(g, x, y, r, a) {
  const s = once('glow', () => { const [c, gg] = canvas(64, 64), gr = gg.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,210,130,1)'); gr.addColorStop(0.35, 'rgba(255,150,70,0.45)'); gr.addColorStop(1, 'rgba(255,100,40,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 64, 64); return c; });
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.drawImage(s, R(x - r), R(y - r), r * 2, r * 2); g.restore();
}

/* a torch: a short stick with a pitch-soaked rag head */
export function torchSprite() {
  return once('torch', () => { const [c, g] = canvas(7, 14);
    rect(g, 3, 5, 2, 9, '#2a1a10'); rect(g, 3, 5, 1, 9, '#6a4424'); rect(g, 2, 3, 4, 4, '#1e1208'); rect(g, 2, 3, 3, 3, '#4a3a2a'); rect(g, 2, 5, 4, 1, '#c9a060'); rect(g, 3, 3, 2, 1, '#ff9a3c'); return c; });
}
export function torch(g, x, y, face, time, lit) {
  g.drawImage(torchSprite(), R(x) - 3, R(y)); flame(g, x + 0.5, y + 4, lit ? 'M' : 'S', time, x);
  if (lit) glow(g, x, y - 2, 22, 0.22);
}

/* smoke: soft grey-brown puffs, three sizes */
function puff(r, k) { const [c, g] = canvas(r * 2 + 2, r * 2 + 2);
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = Math.hypot(x, y * 1.1), n = ((x * 7 + y * 13 + k * 5) & 7); if (d > r - (n < 2 ? 1.6 : 0.4)) continue; rect(g, r + 1 + x, r + 1 + y, 1, 1, d < r * 0.45 ? '#5a4a44' : d < r * 0.78 ? '#463a36' : '#2e2422'); }
  return c; }
export function smoke(g, x, y, t, s) {
  const sp = once('puff', () => [puff(4, 0), puff(7, 1), puff(11, 2)]), i = t < 0.3 ? 0 : t < 0.65 ? 1 : 2;
  g.save(); g.globalAlpha = Math.max(0, (1 - t) * 0.55 * (s || 1)); const c = sp[i]; g.drawImage(c, R(x - c.width / 2), R(y - c.height / 2)); g.restore();
}

/* an ember field over the screen: <= EMBER_CAP pixels drifting up and east, each a 1-2 px warm fleck. Analytic in time (no state). */
export function embers(g, cx, cy, VW, VH, time, n, wind = 20) {
  n = Math.min(EMBER_CAP, n | 0); if (n <= 0) return;
  for (let i = 0; i < n; i++) {
    const sp = 22 + (i * 17) % 30, ph = (time * sp * 0.012 + i * 0.137) % 1, x = ((i * 97.3 + time * wind + Math.sin(time * 1.7 + i) * 8) % (VW + 40) + VW + 40) % (VW + 40) - 20, y = VH + 10 - ph * (VH + 30);
    g.globalAlpha = Math.min(1, ph * 4) * (1 - ph * 0.7); g.fillStyle = i % 3 === 0 ? '#ffd27a' : i % 3 === 1 ? '#ff9a3c' : '#e0501a'; g.fillRect(R(x), R(y), i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1);
  }
  g.globalAlpha = 1;
}
export function warm() { for (const s of ['S', 'M', 'L']) sheet(s); torchSprite(); smoke({ save() {}, restore() {}, drawImage() {}, set globalAlpha(v) {} }, 0, 0, 0.1, 1); smoke({ save() {}, restore() {}, drawImage() {}, set globalAlpha(v) {} }, 0, 0, 0.5, 1); smoke({ save() {}, restore() {}, drawImage() {}, set globalAlpha(v) {} }, 0, 0, 0.9, 1); once('bed', () => [0, 1, 2, 3].map(bakeBed)); }
