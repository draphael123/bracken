// hornets_nest_tiles.js - THE HORNET'S NEST's TILE KIT (claude/hornetsnestart, SONNET over the greybox claude/hornetsnest). ART ONLY: the grid is read for how a cell is DRAWN, never changed.
//   PAPER   the nest's walls and floors: a wasp's chewed-wood paper laid in overlapping scalloped shells (parchment at the gate, ochre in the comb stair, red-brown at the brood),
//           honeycomb showing through where the paper is torn, a honey-lit rim on every exposed face, drips under a ceiling
//   COMB    every footing the hornets built: a gold hex-cell slab (shelves, perches, the falling nest's ledges - cracked), fresh WAX (the sticky floors: glossy, pale, beaded)
//   BARK    the ancient pine: its buttress roots, the trunk the nest hangs from (plated bark, deep furrows, resin), the boughs (a limb with needle clusters)
//   DUFF    the forest floor: a litter of pine needles over dark earth, and the nest's shadow floor (darker, mushroomed with old paper)
// Made from px.js primitives, 16x16, baked lazily and memoised.   hnTile(t, x, y, at, T, L) -> a canvas for one cell, or null (the game's own kit draws it)
import { canvas } from '../px.js';
import { mudTile } from './hornets_nest_edge.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h ^ (h >>> 16); };
const rnd = (a, b, m) => (hash(a, b) >>> 0) % m;
const tile = fn => { const [c, g] = canvas(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const col = fn(x, y); if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } } return c; };
export const PAPER = [
  ['#201a14', '#352c20', '#4f4230', '#6c5b44', '#8a7760', '#aa9878'],   /* THE PAPER GATE: grey parchment */
  ['#241810', '#3c2a18', '#5a3f22', '#7a5a2e', '#9a7a3e', '#bc9a56'],   /* THE COMB STAIR: ochre */
  ['#2a1410', '#45221a', '#643424', '#85472f', '#a65e3e', '#c88056'],   /* THE BROOD: red-brown */
];
export const COMB = ['#2e1c08', '#6a4410', '#a8741e', '#e0a838', '#f6cc5c', '#fff1a0'];   /* dark seam, shade, body, lit, bright, glint */
export const WAX = ['#8a6420', '#c8962c', '#ecc258', '#fbe38c', '#fff6c8'];                 /* fresh wax: shade .. bead */
export const BARK = ['#130d0a', '#221812', '#37271c', '#523a28', '#6f4f34', '#8e6a46'];
export const NEEDLE = ['#222f10', '#38491a', '#506a26', '#728c34', '#9eb44c'];
export const DRY = ['#5a3c1c', '#7c5a2a', '#a07e3c'];
export const EARTH = ['#18120e', '#261c14', '#382a1c', '#503c26', '#6a5232'];
const zoneP = x => x < 169 ? 0 : x < 248 ? 1 : 2;
const FEET = (at, T, x, y) => { const f = v => v === T.SOLID || v === T.ONEWAY; return f(at(x, y + 1)); };
/* the pieces of the level the art reads (the level's own layout, src/hornets-nest.js) */
const inNest = (x, y) => x >= 80 && x <= 332 && y <= 51;
const inTrunk = (x, y) => x >= 347 && x <= 352 && y < 60;
const inBough = (x, y) => x >= 370 && x <= 382 && y === 62;
export const isNestCell = inNest, isTrunkCell = inTrunk;

/* a honeycomb lattice: 6 wide, 4 tall per course, every other course shifted 3. -> 0 outside, 1 wall, 2 cell floor, 3 cell highlight */
function hexAt(u, v) { const row = Math.floor(v / 4), cu = (((u + (row & 1) * 3) % 6) + 6) % 6, cv = ((v % 4) + 4) % 4;
  if (cv === 0) return cu >= 1 && cu <= 4 ? 1 : 0; if (cv === 3) return cu === 0 || cu === 5 ? 1 : 2; if (cu === 0 || cu === 5) return 1; return cu === 1 && cv === 1 ? 3 : 2; }

