# THE MASKWRIGHT'S THEATRE - brief (greybox: geometry, machinery, encounters, wiring) - THEATRE2

Status: ART + MUSIC on `claude/theatreart` (the greybox was `claude/theatre`; its art notes are kept at the end, with what was done). THEATRE1 (2026-09-30) was reviewed against THE MAGE'S FOLLY: FIX-FIRST (the middle - fly tower, fly floor,
performance, under-stage - is a real place; the opening was a walk-right corridor, the lamp was never required, the exam was a queue). THEATRE2
fixes all eight review points and adds Daniel's four picks (THE HOUSE, THE PERFORMANCE IN ACTS, THE MIRROR ROOM + THE STAGEHAND, the Puppeteer's
strings and glimpse). Art and the composed track are the next lane's (notes at the end). THE PUPPETEER, its boss, is claude/puppeteer (a module of
its own); this level leaves him his room and the exact call. Play it directly: `?level=theatre[&hero=<id>]` (docs/PLAYTEST.md; never saves).

## What it is

The playhouse where the fair's masks and puppets are made, gone strange at dusk, on the road inland **between WAYMEET and THE HARVEST FAIR** (theatre
`needs: 'waymeet'`, fair `needs: 'theatre'`), and on the inland map between them. Built in `src/maskwright-theatre.js` (the backstage in its own
columns, THE HOUSE grown in at the front); machinery `src/theatre-rig.js` (pure), hands `src/theatre-hands.js`, the stagehand `src/theatre-foes.js`;
main.js carries one-line hooks. Proved by `tools/theatre.mjs`; walked by `tools/theatre-pilot.mjs`; pictured by `tools/theatre-map.mjs` and
`tools/theatre-shots.mjs`; its placeholder track by `tools/theatre-music.mjs`.

**THE RULE: THE HOUSE IS WATCHING. WHAT STANDS IN THE LIGHT CANNOT MOVE.** A masked player moves only while nobody watches it (the fair's facing
rule, `src/mummer.js`, pre-taught here); a LIMELIGHT watches too; the MIRRORS watch too; and the audience throws at - and the bats go for - whoever
stands in the light. Light is a tool against the cast and a danger from the house.

## The three machines (each TAUGHT -> DEVELOPED -> TWISTED -> EXAMINED), and the rest

| machine | taught | developed | twisted | examined |
|---|---|---|---|---|
| THE LIMELIGHTS (`spotlamp`) - strike to swing; what stands in the pool is SEEN; scenery between lamp and pool shadows it | the costume store: one player held in the pool beside the only rope up - climb with your back to it, safe | THE TWO LOCKS: (1) THE CHORUS - the wardrobe keeps sending players after you until a lamp swung onto its doorway freezes one IN the doorway and plugs it; (2) THE FITTING - the drop into the workshop lands you between two players too close to turn to both: swing the carvers' lamp onto one FROM ABOVE first | THE PERFORMANCE: the lamps keep their CUES (a prompt desk holds them; a box lamp struck comes off its cue); the cast freezes in the light, the audience throws at the lit and BOOS you; a kill in the light is CHEERED | THE FAR WING: the prompt box's floor lamp starts on YOU (swing it onto the player under the box); the flat door SHADOWS the winch spot from the follow spot on the fly rail while it is shut and lets it through once open |
| THE FLY LINES (`flylock`) - a batten and its sandbag on one rope, strike the rope-lock and the line runs | the tower: stand on batten A, strike, ride up | batten B flown out: call it in, step across, send it up | the batten flown into a gap is the BRIDGE and its sandbag lands on the crew across it; RIDE THE WEIGHT down to the stage (no sign: found) | batten G up to the loading gallery; the door guard's sandbag is on its OWN line (locks on the floor and the gallery): LURE him under it |
| THE FLATS (`flatwinch`) - scenery on a track, slid by a winch, shoving what is in its way | the dock: a ground row slid under the sill as a step | the performance: the scene-change flat is FLOWN on the show's cue (no winch); in ACT II it stays down as a wall and a painted CLOTH flies in to go over it | the under-stage: the flat is a FLOOR, out over the sump and back on a cue of its own (an understudy stands on it when it goes); the prop store's shutter is painted as the wall | the far wing: the flat door decides which of the follow spot's aims is clear |

Supporting: THE STAGE TRAPS on cues (one way down, two into spiked trap rooms with a rope out), THE STAR TRAP and THE KETTLE DRUM (springs), THE
CHANDELIER (a light on a line over the stalls: struck, it comes down on whoever is under it and stays as a step), THE MIRROR ROOM (a player the
mirrors show you is watched while you are in the room with it, whichever way you face; leave and it is not).

## Five heights

