# THE UNDERWELL - brief (claude/underwell, Opus greybox, 2026-10-05)
Main road: caravan > welltown > **UNDERWELL** > redgorge > glasssea. The old cistern tunnels under the Well Town, dry since the Djinn's
well took the water. Scorpions nested in the dark; lamp oil seeps out of the old works. Torch-lit, dry, every sip precious.
Boss: THE CISTERN QUEEN (the benched code, src/cistern-queen.js) in her own cistern at the end.

## STRUCTURE (section by section - the order you play it)
Columns are tiles; the floor is around row 40; the level is ~470 columns + the Queen's hall.

| # | Section | cols | Beat | What you do |
|---|---------|------|------|-------------|
| 1 | THE DRY WELL | 0-45 | TEACH (light, then pour) | Start at the top of the dry well shaft; climb DOWN its ledges (no walk-right opener). At its foot a BROOD NEST seals the tunnel (eggs + chitin: blades turn off it). A wall TORCH hangs over an oil seep that runs under the nest: STRIKE THE TORCH - it falls, the oil catches, the fire runs along the seep and the nest burns away. Then a low tunnel with an OIL FIRE across it and a DRIP (one sip) in front of it: POUR. No foes watching. |
| 2 | THE BROOD HALL | 46-140 | TEST | A pillared cistern. A brood CHAMBER opens on the hall floor (four VENOM brood + a DUST scorpion). SET PIECE 1 - THE GREAT LAMP: an iron oil lamp hangs over the hall's oil channel on a chain; strike the chain and it crashes down, the whole channel burns, and the brood will not cross fire (they turn back; caught in it, they burn). A SPITTING scorpion on a pillar top. CHECKPOINT ONE at the spring (a real spring: a full skin) at the hall's far end. A nest plug (REQUIRED) closes the way on; its torch is up on a pillar ledge. |
| 3 | THE OIL WORKS | 141-250 | REMIX 1: the FIREBREAK | The old lamp-oil works: seeps run in branches. The only torch for the next nest lights a seep that ALSO runs under the DRIP you will need and under the ROPE LADDER up. Fire boils a drip dry and burns a rope to ash. POUR FIRST: wet oil does not burn - a sip on the branch is a firebreak; then light. (Burn the rope and the way up is the long climb round the back under two spitters - not a softlock.) OIL scorpions: their sting and their death leave a new OIL SLICK (it joins the seep it touches). FIRE scorpions: their burning patch lights any oil it touches - fight a fire scorpion on the oil and the floor catches under you. |
| 4 | THE SILTED SUMP | 251-350 | REMIX 2: fire drives the worms | The old sump, silted to sand: SANDWORM floors. SET PIECE 2 - THE BURNING GUTTER: the old oil gutter runs the length of the sump three rows over the sand; light it (its torch at the near end) and the fire runs the whole length over the worms' beds - THE HEAT DRIVES THEM UNDER while it burns (about 10 s). Cross the sand in that window. THIRSTY scorpions (drawn to your water skin from far off; a sting that lands drinks a sip) and a DUST scorpion (its tail flick throws grit: told, blinds the screen edges 2 s). CHECKPOINT TWO past the sump. A tap (the key) under the gutter's far end. |
| 5 | THE LAMP STAIR | 351-445 | EXAM (all of it, one space) | A climb up the old lamp stair to the Queen's door: one drip, one torch, a nest plug (required), an oil fire (required pour), a worm floor, a brood chamber and a spitter, all on one connected seep. Light without a firebreak and the drip boils dry - and you meet the oil fire empty. Read the oil, pour the break, light, burn the nest, keep the brood behind the fire, cross the worm floor while the heat holds, pour the oil fire. CHECKPOINT THREE at the Queen's door (a spring). |
| - | THE QUEEN'S CISTERN | 446-485 | BOSS | THE CISTERN QUEEN (benched code, placed as-is): P1 sand (pour on her burrow -> SOAKED), P2 she climbs through the lamp oil and BURNS (pour her wall -> she falls doused; she flares again), P3 the flood. Her STINGER is the weak spot after every sting; her shell turns everything else. Two springs in the hall. Then the road out east to THE RED GORGE. |

