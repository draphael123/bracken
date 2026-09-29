# claude/undeadchase: THE SPIRAL STAIR (the Falling Tower's chase to the Undead Archmage)

Daniel, 2026-09-29: "a section climbing up the tower after the mini boss (the Sexton) where you go through a PORTAL and CHASE THE
ARCHMAGE UP A SPIRAL TOWER as he shoots bolts at you like the fight. You eventually reach a PORTAL with a MAGIC CARPET and the fight
commences as usual." Branch `claude/undeadchase` (off master a840ae8), pushed. Nothing merged, nothing deployed.

## What changed

1. **His ring on the parapet.** The crown's parapet used to hold the door straight into his hall. It now holds HIS RING: the ring art
   from his fight, with the desert inside and his green sparks turning round it (`drawRingDoor` in `src/spiral-chase.js`). You walk
   into it; you don't press anything. It takes you to the foot of the spiral stair. The ring you come out of stays open behind you.
   The crown's sign now reads "HIS RING STANDS OPEN ON THE PARAPET: HE WENT THROUGH IT."
2. **The spiral stair** (`src/spiral-chase.js` `buildSpiral`, called from `src/tower-ascent.js`). It is a stair tower of its own in
   the same grid, east of the Falling Tower's wall. The grid is 110 wide now, where it was 72, and there is solid rock between the
   two. It uses the tower's stone and slate ledges. A new room kind `'spiral'` in `src/redraw/fallen_tower.js` paints a stone newel
   up the middle, with a helix of treads wrapping it (lit at the front, in shadow behind), and a hole in the wall high up with **his
   moon** in it. There are **six flights**, each turning at a landing against the wall, each a different shape:
   1. THE STAIR: whole steps. Fire only.
   2. THE BROKEN STAIR: a step is missing, so there is a real jump over the gap. Fire and ice.
   3. THE FAILING STAIR: two of its steps are the tower's failing stone. Death mark and fire. **Checkpoint** on its landing, the
      middle of the climb.
   4. THE STONES: two-tile footholds. Ice and fire.
   5. THE GALLERY: one long failing walk. Death mark and fire.
   6. THE LAST STAIR: a gap and a failing step. All three spells. **Checkpoint** at the top, beside the carpet.
3. **The chase** (`updateMageChase`). He is run down, not fought.
   - He floats over the landing at the end of the flight you are on, 4 rows up, and waits there. When your feet reach that landing,
     he swoops on to the next one.
   - He casts only from a landing, only the spells that flight teaches, and only while his whole body (28 px in from the frame's
     edges) and you are both on the screen. He never casts from off the screen.
   - The spells are his fight's own, with the same tells, marks and numbers: FIREBOLT (`fireTell`, yellow !), ICE LANCES
     (`iceTell`, yellow !, the fan of five), and the DEATH MARK (`markTell`, red !!, step out of the ring).
   - Stone walls stop his bolts.
   - **It teaches his fight's opening:** when a death mark finds no one, he flinches open for 1.2 s and says "THE MARK FINDS NO ONE:
     IT COMES BACK ON HIM". Here you can't use it, because he is out of reach and blows do nothing to him (`hurtEnemy0`).
   - At the top he flies through his door ahead of you.
   - He has new rows in `src/marks.js`: `magechase|fireTell ! / iceTell ! / markTell !!` in BY_HAND, and ANSWER rows
     block / block / dodge. `tells --write` was run, so the table now has 587 rows.
4. **The carpet at the top.** The door into his hall (the purple well) and `L.carpetAt` both moved to the top of the stair. The rug
   now hovers in front of the door (`sanctum.rug`, `src/carpet.js`). Stepping onto it runs the same board code as before: he wakes
   in his hall with the moon, and **his fight is untouched**. A death in the fight still brings you back five tiles from the
   carpet, which is on the stair's top floor.
5. **Camera on the stair** (`src/main.js`):
   - The stair is seen **zoomed out**: `chaseView()`, asked by `desiredView()`.
   - The camera is held to the stair tower's walls, centred on it (a `camLock` marked `spiral`, released as you leave).
   - It looks up the stairwell far enough to keep him in the frame while keeping your feet on screen.

**Other things touched:**
- `src/reachcore.js`: the fill follows a `ringdoor` pair the same way it follows a doorway.
- `src/deadends.js`: the carpet's door (`L.carpetAt`) counts as "the point of going". Without this, the stair's top was paid as a
  dead end with a heart right before the boss, which would have been a heal the level never had.
- `tools/pacing.mjs`: a carpet fight's route ends at the carpet, so `checkpoint-gaps` measures the real route through the stair.
  Before this, the route bridged through the sky from the parapet.
- `updateTowerAscent`: does nothing while you are on the stair, so the tower's floors don't arm or fall from a different place.
- A checkpoint on the stair counts every tower floor as behind you.

