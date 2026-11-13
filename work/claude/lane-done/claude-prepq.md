# PREPQ (11-13) - reworked Goblin Queen (both phases) on master 3c1201284, flags OFF, previewable by URL
Branch claude/prepq (worktree bracken-prepq), pushed. Not merged, not deployed, no browser run.

## Bases found
- Master 3c1201284 (batch179). Phase 1 = claude/gq5q1t 837f3a4ae (off claude/gq5q1-b, merge-base with master 2b48084aa).
- Phase 2 TIP = origin/claude/gq5q2-d d71b773dc (final report). It is built on local/origin claude/gq5q2 b605f9108 (strict ancestor, nothing newer there), which is built on origin/claude/gq5q1 b656bd3ab - the common ancestor of both phases (gq5q1-b descends from it).
- Merged phase 1, then phase 2, plain --no-ff merges, no stash.

## Conflicts (all resolved keeping both sides)
Merge 1 (phase 1): src/marks.js only (generated table) - took master's, regenerated after merge 2.
Merge 2 (phase 2):
- src/marks.js - regenerated with `node tools/tells.mjs --write` (420 tells checked, "every mark agrees"; 1195 rows).
- src/gqueen-hands.js gqHit (:93): combined the two edits: roof k = Q52 ? Q52N.dmgK : Q4N.p2.dmgK; hall k = Q5 && Q5N.hallDmgK != null ? Q5N.hallDmgK : Q4N.p1.dmgK. Hall k applies only to stage 'hall', roof only to 'roof', so no leak.
- src/gqueen-hands.js labDuty (:919): kept phase 1's `(P0, hid)` signature AND phase 2's `if (G52) ... roof -> G52.labDuty(P0, e1)` first line.
- src/main.js (import line): phase 1's line (gq5q1 imports + soldier fns) + phase 2's `import { Q52 as GQ5Q2_ON }` + its comment.
- tools/cdp.mjs: kept phase 2's added BRACKEN_GQ5Q2 env hook (phase 1 side was empty there).

## Preview URL (flags GQ5Q1_SHIPS / GQ5Q2_SHIPS both false in the tree)
One link, whole reworked fight from the hall, any hero:
  <host>/?boss=gqueen&hero=knight&gq5q1=1&gq5q2=1
