# HIGHCROWN lane: done (claude/highcrown)

Everything is pushed to `origin/claude/highcrown`, based on `origin/master` e7846f3 (master has not moved since). Nothing
went to master, nothing was deployed, and the full `npm run check` was not run. Design first:
`docs/briefs/highcrown-bells.md`.

## Commits

| chunk | sha | what |
|---|---|---|
| 1. The bells (with the brief and the new check) | **91c9450** | Every hall's bell is live again, and `tools/bells.mjs` is in `npm run check`. |
| 2. The ambush room | **1e49165** | THE BANQUET HALL, led by THE GOBLIN CAPTAIN. |
| 3. Review leftovers | **5acc3ee** | One LEADS, `grow()` shifts `calm`, one checkpoint moved, stale brief and comment. |
| 1 follow-up, and captures | **60c9a5b** | The ward turns out two, not three. Before/after captures. |

## Each hall's bell, as built

The three dead bells went dead in 6c9176c (2026-09-11). That commit turned their gates into key portcullises on the
same columns. `openGate` lifts every PORT in its rows, so a bell's gate on a lock gate's column would also lift the
lock. Each new gate therefore stands on its own column, in front of its lock gate.

Every bell works the same basic way:
- A sentry who sees you shouts SEEN and runs for the bell.
- You can stop it: catch the sentry, or break the bell (three blows).
- The gate lifts when the watch is down, or after 20 s. A death puts the hall back.

| hall | take | gate | who answers |
|---|---|---|---|
| **OUTER WARD** (bell 304) | The chase: one sentry, 18 tiles to a bell in the open | A drop-grate in the inner arch at 321 (rows 58-63), in front of the brass gate | The barracks door: a soldier and a javelin, under the counterweight you can cut |
| **ENTRANCE HALL** (bell 730,63) | The hall turns on you: nobody new comes | The stair grate at 735 (rows 54-63), in front of the iron gate | Every foe already in the hall (678-735) is marked. Uses a new alarm option, `wake`. |
| **CHAPEL** (bell 730,19) | The loudest bell: one sentry each side, so you can catch one at most | The grate before the bone gate at 715 (rows 10-19) | The roof watch comes down the hatch: two soldiers and a javelin |
| **LEADS** (bell 878) | Unchanged | 880 | Unchanged |

**A fifth dead bell was found by the rule.** THE UNDERCROWN's works bell (44,33) has had a section tag and the sign
"everything below here can hear it" since the level was built (c5ef01e), but never an alarm. It is wired the same
way now:
- the gallery end drops shut at 85 (rows 30-33);
- a miner, a rock goblin and a sprig come up the shaft.

Signs were rewritten for the ward, the hall and the chapel. Each fits in two lines. No bell had to be written out of
the rule.

## The ambush room

**THE BANQUET HALL**:
- Gates at 816 and 852 (36 tiles apart), with the door checkpoint at 809,19.
- **Led by THE GOBLIN CAPTAIN** (a brute, elite). The crowd is a soldier, a cook, and a javelin on the dais.
- The hall's two long-chain chandeliers stay as the room's hazard.
- `AMBUSH_HEALTH.crown` = 2.6.

Why not the review's two suggestions:
- **The Outer Ward** is back to back with the siege-yard elite (Q2).
- **The Captains Hall** has balcony goblins that `gallery-runtime` tests, and an ambush room empties its creatures.

Why not a heavy as captain: its elite name is THE KING'S CHAMPION, which the siege yard already uses.

**Measured with `BK.ambushLab`**, six heroes, three runs each:
- At health 1 the room took 4-14 s.
- At 3, runs took 7-41 s, and one pyro run did not open inside the 150 s cap.
- **At 2.6, all 18 runs opened, in 15.5-36.8 s (median about 23). 16 of 18 were inside 15-35 s**; the knight's 36.8 and the
  paladin's 36.3 ran just over.

Proved in the page for all six heroes:
- It locks with all four foes present.
- Holding a direction with jump, dodge and drop never gets out through either gate.
- A death resets it, and it locks again.
- It opens when the captain dies.

## INDEX

`tools/curve.mjs`, crown: **124 before, 124 after**. Foes 119, threat 345, kinds 21, 18 checkpoints. The room swapped
four of the hall's own foes for four of its own, and the curve does not count alarm garrisons (see Q3).

