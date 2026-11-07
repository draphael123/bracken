# TUTORIAL2 - the straw yard in the roadside tutorial (claude/tutorial2, off master 95bc267a4)

Daniel 11-07 08:43: the TUTORIAL must teach HEAVY, UP and DOWN attack and the plunge, not only the heavy third. CODE + ART, no browser run (owed, below). Not merged, not deployed.

## What changed
- src/opening-tutorial.js: 8 steps -> 12. After ATTACK (gate 51) a STRAW YARD of four gated stations, one target each: HEAVY (cols 52-62, gate 63, an armoured straw man at 58), RISING (64-74, gate 75, a straw crow on a one-way plank two rows up at 70, post drawn under it), SWEEP (76-86, gate 87, a low straw rat at 83 under a beam 80-86), PLUNGE (88-100, gate 101, a barrel with a straw lid at 98, a two-row ledge 93-95 to drop from). Everything after moved +50 cols: OT.W 112 -> 162, block 102-113 (gate 114), dodge 115-126 (127), flask 128-138 (139), shrine 140-149 (150, shrine at 144), inn 151-159, door 156. Torches re-laid.
- Credit: a blow on a straw man is read from its own tag (main.js hurtEnemy passes tag + plunge flag to OPN.dummyHit; blowKinds: heavy / rise / sweep / plunge), plus the yard's own trialEvent kinds routed to OPN.event for blows whose tag is not the plain verb (paladin verdict + dawnfall, geomancer fault, warden run-through, ranger down shot, berserker spin). Credit only counts while the hero stands in that station (+1 col before, +2 after). A wrong blow on the target says why (ARMOURED / TOO HIGH / TOO LOW / FROM ABOVE), once a second.
- Prompts: stepLine(id, k, hero) with moveWords(hero) from the controls.js card rows (names) and opnWords (keys: now also up/down; touch says STICK UP / STICK DOWN). No hard-coded keys.
- Skip rule: a hero with no such move skips that station (gate lifts at once, nothing said or taught, the panel count leaves it out). Today only the ranger's LOW SWEEP (see questions).
- PROG.taught: heavy + heavyblow, rising + rise, sweep, plunge + down (lessonHint reads heavyblow / sweep / down, so the wood does not repeat them). api.taught takes a list.
- Stall gate: unchanged mechanism, each new station has a gate, STALL_S 40, opens 'ON WE GO' and teaches nothing.
- Art: src/tavern-art.js strawSet(kind) - armoured straw man (plate breast + pauldrons under the dented helm), straw crow on a perch, straw rat, barrel with straw lid; same palette/outline/tilt-frame as the inn's dummySet. main.js: dummy ents take otKind (sprite) and otH (hit box); drawLessonProps paints the bird's post and the rat's beam as props (not tiles, nothing blocks the road). Co-op: no trial flag, events are global so either hero's blow counts; prompts follow player one's hero.
- Tools: tools/lesson-opening.mjs: pure updated (12 steps, 9 gates, 7 dummies, geometry, 9 heroes x 3 key sets x 12 steps line lengths <= 96, move names equal the controls card rows) + NEW `sim` (no browser: runtime with a stub api: credits, wrong blow, event aliases, ranger skip, stall, replay reset, panel count); walk updated to new columns with a straw-yard walk (written without a browser, UNRUN). tools/textfit.mjs lesson scope (13 panel frames per hero, door plate at col 154) and tools/lesson-shots.mjs stills updated for the new columns.

