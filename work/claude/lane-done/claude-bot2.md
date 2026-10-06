# BOT2 report - claude/bot2 (base master 85e13368) - a better playtest bot

Brief: scratch/brief-bot2.md (Daniel 10-05, all four items + the evening additions). Everything below was built overnight on the recommended
options; Daniel was asleep, so every design call is listed under QUESTIONS with what was built.

## 0. Headline
- **One command:** `PORT=<port> node tools/boss-rates.mjs --all` prints, per boss and hero, PRACTICED / FIRST-ATTEMPT / BUILT win rates at the
  campaign level (practiced = bare build = the standard). The overnight sweep: 52 rows x 3 heroes, 1248 fights, 163 min.
- **The standard profile is `human`, calibrated to Daniel's feel:** Puppeteer 56% (he said good, target 55), Jenny 78% (easy, 80),
  Djinn 56% (a little too hard, 42). The Death Knight stays at 63-100% under every setting (target 30). He is left out of the fit and
  listed as a bot gap: his bot code reads hidden state.
- **Overall (practiced):** 62% (knight 61, warden 57, pyro 68). First attempt: 57% (51 / 56 / 66). Built (typical card + skills): 65% (68 / 45 / 82).
  The warden does worse built (see caveat 3).
- **Bosses in band (50-60%):** 4 of 37 (Goblin Queen 50, Undead Archmage 58, Puppeteer 58, Djinn 58). 15 are below the band and 18 above.
  **Minis in band (70-75%):** 0 of 14 (6 below, 8 above). This is the retune list (section 5).
- **The playtest recorder ships now:** `?rec=1` or Shift+F9 turns it on, F9 saves a local JSON file, Ctrl+F9 clears it. Nothing is sent over the network.
  Docs: docs/PLAYTEST.md. Then run `node tools/bot-calibrate.mjs playtest-logs/*.json` to refit.

## 1. What was built
| piece | file | what |
|---|---|---|
| profile table | src/bot-profile.js | Every knob in one place. `legacy` is the old bot exactly: it is the bossLab default, so every suite check is unchanged. `human` is the standard. `+first` gives a first attempt. Also holds typicalCard, TYPICAL_SKILLS and SKILL_RANGE. |
| perception | src/lab-perceive.js | Before each frame the bot decides on, it puts on each foe what a player has SEEN: mode, modeT, open and greedT. It takes them off again before the world steps. Each change is seen after a reaction time: triangular 218-302-446 ms, drawn per read. A pose with no mark adds 120 ms. A windup off-screen is only heard (+180 ms). Anything else off-screen is not seen, and off-screen foes are removed from BK.enemies() for the bot. Misread: 6.2% of tells are answered as a different tell it has already seen. Tell timing is read with a 0.06 s error. Greed: 19% of landed hits keep the bot in for 1-2 more swings, blind to new tells, with the "no swing into a tell" rule off. Stamina slip: 20% of the time it does not keep a roll's stamina back. First attempt: 50% misread until a tell has been seen twice, timing error doubled, and the first opening is noticed 0.9 s late. The perception code uses its own random stream, so the boss's rolls are untouched. |
| skill hands | src/lab-perceive.js makeSkillHands | Casts the equipped slots at the boss: when ready, in range, the hero is free, no visible windup (or the boss is OPEN), a roll's stamina kept back, at most one cast a second. The same code for every boss. |
| typical build | src/bot-profile.js | Card picks 45% vigor / 35% might / 20% endurance, perks at L25+ (iron, heart, arcane...). Skills: the hero's best damaging actives at or below his level, filling slotsAt(L) (2 slots, 3 from L16), rank 1. |
| recorder | src/playrec.js (+7 one-line hooks in src/main.js), tools/playrec.mjs | Off by default. Logs per boss or mini fight: boss, level, hero, hero level, card, loadout, game and real seconds, outcome, each blow that hurt (foe\|move, count, damage, guarded), hits and damage dealt, each opening and whether it was used, skills cast. No personal data. tools/playrec.mjs checks four things: off by default, a whole fight logged, F9 makes a blob download, and every request is a game file (GET, same origin, fonts). It is added to the check list. |
| calibration | tools/bot-calibrate.mjs | Reads the recorder's logs, or uses `--feel` (Daniel's 10-05 words) when there are none. One dial d moves reaction, misread and greed together. A boss that no value of d explains (residual > 20 points everywhere) is left out of the fit and named. `--write` prints the fitted profile. |
| rates | tools/boss-rates.mjs, tools/boss-run.mjs, tools/boss-rows.mjs | The one command. Runs pages side by side (`--jobs`) and retries a page that fails to open. |
| boss-read audit | tools/boss-read-audit.mjs (bossLab `opts.observe`) | Per boss: vulnerability model, turned blows and whether they said a word, openings and how many each hero used, blinks per minute and how many fall during or right after an opening, unmarked tells. |
| campaign level | tools/boss-level.mjs, tools/fixtures/campaign-xp.json | campaignLevel = max(depth, the level a straight run has reached after the level before, L3). Refresh with `node tools/boss-level.mjs --write-xp`. Early bosses move from L1-3 to L3. Mid and late bosses move up 1-2 levels (Q1). campaignLevelDepth keeps the old rule. openLevelPage now also sets the standard profile (`--profile=legacy` restores the old bot), so all 32 per-boss pilots use it. |
| harnesscard-rates | tools/harnesscard-rates.mjs | Defaults to the standard profile and the XP-based level. `--profile=legacy --depth` reproduces BOTLEVEL's table. |

**Never weaken a test:** the suite checks that drive bossLab name no profile, so they get `legacy`, the old bot, unchanged. Those checks are
boss-navigation, normal-health, small-adds, lab-reach, lab-clock, combat-replay, queen-court, pyre-pilot, mother-pilot, herald-pirate,
unburied-fights and puppeteer. The triage fixes (section 3) only apply to the v2 profiles. normal-health showed why: with the fixes, a level-1
knight survives the Deep and its "normal mode stops on death" check stopped dying. Under legacy it is green again, byte-identical.

## 2. Calibration (fit to the feel; no logs yet)
`node tools/bot-calibrate.mjs --feel --grid=...`, 4 bosses x 3 heroes x 3 seeds per grid point:

