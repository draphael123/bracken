# claude/desertkit - THE DESERT KIT (11-05, unattended, code-only)

Branch `claude/desertkit` off master 42a1d4cdb (rel144). Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-desertkit`. NOT merged, NOT deployed.
Built from scratch/plan-desert-1105.md section 3 ("systems: build once"), in the waterkit's shape (standalone modules + a data-only lab room + node tests + docs).
**Extended, not rebuilt**: the plan's audit is right that SUN/SHADE (sunstroke.js + sun-hands.js + drain.js), SINKING SAND (quicksand.js), SANDSTORM + MIRAGES
(desert-rules.js) and LIGHT (light.js) already exist. Each new module sits on its old rule (a test proves the defaults are the old rule frame for frame) and adds
the data layer, every seat/foe, and a lint.

## What changed
| file | what |
|---|---|
| `src/sun-kit.js` (new) | HEAT/SHADE on sunstroke.js: profiles per level/box (open, GLARE x1.25, DUSK x0.6, NIGHT, INTERIOR), WATER cools x2.5 faster than shade, HOT boxes fill x1.6, tile shade boxes, SUNSTRUCK read at full (= the existing drain's top rate 4.5%/s, floor 1 hp: never kills, never stuns - A13), every seat its own meter, `sunFeed` = THE DESERT PRIEST's radiance hook (x1.5 in the sun, x1.8 on hot glass), `lintSun` (sun walks <= SUN.maxWalk scaled). |
| `src/storm-kit.js` (new) | SANDSTORMS on desert-rules: `L.storms` with per-storm cycle/push/sight/dirs/phase, told WARN (>= 1.2 s), per-BODY carry (4 seats + foes each own remainder, whole px, io.move = moveBody), weights (foe 0.6 / heavy 0.25 / anchored 0), LEE boxes, shots bend, sight per seat (`stormView`), phase-change events for the tell, `lintStorms`. |
| `src/sink-sand.js` (new) | SINKING SAND on quicksand.js: `L.sinkSand` pits (= qsStep exactly, player's clock) + DUNE SAND (THE GREAT DUNE: footing while you run, a told ripple, slow 0.35 s and it takes you, same jump verb out); FOES held (no walk, may still strike), sink on weight, haul out after 2.4 s (heavy x2) the way they face, SAND_KIN never sink, never killed; `lintSinkSand`. |
| `src/mirage-kit.js` (new) | MIRAGES on desert-rules: ledge/door/oasis/wagon/shade, fade far->near (desert-rules' numbers), always a little shimmer + more as you come, real things never shimmer, never footing, nearest live seat fades it and it comes back, none at night/indoors/in a gust, `seen` once; `stalkerLook` for the SUN-SHADE STALKER (0.08 in glare, plain in shade, 0.4 s told shimmer); `lintMirages` (a trick never a trap: the fall lands, climbable, no spikes). |
| `src/sun-puzzle.js` (new) | SUN/LIGHT PIECES on light.js: `L.sunRooms` with sources (or the temple's moving windows), mirrors turned by ANY blow or shot box (one turn a swing), SUN-DOORS sun-only (latch, or hold: told then shut, never on a body), PRIEST CACHES his beam only (optional by lint), LAMPS either; shut leaves are opaque (chains open in one frame); `gridOf` for collision; `sunBurn`; segments for beam-path; `solveRoom` + `lintSunRooms` (solvable, not pre-solved, mirrors strikeable from footing, cache beamable from footing). |
| `src/desertkit-lab.js` (new) | THE SUN COURT (LAB), 72x26, data-only, on no level list: overhang, oasis pool, sun-glass, storm with a lee, quicksand pit, dune sand, mirage bridge/door/oasis + the real well, a temple hall with two mirrors, a sun-door, a priest cache, a lamp. `labLevel()` builds its grid. |
| `tools/sun-kit.mjs`, `storm-kit.mjs`, `sink-sand.mjs`, `mirage-kit.mjs`, `sun-puzzle.mjs` (new) | Node-only proofs. |
| `tools/check.mjs` | five own lines after arena-polish (not after powder-monkey: the waterkit's lines sit there). |
| `docs/desertkit.md` (new) | the level API per module + the Desert Priest hook + a main.js wiring sketch. |

No main.js / level.js / sun-hands / quicksand / desert-rules / light change: nothing live moves.

## Checks run (Node only, one at a time; no browser)
- `node tools/sun-kit.mjs` - **79 ok** (open = sunstroke frame for frame; profile fill/cool times; water < shade/2; full = SUNSTRUCK at 4.5%/s and two minutes of it leaves 1 hp; exposure precedence; 1-4 seats x 11 heroes; the priest's feed + no immunity; lint clean + 6 broken cases + LEVELS (0 declare it yet)).
- `node tools/storm-kit.mjs` - **48 ok** (default = desert-rules 40 s frame for frame; >= 8 gusts a minute each told >= 1.2 s; sight floor; braced < 16 px / open / air; 4 seats + 4 foes own carries; lee; shots; weights; view per seat; 11 heroes hold braced; phase offset; lint + 8 broken).
- `node tools/sink-sand.mjs` - **63 ok** (pit = quicksand.js; chest-deep never under; 6 taps/s out < 1.5 s and 2/s never for 11 heroes; 1-4 seats; Game speed 0.5; dune footing/ripple/grace/verb; 11 heroes cross the dune; foes held/out/heavy/kin/dead; lint + 6 broken).
- `node tools/mirage-kit.mjs` - **66 ok**; `node tools/sun-puzzle.mjs` - **77 ok** (lab solves in 2 turns; the HARD RULE both ways; strikes; hold door waits for the body; chains; moving sun; burn; gridOf; lint + 8 broken).
- `node tools/dangling-paths.mjs` ok; `node tools/comments.mjs` no swallowed code; `node --check` every new file. NOT run: tools/check.mjs (per brief), any page tool.
- New filenames checked vs ad-block words (ad/admiral/banner/track/pixel/promo/analytics): clean.

## Browser owed
None opened (release gate running). Owed, one look, by the first lane that wires the kit (docs "Wiring sketch"): hang the lab on the dev level list and feel - the SUNSTRUCK read + HUD, water cooling, the storm tell/brace/vignette with P2, the dune's ripple before it takes you, a bandit held in the pit, the mirage shimmer reads at 150 px on the glare palette, the mirror strike for a melee hero AND the ranger's shot, the sun-door + the priest cache with `?priest=1` on the claude/desertpriest integ.

## Art owed (placeholder now: none drawn - the kit returns numbers)
Hot sun-glass floor (shimmer + glow), oasis pool cool ripple, SUNSTRUCK hero tint/HUD word; storm vignette + sand streaks + the lee rock; dune-sand ripple ring and the held-foe struggle pose; the five mirage sprites (bridge, door, oasis, wagon, false shade) with their haze; the stalker's glare outline + commit shimmer; mirror (bronze, '/' and '\' states, struck flash), sun-door leaf (white limestone + gold), cache niche (silver glint), sun-lamp lit/dark, the eye glyph on each receiver. No wood, no goblins anywhere in the kit or lab.

## Questions for Daniel (recommended answer first; I built the rec)
1. **SUNSTRUCK at full** - REC: keep the existing penalty (your 10-08 drain: 4.5%/s max at full, floor 1 hp, no stun) and just NAME it on the HUD ('SUNSTRUCK - FIND SHADE'). Alt: add a second penalty at full (e.g. stamina regen halved) - a new rule, not built.
2. **Water cooling** - REC: wading/swimming/an oasis pool cools 2.5x faster than shade (full -> cool in ~0.5 s); the waterskin's DRINK stays the instant cure. Alt: water = shade (no faster).
3. **The Priest's sun feed** - REC (plan Q4): no immunity; radiance fills x1.5 in open sun, x1.8 on hot glass. Alt: x1.25 (a softer trade).
4. **Foes in sinking sand** - REC: held (no walk) but may still strike, out after 2.4 s (heavy 4.8 s); sand kin immune; sand never kills. Alt: a held foe is OPEN (takes x1.25) - stronger lure, may be farmable.
5. **Mirror turns** - REC: any blow OR any shot turns it (ranged heroes and every seat can work a room). Alt: blows only (forces the climb).
6. **Mirages and co-op** - REC: the nearest live seat fades it on the shared screen, it returns when all walk away. Alt: once faded, gone for the visit.
7. **Who wires the kit?** REC: each first-user level lane wires its module (Ksar 3 / mirage lane 11-06 = mirages + stalker; Great Dune = dune sand; Colossus 4 / KP / Temple = sun-puzzle with beam-path drawing the segs) and folds the old hand-run storm/quicksand when its level is next touched. Alt: a small wiring lane before 11-07.

## Final tip
Read docs/desertkit.md, copy a block from src/desertkit-lab.js, and run the five `node tools/<module>.mjs` (pure Node, seconds each): any level that declares `sunKit` / `storms` / `sinkSand` / `mirages` / `sunRooms` is linted automatically.
