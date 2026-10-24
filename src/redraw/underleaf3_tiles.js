// underleaf3_tiles.js - UNDERLEAF 3's TILE KIT (claude/underleafart). The greybox wore the shared forest's autumn dirt in every place. This is the Grandmother's ground: root-brown soil under
// leaf-litter, and it CHANGES with the area (underleaf3_pal.js): green herb-bed loam in the garden, straw-gold dust under the drying lofts, bramble-dark clay in the hedges, soot and
// cinder in the cauldron yard, mossy leaf-mould under her great leaf, a packed rush floor in her cottage.
//   SOLID    TOP   packed soil under a living lip (moss, herb tufts and tiny flowers, bramble canes in the hedges, straw in the lofts, cinder in the yard)
//            FACE  a wall of earth: crumbs, roots running down it, buried jar-shards and bones, the lit side to the left
//            CEIL  the underside, hung with roots and moss
//            MASS  packed earth with root cords, shards and bones; darker the deeper
//   ONEWAY   A DRYING BOARD: a woven rush mat on bone pegs, twine-lashed, a fringe under it (no timber: theme fit); where a VINE BRIDGE grows it is a green rope of vine with leaves
//   SPIKE    BRAMBLE STAKES: sharpened thorns of pale bone in a tangle of dark cane
//   NET      a twine ladder (rope, knots, rungs); where a VINE LADDER grows (a seed bed's wall) it is a green vine with leaves and a flower
//   PORT     A THORN HEDGE: dense bramble, canes crossing, pale thorns, ragged at its edges (src/redraw/underleaf3_world.js adds the fire when it burns)
// px.js primitives, 16x16, baked lazily, memoised.   ul3Tile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';
import { PAL, GLOW, CANDLE, zoneOf, hash, mix } from './underleaf3_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
function soilFill(g, z, x, y, base, lit) {
  const S = PAL[z].s;
  for (let py = 0; py < 16; py++) for (let pxl = 0; pxl < 16; pxl++) {
    const ax = x * 16 + pxl, ay = y * 16 + py, h = hash(ax >> 1, ay >> 1), j = (h >> 4) % 11 === 0 ? -1 : (h >> 4) % 13 === 0 ? 1 : 0;
    px2(g, pxl, py, S[Math.max(0, Math.min(6, base + j + (lit ? 1 : 0)))]); }
}
function crumb(g, r, z, n, lo = 0, hi = 16) { const S = PAL[z].s; for (let i = 0; i < n; i++) { const x = (r() * 16) | 0, y = lo + ((r() * (hi - lo)) | 0); px2(g, x, y, r() < 0.5 ? S[1] : S[4]); if (r() < 0.4) px2(g, x + 1, y, S[2]); } }
/* a shard of a broken jar buried in the earth: a pale curved fragment with a dark glaze line */
function shard(g, z, cx, cy, big) { const S = PAL[z].s, cl = ['#8a6a4a', '#b89268', '#dcc090'];
  const pts = big ? [[0, 1], [1, 0], [2, 0], [3, 1], [3, 2]] : [[0, 1], [1, 0], [2, 1]];
  for (const [dx, dy] of pts) { px2(g, cx + dx, cy + dy, cl[1]); px2(g, cx + dx, cy + dy + 1, cl[0]); }
  px2(g, cx + 1, cy, cl[2]); if (big) px2(g, cx + 2, cy, cl[2]); void S; }
