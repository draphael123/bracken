// lw_props.js — THE LONG WATER: props and decoration from the falls on the mountain's back
// face, down the river, to SALTREACH at the river mouth. Warm late-afternoon light; and the
// sea creeping inland — barnacles on mountain stones, coral in a stream, a drowned hut.
// Every baker returns a canvas drawn with its BOTTOM-CENTRE on the ground (x - w/2, groundY - h)
// unless its comment says otherwise. Baked once, no anti-aliasing.
import { canvas, px, rect, line, ellipse, fillPoly, fromGrid, outline, mulberry, rgb } from './px.js';
import { OUT } from './art.js';

// The Long Water palette (shared with the level's tiles).
const L = {
  sea0: '#1f5a6a', sea1: '#2e7a88', sea2: '#4aa0a8', sea3: '#7cc8c8', foam: '#e8f4f0',
  sand: '#e8d8a8', sandM: '#d0bc88', sandD: '#a88f5e',
  rk0: '#3e454e', rk1: '#555e68', rk2: '#6f7a84', rk3: '#8a96a0',
  barn: '#d8d0c0', barnD: '#b0a898', thrift: '#e890b0', thriftD: '#b8607e',
  grass: '#7a9a5a', grassD: '#5a7a44',
  drift: '#9a8a74', driftD: '#6e604e', driftDD: '#4e4438',
  wash: '#f0ece0', washD: '#d8d2c0', washDD: '#bdb6a2',
  slate: '#4a5664', slateD: '#343e4a', slateL: '#5e6a7a',
  tar: '#2a2826', rope: '#c9b27c', ropeD: '#9a8452',
  bronze: '#4a9a8a', bronzeD: '#2f6a60', bronzeL: '#7cc8b8',
  coral: '#e07a6a', coralL: '#f0a890', coralD: '#a04a44',
  kelp: '#6a8a3a', kelpD: '#4a6a2a', kelpDD: '#34501e',
  lamp: '#ffd36b', lampL: '#fff1a0', shutter: '#4a6a9a', shutterD: '#344e78', shutterL: '#6a8aba',
  red: '#c9463d', redD: '#8f2f28', seal: '#7a1c24', gold: '#e0b040',
};

// ---------- helpers ----------
// A stable per-pixel hash in [0,1): texture that does not depend on draw order.
function hsh(x, y, s = 0) { let t = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) >>> 0; t = Math.imul(t ^ (t >>> 13), 1274126177); return ((t ^ (t >>> 16)) >>> 0) / 4294967296; }
// Repaint every pixel of colour `key` through fn(x, y) -> colour (or null to clear it).
// Shapes are filled with a key colour first, then textured here, so textures clip to the shape.
function recolor(g, w, h, key, fn) {
  const img = g.getImageData(0, 0, w, h), d = img.data, [kr, kg, kb] = rgb(key);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (!d[i + 3] || d[i] !== kr || d[i + 1] !== kg || d[i + 2] !== kb) continue;
    const col = fn(x, y);
    if (col === null) { d[i + 3] = 0; continue; }
    const [r, gg, b] = rgb(col); d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}
function maskOf(g, w, h) { const d = g.getImageData(0, 0, w, h).data, m = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) m[i] = d[i * 4 + 3] > 0 ? 1 : 0; return m; }
const KEY = '#ff00ff', KEY2 = '#00ff00', KEY3 = '#0000ff';

