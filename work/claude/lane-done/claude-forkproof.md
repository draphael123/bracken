STATUS: DONE - Knight fork (ltfork + kfork) proven in a browser, 1 real bug fixed (road strip layout); branch claude/kfork tip bdf1b1d8 pushed, NOT merged to master, NOT deployed. Merge-ready after the SAT 11-07 cut.

# FORKPROOF lane (claude/kfork, 11-04)

## Merge
Merged master 42a1d4cd (BATCH144) into claude/kfork: clean, no conflicts (chargefeet visuals and fork code both kept). node --check main.js ok, tech-cards pass, pushed (1e315f28).

## Checks (one browser at a time, RAM >= 3.9 GB free each time)
- tools/textfit.mjs full run: started, ran >10 min with no output, stopped by me (my PID only). Ran the scopes that matter instead: card, pick, tree. FIRST RUN FAILED: 7 TRUNCATED, 24 COLLIDE, 1 OVERFLOW, 2 CLIPPED - all the ROAD TO L50 strip (it sat on the "N LEVELS TO YOUR NEXT PERK" and PERKS lines of every stat card; pip names cut: SHIELD A, COUNTER, LONG GU, BREAKIN; "L50 CAPSTONE" ran off screen). After fix: scope card = 75 screens, all counts 0. The full all-scope textfit is still owed (belongs to the suite).
- tools/tech-cards.mjs: PASS (before and after fix).
- tools/knight-chain.mjs: PASS, incl. LINK CUT (heavy falls at tick 15 = 0.25 s, 1 link spent, guard broken 2.1 s) and THE BREAKING WHEEL (hurts 49, breaks guard, spends 3 links, no shield charge). 
- SHIELD HOOK probe WRITTEN (new scope `hook` in knight-chain, in the default list): archer at 118 px is dragged to 14 px (plain throw leaves it at 118), melee foe not dragged. PASS. (No thrown-state accessor exists on BKT, so it is judged by distance.)
- Looked at (PNGs in scratch\lane-reports\): forkproof-card-L30-offer.png, -L40-offer, -L50-capstone-offer, -card-after-B-L30/L40/L50, -card-review-final (all taken, strip), forkproof-linkcut.png, -shieldhook.png, -wheel.png.
  - CHOOSE YOUR PATH card: title right, pair only, A has RECOMMENDED* in data, both "PICK ONE, THE OTHER LOCKS"; reads fine. The one-line `trade` text is still not drawn (known, ltfork).
  - ROAD strip (after fix): pips L25..L50, taken = green with name, fork pips show both options (taken ">" bright, locked dim), L50 gold frame "L50 CAP". Names are last-word short forms (THRUST, ADVANCE, GUARD, HOOK, CHARGE, WHEEL).
  - LINK CUT: physical heavy cut + BROKEN + dust; ok. (Reveal-circle in thumbnails is the level-intro mask, harness artifact.)
  - SHIELD HOOK: shield strikes the sprig, finds the archer, turns, archer ends up beside the knight, stunned. Chain line is thin at thumbnail size; fine.
  - BREAKING WHEEL: spinning shield 1.5x rolls the floor with dust, GUARD BROKEN on crossed foes, returns. No beam/ring/wave. 

## Fixes + commits (pushed to origin claude/kfork)
1. 1e315f28 merge of master.
2. forkproof 1: strip layout - when the road strip shows, the next-perk line moves up under the hero name line (y 26) and the PERKS list is not drawn (the strip names the picks; the L5-L20 perk names are no longer on that card when the strip shows); pipName() shortens a long technique name to its last word; "L50 CAP". + knight-chain hook probe.
3. bdf1b1d8 forkproof 2: locked fork option shows its whole name (no "X " prefix, which cut ADVANCE to ADVAN); tools/forkproof-shots.mjs (re-runnable screenshots).

## Not done / owed
- Full textfit all-scope, hero-keys-sheet, weapon-skins, mash-gate (suite). ability-law tool still absent. Not built (unchanged): capstone preview clip, yard TRY station, co-op tech-id snapshot, trade line on fork cards.

## Questions (recs held, none blocking)
- Q1 PERKS list dropped from the card when the strip shows: rec keep (perks still visible via tree/stat); alt: widen the card area by trimming the stat card (94 px).
- Q2 LINK CUT / WHEEL questions from kfork stand (recs: auto trigger kept; wheel spends links on a miss).
