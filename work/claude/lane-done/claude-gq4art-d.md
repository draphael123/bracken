# GQ4ART-d (ART) - branch claude/gq4art-d (merge of gq4p-d + gq4q-d, then art). Flags GQ4L/GQ4P/GQ4Q stay default OFF.

## Merge + small item
- Merge gq4p-d into gq4q-d: one conflict (src/marks.js MARK block, generated) resolved by `tells --write` -> both sides' tells present; answer-tags, gq4p (28), gq4q (61), gprincess, gqueen3 green with all flags ON.
- Princess blowOn (gate pins, rope, winch, gems) now also reads shared src/hero-strikes.js heroStrikes (when GQ4P on). gq4p + gprincess re-run green.

## Drawn (src/redraw/gq4_art.js, rect-only, Node-renderable; contact sheet tools/gq4art-sheet.mjs, 87 labelled cells, lint green)
1. THE QUEEN'S KNIGHT: full redraw of the 7-frame hedge-knight table (black plate, gold edge + crest, crown on breast, green ears/jaw/tusk, yellow eye), same size/anchor/box. main.js bakes it (falls back to the old recolour on a throw).
2. Princess: gate (shut / open / locked-open, stone jambs + voussoirs + portcullis), lantern in 3 colours, chain pin idle / glow / struck, master chain (slack / taut / lit), shimmer shell, skid line, key-turn fx, gallery balustrade + corbels. NEW frames 38-44 on her sheet: key-turn x2, pirouette tell + spin x2, dizzy x2 (hurt/body moved to 45/46, still length-2 / last); gpFrame + FRAME_AS wired. The 46-col room itself keeps the existing castle dressing (arches, banners) - not redrawn.
3. Tower: burning ceiling glow, slit windows showing fire, tapestry cold / spark / flare, the breach, outer wall face + corbel, hoarding ok / creak / gone (stone brackets, charred boards), burning-castle panorama (hooked behind the outside pocket in main.js), falling burning beam + told shadow ring, boulder fall / sent back. Queen hop frames 43-50 (stride, step-in x2, step-out x2, look-down, taunt, cast-at-brazier) in chars.js bakeGoblinQueen + GQ_FRAME.
4. Queen P1: GEODE THRONE (amethyst cluster, lights on the tell), ROSE WINDOW + violet/gold light patches, grated hearth (smoke only) / live hearth (hurts, told), jet, hearth + reach portals, sceptre jab sprite, gallery trim, LADDERS (T.NET tiles via gqTiles 'ladder', laid with the galleries). Queen frames 51-54 (hearth jet x2, reach x2).
5. Queen P2: boulder x3 rotations + hot, burst + hanging shards + glint, rock + shadow, great geode, sky portal, ward shell, rage aura, dazed-down x2 + rage x2 frames (55-58; cracked crown variant). Hooked in gqueen-hands q4DrawArt (greybox q4Draw kept as the fallback on a throw).

## Stays greybox / owed
- 46-col room redraw, the chimney hearth on B3c, the tower's exact slit placement (drawn on the shaft edge, eyeball it), outside flights/corbels still use the tile kit (corbel/face art exists but is not painted over the tiles), the Queen's boulder 'portal' uses the shared ring art. Queen sheet frames are drawn in her existing table style (no new body language beyond arms/feet/glow).
- Great-geode burst frame and 6 hanging-shard glow after it use the shard art (no separate burst sprite).

## Checks (flags ON): green tells --write, answer-tags, gq4p, gq4q, gprincess, gqueen3, gq2mech, gqmusic, gobgeo, level-quality crown, modulepreload --write (789), dangling-paths, frame-cost, audit-anim, gq3art-sheet (updated to 47 / 59 frames), gq4art-sheet lint. Not run: untold-told, textfit, boss-fight-end, pilot/curve/mash (still owed from L/P/Q). No boss-rate runs.
Stills: bracken-scratch/desktop-out/gq4art-stills/{l,p,q} (18+9+10, all three flags ON, zero page errors) + GQ4ART-sheet.png.

## Questions (rec first)
1. Rose window sits 168 px over the throne at the arena floor; REC keep, retune after a look with the camera.
2. Ladders are tile NET (generic sprite) with the iron art drawn over: REC keep.
3. Drop the gobknight greybox file (gobknight_skin.js) at the flag flip: REC yes.
