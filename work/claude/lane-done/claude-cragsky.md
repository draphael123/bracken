# Lane report: claude/cragsky — wire the crag redress (Scree / Hanging / Stormhold)

## What I found

The brief (lanes.md #2) says `src/redraw/crag_redress.js` was "painted but never hooked up." That was true when
the file was written, but it is no longer true on master: `main.js`'s `REDRESS` map (line 721, commit `36c79344`,
2026-09-22 — *before* the 2026-09-28 visual audit ran) already sends `scree`, `hanging` and `storm` to this module
and bakes ground + sky + far + mid + near + props from it (lines 725-794, 904). I confirmed this two ways, not just
by reading the code:

- **Pixel sample**: loaded each level in the running page, sampled the rendered sky strip against
  `CRR.bakeCragSky(theme, 180)` computed in the same page. Scree and Stormhold's on-screen sky matches the crag
  module's output (e.g. Scree top strip `[50,34,66]` vs. reference `[58,44,90]` — the small gap is the level's own
  haze overlay, expected). Hanging's does not match (see below).
- **Screens**: `node tools/redress-shots.mjs scree hanging storm moor` (the audit's own capture tool) into
  `work/cragsky/before/` and `work/cragsky/after/` (one page session each, per the brief).

So there was nothing left to *wire* for Scree Path or Stormhold — both already show this module's own rock,
sky, backdrops and prop kit, matching every item on `bar.md`'s checklist (own set, real far/mid/near depth, a
prop kit distinct from the theme string, a sky that isn't generic `crag`, and — for Stormhold — the lit-window
warm accent the rework already added on top).

**The Hanging Village is a special case**: its `groundZones` (its own floor-by-floor look, `src/hanging-village.js`)
wins over this module's ground by design (main.js line 906, an intentional override, not a bug), and its own
`drawHangingBack` paints a full cliff face over the backdrop, so this module's `hanging` sky/far/mid never actually
shows through. That's not a wiring gap either — `git log origin/master -- src/hanging-village.js` shows that
level's own rework (commit `cbd84fe`, "each floor its own place, and the cliff drawn behind them") is *already
merged into master* (via batch38), even though `lanes.md` still describes it as "rework in flight" scoring 4.4.
The audit's branch was cut before that rework landed. Same story for Stormhold: `stormhold-town.js` (merged via
batch35) already gives it real buildings, limestone masonry and lit windows on top of this module's sky/ground.

## What I changed

Only the stale header comment in `src/redraw/crag_redress.js` — it said "Not wired in," which is what sent this
lane's audit entry (and by the same logic, lane #1's) down the wrong path. Rewrote it to say where it's wired,
why Hanging's redress rarely shows on screen (and why it's still worth keeping wired: any floor with no
`groundZones` entry of its own still lands on crag rock, not the old grey slab), and what confirms it.
**No behavior change — comment only.** Diff: `src/redraw/crag_redress.js`.

## Gale Moor check

Brief said not to touch Gale Moor, and to make sure the Scree Path change doesn't change it by accident. My only
change is a comment in a shared file with zero logic difference, so nothing Gale Moor reads could move — but I
captured it anyway (`work/cragsky/before/08-moor-0.jpg`, `work/cragsky/after/08-moor-0.jpg`) and both show the
same borrowed Scree-Path dusk sky, same hills, same composition. Confirmed unaffected, as expected.

## Checks (all green)

`PORT=5872 npm run check -- architecture,checkpoints,skins,dangling-paths,boss-fight-end,slopes-trace,npc-removal,camera-fill,footing-art,ground-depth,render-layers,occluders,readability`

- ok dangling-paths, render-layers, checkpoints, skins, readability, boss-fight-end, occluders, ground-depth,
  architecture, footing-art, camera-fill, npc-removal, **slopes-trace** (unchanged, as required)

`PORT=5873 node tools/headless.mjs floats` → 32 levels, 2733 sprites, nothing in the air/ground/water.

## Captures

`work/cragsky/before/` and `work/cragsky/after/` — 05-scree-0.jpg, 06-hanging-0.jpg, 09-storm-0.jpg, 08-moor-0.jpg
(redress-shots.mjs's own checkpoint-anchored capture). Before/after are visually identical (comment-only change);
small byte differences are the level's own animation (coin bob, hero position) at capture time, not a redress
difference.

## Scores against bar.md (unchanged from current master — nothing here moved them, they were already this way)

- Scree Path: own rock set, own sky/far/mid/near, own prop kit, warm dusk accent — passes the checklist.
  (levels.md's 5.6 predates the redress wiring landing but the wiring is what earns that score.)
- Stormhold: own sky (via this module) + own masonry/buildings/lit-windows (its own later rework) — passes.
- Hanging Village: passes via its own dedicated floor system, not this module — the two are complementary,
  not conflicting.

## UNVERIFIED

- I did not re-derive `levels.md`'s numeric scores; I checked the checklist items qualitatively against the
  current screens, which is what the audit itself did.

## Something I found but did NOT fix (out of "zero new art" scope)

`levels.md`'s Scree Path row also flags "the Crag Climb face is still one flat striped wall (S3 fails on the
last 48 tiles)." That's `TILE.climb` (`ART.bakeClimbFace`, a generic tile used by several levels), which
`crag_redress.js` has no equivalent for (`bakeCragGround` exports `top/edge/fill/silt/wet/ledge`, no climb face).
Giving it a rock-strata look would mean drawing new art, not wiring existing art, so it's outside this lane's
"zero new art" brief. Flagging for whoever picks up new-art work on Scree.

## QUESTIONS FOR DANIEL (recommendation first)

1. **Lane #1 (Highcrown + Undercrown wiring) may already be done too** — same `REDRESS` map, same commit
   (`36c79344`), same "not wired in" comment problem in the sibling file `redress2.js`. *Recommend: whoever owns
   lane #1 check `redress2.js`'s header and `main.js`'s `crown`/`undercrown` entries the same way I checked this
   file, before spending time re-wiring something that's already wired.* I did not touch `redress2.js` — out of
   this lane's scope.
2. **`lanes.md` and `levels.md`'s Hanging/Stormhold rows are stale** (both say "rework in flight," but both
   reworks are already on master via batch35/batch38). *Recommend: whoever next updates the visual audit
   re-captures those two rows against current master before ranking further lanes off them — the "already-painted,
   unwired art" framing doesn't hold for either lane 1 or lane 2 anymore.* Conservative default: I left the audit
   docs themselves untouched (not this lane's file to edit) and only fixed the one comment inside my own lane's
   code file.
