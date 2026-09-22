# Sprite quality audit, 2026-09-22: do the foes READ, where they are met?

Measured in the game (this branch's copy of the live code) for all 133 foe sets met in the campaign: each foe's body lightness (CIELAB
L*, the median of its non-outline pixels), and against the backdrop of every level it is met in (from the visual audit's screenshots,
the play band) its CAMOUFLAGE: the share of that backdrop within 12 L* of its body. Also size at 1x, colour count and outline coverage.
Weighted by how often each is met.

## What it found
- **23 of 133 foes blend in (camouflage > 45%), and they are nearly all DARK bodies (L* 23-36) on the dusky and cave levels**: the
  Falling Tower, the Keep, Stormhold, the Scree Path, the Reef, the Causeway, the Lamplit Street, the Mage's Folly.
- 9 are flat (fewer than 5 colours: the wight and the wasp are redrawn in `foes_v2.js`), 2 tiny (the bat, redrawn), 2 have soft
  outlines (the boo and the haunt: ghosts, soft on purpose).
- **Checked by eye** (`docs/audit/camo.png`, each foe on its worst level at 3x): the number over-calls sprites with a strong outline and
  light details (the bone corsair, the harpy, the angler, the feeler read fine in place). **Genuinely hard to see: the bat in the Falling
  Tower, the snuffer on the Lamplit Street, the lamprey in the Keep, the petrel on the Causeway; borderline: the spider in Stormhold, the
  urchin in the Reef.**

## The fix: a light rim, per level - `src/contrast-rim.js` (`docs/audit/rim.png`, before and after on those backdrops)
A one-pixel rim of light along the edges that face up (and the flanks, high on the body), just outside the outline, in a tint picked
against the level's backdrop (`RIM_TINT`: pale and cool on dark levels, a dark edge on pale ones). All six stand clear of their
backdrops with it. It is baked once per sprite set per level that needs it (`needsRim(bodyL, backdropHistogram) > 0.45`), so it costs
nothing per frame, and bright levels keep their foes as drawn. The game has a global `rim` setting (off by default); this is the
targeted version of it.
**Wiring:** on level load, for each foe type the level spawns whose camouflage there is over 0.45 (or from a table written once from
this audit), `SPR[t] = rimSet(SPR[t], backdropL)` for that level, restored on leaving it.
