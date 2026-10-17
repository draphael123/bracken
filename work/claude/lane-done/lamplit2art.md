# claude/lamplit2art: LAMPLIT STREET 2, art pass (draw only; no numbers, timings or level data changed; level hash unchanged)
Base origin/claude/lamplit2 e029bf00. Tools: tools/lamplit2-art.mjs (sprite sheet), lamplit2-zoom.mjs, lamplit2-world-sheet.mjs, lamplit2-art-shots.mjs (real-page shots).

## Drawn
- Sprites (src/redraw/city.js): Lampreeve flask windup (leaning back, burning-wick flask cocked behind the hat) and throw (flung arm, glare); new frame 17 HOOD FLARE (frame 14 stays the relit stun, now with scorch + glare; main picks by flareKind). Tollmaster: iron-banded toll box with slot + flame, brass counterweight, seal with turned handle, unrolled writ with ink/rollers/seal, real flame tongues on the burning robes, tilt both sides (new frame 25; main picks by tiltSide*face). Watch: new BLINDED frame 7 (hurt stays last frame, which the engine reads as its hurt frame).
- World (new src/lamplit2-art.js, wired in main.js): flask tumbling with spark comet + landing shadow; oil slick (sheen) + burning slick; toll stream (beads, hood tongue, box flash) and lamp flame draining; scales weight/chain/trail; seal ghost descending; wax pool with print; writ water (surface, shafts, bubbles) + water in lamp hoods; bier left on stones + bearers backing away at set-down; fuse ring; flare-reach ring; way-lamp air main; pocket lit (air lens) vs dry (dashed ghost + weed); toll gate portcullis (barriers via portSpr for lamplit) + gate-lamp chain; city brazier sprite + leap to your hand.

## Grade: D -> B-
## Checks
Green: lamplit2.mjs (all), tells, frame-cost, node --check. Sprite sheet: 18/26/9 frames, no ragged canvases. Real-page shots reviewed (no page errors).
Not completed (machine loaded, timed out): corpses.mjs, mark-integrity MI_ONLY=lamplit, textfit, mobile-perf. Run on integ.
Not eyeballed: scales weight in motion (path + sprite confirmed, weight draw only checked in the world sheet); the engine's dark-level pass washes enemies pale on this level (pre-existing).

## Questions (rec first)
1. Every Lamplit gate (mini gate etc.) now uses the toll-gate portcullis, not the coast net. Rec: keep.
2. The lamp's flame drain overpaints the sprite flame (no extra baked frame). Rec: keep.
