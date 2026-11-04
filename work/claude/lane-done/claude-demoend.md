# claude/demoend - DEMO flag + END CARD + SAVE CARRY-OVER (11-03)
Branch claude/demoend off claude/batch142 (e4d5dad4). Not merged, not deployed. Code commits fddca4ce, 9d4b531a (+ this report commit on top).

## Built
1. DEMO flag - src/demo-flag.js: `?demo=1` or the build constant DEMO_BUILD (ships false; the later itch-build lane flips it). Slice = the 12 DEMO levels in src/demo-slots.js (wood, hornetsnest, marsh, fenroad, stockade, spore, rootway, underleaf, palisadewood, KINGS = King Gorm, burning spur, arena_yard). Everything else on the road (Scree Path on: 42 campaign levels) is locked by `levelLocked` whatever the save / setting / ?unlock says; hidden shops/trials/tavern stay reachable. Also: no walk-out transition from Kingswood to a locked wood; no BOSS RUSH / THE EDITOR rows; BOSS SELECT lists only slice bosses. Flag off: every main.js use is of the `DEMO && ...` / `DEMO ? a : b` shape (8 uses, pinned by tools/demo-cut.mjs).
2. END CARD - src/demo-end.js (+ src/demo-end-config.js for the words): after King Gorm's win card (Z), state `demoend`: thanks, KEEP YOUR PROGRESS (downloads the same file SETTINGS > EXPORT SAVE writes: thornroad-demo-progress.json), GIVE FEEDBACK (the existing in-game form, opens over the card, Esc returns), CREDITS (the existing credits page; Esc or onward past the last page returns to the card), BACK TO THE MAP (the Burning Village spur and Arena Yard are still ahead), MAIN MENU, and a follow line. Text says progress carries over and where to import it (SETTINGS > IMPORT SAVE). Keyboard, mouse, touch, pad. Shows on every Gorm win (not only the first).
3. SAVE CARRY - src/demo-save.js: the demo tags its save `demoSave: 1` (only if nothing past the slice is cleared, so a full save opened under ?demo=1 is never tagged). The full game's Import save now reads the file through `prepareImport`: untagged file = the SAME STRING (full-game import untouched); tagged = hero levels/skills/loadouts/heroes/coins/slice clears+medals carry; any record/done-mark/road-open flag past Kingswood is dropped (Scree opens only by the chain, kings cleared -> scree needs reaching); adds `demoImported: 1`, keeps the tag.
4. Filenames: demo-flag, demo-save, demo-end, demo-end-config, demo-cut, demo-save-carry, demo-end-page: asserted ad-block-clean in demo-cut (ad/admiral/banner/track/analytics/pixel/promo/popup/stats words); no analytics code. DOM ids: demoend, dekeep, defeedback, decredits, demap, demenu, demsg, decss (clean).

## Checks (node; all green)
- NEW tools/demo-cut.mjs (slice = live needs chain, locked tail, only Kingswood ends the demo, flag-off identity, pinned flag uses, names) - registered in tools/check.mjs list (with demo-impact).
- NEW tools/demo-save-carry.mjs (save-safety demo -> full: A carry, B locked past Kingswood, C backup/refuse truncated/newer/unsafe, D untagged unchanged) - registered likewise.
- Also green: demo-floats, shop-gates, comments, homepaths, modulepreload (refreshed with --write: 736 modules, 0 missing), node --check on main.js and all new files. dangling-paths red only until commit (fixed) + the pre-existing queengloss citation src/redraw/prior_queen_set.js (not mine).
- ONE headless run (4.6 GB free, GATE-RUNNING.flag present): tools/demo-end-page.mjs - ?demo=1, Kingswood won -> Z -> demoend, card + 5 buttons, Down+Enter opens feedback, Esc closes it, KEEP downloads a tagged file (2989 chars, demoSave 1), CREDITS + Esc return, BACK TO THE MAP -> map, flag-off: no card, no page errors.
Screenshots: C:\Users\Daniel Raphael\.claude\bracken-lanes\scratch\lane-reports\demoend-shots\ (endcard.png, endcard-feedback.png, endcard-credits.png).

## Browser checks OWED (not run: gate running)
Real boss kill of Gorm in the demo -> card (only the win path was driven); map under ?demo=1 shows the locked tail; touch at 375x812 (card buttons >= 44 px, tap-only exit from credits); download inside the itch iframe (sandbox may block it); textfit/title-region/touch/map-grammar suites; full-game boot flag-off (suite). Burning Village spur from the card's map after Gorm in one life.

## Not done / notes
- No map caption 'THE ROAD CONTINUES...' (not in this lane's scope; locked nodes just show LOCKED).
- Menus not hidden: later heroes' store rows/roster slots, practice limits (brief 1025 item 4) - only levels, boss select, rush, editor.
- Storage keys are NOT split by flag: the demo is meant for its own origin (itch / own alias). On a shared origin ?demo=1 would use the full game's slots (harmless: the lock is computed, tag only on demo-shaped saves).
- No 'copy code' button: the full game's import is file-only; a code with nowhere to paste is useless.

## Questions for Daniel (recommended answer built)
1. Follow-line link: FOLLOW_URL in src/demo-end-config.js is blank (plain text, no dead link) - send the itch URL. REC: fill at upload.
2. Add a COPY CODE button + paste-import in the full game for itch embeds that block downloads? REC: wait for QA of the embed download; add only if blocked.
3. End card on every Gorm win or first only? REC: built every win (it is where KEEP lives).
4. Hide later heroes/store rows and add the map caption in the trimmed itch-build lane? REC: yes.
