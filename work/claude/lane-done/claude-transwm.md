# claude/transwm - the first level transition: THE LUMBER TRAIL -> MARSH WOOD (the ferry)

Branch claude/transwm (off claude/batch109 8ce6ebc7). Behind `?trans=1` until the art pass merges (art before live). Not merged, not deployed.

## What was built
A reusable, skippable, dialogue-free transition system, plus its first row.
- `src/transitions.js` (pure): the TABLE (`{from, to, scene, beats, open, arrive}`), the timeline runner (`start/step/phase/canSkip`), the policy (`policy({flag, mode, seen, live})`), the walk maths, the letterbox maths, and the ferry scene's geometry. The next pair is one more row (+ a scene drawer if it needs a new vehicle).
- `src/transitions-art.js`: greybox-plus pictures (gradients, rectangles, the game's own hero and ferryman sprites): `drawFerryScene`, `drawArrivalFerry`, `drawBars`.
- `src/main.js` (~100 lines, all marked `claude/transwm`): `trnBegin/trnUpdate/trnFinish/trnArrive*`, the render hooks, the `BK.trans` test hook.
- `tools/transition-woodmarsh.mjs`: node rows + `--browser` + `--perf`.

## The beats (as built)
1. OLD TUSKER falls. The existing shared boss-kill beat (actcards) runs as before. Then `winLevel()` runs FIRST (clear, medal, XP, save), then `trnBegin()`.
2. THE WAY OPENS (told, no text): the clearing's east gate (col 549, rows 3-8, the Wood's last column) crumbles in dust + shake + rumble, a lintel stays. Letterbox bars slide in (0.5 s).
3. WALK (<= 3.6 s, ends when all heroes are off-screen): every hero is walked kinematically (run frames, a 7 px hop over the opened gate), camera follows. Kinematic, so it works for every hero/skin/seat.
4. SHORE (3.3 s): full-screen scene - misty channel, bog-oak piles + reed-lashed jetty, the ferry moored at its end, the ferryman at the stern. The heroes walk in over the jetty, hop the gunwale and stand aboard (all seats, side by side).
5. RIDE (7.5 s; ~8.1 s on the water): the ferryman poles off, the moorings drop, the Wood's pine treeline recedes left, reeds slide past in three parallax layers, the Marsh's stilt huts and reed spires arrive from the right, mist thickens.
6. FADE (0.7 s) -> `loadThen(marsh)` (the map start's own path) -> MARSH begins with the heroes standing on the ferry beached at the bank's west end; they step off (1.7 s, hands taken), bars slide out, the title card (name + rule) shows over the arrival, control returns. The ACT I card does not double (same act, already seen at the Wood's start).
7. SKIP: any key/pad/tap after 0.8 s (a hero mashing attack as the boss falls cannot skip it) -> a 0.3 s fade -> the same Marsh arrival as a full watch. A small "ANY BUTTON: SKIP" / "TAP: SKIP" fades in on the bar (the only text).
- Co-op: every seat is walked, drawn on the ferry, placed on the Marsh ferry and handed back (page check with a warden partner).
- Replay: with the flag it plays every time. `PROG.transSeen['wood>marsh']` is written on the first play; the policy already has the always / first time (default) / never modes - only the settings row is not wired (see questions).
- Rush, boss select, trials, shops, the editor never start one. A level loaded any other way while a transition runs ends it (`loadLevelG`).
- Reduce motion: no sway, no mist drift, the slide is 0.4x; the boarding stays.

## Test links
- `?trans=1&boss=oldtusker&hero=knight&campaign=1` - the boss jump (no save written): kill him, the transition plays, the Marsh begins. Verified in the page.
- Any normal play with `?trans=1`: fell Old Tusker, same result, clear is saved first.
- Without the flag the win card arrives exactly as before.

## Checks run (this branch)
- tools/transition-woodmarsh.mjs: node 25 rows + `--browser` (credit-first, beats in order, gate opened, Marsh arrival on the ferry then control, skip at 1.5 s, flag-off win card, mid-cutscene quit, co-op, textfit of the hint, no page errors) = 40/40 green; `--perf` 28 rows green.
- PERF: ferry scene on a 915x412 DPR 2.625 phone viewport at 4x CPU throttle on the page's own loop: **59.6 fps**, p95 frame 16.8 ms, worst 83 ms (the load), 10.9 s.
- old-tusker (25), lumber-trail (91), marsh2-beats, hint-shown, act-cards (16), save-safety, campaign-order, boss-select: all green.
- Not run: the full mobile-perf scene table and the nightly suite.

## Not done / limits
- The win card is skipped on a transition that plays (credit, medal, XP and the level-up are already paid by winLevel); the player does not see the clear's tally for the Wood. See questions.
- The "way opens" is a dust-and-crumble greybox in the Wood's last column; no new geometry in the Wood (the level ends at col 549), so the shore is a standalone scene joined by a walk-out-of-frame cut.
- The Marsh's arrival ferry is drawn over the bank's first 3 tiles (no map change); it stays drawn while the start is on screen.

## QUESTIONS FOR DANIEL
1. Win card: skip it on a played transition (built, rec) or show it AFTER the Marsh arrival / on the ferry? Rec as built: skip, the credit is already in.
2. Settings row TRANSITIONS: always / first time (rec default) / never - the policy supports it; wire the row when the art merges? Until then only `?trans=1` plays it (art before live).
3. Old Tusker's way opening: built = the clearing's east gate crumbles. Want the felled pine to settle into a ramp instead (needs the boss's pine state)? Art-pass decision.
4. Walk length: a hero who dies the fight in the arena's far west runs (capped 175 px/s) for ~3 s; fine, or teleport-fade for far heroes?
5. Next pairs to add first (rec: Marsh -> Sporewood? the table row + a scene drawer each)?

## ART NOTES (what the art pass should paint; the timing stays in src/transitions.js)
- The way-opening in the clearing: an actual drawn gate/fence in col 549 (not just a solid tile that vanishes): rails that fall, splinters, the path beyond it lit (a tile skin for T.SOLID col 549, then the opened frame).
- A walk-out hop over a settled trunk (hero 'jump' frames, not just a 7 px arc of the run frame).
- The shore scene: real jetty (bog oak, rope, reed lashing, lanterns), a Wood bank with roots and fern, the ferry as the Marsh ferry's own sprite (src/redraw ferry/raft art; this uses rectangles), the ferryman's own poling animation (3-4 frames: plant, push, drag) and a ripple per push.
- The ride: layered painted reeds (3 layers, bigger heads, dragonflies, a heron on a snag), the Wood's treeline as painted pines with the autumn colour, the Marsh's stilt huts + lanterns arriving, water with real ripples and the wake at the stern, a brighter warm-to-cool mist grade, a light shaft.
- The Marsh arrival: the ferry drawn in the Marsh's palette with a mooring post and rope on the bank; the hero stepping-off 'run' frames land on the jetty planks.
- Sound: a creak and pole-plant sample per push (SFX.pole exists; creak/splash reused), reed hiss ambience, the Wood's rain dying away and the Marsh's frogs coming up on the arrival.
- Letterbox: a subtle film-edge treatment (soft 1 px line) instead of flat black.