/* a small bone buried in the earth */
function bone(g, cx, cy) { rect(g, cx, cy, 4, 1, '#e8dcc0'); px2(g, cx - 1, cy - 1, '#e8dcc0'); px2(g, cx - 1, cy + 1, '#e8dcc0'); px2(g, cx + 4, cy - 1, '#e8dcc0'); px2(g, cx + 4, cy + 1, '#e8dcc0'); px2(g, cx + 1, cy + 1, '#9c8c68'); }
/* a root cord running through the earth */
function rootCord(g, r, z, x0, y0, len, dx) { const S = PAL[z].s; let x = x0, y = y0; for (let i = 0; i < len; i++) { px2(g, x, y, S[5]); px2(g, x + 1, y + 1, S[1]); if (r() < 0.5) x += dx; else y++; } }
const deepA = y => y < 30 ? 0 : Math.min(0.45, (y - 30) * 0.03);
function deepTint(g, y, mul = 1) { for (let py = 0; py < 16; py++) { const a = deepA(y + py / 16) * mul; if (a < 0.01) continue; g.globalAlpha = a; rect(g, 0, py, 16, 1, '#060403'); } g.globalAlpha = 1; }

/* ============================ TOP ============================ */
function topTile(z, x, y, eL, eR) {
  return once('tp' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 31), P = PAL[z], S = P.s, F = P.fung;
    soilFill(g, z, x, y, 3, false);
    rect(g, 0, 0, 16, 3, S[4]); rect(g, 0, 3, 16, 1, S[2]); rect(g, 0, 4, 16, 1, S[1]);
    /* the living lip: moss and grass blades, ragged (taller where it is green) */
    for (let k = 0; k < 16; k++) { const hh = (hash(x * 16 + k, y) >> 5) % 4, h = hh === 0 ? 1 : hh < 3 ? 2 : 3; rect(g, k, 0, 1, h, F[hh === 3 ? 2 : hh === 0 ? 0 : 1]); if (h >= 2) px2(g, k, 0, F[2]); }
    for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 2) | 0), r() < 0.5 ? S[5] : F[1]);
    /* LEAF LITTER on the lip: a brown fallen leaf, flat, with a pale midrib */
    if (r() < 0.55) { const lx = 1 + ((r() * 11) | 0); rect(g, lx, 1, 4, 1, P.rush[1]); px2(g, lx + 1, 0, P.rush[2]); px2(g, lx + 3, 2, P.rush[0]); px2(g, lx + 2, 1, P.rush[2]); }
    /* fibrous roots hanging off the lip into the earth */
    for (let k = 0; k < 3; k++) { const fx = 1 + ((r() * 14) | 0), fl = 2 + ((r() * 5) | 0); for (let yy = 0; yy < fl; yy++) px2(g, fx, 5 + yy, yy === fl - 1 ? S[2] : S[5]); }
    /* each place's own touch */
    if (z === 0) { if (r() < 0.55) { const fx = 2 + ((r() * 12) | 0); px2(g, fx, 0, '#f0ecd0'); px2(g, fx - 1, 1, '#e8e4c4'); px2(g, fx + 1, 1, '#e8e4c4'); px2(g, fx, 1, '#e0b040'); px2(g, fx, 2, F[1]); }   /* a chamomile flower */
      if (r() < 0.3) { const fx = 2 + ((r() * 12) | 0); px2(g, fx, 0, '#b08ac0'); px2(g, fx, 1, '#8a68a0'); px2(g, fx, 2, F[1]); } }                                                                       /* a lavender spike */
    else if (z === 1) { for (let k = 0; k < 3; k++) { const sx = (r() * 16) | 0; px2(g, sx, 0, P.rush[2]); px2(g, sx, 1, P.rush[1]); px2(g, sx + 1, 0, P.rush[2]); } if (r() < 0.4) { const sx = 2 + ((r() * 12) | 0); rect(g, sx, 0, 1, 3, '#e8c868'); px2(g, sx - 1, 0, '#ecd488'); px2(g, sx + 1, 0, '#ecd488'); } }   /* straw and a seed head */
    else if (z === 2) { for (let k = 0; k < 2; k++) { let bx = (r() * 14) | 0, by = 1; for (let i = 0; i < 6; i++) { px2(g, bx, by, '#2a2418'); if (i % 3 === 1) px2(g, bx, by - 1, '#d8ceae'); bx += r() < 0.7 ? 1 : 0; by = Math.max(0, Math.min(3, by + (r() < 0.5 ? 1 : -1))); } } }   /* briar canes with a pale thorn */
    else if (z === 3) { for (let k = 0; k < 3; k++) px2(g, (r() * 16) | 0, 1, k ? '#3a2a22' : '#282018'); if (r() < 0.35) { const gx = 2 + ((r() * 12) | 0); px2(g, gx, 1, CANDLE.mid); px2(g, gx + 1, 1, CANDLE.lo); } if (r() < 0.2) px2(g, 3 + ((r() * 10) | 0), 0, GLOW.mid); }   /* soot, a cinder, a drop of brew */
    else if (z === 4) { for (let k = 0; k < 2; k++) { const gx = (r() * 16) | 0; px2(g, gx, 1, F[2]); px2(g, gx, 0, mix(F[2], '#ffffff', 0.3)); } if (r() < 0.3) px2(g, 3 + ((r() * 10) | 0), 0, GLOW.hi); }
    else { for (let k = 0; k < 4; k++) { const sx = (r() * 16) | 0; px2(g, sx, 0, P.rush[2]); px2(g, sx + 1, 1, P.rush[1]); } if (r() < 0.25) px2(g, 2 + ((r() * 12) | 0), 0, CANDLE.hi); }                                                      /* strewn rushes, a petal */
    if (r() < 0.1) shard(g, z, 2 + ((r() * 9) | 0), 8 + ((r() * 4) | 0), r() < 0.5);
    if (r() < 0.04) bone(g, 2 + ((r() * 8) | 0), 10 + ((r() * 4) | 0));
    crumb(g, r, z, 5, 6, 16);
    if (eL) { rect(g, 0, 3, 1, 13, S[5]); px2(g, 0, 2, S[6]); }
    if (eR) { rect(g, 15, 2, 1, 14, S[0]); px2(g, 15, 1, S[2]); }
    deepTint(g, y);
    return c; });
}
/* ============================ FACE ============================ */
function faceTile(z, x, y, eL, eR) {
  return once('fc' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 47), P = PAL[z], S = P.s;
    soilFill(g, z, x, y, eL ? 3 : 2, !!eL);
    for (const by of [3 + ((r() * 3) | 0), 10 + ((r() * 4) | 0)]) for (let k = 0; k < 16; k++) if (hash(k + x * 16, by) % 5 > 0) px2(g, k, by, S[eL ? 4 : 3]);
    for (const fx of [2 + ((r() * 5) | 0), 9 + ((r() * 5) | 0)]) { const len = 5 + ((r() * 9) | 0), y0 = (r() * (16 - len)) | 0; for (let yy = y0; yy < y0 + len; yy++) { px2(g, fx, yy, S[0]); px2(g, fx + 1, yy, eL ? S[5] : P.thread); } }
    if (r() < 0.2) shard(g, z, 2 + ((r() * 9) | 0), 3 + ((r() * 8) | 0), true);
    if (r() < 0.07) bone(g, 3 + ((r() * 7) | 0), 4 + ((r() * 9) | 0));
    if (z === 3 && r() < 0.5) { const gx = 2 + ((r() * 12) | 0), gy = 2 + ((r() * 12) | 0); px2(g, gx, gy, CANDLE.mid); px2(g, gx + 1, gy, CANDLE.lo); }   /* an ember in the clay */
    if (z === 4 && r() < 0.4) { const gx = 2 + ((r() * 12) | 0), gy = 2 + ((r() * 12) | 0); px2(g, gx, gy, GLOW.lo); px2(g, gx + 1, gy, GLOW.mid); }
    crumb(g, r, z, 5);
    if (eL) { rect(g, 0, 0, 1, 16, S[6]); rect(g, 1, 0, 1, 16, S[5]); }
    if (eR) { rect(g, 15, 0, 1, 16, S[0]); rect(g, 14, 0, 1, 16, S[1]); g.globalAlpha = 0.2; rect(g, 11, 0, 3, 16, '#000'); g.globalAlpha = 1; }
    deepTint(g, y);
    return c; });
}
/* ============================ CEIL ============================ */
function ceilTile(z, x, y, eL, eR) {
  return once('ce' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 53), P = PAL[z], S = P.s;
    soilFill(g, z, x, y, 2, false);
    g.globalAlpha = 0.5; rect(g, 0, 9, 16, 7, '#000'); g.globalAlpha = 0.28; rect(g, 0, 5, 16, 4, '#000'); g.globalAlpha = 1;
    for (let k = 0; k < 6; k++) { const nx = (r() * 15) | 0, nl = 1 + ((r() * 5) | 0); rect(g, nx, 15 - nl, 1, nl, S[5]); px2(g, nx, 15, S[1]); if (r() < 0.3) px2(g, nx + 1, 15 - nl, S[4]); }
    if (r() < 0.5) { const mx = 1 + ((r() * 11) | 0); rect(g, mx, 13, 4, 2, P.fung[1]); px2(g, mx + 1, 14, P.fung[2]); px2(g, mx + 2, 15, P.fung[0]); }
    rect(g, 0, 15, 16, 1, S[0]); if (eL) rect(g, 0, 0, 1, 16, S[5]); if (eR) rect(g, 15, 0, 1, 16, S[0]);
    deepTint(g, y);
    return c; });
}
/* ============================ MASS ============================ */
function massTile(z, x, y, d) {
  return once('ma' + z + '_' + (x & 7) + '_' + (y & 3) + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + 41 + z), P = PAL[z], S = P.s;
    soilFill(g, z, x, y, d <= 1 ? 2 : 1, false);
    g.globalAlpha = [0, 0.05, 0.1, 0.14, 0.18, 0.21, 0.24][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#080604'); g.globalAlpha = 1;
    /* a ROOT CORD running through the earth (dim where it is deep) */
    if ((hash(x >> 3, y) % 3) === 0) { const yl = 3 + (hash(x, y * 7) % 10), yr = 3 + (hash(x + 1, y * 7) % 10), vc = mix(S[5], S[2], Math.min(0.75, d * 0.12));
      for (let k = 0; k < 16; k++) { const yy = Math.round(yl + (yr - yl) * k / 15 + Math.sin(k * 0.9 + x) * 0.9); px2(g, k, yy, vc); if (k % 5 === 2) px2(g, k, yy + 1, mix(S[4], S[2], 0.6)); } }
    if (d <= 4 && r() < 0.1) shard(g, z, 2 + ((r() * 9) | 0), 2 + ((r() * 11) | 0), r() < 0.5);
    if (d <= 5 && r() < 0.05) bone(g, 2 + ((r() * 8) | 0), 2 + ((r() * 11) | 0));
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? S[0] : S[3]);
    deepTint(g, y, 1.15);
    return c; });
}
/* ============================ A DRYING BOARD (the one-way shelf): a woven rush mat on bone pegs ============================ */
function board(z, l, rr, v) {
  return once('bd' + z + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 17 + z), P = PAL[z], ru = P.rush;
    rect(g, 0, 0, 16, 5, ru[1]); rect(g, 0, 0, 16, 1, ru[2]); rect(g, 0, 4, 16, 1, ru[0]);
    for (let k = 0; k < 16; k++) { px2(g, k, 1 + (k % 2), (k + v) % 3 === 0 ? ru[2] : ru[1]); px2(g, k, 3 - (k % 2), (k + v) % 4 === 0 ? ru[0] : ru[1]); }   /* the weave */
    rect(g, 0, 5, 16, 1, '#2a2014'); g.globalAlpha = 0.28; rect(g, 0, 6, 16, 3, '#000'); g.globalAlpha = 1;
    /* twine lashings round the mat, a knot on each */
    for (const lx of [3 + (v & 1), 11 + (v & 1)]) { rect(g, lx, 0, 2, 5, '#cbb888'); px2(g, lx, 1, '#a8946a'); px2(g, lx + 1, 3, '#a8946a'); }
    /* a fringe under the mat: dried stem ends, and now and then a sprig of drying herb hung from it */
    for (let k = 0; k < 8; k++) { const fx = (r() * 15) | 0; px2(g, fx, 6, ru[0]); if (r() < 0.5) px2(g, fx, 7, ru[0]); }
    if (v === 2) { rect(g, 8, 6, 1, 3, '#cbb888'); rect(g, 7, 9, 3, 4, P.fung[1]); px2(g, 8, 13, P.fung[0]); px2(g, 7, 10, P.fung[2]); }
    if (z === 3 || z === 4) { if (v === 0) px2(g, 2 + ((r() * 11) | 0), 0, z === 3 ? CANDLE.hi : GLOW.hi); }
    if (l) { g.clearRect(0, 0, 3, 9); rect(g, 2, 0, 1, 1, ru[2]); rect(g, 1, 1, 2, 3, ru[1]); rect(g, 0, 2, 1, 2, ru[1]); rect(g, 0, 4, 3, 1, ru[0]); px2(g, 0, 3, '#e8dcc0'); }   /* a bone peg's end */
    if (rr) { g.clearRect(13, 0, 3, 9); rect(g, 12, 0, 1, 1, ru[2]); rect(g, 12, 1, 3, 3, ru[1]); rect(g, 15, 2, 1, 2, ru[0]); rect(g, 12, 4, 3, 1, ru[0]); px2(g, 15, 3, '#e8dcc0'); }
    return c; });
}
/* a VINE BRIDGE: a twisted green rope of vine with leaves hanging below, a flower now and then */
function vineBridge(l, rr, v) {
  return once('vb' + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 5 + 3), J = ['#2e5a1c', '#5fae3a', '#9be06a'];
    for (let k = 0; k < 16; k++) { const w = Math.round(Math.sin((k + v * 3) * 0.7) * 1); rect(g, k, 1 + w, 1, 3, k % 4 < 2 ? J[1] : J[0]); px2(g, k, 1 + w, k % 4 < 2 ? J[2] : J[1]); px2(g, k, 3 + w, J[0]); }
    for (let k = 0; k < 4; k++) { const lx = 1 + k * 4 + (v & 1), ly = 4 + ((r() * 3) | 0); rect(g, lx, ly, 3, 2, J[1]); px2(g, lx, ly, J[2]); px2(g, lx + 2, ly + 1, J[0]); px2(g, lx + 1, ly + 2, J[0]); }
    if (v === 1) { px2(g, 6, 0, '#f0ecd0'); px2(g, 5, 1, '#f0ecd0'); px2(g, 7, 1, '#f0ecd0'); px2(g, 6, 1, '#e0b040'); }
    if (l) g.clearRect(0, 0, 2, 8); if (rr) g.clearRect(14, 0, 2, 8);
    return c; });
}
/* ============================ A BRAMBLE STAKE ROW (spikes) ============================ */
function stakes(z, x, v) {
  return once('sk' + z + '_' + (x & 3) + '_' + v, () => { const [c, g] = canvas(16, 16), r = mulberry(x * 7 + v + z), S = PAL[z].s;
    rect(g, 0, 13, 16, 3, S[1]); rect(g, 0, 13, 16, 1, S[3]);
    /* dark bramble cane tangled along the foot */
    let cy = 13; for (let k = 0; k < 16; k++) { px2(g, k, cy, '#241a10'); px2(g, k, cy + 1, '#3a2a18'); if (r() < 0.35) cy = Math.max(11, Math.min(14, cy + (r() < 0.5 ? -1 : 1))); if (k % 5 === 2) { px2(g, k, cy - 1, '#d8ceae'); } }
    /* the stakes: pale bone thorns, lit on the left */
    for (const [sx, h] of [[2, 11], [7, 13], [12, 10]]) { const hh = h + ((r() * 2) | 0) - 1; for (let i = 0; i < hh; i++) { const w = Math.max(1, Math.round((1 - i / hh) * 3)); const yy = 14 - i; if (yy < 0) continue; rect(g, sx - (w >> 1), yy, w, 1, '#ddd0ac'); px2(g, sx - (w >> 1), yy, '#f2ead0'); px2(g, sx - (w >> 1) + w - 1, yy, '#9c8c68'); } px2(g, sx, 14 - hh + 1, '#6a2a1c'); }
    return c; });
}
/* ============================ A TWINE LADDER (net) / A VINE LADDER ============================ */
function twine(z, top, v) {
  return once('tw' + z + (top ? 't' : '') + v, () => { const [c, g] = canvas(16, 16), tw = ['#7a6240', '#b89c6a', '#e0cc98'];
    for (const sx of [4, 11]) { for (let y = 0; y < 16; y++) { px2(g, sx, y, y % 4 < 2 ? tw[1] : tw[0]); px2(g, sx + 1, y, y % 4 < 2 ? tw[2] : tw[1]); } }
    for (const ry of [2, 6, 10, 14]) { rect(g, 4, ry, 8, 1, tw[1]); px2(g, 4, ry, tw[2]); px2(g, 11, ry, tw[0]); px2(g, 4, ry + 1, tw[0]); px2(g, 12, ry + 1, tw[0]); }   /* the rungs, knotted */
    if (top) { rect(g, 2, 0, 12, 2, '#cbb888'); px2(g, 2, 0, '#e8dcc0'); px2(g, 13, 0, '#8a7448'); }
    return c; });
}
function vineLadder(top, v) {
  return once('vl' + (top ? 't' : '') + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v + 11), J = ['#2e5a1c', '#5fae3a', '#9be06a'];
    for (const sx of [4, 11]) for (let y = 0; y < 16; y++) { const w = Math.round(Math.sin((y + v * 5 + sx) * 0.6) * 1); px2(g, sx + w, y, J[y % 5 < 2 ? 2 : 1]); px2(g, sx + w + 1, y, J[0]); }
    for (const ry of [2, 6, 10, 14]) { rect(g, 4, ry, 8, 1, J[1]); px2(g, 4, ry, J[2]); }
    for (let k = 0; k < 5; k++) { const lx = r() < 0.5 ? 1 : 11, ly = 1 + ((r() * 13) | 0); rect(g, lx, ly, 4, 2, J[1]); px2(g, lx, ly, J[2]); px2(g, lx + 3, ly + 1, J[0]); px2(g, lx + 1, ly + 2, J[0]); }
    if (v === 2) { px2(g, 8, 4, '#f0ecd0'); px2(g, 7, 5, '#f0ecd0'); px2(g, 9, 5, '#f0ecd0'); px2(g, 8, 5, '#e0b040'); }
    if (top) { rect(g, 3, 0, 10, 1, J[2]); rect(g, 2, 1, 3, 2, J[1]); rect(g, 11, 1, 3, 2, J[1]); }
    return c; });
}
/* ============================ A THORN HEDGE (port) ============================ */
function hedge(z, x, y, top, foot, eL, eR) {
  return once('hg' + z + '_' + (x & 3) + '_' + (y & 3) + (top ? 't' : '') + (foot ? 'f' : '') + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, y & 3) + 99 + z), lv = ['#16200e', '#243a16', '#386a24', '#5a9a38'];
    rect(g, 0, 0, 16, 16, lv[0]);
    /* a mass of small leaves */
    for (let i = 0; i < 34; i++) { const lx = (r() * 15) | 0, ly = (r() * 15) | 0, k = (r() * 4) | 0; px2(g, lx, ly, lv[Math.min(3, 1 + (k >> 1) + (lx < 6 ? 1 : 0))]); px2(g, lx + 1, ly, lv[1 + (k & 1)]); }
    /* the canes crossing it, with a pale thorn on each */
    for (let k = 0; k < 3; k++) { let cx0 = (r() * 4) | 0, cy0 = (r() * 16) | 0; const dy = r() < 0.5 ? -1 : 1; for (let i = 0; i < 16; i++) { px2(g, cx0, cy0, '#4a2a16'); px2(g, cx0, cy0 + 1, '#2a180c'); if (i % 4 === 1) { px2(g, cx0, cy0 - 1, '#e8dcc0'); px2(g, cx0 + 1, cy0 - 2, '#c8bc9c'); } cx0++; if (i % 3 === 2) cy0 = Math.max(0, Math.min(15, cy0 + dy)); } }
    if (top) { for (let k = 0; k < 16; k++) { const hh = (hash(x * 16 + k, y) >> 4) % 4; if (hh < 2) rect(g, k, 0, 1, 1 + hh, lv[0]); } g.clearRect(0, 0, 16, 0); for (let k = 0; k < 16; k++) { const cut = (hash(x * 16 + k, 7) >> 3) % 4; for (let yy = 0; yy < cut; yy++) g.clearRect(k, yy, 1, 1); } for (let k = 0; k < 4; k++) { const bx = 1 + ((r() * 13) | 0); px2(g, bx, 3, '#c8d8e8'); px2(g, bx + 1, 3, '#a0b8d0'); } }   /* ragged crown, a few pale berries */
    if (eL) { for (let yy = 0; yy < 16; yy += 3) { px2(g, 0, yy, '#e8dcc0'); px2(g, 1, yy + 1, lv[3]); } }
    if (eR) { for (let yy = 1; yy < 16; yy += 3) { px2(g, 15, yy, '#c8bc9c'); px2(g, 14, yy + 1, lv[1]); } }
    if (foot) { rect(g, 0, 14, 16, 2, '#1a0e08'); for (let k = 0; k < 16; k += 3) px2(g, k, 13, '#4a2a16'); }
    return c; });
}

