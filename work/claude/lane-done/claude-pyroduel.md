# THE PYROMANCER as a mirror duel: lane report (claude/pyroduel)

Brief (Daniel, 2026-09-28): "the Pyromancer boss should be a tad harder and play more like a duel where they jump on
platforms and use their regular/heavy attacks." Built on claude/throwables 02b2a64 (carry & throw, the water buckets, and the
follow-up that added racks by every fire). origin/master had not moved (cd35d24 is already in the base).

## What changed

**1. The mirror duel (`src/main.js`, `updatePyromancer` and helpers).** He now fights with the Pyromancer hero's own staff:
- **Her run of three** (`cutTell` > `cut`, three times). Every cut has its own told windup with a yellow `!`. The first is told
  0.42 s, the next two 0.30 s and 0.34 s. Each cut runs on her swing's clock: 0.3 s long, live from 0.04 to 0.18. The reach is
  her 32 px thrust scaled to his 1.4 size (45 px). The third cut is heavier (12, against 9) and shoves, the way hers does.
  The numbers come from one table, `PYRO_STAFF`, which the hero's `attackBox` now reads too, so a change to her staff changes
  his. The frames are hers: the boss draws through `attackPose('pyro', …)` from `src/attack-animation.js` over her baked kit,
  so he shows her thrust, the run's second cut `atkB`, and her held-blow frames.
- **Her held blow, THE BELLOWS** (`bellowsTell` > `bellows`). The flame gathers back low, then a cone of fire comes off the
  staff (88 px, 14 damage). It goes through a guard as hers does, so it wears a red `!!`. He throws it a step out from you,
  and also when you stand behind a raised shield (he answers a turtle).
- **One spell, the ember.** It is the same told 3-ember volley as before, `!`. The jet, the cinder step, the fire wall and the
  wisp are gone.
- **He hops the stalls** (`hopCrouch` > `hop` > `land`). If you are on another floor, he makes a ballistic hop to a spot
  beside you: up onto your stall, or down to the floor. The hop is not a blow and lands on nobody, so it has no mark. He
  reads the stalls off the grid (`pyroStalls`), so they are not hard-coded.
- **Phase two, "HE TAKES THE STALLS":** his run of three ends in the Bellows instead of the third cut. He also hops up onto a
  stall to lob one ember volley down, then comes back to your floor.
