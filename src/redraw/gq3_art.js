// src/redraw/gq3_art.js - THE GQ3 ART PASS (claude/gq3art, over the greybox claude/gq3; the Frog King bar: outline, tone ramps, volume).
// DRAWING ONLY: no tile, entity, number or timer changes. src/gqueen-hands.js (artWorld / roofDraw), src/gobgeo-hands.js (the weights, the grille) and src/main.js (paintRoom, the roof back)
// call these, each in a try/catch with the old greybox as the fallback. Plain fillRect / px.js pixels only (no paths), so tools/gq3art-sheet.mjs renders the lot in Node with no browser.
//   THE ROYAL PORTAL (a tall pointed arch under a crown of gold points, 48 px: open x3, idle x4, snap x2; tints: royal / white exit / gold crown / green reinforcement / step = the
//   player's shortcut) and the five RINGS on the tower top; THE GEODE (x3 rotations, the grinding tell, the shatter, the floor mark, the low shards);
//   THE BURNING TOWER (the shaft room with its slit windows, timber floors smoking / burning / charred, the stairwell curbs, the falling beam x2 + impact, the hatch);
//   THE TOWER TOP (parapet walks, the bell cupola, four bays x3 burn states, the new roof back); THE QUEEN'S STAIR (the dropped portcullis, flights, catwalks, the geode grille,
//   counterweights + pivot slabs + the store room, the hoard alcove, the gallery with its banners).
// Palette: Highcrown stone (STONE), the Queen's purple b28cff / 5a2a7a, gold e0b040, iron 5a6270, ember ff6b2c, geode violet 7a4aa8 / e8dcff.
import { canvas, rect, px, mulberry, outline, ellipse, line } from '../px.js';
import { OUT } from '../art.js';
import { STONE as S } from './highcrown2_art.js';
import { drawFlame } from './gqueen_art.js';

const R = rect;
const ri = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const wave = (t, f, p = 0) => 0.5 + 0.5 * Math.sin(t * f + p);
const alpha = (g, a) => { g.globalAlpha = a; };

// ====================================================================================== THE ROYAL PORTAL
const TINT = {
  royal: { rim: '#e0b040', hi: '#fff6c8', dk: '#a0781c', well: ['#0c0614', '#1d1030', '#2e1850'], arm: '#b28cff', spark: '#e8dcff', gem: '#c9463d' },
  white: { rim: '#e8dcff', hi: '#ffffff', dk: '#9a90c0', well: ['#2a2440', '#5a5080', '#9a90c0'], arm: '#ffffff', spark: '#ffffff', gem: '#ffffff' },
  gold: { rim: '#ffd36b', hi: '#fff6c8', dk: '#a0781c', well: ['#2a1a08', '#5a3a10', '#9a6a1c'], arm: '#ffe8a0', spark: '#fff6c8', gem: '#ffd36b' },
  green: { rim: '#8fd160', hi: '#d8ffb0', dk: '#3f6e2c', well: ['#0a1a08', '#16301a', '#2a5a24'], arm: '#8fd160', spark: '#d8ffb0', gem: '#c8f08a' },
  step: { rim: '#8fe8ff', hi: '#ffffff', dk: '#3a7aa8', well: ['#08182a', '#10305a', '#1c5a8a'], arm: '#b8f0ff', spark: '#ffffff', gem: '#8fe8ff' },
};
export const PORTAL_FRAMES = { open: 3, idle: 4, snap: 2, height: 48 };
export const tintOf = col => ({ '#fff6c8': 'white', '#ffd36b': 'gold', '#8fd160': 'green', '#b28cff': 'royal', '#c9a0ff': 'royal', '#e8dcff': 'white' }[String(col).toLowerCase()] || 'royal');
// x, y = the CENTRE. state 'open' (k 0..1 -> 3 frames), 'idle' (4 frames at 8 fps), 'snap' (k 1..0 -> 2 frames). s scales it (the rings are 0.62).
export function drawRoyalPortal(g, x, y, t, o = {}) {
  const { state = 'idle', k = 1, tint = 'royal', s = 1, dim = false } = o, C = TINT[tint] || TINT.royal;
  let wk, hk, fr = Math.floor(t * 8) & 3;
  if (state === 'open') { const i = Math.min(2, Math.floor(Math.max(0, k) * 3)); wk = [0.2, 0.55, 1][i]; hk = [0.4, 0.78, 1][i]; }
  else if (state === 'snap') { const i = k > 0.5 ? 0 : 1; wk = [0.5, 0.1][i]; hk = 1; }
  else { wk = 1; hk = 1; }
  x = ri(x); y = ri(y); const rx = Math.max(1, ri(14 * s * wk)), ry = Math.max(3, ri(24 * s * hk));
  const half = v => v >= 0 ? Math.sqrt(Math.max(0, 1 - v * v)) : Math.max(0, 1 - Math.pow(-v, 1.7));   // the lower half round, the top an ogive point
  if (dim) alpha(g, 0.6);
  // the glow on the floor and the air about it
  alpha(g, (dim ? 0.12 : 0.2) + 0.05 * wave(t, 8)); R(g, x - rx - 5, y + ry - 3, rx * 2 + 11, 4, C.arm); alpha(g, dim ? 0.55 : 1);
  for (let dy = -ry; dy <= ry; dy++) {
    const v = dy / ry, w = ri(rx * half(v)); if (w < 1 && Math.abs(dy) < ry) continue;
    const yy = y + dy, edge = Math.abs(dy) > ry - 3;
    R(g, x - w - 1, yy, w * 2 + 3, 1, C.dk);                                                         // the rim's shadow side
    R(g, x - w, yy, w * 2 + 1, 1, edge ? C.rim : C.well[0]);
    if (!edge) { const w2 = Math.max(0, w - 2); if (w2 > 0) R(g, x - w2, yy, w2 * 2 + 1, 1, C.well[1]); const w3 = Math.max(0, w - 5); if (w3 > 0 && Math.abs(dy) < ry - 5) R(g, x - w3, yy, w3 * 2 + 1, 1, C.well[2]); }
    if (!edge && w > 1) { px(g, x - w, yy, ((dy + fr * 3) & 7) < 3 ? C.hi : C.rim); px(g, x + w, yy, ((dy - fr * 3) & 7) < 3 ? C.rim : C.dk); R(g, x - w + 1, yy, 1, 1, C.rim); }   // the rim, a bright run travelling up it
  }
  // two arms of light winding in to the centre (4 idle frames = a quarter turn each)
  if (state !== 'snap') for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 14; i++) {
    const f = i / 13, a = (state === 'idle' ? fr * Math.PI / 2 : t * 3.2) + arm * Math.PI + f * 5.2, r = 1 - f * 0.88;
    alpha(g, 0.4 + 0.55 * (1 - f)); R(g, ri(x + Math.cos(a) * (rx - 3) * r), ri(y + Math.sin(a) * (ry - 4) * r), f < 0.4 ? 2 : 1, 1, f < 0.25 ? C.spark : C.arm); }
  alpha(g, dim ? 0.55 : 1);
  // the crown of gold points over the apex: three, the middle taller, a stone in each (only once it is open enough to have a crown)
  if (wk > 0.5 && !dim) { const ty = y - ry; for (const [dx, h] of [[-5, 4], [0, 7], [5, 4]]) { const X = x + ri(dx * s); for (let i = 0; i < h; i++) { const wd = i > h - 2 ? 1 : i > h - 4 ? 2 : 3; R(g, X - (wd >> 1), ty - 1 - i, wd, 1, i > h - 3 ? C.hi : C.rim); } px(g, X, ty - 1, C.gem); }
    R(g, x - 7, ty - 1, 15, 1, C.dk); }
  // sparks flung off the rim, rising
  if (state !== 'snap') for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * 0.37) % 1, a = i * 2.4 + Math.floor(t * 1.3 + i * 0.37) * 1.7; alpha(g, (1 - ph) * (dim ? 0.5 : 1)); R(g, ri(x + Math.cos(a) * (rx + ph * 9)), ri(y + Math.sin(a) * (ry + ph * 6) - ph * 8), 1, 1, C.spark); }
  if (state === 'snap' && k <= 0.5) { alpha(g, 0.7); R(g, x - 1, y - ry, 3, ry * 2, '#ffffff'); R(g, x - 5, y - 1, 11, 3, '#ffffff'); }       // the seam's flash as it SNAPS
  g.globalAlpha = 1;
}
// the tower top's rings: a dormant socket (an iron-bound arch, a dark well) until it is lit; lit = a small royal portal in the ring's colour
export function drawRing(g, x, y, t, k, col) {
  const dormant = String(col).toLowerCase() === '#5a3a8a';
  if (dormant) { drawRoyalPortal(g, x, y, t, { state: 'idle', tint: 'royal', s: 0.62, dim: true }); return; }
  drawRoyalPortal(g, x, y, t, k >= 1 ? { state: 'idle', tint: tintOf(col), s: 0.62 + 0.06 * wave(t, 14) } : { state: 'open', k, tint: tintOf(col), s: 0.62 });
}
// the player's SHORTCUT (her hop's entry, 1.5 s: step in = a storey up): cool white-blue with a column of chevrons climbing it, so it reads as for YOU
export function drawShortcut(g, x, y, t) {
  drawRoyalPortal(g, x, y, t, { state: 'idle', tint: 'step', s: 0.8 });
  for (let i = 0; i < 3; i++) { const ph = (t * 1.6 + i / 3) % 1, cy = ri(y + 8 - ph * 22); alpha(g, Math.sin(ph * Math.PI)); for (let j = 0; j < 4; j++) { R(g, ri(x) - 4 + j, cy + j, 1, 1, '#ffffff'); R(g, ri(x) + 4 - j, cy + j, 1, 1, '#ffffff'); } } g.globalAlpha = 1;
}

