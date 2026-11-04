# NESTPOLISH lane report (claude/nestpolish, base claude/batch143 e9f7015c) - HARD CUTOFF Fri 11-06 12:00
Branch tip: see `git log claude/nestpolish` (tip = the report commit after 1771719c). One commit per item, drop any one cleanly.

| # | Item | Commit | Status |
|---|------|--------|--------|
| 1 | Readable smoke pots + bot lob | d338ff16 | DONE (code), CHECKED by node (tools/hornets-nest.mjs 270 ok incl. 3 new lob checks; hornetsnest-fog 15 green). OWED: frame strip of the glow + hint box (textfit-safe look), bot pot-lob n=6 knight + one pot hero |
| 2 | Platforming cleanup | b1c811af | DONE + CHECKED (lint, hornets-nest 270, demo-floats, demo-cut). Foes moved to the section ends; see lint note |
| 3 | Queen fall | 07608578 | DONE (code). OWED: frame strip of the 5 tumble frames + crash + still (tilt 2.2/3.1 frames unseen) |
| 4 | Nest deepens | 1771719c | DONE (code). OWED: 6-spot depth strip, perf phone >= 40 |
| 5 | Pacing / medals / restamp | - | OWED (needs a browser: the gate flag was up) |

## What changed
1. Pots: soft pulsing warm glow (HNP.glow in src/redraw/hornets_nest_props.js) behind every full stand (hall 1.0, level 0.7) and every set-down pot; NEST_HINT.queen 'THROW AT HER: HOLD UP AND ATTACK, AND LOB THE POT AT THE QUEEN. SMOKE ON HER GROUNDS HER.' shown the first time a pot is in reach inside the arena (once per save: tell() called twice because ctx.told needs >1). Bot: lobPlan/lobHits in src/hornet-queen-plan.js - samples the HIGH arc (105 px/s out, 325 up, g 620 = ~85 up / ~110 out), throws (UP+ATTACK) when her body is on it, not when smokeCd > 0, warded, open or asleep; in P1 and P2. No Queen tune number touched (BOSS_TRIM etc. untouched).
2. src/hornets-nest.js: gallery hornets -> one at the sill (166,24), two at the exit (214/217), stinger (215,31), drone (217,31); well -> two hornets + stinger at the lip (293/296/291), amber hornet (352,8), swarm (349,8) at the exit, exit stinger kept at 343,9. Level hash CHANGED.
3. HQ.crash 0.55 s, HQ.fallFrame 0.085 s (art timings only). POSE fall0..fall4 (tumble, loops 1-4 on a long drop), crash (flung flat, wings splay), still (wings drooped, no twitch, no stars/smoke). e.fallT/e.crashT are visual counters; the dazed stun clock, hitbox and HQ.dazed numbers are unchanged. Dust burst 10 -> 16 puffs + a rolling tan ring (crashFx).
4. Backdrop: depthOf(col 80..395); grey-tan second paper layer over the wall (alpha 0 at the gate -> 0.39 deep, faded out at the hall so the resin vault keeps its own look), hanging combs 25% -> ~87% density, paper flecks 8 -> 30, far wasps 2 -> 7 (+1-2 by the mouth outside), curled scrap sprites drifting down cols 30-120. Audio: new ambient kind 'hornetdeep' (cave air + the existing pines' synth hum, no new files) and ambient.depth(k) so the hum gain goes 0.05 -> 0.25 with depth; main.js feeds it each frame.

## Lint note (item 2)
tools/platforming-lint.mjs hornetsnest: 2 sections before and after (x39-86 11b/63t, x335-339 7b/37t). The foes were NOT what kept the Gallery and Well west side out: their strips read P/S, not F. Gallery = near-miss 4b/18t (x172-190; the bridge comb is not counted as a beat, then 32 route tiles to the next beat); Well west = drop + ride, then 27 tiles of sticky bed to the first rung hop. Joining them needs a 5th beat in each (geometry, not foes) - not done (hash + route risk). Foes are now at the ends anyway per the rule.

## Checks run
node --check on every touched file; tools/hornets-nest.mjs 270 ok; hornetsnest-fog.mjs 15 green; demo-floats ok; demo-cut green; level-quality hornetsnest: only pilot + mash FAIL ("level changed since pilot/mash ran, hash 0523739b4e62 -> cbade46ed6c3") - needs restamp.
NOTE: I ran tools/hornetsnest-fog.mjs (one headless browser, short) twice before I noticed GATE-RUNNING.flag (created 10:48). No other browser was started.

## OWED after the gate (coordinator restarts)
- Browser proof: frame strips (pots glow + hint box, Queen fall frames, depth at 6 spots), bot pot-lob n=6 knight + one pot hero, perf phone >= 40 (tools/hornetsnest-perf.mjs), textfit of the new hint.
- Item 5: timed walker run (docs/walk-curve.json row), set MEDALS hornetsnest from it, then node tools/level1-pilot.mjs hornetsnest --write, mash-bot --write, tools/restamp.mjs --level hornetsnest.
- Shots dir (empty for now): scratch\lane-reports\nestpolish-shots\

## Questions (recommended first)
1. Join the Gallery and the Well into real lint sections by adding one beat each (a crumble hop on the sump bridge / two hops on the sticky bed)? Rec: not before the demo; do it the week of 11-16 with the boss-tune.
2. Keep the soft glow on ALL level stands (0.7) or hall only? Rec: all (it teaches the pot before the Queen).
3. Hint wording ok ('THROW AT HER...')? Rec: keep.
