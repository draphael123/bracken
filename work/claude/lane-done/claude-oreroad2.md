# claude/oreroad2: lane report (2026-09-28)

THE ORE ROAD, level id `oreroad`. Everything is on `claude/oreroad2` (branched from master `cd35d24`) and pushed. I did not touch master, did not deploy, and did not run the full suite - only the named checks below.

## Commit

| sha | what |
|---|---|
| `3193ad1` | the exam ride, the ore/lamp/backdrop/slope backlog items, the pinning check |

## The brief

The design audit's section on THE ORE ROAD (`docs/level-design/wood-to-highcrown-design.md` on `origin/claude/designaudit`) and its "GAME-WIDE PATTERNS WORTH FIXING ONCE" item 1 both named the same gap: *the last stretch before the boss (408-475) is on foot* - the level's mechanic map flags it directly, and it's one of only two levels (with Gale Moor) the audit calls out by name for having no exam before the boss. The audit's own plan for the fix (§10, plan item 3, "EXAM"): make the winch house a last ride, one short line with a rusted bucket, a sheargob who leaps on, a tippler over the middle and bats; move the foot fights to the landing.

I built that plan against **current master**, not the audit's own (stale) geometry - the NPC-removal batch changed this level after the audit was written, so I read the plan for its intent and rebuilt it against what's actually in `src/ore-road.js` today.

## What changed (`src/ore-road.js`)

**1. THE ORE SHAFT (408-475): the exam.**
- The old single solid floor under the whole winch house is now two decks (408-420 entry, 451-480 landing) with an open pit between them (421-450) - a new `winch` cable line rides it, and a new `winchride` entry in `OR.PITS` gives it the same fall-and-recover rule (turbines, a recovery ledge, a ladder home) as every other span in the level.
- The `winch` line has `cracked: 4` (one bucket in four is rust, the same convention as the steep line's `cracked: 3`), and it's a real bucket ride, not a hop line.
- A sheargob waits at the boarding deck (419, over the loft) - "the one who leaps onto your bucket" - and a tippler stands over the middle of the shaft, tipping onto a small new one-way "spill ledge" (`plat(427, 20, 3)`) so its stream still lands on a floor (A12: a tipping frame needs a floor under its feet *and* under its stream - it did not have one over open gorge).
- THE SHAFT BATS (a new small encounter, two bats) are loose over the ride.
- The crew that used to fight standing on the shaft's own floor - a rockgoblin, a checkpoint, a sign, the mine office and a shoring set - all moved onto the entry deck or the landing on either side of it. THE WINCH CREW and THE DRUM YARD encounters keep the same foes, repositioned.
- `OR.PLACES.winch` (408-475) is untouched - I didn't add or remove a named place, just changed what's inside this one, per F1's seven-of-60-to-100 shape.

**2. Daniel's approved backlog for this level, folded in:**
- **More ore.** A fifth ore, silver, alongside copper, iron, gold and the gem (`ORES` in `src/ore-road.js`, now 5 entries). `oreBias(x)` leans each route section on a different one of the five (the yard/span on copper, the tower/chute on silver, the collapse/steep on the gem, the winch/drum on gold) and `oreAt()` blends that bias 60/40 against a full random pick, so no stretch is a single stamp. `tools/ore-road.mjs`'s ore-count assertions were updated from four to five to match (not weakened - the level has strictly more variety now, and the check still fails if any of the five is missing).
- **A lamp in the one dark room.** `LAMP_EVERY`'s placement loop stops short of the arena (`A.x0 - 2`), so the drum house - the boss's own room - never had a single lamp in it. It has one now, on the entrance deck.
- **Warmer lamps.** `minerlamp`'s light radius in `src/main.js` went from 76 to 98 px. `minerlamp` is this level's own entity (nothing else in the game uses it), so this doesn't touch any other level's look.
- **Better visual variety per section.** `drawOreBackdrop`'s far wall used one grey the whole level. It now reads `sectionTint(cx)` off `OR.PLACES` and tints the far rock by whichever place the camera is over - warm through the yard and the span, cool silver through the tower and chute, violet through the collapse and steep line, amber toward the winch and drum.
- **A slope.** One, at the ore yard's spoil heap (`src/slopes.js`): a two-tile ramp (`SLOPE.R1`, `SLOPE.R1`) climbed instead of jumped onto. `tools/slopes.mjs` has a level whitelist that asserts only THE SUNKEN CARAVAN has slope tiles in it (a level with any slope has no old-mover baseline, so it's excluded from the old-vs-new comparison rather than compared); I widened that assertion and its message to name `oreroad` too, with a comment saying why. `tools/slopes-trace.mjs` only samples four fixed levels (wood, kings, keep, burial) and doesn't touch oreroad, so **no rebase was needed** - it passed unchanged.

