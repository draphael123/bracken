# claude/flasklever - GLOBAL FLASK LEVER + BOSS PRESSURE DIAL + BOT REALISM (Sonnet, 2026-10-13) - base origin/master a0e14160

Pushed: claude/flasklever (this report's commit is the head). Measured on PORT 8880, jobs=1, profile human, --flasks=kit, --ways=practiced.


## UPDATE 10-13 21:30 - DIAL v3 (CALIBRATED; supersedes the table in section 3 and the headline above)
Coordinator: v2 overshot (acts 4-5 too hard, act 1 high, acts 2-3 a touch low). v3 interpolated off the v0/v1/v2 curve, then re-measured on the 54 non-exempt rows x 3 seeds (486 fights, 0 errors; docs/flask-lever-1013-v3.json, rows in docs/flask-lever-1013-v3-table.txt; exempt: underwell, redgorge, buriedcity, glasssea, ksar, sealedpyramid's old row).
| act | boss gap / dmg | boss median (n) | mini gap / dmg | mini median (n) | in band? |
|---|---|---|---|---|---|
| 1 | 1.17 / 1.30 | **50** (8) [0,22,22,33,67,78,78,100] | 1.15 / 1.25 | 78 (1) | bosses UNDER (60-70): rootway 0, burning 33, wood 22, underleaf 22 |
| 2 | 1.25 / 1.42 | **67** (9) | 1.33 / 1.50 | 78 (3) [44,78,89] | IN (bosses), minis IN |
| 3 | 1.60 / 1.90 | **78** (9) [22,33,44,44,78,100x4] | 1.40 / 1.65 | 83.5 (2) | bosses OVER (+8): the act splits - harbor/hurricane/lamplit/longwater 100 against keep 22, reef 33 |
| 4 | 1.45 / 1.70 | **67** (12) | 1.45 / 1.70 | 78 (7) | IN, minis IN |
| 5 | 1.30 / 1.50 | **72** (2: caravan 44, welltown 100) | 1.35 / 1.55 | 78 (1) | n too small to read |
ALL non-exempt bosses median **67** (n 40), minis median **78** (n 14); knight 64% / warden 65% / pyro 73% (v2: 58 / 63 / 70; before the dial 87 / 91 / 93).
Still outside after this one pass (not re-measured tonight, per the coordinator): act 1 bosses a touch low (50) - ease act 1 to ~1.12 / 1.22 (the v2 value 1.12/1.2 gave 78 on a different seed set: the act is noisy, 8 rows x 3 seeds); act 3 a touch high (78) - raise to ~1.7 / 2.05. The medians are in or near band; the SPREAD is the problem and it is per boss (zero rows: rootway 0% all three heroes, witchlight 0% all three, theatre 22%, keep 22%, wood 22%, underleaf 22%; and 100% rows: storm, spore, harbor, lamplit, longwater, hurricane, burial, welltown). The per-boss outlier list in section 5 still stands, with these v3 numbers.
Wood / marsh curve-gate re-stamp: NOT done (skipped per the coordinator: the batch fix lane handles curve-gate); the knights were not changed so the level hash is unchanged.

## HEADLINE (v2, superseded by the update above)
| | before (realism pass only, 6 seeds, 1044 fights) | after (flask lever + dial v2, 3 seeds, 520 fights) |
|---|---|---|
| boss median (non-exempt) | **94.4%** (44 rows; 2 in band) | **56%** (41 rows; per act 78 / 56 / 56 / 50 / 22*) |
| mini median | **100%** (14 rows; 1 in band) | **89%** (14 rows; per act 78 / 100 / 89 / 89 / 78) |
| knight / warden / pyro | 87% / 91% / 93% | 58% / 63% / 70% |
Target: bosses 60-70, minis 75-85. The median landed just UNDER the band (56) and the minis just OVER (89); see "What I would change next". The final re-measure was 3 seeds, not 6 (a 6-seed full set is ~4 h and the BATCH91 cut-off was 21:00). 2 ERR fights of 522 (excluded).
*act 5 has only 3 non-exempt boss rows (caravan, sealedpyramid's OLD scarab-mother row, welltown): 11 / 22 / 100.

## 1. BOT REALISM (src/lab.js, src/bot-profile.js, src/lab-perceive.js untouched; per-boss plans)
FINDING: every boss row already ran through the perception layer (rt mean 407-410 ms, ~4-5 misreads a fight; src/lab-perceive.js reads mode / modeT / open / greedT late). The remaining perfect-eyes surface was the per-boss PLANS reading non-mode things (a rock, a hook, a lever, a band) with their own 0.25 s clock, or with `eyes:true` bypassing it:
- **Great Drill**: `drillPlan.late()` returned true for EVERY object read when eyes were on (rocks, dynamite, hook, lunge, roof spots, lever, ore were seen on the frame they came - the Foreman's bypass). Fixed: only the reverse (a mode) stays eye-driven; the rest take the human clock + miss.
- **Plan reaction clocks**: all 16 per-boss plans (cistern-queen, djinn, great-drill, foreman, glass-colossus, fog-knight, gang-leader, gorge-crab, hawk-mistress, hourglass-king, huntmaster, lantern-eater, paladin-boss, puppeteer, raptor-matriarch, scarab-mother) had PLAN.react 0.25 s (+-0.05). A human profile now sets every one to its own mean (src/bot-profile.js planReact 0.396 -> draws 0.356-0.456, mean 0.406 s = the profile's triangular mean 254/386/578). Roc's lag base 0.2 -> 0.321 (+0..0.15). Restored after each row. Hawk-Mistress snare read 0.12 s -> PLAN.react (was a 120 ms reflex); her knock reads miss 0.08 -> PLAN.miss.
- **Human parry (new)**: a SHIELD hero (knight / paladin / geomancer) now TRIES to parry 60% of yellow tells (parryTry 0.6): his guard is held back until the tell's last 0.09 s as READ (parryLead; the reader's timing error is the profile's timingSd 0.06 s, so some land on the beat, some a hair late), instead of held from the first frame (which can never be a parry: the perfect guard is the first 0.11 s of a raised guard). Red tells, tap heroes (warden / berserker / pyro already time theirs) and the rest of the keys are untouched. MEASURED (6-seed full set, before the dial): 1.8 guard-held tells a fight, 1.1 tried, 1.1 raised, **0.84 parries a fight** (was 0-1). The tell count is low because most bosses are answered by roll / jump, not guard; of tells that reached a guard, 60% tried and ~50% of tries landed.
- **Heavies timed**: the human profile winds the knight's / warden's held heavy into the boss's OPENINGS only (mixHeavy: the lab's mixedHeavy path, previously opts.attackStyle='mixed' only). Verb mix measured: pips up to 5 a fight, verbs rise/cut/dash/heavy/plunge/shot/riposte all present (the lab already mixed verbs; the missing verb was a TIMED heavy).
- **Elite lab (tools/elite-lab.mjs, src/lab.js eliteLab)**: the 'human' mode now uses the human profile (eyes + parry + flask drinking at 35%, campaign-kit flasks via --flasks=kit, --profile=). `--profile=legacy` is the old bot exactly.
- Updated the printed bands in tools/boss-rates.mjs: bosses 60-70, minis 75-85.
- Bot numbers: reaction 254-578 ms triangular (mode 386, mean 406-410 measured); misread 0.146 (4-5 per fight); greed 0.413 x 1-2 swings; stamina slip 0.2; drink under 35% of the bar; plan clock mean 0.406 s; parryTry 0.6 / lead 0.09 s; mixHeavy on.
- NOT DONE: **Great Drill phase-3 gear-gate bot**. The gear gate (gearsNeed 2 of 4) lives on origin/claude/dr4tune / deeprails4, NOT on master a0e14160, so there is nothing to fix or test on this base. The branch's drillPlan has a gear branch (4b) that breaks one bank then idles (dr4tune report). Hand-over: when deeprails4 merges, trace a pyro fight with tools/drill-trace.mjs (a worktree claude/flasklever-drill off dr4tune was made and left empty); my one-line change to drillPlan's `late()` (eyes only for 'rev') will conflict trivially with dr4tune's untouched line - take mine.

## 2. THE FLASK LEVER (in code: src/survival.js FLASK, src/flasks2.js POTENCY / QUICK / tiers)
| | was | now |
|---|---|---|
| base drink (game s; clock at speed 0.6) | 0.45 (0.75 s) | **0.70 (1.17 s)** |
| swallow / spill window | 0.30 (0.5 s) | **0.55 (0.92 s)** |
| potency (heal of max hp) | 35% | **25%** |
| RICH / DISTILLED / SUNLIGHT tiers, cap | 40 / 45 / 50, cap 50 | **30 / 35 / 40, cap 40** |
| QUICK DRAUGHT drink / swallow | 0.30 / 0.20 | **0.50 / 0.36** (0.83 s) |
NOT fewer flasks (counts unchanged). One candidate tested (A, above): on the 14 highest rows (2 seeds) it moved nothing by itself (100% -> 100%): those bosses never hit hard enough for a flask to matter; the lever bites only once the dial makes the fight dangerous. Tests updated to the new numbers (stated design change): tools/flasks2.mjs (healPct 0.25 / cap 0.40, tiers 0.30 / 0.35 / 0.40, QUICK ~0.83 s, rich pct 0.30), tools/survival.mjs (flaskHeal(200) = 50; messages). tools/flasks2.mjs and tools/survival.mjs GREEN (PORT 8880). Store text and the HUD hint ('+25% HEALTH') updated.

## 3. THE GLOBAL BOSS PRESSURE DIAL (src/boss-pressure.js; hooks src/main.js updateEnemies + damagePlayer0)
ONE table per act, applied to every boss and mini of that act. No extra hp. gap = how much faster a boss's own clock runs while he is NOT telling, open, broken, staggered, warded or changing phase (so gaps between attacks shrink by 1/gap; tells, a told opening (B10), the ward after (B3) and poise breaks are never scaled; the 0.5 s tell floor, B10-B15 and the 0.4x resistance floor are untouched). dmg = every blow of his that lands (after the per-boss tables; hazards and drains are not his blow).
| act | boss gap | boss dmg | mini gap | mini dmg |
|---|---|---|---|---|
| 1 | 1.12 | 1.20 | 1.15 | 1.25 |
| 2 | 1.33 | 1.55 | 1.25 | 1.35 |
| 3 | 1.75 | 2.15 | 1.30 | 1.50 |
| 4 | 1.63 | 2.00 | 1.35 | 1.55 |
| 5 | 1.63 | 2.00 | 1.35 | 1.55 |
**DIAL_EXEMPT (factor 1, double-tune guard; coordinator 10-13)**: cisternqueen (claude/cqueenrework), hourglassking (bc3tune), matriarch, hawkmistress, colossus (their lanes land later). MERGE NOTE: add the new pyramid boss's e.t (claude/pyramidboss) when it merges (comment in the file).
How it was tuned (all with the flask lever): dial v0 = none (boss median 94); v1 (1.3/1.5 .. 1.9/2.4) on 30 partial rows put act 1 at ~33% -> eased acts 1-2 and trimmed 4-5 = **v2** (measured above). Experiments: uniform 1.35 / 1.4 on the 14 high rows: 100 -> 87% (median 100); 1.7 / 2.0: median 83, 5 of 14 under band, canal 0%.
Env hook for experiments: FLASK_LEVER='{"drinkT":..,"pressure":{"3":{"gap":..,"dmg":..}}}' read by tools/boss-run.mjs (no code edit needed).

## 4. ELITE PASS (information only; Road Warden knights left at master as Daniel played them)
- Human elite lab (flasks, human eyes + parry), 12 fights each, 120 s window, with my pre-revert TUNE numbers (maul dmg 1.35, lance hp 0.8): Briar Maul 83-92%, Bog Blade 67-92% (noisy), Ore Lance 67% (pyro 1/4: stands at 1% hp and cannot crack the ore: no heavy that cracks a plate). At master values the rates were not re-measured (not required). Their TUNE entries are REVERTED to master (ca30577a).
- **Tomb-Warden** (src/mummy.js MUMMY): 100% (18/18, hero at 100% hp most fights) with the human bot -> lashTell 0.66 -> 0.55, grabTell 0.72 -> 0.60, cd 0.85 -> 0.60, grabR 22 -> 24, dmg lash/grab/squeeze 26/18/10 -> 32/22/12: 92% (11/12), fights 33 s. (TUNE.mummy is not read by his own hands.)
- **Assassin mini** (src/main.js spawn): maxHp + mini when the level's ent has `mini:true` (Underleaf's stalker) - no finisher one-shot.
- **Tide Herald chip** 0.2 -> 0.4 (B15 floor; src/boss-greed.js GREED.chipBy.herald).
- knock-into-exams (no browser, report only): unchanged list (4 eased elites, 1 trivial span: towpath 268-301); damage % makes a fresh foe only shoved, so these need wearing down first. Not re-stamped.

## 5. FINAL TABLE (3 seeds, 58 rows; docs/flask-lever-1013-final.json; the 6-seed pre-dial run is docs/flask-lever-1013.json)
Per-act medians (non-exempt bosses / minis): act 1 78 / 78, act 2 56 / 100, act 3 56 / 89, act 4 50 / 89, act 5 22* / 78. ALL bosses 56, minis 89. Exempt boss rows (listed, not counted): buriedcity 67%, underwell 100%, redgorge 100%.
### OUTLIER TABLE (per-boss lanes; boss | act | k w p (/3) | % flasks | % dry | verdict) - dry from the 10-11 sweep where it exists (old bot, 3 seeds), '-' = not measured
| boss | act | k w p | % flasks | % dry (10-11) | verdict |
|---|---|---|---|---|---|
| rootway | 1 | 0 0 2 | 22 | 33 | LOW, zero k/w |
| underleaf | 1 | 0 1 0 | 11 | 22 | LOW, zero k/p |
| stockade | 1 | 1 3 1 | 56 | 44 | LOW |
| spore | 1 | 3 3 3 | 100 | 22 | HIGH |
| burning / marsh / wood / kings | 1 | - | 78 | - | HIGH (+8) |
| hanging | 2 | 0 1 1 | 22 | 56 | LOW, zero k |
| moor | 2 | 0 2 0 | 22 | 56 | LOW, zero k/p |
| scree | 2 | 0 0 3 | 33 | 44 | LOW, zero k/w |
| oreroad / skyroad | 2 | 2 1 1 / 1 1 3 | 44 / 56 | 44 / 78 | LOW |
| storm | 2 | 3 3 3 | 100 | 89 | HIGH (24 s fight: no pressure bites) |
| spire / undercrown | 2 | - | 78 | - | HIGH (+8) |
| causeway | 3 | 0 0 0 | 0 | 33 | LOW, zero all (dial too hard) |
| deep | 3 | 1 1 0 | 22 | 67 | LOW, zero pyro |
| flotilla | 3 | 2 3 0 | 56 | 78 | LOW, zero pyro |
| keep | 3 | 2 0 1 | 33 | 78 | LOW, zero warden |
| reef | 3 | 2 2 1 | 56 | 33 | LOW |
| harbor | 3 | 2 3 3 | 89 | 78 | HIGH |
| canal | 4 | 0 0 3 | 33 | 67 | LOW, zero k/w |
| church | 4 | 1 0 3 | 44 | 44 | LOW, zero warden |
| fields | 4 | 1 1 1 | 33 | 78 | LOW |
| mage | 4 | 0 0 2 | 22 | 44 | LOW, zero k/w |
| theatre | 4 | 0 1 0 | 11 | 100 | LOW, zero k/p |
| waymeet | 4 | 0 3 2 | 56 | 44 | LOW, zero knight |
| witchlight | 4 | 0 0 0 | 0 | 67 | LOW, zero all |
| fair / burial | 4 | - | 100 / 89 | 78 / 78 | HIGH |
| towpath | 4 | 3 3 1 | 78 | 44 | HIGH (+8) |
| caravan | 5 | 1 0 1 | 22 | 33 | LOW, zero warden |
| sealedpyramid (old scarab-mother row) | 5 | 1 0 0 | 11 | - | LOW (boss being replaced) |
| welltown | 5 | 3 3 3 | 100 | 100 | HIGH |
Minis: HIGH (89-100): crown, hanging, spire, burial, fields, unburied, waymeet, harbor, lamplit; LOW: mage 67, witchlight 67 (zero warden). IN: kings 78, fallingtower 78, welltown 78.
Reading it: the dial is a blunt global instrument - rows split into ones it crushes (causeway, witchlight 0%: ranged / fast bosses where a 2x blow is lethal) and ones it barely touches (storm 24 s, spore, welltown, fair 100%: the boss rarely lands a blow). The medians are in the zone; the spread is per-boss work (this is the table the per-boss lanes pick from).
Rebuilt separately (their own lanes re-measure; still listed): Cistern Queen (underwell 100% with the dial EXEMPT), Matriarch (redgorge 100%), Hourglass King (buriedcity 67%), Hawk-Mistress (ksar), Glass Colossus (glasssea).

## 6. WHAT I WOULD CHANGE NEXT (not measured - interpolation, for the Sonnet tune lane)
Medians sit under 60 for acts 2-4 and minis over 85: ease acts 2 / 3 / 4-5 boss dials by ~0.1 gap + 0.15 dmg (e.g. 1.25/1.45, 1.65/2.0, 1.5/1.8), and raise the mini column (act 2 1.35/1.5, act 3 1.45/1.7, act 4-5 1.5/1.75); keep act 1 (78 -> add 0.05/0.1 to land 65). Re-measure the 12 worst rows rather than all 58. Per-boss: the 0% rows (causeway, witchlight) want a per-boss exemption or a lower blow multiplier (their tells are fast); pyro is the weakest hero on ranged/air bosses (deep, flotilla, moor, theatre) and the strongest on melee ones - a hero-fairness pass is a separate lane.

## NOT DONE / CAVEATS
- **Wood / marsh curve-gate re-stamp** (tools/level1-pilot.mjs --curve, then mash-bot level then boss): not run - the PC was on the measures until 19:00 and the knights were reverted to master mid-lane. Rows are stale-checked by level hash, so they only need re-stamping if the level changed (the knights did not). Run `node tools/level1-pilot.mjs wood marsh --curve` + `node tools/mash-bot.mjs --level wood --write`/marsh when the page is free.
- The new Great Drill gear-gate bot fix (above).
- No full suite run (tools/check.mjs) from this lane: flasks2, survival, elite-lab, boss-rates run; boss-fight-end / boss-openings / mark-integrity / hint-shown / textfit (store text changed: --strict) NOT run - please let the BATCH91 suite cover them; the dial changes main.js updateEnemies and damagePlayer0 (a shared loop), so boss-fight-end and damage-caps are the ones to watch.
- Memory: ran jobs=1 throughout, one browser at a time; killed only my own PIDs.

## QUESTIONS FOR DANIEL (rec + what I built)
1. The dial makes bosses hit ~2x harder and attack ~1.5x as often in acts 3-5. REC: keep as the global lever, then fix the 0% rows per boss (causeway, witchlight, theatre, canal, mage). Built: v2 above.
2. Flasks are now 25% a drink and a longer, spillable window. REC: keep (they still carry the fights: dry is ~25 points lower). Alt: a smaller cut (30%).
3. The Tomb-Warden is harder (lash 32). REC: keep. The Road Wardens are as you played them (reverted).
4. The human bot parries ~0.8 a fight now (most bosses are answered by roll / jump). REC: keep; the parry is a real player skill and now present in the numbers.
