# claude/slope: SLOPE MOMENTUM + THE RUNNING SLIDE (Opus, design + mechanics, 2026-10-12)

Briefs: scratch/brief-slopemomentum.md (with the 10-11 update), scratch/brief-combat2.md section 2, scratch/common-1008.md, scratch/design-standard.md.
Base: origin/master 4fabe26c (BATCH86). Port 8857. Stopped before boss measuring, as asked: no boss or mash rows were re-stamped. No level data changed, so no row hash moved.

## WHAT IS BUILT

### 1. Slope momentum: every slope (src/slopes.js, main.js updatePlayer's walk)
- **Before:** running down a slope was a free 1.1x walk, and the extra was gone the frame you jumped (OVER_BLEED 400 px/s²). Running down a hill and jumping gave nothing.
- **Now:** with the stick held **down** the hill (no DOWN key; DOWN is the butt-slide), the legs reach their downhill 1.1. The hill then adds **90 px/s²** on a steep slope (45 on a gentle one), up to **1.3x the legs' cap** (`hillTop`).
  - Knight: 92 → 120 px/s in about two steep tiles or four gentle ones.
  - Pyro sprinting: up to ~140 px/s.
- **The speed is the hero's (`P.hillMo`):**
  - On the flat at the foot it bleeds at 80 px/s². A jump up to ~2 tiles past the foot still has most of it.
  - Through a jump it bleeds at 18 px/s² while the stick is held on.
  - Pulling back or letting go behaves as before.
- **The keep ceiling is one copy:** `SLIDE_KEEP` = 1.3 game-wide in `slideKeepAt`.
  - A butt-slide also keeps a speed it came in with, up to 1.3x the hill's top. That matters only when a fast run enters a gentle slope (158 kept vs. clamped to 140).
  - Glass keeps its own `RIDE_MOVE.GLASS_SLIDE_CAP` (also 1.3).
- **Slide-only hills (`slideOnly`):** where a slide is a REQUIRED answer, the run keeps the old free 1.1 and the slide stays the answer, as built.
  - The Sunken Caravan's required dune slides (the `L.duneSlides` hook, crest to foot; caravan2's hook unchanged, and a dune slide's own slide keeps 1).
  - The Glass Sea's glass (from `L.glassFrom`). With the glass's 1.3, a pyromancer's hill run alone cleared the slide gap; caught by tools/slope-momentum.mjs before it shipped.
- **It shows:** sand kicks up off the heels, and speed lines stream off him, more the faster he goes; they carry into the jump. Low-particle setting respected.
- **The reach model knows it (one copy, no hand numbers):**
  - src/reach-hero.js `hillSpeeds`: per hero, every hill run down at his own run (no sprint: the least he arrives with).
  - A `hill` launch flies that speed with the same air bleed.
  - src/reachcore.js offers it beside the run and the slide (`opts.noHill` for the old model).

### 2. The running slide (new src/run-slide.js; duck.js; main.js)
- **The input:** DOWN **pressed** while **running** on flat ground, at ≥ 70% of a run, with the stick held.
- **The move:**
  - A **0.45 s** slide on the hip at the pace he ran in with. It never adds speed, so it is not a faster run.
  - Hurt box = **duck height**: `duck.js` `duckBox` / `duckClears` / `seedOver` and main.js's two `P.ducking` blow checks read `P.lowSlide`. Level arrows, high blows and beams go over it.
