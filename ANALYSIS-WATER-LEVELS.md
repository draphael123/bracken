# The four water levels: what they are, and how to make them better

THE LONG WATER (11), THE SHIPWRECK REEF (12), THE FLOTILLA (13), THE HURRICANE DECK (14). Measured with
`tools/quality.mjs` and read by hand.

| | length | foes/100 | kinds | coins/100 | signs | deco/100 | checks | worst gap |
|---|---|---|---|---|---|---|---|---|
| Bracken Wood (1) | 450 | 9.8 | 5 | 40 | 8 | 5.3 | 9 | 82 |
| Sporewood (4) | 552 | 9.2 | 6 | 37 | 13 | 7.1 | 9 | 86 |
| Kingswood (5) | 528 | **12.1** | **11** | 47 | 12 | 7.4 | 9 | 118 |
| **The Long Water** | 482 | 6.6 | 7 | **29.7** | 14 | 7.1 | 8 | 100 |
| **The Reef** | 460 | **6.5** | 6 | 50 | 11 | 9.6 | 8 | 91 |
| **The Flotilla** | 400 | 7.5 | **5** | 42 | 11 | **20.5** | 8 | 96 |
| **The Hurricane Deck** | 760 | 7.6 | 8 | 37 | 14 | 8.6 | 12 | 106 |

## The one real pattern: the sea arc is emptier than the forest arc

Every water level sits at 6.5–7.6 foes per hundred columns. The forest levels sit at 9–12. The sea arc is
**a third less populated than the game's own first act**, and by level 11 the player is much stronger. Some of
that is deliberate — water is slow, and a crowd in water is unfair — but not all of it. Concretely:

- **The Long Water** has 6.6 foes/100 and 30 coins/100: the thinnest of all fourteen levels on both counts.
  Its ferry run in particular is a long ride with very little on it.
- **The Reef** has the same problem underwater: 10 urchins are half its bestiary, and urchins do not move.
- The fix is not "add more foes" everywhere. It is **more foes on the dry parts** (where fighting is fair) and
  **more pressure, not more bodies, in the water** (see below).

## Each level's biggest single weakness

**THE LONG WATER — it teaches swimming and then stops using it.**
After the meltfalls it has one long ferry run, a town, and a boss. The swim is a hazard you fall into rather
than a verb you use. The new sluice stair (66 columns of rising piers) helps, but the ferry run is still the
weakest ten-column-per-second stretch in the arc.
→ *Do*: give the ferry run a reason to leave the raft — a submerged toll chain you must cut, a sunken cart with
the level's silver in it, a siren that drags you off and must be followed down. One dive, with air, per minute.

**THE REEF — its two halves do not talk to each other.**
The tide is a great rule (route above, route below) but the level rarely makes you *choose*: the tide changes
and you go the only way that is open. It is also where "invisible damage" complaints came from; foes are rimmed
now, but the underwater silhouettes are still the hardest to read in the game.
→ *Do*: make one long stretch passable **either** way, with the loot on the low road and the safety on the
high one, so the tide becomes a decision. And give urchins a reason to be there — a current that pushes you
onto them.

**THE FLOTILLA — five foe kinds and the most decoration in the game.**
20.5 deco/100 is double the next level; it looks wonderful and fights thin. Four ships, and the crew of all
four is "cutlass ×14". The Quartermaster is excellent; everything before her is the same fight.
→ *Do*: it does not need a new creature. It needs its existing five arranged into **three different problems**:
a press-gang crowd on the galley (many weak), a boarding-net choke on the hulk (two boarders and a bosun in a
doorway), and marines in the rigging over the hoy (shooting while you cross). Same enemies, three encounters.

**THE HURRICANE DECK — it is now the longest level in the game and its middle sags.**
760 columns with 12 checkpoints is right, but the stretch between the galley and the rent (x 216–330) is a
plain deck with shrouds. The wash carries it; nothing else does.
→ *Do*: put one *readable machine* in the middle of her — the pumps, worked by a crank you can turn to drop
the water in her hold and open the low route, or her guns, which the crew are trying to run out at the wreck
alongside while you cross their deck.

## Four things all four levels would gain from

1. **Air as a resource, not a timer.** Breath is a countdown that you either survive or die to. Air bells exist
   in the reef and the hurricane; nowhere does a level ask you to *plan* around them (take the long way and
   arrive with no air, or clear the short way first). One dive per level built as a loop around two bells.
2. **The current.** Water in BRACKEN is still: you swim as freely as you walk, only slower. A one-directional
   current would make every pool a decision — downstream is fast and commits you, upstream is slow and safe.
   `pools` already carry per-pool flags; a `flow` field pushing swimmers would be perhaps thirty lines and
   would change all four levels at once. **This is the single highest-value change on this list.**
3. **Water that is legible before it hurts you.** Solved for the foul water (green scum, drifting slicks,
   gas, broken spars) and for the storm surge (lightning that says where it will strike). The remaining
   offender is DEEP water that kills on contact: it looks the same as water you can swim.
   → give killing water its own surface (a black sheen and no foam) so the eye reads "not this".
4. **A mid-level fight in every one of them.** The Reefmaw and the Drowned Bosun are mid-fights and both land
   well; the Long Water and the Flotilla go from trash to boss with nothing between. One named foe apiece —
   the Long Water's should be in the water, the Flotilla's on a boarding net.

## What is already fixed (for the record)

Water on top of land, disconnected waterfalls, invisible damage, the ferryman doing nothing, deep pools drawn
opaque, foul water looking like clean sea, masts that read as pasted on the sky, four hands standing in the
air, a grey wall hanging over the sea, the Herald's two dead attacks, and the Quartermaster's unfollowable leap.

## If I could only do three

1. **The current** (`flow` on pools) — it makes every existing pool in all four levels a decision.
2. **The Flotilla's three encounters** — no new art, and it fixes the arc's flattest fighting.
3. **The Long Water's dive** — one loop off the ferry run, with the level's silver at the bottom of it.
