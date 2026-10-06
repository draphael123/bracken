// redgorge2_art.js - RED GORGE 2's ART (claude/redgorge2 art pass): THE RAPIDS, THE GORGE CLIMB and the Matriarch's nest ledge. Pure drawing; no geometry, rule or number moves.
//   tile(t, x, y, at, T, L)        the new ground's own TILE KIT (src/redraw/redgorge_tiles.js calls it first): the Rapids' river-worn rock, wet at the waterline, a gravel bed;
//                                  the nest ledge's pillars (NARROW = a slim, cracked hoodoo with an undercut cap; BROAD = a massive butte with a flat cap and a carved ring), the
//                                  dam's dressed banks, the cracks' rubble, the scoured bed
//   drawBackdrops(g, cx, cy, VW, VH, time, full)   after the gorge's own backdrop: the CLIMB's HEIGHT (the opposite canyon wall, mesas, the valley and its river shrinking to a ribbon,
//                                  birds wheeling level and then BELOW) in the world rect of the Rapids + the Climb; the nest ledge's own set lives in matriarch_art.js
//   drawRapidsWater(...)           the Rapids' water, calm and the horn's white water (main.js drawWater calls it for a pool with .rapids)
//   drawTimber(g, m, ...)          a drifting timber drawn as WRECKAGE (broken bridge boards, a sealed trade crate on boards, a lashed thornwood bundle - no logs)
//   planFins / planDress           what holds every free ledge up (a rock spur to the rock below it) and the props standing on the ground (tools/redgorge2-aloft.mjs holds both)
//   drawGround(g, L, cx, cy, ...)  the spurs, the hanging scrub, the pennants, the plumes, the spill chute's flume and culvert, the horn flash and the sun shafts
import { canvas, mulberry } from '../px.js';
import { STAGE } from '../raptor-matriarch.js';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round, TS = 16;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) rc(g, x, y, 1, 1, c); };
/* where the new ground is (tile columns / rows) */
export const RAPIDS = { x0: 66, x1: 141, y0: 219, y1: 229 };
export const WORLD = { x0: 45 * TS, x1: 142 * TS, y0: 148 * TS, y1: 230 * TS };   /* the Rapids + the Climb: the canyon view's rect (world px) */
const CAM0 = 3388;   /* the camera's row at the Rapids (world px): the climb's height is measured from it */

/* ---------- THE PALETTES ---------- */
const S = { s0: '#2a1210', s1: '#46221a', s2: '#6a3626', s3: '#8e4e34', s4: '#b06a44', s5: '#d08a5a', l0: '#c87a48', l1: '#eaa468', l2: '#fad39c', dk: '#180a0a' };
const RV = { w0: '#26323c', w1: '#3a4a52', w2: '#556468', salt: '#e8e0cc', slime: '#566a3e', slime2: '#3a4a2c' };
const dim = (c, k) => { const n = parseInt(c.slice(1), 16), r = (n >> 16) & 255, g2 = (n >> 8) & 255, b = n & 255; const q = v => clamp(Math.round(v * k), 0, 255).toString(16).padStart(2, '0'); return '#' + q(r) + q(g2) + q(b); };
const mix = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), f = (s, i) => ((s >> i) & 255); const q = i => clamp(Math.round(f(A, i) + (f(B, i) - f(A, i)) * t), 0, 255).toString(16).padStart(2, '0'); return '#' + q(16) + q(8) + q(0); };

/* ================================ THE TILE KIT ================================ */
/* strata for a river rock: bands by tile row with a wavy edge, lit bands up top; `wet` darkens and cools everything under the waterline */
function bandRock(g, tx, ty, o) {
  const r = mulberry(hash(tx & 3, ty) + 7);
  for (let x = 0; x < 16; x++) { const wob = Math.round(Math.sin((tx * 16 + x) / 22 + ty * 1.7) * 1.4);
    for (let y = 0; y < 16; y++) { const sy = ty * 16 + y + wob, b = Math.floor(sy / 5), tone = [1, 2, 2, 3, 3, 4, 2, 3][(b * 7 + (b >> 2)) & 7], seam = sy % 5 === 0;
      let col = seam ? S.s0 : [S.s1, S.s2, S.s3, S.s4, S.s5][tone] || S.s3; if (o.wet) col = mix(dim(col, 0.62), RV.w1, o.wetK);
      rc(g, x, y, 1, 1, col); } }
  for (let i = 0; i < 6; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, o.wet ? RV.w0 : S.s1);
  for (let i = 0; i < 3; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, o.wet ? RV.w2 : S.s5);
}
/* THE RAPIDS' ROCK: a river boulder / bank. Row 219 = the top (lit lip, rounded shoulders); the waterline is 4 px into row 220; under it the rock is wet, cool and slimed */
function rapidsRock(x, y, at, T) {
  const air = (dx, dy) => at(x + dx, y + dy) === T.AIR, aL = air(-1, 0), aR = air(1, 0), aU = air(0, -1), top = aU, key = 'rr' + (x & 3) + '_' + y + (aL ? 'L' : '') + (aR ? 'R' : '') + (aU ? 'U' : '') + (air(0, 1) ? 'D' : '');
  return once(key, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y) + 3);
    if (y >= 225) {   /* THE BED: river gravel, dark, silted; seen through the water */
      rc(g, 0, 0, 16, 16, y === 225 ? '#2a2420' : '#1a1412'); for (let i = 0; i < 14; i++) { const gx = (r() * 14) | 0, gy = (r() * (y === 225 ? 12 : 14)) | 0, w = 2 + ((r() * 3) | 0); rc(g, gx, gy + (y === 225 ? 3 : 1), w, 2, ['#4a3a30', '#5a463a', '#3a2e28', '#6a5444'][(r() * 4) | 0]); rc(g, gx, gy + (y === 225 ? 3 : 1), w, 1, '#7a6454'); }
      if (y === 225) { rc(g, 0, 0, 16, 2, '#3a3a34'); for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, 0, '#8a8a7a'); } return c; }
    const wetFrom = y === 219 ? 99 : y === 220 ? 4 : 0;   /* the first wet pixel row of this tile */
    bandRock(g, x, y, { wet: false });
    if (wetFrom < 16) { const [w, wg] = canvas(16, 16); bandRock(wg, x, y, { wet: true, wetK: 0.45 + Math.min(0.4, (y - 220) * 0.08) }); g.drawImage(w, 0, wetFrom, 16, 16 - wetFrom, 0, wetFrom, 16, 16 - wetFrom);
      if (y === 220) { rc(g, 0, 4, 16, 1, RV.slime2); for (let xx = 0; xx < 16; xx++) { if (hash(xx + (x & 3) * 16, y) % 3) rc(g, xx, 5, 1, 1 + (hash(xx, x) % 2), RV.slime); } for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, 3, RV.salt); } }   /* the waterline: a slime fringe and a salt-white tide mark above it */
    if (top) { rc(g, 0, 0, 16, 1, S.l2); rc(g, 0, 1, 16, 1, S.l1); rc(g, 0, 2, 16, 1, S.l0); for (let xx = 0; xx < 16; xx++) { const d = hash(xx + (x & 3) * 16, y + 9) % 3; if (d === 0) px2(g, xx, 3, S.l0); if (d === 1) px2(g, xx, 2, S.l1); }
      g.globalAlpha = 0.26; rc(g, 0, 3, 16, 3, '#000'); g.globalAlpha = 1;
      for (let i = 0; i < 3; i++) px2(g, (r() * 16) | 0, 0, '#fff0cc'); }
    /* rounded shoulders: the river has worn every corner */
    if (aU && aL) { g.clearRect(0, 0, 3, 1); g.clearRect(0, 1, 2, 1); g.clearRect(0, 2, 1, 1); px2(g, 3, 0, S.l1); px2(g, 2, 1, S.l0); px2(g, 1, 2, S.s3); }
    if (aU && aR) { g.clearRect(13, 0, 3, 1); g.clearRect(14, 1, 2, 1); g.clearRect(15, 2, 1, 1); px2(g, 12, 0, S.l1); px2(g, 13, 1, S.l0); px2(g, 14, 2, S.s3); }
    if (aL) { rc(g, 0, aU ? 3 : 0, 1, 16, S.s0); g.globalAlpha = 0.3; rc(g, 1, aU ? 3 : 0, 2, 16, '#000'); g.globalAlpha = 1; }
    if (aR) { rc(g, 15, aU ? 3 : 0, 1, 16, S.s4); g.globalAlpha = 0.14; rc(g, 13, aU ? 3 : 0, 2, 16, S.l1); g.globalAlpha = 1; }
    return c; });
}

