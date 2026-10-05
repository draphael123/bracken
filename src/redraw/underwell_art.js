// src/redraw/underwell_art.js - THE UNDERWELL's GREYBOX ART (claude/underwell). Readable placeholders for the Sonnet art pass to replace:
//   THE CAST: four new scorpion skins over the scorpion's seven frames (the machine names them: 0,1 walk | 2 claw tell | 3 claw | 4 sting tell |
//   5 sting | 6 hurt) - OIL (tar-black, an oily violet sheen), DUST (pale grit-grey), THIRSTY (bleached bone, a dry blue barb) - and THE SPITTING
//   SCORPION in purple on the SLINGER's seven frames (0 stand | 1,2 the spit tell | 3 loose | 4 kick tell | 5 kick | 6 hurt), and its venom glob.
//   THE WORLD (drawn live by src/underwell-hands.js): the oil cells (oil / burning / wet / spent), the brood nests, the wall torches, THE GREAT
//   LAMP, THE DRY FOUNTAIN, the old pipes, the silted sand.
import { canvas, circle, outline, flipX, whiten, rgb, px } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (st, l) => l < 0.5 ? lerpC(st[0], st[1], l * 2) : lerpC(st[1], st[2], (l - 0.5) * 2);
function recolor(c, pick) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765; if (l < 0.13) continue;
    const st = pick(r, gg, b, l); if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.15)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d; }
const barbRed = (r, g) => r > 200 && g < 110;
const skin = (barb, hi, lo) => (r, g, b, l) => barbRed(r, g) ? barb : (r > g && l > 0.16) ? (l > 0.42 ? hi : lo) : null;
const reskin = (set, pick, order) => { const R = (order || set.R.map((_, i) => i)).map(i => recolor(set.R[i], pick)); return pack(R, set.ax, set.ay, set.w, set.h); };

/* ---------- THE CAST ---------- */
export const OIL_PICK = skin(['#3a1a5a', '#9a5ad8', '#e8c8ff'], ['#0e0c12', '#2a2436', '#6a5a8a'], ['#060508', '#141018', '#2e2638']);
export const DUST_PICK = skin(['#a89870', '#e0d0a0', '#fff8e0'], ['#5a5448', '#a8a088', '#e0d8c0'], ['#2a2620', '#5a5446', '#8a8270']);
export const THIRST_PICK = skin(['#2a5a8a', '#6ab0e8', '#d8f0ff'], ['#6a6050', '#c8bca0', '#f4ecd8'], ['#3a3428', '#7a705c', '#a89c80']);
export const SPIT_PICK = skin(['#6a1a5a', '#d84ab0', '#ffc8f0'], ['#2a0e2a', '#6a2a6a', '#b06ab0'], ['#12061a', '#30143a', '#5a2a5e']);
export const bakeOilScorpion = base => reskin(base, OIL_PICK);
export const bakeDustScorpion = base => reskin(base, DUST_PICK);
export const bakeThirstScorpion = base => reskin(base, THIRST_PICK);
/* the spitter runs the SLINGER's machine: its frames, in the slinger's order, cut from the scorpion's (stand, tail up x2, the spit, claw up, claw, hurt) */
export const SPIT_ORDER = [0, 4, 4, 5, 2, 3, 6];
export const bakeSpitScorpion = base => reskin(base, SPIT_PICK, SPIT_ORDER);
export function bakeGlob() { const [c, g] = canvas(7, 7); circle(g, 3, 3, 2.6, '#8a2a7a'); circle(g, 3, 3, 1.6, '#d84ab0'); px(g, 2, 2, '#ffc8f0'); outline(c, OUT); return c; }

