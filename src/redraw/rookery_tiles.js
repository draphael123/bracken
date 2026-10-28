// rookery_tiles.js - THE ROOKERY's TILE KIT (claude/rookeryart). The greybox wore the stock crag dirt. This is the place itself: a harpies' cliff, one stone in five moods:
//   TOPS     a wind-flattened lip: a lit edge, a CAP OF GUANO (white crust, a drip over the edge), dry tufts bent east, orange lichen, a feather or a bone lying on it
//   FACES    the crag's face: bedding in horizontal strata (laid by the WORLD row, so a bed runs on across a whole cliff), WIND FLUTES, and GUANO STREAKS running down from every ledge
//   CEILING  an overhang's underside: dark, hung with white drips and a few roots of lichen
//   MASS     the heart of the rock: strata and flaked chips, darker and bluer with depth (the cliffs go down into the cloud)
//   ONEWAY   THE WIND-CUT SHELF: a slab of stone jutting off the face, a lit upper edge, the wind's scour under it, guano on top, a free end that tapers; the BONE STAIR's are laid with bone
//   each zone is its own stone (rookery_pal.js): pearl limestone, weathered sandstone, wet slate, ossuary ivory, wind-polished rose
// px.js primitives, 16x16, baked lazily, memoised.   rkTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it).
import { canvas, rect, mulberry } from '../px.js';
import { PAL, GUANO, BONE, TWIG, zoneOf, palAt, hash, mix } from './rookery_pal.js';

/* the palette in force for the cell being drawn: its zone's stone crossfaded toward the neighbouring zone's over the last / first eight columns of a seam (CUR is set by rkTile; every memo key carries CURK) */
let CUR = PAL[0], CURK = '';
const memo = new Map(); const once = (k, fn) => { k = CURK + k; if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };

const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) rect(g, x, y, 1, 1, c); };
/* the stone's fill: bedding by the world row (so a bed runs across the whole cliff), a little grain, a lit left / dark right */
function stoneFill(g, z, x, y, base) {
  const S = CUR.s;
  for (let py = 0; py < 16; py++) {
    const ay = y * 16 + py, bed = hash(ay >> 1, 77 + z) % 9, tone = bed === 0 ? -1 : bed === 1 ? 1 : 0;
    for (let pxl = 0; pxl < 16; pxl++) {
      const ax = x * 16 + pxl, h = hash(ax >> 1, ay >> 1), j = (h >> 4) % 21 === 0 ? -1 : (h >> 4) % 25 === 0 ? 1 : 0;
      px2(g, pxl, py, S[Math.max(0, Math.min(6, base + tone + j))]);
    }
  }
}
function chips(g, r, z, n, lo = 0, hi = 16) { const S = CUR.s; for (let i = 0; i < n; i++) { const x = (r() * 16) | 0, y = lo + ((r() * (hi - lo)) | 0); px2(g, x, y, r() < 0.5 ? S[1] : S[4]); if (r() < 0.4) px2(g, x + 1, y, S[2]); } }
/* a flake of lichen: a few pixels of the zone's lichen on a lit face */
function lichen(g, z, x, y, r) { const L = CUR.lichen, c = L[(r() * L.length) | 0]; px2(g, x, y, c); px2(g, x + 1, y, c); px2(g, x, y + 1, mix(c, '#20201c', 0.35)); if (r() < 0.6) px2(g, x + 1, y - 1, c); }
/* a feather lying: a pale quill and two barbs */
function feather(g, x, y, dark) { const c = dark ? '#4a4658' : '#e6e4ec', c2 = dark ? '#6e6a80' : '#c0bece'; px2(g, x, y, c); px2(g, x + 1, y, c); px2(g, x + 2, y, c); px2(g, x + 3, y, c2); px2(g, x + 1, y - 1, c2); px2(g, x + 2, y + 1, c2); }
/* GUANO: a white crust on a lit top, with a dripped edge */
/* (claude/rookery2, brief A4 - Daniel 10-27: "flat grey untextured path tops") THE ROCK-AND-GUANO CAP: every walkable top gets it, the whole width - a crust of guano patches and
   scoured rock grit with a ragged under-edge (3-5 px), grit specks on it, one or two guano drips hanging off it, and at a run's free end the cap rolls over the edge. GREYBOX
   shapes in the level's own colours: the sonnet art lane finishes it */