## The pinning check

`tools/ore-exam.mjs` (new, registered in `tools/check.mjs`'s list) pins: the `winch` line exists and sits inside 408-475 with a rusted bucket; the `winchride` pit is real (not a painted gap); THE SHAFT BATS, the tippler over the shaft and the boarding sheargob are all present; no foe of the old floor-fights encounters is left standing over open air in 421-450; five ores exist with a working section bias; the arena has a lamp; at least one slope tile exists at the spoil heap; and the level's id/needs/boss and its eight named places are untouched.

Proved red on master: `git worktree add ../oreroad2-baseline-check cd35d24`, copied `tools/ore-exam.mjs` into it, ran it against the pre-change `src/ore-road.js` - it throws immediately (`oreBias` isn't exported, since none of this existed). Worktree removed afterward (`git worktree remove --force`), never `git stash`.

## Checks (green)

`npm run check -- ore-road,ore-work,ore-ride,ore-exam,architecture,checkpoints,skins,dangling-paths,boss-fight-end,slopes-trace,npc-removal,syntax` - all pass. Also ran `tools/slopes.mjs` on its own (green, including the widened level whitelist).

- **ore-road** - the level's own rework promises (skip width, gap-vs-jump, seven sections, checkpoint spacing, tipping-frame floors, line-ends-inside-deck, the mine's ore/furniture/places bookkeeping) plus the Winchmaster's own A1-A12 checks.
- **ore-ride** - every cable line (including the new `winch` line) carries a physics knight across without falling; every pit (including the new `winchride`) costs a fifth of health, the turbines carry him home. `secs 14.2` for the winch line's ride, comparable to the other short lines.
- **ore-work** - the moved `rockgoblin` (cart) and `sapper` (sack) work loops still fire and alert correctly at the new positions; no working goblin deals damage before its alert.
- **ore-exam** - the new pinning check, all 15 assertions pass.
- **architecture, checkpoints, skins, dangling-paths, boss-fight-end, npc-removal, slopes, slopes-trace, syntax** - all green, unaffected outside this level.

## UNVERIFIED

- `tools/oreroad-walk.mjs` (not in the suite - it's a play-bot sweep, and the bot cannot fight per RULES M) reports the knight bot getting stuck at route tile 75 and only covering 26% of the level before giving up. I checked: tile 75 is in the first span, nowhere near anything I touched (my changes start at column 421). This looks like a pre-existing bot limitation (it can't fight past an early encounter), not a regression from this lane - I did not chase it further given the brief and the cost rules.
- I did not extend the vein pickups' (`L.veins`, the minable rock-face seams you can strike) two-way gem/not-gem palette to the full five-ore set - only the SEAM texture (`L.seams`, the ambient ore in the rock faces, already a much larger system) got the full five-ore section bias. Veins still read as either "ore" (rust/brass) or "gem" (violet/cyan). Widening veins to all five ores would touch `drawOreVeins`' two-palette rendering, which felt like more surgery than the backlog's "own colour + sparkle, mined the same way" strictly asked for - flagged below.

## QUESTIONS FOR DANIEL

1. **Should the minable veins (the pickups you strike, not the background seam texture) get all five ore colours too, or stay gem/not-gem?** *Recommendation (conservative, built as default): leave veins as the two-palette gem/ore system - it's what "mined the same way" already describes, and the seams (the much larger ambient system) now carry the full five-ore variety and the section bias. Widening veins is a small, separable follow-up if you want it.*
2. **The winch line's rust rate** (`cracked: 4`, one bucket in four) - I matched the steep line's convention (`cracked: 3`) rather than trying to land on literally always-exactly-one-rusted-bucket-visible, since the loop math doesn't guarantee an exact count at any instant. *Recommendation: leave it - it reads the same as the steep line's rust, which you've already approved.*
3. **The slope is a single, small, safe proof (the spoil heap ramp) rather than a broader re-terrain of the cart lines** ("ramps to the cart lines" in your note) - the cart rail spans I found are all flat with their surrounding floor, so a ramp there wouldn't connect two different heights the way the spoil heap does. *Recommendation: if you want a literal ramp up to a cart line, tell me which one (e.g. the winch house's rail yard, or the ore yard's feed rail) and I can shape a small rise into it in a follow-up - didn't want to guess and reshape a working mine-life loop's geometry without a specific target.*