- **Cost:** **6 wind**, then a **0.5 s cooldown**. It cannot be chained.
- **Into a foe's legs it is a LOW blow:** `hurtAs('sweep', …)`, which is the B14 SWEEP key, scaled by speed like the butt-slide.
  - A small foe is **TRIPPED** (the low sweep's own trip, `swingKindHit`) and you slide on.
  - A strong foe (elite, mini, big, heavy poise) or a boss takes it (strong ×0.7) and **stops you at his shins** (a step back, no flat-on-back).
- **Unchanged:**
  - The plain duck: DOWN standing still is the duck; DOWN held before the run starts is not a slide.
  - Drop-through: DOWN + jump on a board.
  - The low sweep: an attack in the slide ends it and *is* the sweep.
  - The butt-slide: the running slide starts only on the flat.
- **A jump** out of it is a running jump at its pace.
- **On a slope going down** it hands over: DOWN still held, the butt-slide takes its pace; let go, the hill run does.
- **The pose** is the butt-slide's `slide` frames for now (a per-hero running-slide pose = Sonnet art lane).
- **Teaching:** one floating line, once per hero per save, on the first one: "RUNNING SLIDE: LOW, AND UNDER HIGH BLOWS".

### New tools
- **tools/slope-momentum.mjs** (page): the per-hero real-key slope-jump probe the brief asked for.
  - It finds every slope take-off on every level with slopes: a hill whose foot runs out into an edge or a **quicksand** pit within 6 tiles.
  - It runs each hill for all 8 heroes from the crest at a run, and jumps from every other frame from the hill's last two tiles to the edge.
  - It does this **before** (`HILL_RUN.off`) and **after**, then prints speeds, furthest landings, and every landing spot only the momentum reaches (`NEW` = no hero landed there before from that take-off).
  - It fails if a hill does not give the speed, or if a row reached before is lost.
- **tools/run-slide.mjs** (page): the running slide's rules for all 8 heroes (14 checks each).

## MEASURED (all 8 heroes: knight, warden, pyro, paladin, pirate, reaper, geomancer, berserker)

Slope take-offs on 4 levels (oreroad, caravan, fair, glasssea; welltown, fallingtower and minecart have none that end in an edge). Speeds are px/s at the take-off; carry is tiles past the take-off, before → after.

| Hill | Knight / warden / pirate / berserker | Pyro | Paladin | Geomancer | Reaper |
|---|---|---|---|---|---|
| Fair 62..67 / 57..52 (6 tiles) | 101→120, carry 4.8→6.2 | 116→138, 6.4→7.1 | 92→108, 4.3→5.3 | 93→110, 4.8→5.6 | 81→96, 4.8→4.8 |
| Fair 367..377 (11 gentle) | 114→128, 6.4→7.9 | 125→142, 7.6→9.4 | 105→119, 5.8→6.9 | 107→121, 6.4→7.1 | 93→110, 6.7→6.4 (lands a row lower) |
| Caravan 179..176 / 182..185 (4) | 101→120, 4.3→5.1 | 116→137, 5.0→5.7 | 91→108, 3.9→4.6 | 93→110, 4.3→4.8 | 81→96, 4.3→4.3 |
| Caravan required dunes | unchanged (slide-only) | unchanged | unchanged | unchanged | unchanged |
| Glass Sea glass hill | unchanged (slide-only) | unchanged | unchanged | unchanged | unchanged |

**Landing spots only the momentum reaches** (the exam list; none is a designed exam on the route's direction, so none were fixed):

| Spot | Who | Direction | Read |
|---|---|---|---|
| Caravan 259..256 → (249,29) | pyro only | down-LEFT, against the route | Back over the teach dune's pit from its far side; backtracking |
| Caravan 440..439 → (433,30) | pyro | down-LEFT, against the route | Behind the 'beds' remix dune; backtracking |
| Caravan 440..439 → (434,30) | paladin, geomancer | down-LEFT, against the route | Same spot; no longer marked NEW (another hero landed there before) |
| Fair 367..377 → (385,27) | pyro | forward | One tile further along a floor (384,27) every other hero already lands on |
| Fair 107..104 → (96,27) | pyro | down-LEFT, against the route | Backtracking |
| Fair 57..52 → (48,29) | reaper, geomancer | down-LEFT, against the route | Backtracking |
| Fair 62..67 → (71,29) | reaper, geomancer | forward | A tile further on the lower floor, past an edge others already drop off |

Other gains (paladin and geomancer onto (576,13) and (227,29); reaper onto (555,22)) are spots other heroes already reached: legs catching up, not a skip.

## CHECKS RUN (port 8857, at most 2 page jobs)

| Check | Result |
|---|---|
| slopes.mjs (Node equivalence + slopes) | ok |
| slopes-trace.mjs (in-page frame equivalence, burial/canal/welltown) | ok, identical |
| reach-heroes.mjs (C: every level, every hero, route targets) | ok; output identical to the base run |
| slope-momentum.mjs (new; 8 heroes × every slope take-off, before vs. after) | ok |
| run-slide.mjs (new; 8 heroes) | ok |
| glasssea-slide.mjs, caravan-slides.mjs (the slide teaches stay real: a plain run still falls in, the slide clears with room) | ok, all heroes |
| slide.mjs (butt-slide) | ok |
| duck.mjs | ok |
| crouch-hint.mjs | ok |
| knock-into.mjs | ok |
| riposte.mjs | ok |
| stuck.mjs (static + runtime) | ok |
| glasssea-route.mjs, 8 heroes, god, no foes | walked, 0 deaths, all 8 |
| welltown-route.mjs | **broken on origin/master too**: a SyntaxError in its page script. Welltown is covered by reach-heroes C (all route targets, every hero), and its 4 slope tiles end in no edge |
| minecart-route.mjs, 8 heroes, god, no foes | rode it, all 8 |
| route-breaks.mjs | 89 findings, identical to origin/master |
| level-quality.mjs | 1 miss: MINECART's level-1 curve (cached row, 270% > 250); **the same on origin/master**, not this lane |
| fair-route.mjs, 8 heroes | **RED, and red on origin/master too** (see below) |

### Reds
- **fair-route.mjs is red on origin/master** (master's knight dies on the walk at x 100 / x 220, no god mode).
  - On this branch every hero's scripted hand gets further on the strike road (to the rick at 403). The rick's own trace is identical frame for frame on master and here: he wades it at 36 px/s and the hand's 400 frames run out. It is a tool problem, not this change.
  - On the low road the hand's `walk(96)` now ends on the pole row (row 25, the momentum took a walk-hop higher) instead of the ground (row 28), so its fixed `hop(101,25)` lands short.
  - The route itself holds: reach-heroes C reaches every Fair route target for every hero, and the probe loses no landing row.
  - The hand wants a rewrite (Sonnet). I did not touch it: weakening a test is out.
- **level-quality:** MINECART curve, pre-existing (above).
- **welltown-route.mjs:** a SyntaxError in its page script on origin/master too; not run. Its page script needs a repair (Sonnet follow-up).

## QUESTIONS FOR DANIEL (rec first; what is built = the rec)
1. **Slide-only hills.** The Caravan's required dune slides and the Glass Sea's glass keep the run at the old 1.1, so their "slide it" teaches stay real. Otherwise a pyro's run alone cleared the Glass Sea gap.
   - **Rec: keep (built).**
   - Alt: momentum there too, and widen those pits.
2. **The numbers.** 1.3x the legs; +90 px/s² steep / +45 gentle; air bleed 18, flat bleed 80. A knight's jump off a 6-tile hill goes 4.8 → 6.2 tiles; a 2-tile gentle hill gives about +0.4.
   - **Rec: as built.**
   - Bigger feel: 1.4x, but more spots open up for the pyro.
3. **The reaper barely feels it.** His legs are 0.8x on the ground but 1.0x in the air. 1.3x his ground pace (96) is only just over his normal air pace (92), so his hill jump carries about the same as before. The geomancer gets a smaller share too.
   - **Rec: keep his own legs (built: heavy on his feet is his identity).**
   - Alt: base his hill top on his air pace (→ ~120).
4. **The running slide's numbers.** 0.45 s, 6 wind, 0.5 s cooldown, needs 70% of a run; a strong foe stops you at his shins (no flat-on-back like the butt-slide).
   - **Rec: as built.**
5. **A running slide into a boss** is a full SWEEP blow: it opens a sweep-keyed boss, and the standard boss rules apply. The butt-slide still uses the retired x0.05 chip on bosses (B15).
   - **Rec: the sweep (built).** Convert the butt-slide's boss chip in the B15 chip sweep (not done here).
6. **The backtracking landings** above (pyro back over the Caravan teach pit and others).
   - **Rec: leave (built).** Every one is against the route.

## FOLLOW-UPS (not done here)
- **Sonnet art:** a per-hero running-slide pose (it uses the butt-slide frames now).
- **Sonnet fix:** the tools/fair-route.mjs hand (its walk ends on the pole row now, and it times out wading the rick; red on master too) and tools/welltown-route.mjs (a SyntaxError in its page script on master).
- **Boss tuning (the flask lever):** boss rows are untouched. The human bot (src/lab.js) presses DOWN with an attack for its sweep. The attack is handled first, so it slides only when the attack is refused (no wind). The mash bot presses DOWN only in water.
