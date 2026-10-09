# claude-tunnelfix (hotfix off master 3595a284)

Reproduced with tools/no-hidden-hits.mjs (legging tunnel, god on, every attempted blow judged by drawing the frame with and without the attacker):
- grindylow GRAB from INSIDE the barge hull (x within her length, 6 px under her deck): swimmers swam under her to reach the end edge.
- the stop-planks BARGEE hooked the hero from the dark ledge (0 px drawn), even with her lantern dimmed; watchmen loosed from the dark.

Fixes
- (a) src/canal-foes.js hullSolid: swimmers can't be in her x-range; pushed to a free place beside/ahead (water, no stone, no wall crossed). Squeezed with nowhere: can't act. Edge x now at her gunwale (outside), barReach +6 compensates.
- (b) rippleTell/boardTell/grab at her end draw two green hands on the gunwale (src/canal-hands.js drawCanalFoeFx) with the existing splash, ring, !! and 0.75 s tell; boarding starts outside the hull.
- (c) enemies were already drawn after the barge; the real hidden cause was the tunnel dark. A foe at work (tell/draw/loose/within 72 px of a hero) gets a light hole for 1.5 s (drawCanalFog); bargee ignores an unlit hero in the tunnel (darkBlind, main.js updateGaffer).
- Game-wide: tools/no-hidden-hits.mjs (in tools/check.mjs). BK.draw1() added (one frame drawn, no update). Page seeded.

Results: canal, canal-water, canal-aloft, canal-tunnel-route (all heroes, stray/ride) green; lantern-eater, arena-shut, render-layers, stuck green on the first pass (before the hullSolid wall-aware rewrite; only grindylow code changed after). Level hash unchanged: no mash re-stamp.
Other levels (12 foes sampled each): only undercrown shardling (shed) caught -> listed KNOWN in the tool, owner's lane. Long Water: not caught by the sample. Ranged note only: deep-lock watchman shoots from off-screen (165 px).

## QUESTIONS FOR DANIEL
- Foes at work glow in the tunnel/fog; wanted, or hide-and-seek back? (built: glow)