## Per-hero prompt table (keyboard words; pad/touch swap the key words only)
| hero | HEAVY | RISING | SWEEP | PLUNGE |
|---|---|---|---|---|
| knight | HEAVY CUT: HOLD X. | RISING CUT: UP + X. | LOW SWEEP: DOWN + X. | PLUNGE: JUMP, THEN DOWN + X IN THE AIR. |
| pyro | HEAVY BLOW: HOLD X. | RISING CUT: UP + X. | LOW SWEEP: DOWN + X. | PLUNGE: ... |
| paladin | HEAVY BLOW: HOLD X. | RISING CUT: UP + X. | LOW SWEEP: DOWN + X. | DAWN HAMMER: ... |
| pirate | HEAVY BLOW: HOLD X. | RISING CUT: UP + X. | LOW SWEEP: DOWN + X. | BOARDING: ... |
| reaper | HEAVY BLOW: HOLD X. | RISING CUT: UP + X. | LOW SWEEP: DOWN + X. | PLUNGE: ... |
| warden | HEAVY BLOW: HOLD X. | RISING CUT: UP + X. | LOW SWEEP: DOWN + X. | PLUNGE: ... |
| geomancer | FAULT LINE: HOLD X, LET GO. | RISING CUT: UP + X. | LOW SWEEP: DOWN + X. | EARTHFALL: ... |
| berserker | DOUBLE CHOP: HOLD X. | RISING CUT: UP + X. | LOW SWEEP: DOWN + X. | AXE SPIN: ... |
| ranger | DRAW: HOLD X, LET GO. | RISING SHOT: UP + X. | (skipped) | DOWN SHOT: ... |
Every line ends with the target sentence ("THE ARMOUR TURNS A LIGHT BLOW." / "KNOCK THE STRAW BIRD OFF ITS POLE." / "TRIP THE STRAW RAT UNDER THE BEAM." / "COME DOWN ON THE BARREL LID."), at most 96 letters in all three key sets.

## Verified (no Chrome launched; free RAM about 3.7 GB)
- node --check: src/main.js, src/opening-tutorial.js, src/tavern-art.js, tools/lesson-opening.mjs, tools/textfit.mjs, tools/lesson-shots.mjs.
- node tools/lesson-opening.mjs pure,sim -> PASSED (556 ok lines).
- node tools/demo-cut.mjs -> all green. node tools/dressing.mjs -> green.
- NOT run (all launch headless Chrome): lesson-opening walk/skip/inn/flow, textfit lesson scope, lesson-shots, tavern.mjs.

## OWED: browser walk, all 9 heroes (knight, pyro, paladin, pirate, reaper, warden, geomancer, berserker, ranger)
Run `HEROES=knight,pyro,paladin,pirate,reaper,warden,geomancer,berserker,ranger node tools/lesson-opening.mjs walk` (the straw-yard half of walk is unrun code) and look at tools/lesson-shots.mjs stills. By eye for each hero: (1) the armoured man is passed only by the hero's heavy (paladin = verdict, geomancer = fault line, warden = run-through, ranger = full draw); (2) the rising cut reaches the crow from the floor (tightest margin: geomancer's box tops out 36 px, crow is 32-48 px up; ranger's rising arrow must hit a target one tile ahead - the arrow arcs steeply); (3) the sweep reaches the rat (knight's crouched-still shield trip, warden's low poke); (4) each plunge lands on the lid (pirate BOARDING, berserker AXE SPIN, pyro firedrop, geomancer earthfall); (5) the sprites read (crow/rat/barrel/armour) and the post and beam sit right; (6) the panel lines fit three rows (textfit lesson scope); (7) co-op replay from the inn board with two heroes; (8) ranger skips the rat and the count reads n OF 11.

## Questions (each with my recommendation; built as recommended, nothing blocked)
1. Ranger has no low sweep in the bow stance (DOWN+SWING on her feet is the kneeling draw; the sweep is the knife's). Rec: skip the rat for her (built). Alternative: add a knife-stance mini step.
2. Pirate's plunge is BOARDING and the barrel cannot be ridden, so the prompt says BOARDING and the lid only takes the landing. Rec: keep the card name (built); say PLUNGE for him if it reads wrong in the browser.
3. Station signs are generic (no hero move names): ARMOUR / STRAW BIRD / STRAW RAT / BARREL LID. Rec: keep, the panel carries the hero's words.
4. Longer tutorial: +50 columns, four extra beats, each one success. Rec: ship; if the demo tutorial feels long, drop SWEEP + RISING behind a skip.
