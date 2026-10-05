// underwell_tiles.js - THE UNDERWELL's own TILE KIT (claude/underwellart): the dry cistern's cut stone. It used to wear the desert's red sandstone.
//   FLOORS      flagstone slabs with a lit lip, silt blown into the joints; where a seep runs over the floor the slab is OIL-STAINED (black, a sheen, drips down the joints);
//               the sump's floor (L.sand) is a silt crest, the exam's worm bed too
//   WALLS       coursed ashlar (the well's lining is small cut limestone, the works are banded with riveted iron, the Queen's hall is big dressed blocks)
//   CEILINGS    brick vaults in running bond, a damp-darkened underside, limescale nubs where the water used to drip
//   MASS        behind the lining (two courses deep) raw dark rock, darker the deeper
//   LEDGES      stone slabs on corbels (the well, the hall, the sump shelf, the Queen's hall) / riveted iron grating (the oil works, the lamp stair)
//   ROPES       hemp rope, a knot every fourth row, tied off to an iron ring
// Made from px.js primitives, 16x16, baked once and memoised.   wellTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
// The rules (the canalart / redgorge rules): a wall mass is darker than the floor on it; every standable top has a lit lip; the oil is the darkest, glossiest thing in the level.
import { canvas, px, rect, mulberry } from '../px.js';

/* the palette: STONE (cool grey-tan limestone), BRICK (the vaults), SILT (blown dust), OIL (black with a violet and a teal sheen), IRON, BRASS */
export const UC = {
  s0: '#0e0c0b', s1: '#1b1816', s2: '#2a2522', s3: '#3b342e', s4: '#4f463d', s5: '#6a5e50', s6: '#8a7c68', s7: '#a89a82',
  b0: '#1a0d0b', b1: '#2c1611', b2: '#47271b', b3: '#653a26', b4: '#84502f', mort: '#0e0807',
  si0: '#4c3a28', si1: '#6e5538', si2: '#927650', si3: '#b4966a', si4: '#d2b888', si5: '#e8d4a4',
  o0: '#06050a', o1: '#100c18', o2: '#1c1428', o3: '#2e2144', o4: '#5a4686', o5: '#4aa89a', o6: '#9a78d8',
  i0: '#15151a', i1: '#25252d', i2: '#3a3a44', i3: '#585866', i4: '#82828f', i5: '#b4b4c0',
  br0: '#3c2a08', br1: '#6c4a10', br2: '#a4742a', br3: '#d8a444', br4: '#fcdc84',
  h0: '#3a2a16', h1: '#5c4426', h2: '#82643a', h3: '#a68652', h4: '#c8aa72', hd: '#241a0e', lime: '#8c8672', lime2: '#b8b29a' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const mix = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const q = (s) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t); return '#' + [16, 8, 0].map(s => q(s).toString(16).padStart(2, '0')).join(''); };

/* WHICH PART OF THE CISTERN: 0 the dry well, 1 the brood hall, 2 the oil works, 3 the silted sump, 4 the lamp stair, 5 the Queen's cistern */
export const zoneOf = x => x < 45 ? 0 : x < 141 ? 1 : x < 244 ? 2 : x < 351 ? 3 : x < 452 ? 4 : 5;
const STONE_BY_ZONE = [
  { a: UC.s4, b: UC.s3, c: UC.s5, d: UC.s2, e: UC.s6 },                 /* the well: warm cut limestone */
  { a: UC.s3, b: UC.s2, c: UC.s4, d: UC.s1, e: UC.s5 },                 /* the hall: grey */
  { a: UC.s3, b: UC.s2, c: UC.s4, d: UC.s1, e: UC.s5 },                 /* the works */
  { a: mix(UC.s3, UC.si1, 0.28), b: mix(UC.s2, UC.si0, 0.3), c: mix(UC.s4, UC.si2, 0.25), d: UC.s1, e: mix(UC.s5, UC.si3, 0.3) },   /* the sump: silt-grimed */
  { a: UC.s3, b: UC.s2, c: UC.s4, d: UC.s1, e: UC.s5 },
  { a: UC.s2, b: UC.s1, c: UC.s3, d: UC.s0, e: UC.s4 }];               /* the Queen's hall: darkest, grandest */