## Numbers
| | before (a840ae8) | after |
|---|---|---|
| grid | 72 x 306 | 110 x 306 (the stair: interior 26 x 54 tiles, rows 70-123; with its walls about 30 x 56) |
| checkpoints in the level | 13 | 15 (the two on the stair) |
| walked route (pacing) | 567 tiles | 690 tiles, longest run without a checkpoint 84 (limit 150) |
| coins | 321 | 341 (sprinkler) |
| hearts (mend) | 4 | 4 |
| foes | 67 | 67, plus him on the stair (the stair is calmed, so no sprinkled foes) |

In play (`tower-chase`), a bot using the game's own physics and an edge-jump climbs all six flights in about 27 s. It meets 5 told
casts on the way, none from off the screen. A person will be slower and see more.

## Checks (named subsets, not the suite)
- **New check `tower-chase`**, added to `check.mjs`'s list before `]) if (take(t))` (grep matched). It covers:
  - the portal, and that it is load-bearing (take away its `to` and neither the stair nor the carpet is reached)
  - that the stair is climbed with a real jump: the `across: 5` fill stands on every step, landing and the carpet
  - THE RULE BITES: with a 3-column jump the fill does not reach the top
  - two checkpoints, in the middle and at the top
  - his spells in Node: asleep until you are through; never casts while off the screen; flight 1 is fire only; tells at least his
    fight's length; fire and ice blockable and the mark unblockable; stepping out of the mark makes him flinch; he moves on at
    his landing; walls stop bolts; he goes through his door at the top
  - in the page: walk into the ring and come out zoomed out at the stair's foot; climb all six flights; every cast marked and on
    screen; boarding the carpet starts his fight in his hall; a death after the middle landing respawns you there with him ahead
  - On a840ae8 it fails at once, because there is no `src/spiral-chase.js`, no ringdoor and no stair.
- **All green:** tower-chase, tower-ascent, tower-hall, tower-collapse, tower-cutouts, tower-flyers, archmage-room, archmage-rings,
  sexton, mini-walls, boss-fight-end, boss-openings, tells, answer-tags, checkpoint-stand, checkpoint-gaps, checkpoints,
  zoom-coverage, architecture, skins, dangling-paths, slopes-trace (unchanged, not rebased), npc-removal, deadends, traps (the
  same "1 trap to fix" as master, in other levels), killzones, elites, spawns, floaters, threat-holes, one-new-foe, signs,
  undead-foes, queen-comb, folly-runtime, gate-alpha, crown-exam. Also every other check that names tower, undeadmage, sexton or
  falling: ore-road, ore-ride, keep, deadly-water, burning-village, witchlight, watchtowers, buried-dead, burial-route, unburied,
  geomancer, lance-support, footing-art, kraken-rework, desert-ledge-art, whelps, stormhold2, stockade-horns, hanging-exam,
  monastery3-beats, kings2-beats, ore-exam, courtyard, push-blocks.
- **Tests changed because the level changed** (not weakened):
  - `tower-ascent`: the grid is wider east of the tower; there are 8 room kinds; the stair has its own calm; the carpet is reached
    at its new row; the ending test boards at the stair's top.
  - `tower-collapse`: the stair's failing steps come after the crown on the route, so they are asserted separately.
  - `tower-cutouts`: now also holds the stair's room (8 rooms).
  - `archmage-room`: read the grid with its own width. It had used the tower's 72, which read row 13 as solid.
  - `archmage-rings`: boards at the stair's top, because the parapet is the ring now.
- The full suite was not run. No bot pilots were run, because his fight did not change.

Pictures: `work/undeadchase/after/` (`node tools/chase-shots.mjs <tag>`, a picture tool, not in the suite).

## UNVERIFIED
- No human hands on it yet. The bot climbs with god mode on; nobody has checked damage taken on the way up without god mode.
- The zoom size depends on the window. At the smallest window (320x180) he waits more, because his "whole body on the screen" rule
  is harder to meet there.

## QUESTIONS FOR DANIEL
1. **Where the portal is.** I put his ring on the crown's parapet, where the door into his hall was. So after the Sexton you still
   climb the upper loft and the crown, then the ring, then the stair. The other reading is to put the ring just past the Sexton's
   portcullis and let the stair replace the upper loft and the crown, which keeps the level the same length.
   *Recommendation:* play it as built. If the tower now feels too long, cut the crown's climb and move the ring down to the Sexton.
2. **Length:** six flights, 45 rows of climb, two checkpoints. *Recommendation:* keep; trim to four flights if it drags.
3. **The zoomed-out view on the stair**, like his fight. *Recommendation:* keep. It is what lets him cast without being off screen.
4. **He flinches open when a mark finds no one, but can't be hurt on the stair.** Should a blow during the flinch do something (for
   example, knock him on to his next landing)? *Recommendation:* no. Keep the chase a lesson and the fight the payoff.
5. **Falls on the failing steps** cost up to 13 rows, one or two flights back down. *Recommendation:* play it first; soften the
   counts (2.5 s, and 2 s on the last stair) before changing the shape.
6. **Coins:** the sprinkler put 20 more on the stair. *Recommendation:* fine as it is.
