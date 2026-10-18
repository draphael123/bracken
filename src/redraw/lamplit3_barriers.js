// lamplit3_barriers.js - THE LAMPLIT STREET 3's BARRIERS as landmarks (claude/lamplit3art). The greybox laid each of these as plain blocks of the city's stone; they are the
// level's three "you cannot go this way" statements, so each one is drawn as a PLACE: the MARKET HOUSE (a blind fish-merchant's front across the roof road: iron-shuttered
// shop, a fish in relief, an iron sign bracket), the PROCESSION WALL (a funerary wall carved with a frieze of lantern-bearing mourners), and the LAMP WORKS' brickwork (the east
// door bricked up to a window with a dressed sill, the west door under its riveted iron lintel, the roof's plate girder). L.lpBarriers (level.js) says where; the
// geometry is the level's own blocks - this only paints them. Each barrier is baked ONCE as one big canvas and sliced 16x16 for the tile pipeline.
import { canvas, px, rect, mulberry } from '../px.js';
import { LC } from './lamplit3_tiles.js';

const TS = 16;
const P = (g, x, y, c) => { if (x >= 0 && y >= 0) px(g, x, y, c); };
/* a field of ashlar: courses of dressed blocks with staggered joints, a lit top edge and a dark joint on each, the odd stone stained */
function ashlar(g, x0, y0, w, h, seed, ch = 10, pal = [LC.st1, LC.st2, LC.st3, LC.st0]) {
  const r = mulberry(seed); let course = 0;
  for (let y = y0; y < y0 + h; y += ch, course++) {
    let x = x0 - ((course * 7 + ((r() * 9) | 0)) % 13); const hh = Math.min(ch, y0 + h - y);
    while (x < x0 + w) { const bw = 12 + ((r() * 10) | 0), xa = Math.max(x, x0), xb = Math.min(x + bw, x0 + w); const t = r();
      if (xb > xa) { rect(g, xa, y, xb - xa, hh, t < 0.25 ? pal[2] : t < 0.7 ? pal[1] : pal[0]); rect(g, xa, y, xb - xa, 1, pal[2]); if (x >= x0) rect(g, x, y, 1, hh, pal[3]);
        if (t > 0.9) { rect(g, xa + 2, y + 2, 3, 2, LC.alg0); P(g, xa + 2, y + 2, LC.alg1); } if (t < 0.12) { P(g, xa + 3, y + hh - 2, LC.st4); P(g, xa + 4, y + hh - 3, LC.st4); } }
      x += bw; }
    rect(g, x0, y + hh - 1, w, 1, pal[3]); }
}
/* an iron rivet, a bolt head with its tiny highlight */
const rivet = (g, x, y) => { P(g, x, y, LC.ir3); P(g, x, y + 1, LC.ir0); };
/* weed hanging off a ledge: n blades from (x, y) */
function weeps(g, x, y, n, seed) { const r = mulberry(seed); for (let i = 0; i < n; i++) { const xx = x + ((r() * 14) | 0), len = 2 + ((r() * 5) | 0); for (let k = 0; k < len; k++) P(g, xx + (k & 1), y + k, k < 2 ? LC.alg1 : LC.alg0); } }
const stain = (g, x, y, len, c) => { for (let k = 0; k < len; k++) P(g, x, y + k, k % 3 === 2 ? LC.st1 : c); };

