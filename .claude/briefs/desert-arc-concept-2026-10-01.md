# DESERT ARC - CONCEPT CONFIRM vs the new-level rules (Daniel interview, 2026-10-01)
Overrides the older desert briefs (docs/briefs/*.md, src/draft/*.js) where they differ. Order on the main road:
caravan (live) > welltown > redgorge > glasssea (> 4b suntemple, optional) > buriedcity > sealedpyramid > kingspyramid.
FIX: well-town's `needs` must be 'caravan' (the brief says 'sunkencaravan'). The briefs' "checks pass" claims are STALE
(the drafts drifted from main.js) - re-run tools/draft-level.mjs per level. Every level still goes concept -> Opus
greybox (from the draft) -> reviewer vs Mage's Folly -> fixes -> Sonnet art/music; level-quality gated.

DECISIONS (all levels)
- RANGED: one RESKINNED shooter per level from a proven ranged AI, placed to hit you while you handle the level's rule:
  L3 bandit slingers on gorge ledges; L4 glass-shard throwers by night; L4b sun-priest acolytes with light bolts;
  L5 sand-goblin slingers; L6 tomb dart-blowers (archer AI); L7 gilded archers.
- NEW FOES: MAX ONE new type per level (its signature: e.g. raptor - Gorge, construct - Buried City, mummy - Pyramid);
  the rest are RESKINS of proven AIs (water-thief = cutthroat, crab = scorpion, sand-drowned = mummy, night hunter =
  bandit, jackal = hound, glass scorpion = scorpion variant, ...). Role mix >= 3 per level.
- COLLECTIBLES UNLOCK (themed key per level, HUD says what; each vault = relic + silver): L2 water-skins fill a cistern
  -> its vault; L3 feathers -> the nest vault; L4 glass shards -> the mirror bridge to a vault; L5 gears -> the
  clockwork vault; L6 scarab seals -> the sealed tomb; L7 sun-coins -> the King's treasury. L4b: clearing it unlocks
  THE SUN PRIEST class (~800 coins).
- MUSIC: a unique DOWNLOADED CC0 track per level (Daniel's go before each download - list them in one batch); bosses
  get composed-in-code synth themes.
- BOSSES: one per level, NO MINIS (Glass Stalker, Sand Warden, Embalmer CUT). L2 Bandit King, L3 NEW GROUND BOSS (not
  the Roc - THE SKY ROAD KEEPS THE ROC) tied to the flood (e.g. a giant canyon crab / sluice warden the flood washes off
  its perch = the opening), L4 Glass Colossus, L4b Fallen High Priest, L5 Hourglass King, L6 Scarab Mother, L7 THE
  SKELETON KING. Models in src/desert-bosses.js + src/skeleton-king.js are headless/unwired. Boss lessons apply.
- L4 THE GLASS COLOSSUS = a CLIMBABLE COLOSSUS (Shadow of the Colossus; Daniel 10-01): you climb its glass body to
  glowing weak points while it tries to shake you off (told shakes, handholds, sun-glare flashes); weak points taken
  with the new verbs (PLUNGE into them, up-slash from below); falls are survivable but cost the climb. The fight is
  the level's set piece. Mash bot must lose (it can't climb).
- FINALE = THE ARC'S EXAM: the King's Pyramid climb recalls the arc in short beats (sun/shade, water pours, flood, sand
  rooms, trap plates) leading to the mirror galleries; the King's 3 phases use light + the storm.
- SUN PRIEST: keep; a light-themed caster/healer (distinct from the Paladin's melee + light bar), built with the temple.

## WELL TOWN BOSS CHANGE (Daniel, 2026-10-02, after playing the greybox)
- The Bandit King "feels like a mini" and is "way too easy". NEW BOSS: THE CISTERN QUEEN - a giant scorpion matriarch
  nested in the dry cistern (why the wells fail; the Old Stinger elite is her brood). P1 she burrows + strikes from the
  sand: flood her burrow (windlass / pour) -> she bursts out soaked + slow = 3 s opening; P2 she climbs the well shaft,
  red-told tail sweeps on its walls; P3 the cistern floods + her brood pours in. Screen-filling silhouette, lit stinger.
- EXCEPTION to "no minis": the Bandit King becomes THE GANG LEADER, a MINI-BOSS: throws MOLOTOVS you can REFLECT (strike
  them back) to set him alight EASILY; TWO SWORDS (faster attacks); occasional DODGE; NO charge attack.
- Difficulty: new bosses target human bot 50-60% + Daniel's playtest gate (the bot over-rated the King at 71%).
- Well clarity: skin HUD (3 pips + 'E: FILL / POUR / DRINK'), glinting fillable wells, cracked dry walls + smouldering
  fires with a pour marker, a safe first lesson (gate well + wall, no foes), a pour-arc preview. With the art pass.
- CISTERN QUEEN MOVESET (Daniel: "she needs more attacks" -> expanded, 10-02):
  P1 SAND: Sand Strike (!! erupts from a bulging mound - roll off); Burrow Charge (!! dune wave ploughs at you - jump);
  Pincer Snap (! waist scissor - block); Snap-Snap-Lunge (! ! !! - roll the last); Tail Lance (!! stinger floor stab -
  jump); Sand Flick (! arcing stones - block/step out). OPEN: flood her burrow (pour on the mound / windlass) -> soaked 3 s.
  P2 WELL SHAFT: Venom Spit (! arc, poison puddle); Tail Sweep high/low (!! lit band - duck/jump); Drop Pounce (!! growing
  shadow); Skitter Ambush (!! from a side tunnel, dust trickle tells which); Wall Slam (!! rubble, ledge shadows); Stinger
  Pin (!! lunge - dodged, the stinger sticks in the wall briefly). OPEN: pour on the wall above her -> loses grip, on her
  back 3 s.
  P3 FLOOD: Wave Thrash (!! jump); Grab and Sting (!! strike the claw/mash or heavy poison sting); Death Roll (!! through
  the water - jump/roll); Tidal Tail (!! venom-water whip - duck/get above); Brood Shield (hides behind up to 3 one-hit
  brood that drown in deep water). OPEN: a broken grab -> she rears flailing 3 s. ENRAGE < 15%: Snap-Snap-Sting into
  Death Roll.
  ALWAYS: raised claws turn frontal hits outside openings (visible guard); venom stacks slow stamina regen; x0.05 chip +
  greed reprisal; mash bot 0/6; human bot 50-60%; screen-filling silhouette, lit stinger.
- GANG LEADER mini fights in the MARKET COURTYARD (where the King's arena was).
