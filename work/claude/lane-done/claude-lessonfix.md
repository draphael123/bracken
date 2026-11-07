STATUS: READY for the SAT 11-07 cut (branch claude/tutorial1, code 7b33e7b2e; report commit on top). Not merged, not deployed.

# LESSONFIX
1. lesson-opening 'ranger/paladin walk' - NOT load. Real cause was the TEST: the 2nd/3rd hero in the default run loaded the lesson via BK.load without OPN.reset() (the game calls it in opnEnter), so step/done/PROG.taught leaked from the knight. Alone per hero both passed. Fix in tools/lesson-opening.mjs (reset in __go; stall test clears taught first). Full run knight,ranger,paladin + skip/inn/flow: PASSED. No game code change.
2. tools/tavern.mjs: all scopes ok (pure, join, stations, fixes, camera, leash, rings, party, save, online). Two flakes under browser load, both pass on rerun: one 'fixes' page crash (Inspector.targetCrashed, same transient as tutorial1 saw) and 'online' timeout when run after it; online alone passes. No red from the rename.
3. textfit levelcard, hud, menu, mapcard --strict: 0 issues each (levelcard needs its own run: a combined run crashed the page, flake).
4. MASKWRIGHT'S THEATRE title (src/main.js ~5623): the name was cut to "THEATR" in the small hand because the DANGER word takes the right side. A name that does not fit even in the small hand now takes DANGER's room (the red pips stay); only that card changes. mapcard 0 truncated.
5. Stills: scratch/lane-reports/lessonfix-lesson-start.png, lessonfix-inn-card.png, lessonfix-maskwright-title.png (script scratch/lessonfix-shots.mjs).

## Questions (rec first)
- Wording of the map card: dropping the DANGER word only on the theatre card is slightly inconsistent. REC: keep (one card, pips still show); alternative: rename to MASKWRIGHT'S THEATRE.
- Test-harness: add OPN.reset() to BK.load for the lesson level too? REC: no, the game always enters via opnEnter.
