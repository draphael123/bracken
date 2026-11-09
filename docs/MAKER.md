# THE MAKER (lane `claude/maker`)

**Daniel, 2026-11-09:** the level editor comes back as its own mode — a Mario-Maker-style level maker that plays
with **THORNROAD's real combat**, with **slopes and terrain**, the **full enemy cast**, **bosses** and
**mechanisms**. This lifts the "editor is PARKED, add nothing to it" rule (docs/INTEGRATOR.md §1) **for the
maker only**; Boss Rush stays parked.

(An earlier standalone try, `draphael123/thornroad-maker`, rebuilt a simple platformer outside the game. Daniel
wants the real combat, so the maker lives here now; that repo is reference only — its mouse-first editor, share
links and help card are worth porting.)

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

## Next (in Daniel's order: terrain, enemies + bosses, mechanisms)
1. **Terrain brushes**: WATER (pools are rects on `L.pools`, not tiles — a rectangle brush), crumbling bridges
   (`crumbleInit`), moving platforms (`mover` ents need a path tool). Then the water foes come back.
2. **Bosses**: a BOSS group that places a boss with a generated arena (walls + floor + the `L.arena` it reads), and
   the minis with their trigger. Test each with a sweep like maker-sweep.
3. **Mechanisms**: lever → door, key → lock gate, pressure plate, push block, crusher, rockfall — needs a LINK tool
   (click a lever, then the door it opens).
4. Then the maker feel from the standalone try: mouse-first palette bar, share links (`#L=`), a help card, a
   title-menu row "THE MAKER" when Daniel says it ships.
