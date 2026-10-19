# claude/curvec2 - CURVE FIX C2: THE WALKER CURVE TABLE (sonnet)

Base: claude/batch104 f95390f0 (= live 45d7d8a1 BATCH103 with C1 dials + FOE PASS core + Stockade 2). Tools and docs only; no game number changed.

## WHAT LANDED
- tools/level-walk.mjs: `TARGET_BY_ACT` (deaths a first run / mean shrine arrival: I 0.5-1.5 / 65, II 1-2 / 60, III 1.5-2.5 / 55, IV 2-3 / 50, V 2.5-3.5 / 45), `actOfId`, `targetOf`; summarize() and the footer read the act's row (the old flat TARGET stays exported). hitBy rows now carry a third number, the biggest single hit (% of max hp).
- tools/walk-curve.mjs (new): folds walker json into docs/walk-curve.json (level x hero, act means + medians, levelHash per row; runs that ended `frames`/`locked` made no progress and are left out, counted in `dropped`); `node tools/walk-curve.mjs` prints the table.
- docs/walk-curve.json: AFTER (this branch) n=2 seeds x 3 heroes for acts III-V (canal/theatre/fair n=3), acts I-II n=1 (calibration; minecart skipped - the cart pilot did not return in 28 min; storm/crown/undercrown walked separately); BEFORE (e0436ee8) n=1 x 3 heroes for acts III-V. BEFORE n=2 was queued then cut for time (stated, not hidden).
- tools/curve-gate.mjs: reads the walker rows for acts III-V, REPORT-ONLY (prints act means vs target, levels off target, stale rows by levelHash); never fails. The L1-pilot bands and CURVE_REPORT_ONLY are untouched.
- tools/blow-census.mjs: COMMON_BLOW_CAP = 25 (% of hero max hp), REPORT-ONLY, exit 0 always. `node tools/blow-census.mjs --walk=a.json[,b.json]` (no browser) or `--walk-levels=canal,theatre` (one Chrome). Elites are listed apart; one max shared by 3+ foes of a level is listed as a hazard bite.
- Checks run: curve-gate, curve-shape, comments (green). level-walk-selftest NOT run (browser; its imports still resolve).

## THE ACT TABLE (campaign hero L4..L42, human+first; deaths a first run (mean of level means / median) | mean shrine arrival | single-hit median %hp of a common foe)
| act | target | BEFORE e0436ee8 (n=1) | AFTER f95390f0 (n=2) | hit-max median |
|---|---|---|---|---|
| I (calibration) | 0.5-1.5 / 65 | - | 1.2 (0.7) / 79% | 10% |
| II (calibration) | 1-2 / 60 | - | 1.9 (0.3) / 88% | 9% |
| III | 1.5-2.5 / 55 | 0.1 (0) / 84% | 0.1 (0) / 77% | 7% |
| IV | 2-3 / 50 | 2.4 (1) / 80% | 2.0 (0.7) / 79% | 7% |
| V | 2.5-3.5 / 45 | 0.5 (0.3) / 69% | 0.5 (0.5) / 73% | 6% |

Levels in the death band: 0/9, 0/12, 0/8. C1 + the FOE PASS moved the acts almost nothing (III -7 pts arrival, IV -1, V +4): that is inside noise, AND the two walkers differ (BEFORE has no fight-through), so read it as "no visible effect", not as a measured delta.

### What the table says
1. THE DIP IS ACT III, NOT ONLY IV-V. Acts I-II (the tuned acts) read 1.2-1.9 deaths with single common hits of ~10% of max hp. From act III the hero out-levels the foes: 0.1 deaths, hits 7% -> 7% -> 6% of a bar that grew 134 -> 334 hp. Most act III levels arrive 87-100%.
2. Acts IV-V: 8 of 12 act-IV levels and 7 of 8 act-V levels read 0-1.5 deaths and 70-100% arrival. The act IV mean (2.0) is three walls: canal 4.6, fair 8 (the cap), witchlight 5.3 (dies in the first 3% of the route); the other nine read 0.3.
3. THEATRE (risk row): 0.3 deaths, arrives 99%, 1-10 hits in a whole level (BEFORE 1 death / 75%). C1's tier 0 -> 2.5 did not make it hard: a level-design problem (THEATRE 5). CANAL (4.6) and FAIR (8) are real walls but at THE BARGEMAN / GRINDYLOW / spikes / effigies (mini + hazards), not common blows, and they were walls BEFORE too (7 and 5.3): the "jump from tier 0" did not create them.
4. Hazard plateau: the recurring 26-28% "common blow" in canal, fields, fallingtower, longwater, fair, ksar... is one value across unrelated foes = the spike bite beside them, not foe blows.
5. The walker over-reads SOFT even in the tuned acts (I 79% vs 65, II 88% vs 60). If acts I-II are "right", the literal III-V arrival targets are harsher than I-II relative to the walker. The deaths axis is the cleaner comparison (II 1.9 vs III 0.1 is a cliff).

## STEP 2 (proposal; C5 applies it - evidence, not a commit)
Net hp loss per section now (100 - arrival): III 23, IV 21, V 27. To reach 45 / 50 / 55 it must rise x1.96 / x2.38 / x2.04. The brief's STEP 2 (ACTS.dmg 1.25 / 1.5 / 1.8 + hp 1.0 / 1.05 / 1.1) is x1.0 / x1.13 / x1.28 over now: it would leave IV near 76% and V near 68% arrival. Too small by ~2x.