/* ============================ FLOOR: flagstone, silt in the joints; oil-stained; or a silt crest ============================ */
function floorTile(x, y, zone, oil, silt, leftOpen, rightOpen) {
  return once('fl' + (x & 3) + '_' + (y & 3) + zone + (oil ? 'o' : '') + (silt ? 's' : '') + (leftOpen ? 'l' : '') + (rightOpen ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, y & 3) + zone * 17 + 5), S = STONE_BY_ZONE[zone];
    rect(g, 0, 0, 16, 16, S.b);
    if (silt) {   /* THE SILT CREST: a dune's top, wavy, lit, then packed silt, then the stone it lies on */
      for (let px_ = 0; px_ < 16; px_++) { const gx = (x & 3) * 16 + px_, w = Math.round(Math.sin(gx * 0.42 + y) * 1 + Math.sin(gx * 0.17) * 1);
        const top = 1 + w + 1; rect(g, px_, 0, 1, top, S.d);
        rect(g, px_, top, 1, 1, UC.si5); rect(g, px_, top + 1, 1, 2, UC.si4); rect(g, px_, top + 3, 1, 3, UC.si3); rect(g, px_, top + 6, 1, 3, UC.si2); rect(g, px_, top + 9, 1, 8, UC.si1); }
      for (let i = 0; i < 9; i++) px2(g, (r() * 16) | 0, 4 + ((r() * 11) | 0), r() < 0.5 ? UC.si0 : UC.si4);
      for (let i = 0; i < 3; i++) { const sx = (r() * 13) | 0, sy = 8 + ((r() * 6) | 0); rect(g, sx, sy, 2, 1, UC.s4); px2(g, sx, sy - 1, UC.s5); }   /* pebbles */
      for (let k = 0; k < 16; k += 3) px2(g, k, 13 + ((k * 7 + x) & 1), UC.si0);
      return c; }
    /* first course (rows 0-7): a slab 16 wide or two, joints at hashed columns */
    const j1 = 3 + ((r() * 9) | 0), twoSlabs = r() < 0.55;
    rect(g, 0, 0, 16, 1, S.e); rect(g, 0, 1, 16, 1, S.c);                                   /* the lit lip */
    rect(g, 0, 2, 16, 5, S.a); rect(g, 0, 7, 16, 1, S.d);                                    /* the slab and the joint under it */
    if (twoSlabs) { rect(g, j1, 1, 1, 7, S.d); px2(g, j1 + 1, 1, S.e); }
    rect(g, 0, 8, 16, 7, S.b); rect(g, 0, 8, 16, 1, S.c); rect(g, 0, 15, 16, 1, S.d);        /* second course, a half step darker */
    const j2 = (j1 + 8) % 16; rect(g, j2, 8, 1, 7, S.d);
    for (let i = 0; i < 12; i++) px2(g, (r() * 16) | 0, 2 + ((r() * 12) | 0), r() < 0.5 ? S.d : S.c);   /* grain */
    if (r() < 0.5) { let cx = 2 + ((r() * 12) | 0); for (let yy = 2; yy < 8; yy++) { px2(g, cx, yy, S.d); if (r() < 0.45) cx += r() < 0.5 ? -1 : 1; } }   /* a crack */
    for (let i = 0; i < 6; i++) { const sx = (r() * 16) | 0; px2(g, sx, 1, UC.si3); if (r() < 0.5) px2(g, sx, 0, UC.si4); }   /* silt blown into the lip */
    px2(g, j1, 7, UC.si2); px2(g, j2, 14, UC.si1);
    if (leftOpen) { rect(g, 0, 1, 1, 14, S.d); px2(g, 0, 0, S.c); } if (rightOpen) { rect(g, 15, 2, 1, 13, S.c); }
    if (oil) {   /* OIL-STAINED: the film on the slab, black with a sheen, and its drips down the joints */
      rect(g, 0, 0, 16, 3, UC.o1); rect(g, 0, 0, 16, 1, UC.o3); rect(g, 0, 3, 16, 1, UC.o0);
      for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 2) | 0), r() < 0.5 ? UC.o4 : UC.o5);
      const drips = 2 + ((r() * 2) | 0); for (let d = 0; d < drips; d++) { const dx = (r() * 15) | 0, len = 3 + ((r() * 8) | 0); for (let k = 3; k < 3 + len; k++) { px2(g, dx, k, k > 2 + len - 2 ? UC.o2 : UC.o1); } }
      for (let i = 0; i < 18; i++) px2(g, (r() * 16) | 0, 3 + ((r() * 8) | 0), r() < 0.5 ? mix(S.a, UC.o1, 0.55) : mix(S.b, UC.o1, 0.6));
    }
    return c; });
}

