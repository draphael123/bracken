# LANE REPORT: SCREE 3 ART (claude/scree3, task 2 of plan-scree3-1102.md)
Branch claude/scree3, worktree bracken-scree3. NOT merged, NOT deployed. Gameplay numbers and hitboxes unchanged (art + draw + one sfx call only).

## What was drawn (all baked; nothing new is code-drawn except the red stomp-tell ellipse, the 1-frame flash and grit motes, which are telegraph UI / particles)
- RAM LORD POSES (src/redraw/callerram.js bakeRamLord, frames 7-10; main.js frame map): 7 boulderTell = half reared, forehoof raking the ground, dust thrown back; 8 boulderButt = the lunge, horns driven in, body stretched low, rock chips + sparks at the horn points;
  9 headIn = wedged, hind legs braced wide and hauling, rump high, chips + dust behind; 10 stompTell = one forehoof hauled HIGH over the shoulder, other leg locked, head lowered (stamp release keeps frame 5). Frames 0-6 untouched.
- THE BOULDER (src/scree-art.js boulderFrame): 12 baked 24x24 frames of one lumpy ochre rock; strata, cracks and a moss tuft are laid in the rock's own frame so they turn as it rolls; light stays upper-left; hitbox disc r10 unchanged.
- BOULDER TELL: the rock no longer hangs in the sky. It sits lodged in a baked SOCKET (dark hollow, fractures, chips) cut into the pillar's own 16 px face, shakes, and slides out of the hollow to where it falls from during the butt (east face is 38 px past the spawn x, west 22: measured from wallL/wallR).
- STOMP / SHOCK BAKES (scree-art.js): stompCrack (3 variants, dark core + pale lit lip, opens out from the hoof in 0.12 s, holds, fades), dustRing (7 baked puff-ring frames 0 -> 46 px), shardRidge (3 variants, 5 px max above the foot = the wave's real hit height). Same ridge for the leap and P2 butt waves.
- CHOCK CAIRN prop (src/scree-lip.js bakeCairn, 32x32, stone only, no timber): three flat stones, a pale wedge chock jammed in at the top on the fold's side (mirrored for the other lip), a chalk shepherd's X, the lip's crack line above. 7 baked states: armed, glint (wedge gold; the old gold ring/arrow/floor band overlay stays), knock0 + knock1 (the blow's 2 frames: wedge flies out, stack topples), spent (rubble heap), rearm1 + rearm2 (stones settle back over LIP.rearm 7 s, grit falling), then armed with the 'creak' sfx (one added c.sfx('creak') call at re-arm).

## PNGs (scratch\lane-reports\scree3art\)
before/after crops (BEFORE = the build lane's placeholder shots): stomp-1-tell, stomp-2-release, stomp-2b-ring, stomp-3-waves, stomp-4-fading, boulder-1-tell, boulder-2-butt, boulder-3-rolling, prop-1-armed, prop-2-inline, prop-3-spent  (-before-after.png).
Contact sheets (4x): sheet-poses (row 1 = old frames 0,3,5,4; row 2 = new 7,8,9,10), sheet-boulder (12 frames), sheet-prop-states (7), sheet-socket-ridge, sheet-crack-dust. Full after frames: scree3art\after\. (sheet-socket-ridge was baked before a last socket recolour; the in-game boulder-1-tell shot is current.)
Tools: tools/ram-art-sheet.mjs (sheets), tools/ram-shots.mjs (stomp shots now taken by the fx's own age; adds stomp-2b-ring).

## Checks
ram-lord (node + page): GREEN (parity, boulder hit/miss/prop-stun, move run incl. boulderTell/boulderButt/headIn, no page errors).
textfit bestiary,hints --strict (alone): GREEN, 449 screens, all counters 0 (the earlier page crash did not recur).
level-quality scree restamp (pilot + curve + mash via tools/restamp.mjs --level scree): DONE (log scratchane-reportsscree3art-restamp.log): pilot, curve and mash rows re-stamped (hash 1e7b6c7c6795 -> e58f5bbb8028); mash-gate green; level-quality scree still RED on ONE row: curve = level-1 knight 8 deaths in 3 runs (band act 2 <= 6; old row had 6, lostPct 276 -> 387, in band 70-400). Cause is the build lane level edits (mill stack, signs), not the art; 6 WARN jumps flagged (pilot hits/kills, curve hits/lostPct, mash knight deaths 15 -> 1, pyro 7 -> 2: the mash rows got easier). OWED to the TUNE lane: look at the curve row (a re-run may land under 6 deaths; if not, a scree act-2 tweak) before merge
Not run (not asked / no RAM need): full suite, win-rate runs. Phone size: the ridge is 5 px tall, 24 px wide per piece, drawn at native scale like the old one; I did not view it on a phone viewport (OWED, cheap to eyeball in the batch).

## Questions for Daniel (recs built)
1. Boulder start x differs by side (22 px from the west pillar face, 38 px from the east, because the east arena edge sits a tile short of its wall). Rec: leave it (gameplay numbers frozen); the tune lane can equalise if it matters.
2. The cairn's wedge reads as a pale ochre chock pointing at the fold; gold only while he is in the fall line. Rec: ship as is; alt = wedge always faintly gold.
3. Frames 8 (butt) and 9 (headIn) are close cousins (low, horns in; 9 hauls with hind legs braced). Rec: ship; alt = give 9 a head-shake pair.
