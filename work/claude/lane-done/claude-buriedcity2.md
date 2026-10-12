# claude/buriedcity2 - BURIED CITY 2: the full rework (OPUS design pass, 2026-10-11)

Base: origin/claude/batch86 (06c0f5e3). Brief: scratch/brief-buriedcity2.md (+ review-buriedcity.md, design-standard, audit-polish row 41).
The Opus pass is DONE and STOPS here: level + mechanics + boss changes. ART IS PLACEHOLDER (the art list below); the SONNET art lane and the
SONNET tune lane (12-seed boss loops) follow. Ship rule: this level does not go live in its changed form until the art pass merges.

## WHAT CHANGED (the brief's DESIGN PASS 1-6)
1. **UNDERGROUND FOR REAL.** The sand roof covers every column past the sinkhole (col 38). Sky only on the dunes (0-37) and through FOUR SHAFTS where
   the roof has fallen in (52-55 teach, 124-129 the bazaar's sun lane, 316-320 the halls' exam, 519-520 the clock shaft). THE SUN'S DRAIN (A13,
   src/sun-hands.js) lives only there (L.sun via BCH.sunAt) - the desert's shade rule turned inside out: cross a shaft quick, fight in the shade,
   the stall awnings are drawn shade. New backdrop module src/redraw/buried_city_backdrop.js: back wall, far arches, the roof's underside, the dunes'
   sky fading out down the sinkhole; it draws whatever the parallax setting (no sky can leak). L.noSkyRays stops the sky's generic rays.
