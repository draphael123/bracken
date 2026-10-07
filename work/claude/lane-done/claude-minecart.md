# claude/minecart - THE DEEP RAILS + THE GREAT DRILL, the Opus greybox (2026-10-07)

Base: origin/master b4300130 + the concept briefs. Brief: .claude/briefs/the-minecart-brief.md (= scratch/brief-minecart.md), after
.claude/briefs/the-minecart-concept.md (its DANIEL INTERVIEW 2026-10-07 section rules) and the side-roads concept. House rules: design standard
A1-A12 (A10 amended), B1-B14; brief-levelsweep v2. Greybox art only (the art pass follows the review). Every open choice is built as recommended.

## What it is
`minecart`, THE DEEP RAILS, `needs: 'oreroad'` (APPENDED to LEVELS; a map SPUR off the Ore Road - Stormhold still needs the Ore Road).
RULE (asserted equal to the code header): "YOU RIDE THE WHOLE WAY. THROW THE POINTS TO PICK YOUR LINE; LEFT BRAKES, RIGHT BOOSTS."
- ALL CART (src/minecart-hands.js drive): the cart is the hero's movement inside the level. Cruise 150 on its own, RIGHT boosts (230), LEFT brakes
  (to a stop; held at a stop it REVERSES slowly - out of a dead end, back for a missed lever), JUMP jumps the cart (it keeps its pace in the air),
  DOWN ducks into the tub (src/duck.js duckClears), DOWN + JUMP drops through to the line below (the lines are one-way rail). No roll from a cart.
  A wall at speed is a CRASH (health; a fall-in puts you back before its lever); slower than 100 it is a bump. A fall: 27% of max health and back
  on the rail 128 px behind the lip (A10 amended) - in an EXAM zone it is a real death. Speedometer on the HUD.
- THE VERB: THROW THE POINTS - a lever beside the line (a blow, or E as you pass). OPEN drops you to the low line, SET keeps you high. The lever's
  disc shows an arrow; the fork draws open (blue chute) or set (gold rail).

## The level (src/minecart.js, 1000 columns, route 967 tiles, five height bands: the line climbs to row 21 and drops to row 37)
1. THE LOADING YARD (0-170) TEACH: a gap, a beam (duck), THE BOOST GAP (9 wide), THE FIRST CRUSHER (brake), THE FIRST POINTS (REQUIRED: the low line
   runs into a fall-in under a rock roof - a dead end that pays a heart and coins).
2. THE SWITCHBACKS (171-311): fork A (high: two gaps, two ore, bats, an archer / low: a crusher and a timed gate), THE HIDDEN LEVER in the roof (a
   jump and a blow) opens points down into THE OLD SPUR (silver one, an ore), the first rockfall.
3. THE GOBLIN LINE (314-469): goblin carts on the parallel line - an archer (teach), a caster (runes on your rail), a SLOW cart on your own line
   (jump into it), the pair (one ahead, one behind), a brute on the rail, THE OLD DRIFT (a dead end under the line: coins + a heart), and its EXAM
   (a boost gap, real death, an archer waiting on the far side).
4. THE CAVE-IN (472-609) SET PIECE: src/chase.js (rock, kill, autoscroll) down the incline from row 25 to row 37; rock on both lines, an archer
   pacing you, THE FORK AT SPEED (REQUIRED: be up top with its points set - the low line is falling in), a boost gap off the high line.
5. THE CRUSHER WORKS (610-764) at row 37: a crusher pair off the beat, the timed gate, a tippler over a boost gap, an archer pacing you through
   two more crushers, THE HIGH WORKINGS (silver two, two ore), a sapper, a brute.
6. THE EXAM (765-899): up ten rows, the points under the archer + caster pair (high: a crusher / low: a gate), a rune on the deep gap's lip,
   a slow goblin cart to jump into, a second deep gap. Real deaths throughout.
