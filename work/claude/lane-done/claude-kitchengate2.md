# kitchengate2 - KITCHEN GATE 2 (OPUS greybox/gameplay lane, 10-27/28)
STATUS: DONE. Branch claude/kitchengate2 (off claude/batch125 a36bf11c), worktree bracken-kitchengate2, pushed. NOT merged, NOT deployed. Full suite not run (targeted checks only).
Brief: scratch/brief-kitchengate2-1027.md + Daniel's 10-27 09:25/09:26 decisions.

## BOSS - LORD GRUBBAG reworked (src/grubbag.js, src/grubbag-hands.js, src/redraw/grubbag_art.js)
- **SEATED + IMMOBILE**: he never leaves the chair or turns (checked through all 3 phases). REMOVED: belly flop, table slam, giant fork, the gravy tureen/pot in front of him. No fork or tureen is drawn any more (that was the clipping). Every hand stays off the floor line. Thrown items leave from where the release pose's hand is.
- **THE SERVING LINE** is a conveyor counter two rows up (one-way, cols 397-412). It carries whoever stands on it toward him, and items come out of the kitchen hatch every 5.6/5.0/4.5 s:
  - **DISH**: when one reaches his platter he eats it and heals 5% (a green +N number and ring). The heal is capped: never above the hp he entered the phase with, and at most 10% per phase. A blow on a dish KNOCKS IT OFF the line and he goes HUNGRY (x0.7, faster).
  - **BOMB** (every 4th item; lit fuse, with a fuse bar): LET IT REACH HIM and he gulps it. It blows inside him (-5%) and he is STUNNED (gold ring + timer, x2, capped at 8% of him per opening, 7 s).
    - The fuse (5.6 s) is shorter than the slow line (7.5 s), so a bomb left alone goes off on the line and singes anyone near it.
    - BAT it (any blow) and it skids to him at 250 px/s.
  - **RED-HOT CHILLI**: a blow on the PEPPER STOVE's bellows (the level's bellows verb) makes the next item a chilli.
    - When it reaches him he is TOO HOT (x2, cap 6%, 5 s).
    - Striking a chilli knocks it off and loses it ("spare the chillies").
  - **After every opening** there is a told WARD (2.6 s, x0.4). A bomb or chilli that arrives during the ward waits on the platter, so there is no chain-lock.
- **B15**: every non-open mode takes x0.45 or more (WELL FED 0.45, WARDED 0.4, HUNGRY 0.7). Past an opening's cap, a blade still lands at 0.45.
- **SEVEN TOLD ATTACKS**, each with its own windup and release pose (B16):

| phase | attack | tell | what to do |
|---|---|---|---|
| P1 | HIGH LOB | ! | A ham arcs high and lands ON the platform you stand on (a red ring on that surface). This fixes "throws don't reach the platforms". Move off the ring. |
| P1 | FLAT FLING | ! | A plate settles to your standing height and then flies flat and fast. Jump it; a shield also turns it. |
| P1 | BELCH | !! | A ring runs along the floor. Jump it, or stand on the line. |
| P1 | SWEEP | ! | Only at a hero on the line: plates skid back along the line's top. Jump them or get off the line. This stops "camp on the conveyor". |
| P2 | GREASE SPILL | !! | He yanks the chain of a grease cauldron hung over the line's end (a separate prop, not in his hands). Burning floor spreads both ways and burns 1.8 s behind its front. Get up on the line or a shelf. |
| P2 | SERVICE BELL | ! | ORDER UP: the line runs x2.2 for 7 s and 2 ATTENDANTS come out of the hatch onto the line (max 2 alive). |
| P3 | GRAB | !! | His arm sweeps out over the floor AND the line. Jump it or roll. |

- **Numbers:** hp 3600, dmgMul 2.9.
- **Marks:** BY_HAND / MARK / ANSWER / HEIGHT rows updated in src/marks.js. tells.mjs agrees (1103 rows). boss-greed knows the stun/hot openings.
- **Bestiary:** new text.

## TUNE (BOT_PROFILE=human + campaign-kit flasks, campaign L20, practiced, the lab bot)
The bot plays the new rule (src/grubbag.js gbPlan):
- knocks off dishes, spares chillies, bats bombs, stokes the stove
- dodges the lob ring, jumps the fling/belch/sweep/grab, gets onto the line for the grease
- fights the attendants