/* ---- THE NEST LEDGE: pillars, banks, the cracks' rubble, the scoured bed ---- */
const sandBody = (g, seed, y0, y1, k) => { const r = mulberry(seed); for (let y = y0; y < y1; y++) { const b = Math.floor((y + (seed & 7)) / 4), tone = [2, 3, 3, 4, 2, 3, 4, 3][(b + seed) & 7], col = ((y + (seed & 7)) % 4 === 0) ? S.s1 : [S.s1, S.s2, S.s3, S.s4, S.s5][tone];
    rc(g, 0, y, 16, 1, k === 1 ? col : dim(col, k)); } for (let i = 0; i < 5; i++) rc(g, (r() * 16) | 0, y0 + ((r() * (y1 - y0)) | 0), 1, 1, S.s1); for (let i = 0; i < 3; i++) rc(g, (r() * 16) | 0, y0 + ((r() * (y1 - y0)) | 0), 1, 1, S.s5); };
const crackAt = (g, x, y0, y1, seed) => { const r = mulberry(seed); let xx = x; for (let y = y0; y < y1; y++) { rc(g, xx, y, 1, 1, S.dk); if (r() < 0.4) xx += r() < 0.5 ? -1 : 1; xx = clamp(xx, 1, 14); } };
function pillarTile(kind, u, w, row, id) {
  return once('pl' + kind + u + w + row + id, () => { const [c, g] = canvas(16, 16), seed = hash(id.charCodeAt(0), u * 3 + row), last = u === w - 1;
    if (kind === 'bank') {   /* the dam's dressed stone: big blocks, a heavy coping, the wear of a road */
      rc(g, 0, 0, 16, 16, S.dk); const r = mulberry(seed + 5);
      for (let rr = 0; rr < 2; rr++) { const off = ((row * 2 + rr + u) & 1) ? 8 : 0; for (let bx = -8; bx < 16; bx += 16) { const x = bx + off, t = r(); rc(g, x + 1, rr * 8 + 1, 15, 7, t < 0.25 ? S.s4 : t < 0.6 ? S.s3 : S.s2); rc(g, x + 1, rr * 8 + 1, 15, 1, t < 0.3 ? S.s5 : S.s4); rc(g, x + 1, rr * 8 + 7, 15, 1, S.s1); for (let i = 0; i < 3; i++) px2(g, x + 2 + ((r() * 13) | 0), rr * 8 + 2 + ((r() * 5) | 0), S.s1); } }
      if (row === 0) { rc(g, 0, 0, 16, 6, S.s4); rc(g, 0, 0, 16, 1, S.l2); rc(g, 0, 1, 16, 1, S.l1); rc(g, 0, 2, 16, 1, S.l0); rc(g, 0, 6, 16, 1, S.dk); rc(g, 7 + (u & 1) * 3, 3, 1, 3, S.s1); for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, 3 + ((r() * 3) | 0), S.s3); rc(g, 4, 4, 8, 1, S.s3); }   /* a worn groove where the lever's keeper stands */
      if (u === 0) { rc(g, 0, 0, 1, 16, S.dk); } if (last) { rc(g, 15, 0, 1, 16, S.s4); }
      if (row === 1) { g.globalAlpha = 0.3; rc(g, 0, 10, 16, 6, '#000'); g.globalAlpha = 1; rc(g, 0, 14, 16, 2, RV.w1); for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, 13, RV.salt); }   /* the channel's tide mark at the foot */
      return c; }
    sandBody(g, seed, 0, 16, 1);
    if (kind === 'broad') {   /* BROAD: a butte - a flat flagstone cap with a carved ring (her perch), a heavy base, a seam or two; edges chamfered */
      if (row === 0) { rc(g, 0, 0, 16, 1, S.l2); rc(g, 0, 1, 16, 1, S.l1); rc(g, 0, 2, 16, 1, S.l0); rc(g, 0, 3, 16, 1, S.s4); rc(g, 0, 13, 16, 3, S.s1); rc(g, 0, 12, 16, 1, S.s2);
        if (u === 1 || u === 2) { const ox = u === 1 ? 16 : 0; for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2, x = ox + Math.cos(t) * 10, y = 8 + Math.sin(t) * 3.6; px2(g, R(x), R(y), S.s1); if (a % 5 === 0) px2(g, R(x), R(y) - 1, S.s5); }
          for (const [dx, h] of [[-5, 4], [0, 5], [5, 4]]) { const x = R(ox + dx); rc(g, x, 8 - h + 2, 1, h, S.s2); } }   /* three feathers in the ring */
        if (u === 0) { rc(g, 0, 0, 2, 16, S.s2); px2(g, 0, 0, '#000'); px2(g, 1, 0, '#000'); px2(g, 0, 1, '#000'); rc(g, 0, 1, 1, 15, S.s0); } if (last) { rc(g, 14, 3, 2, 13, S.s3); rc(g, 15, 3, 1, 13, S.s4); g.clearRect(15, 0, 1, 1); g.clearRect(14, 0, 2, 1); g.clearRect(15, 1, 1, 1); }
        if (u === 1) crackAt(g, 6, 4, 12, seed); }
      else { rc(g, 0, 0, 16, 1, S.s1); if (u === 0) { rc(g, 0, 0, 2, 16, S.s2); rc(g, 0, 0, 1, 16, S.s0); } if (last) { rc(g, 14, 0, 2, 16, S.s3); rc(g, 15, 0, 1, 16, S.s4); }
        g.globalAlpha = 0.3; rc(g, 0, 8, 16, 8, '#000'); g.globalAlpha = 1; rc(g, 0, 14, 16, 2, RV.w1); for (let i = 0; i < 4; i++) px2(g, (seed >> i) % 16, 13, RV.salt); if (u === 2) crackAt(g, 9, 1, 12, seed + 3); }
      return c; }
    /* NARROW: a slim hoodoo - an undercut cap on a thin neck, cracked right through, loose scree on the cap; unstable to look at */
    if (row === 0) { rc(g, 0, 0, 16, 1, S.l2); rc(g, 0, 1, 16, 1, S.l1); rc(g, 0, 2, 16, 1, S.l0); rc(g, 0, 3, 16, 1, S.s4);
      rc(g, 0, 9, 16, 7, S.s1); for (let x = 0; x < 16; x++) { const d = 9 + (hash(x + u * 16, 4) % 3); rc(g, x, d, 1, 16 - d, S.s0); } rc(g, 0, 9, 16, 1, S.s2);   /* the cap's undercut: a ragged dark shadow */
      const r = mulberry(seed); for (let i = 0; i < 5; i++) rc(g, (r() * 14) | 0, 0, 2, 1, S.s3); px2(g, 3 + u * 4, -1 + 1, '#fff0cc');
      if (u === 0) { g.clearRect(0, 0, 2, 1); px2(g, 0, 1, '#000'); rc(g, 0, 2, 1, 7, S.s0); } else { g.clearRect(14, 0, 2, 1); g.clearRect(15, 1, 1, 1); rc(g, 15, 2, 1, 7, S.s4); }
      let x = u === 0 ? 11 : 4; for (let y = 3; y < 10; y++) { rc(g, x, y, 1, 1, S.dk); x += (y & 1) ? 1 : -1; if (y === 6) x += u === 0 ? -2 : 2; } }   /* the crack runs through the cap, from one side to the other */
    else { rc(g, 0, 0, 16, 16, S.s2); sandBody(g, seed + 11, 0, 16, 0.78); if (u === 0) { for (let y = 0; y < 16; y++) { const k = 3 - Math.min(3, (y + 2) >> 2); g.clearRect(0, y, k > 0 ? k : 0, 1); } rc(g, 3, 0, 1, 16, S.s0); }
      else { for (let y = 0; y < 16; y++) { const k = 3 - Math.min(3, (y + 2) >> 2); g.clearRect(16 - k, y, k > 0 ? k : 0, 1); } rc(g, 12, 0, 1, 16, S.s4); }
      g.globalAlpha = 0.28; rc(g, 0, 7, 16, 9, '#000'); g.globalAlpha = 1; rc(g, 0, 14, 16, 2, RV.w1); crackAt(g, u === 0 ? 9 : 5, 0, 13, seed + 21); for (let i = 0; i < 3; i++) px2(g, (seed >> (i + 1)) % 16, 13, RV.salt); }
    return c; });
}
/* the cracks between a cluster's pillars: a tumble of fallen stone one row down */
const rubbleTile = u => once('rub' + u, () => { const [c, g] = canvas(16, 16), r = mulberry(40 + u); rc(g, 0, 8, 16, 8, S.s1); for (let i = 0; i < 9; i++) { const w = 3 + ((r() * 4) | 0), x = (r() * 12) | 0, y = 4 + ((r() * 8) | 0); rc(g, x, y, w, 3 + ((r() * 2) | 0), [S.s2, S.s3, S.s4][(r() * 3) | 0]); rc(g, x, y, w, 1, S.s5); }
  rc(g, 0, 14, 16, 2, RV.w1); for (let i = 0; i < 3; i++) px2(g, (r() * 16) | 0, 13, RV.salt); return c; });
