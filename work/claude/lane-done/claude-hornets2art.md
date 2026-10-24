# claude/hornets2art - THE HORNET'S NEST 2 ART FOLLOW-UP (sonnet art lane)

Base claude/hornetsnest2 b0e7a073. Branch claude/hornets2art. Not merged, not deployed. ART ONLY: no grid, entity, timing, hitbox or AI number changed (level hash unchanged; tools/hornets-nest.mjs 165 ok).
Draw-only additions: the map landmark (LANDMARKS + map-scale updated for a 10th critter), an ambient hum (src/audio.js AMB_EXTRA, selected in main.js for cols 0-80 of the nest only).

## Self-grade: B+ (A- on the honey hall and the fat hornet; B on the transitions)
Held down by: the far great pine on the Lumber Trail reads faintly behind that level's mid trees (it is a haze silhouette by design); the marsh edge mud tile steps lighter at row 70 where the shared earth takes over; the pinned queen is a clipped overlay (comb over her hindquarters), not a squashed pose.

## What was drawn
- **FAT HONEY HORNET** (src/redraw/honey_hornet_art.js, all 10 HONEY_POSE frames): four overlapping lacquered chestnut PLATES on the back (bright leading rim, dark seam, glint) over an amber banded belly, a plated shoulder, glossy honey sac; per pose - drip (head tipped, bead), drop, ram tell (blazing eye), RAM (speed-streak smear behind), reel, DROWSY (eye shut, antennae drooped, honey at its mouth, puddle), hurt (squint), DEAD (on its back, legs curled, crossed eye, honey leaking). Bestiary card = fly + ram-tell frames (re-baked).
- **Glob + sticky patch** (src/redraw/hornets_nest_honey.js): glossy teardrop on a thread that stretches with speed; the patch is a domed puddle with skin glints, bubbles, strings of honey, a splash crown in its first third of a second, dulling as it runs out.
- **THE HONEY HALL P2** (src/redraw/hornets_nest_hall.js, hooked in hornet-queen-hands.js / hornets-nest-hands.js): the TEAR (cracks + dust over the royal cell during the told rear-up, falling comb/paper shards; the rip opens a ragged paper-rimmed hole to the pines with a beam of light and drifting motes); the FLOOD (rolling glossy skin with lit crests, meniscus up the walls, bubbles, sticky threads, a wading film in front of heroes, honey drips from the tear's lip that ring on the surface); TORN COMBS and THE LAST COMB hang from the tear on ragged paper ropes sheathed in honey; THE LAST COMB is a ROYAL comb (crown medallion, jewelled queen cells, three capped queen cells, a halo); a SPLASH when any hall comb drops into the honey; the QUEEN PINNED: the comb is drawn back over her hindquarters, her head and forelegs show, honey squeezed out, stars.
- **STINGER HORNET** (src/redraw/hornets_nest_art.js): redrawn as itself - braced upright on the comb, wings folded, abdomen hanging with a green venom gland; the flick curls the abdomen forward with a bead and a red !.
- **TRANSITIONS** (src/redraw/hornets_nest_edge.js, tiles, backdrop): OLD PINES - paper scraps (curled flakes with a shadow) and four abandoned little paper nests hung from boughs with two hornets circling each; MARSH EDGE - a muddy-bank tile (wet mud, sheen, sedge tufts, reed roots, footprints, mossed bank face), swaying tapered reed clumps, cattails, lily pads (a flower on some), low drifting mist; FAR GREAT PINE redrawn (conifer crown, tiered paper nest, hornets circling) on the Lumber Trail and Marsh Wood horizons, placed so the nest is in the 180-tall view.
- **MAP**: a little great pine with its paper nest above-left of the nest's node (src/redraw/hornets_nest_map.js, whole-number block-vote shrink; LANDMARKS entry).
- **AUDIO**: a distant hornet hum in the old pines (two sawtooth voices a few Hz apart through a band round the wasp's pitch, slow swell + wing flutter), synth only, over the wood's forest bed, cols 0-80 of the nest.

## Pictures (work/claude/lane-done/)
- Sheets: hornets2art-sheet-hall.png / -world.png / -foes.png (before | after pairs), hornets2art-before-honeyhornet-sheet.png / hornets2art-after-honeyhornet-sheet.png (all 10 poses + card).
- Pairs: hornets2art-before-<n>.png / hornets2art-after-<n>.png for q2-honey, q2-pinLast, q2-heap, q2-tearTell, q2-tear, q2-dead, hall, foot, stinger, edge-roots, edge-water, edge-gate, hh-patrol/dripTell/drop/ramTell/ram/reel/drowsy/dead/patch.
- After only: hh-glob, hh-patch2, q2-splash, q2-tearTell2, q2-lastfall, stinger-idle/flick (8x), pines, pines2, wood-pine(2), marsh-pine(2), map-nest.
- Tools: tools/hornets2art-shots.mjs (TAG, ONLY, HERO), tools/hornets2art-sheet.mjs.

## Checks (PORT 8783, one headless browser at a time)
- hornets-nest 165 ok (before and after the last change). level-quality hornetsnest ok (curve 88%). corpses ok (hornet, boar, stinger, combdrone, nestguard each die in their own skin; the fat hornet's dead frame is its own sheet). foe-pass + foe-pass-page ok. tells ok (no --write needed: marks untouched). skins, solid-islands, one-new-foe, map-forks, boss-music, ambient-landmarks ok.
- map-scale ok (10 landmarks; the nest's critter clear of every board - first try collided with Sporewood's board, moved left), map-spacing ok.
- textfit: bestiary, hints, mapcard: 453 screens, 0 findings. levelcard for hornetsnest + wood + marsh: 0 findings. The ALL-levels levelcard scope hung (Runtime.evaluate, 1700 s) on this PC - same sweep that timed out in the greybox and BATCH116 art lanes at 480 s; it is the sweep's length under load, not this art (the three levels it matters for pass alone).
- mobile-perf (915x412 @ 2.6, 4x CPU throttle, budget 40 fps), the hall forced into P2 (flood, tear, torn combs, royal comb): **hall P2 54.4 fps**, **marsh edge 60.0 fps**, foot (old pines) 56.9 fps. First draws were hitching (worst frame 217-350 ms): the old-pines nests / scraps / mist now bake at load (warmEdge), the hall's tear/beam/royal comb bake in warmQueen.
- Not run: the full suite, the walker, boss rates (no number, hitbox or AI touched).

## Reds
- The all-levels textfit levelcard scope (above). Nothing else.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **The pinned queen is a clipped comb overlay** (the comb drawn over her hindquarters, her head out in front). Rec: keep. A true squashed pose needs the comb to land lower or her pinned frame redrawn flatter (small hands change). Built: the overlay.
2. **The far great pine is a haze silhouette** on the Lumber Trail (behind the mid trees). Rec: keep; if you want it to read from the first screens it needs a higher alpha or to sit in front of the mid layer. Built: alpha 0.85/0.8, nest in view.
3. **The old pines' hum is very quiet** (a bed under the birds, 0.05 gain). Rec: keep; it should be felt, not heard. Built: that.
