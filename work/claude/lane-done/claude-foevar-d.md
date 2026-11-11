# foevar-d (desktop) - browser walk + pilot/mash restamps for the enemy-variety pass (foevar1+2+3), branch claude/foevar-d
Base: origin/claude/foevar3 45c83aa58 + origin/master a7c067880 merged. Change: src/cast-pass.js (data rows + two small engine keys, `keep` and `not`), tools/foevar-stills.mjs, tools/foevar-probe.mjs, docs/level1-pilot.json, docs/mash-bot.json. No merge to master, no deploy, no check.mjs, no QUICK gate.

## The walk changed the pass (every cut below was a real red or a real bug, not taste)
| row | what the walk / tools showed | action |
|---|---|---|
| caravan scorpion for blade | ONE scorpion in a blade's place (x132 or x311) takes the fresh-save pilot 229% -> ~330% hp, deaths 6 -> 9 (seed 1, deterministic); all 3 = 446% / 9. The row bought no variety (7 kinds, 5.7 before and after) | row DROPPED (caravan = pre-foevar data) |
| ksar raptor | raptors drive the pilot jump (580% -> 824%, deaths 13 -> 21); shield sentries alone = 741 without raptors | raptor row every 3 -> every 6 (3 raptors): 701% / 16 deaths (+21%); index 80 vs base 78 |
| canal lanternshade for the 3 lamplighters | the swap deletes e.canal, and e.canal.lamplighter IS the role (lantern carrier that shows watchmen where you are, relights doused posts, "kill him first") - a lanternshade there has none of it | row DROPPED |
| canal + towpath runners | the runner's shout fetches only swornsword / hedgeknight / crossbow within 240x60 px (main.js runner brain). Canal has none; towpath's nearest (hedge knight 146) is 30 tiles from the bargeman at 176, the crossbow 194,9 is 20 tiles up. The squires would shout for nobody | both runner rows DROPPED |
| canal riverrat | tools/canal.mjs asserts every gaffer keeps e.canal.bargee; the swap dropped it | new row key `keep:['canal']` (re-skins e.canal.cnSkin, canalReset re-applies it); canal.mjs green |
| fair haunt/armour | tools/harvest-fair.mjs pins the fair's foe count and its designed mummer encounters (10 failures, base passes) | all 3 fair rows DROPPED (fair = pre-foevar data) |
| fallingtower zombie | Daniel 2026-09-21 "FEWER ZOMBIES": 3 in the tower; tools/tower-ascent.mjs asserts it (row made 7) | zombie row DROPPED; mimic row every 2 -> every 1 (index 118 -> 117, base 115) |
| fallingtower topiary | topiary @3,71 stood on a wind-shaft tile and fell 3 tiles in 3 s | topiary row x0:10 (4 topiaries kept: 15,182 / 50,173 / 35,128 / 26,149) |
| underwell fire/thirst scorpion | tools/underwell.mjs failed 3 (the chamber torch brood, cistern bat, drowned dead): the swaps hit the venom BROOD the tool drives | new row key `not:[[x0,x1],..]`; underwell rows skip x118-132, 195-210, 440-500 (2 swaps left: 42 fire, 67 thirst); underwell.mjs green |
| warcairn soldiers | tools/warcairn-probe.mjs "drummer beats and the axemen SURGE" failed (the soldier at 158 next to the drummer was swapped) | soldier rows `not:[[140,175]]`; paladins now at 20,81 and 356,24 (was 193,39); probe green |

