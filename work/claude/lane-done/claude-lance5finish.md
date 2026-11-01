# claude/lance5 FINISH (sonnet) - VERDICT: READY for integ

Branch claude/lance5 @ 7c5b1358 (on 6ea41250). Not merged, not deployed. Code touched: src/lance-art.js (bakeSheet), src/main.js (2 lines). No hitbox, tune, level or look change.

## 1. Memory: the torn sheet bakes lazily
- `bakeChampionTorn(lazy)` returns the sheet with blank 1x1 slots and `fill(k)` that bakes the next k wanted frames (R, L, white R, white L). main.js bakes it `SPR.lanceTorn = LNA.bakeChampionTorn(true)` (nothing at load) and calls `fill(4)` per drawn tick once he is on screen (the arena), `fill(999)` if e.torn arrives first.
- Measured in the page (canvas bytes, R+L+white): at load Lance sprites = **14.2 MB** (P1 sheet, 49 frames, 100 ms) + 0 for the torn sheet (0.2 ms). Was ~36 MB (art-lane 119 frames) and ~55 MB (after art: 14.2 + 40.6). Load memory is now below the pre-art figure.
- First-fight bake: torn sheet 140 real frames, 24 ticks at 6/tick -> max 15.6 ms; set to 4/tick = ~35 ticks, ~10 ms each, done ~0.6 s after he is first drawn, long before 67% (P2). Whole bake if forced = ~260 ms (only if the storm arrives before it finished: practically never). No visible hitch.
- Pixel-identical: the lazy sheet's 140 frames equal the eager bake's (toDataURL compare, R and L: identical true).
- Duplicate bare poses: not trimmed (would change the pose table; the lazy bake makes it unnecessary). The ~40.6 MB is paid only once he is on screen, and only until the page reloads.
- mobile-perf not run (it measures boot/scenes, the Lance is not in its scenes; the in-page byte count above is the sharper measure).

## 2. Restamps and checks (one browser at a time, RAM 5.3-7.5 GB free, no gate flag)
- There is no stored pixels hash for the Lance sheet or the Long Bridge in this repo (the "pixels" check is `headless.mjs floats`, a live check with no stamp file); nothing to restamp. Level hash unchanged, mash row (storm 0/6) unchanged, since the sim is untouched.
- GREEN: tools/lance4.mjs (node + page: pivot, kb, storm + torn, gust -> buffeted -> updraft -> tossed, hero lifted, skewer, P3, great bell, slam; errors []), stormhold4, boss-read, textfit bestiary,hints --strict (440 screens, all 0), mark-integrity MI_ONLY=lance (every mark posed and lands), pixels floats on storm (118 sprites, nothing floats). tools/check.mjs not run.

## 3. Tune re-check (boss-rates storm --ways=practiced --profile=human, flasks kit, L18, jobs 1)
New seeds 25-36 (SEED0=24), n=12 per hero: knight 10/12, warden 10/12, pyro 8/12 = 28/36 = 78% (knight counts 2 trades as wins, as the tool does).
Pooled with the lance5 FINAL (n=24 per hero, seeds 1-24, same numbers): knight 25/36 = 69%, warden 26/36 = 72%, pyro 22/36 = 61%, **all 73/108 = 68%** (band 60-70, each hero 55-72). Pyro up from 58% to 61% on more seeds. The fresh batch is high (78%) in line with the known seed spread (64% / 86% on two 36-fight batches of the same build). **No number changed**: not outside the band. Wins median ~120 s. Resist floor unchanged (x0.4 / x0.7 / openings 1.5-2x).
Note for the coordinator: if the integ gate reads a single n=12 and lands 78%, that is seed noise; the pooled n=108 is 68%.

## Questions for Daniel (rec built)
1. Lazy bake rec built. ALT: also free the torn sheet when the level is left (saves ~40 MB between fights; not done, adds a re-bake on retry).
