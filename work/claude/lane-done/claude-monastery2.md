# claude/monastery2 - THE TEMPLE GUARDIAN 2 + THE MONASTERY fixes (Opus, 2026-10-08)

Branch claude/monastery2, off live master 3595a284 (batch79). Port 8752 only. Brief: scratch/brief-temple2.md, the whole file, including
the section added after the review. Review: scratch/review-monastery.md.

## THE GUARDIAN (src/temple-guardian.js, new; main.js wiring; lab bot in src/lab.js)
- **The fall-through bug.** The cause was the old shroud. It laid T.ICE tiles. src/slopes.js moveBodySquare lands a falling body only on
  SOLID, CRATE, PALISADE, PORT, CLIMB or SOFT, so ICE was a wall from the side and from below but not from above. A page probe dropped a hero
  on each raised tile and the hero fell through to the floor. Raised blocks are now T.SOLID with the rubble skin. A block is never raised on a
  hero or on the guardian (no soft-lock). If a hero ends up inside a block, unstick() lifts the hero out on top. tools/temple-guardian.mjs
  checks this for knight, warden and pyro: drop onto a block, walk into it, start inside it, and stand where it would rise.
- **The bells stagger it.** One shared `bellNote(pr)` handles every bell. It draws a gold ring (96 px) that dazes goblins, birds and priests for
  1.5 s and breaks the priests' blessings. In the hall, if the guardian is inside that bell's drawn reach (84 px either side, shown as a band on
  the floor that turns gold when it is in reach), the guardian is STAGGERED. While staggered it stands still under a gold ring with a timer bar
  (B10) and takes 2x damage. After that comes a told 3.5 s WARD: a pale shell, no stagger from a bell or a thrown block, and blades still land at
  the 0.4x floor. The same bellNote runs on the drawbridge bell, the flue bell and the new tower-2 bell.
- **The blocks are ammo, both ways.** It RAISES blocks of its floor (2 at most). INTERACT takes one and ATTACK throws it, using src/carry-throw.js
  'stone' with the told arc and landing ring; THROW_KIND.stone is added. A block that lands on the guardian staggers it. When the guardian is
  HURT (each quarter of its health broken, and on a clock: 10 s in phase 1, 7 s in phase 2) it tears its blocks up and HURLS them. The hurl is
  told: the block lifts, a red landing ring shows, it deals 30 and can be blocked.
- **New attack: BELL TOLL.** Its tell is !! plus 'THE BELLS SWING'. Its staff hits the floor and a ring of sound runs along the floor each way
  (jump it, 24, unblockable). The hall bells then swing for 1.8 s and cannot be struck ('THE BELL IS SWINGING').
- **Much bigger, same look.** Every frame is drawn at 2x, pixel for pixel: 80x80 sprite, 56x66 body. The hall is raised to rows 46-55 and
  widened to columns 30-56. There are two bell galleries 3 rows up (a legal jump for every hero), and each bell hangs over its gallery.
- **Off the x0.05 chip.** Blades outside an opening land at x0.4 (B15) with a clank and the key's word: THROW IT, RING A BELL or WARDED.
  Staggered, blades land at x2. OPEN_RULE.golem is now `open > 0`. HP went from 660 to 1500, and the stagger lasts 1.7 s (1.5 s in phase 2).
- **The cycle.** No move is over 35% of the fight. walk is 33-45% (that is movement, not an attack) and stagger is 16-34%; every attack is 2-13%.
- **Measured at campaign level L8, 6 seeds per hero.** Before the rework, dry: 4/6 2/6 4/6 = 56%, fights 24-55 s.
  | profile | knight | warden | pyro | total |
  |---|---|---|---|---|
  | **human** (flasks, the target) | 4/6 | 5/6 | 2/6 | **61%**, inside the 60-70% band |
  | human+dry | 3/6 | 2/6 | 2/6 | 39% |

  Fights run 75-145 s. Mash: 0/6 (all six DEAD at 35 s with the guardian on 92-96%).
  Note that tools/boss-rates.mjs prints its mini band (70-75) and so says "LOW" on this row. See question 1.

## THE LEVEL (src/level.js theMonastery; main.js monk props)
- **M1/M2:** removed the crawl brazier (a tile off the floor) and the dead third wheel (its stair was under the roof). New EXAM:
  **THE STAIR GOES OUT FROM UNDER HIM** (idea c). The roof's well is sunk two rows and has a thorn pit (exam span 38-40, a real death).
  The last prayer wheel's stair is the way up to the ringing floor, with a troll on it and the squad's priest below. Striking a wheel while a
  foe stands on its stair drops that foe for 30% of its health plus a daze (main.js wheel strike).
- **STRIKE THE CENSER** (idea a): a blow makes any brazier breathe now. It is then spent for 3 s (dark bowl, coals). SNUFFED braziers
  (terrace 3, flue 2, bellows 2) only breathe when struck, and a sign teaches this at the first one.
