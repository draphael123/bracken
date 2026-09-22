# THE SUN TEMPLE: desert arc 4b, optional (brief)

Greybox: `src/draft/sun-temple.js`, all checks passing (`node tools/draft-level.mjs sun-temple`, map `docs/draft-sun-temple.png`).
The class level: clearing it opens **THE SUN PRIEST** for ~800 coins (`docs/sun-priest-design.md`).

## Where it sits
**Optional**, forking off THE GLASS SEA at the obelisk (like THE UNBURIED FIELD off the Witchlight Stair). White stone, gold light,
violet dusk.

## THE RULE: the sun moves
Each hall is two **CHAMBERS** under a roof with a row of five high windows. Over the level's day the sun comes through one window after
another (`src/light.js` `templeSun`). A chamber's **SUN-DOOR** opens when light reaches its **SUN-PLATE**, and only a **MIRROR** under
the window the sun is in can carry the beam there. So a chamber opens at some hours and not others: turn the right mirror and wait
for the sun, or come back. Standing in a beam mends you and burns the dead: this is the Priest's temple. **At dusk** the last windows
go dark and the siege comes (the king's dead at the doors).

## Seven halls
THE GATE OF DAWN (one mirror, turned wrong: the rule taught) · THE HALL OF WINDOWS · THE SUNDIAL COURT · THE REFLECTING POOL (the relic)
· THE CLOISTER · THE BELL OF NOON · THE HIGH ALTAR · then THE FALLEN HIGH PRIEST.
- **Verbs:** turning mirrors, standing in light, jump (the galleries), block, and the siege at dusk.
- **THE MACHINE (F5), for the build:** the **BELL OF NOON**. Rung, it holds the sun in its window for 20 s (the day stops), which
  buys time for a far chamber. It can be rung again after it cools.

## Creatures
The king's dead (mummies, skeletons), and **FALLEN PRIESTS** (new: they SNUFF a window, taking its beam out of a chamber you're
solving. The Lit Church's relighting priests, turned inside out). Draft GARRISON: mummy 38, fallenpriest 19, skeleton 19 (4.0 a
screen). The mummies are over half: diversify in the build.

## THE FALLEN HIGH PRIEST (boss)
The temple's own master, turned by the king. He fights with shadow, pulling the light out of the room. The arena is the high altar:
40 tiles, five windows the sun crosses during the fight, one turnable mirror on the altar.
- **SNUFF** (no damage): a window goes dark. The dark floor is his (red ✕ shadow hands rise from dark tiles; the lit floor is safe).
- **SHADOW BOLT** `!`: block it.
- **DARK SWEEP** red ✕: a low sweep of darkness. Jump it.
- **GRASP** red ✕: hands from the dark under you, marked a moment before. Step into the light.
- **THE OPENING (player-made, the rule):** **turn the altar mirror so the window's beam lands on him.** He burns, staggered, for ~3 s
  at double damage. The sun moves, so the mirror that works now won't in a minute: read the hour.
- **PHASE 2 (<50%): SUNSET.** Only the lowest window is lit, red and low across the floor. Everything else is his. The last beam of
  sunset is the only opening left, and it is going out.

## What the draft proved
- **All 14 chambers open**, none as built, each needs a mirror turn, and **each opens at exactly one hour** (checked with the light
  solver at every hour). That's a strong timing rule: **keep the temple's day short (~40 s)** so a missed hour isn't a long wait.
- Caught: a chamber that could never open (a pillar), and one that was open as built.

## The build still owes
Temple tiles, window light shafts drawn as the beams (`trace`), mirror and plate props, fallen-priest and High Priest bakers and
behaviour, the dusk siege, the bell, and the class unlock (coin purchase). About 2 sessions, plus the Sun Priest class itself (2–3).
