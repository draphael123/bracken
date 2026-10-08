# claude/burnvillage2 - THE BURNING VILLAGE, brief approved 10-07 20:07

Base: claude/burningmap 9e147180, merged with origin/claude/batch79 (survival2 + walker). The merge had two conflicts, both kept on both sides: in `src/main.js`, burningmap's `BK.mapTip` sits beside batch79's campaign `levelJump`/`bossJump`. In `tools/check.mjs`, burningmap's `level-reach` and `class-spurs` sit beside batch79's `glasssea-slide`, `level-walk-selftest`, `ksar*` and `lantern-eater`. Burningmap's LOCKED tip and the Stockade 5:00 unlock rule are untouched.

**DANIEL PLAYTEST GATE:** this is a boss rework (B9). The Pyromancer ships only after Daniel plays it.

## What was built
1. **THROW WATER**
   - **Buckets and jugs on one system.** Both are rows in `src/throwables.js` THROW_KIND and `src/carry-throw.js` KINDS. The arc you are shown is the arc that flies. UP lobs, DOWN tosses it short, and with no direction held the bucket throws exactly as before, so the boss bot is unchanged.
   - **The jug.** It is light to carry (nearly a run) and lobs further, but its splash puts out only 1 tile (the bucket's puts out 2). Jugs sit on shelves at the taught bridge (154), at the tested bridge (402) and on the middle stall in the Pyromancer's square.
   - **Every water at rest is highlighted.** It has a pale outline, a glint that sweeps across it, and the take-me ring when you are in reach. A carried water shows its told arc.
   - **First-use signs.** The bucket's sign at 87 already existed. New signs: the jug and burning bridge at 153, and "water stuns him" at the arena door (449).
   - **What water does.** It puts out his fire, holds a burning bridge and douses a burning goblin. It also now puts out a wisp (it dies) and any foe that is alight (its burn is cleared).
2. **THE PYROMANCER (`src/village-water.js`)**
   - **Never invulnerable.** He is on `src/boss-greed.js` FULL_DAMAGE as a duellist, so hero blows land whole and the old quarter chip is gone. He still guards by reading a run: the third light blow in a row is turned and a heavy goes through. His fire resistance is that no burn sets him alight.
   - **Water stuns him for 3 s.** He takes x2 damage while stunned. The stun uses the shared B10 read: a gold ring at his feet, a gold bar that runs out, "STUNNED" over him and a first-time hint.
   - **Then a told 3 s STEAM WARD (B3).** It shows a hiss, "STEAM WARD" over him, and a pale shell with its own bar. Blades and water both clank and say WARDED. He fights on during the ward.
   - **Overheated** he still takes x1.5.
   - **Health is 1225** (was 587), measured again now that he takes whole blows.
3. **TWO NEW BURNING BRIDGES on the street** (`bridge()` in `src/burning-village.js`)
   - Each spans 7 tiles over an ember pit, wider than any jump. Each is told when you stand on it, burns through when its fuse runs out, grows back, and holds if watered. Each has posts and a rope rail.
   - **Taught**, at 159-165 in the Crofts: a 2.0 s fuse, a sign, and the jug shelf at its foot. The Crofts elite's gate is at its far end (166).
   - **Tested**, at 405-411 in the Well Yard exam: a 1.5 s fuse with a wisp over it (and a garrison sprig on it).
   - The slowest hero needs 1.35 s to cross 7 tiles.
4. **THE TOWN BEHIND REALLY BURNS** (`src/village-blaze.js`, render side only)
   - Each parallax house goes through roof fire, then the fire climbs down the walls and out of the windows, then the roof falls in (embers and smoke), then it is a black shell with glowing embers.
   - A fire front moves east at 1 tile/s of the level's clock. One house in three ahead of it is lit early.
   - The burning facades glow up the wall as high as the fire has climbed.
   - The rule state is still drawn (A3): the sky's glow still follows the grid fire (VG.heat), and the backdrop never lights a cell.

## Checks
- **New:** `tools/village-water.mjs` covers the water, highlight and arcs, the splash, the bridges, the foes, never-invulnerable in every mode, the stun read and x2, the told ward, re-stunning and the town burning over time. It is in `tools/check.mjs`. Green.
- **Green:** pyro-duel, boss-greed, burning-village, throwables, signs, hint-shown, stuck, readability, render-layers, frame-cost, boss-read, boss-openings, rule-openings, weak-bosses, tells, untold-told, answer-tags, arena-supplies, boss-navigation, goblin-lint, pacing, light-support, bridge-props, ambient-landmarks, map-spacing, traps, killzones, deadends, collectables, checkpoints, checkpoint-gaps, level-reach, class-spurs, village-stakes, threat-holes, comments, one-new-foe, spawns, mash-gate, curve-gate.
- **Tests changed to match Daniel's design (same strictness):**
  - **pyro-duel:** "a bucket while wet only cools him" is now "in his ward the bucket is turned, no stun". New: the ward is up after the stun. His health is now asserted to equal the measured 1225.
  - **boss-greed:** the pyromancer joins the named DUELISTS. A FULL_DAMAGE boss's blow must land whole (at least 30 of 40) instead of being chipped.
  - **burning-village:** the "only way across stays out of the fire" assertion now counts a bridge's ember pit as fire. Each beam is asked about the street just past it.
  - **hint-shown:** STUNNED, HE WARDS IN STEAM, THE JUG, THE BUCKET and PUT OUT now show in the hint box. The silent list only shrank (by 3), and the dead routed line "DOUSED - HE IS OPEN" was removed.
- **Red, not mine** (they come from batch79 or earlier):
  - elites and dressing fail on ksar.
  - dangling-paths fails on the jenny-greenteeth citations and canal4art.
  - level-quality fails on canal's stale pilot.

## Measures
- **Boss DRY, campaign L3** (`harnesscard-rates --mode=new --profile=human+dry`), 12 seeds per hero at 1225: knight 7/12, warden 9/12, pyro 4/12 = **56%**, no hero at 0/N. Fights last about 60-130 s.
  - Before (587 with the quarter chip): knight 3/3, warden 3/3, pyro 1/3.
  - With whole blows at 587: 12/12. At 1200: 67%. At 1250: 44%.
- **Mash:** re-stamped through `tools/mash-bot.mjs`, level first then boss. The boss holds 0/6. The level kills every hero (knight 2 deaths, warden 3, pyro 2), so mash does not clear it.
- **level1-pilot and curve rows** re-run: 2 deaths and 1 death respectively, in band.
- **Walker at campaign level** (1 seed, human+first):
  - knight: 1 death, arrives at 40% hp, on target.
  - warden: 0 deaths, arrives at 53%. Missed (too easy).
  - pyro: 5 deaths, all to THE FIRE. Missed.
  - Walker STUCK spots are in the rooftops (254,10 and 294,13, the douse-only beam the walker cannot water) and at 327,25. None are at the new bridges.

## QUESTIONS FOR DANIEL
1. **Health for whole blows.** Taking whole blows needed health 587 -> 1225 to stay at 56%. My recommendation is to keep this. Built: 1225.
2. **The pyro hero** is the weakest against him (4/12; she cannot block his cuts). My recommendation is to accept it, since the average is in band and no hero is at 0. Built: no hero-specific change.
3. **Wisps.** A thrown water now kills a wisp outright ("a wisp is a flame"). My recommendation is to keep it. Built.
4. **Walker on the pyro:** 5 fire deaths a first run on the village's own fire, which was there before this lane. My recommendation is a level-sweep pass on the fire tolls, not this lane. Not changed.
