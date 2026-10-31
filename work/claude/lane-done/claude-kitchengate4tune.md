# claude/kitchengate4 TUNE - KITCHEN GATE 4 tune lane (sonnet, 10-31)
Branch claude/kitchengate4 on the art tip 85a9241e. NOT merged, NOT deployed. READY for integ.

## FINAL NUMBERS (tools/boss-rates.mjs kitchengate --ways=practiced --profile=human, flasks kit, campaign L20, seeds 301+)
| state | knight | warden | pyro | total |
|---|---|---|---|---|
| greybox tip (12 seeds, 2 page crashes unscored) | 9/11 82% | 6/12 50% | 11/11 100% | 76% HIGH |
| FINAL: heroMul k1.1 w0.9 p1.8 + drop cd 14 s | 8/12 67% | 13/18 72% | 8/12 67% | 29/42 = 69% IN BAND |
- Warden at 0.85 read 9/11, at 0.95 read 6/11 (n=12 swings +-15 points), so 0.9 was run to 18 seeds: 13/18. All three heroes sit 67-72%.
- Winning fight lengths: knight 100-133 s, warden 135-205 s, pyro 108-160 s (greybox: 102-112 / 167-192 / 114-152).
- NO FLASKS (--profile=human+dry, 4 seeds): knight 0/4, warden 2/4, pyro 0/4 = 17% (greybox 44%). Low, see Q1.
- MASH (tools/mash-bot.mjs kitchengate --arena-only --write): 0/6, dead in 18-48 s, 0 blows landed. docs/mash-bot.json unchanged.

## WHAT CHANGED (gameplay)
- src/grubbag.js GB.heroMul {knight 1.1, warden 0.9, pyro 1.8}: a per-hero factor on his blows on the hero (the LANCE 4 / DUEL_HERO pattern), applied in src/grubbag-hands.js bzD next to GB.dmgMul 2.9. His own HP, his damage to bosses, the openings and the B15 resist floor are untouched.
- GB.drop.cd 12 -> 14 s (the greybox lane's rec).
- Not changed: carry-back 0.5, dmgMul.

## MARK INTEGRITY (goal 2) - fixed by tooling only, no art mismatch found
tools/mark-integrity.mjs gained two probes: MI_HPFRAC=<frac> (hold every boss at that health fraction, forces the phase-gated moves) and MI_BELT=1 (stand the hero on the serving line, for the sweep).
- MI_ONLY=grubbag MI_SECS=100 MI_HPFRAC=0.25: grease 1/1, grab 3/3, bell 1/1, lob 6/6, fling 5/5, belch 3/3 - all seen, landed and posed.
- MI_ONLY=grubbag MI_SECS=80 MI_BELT=1: sweep 5/5 landed and posed (+ fling, belch, lob). "every mark seen belongs to a windup that is drawn and lands." No art changes needed.

## CHECKS (one browser at a time, PORT 6600, RAM 5-7 GB free, full suite NOT run)
GREEN: tools/kitchengate.mjs, kitchengate4-keys.mjs, kitchengate-probe.mjs, boss-openings.mjs, boss-heal.mjs, checkpoint-gaps.mjs (53 levels), level-quality kitchengate (clears the bar), mark-integrity (above), mash-bot kitchengate (0/6).
Baselines: pilot / curve NOT re-recorded (level data and level-mode play unchanged; only boss damage terms moved). mash boss row re-run, stamp identical.
Harness note: 2 of 36 fights per batch end "the page CRASHED (Inspector.targetCrashed)" (counted as unscored, not losses).

## QUESTIONS FOR DANIEL (rec built)
1. Dry (no flasks) is 17%, down from 44%: the per-hero damage factors bite hardest with no flasks (pyro 1.8 x 2.9). REC (built): leave - the standard is with flasks (bosses 60-70). ALT: pyro 1.5 and a lower dmgMul with a slightly higher drop cap.
2. Warden at n=12 is noisy (+-15 points between 0.85 and 0.95). REC: keep 0.9; re-read on the playtest.
3. The knight/pyro 12-seed reads were not re-run at the final warden value (their code path is unchanged by it).
