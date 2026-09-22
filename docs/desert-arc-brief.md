# THE DESERT ARC — brief (agreed with Daniel 2026-09-21)

Seven main levels and one optional class level, a new band on the world map after THE FALLING TOWER. The slopes engine
(`claude/slopes`, phase 2 wiring) comes first: every desert level stands on dunes. This brief lives on `claude/slopes`
as `docs/desert-arc-brief.md`; copy it to `bracken/.claude/briefs/desert-arc.md` when the branch merges.
It supersedes the storm act in `sunken-caravan.md` (see level 1).

## The spine
A great caravan was carrying something stolen from THE SKELETON KING's tomb. His curse raised the storm that buried it.
You follow the buried caravan's road across the desert, through the well town, the gorge, the glass sea and the buried
city, to the two pyramids, and finally to the king under the capstone. Every level is a stage on that road, and the
sun is the thread through the arc: in level 1 it is what hurts you, and in level 7 it is your weapon (sunlight burns the dead).

## The levels

| # | Level | THE RULE (one sentence, C2) | Shape | New creature(s) | Mini | Boss (player-made opening) | Palette |
|---|---|---|---|---|---|---|---|
| 1 | THE SUNKEN CARAVAN | **The sun: shade is life.** Sunstroke in the open; awnings, wagon lees, overhangs and vulture shadows are shade | Horizontal, rolling dunes; first slopes and slides; quicksand | scorpion, sand goblin, vulture | none (brief) | THE DUNE WORM (breach into a wagon wreck) | gold dunes, blue sky |
| 2 | THE WELL TOWN | **Water is carried.** A skin you fill at wells: it cures sunstroke and softens mud walls; bandits hold the wells | Town + interiors; the arc's SHOP and hub | bandits, water-thieves | — | THE BANDIT KING | whitewashed town, blue doors |
| 3 | THE RED GORGE | **The flood comes down the canyon.** Flash floods on a warning horn: climb or be swept | Vertical-ish canyon climb, ledges, ropes | cliff raptors, gorge crabs | — | A ROC at its nest at the top | red rock, green water |
| 4 | THE GLASS SEA | **Day and night flip the rules.** Sunstroke by day; cold and scorpion swarms by night; lightning-glass dunes are slick slides | Open dunes at their biggest: the slope showcase | glass scorpions, night hunters | yes (a third in) | THE GLASS COLOSSUS | glass and night blue, gold by day |
| 4b | **THE SUN TEMPLE** (optional, forks off 4) | **The sun moves.** Light through high windows slides across the floors on the level's clock: sunlight heals you and burns the dead, the dark between belongs to them; at dusk the siege | Temple halls, a courtyard, the high altar | fallen priests (they SNUFF windows), the king's dead | — | THE FALLEN HIGH PRIEST (caught in the last beam of sunset) | white stone, gold light, violet dusk |
| 5 | THE BURIED CITY | **The sand pours in.** Rooms fill like hourglasses; levers and sand-gates drain them | Underground city of the LIVING: streets, market, palace, sand through the windows | sand-drowned citizens, clockwork constructs | yes | THE HOURGLASS KING | sandstone and blue tile |
| 6 | THE SEALED PYRAMID | **The tomb is a machine.** Plates, falling blocks, dart walls, rolling stones and sealing doors, and the tomb resets them behind you. Set them off ON PURPOSE: roll the stone through its guards, drop the block to make a step | A DESCENT: the pyramid's face in the storm (the sandstorm lives here, as the approach) -> the robbers' tunnel -> the false tomb -> the real one. Machine (F5): counterweight shafts | mummies (slow, they grab), scarab swarms (from sarcophagi), jackal-headed tomb guards | THE EMBALMER (his hall of jars) | THE SCARAB MOTHER (bait her charge into a trap wall) | black and gold, torchlight |
| 7 | THE KING'S PYRAMID | **The king's light.** The pyramid is black; sunlight comes down shafts from the apex and you turn MIRRORS to carry the beams. Sunlight burns the dead, opens sun-doors, lights the way | An ASCENT through the heart, gallery by gallery, to the burial chamber at the apex (the mirror of 6) | the king's court: gilded skeleton guards, priests who re-wrap and raise the fallen, shadow things that live only in the dark | none: the Grand Gallery is the build-up | **THE SKELETON KING — the world boss** | black, gold, white sunbeams |

