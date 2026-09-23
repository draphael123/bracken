# THE POWDER DECK — optional ship level, the Freebooter as its boss

Daniel, 2026-09-20: an optional ship level with the pirate playable character as the boss, going between
decks and unlocking doors to advance, feeling different from the other ship levels, with one unique enemy.
Mechanic and reward chosen from the options below.

## Why it is not a fourth deck level

Every ship level the game has is above deck, outdoors, horizontal and weather-driven, and each already owns
its idea: THE SHIPWRECK REEF owns breath and the air bells; THE FLOTILLA owns crossing four hulls over the
top of them; THE HURRICANE DECK owns the rigging and the wash from windward; STORMWRECK HARBOR owns the
approach from the shore. The Quartermaster's fight already owns climbing a ship's decks in the open.

So this one goes the other way: **belowdecks**. Interior, dark, vertical, and shut. Orlop, hold, gun deck,
berth deck, the great cabin, with daylight only through the gratings. No wind, no rigging, no tide.

## The mechanic: powder opens the doors (agreed)

The doors below are barred from the far side. They are opened with **kegs carried up from the magazine**:

- Carrying a keg, the hero **cannot swing** - the carry pattern the Underwater Keep's ballast already proves.
- **Open flame sets it off**: lanterns, braziers, the gun deck's slow match, and anything already burning.
  So the route with a keg is not the route without one.
- Place it at the door, get clear, and the door goes. The blast is the level's loud moment, and it is one
  the player sets up rather than one that happens to them.

That gives the level a shape the others do not have: fetch, route, place, retreat - in a wooden box full of
fire, where the danger is what you are carrying.

## The unique enemy: THE POWDER MONKEY

A small, fast deck-boy that does not fight: it **steals the keg you are carrying and runs with it** down the
nearest hatch. Theft is a verb nothing else in this game has, it attacks the level's core mechanic directly
rather than the hero's health, and it turns tight interiors into chases. Kill it and it drops the keg where
it stands - which may be next to a lantern.

(Considered and set aside: a cooper rolling barrels down the companionways, and bilge rats that swarm in the
dark. Either could be a second, ordinary enemy later; neither has a verb of its own the way theft does.)

## The boss: the Freebooter's own kit, and his reload is the opening

He fights with the class's real economy, the way the Pyromander will fight with the Pyromancer's heat - but
the two must not share a loop, so his is **ammunition, not heat**:

- **The pistol**: limited barrels, unblockable balls, and a visible reload.
- **Grapeshot** up close: a cone that is spent whether or not it finds anything.
- **Broadside** straight down the deck: the arena-wide attack. The guns, the cargo and the pillars are cover,
  so the answer is to break the line rather than to out-heal it.
- **Powder Burn**: where his ball misses, it leaves fire - which is also what sets off a keg.
- **Rum**: he drinks to mend, and the drink can be interrupted.

**The loop the player drives**: bait his barrels out from behind cover until he is empty, and punish the
reload; and cut the rum swig short or he takes the health back. The fight teaches the Freebooter's economy
by making you exploit it.

## Open questions

1. Where does the ship sit on the map, and what unlocks it - a wreck reachable from the Flotilla, or a
   sail-away from Stormwreck Harbor?
2. Does the level want the game's existing pirate crews (cutlass, boarder, marine, bosun) belowdecks, or
   its own smaller roster so the powder and the dark carry it?

## The reward rule (Daniel, 2026-09-20) — CLEARING THE LEVEL OPENS A COIN PURCHASE

Beating the mirror boss does **not** hand the hero over, and it needs **no consolation prize** for players
who already own him. What it does is open a **second way to pay**: the class becomes buyable **with coins**
in the store, where before it could only be had for **10 silver** (every hero is `price: 10, silver: true`).

- Silvers run three to a level, so ten of them is a long campaign's saving. Coins are the common currency:
  a level carries a few hundred (Burial 522, Harbor 373, Kingswood 262).
- A coin price of about **800** therefore reads as two or three levels' takings - a real alternative route
  to the hero, not a shortcut around the economy, and not a grind either.
- A player who already owns the class simply has no use for the unlock, and that is fine: the level's own
  coins, silver and clear are the rest of the reward, exactly like every other level.
- The store keeps selling the hero for silver either way, so the optional level is never the ONLY route.

Implementation: a `coinPrice` on the hero's store entry, enabled by that level's `PROG[id].cleared`, with the
store row showing both prices once it is open ("10 SILVER  ·  800 COINS").

**The same rule applies to THE BURNING VILLAGE and the Pyromancer** (see burning-village-pitch.md).
