# TRANSCHOICE (claude/transchoice, tip f92141bac, off master 95bc267a4) - code only, not merged, not deployed

## Changes
- src/transitions.js: pure choice-card logic (CHOICE_ARM_S 1.2 s, needsChoice, choiceRows, choiceStart, choiceStep, choiceArmed).
- src/main.js: trnBegin(direct=false). After the gates, the demo lock and TRM.policy, a plain row opens the card (trnChoice) instead of starting the walk-out. ONWARD = trnBegin(true), the old flow. RETURN TO THE MAP = trnToMap (state map, cursor on the next node, saved). trnToMap is factored out of trnFinish, so the endOnMap row (kings > burning) is unchanged and keeps its spur pulse. The card is drawn over the level-complete card (WHERE NEXT? / ONWARD TO <NEXT> / RETURN TO THE MAP). Rows are tap targets. The full-screen tap and the Z NEXT / ESC MAP footer are off while it is up. A level load or startGame clears it.
- FIRST TIME seen-flag is now set on ONWARD only, so a trip to the map does not use the cutscene up.
- tools: new transition-choice.mjs (37 rows, in check.mjs); demo-transitions / transition-woodmarsh browser loops press confirm on an armed card; woodmarsh's trnBegin regex updated.

## Verified (node only)
node --check src/main.js src/transitions.js tools/*.mjs touched; node tools/transition-choice.mjs (37 ok); transition-woodmarsh.mjs (31 green); demo-transitions.mjs (120 green).

## Decisions
- Single player / TRANSITIONS=NEVER / a FIRST TIME pair already seen: nothing auto-loads there (the level-complete card's Z already goes to the map), so no card is shown. Only where the cutscene would have loaded the next wood.
- The level-complete card now shows for ~1.2 s on those rows (it was skipped before) and the card lands on top: the tally reads, a mashed confirm cannot choose.
- Online: guests watch the host's streamed frame and their keys drive only their seat (intoPlayer), so the host chooses and guests see the card waiting; no net change. Local co-op: any local seat's keys choose.
- Demo: DS.demoLocked returns before the card, so Gorm's win card then the END CARD is untouched.

## OWED (browser, not run: Daniel playtesting)
- Stills: card on solo and co-op (2-4 seats), touch layout, long next names (fitText), the map after RETURN (cursor on the next node, no spur pulse for a plain wood).
- tools/demo-transitions.mjs --browser and transition-woodmarsh.mjs --browser (loops edited, unrun); full gate.
- Online guest check: host shows the card, guest sees it wait, host picks MAP, guest follows.

## Questions (rec first)
1. After RETURN TO THE MAP, light the next node with the spur-style ember pulse + NEW tag for plain woods too? Rec: no for now (cursor on the node is the cue); revisit after stills.
2. Add ESC on the card = RETURN TO THE MAP? Rec: yes, small follow-up (currently ESC does nothing, as on the old win card).
