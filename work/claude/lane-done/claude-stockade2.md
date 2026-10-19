# claude/stockade2 (opus) - THE STOCKADE 2: the Watchtowers, the captured horn, the Chieftain's war tower

Brief: scratch/brief-stockade2-1014.md (+ audit-polish.md s.3, audit-polish-1018.md, review-rootway-recipe-1014.md, design-standard A4/A14/B10/B13/B15/B16).
Base: master 45d7d8a1 (BATCH103). Level id `stockade` (road: marsh -> stockade -> spore; goblins are fine here, pre-Goblin Queen).
Exit gate SKIPPED as instructed (Daniel parked exit gates 10-18). Current look kept; every NEW piece is greybox (ART LANE NOTES).

## 1. What landed
**THE WATCHTOWERS** (src/level.js `stockadeWatchtowers`, final columns 443-566, grown in between tower 3's plateau and the lift down into the hall):
- **THE CAPTURED HORN (443-476, TEACH, safe).** A walkway of lashed boards on poles along the inner palisade over a yard. A blower DOZES on the walk
  (`stk.dozing`): he does nothing until you are at his back or he is struck, then winds his horn as ever. Silenced, his HORN FALLS (`stk.drops`);
  walk over it and it is yours for the level (a death keeps it). **E blows it**: told rings of sound, and every camp goblin under you within 15 tiles
  runs to the sound - to the drop of the nearest LOG PILE when one is by you - and stands looking up (they notice you if you come down among them).
  Under the walk, three goblins sit at a cook fire (`stk.cook`) under log pile 1: blow, strike the lashing, CRUSHED. You are on the walk: safe.
- **THE BARRED GATE (476-498, the REQUIRED use).** The inner gate (T.PORT, 486) is "barred from inside: they open it only for their own horn" - a horn
  blown within 16 tiles opens it and its crew (`stk.gateGuard`, held behind it until then) come out to the sound - under log pile 2 on the gate
  tower's deck if you blew it up there. Opened, it stays open (main.js destroyed set); L.reachDoors has it open for the reach fill.
- **THE THREE TOWERS (498-552, THE EXAM, A14).** Climb the first tower's rope and ALL THREE exam blowers wind their horns at once
  (draws 6.5 / 10 / 13.5 s, wound by src/stockade-hands.js even off the screen; drawn by drawHornTell off e.hornDraw). Cross a sagging rope bridge,
  a hanging walk with a gap, tower to tower, over a NETTED STAKE PIT (each chamber has a rope back up: a fall costs the climb while the horns fill).
  A sounded exam horn wakes ITS OWN PACK on the planks ahead (`packOnly`: sprigs on the bridge, sprigs on the walk, a brute + sprig on the way
  down) - never the camp squad behind you.
- **THE SECOND SECRET**: the crow's nest up tower two's mast (515,1). It is the level's third silver MOVED from the high bridge's net (ents order
  kept, so every save keeps its bits; the net keeps a short line of coins). Off the route (pacing), a dead-end pocket.
- **NAMED AREAS** (Rootway recipe 1): L.stockade.areas, a banner as you walk into each - THE OUTER CAMP, THE YARD, THE WALL WALK AND THE KENNELS,
  THE SAPPERS' TUNNEL, THE WATCHTOWERS, THE GREAT HALL. A shrine closes the horn teach (473,19, the gate yard); the hall shrine closes the exam.
- **THE CHIEFTAIN'S WAR TOWER (rec built: CUT ITS LASHINGS)** - the same verb as the log piles (strike the lashing, it drops). His tower stands on the
  dais from the start (foreshadow, sign at the hall door, bestiary line). At his second wind (ENRAGED, 50%) he runs to it, climbs (1.1 s), hauls its
  two lashings TAUT (drawn: slack -> taut, the pegs glint gold) and shoots from it (green bow read: '^' aimed shots every 1.9 s, '^^' a volley every
  4th). Up there a blow lands at the B15 floor (told: CUT THE LASHINGS). Cut one peg and the tower LURCHES (1.8 s, he holds on, no shots - the way to
  the other peg); cut both and it goes over AWAY from you: he comes down IN THE WRECK = his 'planted' opening (x2, its quarter cap), and anything
  under the fall is crushed (the rafters' sapper wave). Safety only: 40 s up there and he climbs down (never the answer). Racks + colour reads kept.
- **B15**: the Chieftain was still on the retired x0.05 chip outside 'planted' (GREED.chipBy had no row) - now **0.4** (src/boss-greed.js).
- **TUNE**: EHP.chief 268 -> **320**. See 3.
- **Act I bar**: level-quality PASS (was 4 fails: bands, mechanics, secrets, route) and THE STOCKADE is on the level-quality GATE now;
  **solid-islands 0** (ALLOW 25 -> entry removed: the Stockade is on the island-post kit - lashed poles - and its bridges' sags / ledges hang off
  their boards and nets); guides on every required verb (the three cranks and both lifts had guides already; added: the dozing blower's horn ->
  the barred gate, the first tower's rope, the pit's ropes; the hall lift's spot moved to 567); a lookout + two shed roofs over the yard and a
  lookout over the road in (second height 33% -> 44%).

Other files: src/stockade-hands.js (new: horn, piles, gate, exam winding, dozer/cooks/crew holds, war tower, areas, drawing, BK.stockade),
src/main.js (wiring; `hornSounds(e)` extracted from the archer's horn branch so the hands can sound an exam horn; pack entries may name a kind;
e.stk copied onto spawned foes; lift `ridden` flag; chief tower modes/frames/x0.5; BK.stockade / BK.eatJump), src/hint-lines.js (STK_SAY routed),
src/threat.js (logpile 0), src/stuck-spots.js, src/lab.js (the boss hands cut the lashings), src/walk-hints.js (horn + gate, cranks, lifts),
tools/level-walk.mjs (stands still on a moving pulley lift - it was STUCK at the first lift on master), tools/boss-run.mjs (rows print the
tower's state), tools/stockade2.mjs (new check), tools/check.mjs, tools/solid-islands.mjs, tools/level-quality.mjs (gate), src/island-posts.js.

## 2. Checks
GREEN: **tools/stockade2.mjs** (new; RED on master 45d7d8a1 in a throwaway worktree - 10 fails: no L.stockade, no dozer, no piles, no cooks, no
gate, no exam blowers, nest silver, areas, war tower, B15 0.05), stockade-horns, level-quality (stockade CLEARS, gated), solid-islands,
visible-supports (REPORT-ONLY: 15 overhangs listed for the art lane), level-reach, checkpoint-gaps, checkpoints, answer-tags, attack-tokens, signs,
dangling-paths, hint-shown, textfit --strict (hints, bestiary, boss: 0 issues), boss-openings, mash-gate (rows re-stamped level THEN boss),
curve-gate (pilot + curve rows re-stamped: L1 knight 127%/run, 2 deaths in 3 - act I band 40-250%), stuck --static, threat-holes, one-new-foe,
goblin-lint, architecture, floaters, deadends.
Mash rows: LEVEL k/w/p all die (28/9/26 deaths) = does not clear. BOSS 0/6 - but the mash bot lands 0 of 5810 blows and times out with the boss
untouched: the SAME row master had (it never wakes him), so the boss row proves nothing either way (pre-existing; for the mash-bot owners).
NOT run: the full suite (coordinator's nightly), mobile-perf, cast-poses (no tool).

## 3. Numbers
**Chieftain** (tools/boss-rates.mjs, campaign L3, practiced, 12 seeds k/w/p):
- WITH FLASKS (human): **7/12 11/12 6/12 = 67% - in band** (was 78% on master, on the 0.05 chip).
- DRY (human+dry): 5/12 10/12 6/12 = 58%.
- other heroes (4 seeds, human): paladin 1/4, pirate 1/4, reaper 2/4, geomancer 2/4, berserker 4/4, ranger 4/4 - no hero at zero.
- fights ~45-75 s (B6 asks ~90-150; at 460 hp the knight fell to 0/6 - an act-I boss, left short). The tower is cut down in most won fights.
- PYRO OUTLIER: half the pyro wins are 7-10 s (9 heavies + a BREAK + finisher at L3, no skills): the pyro's heavy chain vs the 0.4 floor - a
  hero-wide anti-mash/break question, not the tower (reported, not tuned around).
**Walker** (tools/level-walk.mjs, campaign L3, 1 seed each, final geometry; paladin + knight re-run after the gate-crew pike became a hound):
| hero | end | deaths | arrive% mean/min | walked | STUCK spots (all outside the Watchtowers) |
|---|---|---|---|---|---|
| knight | boss | 1 | 71/40 | 97% | 33,19 (the dash-lesson shield; master has it too) |
| warden | boss | 0 | 67/24 | 97% | 293,19 (kennel elite) |
| pyro | boss | 1 | 42/37 | 97% | 136,19 (first crank gate) |
| paladin | boss | 1 | 71/56 | 97% | - |
| pirate | boss | 1 | 50/7 | 97% | - |
| reaper | boss | 1 | 59/8 | 97% | - |
| geomancer | boss | 1 | 41/21 | 97% | 107,19, 355,24 (gantry, tunnel) |
| berserker | boss | 0 | 58/31 | 97% | 293,19 |
| ranger | boss | 1 | 54/35 | 97% | - |
All nine route the level to the Chieftain's door (master's knight was STUCK at the first lift too; that is fixed in the walker). The remaining
STUCKs are the walker's hands at old beats (they resume past them), none in the new section. Arrivals mostly over 50% - the level is easy for
a campaign-level walker (as before); the exam and the gate crew are where the new section's hits are.

## 4. ART LANE NOTES (everything new is GREYBOX; drawn in src/stockade-hands.js or by stock tiles)
1. LOG PILE: four lashed logs at a walk's edge, its pale lashing + gold glint, the creak shake, the fall, the heap where it lands, the crush dust.
2. THE HORN: on the ground (glint), at the hero's belt (lit / spent), the blow's sound rings; the DOZING blower needs a doze pose (B16; he uses idle).
3. THE BARRED GATE: today the default T.PORT portcullis + a drawn bar - wants a lashed-stake camp gate with its bar inside, and its opening.
4. THE WATCHTOWERS: the gate tower and towers 1-3 are plain SOLID blocks (like the camp's old towers) + towertop props - want lashed-timber tower
   bodies; the rope bridge + hanging walk (two 'bridge' spans), the crow's nest platform and rope, the netted STAKE PIT (stakes under the net).
   visible-supports lists 15 overhangs to draw (514,2 516,2 536,7 427-428,8 520-523,8 526-531,8 504-507,10 519,10 508-513,11 102-105,12 410,12
   411-412,13 232-244,17 114-127,21 336-373,21).
5. THE WAR TOWER: frame, deck, red pennant, lashings slack/taut, pegs (+glint), the lurch, the fall (rotation) and the wreck; the Chieftain's own
   CLIMB and DECK-SHOOT poses (B16: he borrows frame 9 to climb/fall and his bow frame 8 up there).
6. The area BANNER (text at the top centre) - to the UI style guide; the walk's posts use the default route-art timber post.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **The tower is knocked down by CUTTING ITS TWO LASHINGS** (the log piles' verb). Rec: keep - one verb, taught twice before him. Built.
   Alts: drop it (strike its leg), or a horn lure that brings his own crew to topple it.
2. **The horn is REQUIRED once (the barred gate); the log piles are optional skill.** Rec: keep. Built.
3. **You keep the captured horn for the level (a death keeps it), E blows it every 2.4 s.** Rec: keep (no softlock at the gate). Built.
4. **The Chieftain was on the retired x0.05 chip; now 0.4 outside 'planted' (B15), hp 268 -> 320.** Rec: keep. Built (67% with flasks).
5. **Fights are ~45-75 s, short of B6's 90-150.** Rec: accept for an act-I boss (more hp drops the knight to 0/6). Alt: 380 hp + a softer volley.
6. **The rafters blower's sapper wave still fires at his second wind, as he climbs.** Rec: keep (stockade-horns pins it; the tower's fall crushes
   them). Alt: drop the wave now the tower is phase two's new move.
7. **A rope beside the first lift** (the walker - and a player who stepped off - had no second way up). Rec: keep. Built.
8. **Pyro's 7-10 s Chieftain kills (break + finisher vs the 0.4 floor)** - a hero-wide question for the anti-mash owners. Rec: look at the pyro's
   heavy fill on the break bar game-wide. Not changed here.
