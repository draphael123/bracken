# claude/canal - THE FOG CANAL (greybox, mechanics, wiring, music hook)

Base: claude/batch50 5049a98, with origin/claude/levelq merged in (the quality bar) and origin/master merged at the end.
Brief: docs/briefs/fog-canal.md (the section beats, the four machines, the foes, Jenny Greenteeth's footprint, the Folly comparison,
art notes).

## What was built

A new level, `canal`, THE FOG CANAL: out of Waymeet by night barge through a foggy canal to the old town's theatre quarter. The lit
theatre glows ahead through the fog the whole way. It is 432 columns and 56 rows, and its route is 402 tiles.

- **The rule**: THE BARGE GOES WHERE THE WATER LETS IT. A LANTERN SHOWS YOU - TO THEM TOO.
  - The canal water bites (20 health) and hands you back: onto the barge if you fell off her, else onto the last dry ground.
  - A sign on the quay tells you this.
- **Four machines.** Each one is taught, developed, twisted and examined, and each one is a hard requirement (the LOCK) somewhere.
  `tools/canal.mjs` proves both on the reach model or the rig.
  - **The barge.**
    - She drifts only while you ride her or stand ahead of her. She never leaves you behind, and she comes back to a quay if you are left there.
    - She stops at a shut lock gate, at a swing bridge that stands across the water, and at the edge of thick fog.
    - She rises and falls with the water in a lock.
  - **Lock gates.**
    - A paddle fills or empties its chamber at 34 px/s.
    - A gate stands open only while the water on both sides is level, and it never shuts on the barge.
    - A paddle cannot be struck again while its water is still moving, so a fight beside it cannot undo it.
    - Where they are:
      - One lock on the quay road.
      - A three-lock flight up the hill. Each paddle is somewhere new: on the gate's face, on a balance beam up a ladder, and across a swing bridge.
      - The summit gate that bursts into the weir run.
      - The basin lock in the exam.
  - **Fog, lanterns and foghorns.**
    - In the fog, archers shoot only at a hero standing in lantern light. A lantern post can be doused.
    - A thick bank stops the barge. A foghorn clears it for 9 s, then must wind up again (10 s, shown by a gauge).
  - **Swing bridges.** A bridge is either across the water, so you can walk it, or swung clear, so the barge can pass. Never both.
    - The mill bridge.
    - The garrison bridge: swing it and its archers fall into the canal.
    - The summit bridge: you cross it yourself, then must swing it behind you.
    - The basin bridge.
- **No walk-right opener.** The first screen drops 13 rows through a warehouse's broken floor. A ladder branches off to the roof, where there is a silver.
- **The twist.** At THE LONG ARCH the barge goes through the tunnel without you. You cross the rooftops and catch her on the far side.
- **The set piece (THE WEIR).** The summit gate bursts and the barge runs loose down the race, with a flood chasing her (`src/chase.js`, a new `water` look).
  - You duck under low beams on the deck.
  - **The agency is her TILLER.** It sits amidships, an arrow shows the helm, and the summit sign and the burst hint both tell you about it.
    - Steer into THE MILL CUT: three low beams, archers and a bargee on the bridges, and gentle drops down.
    - Or go over THE WEIR: one plunge that deals 22 damage unless you are in the air, then rapids with grindylows, and a silver only reachable that way.
- **The exam (THE THEATRE BASIN)** puts everything in one space:
  - Thick fog.
  - The bridge across the water.
  - The island past it, holding the horn, the bridge's capstan, and the elite Deck Foreman, who holds the gate to the lock door.
  - Archers on the high theatre bridge who see only the lit. A ladder lets you reach them.
  - A wisp over the weed, bright and dark weed, and grindylows.
  - Then the basin lock, which lifts her deck up to the lock door.
- **Foes (43; every one in a named designed encounter).**
  - Two new types, as Daniel chose:
    - **GRINDYLOW**: a ripple ring, then an ankle grab. Jump the ring or strike it. Three presses break the grab. It takes double damage out of the water or when stranded by a draining lock.
    - **WILL-O'-THE-WISP**: a false lantern, cold green with no post. It drifts ahead of you as a lure, gutters then flares (no knockback), and pops at one blow. It shies away in air a horn has cleared.
  - Two existing types:
    - Bargees are the Ore Road's gaffer. `e.bargee` lets them hook DOWN from a towpath, and a ducked hook now goes over and knocks nobody off.
    - Archers use `e.fogSight`.
  - No mummers.
