// fields_world.js — THE HEXED FIELDS: the farms under the mad Archmage's hill. His alchemy runs off the hill into the ditches
// and the farm is haunted: dead corn, crooked fences, a leaning barn, creaking mills, crows, fog in the hollows, and the TOWER
// always on the horizon. Dusk, then NIGHT under a big moon: blue moonlight, warm lantern accents.
// ONE GHOST-GREEN RAMP (GHOST) marks everything the player can USE. Plain scenery never wears it.
// Backgrounds are TILED horizontally (left and right edges join), transparent above the silhouette, dark and low-contrast.
// Standing props: the bottom row is the ground contact, dark OUT outline round the rest.
//
// BACKGROUNDS
//   bakeSkyFields(h)            1 x h   night sky, 9 bands, '#10142e' top to '#3a4a6e' horizon
//   bakeSkyFieldsDusk(h)        1 x h   dusk: violet top to a sullen orange-rose horizon (crossfade over the night)
//   bakeMoon()                  56x56   moon disc r17 (34 across) centred at 28,28, halo rings baked in at low alpha
//   bakeStars(w, h, seed)       w x h   sparse 1px stars and a few cross twinkles, transparent, tileable
//   bakeFarFields(w, h, seed)   320x90  horizon row 52 (fields below it, hills and farm silhouettes above), fog in hollows. VH-90, x0.15
//   bakeMidFields(w, h, seed)   480x140 ground line ~row 116, barn / mill / trees / scarecrow / fences, fog band along the bottom. VH-140, x0.3
//   bakeNearFields(w, h, seed)  640x300 dead orchard trunks (limbs rows ~40-200), withered corn rows 260-300. VH-300, x0.55
//   bakeArchTower(v)            56x140  THE TOWER on its hill; bottom row 139 = the hill's base, spire centre x ~30.
//                               v0 far (dim, 3 green + 1 violet windows, no outline), v1 near (most windows lit, green haze, outline)
// DECO PROPS (anchor: bottom-centre, bottom row = ground)
//   bakeDeadCorn(v 0-2) 14x26 · bakeCrookedFence(v 0-1) 32x16 · bakeScarePost() 20x32 · bakePumpkinPatch() 28x10
//   bakeHayStack(v 0-1) 30x22 · bakeFarmLantern(lit) 8x11 · bakeLeaningBarn() 96x76 · bakeBrokenCart() 42x22 · bakePlough() 30x14
//   bakeMilkChurn() 8x12 · bakeWaterPump() 12x22 · bakeGrave(v 0-2) 12x16 · bakeCrypt() 48x40 · bakeCandle(lit) 6x8
//   bakePortrait() 14x16 hung on a wall (no ground). canvas.eyes = [{x:4,y:6,w:2},{x:8,y:6,w:2}]: two 2px-wide eye whites on row 6;
//                               the runtime draws ONE pupil pixel in each (x or x+1, row 6) toward the player.
// INTERACTIVE (ghost-green)
//   bakeHexTrough()   [full, broken] 26x14 bottom row = ground
//   bakeHexBucket()   [upright, tipped] 12x12 bottom row = ground
//   bakeHexSluice()   [shut, open] 18x26 bottom row = ground (posts), wheel handle on top
//   bakeVineParts()   { stalk: [2] 8x16 (tiles vertically, stem centre x ~4), pad: [fresh, droop, withered] 32x10 (stand on row 1;
//                       droop/withered ends sag 3-4px), bud: 14x8 (bottom row = ground) }
//   bakePhantomPlank() [solid, fading] 16x8 tiles horizontally; row 0 = the walkable top
//   bakeGhostThings()  { bale 32x16, cart 48x22, chair 16x22, table 32x16, bed 42x18, plough 32x14 } canvas = the platform rect:
//                       row 0 green glow, row 1 OUT, row 2 the object's flat top (level from x 2 to w-3), same inset on every side
// SET PIECES
//   bakeThresher()     4 frames 76x56 faces RIGHT (beater centre 61,33 reaches x 74), wheels on row 55; frames turn wheels + beater
//   bakeCropPole(crackCol) [sound, cracked, broken] 40x64 pole centre x 19, crossbar rows 8-10, base row 63; broken stub rows 51-63
//   bakeWindSail(v 0-1) 12x48 pivot (6, 0) = the hub end, the sail hangs DOWN from it (rotate about the pivot)
//   bakeFireTile()     4 frames 16x16, tiles horizontally, bottom row = the burning ground
// GHOSTS AND THE GATE (added)
//   bakeGhostCow()     [grazeA, grazeB] 34x22 faces LEFT, head down, bottom row = hooves; translucent moon-blue, glow eye. Scenery
//   bakeGhostHorse()   4 gallop frames 46x34 faces RIGHT, hooves on row 33 when planted; harness traces run off the LEFT edge at
//                      rows ~14-16 to the hay cart; translucent moon-blue, skull face, mist mane (drawn in alpha)
//   bakeGhostThings().headstone 32x14 toppled slab, same ghost-platform convention (flat top on row 2)
//   bakeCryptFront()   96x96 fully opaque facade for a 6x6-tile block: rows 0-2 a clean flat lip, bottom row = ground
//   bakeTowerGate()    40x64 background gatehouse, pointed arch of dim ghost light, portcullis; bottom row = ground, no outline
// Also exported: GHOST (the four-colour interactive ramp).
import { canvas, px, rect, fillPoly, line, circle, outline, mulberry } from '../px.js';
import { OUT } from '../art.js';

export const GHOST = ['#1f6a3a', '#3fbf5f', '#7dff8a', '#d8ffd0'];
const G = GHOST;
const TAU = Math.PI * 2;

// ---------- a colour buffer ----------
function buf(w, h) { const a = new Array(w * h).fill(null); return { w, h, a,
  set(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (c && x >= 0 && y >= 0 && x < w && y < h) a[y * w + x] = c; },
  del(x, y) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < w && y < h) a[y * w + x] = null; },
  get(x, y) { x = Math.floor(x); y = Math.floor(y); return x >= 0 && y >= 0 && x < w && y < h ? a[y * w + x] : null; } }; }
function toCanvas(B, out = OUT) { const [c, g] = canvas(B.w, B.h);
  for (let y = 0; y < B.h; y++) for (let x = 0; x < B.w; x++) { const k = B.a[y * B.w + x]; if (k) { g.fillStyle = k; g.fillRect(x, y, 1, 1); } }
  return out ? outline(c, out) : c; }
const pick = (c, x, y) => (typeof c === 'function' ? c(x, y) : c);
const bRect = (B, x, y, w, h, c) => { x = Math.round(x); y = Math.round(y); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) B.set(x + i, y + j, pick(c, x + i, y + j)); };
function bLine(B, x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
  for (;;) { B.set(x0, y0, pick(c, x0, y0)); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
}
function bPoly(B, pts, c) { let y0 = 1e9, y1 = -1e9; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) { const sy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= sy) !== (b[1] <= sy)) xs.push(a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5); x < Math.ceil(xs[i + 1] - 0.5); x++) B.set(x, y, pick(c, x, y)); } }
function bEll(B, cx, cy, rx, ry, c) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry; if (u * u + v * v <= 1) B.set(x, y, pick(c, x, y)); } }
const hsh = (x, y, s = 0) => { let t = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) >>> 0; t = Math.imul(t ^ (t >>> 13), 1274126177); return ((t ^ (t >>> 16)) >>> 0) / 4294967296; };
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => (BAY[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
/* a light value 0..1 to a ramp colour, ordered-dithered between two steps */
const ramp = (r, k, x, y) => { const f = Math.max(0, Math.min(0.999, k)) * (r.length - 1), i = Math.floor(f); return r[f - i > bay(x, y) ? i + 1 : i]; };
const rgba = (rgb, a) => 'rgba(' + rgb + ',' + a.toFixed(3) + ')';

// ---------- palettes ----------
const WD = ['#2a2224', '#43373a', '#5e4f4a', '#7c6a5c', '#9c8a74'];     /* weathered grey-brown wood */
const HY = ['#4a3e2a', '#6c5c3a', '#8f7e4c', '#b3a266', '#d0c286'];     /* old straw */
const CN = ['#3e3426', '#5e4e34', '#806c46', '#a4905e', '#c4b27e'];     /* dead corn */
const IR = ['#1c1c24', '#30303a', '#4a4a56', '#6c6c78', '#9494a0'];     /* iron */
const RU = ['#4a2a1e', '#74402a', '#9a5a36', '#bc7a4a'];               /* rust */
const SN = ['#2c2e36', '#44474f', '#5e626c', '#7e838c', '#a2a7ae'];     /* grave stone */
const PK = ['#5a2410', '#8c3c16', '#bc5c20', '#e08a34', '#f0b456'];     /* pumpkin */
const TN = ['#3a4450', '#5a6674', '#7e8a98', '#a8b2bc', '#d4dae0'];     /* tin */
const FL = ['#5a140e', '#a82a16', '#e8641c', '#ffa232', '#ffe27a', '#fff8d8'];
const HZ = ['#6a6434', '#b8b060', '#eeeaa8', '#fcfce4'];              /* the thresher's sickly light: a hazard, never green */
const BR = ['#141018', '#20171f', '#2a1e25', '#37282d', '#473436'];     /* barn red, gone dark and grey in the moonlight: it stands BEHIND the play */
const DIRT = ['#2e2418', '#44362a', '#5e4a36', '#7a6248'];
const FLAME = ['#ff8a2a', '#ffb04a', '#ffd36b', '#fff2b0'];

const planksH = (B, x0, y0, w, h, seed, R = WD, ph = 3) => bRect(B, x0, y0, w, h, (x, y) => { const r = (y - Math.round(y0)) % ph, s = hsh(x, y, seed);
  if (r === 0) return R[3]; if (r === ph - 1) return R[1]; return s < 0.1 ? R[1] : s > 0.94 ? R[3] : R[2]; });
const planksV = (B, x0, y0, w, h, seed, R = WD, pw = 3) => bRect(B, x0, y0, w, h, (x, y) => { const r = (x - Math.round(x0)) % pw, s = hsh(x >> 0, (y / 3) | 0, seed);
  if (r === 0) return R[3]; if (r === pw - 1) return R[1]; return s < 0.12 ? R[1] : s > 0.93 ? R[3] : R[2]; });
const straw = seed => (x, y) => { const s = hsh(x, y, seed), t = hsh(x + ((y / 2) | 0), 0, seed + 1); return s < 0.14 ? HY[1] : t < 0.3 ? HY[3] : s > 0.9 ? HY[4] : HY[2]; };

// ============================================================================================
// THE SKY
// ============================================================================================
function bands(h, stops) {
  const [c, g] = canvas(1, h);
  for (let y = 0; y < h; y++) { const q = Math.round(y / Math.max(1, h - 1) * 8) / 8;
    let i = 0; while (i < stops.length - 2 && q > stops[i + 1][0]) i++;
    const [t0, a] = stops[i], [t1, b] = stops[i + 1], k = Math.max(0, Math.min(1, (q - t0) / (t1 - t0)));
    g.fillStyle = 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * k) + ',' + Math.round(a[1] + (b[1] - a[1]) * k) + ',' + Math.round(a[2] + (b[2] - a[2]) * k) + ')'; g.fillRect(0, y, 1, 1); }
  return c;
}
export function bakeSkyFields(h = 180) { return bands(h, [[0, [16, 20, 46]], [0.5, [24, 30, 64]], [0.8, [38, 48, 88]], [1, [58, 74, 110]]]); }
export function bakeSkyFieldsDusk(h = 180) { return bands(h, [[0, [42, 28, 72]], [0.45, [88, 50, 100]], [0.75, [150, 76, 96]], [1, [196, 108, 80]]]); }

// THE MOON: big, low and pale, with its craters lit from the upper left and a soft ring of light round it
export function bakeMoon() {
  const S = 56, C = 28, R = 17, [c, g] = canvas(S, S), MO = ['#aca688', '#c8c2a0', '#dcd7b8', '#f0ecd0', '#fcf9e8'];
  const craters = [[-6, -5, 3.2], [5, 3, 2.6], [-2, 9, 2], [8, -8, 1.6], [-10, 4, 1.8], [2, -11, 1.3], [11, 6, 1.2]];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x + 0.5 - C, dy = y + 0.5 - C, d = Math.hypot(dx, dy);
    if (d > R && d <= R + 10) { const a = d < R + 2.5 ? 0.16 : d < R + 6 ? 0.08 : 0.035; g.fillStyle = 'rgba(226,230,200,' + a + ')'; g.fillRect(x, y, 1, 1); continue; }
    if (d > R) continue;
    const nx = dx / R, ny = dy / R;
    let k = 0.66 - (nx + ny) * 0.2 - (d > R - 2 ? 0.14 : 0);
    if (Math.sin(nx * 4.1 + 1) * Math.sin(ny * 3.3 + 2) + 0.5 * Math.sin(nx * 7 + ny * 5) > 0.6) k -= 0.2;   /* the seas */
    for (const [cx, cy, cr] of craters) { const ex = dx - cx, ey = dy - cy, e = Math.hypot(ex, ey);
      if (e <= cr) k -= ex + ey < 0 ? 0.32 : 0.1; else if (e <= cr + 1 && ex + ey > 0) k += 0.16; }
    g.fillStyle = ramp(MO, k, x, y); g.fillRect(x, y, 1, 1);
  }
  return c;
}
export function bakeStars(w = 320, h = 120, seed = 3) {
  const rnd = mulberry(seed * 31 + 9), [c, g] = canvas(w, h), n = Math.round(w * h / 650);
  for (let i = 0; i < n; i++) { const r = rnd(); px(g, (rnd() * w) | 0, (rnd() * h) | 0, r < 0.6 ? '#4e5886' : r < 0.9 ? '#8a94c0' : '#e8e4cc'); }
  for (let i = 0; i < Math.max(2, n / 14); i++) { const x = 2 + ((rnd() * (w - 4)) | 0), y = 2 + ((rnd() * (h - 4)) | 0);
    px(g, x, y, '#fffbe8'); for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) px(g, x + ox, y + oy, '#6e78a8'); }
  return c;
}

// ============================================================================================
// THE FIELDS BEHIND IT
// ============================================================================================
/* a moon rim along the top (and optionally the left) edge of every silhouette; x wraps so a tiled layer keeps its seam */
function rimLight(c, top, left) {
  const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data, marks = [];
  const op = (x, y) => d[(y * w + ((x + w) % w)) * 4 + 3] > 160;
  for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) { if (!op(x, y)) continue;
    if (!op(x, y - 1)) marks.push(x, y, top); else if (left && !op(x - 1, y)) marks.push(x, y, left); }
  for (let i = 0; i < marks.length; i += 3) { g.fillStyle = marks[i + 2]; g.fillRect(marks[i], marks[i + 1], 1, 1); }
  return c;
}
function thick(g, x0, y0, x1, y1, th, colr) {
  const n = Math.max(1, Math.round(th));
  if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) { for (let i = 0; i < n; i++) line(g, x0 - n / 2 + i + 0.5, y0, x1 - n / 2 + i + 0.5, y1, colr); }
  else line(g, x0, y0 - n / 2 + 0.5, x1, y1 - n / 2 + 0.5, colr, n);
}
/* a dead limb, crooked at its middle, forking until it is twigs */
function gnarl(g, x, y, ang, len, th, depth, colr, rnd) {
  const bend = (rnd() - 0.5) * 0.7, mx = x + Math.cos(ang + bend) * len * 0.5, my = y + Math.sin(ang + bend) * len * 0.5;
  const x1 = mx + Math.cos(ang - bend * 0.6) * len * 0.5, y1 = my + Math.sin(ang - bend * 0.6) * len * 0.5;
  thick(g, x, y, mx, my, th, colr); thick(g, mx, my, x1, y1, Math.max(1, th - 0.7), colr);
  if (depth <= 0 || len < 5) return;
  const n = rnd() < 0.35 ? 3 : 2;
  for (let i = 0; i < n; i++) gnarl(g, x1, y1, ang + (i - (n - 1) / 2) * (0.5 + rnd() * 0.35) + (rnd() - 0.5) * 0.3, len * (0.55 + rnd() * 0.25), Math.max(1, th - 1), depth - 1, colr, rnd);
}
const wrapDo = (w, fn) => { for (const dx of [-w, 0, w]) fn(dx); };

const FF = { back: '#303b5a', backRim: '#3a4768', front: '#29334f', frontRim: '#34406a', fields: ['#28314d', '#2c3553', '#252e48', '#2f3050'], furrow: '#222a42', hedge: '#1f263b', win: '#d09a52', winD: '#8a6038', fog: '140,156,196' };
function farHouse(g, x, base, wd, ht, colr, lit) {
  rect(g, x, base - ht, wd, ht + 1, colr);
  fillPoly(g, [[x - 1, base - ht + 0.5], [x + wd + 1, base - ht + 0.5], [x + wd / 2, base - ht - Math.ceil(wd / 2) + 0.5]], colr);
  rect(g, x + wd - 3, base - ht - Math.ceil(wd / 2) + 1, 2, 3, colr);
  if (lit) { px(g, x + 2, base - ht + 2, FF.win); if (lit > 1 && wd > 7) px(g, x + wd - 3, base - ht + 2, FF.winD); }
}
function farMill(g, x, base, colr, ang, broken) {
  fillPoly(g, [[x - 3, base + 1], [x + 3, base + 1], [x + 2, base - 11], [x - 2, base - 11]], colr);
  fillPoly(g, [[x - 3, base - 11], [x + 3, base - 11], [x, base - 14]], colr);
  const hy = base - 12;
  for (let k = 0; k < 4; k++) { const a = ang + k * Math.PI / 2, L = broken && k === 1 ? 4 : 10, ca = Math.cos(a), sa = Math.sin(a);
    line(g, x, hy, x + ca * L, hy + sa * L, colr); if (L > 5) line(g, x + ca * 4 - sa * 2, hy + sa * 4 + ca * 2, x + ca * L - sa * 2, hy + sa * L + ca * 2, colr); }
}
function farTree(g, x, base, colr, rnd) { line(g, x, base, x, base - 6, colr); for (let q = 0; q < 3; q++) { const dir = q % 2 ? 1 : -1, by = base - 3 - q * 2; for (let i = 1; i < 3 + (q === 0 ? 1 : 0); i++) px(g, x + dir * i, by - i, colr); } px(g, x, base - 7, colr); }

