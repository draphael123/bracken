# GQ5TUNE-d - joint Princess + Queen tune, round 2 (branch claude/gq5tune-d off claude/gq4tune-d 0e69d1aff + origin/master merged)
All three flags (GQ4L / GQ4P / GQ4Q) stay default OFF (`*_SHIPS = false`). Tuned with all three ON, flasks = kit, practiced, knight/warden/pyro, L21, lab profile human.

## Result
| boss | n / hero | knight | warden | pyro | total | band 60-70 |
|---|---|---|---|---|---|---|
| Goblin Queen (crown) | 18 | 11/18 | 14/18 | 12/18 | 37/54 = 69% | IN (top half) |
| Goblin Princess (crown:mini) | 18 | 10/18 | 15/18 | 13/18 | 38/54 = 70% | AT THE TOP EDGE (point 70.4%) |
Queen: seeds 1-12 = 24/36 (67%), seeds 13-18 = 13/18 on the committed code. Princess: final numbers measured with GQ_LEVER = the committed table (seeds 1-12 24/36, 13-18 14/18). Knight is the weakest seat on both (11/18, 10/18), no hero at 0.

## 0. Merge + sanity
- origin/master (147 commits) merged; 4 conflicts: src/main.js MOVE_WORDS (union of both prefixes), src/marks.js (master's new manor row + this branch's gqueen superset row), tools/cdp.mjs (both env flags: GQ4L/P/Q and BRACKEN_ROAD), src/gqueen-hands.js crown-fetch end (master landed the identical fix - took master's).
- Sanity, flags ON after the merge: crown P2 takes damage (r0: 8 of 18 runs reached P2 and won with bar 0%; losses on the roof with bars 21-61%). The GQ4TUNE lab fix holds.
- Baseline after the merge (n=6/hero): Queen 4/6 2/6 2/6 = 8/18 44%; Princess 4/6 4/6 2/6 = 10/18 56%.

## 1. LAB fixes (bot weaknesses, not boss nerfs) - all gated so flags-OFF lab runs are unchanged
- Princess ALL GATES add phase (src/goblin-princess.js labDuty + src/lab.js gprincess duty): the failsafe ended 17 of 18 add phases in r0. Two causes, both the bot: (a) G-U lets its goblin (and earlier calls' javelins) out on the east gallery, row 14, 8 tiles above the floor - the duty walked to the nearest goblin by x and jumped under the gallery for 20+ s. Now: goblins on the bot's own level first, then to the gallery ladder (holds UP on the rungs; the lab handler honours a new `up` field), and off the gallery's end for a floor goblin. (b) the pike's front guard: the duty swung into it (13 s and ~120 hp per pike, knight s1 probe). Now it baits the thrust at 34 px, BLOCKS it (new `block` field; a blocked thrust staggers the pike 0.9 s) and cuts the stagger. Only reached when the room has gates (P4) / galleries (GQ4L room).
  Effect alone (ADDN 3, failsafe 30 as GQ4TUNE left them): add phase killed 11/18 (was 1/17); crown:mini 10/18 -> 15/18 = 83% (n=6).
- Queen soldiers (src/gqueen-hands.js labDuty, Q4 only; src/lab.js gqueen duty takes `block`): the lab bot never answered a goblin soldier in her fight; soldier slashes were the biggest unnamed damage ('?' 91 / fight; 140-290 in lost halls). Now a soldier within 64 px is baited (front guard drops in his tell), cut in the tell (>0.2 s left) or the slash is blocked; skipped while she is open. Effect alone: '?' 91 -> 58 a fight, crown 8/18 -> 21/36 = 58% (n=12).
- New probe: tools/gq5tune-addprobe.mjs (the add phase: ads' positions/hp and the bot's, every 0.5 s).
- Found, not changed: `gpGuard` javelins from earlier GUARDS! calls still count in the ALL GATES kill list (aliveAds = every live gpGuard) - the add phase can need 5 kills, 3 of them on the gallery. Left as is (a player who leaves called goblins alive pays for it); flagged as Q3.

## 2. Levers - before -> after (n that justified each)
| file | lever | before | after | evidence |
|---|---|---|---|---|
| src/bell-winch.js | ADDN.n (ALL GATES ads, P4 only) | 3 | 4 (plan) | lab fixed + 3 ads: 15/18 83%; + 4 ads + failsafe 40: 24/36 67% (n=12) |
| src/goblin-princess.js | GP.gate.failsafe (P4 only) | 30 | 40 (plan) | same round |
| src/goblin-princess.js | GP.pir.dmg (P4 only) | 10 | 14 (plan) | cuts kept 40/54 74% vs all three back 38/54 70% (n=18) |
| src/goblin-princess.js | GP.trinket.dmg | P4 ? 7 : 9 | 9 (= master) | same; trinket 9 alone 42/54 |
| src/goblin-princess.js | GP.stomp.dmg | P4 ? 16 : 20 | 20 (= master) | same |
| src/gq4q.js | Q4N.p2.volley n / dmg (Q4 only) | 3 x 4 | 4 x 3 | 21/36 58% -> 24/36 67% (n=12); confirm s13-18 13/18 |
Rejected: Queen p2.shardPct 0.05 -> 0.06: 19/36 = 53% (n=12; no gain). Queen volley 4 x 2 (a shard hurts 1 after dmgK): 27/36 = 75% (overshoot). Princess pirouette 12 alone: 40/54 (no change).
Note: after dmgK 0.6 a volley shard still hurts 2 (round(3 x 0.6) = round(4 x 0.6) = 2): the Queen change is one more shard a ring to send home, same hurt per shard, more total shards at her - not a damage cut. Tells unchanged (volley tell 0.6 s), resist floors untouched, no invulnerability added, P2 unchanged in kind.
Net: the GQ4TUNE Princess damage cuts (pirouette, trinket, stomp, 4->3 ads, 40->30 s failsafe) are all undone - they were compensating for the lab bot, not the fight. The Princess is back on the GQ4P plan's numbers.

## 3. Checks run (node, no browser)
gq4p, gq4q, gqueen3, gq2mech, gprincess - ALL GREEN with flags ON (BRACKEN_GQ4L=1 BRACKEN_GQ4P=1 BRACKEN_GQ4Q=1) and OFF, on the final tip. tools/gq4q.mjs asserts now read volley n 4 / dmg 3 (count assert follows Q4N.p2.volley.n).
NOT run / owed: tools/check.mjs (not allowed here); gq2-lab co-op (browser); a flags-OFF boss-rates on the merged branch (the lab changes are gated on P4 room / gates / Q4, so OFF lab numbers should equal master's - not measured); tells/untold-told/textfit not re-run (no move or text changed); pilot/curve/mash restamp still due at the flip (as GQ4TUNE said).

## 4. Questions for Daniel (rec first; the rec is what is built)
1. Princess lands at 70% (38/54), the top edge of 60-70; the harness's own mini band is 75-85. REC: accept as is (the plan's own numbers, nothing nerfed); if you want her firmly inside 60-70, the next lever is the add phase (ADDN 4 -> 5 or failsafe 40 -> 45), not her blade - damage levers moved her by under 4 points each.
2. Queen volley is now 4 shards x 3 (was 3 x 4). REC accept: same hurt per shard, one more to send home a ring; it reads as a bigger fan.
3. Leftover called javelins count toward ALL GATES (up to 5 kills, 3 on the gallery). REC keep (it punishes ignoring GUARDS!), but say if the add phase should only count its own ads.
4. The Queen soldier duty is a lab-only change under GQ4Q. REC keep; the same weakness (bot ignores adds in boss fights) probably inflates other add-heavy bosses' difficulty - worth a separate lab lane.
