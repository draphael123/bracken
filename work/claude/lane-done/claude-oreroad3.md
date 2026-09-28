# claude/oreroad3: lane report (2026-09-28)

THE ORE ROAD, round three, off `claude/oreroad2` + `claude/winch2` (batch38, master `05deabe`). Everything is on
`claude/oreroad3` and pushed. I did not touch master, did not deploy, and did not run the full suite - only the
named checks below.

## Commits

| sha | what |
|---|---|
| `5456b81` | THE BREAKABLE-WALL ENGINE (item 1): `src/breakable-walls.js`, the main.js hook, three walls placed |
| `219e91c` | floaters extended to ore veins and mine-floor items (item 2) |
| `0bd94eb` / `b982602` | item 3 tried (widen THE TAIL WHEEL), then reverted once a pilot found a real regression |
| `85adcc8` | ore-exam: 9 new assertions pinning item 1 |
| `4d39a01` | checkpoint-stand: list the Drum Yard checkpoint's real gap (item 1's wall) |

## Item 1: ORE WALLS YOU MINE THROUGH - DONE

Built the engine once, `src/breakable-walls.js` (pure, no DOM): a `WALL_KINDS` table (`ore`, `secret`) so a later
lane's approved secret wall and the future minecart level reuse it instead of building their own. A wall is
ordinary `T.SOLID` rock at build time (so the route reads right and no tool needs teaching a new tile) plus a small
runtime record (`hits`, `broken`, `flash`) in the level's own `L.walls` array.

**The feel is the vein's.** `src/main.js`'s `wallsStep` strikes a wall exactly the way `oreVeinsStep` strikes a
vein - the player's own attack box (`attackBox()`) against the wall's rect, `P.hitSet` keeping it to one hit a
swing. `WALL_KINDS.ore.hits = 3` (the vein's own `OR.VEIN_HITS`). A ground slam (the same blow that breaks a crate
in one) breaks a wall outright, reusing the crate-break loop in `main.js` rather than adding a second heavy-hit
path. When it gives, `breakWall` turns its tiles to real air (`L.grid`, `tileSpr`, `destroyed`) and pops ore (or
coins, for `secret`) the way a mined vein pops coins - `ORE_NAMES`/`ORES` for the popup text and burst colour.

**Never a soft-lock.** `wallsMendAll` (called from `respawn()`'s existing `mendAll()`, the same reset a cut bridge
span gets) puts every broken wall back to solid rock on death - so a wall gating the route can be relied on to
still be there next attempt, not skipped once and left open for good. A full level reload resets it too, for free
(the level rebuilds from scratch).

**Three walls placed**, each in its section's own ore colour (`oreBias`):
- THE ORE YARD, column 13 (a nub above the spoil peak's walkable top) - a side dig, copper.
- THE COLLAPSED SPAN, column 334 (above the wreck head's walkable top) - a side dig, gem (the section's own lean).
- THE DRUM YARD, column 468, rows `WINCH-5..WINCH` - **on the main route**, between THE DRUM YARD's fight and the
  checkpoint at 470: too tall to jump, so the landing is genuinely blocked until it gives. Gold (this section leans
  toward the drum).

I could not place the main-route wall in the Winch House's own entry deck (408-420) as first tried: that whole
span is the rockgoblin cart's own animated rail (`WORKS`, span 408-418 - the follow-up in `claude/oreroad2`'s
report already found this and used the ore yard for its slope ramp instead, for the same reason) - proved red on
`tools/ore-road.mjs`'s footing checks before I moved it.

**Pinning:** `tools/ore-exam.mjs`, a new section ("ROUND FOUR: ORE WALLS YOU MINE THROUGH"), 9 assertions: count
(2-4), every one starts unbroken in a known kind, every one is a real rectangle, every one is solid rock at build
time, at least one on the main route and one off it, every `ore` wall carries its own section's colour, and the
main.js hook (`wallsStep`, `breakWall`, `wallsMendAll`, wired into `respawn`) exists. Proved red: a throwaway
worktree at `05deabe` (before the walls existed) - `src/breakable-walls.js` does not resolve there, so the whole
section fails immediately, not a single line the old code happened to pass. Worktree removed after, never
`git stash`.

