# HCPROOF - browser proof for the Highcrown set (sonnet, 11-08) - claude/hcship

Merged origin/master (262faf01a) into claude/hcship: one conflict, docs/updates.json (kept our batch 153 on top of master's 152). Master has since moved to 85d152eb8 (batch 154): re-merge before the gate. Not merged to master, not deployed, check.mjs not run, nothing stashed, only my own PIDs killed (one node run I stopped myself). RAM crashed 4 of the first 54 Princess pages (Inspector.targetCrashed; another lane's run was beside mine); every later run had 0 ERR.

## Rates (built way, WITH flasks, n=6 a hero, L21, 9 heroes = 54 fights)
Heroes in order: knight, warden, geomancer, ranger, berserker, pyro, paladin, pirate, reaper

| Boss, version | per hero (wins of 6) | pooled [95%] | avg fight |
|---|---|---|---|
| Princess v0 (as merged: hp 1100, 0.5x, pin 3.5) | 5/5 3/4 5/5 5/6 6 6 6 6 6 | 96% (4 ERR) | 71 s |
| v1 hp 1700, 0.42x | 6 6 5 4 6 6 6 5 5 | 91% | - |
| v2 hp 2400 (stopped: sponge, coordinator) | not finished | - | - |
| v3 hp 1600, pin 2.8, cap .15, x1.2, bell cd 10, waves 75/40 | 5 5 5 **0** 5 6 6 4 5 | 76% [63-85] | 93 s |
| v4 hp 1500, damage eased | 5 6 6 1 6 6 6 5 5 | 85% | - |
| **v5 (KEPT)**: v3 + trinket 8, rapier 28, pin 2.5, cap .12, x1.15, bell cd 12 | 6 5 5 **2** 6 6 5 3 5 | **80% [67-88]** | **104 s** |
| v6 three waves 85/60/35 | 6 6 6 **0** 6 6 6 5 5 | 85% | 98 s |
| v7 gap .38/.3, trinket 6 | 6 6 5 2 6 6 6 6 6 | 91% | 100 s |
| v8 = v3 + trinket 8 | 5 6 5 **0** 5 6 6 6 6 | 83% | 97 s |
| **Goblin Queen v0** (as merged) | 0 0 0 1 0 0 0 0 0 | 2% | 31 of 53 deaths in the ESCAPE |
| Queen v1 (escape fire 3 / 0.8 s) | 0 1 1 0 0 0 1 0 0 | 6% | rows identical to v0 for the same seed: fire was not the killer |
| **Queen v2 (KEPT)**: escape shards 4 dmg (was 10), fan every 4.5 s | 5 4 4 5 6 4 **2** 3 3 | **67% [53-78] IN BAND** | 36 won, 15 hall deaths, 2 escape deaths, 1 timeout |

Princess: NOT IN BAND (80% vs 60-70). Best of 8 = v5 (no hero at 0; ranger 2/6, pirate 3/6). v3 was closer pooled (76%) but ranger 0/6. The coordinator's cap (v7, v8 then stop, HP under 1600) was respected.

Why the bots win: melee heroes parry her told rapier / flurry (guard counts 11/11/18 on the shield heroes) and strike the bell rope and winch with their blow box, so her 0.4x outside openings is rarely felt. What kills the ranger (new per-move tally `gph` in the boss row): trinkets 104-208 hp a fight and rapier 69-153. The ranger has no parry and no blow box to knock a gem away or work the winch (open question 8).

ONE structural change recommended: count a ranged hit (arrow, bolt, projectile) as a blow on the bell rope, the winch and her thrown gems, AND make the pin depend on a timed action (the player drops the grate with a timed swing at the winch, not just by standing under it), so melee winch mastery stops being free. Then re-measure: the ranger floor should rise and the knobs can go back up for the melee heroes.

Queen: paladin 2/6 (33%) is under the 40% per-hero floor. Paladin, reaper and geomancer show stuns 0 in nearly every row; gqueen3-page confirms it (below). They win only through the bell/grate opening.

## Queen bug found and fixed: escape shards ignored GQ3.esc.shardDmg
src/gqueen-hands.js: the shard hit used pc.dmg (10) in the escape too: 250-390 hp a fight, 31 escape deaths. Now `r.esc ? G.esc.shardDmg : pc.dmg`, shardDmg 4, fan 4.5 s. The burning floor eased to 3 hp / 0.8 s (spare, it never killed anyone; harmless). New measuring aids: damage-by-source tally `hb` (src/main.js damagePlayer, printed on every boss row in tools/boss-run.mjs) and `gph` (per-move tally for the Princess, src/goblin-princess.js).