/* ===================== PAPER: the shell wall / floor / ceiling ===================== */
function paperTile(x, y, at, T, L) {
  const up = at(x, y - 1), dn = at(x, y + 1), lf = at(x - 1, y), rt = at(x + 1, y);
  const open = v => v === T.AIR || v === T.ONEWAY || v === T.SPIKE;
  const eU = open(up), eD = open(dn), eL = open(lf), eR = open(rt), zi = zoneP(x), wx = L._hnWax && L._hnWax.has(y * L.W + x);
  const outer = (x === 80 && eL) || (x === 332 && eR);                                  /* the nest's outside face (from the forest / the falling nest's shaft) */
  const key = 'pa' + zi + '_' + (x & 7) + '_' + (y & 7) + (eU ? 'u' : '') + (eD ? 'd' : '') + (eL ? 'l' : '') + (eR ? 'r' : '') + (wx ? 'w' : '') + (outer ? 'o' : '');
  return once(key, () => tile((px, py) => {
    const P = PAPER[outer ? 0 : zi], u = x * 16 + px, v = y * 16 + py;
    /* the exposed floor: a comb floor (gold hex cells, a lit lip), or fresh wax on a waxed run */
    if (eU && py < 5) { if (wx) return waxTop(u, py, eL && px < 1, eR && px > 14);
      if (eL && px === 0 || eR && px === 15) return py < 1 ? null : COMB[0];
      if (py === 0) return rnd(u, 7, 6) === 0 ? COMB[5] : COMB[4];
      const h = hexAt(u, v); return h === 1 ? COMB[1] : h === 3 ? COMB[4] : h === 2 ? (py === 1 ? COMB[4] : COMB[3]) : COMB[2]; }
    if (eU && py === 5) return COMB[0];
    /* a ceiling: the shell hangs its scalloped lip and a bead of honey */
    if (eD && py > 12) { const sc = Math.round(1.4 * Math.sin(u / 2.6)); if (py - 13 > 1 + sc) { if (py === 15 && rnd(x, y, 5) === 0 && (px === 4 || px === 11)) return COMB[3]; return null; } return py - 13 >= 1 + sc ? P[0] : P[1]; }
    /* the shells: overlapping scallops 8 high, each one lit on its top edge, dark under its lip */
    const k = Math.floor((v + 2) / 8), r = (v + 2) % 8, off = Math.round(1.3 * Math.sin((u + k * 7) / 3.1)), rr = r + off;
    let s = 2 + (hash(k, (u >> 4) + (k & 1) * 3) % 3 === 0 ? 1 : 0) + (hash(k, u >> 3) % 5 === 0 ? -1 : 0);
    if (rr >= 7) s = 0; else if (rr === 6) s = 1; else if (rr <= 1) s = Math.min(5, s + 1);
    else if (hash(u, v) % 11 === 0) s = Math.max(0, s - 1); else if (hash(u, v) % 13 === 0) s = Math.min(5, s + 1);
    if (hash(u >> 1, v >> 1) % 19 === 0 && rr > 1 && rr < 6) s = Math.min(5, s + 2);       /* a fibre of pale paper */
    /* torn paper: a hole in the shell lets the comb behind show through (a patch of cells), in the inside only */
    if (!outer && hash((x >> 1) + 3, (y >> 1) + 5) % 9 === 0) { const a = u % 32, b = v % 32; if (a > 3 && a < 28 && b > 3 && b < 28) { const h = hexAt(u, v); if (h) return h === 1 ? COMB[0] : h === 3 ? COMB[4] : COMB[2]; } }
    let col = P[s];
    if (eL && px < 2) col = px === 0 ? P[0] : P[Math.max(1, s - 1)];
    if (eR && px > 13) col = px === 15 ? P[0] : P[Math.max(1, s - 1)];
    if (eU && py < 7 && py > 4) col = P[Math.max(0, s - 2)];
    if (outer) { if (eL && px < 2) col = px === 0 ? P[1] : P[4]; }
    return col;
  }));
}
/* fresh wax: pale, glossy, sticky - a lip with beads; ends rounded */
function waxTop(u, py, endL, endR) { if (endL || endR) return py < 1 ? null : WAX[0];
  if (py === 0) return rnd(u, 3, 7) === 0 ? WAX[4] : WAX[3]; if (py === 1) return rnd(u, 5, 5) === 0 ? WAX[4] : WAX[2];
  if (py === 2) return WAX[2]; if (py === 3) return WAX[1]; if (py === 4) return rnd(u, 9, 4) === 0 ? WAX[2] : WAX[0]; return WAX[0]; }

