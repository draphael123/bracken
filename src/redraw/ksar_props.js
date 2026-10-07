// ksar_props.js - THE BANDIT KSAR's BAKED PROPS (claude/ksar art pass). Every sprite is made from px.js primitives (so tools/ksar-art-sheet.mjs can lay them on a sheet in Node) and baked once.
//   GONGS       the fort's gong: a carved teak frame with brass finials and a bronze disc on a rope (a rope the disc hangs by - cut, it lies cracked on the floor); THE GREAT GONG:
//               a stone-footed frame twice the size, a chain, a disc as wide as a shield
//   POWDER      a banded keg with a red powder mark and a fuse (three frames: cold, lit, lit), a FLASH FLASK in its straw cradle, a flask rack
//   DRESSING    barrel, crate, amphora, sack, basket of dates, rolled carpet, a water trough; the Hawk-Mistress's PERCH (a T-post with a hooded hawk), her BANNER (a red field and a black hawk)
//   LIGHTS      a wall TORCH (3 flames), an iron BRAZIER (3 flames, glowing coals), a hanging OIL LAMP, a pierced brass LANTERN
//   TOWER       the minaret's shaft and lantern cap, the HAWK TOWER's far silhouette
import { canvas, px, rect, ellipse, circle, line, fillPoly, outline } from '../px.js';

const O = '#1b1626';   /* the house outline */
export const C = {
  teak: '#5a3420', teakHi: '#8a5a34', teakLo: '#3a2014', brass: '#d9b04a', brassHi: '#fff0a0', brassLo: '#8a6a22',
  bronze: ['#ffe28a', '#e0b44a', '#c08a2a', '#9a6a1e', '#6a4614'], rope: '#d8bc84', ropeLo: '#9a7a48',
  iron: '#4a4a52', ironHi: '#8a8a96', ironLo: '#2a2a32', stone: '#b8b4a2', stoneHi: '#e0dccc', stoneLo: '#7a7868',
  oak: '#8a5a32', oakHi: '#b88450', oakLo: '#5a3a1e', band: '#3a3a42', powder: '#c8281e', fuse: '#d8c890', flame: ['#fff4b0', '#ffc84a', '#ff8a2a', '#d8481a'],
  clay: '#c06a3a', clayHi: '#e0905a', clayLo: '#8a4426', sack: '#d8c492', sackLo: '#a89466', red: '#a8302a', redHi: '#d85a3a', redLo: '#6a1e1e', black: '#1b1626',
  glass: '#dfeaf0', glassHi: '#ffffff', glassLo: '#98b0bc', straw: '#e0c070',
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };

