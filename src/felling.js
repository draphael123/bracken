// src/felling.js - WHERE A FELLED PINE LIES (claude/lumbertrail: THE LUMBER TRAIL, the reworked Bracken Wood).
// A marked pine ('felltree' ent: x, y = the tile it stands in, its foot on the floor under it) takes four strokes and falls THE WAY IT LEANS
// (dir +1 east, -1 west). Where it comes to rest is one of three things, and this file is the one place that says which cells it becomes -
// src/main.js lays them when it falls (and again from the save's marks), src/reachcore.js counts a pine as down (four blows every hero has,
// and the trunk stays), and the checks read the same cells:
//   A BRIDGE  (no `head`): it lies level, a run of PLANK at `row` (default its own row y) from the tile beside it, `len` tiles out.
//             The arena's pine and the old tarn's lie at their own row; the trail's bridges lie flush with the banks (row = the bank's top).
//   A LEAN-TO / A DROP (`head: [col, row]`): it lies as a RAMP from its foot (the tile beside it, at the top of the floor it stands on) to
//             `head` (a column and the row whose TOP the trunk's crown rests on): a line of one-way footing the hero walks (main.js rampFoot).
//             A lean-to's head rests on a ledge above (the way up a cliff); a DROP (`drop: true`) falls out and down over a hollow, and whatever
//             stands under its line when it lands is crushed (main.js) - the tree you drop on the goblins below, then the way down to them.
export const FELL_STROKES = 4;
/* the trunk's line, by its own ends: { foot: [col, feetRow], head: [col, feetRow] } with foot WEST of head (the walking code reads it left to right) */
export function fellRamp(e) {
  if (!e.head) return null;
  const dir = e.dir || 1, foot = [e.x + dir, e.y + 1], head = [e.head[0], e.head[1]];
  return dir > 0 ? { foot, head } : { foot: head, head: foot };
}
/* the feet's height (px) on a ramp at world x (px) - the same line src/main.js rampY walks (the Hurricane's felled mast) */
export function rampYAt(R, px, TS = 16) { const x0 = R.foot[0] * TS, x1 = (R.head[0] + 1) * TS, k = Math.max(0, Math.min(1, (px - x0) / (x1 - x0))); return R.foot[1] * TS + (R.head[1] - R.foot[1]) * TS * k; }
/* the cells a felled pine becomes: [[col, row, tile]] - only where the map has air (or a one-way board, for a level trunk: the arena pine lies over a comb ledge) */
export function fellCells(e, grid, W, T) {
  const out = [], dir = e.dir || 1, len = e.len || 12;
  const R = fellRamp(e);
  if (!R) { const row = e.row !== undefined ? e.row : e.y;
    for (let k = 1; k <= len; k++) { const x = e.x + dir * k, i = row * W + x; if (x < 0 || x >= W) continue; if (grid[i] === T.AIR || grid[i] === T.ONEWAY) out.push([x, row, T.PLANK]); }
    return out; }
  for (let x = R.foot[0]; x <= R.head[0]; x++) { const y = Math.round(rampYAt(R, x * 16 + 8) / 16), i = y * W + x; if (x >= 0 && x < W && grid[i] === T.AIR) out.push([x, y, T.ONEWAY]); }
  return out;
}
/* A DROP's reach: every column under the trunk's line, and how far below the line a body may stand and still be under it (rows) */
export const DROP_DEPTH = 6;
export function underTrunk(e, px, py, TS = 16) {
  const R = fellRamp(e); if (!R || !e.drop) return false;
  if (px < R.foot[0] * TS || px > (R.head[0] + 1) * TS) return false;
  const yl = rampYAt(R, px, TS); return py >= yl - 6 && py <= yl + DROP_DEPTH * TS;
}
/* (claude/lumberfix) THE WORLD-X SPAN a felled pine covers (px): stump to crown, a tile of slack each end. The draw's screen cull must test THIS, not the stump's x: a trunk is up to 14 tiles long, so walking on past it left the stump off screen and the whole fallen pine un-drawn until you came back */
export function fellSpan(e, TS = 16) {
  const R = fellRamp(e); if (R) return [R.foot[0] * TS - TS, (R.head[0] + 1) * TS + TS];
  const dir = e.dir || 1, a = e.x * TS, b = (e.x + dir * ((e.len || 12) + 1)) * TS; return [Math.min(a, b) - TS, Math.max(a, b) + 2 * TS];
}