/* the scoured bed (the channel's floor): pale, polished along the flow, a few pits, damp low down */
const bedTile = (x, y, topRow) => once('bed' + (x & 3) + y + topRow, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, y) + 19);
  rc(g, 0, 0, 16, 16, '#8a6850'); for (let i = 0; i < 7; i++) { const w = 4 + ((r() * 6) | 0), x = (r() * 12) | 0, y2 = (r() * 14) | 0; rc(g, x, y2, w, 2 + ((r() * 2) | 0), r() < 0.5 ? '#9c7860' : '#7a5844'); rc(g, x, y2, w, 1, '#bd9878'); }
  for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, '#4a2c20');
  if (topRow) { rc(g, 0, 0, 16, 1, '#ecc4a6'); rc(g, 0, 1, 16, 1, '#bd9878'); g.globalAlpha = 0.3; rc(g, 0, 2, 16, 3, '#000'); g.globalAlpha = 1; rc(g, 0, 0, 16, 1, '#f2d8b4'); } else { g.globalAlpha = 0.18 + (y - 25) * 0.1; rc(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; }
  return c; });

/* ---- THE HOOK (src/redraw/redgorge_tiles.js gorgeTile asks first) ---- */
export function tile(t, x, y, at, T, L) {
  if (t !== T.SOLID) return null;
  if (x >= RAPIDS.x0 && x <= RAPIDS.x1 && y >= RAPIDS.y0 && y <= RAPIDS.y1) return rapidsRock(x, y, at, T);
  const q = L.arena && L.arena.mat; if (!q) return null; const lx = x - q.sx; if (lx < 0 || lx >= STAGE.W) return null;
  if (y >= q.R && y <= q.R + 2) return bedTile(x, y, y === q.R);
  if (y < q.top || y > q.R - 1) return null;
  const top = STAGE.tops.find(tp => lx >= tp.x0 && lx <= tp.x1);
  if (top) return pillarTile(top.kind, lx - top.x0, top.x1 - top.x0 + 1, y - q.top, top.id);
  if (y === q.R - 1) return rubbleTile(lx & 1);
  return null;
}

