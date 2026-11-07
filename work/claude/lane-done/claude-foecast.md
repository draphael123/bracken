# FOE CAST lane (claude/foecast) - audit, cast pass, lint. 11-05, code-only (no browser). Off master 42a1d4cd.

## 1. AUDIT (tool: `node tools/foe-cast.mjs`; counts ents + ambush waves + rung-bell garrisons; a reskin counts as its own kind)
Road order, before the Goblin Queen (GQ = HIGHCROWN, depth 21). generic = sprig/archer/shield/pike/brute/hound/plain rockgoblin.
| level | foes | kinds | generic | verdict |
|---|---|---|---|---|
| wood / hornetsnest / marsh | 62/43/73 | 12/8/12 | 32/0/21% | fine |
| fenroad (demo) | 51 | 9 | 53% | sprig15 shield7 - post-demo |
| stockade (demo) | 58 | 12 | 74% | archer13 sprig12 shield6 hound6 - post-demo |
| spore / burning / rootway | 50/60/63 | 13/13/13 | 42/50/11% | fine |
| underleaf (demo) | 47 | 8 | 85% | sprig18 rockgoblin10 - post-demo |
| palisadewood (demo) | 60 | 10 | 90% | worst; its own foe is only the hornsman - post-demo |
| kings (demo) | 61 | 16 | 62% | the King's court is camp goblins - post-demo |
| scree / hanging / spire / moor | 87/41/67/44 | 14/14/14/15 | 31-37/32/18/23% | ok (scree left as is, see owed) |
| rookery / skyroad / oreroad / minecart | 54/28/78/60 | 9-14 | 0-21% | ok |
| **storm** | 72 | 17 | **67%** | shield14 archer10 pike8 sprig8 - FIXED to 58% |
| undercrown | 51 | 13 | 0% | ok (reskins) |
| **kitchengate** | 37 | **8** | 46% | sprig14 of 37, thinnest cast - FIXED (10 kinds, 27%) |
| crown (GQ) / warcairn | 79/34 | 18/9 | 16/9% | ok |
Past the Queen: 0 bare living goblins (harbor, shelved, is the one exception: horn x2). Desert levels are thin by kinds (caravan 7, glasssea 7, buriedcity 6) but reskinned, so they stay.
One-level wonders before the Queen (interesting goblins): chief@stockade, hornsman@palisadewood, snuffer@hanging, sailer@moor, gaffer+sheargob@oreroad, scalder+stormshaman+lance@storm, temperer@crown, berserker@warcairn. Spread now: thief 6 levels (was 3), sapper 6, burngob 3 (was 2), gobmage 2.
Finding: the generic overuse is almost entirely the DEMO levels, which demofoes already passed. The non-demo road is mostly fine; only Stormhold and the Kitchen Gate were generic/thin.

## 2. CAST PASS (data only: new `src/cast-pass.js`, a last-but-one build wrapper like variety-pass.js; 2 lines in level.js; hand-written builders untouched, so no conflict with other lanes)
Rows swap PLAIN foes only (no elite/sleeper/answers/fire/cutter ents), like-for-like threat:
- kitchengate: 5 sprig -> thief (larder thieves), 2 rockgoblin -> burngob (a cook already alight). 8 -> 10 kinds, generic 46 -> 27%.
- storm: 2 sprig -> thief, 2 archer -> gobmage, 1 pike -> sapper. Generic 67 -> 58%. (Taught shield/pike/brute lessons and gate fights are untouched; shield14 stays the bulk - that is the level's lesson.)
- hanging: 2 sprig -> thief (village cutpurses). 
Difficulty (tools/curve.mjs index): kitchengate 85 -> 91, storm 146 -> 153, hanging 103 -> 106 (mostly the kind-count term; threat sums +0/+3/+0). Curve verdicts unchanged. level-quality: storm still misses `bands` (terrain, same on master); hanging clears; one-new-foe, sprinkle-cap, spawns, foe-footing ok; goblin-lint ok.
Scree: a trial row (3 sprig -> thief) made its pilot + mash rows stale (scree is GATED) so I REVERTED it; not needed.
POST-DEMO (not done, proposals; demo levels untouched): underleaf sprig -> snuffer/miner (candle tunnels; assassin is already its own); palisadewood pike/hound -> sapper, burngob, horn, miner (siege crew); stockade archer/sprig -> thief, scalder on its towers; kings -> berserker/gobpriest/gobmage/sentry (a court, not a camp); fenroad sprig -> thief/snuffer. Each is a CAST_SWAPS row; then lift the GENERIC_OVER ceiling in the lint.

## 3. LINT: `node tools/foe-cast-lint.mjs` (+ `tools/foe-cast.mjs`, the table)
Fails on: (1) any bare living goblin past the Queen in ANY level (ents + ambush waves + alarm garrisons; GOB_OK = harbor only; bone and reskinned are fine) - stronger than goblin-lint, which only reports levels outside its FIXED list; (2) generic share > 60% in a pre-Queen level of 20+ foes (the four demo levels carry ceilings at today's value so they cannot get worse; reasons in the file); (3) < 8 kinds in a 30+-foe level (desert 3 listed); (4) a CAST_SWAPS row that finds fewer than `min` targets. Reports one-level-wonder goblin kinds. Negative-tested (cap 40% fails fenroad/spore/burning/storm). Not wired into tools/check.mjs (told not to run it): add `foe-cast-lint` to the suite list at merge.

## OWED
- kitchengate is GATED: its level1 pilot + mash rows are now stale (level-quality FAILs pilot, mash). Browser lane: `node tools/level1-pilot.mjs kitchengate --write` and `node tools/mash-bot.mjs kitchengate --level kitchengate --write`. Storm/hanging are not gated. (Alternative if you want zero browser work: drop the kitchengate rows.)
- add foe-cast-lint to tools/check.mjs list. No bestiary/art needed: thief, burngob, gobmage, sapper all already exist.
- Watch: today's grubhook/Kitchen Gate lane edits kitchen-gate.js; my rows key on kind (not column) so they survive, but its pilot re-run should happen after both land.

## NOTES FOR MONASTERY 3 (cast)
The Monastery (spire) cast today: fledgling12 harpy12 gobpriest9 rockgoblin8 bat7 sentry5 gobmage3 sprig4 troll2 (18% generic, 14 kinds - already the best mix). Unused-in-it goblin kinds that fit a goblin-held monastery without new code: snuffer (chapel candles; hanging/undercrown own it), scalder (stair tops; storm), hearthgob asleep in cells (kitchen/storm/crown), berserker shut in a cell (warcairn only), thief (vestry), bellringer/thurifer skins (church, but that is AFTER the Queen so keep to the monastery's pre-Queen sprites). Keep priests as kill-first support with sentries on the bells; avoid more rockgoblin/sprig.

## QUESTIONS (rec first)
1. Re-run kitchengate pilot+mash in the next browser window (rec yes) vs drop its rows.
2. Do the post-demo cast rows for the five demo levels after the demo ships (rec yes, one small lane, same mechanism).
3. Raise GENERIC_MAX tighter (rec 50%) once the demo levels are passed.
