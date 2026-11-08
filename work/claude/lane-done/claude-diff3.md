# claude/diff3 - HARD mode, clearer mode lines, lower difficulty mid-save (Daniel 11-08, demo day)
Branch claude/diff3 off origin/claude/lives2 (24b40af1f). NOT merged, NOT deployed. Worktree bracken-lanes\bracken-diff3.

## MODES (exact numbers; a tuning lane reads these) - src/difficulty.js
| field | VERY EASY (story) | EASY | NORMAL | HARD | MASTER |
|---|---|---|---|---|---|
| col | #8fd160 | #c7d265 | #ffd36b | #ff9f6b | #ff6b6b |
| take | 0.5 | 0.75 | 1 | 1.18 | 1.35 |
| stagger | 1.35 | 1.18 | 1 | 0.9 | 0.8 |
| poise | 1 | 1 | 1 | 0.88 | 0.75 |
| flinch | true | true | true | true | false |
| parry | 1.4 | 1.2 | 1 | 0.9 | 0.8 |
| open | 1.35 | 1.18 | 1 | 0.9 | 0.8 |
| gap | 1 | 1 | 1 | 1.08 | 1.15 |
| flaskAdd | +1 | +1 | 0 | -1 | -1 |
| shrine | all | one | one | one | none |
| death | 0 | 0.5 | 1 | 1.25 | 1.5 |
| punish | false | false | false | false | true |
| phase | 0 | 0 | 0 | 0.05 | 0.1 |
| stale | null | null | null | [1,0.83,0.68,0.53] | [1,0.8,0.65,0.5] |
| affix | 0.5 | 0.75 | 1 | 1.25 | 1.5 |
| LIVES (ON) | 10 | 5 | 3 | 2 | 1 |
| coin lives (+1/100) | yes | yes | yes | yes | NO |
HARD is halfway Normal<->Master on every number; booleans (flinch, punish) stay Normal's, shrine stays 'one'. flaskAdd -0.5 rounds AWAY from Normal (-1), as EASY's +0.5 did (+1). Page run: hit 10/15/20/24/28, flask max 2/2/1/1/1 (Normal is already at FLASK_MIN=1 on that kit, so HARD's -1 is invisible there; it bites heroes with a base of 2+), shrine 2/1/1/1/0, told opening 243/213/181/162/144 frames.

## Changed
- difficulty.js: HARD row; MODE_IDS story,easy,normal,hard,master; `?difficulty=hard` is now HARD (it used to alias MASTER; master still works); canSwitch is now down-only (never up, never into Master except at creation).
- lives.js: LIVES_BY_MODE hard 2; coin lives stay on for HARD; `modeBlurb(id)` builds each card line FROM the MODES numbers (MODE_BLURB now derived): e.g. EASY "FOES HIT 25% LESS, +1 FLASK, SHRINE REFILLS ONE FLASK", MASTER "FOES HIT 35% MORE, -1 FLASK, SHRINES REFILL NONE, BOSSES PUNISH GREED". The lives count/rule is on the LIVES row's own line above (ON: 2 LIVES ...). `lowerTarget`, `lowerMode`, `lowestMode`.
- main.js: HARD open from the start on the card (stepMode: ... NORMAL, HARD, MASTER; MASTER still gated); a clear on HARD also unlocks MASTER (was Normal only - rec: keep); pause menu row SAVE MODE (value = current mode, tip says press to lower one step, never up; shows in the inn too). Press asks "LOWER TO NORMAL? THIS CANNOT BE UNDONE. PRESS AGAIN"; a second press does it (same confirm pattern as Erase / Restart), then "NOW NORMAL. 3 LIVES FROM THE NEXT LEVEL" when lives are ON. Mode applies to foes/flasks/shrines at once; the lives count of the level under way is untouched and the next level entry takes the new mode's count (verified in page: HARD 2 -> lowered -> 2 now, 3 on re-entry). Row hidden in Boss Rush, Boss Select, Arena Yard, duel pit, trials, shops (lowerOk). VERY EASY: "VERY EASY IS THE LOWEST MODE".
- Records/medals: nothing keyed off PROG.mode before (medals are time-based per level). Now PROG.mode is always the lowest the save was played on (it only goes down); PROG.modeStart / modeLowered keep where it began and how many steps; each level record gets `mode` = lowest mode it was won on (stamped at level win). The slot card tag shows the save's (lowest) mode. Medal times are not rescaled by mode (as before).
- ui-hud.js PAUSE_ROWS: 'Save mode' after 'Unlocks'. BK.ui hooks: lowerAsk, lowerOk, menuItem, menuMsg.
- Tools: lives.mjs (HARD, blurbs, lower steps, canSwitch, greps), difficulty.mjs (hard in page run + halfway checks), demo-cut.mjs (HARD pickable in the demo, counts 10/5/3/2/1), textfit.mjs (pick: 5 modes x2 rows; menu: lower-confirm frames per mode x lives).

## Stills (scratch\lane-reports\diff3-stills\, 3x) - LOOKED AT card-hard-on, card-master-off, pause-lower-confirm
card-{story,easy,normal,hard,master}-{on,off}.png, pause-save-mode-row.png, pause-lower-confirm-hard-to-normal.png, pause-lowered-to-normal-lives-on.png, pause-lowest-message.png. Card lines wrap to two lines inside the plate; confirm text reads in the footer strip.

## Checks passed
node tools/lives.mjs GREEN; tools/demo-cut.mjs green; tools/difficulty.mjs page run matched (one wrong assertion of mine fixed after; the fixed canSwitch line re-checked in node, full page run not repeated); textfit pick,menu --strict: 86 screens, 0 issues (log scratch\diff3-textfit.log).

## Coordinator should re-run
tools/difficulty.mjs (full), textfit slots + hud (slot-card tag, HUD lives x2), bug-report / feedback-form / secrets / unlocks / ui-hud / tavern-menu (they index PAUSE_ROWS; a row was inserted), demo-save-carry, save-slots, save-safety, settings-tabs. Any tool passing `--difficulty hard` meant MASTER before.

## Questions (rec first)
1. HARD flaskAdd -1 (same as MASTER) vs 0: rec keep -1 (matches EASY's rounding); tuning lane may revisit.
2. HARD clear unlocks MASTER: rec keep.
3. Lowering confirm is the press-again pattern, not a modal: rec keep for demo day.