// FAR: the hills the farms sit under, hedgerows along their crests, dead fields in a patchwork below the horizon, a few lit windows
export function bakeFarFields(w = 320, h = 90, seed = 1) {
  const rnd = mulberry(seed * 7919 + 13), H0 = 52, U = x => x / w * TAU, ph = Array.from({ length: 6 }, () => rnd() * TAU);
  const yB = x => Math.round(37 + 6 * Math.sin(U(x) * 2 + ph[0]) + 3 * Math.sin(U(x) * 5 + ph[1]));
  const yF = x => Math.round(47 + 3 * Math.sin(U(x) * 3 + ph[2]) + 1.5 * Math.sin(U(x) * 7 + ph[3]));
  const [c, g] = canvas(w, h);
  // 1. the back hills
  const [cb, gb] = canvas(w, h);
  for (let x = 0; x < w; x++) rect(gb, x, yB(x), 1, h - yB(x), FF.back);
  for (let gI = 0; gI < 7; gI++) { const gx = rnd() * w, n = 3 + ((rnd() * 5) | 0);
    for (let i = 0; i < n; i++) { const x = gx + i * 3 + rnd() * 2, r = 1.2 + rnd() * 1.4; wrapDo(w, dx => circle(gb, x + dx, yB(Math.round(x) % w) - r * 0.5, r, FF.back)); } }
  { const x = Math.round(w * 0.3); wrapDo(w, dx => farMill(gb, x + dx, yB(x), FF.back, 0.5, false)); }
  { const x = Math.round(w * 0.8); wrapDo(w, dx => farHouse(gb, x + dx, yB(x), 6, 3, FF.back, 0)); }
  rimLight(cb, FF.backRim);
  { const x = Math.round(w * 0.8); wrapDo(w, dx => px(gb, x + dx + 2, yB(x) - 1, FF.winD)); }
  g.drawImage(cb, 0, 0);
  // fog lying in the valley between the two lines of hills
  for (let x = 0; x < w; x++) { const a = Math.max(0, Math.sin(U(x) * 3 + ph[4])); if (a < 0.2) continue;
    const lv = a > 0.75 ? 0.16 : a > 0.45 ? 0.11 : 0.06; g.fillStyle = rgba(FF.fog, lv); g.fillRect(x, yF(x) - 6, 1, 3); g.fillStyle = rgba(FF.fog, lv * 0.5); g.fillRect(x, yF(x) - 9, 1, 3); }
  // 2. the near ridge and the fields
  const [cf, gf] = canvas(w, h);
  for (let x = 0; x < w; x++) rect(gf, x, yF(x), 1, h - yF(x), FF.front);
  let top = H0 + 1, k = 0;
  while (top < h) {
    const bh = 2 + Math.round(k * 1.7), sl = (rnd() - 0.5) * (1 + k * 0.6), n = 3 + k, cw = w / n, off = rnd() * w, kinds = Array.from({ length: n }, () => (rnd() * 4) | 0);
    for (let y = top; y < Math.min(h, top + bh); y++) for (let x = 0; x < w; x++) {
      const xx = ((x - (y - top) * sl + off) % w + w) % w, kind = kinds[Math.floor(xx / cw) % n];
      let cc = FF.fields[kind];
      if (kind === 1 && (y & 1)) cc = FF.furrow;
      else if (kind === 3 && y % 3 === 0 && hsh(x >> 1, y, 4) < 0.5) cc = FF.furrow;
      px(gf, x, y, cc); }
    if (top > H0 + 1) for (let x = 0; x < w; x++) { if (hsh(x >> 1, top, 7) > 0.18) px(gf, x, top - 1, FF.hedge); if (hsh(x, top, 8) < 0.12 + k * 0.03) px(gf, x, top - 2, FF.hedge); }
    top += bh + 1; k++;
  }
  // hedgerow trees, farms and a broken mill on the ridge
  for (let gI = 0; gI < 6; gI++) { const gx = rnd() * w, n = 2 + ((rnd() * 4) | 0);
    for (let i = 0; i < n; i++) { const x = gx + i * 3 + rnd(), r = 1 + rnd() * 1.3; wrapDo(w, dx => circle(gf, x + dx, yF(Math.round(x) % w) - r * 0.4, r, FF.front)); } }
  const farms = [[0.12, 9, 5, 1], [0.47, 8, 4, 2], [0.9, 10, 5, 1]];
  for (const [fx, wd, ht] of farms) { const x = Math.round(w * fx); wrapDo(w, dx => farHouse(gf, x + dx, yF(x), wd, ht, FF.front, 0)); }
  { const x = Math.round(w * 0.64); wrapDo(w, dx => farMill(gf, x + dx, yF(x), FF.front, 0.2, true)); }
  for (const fx of [0.25, 0.56, 0.75]) { const x = Math.round(w * fx); wrapDo(w, dx => farTree(gf, x + dx, yF(x), FF.front, rnd)); }
  rimLight(cf, FF.frontRim);
  for (const [fx, wd, ht, lit] of farms) { const x = Math.round(w * fx); wrapDo(w, dx => { px(gf, x + dx + 2, yF(x) - ht + 2, FF.win); if (lit > 1) px(gf, x + dx + wd - 3, yF(x) - ht + 2, FF.winD); }); }
  g.drawImage(cf, 0, 0);
  // low fog along the horizon and in two bands across the fields
  for (let x = 0; x < w; x++) for (const [y0, hh, amp, f] of [[H0 - 2, 4, 0.14, 2], [H0 + 9, 3, 0.1, 3], [H0 + 22, 4, 0.08, 4]]) {
    const a = 0.5 + 0.5 * Math.sin(U(x) * f + ph[5] + y0); if (a < 0.25) continue;
    g.fillStyle = rgba(FF.fog, amp * (a > 0.7 ? 1 : 0.55)); g.fillRect(x, y0, 1, hh); }
  return c;
}

const MF = { back: '#252d4a', backRim: '#313b60', front: '#1c223d', frontRim: '#2c365a', det: '#232a48', deep: '#12152a', win: '#d49a50', winD: '#8a5e36', fog: '118,134,178' };
function midBarn(g, x0, b, colr, det, deep, lean) {
  const P = (x, y) => [x + (b - y) * lean, y];
  fillPoly(g, [P(x0, b + 1), P(x0 + 56, b + 1), P(x0 + 56, b - 24), P(x0 + 58, b - 24), P(x0 + 50, b - 36), P(x0 + 28, b - 46), P(x0 + 6, b - 36), P(x0 - 2, b - 24), P(x0, b - 24)], colr);
  for (let x = x0 + 3; x < x0 + 55; x += 4) line(g, ...P(x, b - 22), ...P(x, b), det);
  for (const [hx, hy, hh] of [[x0 + 9, b - 20, 9], [x0 + 45, b - 16, 12], [x0 + 49, b - 21, 6]]) { line(g, ...P(hx, hy), ...P(hx, hy + hh), deep); line(g, ...P(hx + 1, hy), ...P(hx + 1, hy + hh), deep); }
  fillPoly(g, [P(x0 + 20, b + 1), P(x0 + 36, b + 1), P(x0 + 36, b - 17), P(x0 + 20, b - 17)], deep);
  line(g, ...P(x0 + 21, b), ...P(x0 + 35, b - 16), det); line(g, ...P(x0 + 21, b - 16), ...P(x0 + 35, b), det);
  fillPoly(g, [P(x0 + 24, b - 28), P(x0 + 32, b - 28), P(x0 + 32, b - 38), P(x0 + 24, b - 38)], deep);
  fillPoly(g, [P(x0 + 32, b - 38), P(x0 + 38, b - 34), P(x0 + 38, b - 25), P(x0 + 32, b - 28)], det);
  fillPoly(g, [P(x0 + 38, b - 40), P(x0 + 44, b - 36), P(x0 + 41, b - 35)], deep);
  line(g, ...P(x0 + 28, b - 46), ...P(x0 + 28, b - 50), colr); line(g, ...P(x0 + 26, b - 49), ...P(x0 + 31, b - 49), colr);   /* a weathervane, bent */
}
function midMill(g, x, b, colr, det, deep, ang) {
  const P = (xx, y) => [xx + (b - y) * 0.07, y];
  fillPoly(g, [P(x - 10, b + 1), P(x + 10, b + 1), P(x + 6, b - 52), P(x - 6, b - 52)], colr);
  fillPoly(g, [P(x - 8, b - 52), P(x + 8, b - 52), P(x + 6, b - 57), P(x, b - 61), P(x - 6, b - 57)], colr);
  fillPoly(g, [P(x - 3, b + 1), P(x + 2, b + 1), P(x + 2, b - 8), P(x - 3, b - 8)], deep);
  rect(g, ...P(x - 1, b - 38), 2, 3, deep);
  line(g, ...P(x - 13, b - 28), ...P(x + 13, b - 28), colr); for (let k = -12; k <= 12; k += 4) line(g, ...P(x + k, b - 28), ...P(x + k, b - 31), colr);
  line(g, ...P(x - 13, b - 31), ...P(x + 13, b - 31), colr);
  const [hx, hy] = P(x, b - 55);
  for (let k = 0; k < 4; k++) { const a = ang + k * Math.PI / 2, L = k === 2 ? 19 : 34, ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
    thick(g, hx, hy, hx + ca * L, hy + sa * L, 2, colr);
    for (let t = 8; t < L - 3; t += 4) { if (hsh(k, t, 9) < 0.5) fillPoly(g, [[hx + ca * t + nx, hy + sa * t + ny], [hx + ca * (t + 4) + nx, hy + sa * (t + 4) + ny], [hx + ca * (t + 4) + nx * 6, hy + sa * (t + 4) + ny * 6], [hx + ca * t + nx * 6, hy + sa * t + ny * 6]], det); }
    for (let t = 8; t <= L; t += 4) { if (hsh(k, t, 3) < 0.22) continue; line(g, hx + ca * t, hy + sa * t, hx + ca * t + nx * 7, hy + sa * t + ny * 7, colr); }
    const rl = k === 1 ? L * 0.6 : L; line(g, hx + ca * 8 + nx * 7, hy + sa * 8 + ny * 7, hx + ca * rl + nx * 7, hy + sa * rl + ny * 7, colr);
    const tx = hx + ca * L + nx * 4, ty = hy + sa * L + ny * 4; line(g, tx, ty, tx + 1, ty + 4 + k, det);   /* a tatter hanging off the end */
  }
  circle(g, hx, hy, 2, colr);
}
function midTree(g, x, b, ht, colr, rnd) {
  const lean = (rnd() - 0.5) * 6, tx = x + lean, ty = b - ht * 0.42;
  thick(g, x, b + 1, tx, ty, 4, colr); fillPoly(g, [[x - 5, b + 1], [x + 5, b + 1], [x + 1, b - 4], [x - 1, b - 4]], colr);
  gnarl(g, tx, ty, -Math.PI / 2 + (rnd() - 0.5) * 0.4, ht * 0.34, 3, 3, colr, rnd);
  gnarl(g, (x + tx) / 2, (b + ty) / 2, -Math.PI / 2 - 0.9, ht * 0.28, 2, 2, colr, rnd);
  gnarl(g, tx, ty + 4, -Math.PI / 2 + 1.0, ht * 0.3, 2, 2, colr, rnd);
}
function midScarecrow(g, x, b, colr, deep) {
  thick(g, x, b + 1, x, b - 30, 2, colr); line(g, x - 10, b - 24, x + 10, b - 23, colr, 2);
  circle(g, x + 0.5, b - 30, 3, colr); rect(g, x - 5, b - 33, 11, 1, colr); rect(g, x - 2, b - 37, 6, 4, colr);
  fillPoly(g, [[x - 5, b - 23], [x + 6, b - 23], [x + 7, b - 13], [x + 4, b - 11], [x + 2, b - 14], [x - 1, b - 11], [x - 3, b - 14], [x - 6, b - 12]], colr);
  line(g, x - 10, b - 22, x - 11, b - 18, colr); line(g, x + 10, b - 21, x + 10, b - 17, colr);
  px(g, x - 1, b - 30, deep); px(g, x + 2, b - 30, deep);
  crow(g, x + 7, b - 25, colr);
}
function crow(g, x, y, colr) { rect(g, x, y - 2, 3, 2, colr); px(g, x + 3, y - 3, colr); px(g, x + 3, y - 2, colr); px(g, x + 4, y - 2, colr); px(g, x - 1, y - 1, colr); px(g, x + 1, y, colr); }
function midFence(g, xa, xb, gy, colr, rnd) {
  let prev = null;
  for (let x = xa; x < xb; x += 9 + ((rnd() * 4) | 0)) { const y = gy(Math.round(x)), ph = 7 + ((rnd() * 4) | 0), lean = (rnd() - 0.5) * 4, broken = rnd() < 0.15;
    const top = [x + lean, y - (broken ? 4 : ph)]; thick(g, x, y + 1, top[0], top[1], 2, colr);
    if (prev && !broken && rnd() > 0.15) { line(g, prev[0], prev[1] + 1, top[0], top[1] + 1, colr); if (rnd() > 0.3) line(g, prev[0], prev[1] + 4, top[0], top[1] + 4 + ((rnd() * 2) | 0), colr); }
    prev = broken ? null : top; }
}
function midStack(g, x, b, rx, ry, colr) {
  for (let y = Math.round(b - ry); y <= b; y++) { const q = (b - y) / ry, hw = rx * Math.sqrt(Math.max(0, 1 - q * q)), sl = (b - y) * 0.18; rect(g, Math.round(x - hw + sl), y, Math.round(hw * 2), 1, colr); }
  line(g, x + ry * 0.18, b - ry, x + ry * 0.2 + 1, b - ry - 5, colr);
}

// MID: nearer, the farm itself: the leaning barn, a mill with torn sails, haystacks, dead trees, a scarecrow and the fence lines
export function bakeMidFields(w = 480, h = 140, seed = 1) {
  const rnd = mulberry(seed * 104729 + 71), U = x => x / w * TAU, ph = Array.from({ length: 6 }, () => rnd() * TAU);
  const gyB = x => Math.round(h - 38 + 4 * Math.sin(U(x) * 3 + ph[0]) + 2 * Math.sin(U(x) * 7 + ph[1]));
  const gyF = x => Math.round(h - 24 + 2 * Math.sin(U(x) * 2 + ph[2]) + 1.5 * Math.sin(U(x) * 5 + ph[3]));
  const [c, g] = canvas(w, h), [cb, gb] = canvas(w, h), [cf, gf] = canvas(w, h);
  // the back row: a farmhouse still lived in, stacks, a line of fence and some thin trees
  for (let x = 0; x < w; x++) rect(gb, x, gyB(x), 1, h - gyB(x), MF.back);
  const hx = Math.round(w * 0.53), hb = gyB(hx) + 1;
  wrapDo(w, dx => { const x = hx + dx; rect(gb, x, hb - 16, 28, 16, MF.back); fillPoly(gb, [[x - 2, hb - 15.5], [x + 30, hb - 15.5], [x + 14, hb - 29]], MF.back); rect(gb, x + 20, hb - 28, 3, 8, MF.back);
    fillPoly(gb, [[x + 28, hb], [x + 40, hb], [x + 40, hb - 9], [x + 28, hb - 13]], MF.back); });
  for (const [fx, rx, ry] of [[0.1, 8, 9], [0.135, 6, 7], [0.86, 9, 10]]) { const x = Math.round(w * fx); wrapDo(w, dx => midStack(gb, x + dx, gyB(x) + 1, rx, ry, MF.back)); }
  for (const fx of [0.2, 0.44, 0.97]) { const x = Math.round(w * fx), tr = mulberry((fx * 1000) | 0); wrapDo(w, dx => { const r2 = mulberry((fx * 1000) | 0); midTree(gb, x + dx, gyB(x), 30, MF.back, r2); }); tr(); }
  wrapDo(w, dx => midFence(gb, w * 0.62 + dx, w * 0.8 + dx, xx => gyB(((xx % w) + w) % w), MF.back, mulberry(seed + 5)));
  rimLight(cb, MF.backRim);
  wrapDo(w, dx => { const x = hx + dx; for (const wx of [4, 17]) { rect(gb, x + wx, hb - 11, 3, 3, MF.win); px(gb, x + wx + 1, hb - 11, MF.winD); px(gb, x + wx + 1, hb - 9, MF.winD); } rect(gb, x + 11, hb - 7, 3, 7, MF.deep); });
  g.drawImage(cb, 0, 0);
  for (let y = 0; y < 16; y++) { g.fillStyle = rgba(MF.fog, 0.05 + y * 0.004); for (let x = 0; x < w; x++) if (hsh(x >> 2, y >> 1, 3) < 0.7) g.fillRect(x, gyB(x) + y - 4, 1, 1); }
  // the front row
  for (let x = 0; x < w; x++) rect(gf, x, gyF(x), 1, h - gyF(x), MF.front);
  { const x = Math.round(w * 0.05); wrapDo(w, dx => midBarn(gf, x + dx, gyF(x + 28), MF.front, MF.det, MF.deep, 0.14)); }
  { const x = Math.round(w * 0.38); wrapDo(w, dx => midMill(gf, x + dx, gyF(x), MF.front, MF.det, MF.deep, 0.35)); }
  for (const [fx, ht] of [[0.6, 46], [0.93, 38]]) { const x = Math.round(w * fx); wrapDo(w, dx => midTree(gf, x + dx, gyF(x), ht, MF.front, mulberry((fx * 977) | 0))); }
  for (const [fx, rx, ry] of [[0.24, 10, 12], [0.275, 7, 8]]) { const x = Math.round(w * fx); wrapDo(w, dx => midStack(gf, x + dx, gyF(x) + 1, rx, ry, MF.front)); }
  { const x = Math.round(w * 0.73); wrapDo(w, dx => midScarecrow(gf, x + dx, gyF(x), MF.front, MF.deep)); }
  wrapDo(w, dx => midFence(gf, w * 0.66 + dx, w * 0.88 + dx, xx => gyF(((Math.round(xx) % w) + w) % w), MF.front, mulberry(seed + 11)));
  { const x = Math.round(w * 0.13); wrapDo(w, dx => { crow(gf, x + dx + 20, gyF(x) - 45, MF.front); }); }
  rimLight(cf, MF.frontRim);
  { const x = Math.round(w * 0.05), b = gyF(x + 28); wrapDo(w, dx => { px(gf, x + dx + 38 + Math.round(3 * 0.14), b - 3, MF.win); px(gf, x + dx + 38, b - 2, MF.winD); }); }   /* a lantern somebody left by the barn door */
  g.drawImage(cf, 0, 0);
  // the fog band along the bottom
  for (let y = h - 26; y < h; y++) { const t = (y - (h - 26)) / 26;
    for (let x = 0; x < w; x += 2) { const a = (0.04 + t * 0.2) * (0.65 + 0.35 * Math.sin(U(x) * 4 + y * 0.35 + ph[4])); g.fillStyle = rgba(MF.fog, a); g.fillRect(x, y, 2, 1); } }
  return c;
}

