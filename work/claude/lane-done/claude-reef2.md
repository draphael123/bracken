# Lane report: claude/reef2 - THE SHIPWRECK REEF LONGER, AND THE REEFMAW ON LAND

Branch `claude/reef2`, off master 0264d19, origin/master merged in at the end (65148ec). Brief: `docs/briefs/reef-longer.md`.

## Commits

| commit | what |
|---|---|
| 239d841 | the brief, and the before numbers (new tools: `reefmaw-pilot`, `reef-walk`) |
| 110362b | before captures (`tools/reef-shots.mjs`, `work/reef2/before-*.png`) |
| 38c4340 | the Reefmaw's land art (`bakeReefmaw().land`, 11 frames) + `tools/reefmaw-art.mjs` |
| 4e30f53 | the level (bell-pool, hulk, arena), the land phase, the lab hands, `tools/reefmaw-land.mjs` |
| 43b094f | the grate fix, `tools/reef-hulk.mjs`, rule S (checkpoint spacing, one placement), after captures |
| f061b3d | the after walk and pilot |
| 65148ec | merge origin/master (check.mjs: every name from both sides; EHP/windingUp conflict hand-merged; MARK regenerated) |

## What was built

**The level: 460 -> 552 columns.** It is built in its old columns and then widened with `grow()`. Everything after the grows is written in final columns.
- **The bell-pool (213-229).** Out of the carrack's breach you reach a basin with a floor, an open surface and a diving bell. You can watch the breath gauge drain with the ground under you, and the bell refills it. The breath sign moved here from the sea bed.
- **The hulk (255-314).** A wreck on the shelf with her deck up in a hollow of the reef roof.
  - The deck is dry, with a checkpoint (272) and a capstan.
  - Her flooded hold is the only way on, out through a grate across her stern.
  - Three turns of the capstan lift the grate, and it stays up through a death. This is the level's second capstan.
  - There is air trapped at both ends of the hold, and under the roof past her stern.
  - An angler waits outside the grate.
- **Clean-up.**
  - The decorative capstan and two bells are now non-interactive wreck junk, with new art (`capstanWreck`, `bellWreck` in `src/reef_props.js`).
  - The Flotilla's stale oar-deck `interiors` rectangle is gone.
  - The reef's own quest is **THE MANIFEST**: three pages, with their own art, HUD icon, signs and talk. ROYAL SEALS stays Highcrown's.
  - The buried coral fan at 277,36 no longer exists in the built level; I checked that no deco is inside rock.
  - Calm zones keep the garrison off the lesson, the deck and the grate passage.
- **The arena.**
  - It is 28 -> 40 tiles wide (A7).
  - The three solid 4-5 tile coral stools are now three 7-8 tile one-way coral ledges, two rows up on posts. He passes under them.
  - The four holes are respaced.
  - The right bank is two steps of two rows up to the gate.

**The Reefmaw.**
- Phases 1-2 play as before.
- **Phase 3 opens on a told change.** He smashes the reef ("THE REEF BREAKS / THE TIDE IS GOING OUT") while the water is still up. The water then drains to his holes, and he hauls out onto the dry reef.
- **On land he is heavy.** He crawls at a walk and turns slowly.
- **His land moves:**
  - **LUNGE:** red, unblockable. Jump it, or stand on a ledge.
  - **TAIL:** yellow, blockable. It punishes standing behind him.
  - **REAR:** the old thrash, used against a hero on a ledge.
  - **DEATH ROLL:** when the lunge catches you, he drags you toward the nearest hole. Three presses or a dodge tear you free. It lets go by itself after 1.6 s, and he cannot grab again for 4 s.
- **A lunge that passes you beaches him.** He lies belly-up for 2 s with a green ring and takes double damage. A lunge that stops short of you does not beach him (A11).
- He turns away from a wall.
- The boss bar reads ON THE REEF / BEACHED / DEATH ROLL.
- spitTell, lungeTell and tailTell are in `windingUp()` (A2). spitTell had been missing.
- EHP is 360 -> 500.

**The bot.** `src/lab.js` learned the land phase: jump the lunge, leave or guard against the tail, cut him while beached, tear free of a roll, get off a ledge when he rears. I also fixed a bot bug: the warden parked one pixel outside his own reach on the flat floor, which the old stools had hidden. The hands now strike from 6 px inside the stand.

**New checks, all in `check.mjs`. Each one fails on master:**
- `reefmaw-land`: the tide is told and then drains; a jumped lunge and a lunge passing under a ledge both beach him; a short lunge does not; the roll tears free and also lets go by itself; the tail lands.
- `reefmaw-art`: the land sheet is grounded and every tell has its own pose.
- `reef-hulk`: the grate is down at load, lifts after three turns and stays up through a death; you can swim out through it; the bell-pool drains the gauge and the bell refills it.

## Numbers before / after

