# claude/sealedpyramid - THE SEALED PYRAMID + THE SCARAB MOTHER (Opus greybox, 2026-10-12)

Base: origin/claude/batch87 (570e994b). Brief: scratch/brief-sealedpyramid.md. Port 8864.
The Opus pass is done and stops here: level, mechanics and boss AI. The 12-seed boss measuring is not done. Next come the SONNET review, then tune, then art.
**Art is placeholder** (readable greybox). The level ships only with its art at B or better.

## THE RULE (one sentence, an action)
"THE TOMB IS A MACHINE: TREAD A PALE PLATE AND ITS TRAP FIRES ON WHATEVER STANDS IN ITS REACH - LET THE GUARDS STAND THERE, NOT YOU."

- **Traps:** each is a falling block (from a ceiling slot), a dart wall, or a rolling stone (in a groove).
- **Plates:** pale flags in the floor. Each plate stands before (or over) its trap's reach.
- **Who presses a plate:** heroes and **mummies**. A mummy is heavy, and that is its twist. Scarabs and jackals are too light.
- **Telling:** a press is told at once (a click, the word, dust or a rattle), and the trap fires 0.25-0.35 s later.
- **What a trap hits:**
  - foes die (the tomb kills its own);
  - an elite takes 30% and is staggered;
  - a hero takes a share of his bar: teach 24%, test 34%, exam 50%;
  - the boss is opened.
- **Reset:** every trap resets behind you. The reload is shown as a gauge on its plate.
- **Pale stones inside a reach:** treading one fires the trap on you.
- **Drawn state (A3):** the plates, the reaches scored (slot shadow and dust, dart holes, the groove), guards' bones, and the reload gauges.
- **Counterweights:** pairs of stone blocks on one chain. The heavier side goes down (a hero weighs 1, a fallen trap block 2). Left empty, a pair goes home at half pace, so there is no soft-lock.

## SECTIONS (H 60, W 498; src/sealed-pyramid.js; ARCS = teach > test > remix > exam)

| cols | section | what |
|---|---|---|
| 0-75 | THE FACE | Steps up the pyramid in a sandstorm. The storm runs on the desert-rules clock: a told WARN, then a GUST that shoves you back down (hold block to brace). Two drifts, jackals, a vulture. The courses past the summit are unclimbable. THE ROBBERS' HOLE is at 68. |
| 64-171 | THE GALLERY OF PLATES (teach) | The block over the first guard (plate 76). The dart run: tread plate 103, then cross while the darts reload, or jump the pale stones. Hole at 118. The lower gallery's groove: the stone drops from its slot and runs the squad down (plate 121), with refuge shelves over it. |
| 172-249 | THE COUNTERWEIGHT SHAFTS (set piece 1) | Ride the first block down 10 rows. **WEIGH IT (required):** the second pair's pale block is a plate. Treading it drops the tomb's block on its mate, and its weight takes you up to the high corridor. |
| 250-333 | THE FALSE TOMB (set piece 2) | The robbers' walk runs over the false king's hall. **THE GREAT STONE** (plate on the walk, 256) runs the hall floor, kills the sarcophagus squad and **breaks THE FALSE DOOR** (required). A pale stone on its road at 314. A stair of ledges goes back up. |
| 328-405 | THE SCARAB PITS (remix) | Fill pit 1 with its block (taught; a jump also works). **Pit 2 is 8 wide:** its block is the only bridge (required). The darts corridor: its guard treads the plates. |
| 393-451 | THE DEEP WAY (exam) | **THE TOMB-WARDEN** (elite mummy, UNSTOPPABLE) stands under a block, with a scarab pit behind him and his gate at 426. **THE LAST SHAFT:** spend its dart wall from the landing plate, then ride the counterweight down under it. If you ride first, its own plate fires the darts as you pass. **THE SEALED TOMB** vault: 4 scarab seals, pays a silver. |
| 452-491 | THE ANTECHAMBER | THE SCARAB MOTHER. |