/* ===================== COMB footing: a shelf / perch / ledge ===================== */
function combShelf(x, y, at, T, L, cracked) {
  const l = at(x - 1, y) === T.ONEWAY, r = at(x + 1, y) === T.ONEWAY, wx = L._hnWax && L._hnWax.has(y * L.W + x);
  return once('cs' + (cracked ? 'c' : '') + (wx ? 'w' : '') + (l ? 1 : 0) + (r ? 1 : 0) + (x & 3) + (y & 1), () => tile((px, py) => {
    const u = x * 16 + px, cap = !l && px < 2, capR = !r && px > 13;
    if (py > 6) { if (py === 7 && !cap && !capR && rnd(u, y, 6) === 0) return COMB[3];   /* a drip of honey under it */
      if (py === 8 && !cap && !capR && rnd(u, y, 6) === 0 && rnd(u, y, 12) < 4) return COMB[2]; return null; }
    if ((cap && (px === 0 && (py < 1 || py > 5))) || (capR && (px === 15 && (py < 1 || py > 5)))) return null;
    if (py === 6) return COMB[0];
    if (cap && px === 0 || capR && px === 15) return COMB[0];
    if (wx) { if (py === 0) return rnd(u, 3, 7) === 0 ? WAX[4] : WAX[3]; if (py === 1) return WAX[2]; if (py === 2) return WAX[1]; }
    if (py === 0) return rnd(u, 7, 6) === 0 ? COMB[5] : COMB[4];
    const h = hexAt(u, py + 1 + (y & 1) * 2); let c = h === 1 ? COMB[1] : h === 3 ? COMB[4] : h === 2 ? COMB[3] : COMB[2];
    if (py === 5) c = COMB[1];
    if (cracked) { const cr = (u * 7 + py * 3) % 23; if (cr === 0 || (cr === 11 && py > 1 && py < 5)) return COMB[0]; if (py === 5 || py === 4) c = COMB[0] === c ? c : COMB[1]; if (rnd(u, py, 9) === 0) return null; }
    return c;
  }));
}

/* ===================== BARK / DUFF: the pine and the forest floor ===================== */
function needles(g, u, py, topH) { const hh = hash(u, 11) % 9;
  if (py < 1 + (hh < 3 ? 1 : 0)) return NEEDLE[2 + (hh < 3 ? 1 : 0) + (hash(u, py) % 5 === 0 ? 1 : 0)];
  return null; }
/* the exposed top of earth or bark: a litter of needles (green and dry), a tuft, a pale glint */
function litter(u, py, wet) { const h = hash(u, 21), t = hash(u >> 1, 33) % 7;
  if (py === 0) return t === 0 ? DRY[2] : t === 1 ? NEEDLE[4] : t < 4 ? NEEDLE[3] : NEEDLE[2];
  if (py === 1) return h % 5 === 0 ? DRY[1] : h % 3 === 0 ? NEEDLE[2] : NEEDLE[1];
  if (py === 2) return h % 4 === 0 ? DRY[0] : wet ? EARTH[1] : EARTH[3]; return null; }
