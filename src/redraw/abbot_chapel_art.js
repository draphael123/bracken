// src/redraw/abbot_chapel_art.js - THE FALSE ABBOT'S BUILDING, drawn (claude/abbotart, 11-05, over the greybox of claude/falseabbot). DRAWING ONLY: no tile,
// entity, number or timer changes. Behind house.m3 (src/abbot-chapel.js sets it; only the MON3 layout has one): master's belfry never calls any of this.
// Plain fillRect pixels (no paths) so tools/abbot-art.mjs renders everything in Node. The monastery's style is KEPT (src/redraw/mon3_art.js, monastery.js):
// warm limestone, tar-dark timber, bronze, faded tile red. Where every piece goes is house.art (src/abbot-chapel.js), in tiles.
//   THE WEST FRONT   the climb's wall face: a gable of dressed ashlar raking up to the bell-cote, string-course mouldings at every ledge, blind lancets,
//                    weather streaks and moss (baked once); the corbels' caps and brackets; the buttress's weathered steps; the SILL's moulding;
//                    the bell-cote's two bronze bells; the aisle's lead roof (rolls, seams, patches)
//   THE BELFRY       three tie-beams of the roof truss with king-posts and braces (the beam ring the peal runs under); soot behind the braziers;
//                    the hole the floor leaves, its broken lip and snapped joists, the light that falls through it
//   THE CHAPEL       the two piers (corbelled capitals, shafts, plinths), the rood's carved fascia and valance, the three pews, the altar with its retable
//   THE FLOOR GONE   the rubble steps as broken slabs (they are ONEWAY tiles at runtime)
//   FX               pealRing: the peal's ring in bronze on the boards; kindleFlare: the brazier catching; scorch(): the pad under each brazier
import { canvas, rect, px, mulberry } from '../px.js';

const R = rect, ri = Math.round, T = 16;
const ST = { cap: '#cdbd9c', hi: '#b8a888', l: '#a09074', m: '#8c7e66', d: '#766a58', deep: '#5a5046', mor: '#3c342e' };
const WD = ['#2e1e12', '#4a3020', '#6a4a2c', '#8a6640', '#b08a5c'];
const BR = ['#3a2a12', '#6a4a1e', '#9a7634', '#c9a44a', '#f0dc8a'];
const IRON = ['#1c1c22', '#33333c', '#4a4a56', '#6a6a78', '#9a9aa8'];
const LEAD = ['#3e444c', '#565c66', '#6e7480', '#8a909c'];
const RED = ['#5a1e1e', '#8e3a32', '#b8584a'];
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const wave = (t, f, p = 0) => 0.5 + 0.5 * Math.sin(t * f + p);
const safe = (name, fn) => { try { fn(); } catch (err) { if (!safe.told) { safe.told = true; if (typeof console !== 'undefined') console.warn('abbot_chapel_art ' + name + ': ' + err.message); } } };
const seen = (x, y, w, h, VW, VH) => x < VW && x + w > 0 && y < VH && y + h > 0;

