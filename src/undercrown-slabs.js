// src/undercrown-slabs.js - THE UNDERCROWN'S SLABS (claude/undercrown2, Daniel 10-08: "the pillars you knock down are a good mechanic,
// but HOW THEY GENERATE GROUND doesn't make sense"). PURE: no DOM, no main.js globals - the geometry only, so node tools can ask it.
//
// A SLAB is a span of roof course (x0..x1 at `row`, `deep` courses thick) held up by a timber set at EACH END (a post just outside the
// span). An end with no post is keyed into the rock and never lets go. What happens is only what you can see fall:
//   CUT ONE END   that end of the slab swings down on the other end's post (a HINGE) until its free end lands on something: a TILTED
//                 RAMP from the roof course down to the floor, and the ramp is exactly what is drawn (slope tiles, src/slopes.js).
//   CUT BOTH      it drops FLAT, `deep` courses thick, onto the first thing under it: over a gap it is a BRIDGE (it rests on both
//                 banks), on a gallery floor it is a WALL across the gallery (a walker cannot climb it; you can jump it).
//   A hinged slab whose second post goes is the flat case: it slides off its hinge and drops flat.
// A slab that cannot land as a ramp (the drop is steeper than 45 degrees over its length, or rock is in the way of the swing) tears off
// its hinge and drops flat too. The rubble that comes with it is loose rock: it scatters, and leaves only a small heap where it settles
// (drawn, never a step - Daniel: "no mounds that appear as stair shapes").
import { T, TS } from './level.js';

export const SL = { R1: 20, L1: 21, R2A: 22, R2B: 23, L2A: 24, L2B: 25 };   /* the slope ids (level.js T.SLOPE_*) */
const solidT = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT || t === T.ICE || t === T.WEB;
const oneWayT = t => t === T.ONEWAY || t === T.REED || t === T.PLANK || t === T.NET || t === T.BOUNCER || t === T.SHELF || t === T.RAIL || t === T.CRYST;
export const supportT = t => solidT(t) || (oneWayT(t) && t !== T.NET) || (t >= 20 && t <= 25);

/* the first row under `row` in column x that something rests on (or null within `max` rows) */
export function supportBelow(tileAt, x, row, max = 40) { for (let y = row + 1; y <= row + max; y++) if (supportT(tileAt(x, y))) return y; return null; }

/* THE RAMP a slab makes when the end AWAY from `hinge` is cut. hinge: +1 = the RIGHT end holds (the left end falls; the ramp rises to the
   right), -1 = the left end holds. Returns { cells: [[x, y, t]], top: [px, py], foot: [px, py], cut } or null (it cannot rest as a ramp).
   The surface starts at the roof course's top edge over the hinge end (where the gallery above, if there is one, has its floor) and ends
   on the support under the cut end: gentle pairs (one row in two columns), steep cells (one in one) and flat boards spread evenly, so the
   tile surface is the straight line from hinge to foot to within half a tile - and that line is what the slab is drawn on. */
