# DRAKEART (lane D2, sonnet) - claude/drakeart from claude/drakewire 1ccb3af9. Not merged, not deployed.
## Changed
- src/redraw/fire_drake_art.js (new, px.js, node-renderable): the drake, 26 pose sprites (every POSE mode; windup != release proven by tools/fire-drake-art.mjs): cooled-lava hide with ember cracks (white-hot on rise/tell), dorsal plates, belly plates, bat wings (fold/half/spread/beat/tucked), long neck with iron COLLAR + ring (chains meet it), horned head with jaw/teeth/throat-fire, barbed spade tail (raised+rattle, swept, trailing), per-pose legs (raised claw, swipe, both high, slam, tucked in air), chain links in the teeth (sweepTell), snapped links (beaten), collapsed (down), onSide (jerked).
- src/redraw/fire_drake_set.js (new): 4-stage demon SEAL (rune ring, sigil, ember cracks, split seam), linked iron CHAINS (slack sag / taut white-hot), scorched RING with iron posts, basalt LEDGES, VENTS (cracked mouth -> lava geyser), magma CREST, and THE CALDERA BACKDROP (black sky, far cones with lava, basalt wall, rising ash).
- src/fire-drake-hands.js: drawBoss draws the sprites (greybox kept as fallback), S.collarPx/jawPx from the sprite; drawOver uses the set. src/main.js: backdrop hook (L.drakeLab) + no near trees there. src/drake-caldera.js: palette near 'none'.
- src/audio.js: 20 drake* sounds (roar, strain, chainSnap, clawTell, claw, rattle, tail, chainGrip, chainSweep, inhale, breath, chains, lunge, twang, takeoff, wings, dive, slamTell, slam, vent) - SOUND in the hands picks them first, one per move.
- tools/fire-drake-art.mjs (sheet + checks), tools/fire-drake-art-shots.mjs (page shots).
## Checks
fire-drake 78 ok, fire-drake-hands 296 ok, fire-drake-art 26 poses 0 bad; node --check on all changed. One headless browser (6 GB free): page loads drakelab with no errors; proof drakeart-*.png in scratch/lane-reports. I ran tools/audit-audio.mjs by mistake (page tool): its page crashed (Inspector.targetCrashed), nothing left running; re-run owed.
## Owed
- Wing-beat/walk animation motion check in real play; hit-flash shot; P2/P3 (vents, crest, ledges) shots; audio-audit rerun; mobile-perf of the backdrop.
- Floor/wall TILES in the caldera are still grass/dirt (dress 'none'): a basalt tile kit is a separate pass. Bestiary card + beastSeen still wait (art-before-live now satisfied for the sprite; card is a follow-up).
- Sounds are synth only (no sample pools); a Kenney/clip pass could layer them.
## Questions (rec first)
1. Ship the caldera floor tile kit as lane D2b? REC yes (Sonnet), before the Heart level uses it.
2. Bestiary card for the drake now? REC yes, small art lane after merge.
