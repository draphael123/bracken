// fen_backdrop.js - THE FEN ROAD's OWN BACKDROP (claude/fenroad2art; Daniel 10-22: the Fen Road is "visually a lot weaker" - bring it to Rootway / Lumber Trail grade).
// The road wore the shared round-canopied forest; it now has a FEN behind it: a hazy far line of bald cypress with far stilt huts and their lanterns, the Stockade's palisade
// growing between the far and the mid layers (the caller's callback), a MID row of great bald cypress - fluted trunks flaring to a root-flare ringed with KNEES, flat feathery
// crowns, long moss CURTAINS hanging and swaying - their reflections lying in the murky water, layered ground mist (a far bank, a mid bank, a low drift in front), near boughs and
// trunks hung with moss at the edges, a heron in the shallows, a heron crossing the sky now and then, and dragonflies over the reeds. By area (src/fen-road.js SECTIONS) the tint
// moves: THE PEAT CUTTINGS olive and bright, THE WORK CREWS green-brown with the crews' lanterns, THE STILT POSTS dark teal and thick, THE PALISADE ROAD smoke and torch-red,
// THE TROLL'S CROSSING grey and bare. Every static picture is baked ONCE; a frame is ~40 drawImage calls. ART ONLY: nothing here reads or changes a hitbox or a number.
//   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full, palisade)   far + palisade + mid layers (palisade: () => draws the Stockade's skyline)
//   drawNear(g, cx, cy, VW, VH, L, time, dY)                       near boughs, trunks, the low drift, dragonflies
//   drawReflections(g, cx, cy, VW, VH, time, dY, x0, x1, y)        the mid row mirrored into a pool (called per pool, clipped by the caller)
//   drawHeron(g, cx, cy, time, px)                                 the heron standing in the shallows (world-anchored, behind the tiles)
import { canvas, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const hx = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + hx(A[0] + (B[0] - A[0]) * t) + hx(A[1] + (B[1] - A[1]) * t) + hx(A[2] + (B[2] - A[2]) * t); };

/* THE AREAS (tiles, src/fen-road.js SECTIONS) and each one's look: [x0, x1, tint index, density 0..100 of the mid row, mist k, lanterns?] */
const ZONES = [[0, 104, 0, 46, 0.9, 0], [105, 210, 1, 56, 0.7, 1], [211, 310, 2, 78, 0.85, 1], [311, 404, 3, 64, 0.6, 1], [405, 460, 4, 40, 1.0, 0]];
const zoneOf = t => { for (let i = 0; i < ZONES.length; i++) if (t <= ZONES[i][1]) return i; return ZONES.length - 1; };
/* the tints: [foliage lit, body, shade, trunk, trunk lit, trunk dark, moss, far haze] */
const TINT = [
  ['#86a45a', '#5f8444', '#3f6034', '#5a4a38', '#8a7656', '#33291f', '#a9b88a', '#a2b09a'],   /* the cuttings: olive, bright */
  ['#6f9460', '#4c7048', '#325434', '#54443a', '#7e6c56', '#2e251f', '#9db08c', '#94a69a'],   /* the crews: green-brown */
  ['#4f7a66', '#365c50', '#244036', '#463c36', '#6c5f52', '#241e1c', '#8aa092', '#8398a0'],   /* the stilt posts: dark teal */
  ['#7a7a52', '#585a3c', '#3c3e2c', '#4e3c30', '#7a604a', '#2a1f1a', '#a39a7a', '#a29a88'],   /* the palisade road: smoke and rust */
  ['#6f7e70', '#4c5a50', '#36423c', '#403c3a', '#675f58', '#26221f', '#8e9a92', '#9099a0'],   /* the crossing: grey */
];

