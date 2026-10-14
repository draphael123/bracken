// src/redraw/sealed_pyramid_set.js - THE SEALED PYRAMID's SET PIECES, drawn (claude/spart, the art pass). The greybox drew every one of these as flat rectangles in src/sealed-pyramid-hands.js; the hands keep
// all the LOGIC (what fires, when, what it hits) and call these for the PICTURE - same positions, same boxes, nothing here moves anything:
//   plate(g, x, y, w, st, time)       a PLATE: a pale worn flag sunk in the floor, a scarab cut in it, its bevel; READY breathes a pale glint, ARMED burns red-gold with dust, a RELOAD shows its GAUGE
//                                     (a carved bar of eight pips on a little lintel, so the reload reads at 320x180)
//   slot(g, x, y, w, h)               the ceiling SLOT a block hangs in: a recessed cavity with a stepped lip
//   block(g, x, y, w, h, st)          THE TRAP BLOCK: dressed sandstone, a chamfered edge, a carved eye-and-seal panel, a gilt line, ring bolts for its chains; chain(g, x, y0, y1) its links
//   scoreBlock / scoreDarts           the SCORED REACH (A3): block dust and a worn square under the slot, with cracks; dart scars and a streak under the holes
//   dartWall(g, x, y0, y1, dir, armed, time)  a wall of bronze-rimmed dart holes (red-lit when armed); dart(g, x, y, dir) the flying dart
//   stone(g, x, y, r, spin, great, armed)     the rolling STONE: a granite disc cut with spokes and a seal ring; the GREAT STONE gilt
//   counterweight(g, x, y, plate)             a stone block on its chains with a carved ankh; the plate one has a pale top
//   decor(g, d, ...)                          bones, groove, dart holes, sarcophagi, THE FALSE KING, the mural, reliefs, eggs, jars, the capstone, wheels, the pits' swarm, THE FALSE DOOR (sealed / broken)
//   lamp(g, x, y, time)                       a bronze brazier on a tripod, three flame frames
//   vault(g, x, y, h, seals, got, time)       THE SEALED TOMB's door: a gilt-framed slab, four seal sockets (the ones carried, lit green)
//   corbel / walkPost                         the structures under a ledge and the robbers' walk
// Everything is baked once and memoised; the baked pieces are the contract between this file and the hands.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline } from '../px.js';
import { glyph, GLYPHS, sealRelief } from './sealed_pyramid_backdrop.js';
import { bakeSealIcon } from './sealed_pyramid_cast.js';

const R = Math.round, TS = 16;
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const ST = { r: ['#6e5636', '#8e7248', '#b09462', '#d0b47c', '#ecd8a2'], dk: '#2a1e12', gold: '#d8aa40', goldL: '#f8e08a', goldD: '#8a6a20', teal: '#3ad0a0', red: '#ff6b4a', redD: '#a02a1a', ink: '#14100a', bone: '#e8e0c8', boneD: '#a89c80' };

/* ================= PLATES ================= */
const plateBase = (w) => once('plate' + w, () => {
  const [c, g] = canvas(w, 6);
  rect(g, 1, 0, w - 2, 4, '#e8dcb8'); rect(g, 1, 0, w - 2, 1, '#fffaf0'); rect(g, 0, 1, 1, 3, '#b8a884'); rect(g, w - 1, 1, 1, 3, '#a09070'); rect(g, 1, 4, w - 2, 1, '#8a7a58'); rect(g, 2, 5, w - 4, 1, '#3a2e1c');
  for (let x = 4; x < w - 4; x += 3) if (hash(x, w) % 3 === 0) px(g, x, 2, '#cdbf98');   /* wear */
  const m = (w >> 1) - 2; rect(g, m, 1, 4, 2, '#a89a74'); px(g, m + 1, 1, '#6a5a3a'); px(g, m + 2, 1, '#6a5a3a'); px(g, m + 1, 2, '#6a5a3a'); px(g, m + 2, 2, '#6a5a3a'); rect(g, m - 3, 2, 2, 1, '#b8aa84'); rect(g, m + 5, 2, 2, 1, '#b8aa84');   /* the little scarab cut in it */
  return c; });
export function plate(g, x, y, w, st, time, k = 0) {
  /* st: 'ready' | 'armed' | 'reset' (k = how much of the reload is done, 0..1); y = the plate's row top */
  const pressed = st !== 'ready';
  g.drawImage(plateBase(w), R(x), R(y) + (pressed ? 1 : 0));
  if (st === 'ready') { g.globalAlpha = 0.16 + 0.14 * Math.sin(time * 3 + x * 0.1); g.fillStyle = '#fffaf0'; g.fillRect(R(x), R(y) - 3, w, 3); g.globalAlpha = 1; g.fillStyle = '#fffbe8'; g.fillRect(R(x) + ((time * 14 + x) % Math.max(4, w - 4)) | 0, R(y), 2, 1); }
  else if (st === 'armed') { g.globalAlpha = 0.5 + 0.35 * Math.sin(time * 26); g.fillStyle = ST.red; g.fillRect(R(x) + 1, R(y) + 1, w - 2, 2); g.globalAlpha = 0.7; g.fillStyle = '#ffd890'; g.fillRect(R(x) + 2, R(y) - 2, w - 4, 1); g.globalAlpha = 1; for (let i = 0; i < 4; i++) { g.fillStyle = '#e8d8b0'; g.fillRect(R(x) + 2 + ((i * 7 + time * 40) % (w - 4)) | 0, R(y) - 2 - ((time * 30 + i * 5) % 5) | 0, 1, 1); } }
  if (st !== 'ready') gauge(g, x, y, w, st, k, time); }
