// src/redraw/buried_city_bc4_art.js - THE BURIED CITY 4's ART (claude/bc4art): the drawings of the BC4 pieces that were greybox shapes. Every function takes a view V = { g, cx, cy, vw, vh, time, L } (world
// pixels, like buried_city_flip_art.js) or draws into screen pixels where it says so; the fixed pieces are baked once (memoised), only what moves is live. No geometry, no numbers: these draw what
// src/buried-city-flip.js / src/hourglass-king-hands.js already decided.
//   THE TIMED SAND SLABS   a cut slab of sand in strata with a lit lip, a ragged underside, cracks that open as it runs down, grains falling, and its TIMER: an hourglass-shaped gauge whose sand runs out
//   THE KING'S PILLAR      packed sand over masonry courses, a capital, sand pouring off its shoulders
//   HIS THROWS             the shard (a jagged wedge with a lit edge), the pot (painted clay, turning), the pot's burst (clay and sand), the pot's LANDING MARK (a glyph ring)
//   PHASE THREE            the dark levers (a veil, a sealed plate, DRY) and the great hourglass's READY glow + marker
//   THE GLASS WORKS        kiln stubs (brick, a fire-mouth, a chimney band), racks of blown glasses hung on chains, pipes, cullet; the indoor GLASS PIT (a darker sand, glass shards, no sky dust)
//   THE TILT               the tilting dune's turn (a wedge of sand rotating in), its warn shake
//   THE SKY                clouds over their drifting shadows
//   THE ANTECHAMBER, THE OLD STREET, THE MURALS (B8: the King raising sand platforms, withdrawing, throwing glass) and the frozen half-buried citizens
import { hash as H2 } from './buried_city_flip_art.js';
const R = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const dot = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const vis = (V, x0, x1, m = 60) => x1 > V.cx - m && x0 < V.cx + V.vw + m;
const put = (V, spr, wx, wy) => V.g.drawImage(spr, R(wx - V.cx), R(wy - V.cy));
const TS = 16;
const S = { s0: '#7a5a30', s1: '#a67c44', s2: '#c49a5c', s3: '#d8b474', s4: '#ecd092', s5: '#f8e8b0', dk: '#4a361e' };

/* ============================================================ THE TIMED SAND SLAB (the antechamber's, and the King's) */
/* one slab body: w px wide, 16 tall. stage 0..3 = how cracked (its timer running down) */
function slabBody(w, stage, seed) {
  return once('slab' + w + ':' + stage + ':' + seed, () => { const [c, g] = mk(w, 20);
    for (let y = 0; y < 14; y++) for (let x = 0; x < w; x++) { const band = (y + R(1.4 * Math.sin(x / 7 + seed))) % 5; let k = band === 0 ? 1 : band === 3 ? 3 : 2; if (y < 2) k = 4; if (y > 10) k = 1; if (y > 12) k = 0; if (H2(x + seed, y) % 9 === 0) k = Math.max(0, k - 1); else if (H2(x, y + seed) % 13 === 0) k = Math.min(5, k + 1); dot(g, x, y, [S.s0, S.s1, S.s2, S.s3, S.s4, S.s5][k]); }
    for (let x = 0; x < w; x++) { dot(g, x, 0, S.s5); if (H2(x, seed) % 3) dot(g, x, 1, S.s4); }   /* the lit lip */
    rc(g, 0, 0, 1, 12, S.s4); rc(g, w - 1, 2, 1, 11, S.s0);   /* the cut ends */
    for (let x = 0; x < w; x++) { const h = 14 + (H2(x >> 1, seed + 3) % 4); for (let y = 14; y < h; y++) dot(g, x, y, y === h - 1 ? S.s0 : S.s1); if (H2(x, seed + 9) % 5 === 0) dot(g, x, h, S.s2); }   /* the ragged underside */
    for (let k = 0; k < stage; k++) { let x = 3 + H2(k, seed) % (w - 6), y = 1; const col = '#3a2812'; for (; y < 16; y++) { dot(g, x, y, col); if (y % 3 === 0) x += (H2(x, y) % 3) - 1; if (y > 3 && y % 4 === 0) dot(g, x + 1, y, S.s5); } }   /* cracks, opening with each stage */
    for (const dx of [3, w - 5]) { rc(g, dx, 4, 2, 2, S.s0); dot(g, dx, 4, S.s4); }   /* a carved rivet-stud at each end: it is cut, not drifted */
    return c; });
}
/* l, y: screen px of the slab's top-left; w px; k = timer fraction left (1..0); warn: in its last seconds; i: its index */
export function drawSlab(V, l, y, w, k, warn, i, time) {
  const g = V.g, stage = k > 0.66 ? 0 : k > 0.33 ? 1 : k > 0.12 ? 2 : 3, sh = warn ? Math.sin(time * 60) * 1.2 : 0, x = R(l + sh), yy = R(y + (warn ? Math.sin(time * 47) * 0.6 : 0));
  g.drawImage(slabBody(w, stage, (i * 5) & 7), x, yy);
  /* grains running off it: more as it goes */
  g.fillStyle = 'rgba(232,196,128,0.85)'; const n = 3 + stage * 2; for (let q = 0; q < n; q++) { const gx = x + 3 + ((q * 11 + Math.floor(time * 17)) * 7) % Math.max(4, w - 6), gy = yy + 16 + ((time * 46 + q * 9) % 16); g.fillRect(gx, R(gy), 1, 2); }
  if (stage >= 2) { g.fillStyle = S.s3; g.fillRect(x + 4 + (H2(i, 3) % Math.max(1, w - 12)), yy + 18 + R((time * 30) % 12), 3, 2); }
  /* ITS TIMER: a little brass hourglass over it, the sand in the top running down; beside it a bar the same read (gold, red in the last seconds) */
  const cx0 = x + R(w / 2), ty = yy - 14; rc(g, cx0 - 6, ty, 12, 2, '#8a6420'); rc(g, cx0 - 6, ty, 12, 1, '#e8bc68'); rc(g, cx0 - 6, ty + 11, 12, 2, '#8a6420'); rc(g, cx0 - 6, ty + 12, 12, 1, '#5a3a14');
  const col = warn ? '#ff5a3a' : '#ffd36b', up = R(4 * k + (k > 0 ? 0.4 : 0)), lo = 4 - up; rc(g, cx0 - 4, ty + 2, 8, 9, 'rgba(10,8,20,0.65)');
  for (let r = 0; r < 4; r++) { const hw = 3 - (r >> 1); if (r >= 4 - up) rc(g, cx0 - hw, ty + 2 + r, hw * 2 + 1, 1, col); }
  for (let r = 0; r < 4; r++) { const hw = 1 + (r >> 1); if (r >= 4 - lo) rc(g, cx0 - hw, ty + 6 + r + 1, hw * 2 + 1, 1, warn ? '#ff9a7a' : '#f8dc90'); }
  if (k > 0.02) { dot(g, cx0, ty + 6, '#fff4cc'); dot(g, cx0, ty + 7 + (R(time * 12) % 2), '#fff4cc'); }
  rc(g, cx0 - 5, ty + 2, 1, 9, 'rgba(255,255,255,0.35)');
  const bw = Math.max(4, w - 4); rc(g, x + 2, ty + 14, bw, 3, 'rgba(10,8,20,0.7)'); rc(g, x + 3, ty + 15, R((bw - 2) * Math.max(0, k)), 1, col);
  if (warn) { g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 30); rc(g, x, yy, w, 3, '#ff5a3a'); g.globalAlpha = 1; }
}

