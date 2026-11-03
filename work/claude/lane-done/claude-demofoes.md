# claude/demofoes - DEMO FOE PLACEMENT pass (11-03, data only; branch off claude/batch140 5f856e7e)

Scope kept: existing foe AIs, no new foe types, no affixes, no layout/terrain/art edits. Fen Road, Stockade, Burning Village, Hornet's Nest untouched. Every level below is restamped (pilot + curve + mash) and level-quality "CLEARS THE BAR"; foe-footing strict-green for all seven; curve-gate green (0 out of band).

## Per level (columns are built tile columns)
- LUMBER TRAIL (wood): footing sprig 153->154, spit 245->246, sprig 343->344, helm shield 444->443 (3 tiles of room behind him). Debut stagger: the thorn left the 78-88 clump (88) for the flat at the skid road's foot (62,21) - met alone before the shield lesson (65-86); shield 78 / spit 85 stay.
- MARSH WOOD (marsh): archer 62->63, sprig 100->101, garrison hopper 210->211 (new GARRISON_NUDGE hook in src/level.js, applied AFTER the sprinkle: moving a hand-placed foe before it frees a held tile and the garrison re-rolls - the first try put a spitter in the stump). Hopper 491 y16->17 (stood a row over a reed stand), hopper 630->629 (the reed bed is 628-629). Side effect: that hopper is now its own off-route clump, report-only route-blocking 41% -> 39% (bar 40%, REPORT-ONLY for marsh).
- SPOREWOOD (spore): brute chain 192/224/243/266/286 -> brutes keep 192, 224, 286; 243 and 266 became sporeling pairs (242+246, 266+270). Footing: shield 134->135, 219->218, 402->403.
- ROOTWAY: opening thinned: sporeling@14 and weaver@18 dropped (cellarA keeps the spitcap + the perched spitcap). Density still 2.50 (ceiling, in band), foes/screen 4.8 -> 4.6.
- UNDERLEAF: sprig 249->248 (fence). +4 foes, all herb-reskinned existing AIs, on open ground only: thief 167,29; thornbeast (brute thornCoat) 129,33; leaf archer 209,25; jar-thrower 281,26 (raised bed). The "gaps" at 366-449 are the vine gully / bubble shafts (platforming puzzles over thorns) - deliberately NOT filled. Density 1.10 -> 1.29 enc/screen, 2.0 -> 2.2 foes/screen, brutes 2 -> 3.
- PALISADE WOOD: hornsman debut moved 295 (inside the 4-foe wall-end exam) -> 277,12 on the floor under the tower archer (274), squad 'tower' (he needs an archer in earshot; the exam archer 297 is within 20 tiles so the horn still works there). Archers -3: 98 -> hound (103,31), 162 -> hound (160,31), 195 -> pike (194,28).
- KINGSWOOD: footing shield 99->100. Burning-wood escape: 3 fire swaps - ember wisp at 549 (was torch sprig), burngob at 553 (was torch sprig @555, which also stood in a pennant), burngob at 629 (was plain sprig). Torch goblins 507 / 584 / 620 stay (tools/gorm2.mjs wants >= 3). burngob/emberwisp assets already baked; villageAshes/updateBurnGob are VG-guarded so they are safe outside the village.

## Restamp (old -> new; the run stamped the 11-03 hashes)
- wood: pilot hits 30->28 deaths 1->2 kills 36->48 WARN lifts 88->84; curve deaths 2->3 lostPct 147->147; mash pyro deaths 3->4.
- marsh: pilot kills 55->48; curve hits 30->26 lostPct 172->175; mash deaths 15->13 / 12->10 / 13->11.
- spore: pilot deaths 1->3; curve hits 10->13 WARN, lostPct 82->140 WARN (the OLD row was already stale: hash e06a1cd0ee49). RERUN once: hits 17, deaths 3, kills 25, lostPct 163. Both are well above the old 82 - the sporelings in the 243/266 slots are weaker than brutes but there are more hits; the curve gate stays green. FLAG for Daniel/tune: spore bot pressure rose, not fell.
- rootway: pilot hits 37->49 WARN; curve deaths 2->3; mash +1 death knight/warden.
- underleaf: pilot hits 28->21 WARN, deaths 2->1; curve hits 20->28 WARN, lostPct 134->170 WARN. RERUN once: hits 24, deaths 1, kills 33, lostPct 174. Consistent with +4 foes.
- palisadewood: pilot deaths 3->0 WARN, kills 67->84 WARN; curve kills 74->88 WARN, lostPct 110->124; mash deaths 5->4 / 4->3 / 4->2.
- kings: pilot hits 21->27 WARN; curve lostPct 171->182; mash warden deaths 4->2.
- Final: level-quality green for all 7, curve-gate green, foe-footing green. mash-gate shows one RED: MOOR (stale mash row) - pre-existing, not touched here.

## Screenshots (scratch\lane-reports\demofoes\*.png, 16 frames, knight god-mode, 640x360)
01 wood thorn@62, 02 helm shield@443, 03 hollow@154, 04 spore highstalk 242/246, 05 spore ladder 266/270, 06 spore shield@135, 07 kings ember wisp + burngob run2 (visible: wisp + red cross, burngob), 08 kings ravine burngob@629, 09 underleaf jar-thrower@281, 10 underleaf thornbeast@129, 11 palisade hornsman@277, 12 palisade hound@160, 13/14 marsh hoppers 491/629, 15 rootway opening, 16 underleaf ditch sprig@60. Frames were taken 8 columns left of the foe, so the foe is to the right of the hero; the Kingswood frames kill the king first (teleporting past the hall trips the boss arena).

## Checked, not moved ("landing" heuristic)
wood sprig@71 (slope, no gap before it); underleaf sprig@60 (a 4-wide ditch lands at 58, two cols before it - left, screenshot 16); spore/palisade/burning perch "landing" candidates not individually screenshot-reviewed beyond the frames above.

## Reverted
Nothing. Everything restamped well before WED noon.

## Questions (recommended answer first)
1. Spore curve lostPct (82 stale -> 140/163) and underleaf (134 -> 170/174): accept as is? REC: yes (gate green, in band); a spore tune lane may swap one sporeling pair back to a brute if Daniel wants the heavier chain.
2. Hornet's Nest stale pilot/mash rows (audit item 2) were NOT restamped here (out of scope). REC: have the next lane that owns the Nest do it with the SAT 11-07 rework.
3. Kingswood escape fire foes: OK that torch-goblin count dropped from 6 sprigs to 3 torch + 2 burngob + 1 wisp? REC: yes.