// ====================================================================================== THE GEODE
// 15 x 15, x3 rotations: 0 = cracked open face on (violet crystal in a grey shell), 1 = turning (a hump with a sliver of crystal), 2 = the shell's back (a knuckled stone, one crack glowing)
const GEO = { sh: ['#2a2a38', '#4a4a5e', '#6c6a82', '#9a98b4'], cr: ['#3a1a6a', '#7a4aa8', '#b28cff', '#e8dcff'], home: ['#a89860', '#d8d0b8', '#fff6c8', '#ffffff'] };
function geodeSprite(fr, home) {
  return once('geode' + fr + home, () => { const [c, g] = canvas(15, 15), sh = home ? GEO.home : GEO.sh, cr = home ? ['#a8841c', '#e0b040', '#ffd36b', '#ffffff'] : GEO.cr;
    if (fr === 0) { ellipse(g, 7, 7, 7, 6.5, sh[1]); ellipse(g, 6, 6, 6, 5.5, sh[2]); ellipse(g, 7, 7.5, 5, 4.5, sh[0]);
      for (const [x, y, h] of [[4, 8, 5], [6, 9, 7], [8, 9, 6], [10, 8, 4], [5, 7, 3]]) { R(g, x - 1, y - h + 4, 2, h - 1, cr[1]); px(g, x - 1, y - h + 4, cr[3]); px(g, x, y - h + 5, cr[2]); R(g, x, y, 1, 1, cr[0]); }
      R(g, 3, 4, 3, 1, sh[3]); px(g, 2, 5, sh[3]); }
    else if (fr === 1) { ellipse(g, 7, 7, 4.5, 6.5, sh[1]); ellipse(g, 6, 6, 3.5, 5.5, sh[2]); R(g, 8, 4, 2, 7, cr[1]); px(g, 8, 4, cr[3]); R(g, 9, 6, 1, 3, cr[2]); R(g, 5, 4, 1, 3, sh[3]); }
    else { ellipse(g, 7, 7, 7, 6.5, sh[0]); ellipse(g, 6, 6, 6, 5.5, sh[1]); ellipse(g, 5, 5, 4, 3.5, sh[2]); for (const [x, y] of [[3, 3], [4, 3], [9, 9], [10, 10]]) px(g, x, y, sh[3]); line(g, 8, 3, 6, 9, cr[1], 1); px(g, 7, 6, cr[3]); px(g, 8, 4, cr[2]); }
    return outline(c, OUT); });
}
// x, y = its centre. spin = radians (Ge.spin); home = sent back (white-gold, a trail); vx, vy for the trail
export function drawGeode(g, x, y, t, o = {}) {
  const { spin = 0, home = false, vx = 1, vy = 0 } = o, fr = ((Math.floor(spin * 0.55) % 3) + 3) % 3, sp = Math.hypot(vx, vy) || 1;
  for (let i = 1; i <= 4; i++) { alpha(g, 0.4 - i * 0.08); R(g, ri(x - (vx / sp) * i * 4) - 1, ri(y - (vy / sp) * i * 4) - 1, 3, 3, home ? '#ffd36b' : '#b28cff'); } g.globalAlpha = 1;
  if (home) { alpha(g, 0.3 * (0.6 + 0.4 * wave(t, 16))); R(g, ri(x) - 9, ri(y) - 9, 18, 18, '#fff6c8'); g.globalAlpha = 1; }
  g.drawImage(geodeSprite(fr, !!home), ri(x) - 7, ri(y) - 7);
}
// the tell: the geode grinding out of a portal over her head - it grows from a pebble to a full stone in her raised hand, crumbs falling, the sceptre's glow gathering (k 0..1)
export function drawGeodeTell(g, x, y, t, k) {
  x = ri(x); y = ri(y);
  drawRoyalPortal(g, x, y - 8, t, k < 0.25 ? { state: 'open', k: k * 4, s: 0.55 } : { state: 'idle', s: 0.55 });
  const sz = Math.min(1, 0.35 + k * 0.8), gy = y + 4 + ri(6 * (1 - k));
  if (sz > 0.6) g.drawImage(geodeSprite(((Math.floor(t * 4) % 3) + 3) % 3, false), x - 7, gy - 3); else { R(g, x - 2, gy, 4, 3, GEO.sh[2]); px(g, x - 1, gy, GEO.cr[2]); }
  for (let i = 0; i < 5; i++) { const ph = (t * 2.2 + i * 0.21) % 1; alpha(g, 1 - ph); R(g, x - 6 + i * 3 + ((i * 7) & 1), gy + 6 + ri(ph * 14), 1, 2, i & 1 ? '#9a98b4' : '#b28cff'); } g.globalAlpha = 1;
  alpha(g, 0.2 + 0.25 * k); R(g, x - 10, gy - 8, 20, 18, '#b28cff'); g.globalAlpha = 1;
}
// the landing ring on the floor (x = where it will come down): tracking = a wide pulsing ring of rune ticks; locked = tight, solid, cross-haired
export function drawGeodeMark(g, x, fy, locked, t) {
  x = ri(x); fy = ri(fy) - 1; const rx = locked ? 13 : 16, ry = locked ? 3 : 4, p = wave(t, locked ? 22 : 12);
  alpha(g, locked ? 0.95 : 0.5 + 0.25 * p);
  for (let a = 0; a < 40; a++) { const aa = a / 40 * Math.PI * 2; if (!locked && (a + Math.floor(t * 10)) % 4 === 0) continue; px(g, x + ri(Math.cos(aa) * rx), fy + ri(Math.sin(aa) * ry), locked ? '#ff6b6b' : '#b28cff'); }
  for (let a = 0; a < 20; a++) { const aa = a / 20 * Math.PI * 2; px(g, x + ri(Math.cos(aa) * (rx - 5)), fy + ri(Math.sin(aa) * (ry - 1.5)), locked ? '#ff9a9a' : '#7a4aa8'); }
  if (locked) { R(g, x - 3, fy, 7, 1, '#ffd0d0'); R(g, x, fy - 1, 1, 3, '#ffd0d0'); alpha(g, 0.25 * p); R(g, x - 16, fy - 2, 32, 5, '#ff6b6b'); }
  else for (const s of [-1, 1]) { px(g, x + s * (rx + 2), fy, '#e8dcff'); px(g, x + s * (rx + 3), fy, '#b28cff'); }
  g.globalAlpha = 1;
}
// the shatter (k 0..1): a flash ring along the floor, grey chunks thrown out and down, violet splinters
export function drawGeodeShatter(g, x, fy, k) {
  x = ri(x); fy = ri(fy);
  alpha(g, Math.max(0, 0.9 - k * 1.3)); R(g, x - ri(6 + k * 22), fy - 2, ri(12 + k * 44), 2, '#e8dcff'); R(g, x - ri(3 + k * 12), fy - 5, ri(6 + k * 24), 3, '#b28cff'); alpha(g, 1);
  for (let i = 0; i < 9; i++) { const a = -0.3 - i * 0.28, v = 22 + (i * 7) % 15, px_ = x + ri(Math.cos(a) * v * k * 1.3 * (i & 1 ? -1 : 1)), py = fy - 3 + ri(Math.sin(a) * v * k - 16 * k * k * -1);
    R(g, px_, Math.min(fy - 1, py), i % 3 ? 2 : 3, i % 3 ? 2 : 3, i % 2 ? '#6c6a82' : i % 4 ? '#b28cff' : '#9a98b4'); }
}
// a low floor shard (the shatter's two runners): a cluster of three crystal points on a chip of shell, dust behind it. dir = the way it runs.
export function drawGeodeBit(g, x, fy, dir, t) {
  x = ri(x); fy = ri(fy);
  for (let i = 1; i <= 3; i++) { alpha(g, 0.4 - i * 0.1); R(g, x - dir * (4 + i * 4), fy - 2 - (i & 1), 3, 2, '#9a98b4'); } g.globalAlpha = 1;
  R(g, x - 4, fy - 2, 9, 2, '#4a4a5e'); R(g, x - 4, fy - 2, 9, 1, '#6c6a82');
  for (const [dx, h] of [[-3, 4], [0, 6], [3, 4]]) { R(g, x + dx - 1, fy - 2 - h, 2, h, '#7a4aa8'); px(g, x + dx - 1, fy - 2 - h, '#e8dcff'); px(g, x + dx, fy - 1 - h, '#b28cff'); }
  alpha(g, 0.35 * wave(t, 18)); R(g, x - 5, fy - 9, 11, 9, '#b28cff'); g.globalAlpha = 1;
}