## F9

**The playtest bot** (play pass, no god mode, knight and warden) gets stuck on the switchback road at tile 41, both
before and after. It walked 17-18% of the level either way. That is the same bot limit the hanging lane reported.
The only other finding was a pre-existing temperer RUNTIMEFLOAT at 625,62, before and after.

So each changed section was walked with a scripted run instead: real keys, no god mode, both heroes, before and after.
- **Entrance hall:** both heroes reach the stair, with the hall rung.
- **Ward:** both heroes reach past the inner gate, with the ward rung. The dumb bot's run is noisy here on master too:
  39-192 s, and one of master's six runs failed.
  - With a three-man turnout it died more, so the turnout went to two.
- **Banquet hall and leads:** the ambush locks and clears (49-56 s for this dumb bot, which does not block). The bot then
  stops at the bell turret's face (871). It cannot climb the chimney ladder, and it stops there on master too.

**The level has not been walked start to gate by a player.** The Queen was not touched.

## Captures

`docs/highcrown/before-*.png` and `after-*.png` are real page captures. The areas are: ward, hall, chapel, captains,
keeproof and leads, plus a `-rung` version with each sentry shown the hero, and after-banquet with the room locked.
Before, only the leads rang; after, all four do.

## Checks

All green at the last push:
- **Level checks:** audit, content-audit, traps, killzones, collectables, spawns, deadends, floaters, checkpoints,
  checkpoint-gaps, skins, dressing, signs, pixels, map-grammar, one-new-foe, threat-holes, elites, keys.
- **Ambush and Queen:** ambush-single, ambush-reach, crown-route, gallery-runtime, queen-comb, queen-chandelier.
- **Boss:** tells, boss-openings, boss-fight-end, arena-supplies.
- **Rendering and layers:** occluders, ground-depth, textfit.
- **Hygiene:** comments, syntax, homepaths, dangling-paths.
- **Level-specific:** temperer, undercrown-variety.
- **New:** bells.

Notes:
- **`architecture` does not exist** in `tools/check.mjs` on master, so it could not be run.
- **Re-runs:**
  - signs failed twice on my own over-long ward sign, and passed after it was shortened.
  - dangling-paths failed until the new brief and tool were staged. It asks git, not the disk.
  - Nothing failed that I did not cause.
- **Red first:**
  - `bells` failed on e7846f3: 12 findings for crown's ward, hall and chapel (bells, sentries and signs), and 2 for
    the Undercrown's works bell.
  - The page half: shown the hero, only the leads' sentry ever rang (`before-*-rung.png`).
- **grow() and calm:** every other level builds byte-identical after the change (hashed all 44 builds before and
  after). Only crown changed.

## Questions for Daniel

1. **Should alarm garrisons count in INDEX?** `curve.mjs` counts ambush waves but not a bell's turnout, which only comes
   if you are seen. *Recommend: leave them out.* They are a price for being seen, not the level's floor. I can make
   curve print them as a separate column if you want it visible.
2. **The Undercrown's works bell was wired, not removed.** Its sign has always promised it. *Recommend: keep it.* It is
   your secret level, so say if you would rather have the sign rewritten instead.
3. **The ward is dense.** The picket, three hounds, the key carriers, a temperer, and now a two-man turnout.
   *Recommend: play it once by hand.* If it is too much, thin the picket rather than the bell, because the bell is the
   rule.
4. **The playtest bot cannot walk Highcrown** (switchback road). Same as the Hanging Village. *Recommend: give it
   pacing.mjs's route to follow*, so F9 can be run properly here.
5. **Left alone, from the review:** the Forgemaster's dark armoury (art), the ten loot heaps (dressing), and the
   125-tile checkpoint gap. The gap is mostly the Forgemaster's room, where B6 forbids a checkpoint, and it is under the
   150 line. *Recommend: leave the gap; the art items go to an art pass.*
6. **The chapel's two sentries will nearly always ring.** One patrols ten tiles from where the shaft puts you. That is
   the "loudest bell" on purpose. *Recommend: keep it.* The dropped grate only blocks the way to the altar for up to
   20 s.
