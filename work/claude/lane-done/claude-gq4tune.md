# GQ4TUNE (11-11/12 overnight) - branch claude/prepgq4, worktree bracken-prepgq4. NOT merged, NOT deployed. Flags GQ4L/P/Q_SHIPS still FALSE.
Tip: see `git log -1` on claude/prepgq4 (pushed). Base = prior tip 6487c3c0b + merge of origin/master b7c896ff7 (clean, no conflicts; eb5558861) + 4 WIP commits. Method = demotune's: boss-rates, human profile, WITH flasks (kit), practiced bare build, L21, knight/warden/pyro, ONE headless, flags ON by env.
## Preflight (item 0), OFF then ON: untold-told, dangling-paths, crown-route all exit 0; modulepreload --write: no diff. mark-integrity exit 0 both, BUT memguard killed a leaking page (11-11 22:01, 3.2 GB) and 37-42 boss rows read SKIPPED (page crashed); none are gq4 rows - gprincess + gqueen marks all read 'seen/landed/posed'. No feature-caused red.
## BEFORE (merged base, flags ON, n=6/hero = 18): Princess 2/18 = 11% (kn 0 wa 2 py 0). Queen 7/18 = 39% (3/1/3). (Prior lane's 56%/42% was on the older base.)
## ROUNDS (every table kept; raw logs scratch/gq4t/*.log, json work/claude/tune/gq4t-*.json). n = fights, kn/wa/py wins
Princess (crown:mini, band 70-80):
 P1 ads 3->2 (bw.addN), gate maxAlive 3->2, failsafe 30->20: 7/18 39% (2/2/3). '?' dmg (the ads) 103 -> 96 a fight
 P2 + addN 1, failsafe 15, tiara 18->14, flurry 13->11: 12/18 67% (2/5/5); '?' dmg 96 -> 6
 P3 + trinket 7->6: 14/18 78% (4/5/5) -> written to code
 CODE CONFIRM n=12/hero: 27/36 = 75% [59-86] (kn 8/12 wa 11/12 py 8/12)  IN BAND
Queen (crown, band 60-70):
 Q1 P1 portal shard 10->8 + crown 16->13: 10/18 56% (4/3/3); hall deaths 5 -> 2 (levers move P1; the P2 levers below did not)
 Q2 P2 dmgK 0.6->0.55 + volley dmg 4->3: 7/18 39% (3/1/3)  NO MOVE (matches the desktop lane: the P2 wall is kill speed, not damage taken)
 Q3 P2 chip 0.4->0.5 + shard 5->6%: 8/18 44% (4/2/2)
 Q4 Q1+Q3: 12/18 67% (5/3/4) -> into code; n=12/hero from code: 20/36 = 56% [40-70] (8/6/6)
 Q5 + P1 dmgK 0.65->0.55 (n=12): 19/36 53% (8/5/6) NO MOVE -> reverted
 Q6 P2 hp 1200->1000 + shard 6->8% (n=12): 24/36 = 67% [50-80] (7/6/11) -> into code
 CODE CONFIRM from the committed values (no lever), n=12/hero: 24/36 = 67% [50-80] (kn 7/12 wa 6/12 py 11/12)  point IN BAND; pyro far above knight/warden