const NF = { body: '#1a1e30', dark: '#151827', lit: '#222840', rim: '#2c3452', corn: '#191d2e' };
// NEAR: the dead orchard. Tall bare trunks with gnarled limbs, withered corn in rows along the bottom. Dark and plain, so the play reads.
export function bakeNearFields(w = 640, h = 300, seed = 1) {
  const rnd = mulberry(seed * 15485863 + 5), [c, g] = canvas(w, h), n = 5, trees = [];
  for (let i = 0; i < n; i++) trees.push({ x: (i + 0.2 + rnd() * 0.6) * w / n, wb: 13 + rnd() * 6, top: 64 + rnd() * 40, bend: (rnd() - 0.5) * 18, s: (rnd() * 1e6) | 0 });
  for (const t of trees) wrapDo(w, dx => {
    const tr = mulberry(t.s), span = h - t.top;
    const bx = y => t.x + dx + Math.sin((h - y) / span * Math.PI * 0.9) * t.bend * ((h - y) / span);
    const wdAt = y => { const k = (h - y) / span; return Math.max(3, t.wb * (1 - k * 0.66) + (y > h - 16 ? (y - (h - 16)) * 0.7 : 0)); };
    for (let y = Math.round(t.top); y < h; y++) { const x0 = Math.round(bx(y) - wdAt(y) / 2), x1 = Math.round(bx(y) + wdAt(y) / 2);
      rect(g, x0, y, x1 - x0, 1, NF.body); px(g, x0, y, NF.lit); rect(g, x1 - 2, y, 2, 1, NF.dark); }
    for (let k = 0; k < 16; k++) { const yy = t.top + 8 + tr() * (span - 8), ln = 4 + tr() * 14, off = tr() - 0.5;
      for (let j = 0; j < ln; j++) { const y = Math.round(yy + j); if (y >= h) break; px(g, Math.round(bx(y) + off * wdAt(y) * 0.6), y, NF.dark); } }
    { const y = t.top + span * (0.3 + tr() * 0.3); rect(g, Math.round(bx(y) - 1), Math.round(y), 3, 5, '#10121e'); px(g, Math.round(bx(y) - 1), Math.round(y) - 1, NF.dark); }   /* a hollow */
    gnarl(g, bx(t.top), t.top + 2, -Math.PI / 2 + (tr() - 0.5) * 0.5, 34 + tr() * 10, 3, 3, NF.body, tr);
    gnarl(g, bx(t.top + 6), t.top + 6, -Math.PI / 2 - 0.75, 30 + tr() * 10, 3, 3, NF.body, tr);
    gnarl(g, bx(t.top + 10), t.top + 10, -Math.PI / 2 + 0.8, 30 + tr() * 10, 3, 3, NF.body, tr);
    for (let k = 0; k < 3; k++) { const y = t.top + 30 + k * 26 + tr() * 10, side = (k + (t.s & 1)) % 2 ? 1 : -1;
      gnarl(g, bx(y) + side * wdAt(y) * 0.3, y, -Math.PI / 2 + side * (0.85 + tr() * 0.35), 30 + tr() * 22, 3, 3, NF.body, tr); }
    for (let k = 0; k < 2; k++) { const y = h - 70 + k * 30 + tr() * 10, side = tr() < 0.5 ? -1 : 1; gnarl(g, bx(y), y, -Math.PI / 2 + side * 1.2, 10 + tr() * 6, 2, 1, NF.body, tr); }   /* snapped stubs low down */
  });
  // the corn rows
  const base = h - 1, pw = (x, y, cc) => px(g, ((x % w) + w) % w, y, cc);
  rect(g, 0, h - 5, w, 5, NF.dark);
  for (let x = 0; x < w; x += 3) { if (hsh(x, 1, seed) < 0.12) continue;
    const sh = 14 + hsh(x, 2, seed) * 24, lean = (hsh(x, 3, seed) - 0.5) * 0.35, snap = hsh(x, 4, seed) < 0.18, xo = ((hsh(x, 5, seed) * 2) | 0);
    let topX = x + xo, topY = base;
    for (let j = 0; j < sh; j++) { const X = Math.round(x + xo + j * lean), Y = base - j;
      if (snap && j > sh * 0.55) { const q = j - sh * 0.55; pw(X + Math.round(q * 0.9), Y + Math.round(q * 1.4), NF.corn); } else { pw(X, Y, NF.corn); topX = X; topY = Y; } }
    for (const [fr, side] of [[0.3, 1], [0.55, -1], [0.78, 1]]) { const j = Math.round(sh * fr); if (snap && fr > 0.55) continue; const X = Math.round(x + xo + j * lean), len = 4 + ((hsh(x, j, 6) * 4) | 0), sd = side * (hsh(x, 7, seed) < 0.5 ? 1 : -1);
      for (let i = 1; i <= len; i++) pw(X + sd * i, base - j - Math.min(i, 2) + Math.max(0, i - 3), NF.corn); }
    if (!snap) { pw(topX - 1, topY - 1, NF.corn); pw(topX + 1, topY - 2, NF.corn); pw(topX, topY - 2, NF.corn); }
  }
  rimLight(c, NF.rim, null);
  return c;
}

// THE ARCHMAGE'S TOWER on its hill: a crooked spire, balconies, a leaning top with an observatory dome, pipes running down to the
// runoff. v0 far (dim), v1 near (lit, green haze). 56x140, the hill's bottom row is row 139.
export function bakeArchTower(v = 0) {
  const W = 56, H = 140, B = buf(W, H), near = v === 1, HX = 28;
  const T = near ? { body: '#1e2238', dark: '#151827', rim: '#39436a', mortar: '#171a2c', rock: ['#12141f', '#1a1d2c', '#252a3e', '#363e5e'], pipe: '#363a50', pipeL: '#5a6078', win: '#0c0e16' }
    : { body: '#232a45', dark: '#1e243c', rim: '#303a5c', mortar: '#1f2540', rock: ['#1d2238', '#212740', '#262d48', '#2e3656'], pipe: '#2a3050', pipeL: '#343c5e', win: '#171b30' };
  // the hill
  for (let x = 0; x < W; x++) { const q = (x - HX) / 28, top = Math.round(113 + q * q * 23 + (hsh(x >> 1, 0, 5) - 0.5) * 3 + (x > 38 && x < 45 ? -2 : 0));
    for (let y = Math.max(0, top); y < H; y++) { let k = 0.42 - q * 0.28 - (y - top) * 0.012 + (y === top ? 0.4 : 0); if (hsh(x, y, 9) < 0.07) k -= 0.3; B.set(x, y, ramp(T.rock, k, x, y)); } }
  for (const [bx, by, r] of [[12, 128, 3], [40, 124, 2.5], [22, 133, 2]]) bEll(B, bx, by, r + 1, r, (x, y) => ((x - bx) + (y - by) < -1 ? T.rock[3] : T.rock[1]));
  // the shaft, crooked and leaning right as it climbs
  const cxAt = y => HX - 1 + Math.sin(Math.max(0, 118 - y) / 82 * 2.1) * 2.5 + Math.pow(Math.max(0, 118 - y) / 82, 2) * 4;
  const halfAt = y => 7 - (118 - y) / 82 * 2;
  const stoneAt = (x, y, x0, x1, o) => { const row = Math.floor((y - o) / 5), joint = (x - x0 + (row & 1) * 3) % 6 === 0, course = (y - o) % 5 === 0;
    return x === x0 ? T.rim : x >= x1 - 2 ? T.dark : course || joint ? T.mortar : T.body; };
  for (let y = 36; y <= 118; y++) { const x0 = Math.round(cxAt(y) - halfAt(y)), x1 = Math.round(cxAt(y) + halfAt(y)); for (let x = x0; x <= x1; x++) B.set(x, y, stoneAt(x, y, x0, x1, 36)); }
  const balcony = (y, l, r) => { const x0 = Math.round(cxAt(y) - halfAt(y)) - l, x1 = Math.round(cxAt(y) + halfAt(y)) + r;
    for (let x = x0; x <= x1; x++) { B.set(x, y, T.rim); B.set(x, y + 1, T.dark); if ((x - x0) % 2 === 0) { B.set(x, y - 1, T.body); B.set(x, y - 2, T.body); } B.set(x, y - 3, T.body); }
    B.set(x0 + 1, y + 2, T.dark); B.set(x1 - 1, y + 2, T.dark); B.set(x0 + 2, y + 3, T.dark); B.set(x1 - 2, y + 3, T.dark); return [x0, x1]; };
  const [bl] = balcony(94, 4, 3); balcony(64, 4, 0); balcony(46, 0, 3);
  // the leaning top: a wider chamber, an overhanging lip, the observatory dome and its telescope
  const cT = cxAt(36) + 2;
  for (let y = 22; y <= 37; y++) { const off = (37 - y) * 0.25, x0 = Math.round(cT - 9 + off), x1 = Math.round(cT + 8 + off); for (let x = x0; x <= x1; x++) B.set(x, y, stoneAt(x, y, x0, x1, 22)); }
  const lipX0 = Math.round(cT - 11 + 4), lipX1 = Math.round(cT + 10 + 4);
  for (let x = lipX0; x <= lipX1; x++) { B.set(x, 21, T.rim); B.set(x, 22, T.dark); }
  const dcx = cT + 4.5, dcy = 21;
  bEll(B, dcx, dcy, 8, 8, (x, y) => { if (y >= dcy) return null; const nx = (x + 0.5 - dcx) / 8, ny = (y + 0.5 - dcy) / 8; return ramp([T.dark, T.body, T.rim], 0.55 - nx * 0.5 - ny * 0.25, x, y); });
  for (let y = 14; y < 21; y++) B.set(Math.round(dcx) + 1, y, T.win);
  for (let i = 0; i < 11; i++) { const x = dcx + 2 + i, y = 16 - i * 0.8; B.set(x, y, T.pipeL); B.set(x, y + 1, T.pipe); }
  B.set(dcx + 13, 7, near ? '#c8d0e8' : T.pipeL);
  bLine(B, dcx - 1, 13, dcx - 2, 5, T.body); B.set(dcx - 3, 4, T.rim); B.set(dcx - 2, 3, T.rim); B.set(dcx - 1, 4, T.body);
  // the pipes: down the right side to a flask, and off the lower balcony into the hill
  for (let y = 30; y <= 116; y++) { const xp = y < 38 ? Math.round(cT + 11 + (37 - y) * 0.25) : Math.round(cxAt(y) + halfAt(y) + 3); B.set(xp, y, (y % 10) === 0 ? T.pipeL : T.pipe); if (y === 38) for (let x = Math.round(cxAt(y) + halfAt(y) + 3); x <= Math.round(cT + 11); x++) B.set(x, y, T.pipe); }
  for (let x = Math.round(cT + 7); x <= Math.round(cT + 11 + 2); x++) B.set(x, 30, T.pipe);
  { const fx = Math.round(cxAt(104) + halfAt(104) + 3); bEll(B, fx + 0.5, 104.5, 2.5, 3, (x, y) => (y < 103 ? T.pipeL : near ? G[1] : G[0])); if (near) B.set(fx, 105, G[2]); }
  bLine(B, bl, 95, bl - 5, 104, T.pipe); bLine(B, bl - 5, 104, bl - 6, 114, T.pipe);
  // the windows
  const wins = [[108, -2], [100, 2], [86, -1], [78, 3], [70, -3], [56, 1], [52, -2], [41, 2], [27, -5], [27, -1], [27, 3]];
  const litFar = { 2: 1, 5: 1, 9: 1, 6: 'v' }, litNear = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 7: 1, 8: 1, 9: 1, 10: 1, 6: 'v' };
  wins.forEach(([wy, wdx], i) => { const cx = wy < 36 ? cT + (37 - wy) * 0.25 : cxAt(wy), x = Math.round(cx + wdx), L = (near ? litNear : litFar)[i];
    for (let j = 0; j < 3; j++) for (let q = 0; q < 2; q++) {
      let cc = T.win;
      if (L === 'v') cc = near ? (j === 0 ? '#c898ff' : '#8a4ad0') : (j === 0 ? '#7a4ab0' : '#4e2e7a');
      else if (L) cc = near ? (j === 0 ? G[2] : G[1]) : (j === 0 ? G[1] : G[0]);
      B.set(x + q, wy + j, cc); }
    if (near && L === 1 && i % 3 === 0) B.set(x, wy + 1, G[3]); });
  if (near) { B.set(Math.round(dcx) + 1, 17, G[2]); B.set(Math.round(dcx) + 1, 18, G[1]); for (const [sx, sy] of [[2, 116], [Math.round(cxAt(116) + halfAt(116) + 3), 117]]) B.set(sx === 2 ? bl - 6 : sx, sy, G[1]); }
  const c = toCanvas(B, near ? '#0c0e18' : null);
  if (near) { const g = c.getContext('2d'); g.globalCompositeOperation = 'destination-over';
    for (const [r, a] of [[18, 0.05], [13, 0.07], [9, 0.09]]) { g.fillStyle = 'rgba(125,255,138,' + a + ')'; circle(g, dcx, 18, r, g.fillStyle); }
    g.fillStyle = 'rgba(125,255,138,0.06)'; circle(g, cxAt(80) + 1, 80, 12, g.fillStyle); g.globalCompositeOperation = 'source-over';
    for (const [sx, sy] of [[dcx - 10, 6], [dcx + 8, 2], [dcx - 14, 16]]) px(g, Math.round(sx), sy, 'rgba(125,255,138,0.5)'); }
  return c;
}

