# claude/footsteps (sonnet) - AUDIO FEEL lane 3: FOOTSTEPS AND LANDINGS BY SURFACE (10-18)

Nothing here was heard by ear and no browser was opened (PC memory cap). Static checks + a node mock-AudioContext smoke only; browser checks are listed for the integ.

## What plays now
- 12 surfaces, each a recorded pool `step_<surface>` (names start `step`, so audiocombat's `catOf` puts them in the FOLEY cap of 3 and `SFX_TRIM.foley`; no new category invented). Table `FOOT` in src/audio.js (pool, level, pitch, a "hard" thump under landings, an optional under-layer).
- A step = surface pool + the hero's GEAR layer on alternate steps (every stride of a sprint): plate and mail `step_arm` (knight, paladin, Death Knight, berserker at 0.45), leather `step_lth` (pirate, ranger, warden), robe `step_cloth` (geomancer, pyromancer). Weight and pitch per hero in `FOOT_HERO` (paladin x1.25 @0.9, Death Knight x1.3 @0.8, pyro x0.65 @1.08).
- STRIDE: main.js passes |vx| to `SFX.pStep(surf, speed)`; walk (< 92) is quieter and a shade lower, sprint louder and brighter (gait 0.65-1.2). The beat itself now follows speed: `P.dust = clamp(16.6/|vx|, 0.14, 0.34)` s (0.18 s at the run speed 92 as before, 0.157 s sprinting, slower as the legs slow; the same timer drives the dust puff).
- LANDING = the same pool lower and louder by fall tier (rate x0.88/0.78/0.68, volume x1.6/2.1/2.7), a thump of the old Kenney `land` under hard surfaces, the gear layer louder. main.js now passes the tier to `SFX.pLand(surface(), tier)` (the SAME one-line edit as audiocombat, so it merges clean). Tier body layers `ld_jump` + `bd_heavy` are replayed in my `SFX.land` (no-ops until audiocombat's pools exist, then identical to its numbers); a water landing keeps the synth splash plus `r_splash`.
- The pyromancer's landing never reached `SFX.land`; it does now. Reaper/pirate/pyro `pStep` are no longer synth-only (reaper keeps a low sine thump). Rope/ladder/zipline `pStep()` with no surface = wood. Foe/skid `SFX.step()` / `SFX.land()` with no surface are unchanged (grass step / old landing).
- The old synth plays only while files load or "sound files" is off (`footReady()`).

## Surface map (surface() in src/main.js; underfoot tile first, then level data)
| Surface | When | Pool (files) |
|---|---|---|
| water | shallow pool at the feet | r_splash (existing) |
| iron | cart / ore lift, T.RAIL | step_iron (4 Kenney impactMetal_light) |
| wood | moving platform, ONEWAY, PLANK, SHELF; palette dress `ship` (decks) | step_wood (5 Kenney + 2 TinyWorlds) |
| glass | Glass Sea glass, T.ICE (was "stone") | step_glass (3 impactGlass_light) + quiet stone under |
| stone | T.CRYST, dark levels, `L.stone` zones, `palette.hall`, dress `canal`, Stormhold (crag + village set) | step_stone (5 Kenney + 4 Fantozzi) |
| snow | `snowLine` / frost levels | step_snow (5 Kenney + 3 of the 41) |
| dirt | dress `myc` (Sporewood, Rootway; checked before "dark"), `village`, `camp`, `fair`, `battlefield` | step_dirt (5 Kenney RPG footsteps + 2 leaves) |
| carpet | levels whose id starts `shop` | step_carpet (4 Kenney) |
| gravel | dress `crag` outside paved zones (Scree, Moor, Skyroad) | step_gravel (1 TinyWorlds gravel step pitched 3 ways) |
| sand | palette.set `desert` (Caravan, Welltown, Red Gorge, Ksar, Buried City, Pyramid, Glass Sea past the glass), `L.sandWalk`, dress/set `shore` (Longwater, Causeway, Harbor) | step_sand (5 Fantozzi) |
| mud | dress `marsh` (Marsh Wood) | step_mud (1 TinyWorlds mud step pitched 3 ways) + `r_squelch` under |
| grass | everything else (Bracken Wood, the trials, ...) | step_grass (5 Kenney) |

`tools/footsteps-check.mjs` (new, static): every string `surface()` can return has a FOOT row, a manifest pool and files on disk; the gear pools exist; all 9 heroes have a FOOT_HERO row.

## Files and licences
Four packs downloaded 10-18, each into its own new folder `bracken-lanes/sfx-dl-1018-<pack>/` (tinyworlds, fantozzi, snow41, haeldb; zips + unzipped `x/`, nothing run). Licence box re-read on each page: CC0 on all four (HaelDB lists OGA-BY 3.0 AND CC0; used under CC0, credited anyway).
- TinyWorlds "Different steps on wood, stone, leaves, gravel and mud" 77.7 KB: wood01/03, gravel, leaves01/02, mud02.
- Fantozzi "Footsteps (Grass/Sand & Stone)" 476 KB: Stone x4, Sand x5.
- Corsica_S / Iwan Gabovitch "41 snow shoe steps" 4.4 MB: 3 of the 41 (cut to 0.4 s).
- HaelDB "Footsteps Leather, Cloth, Armor" 87.8 KB: metal x4 (the armour clink), leather x3, cloth x3.
- Kenney Impact Sounds + RPG Audio (already on disk, already credited): grass, concrete, wood, snow, carpet, impactMetal_light, impactGlass_light, footstep00-08.
- 68 new oggs, 382 KB in audio/sfx (`step_<surface>_N.ogg`; build = a copy of sfx-research/build-sfx.mjs, mean about -19 dB, peak limited, mono 44.1 kHz q4; plan and scripts kept in work/tmp-footsteps, uncommitted). 14 pools appended at the END of audio/manifest.json.
- Credits: audio/CREDITS.txt block at the end; src/credits.js `SFX_CREDIT_NAMES` + 'TinyWorlds', 'Fantozzi', 'Corsica_S'; tools/ship-fixes.mjs CC0 list likewise.
- Not all of each pack is used (leather 3 of 4, cloth 3 of 4, snow 3 of 41: Kenney's five already do the job).

## Checks run (static)
node --check audio.js, main.js, credits.js ok; `tools/audio-assets.mjs` ok; `tools/footsteps-check.mjs` ok (12 surfaces, 12 pools, 9 heroes); `tools/ship-fixes.mjs` ok; a node mock-AudioContext smoke (not committed): 9 heroes x 12 surfaces x walk/run/sprint x 3 landing tiers all play a surface file, paladin keeps its plate on top, bare `SFX.step()/land()/pStep()` still work, the 12 new Sound Test rows run. `tools/audio-mix.mjs` is not on this base (audiocombat's): run it after the merge (pools are levelled to about -19 dB mean). `tools/dangling-paths.mjs` is red on the BASE too (batch100-integ.md cites a cast-poses tool that is in no commit), not from this lane.

## Merge notes (mechanical)
- main.js: my `SFX.pLand(surface(), tier)` line is IDENTICAL to audiocombat's (git takes it once). My other main.js edits are in surface() and the P.dust line only.
- audio.js: my block sits just above "RECORDED TAKES OVER THE SYNTH (claude/sfx)" (audiocombat's is below it, before SFX_NAMES): no overlap. It wraps `SFX.step/land/pStep/pLand` AFTER the paladin table, so audiocombat's outer `pLand` wrapper (landTier) calls mine; I use my own `footTier`.
- manifest.json: both lanes append at the end: keep both. src/credits.js and tools/ship-fixes.mjs: one line each in both lanes: keep both name lists.
- Register `tools/footsteps-check.mjs` in tools/check.mjs's static list (not touched here, to keep the merge clean).

## Browser checks for the integ (none run here)
- `node tools/soundtest.mjs` (12 new EFFECTS rows `footGrass` ... `footWater`: three strides then a drop, in the picked hero).
- mobile-perf: 68 more small fetch+decode at start (about 380 KB); if it hurts, drop the 3 snow-41 files and the leaves.
- Walk Bracken Wood, Marsh Wood, Sporewood, the Scree, a shop, the Caravan and Glass Sea watching the console for a decode failure on any `step_*`.
- A 12-foe melee while running: footsteps share the foley cap of 3 with landings and the Kenney `land`; confirm steps do not get stolen mid-fight (the gear layer is the quietest and goes first).

## LISTEN LIST (Sound Test EFFECTS rows foot*, with each hero picked in the game; each row = walk, run, sprint, drop)
1. footGrass / footStone / footWood as knight, then paladin, then Death Knight: does plate read as plate and not as a jingle? Is the paladin too thumpy next to the knight?
2. footSnow, footSand, footGravel, footMud: the gravel and mud are one source file pitched three ways and may sound like a loop; mud may be too clicky (its source is 0.05 s after trimming, `r_squelch` carries the body).
3. footIron (carts), footGlass (Glass Sea, ice): glass is a quiet stone step plus a glass tick; check it does not sound like breaking.
4. footCarpet in a shop; footWater (shallow wading) versus the old noise burst.
5. Pyromancer and geomancer: cloth is nearly inaudible by design; too quiet, or right?
6. Walk vs run vs sprint: is the cadence change noticeable, and does the quicker beat feel natural with the dust puff?
7. Landings: hop, drop, big drop on stone and on sand (the big drop on soft ground should thud, not clang).
8. Death Knight: the low sine thump on top of the plate, too much?

## QUESTIONS FOR DANIEL (rec first; built = rec)
1. Carpet only in shops (levels with id `shop*`); halls, the church and the mage tower stay stone. REC keep; say which interiors want rugs. Built.
2. Shore levels (Longwater, Causeway, Harbor) step on sand; plank and one-way tiles there already return wood. REC keep. Built.
3. Gravel for the crag levels outside paved zones (Scree, Moor, Skyroad); Stormhold stays stone. REC keep. Built.
4. Village / camp / fair / battlefield ground is `dirt` (Kenney RPG steps + leaves); the wood and the trials are `grass`. REC keep. Built.
5. Berserker gets plate at 0.45 (furs and mail), per the brief's "knight, paladin, Death Knight and berserker". REC keep. Built.
6. Footstep cadence follows speed (0.14-0.34 s) and the dust puff shares the timer. REC keep; one number if it feels hurried (the 16.6 in main.js). Built.
7. No CC0 iron-grating or glass footstep pack exists, so iron = Kenney metal and glass = Kenney glass. REC keep until heard.
