// sporewood2_tiles.js - SPOREWOOD 2's TILE KIT (claude/sporewood2art). The greybox wore the old wood's violet dirt in every place. This is soil and root and fungus, and it CHANGES with the
// area (sporewood2_pal.js): olive-umber earth with white mycelium cords in the glade, indigo loam with foxfire specks in the hollows, wet peat in the bog, bone-grey clay in the larder,
// root-red bark-earth at her knot, plum under her cap.
//   SOLID    TOP   packed soil with a living lip (moss + mycelium threads + a toadstool now and then, foxfire on the hollows', wet gleam on the bog's, bone and web in the larder's)
//            FACE  a wall of earth: crumbs, buried stones, root cords running down it, the lit side to the left
//            CEIL  the underside, hung with mycelium threads (and gills where a cap roofs it)
//            MASS  packed earth; mycelium runs through it in pale branching veins; darker the deeper
//   ONEWAY   BRACKET FUNGUS (a shelf mushroom): a rounded tan shelf with growth rings, pale pores under it, a stub of stalk at the wall end
//   BOUNCER  THE BOUNCE CAP: a plump cream-tan cap, foxfire spots, gills under it (squash = pressed flat)
// px.js primitives, 16x16, baked lazily, memoised.   sporeTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';
import { PAL, GLOW, zoneOf, hash, mix } from './sporewood2_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
/* the soil: a ramp pixel by ABSOLUTE position so clods run on across neighbours; a few darker pits and lighter grit */
function soilFill(g, z, x, y, base, lit) {
  const S = PAL[z].s;
  for (let py = 0; py < 16; py++) for (let pxl = 0; pxl < 16; pxl++) {
    const ax = x * 16 + pxl, ay = y * 16 + py, h = hash(ax >> 1, ay >> 1), j = (h >> 4) % 11 === 0 ? -1 : (h >> 4) % 13 === 0 ? 1 : 0;
    const band = (ay >> 3) % 2 ? 0 : 0;   /* (the strata are drawn per tile type) */
    px2(g, pxl, py, S[Math.max(0, Math.min(6, base + j + band + (lit ? 1 : 0)))]); }
}
function crumb(g, r, z, n, lo = 0, hi = 16) { const S = PAL[z].s; for (let i = 0; i < n; i++) { const x = (r() * 16) | 0, y = lo + ((r() * (hi - lo)) | 0); px2(g, x, y, r() < 0.5 ? S[1] : S[4]); if (r() < 0.4) px2(g, x + 1, y, S[2]); } }
/* a buried stone: a rounded lump, lit top-left */
function stone(g, z, cx, cy, w, h) { const S = PAL[z].s; for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) { const e = (dx === 0 || dx === w - 1) && (dy === 0 || dy === h - 1); if (e) continue; px2(g, cx + dx, cy + dy, dy === 0 ? S[5] : dx === 0 ? S[4] : dy === h - 1 || dx === w - 1 ? S[1] : S[3]); } }
/* a toadstool, 3-5 px tall, on a lip at (x, 0): dark cap with a pale top, a pale stalk */
function toadstool(g, z, x, big) { const cap = PAL[z].cap, h = big ? 3 : 2;
  px2(g, x, 1, PAL[z].thread); px2(g, x, 2, PAL[z].thread); rect(g, x - h, 0, h * 2 + 1, 1, cap[1]); px2(g, x - h + 1, 0, cap[2]); px2(g, x, 0, cap[2]); if (big) { px2(g, x - h, 1, cap[0]); px2(g, x + h, 1, cap[0]); } }
/* mycelium: a branching pale thread, from (x0, y0) running sideways/down, broken */
function thread(g, r, z, x0, y0, len, dir, col) { let x = x0, y = y0; for (let i = 0; i < len; i++) { px2(g, x, y, col || PAL[z].thread); if (r() < 0.55) x += dir; else y += r() < 0.5 ? 1 : 0; if (r() < 0.08) break; } }
const deepA = y => y < 30 ? 0 : Math.min(0.5, (y - 30) * 0.03);
function deepTint(g, y, mul = 1) { for (let py = 0; py < 16; py++) { const a = deepA(y + py / 16) * mul; if (a < 0.01) continue; g.globalAlpha = a; rect(g, 0, py, 16, 1, '#06040a'); } g.globalAlpha = 1; }