GRID 7, FLY FLOOR 15, BOXES / DRESS CIRCLE / DRESSING ROOMS / GALLERIES 23-25, STAGE 33 (the house's stalls step from 29 to 35), UNDER-STAGE and the
PIT 41-43. The rehearsal stage is crossed over (fly floor), across (the performance) and under (the under-stage).

## The arc (built columns; backstage = its own column + 72)

| section | columns | beat | encounter (all hand-placed, named squads) |
|---|---|---|---|
| THE HOUSE | 0-71 | TEACH facing; the chandelier | the usher alone on the dress circle (the rule on two signs); two stagehands in the stalls under the chandelier; a player in the pit; two shy dead (the stage box, over the pit) |
| THE STAGE DOOR | 72-99 | - | a player in the passage. CHECKPOINT ONE (87) |
| THE COSTUME STORE | 100-131 | TEACH the lamp | one player held in the light by the rope; a bat under the slab |
| THE DRESSING ROOMS | 106-160 | LOCK ONE (the chorus), THE MIRROR ROOM | the wardrobe chorus (up to three at a time); the dresser in the mirror room |
| THE WORKSHOP | 137-182 | LOCK TWO (the fitting) | two players either side of the drop; a bat; a flying knife (haunt). Secret: the glue store |
| THE DOCK | 183-199 | TEACH the flat | - |
| THE FLY TOWER | 200-228 | TEACH + DEVELOP the fly lines | a stagehand on the tower floor (he drops sandbags on you as you ride over him); a bat. CHECKPOINT TWO (213, the fly floor) |
| THE FLY FLOOR (+ GRID) | 216-284 | TWIST the fly lines | the fly floor's crew under line D's sandbag (a player, a sworn sword); the lighting bridge (a player held in the crew's lamp, a stagehand); the grid's spider; the glimpse of HIM in the rigging |
| THE PERFORMANCE | 230-294 | SET PIECE in three acts | the cast (three players, on strings), the audience (two drunks, more heads each act), three cued lamps, the flown scene flat, the cloth, three traps; the prompt desk; ropes into both boxes |
| THE UNDER-STAGE | 218-308 | TWIST the flat | the understudies (one standing on the floor flat), a sworn sword, spiders and a bat. CHECKPOINT THREE (239). Secret: the prop store (a haunt guards it) |
| THE WINGS | 297-371 | EXAM | the prompt box (a drunk) and its floor lamp, a player under it, the flat door, the follow spot, batten G, the gallery, THE DOOR GUARD (elite, lured under line H). CHECKPOINT FOUR (369) |
| THE MAIN STAGE | 372-415 | THE PUPPETEER | the stage door, his room (kept free), the gate (375 until his fight lands) |

Four checkpoints (route 523 tiles; gaps 94 / 143 / 146 / 134 - the 175-tile rule cannot be met with three on this route). Three silvers off the route
(the stage box, the glue store, the prop store) and one on the grid. No relic (question 4). Foes 41: 17 mummers, 4 stagehands, 3 drunks, 3 sworn
swords, 7 bats, 3 spiders, 2 shy dead, 2 haunts. INDEX 106 (target ~111).

## THE PUPPETEER's hook (claude/puppeteer)

`L.mainStage = { door: 372, x0: 373, x1: 414, floor: 34, stageX: 372, stageW: 40, free: [18, 35] }`: columns 372-411 and rows 18-35 are kept free
for his stage, and row 36 (R+2) is solid rock under all of it (PUPPETEER2, claude/puppeteer 82c60e6: the floor of his trapdoor pits; his stage now places three puppets). The wiring, at the merge (claude/puppeteer at e13f1b1 exports `stagePuppeteer`; this branch does not merge it):

    const P = stagePuppeteer({ set, block, plat, ent }, T, TS, 372, ST);   // in buildMaskwrightTheatre, on the built level's painter, after the shift
    B.moversExtra.push(...P.movers);                                        // his batten lift
    // the return: arena: P.arena, gateAfterBoss: true; the gate moves from 375 to (413, 33), past his east wall; delete 'puppetstage', re-point his rows

His track stays `puppeteer`; the level's is `theatre`. The marker comment in section 10 of the backstage builder says the same.

## Music

Its own track **`theatre`**, a SYNTH track in `src/audio.js` (`scheduleTheatre`, like the Waymeet and Underleaf tunes: no file, nothing downloaded; THEATREART replaced the placeholder
`audio/theatre.ogg` and its renderer): a creaky music-hall overture waltz in D minor - bowed strings (two desks, a little out of tune), a harpsichord on the off-beats, a plucked bass, a door
that creaks mid-tune. The show is TOLD in four levels, set through `music.act(n)` from `src/theatre-hands.js`: 0 the overture (minor, slow, unsteady), 1 CURTAIN UP (the same tune lifted to D major, a flute
doubling, faster), 2 ACT TWO (faster, a snare), 3 ACT THREE (a drum on every bar); each change is a cymbal and a bell. `tools/audio-assets.mjs` lists `theatre` as no-file-by-design.

## Comparison with THE MAGE'S FOLLY (level-quality, this branch) - honest

| | THE MAGE'S FOLLY | THE MASKWRIGHT'S THEATRE (THEATRE2) |
|---|---|---|
| size | 808 x 48, route 723 tiles | 416 x 50, route 523 tiles |
| heights | 8 bands, 61% of width with a 2nd height, spans 30 rows | 8 bands, 57%, spans 30 rows; five real floors plus the house's stalls |
| mechanics | 12 kinds, 4 in 3+ places | 7 kinds, 4 in 3+ places; three machines with all four beats, two lock rooms, a set piece in acts |
| secrets | 3 | 3 off the route (+1 on the grid) |
| set pieces | ambush room, mini, orrery ride, upside-down floor | the performance in three acts; the chandelier; the chorus |
| checkpoints | 7 (103 tiles each) | 4 (131) |
| density | 2.39, 23% empty screens | 2.18+ (41 foes), 18% empty |
| longest flat | 43 | 47 = the Puppeteer's empty room (the lint counts it until his arena lands) |
| art | finished | greybox |

## Notes for the art lane (keep these - the reviewer asked)

- The CUED FLAT, the TRAPS and the AUDIENCE must read at a glance: the track glow before a flat moves, the trap edges before they drop, and a strong
  LIT-versus-UNLIT contrast on the hero (the audience and the bats go for the lit; the player must see at once that he is in a pool).
- The box drunks are the brief's mask-thrower: give them a MASKED-PATRON look (a porcelain mask, an opera glass, a programme to throw).
- Keep the RED-CURTAIN REVEAL from the fly floor prominent (you see the stage from above before it rises).
- Capture the RIDE-THE-WEIGHT and CURTAIN-UP moments IN MOTION (a short clip or strip), not static shots.
- Palette: plum-black house, oxblood curtain (#7a1a24 / #9a2a30), brass (#c8a040), limelight cream (#fff2b0), backstage timber, the under-stage
  near-black. Rooms (`paintTheatreRoom` kinds): thFoyer, thHouse (seats, the dress circle's gilt front, the chandelier, the pit rail), thPassage,
  thCostume, thWorkshop, thDock, thFly, thStage (backcloth, proscenium, boxes), thUnder, thWings, thMain (his lane dresses it). Deco stand-ins drawn
  greybox: mirror, wardrobe, seats, stands, rack, props. Props to draw: limelights (floor stand, rail bracket), rope-locks, winches, battens,
  sandbags, the chandelier, flats (the cued one red, the cloth painted, the shutter as rock), stage traps, the star trap, the kettle drums, the
  prompt desk, the strings on the cast, HIS silhouette in the rigging. THE STAGEHAND's sprite is a greybox figure (`src/theatre-foes.js`).

## Questions for Daniel

See the lane report (`work/claude/lane-done/claude-theatre.md`).

## THEATREART: what the art lane drew (2026-09-30)

- TILE KIT `src/redraw/theatre_tiles.js` (the hook in main.js's resolveTiles): plum brick (the house), timber-brown brick (backstage), near-black stone (the under-stage); floors capped as dark stage boards, an oxblood
  runner with a gold thread (the house), velvet seats (the raked stalls), wet flags (under-stage); iron grating for the grid, the fly floor and the lighting bridge; gilt-fringed timber for the boxes; hatches (hazard chevrons,
  hinges, a brass ring) for the stage traps; a kettle-drum head and a star trap for the springs; hemp rope with knots; stage spikes with warm tips.
- ROOMS `src/redraw/theatre_rooms.js`: the foyer, stage-door passage, costume store (hat boxes, a rail of costumes), dressing rooms (mirrors, wardrobe), mask workshop (a wall of masks), scene dock, fly tower
  (brick canyon, loft blocks, the lines going up), the stage (painted backcloth, black borders and legs), the under-stage, the wings (pin rail, belayed lines, sandbags). THE HOUSE is a PARALLAX backdrop: the dome,
  the gods, two tiers of boxes (two layers sliding against the camera).
- MACHINES + DRESSING `src/redraw/theatre_props.js`: limelights (a barrel that aims at its pool), beams with dust and pools with a bright rim and a spike mark; flats as painted scenes (forest, castle, sea, a door, a floor cloth)
  with their TRACKS always drawn and glowing amber with running chevrons the moment they are about to move; rope-locks, winches, the prompt desk; every fly line wears a COLOUR TAG (A red, B blue, D gold, E green, G violet,
  H orange, CH brass) on its lock, its batten's ends and its sandbag; the chandelier; the curtain (velvet folds, gold hem and fringe, valance, proscenium pilasters), footlights, the strings on the cast, the masked audience
  in the boxes, HIS silhouette in the rigging. LIT v. UNLIT: a caught mummer stands in a ring of light; the HERO in a pool gets the ring at his feet and a watching EYE over his head.
- CAST `src/redraw/theatre_foes.js` (+ `bakeDrunk('patron')` in `src/redraw/waymeet.js`): the box drunks are MASKED PATRONS (evening black, a porcelain mask, an opera hat, a programme to throw); the usher (oxblood livery,
  pillbox cap, half-mask, a shuttered lantern); the stagehand (new frames); the house's ghosts (a sheeted dead patron in an opera mask and a ruff); the haunts are flying stage daggers.
- The usher carries `usher: true` (maskwright-theatre.js, spawnEnt) so the art can tell him from the other players.
