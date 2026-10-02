# claude/greenwire - JENNY GREENTEETH wired into THE FOG CANAL (Sonnet, base claude/canal 7ac77317)

## What changed
- Merged origin/master (batch53, 3fd06c78) into claude/canal: kept every check name (tools/check.mjs), every audio track and credit (canal.ogg plus the fair, musicswap and archmage:undead rows), the fair's juggler/watched rule beside the canal's fogSight rule; src/marks.js taken from master and the table regenerated (`node tools/tells.mjs --write`, 645 rows).
- Merged claude/lockkeeper (80de5c17, JENNY GREENTEETH) by hand onto the new base (10 files conflicted, all additive: every boss list, skip set, voice row, bestiary entry and hook now holds the Puppeteer, the Wicker Queen and her).
- Wired her into src/fog-canal.js section 7: `stageGreenteeth({set, block, plat: boards, ent}, T, TS, 376, 41)`; her pools and weed movers join the level's; `arena: jenny.arena`, `gateAfterBoss: true`; the level's end gate moved from inside her west door to the quay past her east door (x 420, row 40); the west-door checkpoint (375,40) stays (the one right before the boss door). The three-checkpoint rule is unchanged: 152 route tiles per checkpoint in level-quality, worst walked gap under 200 (checkpoint-gaps).
- DELETED the hidden `greenlock` level (last row of LEVELS) and `buildGreenteethLock`; re-pointed to `canal`: tools/greenteeth.mjs (stage + page boot; it now asserts greenlock is gone), tools/boss-openings.mjs, tools/boss-navigation.mjs (the swim/climb row), tools/greenteeth-pilot.mjs, tools/greenteeth-shots.mjs. The canal check's old "her footprint is kept clear" assertions became "she is wired" assertions (arena, music, gateAfterBoss, one Jenny at sx+20, solid rows under the bed, both doors open at rows 35-40, checkpoint outside the west door, nothing else in the footprint, gate on the quay, her water and weed in the level). Her synth lament theme stays; the audio boss-music, Sound Test and audio-assets checks pass with the canal as her level.
- Boss rule: her openings were 1.8 s (stranded) and 1.8 s (flushed). Now 3.0 s each (the big one stays 3.0 s). To hold the fight length the damage multipliers moved x2.4 -> x1.3 (openings) and x2.8 -> x2.5 (the big one); outside an opening it is still x0.05. tools/boss-openings.mjs now asserts her stranded opening >= 3 s: proven red on the old values (it failed with `open: 1.8`), green after (`open: 3`). tools/greenteeth.mjs's three "windows are short" assertions became "3 to 3.6 s".

## Numbers (human-bot pilot, node tools/greenteeth-pilot.mjs, normal health, knight / warden / pyro, in the canal)
| openMul / bigMul | window | fights | wins | median win |
|---|---|---|---|---|
| 2.4 / 2.8 (before) | 1.8 s | 3 (seed 1) | 1 (33%) | 88 s |
| 1.5 / 2.8 | 3.0 s | 12 | 11 (92%) too easy | 87 s |
| 1.1 / 2.1 | 3.0 s | 12 | 7 (58%) | 97 s |
| 1.25 / 2.4 | 3.0 s | 12 | 6 (50%) | 96 s |
| 1.4 / 2.6 | 3.0 s | 12 | 11 (92%) | 108 s |
| 1.35 / 2.55 | 3.0 s | 12 | 5 (42%) | 103 s |
| **1.3 / 2.5 (built)** | 3.0 s | 12 + 12 | 7 + 9 = **16/24 (67%)** | ~100 s (wins 91-132 s) |
The pilot results are lumpy (the Pyromancer dies in phase 2 or with her at 1-6%; the Warden is the one that dies most), so 1.3 was picked from the band, not from a trend. The lockkeeper lane's own numbers were 2/3 on the standalone lock.

Mash bot (node tools/mash-bot.mjs canal --probe --write, then --level canal --write; cache in docs/mash-bot.json): boss mode, 3 heroes x 2 seeds at the expected hero level 21: 0/6 wins. At 150 s each is still alive but 49-65% of her health is left (chip x0.05 confirmed); given 420 s, knight, warden and pyro all DIE (boss left 57%, 57%, 15%). Level mode: knight/warden/pyro die (2 deaths, lowest hp 0%). So the mash bot loses, no GREED REPRISAL was needed. The pyro mash is the closest (15% left at death).

Level-1 pilot: docs/level1-pilot.json canal row refreshed (the level data changed): 69 blows, 9 deaths over 3 runs (was 65 / 6). level-quality: canal CLEARS THE BAR (all rows ok, including mash, pilot, music "canal; boss room greenteeth").

slopes-trace: canal's own trace changed (the walks now enter her chamber at x ~6204, the reserved footprint is built); `--rebase=canal` only. wood, kings, keep and burial are identical.

## Checks run (all green at the final commit)
canal, greenteeth, level-quality, boss-openings, boss-navigation, boss-fight-end (48 fights, hers included), theatre, harvest-fair, architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, slopes-trace (after the canal-only rebase), npc-removal, hint-shown, audio-assets, boss-music, soundtest, tells, elites, one-new-foe, signs, deadends, comments, homepaths, syntax. Not run: the full suite.

## UNVERIFIED
- Nobody has played the canal end to end with hands: the barge ride into her lock, then the fight in the canal's palette. The bots walk it (level-1 pilot 100% of waypoints) and fight it.
- The canal's own water systems (waterHurts, noWade) run beside her lock's pool; the page checks and boss-fight-end pass, but a hand test of falling off a gate walkway into her water, and of dying in the fight and respawning at the west-door checkpoint, is worth ten minutes.
- Paladin, pirate, reaper, geomancer have not fought her; two-player not tried.
- The pilot's lumpiness: 67% over 24 fights, but single configurations ranged 42-92%.
- Her look is still the lockkeeper lane's code-drawn art; the east quay past her door is bare (no foes by design, a theatre-road gate).

## QUESTIONS FOR DANIEL (recommendation built)
1. Pyromancer vs her phase 2 (flush) is the weak point (deaths at 43% left). Rec (built: nothing): wait for your hands; if short-reach heroes struggle, lengthen the flush window to 3.4 s rather than lower her health.
2. The 3.0 s windows with x1.3 means a hero who lands the whole window only does 3.9x one blow. Rec: keep; it matches the Puppeteer.
3. Should the quay past her east door get a final reward or a sign ("the theatre road")? Rec: no, the gate is enough; the next level is the Maskwright's Theatre (or wherever the road goes).
