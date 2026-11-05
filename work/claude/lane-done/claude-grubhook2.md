# claude/grubhook2 - LORD GRUBBAG hook stack: art pass + 12-seed confirm. NOT merged, NOT deployed (merge after SAT 11-07 cut).
## Changes
- ART (src/island-posts.js, src/redraw/kitchen_art.js drawKgChain, src/route-art.js): the two hook-stack shelves no longer stand on the generic timber posts (generic wood, and the posts ran down THROUGH rail A's rope). They are now HUNG SHELVES: forged roof plate, black iron link chain, clamp over the board's edge (new routeSupports kind 'kgchain'; routeSupports only, no tile change). Chains at both ends of the low shelf, west end of the high shelf only (clear of the hero hook's rope). The hero hook (rail kg-arena-b) rope now starts on its own roof chain (anchor) instead of hanging in the air. Rail A's rope now passes clean under the low shelf. The shelf boards themselves were already the kitchen dresser-shelf tile (not greybox).
- BALANCE: dmgMul 3.4 -> 3.3 (src/grubbag.js). HP untouched.
## Rates (tools/boss-rates.mjs kitchengate --ways=built, flasks kit, L20, knight/warden/pyro, n=12 a hero, one job)
| dmgMul | knight | warden | pyro | pooled |
|---|---|---|---|---|
| 3.4 (seeds 7-12 only, +6 old) | 9/12 | 5/12 | 6/11 | 57% [41-72] n=35 (just low) |
| 3.2 (seeds 1-12) | 11/12 | 8/12 | 9/12 | 78% [62-88] n=36 (HIGH) |
| 3.3 (seeds 1-12, SHIPPED) | 10/12 | 6/12 | 9/12 | 69% [53-82] n=36 (IN BAND; warden 50% > floor 0.4) |
Logs: scratch/lane-reports/grubhook2-rates{,32,33}.log
## Checks (each tool on its own, no check.mjs)
GREEN: node --check; tools/kitchengate.mjs; kitchengate4-keys (all heroes, climb + drop, no page error on rerun; one earlier run page-crashed); level-quality kitchengate; curve-gate; mash-gate; solid-islands; floaters; floating-geometry (gated level theatre ok).
REPORT-ONLY, not new: floating-geometry lists kitchengate's boards (it does not count routeSupports chains, so my shelves @568-573 stay listed like the other 55); anchor-lint kitchengate 19 (belt overhang @569-580,20 etc., pre-existing, kitchengate is not gated).
RED but not mine: tools/zipline.mjs page-CRASHES (Inspector.targetCrashed) on master too (checked in bracken/).
## Shots (scratch/lane-reports): grubhook2-{before,after}-arena.png, -hook-sweep.png, and grubhook2-{before,after}-arena-zoom.png (4x crop)
## Still owed
Nothing on this lane. The 3.3 band read is n=12 a hero (CI 53-82); a bigger table belongs to the joint tune lane.
## Questions (rec first)
1. Keep dmgMul 3.3? Rec yes. 2. zipline.mjs crashes on master (Stormhold, headless Chrome): rec a small lane to look. 
