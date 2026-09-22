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
  the twelve wiring points (A8) and the real in-page pilot (21+ runs at normal health); the baker is done (desert_foes.js).

## ART BAKED AHEAD (render in Node, no browser)
- `src/redraw/desert.js` → `node tools/desert-art.mjs` → `docs/desert-art.png`: rock slopes, sky, mesas, dunes, quicksand,
  sandfall, wagon, awnings, bones, cargo, scrub, a dead tree, the standard. `SHADE_OF` = the sunstroke rule's shade pixels.
- `src/redraw/desert_foes.js` → `node tools/desert-foes.mjs` → `docs/desert-foes.png`: scorpion, vulture, sand goblin, THE DUNE
  WORM (+ its lunge body). Every tell and the STUCK opening pose has its own frame.
- `src/redraw/queue_bosses.js` → `node tools/queue-bosses.mjs` → `docs/queue-bosses.png`: THE GRAVE WARDEN (Burial rework),
  THE HEDGE WARDEN and THE GATE GARGOYLE (Witchlight Stair), from their briefs. Frames for every attack in the brief and each
  boss's opening pose (kneeling in a grave; the stump + regrowth; hanging from a broken slab). The gargoyle's wings
  were redrawn as fanned, swept-back bat wings (they read as slabs).
- `tools/node-canvas.mjs` is the shim that makes this possible: enough of a 2D canvas for px.js-style bakers (it throws on
  paths/gradients/text instead of drawing them wrong). Checked against the game's own turtle, eel and heron bakers.

## THE LEVEL, AS A GREYBOX DRAFT: `src/draft/sunken-caravan.js`
Not in LEVELS, nothing loads it: the level's STRUCTURE, measured before a build session spends time on it. `node tools/caravan-level.mjs`
checks it (all passing); `node tools/caravan-map.mjs` draws it (`docs/caravan-draft.png`). 547 x 40, 505 columns to the arena.
- Seven sections (F1): THE WAY DOWN 65, THE CARAVAN ROAD 91, THE OX LINE 76, THE DUNE SEA 73, THE TRADERS' CAMP 69, THE SINKING WAY 70,
  THE HOLLOW'S RIM 61, then THE WORM'S HOLLOW (40 tiles, three wrecks).
- Five landmarks (F2): THE LEAD WAGON (its tipped bed), THE GREAT RIBCAGE (climb the ribs, swing from the spine over quicksand), THE LONG
  SLIDE (slide, jump the basin at its foot), THE AWNING WINCH (F5: rolls shade out over the camp yard), THE SINKING CARAVANSERAI (in, up, out).
- The measure: reach gets all 3 silvers, 3 strays and the relic and reaches the arena (B1/F7); 8 checkpoints, widest gap 95 (B6); nothing
  in the air (B2); 18 shades along the road, no walk in the sun over 7.5 s; 3.8 foes a screen; 4.7 standable heights a screen, no flat screens.
- What the measure caught in the first layout: 60% flat screens; 17 s in the sun across the dune sea; a rock arch and the camp's canopy
  posts standing across the road as walls (both now drawn behind); the caravanserai's first floor 4 rows up (a jump is 3), which cut off
  everything after it. All fixed.
- The draft GARRISON row: scorpion 27, sand goblin 19, vulture 18, bandit 12, archer 3 (names to map to real spawn cases).
- `src/redraw/desert2.js` → `node tools/desert-art2.mjs` → `docs/desert-art2.png`: THE GREAT RIBCAGE (behind the draft's rungs and
  spine, its skull at the front), THE SINKING CARAVANSERAI's face, the arch pillars, the camp's winch and its great awning, the
  sandstorm's two dust sheets (tile both ways), THE WORM'S HOLLOW backdrop (the bore where it comes and goes), level 2's well and
  mud-brick walls, an oasis (real, or what a mirage shows), and UI: 4 sunstroke suns, the meter (a tick where the view starts to
  swim), 4 waterskin states, the desert's map node.

## MORE RULES: `src/desert-rules.js` (`node tools/desert-rules.mjs`, all passing)
- THE SANDSTORM (level 6's approach, the Skeleton King's phase 3): calm 3.2 s, WARN 1.4 s (the horizon browns, an arrow), GUST 1.6 s;
  the view closes to 120 px, never under 96; braced (holding block) a whole gust moves you 14 px, unbraced 195, jumping 254.
- SANDFALLS: under one a jump rises 6 px (you go round, or wait), walking at 55%.
- THE WATERSKIN (level 2): fill at a well (3 sips), drink = sunstroke cured, pour = a mud wall softens away or a fire goes out.
- MIRAGES: whole from 150 px, gone by 60; only a mirage shimmers.
## THE CREATURES' BEHAVIOUR: `src/desert-foes.js` (checked in `tools/caravan.mjs`)
- SCORPION alternates CLAW (! 0.5 s) and STING (X 0.75 s, over its back); VULTURE marks your spot with its shadow as its eye goes red
  and dives there 0.8 s later, then lands open; SAND GOBLIN waits as a mound, rises (the tell), cuts twice, burrows, comes up ahead.
  A fighter answering each tell in 0.25 s takes 0 from all three; one ignoring them takes 5-15.

## THE REST OF THE ARC, AHEAD OF ITS BATCHES (all on `claude/slopes`, none wired in)
- LIGHT (`src/light.js`, `node tools/light.mjs`): beams, mirrors, sun-doors, the dark, burning the dead, the Sun Temple's moving sun,
  and `solve()` - the fewest mirror turns that open a room, or null when it cannot be opened.
- THE SKELETON KING (`src/skeleton-king.js`, `node tools/skeleton-king.mjs`): the world boss on the light. His armour (60% until a
  beam burns him, then 200%) is a design choice to confirm with Daniel.
- LEVEL DRAFTS (`node tools/draft-level.mjs <name>`, `node tools/draft-map.mjs <name>`): sunken-caravan, well-town, red-gorge, all
  passing. Each draft names its own rule check (the Well Town: the mud walls are load-bearing and the water budget holds; the Red
  Gorge: every place in the flood channel is a short walk from dry rock, and the climb must cross it).
- THE SUN PRIEST (`docs/sun-priest-design.md`, concept frames `docs/sun-priest-concept.png`).
