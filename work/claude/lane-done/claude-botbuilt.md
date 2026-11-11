# BOTBUILT (lane C, sonnet) - 11-03
Branch claude/botbuilt off claude/botmem 8447adb4, worktree bracken-botbuilt. Tip: see `git log -1` on the branch (WIP 10405aa6 + the report commit). NOT merged, NOT deployed (merge after the 11-07 demo cut). docs/*.json untouched.

## What changed (src/lab-perceive.js, src/lab.js small, src/bot-profile.js, tools/boss-run.mjs, tools/boss-rates.mjs)
- GENERIC ULT HAND (lab-perceive makeSkillHands): any hero with an ultimate registered in src/ultimate.js (ultHas/ultReady) presses UP+C at a full meter, boss in reach (bot-profile ULT_RANGE: default 220/dy40, knight 140/24, geomancer 220/40, ranger 50-300/30), not winding up (or OPEN). Future ults need no bot change. Counted: casts.ultTry (presses), casts.ult (meter really spent). Only runs with opts.skills (the `built` way).
- LOUD BUILD CHECK (bot-profile buildGaps): built rows print `!!BUILD-GAP` when a slotted skill has no SKILL_RANGE entry (never cast) or the hero's TYPICAL_SKILLS is empty; boss-rates ends with `!!BUILD-GAP <hero>: ...` lines and `BUILT CASTS` per hero.
- BUILT AS A COLUMN, SAME n: boss-rates built-seeds default = seeds (was ceil(n/2)); table gets `built-bare +/-N pts`. Band still read on --band-way (default practiced = the bare floor); `--band-way=built` reads it on built. No retune anywhere.
- HQ TELL TABLE: bot-profile PARRY_TELLS {hornetqueen: {dive: eta fn}} replaces the /Tell$/ regex gap in humanGuard, ONLY for profiles with tellTable (person, or `human+tells`). Her stoop (mode 'dive', eta = (P.y-b.y)/max(60,vy), same eta as hornet-queen-plan) is now a parry tell. Her wind-up 'aim' is not a hit, left out. Other bosses: no census done (see Q2).
- PROFILE `person` (opt-in, never default): human + tellTable + guard offset N(+25 ms, 40 ms) + 8% guard lapses + per-seed player (reaction x U[0.85,1.3]) + fatigue (reactions +15% after 120 s). Knobs are uncalibrated guesses from the audit (no playrec logs yet, audit Q4).

## Byte-identical proof (human, legacy path)
`boss-rates hornetsnest --heroes=knight --ways=practiced --seeds=6 --profile human`, before (8447adb4) vs after: all 6 fight lines identical (s1-s5 in the first pass; s6 had an infra `page CRASHED`, rerun alone = identical line). `diff` empty. Built knight rows unchanged too (no ultimate at L3). Every touched line is gated: rtk()=1 for human, humanGuard's ent undefined, ult hand only under opts.skills.

## Built vs practiced, n=6 a hero (knight/warden/pyro, normal, kit flasks), 95% Wilson
| boss | L | practiced (bare) | built | built-bare | casts (built) |
|---|---|---|---|---|---|
| rootway | 6 | 0/6 2/6 5/6 = 7/18 39% [20-61] | 4/6 3/6 6/6 = 13/18 72% [49-88] | +33 | knight groundSlam 442, warden setSpears 62 + javelin 212, pyro fireWall 119 + meteor 62 |
| kings | 9 | 5/6 4/6 5/6 = 14/18 78% [55-91] | 3/6 1/6 6/6 = 10/18 56% [34-75] | -22 | same kits |
| hornetsnest | 3 | 2/6 2/6 3/6 = 7/18 39% [20-61] | 3/6 6/6 6/6 = 15/18 83% [61-94] | +44 | knight shieldThrow 64, warden skewer 59, pyro vent 257 |
All three read UNSURE against 60-70 on either way (n=18 interval spans an edge). Rootway had two infra crashes (practiced knight s3, built warden s5), rerun alone and merged in. Read: built is not uniformly easier (kings -22: the typical build does worse than bare there - a real finding, or the skill hands spend openings; worth a look before anyone retunes). No ultimate fired for knight/warden/pyro (knight needs 3 links; none registered for warden/pyro).
ULT PROBE (rootway built, n=3 each): ranger casts {ultTry 7, ult 4} = the hand works (GREAT ARROW). Geomancer 0 (TYPICAL_SKILLS empty -> no board to fill -> AVALANCHE never ready); paladin has no ult registered.
PERSON (hornetsnest knight practiced n=6, seeds 1-6): 2/6 33% (same as human); guard counters raised/tried/tells 3/4/4, 2/4/5, 1/1/4, 0/1/2, 1/2/3, 1/2/3 vs human 0-1/0-1/0-2 (human on s1-s6: tells 0,1,2,2,0,0): the stoop is now seen as a tell. Dive parries land rarely (par 0-1 per fight).
hornetsnest knight human guard counters (> 0 required): s2 1/1/1, s3 0/0/2, s4 1/1/2 etc: tells > 0 in 3 of 6 rows (unchanged, by design).

## Checks (RAM 1.1-6.9 GB free before each; one browser at a time)
- herald-pirate PASS (43 s), combat-replay PASS (73 s), lab-clock PASS (36 s), lab-reach PASS 72 pairs (198 s), normal-health PASS (85 s).
- boss-fight-end: 68 of 69 ok; `fallingtower undeadmage UNKILLABLE BY SCRIPT` = the same result on the untouched claude/botmem tree (8447adb4), so PRE-EXISTING, not from this lane (the check never drives bossLab). Reported as a hole in the check; not touched.
- boss-rates hornetsnest knight prints guard counters: yes (see above). node --check on all touched files.
- NOT run (per brief): tools/check.mjs, larger tables, all-demo-boss built-band report.

## OWED / known
- No byte-identical check on a non-HQ boss row (hornetsnest only, 6 fights); the other lab checks above passed on legacy.
- TYPICAL_SKILLS still empty for pirate/berserker/ranger/geomancer, and most pirate/geomancer/berserker/ranger/paladin active skills lack SKILL_RANGE: the loud check now says so, nothing guessed.
- person knobs uncalibrated.

## Questions (rec first)
1. Fill TYPICAL_SKILLS + SKILL_RANGE for pirate/berserker/ranger/geomancer/paladin (hammerLeap)? REC: yes, one small lane with each hero's owner, before the all-boss built report (else built = bare for those heroes).
2. Census every boss's windup modes for non-*Tell parry windups and fill PARRY_TELLS? REC: yes, a short sonnet lane (read-only census, then table), person only.
3. Investigate kings built -22 before reading any band on built? REC: yes (compare casts vs openings on 3 seeds).
4. Make `person` the band profile? REC: no until calibrated against recorded fights; keep human standard.
5. fallingtower undeadmage UNKILLABLE BY SCRIPT in boss-fight-end: separate fix? REC: yes, small lane (pre-existing).
