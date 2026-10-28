# ROOKERY 2 ART lane (sonnet) - DONE (claude/rookery2, pushed; NOT merged, NOT deployed)
Base: the opus greybox acb9fed4. Code HEAD a393878c (+ report commit on top). **Level hash unchanged: 1090cc32a3c3** (tools/rookeryart.mjs green). Boss numbers untouched (no HP/timing/damage edits).
New files: src/redraw/gale_harpy_art.js, rookery_anchor_art.js, rookery_hang.js, rookery_arena_art.js, rookery_props_art.js; tools/rookery2art-sheet.mjs, -shots.mjs, -motion.mjs (not in the suite). Shots: work/claude/shots/rookery2art/ (before/ = the greybox).

## DRAWN
- **Shriek Sisters, 28 new poses** (POSE + poseOf() in src/shriek-sisters-hands.js; each mode now picks a pose by how long she has been in it):
  - dive wind-up x2, recover x2 (after a dive), shriek inhale x2 + scream tail, hurt (a wince, eye shut), stun nod x3 (stuck/B/C), perched x3 (wings now TUCKED, head turns/preens), cornered flail x2, the fall (a knocked-down bird still in the air), carry x2 (wings beating), growth x3 (crouch, flung, burst), death x3.
  - Per sister, reachable in the real fight: diver 17 (dive/rake/chain/jar/stuck/ferry...), shrieker 19, snatcher 19 sheet poses; all >= 5 new each + a death each.
  - **Death** (drawDeaths): struck up and back, a spinning fall with loose feathers, lies in the rubble, fades 1.9 s. Needs ctx.bossActive: the LAST sister's death is drawn only while the boss is still active (see Not drawn).
- **P2 survivor looks x3, painted into her sheet** (greybox rectangles gone): diver gift = pale swept crest + white wing bars; shrieker gift = 7-feather red crest fan + pink throat sac; snatcher gift = stitched leather satchel on a strap, scarred brow, big talons. Each survivor wears the other two's (sheet-survivors.png), 1.3x.
- **Gale harpy own sheet**: a PROFILE raptor (the crag harpy is frontal), storm-teal, long white-tipped wings, plume scarf, tail streamers. Frames: hover up/down, THE BEAT (wings forward+down), BROKEN (tumble, loose feathers, dizzy stars), THE TELL (wings flung straight back, chest out, red eye, beak open), hurt. New gust art: S-curved ribbons gathering in the tell, 9 racing in the beat, grit + feathers.
- **Hero hanging** (rookery_hang.js): her scaled legs, toes wrapped over his shoulders, claws in the collar, his arms up gripping her shanks, shed feathers. Used for rides, the ferry, the snatcher's GRAB and the P2 snatch. Ride harpy LIFT: legs hang open, claws spread.
- **Ride kit**: feather trail (quill + barbs, twinkling) to a landing ring with a chevron; mount claw-gouges + guano; GRAB = four pulsing gold corner brackets.
- **Anchors** (rookery_anchor_art.js): baked rock SPIRES (strata, lit west/dark east, guano streaks, crack, lichen, scree foot) with sinew lashings and bone toggles at the neck; stepped stone CORBELS from the face; CHAINS from a riveted iron+bone staple in the overhang to hide-wrapped rings. The **hung nest's arm now springs from its spire's capital** (it floated beside it).
- **No wood**: the Rookery's checkpoint shrine is a bone mast + horn arm + iron cage lantern on a guano-capped stone pedestal; signs are limestone tablets in a stone stub (the photos' wooden gibbet and plank signs). main.js: shrineKind() 'rookery', 3 sign/shrine draw lines.
- **Caps**: pebbles, hairline cracks, guano blobs added to the rock-and-guano crust (every walkable top already had it from the greybox).
- **Boss room** (rookery_arena_art.js): the perch wears a real bone nest (skull on the rim, guano drips) lashed at both ends; egg nests + lashings on both end shelves; THE MONASTERY landmark (tiered terracotta roof, bell tower, lit window, prayer flags, smoke) hazed on a far crag, slow parallax; wind streaks + feathers across the whole screen.
- **Three-bar style**: each bar = a bird-head icon socket (diver crest / shrieker fan / snatcher scar) + framed two-tone bar with quarter ticks; open = gold blink, survivor = ember; a dead sister's plate is cracked with a feather on it.

## CHECKS (alone, one browser at a time, RAM >= 2 GB)
- Green: anchor-lint rookery (0 faults); level-quality rookery (clears the bar; blocking WARN report-only as before); tools/rookery.mjs; rookery-probe (no page error); rookeryart (hash); tells; boss-read; boss-openings; comments; answer-tags; **textfit bestiary 337 screens, all 0**.
- **mobile-perf rookery, 4x CPU: 57.4 fps (p95 18.3 ms), budget 40** (greybox 60.1 on an idle PC; this run had a lane beside it). It measures the road, not the boss room.
- tools/rookery2art-motion.mjs: three kill orders x 30 s each fought with every frame rendered: no page error, no NaN, every mode has a pose, poses cycle in time (no mode stuck on one frame).
- ability-poses (77/77, debt 0), floaters, dressing: green.
- Not run: the full suite, check.mjs, textfit levelcard, corpses (as told), dry rates (no numbers changed).

## NOT DRAWN / WATCH
- Gale ledges' loose eggs/rocks: the module's props hook has nothing moving in the Rookery; static eggs would not read as gale-pushed, so none (rec accepted as "only if they read").
- The LAST sister's death plays only while ctx.bossActive (headless: the victory beat covers it within 30 frames); if the boss-kill beat clears it first she just vanishes into the existing fell banner. Check live.
- The 'torch' props at the arena's ends are the game's generic torch (not redrawn). The ride harpy still wears the crag harpy sheet (frames 0-4) plus live legs; no own carry frame.
- Camera in the headless shots lags a teleport, so the survivor/ferry crops are rough; sheets are exact.
- Hero hang: the hero sprite itself is the normal air frame (arms from the sheet + my gloves); no new hero art for 9 heroes.
- Snatch hold: kept 1.8 s. I did not play it by hand (headless only), so no trap evidence either way.

## QUESTIONS FOR DANIEL (rec first; built = rec)
1. Wood-free checkpoint: bone mast + cage lantern for the Rookery only. Rec: keep; copy the idea to other crag levels later (they still use the wood post).
2. Gale harpy is drawn in profile (differs from every harpy). Rec: keep; it is what makes her tell (wings swept back) read at a glance.
3. Snatch hold 1.8 s: rec keep; play it once on the art build and say if it feels like a trap (then 2.2 s).
4. Monastery sits far west of the summit sky. Rec: keep; it can be the Sky Road's first far landmark too.

## BEST SHOTS FOR DANIEL (work/claude/shots/rookery2art/)
1. sheet-survivors.png - the three phase-2 survivors, each wearing the dead sisters' parts.
2. boss-room.png - the summit: monastery, perch nest, shelves, bars with icons, wind.
3. photo1-ledges.png (after) vs before/rookery2-anchors-gap.png, and photo2-pillars.png vs before/rookery2-caps.png - the two photo spots.
4. sheet-gale.png - the gale harpy's frames (tell, beat, broken); also sheet-shrieker/diver/snatcher.png for the new poses, boss-death.png.
