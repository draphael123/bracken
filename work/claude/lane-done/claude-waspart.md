# waspart (claude/waspart) - real wasps, hornets, queen (Daniel 11-03)
ART ONLY. Same frame indices, hit boxes (wasp 10x7), timings, tells, hurt/white flash paths.
## Changed
- NEW src/redraw/wasp_art.js: hand-set pixel wasp (19x14 canvas) and hornet (26x18). Head / thorax / abdomen separated by a pinched 2-px-long one-pixel waist, pointed tapering glossy abdomen with a visible stinger, narrow 2-pair wings (3-beat flicker + hurt droop), antennae, mandibles, long dangling legs. Body is inked, thin parts (feelers, legs, wings) drawn over the ink so they stay hairlines.
  - WASP: slim, hard yellow/black, yellow face, black eye (replaces foes_v2 bakeWaspV2: frames 0-2 buzz, 3 hurt; anchor moved with the bigger canvas, box unchanged).
  - NEST HORNET: bigger, red-brown head + thorax, amber/black abdomen, big crossed pale jaws (cnSkin hornet in hornets_nest_art.js; box unchanged).
- HORNET QUEEN (hornet_queen_art.js, all 22 poses + card): same anatomy: thin petiole + gap, pointed banded abdomen (amber/black, lacquered glint, no fur), smaller smooth thorax with amber back stripe, narrower wings, long thin dangling legs drawn after the ink, heavier crossing jaws. Crown, red eye, venom/tell FX, tip/head anchors untouched.
- Swarm / queen cloak motes: bee-amber -> wasp yellow. Paper nest + resin untouched.
## Checks (all green)
hornets-nest.mjs 267 ok; attack-animation ok; boss-read ok; tells ok; foe-pass ok. ability-poses = hero abilities, no foe coverage, not run. Browser run one at a time, RAM >= 4.8 GB free.
## Evidence
scratch\lane-reports\waspart\waspart-sheet.png (before top two rows / after bottom two rows: wasp, hornet, queen poses); before-/after- wasp, hornet, queen .gif in the same folder; dev-sheet.png = every frame at 8x. Tools: tools/waspart-sheet.mjs, tools/waspart-shots.mjs.
## Questions (recommendation built)
1. Amber Hornet (honey-hornet heavy), comb drone, nest-guard, stinger hornet are NOT redrawn (not in the brief). They are still the round-barrel look. Rec: yes, a follow-up pass post-demo (they are hornet-family, same anatomy).
2. Queen keeps her red eye (a tell/readable). Rec: keep.
3. Hornet sprite is larger than before (26x18 vs 16x11) though its hit box is unchanged. Rec: keep (reads "bigger, heavier").
