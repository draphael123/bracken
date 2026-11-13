# CLAUDE-DUELTABLE - branch claude/dueltable-d. PHASE 1 DONE (full 72-pairing x n=10 matrix, finished 20:40, inside the 21:35 cutoff)

Full report: bracken-planning/reports/dueltable.md (this file is the short branch-side copy per the lane primer).

## What changed (this branch only, not applied to master)
- `tools/duel-table.mjs` (new): resumable 9x9 ordered-pairing duel-matrix driver. One page reused across fights, recycled every 6 (crash-safe retry), `--resume` skips finished `(a,b,seed)` triples, persists to disk after every single fight. Committed (6b4eaef18) before running, per the brief.
- `work/claude/tune/dueltable-n10.json`: 720 rows (72 ordered pairs x n=10), complete. Schema: `{a,b,seed,winner,endReason,secs,rounds,dealtA,dealtB,hpA,hpB,livesA,livesB,landed,blocked,breaks,kos,self,nobody}` + meta (startedAt, level, arena, masterSha, recycle, n).
- No src/pvp-duel.js changes made yet - the 4 proposed DUEL-only number changes (anti-juggle, round timing, 3 heroMul nudges) are recommendations in the PLAN report, not applied.

## Numbers
- Setup: base master 0e5d74224, EVEN/LEVEL 1 defaults confirmed from `cleanSettings(null)`, Pit arena (no DUEL_FOES/DUEL_ARENAS on master). ~1.3-3 s/fight warm, ~9.5 s cold (browser+server start). One headless Chrome throughout, RAM never below 6.3 GB free of 16 GB. Zero crashes/retries across 720 fights.
- 57/72 ordered pairings (79%) outside the 35-65% band; 35/72 (49%) at the extremes (<=10% or >=90%); only 15/72 in-band.
- Seat-neutral per-hero win% (both seats, n=160 each): reaper 69.4% (highest), knight 65.0%, pirate 58.1%, ranger 46.3%, warden 45.6%, geomancer 43.1%, paladin 41.3%, berserker 41.3%, pyro 26.9% (lowest).
- 21/720 fights (2.9%) hit the 360 s test cap unresolved (winner null) - concentrated in warden-geomancer (7), warden-berserker (4), pyro-ranger (9): likely mutual kiting/no-engagement, not a page soft-lock (not confirmed visually - BROWSER OWED).
- Watched live (browser pane, 2 fights, knight v pirate seeds 1-2): a universal RIPOSTE mechanic (src/riposte.js, x2 damage window on a landed parry) snowballs for whichever bot's timing lands the first riposte; stills in `C:\Users\danie\Projects\desktop-stills\dueltable\knight-vs-pirate-{1,2,3}.png` (not committed).
- Per-hero DUEL.heroMul correlates weakly/inversely with outcome: reaper nerfed x0.7 is still #1; pyro buffed x2 is still last by a wide margin. Confirms/extends the code's own historical warden finding across the whole roster.
- Found a seat-order effect independent of hero identity: some pairs swing up to 60 points depending purely on which seat (A/B) a hero occupies (e.g. knight/berserker: knight wins 100% as seat A, only 40% as seat B). Flagged as a methodology issue for any future single-direction win-rate reading.

## Checks run
- `tools/duel-table.mjs` smoke-tested (knight:pyro, warden:ranger @ n=2, then resumed to n=3 - correctly skipped the 4 already-persisted fights). No other project checks touched (tools/check.mjs was never run - not needed for this data-collection lane).

## What's owed
- Phase 2 (03:04): n=30 on the worst 8 pairs - exact resume command is in the PLAN report.
- Browser-confirmed mechanism for pyro/paladin's weak performance despite a buffed heroMul (not watched - only knight v pirate was watched live).
- Visual confirmation that the 21 timeout fights are mutual kiting, not a soft-lock.
- None of the 4 proposed DUEL-only number changes have been applied to src/pvp-duel.js on this branch - PLAN report has the exact before/after values and the built recommendation on which to apply now vs hold for Daniel.

## Questions (recommendation built; see PLAN report for the full reasoning)
1. Apply anti-juggle + round-timing knobs now, hold heroMul nudges for Daniel? REC: yes.
2. Fix the seat-order swing before the next hero-balance pass? REC: yes, it's cheap to narrow down and currently makes every single-direction reading +/- up to 60 points unreliable.
3. Raise the test harness's 6-minute cap for a confirm pass on the 4 stall pairs only? REC: yes (~800 s, those 4 pairs only).
