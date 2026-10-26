# claude/hurricane3art - THE HURRICANE DECK 3 + THE CAPTAIN 3, ART PASS (Sonnet, 2026-10-26, PORT 6606)
Branch claude/hurricane3art off claude/hurricane3 0d8ccae0. NOT merged, NOT deployed. Art only: src/level.js untouched (level hash unchanged, nothing restamped); no number, hitbox or timing changed (one visual-only timer r.burnT on a rod).

## What changed
- src/redraw/hurricane3_art.js (new): replaces the greybox of src/hurricane3.js using the Hurricane 2 / Flotilla 3 ship kit (src/hurricane2-art.js now exports its palette and A.kit primitives, and has an h3tile hook).
  - Masts: hooped round poles (main, fore, mizzen with and without its topmast), tops/crosstrees where his three yards cross the main, truck pennant, St Elmo's fire.
  - Yards: every walkable spar is a tarred spar tile with seizings and iron-capped ends, footrope on stirrups, parrels at the mast, a sail clewed up under the main yard, the mizzen top as a grating.
  - Stays and lifts: laid rope with seizings, blocks and deadeyes. Sails: canvas on gaffs with seams, reef points, patch, flog and SNAP in a gust's tell. Gust rain: long slanting streaks plus wind streaks.
  - Houses: fore house, galley and main deckhouse as tongue-and-groove walls, roofs, sills, brass ports. Her boat in davits (clinker, cover, oars, chocks) and two boats keel-up on chocks past the breach.
  - Rods: iron spike on a bronze collar, copper-clamped conductor chain, charge crawling down it, St Elmo's glow, jagged bolt, bolted shoe plate at the chain end. Tarred net: knotted mesh, burning with embers and smoke for 3 s after rod 1.
  - Casks: staves, hoops, bung, lashing to ring-bolts that parts, rolling smear, chocks when stopped.
  - Sea: dark storm sea with two swells, whitecaps, spindrift, undertow streaks and a wet tide-mark; the waist flood uses it with floating debris and sloshing foam. Gauge: her hull with three masts and rigging, the sea climbing.
  - Captain's rod column: jagged blue light on every yard; BRACE! sweep: a breaking green crest with foam.
- The Captain's new poses (src/redraw/pirates.js frames 19-25, wired in src/main.js): climb a/b (hand over hand), dive windup, surge (sea streaming off him), sway lunge, sway windup, BRACE! shout. Struck by the rod (14) and flat (18) were already drawn.

## Checks (PORT 6606, one browser at a time, RAM >= 1500 MB before each)
GREEN: level-quality (every gated level clears), solid-islands, visible-supports (report-only, same as base), floaters, hurricane3, storm-ship, signs, textfit bestiary --strict (0 issues, 331 screens), mobile-perf hurricane (61 fps, p95 16.9 ms, 5.2 ms busy/frame at 4x), storm-ship-runtime, boss-read.
RED, NOT MINE: `headless.mjs floats` (pixels) reports only "flotilla: sign@35,24 runs through the ground (5px)" - the known pre-existing flotilla level-data sign; nothing on the hurricane.
Not run: boss-rates / level-walk (no number touched); played Captain fight in motion (poses checked on a sheet and stills only).

## Stills
Before: scratch/lane-reports/hurricane3art-before-*.png (the greybox). After: scratch/lane-reports/hurricane3art-after-*.png (18 scenes), hurricane3art-captain-poses.png. Also in work/claude/shots/hurricane3art/{before,after}. Tools: tools/hurricane3art-shots.mjs (WAIT=frames), tools/hurricane3art-sheet.mjs.

## Not done / remaining
- Sound (hull groan, rod crackle, sail snap, BRACE! shout): not art, left for an audio lane.
- The waist's ship bell: not placed (no supported spot found without a floater risk); the foam line and sloshing crests carry the warning.
- Hull planking below the waterline keeps the existing teal tile look; sea only adds a wet tide-mark.
- Sway lunge pose blade overlaps the hand a little; worth a look in motion.

## QUESTIONS FOR DANIEL (rec first; built)
1. Bell at the waist (rec: add a bell on the galley's wall in the level lane; built: no).
2. Sound pass for the storm moves (rec: yes, one short audio lane; built: no).
