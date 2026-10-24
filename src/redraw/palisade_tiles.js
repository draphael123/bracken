// palisade_tiles.js - THE PALISADE WOOD's TILE KIT (claude/palisadeart). The greybox wore the shared autumn wood's dirt and plank. This is the place itself, in two materials:
//   EARTH   loam under leaf-litter: a lip of dry grass with russet / rust / gold leaves lying on it, acorns, roots, buried stones; the litter turns to wood-chips and straw in the yard,
//           churned clay and cart-ruts at the gatehouse, trampled dirt at the old gate (palisade_pal.js: five places, crossfading at each seam)
//   TIMBER  THE PALISADE: standing logs four to a tile (fresh-cut honey beside seasoned brown), rope lashings and a flat rail every few rows, a capping board where it is walked on, raw cut ends under;
//           THE GATEHOUSE: hewn beams laid course on course, log-ends notched out at the corners, iron straps with rivets; THE BLOCKS: a stump with its cut face and rings
//   ONEWAY  a SCAFFOLD DECK: boards with seams and nail heads over a joist, rope at the ends, cut grain at a free end; LOOSE BOARDS (the level's crumbles) are cracked, gapped and unlashed
// px.js primitives, 16x16, baked lazily, memoised.   pwTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it).   TIMBER lists the level's built-up cells (the rest is earth).
import { canvas, px, rect, mulberry } from '../px.js';
import { PAL, WOOD, ROPE, IRON, zoneOf, hash, mix } from './palisade_pal.js';

/* the SOLID cells that are timber, not earth (the level's own geometry: src/palisade-wood.js ground(222, 300, 13), block(272, 275, 8, 12), block(346, 356, 6, 20), block(129, 130, 30, 31), block(198, 199, 27, 28));
   tools/palisadeart.mjs proves every one of these cells is SOLID in the level, so the table cannot drift from the level unseen */
export const TIMBER = [
  { k: 'wall', x0: 222, x1: 300, y0: 13, y1: 28 }, { k: 'beam', x0: 272, x1: 275, y0: 8, y1: 12 }, { k: 'gate', x0: 346, x1: 356, y0: 6, y1: 20 },
  { k: 'stump', x0: 129, x1: 130, y0: 30, y1: 31 }, { k: 'stump', x0: 198, x1: 199, y0: 27, y1: 28 },
];
export const timberAt = (x, y) => { for (const r of TIMBER) if (x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1) return r.k; return null; };

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
function soilFill(g, z, x, y, base) {
  const S = PAL[Math.min(4, z)].s;
  for (let py = 0; py < 16; py++) for (let pxl = 0; pxl < 16; pxl++) {
    const ax = x * 16 + pxl, ay = y * 16 + py, h = hash(ax >> 1, ay >> 1), j = (h >> 4) % 11 === 0 ? -1 : (h >> 4) % 13 === 0 ? 1 : 0;
    px2(g, pxl, py, S[Math.max(0, Math.min(6, base + j))]); }
}
function crumb(g, r, z, n, lo = 0, hi = 16) { const S = PAL[z].s; for (let i = 0; i < n; i++) { const x = (r() * 16) | 0, y = lo + ((r() * (hi - lo)) | 0); px2(g, x, y, r() < 0.5 ? S[1] : S[4]); if (r() < 0.4) px2(g, x + 1, y, S[2]); } }
function stone(g, z, cx, cy, w, h) { const S = PAL[z].s; for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) { if ((dx === 0 || dx === w - 1) && (dy === 0 || dy === h - 1)) continue; px2(g, cx + dx, cy + dy, dy === 0 ? S[5] : dx === 0 ? S[4] : dy === h - 1 || dx === w - 1 ? S[1] : S[3]); } }
/* a leaf lying on the ground: 3-4 px, a lit edge, a dark tip; some are oak (a notch) */
function leaf(g, x, y, col, big) { const dk = mix(col, '#2a1208', 0.5), lt = mix(col, '#fff0b0', 0.4);
  px2(g, x, y, lt); px2(g, x + 1, y, col); px2(g, x + 2, y, col); px2(g, x + 3, y, dk);
  if (big) { px2(g, x + 1, y + 1, dk); px2(g, x + 2, y + 1, col); px2(g, x + 3, y + 1, dk); px2(g, x, y - 1, col); px2(g, x + 2, y - 1, lt); } }
