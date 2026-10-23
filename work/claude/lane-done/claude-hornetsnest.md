# claude/hornetsnest - THE HORNET'S NEST (spur off THE LUMBER TRAIL) + THE HORNET QUEEN 2 (opus greybox)

Base origin/master 799bbd15 (BATCH114). Branch claude/hornetsnest. Not merged, not deployed. No What's New lines (release lane).

## What was built
- **THE HORNET'S NEST** (src/hornets-nest.js, 404x72): its rule is **WAX AND SMOKE**.
  - FRESH COMB IS STICKY (wax slows the run).
  - A HANGING COMB you CUT (a rising cut reaches it from 3 rows under) DROPS and becomes a one-way STEP or BRIDGE. A falling comb knocks loose the comb below it (chains), and crushes the foes it lands on.
  - A CARRIED SMOKE POT quiets swarms around you. A THROWN pot leaves a smoke cloud.
  - BROOD CELLS pulse (told), then hatch 2 hornets.
  - Hands: src/hornets-nest-hands.js.
- **New foe: THE SWARM** (src/hornet-swarm.js).
  - A cloud that rises (told) and follows you slowly up to a leash.
  - Its sting is the shared quiet drain (A13).
  - It comes in bursts: it stings, then settles. Smoke greys it, and a grey swarm takes x2 damage.
- **Areas (teach → test → exam):**

  | Columns | Area | Role |
  |---|---|---|
  | 0-79 | THE PINE'S FOOT | teach |
  | 80-168 | THE PAPER GATE | test; exam: the NEST-GUARD elite holds a gate |
  | 169-247 | THE COMB STAIR | remix; exam: the high wall's comb chain under the exam swarm |
  | 248-294 | THE BROOD CELLS | |
  | 295-332 | THE BROOD HALL | P1 |
  | 333-353 | THE FALLING NEST | escape |
  | 354-403 | THE GREAT PINE | P2 |

  - Shrines at 168, 240, and 351 (the bottom of the escape; it is also the boss checkpoint).
  - Foes are reskins of existing machines: nest hornet (the wasp, foeHit 0.6), comb drone, venom spitter, nest-guard (shield elite, VENOMOUS), and a boar.
- **THE HORNET QUEEN 2** (src/hornet-queen.js pure / hornet-queen-hands.js / hornet-queen-plan.js), built on the parked queen.
  - **P1 BROOD HALL:**
    - Her dive sticks in a comb perch, which gives an opening.
    - Smoke dazes her.
    - Her wing-buzz brings the told comb down.
    - Told brood cells hatch capped drones.
    - Sweep: block it (jars), parry it (staggers her), or jump it.
  - **ESCAPE:** at 55% she tears the hall open. You climb down the falling nest's crumbling ledges while told chunks drop, and land at the checkpoint at the bottom.
  - **P2 THE PINE:**
    - Fell a pine across her flight (cut the told trunk), or cut THE LAST COMB onto her. Either one GROUNDS and PINS her (x2 damage).
    - New moves: STINGER VOLLEY (block it) and SWARM CLOAK (keep off).
  - **B15 floor:** she takes 0.4x at minimum outside openings and is never invulnerable. Her shell is 0.5 and the cloak 0.4.
- **Map:** node `hornetsnest` (40,112, plate above) in WOOD_NODES, a spur off wood. LEVELS row needs:'wood', spurOf:'wood', opensOn wood. map-forks: wood -> marsh | hornetsnest.
- **Registries:**
  - bestiary rows and cards, BOSS_T / BEAST_SHORT / COLS
  - threat, boss-greed (OPEN_RULE/OWN_WARD), boss-read, marks (and tells regenerated)
  - island posts, foe-react act I, elite fit, exit gate (forest), stuck spots, walk hint
  - tier / tier-boss 0.1, medals (estimate), rule-state keys, and the smokepot throwable
- **Lab bot branch** (src/lab.js + hornet-queen-plan.js) covers rings, rising cuts, smoke stand, drones, trunk baiting, bough two-step, pine targeting, and escape.
- **tools/hornets-nest.mjs** (registered in check.mjs) has 134 checks: data, every required comb a LOCK for all 9 heroes, the swarm, the fight, B16 poses, and the bot.

## Bugs found and fixed on the way (worth knowing)
- **A swarm cut down while it was on the hero left its drain running for the rest of the level.** This caused every swarm "death" far from a swarm. It is fixed in main.js at the kill (`SWX.drainOff`), with a check in tools/hornets-nest.mjs.
- **The comb you cut no longer hurts its cutter** (heroCrush 0). The walker died under its own cuts.

## Checks
**Campaign walker** (`level-walk hornetsnest --seeds=2`, human+first):

| Hero | Deaths per run | Result |
|---|---|---|
| knight | 1.0 | on target |
| warden | 0.5 | on target |
| pyro | 0.0 | miss: arrives 84% |
| **Mean** | **0.5** | **inside the act I band (0.5-1.5)** |

- The deaths are all to the NEST-GUARD elite.
- All runs reach the boss.
- Pyro red: the walker cannot hurt the shield elite from the front (its duels time out at 98-100%), then STUCKs at his gate (169,31) and is resumed past it. A player would go round him or plunge from the comb ledge. The shield elite is common elsewhere.

**Boss rates** (`boss-rates hornetsnest --ways=practiced --seeds=6 --secs=240`, flasks kit, L3):

| Run | knight | warden | pyro | Total |
|---|---|---|---|---|
| With flasks | 6/6 | 4/6 | 2/6 | **67%, in band** |
| Dry (`--profile=human+dry`, 4 seeds) | 3/4 | 3/4 | 2/4 | **67%** |
| Mash bot (boss) | 0 | 0 | 0 | **0/6**, stamped |

