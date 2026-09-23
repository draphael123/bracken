# SLOPES — engine batch brief (before THE SUNKEN CARAVAN; agreed with Daniel 2026-09-21)

## Why
The desert needs dunes, and the engine has only square tiles (`T` in src/level.js: no slope type; collision is `moveBody`
in src/main.js ~4066, shared by the player and every enemy). Daniel asked whether slopes are feasible: yes, but it touches the
core movement code all 27 levels run on, so it is its own batch, done safely.

## What to build
- New tile types: gentle (1-in-2) and steep (1-in-1) slopes, each rising LEFT or RIGHT (e.g. T.SLOPE_R1, SLOPE_L1,
  SLOPE_R2a/b, SLOPE_L2a/b for the two halves of a gentle slope). A slope tile is a floor whose height varies across the tile.
- **Collision, opt-in.** A slope-only branch in moveBody (and wherever ground/footing is tested: the player's ground check,
  enemies' edge/turn checks, corpses, pickups settling): when the tile under a body's feet is a slope, the floor height is
  the slope's height at the body's x; walking up/down follows it (no bumping at tile seams; snap down when walking downhill
  so the hero does not "fall" down a slope in hops). Levels with no slope tiles must run EXACTLY as today.
- **Sliding.** Hold DOWN on a slope: slide downhill fast; jump off the end for a long leap. Momentum carries onto flat.
- **The tools learn slopes.** reachcore (a slope is walkable footing: treat as a stair), garrison/checkpoint stand tests,
  floaters, killzones, spawns, pixels, runtime-footing. Tile art for slopes (sand first; rock later).

## Proof
- `tools/slopes.mjs` (in check.mjs): walk up/down every slope kind at normal speed with no hops or sticking; enemies walk
  them; a slide reaches the bottom faster than walking; a jump off a slide goes further than a standing jump.
- The whole suite on every existing level: NOTHING changes where there are no slopes (compare a movement trace on a few
  levels against the pre-change code - memory lesson: verify a fix against the OLD code).
- A small test yard (practice / open yard) with every slope kind.