- **Uses of the rule:** lure a guard, spend it, lure a squad, open the way, weigh it, fill the pit, ride under it (7).
- **Checkpoints:** 170, 252, 337, 448 (one before her).
- **Silver:** 2 off-route + the vault (no relic).
- **Cast** (A9: one new foe):

| foe | built from | role | count |
|---|---|---|---|
| MUMMY (new) | src/mummy.js | heavy | 10 |
| jackal | hound (cnSkin) | runner | 9 |
| dart-blower | archer (cnSkin) | ranged | 4 |
| scarabs | skitter (cnSkin) | runner | 5 |
| vulture | vulture | runner | 1 |

  Mummy notes:
  - Its moves are a LASH ('!', yanks you a step in) and a GRAB ('!!', holds and squeezes until struck).
  - It does not flinch (stagger capped at 0.15 s, unless parried, guard-broken or hit by a trap).
  - Its linen burns (flails, and takes x1.5 from fire).
- **Identity:**
  - Own back wall for every room: coursed sandstone tinted per section, never the shared plank room. Counterweight movers draw no logs.
  - Braziers.
  - Own synth bed and ambient (`sealedpyramid`).
  - B8 foreshadowing of the boss: scarab reliefs, the brood mural, egg-cases, the pits' swarm.

## THE SCARAB MOTHER (src/scarab-mother.js + hands; a puzzle-beast, B1/B14 key = the level's verb)

**Arena.** It holds the tomb's own three traps:

| trap | reach | plate |
|---|---|---|
| block | local 9-14 | 15-16 |
| dart wall | 25-38 (east wall) | 23-24 |
| rolling stone | the whole floor | on the middle ledge (17-18) |

**Opening.**
- Tread a plate while she is in that trap's reach. The block PINS her, the darts STICK her, the stone FLIPS her (each its own pose).
- She is OPEN 3.4 s at x1.8, capped at 10% of her per opening (then the shell floor), plus a small bite from the trap.
- Then a told 3 s ward: blows x0.4, and a trap glances off, also told.
- B12 lure: her CHARGE stops 56 px short of where you stood. Waiting on a plate's far side draws her into its reach, then you step onto the plate. Her skid is 0.95 s.
- B13/B15: her shell takes x0.45 with a clank and the words "HER SHELL: LURE HER INTO A TRAP". She never opens on a timer.

**Moves.** One windup at a time, each told with mark, sound and word, each its own pose (B16; work/claude/sealedpyramid/mother-poses.png).

| phase | what changes | moves |
|---|---|---|
| P1 | - | CHARGE !! (jump it), MANDIBLES ! (block), SPIT ! (a glob, then a burning puddle) |
| P2 (60%) | The floor cracks: two scarab pits at the walls. Her BROOD comes out of them: one blow kills one, at most 3, told "THE BROOD". | New: BURROW !! (a mound runs at you; leave its ring) |
| P3 (28%) | Traps reset 40% faster. | New: QUAKE !! (rears; stones fall on 3 shadows, one of them yours) |

- **No adds** beyond the brood.
- **Numbers:** hp 2900 (4372 at tier), dmg: charge 46, snap 40, spit 30, burrow 44, quake 40, brood 10. The SONNET tune lane owns these.
- **Bot** (src/lab.js smPlan): reads her tells, kills the brood, waits by her side's plate and treads it when she stops in the reach.
- **Synth theme:** `scarabmother`, plus `:p2` and `:p3`.

## WIRING