**Undead overlap is fine (Daniel):** the pyramids share undead with the Undercrown, the Burial Caverns and the Mage's Folly.
The Skeleton King is still clearly the desert's own: gold, rotted linen, crook and flail, and a fight about LIGHT.

## THE SKELETON KING (world boss)
A crowned skeleton pharaoh on a throne under the capstone.
- **Phase 1:** crook and flail attacks with tells as usual (`!` / red ✕, one clear answer each), and he calls sand up
  through the floor.
- **THE OPENING (player-made):** swing a mirror so its beam lands on him. He burns and staggers, open for about 3 s at
  double damage. A beam anywhere else opens nothing (tools/boss-openings.mjs must prove it's caused).
- **Phase 2:** he shuts the capstone. Darkness, and the only light is what you've routed. He raises his court.
- **Phase 3:** he tears the capstone off and the storm pours in: gusts, sand, a last stand in full sun.
- The layers run concurrently (the court + the dark + the storm, not in turns). Touch rule, A1-A8, pilot >= 21 runs.
  Probably two sessions on his own.

## THE SUN PRIEST (the class THE SUN TEMPLE unlocks)
Clearing THE SUN TEMPLE opens THE SUN PRIEST for ~800 coins (heroes otherwise cost 10 silver; no consolation prize for
owners), the same rule as the other class levels. A first sketch, to get its own design pass:
- Staff and sun-disc, light armour, mid health.
- The kit is LIGHT, not fire and not holy melee: a sunbeam he aims, a patch of consecrated sunlight he lays down (it heals
  him and burns the dead), and a flare that blinds.
- **Weaker in the dark.** A real weakness, and it makes the desert's light levels (4b, 7) his.
- Distinct from THE PALADIN (heavy maul, holy light up close) and THE PYROMANCER (fire and heat): the priest works at range
  and through the room's light.

## Who owns which mechanic (so no two levels share a rule)
- **Slopes and the slide:** the engine, everywhere. Level 1 teaches them, level 4 is their showcase.
- **Sunstroke** (`src/sunstroke.js`): level 1's rule, and the DAY half of level 4. Nowhere else as a headline.
- **Water carried:** level 2. The waterskin can cure sunstroke anywhere after it (a reason level 2 comes second).
- **Quicksand** (`src/quicksand.js`): level 1, and the Dune Worm's swallow. It can reappear as a hazard, never as a rule.
- **The sandstorm:** the approach to level 6, and the Skeleton King's phase 3. **Level 1 has no storm act** (this changes
  `sunken-caravan.md`), just a haze on the horizon as a tease.
- **Light:** 4b (moving sun) and 7 (mirrors). Two different rules about light, one optional, one the finale.

## Every level still owes (RULES-LEVELS-AND-BOSSES.md)
Seven named sections, five landmarks built from verbs (F1/F2), four verbs with one used somewhere new (F3), alternation
(F4), one machine you control (F5), distinct from both neighbours at a glance (F6), shop/shrine in the arc (the Well Town),
three strays, three silvers, a relic, checkpoints, mini at a third where listed, somewhere to go after the mini (F7).
A GARRISON row and an ELITES row, no blanket calm, 3.5-4.5 foes per 24-column screen (the density lesson). A TIER entry,
MEDALS and a NODES list.

## Order and cost
Slopes phase 2 -> 1 THE SUNKEN CARAVAN -> 2 -> 3 -> 4 -> 4b THE SUN TEMPLE + THE SUN PRIEST -> 5 -> 6 -> 7 THE SKELETON KING.
About 2 sessions a level, 2 for the world boss, 2-3 for the class: roughly 18 sessions after slopes phase 2. It slots into
THE QUEUE where the Sunken Caravan is now (after the Unburied Field), unless Daniel reorders it.

## Already built for it (on `claude/slopes`, not wired in)
Slopes engine + reach rule + the Dune Yard; sunstroke, quicksand, the Dune Worm's state machine (`docs/caravan-mechanics.md`);
desert tiles, backdrops, props (`src/redraw/desert.js`); scorpion, vulture, sand goblin, the Dune Worm (`src/redraw/desert_foes.js`).
