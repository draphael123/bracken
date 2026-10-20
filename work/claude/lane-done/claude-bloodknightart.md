# claude/bloodknightart - THE BLOOD KNIGHT crimson art pass (art only, no gameplay change)

## WHAT WAS DRAWN
- **bakeReaper crimson pass** (src/chars.js; hero + boss share the bake): horn tips blood-dipped, pauldrons rimmed in red, wider torn red surcoat on near-black plate, blood-tinted steel (REAP_PAL), greatsword fuller + runes now crimson (KP.fuller/KP.rune, other heroes unchanged). Boss checked at 1.5x in the Unburied Field (bkart-boss-*.png): reads crimson, silhouette intact.
- **Five tiers, each its own windup + release (B16)**: `rendWind/rend` (blade across the chest, point behind - backhand cleave), `sunderWind/sunder` (blade straight up, trembling; brought down and planted, cracks), `crescentWind` (+ existing `crescent` release), `exsWind/exsanguinate` (dropped low, spear-cocked; full lunge; held on the point with blood running to the hands), `moonWind/bloodMoon` (on toes, red moon of motes round the point; slam; geyser). Keys are the ones main.js bkWindPose/bkReleasePose already read. Smear pass extended to rend/sunder/bloodMoon.
- **BLOOD SPIKE** pose `bloodSpike` (2 beats: short then full crimson spikes round the planted blade).
- **BLOOD PRICE** pose `price` (3 beats: left palm drawn along the laid blade, blood running down it, blade soaked). Hook: crouch-b.js pose() + `P.bkPriceAt` set in bkPrice (main.js).
- **Crimson Crescent wave sprite** (baked 3-frame pixel crescent, trail) replaces the ellipse; **BLOOD MOON geysers** (`drawMoonGeysers`, dkGraves `moon:true`): tall dark-edged columns with crowns + drops, blood-moon ring.
- **HUD BLOOD DEBT** now a HATCHED maroon segment (diagonal stripes, dark seam, white-hot pulsing edge) so it differs in texture from the flat-red health and the pale low-health flash; also drawn on the co-op seat plates (when a seat's `bd` > 0).
- **Blood Mail / Bloodletting** poses and the dance/fidget/shadow-step frames: green + bone hard-coded colours recoloured crimson; pose comments renamed.
- **Blood thralls** (rec-built, Q2): the summoned skeleton/archer/mage-skull and their ground/hands/bolt colours are clotted crimson with drips and pale-pink sockets (main.js wraith()). Names/skill text untouched.

## CHECKS (PORT 8789)
pose-frames ok; ability-poses ok (76/76 own bodies); frame-cost ok; blood-kit ok; dk2 ok; readability ok; unburied-fights ok; mobile-perf (title+unburied, 4x CPU phone) inside budget: unburied 60.1 fps, 11.9 ms busy/frame. textfit --strict NOT run to completion (a full-run overlapped the other lanes and I stopped it; this lane adds no text strings at all - only drawn shapes), so rerun in the suite.
Shots: work/claude/lane-done/bkart-*.png (tier winds/releases in the real page, blood moon geysers, crescent wave, debt bar at 3 fills, boss at 1.5x) + bkart-sheet-tiers1.png; tool tools/bkart-shots.mjs.
Perf: no new per-frame allocations beyond cached sprites; wave sprites baked once on first use.

## SELF-GRADE
B+/A-. Poses read at game scale and are distinct per tier; the pixel-level polish of rendWind/crescentWind (both blade-behind poses) is the weakest - they are similar silhouettes at 1x, told apart by blade height and glow. Debt bar and geysers are strong. Sheet shot of exs/moon/spike/price poses: regenerate with tools/dk2art-sheet.mjs.

## QUESTIONS FOR DANIEL
1. Blood thralls (rec-built): kept the skeleton shapes in clotted crimson. Want a different silhouette (hunched, no skull)?
2. The boss shares the hero's new body; want him a shade darker/larger-horned to tell hero from boss on sight?
3. Co-op debt: the seat plate draws a debt segment only if gameplay ever gives seats `bd` (it does not today).
