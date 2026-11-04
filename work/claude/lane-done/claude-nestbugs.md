# nestbugs (claude/nestbugs) - the rest of the nest as wasps (Daniel 11-03)
ART ONLY: same frame indices, anchors, hit boxes, timings, tells, hurt/white paths. Paper nest + resin untouched.
## Changed
- src/redraw/wasp_art.js: helpers exported (put/line/col/blade/bake/pack/BEATS) and reused.
- src/redraw/hornets_nest_art.js: COMB DRONE (small, low, six legs, 8 frames, 21x16), NEST-GUARD (upright, crested helm, plated thorax, heavy crossed jaws, paper plate kept, 8 frames, 24x22), STINGER HORNET (clinging, long needle sting + green gland; flick curls the abdomen forward with a venom bead, 3 frames, 21x22). All: pinched waist, pointed banded abdomen + sting, hairline legs/feelers drawn after the ink. Anchors shifted by the canvas padding.
- src/redraw/honey_hornet_art.js: AMBER HORNET keeps all 10 poses, plates, resin sac, FX; body is now a pointed teardrop abdomen behind a pinched waist, smaller thorax, narrow longer wings, long sting, heavy crossed jaws, long dangling legs, second feeler. Canvas 58x34 (AX 34).
- tools/nestbugs-sheet.mjs (before/after sheet; needs pre-pass copies of the two art files as src/redraw/prior_*_set.js, untracked).
- Not changed: swarm (motes), skep (a real beehive prop), queen/wasp/hornet (waspart).
## Checks (one browser at a time, RAM >= 4.5 GB): hornets-nest 267 ok; foe-pass ok; attack-animation ok; tells ok. boss-read not run (no mini touched).
## Evidence: scratch\lane-reports\nestbugs\nestbugs-sheet.png (BEFORE/AFTER rows per foe).
## Questions (rec built)
1. Guard/drone/stinger walk frames only bob/step a pixel (as before). Rec: fine.
2. Not eyeballed in-game, only on the sheet. Rec: a quick look in the nest at the next playthrough.
