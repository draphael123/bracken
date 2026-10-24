# claude/burning3 - THE BURNING VILLAGE 3 (brief approved 10-23: "use water better in the level, the fire more intense, falling debris at points")

Base: master 7f5e3b5e (BATCH118 live). Branch claude/burning3. Level pass + art in the same lane (the art is code-drawn pixel art in the level's own style: no art lane needed, nothing greybox). Sonnet lane.
Pyromancer fight: UNCHANGED (no soft-lock found; his square keeps its own sky, ambience, fire and racks; SOAKED is switched off the moment his fight starts).

## What was built (all of it in the real level; rules in `src/village-hands.js`, placement in `src/burning-village.js`)

### 1. WATER AS THE LEVEL'S VERB - three NEW told uses, each taught safe -> tested -> remixed -> exam
| verb | taught (safe) | tested | remix / exam |
|---|---|---|---|
| BURST a tank: strike it, a drawn WAVE (water wall with a foam crest) rolls both ways, puts out the straw / grid fire, holds flame pillars out 14 s, cools hot doors, DOUSES burning goblins, puts out wisps, KNOCKS FOES OVER (stagger 1.8 s + a hop), and soaks you | RAIN BARREL at 120 in the burning yard (r 5, sign at 119; foes and lit straw round it) | RAIN TANK at 219 on the Long Street (r 9, sign at 216; the thief + garrison) | WATER TOWER at 425 in the well yard (r 15, sign at 420) - the exam's landmark, 66 px tall |
| SOAKED: 10 s of dripping (drawn drip, a blue timer bar over the head, the line SOAKED: FIRE CANNOT BURN YOU), the village's fire does not burn a soaked hero: pillars, ember pits, grid fire, heaps, OIL FIRE. Ends where the Pyromancer's fight begins | strike the TROUGH at 106 (sign 108): the OIL pool (3 tiles) on the first ledge of the croft house's gable stair - optional; coins on the ledge above + a SILVER on the roof pay the climb | trough at 233 -> 6 tiles of OIL behind the fallen house (sign 235) | the tower's flood soaks you for the 6 tiles of OIL (428-433) + the burning log in the exam. Dry, oil is a TOLL not a wall: half a pillar's burn, no knock-back, you walk on |
| DOUSE A PATH: a BURNING GATE (L.heaps gate:true) only water opens; the roofs are always the other way (like the Fallen House) | THE YARD GATE at 137 under the two-storey house (rack 132, sign 134, the gable stair at 127 -> the roof) | THE BARN DOOR at 322 (rack 320, sign 318, the ladder at 321 -> the roof; the roof's own wall of fire + hatch) | (the Fallen House, the root-cellar lid, the bridges and logs were already the level's douse verbs) |
Each has a glint + 10 s stall nudge (`src/stuck-spots.js` bn-yard-gate / bn-barn-gate) and a sign at the point of use that names the water AND the roof. Nothing new needs a new input: strike, throw, carry - the bucket / jug kit is untouched (numbers unchanged).
NOT built (optional in the brief): douse a torch-bearer to stagger it (the bucket already douses a burning goblin; the waves now douse + knock down one too); the "save a trapped villager for a silver cache" (the silver cache for this lane is the soaked climb's roof silver).

### 2. FIRE IN THREE STAGES (`stageAt(col)`: 0 Road in + Crofts -> 1 Long Street + Rooftops -> 2 Barn + Well yard, the square settles to 0.8 so his duel is as it was)
- a red-orange sky wash climbing with the stage + the glow bands lifted (`drawBurningBackdrop(..., stage)`); the town behind is a town ALREADY well alight in the later stages (`tEff`: a hurrying hero is never ahead of the fire past the Crofts), smoke COLUMNS stand up out of the burning houses (`drawSmokeColumn`), houses behind visibly COLLAPSE (rumble + sound + dust the first frame of the fall)
- an EMBER STORM (wind-driven, cap rises 14 -> 94 with the stage), HEAT SHIMMER (wavering pale columns over every flame), the screen's red wash rising, the barn's rafters burning overhead (a glow + drips)
- flame pillars burn 15% taller per stage (no more of them: the count is the level's 5)
- a ROAR that rises: two new synth beds (`blaze2` for the Long Street + Rooftops, `blaze3` for the Barn + Well yard, rumble of far collapses), back to `fire` in his square
Before/after PNGs below.

### 3. FALLING DEBRIS, TOLD (6 points): never untold, never a pit
Tell 0.7-0.8 s: a SHADOW grows on the ground where it will land (dashed, blinking), the timber CREAKS, DUST sifts, the thing hangs shaking over it and a line says it (THE BEAM CREAKS: LEAVE THE SHADOW); then it falls and lands. It hurts only whoever is under the shadow (a jump clears it): tiles 10, beam 16, chimney 18.
`roadtiles` 76 (the first, a cottage roof), `yardbeam` 145 (leaves BURNING GROUND 5 s, 2 tiles, a toll), `lanechimney` 224 (leaves a rubble STEP against the fallen house: a third way over it, through its fire), `hallroof` 262 (the Hall's thatch), `barnbeam` 349 (burning ground in the barn), `yardtiles` 412 (the yard's last bridge). A respawn puts everything back.

## Checks (this lane's tip, my worktree, one headless browser at a time, >= 1.5 GB free before each)
| check | result |
|---|---|
| tools/village-hands.mjs (NEW, in tools/check.mjs): tanks / waves / soak / oil / gates / debris / stages / respawn / boss end | PASS |
| tools/village-water.mjs (one assertion re-worded for tEff, see Q5) | PASS |
| tools/burning-village.mjs, tools/village-stakes.mjs, tools/throwables.mjs (gate anchored at its foot), tools/pyro-duel.mjs | PASS |
| tools/level-quality.mjs burning | CLEARS THE BAR (silver moved, Q4); pilot / curve / mash RESTAMPED (hash 6c27f5f56b81 -> new): pilot 46 blows, 2 deaths in 3 runs; curve act 1 172% a run, 2 deaths in 3 (band 40-250%, 0-3); mash: knight 5 / warden 19 / pyro 7 deaths, never clears the level; boss mash 0 wins |
| tools/solid-islands.mjs | PASS (0) |
| tools/reach-heroes.mjs (all 9 heroes, every level's route) | PASS, 0 known crossings, nothing new |
| tools/hint-shown.mjs, tools/stuck.mjs (2775 static + 289 runtime spots, incl. bn-yard-gate / bn-barn-gate), tools/ambient-landmarks.mjs | PASS |
| tools/textfit.mjs hints,talk (5350 screens, 732 s) | OVERFLOW 0, OFFSCREEN 0, CLIPPED 0, TRUNCATED 0, COLLIDE 0, OVERDRAWN 0; COVERS 2 = the Falling Tower's and the Fair's signs (not this level) |
| tools/mobile-perf.mjs, 4x CPU, 915x412 phone, burning at the Crofts / Rooftops / Barn / Well yard | 56.8 / 49.5 / 50.9 / 52.5 fps (budget >= 40), worst frame 107 ms, input 1.3 ms, with the denser fire. Other lanes' suites were running beside it |
| tools/burning-route-walk.mjs (blind real-key walk, no god mode) | reaches his square both heroes; it takes the bucket at each gate and throws it. It loses 89% hp vs 39% on master (it walks blind through the oil / the beam's wreck / the log - a soak or a jump is a player's answer) |
| tools/level-walk.mjs burning knight,warden,pyro, L5 campaign hero, human+first, n=3 (master n=2) | deaths knight **0.7** (master 2.5), warden **1.7** (2.5), pyro **0.3** (0.5); arrive% 56 / 49 / 56 (54 / 49 / 59); measured coverage of the route 87 / 77 / 96% (71 / 80 / 80); STUCKs 267,10 / 232,13 + 200,16 / none (master 128,25 246,13 / 234,13 / 216,13). Act-I band 0.5-1.5: knight on target, warden 1.7 (was 2.5), pyro 0.3 (was 0.5 on target, n=3 noise). One warden death is the oil (THE OIL FIRE@240) - the toll killing a bot already low, told by its sign |
| THE PYROMANCER, tools/boss-rates.mjs burning --ways=practiced --seeds=12 --profile=human (campaign kit flasks, L5) | this lane 12/12 12/12 11/12 = 97% ; **master 7f5e3b5e 11/12 12/12 12/12 = 97%** - UNCHANGED (same HIGH +27 vs the 60-70% target on master): pre-existing, not touched by this lane (brief: fight unchanged). Needs its own boss-tune lane if 60-70% is still wanted |

## Before / after PNGs (docs/burning/, committed)
- BEFORE (master 7f5e3b5e): `b3before-01-road-in` ... `b3before-17-ambush` (17 stills, same spots + frames as the after set)
- AFTER (this lane): `b3final-01-road-in` ... `b3final-17-ambush`
- new verbs in play: `b3-soak-struck` / `b3-soak-inoil` / `b3-oilledge-ledge` (SOAKED on the oil ledge), `b3-barrel-wave` + `b3-barrel-wave2` (the barrel's wave knocking the yard down), `b3-tank-before` / `-wave` / `-wave2` / `-after`, `b3-tower-before` / `-wave` / `-wave2` / `-oil`, `b3-gate-before` / `b3-gate-after` (THE YARD GATE burning, then burnt down by a thrown bucket), `b3-debris-tell` / `-tell2` / `-fall` / `-landed`, `b3-chimney-after`
- the stages: `b3-stage0-look` (Road in), `b3-stage1-look` + `b3-stage1b-look` (Long Street, Rooftops), `b3-barn-look`, `b3-stage2-look` + `b3-stage2b-look` (Well yard), `b3-square-look`

## QUESTIONS FOR DANIEL (rec + what I built)
1. OIL AS A TOLL, NOT A WALL (rec = toll): dry, oil / a debris wreck burns you half a pillar's burn with NO knock-back, once a crossing; the first build threw you back out of it and the route walk died in a 3-tile pool. Built: toll. If you want oil to be a hard lock only a soak opens, say so (it would need a bot hint).
2. THE GATES ARE NOT HARD LOCKS (rec = keep): both have the roof beside them, as the Fallen House does, so no hero can ever be soft-locked and the walker/route tools keep a route. If you want "water or nothing", the roof end of each can be walled.
3. SOAKED DURATION 10 s and it protects from ALL the village's fire (not the Pyromancer's attacks; it ends at his door). Rec = keep; 6 s is the shorter alternative.
4. LQ "secrets" counts silver off the route: the yard gate puts the route over the two-storey house's roof, so its silver (149,12) was now ON the route and LQ failed. I moved that silver to the croft house's roof (103,15) - it is now the pay for the soaked climb. (No silver added or removed.)
5. TEST CHANGES (deliberate design changes, not weakened tests): `tools/village-water.mjs` asserts the backdrop is drawn through `blazeAt(wx, k, tEff)` where tEff = the level clock + the later stages' head start (the clock is still the base and the (b) check on the clock is unchanged); `tools/burning-route-walk.mjs` takes the bucket at each gate and throws it (INTERACT / ATTACK now go through BK.press) and walks intermediate waypoints; `tools/throwables.mjs` anchors a gate's rack test at its foot (a gate fills the street up to the roof); `src/walk-hints.js` teaches the walker the barn roof's wall of fire (strike the trough) because the barn door's alternative is now the roof.
6. PRE-EXISTING (not this lane): the walker already missed the act-I deaths band for knight/warden (2.5 vs 1.5) on master 7f5e3b5e; the Pyromancer practiced rate is 97% (HIGH +27) on master AND here (same fight).
