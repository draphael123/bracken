# THE DEEP RAILS (`minecart`) + THE GREAT DRILL - OPUS GREYBOX BRIEF (claude/minecart, 2026-10-07)
Side road off THE ORE ROAD (`needs: 'oreroad'`, a map SPUR; Stormhold still needs the Ore Road). Sources, in order of authority:
.claude/briefs/the-minecart-concept.md (its DANIEL INTERVIEW 2026-10-07 section OVERRIDES its body), .claude/briefs/side-roads-concept-2026-10-01.md,
scratch/design-standard.md (A1-A12 with the amended A10, B1-B14), scratch/brief-levelsweep.md v2 (the middle-ground difficulty recipe),
scratch/common-1006-night.md (house rules). Every choice below is the RECOMMENDED option; open ones go to Daniel as questions, built as recommended.
Pipeline: this brief -> Opus greybox (level + cart engine + boss + cart pilot) -> read-only reviewer vs Mage's Folly -> fixes -> Sonnet art pass.

## THE RULE (one sentence, a verb, drawn - A1/A2/A3)
LEVELS rule line (asserted equal to the code header): "YOU RIDE THE WHOLE WAY. THROW THE POINTS TO PICK YOUR LINE; LEFT BRAKES, RIGHT BOOSTS."
- ALL CART, start to finish (Donkey Kong Country). The hero never walks: inside L.minecart the cart IS his movement. It cruises on its own;
  RIGHT held = BOOST (up to ~230 px/s), LEFT held = BRAKE (down to a stop), nothing held = cruise (~150 px/s). JUMP jumps the cart (gaps,
  foes, onto a parallel line - the lines are one-way rail), DOWN ducks into the tub (low beams), DOWN+JUMP drops through to the line below,
  attacks swing from the cart. Speed is the player's, never scripted.
- THE VERB THAT CHANGES THE RULE'S STATE (A2): THROW THE POINTS. A points LEVER stands beside the line before every fork: a blow (any
  attack) or UP as you pass throws it. Points OPEN = the line ahead drops you to the low line; points SET = you stay on the high line.
- DRAWN STATE (A3): every lever shows its setting (a big arrow on a disc: UP = HIGH LINE, DOWN = LOW LINE) and the fork itself draws the
  open points (a gap with a chute) or the set rail; a SPEEDOMETER on the HUD (needle + BRAKE/CRUISE/BOOST word); crushers, gates and
  rockfalls draw their state (gauge, dust, shadow) on the line where you are.