const chip = (g, x, y, col, w = 2) => { rect(g, x, y, w, 1, col); };
const deepA = y => y < 33 ? 0 : Math.min(0.5, (y - 33) * 0.04);
function deepTint(g, y, mul = 1) { for (let py = 0; py < 16; py++) { const a = deepA(y + py / 16) * mul; if (a < 0.01) continue; g.globalAlpha = a; rect(g, 0, py, 16, 1, '#080402'); } g.globalAlpha = 1; }
const depthOf = (open, d0 = 6) => { let d = d0; for (let k = 1; k <= 5 && d === d0; k++) for (let dy = -k; dy <= k && d === d0; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } } return d; };

/* ============================ EARTH ============================ */
function topTile(z, x, y, eL, eR) {
  return once('tp' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 31), P = PAL[z], S = P.s, G = P.grass;
    soilFill(g, z, x, y, 3);
    rect(g, 0, 0, 16, 4, S[4]); rect(g, 0, 4, 16, 1, S[2]); rect(g, 0, 5, 16, 1, S[1]);                                        /* the turf, its shadow line */
    for (let k = 0; k < 16; k++) { const hh = (hash(x * 16 + k, y) >> 5) % 5, h = hh === 0 ? 1 : hh < 3 ? 2 : 3; rect(g, k, 0, 1, h, G[hh >= 3 ? 2 : hh === 0 ? 0 : 1]); }   /* dry grass, ragged */
    for (let i = 0; i < 3; i++) px2(g, (r() * 16) | 0, 3 + ((r() * 2) | 0), r() < 0.5 ? S[5] : G[0]);
    /* THE LEAF LITTER: russet, rust, ochre and gold leaves lying on the lip (more where the wood is older) */
    const nl = z === 0 ? 9 : z === 1 ? 7 : z === 2 ? 6 : z === 3 ? 4 : 6;
    for (let i = 0; i < nl; i++) leaf(g, (r() * 13) | 0, (r() * 4) | 0, P.litter[(r() * P.litter.length) | 0], r() < 0.5);
    if (r() < 0.45) { const px0 = 1 + ((r() * 10) | 0), c1 = P.litter[(r() * 4) | 0], c2 = P.litter[(r() * 4) | 0]; rect(g, px0, 1, 6, 2, c1); rect(g, px0 + 1, 0, 4, 1, c2); px2(g, px0 + 2, 1, mix(c2, '#fff0b0', 0.4)); px2(g, px0 + 5, 2, mix(c1, '#2a1208', 0.5)); }   /* a drift of leaves in a heap */
    if (z === 0 && r() < 0.4) { const ax = 2 + ((r() * 11) | 0); px2(g, ax, 0, '#5a3a1a'); px2(g, ax + 1, 0, '#8a5a2a'); px2(g, ax, 1, '#a4743a'); px2(g, ax + 1, 1, '#8a5a2a'); }   /* an acorn in its cup */
    if (z === 1 || z === 2) for (let i = 0; i < 4; i++) chip(g, (r() * 14) | 0, (r() * 3) | 0, i % 2 ? WOOD.fresh[3] : WOOD.mid[4], 2 + ((r() * 2) | 0));   /* wood chips and sawdust under the saws */
    if (z === 1 && r() < 0.5) { const sx = (r() * 11) | 0; rect(g, sx, 1, 4, 1, '#d8b24a'); px2(g, sx + 1, 0, '#e8c860'); px2(g, sx + 3, 0, '#c89a3a'); }   /* straw from the carts */
    if (z === 3 || z === 4) { rect(g, 0, 2, 16, 1, S[5]); for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, 1, S[3]); if (z === 3) rect(g, 0, 4, 16, 1, S[0]); }   /* trodden flat: the clay is churned */
    if (z === 3 && (x & 3) === 1) { rect(g, 3, 1, 3, 1, S[2]); rect(g, 10, 1, 3, 1, S[2]); }                                    /* a cart's ruts */
    if (r() < 0.2) stone(g, z, 2 + ((r() * 9) | 0), 8 + ((r() * 4) | 0), 3, 2);
    crumb(g, r, z, 5, 6, 16);
    if (eL) { rect(g, 0, 3, 1, 13, S[5]); px2(g, 0, 2, S[6]); }
    if (eR) { rect(g, 15, 2, 1, 14, S[0]); px2(g, 15, 1, S[2]); }
    deepTint(g, y);
    return c; });
}
function faceTile(z, x, y, eL, eR) {
  return once('fc' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 47), P = PAL[z], S = P.s;
    soilFill(g, z, x, y, eL ? 3 : 2);
    for (const by of [3 + ((r() * 3) | 0), 10 + ((r() * 4) | 0)]) for (let k = 0; k < 16; k++) if (hash(k + x * 16, by) % 5 > 0) px2(g, k, by, S[eL ? 4 : 3]);   /* strata */
    for (const fx of [2 + ((r() * 5) | 0), 9 + ((r() * 5) | 0)]) { const len = 5 + ((r() * 9) | 0), y0 = (r() * (16 - len)) | 0; for (let yy = y0; yy < y0 + len; yy++) { px2(g, fx, yy, S[0]); px2(g, fx + 1, yy, eL ? S[5] : '#7a5a38'); } }   /* a root running down the wall */
    if (r() < 0.5) stone(g, z, 3 + ((r() * 9) | 0), 3 + ((r() * 8) | 0), 3 + ((r() * 2) | 0), 3);
    if (r() < 0.3) leaf(g, 2 + ((r() * 9) | 0), 2 + ((r() * 11) | 0), P.litter[(r() * 4) | 0], false);                              /* a leaf blown into a crack */
    crumb(g, r, z, 5);
    if (eL) { rect(g, 0, 0, 1, 16, S[6]); rect(g, 1, 0, 1, 16, S[5]); }
    if (eR) { rect(g, 15, 0, 1, 16, S[0]); rect(g, 14, 0, 1, 16, S[1]); g.globalAlpha = 0.2; rect(g, 11, 0, 3, 16, '#000'); g.globalAlpha = 1; }
    deepTint(g, y);
    return c; });
}
function ceilTile(z, x, y, eL, eR) {
  return once('ce' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 53), S = PAL[z].s;
    soilFill(g, z, x, y, 2);
    g.globalAlpha = 0.5; rect(g, 0, 9, 16, 7, '#000'); g.globalAlpha = 0.28; rect(g, 0, 5, 16, 4, '#000'); g.globalAlpha = 1;
    for (let k = 0; k < 5; k++) { const nx = (r() * 15) | 0, nl = 2 + ((r() * 5) | 0); rect(g, nx, 15 - nl, 1, nl, '#5a3c20'); px2(g, nx, 15, S[0]); if (r() < 0.4) px2(g, nx + 1, 15 - nl, '#6a4a2a'); }   /* roots hanging down */
    rect(g, 0, 15, 16, 1, S[0]); if (eL) rect(g, 0, 0, 1, 16, S[5]); if (eR) rect(g, 15, 0, 1, 16, S[0]);
    deepTint(g, y);
    return c; });
}
function massTile(z, x, y, d) {
  return once('ma' + z + '_' + (x & 7) + '_' + (y & 3) + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + 41 + z), S = PAL[z].s;
    soilFill(g, z, x, y, d <= 1 ? 3 : 2);
    g.globalAlpha = [0, 0.04, 0.07, 0.1, 0.12, 0.14, 0.16][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#0c0604'); g.globalAlpha = 1;
    if ((hash(x >> 2, y) % 4) === 0) { const yl = 3 + (hash(x, y * 7) % 10), yr = 3 + (hash(x + 1, y * 7) % 10); for (let k = 0; k < 16; k++) { const yy = Math.round(yl + (yr - yl) * k / 15 + Math.sin(k * 0.9 + x) * 0.9); px2(g, k, yy, mix('#7a5a38', S[2], Math.min(0.8, d * 0.13))); if (k % 5 === 2) px2(g, k, yy + 1, mix('#6a4a2c', S[2], 0.6)); } }   /* a root through the earth */
    if (r() < 0.3) stone(g, z, 1 + ((r() * 11) | 0), 1 + ((r() * 11) | 0), 3, 3);
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? S[0] : S[3]);
    deepTint(g, y, 1.15);
    return c; });
}

