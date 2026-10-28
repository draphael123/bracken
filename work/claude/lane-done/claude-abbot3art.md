# claude-abbot3art - FALSE ABBOT 3 ART lane - claude/abbot3 (art on b03dbe0f), sha 5a77544d
Level hash (spire, levelHash): before 12c40f832fd4, after 12c40f832fd4 - UNCHANGED (src/level.js and src/main.js untouched; only src/false-abbot.js draw code + abbotFrame table, src/redraw/false_abbot.js frames). No gameplay numbers/hitboxes/timings touched.
FPS (tools/mobile-perf.mjs, 4x CPU, spire@48:29 / @64:29): art 17.0 / 20.5 fps; greybox base 13.4 / 20.6 (spire is below the 40 budget at base too - pre-existing; the first art draft cost ~5 ms/frame, fixed by replacing radial-gradient glows with stacked discs).
## Drawn
- Sprite: new frame 21 FALL (tumbling, mitre flung off, pot out) used for 'fall' (bridge drop / chair spill), frame 22 BEATEN (flat on face, mitre rolled away, pot upended, gold hum) for the finale; ABBOT_FRAMES 23. 'downed' keeps 16.
- Bridge bells (2 per bridge): stone corbel + iron strap + yoke with bronze gudgeons, bronze bell, hauling rope to an iron ring; blessing bell gets gold ripple rings, glow, kindled lip. Dropped bridge: iron-strapped planks with bronze studs, rope rails, hinge pin, sways; haul told by shuddering rope + dust.
- Chair: gilt/bronze gabled back with mitre finial, quilted red velvet, orphrey, arms with knobs, cushion + tassel, footboard; four cords to a bronze ring, rope over a sheave. Beam: iron gantry hung on chains from the roof, bronze caps, rivets. WINDLASS CATCH: ratchet wheel turning with the basket + a stone-weighted pawl that holds the chair until the basket moves (clicks while it runs). Chair sways when spilled; gold rings when he prays in it.
- Censer smoke: bronze brazier with feet and coals, billowing incense column (warm base to pale head) with rising gold chevrons (it lifts you). Prayer wheel: spinning bronze stud ring, prayer strips, gold rings. Great bell finale: pillar of light from the roof, tolling rings, orbiting glints, motes drifting from him to it.
- Fall FX (speed streaks + dust). Dressing: maroon/saffron banners and bronze chain lamps under the decks (cloth + bronze, no new timber).
## Checks
false-abbot (all pass), false-abbot-art, floaters, architecture, comments, tells, ability-poses, boss-read: green. Not run: tools/check.mjs, boss-rates (art only; 64% band unchanged).
## Pictures
scratch/lane-reports/abbot3art-p2-chair.png, -p3-wheel-smoke.png, -finale-beaten.png, -sheet.png (work/abbot3art/shot-*.png has more)
## Not done / questions
1. Windlass is small (roof beam at top of frame, ~16 px wide); rec keep, legible at 2x. 2. Dropped bridge shows as an 88 px plank column (greybox logic kept). 3. Great-bell ring flash on the actual strike not drawn (no state flag); rec a later hook. 4. No seated chair pose for his prayer in the chair (kneeling frame reused); rec later B16 pass. 5. Stone dressing limited to bell corbels; belfry scaffolds are still the level's timber frame.
