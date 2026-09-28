# The bar: what the Ore Road and the new Stormhold actually do better (2026-09-28)

Daniel's read is right by the numbers, but it needs a caveat: **the Ore Road is not clean.** The 2026-09-26 look-and-feel
review already measured it as *the most washed-out level in scope* (median chroma 4.9, art-direction rule 4 asks for 7+)
and flagged cold blue-white lamps and ghost-pale foes (`docs/look-and-feel/wood-to-highcrown.md#2-the-ore-road`). What
Daniel is seeing that beats the older crag levels isn't its colour — it's everything **other than** colour: it has a set
of its own, real depth layering, and props that say "mine" instead of the crag set's generic slab. Stormhold's rework
(`claude/stormhold`, not yet merged — see `levels.md`) does the same thing with an actual palette on top.

Captures for this checklist: `work/visual-audit/oreroad-2x.png`, `work/visual-audit/storm-2x.png` (master's current,
pre-rework Stormhold — grey-on-grey, matches the old ranking), plus the reworked-Stormhold numbers from the lookfeel
review's table.

## The checklist — pass every new/redressed level against this before it ships

1. **A set of its own, not the crag slab.** The Ore Road's floor is sawn staging boards over joists (`src/level.js`
   `ledges: 'staging'`, `murkCol`/`murkLit` its own colours) — not the layered-rock-then-slab everything else in the
   crag arc still shares (`docs/visual-audit.md` finding #1: "the crag set's grey gravel slab" under five to seven
   levels). **Check:** does this level's `palette.set` differ from its neighbours', or is it `far/mid/near: 'crag'`
   with nothing else changed?
2. **Backdrop layers that read as depth, not a flat wall.** The Ore Road's mid-ground carries winch towers, cable
   lines and lamp posts at a different depth than the near dressing; Stormhold's rework (per the lookfeel review) adds
   actual walkways and towers instead of one grey face. **Check:** `far`/`mid`/`near` distinct, and at least one prop
   layer between the backdrop and the ground (visual-audit.md finding #2: "an empty middle distance").
3. **Props that say the place, not the theme.** Ore carts, winch drums, sleepers, lamp posts, ladders up to the
   drum houses — versus HANDOFF backlog 21b's flagged reuse: cairns in a mine, the Unburied catapult+carts and the
   lanternPost recycled everywhere, one crag prop set doing service under seven levels and one tree wall under three.
   **Check:** does this level's `dressing.js` kit list contain at least 2-3 props found nowhere else in the game?
4. **Warm pools of light against a cool base**, not flat edge-lighting. This is the item the Ore Road *fails* right
   now (cold blue-white lamps, art-direction rule 5: "every cool level gets a warm accent") — Stormhold's rework
   is said to add lit windows and a warm-lit gate. **Check:** `L*` and chroma per art-direction.md's own rule; a level
   under chroma 7 or warmth < 0 with no counter-accent fails.
5. **A palette distinct from its neighbours' sky.** One sky doing service for five levels is visual-audit.md's
   finding #3. Ore Road and (pre-rework) Stormhold both still sit on `far/mid/near: 'crag'` — this is the one item
   the bar levels have NOT actually fixed yet; see `levels.md`'s Ore Road / Stormhold rows.
6. **Foes contrast against the backdrop they're fought in**, capped or tinted so they don't wash out under the
   level's own edge-light (art-direction rule 8, `src/contrast-rim.js`; the Ore Road's own foes are the review's
   worst offenders — "heavies, miners and the King's Champion draw nearly white under the edge-lit lamps").

## The honest read for Daniel

The gap Daniel is seeing is real, but it's a gap in **structure and props**, not primarily in colour — the Ore Road's
own colour is still failing the art-direction rules by the numbers. The actual best-looking levels in the game by every
measure that's been taken (art-direction.md's 14 "best", the lookfeel table's spread/chroma/warmth) are **Bracken
Wood, Kingswood, the Flotilla and the Long Water** — own set, real mid-ground, warm accents, chroma 18-24. Those, not
the Ore Road, are the actual bar. See `levels.md` for the full ranking and `lanes.md` item 1 for the fix.