// ====================================================================================== THE BURNING TOWER
// the shaft room (interior style 'gq3shaft', columns s0..s1, rows 22..F0-1): black ashlar coursed 8 px, mortar lines, soot above every slit, the slit windows (a tall narrow loop, a red flicker behind it)
function bakeShaft(w, h) {
  return once('shaft' + w + 'x' + h, () => { const [c, g] = canvas(w, h), rnd = mulberry(41);
    R(g, 0, 0, w, h, S.a);
    for (let r = 0, y = 0; y < h; r++, y += 8) { R(g, 0, y + 7, w, 1, S.dk); for (let x = (r & 1) * 12; x < w; x += 24) { R(g, x, y, 1, 7, S.dk); if (rnd() < 0.22) R(g, x + 2, y + 1, 8 + ((rnd() * 8) | 0), 5, S.b); else if (rnd() < 0.12) R(g, x + 3, y + 2, 6, 4, S.mor); } R(g, 0, y, w, 1, S.b); }
    for (let i = 0; i < 18; i++) { const sx = (rnd() * w) | 0, sy = (rnd() * h) | 0; R(g, sx, sy, 2, 10 + ((rnd() * 30) | 0), '#0e0c12'); }   // soot streaks
    R(g, 0, 0, 5, h, S.dk); R(g, w - 5, 0, 5, h, S.dk); R(g, 5, 0, 1, h, S.c); R(g, w - 6, 0, 1, h, S.b);   // the wall faces either side
    return c; });
}
const SLITS = [81, 69, 57, 45, 33];
export function paintShaft(g, sx, sy, w, h, tx0, ty0, time) {
  g.drawImage(bakeShaft(w, h), sx, sy);
  SLITS.forEach((fl, k) => { for (const [lx, hot] of [[w * 0.3, k], [w * 0.72, k + 2]]) { const x = ri(sx + lx), y = ri(sy + (fl - 8 - ty0) * 16);
      R(g, x - 3, y - 2, 7, 22, S.e); R(g, x - 3, y - 2, 7, 1, S.g); R(g, x - 3, y - 2, 1, 22, S.f); R(g, x + 3, y - 2, 1, 22, S.c);                       // the dressed stone surround
      R(g, x - 1, y, 3, 18, '#0a0810'); alpha(g, 0.5 + 0.4 * wave(time, 7 + hot, hot * 2)); R(g, x - 1, y + 2, 3, 14, '#c9462a'); R(g, x, y + 4, 1, 10, '#ffd36b'); alpha(g, 1);   // the loop, the fire outside
      R(g, x - 1, y + 7, 3, 1, '#0a0810');                                                                                                           // its cross-bar
      alpha(g, 0.1 + 0.05 * wave(time, 6, hot)); R(g, x - 14, y - 4, 29, 30, '#ff6b2c'); alpha(g, 1); } });
}
// a timber floor over its tile (x0..x1 in pixels, fy = its top): state 'smoke' (soot, a blackening seam, smoke) | 'burn' (alight, charred boards, joist ends hanging and dripping embers)
export function drawTimberFloor(g, x0, x1, fy, state, t, seed = 0) {
  x0 = ri(x0); x1 = ri(x1); fy = ri(fy);
  if (state === 'burn') {
    R(g, x0, fy, x1 - x0, 6, '#1a1210'); for (let x = x0; x < x1; x += 14) { R(g, x, fy, 1, 6, '#08060a'); R(g, x + 3 + ((x * 7) % 5), fy + 1, 3, 2, '#7a2a1a'); }
    alpha(g, 0.6 + 0.3 * wave(t, 9)); R(g, x0, fy + 1, x1 - x0, 1, '#ff6b2c'); R(g, x0, fy + 4, x1 - x0, 1, '#c9462a'); /* (claude/gq3tune) fire that hurts must LIGHT the room: banded firelight up the shaft, over the walls and the floor above, a hot white core along the boards */ for (let b = 0; b < 6; b++) { alpha(g, (0.2 - b * 0.03) * (0.85 + 0.15 * wave(t, 7, b))); R(g, x0 - 10 - b * 2, fy - 20 - b * 14, x1 - x0 + 20 + b * 4, 14, b < 2 ? '#ff8a3c' : '#ff6b2c'); } alpha(g, 0.35); R(g, x0 - 24, fy + 6, x1 - x0 + 48, 16, '#ff6b2c'); alpha(g, 0.7); R(g, x0, fy, x1 - x0, 2, '#ffd36b'); alpha(g, 1);
    for (let x = x0 + 2; x < x1 - 3; x += 7) { const h = 7 + 8 * wave(t, 8.3, x * 0.37 + seed) + 3 * wave(t, 5, x * 0.9) + (((x - x0) / 7) % 3 === 0 ? 5 : 0); drawFlame(g, x + 2, fy + 1, h, t, x * 0.5 + seed, 6); }
    for (let x = x0 + 5; x < x1 - 6; x += 22) { const l = 5 + ((x * 5) % 6), ph = (t * 0.9 + x * 0.07) % 1; R(g, x, fy + 6, 3, l, '#2a1a14'); px(g, x + 1, fy + 6 + l, '#ff9a5c'); alpha(g, 1 - ph); R(g, x + 1, fy + 7 + l + ri(ph * 12), 1, 2, '#ffd36b'); alpha(g, 1); }   // the joist ends hanging charred, dripping embers
    for (let i = 0; i < 8; i++) { const ph = (t * 0.7 + i * 0.131) % 1; alpha(g, 1 - ph); R(g, ri(x0 + ((i * 97 + 41 + seed * 13) % Math.max(1, x1 - x0)) + Math.sin(t * 2 + i) * 4), ri(fy - 8 - ph * 60), 1, 1, i & 1 ? '#ffd36b' : '#ff9a5c'); } alpha(g, 1);
  } else {
    alpha(g, 0.45); R(g, x0, fy, x1 - x0, 3, '#0a0808'); for (let x = x0 + 4; x < x1; x += 11) R(g, x, fy + 1, 5, 1, '#3a1810'); alpha(g, 0.55 + 0.35 * wave(t, 5, seed)); R(g, x0, fy + 2, x1 - x0, 1, '#ff6b2c'); alpha(g, 0.25 + 0.15 * wave(t, 5, seed)); R(g, x0 - 4, fy - 10, x1 - x0 + 8, 12, '#c9462a'); alpha(g, 1);   /* the seam glows: this floor is about to catch */   // soot on the boards, a red seam opening along them
    for (let x = x0 + 3; x < x1 - 4; x += 12) { const ph = (t * 0.8 + x * 0.13) % 1; alpha(g, 0.55 * (1 - ph)); R(g, x + ri(Math.sin(t + x) * 3), fy - 3 - ri(ph * 28), 5 + ri(ph * 5), 4 + ri(ph * 3), ph < 0.3 ? '#4a4a58' : '#6a6a78'); } alpha(g, 1);   // smoke, rolling up
  }
}
// the gaps in each plank floor: a timber curb at either end, a hemp rope between them (the stair's well)
export function drawStairwell(g, x0, x1, fy) {
  x0 = ri(x0); x1 = ri(x1); fy = ri(fy);
  for (const x of [x0 - 1, x1 - 2]) { R(g, x, fy - 9, 3, 9, '#2a1a10'); R(g, x, fy - 9, 1, 9, '#5a3a20'); R(g, x - 1, fy - 10, 5, 2, '#3a3a46'); px(g, x, fy - 10, '#9a9ab0'); }
  for (let x = x0 + 2; x < x1 - 2; x++) px(g, x, fy - 8 + (((x - x0) % 8) === 4 ? 2 : (((x - x0) % 8) === 3 || ((x - x0) % 8) === 5) ? 1 : 0), '#a8885a');
  R(g, x0 + 3, fy - 3, 2, 3, '#2a1a10'); R(g, x1 - 6, fy - 3, 2, 3, '#2a1a10');
}
// the beam's tell (1.0 s, '!!'): the ceiling creaking above, dust trickling down a column, the spot on the floor hatched red
export function drawBeamTell(g, bx, fy, t) {
  bx = ri(bx); fy = ri(fy); const p = wave(t, 22);
  alpha(g, 0.35 + 0.35 * p); R(g, bx - 12, fy - 2, 24, 2, '#ff6b6b'); for (let i = 0; i < 6; i++) R(g, bx - 11 + i * 4, fy - 4 - (i & 1), 2, 2, '#ff6b6b'); alpha(g, 0.14); R(g, bx - 11, fy - 90, 22, 88, '#ff6b2c'); alpha(g, 1);
  for (let i = 0; i < 7; i++) { const ph = (t * 1.6 + i * 0.17) % 1; alpha(g, 1 - ph * 0.6); R(g, bx - 9 + ((i * 11) % 19), ri(fy - 150 + ph * 150), 1, 2 + (i & 1), i % 3 ? '#9a8a78' : '#5a4a3a'); } alpha(g, 1);
  alpha(g, 0.6 + 0.3 * p); R(g, bx - 8, fy - 150, 16, 2, '#ff9a5c'); R(g, bx - 3, fy - 152, 6, 2, '#ffd36b'); alpha(g, 1);   // the glowing crack in the ceiling the beam hangs from
}
// the beam in flight (k 1..0 = how far still to fall; variant flips its flame) and, over the last third, the IMPACT: splinters, a dust ring, embers
export function drawBeamFall(g, bx, fy, k, t) {
  bx = ri(bx); fy = ri(fy); const dir = (ri(bx / 16) & 1) ? 1 : -1;   // two variants: it leans one way or the other
  const beam = (x, y, len, lean) => {   // a charred oak timber 12 wide, sheared so it tumbles; iron bands; hot cracks; the burning end up
    for (let i = 0; i < len; i++) { const o = ri(i * lean), w = 12; R(g, x - 6 + o, y + i, w, 1, '#1a1210'); R(g, x - 5 + o, y + i, w - 2, 1, i % 7 === 3 ? '#150e0a' : '#3a2616'); R(g, x - 5 + o, y + i, 3, 1, '#5a3a20'); if ((i * 7 + x) % 11 === 0) R(g, x - 2 + o, y + i, 1, 3, '#ff6b2c'); }
    for (const bi of [len * 0.28, len * 0.7]) { const i = ri(bi), o = ri(i * lean); R(g, x - 7 + o, y + i, 14, 3, '#5a6270'); R(g, x - 7 + o, y + i, 14, 1, '#9a9ab0'); px(g, x - 5 + o, y + i + 1, '#14151d'); px(g, x + 4 + o, y + i + 1, '#14151d'); }
  };
  if (k > 0.3) { const f = Math.floor(t * 20) & 1, y = fy - ri(150 * k) - 8, lean = dir * (0.18 + 0.08 * f);
    beam(bx, y, 56, lean);
    drawFlame(g, bx + (f ? -1 : 1), y + 4, 16 + 4 * f, t, 3, 11);
    for (let i = 0; i < 6; i++) { alpha(g, 0.7 - i * 0.1); R(g, bx - 4 + ((i * 5) % 9), y - 6 - i * 6, 2, 2, i & 1 ? '#ffd36b' : '#ff9a5c'); } alpha(g, 1); }
  else { const q = k / 0.3;   // IMPACT: the timber slammed down and leaning, its splinters up, a ring of dust, embers
    beam(bx, fy - 30 + ri(10 * (1 - q)), 40, dir * 0.45);
    for (let i = 0; i < 9; i++) { const a = -0.2 - i * 0.33, v = 26 + (i * 9) % 22, e = 1 - q; R(g, bx + ri(Math.cos(a) * v * e * (i & 1 ? 1 : -1)), fy - 4 + ri(Math.sin(a) * v * e), 2 + (i & 1), 1 + (i & 1), i % 3 ? '#5a3a20' : '#ff9a5c'); }
    alpha(g, 0.6 * q); R(g, bx - ri(14 + (1 - q) * 20), fy - 3, ri(28 + (1 - q) * 40), 3, '#9a8a78'); alpha(g, 0.8 * q); R(g, bx - 8, fy - 2, 16, 2, '#ffd36b'); alpha(g, 1); }
}
// the hatch up to the deck (cols hx..hx+1 across the deck floor `fy`): a stone coping, an iron hinge, the ladder's rails standing out over the hole, the fire's glow coming up it
export function drawTowerHatch(g, hx, fy, t) {
  hx = ri(hx); fy = ri(fy); const W = 32;
  alpha(g, 0.5 + 0.2 * wave(t, 8)); R(g, hx + 2, fy, W - 4, 30, '#c9462a'); R(g, hx + 8, fy + 6, W - 16, 18, '#ff9a5c'); alpha(g, 0.3 + 0.2 * wave(t, 11)); R(g, hx - 8, fy - 36, W + 16, 36, '#ff6b2c'); alpha(g, 1);
  for (let i = 0; i < 5; i++) { const ph = (t * 0.8 + i * 0.21) % 1; alpha(g, 1 - ph); R(g, hx + 4 + ((i * 7) % 24), ri(fy - ph * 50), 1, 1, i & 1 ? '#ffd36b' : '#ff9a5c'); } alpha(g, 1);
  R(g, hx - 6, fy - 3, 7, 3, S.d); R(g, hx - 6, fy - 3, 7, 1, S.g); R(g, hx + W - 1, fy - 3, 7, 3, S.d); R(g, hx + W - 1, fy - 3, 7, 1, S.g);                                  // the coping
  R(g, hx - 1, fy, 2, 8, S.dk); R(g, hx + W - 1, fy, 2, 8, S.dk);
  for (const x of [hx + 8, hx + 20]) { R(g, x, fy - 14, 2, 14, '#6a4a2a'); R(g, x, fy - 14, 1, 14, '#9a6a3a'); R(g, x, fy - 16, 2, 2, '#9a9ab0'); }   // the ladder's rails
  for (let y = fy - 12; y < fy; y += 4) R(g, hx + 8, y, 14, 1, '#4a3620');
  R(g, hx + W + 5, fy - 11, 3, 3, '#5a6270'); R(g, hx + W + 5, fy - 11, 3, 1, '#9a9ab0'); R(g, hx + W + 7, fy - 8, 7, 2, '#3a3a46');   // a hinge and the door thrown back, long since burnt
}