export function gauge(g, x, y, w, st, k, time) {   /* the reload gauge: a carved lintel bar of eight pips, filling amber (armed: all red) */
  const gw = Math.max(16, w), gx = R(x + w / 2 - gw / 2), gy = R(y) - 8;
  rect(g, gx, gy, gw, 5, '#1a120a'); rect(g, gx, gy, gw, 1, '#6a5638'); rect(g, gx, gy + 4, gw, 1, '#0a0705'); const n = 8, pw = (gw - 2) / n;
  for (let i = 0; i < n; i++) { const on = st === 'armed' ? true : (i + 0.5) / n <= k; rect(g, gx + 1 + R(i * pw), gy + 1, Math.max(1, R(pw) - 1), 3, on ? (st === 'armed' ? ((Math.floor(time * 12) & 1) ? ST.red : '#ffb08a') : '#ffb060') : '#3a2c1c'); }
  px(g, gx - 1, gy + 2, '#6a5638'); px(g, gx + gw, gy + 2, '#6a5638'); }

/* ================= BLOCKS, SLOTS, CHAINS ================= */
export function slot(g, x, y, w, h) {   /* the cavity the block hangs in: dark, a stepped lip */
  rect(g, R(x) - 2, R(y) - 1, w + 4, h + 1, '#1c140c'); rect(g, R(x) - 2, R(y) - 1, w + 4, 1, '#6a5638'); rect(g, R(x) - 1, R(y), w + 2, h, '#0a0705'); rect(g, R(x) - 2, R(y) + h - 1, 2, 2, '#3a2c1c'); rect(g, R(x) + w, R(y) + h - 1, 2, 2, '#3a2c1c'); }
const blockSprite = (w, h) => once('blk' + w + 'x' + h, () => {
  const [c, g] = canvas(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let k = 2 + (hash(x >> 3, y >> 3) % 2); if (hash(x, y) % 13 === 0) k--; px(g, x, y, ST.r[Math.max(0, Math.min(4, k))]); }
  rect(g, 0, 0, w, 1, ST.r[4]); rect(g, 0, 1, w, 1, ST.r[3]); rect(g, 0, h - 2, w, 1, ST.r[0]); rect(g, 0, h - 1, w, 1, ST.dk); rect(g, 0, 0, 1, h, ST.r[3]); rect(g, w - 1, 0, 1, h, ST.dk); rect(g, w - 2, 1, 1, h - 2, ST.r[0]);   /* the chamfer */
  /* the recessed panel: a carved eye-and-seal in it, gilt rule above */
  const pw = w - 12, pxx = 6; if (pw > 8) { rect(g, pxx, 4, pw, h - 9, ST.r[0]); rect(g, pxx, 4, pw, 1, ST.dk); rect(g, pxx, h - 6, pw, 1, ST.r[3]); rect(g, pxx, 3, pw, 1, ST.gold); px(g, pxx + 3, 3, ST.goldL);
    const n = Math.max(1, Math.floor((pw - 4) / 8)); for (let i = 0; i < n; i++) glyph(g, pxx + 3 + i * 8 + (((pw - 4) - n * 8) >> 1), 6 + ((h - 15) >> 1) - 1, hash(i, w) % GLYPHS.length, ST.dk); }
  for (const [bx, by] of [[3, 3], [w - 5, 3], [3, h - 5], [w - 5, h - 5]]) { rect(g, bx, by, 2, 2, '#4a3a22'); px(g, bx, by, '#b09060'); }   /* ring bolts */
  for (let i = 0; i < 3; i++) { let cx0 = 4 + hash(i, w) % (w - 8), cy0 = h - 4; for (let k = 0; k < 5; k++) { px(g, cx0, cy0 - k, ST.dk); cx0 += hash(k, i) % 3 - 1; } }   /* cracks climbing from the foot */
  rect(g, 0, h - 3, w, 1, '#3a2c1c');
  return c; });
export function block(g, x, y, w, h, st) {
  g.drawImage(blockSprite(w, h), R(x), R(y));
  if (st === 'armed') { g.globalAlpha = 0.5; for (let k = 0; k < 5; k++) { g.fillStyle = '#e8d8b0'; g.fillRect(R(x) + 3 + ((k * 19) % (w - 6)), R(y) + h + ((k * 7) % 5), 1, 2); } g.globalAlpha = 1; } }
export function chain(g, x, y0, y1) {   /* alternating links, the lit one a pale iron */
  for (let y = R(y0), i = 0; y < y1; y += 3, i++) { if (i & 1) { rect(g, x, y, 2, 2, '#6a6258'); px(g, x, y, '#a49a88'); } else { rect(g, x - 1, y, 4, 1, '#4a443c'); px(g, x, y + 1, '#2a2620'); px(g, x + 1, y + 1, '#2a2620'); } } }

/* ================= THE SCORED REACHES (A3) ================= */
export function scoreBlock(g, x0, x1, y, time) {   /* a worn square on the floor under the slot: dust, cracks, a scatter of grit */
  const w = x1 - x0; g.globalAlpha = 0.18; g.fillStyle = '#e8dcb8'; g.fillRect(R(x0), R(y) - 2, w, 2); g.globalAlpha = 0.5;
  for (let x = 0; x < w; x += 5) { g.fillStyle = hash(x, R(x0)) % 3 ? '#6a5638' : '#d8c8a0'; g.fillRect(R(x0) + x + 1, R(y) - 1, 2, 1); }
  g.fillStyle = '#1a120a'; for (let k = 0; k < 3; k++) { const cx0 = R(x0) + 6 + k * Math.max(8, (w - 12) / 2); g.fillRect(cx0, R(y) - 3, 1, 2); g.fillRect(cx0 + 1, R(y) - 2, 1, 1); } g.globalAlpha = 1; }