/* ---------------------------------------------------------------- THE MARKET HOUSE (5 x 19 cells) ---------------------------------------------------------------- */
function house(w, h) {
  const [c, g] = canvas(w, h); rect(g, 0, 0, w, h, LC.st1); ashlar(g, 0, 8, w, h - 8, 7, 12);
  /* quoins: long and short stones down both corners, lit on their edge */
  for (let y = 12, k = 0; y < h - 8; y += 12, k++) for (const x of [0, w - 7]) { const lw = k & 1 ? 7 : 5; rect(g, x + (x ? 7 - lw : 0), y, lw, 11, LC.st3); rect(g, x + (x ? 7 - lw : 0), y, lw, 1, LC.st4); rect(g, x + (x ? 6 : lw - 1), y, 1, 11, LC.st0); }
  /* the cornice: a projecting course with dentils, a lit lip on top, a shadow under it */
  rect(g, 0, 0, w, 10, LC.st2); rect(g, 0, 0, w, 1, LC.lip); rect(g, 0, 1, w, 1, LC.lip2); for (let x = 2; x < w; x += 4) { rect(g, x, 5, 2, 3, LC.st3); rect(g, x + 2, 5, 1, 3, LC.st0); } rect(g, 0, 8, w, 1, LC.st3); rect(g, 0, 9, w, 2, LC.st0); rect(g, 0, 11, w, 1, LC.st1);
  /* three storeys of blind windows, iron shutters closed but for a slit of silted dark */
  const win = (x, y) => { rect(g, x - 3, y - 4, 22, 3, LC.st3); rect(g, x - 3, y - 4, 22, 1, LC.st4); rect(g, x - 2, y - 1, 20, 1, LC.st0);            /* the lintel */
    rect(g, x, y, 16, 24, LC.ir0); rect(g, x - 1, y, 1, 24, LC.st0); rect(g, x + 16, y, 1, 24, LC.st0);
    for (let yy = y + 1; yy < y + 23; yy += 4) { rect(g, x + 1, yy, 14, 3, LC.ir1); rect(g, x + 1, yy, 14, 1, LC.ir2); P(g, x + 2, yy + 1, LC.ir3); P(g, x + 13, yy + 1, LC.ir3); }   /* the shutter slats */
    rect(g, x + 7, y + 6, 2, 11, LC.ir0); rect(g, x + 7, y + 7, 1, 9, '#16262a'); P(g, x + 7, y + 11, '#2f5a52');                                                      /* the slit: a green glint of silt-light */
    rect(g, x - 3, y + 24, 22, 3, LC.st3); rect(g, x - 3, y + 24, 22, 1, LC.lip2); rect(g, x - 2, y + 27, 20, 1, LC.st0);                                             /* the sill */
    stain(g, x + 4, y + 28, 7, LC.rust1); stain(g, x + 12, y + 28, 5, LC.alg0); };
  for (const y of [32, 98, 164]) { win(14, y); win(50, y); }
  for (const y of [86, 152, 218]) { rect(g, 0, y, w, 3, LC.st3); rect(g, 0, y, w, 1, LC.st4); rect(g, 0, y + 3, w, 1, LC.st0); }                          /* string courses */
  /* the SIGN BAND over the shop: a recessed panel with a fish carved in relief */
  rect(g, 8, 226, w - 16, 26, LC.st0); rect(g, 9, 227, w - 18, 24, LC.st2); rect(g, 9, 227, w - 18, 1, LC.st4); rect(g, 9, 250, w - 18, 1, LC.st0);
  const fx = 20, fy = 233; rect(g, fx + 4, fy + 2, 26, 8, LC.bone1); rect(g, fx + 6, fy, 20, 12, LC.bone1); rect(g, fx + 6, fy, 20, 1, LC.bone2); rect(g, fx + 28, fy + 1, 7, 10, LC.bone1); rect(g, fx + 34, fy - 1, 3, 12, LC.bone1);   /* its body, tail */
  rect(g, fx + 8, fy + 3, 2, 2, LC.st0); P(g, fx + 8, fy + 3, LC.bone2); for (let k = 0; k < 4; k++) rect(g, fx + 13 + k * 3, fy + 4, 1, 5, LC.bone0); rect(g, fx + 8, fy + 9, 18, 1, LC.bone0);          /* eye, scales, belly */
  rect(g, 12, 236, 5, 2, LC.bone0); rect(g, w - 17, 236, 5, 2, LC.bone0);                                                                                    /* the panel's ties */
  /* the SHOPFRONT: a dressed arch over an iron roller shutter, pulled down and chained, a plinth under it */
  const sx = 9, sy = 254, sw = w - 18, sh = h - sy - 6;
  rect(g, sx - 2, sy - 2, sw + 4, 4, LC.st3); rect(g, sx - 2, sy - 2, sw + 4, 1, LC.st4); rect(g, sx - 3, sy + 2, sw + 6, 1, LC.st0);
  rect(g, sx, sy + 2, sw, sh, LC.ir0);
  for (let y = sy + 3, k = 0; y < sy + 2 + sh; y += 3, k++) { rect(g, sx + 1, y, sw - 2, 2, k & 1 ? LC.ir1 : LC.ir2); rect(g, sx + 1, y + 2, sw - 2, 1, LC.ir0); }
  for (let y = sy + 5; y < sy + 2 + sh; y += 15) { rivet(g, sx + 3, y); rivet(g, sx + sw - 4, y); }
  rect(g, sx, sy + 2, 3, sh, LC.ir1); rect(g, sx + sw - 3, sy + 2, 3, sh, LC.ir1); rect(g, sx, sy + 2, 1, sh, LC.ir3);                                          /* the guide rails */
  /* the chain and the padlock across the middle: an iron fish-trader's lock */
  for (let x = sx + 2; x < sx + sw - 2; x += 3) { rect(g, x, sy + 28 + ((x >> 1) & 1), 2, 2, LC.ir4); P(g, x, sy + 28 + ((x >> 1) & 1), LC.ir3); }
  rect(g, sx + (sw >> 1) - 3, sy + 31, 7, 7, LC.rust2); rect(g, sx + (sw >> 1) - 3, sy + 31, 7, 1, LC.bone2); rect(g, sx + (sw >> 1) - 1, sy + 27, 3, 4, LC.ir3); P(g, sx + (sw >> 1), sy + 34, LC.ir0);
  for (let k = 0; k < 4; k++) stain(g, sx + 6 + k * 14, sy + 38 + (k & 1) * 4, 9 + k, LC.rust1);                                                              /* rust weeping off the shutter */
  /* the sign bracket on the right: an iron arm and a fish-shaped iron sign hanging from it (it stands proud of the wall: dark against the stone) */
  rect(g, w - 14, 218, 12, 2, LC.ir2); rect(g, w - 14, 218, 12, 1, LC.ir4); for (let k = 0; k < 7; k++) P(g, w - 14 + k, 220 + k, LC.ir2);
  weeps(g, 4, 86, 4, 3); weeps(g, w - 20, 152, 3, 5);
  rect(g, 0, h - 6, w, 6, LC.st0); rect(g, 0, h - 6, w, 1, LC.st2); for (let x = 3; x < w; x += 9) P(g, x, h - 4, LC.alg1);                                    /* the plinth, weed in its joints */
  return c;
}