/* ---------------------------------------------------------------- GONGS */
/* the frame (no disc, no rope): width W x height H, its feet on the last row */
export function bakeGongFrame(great) {
  return once('gf' + great, () => { const W = great ? 44 : 30, H = great ? 66 : 50, [c, g] = canvas(W, H), px0 = great ? 4 : 3, px1 = W - px0 - 4;
    if (great) { rect(g, 1, H - 6, W - 2, 6, C.stoneLo); rect(g, 1, H - 6, W - 2, 2, C.stone); rect(g, 1, H - 6, W - 2, 1, C.stoneHi); for (let x = 8; x < W - 4; x += 10) rect(g, x, H - 4, 1, 4, C.ironLo); }
    for (const sx of [px0, px1]) { rect(g, sx, 6, 4, H - 6, C.teak); rect(g, sx, 6, 1, H - 6, C.teakHi); rect(g, sx + 3, 6, 1, H - 6, C.teakLo); for (let y = 14; y < H - 8; y += 9) rect(g, sx, y, 4, 1, C.teakLo);
      rect(g, sx - 1, H - (great ? 10 : 5), 6, great ? 4 : 5, C.brassLo); rect(g, sx - 1, H - (great ? 10 : 5), 6, 1, C.brass); }
    rect(g, px0 - 2, 3, W - 2 * px0 + 6 - 2, 5, C.teak); rect(g, px0 - 2, 3, W - 2 * px0 + 2, 1, C.teakHi); rect(g, px0 - 2, 7, W - 2 * px0 + 2, 1, C.teakLo);
    for (const sx of [px0 - 3, W - px0 - 1]) { rect(g, sx, 1, 3, 9, C.brassLo); rect(g, sx, 1, 3, 2, C.brass); px(g, sx + 1, 1, C.brassHi); px(g, sx + 1, 0, C.brass); }   /* the finials */
    line(g, px0 + 3, 9, px0 + 8, 14, C.teakLo); line(g, px1, 9, px1 - 5, 14, C.teakLo);   /* braces */
    rect(g, (W >> 1) - 1, 8, 2, 2, C.brass);   /* the hanger */
    outline(c, O); return c; });
}
/* the disc: a bronze disc with rings, a boss and a lit rim */
export function bakeGongDisc(great, cracked) {
  return once('gd' + great + (cracked ? 'x' : ''), () => { const r = great ? 13 : 9, S = r * 2 + 3, [c, g] = canvas(S, S), m = S / 2;
    circle(g, m, m, r, C.bronze[3]); circle(g, m - 0.4, m - 0.4, r - 1, C.bronze[2]); circle(g, m - 0.8, m - 0.8, r - 2.4, C.bronze[1]);
    for (const q of great ? [0.78, 0.55] : [0.7]) for (let a = 0; a < 6.3; a += 0.12) { const xx = m + Math.cos(a) * r * q, yy = m + Math.sin(a) * r * q; px(g, xx, yy, a > 2.4 && a < 5.5 ? C.bronze[4] : C.bronze[0]); }
    circle(g, m, m, great ? 4 : 3, C.bronze[4]); circle(g, m - 0.6, m - 0.6, great ? 3.2 : 2.2, C.bronze[1]); px(g, m - 1, m - 1, C.brassHi); if (great) px(g, m - 2, m - 2, C.brassHi);
    for (let a = 3.4; a < 5.2; a += 0.1) px(g, m + Math.cos(a) * (r - 0.5), m + Math.sin(a) * (r - 0.5), C.bronze[4]);   /* the shaded rim */
    for (let a = 0.3; a < 1.4; a += 0.1) px(g, m + Math.cos(a + 3.2) * (r - 0.5) * -1, m + Math.sin(a + 3.2) * (r - 0.5) * -1, C.bronze[0]);
    px(g, m, 1, C.iron);   /* the ring it hangs by */ px(g, m, 0, C.iron);
    if (cracked) { line(g, m - 3, m - r + 2, m + 1, m + 2, C.bronze[4]); line(g, m + 1, m + 2, m + 4, m + r - 3, C.bronze[4]); }
    outline(c, O); return c; });
}
/* a CUT gong: its disc lies on the floor, cracked, the frame bare with the rope's stump hanging */
export function bakeGongFallen(great) { return once('gl' + great, () => { const w = great ? 30 : 22, [c, g] = canvas(w, 9);
  ellipse(g, w / 2, 6, w / 2 - 1, 2.6, C.bronze[3]); ellipse(g, w / 2, 5.4, w / 2 - 2, 2, C.bronze[1]); ellipse(g, w / 2, 5, w / 2 - 6, 1, C.bronze[4]); px(g, w / 2 - 2, 4, C.brassHi); line(g, w / 2 + 2, 4, w / 2 + 5, 7, C.bronze[4]); outline(c, O); return c; }); }

