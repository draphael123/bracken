# Lane report: claude/spurs (class-level side roads)

Branch `claude/spurs`: master (388fed0) plus one commit. `origin/master` was checked again at the end (still 388fed0,
nothing new landed, so there was nothing to merge).

| commit | what |
|---|---|
| b77e6fa | opensOn/classFor, the walkable branch, the junction's requirement text, tools/class-spurs.mjs, the two captures |

## The ask

Daniel, 2026-09-25: "the pyromancer and deathknight level weren't accessible. We should have unlock requirements for
them... They can be side paths that are locked until you do this." Today a spur (THE BURNING VILLAGE, THE UNBURIED
FIELD) was reachable only from the side level-select panel; left/right on the map walked straight past it, and the
lock was "the parent level cleared" - already true for most players well before they'd want to detour for a class
level.

## What was built

1. **A general rule, not two special cases.** Any level may now declare `opensOn: { level: <id>, medal:
   'bronze'|'silver'|'gold' }` (src/level.js). It stays locked until that level has been beaten under that medal
   time, OR until it has itself already been cleared (`opensLocked` in src/main.js, folded into `levelLocked`
   alongside the existing `needs`/`needsTime`/`needsKills` gates). `classFor: <hero id>` sits next to it, naming
   which hero's class level it is - metadata for the next lane to key off, not itself a gate. Burning declares
   `classFor: 'pyro', opensOn: { level: 'stockade', medal: 'silver' }`; Unburied declares `classFor: 'reaper',
   opensOn: { level: 'witchlight', medal: 'silver' }`. The next class level (the Cathedral off Waymeet, the Saint's
   Purse off the Hurricane Deck) just declares its own two fields; nothing in main.js names 'burning' or 'unburied'.
   `needs` is UNCHANGED on both - it is what the side panel groups a spur under (`mapPanelIdx`), not the new gate.
2. **The walkable branch.** `branchStep(dir)` in src/main.js: standing at a junction node whose id matches some
   spur's `opensOn.level`, pressing UP or DOWN (whichever direction points at the spur on the map - a per-pair
   comparison of their y, not a hardcoded 'up') steps onto it if it is open, buzzes if it is not, and does nothing
   at every other node. Standing ON the spur, the opposite press steps back to the junction. This runs BEFORE the
   existing "up/down sets the difficulty" handling in `updateMap`, and only intercepts the press at the two nodes
   that actually have a class-level spur - every other node's difficulty toggle is untouched. The side panel
   (`mapPanelJump`) still works exactly as before; this is a second door onto the same room, not a replacement.
3. **The lock, and its requirement text.** The dashed stub and the lock icon on a locked spur were already drawn
   (existing `bakeWorldMap`/`drawMap` code, unchanged). New: while standing at a junction whose spur is still shut,
   `drawMap` prints the requirement in the game's voice - "BEAT THE STOCKADE IN 8:00 TO OPEN THIS ROAD" - on its own
   plate, fitted with `fitText` against the 320x180 buffer's own width (`VW - 12`, not a guessed number: the first
   version capped the box at 128px and silently truncated the string to "BEAT THE STOCKADE IN", caught by looking at
   the actual capture, not by the check - see "UNVERIFIED" below). It disappears the moment the road opens.
4. **Migration, read straight off saved PROG, no migration step.** `opensLocked` returns false (open) whenever
   `PROG[lv.id].cleared` is already true - so a save that beat Burning or Unburied under the OLD rule (needs: cleared
   parent, no medal asked) stays open. It also returns false whenever the PARENT already holds the required medal -
   so a save with silver or better already banked on the Stockade or the Witchlight Stair opens the class level the
   first time this code runs, no separate migration function needed. Both are covered by `tools/class-spurs.mjs`.
5. **The shop gate.** `coinRoute` (the Pyromancer's `coinNeeds: 'burning'`, the Death Knight's `coinNeeds:
   'unburied'`) reads `PROG[id].cleared` directly and was never touched - checked anyway (`class-spurs.mjs`
   asserts `BK.store.coinRoute('pyro')` once Burning is cleared).

## The check, and proving it red first

`tools/class-spurs.mjs` (wired into `tools/check.mjs`'s list, verified with `grep -q "\['tools/' + t +
'.mjs'\]"`). It drives the real page, not a mock: `gotoLevelNode` is reached the same way the game reaches it every
time a level ends (`BK.load` then a confirm off `gameover`), and PROG is edited directly the way a save file would
be. It asserts: a fresh save's branch does not open; silver on the Stockade opens it and the opposite press returns;
a bronze-only clear is NOT enough (silver is what `opensOn` asks for); the shop gate still works; an old save that
already cleared the spur under the previous rule stays open; a save already holding silver on the parent opens the
never-played spur at once.

