# claude/ft2art - THE FALLING TOWER 2 ART PASS + CARPET FLASK HANDS (Sonnet, PORT 8808)

Base: origin/master ce20a08d (batch83). Branch claude/ft2art. ART ONLY except the flask-on-carpet (below, QUESTION 1).

## What changed
1. **Flask on the carpet (src/main.js)** - FOUND: the player could NOT drink on the carpet at all (tryDrink needed P.ground; carpetPlayer
   returned before drinkTick), so the Archmage's whole fight - flown - was dry for everyone, bot and human. Now: tryDrink accepts P.carpet,
   carpetPlayer runs drinkTick, the carpet HANGS STILL while he drinks (no steer/dash/swing/block), a hit before the swallow spills it
   (drinkTick's own rule). The lab bot already called BK.drinkFlask() under drinkAt; it now succeeds (no lab.js change needed). Touch
   FLASK button shows on the carpet.
2. **The Archmage's tells as poses (src/redraw/lich.js, src/undead-mage.js undeadFrame)**: 5 new keyframes - RECOIL (his own bolt came
   home, replaces the slumped 'open' for `reflected`), WIDE (arms out, a brass world in each hand: orbitTell/Wait), DOWN (palms to the
   floor, bone dust: boneTell/Wait), WRITE (scribing a rune: scriptTell), CLUTCH (hunched, void in the chest: pullTell). Hurt is still
   LAST (index 18). Sheet: work/claude/ft2art/archmage-poses.png.
3. **The tower's art (src/tower-fall2.js ftDraw, drawing only)**: jagged branching wall cracks with grit; debris as stone block / shelf
   with books and loose pages / brass wheel-plate, plus rubble where each lands; burning books (spined piles, open books, smoke, glow,
   stepped flame tongues, sparks); syrup (rolled edge, drips, bubbles) and fizz (foam head, beads, vapour); treasury (heaps, glints,
   banded chests that lean into the slide, shed coin); observatory dome (stepped brass rim and curved ribs, railed slit with stars,
   dust in the beam) and telescope (banded tube, pier, cog, counterweight, railed eyepiece platform, lens glint); outer face (far
   spires + cloud lit by the flashes, nail heads, lashings, a storm-lantern on every other scaffold with a light pool, scalloped flags,
   a forked bolt with a scorch, grit and torn pages in the gust); the chunk (ashlar courses, torn underside, snapped timber and iron,
   merlons) and THE SNAP (a crack runs up and down the face through the tell; rubble sheds in the ride).
   Before/after shots: work/claude/ft2art/{before,after}-<spot>.png (library, shelf, lab, fizz, dome, scope, treasury, outer, chunk...).
   No timings, hitboxes, tiles or numbers touched; sounds NOT done (no 'creak'/'whoosh'/wind bed/snap crack - still open).

## Archmage rates (tools/boss-rates.mjs fallingtower, campaign level now **L33**, practiced, 12 seeds/hero, jobs 3)
| profile | knight | warden | pyro | all |
|---|---|---|---|---|
| human (WITH FLASKS, now real) | 11/12 | 12/12 | 12/12 | **97%** |
| human+dry | 7/12 | 10/12 | 11/12 | 78% |
Both are ABOVE the 60-70% band. NOT retuned (the FLASK RETUNE SWEEP takes it). Note the campaign level moved 31 -> 33 since the
fallingtower2 lane's 64% (dry); dry alone is already 78% at L33, the flask adds 19 points. Knight's 3 first-run seeds hit "fresh lab page
did not initialize" (load) and were re-run alone: 3/3. Mean win ~130 s.

## Checks (all green unless noted)
fallingtower2, tower-ascent, tower-collapse, tower-hall, tower-cutouts, tower-flyers, solid-islands, dressing, textfit (0 overflow/clip),
signs, tells, boss-read, corpses, fallingtower2-keys (7 heroes), archmage-folly, tower-chase.
- **mark-integrity: RED, flaky, NOT this lane's art**: undeadmage|poisonTell "phantom pose (0 px differ)" on 3 runs of my branch; with
  main.js + undead-mage.js reverted to master it still reds; with lich.js too (pure master code) it reds on a DIFFERENT tell
  (undeadmage|markTell). Each is a "seen 1" sample where both renders are the same frame (likely the hurt frame). Green in batch83's suite
  (160 s). REC: re-run in the suite; if it persists, the tool needs >1 sample per Archmage tell.
- **mobile-perf: RED here, load**: first run "Runtime.evaluate did not answer" (a textfit + rates were running); alone, welltown 35.2 fps
  vs budget 40 - a scene this lane does not touch (the tower draws only on its own level). Re-run on a quiet machine.
- pixels (headless floats) not run separately (no sprite moved; the Archmage frames keep the 60x68 canvas/anchor).
- Not run: the full suite.

## QUESTIONS FOR DANIEL
1. Flasks on the carpet were impossible - I made them work (hangs the carpet still; a hit spills). REC: keep: the boss target was set
   "with flasks" and the fight is entirely flown. Alternative: no flasks in the sky fight (then keep the dry rate as the target, 78%).
2. He is 97% with flasks (78% dry) at L33: the FLASK RETUNE SWEEP should raise him ~30 points - his invulnerability outside openings
   stays; REC: more/longer fire-room and realm pressure rather than health.
3. Sounds for the tower (creak, wind bed, snap) still unmade.

## ROUND 2 - Daniel's live notes (10-10): the glitchy fill-the-area spell, and "he punches"
1. **GLITCH FIXED (src/undead-mage.js, src/main.js)** - cause: a blow that sends his own bolt home staggers him (`reflected`) mid-windup;
   the GRAVE SCRIPT's lines (every band red-lined, runes drawn) were only cleared when it fired, so the unfired script stayed drawn at full
   strength until his next cast, with the banner still up. Now told things live only in their own windup: the script, and the unfired
   skulls / orrery / void tells, are dropped the frame the mode leaves their tell, and the stagger drops the banner (`c.unsay`).
   Test: tools/archmage-interrupt.mjs (in check.mjs). Negative control with the fix disabled: the script survives the stagger (after:true);
   fixed: cleared the same frame (script, bone storm, orrery). No timing or damage touched. mark-integrity and untold-told green.
2. **PUNCH FIXED (src/redraw/lich.js, undeadFrame)** - cause: the storm cast raised a bare far fist with an orb, and my first-round
   hand-poses (wide/down/write/clutch) were empty-hand too (replaced). Now EVERY cast is a staff cast: wind-up = the staff hoisted in both
   hands, head in the spell's colour (9 frames, one a spell); release (last 0.35 s of the tell, the same timing) = the staff pointed with a
   hard-pixel glint at the head (bone storm: the staff driven into the floor, dust; script: a rune hangs off the staff); then the release is
   held 0.22 s as follow-through. Sheet: work/claude/ft2art/archmage-poses2.png (before: archmage-poses.png / master).
   Checks re-run green: tower-ascent, fallingtower2, undead-moves, tells, boss-read, archmage-folly, archmage-room, untold-told,
   mark-integrity (the earlier poisonTell flake did not recur), corpses.
