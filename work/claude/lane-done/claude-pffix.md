# claude/pfart - PFFIX (11-06, code-only, post-demo): Freebooter coat wedge + near-hull backdrop

Not merged, not deployed, no browser opened. Branch claude/pfart (on top of 1b60a0129).

## What changed
1. THE FREEBOOTER (src/redraw/freebooter_art.js, `body()`): the coat flare was the same rigid skirt widened and shifted back, which drew a hard triangle in lunge (riposte), plunge, boot, boardAir etc. Now the skirt is the same in every pose (a notched hem vent), and the flare is a separate CLOTH TAIL streaming back off the waist: tapered, scalloped lower edge with a slight wave, lit upper fold, folds every 4th column, dark hem pixel, ragged tip. Length scales with `coatFlare` (1..4). New optional pose key `coatUp` (plungeAir = 7): the tail lifts as he dives so it reads as cloth trailing up behind a falling man. Every pose that sets coatFlare shares this code (pistolTell/Fire, cutsTell, cuts, boot, bootTell, riposte, boardTell/Air, plungeTell/Air); all re-rendered.
2. BACKDROP NEAR layer (src/redraw/pirate_fleet_back.js): hulls lowered and shortened (top rows 150/120 -> 205/190, hull side ~95/110 px instead of 150/180; masts, yards, stays, gunports, wale, nets scaled to match), painted in a new hazed palette (`BP.nsil/nsail/nrim/nlamp`: blue-grey toward the sea and storm light instead of near-black), layer alpha 0.82 -> 0.60, lamp glow 0.25 -> 0.16. Far/mid/sky/theme untouched (dusk storm front kept).

## Sheets (PNG, node software raster, no browser)
scratch\lane-reports\pffix-art\before\ and \after\ : freebooter.png, backdrop.png, backdrop2.png, pieces.png, tiles.png (pieces/tiles unchanged).
Regenerate: `node tools/pf-art-sheet.mjs <outdir>`.

## Checks run (node only)
pf-art-lint 5135 ok | pirate-fleet 136 ok | comments ok | goblin-lint ok | node --check on both files ok. tools/check.mjs NOT run.

## READY / NOT READY
READY for the post-demo (SAT 11-07) merge as art, pending browser proof.

## Browser proof still owed
- Coat tail at game scale in motion across the 26 poses (esp. riposte lunge, plungeAir, boardAir); the tail is 2-12 px behind him, check it does not clip the arena wall.
- Near hulls in the real tint stack (0.06-0.25 darkening + haze) and at 0.60 alpha against the sea: still reading as a near layer without crowding; the 0.55 parallax vs. camera dY at deep views (hull top now sits lower in the frame, so check no sea-coloured gap under it).
- pixels / painted-anchors audits for the touched modules.

## Questions (recommended answer first)
1. Near hulls: keep this lighter/lower look? REC keep; if still heavy in the page, drop alpha to 0.5 (one constant). Alt: remove the near layer entirely (mid ships carry the scene).
2. Static non-flare coat is still a plain skirt with a vent. REC leave; a swaying hem on idle/walk can be a later polish.