// ====================================================================================== THE TOWER TOP
// a parapet walk (one-way stone, tile cols a..b at row `row`): a worn slab with coursing, corbels under, a merlon at each end
export function drawParapetWalk(g, a, b, row, cx, cy, t) {
  const x0 = ri(a * 16 - cx), x1 = ri((b + 1) * 16 - cx), y = ri(row * 16 - cy), w = x1 - x0;
  R(g, x0, y, w, 16, S.d); R(g, x0, y, w, 2, S.g); R(g, x0, y + 2, w, 1, S.f); R(g, x0, y + 13, w, 3, S.b); R(g, x0, y + 15, w, 1, S.dk);
  for (let x = x0 + 8; x < x1 - 2; x += 16) { R(g, x, y + 3, 1, 10, S.b); } for (let x = x0; x < x1; x += 16) R(g, x + 3, y + 5, 7, 1, S.c);
  for (let x = x0 + 12; x < x1 - 8; x += 24) { R(g, x, y + 16, 8, 3, S.c); R(g, x + 1, y + 19, 6, 3, S.b); R(g, x + 2, y + 22, 4, 2, S.a); }    // corbels
  alpha(g, 0.3 + 0.1 * wave(t, 5, a)); R(g, x0, y + 2, w, 4, '#ff6b2c'); alpha(g, 1);                                                                     // the fire below, on the underside of the slab's lip
  for (const mx of [x0 - 1, x1 - 7]) { R(g, mx, y - 8, 8, 8, S.e); R(g, mx, y - 8, 8, 1, S.g); R(g, mx, y - 8, 1, 8, S.f); R(g, mx + 7, y - 8, 1, 8, S.b); R(g, mx + 2, y - 5, 1, 4, S.dk); }
}
// the two-step stone stairs up each walk (tile cols a..b at row `row`)
export function drawStoneStep(g, a, b, row, cx, cy) {
  const x0 = ri(a * 16 - cx), w = (b - a + 1) * 16, y = ri(row * 16 - cy);
  R(g, x0, y, w, 16, S.c); R(g, x0, y, w, 2, S.f); R(g, x0, y + 13, w, 3, S.a); for (let x = x0 + 8; x < x0 + w; x += 16) R(g, x, y + 3, 1, 9, S.b); R(g, x0, y + 2, 1, 14, S.e);
}
// the bell cupola over the deck: a drum of stone (4 cols x 3 rows, an arch opening on the front), a colonnade rising to the roof slab (the one-way frame, cols fx0..fx1 at row fr), a bronze bell hung in the fire-lit dark
export function drawCupola(g, x0, x1, solidTop, fx0, fx1, fr, cx, cy, t) {
  const X0 = ri(x0 * 16 - cx), X1 = ri((x1 + 1) * 16 - cx), YT = ri(solidTop * 16 - cy), w = X1 - X0, FX0 = ri(fx0 * 16 - cx), FX1 = ri((fx1 + 1) * 16 - cx), FY = ri(fr * 16 - cy);
  R(g, X0, YT, w, 48, S.c); R(g, X0, YT, w, 3, S.g); R(g, X0, YT + 3, w, 1, S.f); R(g, X0, YT + 44, w, 4, S.a);                                            // the drum
  for (let y = YT + 8; y < YT + 44; y += 8) { R(g, X0, y, w, 1, S.b); for (let x = X0 + ((y / 8) & 1) * 10; x < X1; x += 20) R(g, x, y, 1, 8, S.b); }
  R(g, X0 - 3, YT - 2, w + 6, 4, S.e); R(g, X0 - 3, YT - 2, w + 6, 1, S.g);                                                                                   // the cornice
  const ax = X0 + 12, aw = w - 24; R(g, ax, YT + 14, aw, 34, '#08060a'); R(g, ax + 2, YT + 12, aw - 4, 3, '#08060a'); alpha(g, 0.55 + 0.25 * wave(t, 7)); R(g, ax + 3, YT + 30, aw - 6, 18, '#c9462a'); R(g, ax + 8, YT + 38, aw - 16, 10, '#ff9a5c'); alpha(g, 1);   // the arch, the fire behind
  R(g, ax - 3, YT + 14, 3, 34, S.d); R(g, ax + aw, YT + 14, 3, 34, S.a); R(g, ax - 3, YT + 11, aw + 6, 3, S.e);
  for (const x of [FX0 + 1, FX1 - 6]) { R(g, x, FY + 16, 5, YT - FY - 16, S.d); R(g, x, FY + 16, 1, YT - FY - 16, S.f); R(g, x + 4, FY + 16, 1, YT - FY - 16, S.a); R(g, x - 1, YT - 4, 7, 4, S.e); }   // the colonnade's posts
  const bx = ri((FX0 + FX1) / 2), sw = ri(Math.sin(t * 2.2) * 3);                                                                                             // the bell, in the open stage
  R(g, bx - 1, FY + 16, 2, 6, '#5a6270'); R(g, bx - 8 + sw, FY + 22, 16, 14, '#8a6a1a'); R(g, bx - 7 + sw, FY + 22, 4, 14, '#c9a83a'); R(g, bx - 5 + sw, FY + 22, 3, 12, '#e0c04a'); R(g, bx - 10 + sw, FY + 34, 20, 3, '#6a4a10'); R(g, bx - 9 + sw, FY + 34, 18, 1, '#e0c04a'); R(g, bx - 1 + sw, FY + 37, 2, 3, '#3a2a08');
  R(g, FX0 - 3, FY, FX1 - FX0 + 6, 9, S.e); R(g, FX0 - 3, FY, FX1 - FX0 + 6, 2, S.g); R(g, FX0, FY + 9, FX1 - FX0, 4, S.c); R(g, FX0 - 3, FY + 7, FX1 - FX0 + 6, 2, S.a);   // the roof slab
  R(g, bx - 1, FY - 9, 3, 9, '#e0b040'); px(g, bx, FY - 10, '#fff6c8'); R(g, bx - 3, FY - 4, 7, 2, '#a0781c'); px(g, bx, FY - 6, '#c9463d');                    // a gold finial with a stone
}
// a bay's floor span (x0..x1 world px, fy = deck top): idle = a timber hatch-board set in the slates (so you can tell which bay it is), smoke = soot and a red seam and smoke, burn = alight
export function drawBay(g, x0, x1, fy, state, t, i = 0) {
  x0 = ri(x0); x1 = ri(x1); fy = ri(fy);
  if (state === 'idle') { R(g, x0 + 2, fy, x1 - x0 - 4, 4, '#2a1a10'); R(g, x0 + 2, fy, x1 - x0 - 4, 1, '#6a4a2a'); for (let x = x0 + 8; x < x1 - 4; x += 8) R(g, x, fy + 1, 1, 3, '#0e0806'); for (const x of [x0 + 5, x1 - 7]) { R(g, x, fy + 1, 2, 2, '#9a9ab0'); }   // oak boards, iron nailed
    R(g, x0, fy - 1, 3, 5, S.dk); R(g, x1 - 3, fy - 1, 3, 5, S.dk); return; }
  if (state === 'smoke') { R(g, x0 + 2, fy, x1 - x0 - 4, 4, '#1a0e08'); alpha(g, 0.5 + 0.4 * wave(t, 12, i)); R(g, x0 + 3, fy + 1, x1 - x0 - 6, 1, '#ff6b2c'); R(g, x0 + 10, fy + 2, x1 - x0 - 20, 1, '#ffd36b'); alpha(g, 1);
    for (let x = x0 + 4; x < x1 - 4; x += 10) { const ph = (t * 0.9 + x * 0.17) % 1; alpha(g, 0.6 * (1 - ph)); R(g, x + ri(Math.sin(t + x) * 3), fy - 4 - ri(ph * 30), 6 + ri(ph * 6), 5 + ri(ph * 4), ph < 0.25 ? '#4a4a58' : '#7a7a88'); } alpha(g, 1); return; }
  R(g, x0 + 2, fy, x1 - x0 - 4, 4, '#08060a'); alpha(g, 0.28); R(g, x0 - 6, fy - 30, x1 - x0 + 12, 30, '#ff6b2c'); alpha(g, 1);
  for (let x = x0 + 4; x < x1 - 2; x += 7) { const h = 8 + 9 * wave(t, 9, x * 0.37 + i) + 3 * wave(t, 5, x * 0.9) + (((x - x0) / 7) % 3 === 0 ? 5 : 0); drawFlame(g, x + 2, fy + 1, h, t, x * 0.5 + i, 6); }
  for (let k = 0; k < 6; k++) { const ph = (t * 0.7 + k * 0.17) % 1; alpha(g, 1 - ph); R(g, ri(x0 + 4 + ((k * 53) % Math.max(1, x1 - x0 - 8))), ri(fy - 10 - ph * 54), 1, 1, k & 1 ? '#ffd36b' : '#ff9a5c'); } alpha(g, 1);
}
// THE ROOF BACK, the new tower top's: over the shared night (GQA.drawRoofBack), behind the deck - two spires and the old bell turret in silhouette far off, and straight up out of the hatch the tower's own fire, a column of smoke and sparks (world x hx)
export function drawRoofBack2(g, cx, cy, VW, VH, t, hx, deckY) {
  const hz = ri(VH * 0.78 - cy * 0.12);
  for (const [i, bx, w, h] of [[0, 90, 20, 70], [1, 250, 14, 96], [2, 400, 26, 58]]) { const sx = ri(((bx - cx * 0.18) % (VW + 120) + VW + 120) % (VW + 120)) - 60, top = hz - h - 40;
    R(g, sx, top + 14, w, h, '#150e1a'); for (let k = 0; k < 7; k++) R(g, sx + k * (w >> 3) + ((w >> 1) - 6), top + 14 - k * 2 - 2, Math.max(2, w - k * (w >> 2)), 3, '#150e1a'); R(g, sx + (w >> 1) - 1, top - 6 + 8, 2, 12, '#150e1a');
    for (let wy = top + 22; wy < top + h; wy += 14) { alpha(g, 0.5 + 0.4 * wave(t, 6, i * 3 + wy)); R(g, sx + 4, wy, 2, 5, '#ff9a3c'); alpha(g, 1); } }
  const X = ri(hx - cx * 0.9) + 16, Y = ri(deckY - cy);
  for (let j = 0; j < 22; j++) { const ph = (t * 0.22 + j * 0.045) % 1, w = 10 + ph * 46; alpha(g, 0.55 * (1 - ph)); R(g, ri(X - w / 2 + Math.sin(j * 1.7 + t) * 8 + ph * 14), ri(Y - 6 - ph * 190), ri(w), ri(8 + ph * 10), ph < 0.25 ? '#6a2a1a' : ph < 0.55 ? '#3a2a32' : '#2a2430'); } alpha(g, 1);
  for (let i = 0; i < 14; i++) { const ph = (t * 0.35 + i * 0.071) % 1; alpha(g, 1 - ph); R(g, ri(X + Math.sin(i * 2.3 + t * 1.3) * 18 * (0.4 + ph)), ri(Y - ph * 170), 1, 1, i & 1 ? '#ffd36b' : '#ff9a5c'); } alpha(g, 1);
}

