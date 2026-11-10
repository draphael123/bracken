# foevar3 (lane F3 + trims of F1/F2) - 11-10, code-only, branch claude/foevar3 (from claude/foevar2 53bf3d2ae)
Change: src/cast-pass.js only (data rows). No browser started, no check.mjs, no merge/deploy.

## The index rule (why the trims look the way they do)
indexOf = threat/(span/100)*2 + kinds*3 + haz + gap/20, and "kinds" counts BASE ent types (skins do not count). A new base kind costs +3 index; it is paid for either by a kind-neutral swap (a skin of a kind already in the level, or a kind already there) or by a cheaper replacement foe (threat down; 1 threat = 0.2-0.36 index by level span). Variety score = exp(entropy) of the kind mix, skins counted (tools/foe-cast.mjs).

## PART A - trims (curve index vs the pre-foevar level; all inside +-2 now)
| level | idx base -> F1/F2 -> now | variety base -> F1/F2 -> now | what stays |
|---|---|---|---|
| caravan | 133 (row unchanged) | 5.7 -> 5.7 -> 5.7 | cutthroat->scorpion |
| underwell | 72 -> 75 -> 72 (0) | 9.2 -> 10.5 -> 10.1 | venom->fire / thirst scorpion skins; waterthief row dropped |
| glasssea | 67 -> 74 -> 67 (0) | 5.9 -> 8.7 -> 7.7 | glass->fire + oil scorpion skins; waterthief + raptor dropped |
| ksar | 78 -> 87 -> 80 (+2) | 7.8 -> 11.1 -> 9.3 | wallslinger->raptor x4 (the one new kind) paid by ksarblade->shield sentry x3 |
| buriedcity | 68 -> 74 -> 69 (+1) | 4.7 -> 7.3 -> 5.8 | sandslinger->fire scorpion, sanddrowned->brass scorpion (no new kind) |
| sealedpyramid | 85 -> 88 -> 85 (0) | 7.2 -> 9.0 -> 8.8 | construct, sand-drowned, vulture, venom scorpion (cutthroat row dropped) |
| towpath | 69 -> 76 -> 71 (+2) | 7.3 -> 9.2 -> 8.5 | crossbow x1, runner x2 for bargemen (1.5 for 3.5 pays the kind), river-rat skin; lanternshade dropped |
| canal | 86 -> 96 -> 86 (0) | 5.7 -> 7.5 -> 6.4 | runner x3 for bargemen, river-rat skins, all 3 lamplighters -> lanternshade (kind for kind); crossbow + swornsword dropped |
| fair | 130 -> 141 -> 132 (+2) | 6.3 -> 9.8 -> 9.3 | haunt (every 2nd mummer), armour (mummer + strongman); stagehand + boo dropped |
Not all of the F1/F2 variety survives (ksar, buriedcity, canal lose the most): the index and a new kind cannot both be had. Skins + paid-for kinds keep roughly 55-95% of the gain.

## PART B - F3 levels (idx base -> now; variety base -> now)
- underleaf (goblin, pre-Queen) 77 -> 77; 6.5 -> 7.8: clubsprig for every 2nd plain sprig, rock-archer skin on the one plain bow. No new kind (the brutes and herb-throwers are not plain; sprig->sporeling/spider cost +3 and nothing plain was heavy enough to pay it). BEFORE sprig 12 thief 11 herb-thrower 10 shield 4 venom-archer 3 brute 3 archer 2 | AFTER thief 11 herb 10 club 6 sprig 6 shield 4 venom 3 brute 3 archer 2.
- rookery 76 -> 77; 5.9 -> 8.0: goblin KITES (pre-Queen, kite machine) for 5 perched crag harpies (x<=120 and x>=160; the two by the first Shrieker keep their dive, tools/rookery.mjs needs them), crow->bat every 3rd. BEFORE harpy 21 crow 11 fledgling 5 shrieker 5 gale 5 goat 3 troll 2 bat 1 sisters 1 | AFTER harpy 16 crow 7 bat 5 kite 5 fledgling 5 shrieker 5 gale 5 goat 3 troll 2 sisters 1. Roost/ride harpies (rk) untouched.
- kitchengate 91 -> 93; 7.8 -> 10.4: clubsprig x5, hearthgob->FIRE-ARCHER x3 (the one new kind; threat 2 for 3 pays it). BEFORE sprig 9 hearth 7 bat 5 thief 5 attendant 4 burngob 2 butcher 2 ... | AFTER bat 5 thief 5 club 5 sprig 4 hearth 4 attendant 4 firearcher 3 burngob 2 butcher 2 ...
- warcairn 66 -> 68; 6.6 -> 7.7: 2 ORDER PALADINS (first placement of the unplaced foe), soldier->shield (shield 3 -> 7), 1 more javelin. BEFORE soldier 9 harpy 9 goat 5 berserker 3 shield 3 drummer 2 javelin 1 heavy 1 | AFTER harpy 9 shield 7 goat 5 berserker 3 paladin 2 javelin 2 drummer 2 soldier 2 heavy 1.
- waymeet 112 -> 114; 6.7 -> 7.5: 3 ORDER PALADINS for hedgeknights (every 4th) + a crossbow for every 6th knight east of x60 (3 for 4.5 pays the kind). BEFORE hedgeknight 18 sworn 16 crossbow 13 drunk 8 heavy 5 runner 4 lancer 3 dog 2 | AFTER sworn 16 crossbow 15 hedgeknight 13 drunk 8 heavy 5 runner 4 paladin 3 lancer 3 dog 2.
- fallingtower 115 -> 117; 7.4 -> 9.5: topiary x4 (new kind, from the Stair), armour->mimic every 2nd suit east of x30 (2.5 for 3.5 pays it; the lab-landing armour stays, tools/fallingtower4.mjs), apprentice->zombie every 5th. BEFORE apprentice 23 armour 18 tome 10 mimic 6 broom 4 zombie 3 turret 3 ... | AFTER apprentice 15 armour 14 mimic 10 tome 10 zombie 7 topiary 4 broom 4 turret 3 ...
NOT placed: familiar (src/main.js ~29958: stepped only when `miniActive`, i.e. it belongs to the Archmage mini fight; a placed one would stand inert); assassin / bellman (only in the old level.js builder block; no art/AI load proved in node); imp/broom/whelp swaps in the tower (they fly; tools/tower-flyers.mjs holds flyers to flat ground, 16 reds when tried); harpy->kite on the rk roost harpies (the rookery hands own them).