/* ================================ THE CLIMB'S HEIGHT: the canyon view ================================ */
const SKY = ['#2a1a3a', '#6a3a52', '#c8704e', '#f0a86a'];
const skyStrip = () => once('sky', () => { const [c, g] = canvas(1, 128), gr = g.createLinearGradient(0, 0, 0, 128); SKY.forEach((col, i) => gr.addColorStop([0, 0.35, 0.75, 1][i], col)); g.fillStyle = gr; g.fillRect(0, 0, 1, 128); return c; });
/* a strip of strata cliff with a jagged rim; haze washes it toward the sky's mauve (the farther, the more) */
function wallStrip(seed, W, H, o) {
  const [c, g] = canvas(W, H), r = mulberry(seed), rim = []; let y = o.rim0;
  for (let x = 0; x < W; x++) { if (r() < o.stepP) y += (r() < 0.5 ? -1 : 1) * (3 + ((r() * o.stepH) | 0)); else y += (r() - 0.5) * o.jit; y = clamp(y, o.rimMin, o.rimMax); rim[x] = R(y); }
  const bands = []; let by = 0; while (by < H + 40) { const th = o.th0 + ((r() * o.th1) | 0); bands.push([by, by + th, (r() * o.cols.length) | 0]); by += th; }
  for (let x = 0; x < W; x++) { const wob = R(Math.sin(x / 41 + seed) * 1.5);
    for (let yy = rim[x]; yy < H; yy++) { const sy = yy + wob, b = bands.find(q => sy >= q[0] && sy < q[1]) || bands[0], depth = (yy - rim[x]) / H; let tone = clamp(b[2] + (depth < 0.1 ? 1 : 0) - (depth > 0.7 ? 1 : 0), 0, o.cols.length - 1);
      rc(g, x, yy, 1, 1, sy === b[0] ? o.seam : o.cols[tone]); }
    rc(g, x, rim[x], 1, 1, o.lit); }
  for (let i = 0; i < o.gullies; i++) { const gx = (r() * W) | 0, len = 30 + ((r() * 140) | 0); let xx = gx; for (let k = 0; k < len; k++) { const yy = rim[clamp(xx, 0, W - 1)] + k; if (yy < H) rc(g, xx, yy, 1 + (k % 11 === 0 ? 1 : 0), 1, o.seam); if (r() < 0.3) xx += r() < 0.5 ? -1 : 1; } }
  g.globalAlpha = o.haze; g.fillStyle = o.hazeCol; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(184,108,130,0)'); gr.addColorStop(1, 'rgba(184,108,130,' + o.hazeLow + ')'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  return c; }
const farMesa = () => once('fm', () => wallStrip(311, 1024, 80, { rim0: 34, rimMin: 14, rimMax: 52, stepP: 0.012, stepH: 14, jit: 1.2, th0: 4, th1: 5, cols: ['#8a5670', '#9a6280', '#a8708c', '#b27c94'], seam: '#7a4a64', lit: '#c890a0', gullies: 7, haze: 0.18, hazeCol: '#c88aa0', hazeLow: 0.4 }));
const farWall = () => once('fw', () => wallStrip(4411, 1280, 400, { rim0: 40, rimMin: 8, rimMax: 90, stepP: 0.02, stepH: 16, jit: 2.2, th0: 5, th1: 8, cols: ['#5a2c2c', '#74383a', '#8e4a40', '#a85e48', '#c27652'], seam: '#4a2024', lit: '#e8a070', gullies: 26, haze: 0.2, hazeCol: '#b66c80', hazeLow: 0.5 }));
const spurs = () => once('sp', () => wallStrip(9091, 1100, 300, { rim0: 20, rimMin: 4, rimMax: 140, stepP: 0.03, stepH: 22, jit: 3, th0: 6, th1: 8, cols: ['#2a1214', '#3a1a1a', '#4e2622', '#643228'], seam: '#1c0a0c', lit: '#a65a40', gullies: 18, haze: 0.05, hazeCol: '#702c3a', hazeLow: 0.2 }));
const plainStrip = () => once('pl', () => { const [c, g] = canvas(1024, 70), r = mulberry(77); rc(g, 0, 0, 1024, 70, '#a46a82'); const gr = g.createLinearGradient(0, 0, 0, 70); gr.addColorStop(0, 'rgba(206,140,150,0.8)'); gr.addColorStop(1, 'rgba(120,70,100,0.3)'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 70);
  for (let i = 0; i < 90; i++) rc(g, (r() * 1024) | 0, 2 + ((r() * 60) | 0), 6 + ((r() * 30) | 0), 1, r() < 0.5 ? '#b47c92' : '#8a5670'); return c; });
/* the river: a bright ribbon, meandering, in the far plain */
const ribbon = () => once('rib', () => { const [c, g] = canvas(1024, 14); for (let x = 0; x < 1024; x++) { const y = 6 + Math.sin(x / 61) * 3 + Math.sin(x / 23) * 1.2; rc(g, x, y - 1, 1, 3, 'rgba(248,196,168,0.9)'); rc(g, x, y, 1, 1, '#fff2dc'); } return c; });
function bird(g, x, y, sz, flap, col) { g.fillStyle = col; const w = 2 * sz, up = flap ? -sz : 0; rc(g, x - w, y + up, w, 1, col); rc(g, x, y + up, w, 1, col); rc(g, x - 1, y, 3, 1 + (sz > 1 ? 1 : 0), col); rc(g, x - w - 1, y + up + 1, 1, 1, col); rc(g, x + w, y + up + 1, 1, 1, col); }

export function drawBackdrops(g, cx, cy, VW, VH, time, full) {
  const sx0 = Math.max(0, R(WORLD.x0 - cx)), sx1 = Math.min(VW, R(WORLD.x1 - cx)), sy0 = Math.max(0, R(WORLD.y0 - cy)), sy1 = Math.min(VH, R(WORLD.y1 - cy));
  if (sx1 <= sx0 || sy1 <= sy0) return;
  g.save(); g.beginPath(); g.rect(sx0, sy0, sx1 - sx0, sy1 - sy0); g.clip();
  const dy = CAM0 - cy;   /* how far up the climb you are (px; 0 at the Rapids) */
  g.drawImage(skyStrip(), 0, 0, 1, 128, 0, 0, VW, VH);
  /* the low sun's glow, behind the far wall: it is why every ledge's lip is warm */
  { const gl = g.createRadialGradient(VW * 0.2, 60 + dy * 0.12, 4, VW * 0.2, 60 + dy * 0.12, 150); gl.addColorStop(0, 'rgba(255,214,140,0.5)'); gl.addColorStop(1, 'rgba(255,170,100,0)'); g.fillStyle = gl; g.fillRect(0, 0, VW, VH); }
  /* the valley: a far plain and the river, shrinking to a ribbon (it sinks slowest; the higher you are the more of it you see) */
  { const base = 142 + dy * 0.04, p = plainStrip(), off = R(cx * 0.03) % 1024; for (let x = -off; x < VW; x += 1024) g.drawImage(p, x, R(base));
    g.fillStyle = '#a46a82'; g.fillRect(0, R(base) + 69, VW, VH); const rb = ribbon(), th = clamp(1 - dy / 1300, 0.25, 1);
    for (let x = -off; x < VW; x += 1024) g.drawImage(rb, 0, 0, 1024, 14, x, R(base + 14 + dy * 0.01), 1024, Math.max(2, R(14 * th))); }
  if (full !== false) { const m = farMesa(), off = R(cx * 0.09) % 1024, y = R(70 + dy * 0.1); for (let x = -off; x < VW; x += 1024) g.drawImage(m, x, y); g.fillStyle = '#9a6280'; g.fillRect(0, y + 79, VW, VH); }
  /* the opposite wall of the canyon: it falls away behind you as you climb, till you are over its rim */
  { const w = farWall(), off = R(cx * 0.22) % 1280, y = R(14 + dy * 0.3); for (let x = -off; x < VW; x += 1280) g.drawImage(w, x, y); g.fillStyle = '#7a3c3a'; g.fillRect(0, y + 399, VW, VH); }
  /* birds: raptors wheeling on the wind - level with you low down, then BELOW you as you climb (a slower parallax the higher they are) */
  for (const f of FLOCK) { const px = (f.x + Math.cos(time * f.w + f.p) * f.r - cx - VW / 2) * f.par + VW / 2, py = (f.y + Math.sin(time * f.w * 1.3 + f.p) * f.r * 0.25 - cy - VH / 2) * f.par + VH / 2; if (px < -10 || px > VW + 10 || py < -10 || py > VH + 10) continue;
    bird(g, R(px), R(py), f.sz, Math.sin(time * 7 + f.p * 3) > 0.35, f.col); }
  /* the near spurs: dark buttresses at the edges that sink fastest */
  { const s = spurs(), off = R(cx * 0.5) % 1100, y = R(70 + dy * 0.55); if (y < VH) { for (let x = -off; x < VW; x += 1100) g.drawImage(s, x, y); g.fillStyle = '#3a1a1c'; g.fillRect(0, y + 299, VW, VH); } }
  /* SUN SHAFTS down the canyon: slanted bands of low light, drifting with the wind (the Rapids' and the Climb's own light) */
  g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) { const x = ((k * 97 + 30 - cx * 0.35 + time * 3) % (VW + 160)) - 60, w = 22 + (k % 2) * 14, a = 0.05 + 0.025 * Math.sin(time * 0.6 + k * 1.9); g.fillStyle = 'rgba(255,196,120,' + a.toFixed(3) + ')'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w + 90, VH); g.lineTo(x + 90, VH); g.closePath(); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  g.restore();
}
/* the flocks: world px (x, y), a wheel radius, speed, phase, size, a parallax (smaller = farther = sinks slower) and a tone */
const FLOCK = (() => { const r = mulberry(5150), out = []; for (let i = 0; i < 16; i++) out.push({ x: 48 * TS + r() * 80 * TS, y: 2500 + r() * 900, r: 24 + r() * 90, w: 0.25 + r() * 0.35, p: r() * 6.28, sz: 1 + ((r() * 2) | 0), par: 0.18 + r() * 0.3, col: i % 3 === 0 ? '#2a1214' : '#4a2428' }); return out; })();