export function scoreDarts(g, x0, x1, y) {   /* the floor under a dart run: scuffed, small pale stains where the darts' dead lay */
  const w = x1 - x0; g.globalAlpha = 0.35; for (let x = 4; x < w; x += 9) { g.fillStyle = hash(x, R(x0)) % 2 ? '#3a2c1c' : '#c8b88c'; g.fillRect(R(x0) + x, R(y) - 1, 3, 1); } g.globalAlpha = 1; }

/* ================= DARTS ================= */
export function dartWall(g, x, y0, y1, dir, armed, time) {   /* x = the wall face; a panel of three bronze-rimmed holes per row, red-lit when armed */
  for (let yy = R(y0); yy < y1; yy += 16) for (let k = 0; k < 3; k++) { const hx = x + (dir > 0 ? -2 : 0) + (k % 2) * (dir > 0 ? -3 : 3), hy = yy + 2 + k * 4; rect(g, hx - 1, hy - 1, 5, 4, '#7a5a1c'); rect(g, hx - 1, hy - 1, 5, 1, '#e0b858'); rect(g, hx, hy, 3, 2, armed ? ((Math.floor(time * 16) & 1) ? ST.red : '#ffc890') : '#0a0705'); px(g, hx + 1, hy + 1, armed ? '#fff0d0' : '#2a2018'); } }
export function dart(g, x, y, dir) {
  rect(g, x - 6, y, 9, 1, '#4a3a22'); rect(g, x + (dir > 0 ? 3 : -8), y - 1, 3, 3, '#4a3a22'); g.fillStyle = '#e0b858'; g.fillRect(x + (dir > 0 ? 4 : -9), y, 2, 1); px(g, x + (dir > 0 ? 6 : -10), y, '#fff'); rect(g, x - (dir > 0 ? 7 : -4), y - 1, 3, 3, '#c8c0b0'); px(g, x - (dir > 0 ? 6 : -5), y, '#c84a3a'); }

/* ================= THE STONE ================= */
const stoneSprite = (r, great) => once('stone' + r + (great ? 'g' : ''), () => {
  const d = r * 2 + 4, [c, g] = canvas(d, d), m = d / 2; circle(g, m, m, r, '#3a2e22'); circle(g, m, m, r - 1, great ? '#a08850' : '#8a7a64'); circle(g, m - 1, m - 1, r - 3, great ? '#c0a468' : '#a89a82'); circle(g, m - 3, m - 3, r * 0.4, great ? '#e8cc88' : '#c8bca4');
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; line(g, m + Math.cos(a) * 2, m + Math.sin(a) * 2, m + Math.cos(a) * (r - 2), m + Math.sin(a) * (r - 2), '#3a2e22'); }   /* the spokes cut in its face */
  circle(g, m, m, r * 0.62, great ? '#8a7440' : '#7a6c58'); circle(g, m, m, r * 0.5, great ? '#b89c5c' : '#968874');
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + 0.4; px(g, m + Math.cos(a) * (r - 2.5), m + Math.sin(a) * (r - 2.5), '#d8c8a0'); }
  if (great) { circle(g, m, m, 3, '#d8aa40'); circle(g, m, m, 1.6, '#f8e08a'); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; px(g, m + Math.cos(a) * (r - 4.5), m + Math.sin(a) * (r - 4.5), '#f8e08a'); } }
  else { px(g, m, m, '#e8dcc0'); px(g, m + 1, m, '#e8dcc0'); }
  outline(c, '#14100a'); return c; });
export function stone(g, x, y, r, spin, great, armed, time, ctxText) {   /* (x, y) = the centre */
  const s = stoneSprite(r, great), d = s.width; g.save(); g.translate(R(x), R(y)); g.rotate(spin || 0); g.drawImage(s, -d / 2, -d / 2); g.restore();
  if (armed) { g.globalAlpha = 0.45 + 0.3 * Math.sin(time * 24); g.strokeStyle = ST.red; g.lineWidth = 1; g.beginPath(); g.arc(R(x), R(y), r + 2, 0, 7); g.stroke(); g.globalAlpha = 1; } }

/* ================= COUNTERWEIGHTS ================= */
const cwSprite = (plate) => once('cw' + plate, () => {
  const [c, g] = canvas(32, 30);
  for (let y = 0; y < 30; y++) for (let x = 0; x < 32; x++) px(g, x, y, ST.r[2 + (hash(x >> 3, y >> 3) % 2) - (hash(x, y) % 11 === 0 ? 1 : 0)]);
  rect(g, 0, 0, 32, 2, ST.r[4]); rect(g, 0, 28, 32, 2, ST.dk); rect(g, 0, 0, 1, 30, ST.r[3]); rect(g, 31, 0, 1, 30, ST.r[0]); rect(g, 1, 26, 30, 2, ST.r[0]);
  rect(g, 6, 5, 20, 19, ST.r[1]); rect(g, 6, 5, 20, 1, ST.dk); rect(g, 6, 23, 20, 1, ST.r[4]);
  /* an ANKH cut in the face, bronze rings where the chains go */
  circle(g, 16, 11, 3.4, ST.dk); circle(g, 16, 11, 1.8, ST.r[1]); rect(g, 15, 14, 2, 8, ST.dk); rect(g, 11, 16, 10, 2, ST.dk); px(g, 16, 10, ST.goldL);
  for (const bx of [4, 25]) { rect(g, bx, 1, 3, 4, '#7a5a1c'); rect(g, bx, 1, 3, 1, '#e0b858'); px(g, bx + 1, 3, '#2a1c08'); }
  if (plate) { rect(g, 2, 0, 28, 3, '#e8dcb8'); rect(g, 2, 0, 28, 1, '#fffaf0'); rect(g, 3, 2, 26, 1, '#a89a74'); for (let x = 5; x < 28; x += 4) px(g, x, 1, '#cdbf98'); }
  outline(c, '#14100a'); return c; });
