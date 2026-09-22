# THE SEALED PYRAMID: desert arc level 6 (brief)

Greybox: `src/draft/sealed-pyramid.js`, all checks passing (`node tools/draft-level.mjs sealed-pyramid`, map `docs/draft-sealed-pyramid.png`).

## Where it sits
Level 6, after THE BURIED CITY; `needs: 'buriedcity'`. **A descent**: down the pyramid's face in the storm, in by the robbers' hole,
down through 18 galleries to the real tomb's antechamber. Black and gold, torchlight. **The sandstorm lives here**, on the face
(`src/desert-rules.js` STORM), and nowhere else in the arc except the Skeleton King's last phase.

## THE RULE: the tomb is a machine
Every gallery has a **TRAP** (a falling block, a dart wall or a rolling stone) and a **PRESSURE PLATE** that sets it off. The plate
always stands before the trap's reach, and a **GUARD** always stands in it: tread on the plate as the guard walks into it, and the
tomb kills its own. Tread on it while you're in its reach, and it kills you. The tomb resets its traps behind you. Said three ways:
the plates are pale and worn where the robbers stepped; every trap's reach is scored into the stone (dart holes, block dust, a
groove for the stone); the guards' bones lie in the reach.

## Seven sections (top to bottom)
THE FACE (the steps in the storm) · THE GALLERY OF PLATES (the rule taught) · THE EMBALMER'S HALL (**the mini**, shelves of jars) ·
THE COUNTERWEIGHT SHAFTS · THE FALSE TOMB · THE SCARAB PITS · THE DEEP WAY · then THE SCARAB MOTHER.
- **Verbs:** the plate (timing a trap), the fall between galleries, the machine, block, the storm (brace on the face).
- **THE MACHINE (F5): THE COUNTERWEIGHTS.** Two stone blocks on chains in shafts behind the walls: ride one down and the other comes
  up. They are the only way through the middle of the tomb.

## Creatures
**MUMMIES** (slow; they GRAB, and escaping is the quicksand verb: jump, and keep jumping), **SCARAB SWARMS** (from sarcophagi; a
swarm flows along the floor), **JACKAL-HEADED GUARDS** (the trap guards: they patrol their reach), vultures on the face. Draft
GARRISON: mummy 19, jackal 13, guard 13, scarabs 9.

## THE EMBALMER (mini, his hall)
The tomb's keeper, long-armed, with a hook and a basin. He hooks (`!`) and draws you in, throws a jar (red ✕: preserving fluid,
blinding, a marked splash), and wraps you in linen (red ✕: caught, the quicksand verb to get out). **Opening:** bait his hook into
a shelf of jars. They break over him and the fluid blinds him for ~3 s at double damage.

## THE SCARAB MOTHER (boss)
A beetle the size of a room in the antechamber, its walls fitted with the tomb's own traps. The arena is 40 tiles, with a dart wall
and a falling block, each with its plate at the room's edge.
- **THE CHARGE** red ✕: head down across the room. Get out of the line.
- **SWARM** `!`: she opens her shell and scarabs pour along the floor. Block the first wave, jump the rest.
- **ACID SPIT** `!`: an arc of acid. Block, or step out of the splash.
- **BURROW** red ✕: under the floor; the sand humps where she'll come up. Leave the hump.
- **THE OPENING (player-made, the rule):** **bait her CHARGE into a trap's reach and tread on its plate.** The block drops (or the
  darts fly) and she is pinned for ~3 s at double damage. A charge into a plain wall opens nothing.
- **PHASE 2 (<50%):** the tomb's machine wakes: the traps fire on their own on a rhythm, and her swarms come faster. The plates still
  win the opening, but the rhythm is now hers too.

## What the draft proved
- **The tomb is a machine:** 13 traps (4 block, 4 darts, 5 stone). Each plate is reached and stands before its reach, a guard
  stands in every reach, and every reach is on the road.
- **The counterweights are load-bearing:** without them nothing below the shafts can be reached.
- The Embalmer's hall is on the way down; the storm blows on the face, with a checkpoint in it.
- Caught: an open shaft let you fall past the machine; stacked holes dropped you straight past the mini; the last hole opened over rock.

## The build still owes
Pyramid tiles, the traps (three kinds, reset behind you), plates, the counterweights, mummy, scarab, jackal, Embalmer and Scarab
Mother bakers and behaviour, and the storm on the face (`src/desert-rules.js` and the dust sheets in `src/redraw/desert2.js`).
About 2 sessions.
