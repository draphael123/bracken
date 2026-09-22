# Route-break audit, 2026-09-22 (tools/route-breaks.mjs on branch claude/prep, based on a5361a9)
Written after the Gale Moor rope bug (the downdraft cliff's lips laid over its rope). Self-test: laying those lips back over
the rope is caught (3 cuts found). Run: `node tools/route-breaks.mjs [level] [--strict]`.

## Result: no second impossible spot.
### A - 8 ropes that pass through a one-way deck (the Gale Moor pattern, without the downdraft)
flotilla x 50 (row 11), x 145 (row 10) | hurricane x 100 (row 14), x 614 (row 14), x 700 (row 10) | lamplit x 95, 261, 445 (row 34)
The climb code (main.js LADDERS block) stops a climber when the rung above is not rope: under a deck he stands on the last
rung and must jump through the deck, land on it, and hold up to take the rope again. Passable, clunky; Gale Moor's downdraft
made the same thing impossible. PROPOSED ENGINE FIX (one line, for a build session): in the climb's "over the top" test,
keep climbing when the tile above is ONEWAY and the rope continues above it - every such crossing becomes smooth at once,
and no level needs editing. Verify in-page on one ship rope before and after.
### B - 2 ropes that climb to a ceiling (dead ends, harmless): lamplit x 392 row 12; deep x 100 row 34.
### C - 15 unreached shelves one row too high over reached footing: none holds an item (E is clean of them). Burial's at
x 626-680 rows 45/54 are the Charnel Galleries' archer shelves. Others: scree 134, hanging 20/24, reef 122, hurricane 542,
lamplit 120/362/406, undercrown 104/134, fields 698. Deliberate or scenery; worth a glance, not a fix.
### D - 3 walls: crown x 760 (a merlon on the roof over the lockgate), lamplit x 696 (the floor's end), mage x 22 (the hedge
maze at the start). Deliberate.
### E - 34 items the reach model cannot route to, ALL on assisted levels (rides, pogo, flight the model does not follow).
Same set tools/collectables.mjs lists as 'route notes'. Not bugs by themselves.

Not in check.mjs yet (the other session owns tools/check.mjs today): add it as `route-breaks` with --strict once the A
crossings are fixed by the engine change, so a new cut rope fails the suite.