export function counterweight(g, x, y, plateTop) { g.drawImage(cwSprite(!!plateTop), R(x), R(y)); }

/* ================= LAMPS ================= */
const lampFrame = (f) => once('lamp' + f, () => {
  const [c, g] = canvas(20, 26);
  rect(g, 6, 14, 8, 2, '#5a4220'); rect(g, 6, 16, 8, 3, '#8a7048'); rect(g, 6, 16, 8, 1, '#c8aa6c'); rect(g, 7, 19, 6, 3, '#6a5638'); rect(g, 8, 22, 4, 3, '#4a3a22'); px(g, 9, 17, '#2a1c0c'); px(g, 11, 17, '#2a1c0c'); rect(g, 5, 13, 10, 1, '#d8aa40'); rect(g, 6, 12, 8, 1, '#a07a24');   /* the tripod and the bowl */
  for (let x = 6; x < 14; x++) px(g, x, 14, hash(x, f) % 2 ? '#ff7a2a' : '#ffcc50');   /* the coals */
  const H = [8, 10, 7][f]; for (let k = 0; k < 5; k++) { const fx = 5 + k * 2 + (f & 1 ? ((k * 3) % 2) : -((k * 3) % 2)), fh = Math.max(3, H - Math.abs(k - 2) * 2 - (k % 2) * (f + 1)); line(g, fx, 12, fx + ((k + f) % 2 ? 1 : 0), 12 - fh, k % 2 ? '#ff9a2a' : '#ffcc50'); px(g, fx + 1, 12 - fh, '#ff5a1a'); px(g, 9, 12 - H + 3, '#fff0b0'); }
  px(g, 3 + f * 3, 6 - f, '#ffb040'); px(g, 15 - f * 2, 4 + f, '#ffd070');   /* sparks */
  outline(c, '#14100a'); return c; });
export function lamp(g, x, y, time) { g.drawImage(lampFrame(Math.floor(time * 9) % 3), R(x) - 10, R(y) - 4); }

/* ================= THE VAULT DOOR ================= */
export function vault(g, x, y, h, seals, got, time) {
  rect(g, x - 1, y - 2, 18, h + 2, '#3a2c1c'); rect(g, x, y, 16, h, '#8a7048'); rect(g, x, y, 16, 2, '#c8aa6c'); rect(g, x, y, 2, h, '#b09462'); rect(g, x + 14, y, 2, h, '#4a3a22');
  rect(g, x + 3, y + 3, 10, h - 6, '#6a5434'); rect(g, x + 3, y + 3, 10, 1, '#3a2c1c'); rect(g, x + 3, y + 3, 1, h - 6, '#3a2c1c'); rect(g, x + 3, y + h - 4, 10, 1, '#b09462');
  rect(g, x - 1, y - 4, 18, 3, '#d8aa40'); rect(g, x - 1, y - 4, 18, 1, '#f8e08a');
  for (let k = 0; k < seals; k++) { const sy = y + 8 + k * 14, on = k < got; circle(g, x + 8, sy, 4.4, '#1a120a'); circle(g, x + 8, sy, 3.6, on ? '#3ad0a0' : '#2e2418'); if (on) { circle(g, x + 8, sy, 2.2, '#b8fff0'); g.globalAlpha = 0.3 + 0.2 * Math.sin(time * 4 + k); g.fillStyle = '#7affd8'; g.beginPath(); g.arc(x + 8, sy, 7, 0, 7); g.fill(); g.globalAlpha = 1; } else { px(g, x + 7, sy - 1, '#4a3a28'); px(g, x + 9, sy - 1, '#4a3a28'); rect(g, x + 7, sy + 1, 3, 1, '#4a3a28'); } } }

/* ================= STRUCTURES ================= */
export function corbel(g, x, t) {   /* a carved lotus bracket keyed into the wall under a ledge */
  rect(g, x, t + 6, 6, 3, ST.r[2]); rect(g, x, t + 6, 6, 1, ST.r[4]); rect(g, x + 1, t + 9, 4, 2, ST.r[1]); rect(g, x + 2, t + 11, 3, 2, ST.r[0]); rect(g, x + 2, t + 13, 2, 2, ST.dk); px(g, x + 1, t + 7, ST.dk); px(g, x + 4, t + 7, ST.dk); px(g, x + 2, t + 10, ST.r[3]); px(g, x + 3, t + 8, '#c8a050'); }
export function walkPost(g, x, t, b) {   /* a stone post under the robbers' walk, a lotus capital, a bronze band, a plinth */
  rect(g, x, t + 6, 6, b - t - 6, ST.r[1]); rect(g, x, t + 6, 1, b - t - 6, ST.r[3]); rect(g, x + 5, t + 6, 1, b - t - 6, ST.dk); rect(g, x - 3, t + 6, 12, 3, ST.r[2]); rect(g, x - 3, t + 6, 12, 1, ST.r[4]); rect(g, x - 2, t + 9, 10, 2, ST.r[1]);
  rect(g, x, t + 18, 6, 2, '#7a5a1c'); rect(g, x, t + 18, 6, 1, '#e0b858'); rect(g, x - 3, b - 4, 12, 4, ST.r[0]); rect(g, x - 3, b - 4, 12, 1, ST.r[3]); for (let y = t + 12; y < b - 5; y += 7) px(g, x + 2, y, ST.dk); }