/* ---------------------------------------------------------------- POWDER KEGS, FLASKS */
export function bakeKeg(frame) {   /* 0 cold, 1 lit, 2 lit */
  return once('kg' + frame, () => { const [c, g] = canvas(14, 20);
    rect(g, 2, 8, 10, 11, C.oakLo); rect(g, 1, 10, 12, 7, C.oakLo); rect(g, 2, 9, 10, 9, C.oak); rect(g, 2, 9, 3, 9, C.oakHi); rect(g, 10, 9, 2, 9, C.oakLo);
    for (let x = 5; x < 11; x += 3) rect(g, x, 9, 1, 9, C.oakLo);   /* the staves */
    rect(g, 1, 11, 12, 2, C.band); rect(g, 1, 11, 12, 1, C.ironHi); rect(g, 1, 16, 12, 2, C.band); rect(g, 1, 16, 12, 1, C.ironHi);
    rect(g, 5, 13, 4, 3, C.powder); px(g, 6, 14, '#fff0d0'); px(g, 7, 14, '#fff0d0'); px(g, 7, 13, '#fff0d0');   /* the red powder mark */
    rect(g, 3, 7, 8, 2, C.oakHi); rect(g, 3, 7, 8, 1, C.oak);   /* the head */
    rect(g, 7, 4, 1, 3, C.fuse); px(g, 8, 4, C.fuse); px(g, 8, 3, C.fuse);
    if (frame) { px(g, 8, 2, C.flame[frame === 1 ? 1 : 2]); px(g, 8, 1, C.flame[0]); px(g, 7, 2, C.flame[2]); px(g, 9, 2, C.flame[1]); if (frame === 2) { px(g, 9, 1, C.flame[3]); px(g, 7, 1, C.flame[1]); } }
    outline(c, O); return c; });
}
export function bakeFlask() { return once('fl', () => { const [c, g] = canvas(10, 14);
  circle(g, 5, 9, 4, C.glassLo); circle(g, 4.6, 8.6, 3.2, C.glass); rect(g, 4, 3, 2, 3, C.glassLo); rect(g, 4, 3, 1, 3, C.glass); rect(g, 3, 2, 4, 2, C.oakHi); rect(g, 3, 2, 4, 1, C.oak);
  circle(g, 5, 10, 2, '#fff6d0'); px(g, 5, 10, '#ffffff'); px(g, 3, 7, C.glassHi); px(g, 3, 8, C.glassHi);
  rect(g, 2, 11, 6, 2, C.straw); px(g, 3, 12, C.sackLo); px(g, 6, 12, C.sackLo); outline(c, O); return c; }); }
/* the rack the courtyard and the walls keep flasks on: two cradles on a plank */
export function bakeRack() { return once('rk', () => { const [c, g] = canvas(30, 12);
  rect(g, 0, 9, 30, 3, C.teak); rect(g, 0, 9, 30, 1, C.teakHi); rect(g, 2, 11, 3, 1, C.teakLo); rect(g, 25, 11, 3, 1, C.teakLo);
  for (const x of [3, 10, 17, 24]) { rect(g, x, 6, 4, 4, C.straw); rect(g, x, 8, 4, 1, C.sackLo); } rect(g, 0, 3, 30, 1, C.teakLo); rect(g, 1, 3, 2, 7, C.teakLo); rect(g, 27, 3, 2, 7, C.teakLo);
  outline(c, O); return c; }); }

/* ---------------------------------------------------------------- DRESSING */
export function bakeBarrel(v) { return once('br' + v, () => { const [c, g] = canvas(14, 18);
  rect(g, 2, 3, 10, 14, C.oakLo); rect(g, 1, 6, 12, 8, C.oakLo); rect(g, 2, 4, 10, 12, C.oak); rect(g, 1, 7, 12, 6, C.oak); rect(g, 2, 4, 3, 12, C.oakHi); rect(g, 10, 4, 2, 12, C.oakLo);
  for (const y of [6, 14]) { rect(g, 1, y, 12, 1, C.band); rect(g, 1, y, 12, 1, v ? C.ironHi : C.band); } rect(g, 2, 2, 10, 2, C.oakHi); rect(g, 3, 2, 8, 1, C.oak);
  if (v === 1) { rect(g, 3, 2, 8, 1, '#3a6a9a'); rect(g, 4, 2, 4, 1, '#8ac0e0'); }   /* open: water */
  if (v === 2) { rect(g, 5, 8, 4, 3, C.red); px(g, 7, 9, '#fff0d0'); }
  outline(c, O); return c; }); }
export function bakeCrate(v) { return once('cr' + v, () => { const [c, g] = canvas(16, v ? 16 : 13);
  const h = v ? 16 : 13; rect(g, 1, 1, 14, h - 2, C.oakLo); rect(g, 2, 2, 12, h - 4, C.oak); for (let y = 4; y < h - 2; y += 4) rect(g, 2, y, 12, 1, C.oakLo); rect(g, 2, 2, 12, 1, C.oakHi);
  line(g, 2, 3, 13, h - 4, C.oakLo); rect(g, 1, 1, 2, h - 2, C.band); rect(g, 13, 1, 2, h - 2, C.band); outline(c, O); return c; }); }