/* where the seed beds' vines grow (the greybox's cells: NET up the wall for a ladder, ONEWAY along the lip for a bridge) - the tile knows a vine from a rope or a mat */
const bedPlans = new WeakMap();
function bedsOf(L) {
  if (bedPlans.has(L)) return bedPlans.get(L);
  const lad = new Set(), bri = new Set();
  for (const e of L.ents || []) if (e.t === 'vinebed') { if (e.grow === 'ladder') for (let yy = e.top; yy <= e.y; yy++) lad.add(e.x + ',' + yy); else if (e.grow === 'bridge') for (let xx = e.x0; xx <= e.x1; xx++) bri.add(xx + ',' + e.row); }
  const o = { lad, bri }; bedPlans.set(L, o); return o;
}

export function ul3Tile(t, x, y, at, T, L) {
  const z = zoneOf(x), b = bedsOf(L);
  if (t === T.NET) { const top = at(x, y - 1) !== T.NET; return b.lad.has(x + ',' + y) ? vineLadder(top, ((x * 3 + y) % 3 + 3) % 3) : twine(z, top, 0); }
  if (t === T.ONEWAY) { const same = k => at(x + k, y) === t, l = !same(-1), r = !same(1), v = ((x * 5 + y) % 3 + 3) % 3; return b.bri.has(x + ',' + y) ? vineBridge(l, r, v & 1) : board(z, l, r, v); }
  if (t === T.SPIKE) return stakes(z, x, ((x * 3 + y) % 3 + 3) % 3);
  if (t === T.PORT) { const top = at(x, y - 1) !== T.PORT, foot = at(x, y + 1) !== T.PORT; return hedge(z, x, y, top, foot, at(x - 1, y) !== T.PORT, at(x + 1, y) !== T.PORT); }
  if (t !== T.SOLID) return null;
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET || v === T.PORT; };
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  if (up) return topTile(z, x, y, eL, eR);
  if (down) return ceilTile(z, x, y, eL, eR);
  if (eL || eR) return faceTile(z, x, y, eL, eR);
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } }
  return massTile(z, x, y, d);
}
export function warmTiles() { for (let z = 0; z < 6; z++) { board(z, true, true, 0); stakes(z, 0, 0); twine(z, true, 0); } vineLadder(true, 0); vineBridge(true, true, 0); }
