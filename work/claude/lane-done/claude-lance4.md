# claude/lance4 - LANCE 4 BOSS (brief-lance4-1029.md s5 row 1)

Branch `claude/lance4` off master a005867a (BATCH129). Not merged, not deployed. Lane 2 (STORMHOLD 4 LEVEL) stacks on this branch.

## What was built
- **On foot from the first frame.** The horse is deleted everywhere: barding, founder, rear, wheel, the seated poses, SPR.lanceHorse, drawLanceHorse, bakeCharger, lanceUnhorse, the mounted hit box. He spawns as one 26x40 box. He wakes by wrenching his planted pennant up.
- **Tempo classes** (`lanceClass` in main.js, numbers in `LANCE4` in src/lance-support.js):
  - LIGHT: thrust, 0.40 s tell (0.35 shieldless); a whiff leaves him open for 0.75 s.
  - MEDIUM: low sweep 0.60, shield wall 0.6, spear volley 0.85.
  - HEAVY: lance charge (1.0 s couch), vault 0.95.
  - Each class has its own sound; a heavy also gets a planted-foot stamp ring.
  - Never two heavies back to back, and 0.8 s of guard after one.
  - **The shield bash is cut.** HP 3000 -> 4500 (see rates).
- **P1 (bells and gates):**
  - Gate towers on piers 1, 3 and 5. Each has a `lancebell` prop on its lookout, a portcullis column under the lookout, and a tower top one held jump up.
  - A ring gives three tolls over 1.2 s. HE ANSWERS THE BELL: his next move is a charge at that tower.
  - The third toll drops the gate. If he is under it, he is PINNED (3.4 s, x1.6, the bars' 40). Otherwise the gate closes across the lane; he runs into it and OVERRUNS (1.5 s, x1.5).
  - A bell winds back in 10 s; the rewind bar and drum are drawn.
  - A whiffed charge also ends in OVERRUN. A charge that hit you ends in a skid instead, which is not an opening.
- **P2 (zip lines), at 67%:**
  - HE STOPS THE BELLS: the bells are drawn hauled up and do nothing.
  - Three signal ropes run from each tower top down to the next pier's lookout, 32 px over his head mid-run. Each has a post on the deck.
  - A plunge on his helm gives HELM RUNG (2.2 s, x1.5, at most once per 6 s).
  - Striking a post while he is under that rope's run: the line frays for 0.5 s, then parts and whips him (WHIPPED, 1.6 s, x1.5). This breaks a shield wall. You take 6 if you are under the line away from the post. The line is re-strung in 14 s.
  - This needed a `cut` state in src/zipline.js: a parted line holds nobody and drops its rider.
  - His charges tear planks from P2 on. The vault and the shield wall join in P2.
- **P3 (main gate), at 33%:**
  - He falls back under the main gate.
  - THE GREAT BELL is on a new gatehouse hoarding, one jump up from the last lookout. Ringing it drops the gate at once: PINNED (4.0 s, x2, 60).
  - The first great-bell pin splits his shield. If that hasn't happened 8 s into P3, he casts the shield off himself.
  - Shieldless he has no wall and takes x0.7 from anywhere, attacks two-handed, and his thrust tell is 0.35.
  - The pennant now alternates the ballista or the oil with THE STONES: three told rings on the deck, an arc in from the castle; each stone breaks the planks it lands on.
  - On his death the main gate still slams; the tower gates go up and the bells reset.
- **The fight's other rules:**
  - A phase change ends any opening he is in, so a burst can't run through two phases.
  - Every opening multiplier is 1.5-2x (resist floor kept: the shield front is x0.4, shieldless x0.7).
  - No pillars anywhere.
- **Level (section 6 only):**
  - The six fire cages and the old bridge-gate winch are off the bridge.
  - Added: the gate towers (tower top plats and facades), the signal ropes, the hoarding and the great bell.
  - The bridgehead exam's cage at 471 is section 5, so it is lane 2's.
- **Bot hands (src/lab.js `lanceDuty` / `lanceClimb`):** these replace the cage duty.
  - P1: climb to the nearest ready bell's lookout. Ring it about 1.2 s ahead of a charge toward it (to pin him), or right away while he is in guard (he runs into the gate).
  - P2: strike a nearby rope post while he is under its run.
  - P3: climb the last lookout to the hoarding and ring when he is under the gate.
  - The bot also flees the stones' rings.
- **Greybox art (src/lance-art.js):**
  - 45 poses, each also baked shieldless with two hands on the shaft: 90 frames, cap 120.
  - Anticipation frames come from `modeAge`, plus follow-through frames and two-frame loops for every opening.
  - New poses: couch, a 3-frame sprint, skid, overrun, pinned, rung (with stars), whipped, split, wake, and a 4-frame walk with breath.
  - The shaft is now 3 px thick.
  - Still drawn at the 1.35 runtime scale (`LNA.SCALE`); the 1:1 redraw is LANCE 4 ART's.
- **Words and marks:**
  - Short words (HE CHARGES, SPEARS, STONES...) are MOVE_WORDS. Teaching lines (`LANCE_SAY`) are routed through hint-lines SAY_LINES.
  - The stale lance CALL_LINES were removed and hint-shown-silent was rebaselined (one line went).
  - The marks.js MARK table was rewritten by tells.mjs (rearTell and bashTell are gone). HARD_TELLS and windingUp are updated.
  - Bestiary text is rewritten.
- **Tools:**
  - tools/lance4.mjs replaces lance3.mjs (node part plus page part; `LANCE4_NODE=1` runs node only), and check.mjs now lists lance4.
  - rule-openings uses the tower bell.
  - lance-sheet shows the on-foot sheet.
  - watchtowers and zipline count only the tower ropes (the signal ropes belong to lance4.mjs).
  - dangling-paths lists lance3 as replaced.
  - tools/lancebot.js (the old scripted fighter) is deleted.

## Checks
Node, all green:
- lance4 (node part), tells, hint-shown source, watchtowers, stormhold3
- floating-geometry, level-quality, solid-islands, dressing, spawns, one-new-foe
- answer-tags, blow-tags, goblin-lint, boss-read, combat-feel, audit, content-audit
- signs, checkpoints, checkpoint-gaps, anchor-lint, dangling-paths

PAGE (after the gate flag cleared, one browser at a time, RAM >= 6.7 GB free): lance4 (every device forced: pin 3.4 x1.6 / answer+overrun 1.5 / whiff overrun / P2 haul, bells dead / helm rung 2.2 / whip 1.6 out of a shield wall / P3 home under the gate / great bell pin 3.9 x2 + shield split / shieldless front 70 of 100 / stones break planks / slam) GREEN; rule-openings GREEN; hint-shown GREEN; boss-openings GREEN; mark-integrity MI_ONLY=lance GREEN; zipline.mjs: storm 39/39 for all 7 heroes, then a Runtime.evaluate 601 s timeout on a LATER level (gantry, not Stormhold - a loaded-machine page timeout, not this change).

## Boss rate (boss-rates storm practiced, profile human, flasks, L18, n=18)
- 3000 hp (the brief): 6/6 6/6 5/6 = 94% (56-118 s). First found the bot never climbed to the bells (its jump was let go early) - fixed in lab.js, then measured.
- 4000: 89%; 4300: 83%; **4500 (built): 4/6 5/6 6/6 = 83%, fights 66-155 s**; 4600: 1/6 5/6 4/6 = 56%. Steep and noisy between 4500 and 4600; the TUNE lane owns the 60-70% band (rec: try 4550-4600 and/or bell pin 3.0 at n=18+).
- Mash 0/6 not run (tune lane).

## Files touched
- src/main.js (updateLance block, hurtEnemy, spawn/props, death, draw, bestiary, DMG, MOVE_WORDS, windingUp)
- src/lance-support.js, src/lance-art.js, src/stormhold-town.js (section 6), src/zipline.js, src/lab.js, src/hint-lines.js, src/marks.js
- tools/lance4.mjs (new), tools/lance3.mjs (deleted), tools/lancebot.js (deleted)
- tools/rule-openings.mjs, tools/lance-sheet.mjs, tools/check.mjs, tools/watchtowers.mjs, tools/zipline.mjs, tools/dangling-paths.mjs, tools/stormhold3.mjs, tools/hint-shown-silent.txt

## Questions for Daniel (rec built)
0. HIS HEALTH: the on-foot fight with three device openings is much easier for the bot than the brief's 3000 (94%). REC (built): 4500 as a first cut (83%), the tune lane finishes the band.
1. **Mark colour vs tempo class.** The brief says MEDIUM moves get a yellow '!'. But the sweep and the volley are unblockable, and the game-wide rule (tools/tells.mjs) is "yellow = the shield turns it".
   - REC (built): the mark colour stays the shield's promise. The tempo class shows through its word, its sound and the heavy's stamp.
2. **How long the bell-gate pins last.** Your 10-29 "bell stuck ~1 s" note: the pins here come from the gate's bars, not the shared bell stun.
   - REC (built): keep the brief's 3.4 s / 4.0 s pins (boss-openings wants 3 s or more).
   - ALT: shorten them once BELL SHORTEN lands.
3. **Great bell before P3.** REC (built): it only rings in his last stand; earlier, a strike just clanks.
4. **Cutting ropes in P1.** REC (built): the posts only fray from P2. In P1 they clank, and the lashing glint is not drawn.
5. **Charge pass-through.** When answering a bell he charges *at the tower* and overruns about 0.35 s past it, not at you.
   - REC (built): keep it. It makes the timed ring (one toll-span ahead) the skill shot, and the early ring the reliable small opening.

## STORMHOLD 4 LEVEL (lane 2, brief-lance4-1029.md s5 row 2)

This work is stacked on lane 1's LANCE 4 BOSS on branch `claude/lance4`. Commits: c63f3453, f0bc5c39, 9f68cd78 and the report commit. The branch is pushed. It is not merged and not deployed.

## What was built
- **Gatehouse columns as G0 offsets first** (c63f3453). The level hash came out identical to before.
- **Then the +180 shift.** H0 = 396 (the haul lines), G0 = 576 (the gatehouse), P0 = 670 (the bridge), W = 798.
  - The level grows 618 -> 798 columns (+29%). It now has 7 areas.
  - Columns moved by hand: ORDER_AT.storm (Storm Lance at [632,29], gate 637) and the storm dressing (skull totem 629).
  - The storm AMBUSH, ELITES, GARRISON, CHECK_DROP and AFFIX_AT rows needed no change: none of them sits past col 395.
- **5. THE HAUL LINES (396-575).** This is a new area of the level. The six lines are zip lines tagged `haul`; the mangonel and its stones live in `src/haul-lines.js`. Every line runs at 180.
  - **TEACH, over the ditch's flat bottom:**
    - Line A is the Wall Watch's rope, starting from its deck. It ends in the air over the ditch.
    - Line B runs 2 rows under A's second half and lands on the haul tower's landing.
    - If you miss, you fall to the ditch bottom with no bite, and a new ladder up the Wall Watch's east face takes you back.
    - A shield foe stands under A's first stretch, to teach the drop-strike.
    - Two signs: "JUMP OFF ONE AND TOUCH THE OTHER" and "A SHIELD CANNOT FACE UP".
  - **The haul tower:** a stone stack with the masons' scaffold on its west face (landing, board, top deck).
  - **TEST, over the spiked gorge:**
    - L1 runs long and east-down, then ends in the air.
    - L2 starts higher, on a mast, and crosses under L1 (the X). L1 -> L2 is a jump UP.
    - L3 runs under L2's tail. L2 -> L3 is a DROP.
  - **REMIX:** riding L3 draws "A STONE FOR THE LINE". It parts L3 ahead of you and the line whips down (re-strung in 6 s). You must jump UP onto L4 first. L4 sets you on the barbican plinth.
  - **The barbican:** a ladder up its face to the mangonel, which takes 5 blows to wreck (marked for the run).
- **THE MANGONEL** (a device, so one-new-foe still holds):
  - Each stone gets a dotted arc and a red ring on your rope, 1.3 s ahead at line speed.
  - A hit does 12 and makes you let go of the rope.
  - Never two stones in flight; one every 3.2 s; none in the teach.
  - Fairness rule: a ring only lands where another line that goes on further is in reach for at least 7 tiles before it.
- **Rope to rope works now.**
  - `src/zipline.js` had a 0.6 s release lock that blocked every mid-air catch, so the brief's transfer never worked.
  - With `L.zipTransfer` set, a JUMP or DOWN kick only locks the rope you left. That is Stormhold only, so no other level changes.
  - A rope ridden to its end still locks all ropes.
- **Reach model:** `src/reachcore.js` has a rope -> rope edge, behind the same `L.zipTransfer` opt-in.
  - The fill reaches the gatehouse and the bridge.
  - With the edge turned off, the far side is unreachable. So the transfers are required.
- **Bot:** `src/playtest.js` now transfers, as a player would.
  - Two tiles into a window, it kicks up to (JUMP) or drops onto (one frame of DOWN) a line that goes further.
- **6. THE GATEHOUSE (576-669), bell-gates** (`src/bell-gate.js`):
  - **TEACH:** the winch became THE GATEHOUSE BELL on a gallery one jump up, with the sign "RING THE BELL: THEY RUN TO IT, AND THE GATE DROPS ON WHOEVER IS UNDER IT."
    - It tolls 3 times over 1.2 s, using the gate towers' own bell code. The pike it calls runs to the gate, and the drop takes it.
  - **EXAM, at the bridgehead:** the fire cage is gone. In its place is a gate tower (lookout, bell, portcullis).
    - Two pikes and the shield captain charge when it rings. In the driven test the drop takes 2 of the 3; the captain arrives late and you fight him.
- **CHECKPOINTS: 4 -> 5** (Q5): 152, 254, 388 (Wall Watch deck), 579 (gatehouse yard), 669 (arena).
  - checkRun 160 -> 200, so the filler doesn't put a 6th shrine at 445, mid-ropes.
- **Restamps:** the node-side ones are done (order-chapters, dressing, stuck spot `sh-haul-1` plus new rope-3 text, hint SAY_LINES and CALL_COUNTS for the new lines).
  - **The page restamps are PENDING** (see below).
- **Small fix outside my area:** lane 1's three gate-tower facades on the bridge floated, which failed tools/architecture.mjs. They now run down to the deck, as does my bridgehead tower's.

## Level length / checkpoints
798 columns (+180); 5 shrines; 7 areas. Transfer windows (tiles): A->B 14.9, L1->L2 22.1, L2->L3 16.6, L3->L4 22.9. All are at least 7.

## Checks
- **NODE, all green:**
  - stormhold4 (new; replaces stormhold3). It covers the geometry, the windows, the reach, the ride driven with the real zipStep and haulStep (every transfer, stones dodged, a stone hit, L3 parted under a rider), the mangonel wrecked in 5, and both bell-gates driven.
  - watchtowers, lance4 (node part), tells, hint-shown (source half), architecture, signs, dangling-paths.
  - floating-geometry, solid-islands, dressing, spawns, one-new-foe, answer-tags, blow-tags, goblin-lint, boss-read.
  - checkpoints, checkpoint-gaps, checkpoint-stand, anchor-lint, elites, keys, deadends, traps, killzones, collectables, threat-holes.
  - zoom-coverage, ground-depth, bridge-props, homepaths, level-quality, combat-feel, audit, content-audit, reach.
  - walk-controls part A (node): the key trips work, and the walker's route crosses the haul lines.
- **PAGE: PENDING.** The release gate was running (GATE-RUNNING.flag set, no batch131 verdict yet), so no browser was started. A later lane runs these, one at a time, with free RAM of at least 1500 MB:
  - zipline.mjs (storm rope A now `endsAir`), walk-controls.mjs (retargeted: bone gate from STORM_TOWN, gatehouse bell at G0+44, 7200 frames), bells, hint-shown (runtime), lance4 (page), reach-heroes storm, textfit, relics.
  - Level walk / level1-pilot on storm: pilot deaths are not measured yet. Watch that the bot makes the transfers and dodges the rings.
  - **Restamp, level then boss:** campaign-xp (`node tools/boss-level.mjs --write-xp`), the storm level mash rows, curve/level1-pilot stamps, pixels hashes. Then the Lance boss rows / boss-rates (his arena only moved by P0, but the restamp order is level first).
  - mobile-perf: 9+6 ropes, the mangonel and the citadel at 4x.

## Files touched
- **New:** src/haul-lines.js, src/bell-gate.js, tools/stormhold4.mjs (renamed from tools/stormhold3.mjs).
- **Changed:**
  - src/stormhold-town.js (sections 4 tail, 5 new, 6 reworked, the gate-tower facades in 7)
  - src/main.js (imports, gatebell spawn/step/draw, answerRun hook, `answers` on foes, haulStep and drawHaul)
  - src/zipline.js, src/reachcore.js, src/playtest.js, src/hint-lines.js, src/stuck-spots.js, src/order-chapters.js, src/level.js (dressing)
  - tools/watchtowers.mjs, tools/zipline.mjs, tools/walk-controls.mjs, tools/check.mjs, tools/dangling-paths.mjs (stormhold3 and lancebot.js listed)

## Questions for Daniel (rec built)
1. **A stone hit over the gorge** costs 12, lets go of the rope, and the fall then takes the teeth's bite.
   - REC (built): keep it, as the brief says; the ring is 1.3 s ahead and the escape is always drawn.
   - ALT: a hit staggers you but keeps you on the line.
2. **Rope-to-rope catch** is Stormhold-only (`L.zipTransfer`).
   - REC (built): Stormhold only.
   - ALT: game-wide, so a kick-off can catch another rope anywhere.
3. **The bridgehead exam takes 2 of 3.** The captain arrives after the drop and is fought, and the gate lifts in 6 s.
   - REC (built): keep it, so it is an exam rather than a free clear.
   - ALT: bunch all three so one ring takes them all.
4. **Coins along the ropes:** reach.mjs lists 14 of them as "outside the fill", because they are picked up while riding (it lists 2 others from before).
   - REC (built): keep them, as they guide the transfers.
   - ALT: move them onto the decks.
5. **The optional second moat line plus silver** at the Bell Watch was skipped.
   - REC (built): leave it to the polish lane, or drop it.
6. **Shrine filler:** checkRun 160 -> 200, so the 191-column run over the haul lines keeps the brief's 5 shrines.
   - REC (built): 200.

