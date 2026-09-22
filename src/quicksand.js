// src/quicksand.js — QUICKSAND, and the one verb that gets you out of it: JUMP, AND KEEP JUMPING. Pure, no DOM.
// Survivable by design (the brief: NOT deadly water): it holds you and slows you; it never kills, and it never drowns.
// The Dune Worm's SWALLOW (src/dune-worm.js) is the same verb with a pull toward its mouth.
//
// A patch is L.quicksand = [{ x0, x1, y }] in px: y is its surface (the top of the quicksand tile row, redraw/desert.js
// bakeQuicksand). A body whose feet are in a patch is HELD: its feet are at y + depth, it sinks, it wades, and it cannot
// jump normally. Each jump press heaves it up QS.lift px; at the surface a press is a real (weaker) jump, out.
//   qsStep(b, q, dt, { move, jumpPress }) -> { held, depth, out }   (q = the patch, or null)
//   qsPatchAt(L, x, y) -> the patch the feet at (x, y) are in, or null
export const QS = {
  sink: 11,       // px/s the feet go down
  maxDepth: 12,   // and no further: chest-deep on the knight (h 14). Held, never under.
  lift: 5,        // px a jump press heaves you up
  out: -250,      // the jump out, at the surface (a full jump is -320: you leave it tired)
  wade: 34,       // walking speed held in it near the surface...
  stuck: 5,       // ...and no walking at all below this depth: deeper than this the only way out is up
};
export function qsPatchAt(L, x, y) { for (const q of (L.quicksand || [])) if (x >= q.x0 && x <= q.x1 && y >= q.y - 0.5 && y <= q.y + QS.maxDepth + 2) return q; return null; }
export function qsStep(b, q, dt, { move = 0, jumpPress = false } = {}) {
  if (!q) { b.qsDepth = 0; return { held: false, depth: 0, out: false }; }
  let d = b.qsDepth ?? Math.max(0, b.y - q.y);
  let out = false;
  if (jumpPress) { if (d <= QS.lift) { out = true; b.vy = QS.out; d = 0; } else d -= QS.lift; }   /* a heave that reaches the surface takes you out (at exactly 0 it never could: the sand takes a little back between presses) */
  if (!out) {
    d = Math.min(QS.maxDepth, d + QS.sink * dt);
    b.vy = 0;
    b.vx = d >= QS.stuck ? 0 : move * QS.wade;
    b.y = q.y + d;
  } else b.y = q.y - 0.01;
  b.qsDepth = out ? 0 : d;
  return { held: !out, depth: d, out };
}
