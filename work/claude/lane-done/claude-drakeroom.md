# DRAKEROOM (sonnet, art polish) - claude/drakeroom from claude/drakeart (+ cherry-pick of drakeart 78cb9da3, the unpushed noFg/noNear palette commit). Not merged, not deployed.
## Changed
- src/redraw/caldera_tiles.js (new, px.js): THE CALDERA tile kit - black basalt floor (chipped lit lip, ember cracks through the top, strata + ember seams in the body, darkening with depth), columnar-basalt pillars / lintel / far wall (6 px prisms, joints, a few ember seams, chipped cap), basalt ledge slabs with a glowing underside, and the 6-row door wall (sealTile). Collision untouched (same grid).
- src/main.js: hooks only: tile loop (`L.drakeLab` SOLID/ONEWAY -> CALDT.caldTile), setWall (door slab = basalt, no more forest thorn wall), import; DCA/POSE import + SPR.firedrakeCard; BEASTS entry, BOSS_T, BEAST_SHORT; beastSeen('firedrake') when the fight runs.
- src/redraw/fire_drake_set.js: the back wall is now rough-cut basalt blocks in staggered courses with ember seams in the joints (it was vertical boards = read as a plank wall).
- src/redraw/fire_drake_art.js: bakeDrakeCard (walk + breath windup, 66x40) for the bestiary.
- tools/fire-drake-hands.mjs: the "no beastSeen / card yet" assertion now asserts the card + beastSeen exist (the drake is still in no rush row, on no road).
## Checks
node: fire-drake 78 ok, fire-drake-hands 289 ok, fire-drake-art 26 poses 0 bad; node --check on all changed. One headless browser (4 GB free, no flags): scratch/lane-reports/drakeroom-{caldera-sleep,wake,walk,breathTell,claw}.png - no grass, no wood, no moss; zero page errors.
## Owed
- Bestiary page shot (card draws via SPR.firedrakeCard; not screenshotted). Ember cracks on the floor are subtle at 1x - bump glow if Daniel wants it hotter. Hot-seam on the door slab is only the generic column seam.
## Questions (rec first)
1. Merge drakeroom with drakeart/drakewire together (they stack)? REC yes.
2. Float the caldera tile kit to the Heart of the Mountain level when it lands? REC yes: it keys on L.drakeLab; give the Heart level the same flag/hook.