// ---------------- THE WEST FRONT's WALL (baked once) ----------------
const WALL = { x0: 16, x1: 47, r0: 4, r1: 29 };   /* tiles: the face the climb is cut into, from one row over the highest the gable reaches down to the leads */
const rake = tx => Math.max(5, 19 - (tx - 16) * 14 / 25);   /* the gable's top, in rows: 19 at the west end up to 5 at the bell-cote */
function bakeWall(art) {
  const W = (WALL.x1 - WALL.x0 + 1) * T, H = (WALL.r1 - WALL.r0 + 1) * T, [c, g] = canvas(W, H), rnd = mulberry(5150);
  const top = x => ri((rake(WALL.x0 + x / T) - WALL.r0) * T);
  for (let y = 0; y < H; y += 8) { const off = ((y >> 3) & 1) * 8;
    for (let x = -off; x < W; x += 16) { const bx = Math.max(0, x), bw = Math.min(W, x + 16) - bx; if (bw <= 0 || y + 8 <= Math.min(top(bx), top(bx + bw - 1))) continue;
      const r = rnd(), tone = r < 0.18 ? ST.l : r < 0.3 ? ST.d : r < 0.4 ? ST.hi : ST.m;
      R(g, bx, y, bw, 8, tone); R(g, bx, y, bw, 1, r < 0.3 ? ST.m : ST.hi); R(g, bx, y + 7, bw, 1, ST.deep); R(g, bx + bw - 1, y, 1, 8, ST.deep);
      for (let k = 0; k < 3; k++) if (rnd() < 0.5) px(g, bx + 2 + ri(rnd() * (bw - 4)), y + 2 + ri(rnd() * 4), rnd() < 0.5 ? ST.d : ST.l); } }
  for (let x = 0; x < W; x++) g.clearRect(x, 0, 1, top(x));   /* the gable's rake: nothing above it */
  for (let x = 0; x < W; x++) { const y = top(x); R(g, x, y - 3, 1, 2, ST.cap); px(g, x, y - 3, '#ded0b0'); px(g, x, y - 1, ST.deep); if (x % 14 === 0) R(g, x, y - 3, 1, 3, ST.d); }   /* the coping stones */
  g.clearRect((42 - WALL.x0) * T, 0, W, (14 - WALL.r0) * T);   /* the bell-cote's own facade (monkArch) is drawn there, not this wall */
  for (const row of art.courses) { const y = (row - WALL.r0) * T; if (rake(WALL.x0) > row) { /* partly rake-cut at the west end: only where the wall stands */ }
    for (let x = 0; x < W; x++) { if (y < top(x) + 2) continue;
      R(g, x, y, 1, 2, ST.cap); px(g, x, y, '#ded0b0'); R(g, x, y + 2, 1, 3, ST.hi); R(g, x, y + 5, 1, 2, ST.d); px(g, x, y + 7, ST.mor); px(g, x, y + 8, '#2a2420'); } }   /* the string-courses: a lit roll, a hollow, a drip-groove */
  for (const [tx, r, h] of art.lancets) { const x = (tx - WALL.x0) * T + 4, y = (r - WALL.r0) * T, w = 8, hh = h * T - 6;   /* blind lancets: a pointed slot with a deep reveal, its sill lit */
    R(g, x - 2, y - 1, w + 4, hh + 3, ST.hi); R(g, x - 1, y, w + 2, hh + 1, ST.deep); R(g, x, y + 3, w, hh - 3, '#1a1612'); R(g, x + 1, y + 1, w - 2, 3, '#1a1612'); R(g, x + 2, y, w - 4, 1, '#1a1612');
    R(g, x + w - 2, y + 4, 2, hh - 4, '#26201a'); R(g, x - 3, y + hh + 1, w + 6, 2, ST.cap); R(g, x - 3, y + hh + 3, w + 6, 1, ST.deep); R(g, x + 3, y + 8, 1, hh - 9, ST.mor); }
  for (let i = 0; i < 46; i++) { const x = ri(rnd() * (W - 4)), y0 = top(x) + 12 + ri(rnd() * (H - top(x) - 30)), len = 6 + ri(rnd() * 22);   /* rain streaks run down the face */
    if (y0 + len > H) continue; g.globalAlpha = 0.22; R(g, x, y0, 1, len, '#2a241c'); g.globalAlpha = 1; }
  for (const [tx, r] of art.drips) { const x = (tx - WALL.x0) * T, y = (r - WALL.r0) * T + 9; for (let k = 0; k < 3 * T; k += 2) { const len = 10 + ((k * 7) % 21); g.globalAlpha = 0.3 - len * 0.006; R(g, x + k, y, 1, len, '#1e1812'); } g.globalAlpha = 1; }   /* under each ledge the black wash of its drip */
  for (const [mx, my, mw] of art.moss) { const x = (mx - WALL.x0) * T, y = (my - WALL.r0) * T; for (let k = 0; k < mw * 5; k++) { const dx = ri(rnd() * mw * T), dy = ri(rnd() * 8); R(g, x + dx, y + dy, 1 + ri(rnd() * 2), 1, rnd() < 0.5 ? '#4e6a36' : '#6a8a44'); } }
  return c;
}
function bakeBell(w = 14, h = 20) {   /* a bronze bell hung from a crown: flared, banded, the lip thick, the clapper under it */
  const [c, g] = canvas(w + 4, h + 6); const cx = (w + 4) >> 1;
  R(g, cx - 2, 0, 4, 3, IRON[2]); R(g, cx - 2, 0, 4, 1, IRON[4]);
  for (let r = 0; r < h - 3; r++) { const half = 2 + ri(Math.pow(r / (h - 4), 1.5) * (w / 2 - 2)); R(g, cx - half, 3 + r, half * 2, 1, BR[2]); R(g, cx - half, 3 + r, 2, 1, BR[4]); R(g, cx - half + 2, 3 + r, 2, 1, BR[3]); R(g, cx + half - 2, 3 + r, 2, 1, BR[1]); }
  R(g, cx - w / 2 + 1, 3 + h - 6, w - 2, 2, BR[1]); R(g, cx - w / 2, h - 2, w, 3, BR[3]); R(g, cx - w / 2, h - 2, w, 1, BR[4]); R(g, cx - w / 2, h, w, 1, BR[0]);
  R(g, cx - 1, h + 1, 3, 3, IRON[2]); px(g, cx, h + 3, IRON[4]);
  for (let k = 0; k < 3; k++) px(g, cx - 3 + k * 3, 3 + ri(h * 0.4), BR[0]);   /* the verdigris pits */
  return c;
}