- **Jenny Greenteeth's footprint** follows claude/lockkeeper 80de5c17's contract exactly.
  - sx 376, R 41: columns 376-415, rows 25-42, and row 43 is solid.
  - Doors are at rows 35-40. The corridor meets her west door at bed level.
  - CHECKPOINT THREE is just outside her west door at (375, 40).
  - The exact call is in a marker comment in `src/fog-canal.js` section 7 and in the brief:
    `stageGreenteeth({ set, block, plat: boards, ent }, T, TS, 376, 41)`
  - Until she is wired, a placeholder floor lies on her bed row and the level's gate stands inside her door.
- **She is foreshadowed**:
  - Green eyes open in the fog in four places.
  - A child's shoe on the quay's edge and one on the lock door's step.
  - Bubbles by the banks.
  - The grindylows (her grab in miniature).
  - **The two weeds are taught safely before her lock**, side by side over shallow water in the warehouse dock, with a sign: BRIGHT weed holds you 2.5 s then gives way; DARK weed is only water. They come back in the basin.
- **Checkpoints**: 3 (the mill top, the summit before the weir, her west door). The worst gap is 159 route tiles.
- **Music**: its own track `canal` (`audio/canal.ogg`). It is a 65 s barcarolle in A minor, 6/8, with a musette accordion and a hurdy-gurdy (drone and buzz), made by the lane's own synth tool (removed by claude/canalfix, 2026-10-01, when the canal took a real track). It is registered in TRACKS, MUSIC_NAMES, MUSIC_CREDITS and audio/CREDITS.txt.
- **Wiring**: canal `needs: 'waymeet'`, and the fair `needs: 'canal'` on this branch. The map node is at (50,154) on the inland sheet, between Waymeet and the fair.

## Code

- **New files**:
  - `src/fog-canal.js` (the level)
  - `src/canal-rig.js` (machinery, pure)
  - `src/canal-hands.js` (its hands in the game, and the draws)
  - `src/canal-foes.js` (the two foes, with greybox sprites)
  - `tools/canal.mjs` (the check)
  - `tools/canal-pilot.mjs` (route pilot)
  - `tools/canal-shots.mjs`, `tools/canal-map.mjs` (pictures)
  - the canal's synth music tool (since removed, claude/canalfix)
  - `docs/briefs/fog-canal.md`
- **main.js** gets about 45 one-line hooks: imports; EHP/COLS/spawn cases and bestiary cards; the grindylow's hurt rule and AMPHIB; the foe step, draw and frame; the reset, update and draw hooks; the mover hook; the fog overlay; the context block; the map node. There are also two small in-place edits:
  - The gaffer's downward hook for bargees, plus the fix that a ducked hook knocks nobody off. This also changes the Ore Road's gaffer; ore-road is green.
  - The archer's fog sight.
