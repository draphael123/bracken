# claude/winch3: lane report (2026-09-28)

THE WINCHMASTER's arena, round five: Daniel's playtest note "the platforms you fight the boss on are too close to the
ceiling and too narrow, which makes avoiding his attacks artificially difficult" (decided: fix it for real). The branch is
`claude/winch3`, based on `claude/oreroad3` (8a3c638), with origin/master merged before this report. I didn't touch master,
didn't deploy and didn't run the full suite.

## What changed

**(a) Making room: the low line moved down, plus five more columns.**
claude/oreroad3 found the real blocker. The two high housings couldn't come down because the low line ran at row 12
underneath them. I weighed three options:
- **Raise the ceiling.** This means shifting the whole level down, so every row of the other seven sections would move,
  and every tool that pins one of them. Too invasive.
- **Widen alone.** More columns buy width, never headroom.
- **Move the low line down (chosen).** This is the least invasive option that fixes both problems.

So everything in the room below the entrance landing sits lower:
- The landing stays at row 12 (`WINCH`). You drop off its end onto the deck at row 17.
- The high housings stand at row 8 (they were at row 4). Their ledges and the high line are at row 12.
- The deck, the low line and the Great Drum's ledge are at row 17. That is five rows under the high line, not four, so the
  Great Drum's ledge (under the Tail Wheel's east end) and the deck (under the Head Frame) also keep full headroom.
- The drawn cavern ceiling over his room keeps `OR.ARENA.ceilGap` (8) rows. Elsewhere it keeps `CEIL_GAP` (6).
- For width, the room got five more columns: `W` went from 524 to 529, and the arena now runs from column 476 to 524.

Headroom is measured in tiles of air over the standing surface, up to the first rock, the drawn ceiling or the top of the
level:

| place | headroom before | headroom after | width before | width after |
|---|---|---|---|---|
| THE GREAT DRUM | 6 | **8** | 9 | **10** |
| THE HEAD FRAME | 4 | **8** | 6 | **8** |
| THE TAIL WHEEL | 4 | **8** | 7 | **8** |
| the Great Drum's ledge | 6 | **7** | 3 | 3 |
| the Head Frame's ledge | 8 | 12 | 2 | **3** |
| the Tail Wheel's ledge | 8 | 12 | 3 | 3 |
| the entrance deck | 6 | **7** | - | - |

Standing on a housing, the surface is now 144 px (high housings) or 224 px (the Great Drum) below the top of the level.
Before, the high housings were at 80 px. The normal camera's foot line is 0.68 x 180 = 122 px, so standing up there no
longer pins the view to the top of the level.

**Why the Tail Wheel is 8 and not wider.** The low line runs under the Head Frame's ledge, the high line's gap, the Tail
Wheel's ledge and the Tail Wheel itself. Its phase-two REVERSE budget in `tools/ore-road.mjs` ("after a reverse ... to ride
back in") allows about 29 tiles of line. It is 28.5 now; before it was 26.5. Another tile on the Tail Wheel or either high
ledge breaks that rule. It would need a faster low line or a different reverse, and that is a balance change, not a
geometry change. The Head Frame and the Great Drum have no such limit: they only cost columns.

Everything else is kept and re-proved: the three housings, both lines, the rides (and every line still ends
three-quarters of a tile inside its ledges), the jam opening, the phase-two rust, the lamps on every housing, the ladders
(each top level with its housing), the drum pit, its turbines, recovery ledge and ladder home, and "four rows from ledge to
housing".

**The camera.** Centering needed a change. Centred on a room that is now 768 px wide, a 640 px zoomed view cuts about 64 px
off each end, and the Head Frame's man stands in that strip. His "he begins nothing off screen" rule would leave him
waiting there, and at 480 px (a 1080p screen) he was already off screen before this lane. So for the Winchmaster,
`src/main.js`'s `updateCamera` now frames the MIDPOINT of the hero and the Winchmaster, held inside the arena lock. A room
narrower than the view is still centred, as every other boss's is.

**(b) The lab's hands read `OR.ARENA`.** `src/lab.js`'s WINCHMASTER block no longer has a single literal arena column or
row. Every ladder, ledge, board lip, deck and the recovery ledge now reads from `OR.ARENA.housings` and
`OR.PITS` ('drum'). The deck is `O.x0 - 1 .. ladder - 1` at `O.deck`, and the board lips are the ledge edges.

**(c) `tools/ore-road.mjs` ROUND FIVE: four new assertions.**
1. Full jump headroom, 7+ tiles, over every housing, every ledge and the entrance deck. The measurement reads `L.ceil`. The
   cavern's existing ceiling check exempts a ceiling that has run out at row 0, and that exemption is exactly how the old
   room hid its 4 rows.
2. Every housing's surface is at least `CAM_FOOT x VH` px under the top of the level. Both numbers are read from main.js.
3. Every housing is 8+ tiles wide and every ledge 3+.
4. `src/lab.js`'s Winchmaster hands contain no literal arena column (anything from 460 to 539) and do read `OR.ARENA`.

