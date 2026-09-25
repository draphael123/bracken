# claude/longwater2: lane report (2026-09-25)

THE LONG WATER is 88 columns longer (482 -> 570), and all of it is more river. Everything is on `claude/longwater2` and pushed.
I did not touch master, deploy, or run the full suite. `origin/master` (ab26448) had not moved, so the final merge was a no-op.
Brief: `docs/briefs/long-water-river.md`.

## Commits

| sha | chunk |
|---|---|
| `685110e` | the brief, `tools/longwater-walk.mjs` (the F9 walk), before walk and 14 before shots |
| `8e140fa` | THE LINN, THE BORE REACH, the freshwater kit to Saltreach, lesson pool emptied, rocks unstacked, checkpoints to RULES S4, the Bore in the INDEX |
| `3d78127` | the staithe raised so its checkpoint is out of the Bore; the S8 before-walk per section |
| `9034e40` | the Linn's five three-tile leaps (RULES S2), measured for all six heroes |
| `8b18c6f` | `tools/longwater-river.mjs` (added to check.mjs), plus the two things it found |

## What I built

**THE LINN (128-150, new).** The last terrace pours into a plunge pool eight rows deep. Four river stones are the dry way over:
- Five leaps of three tiles: down a row, up a row, and level onto the bank.
- All six heroes made every leap in the page, jumping from the edge. Jump early and you are in the linn with its eel.
- Every hero climbs out onto the next stone or the bank in 2-4.5 s.
- A scout on the far lip covers the hops.
- Eight coins sit on the bed.

**THE GRAVEL RUN (151-167, new).** Wading water with a heron and a turtle. It ends at the Bore's sign: "THE FISHERS' RULE: WHEN THE RIVER ROARS, THE BORE IS COMING UP IT. GET ON A ROCK." The sign stands at 163, before the roar can be heard (x0 - 200 px = col 167). This covers C1.

**THE BORE REACH (318-365, new).** The raft lands at a staithe. The river spreads into tidal flats, wading deep, with four stepped **bore stones**.
- The Bore now runs from the river mouth (366) up to the dock (180).
- Proved in the page:
  - on the flats it hits you for 12 and knocks you back;
  - on a stone, on the staithe or on the far bank's top it never hits you.
- The staithe is stone height, so its checkpoint is out of the Bore. Every hero climbs onto it out of the river.
- Foes: two tideguards on the flats, a heron in the water, a netter at each end, and a harpoon scout over the far end.
- The sign reads "THE BORE STONES. WHEN THE RIVER ROARS, STAND ON ONE AND LET THE SEA GO UNDER YOU."

**The freshwater kit (0-365, `L.fresh`, was 0-127).**
- A new `riverStone` prop (3 variants).
- Barnacle rock and shells become river stones. Anything under swim water becomes a river stone (`FRESH_BED`), so nothing like rushes grows five rows under the river.
- The merrow join `SEA_ONLY`.
- The ambient crabs stay out of fresh water. Jellies start where the water turns salt (`L.turn` 230-430, was a constant 150-330).
- **Trout** leap out of fresh swim water: 14 leap spots, drawn in about 10% of frames.
- For herons I used the level's existing GREY HERON foe, now on the first ferry rock, in the Linn and in the Reach. I left out the marsh's scenery heron: next to the foe it would read as a heron you can't hit.

**The sea's life moved downstream.**
- The ferry's four sirens are gone. The rocks hold one thing each: a heron (206), the checkpoint (238), nothing (272), and a netter who throws at the raft (298).
- Two more eels are in the river.
- The anglers, a lamprey and a puffer are hand-placed in the Sluice Stair's channel, and two crabs on Saltreach's street. Before, the garrison dropped them once the river went fresh.

**Items 3 and 4 from your list.**
- The first swim pool is empty (its eel is in the second). `L.calm` keeps the garrison out of both lesson pools, the manned rocks and both new sections.
- Nothing stacks on 166, 198 or 258 any more.
- The driftwood is off the scout's tile at 124.

