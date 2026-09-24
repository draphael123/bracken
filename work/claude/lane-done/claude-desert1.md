# claude/desert1: THE SUNKEN CARAVAN (desert level 1), lane report

Second-PC lane, 2026-09-24. Branch `claude/desert1`, pushed after every green commit. Nothing touches master and
nothing is deployed. The full `npm run check` was NOT run. The subsets below are the only checks that were run.

## Commits, by step

| step | sha | what |
|---|---|---|
| 0 | `fe49a04` | Deleted the frozen run's junk: probe.js, probe.tmp.mjs, check1.out |
| 1 | (already `486c7fa`) | origin/claude/slopes was already merged (`git rev-list HEAD..origin/claude/slopes` is empty). `src/main.js` imports `src/slopes.js`. `T` gets ids 20-25 through `Object.assign` in `src/level.js` |
| 1 | `bda14f7` | Merged origin/master (Geomancer, Unburied music, level-list panel). In `tools/check.mjs`, both names were kept (`slopes` + `geomancer`) |
| 2 | (none needed) | origin/claude/desert's notes and caravan content were already on the branch (`git cherry`: the only unmatched commit is the same threat and draft change, already in HEAD) |
| 3+4 | `e0fadb5` | The level finished, walked and screenshotted |
| report | this file's commit | |

## The slopes-equivalence result

- **Node (`tools/slopes.mjs`)**: all 31 shipped levels behave exactly as they did before slopes. That is 651,000 frames × 3 bodies (knight + two walkers), and every frame matches the old mover.
- **Page (`tools/slopes-trace.mjs`)**: every frame on every level matches the build from before slopes.
- **One fix to the claim**: THE SUNKEN CARAVAN is built on slopes. It runs the slope mover in the game, so it has no old mover to match, and it counted as 15,028 "differing" frames. Levels with slopes are now listed and skipped. A new assertion fails if any level other than the caravan ever gets a slope tile.
- All slopes checks pass, including the Dune Yard walks and the reach rule.

## The level

**One sentence (C2):** THE SUN IS OUT HERE. SHADE IS LIFE.

It says this three ways (C4):
- the view swims and a sun meter shows on the HUD
- every patch of shade is the same violet
- the signs, plus a lone awning in the first section

**Sections (F1), 547×40, 505 columns to the hollow:**
1. THE WAY DOWN
2. THE CARAVAN ROAD
3. THE OX LINE
4. THE DUNE SEA
5. THE TRADERS' CAMP
6. THE SINKING WAY
7. THE HOLLOW'S RIM

After those comes THE WORM'S HOLLOW. It is built but has no boss yet.

**Landmarks:** the lead wagon, the great ribcage, the slide, the awning winch, the sinking caravanserai.

**Machine (F5):** THE AWNING WINCH. Strike it to roll the great awning out over the yard (making shade) or back (the looters burn).

**Other contents:**
- **Ambush (Q):** THE TRADERS' YARD, led by THE OLD STINGER, an elite scorpion.
- **Elite:** the looters' archer captain holds a gate at the foot of the rim.
- **Checkpoints:** 13.
- **Signs:** 6.
- **Collectables:** 3 silvers, 3 trader's coffers, and the relic THE TRADER'S VEIL ("the sun takes you half as fast").

**Wiring:**
- Appended to `LEVELS` just before the hidden `custom` entry (the same place as `unburied`; `custom` is found by id).
- `TIER` 2.4, `MEDALS` [300, 440, 660] (an estimate), `needs: 'fallingtower'`.
- Map node: the first `DESERT_NODES` entry at (248,158), met by the sand connector. map-grammar passes.
- The Falling Tower's gold out-portal leads to it through the `needs` link and the node. The sanctum fight is unchanged.

**New foes (F10), all three new to the game** (one-new-foe passes):
- THE DUNE SCORPION: a claw a shield turns (`!`), and a sting over its back that nothing turns (`!!`).
- THE SAND GOBLIN: buried and untouchable until it rises, then two knife cuts (`!`), then it burrows and comes up ahead of you.
- THE VULTURE: it marks your spot and dives (`!!`). Its shadow is moving shade.

**Fixes found by walking it (F9):**
- The play pass crashed on the first blow (no `COLS` row for the three new foes). Bestiary rows were missing too.
- Through the caravanserai's one-tile roof hatch, only a jump from directly under it got out. It is now two tiles wide, the first shelf spans the room, and the room has a back wall so it reads as a tower.
- The rim elite stood 4 tiles from its gate (elites needs at least 5). It moved to column 486, with the gate at 496.
- The sunk wagons stood on nothing. The wagon silver was out of reach.
- The desert drew the wood's grass strip and a green bough.
- Added the amendments' "haze on the horizon as a tease", baked into the far layer. There is no storm.