(phase 1 only: &gq5q1=1 ; phase 2 only: &gq5q2=1 - a phase-2-only start jumps to the same hall; for the roof alone use the lab's roof start). Boss jump never writes a save. No parameter = master behaviour.

## Numbers confirmed on the merged tree
Phase 1 (flag on, hall only): fire.capPct 0.07, fire.every 30, hallDmgK 0.40, soldier slashK 0.75 (14->11 on the arg, hall soldier slash 19 HP on the hit), stagger 0.6 s, hallHp 2400, pyroMul 1.5. Hall guard gate = gqHallGuard() (Q5 flag AND stage hall): P2 soldiers stay 24 (DMG.soldier). Proof: "roof untouched by hall k".
Phase 2: Q52N.dmgK 0.7, sweep dmg 18, perch cap 0.08 (as Daniel/tune lane set). Daniel's phase-2-base numbers intact: src/gq4q.js is byte-identical to master (p2 hp 1000, shardPct 0.08, daze after 4). Roof bar 1000.
Level files untouched (no src/level*.js in the diff) -> level hashes unchanged.
All main.js additions are behind GQ5Q1_ON / GQ5Q2_ON (read through the diff).

## Tool-only fixes I made (flag-ON expectations; flag OFF behaviour untouched)
1. tools/gq5q1.mjs: the P2-untouched assert expected Q4N.p2.dmgK 0.6, red under BOTH flags (phase 2's lever is 0.7). Now expects Q52 ? Q52N.dmgK : Q4N.p2.dmgK. (mine, merge interaction)
2. tools/gq4q.mjs and tools/gqueen3.mjs: with BRACKEN_GQ5Q1=1 alone they were already RED on phase 1's tip (hall lever .40 vs asserted p1.dmgK .65): gq4q 1 FAIL ("jab lands ... 9 (6)"), gqueen3 3 FAILs (crown 13, geode 18, floor shard 8). Expectation now follows Q5N.hallDmgK when the flag is on. PRE-EXISTING phase-1 reds, fixed here.
3. tools/gq5q1-proof.mjs, gq5q1-stills2.mjs: hardcoded C:/Users/danie/... -> join(ROOT,'audits','gq5q1') (homepaths was red from phase 1; the same fix rel171 made for gq5p).

## Node proofs on the merged tree (logs in scratch/prepq-logs/*.log; counts are 'ok' lines, 0 FAIL)
- gq5q1 flag OFF: exit 0 (7). ON (BRACKEN_GQ5Q1=1): 120 ok, 0 FAIL. ON with both flags: 120 ok, 0 FAIL.
- gq5q2 OFF: exit 0 (7). ON: 90 ok, 0 FAIL. ON + gq5q1: 90 ok, 0 FAIL. ON both (run as a separate env): 90.
- gq4q: off / q1 / q2 / both all "ok gq4q" (68 off). gqueen3: ok off / q1 / both (136 off). gq5fix off 43 / both 43. gq5p off 74 / both 74. gq4p off 44 / both 44. gq2mech off 56. queen-stair 31 / 31. gqmusic 26 / 26. bells (8 alarms) + bell-winch ok. tells ok (and --write regenerated marks.js).
- Repo lints: level-quality exit 0 ("every gated level clears the quality bar", 706 lines; crown music borrow = WARN REPORT-ONLY, warcairn borrowed also crown - pre-existing, not a red); architecture 77 levels 613 pieces ok; comments ok; dangling-paths ok (13036 files, 46 forgiven holes); homepaths ok (after fix 3); checkpoints 290 ok; checkpoint-rule/gaps/thin/stand ok; boss-checkpoint 75 rooms ok. crown-exam, crown-route, crown-requests, highcrown2, undercrown-variety all exit 0.
- Pre-existing reds NOT mine: none left red in this set once the three tool-only fixes above are in. (The only pre-existing items were the phase-1 tool reds in the fix list.)
- tools/check.mjs not run (forbidden).

## BROWSER OWED before a flag-OFF release
1. Flag-off identity: level hash / stamps unchanged (restamp check), gate QUICK tier green, What's New line (general, "groundwork, off for now").
2. Open the preview URL in page: console clean, boss jump to the Queen's hall, throne fire / hoists / bell (phase 1) visible, then the roof with the bell perch + rope (phase 2).
3. Phase 2 reach: all 7 heroes ring the rope (gq5q2-reach.mjs), teach-miss, shots, textfit (gq5q2-textfit.mjs: 72-char hint, plates, WARDED / SHE RUNS FOR THE BELL).
4. Stills for Daniel: hall fire tell + hoist, soldier slash tell, roof entry plate, rope idle/ready/swinging, perch ward, downed, sweep arc, hatch.
5. Lab bot rope duty and the two lab hands (labDuty merge) running live; one hall-to-roof full fight with a bot end-to-end (the merge touched labDuty).
6. Hand-play the whole fight once (the human read; the bot undershoots).

## NOT verified
- The two phases have NEVER been measured together: no win-rate run on the merged tree. Phase 1 alone reads ~47-53 pct for bots (n=36, human profile, WITH flasks) - under the 60-70 band. Phase 2 tune finished at its own n=36 (see gq5q2-tune report). Combined fight length / flask economy unknown.
- Real collision reach on the rope, art, main.js hurtEnemy0 in a live fight, co-op, 6 other heroes for phase 1.
## Questions (rec built)
1. Release flag-OFF preview as is? REC yes; Daniel plays it, then decide shipping flags/bar (hall .40 vs trim 2400).
2. Run a n=36 on the merged tree (both flags) before shipping flags ON? REC yes, after Daniel's play.