## KNOBS (all flag-ON only; flag OFF = master, checked by gq4p/gq4q/gprincess/gqueen3/gq2mech OFF = exit 0)
- src/bell-winch.js:77 ADDN.n 3 -> 1 (ALL GATES adds; seats still add +1 each)
- src/goblin-princess.js gate: maxAlive 3 -> 2, failsafe 30 -> 15 (:~46); flurry.dmg 13 -> P4?11:13 (:26); trinket.dmg P4 7 -> 6 (:27); tiara.dmg 18 -> P4?14:18 (:32)
- src/gq4q.js Q4N.p2: chip 0.4 -> 0.5 (above the 0.4 floor, = GQ3's own 0.5x), shardPct 0.05 -> 0.08, hp 1200 -> 1000 (GQ3.hp2 follows)
- src/gqueen-hands.js:38 (inside `if (Q4)`): GQ3.portal.dmg 10 -> 8, GQ3.crown.dmg 16 -> 13
- pins restamped: tools/gq4p.mjs:62 (capped at maxAlive 2), tools/gq4q.mjs:18-19 (chip = Q4N, shard 8%)
## DECISIONS: Princess/Queen targets, shard-knockback P2, gates mechanic, +1 attack, resist floor all kept. DEVIATIONS TO NOTE: shard hit is now 8% (Daniel said 3%; gq4tune-d already moved it to 5%) and daze is 4 shards/10 s (Daniel said 6; inherited, untouched) - the P2 bar only drains through shards; the desktop lane measured the Queen at 0% on the original numbers, and I did not re-measure 3%/6 (untested, not proven impossible). Queen P2 bar 1775 (master) -> 1000. Princess add count is 1 not 4 (plan): the lab bot kills 0-1 of the adds, so the add phase is bot-limited; a real player kills them faster, so the live Princess rate may be a little HIGHER than 75%.
## PROOFS (flags ON, exit 0 unless noted)
gq4l-shots 18 stills, errors []; gq4p-proof pins + phase (failsafe 15 s hits, ph 2, pirouette stand/jump both told, lost 0), errors []; gq4q-proof A (all 9 heroes knock P1 shards out / send P2 shards home), B (daze + ward + rage once), C 10 stills, errors []; boss-openings exit 0; textfit boss hints plates exit 0 (OFFSCREEN 4/COLLIDE 1 = rookery + fallingtower, not crown); crown-route exit 0; node: gq4p gq4q gprincess gqueen3 gq2mech gobgeo queen-stair crown-exam exit 0.
RESTAMP (crown, ON hash b3f7f7a78937, written to docs/level1-pilot.json, level1-curve.json, mash-bot.json): level-quality crown, curve-gate, mash-gate green after. !! WARN: pilot hits 31->37, deaths 0->4; curve deaths 3->7, hits 68->82, lostPct 205->256 (both seeds agree: real); mash knight 3->5, pyro 3->5 deaths. The new crown level is clearly harder for the bots than master's; LOOK before shipping. These stamps match the ON hash only: with the flags FALSE (as committed) the crown stamps read STALE in level-quality/curve/mash until the flip.
Stills (12, PNG): scratch\lane-reports\gq4tune\ (l1-5 level, p1-3 Princess, q1-4 Queen).
## NOT RUN / NOT VERIFIED: full suite/check.mjs; real-player walk of the 7-storey tower + outside face (lab skips it; est 105-140 s) ; co-op rates; built-way and first-attempt rates; boss-fight-end, hint-shown, gq3-page, combat-replay, demo-impact; mark-integrity rows lost to the page crash (not gq4); GATE-RUNNING.flag on disk is stale (11-10 batch158) - I ignored it as briefed. Hero spread is wide (Queen pyro 11/12 vs warden/knight 6-7/12; Princess warden 11/12): no hero at 0, but n=36 CIs are +-15.
## VERDICT: Princess SHIP (75% in 70-80, CI 59-86). Queen SHIP-IF-WANTED (67% in 60-70 at point, CI 50-80, rests on the 8% shard and 1000 bar). FEATURE (level + Princess + Queen, one flip): DO NOT SHIP YET - owed: Daniel's OK on the shard 8%/daze 4 deviations, a human walk of the tower, a look at the pilot/curve WARN, then flip the 3 flags (gq4l.js:6, gq4p.js:5, gq4q.js:5) and re-run the restamp check + the suite.
## QUESTIONS (rec first): 1 Accept shard 8%, daze 4, Queen P2 bar 1000? REC yes (3%/6 not re-measured here). 2 Princess adds 1 (+1 a seat) instead of 4? REC yes (add damage was 1/3 of her kill budget). 3 Pilot deaths 0->4 on the level: tune the level or accept? REC a human walk first; the boss tune is independent. 4 Restamp again at the flip? REC yes (hash-bound).