| | ACTS.dmg now | STEP 2a (half-way, apply first) | STEP 2b (literal targets) | ACTS.hp | purse cap |
|---|---|---|---|---|---|
| III | 1.25 | 1.75 (x1.4) | 2.4 (x1.92) | 1.0 | 2 |
| IV | 1.4 | 2.1 (x1.5) | 3.0 (x2.14) | 1.05 | 2 -> 3 |
| V | 1.55 | 2.1 (x1.35) | 3.0 (x1.94) | 1.1 | 3 |

Monotone (IV = V plateau, like PRESSURE). Typical common hit at 2b: 7% x 1.92 = 13%, 7% x 2.14 = 15%, 6% x 1.94 = 12% of max hp: well under the 25% cap, so the generic dial has room; the outliers below do not. Path: 2a, re-walk acts III-V n=1 (a pass is ~35 min), then 2b if arrival is still above target. Expect arrival to lag and deaths to jump: the walker drinks at 35% (3 flasks), so extra damage first becomes flasks, then deaths. The foe pass finisher refund (+3% hp) is already in AFTER.

### Per-level rebases that go WITH any ACTS.dmg rise
Keep today's absolute blows on levels that are already weighted: new = old x (old ACTS.dmg / new ACTS.dmg). Shown for 2a.
- towpath foeHit (IV x0.667): bargeman 3.4 -> 2.3, riverrat 3.4 -> 2.3, watchman 2.8 -> 1.9, deckforeman 3.6 -> 2.4, hedgechampion 1.7 -> 1.1, bargechampion / ratchampion 3.6 -> 2.4. (canal has no foeHit: it takes the generic rise.)
- LEVEL_DMG (foe-react.js:46): church 1.5 -> 1.0 (IV), causeway 1.5 -> 1.1 (III x0.714). Church foeHit table stays.
- ksar foeHit (V x0.738): ksarblade / whipapprentice 3.6 -> 2.7, gonglookout / falconer 2.6 -> 1.9, shieldsentry 3.0 -> 2.2, smokethrower 2.2 -> 1.6, ksarplate 4.0 -> 3.0.
- buriedcity foeHit: sanddrowned / sandbound 5.4 -> 4.0, sandslinger 2.3 -> 1.7, brassscorpion 4.8 -> 3.5.
- sealedpyramid foeHit: dartblower 2.2 -> 1.6, jackal 4.4 -> 3.2, scarab 3.0 -> 2.2, venomscorpion / firescorpion 3.2 -> 2.4, sanddrowned 5.4 -> 4.0.
- For 2b multiply the same tables by 1.4/3.0 = 0.467 (IV), 1.55/3.0 = 0.517 (V), 1.25/2.4 = 0.52 (III).
- ksar 83%, buriedcity 77%, sealedpyramid 73% still read soft with blows ALREADY at the cap (buriedcity scorpion 26%, sealedpyramid hound 55% n=4): the lever there is HOW OFTEN they are hit, not how hard. Route-blocking shares: ksar 31%, buriedcity 33%, redgorge 31% (UNDER 40%), sealedpyramid 48% - encounter placement in their own rework lanes (KSAR 3), not foeHit.
- COMMON_BLOW_CAP overs (real, n>=3, not the hazard plateau), to trim to <= 22% in their own level passes: church gobmage 48% (n13), swornsword 36% (n11), haunt 35% (n7); hurricane cutlass 30% (n9); causeway sailor 32% (n6); sealedpyramid hound 55% (n4, verify with BK.hitLog first). Elites over (listed, not counted): waymeet heavy* 46% / hedgeknight* 31%, sealedpyramid mummy* / construct* 50%, deep watch* 34%, causeway tideguard* 30%.

## UNDER-PRESSURED LEVELS (arrival 25+ pts over target, deaths ~0), for the sweep lanes
theatre 99, mage 99, underwell 97, fallingtower 95, burial 95, keep 93, reef 92, harbor 89, flotilla 87, ksar 83, unburied 80. Walls (walker artifact or real): canal, fair, witchlight (8 deaths in the first 3% of the route: look at its first screen), skyroad (5.3, acts-II calibration), crown (5-8).
Not measured (runs with no progress left out): towpath all 6 runs (26% of the route in 600 s), glasssea x4, sealedpyramid warden x3; welltown / redgorge / deep have <3% of the route measured between shrines (few arrivals). minecart: the cart pilot did not return in 28 min - killed.

## RISKS / NOTES
- BEFORE used the older walker (no fight-through, no break bar, no refund): before/after is not apples to apples, and no same-walker BEFORE is possible (the foepass changes live in src/playtest.js).
- n is small (2 seeds x 3 heroes per level; 1 for BEFORE and acts I-II): a single level is +-1 death; the act means are the evidence.
- Arrival = hp% at the shrine after drinking.
- Process: I started the chains and the Chromes myself, ran one Chrome at a time, killed only my own PIDs (one duplicate chain I launched by mistake, and the hung minecart run).

## QUESTIONS FOR DANIEL
1. STEP 2 size: the brief's 1.5 / 1.8 is ~2x too small by the walker. REC: apply STEP 2a (1.75 / 2.1 / 2.1 + purse 3 in IV), re-walk, then 2b if needed. ALT: straight to 2b (2.4 / 3.0 / 3.0).
2. The walker reads soft in acts I-II too (79 / 88% vs 65 / 60). REC: keep the literal 55 / 50 / 45 targets for III-V and trust the deaths axis (II 1.9 vs III 0.1). ALT: re-base all five arrival targets by +15.
3. Canal / Fair / Witchlight walls and Theatre's 99%: REC send them to their own rework lanes (canal 2, fair 2, witchlight 2, theatre 5); no dial change.