| d | reaction min-mode-max ms | misread | greed | Death Knight (hard, ~30) | Djinn (a bit too hard, ~42) | Puppeteer (good, ~55) | Jenny (easy, ~80) |
|---|---|---|---|---|---|---|---|
| 0.3 **(fit)** | 218-302-446 | 6.2% | 19% | 100% | 56% | 56% | 78% |
| 0.6 | 236-344-512 | 10.4% | 30% | 89% | 78% | 56% | 67% |
| 0.9 | 254-386-578 | 14.6% | 41% | 63% | 56% | 44% | 44% |
| (legacy bot) | - | - | - | 100% | 67% | 50% | 67% |

d=0.3 matches three of the four bosses within noise. At d=0.9 the Death Knight finally drops, but Jenny becomes the hardest of the four, which is
the reverse of Daniel's ordering. The Death Knight cannot be fitted: his bot branch (src/lab.js 'bloodknight') reads the hidden `boss.committed`
flag, the bolt marks before they are drawn (`boss.boltAt`) and `boss.chainX`. It plays him better than a person can, so his number in the table
overstates how easy he is. Noise: about ±15 points per boss at n=9.
Measured in the sweep: mean reaction 329 ms, 2.2 misreads and 5.1 greedy follow-ups per fight.

## 3. Triage of BOTLEVEL's seven 0/18 rows (bot gap or boss?)
Each row was re-run on master 85e13368 (one seed per hero, legacy bot first, then with the fixes), plus the overnight sweep (human, n=12):

