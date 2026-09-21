# SLOPES — phase 2 wiring plan

Phase 1 (branch `claude/slopes`, built off `codex/playtest-0919` at `9e0e28a`) built the engine in isolation, and none of it
is wired in yet:

| file | what it is |
|---|---|
| `src/slopes.js` | tile kinds (T 20-25), `heightAt`, `moveBodySlopes` (moveBody + slopes), `moveBodySquare` (moveBody copied line for line), `aheadTile` (walker edge probe), `footSlope`, `slideStep` + `SLIDE` tuning, `levelHasSlopes` |
| `src/reach-slopes.js` | the reach rule (`slopeReachGrid`), `slopeLint` (every slope on rock, none roofed) |
| `src/redraw/slopes.js` | `bakeSandSlopes()`: 6 kinds x 3, `under[kind]` x 3, `top` x 3, `fill` x 3 (16x16, px.js house style) |
| `tools/slopes.mjs` | the proof: 71 checks, ~4 s full, ~2 s `--quick`. Exit 1 on any failure |
| `tools/slopes-art.mjs` | renders a dune of the sand tiles to `docs/slopes-sand.png` in Node (no browser) |

Line numbers below are **`9e0e28a`** line numbers. The Burning Village batch lands first and will shift main.js, so
re-find each anchor by its quoted text, not its number.

## Tile ids

`T` in `src/level.js:14` ends at `CRYST: 18` (6 is unused). The slopes take **20-25**:
`SLOPE_R1 20, SLOPE_L1 21, SLOPE_R2A 22, SLOPE_R2B 23, SLOPE_L2A 24, SLOPE_L2B 25` (R = rises to the right; A = low half of
a gentle pair, B = high half). Add them to `T` in level.js as `SLOPE_R1: 20, ...`. `slopes.js` keeps its own `SLOPE`
table; import it from there, or assert the two tables match in `tools/slopes.mjs`.
**Level rule (check it with `slopeLint`):** every slope stands on rock, and nothing solid sits over one. A steep climb of
several rows is R1 tiles stepping up diagonally with rock under each one. The rock beside a slope's high end is the
landing, at the same height.

## 1. main.js — collision (the one real swap)

1. **`moveBody` (main.js:4066)** becomes a wrapper; keep the name, because 138 call sites use it:
   ```js
   import { moveBodySlopes, moveBodySquare, levelHasSlopes, aheadTile, footSlope, slideStep, isSlope } from './slopes.js';
   const MB = { allowDrop: false, P: null };   // one object, reused: this runs for every body every frame
   function moveBody(b, dx, dy, allowDrop = false) {
     if (!SLOPES_ON) return moveBodySquare(b, dx, dy, tileAt, allowDrop, P);
     MB.allowDrop = allowDrop; MB.P = P; return moveBodySlopes(b, dx, dy, tileAt, MB);
   }
   ```
   `let SLOPES_ON = false;` gets set in `loadLevel` (main.js:1612) after `L` is built: `SLOPES_ON = levelHasSlopes(L.grid);`.
   A level with no slopes runs `moveBodySquare`, today's code copied line for line (proved below). Keep `isSolid`
   (4043) and `isOneWay` (4065) exactly as they are: slopes are neither.
   Then change `tools/slopes.mjs`'s extractor (it cuts `function moveBody` out of main.js) to cut the old body out of
   git (`git show 9e0e28a:src/main.js`), or out of a frozen copy, so the equivalence proof still has an OLD side to compare against.
