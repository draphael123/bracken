# claude/zipline - PART 1 (core + Stormhold), 2026-10-08

## Built
- `src/zipline.js` (new, shared): a level adds a rope with ONE data entry (`zipLines.push({ x0, y0, x1, y1 })`; optional speed, hang, posts, dir,
  snap/fray/bunting). `zipStep` (called by main.js `updateTowerSlides`), `drawZips` (rope, poles, a pulley + handle at BOTH ends, glint when near),
  `drawRider` (his grip over his hands), `inReach`/`findCatch`.
  - Take hold ANYWHERE along it: UP with the rope within a hand's reach (standing under it too), or just TOUCH it from a jump (not while on a ladder,
    swimming, mid-swing, rolling, plunging, or with DOWN held). A frayed (`snap`) rope is UP-only, so the Fair's bunting rope keeps its meaning.
  - Rides DOWNHILL either way (east or west). JUMP kicks off; DOWN drops; a hit lets go. A rope you let go of is not re-taken by touch until you land.
  - Whine + sparks while riding (SFX.zipCatch / zipWhine in src/audio.js); 'climb' pose while on it.
  - The Fair's snap (also where a late catch would have been): kept; tools/harvest-fair.mjs passes.
- Stormhold: the three tower ropes now end ON their floors (rope + 12 = feet), have handles, a sign at the first one (verb: UP takes the handle,
  JUMP lets go, DOWN drops) and a sign at each of the others, plus a stall-nudge spot each (src/stuck-spots.js `storm`).
  **ON THE ROUTE: the Bell Close street is breached (x322-331, spiked cut, too wide for any jump); the Bell Watch's rope is the way over.**
  Taught first at the Gate Watch (a miss = a drop to the road). The reach model (src/reachcore.js) and the play bot (src/playtest.js) know ropes
  (without the rope the inner gate is unreachable: 662 vs 1205 footing tiles).
- Tests: `tools/zipline.mjs` (REAL KEYS in the page, all 7 heroes: top-end catch, jump-in, stand-under UP mid-line, JUMP off, DOWN drop, plus two
  test-laid lines, one down east and one down west) in `tools/check.mjs`; `tools/watchtowers.mjs` kept (vm replaced by the module's own step, same
  asserts). `tools/zipline-shots.mjs` = pictures (not in the suite).

## Checks run (all green unless noted)
watchtowers, stormhold2, bells, stuck (static+runtime), signs, audio-assets, harvest-fair (snap rope), deadends, dressing, town-live, architecture,
floating-geometry, comments, homepaths, zipline (7/7 heroes), map-spacing, checkpoint-gaps, mash-gate (storm re-stamped: `tools/mash-bot.mjs storm
--level storm --write`; boss rows carried), level-quality (storm not gated).
- RED, not mine: level-quality CANAL pilot row stale (level hash changed since its pilot ran).

## QUESTIONS FOR DANIEL
1. Rope on the route = the Bell Watch (middle of the level; T1 teaches, T3 stays an optional shortcut over the Lance's yard). Built that; say if you
   want the Wall Watch (closer to the boss) instead.
2. A touch from a jump takes any non-frayed rope (as briefed): a hero hopping at a deck's east edge grabs the rope. Say if you want touch-catch off.