- **Other src**:
  - `src/reachcore.js`: `L.rigBands` (the same lines as claude/theatre's), and a level-scoped `L.noWade` so canal water is not a floor to the reach model.
  - `src/level.js`, `src/threat.js`, `src/marks.js` (BY_HAND, ANSWER and HEIGHT rows, then `tells --write`), `src/audio.js`.
  - `src/chase.js`: the `water` look.
- **Tool changes**:
  - level-quality: `canal` added to GATE.
  - check.mjs: `canal` added.
  - additional-areas and harvest-fair: the road order.
  - chase: `canal` added to its list of levels with chases.
  - slopes-trace: `canal` added, recorded with `--rebase=canal` because it is a new level. Its own trace is a regression baseline on the current mover; the other four levels are unchanged.
  - one-new-foe: a `NEW_EXACTLY` table holds the canal to exactly {grindylow, willowisp}. It fails with the list set to only grindylow.
  - ore-road's F10 block now walks the gate chain, as its own comment says. It had read every other level, so reusing the gaffer anywhere dropped the road's count.

## Checks (all run by name, all green)

- **The level's own:**
  - canal (pure, level and page). It fails on the base: "there is no level with id canal".
  - level-quality: canal CLEARS THE BAR, 10 of 10. The gated run still fails on `fair`, which was already failing on claude/levelq; that is not this lane.
- **The required list:** architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, npc-removal, slopes-trace (with `--rebase=canal`).
- **Content and data:** signs, sprinkle-cap, hint-shown, elites, audio-assets, progression, progression-runtime, map-grammar, additional-areas, additional-areas-runtime, collectables, one-new-foe, comments, homepaths.
- **Mechanics and foes:** chase, duck, traps (the only trap flagged is the keep's, already there before), killzones, tells, answer-tags, threat-holes, ore-road.
- **Route pilot (real keys, no god mode)**: both heroes reach her door.
  - knight: win, 0 deaths, 255 s.
  - pyro: win, 0 deaths, 286 s. She was thrown off in the race once, and the level handed her to the basin bank as designed.
- **Captures** are in `work/claude/canal/`:
  - full-level.png
  - map.png (the data map)
  - 1-the-barge-ride
  - 2-a-lock-filling and 2b-the-lock-full
  - 3-the-fog-wall and 3b-the-horn-clears-it
  - 4-weir-0..3 (the weir run in motion, a second apart)
  - 5-the-basin-exam
  - 6-the-rooftops

## The Mage's Folly comparison (level-quality)

| | Folly | Canal |
|---|---|---|
| width / route | 808 / 723 | 432 / 402 |
| flat, long empty / long level ground | 11% / 33% | 13% / 13% |
| height bands / share of width with a second height | 8 / 61% | 7 / 59% |
| gadget kinds / kinds in 3+ places | 12 / 4 | 6 / 3 |
| secrets off the route | 3 | 2 |
| checkpoints (route tiles each) | 7 (103) | 3 (134) |
| density / empty screens | 2.39 / 23% | 2.22 / 17% |
| route span / pockets | 30 rows / 5 | 27 rows / 2 |
| set pieces | flying books, the orrery, the room turned over | the long arch, the fog wall and its horn, the weir run (chase with a helm) |

Honestly: the canal clears every bar the Folly clears, but it is half the length. It carries four big machines rather than twelve small ones, and it has fewer pockets and no mini or ambush room.

## UNVERIFIED

- No human has played it. The pilot is a scripted hand; it proves the route and the machines with real keys, not the feel.
- In the full-level picture the weir looks dark in places: the chaser's water sheet is drawn at the burst gate. It is fine in play.
- The fog's density, the horn's 9 s window and the barge's speed (55 px/s) are untuned first guesses.
- Grindylow grabs from the barge while she is moving were seen in the pilot, but not tuned.
- The greybox art is plain shapes. The grindylow and wisp sprites are placeholders.
- **Merge with claude/theatre**: expect trivial conflicts where both lanes added a line next to each other:
  - `src/main.js` hooks in updateVillage, drawVillage, updateMovers, drawWorld and drawRoomPaint, plus INLAND_NODES and INLAND_PATH.
  - `src/audio.js` TRACKS and MUSIC_NAMES.
  - `audio/CREDITS.txt`'s tail.
  - `tools/check.mjs`, additional-areas, harvest-fair and slopes-trace IDS.
  - `src/reachcore.js`: my comment line differs from the theatre's (I dropped its cite of src/theatre-rig.js, which dangles on this branch).
  - To resolve: keep both lines everywhere. Set the theatre's `needs: 'canal'` and the fair's `needs: 'theatre'`. Order the road waymeet, canal, theatre, fair. Move the theatre's map node to about (62,151) so it does not crowd the canal at (50,154). Set tools/additional-areas and harvest-fair to that four-step chain. Merge the `?level=` jump from claude/theatre, which I did not duplicate.

## QUESTIONS FOR DANIEL (the recommended option is the one built)

1. **Canal water hurts** (20 damage, handed back onto the barge or the bank), the way the Marsh's water does, rather than being swimmable. Recommend keeping it: it is what makes the barge a real requirement and gives Jenny's water its menace. The alternative is swimmable water with the weed-choked stretches only.
2. **The tiller sits amidships** in the greybox, where it is easier to reach mid-run. Recommend moving it to the stern with a longer strike box in art.
3. **Three checkpoints** (mill, summit, Jenny's door) with a 159-tile worst gap. Recommend keeping it. A fourth would sit in the fog bank.
4. **Bargees are the gaffer** reused, with a new ability to hook downward. A ducked hook now knocks nobody off anywhere, including the Ore Road. Recommend keeping it: ducking is the hook's marked answer.
5. **The weir branch's plunge** deals 22 unless you are in the air, and a silver is only reachable down that way. Recommend keeping it: a trade against the cut's beams and archers.
6. **Theatre map node at merge**: recommend moving it from (56,154) to about (62,151).
