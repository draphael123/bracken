# COOPAI - AI partner fixes 1,2,5,7 + XP share (branch claude/coopai from master 9ff9bd70, worktree bracken-coopai)

NOTHING WAS RUN IN A BROWSER (GATE-RUNNING.flag was up). All checks are node-only; the page checks below are OWED.

## What changed
1. XP SHARE (X1, Daniel 11-04 17:07). New pure module src/xp-share.js (hitRecord, payeesOf). main.js hurtEnemy records the active pass on the foe (e.hitBy) when the party has 2+ bodies; xpKill, in co-op, pays the first-kill XP in FULL to every hero that damaged the foe, each in HIS pass (asPlayer: his hero, his save/view, his catch-up and soft cap, his level-up ring). The old body is now xpPay(e). A body with no save of his own (default AI, lent/guest hero) folds into player one, so an AI that takes the kill no longer costs P1 the XP; the killing pass counts as a hitter (DoT/bomb kills). Bosses/minis/mother-heart go through the same xpKill. Online: a guest on his own snapshot is a prof seat, so he earns for his OWN hero into his own ledger (credit path unchanged). Solo is the unchanged path. Hook left for COOPPING lane: comment 'HOOK (COOPPING lane)' in xpKill - items/charm credit rides the same payee list.
2. AI FIX 1 (route): the AI now routes by the walker's own movement graph (src/walk-graph.js, lazy-loaded in allyLoad, built once per level on first need, ~11-17 ms measured in node). When the leader is on another row (>24 px) or the AI has been stuck 0.8 s, it paths footing to footing (~2x/s, cost cap 320) and walks to the LIP of the first climb/drop (hops there for a climb, steps off for a drop) instead of pushing at his x. No route for 1.5 s while apart = it holds (S.wait) so the told catch-up comes, no more wall-testing. Flat routes keep the old x goal.
3. AI FIX 2 (foe pick): dy gate 40 -> 96 for ranged kits (ranger, pyro), 56 for the rest (beyond 40 only when the foe is within 60 px in x); casters/archers/priests (shaman, archer, priest, e.cast) get -60 score; a foe on another ledge +30 (beside-him foes first).
4. AI FIX 5 (flasks): FINDING - shrineFill (since coopbalance) already refills every seat incl. the AI by its own save when P1 lights/touches the shrine, so the report's "P1 only" was stale. Added: allyShrine(p) in allyTick - an AI standing at a lit shrine it has not refilled this life gets the shrine's refill (once per shrine per life, 'FLASKS' number), covers an AI that arrives with spent flasks.
5. AI FIX 7 (cues): the AI says WAITS / NO WAY UP / STUCK over its head (seat colour) before the catch-up puff; CATCH.stuck 2.5 -> 3.5 s (fewer teleports; the puff still fires at 'far'/'wait').
6. index.html: modulepreload for src/xp-share.js.

## Files
src/xp-share.js (new), src/main.js, src/ai-companion.js (CATCH.stuck), index.html, tools/xp-share.mjs (new), tools/ai-route.mjs (new). Commits: step 1 XP share; step 2 AI; step 3 preload+tests+report (see git log claude/coopai).

## Node checks run
- node --check src/main.js, src/ai-companion.js: OK.
- node tools/xp-share.mjs: ALL OK (8 cases: hitter once, seat+P1, seat-only kill, AI kill folds to P1, no double pay, departed hitter, no hitters, no party).
- node tools/ai-route.mjs: ALL OK on wood, marsh, storm, hanging, skyroad: graph 11-17 ms, paths found 12-18 of 14-18 probes (missing = off-footing probe cells), slowest path 4.8 ms, rows change on many paths.
- node tools/modulepreload.mjs: 737 listed, 0 missing.
- NOT run: tools/check.mjs full suite (per rules).

## Browser checks OWED (after the gate flag is gone, one at a time, >= 1500 MB free)
- tools/ai-companion.mjs follow (Lumber Trail: catch-up count vs 8-11 before; stuck time) + fight + raft; a vertical level (Hanging Village / Sky Road) follow run - the route/lip logic is UNMEASURED live and may need lip-jump timing tuning.
- tools/coop-progress.mjs + online-coop.mjs: confirm the share (host + seat both gain XP from one kill; default AI kill pays P1); a boss with a saved seat.
- tools/coop-flasks.mjs for allyShrine.
- Perf: allyRoute runs ~2x/s only when apart; watch frame-cost with an AI on a big level.

## Questions (rec held, built the rec)
1. Ranged list for the wide dy gate is ranger+pyro only (rec; add geomancer/reaper if their kits shoot far).
2. CATCH.stuck 3.5 s is a guess pending the follow run (rec: keep, retune after the measured follow).
3. Boss plans/ult use (coopaudit fix 4) and verbs (6) not in this lane (not assigned).