export function bakeAmphora(v) { return once('am' + v, () => { const [c, g] = canvas(12, 18), col = [C.clay, '#a85a3a', '#c8904a'][v % 3], hi = [C.clayHi, '#d08a62', '#e8b878'][v % 3];
  ellipse(g, 6, 11, 4.6, 5.4, col); ellipse(g, 5, 10, 2.4, 3.6, hi); rect(g, 4, 3, 4, 4, col); rect(g, 3, 2, 6, 2, hi); rect(g, 4, 2, 4, 1, C.clayLo); rect(g, 1, 6, 2, 5, col); rect(g, 9, 6, 2, 5, col); rect(g, 4, 9, 4, 1, C.clayLo); rect(g, 3, 12, 6, 1, C.clayLo); rect(g, 4, 16, 4, 1, col);
  if (v === 1) { for (let x = 3; x < 9; x += 2) px(g, x, 7, '#f0e0b0'); } outline(c, O); return c; }); }
export function bakeSacks() { return once('sk', () => { const [c, g] = canvas(22, 14);
  ellipse(g, 6, 9, 5.5, 4.4, C.sack); ellipse(g, 5, 8, 2.5, 2, '#ecdcb0'); rect(g, 3, 3, 6, 2, C.sackLo); ellipse(g, 15, 9, 5, 4, C.sack); ellipse(g, 14, 8, 2, 1.6, '#ecdcb0'); rect(g, 12, 3, 5, 2, C.sackLo);
  ellipse(g, 11, 5, 4.6, 3.6, C.sack); ellipse(g, 10, 4, 2, 1.4, '#ecdcb0'); rect(g, 9, 1, 4, 2, C.sackLo); outline(c, O); return c; }); }
export function bakeDates() { return once('dt', () => { const [c, g] = canvas(16, 10);
  ellipse(g, 8, 7, 7, 3, '#6a4a2a'); rect(g, 1, 6, 14, 3, '#8a6238'); rect(g, 1, 6, 14, 1, '#b88450'); for (let x = 2; x < 14; x += 2) { px(g, x, 4 + (x % 3 ? 0 : 1), '#5a2a1a'); px(g, x + 1, 5, '#7a3a22'); } outline(c, O); return c; }); }
export function bakeCarpet(v) { return once('cp' + v, () => { const [c, g] = canvas(18, 12), cols = v ? ['#2a4a7a', '#d8b050', '#a8302a'] : ['#a8302a', '#d8b050', '#2a4a7a'];
  rect(g, 1, 3, 16, 8, cols[0]); for (let x = 2; x < 16; x += 3) rect(g, x, 3, 1, 8, cols[1]); rect(g, 1, 6, 16, 2, cols[2]); rect(g, 1, 3, 16, 1, cols[1]); ellipse(g, 2, 7, 1.6, 3.6, cols[1]); ellipse(g, 2, 7, 0.8, 2.6, cols[0]); for (let y = 3; y < 11; y += 2) { px(g, 0, y, '#f0e0b0'); px(g, 17, y, '#f0e0b0'); }
  outline(c, O); return c; }); }
export function bakeTrough() { return once('tr', () => { const [c, g] = canvas(30, 12);
  rect(g, 0, 3, 30, 9, C.oakLo); rect(g, 1, 4, 28, 7, C.oak); rect(g, 1, 4, 28, 2, '#3a6a9a'); rect(g, 2, 4, 14, 1, '#8ac0e0'); rect(g, 0, 3, 30, 1, C.oakHi); rect(g, 2, 11, 3, 1, C.teakLo); rect(g, 25, 11, 3, 1, C.teakLo); outline(c, O); return c; }); }
export function bakeBones() { return once('bn', () => { const [c, g] = canvas(20, 9);
  rect(g, 2, 7, 16, 1, '#c8b890'); circle(g, 6, 5, 3, '#e8e0c8'); px(g, 5, 4, C.black); px(g, 7, 4, C.black); rect(g, 5, 7, 2, 1, '#c8b890'); line(g, 11, 7, 17, 5, '#e8e0c8'); line(g, 12, 5, 16, 7, '#d8d0b8'); px(g, 17, 5, '#e8e0c8'); outline(c, O); return c; }); }