## THE RULE (one sentence, a verb)
**OIL SEEPS DOWN HERE: STRIKE A TORCH INTO IT AND IT BURNS - THE BROOD WILL NOT CROSS FIRE - AND ONLY YOUR WATER PUTS IT OUT.**
Verbs that change the state: LIGHT (strike a torch / the lamp's chain: the seep burns) and POUR (the skin: a fire goes out; oil poured before
it burns is WET and never catches - a firebreak). The state is DRAWN: oil = a black sheen with a rainbow glint; burning = flames running
cell to cell; wet = dark grey with drips; spent = burnt black. A lit seep burns FUEL s (~10 s) then is spent (the oil is gone: no relight).
Old oil fires (barricades) burn until poured. Fire boils a drip dry and burns rope.

## FOES (Daniel 10-05: scorpions + sandworms in ELEMENTS; four new variants approved)
No new AI: every one is a proven machine with a skin (cnSkin) and a twist tied to the rule. The sandworm's first appearance moves here
from the Red Gorge (it is the level's one new type on the gate chain; the gorge then brings the raptor only).
| Foe | AI | Role | Twist | Where |
|---|---|---|---|---|
| VENOM scorpion (brood) | scorpion | melee | stamina venom; WILL NOT CROSS FIRE | nest chambers (2, 5) |
| FIRE scorpion | scorpion | melee | its burning patch LIGHTS oil it touches | oil works (3), exam |
| OIL / TAR scorpion (new skin) | scorpion | melee/support | its sting + death leave an OIL SLICK that joins the seep | oil works (3) |
| DUST scorpion (new skin) | scorpion | melee | sting tell throws grit: BLINDS (screen edges dark 2 s, told) | brood hall (2), sump (4) |
| THIRSTY scorpion (new skin) | scorpion (runner) | runner | drawn to your water skin from far; a sting that lands drinks a sip | sump (4), exam |
| SPITTING scorpion (new skin) | SLINGER's AI | RANGED | lobs a venom glob (a stack of venom) | pillar tops (2), oil works (3), exam |
| SANDWORM | sandworm | heavy/ambush | THE HEAT DRIVES IT UNDER (the gorge's flood rule, fire here) | sump (4), exam |
| THE OLD STINGER (elite scorpion) | scorpion elite | elite | gate keeper before the sump | end of 3 |
No variant over ~35%; roles: melee, ranged, runner, heavy/elite.

## SHADE / LIGHT PLAN
Underground: no sun anywhere (the whole level is shade, as the Red Gorge). LIGHT is the look: torches + the burning oil light the dark
(greybox: tinted rooms, a warm glow round fire). Darkness is art, not a rule.

## CHECKPOINTS
Start; ONE at the brood hall's spring (~col 128); TWO past the sump (~col 345); THREE at the Queen's door (~col 440). Spacing >= 90 walked
route tiles, <= 200 (tools/level-quality.mjs checkSpacing). Each checkpoint has a spring (a full skin); between them only drips (one sip).

## THE SILVER VAULT (themed key)
Three BRASS TAPS (the old well-keeper's) lie in the tunnels (HUD: TAPS n/3). Fitted to THE DRY FOUNTAIN in the oil works, water runs: it
becomes a spring AND its vault opens (one SILVER). Two more silvers off the route (a pillar top in the hall; a nest pocket in the sump).

## MUSIC
Greybox placeholder: an existing cave track (Daniel picks a CC0/CC-BY track for the art pass). The Queen keeps her composed-in-code theme.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. Lit seeps burn ~10 s then are spent (no relight). Rec: keep (a window you made). Alt: burn until poured.
2. A burnt rope stays burnt until you die/respawn (the long way round exists). Rec: keep. Alt: it re-hangs after 20 s.
3. The sandworm's first appearance moves from the Red Gorge to the Underwell (one-new-foe on the gate chain). Rec: keep.
4. Music: which CC0/CC-BY cave track (the art lane lists 3 for your pick).

## AS BUILT (claude/underwell greybox, 2026-10-05) - what changed from the brief above, and why
- Oil timing: a lit FLOOR cell burns 6 s, a GUTTER cell (deep oil in a slot in the rock) 16 s - so the worms under the gutter stay down
  while you cross, and the floor you struck from clears first. Spent and wet oil seep back after 25 s; a struck torch's bracket has a flame
  again after 12 s (nothing is lost for good: no softlock). Burning oil: 13 a tick (0.5 s), unblockable, told ('THE OIL BURNS: GET OUT OF IT').
- A BLADE ON A BROOD NEST: the chitin turns it, the nest SPITS VENOM at you (8, unblockable, a venom stack) and SPILLS ITS BROOD (a venom
  scorpion every 0.6 s, four at most from one nest). Burn it - don't hack it. (Added so the mash bot loses the level.)
- The Underwell's OLD OIL FIRES scorch 14 a tick at their face (the Well Town's are 3): pour from a step away.
- Water: springs at checkpoints one and three, the dry fountain once fitted; drips (one sip a life) on the shaft, the shaft tunnel, the oil
  works, checkpoint two, the exam's start and before the exam's two oil fires.
- The exam's torch hangs by the drip: pour the oil between them first and the drip lives (and the wet stone is where you wait while the floor
  burns). The exam's brood room is oiled: the nest's fire runs in on the brood; a fire scorpion in it is at home in the fire.
- THE CISTERN QUEEN in her own level: hp 1400 (was 1000), every blow x1.43 (on the WEIGHT/HARNESSCARD heroes at the Underwell's depth, L31,
  she lost 12/12). Her composed theme is the Djinn's arena music now, so her hall plays the pool's 'boss3' (a question for Daniel).
- The sandworm's first appearance is the Underwell (it stands before the Red Gorge on the road): tools/one-new-foe.mjs NEW_EXACTLY.

## NOTES FOR THE READ-ONLY REVIEWER (vs THE MAGE'S FOLLY + scratch design-standard.md)
- Rule use: LIGHT is required at three nests (shaft, hall, exam); POUR is required at four old oil fires; the firebreak is the oil works'
  answer to keeping the rope (the back scaffolds are the long way if it burns); the brood fence and the worm heat are the remixes; the exam
  is one connected oil. Every route need glints and nudges (src/stuck-spots.js STUCK_HANDS.underwell; the hands drive it).
- Measured: tools/underwell.mjs (Node + page: every rule claim), tools/underwell-route.mjs (real keys: all 7 heroes walk the route on base
  movement; knight/warden/pyro at level 1 with every foe alive: 1 / 3 / 1 deaths, one leg lifted for the warden after 3 deaths in the oil
  works), level-1 pilot 35 blows / 3 deaths, mash bot loses the level (lowest 19/25/28%) and the boss (0/6), human bot 10/18 = 56%.
- Look hard at: the oil works for a level-1 hero (a fire scorpion beside the rope lights it; the careless hand dies there), whether the
  great lamp reads as a set piece in greybox art, and whether the exam is hard enough when the player is careful.

## NOTES FOR THE SONNET ART PASS
- Everything drawn is placeholder in src/redraw/underwell_art.js (the oil cells, flames, nests, torches, the great lamp, the fountain, the
  tap icon, the sand band, the gutter grate, the blindness overlay, a two-depth arched backdrop) and the four scorpion recolours. The tile
  kit is the desert's rock skin (rockZones) - the Underwell needs its own cut-stone cistern kit, pillars, arches and torch light.
- Keep the rule's pictures: oil = black with a rainbow sheen; burning = flames running cell to cell; wet = dark blue-grey with drips; spent =
  burnt black. A nest must read as a thing that burns (egg-sacs, papery), not as rock.
- Music: 'cave' is a stand-in for the level; 'boss3' for her hall. Daniel picks a CC0/CC-BY track (list three).
