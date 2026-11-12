# DEMOTUNE (11-11) - branch claude/demotune tip aa7e6505d (pushed; NOT merged, NOT deployed). Base master df501ad26 (batch162).
Method = juice2tune's: tools/boss-rates.mjs, human profile, WITH flasks (kit), clock 420 s, NORMAL, knight/warden/pyro x seeds, ONE headless at a time. n = fights pooled over the 3 heroes. "practiced" (bare build, THE standard way the band is read; it is what juice2tune's 0-2/6 and 5-6/6 were) is the tuning target. "built" (typical card+skills) is the secondary read: your brief said "built bot" but its quoted numbers are practiced, so I measured both. Raw logs: scratch/demotune/*.log (tab.mjs tabulates).
## Baseline (master)
| row | practiced n=36 (seeds 1-12, run on master) | built n=18 |
| palisadewood (Battering Beast) | 15/36 = 42% (kn 6/12 wa 4/12 pyro 5/12) | 15/18 = 83% |
| kings (Gorm) | 28/36 = 78% (kn 6/12 wa 12/12 pyro 10/12) | 14/17 = 82% (1 page crash) |
On Gorm the knight is the weak hero and the warden wins every fight. Palisadewood is LOW on the bare bot (42%), HIGH on the built bot (83%): the "LOW" is a bare-build effect; a player with a build already beats him 5 of 6.
## Steps (n=18 each unless noted; practiced)
PALISADEWOOD: wall.tdmg 15->11: 8/18 44% (no move) | armour 0.45->0.40: 8/18 44% (no move) | telegraphs sweep+0.1, flail+0.15, kick+0.15: 7/18 39% (no move) | stuck t3.0 cap.14 -> t3.8 cap.18: 14/18 78% (over) | t3.4 cap.16: 8/18 44% | t3.6 cap.17: 12/18 67% -> KEPT; confirm seeds 7-12: 11/18 61%; pooled n=36 23/36 = 64% [48-78] (kn 10/12 wa 8/12 pyro 5/12). Built after: 15/18 83% (unchanged).
GORM (kings): openT 4->3.2: 12/18 67% (built 17/18 94%, noise) | take x0.87, n=18 (held 2->1.7, open 1.25->1.1, downed 1.75->1.5, stung 1.5->1.3): 9/18 50% then s7-12 16/18 89% (pooled 25/36 69%) | take x0.93 (1.85/1.18/1.65/1.4): 13/18 72% | take x0.77 (1.55/1.0/1.4/1.2): 27/36 75% | escape branchDmg 14->19 alone (n=36): 28/36 78% (no move) | sceptre dmg 22->28 alone: 26/36 72% | take x0.87 + sceptre 28: 20/36 56% (under) | take x0.87 + sceptre 25: 25/36 69% [53-82] -> KEPT (per hero kn 7/12 wa 10/12 pyro 8/12). Built after: 13/18 72% (was 82%).
## FINAL knobs (3 lines, 3 files)
- src/battering-beast.js:51  stuck: t 3.0 -> 3.6, cap 0.14 -> 0.17 (STUCK opening 0.6 s longer + a bigger purse; blows x2 unchanged; resist floor armour 0.45 untouched)
- src/gorm.js:28  take: held 2 -> 1.7, open 1.25 -> 1.1, downed 1.75 -> 1.5, stung 1.5 -> 1.3 (P2 openings only; P1 p1take unchanged; outside openings 0.4x unchanged)
- src/gorm.js:55  sceptre.dmg 22 -> 25 (THE SCEPTRE, the biggest damage source in wins and losses)
- tools/gorm2.mjs:126 pin restamped: held x2 literal -> GORM.take.held (&& > 1). The only pin moved.
## FINAL table
| row | before practiced | after practiced | before built | after built |
| palisadewood | 42% n=36 | 64% n=36 | 83% n=18 | 83% n=18 |
| kings (Gorm) | 78% n=36 | 69% n=36 | 82% n=17 | 72% n=18 |
Palisadewood is in band on the practiced way. Gorm sits at the TOP EDGE (69%, CI 53-82, indistinguishable from 70); built 72%. NOT in the 60-70 band with confidence for either boss: n=36 cannot resolve +-15 pts. Gorm is insensitive to every knob (escape branches, openT, sceptre alone, take alone each left it 69-78%); only take+sceptre together moved it. Pyro is the weak hero on the beast (5/12), knight on Gorm (7/12) - hero spread is wider than the boss change.
## Checks (each alone)
node: palisadewood (all green), gorm2 (green after the pin restamp; RED before: held x2 literal), gorm3, boss-read: green. Browser (one at a time, >= 6 GB free): boss-openings, boss-greed, normal-health, gorm-scaffold-reach, gormburn: exit 0. boss-fight-end: exit 0, all 74 fights (57 bosses, 17 minis) end on boss death.
## NOT verified
No full suite; no combat-replay/demo-impact/boss-navigation/boss-jump (not run); no juice or art checks; no human playtest; no co-op rates; no master rebase (branch is off df501ad26). What's New/pins/credits untouched. Gorm built-way and palisadewood built-way at n=18 only.
## RECOMMENDATION: SHIP palisadewood stuck change (YES); Gorm change SHIP-IF-WANTED (low risk, small, honest, but unproven in band; DO NOT block the demo on it). Branch is 3 small value edits; flag-free, so merge = live. Ship both together as ONE batch or palisadewood alone.
## Questions (rec first)
Q1 Which way is the band read on - practiced (bare) or built? REC practiced stays the standard; palisadewood built is 83% and I did NOT raise it further. If you want built, palisadewood needs a HARDER tune (revert my stuck change and cut hp/damage) and Gorm is already ~72%.
Q2 Accept Gorm at 69% (n=36) as in band? REC yes, ship; re-measure at n=36 post-demo with the knight-weighted seeds.
Q3 Pyro on the beast (5/12) and knight on Gorm (7/12) are low hero-specific rows: separate hero-tuning lane? REC post-demo only.