function earthTile(x, y, at, T, zone) {
  const eU = at(x, y - 1) !== T.SOLID, eL = at(x - 1, y) === T.AIR, eR = at(x + 1, y) === T.AIR, deep = y >= 70;
  return once('ea' + zone + (x & 7) + (y & 7) + (eU ? 'u' : '') + (eL ? 'l' : '') + (eR ? 'r' : '') + (deep ? 'd' : ''), () => tile((px, py) => {
    const u = x * 16 + px, v = y * 16 + py, dark = zone === 'duff' ? 1 : 0;
    if (eU) { const lit = litter(u, py, dark); if (lit) return lit; if (py < 3) return null; }
    if (eL && px === 0 || eR && px === 15) return EARTH[0];
    let s = 3 - dark - (deep ? 1 : 0) - (eU && py < 6 ? 0 : 0); const hh = hash(u, v);
    if (hh % 7 === 0) s--; else if (hh % 9 === 0) s++;
    if ((u * 3 + v * 5) % 29 === 0 || (u + v * 2) % 31 === 3) return EARTH[Math.max(0, s - 2)];           /* a root-thread / pebble shade */
    if (hash(u >> 2, v >> 2) % 13 === 0 && px % 4 < 3 && py % 4 < 2) return ['#7a7a6a', '#5a5a50'][(hh & 1)];   /* a stone */
    return EARTH[Math.max(0, Math.min(4, s))];
  }));
}
/* a root / buttress: plated pine bark, furrows running down, resin beads, a top of needles where it is lit */
function barkTile(x, y, at, T, big) {
  const eU = at(x, y - 1) !== T.SOLID && at(x, y - 1) !== T.CRATE, eL = at(x - 1, y) === T.AIR, eR = at(x + 1, y) === T.AIR, eD = at(x, y + 1) === T.AIR;
  return once('ba' + (big ? 'b' : 'r') + (x & 7) + (y & 7) + (eU ? 'u' : '') + (eL ? 'l' : '') + (eR ? 'r' : '') + (eD ? 'd' : ''), () => tile((px, py) => {
    const u = x * 16 + px, v = y * 16 + py;
    if (eU) { const lit = litter(u, py, 0); if (lit && py < 3) return lit; }
    if (eD && py > 13 && rnd(u, 5, 3) === 0) return null;
    if (eL && px === 0 || eR && px === 15) return BARK[0];
    /* plates: vertical ridges of varying width, each lit on its left shoulder, split by dark furrows; the plates stagger every 24 px */
    const wv = big ? 7 : 5, col = (u + (Math.floor((v + hash(Math.floor(u / wv), 3) % 24) / 24)) * 3) % wv, plate = Math.floor(u / wv);
    let s = 3; if (col === 0) s = 0; else if (col === 1) s = 4; else if (col === wv - 1) s = 2;
    const cut = (v + hash(plate, 7) % 24) % 24; if (cut === 0) s = 0; else if (cut === 1 && col > 0) s = Math.min(5, s + 1);
    if (hash(u, v) % 10 === 0) s = Math.max(1, s - 1); else if (hash(u, v) % 14 === 0) s = Math.min(5, s + 1);
    if (hash(plate, v >> 3) % 17 === 0 && col === 2 && (v & 7) < 2) return '#e8b24a';   /* a bead of resin */
    return BARK[s];
  }));
}
/* THE BOUGH: a limb of the pine (a one-way footing): a round of bark with a needle cluster along the top and under it */
function boughTile(x, y, at, T) {
  const l = at(x - 1, y) === T.ONEWAY, r = at(x + 1, y) === T.ONEWAY;
  return once('bo' + (l ? 1 : 0) + (r ? 1 : 0) + (x & 3) + (y & 3), () => tile((px, py) => {
    const u = x * 16 + px, tip = !r && px > 11, root = !l && px < 3;
    const need = (c0, c1) => (hash(u, c0) % 3 === 0 ? NEEDLE[c1 + 1] : NEEDLE[c1]);
    if (py < 4) { const h = (hash(u >> 1, 3) % 3); if (py + h > 2 && hash(u, py) % 3) return null; if (py === 3 && !(px < 14 && !tip)) return null; return py === 0 ? NEEDLE[3 + (hash(u, 9) % 3 === 0 ? 1 : 0)] : need(py, 1 + (py > 2 ? 0 : 1)); }
    if (py > 11) { if (py > 13 && hash(u, y) % 4) return null; return hash(u >> 1, 5) % 3 === 0 ? NEEDLE[0] : null; }
    const top = py === 4 ? 4 : py === 5 ? 3 : py < 9 ? 3 : py < 11 ? 2 : 1; const s = Math.max(0, top - (hash(u, py) % 6 === 0 ? 1 : 0) - ((u % 9) === 0 ? 1 : 0));
    if (tip && (py < 6 || py > 9 && hash(u, 5) % 2)) return null;
    if (root && px === 0 && (py < 5 || py > 10)) return null;
    return BARK[s];
  }));
}
/* THE PINE'S FOOT BRAMBLE: red-brown thorn briars (the falling nest's foot) */
function brambleTile(x, y) { return once('br' + (x & 3), () => tile((px, py) => {
  const u = x * 16 + px, stem = ((u * 5 + py * 3) % 11) === 0 || ((u * 3 - py * 5 + 99) % 13) === 0;
  const tx = (px + (x & 1) * 5) % 5; if (py > 10 && hash(u, 3) % 4) return BARK[1];
  if (stem && py > 2) return '#7a2a22'; if (tx === 2 && py % 5 === 1 && py > 2) return '#d8c8a8'; if (py > 12) return '#3a1812';
  return null; })); }

/* ===================== the dispatch ===================== */
export function hnTile(t, x, y, at, T, L) {
  if (!L._hnWax) { L._hnWax = new Set(); for (const [x0, x1, row] of L.wax || []) for (let xx = x0; xx <= x1; xx++) L._hnWax.add(row * L.W + xx); }
  if (t === T.SPIKE) return brambleTile(x, y);
  if (t === T.ONEWAY) {
    if (inBough(x, y) || x < 80 || x >= 354) return boughTile(x, y, at, T);
    const cr = x >= 333 && x <= 353;
    return combShelf(x, y, at, T, L, cr);
  }
  if (t !== T.SOLID) return null;
  if (inTrunk(x, y)) return barkTile(x, y, at, T, true);
  if (inNest(x, y)) return paperTile(x, y, at, T, L);
  /* below the nest: the roots / the shaft's earth / the forest floor */
  if (x < 80 || x >= 333) { if (y <= 65) return barkTile(x, y, at, T, false); if (x >= 354 && y <= 69) return mudTile(x, y, at, T, 66);   /* (claude/hornets2art) THE MARSH EDGE: the muddy bank */ return earthTile(x, y, at, T, 'floor'); }
  if (x <= 92 && y <= 65) return barkTile(x, y, at, T, false);
  if (x >= 328 && y < 66 && y >= 52 && x <= 332) return earthTile(x, y, at, T, 'duff');
  return earthTile(x, y, at, T, 'duff');
}
