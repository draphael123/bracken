# THE SKY ROAD - BRIEF (Opus greybox lane claude/skyroad, 2026-10-05)
Concept: scratch/sky-road-concept.md + DANIEL'S ANSWERS 10-03 (they override the draft). Standard: scratch/design-standard.md v2.
Committed copy: docs/concepts/sky-road.md (the repo's own, so the brief is never on one laptop only).

## SECTION-BY-SECTION STRUCTURE (read this first)
Main road: ... Monastery > Gale Moor (the Windcaller) > **THE SKY ROAD (the Roc)** > the Ore Road > Stormhold > Highcrown (the Goblin Queen).
PRE-QUEEN, so living goblins are fine. Gale Moor = SIDEWAYS gusts on the ground; the Sky Road = VERTICAL air (thermals) + the glide cloak.
A climb west -> east and UP off the moor's sun-warmed crags: ~460 columns x 96 rows. Under every chasm: THE CLOUD SEA (a fall costs health
and the updraft under the cloud throws you back to your last footing - told, never an untold death).

**THE RULE (one sentence, a verb):** THE SUN WARMS THE ROCK AND THE AIR OVER IT RISES: RIDE IT UP, GLIDE INTO IT - AND A CLOUD ON IT KILLS IT.
The verbs the player changes it with: TURN A SUN-STONE to the sun (a dead thermal wakes; a goblin can turn it back), GLIDE INTO a thermal
(the cloak), and TIME THE CLOUDS (their shadows are drawn creeping across the rock before they reach a column).

| # | Section (cols) | Arc | What the player DOES | Encounters (designed) |
|---|---|---|---|---|
| 1 | THE MESA STEPS (0-95) | TEACH | stand in a thermal and rise up a mesa face no jump reaches; wait out a cloud on the second (short drops onto sand: cheap) | shield goblin + archer on the mesa top (shield covers the bow); a crow string over the second climb |
| 2 | THE RIDERS' STATION (95-185) | TEACH cloak + sun-stone; SET PIECE A | take THE RIDER'S CLOAK off its mast; glide a gap over sand (safe), then over the cloud sea; glide INTO a thermal; strike the first SUN-STONE; **THE GREAT KITE REEL**: wake the reel's thermal and the station's war-kite climbs it and hauls the cage up the 20-row cliff - only while the sun is on it | the first CRAG HARPY (snatch, over sand); two goblin KITES riding the reel's thermal + an archer on the deck while the cage climbs; CHECKPOINT 1 on the station deck |
| 3 | THE HARPY ROOSTS (185-290) | TEST + REMIX | thermal CHAINS between roost pillars as a cloud bank rolls over them one by one (read the shadows, glide roost to thermal to roost); a required sun-stone across a glide; a dead-end roost with a silver | harpies SNATCH (carried off over the drop: struggle free, glide back); GOBLIN KITE-RIDERS (the new foe) circling on the thermals + a HORNBLOWER whose horn calls them down on you (kill him first); two GOBLIN SLINGERS (reskinned shooter) on hanging kite platforms; a CRAG HAWK (vulture reskin) whose circling shadow kills a thermal for a beat; CHECKPOINT 2 |
| 4 | THE BROKEN SKY BRIDGE (290-385) | SET PIECE B + EXAM | **THE SUN-DISC**: strike the ancients' bronze disc on the bridge tower: its beam swings across the chasm and wakes a ROAD OF THERMALS one after another over a 34-column gap - glide-chain it before the cloud bank covers it; then THE EXAM: the bridge's broken spans (cracked stone goes three beats after you land) between sun-stones you must turn, clouds, snatches, riders and archers - every verb at once, nothing new | kite-riders + the far tower's hornblower during the crossing; shield + archer at a span head; two harpies over the spans; a goat on the tower ledge (a butt off the span); the KITE-CLOTH vault (the riders' old loft) off the last span; CHECKPOINT 3 at the Eyrie door |
| 5 | THE EYRIE (385-440) | BOSS | THE ROC on her nest of masts, bones and stolen kite cloth, thermals round its rim | the Roc (her harpy brood is her shed feathers) |
| - | the road down (440-460) | exit | the cloak is hung back on a mast; the road goes down toward the Ore Road | - |

**ONLY-HERE SET PIECES (verbs, big, change the route visibly, show their target first):**
- A. THE GREAT KITE REEL (station): the war-kite is visible flying at the cliff top from the cliff foot; turn the sun-stone, the kite climbs
  the thermal and hauls the cage up 20 rows; a cloud over it and the cage sinks. You ride the machine your verb powers.
- B. THE SUN-DISC (sky bridge): the beam is visible pointing at the chasm floor; strike the disc and the thermals wake down the beam one by
  one into a road across the chasm; a cloud bank creeps toward it (drawn). The crossing is yours to time.

