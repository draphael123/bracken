# THE GATE GARGOYLE, ROUND THREE: THE SPIKES, THE STOMP AND THE WIND (brief, 2026-09-27)

Daniel's design, all decided:
1. FIRE BREATH attacks (told, readable, dodgeable).
2. The arena floor is SPIKES. MANY MORE platforms than now.
3. He DIVES at the player; if he crashes down THROUGH a platform he lands stunned on the spikes. Broken platforms REGROW after a
   few seconds.
4. He is INVULNERABLE except then: while he is stunned on the spikes the player must JUMP ON HIM (stomp) to deal damage. After the
   stomp, WINDS carry the player back up and the boss resets.
5. A player who falls onto the spikes takes ONE hit and wind tunnels carry them back up.
6. The REGULAR gargoyles in that section of the level work the same way (they fall into spikes; the player stomps them).
7. Redesign that section of the level for this and make it about 2x as long (the level design guide + rule S).

## How it is built
- **The spiked moat and its winds** (`src/spike-winds.js`, `L.winds`): a stretch of spiked floor with rune-lit WELLS streaming
  loose magic. A hero whose body reaches a zone's spikes takes ONE bite (a fifth of his health, never the last point - the Ore
  Road's pit rule) and the wind carries him up, then along, to the nearest exit AT OR BEHIND where he fell (in the Gargoyle's room:
  the nearest slab standing). A stomp on something stuck on the spikes bounces him and the wind takes him with no bite.
- **The Gargoyle** (`src/gate-gargoyle.js`): stone (`gargTake` is 0 for every blow, burn and shot) except a STOMP while he is
  STUNNED on the spikes, which takes `GARG.stompDmg` (a fifth: five stomps). Attacks: the STONE DIVE (red), the FIRE BREATH (yellow:
  he hangs level with you to one side, a dotted line follows you and SETS for its last quarter-second, then a jet along it that a
  slab stops and a shield takes; in phase two it chases you as it burns), the WING GUST (yellow), the GLYPH FLARE (red), the PERCH
  SHRIEK (whelps). The rubble spit is gone - the fire replaced it. Left late, his slab breaks, he crashes onto the spikes, stunned
  3.5 s; stomped, he RESETS (up over the slabs, untouchable) while the wind lifts you. Slabs grow back in 4 s (5.5 in phase two).
- **His room**: 44 tiles, spikes the whole floor, THIRTEEN slabs in two tiers (seven five rows over the spikes, six three rows
  above them over the gaps below); no rune columns (nothing stands on spikes).
- **The whelp** (`src/gargoyle-whelp.js`, `updateWhelp` in main.js): stone everywhere (`whelpTake`), it dives at you and on,
  THROUGH one-way ledges and slabs (a CRACKED ledge breaks under it and grows back in 4 s), then DROPS; on the spikes it sticks,
  stunned, for 3.2 s, and a stomp breaks it; on stone it only lands. Either way it flies home and hardens.
- **The battlements** (c 333-532, was 333-432): taught (a whelp over a cracked ledge above a shallow spike trench), developed (the
  moat's narrow ledge between two whelps), twisted (THE CRACKED CORNICE: the route itself is cracked ledges a whelp breaks), combined
  (THE RUNE TOWER: a rune column up to the high cornice and down past two whelps), examined (the gatehouse roof). Checkpoints at 336,
  395, 452, 495 (the exam) and 540 (outside the arena). Everything from the lip on moved right by 100.

## Proof
`tools/gargoyle-stomp.mjs` (new), `tools/gargoyle-smash.mjs`, `tools/whelps.mjs`, `tools/witchlight.mjs`, `tools/boss-openings.mjs`;
the pilot (`tools/gargoyle-pilot.mjs 1 --heroes knight,pyro,pirate`) before and after.
