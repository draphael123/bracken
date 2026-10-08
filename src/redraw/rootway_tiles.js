// rootway_tiles.js - THE ROOTWAY's own TILE KIT (claude/rootway art pass). The greybox wore Sporewood's dirt. This is a climb up a great tree's roots into the goblins' canopy,
// so the ground is BARK and ROOT, never earth, and it WARMS as you climb (the seam Sporewood leaves for Kingswood):
//   zone 0 THE ROOT CELLAR      cold violet-brown roots in the deep fungus dark, damp moss and spore-light on every lip
//   zone 1 THE GREAT ROOTS      red-brown bark, thick ridged roots, cap-green moss
//   zone 2 THE HOIST YARD       ochre-brown wood, the goblins' pegs, lashings and scaffold boards
//   zone 3 THE CANOPY LOOKOUT   golden bark in the sun, honey-coloured knots, dry leaf litter on every lip
//   zone 4 THE HUNTMASTER'S STAND  dark heartwood scored with old arrows' holes, an amber glow in the grain
//   SOLID    TOP   a lit moss/bark lip, a bark-ridge band under it, root fibres hanging from the edge, a knot now and then
//            FACE  vertical BARK GRAIN (ridges that run the height of the wall, split by dark furrows), the lit side to the left, knots, a lashed peg here and there
//            CEIL  an underside of dripping root hair
//            MASS  packed root: dark, with the long curved veins of roots going through it, darker the deeper it is
//   ONEWAY   LASHED TIMBER: a bark-on log with its top planed lit, bound with cord every few pixels, an iron-less peg at each end; a span the goblins' hoists drop is the same lashed
//            timber (the hoists' own picture is src/redraw/rootway_world.js)
// Made from px.js primitives, 16x16, baked lazily and memoised.   rootTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); };

/* WHICH PART OF THE CLIMB (the sections of src/rootway.js): 0 cellar, 1 great roots, 2 hoist yard, 3 lookout, 4 the stand */
export const zoneOf = x => x < 96 ? 0 : x < 196 ? 1 : x < 296 ? 2 : x < 386 ? 3 : 4;
/* each zone's wood: a ramp of seven, dark to light (s0 deepest furrow ... s6 the sunlit lip), the moss or litter on its lips, the cord, the knot's heart */
export const ZONE = [
  { s: ['#150e1c', '#24182c', '#38243c', '#503450', '#6c4862', '#8c6074', '#b07e88'], moss: ['#2c5a48', '#4a8a5a', '#8ac07a'], cord: '#9a8a6a', knot: '#c08a60' },
  { s: ['#1a1014', '#2e1a1c', '#482a24', '#663c2c', '#885638', '#aa7448', '#d49c60'], moss: ['#3a5a2a', '#5a8a36', '#9ac058'], cord: '#b09a6a', knot: '#d8a060' },
  { s: ['#1c130c', '#33200f', '#523416', '#74501e', '#9a702a', '#c49440', '#ecbc68'], moss: ['#5a6a28', '#8a8c34', '#c8b44e'], cord: '#c8aa72', knot: '#e8b860' },
  { s: ['#20160a', '#3e2a12', '#5e4018', '#84601f', '#aa8230', '#d2a848', '#f6d078'], moss: ['#7a6a22', '#b09a34', '#e8cc58'], cord: '#d8bc80', knot: '#f2c868' },
  { s: ['#100a0a', '#241410', '#3c2216', '#58321a', '#7a4620', '#a46428', '#d49040'], moss: ['#3a2a18', '#6a4a22', '#b88438'], cord: '#a8885a', knot: '#e8a040' }];

/* ---- the grain of a bark face: for one zone, a table by ABSOLUTE pixel column of [shade shift, furrow] so ridges run on across neighbours ---- */
const grain = zone => once('grain' + zone, () => { const r = mulberry(zone * 733 + 5), out = []; let x = 0;
  while (x < 4200) { const w = 2 + ((r() * 4) | 0), sh = ((r() * 3) | 0) - 1; for (let k = 0; k < w && x < 4200; k++, x++) out.push([sh, k === 0 ? 1 : 0, k === w - 1 ? 1 : 0]); }
  return out; });