/* ================================ THE RAPIDS' WATER ================================ */
/* st = { fury: 0..1 } : calm (a glassy dusk river, slow ripples, a few glints), build-up (the spray rises, the surface wrinkles), the horn's WHITE WATER (caps, bow waves, spray, wakes) */
export function drawRapidsWater(g, p, x0, x1, y, h, cx, cy, time, surfaceOnly, st) {
  const f = st ? st.fury : 0, W = x1 - x0; if (W <= 0) return;
  if (!surfaceOnly) {
    const gr = g.createLinearGradient(0, y, 0, y + Math.max(24, h)); gr.addColorStop(0, f > 0.4 ? '#a8908e' : '#c88a86'); gr.addColorStop(0.12, f > 0.4 ? '#6a7a92' : '#5f78a0'); gr.addColorStop(0.5, '#2c4468'); gr.addColorStop(1, '#16243c'); g.fillStyle = gr; g.fillRect(x0, y, W, h);
    /* the dusk in the water: pale streaks that slide west with the current (faster in the rapids), and a darker turbid wash as it rises */
    const sp = 12 + 50 * f; g.fillStyle = 'rgba(255,214,176,0.2)'; for (let k = 0; k < 16; k++) { const wx = p.x0 + ((k * 53 + 17 - time * sp * (0.6 + (k % 3) * 0.25)) % (p.x1 - p.x0 + 40) + (p.x1 - p.x0 + 40)) % (p.x1 - p.x0 + 40) - 20, sx = R(wx - cx); if (sx > x0 && sx < x1 - 5) g.fillRect(sx, y + 3 + (k * 7) % Math.max(8, h - 6), 6 + (k % 4) * 3, 1); }
    if (f > 0.05) { g.fillStyle = 'rgba(128,98,84,' + (0.42 * f).toFixed(2) + ')'; g.fillRect(x0, y, W, h); }
    return; }
  /* the surface */
  g.fillStyle = f > 0.4 ? '#f0d2b8' : '#ffd8b0'; g.fillRect(x0, y, W, 1); g.fillStyle = f > 0.4 ? '#c0a8a0' : '#e8a890'; g.fillRect(x0, y + 1, W, 1);
  const wob = k => Math.sin(time * (2 + f * 6) + k * 1.3);
  for (let k = 0, wd = p.x1 - p.x0; k < wd / 9; k++) { const wx = p.x0 + 4 + ((k * 9 + 5 - time * (10 + 60 * f)) % wd + wd) % wd, sx = R(wx - cx), ph = wob(k + wx * 0.05); if (sx > x0 + 1 && sx < x1 - 5 && ph > (f > 0.3 ? -0.2 : 0.35)) { g.fillStyle = f > 0.3 ? '#ffffff' : '#fff0dc'; g.fillRect(sx, y - 1 - (ph > 0.8 && f > 0.3 ? 1 : 0), 3 + (f > 0.3 ? 2 : 0), 1); } }
  /* build-up: a wrinkle and a mist along the surface before the horn */
  if (f > 0.04) { g.fillStyle = 'rgba(255,240,224,' + clamp(f * 0.55, 0, 0.5).toFixed(2) + ')'; for (let k = 0; k < 7 * f + 2; k++) { const wx = p.x0 + (((k * 71 + 11 - time * 38) % (p.x1 - p.x0)) + (p.x1 - p.x0)) % (p.x1 - p.x0), sx = R(wx - cx); if (sx > x0 && sx < x1 - 4) g.fillRect(sx, y - 3 - ((time * 20 + k * 5) % 6), 2, 1); } }
  /* THE STONES' FOAM: a bow wave piled on the upstream (east) face and a wake trailing west off the downstream face; the horn lengthens and whitens both */
  for (const side of [0, 1]) { const ex = side ? x1 : x0; if (ex < -30 || ex > 360) continue; const dir = side ? -1 : 1;   /* x1 edge = the stone's west face (the wake), x0 edge = its east face (the bow) */
    const len = side ? 6 + R(22 * f) : 3 + R(4 * f); for (let k = 0; k < len; k++) { const wv = Math.sin(time * 5 + k * 0.9 + side * 2); rc(g, ex + dir * (side ? -k - 1 : k) - (side ? 0 : 0), y - 1 + (wv > 0.3 ? -1 : 0) + (k & 1 ? 1 : 0), 2, 1 + (k < 3 ? 1 : 0), k < len * 0.7 ? '#ffffff' : 'rgba(255,255,255,0.7)'); }
    if (f > 0.15) for (let k = 0; k < 3 + 6 * f; k++) { const t = (time * 1.4 + k * 0.37 + side * 0.2) % 1; rc(g, ex + dir * (k % 3) * 2 - (side ? 2 : 0), y - 2 - t * (6 + 12 * f), 1, 1, 'rgba(255,255,255,' + (1 - t).toFixed(2) + ')'); } }
  /* WHITE WATER over the whole reach in the horn: rolling caps and spray */
  if (f > 0.3) for (let k = 0; k < W / 5; k++) { const wx = x0 + ((k * 5 + (time * 80)) % W), t = (time * 2.1 + k * 0.53) % 1, hh = R(2 + 7 * f * Math.abs(Math.sin(k * 1.7 + time * 3))); rc(g, wx, y - hh, 3, hh, '#f4fbff'); if (k % 3 === 0) rc(g, wx + 1, y - hh - 2 - t * 8 * f, 1, 1, 'rgba(255,255,255,' + (1 - t).toFixed(2) + ')'); }
}

