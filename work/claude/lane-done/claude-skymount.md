# claude/skymount - S1 SKYMOUNT: THE DRAKE'S BACK (P.mount mode) - lane report
Lane S1 (Opus), 11-04. Branch `claude/skymount` off `claude/heartplan` 1ab8eecf. Brief: scratch/lane-reports/heartplan.md section 3 "The arena" + section 5 row S1.
GREYBOX, node-checked only. Not merged, not deployed, no browser run (other lanes had browsers up). Nothing is live: the only way onto the back
is the hidden lab level. The Demon King is NOT built (lane S2) - the hooks he needs are here.

## What changed
- `src/sky-mount.js` (new, pure, no DOM): the arena as logic.
  - THE BACK `newBack({x0, y, len, phase})`: 192 px from the tail root to the wing-root ridge; it doubles as the hero's mover (P.onMover = the back),
    so every kit check that treats "on a mover" as footing treats the back as footing. `surfaceY(b, x)` = the flat line + the wingbeat (+-2 px at
    0.55 Hz) + the bank's tilt about the middle.
  - THE WALLS: neck spines (x1) and tail fin (x0), 6 px; `walkable(b, w)`. Clamped before AND after every hero step: a run, a x4.5 dash, a throw,
    a teleport past the neck - nothing passes.
  - NO FALLING OFF: `footStep` puts a hero who is at or under the surface ON it (going down = landing; under it going up, e.g. a throw from a
    tilted back's low side = put on top). No pit, no fall damage, no kill zone. The jump's arc is capped at the sky box top (SKY_TOP 96 px over the
    back; a plain jump rises 50 px and never touches it; a -900 px/s launch stops there).
  - KNOCK-DOWN `knockDown(P)`: a blow that would throw you knocks you DOWN where you stand: vx 0, no upward throw, prone 0.5 s (pinned), i-frames
    max(normal hit's, 0.6) - see Q3.
  - THE BANK `stepBack`: told 1.0 s ('tell' event: head turns, eye goes gold, near wing dips, a line + the roar), tilts to +-8 deg (ease 0.25 s) for
    1.6 s, levels over 0.3 s. Standing on it you slide 30 px/s downhill at full tilt (half behind a guard; none mid-dodge). Cadence TELL TO TELL
    P1 ~12 s / P2 ~9 / P3 ~7, +-15%, both directions (alternating, 25% surprise). `holdBank(b, s)` = S2's knockdown window: no tell while held, a tell
    in progress is called off, a tilt levels at once, the next bank waits 2 s after.
  - THE CLIMB `beginClimb(b, phase)`: the phase change, 5 s, no bank, the sky blends altitude -> altitude and slides down 60 px (`skyNow`, `climbK`).
  - THE SKY as data `SKY`: 3 altitudes (P1 `rim`, P2 `high`, P3 `ash`) x 4 parallax layers far -> near (ids for the art lane S4, kinds for the
    greybox: band/ridge/cone/motes, fx: eruption/bombs/lightning), `layerShift` (the sky goes LEFT past a drake flying right, 70 px/s at k=1).
  - CO-OP: `spawnSlots(b, n)` (24 px apart, up to a party of 4 inside the walls), `aiKeys` (the AI partner's walk on the back - its tile walker sees
    no floor there), `kingLandX(b, heroes)` = S2's knockdown landing: between you and the neck; in co-op between the two of you when 56+ px apart;
    pressed against the neck -> behind you; a downed partner does not count.
  - FOR S2/S3: `solidAt(b, x, y)` (the drake's body + its two walls - imps stand on it, planted kit verbs ask it), `plantOnBack(b, x)`, `litAt`,
    `downhill`, `bankDeg`, `banking`/`bankTelling`, `camFor` (the camera lock), `resetBack`.
  - `buildSkyLab` + `LAB`: the lab level (40x24 tiles of open sky, the back at col 14 row 15, ambient 'highair').
- `src/sky-mount-hands.js` (new): the main.js glue, one object `SKH` (update / pre / foot / knock / cam / aiWalk / solidAt / plant / drawSky /
  drawDrake / back). Every method is a no-op off a `skyMount` level; leaving the level takes every hero off the back. Lab handles on
  `BK.skyMount`: `.bank(dir)`, `.phase(n)` (a climb), `.hold(s)`, `.kingLand()`, `.back()`.
- `src/sky-mount-draw.js` (new): GREYBOX pictures - the sky by altitude (gradient + 4 layers, the climb's blend, embers off at parallax low/off)
  and the drake (far wing, tail + fin, belly under the back strip on the tilted/bobbing surface line, neck + head + spines, near wing that dips on
  the tell, a tilt arrow while it banks). Art before live: S4 paints the real ones.
- `src/main.js`: 10 one-line hooks, no refactor (+11/-1): import + `let SKH`; `SKH = makeSkyMountHands(...)` beside the kitchen hands;
  `SKH.update(wdt)` before `updateMovers`; `SKH.pre(P)` right before the mover carry; `SKH.foot(...)` right after the mover landing;
  `else if (P.mount && SKH && SKH.knock(P)) { }` in damagePlayer0's throw chain; the camera lock after the camera clamp; the AI partner's walk
  (`p.aiWalk` skipped on the back); `SKH.drawSky` in the backdrop pass; `SKH.drawDrake` before drawCarpetWorld (under the heroes).
- `src/dressing.js`: the lab's empty ground kit + allowlist (2 lines; tools/dressing.mjs). `src/level.js`: the hidden lab `LEVELS.push({ id: 'skylab', ..., hidden: true })` + its import.
- `tools/sky-mount.mjs` (new): the node check, 175 checks, ~1 s.

## How to stand on it (browser - owed tonight)
`?level=skylab&hero=<id>` (the playtest level jump). Console: `BK.skyMount.bank(1)` (bank toward the neck now), `.phase(2)` / `.phase(3)` (climb),
`.hold(4)`, `.kingLand()`. Co-op as any level (drop-in / AI partner).

## Checks run (node only)
- `node tools/sky-mount.mjs` -> **175 ok, 0 failed**: surface/tilt/bob; the bank's clock per phase (told 1.0, tilt 1.6, level 0.3, cadence tell to
  tell 12/9/7 +-15%, both ways, max 8.00 deg); hold rules; climb; walls per hero (12 heroes: the 9 live + rimebinder, demonhunter, sunpriest at the
  knight's legs) under runs and x4.5 dashes; NO FALLING OFF: 2 min of random play per hero in P1 and P3 with jumps, dashes, stray throws,
  knock-downs and banks - never under the back, never past a wall, never over the sky box; jump cap; slide ~49 px per bank standing, half guarded;
  every hero walks UP a full bank (slowest legs: reaper 74 px/s vs 30); knock-down (pinned 0.5 s, then walks); landing on both banks at 3 spots
  (no pop); the wingbeat carries a standing hero; co-op human + AI a minute through banks; the King's landing (solo x3, pressed, co-op, side by
  side, downed partner, nobody); sky data + camera at 320x180 / 480x270 / 640x360; the lab level; solidAt + an imp standing via footStep; the hands
  glue end to end with a stand-in api (mount both, BK handles, tell line + roar, ride, knock, cam, AI, off-level clean-up, no-ops); and every
  main.js/level.js hook present once and in the order it needs.
- `node --check` main.js, level.js, the 3 new src files: ok.
- Node tools that build every LEVELS entry (the new hidden level must not trip them): ambush-listed, architecture, barriers-inventory, checkpoint-stand,
  checkpoints, collectables, content-audit, deadends, deadly-water, answer-tags, ambient-landmarks -> all exit 0 (ambient-landmarks was red on the
  lab having no ambient zone -> gave it 'highair', green). boss-jump timed out at 90 s (a long tool, no skylab line in its output). A wider sweep
  of the remaining LEVELS-iterating node tools: see SWEEP below.

## Owed (browser / page checks - NOT run tonight, browsers were other lanes')
1. `?level=skylab` loads and each of the 12 heroes walks, jumps, dodges/rolls, attacks, up-attacks, plunges and drinks a flask on the back; the
   rising cut / vault / hammer leap / dash stop at the walls and the sky top; nothing stutters at the mover carry (pre/foot order).
2. The knock-down reads (P.hurt pose for 0.5 s; a prone pose is S4's art) and never throws a hero.
3. Co-op: two humans and human + AI partner on the back through banks; the AI fights (labDuelFrame) and walks (aiKeys) without leaving the back.
4. The camera lock at the boss views' zooms; the greybox sky + drake draw (no exception), the bank tell/tilt read; parallax low/off.
5. Quit/return to map from the lab: P.mount cleared, nothing carried into the next level. The waypoint arrow (wayBuild/floodReach) on an all-air grid.
6. Register `tools/sky-mount.mjs` in tools/check.mjs at the integ merge (not added here: the one-line list there collides with every lane).

## Gaps for lane S3 (per-kit) - kit verbs that read TILES for a floor, and the back has none
Moving and blade/shot fighting work for every hero (the back is the mover; blows and projectiles live in the air). Verbs that scan tiles do not
find the back yet: the GEOMANCER's planted stones / fault line / rolling stone / pillars (src/geomancer.js floorRow, isSolid), the RANGER's dropped
arrows (src/ranger.js: they fall through - "walked over as usual" needs them to lie on the back), the DOWN_STRIKE plunge rings (main.js gates
plungeWave on `!P.onMover`: the knight/warden/pyro/pirate stomp rings do not fire on the back - the plunge's own hit does), the DESERT PRIEST's (sun-priest.js)
consecrate patch + radiance (light tiles), and any thrown weapon that sticks in a floor or bounces off a wall (javelin, hatchet, hammer).
REC for S3: route each one's floor test through `SKH.solidAt(x, y)` / `SKH.plant(x)` when `P.mount` (one guard per verb); S2's imps stand via
`footStep` on the back exactly as a hero does (proved in the node check).

## Questions for Daniel (rec first; lanes never block - each is built as the rec)
1. Physics model (coordinator, Daniel can skip): the back is a REAL TILTED SURFACE the hero stands on (the heartplan design: P.onMover = the back,
   bolts stay level, the approach angle changes on a bank). The alternative is a flat tile floor with the tilt only drawn (every tile-reading kit
   verb then works for free, but the hero would float off a drawn tilt). REC: keep the tilted surface (built); S3 shims the few floor verbs above.
2. Does the Desert Priest's (Sun Priest kit) RADIANCE fill on the drake's back? REC: YES - the sky fight is lit by the eruption (`back.lit = true`, `litAt`).
3. Knock-down i-frames: the design says 0.6 s; a normal hit already gives 0.8 s (0.95 with Grit). REC: keep the normal hit's (never fewer i-frames
   than any other blow); prone stays 0.5 s.
4. Bank cadence is TELL TO TELL (P1 12 s, P2 9, P3 7 between tells, so ~9/6/4 s of level back between banks). REC: yes as built; S5 tunes it.
5. Heroes stand UPRIGHT on a tilted back (not rotated with it), as a person on a deck. REC: upright; S4 may lean the sprite 1 px on a full tilt.

## SWEEP (the other node tools that build every LEVELS entry)
- Ran clean (exit 0, no skylab line): curve-gate, curve-shape, curve, deadends, deadly-water, demo-cut, demo-save-carry, elites, fire-mage,
  floating-geometry, foe-footing, foe-pass, goblin-lint, ground-depth, keys, killzones, knock-into-exams, level-quality.
- **dressing was RED on the lab** ("skylab needs its own ground kit") -> fixed: `src/dressing.js` gets `GROUND_KITS.skylab` (density 0, no kinds) and
  `ALLOWED_DECORATIONS.skylab = []` (2 appended lines, as the tavern's). dressing now passes.
- hintlevel red is PRE-EXISTING and not this lane's ("the gate has holes": SWAPUI / reeveCoat / FL2H hint lines in main.js; no skylab).
  mash-bot / level-walk exit 2 = they need a PORT/args (usage), not a failure.
- NOT CONCLUSIVE - timed out (the PC was loaded by other lanes; at the end even 12 s tools timed out): boss-jump, death-cost, drawn-solids, ending,
  feel-platform, flasks2, gate-openers, geomancer, hero-trials, lab-order, lethal-water, level-reach, and the whole 63+ tail (levelling-runtime ..
  uiscreens, ~50 tools). **OWED: the QUICK gate / nightly full suite on this branch is the real word on whether a hidden lab level trips any of
  them** - if one does, the fix is a per-tool skip or a lab entry as above (arena_yard and tavern set the pattern).