/* ================= DECOR ================= */
const boneSprite = (v) => once('bone' + v, () => { const [c, g] = canvas(30, 14);
  const B = ST.bone, D = ST.boneD;
  rect(g, 0, 11, 30, 3, '#c8b890'); rect(g, 0, 11, 30, 1, '#e8dcc0');   /* the dust under it */
  if (v === 0) { ellipse(g, 7, 8, 4, 3.6, B); rect(g, 5, 10, 5, 2, D); rect(g, 5, 7, 2, 2, ST.ink); rect(g, 8, 7, 2, 2, ST.ink); px(g, 7, 10, ST.ink); for (let k = 0; k < 4; k++) { line(g, 13 + k * 2, 11, 14 + k * 2, 7 - (k & 1), B); } line(g, 22, 12, 29, 10, B); px(g, 29, 9, D); px(g, 22, 11, D); }
  else if (v === 1) { for (let k = 0; k < 5; k++) { line(g, 3 + k * 3, 12, 5 + k * 3, 6 + (k % 2), B); px(g, 5 + k * 3, 6 + (k % 2), D); } rect(g, 2, 12, 17, 1, D); line(g, 20, 12, 28, 11, B); rect(g, 24, 8, 4, 3, B); px(g, 25, 9, ST.ink); px(g, 27, 9, ST.ink); }
  else { line(g, 2, 12, 12, 9, B); px(g, 12, 8, D); px(g, 2, 11, D); line(g, 8, 12, 20, 12, B); ellipse(g, 24, 9, 3.4, 3, B); px(g, 23, 8, ST.ink); px(g, 26, 8, ST.ink); rect(g, 22, 11, 5, 1, D); line(g, 14, 10, 17, 7, B); }
  return c; });
const sarcSprite = (v) => once('sarc' + v, () => { const [c, g] = canvas(48, 26);
  /* a stone coffin on a plinth: the lid a carved, gilded figure with a blue-striped nemes and crossed arms, the case painted with a column of glyphs */
  rect(g, 0, 22, 48, 4, '#5a4a30'); rect(g, 0, 22, 48, 1, '#8a7650');
  fillPoly(g, [[3, 22], [5, 9], [43, 9], [45, 22]], '#8a6a3a'); rect(g, 5, 9, 38, 2, '#c8a85a'); rect(g, 3, 20, 42, 2, '#6a4a22');
  ellipse(g, 9, 14, 5, 6, '#e0b440'); ellipse(g, 9, 14, 3.6, 4.6, '#f8e08a'); rect(g, 6, 13, 6, 1, '#1a3a68'); px(g, 7, 13, '#fff'); px(g, 11, 13, '#fff'); rect(g, 6, 8, 8, 3, '#2a6aa8'); for (let k = 0; k < 4; k++) px(g, 6 + k * 2, 8, '#5ea4e0'); rect(g, 8, 17, 3, 3, '#e0b440');
  rect(g, 15, 12, 26, 6, '#a27c40'); for (let k = 0; k < 4; k++) { rect(g, 17 + k * 6, 13, 4, 1, '#d8aa40'); rect(g, 17 + k * 6, 16, 4, 1, '#2a6aa8'); } for (let i = 0; i < 5; i++) glyph(g, 16 + i * 5, 12 + (v & 1), hash(i, v) % GLYPHS.length, '#2a1c0c');
  line(g, 28 + v * 3, 9, 33 + v * 3, 20, '#2a1c0c'); px(g, 30 + v * 3, 14, '#2a1c0c');   /* the crack in the lid */
  outline(c, '#14100a'); return c; });
const eggSprite = (v) => once('egg' + v, () => { const [c, g] = canvas(14, 16);
  ellipse(g, 7, 9, 5.4, 6.8, '#a89868'); ellipse(g, 6.5, 8.4, 4.6, 6, '#d8d0a8'); ellipse(g, 5.4, 6.4, 2, 2.6, '#f4efd0');
  for (let k = 0; k < 4; k++) px(g, 4 + (k * 5 + v) % 7, 6 + (k * 3) % 8, '#8a7a4a');
  if (v === 1) { line(g, 8, 4, 6, 9, '#2a2418'); line(g, 6, 9, 9, 13, '#2a2418'); px(g, 7, 10, '#3ad060'); px(g, 8, 11, '#9aff9a'); }
  if (v === 2) { rect(g, 3, 2, 7, 3, '#1a1008'); px(g, 5, 3, '#3a8a5a'); px(g, 8, 2, '#c8d8a0'); }   /* a hatched one: the shell broken, dark within */
  outline(c, '#14100a'); return c; });
const jarSprite = (v) => once('jar' + v, () => { const [c, g] = canvas(14, 18);
  const body = v ? '#9a6a3a' : '#b8844a', hi = v ? '#c08850' : '#d8a468';
  ellipse(g, 7, 11, 5.4, 6, body); rect(g, 4, 3, 6, 4, body); rect(g, 3, 2, 8, 2, hi); rect(g, 3, 2, 8, 1, '#f0c888'); ellipse(g, 5.4, 9.4, 2, 3.4, hi);
  rect(g, 2, 9, 10, 1, '#2a6aa8'); rect(g, 2, 12, 10, 1, '#c84a3a'); px(g, 7, 10, '#f8e08a'); px(g, 6, 11, '#f8e08a');
  if (v) { ellipse(g, 7, 2, 4, 2, '#d8d0a8'); px(g, 5, 1, '#fff'); }   /* the stopper */
  outline(c, '#14100a'); return c; });
