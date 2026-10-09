# claude/panels - PANEL-SHAPES (art-direction fix 7)
Base claude/hudslim + titlescene + mapscale. Shots: work/claude/panels/{before,after}/ (tools/panels-shots.mjs <worktree> <outdir>).

## What changed
1. PLATE FAMILY (src/main.js bakePlate/board/panel, new `style` arg; default 'frame' = the old riveted plate, now only the HUD plate). One pixel scale for all: 1px dark outline, 2px frame, plate from px 3, hard pixels, no gradient, no cap wider than a stud. Frame colour follows the UI colour setting; shape/grain do not.
   - ledger: gilt double line + 4 square brackets: store, level-complete tally, victory table, erase YES/NO buttons.
   - wood: nailed plank frame, plank seams + grain, stained plate: pause, settings, controls, practice, talk board.
   - parchment: torn corners/edge, dotted inner line, paper fleck, aged tint: save slots (5 slips, picked one gilt), bestiary page, credits, map info card, map list panel, hero sheet, pause map.
   - iron: steel frame, chamfered corners, a rivet top and foot, blued plate: gameover card, death card (src/death-card.js takes `o.board`), erase question, sound test, hidden boss list.
2. TEXT TRIMS (42 strings): 22 settings tips (e.g. Way-on arrow 70 -> 38 chars), 5 store footers, 15 footers/lines (saves, bestiary, sound test, credits, practice, co-op pick, boss list, level-complete store hint, gameover, erase "NO UNDO"). No tutorial verb cut; death tell lines left (death-screen pins them).
3. OPTIONS ROW: title board is 6 rows: CONTINUE/NEW GAME, CHOOSE A SAVE, LOCAL CO-OP, PRACTICE, OPTIONS, CREDITS. OPTIONS opens SETTINGS / SOUND TEST / CONTROLS / BACK on the same board (titleOpts; ESC or BACK closes, board shape unchanged). Tools updated, same strictness: touch.mjs (no top-level three; sub-list tap boxes == items; back out before the save-slot step), soundtest.mjs (top level has OPTIONS and none of the three; sub-list has all), titlescene.mjs (+ options test), touch-shots.mjs, playtest.js title faces. uiscreens/save-slots address index 1 / CHOOSE A SAVE: unchanged.
4. tools/uiscreens.mjs: the map-card blurb assertion expected a PAGED blurb; claude/mapscale (Daniel 10-09) made blurbs one whole line, so it now asserts that line whole (a mapscale-introduced red, intent changed, not weakened).

## Checks (alone, PORT 8799, machine starved)
textfit (bestiary store tree pick trial erase opening press title mapcard death results card slots practice bossjump menu settings soundtest credits hud plates) --strict: 2929 screens, 50688 strings, all 0. titlescene, uiscreens, settings-tabs, store-ui, save-slots, soundtest, touch, death-screen, level-complete, hud-default, fonts, signs, hint-shown, modulepreload, dangling-paths: green. Flaky earlier: touch once failed "network off... cached shell", uiscreens once "dev server did not come up" (both infra under load; reruns green). NOT run: textfit-full, whole suite.

## QUESTIONS FOR DANIEL
1. ESC on the title top level still opens Settings (old behaviour); with the OPTIONS list up ESC closes the list. OK?
2. Sound test is on an iron plate, controls/practice on wood: say if you want a different split.
3. Pause/settings title still says PAUSED / SETTINGS <TAB> (header unchanged).
4. Death card (the 1.2s one) could not be photographed headless (death fade is black); gameover card and tests cover it.
