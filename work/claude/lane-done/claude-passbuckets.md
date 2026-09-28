# claude/passbuckets: lane report (2026-09-28)

THE ORE ROAD's audit item 4, PASSING BUCKETS, plus closing the Winchmaster arena exploit flagged in claude/winch3's
report. Branch `claude/passbuckets`, based on `claude/winch3` (ddfb86e = claude/oreroad3 + the Winchmaster's roomier
arena). `origin/master` (05deabe) is already an ancestor of that base, so there was nothing to merge. I did not touch
master, did not deploy, and did not run the full suite - only the named checks below.

## PASSING BUCKETS (item 4) - DONE

Daniel's decision (2026-09-28): a stretch with two lines running opposite directions where you hop across to a
bucket passing the other way, timed as they cross, built on THE FIRST SPAN (oreroad3's own recommendation - a
plainer ride whose pit already gives fall safety).

**The line.** `src/ore-road.js`'s `cableLines()` gets a second line, `pass`, over the open gorge just short of
PYLON A (columns 82-104). It doesn't sag on its own account - it **samples `first`'s own height with `lineYAt`
at every column and adds `OR.PASS.gapRows` (4) rows to each one**, so the vertical gap between the skip you are
riding and the one coming back is the *same* everywhere along the stretch, sag and all: 3.98-4.00 tiles measured
at every half-column (`tools/ore-exam.mjs`, ROUND FIVE) - a real jump (3.2-4.5 tiles, not the reach model's 6),
never a step and never a reach nothing could make. It runs the opposite way to `first` (`first`'s clock runs its
points low-to-high x; `pass`'s runs high-to-low), so a hero riding `first` east watches a `pass` skip come toward
him from the other direction and has to time the hop.

**Two new rests carry it**, mirroring the pylons above them: PYLON A's own underside (its footprint, 96-104, four
rows lower) and a fresh low rest out in the gorge at column 82 (where the dip under `first` runs deepest - `plat()`
is built at whatever row the tracked contour actually lands there, read straight off the built `pass` line rather
than a row typed by hand, so a future retune of the dip can't leave the dock floating). `buildOreRoad` now builds
`cableLines()` once, up front (`cable0`), and reuses it both for this placement and for the level's own `cable`
field later - no second call, no chance of the two drifting apart.

**Taught and safe.** A sign at column 72 (`A SECOND LINE RUNS BACK, UNDER THE FIRST. HOP DOWN TO IT AS IT PASSES.`)
tells it before the stretch; the other line's buckets are visible coming for free (they're ordinary movers, drawn
like every other skip - nothing new needed there). A miss falls into THE FIRST SPAN's own pit (already below this
whole stretch, `OR.PITS` id `span1`): a fifth of your health and the turbines carry you to the recovery ledge and a
climb home - never a death. Nothing new was built for the pit either; it already covered this column range.

**Proved.** `tools/ore-road.mjs`'s existing generic per-line checks (skip-to-skip hole vs. the running jump, ends
3/4 tile inside its deck, never carries its rider into rock) all cover `pass` automatically - it's found by
iterating `cableLines()`, not a typed list. `tools/ore-ride.mjs` rides it in the page the same way (its own
coverage check asks the level which lines exist, so `pass` was ridden the moment it existed, same as every other
line). New pinning in `tools/ore-exam.mjs` (ROUND FIVE): the line exists, runs the opposite way to `first`, stays on
the span (68-135), and the sign is there.

**Getting the geometry right took two wrong turns**, both caught by `tools/ore-road.mjs` before I trusted either:
- First attempt put the new rests at a fixed row (`YARD + gapRows`) - off by one from what a `plat()` call actually
  needs (the row a deck's own solid tile sits at, not the row a line's `y` divides down to one less than). Fixed by
  matching PYLON A's own convention exactly (`YARD + gapRows + 1`).
- Second attempt kept that fixed row for BOTH rests, which is only correct where `first` itself is flat (PYLON A's
  own footprint) - the west rest sat inside `first`'s own dip, where the tracked contour is several rows lower, so
  the line's real endpoint there didn't match the platform under it. Fixed by reading the row straight off the
  built `pass` line at the west rest's own column, rather than assuming the same row as the east one.

I also considered docking the west rest under PYLON B instead of out in the open gorge - it's the OTHER flat
stretch `first` runs over - but PYLON B's own underside (row 41, columns 120-128) is exactly where oreroad3's
"TWIST THE TIP" sapper deck already stands (`plat(121, YARD + 5, 7)`, also row 41), one row was too close for two
platforms with anything standing on either. The open-gorge dip was the honest option once that was ruled out.

## THE WINCHMASTER'S WEST LOCK WALL - CLOSED

winch3's Q4 (its own follow-up recommendation, approved): "Walking off the Head Frame's west end drops onto the
arena's lock wall, from which you can step back out onto the landing." `src/main.js`'s `setWall` built every
boss's wall six rows tall (`A.floor/TS - 6` to `A.floor/TS - 1`) - tall enough everywhere else, but the Head Frame
stands at row 8, four rows above the old wall's own top (row 12), so the six rows left rows 8-11 open beside the
housing: fall off its west edge and you landed on the wall's own low top instead of down its face, with nothing
stopping you walking on off it into the landing.

**The fix**, scoped to just this one wall: when `setWall` raises `L.arena.wallL` and the boss is the Winchmaster,
it runs from row 0 (the top of the level) instead of the generic six - past the Head Frame's own underside, not
merely to it, so there is no row anywhere on the column left open to land on. Only `wallL`, only his arena; no
other boss's wall changed, and none of his own AI (`src/winchmaster.js`) was touched.

