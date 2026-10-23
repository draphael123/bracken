# LANE BKBOT (sonnet) - the Blood Knight's lab bot, 2026-10-23

Branch claude/bkbot off master 0f56945e. Commits: ab9f71ae (the kit), 47c452c5 (free swinging + experiment hooks), 447ae35d + 2217eaa6 (a debt tune, built then REVERTED: no effect), + the report/tool commit.
Rec boss-side entry (NOT in this branch): branch claude/bkbot-duel, one commit.

## What was wrong
The suspicion was right, and the cause was bigger than "unused kit": the lab hands carried three Death Knight leftovers.
1. `dkSwingOK` (src/lab.js): the bot only began a swing when the boss was in an OPEN/free mode, no tell in the last 6 s, or within 0.25 s of a blow
   ending - a rule from the slow DK swing. Between tells the Blood Knight never cut. This alone took the Unburied Field from 4/12 to 11/12.
2. He never opened a vein (BLOOD PRICE, DOWN+C), never timed a BLOOD STEP, drank flasks straight into his red debt segment (a flask fills the segment first),
   rotated into SUNDER only (hold cap 110 frames).
3. Unburied's own branch + the generic tell branch had only the ward-release parry.

## What the bot does now (reaper only; profile `human`, `bkKit`, `bkTiers`, `bkFree`; `human+nobk` = the old hands)
- BLOOD PRICE: DOWN+C on one frame in a real opening, healthy (>= 60%), no debt owing (< 3%), edge nearly out, free on the ground, in reach (bkPriceHands).
- BLOOD STEP: the step is held until the blow is 0.07-0.13 s off on `bkPerfect` = 30% of tells (a perfect step, 2-3 a fight); the rest are stepped at the old 0.22 s (rollLate).
- BLOOD SPIKE: on `bkSpike` = 20% of blockable tells in the generic branch the knee goes down 0.02-0.14 s before the blow (aimed by the blow lag it learns from hits, dkLagH);
  the rest stay the ward-release parry (6-9 parries a Waymeet fight). The spike lands only ~1 in 5 (it is turned away on some foes' timings) - kept at 20%.
- Tiers: rotateWanted/rotHold already wound SUNDER/CRESCENT after two stale cuts; now on by default (bkTiers), hold cap and tier knobs (x_bkCap_, x_bkBroken_, x_bkOpen_, x_bkDebtTier_) for later.
- Debt: a flask is not drunk into a debt > 2% max hp unless the bar is under 20% (botShouldDrinkBig); he lands blows first.
- RED HOST (built way, makeSkillHands bk flag): priced spells (BOLT, WORMS, POOL) only while healthy (>= 40%) and under 12% debt; DRAIN first when hurt with debt; verified with
  BK_KIT=bidden,summonSkeleton,gravecall (DRAIN 1-2 casts, WORMS 3-8, BOLT 4-5 a fight).
- Free swings: `bkFree` skips the DK punish rule; humanSwingOk (no swing into a tell, wind kept) still applies.
- Knobs: profile mods `+x_<key>_<n>` (p = decimal point), `+spike<n>`, `+perf<n>`, `+nobk`; tools: BK_LEVER (deep-merge into BLOOD in the page), BK_KIT, SEED0, BOSS_EVAL_MS (a dead page no longer hangs 20 min), a `bk {par,perf,price,spike,rec,drain,paid}` field per reaper row.

## Rates (Blood Knight, `human` with flasks, practiced = bare build, campaign level, deterministic seeds)
| row | BEFORE (+nobk) | AFTER bot (default) | k/w/p reference | note |
|---|---|---|---|---|
| stockade L3 | 1/12 (8%) | 2/12 first sample; 11/36 (31%) over 36 seeds | 3/6 6/6 1/6 = 56% | still LOW |
| unburied L34 | 4/12 (33%) | 11/12 (92%) | 2/5 6/6 6/6 = 82% (knight 2/6 on 6 seeds) | HIGH, fine |
| waymeet L26 | 0/11 (1 page hung) | 3/12 (25%) | 3/6 5/6 4/6 = 67% | still LOW |
| wood | 8/8 | 7/8 | | |
| marsh | 7/8 | 7/8 | | |
| fenroad | 8/8 | 8/8 | | |
| spore | 5/8 | 8/8 | | |
DRY (human+dry, 6 each, after): stockade 0/6, unburied 4/6, waymeet 0/6.  BUILT (typical skills, 3 each): stockade 3/3, unburied 3/3, waymeet 3/3 (see flag 1).
MASH (tools/mash-bot.mjs, reaper x 6 seeds, boss + mini of stockade/unburied/waymeet): 0 wins of 30 (every row DEAD).
Checks: tools/blood-kit.mjs green, tools/unburied-fights.mjs green.
KNIGHT CONTROL: knight, same rows, per-seed outcomes IDENTICAL before/after (stockade 3/6 = 3/6, waymeet 3/6 = 3/6 line for line; unburied 2/6, the one earlier difference was a page that
hung before and was re-measured). The new hands are gated on the hero reaper (rollLate, botShouldDrinkBig, bkPriceHands, bkSpikeUse, makeSkillHands bk, dkSwingOK).

## The tune: tried, did not help, NOT shipped
BLOOD DEBT share 0.5->0.6, cap 0.25->0.3, drainT 3->4, reclaim 0.45->0.7 (commit 447ae35d, reverted by 2217eaa6). Stockade with the bot: no tune 11/36, tune 12/36 (seeds 1-36);
the early +20 pp I saw (6/12 vs 2/11) was seed noise plus the free-swing change. Waymeet 3/12 -> 4/12, unburied 11/12 -> 10/12, spore 8/8 -> 5/7. Price mul 1.35 + buff 8 s + perfect-step debt 8%
(stockade 5/12, waymeet 3/12) and tier mults x1.15 (4/12, 4/12) were no better. blood-kit.mjs stays green either way. The hero is not short of sustain; no small BLOOD number moves him.

## What does move him, and is boss-side (not built here: "do not touch boss tuning")
WAYMEET: src/main.js DUEL_HERO.closedhelm = { knight 0.5, warden 2.8, pyro 2.2 }; the reaper is unlisted = 1.0, so he takes 2x the knight's damage from the Crusader and dies in 70-110 s
(knight 130-165 s). With `reaper: 0.65` and the same bot: 9/12 = 75% (band 60-70; 0.7 should land ~65%). Built on branch claude/bkbot-duel (one commit, 0.65, measured); take or drop it.
STOCKADE: no per-hero table covers the Chieftain (`chief`); the other heroes themselves span 1/6..6/6 there. The reaper at 31% (n=36) vs 56% (n=18) is a borderline gap on a noisy fight;
a `chief` per-hero entry is the lever if Daniel wants it. Not measured.

## Flags / reds
1. BUILT way is very strong: with BLOOD BOLT / BLOODWORMS / DRAIN in the slots he kills the Unburied boss in 13-19 s (bare: ~100 s) and wins 9/9 built fights. The Red Host spells (bolt 0.75x at 3 s cd, worms bleed + reclaim) look over-tuned against bosses; separate look.
2. Page hangs: memguard kills a headless Chrome under memory pressure and the fight waits for the evalp timeout (was 20 min): BOSS_EVAL_MS=300000 turns it into an ERR row (excluded from rates).
3. The Blood Knight's stat `spike` rarely fires (kneel ducks/high-blow rules ahead of it on closedhelm; 1 in 5 elsewhere). Left at 20%.
4. No suite run (40 min, shared PC); ran blood-kit, unburied-fights, mash. Other tools that drive bossLab with the `human` profile and the reaper (e.g. canal-tunnel-route reaper) now see the new hands.

## QUESTIONS FOR DANIEL
1. Waymeet: add `reaper: 0.65` (or 0.7) to DUEL_HERO.closedhelm like the other heroes' entries? REC: yes, 0.7. Built on claude/bkbot-duel, not merged into claude/bkbot.
2. Built-way Red Host strength (flag 1): trim now or leave until the next BK pass? REC: leave, measure with a dry run first.