7. THE SMELTER (900-959): its lever wants 8 ORE (locked, told); open, its points drop you to the smelter's line (silver three). THE BORE (the drill's
   tunnel) sets the boss up.
Stations: 144, 310, 474, 612, 765, 903 (+ the start); 80..200 route tiles apart (tools/checkpoint-gaps.mjs). Ten ore (the HUD counts ORE n/10,
the smelter wants 8), three silvers, no relic. Cast (no new type - tools/one-new-foe.mjs pins minecart to exactly NONE): goblin ARCHER and goblin
CASTER ('gobmage') riding carts (their machine is the hands' while they ride: a told draw '!' and an arrow carrying the cart's pace / a rune on
your rail), TIPPLER and MINER (the Ore Road's crew), BRUTE, SAPPER, BAT. Any blow that lands throws a rider off; landing in his cart takes it.

## THE GREAT DRILL (src/great-drill.js pure + bot plan; src/great-drill-hands.js world + greybox drawing)
A CONSTRUCT (B14). THE BORE is a TREADMILL (three one-way lines; the walls and sleepers run past at cruise: boost pulls you ahead, brake lets it at
you). ALWAYS HITTABLE: its CAB (over the mid and high lines) takes a whole blow whenever it is not warded (B13 - no chip waiting room; the cab is its
opening for the greed rule, so a cab blow is never greed). ITS KEY: a tippler chute drops a LOADED ORE CART on the mid or high line; SET THE POINTS
(the mast in the middle: a blow or E) and it drops to the LOW line, into its bare red GEARS: JAMMED (x2 on the cab, capped 11%/jam, ~4.6 s, gold
ring + timer), then a told 3 s WARD and it knocks the points back. On the mid/high line the bit eats it; into your cart it is a crash.
Moves: P1 THE BORE (!! the line flashes, the bit lunges down it) + THE GRIND (!! a surge); P2 NEW: THE ROOF (shadows on two lines); P3 NEW: FULL BORE.
Theme 'greatdrill' composed in code (src/boss-music.js, E Phrygian machine; :p2 rubble, :p3 faster with saws).

## Numbers
- BOSS (tools/boss-rates.mjs minecart --ways=practiced --profile=human, campaign L11, 6 seeds a hero): knight 4/6, warden 4/6, pyro 1/6 = 50%, in band,
  no hero at 0. Fights 35-112 s (most 70-110). Setting: hp 1900 (bar ~2220), contact 40, bore 35, roof 27, ore cart 18, gaps 0.8/0.7/0.6.
- MASH (tools/mash-bot.mjs, stamped LEVEL then BOSS): level - every hero dies (lowest 0%, 2-4 deaths); THE GREAT DRILL 0/6.
- LEVEL-1 PILOT (stamped, after the final level edit): 33 blows taken, 7 deaths over 3 runs, walked 100%, 28 lifts (it walks; it cannot work the points).
- CART PILOT (tools/minecart-route.mjs, NEW): god + no foes = base inputs - ALL SEVEN heroes ride every leg; every boost gap measured (a cruising
  jump falls in, a boosted one clears). At campaign level L11 with foes: knight rode it all; warden and pyro each died once in the Goblin Line's exam.
- level-quality minecart: CLEARS (GATE += minecart).

## Checks run
minecart (new, in check.mjs), level-quality (all gated), checkpoint-gaps, one-new-foe, traps, collectables, deadends, spawns, killzones, goblin-lint,
corpses, boss-greed, audio-assets, boss-music, content-audit, dangling-paths, comments, homepaths, map-grammar, map-spacing; the cart pilot (probe,
base inputs, campaign level), boss-rates, mash-bot, level1-pilot.

## RED (mine)
- map-grammar / map-spacing: THE DEEP RAILS' spur node (214,96 on the crag sheet) is 28 px off its junction (wants 4-25) and its plate overlaps THE SKY ROAD / GALE MOOR. I searched every spot within 46 px of the Ore Road (both 'THE DEEP RAILS' and 'DEEP RAILS' as the plate) and NONE passes both tools: the crag sheet is full there. Needs a map-layout decision (rec: the coordinator/map lane nudges the crag sheet, or the spur hangs off the Ore Road -> Stormhold leg with a shorter plate).
- Greybox look: the far/mid backdrop is still the crag set (a dusk sky shows above the mine's roof in places) - the art pass gives the mine its own backdrop and kit.

## NOT RUN (shared PC)
The full suite; textfit; stuck (runtime); the page-level per-boss sweeps beyond boss-greed.

## QUESTIONS FOR DANIEL (recommendation first; the recommendation is what is built)
1. NO NEW FOE: tools/one-new-foe.mjs wants every level to bring one; your concept says riders are EXISTING types and no new enemy types. Rec: keep
   zero (built as a NEW_EXACTLY 'minecart: []' row, i.e. exactly none). Alt: a goblin cart-rider skin as a reskin.
2. STATIONS: the concept says ~1 per 200 route tiles; the house checkpoint rule wants 80-200 walked tiles apart. Built: six (~140 apart). Rec: keep.
3. THE REVERSE GEAR (not in the concept): LEFT held at a stop rolls the cart back slowly - it lets a player back out of a dead end or retry a missed
   lever without a crash. Rec: keep.
4. THE HUD counts all ten ore (content-audit wants the quest to count every stray); the smelter's lever wants 8 and says so. Rec: keep.
5. THE DRILL's greed: its cab is always hittable, so only a blow on its ward counts as greed (no reprisal for cutting the cab). Rec: keep.
6. THE MAP NODE (above): rec - a small crag-sheet re-layout in the map lane.
7. MUSIC: 'mineworks' ("At Work (Loop)", HorrorPen, CC-BY 3.0) as you chose; the drill's theme is composed in code until you pick a track.

---------------------------------------------------------------------------------------------------------------------------------------------------
# FIX PASS (2026-10-07, after scratch/review-minecart.md) - commits 3e9e88d6, 05ba5162, 92eaf802, 6bb786a7 + this report

## MUST-FIX status
1. MF1 TEACHING SIGNS AT SPEED - DONE. 23 TELLS (src/minecart.js tell(); L.mcTells; TELL_LINES routed to the hint box via src/hint-lines.js MC_TELL_LINES):
   crossing a tell's column puts its line (<= 5 words) in the hint box once a life, 2.2-5 s at cruise before what it tells, never over another (MC.tellGap 1.6 s;
   a station respawn inside a tell's window tells it again). The cart now WAITS 1.2 s at the start and at a station (RIGHT goes at once), so the first tell is
   read standing. Every first crusher / beam / gap / boost gap / rock / rider / caster / slow cart / points / deep gap / gate / smelter and the drill is told
   before it can hurt (tools/minecart.mjs asserts lead, spacing, word count, coverage). The posts stay as lore. The yard's beam moved 27 -> 38 so its tell
   follows the gap's.
2. MF2 THE RUNE LEADS THE CART - DONE. runeAt(x, v) = x + v * runeT; tools/minecart.mjs rides it (runeHits): cruise held = hit, full boost held = hit; boost
   from cruise, brake from cruise or boost, a jump as it bursts = dodge; laid for a slow cart that lets go = rides past. The cart pilot learned to BOOST past a
   rune (which also clears the gap the exam lays it on).
3. MF4 BOOST GAPS 8 WIDE + MARKED LIPS - DONE. BOOST_GAP 9 -> 8 (every landing moved one in; the cave-in's low-line landing three further so a cruising jump off
   the high line still falls in). Lips: a lantern pair + chevrons on the last sleepers, AMBER (a 27% fall) or RED + 'DEEP' (exam / chase: a real death), flashing
   as you near. The probe (minecart-route --probe) now also presses a boosted jump 8 px EARLY: on all six gaps cruise falls in, boosted clears (lands one tile
   past the far lip), 8 px early clears.
4. MF5 THE CAVE-IN FORK TOLD EARLIER - DONE. Tells at 498 ('LOW LINE FALLING: GO HIGH', ~4.6 s before the fall-in) and 518 ('SET THE POINTS, THEN BOOST'); a
   REQUIRED lever pulses while it is wrong (from ~300 px); the low line visibly CRUMBLES from 530 (cracked rail, rubble dropping, 'GOING').
5. LEVEL TEETH - DONE (v2). Fork A now defaults SET (the high line: a gap, then a BOOST gap at 232-239 - miss it and you drop onto the low line at its gate -
   bats IN both jump arcs, ore, an archer at the landing); its low line costs too (two crushers + the gate). DUCK x3: yard 38, goblin line 424 (under the pair's
   arrows; ducked, an arrow goes over too), exam 798 (low line, short of its gate, under the pair). Gap 668 is a REAL-DEATH exam (zone 663-677, told, a bat in
   the jump). Beam and gate 14 -> 18, crash 14 -> 16. The goblin line's upper rail ends at 438 (at 446 it dropped a rider ON the deep gap's lip: every hero
   died there).
6. THE GREAT DRILL - DONE, IN BAND (numbers below). P3 CHANGES THE ARENA (B5): the roof comes down on the HIGH line (its rail taken up, rubble on the floor,
   'THE ROOF TAKES THE HIGH LINE: TWO LINES LEFT'); the chute, the roof and the bore work on the two lines left; the rail is laid back when the fight is made
   or ends. B8 approach: bore SCARS in the rock from 862 (getting bigger), spoil on the line, from 925 the roof SHAKES and dusts on a quickening beat with a
   rumble, its HEADLIGHT flickers through the rock at the end of the bore, and the tell 'SOMETHING BORES TOWARD YOU'. Reverse gear: reverseAfter 0.35 -> 0.5 s.
   Map node: LEFT RED (map-grammar / map-spacing untouched) - for the map lane.

## Numbers (before -> after)
- THE GREAT DRILL (tools/boss-rates.mjs minecart --ways=practiced --profile=human = DRY, campaign L11, maxHp 154 / pyro 142):
  before: knight 4/6, warden 4/6, pyro 1/6 = 50%. The reviewer's recipe as given (jamCap .15, jamMul 2.5, contact 34, bore 31, gap 1.0) measured
  6/6 5/6 6/6 = 94%. WHY THE PYRO LOST (damage by source, measured): THE BORE - 102 of her 142 in 18 s; her flame's recovery ate the 1.0 s tell, so she was
  struck on a line she could not leave. Fix: the bore is told 1.25 s (P3 1.0), everything else heavier to hold the band.
  AFTER (10 seeds a hero): knight 7/10, warden 7/10, pyro 3/10 = 57% IN BAND, no hero at 0. Fights: knight 79-112 s, warden 59-89 s, pyro wins 125-138 s.
  Final: hp 2700 (never lowered), contact 42, bore 42 (tell 1.25 / P3 1.0), roof 34, grind 100 px, gaps 0.6/0.5/0.4, jam x2.5 capped 20% a jam.
  The lab's drill bot now stands where each hero's reach pays (cab.r + reach - 8; the warden keeps her tip rule).
- MASH (tools/mash-bot.mjs, LEVEL then BOSS, own rows): level - every hero dies (4 deaths each, lowest 0%); THE GREAT DRILL 0/6 (dead in 8 s).
- LEVEL-1 PILOT (re-stamped last): 29 hits, 5 deaths over 3 runs, walked 100% (was 33 / 7).
- CART PILOT, base inputs (god, no foes): all SEVEN heroes ride every leg.
- CART PILOT at TRUE campaign L11 (knight 154 / warden 154 / pyro 142 hp); damage per leg yard / switchbacks / goblin line / cave-in / works / exam / smelter:
  knight 0/0/70/28/14/0/0, 0 deaths; warden 0/0/59/28/28/14/0, 0 deaths; pyro 0/0/45/28/28/DIED (exam gap 813)/0.
  NB tools/minecart-route.mjs --lvl called BK.setHeroLevel, which does not exist: EVERY earlier "L11" ride (the greybox's and the reviewer's) was a LEVEL-1
  hero (100 hp). Fixed (BKT.setHeroLevel + applyUpgrades; it throws if missing). The pilot is a perfect-information floor (it reads crusher/gate phases
  exactly): the yard and switchbacks cost IT nothing; a human pays at the crushers, the gate, the high-line boost gap and the archer.

## Checks run (targeted; no full suite - shared PC)
minecart (185 checks, was 80), the probe, the base-input ride x7 heroes, the L11 ride x3, boss-rates (12 tuning runs), mash-bot level + boss, level1-pilot,
level-quality (MINECART clears), hint-shown, checkpoint-gaps, collectables, deadends, spawns, killzones, comments, ore-exam, one-new-foe, boss-greed, traps
(20, all pre-existing: skyroad 19, keep 1), content-audit (109, same as base).

## RED
- map-grammar / map-spacing: the Deep Rails' node (unchanged; for the map lane - those tools not weakened).
- NOT STAMPED: docs/level1-curve.json. A minecart curve row turns level-quality's curve gate RED: the curve places the Deep Rails in ACT 1 (THE GREENWOOD
  band, 40-250% / <= 3 deaths) and the WALKING level-1 knight (it cannot ride) lost 285% with 4 deaths. I left the row out (no gate weakened) - question 3.