| row | verdict | what it was | standard now |
|---|---|---|---|
| wood (Hornet Queen) | **neither: already fixed on master** | BOSS WAVE 2 (batch71) changed her. The legacy bot wins 2/2, 1/2, 1/2 at L1. | 12/12 at L3: too easy now (+40) |
| storm (Queen's Lance) | **neither: already fixed on master** | BOSS WAVE 2's lance support. The legacy bot wins knight and warden, pyro dies. | 3/12 (pyro 0/4) |
| spire:mini (Golem) | **BOT GAP, fixed** | "Stone does not bleed": only the note of a hanging bell rung while he stands under it cracks him (3.6 s). The bot never rang a bell: 170 swings on stone, 100% hp left. Fixed (v2): stand 20 px on this side of the nearest bell (he stops 40 px short of you, so he halts under it), strike it from a jump, then cut. Also jump his LOW sweep and his stomp's floor waves; it used to roll, which is safe for only 0.2 s against a 0.45 s sweep. Legacy: 0/3. Fixed: 2/3 (knight and pyro win). | 2/12. Still low: the knight never cracks him under perception reaction times, and the warden times out (he throws at her from range). The next pass should time the bell to the sweep. |
| burial (Buried Dead) | **BOT GAP, fixed** | BURIAL3's attacks had no answers in the bot (grave hands, nova, body slam, claw, the throw); their damage landed during 'rest'. Fixed (v2): POISON NOVA = get 134 px clear; BODY SLAM / CLAW = step off the mark; THROW = step off where you stood; GRAVE HANDS = jump each arm as it comes up under you. Legacy 0/3; fixed 2/3. | 3/12 (built 4/6): low, real difficulty at hp 1406 |
| deep (Bell Crab) | **BOT GAP (half fixed) + long boss** | Holding a stone, the bot stood still inside the PRESSURE ring (34 px, 0.8 s, laid on you); 124 of the knight's 182 damage. Fixed: step out of the ring whether or not you hold a stone, drop the stone and rise over his scuttle and leap. The knight's boss-left went from 83% to 12-24%, timing out instead of dying. What remains is his claw (68-164 damage) and a long phase 3. | 0/12 (built 1/6): still a zero row. Bot claw answer, then the boss (Act II) |
| oreroad (Winchmaster) | **mostly the boss** | The bot plays his fight: knight at 23% left after 183 s, pyro 50%. The deaths are his send / lever / stalk combo plus one pit misstep. No single missing answer. | 0/12 (built 1/5): retune (Act I #2) |
| causeway (Kraken) | **BOSS BUG: soft-lock** | src/main.js ~13016: an arm stuck in a solid / plank tile for 2 s is sent `retreat` -> `hid` with no `a.back` timer, so it never comes back, while stage 1 ends only when `e.arms.every(a => a.st === 'gone')`. Seen at 8 s: arm 3 retreats, then 300 s at stage 1, the bot standing at 9408. **A human player hits this too.** Fix (Act II lane): in that stuck branch, set `a.back = 2` during stage 1 (the 'hid' case already brings an arm back on `a.back`), or count a stuck-retreated arm as gone. | 0/12 timeouts |

New zero rows in the standard sweep, to check before retuning: **welltown:mini Gang Leader 0/12** (BOTLEVEL had 61%, legacy L30) and **deep**.

## 4. How every live boss moves: BOTLEVEL baseline (legacy bot, depth level) -> the standard (human, XP level)
Rows from the sweep, practiced (n=12). B = BOTLEVEL's number (master 2423ff42, so some bosses were retuned in between: wood, storm, the
batch70/71 bosses).
| row | boss | L now | BOTLEVEL % | standard % | move |
|---|---|---|---|---|---|
| spire:mini | golem | 8 | 0 | 17 | +17 |
| burial | burieddead | 27 | 0 | 25 | +25 |
| causeway | kraken | 21 | 0 | 0 | 0 |
| deep | bellcrab | 18 | 0 | 0 | 0 |
| oreroad | winchmaster | 10 | 0 | 0 | 0 |
| storm | lance | 11 | 0 | 25 | +25 |
| wood | queen | 3 | 0 | 100 | +100 |
| mage | archmage | 29 | 6 | 17 | +11 |
| fields | strawking | 26 | 11 | 33 | +22 |
| underleaf | grandmother | 6 | 11 | 8 | -3 |
| scree | ram | 6 | 22 | 17 | -5 |
| canal | greenteeth | 23 | 100 | 83 | -17 |
| fair | wickerqueen | 25 | 100 | 100 | 0 |
| flotilla | quarter | 15 | 100 | 92 | -8 |
| harbor | harbormaster | 22 | 100 | 83 | -17 |
| kings | king | 4 | 100 | 100 | 0 |
| lamplit | tollmaster | 17 | 100 | 100 | 0 |
| longwater | herald | 14 | 100 | 67 | -33 |
| unburied | bloodknight | 29 | 100 | 100 | 0 |
| undercrown | prince | 14 | 100 | 100 | 0 |
| waymeet | closedhelm | 22 | 100 | 100 | 0 |
| kings:mini | greathound | 4 | 50 | 83 | +33 |
| reef | reefmaw | 15 | 94 | 75 | -19 |
| spore | mother | 3 | 94 | 17 | -77 |
| hanging | owl | 7 | 33 | 67 | +34 |
| crown | gqueen | 12 | 39 | 50 | +11 |
| keep | drownedking | 20 | 39 | 42 | +3 |
| burial:mini | gravewarden | 27 | 100 | 100 | 0 |
| fields:mini | ploughman | 26 | 100 | 92 | -8 |
| lamplit:mini | lampreeve | 17 | 100 | 100 | 0 |
| mage:mini | homunculus | 29 | 100 | 100 | 0 |
| unburied:mini | barrowrider | 29 | 100 | 100 | 0 |
| waymeet:mini | lancer | 22 | 100 | 100 | 0 |
| hurricane | captain | 16 | 67 | 83 | +16 |
| marsh | frog | 3 | 28 | 75 | +47 |
| moor | windcaller | 9 | 28 | 42 | +14 |
| witchlight:mini | hedgewarden | 28 | 50 | 42 | -8 |
| hanging:mini | spider | 7 | 67 | 67 | 0 |
| harbor:mini | bosun | 22 | 67 | 50 | -17 |
| redgorge | gorgecrab | 32 | 78 | 92 | +14 |
| spire | abbot | 8 | 78 | 92 | +14 |
| caravan | duneworm | 30 | 72 | 92 | +20 |
| stockade | chief | 3 | 39 | 42 | +3 |
| welltown:mini | gangleader | 31 | 61 | 0 | -61 |
| fallingtower | undeadmage | 29 | 67 | 58 | -9 |
| witchlight | gargoyle | 28 | 67 | 75 | +8 |
| crown:mini | forgemaster | 12 | 78 | 92 | +14 |
| fallingtower:mini | sexton | 29 | 67 | 67 | 0 |
| burning | pyromancer | 3 | 61 | 25 | -36 |
| theatre | puppeteer | 24 | 56 | 58 | +2 |
| welltown | djinn | 31 | 56 | 58 | +2 |

Mean move 2.3 points; 4 rows fell 20+, 8 rose 20+.

## 5. THE RETUNE LIST, by act (for the boss-retune sweep lanes)
Measured with `node tools/boss-rates.mjs --all --seeds=4 --first-seeds=2 --built-seeds=2 --jobs=3`, profile `human`, NORMAL health, 240 s
cap, campaign level = max(depth, road XP, L3). Practiced n=12 per row (4 per hero), first and built n=6. **Rows are sorted by priority:
distance from the band, +15 if any hero is at 0.** "dir" is what the BOSS needs: EASIER (the bot wins too little) or HARDER. Read the
"read" column against design-standard B10-B13 before any hp change. Re-measure only your own rows, with the same command; stop once in band.
Noise is about ±14 points at n=12. Acts are by gate-chain depth: I = 0-9, II = 10-20, III = 21+. For one lane per act, use these splits.
Rules for the sweep lanes:
1. Fix the read first (B10-B13 flags, section 6), then health/damage. A boss whose opening a hero cannot reach (B12 REACH) is not fixed by hp.
2. Rows marked BOT GAP in section 3 or 7 are not boss rows until the bot answers them. Rows with a boss bug: fix the bug first (Kraken).
3. Death Knight (unburied): the bot overstates how easy he is (section 2). Use Daniel's word ("hard") together with the bot's first-attempt number,
   not the practiced 100%.

### ACT I (depth 0-9)

| # | row (boss) | L | practiced kn/wa/py | % | band | dir | first % | built % | read (audit) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | spire:mini (golem) | 8 | 0/4 1/4 1/4 | 17 | 70-75 | EASIER -53 (0: knight) | 17 | 17 | always hittable, openings pay more; turned 7% (word 0%); open 14 (1.45s); blinks 0/min (0 in/after open); reach kn 3/5, wa 4/7, py 2/2; 2 unmarked tells |
| 2 | oreroad (winchmaster) | 10 | 0/4 0/4 0/4 | 0 | 50-60 | EASIER -50 (0: knight,warden,pyro) | 0 | 20 | guarded / partial; turned 16% (word 6%); open 4 (4.3s); blinks 0/min (0 in/after open); reach kn 2/2, wa 1/1, py 1/1; 5 unmarked tells |
| 3 | underleaf (grandmother) | 6 | 0/4 0/4 1/4 | 8 | 50-60 | EASIER -42 (0: knight,warden) | 17 | 0 | guarded / partial; turned 24% (word 9%); open 6 (1.92s); blinks 0.6/min (0 in/after open); reach kn 2/2, wa 4/4, py 0/0; 21 unmarked tells |
| 4 | scree (ram) | 6 | 0/4 0/4 2/4 | 17 | 50-60 | EASIER -33 (0: knight,warden) | 33 | 67 | guarded / partial; turned 68% (word 5%); open 10 (2.96s); blinks 0/min (0 in/after open); reach kn 4/4, wa 4/4, py 2/2; 9 unmarked tells |
| 5 | spore (mother) | 3 | 1/4 1/4 0/4 | 17 | 50-60 | EASIER -33 (0: pyro) | 33 | 67 | guarded / partial; turned 61% (word 0%); open 0 (nulls); blinks 0/min (0 in/after open); reach kn 0/0, wa 0/0, py 0/0 |
| 6 | wood (queen) | 3 | 4/4 4/4 4/4 | 100 | 50-60 | HARDER +40 | 100 | 100 | always open; turned 0% (word -%); open 2 (1.56s); blinks 0/min (0 in/after open); reach kn 0/0, wa 1/1, py 1/1 |
| 7 | kings (king) | 4 | 4/4 4/4 3/3 | 100 | 50-60 | HARDER +40 | 100 | 100 | always hittable, openings pay more; turned 0% (word -%); open 6 (1.23s); blinks 0/min (0 in/after open); reach kn 2/2, wa 2/2, py 2/2 |
| 8 | burning (pyromancer) | 3 | 2/4 0/4 1/4 | 25 | 50-60 | EASIER -25 (0: warden) | 0 | 83 | always hittable, openings pay more; turned 0% (word -%); open 9 (2.94s); blinks 0/min (0 in/after open); reach kn 5/5, wa err, py 4/4 |
| 9 | spire (abbot) | 8 | 3/4 4/4 4/4 | 92 | 50-60 | HARDER +32 | 83 | 100 | always hittable, openings pay more; turned 7% (word 14%); open 12 (3.71s); blinks 0/min (0 in/after open); reach kn 5/5, wa 4/4, py 3/3; 18 unmarked tells |
| 10 | moor (windcaller) | 9 | 0/4 3/4 2/4 | 42 | 50-60 | EASIER -8 (0: knight) | 50 | 33 | guarded / partial; turned 31% (word 14%); open 10 (1.25s); blinks 8.7/min (8 in/after open); reach kn 2/2, wa 3/3, py 4/5; 3 unmarked tells |
| 11 | stockade (chief) | 3 | 1/4 4/4 0/4 | 42 | 50-60 | EASIER -8 (0: pyro) | 50 | 83 | guarded / partial; turned 46% (word 29%); open 11 (1.75s); blinks 0/min (0 in/after open); reach kn 5/5, wa 2/2, py 4/4 |
| 12 | marsh (frog) | 3 | 3/4 2/4 4/4 | 75 | 50-60 | HARDER +15 | 83 | 83 | guarded / partial; turned 32% (word 0%); open 17 (1.37s); blinks 0/min (0 in/after open); reach kn 3/6, wa 5/8, py 3/3 |
| 13 | kings:mini (greathound) | 4 | 3/4 4/4 3/4 | 83 | 70-75 | HARDER +8 | 83 | 100 | guarded / partial; turned 24% (word 8%); open 5 (2.57s); blinks 0/min (0 in/after open); reach kn 2/2, wa 2/2, py 1/1; 11 unmarked tells |
| 14 | hanging (owl) | 7 | 2/4 4/4 2/4 | 67 | 50-60 | HARDER +7 | 50 | 50 | always hittable, openings pay more; turned 2% (word 0%); open 17 (3.12s); blinks 0/min (0 in/after open); reach kn 6/6, wa 5/5, py 6/6; 8 unmarked tells |
| 15 | hanging:mini (spider) | 7 | 3/4 1/4 4/4 | 67 | 70-75 | EASIER -3 | 67 | 67 | always open; turned 0% (word -%); open 1 (0s); blinks 0/min (0 in/after open); reach kn 0/0, wa 0/0, py 1/1 |

### ACT II (depth 10-20)

| # | row (boss) | L | practiced kn/wa/py | % | band | dir | first % | built % | read (audit) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | causeway (kraken) | 21 | 0/4 0/4 0/4 | 0 | 50-60 | EASIER -50 (0: knight,warden,pyro) | 0 | 0 | not met; turned null% (word -%); open 0 (nulls); blinks 0/min (0 in/after open); reach kn 0/0, wa 0/0, py 0/0 |
| 2 | deep (bellcrab) | 18 | 0/4 0/4 0/4 | 0 | 50-60 | EASIER -50 (0: knight,warden,pyro) | 0 | 17 | always hittable, openings pay more; turned 7% (word 0%); open 19 (2.97s); blinks 0/min (0 in/after open); reach kn 2/2, wa 5/9, py 5/8; 2 unmarked tells |
| 3 | storm (lance) | 11 | 2/4 1/4 0/4 | 25 | 50-60 | EASIER -25 (0: pyro) | 33 | 50 | wall + weak point; turned 67% (word 34%); open 97 (0.95s); blinks 0/min (0 in/after open); reach kn 18/33, wa 12/23, py 27/41; 4 unmarked tells |
| 4 | lamplit (tollmaster) | 17 | 4/4 4/4 4/4 | 100 | 50-60 | HARDER +40 | 100 | 67 | always hittable, openings pay more; turned 4% (word 20%); open 9 (1.6s); blinks 0/min (0 in/after open); reach kn 1/1, wa 5/5, py 3/3; 1 unmarked tells |
| 5 | undercrown (prince) | 14 | 4/4 4/4 4/4 | 100 | 50-60 | HARDER +40 | 100 | 83 | always hittable, openings pay more; turned 7% (word 0%); open 15 (2.17s); blinks 1.7/min (2 in/after open); reach kn 5/6, wa 3/5, py 4/4; 3 unmarked tells |
| 6 | waymeet (closedhelm) | 22 | 4/4 4/4 4/4 | 100 | 50-60 | HARDER +40 | 100 | 100 | always hittable, openings pay more; turned 0% (word -%); open 10 (1.53s); blinks 0/min (0 in/after open); reach kn 4/4, wa 3/3, py 3/3 |
| 7 | harbor:mini (bosun) | 22 | 3/4 3/4 0/4 | 50 | 70-75 | EASIER -20 (0: pyro) | 17 | 50 | always open; turned 9% (word 0%); open 3 (2.99s); blinks 0/min (0 in/after open); reach kn 2/2, wa 1/1, py 0/0 |
| 8 | flotilla (quarter) | 15 | 3/4 4/4 4/4 | 92 | 50-60 | HARDER +32 | 100 | 67 | always hittable, openings pay more; turned 5% (word 20%); open 15 (1.25s); blinks 0/min (0 in/after open); reach kn 3/3, wa 5/8, py 2/4 |
| 9 | lamplit:mini (lampreeve) | 17 | 4/4 4/4 4/4 | 100 | 70-75 | HARDER +25 | 100 | 100 | always open; turned 0% (word -%); open 4 (2.24s); blinks 0/min (0 in/after open); reach kn 2/2, wa 1/1, py 1/1; 4 unmarked tells |
| 10 | waymeet:mini (lancer) | 22 | 4/4 4/4 4/4 | 100 | 70-75 | HARDER +25 | 100 | 83 | always open; turned 6% (word 17%); open 7 (0.59s); blinks 0/min (0 in/after open); reach kn 2/3, wa 1/1, py 3/3 |
| 11 | harbor (harbormaster) | 22 | 4/4 2/4 4/4 | 83 | 50-60 | HARDER +23 | 100 | 67 | always hittable, openings pay more; turned 4% (word 0%); open 42 (1.83s); blinks 0/min (0 in/after open); reach kn 11/11, wa 13/15, py 16/16 |
| 12 | keep (drownedking) | 20 | 3/4 0/4 2/4 | 42 | 50-60 | EASIER -8 (0: warden) | 17 | 33 | guarded / partial; turned 23% (word 17%); open 49 (1.2s); blinks 0/min (0 in/after open); reach kn 9/11, wa 11/18, py 16/20 |
| 13 | hurricane (captain) | 16 | 4/4 3/4 3/4 | 83 | 50-60 | HARDER +23 | 67 | 67 | always open; turned 10% (word 10%); open 8 (0.45s); blinks 0/min (0 in/after open); reach kn 5/5, wa 2/2, py 1/1 |
| 14 | crown:mini (forgemaster) | 12 | 4/4 3/4 4/4 | 92 | 70-75 | HARDER +17 | 67 | 17 | always open; turned 0% (word -%); open 8 (1.8s); blinks 0/min (0 in/after open); reach kn 0/2, wa 2/3, py 3/3; 3 unmarked tells |
| 15 | reef (reefmaw) | 15 | 2/4 3/4 4/4 | 75 | 50-60 | HARDER +15 | 50 | 83 | guarded / partial; turned 37% (word 12%); open 8 (1.56s); blinks 8.7/min (0 in/after open); reach kn 2/2, wa 4/4, py 2/2 |
| 16 | longwater (herald) | 14 | 4/4 2/4 2/4 | 67 | 50-60 | HARDER +7 | 50 | 50 | always hittable, openings pay more; turned 0% (word -%); open 9 (2.05s); blinks 0/min (0 in/after open); reach kn 3/3, wa 3/3, py 3/3; 2 unmarked tells |
| 17 | crown (gqueen) | 12 | 2/4 2/4 2/4 | 50 | 50-60 | in band | 50 | 33 | guarded / partial; turned 32% (word 19%); open 12 (3.79s); blinks 0.4/min (0 in/after open); reach kn 4/4, wa 4/4, py 4/4 |

### ACT III (depth 21+)

| # | row (boss) | L | practiced kn/wa/py | % | band | dir | first % | built % | read (audit) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | welltown:mini (gangleader) | 31 | 0/4 0/4 0/4 | 0 | 70-75 | EASIER -70 (0: knight,warden,pyro) | 0 | 17 | always open; turned 3% (word 20%); open 5 (4.36s); blinks 0/min (0 in/after open); reach kn 2/2, wa 2/2, py 1/1 |
| 2 | mage (archmage) | 29 | 0/4 0/4 2/4 | 17 | 50-60 | EASIER -33 (0: knight,warden) | 17 | 17 | guarded / partial; turned 39% (word 8%); open 28 (0.89s); blinks 8.7/min (1 in/after open); reach kn 6/9, wa 5/9, py 5/10; 45 unmarked tells |
| 3 | witchlight:mini (hedgewarden) | 28 | 0/4 1/4 4/4 | 42 | 70-75 | EASIER -28 (0: knight) | 33 | 83 | always open; turned 0% (word -%); open 3 (0s); blinks 0/min (0 in/after open); reach kn 1/1, wa 1/1, py 1/1 |
| 4 | burial (burieddead) | 27 | 1/4 0/4 2/4 | 25 | 50-60 | EASIER -25 (0: warden) | 0 | 67 | always hittable, openings pay more; turned 3% (word 13%); open 13 (2.99s); blinks 0/min (0 in/after open); reach kn 4/4, wa 4/4, py 5/5; 22 unmarked tells |
| 5 | fair (wickerqueen) | 25 | 4/4 4/4 4/4 | 100 | 50-60 | HARDER +40 | 83 | 83 | always hittable, openings pay more; turned 0% (word -%); open 29 (3.45s); blinks 1.9/min (3 in/after open); reach kn 9/10, wa 9/10, py 9/9; 12 unmarked tells |
| 6 | unburied (bloodknight) | 29 | 4/4 4/4 4/4 | 100 | 50-60 | HARDER +40 | 83 | 100 | guarded / partial; turned 15% (word 0%); open 12 (1.82s); blinks 0/min (0 in/after open); reach kn 6/6, wa 3/3, py 3/3; 15 unmarked tells |
| 7 | fields (strawking) | 26 | 1/4 0/4 3/4 | 33 | 50-60 | EASIER -17 (0: warden) | 33 | 67 | guarded / partial; turned 12% (word 10%); open 7 (2.01s); blinks 0/min (0 in/after open); reach kn 2/2, wa 2/2, py 2/3; 23 unmarked tells |
| 8 | redgorge (gorgecrab) | 32 | 3/4 4/4 4/4 | 92 | 50-60 | HARDER +32 | 83 | 67 | always hittable, openings pay more; turned 0% (word -%); open 18 (3.91s); blinks 0/min (0 in/after open); reach kn 6/6, wa 5/5, py 7/7 |
| 9 | caravan (duneworm) | 30 | 4/4 3/4 4/4 | 92 | 50-60 | HARDER +32 | 100 | 100 | guarded / partial; turned 13% (word 4%); open 12 (2.21s); blinks 2.3/min (3 in/after open); reach kn 3/3, wa 5/5, py 4/4 |
| 10 | underwell (cisternqueen) | 32 | 0/4 0/4 4/4 | 33 | 50-60 | EASIER -17 (0: knight,warden) | 33 | 83 | guarded / partial; turned 14% (word 0%); open 34 (1.77s); blinks 1/min (0 in/after open); reach kn 10/12, wa 8/10, py 9/12; 17 unmarked tells |
| 11 | burial:mini (gravewarden) | 27 | 4/4 4/4 4/4 | 100 | 70-75 | HARDER +25 | 100 | 100 | always open; turned 0% (word -%); open 1 (3.64s); blinks 0/min (0 in/after open); reach kn 0/0, wa 1/1, py 0/0; 3 unmarked tells |
| 12 | mage:mini (homunculus) | 29 | 4/4 4/4 4/4 | 100 | 70-75 | HARDER +25 | 100 | 83 | always hittable, openings pay more; turned 0% (word -%); open 8 (2.81s); blinks 0/min (0 in/after open); reach kn 2/2, wa 2/2, py 4/4 |
| 13 | unburied:mini (barrowrider) | 29 | 4/4 4/4 2/2 | 100 | 70-75 | HARDER +25 | 100 | 100 | always open; turned 0% (word -%); open 1 (0s); blinks 0/min (0 in/after open); reach kn 1/1, wa 0/0, py 0/0; 1 unmarked tells |
| 14 | canal (greenteeth) | 23 | 3/4 4/4 3/4 | 83 | 50-60 | HARDER +23 | 50 | 67 | always hittable, openings pay more; turned 0% (word -%); open 26 (3.29s); blinks 0.2/min (0 in/after open); reach kn 8/8, wa 9/10, py 8/8; 6 unmarked tells |
| 15 | fields:mini (ploughman) | 26 | 3/4 4/4 4/4 | 92 | 70-75 | HARDER +17 | 100 | 100 | always hittable, openings pay more; turned 0% (word -%); open 10 (1.69s); blinks 0/min (0 in/after open); reach kn 3/3, wa 3/3, py 4/4 |
| 16 | fallingtower (undeadmage) | 29 | 3/4 0/4 4/4 | 58 | 50-60 | fix zero hero (0: warden) | 67 | 67 | guarded / partial; turned 16% (word 20%); open 24 (3.36s); blinks 6.8/min (14 in/after open); reach kn 9/9, wa 7/7, py 8/8; 11 unmarked tells |
| 17 | witchlight (gargoyle) | 28 | 4/4 3/4 2/4 | 75 | 50-60 | HARDER +15 | 67 | 50 | not met; turned null% (word -%); open 21 (0.93s); blinks 0/min (0 in/after open); reach kn 7/7, wa 9/9, py 5/5 |
| 18 | theatre (puppeteer) | 24 | 0/4 4/4 3/4 | 58 | 50-60 | fix zero hero (0: knight) | 67 | 33 | always hittable, openings pay more; turned 0% (word -%); open 11 (2.94s); blinks 0/min (0 in/after open); reach kn 1/1, wa 4/4, py 6/6; 9 unmarked tells |
| 19 | welltown (djinn) | 31 | 4/4 0/4 3/4 | 58 | 50-60 | fix zero hero (0: warden) | 0 | 100 | guarded / partial; turned 30% (word 5%); open 62 (1.14s); blinks 0/min (0 in/after open); reach kn 18/19, wa 18/23, py 18/20 |
| 20 | fallingtower:mini (sexton) | 29 | 3/4 1/4 4/4 | 67 | 70-75 | EASIER -3 | 50 | 50 | always open; turned 0% (word -%); open 1 (3.41s); blinks 0/min (0 in/after open); reach kn 0/0, wa 0/1, py 0/0 |

## 6. THE BOSS-READ AUDIT (design-standard B10-B13), by act
`node tools/boss-read-audit.mjs --all --secs=120`: standard bot, knight / warden / pyro, refill health, 120 s each. Flags are what the retune sweep applies B10-B12 to, act by act. Known case confirmed: **the WINDCALLER (moor) blinks 8.7 times a minute, 8 of them during or right after his own opening** (B12).

### BOSS-READ AUDIT, ACT I

| row (boss) | model | openings (/min, s) | flags |
|---|---|---|---|
| scree (ram) | guarded / partial | 10 (4.4/min, 2.96 s) | B10 SILENT TURNS: 68% of the blows that met him did nothing, and only 5% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B10 TELLS: 9 of 39 windups wore no mark (pose only)<br>B11 PICK ONE: 68% turned outside a clear wall - duelist? then guard by angle (say which angle beats it); puzzle? then a wall with a drawn weak point<br>B13 WAITING ROOM?: guarded / partial, 68% turned, 18% of damage outside openings - is the opening something you DO (a core mechanic) or something you wait for? |
| spore (mother) | guarded / partial | 0 (0/min, null s) | B10 SILENT TURNS: 61% of the blows that met him did nothing, and only 0% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B11 PICK ONE: 61% turned outside a clear wall - duelist? then guard by angle (say which angle beats it); puzzle? then a wall with a drawn weak point<br>B13 WAITING ROOM?: guarded / partial, 61% turned, 100% of damage outside openings - is the opening something you DO (a core mechanic) or something you wait for? |
| marsh (frog) | guarded / partial | 17 (8.1/min, 1.37 s) | B10 SILENT TURNS: 32% of the blows that met him did nothing, and only 0% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B11 PICK ONE: 32% turned outside a clear wall - duelist? then guard by angle (say which angle beats it); puzzle? then a wall with a drawn weak point<br>B12 REACH: openings used knight 3/6 (under 60%: the window is not reachable for that hero with base movement) |
| moor (windcaller) | guarded / partial | 10 (2/min, 1.25 s) | B10 SILENT TURNS: 31% of the blows that met him did nothing, and only 14% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B11 PICK ONE: 31% turned outside a clear wall - duelist? then guard by angle (say which angle beats it); puzzle? then a wall with a drawn weak point<br>B12 BLINKS: 8.7/min, 8 during or within 1 s after his own opening (want <= 1 a cycle, never in/after an opening) |
| underleaf (grandmother) | guarded / partial | 6 (1.8/min, 1.92 s) | B10 SILENT TURNS: 24% of the blows that met him did nothing, and only 9% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B10 TELLS: 21 of 110 windups wore no mark (pose only) |
| kings:mini (greathound) | guarded / partial | 5 (5.9/min, 2.57 s) | B10 SILENT TURNS: 24% of the blows that met him did nothing, and only 8% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B10 TELLS: 11 of 11 windups wore no mark (pose only) |
| stockade (chief) | guarded / partial | 11 (3.6/min, 1.75 s) | B10 SILENT TURNS: 46% of the blows that met him did nothing, and only 29% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B11 PICK ONE: 46% turned outside a clear wall - duelist? then guard by angle (say which angle beats it); puzzle? then a wall with a drawn weak point |
| spire:mini (golem) | always hittable, openings pay more | 14 (2.8/min, 1.45 s) | B12 REACH: openings used warden 4/7 (under 60%: the window is not reachable for that hero with base movement) |
| oreroad (winchmaster) | guarded / partial | 4 (0.7/min, 4.3 s) | B10 SILENT TURNS: 16% of the blows that met him did nothing, and only 6% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time) |
| hanging (owl) | always hittable, openings pay more | 17 (4.5/min, 3.12 s) | B10 TELLS: 8 of 21 windups wore no mark (pose only) |
| spire (abbot) | always hittable, openings pay more | 12 (5.5/min, 3.71 s) | B10 TELLS: 18 of 23 windups wore no mark (pose only) |
| wood (queen) | always open | 2 (1/min, 1.56 s) | clean |
| kings (king) | always hittable, openings pay more | 6 (7.2/min, 1.23 s) | clean |
| hanging:mini (spider) | always open | 1 (0.6/min, 0 s) | clean |
| burning (pyromancer) | always hittable, openings pay more | 9 (2.6/min, 2.94 s) | clean |