// ---------------- FRONT PASS PIECES ----------------
function corbel(g, X, Y, w) {   /* over a ledge's SOLID tiles: a chamfered cap, and under it the stepped brackets keying it into the wall */
  R(g, X - 2, Y - 1, w + 4, 3, ST.cap); R(g, X - 2, Y - 1, w + 4, 1, '#ded0b0'); R(g, X - 2, Y + 2, w + 4, 1, ST.deep);
  for (let x = 0; x < w; x += 16) { const k = (x >> 4) & 1; R(g, X + x + 1, Y + 16, 14, 4, ST.m); R(g, X + x + 1, Y + 16, 14, 1, ST.hi); R(g, X + x + 3, Y + 20, 10, 4, ST.d); R(g, X + x + 3, Y + 20, 10, 1, ST.l); R(g, X + x + 5, Y + 24, 6, 4, ST.deep); R(g, X + x + 5, Y + 24, 6, 1, ST.m); if (k) px(g, X + x + 8, Y + 27, ST.mor); }
  R(g, X + w - 2, Y + 3, 2, 12, 'rgba(0,0,0,0.18)'); R(g, X, Y + 15, w, 1, ST.deep);
}
function pew(g, X, Y, t) {   /* facing the altar (east): the back at his west end, the seat, a kneeler, poppy-head ends; a maroon cushion; a hymnal */
  R(g, X + 2, Y - 1, 40, 1, 'rgba(0,0,0,0.3)');
  R(g, X, Y - 26, 6, 26, WD[2]); R(g, X, Y - 26, 6, 1, WD[4]); R(g, X, Y - 26, 1, 26, WD[3]); R(g, X + 5, Y - 26, 1, 26, WD[0]);   // the high back
  for (const sy of [-22, -17, -12]) { R(g, X + 1, Y + sy, 4, 3, WD[1]); R(g, X + 1, Y + sy, 4, 1, WD[3]); }
  R(g, X - 1, Y - 29, 8, 3, WD[3]); R(g, X, Y - 31, 6, 2, WD[4]); px(g, X + 3, Y - 32, BR[3]);   // the poppy-head
  R(g, X + 6, Y - 10, 34, 3, WD[3]); R(g, X + 6, Y - 10, 34, 1, WD[4]); R(g, X + 6, Y - 7, 34, 1, WD[0]);   // the seat
  R(g, X + 9, Y - 12, 14, 2, RED[1]); R(g, X + 9, Y - 12, 14, 1, RED[2]); R(g, X + 26 + (t & 1) * 3, Y - 12, 6, 2, '#e8dcc0');   // a cushion; a hymnal
  R(g, X + 38, Y - 16, 5, 16, WD[2]); R(g, X + 38, Y - 16, 5, 1, WD[4]); R(g, X + 38, Y - 16, 1, 16, WD[3]); R(g, X + 42, Y - 16, 1, 16, WD[0]); R(g, X + 37, Y - 18, 7, 2, WD[3]);   // the far end, shorter
  R(g, X + 30, Y - 4, 8, 3, WD[1]); R(g, X + 30, Y - 4, 8, 1, WD[3]);   // the kneeler
  R(g, X + 8, Y - 7, 3, 7, WD[1]); R(g, X + 26, Y - 7, 3, 7, WD[1]);
}
function altar(g, ax, Y, time) {   /* ax = centre, Y = the floor: stone table in a maroon frontal, a gilt triptych, two candles, a cup, the daub */
  R(g, ax - 26, Y - 4, 52, 4, ST.d); R(g, ax - 26, Y - 4, 52, 1, ST.l);   // the footpace
  R(g, ax - 21, Y - 22, 42, 18, ST.m); R(g, ax - 21, Y - 22, 42, 1, ST.hi); R(g, ax - 21, Y - 22, 1, 18, ST.l); R(g, ax + 20, Y - 22, 1, 18, ST.deep);
  R(g, ax - 18, Y - 20, 36, 15, RED[1]); R(g, ax - 18, Y - 20, 36, 15, RED[1]); R(g, ax - 18, Y - 20, 12, 15, RED[2]); R(g, ax + 6, Y - 20, 12, 15, RED[0]); R(g, ax - 18, Y - 20, 36, 2, BR[3]); R(g, ax - 18, Y - 7, 36, 2, BR[3]);   // the frontal and its orphreys
  R(g, ax - 1, Y - 18, 3, 11, BR[3]); R(g, ax - 5, Y - 15, 11, 2, BR[3]); px(g, ax, Y - 18, BR[4]);   // the gold cross on it, worn
  for (let x = ax - 18; x < ax + 18; x += 3) px(g, x, Y - 5, BR[3]);   // the fringe
  R(g, ax - 24, Y - 25, 48, 4, ST.cap); R(g, ax - 24, Y - 25, 48, 1, '#ded0b0'); R(g, ax - 24, Y - 22, 48, 1, ST.deep);   // the mensa slab
  R(g, ax - 19, Y - 46, 38, 21, WD[1]); R(g, ax - 19, Y - 46, 38, 1, WD[3]); R(g, ax - 19, Y - 46, 1, 21, WD[3]);   // the retable
  for (const [dx, w, h] of [[-17, 10, 18], [-5, 10, 21], [7, 10, 18]]) { R(g, ax + dx, Y - 25 - h, w, h, BR[2]); R(g, ax + dx + 1, Y - 24 - h, w - 2, h - 2, '#2a1c30'); R(g, ax + dx + 1, Y - 24 - h, w - 2, 1, BR[4]);   // three gilt panels
    R(g, ax + dx + 3, Y - 22 - h + 3, 4, 4, '#b8c8a0'); R(g, ax + dx + 2, Y - 22 - h + 7, 6, h - 10, dx === -5 ? RED[1] : '#3e5a78'); }
  R(g, ax - 15, Y - 36, 3, 1, '#c9382a'); R(g, ax - 16, Y - 35, 1, 3, '#c9382a'); R(g, ax - 14, Y - 35, 1, 2, '#c9382a'); px(g, ax - 12, Y - 34, '#8a2a24');   // a goblin's red hand, daubed across the saint
  for (const dx of [-17, 15]) { R(g, ax + dx, Y - 33, 3, 8, BR[2]); R(g, ax + dx - 1, Y - 25, 5, 1, BR[3]); R(g, ax + dx, Y - 34, 3, 2, '#f0e8c8');   // candlesticks
    const k = wave(time, 9, dx); R(g, ax + dx + 1, Y - 37, 1, 2 + ri(k * 1.4), '#ffd36b'); px(g, ax + dx + 1, Y - 38 - ri(k), '#ff8a2c'); }
  R(g, ax - 3, Y - 31, 6, 3, BR[3]); R(g, ax - 2, Y - 34, 4, 3, BR[4]); R(g, ax - 1, Y - 28, 2, 3, BR[2]);   // the cup
}
function pier(g, X, Y0, Y1, w) {   /* X = centre; a corbelled capital under the rood's boards, a banded shaft, a plinth. (Y0 = under the deck, Y1 = the floor) */
  const sh = 28, h = Y1 - Y0;
  R(g, X - sh / 2, Y0, sh, h, ST.m); R(g, X - sh / 2, Y0, 3, h, ST.hi); R(g, X - sh / 2, Y0, 1, h, ST.cap); R(g, X + sh / 2 - 5, Y0, 5, h, ST.d); R(g, X + sh / 2 - 1, Y0, 1, h, ST.deep);
  for (let y = Y0 + 12; y < Y1 - 8; y += 12) { R(g, X - sh / 2, y, sh, 1, ST.deep); R(g, X - sh / 2 + 3, y + 1, sh - 8, 1, ST.l); }   // the drums' joints
  for (const [dw, dy, col] of [[w, 0, ST.cap], [w - 14, 3, ST.hi], [w - 26, 6, ST.l], [sh + 4, 9, ST.m]]) { R(g, X - dw / 2, Y0 + dy, dw, 4, col); R(g, X - dw / 2, Y0 + dy + 3, dw, 1, ST.deep); }   // the corbel steps spreading to the boards
  R(g, X - sh / 2 - 4, Y1 - 8, sh + 8, 8, ST.l); R(g, X - sh / 2 - 4, Y1 - 8, sh + 8, 1, ST.cap); R(g, X - sh / 2 - 6, Y1 - 3, sh + 12, 3, ST.d);   // the plinth
}
function chunk(g, X, Y, w, h, s) {   /* one broken slab of the belfry floor: a rough block, a lit top, a pale fracture face, a few bits knocked off */
  R(g, X, Y, w, h, ST.m); R(g, X, Y, w, 2, ST.cap); R(g, X, Y + 2, w, 1, ST.hi); R(g, X + w - 3, Y, 3, h, ST.d); R(g, X, Y + h - 2, w, 2, ST.deep);
  for (let k = 0; k < w; k += 5) { const d = ((k * 7 + s * 5) % 5); R(g, X + k, Y + h, 4, 1 + d % 3, ST.d); R(g, X + k + 1, Y + h + 1 + d % 3, 2, 1, ST.deep); }   // the ragged underside
  R(g, X + 2 + (s % 5), Y + 4, 4, 1, ST.deep); px(g, X + 5, Y + 5, ST.l);
}
function brazierSoot(g, X, fy, time) {   /* the scorch the brazier leaves: a black pad on the boards, the wall over it sooted in a tongue, a few embers settling */
  R(g, X - 13, fy - 1, 26, 1, '#14100c'); R(g, X - 10, fy - 2, 20, 1, 'rgba(20,16,12,0.7)');
  for (let k = 0; k < 7; k++) { g.globalAlpha = 0.20 - k * 0.025; R(g, X - 8 + k, fy - 24 - k * 9, 18 - k * 2, 9, '#14100c'); } g.globalAlpha = 1;
}