/* ================================ THE TIMBERS: wreckage, not boxes ================================ */
const WOOD = { w0: '#1e1208', w1: '#3a2614', w2: '#5e4022', w3: '#86602e', w4: '#b08848', pale: '#c8b890', paleD: '#8a7a58', rope: '#c8a868', ropeD: '#7a5c34', iron: '#3a3a44', wax: '#a8301e', thorn: '#7a6a52', thornD: '#4a3c2c', thornL: '#a89878' };
export function drawTimber(g, m, cx, cy, time, wave) {
  const x = R(m.x - cx), y = R(m.y - cy), w = m.w, fast = !!m.fast; if (x < -60 || x > 400) return;
  const what = m.what || 'plank', r = mulberry(hash(R(m.x0 || 0), what.length));
  if (what === 'plank') {   /* BROKEN BRIDGE BOARDS: five boards of different lengths on two cross-beams, one split, a snapped rail stub, rope lashings, nail heads */
    rc(g, x, y + 3, w, 3, WOOD.w1); rc(g, x + 6, y + 3, 4, 4, WOOD.w0); rc(g, x + w - 12, y + 3, 4, 4, WOOD.w0);
    const cuts = [0, 3, 1, 4, 2]; for (let i = 0; i < 5; i++) { const bx = x + cuts[i] * 2, bw = w - cuts[i] * 2 - (i % 2) * 4, by = y + (i % 2); rc(g, bx, by, bw, 4, i % 2 ? WOOD.w3 : WOOD.w2); rc(g, bx, by, bw, 1, i % 2 ? WOOD.w4 : WOOD.w3); rc(g, bx, by + 3, bw, 1, WOOD.w1);
      for (let k = 4; k < bw - 3; k += 9 + i) rc(g, bx + k, by + 1, 1, 2, WOOD.w1); }
    rc(g, x + w - 3, y - 4, 3, 5, WOOD.w2); rc(g, x + w - 3, y - 5, 1, 1, WOOD.w3); rc(g, x + w - 2, y - 6, 2, 1, WOOD.w3);   /* a snapped rail post */
    for (const lx of [x + 14, x + 30]) { rc(g, lx, y - 1, 3, 7, WOOD.rope); rc(g, lx, y - 1, 1, 7, '#ecd49c'); rc(g, lx + 2, y - 1, 1, 7, WOOD.ropeD); }
    rc(g, x - 2, y + 1, 3, 1, WOOD.w3); rc(g, x - 4, y + 2, 3, 1, WOOD.w2);   /* splintered ends */
  } else if (what === 'crate') {   /* A SEALED TRADE CRATE on boards: a rope strap, iron corners, a red wax seal and a stencilled mark */
    rc(g, x, y + 2, w, 4, WOOD.w2); rc(g, x, y + 2, w, 1, WOOD.w3); for (let k = 3; k < w; k += 8) rc(g, x + k, y + 3, 1, 3, WOOD.w1); rc(g, x + 4, y + 6, w - 8, 1, WOOD.w0);
    const bx = x + 9, by = y - 11; rc(g, bx, by, 26, 13, WOOD.w3); rc(g, bx, by, 26, 1, WOOD.w4); rc(g, bx, by + 12, 26, 1, WOOD.w1); for (const o of [0, 25]) rc(g, bx + o, by, 1, 13, WOOD.w1);
    for (let k = 4; k < 26; k += 7) rc(g, bx + k, by + 1, 1, 11, WOOD.w2);   /* the slats */
    for (const [ix, iy] of [[0, 0], [22, 0], [0, 9], [22, 9]]) { rc(g, bx + ix, by + iy, 4, 4, WOOD.iron); rc(g, bx + ix + 1, by + iy + 1, 1, 1, '#9a9aa8'); }
    rc(g, bx + 11, by, 3, 13, WOOD.rope); rc(g, bx + 11, by, 1, 13, '#ecd49c'); rc(g, bx + 4, by + 5, 18, 2, WOOD.rope); rc(g, bx + 10, by + 4, 5, 5, WOOD.wax); rc(g, bx + 11, by + 5, 2, 2, '#d8503a'); rc(g, bx + 17, by + 9, 6, 1, '#2a1a0c');   /* the strap, the seal, the mark */
    rc(g, bx + 22, by - 3, 3, 3, WOOD.w2);   /* a broken slat standing up */
  } else {   /* A LASHED THORNWOOD BUNDLE: dry brittle sticks bound tight, thorns, a dead tuft - a raft of desert scrub swept down from the headwaters */
    rc(g, x + 1, y + 2, w - 2, 4, WOOD.thornD); for (let i = 0; i < 7; i++) { const bx = x + ((i * 7) % (w - 8)), by = y + (i % 3 === 0 ? 0 : 1), bw = 12 + (i % 3) * 6; rc(g, bx, by, Math.min(bw, x + w - bx), 2, i % 2 ? WOOD.thorn : WOOD.thornL); rc(g, bx, by + 2, Math.min(bw, x + w - bx), 1, WOOD.thornD); }
    for (let i = 0; i < 9; i++) { const tx = x + 3 + ((i * 5 + 2) % (w - 6)); rc(g, tx, y - 1 - (i % 2), 1, 2 + (i % 2), WOOD.thornL); rc(g, tx + 1, y - 2 - (i % 3 === 0 ? 1 : 0), 1, 1, WOOD.thorn); }
    for (const lx of [x + 12, x + 26, x + 38]) { rc(g, lx, y - 1, 2, 7, WOOD.rope); rc(g, lx, y - 1, 1, 7, '#ecd49c'); }
  }
  /* the waterline: a dark wet band, the bow wave to the west (the current runs west), a wake behind */
  rc(g, x + 1, y + 6, w - 2, 2, 'rgba(18,30,48,0.7)'); const q = fast ? 1 : 0.5;
  for (let k = 0; k < (fast ? 7 : 3); k++) rc(g, x - 2 - k + (R(time * 12 + k) & 1), y + 5 + (k & 1), 2, 1, 'rgba(255,255,255,' + (0.9 - k * 0.1).toFixed(2) + ')');
  for (let k = 0; k < (fast ? 10 : 4); k++) rc(g, x + w + k * 2, y + 6 + (k & 1), 2, 1, 'rgba(255,255,255,' + ((0.8 - k * 0.07) * q).toFixed(2) + ')');
  if (fast) for (let k = 0; k < 4; k++) { const t = (time * 2.2 + k * 0.31) % 1; rc(g, x + 4 + k * 12, y - 2 - t * 9, 1, 1, 'rgba(255,255,255,' + (1 - t).toFixed(2) + ')'); }
  void r; void wave;
}

/* ================================ WHAT HOLDS THE LEDGES UP, AND WHAT STANDS ON THE GROUND ================================ */
/* every free-ended ONEWAY run in the Climb gets a rock SPUR under its free ends, down to the rock (or the ledge) below it. A run's end is KEYED when a solid tile touches it
   (the wall) or sits under it; the others are held: { y (row), end (col), x (px, the spur's centre), y1 (row it lands on), lands ('solid' | 'ledge' | 'none') } */
