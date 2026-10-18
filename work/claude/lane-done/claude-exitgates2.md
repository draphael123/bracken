# claude/exitgates2 - THE WAY OUT AFTER THE BOSS (B5, approved 10-18)

## Verified list (node scan of every built level; all exit mechanisms: gate ent, L.gateAfterBoss, L.sanctum, L.escapeGate)
Main.js ends a boss level on the kill (`bossWon` -> `winLevel`) unless the level sets `gateAfterBoss` (gate opens, you walk to it), `sanctum` (Falling Tower) or the Stockade's burning-hall `escapeGate`. The audit's "13 gate-less" was right but INCOMPLETE:
- NO exit object at all (10 fixed here): marsh, spore, kings, scree, crown, causeway, fields, oreroad, unburied. (+ stockade: it HAS one, the chief's escape gate, so it is not on the list; + witchlight, hurricane, lamplit below.)
- A gate ent EXISTED but was never walked to (no gateAfterBoss, so the kill won the level first; the exitgates 10-11 art was drawing a shut door nobody could use): wood (and its gate stood OUTSIDE the arena's west wall, 514 vs wall 517), hanging, moor, storm, longwater, reef, flotilla, underleaf, deep, keep, harbor, waymeet, undercrown, burial, burning, spire.

## What was built
- `src/exit-doors.js` (new): tables ADD / MOVE / OPEN + `applyExits(LEVELS)`, called LAST at the end of `src/level.js` (outside every pass) - no builder file touched, so no rework lane conflicts. Sets `gateAfterBoss`, pushes/moves the `gate` ent. The existing `src/exit-gates.js` art + main.js flow do the rest (kill -> "THE ROAD GOES ON", walls drop, lantern lights, doors open, walk in = win).
- `tools/exit-doors.mjs` (new, node only, registered in tools/check.mjs): every arena level either ends at one gate with gateAfterBoss on flat footing, has the tower door / stockade escape, or is in a named DEFER list.
- Art per level (exit-gates KIND_OF, no new art): marsh = lashed-timber stockade gate; spore, kings = toadstool arch; scree = standing-stone trilithon; crown = crenellated gatehouse; causeway = ship-timber gate with hatch; fields, unburied = stone lychgate; oreroad = headframe lift cage; wood = mossed arch.

| level | gate (col,row) | where | change |
|---|---|---|---|
| marsh | 496,16 | dais behind the Frog King's throne (east frog statue deco 495,16 dropped) | ADD |
| spore | 549,19 | apron past the Mother's Knot (pennant 550 + warn post 547 dropped) | ADD |
| kings | 668,13 | road out of the court, 13 past the east wall | ADD |
| scree | 644,8 | pass beyond the ram's wall | ADD |
| crown | 932,17 | behind the Goblin Queen's throne, on her dais | ADD |
| causeway | 594,23 | last dry stretch west of the Kraken's water | ADD |
| fields | 696,33 | field gate between the low walls, east end | ADD |
| oreroad | 520,13 | east end of the winch-house floor beside the lamp | ADD |
| unburied | 547,36 | past the east wall (siege wreck deco 549 dropped, coins stay) | ADD |
| wood | 550,8 (was 514,8) | far end of the Queen's hive, past her | MOVE |
| hanging, moor, storm, longwater, reef, underleaf, deep, keep, waymeet, undercrown, burial, burning | existing | gate was already on footing at/after the arena | OPEN (flag only) |

## Deferred
- To their rework (told): lamplit (claude/lamplit3), church/lit-church (claude/church3; already has gate+gateAfterBoss), flotilla, hurricane (reworks next week).
- My call: witchlight (arena is a spike pit with drifting slabs, no footing - a door needs a new wall ledge that the gargoyle fight would use; rec: a ledge in the east wall niche, rows 36-37 cols 611-614, gate 612,35, tuned with a boss-rate run), spire (its gate is behind two spike runs), harbor (off the map).

## Level hashes that CHANGE (gate ent added/moved) - integ restamps rows
marsh, spore, kings, scree, crown, causeway, fields, oreroad, unburied, wood (10). Flag-only levels (OPEN list) keep their hash. SCREE is level-quality gated: its `pilot,mash` rows now read stale (expected until restamped); everything else in `level-quality --all` is as before (24 of 47 pass, was 25 only because of scree's stale rows).

## Checks run (static only, no browser)
node --check (exit-doors, level, check, exit-doors tool); tools/exit-doors.mjs ok (41 boss levels, 6 deferred); level-quality --all; solid-islands ok; deadends ok (282, all pay); content-audit (no new flags); gate-alpha ok; comments, homepaths ok; route-breaks on all 22 touched levels: no new findings except oreroad + wood "gate out of reach" in ASSISTED mode (the model cannot follow wood's felled bridge / oreroad's buckets; wood's own checkpoint at 510 reads the same) - needs the real walk. dangling-paths only fails until exit-doors.js is committed (this commit). tells --write not needed (no mark changed). NOT run (they open a browser): mark-integrity, gate-openers, stuck.

## Browser checks for integ
level-reach + level-walk end (marsh spore kings scree crown causeway fields oreroad unburied wood: walks to the new gate and wins; 12 OPEN levels: the gate that already stood is walkable after the kill, esp. moor/storm/reef/longwater/deep/keep/burial where it sits at the end wall); boss-fight-end (fight ends, then gate opens, no soft-lock); exit-gates test/shots (tools/exitgates-shots.mjs on the 9 new + wood: art overlap with throne/statue/wreck/lamp, crown 932 beside the throne, causeway 594, fields 696 beside the Strawking's start, marsh 496); mark-integrity, gate-openers, stuck; mash-gate / level1-pilot / curve-gate / boss rates for the 21 levels that now end on a walk (the pilot/bot must reach the gate; scree is gated); level-jump (uses gate on non-gAB levels); co-op atGate on two of them; reach-heroes for the gate tiles.

## QUESTIONS FOR DANIEL (rec first; built = rec)
1. Levels that HAD a gate that never worked (12 OPEN + wood): turn them into real walk-out exits too? Rec + built: yes (flag only, one line each in OPEN; delete a name there to revert). Alt: leave boss-kill-ends-level for them.
2. Witchlight door: rec a small east-wall ledge (see Deferred) - not built because it changes the gargoyle fight.
3. Spire: gate sits behind spike runs. Rec: clear one landing tile row after the kill, or leave as is. Not built.
