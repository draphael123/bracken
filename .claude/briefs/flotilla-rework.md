# THE FLOTILLA LONGER + THE QUARTERMASTER SLOWER (Daniel, 2026-09-22)

## What Daniel asked for
"Flotilla needs to be a lot longer with areas where you climb between ships at the top of masts. The boss is also a little
too fast with his attacks, particularly since he has so many unlockable attacks." (The Quartermaster is 'quarter' in code;
the game calls her SHE.)

## Today (measured 2026-09-22)
- `theFlotilla()` in src/level.js: 400 x 40, four hulls lashed together, the arena x 258-374 (floor row 22). ~258 columns of
  road before her. Its rigging ropes pass through one-way decks at x 50 (row 11) and x 145 (row 10): the climb stops under
  the deck and you jump through it (tools/route-breaks.mjs on branch claude/prep; docs/route-breaks-0922.md).
- `updateQuarter` in src/main.js (find it by `function updateQuarter(`): she chooses in `case 'stride'` by timers - cut
  (slashTell 0.42 s, 0.30 s in phase 3; slashT 2.2 -> 1.5 s), EN GARDE (stanceTell 0.9, red, every 7 s -> 5 s), the shot
  (shootTell 0.6 s, 0.45 s in phase 3, red, unblockable; shotT 2.8 -> 2.0 s); stride 74 px/s, 92 in phase 3. Phases at 66% and
  33% hp (she LEAPS to a higher deck; in phase 3 SHE CUTS THE SHIP and the main deck falls plank by plank - updateDeckFall).
  560 hp. The lab has a walker bot for her (`PT.makeBot`, src/lab.js).
- The problem is the ESCALATION: each phase adds pressure by SHORTENING her tells and cooldowns, on top of the deck changes,
  the leaps and the falling deck. A 0.30 s tell at the default game speed (0.6) is half a real second - too fast to read
  while the floor is going. House lesson: escalate by adding what she does, never by making the same thing unreadable.

## 1. THE RIGGING (the level, +150-200 columns before her, H 40 -> ~56 for the masts)
Between the hulls the way is UP: climb a mast, cross at the top, come down on the next ship.
- MASTS climbed by their SHROUDS (rope/NET), the CROW'S NEST at the top a small platform to fight or rest on.
- CROSSING AT THE TOP, three ways, one per crossing so each reads: YARDARMS as ledges that reach toward the next ship's yard (a
  jump between them); a STAY - a rope run from masthead to masthead that you slide down (Stormhold's zipLines/ropes code,
  `L.zipLines`); a HALYARD you swing on (swings, moversExtra kind 'swing').
- A LOW ROUTE is always there but worse: the water between the hulls with boarding nets and something that bites (eels,
  a lamprey) - never deadly unless marked, so a fall from the rigging is a way down, not a death.
- ENEMIES as encounters round the verb: a LOOKOUT in each crow's nest (the existing 'lookout'), PETRELS diving at climbers,
  a BOARDER swinging across on a halyard, a SAILER (the flying goblin) over the widest gap. Groups of 3-5, quiet between -
  not an even sprinkle (Daniel, 2026-09-22, on the Witchlight Stair).
- A landmark crossing: the tallest mast, the flagship's, with the pennant at the top - the silver is up there.
- Fix the rope-through-deck clunk while here: in the climb code's "over the top" test (the LADDERS block in updatePlayer)
  keep climbing when the tile above is ONEWAY and the rope continues above it. One line, every such crossing in the game.
- Hook-in: theFlotilla() builds four hulls - add the rigging with grow() between hulls 2 and 3 (or after hull 3, before her
  arena), and shift every hand-placed x past the seam (ELITES 'flotilla', REVIEW, tools). Keep ropes hung LAST.

## 2. THE QUARTERMASTER, SLOWER TO READ (numbers, then a pilot)
Proposed (pilot before and after; target 60-75% at normal health, 24 fights, with jitter so passes differ):
| | today | proposed |
|---|---|---|
| cut tell (slashTell) | 0.42 s, p3 0.30 | 0.55 s, p3 0.50 (never shorter than phase 1 by more than 0.05) |
| cut cooldown (slashT) | 2.2 s, p3 1.5 | 2.8 s, p3 2.2 |
| shot tell (shootTell) | 0.60 s, p3 0.45 | 0.80 s, p3 0.70 |
| shot cooldown (shotT) | 2.8 s, p3 2.0 | 3.4 s, p3 2.8 |
| en garde (stanceT) | 7 s, p3 5 | 7 s, p3 6 |
| stride | 74, p3 92 px/s | 74, p3 82 |
Phase 3 keeps its menace from what it ADDS (she cuts the ship, the deck falls, the leaps), not from faster tells. One windup
at a time: no cut tell starting while the shot's tell runs. Keep EN GARDE's answer (wait out the point) as the opening.

## Size
The rigging ~1 session (+ the rope fix); her tuning ~1-2 hours with the pilot. One `npm run check`, no deploy without Daniel.
