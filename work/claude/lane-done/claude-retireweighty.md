# RETIREWEIGHTY (claude/retireweighty, Sonnet) - 2026-10-02

Daniel: Combat3 put classic COMBAT.commonDamage at 1.6, above Weighty's 1.4, so classic IS the weighty mode. Weighty is retired.

## What changed
- Deleted src/weighty.js and tools/weighty.mjs. Removed 'weighty' from tools/check.mjs (list + comment).
- src/main.js: every branch keyed on weighty()/weightyHere() now takes the classic side; removed the import, the ?combat= switch,
  the Settings > Combat row, its hint (SETTING_TIPS), its value cell, the BK.combat/setCombat/recovery test hooks, and the
  weighty-only code: wPoise, shieldParry, qHp/qWeigh/qMarkHeld/qRear, the blade-commit recovery (P.atkRec, bladeHeld), the queen
  feint/feintOff modes, the brute feint, the pike lunge, the archer back-off, the shield counter/counterTell, the draw-frame cases.
- Save migration: readSettings now does `delete SET.combat` after loading, so an old save with combat:'weighty' loads clean into
  classic and the field is not written back. tools/settings-tabs.mjs now loads a save with combat:'weighty', asserts it is dropped,
  asserts the Combat row is gone, and keeps the "a Gameplay toggle flips" test on Hit stop.
- src/settings-ui.js: Combat dropped from the gameplay tab and LEGACY_ROWS. src/marks.js: the shield|counterTell rows removed.
- tools/firsthour-pilot.mjs and tools/untold-told.mjs lose their combat=weighty options. docs/PLAYTEST.md loses the Weighty section.
- tools/dangling-paths.mjs: MISSING entries for tools/weighty.mjs and src/weighty.js (old lane reports ssproto/combat3 still cite them as history).
- src/hint-lines.js had no Weighty text (the mode used number() marks and a SETTING_TIPS row only); hint-shown needs no --write change.

## Checks
green: settings-tabs, textfit (menu,hud,soundtest --strict), juice, foe-tempo (one earlier run showed brute|wind 0.52->0.67 s on a random
wind/raise sample; rerun alone is green, 54 tightened windups), architecture, dangling-paths, tells, hint-shown (no new silent lines).
attack-tokens: red, the known pre-existing "only 3 red !! blows" failure (separate lane); also flaked once on "fresh lab page did not initialize" under load.
UNVERIFIED: the full suite (not run, per lane rules).

## FOR THE COORDINATOR
Add `weighty` to scratch/release.sh DELETED_CHECKS: DELETED_CHECKS="tide-reaver queen-pillars weighty"
