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

## Done (2026-11-09, step 5: Daniel's three bugs)
- "The terrain moves oddly when I place things": resolveTiles threw ONE dice stream left to right, so an edit changed every
  roll after it and the dressing to the right reshuffled; and resolveTiles empties decor, but only a level load called
  placeLandmarks, so the big oak / beehives vanished on the first click. Now (made-by-hand woods only) each tile is seeded
  by its cell, landmarks keep their spot in `L.lmKeep` (shared editor <-> play) and come back after every paint.
- "Slopes don't load": `SLOPES_ON` was only set in loadLevel, so the editor never drew slopes. edMount/edSetTile set it.
- "Only one tile texture": GROUND MATERIALS - grass, cobble, shore rock, reef rock, city stone, castle stone, ship deck.
  `doc.mat` -> `L.mat`; resolveTiles reads the cell's material as the place whose skin it wears (`MAT_SET`).
- `tools/maker-paint.mjs` (in the suite). skins + ground-depth still green (real levels draw as before).

## Done (2026-11-09, BATCH 1 of Daniel's fix list)
- UNDO remembers the level's size/name/theme: undoing WIDER / NARROWER / NEW put the old grid into the new width.
- A piece can't be placed INSIDE the ground; painting ground over a piece removes it; a WATER kind out of water is
  placed but marked red ("NO WATER"), and the top bar counts problem pieces (`MKP.problems`).
- Tile redraws are batched: painting marks the level dirty, `edFlush` redraws once a frame (was once per tile).
- Getting around: mouse WHEEL scrolls (SHIFT: up/down), MIDDLE-button drag pans, the camera can scroll past the
  bars, and a MAP (minimap, bottom right, MAP button toggles) shows the whole level; click/drag it to go there.
- `tools/maker-editing.mjs` (in the suite).

## Done (2026-11-09, BATCH 2: piece settings + share links)
- SHIFT+CLICK a placed piece (or TOOLS > EDIT): a panel with its settings (`MKP.pieceRows`) - platform range / speed /
  width, lift height / trip time, foe facing, sign text, trap timings, roller facing / speed, key metal, gate metal and
  height (its bars regrow). The values are the engine's own ent fields: no game hooks. REMOVE deletes the piece.
  The editor draws each moving platform's whole track.
- SHARE copies `?maker=1#L=<code>` (save JSON, deflate-raw, base64url; a full test level ~600 chars); opening such a
  link loads the level into the maker. OPEN takes a pasted link or code.
- `tools/maker-pieces.mjs` (in the suite).

## Done (2026-11-09, THE FEEL BATCH - Daniel: "more like Mario Maker: simple, satisfying, clear what each piece does")
- PLAY is instant (no name banner, no iris); back in the editor the view is centred on the knight; PLAY HERE (button: the
  middle of the view; SHIFT+P: under the mouse) starts the knight there (`MKP.standIn`).
- GRAB AND MOVE: left-press a placed piece and drag it (never into the ground; a click that moves nothing leaves no undo
  step); a platform's / lift's gold HANDLE at the end of its track drags its reach.
- WHAT A PIECE DOES: the line under the strip shows the pointed-at (or held) piece's name, tags and one plain line
  (`MKP.describe`: foes from the bestiary's first sentence; the 15 starter foes have hand-written tags; tiles/things
  written in LINE); a card next to the mouse for a placed piece; REACH overlays (crusher drop, fire jets, vents, rockfall
  lines, foe facing arrows; strong for the hovered piece).
- READABLE: one row of 1.5x icons; ENEMIES is a 15-strong STARTER cast, MORE ENEMIES the rest; a RECENT row (last 8);
  the old Tab palette is retired.
- JUICE (`src/maker-juice.js`): placing pops and a drag climbs a pentatonic scale, erasing puffs dust, picking clicks,
  undo rewinds, play whooshes in and out; enemies idle-animate in the editor; the level's music plays ducked.
- `tools/maker-feel.mjs` (in the suite) - including: every palette piece must have a description line.

## Done (2026-11-09, EXTRAS: title row, test hero, hills, guide, examples, touch)
- THE MAKER is a title-menu row (MORE MODES; still none in the demo - tools/demo-cut.mjs pin updated to the new name).
  NOTE for the integrator: merging this lane SHOWS the maker to players.
