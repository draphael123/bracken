# claude/frogking2art (sonnet) - THE FROG COURT art pass

Base claude/frogking2 c8bcf741. ART ONLY: no geometry, number, hitbox or foe change (src/frog-court.js, src/frog-king.js untouched; level hash unchanged, no re-stamps).
New: src/redraw/frog_court_art.js. Hooks in src/main.js (tile kit, back dressing, water pass, boss fx, tongue, flop crest, throne, spit globs, `e.landAt` / `frogSpit` art-only fields),
src/redraw/lilypad.js (stir tint, whirl, boil), src/redraw/frogking.js (poses 18/19), src/redraw/marsh2_art.js (swarm haze). Pictures: work/claude/lane-done/frogking2art-*.png (5).

## Drawn
1. ROYAL PADS: the three dirt blocks are giant royal lily pads - deep green saucer, bright lit rim, gold veins fanning from the stem and a dashed gilt trim, a notch (pads I, II), pale underside curling at the ends,
   root tendrils hanging; thick pored stems (3 each) sway a pixel with depth, flare at the surface, splay roots into the bed; the water is laid under the pad (the pools stop at it) in one baked sheet with foam at the stems.
2. THRONE BANK (III): a huge lotus fan opens behind him, a petal-and-cushion throne seat replaces the old flat throne pad, lantern poles flank the pad (gold paper lanterns with baked glow), reeds + cattails stand round every pad and the lane gaps, small lotus on I and II. Fireflies drift over the court.
3. LANES: reshuffle read = a whirl where a held-under leaf went down and a boil where it will rise, tinted green (will HOLD) or amber (will SINK); drawn after the water surface so it shows.
4. P2 "HIS POND STIRS": the whole court's water churns (rings, foam patches, bubbles, darker surface), sinking leaves are AMBER with rust blotches (hold stays cool green), bubbles at a stirred leaf's rim, steam from his nostrils.
5. POSES 18/19: spit windup = throat sac blown venom-green with bubbles, head back, narrowed eyes, drool, fumes; release = body snapped forward, maw wide shining with venom, drool flung back. The lobbed globs are a tumbling blob with a drip trail; a droplet fan leaves his mouth.
6. THE LEAP: a streak of water thrown off him along the arc, a ring where he leaves, and a landing splash at both feet of the pad (rings, a column, a crown of drops). FLOP wave over a lane = a standing water crest, not mud.
7. TONGUE: ribbed, sticky bulb + drip, wet glints; P2 red with spit beads. FLY SWARM: a dark haze and a flickering buzz arc round the flies (16 now).

## Checks (one headless Chrome at a time, port 8791)
GREEN: marsh2-beats, boss-read, signs, solid-islands, visible-supports marsh (0 of 37), raft-recall (5 rafts), rafts, firsthour (court beats unchanged), textfit boss,worldplates --strict (exit 0), node --check on every touched file.
mobile-perf (4x CPU, 915x412): court marsh@720:17 **41.3 fps** (busy 22.6 ms; the same spot with the art switched off: 48 fps / 18 ms; budget 40). First pass was 12-20 fps (a self-copy of the frame buffer + ~200 canvas calls): now the dressing is one baked strip + one sheet per pad.
NOT RUN: the full suite, cast-poses, the court at 4x throttle with the boss awake and a splash in flight.

## Notes / QUESTIONS FOR DANIEL
1. The court is daytime rain (the marsh's sky after the night stretch), so no moon: lanterns + fireflies carry the marsh-light feel. REC keep; ALT a dusk tint for the court only (a palette change, own lane).
2. The old grey ghost frog statues (existing deco) still stand on the pads - REC retire them for the lotus/lantern dressing (one-line deletion of the frogStatue ents in src/frog-court.js, a geometry-adjacent file so left alone).
3. P2 steam + churn run only in phase 2; the dazed/winded openings still read by the existing gold outline (not touched).