const barkPx = (zone, ax, base, lit) => { const b = grain(zone)[ax % 4200] || [0, 0, 0], Z = ZONE[zone];
  if (b[1]) return Z.s[Math.max(0, base - 2)]; if (b[2]) return Z.s[Math.max(0, Math.min(6, base + 1 + (lit ? 1 : 0)))]; return Z.s[Math.max(0, Math.min(6, base + b[0] + (lit ? 1 : 0)))]; };
function tint(g, col, a) { g.globalAlpha = a; rect(g, 0, 0, 16, 16, col); g.globalAlpha = 1; }
/* the deeper into the roots, the darker (rows below 40 drop into the cellar's dark) */
const deepK = y => y < 34 ? 0 : Math.min(0.5, (y - 34) * 0.035);
function deepTint(g, y, mul = 1) { for (let py = 0; py < 16; py++) { const a = deepK(y + py / 16) * mul; if (a < 0.01) continue; g.globalAlpha = a; rect(g, 0, py, 16, 1, '#0a0610'); } g.globalAlpha = 1; }

function barkFill(g, zone, x, y, base, lit) {
  for (let py = 0; py < 16; py++) for (let pxl = 0; pxl < 16; pxl++) {
    const ax = x * 16 + pxl, jit = ((hash(ax, y * 16 + py) >> 4) % 17) === 0 ? -1 : 0;
    px2(g, pxl, py, barkPx(zone, ax + ((py >> 3) * 0), base + jit, lit)); }
}
/* A KNOT: a ring in the wood, the heart honey-lit */
function knot(g, zone, cx, cy, r) { const Z = ZONE[zone]; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const d = Math.hypot(dx, dy * 1.3); if (d <= r) px2(g, cx + dx, cy + dy, d < r * 0.45 ? Z.s[1] : d < r * 0.8 ? Z.s[2] : Z.s[4]); }
  px2(g, cx, cy, Z.s[0]); px2(g, cx - 1, cy - 1, Z.knot); }

