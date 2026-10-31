# claude/warcairn2tune - WAR CAIRN 2 TUNE (Sonnet)
**READY FOR BATCH.** Branch claude/warcairn2tune off claude/warcairn2art 56376c86. Not merged, not deployed. Level hash unchanged (warcairn 79d686debf12): no tile or entity moved.

## 1. The two flagged berserkers are real elites now
- src/main.js ELITE: new row `berserker: { name: 'THE WAR-RUNNER', hp: 8, own: true, mod: true }` plus the `updateElite` line (`return false`: his charge stays updateBerserker; the elite adds the 1.5x body, leash, gate and purse). mod, because a guard-by-angle does not suit a charger.
- src/elite-kit.js: AFFIX_AT `warcairn|berserker#1` SWIFT (yard, col 222) and `#2` UNSTOPPABLE (low line, col 298); TUNE `berserker: { dmg: 3.2 }`.
- Measured with tools/elite-lab.mjs (docs/elite-lab.json row written): first cut (hp 2) died in 2-10 s and the mash bot WON 2/3. Final: mash 0/6, human 6/6 (9/9 on the larger run), fights 15 s avg. The human win rate sits over the 75-85% report column, but the gate (mash must lose) holds.
- The third berserker on the ring seats (col 369) stays a plain runner (not flagged elite by the level). Art lane's elite mark is now true.
- Checks: elites.mjs (88 elites, all fought, gates open), sprinkle-cap ok (warcairn 33 foes, 24 hand placed), tells ok (428 tells), one-new-foe ok.

## 2. Chieftain rate (profile human, flasks kit, practiced, normal, campaign L21)
| run | kn | wa | ge | ra | be | py | total |
|---|---|---|---|---|---|---|---|
| NEW with flasks, seeds 7-14 (ranger s12-14 re-run after a hang) | 5/8 | 2/8 | 5/8 | 5/8 | 6/8 | 8/8 | **31/48 = 65%** |
| opus lane, seeds 1-6 (for pooling) | 5/6 | 2/6 | 5/6 | 3/6 | 5/6 | 5/6 | 25/36 = 69% |
| pooled | 10/14 | 4/14 | 10/14 | 8/14 | 11/14 | 13/14 | 56/84 = 67% |
| NEW dry (bare flasks), seeds 15-20 | 2/6 | 5/6 | 4/6 | 6/6 | 4/6 | 3/6 | **24/36 = 67%** |
In band 60-70% with flasks (n=48 and pooled n=84); dry also in band; no hero at 0. NO number changed. Warden is the weak hero (29% pooled), pyro the strong one (93%): a hero split, not an overall problem. Raw logs: work/tmp-warcairn2tune/r1,r2,r3,rd.log (untracked).
Tool note: one headless fight (ranger s12) hung the runner for 12 minutes on the first pass; I killed only my own node/serve/chrome PIDs and re-ran the remaining fights, which finished normally.

## 3. Level difficulty (fresh level-1 knight)
- Pilot re-stamped on the final tree: 23 hits, 4 deaths in 3 runs, walked 100% (the same 4 as before the elite change). The 46 stamped levels run from 0 to 19 deaths (median ~4; the 5 nearest-act levels: kitchengate 3, rookery 6, palisadewood 0, fenroad 3, hornetsnest 0). 4 is mid-field, so I changed no placements. The gorge bridge stays the one required hatchet throw.
- mash-bot --level warcairn --write: all three heroes lose or sit at 0% (deaths 2/2/1, 100% walked, 3 HELD rooms). mash-gate holds all 53 levels. level-quality warcairn CLEARS THE BAR. curve-gate has no warcairn row (acts III-V report only; never stamped) - not written.

## 4. xp / campaign rows
tools/fixtures/campaign-xp.json rewritten by `boss-level.mjs --write-xp`: warcairn row ADDED (run 1162, foe 584, boss 345, clear 350); three other rows drifted slightly on this base (not this lane's levels). The campaign level of warcairn stays L21 (rates stand), crown L21, kitchengate L20, rookery L14 unchanged.

## 5. Optional perf
Not run, not trimmed: the art lane measured 54-57 fps (4x CPU, mobile) at four points, so the start/summit +6 ms is nowhere near the floor.

## Checks (individual scripts, one browser at a time, port 6853, RAM >= 4 GB each)
warcairn.mjs ok; warcairn-probe ok (one flaky first run under load, then ok x3); elites ok; tells ok; sprinkle-cap ok; level-quality warcairn clears; reach-heroes warcairn 0 crossings (whole sweep 0 known crossings); mash-gate ok; stuck --static ok; boss-greed ok; leveling ok; one-new-foe ok; elite-lab berserker; pilot + mash re-stamped. Not run: full suite (by rule), textfit, mobile-perf.

## QUESTIONS FOR DANIEL (rec first)
1. The two elite berserkers are 8x a berserker's health at 3.2x damage, with SWIFT and UNSTOPPABLE. Rec: keep (mash loses, a human bot wins ~100% at 15 s). Alt: lift damage further to bring the human win rate to ~80%.
2. Warden sits at 29% on the Chieftain and pyro at 93% (the total is 67%). Rec: leave it (the total is in band, nobody is at 0); a warden-specific opening is a later hero pass. Alt: a small warden tweak.
3. The ring-seats berserker is a plain runner. Rec: keep (the brief asked for two elites).
