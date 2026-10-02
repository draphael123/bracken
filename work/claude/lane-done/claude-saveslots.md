# SAVESLOTS lane (Sonnet) - five save slots

## What changed
- src/main.js: `SLOTS` is 5. Keys stay `bracken.progress.<i>`, so slots 1-3 and the legacy `bracken.progress` migration (slot 1) are untouched; readSlot / loadSlot / eraseSlot / export / import already worked per slot and needed no change.
- The slots screen is now FIVE ROWS (drawSlots, slotRect, slotLevel). Why rows: the real 8 px face is about 8 px a letter ("99 medal pts" is 95 px), so five side-by-side cards of 60 px, and even the old 92 px cards, could not hold their words (the old screen already overflowed: "12 / 33 woods" ran past its card, see work/claude/saveslots/before.png). A row is 316 px wide: sprite, then SLOT n, HERO and LEVEL (new) over `12/33 WOODS  120 GOLD  24 MEDAL PTS` (6 px caps) and a green COMPLETE.
- Input: UP/DOWN and LEFT/RIGHT all walk the five slots and wrap. `BK.press` learned up/down and `BK.ui.slotI` was added for the tools.
- Level for the card: levelOfXp of the save's own hero xp; an old save with no xp yet gets xpFloor(woods that hero walked), the same migration progDefaults does on load.
- tools/save-slots.mjs (new, in check.mjs's list): five slots independent, old 3 saves byte-identical after the migration pass, writes/erases of slots 4-5 never touch them, legacy save is slot 1, screen navigation/wrap, Z opens, X X erases only the picked slot, every card shows hero and LEVEL.
- tools/textfit.mjs: new `slots` scope (five full worst-case saves, then mixed full/empty, each selected); added to check.mjs's textfit scope list.
- ED_SLOTS (level editor) untouched.

## Before / after
- Base (d12c0941): save-slots fails (SLOTS is 3); textfit slots: OVERFLOW 3, COLLIDE 1 on only 3 cards.
- After: save-slots green; textfit slots OVERFLOW 0 OFFSCREEN 0 COLLIDE 0 TRUNCATED 0 SMUDGE 0 over 10 screens.
- Captures: work/claude/saveslots/before.png, after.png.

## Checks
See the final message for the green list.

## UNVERIFIED
- Gamepad/touch navigation of the slots screen was not exercised (it uses the same left/right/up/down presses).

## QUESTIONS FOR DANIEL
1. Rows vs a 3+2 grid of cards: I recommend rows (built); a grid cannot hold the words at this font size.
2. The medal line says "MEDAL PTS" in 6 px caps (was 8 px lower case) to fit; OK, or prefer "MEDALS"?
3. Should a new slot's first-time prompt say anything about which slot is "last played"? Not built.