## In-game stills (tools/hcproof-shots.mjs, REAL swings, one page)
Folder: C:\Users\Daniel Raphael\.claude\bracken-lanes\scratch\lane-reports\hcproof-stills\ (20 files; sheet.png = all 19 in one image). Also work/claude/shots/hcproof/ in the worktree. I looked at them:
- GATE: gate-0-alarm (tower 1, alarm rung, wooden guardroom door), gate-1-blow, gate-2-blow (counter shows 2/3, 1/3, iron grate drawn), gate-3-blow, gate-4-down. Reads well, BUT the grate already shows after blow 1: the "down" state does not look different from "rising". Art needs to make the DOWN state distinct (grate to the floor, guards behind it).
- HATCH: hatch-0-shut (bell tower; the hatch does not read as a distinct shape at 2x), hatch-6..9 (her real escape reached, mode escape; she leaps up, no clear open hatch in frame). NOT proven: the open-hatch art. Owed.
- MURDER HOLES: hole-1, 2, 4, 5, 6 loaded: fine (slot and chain visible; #5/#6 small). hole-3-loaded is mis-framed (hero ended up against the dark window wall; hole not in view). Hole #1 was struck with a REAL swing (loaded false, stone true, reload 8.6 s) but the camera left the wall walk, so hole-1-fall-3, hole-1-fall-6 and hole-1-spent show the wrong room: the mid-fall stone is NOT captured. Owed: lock the camera on the slot (about a 10 minute fix to the tool).

## CROWNREVIEW2 walk: level-walk crown (knight, warden, pyro x2) vs the SAME walk on master (85d152eb8)
Both MISS the act target and die the same way: THE FALL at col 167-208,y101 and THE FIRE at 266-320,y66 (Captains hall / bakehouse yard).
- hcship: knight 8.0 deaths (walked 41%, stuck 150,47 186,45 160,53 193,39), warden 4.0 (walked 99%, reached the Princess door at 100%), pyro 8.0 (41%).
- master: knight 7.5 (72%), warden 5.0 (72%), pyro 8.0 (44%).
So no regression from this set; the stuck points (186,45; 158,50; 406,63; 378,31) are older bot/route problems. Only the warden walked the new battlements end to end (no deaths there). Not looked at: the two THE LEADS signs, lootHeap filler, bunched checkpoints, parapet height vs a 26 px hero, the broken stretch, the rope run. Logs: scratch/lane-reports/hcproof-walk.log, hcproof-walk-master.log.

## Page tools (one at a time; logs in scratch/lane-reports/hcproof-pages/)
- exit 0: highcrown2 (all rows, incl. B15 8 hp from four swings), boss-openings, boss-fight-end (70 of 70 fights end on death), untold-told, attack-tokens, map-scale (56 boards clear).
- FAIL rule-openings: "the hall bell rung with her under its grate pins her 3 s+": got mode 'lure', pinned 0. The node test gq2mech passes and the grate pins in the boss rows (THE GRATE dmg seen), so the likely cause is the tool's lure set-up, not the game. Unconfirmed.
- FAIL gqueen3-page: a forced crown parried on the beat does NOT stun her for paladin, reaper, geomancer (knight, warden, pyro, pirate, berserker, ranger do). Real; matches the stuns 0 in the rates.
- TIMEOUT textfit (900 s, 5 of 14 scopes reached): owed. NOT RUN: mobile-perf, campaign-xp (integ). tools/crown-route.mjs is the wood's-cache tool and does not apply to crown.
- Curve restamp done: level1-pilot crown --curve and --write (docs/level1-curve.json, docs/level1-pilot.json); level-quality: every gated level clears the bar.
- Node checks green after the retunes: gprincess, gq2mech, gqueen3, bell-winch, boss-rows, boss-read, tells, blow-tags, comments, architecture, warden-id. gq2-lab is flaky as before (seed the co-op shard assert).

## Nine questions (recs applied)
1 Duskwing rename ships in this set: YES (Daniel approved; flags off). 2 Princess band 60-70 pooled: used; she misses at 80%. 3 keep the balcony shrine 358/37: yes. 4 gates stay background doors, DOWN drawn only in stills: yes, but the stills show DOWN is not distinct yet. 5 cameo is drawing only: yes. 6 portrait banner at the next Queen art pass: yes. 7 seed the gq2-lab co-op shard assert: yes, tiny lane. 8 ranged heroes count as blows on rope / winch / gems: YES, now the recommended structural change, with data (ranger 0-2/6). 9 Princess music minuet: yes, sound lane later.

## VERDICT: NOT READY for a full gate
- Princess 80% pooled (band 60-70), ranger 2/6 and pirate 3/6: out of band. Needs the structural change above, then a re-run.
- Queen 67% pooled is IN BAND, but paladin 2/6 is under the 40% floor and paladin / reaper / geomancer cannot stun her by parry (the bell/grate is their only opening).
- Owed: murder-hole mid-fall and spent stills, open-hatch still, a distinct gate-DOWN look, textfit, the rule-openings red to diagnose, the walk's review items, real-swing proof per hero (item 6).
- Fine: merge, node checks, curve restamp, highcrown2, boss-fight-end 70/70, untold-told, attack-tokens, map-scale.
- Before the gate: re-merge master (batch 154). The Duskwing stays flag-inert.
