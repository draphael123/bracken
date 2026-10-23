# MOTHERFACE (claude/motherface, sonnet art lane, 2026-10-23) - THE OLD MATRON IN THE STALK
Base claude/sporewood2tune d4f36c54. Art only: level hash f48637fe943d, hitboxes, timings, AI unchanged. Files: src/redraw/sporewood2_mother.js (face, fringe, 8 idle + new pose params, death frames), src/mother-cap2.js (eye tracking + death hook), tools/sporewood2art.mjs (checks the new dead set, full-byte frame signatures), tools/motherface-shots.mjs + motherface-sheet.mjs.
## What changed
- A bark-flesh crone face grown into the stalk neck under the cap: heavy brows, deep-set foxfire eyes, long crooked nose, wide lipless mouth, wrinkles; the gills hang beside it like hair. The stalk's neck flares for it.
- Per-state expressions: idle blink + eyes follow the hero (8 idle frames); lash tell narrow eyes, bared teeth, glare to the lash side; crush tell eyes roll up, grit; bloom/brood tells mouth gapes, cheeks puff (spray / puffball from the mouth on release); open: eyes rolled back, jaw slack, tongue out, dazed swirl; ward: wince; wither tell: hollow cheeks, pursed mouth; wake: eyes snap open; P2: blazing eyes with halo, snarling idle, foxfire veins over the face; death: eyes dim then out, face sags (new 3 frames).
- Body language: cap now follows the stalk lean; windups lean AWAY and squat, releases throw the stalk and tilt the cap toward the attack; bigger crush squash, taller crush lift, bloom/brood head-back then forward; stalk coil on lash.
- Bestiary / boss portrait recropped as a close-up with the face.
## Pictures
work/claude/lane-done/motherface-before-after.png (every state: bloom, bloomTell, brood, broodTell, crush, crushTell, death, idle, lash, lashTell, open, p2-idle, p2-lashTell, rise, wake, ward, wither, witherTell; before left, after right, game zoom); motherface-bestiary-icon.png.
## Checks (port 8781, one browser at a time)
sporewood2art green, sporewood2 green, sporewood2-probe green, textfit bestiary+card+boss --strict: 2332 screens, 0 issues. mobile-perf spore@424:14 (her arena, 4x CPU phone): 48.7 fps (base 51.5 same minute; one noisy run beside the gate read 38.7); glade 59.7.
No boss-fight-end / full suite run (gate running).
## Self-grade B+
## QUESTIONS FOR DANIEL
1. The face is 25 px wide in a 128 px cap - readable at desktop zoom, small at phone half-res. Rec built: as is. Option: scale the face up ~25% with a wider stalk neck.
2. P2 veins are kept light on the face so the crone still reads. Rec built; say if you want it wilder.
