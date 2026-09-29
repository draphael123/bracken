# claude/orevalue - THE ORE ROAD value-separation pass

Art only (palette and light). No layout, foes or other levels; the new palette key is opt-in. Based on claude/batch44 (ed4b0e7).
Direction (Daniel, 2026-09-29): keep the hues, separate the values so foes, footing, hazards and pickups read against the warm backdrop.

## What changed
- src/ore-road.js `SECTION_TINT`: every far-wall pillar colour a step darker (body x0.72, lit edge x0.66), same hues (yard copper ... drum ember stay orange).
- src/ore-road.js: `edgeLit` is now a brighter warm string (`rgba(255,226,176,0.9)`, was `true` = 0.5 alpha) and `palette.footLip: ['#f0be7c', 0.62]` (new).
- src/main.js: `drawFootLip` (opt-in via `palette.footLip`): the edgeLit lip is drawn under the dark, so it was eaten wherever no lamp stood near. This lays a thin lip back on top of the dark on every walkable top in view. Only Ore Road sets the key.
- Lamp pools (lampGlow), darkRim and the grade are untouched. Foes were already the brightest thing on screen, so their rim was not changed.

## Numbers (tools/orevalue-shots.mjs; L* of the frame, rows 40-330; footing = top rows of walkable tiles, foe = 75th percentile in its box, backdrop = median of open-air pixels)
Before -> after, subject minus backdrop (L* units):
| section | backdrop | foes | footing |
| yard | 13.1 -> 13.2 | +50.6 -> +51.2 | +28.0 -> +37.0 |
| crusher | 13.8 -> 10.5 | (none in view) | +20.8 -> +35.2 (spikes +6.9 -> +9.9) |
| loading-house | 15.9 -> 14.6 | +41.4 -> +44.0 | +14.1 -> +28.6 |
| first-span | 10.6 -> 9.2 | +49.1 -> +51.1 | +23.2 -> +38.9 |
| sorting-yard | 9.7 -> 7.9 | +53.5 -> +55.4 | +26.0 -> +37.7 |
| sorting-floor | 11.0 -> 9.9 | - | +8.1 -> +22.7 |
| tower-top | 10.7 -> 10.2 | +46.9 -> +47.5 | +10.8 -> +26.4 |
| tipple-house | 11.1 -> 9.7 | +51.0 -> +55.2 | +7.1 -> +24.0 |
| collapsed-span | 11.2 -> 9.3 | +36.5 -> +38.4 | +12.5 -> +25.5 |
| wreck-head | 14.2 -> 13.1 | +42.1 -> +41.4 | +18.0 -> +29.5 |
| brakemans-hut | 8.2 -> 6.5 | +39.4 -> +41.1 | +21.3 -> +35.8 |
| winch-house | 9.5 -> 8.5 | +49.3 -> +50.3 | +17.1 -> +30.8 |
| drum-yard | 11.6 -> 9.8 | +42.8 -> +43.9 | +14.2 -> +25.8 |
| drum-house | 13.6 -> 12.9 | - | +24.5 -> +35.2 |
| boss-shaft | 12.6 -> 10.5 | - | +7.8 -> +9.9 (one walkable tile in frame) |
MEAN foes +45.7 -> +47.2; MEAN footing +16.9 -> +29.5. The backdrop's bright tail (p90, lamp pools and lit pillars) fell 42.0 -> 34.7 in the yard, 46.1 -> 46.0 in the tipple (a lamp pool, kept on purpose).
Captures: work/orevalue/before and work/orevalue/after2 (yard 00, crusher 01, drum-yard 13, drum-house 14 plus the rest).

## Checks (all green)
ore-road, ore-exam, architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (unchanged, no rebase), npc-removal, readability, camera-fill, footing-art, ground-depth, render-layers, pixels. ore-ride not run (load flake, no mechanics touched).

## UNVERIFIED
- Pickups (coins/loot) are not measured: the harness had no pickup accessor. They sit under the same dark and were left as they were.
- Hazards measured only in the crusher (the only spikes in a capture spot). The boss shaft is dark and has almost no footing in the capture frame.
- The lamp pools still light the far wall in the tipple/tower (p90 ~ 37-46 L*): kept as the mine's lamplight, per the brief.
- No bot pilot (boss unchanged).

## QUESTIONS FOR DANIEL
1. The foot lip is a uniform thin bright line on every walkable top, even in pitch dark (built at alpha 0.62). Recommend: keep, it is what makes the footing the brightest value; if it feels like a drawn outline, drop it to 0.45 (one number in ore-road.js).
2. Same opt-in `footLip` key could give Undercrown/Burial Caverns the same footing rule. Recommend: yes in a later lane, one line each.