### BOSS-READ AUDIT, ACT II

| row (boss) | model | openings (/min, s) | flags |
|---|---|---|---|
| storm (lance) | wall + weak point | 97 (22.7/min, 0.95 s) | B10 SILENT TURNS: 67% of the blows that met him did nothing, and only 34% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B12 REACH: openings used knight 18/33, warden 12/23 (under 60%: the window is not reachable for that hero with base movement)<br>B13 WAITING ROOM?: wall + weak point, 67% turned, 4% of damage outside openings - is the opening something you DO (a core mechanic) or something you wait for? |
| reef (reefmaw) | guarded / partial | 8 (3.2/min, 1.56 s) | B10 SILENT TURNS: 37% of the blows that met him did nothing, and only 12% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B11 PICK ONE: 37% turned outside a clear wall - duelist? then guard by angle (say which angle beats it); puzzle? then a wall with a drawn weak point<br>B12 BLINKS: 8.7/min, 0 during or within 1 s after his own opening (want <= 1 a cycle, never in/after an opening) |
| crown (gqueen) | guarded / partial | 12 (4.9/min, 3.79 s) | B10 SILENT TURNS: 32% of the blows that met him did nothing, and only 19% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B11 PICK ONE: 32% turned outside a clear wall - duelist? then guard by angle (say which angle beats it); puzzle? then a wall with a drawn weak point |
| causeway (kraken) | not met | 0 (0/min, null s) | NOT MEASURED: the bot never met him and saw no opening in 120 s (see the triage) |
| deep (bellcrab) | always hittable, openings pay more | 19 (3.2/min, 2.97 s) | B12 REACH: openings used warden 5/9 (under 60%: the window is not reachable for that hero with base movement) |
| flotilla (quarter) | always hittable, openings pay more | 15 (6.5/min, 1.25 s) | B12 REACH: openings used pyro 2/4 (under 60%: the window is not reachable for that hero with base movement) |
| undercrown (prince) | always hittable, openings pay more | 15 (8.5/min, 2.17 s) | B12 BLINKS: 1.7/min, 2 during or within 1 s after his own opening (want <= 1 a cycle, never in/after an opening) |
| keep (drownedking) | guarded / partial | 49 (9.8/min, 1.2 s) | B10 SILENT TURNS: 23% of the blows that met him did nothing, and only 17% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time) |
| hurricane (captain) | always open | 8 (2.8/min, 0.45 s) | B10 SILENT TURNS: 10% of the blows that met him did nothing, and only 10% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time) |
| crown:mini (forgemaster) | always open | 8 (2.5/min, 1.8 s) | B12 REACH: openings used knight 0/2 (under 60%: the window is not reachable for that hero with base movement) |
| harbor (harbormaster) | always hittable, openings pay more | 42 (13.1/min, 1.83 s) | clean |
| lamplit (tollmaster) | always hittable, openings pay more | 9 (4.8/min, 1.6 s) | clean |
| longwater (herald) | always hittable, openings pay more | 9 (4.9/min, 2.05 s) | clean |
| waymeet (closedhelm) | always hittable, openings pay more | 10 (10.4/min, 1.53 s) | clean |
| lamplit:mini (lampreeve) | always open | 4 (5.3/min, 2.24 s) | clean |
| waymeet:mini (lancer) | always open | 7 (3.3/min, 0.59 s) | clean |
| harbor:mini (bosun) | always open | 3 (0.5/min, 2.99 s) | clean |

