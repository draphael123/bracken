# claude-knbisect-d (branch claude/knbisect-d, from origin/master a7c067880; TRAITS_SHIP stays false; no merge, no deploy)
Question: which knight trait cut loses THE CRUSADER (waymeet, L30) with traits on? ANSWER: **BLEED** (OPEN WOUND, a 3 s damage-over-time on every hit). It is a kill-speed loss, not a defence loss.

## Candidate set
Flag OFF: every knight passive is on. Traits ON at L30 (2 slots, rank III = full value): CORE always on = thirdCut, parry, sunder, holdLine, bulwark, riposte (riposte already core on master). Worn = defaults vengeance + bash. OFF in the lab = bleed, plated, evasion, bounding, flurry, unbroken, counterstroke, endlessSky (the 8 slot-limited traits not worn) and the 6 shared (airRoll airDash lightStep momentum hangCut execute, locked behind account clears, never unlocked in the lab bot; not probed individually).
## Method
tools/boss-rates.mjs waymeet --heroes=knight --ways=built --seeds=12 --jobs=1, kit flasks, NORMAL, human profile, seeds 1-12 (block 2 = SEED0=12, seeds 13-24). BOSS_TRAITS=on or an id list; NEW measuring knob BOSS_TRAIT_SLOTS=N (src/traits.js setLabSlots, lab only: lifts the 2-slot cap so "default + X" is a real add). Raw: bracken-scratch/desktop-out/knbisect/ (run.sh, chain*.sh, sum.cjs, *.log/*.json).
## Anchors (reproduced exactly)
OFF built 11/12 (old 11/12). ON built 7/12 (old 7/12). Block 2: OFF 11/12, ON 6/12.
## Cells (knight, waymeet built, wins/12)
| cell | block 1 (s1-12) | block 2 (s13-24) | avg dmg taken | avg win len |
|---|---|---|---|---|
| flag OFF | 11 | 11 | 345 / 276 | 73 s |
| traits ON default (veng+bash) | 7 | 6 | 468 / 514 | 94 s |
| core only (no traits) | 5 | | 467 | 97 |
| ALL 10 traits worn (upper bound) | 12 | | 232 | 65 |
| default + plated | 7 (identical to default, no effect) | | 468 | |
| default + bounding | 7 (identical) | | 468 | |
| default + endlessSky | 7 (identical) | | 468 | |
| default + evasion | 5 | | 480 | |
| default + flurry | 7 | | 506 | |
| default + counterstroke | 6 | | 470 | |
| default + unbroken | 10 | 4 | 408 / 522 | (noise: swung 10 -> 4) |
| **default + bleed (3 slots)** | **11** | **11** | 291 / 321 | 65 s |
| 2 slots: vengeance + bleed | 11 | | 291 | 65 |
| 2 slots: bash + bleed | 11 | | 275 | 74 |
| 2 slots: bleed + unbroken | 9 | | 385 | 82 |
| **REC build (traits on, defaults vengeance + bleed)** | **11** | **11** | 291 / 321 | 65 |
Wins pooled over both blocks: OFF 22/24, ON 13/24, default+bleed 22/24, default+unbroken 14/24, REC 22/24.
## Reading
- Bleed alone restores OFF-level wins in both seed blocks (11 and 11 of 12; the only two cells to do so, and the only one tested at two blocks that held). Fights end ~30 s sooner (65 s vs 94 s) and the knight takes ~35% less damage (291 vs 468): the loss is KILL SPEED; the extra damage is just a longer exposure to the Crusader. The bot cannot be out-defended, it is being out-lasted.
- Unbroken looked like a second suspect in block 1 (10/12) and collapsed in block 2 (4/12): treat as noise, not a cause. Plated, bounding and endlessSky are bit-identical to the default (7/12, same damage), i.e. they do nothing in this bot's duel. Evasion/flurry/counterstroke: within noise of default.
- Confidence: moderately high that bleed is the lever (4 cells with bleed on, 11/12,11/12,11/12,11/12 vs default 7/12, 6/12; 44/48 vs 13/24). Not proven that it is the ONLY lever (all-traits 12/12 also beats it, by 1). N is 12 a cell: a 1-2 win gap between cells is not read.
## Recommendation (BUILT, behind the flag)
Swap the knight's 2nd default: `defaults ['vengeance','bash'] -> ['vengeance','bleed']` in src/traits.js (+ tools/traits.mjs asserts). bleed is learned at L8, slot 2 opens L20, so the default still arrives in time. Moving bleed to knight CORE (every knight, no slot) is the alternative: it was measured as the "default + bleed in 3 slots" row (11/12, 11/12) but needs several tools/traits.mjs tests rewritten (bleed is their example slottable trait); not built. Bash stays wearable.
Built config measured (traits on, no override list):
| cell | OFF | ON before | REC |
|---|---|---|---|
| CRUSADER built | 11/12 (22/24) | 7/12 (13/24) | 11/12 + 11/12 = 22/24 |
| CRUSADER practiced | 4/12 | 1/12 | 3/12 |
| GOBLIN QUEEN crown built | 11/12 | 9/12 | 11/12 |
| GOBLIN QUEEN crown practiced | | 5/12 | 6/12 (timeouts count as non-wins) |
Cost elsewhere: none seen on the two bosses checked; bash loses its default slot (it is a stagger trait, not measured on other bosses; the other 7 heroes untouched; knight vs the other bosses NOT re-run). Checks run (node): tools/traits.mjs, old-save-traits, progression, talents all exit 0. tools/check.mjs not run.
## Not run / owed
Shared-six traits per-trait; practiced-way bisect (only the rec was run there); bleed-as-core variant; knight at other bosses (Death Knight, Kraken, Mage) with vengeance+bleed; a human feel check that bleed (DoT, no on-hit feedback) reads right as a default. The bot is not a human: bleed helps the bot most because it never stops swinging.