/* a WRECKED CARAVAN CART: a tilted bed on one wheel, a bale and a spilled crate - the raiders' work */
export function bakeWreck() { return once('wk', () => { const [c, g] = canvas(44, 28);
  fillPoly(g, [[3, 16], [34, 10], [37, 18], [6, 24]], C.oakLo); fillPoly(g, [[4, 16], [33, 11], [35, 16], [6, 21]], C.oak); line(g, 4, 16, 33, 11, C.oakHi); for (let k = 0; k < 4; k++) line(g, 8 + k * 7, 15 - k, 9 + k * 7, 22 - k, C.oakLo);
  circle(g, 36, 20, 6, C.teakLo); circle(g, 36, 20, 5, C.teak); circle(g, 36, 20, 1.6, C.brass); for (let a = 0; a < 6.3; a += 1.05) line(g, 36, 20, 36 + Math.cos(a) * 5, 20 + Math.sin(a) * 5, C.teakLo);
  rect(g, 1, 24, 8, 3, C.oakLo); line(g, 3, 14, 0, 8, C.teakLo); line(g, 6, 14, 3, 7, C.teakLo);   /* the broken shafts */
  ellipse(g, 20, 7, 7, 4, C.sack); rect(g, 15, 3, 10, 2, C.sackLo); px(g, 18, 6, '#ecdcb0');
  rect(g, 28, 4, 8, 6, C.oak); rect(g, 28, 4, 8, 1, C.oakHi); line(g, 29, 5, 35, 9, C.oakLo);
  px(g, 24, 25, C.brass); px(g, 25, 26, C.brassLo); px(g, 12, 26, '#d8b050'); outline(c, O); return c; }); }

/* ---------------------------------------------------------------- THE HAWK-MISTRESS'S PERCH and BANNER */
export function bakePerch(frame) { return once('pe' + frame, () => { const [c, g] = canvas(26, 30);
  rect(g, 12, 10, 3, 20, C.teak); rect(g, 12, 10, 1, 20, C.teakHi); rect(g, 8, 28, 11, 2, C.teakLo); rect(g, 2, 8, 22, 3, C.teak); rect(g, 2, 8, 22, 1, C.teakHi); rect(g, 1, 7, 2, 5, C.brassLo); rect(g, 23, 7, 2, 5, C.brassLo);
  rect(g, 8, 8, 2, 3, C.rope); rect(g, 17, 8, 2, 3, C.rope);
  /* the hooded hawk on the left arm of the perch */
  ellipse(g, 6, 4, 3.4, 4, '#6a4428'); ellipse(g, 6, 5, 2, 2.6, '#e0caa0'); rect(g, 4, 1, 5, 3, '#a8302a'); px(g, 6, 0, '#d8b050'); rect(g, 3, 7, 1, 2, '#d8b040'); rect(g, 8, 7, 1, 2, '#d8b040');
  px(g, 4, 2, frame ? '#d8b050' : '#a8302a');
  /* a second perch bird? no: a glove hangs on the right */
  rect(g, 18, 11, 3, 5, '#c9a060'); rect(g, 18, 11, 3, 1, '#e0c080'); line(g, 19, 16, 19, 20, C.rope);
  outline(c, O); return c; }); }
export function bakeBannerPole() { return once('bp', () => { const [c, g] = canvas(8, 40); rect(g, 3, 1, 2, 39, C.teak); rect(g, 3, 1, 1, 39, C.teakHi); rect(g, 1, 0, 6, 3, C.brass); px(g, 3, 0, C.brassHi); rect(g, 0, 4, 8, 2, C.teakLo); outline(c, O); return c; }); }

