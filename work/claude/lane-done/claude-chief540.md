# chief540 (11-07) - Goblin Chieftain HP 590 -> 540

STATUS: HP change committed and pushed. NO measurement was run (RAM rule), so ship / not-ship is open.

Change: src/main.js EHP table, `chief: 590` -> `chief: 540` (the only edit; CHIEF_OPEN 2.0/2.6, HORN.crewMax 1 and chief damage untouched). Commit "chief540: Goblin Chieftain EHP 590 -> 540".

Why no numbers: free RAM was 4.18 GB, then 3.94 GB, then fell 3.78 -> 3.22 -> 2.78 GB in 10 seconds while batch150 (GATE-RUNNING.flag, started 11:47) ran. Rule is >= 4 GB free before a browser, so I started none. No node/chrome of mine was run; nothing to kill.

Owed (run once RAM is back above 4 GB and the gate ends), from this worktree, one Chrome at a time:
  PORT=8644 node tools/boss-rates.mjs stockade --ways=practiced,built --seeds=6 --jobs=1 --profile=human --out=scratch/chief540/chief-540.json
(boss-rates.mjs -> boss-run.mjs -> tools/cdp.mjs openPage = one headless Chrome per job; this is the same command shape as bosstune150 chief-e, 36 fights, ~11 min.)
If built < 55%: edit chief to 500 and rerun the same line, report both.
Stills still owed: 3-blow chain raise ("THREE BLOWS") and keg flash, via tools/chief-stills150.mjs (needs a second pass with fewer modes; it hit its 16-mode cap).

Baseline to compare against (HP 590): 56% bare (5/6 1/6 4/6), 31% built (2/4 1/6 2/6, 2 page crashes).

Verdict: not-ship yet (unmeasured). Rec: run the line above after batch150 ends; ship at 540 if bare is 60-70% and built is >= 55%, else try 500.

## UPDATE (RAM freed, measured; master 6743648c2, chief4 tested as-is)
n=6 per hero, human profile, kit flasks, NORMAL, stockade L4, one Chrome at a time (logs/json: scratch\chief540\chief-540.* and chief-500.*):
| EHP.chief | bare kn/wa/py | built kn/wa/py |
|---|---|---|
| 590 (bosstune150) | 5/6 1/6 4/6 = 56% | 2/4 1/6 2/6 = 31% |
| 540 | 5/6 1/6 3/6 = 50% [29-71] | 4/6 2/6 3/6 = 50% [29-71] |
| 500 | 5/6 1/6 3/6 = 50% [29-71] | 4/6 2/6 0/6 = 33% [16-56] |
Reading: 590 -> 540 -> 500 moves nothing outside noise (n=18 is +-20 pts, bot deterministic). Bare is flat at 50% across 540/500 and the 500 built drop is pyro 3/6 -> 0/6, noise. HP is not the lever; the warden (1/6 bare everywhere) is the weak hero. Final HP kept at 540 (Daniel's approved value); 500 reverted.
Stills (tools/chief-stills150.mjs, scratch\chief540\stills\): raise-chain, slam-chain, wind-chain, sweep-chain, crouch-chain, leap-chain, planted, wake, walk, wind, sweep, crouch, leap, landed, swap, slashWind. The chain raise is now captured. Keg flash NOT captured (no keg mode appeared in 16 modes; needs a forced keg throw).
Verdict: NOT-SHIP as a band fix (50% bare / 50% built, still under 60-70; 540 is harmless, cheaper to ship than not). Rec: ship 540 as approved if Daniel wants it softer; to reach the band tune the warden (1/6) or squad/opening, not HP.
