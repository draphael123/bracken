# claude/chief4: THE GOBLIN CHIEFTAIN, PRESSURE PACKAGE (The Stockade, demo boss)
Brief: the '!! 11-07 08:37 ... CHIEFTAIN PRESSURE package' line in scratch/priority-1016.md (Daniel: "way too easy compared to the other first bosses", LV5 Warden).
Branch **claude/chief4** off claude/stockfloat (d17b8b860, which has the floating-stake art fix). Worktree `bracken-lanes/bracken-chief4`. Not merged, not deployed.
CODE + greybox only. **No browser was opened** (Daniel was playtesting on this PC), so nothing below has been seen on screen. The n=6 tune and the stills are OWED.

## 1. WHAT CHANGED (numbers)
### Shorter openings (about 0.7x across the board)
| opening | before | now | where |
|---|---|---|---|
| slam, PLANTED | 2.6 s (P2 2.2) | **1.8 s (P2 1.5)** | main.js CHIEF_OPEN.slam/slam2 |
| PARRIED (club sweep, sword slash) | 1.6 | **1.1** | CHIEF_OPEN.parry |
| whirl, DIZZY | 2.2 (P2 1.8) | **1.5 (P2 1.25)** | CHIEF_OPEN.dizzy/dizzy2 |
| horn SILENCED | 3.2 | **2.2** | stockade-hands HORN.open |
| keg BLASTED | 2.4 | **1.7** | KEG.open |
| log CRUSHED | 3.4 | **2.4** | CRUSH.open |
| tower wreck | 3.2 | **2.2** | TOWER.wreck |
| **NEW: chain SPENT** | - | **2.2 s (P2 1.9)** | CHIEF_OPEN.chain/chain2 (the longest one, your reward for surviving the chain) |
Unchanged: planted x2, cap 12% a blow / 25% an opening, 0.4x outside openings (boss-greed chipBy), 0.5x on the tower. He is never invulnerable.

### Kegs need a TIMED kick
- A landed keg can only be kicked back in the **last 0.8 s of its fuse** (KEG.ripe). When that window opens it **flashes** (a pulsing white frame and fill), **pings** (SFX.tell) and floats **NOW**.
- Hit it **before the flash** and its fuse snaps to 0.2 s (KEG.early): **TOO SOON: IT BLOWS**, right at your feet, for his keg damage.
- A kicked keg rolls as before (kickMin 0.9 s, 200 px/s). Deck kegs follow the same rule.
- Timeline: thrown with a 2.7 s fuse, 0.85 s in the air, so it sits about 1.05 s before the flash, then has a 0.8 s kick window.
- Hint line changed: 'POWDER: STRIKE IT WHEN IT FLASHES'.

### NEW: a 3-hit chain, slam > sweep > leap-stomp (club stance)
1. **Tell:** his bark, the club raised, **!!** and **THREE BLOWS**. The tell lasts 1.0 s (P2 0.85), a beat longer than his plain overhead at 0.9 s.
2. **Slam:** the normal overhead (34 dmg, unblockable). This time he does not plant: **!** and a sweep wind of 0.32 s (P2 0.26).
3. **Sweep:** 19 dmg, reach 48, blockable. A parry breaks the chain and leaves him PARRIED for 1.1 s.
4. **Leap-stomp:** **!!**, a 0.45 s crouch (P2 0.38), then he leaps at you. On landing: 34 dmg, unblockable, grounded heroes only (jump it), and shockwaves.
5. **SPENT: CUT HIM:** he is planted for 2.2 s (P2 1.9), with x2 damage and the 25% cap.

**Greed:** any blow that lands on him during the chain counts. With 2 or more (CHIEF_CHAIN.greedN), the stomp's reach grows from 26 to 44 px and **GREEDY** floats. A hero who treats the slam as the old PLANTED gets caught by the sweep, and if they keep swinging, by the wider stomp.

**Frequency:** 1 in 6 of his club picks in P1, 2 in 7 in P2 (CHIEF_CHAIN.pool/pool2).

The chain reuses his raise / wind / crouch / leap modes and frames, so tells.mjs and marks.js agree with no new rows and no new art.

