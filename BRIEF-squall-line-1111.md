# THE SQUALL LINE - BRIEF (draft for Daniel, 2026-11-11; nothing built)

Working names. Level: THE SQUALL LINE (alternates: THE WEEPING STAIR, THE RAIN TERRACES). Boss: THE WEATHERWIFE.
Standard: scratch/design-standard.md. Format follows docs/concepts/sky-road.md.

## WHY RAIN (what is already taken)
Checked on master before writing. Weather the road already owns:

| Idea | Owner |
|---|---|
| Sideways gusts you hear coming | GALE MOOR (the Windcaller) |
| A dive breaks what it hits | THE ROOKERY (the Shriek Sisters) |
| Rising air, clouds that kill it | THE SKY ROAD |
| Storm, lightning on iron masts | THE ROC, phase 2 |
| Ship roll, flood | THE HURRICANE DECK |
| Fog | THE FOG CANAL |
| Ice | act 6 THE FROZEN REACH is reserved in src/foe-react.js (no levels yet); T.ICE exists |

RAIN is free, and it gives the flying cast a rule of its own. My earlier sketch (clouds on sun-stones, baiting lightning) is dropped: it was the Roc's second phase.

## SECTION-BY-SECTION STRUCTURE (read this first)
Main road: ... Gale Moor > The Rookery (Shriek Sisters) > **THE SQUALL LINE (the Weatherwife)** > The Sky Road (the Roc) > the Ore Road > Stormhold > Highcrown.
PRE-QUEEN, so living goblins are fine. A climb up through the storm cloud that sits under the Sky Road: you enter in rain and leave out of the top of the cloud into sun, at the Sky Road's first mesa. About 400 columns x 80 rows. Under every gap: the same CLOUD SEA rule as the Sky Road (a fall costs health and puts you back on your last ANCHORED footing; never a sinking pan - see the Sky Road's airOnly soft-lock).

**THE RULE (one sentence, a verb):** IN THE RAIN, NOTHING FLIES. RAIN FILLS WHAT IS OPEN, AND WHAT IS FULL IS HEAVY.

The verbs the player changes it with:

| Verb | How it works |
|---|---|
| **Time the SQUALL** | Rain bands sweep west to east. Told: the light dims and the hiss rises 1.5 s ahead, and the band's edge is drawn. Inside a band every ordinary flyer is GROUNDED (wet wings: it lands and fights on foot or sits on a perch). |
| **Cut a RAIN-SKIN** | The goblins' stretched hides full of water. Strike the cord: a 3 s downpour under it. It grounds flyers there and fills any pan below. |
| **Fill and tip a PAN** | Bronze pans on balance beams. Rain or a cut skin fills a pan; a full pan sinks and its partner platform rises. Strike a full pan to tip it: the water pours (douses fire, washes small foes off a ledge) and the beam swings back. |
| **Stay DRY** | Overhangs and hide awnings are dry. Flyers under them fly. Fight them there, or bring the rain to them. |

| # | Section (cols) | Arc | What the player DOES | Encounters (designed) |
|---|---|---|---|---|
| 1 | THE WET LEDGES (0-70) | TEACH | watch a crow string drop out of the sky as the first band crosses; walk past a grounded harpy; wait out a dry gap under an overhang where the harpy flies | crow string; one crag harpy met wet (on foot), then a second met dry |
| 2 | THE RAIN TERRACES (70-160) | TEACH skins + pans; SET PIECE A | cut the first rain-skin onto a pan and ride its partner up a face no jump reaches; **THE CISTERN LIFT**: fill three pans in order to raise a cage up 18 rows while kites drift in | goblin kites that sink into reach when wet; first HIDE-BEARER holding an awning over an archer |
| 3 | THE DRY EAVES (160-250) | TEST + REMIX | a long roofed gallery: no rain reaches it, so everything here flies. Lure flyers out to the open bays, or cut skins hung at each bay mouth to bring the rain in | harpies + gale harpy under hide-bearers; first STORM PETRELS asleep on the bay rails (they wake when the rain comes in) |
| 4 | THE WEIGH-HOUSE (250-340) | SET PIECE B + EXAM | **THE GREAT BALANCE**: one beam 30 columns long over the cloud. Fill the far pan to raise the bridge, in the rain, with petrels up - then empty it again to cross back under for the silver | petrels in the bands, harpies in the dry gaps: the two flying families never up at once |
| 5 | THE STORM'S EYE (340-395) | BOSS | THE WEATHERWIFE, on a ring of hung platforms | the Weatherwife |
| - | out of the cloud (395-400) | exit | the last stair breaks the top of the cloud into sun: the Sky Road's mesa is in view | - |

**ONLY-HERE SET PIECES:** A. THE CISTERN LIFT (you see the cage and its three empty pans from the terrace foot). B. THE GREAT BALANCE (the raised bridge is visible, down, from the Weigh-House door).

**REMIX COUNT (>= 3 distinct uses each):** grounding by the band (1) - by a cut skin (2) - denied by an awning (3) - reversed by the petrel (3, 4); pans as lift (2) - as a timed chain (2) - as a bridge you must also empty (4) - as the boss's floor (5).

## FOES (Daniel: lots of harpies, birds and flyers; one or two new)
The cast is the Rookery's and the Sky Road's birds, met under a new rule.

