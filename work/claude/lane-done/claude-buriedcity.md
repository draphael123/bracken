# claude/buriedcity - THE BURIED CITY + THE HOURGLASS KING (Opus greybox, resume pass 2026-10-09)

The first run died mid-work on 10-08 after 72c9645a (level, hands, construct, king, wiring, greybox art, synth music, tools/buried-city.mjs 156 checks,
tools/buried-city-route.mjs). This pass pushed that commit, found what was still red, and finished the greybox to today's rules.

## Road order
`needs:` chain: caravan > welltown > underwell > redgorge > glasssea > ksar > **buriedcity** (needs 'ksar'). Past the Goblin Queen, so the draft's
sand-goblin slingers are SAND-FOLK SLINGERS (men; the slinger AI under cnSkin 'sandslinger'). The Sealed Pyramid, when it is built, needs 'buriedcity'.

## What this pass changed
- **The sun was burning the hero all through the city** (the route pilot's "hazard" deaths). src/sunstroke.js reads a 5-row roof and the city's rooms are
  10+ rows tall. Now the sun reaches only L.sun's columns (the dunes, 0-34): `sunAt` / `noSun` in src/buried-city-hands.js. **This is the local sun hook
  for A13**: when claude/ksar2's src/drain.js lands, point the drain at `L.sun` / `BCH.sunAt` (listed in tools/dangling-paths.mjs as on a branch).
- **Level quality (was red on bands, mechanics, secrets, roles), now CLEARS THE BAR and is GATED** (tools/level-quality.mjs GATE):
  - ROTTEN BALCONIES: src/tower-collapse.js crumbles in three places (72, 286, 508). Stand on one and it counts three, gives way, and is back 4 s later. None is the main route's only footing.
  - DRIFTS: src/quicksand.js patches, one-row pits of loose sand in four places (82, 158, 397, 476). They hold you; jump, and keep jumping. A sign at the first drift.
  - Second heights: balconies across the long streets. The multi-height share is now over 40%.
  - Silver: the spire top (6,15) and the dome's lantern (166,19) are off the route, and the vault pays the third. The cornice and tower silvers moved, to keep the cap of 3.
  - The construct is listed as the HEAVY role (it is the level's heavy by design).
  - The crumbles update is hooked into the BCH update in main.js.
- **Elite**: THE THRONE'S WARDEN, an elite construct at 486 holding a gate at 493 on the throne street. It is the exam's peak: the trap hall is behind
  you and checkpoint four comes after. tools/elites.mjs is green: the gate opens onto the route.
- **Architecture**: the laid stone (L.masonry) now starts under the sand roof, column by column, and the roof is the dunes' rock. Sand was added over the throne room's roof.
- **The walker stuck at the lower bulb's floor**: the lower bulb counts full in the reach model (`need`), since the upper bulb's sand is always in it by then. GEAR THREE was
  on that floor, buried for good, so it moved to the upper bulb's floor (the drain leaves it lying there).
- **B15 hole closed**: once an opening's 13% cap was reached, a blow did NOTHING. It now pays at least the brass floor (x0.45).
- **The city is weightier**: foeHit is drowned 3.8, slinger 1.8, scorpion 3.4. foeHp is 2.8, 2.0 and 2.8. The construct has 105 hp and hits 21 (poke) and 25 (sweep).
- **Registered**:
  - tools/check.mjs runs 'buried-city'.
  - tools/one-new-foe.mjs: buriedcity's one new foe is the construct.
  - src/foe-react.js: act 5.
  - tools/boss-rows.mjs.
  - The map node moved to (116,72) with its plate above: tools/map-spacing.mjs failed on the Ksar's plate with the old node.
- **The route pilot** (tools/buried-city-route.mjs) now jumps out of a drift, as the play bot does (src/playtest.js).

## THE HOURGLASS KING (B1-B15)
- **What kind of boss:** a puzzle/construct king. His opening is THE LEVEL'S VERB: pull a throne-room sand-gate while his glass runs low, and he STALLS, OPEN (gold ring + bar). The sand drags him to you, so the opening comes to you (B12).
- **Never a wall (B13/B15):**
  - his brass takes x0.45 outside openings;
  - his told ward takes x0.40;
  - while he turns his glass over, a blow lands whole;
  - the opening pays x2.0 (13% cap, then the floor).
- **Phases:**
  - P2: sand banks at both walls; new move: THE TIME SLIP.
  - P3: his glass cracks (it runs in 8 s); two steady pours; new move: THE HOUR STRIKES.
- **No adds.**
- **Numbers now:** 1750 hp; glass 12 s, low window 48% (5.8 s); the slip told 1.0 s; blows pend 24 / gear 23 / stream 28 / slip 24 / hour 26 / pour 6.

| L36, practiced, 6 seeds | knight | warden | pyro | all |
|---|---|---|---|---|
| WITH FLASKS (human) | 6/6 | 1/6 | 4/6 | **61%** (band 60-70) |
| DRY (human+dry) | 3/6 | 1/6 | 3/6 | 39% |
| MASH (boss) | 0/2 | 0/2 | 0/2 | 0/6 |

**Tuning history (with flasks):**

| Setting | Result |
|---|---|
| The first run's numbers | 33% |
| 1800 hp, blows -18% | 33% (knight and warden 0/4) |
| 1550 hp | 86%, but only 7 valid fights on the loaded machine |
| 1650 hp | 44% |
| + low window 0.48, slip 24 | 76% |
| 1750 hp + slip told 1.0 s | 61% |

The warden's deaths are mostly THE TIME SLIP and the sand stream. In the probe the knight with the old 4.3 s window never reached a lever before the window shut.

## The level, measured
- **Route pilot (no foes, knight):** all 8 legs walked, 0 lifts, 0 deaths. Before the sun fix: 4 legs lifted and 9 deaths.
- **Walker (L36, typical build, human+first, 1 seed each):**
  - knight: 1 death (THE FALL at the trap hall); arrivals 100%.
  - warden: 0 deaths; arrives 93% mean; it was STUCK at the lower bulb before the fix above. This run was not repeated after the fix.
  - pyro: 0 deaths; arrives 98%.
  - **The target (1-2 deaths, arrive under 50%) is MISSED on arrival.** The walker takes 3-4 blows in the whole level and kills 22-27.
- **Level-1 pilot:** 14 hits, 3 deaths over 3 runs (98 lifts: the pilot cannot work the sand-gates). Stamped in docs/level1-pilot.json.
- **Mash LEVEL:** knight, warden and pyro all die (lowest hp 0%). Stamped, LEVEL then BOSS, in docs/mash-bot.json.

## Checks run (all green at the end)
- **Level and boss checks:** buried-city (156), level-quality (gated: CLEARS), elites, architecture, map-spacing, map-grammar, dangling-paths, collectables, keys, deadends, audit, spawns, killzones, signs, floaters, checkpoints, checkpoint-gaps, checkpoint-stand, death-cost, relics, sprinkle-cap.
- **Foe and fight checks:** goblin-lint, one-new-foe, tells, boss-read, boss-greed, boss-music, answer-tags, threat-holes, hint-shown, stuck, rule-openings, corpses, skins.
- **Infrastructure checks:** comments, homepaths, npc-removal, audio-assets, shop-gates, mash-gate, curve-gate.
- **Not run:** the full suite. The machine was out of memory (fork failures, about half the page loads timed out), so every tool was run alone on PORT 8776.

## QUESTIONS FOR DANIEL (each rec is what is built)
1. **Walker arrival is about 95%, not under 50%.** This is the same miss as the Ksar: the L36 walker's skills clear squads before they swing.
   - Rec: judge on deaths and the exam, and leave it to the act-5 level sweep.
   - Alt: double the squads in sections 2 and 4.
2. **The warden wins 1/6 against the king (the knight 6/6).**
   - Rec: keep; the band is met and no hero is at 0.
   - Alt: shorten the slip's reach (slipR 22 to 18) for everyone.
3. **The king's opening is gated by his glass running low.** The low window is a timer, but the opening is something you DO (pull a lever), and he is always hittable (x0.45).
   - Rec: keep. It reads as B14's "the rule makes the opening", not a waiting room.
4. **Drifts and rotten balconies** are the city's sand as platforming, added for the gadget bar.
   - Rec: keep; both are told and drawn.
   - Alt: cut the drifts and accept fewer gadget kinds.
5. **An elite construct holds the throne street** (the concept said no minis; an elite is not a mini).
   - Rec: keep.
6. **MUSIC (list only, nothing downloaded; please re-read each licence on its page):** the level plays its synth bed today.
   - "Loopable Dungeon Ambience" (CC0, opengameart.org/content/loopable-dungeon-ambience). This is my rec, for the buried halls.
   - "Ancient Ruins" by Wolfgang_ (CC-BY 3.0, opengameart.org/content/ancient-ruins).
   - "Desert Loop (Lo-Fi Remaster)" by iamoneabe (CC0). It is a remaster of the Ksar's own track, so it is too close.
   - The king's theme stays composed in code.

## For a read-only reviewer
- The level is src/buried-city.js; the rule is src/buried-city-hands.js; the boss is src/hourglass-king.js plus its hands; the construct is src/construct.js.
- Check the opening's reach for a melee hero: the levers are at the throne room's walls and the king walks to you.
- Check the drift and rotten-balcony placement against A10: no untold death.
- The trap hall is a real death in the exam: is it told enough?
- Identity against Mage's Folly: greybox art only (src/redraw/buried_city_art.js). It still needs a Sonnet art pass and a real track.
- level-quality's crumble places count `x0 / 16` on tile columns (SYSTEM_ARRAYS reads `it.x0 / TS`). That is why the crumbles are spread so far apart: a quirk of the tool, not changed here.

## FIX PASS (2026-10-09, after the BCREVIEW: scratch/review-buriedcity.md)
- **The merge:** origin/master (batch80) was merged by hand. The city and the king sit beside the rootway, minecart, huntmaster and greatdrill rows.
- **The level order:** THE BURIED CITY stays APPENDED after minecart in LEVELS. The merge had put it before rootway, which would have moved two indices.

### M1 - the king's levers, every phase
- **The banks:** `HK_STAGE.banks` changed from [[0,5],[34,39]] to [[0,2],[37,39]].
- **One source:** `hourglass-king-hands.js bank()` now reads `HK_STAGE.banks`.
- **Phase three:** the banks also stand in phase three, for the case where a run of blows takes him past phase two between his moves.
- **New check:** `tools/buried-city-levers.mjs` (a page check, in tools/check.mjs) uses real keys.
  - Knight, warden and pyro each walk eight tiles to each lever and press E while his glass is low.
  - It runs in all three phases, and with the hero held into the wall or the bank.
  - Result: **30/30 stall**.
- **M5:** the throne-room levers GLOW gold while his glass is low and a pull will stall him (`HGK.leversLit`). The nearer lever is ringed, with PULL over it and the guide's arrow on it.

### THE KING RE-MEASURED (WITH FLASKS, profile human, L38, 12 seeds/hero)
With the levers back he was **36/36**. Tuning runs (slipR untouched):

| setting | knight | warden | pyro | all |
|---|---|---|---|---|
| as shipped (1750 hp, cap 0.13) + M1 | 12/12 | 12/12 | 12/12 | 100% |
| 2200 hp, blows x1.25 | 6/12 | 11/12 | 11/12 | 78% |
| pend 34, gear 22, stream 36, 2300 hp | 7/12 | 12/12 | 10/12 | 81% |
| + openCap 0.11 | 4/12 | 12/12 | 10/12 | 72% |
| pend 38, stream 28 | 5/12 | 12/12 | 9/12 | 72% |
| 2400 hp | 5/12 | 11/12 | 10/12 | 72% |
| 2500 hp | 4/12 | 10/12 | 7/12 | 58% |
| 2450 hp | 3/12 | 10/12 | 7/12 | 56% |
| **2425 hp (SHIPPED)** | **2/12** | **11/12** | **9/12** | **61%** |

- **Shipped numbers:** hp 2425, openCap 0.11. Blows: pend 38, gear 22, stream 28, slip 30, hour 33, pour 8.
- **DRY (human+dry, 12 seeds):** 1/12, 6/12, 6/12 = 36%.
- **MASH (boss):** 0/6. He is left at 98% by the knight, 91% by the warden, 88% by the pyro.
- **Why the knight lags:** a per-move ledger (S.hurt) shows the knight takes the GEAR and the SAND STREAM at two to seven times the warden's rate. Both were cut, and the pendulum (taken alike by every hero) was raised. The knight's bot still loses most fights.
- **Noise:** runs at the same seeds swing about 15 points (2400 hp = 72%, 2450 hp = 56%).

### M3 - the trap hall: taught, then lethal
- **The teach:** THE FOUNDRY'S FLOOR-GATE, a new `yard` room.
  - Columns 405-407, lever at 403, sign at 400: "AN OPEN FLOOR-GATE IS A DROP. SHUT IT AND THE SAND BRIDGES IT."
  - Open on a fresh load. The drop is three rows onto the foundry floor. It costs 27% (never the last point) and puts you back on the lip, with a told line.
  - Shut, the sand bridges it.
- **The real hall, open, is drawn as a VOID:** it darkens to black under the lips and sand falls away into it.
  - Lamps stand on its lips at 451 and 466: RED while open, GOLD once shut.
  - Its sign moved from 446 to 450, on the lip side of the lever.
  - It is still a real death in the exam: the knight's walker fell twice.
- **CP3** moved from 410 to 437 (out of the shaft), so a trap-hall death costs the squad, not the shaft ride again.

### M4 - weight
- **New elites:** the constructs at 295 (the halls) and 388 (the quarter, with the drift behind him) are ELITES, joining the one at 486.
- **Found and fixed: the elite construct was never real.**
  - The construct was not in main.js's ELITE table, so `elite: true` stood up a plain construct.
  - The throne's warden at 486 was never an elite in game, and its gate at 493 never shut.
  - Fix: ELITE.construct is now 'THE BRASS WARDEN' (hp x1.4; `mod`, because its moves are src/construct.js), with its own dispatch line.
  - Its affixes are SHIELDED, BURNING and UNSTOPPABLE.
  - Elite lab: mash 0/3, human 4/6. The knight times out on the SHIELDED front with his hero at 72%.
- **Construct numbers:** hp 105 to 160, poke 21 to 28, sweep 25 to 34.
- **Foe weight:** drowned foeHit 3.8 to 4.6, scorpion foeHit 3.4 to 4.2.
- **Cut:**
  - scorpions at 110, 171, 232 and 289;
  - drowned at 284 (your "285"), 400 and 443;
  - slingers at 114 and 196.
- **The construct at 193 is now a drowned.** tools/buried-city.mjs holds any one type to 35%, and with three elite constructs it was at 37%.
- **CP2** moved from 280 to 300.
- **Checkpoint gaps:** checkpoint-gaps is green, and the city is off the A10b report list.

### SMALLER
- **Granary:** the shelf ends at 131 (it dead-ended at 132), and the door is a row taller (133,22). The door glints once the sand is full.
- **Spike cellar:** its stakes are drawn.
- **The quarter's well:** the two-wide gap at 364-365 had nine-row walls, so a fall in was a soft-lock. It now has a beam at 33 and a step at 37.
- **The door construct at 370 is awake.** Wound down, it never woke for a hero standing on the tower over it.
- **The walker's hands** now shut the foundry's floor-gate (walkHint plus a glint).
- **M2 (the open-desert sky) is NOT a one-line switch.**
  - The sky, the clouds and the far/mid dune layers are drawn by main.js's backdrop chain, after BCH.drawBack.
  - `L.dark` brings the whole dark-room lighting with it.
  - Left for the art lane (review section 6, item 1).
- **level-quality crumble units: NOT CHANGED, reported.**
  - The unit table tried was TILE_X0 = crumbles, winds, heaps, pits and carousels, measured on every level's built arrays.
  - `--all` was run before and after (work/claude/buriedcity-fix/lq-before.log and lq-after.log).
  - The table only ever raises place counts, so it makes the check more lenient.
  - It flips witchlight's verdict: its 'mechanics' fail goes away. Mage, oreroad and skyroad counts also rise.
  - Reverted, per the rule.

### THE LEVEL, MEASURED (walker L38, typical build, human+first, 1 seed)

| hero | deaths | arrive % (mean / min) |
|---|---|---|
| knight | 2 (both THE FALL, in the trap hall) | 89 / 56 |
| warden | 0 (after the well fix) | 100 / 77 |
| pyro | 0 | 99 / 96 |

- The elite duels are mostly won at 100% hp: the L38 walker's skills still beat the squads. **Arrival is still over 50%: MISSED.**
- **Pilot (L1 knight, re-stamped):** 9 hits, 3 deaths, 105 lifts.
- **Curve:** a new row is stamped (docs/level1-curve.json).
- **Mash, LEVEL then BOSS:** in the level all three heroes die (lowest hp 0%); the boss is 0/6. Both stamped.

### CHECKS (green)
- **Level checks:** buried-city (164), buried-city-levers (30), level-quality gate (CLEARS), curve-gate, mash-gate, elites (full, with the construct row).
- **Checkpoint checks:** checkpoint-gaps, checkpoints, checkpoint-stand.
- **Placement checks:** signs, killzones, deadends, floaters, collectables, spawns, keys, architecture, sprinkle-cap.
- **Foe checks:** goblin-lint, one-new-foe, tells, answer-tags, threat-holes, skins.
- **Boss and audio checks:** boss-greed, boss-music, boss-read, audio-assets.
- **Infrastructure checks:** hint-shown, death-cost, dangling-paths, comments, homepaths, map-spacing, map-grammar.
- **RED, not this lane:** tools/stuck.mjs runtime fails on THE ROOTWAY (master's level). It failed on two runs, at a different spot each time (rw-larder, then rw-cellar-span): a flake on the loaded machine. Its static half and every bc- spot are green.
- **Not run:** the full suite. The machine is out of memory, and another suite was running.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **The knight wins the king 2/12 with flasks; the warden 11/12.** It is in band at 61%, with no hero at 0.
   - Rec: keep it, and give the bot lane the per-move ledger (the knight's bot eats the gear and the stream).
   - Alt: slow the gear (gearV 165 to 140) and widen the stream's tell for everyone, then retune hp up.
2. **Dry, the king is 36%.**
   - Rec: keep it. The flask band (B6 amended) is the target.
3. **The walker still arrives at 77-100%.**
   - Rec: leave the rest to the act-5 sweep. The exam elites now exist, but the L38 skills kill them in 4-10 s.
   - Alt: elite hp x2. The elite lab's knight already times out at x2.
4. **The cut list.** There is no drowned at 285: I cut the one at 284. I also cut the reviewer's scorpion at 289 and drowned at 400 (the reviewer's plan).
   - Rec: keep.
5. **The crumble unit fix flips witchlight's verdict** (more lenient), so it is not applied.
   - Rec: the tool lane applies it, together with a look at witchlight.
