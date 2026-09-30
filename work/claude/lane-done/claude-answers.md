# claude-answers (batch49 answers, 2026-09-30)

## What changed
1. Crouch A teaching lines: IMPALED and UNDER THE SHIELD were ALREADY routed to the hint box on master (both are in CALL_LINES in src/hint-lines.js, along with GUARD BREAK, HOLDS, BLOOD, READY, STEADY; TRIPPED is a MOVE_WORD and shows). Nothing to route for them. `node tools/hint-shown.mjs --write` gives the same list (911 silent, none new); hint-shown is green.
   Two crouch-a lines are still dropped: LOW GUARD (said() in src/crouch-a.js) and LOADED (reloadPistol('LOADED') in main.js). Both reach number() through a variable, not a literal, so hint-shown cannot see them; adding them to CALL_LINES makes the check fail ("routed lines no number() call says"). I left them out (see question).
2. GEOMANCER earth sense radius: SENSE.R 96 -> 128 px (six -> eight tiles) in src/crouch-b.js (comment updated). tools/crouch-b.mjs: new buried zombie 7.5 tiles off (past the old reach, inside the new) must be shown, and SENSE.R must equal 128. The 9-tile "far" foe still must NOT be shown. The old 5.5/9 tile assertions were unchanged, none weakened. Not proven to fail on old code by a run; the 7.5-tile foe is outside 96 px by construction.

## Checks (all green)
hint-shown, geomancer, attack-animation, audio-assets, crouch-a, crouch-b, comments, homepaths, dangling-paths.

## UNVERIFIED
No render/feel check of the wider sense ring; no bot pilots (by brief).

## QUESTIONS FOR DANIEL
- Route LOW GUARD and LOADED to the hint box too? Recommend NO for LOW GUARD (it repeats every low block, would spam the box) and NO for LOADED (the reload ring already says it). Built: left silent.
