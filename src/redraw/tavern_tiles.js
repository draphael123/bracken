// tavern_tiles.js - THE CROSSROADS INN's TILE KIT (claude/tavernart). Waymeet's own oak, limewash and hearth-stone (src/town_art.js: OAK, LIME, the hearth's grey),
// by candlelight: worn oak floorboards with a lit lip, a flagstone patch before the fire, the yard's packed sand and straw, the cellar's coursed stone with its cask
// niches under the boards, the ceiling's dark boards, the corner posts. Made from px.js primitives, each tile 16x16, baked once and memoised. Pure drawing: no number,
// timing or level data lives here (the room's measures are src/tavern.js ROOM).
//   tavernTile(t, x, y, at, T, L) -> a canvas for one cell (or null: the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';
import { ROOM } from '../tavern.js';
import { TP } from './tavern_pal.js';

export { TP };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const p2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const HEARTH = [10, 17];   /* tile columns of the fire's flagstone apron (the chimney breast stands over tiles 11-17) */
const YARD = 43;           /* the first tile column of the packed-sand yard */

/* the oak boards of the floor: a lit lip, the worn top, the seams, then the sill timber under it */
function oakFloor(v) {
  return once('oak' + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 71 + 13);
    rect(g, 0, 0, 16, 16, TP.o2);
    rect(g, 0, 0, 16, 1, TP.o7); rect(g, 0, 1, 16, 3, TP.o5); rect(g, 0, 1, 16, 1, TP.o6); rect(g, 0, 4, 16, 1, TP.o1);   /* the lip, the worn top, the line under it */
    for (let i = 0; i < 9; i++) p2(g, (r() * 16) | 0, 1 + ((r() * 3) | 0), r() < 0.5 ? TP.o6 : TP.o4);                          /* wear and grain */
    for (const sx of [3 + (v & 3), 11 - (v >> 1 & 3)]) { rect(g, sx, 1, 1, 3, TP.o3); p2(g, sx, 0, TP.o5); }                  /* board joints */
    rect(g, 0, 5, 16, 5, TP.o3); rect(g, 0, 5, 16, 1, TP.o4);                                                                 /* the face of the boards */
    for (let i = 0; i < 6; i++) p2(g, (r() * 16) | 0, 6 + ((r() * 4) | 0), r() < 0.5 ? TP.o2 : TP.o4);
    rect(g, 0, 10, 16, 1, TP.o1);
    rect(g, 0, 11, 16, 5, TP.o2); rect(g, 0, 11, 16, 1, TP.o3);                                                               /* the sill beam under the boards */
    rect(g, 0, 15, 16, 1, TP.o1); p2(g, 2 + (v & 1) * 8, 13, TP.fe3); p2(g, 10 - (v & 1) * 6, 13, TP.fe2);                    /* its nails */
    return c; });
}
/* the apron before the fire: laid flagstones, a lit lip, soot rubbed into the middle ones */
function flag(v, sooty) {
  return once('flag' + v + sooty, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 37 + 5);
    rect(g, 0, 0, 16, 16, TP.s1);
    rect(g, 0, 0, 16, 1, TP.s5); rect(g, 0, 1, 16, 3, sooty ? TP.s2 : TP.s3); rect(g, 0, 4, 16, 1, TP.s0);
    for (let i = 0; i < 8; i++) p2(g, (r() * 16) | 0, 1 + ((r() * 3) | 0), r() < 0.5 ? TP.s4 : TP.s1);
    if (sooty) for (let x = 0; x < 16; x += 2) { p2(g, x + (v & 1), 1, TP.s1); p2(g, x + 1 - (v & 1), 3, TP.s1); }
    rect(g, 7 + (v & 3), 1, 1, 3, TP.s1);
    for (let row = 0; row < 2; row++) { let x = (row & 1) * -4 - v * 3; while (x < 16) { const w = 7 + ((r() * 4) | 0); rect(g, x + 1, 5 + row * 5, w - 1, 4, r() < 0.3 ? TP.s3 : TP.s2); rect(g, x + 1, 5 + row * 5, w - 1, 1, TP.s3); rect(g, x + 1, 8 + row * 5, w - 1, 1, TP.s1); x += w; } }
    rect(g, 0, 15, 16, 1, TP.s0); return c; });
}
/* the yard: packed sand over earth, a pebble or two, straw trodden in */
function sand(v) {
  return once('sand' + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 53 + 9);
    rect(g, 0, 0, 16, 16, TP.sand0);
    rect(g, 0, 0, 16, 1, TP.sand3); rect(g, 0, 1, 16, 3, TP.sand2); rect(g, 0, 4, 16, 1, TP.sand1);
    for (let i = 0; i < 14; i++) p2(g, (r() * 16) | 0, 1 + ((r() * 3) | 0), r() < 0.5 ? TP.sand3 : TP.sand1);
    for (let i = 0; i < 2; i++) { const x = (r() * 12) | 0, y = 1 + ((r() * 2) | 0); rect(g, x, y, 3, 1, TP.hay2); p2(g, x + 3, y, TP.hay1); }            /* straw */
    for (let y = 5; y < 16; y++) for (let x = 0; x < 16; x++) { const t = (x * 7 + y * 13 + v * 5) % 11; p2(g, x, y, t === 0 ? TP.sand1 : t < 3 ? TP.sand0 : '#76593a'); }
    for (let i = 0; i < 3; i++) { const x = (r() * 13) | 0, y = 7 + ((r() * 7) | 0); rect(g, x, y, 3, 2, TP.s3); p2(g, x, y, TP.s4); rect(g, x, y + 2, 3, 1, TP.s1); }
    rect(g, 0, 15, 16, 1, '#4e3a24'); return c; });
}
/* the cellar: coursed grey stone, mortar dark, a few paler faces */
function cellar(v, dark) {
  return once('cel' + v + dark, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 131 + 7);
    rect(g, 0, 0, 16, 16, TP.s0);
    for (let row = 0; row < 2; row++) { let x = (row & 1) * -5 - v * 2; while (x < 16) { const w = 7 + ((r() * 4) | 0), t = r(); rect(g, x + 1, row * 8 + 1, w - 1, 6, t < 0.2 ? TP.s3 : t < 0.55 ? TP.s2 : TP.s1);
      rect(g, x + 1, row * 8 + 1, w - 1, 1, t < 0.3 ? TP.s4 : TP.s3); rect(g, x + 1, row * 8 + 6, w - 1, 1, TP.s0); x += w; } }
    if (dark) { g.globalAlpha = dark; rect(g, 0, 0, 16, 16, '#0c0a12'); g.globalAlpha = 1; } return c; });
}
/* the cellar's cask niche: a 4x3-tile arched recess with barrels stacked in it, drawn whole once and sliced */
function nicheSprite() {
  return once('niche', () => { const [c, g] = canvas(64, 48), r = mulberry(4242);
    rect(g, 0, 0, 64, 48, '#100c16'); rect(g, 0, 0, 64, 2, TP.s0);
    for (let x = 0; x < 64; x += 5) rect(g, x, 3 + ((x * 3) % 4), 1, 1, '#1c1622');                                                   /* back wall */
    /* the arch: stone voussoirs round the top corners, drawn by clearing to the cellar stone outside it */
    for (let y = 0; y < 14; y++) { const cut = Math.round(14 - Math.sqrt(Math.max(0, 14 * 14 - (14 - y) * (14 - y)))); for (let x = 0; x < cut; x++) { rect(g, x, y, 1, 1, ((x + y) & 1) ? TP.s1 : TP.s2); rect(g, 63 - x, y, 1, 1, ((x + y) & 1) ? TP.s1 : TP.s2); } }
    rect(g, 14, 0, 36, 1, TP.s3);
    const cask = (cx, cy, rr, band) => { for (let y = -rr; y <= rr; y++) { const hw = Math.round(Math.sqrt(rr * rr - y * y) * 1.12); rect(g, cx - hw, cy + y, hw * 2, 1, y < -rr / 2 ? TP.o4 : y > rr / 2 ? TP.o2 : TP.o3); px(g, cx - hw, cy + y, TP.o1); px(g, cx + hw - 1, cy + y, TP.o1); }
      for (const dy of [-Math.round(rr * 0.55), Math.round(rr * 0.55)]) { const hw = Math.round(Math.sqrt(Math.max(0, rr * rr - dy * dy)) * 1.12); rect(g, cx - hw + 1, cy + dy, hw * 2 - 2, 1, band ? TP.fe3 : TP.fe2); }
      rect(g, cx - 1, cy - 1, 3, 3, TP.o0); px(g, cx, cy, TP.br1); };
    cask(14, 36, 10, 1); cask(36, 38, 8, 0); cask(52, 36, 10, 1); cask(25, 20, 7, 0); cask(44, 22, 7, 1);                              /* two ranks of barrels, ends out */
    rect(g, 0, 44, 64, 4, TP.o1); rect(g, 0, 44, 64, 1, TP.o3);                                                                       /* the cradle they lie on */
    rect(g, 30, 10, 1, 8, TP.fe2); rect(g, 29, 18, 3, 2, TP.br1); px(g, 30, 20, TP.br2);                                              /* a lantern hook and its small lamp */
    g.globalAlpha = 0.35; rect(g, 0, 0, 64, 48, '#000'); g.globalAlpha = 1; rect(g, 29, 18, 3, 2, TP.br1); px(g, 30, 19, TP.f3);       /* (the niche is dim; the lamp is not) */
    return c; });
}
function nicheTile(k, rowI) { return once('nt' + k + rowI, () => { const [c, g] = canvas(16, 16); g.drawImage(nicheSprite(), k * 16, rowI * 16, 16, 16, 0, 0, 16, 16); return c; }); }

