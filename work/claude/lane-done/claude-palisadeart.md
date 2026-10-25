# claude/palisadeart - THE PALISADE WOOD + THE BATTERING BEAST: ART PASS (sonnet)
Base claude/palisadewood c74f5ef0. Art only: **level hash 6060af42a578 unchanged** (tools/palisadeart.mjs asserts it). Not merged, not deployed.

## DRAWN (new src/redraw/palisade_{pal,tiles,backdrop,world,foes}.js, battering_beast_art.js; hooks in main.js, palisade-hands.js, battering-beast-hands.js, audio.js, palisade-wood.js non-hashed data)
- PALETTE: autumn loam under russet/rust/gold leaf litter; fresh-cut honey timber vs seasoned brown; hemp rope + one rust red; five places crossfading (edge, yard, scaffolds, gatehouse, gate).
- TILES: earth (leaf-litter lip, acorns, chips/straw in the yard, churned clay + ruts at the gatehouse, roots, stones); THE PALISADE wall = standing logs 4 a tile, lashings, wale rails, cap board, raw cut ends; gatehouse/tower = hewn beams with notched log-ends + iron straps; stumps with rings; scaffold DECK boards (nails, joist, rope, cut grain); LOOSE boards (cracked, gapped) for the level's crumbles. TIMBER table lies on the level's solid blocks (checked).
- BACKDROP: own sky + sun + light shafts, far/mid autumn crowns in 3 families, THE PALISADE LINE (ragged stakes, gaps, lattices, roofed / half-built / crane towers), THE HALF-BUILT GATEHOUSE landmark baked at 3 sizes, growing as you come, live rust pennant + smoke; mid props per place (stumps, wood-piles, fruit tree, stake pyramids, tents, carts, scaffolds, cranes, trebuchet, ram-shed, banners, vine-grown old gate); near trunks + gold motes; russet bracken foreground.
- RULE MACHINES (palisade_world.js): THE PROP (fresh shore, iron head, rope turns + line to load, big outlined WEDGE, shivering strain marks, gold glint; knocked = shore on its side, wedge kicked out); scaffold section -> steps of stacked log-ends; watchtower topples into a rope-railed log bridge; crew walkway; stake stack on a rack (rolls/turns/scatters); stake wall (lashed, mound, cracks, lies when down); dashed gold result ghosts; plank banner; 5 harvest props.
- PEOPLE: STAKE-SETTER hand-drawn (own 8-frame sheet: raise = mallet overhead + shout, drive = mallet on a stake, hurt), LANTERN-HAND (the rock goblin throws a lit LANTERN, not a stake - named for what the code does) and MAUL CREW, each with a bestiary card and a body in its own skin.
- THE BATTERING BEAST: armoured aurochs, riveted lames, chamfron, iron horns, gantry + two handlers + chained ram; 17 baked poses lazily memoised (every told move windup/release its own picture, cut-harness variant with no ram/handlers, P2 gold buckle glint live), body he leaves, bestiary card, the old forest gate, the palisade end, two scaffolds with the prop, wreck, stumps. Drawn at 0.74 studio scale so he fits the fight's 56x40 box.
- AMBIENT: own 'palisade' synth bed (saw, axe, mallet, rope, timber; no horn/drum). Fixes ambient-landmarks, which was RED on the greybox (it played forest).
- Also: level tint/haze lightened (non-hashed), L.reskin table, palette.fg bracken.

## CHECKS (PORT 6450)
palisadewood green; palisadewood-probe green (0 page errors); NEW tools/palisadeart.mjs all green (registered in check.mjs, own line); level-quality palisadewood PASS (hash unchanged, pilot 13 blows/0 deaths, curve 118%/1 death, mash 0/6); corpses (palisadewood added to its list) ok - all three reskins die in their own skin; skins ok; one-new-foe ok; solid-islands ok; foe-pass ok; ambient-landmarks ok; textfit bestiary 318 + plates 24 + levelcard palisadewood: all 0; mobile-perf 4x CPU 915x412: edge 54, yard 47, wall top 50, gatehouse 51, arena 56 fps (worst frame 88 ms at the yard; budget >= 40).
Not run: the full suite, boss-fight-end page tool, textfit all scopes.

## PNGs work/claude/lane-done/
before = palisadewood-*.png (greybox), after = palisadeart-*.png (same 22 shots, same spots): edge, edge-ramp-after, crew, yard-stakes, yard-tower(+after), setter-wall, scaffolds, wall-ramp-after, wall-top, unbuilt-span, gatehouse, gate-passage, beast-{walk,chargeTell,charge,sweepTell,sweep,volleyTell,trampleTell,stuck,loose}.

## SELF-GRADE: B
Why: one coherent autumn palette, own tile kit, landmark visible from frame one, every rule machine and told beast move drawn and readable, three foes + card + body each. Why not B+: scaffold posts still the shared default timber posts (no 'pwpost' kind), handlers are only ~5 px at fight scale, no new music, mid-layer props repeat, the P2 harness-break set piece and the beast's death body were not eyeballed in play, ground below the lip is a plain dark mass.

## QUESTIONS FOR DANIEL
1. The "stake-thrower" actually throws lit lanterns (burn where they land). Built: renamed LANTERN-HAND in art/card. Rec: keep, or have a gameplay lane make them throw stakes.
2. Beast fits the old 56x40 hitbox by scale (0.74). Rec: keep; a retune lane may widen the box if he reads small.
3. Music still placeholder (needs your CC0/CC-BY pick).
