# claude/pilotmovers - the level-1 pilot rides movers (sonnet, 2026-10-18)
Base master e0436ee8. TOOL code only: no game or level change. Port 8734, one browser at a time, all exited.

## What changed
1. **tools/mover-hands.mjs (new)**: a hands function the level pilot calls before the bot (the flotilla-route verbs, made generic). At a gap with a mover that can bring the far side it walks to the lip, WAITS, and jumps when the mover's predicted top (position + dx/dy over the flight) is where the jump arrives; a mover well below is stepped off onto after a wait; on a mover it stands (the mover carries it), goes to the far edge and jumps to the next mover / ledge when level; in the air it holds the jump, steers over the target and brakes. Rides benches, yards and plain back-and-forth / up-and-down platforms. Swings and wheels are OFF (o.swings): the bot's own rules did better (kings went 3 -> 5 deaths with them on). Carts, pads, lifts, growcaps, buckets are never taken.
2. **tools/level1-pilot.mjs**: runs the hands (`--nomovers` turns them off); and the real cause of most of the 21 deaths, which was NOT the riding: **the pilot's lifts**. The Flotilla's bilge is a `harm` + `swim` pool, which the lift's wet() skipped (it ignores swim pools), and the route model swims the bilge, so ~half the waypoints are IN it and every lift dropped the hero into the foul water. Now a harm swim pool counts as hazard water, a wet waypoint in it is reached by the highest deck / mast top within 12 columns (where the hands take over), and a drop that reaches the bottom with no tile or mover is a void (`--oldlift` restores the old lift). New debug flags: `--lifts` (log each lift and how), `--mtrace=colA,colB` (frame trace of hands/bot in a column range).
3. docs/level1-curve.json + docs/level1-pilot.json re-stamped for flotilla; the flotilla CURVE_REPORT_ONLY row removed (tools/rule-state.mjs).

## Pilot, knight, 3 runs summed (deaths / % lost a run)
| level | before | after |
|---|---|---|
| flotilla | 21 / 775-847% (20 stamped) | 6-10 / 300-424% over 6 runs (stamped: curve 8 deaths 335%, pilot 9 deaths 424%) - act III band is 100-500% / 1-9 |
| kings (swing booms) | 2 stamped (3 measured) | 3 / 151% |
| hanging | 3 stamped / 3 measured | 3 / 138% |
| longwater | 4 stamped / 4 measured | 4 / 265% |
Attribution on flotilla (4-6 runs each): old lift + no hands 21; harm-pool lift fix alone ~14; + hands 12; + dry-deck lift spot 7-10. The waist exam (col 92) still costs one death a run (a real fight), the castle (186,15) and the powder ship boarder (518-530) a few.
Movers by level (kinds): flotilla benches/yards/swings; hanging, longwater, hurricane, lamplit, waymeet, burial, witchlight, fields, spore, reef, wood: plain movers; marsh/caravan pads, scree/moor/underleaf wheels, kings/spire swings, many lifts/carts/buckets (not taken).

## Checks
Green: curve-gate (flotilla in band, none out of band and unlisted; 20 OTHER levels print "stale" rows - not from this lane, master state), level-quality flotilla: curve ok (335%, 8 deaths), pilot ok (79 blows, 9 deaths), 12 of 13 rows ok. **Red, not mine: `mash` - "the level changed since the mash bot ran"** (src/level.js changed in 3fa97aa0 / hurricane merges after the last flotilla mash stamp). Fix: `node tools/mash-bot.mjs flotilla --level flotilla --write` (a 10+ min run, not done here).

## QUESTIONS FOR DANIEL (rec first)
1. Re-stamp the flotilla mash row (level then boss) in the next integ? Rec: yes, it is pure bookkeeping.
2. The ~20 stale curve rows (wood, stockade, spore, scree, hanging, spire, moor, storm, lamplit, underleaf, undercrown, mage, burning, witchlight, skyroad, ksar, rootway, church, buriedcity, sealedpyramid)? Rec: a pilot-restamp lane after the hands + lift change, since both can move numbers a little; I did not restamp them.
3. Should swings/wheels get hands too (kings/scree/hanging)? Rec: no; the bot handles them and the hands made kings worse.
