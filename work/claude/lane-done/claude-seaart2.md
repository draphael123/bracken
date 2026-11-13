# SEAART2 DONE - claude/seaart2 (off claude/whaleart 1fab58c87; pushed; no merge, no deploy; Deep 3 and Whale flags stay OFF)
Worktree LANES\bracken-seaart2. Code-only: no browser, node contact sheets only. Draw-only; sims untouched; the ONLY main.js change is one flag-guarded backdrop line (item f).

## Items
a DONE faces (src/redraw/drowned_crew_art.js headDraw): far eye in its own socket, nose cavity, cheekbone catch-light, a real teeth grin (open: teeth top and bottom), and a mark per role (cutlass red scar, shield gilt nose-guard, harpooner stitched mouth, heavy two tusks).
b DONE fused Sailor: three more skulls on the one body (cutlass man's tricorn head over the far shoulder, shield man's helm in the chest, heavy's gaping face in the belly - each with its own soul-coloured eye, hat and far eye), two extra arms (green oilskin arm hanging a cutlass behind, a bare grey arm reaching out of the coat belly, both sway), patches of four coats on the torso (blue cutlass coat, green oilskin, iron plate, red sash round all). Present in every Sailor pose.
c DONE no main.js: the hands' own `seenS` record (src/deep3-hands.js: drawFoe notes the live Sailor, drawOver plays CA.drawCrewDead for 2.4 s once e.alive is false and e.hp <= 0; cleared in H.clear). Same pattern as the whale lane's Queen fall. Flag OFF: hands never run.
d DONE Parasite Queen (parasite_queen_art.js): a wide maw drawn ON TOP of the mask in every pose (dark gape, 4 fangs above / 3 below, red tongue when open, two bone mandibles framing it), gold-tipped crown spikes. Idle now shows the face and mouth.
e DONE rib rule per tile (whale_art.js): isRibTile = the eight pillars (RIB_X0, x0..x0+2, rows 31-43). Ceiling, shrine-two sill and gaps are flesh; the rib section's flesh colour is a dark rose, no longer bone-brown.
f DONE clean hook existed: the backdrop chain in drawWorld already has per-level draw-under calls (WWH.drawBack etc.). Added ONE line after the WWH one: `if (WHH && WHH.on()) WHH.drawBackdrop(g, cx, cy, VW, VH, time)` (WHH.on() = L.whale). New src/redraw/whale_back.js: per-section wall bands + far shapes (maw gums/teeth, tongue palate folds, gullet receding rings, stomach drips/bubbles/acid mist, rib cage of far ribs, heart glow/vessels), light shafts, plankton motes, roof dark. It is opaque and replaces the reef sky/far/mid on the whale.

## Files
src/redraw/drowned_crew_art.js, parasite_queen_art.js, whale_art.js, whale_back.js (new), src/deep3-hands.js, whale-hands.js, main.js (+1 line), index.html (modulepreload 906), tools/d3-art-lint.mjs (+19), tools/wh-art-lint.mjs (+16), tools/seaart2-sheet.mjs (new).

## Proofs (node; before -> after)
deep3 696 -> 696 | whale 414 -> 414 (no flaky roll) | siren-rocks 773/786 -> 773/786 | tide-kit 2022 -> 2022 | sr-art-lint 201 -> 201 | d3-art-lint 531 -> 550 | wh-art-lint 293 -> 309 (new checks: faces, fused heads, fall wiring, Queen maw/crown, rib list equals whale.js, no bone leaks, 6 backdrops clean, one guarded main hook) | architecture 610 ok | goblin-lint ok | node --check on every touched file. Flag OFF = master: WHH.on() false off the whale, hands never run with the flags off, main.js diff is exactly one line (git diff).
Raw logs: scratch/lane-reports/seaart2/base/before.txt, after.txt.

## Sheets (LANES\scratch\lane-reports\seaart2\)
sa2-faces.png (before-sa2-faces.png) | sa2-sailor-fused.png (before-sa2-sailor-fused.png) | sa2-sailor-fall.png | sa2-queen-head.png (14x), sa2-queen-face.png (before-sa2-queen-face.png) | sa2-backdrops.png (six sections) | sa2-rib-room.png | refreshed wh-*.png, d3-*.png. Tool: node tools/seaart2-sheet.mjs <outdir> [crew|queen|qhead|whale].

## Honest view
- sa2-faces crops the Sailor (canvas too narrow); look at sa2-sailor-fused. At 1x the extra heads are ~10 px; the browser look decides.
- Harpooner mouth is stitched, so no teeth (by design).
- Backdrop is flat bands and rects, no tile art under it in the sheets; the rib section's flesh vs the ribs behind is untested in page. The shafts/ribs cost ~100 rects per frame.
- The two rib halves were one-piece arcs; rib arcs are a repeating pattern (hash varies bow only).

## BROWSER OWED (one at a time, memguard first)
1 ?level=whale each section: backdrop under the tiles (does it cover the reef far/mid fully; rib arches vs rib tile pillars; shafts vs the lung HUD), shrine-two sill reads as flesh.
2 Queen at speed: maw/mandibles vs the lash/spit tells; crown gold vs P3.
3 ?deep3=1: Sailor extras at 1x (arms vs his weapon in stance swaps), his death fall (2.4 s) after the last hit, and that e.hp <= 0 / e.alive false is what main.js leaves on a Sailor kill (if the entity is removed instead of marked, the hands' record still holds it, but verify).

## Questions (rec first, all built as the rec)
1 Bake the Sailor poses (now 5 more masses a frame) to a cache if the page shows cost? REC wait for the browser look.
2 Give the other bosses' deep-water art the same extra-face pass (Naga/Drowned King 2)? REC only if Daniel flags them.
3 Replace the repeating backdrop rib arcs with a few hand-placed big ribs near shrine two? REC later with the browser look.
