# touchrows (11-04) - claude/touchrows, off claude/batch143 (e9f7015c). Not merged / deployed.
Daniel 11-04 09:54: touch title rows >= 44 px.
## What changed (src/main.js, touch only; keyboard/pad/mouse title is byte-for-byte the old drawing path)
- When touchOn the title board is a PAGED list. Row height = ceil(44 / (S/DPR)) game px, so each tap row is >= 44 CSS px (812x375 landscape: S=2, rows 22 game px, 5 slots). `titleSlots()`.
- `titleWin()` windows the item list: an UP row ("PREVIOUS", triangle) when not at the top, a DOWN row ("MORE", triangle) when more below, both full-size tap rows. Keys/pad still walk the whole list; the window follows the selection (titleOff).
- On touch GIVE FEEDBACK and CREDITS fold under OPTIONS (titleTop 11 -> 9 rows, options list 5 -> 7); WHAT'S NEW stays on top (its new-dot). Demo: no EDITOR/BOSS RUSH rows as before; top list is 7 rows, so 5 slots page once.
- Board shape is fixed for top list and OPTIONS list (slots = min(fit, max(top, 7))). Portrait/tiny view: at least 3 slots (rows may shrink to ~42 CSS px at S=1 only if the view is < 3 rows of 44).
- BK.ui.titleWin() exposed; tools/touch.mjs and tools/touch-shots.mjs page to a row (tapTitleItem/tapTitle) instead of indexing hit boxes; touch.mjs now asserts tap boxes >= 43 px.
## Checks
node --check main.js, touch.mjs, touch-shots.mjs OK; node-only simulation of titleWin for 7/9/12 items at 3/5/12 slots (selection always visible, never > slots rows); comments, homepaths, demo-cut green. Full suite / tools/touch.mjs NOT run (release gate running).
## OWED (browser proof)
tools/touch.mjs title/settings sections; tools/itch-qa-mobile.mjs (its '>= 44 CSS px' title note should now pass); 812x375 touch shots of the title top page, a middle page and OPTIONS (touchrows-shots/).
## Questions (rec first)
1. Fold WHAT'S NEW under OPTIONS too on touch? Rec: no, keep (new-dot).
2. Add swipe-to-scroll on the list? Rec: later; the MORE/PREVIOUS rows are enough for the demo.
