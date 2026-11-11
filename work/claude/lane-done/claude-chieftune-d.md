# CHIEFTUNE-d - the Goblin Chieftain (stockade) retuned on the honest bot (branch claude/chieftune-d)
Base: claude/labadds-d 55cb302b4 + origin/master 7699a5ffb (TRAITS_SHIP + JUICE2_SHIPS true, batches 159-161) + origin/claude/knbisect-d (knight defaults vengeance + bleed) + cherry-pick 9a38c5cb8 (boss-run --flasks=none, from claude/charms4-d).
Every cell: stockade (L4), practiced, profile human, knight/warden/pyro, n=12 each, seeds 1-12 (the LABADDS seeds), jobs 2.

## Merge
- origin/master: clean. origin/claude/knbisect-d: one conflict, tools/boss-run.mjs traitsJs - kept knbisect's BOSS_TRAIT_SLOTS line AND master's BOSS_JUICE2 juiceJs.
- charms4's flasks=none cherry-pick conflicted with GQ_LEVER in the same line: kept both.

## Switch-off path = merged master
stockade + marsh, warden + pyro, seeds 1-2 (8 fights; knight left out because knbisect changes his traits on purpose): a detached origin/master worktree vs this branch with BOSS_ADDS unset - every result line identical (order differs only by jobs=2; sorted diff empty). Raw: bracken-scratch/desktop-out/chieftune/proof-*.txt.

## Re-baseline (crew 1, HP 540)
| tree | BOSS_ADDS | kn | wa | py | pooled |
|---|---|---|---|---|---|
| old (labadds, traits/juice off) | off (log) | 8/12 | 1/12 | 5/12 | 39% |
| old | on | 11/12 | 7/12 | 9/12 | 75% |
| merged (traits + juice2 + knbisect) | off (log) | 7/12 | 4/12 | 7/12 | 50% |
| merged | **on** | 11/12 | 12/12 | 8/12 | **86% (31/36)** - the real starting point, HIGH |
Traits and hit-feel made him ~11 points easier on top of the add effect (+36 points off -> on on the merged tree).

## Lever tried (BOSS_ADDS=on, kit flasks)
| lever | kn | wa | py | pooled | verdict |
|---|---|---|---|---|---|
| HORN.crewMax 1 -> 2 (src/stockade-hands.js; undoes part of bosstune150 2ba5472e4) | 10/12 | 7/12 | 7/12 | **67% (24/36)** | IN BAND - stop |
HP 540 -> 590 and the CHIEF_OPEN stretch (slam 2.0 / chain 2.6, from 2ba5472e4) NOT touched: the first lever landed in band with no hero under 4/12. The crew he now calls averages 2.1 adds a fight (0-5).

## Final numbers
- HORN.crewMax = 2 (was 1). EHP.chief 540, CHIEF_OPEN { slam 2.0, chain 2.6 } unchanged.
- With kit flasks, BOSS_ADDS=on: kn 10/12, wa 7/12, py 7/12 = 24/36 = **67%** (band 60-70). Spread: no hero under 7/12.
- Same tree, BOSS_ADDS off (the old add-blind bot): kn 8/12, wa 5/12, py 4/12 = 17/36 = 47% (was 50% at crew 1: the old bot barely noticed the second crewman - it never fought them).
- Character: nothing about a move changed - the crew are the same told pike/archer (the horn draw, its told blast and the "silence it in two blows" opening unchanged); no invulnerability; the 0.4 floor untouched; P2 unchanged. Only how many he calls a hero.

## Flaskless (record only, nothing changed)
BOSS_ADDS=on, `--flasks=none`, final numbers: kn 9/12, wa 8/12, py 6/12 = **23/36 = 64%**. The knight is not 6/6 flaskless against today's Chieftain once his crew is back: 9/12.
- BUG FOUND AND FIXED in the cherry-picked tool: `--flasks=none` set P.flasks = 0 BEFORE bossLab, and bossLab's own BK.reset gave the flask back - the first flaskless cell came out 36/36 fight-for-fight identical to the kit cell (probe: drink calls with 1 flask in 'none' mode). Now the flask is held at 0 through bossLab's resets (tools/boss-run.mjs; probe chieftune/drinkprobe.mjs shows no drink and 0 flasks). **Any flaskless number measured with charms4-d's version was measured WITH a flask** (incl. "knight 6/6 flaskless") - charms4 should re-measure.
- The Stockade's kit is no flask items (flaskKitAt stockade = {}): one plain flask. With or without it: 67% vs 64%.

## Checks
- tools/stockade-nohorn.mjs (static): OK.
- tools/chief3.mjs: OK (it asserts the crew called = HORN.crewMax, now 2: "crew 2, pullN 2").
- tools/stockade2.mjs, tools/stockade3.mjs, tools/stockade-horns.mjs: OK.
- boss-fight-end: NOT run (it sweeps every level, no per-level filter - not cheap); the change does not touch how his death ends the fight.
- tools/check.mjs not run (not allowed). No merge, no deploy.

## Not verified / owed
- n=12 per hero; the 67% interval is [50-80] - in band on the point, not cleared by the interval.
- The band was read with BOSS_ADDS=on (the honest bot); stamped boss-rate rows and mash/curve rows for stockade were NOT restamped (the default lab is still switch-off).
- What's New / bestiary text not touched (the crew count is not stated there that I found; not checked exhaustively).

## Questions for Daniel (rec first)
1. Accept crew 2 alone (67%)? REC yes - one lever, in band, no hero weak; HP and the openings stay where bosstune150 / chief540 left them.
2. The flaskless tool bug: tell charms4-d its flaskless numbers carried a flask. REC re-measure the TELL-LENS feat's early bosses with this branch's boss-run.