/* ============================ CEILING: brick vault in running bond, damp underside ============================ */
function ceilTile(x, y, zone, edgeL, edgeR) {
  return once('ce' + (x & 3) + '_' + (y & 3) + zone + (edgeL ? 'l' : '') + (edgeR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, y & 3) + zone * 29 + 9), S = STONE_BY_ZONE[zone];
    const brick = zone === 1 || zone === 4 || zone === 5 || zone === 3;
    if (!brick) {   /* the well's / works' ceiling: ashlar, lighter lintel course at the bottom */
      rect(g, 0, 0, 16, 16, S.b); rect(g, 0, 7, 16, 1, S.d); rect(g, ((hash(x, y) % 9) + 3), 0, 1, 7, S.d); rect(g, ((hash(x, y + 5) % 9) + 3), 8, 1, 7, S.d);
      rect(g, 0, 11, 16, 5, S.a); rect(g, 0, 11, 16, 1, S.d);
    } else {
      rect(g, 0, 0, 16, 16, UC.mort);
      for (let row = 0; row < 4; row++) { const off = ((y * 4 + row) & 1) ? 4 : 0; for (let bx = -8; bx < 16; bx += 8) { const xx = bx + off, t = r();
        const col = zone === 5 ? (t < 0.3 ? UC.s3 : t < 0.7 ? UC.s2 : UC.s1) : (t < 0.2 ? UC.b4 : t < 0.55 ? UC.b3 : t < 0.85 ? UC.b2 : UC.b1);
        rect(g, Math.max(0, xx + 1), row * 4, Math.min(16, xx + 8) - Math.max(0, xx + 1) - (xx + 8 > 16 ? 0 : 0), 3, col);
        rect(g, Math.max(0, xx + 1), row * 4, Math.min(16, xx + 8) - Math.max(0, xx + 1), 1, zone === 5 ? UC.s4 : UC.b4); } }
    }
    g.globalAlpha = 0.5; rect(g, 0, 9, 16, 7, '#000'); g.globalAlpha = 0.3; rect(g, 0, 5, 16, 4, '#000'); g.globalAlpha = 1;   /* the underside is damp and dark */
    rect(g, 0, 14, 16, 2, UC.s0);
    for (let i = 0; i < 2; i++) { const nx = 2 + ((r() * 12) | 0), nl = 2 + ((r() * 3) | 0); rect(g, nx, 15 - 1, 1, 1, UC.lime); if (nl > 2) px2(g, nx, 16 - 1, UC.lime2); }
    if (edgeL) rect(g, 0, 0, 1, 16, UC.s0); if (edgeR) rect(g, 15, 0, 1, 16, UC.s0);
    return c; });
}

