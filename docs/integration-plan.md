# Integration plan: `claude/slopes` into the game (written 2026-09-22)

Everything on `claude/slopes` is NEW files, built and checked in Node, none of it wired in. This plan brings the parts worth shipping now
into `codex/playtest-0919`, lowest risk first. One session only, in the main repo, after the Witchlight Stair is committed and deployed.

**Find code by searching for the quoted strings, not by line numbers:** main.js and level.js have moved since these notes were written.

## 0. Before anything
- Main repo: `C:/Users/danie/Documents/Codex/2026-09-19/files-pasted-by-the-user-you/bracken`, branch `codex/playtest-0919`.
- Check that no other session is working in it (ListAgents, `git status` clean, `git log -3`). If one is, stop and ask Daniel.
- `git fetch origin && git merge origin/claude/slopes`. Checked 2026-09-22: **clean**. The only file both branches touched is
  `src/redraw/queue_bosses.js`, and the two copies are byte-identical. The merge brings ~120 new files and changes nothing in play.
- Run `npm run check` ALONE (~18 min, nothing else running, ports 5991-5999) as the baseline. Note any failures that were already there.

## 1. THE PURPLE SCREEN at the Falling Tower boss (LIVE BUG: do this first, deploy it on its own if you can)
Boarding the carpet wakes the Undead Archmage. In `src/undead-mage.js` `undeadFrame` maps `wake: F.idle`, the whole idle ARRAY, as a
frame. `drawSet` throws on it after `render()` has zoomed the canvas (the `g.save(); ... g.scale(z, z)` for `z > 1`) and before its
`g.restore()`, so the zoom compounds every frame until one sky pixel fills the screen (measured: scale 210,906x), HUD included, while
the game and music run on.
- Fix: `wake: F.idle[Math.floor(e.anim * 2.5) % 2]`.
- Guard: at the top of `function render()`, `g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;` so one bad draw can never poison
  the frames after it.
- Prove it: load `fallingtower`, `BK.start()`, `BK.tp(34, BK.L.skyRow - 1)`, hold right ~40 frames with `BK.step(1)` (step RENDERS;
  `sim` does not), then die (`BK.P.hp = 0`) and step 600 more frames. `BK.g.getTransform().a` must stay 1 and no step may throw.
  Before the fix the step at the board throws `Cannot read properties of undefined (reading 'width')`.

## 2. THE ART (no game logic: the safest, biggest visual win)
Each is a baker already built to the game's own shapes; wiring is a case in the backdrop setup and a palette change per level.
Reference renders: `docs/crag-redress.png`, `docs/redress2.png`.
- **The backdrop setup** is where `BG = { sky: ...` is built (search `pal.sky === 'crag' ? ART.bakeSkyCrag(VH)`, and
  `ART.bakeFarCrags(320, 90, 1)`, `ART.bakeMidCrags(480, 140, 2)`, `ART.bakeNearCrag(640, 300, 3)`). Add cases:
  - `src/redraw/crag_redress.js`: `bakeCragSky/Far/Mid/Near(theme)` for theme `'scree' | 'hanging' | 'storm'` (sizes match the crag
    bakers exactly: sky 16xVH, far 320x90, mid 480x140, near 640x300).
  - `src/redraw/redress2.js`: `bakeRedressSky/Far/Mid/Near(theme)` for `'castle' | 'undercrown' | 'mage' | 'monastery' | 'shopWood' |
    'shopCrag' | 'shopSea'`. Indoor themes return NO sky: their far layer is 320x180, the whole back wall - draw it as the sky.
- **The ground tiles**: in `resolveTiles`, the `SET2 = shipT ? ... : reefT ? REEF : shore ? SHORE : ...` chain. Add an arm for
  `L.palette.set === 'crag:<theme>'` / `'redress:<theme>'` using `bakeCragGround(theme)` / `bakeRedressGround(theme)` (bake once and
  cache like `VILL`). Both return the SET2 shape: `top['00'|'01'|'10'|'11'][4]`, `edge[...][2]`, `fill[4]`, `silt[3]`, `wet[3]`,
  `ledge[3]`, `ledgeL`, `ledgeR`. `mage` and `monastery` return null: those levels keep their own tiles.
- **Dressing**: `GROUND_KITS[levelId]` from `CRAG_KITS[theme]` / `REDRESS_KITS[theme]` and the props from `bakeCragProps` /
  `bakeRedressProps` (add them to the `source` lookup in the dressing loop, or to `PROP`).
- **The levels (level.js palettes):** scree -> crag 'scree'; hanging -> 'hanging'; storm (Stormhold) -> 'storm'; crown (Highcrown) ->
  'castle'; undercrown -> 'undercrown'; mage and fallingtower -> backdrops 'mage'; spire (the Monastery) -> backdrops 'monastery';
  shop / shopCrag / shopSea -> 'shopWood' / 'shopCrag' / 'shopSea'. **Leave Burial alone** (just reworked in d7d93ae).