// ====================================================================================== THE QUEEN'S STAIR
const QS = { gate: [661, 667, 14, 19], steps: [[654, 656, 17], [657, 658, 15], [659, 660, 13]], catwalk: [[670, 673, 6], [674, 680, 6]], alcove: [686, 688, 17, 19], gallery: { x0: 704, x1: 715, row: 12 }, banners: [706, 710, 714] };
// the dropped portcullis: a round arch of voussoirs with a gold crown boss, the barred iron gate in it (vertical bars, three cross-bands, spikes sunk in the sill), the chains up into the winch slot, torn banners either side
function drawGate(g, cx, cy, t) {
  const [a, b, r0, r1] = QS.gate, X0 = ri(a * 16 - cx), W = (b - a + 1) * 16, Y0 = ri(r0 * 16 - cy), H = (r1 - r0 + 1) * 16, mid = X0 + (W >> 1);
  R(g, X0 - 4, Y0 - 10, W + 8, H + 10, S.dk); R(g, X0, Y0 - 6, W, H + 6, '#08060a');                                                                      // the passage, black
  R(g, X0 - 6, Y0 - 14, W + 12, 13, S.d); R(g, X0 - 6, Y0 - 14, W + 12, 2, S.g); R(g, X0 - 6, Y0 - 12, W + 12, 1, S.f); R(g, X0 - 6, Y0 - 2, W + 12, 1, S.dk); for (let x = X0 + 6; x < X0 + W; x += 22) R(g, x, Y0 - 11, 1, 9, S.dk);   // a dressed lintel over the passage, its joints cut
  R(g, X0 - 6, Y0 - 12, 5, H + 12, S.d); R(g, X0 - 6, Y0 - 12, 5, 1, S.g); R(g, X0 + W + 1, Y0 - 12, 5, H + 12, S.b);                                         // the jambs
  R(g, mid - 4, Y0 - 24, 9, 12, '#a0781c'); R(g, mid - 4, Y0 - 24, 9, 2, '#fff6c8'); for (const k of [-3, 0, 3]) { R(g, mid + k - 1, Y0 - 29 - (k === 0 ? 3 : 0), 2, 6, '#e0b040'); px(g, mid + k, Y0 - 24, '#c9463d'); } R(g, mid - 5, Y0 - 13, 11, 2, '#5a6270');   // the Queen's crown for a keystone
  const gy0 = Y0 - 2;
  for (let x = X0 + 3; x < X0 + W - 2; x += 7) { R(g, x, gy0, 3, H - 2, '#2a2a34'); R(g, x, gy0, 1, H - 2, '#9a9ab0'); R(g, x + 2, gy0, 1, H - 2, '#14151d'); R(g, x - 1, gy0 + H - 8, 5, 8, '#2a2a34'); px(g, x + 1, gy0 + H - 3, '#9a9ab0'); }   // the bars, and the spikes at their feet
  for (const y of [gy0 + 10, gy0 + 38, gy0 + 66]) { R(g, X0, y, W, 4, '#3a3a46'); R(g, X0, y, W, 1, '#9a9ab0'); for (let x = X0 + 5; x < X0 + W - 3; x += 14) px(g, x, y + 2, '#14151d'); }
  for (const x of [X0 + 14, X0 + W - 17]) { for (let y = Y0 - 20; y < gy0; y += 3) { R(g, x, y, 2, 2, (y & 3) ? '#6a6a7c' : '#3a3a46'); } R(g, x - 2, Y0 - 22, 6, 3, '#5a6270'); }   // the chains up to the winch
  for (const [bx, k] of [[X0 - 14, -1], [X0 + W + 9, 1]]) { const sw = ri(Math.sin(t * 1.4 + bx) * 2); R(g, bx, Y0 - 4, 7, 2, '#3a3a46'); R(g, bx + sw, Y0 - 2, 6, 34, '#5a2a7a'); R(g, bx + sw, Y0 - 2, 2, 34, '#7a3a9a'); R(g, bx + 2 + sw, Y0 + 10, 2, 4, '#e0b040'); for (let i = 0; i < 3; i++) R(g, bx + sw + i * 2, Y0 + 32 - (i & 1) * 3, 2, 3, '#5a2a7a'); void k; }   // torn purple banners
}
// the stone flights up the gatehouse face: treads worn pale in the middle, a dark nosing shadow, an iron rail on posts with a hand-worn rail, a rime of snow on the low steps
function drawFlights(g, cx, cy, t) {
  for (const [a, b, st] of QS.steps) { const X0 = ri(a * 16 - cx), W = (b - a + 1) * 16, Y = ri((st + 1) * 16 - cy);
    R(g, X0, Y, W, 2, S.g); R(g, X0 + 2, Y + 2, W - 4, 2, S.e); R(g, X0 + 4, Y + 1, W - 12, 1, '#c8c8dc'); R(g, X0, Y + 3, W, 1, S.dk);
    R(g, X0 + W - 2, Y, 2, 16, S.dk); for (let x = X0 + 5; x < X0 + W - 3; x += 9) R(g, x, Y + 6, 1, 8, S.a);
    for (const x of [X0 + 3, X0 + W - 6]) { R(g, x, Y - 15, 2, 15, '#2a2a34'); R(g, x, Y - 15, 1, 15, '#7a7a8c'); px(g, x, Y - 16, '#9a9ab0'); }
    R(g, X0 + 3, Y - 15, W - 6, 2, '#3a3a46'); R(g, X0 + 3, Y - 15, W - 6, 1, '#9a9ab0'); }
  void t;
}
// the catwalks hung on chains: an iron grating deck (dark, with riveted ribs), a hemp rope rail on posts
function drawCatwalks(g, cx, cy, t) {
  for (const [a, b, row] of QS.catwalk) { const X0 = ri(a * 16 - cx), W = (b - a + 1) * 16, Y = ri(row * 16 - cy);
    R(g, X0, Y, W, 5, '#1a1a22'); R(g, X0, Y, W, 1, '#9a9ab0'); for (let x = X0 + 2; x < X0 + W; x += 4) R(g, x, Y + 1, 2, 3, '#3a3a46'); R(g, X0, Y + 5, W, 2, '#3a3a46'); for (let x = X0 + 6; x < X0 + W; x += 16) { R(g, x, Y + 5, 2, 3, '#5a6270'); }
    for (const x of [X0 + 2, X0 + W - 4]) { R(g, x, Y - 12, 2, 12, '#2a1a10'); R(g, x, Y - 12, 1, 12, '#5a3a20'); }
    for (let x = X0 + 4; x < X0 + W - 4; x++) px(g, x, Y - 11 + (((x - X0) % 12) === 6 ? 2 : (((x - X0) % 12) === 5 || ((x - X0) % 12) === 7) ? 1 : 0), '#a8885a'); }
  void t;
}
// the geode grille over the ladder's foot (cells col x, rows y0..y1): iron bars with violet geode nodules grown into them, glowing; smashed = the bars flung, a few shards, the ladder showing
export function drawGrille(g, x, y, t, smashed, sm = 0) {
  const X = ri(x) - 8, Y = ri(y) - 24;
  if (smashed) { for (let i = 0; i < 6; i++) { const e = Math.min(1, sm * 1.6); alpha(g, Math.max(0, 1 - sm * 1.3)); R(g, X + 2 + ((i * 5) % 12) + ri((i - 3) * 6 * e), Y + 6 + ri(e * (14 + i * 4)) + (i % 3) * 8, 2, 4, i & 1 ? '#7a7a8c' : '#7a4aa8'); } alpha(g, 1); for (const [dx, dy] of [[-2, 28], [10, 30], [4, 31]]) px(g, X + 8 + dx, Y + dy, '#b28cff'); return; }
  for (const [x0, h] of [[X, 32], [X + 14, 32]]) { R(g, x0, Y, 3, h, '#2a2a34'); R(g, x0, Y, 1, h, '#9a9ab0'); }
  for (let i = 0; i < 4; i++) { const bx = X + 3 + i * 3; R(g, bx, Y + 2, 2, 28, '#3a3a46'); R(g, bx, Y + 2, 1, 28, '#9a9ab0'); }
  for (const yy of [Y + 4, Y + 14, Y + 24]) { R(g, X, yy, 17, 3, '#4a4a56'); R(g, X, yy, 17, 1, '#9a9ab0'); }
  for (const [nx, ny, r] of [[X + 6, Y + 9, 1], [X + 11, Y + 18, 2], [X + 5, Y + 26, 1], [X + 12, Y + 6, 0]]) { R(g, nx - r - 1, ny - r - 1, 2 * r + 3, 2 * r + 3, '#5a4a7a'); R(g, nx - r, ny - r, 2 * r + 1, 2 * r + 1, '#7a4aa8'); px(g, nx - r, ny - r, '#e8dcff'); px(g, nx, ny - r - 2, '#b28cff'); }
  alpha(g, 0.12 + 0.1 * wave(t, 5)); R(g, X - 4, Y - 2, 25, 36, '#b28cff'); alpha(g, 1);
}
// a geode counterweight on its chain: (wx, ceilY) the chain's top, bobY the bob's top; hit = it has dropped (then it lies broken on the store floor at floorY, its chain slack)
export function drawWeight(g, wx, ceilY, bobY, floorY, hit, t) {
  wx = ri(wx); ceilY = ri(ceilY); bobY = ri(bobY); floorY = ri(floorY);
  if (hit) { R(g, wx - 8, floorY - 5, 16, 5, '#4a4a5e'); R(g, wx - 8, floorY - 5, 16, 1, '#6c6a82'); R(g, wx - 5, floorY - 11, 3, 6, '#7a4aa8'); R(g, wx, floorY - 14, 3, 9, '#b28cff'); px(g, wx, floorY - 14, '#e8dcff'); R(g, wx + 4, floorY - 9, 2, 4, '#7a4aa8'); R(g, wx - 12, floorY - 2, 5, 2, '#6c6a82'); R(g, wx + 9, floorY - 3, 4, 3, '#4a4a5e');
    for (let i = 0; i < 6; i++) R(g, wx + 8 + i * 2, floorY - 1 - (i & 1), 2, 1, i & 1 ? '#6a6a7c' : '#3a3a46'); return; }
  for (let y = ceilY; y < bobY; y += 3) { R(g, wx, y, 2, 2, (y & 3) ? '#8a8a9c' : '#4a4a56'); }
  R(g, wx - 4, bobY - 4, 9, 4, '#5a6270'); R(g, wx - 4, bobY - 4, 9, 1, '#9a9ab0');                                                                    // the iron cap
  ellipse(g, wx, bobY + 10, 10, 11, '#14151d'); ellipse(g, wx, bobY + 10, 9, 10, '#4a4a5e'); ellipse(g, wx - 1, bobY + 9, 7, 8, '#6c6a82');
  for (const [dx, dy, h] of [[-4, 14, 8], [-1, 15, 11], [2, 15, 9], [5, 13, 6]]) { R(g, wx + dx - 1, bobY + dy - h, 2, h, '#7a4aa8'); px(g, wx + dx - 1, bobY + dy - h, '#e8dcff'); px(g, wx + dx, bobY + dy - h + 1, '#b28cff'); }
  R(g, wx - 7, bobY + 3, 3, 1, '#9a98b4'); alpha(g, 0.16 + 0.1 * wave(t, 4, wx)); R(g, wx - 13, bobY - 2, 27, 26, '#b28cff'); alpha(g, 1);
}
// the pivot slab (sl = [x0 col, x1 col, row]): hung down from its pin, or swung level (a stone slab with a brass pin, a rune line and a worn top)
export function drawSlab(g, x0, x1, row, cx, cy, hit, t) {
  const X = ri(x0 * 16 - cx), W = (x1 - x0 + 1) * 16, Y = ri(row * 16 - cy);
  if (hit) { R(g, X, Y, W, 7, S.d); R(g, X, Y, W, 2, S.g); R(g, X, Y + 2, W, 1, S.f); R(g, X, Y + 6, W, 1, S.dk); for (let x = X + 8; x < X + W - 4; x += 16) R(g, x, Y + 3, 1, 3, S.b); R(g, X + 6, Y + 3, W - 12, 1, '#7a4aa8'); R(g, X - 3, Y - 1, 5, 9, '#a0781c'); R(g, X - 3, Y - 1, 5, 1, '#fff6c8'); alpha(g, 0.25 + 0.15 * wave(t, 6)); R(g, X + 6, Y + 3, W - 12, 1, '#e8dcff'); alpha(g, 1); return; }
  R(g, X - 3, Y - 2, 6, 6, '#a0781c'); R(g, X - 3, Y - 2, 6, 1, '#fff6c8'); px(g, X - 1, Y, '#5a3a08');                                                          // the pin
  R(g, X, Y + 4, 7, W - 4, S.d); R(g, X, Y + 4, 2, W - 4, S.g); R(g, X + 5, Y + 4, 2, W - 4, S.b); R(g, X + 3, Y + 10, 1, W - 16, '#7a4aa8');                // hanging down its pin, edge on
}
// the store room (interior 'gq3store', cols 685..703, rows 2..19): a vault of black stone, a beam and three pulleys over the weights, geode-lined niches in the back wall, violet veins
function bakeStore(w, h) {
  return once('store' + w + 'x' + h, () => { const [c, g] = canvas(w, h), rnd = mulberry(23);
    R(g, 0, 0, w, h, S.b);
    for (let r = 0, y = 0; y < h; r++, y += 8) { R(g, 0, y + 7, w, 1, S.dk); for (let x = (r & 1) * 12; x < w; x += 24) R(g, x, y, 1, 7, S.dk); if (rnd() < 0.5) R(g, ((rnd() * w) | 0), y + 1, 10, 5, S.c); }
    for (let i = 0; i < 4; i++) { const nx = 40 + i * 70 + ((rnd() * 20) | 0), ny = 40 + ((rnd() * 80) | 0); R(g, nx - 2, ny - 2, 24, 30, S.dk); R(g, nx, ny, 20, 26, '#0a0810'); R(g, nx + 2, ny - 3, 16, 3, S.dk);   // niches
      for (let k = 0; k < 5; k++) { const kx = nx + 2 + k * 3, kh = 5 + ((rnd() * 9) | 0); R(g, kx, ny + 26 - kh, 2, kh, k & 1 ? '#7a4aa8' : '#5a3a8a'); px(g, kx, ny + 26 - kh, '#e8dcff'); } }
    for (let i = 0; i < 9; i++) { const vx = (rnd() * w) | 0, vy = 20 + ((rnd() * (h - 60)) | 0); line(g, vx, vy, vx + ((rnd() * 20) | 0) - 10, vy + 14 + ((rnd() * 18) | 0), '#3a1a6a', 1); px(g, vx, vy, '#b28cff'); }
    R(g, 0, 0, w, 22, S.dk); R(g, 0, 0, w, 6, S.a); R(g, 0, 22, w, 1, S.c); for (let x = 12; x < w; x += 44) { R(g, x, 6, 6, 16, S.d); R(g, x, 6, 1, 16, S.f); }   // the ceiling beam course and its corbels
    R(g, 0, h - 6, w, 6, S.dk); return c; });
}
export function paintStore(g, sx, sy, w, h, tx0, ty0, time) {
  g.drawImage(bakeStore(w, h), sx, sy);
  for (const wc of [691, 695, 699]) { const x = ri(sx + (wc - tx0) * 16 + 8); R(g, x - 8, sy + 8, 16, 7, '#3a3a46'); R(g, x - 8, sy + 8, 16, 1, '#9a9ab0'); R(g, x - 4, sy + 15, 8, 5, '#5a6270'); px(g, x, sy + 17, '#14151d'); }   // the pulley blocks over the three weights
  alpha(g, 0.07 + 0.04 * wave(time, 3)); R(g, sx, sy + 22, w, h - 28, '#b28cff'); alpha(g, 1);
}
// the princess's hoard in the alcove (cols 686..688, rows 17..19): a niche, a small altar of upturned crates, a toy crown, ribbons, a doll, gems winking
function drawAlcove(g, cx, cy, t) {
  const [a, b, r0, r1] = QS.alcove, X0 = ri(a * 16 - cx), W = (b - a + 1) * 16, Y0 = ri(r0 * 16 - cy), H = (r1 - r0 + 1) * 16;
  R(g, X0 - 3, Y0 - 4, W + 6, H + 4, S.dk); R(g, X0, Y0, W, H, '#0a0810'); for (let i = 0; i < 8; i++) { const a0 = Math.PI * (1 - i / 7); R(g, X0 + (W >> 1) + ri(Math.cos(a0) * (W / 2 + 1)) - 3, Y0 - 3 - ri(Math.sin(a0) * 6), 6, 4, i & 1 ? S.e : S.d); }
  R(g, X0 + 4, Y0 + H - 14, W - 8, 14, '#3a2614'); R(g, X0 + 4, Y0 + H - 14, W - 8, 2, '#6a4a2a'); R(g, X0 + 8, Y0 + H - 22, W - 16, 8, '#4a3220'); R(g, X0 + 8, Y0 + H - 22, W - 16, 1, '#8a6a3a');   // crates for an altar
  R(g, X0 + 14, Y0 + H - 27, 14, 5, '#a0781c'); for (const k of [14, 19, 24]) { R(g, X0 + k, Y0 + H - 31, 3, 4, '#e0b040'); px(g, X0 + k + 1, Y0 + H - 27, '#c9463d'); }                                                   // a toy tiara
  R(g, X0 + 32, Y0 + H - 30, 8, 8, '#f6a8d0'); R(g, X0 + 33, Y0 + H - 36, 6, 6, '#6faa4a'); px(g, X0 + 34, Y0 + H - 34, '#1b1626'); px(g, X0 + 37, Y0 + H - 34, '#1b1626'); R(g, X0 + 31, Y0 + H - 26, 2, 5, '#6faa4a'); R(g, X0 + 39, Y0 + H - 26, 2, 5, '#6faa4a');   // a goblin doll in pink
  for (const [dx, dy, c] of [[8, 8, '#ff4a6a'], [38, 5, '#4ad0ff'], [24, 12, '#7aff8a'], [44, 14, '#ffd04a']]) { R(g, X0 + dx, Y0 + H - 14 - dy + 14, 3, 3, c); if (Math.sin(t * 3 + dx) > 0.6) { px(g, X0 + dx + 1, Y0 + H - 14 - dy + 10, '#ffffff'); R(g, X0 + dx - 1, Y0 + H - 14 - dy + 15, 5, 1, '#ffffff'); } }
  for (let i = 0; i < 3; i++) { R(g, X0 + 6 + i * 16, Y0 + 6, 2, 12 + i * 4, ['#e07ab0', '#b28cff', '#ffd36b'][i]); }   // ribbons pinned over the niche
}
// the gallery over her door (cols x0..x1 at row `row`): a low balustrade and a gold-edged rail, and the banners hung from the corbels down the face (they stir)
function drawGallery(g, cx, cy, t) {
  const G = QS.gallery, X0 = ri(G.x0 * 16 - cx), W = (G.x1 - G.x0 + 1) * 16, Y = ri(G.row * 16 - cy);
  for (let x = X0 + 3; x < X0 + W - 3; x += 6) { if (Math.abs(x - ri(712 * 16 + 8 - cx)) < 12) continue; R(g, x, Y - 11, 3, 11, S.e); R(g, x, Y - 11, 1, 11, S.g); R(g, x + 2, Y - 11, 1, 11, S.b); R(g, x - 1, Y - 6, 5, 2, S.d); }
  R(g, X0, Y - 14, W, 3, S.d); R(g, X0, Y - 14, W, 1, S.g); R(g, X0, Y - 12, W, 1, '#e0b040');
  for (const bx of QS.banners) { const x = ri(bx * 16 - cx) + 4, sw = ri(Math.sin(t * 1.8 + bx) * 3), sw2 = ri(Math.sin(t * 1.8 + bx + 1.5) * 4);
    R(g, x - 1, Y + 6, 10, 2, '#3a3a46'); R(g, x + sw * 0, Y + 8, 8, 6, '#5a2a7a'); R(g, x + sw, Y + 14, 8, 14, '#5a2a7a'); R(g, x + sw2, Y + 28, 8, 8, '#5a2a7a'); R(g, x + sw2 + 1, Y + 36, 3, 4, '#5a2a7a'); R(g, x + sw2 + 5, Y + 36, 3, 2, '#5a2a7a');
    R(g, x, Y + 8, 2, 6, '#7a3a9a'); R(g, x + sw, Y + 14, 2, 14, '#7a3a9a'); R(g, x + sw + 2, Y + 18, 4, 3, '#e0b040'); R(g, x + sw + 3, Y + 16, 2, 2, '#fff6c8'); R(g, x + sw + 2, Y + 21, 4, 1, '#a0781c'); }   // purple, a gold crown worked on each
}
// the whole section's dressing, over the tiles and under the creatures (cx = the camera's left edge, VW the view's width)
export function drawStairSet(g, cx, cy, t, VW) {
  if (cx > 718 * 16 || cx + VW < 650 * 16) return;
  drawGate(g, cx, cy, t); drawFlights(g, cx, cy, t); drawCatwalks(g, cx, cy, t); drawAlcove(g, cx, cy, t); drawGallery(g, cx, cy, t);
}
// main.js drawRoomPaint calls this for the two room styles this pass added ('gq3shaft', 'gq3store'); true = painted
export function paintRoom(g, st, sx, sy, w, h, tx0, ty0, time) {
  if (st === 'gq3shaft') { paintShaft(g, sx, sy, w, h, tx0, ty0, time); return true; }
  if (st === 'gq3store') { paintStore(g, sx, sy, w, h, tx0, ty0, time); return true; }
  return false;
}