- SETTINGS > TEST AS: any hero for a test run (switched in memory, saving held off for the run, your own hero back after).
- HILL brush: paint the ground's top; one-tile steps ramp themselves (`MKP.hillPaint`).
- HELP > START THE GUIDE (a five-step first level, each step ticked off by doing it) and three EXAMPLES
  (THE TOUR, THE MILL, THE CLIMB; `MKP.EXAMPLES`).
- A stroke paints every cell it crosses (quick drags left holes).
- TOUCH: one finger = the left button, two = pan, long press = a piece's settings; the ERASE brush takes pieces too.
- `tools/maker-extras.mjs` (in the suite).

## Done (2026-11-09, BOSSES)
- A BOSSES tab: 21 bosses (23 after the re-sweep below) that work in a made-by-hand arena (the list and every left-out boss, with the reason, are in
  `src/maker-palette.js` BOSSES). Placing one builds its ARENA round it (`MKP.arenaFor`: walls, trigger line, its home
  arena's music, tint and width - gathered from the levels in `edThemeList`); one boss a level; the goal gate opens when
  it falls (`gateAfterBoss`). The editor shows the arena, the trigger and a BOSS label where it waits.
- `tools/maker-bosses.mjs` (in the suite): each wakes, fights, falls to a blow and opens the goal (dice pinned per boss).
- Left out (32): most read their own level's machinery on spawn (the djinn, fog knight, colossus ...). To add one, give
  the maker that machinery, then add it to BOSSES and the sweep proves it.

## Done (2026-11-09, THE BUILDING BATCH)
- ELITE: SHIFT+CLICK a foe with an elite form (27 of them) > ELITE: bigger and tougher (main.js ELITE / eliteMake).
- CRATE CONTENTS: drop a coin, a HEART or a foe onto a CRATE: it comes out when the crate breaks (`doc.loot` ->
  `L.crateLoot`, read in breakCrate). The editor shows what each crate holds.
- HEART (`mend`) placeable (ITEMS). SWITCH (MECHANISMS): a lever with `mkSwitch` - every hit swaps RED blocks (solid at the
  start) and BLUE blocks (`doc.sw` -> `L.swCells`, `mkFlipSwitch`); a retry puts them back; empty ones show dashed.
- SETTINGS > HEIGHT: rows go on (or off) at the TOP, everything keeps its place (`MKP.resizeHeight`, 20-80).
- TOOLS > SELECT: drag a box; CTRL+C / CTRL+X / DELETE; CTRL+V then a click stamps it (tiles, materials, switch blocks,
  crate contents, crumble, whole pools and pieces).
- Not done: stacking foes on foes and wings/giant modifiers (the engine has no general form for them).
- `tools/maker-build.mjs` (in the suite), including: every elite form the palette offers spawns as one.

## Done (2026-11-09, CLEAR CHECK + GOALS + CO-OP - Daniel picked 1, 2 and 4 of the Mario Maker gap list)
- BOSS RE-SWEEP (Daniel: "see which bosses would be beatable"): `mkBossDown` makes a maker boss's fall always open the placed
  goal and cancel its home level's aftermath (the Chieftain's burning hall and Stockade escape). 23 of 53 are now in the
  palette (chief and owl joined). The table and the reasons are in `docs/MAKER-BOSSES.md`; re-run it with
  `node tools/maker-bosses.mjs --report`.
- THE CLEAR CHECK: a test run from START that reaches the goal stamps `doc.cleared = MKP.docSig(doc)`, a fingerprint of
  everything that plays. SHARE only works while it matches, and the button lights up when it does. Any edit un-clears; undo
  re-clears. A PLAY HERE run never clears. The win card's confirm goes back to the editor, not the map.
