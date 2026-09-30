# claude/theatre - THE MASKWRIGHT'S THEATRE (greybox: geometry, machinery, encounters, wiring)

Base: claude/housekeep a6d58b4, plus a merge of origin/claude/levelq (the quality bar, aaee2a5). Brief: docs/briefs/maskwright-theatre.md (the record,
the section-by-section beat table, the comparison with THE MAGE'S FOLLY, notes for the art lane).

## What changed
- NEW LEVEL `theatre`, appended to LEVELS (no index or save moves): 344 x 50, between WAYMEET and THE HARVEST FAIR (theatre needs waymeet; the fair
  needs theatre now). Map node on the inland sheet at (56,154), inserted in road order after Waymeet (map-grammar requires it; saves keep nodes by id).
- `src/maskwright-theatre.js` (the level), `src/theatre-rig.js` (the pure machinery), `src/theatre-hands.js` (the machinery in the game and its
  greybox drawing). main.js carries only one-line hooks (import, reset, step, draw, mover step/draw, room paint, the audience's footlights in the
  drunk's spawn and sight, a lamp's light counting as a look for a mummer) and the context object they are handed.
- THREE MACHINES, each taught -> developed -> twisted -> examined: LIMELIGHTS (strike to swing; a mummer in a lit pool is SEEN and cannot move;
  scenery between lamp and pool darkens it), FLY LINES (a batten and its sandbag on one rope; a rope-lock runs the line; the sandbag lands on foes;
  ride the batten up or the weight down), FLATS (scenery on a track, slid by a winch: a step, a timed door on the show's cue, a FLOOR over the sump,
  a painted shutter hiding the prop store). Plus stage TRAPS on cues and a STAR TRAP.
- SET PIECE: THE PERFORMANCE - the curtain rises when you reach the stage; three lamps sweep on their cues, the cast freezes in the light, the audience
  (drunks in the boxes, `footlights`: they throw only at a lit hero) throws, the scene-change flat opens and shuts the way on its cue, traps drop.
- The FACING RULE pre-taught for the fair: the first foe is one mummer alone in the stage-door passage with the rule on a sign.
- FIVE heights: grid 7, fly floor 15, boxes/galleries 24, stage 33, under-stage 43; the rehearsal stage is crossed over, across and under.
- Foes: 33, all hand-placed in named squads (18 mummers, 4 drunks, 4 sworn swords, 4 bats, 3 spiders); NO new foe (the drunk in a box is the
  brief's mask-thrower, re-read as the audience). One ELITE: the door guard (a sworn sword) holds the stage door (the elites check requires one).
- 3 checkpoints (141,15 / 167,43 / 297,33), route 434 tiles, gaps 148/146/134 (checkpoint-gaps: <=175). 3 silvers, all off the route (costume loft,
  grid, prop store). No relic (question 4).
- MUSIC: its own track `theatre` (audio/theatre.ogg, "The Maskwright's Waltz"), a PLACEHOLDER composed and synthesised by tools/theatre-music.mjs
  (nothing downloaded; ffmpeg on this PC encodes it). Credited in audio/CREDITS.txt and MUSIC_CREDITS. The art/music lane composes the real one.
- THE PUPPETEER: not merged (the safer choice - his branch also adds a hidden 'puppetstage' level and boss-check rows that must be re-pointed
  together). The main stage is KEPT FREE for his stage: columns 300-339, rows 18-35, floor row 34; the exact call is written in section 10 of
  src/maskwright-theatre.js and in the brief: `stagePuppeteer({ set, block, plat: boards, ent }, T, TS, 300, ST)`, its movers into moversExtra,
  `arena: P.arena, gateAfterBoss: true`, the gate moved from 303 to (341,33). Until then the level's gate stands just inside the stage door.
- src/reachcore.js: `L.rigBands` (a fly line's travel) is a ride band, and each line's two stops are footing (a batten stands at a stop until struck).
- src/threat.js: the machinery's kinds weigh 0 (spotlamp, flylock, flatwinch, stagetrap, startrap).
- Tools: tools/theatre.mjs (the CHECK, registered), tools/theatre-pilot.mjs (route pilot), tools/theatre-map.mjs (data map), tools/theatre-shots.mjs
  (full-level image + sections), tools/theatre-music.mjs (the placeholder track). tools/harvest-fair.mjs and tools/additional-areas.mjs follow the
  new road (Waymeet -> theatre -> fair). tools/slopes-trace.mjs traces the theatre too (baseline recorded with --rebase=theatre: a new level, so
  a regression baseline on the current mover; the other four levels' traces unchanged).

## Numbers
- level-quality (claude/levelq): THEATRE CLEARS THE BAR (all ten) - see the table below. INDEX (src/threat.js measureLevel): 98 (Waymeet 113, the
  current fair 48; target ~111: question 5).
- Route pilot (`node tools/theatre-pilot.mjs knight,pyro 0`), real keys, NO god mode, start to the stage door, all 27 legs ok for both:
  KNIGHT win in 221 s, 1 death (in the under-stage, to the understudies; woke at checkpoint two and went on); PYRO win in 230 s, 0 deaths
  (down to 29 hp in the performance). The pilot plays the machines as a player would: strikes the lamp, the winches and the rope-locks, rides
  batten A, calls and rides B, flies the bridge, rides the weight down, waits for the scene change, drops through the trap, slides the floor flat,
  holds jump on the star trap, slides the wing flat, rides G.

| level-quality measure | THE MAGE'S FOLLY | THE MASKWRIGHT'S THEATRE |
|---|---|---|
| flat (empty / level ground; longest) | 11% / 33%; 43 / 81 | 14% / 33%; 47 (the empty main stage) |
| bands (on route; width with a 2nd height) | 8; 61% | 7; 57% |
| mechanics (kinds; in 3+ places) | 12; 4 | 6; 5 |
| music | musUnder | theatre (own file) |
| secrets off route | 3 | 3 |
| checks (count; route tiles each) | 7; 103 | 3; 145 |
| encounters | every 200 cols | every 200 cols |
| density (foes/screen; empty) | 2.39; 23% | 2.36; 7% |
| slopes | none | none |
| route (rows spanned; back; pockets) | 30; 0; 5 | 30; 50; 6 |
| size | 808 cols, 723 route tiles | 344 cols, 434 route tiles |
| set pieces | ambush room, mini (Homunculus), orrery ride, upside-down floor | ONE: the performance |

## Checks run (named, lane rules)
GREEN: theatre (pure + page), architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, npc-removal, slopes-trace (5 levels identical;
theatre added), signs, sprinkle-cap, hint-shown, elites, audio-assets, progression, progression-runtime, harvest-fair, map-grammar,
additional-areas, additional-areas-runtime, spurs-runtime, boss-fight-end, traps, killzones, collectables, keys, spawns, deadends, threat-holes,
one-new-foe, comments, homepaths.
level-quality: THEATRE clears all ten; the check as a whole is RED because it also gates THE HARVEST FAIR (the fair rework lane's job; red on
claude/levelq itself too).
Proved-red first: the theatre check's audience assertion failed (the drunks' `footlights` flag was not carried through the spawn) until the spawn fix.

## UNVERIFIED
- Nobody has played it by hand. The pilot proves the route and the machines with scripted keys; it lifts out a foe after 40 plain swings (it cannot
  parry a sworn sword) and says which.
- The full suite was not run (lane rules). Page checks beyond the list above were not run.
- Greybox art only: the rock tile is the village's, rooms are flat colour, every machine is a plain shape; the curtain is drawn in the world layer.
- The longest flat run the lint reports (47) is the empty main-stage room, which it counts until the Puppeteer's arena lands.

## QUESTIONS FOR DANIEL (recommendation built)
1. No new foe: the brief's "mask-thrower in a box" is the DRUNK in a box with `footlights` (throws only at a lit hero), and the "stagehand brute" is
   a sworn sword under a sandbag. Rec: keep; the art lane gives the box drunks a masked-patron skin. Alternative: a real STAGEHAND foe (sandbag swing).
2. 18 of 33 foes are mummers (the fair's own). Rec: keep - the theatre is where the masks are made, and the fair opens on twists. Alternative: swap
   the workshop trio for something else.
3. Checkpoints: three (one per ~145 route tiles), none right before the performance (the fly floor's top is ~80 tiles before it). Rec: keep (the
   Salt & Sanctuary cost). Alternative: a fourth at the stage-right wing.
4. No relic in the level (three silvers). Rec: the Puppeteer's reward is the theatre's relic, as the Wicker Queen's is the fair's.
5. INDEX 98 against the ~111 target. Rec: tune by play after art (the performance's density is the lever), not by adding bodies now.
6. The scene-change flat has no winch (the show runs itself). Rec: keep. Alternative: a winch that takes it off its cue (it was built and removed:
   it made the timed door trivial).
7. Merge: the Puppeteer is wired at the merge by the coordinator (the call is written down). Rec: that; the other route is merging his branch here.

---

# THEATRE2 (the review's FIX-FIRST, and Daniel's four picks)

The reviewer: the middle (fly tower, fly floor, performance, under-stage) is a real place and better than most of the Folly. The opening was a
walk-right corridor, the lamp was never required, and the exam was a queue. Everything below is built, checked and walked.

## Fixes 1-8
1. **Opening, no longer a corridor.** The dressing rooms are stacked over the costume store and the workshop, on a slab at rows 25-26. The store
   ends at the racks, so the only way on is a ROPE up through a hatch. The rooms end in a DROP into the workshop, then up to the dock's sill and the
   tower.
2. **The lamp is a LOCK, in two rooms.**
   - The teach reads now: one player is held in the pool beside the rope, so you can climb with your back to it. The follower behind you is gone.
   - LOCK ONE, THE CHORUS: a wardrobe keeps sending players after you, one every 2.2 s, up to three at a time. A lamp swung onto its doorway freezes
     the next one IN the doorway, which plugs it.
   - LOCK TWO, THE FITTING: the drop into the workshop lands you between two players, too close to face both. You have to swing the carvers' lamp
     onto one of them FROM ABOVE before you drop.
3. **The exam is one combined problem.**
   - The prompt box's floor lamp starts on you, so the drunk throws. Swing it onto the player waiting under the box and you are in the dark.
   - While the flat door is shut, it SHADOWS the winch spot from a follow spot on the fly rail (always cued), using `beamClear`. Open the flat and
     that lamp reaches you on its cue.
   - The door guard's sandbag hangs on its own line (fix 6).
4. **The show can be reached.** There is a rope up into each box, so a melee hero can reach the audience and the box lamps (a struck box lamp comes
   off its cue). A PROMPT DESK (`cuelever`) holds all of the show's lamps or releases them.
5. **Signs.** The twist and exam signs are cut: the bridge, the weight ride, "the trap at stage left", the under-stage sign, "flown out", the exam
   sign. "BEGINNERS, PLEASE." replaces the performance sign. The teach signs stay. The check fails any spoiler sign.
6. **The door guard is lured.** The elite is now off every drop point. His sandbag is on line H, with locks on the floor and on the gallery, and you
   bring him under it. Batten G's own sandbag lands on a mummer standing under it, which is what its comment says now.
7. **The sump flat is timed.** It has no winch. It runs out and back on a cue of its own, 3.5 s out in every 7, and an understudy stands on it when
   it slides home.
8. **Bats go for the light.** In the theatre a bat goes for a hero standing in a lit pool, otherwise to a lit pool, and leaves you alone in the dark.

**?level= playtest jump:** `?level=<id>[&hero=<id>]` starts any level from its entrance and never saves (the same guard as `?boss=`). It is
documented in docs/PLAYTEST.md and proved by `tools/level-jump.mjs`, which was run red first with the save guard removed. To play the theatre:
`?level=theatre`.

## Daniel's picks
- **A. THE HOUSE** (72 columns at the front): the foyer, then the grand stair to the dress circle, where the usher teaches the facing rule alone.
  - THE CHANDELIER hangs over the stalls on a line. Strike its lock on the balcony front and it comes down on the stagehands below, then lies there
    as a step.
  - The raked stalls step down seven rows to the ORCHESTRA PIT (music stands and broken ones as spikes). THE KETTLE DRUMS on a riser throw you up
    onto the apron. A stage box holds a silver and a shy dead. The pass door leads to the stage door.
  - Everything backstage slides right 72 columns in `buildMaskwrightTheatre`, all of its data included.
- **B. THE PERFORMANCE IN ACTS** (14 s each):
  - A bell rings before each act and the track of whatever moves glows.
  - ACT II: a painted CLOTH flies in as a platform, and the scene flat stays down as a wall you go over by the cloth.
  - ACT III: the way off opens and the CURTAIN comes down over 18 s. If a hero is still on the stage when it lands, the show starts over from ACT I.
    Nobody dies of it.
  - More heads appear in the boxes each act, and the audience throws sooner each act.
  - A kill made in the light is CHEERED: a thrown flower gives +6 health. A lit hero is BOOED and gets thrown at sooner.
- **C. THE MIRROR ROOM and THE STAGEHAND.**
  - Past the quick-change door, a player the mirrors show you is WATCHED while you are in the room with it. The hook is local to mirror zones, in
    updateMummer's lookers.
  - THE STAGEHAND (`src/theatre-foes.js`) is the one new foe: 56 hp, weighed 5. Its SWING is a red !! told for 0.8 s, 18 damage, unblockable, and
    leaves it open for 1.1 s. Its DROP: when you are above it, it hauls a line and a sandbag falls on the spot you stood on, with a growing shadow as
    the tell.
  - The stagehand's rows are in the mark, ANSWER and HEIGHT tables, and `tools/tells.mjs --write` was run. There are 4 stagehands: the stalls,
    the front stalls, the tower floor and the lighting bridge.
- **D. The Puppeteer, foreshadowed** (drawing only): strings run from the flies to the cast during the show. In ACT II one string jerks a cast
  member; it is told by the string flashing and is harmless. The first time you are out on the lighting bridge, HIS silhouette is in the rigging for
  about 2 s, then gone.
- **The Puppeteer's room** keeps columns 372-411 and rows 18-35 free, with row 36 (R+2) solid under the whole stage for PUPPETEER2's trapdoor pits.
  The theatre check asserts both.
  - The exact call is in the marker comment and the brief: `stagePuppeteer({set, block, plat, ent}, T, TS, 372, ST)` after the shift, with the
    gate moving from 375 to 413.
  - Last section: for now it is written down as the arena-to-be (a sprinkle-cap `squadBands` entry, since no squad belongs in a boss room).
  - I did NOT merge his branch (the safer route: re-pointing his rows goes with deleting 'puppetstage').

## Numbers
- level-quality: THEATRE CLEARS ALL TEN on 416 columns, route 521 tiles.
  - flat 19% / level ground 21%; 8 height bands; 57% of the width has a second height.
  - 7 gadget kinds, 4 of them used in 3+ places; its own track; 3 secrets off the route; 4 checkpoints, one per 131 route tiles.
  - 2.2+ foes a screen with 18% empty screens; no slopes; the route spans 30 rows with 10 branches.
- INDEX 106 (target ~111; it was 98). How it got there, all designed placements:
  - The house added the stagehands.
  - Two shy dead (`boo`): the house's ghosts in the stage box and over the pit.
  - Two haunts: a flying knife in the workshop and the prop store's guard.
  - The stagehand is weighed 5.
- Foes: 41 in total. Mummers went from 19 to 17; there are 4 stagehands.
- Checkpoints: 4 (87, 213, 239, 369). The route gaps are 94 / 143 / 146 / 134. With the house the route is 521 tiles, and three checkpoints cannot
  meet the 175-tile rule.

## Checks (THEATRE2, re-run on the final geometry)
- **Green:** theatre (both the rules-only part and the in-page part), level-jump, architecture, checkpoints, checkpoint-gaps, skins,
  dangling-paths, npc-removal, signs, sprinkle-cap, hint-shown, elites, audio-assets, progression, progression-runtime, harvest-fair,
  map-grammar, additional-areas, additional-areas-runtime, spurs-runtime, boss-fight-end, traps, killzones, collectables, keys, spawns,
  deadends, threat-holes, one-new-foe, comments, homepaths, tells, answer-tags, untold-told.
- **level-quality:** the theatre passes all ten. The check as a whole is still red only because it also gates the current fair, as before.
- **slopes-trace:** THE THEATRE IS TAKEN BACK OUT of the trace. Its machinery runs on clocks of its own and its stage door is an elite's gate. Two
  recordings of the same build differed at the stage door (frame 1200), so it is no baseline for the mover; the level has no slopes.
  `docs/slopes-trace.json` is byte-identical to master's again, and the four original levels are unchanged. (THEATRE1 had added it.)

## Route pilot (THEATRE2: `node tools/theatre-pilot.mjs knight,pyro 0`, real keys, no god mode)
- **KNIGHT: win in 226.9 s, 0 deaths, all legs ok.**
- **PYRO: win in 291.5 s, 3 deaths**, all in the under-stage around the timed sump and the understudies. It woke at checkpoint three and went on.
  One leg was logged as MISS mid-recovery and it recovered.
- The pilot plays every machine: the chandelier, the drum, the rope, the chorus lamp, the quick-change door, the fitting lamp, the ground row,
  batten A, battens B and D, the weight ride, the show, the trap, the timed floor flat, the star trap, the exam lamp, the flat, batten G and the
  door guard.
- Captures: `work/claude/theatre/full-level.png` (the whole level drawn by the game), `work/claude/theatre/map.png`, and section shots 0-7 there,
  including the house, the chandelier, both lock rooms, the mirror room and act two's cloth.

## UNVERIFIED (THEATRE2)
- Nobody has played it by hand. Act timings, the chorus rate, the stagehand's numbers and the cheer are all first guesses.
- The pilot's legs are scripted, and it removes any foe that turns 40 of its plain swings (it cannot parry the sworn swords).
- The deco stand-ins (mirror, wardrobe, seats, stands) and the stagehand sprite are greybox.

## QUESTIONS FOR DANIEL (THEATRE2; the recommendation is what's built)
1. **Four checkpoints** (the house made the route 521 tiles). Rec: keep four. Otherwise the house would need to be shorter.
2. **INDEX 106 against ~111.** Rec: tune it in play after art, not by adding bodies.
3. **ACT III.** If the curtain lands with you still on the stage, the show restarts; you do not die. Rec: keep. The harsher option is a death.
4. **The cheer is +6 health.** Rec: keep it modest. Alternative: coins.
5. **The shy dead and the haunts** were added partly for the index, placed as the house's ghosts and flying props. Rec: keep. Alternative: cut them
   and accept INDEX ~98.
