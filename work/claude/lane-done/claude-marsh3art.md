# claude/marsh3art (sonnet) - MARSH WOOD 3 art pass

Base claude/marsh3 09ac9f94. ART ONLY: no geometry, foe, hitbox or number change (src/marsh3.js untouched; level hash unchanged, no re-stamps).
New file src/redraw/marsh3_art.js; hooks in src/main.js (tile kit, back dressing, movers pass, lever prop, after-water pass, night dark + hole + moon road), marsh2_art.js (WALKS
rows for the new decks + helper exports), redraw/lilypad.js (pad pixels + marsh light), forest-supports-art.js ('reed' kind). Pictures: work/claude/lane-done/marsh3art-*.png (12 shots, 320x180 x3).

## Drawn
1. REED STANDS (cols 460-510): bound reed clumps - stems in four greens with dark gaps, a ragged fringe, reed-cord bands every 14 px, a flat cut head with pale ends;
   bulrush blades + cattail heads fan out BEHIND each head (hero stands in front); a foam collar breaks round each foot on the water. (shots 2, 3)
2. CURRENT RAFTS (444-520, 530-590): rougher raft - plank deck with nails, two bog-oak logs with pale round ends, a pole lashed along the logs, four reed-cord lashings, reed-bundle prow
   and stern, weed; a bow wave ahead + wake behind while the water has her. The whole channel streaks with current (animated dashes, both channels). (shot 4)
3. LOG BOOM (col 552, rows 18-21): round logs chained and ring-bolted, moss at the waterline; two stout piles with iron rings either side; a chain from the right pile to the
   winch deck - taut while shut, slack and dropping to the water once open; foam piling on its upstream face; OPEN = the logs swung aside and bobbing on the water. (shots 7, 8)
4. LEVER DECK (569-572 row 17): winch deck art (marsh2 WALKS 'winch'), cross-braced piles under it, a rope rail, a barrel; the LEVER is a marsh WINCH (corded drum on two posts,
   iron axle, pole arm cocked back = off with a knob glint; thrown over, knob green = on). Bank stilt walks (444-449, 521-529, 592-599, 664-669 row 15) and the bowman's lookout
   (514-518 row 12) now use the marsh2 deck art, with dressing: mooring posts + lantern gallows (docks), woven reed hides, the lookout's rope rail, thatch roof and pennant. (shots 1, 5, 6, 9)
5. NIGHT: bluer dark (3,11,22), a moon behind the dark with a hole in the dark so it stays lit, its road on the water drawn after the dark; the MARSH LIGHT is a cold teardrop
   flame (white heart, green skirt, tail streaming with its sway), baked halo, two circling motes, a broken line on the water. (shots 11, 12)
6. PADS: per-pixel shading (lit top-left, underlip, notch slit, spoke veins, bright rim kept, dark water lip + wobble/ripple tell untouched). SINK = yellow-green with gold-brown
   blotches (a leaf going over); HOLD = cool green, glossy with dew glints and mint rim. (shot 10)
7. REED SUPPORTS: the tufts' poles are now bundles of six stems in olive/straw/green with nicks, rope wraps with knot tails and peeling blades, a splayed head and root flare
   (every stem reaches the head: an earlier version with staggered heads thinned to 1 px and failed visible-supports).

## Checks (one headless Chrome at a time, port 8791)
GREEN: visible-supports marsh **0 of 37**; level-quality marsh CLEARS THE BAR; solid-islands 0 (all levels); readability; frame-cost (0 read-backs); drawn-solids marsh (as loaded + respawn);
footing-art marsh; floaters; textfit worldplates (0 of every issue type); node --check on every touched file.
mobile-perf (4x CPU, 915x412 phone, marsh@col:row): start 448 **52.1 fps** (busy 17.7 ms, first scene after boot), reed run 500 59.5, boom 570 60.1, night pads 620 **59.6**, 645 **59.1** (busy 12.9-14.6 ms).
Every static piece is baked once and blitted; per-frame work is the raft sprite, ~40 current dashes, and the lights' pre-baked halo.
RED (pre-existing, not art): marsh2-beats "ranged foes are 25 of 79 (>= 30%)" - the same RED on claude/marsh3 09ac9f94 itself (31.6% > 30% cap, the new sections' spitters/bowman/wasps);
the foes are data, so it is left to the marsh3 owner (see question 1).
NOT RUN: the full suite, boss-fight-end, cast-poses.

## Self-grade vs the marsh2art kit (B): B
Stands, boom, winch and the lit night read as one marsh and the pads read at a glance. Weak spots: the stands' lower halves sit under the water band so you see only the clump's top 2 tiles;
the raft's lashings/pole are small at 320x180; the tuft supports are still tall straight bundles (9-12 tiles); the winch chain crosses the pad chain in the background (thin, behind the hero).

## QUESTIONS FOR DANIEL
1. marsh2-beats is RED on marsh3 itself (ranged 31.6% vs a 30% cap). REC: swap one new-section ranged foe (the night wasp or the lookout bowman) for a melee frog in the marsh3 lane - not an art change, so left alone.
2. The moon and a bluer dark are a cosmetic choice for the night stretch (no stars, no cloud cover). REC keep; ALT add drifting mist over the night water (costs perf).
3. The chain from the boom to its winch is a story/readability hint (lever -> boom). REC keep; ALT drop it if the pad chain reads cluttered.
