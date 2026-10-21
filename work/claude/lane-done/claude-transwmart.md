# claude/transwmart (sonnet) - the Lumber Trail -> Marsh Wood transition, ART PASS + ON BY DEFAULT

Branch claude/transwmart off claude/transwm 8423dfc1. ART ONLY: timings, beats, flow and save are untouched (src/transitions.js beats/table unchanged). Not merged, not deployed.

## !! ART BEFORE LIVE UNLOCK: the transition is now ON BY DEFAULT
The ?trans=1 gate is gone. `policy()` has no `flag`/`live` any more: it plays unless `?trans=0` (or the tools' `BK.trans.force(false)`) is set; the TRANSITIONS setting (default FIRST TIME) governs it (NEVER stops it, FIRST TIME skips a seen pair, ALWAYS replays). Consequence for every normal playthrough: killing Old Tusker now plays the cutscene instead of the win card (credit/medal/XP/save still paid first, as before). tools/transition-woodmarsh.mjs updated + 2 new rows (default-on, gate-gone). Boss-select / rush / trials / editor still never start one.

## Drawn (src/transitions-art.js, rewritten; all static pieces baked once per viewport, blitted per frame)
Kits reused, not re-invented: Lumber Trail (bark / cut pine / needle greens, the log pile and stump from lumber_trail_art.js); Marsh 2/3 (bog oak, board, reed cord, reed greens, the pale moon and cold marsh light from marsh2_art / marsh3_art).
- THE WAY OPENS (world space, clearing col 549): a lashed pine gate (5 round rails with cut ends, two posts, brace, iron straps) that shivers, then the rails fall one after another and settle on a pile, the posts topple across the path (what the heroes hop), the header beam stays with two rope ends swinging, a warm light spills through the gap with motes, dust rises. The tile skin underneath is covered until the tiles go to air.
- Hero hop over the fallen rails uses the hero's own 'jump' frames (was a 7 px arc of the run frame).
- THE SHORE: a Wood bank (autumn grass, roots, ferns, the camp's log pile, a stump with an axe left in it); a jetty of bog-oak piles lashed with cord, plank deck with joints and nails, a sagging rope rail, reed bundles, a lantern gallows (warm flicker + halo), a thick mooring post with a cord coil and the bow line (taut, then dropped).
- THE FERRY: the Marsh ferry kit - two lashed bog-oak logs with pale round ends, plank deck, cord lashings, reed-bundle prow and stern, pole fork, bow post with a lit lantern, rope coil, barrel; foam dashes, a bow wave and a wake once moving.
- THE FERRYMAN POLES: plant -> push (leans, talk frame, pole tip held still in the world so it slides aft) -> lift (drips) -> swing back, 2.4 s a cycle, with an expanding ring where the pole bites; every seat's own hero skin stands aboard.
- THE RIDE: painted pine treeline (autumn tips, two hazed rows, reflected in the water) recedes left; the Marsh's stilt huts (thatch, lit windows), reed stands, lamp poles arrive from the right; three parallax reed layers (bound stands, cattails, bulrush blades, sway), a heron on a snag, dragonflies, two tiling mist layers thickening, sky/water graded from the Wood's gold morning (sun glow, light shafts) to the Marsh's cool grey-green, a pale day-moon rising and the Marsh's cold lights over the water ahead.
- THE ARRIVAL: the Marsh ferry (same kit) moored with a post, coil, slack bow line and lantern at the Marsh's start; heroes step off.
- LETTERBOX: film-edge line instead of flat black.
- CAMERA (main.js, one line): during OPEN and WALK the camera holds the gate (it was following the hero 35 tiles away, so the way opening was never on screen); the heroes run in from the left and hop the rails. Input is locked in both beats; walk length/cap unchanged.
- No text anywhere in the scenes but the skip hint.

## Checks (headless Chrome, port 8795, one at a time)
GREEN: tools/transition-woodmarsh.mjs --browser 45/45 (credit first, beats in order, gate opened, Marsh arrival, skip, default-on, setting honoured, co-op, textfit, no page errors); settings-tabs; hint-shown; old-tusker (25); lumber-trail (91); marsh2-beats (ranged 23/79, under the cap on this base); save-safety; campaign-order; boss-select; boss-fight-end (64/64 fights end); act-cards (16).
PERF: --perf on a 915x412 DPR 2.625 phone viewport at 4x CPU, on the page's own loop: **59.9 fps**, p95 16.8 ms, worst 33 ms over the 10.7 s ferry scene (31/31 green). Not run: full mobile-perf scene table, the nightly suite.
Pictures (320x180 x3): work/claude/lane-done/transwmart-*.png (gate falling, walk/hop, shore, aboard, pole-off, marsh arriving, ride end, arrival ferry, co-op aboard + step-off).

## Self-grade vs the marsh2art/lumbertrailart kit: B
Reads as one trail-to-marsh journey and matches both ends. Weak spots: heroes are tiny against the scene (the viewport is 320x180); the Wood's far pines are a repeating strip (hazed to hide it); the gate sits at the world's right edge so only its left ~2/3 is on screen; no new SFX (creak/pole/splash reused); mid reeds read slightly like a fence at the waterline.

## QUESTIONS FOR DANIEL
1. Default-on is live in this branch: the first Old Tusker kill of every save now plays ~12 s of cutscene (skippable after 0.8 s; FIRST TIME only). REC keep. ALT default setting NEVER until you have watched it once.
2. Sound is still the old cues (creak, pole, splash). REC a small follow-up: rain fading out and frogs coming up on the arrival, a pole-plant sample per push (needs the sound lane).
3. The camera now holds the gate for the open + walk beats (cut-in at 9/s). REC keep; ALT leave the camera on the hero (the gate falls off screen as before).
4. The gate is the Wood's only gate drawn; col 549 tiles stay the level's own under it. Want the same gate drawn as a tile skin in the fight itself (a visible exit all fight long)? Not done (art-only lane, would change the arena's look).