/* ============================ TOP: a lit moss and bark lip, ridges under it, root fibres hanging ============================ */
function topTile(zone, x, y, eL, eR) {
  return once('tp' + zone + '_' + (x & 7) + '_' + y + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y) + zone * 31), Z = ZONE[zone];
    barkFill(g, zone, x, y, 3, false);
    rect(g, 0, 0, 16, 3, Z.s[4]); rect(g, 0, 3, 16, 1, Z.s[2]); rect(g, 0, 4, 16, 1, Z.s[1]);                                          /* the bark cap and its shadow line */
    /* the lit moss (zones 0-2) or leaf litter (zones 3-4) on the lip, ragged */
    for (let k = 0; k < 16; k++) { const hh = (hash(x * 16 + k, y) >> 5) % 4, h = hh === 0 ? 1 : hh < 3 ? 2 : 3; rect(g, k, 0, 1, h, Z.moss[hh === 3 ? 2 : hh === 0 ? 0 : 1]); if (h >= 2) px2(g, k, 0, Z.moss[2]); }
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 2) | 0), r() < 0.5 ? Z.s[5] : Z.moss[1]);
    /* roots fibres hanging from the bark under the lip */
    for (let k = 0; k < 4; k++) { const fx = 1 + ((r() * 14) | 0), fl = 2 + ((r() * 5) | 0); for (let yy = 0; yy < fl; yy++) px2(g, fx, 5 + yy, yy === fl - 1 ? Z.s[1] : Z.s[2]); px2(g, fx + 1, 5, Z.s[4]); }
    if (r() < 0.22) knot(g, zone, 3 + ((r() * 10) | 0), 9 + ((r() * 3) | 0), 2);
    if (eL) { rect(g, 0, 3, 1, 13, Z.s[5]); px2(g, 0, 2, Z.s[6]); }                                                                    /* the lit corner */
    if (eR) { rect(g, 15, 2, 1, 14, Z.s[0]); px2(g, 15, 1, Z.s[2]); }
    deepTint(g, y);
    return c; });
}
/* ============================ FACE: ridged bark running up the wall ============================ */
function faceTile(zone, x, y, eL, eR) {
  return once('fc' + zone + '_' + (x & 7) + '_' + y + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y) + zone * 47), Z = ZONE[zone];
    barkFill(g, zone, x, y, eL ? 3 : 2, !!eL);
    /* the split lines of the bark: dark furrows, a pale rib beside each, broken */
    for (const fx of [2 + ((r() * 4) | 0), 9 + ((r() * 5) | 0)]) { const len = 5 + ((r() * 9) | 0), y0 = (r() * (16 - len)) | 0; for (let yy = y0; yy < y0 + len; yy++) { px2(g, fx, yy, Z.s[0]); px2(g, fx + 1, yy, eL ? Z.s[5] : Z.s[3]); } }
    if (r() < 0.3) knot(g, zone, 4 + ((r() * 8) | 0), 4 + ((r() * 8) | 0), 2 + ((r() * 2) | 0));
    if (zone === 2 && (hash(x, y) % 9) === 0) { rect(g, 6, 5, 4, 3, Z.s[2]); rect(g, 6, 5, 4, 1, Z.s[5]); rect(g, 5, 6, 6, 1, Z.cord); }                  /* a goblin peg driven in, a turn of cord on it */
    if (zone === 4 && (hash(x, y) % 7) === 0) { const ax = 3 + (hash(y, x) % 9); rect(g, ax, 4, 1, 5, '#e8dcc0'); px2(g, ax, 3, '#c9a060'); px2(g, ax - 1, 9, Z.s[0]); px2(g, ax + 1, 9, Z.s[0]); }   /* an old arrow in the heartwood */
    if (eL) { rect(g, 0, 0, 1, 16, Z.s[6]); rect(g, 1, 0, 1, 16, Z.s[5]); }
    if (eR) { rect(g, 15, 0, 1, 16, Z.s[0]); rect(g, 14, 0, 1, 16, Z.s[1]); g.globalAlpha = 0.2; rect(g, 11, 0, 3, 16, '#000'); g.globalAlpha = 1; }
    deepTint(g, y);
    return c; });
}
/* ============================ CEIL: the underside of a bough, root hair hanging ============================ */
function ceilTile(zone, x, y, eL, eR) {
  return once('ce' + zone + '_' + (x & 7) + '_' + y + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y) + zone * 53), Z = ZONE[zone];
    barkFill(g, zone, x, y, 2, false);
    g.globalAlpha = 0.5; rect(g, 0, 9, 16, 7, '#000'); g.globalAlpha = 0.28; rect(g, 0, 5, 16, 4, '#000'); g.globalAlpha = 1;
    for (let k = 0; k < 5; k++) { const nx = (r() * 15) | 0, nl = 1 + ((r() * 3) | 0); rect(g, nx, 15 - nl, 1, nl, Z.s[2]); px2(g, nx, 15, Z.s[0]); }
    rect(g, 0, 15, 16, 1, Z.s[0]); if (eL) rect(g, 0, 0, 1, 16, Z.s[5]); if (eR) rect(g, 15, 0, 1, 16, Z.s[0]);
    deepTint(g, y);
    return c; });
}
/* ============================ MASS: packed roots, the long veins of them ============================ */
function massTile(zone, x, y, d) {
  return once('ma' + zone + '_' + (x & 7) + '_' + y + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y) + 41 + zone), Z = ZONE[zone];
    barkFill(g, zone, x, y, d <= 1 ? 2 : 1, false);
    g.globalAlpha = [0, 0.05, 0.1, 0.14, 0.18, 0.21, 0.24][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#080410'); g.globalAlpha = 1;
    /* a root runs through: a curved vein, thick in the middle */
    if ((hash(x >> 1, y) % 3) === 0) { const y0 = 3 + ((r() * 9) | 0), sl = r() < 0.5 ? -1 : 1; for (let k = 0; k < 16; k++) { const yy = y0 + Math.round(sl * Math.sin(k / 16 * Math.PI) * 3); px2(g, k, yy, Z.s[3]); px2(g, k, yy + 1, Z.s[1]); px2(g, k, yy - 1, Z.s[2]); } }
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? Z.s[1] : Z.s[3]);
    deepTint(g, y, 1.15);
    return c; });
}

