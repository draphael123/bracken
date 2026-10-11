# claude/whatsnew - WHAT'S NEW on the title menu

- Title board row "WHAT'S NEW <date of newest entry>" (e.g. 11 OCT), above OPTIONS. A blinking dot until opened; the seen-date is
  localStorage `bracken.whatsnewSeen` (try/catch everywhere). No blink under reduce-motion.
- Opens a scrolling list (state `whatsnew`): newest first, date heads in green, wrapped player lines. UP/DOWN scroll, Z pages down
  (and closes at the end), ESC/X back, tap = Z (touch TAP_ANY), BACK pill from the default touch pills.
- Data: docs/updates.json (batches 81-85 backfilled). Loaded at boot by src/whatsnew.js (new module, in modulepreload).
- tools/whatsnew.mjs (new, in check list) + textfit scope `whatsnew` (3 frames, in the check's textfit scope list).
- scratch/release.sh --deploy: refuses unless origin/claude/<batch> docs/updates.json has an entry for that batch number
  (date, 3-6 lines), via new scratch/whatsnew-guard.mjs. scratch/ is not in the repo: edited in place.
- The coordinator adds the entry at merge time: {"date":"YYYY-MM-DD","batch":N,"lines":[...]} at the TOP of the array.