// ============================================================================================
// THE FARM'S LEAVINGS (deco props)
// ============================================================================================
export function bakeDeadCorn(v = 0) {
  const W = 14, H = 26, B = buf(W, H), base = H - 1, top = v === 2 ? 12 : v === 1 ? 5 : 2;
  const sx = y => 6 + Math.round(Math.sin((base - y) * 0.13 + v) * 0.8) + (v === 1 && y < 11 ? Math.round((11 - y) * 0.55) : 0);
  for (let y = base; y >= top; y--) { const x = sx(y); B.set(x, y, CN[3]); B.set(x + 1, y, CN[1]); if ((base - y) % 6 === 5) B.set(x, y, CN[4]); }
  const leaf = (y0, side, len) => { const x0 = sx(y0) + (side > 0 ? 1 : 0);
    for (let i = 1; i <= len; i++) { const y = y0 - (i < 3 ? i >> 1 : 1) + Math.max(0, i - Math.ceil(len * 0.55)); B.set(x0 + side * i, y, i === len ? CN[1] : CN[2]); if (i > 1 && i < len - 1) B.set(x0 + side * i, y - 1, CN[3]); } };
  leaf(19, -1, 5); leaf(15, 1, 5); if (v !== 2) { leaf(10, -1, 4); leaf(7, 1, 4); }
  if (v === 0) { B.set(sx(2) - 1, 1, CN[4]); B.set(sx(2) + 1, 1, CN[3]); B.set(sx(2), 1, CN[4]); B.set(sx(2) + 2, 2, CN[3]);
    bRect(B, sx(13) + 2, 11, 2, 4, (x, y) => (y === 11 ? CN[4] : x === sx(13) + 2 ? CN[3] : CN[2])); B.set(sx(13) + 2, 15, CN[1]); }
  if (v === 1) { const x = sx(5); B.set(x + 1, 6, CN[4]); B.set(x + 2, 7, CN[3]); B.set(x + 2, 8, CN[2]); B.set(x + 3, 9, CN[1]); }
  if (v === 2) { B.set(sx(12), 11, CN[4]); B.set(sx(12) + 1, 12, CN[4]); B.set(sx(12) - 1, 12, CN[3]); for (let x = 1; x <= 5; x++) { B.set(x, base, x % 2 ? CN[2] : CN[3]); } B.set(0 + 1, base - 1, CN[4]); }
  for (let x = sx(base) - 1; x <= sx(base) + 2; x++) B.set(x, base, DIRT[2]);
  return toCanvas(B);
}
export function bakeCrookedFence(v = 0) {
  const W = 32, H = 16, B = buf(W, H), base = H - 1;
  const post = (x, lean, ht) => { const pts = []; for (let j = 0; j < ht; j++) { const X = Math.round(x + j * lean), Y = base - j; B.set(X, Y, j === ht - 1 ? WD[4] : WD[3]); B.set(X + 1, Y, j === ht - 1 ? WD[3] : WD[1]); pts.push([X, Y]); } return pts[pts.length - 1]; };
  const rail = (a, b, dy) => { const n = Math.max(1, Math.abs(b[0] - a[0])); for (let i = 0; i <= n; i++) { const t = i / n, x = Math.round(a[0] + (b[0] - a[0]) * t), y = Math.round(a[1] + (b[1] - a[1]) * t) + dy; B.set(x, y, hsh(x, y, 3) < 0.15 ? WD[2] : WD[3]); B.set(x, y + 1, WD[1]); } };
  if (v === 0) {
    const p1 = post(3, -0.12, 13), p2 = post(15, 0.08, 12), p3 = post(27, 0.28, 11);
    rail(p1, p2, 1); rail([p1[0], p1[1] + 5], [p2[0], p2[1] + 6], 0);
    rail(p2, [p2[0] + 5, p2[1] + 1], 1); rail([p3[0] - 3, p3[1] + 3], p3, 1);
    for (let i = 0; i < 6; i++) { B.set(p2[0] + 2 + i, p2[1] + 6 + i, WD[3]); B.set(p2[0] + 2 + i, p2[1] + 7 + i, WD[1]); }   /* the lower rail, dropped at one end */
    B.set(p1[0] + 1, p1[1] + 1, IR[3]); B.set(p2[0], p2[1] + 1, IR[3]);
  } else {
    const p1 = post(4, -0.4, 12), p2 = post(16, 0.18, 11);
    rail(p1, p2, 1); rail([p2[0], p2[1] + 1], [30, base - 1], 0);
    for (let x = 20; x <= 30; x++) { B.set(x, base - 1, x === 30 ? WD[4] : WD[3]); B.set(x, base, WD[1]); }
    B.set(p1[0] + 1, p1[1] + 1, IR[3]);
  }
  return toCanvas(B);
}
export function bakeScarePost() {
  const W = 20, H = 32, B = buf(W, H), base = H - 1;
  bRect(B, 9, 3, 2, 29, (x, y) => (x === 9 ? (hsh(x, y, 2) < 0.15 ? WD[2] : WD[3]) : WD[1]));
  B.set(9, 2, WD[4]); B.set(10, 2, WD[3]);
  bRect(B, 1, 9, 18, 2, (x, y) => (y === 9 ? (hsh(x, y, 5) < 0.15 ? WD[2] : WD[4]) : WD[1]));
  for (const [x, y] of [[8, 8], [11, 8], [9, 9], [10, 10], [8, 11], [11, 11], [10, 9], [9, 10]]) B.set(x, y, (x + y) % 2 ? HY[3] : HY[1]);
  // the shirt it wore, torn and blown off one arm
  const shirt = ['#3e3450', '#5a4c6a', '#7a6c8a', '#948aa2'];
  bPoly(B, [[2, 11], [9, 11], [9, 19], [7, 21], [6, 18], [5, 22], [3, 19], [1, 20], [2, 14]], (x, y) => { if (hsh(x, y, 11) < 0.07) return null; const s = (x + (y >> 1)) % 3 === 0 ? shirt[0] : x < 4 ? shirt[2] : shirt[1]; return y === 11 ? shirt[3] : s; });
  B.del(5, 16); B.del(5, 17); B.del(6, 17);
  bLine(B, 1, 11, 0, 15, shirt[1]); B.set(1, 16, shirt[0]);
  // straw still stuck in the other sleeve's lashing
  for (const [x, y, c] of [[17, 11, HY[4]], [18, 12, HY[3]], [16, 12, HY[2]], [18, 11, HY[3]], [15, 14, HY[3]], [16, 18, HY[2]]]) B.set(x, y, c);
  bLine(B, 17, 9, 17, 11, HY[1]);
  // and its hat, on the ground
  bRect(B, 12, base, 7, 1, '#2e2a30'); bRect(B, 13, base - 2, 5, 2, (x, y) => (y === base - 2 ? '#4a4450' : '#3a3440')); B.set(14, base - 1, '#6a4a3a');
  bRect(B, 7, base, 6, 1, DIRT[1]);
  return toCanvas(B);
}
export function bakePumpkinPatch() {
  const W = 28, H = 10, B = buf(W, H), base = H - 1;
  for (let x = 1; x < 27; x++) { const y = base - Math.round(Math.abs(Math.sin(x * 0.45)) * 1.4); B.set(x, y, hsh(x, 1, 1) < 0.5 ? '#4a4630' : '#3a3626'); }
  bLine(B, 3, base, 2, base - 3, '#4a4630'); B.set(1, base - 4, '#5a5438'); bLine(B, 25, base, 26, base - 2, '#4a4630');
  const pumpkin = (cx, cy, rx, ry, R, rot) => bEll(B, cx, cy, rx, ry, (x, y) => { const u = (x + 0.5 - cx) / rx, vv = (y + 0.5 - cy) / ry;
    let k = 0.62 - u * 0.3 - vv * 0.3; if (Math.abs(Math.sin(u * 3.2)) < 0.28) k -= 0.28; if (rot && hsh(x, y, 4) < 0.25) k -= 0.3; return ramp(R, k, x, y); });
  pumpkin(10.5, 6, 5.5, 3.6, PK); pumpkin(19, 7.2, 3.6, 2.6, PK); pumpkin(24, 8, 2.6, 1.9, ['#3a2a18', '#5a3e1e', '#7a5626', '#8a6a3a'], true);
  B.set(10, 2, '#4a3a22'); B.set(11, 2, '#3a2c1a'); B.set(10, 1, '#5a4a2a'); B.set(19, 4, '#4a3a22'); B.set(20, 4, '#3a2c1a');
  for (const [x, y] of [[8, 5], [12, 5]]) { B.set(x, y, PK[0]); } for (let x = 9; x <= 12; x++) B.set(x, 7 + (x % 2), PK[0]);   /* the old carved face, unlit */
  for (const [x, y, c] of [[15, 8, '#6a5e44'], [16, 7, '#5a4e38'], [5, 8, '#6a5e44'], [4, 7, '#5a4e38']]) B.set(x, y, c);
  return toCanvas(B);
}
export function bakeHayStack(v = 0) {
  const W = 30, H = 22, B = buf(W, H), base = H - 1, sp = straw(21 + v);
  const hAt = x => { const q = (x - (v ? 13 : 15)) / 13.5; const t = Math.max(0, 1 - q * q); return v ? Math.round(Math.pow(t, 0.8) * 15 + (x < 14 ? 0 : -((x - 14) * 0.2))) : Math.round(Math.sqrt(t) * 19 - Math.max(0, x - 18) * 0.35); };
  for (let x = 1; x < W - 1; x++) { const hh = hAt(x); if (hh <= 0) continue;
    for (let y = base - hh; y <= base; y++) { const k = 0.66 - (x / W) * 0.45 - ((y - (base - hh)) / 22) * 0.2 + (y === base - hh ? 0.2 : 0);
      let cc = ramp(HY, k, x, y); if (hsh(x, y, 13) < 0.18) cc = sp(x, y);
      if (hsh(Math.floor(x / 4), Math.floor(y / 3), 7 + v) < 0.18 && y > base - hh + 1) cc = hsh(x, y, 2) < 0.5 ? '#5a5a40' : '#46472f';   /* the mould */
      B.set(x, y, cc); } }
  for (let i = 0; i < 16; i++) { const x = 2 + ((hsh(i, 1, 31 + v) * 25) | 0), y = base - ((hsh(i, 2, 31 + v) * hAt(x)) | 0); B.set(x, y, HY[4]); B.set(x + 1, y + 1, HY[3]); }
  if (v === 0) for (let x = 3; x < 27; x++) { const y = base - Math.round(hAt(x) * 0.45); if (hAt(x) > 4) B.set(x, y, HY[0]); }   /* the rope round its middle */
  if (v === 1) { bLine(B, 17, base - 9, 25, 1, WD[3]); bLine(B, 18, base - 9, 26, 1, WD[1]); for (const [x, y] of [[23, 0], [25, 0], [27, 0], [24, 1], [26, 1]]) B.set(x + 1, y + 1, IR[3]); bRect(B, 23, 2, 5, 1, IR[2]);
    for (let x = 20; x < 29; x++) if (hsh(x, 3, 3) < 0.7) B.set(x, base - ((hsh(x, 4, 4) * 2) | 0), HY[(x % 3) + 1]); }
  return toCanvas(B);
}
export function bakeFarmLantern(lit = true) {
  const W = 8, H = 11, B = buf(W, H), base = H - 1;
  B.set(3, 0 + 1, IR[3]); B.set(4, 1, IR[3]); B.set(2, 2, IR[2]); B.set(5, 2, IR[2]);
  bRect(B, 2, 3, 4, 1, IR[3]); bRect(B, 1, 4, 6, 1, (x) => (x < 3 ? IR[3] : IR[1]));
  for (let y = 5; y <= 8; y++) { B.set(1, y, IR[2]); B.set(6, y, IR[1]);
    for (let x = 2; x <= 5; x++) B.set(x, y, lit ? ((x === 3 || x === 4) && (y === 6 || y === 7) ? (y === 7 ? FLAME[3] : FLAME[2]) : y === 8 ? FLAME[0] : FLAME[1]) : (x === 2 && y === 5 ? '#7a88a8' : y === 8 ? '#1c202c' : '#262c3c')); }
  bRect(B, 1, 9, 6, 1, (x) => (x < 3 ? IR[3] : IR[2])); bRect(B, 2, base, 4, 1, IR[1]);
  if (!lit) B.set(4, 7, '#3a4258');
  return toCanvas(B);
}
// THE LEANING BARN: a big background barn, leaning, boards gone, its hayloft door hanging open on one hinge. 96x76
export function bakeLeaningBarn() {
  const W = 96, H = 76, base = H - 1, B0 = buf(W, H), lean = 0.09;
  const B = { set: (x, y, c) => B0.set(x + Math.round((base - y) * lean), y, c), get: (x, y) => B0.get(x + Math.round((base - y) * lean), y), del: (x, y) => B0.del(x + Math.round((base - y) * lean), y) };
  const X0 = 5, X1 = 84, WT = 38;
  // walls: barn boards
  bRect(B, X0, WT, X1 - X0 + 1, base - WT + 1, (x, y) => { const r = (x - X0) % 4, s = hsh(x, (y / 4) | 0, 17);
    if (r === 3) return BR[0]; if (r === 0) return BR[3]; const k = 0.5 - (y - WT) * 0.004 + (s - 0.5) * 0.25; return ramp([BR[1], BR[2], BR[3]], k, x, y); });
  // the gable
  bPoly(B, [[X0 - 1, WT + 0.5], [X1 + 2, WT + 0.5], [X1 - 6, 22], [(X0 + X1) / 2 + 0.5, 11], [X0 + 7, 22]], (x, y) => { const r = (x - X0) % 4; return r === 3 ? BR[0] : r === 0 ? BR[3] : hsh(x, (y / 4) | 0, 19) < 0.3 ? BR[1] : BR[2]; });
  // the roof edge: dark shingles along the gambrel line, both sides
  const roofEdge = [[X0 - 4, WT + 1], [X0 + 6, 22], [(X0 + X1) / 2 + 0.5, 9], [X1 - 5, 22], [X1 + 5, WT + 1]];
  for (let i = 0; i < roofEdge.length - 1; i++) { const [ax, ay] = roofEdge[i], [bx, by] = roofEdge[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay));
    for (let j = 0; j <= n; j++) { const t = j / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t; for (let q = 0; q < 3; q++) B.set(x, y + q, q === 0 ? '#5a5668' : q === 1 ? '#3e3a4c' : '#2a2636'); } }
  // boards missing: the dark inside through the gaps
  for (const [hx, hy, hh] of [[X0 + 9, WT + 6, 14], [X0 + 13, WT + 12, 8], [X1 - 12, WT + 3, 18], [X1 - 8, WT + 10, 10], [X0 + 25, 26, 10]]) for (let y = hy; y < hy + hh; y++) { B.set(hx, y, '#120c14'); B.set(hx + 1, y, '#120c14'); B.set(hx + 2, y, y % 5 === 0 ? BR[0] : '#1a1220'); }
  // the hayloft door, open, and its door hanging from one hinge
  const HLx = 38, HLy = 22;
  bRect(B, HLx, HLy, 13, 14, (x, y) => (y > HLy + 10 && hsh(x, y, 3) < 0.6 ? HY[(x % 3) + 1] : '#0e0a12'));
  for (let x = HLx - 1; x <= HLx + 13; x++) { B.set(x, HLy - 1, WD[3]); B.set(x, HLy + 14, WD[3]); }
  bPoly(B, [[HLx + 14, HLy], [HLx + 22, HLy + 5], [HLx + 22, HLy + 19], [HLx + 14, HLy + 14]], (x, y) => ((x - HLx) % 3 === 0 ? BR[1] : y < HLy + 4 + (x - HLx - 14) * 0.6 ? BR[4] : BR[3]));
  bLine(B, HLx + 15, HLy + 2, HLx + 21, HLy + 17, WD[4]);
  // the hay hood and its rope
  bRect(B, 44, 8, 3, 3, WD[2]); bLine(B, 45, 11, 45, 20, HY[1]); B.set(45, 21, IR[3]);
  // the big doors: one shut and braced, one fallen half off its track
  bRect(B, 32, 50, 12, 26, (x, y) => ((x - 32) % 3 === 0 ? BR[1] : BR[3]));
  bLine(B, 32, 51, 43, 74, '#6e645e'); bLine(B, 32, 74, 43, 51, '#6e645e'); bRect(B, 32, 50, 12, 1, '#6e645e'); bRect(B, 32, 75, 12, 1, '#5a524c');
  bRect(B, 44, 50, 13, 26, '#0e0a12'); bPoly(B, [[46, 52], [57, 55], [58, 76], [48, 76]], (x, y) => ((x + (y >> 3)) % 3 === 0 ? BR[1] : BR[2]));
  bLine(B, 47, 53, 57, 75, '#8a7c70'); for (let x = 31; x < 60; x++) B.set(x, 49, IR[2]);
  // a small window with its glass gone, and a lamp-hook
  bRect(B, 14, 44, 7, 6, '#0e0a12'); bRect(B, 17, 44, 1, 6, WD[2]); bRect(B, 13, 43, 9, 1, WD[3]); bRect(B, 13, 50, 9, 1, WD[2]);
  // stone footing and weeds
  for (let x = X0 - 1; x <= X1 + 1; x++) { B.set(x, base - 1, hsh(x >> 2, 0, 5) < 0.5 ? SN[2] : SN[1]); B.set(x, base, SN[1]); if (hsh(x, 1, 6) < 0.3) B.set(x, base - 2 - ((hsh(x, 2, 6) * 2) | 0), '#4a4a36'); }
  for (let y = WT; y < base; y++) B.set(X0, y, BR[4]);
  const c = toCanvas(B0);
  return c;
}
export function bakeBrokenCart() {
  const W = 42, H = 22, B = buf(W, H), base = H - 1;
  // spilled hay under the low end
  for (let x = 1; x < 16; x++) { const hh = Math.round(3.5 * Math.sin(Math.min(1, x / 15) * Math.PI) + 0.5); for (let y = base - hh; y <= base; y++) B.set(x, y, straw(3)(x, y)); }
  // the bed, tipped down to the left, its sideboard facing us
  bPoly(B, [[3, 15], [31, 3], [33, 8], [5, 20]], (x, y) => { const d = (y - 15) + (x - 3) * (12 / 28); const r = ((Math.round(d) % 3) + 3) % 3; return r === 0 ? WD[3] : r === 2 ? WD[1] : hsh(x, y, 5) < 0.1 ? WD[1] : WD[2]; });
  for (const t of [0.05, 0.36, 0.68, 0.95]) { const x = 3 + t * 28, y = 15 - t * 12; bLine(B, x, y - 3, x + 1, y + 4, WD[4]); }
  bLine(B, 3, 12, 31, 0, WD[3]); bLine(B, 3, 13, 31, 1, WD[1]);
  for (const [x, y] of [[10, 9], [15, 7], [20, 5], [26, 3]]) { B.set(x, y, HY[3]); B.set(x + 1, y - 1, HY[4]); B.set(x - 1, y, HY[2]); }
  // the shafts, up in the air
  bLine(B, 31, 8, 40, 1, WD[3]); bLine(B, 31, 9, 40, 2, WD[1]); B.set(40, 1, IR[3]);
  // the good wheel
  const cx = 24, cy = 16, r = 5;
  bEll(B, cx, cy, r + 0.5, r + 0.5, (x, y) => { const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); return d > r - 1 ? ((x + y) < cx + cy ? IR[3] : IR[1]) : null; });
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + 0.2; bLine(B, cx + Math.cos(a) * 1.5, cy + Math.sin(a) * 1.5, cx + Math.cos(a) * (r - 1), cy + Math.sin(a) * (r - 1), WD[3]); }
  bRect(B, cx - 1, cy - 1, 2, 2, IR[2]); B.set(cx - 1, cy - 1, IR[4]);
  // the broken one, collapsed under the low end
  for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI * 0.75, x = 10 + Math.cos(a) * 5.5, y = base + Math.sin(a) * 4; B.set(x, y, i % 4 === 3 ? IR[1] : IR[3]); B.set(x, y + 1, IR[1]); }
  bLine(B, 10, base, 7, base - 3, WD[3]); bLine(B, 11, base, 13, base - 3, WD[2]); bLine(B, 16, base, 20, base - 1, WD[3]);
  return toCanvas(B);
}
export function bakePlough() {
  const W = 30, H = 14, B = buf(W, H), base = H - 1;
  const rust = (x, y) => ramp([RU[0], RU[1], RU[2], RU[3]], 0.55 - (x - 14) * 0.04 - (y - 7) * 0.05 + (hsh(x, y, 3) - 0.5) * 0.4, x, y);
  bLine(B, 2, 1, 13, 9, WD[3]); bLine(B, 3, 1, 14, 9, WD[1]); bLine(B, 6, 1, 15, 8, WD[3]); B.set(2, 1, WD[4]); B.set(6, 1, WD[4]);
  bRect(B, 12, 7, 16, 2, (x, y) => (y === 7 ? WD[3] : WD[1]));
  bPoly(B, [[13, 9], [22, 8], [21, 13.5], [12, 13.5]], rust);
  bPoly(B, [[20, 11], [28, 13.5], [18, 13.5]], (x, y) => (y === 11 || x > 25 ? IR[4] : IR[3]));
  bLine(B, 24, 9, 25, 12, IR[2]);
  bEll(B, 27, 10.5, 2.6, 2.6, (x, y) => (Math.hypot(x + 0.5 - 27, y + 0.5 - 10.5) > 1.4 ? RU[1] : IR[2])); B.set(26, 9, RU[3]);
  for (const [x, y] of [[15, 10], [18, 12], [16, 12]]) B.set(x, y, RU[3]);
  return toCanvas(B);
}
export function bakeMilkChurn() {
  const W = 8, H = 12, B = buf(W, H), base = H - 1;
  const tin = (x, y) => ramp(TN, 0.7 - (x - 1) * 0.12 + (hsh(x, y, 4) < 0.08 ? -0.2 : 0), x, y);
  bRect(B, 3, 1, 2, 1, TN[3]); bRect(B, 3, 2, 2, 1, TN[1]); bRect(B, 2, 3, 4, 1, tin); bRect(B, 1, 4, 6, 8, tin);
  for (const y of [5, 10]) bRect(B, 1, y, 6, 1, (x) => (x < 3 ? TN[2] : TN[0]));
  B.set(0 + 1, 4, IR[3]); B.set(6, 4, IR[2]); B.set(5, 7, TN[1]); B.set(2, 8, TN[4]); bRect(B, 1, base, 6, 1, TN[0]);
  return toCanvas(B);
}
export function bakeWaterPump() {
  const W = 12, H = 22, B = buf(W, H), base = H - 1;
  bRect(B, 1, 17, 10, 5, (x, y) => (y === 17 ? SN[3] : x === 10 ? SN[1] : hsh(x, y, 2) < 0.15 ? SN[1] : SN[2]));
  bRect(B, 4, 6, 4, 11, (x) => (x === 4 ? IR[3] : x === 7 ? IR[1] : IR[2]));
  for (const y of [8, 14]) bRect(B, 3, y, 6, 1, (x) => (x < 5 ? IR[3] : IR[1]));
  bRect(B, 3, 4, 6, 2, (x, y) => (y === 4 ? (x < 6 ? IR[4] : IR[3]) : IR[2])); B.set(5, 3, IR[3]); B.set(6, 3, IR[2]);
  bRect(B, 8, 8, 3, 2, (x, y) => (y === 8 ? IR[3] : IR[1])); B.set(10, 10, IR[2]); B.set(10, 11, IR[1]);
  B.set(10, 13, '#8ab0d0');
  bLine(B, 8, 3, 2, 1, IR[3]); B.set(8, 4, IR[1]); B.set(1, 1, WD[4]); B.set(1, 2, WD[3]);
  for (const [x, y, c] of [[3, 16, RU[2]], [7, 12, RU[1]], [4, 11, RU[2]]]) B.set(x, y, c);
  for (let x = 1; x <= 10; x++) if (hsh(x, 3, 3) < 0.35) B.set(x, 16, '#4a5440');
  B.set(1, base, SN[1]);
  return toCanvas(B);
}
export function bakeGrave(v = 0) {
  const W = 12, H = 16, B = buf(W, H), base = H - 1;
  const stoneC = (x, y, x0) => { const s = hsh(x, y, 7 + v); if (s < 0.08) return SN[1]; if (s > 0.95) return SN[4]; return x <= x0 + 1 ? SN[3] : x > x0 + 5 ? SN[1] : SN[2]; };
  if (v === 0) {
    const sh = y => Math.round((base - y) * -0.14);
    for (let y = 2; y <= base; y++) { const hw = y < 5 ? [2, 3, 4][y - 2] : 4; for (let x = 6 - hw; x < 6 + hw; x++) B.set(x + sh(y) + 1, y, y === 2 ? SN[3] : stoneC(x, y, 2)); }
    for (const [x, y] of [[4, 6], [5, 6], [6, 6], [7, 6], [4, 8], [6, 8], [7, 8], [5, 10], [6, 10]]) B.set(x + sh(y) + 1, y, SN[1]);
    B.set(8 + sh(4), 4, SN[0]); B.set(8 + sh(5), 5, SN[0]); B.set(7 + sh(6), 6, SN[0]);
    for (let x = 1; x <= 10; x++) { B.set(x, base, DIRT[1]); if (hsh(x, 0, 2) < 0.4) B.set(x, base - 1, '#4a5440'); }
  } else if (v === 1) {
    const sh = y => Math.round((base - y) * 0.16);
    for (let y = 2; y <= base; y++) { B.set(5 + sh(y), y, WD[3]); B.set(6 + sh(y), y, WD[1]); }
    for (let x = 2; x <= 9; x++) { const y = 5 + Math.round((x - 2) * 0.12); B.set(x + sh(y), y, WD[3]); B.set(x + sh(y), y + 1, WD[1]); }
    B.set(3 + sh(6), 7, '#6a5a7a'); B.set(3 + sh(6), 8, '#5a4c6a'); B.set(4 + sh(6), 9, '#6a5a7a');
    for (let x = 1; x <= 10; x++) { const hh = Math.round(Math.sin((x - 0.5) / 10 * Math.PI) * 2); for (let y = base - hh; y <= base; y++) B.set(x, y, y === base - hh ? DIRT[3] : DIRT[2]); }
  } else {
    for (let y = 5; y <= base; y++) for (let x = 2; x <= 9; x++) { const topAt = 5 + Math.round(Math.abs(Math.sin(x * 1.7)) * 3) + (x > 5 ? 2 : 0); if (y >= topAt) B.set(x, y, y === topAt ? SN[3] : stoneC(x, y, 2)); }
    for (let x = 7; x <= 10; x++) { B.set(x, base, SN[2]); B.set(x, base - 1, x === 7 ? SN[3] : SN[3]); }
    B.set(4, 10, SN[1]); B.set(5, 10, SN[1]); B.set(4, 12, SN[1]);
    for (let x = 1; x <= 10; x++) if (hsh(x, 5, 2) < 0.4) B.set(x, base, '#4a5440');
  }
  return toCanvas(B);
}
export function bakeCrypt() {
  const W = 48, H = 40, B = buf(W, H), base = H - 1;
  const stoneC = (x, y) => { const s = hsh(x, y, 41), course = (y % 4) === 0, joint = ((x + ((y >> 2) & 1) * 3) % 7) === 0;
    if (s < 0.06) return SN[1]; if (course || joint) return SN[1]; return s > 0.96 ? SN[4] : SN[2]; };
  bRect(B, 2, base - 1, 44, 2, (x, y) => (y === base - 1 ? SN[3] : SN[1])); bRect(B, 4, base - 3, 40, 2, (x, y) => (y === base - 3 ? SN[3] : SN[2]));
  bRect(B, 6, 13, 36, 23, stoneC);
  for (const x0 of [6, 38]) bRect(B, x0, 13, 4, 23, (x, y) => (y < 15 ? SN[4] : x === x0 ? SN[4] : x === x0 + 3 ? SN[1] : SN[3]));
  bRect(B, 3, 11, 42, 2, (x, y) => (y === 11 ? SN[4] : SN[1]));
  bPoly(B, [[4, 11], [44, 11], [24, 2.5]], (x, y) => { const d = Math.abs(x - 24) - (11 - y) * 20 / 8.5; return d > -3 ? (x < 24 ? SN[4] : SN[2]) : stoneC(x, y); });
  bEll(B, 24, 7.5, 2, 1.6, SN[1]); B.set(24, 7, SN[0]);
  bRect(B, 23, 0 + 1, 2, 2, SN[3]); B.set(22, 2, SN[3]); B.set(25, 2, SN[2]);
  bRect(B, 18, 14, 12, 3, SN[1]); for (let x = 19; x < 29; x += 2) B.set(x, 15, SN[0]);
  // the iron door under a round arch
  for (let y = 18; y <= base - 4; y++) for (let x = 17; x <= 30; x++) { const dx = x + 0.5 - 24, arch = y < 23 ? Math.sqrt(Math.max(0, 49 - Math.pow((23 - y) * 1.35, 2))) : 7;
    if (Math.abs(dx) > arch + 1.5) continue;
    if (Math.abs(dx) > arch - 0.5) { B.set(x, y, SN[3]); continue; }
    B.set(x, y, (x % 2 === 0) ? (x < 22 ? IR[3] : IR[2]) : '#0e0f16'); }
  for (const y of [24, 31]) for (let x = 18; x <= 29; x++) B.set(x, y, x < 22 ? IR[3] : IR[2]);
  B.set(26, 27, IR[4]); B.set(27, 28, IR[3]); B.set(26, 29, IR[2]); B.set(22, 28, '#e0c070');
  // cracks, dead ivy
  bLine(B, 12, 16, 14, 24, SN[0]); bLine(B, 35, 26, 33, 33, SN[0]);
  for (let y = 14; y < 34; y++) { const x = 8 + Math.round(Math.sin(y * 0.6) * 1.5); if (hsh(x, y, 5) < 0.6) B.set(x, y, y % 3 ? '#4a4436' : '#5e5644'); }
  // the lantern bracket, with an old lantern
  bRect(B, 42, 18, 4, 1, IR[2]); B.set(45, 19, IR[2]); bLine(B, 42, 21, 45, 18, IR[1]);
  bRect(B, 44, 20, 3, 1, IR[3]); bRect(B, 44, 21, 3, 3, (x, y) => (x === 45 ? '#262c3c' : IR[2])); bRect(B, 44, 24, 3, 1, IR[1]); B.set(45, 21, '#7a88a8');
  return toCanvas(B);
}
// THE FAMILY PORTRAIT. Its eyes are two 2px whites (canvas.eyes); the runtime puts a pupil in each, looking at the hero.
export function bakePortrait() {
  const W = 14, H = 16, B = buf(W, H);
  bRect(B, 0, 0, W, H, (x, y) => { const e = Math.min(x, y, W - 1 - x, H - 1 - y); if (e === 0) return '#2a1a0e'; if (e === 1) return x < 7 && y < 8 ? '#c8a452' : (x + y) % 2 ? '#8a6a2a' : '#a8883a'; return '#262a24'; });
  B.set(1, 1, '#e8cc78'); B.set(12, 14, '#5a4418');
  for (let y = 2; y < 14; y++) for (let x = 2; x < 12; x++) if (hsh(x, y, 3) < 0.2) B.set(x, y, '#2e3228');
  bRect(B, 4, 2, 6, 2, '#141216'); bRect(B, 3, 4, 8, 1, '#1c1a20'); B.set(5, 2, '#2a2830');
  bRect(B, 4, 5, 6, 5, (x, y) => (x > 7 ? '#7a5e4c' : '#a8886c'));
  bRect(B, 4, 5, 2, 1, '#3a2a22'); bRect(B, 8, 5, 2, 1, '#3a2a22');
  bRect(B, 4, 6, 2, 1, '#d0c8b4'); bRect(B, 8, 6, 2, 1, '#bab29e');
  B.set(6, 7, '#7a5e4c'); B.set(7, 7, '#6a4e3e'); bRect(B, 5, 9, 4, 1, '#3a2a22');
  B.set(4, 8, '#5a4838'); B.set(9, 8, '#4a3a2e'); B.set(4, 9, '#5a4838'); B.set(9, 9, '#4a3a2e');
  bRect(B, 3, 10, 8, 4, (x, y) => (Math.abs(x - 6.5) < 1.5 - (y - 10) * 0.5 ? '#b8b0a0' : '#1e1c24'));
  bRect(B, 2, 12, 10, 2, (x, y) => (Math.abs(x - 6.5) < 0.6 ? '#b8b0a0' : '#1e1c24'));
  const c = toCanvas(B, null);
  c.eyes = [{ x: 4, y: 6, w: 2 }, { x: 8, y: 6, w: 2 }];
  return c;
}
export function bakeCandle(lit = true) {
  const W = 6, H = 8, B = buf(W, H);
  bRect(B, 1, 6, 4, 1, (x) => (x < 3 ? '#a8905a' : '#7a6640')); bRect(B, 0 + 1, 7, 4, 1, '#5a4a30');
  bRect(B, 2, 3, 2, 3, (x) => (x === 2 ? '#d8d0b0' : '#a8a088')); B.set(3, 4, '#c8c0a0');
  B.set(2, 2, '#2a2020');
  const c = toCanvas(B);
  const g = c.getContext('2d');
  if (lit) { px(g, 2, 0, '#ffb04a'); px(g, 2, 1, '#fff2b0'); px(g, 3, 1, '#ffd36b'); }
  else { px(g, 3, 0, 'rgba(160,160,170,0.6)'); }
  return c;
}