export function planFins(L, T) {
  const W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : L.grid[y * W + x]), out = [];
  for (let y = 148; y <= 218; y++) { let x = 45; while (x <= 80) { if (at(x, y) !== T.ONEWAY) { x++; continue; } let a = x; while (at(x + 1, y) === T.ONEWAY) x++; const b = x; x++;
      if (a < 48 && y <= 166) continue;   /* the gorge's wall */
      const ends = [[a, a - 1, 1], [b, b + 1, -1]];
      for (const [e, nb, inward] of ends) { if (at(nb, y) === T.SOLID || at(e, y + 1) === T.SOLID) { out.push({ y, end: e, how: 'rock', run: [a, b] }); continue; }
        let col = e + inward, y1 = -1, lands = 'none'; for (let yy = y + 1; yy <= Math.min(H - 1, y + 70); yy++) { const t = at(col, yy); if (t === T.SOLID) { y1 = yy; lands = 'solid'; break; } if (t === T.ONEWAY) { y1 = yy; lands = 'ledge'; break; } }
        out.push({ y, end: e, how: 'spur', x: col * TS + 8, y1, lands, run: [a, b] }); }
      if (b - a + 1 > 11) { const mid = (a + b) >> 1; let y1 = -1, lands = 'none'; for (let yy = y + 1; yy <= Math.min(H - 1, y + 70); yy++) { const t = at(mid, yy); if (t === T.SOLID) { y1 = yy; lands = 'solid'; break; } if (t === T.ONEWAY) { y1 = yy; lands = 'ledge'; break; } } out.push({ y, end: mid, how: 'spur', x: mid * TS + 8, y1, lands, run: [a, b] }); } } }
  return out;
}
/* the props that stand on a top, and those that hang from a ledge: { k, x (px), y (px) } - floor kinds stand ON the tile row `ty` (SOLID or ONEWAY with AIR above); 'scrub' hangs UNDER a ledge */
export function planDress(L, T) {
  const W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : L.grid[y * W + x]), out = [], r = mulberry(6606);
  const top = (x, y) => (at(x, y) === T.SOLID || at(x, y) === T.ONEWAY) && at(x, y - 1) === T.AIR;
  /* the Rapids: pennants on the banks and on three stones, a cart wheel and bones on the east bank, boulders by the waterline */
  const stones = [[125, 127], [120, 122], [110, 112], [105, 107], [89, 91]];
  for (const [a, b] of stones) { const c = a === 125 ? 127 : a === 89 ? 91 : (a + b) >> 1; if (top(c, 219) && [125, 110, 89].includes(a)) out.push({ k: 'pennant', x: c * TS + 8, y: 219 * TS, tx: c, ty: 219 }); }   /* (a flag on a stone stands beside its sign / its sentry, never under him) */
  out.push({ k: 'pennant', x: 133 * TS + 8, y: 219 * TS, tx: 133, ty: 219 }, { k: 'pennant', x: 70 * TS + 8, y: 219 * TS, tx: 70, ty: 219 });
  for (const [k, tx] of [['wheel', 138], ['bones', 134], ['cairn', 131], ['bones', 74], ['cairn', 77], ['reeds', 68], ['reeds', 139]]) if (top(tx, 219)) out.push({ k, x: tx * TS + 8, y: 219 * TS, tx, ty: 219 });
  /* the Climb: a cairn and bones on a few ledges, scrub hanging from the undersides, a coil of rope */
  for (let y = 150; y <= 217; y++) for (let x = 48; x <= 78; x++) { if (at(x, y) !== T.ONEWAY || at(x, y - 1) !== T.AIR) continue; const h = hash(x, y) % 9;
    if (h === 0 && at(x - 1, y) === T.ONEWAY && at(x + 1, y) === T.ONEWAY) out.push({ k: 'cairn', x: x * TS + 8, y: y * TS, tx: x, ty: y });
    else if (h === 1 && at(x + 1, y) === T.ONEWAY) out.push({ k: 'bones', x: x * TS + 8, y: y * TS, tx: x, ty: y });
    else if (h === 2 && at(x - 1, y) === T.ONEWAY && at(x + 1, y) === T.ONEWAY) out.push({ k: 'coil', x: x * TS + 8, y: y * TS, tx: x, ty: y });
    if (at(x, y + 1) === T.AIR && hash(x * 3, y) % 6 === 0) out.push({ k: 'scrub', x: x * TS + 8, y: (y + 1) * TS - 3, tx: x, ty: y });
  }
  void r; return out;
}
const rockSpur = (h) => once('spur' + h, () => { const hh = Math.max(8, Math.min(h, 260)), [c, g] = canvas(30, hh), r = mulberry(h * 3 + 1);
  /* a weathered sandstone fin: ragged edges, uneven strata that thicken and thin, a wet-dark foot, lit on its east edge */
  let by = 0, tone = 2; const bands = []; while (by < hh + 8) { const th = 3 + ((r() * 9) | 0); tone = clamp(tone + (r() < 0.5 ? -1 : 1) * (1 + ((r() * 2) | 0)), 0, 4); bands.push([by, by + th, tone]); by += th; }
  for (let y = 0; y < hh; y++) { const j = hash(y, h), half = 12 - Math.min(5, y >> 3) + (j % 4 === 0 ? 2 : j % 4 === 1 ? 1 : 0) - (j % 7 === 0 ? 1 : 0) + (y > hh - 14 ? (y - (hh - 14)) >> 1 : 0), x0 = 15 - half, x1 = 15 + half + (hash(y, h + 5) % 3 === 0 ? 1 : 0);
    const bd = bands.find(q => y >= q[0] && y < q[1]) || bands[0], seam = y === bd[0]; rc(g, x0, y, x1 - x0, 1, seam ? S.s0 : dim([S.s1, S.s2, S.s3, S.s4, S.s5][bd[2]], 0.84));
    if (!seam && (hash(y * 3, h) % 5 === 0)) rc(g, x0 + 2 + (j % 9), y, 3 + (j % 4), 1, S.s1);
    rc(g, x1 - 3, y, 3, 1, S.s0); rc(g, x0, y, 2, 1, seam ? S.s2 : S.s5); }
  for (let i = 0; i < Math.max(3, hh >> 4); i++) { let cx2 = 9 + ((r() * 12) | 0), cy2 = (r() * hh) | 0; for (let k = 0, n = 5 + ((r() * 14) | 0); k < n; k++) { rc(g, cx2, cy2 + k, 1, 1, S.dk); if (r() < 0.4) cx2 += r() < 0.5 ? -1 : 1; } }
  return c; });
const pennant = (g, x, y, fury, time) => { rc(g, x, y - 26, 2, 26, WOOD.w2); rc(g, x, y - 26, 1, 26, WOOD.w3); rc(g, x - 1, y - 28, 4, 2, WOOD.iron);
  const len = 16, amp = 1 + 3.5 * fury, sp = 4 + 14 * fury; for (let i = 0; i < len; i++) { const hh = Math.max(1, 6 - (i * 6) / len), yy = y - 24 + Math.sin(time * sp - i * 0.55) * amp * (i / len) * 1.2; rc(g, x + 2 + i, yy, 1, hh, i % 6 < 3 ? '#b8502c' : '#f0dcb8'); }
  rc(g, x - 1, y - 2, 4, 2, S.s2); };
