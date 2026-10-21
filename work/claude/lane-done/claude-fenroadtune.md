# claude/fenroadtune (sonnet) - Fen Road tune: Bog Troll length, level weight, walker-change check
Base claude/fenroadart 174839f9. PORT 8785. Helpers in work/tmp-fenroadtune/ (uncommitted: rates.sh, logs, walker json). Not merged, not deployed.

## CHANGES
1. src/bog-troll.js BT: hp 720 -> 680, rest [0.7,0.55] -> [0.5,0.4], swim [0.9,0.75] -> [0.6,0.5], stuck purse cap 0.17 -> 0.20. Burst/drag/hurl damage unchanged (a trial with damage 28/18/18 and hp 600 gave 36%; hp 620 alone gave 72% but wins stayed ~100 s: the length is the cycle, not hp).
2. src/fen-road.js (weight where the verb lives, no new foe type): shield on the boards after the first bowed section (25,17); archer on the lashing-crew plat (59,13); shield at the far end of lashing 'e' (141,17); a shield after bowed section 'k' (384,17); stilt-walker on the Stilt Posts landing (314,17); wasp (262,12); spitter on deck 266 (267,15); spike goblin on the last deck (297,16). A shield on the top lookout crib (239,9) was tried and REVERTED (walker stuck at the lookout walk).
3. docs/level1-pilot.json, level1-curve.json, mash-bot.json (level + boss rows) re-stamped (hash bafebbf598eb -> new).

## 1. BOG TROLL (profile human, campaign L3, kit flasks, tools/boss-rates.mjs)
| run | knight | warden | pyro | total | win length |
|---|---|---|---|---|---|
| before (fenroad lane, n=12) | 8/12 | 7/12 | 7/12 | 61% | median ~110 s |
| FINAL (hp 680, tight cycle), n=12 | 11/12 | 5/12 | 7/12 | **64% in band** | wins median **90.7 s** (69-158), deaths median 90 s |
| other six, n=8 | pirate 3/8 (before 0/4), berserker 6/8 (before 1/4) | | | 56% | berserker wins 73-112 s |
- Nobody walled: pirate 3/8 and berserker 6/8 - the earlier 0/4 and 1/4 were small-n noise plus the longer cycle (the pirate's losses end at 2-36% boss left). No hero-specific fix needed; no bot-hands change.
- Dry (human+dry, n=6 each): 5/6, 2/6, 3/6 = 56% (reported only). Mash boss row re-stamped: 0/6 (boss left 88-91%). B15 floor intact (bog-troll check 39/39: hide 0.4, ward 0.4, stuck x2 purse 0.2). All 9 heroes still route (reach-heroes ok).
- Noise is +-15% at n=12; one more 12-seed pass of the final is worth doing at integration.

## 2. LEVEL WALKER (tools/level-walk.mjs, campaign L3, human+first, 2 seeds x 9 heroes)
| | deaths / run | mean arrival (9 heroes) | stuck-free coverage |
|---|---|---|---|
| before (1 seed) | 0.0 | ~70% (45-93) | |
| after adds, 2 seeds (w1: first draft; w2: final layout) | 0.28 (5/18) in w1, **0.11 (2/18) final** | w1 ~51%, **final ~62%** (31-92; berserker/pirate/knight 31-50) | 50-95% |
- The knight/pirate/berserker now arrive at shrines at 31-50%; sections that lost most: the work crews' exam and the palisade road (65-199% hp lost a section in the weakest runs). Combined over three drafts (54 runs) 9 deaths = 0.17/run - STILL UNDER the act I target 0.5-1.5. The heroes that die are the geomancer/warden/pirate (4 of 5 first-draft deaths at the shield + bowed section 'k', 372-387).
- Why not more: the walker has flasks, shrines and a typical build; with the pilot at 114-128% hp lost a run (band 40-250%) and the curve row at 0-1 deaths, more foes here would push the level past act I while the weight is already in the hp (arrival), not the death count. REPORT/QUESTION 1.
- The walker's STUCK spots (not measured sections) are bot limits seen on baseline too: 202/208,17 (after the elite), 229,15, 244/250,7 (lookout walk), 35,17 / 52,19 / 55,17 (peat pit), 126,17, 381/399,17.
- Kept: LQ PASS (19 encounters, 14 heavy, 3 roles, density 1.13), solid-islands 0, visible-supports fenroad 0 of 37, signs (no text changed), checkpoint spacing 94-105 route tiles, curve row 114% hp / 0 deaths, pilot 128% hp / 0 deaths.

## 3. THE SHARED WALKER CHANGE (swimmer jumps out of water, tools/level-walk.mjs swimTo) vs master - knight/warden/pyro, 1 seed
(the master line was run from a copy of master's level-walk.mjs; everything else equal)
| level | master | with the change |
|---|---|---|
| **marsh** | knight 4 deaths, arrival 96%, measured 25% of route; warden 1 death, 88%, 15%; pyro 2 deaths, 35%, 29% | knight 0 deaths, 44%, **75%**; warden 1 death, 71%, 40%; pyro 1 death, 50%, 40% |
| **longwater** | knight 75%/45%; warden measured 2%; pyro 74%/42% | knight 92%/42%; warden 0% (locked); pyro 80%/42% (+1 death) |
| **deep** | identical (STUCK 42,29 / 58,42, meas 1%) | identical |
- So the change DID move other water levels' numbers: marsh (the Fen Road's neighbour) measured much more of the route (25% -> 75% for the knight: the old walker got stuck in the fen and the 4 deaths were that), longwater's arrival numbers drift +-17 pts, deep unchanged. The walker is REPORT-only for these levels (curve-gate walker rows are report-only; nothing in a gate reads them). Recommendation: keep the change (it fixes a real walker limit), and re-read marsh/longwater/flotilla walker rows at the next act I/II sweep.

## CHECKS (PORT 8785, one Chrome at a time) - GREEN
fen-road 56/56, bog-troll 39/39, level-quality (all gated levels clear, fenroad ok incl. re-stamped pilot/mash), solid-islands, visible-supports fenroad 0/37, signs (1004 fit), curve-gate (48 levels, 0 out of band), mash-gate (48 hold), checkpoint-gaps, one-new-foe, boss-greed, reach-heroes, floaters, deadends, collectables, elites, spawns, killzones. textfit: no text changed (not run).
## REDS / NOT RUN
- curve-gate lists "stale" curve rows for other levels (spore, scree, hanging ...) as not measured - pre-existing on this base, not fenroad.
- Not run: full suite / QUICK gate, mobile-perf for the extra foes (fenroad foes +8: a handful of walkers/shields/wasp).

## QUESTIONS FOR DANIEL (rec first)
1. Walker deaths on the Fen Road are ~0.1-0.3 a run (target 0.5-1.5) though arrivals are 31-92% (the bot arrives with flasks). REC + BUILT: accept (act I is soft by design; Daniel plays it live). ALT: one more elite (a second shield captain on the Palisade Road) - would add deaths, push the pilot toward 150%.
2. Troll fight 90 s at 64%: REC + BUILT. ALT: a shorter ward (3 s -> 2.5 s) if he reads as fiddly.
3. Water-level walker rows (marsh/longwater) move with the shared swim fix: REC keep, re-read at the next sweep.
