// sea_wildlife.js — FOUR MORE THINGS IN THE WATER: the pufferfish, the jellyfish, the lamprey and the manta.
// New bakers, built the same way reef.js builds the urchin and the angler: a char grid stamped with limb/gline/
// gpoly, settled onto its floor row, outlined. All frames face RIGHT (L is the flip).
//
// bakePuffer()  PUFFERFISH — a small round reef fish, plain and pale until it swells. Two drift frames (a small
//   disc, two fins), then two swollen frames (a bigger disc ringed in spines) for the tell and the burst.
//   canvas 20x16, anchor ax 11, ay 16   pack 8x8
//
// bakeJellyfish()  JELLYFISH — a translucent bell with trailing tentacles, drifting on its own vertical clock.
//   Three frames of the same bell with the tentacles swaying at a different phase, so the drift reads as alive
//   without ever looking like it is aiming at you (it is a hazard, not a fighter).
//   canvas 16x22, anchor ax 9, ay 22   pack 8x10
//
// bakeLamprey()  LAMPREY — a long eel-thin body and a round sucker mouth full of rings of teeth. Two swim frames
//   (the body's wave at two points in its cycle) and one latched frame (the mouth open and fixed).
//   canvas 30x10, anchor ax 6, ay 10   pack 14x6
//
// bakeManta()  MANTA — a wide ray skimming just under the surface: two wingbeats and a tucked dive frame, narrow
//   enough to read as a dart when it comes down.
//   canvas 36x14, anchor ax 19, ay 14   pack 16x6
import { fromGrid, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const rowsOf = G => G.map(r => r.join(''));
const put = (G, x, y, k) => { x = Math.round(x); y = Math.round(y); if (G[y] && x >= 0 && x < G[y].length) G[y][x] = k; };
function settle(G) {
  let low = G.length - 1; while (low >= 0 && G[low].every(k => k === '.')) low--;
  const n = G.length - 1 - low; if (n <= 0 || low < 0) return G;
  const w = G[0].length; for (let i = 0; i < n; i++) { G.pop(); G.unshift(Array(w).fill('.')); }
  return G;
}
function gline(G, x0, y0, x1, y1, k) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const pts = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  pts.forEach(([x, y], i) => put(G, x, y, typeof k === 'function' ? k(i, pts.length) : k));
  return pts;
}
function limb(G, a, b, w, ramp) {
  const ax = a[0] + 0.5, ay = a[1] + 0.5, bx = b[0] + 0.5, by = b[1] + 0.5, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, r = w / 2;
  for (let y = Math.floor(Math.min(ay, by) - r); y <= Math.ceil(Math.max(ay, by) + r); y++) for (let x = Math.floor(Math.min(ax, bx) - r); x <= Math.ceil(Math.max(ax, bx) + r); x++) {
    const row = G[y]; if (!row || x < 0 || x >= row.length) continue;
    const t = Math.max(0, Math.min(1, ((x + 0.5 - ax) * dx + (y + 0.5 - ay) * dy) / L2)), ox = x + 0.5 - ax - dx * t, oy = y + 0.5 - ay - dy * t, d = Math.hypot(ox, oy);
    if (d > r) continue;
    const s = d < 0.3 ? 0 : (-ox * 0.6 - oy * 0.8) / d;
    row[x] = s > 0.4 ? ramp[2] : s < -0.4 ? ramp[0] : ramp[1];
  }
}
function gpoly(G, pts, pick) {
  let y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
    const sy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= sy) !== (b[1] <= sy)) xs.push(a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5); x < Math.ceil(xs[i + 1] - 0.5); x++) put(G, x, y, pick(x, y));
  }
}

