# LANE REPORT: SCREE 3 TUNE (claude/scree3, sonnet)
NOT merged, NOT deployed.

## Cause (level-quality scree curve row: 8 deaths vs act-2 cap 6)
Pilot events + hit log (BK.hitLog) over several 1-3 run passes: the bare knight's damage is mostly the CRAG RAM (goat) charge at 34% a hit, plus rockfalls (19%) and the hill troll's rock. The deaths cluster in THE GOAT TRACK ambush room (cols 173-202: elite troll + goat + sprig + a HARPY diving over them; 4 of 8 deaths at cols 184-202), then the sapper/harpy/goat knot at col 155, the goat+rockgoblin squad + sentry + loose harpy/goat at cols 566-577, and the double goat flanking the troll at the slide's foot (cols 251/254). The level was not made harder by the build lane's edits (mill stack + sign are far from these); the row sits on the cap, so the pilot's 6 -> 8 is mostly noise on a stacked-hazard cluster. No wall/geometry unreadability found: it is stacking (a diver on top of a swat + a charge).

## Edits (src/level.js; foes only, no geometry; no checkpoints added, no foe types deleted from the level)
1. THE GOAT TRACK wave: harpy (185,8) cut -> troll + goat + sprig (the exam stays; no air diver stacked on an elite swat + a charge).
2. Slide foot: one of the two goats (final 254,13; raw G.ent 206,13) cut; the goat at 251 and the troll at 257 stay.
3. Plateau: harpy at raw 295,2 (final 579,2) cut; the goat+rockgoblin squad (scree-3), sentry and lone goat 577 stay.
4. RAM.hp 6000 -> 7200 (src/ram-lord.js), see boss rate.

## Curve before / after (knight, level 1, 3 runs; docs/level1-curve.json, level1-pilot.json, mash-bot.json restamped, hash e58f5bbb8028 -> bc7a99c1a942)
- curve: deaths 8 -> 6 (cap 6), hits 37 -> 34, lostPct 342 -> 281 (band 70-400), kills 37 -> 50, lifts 143 -> 118. Pilot row: deaths 7 -> 5, hits 41 -> 33.
- mash row: knight deaths 1 -> 9 (WARN jump; mash-gate green, the old row was 15 -> 1 after the build lane; it swings run to run).
- NOTE: the pilot is not deterministic run to run (the same level gave 5, 6 and 8 deaths across passes); 6 is AT the cap, so a future restamp can bounce. Margin if wanted: cut the sentry at 562,4 or the sapper at 158,13 (raw 158 / 562-284) - not done, kept the challenge.

## Boss rate, Ram Lord, practiced WITH flasks, n=6 per hero, L10 (logs scratch\lane-reports\scree3tune-bossrate*.log)
- hp 6000 (as built): 16/18 = 89%  (HIGH +19; fights 35-75 s, avg ~55 s)
- hp 6600: 14/18 = 78%  (HIGH +8)
- hp 7200 (KEPT): 12/18 = 67%  IN BAND (knight 1/6, warden 6/6, pyro 5/6; avg win ~64 s). Knight 1/6 is the weak cell; n=6 is noisy.
Only dial used: RAM.hp (resist floor / frontMul / openings untouched: frontMul 0.4, windows 3.2 s x6, cap 25%, never invulnerable). Fights are still shorter than the 90-150 s aim; the joint tune lane can trade hp for boulder weight.

## Checks
GREEN: level-quality scree (all rows after restamp), curve-gate, mash-gate (restamp verify), floating-geometry (scree), visible-supports scree (0), rule-fights (scree ok 6d), ambush-listed (22/22), ambush-single, deadends, ram-lord (node + page). Geometry untouched, so reach-heroes / anchor-lint unchanged (anchor-lint is inside level-quality: green).
NOT RUN: full suite, boss-fight-end / ram-pilot (hp change only), textfit.

## Questions for Daniel (recs built)
1. Ram Lord hp 7200 (+20%) to land 67% with flasks: rec keep; alt 6600 (78%, HIGH +8) if you want the fight shorter.
2. Goat Track without its harpy and one fewer goat at the slide foot: rec keep (smooths stacked spikes, exam intact); alt restore both and cut the sentry at 562 instead.
3. Curve row sits exactly on the cap (6): rec accept; alt cut the sapper (158,13) for a margin of 1-2 deaths.
