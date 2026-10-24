# claude/hangpolish: HANGING ROPE POLISH (art only)

Branch `claude/hangpolish`, worktree `bracken-hangpolish`, base claude/hanging3 efe2cbb4. Not merged, not deployed.
ART ONLY: src/level.js is untouched (level hash unchanged), no AI, timing or collision change. Files: src/hanging-ropes.js (the art block), src/chars.js (3 new Owl Reeve frames), src/main.js (2 frame indices).

## What changed
- **Red-and-gold knots**: bigger wrap with a dark rim (reads as a block of colour at phone size), plus a gold PENNANT on a staff above the cleat (the silhouette).
- **Spent knots**: a dull loose wrap, no gold, no flag, a CUT STUB standing up off the post with a pale cut face and frayed fibres, and a tail of the wrap hanging with a frayed end. Every cut rope also shows its other end frayed: the net's hook stub, the net's falling rope, the bridge head, the deck's tie, the seat's tie, the perch ropes (a stub on the eye and a stub that falls with the plank).
- **Gold-dot result preview, tidied**: the landing is a ring of evenly spaced gold dots with corner ticks and a faint wash; the arrow is gold dots marching toward a solid head (no more crawling dashes).
- **Cargo nets**: a knotted diamond mesh (knot at every crossing) over crate and sacks, a bellied bag, a hem rope, gathering lines to a ring, and an iron hoist hook on a short beam.
- **Swing bridges**: standing: nailed slats, doubled rope rails, a head beam and a two-line bridle with a shackle, a slight sway. Swinging: two faint trails of where it just was. Down: end posts with caps, a sagging rope rail with ties to the boards, and a belly rope under the boards.
- **Counterweight decks**: burlap sandbag (woven dither, stitched seam, patch, neck twine, ring and shackle); a pulley frame (top beam, a spoked wheel that TURNS with the deck's travel, a guide wheel over each rope, a yoke); the rope run over the top; the deck is planks on a hanger beam, end posts, bridle and ring.
- **Pulley line**: capped posts with stop blocks and lashings, a two-strand taut line, a trolley (two wheels, plate, ring, hanger ropes), sparks off the line while it runs, a seat beam and end posts.
- **Perches and ledges on ropes**: an iron eye at each rope's head, a lashing round the plank, a slight sway.
- **Owl Reeve**: new frames 17-18 (SAW: head down, the strand held in her beak, the sails half open, the head works left and right), 19 (FALL WITH HER PERCH: sails thrown up, beak wide, torn feathers). `ropeTell` now alternates 17/18; `perchFall` uses 19. Her P2 cut also draws the fray at the rope: the rope thins, fibres fly, the nick goes in, over the red told ring (the tell is unchanged).
- **Perf**: the static pieces (sandbag, deck, knot, net, wheel) are baked once into their own canvases and blitted; ropeLine is batched into three fills.

## Pictures (work/claude/lane-done/hangpolish/)
`before-*.png` (hanging3's own after shots) and `after-*.png` at the same spots (net-roots, bridge-rope, net-market, bridge-wind, cw-trunk, line-rook, net-cutter, stair-remix, crown, plus `-cut` and the owl set). Zooms: `after-zoom-*.png`, `after-owl-saw-zoom.png`, `after-owl-frames-0-4-3-saw-saw-fall.png` (frames 0, 4, 3, then 17, 18, 19).

## Checks (single runs, this branch)
Green: hanging-hoist, hanging-hoist-walk (knight, warden, pyro), hanging-exam, owl-lamps, owl-swoop, owl-gust, level-quality hanging (clears the bar; level.js untouched), textfit bestiary --strict (315 screens, 0 problems).
mobile-perf at 4x CPU, headless on a loaded PC (noisy): hanging level 52-54 fps; the Reeve's arena 28-37 fps and the crown door 34-47 fps. Baseline hanging3 measured at the same spots in the same minutes: arena 25-40, crown door 40. So polish is equal or a little lighter than baseline; the arena sits under the 40 line in these runs on the baseline too, and hanging3's own report (crown 50.6) was taken on a quieter PC. Worth a re-measure on a quiet PC before BATCH119.
Not run: tells, cast-poses, boss-read (no logic changed, only the frame index).

## Self-grade: B
Knots, nets, bridges, wheels, sandbags and cut stubs are clearly better and the pennant reads at phone size. The saw pose reads (head down, strand in beak) but the head dropping onto the chest is a little cramped, and it is a 2-frame loop rather than a full animation. Nets are a blob at 32 px (the mesh is felt more than seen). A standing bridge is still a ladder on end. Below B+ because of those and the unresolved arena fps number.

## QUESTIONS FOR DANIEL
1. **Arena fps**: the Reeve's arena is 28-37 fps at 4x throttle here (baseline similar). Rec (built): leave it, it is the boss scene, measured on a loaded PC. Alternative: a perf lane on the arena's parallax and lamps.
2. **Standing bridge reads as a ladder on end.** Rec (built): left as is, it works as a tell. Alternative: draw it as a solid plank wall with side ropes.
3. **Pennant on every knot** is a new silhouette. Rec (built): keep, it is what makes the knot readable at phone size.
