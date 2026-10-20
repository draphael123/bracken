# claude/oldtuskerart - OLD TUSKER + the wood's creatures: the art pass (SONNET), off claude/oldtusker ef2072d4

ART ONLY: no geometry, timing, hp or entity changed (levelHash untouched; wood rows stay valid). The kite colour is a spawn-time cosmetic.

## DRAWN
- **OLD TUSKER** (src/redraw/old_tusker_art.js, bound by src/old-tusker-hands.js; the POSE table is still the contract, a few `pitch`/`stretch` values tuned): one baked, outlined, alpha-snapped sprite per pose x 1/8 of its stride x phase x flash (cheap: ~100 small canvases total). Torn ear, grey-frosted withers, scars, mud-caked belly, stiff mane (stands on end in P2), long stained tusks, red eye + snout steam when angry. Own pictures for sleep (heap, breathing), wake, walk, chargeTell (hoof raking, dust, pitched rump-up), charge (stretched, legs flung, dust), turn (skid), rammed (dazed, stars), sweepTell (head cocked back, tusks up, glint) / sweep (head hooked low), rootTell (snout dug in, earth heaped) / root (head flung up, clods), stompTell (reared on hind legs) / stomp (fore hooves slammed, dust), pinned (on his side, legs kicking), thrash. Bestiary card redrawn from the same sprites.
- **Marked pines**: now the LUMBER KIT's own pine (tally board, bite wedges per stroke, lean/shake), felled trunk (kit trunk sprite, flipped for the east side) and stump; spent = stump + a green shoot for its last 1.6 s; **regrow**: the new pine grows from a sapling over 1.5 s with a turned-earth puff.
- **The felling clearing**: cut-ground floor tile (col 510+, `clearingTile`: packed pale loam, sawdust drifts, chips, bark flakes, a drag rut), and edge dressing from the kit (log stacks, rail fence, stumps, felled log, chopping block + axe, a new sawhorse with a half-sawn plank) plus the old boar's wallow and chip drifts. All low, behind the fight, not solid.
- **BOAR** (common foe, bakeBoar) and **PINE MOTH** (bakePineMoth) redrawn at the same canvas/anchor/pack size (mane, frost, tusk, mud, dust on the tell/charge, stars on the daze; moth with pale veined wings, eyespots, feelers).
- **Kite goblins (rec, cheap)**: on the wood the 7 kites fly a woodsman's kite - spruce-twig frame, birch-bark / oilcloth / moss / grey cloth, hemp string, tail of chips ending in a pine cone (src/main.js two lines + `drawWoodKite`). The goblin body itself is unchanged.
- Shots in work/claude/lane-done/: otart-poses.png (all 16 poses), otart-boar-moth-card.png, otart-pines.png, otart-regrow.png, otart-fight.png (in-fight frames: wake, walk, chargeTell, charge, rammed, rootTell, root).

## CHECKS (one headless Chrome at a time, PORT 8793)
old-tusker 25/25, lumber-trail 91/91 (re-run after the kite edit), solid-islands ok, visible-supports wood 0 findings, level-quality wood ok (all gates), footing-art wood ok, drawn-solids (buried city) ok + drawn-solids-sweep wood 0 undrawn (clearing tile included), floaters ok, tells ok, frame-cost ok (0 read-backs), readability ok.
PERF (mobile-perf, 4x CPU, 915x412): wood 59.7 fps, the clearing wood@528:8 55.9 fps (p95 33 ms) - inside the budget.
NOT RUN: pose-frames / ability-poses are hero-ability tools (ability-poses timed out, irrelevant to the boss); no cast-poses tool exists yet (B16 checked by eye on the pose sheet). corpses.mjs not re-run (his death burst is unchanged). Full suite left to the gate.

## SELF-GRADE
Boar B+/A-: reads at game scale, every move distinct, still a procedural-shape look at 1x (no hand-pixel edge cleanup). Pines/clearing A- (kit-true). Wallow is subtle; kites B (frame + cloth only). Not seen in motion by a human: the stomp/pinned/sweep frames were checked on the sheet, not in a live fight (the bot fight reached 7 modes).

## QUESTIONS FOR DANIEL
1. Kite goblins: I only reskinned the kite (frame, cloth, tail). Want the goblin riders in woodsmen's caps/coats too (a new baked rider, ~1 lane)? Rec: yes, later.
2. The wallow is a flat mud pan; want a real set piece (mud he rolls in before phase two)? Would need a told move - a design lane.
3. The hiveBg decos still sit in src/lumber-trail.js (hidden at draw time); deleting them changes levelHash and needs a re-stamp - left alone. Rec: remove on the next re-stamp.
