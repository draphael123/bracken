# claude/owl2: THE OWL REEVE 2 (Hanging Village boss + crown arena)

Branch `claude/owl2` off master 3595a284. Only the boss and the crown arena were touched. The level itself is unchanged.

## What she does now
- **SWOOP = DUCK.** On takeoff she drops to the boards about 150 px to your side. She holds there on a told HIGH line, a dashed red and white line at head height, with `!!` and the DUCK lane. Then she runs that line. Her talon band ends `OWL_LINE - 2` px above the boards. A crouched hero (DUCK_H 8) passes under it and a standing hero (14) is hit. A ducked hero is not invulnerable, just not where she is. The swoop is unblockable, and it ends about 80 px past you.
- **SKIM = JUMP.** No change: an ankle-height told low line. `ANSWER`/`HEIGHT` rows added: swoopTell duck/high, skimTell jump/low.
- **BOUGH SHAKE** is phase 1's new move. She flies to the high bough above you and grips it. 4 shadows (5 in phase 2), 46 px apart, are drawn on the boards with needles trickling down. Then cones and shingles fall into them. Gaps are wide enough to stand in. Unblockable `!!`.
- **LAMP DROP** is phase 2's new move. She takes a lit floor lantern (it goes dark on its post) and carries it over you. A told 80 px strip is marked on the boards while she holds it, then she drops it. The oil burns that strip for 3.5 s.
- **Cycle is a bag** (`OWL_BAG`). Swoop is 3 of 13 (phase 1) or 3 of 15 (phase 2). She never repeats a move twice in a row. Measured over 60 draws per phase, the swoop is about 23% and every other move is lower.
- **Off the x0.05 chip (B15).** `GREED.chipBy.owl = 0.4`: she takes 0.4 of a blow wherever you can reach her (perch, mantle, passes).
  - Openings (`owlTake`): lamp crash or light in her eyes x2, with a gold ring on the boards and a timer bar over her head (B10). Grounded without a lamp x1.5, pinned under the bough x1.6.
  - **Ward (B3).** When any opening ends she GATHERS HERSELF for 3 s, shown by a ring. Blows land 0 (WARDED clank), and no lamp, crash or bough affects her.
- **Low dazzle removed.** She used to be dazzled by any lit lamp within 110 px while low for a swoop or skim. Now the crash happens only if the lamp is in her line (that was a near-free stun on every swoop).
- **Tuning (tuned with flasks, per the coordinator's target change):**
  - Sit time between moves 2.0/1.4 → 1.0/0.8 s.
  - Crash window 2.2/1.8 s.
  - Damage: swoop 38, skim 26, plunge 28, cone 24, oil 22 + 10 a tick.
  - BOSS_HIT.owl 0.85 → 1.45.
  - HP unchanged (1450).

## Crown arena
- Moonlit night sky (gradient, twinkling stars, moon with halo).
- Far hanging-village trees with huts and lit windows, and this village's rooftops below the boards.
- Dead pine redrawn: bark, knots, broken limbs, moss; the bough is barked, mossed and twigged, with dead needles.
- Festoons of paper lanterns under the bough; feathers and needles drifting down; glow pools under the floor lamps.
- **The three perch lanterns now HANG.** Each is the lamp head on a chain off a limb of the bough (`src/hanging-village.js drawCrown`). They used to be posts standing about 4 px above the planks, and a holder bracket drawn mid-post hung from nothing; that bracket is removed for perch lamps.
- **Floaters check extended.** `tools/floaters.mjs` used to skip `perch` lamps. It now requires every hung lamp to have rock over it or a level beam (`L.hangers`, which here is the crown bough `[22, 88, 3]`). The 3 lamps are now checked: 2918 things, all pass.

## Rates (campaign L7, practiced, tools/boss-rates.mjs)
| profile | knight | warden | pyro | total |
|---|---|---|---|---|
| **human (flasks), the target** | 6/10 | 8/10 | 6/10 | **67%** (band 60-70) |
| human+dry | 6/10 | 8/10 | 3/10 | 57% |
| baseline before (dry) | 2/6 | 6/6 | 1/6 | 50% |

- Fights mostly run 90-150 s (about 80-180 s at the extremes).
- Mash 0/6 (bot dies, she has 82-100% left). Only her boss row in `docs/mash-bot.json` was re-stamped.

## Checks (all green, run alone on PORT 8751)
- owl-lamps, duck, floaters, boss-greed, boss-read, tells (MARK regenerated with `--write`), answer-tags, arena-shut, goblin-lint.
- **New `tools/owl-swoop.mjs`**, added to `tools/check.mjs`:
  - For all 7 heroes: ducking under the swoop takes 0 and standing takes damage.
  - Bough shadows hit you in a shadow and miss you in a gap.
  - The lamp strip burns you inside it and not outside it.
  - Damage numbers: crash x2, boards x1.5, 0.4 outside openings, 0 in the ward; the ward rises after an opening.
  - No move is over 35% of her cycle in either phase.
- **mark-integrity:** it is not on this branch (it lives on `claude/mothermarks`). I ran that branch's copy here as an untracked file, `MI_ONLY=owl MI_SECS=200`, then deleted it. Swoop (17 seen), skim, fan and shake are all drawn and all land. The lamp drop was not reached in that run; owl-swoop.mjs covers it.

## Notes
- **Bot-hands bug found (`src/lab.js`):** `duckNow` only ducks a guard-holding hero (knight, paladin, reaper, geomancer) while the mark is red. During a boss's release mode, such as `swoop`, there is no mark, so the knight never ducked a boss's red high blow once it started.
  - I fixed it for the owl only (`owlDuck`) so other bosses' measured rates do not move.
  - The same gap probably affects the Wicker Queen's, Cistern Queen's, Djinn's and Puppeteer's high red blows for shield heroes. Worth a look by the bot lane.
- The reaper and geomancer lose a little blood while crouching from their own crouch twists. owl-swoop counts only damage from her talons.

## QUESTIONS FOR DANIEL
1. Should the swoop stay unblockable (a shield doesn't turn talons, matching the skim)? I recommend yes, and that is what I built: duck/jump is the readable pair. The old swoop was parryable.
2. Should she wake with every lamp in the crown lit ("the village lights up")? That was already true and I kept it. I recommend keeping it, since the first opening comes quickly.
3. Is the BOSS_HIT 1.45 tuning acceptable? Her blows that land now hurt (a swoop is about a third of an L7 bar) because the bot reads her told pairs almost perfectly. I recommend it, and that is what I built. If it feels too spiky when you play her, the alternative is fewer openings: lamps that burn out on a crash.

## Music
No change (`owlreeve`).
