# THE RED GORGE: desert arc level 3 (brief)

Greybox: `src/draft/red-gorge.js`, all checks passing (`node tools/draft-level.mjs red-gorge`, map `docs/draft-red-gorge.png`).

## Where it sits
Level 3, after THE WELL TOWN; `needs: 'welltown'`. **A climb** (like THE FALLING TOWER): 206 rows up a red-rock canyon to the Roc's nest.
Red rock, green water, the channel's rock scoured pale.

## THE RULE: the flood comes down the canyon
On a cycle (`src/desert-rules.js` FLOOD): dry 7.5 s, then a **HORN** from above for 2.4 s, then the **TORRENT** for 2.2 s down the
CHANNEL in the middle of the gorge. Anything in the channel is swept down and hurt; the ledges up the walls are dry. Every section's
side is capped by an **OVERHANG**, so to climb on you must cross the channel on a **ROPE BRIDGE**, between floods. Said three ways:
the horn; the scoured, wet-dark channel rock; flotsam (branches, a drowned cart) wedged in the channel walls.

## Seven sections (bottom to top)
THE GORGE MOUTH (the first flood watched from a ledge: the rule taught) · THE DRY FALLS (the plunge-pool terrace) · THE RAPTOR LEDGES
(nests on the outer shelves) · THE ROPE BRIDGES (two crossings close together) · THE CAVE OF HANDS (a room cut into the west wall,
painted hands, the relic) · THE NARROWS (the walls close in; the channel is nearly all there is) · THE SUMMIT · then THE ROC'S NEST.
- **Verbs:** jump, climb, the crossing timed against the horn, block (gusts), the machine.
- **THE MACHINE (F5), for the build to add:** a **SLUICE GATE** at the Dry Falls. Shut, it holds the next flood back for one crossing;
  it reopens when the flood passes. Reusable, and it changes the room.

## Creatures
**CLIFF RAPTORS** (new: they dive at you on a bridge, the worst place, with the vulture's marked dive, `src/desert-foes.js`), **GORGE
CRABS** on the ledges, scorpions. Draft GARRISON: raptor 24, crab 16, scorpion 16 (3.7 per 12 rows). The raptors are a lot; swap
some for a second ledge creature in the build (the roster-concentration lesson).

## THE ROC (boss)
A great red-and-gold bird on its nest of wreckage at the gorge head. The arena is the nest plateau: 40 tiles, the channel's head
running through it.
- **THE DIVE** red ✕: its shadow marks your spot, then it stoops there. Leave the shadow.
- **WING GUST** `!`: blocking braces you (the storm's drift, `gustDrift`). Unbraced, you're pushed toward the edge.
- **TALON SNATCH** red ✕: a low sweep that grabs. Caught, it carries you and drops you onto a lower ledge (damage, no death). Jump it.
- **FEATHER VOLLEY** `!`: a fan of quills. Block, or jump between.
- **THE OPENING (player-made, the rule):** the flood's head runs through the nest. **Bait its DIVE into the channel as the horn
  sounds:** the torrent takes it, and soaked it can't fly, grounded and open for ~3 s at double damage. A dive on dry rock opens
  nothing.
- **PHASE 2 (<50%):** the floods come faster (dry 5 s); it dives twice; the gust blows toward the channel.

## What the draft proved
- **The flood never traps you:** every place to stand in the channel is at most **3 tiles** from dry rock, against the horn's 2.4 s (14 tiles at a run).
- **The rule is load-bearing:** the climb crosses the channel **7 times** on bridges, because an overhang caps each side.
- 7 sections of 26–31 rows, 3.7 foes per 12 rows, everything reachable. Caught on the way: every section's first ledge was 4 rows
  up (a jump is 3), and the summit stopped a ledge short of the nest.

## The build still owes
Red-rock tiles and the flood's water and horn, raptor, crab and Roc bakers and behaviour, the sluice gate, and a climbing pilot (the
Falling Tower's lesson: there is no climbing pilot yet, so the medal times are estimates). About 2 sessions.
