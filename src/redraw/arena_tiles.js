// arena_tiles.js - THE ARENA SET's TILE KIT (claude/arenayardart). Raked sand with a sunlit lip (two plain tops and a footprinted one), packed sand under it, coursed
// pale ashlar with mortar (three variants) for the walls and the foundation, a stone cap, a darker pit sand, oak plank one-way tops on brackets, and the climbing face
// (a rope net lashed over the ashlar). px.js primitives, 16x16, baked once and memoised. Pure drawing: no number, timing or level data lives here except the floor row,
// which a level hands over as L.arenaYard.floor (or L.arenaKit.floor for any other arena that opts in with data).
//   arenaTile(t, x, y, at, T, L) -> a canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';
import { AP } from './arena_pal.js';

export { AP };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const p2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };

/* the arena floor: sand raked in long strokes under a lit lip; v 2 carries a line of footprints */
function sandTop(v, pit, l, r) {
  return once('st' + v + pit + l + r, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 61 + 7), A = AP;
    const hi = pit ? A.s3 : A.s5, mid = pit ? A.s2 : A.s4, lo = pit ? A.s1 : A.s3, sh = pit ? A.s0 : A.s2;
    rect(g, 0, 0, 16, 16, A.s1);
    rect(g, 0, 0, 16, 1, hi); rect(g, 0, 1, 16, 3, mid); rect(g, 0, 4, 16, 1, lo);
    for (let row = 0; row < 3; row++) { const y = 1 + row, ph = (v * 5 + row * 3) % 7; for (let x = ph; x < 16; x += 6 + row) rect(g, x, y, 3, 1, row & 1 ? lo : hi); }   /* the rake's long strokes */
    for (let i = 0; i < 6; i++) p2(g, (q() * 16) | 0, 1 + ((q() * 3) | 0), q() < 0.5 ? sh : hi);                                                   /* grit */
    if (v === 2) { for (const fx of [2, 8]) { rect(g, fx, 2, 3, 1, A.s1); rect(g, fx + 1, 3, 2, 1, A.s1); p2(g, fx, 3, A.s2); } }                    /* footprints */
    for (let y = 5; y < 16; y++) for (let x = 0; x < 16; x++) { const t = (x * 7 + y * 13 + v * 5) % 11; p2(g, x, y, t === 0 ? A.s2 : t < 3 ? A.s0 : A.s1); }
    for (let i = 0; i < 2; i++) { const x = (q() * 12) | 0, y = 7 + ((q() * 6) | 0); rect(g, x, y, 2, 1, A.k3); p2(g, x, y, A.k4); p2(g, x + 1, y + 1, A.k1); }   /* a pebble */
    rect(g, 0, 15, 16, 1, A.s0);
    if (l) rect(g, 0, 0, 1, 16, A.s0); if (r) rect(g, 15, 0, 1, 16, A.s0);
    return c; });
}
/* packed sand under the raked top: dense, the earth the stone foundation stands in */
function packed(v) {
  return once('pk' + v, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 31 + 3), A = AP;
    rect(g, 0, 0, 16, 16, A.s1);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const t = (x * 5 + y * 11 + v * 7) % 13; p2(g, x, y, t === 0 ? A.s2 : t < 4 ? A.s0 : A.s1); }
    for (let i = 0; i < 2; i++) { const x = (q() * 12) | 0, y = 2 + ((q() * 11) | 0); rect(g, x, y, 3, 2, A.k2); p2(g, x, y, A.k3); rect(g, x, y + 2, 3, 1, A.k0); }
    rect(g, 0, 0, 16, 1, A.s0); return c; });
}
/* coursed ashlar: mortar dark, a lit top edge on each block, a few paler faces; `edge` lights a wall's inner face */
function ashlar(v, edge) {
  return once('as' + v + edge, () => { const [c, g] = canvas(16, 16), q = mulberry(v * 97 + 11), A = AP;
    rect(g, 0, 0, 16, 16, A.k0);
    for (let row = 0; row < 2; row++) { let x = (row & 1) * -5 - v * 3; while (x < 16) { const w = 8 + ((q() * 4) | 0), t = q(), x1 = Math.max(0, x + 1), x2 = Math.min(16, x + w);
      if (x2 > x1) { rect(g, x1, row * 8 + 1, x2 - x1, 6, t < 0.2 ? A.k3 : t < 0.6 ? A.k2 : A.k1); rect(g, x1, row * 8 + 1, x2 - x1, 1, t < 0.3 ? A.k5 : A.k4); rect(g, x1, row * 8 + 6, x2 - x1, 1, A.k1); if (t > 0.7) p2(g, x1 + 2, row * 8 + 3, A.k3); } x += w; } }
    if (edge === 'L') { rect(g, 0, 0, 1, 16, A.k4); rect(g, 1, 0, 1, 16, A.k3); } if (edge === 'R') { rect(g, 15, 0, 1, 16, A.k4); rect(g, 14, 0, 1, 16, A.k3); }
    return c; });
}
/* a stone coping: the lit slab on top of a pillar or a wall's head */
function cap(v) {
  return once('cp' + v, () => { const [c, g] = canvas(16, 16), A = AP;
    g.drawImage(ashlar(v, ''), 0, 0);
    rect(g, 0, 0, 16, 5, A.k3); rect(g, 0, 0, 16, 1, A.k5); rect(g, 0, 1, 16, 1, A.k4); rect(g, 0, 4, 16, 1, A.k1); rect(g, 7 + (v & 3), 1, 1, 3, A.k1); rect(g, 0, 5, 16, 1, A.k0);
    return c; });
}
/* one-way oak plank: a lit board on two brackets, the cell below left clear (a plank is a thin shelf) */
function plank(l, r, v) {
  return once('pl' + l + r + v, () => { const [c, g] = canvas(16, 16), A = AP, q = mulberry(v * 13 + 1);
    rect(g, 0, 0, 16, 1, A.o7); rect(g, 0, 1, 16, 4, A.o5); rect(g, 0, 1, 16, 1, A.o6); rect(g, 0, 5, 16, 1, A.o2); rect(g, 0, 6, 16, 1, A.o1);
    for (let i = 0; i < 5; i++) p2(g, (q() * 16) | 0, 2 + ((q() * 3) | 0), q() < 0.5 ? A.o4 : A.o6);
    rect(g, 7 + (v & 3), 1, 1, 4, A.o3); if (l) { rect(g, 0, 0, 1, 7, A.o3); p2(g, 0, 0, A.o5); } if (r) { rect(g, 15, 0, 1, 7, A.o3); p2(g, 15, 0, A.o5); }
    p2(g, 2, 3, A.i3); p2(g, 13, 3, A.i3);                                                                                              /* the nails */
    for (const bx of [2, 12]) { rect(g, bx, 7, 2, 3, A.o3); rect(g, bx + 1, 10, 1, 2, A.o2); rect(g, bx, 7, 1, 3, A.o4); }               /* brackets under it */
    return c; });
}
/* the climbing face: ashlar with a rope net lashed over it, knots at the crossings */
function net(v) {
  return once('nt' + v, () => { const [c, g] = canvas(16, 16), A = AP;
    g.drawImage(ashlar(v, ''), 0, 0); g.globalAlpha = 0.45; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1;                              /* the stone sits back in shade */
    for (let i = -16; i < 32; i += 8) for (let d = 0; d < 16; d++) { p2(g, i + d + 4, d, A.o6); p2(g, i - d + 20, d, A.o6); p2(g, i + d + 5, d, A.o3); p2(g, i - d + 21, d, A.o3); }   /* the diamond rope */
    for (const [x, y] of [[4, 0], [12, 8], [4, 15], [12, 7]]) { rect(g, x - 1, y - 1, 3, 3, A.o4); p2(g, x, y, A.o7); }                  /* knots */
    return c; });
}