/* the ceiling: dark boards, the last row a lipped underside */
function ceiling(v, under) {
  return once('ceil' + v + under, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 19 + 3);
    rect(g, 0, 0, 16, 16, under ? TP.o2 : TP.o1);
    for (let y = 0; y < 16; y += 5) rect(g, 0, y, 16, 1, TP.o0);
    for (let i = 0; i < 8; i++) p2(g, (r() * 16) | 0, (r() * 16) | 0, r() < 0.5 ? TP.o3 : TP.o0);
    if (under) { rect(g, 0, 10, 16, 6, TP.o1); rect(g, 0, 10, 16, 1, TP.o3); rect(g, 0, 15, 16, 1, TP.o0); for (let x = 2 + v; x < 16; x += 6) p2(g, x, 12, TP.fe2); }
    return c; });
}
/* the end walls: x = 1 / 66 face the room as a corner post over limewash, 0 / 67 are the thick outer stone */
function endWall(inner, left, y) {
  return once('end' + inner + left + (y & 1), () => { const [c, g] = canvas(16, 16);
    if (!inner) { g.drawImage(cellar(y & 1, 0.25), 0, 0); return c; }
    rect(g, 0, 0, 16, 16, TP.p1);
    for (let yy = 0; yy < 16; yy += 2) for (let xx = (yy >> 1) & 1; xx < 16; xx += 2) px(g, xx, yy, TP.p0);                            /* the limewash in shade */
    const x0 = left ? 6 : 0;   /* the post, on the room side */
    rect(g, x0, 0, 10, 16, TP.o2); rect(g, left ? x0 : x0 + 9, 0, 1, 16, TP.o1); rect(g, left ? x0 + 9 : x0, 0, 1, 16, TP.o4);
    rect(g, x0 + 3, 0, 1, 16, TP.o3); for (let yy = (y * 5) % 8; yy < 16; yy += 8) { rect(g, x0 + 4, yy, 4, 1, TP.o1); }
    return c; });
}

