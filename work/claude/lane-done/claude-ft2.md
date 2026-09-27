# claude/ft2: THE FALLING TOWER, ROUND 2 (lane report)

Lane on this PC, 2026-09-25. Branch `claude/ft2` off master `7cca706`. `origin/master` (batch24: reef2 + difficulty-rules) was merged
in at the end. There were two conflicts:
- `tools/check.mjs`: every name from both sides kept, grep verified.
- `src/marks.js`: the hand rows from both sides kept, MARK regenerated, 545 rows.

Pushed after every green step. Nothing touches master, nothing is deployed, and the full `npm run check` was NOT run. The Level
Editor and Boss Rush are untouched. Nothing was downloaded.

Design: `docs/briefs/falling-tower-round2.md`. Pictures: `work/ft2/before/` and `work/ft2/after/` (`node tools/ft2-shots.mjs <tag>`).

## Commits

| sha | Part 1 fix? | what |
|---|---|---|
| `1216389` | | the brief, the capture and pilot tools, the before pictures and pilot |
| `cb7f7bc` | **FIX 1a** | the Sexton no longer gets stuck in walls; `tools/mini-walls.mjs` |
| `75b4878` | **FIX 1b** | no checkpoint you cannot reach while fighting the Archmage; `tools/checkpoint-stand.mjs` |
| `faf191c` | **FIX 1c** | no grass in the tower, and no windows or holes cut by ledges; `tools/tower-cutouts.mjs` |
| `2a4bcae` | | Part 2: the way out opens onto the desert. This commit also takes the near layer's grass fringe off the tower (`palette.noNear`), which is part of 1c's grass fix |
| `4acece2` | | Part 3: the Archmage's portals, the bot taught them; `tools/archmage-rings.mjs` |
| `5133f99` | | the pilots, before and after |
| `b9539a9` | | his bestiary entry names the rings |
| `6ac17be` | | merge of origin/master |
| (this) | | this report |