export function rampFor(tileAt, slab, hinge) {
  const { x0, x1, row } = slab, W = x1 - x0 + 1, hc = hinge > 0 ? x1 : x0, cutX = hinge > 0 ? x0 : x1, d = -hinge;
  const s = supportBelow(tileAt, cutX, row);
  if (s === null) return null;
  const D = s - row;                                  /* rows of fall from the roof course's top edge to the support's top edge */
  if (D < 1 || D > W) return null;                    /* (flat on it already, or steeper than 45 degrees: it tears free) */
  let g, st, f;
  if (2 * D <= W) { g = D; st = 0; f = W - 2 * D; } else { g = W - D; st = 2 * D - W; f = 0; }
  /* spread evenly (Bresenham): the units in hinge-to-foot order - 'g' a gentle pair (2 columns, 1 row), 's' a steep cell (1, 1), 'f' a flat
     board (1, 0). There are never both steep cells and boards: a slab shallower than 1:2 mixes pairs and boards, a steeper one pairs and cells. */
  const units = [], extra = st || f, xk = st ? 's' : 'f', n = g + extra;
  { let e = 0; for (let k = 0; k < n; k++) { const want = Math.floor((k + 1) * extra / n); if (want > e) { units.push(xk); e++; } else units.push('g'); } }
  if (xk === 'f') units.reverse();   /* (boards at the hinge end, never past the foot: the last unit always comes down onto the support) */
  const cells = []; let col = hc, cr = row;
  const R = hinge > 0;   /* rising to the right */
  for (const u of units) {
    if (u === 'g') { const hi = col, lo = col + d; cells.push([hi, cr, R ? SL.R2B : SL.L2B], [lo, cr, R ? SL.R2A : SL.L2A]); col += 2 * d; cr++; }
    else if (u === 's') { cells.push([col, cr, R ? SL.R1 : SL.L1]); col += d; cr++; }
    else { cells.push([col, cr, T.PLANK]); col += d; }
  }
  /* every cell it lands in must be open (the slab's own course has been taken out by then: the caller passes a tileAt that reads it as air) */
  for (const [x, y] of cells) { const t = tileAt(x, y); if (t !== T.AIR && !(t >= 20 && t <= 25)) return null; }
  const edgeX = hinge > 0 ? (x1 + 1) * TS : x0 * TS, footX = hinge > 0 ? x0 * TS : (x1 + 1) * TS;
  return { cells, top: [edgeX, row * TS], foot: [footX, s * TS], cut: cutX, hinge, D, W };
}

/* THE FLAT DROP: the slab, `deep` courses thick, on the highest support under any of its columns. { cells, row (its top row), land } */
export function flatFor(tileAt, slab) {
  const { x0, x1, row } = slab, deep = Math.max(1, slab.thick || slab.deep || 1);
  let land = null; for (let x = x0; x <= x1; x++) { const s = supportBelow(tileAt, x, row, 60); if (s !== null && (land === null || s < land)) land = s; }
  if (land === null) return null;
  const top = land - deep, cells = [];
  for (let y = top; y < land; y++) for (let x = x0; x <= x1; x++) if (tileAt(x, y) === T.AIR) cells.push([x, y, T.SOLID]);
  return { cells, row: top, land, deep };
}

/* the ramp surface's y (world px) at world x, along the drawn line hinge -> foot (null off its columns) */
export function rampY(r, x) { const [ax, ay] = r.top, [bx, by] = r.foot; const lo = Math.min(ax, bx), hi = Math.max(ax, bx); if (x < lo || x > hi) return null; return ay + (by - ay) * (x - ax) / (bx - ax); }

/* THE REACH MODEL'S VIEW of a slab the route needs (L.reachSlabs: { slab, hinge }): the ramp as a stair of boards, which the fill can walk
   (src/reachcore.js reads slopes as air on rock, and a slab's ramp has no rock under it). Gentle and steep cells alike become a board at
   the row its surface leaves the tile at the bottom - every step a short hop, which is no more than the ramp asks of the legs. */
export function reachStair(tileAt, slab, hinge, flat = false) {
  const inCourse = (x, y) => x >= slab.x0 && x <= slab.x1 && y <= slab.row && y > slab.row - (slab.deep || 1);
  const clear = []; for (let y = slab.row - (slab.deep || 1) + 1; y <= slab.row; y++) for (let x = slab.x0; x <= slab.x1; x++) clear.push([x, y]);
  const ta = (x, y) => inCourse(x, y) ? T.AIR : tileAt(x, y);
  if (flat) { const f = flatFor(ta, slab); return { clear, stair: [], solid: f ? f.cells.map(([x, y]) => [x, y]) : [] }; }   /* both posts cut: down flat (a bridge) */
  const r = rampFor(ta, slab, hinge);
  return { clear, stair: r ? r.cells.map(([x, y]) => [x, y]) : [], solid: [] };
}
