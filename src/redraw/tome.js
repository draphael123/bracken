// src/redraw/tome.js — THE TOME's sprite (src/tome.js), on the shore.js contract: frames face right, one canvas, ax the centre,
// a flyer (hangs from one box, not settled). px.js primitives only; rendered by tools/tome.mjs.
//   0,1,2 DRIFT (half open, pages riffling)  3 TELL ! (covers flung wide, pages fanned, a gold glare)  4 DART (edge-on, pages
//   streaming behind)  5 SPENT (hanging open, drooping)  6 SHUT (slammed, lying flat: the opening)  7 hurt
import { canvas, px, rect, fillPoly, line, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
const C = { cover: '#6e2a3a', coverL: '#9a3e52', coverD: '#4a1a26', gilt: '#e8c24a', giltD: '#a8801e', page: '#efe4c8', pageD: '#c9b894', ink: '#3a2e40', glare: '#fff6c8', eye: '#ffd36b' };
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(flipX), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
export function bakeTome() {
  const W = 26, H = 20, cx = 13, cy = 10;
  /* an open book seen from the side: two covers hinged at the spine (cx, cy), `open` the half-angle, pages between them */
  const book = (g, open, riffle, dy = 0) => {
    /* an open book, spine down, the two boards flung up and out: each board a thick slab, the page block a filled wedge between */
    const sx = cx, sy = cy + 5 + dy, L = 10, a = open, cL = [-Math.sin(a), -Math.cos(a)], cR = [Math.sin(a), -Math.cos(a)], nL = [cL[1], -cL[0]], nR = [-cR[1], cR[0]];
    const P = (d, k, n = [0, 0], m = 0) => [sx + d[0] * k + n[0] * m, sy + d[1] * k + n[1] * m];
    fillPoly(g, [P(cL, 0), P(cL, L - 1, nR, 0), P(cR, L - 1), P(cR, 0)], C.pageD);                         /* the page block */
    fillPoly(g, [P(cL, 1), P(cL, L - 2), P([0, -1], L - 4), P(cR, L - 2), P(cR, 1)], C.page);
    for (let k = 0; k < 3; k++) { const f = 0.3 + k * 0.2 + riffle * 0.06, d = [cL[0] * (1 - f) + cR[0] * f, cL[1] * (1 - f) + cR[1] * f]; line(g, sx, sy, sx + d[0] * (L - 3), sy + d[1] * (L - 3), C.pageD); }
    for (const [d, col, n] of [[cL, C.cover, nL], [cR, C.coverL, nR]]) fillPoly(g, [P(d, 0), P(d, L), P(d, L, n, 3), P(d, 0, n, 3)], col);   /* the boards, three thick */
    for (const [d, n] of [[cL, nL], [cR, nR]]) { const [x, y] = P(d, L, n, 1); px(g, x, y, C.gilt); }
    rect(g, sx - 2, sy, 4, 2, C.giltD); px(g, sx, sy + 1, C.gilt);                                             /* the spine's clasp */
  };
  const F = [];
  const frame = fn => { const [c, g] = canvas(W, H); fn(g); outline(c, OUT); F.push(c); };
  for (let r = 0; r < 3; r++) frame(g => book(g, 0.55 + r * 0.06, r - 1, r === 1 ? -1 : 0));                        // 0-2 DRIFT
  frame(g => { book(g, 1.25, 0, -1); for (const [dx, dy] of [[-8, -6], [8, -6], [0, -8], [-10, 0], [10, 0]]) px(g, cx + dx, cy + dy, C.glare); rect(g, cx - 1, cy - 2, 2, 2, C.eye); });   // 3 TELL !
  frame(g => { rect(g, 4, cy + 1, 16, 4, C.cover); rect(g, 4, cy + 1, 16, 1, C.coverL); rect(g, 20, cy + 1, 2, 4, C.page); for (let k = 0; k < 4; k++) line(g, 1 + k, cy + 2 + (k % 2), 4, cy + 3, C.pageD); px(g, 21, cy + 2, C.gilt); });   // 4 DART
  frame(g => book(g, 0.95, 0, 3));                                                                                   // 5 SPENT
  frame(g => { rect(g, 5, H - 5, 16, 4, C.cover); rect(g, 5, H - 5, 16, 1, C.coverL); rect(g, 6, H - 4, 14, 1, C.page); rect(g, 12, H - 5, 2, 4, C.giltD); for (const x of [8, 18]) px(g, x, H - 7, C.glare); });   // 6 SHUT
  frame(g => { book(g, 0.8, 1, 0); line(g, cx - 5, cy - 3, cx + 5, cy + 3, C.glare); });                              // 7 hurt
  return pack(F, cx, H, 12, 10);
}
