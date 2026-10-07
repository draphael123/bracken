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
