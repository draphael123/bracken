# THE RIVAL AND THE ROAD - BRIEF (draft for Daniel, 2026-11-11; nothing built)

Daniel 11-11: a rival who appears on the world map once per world, with a duel in an arena based on that world; plus other map events that reuse content. "All of these sound great."
Inspired by a recurring-rival structure; an ORIGINAL character, name, look and moves.

## WHAT EXISTS ALREADY (checked on master 7699a5ffb)
| Need | Already in the game |
|---|---|
| A hero kit fighting a hero | `src/pvp-duel.js`: every seat gets a proxy so any hero's blow lands on another hero through damagePlayer (guard, parry, roll, ward all answer it). Behind PVP_SHIPS. |
| A computer playing a hero kit | Duel BOT seats with a skill per bot (`src/duel-roster.js`); `src/ai-companion.js` plays any unlocked hero at your level. |
| A small arena with no new art | `src/duel-pit.js` (26 x 20 ring from THE ARENA SET, `src/redraw/arena_*`). |
| Small fights per level | `src/ambush.js`: ambush rooms with a captain, budgets per level. |
| Boss rematches | Boss rush code is PARKED and hidden (main.js, lives.js, xp.js); do not extend it without Daniel. |
| Map tokens | Hero token, store hut, landmark critters at map pixel scale (`src/map-dots.js`). |
| Worlds | `src/foe-react.js` ACTS: 1 THE GREENWOOD, 2 THE CRAGS, 3 THE SEA, 4 THE OLD KINGDOM, 5 THE DESERT; reserved with no levels: 6 THE FROZEN REACH, 7 THE FIRE MOUNTAIN, 8 THE DEMON HOLD. |
| A rival | None. No rival-like character exists. |

So the rival is mostly wiring: a bot seat from the duel mode, standing in a world-dressed pit, opened from a map token.

## 1. THE RIVAL (working name: THE OTHER KNIGHT)
A knight in his own colours walking the same road. Each world he has taken up a different weapon: he fights with a different HERO'S KIT each time, and keeps one move from every earlier meeting.

| World | His kit | What the duel is about | Arena (world's tiles + one hazard) | He keeps from before |
|---|---|---|---|---|
| 1 THE GREENWOOD | knight: sword and shield | the basics of a duel: block, riposte, the run of three | a forest clearing; no hazard (the lesson) | - |
| 2 THE CRAGS | warden: spear | reach, and getting inside it | a crag shelf; Gale Moor's told gusts | the riposte |
| 3 THE SEA | pirate: pistol and the run of five | closing distance, reading the shot | a deck that rolls (Hurricane Deck's roll) | the spear's long poke |
| 4 THE OLD KINGDOM | reaper: scythe | spacing against sweeps; he pays back what he takes | a lamplit yard; the lamps go out in beats | the pistol |
| 5 THE DESERT | pyro: fire | ground denial; fight on what is not burning | a sun court; hot sand outside the shade | the scythe sweep |
| later acts | one remaining kit each | - | - | - |
| Last meeting | ALL of them, switching mid-fight on a told flourish | everything he has shown you | a plain ring, no hazard: only him | - |

**Why hero kits:** every move, frame and sound exists; each duel is a different fight, not the same boss with more health; and it shows the player what the other heroes do.

**Rules of a duel (rec, all open):**
- Optional. His token stands on the map at a fixed node per world once that world's first boss is down. Walk onto it to accept.
- Non-lethal: no death cost (`openYard`), best of three falls. He wagers gold: win and take it; lose and he takes yours and stays.
- No flasks on either side (a duel, not a boss; this keeps it out of the flask-tuned boss bands).
- He plays at the player's level with the default trait pair for that kit; his skill is the duel bot's, raised a step per world.
- Every move told, as everywhere. He is never invulnerable.
- Reward per win: his colours as a weapon skin tier, and each win is a FEAT for the new charms (CHARMS4). Beating all five: a charm of his own.
- He speaks one line before and after (win and loss differ), and the line remembers the last result.

## 2. BOUNTIES (reuse every boss)
A posted notice at a map node: a boss or mini-boss from a level you have CLEARED returns with ONE twist (two at once; in the dark; no flasks; half the floor; a time limit). One live per world, changes after it is claimed. Pays silver or a charm feat. First check whether the parked boss-rush code can serve this before writing new arena entry code.

## 3. RIVAL RACES (reuse levels + the medal clock)
On a cleared level's node the rival sometimes leaves a time: beat it. Reuses the level and the medal clock; his "run" is a stored time, not a simulated runner (a ghost is a later nice-to-have). Gives him a second way to appear with no new arena.

## 4. ROAD AMBUSHES (reuse ambush rooms)
Walking between two nodes can drop you into a one-screen fight drawn from that world's ambush tables (`src/ambush.js`), captain rule kept. Short (15-35 s), told on the map first (a banner on the road), skippable by taking the long way where the map has one. Rec: rare, and never on the way to a level you have not cleared (do not tax progress).

## 5. THE TRAVELLING MERCHANT (reuse the store)
A cart token that moves one node after each level clear. Sells one charm you could already buy at a discount, or one of its own. Uses the store's screens and lock rules.

## ONE SYSTEM UNDER ALL FIVE
A MAP EVENT: `{ id, world, node, kind, state, opens, reward }` drawn as a token at map pixel scale, saved per account, with one entry rule and one "seen/claimed" rule. Build it once for the rival; bounties, races, ambushes and the merchant are rows.

## BUILD ORDER (after the demo; each behind its own flag, off)
1. MAPEVENT: the token + save + entry system, with ONE rival duel (world 1, knight kit) in a forest-dressed pit. Daniel plays it.
2. RIVAL 2-5: the other four kits, hazards, lines, rewards; the last meeting.
3. BOUNTIES, then RACES (small), then AMBUSHES, then the MERCHANT.

## RISKS AND OPEN QUESTIONS (rec first)
1. PvP duel is BETA and behind PVP_SHIPS. Rec: the rival uses its hit routing but not its menus; check how solid the proxy routing is with ONE human seat and one bot.
2. Is the duel bot good enough to feel like a rival and not a mash target? Rec: lane 1 measures it against a human-profile lab bot and against Daniel before anything else is built.
3. Flasks off in duels. Rec yes.
4. He needs a face and a name. Rec: Daniel names him; art = the knight's frames in new colours per kit (weapon skins already recolour heads).
5. Paladin, geomancer, berserker, ranger kits are unused in worlds 1-5. Rec: hold them for acts 6-8.
6. Hazards in the pit: each must be told and must affect him too, or it is just a handicap on the player.
7. Save shape: map events are per ACCOUNT, not per hero. Rec yes (like the shared traits).
8. Road ambushes can annoy. Rec: rare, told, never on unexplored road; cut first if playtest says so.
