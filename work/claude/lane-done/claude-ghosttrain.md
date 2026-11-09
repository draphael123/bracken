# ghosttrain: THE GHOST TRAIN level + THE CONDUCTOR boss (opus greybox, behind GHOSTTRAIN_SHIPS = false)
Branch `claude/ghosttrain` (worktree `bracken-lanes/bracken-ghosttrain`), off master 85d152eb8, pushed. Code only: no browser, no full suite, node checks one at a time. Not merged, not deployed.

## PLAN (built as written; questions at the end, each with the rec I built)
- **Road (behind the flag):** HARVEST FAIR -> THE GHOST TRAIN -> HEXED FIELDS. The LEVELS row is APPENDED only while `gtOn()` (GHOSTTRAIN_SHIPS or `?gt=1` / `globalThis.__GT`); then `fields.needs = 'ghosttrain'`. Map node at inland (165,118) on the road between the fair and the fields.
- **Saves:** `gtRoadMig` (runs only with the flag on, once): a save that had the fair or the fields cleared keeps THE HEXED FIELDS open (`PROG.fieldsOpen`, read by levelLocked); the train itself needs only the fair, so an old save finds it unlocked as an extra. Flag off: the rule never runs and the clause is inert (proved).
- **Grid:** 264 x 28. ROOF row 12 (stand at 11), inside rows 13-17 (stand at 17), FLOOR 18, chassis 19-20, THE TRACKS under it. Cars 14-22 columns, 2-column gangways (a plate inside, a step up to the roofs).
- **Constant motion:** the train is the level and never stops; the world streams past (ballast, telegraph poles, fences). What the motion does is told and timed: wind on any exposed deck (26 px/s back, GUST +64), LOW BRIDGES and TUNNELS whose mouth reaches the lead hero after its tell (1.4-1.8 s) and sweeps back down the train (360 px/s). Upright on top = hit (18 / 22); DUCK FLAT or GET INSIDE; a ducked hero braces against the wind. THE TRACKS never kill: a fall between cars costs 20 (spare) and puts you back on the nearest car.
- **Verbs per section:**
  - THE SIDING 0-35 (teach): the guard's van (one lit lamp + sleeping ghost, one dark + woken ghost), the first coupling, the well wagon (cross it on its low floor; the ride's painted facade = cornice climb, secret 1), points P0 (straight = tunnel / branch = gust).
  - PASSENGER CARS 36-95 (develop): THIRD CLASS (lit, draughty: the P0 tunnel puts its lamps out), THE DARK COACH (oil lamps burn 8 s), FIRST CLASS (steady lamps + the ride's animated armour, luggage loft), bone archers / bats on the roofs, low bridges every 6.5 s, points P1.
  - THE DINING CAR 96-119 (twist): clerestory car, 5 diners under 2 chandeliers; P1 straight = THE LONG TUNNEL (chandeliers out, diners wake) / branch = the windy trestle. Shrine 1 in its vestibule (col 115).
  - THE SLEEPING CARS 120-163 (dark exam): berths 3 high, oil lamps burn 6 s, THE CUTTING (tunnel after tunnel over the roofs, every 7.5 s): you go inside, light, move, relight.
  - THE COAL TRUCKS 164-195 (combine): high heaps (the plateau), the stack's sparks (told red marks, 12), woken firemen (no lamps), points P2 (tunnel vs sparks), the coal hole (secret 2). Shrine 2 at the engine door (col 192).
  - THE FRONT CARS 196-263: the boss.
- **Checkpoints (fewer):** START + 2 shrines (115, 192), checkRun 200 so the filler adds none.
- **Boss THE CONDUCTOR (2900 hp; x0.45 outside openings, THROWN x2 capped at 12% of him per opening, never untouchable):**
  - Arena west to east: MAIL VAN | CONDUCTOR'S VAN | TENDER | ENGINE. It shrinks: UNCOUPLING! at 80% and 60% (told 1.6 s at the pin, the gangway goes, 1.2 s to jump forward, the van is left on the line, the camera lock moves on).
  - P1 moves: LANTERN SWING (told 0.55, 14, blockable), TICKET PUNCH (told 0.8; 3 holes told 0.9 then THE BOARDS GO for 3 s: a roof hole drops you inside, a floor hole onto THE TRACKS), TUNNEL AHEAD! (told 1.8; the roof sweep, 24; called when someone is on top, and every 15 s).
  - THE EMERGENCY BRAKE (the key): a red handle in each car with a pressure gauge (10 s to charge). Strike it charged: the train lurches, he is THROWN, OPEN x2 for 3.2 s. A van's handle goes with its van.
  - P2 at 50% (P1 floor holds only until his move in hand ends): he rises, glides, FUSES WITH THE FIREBOX (2.6 s, still x0.45). Moves: THE FIREBOX jet (told 0.9, low, 20 - jump it), STACK SPARKS (told 1.0, 5 embers, 14), THE FIRE REACHES (told 0.6, 18), TUNNEL AHEAD (the whistle, told 1.4). The tender and cab brakes throw him OUT of the firebox: open x2 3.2 s, then he crawls back.
  - 60-70% with flasks: owed to the tune lane, n=6 (see Owed).

## Built (files)
- **New:** `src/gt-flag.js` (GHOSTTRAIN_SHIPS = false, gtOn), `src/gt-lines.js` (every line), `src/ghost-train.js` (the builder, GT, SECTIONS), `src/ghost-train-hands.js` (motion, lamps, ghosts, couplings, points, tracks, sparks; greybox draw), `src/conductor.js` (the fight, pure), `src/conductor-hands.js` (world binding, POSE table, greybox draw), `tools/ghosttrain.mjs`, `tools/gt-on.mjs`.
- **Shared edits:** `src/level.js` (import + the guarded push, 3 lines), `src/threat.js` (one Object.assign line), `src/marks.js` (one line: the ghost's grasp `!` block/low), `tools/level-quality.mjs` (GATE + REPORT_ONLY music/pilot/mash/curve), `tools/additional-areas.mjs` (reads the train's road when its row is there).
- **main.js:** 18 single tagged lines `(claude/ghosttrain)` + one clause on levelLocked (tagged): import, gtRoadMig, map node, reset, spawn case, level step, boss step, ghost step, take, strike, drawBack, drawOver, boss/ghost draw, bar name, death, construct (EHP/TIER/COLS), dev entry.
- **Dev entry:** `?gt=1&dev=1` (the level from the guard's van), `&gtsec=1..5` (a section's first car), `&gtboss=1` (the engine-door shrine), and the generic `?gt=1&boss=conductor`. Never saved (levelJump/bossJump).

## Checks (node only)
- **tools/ghosttrain.mjs: 72 ok, 0 fail.**
  - FLAG OFF: LEVELS / fair / fields signature = master 85d152eb8 exactly; the old-save rule + gate clause over 4 fake saves = master; all hooks guarded.
  - FLAG ON: road and grandfathering (4 cases); build (6 sections, START+2, reach to every shrine/silver/pin/lever/brake/boss/lamp); hands (lamps decide, untouchable sleepers, relight -> sleep, snuff -> wake, the grasp, wind/brace, P0 tunnel snuffs + hits only the upright roof hero, points -> gust, bridges, coupling friend/side/cut + its ghost, reset = built grid, tracks spare, oil gutters, sparks).
  - THE CONDUCTOR end to end, bot with a 40 sword: **wins in 60 s with 382/640 left**, 6 brake pulls -> 6 THROWN openings, 1614 dealt open vs 1314 through the coat, both vans gone (tiles too), P2 fused, every blow out of its own windup, the win exit clears his holes/tunnel/fire, a retry restores everything. Without the brake: 80 s. A roof-camper eats 5 tunnel blows.
- **level-quality ghosttrain (flag on): CLEARS THE BAR.** Bands 5, mechanics 6 kinds / 5 developed, secrets 2, checks 2 (1 per 116), density 1.75, route 2 pockets. WARN (report-only): pilot, mash, blocking 36%. Flag off: every gated level clears.
- **Flag on, ok:** checkpoint-gaps, solid-islands (cars declared as hullZones), signs, spawns, killzones, tells, answer-tags, checkpoint-stand, slopes, boss-read, anchor-lint (listed only), floating-geometry (listed only).
- **Flag on AND off, ok:** map-grammar, map-spacing, map-scale, map-roads, additional-areas, under-order, canal.

## Owed
- **Art lane (sonnet):** everything is greybox.
  - The cars: van, well wagon, coaches, clerestory diner, sleepers, coal trucks, tender, engine (cab/boiler/dome/stack/firebox), bogies.
  - The ride's facade, the motion backdrop (hexed fields at night, tunnels, bridges, the trestle), lamps and their light.
  - Ghost passengers / firemen, THE CONDUCTOR's POSE art (`src/redraw/conductor_art.js` to come), holes, brake handles and gauge, the firebox fusion.
  - The map node's art and blurb, the transition rows (fair -> train -> fields), the music (Daniel picks).
- **Browser stills (dev URLs):**
  - `?gt=1&dev=1`: the guard's van (lit vs dark ghost), a lamp struck lit / out.
  - `&gtsec=1`: the P0 tunnel's tell, mouth and lamps going out; a low bridge with an upright vs a ducked hero.
  - `&gtsec=2`: the dining car, chandeliers lit, then dark after the long tunnel.
  - `&gtsec=3`: a sleeper lamp guttering.
  - `&gtsec=4`: sparks on the heaps, the coal hole.
  - A coupling cut and the car falling back. THE TRACKS catch.
  - `&gtboss=1` / `?gt=1&boss=conductor`: his wake; the punch holes; TUNNEL AHEAD on the roofs; each UNCOUPLING; a brake pull (THROWN); the fusion; the firebox jet, sparks and grasp; the win. Plus a co-op still (2 seats, a friend behind a coupling).
- **Tune (n=6, the tune lane):** `tools/boss-run.mjs` / `boss-rates.mjs` need a `--gt` flag (sets `globalThis.__GT` in the page, as `--ft5` does). Then `boss-rates ghosttrain --gt` at n=6, with flasks, to 60-70%. The lab bot has never pulled a brake: it may need a pilot hook (`CDH.pull(id)`).
- **Page tools not run:** harvest-fair.mjs, theatre.mjs, map-forks, stuck, reach-heroes (9 heroes: the well wagon's 3-row climb and the heap plateau), hint-shown, textfit (gt-lines), mobile-perf (the dark-car overlay loop), level1-pilot (pilot + curve rows), mash-bot (mash row), boss-openings, boss-greed.
- **Not built:** bestiary cards (BEASTS) for the ghost passenger and THE CONDUCTOR, MARK rows for the Conductor's tells (he wears his own `!`/`!!` through ctx.number for now), a boss-rush row, SAY_LINES routing of gt-lines, the art's own tile kit.

## Questions (rec = what I built)
1. **Length:** 196 run columns + a 66-column arena, but the train is two decks deep. **Rec: keep.** Lengthen by one coach per section only if the browser walk says it is short.
2. **THE TRACKS never kill:** a fall costs 20 (spare) and puts you back on the train. **Rec: keep** (fewer checkpoints make a death-pit train harsh). Alternative: a fall is a death.
3. **The emergency brake is pulled with a blow, not UP.** **Rec: keep.** It works for every hero and every co-op seat, the same as a lever.
4. **A sleeping passenger cannot be struck.** **Rec: keep** (the rule is pure: put the lamp out to fight it). Alternative: a blow wakes it.
5. **A tunnel's tell is timed to the lead hero**, not to the engine (from the engine it reached the rear 10 s after the call). **Rec: keep.** The Conductor's own TUNNEL AHEAD does start at the engine, because his arena is short.
6. **Map node at (165,118):** the only spot that cleared spacing, scale and grammar. The road runs east from the fair to it, then back west to the fields. **Rec: keep.** The art lane may relay the inland sheet.
7. **Music:** it borrows 'chase' (level) and 'boss3' (arena), report-only. **Rec: Daniel picks CC0/CC-BY tracks** for the train and THE CONDUCTOR.
8. **Checkpoints:** START + 2. **Rec: keep.**
9. **Conductor 2900 hp:** the bot sim says 60 s with the brake and 80 s without. **Rec: the tune lane sets it at n=6 once boss-rates has `--gt`.**
