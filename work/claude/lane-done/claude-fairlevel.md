# claude-fairlevel: THE HARVEST FAIR rebuilt as a vertical fairground

Branch `claude/fairlevel` (base `claude/housekeep` a6d58b4). Daniel's verdict was "a prototype rather than a real level ... just walk right". He chose a vertical fairground and to keep the facing rule and use it better.

## What changed (plain words)

- `src/harvest-fair.js` is a new level, same 672 columns, same wiring (Waymeet -> fair -> Fields; `needs` untouched; the boss section from the door to the arena is byte-for-byte the old one). The road now rolls (hills of slopes, pits, a three-row ghost-train cutting), with a boardwalk over it, a wheel, a tower and a corn maze.
- Set pieces: THE HIGH STRIKER x3 (a plunge on the pad rings the bell and throws you up: onto the boardwalk, onto the corn-top walk over the maze, onto the night lane), THE SHOOTING GALLERY x3 (targets; planks appear as tiles), TICKETS (level-local, 8 buy a silver at THE PRIZE BOOTH), THE BIG WHEEL (six cars; a hobby-horse rides the wide one), THREE SWING-RIDE CHAIRS, THE HELTER-SKELTER (a tower, a 14-row slide), THE HALL OF MIRRORS (dark; true glass ahead watches your back, cracked glass does not), THE CORN MAZE (three tiers, two chimneys, blind corners, two mummers in scarecrows' coats, walls stop your look), THE NIGHT (the light goes out with height; only a lit lantern or 88 px shows a mummer; the Maypole Ribbon x1.5 helps in the hall and on the tops), THE WICKER EFFIGY going up behind the fair in five stages, two secrets (THE BACK LOT, THE CLOSET behind the cracked glass), THE GHOST-TRAIN CUTTING reserved for the chase.
- New files: `src/fair-games.js` (pure: strikers, gallery, tickets, booth, sight, mirror, blind corners), `src/redraw/fair_rides.js` (wheel, chairs, tower, slide, hall, corn, games, night overlay), `src/redraw/ground-slopes.js`, `tools/fair-route.mjs` (the route pilot), `tools/fair-map.mjs`. Edited: `src/main.js` (small hooks: games, sight/mirror, mover draw, night overlay, gondola rider, slope painter), `src/mummer.js` (looks(): `blind`, `mirror`; horseStep takes `w.sight`), `src/reachcore.js` (secret walls, gallery planks, striker throws count as done), `src/threat.js` (striker/gtarget/ticket/booth = 0), `src/redraw/fair_art.js` (scarecrow sprite), `docs/briefs/harvest-fair.md`.
- THE INVISIBLE SLOPES (Daniel's second report): the tile painter drew slopes only for the Sunken Caravan (`if (L.caravan && cvTile(...))`), so the fair's Stall Stair (24 cells) and the Ore Road's ramps (3) had no picture and the rock under them read as grass-topped squares. The guard is now `(L.caravan || SLOPES_ON)`; `cvTile` bakes a slope from the level's own top and fill sprites for any non-caravan level (`ground-slopes.js`); the rock under a slope is fill. The caravan is unchanged. Asserted in `tools/harvest-fair.mjs` (every slope cell has a sprite: 106 of 106; the art follows `heightAt` for all six kinds).

## Numbers (before -> after)

| | before | after |
|---|---|---|
| foes | 13 (10 mummers, 3 horses) | 16 (12 mummers, 4 horses), every one squad-tagged in a designed encounter |
| height bands used by the route (level-quality) | 4 | 5 (plus the cutting) |
| share of width with a second height | 32% | 42% |
| gadget kinds / developed | 3 / 0 | 9 / 5 |
| longest flat empty / level-ground run | 74 / 79 columns | 32 / 38 |
| flat empty share / level-ground share | 35% / 72% | 9% / 24% |
| checkpoints | 6 (8,124,252,380,508,600) | 6 (8,124,252,383,499,600) |
| level-quality (tools/level-quality.mjs, claude/levelq aaee2a5) | fails flat, bands, mechanics, encounters, density, slopes, route | clears nine of ten; fails DENSITY only |

## Checks

GREEN (run alone, on this branch): harvest-fair (pure, level, page; every new assertion is in tools/harvest-fair.mjs; the slope-art one was proved to fail with the old guard: drawn 0 of 106), architecture, checkpoints, checkpoint-gaps, checkpoint-stand, skins, dangling-paths, npc-removal, signs, sprinkle-cap (squads are on one floor; the elite carries squad guard), hint-shown, elites, audio-assets (no new SFX: I reuse tollBell, tink, coin, gateOpen), floaters, deadends, collectables, spawns, foe-tactics, threat-holes, one-new-foe, slopes, keys, runtime-footing, light-support, occluders, ground-depth, footing-art, readability, dressing, bridge-props, map-grammar, boss-fight-end, boss-openings, arena-supplies, mini-walls, answer-tags, untold-told, weak-bosses, render-layers, tells, comments, homepaths, audit, content-audit, zoom-coverage, camera-fill, wicker-queen, boss-jump, lab-reach. slopes-trace: green and unchanged (it does not trace the fair, so nothing was rebased). tools/level-quality.mjs (from claude/levelq, NOT committed here): fair clears nine of ten, fails density. I did not run the full suite.

Captures: before in work/claude/fairlevel/before/, after in work/claude/fairlevel/after/ (19 stops), full-level map work/claude/fairlevel/fair-map.png (tools/fair-map.mjs).

## The route pilot

`node tools/fair-route.mjs all [hero]`: real keys, no god mode, foes gone (geometry, not a fight). LOW road (pits, slope stair, terrace, carousel, hall, tower stair, slide, ricks, maze tiers and chimneys, small carousel, last pit, door at x 619), HIGH road (the wheel car, three chairs, tower top, slide), STRIKE roads (all three strikers and the roofs they open). All green for the knight. (Other heroes: see UNVERIFIED.)

## UNVERIFIED

- The pilot was run for the knight only; the strikers are proved for all seven heroes in `tools/harvest-fair.mjs`.
- Nobody has played it: the wheel boarding and the swing chairs are timing jumps a real hand will feel differently from the pilot's.
- The night overlay and the mirror reflections are eye-checked from captures only (`work/claude/fairlevel/after/`).
- `slopes-trace` does not trace the fair (it traces wood, kings, keep, burial), so there was nothing to rebase; it stays green.
- The gallery clock runs in game time (the page runs the game slower than wall time: 12 s of window is about 20 s of frames).

## QUESTIONS FOR DANIEL (each with my recommendation; the recommended option is built)

1. DENSITY. The new level-quality lint wants 2 to 4.5 foes a screen (about 55 foes on 672 columns); the fair has 16 (0.6 a screen, 14 empty screens). That is the grid of foes you cut on 2026-09-28. I built FEWER, BETTER FOES and did not pad. Recommendation: waive the density floor for the fair (or make it count encounters); if the gate `level-quality` is wired before you decide, it will fail on density alone.
2. TICKETS are level-local (they reset when you leave the fair). Recommendation: keep it so; no existing currency fits, and a persistent one needs a save-format decision.
3. The PRIZE BOOTH sells a silver (the third silver is bought, the other two are the crow's nest and the back lot). Recommendation: silver only. A relic is possible if you name one (the Maypole Ribbon stays the Wicker Queen's).
4. The strikers are opened by a PLUNGE or a held heavy blow (every hero has a plunge). Recommendation: keep; a light blow only hops.
5. The wide car with a hobby-horse is optional (the other five cars are free). Recommendation: keep it as the wheel's dare.
6. The corn maze's scarecrow-mummers are told by a sign, three brass bells on the hat, bells when they move and the red mask. Recommendation: enough; say if you want them harder to spot.
7. Shrines: still six (one per ~110 route tiles). You wanted fewer. Recommendation: keep six; the rule is 175 tiles max and the level is 649 route tiles.
8. The ghost-train chase has a reserved cutting (cols 462-497, three rows down, a boarded arch); a Marionette or Barker elite have no place yet. Recommendation: put the Barker at the cutting's mouth.
9. The lint's `route` measure counts the route through the maze/cutting; the fair's route spans 17 rows (Folly 30). Recommendation: accept.
