# SUITE2 11-11 - brittle rewrites, boss-music, timings updater, release stamp (tools/scripts only; branch claude/suite2 off claude/suite1 2f9a80b42; not merged/pushed; no browser, no suite run, no src/ change)
Commits (tip = see final line of the lane message / `git -C bracken-suite2 log -1`): b978e0f3b boss-music+updater; then leveling/gear-tiers; foe-glue/level-quality; drowned-knights/commitment; riposte/geomancer + this report.

## 2. boss-music (SA4)
- WHY 120 s: tools/boss-music.mjs runs the real synth scheduler against a mock AudioContext whose clock was 12x real time and WAITS REAL TIME for 2 loops of each of 16 tracks (sum ~ 1.4 h of music / 12). The scheduler ticks every 100 ms and catches up lag (audio.js schedule(): while nextT < now+0.25), so the speed changes nothing it asserts. Speed 12 -> 300: 120 s -> 19.7 s, same asserts, same output line (osc/s, seconds identical). Verified by running both (exit 0).
- Now in the DEPLOY tier (check-tiers.json) at 19.7 s; timings map 120400 -> 19700. Deploy --dry 232 checks, 15.0 min; nightly 232.2 min (was 233.9).
- tools/check-timings-from-log.mjs rewritten: accepts PARTIAL logs (a tier/shard/--also run) - updates only the checks in the log and keeps every other committed clock (old tool threw 'log missed ...'); `--strict` restores that; FAIL lines keep the old clock; a check NEW to the map (it was implicitly deploy via 'absent from timings') is written into check-tiers.json "deploy" so it does not silently drop out (`--new-nightly` opts out); `--dry`; reports tier names with no timing. Verified on synthetic logs (file format round-trips byte-identical when nothing is added); real timings/tiers files restored after the test.

## 3. release.sh build stamp
src/build.js ships `sha: ''` and is meant to be stamped by the release (sed this one line; src/whatsnew.js versionLine + tools/ship-fixes.mjs read it). The script never did. Backup scratch/release-pre-suite2.sh. In `--deploy`, after the push and before `vercel deploy`: sed the short sha of master into src/build.js, abort if the sed did not take, `trap ... EXIT` + an explicit `git checkout -- src/build.js` after the deploy so master stays '' and the next ff-merge is clean. The post-deploy verify only diffs committed files, so it is unaffected. bash -n clean; the sed verified on a copy. Not run.

## 1. Brittle rewrites (Daniel 11-11 10:48 = priority-1016.md line 605; exact numbers kept only with a cited '!!' line)
VERIFIED BY RUNNING (node): leveling, levelling, foe-glue, level-quality all pass after the change.
- leveling: xpFloor points at L10/24/32/50 -> 40-100% band vs the old curve (monotone + never above old stays); CARD_CAP 25 -> 10..30 (line 221 Q3); RESPEC_SILVER 3 -> 1..10; 18 hero perks -> unique + even + >=16; levelsToPerk derived from MILESTONES; soft-cap table -> non-increasing, >0, pay = round(base x mul); bankStake -> non-decreasing, <= bank, capped. KEPT exact: slotsAt (1 default, 2nd at L30, max 2 = line 236), LV_MAX 50, MILESTONES/TECH_LEVELS (structure).
- levelling: XP_CATCHUP read, not 3 (2..5); gate-chain depth wood=0 and others deeper (was hornetsnest 1, marsh 2). KEPT: refund 360/150 (exact save-migration of a fixture, a compat invariant).
- foe-glue: purse caps, AFFIX_ACT, ACTS_LATE dmg/hp tables -> monotone/climbing invariants; a level with NO foe-pass levers WARNs, only a PARTIAL set fails (the 4 new night levels need no OFF entry now).
- level-quality: mashGate(lv, {staleOk}) - a stale mash row and a stale pilot row now WARN, never fail (missing rows still fail; tools/mash-gate.mjs still fails on stale). curve-gate/curve-shape already only print.
READ + SYNTAX-CHECKED, NEEDS A BROWSER RUN (see below): 
- gear-tiers: static head verified in node (derived from GEAR_TIERS: ascending, gearTier = #thresholds<=level, monotone, hidden=0); the page half now uses ${TOP}/${LV_1}/${LV_TOP} instead of 4 / 50 / 10 / 9.
- drowned-knights: frame counts 7/10 -> >=; cuts -> 2..10 (the audit's rule), no trait arithmetic.
- commitment: the per-verb recovery table REC is READ from src/commit.js (checked identical to the old hand table for all 8 heroes); the invariants stay (nothing acts before commit-0.06 s, acts by the window +-1 f); per-hero light totals -> 0.15-1.0 s range.
- riposte: 'one riposte does not break guard' dropped; asserts the guard breaks within the two ripostes the page delivers (and the break is counted).
- geomancer: only cited the cap-3 assert to line 220; nothing else changed.

## BROWSER OWED (one at a time, >=1500 MB free, memguard first)
node tools/gear-tiers.mjs ; node tools/drowned-knights.mjs ; node tools/commitment.mjs --only=knight,warden (then full) ; node tools/riposte.mjs elite ; node tools/geomancer.mjs
(each should be green; if one is red it is my edit - revert that hunk, the old assert was the green one.)

## NOT DONE (listed for the next lane)
boss-openings (61 numeric asserts: the `alone === 0` ones are the invariant 'opening is caused' and should stay; the open-duration / hint-count / forgemaster 2.5 s ones are the brittle part; needs a browser to verify), geomancer (54: FAULT LINE reach/lift numbers, ward wind costs, shardCost<0.7x), ranger/admiral/underleaf/combat-replay/skill-icons/skill-menu/walk-controls, knight-rework, normal-health, dances, damage-pct, foe-tempo, hero-roster. commitment: ROLL_COST / MASH_MAX / WHIFF tables still literal (decision numbers, not '!!'). Also owed from suite1: weekly.sh, first timed nightly -> refresh timings (`node tools/check-timings-from-log.mjs <log>` now works on partial logs).

## Questions for Daniel (built the recommendation; nothing blocked)
Q1. A MISSING mash/pilot row on a gated level still fails level-quality; a stale one only warns. REC keep (a missing row is a coverage hole, a stale one is a re-measure chore). Alternative: warn on missing too.
Q2. boss-music joins the DEPLOY tier (20 s, wiring of every boss theme). REC yes.
Q3. tools/mash-gate.mjs (deploy tier) still FAILS on a stale mash row, so a level-data edit still reds it. REC apply the same staleOk there and move the re-measure to the nightly lane.
