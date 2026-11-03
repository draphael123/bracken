# claude/geotune - GEOMANCER DEMO TUNE (11-02)
Branch claude/geotune (worktree bracken-geotune) = claude/jointtune139 c3e915f2 + tune commits. Tip d68f901e (pushed). Not merged, not deployed. No boss dials touched.

## CAUSE: BOTH (bot first, then numbers)
BOT: (1) the bespoke boss hands (hornet queen, battering beast, old tusker branches in src/lab.js) never called ULT_BOT, so the geomancer bot NEVER fired AVALANCHE (av=0 in every logged fight; only the generic boss path had the UP+C hook). (2) The board never reached 3: stones the bot raises (T3 pillar under/next to the boss) were crumbled by RULE 4 ("body inside") the moment the boss's tile-ignoring walk overlapped them (max standing 1-2, crumble reasons mostly "body"). A 'build the board at range' bot behaviour was tried and REVERTED: it kept her in a 1 s wind in the open and made Tusker worse (47 s deaths).
NUMBERS: even with Avalanche firing she dies at 60-110 s with the boss at 25-45% (damage taken 136 = her whole hp+flask; knight/warden win at 60-100 taken): she kills too slowly and her ward is expensive.

## CHANGES
1. src/lab.js: Avalanche UP+C spend added to the three bespoke boss hands (hornet queen, battering beast, old tusker; ground, no block/dodge/jump, not mid-swing).
2. src/geomancer.js: RULE 4 no longer crumbles a standing stone because a BOSS/mini body overlaps it after 0.4 s (GEO.bigBodyGrace; only ram/gnaw break it) - real game change: a board can stand beside a boss (rule 2 "stands until broken"). Common foes/hero/partner unchanged.
3. src/geomancer.js GEO: avalanche.boss 3.0 -> 5.0 (per boulder vs boss/mini); fault mul0 0.5->0.8, mulK 0.2->0.35, spikeMul 1.2->1.6 (the crack is her blow, and was the weakest heavy); ward hitSt 20->15, holdSt 19->14 (cheaper blocks, fewer GUARD BREAKs; geomancer.mjs floor is >=14), ward perfect 0.07->0.10 s (knight's is 0.11).
4. src/main.js swordDmg geomancer 14 -> 23 (was 13->14 in heroestune). All skill/crack/Avalanche damage scales off it.
5. Instrumentation (tools/boss-run.mjs geo column): av, ms (max stones standing), fu (secs full board), cr (crumble reasons); src/geomancer.js stats maxStand/fullT/cr.

## RATES WITH FLASKS, human profile, practiced, campaign kit, normal (geomancer only)
| boss | BEFORE (jointtune139, n=6) | AFTER (final tip) n | band |
|---|---|---|---|
| Old Tusker (wood L3) | 1/6 (0-2/6 over rounds) | 7/12 = 58% | in |
| Battering Beast 3 (palisadewood L8) | 1/6 (0/6 baseline) | 9/12 = 75% | edge/slightly high |
| Hornet Queen (hornetsnest L3) | 2/6 | 11/12 = 92% | HIGH (hero is no longer the weak one) |
| Fen Road (Bog Troll, old) sanity | 4/6 (heroestune) | 6/6 | high |
| Marsh (Frog King, old) sanity | 3/6 | 3/6 | in range of noise |
| Stockade (Chieftain, old) sanity | 3/6 | 6/6 | high |
Tusker is noisy: batches of 6 read 5,2 (final), and 3,1,2 / 4,2,2 at the dmg steps tried (21: 6/18, 23: 8/18 with a looser ward). Steps: dmg 18 + ward -> Tusker 1/6 Beast 2/6; dmg 20 + fault -> Tusker 4/12 Beast 6/12 Hornet 10/12; dmg 23 -> Tusker 8/18, Beast 9/12.
Total ~190 fights; logs in the terminal only (rates are seed-deterministic: SEED0=0/6/12).

## TESTS
GREEN: tools/geo-board.mjs, tools/hero-trials.mjs (all 9 yards), tools/geomancer.mjs (ward floor kept >=14), node --check on lab.js/geomancer.js/main.js. Restamp: no hash/curve rows moved by my files; restamp --all --dry lists only the pre-existing stale rows. NOT RUN: full suite, textfit, mark-integrity, perf, level restamps for geomancer pilots (geomancer-pilots.mjs) after the damage 14->23 jump (OWED: pilot/curve/mash rows that use the geomancer may read easier).

## QUESTIONS (rec built)
1. Geomancer now 92% on the Hornet Queen and 100% on Fen Road / Stockade (old versions): she over-corrected on the easy bosses. Rec: keep, and nudge BOSS_TRIM hornetqueen up a notch only if the pooled Hornet row (re-measure all 5 heroes) reads >70%. Alternative: dmg 21 (Tusker 6/18 though).
2. swordDmg 23 is a big jump from 14 (common foes die faster for her too). Rec accept for the demo; the alternative of boss-only damage needs a hero-vs-boss multiplier that does not exist.
3. Tusker stays the geomancer's hardest boss (her hands wind a 0.5 s crack in his reach). Rec leave; a Tusker-specific plan lane could lift it to ~65%.
4. RULE 4 relaxation (stones stand under a walking boss) is a design edit to geoid rule 4: rec confirm with Daniel.
