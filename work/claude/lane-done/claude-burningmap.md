# claude/burningmap - THE BURNING VILLAGE unreachable "by default"

CAUSE: the map road to THE BURNING VILLAGE (and THE UNBURIED FIELD) is gated by `opensOn: { level, medal: 'silver' }`
(claude/spurs, 2026-09-25): the junction level must be beaten UNDER ITS SILVER TIME (Stockade 8:00, Witchlight 7:30). A clear
at any other pace left the road shut, and the only on-map hint was a one-line plate drawn only while standing on the junction.
Level select ignored the gate, hence "you have to use level select". NOTE: the stated rule in the coordinator message was
"clear KINGSWOOD in under 5:00"; the code says STOCKADE in 8:00 (Kingswood's 3:00 is UNDERLEAF's rule). I built on the code.

FIX (Daniel's decision: keep the time rule, SHOW it): pressing toward a shut class road (keys/pad up/down) or tapping/clicking
its node raises a 6 s tip: "LOCKED: BEAT THE STOCKADE IN 8:00 TO OPEN THIS ROAD" + "YOUR BEST THE STOCKADE: m:ss" (or "YOU HAVE NOT
CLEARED IT YET"). Earning the medal on a first-time win toasts "<NAME> IS OPEN: A NEW ROAD OFF THE MAP". The opensOn gate itself is unchanged.
Also: opensLocked/spurReqText accept an `opensOn` with no medal (opens on a clear) - unused now, available.

CHECK: tools/level-reach.mjs (added to tools/check.mjs with class-spurs, which was not in the suite): from a fresh save, enters and clears
every unlocked map node (junctions cleared at the medal their side road names, secrets by their stated feat) until nothing opens, then
asserts every LEVELS id is reached (OFF_MAP lists the only exception: harbor, removed from the road 09-20; shops/trials/custom are hidden
non-campaign), every spur steps on from its junction with the real key press, the shut road SHOWS its rule and best time, and every hero
coinNeeds level is reachable. Red first on the old rule when the junction is cleared without the medal (the earlier probe: burning and unburied).
OTHER ORPHANS: none beyond the two class roads.

ACHIEVABILITY (estimate, not a bot run): Stockade route 479 tiles at base RUN 92 px/s = ~85 s of pure movement, plus 6 ambushes and the Chief;
silver 480 s gives >5x slack. Witchlight route 670 tiles (~117 s floor) vs silver 450 s. Neither is MEASURED with a human/bot clear.

## QUESTIONS FOR DANIEL
1. Rule mismatch: is it Stockade-8:00 (as coded, also Witchlight-7:30 for the Unburied Field) or "Kingswood under 5:00" you meant?
   Rec: leave as coded; if you want 5:00, change MEDALS stockade silver / opensOn and the tip follows automatically.
2. Want a measured good-play Stockade time (bot pilot lane)? Rec: yes, before shipping the shown rule.

## UPDATE 10-07 evening: the rule is now STOCKADE UNDER 5:00
Stored as `opensOn: { level: 'stockade', time: 300 }` (src/level.js); the Stockade's MEDALS row is untouched. opensLocked compares PROG.stockade.best (raw
clear seconds) <= time; spurReqText/tip read "BEAT THE STOCKADE IN 5:00 TO OPEN THIS ROAD" + your best; the unlock toast fires on the first sub-5:00 clear. The Unburied
Field is unchanged (Witchlight silver 7:30). class-spurs (5:01 stays shut even at gold medal; 4:59 opens) and level-reach (clears the junction at the time) follow.
MEASURED (no whole-level human bot exists; these are the closest tools, NOT a proven 5:00): tools/level1-pilot.mjs main-route walk with lifts at 33 winch/lock points and
almost no fighting (2-5 kills): ~9600-9840 frames = 160-165 s for knight/warden/pyro. Chief boss lab (firsthour-pilot, 2 seeds each): knight 37-50 s, warden 52-76 s,
pyro 47-50 s, 6/6 wins. So route (~165 s) + boss (~50-75 s) = ~3:35-4:00 BEFORE the six ambushes and the fights en route, which the route bot skips. Likely
achievable by a good player but unproven and probably tight for a normal one. QUESTION: want a real-keys whole-level pilot lane to measure it (rec: yes), or loosen to 6:00?
