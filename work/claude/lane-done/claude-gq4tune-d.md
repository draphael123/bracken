# GQ4TUNE-d - lab fix, owed checks, joint Princess + Queen tune (branch claude/gq4tune-d off claude/gq4art-d 507ab028b)
All three flags (GQ4L / GQ4P / GQ4Q) stay default OFF; OFF = master (checked: gq4p, gq4q, gprincess, gqueen3, gq2mech green OFF). Tuned with all three ON, flasks = kit, practiced, knight/warden/pyro, L21.

## 1. LAB BLOCKER (fixed, proven)
Cause was NOT GQ4L geometry: the lab's escape SKIP (src/lab-gqueen.js -> gqueen-hands skipRoof) ran while src/lab-perceive.js had the bot's "eyes" APPLIED (the bot sees a delayed boss mode). skipRoof set her to wake via bossStart, then the perception's restore() wrote the pre-skip mode back over it -> she sat in 'gone' for ever, bar 100% (it reproduces on master with the human profile too). Fix (src/lab.js, 1 line): the stage step runs on the REAL state (PERC.restore -> gqLabStep -> PERC.update/apply). Proof: crown row, escape skipped, knight s1: before = timeout 360 s, bar 100%, roof.open 5 hp lost in 270 s; after (flags OFF) win 211 s bar 0%; (flags ON) P2 takes damage (knight 288 hp lost, bar 81% when the hero died; later runs: wins, bars 0%).
Two more lab/game stalls found and fixed on the way: (a) GQ4L's tower is 7 storeys + the outside face; the lab bot has no route (it burned the whole 90 s stall in the fire, flasks included, every row) -> with TW.OUT the climb is skipped at once ('gq4l', the level walker measures the climb, Gorm precedent) (src/lab-gqueen.js). (b) a real GAME soft-lock: P2 'crownFetch' had no end (crown on the far side of something; knight seed 4: 270 s of "SHE FETCHES HER CROWN", bar 100%) -> gives up 2.5 s past the fetch's 4 s (src/gqueen-hands.js fetchStep).

## 2. OWED CHECKS (flags ON)
- boss-fight-end, crown rows (new tools/gq4tune-fightend.mjs = the tool with FE_IDS=crown): boss gqueen ended, mini gprincess ended. GREEN.
- untold-told: GREEN (23 foes told, none hurt untold). (It covers common foes; the boss moves are covered by tells/answer-tags/rule-openings from the P/Q lanes.)
- textfit boss,hints,plates: exit 0, 0 findings on Princess/Queen/crown (the 6 OFFSCREEN/1 COLLIDE/1 OVERDRAWN are rookery / fallingtower / palisadewood, not this flag).
- gq2-lab co-op: the 3 fails were hard-coded hall/shaft x (master columns) in the TEST; now ride SH_HALL (tools/gq2-lab.mjs) + the wiring regex follows the new skip line. GREEN ON and OFF (one flaky red in ~5 ON runs: 'burning floor ticks BOTH seats', random beams - not chased).
- gq4p / gq4q / gqueen3 / gq2mech: number-lock asserts now read the tuned tables (ON green, OFF green).
- pilot / curve / mash LEVEL rows for crown, flags ON, NOT written (a write would stamp ON numbers on the OFF hash; restamp at the flip, `restamp --level crown` shows all 3 due): pilot knight 3 runs: 38 hits, 4 deaths, 45 kills, 273% hp lost/run (master stamp: 31 hits, 0 deaths, 50 kills); curve 6 runs: 70 hits, 5 deaths, 231% lost (mean, sd 65); mash LEVEL L21: knight 3 deaths / hp lost 372%, warden 4 / 461%, pyro 5 / 511%. The level got longer + harder: look before restamping (WARN-size jumps).

