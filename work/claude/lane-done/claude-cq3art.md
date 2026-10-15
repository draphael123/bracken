# claude/cq3art - CISTERN QUEEN 3 art (sonnet; off cq3tune d67c17a1). Port 8943. Art only: no number, hash or test touched.
## Drawn (src/redraw/cistern_queen_art.js, src/cistern-queen-hands.js; picture tool tools/cq3art-shots.mjs, not in the suite)
- THRASH: own windup (rared back, legs+claws thrown up) and release (slammed down) frames alternating at 7 Hz, burning shell (HOT palette + seams). Fixed a NaN: heat read CQ.scorchT (retired) so the hot shell never drew.
- SAG: belly down, legs splayed flat, claws limp on the floor, char shell split by pulsing ember seams that dim with the opening clock.
- SLIP-AND-FLIP: skid (feet shot forward, claws up) -> flip -> ON HER BACK, belly plates bare, legs/claws paddling UP (the old fallen/slip drew legs below the floor). 'fallen' and the bestiary dead frame use the same back pose. Wet sheen + rings spread under her during the slip.
- TAIL = TARGET: in every opening the tail lies flat and tapered to a bigger stinger, gold light along its length, gold pool of light on the floor and a bobbing gold arrow over it (plus the existing ring + clock). tailPose now inverts the whole view transform (new unFramePoint) so the drawn tail ends on the stinger struck (rear's tilt was off); view ty -30 -> -38 for slip/fallen (drawing only; in an opening the target is S.stinger).
- WATER JARS: clay amphora, stone+iron rack with brass nozzle (drips while refilling, ghost jar fills), glint sweep + twinkle, tumbling jar with water trail, SHATTER splash (flash, rings, spray, clay shards, wet patch; soft version when a blow spills it).
- THROW NOW cue: sand ripples + cracks as she digs up; when the window opens a blue wet ring (the splash zone) pulses with a bobbing water-drop and chevrons; greys and shrinks as the window closes.
- Oil glow (warm bloom, sliding shimmer, lifting embers).
- REMOVED unused: broken-stinger stump, snap star, reel legs/claws/mode, doused drip hook (S.wet), S.broken. Kept: the wet shell (slip, soaked, flood).
## Checks (PORT 8943, one page at a time) - all green
cistern-queen 162, underwell, boss-openings, boss-read, tells, corpses, textfit hints,boss --strict (0 issues), mobile-perf (first run: a 633 ms map frame under PC load; re-run clean).
Not run: boss-rates / full suite (no numbers moved). tools/cqart-shots.mjs still lists the old broken/reel frames (stale, not in suite).
## Self-grade: B (C+ on the thrash legs, which are posts rather than a flail; sag/slip/jars/cue B+).
## QUESTIONS FOR DANIEL
1. Exposed tail is only ~24 px past her rump (the stinger sits 74 px behind her centre); I cued it by light + arrow rather than moving it (numbers). Want it flung further?
2. THROW NOW cue is icon-only (drop + ring); the first-time hint line still does the words. Keep?