function capBand(g, x, y, eL, eR, S) {
  for (let k = 0; k < 16; k++) { const hv = hash(x * 16 + k, y * 7 + 3), d = 3 + (hv % 3), patch = (((x * 16 + k) >> 2) + y) % 3 !== 0;
    for (let q = 0; q < d; q++) px2(g, k, q, q === 0 ? (patch ? GUANO[3] : S[6]) : q === d - 1 ? (patch ? GUANO[0] : S[2]) : patch ? GUANO[q % 2 ? 2 : 1] : S[5]);
    if (hv % 11 === 0) px2(g, k, 1, S[1]); if (hv % 13 === 5) px2(g, k, 0, S[3]); }                                                                               /* grit */
  for (let i = 0; i < 2; i++) { const hv = hash(x * 3 + i * 17, y * 5 + 1); if (hv % 3 === 2 && i) continue; const dx = 2 + (hv % 12), L = 3 + (hv % 4); for (let q = 3; q < 3 + L; q++) px2(g, dx, q, q === 2 + L ? GUANO[0] : GUANO[q % 2 ? 1 : 2]); }   /* drips */
  { const h1 = hash(x * 5 + 3, y * 3 + 1);   /* (claude/rookery2art) PEBBLES and a hairline CRACK, so a long walk is never a flat strip: a scatter of grit stones on the crust, a crack through it now and then, a guano blob */
    if (h1 % 3 === 0) { const k = 1 + (h1 >> 3) % 11; px2(g, k, 1, S[3]); px2(g, k + 1, 1, S[4]); px2(g, k + 1, 0, S[6]); px2(g, k, 2, S[1]); }
    if (h1 % 7 === 2) { const k = 2 + (h1 >> 4) % 11; px2(g, k, 2, S[0]); px2(g, k, 3, S[0]); px2(g, k + 1, 4, S[0]); px2(g, k + 1, 5, S[1]); px2(g, k, 1, S[1]); }
    if (h1 % 5 === 1) { const k = 1 + (h1 >> 5) % 10; px2(g, k, 0, GUANO[3]); px2(g, k + 1, 0, GUANO[3]); px2(g, k + 2, 0, GUANO[2]); px2(g, k, 1, GUANO[2]); px2(g, k + 1, 1, GUANO[3]); px2(g, k + 2, 1, GUANO[1]); } }
  if (eL) { px2(g, 0, 0, S[2]); for (let q = 1; q < 5; q++) px2(g, 0, q, GUANO[q % 2 ? 1 : 0]); }                                                                   /* rolled over a free end */
  if (eR) { px2(g, 15, 0, S[2]); for (let q = 1; q < 5; q++) px2(g, 15, q, GUANO[q % 2 ? 0 : 1]); }
}
function guanoCap(g, r, x0, w, depth) { for (let k = 0; k < w; k++) { const d = depth + (((r() * 2) | 0) - (k === 0 || k === w - 1 ? 1 : 0)); for (let q = 0; q < d; q++) px2(g, x0 + k, q, q === d - 1 ? GUANO[1] : q === 0 ? GUANO[3] : GUANO[2]); } }
const depthOf = (open, d0 = 6) => { let d = d0; for (let k = 1; k <= 5 && d === d0; k++) for (let dy = -k; dy <= k && d === d0; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) === k && open(dx, dy)) { d = k - 1; break; } } return d; };
const deepA = y => y < 40 ? 0 : Math.min(0.45, (y - 40) * 0.05);
function deepTint(g, z, y, mul = 1) { for (let py = 0; py < 16; py++) { const a = deepA(y + py / 16) * mul; if (a < 0.01) continue; g.globalAlpha = a; rect(g, 0, py, 16, 1, CUR.haze); } g.globalAlpha = 1; }

