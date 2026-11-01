# claude/palisadesteps - "invisible steps in Palisade Wood" (Daniel 11-01)

## Cause
THE FELLED EDGE's first prop (`edgeRamp`, cols 21-24, rows 34-37): knock the wedge and the scaffold section folds down into a ramp of two
SOLID steps (propCells). The cells went solid (cellSet nulls their tile picture; the props paint the steps themselves in
src/redraw/palisade_world.js `steps()`), but the drawer recomputed the step cells from the LIVE grid (`propCells(d, solidAt)`):
once laid, the cells read as already solid, a ramp column fills "down to the first solid cell" = zero cells, so `steps()` drew nothing.
Result: a 4-wide solid block the hero stands on, with only the pale backdrop scaffold ghost behind it (photo: scaffold gone, rungs
of the cliff tile beside it). Same after a death (a laid ramp stays and is laid again).

## Fix
- src/palisade-hands.js: each ramp/tower/bridge hoist keeps `cells` taken from the pristine ground at reset (kept with a stay-down ramp);
  layCells reuses them; `H.hideArt` flag (tool use).
- src/redraw/palisade_world.js: the drawer uses `h.cells`. The steps are the existing palisade timber: log-ends stacked, lashed, a
  capping board per column. Geometry/level hash unchanged (no reach/curve change).
- Stills: scratch\lane-reports\palisadesteps\ (before2-1.png / after-1.png, 2x; daniel-photo-1101.jpg); also work/claude/lane-done/palisadesteps-{before,after}.png.

## Check (the class)
tools/drawn-solids.mjs gets a Palisade phase (default ids now `buriedcity, palisadewood`, so it is in the suite): knock every prop, then every
solid cell with no tile picture must show hands art - frame with props' art on vs off differs inside the cell; run again after a respawn.
PROVED RED on the old drawer (12 undrawn cells 21-24,34-37), green with the fix. The generic path is `--all --report-only` (drawn-solids-sweep).

## Other spots
The all-level `drawn-solids --all --report-only` sweep could NOT finish (PC RAM stayed under 1500 MB; it stalled at level 11/69 and I stopped it, findings print only at the end). Not run: other levels. Run `node tools/drawn-solids-sweep.mjs` on a quiet PC. For Palisade the new phase covers every prop. Palisade bridges/towers (watchtower, gatehouse scaffold, spans) draw fine (cells are one-way spans drawn by bridge()).

## Checks run (all green)
palisadewood.mjs, level-quality palisadewood (curve ok, route ok), palisadeart.mjs, level-reach (all), drawn-solids palisadewood (3 phases clean).
