# codex/bossselect — Boss Select

Base: `origin/master` at `7ade0605` (2026-10-16). This branch is for the coordinator to merge; it has not been merged or deployed.

## Built

- Added BOSS SELECT to the title list and a BOSSES entry beside the world map's level list. The list comes from `bossTable()`, groups 63 bosses and minis by act, hides unbeaten names behind silhouettes, and shows the selected owned hero's best time and no-hit mark.
- Starts the chosen fight through the existing boss-jump door/checkpoint with the selected hero's actual saved XP, loadout, talents, flasks, and current campaign kit. The mode is single player; it ends any active co-op pairing before entry.
- Kept the boss-jump save lock for the whole fight. XP is disabled in Boss Select; normal progress, coins, silver, unlocks and drops cannot persist. A separate guarded writer updates only `bossRecords[level:kind][hero]` in the active slot. Quit to Boss Select reloads the slot and returns to the list. Death reuses the door checkpoint.
- Added safe migration/validation for an existing save without `bossRecords`. Normal campaign boss kills now set `bossDown[level]`, so a boss is selectable once actually beaten; older cleared levels are still recognized.
- Added touch list/hero hit targets and a FIGHT/BACK pill, keyboard and pad navigation, and a strict textfit scope for every row and hero.

## Evidence

Before: `origin/master` has no BOSS SELECT title/map entry, no `bossRecords`, and no `tools/boss-select.mjs`. Existing `bossTable()` and `bossJump()` supplied the fight entry point.

After: `node tools/boss-select.mjs` passed with 63 rows, locked names hidden, a beaten boss and mini, saved knight skill loadout and Warden XP, records in slot 3 only, no campaign save diff except records, death returning to the door, quit/reload, and keyboard, emulated pad, and real touch input from the world-map list. The test started with a current-format pre-feature save lacking `bossRecords`.

`node tools/textfit.mjs bossselect --strict` drew 70 screens and measured 2,301 strings: zero OVERFLOW, OFFSCREEN, CLIPPED, TRUNCATED, COVERS, COLLIDE, OVERDRAWN, SMUDGE, or ERROR.

`node tools/check.mjs boss-select,settings-tabs,save-slots,save-safety,whatsnew,uiscreens,touch`: 8 of 385 subset checks passed. The full `touch` check took 176,445 ms and included real touch menus.

`node tools/boss-jump.mjs`: all 63 fights woke at the door; 58 were cut down by its generic slay harness, every localStorage key remained unchanged, and URL/hero/mini/SHIFT+B entry passed.

`node tools/check.mjs textfit`: passed, including the new `bossselect` scope; no pictures or strict text issues.

`node tools/mobile-perf.mjs`: passed at 4x CPU throttle. Title 60 FPS, map 59.3, Wood 60.1, Welltown 45.7, Red Gorge 49.6; first input 260.2 ms.

`node tools/check.mjs boss-select`: syntax and Boss Select passed after visual and touch refinements (2 of 385 subset checks; Boss Select 69,104 ms).

## Files outside the narrow list

- `src/touch.js`: one repeat-list entry and one FIGHT pill, needed so 63 rows are usable by touch.
- `tools/textfit.mjs`: one scope for the new screen and its rows, needed for the requested textfit verification.
- `src/main.js` beyond the menu and boss-jump entry: minimal save-lock, XP, fight-end, death and quit hooks needed for no-farm records and replay.

## QUESTIONS FOR DANIEL

- Co-op Boss Select later? Recommendation: keep this first release single player until the two-hero door and record rules are specified. Built: starting Boss Select ends an active co-op pair without changing the save.