/* ============================ ROCK ============================ */
function topTile(z, x, y, eL, eR) {
  return once('tp' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 31), P = CUR, S = P.s;
    stoneFill(g, z, x, y, 3);
    rect(g, 0, 0, 16, 3, S[5]); rect(g, 0, 0, 16, 1, S[6]); rect(g, 0, 3, 16, 1, S[4]); rect(g, 0, 4, 16, 1, S[2]); rect(g, 0, 5, 16, 1, S[1]);        /* the lit lip and the shadow under it */
    rect(g, 0, 6, 16, 1, S[1]); capBand(g, x, y, eL, eR, S);                                                                                       /* (claude/rookery2) THE ROCK-AND-GUANO CAP over the whole lip */
    /* dry tufts, bent east */
    for (let i = 0; i < 3; i++) if (r() < 0.55) { const tx = (r() * 13) | 0, T = P.tuft; px2(g, tx, 0, T[1]); px2(g, tx + 1, -1 + 0, T[1]); px2(g, tx + 1, 0, T[0]); px2(g, tx + 2, 0, T[1]); px2(g, tx, 1, T[0]); }
    /* GUANO: a crust splashed on the lip, a drip over its edge (more where the roosts are: zones 0, 1, 3, 4) */
    if (r() < (z === 2 ? 0.5 : 0.85)) { const gx = 1 + ((r() * 8) | 0), gw = 4 + ((r() * 6) | 0); guanoCap(g, r, gx, gw, 2); if (r() < 0.6) { const dx = gx + ((r() * gw) | 0); for (let q = 2; q < 7; q++) px2(g, dx, q, q === 6 ? GUANO[0] : GUANO[q % 2 ? 1 : 2]); } }
    if (r() < 0.35) lichen(g, z, 1 + ((r() * 12) | 0), 1 + ((r() * 3) | 0), r);
    if (r() < 0.14) feather(g, 1 + ((r() * 11) | 0), 1 + ((r() * 2) | 0), r() < 0.4);
    if ((z === 1 || z === 3) && r() < 0.18) { const bx = 2 + ((r() * 10) | 0); rect(g, bx, 1, 4, 1, BONE[2]); px2(g, bx, 0, BONE[3]); px2(g, bx + 3, 2, BONE[1]); }      /* a small bone */
    if (r() < 0.2) { const sx = 2 + ((r() * 9) | 0); px2(g, sx, 7 + ((r() * 4) | 0), S[0]); px2(g, sx + 1, 7 + ((r() * 4) | 0), S[3]); }
    chips(g, r, z, 5, 6, 16);
    if (eL) { rect(g, 0, 3, 1, 13, S[5]); px2(g, 0, 2, S[6]); }
    if (eR) { rect(g, 15, 2, 1, 14, S[0]); px2(g, 15, 1, S[2]); }
    deepTint(g, z, y);
    return c; });
}
function faceTile(z, x, y, eL, eR) {
  return once('fc' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 47), P = CUR, S = P.s;
    stoneFill(g, z, x, y, eL ? 4 : 3);
    for (const fx of [2 + ((r() * 4) | 0), 9 + ((r() * 5) | 0)]) { const len = 6 + ((r() * 9) | 0), y0 = (r() * (16 - len)) | 0; for (let yy = y0; yy < y0 + len; yy++) { px2(g, fx, yy, S[1]); px2(g, fx + 1, yy, eL ? S[5] : S[4]); } }   /* wind flutes */
    /* GUANO STREAKS running down the face from the ledge above: a white core, a grey shadow side, a rounded drip end */
    if (hash(x, y >> 1) % 4 !== 0) { const sx = 1 + ((hash(x * 3, y) % 11)), len = 7 + ((r() * 9) | 0), w = 1 + (r() < 0.4 ? 1 : 0), top = (y & 1) ? 0 : ((r() * 3) | 0);
      for (let q = top; q < Math.min(16, top + len); q++) { for (let k = 0; k < w; k++) px2(g, sx + k, q, k === 0 ? (q % 5 === 4 ? GUANO[1] : GUANO[2]) : GUANO[1]); px2(g, sx - 1, q, GUANO[0]); }
      px2(g, sx, Math.min(15, top + len), GUANO[1]); }
    if (r() < 0.35) lichen(g, z, 2 + ((r() * 11) | 0), 2 + ((r() * 11) | 0), r);
    if ((z === 3) && r() < 0.3) { const bx = 2 + ((r() * 9) | 0), by = 3 + ((r() * 9) | 0); rect(g, bx, by, 5, 2, BONE[2]); px2(g, bx, by, BONE[3]); px2(g, bx + 4, by + 1, BONE[1]); px2(g, bx - 1, by, BONE[1]); px2(g, bx + 5, by, BONE[1]); }   /* the Bone Stair: bones set in the wall */
    chips(g, r, z, 4);
    if (eL) { rect(g, 0, 0, 1, 16, S[6]); rect(g, 1, 0, 1, 16, S[5]); }
    if (eR) { rect(g, 15, 0, 1, 16, S[0]); rect(g, 14, 0, 1, 16, S[1]); g.globalAlpha = 0.2; rect(g, 11, 0, 3, 16, '#000'); g.globalAlpha = 1; }
    deepTint(g, z, y);
    return c; });
}
function ceilTile(z, x, y, eL, eR) {
  return once('ce' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 53), S = CUR.s;
    stoneFill(g, z, x, y, 2);
    g.globalAlpha = 0.5; rect(g, 0, 9, 16, 7, '#000'); g.globalAlpha = 0.28; rect(g, 0, 5, 16, 4, '#000'); g.globalAlpha = 1;
    for (let k = 0; k < 4; k++) { const nx = 1 + ((r() * 13) | 0), nl = 2 + ((r() * 6) | 0); rect(g, nx, 15 - nl, 1, nl, GUANO[r() < 0.5 ? 1 : 0]); px2(g, nx, 15, GUANO[2]); if (nl > 4) px2(g, nx, 15 - nl, GUANO[2]); }        /* guano and seep hanging from the roof of the overhang */
    rect(g, 0, 15, 16, 1, S[0]); if (eL) rect(g, 0, 0, 1, 16, S[5]); if (eR) rect(g, 15, 0, 1, 16, S[0]);
    deepTint(g, z, y);
    return c; });
}
function massTile(z, x, y, d) {
  return once('ma' + z + '_' + (x & 7) + '_' + (y & 3) + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + 41 + z), S = CUR.s;
    stoneFill(g, z, x, y, d <= 1 ? 3 : 2);
    g.globalAlpha = [0, 0.04, 0.07, 0.1, 0.12, 0.14, 0.16][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#0a0812'); g.globalAlpha = 1;
    if ((hash(x >> 2, y) % 4) === 0) { const yl = 3 + (hash(x, y * 7) % 10), yr = 3 + (hash(x + 1, y * 7) % 10); for (let k = 0; k < 16; k++) { const yy = Math.round(yl + (yr - yl) * k / 15 + Math.sin(k * 0.9 + x) * 0.9); px2(g, k, yy, mix(S[3], S[5], 0.5)); px2(g, k, yy + 1, S[1]); } }   /* a pale seam */
    if (r() < 0.22) { const sx = 1 + ((r() * 11) | 0), sy = 1 + ((r() * 11) | 0); rect(g, sx, sy, 3, 2, S[4]); rect(g, sx, sy + 2, 3, 1, S[1]); }
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? S[0] : S[3]);
    deepTint(g, z, y, 1.15);
    return c; });
}

