# MONASTERY 3 (lane claude/monastery3-1105, 11-05): new layout behind MON3, code-only

Branch `claude/monastery3-1105`, in worktree `bracken-lanes/bracken-monastery3`, off master 42a1d4cd. The old name `claude/monastery3` belongs to a branch from 10-19 that is already merged. Nothing here is merged or deployed.

## PLAN (short)
- **Keep rows 0-58 as they are.** That is the False Abbot's ringing floor and house, the crawl and the last wheel, and the guardian's hall. The boss and mini code is untouched.
- **Rebuild rows 59-217** as rooms of a goblin-held monastery: wide halls take turns with tight verticals, one idea per room (Daniel 11-02 15:55 #1-#3 and #5; 15:58 drawbridge).
- **Boss rework (#4) and rooftop finale (#6) go to a follow-up Opus boss lane.** Both move the arena (questions 1-2).

## BUILT
- **Flag (`src/mon3-flag.js`):** `MON3_SHIPS = false`. Turn it on with `?mon3=1` in the page, or `MON3=1` for a Node tool. **With the flag off, master is unchanged:** the spire grid+ents hash `ec117fb3f7fb` is identical to master's.
- **New layout (`src/monastery3.js` `rebuildMonastery3()`), bottom to top:**
  1. **THE GATE + THE GARTH (203-217).**
     - The gate doorway is barricaded with crates you strike down.
     - A defaced saint wears a goblin helmet.
     - The garden courtyard is a breather: no foes, no birds, marked as `L.calm`.
     - Two root cellars each hide a silver.
     - THE GARTH WHEEL (a prayer wheel) turns its stair to the refectory trapdoor.
  2. **THE REFECTORY (185-199).**
     - THE FEAST is an ambush: troll captain, hearth goblin, priest, rock goblin.
     - The long tables are the platforms, at bench and table heights. The high table sits on a dais.
     - Two chandeliers hang on chains, and a reader's gallery runs along the wall.
     - THE KITCHEN at the west end holds checkpoint 1 and a CENSER-SWINGER.
  3. **THE KITCHEN FLUE (tight vertical, 166-199).**
     - Three braziers ride you up the chimney: the hearth one, a cold censer you strike, and an ember one.
     - At the top the flue turns east (the L) into the scriptorium.
  4. **THE SCRIPTORIUM (166-181).**
     - A dark zone at 0.62. Twelve desk candles are the only light: `lantern` ents with `candle:true`.
     - Two SNUFFERS put the candles out, so the room dims.
     - Three stacks piers with shelves, a mage, a priest, and a high-shelf silver.
  5. **THE CELLS (tight vertical, 163-181).**
     - Four monks' cells stacked up the east wall. Each cell has a cot as a step to a hatch at the alternate end.
     - A hearth goblin sleeps in one.
  6. **THE DORTER (149-162).**
     - The goblin camp: a fire bowl, looted cots, two-tier bunks on arched piers.
     - Foes: a troll, a priest on the bunks, and THE GONG MAUL elite (the knight row is moved here).
     - At the west end, a warming brazier lifts you to the roof hatch, next to shortcut bell 1.
  7. **THE CLIFF PATH (the one exterior, 119-145).**
     - Checkpoint 2 is on the dorter roof.
     - Route: the monks' rope ladder, then THE MONKS' HOIST (a counterweight pair), then the hanging scaffold (one failing-timber board), then crag spires under the broken shelf, then a rope up through the east tower's floor.
     - Bats sit round the hoist crag. Harpies and fledglings fly over the drop.
  8. **THE BELL TOWERS (88-118, above the cloud).**
     - Climb the east tower's bell rope and strike its bell: the DRAWBRIDGE (span 58-81 @91) comes down over the broken shelf.
     - The kept drawbridge beats: a harpy and a fledgling over it, and a priest on the far tower.
     - The east tower and an arch carry the hall floor above.
  9. **THE CHAPEL (59-84).**
     - The congregation sits in the pews. A priest leads from the altar steps, with a rock goblin, a sentry, a censer-swinger and another rock goblin.
     - The altar's censer brazier lifts you to the rood loft.
     - THE ROOD WHEEL turns one way to a silver in a relic niche, the other way to the trapdoor up into the guardian's hall.
     - Shortcut bell 2 is at the guardian's door.
  - **Changes in the kept top rows:**
    - The zig-zag plank stair from the hall to the crawl is now THE GREAT BELL'S ROPE.
    - The indoor birds in the crawl and the hall are gone.
    - The old side trapdoor that went round the golem gate is shut.
- **Checkpoints:** 3, down from 5-6. They are the kitchen (3,199), the dorter roof (10,145) and the crawl door (12,35).
- **Shortcuts (Salt & Sanctuary):**
  - A new `tbell` field, `rope: [x, y0, y1]`, in `src/main.js` (strike and `applyWorld`).
  - When struck, the bell lays a NET down the monks' rope well along the west wall, and the rope stays down after death.
  - Bell 1 runs from the dorter to the kitchen. Bell 2 runs from the guardian's door to the dorter roof. Both are unlocked from above.
- **Censer-swinger:**
  - A goblin priest with `censer: true`, in `src/main.js` `updateGobPriest`.
  - It walks back to its brazier. When you ride that brazier, it gives a told `!` swing (`snuffTell`, 0.5 s) and SMOTHERS the column: the ride dies under you.
  - The brazier comes back after `CENSER.cool`. A blow on the swing throws the censer-swinger off.
  - There are two: one in the kitchen (hearth brazier) and one in the chapel (altar brazier).
- **Tables keyed `spire` that switch only under MON3:**
  - `REVIEW`
  - `GARRISON`: no birds in the sprinkle
  - `AMBUSH`: THE FEAST
  - `ELITES`
  - `CHECK_DROP`
  - `STUCK.spire`: 11 new spots plus the last wheel
  - `STUCK_SIGNS`
  - `reach-gaps`

## LINT (all with MON3=1, Node only)
- **level-quality spire: CLEARS.** Route 640, 5 gadget kinds with 3 used in 3+ places, 3 checkpoints, 2 secrets off the route.
- **reach-heroes spire:** 0 new, 0 known, for all 9 heroes.
- **monk-machines:** 102 ok, 0 failed.
- **architecture:** everything stands.
- **stuck --static:** OK.
- **elites, ambush-listed, goblin-lint, one-new-foe:** all ok.
- **floating-geometry:** 18 groups, down from 98 on the old layout. 8 of them are old, in the kept rows 0-58. The other 10 are prayer-wheel stairs, which are machines.
- **anchor-lint:** 2, down from 3.
- **floaters:** clean.
- **RED: checkpoint-gaps spire.** 3 shrines, gaps 172/212/250, and "no shrine before the feast door". This is the old one-per-200 rule against Daniel's ~3 (question 3).
- **Not run:**
  - tools/check.mjs (as instructed)
  - stuck runtime
  - floats-in-page
  - mark-integrity
  - anything that uses cdp or headless

## BROWSER OWED (none opened)
1. **Play `?mon3=1`** with 1 seat and with 4 seats. Hero spots:
   - the flue ride and the L
   - the hoist
   - the scaffold, then spire, then rope grab (the paladin had the narrowest margin before the spire was widened)
   - the drawbridge
   - the rood wheel up to the trapdoor
   - the dorter brazier up to the roof hatch
2. **Bell ropes:** strike each one, die, and confirm the rope is still down. Time the 88-row climb up rope well 2.
3. **Censer-swinger:**
   - smother timing
   - whether it reads as fair (a told `!`)
   - whether it stalls when the player is above the column
   - the 4-seat case
4. **Scriptorium:** readability at dark 0.62, and how fast the snuffers clear it.
5. **FEAST ambush:** the gate columns 13/88. The entry trapdoor is inside the room.
6. **Win rate, mash rows, re-pilot and stuck runtime:**
   - win/mash rows
   - re-pilot (`level1-pilot spire --write`)
   - `tools/stuck.mjs` runtime

## ART OWED (art before live)
- **New props and flags:**
  - `statue{defaced}`: a saint in a goblin helmet
  - `lantern{candle}`: a desk candle
  - the refectory tables (`L.monk.tables`, with board legs)
  - the crate barricade
  - chandelier chains
  - the rope-well bells (no rolled-rope drawing yet)
  - the hoist hub crag
  - the crag spires
  - the arch from the east tower to the hall floor
  - the dovecote nook
- **The censer-swinger** needs its own sprite, card and name. It draws as a goblin priest today; give it its own `t` once it is arted.
- **Interiors are reused** (monkRefectory, monkScript, monkDorm, monkTower, monkHall, monkFlue, monkChapel). Check they read at their new sizes.

## QUESTIONS (recommendation first; the rec is built where it could be)
1. **False Abbot rework** (P1 in the chapel, P2 in the bell tower, floor collapse, shockwaves, braziers, congregation call).
   - **Rec: give it its own Opus boss lane on this branch.**
   - Why: the arena rows 14-31 and its house tiles are hard-coded in `src/false-abbot.js` and main.js, so this lane left them alone.
   - The chapel (59-84) and the east tower (59-115) now stand right under the arena, ready for that lane to fight in.
2. **Rooftop finale (rows 0-20).** **Rec: same boss lane**, because it moves the arena down.
3. **checkpoint-gaps is red at 3 shrines.** **Rec: add a spire exception**, because Daniel's ~3 plus the shortcuts outweigh the one-per-200 rule. The alternative is a 4th shrine at the feast door.
4. **Censer-swinger as a priest variant, not its own `t`.** **Rec: keep it a variant until the art pass, then promote it.**
5. **Bell-rope shortcut 2 is an 88-row climb.** **Rec: keep it and time it in the browser.** If it is slow, add a third rope bell at the cliff top.

Disk: C: had 4.2 GB free after the worktree was added (1.3 GB). Remove this worktree once its work has merged.

## TIP
`MON3=1 node work/mon3/dump.mjs 52 221` prints the whole new layout as ASCII. `MON3=1 node work/mon3/probe.mjs` lists which waypoints the reach model gets to, from the garth to the arena.
