// crown_tiles.js — HIGHCROWN: the Queen's masonry, and the mountain it is built up.
// The castle was drawn with the crags' own tiles, so a gatehouse, a keep and a curtain wall were grey rock with a
// dusting of grass on top, and nothing in the level said CASTLE except the rooms inside it. This is the set for
// the stone that was LAID: cold granite ashlar in courses, a coping with the snow on it, quoins where a wall turns a
// corner. The crag tiles stay on everything the masons did not build, so a tower reads as growing out of the rock.
// And one background layer: the far shoulders of the mountain with her walls and towers climbing them.
// Same conventions as city_tiles.js: 16x16 tiles, crisp px.js primitives, fixed seeds, the caller's seed for layers.
import { canvas, px, rect, mulberry, rgb, hex } from './px.js';

const T = 16;
// granite in the cold: `top` the coping (the palest laid stone), `l`/`m`/`d` the block faces, `mor` the joints
const GR = { snow: '#eef2fa', snowD: '#c6cedf', top: '#a2a5b6', hi: '#8c8fa1', l: '#75788a', m: '#636575', d: '#525462', deep: '#3b3c47', mor: '#2a2b34' };
// lichen, the only colour a north wall keeps
const LICH = ['#7c8a60', '#5f6c4a'];

// ---------- the stone body ----------
// One course pitch for the whole set: a course is 8 rows with its bed joint in the last row, so rows 7 and 15 are
// always mortar and any tile stacks under any other. Perpends every 12 px, half a block over on alternate courses.
const bed = y => (y & 7) === 7;
function ashlar(g, rnd, dark) {
  for (let y = 0; y < T; y++) {
    const k = y & 7;
    const base = k === 7 ? GR.mor : k === 0 ? GR.l : k < 5 ? GR.m : GR.d;
    for (let x = 0; x < T; x++) px(g, x, y, base);
    if (k === 0) for (let x = 0; x < T; x++) if (rnd() < 0.35) px(g, x, y, GR.hi);   /* the lit arris of each block */
  }
  for (let y = 0; y < T; y++) { const off = (y >> 3) & 1 ? 6 : 0;
    for (let x = 0; x < T; x++) if (((x + off) % 12) === 0 && !bed(y)) px(g, x, y, GR.mor); }
  for (let i = 0; i < 10; i++) { const x = (rnd() * T) | 0, y = (rnd() * T) | 0; if (!bed(y)) px(g, x, y, rnd() < 0.5 ? GR.d : GR.l); }   /* the grain */
  if (rnd() < 0.45) { const x = 1 + ((rnd() * 13) | 0), y = 1 + ((rnd() * 5) | 0) + (rnd() < 0.5 ? 8 : 0); px(g, x, y, LICH[0]); px(g, x + 1, y, LICH[1]); }
  if (dark) for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (rnd() < dark) px(g, x, y, bed(y) ? GR.mor : GR.deep);
}