## Per-level table (knight, fresh save, 3 runs; pilot = % hp lost a run / deaths summed over 3 runs; mash = LEVEL hp lost/deaths, knight / warden / pyro)
Pilot "old stamp" is the unseeded foevar3-era stamp (hits/deaths); "base" is origin/master re-run at seed 1 on this PC (apples to apples); "after" is the final tree at seed 1 = what is stamped.
| level | pilot old stamp | pilot base (seed 1) | pilot after = STAMPED | mash old -> new | curve idx base -> now | stamped |
|---|---|---|---|---|---|---|
| caravan | 18/6 | 229% / 6 | 229% / 6 (first cut 446% / 9) | 202/1d 722/7d 535/5d -> 733/7d 600/6d 537/5d | 73 -> 73 | yes |
| underwell | 50/13 | 459% / 12 | 477% / 12 (first cut 567% / 14, 3 tool reds) | 1702/17 1706/17 1613/16 -> 1703/17 303/3 1642/16 | 72 -> 72 | yes |
| glasssea | 31/6 | 368% / 8 | 351% / 7 | 904/9 1006/10 904/9 -> 1104/11 1215/12 634/5 | 67 -> 67 | yes |
| ksar | 36/13 | 580% / 13 | 701% / 16 (+21%; first cut 824% / 21) | 806/7 713/6 336/2 -> 1076/9 868/7 624/5 | 78 -> 80 | yes |
| buriedcity | 24/6 | 352% / 6 | 377% / 6 | 4500/45 3497/35 718/6 -> 5700/57 4013/40 609/5 | 68 -> 69 | yes |
| sealedpyramid | 42/15 | 462% / 12 | 474% / 10 | 3595/36 3768/38 3220/31 -> 1898/18 2837/28 3454/33 | not in my curve print (foevar3: 85 -> 85) | yes |
| towpath | 33/9 | 374% / 9 | 359% / 9 | 622/6 774/8 554/6 -> 598/6 695/7 599/6 | 69 -> 70 | yes |
| canal | 89/14 | 799% / 19 | 799% / 19 (first cut 581% / 14) | 592/6 592/6 601/6 -> 1502/15 1380/14 1294/13 | 86 -> 86 | yes |
| fair | 59/20 | 643% / 17 | 643% / 17 (= base data) | 660/6 859/8 819/7 -> 662/6 778/7 845/8 | 130 -> 130 | yes |
| underleaf | 21/0 | 140% / 0 | 150% / 0 | 199/2 187/1 181/1 -> 205/2 159/1 212/2 | 77 -> 77 | yes |
| rookery | 44/6 | 275% / 6 | 279% / 6 | 220/2 114/1 151/1 -> 200/2 120/1 189/2 | 76 -> 77 | yes |
| kitchengate | 40/3 | 181% / 1 | 193% / 3 | 313/3 309/3 312/3 -> 312/3 311/3 313/3 | 91 -> 93 | yes |
| warcairn | 23/4 | 222% / 3 | 215% / 2 | 226/2 200/2 175/1 -> 229/2 271/2 175/1 | 66 -> 68 | yes |
| waymeet | 29/9 | 281% / 6 | 262% / 5 | 434/4 141/1 130/1 -> 533/5 100/1 124/1 | 112 -> 114 | yes |
| fallingtower | 61/18 | 768% / 19 | 795% / 17 | 701/7 793/8 817/7 -> 802/7 751/7 747/6 | 115 -> 117 | yes |
All 15 stamped on the final tree (hashes current). Largest final pilot move vs base: ksar +21%, everything else within +-7%. `node tools/level-quality.mjs`: "every gated level clears the quality bar"; `node tools/mash-gate.mjs`: 57 levels hold. Mash was run in level mode (the tool carries the boss rows from the old hash; cast data does not touch a boss arena). The 18 "level changed since its curve row" lines (`level1-pilot --curve`) are old and not mine; not re-stamped.

