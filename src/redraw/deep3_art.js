// deep3_art.js - THE DEEP 3's LEVEL KIT + THE WALL EEL (claude/d3art, 2026-11-12). Draw-only: the greybox shapes of src/deep3-hands.js (grey cracks, a slab for a stone, a flat alpha box for the rot, a brass blob for the Bell,
// a rect for a lantern) become: CRACKED SLABS (fissure + chips + sag + a gold-lit give), SETTLING STONES on their chains (courses, moss, grit, fall streaks), ROT VENTS and THE ROT PIT (crusted mouth, green plume, bubbling
// surface), THE OLD DIVING BELL (patina dome, brass bands, rivets, rim deck, clapper, chain), SOUL LANTERNS with the ten-second ring, THE WALL EEL (the hole, bubbles, strike / hang / back poses along any of four lines),
// the harpoon shot and its rope, the WARD / OPEN rings, the anchor slam's wave. Pure drawing, fillRect only (tools/d3-art-sheet.mjs rasterises it in node). Every function takes screen px (the hands subtract the camera).
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp } from './sr_draw.js';
const R = Math.round;
export const DK = {
  out: '#090e12', stone: ['#1a2228', '#2a343c', '#3e4a52', '#566670'], stoneHi: '#6e8088', moss: ['#1d4224', '#3c5624', '#5d7d36'], crack: '#06090c', chip: '#8a919c',
  rot: ['#24301c', '#3c5a24', '#6a9a34', '#9ad060', '#cfe8a0'], iron: ['#2a3036', '#474e58', '#6e7886', '#aab4c4', '#e8ecf4'], chain: ['#2a3036', '#6e7886', '#aab4c4'],
  bell: ['#2a3a2e', '#3e5a48', '#5e8268', '#8ab090'], brass: ['#5c4527', '#8a6a28', '#c8a24a', '#e8c24c'], rim: ['#3a2e20', '#5a4630', '#8a6a3a'], air: '#bfe6f5',
  eel: ['#1c2a18', '#2e4424', '#4a6a34', '#7a9a50'], eelBelly: ['#a89c70', '#d8c894'], eyeG: '#ffd36b', fang: '#f4fbf8', hole: '#05090c',
  soul: '#7ff0e0', soulHot: '#f0fffa', warn: '#ff6b6b', gold: '#ffd36b', white: '#f6fbfc', ward: '#c8d8e8', bone: ['#8a8068', '#b8ae94', '#d8d0b8'], rope: ['#6a5a3a', '#9a8458', '#c8b078'], dust: '#8a919c',
};
const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };
let g_, ox_ = 0, oy_ = 0, tf_ = null;
const rect = (x, y, w, h, c, a = 1) => { if (a !== 1) g_.globalAlpha = a; g_.fillStyle = c; if (tf_) { const [px, py, pw, ph] = tf_(x, y, w, h); g_.fillRect(R(ox_ + px), R(oy_ + py), R(pw), R(ph)); } else g_.fillRect(R(ox_ + x), R(oy_ + y), R(w), R(h)); if (a !== 1) g_.globalAlpha = 1; };
const FLM = (L, oc = DK.out, a = 1) => flush(L, (dx, dy, w, h, c, al) => rect(dx, dy, w, h, c, al * a), oc);
const at = (g, x, y) => { g_ = g; ox_ = R(x); oy_ = R(y); tf_ = null; };
/* a dotted ring of fillRects (a stroke arc would not rasterise in node): r px, frac 0..1 of the circle from the top, dot colour */
export function dotRing(g, x, y, r, col, frac = 1, a = 1, ry = r, step = 2.4) {
  at(g, x, y); const n = Math.max(8, Math.ceil(2 * Math.PI * r / step)); for (let i = 0; i < n; i++) { const k = i / n; if (k > frac) break; const an = -Math.PI / 2 + k * Math.PI * 2; rect(Math.cos(an) * r - 1, Math.sin(an) * ry - 1, 2, 2, col, a); }
}