/* ---------------------------------------------------------------- THE PROCESSION WALL (3 x 17 cells) ---------------------------------------------------------------- */
function wall(w, h) {
  const [c, g] = canvas(w, h); rect(g, 0, 0, w, h, LC.st1); ashlar(g, 0, 10, w, h - 10, 31, 14, [LC.st1, LC.st2, LC.st3, LC.st0]);
  /* the coping: capstones with a lit lip */
  rect(g, 0, 0, w, 9, LC.st3); rect(g, 0, 0, w, 1, LC.lip); rect(g, 0, 1, w, 1, LC.lip2); for (let x = 7; x < w; x += 14) rect(g, x, 1, 1, 8, LC.st0); rect(g, 0, 8, w, 1, LC.st0); rect(g, 0, 9, w, 1, LC.st4); rect(g, 0, 10, w, 2, LC.st0);
  /* pilasters on both edges */
  for (const x of [0, w - 5]) { rect(g, x, 12, 5, h - 12, LC.st3); rect(g, x, 12, 1, h - 12, LC.st4); rect(g, x + 4, 12, 1, h - 12, LC.st0); for (let y = 18; y < h; y += 14) rect(g, x, y, 5, 1, LC.st0); }
  /* a FRIEZE of mourners, twice: hooded figures in procession, each with a lantern held up (carved in relief, bone against the recess) */
  const band = (y0) => { rect(g, 6, y0, w - 12, 38, LC.st0); rect(g, 7, y0 + 1, w - 14, 36, LC.st2); rect(g, 7, y0 + 1, w - 14, 1, LC.st3); rect(g, 7, y0 + 36, w - 14, 1, LC.st0);
    for (let i = 0; i < 3; i++) { const fx = 9 + i * 12; const c0 = i === 1 ? LC.bone1 : LC.bone0;
      rect(g, fx + 2, y0 + 7, 5, 5, c0); rect(g, fx + 3, y0 + 7, 3, 1, LC.bone2);                                    /* the hood */
      rect(g, fx + 1, y0 + 12, 7, 18, c0); rect(g, fx, y0 + 28, 9, 6, c0); rect(g, fx + 1, y0 + 12, 1, 18, LC.bone2); rect(g, fx + 6, y0 + 13, 1, 20, LC.st0);   /* the cloak to the hem */
      rect(g, fx + 8, y0 + 13, 2, 7, c0); rect(g, fx + 8, y0 + 8, 3, 5, LC.rust2); rect(g, fx + 9, y0 + 9, 1, 2, LC.bone2); rect(g, fx + 9, y0 + 7, 1, 1, LC.bone0);   /* the arm, the lantern */
      for (let k = 0; k < 3; k++) P(g, fx + 3, y0 + 16 + k * 5, LC.bone2); } };
  band(24); band(h - 90);
  /* a memorial niche between them: an arch with a carved lamp in it */
  const ny = 74; rect(g, 14, ny, 20, 36, LC.st0); rect(g, 15, ny + 1, 18, 35, LC.ir0); for (let k = 0; k < 4; k++) { rect(g, 15 + k, ny + 1 + (3 - k), 18 - 2 * k, 1, LC.st0); } rect(g, 14, ny - 1, 20, 1, LC.st4);
  rect(g, 22, ny + 12, 4, 10, LC.bone1); rect(g, 21, ny + 22, 6, 2, LC.bone2); rect(g, 22, ny + 8, 4, 4, LC.rust2); rect(g, 23, ny + 9, 2, 2, '#ffd36b'); rect(g, 23, ny + 6, 2, 2, LC.bone0);
  rect(g, 12, ny + 36, 24, 3, LC.st3); rect(g, 12, ny + 36, 24, 1, LC.lip2); rect(g, 12, ny + 39, 24, 1, LC.st0);
  /* iron tie-rod plates: the wall is held together by stars of rust */
  for (const [x, y] of [[w >> 1, 62], [w >> 1, 150], [w >> 1, 206]]) { rect(g, x - 3, y - 1, 7, 3, LC.ir2); rect(g, x - 1, y - 3, 3, 7, LC.ir2); rect(g, x - 1, y - 1, 3, 3, LC.ir3); P(g, x, y, LC.ir4); for (let k = 1; k < 7; k++) P(g, x - 1, y + 3 + k, k < 4 ? LC.rust1 : LC.rust0); }
  weeps(g, 6, 12, 4, 9); weeps(g, 24, 156, 3, 12); for (let y = 196; y < h; y += 9) stain(g, 8 + ((y * 5) % 30), y, 8, LC.alg0);
  rect(g, 0, h - 6, w, 6, LC.st0); rect(g, 0, h - 6, w, 1, LC.st2);
  return c;
}