- **EMBER BRAZIERS** (idea d): bellows 2 and 3. Their coals bring a harpy that is over them down.
- **THE BELL IS A NOTE** (idea b): the shared ring, plus a new bell in tower 2 that lets the monks' OFFERING down from its basket. The
  offering is gold, because the wood keeps three silvers (see question 3).
- **Forgiving rides:** terrace 1's landing now reaches back over the column. The bellows landing board runs under plume 2, so a miss lands
  back on it instead of 12 rows down. The bellows 2 platform starts a tile closer.
- **M3:** the bellows lip (a grass slab in the sky) is removed. The last hop's two stones are laid masonry, each on its own pier.
- **M4:** posts (hangers) under the scaffold, the side routes' goat paths, the bellows boards, the terrace boards and the hall galleries.
- **M5:** plume 1 now lands on its board.
- **M6:** a STUCK spot (glint plus 10 s nudge) for every incense column, bridge bell and wheel: 13 new spots.
- **M7:** a silver in the bellows alcove. Level-quality secrets went from 1 to 3.
- **M8:** each cellar has a step under its trapdoor's end. The sentry is moved out of the root cellar. The plate is NOT a bug: the pyro does
  spring it (probed for all three heroes); the pyro simply outruns the falling cage.
- **Difficulty v2:** harpies over the terrace-2 and flue rides (foes at platforming moments), plus the exam. The level mash loses with every
  hero (2 deaths each, lowest hp 0%).

## NEW CHECKS (all in tools/check.mjs)
- tools/temple-guardian.mjs
- tools/monk-machines.mjs: wheel-arm headroom and climb for both states, solid-islands on monk levels, bells on footing.
- tools/floaters.mjs: vent footing, game-wide.
- tools/stuck.mjs: every monk bell, wheel and incense vent has a spot.
- tools/monastery3-beats.mjs: re-pinned to the new design at the same strictness. It used to pin the dead wheel at 77,34, the crawl
  vent and the lip, all of which were review must-fixes.

## STAMPS
docs/mash-bot.json spire is re-stamped, level first and then the boss and mini. docs/level1-curve.json spire is re-stamped
(knight: 1 death, 15 hits, 3 runs). tools/hint-shown-silent.txt only shrank. src/checkpoint-thin.js: the spire drop moved from 24,55 to
22,55 because the hall's checkpoint moved.

## CHECKS RUN (port 8752), all green
temple-guardian, monk-machines, floaters, stuck (static + runtime, 86 spots), level-quality (spire clears the bar), mash-gate, small-adds,
lab-reach, gob-priest, elites, sprinkle-cap, one-new-foe, monastery3-beats, hint-shown, signs, architecture, floating-geometry, survival,
untold-told, checkpoints, checkpoint-gaps, boss-greed, boss-read, throwables, bells, zoom-coverage, content-audit, mini-walls, mini-names,
level-walk-selftest, weak-bosses, boss-openings, rule-openings, curve-gate, death-cost, dressing, boss-fight-end, goblin-lint,
killzones, traps, deadends, footing-art, map-spacing. The full suite was not run (the coordinator runs suites).

## WHAT IS NOT DONE / RED
- **Walker coverage is still partial.** The walker now rides the incense, strikes cold censers, wheels and bells (src/walk-hints.js spire), and
  the terrace and the scriptorium wheel pass. It still stalls on the zig-zag landing stairs: the stacks at 67,141, tower 1 at 12,123, and the
  cloister wheel stair at 30,88. These are walker-hand gaps; the review proved them passable with real keys. So difficulty v2 is still read
  mostly from the mash bot and the pilot, and "first run = 1-2 deaths, arrive < 50%" is not yet measurable on most of the level.
- **CP after the exam:** the well exits straight into the Abbot's arena (its trigger is x 40), so the last checkpoint is the one before the
  exam (12,35, through the well).

## QUESTIONS FOR DANIEL (recommendation first)
1. **Which band for the Guardian?** It is a MINI slot in the level (L.mini), but the brief and the coordinator gave it the boss band. Rec: keep
   the boss band, 60-70% with flasks (built: 61%). The standard's mini band (75-85% with flasks) would mean easing it back.
2. **The exam troll is a plain troll, not an elite.** The well lies within 2 rows of the Abbot's floor, and tools/elites.mjs keeps elites out of
   any room box. Rec: keep it plain (it is heavy anyway), or move the exam to a deeper stair in a later pass.
3. **The offering bell's reward.** The wood keeps three silvers (silverTrim), so the offering gives gold. Rec: keep it as gold, with the
   silvers in the loft, the bellows alcove and the vault.
4. **The plate-and-cage.** Rec: leave it as it is (it works). The review's "lure one onto the plate" was not one of the four approved ideas.
5. **Music:** none needed (the hall keeps "Boss Battle #6", CC0).