/* THE ENTRY: a cell of the arena's solids / planks / net, or null (the game's own tile) */
export function arenaTile(t, x, y, at, T, L) {
  const K = L && (L.arenaYard || L.arenaKit); if (!K) return null;
  if (t !== T.SOLID && t !== T.ONEWAY && t !== T.NET) return null;
  const F = K.floor != null ? K.floor : 22, W = L.W || 164, v = (x * 7 + y * 3) % 3;
  if (t === T.ONEWAY) return plank(at(x - 1, y) !== t, at(x + 1, y) !== t, x & 3);
  if (t === T.NET) return net(v);
  const top = at(x, y - 1) === T.AIR;                                  /* nothing standable on it */
  const wallL = x <= 1, wallR = x >= W - 2;
  if (wallL || wallR) return top ? cap(v) : ashlar(v, wallL ? (x === 1 ? 'R' : '') : (x === W - 2 ? 'L' : ''));
  if (top) {
    if (y === F) return sandTop((x * 5 + 3) % 9 === 0 ? 2 : v & 1, false, at(x - 1, y) === T.AIR, at(x + 1, y) === T.AIR);
    if (y > F) return sandTop(v & 1, true, at(x - 1, y) === T.AIR, at(x + 1, y) === T.AIR);        /* the pit's floor: darker sand */
    return cap(v);                                                                                  /* a pillar's head */
  }
  if (y === F + 1 && at(x, F) === T.SOLID) return packed(v);                                       /* a pad of packed sand under the raked top, then the stone */
  return ashlar(v, '');
}
