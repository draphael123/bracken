# claude-levelq: the level quality bar

## What changed
- `tools/level-quality.mjs`: a data-only lint (no browser). Ten measures per level (flat, bands, mechanics, music, secrets, checks, encounters, density, route, slopes). Built on the walked route from `tools/pacing.mjs`. Explained in `docs/LEVEL-QUALITY.md`.
- Registered as `level-quality` in `tools/check.mjs`. It gates `GATE = ['theatre', 'fair']`; `theatre` is skipped with a note until it exists. `node tools/level-quality.mjs <id>` and `--all` (report, exit 0, ~80 s).
- Added, at the coordinator's request: INVISIBLE SLOPES (every slope collision cell needs a drawn diagonal tile).

## Calibration
- THE MAGE'S FOLLY clears all ten with room: flat 11% / level ground 33%, 8 height bands (61% of width has a second height), 12 gadget kinds (4 in 3+ places), own track, 3 secrets, 7 checkpoints (one per 103 tiles), designed encounter in every section, 2.4 foes/screen (23% empty screens), route spans 30 rows with 5 pockets.
- The CURRENT FAIR (672 cols) FAILS 7 of 10: flat 49%/87%, 2 bands (6% width), 1 gadget kind (carousels, none developed), no designed encounter in columns 0-600, 0.5 foes/screen (64% empty), 24 slope cells with no art, flat route. It passes secrets, checkpoints, and MUSIC (it has its own track, marketday, used by no other level: the brief expected a music failure, that is not true on this base).
- So `npm run check -- level-quality` is RED on this branch on purpose (proves the check). It goes green when the fair rework lands. Merging this lane before the fair rework turns the suite red.

## INVISIBLE SLOPES
The general tile painter in `src/main.js` draws slope tiles (ids 20-25) only through `cvTile()`, guarded by `L.caravan`. Slope cells: caravan 122 (drawn), oreroad 3 (NOT drawn: three R1 cells), fair 24 (NOT drawn: the Stall Stair, 6 rows up and down in R2A/R2B/L2A/L2B pairs). The baked sand art itself is correct for all six kinds (the top edge follows `heightAt`), so the fix is to extend that guard (or paint slopes for any level with slope tiles); the tool reads the guard from main.js, so widening it clears the check with no edit here.

## --all table (33 campaign levels; 5 clear)
Passing: crown, keep, burial, mage, burning (crown/keep/burial are tall: flat and density not measured).
Miss (why): wood bands,mechanics,secrets,route; marsh bands,mechanics,secrets,checks; stockade bands,mechanics,secrets,route; spore bands,mechanics,secrets,density; kings bands; scree flat,bands,mechanics; hanging mechanics,checks; spire mechanics; moor bands,route; storm flat,density; longwater mechanics; reef mechanics; flotilla bands,mechanics; hurricane bands,route; lamplit bands,mechanics,secrets,density,route; underleaf flat,bands,mechanics,route; deep mechanics; causeway mechanics; harbor flat,bands,mechanics,secrets; waymeet bands,mechanics,route; undercrown mechanics,secrets; fields bands; fallingtower mechanics,secrets,checks; witchlight bands,encounters,route; oreroad flat,bands,slopes; unburied bands,secrets; caravan bands,mechanics,density; fair see above.
The most common miss is bands (a single wide ground floor) then mechanics (few developed gadgets); none of these is gated.

## Checks run
level-quality: RED on the fair by design, mage clears (exit 0). dangling-paths, homepaths, comments: green. syntax parses.

## UNVERIFIED
- The suite as a whole, and every other named check, was not run (lane rules). The flat measure reads the route pacing.mjs picks, which can take an unusual line through a level.
- Thresholds were fitted on 33 levels of which one is the benchmark. Two of them have thin margin on the Folly: density (2.4 against a 2.0 floor, 23% against a 30% cap) and flat share.

## QUESTIONS FOR DANIEL (each with my recommendation; built as recommended)
1. Checkpoints: the brief said 2-4, but the Folly stands 7 (one per 103 route tiles, the S4 rule). Recommendation, built: at least 2 and at least 90 route tiles per checkpoint (so 700 columns keeps up to ~8). Do you want a hard cap of 4 (then the Folly and most of the campaign fail)?
2. Density floor: DESIGN B7 says 2.5-4.5, but the Folly counts 2.4 when only real foes are counted. Recommendation, built: 2.0-4.5 plus at most 30% empty screens. Or raise the Folly?
3. Old levels that miss the bar (list above) are not gated. Do you want a rework queue drawn from that list (most often: bands, mechanics), starting with those?
4. Oreroad has 3 invisible slope cells. Recommendation: fix with the fair (one guard change in main.js paints slopes for every level).