2. **The mantle (main.js ~6697, `if (!P.ground && !P.plunge && !P.climb && !dodging && !(P.mantleCd > 0) ...`)**: add
   `&& !r.slope`. It runs every frame because `P.ground` was cleared before moveBody, and on a slope the rock under the
   next slope tile reads as a lip, which gives a "CAUGHT IT" hop. `r.slope` is undefined from the square path, so this
   is a no-op on every existing level. (The harness's knight already has it; without it, the steep walks hopped 23-45 times.)
3. **The ledge assist** lives inside moveBody. `moveBodySlopes` already skips it when the foot is on a slope (HOOK 0).
   Nothing to do.
4. **Corner correction (~6708), landing (~6712), coyote**: unchanged. `r.ground`/`r.groundTile` come back as before.
   `P.groundTile` can now be a slope id: check `isOneWay(P.groundTile)` (6576, drop-through) is false for slopes
   (it is), and teach `surface()` (5099) that ids 20-25 are `'sand'` (or the level's surface).
5. **`magePlayer` (9721-9735)** has its own walk code and calls moveBody. It is fine as long as the Mage's Folly has no
   slopes (`SLOPES_ON` false).

## 2. main.js — the slide (the player)

Name the state **`P.sandSlide = { vx, sliding, carry }`**. Do NOT call it `slide`: `let slide` (14984) and
`updateSlide()` (14985) are the scree ROCKSLIDE, and name clashes have cost this repo real time before.
- Add it to `freshBody` (803).
- In the walk block (6509-6521, `if (move && !groundAtk) {...} else if (!dodging) {...}`): when
  `P.sandSlide.sliding || P.sandSlide.carry`, skip the walk/friction/cap for the frame, then run
  `P.sandSlide.vx = P.vx; slideStep(P.sandSlide, dt, { kind: P.ground ? footSlope(tileAt, P) : 0, ground: P.ground, down: keys.down, jumped }); P.vx = P.sandSlide.vx;`
  exactly as `knightStep` in `tools/slopes.mjs` does (the order there is the tested order: after the jump, before moveBody).
  `jumped` = the jump branch at 6577 fired this frame.
- The fast fall (`fast`, ~6667) and its `maxFall` (~6672) key on `keys.down` in the air. The harness turns both off while
  the slide flag is up (`!slide`), so a slide jump does not fast-fall because DOWN is still held. Do the same:
  `&& !P.sandSlide.carry`.
- DOWN on the ground already means: climb down a rope (6540, needs a rope below), drop through a ledge (6576, only with
  jump, only on a one-way), the crouch pose (20221), and the low swing. The slide needs DOWN held ON A SLOPE TILE, which
  none of those do. The pose: while `P.sandSlide.sliding`, show `'crouch'` (or a new slide pose) facing downhill.
- Tuning (`SLIDE` in slopes.js): steep top speed 170, gentle 140 (RUN is 92). Measured: 36% faster than walking down a
  steep 4-row hill, 30% on a gentle one; it carries 77 px onto the flat; a jump at the foot goes 103 px against 64 for a
  full-run jump (+60%).
- **Reach consequence:** a slide jump crosses about 6.5 tiles. reachcore's `JUMP_ACROSS` is 6. Either design no gap
  that needs the slide, or teach reachcore a slide jump from the foot of a slope 2+ rows tall. Phase 2 should just not
  put one in. That is a design choice for the Sunken Caravan.

## 3. main.js — enemies, corpses, props

- **The walker edge probe.** Every patrolling foe does
  `aheadT = tileAt(ftx, fty)` and turns at AIR/SPIKE. On a slope going downhill, the tile ahead at the feet' row is AIR,
  so today's probe turns them at the top of every hill: 33-75 false edges per test hill, measured. Replace each with
  `aheadTile(tileAt, ftx, fty, e.y, e.w)`. It returns exactly `tileAt(ftx, fty)` when no slope is near, so this is safe to
  apply everywhere. Sites: **8095, 8247, 8329, 8369, 8402, 8428, 8566** (the `const dirM = ..., aheadT = tileAt(ftx, fty)`
  line), **11621, 11970** (`tileAt(ftx, fty) === T.AIR && !isOneWay(...)`), **12720** (`atx/aty` probe), **17051,
  17108** (`const aheadT = tileAt(ftx, fty)`).
- **Other footing probes** that read `isSolid(tx, floor((e.y+2)/TS))` as "is there floor here": 2273 (`clear`), 2315
  (`floorAhead`), 2360 (`cuts`), 2463 (`eliteMay`), 7719, 8319, 12307, 14863. On a slope the tile at feet+2 is the
  slope itself (not solid), so these read "no floor". Add a helper `floorAt(tx, ty) = isSolid(tx, ty) || isSlope(tileAt(tx, ty)) || isSlope(tileAt(tx, ty - 1))`
  and use it at those sites. Each site is a slope-only change, because `isSlope` is false everywhere today.
- **Corpses (`updateCorpses` 17174; the floor test ~17193-17196 `isSolid(ctx, ty)`)**: a corpse on a slope falls through
  it. Either move corpses with `moveBody` (simplest), or add the slope surface:
  `if (isSlope(ct)) { const s = ty*TS + heightAt(ct, c.x - ctx*TS); if (c.y >= s) { c.y = s; ...land } }`.
- **`heelBody` (7579)**, loose props, pickups settling: they use moveBody, so they're covered.
- **`groundEnts` (15387)** sets signs, braziers etc. down with `gnd = isSolid || one-way`. On a slope they'd sit on the
  rock under it. Rule: no standing prop on a slope tile (add to `slopeLint`), or settle onto the surface at the prop's x.
- **Bosses and wide bodies**: the landing exemption (HOOK 1) covers a leading edge that has reached the rock at the top of
  a slope. A body wider than about 28 px (w/2 + 2 > TS) on a steep slope can reach the landing before its foot is within
  16 px of its top, and then it stops as at a wall. Keep bosses off steep slopes, or test the boss in the yard.

## 4. main.js — drawing

- **Tile paint (`resolveTiles` 666; the per-tile choice around 705-780: `if (t === T.SOLID) {...} else if (t === T.ICE) ...`)**:
  add `else if (isSlope(t)) s = SAND[t][(rnd() * 3) | 0];` with `SAND = SAND || bakeSandSlopes()` (lazy, like `TILE.ice`).
  In the `T.SOLID` branch, when the tile above is a slope, use `SAND.under[tileAbove][...]`: it carries the slope's skin
  down so there's no notch at the joins (see `docs/slopes-sand.png`). On a sand level, the flat tops and fill should use
  `SAND.top` / `SAND.fill`, or the dunes will look pasted onto the level's own ground.
- The minimap (`MAP_ROCK` 1419) and `solidish` (636) are used for drawing and rules. Count slopes as rock in `MAP_ROCK`.
  Leave `solidish` alone unless something reads it as footing.

## 5. level.js and reachcore

- `T` (level.js:14): add the six ids.
- **reachcore (`floodReach`, reachcore.js:16)**: first line of the function, `L = slopeReachGrid(L, T);` (import from
  `./reach-slopes.js`). It returns the same object when there are no slopes, so nothing changes on today's levels (tested).
  The rule: **a slope tile is the cell you stand in, on the rock under it**. That is pessimistic by up to 16 px, never
  optimistic. The alternative, a slope as a SOLID stair, credits jumps the knight does not have: it put 9-20 of the
  cells the physics knight stood in a row too high (tested).
- **The coin sprinkler (level.js:3842)** uses floodReach, so it's covered by the line above.
- **GARRISON / `garrison()` (level.js:7357; `stand` at 7363, the spot test at 7378-7379)**: `stand` doesn't know slopes,
  so no creature is placed on a slope tile's rock... except that the rock UNDER a slope is `stand` and the cell above it
  is the slope (not AIR), so the `at(x, y) !== T.AIR` test already refuses it. Garrison spots will skip slopes, which is
  the right default (a walker placed mid-slope is fine with `aheadTile`, but spawns are cleaner on the flat). Say so in
  a comment. Levels with long dunes will need flat spots between hills, or a slope-aware spot test.
- **Checkpoint stand tests / `eliteGate` (level.js:7606)** and `BRIDGE_STANDING`: same as garrison. A checkpoint
  must be on a flat. Add to `slopeLint`: no `check`, `sign`, `npc`, `gate` or elite on a slope tile.

## 6. Tools that must learn slopes

| tool | where | change |
|---|---|---|
| `tools/floaters.mjs` | `SOLID`/`LEDGE` sets 26-27, tile fn 58 | a standing thing is grounded if the tile under it is a slope and its y is within 1 px of `surfaceY` at its x |
| `tools/spawns.mjs` | `SOLID` 14, `solid()` 35, STUCK test ~41 | a box overlapping a slope tile is STUCK only if it is below the surface at its x (use `heightAt`) |
| `tools/killzones.mjs` | `solid` 25 | a slope tile is standable (where it tests for footing) and not solid (where it tests "in rock") |
| `tools/newlevel.mjs` | rule 14 `solidish` 156 | slopes count as footing, and add `slopeLint` as a new numbered rule |
| `tools/elites.mjs` | the "walked round" test | a patrol across slopes: use `moveBodySlopes` + `aheadTile`, not tile hops |
| `tools/runtime-footing.mjs` | in-page (port 5992) | runs the real game, so it follows `moveBody`. Add a slope-yard row to its list |
| `pixels` = `tools/headless.mjs floats` | in-page | sprites on slopes stand on the drawn surface, not the tile top. Check a slope yard frame |
| `src/playtest.js` | `solidT` 29, sweep footing 145-199 | the sweep stands the bot on footing every 7 columns: a slope column's footing is its surface |
| `tools/reach.mjs`, `deadends.mjs`, `traps.mjs`, `additional-areas.mjs` | through reachcore | covered by the reachcore line |
| `work/claude/shape.mjs`, `vshape.mjs` | standable heights per screen | a slope tile's standable height is its row (the reach rule) |

## 7. The test yard

A new hidden practice level **`trial_slopes`** ("THE DUNE YARD") built like `openYard()` (level.js:3377), listed next to
`trial_open` (level.js:7144) and reachable from the practice menu (main.js:3281). 160 x 30, walled, floor at row 22, left
to right:
1. flat 8 · **steep hill** R1 x3 up, 3 flat, L1 x3 down · flat 6
2. **gentle hill** R2 x3 (A,B pairs) up, 3 flat, L2 x3 down · flat 6
3. **a peak with no flat**: R1, R2, R1, L2, L1, L2 · flat 6
4. **a valley**: L1 x2 down into a 4-wide pit floor, R2 x2 up · flat 6
5. **the slide run**: R1 x4 up, 2 flat, L1 x4 down onto 10 flat, then a gap of 5 tiles (a slide jump clears it,
   a run jump does not) with a flat landing
6. **the face**: a lone L1 on the flat with its tall side facing the way you arrive (a wall), then a lone R1 walked up and off
7. straw men on every flat, and two patrolling goblins, one on each hill, to watch the walkers go over
`palette: sand`, `noCoin: true`, `reachExact: true`. `slopeLint` must be clean on it.

## 8. Suite checks to add (`tools/check.mjs`)

1. **`slopes`**: `node tools/slopes.mjs` (Node, ~4 s). Equivalence (fuzz + every level), walk/walker/slide/face/ceiling
   checks, the reach rule. After phase 2, point its OLD side at the pre-slopes moveBody (see §1.1).
2. **`slopes-yard`** (in-page, port 5997): load `trial_slopes`, drive the real knight right across the yard and back with
   `BK.step`. Assert: no frame off the ground on the walks (except the gap jump), no hitX on a slope, x never stalls, each
   straw man reached, the goblins cross their hills (no turn at a hilltop). Then hold DOWN at the top of the slide run.
   Assert: the gap is cleared.
3. **`slopes-trace`**: record the knight's (x, y) for 600 scripted frames on 4 existing levels (wood, kings, keep, burial)
   with the new build, and compare to the same trace recorded from `9e0e28a` (checked in as JSON). It must be identical.
   This is the "verify against the OLD code" check in the real page, not just Node.
4. `newlevel` rule for `slopeLint`, `floaters`/`spawns`/`killzones` slope cases on the yard, and `pixels` on a yard frame.

## What phase 1 proved (tools/slopes.mjs, full run)

- **Equivalence** against the moveBody cut out of main.js at `9e0e28a` (lines 4043, 4065, 4066-4099, sha `b45533429f81`):
  - fuzz: 400,000 random steps on 2,000 random square grids (every square tile kind, bodies 6-40 wide, steps up to
    ±20 px, drop-through, knight states incl. fly/ground/vy for the ledge assist). **0 differences** for the fast path,
    **0** for the slope path FORCED onto square tiles, and **0** with slopes in the grid out of reach;
  - the real levels: all 27 campaign levels built in Node, 14 starts each, a scripted knight (walk, sprint cap, jumps,
    cut jumps, drop-through, mantle, corner correction) and two walkers (10x12 and 24x20) per start, at game speed 0.6
    and 1.0: **567,000 frames x 3 bodies, 0 frames differ** (x, y, vx, vy, ground compared with ===).
- **Slopes**: the 4 test hills walked both ways at speed 0.6 and 1.0, at RUN and at the sprint (32 walks): **0 hops,
  0 sticks, foot within 0.000 px of the true surface**, 90-104 px/s horizontal. Walkers from 8x8 to 24x20 at 30-110 px/s
  cross every hill with 0 false edges and 0 frames in the air. A walker still turns at a real pit at a slope's foot.
  A slope's tall face is a wall, its underside is a ceiling, a fall lands on the surface, and a jump from mid-slope works.

## What moveBody does that the slope path deliberately changes (only next to a slope)

- The **ledge assist** is off while the foot is on a slope (it popped the knight onto the landing).
- **Edge standing**: on square tiles a body stands on a ledge while any part of it is over the rock. Over a slope the
  FOOT (centre) decides, so walking off the brow onto a downslope follows the slope at once, and does not float on the
  brow's edge until the body clears it.
- **dy = 0 calls** (the currents, heel, pulls: `moveBody(P, step, 0)`) on a slope also settle the foot onto the surface
  and report `ground`. Today a dy = 0 call never touches y.
- The body carries two new fields, `_sg` and `_ss`, written by BOTH paths. They don't change positions, but they do appear
  on every enemy object (JSON dumps, `{...e}` copies).