// ---------------- THE PASSES main.js calls ----------------
export function drawBack(g, house, cx, cy, VW, VH, time) {
  const A = house && house.art; if (!A) return;
  safe('wall', () => { const wall = once('wall', () => bakeWall(A)), X = WALL.x0 * T - cx, Y = WALL.r0 * T - cy; if (seen(X, Y, wall.width, wall.height, VW, VH)) g.drawImage(wall, ri(X), ri(Y)); });
  safe('truss', () => { const rows = A.truss.rows;   /* the roof truss of the belfry: three tie-beams, king-posts and raking braces. Behind everything in the storey. */
    for (const [a, b] of A.truss.bays) { const L = a * T - cx, W = (b - a + 1) * T, Y = rows[0] * T - cy; if (!seen(L, Y, W, 60, VW, VH)) continue; const mid = L + W / 2;
      R(g, L, Y + 2, W, 8, WD[2]); R(g, L, Y + 2, W, 2, WD[4]); R(g, L, Y + 8, W, 2, WD[0]);
      for (let x = L + 8; x < L + W - 6; x += 24) { px(g, x, Y + 5, BR[3]); px(g, x + 1, Y + 5, BR[1]); }   // iron pegs along the beam
      R(g, mid - 3, Y + 10, 6, 34, WD[2]); R(g, mid - 3, Y + 10, 2, 34, WD[3]); R(g, mid + 2, Y + 10, 1, 34, WD[0]); R(g, mid - 4, Y + 24, 8, 3, IRON[2]); R(g, mid - 4, Y + 24, 8, 1, IRON[4]);   // the king-post, a strap round it
      for (const s of [-1, 1]) for (let k = 0; k < 26; k++) { R(g, ri(mid + s * (8 + k * 1.4)) - (s > 0 ? 0 : 1), Y + 40 - k, 3, 1, WD[1]); } } });   // the raking braces
  safe('soot', () => { for (const st of house.stages) { const fy = st.floor * T - cy; for (const z of st.braziers) { const X = ri(z.smoke * T - cx); if (seen(X - 20, fy - 80, 40, 80, VW, VH)) brazierSoot(g, X, fy, time); } } });
}
export function drawFront(g, house, cx, cy, VW, VH, time, fallen) {
  const A = house && house.art; if (!A) return;
  safe('leads', () => { const [x0, x1, row] = A.leads, X = x0 * T - cx, Y = row * T - cy, W = (x1 - x0 + 1) * T; if (!seen(X, Y - 4, W, 8, VW, VH)) return;   /* the aisle's lead roof the climb starts on */
    R(g, X, Y, W, 3, LEAD[2]); R(g, X, Y, W, 1, LEAD[3]); R(g, X, Y + 3, W, 1, LEAD[0]);
    for (let x = 20; x < W - 8; x += 52) { R(g, X + x, Y - 2, 3, 2, LEAD[3]); R(g, X + x, Y - 2, 3, 1, '#b4bac4'); R(g, X + x + 2, Y - 1, 1, 4, LEAD[0]); }   // the rolls
    for (let x = 6; x < W - 20; x += 97) { R(g, X + x, Y, 14, 1, '#aab0b8'); R(g, X + x + 2, Y + 1, 10, 1, LEAD[3]); }   // a bright new patch
    for (let x = 30; x < W - 30; x += 131) { R(g, X + x, Y, 6, 1, '#dcd8cc'); px(g, X + x + 2, Y - 1, '#dcd8cc'); }   // the birds' mark
    R(g, X + W - 7, Y - 5, 7, 5, ST.m); R(g, X + W - 7, Y - 5, 7, 1, ST.hi); R(g, X + W - 9, Y - 6, 9, 2, ST.cap); });   // the buttress's foot, where it meets the leads
  safe('corbels', () => { for (const [x0, x1, y] of A.corbels) { const X = x0 * T - cx, Y = y * T - cy, w = (x1 - x0 + 1) * T; if (seen(X - 4, Y - 2, w + 8, 34, VW, VH)) corbel(g, ri(X), ri(Y), w); } });
  safe('buttress', () => { const [x0, x1, r0, r1] = A.buttress; for (const row of A.offsets) { const X = x0 * T - cx - 3, Y = row * T - cy, w = (x1 - x0 + 1) * T + 6; if (!seen(X, Y - 4, w, 22, VW, VH)) continue;
      R(g, X, Y, w, 3, ST.cap); R(g, X, Y, w, 1, '#ded0b0'); R(g, X + 1, Y + 3, w - 2, 1, ST.deep); for (let k = 0; k < 5; k++) R(g, X + 2 + k, Y + 4 + k, w - 4 - k * 2, 1, ST.l);   // a set-off: a weathered slope under the cap, shading down to the face
      R(g, X + w - 3, Y + 4, 3, 12, 'rgba(0,0,0,0.2)'); } });
  safe('sill', () => { const [x0, x1, row] = A.sill, X = x0 * T - cx, Y = row * T - cy, W = (x1 - x0 + 1) * T; if (!seen(X - 4, Y - 4, W + 8, 36, VW, VH)) return;   /* the bell-cote's sill: a moulded stone cill standing out of the gable, dentils under it */
    R(g, X - 3, Y - 2, W + 6, 4, ST.cap); R(g, X - 3, Y - 2, W + 6, 1, '#ded0b0'); R(g, X - 3, Y + 2, W + 6, 1, ST.deep);
    for (let x = 0; x < W; x += 6) { R(g, X + x, Y + 16, 4, 4, ST.hi); R(g, X + x, Y + 16, 4, 1, ST.cap); R(g, X + x + 3, Y + 17, 1, 3, ST.deep); } R(g, X, Y + 15, W, 1, ST.deep); });
  safe('bells', () => { const bell = once('bell', () => bakeBell()); for (const [bx, by, v] of A.bells) {   /* the bell-cote's bells, hung in their frames (deco bellFrame at the same tiles): bronze, each swinging a hair on its own beat */
      const X = bx * T + 8 - cx, Y = (by + 1) * T - 30 - cy, sw = ri(Math.sin(time * 1.3 + v * 2) * 1.2); if (!seen(X - 20, Y, 40, 40, VW, VH)) continue; g.drawImage(bell, ri(X - bell.width / 2 + sw), ri(Y + 3)); R(g, X - 10, Y + 3, 20, 2, WD[1]); R(g, X - 10, Y + 3, 20, 1, WD[3]); } });
  safe('pews', () => { for (const [x, row, i] of A.pews) { const X = x * T - cx + 2, Y = row * T - cy; if (seen(X, Y - 34, 46, 34, VW, VH)) pew(g, ri(X), ri(Y), i); } });
  safe('piers', () => { const [d0, fl] = A.piersY; for (const [x0, x1] of A.piers) { const X = ri((x0 + x1 + 1) * T / 2 - cx); if (seen(X - 44, d0 * T - cy, 88, (fl - d0) * T, VW, VH)) pier(g, X, ri(d0 * T + 4 - cy), ri(fl * T - cy), (x1 - x0 + 1) * T - 8); } });
  safe('rood', () => { const [x0, x1, row] = A.rood, X = x0 * T - cx, Y = row * T + 4 - cy, W = (x1 - x0 + 1) * T; if (!seen(X, Y - 20, W, 40, VW, VH)) return;
    R(g, X, Y, W, 7, WD[2]); R(g, X, Y, W, 2, WD[4]); R(g, X, Y + 5, W, 2, WD[0]);   // the rood beam's carved fascia
    for (let x = 4; x < W - 4; x += 12) { R(g, X + x, Y + 2, 6, 3, BR[1]); px(g, X + x + 2, Y + 3, BR[4]); }   // gilt roundels
    for (let x = 0; x < W; x += 8) { const sc = (x >> 3) & 1; R(g, X + x, Y + 7, 8, 5 + sc * 2, RED[1]); R(g, X + x, Y + 7, 8, 1, BR[3]); R(g, X + x + 1, Y + 8, 2, 4 + sc * 2, RED[2]); R(g, X + x + 3, Y + 12 + sc * 2, 2, 1, BR[3]); }   // the valance hung from it, scalloped, fringed in gold
    R(g, X - 3, Y - 4, 3, 11, ST.l); R(g, X + W, Y - 4, 3, 11, ST.l); });
  safe('altar', () => { const [ax, floor] = A.altar, X = ax * T + 8 - cx, Y = floor * T - cy; if (seen(X - 30, Y - 50, 60, 54, VW, VH)) altar(g, ri(X), ri(Y), time); });
  safe('hole', () => { const [x0, x1, row] = A.hole, L = x0 * T - cx, Rr = (x1 + 1) * T - cx, Y = row * T - cy;
    if (!fallen) { if (seen(L, Y - 2, Rr - L, 20, VW, VH)) for (const k of [0.2, 0.55, 0.8]) { g.globalAlpha = 0.5; R(g, ri(L + (Rr - L) * k), Y + 2, 1, 3 + ((k * 40) | 0) % 4, '#2a1c0c'); g.globalAlpha = 1; } return; }   // whole: only the hairline cracks the vault is wearing
    if (!seen(L - 24, Y - 40, Rr - L + 48, 200, VW, VH)) return;
    const shaft = 0.12 + 0.06 * wave(time, 1.1); g.globalAlpha = shaft; for (let y = 0; y < 150; y += 2) R(g, ri(L + 4 - y * 0.04), Y + 18 + y, ri(Rr - L - 8 + y * 0.08), 2, '#ffe0a0'); g.globalAlpha = 1;   // the belfry's light falling through the hole
    for (const s of [-1, 1]) { const ex = s < 0 ? L : Rr;   // the broken lips either side: teeth of the vault, snapped joists sticking out
      for (let k = 0; k < 6; k++) { const tw = 5 + ((k * 7 + (s > 0 ? 2 : 0)) % 6), ty = Y + 15 + k * 3 + (k & 1); R(g, s < 0 ? ex : ex - tw, ty, tw, 4, k & 1 ? ST.d : ST.l); R(g, s < 0 ? ex : ex - tw, ty, tw, 1, ST.cap); R(g, s < 0 ? ex : ex - tw, ty + 3, tw, 1, ST.mor); }
      R(g, s < 0 ? ex + 1 : ex - 9, Y + 20, 8, 3, WD[1]); R(g, s < 0 ? ex + 1 : ex - 9, Y + 20, 8, 1, WD[4]); R(g, s < 0 ? ex + 7 : ex - 11, Y + 19, 2, 5, WD[0]); }   // a snapped joist
    for (let k = 0; k < 8; k++) { const u = (time * 0.55 + k * 0.125) % 1; g.globalAlpha = 0.7 * (1 - u); R(g, ri(L + 6 + ((k * 23) % (Rr - L - 10))), ri(Y + 20 + u * 140), 1, 2, k & 1 ? '#d8d0c0' : '#a49c8c'); } g.globalAlpha = 1; });   // dust still sifting down
  safe('rubble', () => { if (!fallen) return; A.rubble.forEach(([x0, x1, row], i) => { const X = x0 * T - cx, Y = row * T - cy, w = (x1 - x0 + 1) * T; if (!seen(X - 8, Y - 10, w + 16, 40, VW, VH)) return;
      let x = 0; for (let k = 0; x < w; k++) { const cw = 14 + ((k * 5 + i * 3) % 9), ch = 10 + ((k * 3 + i) % 4); chunk(g, ri(X + x), ri(Y - 3 + (k & 1) * 3), Math.min(cw, w - x + 3), ch, k + i); x += cw - 3; }   // the slabs, lying slewed across one another
      for (let k = 0; k < 6; k++) { const bx = ri(X - 4 + ((k * 31 + i * 17) % (w + 8))), by = Y - 3 - (k & 1) * 2; R(g, bx, by, 3 + (k & 1), 3, ST.m); R(g, bx, by, 3 + (k & 1), 1, ST.cap); }   // broken bits on top, small
      R(g, ri(X + 6), Y + 8, 14, 2, WD[1]); R(g, ri(X + 6), Y + 8, 14, 1, WD[4]); }); });   // a splintered joist ended in the pile
}

