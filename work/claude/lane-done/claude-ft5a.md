# ft5a: FALLING TOWER 5, the level greybox (behind FT5_SHIPS, off)

Branch `claude/ft5a` off master 85d152eb8, pushed. Opus lane, code only: no browser, no full suite. One page check ran once by accident (see Checks).

## How to see it
`?ft5=1` in the page address, or `globalThis.__FT5 = true` before a node build (`node --import ./tools/ft5-on.mjs tools/<check>.mjs fallingtower`). With the flag off, both levels match master exactly: the fallingtower hash is 61e6b5b3edb55d0f and the mage hash is 6be348b9b7f8517b, and tools/fallingtower5.mjs checks both.

## Files
- **New:** src/ft5-flag.js (`FT5_SHIPS=false`, `ft5On()` is read at build time), src/tower-fall5.js (the builder, plus `FT5_ARENA`), src/ft5-level.js (runtime, pure), src/ft5-lines.js (lines with no imports), src/spire-field.js (a **stub for ft5b**: `buildSpireField(L, A, kit)` returns null, so the level lays a placeholder), tools/fallingtower5.mjs, tools/ft5-on.mjs.
- **Shared edits:**
  - tower-collapse.js: a per-chunk `back`, and chains ordered by `seq` (rows still work as before).
  - chase.js: an `ft5` field.
  - level.js: the row switches with `ft5On()`, and so do its rule text and the Folly's `follyFt5`. The AMBUSH and ELITES coordinates are skipped under `L.ft5`.
  - transitions.js: `FT5_ROW` mage -> fallingtower (a walk-out at the gate), added only when FT5 is on.
  - hint-lines.js: `FT5_SAY` is added to SAY_LINES.
  - checkpoint-thin.js: `CHECK_PIN.fallingtower` is a getter that switches with the flag.
- **main.js:** 8 tagged lines `(claude/ft5a)`:
  - the import
  - the seaTilt roll and Folly tip
  - `ft5Update` inside updateAscent (FT5 sets `towerAscent`, so the existing chunk, pillar and reset code runs; spiral, chase3, ft2 and ft4 are all guarded)
  - `ft5Reset` in spawnEntities
  - the slab mover
  - the lowest-seat rubber band (edits the existing chaseStep line)
  - per-seat contact through asSeat
  - `follyStep` during the Folly's bossWon

