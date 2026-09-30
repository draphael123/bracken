# claude/footlip - the ore-road value pass, on THE UNDERCROWN and THE BURIAL CAVERNS

Art only. Hues, layout and foes untouched. Based on master 5d25df0.

## What changed
- src/main.js: new opt-in `palette.farDim` (a black veil laid over the back wall right after the interior rooms are painted, before tiles, props and foes). 0.28 = the far wall x0.72, the same step orevalue took on the Ore Road. Only levels that set the key move.
- THE UNDERCROWN (src/level.js): `farDim: 0.28`, `footLip: ['#f0be7c', 0.62]` (the mine's own warm), `edgeLit` brightened from `true` to `rgba(255,226,176,0.9)`.
- THE BURIAL CAVERNS (src/burial-caverns.js): `farDim: 0.28`, `footLip: ['#d4d0e4', 0.62]` (its own cold grey-violet), `edgeLit` brightened to `rgba(226,222,240,0.9)`.
- drawFootLip (orevalue's) is reused as is; no other level sets either key.
- tools/footlip-shots.mjs: orevalue's measure for any level (12 columns spread across the level, first standable ledge from the top, so before and after are the same frames). Not in the suite.

## Numbers (L*, subject minus backdrop median; rows 40-330; same method as orevalue)
| level | footing before -> after | foes before -> after | backdrop median (mean of spots) |
| undercrown | +13.5 -> +25.0 | +19.9 -> +23.5 | ~19.5 -> ~14.3 |
| burial | +22.2 -> +36.6 | +25.5 -> +29.3 | ~13.2 -> ~9.5 |
(orevalue on the Ore Road was +16.9 -> +29.5.) Captures: work/footlip/{undercrown,burial}-{before,after}/ (11 frames each).
Two spots barely moved: undercrown x58 and burial x520 (footing ~+0.5 both). Burial x520 was already +0.9 before (the lair, a single lit slab in frame). Undercrown x58 fell 33.0 -> 15.0 in the metric: the frames are one second apart in sim time and the median there is dominated by unlit rock tops beside the lit ledge; the picture shows the lip on the ledge you stand on. Measurement noise of a median, not a regression I could pin to the change.

## Checks (all green)
architecture, skins, pixels, undercrown-variety, burial-route, burial-vents, dangling-paths, checkpoints, footing-art, readability. There is no orevalue/footLip check in tools/ (grep found none), so none was run. No gameplay change, no pilots.

## UNVERIFIED
- Pickups and hazards not measured (same harness limit as orevalue; no spikes in these captures).
- Only 11 frames per level; the rest of each level is not looked at.
- The dim covers everything drawn as backdrop (mine wall, rooms, facades); scenery drawn after the interiors loop (e.g. cabins, mage/fields backs) is not dimmed, but neither level draws those.

## QUESTIONS FOR DANIEL
1. Burial's footing is now +36.6 against foes +29.3: the ground is brighter than the foes. Recommend: keep (matches the Ore Road's rule that footing is the brightest value); if foes feel lost, drop Burial's footLip alpha to 0.45 (one number in src/burial-caverns.js).
2. The far-wall step is a flat veil (0.28) rather than per-room colour edits. Recommend: keep, it keeps every hue and is one number per level.