/* ---------------------------------------------------------------- LIGHTS */
export function bakeTorch(frame) { return once('to' + frame, () => { const [c, g] = canvas(10, 20);
  rect(g, 3, 10, 3, 10, C.teak); rect(g, 3, 10, 1, 10, C.teakHi); rect(g, 2, 9, 5, 3, C.band); rect(g, 2, 9, 5, 1, C.ironHi); rect(g, 1, 16, 7, 2, C.band); rect(g, 4, 18, 1, 2, C.ironLo);   /* a pole in an iron bracket */
  const f = [[1, 0, 2], [0, 1, 2], [2, 0, 1]][frame % 3];
  rect(g, 3, 6, 3, 4, C.flame[3]); rect(g, 3 + f[0], 5, 3, 3, C.flame[2]); rect(g, 4, 4 + f[1], 2, 4, C.flame[1]); rect(g, 4, 3 + f[1], 1, 3, C.flame[0]); px(g, 4 + f[2], 2, C.flame[1]); px(g, 3, 8, C.flame[0]);
  outline(c, O); return c; }); }
export function bakeBrazier(frame) { return once('bz' + frame, () => { const [c, g] = canvas(22, 30);
  line(g, 4, 29, 8, 17, C.iron); line(g, 17, 29, 13, 17, C.iron); line(g, 10, 29, 10, 17, C.iron); rect(g, 7, 24, 8, 1, C.ironLo);
  fillPoly(g, [[1, 13], [20, 13], [17, 18], [4, 18]], C.iron); rect(g, 1, 13, 19, 1, C.ironHi); rect(g, 3, 13, 15, 1, '#ff8a2a'); rect(g, 4, 14, 13, 1, C.iron);
  rect(g, 4, 12, 13, 2, '#8a2a1a'); for (let x = 5; x < 16; x += 3) px(g, x, 12, '#ffb04a');   /* coals */
  const f = [[0, 1], [1, 0], [-1, 1]][frame % 3];
  fillPoly(g, [[4, 12], [17, 12], [14 + f[0], 5], [10 + f[0] * 2, 1 + f[1]], [7, 5]], C.flame[3]); fillPoly(g, [[6, 12], [15, 12], [12 + f[0], 6], [10 + f[0] * 2, 3 + f[1]]], C.flame[2]); fillPoly(g, [[8, 12], [13, 12], [11 + f[0], 7], [10 + f[0] * 2, 5 + f[1]]], C.flame[1]); fillPoly(g, [[9, 12], [12, 12], [10 + f[0], 8]], C.flame[0]);
  outline(c, O); return c; }); }
export function bakeLamp(frame) { return once('lp' + frame, () => { const [c, g] = canvas(12, 20);
  for (let y = 0; y < 8; y += 2) { px(g, 6, y, C.ironHi); px(g, 6, y + 1, C.ironLo); }   /* the chain */
  rect(g, 2, 8, 8, 2, C.brassLo); rect(g, 2, 8, 8, 1, C.brass); fillPoly(g, [[2, 10], [10, 10], [8, 14], [4, 14]], C.brass); rect(g, 4, 10, 2, 3, C.brassHi); px(g, 7, 12, C.brassLo); rect(g, 5, 14, 2, 1, C.brassLo); rect(g, 1, 7, 10, 1, C.brassLo);
  rect(g, 5, 5 + (frame & 1), 2, 3, C.flame[1]); px(g, 5 + (frame & 1), 4, C.flame[0]); px(g, 6, 6, C.flame[0]); outline(c, O); return c; }); }
export function bakeLantern(frame) { return once('ln' + frame, () => { const [c, g] = canvas(12, 20);
  rect(g, 6, 0, 1, 5, C.ironHi); rect(g, 3, 5, 7, 2, C.brassLo); rect(g, 3, 5, 7, 1, C.brass); fillPoly(g, [[3, 7], [10, 7], [9, 16], [4, 16]], '#d8481a'); fillPoly(g, [[4, 8], [9, 8], [8, 15], [5, 15]], frame ? '#ffd870' : '#ffc84a');
  for (const x of [4, 6, 8]) rect(g, x, 8, 1, 7, C.brassLo); rect(g, 3, 16, 7, 2, C.brassLo); rect(g, 3, 16, 7, 1, C.brass); px(g, 6, 18, C.brass); px(g, 6, 11, '#fff6c0'); outline(c, O); return c; }); }

