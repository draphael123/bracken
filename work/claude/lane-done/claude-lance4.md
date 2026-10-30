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
  - **The shield bash is cut.**
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

PAGE: see "Page results" below.

## Files touched
- src/main.js (updateLance block, hurtEnemy, spawn/props, death, draw, bestiary, DMG, MOVE_WORDS, windingUp)
- src/lance-support.js, src/lance-art.js, src/stormhold-town.js (section 6), src/zipline.js, src/lab.js, src/hint-lines.js, src/marks.js
- tools/lance4.mjs (new), tools/lance3.mjs (deleted), tools/lancebot.js (deleted)
- tools/rule-openings.mjs, tools/lance-sheet.mjs, tools/check.mjs, tools/watchtowers.mjs, tools/zipline.mjs, tools/dangling-paths.mjs, tools/stormhold3.mjs, tools/hint-shown-silent.txt

## Questions for Daniel (rec built)
1. **Mark colour vs tempo class.** The brief says MEDIUM moves get a yellow '!'. But the sweep and the volley are unblockable, and the game-wide rule (tools/tells.mjs) is "yellow = the shield turns it".
   - REC (built): the mark colour stays the shield's promise. The tempo class shows through its word, its sound and the heavy's stamp.
2. **How long the bell-gate pins last.** Your 10-29 "bell stuck ~1 s" note: the pins here come from the gate's bars, not the shared bell stun.
   - REC (built): keep the brief's 3.4 s / 4.0 s pins (boss-openings wants 3 s or more).
   - ALT: shorten them once BELL SHORTEN lands.
3. **Great bell before P3.** REC (built): it only rings in his last stand; earlier, a strike just clanks.
4. **Cutting ropes in P1.** REC (built): the posts only fray from P2. In P1 they clank, and the lashing glint is not drawn.
5. **Charge pass-through.** When answering a bell he charges *at the tower* and overruns about 0.35 s past it, not at you.
   - REC (built): keep it. It makes the timed ring (one toll-span ahead) the skill shot, and the early ring the reliable small opening.
