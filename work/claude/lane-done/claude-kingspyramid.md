KINGSPYRAMID DONE 11-06 10:05 READY (code-only greybox, behind its flag; browser / art / tune owed - listed below)

# claude/kingspyramid - THE KING'S PYRAMID + THE KING OF FIVE SEALS + THE GILDED GUARD (OPUS greybox, code-only, 11-06)

Branch `claude/kingspyramid` off `claude/colossus4` 5f28d2603 (contains claude/desertkit). Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-kingspyramid`. Pushed. NOT merged, NOT deployed.
Tip: see the last line. Sources: plan-desert-1105 s1.11 / s2 / s3 / s4 / s6 (Daniel approved 11-05 14:07), brief-kingspyramid (!! 10-13 DANIEL RESTRUCTURE), lane-reports colossus4 / desertkit / sealedpyramid3.
The whole lane fit: the level + foe are FULL, and the boss is a FULL pure fight with hands (not a stub) - all four phases, every opening, told moves, court, storm. Unplayed in a browser (none allowed).

## DEV FLAG / URL
`src/kings-pyramid.js` `KP_SHIPS = false`. OFF: `src/level.js` does not append the row at all - LEVELS is master's array (proved: a clean child process sees no row).
ON: `?kp=1&level=kingspyramid` (the PLAYTEST level jump), or `globalThis.BRACKEN_KP = true`, or `KP=1` for Node tools. The row is appended LAST and HIDDEN (no map node), needs 'sealedpyramid'.
Road insert = the road lane's, append-only, through the one road-insert migration test, at the art merge (art before live). No map node drawn.

## What was built
| file | what |
|---|---|
| `src/kings-pyramid.js` (new) | flag + the level 202x92: THE SUNLESS DOOR (vestibule, black corridor, a sun shaft with the first GILDED GUARD under it) -> THE HALL OF DOORS hub (shrine = CHECKPOINT 1, three ledge stacks, upper galleries, a sun shaft, THE GREAT DOOR with 5 keyholes, barred) -> 5 KEY ROOMS any order -> THE DESCENT (lift down a 40-row shaft, told debris, boarders at the ends) -> shrine (CHECKPOINT 2) -> the arena. `L.kp` = every room piece as data; the mirror room is `L.sunRooms` |
| `src/kp-rooms.js` (new, pure) | room engine + `lintKP`: LINEN walls (fire burns, told 1 s), CRACKED stone + a hung ledge's BRACKET (keg blast breaks / drops the ledge into a step), WEIGHTS on a CLEAT (strike -> weight falls -> gate lifts), GATES, SLIDING PRESSES (tell 0.6 -> slide -> hold -> back; JAM switch 5 s), SWITCHES, SPIKE FLOORS, SUN SHUTTERS, THE DEATHLESS (doomed only by press / spikes / sun; all 3 -> key gate), KEYS + great door, keg RACKS (refill), THE DESCENT schedule (8 stones each told 0.9 s + 0.35 fall; boarders only from end alcoves) |
| `src/gilded-guard.js` (new, pure) | THE GILDED GUARD = the shield machine in gold: any light on him (shaft, shutter, sun-room beam, the King's light) STRIPS his shield 3.2 s (dazzle 0.5 s, told) -> `e.disarmed` (main's throughGuard: no front guard, softer blows), blows x1.25; shielded, a blow that reaches him x0.6 ("GOLD"); must leave the light 0.6 s before it strips him again (no lock/farm); hp x1.6 |
| `src/five-seals-king.js` (new, pure) | THE KING OF FIVE SEALS - see below. `ksPlan` = the human bot |
| `src/kp-hands.js` (new) | world binding + GREYBOX drawing of all of it; carried FIREBRAND (cresset / brazier) + POWDER KEG (rack): E take / E set down, ATTACK throws on the told arc (carry-throw.js, keg kind added lazily), thrown keg lit (1.3 s), a struck resting keg lit (1.6 s), a blow drops what you carry; keys carried across a death; the doomed deathless stay down; the ride re-tells its stones after a death |
| `src/main.js` | 15 one-line hunks, all gated (`KPH.on()` = only a level with `L.kingspyramid`; boss type `kingseals`; foe tag `kp`): import, clear, tag copy, spawn case, wardedDamage take hooks, construct, interact, strike, update, drawOver, draw, boss update, boss draw, bar name, lift drawn by the hands |
| `src/level.js` | import + the flagged hidden row |
| `tools/kings-pyramid.mjs` (new) | **122 ok** node proofs + toy duel (`--sim=N`, `--log`) |
| `docs/kings-pyramid.md` (new) | module map |

### The rooms (each self-contained, its own exam, any order; one key each)
- **MIRRORS** (up west): FIXED mirrors on posts, turned by a strike (sun-puzzle / sunroom-hands / beam-path - reused, nothing rebuilt): port -> down, along, up, along = 3 turns to the key door's glyph (lintSunRooms: solvable, not pre-solved, every mirror strikeable from a ledge). The as-built wasted beam falls on the floor where the guard walks (the light strips him - the guard's test). **PRIEST CACHE** (plan Q5): sun-seal in the west wall, only the Desert Priest's beam opens it (needs `PRIEST_RAYS` from claude/desertpriest), a silver.
- **FIRE** (up east): cresset -> firebrand; burn the linen wall, burn the linen dead, lob onto the high linen wall on the shelf.
- **KEGS** (down east, rope down/up): rack -> keg; blow the cracked wall; blow the bracket -> the hung ledge drops to a step -> the plinth.
- **SWITCHES** (down west): strike the cleat (weight falls, gate lifts), jam the cycling presses (5 s), cross, strike the shelf switch (key gate).
- **THE DEATHLESS** (top, one-way up through the hub roof): 3 dead no blow kills ("DEATHLESS: ONLY THE TOMB KILLS IT"); from three perches fire the press / raise the spikes / open the sun shutter as each walks its beat -> all three down -> key door.
- **THE DESCENT** (A14 exam): ride the lift ~16 s; 8 stones each told 0.9 s (dust ring on the deck); 2 boarders hop on at the head, 2 at the foot (told '!'), none mid-shaft.
CHECKPOINTS: 2 (hub shrine + before the King). Theme: black stone + gold (greybox colours), no wood, no goblins (goblin-lint clean for this level after the reskin).

### THE KING OF FIVE SEALS (4 phases, ~hp 5600, numbers untuned)
- **P1 SUN** (100-75): capstone open; strike the ALTAR + a WALL mirror (from the ledges) to bring the sun down column 6 or 50; the light on him = OPEN the same frame ("THE SUN BURNS HIM"). Moves: CROOK HOOK `!` (block/parry, pulls), FLAIL SWEEP `!!` (jump), SAND SPIKES `!!` (3 marked stones - on your ledge if you perch).
- **P2 FIRE + KEGS** (75-50): capstone shuts (dark overlay), braziers + keg racks; a firebrand or lit keg on him = OPEN. New: URN VOLLEY `!!` (3 marked spots, fire lies 2 s).
- **P3 SWITCHES + DEATHLESS** (50-25): THE COURT rises (adds here only, max 3: 2 deathless guards with told swipes + a PRIEST who walks to a switch and BINDS it 4 s, told); two SPIKED PRESSES slide in from the walls along the floor (sliding presses, never pillars) when you strike the switch on the ledge over each lane; a press on him = OPEN ("THE PRESS PINS HIM") and it kills the court in its lane.
- **P4 STORM** (25-0): capstone torn off, gusts (told 1.2 s, brace = half push), faster; EVERY verb opens him, ONE AT A TIME (the verb that just opened him rests until another does - told). New: SUN FLARE `!!` (every lit tile hurts: leave the beams), STORM CHARGE `!!` (jump it / take a ledge). Told BOULDERS (1.0 s ring) - heroes only, never an opening.
- ALWAYS: gold x0.4 outside openings in every phase and mode (B15, tested), opening x2 for a purse of 11% then x1, 3.2 s, told 3 s ward; seal transitions 2.2 s colour flood, nothing cast (tested); phases one at a time; 7 told moves + boulders, each with its own windup/release pose name + sound key (greybox draws the pose NAME under him until art); picked by where you stand, never twice running.

## Node results (one at a time; no browser, no tools/check.mjs)
- `node tools/kings-pyramid.mjs` **122 ok**: flag both ways; geometry (2 checkpoints, rooms don't overlap, lintKP + lintSunRooms clean, 3-turn mirror room, cache); REACH (reachcore floodReach): as played every key + the arena are reached; AS BUILT every key is behind its room's exam, every room door is reached from the hub, the great door shuts the way down; rooms pure (burn, blast, drop, cleat/weight/gate, cycle + jam, the three deathless kills + gate, keys/door, the ride: 8 stones each told >= 0.9 s, boarders only at the ends, rack refill); guard; King (light map, instant open, ward, B15 min 0.4 everywhere, poses, one new move a phase, seal breathers, P2 keg/fire, P3 press opens + crushes + hurts heroes, priest binds, presses cold before P3, P4 one-at-a-time, boulders heroes-only); HANDS SMOKE (fake world: rooms + carried brand burns the linen + 4 min of the King through the hands and all draws, no throw).
- TOY DUEL (kinematic point-hero, hp 300 / 18 a swing / 3 flasks, n=6): **6/6, avg 347 s**, all reach P4, opens mirror 60 / keg 60 / press 34. NOT the rate - but the pace says the real fight will run long: REC tune start hp 5600 -> ~4000 (or purse 0.11 -> 0.15) for the 3-4 min target, then bossLab n=6.
- `KP=1 node tools/level-quality.mjs kingspyramid`: MISSES (it is not GATED - not added): **bands** 2 (route = corridor/hub/shaft; the rooms are branches), **mechanics** 5 kinds but 0 in 3+ places (the tool counts ents; added data markers kpswitch/kpweight/kpkeylock/kpglyph/kpkey - main spawns nothing for them), **music** borrowed (sealedpyramid bed + tombking boss track placeholders), **checks** 1 per 87 route tiles (bar >= 90; the route ignores the rooms). ok: flat, encounters, ranged, roles 3, route 7 pockets, secrets (2 silvers), unlocks. pilot/mash not run (page tools).
- `KP=1`: checkpoint-stand ok (after the lift rigBands + barred PORT door reachDoors), checkpoint-gaps / -thin / -rule / checkpoints ok, floating-geometry ok, floaters ok, goblin-lint clean for kingspyramid, anchor-lint LISTS kingspyramid 28 (island 24, cantilever 4 = the one-way ledges/galleries: hung stone ledges, art lane anchors them; listed, not gated), platforming-lint does not list hidden levels.
- **one-new-foe FAILS for kingspyramid (flag on only)**: the Gilded Guard is the 'shield' machine + a `kp` tag + the 'shieldguard' skin, so the tool sees no new EHP kind. Owed (REC Q3). With the flag off (the suite) the level does not exist, so nothing in the suite moves.
- answer-tags, desert-bosses, foe-glue, foe-pass, dangling-paths, comments: ok. `node --check` every touched file. Filenames (kings-pyramid, kp-rooms, kp-hands, gilded-guard, five-seals-king) clean vs ad/banner/track/pixel/promo/analytics/admiral.

## Browser owed (one at a time, >= 1500 MB, memguard first; all with ?kp=1)
1. Walk it: `?kp=1&level=kingspyramid` - every room with knight + reaper (slowest) + a ranged hero; the mirror strikes; cresset/brand/keg carry + throw arcs; keg blast vs cracked wall/bracket; cleat; press jam timing (5 s for a 10-tile run); deathless lures from the perches; the hub one-way roof into the deathless room; the rope shafts; the great door; the lift ride + debris + boarders hop; co-op seats.
2. The King: bossLab hook for `kingseals` (none yet: a tune-lane line in src/lab.js driving `ksPlan`), then `boss-rates kingspyramid` n=6 WITH flasks (60-70%), mash 0/6; boss-openings / damage-caps / untold-told / mark-integrity / hint-shown (the words are ctx.number calls in kp-hands, not hint-lines rows yet).
3. `level1-pilot kingspyramid --write`, `mash-bot kingspyramid --write`, reach-heroes.
4. The QUICK gate on the branch (main.js hunks are gated but unplayed).

## Art owed (art before live)
Black stone + gold tile kit + sun-glass ports; THE GILDED GUARD (own sprite: gold shield, stripped/dazzled pose; bestiary card); gilded archer skin; the deathless seal; linen walls (whole/burning/ash), cracked masonry + bracket + chained hung ledge, counterweight + cleat, sliding spiked presses + niches, switches, spike floor, sun shutter, keys + the great door's five keyholes, cresset, keg rack, the lift deck + chains, debris + dust ring; THE KING OF FIVE SEALS (gold armour, crook, five seals; every windup/release pose: hookWind/Rel, sweep, spikes, urns, court, flare, charge; seal-crack floods; dark P2; storm), the court guards + priest, urns + fire pools, boulders; bestiary cards; music (own level + boss tracks).

## Questions for Daniel (recommended answer first; built as rec)
1. **Keys survive a death** (the rooms stay done: burned linen, open gates, doomed deathless). REC yes - a death costs the walk back from the hub shrine, not a room. Alt: keys drop at death like carried coin (Salt & Sanctuary, harsher).
2. **Two checkpoints** (hub shrine + before the King); the level lint wants >= 90 route tiles a checkpoint and reads 87 (the rooms are off its route). REC keep both (brief: shrine in the hub; plan: shrine before each boss). Alt: drop the hub shrine (start = the foot, 40 tiles off).
3. **The Gilded Guard as its own foe kind** (one-new-foe): REC the KP fix lane promotes it to ent type 'gildedguard' (spawn case on the shield machine + EHP row + bestiary card) with its art. Alt: list KP in one-new-foe's NEW_EXACTLY as a skin.
4. **P4 'one at a time'** read as: any earlier verb opens him, but the verb that just opened him rests until another one has (told). REC yes. Alt: any verb any time (easier, spammable sun).
5. **Fight length**: toy duel 347 s. REC tune start hp 5600 -> ~4000 for 3-4 min, then bossLab. Alt: keep hp, lengthen openings.
6. **The deathless' kill traps** = press, spike floor, sun shutter (one each, three perches). REC keep (the room's own exam + the P3 court callback). Alt: presses only.
7. **Level-quality rows** (bands / mechanics developed / music): REC the KP fix lane (11-24) adds a second route height in the hub and moves the five rooms' pieces into the tool's counters (or the tool learns L.kp, like the kit gap colossus4 noted). Alt: list KP REPORT_ONLY for those rows.
8. **Boss music**: placeholder = tombking track. REC CC0 candidates for you at the art lane.