/* ------------------------------------------------------------------ baked pieces ------------------------------------------------------------------ */
/* a feathery cypress foliage cluster: a flat spray of drooping needle-clumps, lit on top */
function spray(g, x, y, w, h, T, r) {
  for (let i = 0; i < w * 1.4; i++) { const px = x - w / 2 + r() * w, e = 1 - Math.abs(px - x) / (w / 2), py = y + (1 - e) * 2 + r() * h * e, c = r() < 0.4 ? T[0] : r() < 0.7 ? T[1] : T[2];
    R(g, c, px, py, 1 + (r() < 0.5 ? 1 : 0), 1 + (r() < 0.35 ? 1 : 0)); }
  R(g, T[0], x - w / 2 + 2, y + 1, w - 4, 1);
}
/* the MID bald cypress: 84 x 170, trunk foot at the bottom centre; fluted trunk flaring at the root, knees round the foot, boughs and a flat crown at the top */
function bakeMidCypress(seed, ti) {
  const T = TINT[ti], W = 84, H = 170, CXs = 42, r = mulberry(seed * 17 + ti * 101 + 3), [c, g] = canvas(W, H), flare = 38;
  for (let y = 24; y < H; y++) { const t = (y - 24) / (H - 24), w = 3.4 + t * 2.4 + (y > H - flare ? Math.pow((y - (H - flare)) / flare, 1.7) * 11 : 0), xl = Math.round(CXs - w), wd = Math.round(w * 2);
    R(g, T[3], xl, y, wd, 1); R(g, T[4], xl, y, Math.max(1, wd >> 2), 1); R(g, T[5], xl + wd - Math.max(1, wd >> 2), y, Math.max(1, wd >> 2), 1);
    if (wd > 7) for (let f = 1; f < 3; f++) if (((y >> 3) + f * 5 + seed) % 4 !== 0) R(g, T[5], xl + Math.round(wd * f / 3), y, 1, 1);   /* the flutes: broken dark lines down the trunk */ }
  /* the waterline's stain at the foot and the roots splaying */
  for (let i = 0; i < 6; i++) { const d = i % 2 ? 1 : -1, len = 6 + ((r() * 8) | 0); for (let k = 0; k < len; k++) R(g, T[5], CXs + d * (13 + k), H - 1 - Math.round(k * 0.35), 1, 1 + (k < 3 ? 1 : 0)); }
  /* the KNEES: small woody cones standing up out of the water around the tree */
  for (let i = 0; i < 7; i++) { const kx = CXs + (i - 3) * 11 + ((r() * 7) | 0) - 3, kh = 5 + ((r() * 9) | 0), kw = 2 + (kh > 9 ? 1 : 0);
    for (let y = 0; y < kh; y++) { const w = Math.max(1, Math.round(kw * (y + 1) / kh)); R(g, T[3], kx - w + 1, H - 1 - kh + y, w * 2, 1); R(g, T[4], kx - w + 1, H - 1 - kh + y, 1, 1); R(g, T[5], kx + w - 1, H - 1 - kh + y, 1, 1); } }
  /* the boughs: horizontal limbs, each ending in a flat spray; the crown a broad flat cap */
  const limbs = [[-1, 44, 22], [1, 50, 26], [-1, 66, 15], [1, 72, 19], [-1, 30, 30], [1, 34, 34]];
  for (const [d, ly, ll] of limbs) { const len = ll + ((r() * 8) | 0); for (let k = 0; k < len; k++) { const yy = ly - Math.round(k * 0.22); R(g, T[5], CXs + d * (3 + k), yy, 1, 2); if (k % 5 === 0) R(g, T[3], CXs + d * (3 + k), yy, 1, 1); }
    spray(g, CXs + d * (len + 2), ly - 5, 22, 9, T, r); spray(g, CXs + d * (len * 0.55), ly - 4, 17, 7, T, r); }
  spray(g, CXs, 12, 46, 14, T, r); spray(g, CXs - 15, 20, 26, 10, T, r); spray(g, CXs + 15, 18, 26, 10, T, r);
  return c;
}
/* the MOSS curtains of one tree (a separate sprite: it sways): strands hanging off the limbs, grey-green, ragged, some pale */
function bakeMoss(seed, ti) {
  const T = TINT[ti], W = 84, H = 80, r = mulberry(seed * 29 + ti * 7 + 11), [c, g] = canvas(W, H);
  for (const [d, ly, ll] of [[-1, 44, 22], [1, 50, 26], [-1, 66, 15], [1, 72, 19], [-1, 30, 30], [1, 34, 34]]) {
    for (let i = 0; i < 5; i++) { const x = 42 + d * (8 + ((r() * ll) | 0)), y0 = Math.max(0, ly - 30 - 0), len = 9 + ((r() * 26) | 0), top = Math.min(H - len - 1, Math.max(0, ly - 30 + 4));
      for (let k = 0; k < len; k++) { const sway = Math.round(Math.sin(k * 0.45 + i) * 1.2); R(g, k < 3 ? T[6] : k > len - 5 ? mix(T[6], T[1], 0.5) : mix(T[6], T[2], 0.35), x + sway + (k > len - 4 && r() < 0.5 ? 1 : 0), top + k, 1, 1); if (r() < 0.22) R(g, mix(T[6], '#e6efe0', 0.4), x + sway + 1, top + k, 1, 1); } void y0; } }
  return c;
}
/* a FAR cypress: a thin pale trunk, a broad flat crown, drawn in haze */
function bakeFarCypress(seed, ti) {
  const T = TINT[ti], H = 70 + (seed % 5) * 8, W = 56, r = mulberry(seed * 5 + 9), [c, g] = canvas(W, H), hz = T[7], hzD = mix(hz, '#5a6a64', 0.35), hzL = mix(hz, '#dfe8dc', 0.35);
  for (let y = 18; y < H; y++) { const w = 1.4 + (y > H - 14 ? (y - (H - 14)) * 0.28 : 0) + (y - 18) * 0.02; R(g, hzD, Math.round(28 - w), y, Math.round(w * 2), 1); }
  for (let i = 0; i < 130; i++) { const px = 28 + (r() - 0.5) * 46, e = 1 - Math.abs(px - 28) / 23, py = 8 + (1 - e) * 5 + r() * 10 * e; R(g, r() < 0.3 ? hzL : r() < 0.6 ? hz : hzD, px, py, 2, 1); }
  for (let i = 0; i < 16; i++) { const px = 28 + (r() - 0.5) * 40; R(g, hzD, px, 16 + r() * 6, 1, 3 + ((r() * 4) | 0)); }   /* the drooping moss ends */
  return c;
}
/* a far STILT HUT: four poles in the water, a floor, a lean thatched hut, a ladder, a lantern hung at the door (its glow is drawn live) */
function bakeFarHut(ti) {
  const T = TINT[ti], hz = T[7], dark = mix(hz, '#46514c', 0.55), mid = mix(hz, '#46514c', 0.3), W = 40, H = 40, [c, g] = canvas(W, H);
  for (const x of [5, 12, 26, 33]) { R(g, dark, x, 22, 2, 18); } R(g, mid, 3, 21, 34, 2); R(g, dark, 3, 23, 34, 1); R(g, mid, 8, 31, 26, 1);   /* poles, floor, a brace */
  R(g, dark, 6, 12, 26, 9); for (let y = 0; y < 8; y++) R(g, y < 2 ? mid : dark, 3 + y, 12 - y, 32 - y * 2, 1);   /* the hut, the thatch roof */
  R(g, mix(dark, '#000000', 0.4), 14, 14, 6, 7); R(g, mid, 22, 15, 5, 3); R(g, dark, 8, 8, 1, 4);   /* the door, a window, a smoke pipe */
  R(g, dark, 31, 24, 1, 10); R(g, dark, 33, 24, 1, 10); for (let y = 26; y < 34; y += 2) R(g, mid, 31, y, 3, 1);   /* the ladder */
  return c;
}
/* a heron: standing (neck in an S, long legs) - two heads: 0 up, 1 down to the water; 14 x 34 */
function bakeHeron(f) {
  const [c, g] = canvas(16, 36), B = '#7e8a8e', BD = '#4a545a', BL = '#c2ccd0', Y = '#d8b45a';
  R(g, BD, 7, 25, 1, 11); R(g, BD, 10, 25, 1, 11); R(g, BD, 6, 35, 3, 1); R(g, BD, 9, 35, 3, 1);   /* legs */
  for (let y = 0; y < 9; y++) { const w = y < 3 ? 3 + y : 7 - (y - 3) * 0.6; R(g, y < 2 ? BL : B, 5 + (y < 3 ? -y * 0.3 : 0), 17 + y, Math.round(w) + 2, 1); }   /* the body */
  R(g, BD, 4, 20, 2, 5); R(g, BD, 3, 22, 2, 3);   /* the folded wing / tail */
  if (!f) { for (let y = 0; y < 14; y++) R(g, BL, 10 + (y > 6 ? 1 : 0) - (y > 11 ? 1 : 0), 17 - y, 1, 1); R(g, B, 10 + 1, 4, 1, 8); R(g, BD, 10, 3, 4, 2); R(g, Y, 13, 3, 3, 1); R(g, '#222', 11, 3, 1, 1); R(g, BD, 8, 1, 1, 3); }
  else { for (let y = 0; y < 9; y++) R(g, BL, 10, 17 - y + 2, 1, 1); R(g, BL, 11, 9, 2, 1); R(g, BL, 12, 10, 1, 8); R(g, BD, 11, 17, 2, 2); R(g, Y, 12, 19, 1, 6); R(g, BD, 12, 25, 1, 1); }
  return c;
}
/* a flying heron (far, in the sky): wings up / down, 22 x 12 */
function bakeFlyHeron(f) { const [c, g] = canvas(24, 14), B = '#5a666c'; R(g, B, 9, 6, 7, 2); R(g, B, 16, 6, 5, 1); R(g, B, 21, 6, 2, 1); R(g, B, 5, 7, 4, 1);
  if (f) { for (let i = 0; i < 9; i++) R(g, B, 9 + i, 5 - Math.round(i * 0.6), 1, 1 + (i < 4 ? 1 : 0)); } else { for (let i = 0; i < 9; i++) R(g, B, 9 + i, 8 + Math.round(i * 0.5), 1, 1 + (i < 4 ? 1 : 0)); } return c; }
