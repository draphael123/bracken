# CLAUDE-DUELTABLE - branch claude/dueltable-d. PHASE 1 + PHASE 2 TOP-UP DONE (finished 21:08, inside the 21:35 cutoff)

Full report: bracken-planning/reports/dueltable.md (this file is the short branch-side copy per the lane primer). Phase 1 = full 72-pairing x n=10 matrix (finished 20:40). Phase 2 (this session, same worktree, 20:52-21:08) = n=30 top-up on the worst 8 ordered pairings + 2 more browser clips.

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

## PHASE 2 addendum (n=30 top-up, 240/240 fights, `work/claude/tune/dueltable-worst8-n30.json`)
- n=30 on the 8 worst ordered pairs CONFIRMS every direction from n=10; all 8 Wilson 95% CIs sit entirely outside the 35-65% band. pyro>reaper held at a rock-solid 0/30 [0-11]. Two cells softened from the n=10 extreme-zero reads (knight>pirate 0%->16.7% [7-34], warden>berserker 10%->23.3% [12-41]) but remain clearly imbalanced. **No proposal changes as a result** - still recommendations only, nothing applied to src/pvp-duel.js.
- Watched 2 more fights live: (1) pyro v reaper seed 1 - pyro closed into near-melee range (inside its own 72px BOT_RANGE preference) and lost the trade there; reaper dealt 101 vs pyro's 50 (roughly the 2x gap seen in the aggregate data, meaning pyro's PRE-multiplier output is ~4x weaker since it already carries a x2 heroMul); reaper's K.O. screen showed a "VITAE: FULL" banner - a second reaper-side kit mechanic (campaign, not DUEL-only) stacking with Finding 2's riposte dynamic. Recommend against pushing pyro's heroMul further - the fix is pyro's bot positioning or reaper's Vitae interaction, neither a DUEL-only number. (2) warden v geomancer seed 2 (one of the 21 recorded timeout seeds) - replayed live, combat was NOT frozen, resolved cleanly 2-0 to warden in ~84s. This did **not** reproduce the exact recorded stall (manual `BK.sim()` chunking doesn't bit-reproduce the harness's `BK.sim(10)`-per-iteration seeded run), so it rules out a hard page freeze in general for this pairing but does not pin down the specific stalled seed - still partially owed.
- Stills added: `pyro-vs-reaper-{1,2,3}.png`, `warden-vs-geomancer-{1,2}.png` (alongside Phase 1's `knight-vs-pirate-{1,2,3}.png`), all in `C:\Users\danie\Projects\desktop-stills\dueltable\`, not committed.

## What's owed (updated)
- Daniel's OK on the 3 heroMul nudges (reaper, new knight, new pirate) before touching src/pvp-duel.js.
- The seat-order effect (Finding 4) - now refined: paladin/ranger is seat-clean (93.3%/93.3% both ways) while warden/berserker still shows a real seat gap on top of its dominance - the effect looks pair-specific, worth narrowing down.
- A tighter repro of the exact warden-v-geomancer timeout seed (same call granularity as tools/duel-table.mjs) if the stall mechanism needs pinning down further.
- Phase 1's remaining clip wishlist (pyro v knight/paladin, paladin v knight/pirate) - not picked up this pass.
- None of the 4 proposed DUEL-only number changes have been applied to src/pvp-duel.js on this branch.

## Questions (recommendation built; see PLAN report for the full reasoning)
1. Apply anti-juggle + round-timing knobs now, hold heroMul nudges for Daniel? REC: yes.
2. Fix the seat-order swing before the next hero-balance pass? REC: yes, it's cheap to narrow down and currently makes every single-direction reading +/- up to 60 points unreliable.
3. Raise the test harness's 6-minute cap for a confirm pass on the 4 stall pairs only? REC: yes (~800 s, those 4 pairs only).
