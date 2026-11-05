# FOG CANAL FIX lane report (claude/fogcanalfix, from master 42a1d4cd) - code-only, no browser opened
Only file changed: src/fog-canal.js. Not merged, not deployed.

## Sections added (platforming-lint, 0 -> 2)
1. THE MILL CLIMB: 5 beats / 32 tiles, x69-94 (ride into the first lock, the lock steps, the mill's staggered floors up to y20), 16-23% of the route. The mill wharf's two dockhands came off it (one now waits on the far bank by the mill bridge capstan, x119, beside its archer; the other is gone).
2. THE FLIGHT LOCK RUN: 6 beats / 25 tiles, x205,y27 -> x230,y16 (chamber-one ride, chamber two, chamber three, summit gate ladder), 51-57%. Lifted off it: the chamber-one ledge bargee (x206), the second chamber's grindylow (x218). Chamber one keeps its stranded grindylow (UPGRADE A, a canal.mjs assertion), moved to the gate end x199 so it falls in the run's lead-in, not the run.
Fight breaks: removed the fog wall's water grindylow (x179), one of three towpath bargees (x65), the stop-planks' water grindylow (x286, planks keep 293); the tunnel-end grindylow moved to the deep lock's reach (x327).
Foes 28 -> 24 (-4, ~14%); difficulty about the same otherwise; no shrines/checkpoints added. Fight stretches 23 -> 20 of 56 (41% -> ~36%). Rest stretches still 1 (the summit checkpoint, which is inside the flight run).

## Lint before / after
- platforming-lint: 0 sections -> 2 (1 near-miss 3b/15t at x16 left).
- level-quality canal: all rows ok except pilot + mash (hash stale, browser owed). blocking WARN unchanged (report-only). density 2.25 -> 2.00 (ok), encounters 37 -> 33.
- anchor-lint / floating-geometry: unchanged (23 anchor faults listed, 17 floating groups listed; nothing gated). No geometry added.
- tools/canal.mjs --no-page: ok.

## Browser owed
- node tools/level1-pilot.mjs canal --write (pilot hash 3e4445d07050 -> ff0b09be852b), node tools/mash-bot.mjs canal --level canal --write, and node tools/level1-pilot.mjs canal --curve. Plus the canal.mjs page checks (opens a CDP page). One eye pass: the barge actually crosses both runs with the dockhands gone, the chamber-one grindylow at x199 still strands on drain.
## Art owed
None (no new foe/tile).

## Questions (rec first)
1. Foes are -4. Rec: accept (the fog wall and tunnel were the stacked parts); alternative: re-add 2 bargees off-route on the far bank for difficulty.
2. Rest: still 1 R stretch. Rec: a lock-keeper NPC rest post-demo at the summit approach rather than another checkpoint (Daniel: fewer). 
3. The sections are barge/lock-ride beats as the walker models them; rec: a later M lane adds real on-foot hops (gate-top walkway) if Daniel wants footwork there.