export function boneRow(g, X, Y, n, hv) { for (let k = 0; k < Math.ceil(n / 2); k++) { const s = boneSprite((hash(k, hv) + k) % 3); g.drawImage(s, R(X) + k * 28, R(Y) + 2); } }
const kingSprite = () => once('king', () => { const [c, g] = canvas(44, 58);
  /* THE FALSE KING: a seated figure of gilt plaster on a lion-legged throne, nemes and a false beard, a flail across the knees, the eyes pits of dark */
  rect(g, 4, 52, 36, 6, '#5a4a30'); rect(g, 4, 52, 36, 1, '#8a7650'); rect(g, 6, 24, 6, 28, '#7a5a2a'); rect(g, 6, 24, 1, 28, '#a07a3a'); rect(g, 12, 38, 28, 14, '#6a4a22'); rect(g, 12, 38, 28, 2, '#a07a3a'); for (const lx of [8, 34]) { rect(g, lx, 46, 6, 6, '#b08a40'); px(g, lx + 1, 47, '#f8e08a'); px(g, lx + 4, 47, '#3a2a10'); }
  rect(g, 12, 18, 18, 22, '#d8aa40'); rect(g, 12, 18, 3, 22, '#f8e08a'); rect(g, 28, 18, 2, 22, '#8a6a20'); rect(g, 14, 30, 22, 6, '#c89a38'); rect(g, 14, 30, 22, 1, '#f0cc60'); rect(g, 33, 28, 3, 12, '#c89a38');   /* the torso, the knees */
  rect(g, 14, 20, 14, 6, '#c8a040'); for (let k = 0; k < 7; k++) { px(g, 15 + k * 2, 22, k % 2 ? '#2a6aa8' : '#c84a3a'); px(g, 15 + k * 2, 24, '#8a6a20'); }   /* the collar */
  rect(g, 17, 2, 14, 17, '#e0b440'); rect(g, 15, 2, 4, 20, '#2a6aa8'); rect(g, 29, 2, 4, 20, '#2a6aa8'); for (let k = 0; k < 6; k++) { px(g, 15, 4 + k * 3, '#e0b440'); px(g, 31, 4 + k * 3, '#e0b440'); } rect(g, 17, 2, 14, 2, '#2a6aa8');
  rect(g, 19, 9, 3, 3, '#1a0e04'); rect(g, 26, 9, 3, 3, '#1a0e04'); px(g, 20, 10, '#7a1a0a'); px(g, 27, 10, '#7a1a0a'); rect(g, 23, 12, 2, 4, '#c89a38'); rect(g, 21, 17, 6, 1, '#1a0e04'); rect(g, 22, 19, 4, 5, '#2a6aa8');   /* the face, the nose, the mouth, the beard */
  line(g, 14, 33, 38, 31, '#6a2a1a', 2); for (let k = 0; k < 4; k++) px(g, 37 + (k & 1), 31 + k, '#d8aa40');   /* the flail */
  line(g, 18, 5, 17, 14, '#fff6c0'); line(g, 22, 3, 28, 3, '#fff6c0');
  outline(c, '#14100a'); return c; });
const capstoneSprite = (w) => once('cap' + w, () => { const h = Math.round(w * 0.62), [c, g] = canvas(w, h);
  /* THE CAPSTONE: a fallen pyramidion, gilt, its point towards the sky, sand drifted against one side, cracked across - the first thing of the tomb on the summit */
  fillPoly(g, [[3, h - 2], [w / 2, 2], [w - 3, h - 2]], '#c89a38'); fillPoly(g, [[3, h - 2], [w / 2, 2], [w / 2, h - 2]], '#e8c050'); fillPoly(g, [[w / 2, 2], [w - 3, h - 2], [w / 2 + 2, h - 2]], '#8a6a20');
  line(g, w / 2, 3, w / 2 - 6, h - 4, '#fff0a0'); for (let k = 1; k < 5; k++) { const yy = 2 + k * (h - 6) / 5, half = (w / 2 - 3) * (k / 5); line(g, w / 2 - half, yy, w / 2 + half, yy, '#8a6a20'); }
  line(g, w / 2 + 3, 8, w / 2 - 2, h - 8, '#2a1c08'); line(g, w / 2 - 2, h - 8, w / 2 + 4, h - 3, '#2a1c08');
  rect(g, 0, h - 3, w, 3, '#8a7650'); rect(g, 0, h - 3, w, 1, '#c8aa6c'); for (let k = 0; k < 14; k++) px(g, hash(k, w) % w, h - 4 - (k % 3), '#e8d6a0');
  outline(c, '#14100a'); return c; });
const wheelSprite = () => once('wheel', () => { const [c, g] = canvas(44, 44);
  circle(g, 22, 22, 20, '#2a1e12'); circle(g, 22, 22, 18.4, '#8e7248'); circle(g, 22, 22, 15, '#2a1e12'); circle(g, 22, 22, 13.6, '#6e5636');
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; line(g, 22 + Math.cos(a) * 5, 22 + Math.sin(a) * 5, 22 + Math.cos(a) * 14, 22 + Math.sin(a) * 14, '#a88a58', 3); line(g, 22 + Math.cos(a) * 5, 22 + Math.sin(a) * 5, 22 + Math.cos(a) * 14, 22 + Math.sin(a) * 14, '#d0b47c'); }
  circle(g, 22, 22, 5, '#4a3418'); circle(g, 22, 22, 3.4, '#b08a30'); circle(g, 22, 22, 1.6, '#f8e08a');
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; px(g, 22 + Math.cos(a) * 17, 22 + Math.sin(a) * 17, '#d0b47c'); }
  outline(c, '#14100a'); return c; });