/* a dragonfly: a thin blue-green body and a flicker of wings; 8 x 6 per frame */
function bakeFly(f) { const [c, g] = canvas(9, 7); R(g, '#3a7a8a', 1, 3, 6, 1); R(g, '#8fd0d8', 6, 3, 1, 1); R(g, '#e6f4f0', 2, f ? 0 : 5, 3, 1); R(g, '#e6f4f0', 4, f ? 1 : 6, 3, 1); R(g, '#bfe6e8', 3, f ? 1 : 4, 3, 1); return c; }
/* a soft band: a 1 x 48 vertical gradient (mist), stretched across the view */
function bakeMist(rgb, a) { const [c, g] = canvas(1, 48); for (let y = 0; y < 48; y++) { const k = Math.sin((y / 47) * Math.PI); g.fillStyle = 'rgba(' + rgb + ',' + (k * k * a).toFixed(3) + ')'; g.fillRect(0, y, 1, 1); } return c; }
/* a long drifting wisp (for the low drift in front): 200 x 20, soft-edged */
function bakeDrift() { const [c, g] = canvas(200, 20); for (let x = 0; x < 200; x++) { const h = 4 + 3 * Math.sin(x * 0.07) + 2.5 * Math.sin(x * 0.19 + 2) + 1.5 * Math.sin(x * 0.41); for (let y = 0; y < 20; y++) { const d = Math.abs(y - 10) / Math.max(1, h); if (d < 1) { g.globalAlpha = (1 - d) * 0.30; g.fillStyle = '#e4ece2'; g.fillRect(x, y, 1, 1); } } } g.globalAlpha = 1; return c; }
/* a NEAR trunk: a dark, wide cypress trunk with its flare and moss hung from a limb at the top; 40 x 256 */
function bakeNearTrunk(seed, ti) {
  const T = TINT[ti], W = 48, H = 256, r = mulberry(seed * 13 + ti * 3 + 5), [c, g] = canvas(W, H), cxs = 24, dark = mix(T[5], '#0c0a08', 0.4);
  for (let y = 0; y < H; y++) { const w = 6 + (y > 208 ? Math.pow((y - 208) / 48, 1.6) * 12 : 0), xl = Math.round(cxs - w), wd = Math.round(w * 2);
    R(g, mix(T[3], '#0c0a08', 0.3), xl, y, wd, 1); R(g, T[3], xl, y, 2, 1); R(g, dark, xl + wd - 3, y, 3, 1); if (r() < 0.25) R(g, dark, xl + 2 + ((r() * (wd - 4)) | 0), y, 1, 2 + ((r() * 3) | 0)); }
  for (let i = 0; i < 9; i++) { const d = i % 2 ? 1 : -1, y0 = 8 + ((r() * 60) | 0), len = 10 + ((r() * 40) | 0), x = cxs + d * (8 + ((r() * 8) | 0)); for (let k = 0; k < len; k++) { const sway = Math.round(Math.sin(k * 0.4 + i) * 1.4); R(g, k < 3 ? '#96a882' : k > len - 6 ? '#728a6c' : '#84987a', x + sway, y0 + k, 1, 1); if (r() < 0.25) R(g, '#c8d8bc', x + sway + 1, y0 + k, 1, 1); } }
  return c;
}
/* the HANGING MOSS curtain at the top edge of the screen (a near spray, 60 wide), swaying */
function bakeCurtain(seed) { const [c, g] = canvas(64, 70), r = mulberry(seed * 23 + 1); R(g, '#2a2a20', 0, 0, 64, 2);
  for (let i = 0; i < 22; i++) { const x = 2 + ((r() * 60) | 0), len = 8 + ((r() * 50) | 0) * (1 - Math.abs(x - 32) / 55); for (let k = 0; k < len; k++) { const sway = Math.round(Math.sin(k * 0.3 + i * 1.7) * 1.4); R(g, k < 4 ? '#4e5a40' : k > len - 7 ? '#8a9c80' : '#6a7c5c', x + sway, 2 + k, 1, 1); if (r() < 0.2) R(g, '#aec0a0', x + sway + 1, 2 + k, 1, 1); } }
  return c; }

