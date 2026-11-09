# THE MAKER (lane `claude/maker`)

**Daniel, 2026-11-09:** the level editor comes back as its own mode — a Mario-Maker-style level maker that plays
with **THORNROAD's real combat**, with **slopes and terrain**, the **full enemy cast**, **bosses** and
**mechanisms**. This lifts the "editor is PARKED, add nothing to it" rule (docs/INTEGRATOR.md §1) **for the
maker only**; Boss Rush stays parked.

(An earlier standalone try, `draphael123/thornroad-maker`, rebuilt a simple platformer outside the game. Daniel
wants the real combat, so the maker lives here now; that repo is reference only — its mouse-first editor, share
links and help card are worth porting.)

## Test site (not the live game)
**https://bracken-maker.vercel.app/?maker=1** - its OWN Vercel project `bracken-maker` (Daniel 2026-11-09: separate from
`bracken`, so it can never be promoted onto bracken-nine.vercel.app). Deploy from this worktree with
`vercel deploy --prod --yes` (the worktree's `.vercel/` link points at `bracken-maker`; never run that from the main
checkout, whose link is the live game). After `vercel link`, delete the `.env.local` it downloads (a Vercel token).

## How this lane stays mergeable
- **Its code lives in its own files** (`src/maker-*.js`). `src/main.js` only gets thin hooks inside the editor
  section (`ED_TILES/ED_FOES/ED_THINGS`, `drawEdPalette`, `edPalClick`, two keys) plus `?maker=1` and `window.MKR`.
- **Still hidden from players**: THE EDITOR row stays behind `MODES_PARKED` (`?modes=1`); `?maker=1` opens it
  directly for testing. Nothing here changes the campaign.
- **Merge `origin/master` in often** — main.js moves fast.
- **What's in the palette is measured**: `tools/maker-sweep.mjs` (in the suite as `maker-sweep`) places every palette
  foe alone in a plain made-by-hand wood and requires it to spawn, stay in the world and fight.

## Done (2026-11-09)
- `?maker=1` opens the maker; `window.MKR` test handle (blank / doc / play / resume).
- Palette moved to `src/maker-palette.js`, **paged** (PgUp/PgDn or the `< PAGE >` row), names from the bestiary.
- **Tiles 17 → 24**: slopes (steep up/down, gentle up/down in two halves), plus CRYSTAL; ROPE LADDER named for what
  it is. Slopes get each theme's own ground art and the knight walks them (verified).
- **Foes 30 → 135**: every spawner kind that works alone. The left-out list (water creatures, minis asleep until
  their arena, kinds waiting on a trigger) is at the top of `FOES` in `src/maker-palette.js`, with reasons.

## Done (2026-11-09, step 2: TERRAIN)
- **WATER / SHALLOWS / POISON**: rectangle brushes (press at one corner, release at the other). The document carries
  `doc.water = [{kind, x0, x1, y0, y1}]` (tiles); `MKP.enginePools` turns it into `L.pools` (swim / shallow / harm).
  The box is dug out of the ground. Right-click inside water removes the pool.
- **CRUMBLE LEDGE**: a tile brush; `doc.crumble = ['x,y']` -> `L.crumbles` runs (src/tower-collapse.js rule). The
  generic crumble update only ran in the tower/fair/caravan levels; main.js now runs it (and stands it again on every
  attempt) when `L.custom`.
- **MOVING PLATFORM / LIFT**: THINGS (`mover`, `mover:up` -> one `mover` entity with two settings, `MKP.entFor`).
- Save / load / undo carry the terrain (`MKP.terrainOf` / `setTerrain`).
- **The water cast** (`WATER_FOES`, placed in a pool): urchin, angler, puffer, jelly, lamprey, eel, bog leech.
- Foes now **139**. The sweep got honest: it tracks the FARTHEST a foe ever got (a patroller that walks out and back
  ends where it began), requires 4 px, places exactly what the editor places (`MKP.entFor`), and puts water kinds in a
  pool. That dropped spider, siren, gill (they never engage) - reasons in `src/maker-palette.js`.
- `tools/maker-terrain.mjs` (in the suite): swim, crumble drops and stands again, platform carries, lift rises,
  save -> load keeps it.

## Done (2026-11-09, step 3: MECHANISMS - Daniel chose these before bosses)
- THINGS: LEVER, PRESSURE PLATE, BRASS / IRON / BONE KEY and GATE, PUSH BLOCK, CRUSHER, FIRE JET, ROLLING PUFFBALL.
- A lever (hit it) / plate (stand on it or push a block onto it) opens a column of DOOR tiles: the one the **LINK** tool
  (TOOLS) points it at, else the **nearest**. `MKP.engineEnts` fills `openColumn` / `gate` on the copies the game plays;
  the editor draws every link (amber = nearest, gold = LINKed, white = being linked, red ! = no door).
- A LOCKED GATE builds its own bars (4 DOOR tiles up) when placed (`MKP.afterPlace`).
- The sweep pins the dice per foe kind (seeded from the name): results no longer change run to run. Seeded, the bone
  goblin never engages in a plain wood, so it is out. Foes 138.
- `tools/maker-mechanisms.mjs` (in the suite).

## Done (2026-11-09, step 4: THE SCREEN + LEVEL SETTINGS - Daniel: "it's not clear how to access items")
- `src/maker-ui.js`: always-on GROUP TABS (ground, slopes & water, enemies, water enemies, items, mechanisms, hazards,
  tools) + a two-row ICON STRIP with < > pages, the hovered piece's name, a BUTTON BAR (play, undo, save, load, new,
  settings, help, slot) and a HELP card shown on the first visit. Every old key still works.
- SETTINGS: BACKGROUND (all 53 of the game's places), MUSIC (all 135 tracks; it plays while you choose), TIME OF DAY
  (day / dusk / night / cave), WEATHER (clear + 10 kinds), name, width. `doc.music / time / weather` ride with the
  terrain through save, load and undo; `MUI.applySettings` lays them over the background's own in `edLevelObj`.
- `tools/maker-settings.mjs` (in the suite): every background, time and weather plays; the music plays; save/load.

## Next (in Daniel's order: terrain, enemies + bosses, mechanisms)
1. (terrain: done above. Later: a path/range tool for platforms; today they use fixed settings.)
2. **Bosses** (Daniel: later): a BOSS group that places a boss with a generated arena (walls + floor + the `L.arena` it reads), and
   the minis with their trigger. Test each with a sweep like maker-sweep.
3. (mechanisms: done above. Later: plates that drop cages, timed doors, a lever that shuts as well as opens.)
4. Then the maker feel from the standalone try: mouse-first palette bar, share links (`#L=`), a help card, a
   title-menu row "THE MAKER" when Daniel says it ships.