The three FIX commits stand on their own and can ship early. 1c's grass-fringe line rides in `2a4bcae`; if 1c ships alone, that one
line (`noNear: true` in the tower's palette, `src/tower-ascent.js`) should go with it.

## PART 1: the fixes

### a. The Sexton stuck in walls

**What was wrong:**
- His feet are pinned to the deck and his x was only clamped to the room. He walked, rushed and climbed out of the pit straight into
  the two stone ringers' walks, which stand two rows proud of the deck.
- Two of his six "joists" were the walks themselves.
- The mini's left wall also cut a notch out of the left walk when it opened.

**What changed:**
- `src/sexton.js` asks `c.stands(x)` before it moves him. A walk ends his walk or his rush.
- To get past a walk he now LEAPS it, but only when you are past it. The leap rises clear of the walk's top before it moves across.
- Caught in the pit, he stays inside the plank he broke.
- He climbs out onto somewhere he can stand. `main.js` keeps a safety net that puts him beside a walk.
- `setWallAt` puts back what a mini's wall replaced, in every level. In the tower it raises the tower's stone, not a palisade.

**The check:** `tools/mini-walls.mjs`. It runs the Sexton, the Graveyard Keeper, the Hedge Warden and the Barrow Rider, 6 seeded
runs of 30 s each. A god-mode hero is thrown round each room, and no frame may end with the boss's box in rock.
- Red on the old code: 1223/1800 and 673/1800 frames in rock.
- Green now, even with main's safety net switched off.
- It also asserts the Sexton really leaps, so a boss penned in one bay cannot pass.
- The other three bosses were already clean.

### b. The checkpoint you could not reach during the Archmage

**What was wrong:** the parapet checkpoint (31, 50) and its sign stood one row under his hall's floor. The fight's camera looks
about 70 px below that floor, so a lit lantern sat under the fire all fight long.

**What changed:**
- The checkpoint and the sign moved to the crown's last climb, two tiers down.
- The hall is closed at the bottom: `drawSanctumUnder` draws stone under the fire.
- A death in the sky still wakes you by the door.

**The check:** `tools/checkpoint-stand.mjs`, class-wide.
- **Real jump:** every checkpoint in every level must be stood at by the reach fill run with `opts.across: 5`, a new option in
  `src/reachcore.js`.
- **Flight arenas:** no checkpoint may be in view of a flight arena.
- Red on the old code: fallingtower @31,50.
- Three model gaps are listed with reasons: two wasp-pogo checkpoints in the wood, and one gust-ride checkpoint on the moor.

### c. Tiles that do not work with the backdrop

The grass had three sources:
- **The cistern's poison.** It was bright green scum with bubbles standing up off it, which read as grass tiles between the stones.
  It is violet-black witchwater now. `drawFoul` and `drawDeadly` take `gasCol`, `deepCol` and `glowCol` from the pool.
- **The palette.** The tower's palette "grass" colours are slate now.
- **The near layer.** Its blades of grass ran along the bottom of the screen wherever you are not indoors: the sky fight, the rope
  holes and the desert. The tower no longer draws it (`palette.noNear`).

The clipping: every cut-out (holes to the sky, the Reading Room's windows, the clock face) is now placed where no tile stands in
front of it, with a margin, and never over another cut-out. The crown's two great holes became a broken wall-top with the night
above it.

**The check:** `tools/tower-cutouts.mjs`, Node only.
- Red: baked blind, the old placement put 39 cut-outs across tiles.
- Green: 18 cut-outs in 7 rooms, none crossed.
- It also asserts there is no green in the tower's ground or its poison.

## PART 2: the ending

- The Archmage dies and the portal opens where he fell, as before. It is now a hole full of desert (`drawDesertOval`, drawn in the
  Caravan's palette).
- Through it you stand on open sand under THE SUNKEN CARAVAN's own sky, mesas and dunes (its baked layers). The level-end gate is 14
  tiles ahead, and a wreck, a skull and a dead tree lie on the road.
- The sandstone cutting, its walls, the rise, the sundial and the grass tufts are gone. The sand runs from one edge of the world to
  the other and is skinned as the Caravan's sand. The desert is daylight.

Readers kept honest:
- `tools/archmage-room.mjs`: the desert section is rewritten.
- `tools/tower-ascent.mjs`: a new page run checks that his death opens the door without ending the level, that through the door you
  are on foot on sand, and that walking on wins at the gate.
- `src/reachcore.js`: keeps `L.sanctum` as an assist.
- `tools/tower-collapse.mjs`: unchanged and green.

## PART 3: the Archmage's portals

His rings are added to his fight; nothing was taken away. The death mark and its opening are unchanged, and so is his enrage.
- **THE PORTAL STEP** (`stepTell`, no mark of its own): the exit ring opens about 56 px from you and flares. He then comes out of it
  mid-cast, with the next spell's tell half gone.
- **BENT BOLTS** (`bendTell`, `!`): one ring opens by his hand and one above or behind you, both glowing orange. The bolts come out of
  the far ring at you.
- **THE OPENING (A11):** dodge through an open exit ring and you come out beside him with his spell broken. He is BREACHED: open for
  2 s at double damage. Flying into a ring without dodging does nothing.
- **STAGE 2, under 70% ("HIS RINGS STAY OPEN"):** rings last 1.6x longer. A spare exit ring stays by you, so he can have three rings
  open, and his fire comes out of the spare.
- **STAGE 3, his enrage ("HE FIGHTS RING TO RING"):** his blink becomes a ring pair, and his fire crosses the room from a ring
  behind you.
- **The bot (`src/lab.js`):** it dodges through a flared exit when it has the stamina, gets out of reach when it has not, and flies
  across a bent bolt's line.
- **The check:** `tools/archmage-rings.mjs` forces every part in Node and proves the dodge-through in play, where a blow lands for 20
  instead of 10.

## Numbers, before and after (`tools/archmage-pilot.mjs`, bossLab, 7 heroes, salts 1-3)

| | before (no rings) | after |
|---|---|---|
| REFILL, 150 s cap (the asked pilot) | **12/21 (57%)**, median win 98 s. Warden 0/3, pyro 0/3, paladin 1/3 | **20/21 (95%)**, median win 86 s. Warden 2/3, everyone else 3/3 |
| NORMAL health, 300 s cap | **2/21 (10%)**; the last lane read 7% on 42 | **12/21 (57%)**, median win 79 s. Warden 0/3, paladin 0/3 |
| openings a fight | 5.3, all death marks | 8-10: about 4 breaches and 5-6 death marks |

The bot could finish him before (57% at refill). The portals made him much easier for the bot, because the flared exit is also the
opening and the bot takes it about four times a fight. The number is reported, not tuned.

Every check named in the prompt was run after the final merge, plus threat-holes, undead-foes, occluders, render-layers,
deadly-water, elites, one-new-foe, ambush-single, ambush-reach, pixels and the four new ones. 46 checks, all green. (`architecture`
exists now and passed.)

## UNVERIFIED

- Nobody has played any of it.
  - The Sexton's leap is a new movement, and he never used to leave his bay.
  - The rings' readability in motion.
  - The witchwater's colour.
  - The desert's look.
  All of these are only seen in captures.
- Whether a human takes the dodge-through as often as the bot does. The bot's timing is near-perfect.
- The full suite has not been run.
- The real-jump rule uses 5 columns foot to foot. At 4 columns, 128 of 426 checkpoints fail, which means the whole game is built
  for about a 4-tile jump. 5 columns is about 3.5 tiles of flight with a foot over each edge. I did not measure it per hero.
- Node renders show nothing of 'lighter' glows. The rings' halos were only seen in the page.

## QUESTIONS FOR DANIEL

1. **The Archmage is now much easier for the bot: 95% at refill, 57% at normal health, up from 57% and 10%.** The dodge-through opening
   is the reason. Recommendation: play him first. If he is too easy, shorten the breach from 2.0 s to 1.2 s, or make only the step's
   flared exit breach him, not every ring. Do not touch his health.
2. **What should the level-end look like in the desert?** It is still the game's usual mossy stone gate, standing on the sand.
   Recommendation: keep it for now, since players know it as the exit. A caravan waymarker could replace it when the desert arc gets
   its own end-of-level prop.
3. **The cistern's poison is violet now, not green, so it stops reading as grass.** Green means poison everywhere else in the game.
   Recommendation: keep violet in the tower (its fire is violet too), and check it reads as deadly when you play it.
4. **The crown's big sky holes became a broken wall-top with the night above it.** That was needed because the crown's stair can never
   clear a window. Recommendation: keep it; say if the crown should read as more open.
5. **The Sexton now leaps a ringers' walk when you are past it.** Before, he walked into the stone. Recommendation: keep it. The
   alternative is to pen him in his bay, which would make the walks a safe place to stand.
6. **The real-jump checkpoint rule is 5 columns, not the 6 the reach model uses.** Recommendation: keep 5, and have a later lane
   measure each hero's jump in-game (S2) before tightening it to 4. At 4, a third of all checkpoints fail.
