# JUMP FEEL lane (claude/jumpfeel, off batch140 5f856e7e) - code only, visual only
## What changed
- NEW src/jump-feel.js: JUMP_FEEL table + helpers. src/main.js: import, squash() now clears a pending stretch, jfLaunch / jfLand / jfPuff helpers, launch + landing + stretch-apply hooks (5 edits). Physics, coyote, buffer, JUMPV, landT/landArt and every pose timer untouched. No art, no levels (no levelHash change).
## Feel table (1.0 = old shared feel; stretch/land scale the DEVIATION from 1; landT = visual hold only)
| hero | w | stretch | land | landT | dust | ant |
| paladin | 1.30 | 0.70 | 1.30 | 1.40 | 1.35 | .10 |
| berserker | 1.22 | 0.74 | 1.26 | 1.32 | 1.28 | .10 |
| knight | 1.12 | 0.84 | 1.16 | 1.18 | 1.14 | .09 |
| geomancer | 1.10 | 0.86 | 1.14 | 1.18 | 1.12 | .09 |
| warden | 1.06 | 0.90 | 1.10 | 1.12 | 1.08 | .09 |
| reaper (medium) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | .08 |
| pirate | 0.92 | 1.12 | 0.90 | 0.88 | 0.92 | .07 |
| ranger | 0.84 | 1.22 | 0.82 | 0.82 | 0.84 | .06 |
| pyro | 0.80 | 1.26 | 0.78 | 0.78 | 0.80 | .06 |
Launch stretch (old 0.8/1.2): paladin 0.91/1.09 ... pyro 0.75/1.25. Hop landing (old 1.15/0.86): paladin 1.20/0.82 ... pyro 1.12/0.89.
## Dust
- Hops: two extra side puffs of 2..5 particles (by fall speed vy 60..280) x hero dust (was 4 flat, now ~8-14). Heavy tiers get +0..1 per side by weight. Takeoff: extra 1-3 puff, dragged backward when running (|vx|>40), x hero dust. New particles use fxRand (no Math.random stream change), honour partScale.
## Anticipation
- On the jump tick the sprite is drawn wide and short (1 + 1.4*ant / 1 - ant) for exactly ONE frame, then the stretch applies the next tick. The jump itself runs on the same tick as before. Reduced-motion skips it (stretch only, old timings).
## Timing proof (leaves-ground tick) - base vs new, 9 heroes x standing/running, 150-tick traces
scratch\lane-reports\jumpfeel\timing-proof.txt : leaves ground at tick 6 and lands at tick 47 for all 18 runs, and the whole vy / ground / pose-key / pose-frame / landArt series is IDENTICAL base vs new. MISMATCHES: 0.
## Before / after
- scratch\lane-reports\jumpfeel\base\  (before: <hero>-strip.png, <hero>-stand.gif, <hero>-run.gif, jump-sheet.png, jump-meta.json) and \jumpfeel\ (after, same names; raw stand frames in jumpfeel\frames). GIFs 60 fps x4. Capture: scratch\jumpfeel\capture.mjs (env CDP, OUT, PORT); timing: scratch\jumpfeel\timing.mjs. Strips viewed: paladin only (GIFs not viewed frame by frame).
## Checks (run directly; no full suite)
PASS: ability-poses (JUMP ARCS intact, 77/77), juice, hero-roster, reach-heroes (0 new crossings), combat-feel, level-jump, attack-animation, boss-jump (rerun; first run hit a Node error, second listed all bosses woke/cut down - exit not re-captured), hero-keys-strip knight+pyro (wrote, no diff harness run).
RED but PRE-EXISTING: hero-pass (knight UP+C interrupt x2) - same failure on base 5f856e7e.
OWED: full QUICK gate; not merged/deployed. No cape/scarf trail (optional, skipped - needs per-hero art placement).
## Questions (recommended answer)
1. Shared cape/scarf trail? Skip until after freeze (needs per-hero anchors).
2. Warden sits in the heavy group per brief although she is agile; keep (values are mild, 0.90/1.10).
3. Tune after Daniel eyeballs the GIFs; the table is the only knob (src/jump-feel.js).