/* ---------------------------------------------------------------- THE MINARET (shaft + lantern cap), 24 wide */
export function bakeMinaretShaft(v = 0) { return once('mn' + v, () => { const W = 24, [c, g] = canvas(W, 16);
  for (let y = 0; y < 16; y++) for (let x = 0; x < W; x++) { const k = x < 4 ? 0 : x < 18 ? 1 : 2, col = ['#9a5a38', '#c08a5c', '#e0b080'][k]; px(g, x, y, ((x + (y >> 3) * 4) & 7) === 7 || (y & 7) === 7 ? '#7a4630' : col); }
  rect(g, 0, 0, W, 2, '#f0e0c0'); rect(g, 0, 0, W, 1, '#fff6e0'); rect(g, 0, 2, W, 1, '#8a6a4a'); rect(g, 0, 13, W, 3, '#f0e0c0'); rect(g, 0, 15, W, 1, '#8a6a4a');
  if (v === 1) { rect(g, 10, 5, 4, 7, '#1d1218'); rect(g, 9, 4, 6, 1, '#f0e0c0'); rect(g, 10, 5, 1, 7, '#2e1f26'); rect(g, 8, 12, 8, 1, '#f0e0c0'); }
  else { for (let x = 4; x < 20; x += 4) px(g, x, 7 + ((x >> 2) & 1), '#7a4630'); }
  return c; }); }
export function bakeMinaretCap() { return once('mc', () => { const W = 36, H = 44, [c, g] = canvas(W, H), m = 18;
  rect(g, 4, 30, 28, 4, '#f0e0c0'); rect(g, 4, 30, 28, 1, '#fff6e0'); rect(g, 4, 33, 28, 1, '#8a6a4a');   /* the gallery */
  for (let x = 5; x < 31; x += 4) rect(g, x, 34, 2, 6, '#c08a5c');   /* its balusters */
  rect(g, 4, 40, 28, 2, '#e0b080');
  rect(g, 9, 18, 18, 12, '#d8a070'); rect(g, 9, 18, 4, 12, '#a86a40'); rect(g, 22, 18, 5, 12, '#f0c898'); rect(g, 15, 22, 6, 8, '#1d1218'); rect(g, 14, 21, 8, 1, '#f0e0c0'); rect(g, 16, 22, 1, 8, '#2e1f26');
  fillPoly(g, [[8, 18], [28, 18], [24, 8], [m, 1], [12, 8]], '#3a7a82'); fillPoly(g, [[12, 18], [28, 18], [24, 8], [m + 2, 3]], '#4a9aa2'); fillPoly(g, [[9, 18], [14, 18], [13, 8], [m - 2, 3]], '#2a5a62'); rect(g, 8, 18, 20, 1, '#e0c080');
  rect(g, m, 0, 1, 3, C.brass); px(g, m - 1, 1, C.brassHi); px(g, m + 1, 0, C.brass);   /* the finial: a crescent's stalk */
  rect(g, m - 2, 4, 5, 1, C.brass); px(g, m - 2, 3, C.brass); px(g, m + 2, 3, C.brass);
  outline(c, O); return c; }); }

/* THE GILDED HAWK on the Hawk Tower's turret: wings swept up and back, a hooked beak, the tail fanned - gold on a spike, 22 x 18 */
export function bakeGildedHawk() { return once('gh', () => { const [c, g] = canvas(22, 18), G = ['#fff0a0', '#e8c24a', '#b88a22', '#7a5a14'];
  fillPoly(g, [[11, 9], [4, 2], [0, 0], [2, 6], [5, 10], [9, 12]], G[1]); fillPoly(g, [[11, 9], [18, 2], [22, 0], [20, 6], [17, 10], [13, 12]], G[1]);
  for (let k = 0; k < 4; k++) { line(g, 9 - k * 2, 11 - k, 3 - k, 3 + k, G[3]); line(g, 13 + k * 2, 11 - k, 19 + k * 0, 3 + k, G[3]); }
  fillPoly(g, [[9, 8], [13, 8], [14, 14], [8, 14]], G[1]); rect(g, 9, 8, 2, 6, G[0]); rect(g, 12, 9, 1, 5, G[2]); fillPoly(g, [[8, 14], [14, 14], [12, 17], [10, 17]], G[2]);
  circle(g, 11, 6, 2.2, G[1]); px(g, 11, 5, G[0]); px(g, 12, 6, '#1b1626'); rect(g, 13, 6, 2, 1, G[2]); px(g, 14, 7, G[3]); rect(g, 10, 12, 2, 6, G[2]);
  outline(c, '#4a3410'); return c; }); }
