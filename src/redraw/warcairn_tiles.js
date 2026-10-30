// src/redraw/warcairn_tiles.js - THE WAR CAIRN's small TILE KIT (claude/warcairnart, 10-29). Replaces the two TIMBER-looking tiles of the level (the plank rope bridge and the
// one-way ledges, which fell back to the felled-log ledge) with what the clan actually builds with: a GRANITE SLAB ledge (lichen on its lip, a dark ragged underside, an iron
// staple at each end), and a SLATE-TREAD BRIDGE (grey slate treads lashed to two hemp ropes with iron staples, the ropes sagging under it). Tile footprints are the stock
// ones (same tile types, same cells): the level grid, its entities and its hash are untouched.
//   wcTile(t, x, y, at, T, L) -> a 16x16 canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';
const C = { g0: '#323a48', g1: '#4a586c', g2: '#64748a', g3: '#8a9cb4', g4: '#b4c4d8', lichO: '#d8923a', lichG: '#98a85a', sl0: '#2e3644', sl1: '#44505e', sl2: '#5c6a7a', sl3: '#8296aa', sl4: '#b0c2d4',
  rope: '#c8b888', ropeD: '#7a6a44', ropeL: '#e8dcb4', iron: '#3a3a42', ironL: '#8a8a96', under: '#1c1a1e' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };

/* a GRANITE SLAB ledge: pale lit top with lichen, a body of three tones with cracks, a dark ragged underside; an iron staple at a free end */
function slab(l, r, v) {
  return once('sl' + l + r + v, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 11 + 5);
    rect(g, 0, 0, 16, 8, C.g2); rect(g, 0, 0, 16, 1, C.g4); rect(g, 0, 1, 16, 1, C.g3); rect(g, 0, 4, 16, 1, C.g1); rect(g, 0, 6, 16, 2, C.g1); rect(g, 0, 8, 16, 1, C.g0);
    for (let x = 0; x < 16; x++) { const d = (rr() * 3) | 0; if (d) px2(g, x, 8 + (d - 1), C.g0); }
    for (let i = 0; i < 5; i++) px2(g, (rr() * 16) | 0, 2 + ((rr() * 5) | 0), i % 2 ? C.g0 : C.g3);
    const lx = (rr() * 11) | 0; px2(g, lx, 0, C.lichO); px2(g, lx + 1, 0, C.lichO); px2(g, lx + 2, 0, C.lichG); if (rr() < 0.5) { px2(g, lx + 5, 0, C.lichG); px2(g, lx + 6, 0, C.lichG); }
    rect(g, 5 + (v % 3) * 2, 2, 1, 5, C.g0);                                                                       /* a joint between two stones */
    if (l) { rect(g, 0, 1, 2, 7, C.g3); rect(g, 1, 2, 2, 1, C.iron); px2(g, 1, 2, C.ironL); px2(g, 0, 0, C.g1); }
    if (r) { rect(g, 14, 1, 2, 7, C.g1); rect(g, 13, 2, 2, 1, C.iron); px2(g, 14, 2, C.ironL); px2(g, 15, 0, C.g1); }
    rect(g, 0, 0, 16, 2, SN.s0); rect(g, 0, 2, 16, 1, SN.s1); for (let x = 1; x < 16; x += 3 + ((rr() * 2) | 0)) px2(g, x, 3, SN.s2); rect(g, 0, 0, 16, 1, '#ffffff');   /* (claude/warcairn2art) snow lies on the slab, not lichen */
    return c; });
}
/* a BRIDGE TREAD: slate lashed on two hemp ropes. Rows 0-4 the slate (lit lip, dark joint at its edge), a lashing of rope with an iron staple, the rope itself sagging under. */
function tread(l, r, v, mid) {
  return once('td' + l + r + v + mid, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 5, C.sl2); rect(g, 0, 0, 16, 1, C.sl4); rect(g, 0, 1, 16, 1, C.sl3); rect(g, 0, 3, 16, 1, C.sl1); rect(g, 0, 4, 16, 1, C.sl0);
    for (let x = 3 + (v & 1) * 2; x < 16; x += 8) { rect(g, x, 1, 1, 4, C.sl0); px2(g, x + 1, 1, C.sl4); }               /* the joint between two slates */
    const bind = x => { rect(g, x, 0, 3, 6, C.rope); rect(g, x, 0, 1, 6, C.ropeL); rect(g, x + 2, 0, 1, 6, C.ropeD); for (let y = 1; y < 6; y += 2) px2(g, x + 1, y, C.ropeD); px2(g, x + 1, 0, C.ironL); };   /* a lashing and its staple */
    bind(mid ? 6 : 2); if (!mid) bind(11);
    /* the carrying rope, sagging a row at the middle of every tile pair */
    const sag = mid ? 1 : 0; for (let x = 0; x < 16; x++) { const y = 6 + (x > 4 && x < 11 ? sag : 0); px2(g, x, y, C.rope); px2(g, x, y + 1, C.ropeD); if (x % 4 === 1) px2(g, x, y, C.ropeL); }
    rect(g, 0, 9, 16, 1, C.under); g.globalAlpha = 0.5; rect(g, 0, 9, 16, 2, C.under); g.globalAlpha = 1;               /* the drop under it */
    if (l) { rect(g, 0, 0, 3, 9, C.iron); px2(g, 1, 1, C.ironL); px2(g, 1, 6, C.ironL); rect(g, 0, 5, 3, 1, C.g1); }     /* anchored in the rock: an iron plate */
    if (r) { rect(g, 13, 0, 3, 9, C.iron); px2(g, 14, 1, C.ironL); px2(g, 14, 6, C.ironL); rect(g, 13, 5, 3, 1, C.g1); }
    return c; });
}