## 3. TUNE - n per hero (kn/wa/py), practiced, kit flasks
PRINCESS (crown:mini; the harness's mini band is 75-85, the brief asked 60-70):
| round | levers | n=/hero | kn | wa | py | total |
| baseline | - | 6 | 2/6 | 3/6 | 3/6 | 8/18 = 44% |
| r1 | pirouette dmg 14 -> 10 | 12 | 6/12 | 7/12 | 7/12 | 20/36 = 56% [40-70] |
| r2 | + trinket dmg 9 -> 7 (flag ON only) | 12 | 6 | 5 | 7 | 18/36 = 50% |
| r4 (final) | + stomp 20 -> 16, ALL GATES ads 4 -> 3 (ADDN), failsafe 40 -> 30 | 12 | 5/12 | 8/12 | 7/12 | 20/36 = 56% [40-70] LOW |
QUEEN (crown, all flags, escape skipped by the lab):
| round | levers | n | kn | wa | py | total |
| baseline (lab fixed) | - | 6 | 0 | 0 | 0 | 0/18 |
| r1 | hearth jet 16 -> 12 | 6 | 1 | 0 | 0 | 1/18 6% |
| r2 | volley dmg 4 -> 3, cd 2.5 -> 3.2 | 6 | 1 | 0 | 0 | 1/18 6% (slower volley = fewer shards home = slower kill: reverted) |
| r3 | p1.dmgK 0.7 + knock-out chip 2%, p2.dmgK 0.6, hp2 1500 -> 1200, reinforcements alive 2 -> 1, volley back 4 / 2.5 | 6 | 1 | 2 | 0 | 3/18 17% |
| r4 (final) | + p1.dmgK 0.65, shardPct 3% -> 5%, daze after 4 (was 6) in 10 s, enrage tempo 1.35 -> 1.2, THE MOUNTAIN 6 -> 4 | 12 | 5/12 | 4/12 | 6/12 | 15/36 = 42% [27-58] LOW |
Reference: master (flags OFF, same lab) crown n=6: 2/6 0/6 6/6 = 44%.
Where it landed: neither boss is in 60-70 after 4 rounds (Princess 56%, Queen 42%); both are far from where they started.

## Every lever (table, before -> after, n that justified it)
- src/goblin-princess.js GP.pir.dmg 14 -> 10 (r1, n=6: 44%); GP.trinket.dmg 9 -> 7 under P4 (r2, n=12 56%, trinkets 87 dmg/fight); GP.stomp.dmg 20 -> 16 under P4 (r4); GP.gate.failsafe 40 -> 30 (r4: the lab bot kills 0-4 of 36 add phases, the failsafe is the normal exit; every add phase is 30-40 s of ad damage ('?' 50-210/fight)); src/bell-winch.js ADDN.n 4 -> 3 (r4).
- src/gq4q.js Q4N: hearth.dmg 16 -> 12 (r1); p1.dmgK 1 -> 0.65 + p1.knockChip 0.02 (new: ONE lever for every hall blow through gqHit - crown, portal, geode, charge, reach - and a 2% chip when a shard is knocked out, the Q4 report's rec); p2.dmgK 1 -> 0.6 (new, same for the tower top: volley, crown, lash, boulder, rocks); p2.hp 1500 -> 1200 (r3: P2 bars were 50-85% at the hero's death - her bar drained ~5 hp/s; hp is a weak lever alone, used with dmgK); p2.shardPct 0.03 -> 0.05, dazeN 6 -> 4 (r4); rage.tempo 1.35 -> 1.2, rage.mtn.dmg 6 -> 4 (r4). Volley 4 / 2.5 s kept.
- src/gqueen-hands.js: GQ3.p2.addMax 2 -> 1 under Q4 (soldiers were 15% of P2 damage); gqHit applies the two dmgK (Q4 only); knock-out chip (Q4 only); fetchStep end (all builds: only changes a stuck fetch).
- Resist floor never below 0.4 outside openings; every move still told (tells unchanged).
- Tooling: tools/boss-run.mjs GQ_LEVER (JSON deep-merge into Q4N / GP / GQ3 / ADDN in the page: a tune without a code edit), tools/gq4tune-p2.mjs (P2 alone), tools/gq4tune-probe.mjs, tools/gq4tune-sum.mjs (damage-by-source and end-stage tally), tools/gq4tune-fightend.mjs.

## What the data says (for the next tune)
- Queen P1 is as hard as master (hall deaths 6/18 in both); P2 is the wall: her bar drains ~5 hp/s because a standard (400 ms reaction) bot sends home about one shard in six seconds, while P2 deals ~4 dmg/s (2.5x P1). Her damage mix in P2 (hit log): portal/volley shards ~35%, reinforcement soldiers 15%, crown 11%, banner lash 8%, bell charge 6%.
- Princess: 1/3 of losses are inside the ALL GATES add phase (bot never kills the 3-4 ads in time; the javelin on the gallery gate U is out of reach), the rest in late P2 (pirouette / stomp / trinkets) with her bar under 25%.
- 4 rounds is not enough; the next levers, by what the data shows: Queen: shardPct 7% or volley n 3 -> 4 with dmg 2 (more homes), P1 reach/jet cd, hall knock-out stun 0.5 s; Princess: lab duty to kill ads first (bots should reach the gate-U javelin) / ad dmg, tiara dmg 18 -> 14, gate maxAlive 3 -> 2.

## Questions for Daniel (rec first; the rec is built)
1. Princess band: boss-rates scores minis 75-85, this brief says 60-70. REC: keep 60-70 as asked and read 56% as 'close'; fix the lab bot's add-phase duty before any further number change (it inflates the add phase).
2. Queen P2 is a race the standard bot cannot win by shards alone. REC: keep dmgK 0.6 / hp 1200 and next raise shard % or volley count (more homes) rather than cut her damage further.
3. I changed the accepted shard rule (3% a shard, daze after 6 in 10 s) to 5% / 4 in 10 s. REC accept (at 3% P2 was a ~190 s fight for the bot); watch it in playtest.
4. The lab no longer plays GQ4L's burning tower (skipped as a level-walker job). REC keep; a real player climb is unmeasured (est. 105-140 s).
5. The crown-fetch game fix is in all builds (flags OFF too). REC keep (it only changes a stuck fetch).