## QUESTIONS FOR DANIEL (recommendation first; the recommendation is what is built)
1. THE DRILL's per-hero spread: pyro 3/10 vs knight / warden 7/10 (57% overall, no hero at 0; 3/10 is a hair under the brief's "pyro >= 2/6").
   Rec: to your playtest at these numbers (B9). No pyro-only lever built (hero-agnostic numbers only).
2. The reviewer's recipe (softer hits) measured 94%; I kept its intent (the pyro's early deaths) with a LONGER BORE TELL and made the rest heavier. Rec: keep.
3. The curve row: rec - the curve-gate owner gives side roads their campaign act (the Deep Rails by its L11 depth, not act 1) or a riding pilot; until then no
   minecart curve row.
4. Fork A now defaults to the HIGH (risky, ore) line; you throw the points to take the low line (two crushers, a gate). Rec: keep (the default is never free).
5. The cart waits 1.2 s at the start and at every station (RIGHT goes at once). Rec: keep.
6. (Greybox questions still open: no new foe, 6 stations, reverse gear, the ORE n/10 count, the drill's greed, the map node, music - recs unchanged.)

## ART PASS NEEDS (Sonnet lane)
- OWN MINE BACKDROP: far + mid layers of rock, timbering and old workings (replace far/mid 'crag' - the dusk sky still shows above the roof), a dark ceiling.
- THE SMELTER as a LANDMARK: a chimney glow visible from the cave-in on (a lit stack in the mid layer), sparks / heat haze, molten light on its line.
- THE BORE as a LANDMARK: the drill's tunnel mouth in the mid layer from the exam on; the greybox scars / spoil / headlight / rumble dust made into art.
- cnSkin GOBLIN-RIDER reskin for the archer / caster on carts (A9 identity foe; corpses in their own skin, tools/corpses.mjs), and real goblin carts.
- LIGHTS: lantern strings along the lines, the boost-gap lip lanterns (amber / red) as real lamps, lever lamps, the crusher warning lamp, lampGlow tuning.
- Tile kit: rails / sleepers / trestles / ore veins / timber props (no generic off-theme wood), the fall-in rubble, the crumbling low line, crushers, gates.
- THE GREAT DRILL: machine, bit, red GEARS (not the Winchmaster's drum language), the cab + goblin driver, P3's fallen high line.
- Music: 'mineworks' stays; 3 CC0/CC-BY picks for the drill theme still to list for Daniel.
