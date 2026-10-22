# codex/load-perf

Status: Partial. Demand loading, actual decoded-entry barrier, cache-only pixels and the unchanged default mobile gate
are verified. The five stress arenas remain below 40 fps, and measured gains are mixed. No cold-start wall-time reduction is claimed.
Base: newest origin/master BATCH112 `5e44cddd`. No merge/deploy, game balance change, asset replacement or budget change.

## Audio

- Audio unlock requests only 10 first takes (63,619 bytes). Selected-level demand includes all common effect variants,
  selected/party hero voices, placed characters and a conservative summon/fallback closure. Level entry waits for actual
  fetch/decode completion. Music retains priority and SFX retains its eight-lane limit.
- A URL owns one decode promise across manifest aliases. Failed loads reject readiness and can be retried; completion
  of a request queue is not confused with actual decoded readiness. Loading sound holds input/play; failure leaves a
  visible retry/back action. Manual lab simulation retains synchronous semantics.
- Before: 867 manifest fetch entries, 7,841,366 bytes. Distinct: 832 URLs / 7,527,656 bytes. Alias elimination avoids
  313,710 redundant bytes and duplicate decode work across a complete traversal. The same recordings remain on disk.
- Single-Knight selected-level catalogs total 4,998,431-5,655,931 bytes; Wood is 5,240,681 bytes / 144 pools.
  The 63,619-byte figure is menu core ONLY, not an entire level payload. All common variants remain, so this is a
  conservative level/hero voice split rather than an aggressive tiny per-room catalog. No further lossy encode was applied.
- Run https://github.com/draphael123/bracken/actions/runs/39823897267 at `714973f1` verifies all 48 campaign
  catalogs with all nine heroes using real fetch/decode: 832 unique fetches, 832 ready, zero failures, maximum eight
  active, no late pool recorded. Loader selftests cover cold unrequested pools, alias reuse, bounded lanes and rejection.
  Existing asset/voice/footstep/music-priority checks pass. This is catalog/decode coverage, not every possible combat path.
- Final run https://github.com/draphael123/bracken/actions/runs/39839572690 adds a real startGame barrier proof:
  hold .ogg responses, assert the map remains held and play does not start, release them, then assert decoded readiness
  and play with no late pool. It also runs unchanged loading-screen, frame-cost, preload and mobile-perf gates.
  The sound/entry, music, loading-screen, frame-cost and preload steps all PASS. Real entry receipt:
  2026-10-22T19:24:37.719Z, pending audio holds state=map / busy=true / ready=false; after release,
  Wood has 655 decoded unique URLs, ready=true, zero failures, maximum eight active and no late pool.
  The mobile step in that run failed, so the workflow as a whole is not labeled successful.

## Renderer and measurement

The corrected all-campaign baseline, run 39820807258 at `14582f8e`, contains 96 entry/arena rows for 48 levels,
915x412 landscape touch, DPR 2.625, 4x CPU throttle. A failed browser launch in shard 7 was rerun once and its valid
12 rows substituted; no measurement row was dropped. The initial desktop-then-emulated baseline is rejected because
it retained desktop backing stores. The corrected profiler reloads under mobile metrics and asserts coarse input and
at most 1.3 megapixels. Rank by busy milliseconds selected Undercrown, Lamplit, Hanging, Hurricane and Minecart arenas.
CPU samples put native drawImage under render() first, with drawWorld next; tiny script helpers were not the main cost.

Changes retained: cache immutable view-sized sky expansion and constant vignette gradients with weak owners and
bounded entries. Animated layers, geometry, art, output resolution and budgets remain unchanged. An opaque-frame
experiment was withdrawn after long-frame failures; src/px.js and framebuffer creation are restored to master.

Final comparison https://github.com/draphael123/bracken/actions/runs/39841711853, source `1c45348e`, five jobs PASS.
Same runner per before/after pair, three five-second unprofiled samples per build, original mobile settings. Exact
pixel sampling runs in separate cold pages so neither readback fallback nor previous real-time combat contaminates
its counterpart. All five live arenas: **120/120 exact RGBA frame hashes match**. Last receipt: 2026-10-22T19:43:55.797Z.

| Arena | Median FPS before | After | Observed change |
|---|---:|---:|---:|
| Undercrown | 8.60 | 9.17 | +6.6% |
| Lamplit | 9.40 | 9.59 | +2.0% |
| Hanging | 12.98 | 12.99 | +0.1% |
| Hurricane | 19.36 | 18.98 | -2.0% |
| Minecart | 17.92 | 18.58 | +3.7% |

The current cache-only result is mixed: Hurricane is 2% lower, Hanging is effectively unchanged, and the other three
are higher. Three windows are not confidence bounds; these small deltas can include timing noise. There is no honest
claim that all five improved. The major native scaled drawImage cost remains, and these five stress arenas remain
below 40 fps. Further cause-based renderer work is outstanding. Earlier 2-13% results included the withdrawn opaque
experiment and are not claimed for the retained source. Earlier pixel-before-FPS measurements are diagnostic only.

The unchanged default mobile gate **PASSes** after rollback in run
https://github.com/draphael123/bracken/actions/runs/39841707059 at the same `1c45348e`, receipt 2026-10-22T19:40:16.788Z.
Title/map/Wood/Welltown/Redgorge: 60.2 / 52.7 / 60.0 / 60.2 / 59.2 fps. Worst frame 499.9 ms; median stick input 0.7 ms.
All original 40 fps / 600 ms / 50 ms / canvas/boot limits stayed enabled. In that same diagnostic the original master
failed with a 616.6 ms Wood frame, whereas it passed in the prior comparison. Earlier updated builds failed with
866.7 ms map and 966.6 ms Wood frames (the latter 33.5 fps). Those failures are retained, not deleted or averaged away.
The varying original result limits causal attribution: withdrawing opacity was conservative, not proof that it alone
caused the stalls. One current pass does not establish that every sporadic pause is fixed.

## QUESTIONS FOR DANIEL

- Audio quality: recommend keeping the original Ogg recordings. Built demand loading and duplicate decode elimination;
  measured saved requests/bytes, not an unmeasured startup-time guarantee. Catalog coverage does not prove every combat path.
- Frame budget: recommend treating this as a measured incremental renderer improvement. Built bounded caching with five-scene exact pixel proof; the opaque-frame
  experiment was removed. Heavy arenas still need further profiling; no lower budget was substituted.
- Merge: recommend coordinator review alongside Task 2/3 harness changes, followed by the full release gate.
  No master merge or deployment was performed.