### BOSS-READ AUDIT, ACT III

| row (boss) | model | openings (/min, s) | flags |
|---|---|---|---|
| mage (archmage) | guarded / partial | 28 (4.7/min, 0.89 s) | B10 SILENT TURNS: 39% of the blows that met him did nothing, and only 8% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B10 TELLS: 45 of 158 windups wore no mark (pose only)<br>B11 PICK ONE: 39% turned outside a clear wall - duelist? then guard by angle (say which angle beats it); puzzle? then a wall with a drawn weak point<br>B12 BLINKS: 8.7/min, 1 during or within 1 s after his own opening (want <= 1 a cycle, never in/after an opening)<br>B12 REACH: openings used warden 5/9, pyro 5/10 (under 60%: the window is not reachable for that hero with base movement) |
| fallingtower (undeadmage) | guarded / partial | 24 (4.1/min, 3.36 s) | B10 SILENT TURNS: 16% of the blows that met him did nothing, and only 20% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B10 TELLS: 11 of 77 windups wore no mark (pose only)<br>B12 BLINKS: 6.8/min, 14 during or within 1 s after his own opening (want <= 1 a cycle, never in/after an opening) |
| fields (strawking) | guarded / partial | 7 (1.6/min, 2.01 s) | B10 SILENT TURNS: 12% of the blows that met him did nothing, and only 10% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B10 TELLS: 23 of 90 windups wore no mark (pose only) |
| fair (wickerqueen) | always hittable, openings pay more | 29 (5.6/min, 3.45 s) | B10 TELLS: 12 of 70 windups wore no mark (pose only)<br>B12 BLINKS: 1.9/min, 3 during or within 1 s after his own opening (want <= 1 a cycle, never in/after an opening) |
| unburied (bloodknight) | guarded / partial | 12 (3.8/min, 1.82 s) | B10 SILENT TURNS: 15% of the blows that met him did nothing, and only 0% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B10 TELLS: 15 of 76 windups wore no mark (pose only) |
| caravan (duneworm) | guarded / partial | 12 (4/min, 2.21 s) | B10 SILENT TURNS: 13% of the blows that met him did nothing, and only 4% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B12 BLINKS: 2.3/min, 3 during or within 1 s after his own opening (want <= 1 a cycle, never in/after an opening) |
| welltown (djinn) | guarded / partial | 62 (10.6/min, 1.14 s) | B10 SILENT TURNS: 30% of the blows that met him did nothing, and only 5% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B11 PICK ONE: 30% turned outside a clear wall - duelist? then guard by angle (say which angle beats it); puzzle? then a wall with a drawn weak point |
| underwell (cisternqueen) | guarded / partial | 34 (6.5/min, 1.77 s) | B10 SILENT TURNS: 14% of the blows that met him did nothing, and only 0% of those said a word (want CLANK + flash + WARDED/GUARDS HIGH/GO ROUND every time)<br>B10 TELLS: 17 of 105 windups wore no mark (pose only) |
| burial (burieddead) | always hittable, openings pay more | 13 (2.6/min, 2.99 s) | B10 TELLS: 22 of 63 windups wore no mark (pose only) |
| theatre (puppeteer) | always hittable, openings pay more | 11 (2/min, 2.94 s) | B10 TELLS: 9 of 9 windups wore no mark (pose only) |
| canal (greenteeth) | always hittable, openings pay more | 26 (5.4/min, 3.29 s) | clean |
| burial:mini (gravewarden) | always open | 1 (0.8/min, 3.64 s) | clean |
| fields:mini (ploughman) | always hittable, openings pay more | 10 (6.5/min, 1.69 s) | clean |
| mage:mini (homunculus) | always hittable, openings pay more | 8 (10.6/min, 2.81 s) | clean |
| unburied:mini (barrowrider) | always open | 1 (1.1/min, 0 s) | clean |
| witchlight:mini (hedgewarden) | always open | 3 (2.3/min, 0 s) | clean |
| redgorge (gorgecrab) | always hittable, openings pay more | 18 (4.1/min, 3.91 s) | clean |
| welltown:mini (gangleader) | always open | 5 (1.5/min, 4.36 s) | clean |
| witchlight (gargoyle) | not met | 21 (3.6/min, 0.93 s) | clean |
| fallingtower:mini (sexton) | always open | 1 (1.2/min, 3.41 s) | clean |

