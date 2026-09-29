# claude/orecolour - THE ORE ROAD colour pass

Palette and light only. No layout, foes, mechanics. Based on claude/winch4 (ed06821).

## Premise, verified in code
The audit was right: `src/ore-road.js` had a cold near-black dark (`rgba(4,4,10)` in main.js), the lamps only erased the dark (their pool was the grey rock a bit brighter,
no colour), every creature in the gloom got a cold `#b8c8d8` rim (the "pale ghost" foes), the default grade was a green soft-light, and the far-wall section tints
(`SECTION_TINT`) were nearly black. Measured with the audit's own method (tools/art-rules.py ported to `tools/orecolour-shots.mjs`, run in one page session, 15 places):
mean chroma **5.0**.

## What changed
- main.js (all opt-in via palette keys, so no other level moves): `palette.darkCol` (the dark's colour), `palette.darkRim` (rim colour/alpha/breath-back for creatures in the gloom), `palette.lampGlow` (new `drawLampGlow`: warm soft-light wash plus a small additive core per lit lamp/torch/forge).
- ore-road.js palette: warm brown-black dark, amber lamp pools, copper rim `#c8843c` at low alpha (foes read golden and capped, not ghost-white), copper grade, richer rock/dirt, warmer murk.
- Far walls per section, stronger: yard copper, span verdigris, tower steel blue, chute teal, collapse plum, steep indigo, winch amber, drum ember.
- Boss shaft: the Winchmaster's room dark eased 0.18 -> 0.12 (still <= 0.6 of the cavern's, ore-road check), amber pools from his three housing lamps and the drum house lamp. His layout and winch4's glowing skips are untouched.

## Numbers (chroma, median of hypot(a,b); before -> after)
yard 4.3->14.6, crusher 5.4->15.5, loading-house 5.4->14.2, first-span 3.3->8.2, sorting-yard 4.6->9.5, sorting-floor 4.2->8.3, tower-top 5.8->7.5, tipple-house 5.0->7.2,
collapsed-span 5.6->6.7, wreck-head 6.6->14.6, brakemans-hut 5.6->11.9, winch-house 6.0->13.0, drum-yard 4.9->12.8, drum-house 4.7->14.4, boss-shaft 4.0->11.7.
**MEAN 5.0 -> 11.3.** Spread 26.0 -> 31.0, warmth +0.01 -> +0.24, separation 4.1 -> 4.8. Captures: work/orecolour/before, work/orecolour/after (also try1-4 iterations).

## Checks (all green)
architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (unchanged, no rebase), npc-removal, readability, camera-fill, footing-art, ground-depth, render-layers, pixels, ore-road, ore-exam.

## UNVERIFIED
- No bot pilot run (palette/light only; the boss did not change). The Winchmaster's live-skip glow was not looked at mid-fight: it is drawn before the dark and the new glow is soft-light plus a small warm core, so it should still read.
- The three cool sections (tower, tipple, collapsed span) sit at 6.7-7.5, at or a touch under the 7 rule; the rest are 8-15.
- Separation is still low in several places (0-2 in winch-house/boss-shaft/tipple): the pass lifted colour, not value structure.

## QUESTIONS FOR DANIEL
1. The yard, crusher and drum end are now quite orange (chroma ~14-15, warmth +0.4) while the tower/chute stay cool. Want the warm ones calmed toward ~11? Recommend: keep, it is the mine's lamplight, but ease the grade from 0.12 to 0.09 if it feels heavy in play.
2. Separation (ground vs backdrop) is still ~0-2 L* in the winch house, tipple and boss shaft. A value pass (darker far wall, brighter floor edge) would fix rule 3. Recommend: a small follow-up lane.
3. The same opt-in keys (darkCol, darkRim, lampGlow) would give Burial Caverns / Undercrown their own warm pools. Recommend: yes, one line each, in a later lane.
