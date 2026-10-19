# claude/lumbertrailart - THE LUMBER TRAIL art pass (SONNET) over the greybox claude/lumbertrail (c6055b37)

Art only: no hitbox, number, grid or entity changed (level-quality's levelHash is untouched, so the pilot / curve / mash rows stay valid). Gated by `L.lumberKit` (src/lumber-trail.js).

## DRAWN (own files: src/redraw/lumber_trail_art.js, lumber_trail_tiles.js, lumber_trail_backdrop.js)
- **Marked pine**: tall tiered conifer, the woodsman's blaze + ochre band, a tally board nailed on the trunk (four slits, a stroke fills one gold), a BITE WEDGE that deepens each stroke (raw wood in it, chips at the foot, splinters from stroke 3), the lean/shake as before. The Queen's pine carries her comb on its bough, and the comb lies on its crown once felled.
- **Felled trunk** per length (bark grain, knots, resin, needle litter, a ringed cut at the stump end, crown boughs) - level (bridge) and diagonal (lean-to / drop); the ramp's ONEWAY stubs and the bridge's PLANK cells are hidden (`L.fellSet`, also restored from the save's marks); the **STUMP** it leaves (ringed face + hinge tongue).
- **Fall line**: a ghost-trunk band along the line it will lie (gold; red for a drop), dashed edges + an arrowhead, and the ground **LANDING MARK** (chalk X in a ring; a peg with a red rag for a drop).
- **Cabin** (logs, notched corners, sod-and-plank roof, lit window, door, lantern, firewood), the **chopping block with the axe stood in it**, the **woodsman** who hands it over (dressing, not an entity) and his chimney smoke / axe-chip ambient.
- **Skid road**: every step of the stump slope is a sawn stump (pale ringed face, bark front, root fringe); the plateau is a corduroy road (log ends in a course). **Gully**: wet rock, a trickle with rounded stones. **Ford**: shingle bed, the landing stone, the drowned stump (algae ring), the sawdust hollow with timber shoring, **LOG RAFT** (lashed logs, rope, a pole in the stern, ripples), the broken footbridge on its cribs. **Camp**: trodden yard + sawdust, palisade fence + gate (the existing `fence` decos), tent, firewood pile, **saw frame** over the sawpit (+ drifting sawdust), pit shoring, **LOG STACKS** (end-on rounds), cliff strata, the **woodsmen's store** (dark, beam, lantern, tool rack, barrel) and the **crew's den** (dark, beam, bone charm, cold fire). **Hollow log**: weathered bark shell, rotten inner roof, the dark tunnel, its props became gnarled snapped limbs. **Tarn**: slate bed + walls, drowned snags on the skyline. **Helm pit**: two big stumps. **Hive knoll**: honey-run rock.
- **Every deck is a half-round log** lashed at the ends; **every crib is cribwork** (alternating log courses, ringed ends, a sill). The store's and the den's roof props are declared supports (timber posts).
- **Vines** hang from a drawn pine bough. **Landmark**: THE GREAT HIVE PINE on the far horizon from column 0, her comb and wheeling wasps, growing and darkening as you come; per-area light (`L.tints`: gold glade, cool ford, smoke-amber camp, deep-green ridge, cold tarn, amber hive); the camp's far smoke columns.
- **TRAPPER'S CAGES** (the three bird cages at 233, 280, 455): slatted spruce, a hinged lid, an iron strap, the songbird, and the **trapper's purse tied to the bars with a coin that glints**; open = lid thrown, purse flat. The pay-out hook already existed (the freed bird drops four coins); I only added a gold coin burst when it opens. Nothing else changed.

## CHECKS (all one headless Chrome at a time, PORT 8761)
green: lumber-trail (65), level-quality wood (CLEARS), solid-islands (0 left), signs (986 fit), drawn-solids wood, footing-art, floaters, wood2-beats, readability, frame-cost (wood: 0 read-backs in play).
visible-supports wood: **4 findings -> 0** (8 overhangs; the store/den roofs got declared timber props, the hollow log's props became drawn limbs, a vine-deck was being mis-skinned and was fixed).
mobile-perf (title + wood, 4x CPU, 915x412 phone): wood 59.9 fps, worst frame 33 ms, 11.6 ms busy/frame - inside the budget. pose-frames: no poses added. textfit: no text scope touched.

## SELF-GRADE vs ROOTWAY
**B+ for the pieces, B for the atmosphere = B+ overall, a notch under Rootway.** Rootway wears one dark, glowing, fully re-skinned world; the Lumber Trail is still the bright generic forest (grass-and-dirt ground, the shared parallax trees) with its own identity carried by the drawn timber: the felling set (pine -> bites -> chalk ghost -> trunk -> stump), the stump slope, the cribs and log decks everywhere, the camp's saw frame / log stacks / store, the hollow log and the great hive pine on the skyline. Pictures: work/claude/shots/lumbertrailart/s01-s07 (+ r01 = Rootway for comparison).

## NOT DONE / NEXT
- Backdrop layers (BG.mid / BG.near) are still the shared forest; an area-by-area far layer (clear-cut stumps at the camp, tall straight trunks on the ridge) needs a new backdrop module rather than tints.
- The woodsman is a static figure (no idle frames, no axe hand-over animation); no axe-chop / saw SOUND (visual chips / sawdust only).
- Foes and the hero are untouched (no new poses).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Own backdrop for the first level?** REC: a follow-up art pass gives the Lumber Trail its own far/mid layers (a cut-back camp, a straight-trunked pine ridge, a grey tarn) - that is what lifts it from B+ to Rootway's level. BUILT: tints + the great pine + smoke/snags only.
2. **Trapper's cage pay-out**: REC keep four coins + the gold burst. BUILT: art + the burst; the purse glints so it reads as worth opening.
3. **The woodsman**: REC keep him as dressing beside the axe block (no talk/handover logic). Alt: make him an NPC with one line when the first pine is felled.

## FILES
src/redraw/lumber_trail_art.js, src/redraw/lumber_trail_tiles.js, src/redraw/lumber_trail_backdrop.js (new), src/main.js (hooks gated by L.lumberKit), src/forest-supports-art.js (crib -> cribwork), src/lumber-trail.js (lumberKit flag, tints, declared roof props: no entity/grid change), index.html (modulepreload). Stills: work/claude/shots/lumbertrailart/*.png.
