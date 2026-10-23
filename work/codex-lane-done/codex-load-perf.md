# codex/load-perf

Status: Partial. Demand loading, actual decoded-entry barrier and full-campaign exact pixels are verified.
The five stress arenas remain below 40 fps; timing changes are mixed, and the latest unchanged mobile gate fails.
No cold-start wall-time reduction or universal frame-budget pass is claimed.
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

Changes retained: the bounded static vignette-gradient cache (eight entries per drawing context) and
off-screen room culling. The sky expansion cache was withdrawn. Original recordings, art, output dimensions,
DPR, quality settings, combat values, assertions and time limits remain unchanged. src/px.js equals master.
The current src tree is a0ce277c4d2d5d30d0f88df1f7e187d8d95b109b; it is identical from b8b0ec1d through
all continuation diagnostic commits, including the source of the following proofs.

The full 48-level campaign proof passes at dc5a4e50:
https://github.com/draphael123/bracken/actions/runs/39866894275. All eight shards complete, two scenes per
level, 60 explicit frames per scene: **5760 exact gameplay/RNG/frame-RGBA/display-RGBA comparisons**.
The lab starts before the first automatic game tick and aligns scenery that reads performance.now to the
simulation clock during explicit pixel renders only. Identical-master controls first reproduced Mageyard
wall-clock drift; after correcting that lab clock they pass on both default GPU and CPU-readback backends
(run39866426477). Real-time FPS samples keep native time and the default rendering backend. No pixel
tolerance was added and the full-campaign proof uses the default GPU backend.

The final ordinary-renderer five-arena comparison also passes all exact-pixel/state checks:
https://github.com/draphael123/bracken/actions/runs/39866897539, source dc5a4e50. Same VM per before/after
pair, three five-second unprofiled samples per build, original phone setup at four-times CPU throttle.
Pixels use separate cold pages and 120 frames per arena, including the displayed canvas.

| Arena | Master median FPS | Retained renderer |
|---|---:|---:|
| Undercrown | 11.97 | 11.99 |
| Lamplit | 7.99 | 7.36 |
| Hanging | 20.79 | 20.94 |
| Hurricane | 17.76 | 18.40 |
| Minecart | 12.33 | 12.20 |

These small mixed observations are not confidence bounds or proof that every arena improved. The major
native scaled presentation copy remains, and all five stress arenas are below 40 FPS. The latest unchanged
standard mobile comparison (39857977706, b8b0ec1d, identical current game tree) fails on both master and
updated builds; updated Wood/Welltown/Redgorge measure 35.7/37.2/31.5 FPS. Earlier passes at e1b9eae7
(run39854763841) and 1c45348e (39841707059, worst frame499.9ms) remain historical occurrence receipts.
Earlier 866.7/966.6ms failures and the baseline616.6ms stall are also retained. No limit was raised or
failing occurrence removed to present an overall pass.

## Additional profiled-cost experiments

All experiments below remain in diagnostic tools; none is installed by production source. Copy presentation
failed letterbox pixels and was slower. Pattern presentation, CPU-frame backing and synchronous display
matched their sampled pixels but gave mixed or worse timings, so they were not adopted.

A bounded immutable-sprite bitmap experiment (4MB/128 entries, two asynchronous requests, mutation/resize
invalidation and explicit close) passes real translucency, mutation and resize controls, then all five
120-frame exact-pixel comparisons: run39867656544 at b69ba085. Before is the same retained game tree, so
this measures only the proposed bitmap layer. An accounting fix for resized sources is included afterward.

| Arena | Plain retained FPS | Bitmap experiment |
|---|---:|---:|
| Undercrown | 20.97 | 21.59 |
| Lamplit | 18.59 | 17.78 |
| Hanging | 12.59 | 11.59 |
| Hurricane | 24.17 | 23.80 |
| Minecart | 10.55 | 10.78 |

The cache is exercised (roughly110k-329k hits per timing run), but those hits do not give consistent FPS
gains. It is not integrated. The actual opaque-frame control (39869209098, 483e0329) changes only a separate
disposable checkout and asserts the real frame context alpha=false before accepting measurements; all
five exact-pixel/state comparisons pass. Undercrown11.59->11.79, Lamplit9.99->9.79, Hanging17.36->21.19,
Hurricane13.78->14.19, Minecart11.75->12.13. This also remains diagnostic because the result is mixed.
The first alpha attempt (39868362028) selected the wrong canvas: actual frame alpha remained true, so all
of its timing numbers are rejected as an ineffective control. Its receipts are retained.

Reference checkouts now copy the transitive shared-harness imports, keeping both sides on identical
harness code when Task2 adds cleanup helpers. The copier is tested against the actual four-module
performance graph and eight-module stabilized graph, including successful imports. Reference game
files stay at their selected base. This follow-up changes tools only; the verified src tree is unchanged.

## QUESTIONS FOR DANIEL

No decision is required to retain the verified demand loading and conservative renderer changes. Recommend
keeping original audio quality and all current release thresholds. Heavy-arena frame-budget work remains
Partial; a larger rendering change needs its own measured improvement and full pixel proof. No quality
reduction, damage retune, master merge or deployment is proposed or performed.