const feather = (g, x, y, v) => { const d = v % 2 ? -1 : 1; for (let i = 0; i < 14; i++) { const fx = x + d * (i >> 1), fy = y - i; rc(g, fx, fy, 1, 1, '#f0dcb8'); if (i > 3 && i < 12) { rc(g, fx + d, fy, 2, 1, i % 3 ? '#c8643a' : '#7a2e1c'); rc(g, fx - d * 2, fy + 1, 1, 1, '#e8c8a0'); } } rc(g, x - 1, y, 3, 1, '#d8c098'); rc(g, x + d * 4, y - 15, 2, 1, '#7a2e1c'); };
export function drawPlume(g, x, y, v) { feather(g, x, y, v); }
function dressItem(g, d, x, y, fury, time) {
  const k = d.k;
  if (k === 'pennant') pennant(g, x, y, fury, time);
  else if (k === 'cairn') { for (const [dx, w, dy] of [[-4, 9, 0], [-3, 7, 3], [-2, 5, 6], [-1, 3, 8]]) { rc(g, x + dx, y - 3 - dy, w, 3, S.s3); rc(g, x + dx, y - 3 - dy, w, 1, S.s5); rc(g, x + dx + w - 1, y - 3 - dy, 1, 3, S.s1); } }
  else if (k === 'bones') { rc(g, x - 6, y - 2, 10, 2, '#e8dcc0'); rc(g, x - 7, y - 3, 2, 2, '#e8dcc0'); rc(g, x - 3, y - 6, 1, 4, '#cdbfa0'); rc(g, x - 1, y - 7, 1, 5, '#e8dcc0'); rc(g, x + 1, y - 6, 1, 4, '#cdbfa0'); rc(g, x + 3, y - 5, 1, 3, '#a89878'); }
  else if (k === 'coil') { for (let i = 0; i < 3; i++) { rc(g, x - 5 + i, y - 3 - i, 10 - i * 2, 1, i % 2 ? WOOD.rope : WOOD.ropeD); } rc(g, x - 5, y - 3, 10, 3, WOOD.rope); rc(g, x - 5, y - 3, 10, 1, '#ecd49c'); rc(g, x - 4, y - 2, 8, 1, WOOD.ropeD); rc(g, x + 4, y - 1, 5, 1, WOOD.rope); }
  else if (k === 'wheel') { for (let a = 0; a < 28; a++) { const t = a / 28 * 6.283; rc(g, x + Math.cos(t) * 9, y - 9 + Math.sin(t) * 9, 2, 2, WOOD.w2); } for (let s = 0; s < 4; s++) { const t = s * 0.785; rc(g, x + Math.cos(t) * 5, y - 9 + Math.sin(t) * 5, 1, 1, WOOD.w3); rc(g, x - Math.cos(t) * 5, y - 9 - Math.sin(t) * 5, 1, 1, WOOD.w3); } rc(g, x - 1, y - 10, 3, 3, WOOD.iron); }
  else if (k === 'reeds') { for (let i = 0; i < 6; i++) rc(g, x - 5 + i * 2, y - 8 - (i % 3) * 3, 1, 8 + (i % 3) * 3, i % 2 ? '#8a7a3a' : '#a8964a'); }
  else if (k === 'scrub') { for (let i = 0; i < 7; i++) { const dx = -6 + i * 2, len = 4 + ((i * 5) % 7); rc(g, x + dx, y, 1, len, i % 2 ? '#6a5a38' : '#8a7646'); rc(g, x + dx + (i % 2 ? 1 : -1), y + len - 1, 1, 2, '#a89868'); } }
}
/* the ground's art, in the world (called from src/red-gorge-hands.js drawWorld): fins, dress, plumes, the spill chute's flume, the horn's flash */
export function drawGround(g, L, plans, cx, cy, VW, VH, time, st) {
  const fury = st ? st.fury : 0;
  for (const f of plans.fins) { if (f.how !== 'spur' || f.y1 < 0) continue; const x = R(f.x - cx), y0 = R(f.y * TS + 7 - cy), y1 = R(f.y1 * TS - cy); if (x < -20 || x > VW + 20 || y1 < -4 || y0 > VH + 4) continue; const h = y1 - y0 + 2; if (h < 6) continue; g.drawImage(rockSpur(Math.min(h, 260)), x - 15, y0 - 1, 30, Math.min(h, 260)); if (h > 260) { rc(g, x - 8, y0 + 259, 16, y1 - y0 - 258, S.s1); } }
  for (const d of plans.dress) { const x = R(d.x - cx), y = R(d.y - cy); if (x < -16 || x > VW + 16 || y < -16 || y > VH + 40) continue; dressItem(g, d, x, y, fury, time); }
}
/* the spill chute's stone flume (cols 60-62, rows 150-214): pale scoured stone behind the falling water, a culvert mouth in the roof, a basin at the foot */
export function drawFlume(g, cx, cy, VW, VH, time, st) {
  const x0 = 60 * TS - cx - 4, w = 3 * TS + 8; if (x0 > VW || x0 + w < 0) return; const y0 = 150 * TS - cy, y1 = 215 * TS - cy; if (y1 < 0 || y0 > VH) return;
  const f = st ? st.run : 0, a = Math.max(0, y0), b = Math.min(VH, y1), flare = st ? st.fury : 0;
  /* the chute is a groove worn into the air's edge: only a pale wet shade where the water runs, thin dressed cheeks (stone lips with a course every 22 px) and an iron strap every few rows */
  g.globalAlpha = 0.14; g.fillStyle = '#e8c4a0'; g.fillRect(x0 + 4, a, w - 8, b - a); g.globalAlpha = 1;
  for (const lx of [x0 + 1, x0 + w - 4]) { g.globalAlpha = 0.85; g.fillStyle = S.s2; g.fillRect(lx, a, 3, b - a); g.fillStyle = S.s4; g.fillRect(lx + (lx < x0 + 8 ? 2 : 0), a, 1, b - a); g.fillStyle = S.s0; g.fillRect(lx + (lx < x0 + 8 ? 0 : 2), a, 1, b - a);
    for (let y = Math.floor(a / 22) * 22; y < b; y += 22) { g.fillStyle = S.s1; g.fillRect(lx, y, 3, 1); } g.globalAlpha = 1; }
  for (let y = Math.floor(a / 56) * 56; y < b; y += 56) { g.fillStyle = WOOD.iron; g.fillRect(x0 - 1, y, w + 2, 2); g.fillStyle = '#8a8a98'; g.fillRect(x0 - 1, y, w + 2, 1); }
  /* the CULVERT MOUTH in the roof: an arch with an iron grate, the water gushes from it at the flood */
  if (y0 > -40 && y0 < VH + 10) { const ay = y0 - 22; g.fillStyle = S.s0; g.fillRect(x0 - 3, ay, w + 6, 24); g.fillStyle = S.s3; g.fillRect(x0 - 3, ay + 20, w + 6, 4); g.fillStyle = S.s5; g.fillRect(x0 - 3, ay + 20, w + 6, 1);
    g.fillStyle = '#10080c'; g.beginPath(); g.arc(x0 + w / 2, ay + 22, w / 2 - 3, Math.PI, 0); g.lineTo(x0 + w / 2 + w / 2 - 3, ay + 24); g.lineTo(x0 + 3, ay + 24); g.closePath(); g.fill();
    g.fillStyle = '#3a3a44'; for (let i = 0; i < 5; i++) g.fillRect(x0 + 5 + i * 8, ay + 14, 2, 10); g.fillRect(x0 + 5, ay + 19, w - 10, 2); g.fillStyle = '#7a7a88'; for (let i = 0; i < 5; i++) g.fillRect(x0 + 5 + i * 8, ay + 14, 1, 10);
    if (f > 0) { g.fillStyle = 'rgba(232,244,248,' + (0.5 * Math.min(1, f)).toFixed(2) + ')'; for (let k = 0; k < 6; k++) g.fillRect(x0 + 6 + k * 7 + R(Math.sin(time * 14 + k) * 2), ay + 22 + ((time * 90 + k * 13) % 14), 2, 3); } else if (flare > 0.3) { g.fillStyle = 'rgba(232,244,248,0.5)'; g.fillRect(x0 + w / 2 - 1, ay + 22, 2, 4 + R((time * 8) % 5)); } else { g.fillStyle = 'rgba(180,210,230,0.7)'; g.fillRect(x0 + w / 2 - 1, ay + 22 + ((time * 10) % 4), 1, 2); } }   /* a trickle always; at the horn it thickens */
  /* the BASIN at the foot, where the chute lands */
  { const by = 214 * TS - cy; if (by > -30 && by < VH + 30) { g.fillStyle = S.s1; g.fillRect(x0 - 6, by + 8, w + 12, 10); g.fillStyle = S.s3; g.fillRect(x0 - 6, by + 8, w + 12, 2); g.fillStyle = f > 0 ? '#9ac8e0' : '#4a6a86'; g.fillRect(x0 - 2, by + 11, w + 4, 4); if (f > 0) { g.fillStyle = '#f4fbff'; for (let k = 0; k < 7; k++) g.fillRect(x0 + k * 8 + R(Math.sin(time * 12 + k) * 2), by + 6 - ((time * 40 + k * 9) % 9), 3, 2); } } }
}
/* THE HORN'S FLASH and its spray, over everything in the Rapids and the Climb (st.horn = seconds since the horn; the sun glints on the white water) */
export function drawFlash(g, VW, VH, st) { if (!st || st.horn < 0 || st.horn > 0.5) return; const a = (1 - st.horn / 0.5) * 0.22; g.fillStyle = 'rgba(255,196,128,' + a.toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
