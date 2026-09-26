# THE BURIAL CAVERNS, second rework (claude/burial2, 2026-09-26)

Daniel, 2026-09-25: *"The level with the buried boss still feels too long and repetitive."* He chose the whole plan in
`level-review/group-b.md` (THE BURIAL CAVERNS). This is that plan, sized.

## The sentence (F8)

**LIGHT THE GAS. THE DEAD WILL NOT RISE IN ITS LIGHT.**
Said three ways: grave candles you take fire from, gas vents that take the fire and burn as lamps, and the dead who stay
down (and the dark that opens) wherever a vent burns.

## 1. The cut: 1,386 -> about 700

`cols` is `spanOf(W, H) = W + 3 * (H - 30)`. Today 1140 x 112. After: **560 x 74 = 692**. The Grave Causeway, the Restless
Rows, the Falling Gallery, the Plague Vault, the Bone Stairs and the Last Procession go: they were the same floor with more of
the same on it. The descent is kept whole and packed under the road, the way it always was.

| # | section (F1) | cols | rows | backdrop | landmark (F2) |
|---|---|---|---|---|---|
| 1 | THE CANDLE PATH | 0-99 | road | earth-cut barrow | THE FIRST VENT (the lesson) |
| 2 | THE OSSUARY | 100-187 | road | the ossuary shelves (today's skull-niche wall, here only) | THE BLIND VAULT (lit vent to vent) |
| 3 | THE CHARNEL GALLERIES | 188-300 | 25-42 | bone-stair shaft | THE CHARNEL HOUSE (the one ambush) |
| 4 | THE DROWNED OSSUARY | 188-316 | 45-70 | flooded crypt with arches | the coffin lifts and chains |
| 5 | THE GRAVEYARD KEEPER | 316-380 | 45-70, then the shaft up | flooded crypt; bone-stair shaft | the Keeper's vault |
| 6 | THE ROTTEN BRIDGES (the exam) | 381-484 | road | earth-cut barrow, dark | the bridges over green water |
| 7 | THE BURIED DEAD'S LAIR | 485-559 | road | processional hall, effigies and banners | his bier |

A pillar or an arch stands at every seam between two backdrops (drawn by the backdrop painter, both sides, so no seam can
be missed). The Ore Road's mine and the caverns get an underground floor tile: packed earth, no grass, no roots.

## 2. The machine (F5): gas vents you light

- **Grave candles** stand lit along the road. Walk into one's light and you take **FIRE IN HAND** (14 s; a blow puts it
  out, and so does water).
- **Strike a gas vent with fire in hand** and it burns as a lamp for **20 s**: its gas burns off (no poison), it lights the
  dark round it, anything of the dead standing in the flame burns, and **the dead will not rise inside its light** (a buried
  one stays buried, a summoned one does not come up there).
- Taught safely (the Candle Path: a candle, a vent, a sign, and one buried dead in the vent's light, on open ground), then
  used four ways: to see (the Blind Vault is dark from lamp to vent), to keep the dead down (the buried lie between the vents),
  to clear a path (the exam's vents puff over the only way on until you light them), and to open the boss.

## 3. The Buried Dead's opening is caused (A11)

His rest no longer opens him. **A burning vent does**: three vents in his floor, a candle at each wall. Light one and walk him
into its fire (or light it under him) and he is SCORCHED - open 3.4 s at x1.3, once per lighting. The arm-in-the-ground punish
stays (it was already caused). His summoned dead do not rise inside a burning vent's light.

## 4. Fixes

- The underground floor tile (burial and the Ore Road's mine).
- No sea dead under the hill: the barrow's soldiers are THE FALLEN, risen (the Unburied roster), in place of the coast's lantern
  shades; the bone corsairs were already gone (husks, 2026-09-24).
- The 206-tile checkpoint gap closes: a checkpoint on the Drowned Ossuary's west pier, where the galleries drop you.
- Rule S: five placements (S1), six real jumps of 3 tiles with two over poison (S2), the Rotten Bridges as the exam (S3),
  checkpoints 40-100 route tiles apart (S4), a free heart per two checkpoints and none in the exam (S5).

## Measured before and after

Pilot (7 heroes, refill, 150 s, 3 seeds), the play-bot walk per section, curve.mjs INDEX, captures in `work/burial2/`.