**Proved red first** (AGENT-HANDOFF's own rule): stashed `src/main.js` and `src/level.js`, reran the check against
the untouched code, watched it fail ("silver on the Stockade did not open the walkable branch to the Burning
Village"), restored the stash and reran green. Also caught a real bug this way during development, not against the
old code: the first version of `branchStep`'s "step back off the spur" direction check had its comparison inverted
(pressing Down on the Burning Village stayed on the Burning Village instead of returning to the Stockade) - the
check failed on my OWN new code before I fixed the sign, which is exactly what it is for.

## Checks run

`map-grammar, progression, progression-runtime, store-preview, shop-gates, shop-theme, textfit, levelling,
levelling-runtime, keys, content-audit, audit, comments, syntax, homepaths, dangling-paths, class-spurs` (named),
plus `additional-areas, one-new-foe, unburied` (found by `grep -rl "spur\|mapGo\|nodeLocked" tools/`; `spurs-runtime`
and `spore-walk` also matched that grep but are about the CLIMBING SPURS relic, not the map - unrelated, not run for
this). All green, run one at a time as instructed, nothing re-run for a false timing failure. Never ran the full
`npm run check` (only the integrator does that).

## The two silver times, and whether they're fair

- **THE STOCKADE**: silver 480s (8:00). Its own MEDALS row is `[330, 480, 720]` (gold/silver/bronze), sitting between
  MARSH WOOD's silver (450s) and SPOREWOOD's silver (520s) - the wood chapter's three silvers climb smoothly, 450 →
  480 → 520, and the Stockade's sits right where its position in that climb would put it. By that comparison it
  reads as ordinary, not tightened, not loosened.
- **THE WITCHLIGHT STAIR**: silver 450s (7:30). Its MEDALS row `[300, 450, 680]` is a comment-flagged **ESTIMATE, no
  climbing pilot** (src/main.js's own comment on the row, unchanged by this lane). Measured against
  `docs/audit/ranking-2026-09-24.md` (route length, not a timed run): the Stockade's route is 494 tiles for a 480s
  silver (≈1.03 tiles/s); the Witchlight Stair's route is 616 tiles - longer, and a climb (a 36-row shaft with
  drifting slabs, slower than flat ground by nature) - for a 450s silver (≈1.37 tiles/s), a FASTER required pace on
  a HARDER, longer level. That comparison suggests the Witchlight silver may be the tighter of the two, not that
  either is unfair outright.
- **I DID NOT TIGHTEN EITHER NUMBER**, and I did not build a bot pilot to walk either level for a measured time -
  that would mean writing and validating two new full-level pilots blind, which is its own multi-hour lane and was
  out of scope for wiring up the lock itself. Both silver times above are marked **UNVERIFIED** against a real
  timed run or a bot pilot; the comparisons are structural (sibling medal tables, route length), not measured.

## QUESTIONS FOR DANIEL

1. **Is the Witchlight Stair's silver (7:30) too tight relative to its length and the climb, compared to the
   Stockade's (8:00)?** Recommendation: leave it as-is until it has a real pilot or a human clear time - the brief
   says "do not tighten," and loosening it without a measurement would be guessing in the other direction just as
   much. If Daniel or a playtester finds the Unburied Field effectively unreachable while the Burning Village opens
   fine, that is the signal to revisit this one number, not the general rule.
2. **Should the walkable branch also work from the SPUR side when the level is later re-locked by some future rule**
   (e.g. a level that can un-clear)? Nothing in the game currently un-clears a level, so `branchStep`'s "step back"
   direction never needs to check `nodeLocked` on the way out - it always allows leaving a spur you're already
   standing on. Recommendation: no change needed now; flag only because the next class level that copies this
   pattern should know the return path is not lock-checked, on purpose.
3. **The requirement text always shows the SILVER time even when `opensOn.medal` could theoretically be 'bronze' or
   'gold' for a future level** (this lane only shipped `'silver'` for the two class levels asked for). `spurReqText`
   already reads whichever rank is declared and prints the matching MEDALS time, so no code change is needed for a
   future level using bronze or gold - flagging only so whoever writes the Cathedral or the Saint's Purse brief
   knows the wording is already general, not hardcoded to "silver."