/* ---------- THE WORLD ---------- */
const R = Math.round;
/* ONE CELL OF OIL at screen (x, y) = the cell's top-left; st: oil | fire | wet | spent; k: its burn left 0..1; vertical: a wall/pipe streak */
export function drawCell(g, x, y, st, k, time, vertical, seed) {
  if (vertical) {
    g.fillStyle = st === 'wet' ? '#2a3a4a' : st === 'spent' ? '#151210' : '#18141c'; g.fillRect(x + 6, y, 4, 16);
    if (st === 'oil') { g.fillStyle = '#6a5a8a'; g.fillRect(x + 7, y + ((time * 6 + seed) % 16 | 0), 1, 2); }
    if (st === 'fire') flame(g, x + 8, y + 16, 6 + 6 * k, time, seed, 0.7);
    return; }
  const b = y + 16;
  g.fillStyle = st === 'wet' ? '#2a3a4c' : st === 'spent' ? '#0e0b09' : '#141018'; g.fillRect(x, b - 3, 16, 3);
  if (st === 'oil') { g.fillStyle = '#4a3e66'; g.fillRect(x + 2, b - 3, 5, 1); const s = (time * 1.5 + seed * 0.37) % 1; g.fillStyle = s < 0.5 ? '#8a6ab8' : '#5ab0a0'; g.fillRect(x + 3 + R(s * 9), b - 3, 2, 1); }
  else if (st === 'wet') { g.fillStyle = '#7ab8e8'; g.fillRect(x + 4 + (seed % 7), b - 3, 1, 1); g.fillRect(x + 11, b - 2, 1, 1); }
  else if (st === 'spent') { g.fillStyle = '#3a2a20'; g.fillRect(x + 5, b - 2, 2, 1); }
  else if (st === 'fire') flame(g, x + 8, b, 9 + 9 * k, time, seed, 1);
}
/* a flame `h` px tall, its foot at (x, b) */
export function flame(g, x, b, h, time, seed, a) {
  const f = Math.sin(time * 17 + seed * 1.7) * 0.5 + 0.5, hh = R(h * (0.75 + 0.35 * f));
  g.globalAlpha = 0.85 * a; g.fillStyle = '#c8281e'; g.fillRect(x - 6, b - R(hh * 0.55), 12, R(hh * 0.55));
  g.fillStyle = '#ff8a2a'; g.fillRect(x - 4, b - R(hh * 0.85), 8, R(hh * 0.85)); g.fillStyle = '#ffd36b'; g.fillRect(x - 2, b - hh, 4, hh - 2);
  g.fillStyle = '#fff6d0'; g.fillRect(x - 1, b - R(hh * 0.4), 2, R(hh * 0.3)); g.globalAlpha = 1;
}
/* A BROOD NEST over its cells (screen box l, t, w, h): papery egg-sacs and chitin; burning: it chars and flames */
export function drawNest(g, l, t, w, h, burnK, time) {
  g.fillStyle = '#5a4630'; g.fillRect(l, t, w, h); g.fillStyle = '#7a6040'; for (let y = t + 3; y < t + h; y += 7) g.fillRect(l + 1, y, w - 2, 2);
  for (let i = 0; i < 8; i++) { const ex = l + 4 + ((i * 11) % Math.max(4, w - 8)), ey = t + 5 + ((i * 17) % Math.max(4, h - 10)); g.fillStyle = '#e8dcb0'; g.fillRect(ex, ey, 5, 4); g.fillStyle = '#a89870'; g.fillRect(ex + 1, ey + 3, 3, 1); }
  g.fillStyle = '#8fe04a'; for (let i = 0; i < 3; i++) g.fillRect(l + 5 + i * 9 % Math.max(3, w - 6), t + h - 8 - i * 13 % Math.max(3, h - 10), 2, 1);   /* the brood's eyes */
  if (burnK > 0) { g.globalAlpha = 0.6 * burnK; g.fillStyle = '#1a0e08'; g.fillRect(l, t, w, h); g.globalAlpha = 1; for (let x = l + 4; x < l + w; x += 8) flame(g, x, t + h, 10 + 14 * burnK, time, x, 1); }
}
/* A WALL TORCH: up (lit), falling (y offset), or the empty bracket with its ember regrowing (k 0..1) */
export function drawSconce(g, x, y, st, k, time, fallDy) {
  g.fillStyle = '#4a4440'; g.fillRect(x - 5, y + 6, 10, 2); g.fillRect(x - 1, y + 6, 2, 6);   /* the bracket */
  if (st === 'down') { g.fillStyle = '#ff8a2a'; g.globalAlpha = 0.4 + 0.5 * k; g.fillRect(x - 1, y + 3, 2, 2); g.globalAlpha = 1; if (k > 0.6) flame(g, x, y + 4, 3 + 6 * (k - 0.6) / 0.4, time, x, 0.8); return; }
  const dy = fallDy || 0; g.fillStyle = '#6a4a2a'; g.fillRect(x - 1, y - 2 + dy, 3, 10); flame(g, x + 1, y - 1 + dy, 9, time, x, 1);
}
/* THE GREAT LAMP: an iron oil lamp the width of a cart wheel, its chain to the vault; fallen, a wreck in the fire */
export function drawLamp(g, x, top, y, st, time, swing) {
  const sx = R(x + (swing || 0));
  if (st !== 'down') { g.fillStyle = '#5a5248'; for (let cy = top; cy < y - 6; cy += 4) { g.fillRect(R(x + (swing || 0) * (cy - top) / Math.max(1, y - top)) - 1, cy, 3, 3); } }
  const ly = st === 'down' ? y : y;
  g.fillStyle = '#3a3430'; g.fillRect(sx - 14, ly - 6, 28, 8); g.fillStyle = '#5a5248'; g.fillRect(sx - 16, ly - 8, 32, 3); g.fillRect(sx - 10, ly + 2, 20, 3);
  g.fillStyle = '#8a8070'; g.fillRect(sx - 14, ly - 8, 28, 1);
  if (st !== 'down') for (const fx of [-10, 0, 10]) flame(g, sx + fx, ly - 8, 8, time, fx + 3, 1);
}
/* THE DRY FOUNTAIN: a stone basin with three empty tap-sockets (full: water runs from them) */
export function drawFountain(g, x, b, full, have, time) {
  g.fillStyle = '#7a7268'; g.fillRect(x - 16, b - 10, 32, 10); g.fillStyle = '#9a9284'; g.fillRect(x - 18, b - 12, 36, 3); g.fillStyle = '#5a5448'; g.fillRect(x - 3, b - 30, 6, 20);
  for (let i = 0; i < 3; i++) { const tx = x - 9 + i * 9; g.fillStyle = i < have || full ? '#d8b040' : '#2a2620'; g.fillRect(tx - 2, b - 24, 4, 3);
    if (full) { g.fillStyle = '#7ab8e8'; g.fillRect(tx - 1, b - 21, 2, 11 + ((time * 8 + i) % 2 | 0)); } }
  if (full) { g.fillStyle = '#3a7ab8'; g.fillRect(x - 15, b - 9, 30, 3); g.fillStyle = '#e8f4f8'; g.fillRect(x - 12 + R((time * 10) % 24), b - 9, 2, 1); }
}
/* A BRASS TAP (the themed key), lying where it fell */
export function drawTap(g, x, b, time) { const k = 0.5 + 0.5 * Math.sin(time * 4); g.fillStyle = '#8a6a20'; g.fillRect(x - 4, b - 6, 8, 3); g.fillRect(x + 2, b - 9, 2, 4); g.fillRect(x - 1, b - 10, 6, 2);
  g.fillStyle = '#ffe9a0'; g.globalAlpha = 0.4 + 0.5 * k; g.fillRect(x - 3, b - 6, 2, 1); g.globalAlpha = 1; }
