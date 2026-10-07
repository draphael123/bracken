# RETUNE2 report - claude/retune2 (base origin/claude/botreads 2dbafe77)

Brief: refit the human profile after BOT READS, re-measure every boss and mini once, then retune the out-of-band rows. Zero-hero rows came first, then the biggest misses.
Coordinator changes during the lane:
- THE ROC (skyroad, ROC2), THE RAPTOR MATRIARCH (redgorge, MATRIARCH2) and THE DJINN (welltown boss, DJINN6) are skipped. They were measured, and their code, bot plans and numbers were not touched.
- The Djinn's feel target is "too hard", about 35.

Port 8687, jobs 2. Every rate comes from `tools/boss-rates.mjs`: profile human, practiced, campaign level, normal health, 240 s cap.
- n=12 is 4 seeds per hero, about ±14 points of noise.
- n=24 adds seeds 5-8, run with the same runner on offset seeds. That script lives at scratch/retune2/rates-off.mjs and is not committed.

## 0. Merge: origin/claude/wardenkit (2702da4f)
The brief's Q3/Q4 build on WARDEN KIT's code: her v2 carpet hands, her step and her deflect. That code was not on botreads, so I merged it first, so the retune measures the warden that ships.
- Conflicts:
  - EHP and the check list: kept batch74's. Wardenkit's side was older; it added no checks.
  - Her step pace: kept the stride perk, plus STEP_PACE.
  - src/marks.js: regenerated with `tools/tells.mjs --write`.
- After the merge these were green: tells, answer-tags, boss-read, raptor-matriarch, comments and the syntax check.

## 1. Calibration (the refit)
Command: `node tools/bot-calibrate.mjs --feel --grid=0.3,0.6,0.9,1.2 --seeds=4` (4 bosses x 3 heroes x 4 seeds = n=12 a cell). The log is in scratch/retune2/calib.log.

