# claude/flotilla3art - THE FLOTILLA 3 + THE ADMIRAL, ART PASS (Sonnet, 2026-10-26, PORT 6601)
Branch claude/flotilla3art, off claude/flotilla3 864a292d. NOT merged, NOT deployed. Art only: no gameplay number, hitbox, timing or level geometry changed, and src/level.js is untouched, so the level hash did not move and no row was re-stamped.

## What was drawn
- **The Admiral** (src/redraw/admiral_art.js, rewritten; API and pose keys kept): oxblood coat with gold frogging and cuffs, tricorn laced in gold with a red plume, grey beard and queue, cold eye, baldric with the brace of pistols; THREE REMOVABLE riveted hull plates (chest with its gunport rim, back, pauldrons - rust runs, barnacles, weed); where a plate was: paler unfaded cloth, bolt holes, a torn strap flapping. Every pose key has its own windup/release (flintlock, curved cutlass with a brass guard, boarding axe, keg with a lit fuse, bosun's call + trills, whirled grapnel, hauling on the net, soaked/dripping, knocked flat, the list, the flurry, axe stuck). Blade smears on the releases. Death (knees, hat rolls, cutlass drops, lies on the lashings) and the bestiary card (leaning on the grounded cutlass).
- **His arena pieces**: main yard with a furled sail, gaskets, block and lantern; grapnel line with an iron ring; keg (bands, bung, smoke); pistol ball with a smoke thread; aim line with a lock cross; broadside cells (hatched red, round-shot sign, gold streak when fired); landing mark; each plate falling as the very plate he wore; the list (planking seams, running chevrons, foam); night lanterns (masts + yard ends); the flagship's ensign (comes down when he dies).
- **Foes** (src/redraw/pirate_skins.js + pirates.js): PISTOLEER (marine frames redrawn: red coat, tricorn, black breeches, boots, flintlock; frames 4/5 are now THE RELOAD, wired in main.js's marine frame pick), KEG ROLLER (a keg of his own on the hip, both hands on it when he heaves; scarf), PLATED BOSUN (a riveted breastplate with gunport rim and a barnacled pauldron over the boarder frames), GRAPNEL BOARDER (new drawBoarder: striped jersey, scarf, belt, cutlass, grapnel and coil; wait/whirl/swing/fall/landed/cutTell/cut poses). No tinted recolours remain.
- **World** (src/redraw/flotilla3_world.js, baked once, laid over the greybox blocks): mantlets (4), THE PRIZE sloop hull (red-and-gold wale, gunports, chain plates, deadeyes, catted anchor, green copper) + raised poop (lit stern windows), the hulk's deckhouse (clapboard, bracing, shuttered portholes, boarded door, lashings, roof), the rotten deck patch (drawn only while the cells are there), the SWIVEL and the TOP GUN (real guns, smoke), the yard cocked on its lift (drops level when the bridge lands), signal hoists (staff, yardarm, halyard, three flags; red + halo when he calls), the FLAGSHIP landmark (baked three-master with lit gun ports and stern gallery) now on the port's horizon via a harbour hook (F3H.drawHarbour, called right after the harbour layers), her hoist running red.
- **Harbour life**: petrels redrawn as GULLS (SPR.gull, same frames, last = hurt; worn on the flotilla's petrels in reskinSet), perched gulls on the decks that flush when you come near, the fisherfolk's skiff (lantern, rod) drifting on the water.
- **Sheet tool**: tools/flotilla3art-sheet.mjs (Node, no browser) writes pose sheets: work/claude/shots/flotilla3art/sheets/.

## Pictures
Before (greybox): work/claude/shots/flotilla3art/before/{mantlet,sloop,hulk,swivel}.png; the older greybox set: work/claude/shots/flotilla3/after/*.png.
After: work/claude/shots/flotilla3art/after/{arena,sloop,hulk,swivel,topgun,mantlet,galley,hull,prize,hold,doors,boarder,keg,bosun}.png (taken with tools/flotilla2art-shots.mjs, OUT=work/claude/shots/flotilla3art/after).
Sheets: work/claude/shots/flotilla3art/sheets/{admiral_on,admiral_bare,admiral_zoom,admiral_dead,admiral_fx,world_a,world_b}.png.

## Checks (PORT 6601, one browser at a time)
GREEN: tools/admiral.mjs (all 9 heroes), textfit bestiary --strict (0 issues), mobile-perf (inside the budget at 4x), signs, boss-read, level-quality flotilla (clears the bar), homepaths.
RED, NOT MINE: `headless.mjs floats` reports "flotilla: sign@35,24 runs through the ground (5px)". Identical on claude/flotilla3 864a292d (run there with no edits): a level-data sign position, left for the level lane.
Not run: corpses (stalls whole-game; the reskins keep their last frame = hurt: pistoleer 6, boarder 7, gull 4), boss-rates (no number touched).

## What remains
- Ambient gulls/creak: the flotilla already plays the shared 'ship' bed (creak + gull shots). DISTANT GUNS not added: a boom shot in AMB_SHOTS would also play on the Hurricane and I could not tune its level by ear. A hearing pass is needed.
- The flagship is a baked silhouette at atmospheric alpha, not animated sails; the stern at the lashings is the existing sternWindows/gate dressing (untouched).
- Not looked at in motion beyond stills: the Admiral's fight poses were checked on sheets and in the arena still, not in a played fight (the keep-green admiral.mjs page run passes).

## QUESTIONS FOR DANIEL (rec first; built)
1. Distant guns on the ship bed: rec add a quiet far 'boom' to AMB_SHOTS.ship once you can hear it (built: no; the Hurricane shares the bed).
2. The flagship landmark at the arena fills a lot of sky at full size (1.2x). Rec keep; alt cap at 0.9x (built: 1.2x).
3. head.floats sign@35,24 (pre-existing): rec move the sign one tile in the level lane (built: untouched, level hash).