| area | what was added |
|---|---|
| road | LEVELS appended (no index moves), `needs: 'buriedcity'`, rule = RULE |
| map | node (196, 58) with its plate above |
| campaign XP | rows added for **buriedcity** (it was missing from the fixture) and **sealedpyramid**; campaign level L41 |
| reach model | reachcore: false door counted broken, filled pits counted solid, vault opened, counterweights as rides. Only the blocks a hero rides count; the mates are kept out of rigBands |
| stuck guide | STUCK_HANDS.sealedpyramid, 7 spots |
| tables | threat, foe-react act 5, exit-gates, dressing kits, boss-greed, boss-read, marks (tells --write regenerated), hint-lines, elite-kit (affix + TUNE row), ELITE table (THE TOMB-WARDEN) |
| audio | audio bed, boss music |
| page | lab bot branch, modulepreload |
| tools registered | check.mjs ('sealed-pyramid'), level-quality GATE, one-new-foe, corpses, boss-rows, audio-assets, untold-told (the mummy), boss-openings (a new section) |
| docs | elite-lab.json |

**New tools:**
- **tools/sealed-pyramid.mjs:** 82 Node checks: the road; plate before reach; guards inside reaches; the locks are real; the cast; and the boss in a fake arena (alone means never open, every blow told, open ≥ 3 s then ward, one new move a phase, the lure geometry).
- **tools/sealed-pyramid-route.mjs:** route pilot with real keys.
- **tools/sealed-pyramid-stuck.mjs:** page test of the glint and nudge.

**Old saves:** the level is appended, so no index moves. An old save that cleared THE BURIED CITY sees the new node unlocked by its `needs`; nothing else keys on Buried City being last. level-reach is green.

## CHECKS (PORT 8864, page runs one or two at a time) - all green unless noted
- **Route pilot:** base movement (god, no foes), all 8 heroes walk the whole route 8/8 legs, 0 lifts.
  - Heroes: knight, warden, pyro, paladin, pirate, reaper, geomancer, berserker.
  - reach-heroes: 7 route targets × 8 heroes, 0 misses.
- **Level:**
  - **level-quality: CLEARS, now GATED.**
    - bands: 10, second height **40%**, which is on the limit.
    - Gadget kinds: 7, 5 in 3+ places.
    - Density 1.17; ruleFight 18/21.
    - pilot: 13 blows, 5 deaths.
    - curve (act 5): 227% lost a run, 6 deaths in 3 runs, in band.
    - mash: the level kills every hero 5-8×; boss 0/6 (stamped LEVEL then BOSS).
  - tools/sealed-pyramid 82/82, sealed-pyramid-stuck 6/6 (route needs nudge), stuck --static, deadends (all pay), solid-islands (0 bare), architecture, killzones, signs, spawns, floaters, collectables.
  - checkpoint-gaps / -stand, sprinkle-cap, elites, map-spacing / grammar / scale, level-reach.
- **Foes:**
  - tells (MARK regenerated), untold-told (23 incl. the mummy), corpses (jackal, dart-blower, scarab die in their own skins), one-new-foe, goblin-lint, threat-holes.
  - elite-lab mummy: mash 0/3, human 6/6 (~33 s).
- **Boss:**
  - boss-openings (new section): a minute alone opens 0; block, darts and stone each open her 3.4 s then ward 3 s; a trap in her ward glances off.
  - boss-fight-end: 62 fights end.
  - mark-integrity (MI_ONLY=scarabmother, 150 s): charge, snap and spit drawn and landing. P2/P3 moves are not reached by its fight bot; their poses are on the pose sheet and they run in the boss-rates fights.
  - boss-read, boss-music, audio-assets, hint-shown, modulepreload, textfit (hints, bestiary, mapcard, boss: 0 issues).
- **Reds not from this lane:**
  - dangling-paths: tools/anti-plunge.mjs is missing on batch87.
  - boss-greed: the minecart mini.
  - curve-gate: wood and marsh rows.
  - All three are red on the batch87 baseline too.

## 3-SEED SPOT CHECK (boss-rates practiced, human, flasks kit, L41)

| hero | wins |
|---|---|
| knight | 1/3 |
| warden | 2/3 |
| pyro | 3/3 |
| **all** | **67%** (in the 60-70 flask band) |

- Fights run 78-110 s (band 90-150; a little short at the low end).
- The tool's label reads HIGH against the old 50-60 band.
- Not looped further: the SONNET tune lane runs the 12 seeds.

