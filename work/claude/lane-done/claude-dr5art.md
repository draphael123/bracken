# claude/dr5art - DEEP RAILS 5 ART (Sonnet lane, off claude/deeprails5 5b0442f1)

Art-only. Level, boss and tuning numbers untouched (level-quality minecart reads the SAME numbers as the DR5 report: pilot 38 blows/4 deaths, curve act 2 207%/5 deaths, mash 0/6 - no hash moved).
Pictures: work/claude/lane-done/dr5art-shots/ (tools/dr5-art-shots.mjs makes all of them: PORT=8934 node tools/dr5-art-shots.mjs <tag> [names]).

## BUILT (art list items 1-6)
1. SPARE CUTTER - src/redraw/deeprails5_art.js windupPose5('cutter'): a mounted lattice boom with the spin-up bank's red pivot gear, the disc glowing and throwing sparks as it winds up; cutterDisc is now a toothed saw (16 teeth, lit sweep, bolts, spark trail), gold with a speed ring when STRUCK BACK.
2. RAIL CLAW - windupPose5('claw'): winch drum + chain paying out, hooked three-prong claw head, bite sparks on the rail; tearMark: red column + chevrons + end brackets over the stretch; tornRail: curled bent rail ends, snapped sleeper stubs, timber splinters in a black gap.
3. FOREMAN's LOADING BOOM - fmBoom: pivot post, braced lattice jib, circling hook on a cable, a red flashing sweep line along head height; the swing is the jib down to a hook BLOCK at head height with a swept-air trail. TIPPED ORE - oreLump: a turning rough lump with gold/copper-green flecks, shadow and dust trail.
4. PARKED-CART GATE - cartGate: hinge + catch posts with lamps (red blinking / green open), a red-and-gold striped barrier arm with dropped bars, padlock; it SWINGS UP over 0.45 s when you land. Jump-in moment: boardBurst (ring of gold sparks + dust off the tub), the hero's tub dips 1 px for 0.16 s, clank + leverClunk (existing).
5. SPOIL PITS (src/redraw/minecart_tiles.js + hands): spoil HEAP tile (tailings mound, lit crest, broken pit-props splintered ends up, rope rag); PIT FLOOR tile (slime bed, fallen props standing, pale tips, bone); PLANK catwalk deck (three planks, strap, lit toe-board); coursed rock PIER cap and shored pier faces; CATWALK TRESTLES (pitTrestle: bents every 3rd plank, cap beam, straps, sill, cross-braces) drawn down to the pit floor or the low walk; LANDMARK spoilTipple: a head-frame tower with turning wheel, hopper, tipping skip, lantern, and a conveyor gantry hung from the roof (belt with lumps crawling up it) running back over the whole exam - the tower stands past the last pier, beside the cart.
6. SOUNDS (src/audio.js, 4 new synths): cutterWhine (spin-up saw), clawTear (iron screaming off sleepers), boomSwing (creak + whoosh + hook clink), oreTip (rock pour and rattle). Wired by renaming the sound CUES only: src/great-drill.js cutter tell 'whine' -> 'cutterWhine', claw tear 'rock' -> 'clawTear'; src/foreman.js boom release 'lurch' -> 'boomSwing', ore lump 'lurch' -> 'oreTip'; mapped in great-drill-hands.js SOUND and minecart-hands.js (each falls back to the old sound).

## CHECKS (PORT 8934, one page at a time, beside the suite)
GREEN: minecart.mjs 524 | audio-assets (every SFX call resolves) | level-quality minecart (same numbers) | corpses | boss-openings (exit 0)
Others: see the final message (textfit hints,boss scoped; mobile-perf).
Not run (not asked / not present here): cast-poses (no such tool in this tree); reach-heroes, stuck, mark-integrity (art-only; mark-integrity is the DR5 report's pre-existing red).

## SELF-GRADE: B
Matches DR4's depth (lattice booms, banks-in-colour, B16 windups each their own pose) and the pits now read as a place (timber trestles, coursed piers, a tipple landmark). Not an A: the pier MASS under the walk is still the smelter's busy slag rock (a calmer pit-zone rock kit would be better), the claw/cutter are small on the rig and best judged in motion, no new hero-cart frame for the dip.

## QUESTIONS FOR DANIEL (rec first = what is built)
1. The tipple's conveyor hangs from the roof and runs over the whole exam as one landmark. Rec: keep. Alt: a second, smaller tipple at the area's entry.
2. The pit piers use the existing smelter slag rock (zone 6) with a coursed cap. Rec: keep for now; Alt: a new calmer 'spoil' rock zone for 970-1069 (backdrop + tile kit).
3. Sound cues renamed (4 new synths, no new files). Rec: keep the synth; Alt: lay clips over them like DR3's REC table once Daniel picks takes.