/* THE HAWK RELIEF: the Hawk-Mistress's sun-disc, a red field ringed in gold with a spread-winged hawk cut in dark bronze (her courtyard's back wall) 72 x 72 */
export function bakeHawkRelief() { return once('hr', () => { const [c, g] = canvas(72, 72), m = 36;
  circle(g, m, m, 35, '#4a1a14'); circle(g, m, m, 33, '#8a2a22'); circle(g, m - 1, m - 1, 30, '#a8382c'); circle(g, m, m, 26, '#8a2a22');
  for (let a = 0; a < 6.3; a += 0.09) { px(g, m + Math.cos(a) * 34, m + Math.sin(a) * 34, a > 2 && a < 5 ? '#8a6a22' : '#e8c24a'); px(g, m + Math.cos(a) * 27.5, m + Math.sin(a) * 27.5, '#d9b04a'); }
  for (let a = 0; a < 6.3; a += 0.52) { line(g, m + Math.cos(a) * 28, m + Math.sin(a) * 28, m + Math.cos(a) * 33, m + Math.sin(a) * 33, '#e8c24a'); }   /* the sun's rays */
  const D = '#2a1410', B = '#5a3a18', G = '#e8c24a';
  fillPoly(g, [[m, m - 12], [m + 5, m - 6], [m + 7, m + 4], [m + 3, m + 14], [m - 3, m + 14], [m - 7, m + 4], [m - 5, m - 6]], D);   /* the body */
  fillPoly(g, [[m - 5, m - 6], [m - 25, m - 16], [m - 24, m - 6], [m - 20, m + 2], [m - 14, m + 8], [m - 7, m + 6]], D); fillPoly(g, [[m + 5, m - 6], [m + 25, m - 16], [m + 24, m - 6], [m + 20, m + 2], [m + 14, m + 8], [m + 7, m + 6]], D);   /* the wings */
  for (let k = 0; k < 5; k++) { line(g, m - 8 - k * 3.5, m - 6 + k * 2, m - 23 + k * 1.5, m - 12 + k * 3.2, B); line(g, m + 8 + k * 3.5, m - 6 + k * 2, m + 23 - k * 1.5, m - 12 + k * 3.2, B); }
  fillPoly(g, [[m - 3, m + 14], [m - 6, m + 25], [m - 2, m + 22], [m, m + 26], [m + 2, m + 22], [m + 6, m + 25], [m + 3, m + 14]], D);   /* the tail */
  circle(g, m, m - 14, 4, D); px(g, m + 2, m - 15, G); px(g, m + 3, m - 15, G); line(g, m + 3, m - 12, m + 5, m - 9, G); px(g, m + 1, m - 15, '#ff4a3a');   /* the head, a gold eye and beak */
  outline(c, '#2a1410'); return c; }); }
/* every sprite at once, for the sheet */
export function sheetItems() {
  return [bakeGongFrame(false), bakeGongFrame(true), bakeGongDisc(false), bakeGongDisc(true), bakeGongDisc(false, true), bakeGongFallen(false), bakeGongFallen(true), bakeKeg(0), bakeKeg(1), bakeKeg(2), bakeFlask(), bakeRack(),
    bakeBarrel(0), bakeBarrel(1), bakeBarrel(2), bakeCrate(0), bakeCrate(1), bakeAmphora(0), bakeAmphora(1), bakeAmphora(2), bakeSacks(), bakeDates(), bakeCarpet(0), bakeCarpet(1), bakeTrough(), bakeBones(), bakeWreck(),
    bakePerch(0), bakePerch(1), bakeBannerPole(), bakeTorch(0), bakeTorch(1), bakeTorch(2), bakeBrazier(0), bakeBrazier(1), bakeBrazier(2), bakeLamp(0), bakeLamp(1), bakeLantern(0), bakeLantern(1), bakeMinaretShaft(0), bakeMinaretShaft(1), bakeMinaretCap(), bakeGildedHawk(), bakeHawkRelief()];
}