const SCARAB_PX = once('scarabpx', () => { const [c, g] = canvas(8, 5); ellipse(g, 3.5, 2.4, 3.2, 2, '#0e2a1c'); px(g, 3, 1, '#7ad08a'); px(g, 2, 1, '#3a8a5a'); rect(g, 3, 0, 1, 4, '#d8aa40'); px(g, 6, 2, '#ff5a3a'); px(g, 0, 4, '#06100a'); px(g, 5, 4, '#06100a'); return c; });
const doorSprite = (w, h, broken) => once('door' + w + 'x' + h + broken, () => { const [c, g] = canvas(w, h);
  /* THE FALSE DOOR: a stone stele carved as a door - a cavetto lintel with a winged sun disc, jambs of glyphs, a sealed slab with a gilt panel and the seal cut across it */
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px(g, x, y, ST.r[1 + (hash(x >> 3, y >> 3) % 2)]);
  rect(g, 0, 0, w, 10, ST.r[3]); rect(g, 0, 0, w, 2, ST.r[4]); rect(g, 0, 8, w, 2, ST.r[0]); circle(g, w / 2, 6, 3, ST.gold); px(g, w / 2 - 1, 5, ST.goldL); line(g, 2, 6, w / 2 - 4, 5, ST.gold); line(g, w - 3, 6, w / 2 + 4, 5, ST.gold); line(g, 3, 8, w / 2 - 5, 7, ST.goldD); line(g, w - 4, 8, w / 2 + 5, 7, ST.goldD);
  rect(g, 0, 10, 4, h - 10, ST.r[2]); rect(g, w - 4, 10, 4, h - 10, ST.r[0]); for (let y = 12; y < h - 6; y += 7) { glyph(g, -1, y, hash(y, 3) % GLYPHS.length, ST.dk); glyph(g, w - 5, y, hash(y, 5) % GLYPHS.length, ST.dk); }
  rect(g, 5, 12, w - 10, h - 12, ST.r[0]); rect(g, 5, 12, w - 10, 1, ST.dk); rect(g, 5, 12, 1, h - 12, ST.dk); rect(g, 6, 14, w - 12, h - 16, '#8a6a3a'); rect(g, 6, 14, w - 12, 2, ST.goldL); rect(g, 6, 14, 1, h - 16, ST.gold); rect(g, w - 7, 14, 1, h - 16, ST.goldD);
  for (let y = 20; y < h - 6; y += 9) { rect(g, 8, y, w - 16, 1, ST.dk); }
  const m = w / 2; ellipse(g, m, h * 0.5, 4.4, 5.4, ST.dk); ellipse(g, m, h * 0.5, 3.4, 4.4, '#14664a'); rect(g, m - 0.5, h * 0.5 - 5, 1, 11, ST.gold); px(g, m - 2, h * 0.5 - 2, '#7affd8'); px(g, m + 1, h * 0.5 - 2, '#7affd8');   /* THE SEAL across it */
  if (broken) { /* the great stone has been through: the slab is gone, rubble, a bent frame */ g.clearRect(5, 12, w - 10, h - 12); for (let k = 0; k < 10; k++) { const rx = 5 + hash(k, 1) % (w - 12), ry = h - 8 + hash(k, 2) % 6; rect(g, rx, ry, 3 + k % 3, 3, ST.r[1 + k % 3]); px(g, rx, ry, ST.r[4]); } }
  outline(c, '#14100a'); return c; });
export function muralSprite(w) { return once('mural' + w, () => { const h = 50, [c, g] = canvas(w, h);
  rect(g, 0, 0, w, h, '#6a5230'); rect(g, 0, 0, w, 3, '#3a2a14'); rect(g, 0, h - 3, w, 3, '#3a2a14'); rect(g, 0, 3, w, 2, '#b08a3a'); rect(g, 0, h - 5, w, 2, '#b08a3a');
  for (let x = 4; x < w - 6; x += 9) { px(g, x + 2, 6, '#c8a050'); px(g, x + 1, 7, '#a07a38'); px(g, x + 3, 7, '#a07a38'); px(g, x + 2, 8, '#4a6a30'); }   /* the lotus border */
  const m = w >> 1; for (let k = 0; k < 14; k++) { const a = k * Math.PI / 7; line(g, m, 26, m + Math.cos(a) * 34, 26 + Math.sin(a) * 18, 'rgba(216,170,64,0.35)'); }
  /* THE QUEEN OF THE BROOD: a vast scarab, gold-rayed, in the middle; the tomb's guards file toward her bearing their dead */
  ellipse(g, m, 28, 22, 14, '#0a2a1c'); ellipse(g, m - 1, 26, 19, 12, '#14664a'); ellipse(g, m - 5, 22, 9, 4.4, '#2aa078'); rect(g, m, 12, 1, 28, '#d8aa40'); ellipse(g, m + 21, 27, 6.4, 5.4, '#0a2a1c'); px(g, m + 23, 26, '#ff5a3a'); line(g, m + 26, 24, m + 31, 21, '#d8aa40'); line(g, m + 26, 30, m + 31, 33, '#d8aa40');
  for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) line(g, m + sg * (8 + i * 6), 36, m + sg * (14 + i * 6), 42, '#d8aa40'); circle(g, m, 8, 4, '#f8e08a'); circle(g, m, 8, 2.6, '#d8aa40');
  for (let i = 0; i < 6; i++) { const fx = 8 + i * 20, big = i % 2; const fig = (x0, dir) => { rect(g, x0, 34, 4, 8, '#c8a050'); rect(g, x0, 31, 4, 4, '#8a5a30'); rect(g, x0 + (dir > 0 ? 3 : -2), 36, 3, 2, '#c8a050'); rect(g, x0 - 1, 29, 6, 2, '#2a6aa8'); line(g, x0 + (dir > 0 ? 5 : -2), 38, x0 + (dir > 0 ? 8 : -5), 41, '#c8a050'); rect(g, x0 + (dir > 0 ? 6 : -6), 39, 5, 3, '#e8d8b0'); };
    if (fx < m - 26) fig(fx, 1); else if (fx > m + 26) fig(fx + 4, -1); void big; }
  for (let x = 10; x < w - 10; x += 18) rect(g, x, 44, 8, 3, '#e8d8b0');   /* the dead */
  return c; }); }