/* ------------------------------------------------------------------ placement ------------------------------------------------------------------ */
const farBase = (VH, dY) => Math.round(VH * 0.5 + dY * 0.05), midBase = (VH, dY) => Math.round(VH * 0.62 + dY * 0.12);
/* the mid row in view: [{ sx, ti, v, hh }] at parallax f (a deterministic world-anchored list) */
function midRow(cx, VW, VH, dY, f = 0.3) {
  const out = [], mid = cx + VW / 2, s = 46, i0 = Math.floor((mid * f - VW / 2 - 50) / s), i1 = Math.ceil((mid * f + VW / 2 + 50) / s), mb = midBase(VH, dY);
  for (let i = i0; i <= i1; i++) { const hs = hash(i, 71), U = i * s + (hs % 22), t = (U / f) / 16, z = zoneOf(t), dens = ZONES[z][3]; if ((hs >>> 5) % 100 >= dens) continue;
    out.push({ sx: Math.round(VW / 2 + U - mid * f), ti: ZONES[z][2], v: hs % 5, hh: mb, hs }); }
  return out;
}

/* ------------------------------------------------------------------ the frame ------------------------------------------------------------------ */
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full, palisade) {
  const mid = cx + VW / 2, fb = farBase(VH, dY), mb = midBase(VH, dY), tM = mid / 16, zi = zoneOf(tM), zk = ZONES[zi][4];
  /* ---------------- FAR (0.12): hazy cypress line, far stilt huts and their lanterns ---------------- */
  if (full) {
    g.fillStyle = mix('#a2aea4', '#8a9a94', zi / 4); g.globalAlpha = 0.55; g.fillRect(0, fb - 6, VW, VH - fb + 40); g.globalAlpha = 1;   /* the far fen floor: a haze */
    const f = 0.12, s = 30, i0 = Math.floor((mid * f - VW / 2 - 30) / s), i1 = Math.ceil((mid * f + VW / 2 + 30) / s);
    for (let i = i0; i <= i1; i++) { const hs = hash(i, 13), U = i * s + (hs % 14), t = (U / f) / 16, z = zoneOf(t), sx = Math.round(VW / 2 + U - mid * f);
      if ((hs >>> 4) % 100 > 60 + ZONES[z][3] * 0.3) continue;
      const sp = once('fc' + (hs % 5) + 't' + ZONES[z][2], () => bakeFarCypress(hs % 5 + 1, ZONES[z][2])); g.drawImage(sp, sx - 28, fb - sp.height + 4 + (hs % 4)); }
    /* the far stilt huts: world-anchored every ~50 tiles in the crews' and the stilts' reaches, a lantern at each door */
    for (let n = Math.floor((tM - 60) / 28); n <= Math.ceil((tM + 60) / 28); n++) { const hs = hash(n, 97), t = n * 28 + (hs % 16), z = zoneOf(t); if (!ZONES[z][5] || (hs >>> 6) % 3 === 0) continue;
      const sx = Math.round(VW / 2 + (t * 16 - mid) * 0.12), ti = ZONES[z][2]; if (sx < -40 || sx > VW + 40) continue;
      g.globalAlpha = 0.9; g.drawImage(once('hut' + ti, () => bakeFarHut(ti)), sx - 20, fb - 34); g.globalAlpha = 1;
      const fl = 0.7 + 0.3 * Math.sin(time * 5.3 + n * 2.1) * Math.sin(time * 2.2 + n); g.globalAlpha = 0.22 * fl; g.fillStyle = '#ffcf6a'; g.fillRect(sx - 3, fb - 22, 8, 8); g.globalAlpha = 0.9; g.fillStyle = '#ffd77a'; g.fillRect(sx, fb - 19, 2, 2); g.globalAlpha = 1; }
    /* a heron crossing the sky now and then (one pass a ~46 s cycle) */
    { const T = 46, ph = ((time + 11) % T) / T; if (ph < 0.3) { const k = ph / 0.3, hxp = Math.round(-30 + k * (VW + 60)), hyp = Math.round(fb - 70 - Math.sin(k * Math.PI) * 14 + dY * 0.02); g.globalAlpha = 0.6; g.drawImage(once('fh' + (Math.floor(time * 3) & 1), () => bakeFlyHeron(Math.floor(time * 3) & 1)), hxp, hyp); g.globalAlpha = 1; } }
  }
  /* a pale bank of mist standing between the far line and the mid row (it drifts) */
  { const ph = Math.sin(time * 0.12) * 12; g.globalAlpha = Math.min(1, 0.55 * zk + 0.15); g.drawImage(once('mA', () => bakeMist('214,224,214', 0.62)), 0, 0, 1, 48, Math.round(ph) - 14, fb - 30, VW + 28, 50); g.globalAlpha = 1; }
  /* THE STOCKADE grows on the horizon (the caller draws it here, behind the mid cypress and in front of the far line) */
  if (palisade) palisade();
  /* ---------------- MID (0.30): the great cypress with their moss, and the fen floor ---------------- */
  /* the fen floor behind the row: a dark green-brown band with a hazy top edge (the shallows, the knees' water) */
  { const ti = ZONES[zi][2]; g.globalAlpha = 0.75; g.fillStyle = mix(TINT[ti][2], '#16221e', 0.5); g.fillRect(0, mb - 1, VW, VH - mb + 40); g.globalAlpha = 0.35; g.fillStyle = TINT[ti][7]; g.fillRect(0, mb - 1, VW, 1); g.globalAlpha = 1; }
  for (const o of midRow(cx, VW, VH, dY, 0.3)) {
    const sp = once('mc' + o.v + 't' + o.ti, () => bakeMidCypress(o.v + 1, o.ti)); g.drawImage(sp, o.sx - 42, mb - sp.height + 2 - (o.hs & 3));
    const ms = once('mm' + o.v + 't' + o.ti, () => bakeMoss(o.v + 1, o.ti)), sw = Math.round(Math.sin(time * 0.55 + o.hs * 0.01) * 1.2); g.globalAlpha = 0.95; g.drawImage(ms, o.sx - 42 + sw, mb - sp.height + 2 - (o.hs & 3) + 40); g.globalAlpha = 1; }
  /* a low bank of mist laid over the mid foot: the ground mist, in front of the trunks */
  { const ph = Math.sin(time * 0.17 + 1) * 16; g.globalAlpha = Math.min(1, 0.7 * zk); g.drawImage(once('mB', () => bakeMist('206,220,208', 0.5)), 0, 0, 1, 48, Math.round(ph) - 16, mb - 34, VW + 32, 48); g.globalAlpha = 1; }
}