**Proved red first.** I made a throwaway `git worktree` at 8a3c638, copied in the new `tools/ore-road.mjs` and ran it. All
four failed:
- headroom: Great Drum 6, Head Frame 4, Tail Wheel 4, Great Drum's ledge 6, deck 6
- surfaces at 80 px
- widths: Head Frame 6 with a 2-tile ledge, Tail Wheel 7
- the lab's literals found: 482, 509, 501, 466, 483, 484, 485, 499, 507, 508

I removed the worktree afterwards and never used `git stash`.

Two existing assertions read literals and now read the room instead. Neither is weaker:
- "The drum house's floor is the pit" was `pit.x0 <= AR.x0 + 6`. It is now `pit.x0 === ` the Head Frame's ladder column,
  which is stricter.
- "No spoil floor" scanned from the literal 482. It now scans from the Head Frame's ladder.

`tools/ore-ride.mjs`'s jam test looked for a skip between columns 488 and 491. It now looks 6.75-9.75 tiles out from the
low line's own start, which is the same place relative to the deck as before.

## Files
- `src/ore-road.js`: `OR.W`, `OR.ARENA` (plus its ROUND FIVE comment), the drum pit in `OR.PITS`, `PLACES.drum`, the
  landing's east end, the entrance deck block, the low line's start, and the arena ceiling gap.
- `src/lab.js`: the WINCHMASTER hands.
- `src/main.js`: `updateCamera` (the Winchmaster frame and `centerLock`).
- `tools/ore-road.mjs`, `tools/ore-ride.mjs`.

## Pilot (bossLab, normal health, seed 3100, 1 pass, knight / warden / pyro)

| hero | BEFORE (8a3c638) | AFTER |
|---|---|---|
| knight | win 100.8 s, took 80, 2 jams | win 127.3 s, took 89, 2 jams |
| warden | timeout 300 s, 11% of his health left, took 21, 3 jams (not stuck: it fought the whole time) | death at 129.3 s, 31% left, took 100, 2 jams (**not stuck**: 3 pit falls) |
| pyro | win 265.3 s, took 40, 2 jams | win 224.2 s, took 87, 2 jams |

The warden is not stuck. It moves between all three housings, and I traced every position in a probe run. I traced its
three falls as well. Each one is a pre-existing lab habit whose geometry relative to the ledges is unchanged:
- stepping off the high line a few px past the Head Frame's ledge edge as the skip goes into its station house
- being knocked off the Tail Wheel's ledge by a hit while he lay downed
- picking up a rusted low-line skip while waiting at the lip beside the Head Frame's ladder

For a diagnostic I ran the same pilot on the new room with the OLD centred camera: knight win 99.3 s, warden win 287.2 s,
pyro death at 145.2 s. So one seed swings each hero between a win and a loss either way. This is a smoke test, not a
balance band. The one systematic difference I'd expect is that he is on screen, and therefore acting, more of the time
now, because the camera frames him.

## Checks (all run by name)

Green:
- **Level and boss checks:** ore-road, ore-exam, ore-ride, ore-work, elites, slopes, boss-openings, boss-fight-end,
  zoom-coverage, checkpoint-stand, floaters, syntax
- **Required checks:** architecture, checkpoints, skins, dangling-paths, npc-removal, slopes-trace. slopes-trace is
  identical to the pre-slopes build for every level, so no rebase was needed.

## UNVERIFIED
- No real-keys playtest of the new room. The drop from the landing onto the deck, the feel of 8 tiles of headroom, and the
  midpoint camera are all proved by checks and the bot only.
- No before/after frame capture this lane, to save load on the PC.
- **Pre-existing, not changed:** the arena's lock wall is 6 rows tall (`setWall`). Walking off the Head Frame's west end
  lands you on top of it, and from there you can step back out onto the landing. The old room allowed the same thing
  (from row 4 onto the wall at rows 7-12).
- **Also pre-existing:** `setWall(false)` turns the east lock column to air (it is solid rock by build). That leaves a
  one-tile notch beside the Great Drum after an unlock, which already happened at column 519.

## QUESTIONS FOR DANIEL
1. **Widths.** I built the Head Frame at 8, the Tail Wheel at 8, the Great Drum at 10, and every ledge at 3. The Tail
   Wheel can't go past 8 (nor either high ledge past 3) without speeding up the low line or shortening his REVERSE.
   *Recommend 8/8/10 as built.* If a playtest still finds the Tail Wheel tight, raise the low line's speed from 60 to 66
   px/s in its own lane. That buys about 3 tiles.
2. **The camera frames you and him, not the room.** *Recommend keeping it.* Centred, his room is wider than any zoomed
   view, and the Head Frame goes off screen, so he waits there. The alternative is the ordinary follow-the-hero clamp.
3. **The drop onto the deck** (5 rows, off the landing's end into his room). *Recommend keeping it.* It is one-way, but
   the arena locks behind you anyway, and a death respawns you at the checkpoint on the landing. If you'd rather walk in,
   a short rope or ramp down the landing's end is a small follow-up.
4. **The lock wall you can stand on** (pre-existing, see UNVERIFIED). *Recommend a follow-up* that makes the Winchmaster's
   west lock wall run up to the Head Frame's underside, so there is no way out over it. It isn't part of this brief.