// ============================================================================================
// THE HEX (ghost-green: usable)
// ============================================================================================
export function bakeHexTrough() {
  const W = 26, H = 14, base = H - 1;
  const body = (broken) => { const B = buf(W, H);
    for (const x0 of [2, 21]) for (let y = 10; y <= base; y++) { B.set(x0 + (y > 11 ? (x0 < 10 ? -1 : 2) : 0), y, WD[3]); B.set(x0 + 1 + (y > 11 ? (x0 < 10 ? -1 : 2) : 0), y, WD[1]); }
    planksH(B, 2, 5, 22, 6, 7);
    for (const x0 of [1, 23]) bRect(B, x0, 3, 2, 8, (x, y) => (y === 3 ? WD[4] : x === x0 ? WD[3] : WD[1]));
    for (const x of [3, 22]) { B.set(x, 6, IR[3]); B.set(x, 9, IR[3]); }
    if (broken) { for (let y = 5; y <= 10; y++) { const g0 = 12 - Math.round((10 - y) * 0.5), g1 = 14 + Math.round((10 - y) * 0.3); for (let x = g0; x <= g1; x++) B.del(x, y); }
      for (const [x, y] of [[11, 5], [15, 6], [11, 8], [16, 9]]) B.set(x, y, WD[4]); }
    return B; };
  const full = () => { const B = body(false), c = toCanvas(B), g = c.getContext('2d');
    for (let x = 3; x <= 22; x++) { const bulge = x > 6 && x < 19 ? 1 : 0; px(g, x, 4 - bulge, bulge ? G[2] : G[1]); px(g, x, 4, (x % 5 === 2) ? G[3] : G[1]); if (bulge) px(g, x, 3, G[2]); }
    for (let x = 3; x <= 22; x++) px(g, x, 5, x % 3 ? G[1] : G[0]);
    for (const [x, y, c2] of [[9, 3, G[3]], [15, 2, G[2]], [16, 1, G[3]], [12, 2, G[1]]]) px(g, x, y, c2);
    for (const [x, y0, n] of [[6, 6, 3], [18, 6, 4]]) for (let j = 0; j < n; j++) px(g, x, y0 + j, j === n - 1 ? G[2] : G[1]);
    return c; };
  const broken = () => { const B = body(true);
    for (let x = 0; x < W; x++) { const d = Math.abs(x - 13.5); if (d > 12.5) continue; B.set(x, base, d > 10 ? G[0] : G[1]); if (d < 8) B.set(x, base - 1, d > 6 ? G[0] : G[1]); }
    const c = toCanvas(B), g = c.getContext('2d');
    for (let x = 3; x <= 22; x++) if (x < 11 || x > 15) px(g, x, 9, G[0]);
    for (const [x, y, c2] of [[13, 7, G[2]], [13, 10, G[1]], [12, 11, G[2]], [9, base, G[2]], [17, base - 1, G[3]], [5, base, G[2]]]) px(g, x, y, c2);
    return c; };
  return [full(), broken()];
}
export function bakeHexBucket() {
  const W = 12, H = 12, base = H - 1;
  const up = () => { const B = buf(W, H);
    for (let y = 3; y <= base; y++) { const inset = Math.round((y - 3) * 0.14); for (let x = 2 + inset; x <= 9 - inset; x++) B.set(x, y, y === 4 || y === 9 ? TN[0] : ramp(TN, 0.75 - (x - 2) * 0.1, x, y)); }
    const c = toCanvas(B), g = c.getContext('2d');
    for (let x = 3; x <= 8; x++) px(g, x, 3, x === 5 ? G[3] : G[1]); px(g, 4, 2, G[2]); px(g, 7, 2, G[2]); px(g, 6, 1, G[3]);
    for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI, x = 5.5 + Math.cos(a) * 4.5, y = 3 + Math.sin(a) * 2.6; px(g, Math.round(x), Math.round(y), IR[3]); }
    px(g, 9, 5, G[1]); px(g, 9, 6, G[2]);
    return c; };
  const tipped = () => { const B = buf(W, H);
    for (let x = 1; x <= 7; x++) { const hw = 2 + Math.round((x - 1) * 0.35); for (let y = base - 1 - hw * 2 + 1; y <= base - 1; y++) B.set(x, y, x === 3 || x === 6 ? TN[0] : ramp(TN, 0.8 - (y - (base - 2 * hw)) * 0.12, x, y)); }
    bEll(B, 8, base - 4, 1.2, 3.3, (x, y) => (y < base - 5 ? TN[3] : TN[1]));
    for (let x = 6; x <= 11; x++) B.set(x, base, x > 9 ? G[0] : G[1]);
    for (let i = 0; i <= 6; i++) B.set(2 + i, base, IR[2]);
    const c = toCanvas(B), g = c.getContext('2d');
    px(g, 8, base - 3, G[1]); px(g, 8, base - 2, G[2]); px(g, 9, base - 1, G[1]); px(g, 10, base - 1, G[2]); px(g, 9, base, G[3]); px(g, 11, base, G[1]);
    return c; };
  return [up(), tipped()];
}
export function bakeHexSluice() {
  const W = 18, H = 26, base = H - 1;
  const frame = (open) => { const B = buf(W, H), bt = open ? 9 : 15, bb = open ? 17 : base;
    for (const x0 of [1, 14]) bRect(B, x0, 7, 3, 19, (x, y) => (x === x0 ? WD[3] : x === x0 + 2 ? WD[1] : hsh(x, y, 4) < 0.15 ? WD[1] : WD[2]));
    bRect(B, 1, 7, 16, 2, (x, y) => (y === 7 ? WD[4] : WD[1]));
    planksH(B, 4, bt, 10, bb - bt + 1, 9, WD, 3);
    bRect(B, 8, open ? 3 : 5, 2, bt - (open ? 3 : 5), (x) => (x === 8 ? IR[4] : IR[2]));
    for (let y = bt + 1; y < bb; y += 4) { B.set(4, y, IR[3]); B.set(13, y, IR[3]); }
    const cy = 3.5, a0 = open ? 0.4 : 0;
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; B.set(8.5 + Math.cos(a) * 3.2, cy + Math.sin(a) * 2.8, i < 8 ? IR[2] : IR[3]); }
    for (let k = 0; k < 4; k++) { const a = a0 + k * Math.PI / 2; bLine(B, 8.5, cy, 8.5 + Math.cos(a) * 2.4, cy + Math.sin(a) * 2, IR[3]); }
    B.set(8, 3, IR[4]);
    return B; };
  const mk = open => { const B = frame(open), c = toCanvas(B), g = c.getContext('2d'), free = (x, y) => !B.get(x, y);
    if (!open) {
      for (let y = 10; y < 15; y++) for (let x = 4; x <= 13; x++) if (free(x, y)) px(g, x, y, y === 10 ? ((x + 1) % 4 ? G[2] : G[3]) : (x + y) % 5 === 0 ? G[2] : G[1]);
      for (const y of [17, 20, 23]) for (let x = 5; x <= 12; x++) if ((x + y) % 3 === 0) px(g, x, y, G[0]);
      px(g, 6, base, G[1]); px(g, 11, base, G[1]);
    } else {
      for (let y = 12; y < 18; y++) for (let x = 4; x <= 13; x++) if (free(x, y) && y > 12) px(g, x, y, y === 13 ? G[2] : G[1]);
      for (let y = 18; y <= base; y++) for (let x = 4; x <= 13; x++) { const s = (x * 3 + y * 5) % 7; px(g, x, y, s === 0 ? G[3] : s < 3 ? G[2] : G[1]); }
      for (let x = 0; x < W; x++) { if (x > 3 && x < 14) continue; px(g, x, base, x === 0 || x === 17 ? G[0] : G[1]); if (x === 3 || x === 14) px(g, x, base - 1, G[2]); }
      for (const [x, y] of [[3, 20], [14, 21], [2, 23], [15, 23]]) px(g, x, y, G[2]);
    }
    return c; };
  return [mk(false), mk(true)];
}
export function bakeVineParts() {
  const VD = ['#1a361c', '#2e5a2a', '#3e7236', '#5a8e4a'];
  const stalk = f => { const W = 8, H = 16, [c, g] = canvas(W, H);
    for (let y = 0; y < H; y++) { const cx = 3.5 + 1.2 * Math.sin(y / 16 * TAU), x0 = Math.round(cx - 1.5);
      px(g, x0 - 1, y, OUT); px(g, x0, y, VD[2]); px(g, x0 + 1, y, VD[1]); px(g, x0 + 2, y, VD[0]); px(g, x0 + 3, y, OUT);
      const vx = Math.round(cx - 0.5 + 0.6 * Math.sin(y / 16 * TAU * 2)), pulse = ((y - f * 8 + 16) % 16) < 5;
      px(g, Math.max(x0, Math.min(x0 + 2, vx)), y, pulse ? G[2] : G[1]);
      if (y === 5) { px(g, x0 - 1, y, VD[3]); px(g, x0 - 2, y - 1, VD[2]); px(g, x0 - 2, y, OUT); px(g, x0 - 3, y - 1, OUT); px(g, x0 - 2, y - 2, OUT); px(g, x0 - 1, y - 1, OUT); }
      if (y === 12) { px(g, x0 + 3, y, VD[2]); px(g, x0 + 4, y - 1, VD[1]); px(g, x0 + 4, y, OUT); px(g, x0 + 5, y - 1, OUT); px(g, x0 + 4, y - 2, OUT); px(g, x0 + 3, y - 1, OUT); }
    }
    return c; };
  const pad = mode => { const W = 32, H = 10, B = buf(W, H), sag = x => (mode === 0 ? 0 : Math.round(Math.pow((x - 15.5) / 15.5, 2) * (mode === 2 ? 4 : 3)));
    const LV = mode === 2 ? ['#3a3228', '#4e4538', '#6a5e4a', '#8a7c64'] : mode === 1 ? ['#243e22', '#3e6a38', '#4e7e46', '#6a9a5a'] : VD;
    const edge = mode === 0 ? G[2] : mode === 1 ? G[1] : LV[3], vein = mode === 0 ? G[1] : mode === 1 ? G[0] : LV[0];
    const leaves = mode === 2 ? [[4, 5, 3, 2], [12, 6, 3, 1.8], [20, 5, 3.2, 2], [27, 6, 2.6, 1.6]] : [[4, 5, 4, 2.6], [12, 6, 4.5, 2.8], [20, 5, 4.2, 2.6], [27.5, 6, 3.6, 2.4]];
    for (const [lx, ly, rx, ry] of leaves) { const s = sag(Math.round(lx)), cy = ly + s;
      bEll(B, lx, cy, rx, ry, (x, y) => { const u = (x + 0.5 - lx) / rx, v = (y + 0.5 - cy) / ry; if (mode === 2 && hsh(x, y, 5) < 0.2) return null;
        if (Math.abs(v) < 0.25 && Math.abs(u) < 0.8) return vein; if (u * u + v * v > 0.6 && v < 0.1 && u < 0.3) return edge; return ramp(LV, 0.62 - u * 0.25 - v * 0.3, x, y); }); }
    for (let x = 1; x < 31; x++) { const y = 1 + sag(x); B.set(x, y, mode === 0 && x % 4 === 1 ? G[2] : LV[2]); B.set(x, y + 1, LV[1]); if (mode === 0 && x % 6 === 3) B.set(x, y + 1, G[1]); }
    if (mode === 0) { B.set(31, 1, LV[2]); B.set(31, 0, G[1]); B.set(30, 0, G[2]); }
    if (mode === 2) { B.set(0, 2 + sag(0), LV[2]); for (const x of [8, 16, 24]) B.del(x, 1 + sag(x)); }
    const c = toCanvas(B), g = c.getContext('2d');
    if (mode === 1) for (const [x, y] of [[8, 9], [23, 8]]) { px(g, x, y, LV[2]); px(g, x + 1, y, LV[1]); }
    return c; };
  const bud = () => { const W = 14, H = 8, base = H - 1, B = buf(W, H);
    bEll(B, 7, base + 0.5, 6, 3.6, (x, y) => ramp(DIRT, 0.6 - (x - 7) * 0.06 - (y - 5) * 0.12, x, y));
    bEll(B, 7, 4.2, 2.6, 1.8, (x, y) => ((x === 6 || x === 7) && y === 4 ? G[3] : G[1]));
    B.set(7, 2, G[2]); B.set(6, 1, G[2]); B.set(8, 1, G[1]); B.set(7, 3, G[1]);
    const c = toCanvas(B), g = c.getContext('2d'); px(g, 2, 3, G[2]); px(g, 11, 2, G[1]); px(g, 12, 4, G[2]);
    return c; };
  return { stalk: [stalk(0), stalk(1)], pad: [pad(0), pad(1), pad(2)], bud: bud() };
}
export function bakePhantomPlank() {
  const W = 16, H = 8;
  const mk = fading => { const [c, g] = canvas(W, H), a = fading ? 0.72 : 0.9;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (fading && (bay(x, y) + hsh(x, y, 8) * 0.5) > 0.75) continue;
      let cc, al = a;
      if (y === 0) { cc = x % 5 === 2 ? G[3] : G[2]; al = 1; } else if (y === 7) { cc = G[1]; al = 1; } else if (y === 1) cc = '232,244,255';
      else if (y === 6) cc = '120,146,190';
      else { cc = x === 15 ? '134,158,200' : (hsh(x >> 2, y, 3) < 0.25 ? '144,166,204' : '180,198,228'); }
      g.fillStyle = cc[0] === '#' ? cc : 'rgba(' + cc + ',' + al + ')'; g.fillRect(x, y, 1, 1); }
    if (!fading || true) for (const x of [2, 12]) { if (fading && x === 12) continue; px(g, x, 3, '#ffffff'); px(g, x, 4, 'rgba(110,130,170,0.9)'); }
    return c; };
  return [mk(false), mk(true)];
}
/* a ghost object: its own OUT outline, and a 1px ghost-green rim OUTSIDE that; the top of the rim catches the brighter green */
function ghost(B) {
  const c = outline(outline(toCanvas(B, null), OUT), G[1]), g = c.getContext('2d'), w = c.width, d = g.getImageData(0, 0, w, c.height).data;
  for (let x = 0; x < w; x++) { const i = x * 4; if (d[i + 3] > 0 && d[i] === 63 && d[i + 1] === 191 && hsh(x, 0, 3) < 0.7) px(g, x, 0, G[2]); }
  return c;
}
export function bakeGhostThings() {
  const bale = (() => { const W = 32, H = 16, B = buf(W, H), sp = straw(51);
    bRect(B, 2, 2, 28, 12, (x, y) => (y === 2 ? HY[4] : y === 13 ? HY[1] : (y - 2) % 3 === 0 && hsh(x, y, 2) < 0.5 ? HY[3] : sp(x, y)));
    for (const bx of [9, 21]) for (let y = 2; y < 14; y++) { B.set(bx, y, '#5a4030'); B.set(bx + 1, y, '#3e2c22'); }
    for (let y = 3; y < 13; y++) { B.set(2, y, HY[3]); B.set(29, y, HY[1]); }
    return ghost(B); })();
  const cart = (() => { const W = 48, H = 22, B = buf(W, H);
    planksH(B, 2, 2, 44, 7, 61); bRect(B, 2, 2, 44, 1, WD[4]);
    for (const x of [2, 15, 31, 45]) bRect(B, x, 3, 1, 6, WD[1]);
    bRect(B, 6, 9, 36, 2, (x, y) => (y === 9 ? WD[2] : WD[0]));
    for (const cx of [12, 36]) { const cy = 14, r = 5.5;
      bEll(B, cx, cy, r, r, (x, y) => { const dd = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); return dd > r - 1.2 ? ((x + y) < cx + cy ? IR[3] : IR[1]) : null; });
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; bLine(B, cx + Math.cos(a) * 1.5, cy + Math.sin(a) * 1.5, cx + Math.cos(a) * (r - 1.3), cy + Math.sin(a) * (r - 1.3), WD[3]); }
      bRect(B, cx - 1, cy - 1, 2, 2, IR[2]); B.set(cx - 1, cy - 1, IR[4]); }
    return ghost(B); })();
  const chair = (() => { const W = 16, H = 22, B = buf(W, H);
    bRect(B, 2, 2, 12, 2, (x, y) => (y === 2 ? WD[4] : WD[2]));
    for (const x0 of [2, 12]) bRect(B, x0, 4, 2, 16, (x) => (x === x0 ? WD[3] : WD[1]));
    for (const y of [6, 9]) bRect(B, 4, y, 8, 1, WD[2]);
    bRect(B, 2, 12, 12, 2, (x, y) => (y === 12 ? HY[3] : hsh(x, y, 3) < 0.4 ? HY[1] : HY[2]));
    bRect(B, 4, 16, 8, 1, WD[1]);
    return ghost(B); })();
  const table = (() => { const W = 32, H = 16, B = buf(W, H);
    bRect(B, 2, 2, 28, 3, (x, y) => (y === 2 ? WD[4] : y === 4 ? WD[1] : hsh(x, y, 4) < 0.12 ? WD[1] : WD[3]));
    bRect(B, 4, 5, 24, 2, WD[1]); B.set(15, 5, IR[3]); B.set(16, 5, IR[2]);
    for (const x0 of [4, 25]) bRect(B, x0, 7, 3, 7, (x, y) => (y === 9 ? WD[4] : x === x0 ? WD[3] : x === x0 + 2 ? WD[0] : WD[2]));
    bRect(B, 7, 11, 18, 1, WD[1]);
    return ghost(B); })();
  const bed = (() => { const W = 42, H = 18, B = buf(W, H), Q = ['#6a5a7a', '#7a6a4a', '#5a6a7a', '#7a4a4a'];
    bRect(B, 5, 2, 32, 6, (x, y) => { if (y === 2) return '#c8c0b0'; const qi = (Math.floor((x - 5) / 5) + Math.floor((y - 3) / 3)) % 4; return (x - 5) % 5 === 0 || (y - 3) % 3 === 2 ? '#3a3440' : Q[qi]; });
    bRect(B, 5, 2, 7, 4, (x, y) => (y === 2 ? '#e0dcd0' : y === 5 ? '#8a867a' : '#c8c4b8'));
    for (const x0 of [2, 37]) bRect(B, x0, 2, 3, 14, (x, y) => (y === 2 ? WD[4] : x === x0 ? WD[3] : x === x0 + 2 ? WD[0] : WD[2]));
    bRect(B, 5, 8, 32, 3, (x, y) => (y === 8 ? WD[3] : WD[1]));
    return ghost(B); })();
  const plough = (() => { const W = 32, H = 14, B = buf(W, H);
    bRect(B, 2, 2, 28, 3, (x, y) => (y === 2 ? WD[4] : y === 4 ? WD[1] : WD[3]));
    bLine(B, 7, 5, 3, 11, WD[3]); bLine(B, 10, 5, 6, 11, WD[2]); B.set(3, 11, WD[4]); B.set(6, 11, WD[4]);
    bPoly(B, [[12, 5], [21, 5], [20, 10], [13, 10]], (x, y) => ramp(RU, 0.6 - (x - 12) * 0.05 + (hsh(x, y, 2) - 0.5) * 0.3, x, y));
    bPoly(B, [[18, 9], [25, 11.5], [16, 11.5]], (x, y) => (y === 9 ? IR[4] : IR[3]));
    bEll(B, 26.5, 8, 3, 3, (x, y) => (Math.hypot(x + 0.5 - 26.5, y + 0.5 - 8) > 1.8 ? IR[2] : WD[2]));
    return ghost(B); })();
  /* a headstone, toppled and lying on its back: flat top face, its arched head at the right, the name on its edge */
  const headstone = (() => { const W = 32, H = 14, B = buf(W, H);
    bRect(B, 2, 2, 28, 10, (x, y) => { if (y === 2) return SN[4]; if (y === 3) return hsh(x, y, 91) < 0.1 ? SN[2] : SN[3];
      const s = hsh(x, y, 92); return y === 11 ? SN[1] : s < 0.07 ? SN[1] : s > 0.95 ? SN[3] : SN[2]; });
    for (const [x, y] of [[29, 11], [29, 10], [28, 11], [29, 9]]) B.del(x, y);
    B.set(28, 10, SN[1]); B.set(29, 8, SN[1]);
    bRect(B, 5, 6, 1, 4, SN[1]); bRect(B, 4, 7, 3, 1, SN[1]);
    for (let i = 0; i < 5; i++) for (let gx = 0; gx < 3; gx++) for (let gy = 0; gy < 3; gy++) if (hsh(i * 5 + gx, gy, 93) < 0.45) B.set(9 + i * 4 + gx, 6 + gy, SN[1]);
    bLine(B, 20, 3, 23, 11, SN[0]); B.set(22, 6, SN[4]);
    for (let x = 2; x < 28; x++) if (hsh(x, 1, 94) < 0.3) B.set(x, 11, hsh(x, 2, 94) < 0.5 ? '#4a5444' : '#3a4438');
    return ghost(B); })();
  return { bale, cart, chair, table, bed, plough, headstone };
}

