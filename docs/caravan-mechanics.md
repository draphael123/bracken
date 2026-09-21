# THE SUNKEN CARAVAN: mechanics built ahead of the level

Built on `claude/slopes` while THE BURNING VILLAGE was being built. Pure modules, none wired in. Proved by
`node tools/caravan.mjs` (22 checks, <1 s). Brief: `.claude/briefs/sunken-caravan.md`. Art: `src/redraw/desert.js`,
preview `docs/desert-art.png` (`node tools/desert-art.mjs`).

## SUNSTROKE: `src/sunstroke.js`
- State on the player: `P.sun = { v: 0 }` (never `P.heat`, which the pyromancer owns). Each frame:
  `const r = sunStep(P.sun, dt, shaded)`. `r.swim` 0..1 drives a screen haze/wobble; if `r.hurt`, call
  `damagePlayer(P.x, r.hurt, { unblockable: true, noKnock: true, name: 'SUNSTROKE' })`.
- `shaded` = `inShade(zones, P.x, P.y - 1) || roofShade(tileAt, P.x, P.y - P.h, isSolid-ish) || vultures.some(v => inShade([vultureShade(v, floor)], ...))`.
  `zones = shadeZones(L)` once at load, from `wagon`/`awning` ents (spans in `SHADE_OF`, the same pixels the art
  paints violet) and `L.shade` rects.
- Numbers: swim starts at 5.0 s of open sun, the first damage at 9.7 s (a 4.7 s warning); 1.2 s of shade resets it.
  The level rule is `SUN.maxWalk` = 7.5 s: no stretch of the road longer than that without shade. `sunStretches(route, isShaded)`
  gives the level tool its numbers. Put it in `tools/sunken-caravan.mjs` and make it fail over 7.5 s.
- Changed while testing: shade cooled over 2.2 s at first, and 7.5 s walks with 1.5 s stops crept up to harm. SHADE
  RESETS IT, as the brief says.

## QUICKSAND: `src/quicksand.js`
- Patches: `L.quicksand = [{ x0, x1, y }]` (px; `y` = the surface, drawn with `bakeQuicksand()`). Each frame, for the
  player (and anything else that should sink): `const q = qsPatchAt(L, P.x, P.y); if (q || P.qsDepth) qsStep(P, q, dt, { move, jumpPress })`.
  While `held`, skip the normal walk/jump for the frame. Survivable: it sinks to 12 px (chest-deep) and holds, never under.
- The verb: each jump press heaves 5 px, it sinks 11 px/s. Mashing 6/s gets out in 0.53 s, 4/s in 1.02 s, 2/s never.
  Near the edge you can wade back out if you turn at once. Below 5 px you can't walk.
- Changed while testing: out only at exactly 0 depth could never happen (the sand takes some back between presses).
  A heave that reaches the surface now takes you out.
- The Dune Worm's SWALLOW uses the same verb (its `pull` event says `quicksand: true`).

## THE DUNE WORM: `src/dune-worm.js`
- `const W = newWorm(arena, x)`; every frame, `for (const e of wormStep(W, { px, py, pGround, wrecks }, dt))` turns
  events into the game: `tell` (mark `!` yellow / `X` red, a sound, the pose), `hit` (a box, or `shots` for the spray,
  `blockable` on the spray only), `open` (THE OPENING: stuck in a wreck, x2 damage), `smash` (phase 2 takes the wreck), `stormOn`
  (the level's gusts and haze), `pull` (the swallow: the quicksand verb toward `toX`). Player blows go through `wormHurt(W, dmg)`,
  which does nothing while it is under the sand.
- Four told attacks: RIPPLE→BREACH X (tracks 1.0 s, then COMMITS to where you stand and always bursts exactly there
  0.45 s later), SPRAY ! (from the surface, blockable), LUNGE X (its shadow marks the landing, never within 48 px of a wall),
  SWALLOW X (a sinkhole under you, 0.9 s tell). Chain `ripple, spray, ripple, lunge, ripple, swallow`: the signature leads.
- Fight rules, proved: the longest untouchable stretch is 1.88 s (A5); every untouchable stretch is followed by an open
  one of at least 1.2 s (A6); the arena is 40 tiles (A7); every attack fires (A3). THE OPENING is caused: a bot that baits
  the breach into wrecks opened it 4 times, and a bot fighting in open sand never did. Phase 2 decoy ripples never bulge.
  A bot that moves off each tell as it shows takes 0 hits.
- Changed while testing: a far ripple used to burst short of its locked spot, somewhere you couldn't read, and a lunge
  aimed at a hero at the wall covered the whole corner.
- **Not proved: balance.** The bots are scripted, so "35 s vs 59 s" is a shape, not a number. The boss batch still owes
  the twelve wiring points (A8), a baker, and the real in-page pilot (21+ runs at normal health).

## ART BAKED AHEAD (render in Node, no browser)
- `src/redraw/desert.js` → `node tools/desert-art.mjs` → `docs/desert-art.png`: rock slopes, sky, mesas, dunes, quicksand,
  sandfall, wagon, awnings, bones, cargo, scrub, a dead tree, the standard. `SHADE_OF` = the sunstroke rule's shade pixels.
- `src/redraw/desert_foes.js` → `node tools/desert-foes.mjs` → `docs/desert-foes.png`: scorpion, vulture, sand goblin, THE DUNE
  WORM (+ its lunge body). Every tell and the STUCK opening pose has its own frame.
- `src/redraw/queue_bosses.js` → `node tools/queue-bosses.mjs` → `docs/queue-bosses.png`: THE GRAVE WARDEN (Burial rework),
  THE HEDGE WARDEN and THE GATE GARGOYLE (Witchlight Stair), from their briefs. Frames for every attack in the brief and each
  boss's opening pose (kneeling in a grave; the stump + regrowth; hanging from a broken slab). Known: the gargoyle's
  raised-wing frames (3, 6, 9) read as slabs and want a second pass in the Witchlight batch.
- `tools/node-canvas.mjs` is the shim that makes this possible: enough of a 2D canvas for px.js-style bakers (it throws on
  paths/gradients/text instead of drawing them wrong). Checked against the game's own turtle, eel and heron bakers.