/* ============================ ONEWAY: THE WIND-CUT SHELF ============================ */
function shelf(z, l, rr, v, bone) {
  return once('sh' + z + (l ? 'l' : '') + (rr ? 'r' : '') + v + (bone ? 'b' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(v * 19 + 7 + z * 5), S = CUR.s;
    rect(g, 0, 0, 16, 6, S[4]); rect(g, 0, 0, 16, 1, S[6]); rect(g, 0, 1, 16, 1, S[5]); rect(g, 0, 5, 16, 1, S[2]);                                          /* the slab: lit edge, body, shadow */
    rect(g, 0, 6, 16, 2, S[2]); rect(g, 0, 6, 16, 1, S[3]); rect(g, 0, 7, 16, 1, S[0]);                                                                    /* the scoured underside */
    for (let i = 0; i < 6; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 4) | 0), r() < 0.5 ? S[3] : S[5]);
    if (!bone) capBand(g, v * 5 + z, 3, false, false, S);   /* (claude/rookery2) the cap on a shelf's walking face too */
    if (r() < 0.55) { const gx = (r() * 9) | 0, gw = 3 + ((r() * 4) | 0); guanoCap(g, r, gx, gw, 2); if (r() < 0.6) { const dx = gx + ((r() * gw) | 0); for (let q = 2; q < 8; q++) px2(g, dx, q, GUANO[q % 2 ? 1 : 2]); } }
    if (bone) { for (let k = 0; k < 3; k++) { const bx = 1 + k * 5; rect(g, bx, 0, 4, 2, BONE[2]); px2(g, bx, 0, BONE[3]); px2(g, bx + 3, 1, BONE[1]); } rect(g, 0, 6, 16, 1, BONE[1]); }               /* the Bone Stair's shelves are paved with bones */
    else if (r() < 0.3) { const fx = 1 + ((r() * 10) | 0); px2(g, fx, 0, '#e6e4ec'); px2(g, fx + 1, 0, '#e6e4ec'); px2(g, fx + 2, 0, '#c0bece'); }
    if (l) { g.clearRect(0, 0, 3, 8); rect(g, 3, 0, 1, 1, S[6]); rect(g, 2, 1, 1, 4, S[5]); rect(g, 1, 4, 1, 2, S[4]); rect(g, 2, 5, 1, 3, S[1]); }                  /* a free end: the stone tapers */
    if (rr) { g.clearRect(13, 0, 3, 8); rect(g, 12, 1, 1, 4, S[3]); rect(g, 13, 4, 1, 2, S[2]); rect(g, 12, 5, 1, 3, S[0]); }
    g.globalAlpha = 0.22; rect(g, 0, 8, 16, 2, '#000'); g.globalAlpha = 1;
    return c; });
}

/* ============================ the cell ============================ */
export function rkTile(t, x, y, at, T, L) {
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET; };
  const z = Math.min(4, zoneOf(x)), pa = palAt(x), kq = Math.round(pa.k * 8) / 8;
  CURK = z + "/" + pa.nz + "/" + kq + ":";
  CUR = kq > 0 ? { ...PAL[z], s: PAL[z].s.map((c, i) => mix(c, PAL[pa.nz].s[i], kq)), haze: mix(PAL[z].haze, PAL[pa.nz].haze, kq) } : PAL[z];
  if (t === T.ONEWAY) { const same = k => at(x + k, y) === t; return shelf(z, !same(-1), !same(1), ((x * 5 + y) % 3 + 3) % 3, z === 3); }
  if (t !== T.SOLID) return null;
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  if (up) return topTile(z, x, y, eL, eR);
  if (down) return ceilTile(z, x, y, eL, eR);
  if (eL || eR) return faceTile(z, x, y, eL, eR);
  return massTile(z, x, y, depthOf(open));
}
