# claude/grandpolish - THE GRANDMOTHER 3, ANIMATION + SILHOUETTE POLISH (Sonnet art lane, 2026-10-24)
Base claude/underleafart a24ce120. ART ONLY: level hash unchanged (tools/underleafart.mjs asserts 3d5dd5571299), no AI/timing change. Not merged, not deployed.
Self-grade: **B** (reads as a bent old witch now and every move is animated; held below B+ because the animation is 3-4 pose steps per move at 56x62 px, not smooth in-betweens, and the hump + head still make a heavy blob at game size).

## WHAT CHANGED
- `src/redraw/underleaf3_gran.js` rewritten: skeleton-driven body (hump higher than the head, head hung forward out of a drooping hood whose tip flops back, long hooked nose, chin + wart, eyes glinting under a brow in the dark of the hood, white hair, bone charm), short ragged hem over visible bent legs + boots (no cone), two-segment arms with long clawed hands, gnarled staff, lantern, belt jars.
- **65 frames per phase** (130 total), played in order over each move's own length (frameOf uses e.modeT; DUR table mirrors GM): sleep 3, wake 3, idle 4 (breath, lantern sway, blink), walk/hobble 4, hurt flinch 3, staffTell 3 coil->cocked, staff 3 swing->smear->follow, fireballTell 4 lantern up->spark->ball swelling, cast 3 arm back->thrown->follow, jarTell green/red 3 each reach back to belt->jar drawn->raised, hurled green/red 3 each, broodTell 4 arms rising->wide->calling->flare, kick 3 staff up->slam->rings, stirTell 4 / stir 3 (P2 ladle), ward 3 (hunched, hood low, palm out, trembling, pale glow motes), floated 4 (flailing arms/legs, drifting hem + staff), dead 4.
- Hurt: a landed blow flinches ~0.26 s, only over quiet moments (never over a windup tell).
- Death: main.js bossBodies gets `seqF` (UL3G.deathFrame): clutch -> kneel -> slump -> heap over 2.2 s (no tilt, no white flicker) for her only.
- Bestiary card = two hobble frames of the new look (portrait follows the sheet).
- Tools: underleafart.mjs updated for animated sets (every move >= 3 frames, all frames distinct, P2 distinct, death 4 frames); shots/sheet tools take OUTNAME and WRAP.

## CHECKS
| check | result |
|---|---|
| tools/underleafart.mjs | all green (hash, 65 distinct frames, every move >= 3, death 4, P2 own set, card 2) |
| tools/underleaf.mjs | 105 checks green |
| level-quality underleaf | PASS (same hash; curve 208% / 3 deaths) |
| corpses, skins | green |
| textfit bestiary | 321 screens, 0 overflow / truncated |
| mobile-perf 4x, arena (450:29) | 54.4 / 54.5 fps; yard (300:22) 54.8 fps (>= 40). Note: both runs show a ~750-880 ms single worst frame at scene entry; the unmodified a24ce120 tree shows the same (798 ms) on this busy PC, so not caused by this lane (budget is 600). |

## PICTURES (work/claude/lane-done/grandpolish/)
before-11..19-boss-*.png and after-11..19-boss-*.png (idle, brood, fireball, jar green/red, staff, floated, stir, warded); pose sheets: sheet-before-p1-old19poses.png, sheet-pose-sheet-p1.png, sheet-pose-sheet-p2.png (16 per row, in order: sleep, wake, idle, walk, hurt, staffTell, staff, fireballTell, cast, jarTell G, R, hurled G, R, broodTell, kick, stirTell, stir, ward, floated, dead).

## HONEST
- 3-4 frames per move reads as animated but is chunky; the stills in the arena are 2x only.
- Tells stay distinct (each windup has its own silhouette: staff cocked behind, ball over palm, jar overhead, arms wide, ladle up).
- Ward pose triggers while her brood stands (e.wasBrood) or the post-float ward is up, and she is not walking.
- Did not capture the real bestiary screen PNG; the card is the walk frames from the sheet.

## QUESTIONS FOR DANIEL (rec = built)
1. Death now lasts 2.2 s for her (was 1.4) so the four frames read. Rec: keep.
2. Mobile worst-frame (600 ms budget) fails on level entry for the base tree too. Rec: coordinator checks on a quiet PC.
