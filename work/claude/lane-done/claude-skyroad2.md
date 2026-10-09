# claude/skyroad2 - THE SKY ROAD: Daniel's stuck spot (10-08 photo) + wind visibility (HOTFIX, off master e3fd0268)

## THE SPOT
Daniel's photo (run 3:59): the knight on a grey stone pinnacle, a second pinnacle 4 columns to its left with a dark plate on top, cloud sea
just under the tops, the great ribbed spire behind. That is **THE BROKEN SKY BRIDGE's disc road**: the pinnacles at 303 / 310 / 317 / 324
(src/sky-road.js `pinnacle()`, row 53 tops, cloud sea at row 55). The "dark ledge" is the thermal's cold foot plate. A screenshot at
310,52 matches the photo (work/claude/skyroad2/p310.png, not committed).

## THE CAUSE (a soft-lock, not a reach problem)
The cloud sea (src/sky-road-hands.js) throws you back to **the last solid footing you stood on**. A pinnacle top counts as solid footing. So:
drop off the bridgehead without lighting the sun-disc (or let its 16 s run out), land on a disc pinnacle -> its air is dead -> the only way
off is down into the cloud -> the updraft puts you back **on the same dead pinnacle**. Forever. Jumping between pinnacles (4-column gaps)
just moves you between dead ones. No hero, no kit item, no direction gets out: this was every hero, both ways.

Same cause elsewhere on the level (found by the new tool, not by eye): every gated footing whose only way out is one thermal -
- pinnacle 131 (THERMAL FOUR, stone s1) - you can glide down onto it before striking s1
- the disc road 303 / 310 / 317 / 324 (the photo)
- R5 357 (s4) and R6 371 (s6) on the exam spans
- R2 226 (s3) **and the low roost 220-222 (silver two) and the shelf end 223-224 under it**: before s3 is struck, a glide off roost one
  that passes roost two lands there, walled in by roost two's rock.
Plus a geometry bug: the winch block `rock(88,91,32)` ran down through THE WIND CAVE and sealed its east half (two coins + the bones in a
pocket nobody could reach). Opened (`air(88,91,39,42)`).

## THE FIX
- src/sky-road.js: `L.airOnly` - the footings whose only way out is one thermal (each gated pinnacle, the low roost, the shelf end), with
  that thermal's column. Built by `pinnacle()` for every gated pinnacle + two hand rows.
- src/sky-road-hands.js: the hero's safe footing remembers whether it is an airOnly footing (`S.safe.vent`) and keeps a second
  `S.safeLand` (last footing NOT airOnly). The catch uses `S.safe` unless its air is dead (`H.airLive`: source off, or the disc with < 3 s
  left) - then `S.safeLand`. A LIT pinnacle still takes you back to itself (unchanged where it was right). Cost of the drop unchanged (14).
- src/stuck-spots.js: 10 `sk-deadair-*` spots (glint 'stall', 10 s nudge "THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP", done
  when that thermal's source is on), glinting the cloud beside the footing.

## THE NEW CHECK: tools/skyroad-stuck.mjs (in tools/check.mjs after skyroad-probe)
- STATIC: with every gated thermal dead, floods from every footing the level reaches (reachcore); a footing that reaches no checkpoint,
  stone, disc, cloak or gate is a DEAD-AIR TRAP. Every trap must be in L.airOnly, every L.airOnly row must be a trap, and each must be
  freed by its own thermal. 10 traps, exactly the list.
- RUNTIME (real key events through window keydown/keyup, fresh save, god mode on so repeated drops cannot end the run, foes and clouds cleared): per hero - THE PHOTO (walk and glide off the
  bridgehead with the disc unlit, steered onto a disc pinnacle, then off it into the sea east and west -> must land back on the
  bridgehead), every trap from its approach footing off both sides (a rock-walled side is skipped), and a LIT pinnacle still returns you to it.
- **Fails on master** (src reverted, same tool): 134 FAILs - 2 static + **22 per hero for knight, warden, pyro, paladin, pirate, reaper**
  (every hero thrown back onto the dead pinnacle / low roost every time). **After: all green, all six heroes.**

| hero | master (photo + traps) | after |
|---|---|---|
| knight | 22 fail (stuck on the pinnacle every drop) | all green |
| warden | 22 fail | all green |
| pyro | 22 fail | all green |
| paladin | 22 fail | all green |
| pirate | 22 fail | all green |
| reaper | 22 fail | all green |
Base movement only (no skills); cloak on (the Sky Road gives it past the mast) - the glide does not change the trap, both walk and glide tested.
`?level=skyroad&campaign=1` is batch79's, not on master (this lane's base), so the campaign-kit variant was not run.