/* the silted floor: a band of sand over the tile's top (the tile kit is the art lane's) */
export function drawSand(g, x, y, w, time) { g.fillStyle = '#c8a46a'; g.fillRect(x, y, w, 4); g.fillStyle = '#e0c088'; for (let i = 0; i < w; i += 7) g.fillRect(x + i, y, 3, 1); g.fillStyle = '#a8804a'; g.fillRect(x, y + 4, w, 2); }
/* the old gutter's iron grate face (the slot in the wall the oil runs through) */
export function drawGutter(g, x, y, w) { g.fillStyle = '#2a2420'; g.fillRect(x, y, w, 16); g.fillStyle = '#5a5248'; for (let i = 0; i < w; i += 12) g.fillRect(x + i, y, 2, 16); g.fillRect(x, y, w, 1); g.fillRect(x, y + 15, w, 1); }
/* BLINDED: the dust scorpion's grit - the screen goes dark but for a ring round the hero (k 0..1 = how much is left) */
export function drawBlind(g, hx, hy, VW, VH, k) {
  const r = R(54 + (1 - k) * 160); g.save(); g.globalAlpha = Math.min(0.92, 0.95 * k + 0.1); g.fillStyle = '#1a1408'; g.beginPath(); g.rect(0, 0, VW, VH); g.arc(R(hx), R(hy), r, 0, Math.PI * 2, true); g.fill('evenodd'); g.restore();
  g.fillStyle = '#c8b48a'; g.globalAlpha = 0.5 * k; for (let i = 0; i < 16; i++) g.fillRect(R(hx + Math.cos(i * 2.4) * (r + 4 + (i * 7) % 20)), R(hy + Math.sin(i * 2.4) * (r + 4 + (i * 5) % 20)), 2, 2); g.globalAlpha = 1;
}
/* THE BRASS TAP's pickup icon (the stray props draw it, doubled) */
export function bakeTapIcon() { const [c, g] = canvas(10, 9); g.fillStyle = '#c8a040'; g.fillRect(1, 5, 7, 2); g.fillRect(6, 2, 2, 4); g.fillRect(4, 1, 6, 2); g.fillStyle = '#f0d070'; g.fillRect(2, 5, 3, 1); g.fillRect(5, 1, 3, 1); outline(c, OUT); return c; }
/* THE BACKDROP (greybox): the cistern's far wall in the dark - arches on pillars, two depths, the torchlight's warm haze low down */
export function drawBackdrop(g, cx, cy, VW, VH, time) {
  g.fillStyle = '#120d0a'; g.fillRect(0, 0, VW, VH);
  for (const [k, col, colL, span, top] of [[0.2, '#1c1510', '#261d16', 96, 0.18], [0.45, '#241a12', '#33261a', 64, 0.3]]) {
    const off = -((cx * k) % span); g.fillStyle = col;
    for (let x = off - span; x < VW + span; x += span) { g.fillRect(R(x), R(VH * top), R(span * 0.22), VH); g.beginPath(); g.arc(R(x + span * 0.61), R(VH * top + span * 0.4), R(span * 0.39), Math.PI, 0); g.lineTo(R(x + span), R(VH * top)); g.lineTo(R(x + span * 0.22), R(VH * top)); g.fill();
      g.fillStyle = colL; g.fillRect(R(x), R(VH * top), R(span * 0.22), 2); g.fillStyle = col; } }
  const grd = g.createLinearGradient(0, VH * 0.55, 0, VH); grd.addColorStop(0, 'rgba(120,60,20,0)'); grd.addColorStop(1, 'rgba(120,60,20,0.18)'); g.fillStyle = grd; g.fillRect(0, 0, VW, VH);
}
/* HER CAST SHELL (the approach sets her up): a husk the length of a cart, split down the back, its tail curled over - greybox */
export function drawHusk(g, x, b) {
  g.fillStyle = '#a89878'; for (let i = 0; i < 6; i++) { const sx = x - 30 + i * 10; g.fillRect(sx, b - 14 + (i % 2), 9, 12 - (i % 2)); }
  g.fillStyle = '#7a6a50'; for (let i = 0; i < 6; i++) g.fillRect(x - 30 + i * 10, b - 3, 9, 2);
  g.fillStyle = '#c8b898'; g.fillRect(x - 28, b - 15, 56, 2); g.fillStyle = '#3a3020'; g.fillRect(x - 6, b - 15, 14, 3);   /* the split */
  g.fillStyle = '#a89878'; for (let i = 0; i < 5; i++) g.fillRect(x + 30 + i * 3, b - 16 - i * 5, 6, 6); g.fillStyle = '#d8c8a0'; g.fillRect(x + 42, b - 42, 4, 8);   /* the tail and its barb */
  g.fillStyle = '#8a7a5a'; g.fillRect(x - 44, b - 8, 14, 6); g.fillRect(x - 50, b - 12, 8, 5);   /* a claw */
}