/* ============================================================ THE KING'S PILLAR (his sand pillar: packed sand over carved courses) */
export function drawPillar(V, l, top, bot, w, time) {
  const g = V.g, h = bot - top; if (h < 2) return; const spr = once('pillar' + w, () => { const [c, s] = mk(w, 220);
    for (let y = 0; y < 220; y++) for (let x = 0; x < w; x++) { let k = 2 + (((y >> 2) + R(1.2 * Math.sin(x / 6))) % 4 === 0 ? -1 : 0) + (x < 3 ? 1 : 0) - (x > w - 5 ? 1 : 0); if (y < 4) k = 4; if (H2(x, y) % 10 === 0) k--; k = Math.max(0, Math.min(4, k)); dot(s, x, y, [S.s0, S.s1, S.s2, S.s3, S.s4][k]); }
    for (let y = 12; y < 220; y += 14) { rc(s, 0, y, w, 1, '#5a4224'); for (let x = 0; x < w; x += 12) rc(s, x + ((y / 14 | 0) % 2) * 6, y + 1, 1, 13, '#6a4e2c'); }   /* the carved courses under the drift */
    rc(s, -1, 0, w + 2, 5, S.s3); rc(s, 0, 0, w, 2, S.s5); rc(s, 0, 4, w, 1, '#5a4224'); rc(s, 3, 5, 3, 3, S.s0); rc(s, w - 6, 5, 3, 3, S.s0);   /* the capital, a lit lip */
    for (let x = 4; x < w - 4; x += 5) { rc(s, x, 5, 1, 10 + H2(x, 2) % 14, S.s4); }   /* the drift sliding down its face */
    rc(s, 0, 0, 1, 220, S.s4); rc(s, w - 2, 0, 2, 220, '#3a2812'); return c; });
  g.save(); g.beginPath(); g.rect(l, top, w + 2, h); g.clip(); g.drawImage(spr, 0, 0, w, 220, l, top, w, 220); g.restore();   /* (the pillar's body shows from its top down) */
  g.fillStyle = 'rgba(240,216,160,0.7)'; for (let i = 0; i < 9; i++) { const x = l + 1 + (i * 7) % Math.max(2, w - 2), y = top + ((time * 54 + i * 13) % Math.max(4, h)); g.fillRect(R(x), R(y), 1, 3); }
  g.fillStyle = 'rgba(248,232,176,0.8)'; for (const s of [0, w - 1]) for (let i = 0; i < 4; i++) g.fillRect(R(l + s + (s ? 2 : -2) + Math.sin(time * 3 + i)), R(top + 4 + i * 6 + ((time * 70) % 10)), 1, 2);   /* off its shoulders */
}

/* ============================================================ HIS THROWS */
export function drawShard(g, sx, sy, a, time) {
  const ca = Math.cos(a), sa = Math.sin(a), L = 9; g.fillStyle = 'rgba(223,242,255,0.28)'; g.beginPath(); g.moveTo(sx - ca * 14, sy - sa * 14); g.lineTo(sx - ca * 3 - sa * 2, sy - sa * 3 + ca * 2); g.lineTo(sx - ca * 3 + sa * 2, sy - sa * 3 - ca * 2); g.closePath(); g.fill();   /* its wake */
  g.fillStyle = '#9fd6ee'; g.beginPath(); g.moveTo(sx + ca * 5, sy + sa * 5); g.lineTo(sx - ca * 4 - sa * 2.4, sy - sa * 4 + ca * 2.4); g.lineTo(sx - ca * 2 + sa * 2, sy - sa * 2 - ca * 2); g.closePath(); g.fill();
  g.strokeStyle = '#f2fbff'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx + ca * 5, sy + sa * 5); g.lineTo(sx - ca * 4 - sa * 2.4, sy - sa * 4 + ca * 2.4); g.stroke();
  if (Math.floor(time * 20 + sx) % 4 === 0) { g.fillStyle = '#fff'; g.fillRect(R(sx + ca * 5) - 1, R(sy + sa * 5) - 1, 2, 2); }
}
const potSpr = () => once('pot', () => { const [c, g] = mk(16, 18);
  for (let y = 0; y < 18; y++) { const hw = y < 3 ? 3 : y < 6 ? 3 + (y - 3) * 1.4 : y < 13 ? 7 : 7 - (y - 12) * 1.2; for (let x = -R(hw); x <= R(hw); x++) { const d = x / Math.max(1, hw), k = d < -0.5 ? '#c4723a' : d < 0.1 ? '#a8602e' : d < 0.6 ? '#8a4a2a' : '#5e2e18'; dot(g, 8 + x, y, k); } }
  rc(g, 4, 0, 8, 2, '#d0703a'); rc(g, 4, 0, 8, 1, '#f0a060'); rc(g, 1, 8, 14, 2, '#d8aa40'); rc(g, 1, 8, 14, 1, '#f6dc80'); for (let x = 3; x < 13; x += 3) { dot(g, x, 11, '#3a1a0c'); dot(g, x + 1, 12, '#3a1a0c'); }
  dot(g, 5, 4, '#f0a060'); dot(g, 4, 6, '#f0a060'); rc(g, 6, 15, 4, 2, '#4a2410'); rc(g, 3, 1, 10, 1, '#1a0c08'); dot(g, 8, 0, '#e2bb7a'); return c; });   /* a painted clay pot: a gilded band, a rim with sand heaped in it */