**Rules that now know slopes are floor**, each where the caravan exposed the gap. No other level has slopes, so nothing else moves.
- the play bot
- `tools/audit.mjs`
- `tools/newlevel.mjs`
- the garrison sprinkler: it gave dune columns no spawn spots at all

## Walk (F9): `node tools/caravan-walk.mjs knight,warden`, no god mode

The bot cannot win locked fights, so the walk runs in legs between the two locks.

| hero | start -> yard | yard's far door -> elite's gate | elite's gate -> level gate |
|---|---|---|---|
| knight | ARRIVED, 0 deaths | ARRIVED, 0 deaths | **WIN**, 0 deaths |
| warden | ARRIVED, 0 deaths | ARRIVED, 0 deaths | **WIN**, 0 deaths |

- **The yard** (`tools/combat-acceptance.mjs ambush`): knight 18.6 s, warden 23.6 s. Both are inside the 15-35 s target (`docs/caravan/ambush-acceptance.json`).
- **The rim's elite archer**: not measured.
- **The one-pass play bot** stops at the yard (column 347, "STUCK", odd). The ambush pens it and it cannot kill the captain.
- **Other walk findings:** one runtime float, a sand goblin at 220,30 (warden run, seen once). Not chased.

## INDEX (`tools/curve.mjs`, needs chain)

**caravan 61**, after fallingtower 96. It opens THE DESERT. Arc openers are exempt from the step check, and the step check's count of 8 is unchanged.

| cols | foes | threat | kinds | thr/100 | hazard | checks | gap |
|---|---|---|---|---|---|---|---|
| 577 | 54 | 126 | 5 | 21.8 | **0** | 13 | 48 |

## Screenshots

`docs/caravan/00-start` … `10-hollow.png`, made by `node tools/caravan-shots.mjs`.

## Checks (subset, NOT the suite)

All of these pass on `e0fadb5`:
- syntax, tells, comments, homepaths, dangling-paths, shop-gates
- floaters, audit, content-audit, traps, signs, killzones, collectables, keys, elites, spawns, deadends
- map-grammar, checkpoints, additional-areas, additional-areas-runtime, tower-ascent, archmage-room
- skins, threat-holes, one-new-foe, dressing, ambush-single
- slopes, slopes-trace, pixels, textfit
- plus caravan-level, draft-level sunken-caravan, caravan, and newlevel ("every level is plugged in")

**Failures and re-runs** (each fixed, then re-run alone until it passed):
- dressing: the caravan had no ground kit.
- slopes: the equivalence claim, above.
- pixels: a sign on a slope.
- dangling-paths: the new docs/caravan/ folder was not yet committed.

## Parked, with recommendations

1. **MUSIC.** `audio/` has no track that fits a desert, and nothing was downloaded. It plays `musBeach` (MintoDog, CC0, shared with another level; newlevel flags it). *Recommendation:* Daniel picks a CC0 desert chiptune. Keep `musBeach` until then. Nothing in the repo fits better.
2. **THE DUNE WORM (the boss).** The hollow is built and empty, and the level ends at a gate with the sign "SOMETHING LIVES UNDER THIS HOLLOW. NOT TODAY." *Recommendation:* the worm is the next session, as the brief's build order says. The open question from the handover still stands: does the worm's phase-2 `stormOn` survive "no storm in level 1"? My recommendation: keep the gusts and haze inside the arena only, since the phase 2 in the brief changes the fight.
3. **INDEX 61.** `tools/curve.mjs` scores hazard 0 because it does not know sunstroke or quicksand, and in the walk those were the main source of damage. *Recommendation:* teach curve the sun as a hazard before tuning density. Do not add foes to hit a number the tool cannot see. Density is 2.2 foes per screen, in line with its neighbours (fallingtower 2.5, unburied 2.5) but under B7's 3.5-4.5.
4. **Quicksand at the default world speed 0.6.** Taps are in real time and sinking is in game time, so in the page:
   - 6 taps/s escapes in 0.33 s
   - **2 taps/s escapes in 1.5 s**

   The amendments say escape "never at 2" (tools/caravan.mjs proves it in game time). *Recommendation:* decide which clock the numbers mean. If real time, scale `QS.lift` by the world speed.
5. **The rim's elite archer** has no lab measurement. *Recommendation:* one hand playtest, or extend ambushLab to elites.
6. **Sandfalls:** still not placed (deferred by Daniel).
7. **MEDALS** [300, 440, 660] are an estimate. There is no timed human run.

The Skeleton King is not wired, and levels 2-8 are not built, as instructed.