| step | knight | warden | pyro | total |
|---|---|---|---|---|
| first cut, dmgMul 2.2 (n=12) | 10 | 8 | 12 | 83% |
| dmgMul 2.7 (n=8) | 5/8 | 7/8 | 8/8 | 83% |
| + fling blockable, stun cap .08 boom .05, hot cap .06 (n=8) | 6/8 | 4/8 | 7/8 | 71% |
| same (n=12, seeds 101-112) | 9 | 6 | 12 | 75% |
| **FINAL dmgMul 2.9 (n=12, seeds 201-212)** | **6/12** | **6/12** | **11/12** | **64% IN BAND** |

- **Dry** (human+dry, n=4): knight 1, warden 2, pyro 2 = 42%.
- **Mash** boss 0/6 (the boss had 86-100% left after 150 s; docs/mash-bot.json stamped). Mash in level mode dies with every hero.
- **Fight lengths (final):**
  - knight wins 111-130 s
  - pyro 123-158 s
  - warden 169-188 s: long (the warden bot's openings are slow). See Q2.

## LEVEL (src/kitchen-gate.js, src/kitchen-hands.js, src/redraw/kitchen_art.js) - route kept
- **SERVING-LINE CONVEYORS (L.kgBelts, the main mechanic):**

| use | where | what it does |
|---|---|---|
| TEACH | root-cellar floor | Runs east with dishes only. A blow knocks a dish off and pays a coin (2 per line, no farming). |
| TEST | spit hall far floor | Runs WEST, back toward the trench. Its cooks ride it at you. |
| REMIX | serving counter over stove1's grease trail | Stand on it while the trail burns, while it carries you toward the burning end. It brings the first BOMBS: bat one along or it blows on the counter. |
| EXAM | THE SERVING PASSAGE (374-387) | His own line runs into his hall, with dishes and bombs, two griddles set in it and an attendant on it. The approach sets him up (B8). |

- **STOVE FLARES (L.kgFlares):** a glow tell, then flame, on a rhythm.
  - TEACH: wine-vault griddle (alone).
  - TEST: spit-hall ledge, between the cooks (it burns foes too; it stuns the butcher).
  - EXAM: the passage's two alternating griddles on the moving line.
- **MEAT-HOOK RAILS:** all 4 hook rails are now chain-driven one-way rails (zipline `dir`), drawn with hooks and carcasses running along them. Hold UP to take a hook, JUMP to let go. The geometry is unchanged, so the reach model is unchanged.
- **ATTENDANT (new foe, the THIEF reskin as a human serving man, not a goblin):** queen's livery, apron, silver tray.
  - He keeps his range and throws PLATES (yellow !, an arc onto the ring where you stand, a shield turns it).
  - Close in and he raises his TRAY: frontal blows are turned ("TRAY"), so go round him or come from above. Then a told tray BASH (! block).
  - He replaces the rockgoblin throwers at the race perch and the buttery perch, stands in the passage, and comes down the boss line on the bell.
  - Bestiary row, sound kit and ranged role are all wired.
- **BUTCHER:** reskinned HUMAN (skin, beard, no tusk) and his bestiary text updated.
- **Kitchen dressing (greybox, L.kgProps):** 25 placed props of 8 kinds: ovens, spice racks, flour sacks, butcher blocks, steam vents, scullery basins, serving hatches, pan racks.

## CHECKS (one headless browser at a time, RAM checked first: 3.0-4.5 GB free; the gate never had 6 GB)
- **Green:**
  - tools/kitchengate.mjs (node; rewritten boss section + belts/flares/attendant/hook tests)
  - kitchengate-probe (page)
  - level-quality kitchengate CLEARS THE BAR (12 gadget kinds, ranged 6)
  - level1-pilot --write and --curve (knight walked 100%, 66 lifts, about the same as before)
  - mash --level / boss --write
  - reach-heroes: all 9 heroes route (0 blocked)
  - solid-islands, one-new-foe, goblin-lint, threat-holes, tells, boss-read, boss-greed (52 bosses), textfit bestiary --strict (0 findings)
- **Red, not mine:** tools/answer-tags.mjs fails on `forgemaster|*` (12 rows with no ANSWER row). It is on the base, from another lane.
- **Not run:** full suite / check.mjs, corpses (it opened a browser alongside my rates job, finished; not re-run), mobile-perf, boss-music.
- **Stills:** scratch/lane-reports/kitchengate2-*.png (16 shots plus kitchengate2-poses.png, every pose 1:1).

## ART / MUSIC NEEDS (for the SONNET art+music lane; every hook is a named function)
- **Grubbag** (src/redraw/grubbag_art.js; POSE contract in grubbag-hands.js):
  - Final seated model in the new poses: lobTell/lob (ham), flingTell/fling (plate), sweepTell/sweep, greaseTell/grease (fist on the chain), bellTell/bell (hand bell), gulp, STUN (bomb gone off inside: soot, smoke), HOT (red, ear steam, fanning).
  - The grab arm over the line.
  - Check the far-arm/chair overlaps in grabTell/sweepTell (the arm crosses his belly; reads OK in greybox).
- **His hall:**
  - drawBelt (the serving-line conveyor), drawHatch (kitchen hatch + chute), drawPlatter (his platter/table end).
  - drawCauldron + drawChain (grease cauldron on a roof chain), drawBurn (burning grease floor).
  - drawOven / drawBellows (now the PEPPER STOVE).
  - dish(kind) for 'bomb' (lit pudding) and 'chilli'; drawHam, drawPlateFlat.
- **Level** (src/redraw/kitchen_art.js):
  - drawLine (floor belt and counter belt), drawFlare (griddle glow and flame), drawMeatRail (moving hooks and carcasses).
  - drawProp (8 kinds): replace the greybox.
  - Attendant frames bakeAttendant() (7 frames: idle, walk x2, aim, throw, guard, bash) and drawPlate.
  - Human butcher: polish the face.
- **MUSIC:** new CC0 level + boss tracks per the brief (busy, comic-grotesque: low brass, tuba, pizzicato, kitchen percussion). Current: Fiddles McGinty (CC-BY) / Boss 8 (CC0). Not touched here; the brief's 2-alternatives research belongs to the music lane.
- **SFX hooks** reuse existing sounds; new ones are wanted for: bell ring, gulp, bomb fuse, conveyor hum, griddle flare, plate smash.

## QUESTIONS FOR DANIEL (rec first, then what I built)
1. **Hero spread at 64%: knight 6/12, warden 6/12, pyro 11/12.** The pyro bot is the strongest here, as in both earlier Grubbag tunes. REC: accept it, and give the pyro lab bot a review lane (no fair pyro-only lever on a seated boss). Built: the global tune.
2. **The warden's fights run 169-188 s**, over the 90-150 s target. Knight and pyro are inside it. REC: accept for greybox and re-check after a warden-bot look; shortening it (bigger opening caps) lifts every hero's win rate.
3. **Meat-hook rails:** I made the existing 4 rails chain-driven, one-way hook rides (drawn hooks and carcasses; UP to hold, JUMP to let go) rather than adding new rail geometry. REC: keep. Alternative: a new flat powered rail over a "cutting floor" in the grease kitchens (a reach-model change).
4. **The pepper stove:** the boss's old bellows/oven now makes the next item a RED-HOT CHILLI (a player-made opening), and bombs come by themselves every 4th item. REC: keep, because it ties the level's bellows verb to the fight. Alternative: chillies come by themselves too, and the stove goes.
5. **Heal cap:** 5% a dish, at most 10% per phase and never above the phase's starting hp. REC: keep (~30% at the most over a fight; the bot lets 5-12 dishes through). Built as stated.
6. **The fling is blockable** (a shield turns a plate). Its mark and answer stay "jump". REC: keep; it was the knight/warden's main killer, and a shield reading it is fair.
7. **Shrine before the passage:** the serving passage (the exam) sits between shrine 4 and his hall, so a death re-runs it. REC: keep (it is short and sets him up). Alternative: move shrine 4 to col 389.

## FILES
- Code: src/grubbag.js, src/grubbag-hands.js, src/redraw/grubbag_art.js, src/kitchen-gate.js, src/kitchen-hands.js, src/redraw/kitchen_art.js, src/main.js (attendant hooks, spawnFoe/coin ctx, bestiary), src/marks.js, src/boss-greed.js, src/boss-read.js, src/threat.js, src/audio.js.
- Tools: tools/kitchengate.mjs, tools/kitchengate-probe.mjs, tools/kitchengate-shots.mjs, tools/level-quality.mjs (attendant ranged; kgBelts/kgFlares counted).
- Docs: docs/level1-pilot.json, docs/level1-curve.json, docs/mash-bot.json.
- New filenames: none in src (kitchengate2-*.png only in scratch).