export function drawPot(g, sx, sy, time) { const a = time * 9 + sx * 0.05; g.save(); g.translate(R(sx), R(sy)); g.rotate(a); g.drawImage(potSpr(), -8, -9); g.restore(); g.fillStyle = 'rgba(232,196,128,0.8)'; for (let i = 1; i < 5; i++) g.fillRect(R(sx - 3 * i * Math.cos(a * 0.3)), R(sy + 2 * i), 1, 1); }
/* the burst where it lands: t 0..1 over ~0.6 s - a ring of sand, clay shards flung out, a plume */
export function drawPotBurst(V, x, y, t) {
  const g = V.g, sx = R(x - V.cx), sy = R(y - V.cy), k = Math.min(1, t), r = 6 + k * 34;
  g.globalAlpha = 1 - k; g.strokeStyle = '#f0d8a0'; g.lineWidth = 2; g.beginPath(); g.ellipse(sx, sy - 2, r, r * 0.28, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#d0703a'; g.lineWidth = 1; g.beginPath(); g.ellipse(sx, sy - 2, r * 0.7, r * 0.2, 0, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 12; i++) { const a = -Math.PI * (0.1 + 0.8 * ((i * 5 % 12) / 11)), v = 18 + (i % 4) * 9, px = sx + Math.cos(a) * v * k, py = sy + Math.sin(a) * v * k + 26 * k * k; g.fillStyle = i % 3 === 0 ? '#a8602e' : i % 3 === 1 ? '#e2bb7a' : '#f8dc90'; g.fillRect(R(px), R(py), i % 3 === 0 ? 3 : 2, i % 3 === 0 ? 2 : 2); }
  g.fillStyle = '#e2bb7a'; g.fillRect(sx - 3, R(sy - 22 * k - 4), 6, R(22 * k)); g.globalAlpha = 1; g.lineWidth = 1;
}
/* the pot's LANDING MARK: a glyph ring on the floor, blinking; r = its burst radius (px); urgent = it is about to land */
export function drawPotMark(V, mx, my, r, time, urgent) {
  const g = V.g, x = R(mx - V.cx), y = R(my - V.cy) - 1, pulse = 0.5 + 0.5 * Math.sin(time * (urgent ? 16 : 8)), col = urgent ? '#ff5a3a' : '#ff9a4a';
  g.fillStyle = 'rgba(30,10,10,' + (0.35 + 0.2 * pulse).toFixed(2) + ')'; g.beginPath(); g.ellipse(x, y, r, r * 0.22, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([4, 3]); g.lineDashOffset = -time * 14; g.beginPath(); g.ellipse(x, y, r, r * 0.22, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
  rc(g, x - 5, y - 9 - 0, 11, 2, col); rc(g, x - 5, y - 1 - 0, 11, 2, col); for (let i = 0; i < 4; i++) { rc(g, x - 4 + i, y - 7 + i, 9 - i * 2, 1, col); rc(g, x - 4 + i, y - 3 - i + 1, 9 - i * 2, 1, col); }   /* a glyph: a glass, drawn in the sand */
  g.fillStyle = '#fff0c0'; g.fillRect(x, y - 5, 1, 1);
  g.globalAlpha = 0.5 + 0.4 * pulse; g.fillStyle = col; g.beginPath(); g.moveTo(x - 4, y - 20 - R(pulse * 3)); g.lineTo(x + 4, y - 20 - R(pulse * 3)); g.lineTo(x, y - 13 - R(pulse * 3)); g.closePath(); g.fill(); g.globalAlpha = 1;   /* a marker bobbing over it */
}

/* ============================================================ PHASE THREE: THE DARK LEVERS and THE GREAT HOURGLASS READY */
export function drawDarkLever(V, lx, fy, time, say) {
  const g = V.g; g.fillStyle = 'rgba(6,4,10,0.7)'; g.beginPath(); g.ellipse(lx, fy - 12, 13, 17, 0, 0, Math.PI * 2); g.fill();   /* a veil over the lever */
  rc(g, lx - 6, fy - 22, 12, 6, '#2a2630'); rc(g, lx - 6, fy - 22, 12, 1, '#4a4654'); g.strokeStyle = '#5a4a6a'; g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 5, fy - 21); g.lineTo(lx + 5, fy - 17); g.moveTo(lx + 5, fy - 21); g.lineTo(lx - 5, fy - 17); g.stroke();   /* its plate sealed: crossed through */
  rc(g, lx - 1, fy - 16, 3, 14, '#1e1a24'); rc(g, lx - 3, fy - 8, 7, 3, '#2e2a38');   /* the dead arm, slack */
  for (let i = 0; i < 3; i++) { const t = (time * 0.7 + i * 0.33) % 1; g.fillStyle = 'rgba(160,150,170,' + (0.5 * (1 - t)).toFixed(2) + ')'; g.fillRect(R(lx - 3 + i * 3), R(fy - 24 - t * 12), 1, 1); }   /* a thread of dust: no sand runs here */
}
export function drawGreatReady(V, gx, fy, time, urgent) {
  const g = V.g, p = 0.5 + 0.5 * Math.sin(time * 6), bob = R(Math.abs(Math.sin(time * 4)) * 5), col = urgent ? '#fff6e0' : '#ffd36b';
  const o = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18 + 0.22 * p; g.fillStyle = '#ffd36b'; g.beginPath(); g.ellipse(gx, fy - 30, 26 + p * 4, 38 + p * 4, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = o;
  g.strokeStyle = col; g.lineWidth = 2; g.globalAlpha = 0.5 + 0.4 * p; g.beginPath(); g.ellipse(gx, fy - 30, 24 + p * 3, 36 + p * 3, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; g.lineWidth = 1;
  for (let i = 0; i < 7; i++) { const t = (time * 0.9 + i / 7) % 1, a = i * 0.9 + time; g.fillStyle = 'rgba(255,230,150,' + (1 - t).toFixed(2) + ')'; g.fillRect(R(gx + Math.cos(a) * 20), R(fy - 4 - t * 60), 1, 2); }   /* sparks rising off it */
  /* the marker: a gilded hourglass-shaped pointer bobbing down onto it */
  const my = fy - 70 + bob; g.fillStyle = '#6a4a14'; g.beginPath(); g.moveTo(gx - 8, my - 1); g.lineTo(gx + 8, my - 1); g.lineTo(gx, my + 9); g.closePath(); g.fill(); g.fillStyle = col; g.beginPath(); g.moveTo(gx - 6, my); g.lineTo(gx + 6, my); g.lineTo(gx, my + 7); g.closePath(); g.fill();
  rc(g, gx - 8, my - 4, 16, 2, '#d8aa40'); rc(g, gx - 8, my - 4, 16, 1, '#fff0b0'); dot(g, gx, my + 3, '#fff'); rc(g, gx - 1, my + 10, 3, 2, col);
}

/* ============================================================ THE GLASS WORKS: kilns, racks, pipes, cullet */
const WK = { x0: 337, x1: 408 };
export const inWorks = x => x >= WK.x0 && x <= WK.x1;
function kilnSpr(w, h) {   /* a brick kiln stub: rows of firebrick, a banded chimney, a fire-mouth glowing, soot above it */
  return once('kiln' + w + ':' + h, () => { const [c, g] = mk(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const row = (y / 5) | 0, off = (row & 1) * 6, joint = y % 5 === 4 || (x + off) % 12 === 0; let k = joint ? '#2e1a14' : (H2(x >> 2, row) % 5 === 0 ? '#8a4a34' : '#9e5a3e'); if (x < 2) k = '#b87454'; else if (x > w - 3) k = '#5e3020'; dot(g, x, y, k); }
    rc(g, 0, 0, w, 3, '#c89060'); rc(g, 0, 0, w, 1, '#ecc088'); rc(g, 0, 3, w, 1, '#3a1c10'); for (let x = 3; x < w - 3; x += 7) { rc(g, x, 5, 4, 2, '#5a2e20'); rc(g, x, 5, 4, 1, '#7a4430'); }   /* a cornice, a dentil row */
    const mw = Math.min(14, w - 8), mx = (w - mw) >> 1, my = h - 18; rc(g, mx - 1, my - 1, mw + 2, 18, '#1e1008'); rc(g, mx, my, mw, 17, '#0e0604'); for (let x = 0; x < mw; x++) { const a = Math.max(0, 1 - Math.abs(x - mw / 2) / (mw / 2)); rc(g, mx + x, my + 17 - R(5 + a * 8), 1, R(5 + a * 8), x % 3 ? '#e0501c' : '#ff8a30'); rc(g, mx + x, my + 17 - R(2 + a * 4), 1, R(2 + a * 4), '#ffd060'); }   /* the fire-mouth: an arch of banked coals */
    rc(g, mx - 3, my - 3, mw + 6, 2, '#c89060'); rc(g, mx - 3, my - 3, mw + 6, 1, '#ecc088');
    for (let y = 10; y < h - 22; y += 13) { rc(g, 0, y, w, 2, '#3a3026'); rc(g, 0, y, w, 1, '#6a6050'); for (let x = 3; x < w - 3; x += 9) dot(g, x, y, '#b8ac8c'); }   /* iron bands round the stack */
    for (let k = 0; k < 18; k++) dot(g, H2(k, w) % w, 4 + H2(k, 5) % Math.max(4, h - 30), 'rgba(20,12,8,0.5)');   /* soot */
    return c; });
}
export function drawKilnStub(g, l, r, t, b, x0) {   /* (a deep isle in the glass works: BCH.drawStructure) l, r, t, b screen px; x0 its first column */
  const w = R(r - l), h = R(Math.min(b - t, 200)); if (w < 8) return; const time = (typeof performance !== 'undefined' ? performance.now() : 0) / 1000;
  const spr = kilnSpr(w, 200); g.drawImage(spr, 0, 0, w, 200, R(l), R(t) + 8, w, 192);
  const mw = Math.min(14, w - 8), mx = R(l) + ((w - mw) >> 1), my = R(t) + 8 + 200 - 18, fl = 0.5 + 0.5 * Math.sin(time * 9 + x0);   /* its fire flickers and lights the sand */
  const o = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.16 + 0.1 * fl; g.fillStyle = '#ff7a30'; g.beginPath(); g.ellipse(mx + mw / 2, my + 6, 26, 18, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = o;
  const gr = g.createLinearGradient(0, R(t) + 120, 0, R(t) + 8 + 200); gr.addColorStop(0, 'rgba(14,6,2,0)'); gr.addColorStop(1, 'rgba(14,6,2,0.6)'); g.fillStyle = gr; g.fillRect(R(l), R(t) + 120, w, 88);
  rc(g, R(l) - 1, R(t) + 4, w + 2, 4, '#c89060'); rc(g, R(l) - 1, R(t) + 4, w + 2, 1, '#ecc088'); rc(g, R(l) - 1, R(t) + 7, w + 2, 1, '#3a1c10');   /* its flat top */
}
const rackSpr = n => once('rack' + n, () => { const w = 10 + n * 11, [c, g] = mk(w, 30);
  rc(g, 0, 8, w, 2, '#3a2c1c'); rc(g, 0, 8, w, 1, '#8a6c42'); rc(g, 0, 10, w, 1, '#1c120a'); for (let k = 0; k < n; k++) { const x = 6 + k * 11;
    rc(g, x - 1, 10, 1, 3, '#5a4a30'); rc(g, x + 6, 10, 1, 3, '#5a4a30'); rc(g, x - 2, 12, 11, 1, '#c09040');   /* a small brass-capped glass hung from the rack */
    for (let y = 0; y < 12; y++) { const hw = y < 6 ? 3 - (y > 3 ? 1 : 0) : 1 + ((y - 6) >> 1); rc(g, x + 3 - hw, 13 + y, hw * 2, 1, y % 5 === 0 ? '#e6fbff' : '#8fc4d4'); }
    rc(g, x + 3, 13 + 3 + (k & 1), 1, 7, '#e6bc68'); rc(g, x - 2, 25, 11, 1, '#c09040'); dot(g, x, 14, '#fff'); }
  rc(g, 2, 0, 1, 8, '#6a6a74'); rc(g, w - 3, 0, 1, 8, '#6a6a74'); for (let y = 0; y < 8; y += 2) { dot(g, 1, y, '#8a8a94'); dot(g, w - 4, y + 1, '#8a8a94'); }   /* the two chains */
  return c; });
const pipeSpr = () => once('wpipe', () => { const [c, g] = mk(96, 12); rc(g, 0, 3, 96, 6, '#8a6a28'); rc(g, 0, 3, 96, 2, '#e0b858'); rc(g, 0, 8, 96, 1, '#4a3410'); for (let x = 8; x < 96; x += 32) { rc(g, x - 2, 1, 6, 10, '#6a4e18'); rc(g, x - 2, 1, 6, 1, '#e0b858'); dot(g, x - 1, 3, '#fff0b0'); dot(g, x + 2, 8, '#fff0b0'); }
  for (let k = 0; k < 20; k++) dot(g, H2(k, 3) % 96, 4 + H2(k, 8) % 4, '#4f9a78'); return c; });   /* verdigris */
const cullet = w => once('cullet' + w, () => { const [c, g] = mk(w, 12); for (let x = 0; x < w; x++) { const h = R(2 + 8 * Math.sin(Math.PI * (x + 0.5) / w) * (0.6 + 0.4 * ((H2(x >> 1, 4) % 5) / 4))); for (let y = 12 - h; y < 12; y++) dot(g, x, y, y === 12 - h ? '#e6fbff' : H2(x, y) % 4 === 0 ? '#bfe6f0' : H2(x, y) % 3 === 0 ? '#5aa0b4' : '#8fc4d4'); }
  for (let k = 0; k < 6; k++) dot(g, H2(k, w) % w, 3 + H2(k, 2) % 7, '#ffffff'); return c; });
/* the dressing the works hangs on its walls: pipes under the roof, racks on chains, glass cullet heaped at the footings. Pure art (no level data): placed by column */
const wallKiln = h => once('wkiln' + h, () => { const w = 56, [c, g] = mk(w, h);   /* a great furnace on the far wall: a brick body in bands, an arched fire-mouth with banked coals, a flue stack rising, iron straps, soot */
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const row = (y / 6) | 0, off = (row & 1) * 7, joint = y % 6 === 5 || (x + off) % 14 === 0; let k = joint ? '#1e1210' : (H2(x >> 3, row) % 4 === 0 ? '#5a3226' : '#6a3c2c'); if (x < 2) k = '#7e4c38'; else if (x > w - 3) k = '#34201a'; dot(g, x, y, k); }
  rc(g, 0, 0, w, 4, '#8a5a40'); rc(g, 0, 0, w, 1, '#b88868'); rc(g, 0, 4, w, 1, '#1e1210'); rc(g, 20, -0, 16, 1, '#3a2218');
  const mx = 14, mw = 28, my = h - 34; rc(g, mx - 2, my - 2, mw + 4, 36, '#1a0e0a'); for (let x = 0; x < mw; x++) { const a = Math.sqrt(Math.max(0, 1 - Math.pow((x - mw / 2) / (mw / 2), 2))); rc(g, mx + x, my + 34 - R(8 + a * 24), 1, R(8 + a * 24), '#0e0604'); }
  for (let x = 0; x < mw; x++) { const a = Math.sqrt(Math.max(0, 1 - Math.pow((x - mw / 2) / (mw / 2), 2))); const fh = R(4 + a * 12); rc(g, mx + x, my + 34 - fh, 1, fh, x % 3 ? '#d84a18' : '#f07a28'); rc(g, mx + x, my + 34 - R(fh * 0.55), 1, R(fh * 0.55), '#ffc850'); }   /* the coals */
  rc(g, mx - 4, my - 4, mw + 8, 3, '#8a5a40'); rc(g, mx - 4, my - 4, mw + 8, 1, '#b88868'); for (let x = mx - 3; x < mx + mw + 3; x += 5) rc(g, x, my - 1, 1, 3, '#2a1610');
  for (let y = 12; y < my - 8; y += 15) { rc(g, 0, y, w, 2, '#32303a'); rc(g, 0, y, w, 1, '#6a6878'); for (let x = 4; x < w - 3; x += 10) dot(g, x, y, '#a8a6b8'); }
  for (let k = 0; k < 30; k++) dot(g, H2(k, h) % w, 6 + H2(k, 9) % Math.max(4, h - 40), 'rgba(12,6,4,0.55)'); return c; });
const shelfSpr = n => once('wshelf' + n, () => { const w = 8 + n * 12, [c, g] = mk(w, 26); rc(g, 0, 18, w, 3, '#4a3820'); rc(g, 0, 18, w, 1, '#a88a58'); rc(g, 0, 21, w, 1, '#1c120a'); rc(g, 2, 21, 3, 5, '#3a2c1c'); rc(g, w - 5, 21, 3, 5, '#3a2c1c');
  for (let k = 0; k < n; k++) { const x = 6 + k * 12, hh = 14 + ((k * 5) % 3); for (let y = 0; y < hh; y++) { const hw = y < hh / 2 ? 4 - R(y / (hh / 2) * 3) : 1 + R((y - hh / 2) / (hh / 2) * 3); rc(g, x + 4 - hw, 17 - hh + y, hw * 2, 1, y % 6 === 0 ? '#e6fbff' : '#8fc4d4'); } rc(g, x + 4, 17 - hh + R(hh * 0.6), 1, R(hh * 0.4), '#e6bc68'); rc(g, x - 1, 17 - hh - 1, 10, 1, '#c09040'); rc(g, x - 1, 17, 10, 1, '#c09040'); dot(g, x + 1, 17 - hh + 2, '#fff'); }
  return c; });
/* the dressing the works hangs on its walls (drawn into the BACKDROP, behind the tiles): pipes under the roof, racks on chains, shelves of blown glasses, great furnaces at the pit's rim and their glow. Pure art (no level data): placed by column */
/* (claude/bc4fix) a backdrop sprite pushed back: darkened toward the hall's shadow (source-atop wash), so its little hourglasses read as stock on a wall, not as the glass you strike */
const farSpr = (k, s) => once('far' + k, () => { const [c, g] = mk(s.width, s.height); g.drawImage(s, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(30,20,34,0.58)'; g.fillRect(0, 0, s.width, s.height); return c; });
export function drawWorksBack(V) {
  const g = V.g; if (!vis(V, WK.x0 * TS, (WK.x1 + 1) * TS)) return; const t = V.time;
  for (let wx = WK.x0 * TS - 16; wx < (WK.x1 + 1) * TS; wx += 96) { if (wx + 96 < V.cx - 20 || wx > V.cx + V.vw + 20) continue; put(V, pipeSpr(), wx, 6 * TS + 4); }
  for (const [x, h] of [[343, 230], [358, 260], [374, 210], [392, 250], [404, 200]]) { const wx = x * TS; if (!vis(V, wx, wx + 60)) continue; put(V, wallKiln(h), wx, 40 * TS + 8 - h); const fl = 0.5 + 0.5 * Math.sin(t * 9 + x); const o = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.14 + 0.08 * fl; g.fillStyle = '#ff7a30'; g.beginPath(); g.ellipse(wx + 28 - V.cx, 40 * TS - 14 - V.cy, 44, 26, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = o; }
  for (const [x, n, y] of [[343, 3, 22], [356, 2, 24], [376, 3, 20], [391, 2, 23]]) { const wx = x * TS; if (!vis(V, wx, wx + 60)) continue; put(V, farSpr('shelf' + n, shelfSpr(n)), wx, y * TS); }   /* (claude/bc4fix: moved off the working glasses - 351, 364, 372, 385, 399 - and dimmed: a shelf of blown glasses is backdrop, never a switch) */
  for (const [x, n, y] of [[346, 3, 8], [356, 2, 9], [372, 3, 7], [391, 3, 8], [402, 2, 9]]) { const wx = x * TS, sw = Math.sin(t * 0.8 + x) * 1.2; if (!vis(V, wx, wx + 60)) continue; g.save(); g.translate(R(wx - V.cx + 22), R(y * TS - V.cy - 8)); g.rotate(sw * 0.012); g.drawImage(farSpr('rack' + n, rackSpr(n)), -22, 0); g.restore(); }
  for (const x of [350, 366, 384, 399]) { const fl = 0.5 + 0.5 * Math.sin(t * 2.4 + x), gx = x * TS + 8 - V.cx; if (gx < -80 || gx > V.vw + 80) continue; const o = g.globalCompositeOperation; g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.07 + 0.04 * fl; g.fillStyle = '#ff8a40'; g.beginPath(); g.ellipse(gx, 34 * TS - V.cy, 70, 130, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = o; }
}
export function drawCullet(V, wx, wy, w) { if (vis(V, wx, wx + w)) put(V, cullet(w), wx, wy - 12); }

/* THE GLASS PIT: the sand sea indoors - a darker, redder sand with shards of glass in it, kiln-glow on its skin; no sky dust. Drawn over the sea's own art (it is drawn clipped to the sea) */
export function drawPitSkin(V, s, l, w, top) {
  const g = V.g, t = V.time; if (w <= 0) return; const h = V.vh - top; if (h <= 0) return;
  g.fillStyle = 'rgba(54,16,6,0.42)'; g.fillRect(R(l), R(top), R(w), R(h));   /* darker, hotter than the rooftops' sea */
  for (let i = 0; i < w / 5; i++) { const h0 = H2(i + s.x0, 5), x = l + (h0 % Math.max(1, R(w))), y = top + 4 + (H2(i, s.x0) % 40), a = (h0 >> 4) % 6; g.fillStyle = a < 3 ? '#9fd6ee' : '#e6fbff'; g.globalAlpha = 0.85; g.fillRect(R(x), R(y), 1 + (a & 1), 1); g.fillRect(R(x) + 1, R(y) + 1, 1, 1); g.globalAlpha = 1; }   /* shards of the glass the works spilled */
  const fl = 0.5 + 0.5 * Math.sin(t * 2 + s.x0); g.fillStyle = 'rgba(255,150,60,' + (0.14 + 0.08 * fl).toFixed(2) + ')'; g.fillRect(R(l), R(top), R(w), 3);   /* the kilns' light on its skin */
  g.fillStyle = 'rgba(255,200,120,0.55)'; for (let x = 0; x < w; x += 9) g.fillRect(R(l + x + ((t * 6 + x) % 3)), R(top - 1), 2, 1);
}

/* ============================================================ THE TILTING DUNE: the turn and the warning */
export function drawTilt(V, tl, k, warn, time) {
  /* k: 0..1 how far the turn has come (eased), dir the target; a wedge of sand sweeping across the slope's cells, the old wedge draining */
  const g = V.g, n = tl.x1 - tl.x0 + 1, l = tl.x0 * TS - V.cx, top = (tl.lo - n) * TS - V.cy, w = n * TS; if (l > V.vw + 40 || l + w < -40) return;
  if (k < 1) { const e = k * k * (3 - 2 * k); g.save(); g.beginPath(); g.rect(l, top - 4, w, w + 8); g.clip();
    for (let i = 0; i < 26; i++) { const a = (i * 0.37 + time * 3 + k * 6) % 1, sx = l + ((i * 53 + 7) % w), sy = top + (1 - a) * w * (tl.dir > 0 ? 1 - e : e) + (i % 5) * 4; g.fillStyle = i % 3 ? '#ecd092' : '#a67c44'; g.fillRect(R(sx), R(sy), 2, 1 + (i & 1)); }
    g.fillStyle = 'rgba(232,196,128,' + (0.28 * (1 - e)).toFixed(2) + ')'; g.fillRect(l, top, w, w); g.restore(); }
  if (warn) { g.fillStyle = 'rgba(255,170,90,' + (0.12 + 0.1 * Math.sin(time * 28)).toFixed(2) + ')'; g.fillRect(R(l), R(top), w, w);
    g.fillStyle = '#e8d0a0'; for (let i = 0; i < 10; i++) g.fillRect(R(l + ((i * 37 + time * 40) % w)), R(top + w - 2 - (i * 7 + time * 20) % (w * 0.6)), 1, 2); }   /* it shakes, grains jump off it - it is about to turn back */
}

/* ============================================================ THE SKY: clouds over their shadows (screen px, parallax-free: a cloud hangs over the shadow it throws) */
const cloudSpr = (w, seed) => once('cloud' + w + ':' + seed, () => { const h = 26, [c, g] = mk(w, h), puffs = [];
  for (let i = 0; i < 7 + (w >> 4); i++) puffs.push([4 + H2(i, seed) % (w - 8), 10 + H2(i, seed + 3) % 8, 5 + H2(i, seed + 5) % 6]);
  const blob = (col, dy, grow) => { g.fillStyle = col; for (const [x, y, r] of puffs) { g.beginPath(); g.arc(x, y + dy, r + grow, 0, 7); g.fill(); } };
  blob('#a8789a', 3, 0); blob('#e8c0c0', 0, 0); blob('#fbe4d0', -2, -1.5); g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 21, w, 6); g.globalCompositeOperation = 'source-over';   /* a flat-bottomed cloud: a warm lit top, a violet belly */
  { const im = g.getImageData(0, 0, w, h), d = im.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.putImageData(im, 0, 0); }
  return c; });
export function drawClouds(g, cx, cy, VW, VH, L, spans) {   /* spans: [[a, b, w], ...] world px the cloud shadows cover now (src/buried-city-hands.js H.cloudSpans) */
  for (const [a, b, i] of spans) { const w = R(b - a), sx = R(a - cx), sy = R(VH * 0.07 + (i % 3) * 11 - cy * 0.03); if (sx > VW + 20 || sx + w < -20) continue; g.globalAlpha = 0.94; g.drawImage(cloudSpr(Math.max(40, w), i), sx, sy); g.globalAlpha = 1; }
}

/* ============================================================ THE ANTECHAMBER, THE OLD STREET */
const anteWall = () => once('antewall', () => { const [c, g] = mk(64, 64);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const row = (y / 16) | 0, off = (row & 1) * 16, j = y % 16 === 15 || (x + off) % 32 === 31; let k = j ? '#06050e' : (H2(x >> 3, row) % 4 === 0 ? '#161430' : '#100e24'); if (y % 16 === 0 && !j) k = '#1c1a3a'; dot(g, x, y, k); }
  for (let x = 4; x < 64; x += 32) { rc(g, x + 8, 26, 2, 12, '#7a6224'); dot(g, x + 8, 26, '#e0b44a'); } return c; });   /* black lapis ashlar with a gilt inlay: the throne's outer hall */
export function drawAnteBack(V) {   /* the throne's outer hall: lapis ashlar in the air cells under the roof (rows 23-32), gilt-banded pilasters, the glass's glow up the long wall */
  const x0 = 822, x1 = 843, y0 = 23, y1 = 32, g = V.g; if (!vis(V, x0 * TS, (x1 + 1) * TS)) return; const wp = anteWall(), L = V.L, T = V.T;
  const a = Math.max(x0, Math.floor(V.cx / TS) - 1), b = Math.min(x1, Math.ceil((V.cx + V.vw) / TS) + 1);
  for (let x = a; x <= b; x++) for (let y = y0; y <= y1; y++) if (L.grid[y * L.W + x] === T.AIR) g.drawImage(wp, (x * TS) % 64, (y * TS) % 64, 16, 16, R(x * TS - V.cx), R(y * TS - V.cy), 16, 16);
  for (let wx = 823; wx < 844; wx += 6) { const sx = wx * TS - V.cx; if (sx < -20 || sx > V.vw + 20) continue; const ty = y0 * TS - V.cy, h = (y1 + 1 - y0) * TS; rc(g, sx, ty, 10, h, 'rgba(12,10,28,0.85)'); rc(g, sx, ty, 2, h, '#34325a'); rc(g, sx + 8, ty, 2, h, '#06050e'); rc(g, sx - 2, ty, 14, 3, '#d8aa40'); rc(g, sx - 2, ty + 3, 14, 1, '#6a5018'); rc(g, sx - 2, ty + h - 10, 14, 3, '#d8aa40'); rc(g, sx - 2, ty + h - 7, 14, 1, '#6a5018'); }
  const gl = g.createRadialGradient(R(824 * TS + 8 - V.cx), R(31 * TS - V.cy), 6, R(826 * TS - V.cx), R(31 * TS - V.cy), 150); gl.addColorStop(0, 'rgba(255,190,90,0.18)'); gl.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gl; g.fillRect(R(x0 * TS - V.cx), R(y0 * TS - V.cy), (x1 + 1 - x0) * TS, (y1 + 1 - y0) * TS);
}
export function drawOldStreet(V, it) {   /* the tunnel under the dunes: a vaulted dark with ribs, tiles, sand dust, cold lamp-pools */
  const g = V.g, ts = TS, x0 = Math.max(it[0], Math.floor(V.cx / ts) - 1), x1 = Math.min(it[1], Math.ceil((V.cx + V.vw) / ts) + 1);
  for (let x = x0; x <= x1; x++) for (let y = it[2]; y <= it[3]; y++) if (V.L.grid[y * V.L.W + x] === V.T.AIR) { const row = y - it[2], k = (x + y) % 7 ? '#241a14' : '#2c2018'; g.fillStyle = k; g.fillRect(R(x * ts - V.cx), R(y * ts - V.cy), ts, ts);
    if (row === 0) { g.fillStyle = '#3a2a1c'; g.fillRect(R(x * ts - V.cx), R(y * ts - V.cy), ts, 3); } if ((x % 8) < 1) { g.fillStyle = '#1a120c'; g.fillRect(R(x * ts - V.cx), R(y * ts - V.cy), 3, ts); g.fillStyle = '#4a3624'; g.fillRect(R(x * ts - V.cx) + 3, R(y * ts - V.cy), 1, ts); } }
  for (let x = x0; x <= x1; x++) if (x % 8 === 0) { const sx = x * ts - V.cx, ty = it[2] * ts - V.cy; g.fillStyle = '#4a3624'; g.beginPath(); g.moveTo(sx - 10, ty + 20); g.quadraticCurveTo(sx + 8, ty - 4, sx + 26, ty + 20); g.lineTo(sx + 22, ty + 20); g.quadraticCurveTo(sx + 8, ty + 2, sx - 6, ty + 20); g.closePath(); g.fill(); }   /* the vault's ribs */
  g.fillStyle = 'rgba(232,196,128,0.5)'; for (let i = 0; i < 14; i++) { const wx = (V.cx + ((i * 61 + V.time * 9) % V.vw)); if (wx < it[0] * ts || wx > (it[1] + 1) * ts) continue; g.fillRect(R(wx - V.cx), R(it[2] * ts - V.cy + ((i * 23 + V.time * 12) % ((it[3] - it[2]) * ts))), 1, 2); }
}
const gateSpr = h => once('sgate' + h, () => { const [c, g] = mk(16, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < 16; x++) { let k = [S.s1, S.s2, S.s3][((y >> 2) + (x >> 3)) % 3]; if (y % 6 === 5) k = S.s0; if (H2(x, y) % 9 === 0) k = S.s4; dot(g, x, y, k); }
  rc(g, 0, 0, 2, h, S.s4); rc(g, 14, 0, 2, h, '#3a2812'); for (let y = 4; y < h; y += 16) { rc(g, 0, y, 16, 2, '#c09040'); rc(g, 0, y, 16, 1, '#f6dc80'); dot(g, 3, y + 1, '#5a3a14'); dot(g, 12, y + 1, '#5a3a14'); }   /* a slab of packed sand banded in brass */
  rc(g, 5, (h >> 1) - 3, 6, 7, '#2a1c10'); rc(g, 6, (h >> 1) - 2, 4, 5, '#d8aa40'); rc(g, 7, (h >> 1) - 1, 2, 3, '#2a1c10'); return c; });   /* a glass-shaped seal */
export function drawLoopGate(V, LD, open, time, near) {
  const g = V.g, ts = TS, dx = R(LD.x * ts - V.cx), y0 = R(LD.y0 * ts - V.cy), h = (LD.y1 - LD.y0 + 1) * ts; if (dx < -40 || dx > V.vw + 40) return;
  rc(g, dx - 2, y0 - 4, 20, 4, '#5a4428'); rc(g, dx - 2, y0 - 4, 20, 1, '#c09040');   /* the lintel: a brass-shod stone */
  if (!open) { g.drawImage(gateSpr(h), dx, y0); g.fillStyle = 'rgba(232,196,128,0.7)'; for (let i = 0; i < 3; i++) g.fillRect(dx + 3 + i * 4, R(y0 + h - 2 - ((time * 8 + i) % 6)), 1, 2); }
  else { rc(g, dx, y0 + h - 3, 16, 3, S.s2); rc(g, dx + 2, y0 + h - 5, 12, 2, S.s3); for (let i = 0; i < 4; i++) rc(g, dx + 2 + i * 4, y0 + h - 7 - (i & 1), 3, 2, S.s4); rc(g, dx, y0 - 3, 16, 1, '#3a2812'); }   /* it is in the floor: a heap of the slab's sand */
  const lx = R(LD.lever[0] * ts + 8 - V.cx), ly = R((LD.lever[1] + 1) * ts - V.cy);
  rc(g, lx - 6, ly - 4, 12, 4, '#3a3446'); rc(g, lx - 6, ly - 4, 12, 1, '#8a849a'); rc(g, lx - 1, ly - 20, 3, 17, '#2a2634'); rc(g, lx - 1, ly - 20, 1, 17, '#8a849a');   /* a plinth and an iron arm */
  const ex = open ? 5 : -5; g.strokeStyle = '#b0aabf'; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, ly - 7); g.lineTo(lx + ex, ly - 19); g.stroke(); g.lineWidth = 1;
  rc(g, lx + ex - 3, ly - 22, 7, 5, open ? '#8fd160' : '#ffd36b'); rc(g, lx + ex - 3, ly - 22, 7, 1, '#fff6c0'); dot(g, lx + ex, ly - 20, '#2a1c10');
  if (!open) { g.globalAlpha = 0.25 + 0.2 * Math.sin(time * 5); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(lx, ly - 12, 14, 0, 7); g.fill(); g.globalAlpha = 1; }
}
/* what lies under the rooftops' seas: stakes and bones (a thin art pass over the stake tiles' own: pale ribs and a skull in the dark) */
export function drawSeaBones(V, s) {
  const g = V.g; if (s.bottom === undefined) return; const l = s.x0 * TS - V.cx, y = (s.bottom + 1) * TS - V.cy; if (l > V.vw + 20 || l + (s.x1 - s.x0 + 1) * TS < -20) return;
  for (let x = s.x0; x <= s.x1; x++) { const h = H2(x, 11) % 7; if (h > 2) continue; const sx = R(x * TS - V.cx); const wy = y - 3; rc(g, sx + 2, wy, 8, 1, '#d6cbac'); rc(g, sx + 3, wy + 1, 1, 2, '#a89c7c'); rc(g, sx + 6, wy + 1, 1, 2, '#a89c7c'); rc(g, sx + 9, wy - 1, 3, 2, '#d6cbac'); dot(g, sx + 10, wy - 1, '#16100c'); }
}

/* ============================================================ MURALS OF HIM (B8: the approach foretells the fight) and the frozen, half-buried citizens */
const GOLD = '#d4a84a', GOLDL = '#f0cc70', OCH = '#9a7a52';
function muralBase(g, w, H) { rc(g, 0, 0, w, H, OCH); for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if (H2(x, y) % 9 === 0) dot(g, x, y, '#8a6c46'); else if (H2(x + 4, y) % 23 === 0) dot(g, x, y, '#b4946a');
  rc(g, 0, 0, w, 3, '#2c6a68'); rc(g, 0, 3, w, 1, GOLD); rc(g, 0, H - 4, w, 1, GOLD); rc(g, 0, H - 3, w, 3, '#9a4030'); rc(g, 0, 0, 3, H, '#2c6a68'); rc(g, w - 3, 0, 3, H, '#2c6a68');
  for (let x = 6; x < w - 6; x += 6) { rc(g, x, 6, 3, 1, '#4a3220'); rc(g, x + 1, 8, 2, 1, '#4a3220'); rc(g, x, 10, 3, 1, '#4a3220'); } }
function muralKing(g, x, base, sc = 1) {   /* the king, flat-painted: robe, crown of gears, the glass for a heart */
  rc(g, x - 4, base - 24 * sc, 8, 24 * sc, GOLD); rc(g, x - 4, base - 24 * sc, 1, 24 * sc, GOLDL); rc(g, x - 6, base - 5, 12, 5, GOLD); rc(g, x - 3, base - 26 * sc, 6, 3, '#b87838'); rc(g, x - 5, base - 27 * sc, 10, 1, GOLDL); for (const dx of [-4, 0, 4]) rc(g, x + dx, base - 31 * sc, 2, 3, GOLDL);
  rc(g, x - 2, base - 18 * sc, 4, 6, '#2c3a50'); rc(g, x - 1, base - 15 * sc, 2, 3, GOLDL); }
function muralSlabs(w) { return once('mu-slabs' + w, () => { const H = 46, [c, g] = mk(w, H); muralBase(g, w, H); const gy = H - 8; rc(g, 4, gy, w - 8, 1, '#5a4228');
  const cx = (w * 0.72) | 0; rc(g, cx - 5, gy - 14, 10, 14, '#c49a5c'); rc(g, cx - 5, gy - 14, 10, 2, '#ecd092'); for (let y = gy - 12; y < gy; y += 3) rc(g, cx - 5, y, 10, 1, '#8a6a3c');   /* the pillar he stands on */
  muralKing(g, cx, gy - 14, 0.8); rc(g, cx + 7, gy - 34, 14, 1, GOLDL); rc(g, cx - 21, gy - 34, 14, 1, GOLDL); rc(g, cx - 12, gy - 28, 2, 6, GOLDL); rc(g, cx + 10, gy - 28, 2, 6, GOLDL);   /* his arms out, palms up */
  for (let i = 0; i < 4; i++) { const sx = (w * 0.44 - i * 11) | 0, sy = gy - 4 - i * 6; if (sx < 8) continue; rc(g, sx - 6, sy, 12, 3, '#d8b474'); rc(g, sx - 6, sy, 12, 1, '#fbe6b0'); for (let k = 0; k < 3; k++) dot(g, sx - 4 + k * 4, sy - 2 - k, GOLDL); }   /* the slabs rising toward him in a stair */
  for (let i = 0; i < 3; i++) { const fx = 12 + i * 11, col = ['#9a4030', '#2c6a68', '#c49038'][i]; rc(g, fx - 3, gy - 7, 6, 7, col); rc(g, fx - 1, gy - 10, 3, 3, '#6a4a30'); rc(g, fx + 2, gy - 10, 5, 1, '#6a4a30'); rc(g, fx + 3, gy - 14, 1, 4, '#6a4a30'); }   /* the folk, stepping up onto the first, arms raised */
  for (let k = 0; k < 40; k++) dot(g, 4 + H2(k, w) % (w - 8), 4 + H2(k, 3) % (H - 10), 'rgba(40,24,10,0.5)'); rc(g, 0, 0, w, 1, '#1a1008'); rc(g, 0, H - 1, w, 1, '#1a1008'); return c; }); }
function muralThrow(w) { return once('mu-throw' + w, () => { const H = 46, [c, g] = mk(w, H); muralBase(g, w, H); const gy = H - 8; rc(g, 4, gy, w - 8, 1, '#5a4228');
  const cx = (w * 0.78) | 0; rc(g, cx - 4, gy - 22, 8, 22, '#c49a5c'); rc(g, cx - 4, gy - 22, 8, 2, '#ecd092'); muralKing(g, cx, gy - 22, 0.75); rc(g, cx - 18, gy - 40, 12, 1, GOLDL);
  for (let i = 0; i < 3; i++) { const sx = cx - 20 - i * 9, sy = gy - 36 + i * 5; g.fillStyle = '#7ab4c8'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - 8, sy + 1); g.lineTo(sx, sy + 3); g.closePath(); g.fill(); rc(g, sx - 6, sy + 1, 5, 1, '#e6fbff'); }   /* glass flung down at the folk */
  for (let i = 0; i < 3; i++) { const fx = 12 + i * 12, col = ['#9a4030', '#2c6a68', '#c49038'][i]; rc(g, fx - 3, gy - 5, 7, 5, col); rc(g, fx - 3, gy - 8, 3, 3, '#6a4a30'); rc(g, fx - 5, gy - 9, 2, 5, '#6a4a30'); }   /* the folk, shielding their heads */
  for (let k = 0; k < 40; k++) dot(g, 4 + H2(k, w) % (w - 8), 4 + H2(k, 5) % (H - 10), 'rgba(40,24,10,0.5)'); rc(g, 0, 0, w, 1, '#1a1008'); rc(g, 0, H - 1, w, 1, '#1a1008'); return c; }); }
function muralFlip(w) { return once('mu-flip' + w, () => { const H = 46, [c, g] = mk(w, H); muralBase(g, w, H); const gy = H - 8; rc(g, 4, gy, w - 8, 1, '#5a4228'); const cx = (w / 2) | 0;
  rc(g, cx - 7, gy - 28, 14, 2, '#c09040'); rc(g, cx - 7, gy - 2, 14, 2, '#c09040'); for (let y = 0; y < 24; y++) { const hw = y < 12 ? 6 - (y >> 2) : 2 + ((y - 12) >> 2); rc(g, cx - hw, gy - 26 + y, hw * 2, 1, y < 12 ? '#9ab8c0' : '#9ab8c0'); }
  for (let y = 12; y < 24; y++) rc(g, cx - (1 + ((y - 12) >> 2)), gy - 26 + y, 2 + ((y - 12) >> 1), 1, '#e6bc68'); rc(g, cx, gy - 18, 1, 8, '#e6bc68');
  muralKing(g, 12, gy, 0.7); muralKing(g, w - 12, gy, 0.7); rc(g, 14, gy - 22, 10, 1, GOLDL); rc(g, w - 26, gy - 22, 10, 1, GOLDL); for (let i = 0; i < 6; i++) { dot(g, cx - 14 + i * 3, gy - 30 - (i & 1), GOLDL); dot(g, cx + 10 + i * 3, gy - 6 + (i & 1), GOLDL); }   /* the glass turned over by him, the sand running the other way */
  for (let k = 0; k < 40; k++) dot(g, 4 + H2(k, w) % (w - 8), 4 + H2(k, 7) % (H - 10), 'rgba(40,24,10,0.5)'); rc(g, 0, 0, w, 1, '#1a1008'); rc(g, 0, H - 1, w, 1, '#1a1008'); return c; }); }
export function drawKingMural(V, x0, x1, yTop, kind, dim = 1) {   /* kind: 'slabs' | 'throw' | 'flip'; yTop = the world y of its top edge */
  const l = x0 * TS, w = (x1 - x0 + 1) * TS; if (!vis(V, l, l + w)) return; const spr = kind === 'slabs' ? muralSlabs(w) : kind === 'throw' ? muralThrow(w) : muralFlip(w); const o = V.g.globalAlpha; V.g.globalAlpha = o * dim; put(V, spr, l, yTop); V.g.globalAlpha = o;
  const gl = Math.sin(V.time * 1.7 + x0) * 0.5 + 0.5; V.g.fillStyle = 'rgba(255,214,107,' + (0.04 + 0.04 * gl).toFixed(3) + ')'; V.g.fillRect(R(l - V.cx), R(yTop - V.cy), w, 46);
}
const citizenSpr = k => once('frozen' + k, () => { const [c, g] = mk(22, 30), pal = [['#c8bc9c', '#a89c7c', '#7c7058'], ['#bcb092', '#9c9072', '#70664e'], ['#d0c4a4', '#b0a484', '#847860']][k % 3];
  const x = 11; rc(g, x - 4, 14, 8, 12, pal[0]); rc(g, x - 4, 14, 2, 12, pal[1]); rc(g, x + 2, 14, 2, 12, pal[2]); rc(g, x - 3, 8, 6, 6, pal[0]); rc(g, x - 3, 8, 2, 6, pal[1]); dot(g, x - 1, 10, '#16100c'); dot(g, x + 1, 10, '#16100c'); rc(g, x - 1, 12, 2, 1, '#16100c');   /* a bleached figure caught in the act of rising */
  const arms = [[[-5, 4], [-8, 0]], [[4, 12], [8, 6]], [[-5, 12], [-9, 8]]][k % 3]; for (const [dx, dy] of arms) { for (let t = 0; t <= 6; t++) dot(g, x + (dx > 0 ? 3 : -3) + ((dx - (dx > 0 ? 3 : -3)) * t / 6 | 0), 15 - (t * (15 - 4 - dy * 0.4) / 6 | 0), pal[1]); } rc(g, x + 6 - (k % 2) * 12, 5 + (k % 3), 2, 3, pal[0]);   /* an arm flung up, a hand open */
  for (let xx = 0; xx < 22; xx++) { const h = 8 + R(2 * Math.sin(xx / 3 + k)) + (H2(xx, k) % 2); for (let y = 30 - h; y < 30; y++) dot(g, xx, y, y === 30 - h ? S.s4 : H2(xx, y) % 5 === 0 ? S.s2 : y < 30 - h + 3 ? S.s3 : S.s1); }   /* the sand up to its waist */
  for (let q = 0; q < 6; q++) dot(g, H2(q, k) % 22, 14 + H2(q, 3) % 8, S.s3); return c; });
export function drawFrozen(V, x, floorY, k) { if (!vis(V, x, x + 22)) return; put(V, citizenSpr(k), x - 11, floorY - 30); }
export const wallRowAt = (V, x) => { const L = V.L, T = V.T; for (let y = 24; y < L.H - 1; y++) if (L.grid[y * L.W + x] !== T.AIR && L.grid[(y - 1) * L.W + x] === T.AIR) return y; return -1; };

/* THE SAND-BOUND's read (B10): the sand's shell while its glass rests - a faceted dome of packed-sand plates, rotating, with glass glints; buried: the collar of sand round its chest, a locked brass tag */
export function drawBoundShell(g, x, y, time, buried, seed) {
  if (buried) { g.fillStyle = '#8a6a3c'; g.beginPath(); g.ellipse(R(x), R(y - 1), 15, 5.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c8a064'; g.beginPath(); g.ellipse(R(x), R(y - 3), 14, 4.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ecc988'; g.fillRect(R(x - 11), R(y - 6), 22, 1);
    for (let i = 0; i < 8; i++) { const a = time * 1.4 + i * 0.785; g.fillStyle = i % 2 ? '#fbe6b0' : '#c8a064'; g.fillRect(R(x + Math.cos(a) * 13), R(y - 4 + Math.sin(a) * 3.5), 2, 1); }
    g.fillStyle = '#d8aa40'; g.fillRect(R(x - 2), R(y - 9), 5, 3); g.fillStyle = '#6a4a14'; g.fillRect(R(x - 1), R(y - 8), 3, 1); g.fillStyle = '#e8bc68'; g.fillRect(R(x - 3), R(y - 9), 1, 3); return; }   /* (the glass runs: the sand has it by the ribs; a brass lock holds the collar) */
  const k = 0.5 + 0.5 * Math.sin(time * 6 + seed), rot = time * 0.9 + seed; g.save(); g.translate(R(x), R(y - 11));
  g.fillStyle = 'rgba(236,201,136,' + (0.1 + 0.06 * k).toFixed(2) + ')'; g.beginPath(); g.ellipse(0, 0, 12, 15, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 12; i++) { const a0 = rot + i * Math.PI / 6, on = i % 2 === 0; g.strokeStyle = on ? 'rgba(251,230,176,' + (0.55 + 0.35 * k).toFixed(2) + ')' : 'rgba(200,160,100,0.5)'; g.lineWidth = on ? 2 : 1; g.beginPath(); g.ellipse(0, 0, 12 + k * 0.8, 15 + k * 0.8, 0, a0, a0 + Math.PI / 7); g.stroke(); }   /* the plates of the shell: bright, dim, turning */
  g.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = rot * 1.7 + i * 2.09; g.fillStyle = '#e6fbff'; g.fillRect(R(Math.cos(a) * 12), R(Math.sin(a) * 15), 2, 2); g.fillStyle = '#9ad8e0'; g.fillRect(R(Math.cos(a) * 12) + 1, R(Math.sin(a) * 15) + 1, 1, 1); }   /* glints of the glass in it */
  g.restore();
}
/* THE APPROACH FORETELLS HIM (B8): murals of the King along the road to him (art-only: placed by column, standing on whatever floor is there) and the folk he froze, half-buried, arms up */
const APPR = { murals: [[296, 299, 'flip', 43], [404, 407, 'slabs', 33], [602, 605, 'throw', 33], [646, 649, 'slabs', 33], [682, 685, 'flip', 33]], frozen: [[340, 0, 33], [613, 1, 33], [622, 2, 33], [636, 0, 33], [655, 1, 33], [662, 2, 33], [676, 0, 33], [694, 1, 33]] };   /* (the floor rows are the level's: the halls 43, the glass works' end and the throne street 33) */
export function drawApproach(V) {
  for (const [x0, x1, kind, f] of APPR.murals) { if (!vis(V, x0 * TS, (x1 + 1) * TS)) continue; drawKingMural(V, x0, x1, f * TS - 58, kind, 0.92); }
  for (const [x, k, f] of APPR.frozen) { if (!vis(V, x * TS, x * TS + 24)) continue; drawFrozen(V, x * TS + 8, f * TS + 1, k); }
}
/* the sky's tone (the visual pass): the pink-orange wash of the desert sunset is cooled toward dusk violet from the top, so the lit sand and the cloth read against it */
export function drawSkyTone(g, VW, VH) { const gr = g.createLinearGradient(0, 0, 0, VH * 0.8); gr.addColorStop(0, 'rgba(54,62,118,0.34)'); gr.addColorStop(0.6, 'rgba(70,70,120,0.16)'); gr.addColorStop(1, 'rgba(70,70,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