/* ============================ WALL FACE: coursed ashlar ============================ */
function wallTile(x, y, zone, eL, eR, iron, dim = 0) {
  return once('wa' + (x % 6) + '_' + (y & 7) + zone + (eL ? 'l' : '') + (eR ? 'r' : '') + (iron ? 'i' : '') + dim, () => {
    const [c, g] = canvas(16, 16), S = STONE_BY_ZONE[zone];
    if (zone === 5) {   /* the Queen's hall: ONE big dressed block a tile, chamfered, running bond */
      const r = mulberry(hash(x, y) + 3), off = (y & 1) ? 8 : 0; rect(g, 0, 0, 16, 16, UC.s0);
      for (let bx = -16; bx < 16; bx += 16) { const xx = bx + off, t = r(); const col = t < 0.25 ? S.c : t < 0.7 ? S.a : S.b;
        rect(g, Math.max(0, xx + 1), 1, Math.min(16, xx + 16) - Math.max(0, xx + 1) - 1, 14, col);
        rect(g, Math.max(0, xx + 1), 1, Math.min(16, xx + 16) - Math.max(0, xx + 1) - 1, 1, S.e); rect(g, Math.max(0, xx + 1), 14, Math.min(16, xx + 16) - Math.max(0, xx + 1) - 1, 1, S.d);
        for (let i = 0; i < 5; i++) px2(g, Math.max(0, xx) + ((r() * 14) | 0), 3 + ((r() * 10) | 0), r() < 0.5 ? S.d : S.e); }
    } else if (zone === 0) {   /* the well's lining: small cut limestone, four courses of 4 */
      const r = mulberry(hash(x % 5, y & 7) + 1); rect(g, 0, 0, 16, 16, UC.s1);
      for (let row = 0; row < 4; row++) { const off = (((y * 4 + row) * 5) % 8); for (let bx = -8; bx < 16; bx += 8) { const xx = bx + off, t = r(); const col = t < 0.2 ? S.e : t < 0.55 ? S.c : t < 0.85 ? S.a : S.b;
        const l = Math.max(0, xx + 1), rr = Math.min(16, xx + 8); if (rr > l) { rect(g, l, row * 4, rr - l, 3, col); rect(g, l, row * 4, rr - l, 1, S.e); } } }
    } else {   /* ashlar: two courses of 8, blocks 16 wide, offset on alternate courses */
      const r = mulberry(hash(x % 7, y & 7) + zone), base = (y * 2);
      rect(g, 0, 0, 16, 16, UC.s0);
      for (let row = 0; row < 2; row++) { const off = (((base + row) * 5) & 1) ? 8 : ((base + row) % 3) * 2; for (let bx = -16; bx < 16; bx += 16) { const xx = bx + off, t = r(); const col = t < 0.2 ? S.c : t < 0.65 ? S.a : S.b;
        const l = Math.max(0, xx + 1), rr = Math.min(16, xx + 16); if (rr > l) { rect(g, l, row * 8 + 1, rr - l, 6, col); rect(g, l, row * 8 + 1, rr - l, 1, S.e); rect(g, l, row * 8 + 6, rr - l, 1, S.d);
          for (let i = 0; i < 4; i++) px2(g, l + ((r() * (rr - l)) | 0), row * 8 + 2 + ((r() * 4) | 0), r() < 0.5 ? S.d : S.e); } } }
    }
    if (zone === 3) { const r = mulberry(hash(x, y)); for (let i = 0; i < 8; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, UC.si1); rect(g, 0, 15, 16, 1, UC.si0); }   /* silt in the joints and the courses */
    if (iron) {   /* THE WORKS' BAND: a riveted iron strap across the wall */
      rect(g, 0, 5, 16, 5, UC.i1); rect(g, 0, 5, 16, 1, UC.i4); rect(g, 0, 6, 16, 1, UC.i3); rect(g, 0, 9, 16, 1, UC.i0);
      for (const rx of [2, 7, 12]) { px2(g, rx, 7, UC.i5); px2(g, rx + 1, 8, UC.i0); }
      g.globalAlpha = 0.2; rect(g, 0, 10, 16, 2, '#000'); g.globalAlpha = 1; }
    if (dim) { g.globalAlpha = [0, 0.14, 0.28, 0.4, 0.5, 0.58][dim]; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; }
    if (eL) { rect(g, 0, 0, 1, 16, UC.s0); g.globalAlpha = 0.3; rect(g, 1, 0, 2, 16, '#000'); g.globalAlpha = 1; }
    if (eR) { rect(g, 15, 0, 1, 16, UC.s0); rect(g, 14, 0, 1, 16, S.e); g.globalAlpha = 0.18; rect(g, 12, 0, 2, 16, S.e); g.globalAlpha = 1; }
    return c; });
}