## 7. Caveats (read before trusting a row)
1. **Bot branches that read hidden state** make a boss look easier than he plays. Confirmed: the Death Knight (committed, boltAt, chainX).
   Probably the same for any boss whose bot code takes `goal` and `strike` from a plan module in the boss's own file (Jenny, the Puppeteer,
   the Djinn, the Cistern Queen, the Red Crab, the Kraken's `BK.krak()`). Those modules read the boss's fields directly. The perception layer
   delays and misreads mode / modeT / open / greedT, but the other fields a plan module reads are still real-time.
   A next step (Q4): move each plan module onto the perceived fields only.
2. **Bosses that perception moves most** (practiced, BOTLEVEL -> now, at the same or similar level): Spore Mother 94 -> 17, Gang Leader
   mini 61 -> 0, Pyromancer 61 -> 25, Herald 100 -> 67. Their bot code depended on frame-exact tell timing. That is what a person cannot do,
   so these are now the more honest numbers. They are also the rows to re-check by hand first.
3. **Built is not always better.** The warden does worse with skills (practiced 57% -> built 45%). The generic skill code casts setSpears,
   skewer and harrier into fights where her spacing matters. For the warden, read "built" as a lower bound. Knight 61 -> 68, pyro 68 -> 82.
4. **First attempt** is only 5 points below practiced overall (57 vs 62). It models not knowing his tells and first opening, but not his
   verbs or the level's rule: the bot code still knows the stone, the bell and the gate. Daniel's own first attempts (recorder) will show
   the real gap.