/* the mid row mirrored into the water: each tree upside down from the water's far line, dimmed, with a shimmer; (x0, x1, y) is the pool's visible span and its surface row on the screen */
export function drawReflections(g, cx, cy, VW, VH, time, dY, x0, x1, y) {
  const mb = midBase(VH, dY);
  for (const o of midRow(cx, VW, VH, dY, 0.3)) { const sp = once('mc' + o.v + 't' + o.ti, () => bakeMidCypress(o.v + 1, o.ti)); if (o.sx + 42 < x0 || o.sx - 42 > x1) continue;
    const sh = Math.round(Math.sin(time * 1.3 + o.sx * 0.2) * 1), top = Math.max(mb, y - 1);
    g.save(); g.globalAlpha = 0.13; g.translate(o.sx - 42 + sh, mb + 3); g.scale(1, -0.55); g.drawImage(sp, 0, -sp.height, sp.width, sp.height); g.restore(); void top; }
  /* the far huts' lanterns, doubled in the water as a warm broken streak */
  const fb = farBase(VH, dY), mid = cx + VW / 2, tM = mid / 16;
  for (let n = Math.floor((tM - 60) / 28); n <= Math.ceil((tM + 60) / 28); n++) { const hs = hash(n, 97), t = n * 28 + (hs % 16), z = zoneOf(t); if (!ZONES[z][5] || (hs >>> 6) % 3 === 0) continue;
    const sx = Math.round(VW / 2 + (t * 16 - mid) * 0.12); if (sx < x0 || sx > x1) continue; const fl = 0.7 + 0.3 * Math.sin(time * 4.1 + n);
    for (let k = 0; k < 4; k++) { g.globalAlpha = 0.28 * fl * (1 - k / 4); g.fillStyle = '#ffd77a'; g.fillRect(sx - 1 + Math.round(Math.sin(time * 2 + k * 2 + n) * 2), Math.max(y + 3 + k * 3, fb + 20 + k * 3), 2 + (k & 1), 1); } }
  g.globalAlpha = 1;
}

