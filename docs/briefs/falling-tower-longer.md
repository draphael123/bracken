# THE FALLING TOWER, LONGER: a redesign brief (Daniel, 2026-09-21)

> "the level can be a bit longer, and should use gravity mechanics like the level before, and still have some platforming over the
> pendulums that were in the level earlier. It can also have fewer zombies and a new enemy type - floating books that attack the player."

Greybox: `src/draft/falling-tower.js`, all checks passing (`node tools/draft-level.mjs falling-tower`, map `docs/draft-falling-tower.png`).
The new foe: `src/tome.js` + `src/redraw/tome.js`, proved by `node tools/tome.mjs` (sheet `docs/tome.png`).

## What changes
- **Longer:** seven floors instead of five, 306 rows instead of 240.
- **THE READING ROOM (new, floor 2): the Folly's gravity.** The tiers climb halfway to a glyph. Stand on it and the room turns over:
  you fall UP onto the underside of a stone gallery, walk the ceiling to its gap, fall up through it, walk the ceiling to a second
  glyph, and the room rights itself, dropping you onto the gallery. A coin trail shows the ceiling walk. **The flip is load-bearing:**
  without it nothing above the gallery can be reached.
- **THE PENDULUM GALLERY (new, floor 4):** three clock pendulums (`swing` movers, as in Marsh Wood and Kingswood) cross a 21-tile gap
  over a spiked gear pit, with a wall stair between each ride. **Load-bearing:** without the swings the upper landings and everything
  over them are out of reach.
- **Fewer zombies:** 3 zombies and 1 husk in the tower (the live one has 8 and 6).
- **THE TOME, a floating book:** 28 of them, on every floor. It drifts by its shelf; within 7 tiles it tells a yellow `!` (covers
  flung open) for 0.6 s, locks your spot, and darts there without steering. The shield SHUTS it (it drops, double damage for
  1.5 s, 2.5 s on a perfect block); a step under a steep dart or a jump over a flat one also answers it. It hurts only mid-dart.
  18 hp: three light blows, or two once it is shut (the feel probe found three in four common fights end in one swing). A shelf of
  them winds up one at a time.

## Wiring (for the build, after the Burning Village)
- Replace `buildTowerAscent`'s floors with the draft's (the draft keeps the live tower's own floors 1, 3, 5-7 as they are).
- `L.mage` must stay set: it is what makes the glyphs turn the room over (main.js `setFlip`, the glyph prop ~9795).
- The tome: a spawn case, `tomeStep` per frame with one shared token per level, `tomeBlocked` from the block code on a 'blocked'
  result (perfect when the parry fired), `tomeHurt` for damage, `TOME_F`/`tomeFrame` for the art, a bestiary row, the A8 wiring points.
- Re-run `tools/elites.mjs` and the ELITES coordinates for the level: lengthening it shifts every hand-placed row.

## The purple screen at the boss (the live bug, 2026-09-21)
Boarding the carpet wakes the Archmage. In `src/undead-mage.js` `undeadFrame` maps `wake` to `F.idle`, the whole idle animation,
instead of one frame of it. The generic enemy pass then draws him with no frame and `drawSet` throws. It throws after
`render()` has zoomed the canvas (`g.save(); g.scale(z, z)` for the boss intro) and before its `g.restore()`, so the zoom
compounds every frame. Measured on the live site: the canvas scale reached 210,906x, a single sky pixel filling the screen and the
HUD, while the game (music, sound) runs on. **Fix:** `wake: F.idle[Math.floor(e.anim * 2.5) % 2]`, plus `g.setTransform(1, 0, 0,
1, 0, 0)` at the top of `render()` so one bad draw can never poison the frames after it.
