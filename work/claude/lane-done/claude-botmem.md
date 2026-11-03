# BOTMEM (lane B, claude/botmem off claude/botstats 260aa911) - 11-03
Worktree bracken-botmem. Tools + a NEW scratch\memguard2.ps1 only. src/ and docs/*.json untouched. Not merged. cdp.mjs defaults are identical (lite is opt-in).

## Changes
- tools/page-recycle.mjs (new): recycler() = a fresh page (fresh browser context) when the next call would pass K=6 BK.loads (BRACKEN_RECYCLE_EVERY=N, 0 = never); run(fn, nLoads) reruns ONE call whose page died to the machine, row labelled infraRetry; a second death throws 'INFRA-KILLED: ...' (e.infraKilled). BRACKEN_LITE=1 opens pages with lite flags.
- tools/infra-kill.mjs (new): reads scratch\memguard-kills.jsonl (BRACKEN_KILLLOG overrides); INFRA_RE; infraWhy() for the check parent. Timeouts and assertions are never infra.
- tools/cdp.mjs: export LITE_ARGS; openPage({lite:true}) adds them (ignored for a borrowed browser); page gets .dead, .infra, .killedByGuard(). Nothing else changes.
- mash-bot.mjs, level1-pilot.mjs, level-walk.mjs: use the recycler (mash: 1 load per call; pilot: `runs` loads per id; walk: 1 per config per slot). `--lite` flag on all three. INFRA-KILLED is printed, listed at the end, and NOT written as a row/red (walk rows get err 'INFRA-KILLED..' + infraKilled:true). Pilot is seeded so a rerun row equals an undisturbed one.
- check.mjs (serial) and check-pool.mjs (pooled): a failing check whose output shows the page died (page CRASHED / connection closed / could not reach browser, with or without a logged memguard kill) is rerun once, printed '[infra-retry] name: why', result last-line prefixed '[infra-retry ok after: ...]'. Killed twice: still a FAIL line and exit 1 (release.sh greps FAIL, and an unrun check proves nothing) but last-line 'INFRA-KILLED twice (machine, not code - rerun alone)' and the summary says 'N of them INFRA-KILLED'. Pool restarts a dead shared browser before the rerun.
- browser-profile.mjs: unchanged (profile name is read from run.prof).
- tools/page-recycle-selftest.mjs (new, no browser): PASSES (recycle count, rerun, INFRA-KILLED, kill-log reader). Not wired into check.mjs (it imports cdp so the pool would give it a browser slot): wire as you like.
- scratch\memguard2.ps1 (NEW; memguard.ps1 / PID 30160 untouched): under the floor it groups test browsers by lane (run tag in the profile name; an untagged profile is its own group), picks the biggest group at/over its fair share, and kills only that group's largest RENDERER (the page; browser and other contexts live). Cap branch unchanged. Every kill appends a JSON line to scratch\memguard-kills.jsonl BEFORE the kill. Params -DryRun -Once -Log -KillLog for a safe test: dry run done against the live machine (picked a renderer, killed nothing, wrote only to a temp log).
  SWITCH IN: when no suite is mid-run, stop the old guard (Stop-Process -Id <the powershell PID running memguard.ps1>), then `powershell -NoProfile -ExecutionPolicy Bypass -File scratch\memguard2.ps1` (same params). Tools work without it (message regex only); with it they also name the kill.

## Checks run
node --check on every touched file; page-recycle-selftest ok; check-pool imports; usage paths of pilot/mash/walk. NO browser run: GATE-RUNNING.flag exists. (I accidentally started tools/cdp-recovery.mjs for ~2 s via a --help probe; stopped at once, my PID only.)

## OWED (needs flag gone and >= 1500 MB free, one browser at a time)
Measured table: RSS of one boss fight page; 12-load mash-bot run with and without recycle (BRACKEN_RECYCLE_EVERY=0 vs default); lite vs normal; plus cdp-recovery, profile-leaks, profile-cleanup, load-leak, one pilot row (same row at default and --lite, same seed) and one mash row. Lite risk to verify: --enable-low-end-device-mode and the 640x360 window; the pilot-row equality is the test.
Note: pilot runs its `runs` (3/6) loads inside one evaluate, so it recycles between ids, not inside one.

## Questions (recommended answer first)
1. Keep INFRA-KILLED twice as a FAIL/exit 1? REC: yes (safe for release.sh); a later step could let a gate rerun only those.
2. Switch memguard2 in at the next quiet moment? REC: yes.
3. Make --lite the default for pilot/mash/walk once the pilot-row equality is measured? REC: yes, after the owed table.
4. Wire page-recycle-selftest into the suite? REC: yes (seconds).