// THE WALKED TOP: a coping course with a drip under it and the snow lying on it. eL/eR turn the corner.
function crownTop(seed, eL, eR) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T);
  ashlar(g, rnd, 0);
  rect(g, 0, 0, T, 5, GR.top); rect(g, 0, 3, T, 2, GR.hi); rect(g, 0, 5, T, 1, GR.deep);   /* the coping and its drip */
  for (let x = 0; x < T; x++) { px(g, x, 0, GR.snow); if (rnd() < 0.55) px(g, x, 1, rnd() < 0.5 ? GR.snow : GR.snowD); }
  for (let i = 0; i < 3; i++) { const x = (rnd() * T) | 0; px(g, x, 2, GR.snowD); if (rnd() < 0.4) px(g, x, 6, GR.snowD); }   /* and it drifting over the lip */
  for (let x = (seed % 3) * 4 + 2; x < T; x += 8) px(g, x, 4, GR.mor);                    /* the joints in the coping */
  if (eL) for (let y = 0; y < T; y++) { px(g, 0, y, y < 2 ? GR.snowD : GR.deep); if (y > 1) px(g, 1, y, bed(y) ? GR.mor : GR.d); }
  if (eR) for (let y = 0; y < T; y++) { px(g, T - 1, y, y < 2 ? GR.snowD : GR.deep); if (y > 1) px(g, T - 2, y, bed(y) ? GR.mor : GR.d); }
  return c;
}
// A CORNER: quoins, long and short on alternate courses, and the hard shadow of the arris
function crownEdge(seed, eL, eR) {
  const rnd = mulberry(seed), [c, g] = canvas(T, T);
  ashlar(g, rnd, 0);
  const quoin = (side) => { for (let y = 0; y < T; y++) { const long = ((y >> 3) & 1) === 0, w = long ? 9 : 5;
    for (let i = 0; i < w; i++) { const x = side < 0 ? i : T - 1 - i; px(g, x, y, bed(y) ? GR.mor : ((y & 7) === 0 ? GR.hi : GR.l)); }
    px(g, side < 0 ? w : T - 1 - w, y, GR.mor); px(g, side < 0 ? 0 : T - 1, y, GR.deep); } };
  if (eL) quoin(-1); if (eR) quoin(1);
  return c;
}
// DEEP IN A WALL: the same bond, in its own shadow
function crownFill(seed) { const rnd = mulberry(seed), [c, g] = canvas(T, T); ashlar(g, rnd, 0.3); return c; }

export function bakeCrownTiles() {
  const top = {}, edge = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) {
    const k = eL + '' + eR;
    top[k] = [0, 1, 2, 3].map(i => crownTop(8100 + i + eL * 7 + eR * 13, eL, eR));
    edge[k] = [0, 1].map(i => crownEdge(8200 + i + eL * 3 + eR * 5, eL, eR));
  }
  const fill = [0, 1, 2, 3].map(i => crownFill(8300 + i));
  return { top, edge, fill, silt: fill.slice(0, 3), wet: [0, 1, 2].map(i => crownTop(8400 + i, 0, 0)) };
}

