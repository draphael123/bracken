# RELEASE150 (11-07, ended ~20:15) - report

STATE AT THE END: batch150 is LIVE (the coordinator deployed master 6743648c2 at 19:50, log scratch\deploy-batch150.log, status ok, aliased bracken-nine.vercel.app).
I did NOT run --deploy: by the time my alone re-runs finished, master already held my tool-fix commits plus the TEXTFIX150 lane's. My one remaining commit is a TOOL-ONLY change (c900b9f38, pushed to origin/claude/batch150, not on master): safe to ff into master with BATCH151, no deploy needed for it.

## Reds -> cause -> fix -> alone result
| tool | cause | fix | alone result |
|---|---|---|---|
| levelling-runtime | test fresh() left save XP (heroroster2 x2 catch-up) | f06e521d8 (fix150, merged into batch150 as 4edf63468; a duplicate uncommitted edit of mine dropped) | NOT re-run: ~10 min, the chain was stopped (see below). Code-reading only. OWED |
| small-adds | bot-pilot statistic moved the seeded stream (Mother/geomancer 4 of 6) | tools: salt 4 -> 5 (4f59c8758, the documented practice in that file) | GREEN: 25 rows, 7 of 139 swings missed (5%), worst row 25% (limit 33%) |
| touch | STALE assert: menuback made the store BACK button the first tap box (sw 1 -> 2) | 4f59c8758 | GREEN (full run, after one pwa-live flake: shell cache check failed once in the first run, passed alone and in the 2nd full run) |
| level-reach | STALE: claude/unlocks builds every lock tip from src/unlocks.js: votive tip now 'LOCKED: LIGHT ALL 3 VOTIVE LAMPS IN WAYMEET' + '0/3 VOTIVE LAMPS...'; Gorm tip now 'BEAT KING GORM WITHOUT DYING' (was FALLING) | 4f59c8758 (votive) + 3a0d8aed6 (gorm) - both Daniel-approved UNLOCKS-screen wording | GREEN |
| church-road | STALE: asserted the old source string "LIGHT WAYMEET'S VOTIVE LAMPS" in main.js | 3a0d8aed6: now asserts the unlocks.js 'LIGHT ALL ' phrase + the spurTip wiring | GREEN (41 checks) |
| feedback-form | the gate failure was a stray untracked FILE named num-display at the worktree root (mkdir EEXIST; moved out of the way). Alone it then failed 2 of 3 runs on the fake-pad section: pad held 90 ms wall clock, a slow frame swallowed the press | 3a0d8aed6: pad held for 4 animation FRAMES not 90 ms (no assert weakened) | GREEN 3 runs in a row |
| no-hidden-hits | renderer killed at ~3 GB: ONE evaluate held all 73 levels. SAME on master a18ce8c7e (223 s) and in gate148 / rel148, so not a batch150 regression | c900b9f38: levels run in chunks of 8 on a fresh page each (--chunk=N) | GREEN, 422 s (was 270 s: check-timings.json says 269 s, update it or give it a bigger alone cap) |
| flasks2 | page crash, flaky ~50% on master too | none | GREEN on the first retry (135 s) |
| zipline | page killed mid-run, also on master (222 s) | none (tool already reloads per hero) | NOT green: 3 attempts killed (124 s, 21 s, then I stopped the chain) |
| pixels (headless.mjs floats) | page crash | none | NOT re-run |
| textfit | REAL in the gate log: TRUNCATED 1 ("WIPE YOUR BOOTS... WITH YOU") + COLLIDE 19 (skill slot F under the pause menu rows). Both were fixed by TEXTFIX150 ad322b591 (on master now) | not mine | NOT re-run after that fix (7 min). OWED |
| ability-poses, profile-leaks | known flakes | - | noted only |

## THE ROOT CAUSE OF THE "PAGE CRASHED" REDS (read this, coordinator)
They are mostly NOT Chrome crashes. scratch\memguard.log shows memguard KILLING the headless Chrome: 'KILL headless pid .. at 3048 MB (over cap)' for the heavy tools, and 'KILL .. at 1700-2200 MB (free 530-890 MB under floor)' whenever another lane's browser spikes (free RAM swung 700 MB <-> 8 GB while CHIEF540 / FIRST5 / WARDENULT2 were running). Master crashes the same way (flasks2 1 of 2, no-hidden-hits 1 of 1, zipline 1 of 1 on a18ce8c7e). Retrying only works when the PC is quiet; the real levers are (a) run heavy tools when 2 lanes at most have browsers, (b) cut the tool's peak (what c900b9f38 does for no-hidden-hits), (c) a memguard cap of ~3500 MB for the five heavy tools (Chrome is ~3 GB there now: peak biggest-process 3.0-3.2 GB in rel148 and batch150 logs). I did not touch memguard.
Also: QUICK gates skip the >120 s tools, and nightly1105 never ran (waiting for 6 GB free), so zipline / no-hidden-hits / pixels were unchecked on master for several batches.

## Deploy / live
Coordinator deploy 19:50, master = origin/claude/batch150 = 6743648c2 at that time. verify curl of the changed files was the script's job (deploy log: READY, aliased bracken-nine.vercel.app). I did not re-verify live file hashes.

## Itch zip (built by me, from master 6743648c2, node tools/build-itch.mjs --out scratch\dist-itch-150)
C:\Users\Daniel Raphael\.claude\bracken-lanes\scratch\dist-itch-150\thornroad-demo-6743648c.zip - 57.6 MB, 924 files (itch limit 1000), boot 12.7 MB, 38 music tracks, index.html at the root. node tools/itch-build-check.mjs: ok (zip CRCs good, no ad-block word, repo untouched). No browser run of the zip (itch-embed-page / itch-qa-load still OWED, one Chrome, >= 1500 MB). Note: BATCH151 changes the build (frog/troll/chief), so rebuild after its deploy before uploading to itch.

## Cleanup
Removed (clean + merged into master): bracken-demoend2, demohide, fastload, fix150, gormburn, heroroster, hpdisplay, lives, menuback, polish150, sporeclear, starterskill, stockfloat, transchoice, tutorial2, unlocks; also removed my own bisect worktree bracken-bis150. C: free 47 -> 67 GB (df -h /c, 81% -> 73% used).
Kept: batch146 (untracked claude-tune146.md report), first5 (running, 7 untracked), wardenult-master (detached, maybe in use), palboss/pfart/scree3 (dirty), batch150 (c900b9f38 not on master), and every protected one (batch151, palrework, gq2, highcrown3, causeway3w, cw3art, kraken3, chief4) plus all unmerged lanes.
Processes: stopped my own chain script and its zipline node (PIDs 16648, 33152, 20864, 27196). Other lanes' Chrome left alone.

## For Daniel / coordinator
1. Owed browser re-runs on the live build when quiet: levelling-runtime, textfit (after ad322b591), zipline, pixels floats, ability-poses.
2. Rec: ff master to claude/batch150 c900b9f38 with the next release (tool-only), and raise ALONE_CAP / check-timings for no-hidden-hits (~430 s).
3. Rec: raise memguard cap to ~3500 MB for heavy checks, or run heavy ones only with <= 2 other browsers.
4. check.mjs prints a failing tool's text only at the very end of a 2 h run; print the last 20 lines inline (5-line change).
5. A stray file 'num-display' (30 KB, root of bracken-batch150, 13:26, a tool's output redirect) broke feedback-form (mkdir EEXIST); now in %TEMP%\num-display.stray. Whichever lane wrote it should write under work/.
