# claude/grubhook - LORD GRUBBAG: the shelf climb + hook (Daniel 11-04). NOT merged, NOT deployed (merge after SAT 11-07 cut).
## Changes
- src/kitchen-gate.js: the arena's one shelf (A0+9..12, FL-5) became a CLIMB over the middle of the line: low shelf (A0+8..10, FL-4, 32 px over the line) and high shelf (A0+11..13, FL-6, 32 px up; jump peak 51 px, so every hero). The hero hook (rail 'kg-arena-b') now starts over the high shelf (rope 20 px over it), runs down to END OVER HIS PLATTER (x1 A1-17; every hero holding any way lands on it) - the platter drop (third opening) kept. Rail A (the lower one) is now `npc: true` (attendants ride it and hand to the hero rail as before; no hop for heroes).
- src/zipline.js: one line, `z.npc` rails are never taken by a hero (findCatch).
- src/grubbag.js: bot hook route = line -> low shelf -> high shelf -> UP (replaces the lower-hook/kick hand-off). dmgMul 2.9 -> 3.4 (see rates). HP NOT touched (Daniel 11-04).
- Sweep etc. only hit a hero standing on the line, so a hero on the shelves/hook is out of the belt attack window (tell 0.8 s + ~1.1 s of plates).
- tools/kitchengate.mjs, kitchengate4-keys.mjs follow (climb asserts, npc rail, landing); kitchengate-shots.mjs +2 shots (gh-arena, gh-hook-sweep).
- Restamped kitchengate pilot/curve/mash (docs/*.json). The curve row jumped (hits 45->85, kills 34->74 ...; two seeds agree): the old row predates earlier Kitchen Gate changes, treat as a re-baseline.
## Rates (tools/boss-rates.mjs kitchengate --ways=built --built-seeds=6, flasks kit, L20, knight/warden/pyro; a page CRASH each run is excluded)
| state | knight | warden | pyro | pooled |
|---|---|---|---|---|
| BEFORE (master 9ff9bd70, dmgMul 2.9) | 5/6 | 2/5 | 3/5 | 63% [39-82] n=16 |
| AFTER climb, dmgMul 2.9 | 5/5 | 4/6 | 4/5 | 81% [57-93] n=16 (HIGH) |
| AFTER climb, dmgMul 3.4 (shipped) | 3/6 | 4/6 | 3/5 | 59% [36-78] n=17 |
Per-hero floor 0.4 held (50/67/60%). Edge of band: 3.2-3.3 would likely sit ~65%; a 12-seed confirm is cheap if wanted.
## Checks
GREEN: node --check; tools/kitchengate.mjs (0 FAIL), kitchengate4-keys (knight/pirate/geomancer, climb + drop), level-quality kitchengate, curve-gate, mash-gate, zipline. Not run: full suite / check.mjs.
## Shots: scratch/lane-reports/grubhook/{before,after}-{arena,hook-sweep}.png
## Questions (rec first)
1. dmgMul 3.4 vs 3.2: rec keep 3.4 until a 12-seed confirm. 2. Rail A's rope still crosses the low shelf visually (attendants only): rec leave for the art pass. 3. Shelves are greybox planks: rec art lane skins them (hook-stack art pass owed).
