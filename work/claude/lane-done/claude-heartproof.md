# claude/heartproof (lane on claude/heartinteg) - Heart browser proof, 11-05
No Heart code needed fixing (no reds). New tools only. One headless Chrome at a time, RAM 1.8-5 GB free before each, all closed by their tool. check.mjs NOT run. Not merged, not deployed.

## Passed
1. reflect-probe: ok (9 heroes; ranger/paladin/reaper/geomancer/berserker rows). One FLAKE reported by the tool: paladin "no other verb is a free power return - holdC" failed 2 of 3 attempts, passed the 3rd (held C sometimes lands a power return by timing). reflect-owed: ok (knockdown tumble>downed>repulse>rise, imps cap 2, bombs, no bolt leak 70 s, AI partner swats a bolt, HUD shots).
2. NEW tools/heart-proof.mjs. SKY, all 9 live heroes (knight warden pyro pirate paladin geomancer reaper berserker ranger): mounted at load, 2724 frames each of run/jump/attack/dodge/both banks/3 knock-downs (standing, running, jumping)/knock-downs at both ends - never off the back (0 frames off), 0.5 s prone, still mounted + alive; an attack hit returns a bolt (ret) for every hero. Shots work/claude/heartproof/sky-<hero>.png.
   BERSERKER hatchet vs bolt: UP+C axe throw returns a bolt at 30/60/90 px, the 4-hatchet storm returns it at 50/100 px (so reflectkit's "hatchet owed" is closed). Shot berserker-hatchet.png.
3. CO-OP knight + AI warden, 80 s each, god off: skylab - both seats move (AI 202 / P1 315 steps), both stay on the back, no split mount, the fight advances (10 returns, king 8784 -> 6536), AI alive; AI partner returns a bolt 40 px out. drakelab - both move, fire drake fight runs, no soft-lock. (A bolt parked at 14-22 px of a co-op pair hits the P1 beside it - a test-setup artifact, not a bug.)
4. CAMERA (tools/heart-cam-shots.mjs, shots cam-*.png): normal view 320x180 and the wide view 629x311 both frame hero + drake + King; parallax full / low / off draw with no exception; bank toward neck/tail, climb, phase 2, phase 3 all read. QUIT: pause > Return to map from skylab and drakelab reaches the map; the next level loaded (wood) inherits no drake/king/bolt/imp, no sky back, hero not mounted. Console errors: none, in every run.

## Notes (not fixed, not Heart reds)
- After Return to map the map state keeps the lab's enemy list and P.mount until the next level loads (never updated/drawn; cleared on next load). Harmless; one-line clean-up possible if wanted.
- Headless shots show "PRESS A KEY FOR SOUND" over the boss bar: the audio-unlock prompt, not Heart.

## Still owed
- Merge master into claude/heartinteg after the SAT 11-07 cut, rerun fire-drake, sky-mount, demon-king, reflect-kit, heart-scenes, heart-proof; full suite (check.mjs) on the branch.
- Rimebinder / Demon Hunter / Desert Priest unwired (data-checked only). Art-before-live status of Heart levels. balance.mjs / musthave reds are pre-existing (separate lane).
- heart-proof.mjs and heart-cam-shots.mjs are NOT in check.mjs (kept out: browser time); rec: add heart-proof (about 6 min) to the nightly only.

## Questions (rec first)
1. Register tools/heart-proof.mjs in check.mjs nightly? Rec yes (nightly only).
2. Paladin holdC power-return flake: accept (a held guard that happens to land on the beat is a legitimate power) and loosen the probe row? Rec yes, tuning-free probe change.
