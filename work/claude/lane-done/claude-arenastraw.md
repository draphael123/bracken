# ARENA STRAW CAST lane - claude/arenastraw (11-03), off claude/arenayardart 6edc6f3c
Worktree bracken-lanes\bracken-arenastraw. Not merged, not deployed.

## What changed
- `src/redraw/arena_straw.js` (new): three skins baked from the game's own frames, arena palette (arena_pal.js blue/crimson + burlap/straw/rope):
  - `strawsword` (slow station): sack head with button eyes and straw tufts, burlap tunic with a royal-blue patch, straw hands, WOODEN sword, PADDED canvas shield.
  - `strawflash` (flash station): the same man with a CRIMSON chest sash and a crimson neck-rope, so the stations tell apart.
  - `strawbow`: the archer's frames, sack hood, button eyes, straw legs, short wooden bow (replaces the goblin archer).
- `src/chars.js`: `bakeSwornSword(X = {})` takes an optional reskin (palette / head rows / blade letter); no argument = byte-identical old sprite. `bakeArcher(over)` already took a palette.
- `src/main.js`: import + one bake line; bestiary 'seen' skips `straw*` skins.
- `src/arena-yard.js` (data): `reskin: { swornsword: 'strawsword', archer: 'strawbow' }` (the Kingswood/Sporewood L.reskin table) + `cnSkin: 'strawflash'` on the flash ent. Real swornswords/goblins elsewhere untouched.
- AI, timing, hitboxes, sizes, frame counts, anchors untouched (same frames; the white tell frame bakes from them as before; glint is an overlay).
- `tools/arena-straw-shots.mjs` (new): screenshots + asserts (skins applied, no other foe reskinned, flash fires on the flash dummy only, slow has no glint).

## Checks
- tools/arena-yard.mjs build,board,safe,perfect,arrows,zone,coop,entry: all ok, 77/77, no page errors (log scratch\lane-reports\arenayard\arena-straw-run.log).
- tools/arena-straw-shots.mjs: all ok. Screenshots scratch\lane-reports\arenayard\straw-{sword-slow,sword-flash}-{idle,tell,cut,flash}.png, straw-bow-{idle,draw,full,loose}.png.
- No text changed (textfit not needed). No Python (art-rules.py not run). Full suite / gate not run.

## Notes / owed
- The flash tell is the game's own white frame + "!" over the same silhouette (identical shape, plus straw tufts); readability is unchanged by construction. Eyeball in the flash shots.
- The soldier / shield in the guard pen are still the game's own art (not in this brief).
- The yard's dummies carry a thin orange outline halo in the shots: that is the existing yard marking, not from this lane.
