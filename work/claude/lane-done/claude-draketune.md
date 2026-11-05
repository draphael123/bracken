# DRAKETUNE (lane D3, Sonnet) - THE FIRE DRAKE tuned (branch claude/draketune)
Not merged, not deployed. BASE CHANGE (coordinator): branched off claude/drakeart, then reset to claude/drakeroom (which owns the basalt caldera_tiles kit + the Fire Drake bestiary card) and merged claude/drakeart e3530930 (clean, the noFg/noNear fix was already in). My own basalt-kit / bestiary work was dropped: steps 1 and 2 are drakeroom's.

## What changed (tuning only)
- `src/fire-drake.js` FD: hp 2600 -> 3400, every blow x1.5 (claw 27, tail 30, breath 18/tick, sweep 24, lunge bite 39, dive 36, slam 33, vents 30). In-game the bar reads 5202 (x1 + 0.25 x TIER_BOSS 2.8 = 1.7 is the stock boss scaling).
- THE LAB ROW NEEDED A TIER: `drakelab` was in no TIER / TIER_BOSS / ACTS, so the fight ran at tier 0, act 1 (a third of the late-game blow). `src/main.js` TIER drakelab 3.4, TIER_BOSS 2.8 (above Buried City 3.15 / 2.65); `src/foe-react.js` ACTS_LATE act 7 THE FIRE MOUNTAIN lists `drakelab` (dmg 4.5, the dial lategameb set for the volcano). The Heart level must list its own id the same way.
- tools: `mash-bot.mjs` MASH_LEVEL=N (a hidden row has no depth, so it was judged at L1); `boss-fight-end.mjs` FIGHT_END_ONLY=id[,id]; new `tools/fire-drake-tune-shots.mjs`.

## Win rate: bossLab via tools/boss-rates.mjs drakelab, hero L40, flasks 'kit', human profile, n=6 a hero, normal
| state | knight | warden | pyro | pooled |
|---|---|---|---|---|
| BEFORE (hp 2600, blows x1.0, tier 0/act 1 in-game) | 6/6 | - | - | 100% (knight only) |
| AFTER (committed) | 4/6 | 4/6 | 6/6 | 14/18 = 78% (band 70-80: IN) |
Fights 65-120 s wins (plan 75-110). Deaths came with the drake at 4-24% (a late loss, not an early wall).
MASH BOT (tools/mash-bot.mjs, MASH_LEVEL=40, knight/warden/pyro x 2): 0/6, dead in 25-37 s with the drake at 85-98%.
Per-hero spread: the pyromancer is 6/6 (ranged, 0 damage in 2 of 6 fights) - pooled is in band but she is over; n=6 is a wide interval (+-30 pts), so no more fights were run (joint tune lanes own the big table).

## Checks
node: fire-drake 78 ok; fire-drake-hands 336 ok; fire-drake-art 26 poses 0 bad; foe-glue, act-cards, level-quality, goblin-lint, one-new-foe, boss-rows: exit 0; node --check main/foe-react.
browser (one headless at a time, >4 GB free): boss-rates (above), mash-bot, `FIGHT_END_ONLY=drakelab node tools/boss-fight-end.mjs` -> ends on the boss's death (drakelab ok, 2 s).
SHOTS (scratch/lane-reports/draketune-*.png, from tools/fire-drake-tune-shots.mjs, errors none): p1, p2-tear, p2, p3-tear, p3, spare, beaten-lunge, beaten-fall, down, shrine. Sequence printed: P2 tear at 55% (tearTell), P3 at 25%, both basalt ledges SINK at the P3 tear (0 of 2 tiles left each), spare -> mode beaten at 0.5 s -> down at 2.5 s with the fight ended (bossActive false), body drawn on the split seal.
Not run: the full suite / tools/check.mjs; hint-shown runtime, boss-greed page part, visible-supports (page sweeps; owed to the nightly).

## Owed
- A joint tune lane: widen n (pyro 6/6 vs knight/warden 4/6); a pyro-only nudge if it holds (the ranged hero never needs the ring).
- The Heart level must set its own TIER / TIER_BOSS / ACTS_LATE ids (drakelab's rows are the stand-in); retune at the real hero level once the Heart's place on the road fixes it (L40 here, the heartplan lab's level).
- Shrine/checkpoint set by the seal is covered by fire-drake-hands (not re-shot: the shot is of the body down on the split seal).

## Questions for Daniel (rec built)
1. Hero level for the drake tune: L40 (heartplan's). REC keep, retune when the Heart's depth is set.
2. Act dial for the drake: act 7 (4.5x) by listing the row in ACTS_LATE. REC yes (the lategameb dial for THE FIRE MOUNTAIN), so the Heart inherits it.
3. Pyro 6/6: nerf only her, or leave pooled-in-band? REC leave until a joint lane reads n>=12.