// ---------- PUFFERFISH ----------
// pale gold skin p, its darker underside P, a cream belly b, one dark eye e, spines s
const PF = { o: OUT, p: '#d9b968', P: '#a3813a', b: '#efe3b8', e: '#1b1626', s: '#efe3b8' };
export function bakePuffer() {
  const W = 20, H = 16, X = 10, CY = 9;
  const q = G => outline(fromGrid(rowsOf(settle(G)), PF, 1), OUT);
  const body = (G, r) => { limb(G, [X, CY], [X, CY], r * 2, ['P', 'p', 'b']); put(G, X - Math.round(r * 0.4), CY - Math.round(r * 0.3), 'e'); };
  const fins = (G, r, ph) => { gline(G, X - r, CY, X - r - 3, CY - 2 + Math.round(Math.sin(ph) * 2), 'P'); gline(G, X - 1, CY + r - 1, X - 2, CY + r + 3, 'P'); };
  const spines = (G, r) => { for (let a = 0; a < 360; a += 30) { const rad = a * Math.PI / 180, x0 = X + Math.cos(rad) * r * 0.85, y0 = CY + Math.sin(rad) * r * 0.85; gline(G, x0, y0, X + Math.cos(rad) * (r + 4), CY + Math.sin(rad) * (r + 4), 's'); } };
  const swim = (r, ph) => { const G = blank(W, H); fins(G, r, ph); body(G, r); return q(G); };
  const swell = r => { const G = blank(W, H); fins(G, r, 0); body(G, r); spines(G, r); return q(G); };
  return pack([swim(5, 0), swim(5, 3), swell(6.4), swell(7.6)], X + 1, H, 8, 8);
}

// ---------- JELLYFISH ----------
// a translucent violet bell b/B, its dim highlight g, trailing tentacles t
const JF = { o: OUT, b: '#c890d8', B: '#8f5aa8', g: '#f0d8ff', t: '#a870c0' };
export function bakeJellyfish() {
  const W = 16, H = 22, X = 8;
  const q = G => outline(fromGrid(rowsOf(settle(G)), JF, 1), OUT);
  const bell = G => { gpoly(G, [[X - 6, 8], [X - 6, 4], [X - 3, 1], [X + 3, 1], [X + 6, 4], [X + 6, 8]], (x, y) => (x + y) & 1 ? 'b' : 'B'); put(G, X - 2, 3, 'g'); put(G, X + 2, 3, 'g'); };
  const tentacles = (G, ph) => { for (let i = -2; i <= 2; i++) { const sway = Math.round(Math.sin(ph + i) * 2); gline(G, X + i * 2, 8, X + i * 2 + sway, 18 + Math.abs(i), 't'); } };
  const frame = ph => { const G = blank(W, H); tentacles(G, ph); bell(G); return q(G); };
  return pack([frame(0), frame(1.6), frame(3.2)], X + 1, H, 8, 10);
}

// ---------- LAMPREY ----------
// a dull river-green tube s/S and a raw sucker mouth m/M ringed with teeth (its own eye e)
const LP = { o: OUT, s: '#5c6858', S: '#38402f', m: '#7a2c3a', M: '#4a1620', e: '#e8dcc0' };
export function bakeLamprey() {
  const W = 30, H = 12, X = 5, MY = 6;
  const q = G => outline(fromGrid(rowsOf(settle(G)), LP, 1), OUT);
  const body = (G, ph) => { for (let i = 0; i < 22; i++) { const yy = MY + Math.round(Math.sin(i * 0.5 + ph) * 1.4); put(G, X + i, yy, i % 2 ? 's' : 'S'); put(G, X + i, yy + 1, 'S'); } };
  const mouth = (G, open) => { limb(G, [X - 1, MY], [X - 1, MY], open ? 6 : 4, ['M', 'm', 'm']); if (open) put(G, X - 1, MY, 'e'); };
  const frame = (ph, open) => { const G = blank(W, H); body(G, ph); mouth(G, open); return q(G); };
  return pack([frame(0, false), frame(2, false), frame(0, true)], X + 2, H, 14, 6);
}

// ---------- MANTA ----------
// a slate-blue back d/D and a pale belly b, skimming with a wingbeat and a tucked dive shape
const MT = { o: OUT, d: '#3a4a5c', D: '#22303e', b: '#6c8598', e: '#141c26' };
export function bakeManta() {
  const W = 36, H = 14, X = 18, CY = 8;
  const q = G => outline(fromGrid(rowsOf(settle(G)), MT, 1), OUT);
  const body = wing => { const G = blank(W, H);
    gpoly(G, [[X - 16, CY + wing], [X - 4, CY - 2], [X + 4, CY - 2], [X + 16, CY + wing], [X + 6, CY + 3], [X - 6, CY + 3]], (x, y) => (x + y) & 1 ? 'd' : 'D');
    put(G, X, CY - 1, 'b'); put(G, X - 1, CY - 1, 'b'); gline(G, X, CY + 3, X, CY + 7, 'd'); put(G, X + 12, CY + wing, 'e');
    return q(G); };
  return pack([body(-4), body(2), body(-6), body(0)], X + 1, H, 16, 6);
}
