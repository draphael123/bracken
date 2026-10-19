# claude/lumberbackdrop - THE LUMBER TRAIL's OWN backdrop (SONNET art), off claude/lumbertrailart 908e8760

Background only, gated by L.lumberKit (level 'wood'); no geometry/hitbox/number/entity change. New: src/redraw/lumber_trail_far.js; hooks in src/main.js (3 lines) + lumber_trail_backdrop.js (camp smoke now rises from the drawn chimneys). The great hive pine, L.tints, smoke and snags are kept.

## DRAWN
- FAR (0.15): a ridge of tall STRAIGHT-TRUNKED pines (bare shaft, small crown) over a hill band whose colour crossfades per area (24 tiles at each seam); the camp's far slope is cut back (stumps, a lone pine); the tarn has a pale far-water flat.
- MID (0.30): the same pines, with the area's own dressing: ford = pale birches + reeds + a drifting cool mist; CAMP = clear-cut (stumps, slash piles, log stacks, only a few pines) with a BUNKHOUSE, the SAWMILL (gabled shed, lit saw window, log ramp, stone chimney), a SPAR POLE with guy lines + red flag, a timber FLUME and a drying rack - smoke columns now start from the bunkhouse and mill chimneys; hive pines = dense dark pines; TARN = grey water, drowned snags with reflections, reeds, thick mist.
- NEAR (0.55): replaces the shared round leafy trees: slim barked trunks + drooping pine-bough fringe overhead; dense on the ridge, sparse at the ford, almost none at the camp (cut back) and tarn.
- Mid-value hazy colours so foes/hazards/pickups still pop (shots checked at all areas).

## CHECKS (one headless Chrome at a time, PORT 8765)
green: lumber-trail (65), readability, level-quality wood (CLEARS; levelHash untouched), frame-cost (wood 0 read-backs in play).
mobile-perf (4x CPU, 915x412, parallax 'near' = mid + near layers only): wood 59.2 fps, worst 33.5 ms, 14.1 ms busy/frame (was 11.6; +2.5 ms) - inside budget. Full-parallax desktop adds the far layer (~15 drawImage + 40 fillRect).

## SELF-GRADE vs ROOTWAY
Atmosphere B -> **A-/B+**: the level now has its own sky-line in every area (conifer ridge, birches + mist, cut-back camp works, grey tarn) instead of the generic leafy forest; the world no longer looks like the shared wood. Still a notch under Rootway: it is bright and open rather than one fully lit glowing world, the far layer is simple silhouettes (no animated light shafts of its own), ground tiles remain grass/dirt. Overall B+ -> A-.
Shots: work/claude/shots/lumberbackdrop/before-*.png vs after-*.png (cabin, ford, camp, ridge, tarn, hive) + before-r01-rootway.png.

## REDS / NOT DONE
none red. Not done: area seams in the foreground trunks pop in/out (hash-dithered, not faded); the hive clearing reuses the dark-pine ridge; the near layer is not tinted per area beyond L.tints.
## QUESTIONS FOR DANIEL
1. Camp reads cut-back but pines are still dense near the cabin: REC keep (it is the first level, welcoming). Built: as is.