## The level: grid 300 x 320, with floors drifting east as they climb
- **Opening:** the library is already tipped. The roll starts at 2.5 deg (carried over from the Folly's lurch) and settles to 1.5. The first screen is a buckled 1:2 hump.
- **Act I, THE TIP (story 5 deg, roll 1.5):**
  - Library: a TEACH chunk with a safe drop under it, then 3 QUICK chunks over a gap. These are the only way to the tier above (load-bearing).
  - THE SHELVES GO: told 1.0 s, then two cases lie down as a shortcut. The lib-top pillar ('ramp') lays the third.
  - Reading Room: FT4's single gravity flip, unchanged and load-bearing.
  - Braced room with **checkpoint 2** (19,251), plus the "HIS POISON RISES - FAR BELOW" teaser.
  - Skeleton spots: soldier1 on the library floor, archer1 on a reading-room tier.
- **Act II, IT GOES OVER (15 / 3.5):** every floor is a 1:2 sawtooth.
  - Observatory: QUICK chunks, THE DOME COMES IN (ribs land as ledges), soldier2 spot.
  - Pendulum Gallery: 2 books (was 3), the first landing fails, THE GALLERY SHEARS on the last ride. Told 2 s, the landing drops 2 rows and carries anyone on it, and a rubble step keeps the way on.
  - Lab: QUICK chunks; the **required** lab-bridge pillar across a 15-tile gap; the elite husk; an optional slab; braced room with **checkpoint 3** (39,161).
  - Poison `act2`: 18 -> 21 -> 24 px/s with told surges; the poison waits under both pendulum rides.
- **Act III, FREEFALL (30 / 5.5):**
  - Bell Loft: FT4's Sexton loft moved to these columns. THE BELL FALLS after the Sexton: told, the deck breaks, then "THE BELL PLUGS THE WELL: BREATHE". The bell-rope pillar ('dark') holds the poison when struck.
  - Treasury: 1:1 floor with gold on it, a SNAP chain, an optional slab, a braced ledge (holds the poison 6 s once a life), the mage1 spot.
  - Breach: a gutted floor with a SNAP chain, out through the east wall.
  - Outer Face: 7 planks (one SNAP), peeled away under the poison; the top one never peels.
  - Poison `act3`: 26 -> 30 -> 34.
- **IT GOES OVER, then THE FALL (story 90, roll kicks to +6 then settles to 0):**
  - The bend is 1:1 x8 then 1:2 x8 then flat. The y poison's safe line (row ~71) and the x poison's start line (col 115) meet with no gap, told 1.5 s.
  - The run is 93 tiles at row 62: 3 windows (pits), 3 buttresses (hurdles), 2 SNAP chains, a high road on the parapet, one slab hop.
  - Poison `run`: 70 -> 85.
  - **Checkpoint 4, THE CROWN** (212,62), then the arena.
- **Placeholder field** while ft5b's stub returns null: a floor, 5 low spires and a gate, so the greybox can be walked end to end.
- **What is not built:** the harry (HE REELS) only has perch data (`L.ft5.harry`), not wiring. Told debris on the run is also not built. Both are listed under Owed.

## FT5_ARENA (for ft5b), in tiles
```
FT5_ARENA = { x0: 226, x1: 290, y0: 14, y1: 78, sea: 70, crownSpot: { x: 222, y: 62 }, runFloor: 63, check: { x: 212, y: 62 } }
```
- The builder clears the box to air from y0 to y1, then calls `buildSpireField(L, FT5_ARENA, { T, rect, ledge, ent, set })` before hanging the ropes.
- If the call returns something truthy, the placeholder is skipped.
- The run floor (solid row 63) ends at x 225. The crown is x 208-225 and the hero arrives standing on row 62.
- The desert/sand rows (sky rows 0-13 over the field) are ft5b's to lay.
- `L.ft5Arena` carries a copy of the constant.

## Checks (all node; level-quality is run with FT5 on)
- tools/fallingtower5.mjs **ok**: flag-off hashes and no transition row; 4 acts with rising angles; the lean; START + 3 shrines; chunk timings; SNAP chains run at 92 px/s never have a chunk fall under the hero; full reach; 3 load-bearing proofs; chase lint; climbs at 2/6/12 s per landing (16 and 24 contacts at 12 s, none at 2 s, none on a ride, no cap passed); the run (brisk player untouched, dawdler caught); the y -> x hand-off; co-op seat rules; all the runtime pieces; the slab; the Folly lurch; 24 lines routed; skeleton spots; FT5_ARENA.
- `level-quality fallingtower` (FT5 on) **clears the bar**: bands 41%, mechanics 3 in 3+ places, 2 secrets, 3 checkpoints, slopes drawn. The pilot and curve rows ask for a re-stamp.
- FT5 on:
  - checkpoint-stand, killzones, solid-islands, signs, spawns, tells, answer-tags, checkpoints, slopes **ok**.
  - deadends, anchor-lint, floating-geometry, reach: report-only, ok.
  - checkpoint-gaps: ok. The fallingtower 290-tile gap is listed as known, but under FT4's reason row; it needs an FT5 reason (owed).
- Flag off: fallingtower4, tower-hall, transition-choice, checkpoint-gaps, checkpoint-thin (report), solid-islands, slopes **ok**.
- **Page check:** tools/tower-collapse.mjs opened one headless page by itself. Free RAM was 3.9 GB; the tool's own profile cleanup closed it, and it passed. No other browser was used. chase.mjs, tower-ascent.mjs, stuck, reach-heroes and rule-openings need a page and were **not run**.

## Owed
- **Browser stills (plan sec 8, the ft5a part):** Folly lurch before/after, FT5 first frame (tipped library), a typical screen for Act I, II and III, a QUICK chunk tell/fall, a SNAP chain, a SLAB ride, the poison surge banner plus the contact throw-up, IT GOES OVER (3 frames), the wall run (2), the crown -> arena widen, a co-op still.
- **Page checks with FT5 on:** stuck runtime, reach-heroes for all 9 heroes (the Act III 1:1 slopes and SNAP chains matter most), a bot walk, hint-shown, textfit for the new lines, mobile-perf (the roll and poison draw).
- **Not built yet:**
  - the harry wiring (needs a magechase-like enemy for FT5 that uses undead-mage blowMeets/sendHome, with `st.noSurge` on the act chases)
  - told debris on the run
  - stuck-spots rows for FT5 (the FT4 rows are at FT4 coordinates and are harmless)
  - a BONES_SHIPS row set (bones-placements.js is not on master; `L.bonesSpots` is ready)
  - an FT5 reason row in checkpoint-gaps' known list
  - level1-pilot and curve re-stamp (ft5tune)

## Questions (rec = what I built)
1. "4 checkpoints": FT4 had 4 shrines plus START. The plan lists START as checkpoint 1. **Rec/built: START + 3 shrines.** The alternative is a 4th shrine mid-Act III.
2. Slabs are optional assists for now (Lab, Treasury, the run hop), because their ride has not been proved in a browser. **Rec: make one required (the Lab's gap) after the browser walk.**
3. The pendulum gallery has 2 books, cut from 3 for fewer stop-starts. **Rec: keep 2.**
4. Act III and the run have no shrine, and the chase lint's shrine-before-start rule is asserted only for Act II. **Rec: keep it that way, since the poison never kills (plan Q, held).**
5. The grid grew from the plan's ~220x270 to 300x320 to fit 8 floors, the bend, a 93-tile run and the 64-wide box. **Rec: keep it; ft5b uses FT5_ARENA, not raw numbers.**
