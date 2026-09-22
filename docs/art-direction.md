# BRACKEN's art direction: the rules, measured (2026-09-22)

Measured from the game's own screenshots (`docs/audit/sheet-*.jpg`; `python tools/art-rules.py` re-measures them), comparing the levels
that look finished with the ones that look like placeholders (`docs/visual-audit.md`). Every rule below is what the good levels already
do and the weak ones don't. **New art should pass them before it ships; so should anything redrawn.**

| | best levels (14) | weak levels (13) |
|---|---|---|
| value spread (L* from the 10th to the 90th percentile of a screen) | **42.6** | 30.8 |
| separation (the ground band against the backdrop band, L*) | **9.6** | 4.8 |
| chroma (median saturation) | 10.8 | 9.2 |
| warmth (share of warm pixels minus cool) | **0.0** | -0.14 |

## The rules
1. **A day screen spans at least 35 L\*.** Its darkest ground and its lightest sky are far apart. The weak crag levels sat at 27-38 on a
   single dusk purple.
2. **A night or interior screen may span 22-30 L\*, but it must carry POOLS OF WARM LIGHT** (lamps, fires, windows): Underleaf, the
   Stockade and the Lamplit Street look good at 22-29 because their lamps do the work. A dark screen without them reads as murk
   (the Keep, the Deep, the shops, Highcrown).
3. **The playfield stands off its backdrop by at least 6 L\*.** The ground, ledges and foes live in one value band and the backdrop
   in another. Day: the backdrop lighter and hazier (less saturated) than the ground. Interiors: the back wall darker than the floor. The
   best levels average 9.6, the weak 4.8; the Flotilla and the Long Water, the two best-looking of all, 24-27.
4. **Median chroma of at least 7.** Below it a screen reads washed out: the Monastery (5.3) is the case.
5. **Every cool level gets a warm accent, and every warm level a cool one.** One temperature everywhere is flat. The weak levels lean
   cool (-0.14) with nothing to answer it.
6. **Light comes from above and the west.** Lit top-left edges, shaded bottom-right: tiles, props and sprites. (The redress sets and the
   foe redraws already follow it.)
7. **Characters are outlined; scenery is not.** Foes and heroes carry the dark outline (`OUT`); scenery outlines are removed
   (tools/readability.mjs already asserts this). The outline separates a character from anything behind it.
8. **A foe must not vanish into its level.** No more than 45% of a level's backdrop within 12 L\* of a foe's body; where it is, the
   level bakes a contrast rim (`src/contrast-rim.js`, `docs/sprite-quality-audit.md`).
9. **A size ladder.** The hero is ~16-18 px tall. Common foes 10-26 px, elites a head taller, minis 32-48, bosses 48-80. A boss that is
   not twice the hero's height does not read as a boss.
10. **A tell is bigger than its blow.** The wind-up pose opens the silhouette (arms up, weapon back, a lit accent in the house mark's
   colour); the strike can be quick and small.

## Held against the new art
The redress scenes, measured the same way (`docs/crag-redress.png`, `docs/redress2.png`): the Scree Path, Stormhold and the castle go from
3-7 separation to 14-22. The rules caught four of my own first passes, now fixed: the Hanging Village was washed out (spread 14 -> 30,
separation 8 -> 23 with a warmer, darker rock under its pale morning), the Undercrown colourless (moss, rust-red roots, lamp pools),
Highcrown's hall cold all over (dithered torchlight pooled under the banners), and the forest store's floor the same brown as its wall.