/* ============================ TOP ============================ */
function topTile(z, x, y, eL, eR) {
  return once('tp' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 31), P = PAL[z], S = P.s, F = P.fung;
    soilFill(g, z, x, y, 3, false);
    rect(g, 0, 0, 16, 3, S[4]); rect(g, 0, 3, 16, 1, S[2]); rect(g, 0, 4, 16, 1, S[1]);                                                  /* the turf of packed soil, its shadow line */
    /* the living lip: moss, ragged; mycelium threads over it */
    for (let k = 0; k < 16; k++) { const hh = (hash(x * 16 + k, y) >> 5) % 4, h = hh === 0 ? 1 : hh < 3 ? 2 : 3; rect(g, k, 0, 1, h, F[hh === 3 ? 2 : hh === 0 ? 0 : 1]); if (h >= 2) px2(g, k, 0, F[2]); }
    for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 2) | 0), r() < 0.5 ? S[5] : F[1]);
    /* THE WHITE THREADS OF THE MYCELIUM hanging off the lip into the earth, three or four, some branching */
    for (let k = 0; k < 4; k++) { const fx = 1 + ((r() * 14) | 0), fl = 2 + ((r() * 5) | 0); for (let yy = 0; yy < fl; yy++) px2(g, fx + (yy > 2 && k % 2 ? 1 : 0), 5 + yy, yy === fl - 1 ? S[2] : P.thread); }
    /* each place's own touch */
    if (z === 0) { if (r() < 0.5) toadstool(g, z, 2 + ((r() * 12) | 0), r() < 0.4); }
    else if (z === 1) { for (let i = 0; i < 3; i++) { const gx = (r() * 16) | 0; px2(g, gx, 1, GLOW.mid); if (r() < 0.6) px2(g, gx, 2, GLOW.lo); } if (r() < 0.2) px2(g, 3 + ((r() * 10) | 0), 0, GLOW.hi); }   /* foxfire specks */
    else if (z === 2) { rect(g, 0, 1, 16, 1, mix(F[1], '#cfe4a0', 0.3)); for (let i = 0; i < 2; i++) px2(g, (r() * 16) | 0, 2, '#c4dc8c'); if (r() < 0.35) { const sx = 2 + ((r() * 12) | 0); rect(g, sx, -0, 1, 2, F[2]); } }   /* wet moss, a bright sheen */
    else if (z === 3) { if (r() < 0.55) { const bx = 2 + ((r() * 11) | 0); rect(g, bx, 1, 4, 1, '#e8e0c8'); px2(g, bx, 2, '#bfb496'); px2(g, bx + 3, 2, '#bfb496'); } for (let k = 0; k < 3; k++) px2(g, (r() * 16) | 0, 0, '#ece8d8'); }   /* a bone, a wisp of web */
    else if (z === 4) { for (let k = 0; k < 3; k++) { const fx = 1 + ((r() * 14) | 0); rect(g, fx, 3, 1, 3 + ((r() * 4) | 0), S[5]); px2(g, fx, 2, S[6]); } if (r() < 0.2) px2(g, 4 + ((r() * 8) | 0), 1, GLOW.mid); }
    else { for (let k = 0; k < 2; k++) { const gx = 2 + ((r() * 12) | 0); px2(g, gx, 1, GLOW.c); px2(g, gx, 2, GLOW.lo); } if (r() < 0.4) toadstool(g, z, 2 + ((r() * 12) | 0), true); }
    if (r() < 0.2) stone(g, z, 2 + ((r() * 9) | 0), 8 + ((r() * 4) | 0), 3, 2);
    crumb(g, r, z, 5, 6, 16);
    if (eL) { rect(g, 0, 3, 1, 13, S[5]); px2(g, 0, 2, S[6]); }                                                                         /* the lit corner */
    if (eR) { rect(g, 15, 2, 1, 14, S[0]); px2(g, 15, 1, S[2]); }
    deepTint(g, y);
    return c; });
}
/* ============================ FACE ============================ */
function faceTile(z, x, y, eL, eR) {
  return once('fc' + z + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + z * 47), P = PAL[z], S = P.s;
    soilFill(g, z, x, y, eL ? 3 : 2, !!eL);
    /* strata: two faint horizontal bands of different earth, broken */
    for (const by of [3 + ((r() * 3) | 0), 10 + ((r() * 4) | 0)]) for (let k = 0; k < 16; k++) if (hash(k + x * 16, by) % 5 > 0) px2(g, k, by, S[eL ? 4 : 3]);
    /* a root cord running down the wall, a pale rib beside it */
    for (const fx of [2 + ((r() * 5) | 0), 9 + ((r() * 5) | 0)]) { const len = 5 + ((r() * 9) | 0), y0 = (r() * (16 - len)) | 0; for (let yy = y0; yy < y0 + len; yy++) { px2(g, fx, yy, S[0]); px2(g, fx + 1, yy, eL ? S[5] : P.thread); } }
    if (r() < 0.5) stone(g, z, 3 + ((r() * 9) | 0), 3 + ((r() * 8) | 0), 3 + ((r() * 2) | 0), 3);
    if (z === 1 && r() < 0.5) { const gx = 2 + ((r() * 12) | 0), gy = 2 + ((r() * 12) | 0); px2(g, gx, gy, GLOW.mid); px2(g, gx + 1, gy, GLOW.lo); }
    if (z === 5 && r() < 0.5) { const gx = 2 + ((r() * 12) | 0), gy = 2 + ((r() * 12) | 0); for (let k = 0; k < 4; k++) px2(g, gx + k, gy + (k % 2), GLOW.lo); px2(g, gx + 1, gy, GLOW.c); }
    if (z === 3 && (hash(x, y) % 7) === 0) { const bx = 3 + (hash(y, x) % 8); rect(g, bx, 6, 5, 1, '#e8e0c8'); rect(g, bx - 1, 5, 2, 2, '#e8e0c8'); rect(g, bx + 4, 5, 2, 2, '#e8e0c8'); }   /* a buried bone */
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
    /* hanging mycelium threads, and (under a cap's roof) pale gill lines */
    for (let k = 0; k < 6; k++) { const nx = (r() * 15) | 0, nl = 1 + ((r() * 4) | 0); rect(g, nx, 15 - nl, 1, nl, P.thread); px2(g, nx, 15, S[0]); if (r() < 0.3) px2(g, nx + 1, 15 - nl, P.thread); }
    if (z === 1 || z === 5) for (let k = 0; k < 2; k++) { const gx = (r() * 16) | 0; px2(g, gx, 14, GLOW.mid); px2(g, gx, 15, GLOW.c); }
    rect(g, 0, 15, 16, 1, S[0]); if (eL) rect(g, 0, 0, 1, 16, S[5]); if (eR) rect(g, 15, 0, 1, 16, S[0]);
    deepTint(g, y);
    return c; });
}
/* ============================ MASS ============================ */
function massTile(z, x, y, d) {
  return once('ma' + z + '_' + (x & 7) + '_' + (y & 3) + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + 41 + z), P = PAL[z], S = P.s;
    soilFill(g, z, x, y, d <= 1 ? 2 : 1, false);
    g.globalAlpha = [0, 0.05, 0.1, 0.14, 0.18, 0.21, 0.24][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#080410'); g.globalAlpha = 1;
    /* THE MYCELIUM: a pale branching vein running through the earth (dim where it is deep), with a foxfire bead where it forks in the hollows and her hollow */
    if ((hash(x >> 1, y) % 3) === 0) { const y0 = 3 + ((r() * 9) | 0), sl = r() < 0.5 ? -1 : 1; for (let k = 0; k < 16; k++) { const yy = y0 + Math.round(sl * Math.sin(k / 16 * Math.PI) * 3); px2(g, k, yy, mix(P.thread, S[2], Math.min(0.75, d * 0.13))); if (k % 5 === 2) px2(g, k, yy + 1, mix(P.thread, S[2], 0.6)); }
      if ((z === 1 || z === 5) && r() < 0.5) px2(g, 4 + ((r() * 8) | 0), y0 + 1, GLOW.lo); }
    if (r() < 0.3) stone(g, z, 1 + ((r() * 11) | 0), 1 + ((r() * 11) | 0), 3, 3);
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? S[0] : S[3]);
    deepTint(g, y, 1.15);
    return c; });
}
/* ============================ BRACKET FUNGUS (the one-way shelf) ============================ */
function bracket(z, l, rr, v) {
  return once('br' + z + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 17 + z), P = PAL[z], cp = P.cap;
    /* the shelf: a thick tan cap with its top lit, growth rings in the face, the pale pores underneath, rounded at a free end */
    rect(g, 0, 0, 16, 5, cp[1]); rect(g, 0, 0, 16, 1, cp[2]); rect(g, 0, 1, 16, 1, mix(cp[2], cp[1], 0.4)); rect(g, 0, 4, 16, 1, cp[0]);
    for (let k = 0; k < 16; k += 2) px2(g, k + (v & 1), 2 + (k % 4 === 0 ? 0 : 1), mix(cp[1], cp[0], 0.5));                                   /* growth rings */
    rect(g, 0, 5, 16, 1, '#e8ddc0'); for (let k = 0; k < 16; k++) if ((k + v) % 2) px2(g, k, 6, '#b6a880'); rect(g, 0, 7, 16, 1, '#7a6c50'); g.globalAlpha = 0.25; rect(g, 0, 8, 16, 2, '#000'); g.globalAlpha = 1;   /* the pores */
    if (z === 1) { px2(g, 3 + v * 3, 0, GLOW.hi); px2(g, 4 + v * 3, 1, GLOW.mid); }
    for (let i = 0; i < 3; i++) px2(g, (r() * 16) | 0, 2, cp[2]);
    if (l) { g.clearRect(0, 0, 3, 8); rect(g, 2, 0, 1, 1, cp[2]); rect(g, 1, 1, 2, 3, cp[1]); rect(g, 0, 2, 1, 2, cp[1]); rect(g, 0, 4, 3, 1, cp[0]); rect(g, 1, 5, 3, 1, '#e8ddc0'); rect(g, 2, 6, 2, 1, '#b6a880'); }
    if (rr) { g.clearRect(13, 0, 3, 8); rect(g, 12, 0, 1, 1, cp[2]); rect(g, 12, 1, 3, 3, cp[1]); rect(g, 15, 2, 1, 2, cp[0]); rect(g, 12, 4, 3, 1, cp[0]); rect(g, 12, 5, 3, 1, '#e8ddc0'); rect(g, 12, 6, 2, 1, '#b6a880'); }
    return c; });
}
export const bracketTile = (z, l, r, v) => bracket(z, l, r, v);
/* ============================ THE BOUNCE CAP ============================ */
export function bounceCap(x, squash) {
  const z = zoneOf(x), cp = PAL[z].cap;
  return once('bc' + z + (squash ? 's' : ''), () => { const [c, g] = canvas(16, 16), top = squash ? 4 : 1, hh = squash ? 5 : 7, tan = [mix(cp[0], '#6a4a30', 0.4), mix(cp[1], '#d8bc84', 0.5), mix(cp[2], '#f4e6c0', 0.55)];
    for (let dy = 0; dy < hh; dy++) { const k = dy / (hh - 1), w = Math.round(squash ? 7.5 + 0.5 * k : 4 + 4 * Math.sin(Math.min(1, (dy + 1) / (hh * 0.7)) * Math.PI / 2)); rect(g, 8 - w, top + dy, w * 2, 1, dy === 0 ? tan[2] : dy < 2 ? mix(tan[2], tan[1], 0.5) : dy < hh - 2 ? tan[1] : tan[0]); }
    rect(g, 3, top + 1, 4, 1, tan[2]);
    /* THE SPOTS ARE THE FOXFIRE: the one glow marks the cap that throws you */
    for (const [sx, sy] of [[5, 2], [10, 2], [8, 4], [12, 4], [4, 4]]) if (top + sy < top + hh) { px2(g, sx, top + sy, GLOW.c); px2(g, sx + 1, top + sy, GLOW.mid); px2(g, sx, top + sy - 1, GLOW.hi); }
    rect(g, squash ? 0 : 1, top + hh, squash ? 16 : 14, 1, '#ece0c0'); for (let k = squash ? 1 : 2; k < (squash ? 15 : 14); k += 2) px2(g, k, top + hh + 1, '#9c8c66');
    if (!squash) { rect(g, 6, top + hh + 2, 4, 4, '#cdbf9a'); rect(g, 6, top + hh + 2, 1, 4, '#efe6c8'); }
    return c; }); }

export function sporeTile(t, x, y, at, T, L) {
  if (t === T.BOUNCER) return bounceCap(x, false);
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET; };
  const z = zoneOf(x);
  if (t === T.ONEWAY) { const same = k => at(x + k, y) === t, l = !same(-1), r = !same(1), v = ((x * 5 + y) % 3 + 3) % 3; return bracket(z, l, r, v); }
  if (t !== T.SOLID) return null;
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  if (up) return topTile(z, x, y, eL, eR);
  if (down) return ceilTile(z, x, y, eL, eR);
  if (eL || eR) return faceTile(z, x, y, eL, eR);
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } }
  return massTile(z, x, y, d);
}
