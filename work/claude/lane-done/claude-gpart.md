# GPART - the Goblin Princess redraw (sonnet, art only) - claude/gpart

Branch `claude/gpart` off `origin/claude/hcship` (675aa9eb7), worktree bracken-gpart, pushed. NOT merged, NOT deployed. Touched only `src/redraw/goblin_princess_art.js` (rewritten) and `tools/hc3art-sheet.mjs` (one number: the contact-sheet width for the bigger cells). No stats, no behaviour, no src/goblin-princess.js edit, so it merges clean beside HCPROOF.

## What she is now
All 34 frames redrawn, same frame keys, same gpFrame, same timings, same exports (GPF, GP_FRAMES, GPC, bakeGoblinPrincess, gpFrame, sheet, drawGem, drawTiaraFlying, drawRipple, drawFanGust).
- 1.4x the old size (cell 54x46 -> 92x78, ~60 px tiara to slipper; the hero is 26).
- 5-tone ramps per material with a lit top-left edge and a dark far edge (blob/tube shading + a whole-silhouette rim pass), dark internal outlines on every limb, then the standard outer outline.
- Gown: hot-pink upper over-skirt with gold-piped scalloped edge, magenta lower over-skirt in fanned satin pleats with swags, pale pink ruffled petticoat, gold hem with pearls; bell silhouette with puffed tier edges and a wavy hem (not a triangle); purple sash and tail (the Queen's colour), ruby brooch.
- Puffed sleeves with gold bands, cream gloves, two-bone arms (elbows bend), purse, hand bell, rapier with a bright fuller and gold cup guard, feather-edged pleated fan.
- Head: big green head, long leaf ears with a pink inner and lit edge, indigo hair with bun, bow and ringlet, pointed nose, lashed eyes with iris and highlight, fangs, smug/lidded/angry/wide/happy/cry/spiral eyes, smirk/grin/pout/shout/wail mouths. Tantrum frames (tiara told/thrown, stomp told/stomp) have red flushed cheeks, anger marks, stamping dust.
- Gold tiara with a ruby (same family as the Queen's crown). New run poses (hem tilt, lifted stockinged foot, arms swing).
- Parts re-drawn to match: gems, flying tiara bigger and outlined.

## Hit box and draw offsets
Sprite ax/ay now 34/74 (feet row, body centre) - main.js, the chase actor and the cameo all draw from sp.ax/sp.ay, so no code change was needed; the in-game stills show her feet on the floor. The HIT BOX IS UNCHANGED (12 x 20): src/goblin-princess.js ties e.y to h/2 (`onLanding = e.y < floor - 8`), so a taller box would flip that test and is a behaviour change. The first-pass sprite already stood ~1.8x its box. REC for HCPROOF/Daniel: leave it; if she should be easier to hit above the waist, change h with the onLanding offset in the same edit.

## Look
- BEFORE: scratch\lane-reports\gpart-before-sheet.png (= hc3art2-sheet.png)
- AFTER: scratch\lane-reports\gpart-after-sheet.png (34 frames x2)
- In-game (node-driven real page, 640x360 buffer): scratch\lane-reports\gpart-stills\ - sheet.png (all 30), chase-02/05/08, fight-1/4/6/7, cameo-02/03/04. I compared the sheet against frogking2b-poses.png and art3-gq2-queen.png: same dark outline, ramps and highlight edge; palette family (green skin, gold crown, purple) shared with the Queen.

## Checks (node only; one headless page, 4.5 GB free, tools opened first)
exit 0: hc3art-sheet (34 frames, silhouettes of the flash frames match, windup != release), gprincess, goblin-lint, comments, anchor-lint, tells, floaters. hc3art-shots (chase, fight, cameo): no page errors. Not run: tools/check.mjs (forbidden), blow-tags (red before this lane).

## Not perfect / owed
- Gloves read as white rounded hands (no fingers); the ringlet and bun read as two dark balls at 1x. Both are fine at game scale; a finger/curl pass is cheap if Daniel wants more.
- The fight stills caught her in walk, lunge/flurry tells, recover and preen; the tantrum, pinned, stunned, bolt and escape poses are checked on the sheet only (no in-game still; needs the phase-two/bell setup).
- The cameo sits at the screen edge behind the Queen (unchanged placement from hc3art); the wider gown crops a little there.

## Questions for Daniel (rec first)
1. Keep the hit box at 12x20? Rec: yes (see above).
2. Want fingers on the gloves and a flowing (not curled) ringlet? Rec: only if the 1x stills read poorly to you; one small follow-up.
