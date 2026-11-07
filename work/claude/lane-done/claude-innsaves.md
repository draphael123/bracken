INNSAVES DONE 11-06 15:38 READY tip 4587ea4d6
Branch claude/innsaves (off origin/master 6f3b00e2e), pushed. Not merged, not deployed.

CHANGES
- src/tavern.js: 'saves' row renamed CO-OP RULES (id/verb/card unchanged; first-visit line now 'CO-OP RULES: ...'). NEW station 'guestbook' (THE GUEST BOOK, verb SAVES) at x=10 (between the party board x=7 and CO-OP RULES x=14; 3 tiles each side, REACH 18px is fine; the door side x=5 is the spawn point so it would crowd). P1 only: others get 'P1 KEEPS THE BOOK' (float + hint). Art list + draw call added. I did not touch the 'lesson' row or any inn-name strings.
- src/main.js: REUSES the existing 5-slot screen (state 'slots', drawSlots/update) with a slotInn flag (title says THE GUEST BOOK; hint line says ESC back to the inn). New bookOpen/bookClose/bookDropParty; a YES/NO question 'THE PARTY LEAVES THE INN' (same look as the erase question) shows first when guests are seated; YES drops guests cleanly (seatDrop / ONL.dropGuest, coopEnd, partyToWant). Rows under the question draw no words (textfit COLLIDE fix).
  Switching: the same save = just back to the inn; a new save = the usual hero pick/opening; a save that has met the inn (PROG.innTold) = enterTavern; otherwise the map (where it normally starts). Erase/fix/corrupt/other-tab-holder behave as on the title. Erasing the open save is refused from the inn ('you are playing this save'). BK.book debug getter and ui.slotInn/bookAsk for tools.
- src/tavern-art.js: guestbook() = ledger on a stand (open pages, ribbon, quill, a page edge that stirs, 2 frames) + hanging SAVES sign; first-visit glint is the shared one. The old board's art now reads CO-OP / RULES (it said SAVES) on a widened plank.
- tools/tavern.mjs: new checks (station names; guest told P1 KEEPS THE BOOK; P1 with a guest -> ask; NO keeps the party; YES drops the party; ESC back; guest rejoins). tools/textfit.mjs: 'slots' scope gains guest-book frames + the party question.

CHECKS
- node --check all touched files OK.
- tools/tavern.mjs: pure,join,stations 108 ok 0 fail; camera,leash,rings,save OK; fixes OK (one transient 'page CRASHED' on a run beside other browsers, passes on rerun and on master); party OK; online PASSED here (did not time out). Logs: scratch\lane-reports\innsaves\tav-*.log
- textfit slots,erase,hints,title,card,party,lesson,arena: 0 findings (after the COLLIDE fix).
- Browser run (headless, scripted): alone open -> slots; switch to empty slot 2 -> hero pick; inn on slot 2, switch back to slot 1 -> wakes in the inn on slot 1; erase of the open save refused; ESC backs out; with guest -> ask -> YES -> party gone, five slots, ESC back to the inn; guest at the book -> P1 KEEPS THE BOOK.
- Stills in scratch\lane-reports\innsaves\: 01 (book + prompt in the inn), 02 slots from the inn, 03 new-save hero pick, 04 party-leaves question, 05 slots after, 06 inn after, 07 guest told.

NOTES / QUESTIONS
- Q: is 'has met the inn' (PROG.innTold) the right test for waking a switched save in the inn? Rec: yes (a brand-new save runs its opening instead).
- Q: after YES the party is gone even if P1 then backs out with ESC (guests already left). Rec: keep (the question says so).
- The 'first arrival' inn card pops on first visit to a save; it covered the glint in still 01's first take (re-shot later).
