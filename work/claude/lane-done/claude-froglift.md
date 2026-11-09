# FROGLIFT (claude/froglift, 11-08) - FROG KING "BITE HIS OWN FLY", code only, flag OFF
Brief: scratch/brief-bosslift-1108.md 1 (Daniel approved). Plan: scratch/lane-reports/bosslift-plan.md (Frog section, all 8 recs accepted).
Branch: claude/froglift off master 85d152eb8. Tip: see `git log -1 claude/froglift` (SHA in scratch copy).

## Flag
- `BOSSLIFT_FROG_SHIPS = false` in src/frog-king.js. Switch to see it: `?bosslift` in the URL, or `globalThis.__BOSSLIFT = true` (PVP_SHIPS pattern). `frogLiftOn()` is read live.
- Flag OFF = live fight unchanged: tools/frog-fly.mjs (e) - a fixed-seed court + bot-hands trace with the flag off hashes 8fe7ede8abab49aa, the SAME hash as master's
  src/frog-king.js (with the flag ON it hashes differently, so the check has teeth); every `(claude/froglift)` line in main.js is FLIFT_ON()-gated or only reached by lift-only modes.

## What's built (numbers in FK.fly)
1. TELL: flies guaranteed at least every 11 s (P1) / 9 s (P2) (`e.flyT`, after the bellow check in idle). Line "SWAT THE FLIES AT HIM" (replaces "LEAD THEM ONTO HIM" with the flag on).
2. SWAT: a blade blow (attackBox), raised shield or deflect (P.block / P.warding) touching the cloud within 260 px of him BATS it ("SWAT!", squelch, 0.04 hitstop).
   The batted cloud homes on his mouth at 220 px/s with a green greybox streak.
3. PAYOFF: he snaps at once from idle/swarm/land/tongueTell/spitTell/snapTell (otherwise the cloud waits at his lips): flyEye 0.35 s (eyes, frame 17) -> flySnap 0.2 s (8)
   -> GULP 0.5 s (11, greybox) -> BLOAT 0.4 s (20, greybox) -> BELLY-UP 3.0 s (P2 2.6 s) at x2, capped 0.12 of his HP (existing bellow.take + frogShake). selfBites++, flyBellies++.
   The old route (lead the cloud onto his head as his tongue comes) also goes to GULP -> belly-up.
4. MARSH RULE: on belly-up the leaves in both lanes beside his pad rise FIRM for belly + 1 s ("THE POND LIFTS THE LEAVES"; a leaf under in a reshuffle comes up at once;
   the flop's wave cannot sink a risen leaf; a reshuffle ends the lift); then each leaf goes back to its own kind. Greybox green rim on risen leaves.
5. FAILURE: a swat > 260 px away ("TOO FAR: THE FLIES SCATTER") or while he crouches/leaps ("HE IS AWAY: THE FLIES COME BACK"), or a batted cloud he never snaps in 2.5 s,
   scatters; it re-forms on you after 1 s. Do nothing -> the existing snap/tongue GRAB.
6. P2: cloud sticks +0.3 s, drains 30/s (was 20), he spits it as he lands from a leap; belly-up TIPS his pad: he slides to the pad edge over the lane on the swatter's side.
7. BELLOW: the 3-hit sac burst becomes DAZED 2.4 s (x1.5, take 0.045) - the fly owns belly-up. Ring + hopper call unchanged.
8. BOT / AI partner (frogPlan): cloud on me + him within reach-20, not crouch/leap -> face the cloud and swing (shield if it has one); PLAN.missLead keeps misplays;
   flyEye/flySnap/gulp/bloat in its open set. lab.js untouched (it already passes FKC.show(), now with batted/scatter).
Resist: unchanged (0.6x off-opening, 0.4x mid-air; gulp/bloat are 0.6x). Never invulnerable.

## Files
src/frog-king.js (FK.fly, flag, court lift machine, frogPlan branch); src/main.js 10 single tagged hook lines (import, frame map, FX bundle, idle flies, swarm line,
led-route bite, case line, P2 tip, frogBurst daze, swat in updatePlayer); tools/frog-fly.mjs (new); tools/check.mjs (frog-fly in the node list).

## Checks run (node, one at a time, no browser)
frog-fly ok (a-g; bot swats 6/6 seeds) | marsh2-beats ok | marsh-exam ok | blow-tags ok | comments ok | first-cards ok | node --check main.js ok.

## Owed
- ART lane (BOSSLIFT-FROGART, sonnet): GULP frame, BLOAT x2, swollen belly-up, swat streak + risen-leaf VFX, P2 pad tip; sounds (swat thwap, gulp, burp-croak). Greybox poses now: 17/8/11/20.
- Browser: stills of swat -> belly-up (P1, P2 tip), and the page tools: frog-stills150, boss-rates/lab frog rows, hint-shown, any marsh chase/bot page tools. Not run (release gate holds RAM; no headless browser).
- n=6 tune (BOSSLIFT-TUNE) with the flag on: knight/warden/pyro, kit flasks, NORMAL, marsh L3. HP 800 -> ~900 likely (more belly-ups); not tuned here.
- Co-op: a second cloud for extra seats in P2 (plan) not built - the 0.12 cap holds either way.
- Nightly suite (marsh small-adds row may move with frogPlan, flag on only).

## Questions (rec built)
1. P2 tip: he slides to the pad edge (half over the lane) but heroes on the royal pad edge can still reach him - strictly "only from the risen leaves" needs a hurt gate. Rec: leave it reachable from both (simpler, no new resist rule); revisit after stills.
2. Shield/deflect bats the cloud whenever the cloud is in front of a raised guard. Rec: keep (generous; it is the signature) - tune lane watches the rate.
3. Batted cloud while he is in flopTell/bellowTell waits at his lips and he snaps the moment he is free. Rec: keep (never wastes the swat).
4. HP 800 -> ~900? Rec: let the n=6 run decide; do not pre-bump.
