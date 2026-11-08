# ladder (11-08) - difficulty ladder tuning. DONE (pushed claude/ladder)
Branch claude/ladder = origin/claude/lives2 + diff3 merge (041d7f86f, HARD) + 3 tuning commits (tip 9ef9e8a5d). NOT merged, NOT deployed.
Method: tools/boss-rates.mjs --ways=built --heroes=knight,pyro --seeds=6 --jobs=1 --difficulty=<mode>, default STANDARD bot profile, kit flasks, one Chrome at a time. Rows: wood (Old Tusker), stockade (Chieftain), marsh (Frog King), kings (Gorm). n=48 a mode (n=95% about +-14 pts; a retune can move a mode 15 pts on noise alone). Logs/json: scratch\ladder\ (<mode>0 = before, <mode>1 = after).

## Win rates (wins/n, knight then pyro)
| mode | target | state | wood | stockade | marsh | kings | ALL |
|---|---|---|---|---|---|---|---|
| VERY EASY | ~90 | before = final (untouched, coordinator: 100% fine) | 5/5 6/6 | 6/6 6/6 | 6/6 6/6 | 6/6 6/6 | 47/47 = 100% |
| EASY | ~80 | BEFORE (take .75, others 1.18) | 6/6 6/6 | 5/6 3/6 | 5/6 6/6 | 6/6 6/6 | 43/48 = 90% |
| EASY | | AFTER = FINAL (take .85, others 1.12) | 6/6 6/6 | 5/6 5/6 | 4/6 5/6 | 6/6 5/6 | 42/48 = 88% |
| NORMAL | 60-70 | unchanged, reference | 6/6 5/6 | 4/6 3/6 | 3/6 5/6 | 5/6 4/6 | 35/48 = 73% |
| HARD | ~50 | BEFORE (diff3: take 1.18, others .90) | 5/6 0/6 | 2/6 2/6 | 4/6 3/6 | 2/6 3/6 | 21/48 = 44% |
| HARD | | AFTER run 1 (take 1.14, others .92), seeds 1-6 | 4/6 2/6 | 2/6 1/6 | 4/6 5/6 | 5/6 6/6 | 29/48 = 60% |
| HARD | | AFTER run 2, seeds 7-12 (4 fights errored, excluded) | 1/6 0/6 | 1/6 3/6 | 4/6 4/6 | 0/3 1/5 | 14/44 = 32% |
| HARD | | AFTER POOLED = FINAL | | | | | 43/92 = 47% |
| MASTER | ~35 | unchanged | 2/6 2/6 | 3/6 1/6 | 1/6 2/6 | 2/6 3/6 | 16/48 = 33% |
Ladder as measured: 100 / 88 / 73 / 47 / 33.
EASY pass 2 (take .93, others 1.07) was started and stopped after 20 s on the coordinator's call (it would make EASY near NORMAL for real players); reverted to pass 1.

## FINAL MODES (only these fields changed vs lives2+diff3; everything else as in diff3.md)
| field | VERY EASY | EASY | NORMAL | HARD | MASTER |
|---|---|---|---|---|---|
| take | 0.5 | 0.85 (was .75) | 1 | 1.14 (was 1.18) | 1.35 |
| stagger | 1.35 | 1.12 (was 1.18) | 1 | 0.92 (was .9) | 0.8 |
| parry | 1.4 | 1.12 (was 1.2) | 1 | 0.92 (was .9) | 0.8 |
| open | 1.35 | 1.12 (was 1.18) | 1 | 0.92 (was .9) | 0.8 |
Unchanged: poise, gap, flaskAdd, shrine, death, punish, phase, stale, affix. No boss HP, no NORMAL, no resist floor touched. Card blurbs are built from MODES: EASY "FOES HIT 15% LESS", HARD "FOES HIT 14% MORE".
Tool edits: tools/lives.mjs: the "halfway" asserts for EASY and HARD became "sits between its neighbours" (tuned off halfway); blurb string updated. tools/lives.mjs GREEN.

## Not measured / caveats
- Bots only (knight, pyro); warden skipped as too weak. Real players are weaker than the bots, so every mode is easier for the bot than for them; EASY at 88% on bots is meant to read lower for people.
- Built way only (no practiced/first). Other bosses, levels, and the hard-mode flask effect (-1 flask is invisible on this kit, base is already FLASK_MIN) not measured.
- n=48 a mode: HARD's two runs gave 60% and 32%, so ~47% pooled is +-10 and noisy; EASY 88% vs 80% is inside noise.
- Other check tools (difficulty.mjs, textfit, demo-cut, etc.) not rerun after the number change; only tools/lives.mjs.