// ---------------- FX called from src/false-abbot.js ----------------
export function pealRing(g, wx, wy, dir, time) {   /* the peal's ring on the boards, wx/wy = where it stands on screen, dir = which way it runs: a bronze wall of sound, its trail kicked off the planks */
  const d = dir < 0 ? -1 : 1, k = ri(time * 20) & 3;
  for (let i = 0; i < 4; i++) { const h = [13, 10, 7, 5][i], x = wx - d * i * 4 - (d > 0 ? 3 : 0); g.globalAlpha = 0.95 - i * 0.2; R(g, x, wy - h, 3, h, i === 0 ? BR[4] : i === 1 ? BR[3] : BR[2]); if (i === 0) R(g, x + (d > 0 ? 2 : 0), wy - h - 1, 1, 1, '#fff0b0'); }
  g.globalAlpha = 0.5; R(g, wx - d * 20 - (d > 0 ? 0 : 0), wy - 1, 20, 1, BR[3]); g.globalAlpha = 0.3; R(g, wx - d * 34, wy - 1, 14, 1, BR[2]); g.globalAlpha = 1;
  for (let i = 0; i < 3; i++) R(g, wx - d * (6 + i * 7 + k), wy - 3 - ((i + k) % 3) * 2, 2, 1, '#d8d0c0');   // the dust
  for (let i = 0; i < 2; i++) { R(g, wx + d * (3 + i * 3), wy - 15 - i * 2, 1, 2, BR[4]); }   // the sparks of the note running on ahead
}
export function kindleFlare(g, sx, fy, k, time) {   /* the brazier CATCHING as he kneels at it: k 0..1 over the tell. The coals flare gold, tongues leap, sparks fly. */
  const f = Math.max(0, Math.min(1, k)), bowl = fy - 10;
  g.globalAlpha = 0.12 * f; for (let r = 4; r >= 1; r--) R(g, sx - 3 - r * 2, bowl - 3 - r * 3, 6 + r * 4, 3 + r * 2, '#ff8a2c');
  for (const [dx, h, col] of [[-5, 7, '#ff7a2c'], [-2, 11, '#ffb347'], [1, 14, '#ffe08a'], [4, 9, '#ffb347'], [6, 5, '#ff7a2c']]) { const hh = ri(h * f * (0.75 + 0.25 * wave(time, 14, dx))); g.globalAlpha = 0.9; R(g, sx + dx, bowl - hh, 2, hh, col); R(g, sx + dx, bowl - hh - 1, 1, 1, '#fff0c0'); }
  g.globalAlpha = 1;
  for (let i = 0; i < 6; i++) { const u = (time * 1.4 + i / 6) % 1; if (u > f + 0.2) continue; g.globalAlpha = 1 - u; R(g, ri(sx - 8 + i * 3 + Math.sin(time * 9 + i) * 3), ri(bowl - 4 - u * 34), 1, 1, i & 1 ? '#ffe08a' : '#ff9a3c'); } g.globalAlpha = 1;
}
export { bakeWall, bakeBell, pew as drawPew, altar as drawAltar, pier as drawPier, chunk as drawChunk, WALL };