2. **THE HOURGLASS TOWER** is in view on every screen (parallax 0.035, nearer/taller as you go, its upper bulb empties with your progress - the
   city's clock). The throne room is at its foot.
3. **TWO NEW SET PIECES THAT ARE VERBS** (with THE GREAT SAND-GATE and THE HOURGLASS kept):
   - **THE SINKING STREET (200-236):** a whole buried street (paving wall to wall, two house roofs, a minaret stub, a dome) stands on a pit of sand
     level with the upper street. The way on is THE ARCH a storey down in the east wall (its keystone and lamp show over the street). Pull the chain
     by the arch: the gate opens and the street goes down with you, a construct (jammed while it moves) and a slinger on its roof; shut it and it
     rises back (two-way). Hands: `deck` rooms - the deck is written on the sand's top every row change, bodies unburied onto it.
   - **THE SAND-FALL (337-395):** the sluice hall; its way on is a HIGH ARCH 8 rows up. A crack pours a sand-fall a CHUTE lever swings between THE
     GRATE (it runs away) and THE WALL (it HEAPS, two rows a step, up to the arch's sill). In the fall you are beaten down (can't rise, no damage) and
     a construct is jammed: swing it in, let it pile, swing it back off the heap, climb. A construct where the heap rises is lifted and jammed; a
     slinger in the arch throws while you work it.
   - **THE TRAP HALL** is now the exam that combines them: its floor-gate is open (a drop to the end, taught safe at the foundry's floor-gate) and
     only the roof's fall can fill it - shut the floor-gate AND swing the fall in (two levers); swung first, the sand falls into the dark (told). The
     fall starts on the lip, holding a construct there jammed - swing it and he is free. A drowned on the lip's edge can be thrown OFF THE EDGE.
   - A4 remix: seven uses (drain, ride, sink, fill, run down, pile up, feed) + the sun taught/tested/remixed/examined.
4. **PLATFORM VARIETY:** 65 built footings in 10 kinds (L.plats: balcony 24, pipe 13, beam 9, lintel 4, house 4, drum 3, awning 3, rotten 3, dome 1,
   minaret 1); every ledge declares its support (L.structures: corbels, stall poles, pipe brackets, chains) - tools/solid-islands ratchet 45 -> 0.
5. **WEIGHT:** three ELITE exams on footing with a hazard by them - the halls (318: in a shaft of sun, stakes behind him + a throwable drowned),
   the foundry (484: a drift at his back + a slinger), the throne's warden (582: a drift at yours, his gate at 589). 36 foes: drowned 11, slinger 11,
   construct 8 + 3 elite, brass scorpion 3 (no type over 35%). Fights while the sand moves: the street's watch, the granary/shaft slingers, the
   shaft's drowned riding up with you, the sluice's construct and arch slinger, the trap lip.
6. **THE APPROACH SETS UP THE KING (B8):** his head in the dune (22), his statues (170, 593, 612), his mural (97-106), his kneeling court (563-579),
   and THE SEALED PYRAMID carved over the throne door (616-628: the next road, foreshadowed).

## THE LEVEL MAP (columns; GRID rows - the city is laid on logical rows and set one row lower, `DY`, so every street's feet sit on a band edge)
| cols | section | what |
|---|---|---|
| 0-47 | THE DUNES | open sky, the king's head, drums, the sinkhole stair down under the roof |
| 48-111 | THE SAND STAIR (TEACH) | shaft of sun 52-55; THE FIRST SAND ROOM 62-73 (drain, lever 58 outside); gear 1 on a rotten balcony; drift + first drowned; the mural |
| 112-199 | THE BURIED BAZAAR (TEST) | sun lane 124-129 under stall shade; THE GRANARY 142-155 (ride up under a slinger); CP1 166; the upper street: king's statue, first construct, dome + silver |
| 200-236 | THE SINKING STREET (NEW) | the street on 10 rows of sand; chain by the arch (233) / lever on the west lip (197); down to the arch 234-236 |
| 237-336 | THE HOURGLASS HALLS (REMIX) | SPIKE CELLAR 246-259 (fill); THE HOURGLASS 282-291 -> 294-309; halls' ELITE 318 in the sun, stakes 323-324; CP2 329 |
| 337-395 | THE SAND-FALL (NEW) | sluice hall 341-379, chute levers 345/366, heap 368-379 to the arch at 380 |
| 396-512 | THE DROWNED QUARTER | the wheel 405; quarter 411-466 drains, its buried foes rise; foundry yard: ELITE 484, floor-gate teach 498-500; CP3 506 |
| 513-629 | THE THRONE STREET (EXAM) | CLOCK SHAFT 514-525 (ride up through the sun 519-520); TRAP HALL 546-559 (chute 538 + floor-gate 544); king's court; THRONE'S WARDEN 582 (gate 589); vault 600-607; CP4 621 |
| 630-669 | THE THRONE ROOM | THE HOURGLASS KING |

## THE BOSS (B1-B15 audit and changes)
- B1/B14 his opening stays the level's verb (a throne-room sand-gate as his glass runs low). B13/B15 unchanged (brass x0.45, ward x0.40, open x2).
- **B12 FIXED:** phase three's cracked glass gave a 3.8 s low window, under the 4.4 s from the room's centre to a lever (the review's 2a). New
  `HK.lowAt3 0.6` (4.8 s); `lowOf(ph)` drives glassLow and the drawn glass. tools/buried-city.mjs asserts every phase's window >= the run to a lever.
- **B6 first cut:** he was 100% WITH FLASKS (6/6 x3, dry 89) after the flask lift + riposte. hp 2425 -> 3500, blows ~+30%
  (pend 50, gear 29, stream 37, slip 39, hour 44, pour 10). 3-seed sanity below; the SONNET tune lane owns the 12-seed band.
- B8: the approach (above) and the tower over his room. B10 read, B3 ward, B4, B5 phases unchanged. tools/buried-city-levers.mjs (real keys, 30 pulls)
  now finds the throne room from L.arena (no hard-coded columns).

## RESULTS (PORT 8845, sequential pages)
- **tools/buried-city.mjs: 221 green** (rule line, arcs, REQUIRED by the reach model for the first room / the street / the upper bulb / the heap /
  the quarter / the trap hall / the rides, no sky past the sinkhole but L.sun, B8 decor, 10 platform kinds, the cast, the hands in a fake world:
  street sinks + rises with a hero, heap piles + lifts + beats down, trap hall fills only gate-shut AND fall-in, respawns, the king incl. B12 per phase).
- **level-quality: CLEARS** (bands 6 / 50% second height, 6 gadget kinds, density 1.19, ruleFight 31/31, 4 checkpoints, pilot 18 blows 3 deaths,
  curve 233% / 3 deaths in band, mash held). Gate-wide the only miss is MINECART's curve row - pre-existing on batch86, not this lane.
- **Route pilot (tools/buried-city-route.mjs, real keys, base movement, god, no foes): ALL 8 HEROES 9/9 legs, 0 lifts** (knight, warden, pyro,
  paladin, pirate, reaper, geomancer, berserker). reach-heroes: 7 targets x 8 heroes, 0 misses. level-reach green.
- **buried-city-levers: 30 pulls green** (k/w/p, both levers, all 3 phases, walking and against the wall; lit while his glass is low).
- **MASH: level 0/3 clear** (knight 3 deaths, warden 9, pyro 2) **then boss 0/6** (re-stamped LEVEL THEN BOSS, docs/mash-bot.json).
- deadends, stuck --static (1310), solid-islands (buriedcity 45 -> 0, entry removed), checkpoint-gaps (166/329/506/621, <=200), checkpoint-stand,
  checkpoints, signs, elites, killzones, spawns, collectables, keys, architecture, one-new-foe, goblin-lint, threat-holes, sprinkle-cap, floaters,
  relics, comments, homepaths, tells, boss-read, answer-tags, blow-tags, skins, mash-gate, curve-gate, map-spacing, map-grammar, dressing, hint-shown: green.
- **Page, whole game: boss-openings, boss-fight-end (60 fights), mark-integrity, untold-told (22 foes): green.**
- dangling-paths: red only on the anti-plunge check (cited by src/foe-react.js / main.js on batch86 - not this lane).
- knock-into-exams lists "construct@318 EASED by spikes" - a false listing: the construct is in KNOCK_SKIP (never thrown); the throwable drowned
  by the halls' stakes and on the trap lip are the intended targets.

### 3-SEED BOSS SANITY (boss-rates, practiced, profile human, flasks kit, L40)
| king | knight | warden | pyro | all | fight time |
|---|---|---|---|---|---|
| OLD (batch86, 2425 hp) | 3/3 | 3/3 | 3/3 | 100% | 74-106 s |
| 3150 hp, blows +13% | 3/3 | 3/3 | 3/3 | 100% | 94-126 s |
| **3500 hp, blows +30% (shipped)** | 3/3 | 3/3 | 3/3 | **100%** | 96-119 s |
Still HIGH: hp only lengthens the fight (now in the 90-150 s band); the bots end with health to spare and drink. Not looped further (brief:
the SONNET tune lane does the 12 seeds). Rec for it: pressure, not hp - shorter gaps between blows (HK.gap), a faster P3, openCap 0.11 -> 0.09.

### THE WALKER (tools/level-walk.mjs, L40 typical build, human+first, 1 seed)
First run found a real STUCK: the walker heeds a level hint only within r tiles and the street's chain is across the street - fixed (r 42).
After the weight bump (construct cd 0.75, poke 32, sweep 39; drowned x5.4, slinger x2.3, scorpion x4.8; drowned/slinger/scorpion hp up):
knight 0 deaths arrive 78% (min 68), warden 0 / 64% (56), pyro 0 / 93% (72); 97% of the route measured, 1 drink each. **MISS on deaths (target
1-2) and arrival (< 50%)** - better than the greybox's 93-100%, but the act-5 weight is the tune lane's / level sweep's.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **Checkpoint 3 sits at 506 (before the clock shaft), not after it.** checkpoint-gaps caps 200 route tiles and the sand-fall's climb + the quarter
   fill them; a trap-hall death re-rides the shaft (~10 s + the yard lever). Rec: keep (4 shrines, a weightier exam). Alt: a 5th shrine at the
   wheel (402) and CP3 back to 530.
2. **The king is still 9/9 with flasks** after +44% hp and +30% blows. Rec: the Sonnet tune lane tunes his pressure (gaps, P3 tempo, openCap),
   not more hp. Alt: accept a long fight and push hp to ~4500.
3. **The sun lives only in the roof's shafts** (the desert's shared A13 drain, 2 s before it starts: a shaft crossed is free, a fight in one is not).
   Rec: keep. Alt: no sun inside the city at all (then the shafts are light only).
4. **The walker still arrives 64-93% with 0 deaths at L40.** Rec: leave it to the act-5 level sweep (the same miss as the Ksar); the exam's real
   death (the trap hall) is taught and told. Alt: double the exam squads.

## ART LIST (exact, for the SONNET art lane - art before live)
1. **THE TILE KIT (first):** the ONEWAY tile draws the shared LOG-WITH-GRASS in the city (off-theme wood): replace per L.plats kind - balcony (stone
   slab on corbels), awning (striped stall cloth), pipe (brass, brackets), beam (stone beam on two chains), lintel (broken lintel), drum (a spire's
   fallen drum), rotten (cracked, dusty, its 3-2-1); SOLID kinds dome / minaret stub / house (a buried roof with parapet). The supports are
   `bc*` structures (placeholders in src/buried-city-hands.js drawStructure). Masonry by district (bazaar plaster, halls ashlar + brass inlay,
   quarter water-stained clay, throne street gilded frieze) + rubble.
2. **BACKDROP** (src/redraw/buried_city_backdrop.js): the back wall, far arches, the roof's underside (buried rooftops, beams, sifting sand), the
   dunes' fade, and THE HOURGLASS TOWER (glass + brass, crown of gears, sand running) - placeholder shapes in place.
3. **LIGHT:** the four shafts (dusty god-rays + a lit floor patch; hands drawWorld draws a plain column); L.lamps (6: oil lamps, braziers at the
   first lever, mural, arches, wheel, throne door) with warm light vs cold sand-shadow; lever lamps.
4. **THE SINKING STREET:** one baked set riding the sand (paving, two house fronts, minaret stub, dome), sand streaming off its ends while it moves,
   THE ARCH on the east wall (keystone over the street, lamp) reading "the way is under you".
5. **THE SAND-FALLS:** the roof crack, the swinging brass CHUTE with its pivot and stops, the fall curtain + splash, the GRATE (352-354), the HEAP as
   a sand body with slopes; the chute levers distinct from sand-gate levers (a pointer to where it lands; today the text TO THE WALL / ...).
6. **SAND ROOMS:** gate housings with slot + gauge, roof-hole streams, the great sand-gate grille (438-442) linked to the wheel (405).
7. **THE KING'S APPROACH:** head in the dune, three statues, the mural, the kneeling courtiers, the Sealed Pyramid relief.
8. **CAST:** construct (clock-face head, escapement), sand-drowned (bleached rags, sand trickling), brass scorpion (cogs), sand-folk slinger; own-skin corpses.
9. **THE KING:** keyframed poses (pendulum, gear, stream, slip sink/rise, hour, stall, turn), crown of gears, a real throne (today a flat rectangle),
   the two chained ledges, the banks, the pours.
10. Stakes: the cellar's and the halls' trench (323-324).
Music unchanged: "Loopable Dungeon Ambience" (JaggedStone, CC0) for the level, the king's composed theme.
