# claude/saveword - SLOT n -> SAVE n (player-facing wording only)

## STRINGS CHANGED (internal ids/keys/localStorage names untouched: bracken.progress.n, bracken-slots, SLOTS, slotI, ...)
- Title save screen (src/main.js): card label 'SAVE n' (was SLOT n); 'ERASE SAVE n?'; 'SAVE n IS CORRUPT / IS A NEWER SAVE'; footer 'TAP a save   ERASE to erase'; FIX IT menu row 'ERASE THE SAVE'; messages 'save n restored / erased / is damaged - Z to fix it / is playing co-op elsewhere'.
- Title/menu card 'SAVE n  x/y WOODS' / 'SAVE n  A NEW KNIGHT'; pause 'Erase this save' -> 'save n cleared'.
- Save-health banners: 'Save n is damaged (copy kept)...'; 'SAVE PAUSED - IN CO-OP ELSEWHERE'; 'FREE SPACE: ERASE AN OLD SAVE...'; local seat 'SAVE n CANNOT BE READ...'.
- Co-op (src/coop-save.js): 'THIS SAVE IS DAMAGED...', 'THIS SAVE IS FROM A NEWER BRACKEN...', '...OPEN A DIFFERENT SAVE THERE'. Online guest (src/online-guest.js): 'NO SUCH SAVE'. Co-op guide (src/coop-help.js): 'one of their saves'. Bug report text: 'save n'.
- Left alone on purpose: level-editor slots (dev tool), skill slots / Slot 3-4 key (abilities, not saves). What's New and hints had no save-slot wording; the party board/online lines were already SAVE n (coopclarity).
- Tests updated to the new words: tools/save-slots.mjs, tools/save-safety.mjs.

## CHECKS (port 8787, one Chrome at a time)
GREEN: save-slots, save-safety, coop-progress, hint-shown, tavern, tavern-menu, online-coop, syntax.
textfit menu,settings,party,hints,slots,erase,title --strict: 295 screens, every counter 0.
Reds: none. Not run: full suite, whatsnew/b-ui (untouched).
