// crown_tiles.js — HIGHCROWN: the Queen's masonry, and the mountain it is built up.
// The castle was drawn with the crags' own tiles, so a gatehouse, a keep and a curtain wall were grey rock with a
// dusting of grass on top, and nothing in the level said CASTLE except the rooms inside it. This is the set for
// the stone that was LAID: cold granite ashlar in courses, a coping with the snow on it, quoins where a wall turns a
// corner. The crag tiles stay on everything the masons did not build, so a tower reads as growing out of the rock.
// And one background layer: the far shoulders of the mountain with her walls and towers climbing them.
// Same conventions as city_tiles.js: 16x16 tiles, crisp px.js primitives, fixed seeds, the caller's seed for layers.
import { canvas, px, rect, mulberry } from './px.js';

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
