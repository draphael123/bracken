# BRACKEN — parallel build handoff (2026-09-23)

Everything below is true as of branch **`codex/playtest-0919`**, which is the branch to work from. Fourteen commits
landed on it on 2026-09-23 and the **full suite is green on them: 108 checks, no failures**. Nothing is deployed;
production is still on `d02af58`.

**Setting up from scratch:** clone it, check that branch out, and run. There is nothing to install - `package.json`
declares no dependencies, there is no `node_modules` and no build step. You need Node, and Chrome or Edge installed
for the page checks to drive.

---

## THE THING THAT MAKES PARALLEL WORK POSSIBLE AT ALL

Until tonight only one session could work, because `npm run check` needed the machine to itself. **That was never
about Chrome.** `cdp.mjs` already randomises the DevTools port and `profile-sweep` already skips a profile a live
browser is holding. What collided was one number: every page tool defaulted to `PORT 5892`, and `cdp.mjs` correctly
refuses a server belonging to a different checkout.

`tools/ports.mjs` now gives **each checkout its own block of ten ports**, derived from a hash of its own path
(`bracken` 6450, `bracken-archroom` 6400, `bracken-slopes` 6330). Browser profiles are tagged `bracken-<kind>-<run>-`
and `profile-sweep --check --run <tag>` counts only its own, so a run that is KILLED can no longer be reported as
another run's leak — the false red that threw away a full suite run on 2026-09-22.

**So: one git worktree per agent, and they can all run page tests and suites at once.** This is untested at more than
one concurrent suite; if two collide, the failure is loud and immediate (`cdp.mjs` times out waiting for its own
server) and the fix is `BRACKEN_PORT_BASE=<n>`.

```
git worktree add ../bracken-<name> -b claude/<name> origin/codex/playtest-0919
```

## ONE SUITE AT A TIME, MACHINE-WIDE

Worktrees mean agents can edit, run Node checks and run 8-second subsets in parallel all they like. **FULL
`npm run check` RUNS MUST BE SERIALISED.** Not for comfort - for correctness. Several checks measure TIMING and fail
under load: on 2026-09-23 `mother-pilot` and `undercrown-variety` failed in both of one session's full runs and
passed alone every time, and `attack-animation` recorded 8.3 hours for a check that takes 45 seconds. A false red
costs more to chase than the parallelism saves.

Before starting a full run, say so to the other agents and wait for the machine. After it, say it is free. If a check
fails, **re-run it alone before believing it** - `node tools/<name>.mjs` - and say in your report whether it passed.

## RULES, FROM DANIEL, NOT NEGOTIABLE

1. **Nothing deploys.** Ever, without him saying so in that session.
2. **Park anything ambiguous and move on** rather than guessing. List what you parked in your report.
3. **Do not build a level he has not seen a brief for.** Briefs are cheap; a rejected level is a wasted night. There
   are briefs in `docs/briefs/` for the Ore Road, the Burial Caverns, the hero kits and seven desert levels.
4. **One full `npm run check` before anything merges.** `npm run check -- name,name` runs a named subset in ~8s for
   the build loop, and prints loudly that it is NOT the suite.
5. Commit messages explain **why**, and name what is still unverified.

## WHAT LANDED TONIGHT (do not redo these)

- **`tools/ports.mjs`** — the parallelism above.
- **`wardedDamage()`** — the burn tick wrote `e.hp -= 2` straight into bosses while every ward lived inside
  `hurtEnemy0`, so fire walked through the False Abbot's fifth-damage ward at full strength. **His 38% and the
  Pyromancer's 4/4 against him were both measured through this bug and mean nothing.**
- **`tools/skins.mjs`** — any solid cell indoors with no skin entry falls through to the ground kit and paints as
  GRASS. Daniel reported one (the parapet); the rule found the crenellations, then 334 more cells including the
  Reading Room gallery. Fixed by a sweep, not a list.
- **`tools/threat-holes.mjs`** — `src/threat.js` had no entry for zombie/bonegob/bonearcher/apprentice/husk and six
  bosses: 159 placements scoring zero. **The Burial Caverns was not a 56, it is a 108.** Any level measurement taken
  before this commit is suspect.
- **The Archmage's sanctum** (`src/sanctum.js`), **the Buried Dead's two tiers + THE HANDS**, **the Paladin's charge
  220→145 px/s and his churchyard tombs**.

## THE QUEUE, SPLIT SO THE FILES DO NOT COLLIDE

Each block is one agent, one worktree, one branch. The file lists are the point — respect them.