/* ============================ MASS: raw dark rock behind the masonry ============================ */
function massTile(x, y, d, zone) {
  return once('ma' + (x & 7) + '_' + (y & 7) + d + (zone === 3 ? 's' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + 41), k = d <= 2 ? 0 : d === 3 ? 1 : 2;
    const base = [UC.s1, '#161312', '#0f0d0c'][k], hi = [UC.s2, UC.s1, '#1a1715'][k], lo = [UC.s0, '#0c0a09', '#090808'][k];
    rect(g, 0, 0, 16, 16, base);
    let yy = 0; while (yy < 16) { const th = 3 + ((r() * 4) | 0); rect(g, 0, yy, 16, 1, lo); if (r() < 0.7) rect(g, 0, yy + 1, 16, 1, hi); yy += th; }
    for (let i = 0; i < 12; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? lo : hi);
    return c; });
}

/* ============================ LEDGES ============================ */
function slab(l, rr, v) {
  return once('sl' + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 7 + 3);
    rect(g, 0, 0, 16, 6, UC.s4); rect(g, 0, 0, 16, 1, UC.s7); rect(g, 0, 1, 16, 1, UC.s6); rect(g, 0, 2, 16, 1, UC.s5);
    rect(g, 0, 5, 16, 1, UC.s2); rect(g, 0, 6, 16, 2, UC.s2); rect(g, 0, 8, 16, 1, UC.s0);
    for (let x = 0; x < 16; x++) { const d = (r() * 3) | 0; if (d) px2(g, x, 8 + (d - 1), UC.s1); }                      /* the ragged underside */
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, 2 + ((r() * 3) | 0), r() < 0.5 ? UC.s3 : UC.s6);
    for (let i = 0; i < 3; i++) px2(g, (r() * 16) | 0, 0, UC.si4);                                                          /* silt on the lip */
    if (v === 0) rect(g, 8, 1, 1, 5, UC.s2);                                                                                /* a joint */
    if (l) { rect(g, 0, 1, 1, 7, UC.s2); px2(g, 0, 0, UC.s5); } if (rr) { rect(g, 15, 1, 1, 7, UC.s2); px2(g, 15, 0, UC.s6); }
    g.globalAlpha = 0.35; rect(g, 0, 9, 16, 3, '#000'); g.globalAlpha = 1;
    return c; });
}
function grate(l, rr, v) {
  return once('gr' + (l ? 'l' : '') + (rr ? 'r' : '') + (v & 1), () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 1, UC.i5); rect(g, 0, 1, 16, 1, UC.i3);                                                               /* the lit rail */
    rect(g, 0, 2, 16, 3, UC.i0);                                                                                           /* the grating's body: dark between the bars */
    for (let x = 1 + (v & 1); x < 16; x += 3) { rect(g, x, 2, 1, 3, UC.i3); px2(g, x, 2, UC.i4); }                             /* the bars */
    rect(g, 0, 5, 16, 2, UC.i2); rect(g, 0, 5, 16, 1, UC.i3); rect(g, 0, 7, 16, 1, UC.i0);                                   /* the lower rail */
    for (const rx of [3, 11]) { px2(g, rx, 5, UC.i5); px2(g, rx, 6, UC.i1); }                                              /* rivets */
    rect(g, 0, 8, 16, 1, UC.s0); g.globalAlpha = 0.4; rect(g, 0, 8, 16, 3, '#000'); g.globalAlpha = 1;
    for (let x = 2; x < 16; x += 5) px2(g, x, 9 + (x & 1), UC.i1);                                                          /* dripping rust */
    if (l) { rect(g, 0, 0, 2, 8, UC.i2); px2(g, 0, 0, UC.i5); px2(g, 1, 3, UC.i5); } if (rr) { rect(g, 14, 0, 2, 8, UC.i2); px2(g, 15, 0, UC.i5); px2(g, 14, 3, UC.i5); }
    return c; });
}