// ---------- the background ----------
// HER WALLS UP THE MOUNTAIN. A shoulder of the range, and a curtain wall running along its crest with square towers
// standing up out of it every so often - some lit, some roofed, all of them snowed on. It sits where the crags' mid
// ridge sat, so the far peaks still show over it. Tiles horizontally: the ridge is periodic in the width and every
// tower is drawn at -w, 0 and +w.
export function bakeMidCrown(w, h, seed) {
  const rnd = mulberry(seed), [c, g] = canvas(w, h);
  const ph = [rnd() * 6, rnd() * 6];
  const yAt = x => { const u = x / w * Math.PI * 2; return Math.round(58 + 20 * Math.sin(u * 2 + ph[0]) + 8 * Math.sin(u * 5 + ph[1])); };
  // the shoulder, with scree runs and snow lying in the high hollows
  for (let x = 0; x < w; x++) { const y = yAt(x); rect(g, x, y, 1, h - y, '#4a4460'); rect(g, x, y, 1, 2, '#62597a'); if ((x % 11) < 3) rect(g, x, y + 12, 1, h, '#423c56');
    if (y < 48 && (x % 7) < 5) rect(g, x, y + 1, 1, 2 + ((x * 7) % 3), '#c9cfe0'); }
  for (let i = 0; i < w / 7; i++) { const x = (rnd() * w) | 0, y = yAt(x) + 6 + ((rnd() * 40) | 0); px(g, x, y, rnd() < 0.5 ? '#5a5270' : '#3c3650'); }
  // the curtain along the crest: a band of wall with its crenels, riding the ridge
  const wallTop = x => yAt(x) - 9;
  for (let x = 0; x < w; x++) { const t = wallTop(x); rect(g, x, t + 3, 1, 8, '#646680'); px(g, x, t + 3, '#8284a0'); if ((x % 5) < 3) rect(g, x, t, 1, 3, '#646680'); if ((x % 5) < 3) px(g, x, t, '#dfe5f2');
    if ((x % 9) === 4) rect(g, x, t + 6, 1, 2, '#2e2c3c'); }                                /* slits in it */
  // the towers
  const towers = [];
  for (let i = 0; i < 6; i++) towers.push({ x: Math.round(i * w / 6 + 14 + rnd() * 40), tw: 10 + ((rnd() * 6) | 0), th: 18 + ((rnd() * 18) | 0), roof: rnd() < 0.45, lit: rnd() < 0.7 });
  for (const tw of towers) for (const dx of [-w, 0, w]) {
    const x0 = tw.x + dx, base = yAt(((tw.x % w) + w) % w) + 4, top = base - 9 - tw.th;
    if (x0 + tw.tw < 0 || x0 >= w) continue;
    rect(g, x0, top, tw.tw, base - top + 10, '#6a6c86'); rect(g, x0, top, 1, base - top + 10, '#8a8ca6'); rect(g, x0 + tw.tw - 2, top, 2, base - top + 10, '#4e4f66');
    for (let yy = top + 5; yy < base; yy += 6) rect(g, x0 + 1, yy, tw.tw - 3, 1, '#5e6078');   /* its courses */
    if (tw.roof) { for (let k = 0; k <= Math.ceil(tw.tw / 2) + 1; k++) rect(g, x0 - 1 + k, top - k, tw.tw + 2 - k * 2, 1, k === 0 ? '#2e2638' : '#4a3a56'); }
    else { for (let k = 0; k < tw.tw; k += 3) { rect(g, x0 + k, top - 3, 2, 3, '#6a6c86'); px(g, x0 + k, top - 3, '#e6ebf5'); } }
    const wy = top + 6 + ((tw.th / 3) | 0);
    rect(g, x0 + (tw.tw >> 1) - 1, wy, 2, 4, tw.lit ? '#ffb84a' : '#24222e'); if (tw.lit) px(g, x0 + (tw.tw >> 1) - 1, wy + 1, '#fff0c0');
  }
  return c;
}