/* ============================ TIMBER ============================ */
const FRESHISH = WOOD.fresh.map((c, k) => mix(c, WOOD.mid[k], 0.35));
const rampFor = (x, y, z, i) => { const h = hash(x * 4 + i, y >> 2); return z >= 3 || h % 5 < 2 ? FRESHISH : h % 5 < 4 ? WOOD.mid : WOOD.old; };
/* a lashing: two turns of rope across, the twist as slanted pixels */
function lash(g, y0) { rect(g, 0, y0, 16, 3, ROPE[1]); for (let k = 0; k < 16; k++) { px2(g, k, y0 + (k & 1), ROPE[2]); px2(g, k, y0 + 2 - (k & 1), ROPE[0]); } rect(g, 0, y0 + 3, 16, 1, '#2a1a0e'); }
/* THE PALISADE: standing logs, four a tile */
function wallTile(z, x, y, eL, eR, up, down, d) {
  return once('wl' + z + '_' + (x & 7) + '_' + (y & 7) + (eL ? 'l' : '') + (eR ? 'r' : '') + (up ? 'u' : '') + (down ? 'd' : '') + (d > 2 ? 'D' : d), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + 91);
    for (let i = 0; i < 4; i++) { const W = rampFor(x, y, z, i), lx = i * 4;
      rect(g, lx, 0, 1, 16, W[3]); rect(g, lx + 1, 0, 2, 16, W[2]); rect(g, lx + 3, 0, 1, 16, W[1]);
      for (let k = 0; k < 3; k++) rect(g, lx + 1 + ((r() * 2) | 0), (r() * 14) | 0, 1, 2 + ((r() * 2) | 0), r() < 0.5 ? W[1] : W[3]);   /* grain */
      if (hash(x * 4 + i, y) % 5 === 0) { const ky = 2 + ((r() * 10) | 0); rect(g, lx + 1, ky, 2, 2, W[0]); px2(g, lx + 1, ky, W[3]); }   /* a knot */
      if (W === FRESHISH && r() < 0.2) px2(g, lx + 2, (r() * 16) | 0, '#f6d880');   /* sap */
    }
    for (let i = 0; i < 4; i++) { g.globalAlpha = 0.5; rect(g, i * 4 + 3, 0, 1, 16, '#120a04'); g.globalAlpha = 1; }                    /* the gaps between the logs */
    if ((y & 3) === 1) lash(g, 6);                                                                                                  /* a lashing every fourth course */
    if ((y & 7) === 5) { rect(g, 0, 2, 16, 5, WOOD.old[2]); rect(g, 0, 2, 16, 1, WOOD.old[4]); rect(g, 0, 6, 16, 1, WOOD.old[0]); for (const nx of [2, 8, 13]) px2(g, nx, 4, IRON[3]); lash(g, 8); }   /* a waler: a flat rail bolted across */
    if (up) { rect(g, 0, 0, 16, 5, WOOD.fresh[2]); rect(g, 0, 0, 16, 1, WOOD.fresh[4]); rect(g, 0, 1, 16, 1, WOOD.fresh[3]); rect(g, 0, 4, 16, 1, WOOD.mid[0]);   /* THE CAP BOARD (walked on): planks with seams and nails */
      rect(g, (hash(x, y) % 9) + 3, 1, 1, 3, WOOD.mid[1]); px2(g, 2, 2, IRON[3]); px2(g, 13, 2, IRON[3]); rect(g, 0, 5, 16, 1, '#2a1a0e'); g.globalAlpha = 0.25; rect(g, 0, 6, 16, 2, '#000'); g.globalAlpha = 1; }
    if (down) { g.globalAlpha = 0.55; rect(g, 0, 11, 16, 5, '#000'); g.globalAlpha = 1; rect(g, 0, 15, 16, 1, '#120a04'); for (let i = 0; i < 4; i++) px2(g, i * 4 + 1 + (i & 1), 14, WOOD.fresh[3]); }   /* the raw cut ends in shadow */
    if (eL) rect(g, 0, 0, 1, 16, WOOD.fresh[4]);
    if (eR) { rect(g, 14, 0, 2, 16, '#120a04'); g.globalAlpha = 0.25; rect(g, 10, 0, 4, 16, '#000'); g.globalAlpha = 1; }
    if (d > 1) { g.globalAlpha = Math.min(0.55, 0.12 * d); rect(g, 0, 0, 16, 16, '#0a0402'); g.globalAlpha = 1; }                         /* the inside of a wall is dark */
    return c; });
}
/* THE GATEHOUSE and the half-built tower: hewn beams laid course on course (two to a tile), the log-ends notched out at the corners, iron straps */
function beamTile(z, x, y, eL, eR, up, down, d, gate) {
  return once('bm' + z + (gate ? 'g' : 't') + '_' + (x & 3) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : '') + (up ? 'u' : '') + (down ? 'd' : '') + (d > 2 ? 'D' : d), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, y & 3) + 17);
    for (let course = 0; course < 2; course++) { const cy = course * 8, W = (hash(x, y * 2 + course) % 3 === 0) ? WOOD.old : (gate ? WOOD.mid : FRESHISH);
      const off = ((y * 2 + course) & 1) ? 3 : 0;
      rect(g, 0, cy, 16, 8, W[2]); rect(g, 0, cy, 16, 1, W[4]); rect(g, 0, cy + 1, 16, 1, W[3]); rect(g, 0, cy + 6, 16, 1, W[1]); rect(g, 0, cy + 7, 16, 1, W[0]);
      for (let k = 0; k < 4; k++) rect(g, (r() * 13) | 0, cy + 2 + ((r() * 3) | 0), 2 + ((r() * 3) | 0), 1, r() < 0.5 ? W[1] : W[3]);   /* grain */
      if (hash(x, y * 2 + course) % 4 === 0) { const kx = 2 + ((r() * 10) | 0); rect(g, kx, cy + 3, 2, 2, W[0]); px2(g, kx, cy + 3, W[3]); }
      if (eL) { if (off) g.clearRect(0, cy, off, 8); rect(g, off, cy + 1, 2, 6, WOOD.fresh[3]); px2(g, off + 1, cy + 3, WOOD.mid[1]); px2(g, off + 1, cy + 4, WOOD.mid[1]); rect(g, off, cy, 1, 8, W[1]); }   /* an end-grain face with a ring, the corner notched */
      if (eR) { rect(g, 14 - off, cy, 2 + off, 8, W[1]); rect(g, 13 - off, cy + 1, 1, 6, W[0]); }
    }
    if (gate) { rect(g, 5, 0, 3, 16, IRON[1]); rect(g, 5, 0, 1, 16, IRON[2]); rect(g, 7, 0, 1, 16, IRON[0]); for (const ry of [2, 6, 10, 14]) px2(g, 6, ry, IRON[3]); }   /* the gate's iron strap and its rivets */
    if (up) { rect(g, 0, 0, 16, 2, WOOD.fresh[4]); rect(g, 0, 1, 16, 1, WOOD.fresh[3]); }
    if (down) { g.globalAlpha = 0.5; rect(g, 0, 12, 16, 4, '#000'); g.globalAlpha = 1; }
    if (eR) { g.globalAlpha = 0.25; rect(g, 9, 0, 4, 16, '#000'); g.globalAlpha = 1; }
    if (d > 1) { g.globalAlpha = Math.min(0.5, 0.11 * d); rect(g, 0, 0, 16, 16, '#0a0402'); g.globalAlpha = 1; }
    return c; });
}
/* A STUMP / A POST: bark with deep furrows, lichen; the cut face on top with rings and the axe's bite */
function stumpTile(z, x, y, eL, eR, up) {
  return once('st' + z + '_' + (x & 1) + (y & 1) + (eL ? 'l' : '') + (eR ? 'r' : '') + (up ? 'u' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 1, y & 1) + 123), B = ['#1c120a', '#32200f', '#4a321a', '#684a28', '#86683a'], S = WOOD.fresh;
    rect(g, 0, 0, 16, 16, B[2]); for (let k = 0; k < 16; k += 3) { const kk = k + (hash(x, k) % 2); rect(g, kk, 0, 1, 16, B[1]); rect(g, kk + 1, 0, 1, 16, B[3]); }
    for (let i = 0; i < 3; i++) rect(g, (r() * 14) | 0, (r() * 12) | 0, 2, 2, r() < 0.5 ? '#6a7a3a' : '#8a8a62');   /* moss and lichen */
    if (up) { rect(g, 0, 0, 16, 7, B[1]);                                                                                          /* the cut face, seen from the side: a lit oval with rings */
      for (let yy = 0; yy < 7; yy++) for (let xx = 0; xx < 16; xx++) { const dx = (xx - 7.5) / 8, dy = (yy - 3.5) / 3.6, q = dx * dx + dy * dy; if (q < 1) px2(g, xx, yy, Math.floor(q * 5) % 2 ? S[3] : S[2]); }
      px2(g, 7, 3, S[0]); rect(g, 5, 2, 6, 1, S[4]); g.globalAlpha = 0.5; rect(g, 0, 6, 16, 1, '#000'); g.globalAlpha = 1; }
    if (eL) rect(g, 0, 0, 1, 16, B[4]);
    if (eR) rect(g, 14, 0, 2, 16, B[0]);
    return c; });
}