**A side effect, fixed as its own thing:** the placement shifted `level.js`'s `dressLevel` sprinkler (a seeded
RNG, deterministic off level content) enough that it put a `lanternPost` on top of a pre-existing vein at 430,5 -
proved: that collision did not exist on the commit before this one (checked both, same script, same vein, no
decoration there before). `dressLevel` had no way to know a vein already stood there (`L.veins` isn't a
decoration), so I added `noDress: veins.map(...)` to the level's own return - the general fix (every vein's own
cell is off limits to the sprinkler, on any level that grows veins later), not a coordinate nudge that would only
work by luck until the next change anywhere in the file.

## Item 2: GROUND EVERY FLOATING ORE - DONE (nothing was floating; the check didn't exist)

Neither `L.veins` (a vein decal on a wall face) nor `L.mine` (a heap/cart/spill on a floor) is an entity, so
`tools/floaters.mjs` never looked at either - the extension is generic, for any level that grows one later, not
only THE ORE ROAD. Proved it catches a real problem: a throwaway node script planted a floating vein and a
floating heap on a built copy of the level and confirmed both get reported (never committed - a synthetic plant,
reverted). THE ORE ROAD itself has none floating today: its own `ore-road.mjs` footing checks (from
`claude/oreroad2`) already ground every vein and every mine item it places. Full-suite `floaters` run (all 44
levels) is unchanged otherwise (2818 things checked, same as before this lane).

I looked hard for anything ELSE in the game drawn as "ore" and found nothing outside `src/ore-road.js` - `veins`
is the only module that uses the word for anything but flavour text, so the scope really is this level plus the
generic extension for whatever grows next.

## Item 3: LOWER AND WIDEN THE HOUSINGS - NOT DONE, reverted

Tried, in order, and every direction came back red:
1. Widen THE HEAD FRAME east past its own ladder (fixed at column 482 - the entrance deck's own rope carried on
   up, and the deck is a single tile at 481) pushed its ledge close enough to THE TAIL WHEEL's that the high line
   fell under `WINCH.revRange + 40` - proved red on `tools/ore-road.mjs`'s own REVERSE-range line.
2. Move that ledge to the other side of the widened housing kept the line long, but then the line's own path (a
   hero rides it, empty as well as loaded) ran straight through the housing's own new width - proved red on "the
   high line never carries its rider into rock".
3. Widen THE TAIL WHEEL east (the only side with any room) reached column 509, which is THE GREAT DRUM's own
   ladder column. Every `tools/ore-road.mjs` assertion stayed green - but a pilot (bossLab, seed 3100,
   knight/warden/pyro, one pass each, before and after) turned up a real regression: the warden, a clean win on
   master (283.8 s), ran to the 300 s cap taking **no damage at all** - stuck. `src/lab.js`'s own hands for this
   fight read several of these columns as bare literals (482, 501, 509 - lines 770-801), not off `OR.ARENA`, so
   putting Tail Wheel's own new platform tile on column 509 collided with what those literals mean. I reverted
   before shipping something that stalls a hero, not merely something a check flagged.
4. Lowering either housing (moving `top` down) runs into a wall on both sides regardless of width: THE LOW LINE
   rides at the standing-height of row 12 (`A.deck`) the entire way from the entrance deck to THE GREAT DRUM, over
   the same columns the two high housings stand in - a `top` low enough to put a housing's own ledge (always four
   rows under it) on or near row 12 puts solid rock in the low line's own path (proved red). Low enough to clear
   row 12 from the other side puts the housing at the entrance deck's own standing height, which breaks "no jump
   reaches any housing" (a two-tile hop from 481 would then reach it) - not attempted past that point.

`ARENA`'s numbers are byte-identical to master's now (diffed) - only the comment changed, recording all of this
for whoever picks it up next. See QUESTIONS FOR DANIEL.

## Item 4: PASSING BUCKETS - NOT DONE