/* THE ENTRY: a cell of the inn's solids, or null (the game's own tile) */
export function tavernTile(t, x, y, at, T, L) {
  if (t !== T.SOLID || !L || !L.tavern) return null;
  const F = ROOM.FLOOR, v = (x * 7 + y * 3) % 4;
  if (x <= ROOM.wallL || x >= ROOM.wallR) { if (y > F) return cellar(v & 1, 0.0); return endWall(x === ROOM.wallL || x === ROOM.wallR, x === ROOM.wallL, y); }
  if (y <= ROOM.CEIL) return ceiling(v, y === ROOM.CEIL);
  if (y === F) { if (x >= YARD) return sand(v); if (x >= HEARTH[0] && x <= HEARTH[1]) return flag(v, x >= 12 && x <= 16); return oakFloor(v); }
  if (y > F) {
    const k = (x - 2) % 8 - 2;   /* a cask niche every eight tiles, four wide, three high, in the inn's cellar (not under the yard) */
    if (x < YARD && x >= 4 && k >= 0 && k <= 3 && y >= F + 2 && y <= F + 4) return nicheTile(k, y - F - 2);
    if (x < YARD && x >= 4 && k >= 0 && k <= 3 && y === F + 1) return cellar(v, 0.0);
    return cellar(v, y >= F + 5 ? 0.3 : 0);
  }
  return null;
}
export const TAVERN_YARD = YARD, TAVERN_HEARTH = HEARTH;