/* ============================ LASHED TIMBER (the ledges, the shelves, the spans) ============================ */
function timber(zone, l, rr, v) {
  return once('ti' + zone + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 17 + zone), Z = ZONE[zone];
    /* a bark-on log laid along: the planed top lit, a shaded round belly, the ragged underside */
    rect(g, 0, 0, 16, 6, Z.s[3]); rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 1, 16, 1, Z.s[5]); rect(g, 0, 2, 16, 2, Z.s[4]); rect(g, 0, 5, 16, 1, Z.s[2]);
    rect(g, 0, 6, 16, 2, Z.s[1]); rect(g, 0, 8, 16, 1, Z.s[0]);
    for (let i = 0; i < 6; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 4) | 0), r() < 0.5 ? Z.s[2] : Z.s[5]);                              /* the grain along the log */
    for (let k = 1; k < 16; k += 3) px2(g, k, 9 + (k & 1), Z.s[0]);                                                                    /* the ragged bark below */
    if (v === 0) knot(g, zone, 11, 3, 1);
    /* the lashing: a wrap of cord every so often, two turns and a knot, dark in the cracks */
    if (v !== 1) { for (const lx of v === 2 ? [3, 11] : [6]) { rect(g, lx, 0, 3, 8, Z.cord); rect(g, lx, 0, 3, 1, '#f0e0b0'); px2(g, lx + 1, 2, Z.s[0]); px2(g, lx + 1, 4, Z.s[0]); px2(g, lx + 1, 6, Z.s[0]); px2(g, lx + 2, 7, Z.s[1]); rect(g, lx - 1, 7, 1, 2, Z.cord); } }
    g.globalAlpha = 0.3; rect(g, 0, 9, 16, 3, '#000'); g.globalAlpha = 1;
    /* a ledge's own end: the log's cut face, rings in it */
    if (l) { rect(g, 0, 0, 2, 8, Z.s[5]); rect(g, 1, 1, 1, 6, Z.s[3]); px2(g, 0, 3, Z.s[0]); } if (rr) { rect(g, 14, 0, 2, 8, Z.s[2]); px2(g, 15, 3, Z.s[0]); px2(g, 14, 4, Z.s[4]); }
    /* a little moss or leaf on the lip */
    for (let k = 0; k < 16; k++) if (((hash(k + x0of(v), zone) >> 5) % 5) === 0) px2(g, k, -0, Z.moss[1]);
    return c; });
}
const x0of = v => v * 3;

export const timberTile = (zone, l, r, v) => timber(zone, l, r, v);   /* a landed span's cells are not in the tile sheet (cellSet clears them), so the world draws them (src/redraw/rootway_world.js drawLandedSpan) */
// ================================ THE HOOK ================================
export function rootTile(t, x, y, at, T, L) {
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET; };
  const zone = zoneOf(x);
  if (t === T.ONEWAY) {
    const same = k => at(x + k, y) === t, l = !same(-1), r = !same(1), v = ((x * 5 + y) % 3 + 3) % 3;
    return timber(zone, l, r, v);
  }
  if (t !== T.SOLID) return null;
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  if (up) return topTile(zone, x, y, eL, eR);
  if (down) return ceilTile(zone, x, y, eL, eR);
  if (eL || eR) return faceTile(zone, x, y, eL, eR);
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } }
  return massTile(zone, x, y, d);
}
