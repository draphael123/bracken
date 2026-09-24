# SLOPES PHASE 2 — what the desert lane learned, handed over

Written 2026-09-23 by the desert lane (E) as it closed, for the lane doing `docs/slopes-integration.md`. **Facts and
measurements only — no design, and nothing here overrides the integration doc.** Everything below was run, not read.

Lane E verified all 19 desert tools, found that the slopes engine is not wired into `src/main.js`, and stopped rather
than build a level the hero falls through. That finding is why this lane exists.

## 1. Which desert drafts use slope tiles, and which ids

Counted by building each draft and reading its grid:

| draft | size | across/up | slope tiles | ids used |
|---|---|---|---|---|
| `src/draft/sunken-caravan.js` | 547x40 | across | **131** | all six |
| `src/draft/glass-sea.js` | 520x40 | across | **102** | all six |
| `src/draft/buried-city.js` | 515x44 | across | **48** | all six |
| `src/draft/well-town.js` | 519x42 | across | **4** | the gentle pair only (R2A/R2B/L2A/L2B) |
| `red-gorge`, `sealed-pyramid`, `kings-pyramid` | vertical | up | 0 | — |
| `sun-temple` | 500x30 | across | 0 | — |

**Four of the eight desert drafts have slopes in them; three of those four use all six ids.** The Well Town's four
tiles are one gentle rise and are effectively decoration — it is not a slopes level. The three vertical drafts and the
Sun Temple contain none at all, so they are unblocked by this work.

If you want one level to test against, it is THE SUNKEN CARAVAN: the most slope tiles, every id, and the only one with
a passing level check of its own.

## 2. How `src/draft/sunken-caravan.js` builds its 505 columns

The ground is a **string of pieces**, not hand-placed tiles. `src/draft/_kit.js` holds the shared vocabulary and the
caravan repeats it locally (`CARAVAN_PIECES`, its own `P()`):

- `F` flat · `R1`/`L1` steep up/down one row · `R2`/`L2` gentle up/down one row · `QS` a quicksand column
- `#name` starts a section · `@name` marks a landmark's first column

Each piece is consumed into a column list carrying a running height `lvl`. **A steep step is one tile; a gentle step
is two** — `R2` pushes `SLOPE.R2A` then `SLOPE.R2B`, and `L2` pushes `L2B` then `L2A`. The order matters and is easy
to get backwards. Rock is then filled from the surface row downward (`rockFrom`), so **every slope stands on solid
rock**, which is the invariant `slopeLint` asserts.

Consequences for §3 and §5 of the integration doc:

- Ground height at a column is `base - lvl`, so a slope tile is always the **top** tile of its column with rock under
  it — never floating, never roofed.
- `top(x)` is the draft's own ground-row function and `on(x) = top(x) - 1` is the cell a thing stands in. Props are
  placed by these, so no prop is authored onto a slope tile *except* where the level explicitly puts one.
- **No bottomless pit anywhere on the road** — measured: 0 columns of full-height air across all 505.

## 3. `JUMP_ACROSS` 6 vs the ~7-tile slide jump

The integration doc §2 defers this to the Sunken Caravan. **The greybox has already answered it by construction.**

- `JUMP_ACROSS` is `6` (`src/reachcore.js:11`).
- `tools/caravan-level.mjs` and `tools/draft-level.mjs` both run the reach fill at that 6 with **no slide credit**, and
  the caravan passes B1 (the start reaches the arena) and F7 (all three silvers, three strays and the relic reached).
- Measured crossings on the road: **no bottomless pits at all**; the widest single hazard is **8 columns of quicksand**
  at cols 194–202, under THE GREAT RIBCAGE — and that one is crossed on the spine's two swing movers, not jumped.
  Quicksand is survivable by design (it holds you chest-deep, it does not drown you), so a missed jump anywhere on this
  level costs time, not a life.

**So: nothing in THE SUNKEN CARAVAN needs the slide to be traversable.** `src/slopes.js` says the same thing in its own
tuning comment — the leap out of a steep slide is *"not a new traversal verb"*. Keeping `JUMP_ACROSS` at 6 and NOT
teaching reachcore a slide jump therefore costs this level nothing, and it keeps the reach model pessimistic, which is
the side it has always erred on. Recorded as a finding; the call is still the slopes lane's and Daniel's.

## 4. The desert tools, and which of them already know slopes

All 19 desert tools run green today (Node only, well under a second each, none in `tools/check.mjs`). Of those:

| tool | slope contact |
|---|---|
| `tools/caravan-level.mjs`, `tools/draft-level.mjs` | **already slope-aware.** Both import `slopeReachGrid` + `slopeLint` from `src/reach-slopes.js` and call `floodReach(slopeReachGrid(L, T), T, …)` themselves, and both run `slopeLint` as an assertion. |
| `tools/caravan-map.mjs`, `tools/draft-map.mjs` | already paint slope ids as sand |
| `tools/light.mjs` | imports `isSlope` for its opacity test |
| `tools/caravan.mjs`, `desert-rules.mjs`, `desert-bosses.mjs`, `skeleton-king.mjs`, `sun-priest.mjs` | none — pure state machines on their own small grids |
| the nine art tools | none — they render bakers |

**The one thing to check when you do §5.** The integration doc puts `L = slopeReachGrid(L, T);` as the first line of
`floodReach` in `src/reachcore.js`. The two level tools above already wrap their level in `slopeReachGrid` *before*
calling `floodReach`, so after §5 lands those levels get wrapped **twice**. The doc says the function returns the same
object when there are no slopes; whether it is idempotent when there ARE slopes is the thing to confirm, not assume. If
it is, delete the now-redundant wrap in both tools; if it is not, these two tools are where it will show up first.

## 5. Four things the desert lane left open — do not lose them

None of these is slopes work. They are recorded here because lane E is closing.

1. **Sandfalls.** The brief lists them as a hazard, `src/desert-rules.js` implements them and proves them, and the
   greybox places **none**. Deliberately deferred by Daniel.
2. **The ELITES row and an ambush room.** The brief asks for an elites row; `RULES-LEVELS-AND-BOSSES.md` section Q
   wants one short locked fight a level led by an elite. The greybox has **zero** elites and no ambush. Deliberately
   deferred by Daniel.
3. **The haze tease.** `docs/briefs/sunken-caravan-amendments.md` replaced the storm act with "a haze on the horizon as
   a tease". Nothing in the greybox does this yet. Deliberately deferred by Daniel.
4. **The Dune Worm's phase-2 `stormOn` — STILL AN OPEN QUESTION, not a deferral.** The amendments removed the storm
   ACT from the level and say nothing either way about the boss's own gusts, while `src/dune-worm.js` still fires
   `stormOn` when it reaches phase 2. Nobody has ruled on it and it has deliberately not been guessed at. Ask before
   changing it in either direction.

Level 1 also needs a map node, which was deliberately NOT placed: the map lane is mid-redesign and is putting the
desert on a sheet of its own.