### A. THE ORE ROAD REWORK — the biggest, and the worst level in the game
`src/ore-road.js` · `src/winchmaster.js` · `src/redraw/winchmaster.js` · `tools/ore-road.mjs` · `tools/ore-ride.mjs`
· `tools/winchmaster-pilot.mjs` · the `oreBuild`/`updateBucket`/`winchC`/`updateWinchBoss` hooks in `main.js`
(search "THE ORE ROAD") · the `winchmaster` block in `src/lab.js`.

**Read `docs/briefs/ore-road-rework.md` first — it is complete and Daniel has seen it.** INDEX **59** walked after
Highcrown's 120, against neighbours at 92–113. 27 foes over 470 columns, hazard 0 on a level about a gorge, an
88-column dead stretch. Targets are in §5 of the brief. `OR.BUCKET.w` is 24px and the knight is 14 — widen to 44–48
or no fight can happen on a bucket. `tools/ore-ride.mjs` warning: **keep every cable line's end 0.75 of a tile inside
its deck** or fast lines drop riders. Trace with `work/claude/winch-trace.mjs` before piloting; the bot needed seven
pilots and never converged.

### B. THE WORLD MAP — visual variety, life, and a side toggle menu
`src/art.js` (`bakeMap` ~705, `bakeWorldMap` ~2192) · `main.js` `drawMap()` ~3053 and `updateMap()`.

Daniel: *"improve the level select with visual variety, and also an optional level select menu that is a toggle on the
side. The map needs to have more life and be more visually interesting."* Three jobs: a **side list panel** (toggle,
scroll, select, jump to node), **live motion** in `drawMap()` — smoke off the towns, birds, water shimmer, torch
flicker, a pennant on the token; it cannot be baked if it moves — and **richer per-style art** in `bakeMap()` (five
styles: wood, coast, crag, haunted, mark). Do the menu and the motion first. Render to PNG in Node for approval.

**AND THE MAP MUST TELL THE TRUTH ABOUT WHAT IS OPTIONAL.** Daniel, 2026-09-24: *"the optional levels should be on a
side path that are not required to complete (the burning village isn't), and the other levels that seem optional like
the one before the queen's castle level should not be optional."* A node carries `spur: true` to hang off the road on
a dashed branch; without it the road runs through it. **Right now the map is wrong in both directions:**

| level | truth | how it is drawn | |
|---|---|---|---|
| THE BURNING VILLAGE | optional (Pyromancer class level) | spur | correct |
| UNDERLEAF, THE UNDERCROWN | optional (secrets) | spur | correct |
| **STORMWRECK HARBOR** | **OUT OF THE GAME** - the only level in `LEVELS` with no map node. It builds, it has content, it has suite checks, and it is unreachable | not drawn at all | **LEAVE IT ALONE - shelved on purpose, "we don't need it right now"** |
| **THE ORE ROAD** | **REQUIRED** - Highcrown is gated behind it | on the road, but the road dives into the bottom-left corner (`[82,150] -> [54,162] -> [22,140] -> [18,118]`) and climbs back up the left edge, with the Undercrown spur at (18,88) beside it, so the whole margin reads as a side-branch cluster | **WRONG - it must READ as the main road** |
| THE FALLING TOWER | leaf, but it is the FINALE | on the road | correct |

**THE RULE FOR EVERY CLASS LEVEL, INCLUDING THE THREE NOT YET BUILT.** THE UNBURIED FIELD (Death Knight), THE POWDER
DECK (Freebooter) and THE CHURCH (Paladin) are all optional unlocks like the Burning Village, so each one gets
`spur: true` the day it is placed. See `docs/briefs/hero-kits.md` §7 - their briefs are in `.claude/briefs/`.

### C. ART — two bosses that do not look like themselves
`src/redraw/*` · `src/chars.js` · the `SPR.` assignments in `main.js` ~597.

**The Buried Dead has no model of his own**: `SPR.burieddead = bakeDead(true)`, the same baker as the zombie, the husk
and the apprentice. Daniel asked for a unique one. **The Owl Reeve** wants a proper redraw rather than a scale —
eight frames of 64-wide pixel art. Also queued: posed hurt frames for sprig, shield, soldier, brute.
`tools/node-canvas.mjs` renders bakers to PNG in Node with no browser — use it, and send Daniel images.

### D. THE PLAYER-SPEED BUG — a real correctness bug with a named suspect
`main.js` `updatePlayer`, `P.driftAcc`, `updateSlide`.

From `NEXT-PROMPT.md`: measured in the Stockade, on a PLANK he covers 0.92px a step, correct for 92px/s at 60% world
speed. On two stretches of plain SOLID he covered **1.25 and 5.75px a step with the same `vx` of 92**. Something other
than `vx` is moving him. The Stockade has slides in it. **Low confidence on effort — could be twenty minutes or could
be a day.**

### E. THE DESERT ARC — built and entirely unwired
`src/desert-*.js` · `src/dune-worm.js` · `src/dune-yard.js` · `src/sun-priest.js` · `src/sunstroke.js` ·
`src/draft/*` · `tools/desert-*.mjs` + 12 more · `docs/briefs/*.md`.

Seven level briefs, seven source modules, eighteen tools — and **zero desert levels in `LEVELS`, zero imports from
`level.js`/`main.js`, zero of its tools in the suite**. It has never been checked and has been drifting against a
`main.js` that changed a lot. **Daniel's instruction: verify it, then build level 1 only.** Run all 18 tools, report
what survived, fix outright breakage. THE SUNKEN CARAVAN is a greybox (`src/draft/sunken-caravan.js`), so level 1 is a
build, not a wiring job — its brief is `docs/briefs/sunken-caravan-amendments.md` and the numbers it must keep are in
there. A new level must be added to `TIER`, `MEDALS` and a `NODES` list or it will not appear on the map.

### F. LEVEL QUALITY — against numbers that finally mean something
`src/level.js` · `src/burial-expansion.js` · `tools/curve.mjs`.

**Re-measure everything first**; every figure taken before `77a559a` was read off the broken threat table. Known:
Gale Moor is 85% flat screens; Hanging Town is 4 screens with a floor; the Falling Tower is 96 against the Folly's
122 before it; `oreroad` is 35 easier than `witchlight`. `NEXT-PROMPT.md` §1 has the full sawtooth. **Flattening the
ramp means editing shipped levels — bring Daniel numbers and a proposal before you rebalance his campaign.**

## PARKED — DO NOT DECIDE THESE ALONE

1. **The four bosses written `0`** in `src/threat.js` (closedhelm, bellcrab, drownedking, prince) while eight others
   are `6`. The table says a boss is a 6. Which convention is right is Daniel's.
2. **Burn and the two non-ward multipliers** — `wardedDamage` folds in the five wards, deliberately not the
   Archmage's stage gate (which can refuse a blow) or the Undead Archmage's `gather` bonus.
3. **The Queen's walkway.** Daniel asked for it removed; it is her ONLY damage window (`gqOpen` is `mode==='pinned'`,
   and only her own gallery pins her). Ask again before deleting.
