# Combat tuning, measured (2026-09-22): making common fights last long enough to matter

The feel probe found three in four common fights end in one swing. Measured on the live game with the game's own fight bot
(`BK.fightLab`: each hero against the common foes in an early, a middle and a late level, 2 reps), scaling enemy health live
(`BK.EHP`). The bot reacts to tells the way its hero does (the knight blocks, the Freebooter parries, etc.).

## Uniform scaling is the wrong lever (the knight, all ten lab foes)
| enemy health | one-swing fights | swings per kill | time to kill | health lost / fight | not beaten |
|---|---|---|---|---|---|
| x1.0 (now) | 23/30 | 1.9 | 1.06 s | 0% | 0 |
| x1.6 | 16/30 | 5.4 | 1.92 s | 1.9% | 0 |
| x2.2 | 12/30 | 8.3 | 2.19 s | 3.0% | 1 |
| x2.8 | 9/30 | 11.8 | 2.45 s | 4.1% | 2 |
The fodder moves into a good range, but the tough foes balloon: at x2.8 the hedge knight takes 15+ s and 30-40% of your health (or is
not beaten), the sworn sword and tide guard go from 2-3 swings to 15-20. And archers, harpies and scouts still die in ONE swing at any
health: they fall to their family's key verb (their weak point), not to damage - by design, and a good thing.

## The recommendation: fodder health x2.4, nothing else
Scaling only the fodder (sprig, shield goblin, cutlass, crab, scout, archer, harpy) and leaving the tough foes as they are:
| | fodder fights ending in one swing | swings per fodder kill | fodder time to kill | health lost | deaths |
|---|---|---|---|---|---|
| knight, now | 21/21 | 1.0 | 0.67 s | 0% | 0 |
| **knight, fodder x2.4** | **10/21** | **1.8** (2-4 in the middle and late game) | **1.03 s** (1-1.6 s late) | 0% | 0 |
| Freebooter, now | 20/21 | 1.0 | 0.57 s | 6.5% | 3 |
| Freebooter, fodder x2.4 | 16/21 | 1.2 | 0.66 s | 7.2% | 2 |
- The early game (Bracken Wood) stays at 1-2 swings, which is right for learning the verbs; the middle and late game gets fights of
  2-4 blows where tells, blocks and poise come up. Nothing gets more dangerous: the knight still loses no health.
- **Apply it as a per-type health multiplier on the fodder** (the EHP table, or the tier scaling for these types), not a global one.
  Other common types (sporeling, lurker, thief, hound, miner, bat, snuffer, sailer, soldier...) should get the same treatment
  measured the same way in the integration session: `BK.fightLab({ foes: [...], heroes: [...] })` before and after.
- The new desert foes and the tome are already built to this (the tome: 3 light blows, 2 once shut).

## A separate finding: THE FREEBOOTER kills fodder in 0.28 s whatever its health
Even a 126-health cutlass pirate falls in 0.28 s to one Freebooter action, while he dies 2-3 times in the same runs. That is a mechanic
that ignores health (a finisher, or the pistol's effect), not a number to tune. He is a glass cannon with an instant kill. Look at what
kills in 0.28 s before touching his numbers; it may be intended, but it makes his common fights trivial and his deaths the only risk.

## The other heroes
Only the knight and the Freebooter were measured with the fodder change. The pyromancer, paladin, death knight and warden should be run
through the same two lab passes before it ships.
