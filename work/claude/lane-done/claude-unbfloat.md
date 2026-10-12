# claude/unbfloat - THE UNBURIED FIELD: no floating geometry (sonnet, 2026-10-12)

## What I found (honest)
- tools/solid-islands.mjs already read 0 bare islands for `unburied`: the earlier unburied4 lane (10-05, tools/unburied-aloft.mjs) had put a trestle / pier / cart frame / shore under every board island (32 islands, all held), and unburied-aloft is green. So the "floating" Daniel sees is what those two tools cannot: geometry JOINED to the ground by the grid but hanging over air.
- I walked the real page (shots in work/claude/shots/unbfloat/, before-* / tour-* / after-*) and scanned the grid for every OVERHANG (non-air run with >= 3 rows of air under it). 32 overhangs; 29 were already drawn footings (gun-deck trestles, timber trestles under the bridge decks, shores, the toppled tower's and the gatehouse's painted facades). THREE were floating:
  1. PALISADE 104-105 (peg wall over the mass-grave pit): its feet hung 4 rows over the trench floor.
  2. PALISADE 154-155 (peg wall of the high route, over the long trench): its feet hung 5 rows over the trench floor.
  3. ONEWAY plank 101-103 row 27 (the way to the coin shelf): keyed into the first palisade's side, 13 rows of air under it, nothing else.

## What I built (counts: supported 3, moved 0)
- SUPPORTED, drawn only (R.structures; no tile moves, so the trench stays open and the route is the same):
  - `ubheads` x2: a CAIRN OF HEADSTONES (mortarless courses of mismatched slabs, carved crosses and round-headed arches, moss in the joints, a capstone the palisade stands in) from each trench floor up to the palisade's foot (src/redraw/unburied_siege.js drawHeadstoneCairn).
  - `ubbrace` x1: a stone CORBEL BRACE with a moulded cap, bearer and iron straps from the plank's far end down to the pillar (drawStoneBrace).
  - Dropped to the ground / raised as a mound: 0 (nothing needed it - dropping the pegged walls would have blocked the trenches).
- NEW GATE tools/unburied-footings.mjs: every overhang must have a drawn footing (a palisade/rock run covered whole by one) or sit in a painted wall facade. PROVED RED FIRST: with the three footings deleted it names the plank and both palisades; green with them.
- Theme: undead/graveyard only (headstone cairn, stone brace); no wood added, no goblins.

## Re-stamp
No geometry moved (grid, ents and moversExtra identical; structures are not in levelHash): NO mash/curve re-stamp, neither level nor boss row. mash-gate green: 46 levels hold.

## Checks (PORT 8865, on a loaded PC)
solid-islands unburied 0 / unburied-footings / unburied-aloft (A+B) / architecture / floaters / reach-heroes unburied (0 new crossings) / deadends per hero for all 8 (knight warden pyro paladin pirate reaper geomancer berserker: every dead end pays) / stuck (122 spots) / mash-gate / unburied.mjs / unburied-walk / unburied-look 11/11 / pixels (headless floats) / boss-fight-end - see work/claude/unbfloat-checks.log (copied) for the final lines.

## Reds
- level-quality unburied: FAILS bands / secrets / density - IDENTICAL on base master 4fabe26c (checked with my change stashed); unburied is not in GATE, so it is not a gate red. Report only (a level-quality pass for the field is separate work).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. Is the gun-deck's timber trestle (siege works, 12 runs) on-theme enough, or should the high route stand on stone/headstone piers too? Rec: leave it (it is the host's siege battery, a battlefield, not off-theme forest wood). Built: left as is.
2. Were there other places that read as floating to you than the pegged palisades and the coin-shelf plank (e.g. the 2-tile steps cut into the trench walls, the tower's cantilever decks)? Those are keyed into revetted walls / the drawn tower and I judged them held. Rec: send me the spot (x column) if one still bothers you. Built: no change there.
