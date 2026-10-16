# claude/owl3art: THE OWL REEVE 3 - ART PASS (sonnet, draw only)

Branch `claude/owl3art` off claude/owl3 dbcabfb3. No number, timing or layout change: `src/level.js` is untouched, so the level hash and the mash rows are unchanged.
Files: `src/chars.js` (bakeOwl frames 13-16), new `src/owl-crown-art.js`, and a few call sites in `src/main.js`.

## What was drawn (the owl3 ART LIST, items 1-6)
1. **Frames 13/14, the wing beat.** Each has its own body now (B16).
   - 13 windup: the sails hoisted up and back with a drawn mass and fanned primaries, the head ducked, tufts flat, eyes narrowed under the brow, the chest drawn in.
   - 14 release: the sails driven down with the tips trailing, the eyes round and wide, and pale wind-lines torn off the wing tips.
2. **Frames 15/16, the pellet.**
   - 15: hunched and screwed-shut eyes, the beak just cracked, the throat lump with its ruff, gag drops.
   - 16: the beak thrown wide with a dark mouth, the pellet (fur and bone) held in it, the pupils pulled to slits, spit.
3. **THE DROP's two breaks** (`drawDrops`, after the tile pass; the grid is unchanged).
   - The void goes from night-sky violet to black, with the village far below it: houses with lit windows, lantern pin-lights twinkling, a mist band, and an updraft of motes.
   - Jagged torn earth walls. Broken plank ends jut out of both lips (splintered tips, nails), and a plank hangs from one nail.
   - Hemp rope ends sway with frayed strands, roots hang under the lips, and a shaft of dark runs on below the boards.
   - Three chalk ticks short of each lip are the village's warning. They burn amber while the wing beat is on.
4. **Wing-beat wind** (`drawWind`).
   - Pine needles, tumbling leaves, dust streaks and grit replace the 1 px white lines. The windup gathers curved strokes off her wings.
   - The drop's lip takes the debris over its edge as a fall into the dark. This replaces the red edge; THE DROP text stays.
5. **Bone pellet.**
   - Sprite: 7 px, fur and bone splinters, tumbling, with a shadow on the boards and a trail.
   - Marks: a soot ellipse, a ring of talon scratches that turn faster as the cough ends, and the pellet's own outline over the red cross.
   - Burst: a ring, the splinters and a dust puff, then powder and shards left in the boards for about 2 s.
6. **Lamp** (`lampFx`).
   - Gutter: the flame jumps and sinks lower, with sparks.
   - Smoking wick: a pulsing ember on the black wick and a column of smoke that thins as the wick cools.

## Grade (before/after shots in `bracken-lanes/owl3art-shots/`, NOT in git: `before-*`, `after-*`, and the `a-`..`f-` iterations)
- Owl frames 13/14: **B-**. The sails read, but the feather fans are a little stringy and pale beside the older sails.
- Owl frames 15/16: **B**.
- The drop: **B**, from a flat pink gap to a real broken edge and void.
- Wind: **B**.
- Pellet, marks, burst: **B+**.
- Lamp: **B+**.
- **Overall B** (the target is >= B). The weak spot is the 13/14 wing fans. A second pass could redraw them as one solid sail with scalloped trailing edges.

## Checks (single, --jobs=1, PORT 8978, a full suite and other lanes running)
- **Green:** owl-lamps, owl-swoop, owl-gust, tells, boss-read, mark-integrity (owl), mobile-perf, hanging-exam, hanging-hoist, hanging-hoist-walk, hanging-walk (errors []), hanging-pilots (errors []: owl 5/12 wins and spider 12/12 on bot pilots with the 150 s cap, informational), textfit hints + bestiary (0 problems of any kind), ability-poses (76/76).
- **Reds:**
  - ability-poses hung 17 min on the first run (load; killed, my PID only). It was green on the rerun.
  - The textfit `plates` scope timed out at 480 s on this loaded PC (the same environmental timeout owl3 saw). hints and bestiary, the scopes touched by art, are clean.
  - hanging-pilots failed once with "the page never put up window.BK" (page boot under load). It was green on the rerun.
- No browser was killed by the memory guard.

## QUESTIONS FOR DANIEL
1. **Wing-beat poses.**
   - **Recommended, and built:** ship at B- for the two sails.
   - Alternative: a follow-up lane redraws frames 13/14 as solid scalloped sails.
