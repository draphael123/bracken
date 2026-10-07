# claude/underwell3 - THE UNDERWELL / CISTERN QUEEN, Daniel 10-07 (Opus) - DONE (resumed after the credits stop)

## STATUS
All five items are done. The one exception: the invisible rope could not be reproduced. Every probe is listed below, and there is a question for Daniel.

### 1. The Queen's mechanics (from the WIP 730e3250, unchanged)
- Her stinger is her weak point, wherever her tail holds it, and a hit on it does full damage.
- STINGER SLAM: her stinger stays planted in the floor afterwards, as an easy target.
- Fire on her floor oil leaves her SCORCHED for 6 s: her body takes full damage from any side, and the oil seeps back.
- Water poured on her mound makes her SLIP: an opening of 3.4 s with her stinger flat on the floor.
- The v2 bot rows. tools/cistern-queen.mjs 107/107.

### 2. Tune (src/cistern-queen.js)
- Health is 1150 -> 1650, and every blow she lands is x `CQ.dmgK` = 0.55 (applied once, after the table).
- Measured with `PORT=8702 node tools/boss-rates.mjs underwell --ways=practiced --seeds=8 --jobs=2 --profile=human` at L32 (her campaign level):
  - 1650 health, damage x0.70: 3/8 3/8 2/8 = 33% (LOW).
  - **1650 health, damage x0.55: knight 3/8, warden 5/8, pyro 5/8 = 54%, in band, no hero at 0.** Fights last 61-137 s (about 90 on average; they were 60-70 s).
- Mash bot against the boss: 0/6 (warden dies, pyro times out with her at 65%).

### 3. Knowingly-red assertions, updated to follow Daniel's approved design change, with the same strictness
- tools/underwell.mjs (the lob block): fire under her burrow used to drive her up DRIVEN UP (soaked). She now comes up **SCORCHED**. The check still requires her to be up out of the sand, scorched for more than 2.5 s, with SCORCHED named on her bar.
- tools/boss-openings.mjs: a pour on her mound used to SOAK her. It now makes her **SLIP**. The opening must still be >= 3 s (measured 3.4), and the other two openings are unchanged (fallen 3.2, rear 3.2).

### 4. INVISIBLE ROPE - NOT REPRODUCED (all probes green); see question 3
- Physics: the only climbable tile is T.NET (src/main.js ~9007). The level has four ropes: 160, uwX(356)=448, and her two ladders, now at 646/673.
- Real-keys walks (tools/underwell-route.mjs with contact sheets) for knight and pyro, with foes on, 10-13 deaths and respawns. Every 5 frames I checked that every NET cell in the level has a tile picture: none was missing (in any state the walk reached).
- Burnt / respawned / spare re-hung / burnt-then-dead-then-respawn, for both firebreak ropes: every NET cell has its picture.
- Her fight: before it, at P1, at P3 and after her death, in the zoomed-out fight camera too, both ladders are drawn.
- A "hold UP in mid-air" sweep over every air cell from 340-600 (old columns), before, during and after her fight: nothing holds the hero except the drowned cistern's deep pool (swim).
- Every exposed non-air tile in the level has a picture.
- The existing pixel check passes (12 samples, lowest contrast 31.6).
- Things that look like ropes but cannot be climbed:
  - the bucket rope down her shaft (seen from her corridor);
  - the chains on the way lamps;
  - the iron board posts in zones 2 and 4, which have rung-like bands every 14 px (src/redraw/underwell_dress.js `post`).
- No fix was made: I did not want to change art on a guess.

### 5. Two more water sections (src/underwell.js), let in through one mapping
- `uwX(old column)` and `UW_INSERTS = [[244, 48], [346, 44]]`, with `UW_SPILL = 244` and `UW_RES = 394`.
- The level is written in its old columns, and every hand goes through X. The two new sections are drawn in true columns.
- These all use the same function: the SECTIONS/ARCS exports, src/stuck-spots.js (`uwSpot`, including the `fire.<col>` keys), the zones in src/redraw/underwell_tiles.js, tools/underwell.mjs (page `X`) and tools/underwell-route.mjs (old-column legs mapped; the new legs are raw).
- The level is W 600 -> 692. checkRun is 200 -> 240, which keeps four checkpoints (the longest run is 235).
- **THE SPILLWAY** (TEACH, 244-291), off the upper works' east step:
  - You drop into an overflow hall: shallows with oil floating up to a nest, 2 drowned dead and 2 cistern bats.
  - The shore torch is on bare stone. Thrown from the shore, it lands on the oil: the dead that rise at the shore burn, and THE SPILLWAY NEST burns away.
  - Behind the nest, a 6-board stair room leads up to the old shaft's lip (the "THE SUMP IS BELOW" sign moved there).
- **THE OLD RESERVOIR** (TEST, 394-437), off the sump's stone rise:
  - The torch hangs under a pillar in the bats' dark, at the top of three boards (3-row hops). 4 bats are up there; a carried torch keeps them off.
  - Oil floats over the whole flooded floor, with 4 drowned dead under it.
  - The torch thrown down from the top board burns THE RESERVOIR NEST, which seals the Lamp Stair. The dead stay under until you wade in, so you fight them in the water.
- The drowned cistern stays as their REMIX (the lob over the deep pool, the thieves). `ARCS.water` = teach / test / remix.
- Both nests are REQUIRED. Each section has a sign at the point of use, plus glint and nudge (uw-spill, uw-spill-stair, uw-res; uw-works-drop moved to the spillway's exit).

### Re-stamps
- docs/level1-pilot.json: knight, 44 blows, 6 deaths, walked 100%.
- docs/level1-curve.json: act 5, 291% lost, 6 deaths (in band).
- docs/mash-bot.json:
  - level, written first: knight / warden / pyro each die (lowest hp 0%);
  - then the boss: 0/6.
- level-quality underwell: CLEARS THE BAR.
- Route pilot, god, no foes (base movement): **all 7 heroes walk the whole route, 0 lifts.** That is knight, warden, pyro, paladin, pirate, reaper and geomancer.

### Checks run (green, PORT 8702 only)
- underwell (static + page, including the 2 new section checks)
- underwell-aloft
- cistern-queen 107/107
- boss-openings
- boss-fight-end
- boss-greed
- boss-read
- tells
- answer-tags
- hint-shown: it was red from the WIP. My stinger line replaced "CLAWS TURN BLADES: GO ROUND, OR FLOOD HER", so I deleted that dead routed line from src/hint-lines.js.
- throwables
- corpses
- one-new-foe
- stuck (static + runtime)
- signs
- level-quality underwell

## QUESTIONS FOR DANIEL (rec first)
1. Hitting her stinger does x1.0 any time outside her ward. Rec: keep (she is 54% at 1650 health / x0.55 damage). If she is too easy in your hands, use 0.7.
2. A pour on her mound now SLIPS her (it used to SOAK her); the bucket still soaks her. Rec: keep. Both changed checks are noted in the commit.
3. INVISIBLE ROPE: I could not reproduce it (see section 4). Rec: tell us where it was (or send a screenshot) next time you see it. My guess is that it is the bucket rope in her shaft, or the iron board posts with rung-like bands, and that they look climbable when they are not. If that is it, the rec is to drop the bands from the iron posts and draw the bucket rope thinner and darker. Nothing is changed yet.
4. Water section names: THE SPILLWAY and THE OLD RESERVOIR. Rec: keep.
5. The reservoir's drowned dead stay buried when the torch is thrown down from the top board, so you fight them in the water afterwards (the oil burns out). Rec: keep this, as the section's "fight during the rule". The alternative is a second, low torch so they can be burnt.
