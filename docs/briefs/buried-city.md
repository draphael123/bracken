# THE BURIED CITY: desert arc level 5 (brief)

Greybox: `src/draft/buried-city.js`, all checks passing (`node tools/draft-level.mjs buried-city`, map `docs/draft-buried-city.png`).

## Where it sits
Level 5, after THE GLASS SEA; `needs: 'glasssea'`. A city of the **living**, buried whole (not a tomb: the pyramids have the tombs).
Sandstone and blue tile, lamplight, sand pouring through windows.

## THE RULE: the sand pours in
The streets run under a roof of sand held up by the city's own buildings. The **HOURGLASS ROOMS** fill from holes in the roof: the
sand rises from the floor, and once it is over the top of the room's east doorway the way on is **shut**, until a **LEVER** on the far
side opens its floor-gate and drains it. Each room is a run against the sand: cross, climb to the lever, pull, go. Said three ways:
the hiss and the falling streams; a sand-line painted on every doorway; the drowned in the drifts.

## Seven sections
THE SAND STAIR (down into the city) · THE MARKET UNDER THE SAND · THE HOURGLASS HALLS (three rooms: the rule taught) · THE DROWNED
PALACE GATE (**the mini**) · THE CLOCKWORK FOUNDRY (**THE GREAT SAND-GATE**) · THE PETRIFIED GARDENS (stone trees; the relic) · THE
THRONE STREET · then THE HOURGLASS KING.
- **Verbs:** the run, climb (lever ledges, the garden trees), a lever as a timed thing, the machine, block.
- **THE MACHINE (F5): THE GREAT SAND-GATE**, a wheel in the foundry. Turned, it drains every room in the lower quarter at once, and
  can be turned again.

## Creatures
**SAND-DROWNED CITIZENS** (new: they rise out of the drifts where the sand is deep; shallow floors are safe from them),
**CLOCKWORK CONSTRUCTS** (new: the city's guards, still keeping their rounds; a wound-down one can be rewound as a step), sand
goblins, scorpions. Draft GARRISON: drowned 28, construct 22, scorpion 11, sandgob 10.

## THE SAND WARDEN (mini, the Drowned Palace Gate)
A guard-construct of packed sand and brass. It slams (`!`), sweeps a halberd low (red ✕) and throws sand in your eyes (`!`).
**Opening:** lure it into the gate's hourglass room as it fills. The sand pins its legs for ~3 s at double damage.

## THE HOURGLASS KING (boss)
A clockwork king with an hourglass for a chest, on the throne at the end of the street. The arena is the throne room: 40 tiles, two
roof holes pouring sand, the great sand-gate's second wheel.
- **SAND STREAM** red ✕: a column of sand from a roof hole he calls down on your spot (marked). Move.
- **GEAR TOSS** `!`: a spinning cog along the floor. Block, or jump it.
- **TIME SLIP** red ✕: he steps back to where he was 2 s ago and strikes at where YOU were (an afterimage tells the spot). Leave it.
- **PENDULUM** `!`: a heavy sweep from his sceptre. Block.
- **THE OPENING (player-made, the rule):** his chest runs out as the fight goes on. **Turn the arena's sand-gate wheel as his glass
  empties** and it drains the last grains: he STALLS, open for ~3 s at double damage, then turns himself over. Turn it any other time
  and it only drains the floor.
- **PHASE 2 (<50%):** the throne room fills in stages (the hourglass-room rule, the whole arena), and the levers on its walls drain it.

## What the draft proved
- **Each room is a run against the sand:** the run to each lever is 2.9 s against the 5.5 s the sand takes to shut the door (53%,
  inside the 60% margin), and every lever is reached.
- **The rule is load-bearing:** with the six rooms full, the Hourglass King can't be reached.
- The mini is on the road at 47% (a bit past a third: pull it earlier in the build if the middle sags).
- **Caught: as first tuned (1.1 rows a second) the sand shut every door in 2.7 s against a 2.9 s run. Every room was a loss.** Keep
  `SAND.rate` ≤ 0.55, or move the levers closer.

## The build still owes
City tiles, sand-fill (a rising sand body, drawn, collided, and drained), levers, the wheel, drowned, construct, Warden and Hourglass
King bakers and behaviour. About 2 sessions.
