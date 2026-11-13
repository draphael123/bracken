AUDIT OK: both claude/wardenbot src edits are lab-bot only and cannot change a human player's game (proof below).

# WARDENMEASURE (11-13, browser re-measure of claude/wardenbot 97496b6cc; no numbers changed, nothing merged or deployed)

## 0. Audit (diff 97496b6cc vs origin/claude/sea5)
- src/freebooter-boss.js:180 (standX) is inside fbLabPlan. fbLabPlan's ONLY caller in src is src/lab.js:1820, inside runbossLab (lab.js:922, the whole function runs only via exported bossLab, lab.js:906, reached from the debug API window.BK.bossLab at main.js:38970, never from play). The second caller is tools/wardenbot-duel.mjs. Extra guard: `s.tip` is only set for `h==='warden'` (lab.js:1820), else standX = 14 (old value).
- src/lab.js:2550 (face flip) sits in runbossLab's Kraken block, guarded `h === 'warden' && LABP.v2`. The in-game ally AI imports lab.js (main.js:2218) but calls only labDuelFrame (lab.js:3548, outside runbossLab), so it does not run this line.
- Neither edit touches main.js or any shared game module. Human play unaffected.

## 1. Tables (flasks ON = kit, practiced, normal, n=6 per hero; one headless Chrome at a time, --jobs=1)
| boss (L) | before (seawalk1, master bot) wa/kn/py | AFTER fixed bot wa/kn/py | overall after | band 60-70 + every hero can win |
|---|---|---|---|---|
| Freebooter piratefleet (26) | 0/6 6/6 6/6 = 67% | 1/6 5/6 5/6 | 11/18 61% [39-80] | overall IN band, NOT every hero (warden 1/6) |
| Kraken causeway (30, CW3) | 1/6 5/6 6/6 = 67% | 2/6 5/6 4/6 | 11/18 61% [39-80] | overall IN band, warden 2/6 weak |
| Flotilla (25), warden only | 51-71% left, losing | 1/6 (17%) [3-56], boss 23-47% left, deaths 82-135 s | - | LOW |
| wood (control, shipped, L3) | last table 5/6 6/6 2/6 = 72% | 6/6 5/6 2/6 | 13/18 72% | unchanged overall |

## 2. Reading
- FREEBOOTER: the stand fix helped the warden only a little (0/6 -> 1/6; boss left 36-58% in the 5 timeouts, one win at 219.6 s). She is still short on damage: 14-15 riposte pips (par/open) vs the knight's 28-33, "lost" 250-550. No tuning: overall is in band (61%, interval spans both edges), the problem is one hero, and tuning the boss down would move knight and pyro out of band to rescue a bot problem. Knight 6->5 and pyro 6->5 are n=6 noise.
- KRAKEN: warden 1/6 -> 2/6. The face-flip fix did not cure it. Deaths are at 41-56 s with the boss still 66-72% left and 400-480 damage taken, all "?" (unattributed) in the hit book.
- WOOD (control, shipped): warden 6/6 (was 5/6), knight 5/6 (was 6/6), pyro 2/6 (same). Warden did NOT move beyond noise on a boss nothing here touched, so shipped tables were NOT measured with a weak warden; the fixed bot only matters on these two sea bosses (same code paths as the stand / face edits).
- FLOTILLA: the warden loses with the plan untouched, so the cause is NOT only the Freebooter's stand; it looks shared across the sea-act plans.

## 3. Kraken warden trace (step 4): cause named, hypothesis marked
`BRACKEN_CW3=1 CW3=1 node tools/seawalk-krprobe.mjs warden 2`: she does NOT die in the first 20 s any more and does swing (boss hp 942 -> 623 over 85 s, death 51.4 s in the table row), but her hp drops at every geyserTell / slamTell / wave / grab (234 -> 184 -> 120 -> 56 -> 6, topped up by flasks). The Kraken advice answers those by WALKING out or JUMPING, not rolling: src/main.js:18558 (slam: goal + climb, dodge only at modeT<0.3 right after), 18559 (grab only), the geyser branch ~18573 (walk to a safe x), the sweep/roar branches (jump). The roll block (lab.js:2550) therefore only fires for held / grab / lunge / hurl (main.js:18539, 18559, 18560, 18580), so the wardenbot flip patched a rare path and the main losses are in the walk / jump answers. Suspect (NOT proven, no harness): her swing is a long committed thrust ("the blade commits: its recovery finishes before the feet may go", main.js ~11850, third cut +0.30 s, reach 44) so she cannot walk out of a geyser or slam in time, where the knight (28 reach, short cut) can. The ~30 other press('dodge') sites are not the dominant cause here.

## 4. Numbers changed
None (no tune: Freebooter and Kraken overall in band, no round of tuning applicable; wood untouched). Node tools pirate-fleet 136 ok, kraken3 217 ok (run on the branch before the rows).

## 5. Questions (rec first)
1. Treat the warden's 1/6 and 2/6 as a HERO/BOT problem, not a boss tune. REC: yes; open a bot lane for the warden's commit vs geyser / slam walk-out (cancel the recovery or stop starting a thrust while a tell is live) with a trace, then re-measure all three sea bosses together (Freebooter, Kraken, Flotilla).
2. Leave Freebooter hp 8400 and the Kraken numbers as they are. REC: yes (overall 61% / 61% in band; interval wide).
3. Merge claude/wardenbot (bot-only, node-proven, small gain)? REC: yes at the next integ; it changes no live number.
4. Rows still not run (not in this brief): Glassblower (buriedcity:mini) from wardenbot section 5 item 4.

Raw rows: scratch/lane-reports/wardenmeasure/wm-{fb,kr,wood,fl}.{json,log}.
