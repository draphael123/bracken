# MERGEWAVE1 (sonnet, code-only) - branch claude/batch156, worktree wt-batch156
Tip ab8a9d8cd (pushed origin/claude/batch156). NOT merged to master, NOT deployed, no gate started.
BASE: claude/hcship tip 95acc52b0 (gqmusic: lane report; contains the expected 8ce638b16 + 492ae374c). airship (d6766686f, level renamed THE DUSKWING) was ALREADY in hcship, flags still OFF.

## Merges (in order, all --no-ff)
1. wnseed 3c1384cca -> acd5e9d54. Conflicts: docs/updates.json (batch 143 lines: master's reworded plain text kept, wnseed's tags applied: wood / hornetsnest / []), src/main.js title menu (kept UNLOCKS row + wnseed's wnTab/wnFilter reset), tools/textfit.mjs (identical logic both sides, took master's). ALSO tagged the 50 untagged lines of batches 145-155 ({s, lv}: crown / scree / marsh / warcairn / kings / moor / minecart / tavern / lesson / duel_pit ..., general = []), because tools/whatsnew.mjs data check demands tags on every batch >= 143. Guess-tagged by eye: please skim.
2. tavshop f111549ad -> fd077e696. Conflicts: src/main.js inn api (kept openUnlocks/openBook/guestbook + added openStore), src/tavern.js (stations: kept guestbook, CO-OP RULES, UNLOCKS board AND the new store@31; art list + use handler both kept).
3. coopvert c685a492e (already contains coopai 21930666a + cooppr 2291a1723; merged as one) -> a3b8f009d. Conflicts: index.html (both modulepreload pairs kept), src/touch.js (kept master's Math.round(gm.S*100) key + 'pg' ping flag), src/main.js hurtEnemy (kept pvpSeat duel hook + XPS.hitRecord) and the update loop (kept duelPass/DUELO + PINGS.tick).
4. botbuilt bac7dc539 -> b00338ed2. Conflicts: src/lab-perceive.js (adjacent to master's Gorm/warden early-return; kept both), tools/boss-run.mjs (took master's gq/gph/hb row fields; botbuilt's gaps clause survives).
5. scree3 b2174012e (includes scree3art + scree3tune) -> 42a64b498. Conflicts: main.js DMG table (+ramBoulder 24), Ram desc (scree3 text, numbers changed to FOUR), wave draw (+ w.ram drawRamWave before the frog/quarry clauses), marks.js (+ ram|boulderTell), src/ram-lord.js.
   !! JUDGEMENT CALL: scree3 tuned Ram Lord to hp 7200 / x6 (67% with flasks, WITH CRACK + boulder), master live (ramlord152, 11-08) is hp 5000 / x4. I kept MASTER's numbers: hp 5000, RAM.open = {impact 300, t 3.4, mul 4, cap .25}, stunT 3.4, stun/crash x4, and scree3's mechanics (one opening profile, CRACK 300, boulder butt, art). tools/ram-lord.mjs pins updated to 3.4 / x4. The boulder + CRACK make the fight harder than the 67% master measured: RETUNE OWED n=6 with flasks.
6. airship: nothing to merge (already in hcship). The "lint" that was owed = the skipped node lints; ran them (below). Two stale/needed pins fixed: tools/airship.mjs line 146 pinned `ASH.take(e, dmg)` but main.js calls `ASH.take(e, dmg, tag)` (red on hcship too, now prefix match, 94 ok); tools/checkpoint-stand.mjs got MODEL_GAPS scree [592,7] (see below).

## Node results (no browser by design)
GREEN: node --check main.js etc; wn-add data check + whatsnew.mjs data part (49 deploys, all tagged); tavern.mjs pure + tavern-menu; build-gap-check (9 heroes, 47 skills); xp-share; ai-route (5 levels); ping; coop-unlock; coop-progress; modulepreload (779 listed, 0 missing); ram-lord.mjs NODE part (all ok); goblin-lint; signs (1180); tells (1152 rows); music-levelstart; floating-geometry scree; visible-supports scree (0); level-quality scree (all ok incl. pilot walked 100%, curve 6 deaths, mash held); airship.mjs 94 ok; answer-tags, one-new-foe, platforming-lint, checkpoint-gaps, threat-holes, foe-glue, floaters, comments all exit 0 (logs: scratch/lane-reports/mergewave1-*.log); checkpoint-stand ok after the scree entry.
MISTAKE TO NOTE: I ran tools/whatsnew.mjs and tools/coop-flasks.mjs before noticing they open headless Chrome after the node part. whatsnew crashed on launch; coop-flasks ran one short page (GREEN) and exited. No processes of mine remain (checked), free RAM was 4.6 GB. Not repeated.
NOT RUN: check.mjs, textfit, any page tool, the re-pin tools.

## Browser proofs OWED before gate154
- wnseed: tools/whatsnew.mjs, textfit whatsnew --strict (tab 2 on the guess-tagged data), phone/pad pass. release.sh line 29 one-line change still owed (replace whatsnew-guard.mjs call with `node "$WT/tools/wn-add.mjs" check "$num"`); the batch 156 entry must be tagged {s,lv}.
- tavshop: tools/tavshop.mjs (desktop + touch), tavern.mjs stations/party (the store@31 sits 4 cols from the Unlocks board@27: check the hint/prompt overlap).
- co-op: tools/coop-vert.mjs, ai-companion, coop-proof, online-coop (rec in coopvert report: merged chain, run online-coop in the gate), coop-flasks done once green.
- botbuilt: boss-rates built column spot run (n small) to confirm the ult hand + BUILD-GAP output.
- scree3: ram-lord.mjs page part, ram-bank, ram-pilot, boss-fight-end; Ram Lord win-rate n=6 WITH flasks (target 60-70%); level-quality scree already green on nodes; restamp not needed (docs came with the branch and level-quality scree passes); textfit bestiary,hints --strict alone; a by-eye walk of the scree gorge (checkpoint 592,7 model gap).
- airship: still flag-off; the airship art/browser/tune list in lane-reports/airship.md stands.

## Questions for Daniel (recs built)
1. Ram Lord numbers after scree3: rec = master's hp 5000 / x4 (built) then n=6 retune; alt = scree3's 7200 / x6 (its measured 67%).
2. Guess-tagged What's New lines (batches 145-155): rec keep, skim the Levels tab once.
3. Store sign at x31 vs Unlocks board at x27: rec keep, look at it in the inn.
