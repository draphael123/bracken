# PLATFORMING QUICK WINS 1 (claude/platwins1, base 49eee729 = master 416af6c2 + platlint)
Branch pushed: claude/platwins1 (3 commits: spore, fair, longwater). Not merged, not deployed. Totals by tools/platforming-lint.mjs: 0/1/2+ sections 17/14/22 -> 16/12/25 of 53 (hazard swims counted).

| level | before (sections, open/fire) | after | what moved |
|---|---|---|---|
| spore | 1 (5b/31t), 27/25 | 4 (9b/51t x60-110, 8b/37t x134-170, 5b/25t x306-331, 5b/31t x364-394), 33/19 | brute 71 -> wall top 52 (before the pit); terrace spitcap 88 + brute 89 -> hollow steps 111/114 (after the shrine); shaman 160 -> hollow floor 123 (hollowA); larder weaver 308 (perch) -> 299 (door, ground) |
| fair | 0, 36/39 | 2 (7b/52t x49-101, 9b/52t x461-513), 38/38 | effigy lane's mummer 478 -> exit step 527, strongman 505 -> disc near end 536 (lane + 7 crumble roofs now clean); NEW 2x2 prize-barrel stack at 68-69 (one hop) joins the roof street + pit + stair |
| longwater | 1 (swim 78t), 15/30 | 2 (swim + 7b/24t x462-486), 19/26 | Sluice Stair channel: sirens 370/390 -> channel ends 361/406, eel 382 -> 389, puffer 383 -> 404, angler 397 -> 403 (pre-grow cols, +88). The six piers read clean |
| canal | 0, 15/20 | 0 (NOT DONE) | see questions |

Restamps (all --write): spore pilot + curve + mash rows, tools/sporewood2art.mjs hash 3bf985fd9575 -> e06a1cd0ee49; fair pilot + curve + mash; longwater curve (level not gated: no pilot/mash rows). Fair's tools/harvest-fair.mjs lane assertion rewritten to the new rule (lane clean, its two men outside) and its runOver test now teleports those two men into the lane for the test.
Checks run: level-quality (spore + fair CLEAR; longwater's mechanics/secrets FAILs are pre-existing, not gated; whole gate ok), sporewood2 + sporewood2art green, longwater-river green, harvest-fair (node ok; page: 1 failure "frozen mummer took 7 blows" is IDENTICAL on base 49eee729), fair-route (same 3 failures at x99 pole hop / rick 403 on base too), reach-heroes (0 known crossings, nothing new), level-reach ok, floaters ok, chase ok, platforming-lint --self-test ok, longwater-walk (crash/STUCK identical class on base). Foe moves only; fair's barrel block is the one geometry edit (reach-heroes + fair-route pass it).
Level1 pilot (bare knight, 3 runs): spore deaths 0 -> 0, hits 19 -> 13; fair deaths 12 -> 20, hits 47 -> 59 (curve row 18 -> 23 deaths; run-to-run spread on fair is this big, but the strongman on the disc adds a real 3.5 to the exam: see Q2).
Stills: scratch\lane-reports\platwins1-{spore,fair,longwater}-{before,after}.png (god-mode shots at spore x82, fair lane x492, longwater x472).

## QUESTIONS FOR DANIEL (rec first, what I built)
1. CANAL not done. Its only clean section candidate is the Flight (x199-230: the lock chambers/ledge/balance beam, 7 beats/31t) but it is fought over by 4 coupled foes: grindylow 201 (the stranding-opening teach for Jenny), bargee 206 (first chamber ledge), bargee 216 (balance beam), grindylow 218. Lifting all four lints at 1 section. They are the barge-puzzle's teach, so moving them needs a design call. Rec: separate lane, move the two bargees to the pound end x188-195 and keep grindylow 201 (accepting the section starts at the 205 ride, 25t), or add a 2-3 hop summit step at x236-246 to lengthen it.
2. Fair: the strongman I moved onto the carousel disc (536) makes the exam ~3.5 heavier. Rec: keep (matches 'move, don't delete'); alternative is dropping him to a second mummer.
3. Fair: the lane's mummer/brute were deliberate 'run past' fodder (harvest-fair.mjs asserted them). I rewrote that assertion to the new rule. Rec: keep the new rule.
4. Spore: the terrace's heavy + spitcap now stand on the hollow steps below the shrine (the hollow opening is busier); rec ok.
5. Longwater second section is exactly 24t (the minimum). Rec: fine; sirens/lamprey could leave x450-456 for a longer one in a later pass.