## THREE MECHANICS (each REQUIRED somewhere; the exam combines all three - A4)
1. SWITCH TRACKS: told forks with risk/reward (fast dangerous high line with ore vs slow safe low line), one HIDDEN branch (a lever up
   in the roof: jump-strike it to open a spur to a silver), and REQUIRED forks (the default line runs into a fall-in: a crash costs
   health and puts you back before the lever). Teach (the yard's fork, no risk) -> test (the switchbacks' risk/reward pair) -> remix
   (a fork thrown UNDER FIRE, and the cave-in's fork thrown at speed) -> exam.
2. SPEED (BRAKE / BOOST): CRUSHERS (stamp on a told cycle: brake to wait, or boost through the up-time), TIMED GATES (a portcullis with
   a gauge; shut = crash), FALLING ROCK (dust + a shadow on the rail ~1 s before it lands, triggered as you pass a mark), LONG GAPS
   (8-10 tiles: only a boosted jump clears them; a cruising jump falls in). Teach each once alone, then pairs, then the CRUSHER WORKS.
3. CART COMBAT: goblin ARCHERS and goblin CASTERS (EXISTING types: 'archer', 'gobmage') riding goblin carts on a parallel line (3 rows
   up or down). They keep pace with you. The archer draws (told '!' + bow flash ~0.7 s) and looses an arrow that carries his cart's
   speed; the caster lays a RUNE on YOUR rail ahead (told ring, bursts ~1.2 s later: jump it, brake short of it or boost past it).
   Answer: KNOCK THEM OFF (any blow that lands throws the rider off his cart - jump-cut up at a high one, plunge down at a low one) or
   JUMP INTO THEIR CART (land in it: the rider is thrown out and the cart is yours - you ride on along his line). A goblin cart parked or
   slow on YOUR line is a hazard (ride into it = a crash) and a platform (jump into it). Living goblins are ON-THEME (the Ore Road comes
   before the Goblin Queen; Daniel 10-07).
Also kept from the Ore Road kit: TIPPLERS on ledges over the line (their ore stream is told and lands where it lands - brake or boost),
the MINER crew (pick throwers on the line and on ledges), ore walls, lanterns, slopes (the line rises and falls on real slope tiles).

## THE DIFFICULTY (brief-levelsweep v2 middle ground, built in from the start)
- Measured at CAMPAIGN LEVEL (the side road's depth), target a first run = 1-2 deaths, each station reached under ~50% hp.
- FOES AT PLATFORMING MOMENTS (Shovel Knight): bats through jump arcs over gaps, archers covering the boost gaps, a brute standing on
  the rail past a blind crest (jump him or crash), runes laid on the lip of a gap.
- FEWER, WEIGHTIER FOES (Salt & Sanctuary): every rider a 1v1 threat with told windups; squads = an archer + a caster on two lines.
- SECTION-END EXAMS with REAL DEATHS: a fall in a gap inside an EXAM zone (L.mcExam) is a death (back to the station with a fresh
  cart); elsewhere a fall costs ~27% of max health and puts you back on the rail ~1.5 s behind where you left it (A10 amended; never untold).
- Stations: the game's checkpoint rule wins over the concept's "~1 per 200": >= 90 route tiles apart (level-quality) and <= 150
  (checkpoint-gaps). Station AFTER each exam, one before the chase start line (chase.js CHECKPOINT_GAP) and one before the arena.
- Death -> the last station, cart stopped, rolls off on its own.

## SECTIONS (columns; one line M = row 30 at the start; the route climbs and drops on slopes and trestles)
1. THE LOADING YARD (0-150) TEACH, cheap failure: first screen asks a JUMP (a short gap); a DUCK beam; THE BOOST GAP (sign at the lip);
   THE FIRST CRUSHER (brake); THE FIRST POINTS (required: the low line is fallen in - throw it to stay high). Miners, a bat.
2. THE SWITCHBACKS (150-300) TEST switch: fork A risk/reward (high: ore x2, gaps, an archer on a ledge / low: slow, a crusher);
   fork B the HIDDEN lever in the roof -> a spur to SILVER ONE; a falling-rock mark taught; tipplers over the low line.
3. THE GOBLIN LINE (300-450) TEACH/TEST cart combat: two parallel lines; an archer cart (teach: knock him off), a caster cart (runes),
   a slow goblin cart on your line (jump in), then the pair (archer high + caster low). Brute on the rail. Exam: a fork thrown under
   fire with real-death gap (exam zone).
4. THE CAVE-IN (450-600) SET PIECE with agency (chase.js, look 'rock', contact 'kill', autoscroll): the roof comes down behind you;
   two lines under falling rock (choose the line whose shadow is clear), a boost gap, a fork thrown at speed; the safe line is a
   station past the collapse. Ore on the dangerous line.
5. THE CRUSHER WORKS (600-750) REMIX speed: crusher runs on two lines, a timed gate with a gauge, a tippler over a boost gap, a goblin
   cart pacing you through the crushers. The high optional line pays SILVER TWO and ore.
6. THE EXAM (750-880): all three at once - throw the points under an archer + caster pair, pick the line through a crusher and a gate,
   boost a real-death gap with a rune on its lip, jump into a goblin cart to cross. Station after it.
7. THE SMELTER (880-930): a fork whose lever is LOCKED until you carry 8 ORE (the HUD says "ORE n/8 - THE SMELTER"); its spur pays
   SILVER THREE (no relic). Then THE BORE: the drill's tunnel (round bore walls, its rumble, fresh spoil) - the approach sets him up (B8).
8. THE GREAT DRILL (930+) boss arena.

COLLECTIBLES (A11): 10 ORE NUGGETS on the risky lines and high jumps (L.quest: n 8, item 'orenugget', HUD 'ORE n/8'); 8 opens THE
SMELTER's points. 3 SILVERS (hidden spur, the works' high line, the smelter). No relic. Declared in L.unlocks.
FOE ROSTER (A9, no new type): ARCHER rider (ranged), CASTER rider ('gobmage', ranged), TIPPLER (ranged, Ore Road), MINER (melee, Ore
Road), BRUTE (heavy, blocks the rail), SAPPER (runner: lights a bomb on the rail), BAT (flyer through jump arcs). Role mix >= 3, no type
over ~35%. ONE-NEW-FOE: zero new types.
IDENTITY: own tile kit later (art pass) - greybox draws rails, sleepers, trestles, crushers, levers, carts; landmark = the drill's bore
tunnel seen through the side galleries + the smelter's chimney glow; ambient = mine bed; LEVEL MUSIC 'mineworks' ("At Work (Loop)",
HorrorPen, CC-BY 3.0, already in audio/ and credited); boss theme composed in code ('greatdrill', src/boss-music.js).

