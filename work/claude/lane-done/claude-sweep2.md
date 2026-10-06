# claude/sweep2: the Act II boss retune sweep (overnight 2026-10-06)

Base: origin/claude/bot2 38fe2c46 (master 85e13368 + BOT2's calibrated bot), plus sweep1's boss-read helper (60d41207, merged on its own
and not the whole branch). Port 8659, jobs 2. Every rate below comes from the standard command,
`PORT=8659 node tools/boss-rates.mjs <rows> --ways=practiced --seeds=4 --jobs=2` (profile human, campaign level, NORMAL health, 240 s cap).
That gives n=12 per row, which is about ±14 points of noise.

## Headline
- **The Kraken soft-lock is fixed.** An arm stuck in a plank or rock went retreat -> hid with no `a.back` timer, so it never came back.
  Stage 1 ends only when every arm is cut, so it never ended. Now the stuck branch sets `a.back = 2` and keeps the arm's own health
  (`a.backHp`). kraken-rework is green. Before: 0/12, all timeouts at stage 1. After: every fight reaches stage 2 or 3.
- **Two bot gaps behind the zero rows (both v2-only; the legacy bot is byte-identical):**
  1. **Kraken perception.** The perception layer judged "on screen" by `e.x`. The Kraken's body is out at sea, past the screen, so after
     his first slam the bot never saw another of his poses: one slam read for 90 s, and the pinned spear never seen. Now he counts as
     seen when his beak or an arm on the road is on screen. Result: 0% -> 83% with his old numbers.
  2. **Diving Bell bot.** Claw/snip: the knight takes it on the shield; the others go up and back. Out of the bell, the leap is left
     along the floor, not up (the bot hung 100-290 px over him and timed out). The warden now swims at her point's distance; at 0.6 of
     her reach she sat inside the shaft. The swim branch is shared, so this also helps the Drowned King.
- **The final standard sweep (n=12, 17 rows; the three minis and waymeet were re-run after the mini-damage rework):**
  11 rows are in band: storm, lamplit, undercrown, flotilla, lamplit:mini, waymeet:mini, keep, hurricane, reef, longwater and crown.
  Four bosses are 7 points over at 67: causeway, deep, harbor and waymeet. The Salvage Captain mini is 8 over at 83. The Forgemaster mini
  is 3 under at 67. All six are inside the ±14 noise of n=12, and the larger samples agree: causeway 63% at n=24, deep 67% at n=18,
  waymeet 72% at n=18. No hero is at 0 on any row; the two closest are waymeet (warden 1/4) and harbor (warden 1/4).

## Table (practiced, knight / warden / pyro; before = BOT2's retune list n=12, after = my final sweep n=12)
| row | read fixes | number changes | before | after |
|---|---|---|---|---|
| causeway (Kraken) | soft-lock (arm comes back); perception sees him by arms/beak (v2); turned word NOT THE BODY | slam 26->36, sweep 22->33, roar 16->28, jet 18->29, hurl 22->30, beak 26->32, rake 20->26 (hp 480 kept: his openings take shares of it) | 0/4 0/4 0/4 = 0 | 1/4 3/4 4/4 = 67 (n=24 earlier: 3/8 4/8 8/8 = 63) |
| deep (Diving Bell) | bot: claw/snip, out-of-bell leap, warden spacing (v2); leap hits on the way DOWN only (lands on its drawn ring); valve ring drawn as wide as the valve | hp 750->740, valve 15->22 px, shut 0.45->0.6, out-of-bell rest 0.26->0.4, leap tell 0.5->0.62, claw 26->22, leap 24->18, pressure 24->20 | 0/4 0/4 0/4 = 0 | 2/4 3/4 3/4 = 67 |
| storm (Queen's Lance) | turned word HIS PLATE (he already said HIS PLATE TURNS IT) | hp 380->305; charge 30->18, thrust 22->14, vault 16->12, sweep 18->14, rush 18->14, bash 10->8, guard 20->16, jav 11->9, whirl 12->10 (an L11 hero died in 30-60 s) | 2/4 1/4 0/4 = 25 | 2/4 2/4 3/4 = 58 |
| lamplit (Tollmaster) | - | hp 520->980; TOLL_OPEN 3.0->2.0 (one parried ledger was a third of him; he died in 7-18 s) | 4/4 4/4 4/4 = 100 | 1/4 3/4 2/4 = 50 |
| undercrown (Buried Prince) | B12: no sink while reeling, buried, bareheaded or in the light, nor for 1.5 s after | hp 960->2000 (17-35 s fights) | 4/4 4/4 4/4 = 100 | 2/4 2/4 3/4 = 58 |
| waymeet (Paladin) | - | hp 610->2000; at range (>100 px) his judgement comes every 6 s / 4.5 s, not 8.5 / 6 (the pyro stood off and took 0-50) | 4/4 4/4 4/4 = 100 | 3/4 1/4 4/4 = 67 (n=18 at the same health: 4/6 3/6 6/6 = 72; at 2150 the warden went to 0/4) |
| harbor:mini (Salvage Captain) | B13: cargo left on its marks opens him CARGO_OPEN 1.0 s, said THE ROPE RUNS: STRIKE (before, only a parried pin opened him: the pyro timed out 4/4) | hp 360->440 (SALVAGE_HP); his own pin, cargo and shots x1.4 (SALVAGE_HIT, passed in as his numbers); cargo 18->24, shots 12->16 | 3/4 3/4 0/4 = 50 | 4/4 2/4 4/4 = 83 |
| flotilla (Quartermaster) | - | hp 560->920 | 3/4 4/4 4/4 = 92 | 2/4 3/4 2/4 = 58 |
| lamplit:mini (Reeve) | - | hp 200->560; his own blows sweep 16->31, lunge 24->42, hook 18->25, douse 14->25 | 4/4 4/4 4/4 = 100 | 3/4 3/4 3/4 = 75 |
| waymeet:mini (Serjeant) | - | hp x2 -> x3.7 of the serjeant (LANCER_MINI_X); LANCER_OPEN 3.0->1.8; the mini's own charge, swipe and cut x1.7 (LANCER_MINI_HIT; the serjeants in the level keep theirs) | 4/4 4/4 4/4 = 100 | 3/4 2/4 4/4 = 75 |
| harbor (Breakwater Warden) | - | hp 1400->2350 | 4/4 2/4 4/4 = 83 | 3/4 1/4 4/4 = 67 |
| keep (Drowned King) | bot: warden spacing (v2, shared swim branch) | hp 560->500; anchor 20->16, slam 26->22 (kingSlamD) | 3/4 0/4 2/4 = 42 | 4/4 2/4 1/4 = 58 |
| hurricane (Captain) | sabre tell 0.42/0.32 -> 0.5/0.4 (under a reaction plus a roll for a hero with no shield: pyro 0/4); turned word ON THE WAVE while he rides | hp 620->860 | 4/4 3/4 3/4 = 83 | 4/4 1/4 2/4 = 58 |
| crown:mini (Forgemaster) | - | hp 480->520 | 4/4 3/4 4/4 = 92 | 3/4 1/4 4/4 = 67 |
| reef (Reefmaw) | turned word IN ITS HOLE while it lurks | hp 500->830 | 2/4 3/4 4/4 = 75 | 2/4 3/4 2/4 = 58 |
| longwater (Tide Herald) | - | hp 340->370 | 4/4 2/4 2/4 = 67 | 3/4 2/4 2/4 = 58 |
| crown (Goblin Queen) | - | none (in band) | 2/4 2/4 2/4 = 50 | 3/4 1/4 3/4 = 58 |

Every number lives in one block in src/main.js, just under the EHP table: "(claude/sweep2) THE ACT II BOSS RETUNE", with before -> after
in the comments. Act lanes edit their own lines there, not the two long table lines. The few changes that sit in place are each
commented `(claude/sweep2)`: TOLL_OPEN, LANCER_OPEN, the captain's sabre tell, the Paladin's judgement cadence, the Prince's sink gate,
the bell's leap, the valve ring, the lancer mini's health and blows, and the salvage captain's numbers where main.js passes them in.

## Read (B10-B13) audit of the Act II rows
- **B10 silent turns:** sweep1's shared helper (src/boss-read.js, BR.auto in hurtEnemy) now answers every turned blow on every boss and
  mini: CLANK, flash, word. I added Act II rows to TURN_WORD: captain ON THE WAVE, reefmaw IN ITS HOLE, lance HIS PLATE,
  kraken NOT THE BODY. tools/boss-read.mjs is green.
- **B10 unmarked windups:** every Act II windup the audit flags as unmarked is on src/marks.js's QUIET list. They are windups that throw
  no blow, so rule H gives them no mark, and each one says a word instead: the Tollmaster's dark, the Reeve's snuff and take, the Prince's
  call, the Herald's call, the Forgemaster's beam leap, the Lance's gale, the Bell's brood, the Kraken's look. No blow windup is unmarked.
- **B12:** the Undercrown Prince's sink is gated (above). The Lance's low "reach" share comes from counting his thrust, sweep and javelin
  frames as openings: they are short and are not windows. His real openings (planted 2.0-2.8 s) are long. No change.
- **B13:** the Salvage Captain had a waiting room for a hero with no shield, fixed (above). The others in Act II are always hittable.

## Checks (green unless said)
See the commit for the final list: tells, answer-tags, boss-greed, boss-openings, rule-openings, boss-fight-end, hint-shown, boss-read,
salvage-captain, kraken-rework, deep-rework, deep-descent, bells, lance-support, keep-rework, reef-hulk, reefmaw-land, longwater-river,
harbor-route, undercrown-variety, crown-exam, herald-pirate, normal-health, small-adds, lab-reach, boss-navigation, lab-clock,
combat-replay, weak-bosses. Mash: 0/6 on every re-stamped row (level first, then boss, via tools/mash-bot.mjs --write).
Two tests pushed back, and both were kept as written:
- salvage-captain asserts "a parried pin opens him 3 s". I had cut PIN_OPEN to 2.2; it is back at 3.0.
- boss-greed asserts "a mini hits GREED.miniHit (1.3x) harder" through damagePlayer. I had put a per-mini multiplier (MINI_HIT_X) on that path,
  and it went red. It is gone. Each mini's extra weight is now its own move numbers (the Reeve's DMG keys, LANCER_MINI_HIT inside
  updateLancer, SALVAGE_HIT on the numbers main.js passes in), and miniHit still comes on top of them. boss-greed is green again.

## Environment notes
- C: hit 0 bytes free mid-run: leaked headless-Chrome profiles in %TEMP% (bracken-look-*, ~30 MB each, 466 of them). I removed the ones
  untouched for more than 2 hours (131 the first time), which freed about 5 GB. It is worth a follow-up in tools/browser-profile.mjs.
  The profiles leak when a run is killed or a browser fails to start.
- Two boss-rates runs died on "could not reach the browser" under load; both were re-run.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Salvage Captain's new opening (the cargo run).** Rec: keep it. Before, his only way in was a parried pin, so a hero with no shield
   could only chip him for four minutes (pyro 0/4 timeouts). Built: CARGO_OPEN 1.0 s, told THE ROPE RUNS: STRIKE.
2. **Waymeet Paladin: pyro 100%, warden weak.** The pyro stands off out of his sword's reach. More health only takes the warden to 0.
   Rec: give him a real answer to range (a told gap-closer) in a small design lane. Built: judgement oftener at range, hp 2000 (72%).
3. **The Diving Bell's leap now hits only on the way down,** on the ring he draws. Rec: keep it; a body you pass under on its way up was
   an unreadable hit. Built.
4. **Minis that hit harder than their kind** (the Serjeant x1.7, the Salvage Captain x1.4, on top of every mini's x1.3). Rec: keep them.
   They are named duels, and at x1.3 alone the bot won 100% of them. Built: as each mini's own move numbers, so the global x1.3 rule and its
   test are untouched.
5. **Hero spread.** Several rows are 4/4 for one hero and 0-1/4 for another: harbor and waymeet for the warden, causeway for the pyro.
   Rec: a hero-balance pass rather than per-boss health. Built: tuned to the band with no hero at 0 where I could; waymeet's warden is
   3/6 at the shipped health.

# Addendum: THE WAYMEET PALADIN'S GAP-CLOSER (the Paladin gap-closer lane, 2026-10-06; Daniel approved Q2's rec)
Port 8679, jobs 2. Rates from `PORT=8679 node tools/boss-rates.mjs waymeet --ways=practiced --seeds=N --jobs=2` (profile human, campaign L22).

## The move: THE LEAP (B5: from the paladin hero's own kit, his HAMMER LEAP)
- **When:** he is stalking and you have stood past his sword's reach (more than 110 px) for 0.8 s (0.6 s in phase two). Cooldown 6 s / 4.5 s.
  He picks it only from his stalk, so it is one windup at a time like his other moves. In his reach he never leaps; the test checks this.
- **Told:** sound (charge + heavy, then a whoosh as he goes), word (HE LEAPS: GET OFF THE RING, a hint-box line, with the red !!), colour (a RED RING on the floor under you).
  The ring is dashed while it follows you. It turns solid and stops 0.3 s before he jumps. He is in the air for 0.6 s and lands blade-first
  on the ring. The landing is unblockable (26).
- **Answer:** be off the ring when he lands: step or roll (marks.js ANSWER `dodge`, HEIGHT `low`; MARK `!!` is written by tells.mjs).
- **B2, his punishable recovery:** if he lands on nobody, the blade is in the ground. The ward is down for 1.5 s right beside you, shown by the
  green ring and HE OVERREACHED: STRIKE (both words are hint-box teaching lines in src/hint-lines.js). Then the ward rises, as after a break (B3). If he lands on you, he is up again in 0.7 s with the ward still up.
- **The stopgap is gone:** judgement no longer comes oftener at range (it was every 6 / 4.5 s at range; it is back to 8.5 / 6). The leap is his answer to range now.
- Numbers: `PAL_LEAP` (next to drawPaladinMarks) and `palLeap` in the sweep2 DMG block. tools/paladin-enrage.mjs has new assertions for the leap:
  it waits for you to linger, it is told, the ring follows and then stops, a whiff opens him and the ward rises after, a landing on you is unblockable, and he never leaps in reach.
- **Bot (v2 only; the legacy hands are byte-identical):** it waits out the following ring. Once the ring stops, it leaves it, away from him unless
  a wall is there. It rolls the last of it if it is still on the ring as he comes down. A whiffed landing is then just an open boss for the open hands.

## What the measure says (the finding)
- **The human-profile bot never stands out of his reach.** Its stand point for him is 42 px, inside the 66 px cut, so the leap fired 0 times in
  the standard measure. **The pyro's 100% is not range.** Her roll through his cut and thrust breaks the ward nearly every time: she took 0-102
  damage in 34-90 s fights.
- **A pyro that does stand off** (a probe that was not committed: her stand point moved to 150 px, 6 seeds) went **0/6 without the leap.** She could not
  open him: 2 timeouts and 4 deaths to the bash, with 0-4 openings in a fight. **With the leap she went 4/6.** That was 127-230 s fights, 89-213 damage taken
  and 12-18 openings, most of them his whiffed leaps. So standing off is no longer a stall and no longer free. It is a real plan with a real cost.
- **Health:** 2000 gave 4/6 3/6 6/6 = 72%. 2300 gave 3/6 0/6 6/6 = 50%, with the warden at 0. **2150 shipped: 6/12 2/12 12/12 = 56% (n=36), in band, no hero at 0.**
  The warden is thin (2/12) and the pyro is 12/12.
- Mash: waymeet re-stamped via tools/mash-bot.mjs --write, the level first and then the boss: the boss is 0/6 and the mini is 0/6.

## QUESTIONS FOR DANIEL (gap-closer lane)
6. **The pyro is 12/12 on the Paladin by rolling through his sword, not by range.** Rec: put the roll on the beat the way the guard is (palOpened:
   a roll opens him only if it starts in the last PAL_BEAT of the swing, as a raised guard must). Then raise his health and let the warden back up.
   That changes a hero's answer and the "roll opens him" rule, so it is your call. Not built.
7. **The leap's whiff opening (1.5 s) makes standing off a viable plan.** A standing-off pyro went 0/6 before and 4/6 now. Rec: keep it. It is told,
   it costs her hits, and B2 wants his whiff punished. Built.

## Checks (gap-closer lane; green)
tells (the MARK table re-written by tells.mjs --write: closedhelm|leapTell !!), answer-tags, boss-read, boss-greed, boss-openings, boss-fight-end,
hint-shown, weak-bosses, textfit, paladin-enrage (with the new leap assertions), waymeet-cleanup; mash-bot --assert waymeet (boss 0/6, mini 0/6).
tells still lists the Scalder's two unmarked windups (pourTell, ladleTell). That is not from this lane: it was there before the change and it is not a failure.

# Addendum: THE PALADIN'S ROLL ON THE BEAT (2026-10-06, Daniel approved Q6)
- **Built:** a roll through the Paladin's cut/thrust breaks his ward only if it STARTED within `PAL_ROLL_BEAT` (0.2 s) of the blow (the roll's age at the blow is `P.dodgeMax - P.dodge`). An earlier roll passes through him and opens nothing, and says TOO SOON (`ROLL_SOON` in src/boss-read.js). A late roll shows the gold open as before. tools/paladin-enrage.mjs asserts both.
- **Finding:** the roll's whole length is 0.30-0.34 s and its untouchable part 0.26 s, so a roll that covers the blow was already within `PAL_BEAT` (0.45 s); a literal "last PAL_BEAT" changes nothing. I used 0.2 s, the tightest window that is still not a frame-perfect tap (the knight's old 0.1 s guard was the thing the guard beat was widened to fix). Even so the bot (v2 and human rolls at modeT < 0.1) is in the beat, so **the pyro stays 6/6** (probe, 6 seeds, damage taken 0-126). The rule bites only a roll made 0.2-0.26 s early. It teaches the beat, but it is not what holds the pyro at 100%.
- **hp unchanged (2150).** Raising it with the pyro still 100% would only push the knight down. Standing rates: 6/12 2/12 12/12 = 56% (n=36, from the leap lane); no new 36-fight run (the machine was loaded, one fight took minutes).
- Mash: `mash-bot --assert waymeet` holds (boss 0/6, mini 0/6); rows not changed, so no re-stamp.
## QUESTIONS FOR DANIEL (roll-beat lane)
8. **To really pull the pyro into band the roll beat must be ~0.1 s, or the roll's free window must shrink.** Rec: shorten the pyro's roll untouchable part against him only (a held roll that starts before the flash is hit in its tail), or give the Paladin a second swing (a follow-up cut after a roll) so a roll costs her. Not built; it changes the pyro's kit.
## Checks (green)
tells (only the Scalder's two unmarked windups, pre-existing), answer-tags, boss-read, boss-greed, boss-openings, boss-fight-end, hint-shown, paladin-enrage (with the roll assertions), mash-bot waymeet.