### The horn calls a real squad
- **crew = a spear goblin (the Stockade's own `pike`) + an `archer`**, replacing the two 10-hp sprigs. Pike: 20 hp, 20 dmg, guards its front. Archer: 10 hp, 15 dmg.
- Max alive is crewMaxFor(seats): **2 solo, +1 for each co-op seat past the first, capped at 4**. The third is a pike, the fourth an archer.
- **The Chieftain's pike ADVANCES** (stockade-hands hold()): guard up, at 1.6x its speed, until you're within 40 px. Then it thrusts as a pike normally does. Stockade pikes otherwise hold a line.
- **P2 is louder and faster:** draw 2.5 -> **2.2 s**, every 14 -> **12 s**, a roar on top of the horn blast, 6 shake instead of 3, a third ring.
- Unchanged: horn answers horn, your horn pulls them home, crew crushed under a hall pile heal you, and the crew leave when he dies.

### HP and damage, about +20%
- EHP.chief 530 -> **640**.
- DMG body 20 -> **24**, overhead and stomp 28 -> **34**, sweep and slash 16 -> **19**, grab and bash 16 -> **19**.
- His keg 25 -> **30**. This is the new DMG.chiefKeg. DMG.bomb stays 25 for every other barrel.

### Hint card (first-cards)
Added: 'THREE BLOWS: STOP SWINGING. AFTER THE STOMP HE IS SPENT: CUT HIM.' and 'STRIKE HIS KEG ONLY AS IT FLASHES. TWO BLOWS SILENCE HIS HORN.' The card is 10 of 12 lines, widest line 264/266 px. Claims were added in tools/first-cards.mjs.

### Words
'THREE BLOWS', 'GREEDY', 'SPENT: CUT HIM' and 'NOW' were added to MOVE_WORDS. number() drops capitals that aren't registered, so without this they would never be drawn. ('PLANTED', 'DIZZY' and 'STOMP' are old silent flavour and stay as they were.)

## 2. TUNE BY ARITHMETIC (no browser run, so this is a projection)
Assumptions: an L5 Warden blow is about 14 (x2 planted = 28), one swing every ~0.4 s, about 0.3 s to start swinging.

**Openings:**
- Slam: before, about 6 blows hit the 25% cap (132 of 530). Now about 4 blows, roughly 112, which is 17.5% of 640.
- Silenced horn: 7 blows -> 4-5.
- Kills need about 5.5-6 main openings instead of about 4.
- The SPENT opening (about 5 blows, roughly 22%) gives back part of that, but only to a hero who survives the chain.

**Fight length:** wins averaged ~72 s (stockade3-1101). Projected **~95-110 s**, which is closer to B6's ~90 s.

**Damage taken:** about 1.2x per hit, x ~1.4 for the longer exposure, x ~1.1-1.2 for the chain and the squad (a pike that guards and an archer at range instead of one-blow sprigs). That makes **~1.8-2.0x per fight**.

**Projected bot win rate (practiced, flasks, L4):** from ~65% (hookpolish 64%, stockade3 67%) down to **roughly 35-50%, below the band.** It's a projection with wide error. The bot doesn't play the chain or the kick timing; a human reads them.

**I built Daniel's approved numbers as they are.** The n=6 run decides. If it lands under 60%, apply these in order and re-run n=6 after each:
1. EHP.chief 640 -> 590 (one constant).
2. CHIEF_OPEN.slam 1.8 -> 2.0 and CHIEF_OPEN.chain 2.2 -> 2.6.
3. Solo squad of 1: HORN.crewMax 2 -> 1, a pike only.
4. Damage back to +10% (chief 22, over 31, sweep 18, grab 18, keg 28).

## 3. CHECKS
I checked every tool before running it; none of these imports tools/cdp.mjs or puppeteer:
- `node --check` src/main.js, src/stockade-hands.js, tools/chief3.mjs, tools/kite-openings.mjs: OK
- `node tools/demo-cut.mjs`: all green
- `node tools/first-cards.mjs`: ok (11 boss hints, widest 264/266, 10 of 12 lines)
- `node tools/tells.mjs`: every mark agrees with the blow behind it
- `node tools/boss-read.mjs`: ok
- `node tools/stockade-nohorn.mjs`: OK
- hint-shown, **source half only**: I copied it up to its `/* RUNTIME` line (before it imports cdp.mjs) into the scratchpad. Result: "2121 number() literals the filter drops: 1371 routed, 750 old silent flavour (none new)".
- `node tools/foe-cast.mjs`: ran (informational)

Edited but NOT run (they open Chrome):
- **tools/chief3.mjs**: the kick test now waits for the flash (fuse <= KEG.ripe - 0.1). New assert: a keg struck before the flash blows and hurts the hero (`p.early && p.earlyHurt`).
- **tools/kite-openings.mjs**: chief planted designed 2.6 -> 1.8.

**OWED** (browser):
- chief3, stockade2, stockade3, boss-greed (page half), rule-openings, kite-openings, damage-caps, hint-shown runtime, textfit (the new hint line and the card).
- **The n=6 boss-rates tune**: knight/warden/pyro first, practiced, flasks kit, L4.
- The coordinator's nightly full suite.

## 4. OWED STILLS (greybox now)
1. **The chain tell**: raise pose + THREE BLOWS. The chain reuses his raise/slam/wind/sweep/crouch/leap frames. A dedicated "three" windup (club over his shoulder, a stamp) would read better.
2. **The keg flash**: a white pulsing frame around PROP keg, drawn in code (stockade-hands drawKeg). It needs a lit-fuse-at-the-hoops spark frame from the art lane.
3. **The pike advancing**: the pike has no walk cycle (frames: guard 0, thrust 1, tell 2), so it **slides** guard-up. It needs 2 walk frames in the pike sheet.
4. **The squad at the doors**: pike and archer come in with the old dust/door burst.
5. **SPENT**: uses his planted frame.

## 5. QUESTIONS FOR DANIEL (my recommendation first; what I built)
1. **Projection says the bot drops below 60% with every number you approved.** Rec: keep it as built, run n=6, and back off in the order in section 2 (HP first). Built at 640 / +20%.
2. **A keg struck too soon blows on you, not just fizzles.** Rec: keep. That's the "or it blows on you" in your line. Alt: an early strike just does nothing.
3. **The squad is a pike that advances plus an archer, solo 2, +1 per co-op seat.** Rec: keep. Alt: the pike holds the door as a line, which is softer.
4. **The chain is club stance only.** Rec: keep, because slam and sweep are club moves. Alt: a sword version (bash > slash > stomp).
5. **The greed punish is a wider stomp (26 -> 44 px) after 2+ blows in the chain.** Rec: keep. It's told (GREEDY) and you can always jump it. Alt: an extra 4th hit.
