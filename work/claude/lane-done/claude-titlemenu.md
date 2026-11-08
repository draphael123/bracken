# claude/titlemenu - the six-row title (Daniel 11-08)

Branch claude/titlemenu from origin/claude/batch152 (merged with its latest: batch 152 What's New entry, diff3, lives2).

## What changed (src/main.js, one place: the title board)
- Top level is 6 rows: CONTINUE (NEW GAME on an unstarted save), CHOOSE A SAVE, PLAY TOGETHER >, MORE MODES >, OPTIONS >, EXTRAS >.
- PLAY TOGETHER = SAME SCREEN / ONLINE WITH A FRIEND (row ids LOCAL CO-OP / ONLINE CO-OP unchanged; the long labels remain if one is ever shown alone).
  MORE MODES = ARENA YARD / DUEL (BETA) / BOSS SELECT (+ BOSS RUSH, THE EDITOR only under ?modes, never in the demo, as before).
  EXTRAS = WHAT'S NEW / UNLOCKS / GIVE FEEDBACK / CREDITS. On touch GIVE FEEDBACK and CREDITS no longer sit under OPTIONS (EXTRAS holds them on every device).
- SWAP HERO is gone from the title (inn, store, pause menu keep it).
- titleOpts (bool) became titleSub (null | OPTIONS | PLAY TOGETHER | MORE MODES | EXTRAS). A submenu opens in place on the same board with a BACK row; ESC, X (attack alone) and BACK return to the top level on the group's own row. ENTER is attack AND confirm in this game, so it takes the row (the old OPTIONS list closed on Enter; fixed for all submenus). Mouse and touch go through the same TCH.hit rows (BACK is a row).
- A group with one row left shows that row directly (tested by logic; the demo still has 3 in MORE MODES, so it never collapses today).
- The 8 NOV date and new-dot show on EXTRAS (top level) and on WHAT'S NEW (inside it). A '>' marks the rows that open a submenu.
- The cursor remembers its row: BACK lands on the group's row; leaving WHAT'S NEW etc. returns to the open submenu on the same row (as before for OPTIONS).
- Wording: the loading tip and the store line that named the old rows now say PLAY TOGETHER / MORE MODES.
- Tool hooks: BK.ui.titleSelect(name) opens the right submenu and puts the cursor on any row id; BK.ui.titleSub; titleOpts still works.

## Tools updated
titlescene (6 rows + new groups block: ESC/X/BACK + real Enter), touch (6 rows, tap each group + BACK), whatsnew (EXTRAS date + dot), feedback-form, unlocks, bug-report, hero-account (SWAP HERO off the title), boss-select, arena-yard, tavern, save-safety, textfit (title scope: top rows + every submenu row), pvp-duel-flow (key path via MORE MODES), online-coop and itch-qa-coop (co-op rows under PLAY TOGETHER), new tools/titlemenu-shots.mjs. demo-cut unchanged but green (pinned DS.DEMO uses kept as separate statements).

## Checks passed (each run ALONE, one headless Chrome at a time)
titlescene, touch, whatsnew, feedback-form, uiscreens, boss-select, arena-yard entry, tavern join, save-safety, save-slots, loading-screen, textfit title+practice (0 issues), demo-cut, unlocks, bug-report, hero-account. After the merge with batch152: titlescene, whatsnew, textfit title, demo-cut, unlocks, bug-report, hero-account re-run green.
Two page CRASHES (boss-select, touch) on the first try were memory contention with other lanes; both passed on retry.

## Owed / not run
- tools/online-coop.mjs (two browsers at once) and itch-qa-coop.mjs (real internet), tools/pvp-duel-flow.mjs (long): edited and syntax-checked, NOT run. The same key path was verified live with real key events (Down x3, Enter opens MORE MODES, Enter/X/Esc/Z behave).
- tools/check.mjs not run (per the brief).

## Questions for Daniel (rec first)
1. The demo's MORE MODES still lists DUEL (BETA) (it did before). Rec: leave; hide it in the demo only if you say so (one word in TITLE_GROUPS).
2. ESC on the top level still opens OPTIONS (unchanged). Rec: keep.