5. The audit's "turned" counts a blow that met him and took no health within 3 frames. Post-hit invulnerability counts as turned, so a
   few percent is normal. "Said a word" = a drawn number or callout within 90 px of him, from 1 frame before to 8 frames after. Sounds are
   not measured.
6. 8 of 1248 fights failed to load a page under load (ERR rows, left out). Noise: n=12 is about ±14 points; read ranks, not decimals.

## 8. Checks run (green unless said)
- syntax, homepaths, dangling-paths, comments (check.mjs subset): green.
- normal-health: green (it had gone red when the triage fixes were unconditional. They are now v2-only, and the legacy path is byte-identical).
- small-adds: green (worst row 17%, limit 33%). modulepreload: green (the 3 new modules are listed in index.html).
- tools/playrec.mjs (new, added to check.mjs's list): green.
- Not run: the full suite (the coordinator runs suites). boss-navigation, lab-reach, lab-clock, combat-replay and queen-court use legacy,
  whose code path did not change.
- Reds: none of mine. The Kraken soft-lock (section 3) is a pre-existing boss bug on master.

## QUESTIONS FOR DANIEL (recommendation first; what I built)
1. **Campaign level for every boss, not only the early ones?** The XP rule (max(depth, road XP after the level before, L3)) also lifts mid
   and late bosses by 1-2 levels (keep L18 -> L20, causeway L19 -> L21). Rec: keep it everywhere, since that is the level a straight run is
   at. Built: everywhere; `campaignLevelDepth` and `harnesscard-rates --depth` keep the old rule.
2. **The Death Knight:** no profile makes the bot find him hard, because his bot code reads hidden state. Rec: retune him on your playtest
   plus the recorder's logs, and in a separate small lane rewrite his bot branch to read only the drawn state. Built: left out of the fit.
3. **The Kraken soft-lock** (an arm stuck in a plank never returns, so stage 1 never ends). Rec: the Act II sweep lane fixes it first
   (`a.back = 2` in the stuck branch during stage 1). It is a real bug a player can hit. Built: nothing (not a retune; it is listed here).
4. **Bot plan modules read the boss's own fields.** Rec: one follow-up lane moves gt / pup / djinn / queen / crab / krak plans to the perceived
   state, so the standard is honest for those bosses too. Built: perception covers mode / modeT / open / greedT for every branch.
5. **Feel targets as numbers** (hard ~30%, a little too hard ~42%, good ~55%, easy ~80%). Rec: keep these until your recorder logs exist,
   then refit with `tools/bot-calibrate.mjs playtest-logs/*.json`. Built: these targets.
6. **Typical build** = 45% vigor / 35% might / 20% endurance, iron / heart / arcane perks, the best damaging skills in the slots. Rec: tell me
   your real picks (or just record a few fights: the log has your card and loadout) and I will match them. Built: this guess.
