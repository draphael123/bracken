/* src/demo-supports-art.js - the two drawn supports src/demo-supports.js adds (claude/floatfix). p = { x, y (the board's row), bottom, style, dir?, span? }, tile coords; drawn behind the tiles.
     trestle a braced timber trestle under a whole stair step: a leg at each end, an X-brace between, a cap beam (the Arena Yard's stair)
     brace   a knee brace: a timber strut from the wall or trunk a board is bolted to, up to the board's underside, `span` columns out (a ledge off a tree, a shelf off a wall) */
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const WOOD = ['#3d2816', '#6b4a2a', '#8a5f38', '#b98a58'];   /* dark joint, shade, board, lit edge */
export function drawDemoSupport(g, p, cx, cy) {
  if (p.style === 'trestle') {
    const x0 = Math.round(p.x * 16 - cx), span = p.span || 0, y0 = Math.round(p.y * 16 + 6 - cy), yl = Math.round(p.bottom * 16 - cy), yr = Math.round((p.rb || p.bottom) * 16 - cy), xr = x0 + span * 16;
    const leg = (x, yb) => { R(g, WOOD[0], x + 5, y0, 6, yb - y0); R(g, WOOD[2], x + 6, y0, 4, yb - y0); R(g, WOOD[3], x + 6, y0, 1, yb - y0); R(g, WOOD[0], x + 3, yb - 3, 10, 3); R(g, WOOD[1], x + 3, yb - 3, 10, 1); };
    const ya = y0 + 14, yb = Math.min(yl, yr) - 4, a0 = x0 + 11, a1 = xr + 5, dx = a1 - a0, dy = yb - ya;   /* the X-brace between the legs */
    if (dx > 2 && dy > 6) for (let k = 0; k <= dx; k++) { const d = Math.round(k * dy / dx); R(g, WOOD[0], a0 + k - 1, ya + d - 1, 3, 3); R(g, WOOD[1], a0 + k, ya + d, 1, 1); R(g, WOOD[0], a0 + k - 1, ya + dy - d - 1, 3, 3); R(g, WOOD[2], a0 + k, ya + dy - d, 1, 1); }
    leg(x0, yl); leg(xr, yr);
    R(g, WOOD[0], x0 + 1, y0, (span + 1) * 16 - 2, 4); R(g, WOOD[2], x0 + 2, y0, (span + 1) * 16 - 4, 2); R(g, WOOD[3], x0 + 2, y0, (span + 1) * 16 - 4, 1);   /* the cap beam under the step */
    return;
  }
  if (p.style === 'brace') {
    const span = p.span || 4, d = p.dir || 1, wallX = Math.round((d < 0 ? p.x + 1 : p.x) * 16 - cx), x1 = Math.round(wallX + d * span * 16 - d * 2), yt = Math.round(p.y * 16 + 7 - cy), yb = Math.round((p.y + span) * 16 - 2 - cy);
    const n = Math.abs(x1 - wallX), dy = yb - yt;
    for (let i = 0; i <= n; i++) { const t = i / n, x = Math.round(wallX + d * i), y = Math.round(yb - dy * t);   /* from the wall (low) up to the board (high) */
      R(g, WOOD[0], x - 2, y - 2, 4, 5); R(g, WOOD[2], x - 1, y - 1, 3, 3); P1(g, WOOD[3], x - 1, y - 1); }
    R(g, WOOD[0], wallX - (d < 0 ? 0 : 3), yb - 5, 3, 9); R(g, WOOD[1], wallX - (d < 0 ? 0 : 3) + 1, yb - 4, 1, 7);   /* the bolted bracket plate at the wall */
    R(g, WOOD[0], x1 - 3, yt - 2, 7, 3); R(g, WOOD[2], x1 - 2, yt - 2, 5, 1);                                          /* the cleat under the board */
  }
}
const P1 = (g, c, x, y) => R(g, c, x, y, 1, 1);