const pitGloom = (w) => once('gloom' + w, () => { const [c, g] = canvas(w, 40); const gr = g.createLinearGradient(0, 0, 0, 40); gr.addColorStop(0, 'rgba(6,24,14,0)'); gr.addColorStop(1, 'rgba(6,24,14,0.7)'); g.fillStyle = gr; g.fillRect(0, 0, w, 40); return c; });

/* the entry for each decor kind. (X, Y) = the decor's origin on screen; a, b = its columns; ctx.text for words */
export function decor(g, d, X, Y, a, b, time, K, ctx, cx, cy, vw, vh) {
  const w = (b - a + 1) * TS;
  if (d.kind === 'bones') { const n = (b - a) * 2; for (let k = 0; k <= Math.ceil(n / 2); k++) g.drawImage(boneSprite((hash(a, k) + k) % 3), R(X) + k * 28, R(Y) + 2); return; }
  if (d.kind === 'groove') { /* the stone's road: two cut rails and a worn, paler floor between, rubble at the verges */
    g.globalAlpha = 0.55; g.fillStyle = '#c8b88c'; g.fillRect(R(X), R(Y) + 12, w, 4); g.globalAlpha = 1; g.fillStyle = '#2a1e12'; g.fillRect(R(X), R(Y) + 11, w, 1); g.fillRect(R(X), R(Y) + 15, w, 1); g.fillStyle = '#6a5638'; for (let x = 0; x < w; x += 6) if (hash(x, a) % 3 === 0) g.fillRect(R(X) + x, R(Y) + 13, 3, 1); return; }
  if (d.kind === 'dartholes') { for (let r = d.y0; r <= d.y1; r++) { const wx = d.x * TS - cx, wy = r * TS - cy; for (let k = 0; k < 3; k++) { const hx = wx + 2 + (k % 2) * 6, hy = wy + 3 + k * 4; rect(g, hx - 1, hy - 1, 5, 4, '#7a5a1c'); rect(g, hx - 1, hy - 1, 5, 1, '#e0b858'); rect(g, hx, hy, 3, 2, '#0a0705'); px(g, hx + 1, hy + 1, '#2a2018'); } } return; }
  if (d.kind === 'sarcophagus') { g.drawImage(sarcSprite(hash(d.x, 3) % 2), R(X) - 12, R(Y) - 10); return; }
  if (d.kind === 'falseking') { g.drawImage(kingSprite(), R(X) - 2, R(Y) - 2); ctx.text('THE FALSE KING', R(X) + 22, R(Y) - 8, '#e8d0a0', 'center', 4); return; }
  if (d.kind === 'mural') { g.globalAlpha = 0.85; g.drawImage(muralSprite(w), R(X), R(Y)); g.globalAlpha = 1; return; }
  if (d.kind === 'scarabrelief') { const s = sealRelief(44); g.drawImage(s, R(X + w / 2 - 22), R(Y - 22)); g.globalAlpha = 0.3 + 0.25 * Math.sin(time * 2.4); g.fillStyle = '#7affd8'; g.fillRect(R(X + w / 2) - 1, R(Y) - 4, 2, 2); g.globalAlpha = 1; return; }
  if (d.kind === 'eggs') { for (let k = 0; k <= b - a; k += 2) g.drawImage(eggSprite((k + hash(a, 9)) % 3), R(X) + k * TS, R(Y) - 2); return; }
  if (d.kind === 'jars') { for (let k = 0; k <= b - a; k++) g.drawImage(jarSprite(k & 1), R(X) + k * TS + 1, R(Y) - 1); return; }
  if (d.kind === 'capstone') { g.drawImage(capstoneSprite(w), R(X), R(Y) - R(w * 0.62) + 14); return; }
  if (d.kind === 'cwheel') { const wx = d.x * TS + 16 - cx, wy = d.y * TS - cy; g.drawImage(wheelSprite(), R(wx) - 22, R(wy) - 22); return; }
  if (d.kind === 'scarabpit') { const ww = w; g.drawImage(pitGloom(ww), R(X), R(Y) - 40);
    for (let k = 0; k < (b - a + 1) * 4; k++) { const sx = X + ((k * 37 + time * 30 * (k % 2 ? 1 : -1)) % ww + ww) % ww, sy = Y + 6 - (k % 3) * 3 - Math.floor((Math.sin(time * 5 + k) + 1) * 1.2); g.drawImage(SCARAB_PX, R(sx) - 4, R(sy) - 3); }
    for (let k = 0; k < (b - a + 1) * 2; k++) { g.fillStyle = Math.floor(time * 3 + k) % 4 ? '#ff5a3a' : '#2a0e08'; g.fillRect(R(X) + ((k * 53) % ww), R(Y) - 4 - (k * 7 % 5), 1, 1); }   /* eyes in the dark */
    return; }
  if (d.kind === 'falsedoor') { const wd = (b - a + 1) * TS, h = (d.y1 - d.y0 + 1) * TS, Yd = d.y0 * TS - cy; const broken = !!K.broken.falsedoor;
    g.drawImage(doorSprite(wd + 8, h + 10, broken), R(X) - 4, R(Yd) - 10); if (!broken) ctx.text('SEALED', R(X + wd / 2), R(Yd) - 14, '#e8d0a0', 'center', 4); return; }
}
export const ART = { gauge, plate, slot, block, chain, scoreBlock, scoreDarts, dartWall, dart, stone, counterweight, lamp, vault, corbel, walkPost, decor, sealIcon: () => once('sealicon', bakeSealIcon) };
