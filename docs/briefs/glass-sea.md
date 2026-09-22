# THE GLASS SEA: desert arc level 4 (brief)

Greybox: `src/draft/glass-sea.js`, all checks passing (`node tools/draft-level.mjs glass-sea`, map `docs/draft-glass-sea.png`).

## Where it sits
Level 4, after THE RED GORGE; `needs: 'redgorge'`. **The slope showcase**, and the fork to the optional **SUN TEMPLE** (4b). Glass
and night blue; gold by day.

## THE RULE: day and night flip the rules
The crossing starts in the day: **SUNSTROKE**, and shade is life (`src/sunstroke.js`). The sun sets at **THE FORK OBELISK**. Past it
is the night: the **COLD**, and scorpion **SWARMS** pouring from cracks in the glass. A **CAMPFIRE**'s light holds them off, and its
warmth is what shade was by day. The glass itself: lightning-fused dunes whose slopes are **slick** (the slide is faster, stopping
harder). Said three ways: the sky; the sun meter turning to a frost meter at dusk; shade violet by day, firelight gold by night.

## Seven sections
THE GLASS EDGE · THE FULGURITE FIELD (lightning spires: overhangs to rest under) · THE BONE CROSSING (**the mini**) · THE FORK OBELISK
(sunset; the way off to the Sun Temple) · THE SUNKEN HEAD (a giant's stone head in the glass: its crown climbed, a relic in its mouth)
· THE COLD FLATS (fires, cracks, swarms) · THE COLOSSUS STEPS · then THE GLASS COLOSSUS.
- **Verbs:** the slide (on glass), jump, climb (the head), fire as a place (the night's shade), block.
- **THE MACHINE (F5), for the build:** a **SUN-MIRROR** on the obelisk. Turned by day, it throws a beam that fuses a glass bridge over
  the flats' widest crack (`src/light.js`). It changes the room and can be turned again.

## Creatures
**GLASS SCORPIONS** (new: the scorpion's kit, brittle, and a sting that leaves a glass shard in the ground as a hazard), vultures
by day, **NIGHT HUNTERS** (new: pale things that only move in the dark and freeze in firelight), the swarms. Draft GARRISON:
glassscorp 21, scorpion 17, nighthunter 17, vulture 13 (3.5–4.5 a screen).

## THE GLASS STALKER (mini, the Bone Crossing, ~a third in)
A scorpion the size of a wagon, made of glass. It lunges with its claws (`!`), sweeps its tail low (red ✕) and lances with the sting
(red ✕, long tell). **Opening:** bait the sting into one of the crossing's glass overhangs. It cracks its own sting in the glass and
is stuck for ~3 s at double damage. A sting into sand opens nothing.

## THE GLASS COLOSSUS (boss)
A giant of lightning-glass on the steps at the edge of the sea. The arena is 40 tiles with two glass shelves (mirror-bright) and
campfires at the edges. The fight starts at dusk.
- **SUN LANCE** red ✕: by day its glass body focuses the sun into a beam along the ground. Get out of the line.
- **STOMP** `!` / shockwave: a stamp and a ring of shards. Jump the ring.
- **SHARD RAIN** `!`: glass falls from its shoulders. Block, or keep moving.
- **THE SWARM CALL** (night): it cracks the ground and the swarms come. Stand in the firelight.
- **THE OPENING (player-made, the light):** **bait the SUN LANCE into a glass shelf.** The beam reflects back into its chest and cracks
  it open for ~3 s at double damage. A lance that misses the shelves opens nothing.
- **PHASE 2 (<50%):** NIGHT falls in the arena (the rule's flip). No more lance, so no more reflections. Instead its chest glows as it
  cools, and the cracks from phase 1 are where it is weak; the swarms come from the cracks, and the fires hold them.

## What the draft proved
- **The day:** the longest walk in the sun from the start to the obelisk is under 7.5 s.
- **The night:** a campfire every 36 columns, the longest walk between warmth under 8 s, and every swarm crack within 10 tiles of a
  fire's light. **Placed by rule:** keep the rule in the build, not the columns.
- 64 glass slope tiles; the fork to the Sun Temple on the road; the Stalker's arena 32% of the way in.

## The build still owes
Glass tiles (the slope skin model in a glass palette), a night palette and the frost meter, glass-scorpion, night-hunter, Stalker
and Colossus bakers and behaviour, the sun-mirror, and the fork's exit to 4b. About 2 sessions.
