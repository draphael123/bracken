# BATCH100 INTEG (10-18) - final SHA 3fa97aa0 on origin/claude/batch100

READY TO DEPLOY (only pre-existing reds remain; reed-island was load-only).

## Fixed (cause, not test)
- blow-tags: main.js hurtEnemy wall line still had the benched Quartermaster's `if (e.t === 'quarter') e.flash...`; removed (the test, already updated by flotilla2, requires it wired nowhere).
- dangling-paths: work/claude/lane-done/hurricane2art.md cited a nonexistent tools/cast-poses.mjs (saying it did not exist); reworded.
- hint-shown: 10 Captain 2 teaching lines routed in src/hint-lines.js (KNOCKED FLAT x2, STRUCK, HE MAKES FOR A LINE, HE CALLS THE SEA, YOU HAVE HIS LINE, HIS WHISTLE, HE IS UP/SHAKES IT OFF: WARDED, TURNED: CUT HIM); 2 lines the benched Quartermaster left (HER GUARD IS BROKEN, HE IS DOWN: CUT HIM) deleted (the GUN-TO-BEAR line is still said by the Champion and stays); the Champion's get-up line shortened to fit one hint line (src/admirals-champion.js + hint-lines); two new silent flavour calls (CAUGHT auto-grab, HOLD ON on the line) removed (they never showed); hint-shown-silent.txt rewritten (--write, shrank).
- stuck: hu-covers-388 zone widened 385 -> 392. The hurricane wave shoves a held hero east out of the old zone ~9 s in, which restarts the stall clock (resolve returns null). Same behaviour a real player gets.
- relics: flotilla2 builds only 2 silvers, so the vault had no silver #2 to move; VAULT_SILVER.flotilla now `add: true` (the galley vault pays the third, same as moor).
- pixels: rigging-run sign 283 -> 282 (it stood through the ground, 8px).
- whatsnew: tool re-pointed for the approved new batch-100 entry (newest 18 OCT, pinned line "The Flotilla rebuilt").

## Pre-existing (report only, unchanged)
berserker, dune-worm, bells, rule-openings, small-adds (pirate 2/5 abbot). visible-supports-strict report-only.

## Flake
reed-island passed alone (load).

## Mover fix (landing on a rising platform) - no mover-related red appeared.

## Green alone after fixes
blow-tags, dangling-paths, hint-shown, relics, stuck (static+runtime, 253 spots), whatsnew, signs, collectables, headless floats (pixels), admirals-champion, storm-ship-runtime.