/* ---------------------------------------------------------------- THE LAMP WORKS' EAST WALL (3 x 12 cells, the window rows are air) ---------------------------------------------------------------- */
function bricks(g, x0, y0, w, h, seed, tone = 0) {
  const r = mulberry(seed), A = [LC.rust1, LC.rust0, '#6a3c26', '#4c2c1c'], B = [LC.st2, LC.st1, LC.st3, LC.st1];
  rect(g, x0, y0, w, h, '#2a1c16');
  for (let y = y0, k = 0; y < y0 + h; y += 4, k++) for (let x = x0 - (k & 1) * 4; x < x0 + w; x += 8) { const t = r(), cc = (tone ? B : A)[(t * 4) | 0]; const xa = Math.max(x, x0), xb = Math.min(x + 7, x0 + w); if (xb > xa) { rect(g, xa, y, xb - xa, 3, cc); rect(g, xa, y, xb - xa, 1, tone ? LC.st4 : LC.rust2); } }
}
function brickE(w, h, air) {
  const [c, g] = canvas(w, h), [a0, a1] = air.map(v => v * TS), y16 = a0, y17 = a1 + TS;       /* the window's top and bottom, in this canvas */
  rect(g, 0, 0, w, h, '#2a1c16'); bricks(g, 0, 0, w, h, 41);
  /* the LINTEL: a flat arch of voussoirs over the whole opening, key stone in the middle */
  rect(g, 0, y16 - 14, w, 13, LC.st2); rect(g, 0, y16 - 14, w, 1, LC.st4); rect(g, 0, y16 - 2, w, 2, LC.st0);
  for (let x = 3; x < w; x += 8) { const lean = Math.round((x - w / 2) / 14); for (let y = y16 - 13; y < y16 - 2; y++) P(g, x + Math.round(lean * (y - (y16 - 13)) / 11), y, LC.st0); }
  rect(g, (w >> 1) - 3, y16 - 14, 7, 13, LC.st3); rect(g, (w >> 1) - 3, y16 - 14, 7, 1, LC.lip2);
  /* the SILL (a walkway through the window: lit lip, a drip groove) */
  rect(g, 0, y17, w, 5, LC.st3); rect(g, 0, y17, w, 1, LC.lip); rect(g, 0, y17 + 1, w, 1, LC.lip2); rect(g, 0, y17 + 3, w, 1, LC.st1); rect(g, 0, y17 + 5, w, 1, LC.st0);
  /* the BRICKED-UP DOOR under it: its arch picked out in dressed stone, the infill a different, paler brick laid on end; hinge ghosts; an iron lock plate left in the mortar */
  const dx = 6, dw = w - 12, dy = y17 + 8, dh = h - dy - 4;
  rect(g, dx - 2, dy - 2, dw + 4, dh + 2, LC.st3); rect(g, dx - 2, dy - 2, dw + 4, 1, LC.st4); bricks(g, dx, dy, dw, dh, 77, 1);
  for (let y = dy; y < dy + dh; y += 4) for (let x = dx + ((y - dy) & 4); x < dx + dw; x += 8) P(g, x, y + 1, LC.bone0);
  rect(g, dx - 2, dy - 2, 2, dh + 2, LC.st3); rect(g, dx + dw, dy - 2, 2, dh + 2, LC.st3); for (let y = dy; y < dy + dh; y += 8) { rect(g, dx - 2, y, 2, 1, LC.st0); rect(g, dx + dw, y, 2, 1, LC.st0); }
  for (const hy of [dy + 8, dy + dh - 10]) { rect(g, dx, hy, 8, 3, LC.ir2); rect(g, dx, hy, 8, 1, LC.ir4); rivet(g, dx + 6, hy); }
  rect(g, dx + dw - 13, dy + (dh >> 1), 8, 6, LC.ir1); rect(g, dx + dw - 13, dy + (dh >> 1), 8, 1, LC.ir3); rect(g, dx + dw - 11, dy + (dh >> 1) + 2, 2, 2, LC.ir0);
  /* above the lintel: a dead lamp's hook, rust under it */
  rect(g, (w >> 1) - 1, 6, 3, 2, LC.ir3); rect(g, (w >> 1), 8, 1, 8, LC.ir2); stain(g, (w >> 1) + 3, 16, 12, LC.rust1);
  rect(g, 0, 0, w, 1, LC.rust2);
  return c;
}
function brickW(w, h, air) {
  const [c, g] = canvas(w, h); rect(g, 0, 0, w, h, '#2a1c16'); bricks(g, 0, 0, w, h, 53);
  const y17 = air[0] * TS - 0;   /* the door's lintel: a riveted iron girder across the opening */
  rect(g, 0, y17 - 10, w, 9, LC.ir1); rect(g, 0, y17 - 10, w, 2, LC.ir3); rect(g, 0, y17 - 9, w, 1, LC.ir4); rect(g, 0, y17 - 2, w, 1, LC.ir0);
  for (let x = 3; x < w; x += 6) { rivet(g, x, y17 - 7); rivet(g, x + 3, y17 - 4); }
  for (let x = 2; x < w; x += 10) stain(g, x, y17, 5, LC.rust1);
  for (const x of [0, w - 3]) { rect(g, x, y17, 3, h - y17, LC.st3); rect(g, x, y17, 1, h - y17, LC.st4); for (let y = y17 + 6; y < h; y += 8) rect(g, x, y, 3, 1, LC.st0); }
  /* a chalked tally over the door: the works' gang count of the drowned shifts */
  for (let k = 0; k < 4; k++) rect(g, 6 + k * 4, 20, 1, 7, LC.bone1); for (let k = 0; k < 3; k++) rect(g, 5 + k * 4, 24 - k, 7, 1, LC.bone1);
  return c;
}
const BUILD = { house, wall, brickE, brickW };
const baked = new Map(), slices = new Map();
export const barrierAt = (L, x, y) => (L.lpBarriers || []).find(b => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1) || null;
/* one cell of a barrier (a 16x16 slice of its baked canvas); null when the barrier has a hole here (the window, the door: those cells are AIR anyway) */
export function barrierTile(b, x, y) {
  if (b.kind === 'girder') return girderCell(x - b.x0, y - b.y0, b.x1 - b.x0);
  const k = b.id + ':' + x + ',' + y; if (slices.has(k)) return slices.get(k);
  if (!baked.has(b.id)) baked.set(b.id, BUILD[b.kind]((b.x1 - b.x0 + 1) * TS, (b.y1 - b.y0 + 1) * TS, (b.air || [0, 0]).map(v => v - b.y0)));
  const [c, g] = canvas(TS, TS); g.drawImage(baked.get(b.id), (x - b.x0) * TS, (y - b.y0) * TS, TS, TS, 0, 0, TS, TS); slices.set(k, c); return c;
}
/* THE WORKS' ROOF: a riveted plate girder two cells deep (a top flange, a web with lightening holes, a bottom flange), the joints plated over */
const gm = new Map();
function girderCell(i, j, last) {
  const k = 'g' + (i % 4) + j + (i === 0) + (i === last); if (gm.has(k)) return gm.get(k);
  const [c, g] = canvas(TS, TS);
  if (j === 0) { rect(g, 0, 0, 16, 16, LC.ir1); rect(g, 0, 0, 16, 2, LC.ir3); rect(g, 0, 0, 16, 1, LC.ir4); rect(g, 0, 2, 16, 3, LC.ir2); for (let x = 2; x < 16; x += 5) { rivet(g, x, 2); } rect(g, 0, 5, 16, 1, LC.ir0);
    for (let x = 3 + (i % 4) * 3; x < 16; x += 12) { rect(g, x, 8, 5, 5, LC.ir0); rect(g, x + 1, 9, 3, 3, '#06090b'); P(g, x, 8, LC.ir3); } }
  else { rect(g, 0, 0, 16, 16, LC.ir1); for (let x = 3 + (i % 4) * 3; x < 16; x += 12) { rect(g, x, 3, 5, 5, LC.ir0); rect(g, x + 1, 4, 3, 3, '#06090b'); P(g, x, 3, LC.ir3); }
    rect(g, 0, 11, 16, 3, LC.ir2); rect(g, 0, 11, 16, 1, LC.ir3); for (let x = 2; x < 16; x += 5) rivet(g, x, 12); rect(g, 0, 14, 16, 2, LC.ir0); for (let x = 5 + (i % 4) * 2; x < 16; x += 9) stain(g, x, 1, 2, LC.rust0); }
  if (i % 4 === 3) { rect(g, 14, 0, 2, 16, LC.ir3); rect(g, 15, 0, 1, 16, LC.ir0); for (let y = 2; y < 16; y += 4) P(g, 14, y, LC.ir4); }   /* a joint plate every fourth cell */
  gm.set(k, c); return c;
}

