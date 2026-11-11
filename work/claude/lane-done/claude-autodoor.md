# AUTODOOR (11-08)
touch.mjs assists-toggles "Auto-interact ON did not use the door" was a stale-position assert, not a game bug. Master 923e8ad42 fails it too when thumb-friendly runs first (TOUCH_ONLY=thumb-friendly,assists-toggles); assists-toggles alone passes.
Cause: thumb-friendly's DEFEND-lift dodge leaves the hero at x~84 on the Wood, 4 px from the sign at tile 5; talkers() then answers verb READ (not in AUTO_VERBS) before the test doorway's ENTER. Game code untouched; small152/ramlord152 not involved.
Fix: tools/touch.mjs puts the hero at x=184 (clear of the signs at tiles 5 and 18) before pushing the test doorway.
Checks: pair green; full touch: every section green except pwa-live crash (Inspector.targetCrashed, known memory flake); pwa-files+pwa-live alone green.
