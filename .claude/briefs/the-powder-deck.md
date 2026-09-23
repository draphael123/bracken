# THE POWDER DECK — build brief (from the-powder-deck-pitch.md, written up 2026-09-22; decisions marked PROPOSED are Daniel's to change)

## In one line
An optional ship level fought BELOWDECKS - dark, vertical, shut - where the doors are opened with powder kegs you carry
past open flame, a POWDER MONKEY steals the keg out of your hands, and THE FREEBOOTER waits in the great cabin. Clearing it
sells the Freebooter (hero 'pirate') for ~800 coins beside his 10 silver; no consolation prize for owners.

## Placement (PROPOSED - pitch open question 1)
A prize ship at anchor off THE FLOTILLA, on the coast sheet beside its node: `{ id: 'powder', name: 'THE POWDER DECK',
needs: 'flotilla' }`, appended to LEVELS (map nodes count by index). Optional: gates nothing. Hero entry: `coinPrice: 800,
coinNeeds: 'powder'` on 'pirate' (the Pyromancer's 'burning' row is the pattern).

## The mechanic: POWDER OPENS THE DOORS
- KEGS come from ready-boxes and the magazine. Carrying one: no swing, walk x0.8, you can still jump; DOWN sets it down.
- OPEN FLAME sets a keg off (lanterns, the gun deck's slow match, braziers, fire already burning - including the boss's
  powder burns): a 1.5 s fuse (the keg hisses and flashes, red cross), then a 3-tile blast - it breaks BARRED DOORS
  ('powderdoor', barred from the far side: only a blast opens it) and hurts everything in it, you too (30).
- So the route WITH a keg is not the route without one: the lit lanes are the short way and the dark ones the safe way.
- 4 barred doors on the route. Each keg's walk from its box to its door is the level's puzzle, one per place.

## The places (belowdecks; about 380 columns, half of it vertical - you go DOWN to the magazine and back UP to the cabin)
1. THE HATCH (short): the weather deck at night, rain, the one open hatch; the first sign. Go below.
2. THE GUN DECK: the guns in a row, their SLOW MATCH burning beside each (flame every few tiles); the first ready-box and
   the first barred door. Teaches carry, no-swing and flame: the short lane runs past three lit matches.
3. THE BERTH DECK: HAMMOCKS as swaying platforms (swings) over the sleeping crew (some wake); dark lanes between lanterns;
   the POWDER MONKEYS arrive. Second door.
4. THE HOLD: cargo stacked to the beams (climb it), shallow bilge (never deadly), rats; the third door is at the bottom.
5. THE MAGAZINE (the orlop): NO lights allowed - the one place a keg is safe, and the one place too dark to see the monkeys
   coming (their eyes and a hand-lamp's small circle). The kegs' source; a chase back up.
6. THE GREAT CABIN: up the aft ladders to the stern, the fourth door blown into THE FREEBOOTER's cabin.
Landmarks: the gun deck's row of guns in the gunport light, the hammock forest, the cargo stacks, the magazine's copper
door, the cabin's stern windows.

## The unique enemy: THE POWDER MONKEY
A small, fast deck-boy who never fights. When you carry a keg he comes for it: a told snatch (`!`, 0.6 s: a raised shield
turns him away - you cannot swing, but you can block). If it lands he has the keg and runs for the nearest hatch or dark
lane; kill him and he drops it where he stands - which may be beside a lantern (fuse). Touching him costs nothing.

## Enemies (PROPOSED - pitch open question 2): the pirate crews, FEW, as ENCOUNTERS
Cutlass, boarder, bosun and marine belowdecks in groups of 3-5 round each place's verb (a bosun guarding a ready-box, marines
at the gun deck's far door), rats in the hold, monkeys wherever a keg is. Quiet between the groups; no even sprinkle
(Daniel, 2026-09-22). One ELITE: THE MASTER GUNNER at the gun deck's door.

## THE FREEBOOTER (boss) - the class's own economy, AMMUNITION
Belt of 3 barrels (4 in phase two), shown on him. Touch rule; every attack one clear answer.
- PISTOL (red cross): an unblockable ball; spends a barrel. Where it misses it leaves a POWDER BURN (floor fire, 4 s).
- GRAPESHOT (red cross): a close cone; spends a barrel whether it finds anything or not.
- CUTLASS RUN (`!`): the class's chain, three told blows a shield turns; the third can be parried.
- RUM (no mark): he drinks to mend (1.2 s, "RUM" over him); any blow cuts the swig short and he gets nothing.
- BROADSIDE (phase two, red cross): he fires the cabin's guns down the room: lanes of shot; cargo and pillars are cover.
- THE OPENING (player-made): bait his barrels out from behind cover until he is EMPTY - then he RELOADS (2.5 s, open,
  double). Unprovoked (he never fires), there is no reload (boss-openings.mjs: shots baited to empty -> reload open;
  standing off without baiting -> no open).
- Phase two (<50%): 4 barrels, the broadside, and his powder burns set off the kegs stacked in the cabin (the room gets
  worse), NOT faster tells.
Pilot >= 21 runs at normal health, 60-75%, with randomness in his choices.

## Rules
GARRISON row (thin) + no blanket calm, ELITES row, checkpoints (one per place), 3 silvers, dead ends paid, its OWN music
(a CC0 track, Daniel's go before download), signs <= 2 lines, `tools/powder-deck.mjs` in check.mjs, route-breaks clean.
Size: two sessions (the level + kegs + monkey; the Freebooter + the unlock). No deploy without Daniel.