// Wet rock, lit from the upper left: wet sheen along the top, dark dither along the foot and the right.
function shadeRock(g, w, h, key) {
  const m = maskOf(g, w, h), at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x];
  let x0 = w, x1 = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (at(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
  recolor(g, w, h, key, (x, y) => {
    let top = y; while (at(x, top - 1)) top--;
    let bot = y; while (at(x, bot + 1)) bot++;
    const fx = (x - x0) / Math.max(1, x1 - x0), d = y - top, b = bot - y;
    if (d === 0) return fx < 0.62 ? (hsh(x, y, 3) < 0.25 ? L.foam : L.rk3) : L.rk2;
    if (d === 1 && fx < 0.5) return L.rk2;
    if (!at(x + 1, y) || (b <= 1)) return L.rk0;
    if (b <= 3 || fx > 0.78) return ((x + y) & 1) ? L.rk0 : L.rk1;
    if (!at(x - 1, y)) return L.rk2;
    return hsh(x, y, 1) < 0.1 ? L.rk2 : L.rk1;
  });
  return m;
}
// A barnacle side-on: a little crater. big = 3x2, small = 2x1.
function barnacle(g, x, y, big) {
  if (big) { px(g, x, y, L.barn); px(g, x + 1, y, L.rk0); px(g, x + 2, y, L.barnD); px(g, x, y + 1, L.barn); px(g, x + 1, y + 1, L.barn); px(g, x + 2, y + 1, L.barnD); }
  else { px(g, x, y, L.barn); px(g, x + 1, y, L.barnD); }
}
// Scatter barnacles over solid pixels of mask m between rows ya..yb.
function crust(g, w, m, rnd, n, ya, yb, xa = 0, xb = w) {
  const at = (x, y) => m[y * w + x];
  for (let i = 0, tries = 0; i < n && tries < n * 20; tries++) {
    const x = xa + ((rnd() * (xb - xa - 2)) | 0), y = ya + ((rnd() * (yb - ya)) | 0), big = rnd() < 0.3;
    if (!at(x, y) || !at(x + 1, y) || !at(x, y - 1) || (big && (!at(x + 2, y) || !at(x, y + 1) || !at(x + 2, y + 1) || !at(x + 2, y - 1)))) continue;
    barnacle(g, x, y, big); i++;
  }
}
// A hanging weed strand: wavy 1px ribbon with a lighter edge, from (x, y) down `len` rows.
function weed(g, x, y, len, rnd, light = L.kelp, dark = L.kelpD) {
  let cx = x;
  for (let k = 0; k < len; k++) { px(g, cx, y + k, k < len - 1 ? dark : light); if (k < len - 2 && k % 2 === 0) px(g, cx + 1, y + k, light); if (rnd() < 0.3) cx += rnd() < 0.5 ? -1 : 1; if (cx < x - 1) cx = x - 1; if (cx > x + 1) cx = x + 1; }
}
// A small coral-red seal disc (the goblin queen's wax): 3x2.
function sealDisc(g, x, y) { px(g, x, y, L.red); px(g, x + 1, y, L.gold); px(g, x + 2, y, L.red); rect(g, x, y + 1, 3, 1, L.seal); }

// ---------- THE MOUNTAIN: where the sea should not be ----------

// Coral in a mountain stream: a tuft growing from a stream-bed pebble. 10x8, v 0..2.
// 0 = staghorn, 1 = a pink sea fan, 2 = finger coral bleached bone-white at the tips.
export function bakeCoralTuft(v) {
  const grids = [
    ['C..C...C', 'c.Cd..Cc', 'dcd..Cd.', '.dc.cd..', '..dcdkR.', '.kRRrrrk'],
    ['..CcC.C.', '.C.c.cC.', 'Ccdcdc.C', '.c.cdcd.', '..dcd...', '.kRdRrk.'],
    ['.w...w..', '.c.w.c.w', '.c.c.cdc', 'dcdcCcd.', '.dcdcdcd', 'kRRrbBrk'],
  ];
  const pal = { C: L.coralL, c: L.coral, d: L.coralD, R: L.rk2, r: L.rk1, k: L.rk0, w: L.foam, b: L.barn, B: L.barnD };
  return outline(fromGrid(grids[((v % 3) + 3) % 3], pal, 1), OUT);
}

// A mountain boulder crusted with barnacles and a rime of salt. 16x10, v 0..1 (1 is flatter, with a thrift cushion).
export function bakeBarnacleRock(v) {
  v = ((v % 2) + 2) % 2; const rnd = mulberry(4101 + v * 37); const W = 16, H = 10; const [c, g] = canvas(W, H);
  const pts = v === 0
    ? [[1, 9], [1.4, 6], [3, 3], [6, 1.2], [10, 1], [13, 2.4], [14.6, 5.4], [15, 9]]
    : [[0.6, 9], [1.4, 6.6], [4, 4], [8, 3], [12, 3.4], [14.6, 5.6], [15.4, 9]];
  fillPoly(g, pts, KEY);
  const m = shadeRock(g, W, H, KEY);
  crust(g, W, m, rnd, v === 0 ? 7 : 6, v === 0 ? 4 : 5, 8);
  // salt left where the spray dried: white along the crown, a drip or two
  for (let x = 2; x < 14; x++) { let y = 0; while (y < H && !m[y * W + x]) y++; if (y < H - 2 && hsh(x, y, 9 + v) < 0.55) { px(g, x, y, L.foam); if (hsh(x, 1, v) < 0.3) px(g, x, y + 1, L.barn); } }
  if (v === 1) { rect(g, 9, 2, 4, 2, L.grassD); px(g, 9, 2, L.thrift); px(g, 11, 1, L.thrift); px(g, 12, 2, L.thriftD); px(g, 10, 1, L.thrift); px(g, 10, 2, L.grass); }
  return outline(c, OUT);
}

// A thin crust of salt crystals and barnacles for a ledge edge. 10x4, bottom row on the ledge. No outline.
export function bakeSaltCrust(v) {
  const grids = [
    ['..w.....w.', '.wbw.b.wbB', 'bbBbBwbBbB', 'BkBBbBkBBk'],
    ['.....w....', 'w.b.wbw.b.', 'bwBbbkbBwb', 'kBBkBBBbBB'],
  ];
  const pal = { w: L.foam, b: L.barn, B: L.barnD, k: L.rk0 };
  return fromGrid(grids[((v % 2) + 2) % 2], pal, 0);
}

// The drowned shepherd's hut: fieldstone walls, half the roof fallen in, hung with weed; a
// dead fish in the chimney, the door ajar, the tide line on the stones. 48x40.
export function bakeDrownedHut() {
  const W = 48, H = 40, rnd = mulberry(7717); const [c, g] = canvas(W, H);
  const WX = 6, WY = 21, WR = 42, TIDE = 32;
  // walls: fieldstone courses, darker and weedy under the tide line
  rect(g, WX, WY, WR - WX, H - WY, KEY);
  recolor(g, W, H, KEY, (x, y) => {
    const row = Math.floor((y - WY) / 3), ry = (y - WY) % 3, sx = x + row * 3 + (row % 2) * 2, jn = sx % 6, id = Math.floor(sx / 6) * 31 + row * 7;
    const wet = y > TIDE;
    if (ry === 2 || jn === 0) return wet ? L.tar : L.rk0;
    if (x === WR - 1) return wet ? L.rk0 : L.rk1;
    if (wet) return hsh(x, y, 5) < 0.12 ? L.grassD : (hsh(id, 0, 2) < 0.5 ? L.rk1 : L.rk0);
    if (ry === 0 && jn === 1) return L.rk3;
    return hsh(id, 1, 1) < 0.5 ? L.rk2 : (hsh(id, 2, 1) < 0.5 ? '#7c8690' : L.rk1);
  });
  // the tide line: a rime of salt, barnacles under it
  for (let x = WX; x < WR; x++) { px(g, x, TIDE, hsh(x, 3, 3) < 0.7 ? L.barn : L.barnD); if (hsh(x, 4, 4) < 0.3) px(g, x, TIDE - 1, L.barnD); }
  for (let i = 0; i < 9; i++) { const x = WX + 1 + ((rnd() * (WR - WX - 4)) | 0), y = TIDE + 2 + ((rnd() * 4) | 0); if (x < 24 || x > 38) barnacle(g, x, y, rnd() < 0.5); }
  // a window, flooded dark, a teal glint in it, the frame cracked
  rect(g, 11, 24, 8, 7, L.tar); rect(g, 12, 25, 6, 5, L.sea0); px(g, 13, 26, L.sea2); px(g, 14, 26, L.sea1); px(g, 16, 28, L.sea1);
  rect(g, 14, 25, 1, 5, L.driftD); rect(g, 12, 27, 3, 1, L.driftD);
  // the door, ajar: a dark doorway, the leaf swung out on one hinge and sagging
  rect(g, 26, 26, 8, 14, L.tar); rect(g, 27, 27, 6, 13, '#1f1d1c'); rect(g, 25, 25, 10, 1, L.driftD); rect(g, 25, 24, 10, 1, L.drift);
  fillPoly(g, [[33, 26], [38, 27], [38, 40], [33, 40]], L.driftD);
  for (let y = 28; y < 40; y += 3) line(g, 34, y, 37, y + 1, L.driftDD, 1);
  rect(g, 34, 27, 1, 13, L.drift); px(g, 36, 33, L.rope);
  // water stain up the door and the doorway: a dark wet band, salt at its crest
  for (let x = 26; x < 38; x++) { const top = 34 + (hsh(x, 7, 2) < 0.5 ? 0 : 1); for (let y = top; y < 40; y++) px(g, x, y, x < 33 ? '#161c20' : (((x + y) & 1) ? L.driftDD : L.tar)); px(g, x, top - 1, x < 33 ? L.barnD : L.barn); }
  // a starfish stuck on the wall, and a nub of coral at the corner where no coral should be
  px(g, 21, 27, L.coral); px(g, 20, 28, L.coral); px(g, 21, 28, L.coralL); px(g, 22, 28, L.coral); px(g, 20, 29, L.coralD); px(g, 22, 29, L.coralD);
  px(g, 40, 36, L.coral); px(g, 40, 35, L.coralL); px(g, 41, 37, L.coralD); px(g, 39, 37, L.coral);
  // ---- the roof: slate on the left, the right half fallen in ----
  const jag = [[24, 4], [26, 6], [23, 9], [25, 12], [21, 15], [23, 18], [19, 22]];
  fillPoly(g, [[1, 22], ...jag], KEY2);
  recolor(g, W, H, KEY2, (x, y) => {
    const ry = (y - 4) % 3, joint = (x + Math.floor((y - 4) / 3) * 2) % 4 === 0;
    if (ry === 2) return L.slateD;
    if (joint) return L.slateD;
    return hsh(x, y, 11) < 0.12 ? L.slateL : L.slate;
  });
  // the far slope, seen from inside through the hole: dark
  fillPoly(g, [[19, 22], [23, 18], [21, 15], [25, 12], [30, 11], [38, 15], [47, 22]], L.tar, '#1f1d1c');
  // rafters left standing, and one snapped and hanging
  line(g, 24, 5, 44, 21, L.driftD, 1); line(g, 25, 5, 45, 21, L.drift, 1);
  line(g, 30, 10, 36, 21, L.driftD, 1); line(g, 31, 10, 37, 21, L.drift, 1);
  line(g, 39, 14, 41, 21, L.driftD, 1);
  line(g, 24, 4, 26, 5, L.drift, 1);
  line(g, 34, 12, 29, 19, L.driftD, 1); line(g, 35, 12, 30, 19, L.drift, 1);
  // the eave line and the gable edge
  line(g, 1, 22, 24, 4, L.slateD, 1);
  rect(g, 4, 21, 16, 1, L.slateD);
  // chimney on the left gable, and the fish, tail up, stuck head-first down it
  rect(g, 6, 7, 6, 11, KEY3);
  recolor(g, W, H, KEY3, (x, y) => (y - 7) % 3 === 2 || (x + Math.floor((y - 7) / 3) * 3) % 5 === 0 ? L.rk0 : (x === 6 ? L.rk3 : (x === 11 ? L.rk1 : L.rk2)));
  rect(g, 5, 6, 8, 2, L.rk2); rect(g, 5, 6, 8, 1, L.rk3); rect(g, 7, 7, 4, 1, L.tar);
  // the fish: a silver-blue body going down the flue, its tail fork standing up out of it
  g.drawImage(fromGrid(['s...t', 'st.st', '.sbs.', '..bb.', '.Bbbs', '.Bbbs', 'Bbbbs'], { t: L.sea1, s: L.sea2, b: L.sea3, B: L.foam }, 0), 7, 1);
  // weed hung everywhere: off the eave, off the rafters, over the window
  for (const [x, len] of [[3, 5], [6, 3], [9, 7], [12, 4], [16, 8], [19, 3]]) weed(g, x, 22, len, rnd);
  for (const [x, y, len] of [[13, 23, 4], [17, 23, 6], [44, 22, 5], [37, 21, 7], [29, 19, 5], [41, 21, 3]]) weed(g, x, y, len, rnd);
  for (const [x, y] of [[10, 11], [14, 9], [18, 6], [5, 17], [20, 5]]) { px(g, x, y, L.kelp); px(g, x + 1, y, L.kelpD); px(g, x + 1, y + 1, L.kelpD); px(g, x, y + 2, L.kelp); }
  outline(c, OUT);
  // the sea still leaking out under the door
  rect(g, 25, 39, 15, 1, L.sea1); rect(g, 27, 39, 5, 1, L.sea2); px(g, 29, 39, L.foam); px(g, 36, 39, L.sea2);
  return c;
}

// Sea rushes: a stiff clump, one blade gone straw, brown seed tufts. 8x16, v 0..2. No outline.
export function bakeRushes(v) {
  v = ((v % 3) + 3) % 3; const rnd = mulberry(2303 + v * 101); const [c, g] = canvas(8, 16);
  const blades = [[2, 3, -2], [3, 0, -1], [4, 1, 0], [4, 4, 2], [5, 2, 2], [3, 6, -3], [6, 7, 1], [2, 9, -2]];
  blades.forEach(([x, top, lean], i) => {
    const t = Math.max(0, Math.min(11, top + ((rnd() * 3) | 0) - (v === 1 ? 0 : 1))), tx = Math.max(0, Math.min(7, x + lean));
    const col = i === (v * 3 + 1) % 8 ? L.sandM : (i % 3 === 0 ? L.grassD : L.grass);
    line(g, x, 15, tx, t, col, 1);
    if (col !== L.sandM) px(g, tx, t, i % 2 ? '#a8c078' : L.grass);
    if (i === (v + 1) % 4 || i === 4 + v) { const sy = t + 3, sx = Math.round(x + (tx - x) * (15 - sy) / (15 - t)), sd = lean >= 0 ? 1 : -1; px(g, sx + sd, sy, L.sandD); px(g, sx + sd, sy + 1, L.driftD); px(g, sx + 2 * sd, sy - 1, L.sandD); }
  });
  rect(g, 1, 14, 6, 2, L.grassD); px(g, 2, 14, L.grass); px(g, 5, 14, L.grass); px(g, 0, 15, L.grassD); px(g, 7, 15, L.grassD);
  return c;
}

// A bleached driftwood log. 26x7, v 0..1 (0 = a log with a root boss, 1 = a bent limb with a forked stub).
export function bakeDriftwood(v) {
  v = ((v % 2) + 2) % 2; const rnd = mulberry(611 + v * 77); const W = 26, H = 7; const [c, g] = canvas(W, H);
  if (v === 0) {
    fillPoly(g, [[3, 2], [21, 2.4], [24, 3], [24.6, 4], [22, 5], [3, 6]], KEY);
    fillPoly(g, [[1, 1], [4, 0.6], [5, 6], [1, 6]], KEY);
    rect(g, 4, 0, 1, 2, KEY); rect(g, 0, 3, 1, 2, KEY);
  } else {
    fillPoly(g, [[1, 4], [8, 3], [16, 2.6], [22, 3], [25, 5], [23, 6], [14, 5.4], [6, 6], [1, 6]], KEY);
    line(g, 16, 3, 19, 0, KEY, 1); line(g, 17, 3, 20, 0, KEY, 1);
  }
  const m = maskOf(g, W, H), at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  recolor(g, W, H, KEY, (x, y) => {
    if (!at(x, y - 1)) return L.barn;
    if (!at(x, y + 1)) return L.driftD;
    if ((y + (x >> 3)) % 3 === 0 && hsh(x, y, 4) < 0.55) return L.driftD;
    return hsh(x, y, 2) < 0.2 ? L.barnD : L.drift;
  });
  if (v === 0) { px(g, 2, 3, L.driftD); px(g, 3, 4, L.driftDD); px(g, 2, 4, L.driftD); px(g, 14, 3, L.driftDD); px(g, 15, 4, L.driftD); }
  else { px(g, 9, 4, L.driftDD); px(g, 10, 4, L.driftD); px(g, 24, 5, L.driftD); }
  for (let i = 0; i < 2; i++) px(g, 6 + ((rnd() * 14) | 0), 5, L.grassD);
  return outline(c, OUT);
}

// Small shells for the sand. 5x4, v 0..2: a pink scallop, a white cockle, a blue-black mussel. No outline (edged by hand).
export function bakeShell(v) {
  const grids = [
    ['.CCC.', 'CcCcC', 'dcCcd', '.ddd.'],
    ['.bwb.', 'bwbBB', 'bBbBk', '.kkk.'],
    ['...Ss', '..kSs', '.kSsk', 'kkk..'],
  ];
  const pal = { C: L.coralL, c: L.coral, d: L.coralD, b: L.barn, w: L.foam, B: L.barnD, k: L.driftD, S: L.shutter, s: L.slateD };
  const g2 = grids[((v % 3) + 3) % 3];
  if (g2 === grids[2]) pal.k = L.tar;
  return fromGrid(g2, pal, 0);
}

// ---------- SALTREACH: the town at the mouth ----------

// Two driftwood poles with a net hung drying between them, cork floats on the head-rope, a glass float. 34x26.
export function bakeNetPoles() {
  const W = 34, H = 26; const [c, g] = canvas(W, H);
  for (const [x, lean] of [[2, 0], [29, 1]]) {
    for (let y = 2; y < 24; y++) { const ox = lean && y < 8 ? 1 : 0; rect(g, x + ox, y, 3, 1, L.driftD); px(g, x + ox, y, L.drift); }
    rect(g, x + (lean ? 1 : 0), 2, 3, 1, L.barn);
  }
  rect(g, 0, 7, 3, 1, L.drift);
  ellipse(g, 3.5, 24.5, 3.5, 1.6, L.rk1); px(g, 2, 23, L.rk2); ellipse(g, 30.5, 24.5, 3.2, 1.6, L.rk1); px(g, 29, 23, L.rk2);
  // a coil of rope over the left pole
  ellipse(g, 3.5, 12, 2.5, 2, L.rope); px(g, 3, 12, L.driftD); px(g, 4, 12, L.driftD); px(g, 2, 13, L.ropeD); px(g, 5, 11, L.ropeD);
  outline(c, OUT);
  // the net: head-rope sagging pole to pole, the mesh hanging under it, the foot gathered and heavier
  const top = x => 4 + 3 * Math.sin(Math.PI * (x - 5) / 24), bot = x => 15 + 4 * Math.sin(Math.PI * (x - 5) / 24) + (x % 7 < 3 ? 1 : 0);
  for (let x = 5; x < 29; x++) {
    const t = Math.round(top(x)), b = Math.round(bot(x));
    for (let y = t + 1; y <= b; y++) if ((x + y) % 4 === 0 || (x - y + 100) % 4 === 0) px(g, x, y, L.sandD);
    px(g, x, t, L.rope); px(g, x, b, L.ropeD); if (x % 2) px(g, x, b + 1, L.ropeD);
  }
  // floats: corks on the head-rope and a glass ball in a rope cage hung low
  const cork = () => { const [fc, fg] = canvas(5, 4); rect(fg, 1, 1, 3, 2, L.coral); px(fg, 1, 1, L.coralL); px(fg, 3, 2, L.coralD); return outline(fc, OUT); };
  for (const x of [10, 18, 24]) { const k = cork(); g.drawImage(k, x - 2, Math.round(top(x)) - 1); }
  const [bc, bg] = canvas(7, 7); ellipse(bg, 3.5, 3.5, 2.6, 2.6, L.sea2); px(bg, 2, 2, L.foam); px(bg, 3, 2, L.sea3); px(bg, 4, 4, L.sea1); px(bg, 3, 4, L.sea1); rect(bg, 1, 3, 5, 1, L.rope); rect(bg, 3, 1, 1, 5, L.rope); outline(bc, OUT);
  g.drawImage(bc, 13, 16);
  return c;
}

// A beached clinker rowboat, heeled toward you so you see into her, an oar leaned on the hull. 38x14.
export function bakeRowboat() {
  const W = 38, H = 14; const [c, g] = canvas(W, H);
  // bow to the right and lifted: she lies stern-down where the tide left her
  const sheer = x => { const t = (x - 2) / 29; return 5 - 1.2 * t - 2.8 * t * t * t; };
  const keel = x => x <= 17 ? 10.4 + (x - 2) / 15 * 2.2 : 12.6 - Math.pow((x - 17) / 14.5, 2) * 10.4;
  // the far gunwale, just showing over the near one: she is heeled toward you
  for (let x = 5; x <= 25; x++) { const s = Math.round(sheer(x)); px(g, x, s - 2, L.washD); px(g, x, s - 1, (x % 5 === 0) ? L.driftDD : L.driftD); }
  rect(g, 13, Math.round(sheer(13)) - 2, 3, 2, L.drift);
  // the hull
  const hull = []; for (let x = 2; x <= 31.5; x += 0.5) hull.push([x, sheer(x)]); for (let x = 31.5; x >= 3; x -= 0.5) hull.push([x, keel(x)]); hull.push([2, 10]);
  fillPoly(g, hull, KEY);
  recolor(g, W, H, KEY, (x, y) => {
    const d = y + 0.5 - sheer(x), k = keel(x) - (y + 0.5);
    if (x >= 31) return L.driftD;
    if (d < 2) return d < 1 ? L.wash : L.washD;
    if (d < 3) return L.red;
    if (k < 1.5) return L.tar;
    const s = (d - 3) / 2.5, f = s - Math.floor(s);
    if (f > 0.6) return L.shutterD;
    return hsh(x, y, 9) < 0.1 ? L.drift : (f < 0.25 ? L.shutterL : L.shutter);
  });
  // the transom and the stem
  for (let y = Math.round(sheer(2)); y < 10; y++) px(g, 2, y, L.driftD);
  // the oar: loom leant on the stem, blade in the sand
  line(g, 34, 10, 30, 0, L.drift, 1); line(g, 35, 10, 31, 0, L.driftD, 1);
  fillPoly(g, [[33, 9], [36, 9], [37, 13], [34, 13]], L.drift); px(g, 35, 10, L.barn); px(g, 36, 12, L.driftD);
  outline(c, OUT);
  // sand banked up against the keel where she has settled
  for (let x = 3; x < 24; x++) { px(g, x, 13, L.sandM); if (x > 4 && x < 21) px(g, x, 12, hsh(x, 12, 1) < 0.3 ? L.sandM : L.sand); }
  px(g, 2, 13, L.sand); px(g, 24, 13, L.sand); px(g, 7, 11, L.sand); px(g, 13, 11, L.sand);
  return c;
}

// A tarred mooring post with a rope made fast round the top, barnacles low down. 7x34.
export function bakePierPost() {
  const W = 7, H = 34; const [c, g] = canvas(W, H);
  rect(g, 1, 2, 5, 32, L.tar); rect(g, 2, 2, 1, 32, L.rk0); px(g, 2, 10, L.rk1); px(g, 2, 18, L.rk1);
  fillPoly(g, [[1, 3], [2, 1], [5, 1], [6, 3]], L.driftD); rect(g, 2, 1, 3, 1, L.drift); px(g, 3, 2, L.barnD);
  // the rope: turns laid diagonally round the post, a dark line where each turn tucks under the next
  for (let y = 5; y < 11; y++) for (let x = 1; x < 6; x++) px(g, x, y, (x + y) % 3 === 0 ? L.ropeD : (x === 1 ? '#e0cc98' : (x === 5 ? L.ropeD : L.rope)));
  rect(g, 1, 4, 5, 1, L.tar);
  // the tail of it hanging free
  px(g, 5, 11, L.rope); px(g, 5, 12, L.ropeD); px(g, 5, 13, L.rope); px(g, 6, 14, L.rope); px(g, 6, 15, L.ropeD); px(g, 6, 16, L.rope);
  // the weed line, and a few barnacles under it
  for (let x = 1; x < 6; x++) { px(g, x, 23 + (x % 2), L.grassD); px(g, x, 24 + (x % 2), L.kelpD); }
  px(g, 3, 25, L.kelp); px(g, 1, 26, L.kelpD);
  for (const [x, y] of [[2, 27], [4, 28], [1, 29], [3, 30], [4, 32], [1, 32]]) barnacle(g, x, y, false);
  return outline(c, OUT);
}

// A Saltreach fisher cottage FRONT: whitewashed, dark slate, blue shutters, a lit window, chimneys on the
// gable skews. Background buildings: the player walks in front of them.
// v 0 = long and low, 64x52, lit window at (14..21, 29..37), a dormer. v 1 = narrow two-storey, 46x60,
// a lit lantern hung by the door (glass at 14..16, 43..46) and a net drying on the wall.
export function bakeCottage(v) {
  v = ((v % 2) + 2) % 2;
  const W = v === 0 ? 64 : 46, H = v === 0 ? 52 : 60; const [c, g] = canvas(W, H);
  const RY = v === 0 ? 13 : 13, EY = 22, PL = H - 5;
  const gx0 = 3, gx1 = W - 4, skew = 6;
  // walls and gable skews, whitewashed
  rect(g, gx0, EY, gx1 - gx0 + 1, H - EY, KEY);
  rect(g, gx0, RY, skew, EY - RY, KEY); rect(g, gx1 - skew + 1, RY, skew, EY - RY, KEY);
  recolor(g, W, H, KEY, (x, y) => {
    if (y >= PL) return y === PL ? L.rk0 : (hsh(x, y, 2) < 0.1 ? L.rk0 : L.tar);
    if (x === gx1 || (y < EY && x === gx1 - skew + 1 + skew - 1)) return L.washD;
    if (y >= EY && y <= EY + 1 && x > gx0 + skew - 1 && x < gx1 - skew + 1) return y === EY ? L.washDD : (((x + y) & 1) ? L.washD : L.wash);
    if (x === gx0) return L.wash;
    const h = hsh(x, y, 7);
    return h < 0.07 ? L.washD : (h < 0.085 ? L.washDD : L.wash);
  });
  // skew copes: a stepped stone edge on each gable
  rect(g, gx0 - 1, RY - 1, skew + 1, 1, L.washD); rect(g, gx1 - skew + 1, RY - 1, skew + 1, 1, L.washD);
  // the roof between the skews: slate courses with staggered joints, ridge tiles on top
  const rx0 = gx0 + skew, rx1 = gx1 - skew;
  rect(g, rx0, RY, rx1 - rx0 + 1, EY - RY, KEY2);
  recolor(g, W, H, KEY2, (x, y) => {
    if (y === RY) return x % 3 === 0 ? L.slateD : L.slateL;
    const ry = (y - RY - 1) % 3, course = Math.floor((y - RY - 1) / 3);
    if (ry === 2) return L.slateD;
    if ((x + course * 2) % 5 === 0) return L.slateD;
    return hsh(x, y, 13) < 0.1 ? L.slateL : (y > EY - 3 ? L.slateD : L.slate);
  });
  rect(g, rx0, EY - 1, rx1 - rx0 + 1, 1, L.tar);
  // chimneys
  const chim = (x, pots) => {
    rect(g, x, 4, skew, RY - 4, L.wash); rect(g, x + skew - 1, 4, 1, RY - 4, L.washD); rect(g, x - 1, 4, skew + 2, 2, L.washD); rect(g, x - 1, 4, skew + 2, 1, L.wash);
    for (let i = 0; i < pots; i++) { rect(g, x + 1 + i * 3, 1, 2, 3, L.coralD); px(g, x + 1 + i * 3, 1, L.coral); px(g, x + 2 + i * 3, 1, L.tar); }
  };
  if (v === 0) { chim(gx0, 2); chim(gx1 - skew + 1, 1); } else chim(gx1 - skew + 1, 2);
  // pieces
  const win = (x, y, w, h, lit) => {
    rect(g, x, y, w, h, L.slateD);
    if (lit) { rect(g, x + 1, y + 1, w - 2, h - 2, L.lamp); for (let yy = y + 1; yy < y + h - 1; yy++) for (let xx = x + 1; xx < x + w - 1; xx++) if ((xx - x) % 3 === 1 && (yy - y) % 4 === 1) px(g, xx, yy, L.lampL); }
    else { rect(g, x + 1, y + 1, w - 2, h - 2, '#23303c'); px(g, x + 1, y + 1, L.sea1); px(g, x + 2, y + 1, L.sea0); }
    for (let xx = x + 3; xx < x + w - 1; xx += 3) rect(g, xx, y + 1, 1, h - 2, L.slateD);
    rect(g, x + 1, y + Math.floor(h / 2), w - 2, 1, L.slateD);
    rect(g, x - 1, y + h, w + 2, 1, L.washDD);
  };
  const shutter = (x, y, w, h) => { rect(g, x, y, w, h, L.shutter); rect(g, x, y, 1, h, L.shutterL); rect(g, x + w - 1, y, 1, h, L.shutterD); for (let yy = y + 2; yy < y + h; yy += 3) rect(g, x, yy, w, 1, L.shutterD); };
  const door = (x, y, w) => {
    rect(g, x - 1, y - 1, w + 2, PL - y + 1, L.washDD);
    rect(g, x, y, w, PL - y, L.shutter); rect(g, x, y, 1, PL - y, L.shutterL);
    for (let xx = x + 2; xx < x + w; xx += 2) rect(g, xx, y, 1, PL - y, L.shutterD);
    rect(g, x, y + 3, w, 1, L.shutterD); rect(g, x, PL - 4, w, 1, L.shutterD);
    px(g, x + w - 2, y + Math.floor((PL - y) / 2), L.lamp);
    rect(g, x - 1, PL, w + 2, H - PL, L.rk3); rect(g, x - 1, PL, w + 2, 1, L.barn); rect(g, x - 1, H - 1, w + 2, 1, L.rk1);
  };
  const thriftBox = (x, y, w) => { rect(g, x, y + 1, w, 2, L.driftD); rect(g, x, y + 1, w, 1, L.drift); for (let xx = x; xx < x + w; xx++) px(g, xx, y, (xx % 2) ? L.thrift : L.grassD); px(g, x + 1, y - 1, L.thrift); px(g, x + w - 3, y - 1, L.thrift); };
  if (v === 0) {
    shutter(10, 29, 3, 9); win(14, 29, 8, 9, true); shutter(23, 29, 3, 9); thriftBox(14, 39, 8);
    door(29, 33, 7); rect(g, 29, 31, 7, 1, L.lamp); rect(g, 28, 30, 9, 1, L.slateD); rect(g, 28, 32, 9, 1, L.slateD);
    rect(g, 41, 29, 10, 9, L.slateD); shutter(42, 30, 4, 7); shutter(46, 30, 4, 7); px(g, 44, 32, L.tar); px(g, 47, 32, L.tar); rect(g, 40, 38, 12, 1, L.washDD);
    // the dormer
    rect(g, 26, 14, 10, 8, L.wash); rect(g, 35, 14, 1, 8, L.washD); win(28, 15, 6, 5, false);
    fillPoly(g, [[24, 15], [31, 9], [38, 15]], L.slateD); fillPoly(g, [[26, 14], [31, 10], [36, 14]], L.slate, L.slateD);
    // a string of cork floats hung by the door, a lobster pot on the step
    for (let i = 0; i < 4; i++) { px(g, 38, 34 + i * 2, L.rope); px(g, 39, 35 + i * 2, L.coral); }
    rect(g, 53, 43, 6, 4, L.driftD); for (let xx = 53; xx < 59; xx += 2) rect(g, xx, 42, 1, 5, L.drift); rect(g, 53, 42, 6, 1, L.rope);
  } else {
    // a string course between the storeys
    rect(g, gx0 + 1, 38, gx1 - gx0 - 1, 1, L.washD);
    win(9, 26, 7, 8, true); shutter(6, 26, 2, 8); shutter(17, 26, 2, 8);
    win(28, 26, 7, 8, false); shutter(25, 26, 2, 8); shutter(36, 26, 2, 8);
    door(20, 42, 7);
    rect(g, 6, 43, 6, 7, L.slateD); rect(g, 7, 44, 4, 5, L.lamp); px(g, 7, 44, L.lampL); rect(g, 9, 44, 1, 5, L.slateD); rect(g, 5, 50, 8, 1, L.washDD);
    // the lantern on its iron bracket by the door
    rect(g, 14, 40, 5, 1, L.tar); px(g, 18, 39, L.tar); px(g, 15, 41, L.tar);
    rect(g, 13, 42, 5, 1, L.bronzeD); rect(g, 13, 43, 5, 5, L.bronzeD); rect(g, 14, 43, 3, 4, L.lamp); px(g, 15, 44, L.lampL); px(g, 14, 43, L.lampL);
    rect(g, 13, 47, 5, 1, L.bronzeD); px(g, 15, 48, L.bronzeD); px(g, 13, 42, L.bronze);
    // a net drying on pegs by the door, corks along its head
    for (let x = 29; x <= 41; x++) {
      const t = 42 + (x === 29 || x === 41 ? 0 : 1), b = 50 + Math.round(2 * Math.sin((x - 29) / 12 * Math.PI)) + (x % 3 === 0 ? 1 : 0);
      for (let y = t + 1; y <= b; y++) if ((x + y) % 3 === 0 || (x - y + 99) % 3 === 0) px(g, x, y, L.sandD);
      px(g, x, t, L.rope); px(g, x, b, L.ropeD);
    }
    px(g, 29, 41, L.tar); px(g, 41, 41, L.tar);
    for (const x of [32, 35, 38]) { rect(g, x, 43, 2, 2, L.coral); px(g, x, 43, L.coralL); }
  }
  return outline(c, OUT);
}

// The Saltreach sea-bell tower: stone, an open belfry with a big verdigris bell, a slate spire, a gull on top. 36x76.
// The bell's mouth is at about (12..23, 30); the belfry opening spans x 11..24, y 20..33.
export function bakeBellTower() {
  const W = 36, H = 76; const [c, g] = canvas(W, H);
  const stone = (x, y, x0, x1, oy) => {
    const row = Math.floor((y - oy) / 4), ry = (y - oy) % 4, sx = x + (row % 2) * 3, jn = sx % 6;
    if (ry === 3 || jn === 0) return L.rk1;
    if (x <= x0 + 1) return ry === 0 ? L.barn : L.barnD;
    if (x >= x1 - 1) return L.rk1;
    if (ry === 0 && jn === 1) return L.barnD;
    return hsh(Math.floor(sx / 6), row, 3) < 0.45 ? L.rk3 : '#7c8894';
  };
  // plinth and shaft, a touch of batter at the foot
  fillPoly(g, [[5, 36], [30, 36], [31, 70], [4, 70]], KEY);
  recolor(g, W, H, KEY, (x, y) => stone(x, y, y > 60 ? 4 : 5, 31, 36));
  rect(g, 2, 70, 32, 6, KEY);
  recolor(g, W, H, KEY, (x, y) => (y === 70 ? L.rk3 : ((x + (y > 72 ? 4 : 0)) % 8 === 0 ? L.rk0 : (y === 75 ? L.rk0 : L.rk2))));
  // barnacles creeping up out of the harbour, and the salt line
  for (let x = 3; x < 33; x++) if (hsh(x, 69, 1) < 0.5) px(g, x, 69 - (hsh(x, 1, 1) < 0.4 ? 1 : 0), L.barn);
  for (const [x, y, b] of [[4, 72, 1], [9, 73, 0], [26, 72, 1], [30, 73, 0], [6, 66, 0], [28, 65, 1], [23, 71, 0]]) barnacle(g, x, y, b);
  // the door: an arch, blue leaves, a lamp-glow crack
  fillPoly(g, [[13, 76], [13, 62], [15, 59], [20, 59], [22, 62], [22, 76]], L.rk0);
  fillPoly(g, [[14, 70], [14, 62], [16, 60], [19, 60], [21, 62], [21, 70]], L.shutter);
  rect(g, 17, 60, 1, 10, L.shutterD); rect(g, 14, 64, 7, 1, L.shutterD); px(g, 16, 66, L.lamp); px(g, 19, 66, L.lamp);
  rect(g, 13, 70, 9, 6, L.rk2); rect(g, 13, 70, 9, 1, L.rk3);
  // slit windows and a clock-less round light
  rect(g, 17, 44, 2, 7, L.tar); px(g, 17, 44, L.rk1); rect(g, 10, 52, 2, 4, L.tar); rect(g, 24, 50, 2, 4, L.tar);
  // cornice under the belfry, thrift in its joints
  rect(g, 3, 34, 30, 3, L.rk2); rect(g, 3, 34, 30, 1, L.barn); rect(g, 3, 36, 30, 1, L.rk1);
  for (let x = 5; x < 31; x += 4) rect(g, x, 37, 2, 1, L.rk1);
  px(g, 6, 33, L.thrift); px(g, 7, 33, L.grassD); px(g, 28, 33, L.thrift); px(g, 27, 33, L.thrift); px(g, 26, 33, L.grassD);
  // the belfry: stone piers and an arched opening onto the dark
  rect(g, 6, 18, 24, 16, KEY);
  recolor(g, W, H, KEY, (x, y) => stone(x, y, 6, 29, 18));
  fillPoly(g, [[11, 33], [11, 23], [13, 21], [16, 20], [20, 20], [23, 21], [25, 23], [25, 33]], L.tar);
  fillPoly(g, [[12, 33], [12, 24], [14, 22], [22, 22], [24, 24], [24, 33]], '#1f1d1c', L.tar);
  rect(g, 11, 32, 14, 2, L.rk2); rect(g, 11, 32, 14, 1, L.rk3);
  // the headstock and the bell
  rect(g, 11, 22, 14, 2, L.driftD); rect(g, 11, 22, 14, 1, L.drift);
  rect(g, 16, 24, 4, 1, L.bronzeD);
  fillPoly(g, [[15, 25], [21, 25], [21.6, 27], [22, 29], [24, 31], [12, 31], [14, 29], [14.4, 27]], L.bronze);
  fillPoly(g, [[19, 25], [21, 25], [21.6, 27], [22, 29], [24, 31], [20, 31]], L.bronzeD, L.bronze);
  rect(g, 15, 26, 1, 4, L.bronzeL); px(g, 16, 25, L.bronzeL); px(g, 14, 30, L.bronzeL);
  rect(g, 12, 30, 12, 1, L.bronzeD); rect(g, 13, 30, 3, 1, L.bronze); rect(g, 15, 28, 6, 1, L.bronzeD);
  rect(g, 17, 31, 2, 2, L.tar); px(g, 17, 31, L.rk2);
  // the spire: slate over a bellcast eave
  fillPoly(g, [[2, 19], [18, 6], [34, 19]], KEY2);
  recolor(g, W, H, KEY2, (x, y) => {
    if (y >= 18) return L.slateD;
    const ry = (y - 6) % 3; if (ry === 2) return L.slateD;
    if ((x + Math.floor((y - 6) / 3) * 2) % 4 === 0) return L.slateD;
    return x < 18 ? (hsh(x, y, 5) < 0.15 ? L.slateL : L.slate) : L.slateD;
  });
  line(g, 2, 19, 18, 6, L.slateL, 1);
  rect(g, 17, 4, 2, 3, L.bronzeD); px(g, 17, 4, L.bronze);
  // a gull on the ridge of the spire, looking out to sea
  const gull = fromGrid(['..ww.....', '.yww.....', '..wwgggk.', '...wwwwgk', '....ww...'], { w: L.wash, g: L.rk3, k: L.tar, y: L.lamp }, 0);
  g.drawImage(gull, 18, 1);
  return outline(c, OUT);
}

// A sea lantern on a post: verdigris frame, lit warm or dark. 10x26. The flame sits at about (5, 7).
export function bakeSeaLantern(lit) {
  const W = 10, H = 26; const [c, g] = canvas(W, H);
  rect(g, 4, 11, 2, 13, L.driftD); rect(g, 4, 11, 1, 13, L.drift);
  rect(g, 4, 16, 2, 2, L.rope); px(g, 5, 17, L.ropeD);
  rect(g, 2, 23, 6, 3, L.rk1); rect(g, 2, 23, 6, 1, L.rk3); rect(g, 7, 24, 1, 2, L.rk0);
  // the lantern
  px(g, 4, 0, L.bronzeD); px(g, 5, 0, L.bronzeD); px(g, 3, 1, L.bronzeD); px(g, 6, 1, L.bronzeD);
  fillPoly(g, [[1, 5], [5, 1.5], [9, 5]], L.bronze); fillPoly(g, [[5, 1.5], [9, 5], [5, 5]], L.bronzeD); px(g, 4, 3, L.bronzeL);
  rect(g, 2, 5, 6, 6, L.bronzeD);
  if (lit) { rect(g, 3, 5, 4, 5, L.lamp); rect(g, 4, 6, 2, 3, L.lampL); px(g, 3, 5, L.lampL); }
  else { rect(g, 3, 5, 4, 5, L.sea0); px(g, 3, 5, L.sea2); px(g, 4, 6, L.sea1); }
  rect(g, 2, 5, 6, 1, L.bronze); rect(g, 1, 10, 8, 1, L.bronze); rect(g, 1, 10, 8, 1, L.bronzeD); px(g, 1, 10, L.bronze);
  rect(g, 5, 5, 1, 5, L.bronzeD);
  return outline(c, OUT);
}

// A striped red-and-white float with a ring on top; the bottom row sits at the waterline. 10x12.
export function bakeBuoy() {
  const W = 10, H = 12; const [c, g] = canvas(W, H);
  fillPoly(g, [[1.5, 11], [1, 8], [2.5, 4], [7.5, 4], [9, 8], [8.5, 11]], KEY);
  recolor(g, W, H, KEY, (x, y) => {
    const band = Math.floor((y - 4) / 2) % 2 === 0, edgeR = x >= 7 + (y > 6 ? 1 : 0), edgeL = x <= 2 - (y > 7 ? 1 : 0);
    if (y >= 10) return L.tar;
    if (band) return edgeR ? L.redD : (edgeL ? '#e06a5a' : L.red);
    return edgeR ? L.washD : L.wash;
  });
  rect(g, 4, 2, 2, 2, L.rk1); px(g, 4, 2, L.rk3); px(g, 3, 0, L.rk1); px(g, 6, 0, L.rk1); px(g, 3, 1, L.rk1); px(g, 6, 1, L.rk1); px(g, 4, 0, L.rk1); px(g, 5, 0, L.rk1);
  px(g, 3, 5, L.coralL);
  return outline(c, OUT);
}

// Standing kelp for the shallows and under water: a holdfast, a stipe, ribbon blades, gas bladders. 6x26, v 0..2. No outline.
export function bakeKelp(v) {
  v = ((v % 3) + 3) % 3; const rnd = mulberry(909 + v * 53); const W = 6, H = 26; const [c, g] = canvas(W, H);
  const strands = v === 0 ? [[2.5, 1, 0]] : v === 1 ? [[1.5, 6, 0.9], [3.5, 2, 2.4]] : [[3, 0, 1.6], [1.5, 10, 0.2]];
  const cl = x => Math.max(0, Math.min(W - 1, x));
  for (const [bx, top, ph] of strands) {
    const xs = [];
    for (let y = H - 2; y >= top; y--) { const t = (H - 2 - y) / (H - 2 - top); xs[y] = Math.round(bx + Math.sin(y * 0.38 + ph) * (0.4 + t * 1.2)); }
    // the stipe: dark and thin low down
    for (let y = H - 2; y >= top; y--) px(g, xs[y], y, L.kelpD);
    // blades: ribbons peeling off alternate sides, each ending in a lighter tip; a gas bladder at each root
    let side = (v & 1) ? 1 : -1;
    for (let y = H - 8 + ((rnd() * 2) | 0); y > top + 1; y -= 4 + ((rnd() * 2) | 0)) {
      const x = xs[y], len = 2 + ((rnd() * 2) | 0);
      px(g, cl(x + side), y, '#a8b858');
      for (let k = 1; k <= len; k++) { px(g, cl(x + side * (k + 0)), y - k, k === len ? L.grass : L.kelp); if (k < len) px(g, cl(x + side * k), y - k + 1, L.kelpD); }
      side = -side;
    }
    // the top: a long ribbon blade tapering to a pale tip
    for (let y = top; y < top + 5 && y < H - 2; y++) { px(g, xs[y], y, y === top ? L.grass : L.kelp); if (y > top + 1) px(g, cl(xs[y] + 1), y, L.kelpD); }
  }
  // the holdfast gripping a stone
  rect(g, 1, H - 2, 4, 2, L.kelpDD); px(g, 0, H - 1, L.kelpDD); px(g, 5, H - 1, L.kelpDD); px(g, 2, H - 2, L.kelpD); px(g, 3, H - 1, L.rk1); px(g, 4, H - 1, L.rk0);
  return c;
}

// A shallow rock pool with a starfish on its floor and an anemone at the rim. 26x7.
export function bakeTidePool() {
  const W = 26, H = 7, rnd = mulberry(1212); const [c, g] = canvas(W, H);
  // a ring of rock seen from a little above: back lip, the water, the front lip
  ellipse(g, 13, 4, 12.5, 3, KEY);
  const m = shadeRock(g, W, H, KEY);
  ellipse(g, 13, 3.4, 9.6, 1.9, L.sea1);
  for (let x = 5; x < 22; x++) px(g, x, 2, L.sea2);
  for (const x of [7, 8, 15, 19]) px(g, x, 2, L.sea3);
  px(g, 8, 2, L.foam); px(g, 4, 4, L.sea0); px(g, 21, 4, L.sea0); rect(g, 5, 4, 16, 1, L.sea0);
  // a starfish on the pool floor
  px(g, 10, 2, L.coralL); rect(g, 8, 3, 5, 1, L.coral); px(g, 10, 3, L.coralL); px(g, 9, 4, L.coralD); px(g, 11, 4, L.coralD);
  // an anemone on the far lip, a limpet on the near one
  px(g, 20, 1, L.coral); px(g, 21, 1, L.coralD); px(g, 20, 0, L.coralL); px(g, 22, 0, L.coral); px(g, 19, 0, L.coral);
  px(g, 5, 5, L.barnD); px(g, 6, 5, L.barn); px(g, 6, 4, L.barn);
  crust(g, W, m, rnd, 3, 5, 6, 12, 24);
  return outline(c, OUT);
}

// The Tide Herald's glaive, planted in the ground: a long verdigris haft, a curved coral blade on top,
// a strip of kelp tied under the blade. 12x50, the butt at the bottom centre. The level's last image.
export function bakeGlaive() {
  const W = 12, H = 50; const [c, g] = canvas(W, H);
  // the haft, bound with bronze
  rect(g, 5, 15, 2, 31, L.bronze); rect(g, 6, 15, 1, 31, L.bronzeD); px(g, 5, 20, L.bronzeL); px(g, 5, 33, L.bronzeL);
  for (const y of [24, 36]) { rect(g, 4, y, 4, 2, L.bronzeD); rect(g, 4, y, 4, 1, L.bronze); px(g, 4, y, L.bronzeL); }
  // the socket where the blade seats
  rect(g, 4, 13, 4, 3, L.bronzeD); rect(g, 4, 13, 4, 1, L.bronzeL); rect(g, 3, 15, 6, 1, L.bronzeD);
  // the blade: coral, back straight-ish, edge swelling to a hooked point
  // a long single-edged blade bellying out on the left (the edge) and sweeping over to a point on the right
  const rows = [[9, 9], [8, 9], [7, 9], [6, 9], [5, 8], [4, 8], [4, 7], [3, 7], [3, 7], [3, 7], [3, 7], [4, 7], [4, 7], [4, 7]];
  rows.forEach(([a, b], y) => {
    for (let x = a; x <= b; x++) px(g, x, y, x === a ? L.coralL : (x === b ? L.coralD : (hsh(x, y, 21) < 0.18 ? L.coralD : L.coral)));
  });
  px(g, 9, 0, L.coralL); px(g, 4, 9, L.lampL); px(g, 3, 8, L.foam);
  // the fuller, a groove following the curve
  for (const [x, y] of [[8, 2], [7, 3], [7, 4], [6, 5], [6, 6], [5, 7], [5, 8], [5, 9], [5, 10], [5, 11], [6, 12]]) px(g, x, y, L.coralD);
  // coral knuckles grown out of the back
  px(g, 8, 7, L.coral); px(g, 9, 6, L.coralL); px(g, 8, 10, L.coralD); px(g, 9, 9, L.coral); px(g, 10, 8, L.coralL);
  // the kelp tied below the blade, its tail lifting on the wind
  rect(g, 4, 17, 4, 2, L.kelpD); px(g, 5, 17, L.kelp); px(g, 7, 18, L.kelpDD);
  for (const [x, y] of [[8, 18], [8, 19], [9, 20], [9, 21], [9, 22], [10, 23], [10, 24], [9, 25], [9, 26], [10, 27], [10, 28]]) { px(g, x, y, L.kelpD); if (y < 26) px(g, x + (x < 10 ? 1 : 0), y, L.kelp); }
  px(g, 3, 19, L.kelpD); px(g, 3, 20, L.kelp); px(g, 2, 21, L.kelpD);
  // the butt spike driven in, the ground broken round it
  rect(g, 5, 46, 2, 2, L.bronzeD);
  fillPoly(g, [[2, 49], [3, 47], [5, 46.4], [7, 46.4], [9, 47], [10, 49]], L.sandD);
  px(g, 4, 47, L.sandM); px(g, 8, 47, L.sandM); px(g, 3, 48, L.driftD); px(g, 7, 48, L.driftD);
  return outline(c, OUT);
}

// An old iron-bound chest crusted with barnacles, lid ajar, spilling the goblin queen's red wax seals. 18x14.
export function bakeTributeChest() {
  const W = 18, H = 14; const [c, g] = canvas(W, H);
  // the body: sea-dark planks, iron corners and a hasp
  rect(g, 1, 7, 12, 6, L.driftD); rect(g, 1, 7, 12, 1, L.drift);
  for (let y = 9; y < 13; y += 2) rect(g, 1, y, 12, 1, L.driftDD);
  for (const x of [1, 11]) { rect(g, x, 7, 2, 6, L.rk1); px(g, x, 7, L.rk3); px(g, x + 1, 9, L.rk3); px(g, x + 1, 12, L.rk3); }
  rect(g, 6, 7, 2, 3, L.rk1); px(g, 6, 7, L.rk3); px(g, 7, 9, L.tar);
  // the lid, sprung at one corner: a dark gap under it, full of red wax
  fillPoly(g, [[1, 7], [13, 7], [13, 4.6], [1, 6.6]], L.tar);
  sealDisc(g, 6, 5); sealDisc(g, 9, 4); px(g, 3, 6, L.red); px(g, 12, 5, L.red);
  fillPoly(g, [[0.6, 6.4], [0.8, 4.2], [2.6, 2.6], [12, 0.6], [13.6, 1.4], [13.6, 4.4]], L.drift);
  line(g, 1, 6, 13, 4, L.driftD, 1); line(g, 2, 4, 12, 2, L.barnD, 1);
  for (const x of [1, 11]) { const y = Math.round(6.2 - (x / 12) * 2.2); rect(g, x, y - 3, 2, 3, L.rk1); px(g, x, y - 3, L.rk3); }
  // the barnacle crust from where it lay on the sea floor, and a rag of weed
  for (const [x, y, b] of [[3, 10, 1], [8, 11, 0], [4, 3, 0], [9, 12, 0]]) barnacle(g, x, y, b);
  px(g, 13, 2, L.kelp); px(g, 14, 3, L.kelpD); px(g, 14, 4, L.kelp);
  // the spill, run out on the ground
  sealDisc(g, 12, 12); sealDisc(g, 15, 11); sealDisc(g, 14, 9);
  return outline(c, OUT);
}

// The siren's rock: a wet, barnacled boulder with a flat seat on top, weed hanging off it. 30x16.
// The seat (walkable/sittable top) is row 3 from x 8 to x 21 — draw the siren with her bottom on row 3.
export function bakeSirenRock() {
  const W = 30, H = 16, rnd = mulberry(3131); const [c, g] = canvas(W, H);
  fillPoly(g, [[1, 16], [1.6, 12], [3.4, 8], [6, 5], [8, 3], [22, 3], [24.4, 5.4], [26.4, 8], [28.4, 12], [29, 16]], KEY);
  const m = shadeRock(g, W, H, KEY);
  for (let x = 8; x < 22; x++) { px(g, x, 3, hsh(x, 3, 1) < 0.2 ? L.foam : L.rk3); px(g, x, 4, x < 17 ? L.rk2 : L.rk1); }
  // wet streaks running down the face
  for (const x of [5, 10, 13]) for (let y = 6; y < 11; y++) if (hsh(x, y, 4) < 0.7) px(g, x, y, L.rk2);
  crust(g, W, m, rnd, 8, 10, 14);
  for (const [x, y, len] of [[7, 4, 7], [8, 4, 4], [21, 4, 8], [22, 5, 5], [24, 6, 6], [15, 4, 3]]) weed(g, x, y, len, rnd);
  px(g, 12, 5, L.coral); px(g, 13, 5, L.coralL); px(g, 12, 6, L.coralD);
  outline(c, OUT);
  // the swell breaking round its foot
  for (const x of [0, 1, 2, 27, 28, 29]) px(g, x, 15, L.foam);
  px(g, 1, 14, L.foam); px(g, 28, 14, L.sea3);
  return c;
}

// The Ferryman's river raft, side-on: lashed logs, 96x12. The deck surface is row 1 (row 0 is its
// outline); rows 1-3 are the walkable top. raft.rig is the lantern post and the leaning pole — a second
// canvas, 96 wide, to draw at (raftX, raftY + raft.rigDY) over the raft.
export function bakeRaftBig() {
  const W = 96, H = 12; const [c, g] = canvas(W, H);
  // the lower log, sitting in the water
  rect(g, 5, 6, 86, 5, L.driftDD); rect(g, 5, 6, 86, 1, L.driftD);
  for (let x = 7; x < 90; x += 5) px(g, x, 8 + (x % 2), L.tar);
  // the cut ends show their rings
  const end = (cx, cy) => { ellipse(g, cx, cy, 2.6, 2.6, L.sandD); ellipse(g, cx, cy, 1.6, 1.6, L.sandM); px(g, Math.floor(cx), Math.floor(cy), L.driftD); px(g, Math.floor(cx) - 1, Math.floor(cy) - 1, L.sand); };
  end(5, 8.5); end(91, 8.5);
  // the deck log
  rect(g, 2, 1, 92, 5, L.drift); rect(g, 2, 1, 92, 1, L.barn); rect(g, 2, 2, 92, 1, '#b0a088'); rect(g, 2, 5, 92, 1, L.driftD);
  for (let x = 4; x < 92; x++) if (hsh(x, 3, 4) < 0.22) px(g, x, 3 + (hsh(x, 1, 1) < 0.5 ? 0 : 1), L.driftD);
  for (const x of [22, 55, 77]) { px(g, x, 3, L.driftDD); px(g, x + 1, 3, L.driftD); px(g, x, 4, L.driftD); }
  end(2.5, 3.5); end(93.5, 3.5);
  // rope lashings round both logs
  for (const x of [11, 30, 48, 66, 84]) for (let y = 1; y < 11; y++) { px(g, x, y, (y & 1) ? L.rope : L.ropeD); px(g, x + 1, y, (y & 1) ? L.ropeD : L.rope); }
  // weed trailing in the current
  for (const x of [20, 40, 58, 75]) { px(g, x, 10, L.kelpD); px(g, x + 1, 10, L.kelp); }
  outline(c, OUT);
  // the rig: a short lantern post at the stern, the pole leant against it, a coil of rope at the bow
  const RH = 30; const [rc, rg] = canvas(W, RH);
  rect(rg, 86, 12, 2, RH - 12, L.driftD); rect(rg, 86, 12, 1, RH - 12, L.drift); rect(rg, 85, RH - 3, 4, 3, L.driftDD);
  rect(rg, 86, 11, 5, 1, L.tar); px(rg, 90, 12, L.tar);
  rect(rg, 88, 13, 5, 1, L.bronzeD); rect(rg, 88, 14, 5, 5, L.bronzeD); rect(rg, 89, 14, 3, 4, L.lamp); px(rg, 89, 14, L.lampL); px(rg, 90, 15, L.lampL);
  rect(rg, 88, 19, 5, 1, L.bronzeD); px(rg, 90, 20, L.bronzeD); px(rg, 90, 12, L.bronzeD);
  line(rg, 58, RH - 2, 91, 1, L.driftD, 1); line(rg, 59, RH - 2, 92, 1, L.drift, 1);
  rect(rg, 57, RH - 2, 3, 2, L.driftDD);
  ellipse(rg, 9, RH - 2.5, 4.5, 2.5, L.rope); ellipse(rg, 9, RH - 2.5, 3, 1.5, L.ropeD); ellipse(rg, 9, RH - 2.5, 2, 1, L.rope); px(rg, 9, RH - 3, L.tar); px(rg, 10, RH - 3, L.ropeD);
  px(rg, 13, RH - 1, L.rope); px(rg, 14, RH - 1, L.ropeD);
  outline(rc, OUT);
  c.rig = rc; c.rigDY = -(RH - 2);
  return c;
}