## WIND VISIBILITY (A3)
src/redraw/skyroad_world.js `drawThermal` - the old column was additive gold that vanished on the pink/violet sky. Now drawn source-over:
- a pale band for the column; a dark rim + 2-px cream walls whose dashes run UP at the lift's pace;
- cream chevrons climbing the middle, with a dark drop shadow (closer and brighter when the air is strong);
- THE CREST at the column's top (two curls spilling over) = how high it carries you;
- two feathers turning as they climb (plus the old motes and kite scrap);
- DEAD (stone not struck / disc off) **and now CLOUD-SHADED**: a full-height dotted cold ghost + a dotted crest, so you see where the air
  will be (a shaded column used to draw nothing at all).
src/roc-eyrie.js - THE ROC's GALE (the only sideways gust on the Sky Road) was undrawn: now three big flashing chevrons on the nest floor
during her gustTell (the tell, pointing the way it will blow) and streaks racing across the arena + grit while it blows.
Thermal-entry stall nudges (glint 'stall', 10 s): the shelf's return thermal, R1 off roost one, R3 off the kite platform, R4 off roost
four, R5 / R6 as the second step of sk-stone-4 / sk-stone-6 once their stones are struck (existing spots already covered thermal one,
two, four, the reel and the disc).
Pictures (not committed): work/claude/skyroad2/v1..v7*.png.

## CHECKS RUN (all on PORT 8743)
skyroad (green), skyroad-probe (green), skyroad-aloft (nothing floats), **skyroad-stuck (green, 6 heroes)**, stuck static + runtime
(87 spots OK), readability (OK), render-layers (OK), frame-cost (OK), level-quality skyroad + gated (all clear the bar).
Re-stamped: mash-bot skyroad LEVEL then BOSS (level: lowest hp 20/28/22% knight/warden/pyro, no deaths -> passes; boss 0/6), level1-pilot
skyroad (hits 21, deaths 0 - was 24/0; the hash changed only for the cave's opened air).
Frame cost: all thermal drawing on the lit disc road (4-5 columns on screen) measured ~0.4-0.5 ms/frame in headless software canvas
(noisy; old drawing measured within the same noise). No read-backs, no new canvases.
Not run: skyroad-pilot (the Roc's boss rates) - the Roc's logic and the bot are untouched; only her gale is drawn.

## HARNESS FIX (tools/stuck.mjs)
The runtime clears the hint box (`BK.uiHud.hint('',0)`) before each spot. Before, two spots with the same nudge line in a row read the
previous spot's line at frame 0 and failed on "way arrow not handed" - a false red, not a weakened test.

## COMMITS
1f3bf34d the catch fix + L.airOnly + tools/skyroad-stuck.mjs + the cave
3be9340c thermal / gale drawing, stall nudges, suite entry, mash + pilot re-stamps

## QUESTIONS FOR DANIEL
1. A drop off a dead pinnacle still costs the cloud sea's 14 health (it is a fall). Rec: keep it (Salt & Sanctuary cost, and the nudge
   tells you). Built: kept.
2. The Roc's gale side is now drawn DURING her tell (floor chevrons). The human-speed bot's `o.eyes` note says the side was not drawn in the
   tell; the bot is unchanged, so measured rates stand, but a human now reads it ~0.7 s earlier (slightly easier). Rec: keep (A3 wants a
   tell for every sideways gust). Built: drawn.

## NOTE (out of scope, not fixed)
src/reachcore.js glideFrom pushes footing straight below (`!dx`) without checking the column for rock - the model could "glide" down
through the mesa into the sealed cave pocket. Harmless now the cave is open, but the hole can hide sealed pockets on other glide levels.