// ============================================================================================
// SET PIECES
// ============================================================================================
function ironWheel(B, cx, cy, r, ph) {
  bEll(B, cx, cy, r + 0.3, r + 0.3, (x, y) => { const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); return d > r - 1.8 ? ((x + y) < cx + cy ? IR[3] : IR[1]) : null; });
  for (let k = 0; k < 8; k++) { const a = ph + k * Math.PI / 4; bLine(B, cx + Math.cos(a) * 2, cy + Math.sin(a) * 2, cx + Math.cos(a) * (r - 1.5), cy + Math.sin(a) * (r - 1.5), k % 2 ? IR[2] : IR[3]); }
  bEll(B, cx, cy, 2.2, 2.2, IR[2]); B.set(cx - 1, cy - 1, IR[4]);
}
// THE THRESHER: a threshing machine the farm's ghosts took. Faces RIGHT, its spiked beater at the front. 4 frames 76x56
export function bakeThresher() {
  const W = 76, H = 56, frames = [];
  for (let f = 0; f < 4; f++) {
    const B = buf(W, H), ph = f * Math.PI / 16;
    // the chute on the rear roof
    bRect(B, 8, 4, 5, 8, (x) => (x === 8 ? IR[3] : x === 12 ? IR[1] : IR[2])); bRect(B, 7, 3, 7, 2, (x, y) => (y === 3 ? IR[4] : IR[1]));
    // the housing
    planksV(B, 6, 16, 44, 24, 31, WD, 4);
    for (const x0 of [6, 48]) bRect(B, x0, 16, 2, 24, (x) => (x === x0 ? IR[3] : IR[1]));
    for (const y0 of [16, 38]) bRect(B, 6, y0, 44, 2, (x, y) => (y === y0 ? IR[3] : IR[1]));
    for (let x = 10; x < 48; x += 6) { B.set(x, 17, IR[4]); B.set(x, 39, IR[4]); }
    for (const [x, y] of [[14, 24], [15, 25], [26, 30], [20, 34]]) B.set(x, y, RU[2]);
    bPoly(B, [[3, 16.5], [54, 16.5], [52, 11], [14, 8.5], [5, 11]], (x, y) => { const r = Math.floor((y + x * 0.1)) % 3; return y < 10 ? WD[4] : r === 0 ? WD[3] : r === 1 ? WD[2] : WD[1]; });
    // the face: two slit eyes burning a sick yellow, and a grille of iron teeth
    bRect(B, 30, 20, 16, 6, IR[0]);
    for (const ex of [31, 39]) { bRect(B, ex, 22, 6, 2, HZ[1]); bRect(B, ex + 1, 22, 4, 1, HZ[2]); B.set(ex + 2, 22, HZ[3]); B.set(ex + 3, 22, HZ[3]); }
    bLine(B, 30, 20, 37, 21, IR[3]); bLine(B, 46, 20, 39, 21, IR[3]);
    bRect(B, 30, 28, 16, 8, IR[0]);
    for (let x = 31; x < 46; x += 2) bRect(B, x, 28, 1, (x % 4 === 1) ? 6 : 8, IR[3]);
    // the chassis and drawbar
    bRect(B, 2, 40, 62, 3, (x, y) => (y === 40 ? IR[3] : y === 42 ? IR[0] : IR[2]));
    bLine(B, 3, 41, 1, 47, IR[2]); bLine(B, 4, 41, 2, 47, IR[1]);
    // the wheels
    ironWheel(B, 17, 46, 9, ph); ironWheel(B, 45, 47, 8, ph);
    // THE BEATER: a spiked drum, turning
    const bx = 61, by = 33;
    bEll(B, bx, by, 8, 8, (x, y) => ramp(IR, 0.55 - (x + 0.5 - bx) * 0.05 - (y + 0.5 - by) * 0.05, x, y));
    for (let k = 0; k < 8; k++) { const a = ph + k * Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
      bLine(B, bx + ca * 2, by + sa * 2, bx + ca * 7.5, by + sa * 7.5, IR[0]);
      for (let r = 8; r <= 13; r++) { B.set(bx + ca * r, by + sa * r, r > 11 ? '#d0d4dc' : IR[3]); if (r < 10) B.set(bx + ca * r - sa * 0.9, by + sa * r + ca * 0.9, IR[2]); } }
    bEll(B, bx, by, 2, 2, IR[3]); B.set(bx, by, HZ[2]);
    bRect(B, 50, 26, 4, 14, (x) => (x === 50 ? IR[3] : IR[1]));
    for (let i = 0; i <= 14; i++) { const a = -Math.PI * 0.95 + i / 14 * Math.PI * 0.62, x = bx + Math.cos(a) * 15, y = by + Math.sin(a) * 15; B.set(x, y, IR[3]); B.set(x + Math.cos(a) * -1, y + Math.sin(a) * -1, IR[1]); }
    // straw pouring out of the chute
    for (let i = 0; i < 16; i++) { const t = ((i / 16) + f / 4) % 1, dir = hsh(i, 0, 3) - 0.5, x = 10.5 + dir * 22 * t, y = 2 - 7 * t + 16 * t * t;
      if (y < 0 || y > 14) continue; B.set(x, y, i % 3 ? HY[4] : HY[3]); B.set(x + (dir > 0 ? 1 : -1), y + (t > 0.4 ? 1 : 0), HY[2]); }
    const c = toCanvas(B), g = c.getContext('2d');
    // the lantern hung off the front of the roof, swinging, and the eye-light on it
    const lx = 55 + [0, 1, 0, -1][f];
    px(g, 54, 11, IR[3]); px(g, 54, 12, IR[2]); px(g, lx, 13, IR[2]);
    for (let y = 14; y <= 19; y++) for (let x = lx - 1; x <= lx + 1; x++) px(g, x, y, y === 14 || y === 19 ? IR[2] : x === lx ? HZ[3] : HZ[1]);
    px(g, lx - 2, 15, OUT); px(g, lx + 2, 15, OUT); px(g, lx - 2, 18, OUT); px(g, lx + 2, 18, OUT);
    frames.push(c);
  }
  return frames;
}
// THE CROP POLE: tall, weathered, a crossbar and rope lashings. crackCol colours the bright line in the crack (pass a GHOST
// colour if the level lets the hero break it). [sound, cracked, broken] 40x64
export function bakeCropPole(crackCol = '#fff2b0') {
  const W = 40, H = 64, base = H - 1;
  const mk = state => { const B = buf(W, H), topY = state === 2 ? 51 : 3;
    for (let y = topY; y <= base; y++) for (let x = 18; x <= 20; x++) { const s = hsh(x, (y / 3) | 0, 7); B.set(x, y, x === 18 ? (s < 0.2 ? WD[3] : WD[4]) : x === 20 ? WD[1] : s < 0.25 ? WD[1] : WD[3]); }
    if (state === 2) { for (const [x, d] of [[18, 0], [19, -2], [20, 1]]) for (let y = topY; y < topY + 3 + d; y++) B.del(x, y); B.set(19, 50, WD[4]); B.set(18, 51, WD[3]); B.set(21, 53, WD[3]); B.set(17, 54, WD[2]); }
    else {
      B.set(19, 2, WD[4]); B.set(18, 3, WD[4]);
      bRect(B, 1, 8, 38, 3, (x, y) => (y === 8 ? (hsh(x, y, 3) < 0.15 ? WD[3] : WD[4]) : y === 10 ? WD[1] : hsh(x >> 1, y, 4) < 0.2 ? WD[1] : WD[3]));
      for (const [x, y] of [[17, 7], [21, 7], [18, 8], [20, 8], [19, 9], [18, 10], [20, 10], [17, 11], [21, 11], [19, 12]]) B.set(x, y, (x + y) % 2 ? HY[3] : HY[1]);
      for (const x0 of [3, 35]) for (let y = 7; y <= 11; y++) { B.set(x0, y, y % 2 ? HY[3] : HY[1]); B.set(x0 + 1, y, y % 2 ? HY[1] : HY[3]); }
      bPoly(B, [[31, 11], [35, 11], [35, 18], [34, 16], [33, 21], [32, 17], [31, 19]], (x, y) => (hsh(x, y, 9) < 0.15 ? null : (x + y) % 3 ? '#6a5a7a' : '#4e4260'));
      bLine(B, 6, 11, 6, 15, HY[2]); B.set(7, 16, HY[1]);
      for (let y = 34; y <= 38; y++) for (let x = 18; x <= 20; x++) B.set(x, y, (x + y) % 2 ? HY[3] : HY[1]);
      if (state === 1) { let x = 19;
        for (let y = 44; y <= 58; y++) { x = 18 + ((y * 7) % 3); B.set(x, y, WD[0]); B.set(x + (x < 20 ? 1 : -1), y, crackCol); }
        B.set(17, 49, WD[3]); B.set(21, 53, WD[3]); B.set(17, 56, WD[2]); }
    }
    for (let x = 14; x <= 24; x++) { if (Math.abs(x - 19) > 2) B.set(x, base, DIRT[2]); if (Math.abs(x - 19) > 3 && Math.abs(x - 19) < 5) B.set(x, base - 1, DIRT[3]); }
    return toCanvas(B); };
  return [mk(0), mk(1), mk(2)];
}
// A TORN WINDMILL SAIL: a stock with its lattice and what is left of the canvas, hanging down from the hub end (row 0). 12x48
export function bakeWindSail(v = 0) {
  const W = 12, H = 48, B = buf(W, H), end = v ? 36 : 47, cloth = ['#6e6452', '#8a806a', '#b0a68c', '#d0c6aa'];
  for (let y = 0; y <= end; y++) { B.set(5, y, WD[3]); B.set(6, y, WD[1]); }
  if (v) { B.set(5, end + 1, WD[3]); B.set(6, end - 1, WD[2]); B.del(6, end); }
  bRect(B, 4, 0, 4, 3, (x, y) => (y === 0 ? IR[4] : x === 4 ? IR[3] : IR[1]));
  const railEnd = v ? 30 : 46;
  for (let y = 6; y <= railEnd; y++) { B.set(10, y, WD[2]); if (hsh(3, y, v) > 0.2 || y < 20) B.set(3, y, WD[2]); }
  for (let y = 6; y <= railEnd; y += 4) for (let x = 3; x <= 10; x++) if (x !== 5 && x !== 6) B.set(x, y, x < 5 ? WD[2] : WD[3]);
  for (let seg = 0; seg < 10; seg++) { const y0 = 7 + seg * 4; if (y0 > railEnd - 3) break; if (hsh(seg, 1, 5 + v) < (v ? 0.45 : 0.25)) continue;
    const rag = Math.round(hsh(seg, 2, 5 + v) * 3);
    for (let y = y0; y < y0 + 3 + (rag > 1 ? 1 : 0); y++) for (let x = 7; x <= 9; x++) { if (y === y0 + 2 && hsh(x, y, 3) < 0.4) continue; B.set(x, y, ramp(cloth, 0.7 - (x - 7) * 0.15 - (y - y0) * 0.08, x, y)); } }
  for (const [x, y] of v ? [[11, 20], [11, 21], [10, 22], [11, 23]] : [[11, 33], [11, 34], [11, 36], [10, 37]]) B.set(x, y, cloth[2]);
  return toCanvas(B);
}
// THE BURNING CORNFIELD: burning stubble, 4 frames 16x16, tiles horizontally
export function bakeFireTile() {
  const frames = [];
  for (let f = 0; f < 4; f++) {
    const [c, g] = canvas(16, 16);
    for (let x = 0; x < 16; x++) {
      const u = x / 16 * TAU, hgt = 5 + 3.5 * (0.5 + 0.5 * Math.sin(u * 2 + f * TAU / 4)) + 3 * (0.5 + 0.5 * Math.sin(u * 3 - f * TAU / 4 + 1));
      for (let up = 0; up <= hgt; up++) { const y = 15 - up, t = up / hgt;
        let cc = up < 2 ? (hsh(x, f, 3) < 0.3 ? '#2a1410' : FL[0]) : t < 0.35 ? FL[4] : t < 0.6 ? FL[3] : t < 0.85 ? FL[2] : FL[1];
        if (up >= 2 && up <= 4 && hgt > 9.5) cc = FL[5];
        if (t > 0.85 && bay(x, y) > 0.6) continue;
        px(g, x, y, cc); } }
    for (const sx of [3, 9, 13]) for (let y = 11; y < 16; y++) px(g, sx + (y < 13 ? 1 : 0), y, '#1e100c');
    for (let i = 0; i < 3; i++) { const x = (i * 5 + f * 3 + 2) % 16, y = 2 + ((i * 3 + f * 2) % 4); px(g, x, y, i === 0 ? FL[4] : FL[3]); }
    frames.push(c);
  }
  return frames;
}