- SETTINGS > GOAL: reach the goal / DEFEAT EVERY ENEMY / COLLECT EVERY COIN (both hold the gate shut, showing "NOT YET: n
  LEFT") / DO NOT GET HIT / BEAT THE CLOCK 30-300 s (both restart the run). A HUD line shows how it is going.
- SETTINGS > PLAYERS: solo / an AI ally / a second player, for test runs. The campaign's own party is put back after.
- Save slots now load every extra through `MKP.setTerrain`, so a new setting can't be dropped by a stale field list again.
- `tools/maker-goals.mjs` (in the suite).

## Done (2026-11-09, A CLEARER PALETTE - Daniel: "Mario Maker groups pieces together; a generic tile that follows the asset type")
- LEVEL STYLE: swatches at the left of the GROUND tab (the background's own, grass, village cobble, castle, city, shore, reef,
  ship). Plain GROUND wears `doc.style` (`MKP.engineMat` marks every solid cell), so one click reskins the whole level.
  SHIFT+painting GROUND stamps the current style on the cell (`doc.mat`), and that cell keeps it when the style changes.
- One SLOPE piece (`'ramp'`): press at the low end and release at the high end. A drag at least 1.5x as wide as it is tall
  makes a gentle slope, otherwise a steep one; ground fills in under it and under its top. A click alone makes one ramp
  facing the ground beside it. There is a live preview while dragging (`MKP.rampCells` / `rampEnd`).
- Tabs grouped by role: GROUND (with STYLE) / LEDGES (stand-on, jump-through, ladders, moving platforms) / BLOCKS / ENEMIES ... / ITEMS /
  MECHANISMS (+DOOR) / HAZARDS (+SPIKES, WEB) / TOOLS. A group is a list of {cat, i}, so tiles and pieces share a tab.
  The old material grounds and the six slope tiles stay in TILES for old levels, but are not shown.
- Plainer names: JUMP-THROUGH LEDGE, BREAKABLE ROCK, WOODEN WALL, CRYSTAL LEDGE, with corrected one-line descriptions
  (crystal, reeds, plank, shelf and rail are all jump-through).
- Not styled yet: slopes are drawn by the engine's sand/grass slope kit, and ledges, ladders and doors keep one look.
  Making them follow the style needs per-place art in resolveTiles.
- `tools/maker-style.mjs` (in the suite).

## Done (2026-11-09, SHOW THE REAL OPTIONS - Daniel picked the browser, one-piece-per-idea and the ITEMS split)
- FIND (first tab) or a second click on any tab opens THE BROWSER: every piece with its name, every tab as a section, and
  ALL ENEMIES under what they do (first tag). Type to search name / tag / heading ("gob" finds 20). Wheel, arrows or PgUp/PgDn
  scroll; a click holds the piece and jumps the strip to it; ESC clears the search, then closes.
  Caveat: 89 of the 147 non-boss foes have no tag beyond FIGHTS, so they all sit under WALKERS AND FIGHTERS. Hand-sorting
  (like HAND_TAGS) would fix that.
- One piece per idea: one KEY and one LOCKED GATE (the metal is a setting), and one MOVING PLATFORM (new MOVES row: side to
  side / up and down; stepRow fills in the other mode's defaults). The old variant ids are in `MKP.HIDDEN_THINGS`.
- Settings are shown, not secret: the strip's line has a SETTINGS: ... chip, the hover card lists a placed piece's values,
  and a gear marks every placed piece with settings (foes only once set off their default).
- Tabs: FIND / GROUND / LEDGES / BLOCKS / ENEMIES / ALL ENEMIES (incl. water) / BOSSES / START/GOAL (START moved out of
  TOOLS) / PICKUPS / SWITCHES / HAZARDS / DECOR / TOOLS.

## Done (2026-11-09, ERASE / WHAT-SELECTS-WHAT / STYLE LIMITS / START GATE / BOSS LINK - Daniel: "build all five")
- ERASE: chips under the strip pick ONE CELL or BOX, and EVERYTHING / GROUND ONLY / PIECES ONLY / ENEMIES ONLY
  (`MUI.eraseMode`, `edPlace(..., what)`, `edEraseRect`). The box shows red while you drag. Right-click is still a
  one-cell erase of everything.
- What selects what: a see-through ghost of the held tile under the mouse (pieces already had one). Dashed lines run from
  each key to every gate of its metal, and a red line plus a padlock from a linked boss to the goal (levers and plates to
  doors were already drawn). SELECT shows "n TILES, n PIECES" and outlines the pieces inside.
- Style limits: `MKP.STYLE_BAN` refuses pieces that plainly don't belong (castle/city: reeds and wooden walls; ship: those
  plus rock face, breakable rock and poison; reef: wooden walls and ice; shore: ice). They are greyed with a slash in the
  strip and FIND, with a "NOT IN ... STYLE" chip. Switching to a style that bans tiles already placed asks first, and the
  tiles stay. Slopes are cut from the style's own ground (engineMat marks slope cells; `mkStyleSet` feeds cvTile).
- START GATE: the region's gate arch (EG.draw, silent) stands at START, in the editor and in play (`L.mkStart`, which stays
  at START on a PLAY HERE run).
