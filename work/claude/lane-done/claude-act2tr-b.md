# ACT II TRANSITIONS - LANE B (claude/act2tr, on top of lane A c688b508) - 11-04
Status: CODE-ONLY, node checks green (tools/demo-transitions.mjs 284/284, transition-woodmarsh 31/31, node --check x4). NO browser run (release gate running). Not merged, not deployed. Tip = `git log -1 claude/act2tr` (the commit that holds this file).

## Rows (src/transitions.js TABLE, after row 6; ACT2_BUILT = ['A','B'])
| # | row | kind | opening (checked against the built levels) |
|---|-----|------|----|
| 7 | oreroad > minecart | WALK-OUT, `adit` | cols 524-528 (w5, the level's last five), rows 9-13; walk.floor 14 = the winch landing's top (the arena floor row 18 is the shaft under the buckets) |
| 8 | minecart > storm | GATE-END (gate col 1410), plain walk+fade | TODO-LANE-C: S1 daylight scene replaces it |
| 9 | storm > undercrown | WALK-OUT, `crumble` (placeholder look) | cols 796-797, rows 26-29 (the bridge's end wall). TODO-LANE-C: S2 'the bridge gives' + arrive.drop replaces it |
| 10 | undercrown > kitchengate | WALK-OUT, `arch`, walk.to 99 | col 99, rows 162-166: the bricked arch in the hall's east wall, past the fight (the bay cols 76-98) |
| 11 | kitchengate > crown | WALK-OUT, `hatch` | cols 600-601, rows 17-21 (the level's last two) |
Row 12 (crown>longwater) = lane C, untouched.

## Code
- transitions.js: 5 rows, DUST for adit / arch / hatch. transitions-art.js: GATE_PAL adit / arch / hatch (greybox-plus recolours; lane C draws real ones).
- main.js (one edit, trnBegin): `walk.floor` (tile row) sets the walk's y, so heroes standing on Ore Road buckets/over the shaft walk on the landing, not in air.
- demo-transitions.mjs: ACT2_BUILT adds B; floorRow honours walk.floor; opening-must-reach-the-arena-wall (a 2-wide wall may start at wallR-1: Storm's cols 796-797, wallR 797); allowed kinds + w<=5; the needs: regex now reads `ROAD_OPEN.x ? 'a' : 'b'` (Highcrown's needs is that ternary).

## Checks run
node --check main/transitions/transitions-art/demo-transitions ok; `node tools/demo-transitions.mjs` all 284 green (geometry + ARRIVAL replay for all 5 rows, 4 seats); `node tools/transition-woodmarsh.mjs` 31 green. No browser, no check.mjs.

## OWED (after the gate; flag gone, >= 1500 MB free, one browser)
1. `node tools/demo-transitions.mjs --browser` (loops all rows incl. these 5): clear credited+saved first, gap air after kill, arrival solid/clear/unhurt, skips, 3-4 seats, reduce, console clean. `--shots=<dir>` for pictures.
2. EYES: oreroad - heroes standing on buckets over the shaft are SET at the landing's y (walk.floor 14) at the open beat: a visible pop if they were left of col 513; check where they stand when the Winchmaster dies, maybe add a walk.from x snap. Undercrown arch (col 99 is 24 tiles past the fight; the walk is ~25 tiles, the camera holds the gate). Kitchen hatch look. Storm crumble is a placeholder.
3. Confirm all 4 boss kills reach winLevel+trnBegin (code reading says yes), and minecart's gate-end walk.

## Questions (rec first)
Q1. Ore Road: heroes may fight over the shaft; REC keep walk.floor y-set and see it in the browser pass; alt add an x snap (walk.from 514).
Q2. Undercrown has a dead `gate` ent at col 90 (the bay) and the real exit is solid rock past col 99: REC the arch at 99 (built). Alt: a real level-data stair/tunnel to the kitchen (level lane).
Q3. Rows 8 and 9 stay plain until lane C builds S1/S2 (REC); the scene lane should replace beats/arrive of those two rows only.
