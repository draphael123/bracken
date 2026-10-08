# claude/pilotbarge - the level-1 pilot's lifts are mover-aware (the Fog Canal "wall" was a measurement artifact)

Branch claude/pilotbarge off claude/towpath 625e5925. Port 8757. Level data untouched; only tools/level1-pilot.mjs, docs/level1-curve.json, tools/rule-state.mjs.

## The fix (tools/level1-pilot.mjs)
When the pilot's bot cannot reach a waypoint in 240 frames it is lifted there. New `liftTo`: if the landing would end in a hazard pool (main.js's own pool test, plus a drop-down check that finds no tile or mover under the landing before the water) the hero is put ON the nearest mover (barge / raft / punt / lift / slab, within 28 columns and 14 rows) standing on it, else on the nearest dry standable ledge; dry landings are teleported exactly as before. Falls the bot takes itself are untouched and still counted (no hazard exemption). Gates not weakened.
New output: per-run line "big hp events (>=12%): N from the bot (M within 90 frames of a lift); W of L lifts met hazard water (rode / dry footing)", `--events` lists every big event, `--oldlift` reproduces the old teleport for a before.

## Proof (canal, 1 run, same seed)
- --oldlift: 35 of 38 lifts met hazard water; 25 big (>=12%) events, 18 within 90 frames of a lift, nearly all 27% splashes (13,26 / 17,30 / 18,30 repeating).
- new lift: 28 lifts, 19 met water (4 on a mover, 15 on dry footing); 14 big events, 4 within 90 frames of a lift. The repeating lift-splashes at the same waypoints are gone; what remains is the bot walking off a bank itself (counted, as a player's fall would be).
- Water that IS the player's risk still counts: longwater/reef/flotilla/keep (water kills or hurts; their lifts rarely met water, bot falls still count: longwater 33 bot events).

## Re-measure (--curve, knight, 3 runs; before = row in docs at base)
| level | before | after | band |
|---|---|---|---|
| canal | 436%/12 (stale; branch canallight measured 646%/15) | 420% / 7 deaths | act 4 120-600, 1-12: IN, row written |
| towpath | 352% / 7 | 340% / 8 | act 4: in, row written |
| longwater | 63% / 0 (report-only) | 242% / 4 | act 3 100-500, 1-9: IN, row written, removed from CURVE_REPORT_ONLY |
| reef | 97% / 0 (report-only) | 174% / 5 | act 3: IN, row written, removed from report-only |
| flotilla | 111% / 1 | 255% / 4 | act 3: in, row written |
| keep | 256% / 0 (report-only) | 272% / 6 (173%/4 on an earlier run) | act 3: IN, row written, removed from report-only |
| underleaf | 45% / 0 | 44% / 0 | out (report-only, unchanged; lifts met no water) |
| undercrown | 345% / 9 | 408% / 10 | act 2: still out, not written (report-only unchanged) |
Longwater/reef/flotilla/keep changed with 0 water-lifts, so that movement is NOT this fix (their old rows predate survival2/other batch79 changes, and the pilot is run-to-run noisy: keep gave 173% then 272% on identical code). Honest read: only canal (and a little towpath) is this fix.

## Checks
curve-gate: no failures from my rows; remaining "stale" rows (spore, kings, storm, unburied, redgorge, underwell, skyroad) are pre-existing at the base, not touched. level-quality green ("every gated level clears the quality bar").

## Notes
- Pilot results are not bit-deterministic run to run (see keep); bands are wide enough.
- Not re-measured: the other act levels outside water/mover routes.
