# claude/dr3art - DEEP RAILS 3 ART (Sonnet art lane, 2026-10-11)

Base: claude/deeprails3 ce141d0a. Art + SFX only: geometry, collision, timings, tells and the level hash are untouched (the Foreman's skin is set at runtime in fmSpawn, not on the placed foe, because levelHash covers the placed foes; no row re-stamped). The Deep Rails kit kept (MP palette, WALLK, glow sprites). New module src/redraw/deeprails3_art.js (re-exported by minecart_art.js; index.html modulepreload added); no per-frame bakes (the Foreman's set is baked once at load), nothing drawn at a negative y outside a clip.

## The 8 items
1. THE FOREMAN: his own skin SPR.foremancart (src/redraw/deeprails3_art.js bakeForemanSkin; cnSkin set at spawn): a goblin foreman, hard hat + brass lamp, red waistcoat, whip. Seated IN the cart (the cart's front plate is drawn over him, MCA.armourFront via H.drawRiderFronts). 7 frames = tell poses: idle, drift (leaning back, a hand on the brake), pick (arm back, pick up), ram (braced, teeth), lurch (arms up, roaring), duck (down in the tub - boarded and during the brace), hurt. H.foremanFrame(e) picks the frame; main.js uses it. The cart: lid at y-15 (where the hero stands), plates dent per stomp (a second stomp dents further), hazard strip, beak, lamp pole; the BRACE spikes (MCA.fmSpikes) now come up through the lid, cones with bright tips on a hazard collar. Corpse/body in his own skin (tools/corpses.mjs proves it). Bestiary card 'THE FOREMAN' (key foremancart, seen when within 190 px).
2. The hero standing on his lid (the cart's rim is the stand) with his own EMPTY cart rolling on under/behind (wobble + speed streaks off its tail).
3. THE FOREMAN'S LOOP: MCA.tunnel wet variant now has its own teal palette (WALLK[5] rock, wet moss timber), its own cold teal lanterns, black water with ripples, drips from the roof, a mist on the water: THE FLOODED RUN, not the bore.
4. LOW ROOF: MCA.lowRoof per area (zoneOf of its column): the Lamp Yard warm timber + a hanging lamp string, the Dark Drift near-black rotted timber with fungus + a drip, the Works riveted iron girder with a hazard edge, the Flooded Run wet green-black timber with drips; knee braces + end posts (art only; they stop short of the line).
5. SWITCH: MCA.switchLever (a stand with a red-handled arm, lamp red = out / green = laid) replaces the points disc for sw points; MCA.bridge is a hinged span: out = hanging from the hinge with a snapped chain and broken ends; struck = it swings down about the hinge (accelerating) and bounces, with a landing dust puff (state tracked by drawing time, not the sim).
6. Perched goblin: crouches on the (lashed, braced) timber, stands to wind the pick (pick raised), chops down in an arc with a swish; knocked off = his normal corpse fall. Swinging rider: a boom off his tub, rope and hook that swings down across the line. Leaper: crouch at the ledge's lip, tight coil on the tell, a tucked spin with a trail in the air, a closing shadow ellipse + ring where he lands, landing dust (ctx.dust x3). Poses use a new e.mcPose hook in poseOf (squash / lean), set by the hands.
7. GREAT DRILL 3: the points-lever post (hazard-striped shaft, a gate-head, a big red hand-lever that swings DOWN when thrown, lamp), the ore dump (ore chunks and dust pouring into the bare gears while jammed), the dynamite as a bundle of red sticks with a fizzing fuse (in the arc and on the line) and the driver's ARM out of the cab window cocking and throwing, the spin-up CUTTER (a boom out of the rear and a spinning saw head with sparks; folded and whining on the tell, the full-length boom on the lunge), the HOOK and CHAIN (links, a hook, the launcher; taut when snagged), ROOF COLLAPSE rubble (a heap and dust where the roof came down, on every line under it), the P3 gouges torn in the roof.
8. SFX (no downloads - clips already in the manifest, laid over synth in src/audio.js REC): drillWhine (r_charge), drillLunge (r_rumble), chainRattle (r_chain), fuseFizz (r_hiss), stompClank (clang), leverClunk (r_latch), bridgeSwing (r_creak); wired in src/great-drill-hands.js SOUND, src/minecart-hands.js (stomp, the switch).

## Pictures
work/claude/shots/dr3art/sheet.png (every crop, labelled; tools/dr3art-shots.mjs, groups foreman / rails / foes / drill / card; the Foreman's seven frames on one strip: 'f-frames').

## Checks (PORT 8851, sequential)
minecart 363 ok; corpses ok (59; THE FOREMAN's body proven - tools/corpses.mjs now also proves a MINI's boss body, since a mini leaves bossBodies, not a corpse: extended, nothing weakened); tells ok; modulepreload ok (10 not yet listed, under budget 15); audio-assets: ONE red that is NOT mine - SFX.hop( is called from src/main.js and audio.js has no hop (present on the base ce141d0a); mark-integrity: one phantom, undeadmage|markTell (not this lane's); see the final message for pixels / mobile-perf / minecart-route.

## Known gaps / notes
- The bestiary card could not be screenshot (the page kept the list on its first row when bestI was set from the tool); the entry and its sprite (frame 0) are in place.
- The hurt flash on the Foreman is the game's white silhouette; it reads as a blob for 0.12 s (the game's general flash).
- Low-roof and bridge pictures are from god-mode placement; judge them in the live level.

## QUESTIONS FOR DANIEL (rec first)
1. The Foreman's brace is the duck pose + spikes through the lid. Rec: keep. Alt: he pops up and taunts between.
2. The bridge hangs from its NEAR hinge (you see the span dangling before the gap). Rec: keep. Alt: hinge at the far end so it rises into view.
3. SFX.hop missing on the base: fix in integ (rec: map it to the jump sound).