**REMIX COUNT (>= 3 distinct uses):** rise (1) - glide into (2) - wake a stone (2) - a machine the air drives (the reel, 2) - chains under a
moving cloud bank (3) - a road of thermals you light (4) - cracked spans between stones (4, exam) - plunge from a thermal onto the Roc (boss).
**REQUIRED USES:** the mesa face (1), the reel cage (2), the roost glide chain + its sun-stone (3), the sun-disc crossing (4), the spans (4).

## FOES (max ONE new type)
- **GOBLIN KITE-RIDER (NEW, the one new type, `kiterider`; role RUNNER):** a goblin under a war-kite that CIRCLES IN A THERMAL. Live thermal: he
  rides at its top; a SWOOP at you (red !!, a dashed line to where you stand, 0.7 s) - a kick and a shove; blocked, he is knocked out of the sky.
  ANY blow on him in the air cuts his line: he falls and fights on foot (over the cloud sea, he is gone). CLOUD ON HIS THERMAL: he sinks and lands
  - your opening. A hornblower's horn calls every rider in range into a swoop.
- **CRAG HARPY (exists, `harpy`) + SNATCH:** on the Sky Road her dive is told red (!!, a screech); unblocked it TAKES you: she climbs and carries
  you out over the drop (1.4 s; mash attack/jump to break free sooner) and lets go - glide back or fall to the cloud sea. Blocked, she is knocked down.
- **GOBLIN KITES (exist, `kite`):** the moor's box-kite goblins; on the Sky Road they hang in thermals (high, out of reach) and sink into reach
  when a cloud kills theirs. Ranged stone drop.
- **GOBLIN SLINGER (reskin, cnSkin `gobslinger` on the caravan slinger's proven AI):** the reskinned shooter, on hanging kite platforms.
- **CRAG HAWK (reskin, cnSkin `craghawk` on the desert vulture's marked dive):** the travelling bird family with the sky twist - while it circles
  over a thermal its shadow kills it for a beat (drawn).
- **HORNBLOWER (exists, `horn`, SUPPORT):** his horn's gust shoves, and it calls the kite-riders down on you. Kill him first.
- **GOBLIN ARCHER (exists, `archer`, RANGED), SHIELD GOBLIN (exists, `shield`, HEAVY), MOUNTAIN GOAT (exists, `goat`), CROWS (exist).**
Role mix: melee (crows, harpies, goats), ranged (archer, slinger, kite), heavy (shield), runner (kite-rider), support (horn) = 5.
No living-goblin issue: the Sky Road is before the Goblin Queen (main.js CRAG order moor > skyroad > oreroad > storm > crown).

## CHECKPOINTS
Three + the pre-boss: the station deck (1), the roosts' far pillar (2), the Eyrie door (3). Spacing >= 90 route tiles, none over ~200.

## SILVER VAULT (no relic)
KITE CLOTHS x4 (scraps of the lost riders' kites, quest `cloth`, HUD CLOTHS n/4): laid in THE RIDERS' LOFT (E) off the last span, the loft's
woven door opens: a SILVER. Plus two secret silvers (a dead-end roost; under the station deck). Cap 3.

## THE BOSS: THE ROC (exists in code, unplaced since the Monastery rework - reworked for the Eyrie in her own module)
She is the rule personified: the mother of harpies, who rides the thermals and drags the clouds over them.
- KEPT from her kit: in the air nearly always; the DIVE (a shadow marks the spot: onto the nest's woven boards her talons STICK = open; onto stone
  she skids); the GALE (wingbeats walk you toward the thorny rim); SHED FEATHERS; THE SNATCH (as her harpies: talons spread = the tell; struggle).
- NEW (the level's verb): THE THERMAL PLUNGE (main opening) - ride a rim thermal up ABOVE her and plunge onto her back: she drops to the nest,
  open. She drags a CLOUD over the thermal nearest you (its shadow told) - her answer to your verb.
- PHASE 2 (~50%): THE STORM ROLLS IN - most thermals die (only the sun-stone thermals you turn stay); lightning finds the iron KITE-MASTS (a told
  crackle); a strike while she perches on a mast knocks her down (the second opening). ONE NEW MOVE: the storm dive (two shadows).
- ANTI-SPAM WARD: after every opening, a told ~3 s ward (feathers bristle, a ring) - no chain-lock. STAGGER = STILL (down, she does not move).
- Numbers: human bot 50-60% across knight/warden/pyro (no hero at 0), mash 0/6, ~90-150 s. Then Daniel's playtest gate.

## PLACEHOLDERS / NOTES
- Music: the level reuses an existing track as a placeholder (no download): `windcaller`'s neighbour `skysail` for the level; the boss keeps her
  own 'roc' track. Daniel picks the real track (CC0/CC-BY).
- Greybox art: plain shapes - shimmer columns, cloud shadows, stones, the cloak, the kite-rider (the kite goblin's sprite under a war-kite tint).