## THE GREAT DRILL (B1-B14)
TYPE: a CONSTRUCT (B14): its body is ALWAYS HITTABLE at the CAB (its goblin driver, high on its front), for real damage from your cart
(no x0.05 chip waiting room - B13); its KEY is THE ROUTED LOADED ORE CART (B14 'throw it' family: you send the cart, you never ride it).
THE ARENA: THE BORE - a three-line tunnel (low / mid / high, one-way rail 3 rows apart), a TREADMILL: the arena stands still, the
tunnel's sleepers and walls scroll past at cruise; your cart's speed moves you against it (brake = drift back toward the drill, boost =
pull ahead). The drill fills the left of the screen and creeps after you; its contact hurts ~45 and throws you forward.
THE OPENING (B1: the level's verb): a TIPPLER CHUTE drops a LOADED ORE CART onto the high or mid line; it rolls back toward the drill.
POINTS in the arena (a lever between the lines, its arrow drawn) route it: SET to DROP, the ore cart falls to the LOW line, where the
drill's GEARS turn bare under its bit (drawn: three red cogs, "GEARS" under them) - it rides into them: JAMMED (gears smoke, the bit
stops, the cab's hatch blows: gold ring + timer, x2 on the cab, ~4.5 s), then a TOLD ~3 s WARD ("IT CLEARS ITS GEARS", plates up, every
blow CLANKS + 'WARDED' - B3/B10). An ore cart that reaches it on the mid/high line is ground up by the bit ("THE BIT EATS IT").
Different from the Winchmaster's drum: there you RIDE the load into the drum; here you never ride it - you throw the points and the
cart goes where the points send it, into GEARS on the low line, read by its own red-cog GEARS mark.
MOVES (every one told: sound + word + colour; one windup at a time; one NEW move per phase - B5):
- P1 (100-60%): THE BORE (!!: the bit swings to a line - that line flashes red with "BORE" ~1.0 s - and lunges down it: change line)
  and THE GRIND (it surges at you: the danger glow + "GRIND" - boost away). Openings: the ore cart via the points.
- P2 (60-30%): NEW: THE ROOF (it bores the roof: rock shadows on two lines, ~1.0 s - pick the clear one, or brake/boost off the shadow).
- P3 (30-0%): NEW: FULL BORE (!!: "FULL BORE" 1.2 s, then it charges - hold BOOST or be hit) - and its bore comes faster.
NUMBERS (B6): human bot 50-60% at campaign level, knight/warden/pyro each > 0, mash 0/6, fight ~90-150 s. Theme: synth 'greatdrill'.

## TESTING
- tools/minecart.mjs (static, in check.mjs): the rule line, sections, each mechanic placed + required (the fork that must be thrown, the
  boost gap wider than a cruising jump and narrower than a boosted one, a crusher on the main line), exam zones, stations spacing,
  10 ore + quest 8, 3 silvers, no relic, riders are existing types, the drill's arena + opening pieces.
- tools/minecart-route.mjs - THE CART PILOT (headless, real keys): rides the level for knight/warden/pyro (and the rest), god + no foes =
  base inputs: boosts gaps, brakes for crushers/gates/rocks, throws points, ducks beams; every hero must finish. Also a measured probe:
  a cruising jump falls in every boost gap, a boosted one clears it.
- tools/mash-bot.mjs LEVEL then BOSS (own rows only); tools/level1-pilot.mjs row; tools/level-quality.mjs (GATE += minecart);
  tools/boss-rates.mjs minecart --profile=human (campaign level) for the band.
