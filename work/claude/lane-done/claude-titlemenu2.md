# TITLEMENU2 lane report (11-08)
Branch claude/titlemenu2 from origin/master 262faf01a (BATCH152 live). Daniel's two changes:

1. EXTRAS (top level) no longer shows the 8 NOV date or the new-dot; both stay on WHAT'S NEW inside EXTRAS (src/main.js titleHasNew).
2. PLAY TOGETHER = SAME SCREEN / ONLINE WITH A FRIEND / PLAY WITH AI / BACK. PLAY WITH AI opens the existing PARTY BOARD (src/party-board.js, the inn board / pause-menu Party) straight on its AI PARTNER picker for the first empty seat: LINKED (another of the browser's saves) or DEFAULT (any hero at your level), then the hero, then HOW IT PLAYS. After a partner sits the board shows the seats list again, ending in PLAY; AI PARTNER on the other empty seats adds up to three partners. PLAY (or ESC/BACK once a partner sits... PLAY is the button) runs the same road CONTINUE runs (new fn titleGo(): load slot, map, or opening + hero pick for an unstarted save) with the partners wanted for the first wood. ESC/BACK with nobody seated returns to the title untouched.
   - party-board.js open(api, {ai, done}); main.js partyBoardOpen(opt); the title takes no key/pad press while the board is up (and clears them, so none fires on close).
   - Works in ?demo=1 (the board and partyAi have no demo gate); keyboard, pad (the board's own pad walker), mouse and touch (DOM buttons); the title row itself is a TCH.hit row like the others.
Tools updated: titlescene, touch, textfit (title), whatsnew (no date on EXTRAS, date on WHAT'S NEW), ai-companion (new `titleai` section), titlemenu-shots (+ AI picker stills). uiscreens needed no row change.
Checks (each alone): titlescene, whatsnew, touch, uiscreens, textfit title (0 issues), ai-companion titleai: all green. Page crashes (Inspector.targetCrashed) hit titlescene/ai-companion/whatsnew/touch on first tries while another lane ran boss tests; each passed on retry.
Not run: tools/check.mjs; the other ai-companion sections (board/pausebd/save) and online-coop/pvp-duel-flow; demo-cut.
Stills: scratch\lane-reports\titlemenu2\ (3-top-extras-badge, 4-sub-play-together, 4c-play-with-ai-picker, 7-demo-play-with-ai-picker, demo top/subs).
Questions (rec first): 1) On the AI picker, PLAY is the seats-list button; rec keep. 2) Demo's picker lists SAVE 2-5 LINKED rows (empty saves = a new hero); rec leave, or hide LINKED in the demo if Daniel wants only DEFAULT (one line in main.js aiSlots).
