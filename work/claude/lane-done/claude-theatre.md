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