- Boss and goal: a boss placed now gets `lockGoal: false`, so the goal is open. TOOLS > LINK the boss, then the goal gate,
  toggles the lock (`L.mkBossLocks`: shut until it falls). A boss with no `lockGoal` (older levels) still locks.
- `tools/maker-erase-links.mjs` (in the suite).

## Done (2026-11-09, WHO PLAYS IT + GUIDANCE + ARROW - Daniel: "import an existing character or have a demo character")
- SETTINGS > HERO: YOUR OWN (`'own'`, or null on older levels) plays with each player's saved hero, upgrades and all. A hero
  id is that hero on the STARTER KIT (campaign-kit `kitCfg(LEVELS[0], hero, lvl 1)`), the same for everyone. The save's
  PROG is structuredCloned before and put back after (saving held), and maker-hero checks it comes back byte-for-byte.
  New levels default to a set hero (knight).
- Clear check: only a set-hero run marks BEATEN. An own-hero level can be shared unchecked ("NOT CHECKED: EACH PLAYER
  BRINGS THEIR OWN HERO"); a set-hero level must be beaten first (`MKP.shareReady`).
- Guidance: a bottom-left checklist (START / GOAL / BEATEN or OWN HERO) with the next step, and a hint on an empty level.
- ARROW SIGN (DECOR): eight directions as a setting (POINTS), drawn by the maker in the editor and in play
  (`MKP.drawArrows`); scenery only.
- `tools/maker-hero.mjs` (in the suite).
- Later (Daniel agreed): SETS OF LEVELS played in order, one hero for the set.

## Done (2026-11-09, EMPTY NEW LEVEL + START + SCROLL + SLOPE SHADING - Daniel: "there's already terrain, which doesn't make sense")
- NEW (and a first visit with no save) is EMPTY: no ground, no goal, no START (`doc.start = null`), with the START tool in
  hand and the START/GOAL tab open. MKR.blank keeps the old floor so the checks are unchanged. The old 8-deep floor made
  a one-cell erase look broken: it took the top tile and the one below looked the same.
- START: `edSetStart` refuses a cell inside the ground; with nothing to stand on within 6 rows below, it lays three
  tiles of ground under itself. PLAY says where to find START until there is one. The checklist starts with START.
  Null-start guards are in edLevelObj, edPush, the loaders, docSig, resizeHeight, the minimap and the start-gate draw.
- SCROLL: four held arrow buttons at the top right of the level (`MUI.scrollHold`), and the bottom bar says how the
  wheel scrolls.
- SLOPES (Daniel: "looks like regular blocks with the slope overriding it"): in maker levels a slope cell no longer gets
  the ground's ambient shadow inside it, and the depth shading counts slopes as ground. The campaign's look is
  unchanged (L.custom only).
- `tools/maker-newlevel.mjs` (in the suite).

## Daniel's calls (2026-11-09)
- TRACKS / curved moving platforms: THORNROAD's engine should grow them natively first; the maker uses them after.
- BOSSES: some need their arena to be beatable at all - the maker only offers the ones the sweep proves beatable.

## Next (in Daniel's order: terrain, enemies + bosses, mechanisms)
1. (terrain: done above. Later: a path/range tool for platforms; today they use fixed settings.)
2. (bosses: 21 done above; the other 32 need their machinery): a BOSS group that places a boss with a generated arena (walls + floor + the `L.arena` it reads), and
   the minis with their trigger. Test each with a sweep like maker-sweep.
3. (mechanisms: done above. Later: plates that drop cages, timed doors, a lever that shuts as well as opens.)
4. Then the maker feel from the standalone try: mouse-first palette bar, share links (`#L=`), a help card, a
   title-menu row "THE MAKER" when Daniel says it ships.