/* ============================ ROPE ============================ */
function ropeTile(y, endTop, endBot) {
  return once('rp' + (y & 3) + endTop + endBot, () => { const [c, g] = canvas(16, 16), k = (y & 3) === 0;
    for (let yy = 0; yy < 16; yy++) { const t = ((yy + (y & 3) * 4) >> 1) & 1; rect(g, 6, yy, 4, 1, UC.hd); px2(g, 6 + (t ? 0 : 2), yy, UC.h3); px2(g, 7 + (t ? 0 : 1), yy, UC.h4); px2(g, 9, yy, UC.h0); }
    if (k) { rect(g, 4, 6, 8, 5, UC.h2); rect(g, 4, 6, 8, 1, UC.h4); rect(g, 4, 10, 8, 1, UC.h0); rect(g, 3, 7, 10, 1, UC.hd); for (let x = 5; x < 12; x += 2) px2(g, x, 8, UC.hd); px2(g, 5, 7, UC.h4); }
    if (endBot) { px2(g, 5, 15, UC.h3); px2(g, 10, 15, UC.h3); px2(g, 6, 14, UC.h4); px2(g, 9, 14, UC.h4); }
    if (endTop) { rect(g, 4, 0, 8, 2, UC.i1); rect(g, 5, 2, 6, 1, UC.i2); rect(g, 6, 3, 4, 1, UC.i3); px2(g, 5, 0, UC.i5); rect(g, 7, 0, 2, 2, UC.i0); }   /* an iron ring in a bracket */
    return c; });
}

// ================================ THE HOOK ================================
export function wellTile(t, x, y, at, T, L) {
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET; };
  const zone = zoneOf(x);
  if (t === T.NET) return ropeTile(y, at(x, y - 1) !== T.NET && at(x, y - 1) !== T.SOLID, at(x, y + 1) !== T.NET);
  if (t === T.ONEWAY) {
    const same = k => at(x + k, y) === t, l = !same(-1), r = !same(1);
    const iron = zone === 2 || zone === 4 && x < 440;
    return iron ? grate(l, r, x) : slab(l, r, ((x * 5 + y) % 3 + 3) % 3);
  }
  if (t !== T.SOLID) return null;
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  const sand = (L.sand || []).some(([x0, x1, row]) => row === y && x >= x0 && x <= x1);
  if (up) {
    const oil = (L.seeps || []).some(([x0, x1, row]) => row === y - 1 && x >= x0 && x <= x1);
    return floorTile(x, y, zone, oil, sand, eL, eR);
  }
  if (down) return ceilTile(x, y, zone, eL, eR);
  if (eL || eR) return wallTile(x, y, zone, eL, eR, zone === 2 && (y % 6) === 0);
  /* inside the masonry or behind it: how far to the nearest open air */
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } }
  if (d <= 5) return wallTile(x, y, zone, false, false, false, d - 1);
  return massTile(x, y, d, zone);
}
