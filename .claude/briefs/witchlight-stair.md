# THE WITCHLIGHT STAIR — new level brief (queued AFTER the Burial rework; agreed with Daniel 2026-09-21)

## What Daniel asked for
"A level in-between the burial caverns and the mage's folly as a run up to the tower." He chose THE WITCHLIGHT STAIR
(over THE MAGE'S GROUNDS and THE OBSERVATORY ROAD), approved THE HEDGE WARDEN as its mini and THE GATE GARGOYLE as its boss.

## Where it sits
`{ id: 'witchlight', name: 'THE WITCHLIGHT STAIR', needs: 'burial' }`; THE MAGE'S FOLLY then `needs: 'witchlight'`. On the
map between the Burial Caverns and the Folly on the inland road. Music: an existing CC0 track until it has its own.

## The level
A switchback road up the tower's hill at dusk, about half of it vertical; the tower in the backdrop grows at every bend
(a parallax layer that scales/raises with progress). Out of the dark caverns into open dusk sky: the contrast is the point.
- **LOOSE MAGIC (the level's mechanic)**, the Archmage's failed spells leaking down the hill:
  - floating stone slabs that drift (movers), some solid, some CRACKED (they break under the boss, see below);
  - rune fields that lift you (vent-style columns);
  - gravity glyphs that flip gravity briefly (the Folly's glyph/flip verb - a preview of its turned-over rooms).
- **Enemies**: what got out of the tower (imps, runaway brooms, animated armour) and dead that followed you up from the
  Burial Caverns. GARRISON row + no blanket calm; ELITES row; target 3.5-4.5 foes/screen (vshape for the vertical parts).
- Standard kit: checkpoints, signs, 3 silvers, dead ends paid, deco from the mage/village allowlists.

## THE HEDGE WARDEN (mini, halfway up, at the garden gate)
A giant topiary knight. You cut him down and he REGROWS: cutting reduces him to a stump that re-grows over a few seconds
unless the stump is dealt with (design detail for the build session: e.g. finish the stump while it regrows, or burn/root it
with a nearby prop). Needs his own tells (`!`/red ✕), touch rule, a player-made opening, new baker.

## THE GATE GARGOYLE (boss, the top of the stair)
A huge stone gargoyle bolted over the tower's outer gate, woken by the loose magic. Arena: the stair's top, broken into
FLOATING SLABS that drift slowly - some solid, some cracked.
- **STONE DIVE** red ✕ — rises out of sight; his shadow marks the slab he lands on. Get off it.
- **WING GUST** `!` — a blast that shoves you toward your slab's edge; blocking braces you in place.
- **RUBBLE SPIT** `!` — three chunks of masonry in a spread. Block or jump between.
- **GLYPH FLARE** red ✕ (no damage) — lights a gravity glyph under one slab: 3 s of falling UP onto its underside. He likes
  to follow it with a dive while you are upside down.
- **PERCH SHRIEK** — from the gate; 2-3 imps pour out of the tower windows (cap adds).
- **THE OPENING (player-made):** stand on a CRACKED slab and dodge his dive late: he smashes through and hangs by his claws
  from the broken edge - ~3 s, double damage. Landing on a solid slab opens nothing (tools/boss-openings.mjs must prove it).
- **PHASE 2 (<50%)**: slabs drift faster; dives come in pairs; every Glyph Flare pairs with a Wing Gust; cracked slabs
  never regrow once broken, so each opening used is gone.
- Touch rule (landing beside him never hurts), one clear answer per attack, new baker, pilot >= 21 runs at normal health.
- Falling off a slab: define it in the build (a lower slab/ledge to land on with a climb back, not a death pit).

## Build order (one session, KICKOFF credit rules)
1. `tools/witchlight.mjs` first (built + reach + page), in check.mjs. 2. The level + numbers. 3. Loose magic (reuse movers,
vents, glyph flip). 4. The Hedge Warden. 5. The Gate Gargoyle + opening + pilot. 6. ONE `npm run check`, commit, push,
deploy, verify. Likely too big for one session: if so, split as level+mini, then boss.