- Check: `npm run check`, then a screenshot of each changed level at three checkpoints (the audit's method: `docs/visual-audit.md`),
  side by side with `docs/audit/sheet-*.jpg`. Foes must still read against the new skies (step 4's measure).

## 3. THE FOES (sprite swaps: same frame indices, anchors and hit boxes, checked against the game)
- **`src/redraw/foes_v2.js`**: bat, zombie, apprentice, wight, thief, hedge knight, crow, petrel, wasp, snuffer. `FRAMES_V2[t]` gives
  each one's baker, what its old frames still mean, its NEW frames (hurt, death, second steps), and the frame-pick line to change
  (search `e.t === 'bat') { frame =` etc.; the zombie and apprentice pick is `deadFrame` in `src/buried-dead.js`). Swap the `SPR.<t> =`
  assignments to the v2 bakers; then add the new frames to each pick (hurt when `e.flash > 0.06`).
- **`src/contrast-rim.js`**: on level load, for each foe type the level spawns, `needsRim(bodyL, backdropHistogram) > 0.45` ->
  `SPR[t] = rimSet(SPR[t], backdropL)` for that level (restore on leaving). The ones that needed it in the audit: bat (Falling Tower),
  snuffer (Lamplit Street), lamprey (Keep), petrel (Causeway), spider (Stormhold), urchin (Reef). `docs/sprite-quality-audit.md`.
- **`src/death-fx.js`**: `deathBurst(materialOf(e.t), e.x, e.y, dir, seed)` beside `corpses.push(c)` at the end of the kill function,
  `stepDeathFx(fx, dt, floorAt)` in update (floorAt: the floor under x), `drawDeathFx(g, fx, cx, cy)` after the corpses in drawWorld;
  `SFX.clatter()` on a particle's `clack`. At most 24 pieces a death, all gone in 2.5 s.
- Check: `npm run check`; `node tools/death-fx.mjs`; play a fight with each changed foe.

## 4. THE LONGER FALLING TOWER (a level change: last, and only if the rest is green)
`src/draft/falling-tower.js` (the greybox, `node tools/draft-level.mjs falling-tower`), `src/tome.js` + `src/redraw/tome.js`
(`node tools/tome.mjs`), brief `docs/briefs/falling-tower-longer.md`. Seven floors (adds THE READING ROOM - the Folly's gravity glyphs
- and THE PENDULUM GALLERY - three 'swing' movers), 3 zombies instead of 14, 28 floating books.
- Port the two new floors into `buildTowerAscent` (tower-ascent.js) keeping the live floors as they are; `L.mage` must stay set (it is
  what makes the glyphs turn the room over); the tome needs a spawn case, `tomeStep` with one shared token per level, `tomeBlocked` from
  the block code on a 'blocked' result, `tomeHurt`, `TOME_F` frames, a bestiary row and the A8 wiring points.
- Lengthening the tower shifts every hand-placed row: re-check the GARRISON row, ELITES coords (`tools/elites.mjs`), the checkpoints,
  and the carpet arena (`L.arena`, `carpetAt`, `skyRow`). `npm run check` must stay green.

## 5. THE COMBAT TUNING (`docs/combat-tuning.md`: measured, ready to apply)
- **Fodder health x2.4, nothing else**: sprig, shield, cutlass, crab, scout, archer, harpy (a per-type multiplier on their `EHP` entries,
  or in the tier scaling for these types - not a global scale: that balloons the hedge knight, sworn sword and tide guard).
- Before shipping, run `BK.fightLab({ levels: ['wood', 'spire', 'waymeet'], heroes: [...], reps: 2 })` for ALL SIX heroes, before and
  after (only the knight and the Freebooter were measured): no hero may start dying where it did not, and the fodder should take 2-4
  blows in the middle and late game. (A hidden browser pane throttles the lab's timers; drive it in a visible pane, or see the note in
  combat-tuning.md.) Then measure the other common types (sporeling, lurker, thief, hound, miner, bat, snuffer, sailer, soldier) the
  same way and give them the same treatment where they die in one swing.
- **Investigate, don't tune: the Freebooter kills fodder in 0.28 s whatever its health** (even 126 hp). Find the action that does it
  (a finisher? the pistol?) and report whether it is intended before changing anything.

## 6. Then
Hold every changed level to `docs/art-direction.md` (`python tools/art-rules.py` on fresh screenshots of it). Daniel playtests the
changed levels. After that, the enemy animation work continues (`docs/animation-audit.md`: the next ten foes), and the desert arc
(slopes phase 2, `docs/slopes-integration.md`). The heroes do not need an animation pass (`docs/hero-animation-audit.md`): only a
3-4 frame jump arc and a landing if time allows.
