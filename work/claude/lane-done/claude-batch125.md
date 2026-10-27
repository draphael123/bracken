# BATCH125 INTEGRATION (lane started 10-27 07:10; branch claude/batch125, worktree bracken-lanes/bracken-batch125, base master bf7a452f = BATCH123 LIVE)
Not merged to master, not deployed (BATCH125 deploys THU 10-29 via a later release lane). Pushed to origin/claude/batch125.

## Merged, in order (all --no-ff)
1. hurricane3art 21415538 (contains hurricane3 0d8ccae0 + 4b3369a3). CONFLICTS: src/main.js (5 hunks: TIER/TIER_BOSS + H2A line, reset tail, strike fan-out, mover draw, boss-state pads) -> token-level 3-way merge (scratch tool work/tmp-b125/tokmerge.mjs), both sides kept (master's FRH/RKH/FPK/HNS/kitchengate tails + hurricane3's H3H); tools/corpses.mjs (master's per-level sweep + ALL_IDS now has 'hurricane'); src/marks.js (generated MARK table only) -> took master's file, kept hurricane3's 3 hand lines (grapnel BY_HAND/ANSWER/HEIGHT) + braceTell THROWN, ran `node tools/tells.mjs --write` (1101 rows). Do NOT cherry-pick db156d63: not needed, hand lines came through the merge.
   + WAIST BELL (art only, src/redraw/hurricane3_art.js bell()): iron bracket + brass bell bolted to the galley's fore wall (x151, rows 33-35 solid), tolls with the flood-warning strokes; no tile/entity change. Stills work/claude/shots/batch125-bell/bellStill.png + bellWarn.png (seen, small; swing in motion NOT watched).
2. oreroadminor 4acc5b68: one conflict (main.js, one token: mover skip list now `m.rope || m.kg || m.kind === 'orecw'`). Contains LAUNCHED MINECARTS (src/ore-carts.js + art, 2 sections: Ore Store teach, Sorting Rail test; launch-only, never ridden) AND arrows + pyro flare light lamps. So priority line '!! 10-26 14:48' is NOT missing.
3. forgemaster a31ae3a9: conflicts tools/boss-fight-end.mjs (master restructured it onto sweepLevels; re-applied forgemaster's mini2 kind + PROG logic by hand), tools/elites.mjs (NO_KEEPER = master's list + 'crown'), main.js (tokmerge, clean).
4. smallfix3 b4279528: conflicts main.js (clean tokmerge), src/lab.js (kept master's line, re-applied `keyVerb` arg to motherHands), tools/fixtures/campaign-xp.json (took MASTER's: it is newer, batch123 road incl. kitchengate/rookery; scree row identical so the Ram Lord tune still holds). Ram Lord hp 6000, flasks 69%.
5. stormhold3art 4ce71239 (+ greybox d21df530): conflicts level.js/main.js/check.mjs (tokmerge clean), marks.js (THROWN has Captain + Lance rows merged by hand; MARK regenerated). tools/curtain-wall.mjs DELETED (accepted rec; src/draft/curtain-wall.js stays).
6. gormanim 96b7fcde: clean.
Also: WHAT'S NEW 125 in docs/updates.json (date 2026-10-29, 6 lines, whatsnew.mjs line rules checked statically only).

## Integration red found + fixed
- tools/signs.mjs: hurricane sign @282 ran to 3 lines. Shortened ('...STRIKE ITS CHAIN ONTO THE HATCH IRON.') in src/level.js. That changes the hurricane level hash (sign text is in the hash), so docs/level1-pilot.json, level1-curve.json and mash-bot.json hash were re-pointed BY VALUE (afceaf1c6eac -> 9d08ad294c10), not re-measured; only a sign string changed. level-quality hurricane CLEARS afterwards. Nightly/gate re-measure would confirm.

## Node checks (all in batch125, logs scratch/b125/*.log)
GREEN: level-quality (every gated level clears; ore road etc.), tells (431 tells, marks agree), dressing, boss-read, blow-tags, solid-islands, floaters, signs (after fix), spawns, traps, keys, killzones, collectables, deadends, elites, ambush-listed, ambush-reach, checkpoints, checkpoint-stand, checkpoint-gaps, goblin-lint, one-new-foe, sprinkle-cap, threat-holes, architecture, watchtowers, ore-road (incl. 16 cart checks), minecart (567), stormhold3, hurricane3, storm-ship, reach. node --check on main.js/level.js/marks.js/lab.js/check.mjs ok.
Not run (page checks, left for the gate/nightly): textfit, stuck runtime, reach-heroes, lance3, whatsnew, hint-shown, homepaths, boss-fight-end/corpses/mobile-perf, mash/pilot re-stamps. smallfix3 items to verify at the gate: Ksar console (createRadialGradient guard), tower-chase (x2, was not reproduced alone), Ram Lord boss-fight-end. Known from reports: stormhold3art corpses + boss-fight-end timed out (rerun at gate); Lance n=12 = 58% (rec re-measure n=18, nudge only if < 60).
One headless browser run by me: hurricane bell stills (RAM 4.8 GB free); PIDs in bracken-batch125\pids.txt (4888, 21368, both exited).

## GATE
NOT started (not after 18:00 - it was ~07:20; RAM was 4.9 GB, below the 6 GB rule). scratch\gate125.ps1 is READY: waits for hour >= 18 AND >= 6 GB free, then QUICK=1 release.sh --resume batch125 <7 branches> (they report 'already merged', checks run on bracken-batch125, log scratch\batch125-resume.log, check log bracken-lanes\batch125-check.log). No --deploy. Launch: `bash scratch/launch-detached.sh gate125.ps1` (any time; it self-waits). PID: none yet.

## Worktrees
df before 88% / 29-30G free; after 89% / 29G (my new worktree ~1 GB). Removed: NONE - every worktree whose HEAD is merged into master has untracked/modified files (rule: leave dirty). Dirty+merged (size): _kraken2-master 482M, batch98 864M, capsaudit 620M, castaudit 620M, fm-before 206M, follylib-base 289M, hangingpolish 1066M, heroanim 576M, kingsfix2base 959M (M src/gorm-hands.js), labkeys 1063M, palisade2 1068M, palisade2art 1077M, playfair 314M (M src/main.js), titleregion 599M, underleaf4 1081M, underleaf4art 1066M, underorder 1015M = ~13 GB if their scratch dirt (mostly work/tmp-*, shots) is judged disposable (needs `--force`). Unmerged clean (kept): artaudit, batch32, bcreview, bossaudit, botlr, canallight, croucha, crownreview, designaudit, flasksweep, lookfeel, monreview, reachcore-b81, towreview, visualaudit, plus the batch125 inputs (forgemaster, gormanim, hurricane3, hurricane3art, oreroadminor, smallfix3, stormhold3, stormhold3art - removable after BATCH125 reaches master). bracken-batch123b: rm failed (device busy), left.

## QUESTIONS FOR DANIEL (rec first; built)
1. Waist bell: added as art on the galley wall (rec yes; built). Is the look OK in motion? (stills only)
2. Hurricane sign shortened, hash stamps re-pointed by value (rec: accept; nightly re-measure confirms).
3. campaign-xp.json: took master's; rec run `node tools/boss-level.mjs --write-xp` once on the BATCH125 road after the gate (new levels Stormhold/Forgemaster/Hurricane may want rows).
4. ~13 GB of dirty merged worktrees: rec `git worktree remove --force` after a glance (all dirt looks like scratch); disk is 89%.
5. Ram Lord 69% flasks (top of band) kept as smallfix3 built.
