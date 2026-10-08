# claude/kingsgate - LANE DONE (Kingswood: "This gate cannot be opened")

Base: master 56c2cf92. Port 8729. Model: Opus.

## The gate
KINGSWOOD's COURT PORTCULLIS: built column 585, rows 0-13 (full height). It stands on the processional, between the
carpet-guards' cottage (door 583) and the gibbet, just before the throne room. Daniel's screenshot (kings-gate-report.jpg,
left untracked) matches the page at hero x 578-581 exactly. Its only opener is the plate on the ledge beside it
(source: `plat(298, 8, 3); ent('plate', 299, 8, { cage: 296, gate: 301 })`, built 583,8), which also drops the cage on the
carpet guards.

## Cause
The plate was placed at the ledge's OWN row, so it sat INSIDE the boards: plate y = 144 px, while a hero standing on the
ledge has his feet at y = 128. main.js presses a plate only within 4 px of the feet (`Math.abs(P.y - pr.y) < 4`), so the
plate could never go down and the gate could never lift - on a fresh run, after a death, from anywhere. Reproduced in the
page: hero standing on the ledge over the plate for 60 frames, `plate.down` false, 14 portcullis bars still up. (It slipped
through because the stuck-spot check only checks its `done` names a plate near 583,8 - which it did - and no check ever stood on it.)
Fork one's high-road plate (built 166,9) and fork two's canopy TWIST plate (built 454,9) had the same fault: dead traps,
no gate on them, so nobody was walled in, but two of the level's rule beats never fired.

## Fix (src/level.js, 3 numbers)
All three plates move one row up so they stand ON their ledges (court 299,8 -> 299,7; high road 118,9 -> 118,8; canopy
262,9 -> 262,8). Readability (A6): the court's stuck spot now glints the plate where it really is (583,7) and its nudge
names the verb - THE COURT GATE IS SHUT: STAND ON THE PLATE ON THE LEDGE; the sign at the foot of the ledges (STUCK_SIGNS
fix, x 570) now reads FIRE ARCHERS LIGHT THE GRASS. STAND ON THE LEDGE PLATE: IT LIFTS THE GATE.
tools/kings2-beats.mjs pinned the canopy plate at y 9 (the broken row); the pin moves to y 8 (same strength - it still pins
the exact tile - and the new tool asserts it stands on the ledge).

## New check: tools/gate-openers.mjs (in check.mjs's node list next to kings2-beats)
STATIC, every level: every plate/gplate stands in air on a floor (where feet press it); every gate a plate names holds a
portcullis; that plate is reachable from START (reachcore fill, gate shut); Kingswood's bell gate dropped -> the road past
it is still reachable (the roof hatch).
RUNTIME, Kingswood: court gate shut fresh, the ledge plate lifts the whole column; a death BEFORE the plate -> respawn ->
plate still presses, gate lifts; a death AFTER the plate -> gate still open (openGateCol marks it destroyed) and the hero
walks through; the kennel gate (238) shut until the Great Hound falls, open after, and stays open through a death.
Against master it fails 4 static lines (the three plates + the court plate unreachable-as-placed).

Other gates caught: across all levels the plate check found ONLY these three Kingswood plates. Gates opened by
level-specific machinery (tides, alarms, receivers, the level exit, etc. - storm, crown, longwater, lamplit, underleaf,
keep, causeway, harbor, burial, mage have portcullis columns no plate/bell/capstan/winch/mini names) are NOT covered by
this tool; their own checks (stuck.mjs spots, bells.mjs, etc.) own them.

## Checks (all on 8729)
- gate-openers static + runtime OK (new)
- kings2-beats OK; king-refill OK; reach kings 100% reachable
- stuck static 897 OK + runtime 73/73 OK; signs 757 fit, no repeats
- level-quality kings: bands + music FAIL - pre-existing on master, unchanged by this lane
- level hash moved -> mash re-stamped via tools/mash-bot.mjs: --level kings --write, then kings --write (boss 0/6, mini 0/6);
  mash-bot --assert kings OK; mash-gate 40/40

## QUESTIONS FOR DANIEL
- None blocking. Optional: the court plate's ledge sits right under the HUD timer when you stand on the carpet - if it still
  reads poorly in play, a small always-on glint on gate plates (not just after a stall) is the next step. Rec: wait for your read.