// ---------- the facades ----------
// WHAT STANDS BEHIND THE WALK. The level's tiles are the stone you can stand on; nothing drew the rest of the castle,
// so a wall walk was a plank across the sky, a gatehouse a slab of rock hanging over its own portcullis, and every
// chasm a slot of sunset cut straight down through the mountain to the bottom of the world. A facade is a wall face
// drawn behind the play, locked to the world like the tiles, a shade darker than them so it never reads as footing:
//   curtain  coursed wall with a crenellated parapet and arrow slits
//   tower    the same with quoins, a corbelled parapet or a slate roof (o.roof), a lit window, and a gate arch (o.arch:
//            [first row, last row] of the opening, counted from the facade's top)
//   chasm    the far wall of a drop: rock that goes black with depth
//   crag     a rock face under an overhang, lit, snow in its cracks
//   burning  a range of yard buildings on fire: black timbers, glowing windows, soot, heat from below
const mix = (a, b, k) => { const A = rgb(a), B = rgb(b); k = Math.max(0, Math.min(1, k)); return hex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k); };
export function bakeFacade(kind, tw, th, seed, o = {}) {
  const W = tw * T, H = th * T, rnd = mulberry((seed | 0) + 9001), [c, g] = canvas(W, H);
  if (kind === 'chasm' || kind === 'crag') {
    const lit = kind === 'crag', depth = k => lit ? k / (H * 2.2) : Math.min(1, k / 200);
    for (let y = 0; y < H; y++) rect(g, 0, y, W, 1, mix(lit ? '#4a4658' : '#3a3646', '#09080d', depth(y)));
    for (let i = 0; i < W * H / 70; i++) { const x = (rnd() * W) | 0, y = (rnd() * H) | 0, l = 2 + ((rnd() * 7) | 0);   /* the strata */
      rect(g, x, y, l, 1, mix(rnd() < 0.5 ? (lit ? '#5e5872' : '#4c465a') : '#26222e', '#060509', depth(y))); }
    for (let i = 0; i < Math.max(2, W / 20); i++) { let x = (rnd() * W) | 0; const y0 = (rnd() * H * 0.7) | 0, n = 16 + ((rnd() * 70) | 0);   /* and the cracks down it */
      for (let y = y0; y < Math.min(H, y0 + n); y++) { if (rnd() < 0.3) x += rnd() < 0.5 ? -1 : 1; px(g, x, y, mix('#18151e', '#040306', depth(y)));
        if (lit && rnd() < 0.08) px(g, x + 1, y, '#c9cfe0'); } }
    if (!lit) { rect(g, 0, 0, W, 2, '#58526a'); for (let x = 0; x < W; x += 3 + ((rnd() * 4) | 0)) rect(g, x, 2, 1, 1 + ((rnd() * 4) | 0), '#2a2632'); }   /* its lip, and the roots of the rock hanging off it */
    return c;
  }
  if (kind === 'burning') {
    for (let y = 0; y < H; y++) rect(g, 0, y, W, 1, mix('#171011', '#3a180c', y / H));   /* charred: the fire is in the windows, not the whole wall */
    for (let x = 0; x < W; x++) { const ry = 4 + Math.round(6 * Math.abs(Math.sin(x * 0.07 + seed)) + (rnd() < 0.12 ? 6 : 0)); g.clearRect(x, 0, 1, ry); px(g, x, ry, '#120a08'); }   /* a roofline that has burned ragged */
    const bay = 40, rail = 48;
    for (let y = rail - 20; y < H - 20; y += rail) for (let x = 8; x < W - 16; x += bay) {   /* the windows, most of them full of fire */
      const k = rnd(); if (k < 0.2) { rect(g, x + 10, y, 14, 16, '#0c0606'); rect(g, x + 10, y + 16, 14, 1, '#ff7a2c'); continue; }
      rect(g, x + 10, y, 14, 16, k < 0.6 ? '#e0602a' : '#b8401c'); rect(g, x + 13, y + 3, 8, 10, k < 0.6 ? '#ffd36b' : '#ff9a3c'); rect(g, x + 16, y, 2, 16, '#1a0c08'); rect(g, x + 10, y + 7, 14, 2, '#1a0c08');
      for (let s = 0; s < 14; s++) if (rnd() < 0.6) rect(g, x + 10 + s, y - 2 - ((rnd() * 12) | 0), 1, 3 + ((rnd() * 8) | 0), '#120a0a'); }   /* and the soot going up the wall over each */
    for (let x = 0; x < W; x += bay) rect(g, x, 0, 4, H, '#140c0a');
    for (let y = rail; y < H; y += rail) rect(g, 0, y, W, 3, '#140c0a');
    for (let y = H - 64; y < H; y++) { g.globalAlpha = (y - (H - 64)) / 64 * 0.45; rect(g, 0, y, W, 1, '#ff7a2c'); } g.globalAlpha = 1;
    for (let y = 0; y < H; y += 8) { const l = 2 + ((rnd() * 14) | 0), r = 2 + ((rnd() * 14) | 0); g.clearRect(0, y, l, 8); g.clearRect(W - r, y, r, 8); rect(g, l, y, 1, 8, '#0c0707'); rect(g, W - r - 1, y, 1, 8, '#0c0707'); }   /* and its ends broken off, not ruled */
    return c;
  }
  // curtain and tower: coursed granite a shade under the laid tiles, so it sits behind them
  const S = { f: '#46485c', l: '#525470', d: '#393a4d', mor: '#2b2c39', hi: '#62647e', slit: '#100f16', snow: '#dfe5f2', roof: '#3a3048', roofL: '#4e4060', win: '#ffb84a', winL: '#fff0c0' };
  /* THE DROWNED KING'S STONE (o.sea): the same courses under thirty years of sea - green-grey, weed where the snow lay, and the
     windows lit by nothing a man lit */
  if (o.sea) Object.assign(S, { f: '#2e3e40', l: '#3a4c4c', d: '#243232', mor: '#162022', hi: '#4a605c', slit: '#081012', snow: '#5a8a58', roof: '#26343a', roofL: '#34464a', win: '#3fa89a', winL: '#bff5ea' });
  const roofH = kind === 'tower' && o.roof ? Math.min(Math.round(W * 0.6), Math.round(H * 0.45)) : 0, cren = roofH ? 0 : 8;
  const by = roofH + cren;   /* where the body starts */
  for (let y = by; y < H; y++) { const k = (y - by) & 7; rect(g, 0, y, W, 1, k === 7 ? S.mor : k === 0 ? S.l : S.f);
    if (k !== 7) for (let x = (((y - by) >> 3) & 1) * 8; x < W; x += 16) px(g, x, y, S.mor); }
  for (let i = 0; i < W * H / 60; i++) { const x = (rnd() * W) | 0, y = by + ((rnd() * (H - by)) | 0); if (((y - by) & 7) !== 7) px(g, x, y, rnd() < 0.5 ? S.d : S.hi); }
  if (cren) { for (let x = 0; x < W; x += 16) { rect(g, x, 0, 10, cren, S.f); rect(g, x, 0, 10, 1, S.snow); rect(g, x + 9, 1, 1, cren - 1, S.d); }
    rect(g, 0, cren, W, 3, S.d); for (let x = 2; x < W; x += 4) px(g, x, cren + 3, S.mor); rect(g, 0, cren, W, 1, S.snow); }   /* the parapet and its corbels */
  if (roofH) { for (let y = 0; y < roofH; y++) { const half = Math.round((y + 1) / roofH * (W / 2 + 2)); const x0 = Math.round(W / 2 - half);
      rect(g, Math.max(0, x0), y, Math.min(W, half * 2), 1, (y % 4) === 3 ? S.roof : S.roofL); if (y % 4 === 0) px(g, Math.round(W / 2 - half) + 1, y, S.snow); }
    rect(g, (W >> 1) - 1, 0, 2, 3, '#8a919c'); }
  if (kind === 'tower') {
    for (let y = by; y < H; y++) { const long = (((y - by) >> 3) & 1) === 0; rect(g, 0, y, long ? 6 : 3, 1, ((y - by) & 7) === 7 ? S.mor : S.hi); rect(g, W - (long ? 6 : 3), y, long ? 6 : 3, 1, ((y - by) & 7) === 7 ? S.mor : S.d); }
    rect(g, W - 2, by, 2, H - by, S.mor);
    const mx = W >> 1;
    for (let y = by + 20; y < H - 24; y += 40) { rect(g, mx - 1, y, 2, 10, S.slit); rect(g, mx - 2, y - 1, 4, 1, S.hi); }   /* the slits up its middle */
    if (o.lit !== false && H - by > 40) { rect(g, mx - 3, by + 8, 6, 8, S.win); rect(g, mx - 1, by + 10, 2, 4, S.winL); rect(g, mx - 4, by + 7, 8, 1, S.hi); }
  } else for (let x = 20; x < W - 8; x += 48) { const y = by + 14; if (y + 12 < H) { rect(g, x, y, 2, 10, S.slit); rect(g, x - 1, y - 1, 4, 1, S.hi); } }
  if (o.arch) { const ay0 = o.arch[0] * T, ay1 = (o.arch[1] + 1) * T, ax0 = T >> 1, ax1 = W - (T >> 1), r = Math.min(12, (ax1 - ax0) >> 1);
    for (let y = ay0; y < ay1; y++) { const dy = y - ay0; let inset = 0; if (dy < r) inset = Math.round(r - Math.sqrt(r * r - (r - dy) * (r - dy)));
      rect(g, ax0 - 2 + inset, y, ax1 - ax0 + 4 - inset * 2, 1, S.hi); rect(g, ax0 + inset, y, ax1 - ax0 - inset * 2, 1, '#13121a'); } }
  return c;
}
