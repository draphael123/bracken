// src/reach-slopes.js — THE REACH RULE FOR SLOPES (phase 1: standalone; phase 2 calls slopeReachGrid() at the top of
// floodReach in src/reachcore.js, one line, before it reads the grid).
//
// reachcore works in whole tiles: a cell is footing when the tile under it is something you stand on, and the feet are
// counted at the BOTTOM of that cell. A slope is walkable footing - a stair - but in whole tiles the question is which
// row the foot is counted in, and the answer has to be the one that never credits a jump the knight does not have:
//
//   A SLOPE TILE IS THE CELL YOU STAND IN, ON THE ROCK UNDER IT. Its footing is its own cell (feet counted at the
//   tile's bottom), not the cell above it (feet at its top). On a steep tile the real foot is anywhere from 0 to 16 px
//   above that bottom, on a gentle one from 0 to 8 (low half) or 8 to 16 (high half) - so the model is at worst one
//   tile PESSIMISTIC and never optimistic. Counting a slope as a SOLID stair step would put the foot at the top of the
//   tile and credit a take-off from the low end of a steep slope with sixteen pixels it does not have: with a jump of
//   51 px against three rows of 48, that is the difference between "three rows" and "four".
//   Walking is unaffected: a run of steep tiles climbs a row per column, which the fill's step-up-one already walks,
//   and a gentle pair climbs a row per two columns.
//
// What the rule costs: a jump that only works from the top of a slope reads as one row short, so a route that NEEDS
// such a jump shows up as UNREACHABLE in tools/reach.mjs and has to be given a step. That is the right way round.
//
// In the grid this is: a slope becomes AIR, and the rock that every slope must stand on is the footing. reachcore
// already treats an unknown tile id as not-standable and not-solid, so today it happens to do this by accident; this
// module makes it the rule, keeps it true if reachcore's predicates ever grow a default, and tools/slopes.mjs proves it
// cell by cell against the physics.
import { isSlope } from './slopes.js';

export function slopeReachTile(t, T) { return isSlope(t) ? T.AIR : t; }
/* a copy of L whose grid reachcore can read (L itself when it has no slopes: the same object, so nothing changes) */
export function slopeReachGrid(L, T) {
  let g = null;
  for (let i = 0; i < L.grid.length; i++) if (isSlope(L.grid[i])) { if (!g) g = L.grid.slice(); g[i] = slopeReachTile(L.grid[i], T); }
  return g ? { ...L, grid: g } : L;
}
/* floodReach, taught slopes: what phase 2 makes the default */
export function floodReachSlopes(floodReach, L, T, opts) { return floodReach(slopeReachGrid(L, T), T, opts); }
/* THE LEVEL RULE the reach model leans on (and phase 2's newlevel check): every slope stands on rock, and is not roofed
   by rock (the cell over it must be open, or the knight's head is in the rock while his feet are on the slope). */
export function slopeLint(L, T) {
  const bad = [], W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H) ? T.SOLID : L.grid[y * W + x];
  const rock = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.CLIMB || isSlope(t);
  for (let y = 0; y < L.H; y++) for (let x = 0; x < W; x++) if (isSlope(at(x, y))) {
    if (!rock(at(x, y + 1)) || isSlope(at(x, y + 1))) bad.push([x, y, 'no rock under it']);
    if (rock(at(x, y - 1)) && !isSlope(at(x, y - 1))) bad.push([x, y, 'rock over it']);
  }
  return bad;
}