## ART LIST (for the SONNET art lane; art before live)
1. **Tile kit:** the tomb's own sandstone and limestone courses (today the monks' limestone through L.masonryKit), plus ledge and corbel kinds (L.plats: shelf, cornice, walk).
   - The robbers' walk on its posts.
   - Per-section back walls (hands drawRoom): gallery, shafts, false tomb gilding, the pits' green-black, the deep way.
2. **Landmark in view:** e.g. the pyramid's apex and capstone over the face, and THE SEAL of the Mother on every back wall. **Missing today (A8).**
3. **The face:** stepped courses, the storm (sand streaks, the told arrow), drifts.
4. **Traps:**
   - plates (pale, worn) with their reload gauge;
   - block slots and the hanging block with its chains;
   - dart holes and the dart volley;
   - the stone and the great stone (rolling, shattering);
   - the false door (sealed, then broken);
   - bones in every reach.
5. **Counterweights:** the stone blocks, the pale plate block, chains, the wheels (hands drawWorld placeholder).
6. **Scarab pits** (the swarm in the spikes), egg-cases, sarcophagi, the false king, the brood mural, scarab reliefs, jars, the sealed tomb door with 4 sockets.
7. **Cast:**
   - the mummy: 8 frames, its own drawing, greybox;
   - the dart-blower, jackal and scarabs: today recoloured base sheets, each needs its own drawing;
   - the scarab seal.
8. **THE SCARAB MOTHER:** keyframed poses for every move (greybox canvas shapes today), pinned / stuck / flipped, the brood, the glob and puddle, the mound, the quake stones and shadows, her bestiary card.
9. **Music** (Daniel's go; no download made).

## QUESTIONS FOR DANIEL (rec first = what is built)
1. **A hero caught in a trap's reach** loses a share of his bar: teach 24%, test 34%, exam 50%. It is told by a click and a 0.25-0.35 s delay, and is never an instant death.
   - Rec: keep.
   - Alt: make the deep way's traps real deaths (A10 amended allows exam deaths once taught).
2. **Walking over the first plate into the reach gets you crushed** (24%). Every route pilot took that hit. It is the teach: the plate fires its trap, so stand clear or jump it.
   - Rec: keep.
   - Alt: put the first plate's reach 2 tiles further on, so a walker crosses unhurt and only a lure crushes.
3. **Mummies do not flinch** (stagger 0.15 s, unless parried, guard-broken or hit by a trap). The elite mummy does not catch fire. Without this, the mash bot beat THE TOMB-WARDEN in 5-9 s.
   - Rec: keep. A heavy undead.
   - Alt: only the elite is unflinching.
4. **The first counterweight can be skipped** by dropping 10 rows from the landing into the hall. The second counterweight (going up) and the great stone are the hard locks.
   - Rec: keep.
5. **The stone's plate is up on the antechamber's ledge.** The stone runs the whole floor, so it always opens her if she is on the floor, but it reloads in 8 s and a hero standing on the floor is in its road.
   - Rec: keep; it is the slow, safe option.
   - Alt: limit the groove to her west half.
6. **Her brood** comes out of the P2 pits (one-hit, at most 3). The brief allowed the brood, and nothing else is summoned.
   - Rec: keep.
7. **MUSIC** (CC0 per its page; please read each licence before a download). Today: synth level bed `sealedpyramid` and the composed `scarabmother` theme.
   - **Rec: "Forgoten tomb ambience" by kindland** (CC0): <https://opengameart.org/content/forgoten-tomb-ambience>. Check that it loops cleanly.
   - "Evil temple Ambiance loop" by Brandon Morris (lists both CC0 and OGA-BY): <https://opengameart.org/node/5023>
   - Not "Desert Loop (Lo-Fi)": it is the Ksar's own remaster: <https://opengameart.org/node/139215>
8. **Campaign-xp:** the fixture had no row for THE BURIED CITY. I added it along with the Sealed Pyramid's (campaign level stays L41).
   - Rec: keep.
