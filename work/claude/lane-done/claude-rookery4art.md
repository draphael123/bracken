# claude/rookery4art - ROOKERY 4 ART (sonnet, 10-31) - on claude/rookery4 bdc67cd9. Pushed, NOT merged/deployed.
## VERDICT: ART DONE, SHOTS OWED. GATE-RUNNING.flag stood the whole lane, so NO headless browser ran: no in-game screenshots, no mark-integrity re-stamp.
Art only: no gameplay number, hitbox, level hash or tell was touched (src/level.js, src/shriek-sisters.js, src/marks.js unchanged). Files: src/redraw/shriek_sisters_art.js (sisters), NEW src/redraw/shriek_roosts_art.js (roosts, moves, portraits), src/shriek-sisters-hands.js (calls + fall arc).
## WHAT WAS DRAWN
- THE SISTERS (all poses, new models): bake 18-26% bigger (canvas 116x70 -> 160x101; hurtbox unchanged), each its OWN silhouette. DIVER heavy-winged and dark: charcoal-slate, widest wing (10 feathers, white bar), long forked tail. SHRIEKER tall and pale: bone-pink, a long neck, 12 px body, red crest fan, throat sac on the neck's base (swells for the MARK and the shriek). SNATCHER broad: barrel chest, barred wings, shaggy mane, thick legs, claws x1.55.
- NEW WING (all three): arm + secondaries along its length + primaries from the wrist + coverts (was a fan on a bead chain).
- Pebble pose: a small stone in the Diver's grip (new `pebble` pose flag; `rock:true` removed from pebbleTell, since the Diver never showed the boulder). Per-move poses are the existing POSE table (each windup differs from its release; tools/rookery.mjs B16 checks green).
- NESTS: woven twig bowl under a rim of bleached ribs (knuckle ends, sticks, a skull, guano), lashed in sinew to a leaning rose-stone CRACKED ARM (strata, black crack), foot = cracked block with the SHARED gold ring (unchanged). SNAP: 1 s spray of stone/bone/stick + dust ring, then the nest lies tilted on a ragged stump with rubble and spilled bones.
- OVERHANG: hanging crag slab with guano lip, stalactite teeth, crack, on a pier; broken = THREE STEPS, each a block on pier stubs (a hero can walk under, as the cells are open), rubble heap, snap spray.
- VENTS: plugged = lashed cap of rubble/bone/guano, thin air leak; open = lit mouth, pale column, swirling streaks, loose feathers, a one-time blow-out ring.
- MOVES: pebble = spinning stone with a grit tail + a dotted red-rimmed ring with a stone chip; SUPPORT MARK = magenta eye-sigil ring over a feather post, label MARK in pink (the scream's mark stays the red post - distinct); FRIENDLY-FIRE line = chevrons Hunter -> sister, crossed ring on her. Gust unchanged (drawGust).
- FALL ARC: a sister put on the floor in one step (nest crash, friendly-fire crash) is DRAWN dropping 0.5 s from where she was: spin, feather trail, landing burst + dust. Draw-only: her hurtbox is on the floor at once (so no gameplay change). Trigger = stuck/downed with a >24 px jump in one frame. Her shadow shows the landing spot from the first frame.
- PORTRAITS: new 9x9 faces (Diver dark + pale crest, Shrieker pale on a neck + red fan, Snatcher shaggy + scar + scar-eye); the hand-over adds a flaring pale frame on the new Hunter's portrait (countdown ring and dimming kept).
## CHECKS (node only)
tools/rookery.mjs, tells.mjs, rookeryart.mjs, boss-read.mjs, anchor-lint.mjs: GREEN. 90 s node draw smoke (drawBack/Boss/Over/Bars, forced steps/nests/pebble/gust, forced fall arc): 0 errors. Mock bake of every POSE x 3 roles: 0 NaN, no top/side clipping (the bottom clips at 9 px under the talons on purpose, as before, so a folded wing never hangs through the nest).
Node renders (tools/node-canvas.mjs, no browser): scratch/lane-reports/rookery4art-shots/{sheet-diver,sheet-shrieker,sheet-snatcher,zoom,roosts-up,roosts-down,portraits}.png (the roosts render has path strokes - rings - omitted; they are unchanged code).
## SHOTS OWED (needs the gate flag gone, one browser at a time, >= 1500 MB free)
1. In-game look: the summit with nests up/down, steps, vents open, a sister mid fall arc, the pebble, the MARK, FF line, a portrait bar with the hand-over flare.
2. ONEWAY under the nests/steps: cells are laid at the nest rim row; the level's own ONEWAY tile art may draw a ledge strip over the bowl rim. I drew the rim at that row so a strip should read as the rim - CHECK.
3. tools/mark-integrity.mjs re-stamp (browser; most of its boss scopes need a page), corpses.mjs (the sisters' death frames use the new bake), rookery-shots.mjs/sisters2-shots.mjs for before/after.
4. Memory: each sister frame is now 160x101 (was 116x70): ~2x per baked frame, lazy, ~80 frames x 3 roles x 2 (white flash) - watch the sisters' scene on the Chrome heap.
## QUESTIONS (rec first; rec is built)
1. Fall arc is draw-only (0.5 s) while the hurtbox is already on the floor: REC keep (no gameplay change). Alt: sim-side fall so she cannot be hit until she lands (a tune lane call).
2. Support MARK colour magenta vs the scream's red: REC keep for colour-blind-safe difference with the eye shape. Alt: red with the eye.
3. Steps shown as blocks on pier stubs, open underneath (matches the cells): REC keep.
4. Old `bird()` portrait fn and ICON table in the hands file are now unused: left in place (not worth a diff here); remove at the next hands touch.