- **CRAG HARPY, GALE HARPY, SHRIEKER, FLEDGLING (exist):** grounded in rain. A grounded harpy is a foot fighter with a short hop; a grounded shrieker cannot shriek-dive.
- **CROW strings, BATS (exist):** drop and scatter on foot when the band crosses; easy kills if you are there in time.
- **GOBLIN KITES, KITE-RIDERS (exist):** wet cloth sinks. A kite in the rain comes down into reach; a rider lands and fights on foot.
- **STORM PETREL (NEW, flyer):** the rule turned over. Asleep on a perch when dry; in the rain it is the only thing in the air. A low skimming pass along the ground (told: it tucks and a white line draws its path, 0.6 s). Knocked down by a blocked pass. So a rain band is your opening against everything else and the petrel's hunting time: no weather is simply safe.
- **HIDE-BEARER (NEW behaviour; rec a reskin of the shield goblin so tools/one-new-foe still counts ONE new base kind):** a goblin holding a hide awning on a pole. Everything under it stays dry and keeps flying. He does not attack. Kill him first, or cut a skin behind him. Role SUPPORT.
- **MOUNTAIN GOAT, GOBLIN ARCHER (exist):** ground and ranged filler on the terraces.

Role mix: melee (grounded harpies, crows, goats), ranged (archer, kite stones), runner (petrel), support (hide-bearer), heavy (shield goblin) = 5.

## THE BOSS: THE WEATHERWIFE
The rain-witch the kite goblins pay for water. She is the rule in a body: she floats until she is wet.
Inspired by floor-destroying caster fights; an ORIGINAL character, attacks and look.

**Arena.** A ring of eight platforms, each hung from a balance beam with a rain-pan as its counterweight, over the cloud. Two anchored stone stubs (east and west) never move: the fall rule puts you back on one of them. Four rain-skins hang over the ring.

**Never invulnerable.** On the wing a blow lands at 0.4 (the floor; told ON THE WING). Wet and grounded, a blow lands whole.

- **PHASE 1, THE DRY WITCH:**
  - HAIL: three told shots (C1 colours as elsewhere). Blocked, a stone goes back and tears her storm-cloak (small damage, and three returns ground her for a beat). A stone that lands holes the pan under that platform: it leaks, and the platform sinks away over 4 s (told: the pan drips, the platform creaks).
  - EMPTY THE PANS: she sweeps a hand and two pans tip (told: they glow and tilt 1 s first). Their platforms drop. This is how the floor goes.
  - THE OPENING (the level's rule): cut a rain-skin while she is under it. She is soaked, falls onto the platform below and is OPEN (gold ring + timer). The same downpour refills the pans under it, so the floor comes back where you fought well.
  - The squall crosses the arena on the level's clock (every ~20 s): it grounds her briefly and refills every pan a little. A slow player gets floor back from the weather; a good player makes it with the skins.
- **PHASE 2 (half her blood), SHE TAKES THE RAIN:** she tears down the remaining skins and pulls the squall onto herself. Now a rain column follows HER.
  - She is always wet, so she no longer flies: a staff duel on foot. A different fight.
  - Wherever she stands, the pans fill and the platforms SINK. The floor is lost under her, not at range. Lead her; do not stand with her.
  - Her wake is your tool: tip a pan she has filled (strike it) and the pour staggers her. The petrels wake in her rain, one at a time.
  - Lure her onto an anchored stub and nothing sinks: the one place to trade blows, and she will not stay.

**Each hero's answer** (to be checked in the lab, all nine): every hero can strike a cord and a pan (both are in melee reach from a platform or struck by any projectile). Ranged heroes chip her on the wing at 0.4 and still need a skin for the whole-damage window. Shield heroes return hail; heroes without a shield dodge it and lean on the skins. The geomancer's raised ground does not hold over the cloud: say so on the arena door.

**The fall.** Into the cloud: health cost, told, back on the nearer stone stub.

## CHECKPOINTS
Four: terrace foot (1), the Eaves door (2), the Weigh-House door (3), the Storm's Eye door (4). None over ~200 route tiles apart.

## SILVER
Three: under the Great Balance (the cross-back in section 4), a dry cave behind a full pan you must tip, and a petrel roost reached only in the rain.

## ROAD AND SAVES
The Sky Road needs the Rookery today. Insert with src/route-insert.js's one rule (the night road and the Academy did the same): skyroad.needs = this level; a save that has cleared the Rookery or the Sky Road keeps the Sky Road open. Ships behind its own flag, off.

## RISKS AND OPEN QUESTIONS (rec first)
1. Three bird-heavy levels in a row (Rookery, this, Sky Road). Rec: accept - the rule makes the same birds behave differently here - but the boss must NOT be a bird (she is not).
2. The lab bot cannot work balance platforms. Rec: tune the boss by Daniel's playtest plus a scripted bot for the skins; treat win rates as rough.
3. One new base kind or two? Rec: petrel is the new kind, hide-bearer is a shield-goblin reskin with new behaviour.
4. Pan lifts are a moving-platform system. Check what the Ore Road lifts and the Stockade pulley already give before building a new one.
5. Size: level + art + boss + music + tune is a multi-lane job. Rec: after the demo; greybox first, Daniel walks it, then art.
6. Not yet checked: what the Rookery's and Sky Road's mid-level set pieces do in detail, so a set piece here may need changing if it echoes one.
