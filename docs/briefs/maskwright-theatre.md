# THE MASKWRIGHT'S THEATRE - brief (greybox: geometry, machinery, encounters, wiring)

Status: GREYBOX built on `claude/theatre` (2026-09-30), for Daniel's look before art. The level plays end to end with real keys (the route pilot
walks a knight and a pyromancer from the stage door to the main stage's door). Art and the composed track are the next lane's (notes at the end).
THE PUPPETEER, its boss, is the parallel lane `claude/puppeteer` (in a module of its own); this level leaves him his room and a door.

## What it is

The playhouse where the fair's masks and puppets are made, gone strange at dusk. It stands on the road inland **between WAYMEET and THE HARVEST
FAIR** (the theatre `needs: 'waymeet'`, the fair `needs: 'theatre'` now), and on the inland (haunted) map sheet between them (node at 56,154, on the
road in road order). Built in `src/maskwright-theatre.js`; its machinery is `src/theatre-rig.js` (pure) and its hands `src/theatre-hands.js`
(main.js carries one-line hooks). Proved by `tools/theatre.mjs`; walked by `tools/theatre-pilot.mjs`; drawn as a map by `tools/theatre-map.mjs`.

**THE RULE: THE HOUSE IS WATCHING. WHAT STANDS IN THE LIGHT CANNOT MOVE.** A masked player moves only while nobody watches it (the fair's facing
rule, `src/mummer.js`, PRE-TAUGHT here); a LIMELIGHT watches too - a mummer standing in a lit pool is seen, whichever way the heroes face; and the
AUDIENCE in the boxes throws only at whoever stands in the light. So the light is a tool against the cast and a danger from the house.

## The three machines (each TAUGHT -> DEVELOPED -> TWISTED -> EXAMINED)

| machine | how it works | taught | developed | twisted | examined |
|---|---|---|---|---|---|
| THE LIMELIGHTS (`spotlamp`) | strike a lamp and it swings to its next aim; what stands in its pool is SEEN (a mummer freezes). Scenery between lamp and pool darkens it | the costume store (28-64): one mummer held in the pool ahead, one comes up behind you; strike the lamp and it swings onto the one behind | the mask workshop (65-110): three players on two floors, two lamps (one on the mezzanine, three aims): light the ones you cannot face | the performance (158-222): the lamps run on their CUES; the cast freezes in them and moves in the dark; the audience throws at whatever is lit, you included | the far wing (225-299): a lamp under the prompt box - light the one ahead, not yourself - and the gallery lamp with a drunk on the gallery |
| THE FLY LINES (`flylock`, movers `fly`) | a batten and its sandbag on one rope: strike a rope-lock and the batten flies OUT (up) or IN (down), the sandbag always the other way. A sandbag coming down lands on the foe under it | the fly tower (128-136): stand on batten A, strike the lock beside it, ride up | the tower (136-156): batten B hangs flown out - call it in, step across, send it up to the fly floor | the fly floor (144-222): a batten flown into a gap is the BRIDGE, and its sandbag comes down on the crew waiting across it; then RIDE THE WEIGHT: stand on line E's sandbag and strike its lock, and the weight takes you eighteen rows down to the stage | the far wing (252-280): batten G up to the loading gallery, its sandbag over the stage door's guard |
| THE FLATS (`flatwinch`) | painted scenery on a track: strike its winch and it slides column by column to the other end (shoving a body in its way; stopping for one it cannot shove) | the scene dock (111-127): a ground row slides to the end of its track and is the step under the sill | the performance (158-175): the scene-change flat stands across the way to the trap on its own cue (no winch: the show changes whether you are ready), told by its glowing track and the prompt bell | the under-stage (170-196): the flat is a FLOOR - a slab of the under-stage slides out over the spiked sump. And a flown SHUTTER painted as the wall hides the prop store | the far wing (245-266): the flat door blocks the floor at one end of its track and the floor past the batten at the other: the batten is the way on |

