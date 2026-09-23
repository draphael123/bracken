# THE UNDERWATER KEEP + THE DROWNED KING — rework brief (Daniel, 2026-09-21, from playtest)

## What Daniel said
"Drowned king level is almost there."
1. We need a way to disable whirlpools. There can be a button you hit.
2. We need more environmental scenery to make it feel like a sunken castle.
3. The boss is good, but I'd like him to have a trident he uses, and can occasionally throw.
4. He is a little too hard right now: he should be slower and have much longer stagger windows.

## Where things are
- Level: `keep` (THE UNDERWATER KEEP), builder in `src/deep-split.js` (underwaterKeep) + `src/keep-expansion.js` +
  `src/keep-passages.js` (the SIPHON GALLERIES: the "whirlpools" are the siphons - an iron mouth with a dark whirl round
  it that pulls you in). Arena in `src/level.js` ~2862 (`boss: 'drownedking'`). His current: `P.whirlFree` in main.js.
- Tests that pin it: `tools/keep.mjs`, `keep-runtime`, `keep-expansion`, `keep-passages`, `keep-expansion-runtime`.

## The changes
1. **SLUICE WHEELS.** Each siphon gallery gets a wheel/lever (an existing prop pattern: `crank`/`lever` - struck to turn)
   placed BEFORE its siphons, on the route. Struck, it shuts that gallery's siphons (the whirl stops, the pull stops,
   a clang + the water calms). Stays shut for the attempt (marks set). Optional-but-obvious: a sign at the first one.
   Test: struck -> no pull; unstruck -> pull as before.
2. **A SUNKEN CASTLE.** Dressing pass (DRESS row + hand-placed props + facades): fallen banners, drowned suits of armour,
   collapsed arches, portcullises rusted open, chandeliers on the floor, coral/weed on masonry, sunken statues, skeletal
   guards at posts, shafts of light from above, fish shoals. Measure: props per 100 columns vs Lamplit Street; no
   floaters (tools/floaters.mjs), nothing in the route (dressing.mjs allowlist).
3. **THE TRIDENT.** New baker frames (he holds it). Two attacks: TRIDENT THRUST `!` (a long straight jab, blockable) and
   TRIDENT THROW red ✕ (occasional - he hurls it across the arena, it sticks in the wall; he is UNARMED and slower
   until he wades over and pulls it out = a natural opening). Marks rows via tools/tells.mjs.
4. **EASIER.** Movement and tell speed ~20% slower; stagger windows much longer (at least double the current ones);
   the thrown-trident recovery is his big window.

## Done means
- Pilot at NORMAL health >= 21 runs (write tools/drowned-king-pilot.mjs like tools/mother-hard-pilot.mjs); target
  ~60-75% bot wins; the opening proven caused in tools/boss-openings.mjs.
- One cropped screenshot of the trident king, one of the castle dressing.
- ONE `npm run check`, commit, push, deploy, verify (KICKOFF credit rules).

## THE NUMBERS TODAY (read from updateDrownedKing, main.js - find it by `function updateDrownedKing(`; 2026-09-22)
560 hp. Chooses by timers (phase one / phase two): slamT 6/4, ramT 8/5.5, pressT 3.4/2.4, whirlT 7.5/6, haulT 9/6.5, gulpT
11.5/9, diveT 8.5/6, debtT 8. Tells 0.75-0.95 s (0.6-0.75 in phase two). Swims at 300/340 px/s. His windows: 'stunned' 2 s
(1.7 in p2) when he rams stone, else 0.8; 'mired' 1.6/1.2; 'reel' 0.9-1.2; `open` set to 0.5-1.2 elsewhere.
PROPOSED (the brief's "~20% slower, stagger windows at least double"): every timer x1.2; every tell x1.25 (0.95 -> 1.2,
p2 0.75 -> 0.95); swim 300/340 -> 240/270; stunned 2/1.7 -> 4/3.5; mired 1.6/1.2 -> 3.2/2.4; reel 0.9/1.2 -> 1.8/2.4. The
TRIDENT THROW's recovery (unarmed, wading to pull it out) is the big window: 3.5-4 s. Pilot BEFORE any change (he has no
pilot yet), then after; 24 fights at normal health with jitter; 60-75%.
