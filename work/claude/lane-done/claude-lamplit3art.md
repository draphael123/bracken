# claude/lamplit3art (sonnet) - THE LAMPLIT STREET 3: the ART pass (everything claude/lamplit3 drew as greybox)

Base: origin/claude/lamplit3 b3c7277b. Art only: the grid (geometry hash) is unchanged; the level.js data changes are metadata (ledge kind names, `lpBarriers`, the stalls' deco kind).

## 1. WHERE THE WOOD WAS (the real find)
Daniel's "I still see the wood platforms" had a second source the build lane did not touch: **src/route-art.js drawRouteSupports** stood a plain TIMBER POST (brown, with a cross-piece) under every
loose ledge of the level (island-posts adds them for `lamplit`). Those posts are now `kind: 'lpiron'` (src/island-posts.js, one expression) and drawn by `lpSupportDraw`: a dressed stone pier under a
cobbled lip / quay step, a fluted cast-iron column (collar, flared head with rivets, bolted base plate) under a balcony / awning / gantry; none under a crossbar (the lamp standard's own post holds it).
The fish stalls' poles + table were the generic deco `stall`: now an iron-poled stall on a stone slab (`lpStall`, src/redraw/lamplit3_barriers.js).

## 2. WHAT WAS DRAWN
- **Tile kit (src/redraw/lamplit3_tiles.js)**: cobbles (wet highlights, mortar, a drip); NEW `step` = stone canal step (chamfered lip, tide line, weed, mooring ring; laid at the courtyard steps 471 and 521 in level.js);
  balconies (cast lace under the beam, scroll brackets with a curl, gusset plate and wall plate with bolts, plus a drawn HANDRAIL with balusters, scrolls and finialled newels behind the deck: lpRailDraw);
  awnings that SAG (more cloth in the middle of a span, tassels, pull folds); crossbars (collar where the post meets the bar); gantries (gusset plates and bolts at the truss nodes); the gantry CRADLE
  (an iron cage deck with shackle plates, its own maker); tar net (knots catching light, a cork float, a rod); the lamp standard post (fluted, skirt, plinth with bolts).
- **Barriers as landmarks (src/redraw/lamplit3_barriers.js, `L.lpBarriers`)**: THE MARKET HOUSE (cornice with dentils, three storeys of iron-shuttered blind windows with silt-glint slits, quoins, a carved FISH relief over an
  iron roller-shutter shopfront with chain and padlock, an iron sign bracket); THE PROCESSION WALL (coping, pilasters, two friezes of hooded lantern-bearing mourners, a memorial niche with a carved lamp, tie-rod stars);
  THE WORKS: the east wall in brick with a voussoir lintel, a dressed SILL (the lit walking lip of the window), the old DOOR bricked up under it (arch, paler infill, hinge ghosts, lock plate); the west door under a riveted iron lintel with a chalk tally; the roof as a riveted plate girder (lightening holes, joint plates).
- **Fire verbs (src/lamplit3-art.js, called from lamplit-fire.js)**: oil in four states (puddle with rainbow film and glint, grated stone GUTTER, slick FLOATING and lapping; CATCHING = small blue creeping flames; BURNING = four-tone flame tongues, embers, sparks, smoke, the fuse channel runs with fire; SPENT = char crust with a last ember and the gloss returning);
  the iron CASK (hoops, rivets, gauge glass with oil, stencilled flame, spigot drip; TOLD = red seams, steam, vent flame, shake, ring; BURST = fireball + flung plates); the VALVE (brass handwheel that spins, a gauge dial that shows the gutter's fill, flanged main);
  the TAR NET (a burn front climbing the mesh, burning tar dripping; when gone a charred rod, scorched threads, falling ash for 4 s); THROWN FIRE (a comet with a spark tail; lying: a fire licking up on a scorch mark that shrinks); the TOLD ARC (embers bright to dark, a flame glyph in the ring; a gold ring over a dead lamp; a grey cross for water).
- **Lit/dark look**: `LA3.poolDraw` (one line in main.js after the lamp glow): a wet warm oval + a shimmering streak reflection + cobble glints under every lit lamp, over the dark. The route lip, the near-black silhouettes and the existing lampGlow are unchanged.
- **THE WICKLING (src/wickling.js, six poses + burst)**: drift (teardrop flame swaying, wax stub on a melted foot, drip arms), snuffTell (leaning in, mouth working, the lamp's flame spiralling into it, swelling as it drinks), stealTell (crouched, arms flung back, flame flared with red spikes, narrowed eyes), dart (flame laid back as a comet), recoil (squashed, dim, ><), burstTell (swollen white, cracks of light, wide eyes, gaping mouth, sparks + ring); the burst gets a white core ring and a spray of white-hot wax. In the dark only the flame and its halo draw (the halo is a real gradient).

## 3. SELF-GRADE vs scratch/design-standard.md (A8 identity)
Was D/C (generic planks and logs, timber posts, plain blocks for the three barriers, greybox fire). Now **B+**: its own tile kit (6 ledge kinds + posts + barriers), its own palette (cold teal stone, iron, rust, tar), THREE landmarks in view (market house, procession wall, the works' window wall), lights (pools, oil fire, thrown fire, cask burst), no timber anywhere I could find.
Not an A: no ambient bed of its own was drawn here (outside an art lane's list), the stone and iron look still shares the city backdrop, and the lit/dark pass was reviewed on screenshots, not by Daniel.

## 4. CHECKS
node: tools/lamplit3.mjs green, tools/lamplit2.mjs green, tells ok, solid-islands ok, floaters ok, dangling-paths (the new files are clean; the only red is the existing batch100-integ.md -> tools/cast-poses.mjs, not this lane), frame-cost ok (0 read-backs in play).
visible-supports is REPORT-ONLY. Page: PORT 8743, one browser at a time, closed after each run; no page errors.
NOT run: textfit, mobile-perf, mark-integrity, boss-rates, readability (the TUNE lane's); scratch/memguard.ps1 (PowerShell script execution is disabled here; free RAM was 8 GB at the start).

## 5. SCREENSHOTS (in this worktree, uncommitted: work/claude/lamplit3art/)
- v3/ every section DARK and LIT: a-roof-start, b-net1, c-market-house, d-canal, e-awnings, f-loft, g-sealgate, h-works-west, h2-works-floor, i-works-window, j-wall, k-net3, l-arena (`<name>-dark.png`, `<name>-lit.png`)
- v2/ barrier and kit close-ups: m1-house-crop, m2-wall-crop, m3-works-east-crop, m4-works-west-crop, m5-awning-crop, m6-balcony-crop, m7-steps-crop, m8-gantry-crop
- v1/ fire verbs and the Wickling: f01-f06 oil states, f07-f09 gutter + valve, f10-f11 floating slick, f12 cask, f13-f17 tar net whole / catching / ash / bare, f18-f21 told arc / thrown flight / lying, w01-w10 the six poses, the burst and the dark-only flame
Tools: tools/lamplit3-art-shots.mjs (sections dark / lit / raw + crops), tools/lamplit3-fire-shots.mjs (fire + Wickling); PORT from the env; not in the suite.

## 6. TOUCHED OUTSIDE THE LAMPLIT FILES (small, for the integ merge)
src/main.js: the LP3B import + `lpDecoSet` in the deco table, `VH` in the fire ctx, `LPF.drawPools` after drawLampGlow, the Wickling burst's extra ring and spray. src/route-art.js (one branch, one import), src/island-posts.js (a kind on the push when `L.lpKit`). src/flame.js NOT touched (the thrown-flame drawing now lives in lamplit3-art.js; flame.js's drawThrownFlame is still there for other hosts).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Stone piers / iron columns under every loose ledge** (not the timber post). Rec: keep. Built. (This, not the ledge tiles, was the wood you were still seeing.)
2. **The fish stalls are iron-poled on a stone slab** instead of the generic wooden stall. Rec: keep. Built.
3. **The works' roof is a riveted plate girder, the east wall brick with the door bricked up.** Rec: keep (the lamp works read as iron-and-brick against the stone city). Built.
4. **Still timber-looking, not in this lane's list**: the swing chains are main.js's single grey line (the cradle deck is iron now; a link-by-link chain would be a small follow-up), and the signs are wooden boards (the generic `sign` prop). Rec: leave; say if you want iron plaques.