- The heat, vent and overheat design is kept as it was (the class's meter, `squareHeat`, the struck-while-hot opening).
  Each cut adds 8 heat.

**2. He reads you (`pyroReads`, called from `hurtEnemy0`).** A light blow, sweep, dash or shot counts toward a run if it
comes within 1.4 s of the last one. After two he shows "HE READS YOU" with a guard pose and a pale arc in front of him, and
the third is **BLOCKED**: no damage and a small push off his staff, never a stun. A heavy or a plunge goes through and breaks
the read. Spells, burns and the bucket are never read, and while he is open he reads nothing. A one-time hint tells the
player to hold attack.

**3. The bucket opening (`pyroDouse`, reading `PYRO_HIT_FIELD`).** When a thrown bucket reaches him, his heat drops to 0, the
square goes out with it, and he is **DOUSED**: staggered and OPEN for 3.0 s, taking ×1.5 like the overheat. He then stays wet
for 6 s and drips. A bucket that lands while he is open or wet only cools him, so there is no lock. `stepBucketFlight` now
checks for him before the burning-floor targets. Without that, his own lit floor between you and him drank every bucket
(found by the new check). There are two new racks in `src/burning-village.js`: a rain butt at the east wall (492) and one up
on the middle stall (476), off the floor his heat lights. With the pump at the west door, no tile of his square is more
than 10 tiles from a rack (the check allows 12). A one-time hint at his wake says to throw a bucket at him.

**4. A tad harder, and fair.** Health went from 510 to 587 (+15%). A cut that **lands ends his run** (`cutEnd`), so there is
never a second blow into a hero still reeling. Every blow is told. `src/marks.js` was regenerated (`node tools/tells.mjs --write`)
and the stale `wallTell`/`wispTell` rows were removed from its THROWN/QUIET lists. The bestiary line now describes the duel.

**5. The bot (`src/lab.js`).** It guards the cuts (heroes with a shield) or steps out of reach, leaves the Bellows' cone,
and rolls or waits out the vent. It hears his read: with two blows in a row it holds attack for a heavy instead of a third
tap. It throws buckets: while he is dry and not open, it walks to the nearest floor rack, presses INTERACT, walks to a few
steps off him and presses ATTACK. `tools/pyromancer-pilot.mjs` now takes a hero list (`node tools/pyromancer-pilot.mjs 1 knight,warden,pyro`).

**6. `tools/pyro-duel.mjs` (new, in `tools/check.mjs`).** It checks items 1-4. It was red on 02b2a64 in a throwaway
worktree: every page assertion failed (no cuts, no Bellows, no stalls known, the third blow landed, no douse), and so did
the racks and marks assertions. It is green now.

## Pilot (normal health, 1 seed, one life)

| hero | BEFORE (02b2a64) | AFTER |
|---|---|---|
| knight | win 71.5 s, 28 hp left, opened 0 | win 49.9 s, 19 hp left, opened 4 (2 douses, 2 overheats) |
| warden | win 63.8 s, 22 hp left, opened 1 | **death** at 52.2 s, boss at 12%, opened 2 (douses) |
| pyro | win 61.5 s, 36 hp left, opened 2 | win 81.5 s, 34 hp left, opened 3 (2 douses, 1 overheat) |

Before, 3/3 won (median 63.8 s). After, 2/3 won (median win 81.5 s), and the bot lost more health. That is harder, as
asked. The bot threw buckets and landed them twice in every fight. After, most of the damage came from his cuts
(`hitBy.cut` 35 and 55 for the knight and warden) and the Bellows, where before it came from the jet, the staff and the
embers.

## Checks run (all green)

pyro-duel (new), burning-village, throwables, boss-openings, tells, arena-supplies, content-audit, boss-fight-end,
lab-reach, audit, zoom-coverage, village-stakes, class-spurs, textfit (bestiary, hints: 0 overflow; its 7 LONGHINTs are
existing hints, none of them this lane's). The required seven: architecture, checkpoints, skins, dangling-paths,
slopes-trace (unchanged, no rebase), npc-removal.

`tools/burning-village.mjs`'s "his attacks heat him" (≥ 8 heat) failed at 5 heat a cut. I raised the cut's heat to 8
rather than touch the test.

There is no answer-tags check on this branch, so there was none to run.

## UNVERIFIED

- Only hand-checked in the harness. No human playtest of the feel: the hop arc, the 0.30 s follow-up tells, the guard
  arc's readability.
- The pilot rows log some damage under `stalk`/`ventTell`/`cutTell`. This is damage taken while he was in those modes: an
  ember still in flight, or the lit floor. They are not untold blows (`tools/tells.mjs` traces every blow to a mark). The
  bot does sometimes stand in the burning square.
- The warden's one loss is one seed. A 4-pass pilot would say whether the warden is now under the bar.

## QUESTIONS FOR DANIEL

1. **Platforms: I added none.** The square's three market stalls (3 tiles up, 5 wide) already give a floor/stall duel that
   every hero can jump, so he hops between those. Recommendation: keep it. If you want more vertical play, a second tier
   of awnings would be a level change (slopes-trace rebase for burning).
2. **His one spell is the ember.** The Bellows already is the cone, so I cut the jet as a duplicate. Recommendation: keep
   the ember. The alternative would be the cinder step (a dash leaving fire).
3. **He answers a raised shield with the Bellows.** This mirrors "reads your attacks". Recommendation: keep it. If the
   shield heroes find it harsh, drop the `P.block` clause and he throws it only one decision in three.
4. **Difficulty.** Recommendation: leave the numbers and playtest. If it is too much, ease it by the opening (a longer
   douse than 3 s, or a shorter wet window than 6 s), not by cutting the duel.
