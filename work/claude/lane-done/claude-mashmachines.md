# claude-mashmachines (lane report)

Level mode of tools/mash-bot.mjs now rides route machines, judges knight + warden + pyro, and level writes no longer drop boss/mini rows.

## What changed
- tools/mash-bot.mjs level mode: when stalled at a waypoint the bot asks src/stuck-guide.js resolve (the glint's "what next") or takes the nearest mover whose learned path passes the waypoint; walks (or, if it cannot jump aboard, is BOARDING-LIFTED) onto it, stands still while it carries him, steps off near the waypoint; strikes + presses E at a crank / winch / capstan / lever the route names. Never blocks/dodges/jumps; fights only by mashing. A ride that carries him past waypoints skips them (never lifted back). Rows gain rides, pulls, boardLifts, ridden{kind:n}. Kinds ridden in the sweep: barge, lift, cart, swing, raft, mover, vmover, wheel, pad etc (any BK.movers() entry). NOT handled (still a lift): hoists that want a load carried into the well (hanging), the marsh ferry toll, rope climbs, lockgates/bells.
- --no-machines (old behaviour), --quick (knight only), --debug (prints each lift and ride), --report (cache only: per-hero table + verdict changes).
- Level mode runs all three heroes under --all too (it used to be knight only: that is why 30 of 37 rows were knight-only).
- tools/level-quality.mjs mashVerdict: message notes rows judged by fewer than three heroes and shows rides/pulls; verdict logic (best hero decides) unchanged.
- Row-drop fix: tools/mash-rows.mjs carryRows; a level-only write after a hash change carries the boss/mini rows (marked carried:{from,parts}, said aloud); a boss write after a level change drops the stale level row (said aloud). Test: tools/mash-carry.mjs (in tools/check.mjs as mash-carry; proves the legacy one-liner drops rows).
- docs/mash-bot.json format unchanged (extra optional fields only). I did NOT re-stamp the file (parallel lanes do).

## Sweep (37 levels x 3 heroes, with machines, vs the old knight-only rows)
410 rides, 72 pulls, 743 boarding lifts. Verdict changes (cleared = no death and lowest hp >= 40%):
- spire: holds -> MASHABLE by pyro (74%)
- longwater: holds -> MASHABLE (knight 41, warden 44, pyro 64)
- theatre: holds -> MASHABLE by warden 58 and pyro 54 (knight 36 holds)
- deep: mashable -> holds (knight now dies; 0 rides, run differs once the bot works props)
- unchanged mashable: storm (k62 p61), keep (all three), causeway (knight 44; warden 39, pyro 32 hold). Others hold.
Both new MASHABLE levels (spire, longwater, theatre) fail the enforced gate once re-stamped (MASH_REPORT_ONLY lists only storm, deep, keep, causeway levels); deep could leave the list.
Per-level rows: see below (min hp% / deaths / rides / lifts).
```
wood          old k:0/1d/47l | new k:0/1d/0r/47l w:0/1d/0r/47l p:0/1d/0r/47l 
marsh         old k:18/0d/37l | new k:0/2d/11r/33l w:0/1d/9r/32l p:0/1d/5r/33l 
stockade      old k:0/2d/43l | new k:0/2d/2r/40l w:0/2d/1r/42l p:0/3d/3r/39l 
spore         old k:24/0d/45l | new k:0/2d/13r/35l w:0/1d/12r/32l p:0/2d/12r/33l 
kings         old k:0/1d/56l | new k:0/1d/3r/50l w:0/1d/3r/49l p:0/1d/4r/49l 
scree         old k:0/2d/47l | new k:0/2d/1r/46l w:0/6d/1r/45l p:0/2d/1r/45l 
hanging       old k:0/1d/42l | new k:0/1d/14r/44l w:0/1d/10r/46l p:0/1d/14r/43l 
spire         old k:20/0d/43l | new k:30/0d/3r/50l w:19/0d/3r/50l p:74/0d/3r/50l   <== VERDICT holds -> MASHABLE by pyro
moor          old k:0/2d/60l | new k:0/2d/1r/57l w:0/1d/1r/59l p:0/3d/2r/59l 
storm         old k:70/0d/58l | new k:62/0d/0r/58l w:0/2d/0r/56l p:61/0d/0r/58l 
crown         old k:0/6d/104l | new k:0/6d/4r/104l w:0/6d/4r/104l p:0/3d/0r/110l 
longwater     old k:28/0d/44l | new k:41/0d/3r/42l w:44/0d/3r/43l p:64/0d/3r/43l   <== VERDICT holds -> MASHABLE by knight,warden,pyro
reef          old k:0/1d/34l | new k:0/1d/4r/31l w:0/1d/6r/31l p:0/1d/3r/31l 
flotilla      old k:0/1d/28l | new k:0/1d/4r/25l w:0/2d/4r/25l p:0/1d/5r/23l 
hurricane     old k:0/2d/54l | new k:0/3d/3r/50l w:0/3d/6r/48l p:0/2d/7r/47l 
lamplit       old k:0/1d/58l | new k:0/1d/3r/53l w:0/1d/3r/55l p:0/2d/2r/55l 
underleaf     old k:0/1d/41l | new k:0/1d/0r/39l w:0/1d/0r/39l p:0/1d/0r/39l 
deep          old k:45/0d/31l | new k:0/1d/0r/54l w:0/1d/0r/46l p:0/1d/0r/46l   <== VERDICT mashable -> holds
keep          old k:60/0d/25l | new k:46/0d/0r/59l w:70/0d/0r/60l p:58/0d/0r/59l 
causeway      old k:59/0d/45l | new k:44/0d/0r/47l w:39/0d/0r/45l p:32/0d/0r/46l 
harbor        old k:0/3d/85l | new k:0/4d/1r/86l w:0/3d/1r/83l p:0/2d/0r/83l 
waymeet       old k:0/1d/63l | new k:0/2d/0r/63l w:0/1d/0r/63l p:0/1d/0r/63l 
undercrown    old k:0/3d/40l | new k:0/3d/0r/40l w:0/3d/0r/40l p:0/3d/0r/40l 
fields        old k:0/2d/65l | new k:0/4d/14r/56l w:0/1d/6r/65l p:0/1d/7r/63l 
burial        old k:0/1d/63l | new k:0/2d/3r/60l w:0/2d/3r/60l p:0/1d/6r/57l 
mage          old k:0/2d/59l | new k:0/2d/5r/55l w:0/2d/7r/55l p:0/2d/6r/54l 
fallingtower  old k:0/2d/57l | new k:0/3d/5r/69l w:0/3d/2r/70l p:0/2d/3r/70l 
burning       old k:0/1d/41l | new k:0/1d/0r/41l w:0/2d/0r/41l p:0/3d/0r/41l 
witchlight    old k:16/0d/56l | new k:0/1d/4r/56l w:0/1d/4r/56l p:0/1d/4r/55l 
oreroad       old k:0/1d/27l | new k:0/2d/5r/25l w:0/2d/6r/27l p:0/2d/7r/27l 
unburied      old k:0/1d/41l | new k:0/1d/5r/39l w:0/1d/4r/36l p:5/0d/3r/37l 
caravan       old k:0/1d/50l | new k:0/2d/0r/50l w:0/1d/1r/49l p:0/1d/1r/49l 
fair          old k:0/1d/61l | new k:0/2d/13r/55l w:0/3d/14r/53l p:0/1d/13r/55l 
theatre       old k:35/0d/48l | new k:36/0d/7r/43l w:58/0d/8r/42l p:54/0d/5r/33l   <== VERDICT holds -> MASHABLE by warden,pyro
canal         old k:0/2d/41l | new k:0/2d/6r/33l w:0/3d/8r/32l p:0/3d/10r/33l 
welltown      old k:0/1d/52l | new k:0/1d/1r/51l w:0/1d/1r/51l p:0/1d/1r/52l 
redgorge      old k:0/1d/29l | new k:0/1d/3r/28l w:0/1d/4r/27l p:13/0d/4r/27l 
rides 410 pulls 72 boardLifts 743
```

## Probe sweep (hero at a fixed offset near an arena edge)
Boss rest margins to each wall were measured on all 37 arenas and 14 minis. Right-side (+) offsets in tools/*.mjs all sit in rooms wider than the offset (burial, queen-court sets q.x itself, witchlight hedgewarden r=216, weak-bosses). Left-side risks: reef (64 px), fair (200), canal (190), hanging spider mini (88).
- FIXED tools/wicker-queen.mjs (fair, l=200): the phase-two "looked away" probe held the hero at q.x-200; now stands off on the roomy side, clamped to the arena, and asserts farGap >= 150 (ran green).
- Already right: tools/boss-greed.mjs (greedflake; farMin asserted), tools/reef-shots.mjs (flips side near the wall).
- Audited, not clamp-sensitive: boss-openings, buried-attacks, burial-shots, burning-village, weak-bosses, queen-court, witchlight, unburied3-shots (offset < margin, or boss placed by the test, or screenshot only). fairboss-shot (-140 vs l=200) is a screenshot with no assertion.

## Regenerate (integrator, after merging)
node tools/mash-bot.mjs --level <ids> --write   (all three heroes, machines on; about 15 min for all 37 split over two PORTs)
node tools/mash-bot.mjs <id> --write            (boss/mini rows; level rows of an unchanged hash are kept)
node tools/mash-bot.mjs --report                (per-hero table + verdict changes)  then  node tools/mash-gate.mjs
Then add spire / longwater / theatre level (and any other newly mashable) to MASH_REPORT_ONLY or fix them, and drop deep if it stays held.

## Checks run
mash-carry green, mash-gate green (unchanged cache), boss-greed green, wicker-queen green. UNVERIFIED: full suite.

## Questions for Daniel
1. (recommended) Treat spire, longwater, theatre level runs as report-only for now, then a tune pass: yes/no?
2. Boarding lifts are a teleport onto a machine the bot cannot jump aboard; accept, or make the bot jump (smarter than "mash only")? Recommend accept.
3. Hoist load-carrying (hanging) not simulated: acceptable? Recommend yes.