/* (claude/warcairn2art) A SLATE BLOCK: cold blue-grey strata with dark seams and pale flecks, snow lying on its top (scalloped, with a shaded lip) and wrapping any exposed corner, and
   wind-scoured streaks on the face. No roots, no loam: this is bare mountain. top / left / right = which sides meet open air. 16x16, deterministic from the cell. */
const SN = { s0: '#f6f9fd', s1: '#dbe5f1', s2: '#b4c4d8', s3: '#8296b0', st: '#6e8098', sl: '#4a586c' };
function slate(top, left, right, v) {
  return once('sb' + (top ? 1 : 0) + (left ? 1 : 0) + (right ? 1 : 0) + v, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 17 + (top ? 3 : 0) + (left ? 5 : 0) + (right ? 7 : 0) + 11);
    const band = [C.sl2, '#556376', C.sl1, '#4e5c6e'];
    for (let y = 0; y < 16; y++) rect(g, 0, y, 16, 1, band[((y + v * 3) >> 2) & 3]);
    for (let i = 0; i < 4; i++) { const y = (rr() * 15) | 0; rect(g, 0, y, 16, 1, C.sl0); if (rr() < 0.6) rect(g, (rr() * 8) | 0, y + 1, 3 + ((rr() * 6) | 0), 1, C.sl3); }       /* the seams of the strata, a lit edge under some */
    for (let i = 0; i < 9; i++) px2(g, (rr() * 16) | 0, (rr() * 16) | 0, i % 3 ? C.sl3 : C.sl0);                                                            /* flecks */
    if (rr() < 0.35) { const x = (rr() * 12) | 0, y = 4 + ((rr() * 8) | 0); px2(g, x, y, C.sl0); px2(g, x + 1, y + 1, C.sl0); px2(g, x + 2, y + 1, C.sl0); px2(g, x + 3, y + 2, C.sl0); }   /* a crack */
    for (let i = 0; i < 2; i++) { const y = 5 + ((rr() * 9) | 0), x = (rr() * 8) | 0, w = 4 + ((rr() * 5) | 0); rect(g, x, y, w, 1, SN.st); rect(g, x + 1, y + 1, Math.max(1, w - 3), 1, SN.sl); }   /* wind-scoured snow streaks on the face */
    if (left) { rect(g, 0, 0, 1, 16, C.sl3); rect(g, 1, 0, 1, 16, C.sl2); }
    if (right) { rect(g, 15, 0, 1, 16, C.sl0); }
    if (top) { const hh = [3, 4, 3, 2, 3, 4, 4, 3, 2, 3, 3, 4, 3, 2, 3, 3];
      for (let x = 0; x < 16; x++) { const d = hh[(x + v * 5) % 16]; rect(g, x, 0, 1, d, SN.s0); px2(g, x, d, SN.s1); if ((x + v) % 3 === 0) px2(g, x, d + 1, SN.s2); }
      rect(g, 0, 0, 16, 1, '#ffffff'); for (let i = 0; i < 2; i++) px2(g, 2 + ((rr() * 12) | 0), 0, SN.s1);
      if (left) { rect(g, 0, 0, 2, 5, SN.s0); px2(g, 0, 5, SN.s1); } if (right) { rect(g, 14, 0, 2, 5, SN.s0); px2(g, 15, 5, SN.s1); } }
    else { if (left && rr() < 0.4) { rect(g, 1, 2 + ((rr() * 8) | 0), 2, 2, SN.s1); } }
    return c; });
}

export function wcTile(t, x, y, at, T, L) {
  if (t === T.SOLID) { const ex = (dx, dy) => { const w = at(x + dx, y + dy); return w === 0 || w === T.ONEWAY || w === T.PLANK || w === T.NET || w === T.CLIMB || w === T.SPIKE; }; return slate(ex(0, -1), ex(-1, 0), ex(1, 0), ((x * 7 + y * 13) % 5 + 5) % 5); }
  if (t === T.ONEWAY) { const sr = k => at(x + k, y) === t; return slab(!sr(-1), !sr(1), ((x * 5 + y) % 3 + 3) % 3); }
  if (t === T.PLANK) { const sr = k => at(x + k, y) === t; return tread(!sr(-1), !sr(1), x, ((x * 7 + y) & 1) === 1); }
  return null;
}