## Checks (node only)
OK: node --check cast-pass.js, foe-cast-lint, one-new-foe, threat-holes, goblin-lint, curve.mjs (22 steps out of line = same count as before; no new wall; rookery stays within the skyroad drop limit), foe-footing (reds on all 14 levels IDENTICAL to the pre-foevar rows: no new red), towpath, canal-water, canal-aloft, fair-map, rookery, herofeel-rookery, warcairn, waymeet-cleanup, fallingtower2/4, tower-flyers, tower-hall, desert-bosses/rules/sets/foes/art.
Pre-existing red (not mine): kitchengate.mjs "boss-greed knows his openings" (fails on the base rows too); canal-map crashes in master.
RED expected / owed: level-quality pilot + mash (stale hash) for every level below.
Skipped (cdp): underleaf, tower-ascent, tower-chase, tower-collapse, under-order, order-knights, paladin-kit, lab-order and every F1/F2 browser tool, save-safety, QUICK gate.

## Owed browser (after the gate), ALL F1-F3 levels
- pilot + mash --write: `node tools/level1-pilot.mjs <id> --write` and `node tools/mash-bot.mjs <id> --level <id> --write` for caravan underwell glasssea ksar buriedcity sealedpyramid towpath canal fair underleaf rookery kitchengate warcairn waymeet fallingtower.
- Stills walk, F1: caravan claw for a blade; underwell fire/thirst scorpion; glasssea fire + oil scorpion on glass; ksar raptor on the walls + shield sentries where blades stood (do the gong/squad scripts still work: only plain `ks` ents were swapped); buriedcity fire/brass scorpion on sand; pyramid construct / drowned / vulture / venom scorpion.
- F2: towpath crossbow perch + the 2 runners (does the shout fetch the sworn swords?); canal 3 runners on wharves, lanternshade lamplighters, river rats (do the boarding scripts read e.canal on the swapped ents? only plain bargemen were swapped, drop:['canal']); fair haunt + armour (house of horrors / hall of mirrors; mummers 16 -> 9).
- F3: ORDER PALADIN at waymeet (3) and warcairn (2): walk each, check the parry window (gleam offered every ~2 s, whole shield otherwise), that none stands in a doorway/gap, and that a 4-threat Crusader-shield foe reads fairly at Warcairn (d21, before Waymeet on the road). Rookery kites (hover over the crags, clear of the harpy dives), crow->bat reads. Kitchengate fire-bow on its perch (fire patch in a kitchen), clubsprig. Underleaf clubsprig + rock archer. Falling tower: topiary x4 (where do they stand?) and mimics.

## Questions (rec first)
1. The index counts base kinds, so every new kind costs 3 points and variety is capped by the +-2 rule (underleaf got no new kind). Rec: ask the curve owner to weigh kinds by share (or cap the term) so a 3-foe cameo does not cost 3; until then the pay-in-threat approach here is fine.
2. Paladins at Warcairn (d21, before Waymeet's first sighting; whole shield): rec keep 2 there as the parry lesson's first teacher; drop to Waymeet-only if the walk says it is too hard at d21.
3. canal/towpath runners (x3 / x2) replacing bargemen: rec keep (1.5 for 3.5 threat); if the walk shows the shout fetches nothing, swap them for sworn swords and take the index +3.
4. Familiar needs a mini-fight host to stand in the tower: rec skip, or a small main.js lane to step it outside the mini fight. Assassin/bellman: rec skip until an art check.
