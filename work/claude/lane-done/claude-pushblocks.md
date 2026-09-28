# PUSHABLE BLOCKS (backlog #12) — claude/pushblocks

Approved by Daniel 2026-09-28 (backlog item 12, "PUSHABLE BLOCKS + PRESSURE PLATES"): build the engine once so
design lanes can place it in Highcrown, the Burial Caverns, the Monastery and the future pyramids. Pressure
plates already existed (Kingswood's plate/dropcage pair, level-agnostic); this makes a pushed block hold a
plate down too.

## What changed

**New module, `src/push-blocks.js`** (pure, no DOM — a plain state machine and a few math helpers, same shape
as `grave-warden.js`). A block:
- is pushed by a grounded hero walking into its side, at `PB.speed` = 26px/s (about a third of the hero's own
  run, 92px/s in main.js) — heavy and slow, not a shove;
- falls under gravity and stops the instant its own foot row is solid or one-way footing;
- can be stood on like a raft or a pad, because it lives in main.js's `movers` list — the engine's existing
  "stand on a mover" landing code (updatePlayer) already covers it, nothing new was written for that part;
- can never be pushed into a wall or into another block: the same tile/AABB test that stops the block also
  holds the hero out of it when it can't give any further, so nobody can wedge it or themselves anywhere;
- resets to its placed spot on every death and checkpoint reload for the same reason — `spawnEntities`
  rebuilds every mover from `L.ents` on every attempt, exactly like a plate or a dropcage. A block can never be
  pushed somewhere that soft-locks a level: worst case it's back where it started.

**Thin hooks in `src/main.js`**: an import, a `spawnEnt` case (`ent('pushblock', x, y)` → `movers.push(...)`),
one line in `updateMovers` to step it every frame, one line extending the existing pressure-plate check (`pr.t
=== 'plate'`) to also read a resting block the same way it already reads the hero and a foe, and one draw case
in the movers draw pass. Art: the block draws the level's own ground tile (`TILE.dirt[0]`, baked fresh per
palette by `bakeAll`, so it matches whatever set it's standing in) with a mortar line round it so it still
reads as a loose object and not the floor.

**One teaching placement, Bracken Wood only** (`src/level.js`, section 3, "Wasp pit"): a floating one-tile
ledge at column 107 with a coin on it, four tiles above the walkway — just past a real jump's ~3.2-tile apex.
Push the block (start: column 105) two tiles snug underneath, stand on it, and the last jump is reachable. The
ledge is a single floating tile (rows 19-21 under it stay open air, same as the rest of the corridor), so it
never narrows the walkway, and the block itself sits at ground level where a normal hop clears it — nothing
here gates the level. Chosen because: low-risk (the whole thing is optional, a bonus coin, not on the critical
path), and it's the first level, so it's seen once early before the design lanes build on it elsewhere.

## Checks

New check **push-blocks** (`tools/push-blocks.mjs`):
- **sim**: drives `updatePushBlock` directly against small hand-built grids — fall onto solid footing, fall
  onto one-way footing (the "step" case), push at `PB.speed` with the hero carried in lockstep, blocked by a
  wall (block and hero both held at the wall), blocked by another block (two blocks never overlap).
- **wiring**: reads `src/main.js` to confirm the reset path (`case 'pushblock': movers.push(...)`), the
  per-frame step, the plate-holds line, and the draw case are all present — these are one-line integrations
  into engine-wide code paths (the mover reset, the plate check) that are already exercised elsewhere, so
  they're read out of the source rather than re-simulated (same approach as `tools/floaters.mjs` reading
  main.js's grounding lists).
- **demo**: confirms exactly one `pushblock` ent exists, only in Bracken Wood, and — for "no soft-lock" — that
  the corridor around the demo (columns 103-109) still floods end to end on a real jump (`floodReach`,
  `across: 5`, same figure `checkpoint-stand.mjs` uses) without ever touching the block, proving it's optional.

Confirmed **red on master** first, via a throwaway worktree (`git worktree add --detach origin/master`,
removed after): `src/push-blocks.js` doesn't exist there, so the check fails to import — never `git stash`.

Green, this branch:
- `push-blocks` (new)
- `architecture`
- `checkpoints`
- `skins`
- `dangling-paths`
- `boss-fight-end`
- `slopes-trace` — **wood rebaselined** (`--rebase=wood`): the demo changes wood's own tile geometry on
  purpose. `kings`, `keep`, `burial` keep the pre-slopes baseline, unchanged.
- `npc-removal`

Not run: the full suite (`npm run check` with no names) — never run from a lane, per the lane rules; only
named checks.

## UNVERIFIED

- No live playtest in a browser (Bot/Chrome pilots weren't run) — this was checked with `tools/push-blocks.mjs`
  (direct simulation of the module against hand-built grids) and the flood-reach model for the demo's
  reachability, not by actually walking the level. The physics (gravity, landing, push speed, wall/block
  blocking) match the checks; the *feel* of pushing it, and whether the demo reads clearly on screen, are
  unverified.
- Co-op: the push interaction loops over `players` for the AABB/wall-block test (so a second player is always
  held out of an unpushed block, never clips through it), but which player *can start* a push reads the shared
  `keys` object — the same simplification the existing `punt` (co-op boat) mover already uses in main.js, not
  something new introduced here. Two players pushing from opposite sides at once was not tested.
- Enemies do not collide with a block (it isn't solid to them) — only the hero. Not required by the brief, but
  worth knowing before a lane places one near a foe that would otherwise be walled off by it.

## QUESTIONS FOR DANIEL

1. **Block size/weight for other levels.** This is tuned as a single 16x16 (one-tile) block at `PB.speed = 26`
   (~1/3 run). A pyramid puzzle or a bigger stone in the Burial Caverns might want a heavier or larger block.
   **Recommendation (built)**: keep one size/weight for now — `PB` is a small exported constant, trivial for a
   later lane to add a `big`/`heavy` variant off the same module if a specific level needs it, rather than
   guessing at a second tuning now with no level asking for it yet.
2. **Whether a pushed block should ever be able to fall on/hurt an enemy or the hero**, the way a barrel or
   rockfall does. **Recommendation (built as-is)**: no — it's a pure platforming object, not a weapon. The
   brief's list (push, fall, step, hold a plate) didn't ask for damage, and adding it without a specific
   encounter in mind risks a block that reads as dangerous when a design lane wants it to read as safe
   furniture.

## Commit

`e846757` — ENGINE: PUSHABLE BLOCKS (backlog #12), branch `claude/pushblocks`, pushed to origin. Merged against
current `origin/master` (already up to date, no conflicts).