**RULES S (the coordinator's message), where my work touches:**
- **S1 (foes that make the ground harder):** the scout covering the Linn leaps, the eel under them, the heron at the raft's first rock, the netter at the last one, and Tidebound on the flats with the Bore coming through. The Sluice Stair's own foes add more.
- **S2 (jumps that can fail):** five 3.0-tile leaps in the Linn. A miss means the linn and its eel, which is mild; see the questions.
- **S3 (the exam):** the Sluice Stair (438-503) is the exam, and I left it as it was. The checkpoint the filler used to put inside it is gone.
- **S4 (checkpoint spacing):** checkpoints are now 4, 95, 165, 238, 319, 370, 442, 518. Every gap is 51-90 except the Herald door's.
  - The level asks the filler for 100 (`L.checkRun`, a new option; the default stays 72).
- **S5 (hearts):** there are no free hearts.
- **S6 (meters):** does not apply. The rule is the tide, not a meter.
- **S7 (the hard road pays):** the linn dive pays 8 coins.

**`tools/longwater-river.mjs` (in check.mjs).** It checks that:
- nothing of the sea is in fresh water, and the fresh water reaches Saltreach;
- the Bore is signed before it is met, with a stone within 6 tiles of every dry tile it runs over;
- the lesson pool is empty;
- there is one thing to a rock and nobody on a checkpoint;
- checkpoints are 40-100 apart.

It failed 14 ways on ab26448 and passes here. On the new build it found two real problems, both fixed:
- the far bank was 7 tiles from a stone;
- a scout had stood beside the Herald door's checkpoint since before this lane.

## Numbers, before -> after

| | before (ab26448) | after |
|---|---|---|
| columns | 482 | 570 |
| curve len / foes / kinds | 512 / 67 / 16 | 600 / 76 / 16 |
| threat per 100 / hazard | 30.8 / 37 | 28.6 / 63 |
| INDEX (ramp from Highcrown 126) | 124 (-2) | 125 (-1) |
| checkpoints | 10 (two by the filler, one of them inside the Sluice Stair) | 8, none by the filler |
| worst checkpoint gap (curve) | 72 | 90 (B6 ceiling 100; checkpoint-gaps limit 150, passes) |
| F9 walk (knight+warden, no god) | 39%, STUCK on the ferry run, 0 deaths | 24%, STUCK at the Linn, 1 death |

**The INDEX is not like for like.** `src/threat.js` now counts the Bore as hazard: one tile in eight of its run, as for a swim pool. It was never counted before. Without that change the new level would score about 119, a -7 step from Highcrown.

**The walk got shorter.** The bot can't make an edge-timed three-tile leap, so it now stops at the Linn instead of at the raft. All six heroes clear the leaps in the page probe.

**S8: what each section costs the bot** (`node tools/longwater-walk.mjs knight,warden --sections`: each section walked alone for up to 60 s; hits / hp lost / how far it got). Knight shown; warden is in `work/longwater2/sections-*.txt`.

| section | before | after |
|---|---|---|
| Meltfalls | 0 / 0 / 78% | 1 / 9 / 75% |
| The Linn (new) | - | 2 / 24 / 7% (stuck at the leaps) |
| Dock | 1 / 12 / end | 0 / 0 / end |
| Ferry run | 2 / 26 / 19% (the bot can't ride) | 4 / 48 / 19% |
| Bore Reach (new) | - | 1 / 13 / end in 23 s |
| Saltreach | 2 / 22 / 85% | 2 / 43 / 85% |
| Sluice Stair (the exam) | 1 / 12 / end | 1 / 9 / end |

The hardest section for the bot is Saltreach (warden: 7 hits, 91 hp), not the exam.

Captures are in `work/longwater2/`: `before-*.png`, `after-*.png` (`after-136-26` is the Linn, `after-347` the Bore Reach, `after-206-25` the heron's rock), and `after-trout.png`.

## Checks run (all pass)

- **Named for this lane:** longwater-river, sea-requests, sea-runtime, swim-chain, swim-shrines, breath, spawns, floaters, architecture, audit, content-audit, traps, killzones, collectables, deadends, checkpoints, checkpoint-gaps, signs, textfit, dressing, skins, map-grammar, threat-holes, one-new-foe, ambush-single, ambush-reach, tells, comments, homepaths, dangling-paths, keys.
- **Also:** rafts, waterfall-joins, elites, newlevel.
- There are no checks named 'longwater' or 'bore' in tools/. `rafts` and `waterfall-joins` are the ones that read this level.

## UNVERIFIED

- **A full raft ride by hand.** The ferry geometry is unchanged, but its rock foes are new (a heron, a netter). Neither the bot nor my probe stayed on the raft past the first rock, before or after.
- **The level played start to gate by a person.** The bot stops at the Linn (after) or the raft (before).
- **How the trout look.** I proved they are drawn; I didn't inspect them up close.
- **How the Bore Reach reads at speed:** whether the roar leaves enough time from the reach's far end (worst case about 2 s plus the walk to a stone 4-5 tiles away).
- **The garrison still stands a few foes next to each other** outside the new sections (tideguard 507 with merrowspear 508, crab 436 with merrowspear 435, turtle and heron at 26-27 in the Meltfalls). None share a tile.
- **The full suite.** Your rule is that it runs at integration.

## QUESTIONS FOR DANIEL

1. **Are the Linn's five 3.0-tile leaps too much in a row?** Every hero makes them from the edge, but it is the level's hardest platforming, and a miss only costs a swim.
   - *Recommendation:* play it once. If it feels mean, make the two up-a-row leaps 2 tiles (then only three leaps are 2.5+).
2. **Should the tidal flats be deadlier?** They are wading deep, and the Bore only knocks you back.
   - *Recommendation:* keep it. The Bore Reach is a timing lesson before the exam, not a second exam.
3. **Should the merrow stay "sea life"?** I put them in SEA_ONLY, so they no longer appear above Saltreach.
   - *Recommendation:* yes. They are the reef's tribe.
4. **The Bore now counts toward the INDEX.** That change is in `src/threat.js`, a shared table, though only this level has a Bore.
   - *Recommendation:* keep it, because the Bore is a real hazard the index never saw. Without it the level reads -7 after Highcrown.
5. **Should the trout be a foe instead of scenery?** I made them scenery. The level already brings its new foe, so F10 holds.
   - *Recommendation:* scenery.
6. **The review also named the sand-floored pools and umbrella pines (the coast's tiles and parallax) on the mountain river.** I didn't touch the tile set or the far layers.
   - *Recommendation:* a small art pass for a river bed and a pine-free far layer over 0-365, if you want it.
7. **The Sluice Stair is the exam (S3), but the bot finds Saltreach harder.**
   - *Recommendation:* leave the exam until someone plays it. If it is easy, put a scout on the far bank's swing landing rather than adding foes.