4. **The Death Knight's hitbox** reaches 24px past the blade the art draws — fixable by shortening the box or
   lengthening the art, which is a call about his reach.
5. **Sixteen proposed talents and four class levels** (`docs/briefs/hero-kits.md`). Four of six heroes have NO
   talents; the Death Knight's own card says *"TAP F for the equipped skill"* and nothing can be equipped.
6. **Tower flyers drift into the Archmage's sanctum** and can appear to float through its painted walls.

## EXPENSIVE LESSONS — PLEASE DO NOT RE-LEARN THESE

- **Fix the RULE, not the row.** One reported bad row means an unenforced rule. The grass report was 1 cell; asserting
  the rule found 12 more, then 334.
- **A metric that skips unknown inputs LIES.** It does not fail, it returns a confident smaller number. Before tuning
  anything to hit a number, check what fraction of the input the number actually scored.
- **Verify a fix against the OLD code.** Stash it, watch the check fail, restore it. Several checks written tonight
  would otherwise have been passing vacuously.
- **A convention nothing checks is a wish.**
- **Node renders lie about light.** `tools/node-canvas.mjs` has no `globalCompositeOperation: 'lighter'`, so glows
  render flat. It is honest about construction and not about light. **And it will not tell you a thing reads wrong:
  my "arcane fire" looked fine in Node and read as A GREEN LAWN in the game.** Play it.
- **Patch method:** python scripts with asserted exact-match replacements, written with the Write tool. Bash heredocs
  truncate on long content. `//` inside a patch string swallows the line — use `/* */`; `tools/comments.mjs` catches it.
- **`BK.step` renders, `BK.sim` does not.** Capture only after 60+ step frames, and keep the browser pane FRONTED —
  `BK.step` stalls without rAF when it is hidden.
- The buffer is **320x180**. Measure text with `textW`/`fitText`, never `len * 6`.

## INTEGRATION

Each agent: own worktree, own branch off `origin/codex/playtest-0919`, merge `claude/archroom` in first. Rebase on
`origin/codex/playtest-0919` before finishing. **`tools/check.mjs` line 62 is one enormous array literal and every
agent adding a check will conflict there — keep all names, it is the only conflict that matters.** Full suite green
before merging. Nothing deploys.