**What automated testing actually found**, and why the fix is still worth having: `main.js` already has a
*generic*, unconditional clamp (`if (camLock) P.x = Math.max(camLock.x0 + 6, Math.min(camLock.x1 - 6, P.x));`,
two call sites) that holds a hero's `P.x` inside every arena's own bounds every frame while a boss fight is on,
regardless of the tile grid. I proved (in the page, on the pre-fix code) that a plain walk-and-jump off the Head
Frame's west edge for ten seconds straight never got the hero past column 476, one short of the wall - that clamp
was already doing the job for ordinary movement. But it's a *separate* safety net from the wall Daniel's note was
actually about, and I don't know every way a hero's position can be set in this engine (knockback, a dash, a
launch might not all route through the same clamp) - so I fixed the wall itself rather than concluding the report
was stale. `tools/ore-ride.mjs` now checks both: the tile geometry directly (the wall's own column is solid rock
from the Head Frame's own top row to the floor, no gap - **proved red first**, on a throwaway worktree of this
branch's own base commit, ddfb86e: `[[8,0],[9,0],[10,0],[11,0]]` open before the fix, all solid after) and the
generic clamp as a second line of defense. `tools/ore-exam.mjs` pins that `setWall`'s special case exists in the
source and reads its extra row from `OR.ARENA` rather than a number typed into main.js - the exact mistake
oreroad3's item 3 found and flagged (a boss room edit stalling a hero because the lab's own hands held their own
copy of a column) doesn't have anywhere to happen here, because there's no copy to go stale.

**Pilot** (bossLab, seed 3100, normal health, knight/warden/pyro, one pass, oreroad only - the wall change touches
his arena, so the cost rules' bar for "a boss that changed" applies even though his AI itself didn't move):

| hero | result |
|---|---|
| knight | win, 99.7 s |
| warden | death at 200.4 s, 13% of his health left |
| pyro | death at 179.0 s, 22% of his health left |

Nobody is stuck (nobody ran to the 300 s cap), and the numbers sit in the same range winch3's own report recorded
for this fight (knight ~99-127 s wins, warden and pyro either a late win or a real death, never a stall) - the wall
and the new line elsewhere on the level don't touch anything the fight itself uses.

## Checks (all run by name)

Green:
- **This lane's own:** `ore-road`, `ore-exam` (43 assertions, 9 new this lane - the crossing pinned, the wall's fix
  pinned), `ore-ride` (rides `pass` automatically via its own coverage check; the wall's geometry and the generic
  clamp both proved in the page)
- **Also requested:** `ore-work`, `elites`, `slopes`, `checkpoint-stand`, `boss-fight-end`
- **The 7 REQUIRED CHECKS:** `architecture`, `checkpoints`, `skins`, `dangling-paths`, `boss-fight-end`,
  `slopes-trace`, `npc-removal` - `slopes-trace` is unchanged for every level (no level geometry moved in a way
  that changes a footstep trace; the new platforms are far from any existing route and don't shift a jump anyone
  already takes), so no rebase was needed.
- `syntax`

**Proved red first, never guessed at:**
- `tools/ore-road.mjs`'s two generic per-line checks caught two real placement mistakes in the new rests (see
  above) before I trusted the geometry - both against a build of THIS branch, not a synthetic plant, since they're
  the level's own standing checks and `pass` is a real line in it.
- The wall's own fix: a throwaway `git worktree` at this branch's base commit (ddfb86e), the SAME `tools/ore-ride.mjs`
  copied in, failed at the tile-geometry assertion (`open at [[8,0],[9,0],[10,0],[11,0]]`) - proving the check
  catches the real gap, not a check written to already pass. Worktree removed after; never `git stash`.

## UNVERIFIED

- No real-keys playtest of PASSING BUCKETS by hand - `tools/ore-road.mjs`, `tools/ore-exam.mjs` and
  `tools/ore-ride.mjs`'s bot ride prove the geometry and that a hero can be carried across it without doing
  anything, but how it actually *feels* to time a hop onto a bucket coming the other way is untested by hand.
- The exact vertical gap (4 tiles, at the built range's upper edge) is a design call - see QUESTIONS FOR DANIEL.
- I don't know every code path that can move a hero's `P.x` in this engine (a dash, a knockback, a launch) - the
  wall fix closes the TILE gap regardless of how a hero got there, which is why I built it rather than relying on
  the generic clamp alone, but I haven't hunted down and tested every one of those paths against the sealed wall
  specifically.
- No before/after frame capture for either change, to keep the PC's load down (two other lanes and a release suite
  were noted as possibly running).

## QUESTIONS FOR DANIEL

1. **The crossing's exact gap.** Built at 4 tiles (the built range's own upper edge of the 3.2-4.5 asked for) -
   integer rows only fit cleanly at 3 (under the range) or 4 (in it), so I took 4. *Recommend keeping it as built*;
   if a playtest finds the hop too easy or too hard, the number to retune is `OR.PASS.gapRows` in `src/ore-road.js`
   alone - nothing else references it.
2. **Where the second dock sits.** Built in the open gorge (column 82, where `first`'s own dip runs deepest),
   because PYLON B's underside - the other flat stretch - collides with oreroad3's own sapper deck one row away.
   *Recommend keeping it as built.* If PYLON B's own row (`YARD + 5`, the sapper platform) were ever freed up by a
   future lane, moving `OR.PASS` to use both pylons instead would be a small follow-up, not a rebuild.
3. **The Winchmaster's west wall.** Built as a full floor-to-ceiling wall for `wallL` alone, rather than stopping
   exactly at the Head Frame's own underside (row 9) - a wall that stopped there still left rows 0-7 open beside
   the housing (the fight's own headroom), which felt like trading one gap for a smaller one rather than actually
   closing it. *Recommend keeping it as built.* The wall is only ever solid while the fight is locked, so nothing
   about the room's own look changes outside the fight.
