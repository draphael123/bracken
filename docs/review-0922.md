# BRACKEN — the whole game reviewed: levels, bosses, enemies (2026-09-22)

How this was made: every campaign level built and measured in Node (reach, size, vertical band, foes a screen, foe kinds,
mechanic props, special tiles, dressing per 100 columns, music, route breaks - `work/claude/review-levels.mjs`), every boss
and enemy measured from the code (health, told attacks and how many are red, where they appear - `review-foes.mjs`), and
read against the evidence already on file: the visual audit (docs/visual-audit.md), the sprite audit (sprite-quality-audit.md),
the combat feel probe (~3/4 of common fights end in one swing), the boss-openings proofs, the pilots, and Daniel's playtest
verdicts. Rankings are judgement on that evidence, scored on four things: IDENTITY (a verb or idea no other level/fight has),
SHAPE (does it vary - places, height, pace - or repeat), LOOK (the visual audit), and PLAYTEST (what Daniel said). No
browser play was possible while two build sessions run, so feel is taken from the probes and the notes, not fresh play.

## THE GAME-WIDE FINDINGS (they explain most of the rankings)
1. THE BEST LEVELS HAVE ONE VERB AND SEVERAL PLACES; the weakest repeat one stretch (Hurricane Deck, the first Witchlight
   Stair, the old Burial "walk right", Stormhold's streets). Fix: every level gets 4-6 named PLACES, each with a landmark.
2. ENEMIES ARE SPRINKLED, NOT ENCOUNTERED. GARRISON rows spread foes evenly to hit 3.5-4.5 a screen; it reads as a gauntlet.
   Fix: authored encounters of 3-5 round each place's verb, quiet between (now the rule for new levels).
3. COMMON FIGHTS END IN ONE SWING (the feel probe): fodder health x2.4 is being applied by the slopes session.
4. THE CRAG/CASTLE LOOK IS ONE LOOK: Scree, Hanging Village, Stormhold, Highcrown, the Undercrown share a sky, a gravel slab
   and no dressing. The art to fix it exists (crag_redress.js, redress2.js) and is being wired now.
5. 13 LEVELS HAVE NO MINI-BOSS (Daniel: "not every level has a mini boss"): wood, marsh, stockade, spore, scree, moor,
   storm, longwater, reef, flotilla, hurricane, underleaf, deep, burning, fallingtower.
6. ONLY 7 BOSSES HAVE A PLAYER-MADE OPENING PROVEN BY A TEST (boss-openings.mjs); many older ones have designed openings
   (winded, planted, pinned, caged) that no test proves are CAUSED. And only 4 bosses have ever been piloted at normal health
   (Mother Cap, Pyromander, Grave Warden, Hedge Warden, + the carpet fight): nobody knows the others' win rates.
7. BOSSES ESCALATE BY GETTING FASTER TO READ (the Quartermaster's 0.30 s phase-3 tell, the Captain's 0.32 s sabre): the
   house rule should be "phase two ADDS, it never shortens a tell below ~0.5 s".
8. 23 of 133 foes blend into their levels (dark bodies on dusk and cave sets): the contrast rim is being wired now.
9. SIGNATURE FOES ARE OVERUSED: the sprig in 11 levels, the shieldbearer in 10, the archer in 9 - the wood's goblins walk the
   coast and the castle.

---------------------------------------------------------------------------------------------------------------------------
## LEVELS - ranked (29 in the campaign + the new stair; Stormwreck Harbor is out of the campaign)
Tier S - the bar
| # | level | why | how to improve |
|---|---|---|---|
| 1 | KINGSWOOD | the fullest level: 22 foe kinds, a mini (the Great Hound) and a boss, looks good, a real journey | trim the density (5.6 a screen is the highest on a road level) into encounters; give the Great Hound told attacks (he has none) |
| 2 | THE HEXED FIELDS | the strongest identity: the dusk that fades, the tower on the horizon, hex vines, the Ploughman + the Scarecrow King's many openings | its road runs long and flat mid-level: one vertical beat (the windmill or the barn loft) would lift it |
| 3 | UNDERLEAF | the secret level with the most unusual fight (the Grandmother hears you), the assassin and berserker, looks good | its lower area was cut at Daniel's word; add one landmark room (the sleepers' hall) so it has a middle |
| 4 | THE LAMPLIT STREET | a real mechanic (lamps as territory), a mini + a boss, looks good; the last level feels last | 3 of its ropes pass through decks (clunky climbs); 3 capped/near-miss spots (route-breaks) |
| 5 | SPOREWOOD | bouncers, webs, shelves - verbs; the Mother Cap is now a fight (17/24) | 4.5 a screen; the spore rain reads samey across its length - two named places (the ring, the rot) |
Tier A - good, one thing each
| 6 | BRACKEN WOOD | the opener: clear, pretty, the honey pot | no mini; the Hornet Queen has only 2 told attacks - give her a third (the swarm call) |
| 7 | THE LONG WATER | looks good, the fisherfolk quest, the Herald | 3.2 a screen of the same shore; a vertical place (the lighthouse) |
| 8 | GALE MOOR | wind is the verb and it is used; looks good | its rope was cut (fixed today); reach covers 445 of 996 columns - the air rails carry the rest: check nothing is missed; no mini |
| 9 | MARSH WOOD | reeds, planks, the eel trap; looks good | no mini; the Bullfrog King has no red attack - a tongue-grab he commits to |
| 10 | THE REEF | breath and air bells - a real verb | Daniel on the underwater levels: more variety and more air; one landmark wreck to enter |
| 11 | THE BURNING VILLAGE | new, a strong mechanic (the spread, the villagers), the barn | no mini; the Pyromander's median win is short (76 s): he could take a phase two |
| 12 | THE STOCKADE | looks good, the Chieftain is solid | thin (2.3 a screen, 14 kinds): encounters at its gates; no mini |
| 13 | WAYMEET | a town, looks good, the Serjeant + the Paladin | thin (2.3 a screen, 8 kinds - the fewest); the Paladin -> THE CRUSADER rename is due with the Lit Church |
| 14 | THE DROWNED CAUSEWAY | the Kraken is a set piece; rain and props save the grey | a landmark mid-level (the chapel on the causeway); the Tide Marauder mini is thin (2 attacks) |
Tier B - works, but repeats or looks plain
| 15 | THE MONASTERY (Sunspire) | a 197-row climb, the Roc and the Temple Guardian | washed-out white-on-white (the art is redrawn, being wired); its ambush was unbeatable once - re-check |
| 16 | THE HANGING VILLAGE | a vertical village, the Weaver + the Owl Reeve | the crag trio's sky and slab (redress being wired); the Weaver mini (180 hp) has only her four `!` attacks - give her a red one (webs across the lane) |
| 17 | THE MAGE'S FOLLY | the richest puzzle tower (runes, weights, glyph flips, books) | bookcase wallpaper (redrawn, being wired); the reading room ambush + homunculus are good - keep |
| 18 | THE FALLING TOWER | the carpet fight is unique; floors fall | the purple-screen bug (being fixed); the longer tower (Reading Room, Pendulum Gallery) is ready to wire |
| 19 | THE UNDERWATER KEEP | the siphon galleries | the barest level in the game (0.3 decorations per 100 columns): the sunken-castle dressing, the sluice wheels, the trident king - all briefed |
| 20 | THE DEEP | a 178-row descent | "needs a ton more air patches and variety"; the Diving Bell -> the Giant Crab (briefed) |
| 21 | THE BURIAL CAVERNS | reworked to go down (galleries, the ossuary, the candles) | not yet replayed by Daniel since; the candle-shelf wallpaper; 1,140 columns is the longest - cut a third |
Tier C - needs real work (all briefed or queued)
| 22 | STORMHOLD | the bridge fight is good | a street and a half before it; the Curtain Wall + two Lance attacks (briefed, greybox ready) |
| 23 | THE SCREE PATH | a climb with crystal | 2.7 a screen, the crag look, no mini, the Ram Lord is fine; it needs one set piece (a rockslide chase down the path) |
| 24 | THE FLOTILLA | four hulls | the shortest (400) and thinnest (2.2 a screen); the rigging + a slower Quartermaster (briefed) |
| 25 | THE HURRICANE DECK | the wash is a good idea | "very repetitive"; places, the heel, the eye, the fallen mast; the Captain's platforms (briefed) |
| 26 | THE UNDERCROWN | the Buried Prince | flat brown dark (redrawn, being wired); needs a place with light in it (the prince's tomb lit by his lamps) |
| 27 | HIGHCROWN | the biggest castle, the Forgemaster (the best mini) | "a castle with no castle in it" (redrawn, being wired); 940 wide - it needs rooms: a throne room, kitchens, the walls |
| 28 | THE WITCHLIGHT STAIR | the loose-magic verbs | rejected by Daniel: the redesign + Gargoyle is being built now |

---------------------------------------------------------------------------------------------------------------------------
## BOSSES - ranked (27 bosses + 14 minis)
Scored on: attacks that each have ONE answer (told `!` / red), a player-made OPENING, phases that ADD, a set piece, pilots.
| # | boss (level) | why | how to improve |
|---|---|---|---|
| 1 | THE GRANDMOTHER (Underleaf) | a fight about SOUND: she hears, you choose to be silent | pilot her; prove the listen-and-rap opening is caused (a test) |
| 2 | THE KRAKEN (Causeway) | a set piece: arms, cargo you throw, a breathing opening, 12 attacks | 9 of 12 attacks are red: too few you can block - make the arm sweeps `!` |
| 3 | THE GOBLIN QUEEN (Highcrown) | pinned/dazed openings, rods, 11 attacks | 7 red of 11: same note; she needs her hall (the Highcrown redress) |
| 4 | THE SCARECROW KING (Fields) | three openings the player makes (the pole, the trough, the lantern) | pilot him; his 2 unmarked windups need marks or cutting |
| 5 | THE ARCHMAGE (Folly) | three stages, the room rewritten | 3 unmarked windups; pilot |
| 6 | THE UNDEAD ARCHMAGE (Falling Tower) | the carpet sky fight, a proven opening, pilot 17/24 | fine; the purple-screen bug is the only fault |
| 7 | THE TOLLMASTER (Lamplit) | darkness and the lamps | pilot; the lamp mechanic could open him (a lamp relit under him) |
| 8 | THE OWL REEVE (Hanging) | the lamp crash (x2 since yesterday), pinned under the bough | 1,450 hp is the most in the game: check the fight's length (target 90-150 s) |
| 9 | THE PYROMANDER (Burning) | the class's own heat, a proven opening, pilot 14/24 | median win 76 s - add a phase two (the square's whole fire) |
| 10 | THE QUEEN'S LANCE (Stormhold) | charges on the bridge, many moves | two more attacks (the Hook, the Bolt - briefed); pilot first |
| 11 | THE MOTHER CAP (Sporewood) | made harder, pilot 17/24 | fine |
| 12 | THE TIDE HERALD (Long Water) | 7 attacks, the wave | pilot; one unmarked windup |
| 13 | THE RAM LORD (Scree) | charges and walls | pilot; his level needs a set piece more than he does |
| 14 | THE ROC (Monastery) | a sky boss with dives | 1,100 hp: check the length; pilot |
| 15 | THE BURIED PRINCE (Undercrown) | the tomb multipliers (buried, bareheaded, in the light) | only 4 told attacks for 960 hp - one more; his room needs light |
| 16 | THE BURIED DEAD (Burial) | a proven opening (slam on broken ground), 1,000 hp | 2 unmarked windups; pilot |
| 17 | THE PALADIN / CRUSADER (Waymeet) | ward and oath | pilot; renamed THE CRUSADER when the Lit Church lands |
| 18 | THE DROWNED KING (Keep) | a swimming king | "too hard" - slower, longer staggers, the trident (briefed) |
| 19 | GOBLIN CHIEFTAIN (Stockade) | planted = double | pilot; a phase two (the stockade's gates) |
| 20 | THE QUARTERMASTER (Flotilla) | leaps between decks, cuts the ship | too fast: 0.30 s phase-3 tells (briefed: slower) |
| 21 | THE CAPTAIN (Hurricane) | keg, hook, pistol | no platforms to dodge his shots; one berserk attack (briefed) |
| 22 | THE REEFMAW (Reef) | 4 attacks | none red, no opening that is caused: give him one (a bite into a wreck that jams) |
| 23 | THE WINDCALLER (Moor) | stones and wind | 170 hp - over too fast; the stones opening is good; pilot |
| 24 | BULLFROG KING (Marsh) | the tongue | 3 attacks, no red, 280 hp: a second phase (the pond floods) |
| 25 | HORNET QUEEN (Wood) | the first boss, winded = double | 2 attacks: add the swarm call (it is the first boss - keep it simple, but not bare) |
| 26 | KING GORM (Kingswood) | caged is the opening | all 6 attacks red, none blockable - teach the shield: give him one `!` |
| 27 | THE DIVING BELL (Deep) | - | "barely any attacks": the Giant Crab (briefed) |
MINIS
| 1 | THE FORGEMASTER (Highcrown) | 12 attacks, carts hurled, the best mini | 9 red: one more blockable |
| 2 | THE GRAVE WARDEN (Burial) | proven opening, pilot 19/24 | the pyromancer 0/4 - check her kit against him |
| 3 | THE HEDGE WARDEN (Witchlight) | regrowing stump, brazier opening, pilot 18/24 | the Warden hero 0/4 |
| 4 | THE HOMUNCULUS (Folly) | pants = open | pilot |
| 5 | THE LAMPREEVE (Lamplit) | snuffs lamps | no red attack; fine as a mini |
| 6 | THE HEADLESS PLOUGHMAN (Fields) | the plough and his head | fine |
| 7 | THE VAULT KEEPER / BELLGUARD (Keep) | the bell opening (proven) | fine |
| 8 | THE TEMPLE GUARDIAN (Monastery) | the golem | no bestiary name ('golem' has none) - give him his card |
| 9 | THE SERJEANT (Waymeet) | mounted/unhorsed | fine |
| 10 | THE TIDE MARAUDER (Causeway) | 2 attacks, 110 hp | thin: a third attack and 180 hp |
| 11 | THE BOSUN (Harbor, out of campaign) | - | moves with Harbor if it returns |
| 12 | THE GREAT HOUND (Kingswood) | - | NO told attacks at all: give him a told pounce and a howl |
| 13 | THE BOUGH SPIDER / WEAVER (Hanging) | a big spider (180 hp), four `!` attacks | nothing red and no opening: webs across the lane (red) and a told drop she can be cut out of |
Also: the Gate Gargoyle, the Standard-Bearer, the First Death Knight, the Gate Serjeant are designed and waiting (sprites
drawn for three). 13 levels still want a mini - the cheapest adds: Bracken Wood (a Hive Guard), Marsh (the Old Heron), the
Stockade (the Gatekeeper), the Long Water (the Net Captain), the Flotilla (the Master Gunner), Gale Moor (the Kite Chief).

---------------------------------------------------------------------------------------------------------------------------
## ENEMIES - ranked (102 in the campaign)
Scored on: a verb of its own, told attacks with one answer each, how it combines with its level, how often it is reused.
Tier S - they make fights (keep, reuse deliberately)
assassin (whisper, lunge, parry the thrust) · berserker (runs straight, trip him) · hedgeknight (the feint) · swornsword
(6 told blows) · crossbow + runner (a real pair) · gobpriest (blesses the pack - kill first) · snuffer (puts out your
light) · burngob (lights the ground it walks) · husk (the belly bursts - kill at range) · mimic · troll · heavy knight.
Improve: use them MORE - most appear in 1-3 levels; the assassin and berserker only in Underleaf.
Tier A - good, one note each
eel, crab, tideguard, netter, urchin, angler, sailor, turtle, siren, puffer, jelly, petrel (the sea families: 5-6 told
attacks each - strong, but they fill 7-9 levels each, so the coast blurs: give each coastal level ONE sea family as its own);
brute (+ the Goblin Captain elite), pike, watch (the haft), bonecorsair, lanternshade, bonegob (skull throw), zombie (grab),
gobmage, stormshaman, merrow trio, scarecrow + rook, farmhand, pumpkin lurker, topiary, armour, broom, imp, turret,
emberwisp, soldier, javelin, lancer riders, drunk, propman, prise/holdfast/clinger (the Undercrown's), sweep, sapper.
Improve: most are fine; the reused ones need level-specific variants (a coat, a weapon, a behaviour) rather than more copies.
Tier B - one-note (a body with a hit)
sprig, shieldbearer, archer (the signature three - in 9-11 levels each: give each region its own trio: the wood's goblins,
the crag's mountain goblins, the coast's pirates, the castle's guards), rockgoblin, thorn, goat, harpy, hare, badger, gar,
grub, miner, hearthgob, cutter, sentry, wasp, marshlight, fledgling, shardling, seawitch, sailer, kite, merrowcaller, feeler,
spitcap, weaver, sporeling, lurker, manta, lamprey, apprentice, bonearcher, boo, haunt.
Improve: each gets ONE told thing it does that nothing else does (the shardling shatters into pieces; the miner's pick
cracks the floor under you; the goat charges you off ledges; the manta drags you down). Several have NO told attack at all.
Tier C - filler (no tells, tiny, or both): fix or cut
bat (8 hp, no tell), crow (6 hp, no tell), hound (no tell), sapper (no tell), sentry (no tell), wight (12 hp, no tell),
spit (no tell), thief (no tell - should steal coins!), hopper, lurker, kite, sporeling, sweep, clinger, holdfast, boo,
husk-less undead (apprentice, bonearcher have no marked windup).
Improve: every creature with a hit gets a told windup (the house rule is `!` or red for every blow); the thief steals from
your coin count and runs (the Powder Monkey's idea, cheaper); the hound circles and pounces (told); fliers (bat, crow) get a
told swoop and 2x health so they are not confetti; the wight is the Peat Wight - give it the bog's grab.
General: fodder health x2.4 (being applied) so fights last past one swing; the contrast rim (being applied) for the 23 that
blend in; the creatures whose bestiary card has no name (three of the cutter, bone archer, Temple Guardian, the Lance) get one.

---------------------------------------------------------------------------------------------------------------------------
## WHAT TO DO, in order of value per session
1. Finish what is in flight: the slopes integration (art, rims, fodder x2.4), the Witchlight redesign + Gargoyle.
2. A PILOT FOR EVERY BOSS (one Node/page tool that runs bossLab at normal health for all of them, 24 fights each, staggered
   so it never runs beside a suite): the only way to know which are too easy or too hard. Cheap, and it reranks this list.
3. The queued reworks (Stormhold, Flotilla, Hurricane, Drowned King, Giant Crab) - all briefed.
4. A TELL PASS: every foe with a hit gets a told windup (Tier C first); the Kraken, Goblin Queen, King Gorm and Forgemaster
   each get one blockable attack; the Great Hound gets told attacks and the Weaver a red one and an opening.
5. REGIONAL ROSTERS: stop the wood's sprig/shield/archer walking the coast and the castle - each region its own trio.
6. MINIS for the six cheapest levels listed above.
7. PLACES for the Tier B/C levels that are not already briefed (Scree, the Undercrown, Highcrown, Burial's length).