/* THE CRACKED SLAB. (x, y) = the slab's top-left on screen, w px. mode 'whole' | 'creak' | 'gone'; stoneOnly = a thick slab (iron straps). */
export function drawCrack(g, x, y, w, mode = 'whole', seed = 0, t = 0, stoneOnly = false) {
  if (mode === 'gone') return; at(g, x, y); const creak = mode === 'creak', sh = creak ? (Math.sin(t * 60) > 0 ? 1 : 0) : 0;
  /* the fissure: a jagged line with side cracks, laid across the slab; widens and gold-lights while it creaks */
  for (let i = 0; i < w; i += 6) { const h = hash(seed + i, 3), jx = i + (h % 3), top = 1 + (h >> 3) % 2, dp = 9 + (h >> 6) % 5;
    for (let k = 0; k < dp; k++) rect(jx + ((k * 7 + (h >> 9)) % 4 < 2 ? 0 : 1) + sh * (k & 1), top + k, 1, 1, DK.crack);
    if (h % 3 === 0) { rect(jx + 1, top + 2, 1, dp - 3, DK.stoneHi, 0.35); }   /* the lit lip of the crack */
    if (creak) { rect(jx, top + 1, 1, dp - 2, DK.gold, 0.55); }
    if (h % 4 === 1) { for (let k = 1; k < 4; k++) rect(jx + k, top + 4 + (k >> 1), 1, 1, DK.crack); }
    if (h % 5 === 2) { rect(jx - 1, top + dp, 2, 1, DK.chip); rect(jx + 2, top + dp + 1, 1, 1, DK.chip, 0.7); } }
  /* the slab's own course lines + the rot staining the seam under it */
  rect(0, 13, w, 1, DK.stone[0], 0.8); for (let i = 0; i < w; i += 16) rect(i, 14, 1, 2, DK.stone[0], 0.6);
  if (stoneOnly) { rect(0, 12, w, 1, DK.stoneHi, 0.5); for (let i = 3; i < w; i += 14) { rect(i, 2, 4, 9, DK.iron[1]); rect(i, 2, 4, 1, DK.iron[3]); rect(i + 1, 4, 1, 1, DK.iron[4]); rect(i + 1, 8, 1, 1, DK.iron[4]); } }   /* iron straps and rivets on the thick slab */
  for (let i = 0; i < w; i += 5) if (hash(seed + i, 11) % 4 === 0) rect(i + 1, 15, 3, 1, DK.moss[1], 0.8);
  if (creak) for (let i = 0; i < 3; i++) { const k = (t * 3 + i * 0.33) % 1; rect(((seed + i * 37) % Math.max(1, w - 2)), 14 + k * 8, 1, 2, DK.dust, 0.8 * (1 - k)); }
}
/* THE SETTLING STONE: a block on a chain. (x, y) = top-left on screen; w, h px; chainTop = screen y of the ceiling ring. mode 'hang' | 'tell' | 'fall' */
export function drawSettling(g, x, y, w, h, chainTop, mode = 'hang', t = 0) {
  at(g, x, y); const tell = mode === 'tell', fall = mode === 'fall', sh = tell ? (Math.random() < 0.5 ? -1 : 1) * (Math.sin(t * 80) > 0 ? 1 : 0) : 0; ox_ += sh;
  if (!fall) { const cx = R(w / 2); for (let yy = chainTop - y; yy < -2; yy += 4) { rect(cx - 1 + ((yy >> 2) & 1), yy, 3, 3, DK.chain[1]); rect(cx, yy + 1, 1, 1, DK.chain[2]); } rect(cx - 3, -4, 7, 3, DK.iron[1]); rect(cx - 3, -4, 7, 1, DK.iron[3]); rect(cx - 1, -1, 3, 2, DK.iron[0]); }
  const L = new Layer(); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) L.set(i, j, DK.stone[1 + ((i * 7 + j * 3 + (hash(i >> 3, j >> 3) & 3)) % 5 < 2 ? 1 : 0)]);
  for (let i = 0; i < w; i++) { L.set(i, 0, DK.stone[3]); L.set(i, 1, DK.stoneHi); } for (let j = 0; j < h; j++) L.set(0, j, DK.stone[3]);
  for (let j = 8; j < h; j += 8) for (let i = 0; i < w; i++) L.set(i, j, DK.stone[0]); for (let j = 0; j < h; j += 8) for (let i = (j >> 3 & 1) * 8 + 4; i < w; i += 16) for (let k = 0; k < 8 && j + k < h; k++) L.set(i, j + k, DK.stone[0]);
  for (let i = 0; i < w; i += 3) if (hash(i, 5) % 3 === 0) { L.set(i, 2, DK.moss[1]); L.set(i + 1, 2, DK.moss[2]); L.set(i, 3, DK.moss[0]); }
  FLM(L);
  if (tell) for (let i = 0; i < 6; i++) { const k = (t * 4 + i * 0.17) % 1; rect(2 + (i * 11) % Math.max(1, w - 4), h + k * 18, 1, 2, DK.dust, 1 - k); }
  if (fall) for (let i = 0; i < 4; i++) rect(4 + i * ((w - 8) / 3), -14 - (i & 1) * 8, 1, 12 + (i & 1) * 6, DK.white, 0.4);
}
/* THE ROT. A vent: (x, y) = the mouth's top-left (a TS-wide column of h px), dir = +1 (opens right) / -1. state 'rest' | 'tell' | 'on'. */
export function drawVent(g, x, y, h, dir, state = 'rest', t = 0, TS = 16) {
  at(g, x, y); const L = new Layer(); for (let j = 0; j < h; j++) for (let i = 0; i < TS; i++) L.set(i, j, DK.rot[0 + ((i + j) % 5 === 0 ? 1 : 0)]); FLM(L);
  const mx = dir > 0 ? TS - 6 : 0; rect(mx, 2, 6, h - 4, DK.hole); for (let j = 3; j < h - 3; j += 4) rect(mx, j, 6, 1, DK.iron[1]);   /* the grate */
  rect(dir > 0 ? TS - 7 : 6, 1, 1, h - 2, DK.rot[2], 0.8); for (let j = 0; j < h; j += 5) { rect(dir > 0 ? TS - 9 : 4, j + 1, 3, 2, DK.rot[1]); rect(dir > 0 ? TS - 9 : 4, j + 1, 3, 1, DK.rot[2]); }   /* the crust round the mouth */
  const gl = state === 'on' ? 0.9 : state === 'tell' ? 0.35 + 0.35 * Math.sin(t * 18) : 0.12; rect(mx + 1, 3, 4, h - 6, DK.rot[3], gl * 0.6);
  if (state !== 'rest') for (let i = 0; i < 4; i++) { const k = (t * 2.5 + i * 0.25) % 1; rect((dir > 0 ? TS - 10 - k * 3 : 10 + k * 3) + Math.sin(t * 9 + i) * 2, h - 6 - k * (h - 8), 2, 2, DK.rot[4], (state === 'tell' ? 0.6 : 0.9) * (1 - k * 0.6)); }
}
/* the rot's cloud in its box (l, t, r, b screen px): drifting blobs + a hot core; the pit: a bubbling surface */
export function drawRot(g, l, tp, r, b, state = 'on', t = 0, pit = false) {
  at(g, l, tp); const w = r - l, h = b - tp; if (state === 'rest' && !pit) return; const a = pit ? 0.5 : state === 'on' ? 0.5 : 0.2;
  if (pit) { rect(0, 0, w, h, DK.rot[1], 0.55); rect(0, 0, w, h * 0.4, DK.rot[2], 0.25); for (let i = 0; i < w; i += 3) rect(i, 1 + Math.round(Math.sin(t * 3 + i * 0.7) * 1.5), 3, 1, DK.rot[3], 0.85); }
  else { rect(0, 0, w, h, DK.rot[1], a * 0.35); }
  const n = Math.max(4, Math.floor(w * h / 220)); for (let i = 0; i < n; i++) { const hh = hash(i, 17), k = (t * (pit ? 0.5 : 0.9) + (hh % 100) / 100) % 1, bx = (hh >> 3) % Math.max(1, w - 4) + Math.sin(t * 2 + i) * 2, by = h - k * h, sz = 2 + (hh >> 9) % 3;
    rect(bx, by, sz, sz, DK.rot[2 + (hh >> 12) % 2], a * (1 - k) + 0.1); if (sz > 3) rect(bx + 1, by + 1, 1, 1, DK.rot[4], 0.7 * (1 - k)); }
}
/* THE OLD DIVING BELL. (x, y) = the deck's top-left (w px wide, the rim at y), chainTop = screen y of the shaft head; ride = a hero stands in her. */
export function drawBell(g, x, y, w, ride = false, t = 0, chainTop = y - 200) {
  at(g, x, y); const cx = w / 2;
  for (let yy = chainTop - y; yy < -44; yy += 4) { rect(cx - 1 + ((yy >> 2) & 1), yy, 3, 3, DK.chain[1]); rect(cx, yy + 1, 1, 1, DK.chain[2]); }   /* her chain */
  rect(cx - 4, -49, 9, 4, DK.iron[1]); rect(cx - 4, -49, 9, 1, DK.iron[3]);
  const L = new Layer(); const pts = []; for (let i = 0; i <= 14; i++) { const a = Math.PI - (i / 14) * Math.PI; pts.push([cx + Math.cos(a) * (w / 2 - 1), -Math.sin(a) * 40 * 0.95 + 0]); }
  pts.push([w - 3, 0]); pts.push([w - 3, -1]); pts.unshift([2, 0]); poly(L, pts, [DK.bell[2], DK.bell[1]]);
  for (let j = -40; j < 0; j++) for (let i = 0; i < w; i++) if (L.has(i, j)) { const k = (i / w - 0.3); L.set(i, j, k > 0.45 ? DK.bell[0] : k < -0.1 ? DK.bell[3] : (i + j) % 7 === 0 ? DK.bell[3] : DK.bell[2]); }   /* patina bands lit from the left */
  for (const bj of [-30, -17, -6]) for (let i = 0; i < w; i++) if (L.has(i, bj)) L.set(i, bj, DK.brass[1 + (i & 1)]);   /* brass bands */
  for (const bj of [-30, -17, -6]) for (let i = 4; i < w - 3; i += 6) if (L.has(i, bj)) L.set(i, bj - 1, DK.brass[3]);   /* rivets */
  for (let k = 0; k < 6; k++) { const i = 6 + (hash(k, 2) % Math.max(1, w - 12)), j = -34 + (hash(k, 7) % 30); if (L.has(i, j)) { L.set(i, j, DK.moss[1]); L.set(i + 1, j, DK.moss[2]); } }   /* weed */
  /* a porthole: two of them, brass-ringed, lit from inside */
  for (const px of [R(w * 0.3), R(w * 0.66)]) { const py = -24; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (i * i + j * j <= 5) L.set(px + i, py + j, i * i + j * j > 3 ? DK.brass[2] : ride ? DK.soulHot : DK.bell[0]); }
  FLM(L);
  /* the rim deck she is stood on: a plank ring with a brass lip, bolts, a drip of weed */
  const D2 = new Layer(); for (let j = 0; j < 6; j++) for (let i = -1; i < w + 1; i++) D2.set(i, j, j < 2 ? DK.brass[2] : DK.rim[(i >> 2) & 1 ? 1 : 0 + (j > 3 ? 0 : 1)]); for (let i = 3; i < w; i += 7) D2.set(i, 1, DK.brass[3]); FLM(D2);
  for (let i = 0; i < 4; i++) rect(4 + i * ((w - 8) / 3), 6, 1, 3 + (i & 1) * 2, DK.moss[1 + (i & 1)]);
  /* the clapper, hanging in her */ rect(cx - 1, -12, 3, 9, DK.iron[1]); rect(cx - 2, -4, 5, 4, DK.brass[2]);
  if (ride) { rect(6, -34, w - 12, 33, DK.air, 0.16); for (let i = 0; i < 4; i++) { const k = (t * 1.4 + i * 0.25) % 1; rect(10 + ((i * 13) % (w - 22)), -4 - k * 28, 2, 2, DK.white, 0.6 * (1 - k)); } }
}
/* A SOUL LANTERN over a fallen sailor: (x, y) = the lantern's centre; k = the ten-second ring left (1..0); secs = the number shown */
export function drawLantern(g, x, y, k = 1, t = 0, secs = null) {
  at(g, x, y); const hot = k < 0.3, flick = 0.75 + 0.25 * Math.sin(t * 9 + x);
  const L = new Layer(); cap(L, -3, -7, 3, -7, 1, 1, DK.brass); cap(L, -3, 3, 3, 3, 1, 1, DK.brass); for (const sx of [-3, 3]) cap(L, sx, -6, sx, 2, 0.6, 0.6, DK.brass); ell(L, 0, -2, 2.2, 3, [DK.soul, DK.soul, DK.soulHot]); L.set(0, -9, DK.brass[2]); L.set(0, -10, DK.brass[1]); FLM(L);
  rect(-1, -4, 2, 3, DK.soulHot, flick); rect(-4, -5, 8, 8, hot ? DK.warn : DK.soul, 0.14 * flick);
  dotRing(g, x, y - 1, 12, hot ? DK.warn : DK.soul, k, 0.9); dotRing(g, x, y - 1, 12, DK.stone[0], 1, 0.3);
}
/* THE WALL EEL. (hx, hy) = the hole's mouth on screen; (dx, dy) its line (+-1, 0) or (0, 1); ext 0..1 (how far out); reach px; mode 'hidden' | 'bubble' | 'strike' | 'hang' | 'back'. */
export function drawEel(g, hx, hy, dx, dy, ext, mode = 'hidden', t = 0, reach = 48, flash = false) {
  at(g, hx, hy);
  /* local space: +x = out of the wall along the line, y up negative; rotated for a DOWN line, mirrored for dx = -1 */
  tf_ = (x, y, w, h) => { if (dy) return [-(y + h), x, h, w]; return dx < 0 ? [-(x + w), y, w, h] : [x, y, w, h]; };
  /* the hole: ragged rubble round a black mouth */
  const Lh = new Layer(); ell(Lh, -1, 0, 5, 6.5, [DK.stone[0], DK.stone[1], DK.stone[2]]); FLM(Lh, DK.out); rect(-4, -4, 7, 8, DK.hole); rect(-5, -6, 2, 1, DK.stone[3]); rect(-4, 5, 3, 1, DK.stone[3]); rect(2, -5, 2, 1, DK.moss[1]); rect(1, 5, 2, 1, DK.moss[2]);
  rect(-3, -3, 1, 1, DK.eyeG, mode === 'hidden' ? 0.35 : 0.7);   /* a glint of an eye in the dark */
  if (mode === 'bubble') for (let i = 0; i < 5; i++) { const k = (t * 3 + i * 0.21) % 1; rect(3 + k * 9, -4 - Math.sin(t * 9 + i) * 3 - k * 6, 2 - (i & 1) * 0 + 0, 2, DK.white, 0.85 * (1 - k * 0.6)); if (i & 1) rect(5 + k * 9, -2 - k * 7, 1, 1, DK.air, 0.8); }
  if (ext < 0.02) { tf_ = null; return; }
  const len = reach * ext, hang = mode === 'hang', st = mode === 'strike', back = mode === 'back';
  /* the neck: a scaled body in ridged segments from the hole to the head, a pale belly below the line */
  const L = new Layer(); const sag = hang ? 2 : 0;
  for (let i = 0; i < len; i += 1) { const w = 4.2 - (i / Math.max(1, len)) * 0.8 + (i % 7 < 2 ? 0.5 : 0), yy = Math.sin(i * 0.28 + t * (hang ? 3 : 14)) * (hang ? 0.7 : 1.2) + (hang ? (i / Math.max(1, len)) * sag : 0);
    for (let j = -Math.floor(w); j <= Math.floor(w); j++) L.set(i, yy + j, j > w * 0.35 ? DK.eelBelly[(i >> 1) & 1] : j < -w * 0.4 ? DK.eel[3] : DK.eel[1 + ((i + j) % 6 === 0 ? 1 : 0)]); }
  for (let i = 2; i < len - 8; i += 6) { L.set(i, -5, DK.eel[2]); L.set(i + 1, -6, DK.eel[2]); }   /* a dorsal fin's ticks */
  FLM(L);
  /* the head at the tip: a wedge skull, a jaw that opens in the strike, a gold eye, fangs */
  const hxp = len, open = st ? 1 : hang ? 0.15 : back ? 0.3 : 0, H = new Layer();
  poly(H, [[hxp - 6, -4.5], [hxp + 3, -3.5], [hxp + 9, -1], [hxp + 9, 0.5], [hxp - 6, 1]], [DK.eel[3], DK.eel[2]]);
  poly(H, [[hxp - 5, 1], [hxp + 8, 1 + open * 4.5], [hxp + 7, 2.5 + open * 5], [hxp - 5, 4]], [DK.eelBelly[0], DK.eelBelly[0]]);
  if (open > 0.3) { for (let i = 0; i < 3; i++) { H.set(hxp + 2 + i * 2, 1.2, DK.fang); H.set(hxp + 3 + i * 2, 1 + open * 3.6, DK.fang); } for (let i = 0; i < 5; i++) H.set(hxp + 1 + i, 2, DK.hole); }
  for (const ex of [hxp + 1]) { H.set(ex, -2.5, hang ? DK.eelBelly[0] : DK.eyeG); H.set(ex + 1, -2.5, hang ? DK.eelBelly[0] : DK.eyeG); H.set(ex, -3.5, DK.hole); H.set(ex + 1, -3.5, DK.hole); }
  FLM(H);
  if (hang) { for (let i = 0; i < 3; i++) { const k = (t * 2 + i * 0.3) % 1; rect(hxp - 2 + i * 3, 4 + k * 8, 1, 2, DK.air, 0.8 * (1 - k)); } rect(hxp + 12, -6, 2, 2, DK.gold, 0.9); rect(hxp + 12, -9, 1, 5, DK.gold, 0.6); }   /* CUT IT NOW: a gold glint over the head, drips */
  if (flash) rect(hxp - 6, -5, 16, 10, DK.white, 0.55);
  tf_ = null;
}
/* the harpoon in flight: (x, y) screen, angle from (vx, vy); kind 'throw' | 'reel' */
export function drawHarpoonShot(g, x, y, vx, vy, kind = 'throw') {
  at(g, x, y); const a = Math.atan2(vy, vx), d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]], L = new Layer();
  cap(L, -d[0] * 12, -d[1] * 12, d[0] * 4, d[1] * 4, 0.9, 0.9, DK.bone);
  poly(L, [[d[0] * 9, d[1] * 9], [d[0] * 3 + n[0] * 2.4, d[1] * 3 + n[1] * 2.4], [d[0] * 3 - n[0] * 2.4, d[1] * 3 - n[1] * 2.4]], DK.iron[2]);
  poly(L, [[d[0] * 3 + n[0] * 2.4, d[1] * 3 + n[1] * 2.4], [-d[0] * 0.5 + n[0] * 4.6, -d[1] * 0.5 + n[1] * 4.6], [d[0] * 1 + n[0] * 0.6, d[1] * 1 + n[1] * 0.6]], DK.iron[1]);
  poly(L, [[d[0] * 3 - n[0] * 2.4, d[1] * 3 - n[1] * 2.4], [-d[0] * 0.5 - n[0] * 4.6, -d[1] * 0.5 - n[1] * 4.6], [d[0] * 1 - n[0] * 0.6, d[1] * 1 - n[1] * 0.6]], DK.iron[1]);
  FLM(L); for (let i = 1; i < 4; i++) rect(-d[0] * (12 + i * 5) - 1, -d[1] * (12 + i * 5) - 1, 2, 2, kind === 'reel' ? DK.rope[2] : DK.white, 0.5 - i * 0.12);
}
/* the reel's rope: a sagging line of 2px dots from (x0, y0) to (x1, y1) */
export function drawRope(g, x0, y0, x1, y1, t = 0) { at(g, 0, 0); const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2)); for (let i = 0; i <= n; i++) { const k = i / n; rect(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k + Math.sin(k * Math.PI) * 3 + Math.sin(t * 10 + i) * 0.6, 2, 2, DK.rope[1 + (i & 1)], 0.95); } }
/* the gold OPEN ring (a window: timer bar under it) and the WARD ring (a shell of pale segments) round (x, y) */
export function drawOpenRing(g, x, y, r, t = 0) { dotRing(g, x, y, r, DK.gold, 1, 0.9, r, 2.2); dotRing(g, x, y, r - 3, DK.gold, 1, 0.35, r - 3, 3); for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.57; at(g, x, y); rect(Math.cos(a) * r - 1, Math.sin(a) * r - 1, 3, 3, DK.white, 0.95); } }
export function drawWardRing(g, x, y, r, t = 0) { at(g, x, y); const n = 14; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + t * 0.6, cx = Math.cos(a) * r, cy = Math.sin(a) * r; const s = i & 1; rect(cx - 2, cy - 1, s ? 4 : 3, s ? 2 : 3, s ? DK.ward : DK.soul, 0.8); } }
/* the anchor slam's wave: a rolling crest of water + debris, v.sc = its height scale; (x, floor) = its foot */
export function drawWave(g, x, floor, sc = 1, t = 0) {
  at(g, x, floor); const h = 16 * sc;
  for (let j = 0; j < h; j += 2) { const w = 14 - j * 0.5; rect(-w / 2 + Math.sin(t * 12 + j) * 1, -j - 2, w, 2, j > h - 6 ? DK.white : j > h * 0.5 ? DK.air : DK.bell[3], 0.78 - j * 0.015); }
  rect(-9, -2, 18, 2, DK.dust, 0.8); for (let i = 0; i < 3; i++) rect(-8 + i * 7, -h - 2 - (i & 1) * 3, 2, 2, DK.chip, 0.9);
}
/* a settled stone / given slab's rubble heap (for a stair step that gave) */
export function drawRubble(g, x, y, w) { at(g, x, y); const L = new Layer(); for (let i = 0; i < w; i += 5) ell(L, i + 3, -2 - (hash(i, 4) % 3), 3.2, 2.4, DK.stone); FLM(L); }