I looked for the cheapest honest way to do this before building anything new. THE ORE CHUTE and THE DOWN LINE
already run opposite directions and share the tipple/foot area, so I measured where they actually are relative to
each other (`lineYAt` at every even column, both lines): they only come within a jump's reach of each other right
at the shared station (the last ~20 px before both end near THE CHUTE's foot) - everywhere else over the tipple
house their vertical gap is 85-105 px, far past a jump. That pairing does not give a genuine mid-air "hop to the
one passing the other way" moment; it only looks like one on the map.

Building a real one - a second line over an existing span, opposite direction, timed to bring a bucket close
enough to hop to at some point along the ride, told with a sign, falling into the span's own pit on a miss (THE
FIRST SPAN's pit already exists and already gives a climb, not a death, which is most of the safety net for free)
- is a same-sized job to item 1, and I did not have a safe amount of the session left to build and prove it the
way item 1 got proved (a red-first check, a pilot, the works) after item 3's detour. Recommendation below.

## Checks (all named, all green)

- `syntax`, `ore-road`, `ore-exam` (32 assertions, 9 new), `ore-work`, `ore-ride`, `elites`, `slopes`,
  `slopes-trace`, `floaters` (full suite, 44 levels), `node tools/headless.mjs floats oreroad`
- `architecture`, `checkpoints`, `skins`, `dangling-paths`, `npc-removal` (5 of the 7 REQUIRED CHECKS relevant
  here), `boss-fight-end`, `boss-openings`, `checkpoint-stand` (fixed: see item 1)
- `slopes-trace`: identical to the pre-slopes build, unchanged by this lane (no rebase needed)

Ran mostly as small named batches rather than one giant one, per the cost rules (this PC has two other lanes and
the batch39 release suite running); the coordinator flagged mid-session that another lane ran a `taskkill` that
may have killed a check of mine - nothing of mine died silently that I found (every check above completed with a
real result, not a null/timeout I had to explain away), but I re-ran the slower browser ones a second time anyway
to be sure.

## Pilot (bossLab, normal health, knight/warden/pyro, seed 3100, 1 pass, before/after item 3's attempted change)

| hero | BEFORE (05deabe) | AFTER (Tail Wheel widened to 509, the attempt that got reverted) |
|---|---|---|
| knight | win 122.6 s, took 41, 2 jams | win 122.4 s, took 41, 2 jams (harness itself unaffected) |
| warden | **win** 283.8 s, took 99, 3 jams | **stuck, 300 s cap, took 0**, 1 jam |
| pyro | timeout at 300 s (pre-existing on master too, not this lane's doing) | timeout at 300 s |

The warden regression is why item 3 is reverted. A second before/after pass under the current concurrent PC load
showed some noise even on identical code (knight moved from ~122 s to 100.8 s run to run) - the warden's flip from
a clean win to a full stuck-at-cap run with zero damage taken is a different order of signal than that noise, so I
trust it as real, not load jitter.

## UNVERIFIED

- Items 3 and 4: see above - not shipped, not guessed at past the point where a check or a pilot went red.
- No real-keys playtest of the breakable walls (item 1) - the bot-pilots and `ore-exam`/`ore-road.mjs` prove the
  mechanics and the geometry; how it actually feels to mine through rock with a sword is untested by hand.
- `tools/oreroad-walk.mjs` (informational, not in the suite, cannot fight) - did not re-run it this lane; the
  claude/oreroad2 report already noted it gets stuck early regardless of what this level's later lanes do.

## QUESTIONS FOR DANIEL

1. **Item 1, the main-route wall's toughness.** 3 blows (the vein's own count) or fewer/more? *Recommend leaving
   it at 3* - it reuses the vein's own established feel rather than inventing a second number.
2. **Item 3.** The room (columns 476-519, 43 columns for three housings, two lines and every ledge/ladder) has no
   free column left for this brief without either breaking the reverse-range/rock-collision rules or colliding
   with `src/lab.js`'s own hardcoded ladder columns (482/501/509). *Recommendation: a follow-up lane scoped
   specifically to this, with room to (a) move the low line's own path off row 12 or widen the room itself (`W`),
   and (b) rewrite `src/lab.js`'s WINCHMASTER hands to read every column off `OR.ARENA` dynamically instead of the
   five bare literals at lines 770-801, so a future geometry change does not have to rediscover this the same way.*
   Given the size of that rewrite, I did not start it in this lane - it touches the one thing every future
   Winchmaster lane depends on (the pilot), so I'd rather flag it than rush it.
3. **Item 4.** *Recommendation: THE FIRST SPAN* (68-135, already flagged in the level's own header comment as one
   of the plainer rides) for a genuine passing-buckets pair - it already has a pit with the fall-safety net item 4
   asks for, built in. A second line over the same span, opposite direction, a sign that tells it, and a timing
   window proved by `tools/ore-ride.mjs`-style checks before it's called done. Scope it as its own lane rather than
   folding it into a future item-3 follow-up - the two don't share geometry.