**Reefmaw pilot** (bossLab, 7 heroes, refill health, 150 s cap; pass 0 uses the ranking's seeds):

| | wins | median win | median damage taken | stuck jaws | beachings | fights reaching land | boss hp in play |
|---|---|---|---|---|---|---|---|
| before | 7/7 | 53.3 s | 175 | 22 | - | - | 454 |
| after, pass 0 | 7/7 | 53.8 s | 84 | 29 | 12 | 7/7 | 630 |
| after, 2 passes | 14/14 | 71.7 s | 119 | 50 | 29 | 14/14 | 630 |

In 29 lunges the bot never got caught: every lunge beached him, and the death roll never fired in the pilot. The bot jumps perfectly, so these numbers say the fight is winnable, not that it is hard. Raw data: `work/reef2/pilot-*.json`.

**Walk** (F9 play bot, knight): before, 460 cols, reach 98%, walked 56% before getting STUCK on the shelf, 1 death. After, 552 cols, reach 98%, walked 48%, 0 deaths. It is STUCK at the hulk's grate because the play bot does not turn capstans (x≈264). A scripted swim through the lifted grate works (`reef-hulk`).

**Other measurements:**
- `curve`: INDEX 125 (from 124), 76 placements, 18 kinds.
- `breath`: the deepest water is 81% of a breath there and back (was 73%); the worst pickup is 52%.
- Checkpoint gaps are now 45-72.

## Rule S (the coordinator's message)
- **S1:** six placements where a foe and the ground make one problem:
  - the angler outside the grate, met on a spent breath;
  - the eel in the hold between the hatch and the grate;
  - the sailor at the capstan on the dry deck;
  - the tideguard elite holding the keel climb (already there);
  - the netter on the keel's ribs (already there);
  - the Reefmaw's ledges versus his rear.
  I counted these by hand; no tool audits S1.
- **S2:** not measured. I added no main-route jump of 2.5+ tiles and did not measure the existing ones with the real jump.
- **S3: not met.** The last stretch before the door (the keel, 414-504) is a dry climb and a lift, and breath plays no part in it. See question 1.
- **S4: done.** Checkpoints are at 9, 54, 100, 152, 200, 272, 343, 414 and 484 (484 is the arena-door one). I removed the 100/130, 200/214 and 270/302 pairs that were too close.
- **S5:** two hearts, at 256,36 and 370,36, both placed by the dead-end pass. There are no free main-route hearts.
- **S6:** not measured.
- **S7:** the alcove behind the adverse current, which pays a manifest page, is still the hard optional road. Unchanged.
- **S8:** the walk tool records totals only; they are above. I have no per-section cost.

## UNVERIFIED
- **Nobody has played it.** Unchecked by a person: the land fight's feel and timing (is the 0.6 s lunge tell readable at the real speed, is 2 s beached too generous), the death roll against a real player, whether the drain tell reads, and whether the hulk's route is obvious.
- **The death roll never happened in the pilot.** Only `reefmaw-land` exercises it, with forced setups.
- **The land art has been checked in captures only** (`work/reef2/after-land-*.png`, `reefmaw-land-sheet.png`), never in motion.
- **The F9 walk bot stalls at the grate.** The main route past the hulk is proved by the reach model and `reef-hulk`, not by the walk.
- **Pyro pass-0 fight: the numbers don't add up.** He won in 42.7 s in the after pilot, and in 23 s in an earlier run that never reached land. I suspect burn damage goes past the "its hide turns it" rule, but I did not investigate.
- **MEDALS reef 600/840/1180 -> 650/910/1280 is an estimate.**
- **I ran only the subset of checks named for this lane** (42 green after the merge), not the full suite.

## QUESTIONS FOR DANIEL
1. **S3, the exam.** The last 90 columns before the Reefmaw are a dry climb, and the level's rule (breath) is not in them. *Recommendation:* flood the keel's lower ribs on a slow tide (the tideway's `streetTide`), so the climb to the stern cabin is made against breath with one bell part-way, and keep the checkpoint at 414 before it. It would be a separate small lane.
2. **The death roll is never seen by the bot, and a player who jumps well may never see it either.** *Recommendation:* play it first. If it is never seen, let one lunge in three be a short "snap" that stops at 2 tiles and grabs, so the roll gets taught.
3. **The fight is still 7/7 for the bot with less damage taken than before (median 84 vs 175).** The ledges make the water phases safer. *Recommendation:* no tuning until you play it. If it is easy, raise the lunge and tail damage or shorten the beaching to 1.6 s, rather than adding health again.
4. **The bot and the arena change.** On the new flat floor the warden stood one pixel out of reach; I fixed that in the Reefmaw's hands only. The same thing (a stand of LAB_STAND + half the boss's width, with a walk deadband of 4 against a reach margin of 2) may hide in other bosses' numbers. *Recommendation:* a small lab lane to fix it generally, then re-rank.
5. **The medal times** (650/910/1280) are a guess. *Recommendation:* keep them until someone plays a timed run.
