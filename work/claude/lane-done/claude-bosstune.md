# BOSSTUNE (11-04, resumed lane) - DONE for BATCH144. Branch claude/bosstune, NOT merged/deployed.
Final tip: see last commit below (src HP/tuning only + tools/lab-perceive bot fix + tools/bosstune-probe.mjs). All raw logs: scratch/bosstune-logs/ (e-/f-/g-/h-/i-/k- logs; sum.mjs = hero x row table).
Method: built heroes, kit flasks, boss-rates --ways=built, kn/wa/ge/ra/py order. Floors: every hero >= 3/6 (>=40%).

## FINAL TABLE (values in the branch)
| boss | file | base -> final | built result (kn/wa/ge/ra/py) | pooled | floors |
|---|---|---|---|---|---|
| Lumber, Hornet Queen | - | left | 93%, 93% | ~90 | ok |
| Frog / Marsh | frog-king.js | 650 -> 900 | 5/5/5/2/6 at 800; 3/5/4/4/4 at 900 (earlier run) | 67% | ok |
| Bog Troll / Fenroad | bog-troll.js | 680 -> 730 | 4/3/5/5/6 n=30 | 77% | ok (warden 3/6; 800 had warden 2/6 and 3/12 at the 730 run before: noisy cell) |
| Spore Mother | mother-cap2.js | 1150 -> 1450 | 5/4/6/5/5 n=30 | 83% | ok (1600 left pyro 4/12 = 33%, so NOT 1600/1800) |
| Rootway | huntmaster.js | 1080 -> 1095 | 5/4/3/2/5 of 6,5,5,5,5 (n=26, 4 fights lost to guard kills) | 73% | ok (ranger 2/5 borderline) |
| Palisade | battering-beast.js | 960 -> 1700 (+rest .35/.2, py.hurt 1.0) | 3/3/6/3/5 n=30 | 67% | ok (3/6) |
| King Gorm | gorm.js | 1000/1400 -> 1075/1500 | 7/12 3/5 5/6 5/8 4/6 n=37 | 65% | ok (1150/1600 left knight 1/6, ranger 2/5; 1250/1750 ranger 3/11) |
| Chieftain / Stockade | stockade-hands.js | CRUSH.open 2.8->3.4, HORN.open 2.6->3.2 | 4/3/6/5/3 n=30 | 70% | ok (warden 3/6, pyro 3/6; was 2/6 each) |
| Underleaf | potion-hands.js | GM hp 1600->1500, open1/2 3.2->4.0, purse .11->.14 | 4/4/5/3/6 n=30 | 73% | ok (was kn 2, wa 1, geo 2) |
| Pyromancer / Burning | pyro-boss.js, main.js EHP | 1700 kept; WARD.chance .55/.7 -> .4/.55 | pyro 5/12, ranger 5/12 (42%); knight/warden/geo 6/6 at 1900-2100 | ~80-85% (HIGH) | ok (42%) |

Old HP asserts: grep of docs/*.json and tools/*boss*.mjs found none (only dated measurement dumps). Checks run, all exit 0: tools/bog-troll, rootway, sporewood2, stockade3, underleaf, palisadewood, gorm3, marsh2-beats, demo-cut, demo-floats. Full check.mjs NOT run (40 min; the gate owns it).

## Commits (oldest first)
972d8952 WIP of the dead lane's uncommitted edits | e6f0fd60 troll 730 + rootway 1095 measured, Gorm 1075/1500 | 0e13a332 pyromancer experiment + stockade/gorm/underleaf numbers | 2ec151e8 spore 1450, pyromancer 2100 | final: pyromancer back to 1700 + eased ward (see git log). Earlier: 1bb3565a bot fix 1 (warden vs Gorm), e3ddc672 first WIP.
Bot fix 1 (src/lab-perceive.js): warden skill hand does not cast javelins through King Gorm (built 0/6 -> 4/6+). Bot fix 2 (geomancer/Rootway) not reproducible.

## NOT DONE
- bare/practiced beside built on Gorm, Underleaf, Chieftain, Pyromancer (credit/time: ~45 s a fight).
- Pyromancer pooled is ~80-85%, above the 60-70 band: knight/warden/geo win 100% and the pyro/ranger floors (42%) fail above 1700. HP cannot fix it; needs a hero-specific lever (below).
- Frog 900 and Palisade were not re-measured this session (earlier-lane numbers); Spore is 83% (target 75); Rootway ranger 2/5.
- Reds: none.

## Questions for Daniel (rec first)
1. Pyromancer: accept 80-85% pooled so pyro/ranger keep >=40%? REC: yes for batch144; next lane: why the fire hero and the ranger lose to her ward (Fire Wall vs her fire, ranger vs WARD dome) and fix THAT, then raise HP.
2. Spore 83% vs target 75: accept? REC: yes (1600 starves the pyro: 33%).
3. Rootway ranger 2/5 and 73% pooled: accept 1095? REC: yes.
4. Gorm warden: accept built card cost vs bare? REC: yes. Geomancer ~100%: tune bosses, leave her. REC: yes.
