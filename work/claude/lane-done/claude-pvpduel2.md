# PVPDUEL2 (11-05/06) - branch claude/pvpduel2 (off master 929cc4786), worktree bracken-pvpduel2. Not merged, not deployed.

## VERDICT: READY-TO-FLIP = NO
PVP_SHIPS stays false (src/pvp-duel.js: PVP_SHIP_FLAG = false). The warden 100% edge is fixed (46%), but the pair table still has many lopsided pairs (0/6, 6/6) from other heroes, so "no pair worse than ~70/30 at n=6" is NOT met.

## 1. Stills (done) - scratch/lane-reports/duelpit-*.png
1-title, 2-title-on-duel (DUEL (BETA) row), 3-inn-card (tavern DUEL card), 4-fight-start, 5-mid-fight-hud, 5-round-1-banner, 5-round-2-banner, 6-winner-screen (RANKINGS board), 6b-rematch-count, 6c-winner-screen-2, 7-back-in-inn. Taken with the flag OFF via the new dev switch; 0 console errors, no bad drawImage (shared tick() draw-during-load fix kept). Eyes notes: in 5-mid-fight-hud the duel's P1/P2 bars overlap the normal co-op portrait panel at the top-right and the WINDED hint sits over the ring (cosmetic, owed).

## 2. Dev switch (new)
Flag off, the mode shows with `?duelbeta` in the URL (or window.__DUELBETA=1; tools/cdp.mjs openPage({duelBeta:true})). Daniel can hand-test the build at /?duelbeta without anyone else seeing it. node tools/pvp-duel.mjs pure,sim: all ok.

## 3. Balance (bot-vs-bot, real page, n=6 per pair, seats alternate)
Tool: tools/pvp-duel-probe.mjs (ALL=1 N=6 = the 36 pairs, ~12 min; A=hero LIST=.. for one hero). Raw tables: scratch/lane-reports/pvpduel2-table1/2/3.txt.
- Finding: contrary to proof146b, the warden edge IS damage: a per-hero blow multiplier DUEL.heroMul moves it (x1 100% -> x0.35 72% -> x0.3 46% of all duels). Blow-weight trim is steep: 0.3 vs 0.4 flips knight pairs 1/6 <-> 5/6.
- Hero win share (all 8 opponents): round 1 (warden .35 only) knight 46 warden 57 pyro 25 paladin 32 pirate 48 reaper 83 geomancer 74 berserker 40 ranger 44 | round 3 (SHIPPED in branch: warden .3, reaper .7, geomancer .6, pyro 2.0, paladin 1.7, ranger 1.1) knight 58 warden 46 pyro 24 paladin 31 pirate 50 reaper 71 geomancer 70 berserker 44 ranger 56.
- Every hero is now inside 24-71% in aggregate except none over 80 (the old bar) - but PAIRS still lopsided: knight>paladin 6/6, warden>pyro 6/6, pirate>berserker 6/6, geomancer>berserker 6/6, paladin loses 0/6 to pirate and reaper, pyro 0/6 to paladin, reaper and ranger, knight 0/6 to pirate. n=6 noise is large (one pair swung 1/6 <-> 5/6 on a 0.05 change), so exact pair targets need n>=12 and a per-pair view.
- PYRO and PALADIN multipliers (2.0 / 1.7) did NOT move their results at all (pyro v paladin 0/6 in all three tables): their damage is not coming through the scaled path (probably effect/skill hits or bot play: the pyro and paladin bot brains are weak). Rec: fix their BOT brains (kite/ward use) rather than a multiplier; the heroMul entries for them are inert, remove if you prefer.

## Not done / owed
- Pair-level tuning to <=70/30 (needs bot brains for pyro/paladin, then n=12 tables); tavern.mjs station run after the dev-switch change (code path unchanged with the flag on; not re-run); two humans / pads / online guest hand test; 36-pair self-blow audit not re-run after heroMul.
## Questions (rec first)
1. Ship DUEL (BETA) with the flag still false and let Daniel try it at /?duelbeta? REC: yes.
2. Flip the flag to a public "beta" despite lopsided pairs (it is labelled BETA, bot duel is practice)? REC: no, wait for the pyro/paladin bot pass + one n=12 table.
3. Keep the ?duelbeta URL switch in shipped code? REC: yes (harmless, hidden).
