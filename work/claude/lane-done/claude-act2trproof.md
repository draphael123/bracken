STATUS: DONE (11-04). claude/act2tr merged with master 42a1d4cd, browser proof green (538 checks, 1 red found + fixed as a test-assumption bug). Tip = `git log -1 claude/act2tr` (877104ab + the report commit on top). Pushed. NOT merged to master, NOT deployed. UCREORDER not done (as told).

## Merge (bafde6ef)
Conflicts only in src/transitions.js (barIn/barOut keep lane C's `bar` param; smoke maths = master's smokeStance/smokePan/smokeRise/smokeGlow/smokeWord, lane's older copy dropped; lane C scene block kept) and transitions-art.js (import union). main.js auto-merged; its trnDrawOverlay calls already pass entry.bar. After merge: demo-transitions 337/337, transition-woodmarsh 31/31.

## Browser: node tools/demo-transitions.mjs --browser --perf --shots (one browser, 7.2 GB free)
538 checks, 1 red -> 0 after fix. All 17 rows play (A: scree..skyroad, B: oreroad..kitchengate, C: storm/minecart scenes + crown S3), credited+saved first, gap air, moor pit bridged, arrivals solid/clear, skips, 3-4 seats, reduce, console clean.
RED: skyroad>oreroad 'nobody fell' - heroes arrive at (8,592) and walk up to y=560: Ore Road's start rises 2 tiles; the check used |dy|>20. NOT a game bug. Fix: fell = dropped (dy>20 down) + footing re-checked after the walk (stricter on footing); failure detail now prints pos. Re-run of that row green (877104ab).
PERF (phone 915x412, 4x CPU): hornets 60, fen 59.7, kings 54.6 (worst frame 99.9 ms, kingscene's, not this lane), minecart-S1 58.4, storm-S2 60, crown-S3 59.6 fps - all >= 40.
Ore Road landing pop: shot oreroad-full-b shows the gate-end beat clean; no visible snap in the shots (heroes were off-screen right at that frame). Still worth a human eye in play.
SHOTS: scratch\lane-reports\act2trproof-*.png (51; also in act2trproof-shots\). Viewed: minecart-S1 cart in tunnel (heroes on the cart, light mouth ahead - reads well), crown-S3 castle-on-peak pull-back with hero on the bridge (reads well), oreroad open beat (walls/winch fine). Not individually eyeballed: spire dais pillars, moor rock, storm-S2 pieces, raft arrival - check in the shot set.
Log: scratch\lane-reports\act2trproof-run1.log.

## Merge-readiness
Ready for the coordinator's merge once art lane / UCREORDER sequencing is decided (art-before-live: gates are GREYBOX-PLUS, S1-S3 greybox - needs the ART lane listed in lane C's report). No check.mjs run (forbidden).

## Questions (rec first)
Q1. Act II transition art ships greybox-plus: REC hold the merge-to-live until the ART lane lands (art-before-live); alt ship as is.
Q2. Kings scene worst frame 99.9 ms at 4x CPU (one hitch): REC leave, kingscene lane's.
