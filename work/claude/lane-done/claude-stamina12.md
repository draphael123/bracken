# claude/stamina12 - stamina back to ~x1.2 + a weightier Rootway (Daniel 10-08)

Base claude/underleafroad c53ece88. Port 8746 was not needed (every tool here opens its own browser). Commits on origin/claude/stamina12.

## 1. Stamina x1.4 -> x1.2
- src/commit.js STAM.regen 105 -> 90 (75 x 1.2), comment updated; src/survival.js STAM_REGEN_MUL 1.4 -> 1.2 (comment).
- tools/survival.mjs: the two pins follow (`STAM.regen == round(75 * STAM_REGEN_MUL)` now 90; the measured refill rate >= 75 x MUL x 0.97 now ~20%). SAME STRICTNESS (still an exact pin and a measured-rate floor, only the multiplier changed). tools/survival.mjs green.

## 2. THE ROOTWAY
Measured with tools/mash-bot.mjs --level rootway (with machines) at x1.2, BEFORE any layout change: knight dead (1 death), pyro dead (2), WARDEN cleared 0 deaths / 44% lowest (>= 40% = a clear). So x1.2 alone fixed knight + pyro, warden still carried.
Change (foes at platforming moments, the exam shape of the v2 brief; the act-I teach screens 0-96 untouched/threat-free as they were):
- ELITES.rootway (src/level.js), two shield captains made from foes already in the level:
  1. THE GREAT ROOTS' EXAM: shield captain at 184,34 (gate 190, WARDING) holding the landing of the dropped span, the trophy-hunter swapped to 188 behind him, scout on the step; checkpoint 193 after.
  2. THE HOIST YARD'S EXAM: shield captain at 276,18 (SHIELDED, no gate - every gate column I tried could be walked round via the upper boughs/vine, tools/elites.mjs said so), in front of the sapper/hunter/scout squad; checkpoint 290 after.
- src/rootway.js: the two shields moved (188->184, 279->276), hunter 184->188. src/elite-kit.js AFFIX_AT: 'rootway|shield#1' WARDING, '#2' SHIELDED.
- tools/elites.mjs: 'rootway' removed from PENDING (it now has a gated elite and is checked in full: green). 
After: mash LEVEL knight 2 deaths, warden 2 deaths, pyro 1 death (all three lose). Mash BOSS unchanged in kind: all 6 fights dead (boss left 88-95%).
Level-1 pilot (fresh knight): 24 hits, 0 deaths, 100% walked (was 11 hits / 0 deaths) - still finishable. Curve row: 25 hits, 0 deaths, act-I band ok (level-quality: "ok curve ... band 40-250%").
Re-stamped (level first, then boss): docs/mash-bot.json rootway, docs/level1-pilot.json rootway, docs/level1-curve.json rootway.

## 3. Gates, run alone
- mash-gate: green (42 campaign levels hold). curve-gate: green (4 report-only unchanged: longwater, reef, keep, undercrown; stale-row notes for spore/kings/storm/... are the other lanes' hashes, not mine). tools/rootway.mjs all green. tools/elites.mjs: only ksar fails, and it fails identically on the base (not mine).
- tools/level-quality.mjs: one red, `canal` pilot stale ("the level changed since its pilot ran") - on the base too, not mine; rootway passes everything.
- Every level's mash LEVEL row re-measured at x1.2 (no --write, other levels' rows NOT re-stamped; raw table: scratch of the lane). Verdict (clear = 0 deaths and lowest hp >= 40%):
  - Only change that matters: **REDGORGE got EASIER for the masher**: warden and pyro now CLEAR (lowest 46%, 0 deaths; cached row: all three dead). Deterministic (re-run twice; and with the old regen it dies as cached) - the lower regen changes the bot's path (1 ride instead of 6-8, 12 boarding lifts) so it walks past what used to kill it. The mash-gate is green only because it reads the stale cache; a re-stamp would turn it red. NOT touched (other lane's level). NEEDS a redgorge layout/foe fix.
  - Got harder as expected / no verdict change: longwater (old pyro 42%/0 deaths cleared-ish edge -> all three dead now), glasssea, skyroad, keep, storm, witchlight, theatre, ksar (min hp 0 now, deaths >=1). Every other level: dead before and after (death counts shift +-, e.g. hurricane 57 deaths, burning pyro 22 -> 3: noise, all still lose).

## QUESTIONS FOR DANIEL
1. Rootway elite 2 has no gate (a gate there is walkable-round per tools/elites.mjs). Built: ungated captain; alternative: reshape the yard's boughs so a gate holds.
2. Redgorge: masher now clears with warden/pyro at x1.2 (see above). Recommend a foe/elite lane on redgorge before the next re-stamp.
