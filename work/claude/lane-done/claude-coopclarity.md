# claude/coopclarity - CO-OP: MAKE PROGRESSION CLEAR (brief-coopclarity-1020, items 1-5; 6 left as a hook)

## CHANGES
1. PARTY BOARD seat picker: 'SAVE 2 - PYRO LV 6: EARNS XP, SILVER + CLEARS INTO SAVE 2' / 'SAVE n - EMPTY: A NEW SAVE STARTS HERE' / '... IN USE ELSEWHERE' / 'GUEST: PLAYS A LENT HERO - NOTHING IS SAVED' (src/coop-save.js summaryLine + constants, src/party-board.js, main.js slots()). Co-op wording is SAVE n now (was SLOT n).
2. ONLINE GUEST join screen: same lines + explainer card (YOUR HERO, YOUR SAVE: ...); JUST VISIT line; strip/menu say 'P2 +40 XP, +9 SILVER SAVED TO SAVE 1'. HOST room card: 'GUESTS NEVER CHANGE YOUR SAVE'.
3. IN PLAY: seat-coloured checkpoint toast 'P2 +120 XP, +40 SILVER SAVED TO SAVE 2' (ui-hud toastPush takes an optional colour); a seat leaving: 'P2 LEFT - KEPT EVERYTHING TO THE LAST SHRINE'.
4. WIN CARD (2-, 3- and 4-seat tallies): rows saved / xp / silver / clear per seat (SAVE n or GUEST - NOT SAVED; this wood's XP and silver his save took; CLEARED). Score rows pitch 8->7, card 23 px taller, winner/medal stamp/continue step down.
5. TAVERN: THE SAVES SIGN station (x 14, art in src/tavern-art.js, on the ART list) opens the co-op guide on a new 5th page HOW CO-OP SAVES WORK (the pause menu's 'Co-op guide' row reaches it too).
6. HOOK: CS.summaryLine / savedTo / creditToast are the one place for the CLOUD / LOCAL ONLY suffix.

## CHECKS (all on this branch, one Chrome at a time, port 8787)
- tavern (incl. new saves-sign assertion): GREEN. online-coop (two pages): GREEN. coop-progress (+5 new assertions): GREEN. tavern-menu: GREEN. hint-shown: GREEN.
- textfit party,hints,menu,settings --strict: 0 on every counter (win card x4/x3 + new x2, 94 hints, menu, settings incl. every co-op guide page).
- Test fixes (mine, not weakened): SLOT->SAVE regexes; a '+' in a regex that needed escaping; BK.ui.coopHelp hook name. textfit 'wincard' is not a scope - the win card is under 'party'; I added the 2-player card to it.
- NOT run: whatsnew/b-ui (untouched), the full suite, a visual look at the win card (textfit says no overlap/offscreen; eyeball recommended).

## QUESTIONS FOR DANIEL
1. Co-op says SAVE n; the title's save screen still says SLOT n. REC: unify to SAVE later (built: co-op only).
2. Win card XP/silver are per wood for each saved seat; guests show '-'. OK?
3. The online party-board/guest DOM cards are not covered by textfit (DOM, not canvas); the long picker lines wrap in their buttons - worth a glance.