/* ---------------- NEAR (0.55): the dark trunks you walk past and the moss over the top of the frame ---------------- */
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  const mid = cx + VW / 2, f = 0.55, s = 120, i0 = Math.floor((mid * f - VW / 2 - 30) / s), i1 = Math.ceil((mid * f + VW / 2 + 30) / s), yoff = Math.round(VH - 256 + Math.min(76, dY * 0.17)), tM = mid / 16;
  for (let i = i0; i <= i1; i++) { const hs = hash(i, 41), U = i * s + (hs % 60), t = (U / f) / 16, z = zoneOf(t), sx = Math.round(VW / 2 + U - mid * f), keep = ZONES[z][3] * 0.55;
    if ((hs >>> 4) % 100 >= keep) continue; const ti = ZONES[z][2];
    g.globalAlpha = 0.6; g.drawImage(once('nt' + (hs % 3) + 't' + ti, () => bakeNearTrunk(hs % 3 + 1, ti)), sx - 24, yoff); g.globalAlpha = 1; }
  /* the hanging moss across the top of the frame, swaying (sparse, never over the road) */
  { const s2 = 96, j0 = Math.floor((mid * 0.5 - VW / 2 - 40) / s2), j1 = Math.ceil((mid * 0.5 + VW / 2 + 40) / s2), top = Math.min(0, Math.round(dY * 0.1 - 6)) - 14;
    for (let j = j0; j <= j1; j++) { const hs = hash(j, 59), U = j * s2 + (hs % 50), t = (U / 0.5) / 16, z = zoneOf(t); if ((hs >>> 5) % 100 >= ZONES[z][3] * 0.7) continue; const sx = Math.round(VW / 2 + U - mid * 0.5), sw = Math.round(Math.sin(time * 0.5 + hs * 0.02) * 1.5);
      g.globalAlpha = 0.85; g.drawImage(once('cu' + (hs % 3), () => bakeCurtain(hs % 3 + 1)), sx - 32 + sw, top); g.globalAlpha = 1; } }
  /* the low drift: a long wisp rolling over the water in front, two speeds */
  { const dr = once('drift', bakeDrift), zk = ZONES[zoneOf(tM)][4], wy = Math.round(WATER_PX - cy);
    for (const [sp, dy, a] of [[5, -2, 0.55], [9, 6, 0.4]]) { const so = ((-(cx * 0.45) - time * sp) % 200 + 200) % 200; g.globalAlpha = a * zk; for (let X = -200 + so; X < VW; X += 200) g.drawImage(dr, Math.round(X), wy + dy - 12); }
    g.globalAlpha = 1; }
  /* DRAGONFLIES: two to four over the reeds of the cuttings and the crews' reach, looping low over the water */
  { for (let n = Math.floor(tM / 24) - 1; n <= Math.floor(tM / 24) + 2; n++) { const hs = hash(n, 151), t0 = n * 24 + (hs % 12), z = zoneOf(t0); if (z > 1 || (hs >>> 3) % 3 === 0) continue;
      const a = time * (0.5 + (hs % 5) * 0.08) + hs, X = Math.round(VW / 2 + (t0 * 16 - cx - VW / 2) + Math.sin(a) * 34 + Math.sin(a * 2.3) * 8), Y = Math.round(WATER_PX - cy - 20 - (hs % 12) + Math.sin(a * 1.7) * 9);
      if (X < -10 || X > VW + 10) continue; g.drawImage(once('df' + (Math.floor(time * 24 + hs) & 1), () => bakeFly(Math.floor(time * 24 + hs) & 1)), X, Y); } }
}
const WATER_PX = 19 * 16;   /* the water's surface row in pixels (src/fen-road.js WATER) */

/* THE HERON: standing on a drowned snag's stub in the shallows by the road, head up, now and then dipping to the water; world-anchored (called behind the tiles). Takes flight (just goes) when the hero is near. */
export const HERONS = [{ x: 63 * 16, snag: true }, { x: 168 * 16, snag: true }, { x: 291 * 16, snag: true }];
export function drawHeron(g, cx, cy, time, px) {
  for (const h of HERONS) { const X = Math.round(h.x - cx); if (X < -20 || X > 360) continue; const near = Math.abs(px - h.x) < 70, ph = ((time + h.x * 0.01) % 9) / 9, f = ph > 0.78 && ph < 0.9 ? 1 : 0;
    if (near) continue;   /* it has flown */
    const y = WATER_PX - cy;
    g.fillStyle = '#3a2c20'; g.fillRect(X - 3, y - 6, 6, 8); g.fillStyle = '#5a4630'; g.fillRect(X - 3, y - 6, 6, 1); g.fillStyle = '#6f8f4a'; g.fillRect(X + 2, y - 7, 1, 3);   /* the stub with a little weed */
    g.drawImage(once('hr' + f, () => bakeHeron(f)), X - 8, y - 6 - 34); }
}