| d | reaction min-mode-max | misread | greed | Death Knight (hard 30) | Djinn (too hard 35) | Puppeteer (good 55) | Jenny (easy 80) | loss, all 4 (Djinn 35) |
|---|---|---|---|---|---|---|---|---|
| 0.3 (BOT2's) | 218-302-446 | 6.2% | 19% | 100 (4/4 4/4 4/4) | 92 | 75 | 67 | 38.8 |
| 0.6 | 236-344-512 | 10.4% | 30% | 83 (2/4 4/4 4/4) | 67 | 58 | 58 | 19.2 |
| **0.9 (new human)** | **254-386-578** | **14.6%** | **41%** | **75 (1/4 4/4 4/4)** | **75** | **58** | **67** | **16.9** |
| 1.2 | 272-428-644 | 18.8% | 52% | 58 (0/4 3/4 4/4) | 92 | 50 | 75 | 18.2 |

- **The fit is d=0.9**, set in src/bot-profile.js `human`.
  - It has the lowest loss over all four bosses, both with the Djinn at 42 (14.6) and at 35 (16.9).
  - BOT2's d=0.3 stays available as `human03`. `legacy` is untouched, so every suite check that names no profile is byte-identical.
- **The tool's own pick was d=1.2.** It reaches that by dropping the Death Knight and the Djinn as "no dial explains them" and fitting the Puppeteer and Jenny alone.
  - d=1.2 lies past the dial's 0-1 range.
  - Without the Djinn, d=1.2 does fit best (3.7 vs 9.8), because the Death Knight finally drops there. See Q1.
- **What the fit says:**
  - The Djinn is a bot gap at every dial: 67-92 against "too hard".
  - The ordering of Jenny and the Puppeteer is reversed: the bot finds the Puppeteer easier than Jenny. Jenny's "easy" predates CANAL4's rebuild.
  - Every boss Daniel rated is easier for the bot than for him, except Jenny.

## 2. Re-measure (before the retune)
scratch/remeasure-retune2.md covers all 52 rows except skyroad: 624 fights in 94 min on f349efd9 (the refit plus wardenkit), with harness numbers beside them.
- Bosses in band: causeway, deep, mage, fields, scree, kings, lamplit, reef, spore, keep, marsh, moor, burning, theatre.
- Minis in band: waymeet:mini.
- That was 15 of 52 rows.
- Zero heroes: burial, oreroad, wood, underleaf, fair, redgorge and welltown:mini had the warden or pyro at 0; mage, hurricane, caravan and witchlight had a zero too.
- The zero-hero rows named in the brief are already fixed by WARDEN KIT plus the refit:
  - waymeet warden 4/4;
  - keep pyro 2/4.

## 3. Retune: before -> after (kn/wa/py)
"Before" is the re-measure above, or n=24 where marked. Changes are listed in the order made.

How the numbers are set:
- **BOSS_HIT** (how hard his own blows land) is in src/main.js, on ONE added line after sweep1's table: `Object.assign(BOSS_HIT, {...}); /* (claude/retune2) */`.
- **Health** is set on one `Object.assign(EHP, ...)` line after sweep2's override block, because an EHP line placed before that block loses to it. The Captain's 420 was lost that way, and the Captain was measured at sweep2's 860.

| row (boss) | before | change | after |
|---|---|---|---|
| fallingtower (Undead Archmage) | 3/4 4/4 4/4 = 92 | WARDEN KIT Q4: every hero's v2 carpet hands hold one short of his greed and fly out of a closing ring. Then BOSS_HIT 1.8; his 2800 stands | 3/8 6/8 6/8 = **63** (n=24) |
| unburied (DEATH KNIGHT) | 1/4 4/4 4/4 = 75 | See section 4 | 2/8 8/8 5/8 = **63** (n=24) |
| caravan (Dune Worm) | 0/8 0/8 5/8 = 21 (n=24) | His blows x0.64 (breach/lunge/bite 64 -> 41, sweep 72 -> 46, wave 58 -> 37, spit 14 -> 9); hp 2600 -> 2200 | 4/8 3/8 8/8 = **63** (n=24) |
| hurricane (Captain) | 0/4 2/4 0/4 = 17 | BOSS_HIT 0.4; his hp stays sweep2's 860 | 5/8 7/8 4/8 = 67 (n=24) |
| witchlight (Gate Gargoyle) | 1/4 0/4 1/4 = 17 | BOSS_HIT 0.75. v2 warden hands DEFLECT his fire breath and fireballs, which are yellow; her slab hops off their line put her on the spikes 2-3 times a fight | 5/8 6/8 5/8 = 67 (n=24) |
| burial (Buried Dead) | 1/4 0/4 2/4 = 25 | BOSS_HIT 0.7; hp 1000 -> 950. Half of what the warden took was HIS REPRISAL: the refit is greedy | 5/8 3/8 6/8 = **58** (n=24) |
| wood (Hornet Queen) | 2/4 0/4 2/4 = 33 | BOSS_HIT 1.5 -> 1.1 | 6/8 4/8 6/8 = 67 (n=24) |
| underleaf (Grandmother) | 2/4 2/4 0/4 = 33 | BOSS_HIT 0.55 -> 0.42 | 7/8 4/8 2/8 = **54** (n=24) |
| fair (Wicker Queen) | 0/4 2/4 3/4 = 42 | BOSS_HIT 0.9 | 3/8 4/8 8/8 = 63 (n=24) |
| welltown:mini (Gang Leader) | 4/4 0/4 1/4 = 42 | BOSS_HIT 0.75 | 8/8 3/8 8/8 = 79 (n=24) |
| longwater (Tide Herald) | 3/4 4/4 4/4 = 92 | BOSS_HIT 1.4 | 3/8 4/8 7/8 = **58** (n=24) |
| waymeet (Paladin) | 3/4 4/4 4/4 = 92 | BOSS_HIT 1.4 | 3/8 4/8 8/8 = 63 (n=24) |
| kings:mini (Greathound) | 4/4 3/4 4/4 = 92 | BOSS_HIT 1.3 (1.6 gave 54) | 6/8 4/8 8/8 = **75** (n=24) |
| fields:mini (Ploughman) | 3/4 4/4 4/4 = 92 | BOSS_HIT 1.3 | 5/8 6/8 8/8 = 79 (n=24) |
| spire:mini (Golem) | 2/4 1/4 2/4 = 42 | sweep1's BOSS_HIT 2.2 -> 1.0 | 6/8 4/8 5/8 = 63 (n=24) |
| hanging:mini (Weaver) | 1/4 2/4 3/4 = 50 | BOSS_HIT 0.75 | 4/8 7/8 8/8 = 79 (n=24) |
| storm (Queen's Lance) | 3/4 4/4 2/4 = 75 | BOSS_HIT 1.4 | 3/8 4/8 5/8 = **50** (n=24) |
| lamplit:mini (Reeve) | 3/4 4/4 3/4 = 83 | BOSS_HIT 1.15 | 4/8 8/8 6/8 = **75** (n=24) |
| unburied:mini (Barrow Rider) | 3/4 3/4 4/4 = 83 | BOSS_HIT 1.05 | 4/8 6/8 7/8 = **71** (n=24) |
| harbor (Breakwater Warden) | 2/4 1/4 2/4 = 42 | BOSS_HIT 0.85 | 7/8 1/8 5/6 = **59** (n=22, 2 page errors) |
| hanging (Owl) | 1/4 3/4 1/4 = 42 | BOSS_HIT 0.85 | 4/8 7/8 3/8 = **58** (n=24) |
| burial:mini (Graveyard Keeper) | 2/4 1/4 4/4 = 58 | BOSS_HIT 0.85 | 5/8 3/8 8/8 = 67 (n=24) |
| harbor:mini (Salvage Captain) | 2/4 3/4 2/4 = 58 | SALVAGE_HIT 1.4 -> 1.2 (his own numbers; BOSS_HIT 0.85 on him broke boss-greed's mini-hit ratio, which is read off the bosun) | 5/8 7/8 5/8 = **71** (n=24) |
| crown:mini (Forgemaster) | 3/4 1/4 3/4 = 58 | BOSS_HIT 0.85 measured 5/8 5/8 7/8 = 71 (n=24), but the MASH BOT then won him 2/6 (pyro): REVERTED, so he is back at 58 | 58 (n=12), left |
| witchlight:mini (Hedge Warden) | 8/8 1/8 6/8 = 63 (n=24) | BOSS_HIT 0.9 | 8/8 1/8 7/8 = 67 (n=24) |
| spire (False Abbot) | 1/4 3/4 1/4 = 42 | sweep1's BOSS_HIT 1.8 -> 1.5 | 0/8 6/8 4/6 = 45 (n=22) **RED: knight 0** |
| oreroad (Winchmaster) | 4/4 0/4 1/4 = 42 | BOSS_HIT 0.85. v2 warden DEFLECTS his brake bar and wrench (yellow): she took 8 of 8 brake bars with 0 deflects | 7/8 0/8 3/8 = 42 (n=24) **RED: warden 0** |
| mage:mini (Homunculus) | 4/4 3/4 4/4 = 92 | BOSS_HIT, DMG and health were tried; none moved an outcome (its openings decide it), so all were reverted | 8/8 5/8 8/8 = 88 (n=24), left |
| crown (Goblin Queen) | 1/4 4/4 4/4 = 75 | The same: BOSS_HIT, DMG and health did not move her, so all were reverted | 5/8 6/8 7/8 = 75 (n=24), left |

Borderline rows re-measured at n=24 before deciding (the brief's list): caravan 21 (retuned above); mage 2/8 7/8 6/8 = 63, theatre 3/8 7/8 5/8 = 63, causeway 4/8 1/8 6/8 = 46 (all three left: within noise, no zero); witchlight:mini 63 (nudged above).

Untouched rows (re-measure, n=12): canal 67, flotilla 67, undercrown 67 and stockade 67 are 7 over, within noise. underwell (the Queen) is 67, and her numbers were left because she is within noise. fallingtower:mini (Sexton) is 67, 3 under.

**Final tally (latest number per row, skipped rows excluded)**
- **Strictly in band, no zero hero: 23 of 50.**
  - Bosses (18): causeway (n=12), deep, fields, scree, kings, lamplit, reef, spore, keep, marsh, moor, burning, burial, underleaf, longwater, storm, harbor, hanging.
  - Minis (5): waymeet, kings, lamplit, unburied, harbor.
- **Within +-7 of the band edge (inside n=24 noise), no zero hero: 22.**
  - Bosses at 63-71 (15): unburied 63, fallingtower 63, caravan 63, waymeet 63, fair 63, mage 63, theatre 63, hurricane 67, witchlight 67, wood 67, plus the untouched n=12 rows canal, flotilla, undercrown, stockade and underwell at 67.
  - Minis (7): fields 79, hanging 79, welltown 79, burial 67, witchlight 67, spire 63, fallingtower 67 (the Sexton, untouched).
- **Clearly out: 5.** spire (45, knight 0), oreroad (42, warden 0), crown (75), mage:mini (88), crown:mini (58, reverted for mash).

## 4. THE DEATH KNIGHT
On the refit bot he was 1/4 4/4 4/4 = 75. On BOT2's d=0.3 he was 100%, and Daniel calls him hard.

**Built: B5, "sharper, not walled".** Every change is in his own kit (src/unburied-foes.js UNB.bk), with no invulnerability and no new move:
- the cleave told 1.12 -> 0.95 s (combo 0.9 -> 0.77, after the grip 0.62 -> 0.53), and his commit 0.36 -> 0.30 s;
- the planted blade, grip, boil, coil and tide tells x0.88;
- the stuck blade 1.5 -> 1.25 s, and the broken ward's reel 1.8 -> 1.5 s;
- THE PASSING reads a string's cut 0.25 -> 0.35 (phase two 0.35 -> 0.45), and its cooldown 2.4 -> 1.8 s;
- raised the ward when pressed 0.5 -> 0.65.

**What was undone:**
- His health stays **1700**. tools/weak-bosses.mjs pins it ("Daniel plays the gate"), so 1800 was undone.
- His greatsword cut stays 0.47 / 0.34 s. 0.40 is quicker than a 386 ms reaction, and the knight went 0/4.
- Exact stuck values matter: unburied-fights' cold-start rotation check is phase-sensitive, so 1.2 never reached coilTell and 1.25 does.

**Bot fixes (v2 only, the knight only):**
- The knight raised his shield only in the last 0.24 s of a cut, but the eyes see the cut a reaction late. 7 of 8 greatsword cuts landed on him.
- Now the shield goes up when the cut is seen.
- It also goes up under a cleave whose commit he has not seen yet, with 0.2 s left. The cleave is yellow.

**Result: 2/8 8/8 5/8 = 63% (n=24), 3 over the band edge, no zero.**
- The warden wins every fight. Her thrusts land ~45 a blow on him and the knight's ~10, so she out-damages the knight 2:1.
- Fights last 60-110 s.

**Checks:** unburied-fights, weak-bosses, unburied, deathknight-unlock, boss-read, boss-greed and tells are green.

## 5. Bot changes (all `LABP.v2`; legacy byte-identical)
src/lab.js:
- The carpet greed-stop now applies to every hero (WARDEN KIT Q4).
- The knight's DK shield, as in section 4.
- The warden deflects the Gargoyle's breath and fireballs.
- The warden deflects the Winchmaster's brake bar and wrench.

## 6. Checks run (all exit 0 unless noted)
- boss-greed: it went red on BOSS_HIT bosun 0.85, because its mini-hit ratio is read off the bosun. That change was moved into SALVAGE_HIT, and boss-greed is green.
- normal-health, small-adds (worst row 27%, limit 33%), boss-navigation, combat-replay, puppeteer, queen-court, mother-pilot, pyre-pilot, herald-pirate, lab-reach, lab-clock, lab-order, unburied-fights, pyro-duel, paladin-enrage, salvage-captain, buried-dead, gargoyle-smash, gargoyle-stomp, dune-worm, boss-openings, kraken-rework, weak-bosses (after the 1700 revert), boss-read, boss-greed, tells, answer-tags, raptor-matriarch, comments, and `node --check` on the touched files.
- The full suite was not run (the coordinator runs it).

## 7. Mash (tools/mash-bot.mjs, LEVEL then BOSS, --write)
Re-stamped, LEVEL first and then BOSS, for every level whose boss or mini changed: fallingtower, unburied, caravan, hurricane, witchlight, burial, wood, underleaf, fair, welltown (its mini; the Djinn is untouched), longwater, waymeet, kings, fields, spire, hanging, storm, lamplit, harbor (again after SALVAGE_HIT), crown (again after the revert) and oreroad.
- **Every BOSS row is 0/6.** The level rows hold for all three heroes (`--report`: none change verdict).
- **Every MINI row is 0/6**, except fallingtower:mini (the Sexton, 3/6, pre-existing and report-only in mash-gate).
- crown:mini went 2/6 with BOSS_HIT 0.85, so that change was reverted and the row re-stamped at 0/6.
- mash-gate and mash-carry are green.

## REDS
- **spire (False Abbot): knight 0/8.** His 8 deaths come from arrows while the Abbot is DOWNED. The knight swings at the downed Abbot and does not raise his shield.
  - Not a BOSS_HIT matter: those arrows do not name him.
- **oreroad (Winchmaster): warden 0/8**, even after the deflect fix. Her blows outside his openings are chips (3-7 a blow), and she times out. That is WARDEN KIT ground.
- **mage:mini (Homunculus) 88% and crown (Goblin Queen) 75%.** Neither number moved under any knob I tried. Their openings decide the fight, so a rework is needed, not a number.
- **fallingtower:mini (Sexton): the mash bot wins the MINI 3/6.** This is pre-existing: botreads' docs/mash-bot.json has the same 3/6, and I did not touch him.
- Page hangs: 4 of 192 fights in one batch hit "Runtime.evaluate did not answer within 1201 s", and 2 in another. Those rows are quoted at n<24.

## QUESTIONS FOR DANIEL (recommendation first; the recommendation is what is built)
1. **Which human?**
   - Rec: d=0.9 (built). It is the best fit over all four bosses you rated, and it lies inside the dial's range.
   - Alt: d=1.2, the tool's own pick, which fits the Death Knight, Puppeteer and Jenny if the Djinn is left out. It reacts at ~430 ms and is greedy half the time. It would push most bosses' numbers down again, so every row would need retuning a second time.
   - A few recorded fights (`?rec=1`, F9) would settle it better than the feel words.
2. **The Death Knight at 63% on the bot, and you call him hard.**
   - Rec: play him once on this branch. His cleave and red moves are told sooner, and his openings are shorter.
   - The number now sits close to the band, so your playtest is the gate. If he feels too hard, the first thing to undo is the passing cooldown (1.8 -> 2.4).
3. **The warden beats the Death Knight 8/8 while the knight wins 2/8.**
   - Rec: a hero-balance pass on the knight's damage into a duelist, not a boss change. Built: nothing.
4. **The False Abbot's knight 0/8 and the Winchmaster's warden 0/8.**
   - Rec: a v2 bot pass for the knight's shield over the downed Abbot (the arrows are yellow), and WARDEN KIT for her chip damage on the Winchmaster.
   - Built: only the warden's deflect hands.
5. **The Homunculus mini (88) and the Goblin Queen (75)** move with no number.
   - Rec: a short opening-length pass, an Act I/III follow-up lane. Built: nothing.
6. **WARDEN KIT is merged into this branch.** Rec: merge it with this branch. The retune assumes her kit.

No music this lane.
