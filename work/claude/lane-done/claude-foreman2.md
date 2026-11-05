# FOREMAN2 (Deep Rails mini) - 11-05, CODE-ONLY, no browser opened
Branch claude/foreman2 off claude/drpolish (21c6aa736). Not merged, not deployed (ships after the demo).

## Per rec
1. CHAIN EDIT (src/foreman.js): stage 2 was tip,tip,points = 3 jump threats; now ram,tip,drift,boom,pick,points,ram,drift (tip 1 + points 1 = 2). Stages 0/1 already <= 2 (stage 0: 0; stage 1: points only). Counting rule: tip/points are the jump THREATS; drift is the opening (jump ON him). Every stage has pick/ram (brake) and/or boom (duck). Stage 2 gains a ram (brake, 46 dmg) in place of a tip lump pair.
2. SPIKES WINDOW: wardT 4.5 -> 3.0. New FOREMAN.bracedPoke 0.5: a blade from your cart while braced does x0.5 (takeBlade), word 'BRACED'. Still >= 0.4 floor, never invulnerable; unbraced off-cart stays x0.4.
3. CART DAMAGE (src/redraw/deeprails3_art.js armourFront/armourBack): stomp 1 knocks plate 1 off, stomp 2 plate 2, stomp 3 plate 3 (bare ribs, dark tub, hanging bolt, torn edge, rust glow, hole shows over the hazard strip); stomp 2 also snaps the beak tip and bends the lamp pole. Next plate to go is shown dented. On each stomp (src/minecart-hands.js stomp cb) a debris burst + sparks off the lost plate's spot (iron/rust colours). Art is Deep Rails iron/hazard kit - no wood/logs. Visual only: the rim hitbox and spike logic are unchanged (spikes themselves not shortened).
4. POINTS READABILITY: three faint red notches (pulsing, fading) drawn on the rail ahead of the gap, scrolling with it (like the Pick's mark), ~0.5 s of warning; a lever clunk (sfx.leverClunk, falls back to clank) at the start of the tell and when the gap is thrown. Not the two-line switch.

## Node results
- node tools/minecart.mjs: 624 checks ok (updated the braced-blade assertion to x0.5; added brace ~3 s, braced poke in [0.4,0.5], and per-stage chain checks).
- New tools/foreman-cart-sheet.mjs (pure node-canvas, no browser) -> scratch\lane-reports\foreman2-cart.png (stage 0/1/2/3 contact sheet at x4; lamp glow is no-op'd in the shim).
- Did NOT run check.mjs. boss-openings.mjs uses a browser: not run.

## Browser owed
- Mini rate n=6 per hero (flasks) on the Foreman; expected direction: slightly UP vs 83% bot (shorter dead brace, 0.5x poke, one fewer tip pair), partly offset by the extra ram in stage 2. If it lands > 80, drop the stage-2 second ram to a pick (or restore a tip lump).
- tools/cart-pilot.mjs completes (logic untouched except chain order/ward time); 1-4 seats + every hero.
- Eyes stills: the notches on the rail before THE POINTS (do they read at game scale?), plate holes at in-game size, debris burst, lever sound audible.

## Questions (rec first)
1. Keep stage-2's added ram? Rec: yes; flip to pick if the rate exceeds 80%.
2. Should the visible spikes also get shorter/broken per stomp? Rec: not now (hitbox stays whole; a broken-looking rim that still hurts would mislead).
3. Points notch lead (~76 px / 0.5 s) - lengthen if eyes say it still reads late. Rec: wait for stills.

Final tip: 409882a7c (pushed, claude/foreman2).
