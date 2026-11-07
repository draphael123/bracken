CAUSEWAY3W DONE 11-07 READY (code-only OPUS greybox behind its flag; browser walk / lab bot / reviewer / art / tune owed - art before live) - tip: see the last line

# claude/causeway3w - THE DROWNED CAUSEWAY 2: THE SEA ACT FINALE (OPUS greybox, code-only, 11-07)

Branch `claude/causeway3w` off `claude/waterkit` e08836df8. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-causeway3w`. Pushed. NOT merged, NOT deployed.
Sources: scratch/plan-water-1105.md item 10 + s2/s3/s4/s5 order rules (Daniel took the s6 recs 11-05 14:56); scratch/brief-causeway2-1016.md (Daniel 10-16, all recs);
the water lanes' reports (waterkit, longwater3, keepfloods, deep3, sirenrocks, whale, water1) and the old claude/causeway2 report (Kraken rework). Plan won where they differ.
No browser opened, no puppeteer/CDP tool run (GATE-RUNNING.flag: every tools/*.mjs I ran was grepped for cdp/puppeteer/chrome first). tools/check.mjs not run.

## FLAG / URL
`src/causeway3.js` `CW3_SHIPS = false`. **OFF: the 'causeway' row builds master's Causeway exactly** - tools/causeway3.mjs builds it in a child process: hash `86df98cd6d71`,
the same as a clean checkout of claude/waterkit e08836df8 (built in a temp worktree, then removed). Every table getter hands back master's own row objects when off.
**ON** (`?cw3=1&level=causeway`, `globalThis.BRACKEN_CW3`, `CW3=1` for Node): the SAME road slot ('causeway', index unchanged, needs 'keep') builds CAUSEWAY 2.
No save moves: three silvers (one an act), same boss id. Master's tables that name the Causeway by column (AMBUSH, ELITES, CHECK_DROP, STUCK, STUCK_SIGNS, TIDE_CRABS)
read CW3_TABLES through a getter (`shadowCauseway`, one line in level.js); src/haunted-coast.js skips its master-column causeway block when `L.cw3`.

## THE ROUTE (980 columns = x1.6; 3 acts; THE STORM BUILDS: the tide turns every 30 -> 22 -> 15 s)
| cols | area | the remix (ONE each, exam rule: no new teaching, no new foe) |
|---|---|---|
| **ACT I - THE PILGRIM ROAD** | 30 s; the sea fills the CUTS in the road, level with it at high (never over) | rain |
| 0-44 | THE LANDING | START, the pilgrim stone, the first bell, THE LIGHT on the horizon from screen one (drawn far, nearer each act) |
| 45-103 | THE MILE ROAD | the dip (a cut that floods), waymark ledges; squad THE PILGRIMS' DEAD; a feeler in the dip |
| 104-147 | THE STONES | **SLUICE** (LW3's race): the channel's own tide is in nearly always (dry 4.1 s < the fastest walk 5.4 s); its rip carries a swimmer back to the near bank's rungs; turn the wheel: 15.2 s dry. SHRINE (150). Silver on the bed |
| 148-205 | THE COVE | **BELL** (LW3's cove): the boat lies on the mud; at high water her deck is 44 px under the sea wall top (a jump), at low 156 px. The hamlet bell calls it in |
| 206-265 | THE GUN | **CANNON** (Flotilla's gun): the toll tower lies across the road (18 rows); one blow on the breech of a beached gun opens it. Squad THE GUN CREW (bonecorsairs + a bow on the rubble) |
| 266-305 | THE WAYSTATION | SHRINE (285) on the holm; act card |
| **ACT II - THE HOLY ISLAND** | 22 s; the sea comes OVER the road (4 rows) | dusk (darkZone 0.26, storm) |
| 306-358 | THE WRECK | **RIGGING** (Hurricane's): a hull across the road; her shrouds' lowest rung is 2 rows over HIGH water's surface (a swimmer's leap) and out of reach from the road. Silver at her yard |
| 359-437 | THE ISLAND CHAPEL + THE UNDERCROFT | the ambush THE DROWNED CHAPEL (CW3_TABLES); SHRINE (406) at its door; **FLOODGATE** (Keep 2's): a kit LEVER chamber - drained, a drowned knight walks the floor and the door is 12 rows up; flooded, swim to it (the mark survives a death) |
| 433-500 | THE SEA ARCH | **CURRENT + AIR** (Deep 3 / Pirate Fleet currents): a STRONG pull field signed by act II's tide - with the flood 1.6 s between air bells, slack 2.8 s, against the ebb 10.5 s (breath 6 s): hold the iron ring (UP) at an air bell and wait. Up the shaft |
| 501-598 | THE LEE | the gated ELITE tideguard (556, gate 564); SHRINE (590) |
| **ACT III - THE LAST MILE** | 15 s; NIGHT (darkZone 0.64, storm) + told lightning (L.storm2) | |
| 599-703 | THE DARK MILE | **LAMPS** (Lamplit's): master's storm lantern (strike twice) on each waystone; the gate lamp lifts THE PILGRIMS' GATE (PORT col 697, a mark). Two Kraken ARMS strike the road (told 1.1 s: shadow + bulge) |
| 704-766 | THE LAST BELL | **SLUICE + BELL**, the exam: dry 3.5 s < fastest walk 7.4 s; the sluice holds 18.0 s; ring the last bell on the last stone, the boat lifts you to the light's sea wall |
| 767-804 | THE LIGHT'S HOLM | SHRINE (790) - the one before the chase (brief 3) |
| 805-903 | THE COLLAPSE | the chase: an arm SMASHES the road behind you (805-807), then the road falls into the sea a column at a time at 50 px/s, each column told by its crack 1.2 s first; three 3-tile breaks, three arms. The slowest hero (reaper 73.6 px/s) has 11 s spare; a hero who stops is taken ("THE SEA TAKES THE ROAD" -> shrine 790, the road laid again by mendAll) |
| 904-932 | THE LIGHTHOUSE | its steps, the road through its foot, master's fog + beam (causeFog), squad THE LIGHT'S KEEPERS, SHRINE (925) = the boss door |
| 933-979 | THE KRAKEN'S REACH | **master's columns 565-611 cell for cell** (+368): today's Kraken fight untouched (KRAKEN 3's raft is a later lane). main.js reads `KRK_TIDE_AT` through `krkCol` (offset 0 on master's reach) so his tide sections follow the copy |

Foes: no new foe (plan: exam rule). The road's own FEELER (master's Causeway foe, the Kraken's arms in the flats) is kept as foreshadow; sailors, scouts, netters, petrels (flyers),
eels, bonecorsairs, cutlass, tideguards (+ the elite), drowned knight, merrowcaller, merrowbrute, lanternshade. No goblins (master's tribute cairns sit in the last mile, not copied).
Timber only as ships (the hull, the boats). Checkpoints: START + 6 (master 10 on 612) - one an area's exam at the 200-route-tile cap (Q1).

## Verbs reused + MERGE DEPS
- **Merge deps: none beyond the base claude/waterkit.** Every remixed verb is the KIT's (src/tide-kit.js bell / sluice / lever / floats, src/pull-field.js current + posts) or
  master's (cannon hole, storm lantern, NET rigging, L.storm2 lightning + storm darkZones, causeFog, feeler, knells, the Kraken). The levels that INTRODUCED the verbs
  (longwater3 bell+sluice+boat, keepfloods lever chamber, deep3 / water1 currents) were read for their numbers and grammar; none of their code is needed here (Q2).
- **merge-tree clean** against claude/longwater3, keepfloods, deep3, sirenrocks, whale, water1 and origin/master (hunks moved off their anchors). The kit wiring is kept on
  `L.cw3Tides` / `L.cw3Pulls` (not L.tides/L.pulls) so claude/water1's generic wiring never steps it twice (fold after both merge, as LW3 Q11).

## What was built
| file | what |
|---|---|
| `src/causeway3.js` (new) | flag, `CW3` numbers, signs, `buildCauseway3(master's built Causeway)` (pure), `CW3_TABLES` + `shadowCauseway`, `lintCauseway3` |
| `src/causeway3-hands.js` (new) | the world binding: the kit's tides (acts, channels, chamber) + verbs + boats, the pull fields (rips, the arch, post grab = UP), the lamp gate, the ARMS, THE COLLAPSE, act cards, the horizon lighthouse, A3 gauge, foam, greybox drawing; `window.BK_CW3` |
| `src/main.js` | 11 one-line hooks (+ `krkCol` and its 3 uses): import + `let CWH`; clear (spawnEntities); strike+update (updateProps); mover; drawMover; drawSky (after the leviathan); drawBack; drawOver; the hands' construction; all inert without `L.cw3` |
| `src/level.js` | import; the row `build: () => (cw3On() ? buildCauseway3(theDrownedCauseway(), T, TS) : theDrownedCauseway())`; the shadow line |
| `src/haunted-coast.js` | its causeway block skips `L.cw3` (master's columns) |
| `tools/causeway3.mjs` (new) | **98 ok** (~10 s), Node only |
| `tools/level-quality.mjs` / `tools/check.mjs` / `tools/haunted-coast.mjs` | `SYSTEM_ARRAYS.push(cw3Bells, cw3Sluices, cw3Levers, cw3Lamps, cw3Pulls, cw3Boats)` (causeway NOT gated: master misses the bar flag-off) / own line (not run) / master-column asserts skip `L.cw3` |

## Node results (one at a time, 5-6.5 GB free; logs: work/claude/causeway3w/node-checks.log)
- `node tools/causeway3.mjs` **98 ok**: flag both ways (off = base hash; on keeps the reach cell for cell); lintCauseway3 + lintTide + lintPulls clean; START + 6 shrines; 3 silvers;
  one ambush; the gated elite; no tide crab; CT not run; the reach/Kraken/knells/sea shifted; krkCol in main.js; 30/22/15 s with every tell >= 1.5 s; act I fills cuts, II/III over the
  road; dusk/night + lightning zones; both channels' sluices REQUIRED (numbers above); both rips + rungs; both boats (44 px at high, 156/220 px at low); the cove; the gun's hole;
  the shrouds; the undercroft door; the arch's breath numbers + rings + air bells; the lamp gate + reachDoors; THE COLLAPSE per hero (reaper 11.0 s spare ... pyro 17.3) and the front
  < 3/4 of the slowest legs; 3-tile breaks; reach with rides to every shrine, silver and the reach; the HANDS in a stub world (safe low at start, sluice holds, lever fills + mark,
  lamp lifts the gate + mark, an arm told then slams, the slowest runner reaches the light, a hero who stops at 840 is taken at 840, the smash broke 805-807 and the steps stand).
- `CW3=1 node tools/level-quality.mjs causeway` **CLEARS THE BAR**: flat 15%/43%, bands 6 / 42% multi-height, mechanics 9 kinds / 3 in 3+ places (lamps x5, bells x4, pulls x3),
  secrets 3, checks 1 per 161 route tiles, an encounter every 200 cols, density 0.84, roles 4, route spans 28 rows (blocking WARN is report-only). Gated run exit 0 both ways.
- Both ways ok (CW3=1 and 0): tide-kit (2019), pull-field (76), anchor-lint, floating-geometry (report-only list), solid-islands, checkpoints, checkpoint-gaps, checkpoint-stand,
  boss-checkpoint, elites, ambush-reach, one-new-foe, goblin-lint, threat-holes, deadends, breath (deepest water 5.2 s round trip), floaters, signs (2-line fit), deadly-water,
  haunted-coast, keys, dangling-paths, comments. **foe-footing: ok flag ON; RED flag OFF = master's own 12 (petrels etc.), unchanged from the base.**
- `node --check` every touched file. New filenames (causeway3, causeway3-hands) clean of ad/admiral/banner/track/analytics/pixel/promo.
- NOT run: tools/check.mjs, page tools (level1-pilot, mash-bot, reach-heroes, stuck, textfit, mark-integrity, swim-chain, kraken-rework, boss-rates, map-grammar).

## OWED
1. **Browser proof** (one at a time, memguard, >= 1500 MB, `?cw3=1&level=causeway`): main.js wiring is unproven in a page - kit pools moving, boats as movers carrying riders,
   the pull on swimmers + the UP post grab + flow specks, a co-op seat's blow on a verb (only P's hb strikes today, as LW3/whale), master's lantern prop matched by the lamp gate,
   the cannon's hole, the arms' knock, THE COLLAPSE's breakTile + mendAll restore on a respawn + fallOut, darkZones/lightning reading, the horizon lighthouse + causeFog beam,
   the Kraken fight at the shifted columns (krkCol tide sections, the wreck, the holes). Real-key per-hero routes: cove deck -> wall (44 px), shrouds from the high surface,
   the undercroft door swim, the arch with/against, the last bell sequence, the chase.
2. **Lab bot + tune**: `level1-pilot causeway --write`, `mash-bot causeway`, reach-heroes, stuck (CW3_TABLES.STUCK rows), textfit, mark-integrity; THE KRAKEN pair n=6 WITH flasks
   (the fight is unchanged but the approach is x1.6 - flask/health state at the door moves); chase speed, rips, holds, foe numbers; `MEDALS.causeway` (main.js) is for 612 cols.
3. **READ-ONLY reviewer vs Mage's Folly** (plan rule for every opus greybox) - not run.
4. **Art pass (art before live)**: the pilgrim-stone kit + storm-night palette, the horizon lighthouse (3 scale steps) and the real one + its lamp, bells, sluice wheels, the
   floodgate lever + a grating in the undercroft's door (Q11), iron rings, boats (tarred), the fallen toll tower + gun, the hull + shrouds, the chapel, the fallen bell tower,
   storm lamps on waystones, the Kraken ARM (tell shadow/bulge + slam), the collapse cracks + falling stone, A3 dial, hamlet cottages/smoke/gulls. Music borrows 'causeway' + 'kraken'.
5. At the flip: flip CW3_SHIPS; retire master's Causeway tables/rows + haunted-coast's causeway block + tidegates/CT code paths once nothing uses them.

## Questions for Daniel (recommended answer first; each built as the rec)
1. **Shrines: START + 6** (one per 161 route tiles; master 1 per ~60). tools/checkpoint-gaps caps a stretch at 200 route tiles. REC keep. Alt: 4 shrines and a 'known' row for causeway (harsher, Salt & Sanctuary).
2. **No extra merge deps**: the remixes are the KIT's verbs + master's props; the introducing levels' own foes are not reused. REC keep; after WATER-1/2 integ a small sonnet follow-up may add one review foe each (LW3 pool crab on act I's flats, Deep 3 wall eel in the arch walls, Keep 2's floor-bound knight in the undercroft). Alt: merge those branches now (5 deps, 60+ main.js hunks).
3. **Act I's sea fills the cuts only** (never over the road); acts II/III come over it. REC keep (the storm builds in height as well as tempo). Alt: over the road from act I.
4. **THE COLLAPSE at 50 px/s** (11 s spare for the reaper). REC: the tune lane sets it after the first walk (likely 55-58). Alt: keep.
5. **Falling in during the chase = death** (back to the shrine before it). REC keep. Alt: a rung out of the sea with an hp cost.
6. **The Kraken's reach stays in daylight** (the night zone stops at 933) so today's fight reads as it does. REC keep; KRAKEN 3 decides. Alt: night over the fight.
7. **THE LIGHT'S KEEPERS squad** stands between the chase and the boss-door shrine (a death there redoes the chase). REC keep. Alt: the shrine on the steps (906) before them.
8. **Bells are time-savers** (cove, last bell: the natural high comes anyway - LW3 Q4); the sluices, lamp gate, gun, shrouds, floodgate and arch are REQUIRED. REC keep. Alt: hold the tide low at both bells so they are required.
9. **Master's road tide (CT), tide gates ('THE BOOM') and breakers are not run** under the flag: the kit has the sea (waterkit Q4 fold). REC keep.
10. **MEDALS.causeway** ([660,920,1290] for 612 cols): REC the tune lane re-times at the flip (~x1.6 -> ~[1060,1470,2060] estimate). Alt: stamp the estimate now.
11. **The undercroft's door** shows the arch's water standing in it while the crypt is drained. REC the art pass draws a sluice grating in the doorway. Alt: a sump door (KF grammar), a rebuild.
12. **The ARMS** are greybox hazards the hands draw (14 dmg, a knock, once an attempt). REC keep for KRAKEN 3 to reuse its tentacle look. Alt: real feeler ents.

## Final tip
claude/causeway3w FINAL TIP: see scratch/lane-reports/causeway3w.md (the report commit; code identical to the commit before it). Play: ?cw3=1&level=causeway. Proof: node tools/causeway3.mjs (98 ok).