/* ---------------------------------------------------------------- THE FISH MARKET'S STALL (a deco the awnings stand over: no timber - iron poles, a stone slab counter) ---------------------------------------------------------------- */
const stallMemo = new Map();
function stall(v) {
  if (stallMemo.has(v)) return stallMemo.get(v);
  const w = 48, h = 46, [c, g] = canvas(w, h);
  for (const x of [1, w - 4]) { rect(g, x, 0, 3, h, LC.ir1); rect(g, x, 0, 1, h, LC.ir3); rect(g, x + 2, 0, 1, h, LC.ir0); for (let y = 6; y < h - 6; y += 12) { rect(g, x - 1, y, 5, 2, LC.ir2); rect(g, x - 1, y, 5, 1, LC.ir4); } rect(g, x - 2, h - 5, 7, 5, LC.ir2); rect(g, x - 2, h - 5, 7, 1, LC.ir3); }   /* the awning poles: fluted iron, collared, on bolted feet */
  rect(g, 4, h - 22, w - 8, 3, LC.st3); rect(g, 4, h - 22, w - 8, 1, LC.lip2); rect(g, 4, h - 19, w - 8, 1, LC.st0);                                                                        /* the slab */
  for (const x of [8, w - 12]) { rect(g, x, h - 19, 4, 17, LC.ir1); rect(g, x, h - 19, 1, 17, LC.ir3); rect(g, x - 1, h - 3, 6, 3, LC.ir2); }                                                      /* trestle legs */
  rect(g, 12, h - 9, w - 24, 2, LC.ir0); rect(g, 12, h - 9, w - 24, 1, LC.ir2);                                                                                                               /* the cross-bar under */
  const fish = (x, y, c0, c1) => { rect(g, x + 2, y + 1, 7, 3, c0); rect(g, x + 3, y, 4, 1, c1); rect(g, x, y + 1, 2, 3, c0); rect(g, x + 9, y + 2, 2, 1, c0); P(g, x + 7, y + 1, LC.st0); rect(g, x + 2, y + 1, 5, 1, c1); };
  fish(8, h - 26, LC.bone1, LC.bone2); fish(20, h - 27, LC.bone0, LC.bone1); fish(31, h - 26, LC.bone1, LC.bone2); fish(14, h - 30, LC.bone0, LC.bone1); fish(26, h - 31, LC.bone1, LC.bone2);                   /* the day's takings (a long time ago) */
  rect(g, w - 15, h - 28, 8, 6, LC.ir2); rect(g, w - 15, h - 28, 8, 1, LC.ir4); rect(g, w - 14, h - 22, 6, 1, LC.ir0); rect(g, w - 17, h - 28, 2, 3, LC.ir3);                                              /* an iron pail */
  rect(g, 20, 6, 1, 14, LC.ir2); rect(g, 17, 20, 7, 1, LC.ir3); rect(g, 17, 21, 1, 2, LC.ir2); rect(g, 23, 21, 1, 2, LC.ir2);                                                                       /* the scale hanging from the awning arm */
  weeps(g, 4, h - 18, 3, 4 + v);
  stallMemo.set(v, c); return c;
}
export const lpDecoSet = e => ({ lpStall: [stall((e.v || 0) & 1), true] });