Supporting: THE STAGE TRAPS (`stagetrap`: boards in the stage floor that drop on the show's cue, told by glowing edges; one is the way down, two
drop into a spiked trap room with a rope out - a bite, never a shortcut) and THE STAR TRAP (`startrap`: a spring on a pedestal under a hole in
the far wing's floor - hold jump and it throws you up through the stage).

## Five heights (one building seen from all of them)

| band | row (stand) | what is there |
|---|---|---|
| THE GRID | 7 | the roof walk over the fly tower, up a rope from the fly floor: a silver (secret) |
| THE FLY FLOOR | 15 | the top of the tower, the bridge and the bag, the lighting bridge over the stage, the pin rail and the weight |
| THE BOXES / GALLERIES | 24-25 | the loading gallery in the tower, the two boxes over the stage's wings (the audience), the prompt box and the loading gallery in the far wing |
| THE STAGE | 33 | the stage door, the costume store, the workshop, the dock, the tower floor, the rehearsal stage, the wings |
| THE UNDER-STAGE | 43 | the sump and the floor flat, the trap rooms, the prop store (secret), the star trap |

The rehearsal stage (158-222) is crossed three times: OVER it on the fly floor (left to right), ACROSS it in the performance (right to left), and
UNDER it (left to right).

## The arc, section by section

| section | columns | beat | encounter (all placed by hand, every foe in a named squad) |
|---|---|---|---|
| THE STAGE DOOR | 0-27 | TEACH the facing rule (for the fair) | one masked player alone in a passage; two signs (the rule; bells and the red mask) |
| THE COSTUME STORE | 28-64 | TEACH the limelight | over one on the rail walk (it follows you down), one held in the lamp's pool ahead. Secret: the costume loft (a rope, a silver) |
| THE MASK WORKSHOP | 65-110 | DEVELOP the limelight | THE FITTING: three mummers on two floors, two lamps; two bats round the lamps. A heart at the far door |
| THE SCENE DOCK | 111-127 | TEACH the flat | the ground row and its winch, under the sill |
| THE FLY TOWER | 128-156 | TEACH + DEVELOP the fly lines | a hired sword (sworn sword) on the tower floor where the sandbags come down; a bat. CHECKPOINT ONE at the top (141,15) |
| THE FLY FLOOR (+ THE GRID) | 144-222 | TWIST the fly lines | THE FLY FLOOR: two mummers under line D's sandbag and a sworn sword; THE LIGHTING BRIDGE: two mummers held in the crew's lamp; the grid's spider. Secret: the grid silver |
| THE PERFORMANCE (the set piece) | 158-222 | TWIST the limelight, DEVELOP the flat | the curtain goes up when you reach the stage: THE CAST (three mummers), THE AUDIENCE (two drunks in the boxes, throwing only at the lit), three cued lamps, the scene-change flat, three cued traps |
| THE UNDER-STAGE | 146-236 | TWIST the flat | THE UNDERSTUDIES: two mummers and a sworn sword; two spiders over the sump and the star trap. CHECKPOINT TWO (167,43). Secret: the prop store behind the flown shutter (a silver, a heart) |
| THE WINGS | 225-299 | EXAM | THE PROMPT BOX (a drunk over the lamp, a mummer ahead), the flat door, batten G; THE STAGE DOOR (a sworn sword and a mummer under G's sandbag); THE GALLERY (a mummer and a drunk). A heart, then CHECKPOINT THREE (297,33) |
| THE MAIN STAGE | 300-343 | THE PUPPETEER (claude/puppeteer) | the stage door, his room (with a fly floor at row 16, a guess he may change) and, for now, the level's gate just inside the door |

Checkpoints: three (Daniel: fewer), at route tiles ~148, ~294 and ~430 of 434 (checkpoint-gaps: none more than 175 apart, the last before the
door). Silvers: three, all off the route (the costume loft, the grid, the prop store). No relic: the fair's one relic is the Wicker Queen's; if the
theatre should have one it belongs to THE PUPPETEER (question 4). Foes: 33 (18 mummers, 4 drunks, 4 sworn swords, 4 bats, 3 spiders - no new foe:
the drunk in a box IS the mask-thrower of the brief, re-read as the audience; see question 1).

## THE PUPPETEER's hook (claude/puppeteer)

`L.mainStage = { door: 300, x0: 301, x1: 342, floor: 34, stageX: 300, stageW: 40, free: [18, 35] }`: the room behind the stage door is kept
free for his stage - columns 300-339 (his 40-column stage, its west wall on the stage door's column) and rows 18-35 (R-16..R+1, floor row R = 34).
Checkpoint three stands at 297, outside it. No `arena` is declared on this branch, so no boss check reads it yet; the level's `gate` stands at 303,
just inside the door. The wiring, done at the merge (claude/puppeteer at e13f1b1 exports `stagePuppeteer`; this branch does NOT merge it - the safer
choice, since his lane also adds a hidden 'puppetstage' level and boss-check rows that must be re-pointed at the same time):

    const P = stagePuppeteer({ set, block, plat: boards, ent }, T, TS, 300, ST);   // in section 10 of src/maskwright-theatre.js
    movers.push(...P.movers);                                                      // his batten lift, into moversExtra
    // the return: arena: P.arena, gateAfterBoss: true; the gate moves to (341, 33), past his east wall; delete 'puppetstage' and re-point his rows

His track stays `puppeteer` (arena.music); the level's is `theatre`. The marker comment in section 10 says the same.

## Music

Its own track, **`theatre`** (`audio/theatre.ogg`, "The Maskwright's Waltz"): a placeholder composed and synthesised by `tools/theatre-music.mjs`
(nothing downloaded) - a slow D-minor music-hall waltz, music box over a plucked bass and a reed organ, a house bell every eight bars, 50 s loop.
The art/music lane composes the real one; the name stays.

## Comparison with THE MAGE'S FOLLY (Daniel's benchmark) - honest

Numbers from `tools/level-quality.mjs` and `tools/pacing.mjs` on this branch.

| | THE MAGE'S FOLLY | THE MASKWRIGHT'S THEATRE |
|---|---|---|
| size | 808 columns x 48 rows, route 723 tiles | 344 columns x 50 rows, route 434 tiles (shorter: denser, three stacked floors over the stage) |
| heights used | 8 four-row bands on the route, 61% of the width has a second height, route spans 30 rows | 7 bands, 67% of the width has a second height, route spans 30 rows; five real floors (grid, fly floor, boxes, stage, under-stage) |
| mechanics | 12 gadget kinds, 4 in 3+ places: runes/rune-locks, glyphs, bookcases, books, counterweights, planets, vats | 6 kinds, 5 in 3+ places: THREE machines each taught/developed/twisted/examined (lamps, fly lines, flats) plus the stage traps and the star trap |
| taught -> twisted | rune taught in the yard, developed in the library, twisted (the ward fights back, the timed exam door) | each machine has all four beats (table above); the twists change what the machine is FOR (the lamp becomes the audience's eye; the batten becomes a bridge and its weight a lift and a weapon; the flat becomes a floor and a painted wall) |
| secrets | 3 off-route silvers (cellar, study, roof leads) | 3 off-route silvers (costume loft, grid, prop store) |
| set pieces | the reading-room ambush, the Homunculus mini, the orrery ride, the upside-down floor | ONE: the performance (the curtain rises, the show runs on its cues while you cross); no mini, no ambush room |
| checkpoints | 7 (one per 103 route tiles) | 3 (one per 145) |
| foes / screen | 2.39, 23% empty screens | 2.36, 7% empty (the one empty screen is the Puppeteer's room) |
| longest flat stretch | 43 columns flat and empty (81 of level ground) | 47, and it is the Puppeteer's empty room (297-343), which the lint counts until his arena lands; inside the playable level the longest is under 30 |
| boss | the Archmage (three stages) | THE PUPPETEER (a parallel lane) |
| art | finished | GREYBOX (flat colour rooms, plain shapes for every machine) |

Where the Folly is still ahead: length and variety of set pieces (a mini and an ambush room), twelve gadget kinds against six, and finished art.
Where the theatre is ahead: every machine has all four beats, the same space is crossed from three heights, and there are fewer, spaced checkpoints.

## Notes for the art lane (tile kit, props, palette)

- **Palette**: plum-black house, oxblood curtain (#7a1a24 / #9a2a30), brass (#c8a040), limelight cream (#fff2b0), backstage timber browns, the
  under-stage near-black (#161218). Dark zones already set: under-stage 0.62, stage 0.42 (the lamps' pools are engine lights and cut the dark).
- **Rooms** (L.interiors kinds, painted greybox by `paintTheatreRoom`): thPassage, thCostume (racks, hat boxes, mirrors), thWorkshop (carving
  benches, masks on the walls, glue kettles), thDock (flats stacked against the wall, track grooves), thFly (brick fly tower, pin rail with rope
  coils, a gridiron overhead), thStage (a painted backcloth, the proscenium arch and the boxes' gilt fronts; the curtain), thUnder (joists, the
  trap machinery, spiked sump), thWings (masking flats, the prompt desk, the loading gallery), thMain (the Puppeteer's: his lane dresses it).
- **Props to draw**: the limelight on a stand and on a rail bracket (turns to face its pool); a rope-lock (a cleat on the pin rail, orange when its
  line is out); a winch (a drum and a handle); a batten (a steel pipe with a painted border cloth); a sandbag (a hessian sack on a line); flats
  (framed canvas with a painted scene; the cued one in red; the shutter painted as the rock); the stage traps (hinged boards, glowing edges); the
  star trap (a sprung platform); the boxes' fronts. Deco ents already placed: `rack`, `props` (they fall back to nothing until drawn).
- The drunks in the boxes are the brief's mask-thrower: a masked patron's skin (a porcelain mask, a programme) would sell it (question 1).

## Questions for Daniel

See the lane report (`work/claude/lane-done/claude-theatre.md`).