## Stills (bracken-scratch/desktop-out/foevar-stills/<level>/ : PNGs + _sheet.png + rows.json; INDEX.md) - what I SAW
- ksar: raptors high over the souq / walls (flying, no ledge clip); shield sentries stand upright on the street / inside the hut and tower rooms, "!" told. Scripts: ksar-hands is kind-agnostic (reads e.ks / squad); ksar.mjs and ksar tools green.
- underwell: fire (orange) and thirst (tan) scorpions upright on the cistern floor; glasssea: fire + oil scorpions on glass; buriedcity: brass / fire scorpions on stone floors and on a plank at 561/657; sealedpyramid: constructs and drowned on corridor floors, vultures in the air (205,39 flies inside a tomb corridor).
- towpath: crossbow on its wooden perch (194,9); riverrat in the stair yard (dark arch, hard to read but present); canal: riverrats on wharves and in the mill; no runners / lanternshade remain.
- underleaf: clubsprigs, thieves, rock/venom archers all on ground or perches (15 shots). rookery: kites hover over the crags, bats flutter; probe (25 s each, hero near): kites hold a 5 x 1 tile box, closest to a diving harpy 79-80 px (5 tiles) at the two beside harpy nests, 146-423 px elsewhere, none killed, no overlap.
- kitchengate: fire-bow on its perch (undercellars / hanging larder / feast hall), clubsprigs, thieves, burngobs fine.
- warcairn: order paladins (whole shield, gold gleam) stand on open flat ground at 20,81 (gully road) and 356,24 (on a stone block beside the Clan Ring, next to the Champion's door). Waymeet: 3 paladins stand on the street / in the tavern hall / on the boardwalk, none in a doorway or gap; crossbows 80,35 and 658,35 on the street (658 stands in front of the inn).
- fallingtower: 4 topiaries on planks / floors, mimics read as chests, lab-landing armour stays. (topiary_26_149 frame: the HERO fell into water from the probe teleport; the topiary's y is unchanged.)
- GAP: fair armour at 584,14 (the exam's shooting gallery counter) could not be framed (camera lags the teleport); that row is dropped anyway. Fair haunt/armour/caravan stills were seen before the rows were dropped (on ground, upright) and deleted from the folder.
- Paladin gleam cadence (probe: hero 3 tiles off, god, 30 s): the gleam tell comes about every 6.5 s (every 2nd blow, blows ~3.3 s apart), 4 gleams in ~25 s per paladin at waymeet x3 and warcairn x2 - NOT every ~2 s. src/order-paladin.js OPL.gleam {every: 2, maxGap: 6}; paladin-kit / order-knights / under-order / lab-order green. It is the paladin's own AI, not placement; flagged as a question.

## Browser tools run (one at a time)
GREEN on the final tree: underleaf, tower-chase, tower-collapse, tower-ascent (after zombie row dropped), under-order, order-knights, paladin-kit, lab-order, save-safety, desert-foes2, ksar, buried-city, bandits, underwell (after `not`), canal (after `keep`), canal-pilot, towpath-probe, towpath-exits, fair-folk, fair-pilot, harvest-fair (after fair rows dropped), kitchengate-probe, rookery-probe, warcairn-probe (after `not`), caravan-probe, fallingtower-walk. Node: foe-cast-lint, one-new-foe, threat-holes, goblin-lint, foe-footing, curve (22 steps out of line, same as before), fallingtower2/4, tower-flyers, tower-hall.
RED but PRE-EXISTING (also exit 1 on origin/master here): towpath-route (9 lifts, all heroes), fair-route ("fallen big top: pole to pole" + rick 403), glasssea-route (knight 4 lifts/11 deaths base, 5/13 now; warden/pyro equal), sealed-pyramid-route (base 4/13, now 4/12).
Not run: tools/check.mjs, QUICK gate (laptop owns them); canal-map (crashes on master, known). Not re-run after the last row edits: towpath-route / towpath-probe / towpath-exits after the runner rows were dropped (the change moves towpath back to its pre-foevar data; the three had run with the runners in).

## Open items / questions for Daniel (recommendation first)
1. Fair got no variety (rows dropped: harvest-fair pins counts and designed encounters). Rec: a deliberate fair lane that edits those pins and the designed mummers, not the cast pass. Canal and caravan likewise lost most of their foevar variety (canal keeps only the riverrat skins).
2. Paladin gleam is ~6.5 s apart, the brief said ~2 s. Rec: leave (a parry offered every other blow is the design); drop `every` to 1 only if Waymeet feels toothless.
3. Warcairn paladin at 356,24 sits at the Clan Ring door. Rec: keep the one at 20,81, and add `not:[[340,380]]` to the paladin row if a hand walk finds it crowded.
4. Runners: nothing places them usefully (canal, towpath). Rec: place them only where a sworn sword / hedge knight / crossbow stands within 15 tiles x 3 (Waymeet already has them).
5. Rule gap: cast rows silently remove designed pins (harvest-fair, tower-ascent, underwell brood, warcairn drummer, canal lamplighter). Rec: after any cast row, run the level's own browser tool (this lane's method); better, foe-cast-lint should refuse a row whose target is a squad named in a tool pin.
