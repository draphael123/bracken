# GQ5Q1TUNE-L - Goblin Queen phase-1 retune (laptop 11-13 ~11:15) - NOT READY
Branch claude/gq5q1t (off claude/gq5q1-b d0d0a2410). Flag BRACKEN_GQ5Q1 only; GQ5Q1_SHIPS untouched. First check: no desktop retune existed (no origin commit newer than d0d0a2410 on any gq5q1* branch, no reports/gq5q1-retune.md), so I ran it.

## Table (crown, human profile, WITH flasks, practiced, --jobs=1, n=6 per hero = 18 per round)
| round | change (cumulative) | knight | warden | pyro | pooled | win secs (game) | fire share of dmg taken |
|---|---|---|---|---|---|---|---|
| 0 baseline | as built (cap .20, every 26, scorch cap .12) | 1/6 | 1/6 | 1/6 | 3/18 17% [6-39] | 185 / 342 / 148 | 45-56% |
| 1 | fire.capPct .20 -> .15 | 1/6 | 1/6 | 1/6 | 3/18 17% | 240 / 215 / 222 | 32-47% |
| 2 | + fire.every 26 -> 30 | 3/6 | 1/6 | 2/6 | 6/18 33% | 130,233,153 / 263 / 175,190 | 27-35% |
| 3 | + scorch.cap .12 -> .15 | 2/6 | 1/6 | 2/6 | 5/18 28% | 130,233 / 339 / 175,190 | 25-38% |
Baseline was FAR below the expected 40-60 (17%). Ladder taken in order, 3 changes, never in band, so per the plan I STOPPED: no n=36 confirm run (it could not have landed in 60-70).
Noise: n=6 per hero, 95% interval on 33% is ~[14-57]; rounds 2 and 3 are not distinguishable. Knob 1 was a no-move on win rate (fire share fell 49% -> 38%), knob 2 was the only visible mover, knob 3 a no-move (reverted).

## Final knob numbers on the branch tip
fire.capPct 0.15, fire.every 30, scorch.cap 0.12 (knob 3 reverted), fire.tell 3.0, hallHp 2400 (knob 4 not taken: 3 changes max). Best measured state = these (round-2 numbers, 33%). Resist floor, tells >= 0.3 s, no new flag: unchanged (only 2 numbers edited, src/gq5q1.js Q5N.fire).

## Findings
- Tick dial (tools/gq5q1-tickdial.mjs, run once, final numbers): knight/warden/pyro each ticks=[17,17,17,17] total 68 - EVEN across heroes, page errors none.
- Throne fire is no longer the main killer after the cap (33% of damage taken at round 3, was 49%), yet losses persist: every loss is early (about 80-125 s, a few at 150-300 s) with the Queen still 30-90% left. Remaining damage is HER CROWN, PORTAL SHARD, HEARTH JET and unattributed ('?'): the fight is dying on non-fire phase-1 damage, so more fire knobs have little left to give.
- Win times 130-340 s of game time are long next to the loss times: wins are long grinds, losses are fast.

## Commits (claude/gq5q1t)
see git log: baseline + knob 1/2/3 WIP commits with the work/claude/tune/gq5q1t-{n6-base,k1,k2,k3}.json raw rows.

## NOT checked
n=36 confirm; knob 4 (hallHp); 6 other heroes; co-op; first/built ways; node proof suite (tools/gq5q1.mjs) was NOT re-run after the two number changes (F section asserts every=26/cap .20 and may need updating) - run it before merge.

## Verdict: NOT READY (17% -> 33% best, band 60-70).
## Questions (recommendation first)
1. Ladder exhausted; what next? REC: a new lane taking a fresh lever on non-fire phase-1 damage (HER CROWN / PORTAL SHARD / HEARTH JET, and the unattributed '?' source), starting from this branch's round-2 numbers (cap .15, every 30); then n=36. Alt: hallHp 2400 -> 2150 (knob 4) - the earlier lane found 1900 did not help, so low odds.
2. Keep cap .15 / every 30 on the branch? REC: yes (they are flag-ON only and the best measured state).
