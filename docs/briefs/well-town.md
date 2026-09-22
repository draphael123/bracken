# THE WELL TOWN: desert arc level 2 (brief)

Agreed in the arc (`docs/desert-arc-brief.md`), 2026-09-21. Greybox: `src/draft/well-town.js`, all checks passing
(`node tools/draft-level.mjs well-town`, map `docs/draft-well-town.png`). Copy to `bracken/.claude/briefs/` when the branch merges.

## Where it sits
Level 2 of the desert arc, after THE SUNKEN CARAVAN; `needs: 'sunkencaravan'`. **The arc's shop and hub.** Whitewashed, blue doors,
the wells the only blue water in the town.

## THE RULE: water is carried
A skin you fill at wells (`src/desert-rules.js`: three sips). **Drink:** sunstroke cured outright (and so everywhere in the arc after
this). **Pour:** a MUD WALL softens away, a fire goes out. Bandits hold the wells. Said three ways: the wells' blue; every mud wall
cracked dark where water would take it; the skin's sips on the HUD.

## Seven sections (the draft)
THE CARAVAN GATE (fill the skin; a mud-bricked house door with a stray inside, optional, teaches the pour) · THE LOWER MARKET
(stalls, awnings, **THE SHOP**; THE COVERED BAZAAR, a roof with a walkway on it) · THE WELL SQUARE (**THE GREAT WELL**) · THE CISTERNS
(a pillared hall under a street choked with rubble) · THE MUD QUARTER (lanes shut by mud walls, a well between them, THE DOVECOTE
tower) · THE BANDITS' ROOST (rooftops, a burning barricade to douse, the relic) · THE KASBAH (the Bandit King's courtyard).
- **Landmarks (F2):** the gate arch, the covered bazaar, the Great Well, the pillared cistern hall, the dovecote, the roost.
- **Verbs (F3):** jump, climb (bazaar rungs, dovecote), the carried thing (the skin: fill, drink, pour), the machine, block.
- **THE MACHINE (F5): the Great Well's windlass.** It lowers you into the cisterns and back, and is the only way past the rubble.

## Creatures
Bandits (swords), bandit archers, **WATER-THIEVES** (new: they cut your skin if they reach you, draining a sip, and run for a
well; catch them and the sip is back), scorpions in the cisterns. Draft GARRISON: bandit 31, thief 16, archer 15, scorpion 10
(3.8 a screen).

## THE BANDIT KING (boss)
A big man in brass-and-mud plate, a scimitar and a sling of oil jars. The arena is the Kasbah courtyard: 40 tiles, a well in the
middle, water troughs, his lieutenants at the well.
- **SCIMITAR SWEEP** `!`: a wide cut. Block, or step back.
- **KNIFE FAN** `!`: three thrown knives in a spread. Block, or jump between.
- **OIL JAR** red ✕: a jar that shatters and burns in a patch (a marked ring first). Move off.
- **THE CHARGE** red ✕: across the courtyard, shoulder first. Jump it or get out of the line.
- **THE OPENING (player-made, the rule's verb):** after an OIL JAR he walks through his own fire. **Pour your skin on him while he
  burns:** the gout of steam blinds him and softens his mud plate, open for ~3 s at double damage. It takes a full skin, so you
  refill at the courtyard well, which his lieutenants hold. Pour on him when he isn't burning and nothing happens (`tools/boss-openings.mjs` must prove it's caused).
- **PHASE 2 (<50%):** two jars at once, the fire spreads along the troughs' oil, and his lieutenants take the well (win it back to refill).
- Touch rule, one clear answer per attack, new baker, pilot ≥ 21 runs at normal health.

## What the draft proved
- **The rule is load-bearing:** with the 4 mud walls shut, the Kasbah can't be reached; poured, it can.
- **The water budget:** 4 pours on the road and 3 wells; a three-sip skin never runs dry, and the first well comes before the first wall.
- The shop is on the road; the windlass is the only way past the rubble.
- 7 sections of 60–79 columns, 16% flat screens, 3.8 foes a screen, everything reachable.

## The build still owes
Level art (a whitewashed town set: `village_tiles.js` is the nearest), the well, mud brick and waterskin UI (`src/redraw/desert2.js`
has them), the water-thief and Bandit King bakers and behaviour, the skin wired to the knight (`src/desert-rules.js`), and one
`npm run check`. About 2 sessions.