- Fights take 56-220 s; the knight is fastest (56-138 s).
- The pyro losses are 3 deaths and 1 timeout.
- Mash bot (level): every hero drops to 0% once (stamped).

Static checks:
- Green: hornets-nest 134 ok, level-quality (hornetsnest: every row ok), solid-islands, reach-heroes, level-reach, elites (87, every gate opens onto the route), deadends, stuck --static, one-new-foe, map-grammar/scale/spacing/forks, boss-music.
- answer-tags: the nest asks for 2 answers (block, dodge). This is listed for the design lanes, not a failure.

Stamps and browser checks:
- docs/level1-pilot.json: fresh L1 knight, 0 deaths, 43% lost per run.
- docs/level1-curve.json: act 1, 49% lost per run, in band.
- docs/mash-bot.json: boss and level rows.
- level-quality: hornetsnest is added to GATE and clears every row (music ok: musForest + queen).
- corpses: the nest is now covered and every reskin dies in its own skin. This needed a fix: the venom spitter used to die as the toadstool's cap and stem.
- hint-shown: ok (a dead "SMASHED" number line removed).
- boss-select: ok. boss-jump `BJ_ONLY=hornetqueen`: ok.
- stuck (runtime): ok.

## Reds / not done
- **Full boss-jump stalls at the djinn (welltown):** it reports "NOT cut down", then Runtime.evaluate times out. This is not my boss; hornetqueen passes alone. It may be the release gate's load on the machine. Worth a look in integration.
- **Pyro in the walker vs the nest-guard** (see above).
- **Boss spread is knight-heavy (6/6, pyro 2/6).** It is in band overall and no hero is at 0. Rec: leave it for the art/polish pass. The knight's guard eats her stoop.
- **The full suite was not run** (a 40-minute run, with the release gate beside me). Subset green: hornets-nest, level-quality, solid-islands, reach-heroes, elites, answer-tags, stuck, map-grammar, corpses, hint-shown, boss-select.
- **The medals are an estimate** (360/520/760); no timed run was made.

## Art hooks (greybox now; art pass before live per the art-before-live rule)
- **THE HORNET QUEEN:**
  - `POSE` in src/hornet-queen-hands.js is the contract: every mode has its own windup and release pose (B16, checked).
  - `drawQueenBody` is greybox (crowned head, thorax, striped abdomen and sting, two wing pairs).
  - `bakeHornetQueenCard` makes the bestiary card.
  - She needs a pinned/lying pose under a pine and under the last comb, a cloak cloud, the stinger volley's darts, and the rings (her loop shadow, the told stoop line).
- **THE SWARM:** `drawSwarm` draws the cloud live (dots); `bakeSwarm` has 5 poses (idle/rise/angry/calm/hurt). The art lane can keep the live cloud and redraw the motes.
- **Skins** (src/redraw/hornets_nest_art.js, recolours only): hornet (wasp), combdrone, nestguard (shield + wax plate), venomspitter.
- **Props in hornets-nest-hands.js draw/drawOver:**
  - hanging/falling/landed comb (one-way)
  - wax sheen on sticky floors
  - smoke stand and pot (carried, thrown, cloud)
  - brood cell (idle, pulse, hatch)
- **Geography:**
  - The nest's paper mass hangs from the pine boughs over 80-332, rows 0-51, with the dark undergrowth under it.
  - The two trunks: the nest pine at 350, and the great pine room's 4 pines (356, 363, 392, 399), which fell into the room.
  - The bough shelf over the pine room (370-382 @62) and its root shelves.
  - The falling nest's crumbling ledges. Island posts are listed in island-posts.js.

## Music (placeholder, for a music research lane; nothing downloaded)
- The level plays `musForest` and the arena plays `queen`; both are placeholders.
- Candidates (CC0 per page, re-check the licence box before any download):
  - Level: "Cathedral in the forest (ambient loop)" by congusbongus, https://opengameart.org/content/cathedral-in-the-forest-ambient-loop
  - Level layer: "Forest Ambience", https://opengameart.org/node/23888 (licence did not render in search; confirm)
  - Boss: "Hard Boss Battle 2" by MintoDog (synth, 210 BPM), https://opengameart.org/content/hard-boss-battle-2
  - Boss: "Basilisk Boss Battle Loop" by beardalaxy, https://opengameart.org/content/basilisk-boss-battle-loop
  - Boss: "Boss Battle (loop)" by Pro Sensory (asks for credit), https://opengameart.org/content/boss-battle-loop
- None of these has an insect or buzz texture. Rec: layer a CC0 buzz bed under the boss loop, swelling on her buzz/cloak tells.

## Questions (rec first; what I built)
1. **Boss music.** Rec: the boss gets her own track from a music lane, with a buzz bed (candidates above). Built: the placeholder arena music 'queen' and level music musForest.
2. **The NEST-GUARD gate exam is the level's main killer.** Rec: keep it. A player can plunge from the wax ledge or go round, and it is the exam. Built: the shield elite (VENOMOUS) holding a gate at 165.
3. **Spur placement.** Rec: (40,112) off the Lumber Trail junction, plate above. Built: that. The map-plates solve churned every board, so I kept the master table.
4. **The parked Hornet Queen** (main.js updateQueen). Rec: retire it once HORNET QUEEN 2 is live. Her stoop, the sting that sticks, and STUCK = open carry over into the new module. Built: the new module boss `hornetqueen`; the old code is untouched.
5. **Smoke daze strength.** Rec: 2.5 s, x1.5, 7 s cooldown, so smoke is a tool but not a lock. Built: that.