// ============================================================================================
// THE FARM'S GHOSTS, AND THE WAY TO THE TOWER
// ============================================================================================
const GH = ['#2e3a64', '#4a5e94', '#7088c0', '#9cb2e0', '#c8d8f4', '#eef4ff'];   /* moon-blue ghost flesh: scenery, never green */
const GHOUT = '#141a34';
function translucent(c, a) { const [o, g] = canvas(c.width, c.height); g.globalAlpha = a; g.drawImage(c, 0, 0); return o; }
// A GHOST COW, still grazing the dead field. Faces LEFT, head down. [grazeA, grazeB] 34x22, bottom row = hooves
export function bakeGhostCow() {
  const W = 34, H = 22, base = H - 1;
  const mk = f => { const B = buf(W, H), lift = f ? 2 : 0;
    const leg = (x, far) => { for (let y = 13; y <= base; y++) { B.set(x, y, far ? GH[1] : GH[3]); B.set(x + 1, y, far ? GH[0] : GH[2]); } B.set(x, base, GH[0]); B.set(x + 1, base, GH[0]); };
    leg(11, true); leg(25, true); leg(13, false); leg(28, false);
    const hide = (cx, cy, rx, ry) => bEll(B, cx, cy, rx, ry, (x, y) => { const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry; let k = 0.66 - u * 0.12 - v * 0.34; if (hsh(x >> 2, (y + 1) >> 2, 17) < 0.28) k -= 0.28; return ramp(GH, k, x, y); });
    hide(20, 9.5, 11, 5); hide(27.5, 7.5, 4, 4); hide(12, 8.5, 4, 4.8);
    B.set(23, 14, GH[4]); B.set(24, 14, GH[3]);
    if (!f) { for (let y = 6; y <= 13; y++) B.set(32, y, GH[2]); B.set(32, 14, GH[4]); B.set(33, 14, GH[3]); }
    else { for (let i = 0; i < 7; i++) B.set(32 + (i > 2 ? 1 : 0), 6 + i, GH[2]); B.set(33, 13, GH[4]); B.set(33, 12, GH[4]); }
    bPoly(B, [[12, 5], [9, 13 - lift], [6, 15 - lift], [4, 12 - lift], [8, 5]], (x, y) => ramp(GH, 0.6 - (y - 5) * 0.03, x, y));
    bEll(B, 4.5, 15.5 - lift, 3, 3.4, (x, y) => ramp(GH, 0.62 - (y - 13) * 0.08, x, y));
    bEll(B, 3.5, 18.5 - lift, 2.4, 1.8, GH[4]); B.set(2, 19 - lift, GH[1]);
    B.set(7, 12 - lift, GH[3]); B.set(8, 11 - lift, GH[2]); B.set(5, 12 - lift, GH[5]); B.set(4, 11 - lift, GH[4]);
    const c = translucent(toCanvas(B, GHOUT), 0.8), g = c.getContext('2d');
    px(g, 3, 15 - lift, GH[5]); px(g, 3, 14 - lift, 'rgba(238,244,255,0.45)'); px(g, 2, 15 - lift, 'rgba(238,244,255,0.35)');
    for (const [x, y] of [[10, base], [16, base - 1], [27, base], [31, base - 1], [14, base]]) px(g, x, y, 'rgba(200,216,244,0.35)');
    return c; };
  return [mk(0), mk(1)];
}
// A GHOST DRAUGHT HORSE in its harness, galloping, faces RIGHT with the hay cart behind it (the traces run off its LEFT edge
// at rows 14-16). Skeletal lower legs, a skull for a face, a mane of mist. 4 frames 46x34, hooves reach row 33 on the planted frames.
export function bakeGhostHorse() {
  const W = 46, H = 34, frames = [];
  const POSES = [
    [[0.6, 0.85], [0.3, 0.2], [-0.5, -0.7], [-0.25, -0.4], 0],
    [[0.15, -0.1], [0.4, 0.5], [-0.15, 0.1], [0.05, -0.05], 1],
    [[-0.3, -0.4], [-0.05, -0.15], [0.4, 0.15], [0.25, 0.3], 0],
    [[0.3, -0.7], [0.15, -0.55], [0.15, 0.7], [0, 0.5], -1]];
  const HARN = '#1a1622', HARNL = '#3a3444', RING = '#8a8aa0', BONE = ['#7a88b0', '#b0c0e0', '#e0eaff'];
  POSES.forEach((P, f) => {
    const B = buf(W, H), bob = P[4], feet = [];
    const leg = (hx, hy, [a1, a2], far) => { const kx = hx + Math.sin(a1) * 7, ky = hy + Math.cos(a1) * 7, fx = kx + Math.sin(a2) * 10, fy = Math.min(H - 1, ky + Math.cos(a2) * 10);
      for (const o of [-1, 0, 1]) bLine(B, hx + o, hy, kx + o * 0.5, ky, o < 0 ? (far ? GH[1] : GH[3]) : (far ? GH[0] : GH[2]));
      bLine(B, kx, ky, fx, fy, far ? BONE[0] : BONE[1]); bLine(B, kx + 1, ky, fx + 1, fy, far ? GH[0] : BONE[0]);
      B.set(kx, ky, far ? BONE[1] : BONE[2]);
      bRect(B, fx - 1, fy, 3, 1, far ? GH[0] : GH[1]); feet.push([fx, fy]); };
    const by = 1 + bob;
    leg(15, 15 + by, P[3], true); leg(31, 15 + by, P[1], true);
    const flesh = (cx, cy, rx, ry, bias = 0) => bEll(B, cx, cy, rx, ry, (x, y) => ramp(GH, 0.62 + bias - ((x + 0.5 - cx) / rx) * 0.1 - ((y + 0.5 - cy) / ry) * 0.36, x, y));
    flesh(22, 11 + by, 12, 5.5); flesh(12, 10 + by, 6, 6, 0.05); flesh(31, 11 + by, 5, 6);
    for (let rx = 18; rx <= 27; rx += 3) for (let y = 11 + by; y <= 15 + by; y++) B.set(rx + Math.round((y - 11 - by) * 0.3), y, GH[1]);
    for (let x = 12; x <= 30; x += 2) B.set(x, 6 + by - (x > 27 ? 1 : 0), GH[5]);
    leg(13, 14 + by, P[2], false); leg(30, 15 + by, P[0], false);
    bPoly(B, [[28, 7 + by], [33, 3 + by], [37, 0.5 + by], [40, 3 + by], [36, 9 + by], [33, 15 + by]], (x, y) => ramp(GH, 0.66 - (x - 28) * 0.02 - (y - by) * 0.03, x, y));
    bPoly(B, [[35.5, 0.5 + by], [39, 0 + by], [44.5, 5.5 + by], [44.5, 8 + by], [41.5, 8.5 + by], [35.5, 4 + by]], (x, y) => ramp(BONE, 0.75 - (y - by) * 0.07, x, y));
    bRect(B, 38, 2 + by, 2, 2, GHOUT); B.set(44, 7 + by, GHOUT); for (let x = 41; x <= 43; x++) B.set(x, 8 + by, GH[1]); B.set(36, -1 + by + 0.5, BONE[1]); B.set(37, by, BONE[1]);
    bPoly(B, [[29, 6 + by], [32, 4 + by], [36, 13 + by], [33, 16 + by]], (x, y) => ((x + y) % 4 === 0 ? HARNL : HARN));
    B.set(31, 3 + by, RING); B.set(32, 2 + by, RING); B.set(33, 3 + by, RING);
    bRect(B, 24, 5 + by, 5, 3, (x, y) => (y === 5 + by ? HARNL : HARN)); B.set(26, 4 + by, RING);
    for (let y = 8 + by; y <= 16 + by; y++) { B.set(26, y, HARN); B.set(27, y, HARNL); }
    for (let i = 0; i <= 10; i++) { const a = Math.PI * 0.55 + i / 10 * Math.PI * 0.7; B.set(12 + Math.cos(a) * 7, 10 + by + Math.sin(a) * 6, HARN); }
    for (let x = 0; x <= 31; x++) { const y = 13 + by + Math.round(x / 31 * 1.5); B.set(x, y, HARN); if (x < 8 || x > 28) B.set(x, y + 1, HARNL); }
    bLine(B, 37, 5 + by, 43, 7 + by, HARN);
    const c = translucent(toCanvas(B, GHOUT), 0.86), g = c.getContext('2d');
    px(g, 38, 2 + by, GH[5]); px(g, 39, 3 + by, 'rgba(238,244,255,0.6)'); px(g, 40, 2 + by, 'rgba(238,244,255,0.3)');
    for (let i = 0; i < 22; i++) { const t = i / 22, x = 35 - t * 24 + Math.sin(i * 1.7 + f * 1.57) * 1.5, y = 1 + by + t * 5 + Math.sin(i * 1.3 + f * 1.57) * 1.6;
      px(g, Math.round(x), Math.round(y) - 1, 'rgba(210,224,248,' + (0.6 * (1 - t)).toFixed(2) + ')'); if (i % 3 === 0) px(g, Math.round(x) - 1, Math.round(y) - 2, 'rgba(238,244,255,' + (0.45 * (1 - t)).toFixed(2) + ')'); }
    for (let i = 0; i < 12; i++) { const t = i / 12, x = 7 - t * 7, y = 8 + by + t * 6 + Math.sin(i + f * 1.57) * 1.2; px(g, Math.round(x), Math.round(y), 'rgba(210,224,248,' + (0.55 * (1 - t)).toFixed(2) + ')'); }
    for (const [fx, fy] of feet) for (const [ox, oy, a] of [[-2, 0, 0.35], [2, 0, 0.35], [0, -1, 0.25]]) px(g, Math.round(fx + ox), Math.round(fy + oy), 'rgba(210,224,248,' + a + ')');
    frames.push(c);
  });
  return frames;
}
// THE FAMILY CRYPT FRONT: drawn over a 6x6-tile solid block. 96x96, fully opaque, the top 3 rows a clean flat lip (stood on),
// bottom row = the ground.
export function bakeCryptFront() {
  const W = 96, H = 96, B = buf(W, H);
  const ashlar = (x, y) => { const row = Math.floor(y / 6), off = (row & 1) * 8, s = hsh(x, y, 61);
    if (y % 6 === 0 || (x + off) % 16 === 0) return SN[0]; if (s < 0.05) return SN[0]; if (s > 0.97) return SN[3];
    return hsh(Math.floor((x + off) / 16), row, 62) < 0.35 ? SN[1] : SN[2]; };
  bRect(B, 0, 0, W, H, ashlar);
  /* the parapet slabs behind the pediment */
  bRect(B, 0, 3, W, 23, (x, y) => ((x % 12 === 0) || y === 3 ? SN[0] : hsh(x >> 3, y >> 2, 63) < 0.4 ? SN[1] : '#3a3d45'));
  /* the pediment: raking cornice, tympanum, an oculus between two carved wheat sheaves */
  for (let x = 2; x < 94; x++) { const ry = Math.round(25 - (46 - Math.abs(x - 47.5)) * 17 / 46);
    for (let y = ry; y <= 25; y++) B.set(x, y, y === ry ? SN[4] : y === ry + 1 ? SN[3] : y === ry + 2 ? SN[1] : hsh(x, y, 64) < 0.06 ? SN[1] : SN[2]); }
  for (let x = 1; x < 95; x++) { B.set(x, 25, SN[4]); B.set(x, 26, SN[3]); B.set(x, 27, SN[0]); }
  bEll(B, 48, 17, 5.5, 5.5, (x, y) => { const d = Math.hypot(x + 0.5 - 48, y + 0.5 - 17); if (d > 4.3) return (x + y) < 65 ? SN[4] : SN[1]; return (x === 47 || x === 48 || y === 16 || y === 17) && d > 1 ? SN[2] : '#0e1016'; });
  for (const sx of [33, 62]) { for (let y = 16; y <= 23; y++) { B.set(sx, y, SN[1]); B.set(sx + (y < 19 ? (y % 2 ? -1 : 1) : 0), y, SN[1]); }
    for (const [ox, oy] of [[-1, 15], [0, 14], [1, 15], [-2, 17], [2, 17], [-1, 13]]) B.set(sx + ox, oy, SN[3]); bRect(B, sx - 2, 21, 5, 1, SN[3]); }
  /* the frieze and the family's name, weathered off */
  bRect(B, 2, 28, 92, 8, (x, y) => (y === 28 ? SN[3] : hsh(x, y, 65) < 0.08 ? SN[1] : SN[2]));
  bRect(B, 28, 29, 40, 6, (x, y) => (x === 28 || y === 29 ? SN[1] : x === 67 || y === 34 ? SN[4] : SN[3]));
  for (let i = 0; i < 8; i++) { if (i === 5) continue; for (let gy = 0; gy < 3; gy++) for (let gx = 0; gx < 3; gx++) if (hsh(i * 7 + gx, gy, 66) < 0.5) B.set(31 + i * 4 + gx, 30 + gy, SN[1]); }
  bLine(B, 50, 29, 55, 34, SN[0]); B.set(52, 30, SN[4]);
  bRect(B, 1, 36, 94, 2, (x, y) => (y === 36 ? SN[4] : SN[1]));
  bRect(B, 12, 38, 72, 2, (x, y) => (y === 38 ? SN[0] : SN[1]));
  /* columns: outer pilasters and two round columns flanking the door */
  const column = (x0, w) => {
    bRect(B, x0 - 1, 38, w + 2, 4, (x, y) => (y === 38 ? SN[4] : y === 41 ? SN[1] : x === x0 - 1 ? SN[4] : SN[3]));
    bRect(B, x0, 42, w, 41, (x, y) => { const t = (x - x0) / (w - 1); if ((x - x0) % 3 === 2 && t > 0.1 && t < 0.9) return ramp(SN, 0.45 - t * 0.35, x, y); return ramp(SN, 0.82 - t * 0.6 + (hsh(x, y, 67) < 0.05 ? -0.2 : 0), x, y); });
    bRect(B, x0 - 1, 83, w + 2, 4, (x, y) => (y === 83 ? SN[4] : y === 86 ? SN[0] : SN[3])); };
  column(3, 9); column(84, 9); column(21, 8); column(67, 8);
  /* the door: a round arch of voussoirs, an iron door in two leaves, a chain and a padlock */
  const dcx = 47.5, dcy = 58;
  for (let y = 38; y <= 86; y++) for (let x = 30; x <= 65; x++) { const dx = x + 0.5 - dcx, dy = y + 0.5 - dcy, d = Math.hypot(dx, Math.min(0, dy));
    if (d > 17.5 || Math.abs(dx) > 17.5) continue;
    if (d > 13.5 || Math.abs(dx) > 13.5) { const ang = Math.atan2(Math.min(0, dy), dx), sf = (ang + Math.PI) / (Math.PI / 9), seg = Math.floor(sf);
      B.set(x, y, dy > 0 ? ((y - 58) % 5 === 0 ? SN[0] : x < 48 ? SN[3] : SN[2]) : Math.abs(sf - seg - 0.5) > 0.4 ? SN[0] : dy < -13 && Math.abs(dx) < 2.5 ? SN[4] : seg % 2 ? SN[3] : SN[2]); continue; }
    const lx = x < 48 ? x - 34 : x - 48;
    let cc = IR[1];
    if (x === 47 || x === 48) cc = IR[0]; else if (lx % 5 === 0) cc = IR[0]; else if (lx % 5 === 1) cc = IR[2];
    if (y === 64 || y === 77) cc = lx % 5 === 3 ? IR[4] : IR[2];
    if (y > 84) cc = IR[0];
    B.set(x, y, cc); }
  for (const hx of [43, 52]) { B.set(hx, 69, IR[3]); B.set(hx - 1, 70, IR[3]); B.set(hx + 1, 70, IR[2]); B.set(hx, 71, IR[2]); }
  for (let x = 35; x <= 60; x++) { const y = 66 + Math.round(Math.sin((x - 35) / 25 * Math.PI) * 4); B.set(x, y, x % 2 ? IR[3] : IR[1]); }
  bRect(B, 46, 70, 4, 4, (x, y) => (y === 70 ? RU[3] : x === 49 ? RU[1] : RU[2])); B.set(47, 69, IR[3]); B.set(48, 69, IR[3]); B.set(48, 72, IR[0]);
  /* the lantern bracket, between the pilaster and the column, and its dead lantern */
  bRect(B, 13, 50, 1, 5, IR[2]); bRect(B, 13, 52, 6, 1, IR[3]); B.set(15, 53, IR[2]); B.set(16, 54, IR[2]); B.set(18, 53, IR[2]);
  bRect(B, 17, 54, 3, 1, IR[3]); bRect(B, 16, 55, 5, 1, IR[2]); bRect(B, 16, 56, 5, 4, (x) => (x === 16 || x === 20 ? IR[2] : '#262c3c')); B.set(17, 56, '#7a88a8'); bRect(B, 16, 60, 5, 1, IR[1]);
  /* the steps and plinth */
  bRect(B, 26, 87, 44, 3, (x, y) => (y === 87 ? SN[4] : y === 89 ? SN[1] : SN[3]));
  bRect(B, 18, 90, 60, 3, (x, y) => (y === 90 ? SN[4] : y === 92 ? SN[1] : SN[3]));
  bRect(B, 0, 93, 96, 3, (x, y) => (y === 93 ? SN[4] : y === 95 ? SN[0] : hsh(x, y, 68) < 0.1 ? SN[2] : SN[3]));
  /* weather: streaks under the frieze, moss at the feet, cracks and dead ivy */
  for (let i = 0; i < 14; i++) { const x = 14 + ((hsh(i, 1, 69) * 68) | 0), n = 2 + ((hsh(i, 2, 69) * 5) | 0); if (x > 29 && x < 66) continue; for (let j = 0; j < n; j++) B.set(x, 42 + j, SN[1]); }
  for (let y = 78; y <= 94; y++) for (let x = 0; x < W; x++) if (hsh(x >> 1, y >> 1, 70) < 0.12 && hsh(x, y, 71) < 0.7 && !(x > 29 && x < 66 && y < 87)) B.set(x, y, hsh(x, y, 72) < 0.5 ? '#4a5444' : '#3a4438');
  bLine(B, 88, 44, 86, 52, SN[0]); bLine(B, 86, 52, 89, 58, SN[0]); bLine(B, 64, 40, 66, 45, SN[0]); bLine(B, 12, 64, 16, 70, SN[0]);
  for (let y = 40; y < 86; y++) { const x = 91 + Math.round(Math.sin(y * 0.5) * 1.5); if (hsh(x, y, 73) < 0.65) B.set(x, y, y % 4 ? '#4a4436' : '#5e5644'); if (y % 7 === 0) B.set(x - 1, y + 1, '#5e5644'); }
  for (let y = 3; y < H; y++) { B.set(0, y, SN[1]); B.set(95, y, SN[0]); }
  for (let x = 0; x < W; x++) { B.set(x, 0, SN[4]); B.set(x, 1, SN[3]); B.set(x, 2, SN[1]); }
  return toCanvas(B, null);
}
// THE ARCHMAGE'S GATE beyond the field: a dark gatehouse, its pointed arch full of ghost light, a portcullis half up.
// Background scenery on the far side of the boss arena. 40x64, bottom row = the ground, low contrast, no outline.
export function bakeTowerGate() {
  const W = 40, H = 64, base = H - 1, B = buf(W, H), S = ['#171a2c', '#1d2136', '#242a42', '#2c3350'];
  const mason = x0 => (x, y) => { const row = Math.floor(y / 4), s = hsh(x, y, 81); if (y % 4 === 0 || (x - x0 + (row & 1) * 3) % 6 === 0) return S[0]; return x === x0 ? S[3] : s < 0.1 ? S[0] : S[2]; };
  for (const x0 of [1, 30]) { bRect(B, x0, 14, 9, 50, mason(x0)); bPoly(B, [[x0 - 1, 14.5], [x0 + 10, 14.5], [x0 + 4.5, 2]], (x) => (x < x0 + 4.5 ? S[3] : S[1])); B.set(x0 + 4, 1, S[2]);
    B.set(x0 + 4, 24, G[0]); B.set(x0 + 4, 25, G[0]); B.set(x0 + 4, 23, S[0]); }
  bRect(B, 10, 20, 20, 44, mason(10));
  for (let x = 10; x < 30; x++) { B.set(x, 19, S[3]); if (x % 4 < 2) { B.set(x, 17, S[2]); B.set(x, 18, S[2]); B.set(x, 16, S[3]); } }
  const inside = (x, y) => { const sp = 36, lx = 12, rx = 28; if (x < lx || x > rx - 1) return false; if (y >= sp) return true;
    return Math.hypot(x + 0.5 - rx, y + 0.5 - sp) <= 16 && Math.hypot(x + 0.5 - lx, y + 0.5 - sp) <= 16; };
  for (let y = 18; y <= base; y++) for (let x = 11; x <= 28; x++) {
    if (inside(x, y)) { const d = Math.hypot((x + 0.5 - 20) * 1.3, (y + 0.5 - 56) * 0.7); B.set(x, y, ramp(['#12301f', '#173d27', G[0], G[1]], 0.95 - d / 17, x, y)); }
    else if (inside(x - 1, y) || inside(x + 1, y) || inside(x, y + 1)) B.set(x, y, '#2a4a46'); }
  for (let y = 22; y <= 41; y++) for (const bx of [14, 17, 20, 23, 26]) if (inside(bx, y)) B.set(bx, y, S[0]);
  for (const by of [27, 34, 41]) for (let x = 12; x < 28; x++) if (inside(x, by)) B.set(x, by, S[0]);
  const c = toCanvas(B, null), g = c.getContext('2d');
  for (let x = 4; x < 36; x++) { const a = 0.2 * (1 - Math.abs(x - 19.5) / 16); if (a <= 0) continue; g.fillStyle = 'rgba(63,191,95,' + a.toFixed(2) + ')'; g.fillRect(x, base, 1, 1); }
  return c;
}
