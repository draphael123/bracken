# THE BURNING VILLAGE — setup from Daniel's interview, 2026-09-20

To be built AFTER the new-level repair pass (docs/audit-new-levels-0920.md). This file is the agreed
setup, not a design document yet.

## Agreed in the interview

- **Placement**: in the first goblin set, **after THE STOCKADE** (before Sporewood). The goblins who broke
  out of the stockade have fired a **human village**. `needs: 'stockade'`.
- **Goal**: **rescue trapped folk** from burning buildings. A rescued count on the HUD and the level card.
- **Stakes**: villagers **cannot die** — fire only delays and traps them. Rescues are reward and pressure,
  never a permanent loss and never a fail state.
- **Fire**: **only the Pyromander's fires spread.** The rest of the village burns as authored set-dressing
  and hazard. The spreading fire is scripted along his path through the level, so the spread is a trail
  that marks where he has been and pushes the player forward.
- **New hazard**: **burning wreckage as the "enemy"** — collapsing beams, rolling flaming carts, backdraft
  bursts out of doors opened at the wrong moment. No new goblin enemy type was asked for.
- **Boss — THE PYROMANDER**: a **renegade human Pyromancer**, one of the order gone bad. He uses the
  **Pyromancer class's real kit at boss scale** — firedrop plunge, ember shots, the bellows cone, Vent —
  and runs **the same heat meter the class runs**. Overheating him is the opening: his heat bar is the
  fight's loop, so the player learns the class's own rules by fighting it.

## Added by Daniel after the interview, 2026-09-20

- **Burning goblin enemies**: goblins that are themselves alight - they burn while they fight, and what they touch
  or die on catches. (The fire rule above says only the Pyromander's fires spread, so these are the second source
  of spreading fire: his, and the ones his goblins carry.)
- **Wisp enemies that damage the player by touching them**: floating embers/spirits whose CONTACT is the attack,
  unlike almost everything else in the game (the game's one existing touch-attacker is the boo, and only while it
  is not covering its face - see the contact-damage list in main.js). These want a clear tell colour and a slow
  drift so they read as avoidable.

## Answered 2026-09-20, second round

1. **The square burns as he heats.** Patches of the village square catch as the Pyromander's heat bar climbs
   and clear again when he vents, so the one bar is both his damage and the floor the player has left. That
   makes overheating him a real trade: it is the opening, and it is also what takes the ground away.
2. **Normal boss rewards.** Coins, a silver and the level clear, like every other boss - no class gets a
   unique advantage out of this level.
3. **The villagers run for the gate themselves.** Cut them free and they go; the count rises immediately.
   No escort, which keeps the level moving forward with the fire behind it.
4. **No mini-boss.** The fire is the obstacle. The level earns its length from the rescues and the spread,
   not from a second fight.

## Original open questions (now answered above)

1. Does the arena catch fire as his heat climbs (shrinking safe footing), or is the square static?
2. Does defeating him give the Pyromancer class anything specific, or is it coins/skills like other bosses?
3. How many villagers, and do they follow you to safety or just run once freed?
4. Is there a mini-boss, as most levels have one?

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

**The same rule applies to THE POWDER DECK and the Freebooter** (see the-powder-deck-pitch.md).