/* ============================ ONEWAY: THE SCAFFOLD DECK ============================ */
function deck(fresh, l, rr, v, loose) {
  return once('dk' + (fresh ? 1 : 0) + (l ? 'l' : '') + (rr ? 'r' : '') + v + (loose ? 'x' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(v * 19 + 7 + (loose ? 3 : 0)), Wd = loose ? WOOD.old : fresh ? WOOD.fresh : WOOD.mid;
    rect(g, 0, 0, 16, 5, Wd[2]); rect(g, 0, 0, 16, 1, Wd[4]); rect(g, 0, 1, 16, 1, Wd[3]); rect(g, 0, 4, 16, 1, Wd[0]);                  /* the board: lit edge, body, shadow */
    rect(g, (v * 5 + 3) % 12 + 2, 1, 1, 3, Wd[1]);                                                                                           /* a seam */
    for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 3) | 0), Wd[r() < 0.5 ? 1 : 3]);
    rect(g, 0, 5, 16, 3, loose ? WOOD.old[1] : WOOD.mid[1]); rect(g, 0, 5, 16, 1, loose ? WOOD.old[2] : WOOD.mid[2]); rect(g, 0, 7, 16, 1, '#1c1008');   /* the joist under it */
    if (!loose) { for (const nx of [2, 13]) { px2(g, nx, 2, IRON[3]); px2(g, nx, 3, IRON[0]); } for (const lx of [l ? 3 : 1, rr ? 11 : 13]) { rect(g, lx, 5, 2, 3, ROPE[1]); px2(g, lx, 6, ROPE[2]); px2(g, lx + 1, 5, ROPE[0]); } }   /* nails and a lashing at each end */
    else { for (let i = 0; i < 3; i++) { const cx0 = 2 + ((r() * 12) | 0); px2(g, cx0, 2, '#120a04'); px2(g, cx0 + 1, 3, '#120a04'); px2(g, cx0 - 1, 1, '#120a04'); }   /* cracked, gapped, nothing holding it */
      rect(g, 5, 0, 2, 5, '#0c0602'); px2(g, 6, 5, '#0c0602'); rect(g, 11, 1, 1, 4, '#0c0602'); px2(g, 8, 6, ROPE[0]); px2(g, 8, 7, ROPE[0]); }
    if (l) { g.clearRect(0, 0, 2, 8); rect(g, 2, 0, 1, 1, Wd[4]); rect(g, 1, 1, 1, 4, Wd[3]); rect(g, 1, 5, 1, 3, WOOD.fresh[3]); px2(g, 2, 6, WOOD.mid[0]); }                    /* a free end: the cut grain */
    if (rr) { g.clearRect(14, 0, 2, 8); rect(g, 14, 1, 1, 4, Wd[1]); rect(g, 14, 5, 1, 3, WOOD.mid[3]); }
    g.globalAlpha = 0.25; rect(g, 0, 8, 16, 2, '#000'); g.globalAlpha = 1;
    return c; });
}

/* ============================ the cell ============================ */
export function pwTile(t, x, y, at, T, L) {
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET; };
  const z = Math.min(4, zoneOf(x));
  if (t === T.ONEWAY) { const same = k => at(x + k, y) === t, l = !same(-1), rr = !same(1), v = ((x * 5 + y) % 3 + 3) % 3, loose = !!(L && L.crumbles && L.crumbles.some(q => x >= q.x0 && x <= q.x1 && y === q.row));
    return deck(z >= 3 || v === 1, l, rr, loose ? 0 : v % 2, loose); }
  if (t !== T.SOLID) return null;
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0), tk = timberAt(x, y);
  if (tk) { const d = depthOf(open);
    if (tk === 'wall') return wallTile(z, x, y, eL, eR, up, down, d);
    if (tk === 'beam') return beamTile(z, x, y, eL, eR, up, down, d, false);
    if (tk === 'gate') return beamTile(z, x, y, eL, eR, up, down, d, true);
    return stumpTile(z, x, y, eL, eR, up); }
  if (up) return topTile(z, x, y, eL, eR);
  if (down) return ceilTile(z, x, y, eL, eR);
  if (eL || eR) return faceTile(z, x, y, eL, eR);
  return massTile(z, x, y, depthOf(open));
}
