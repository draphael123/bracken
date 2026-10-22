# codex/load-perf

Status: Partial. Baseline profiling and sound-loading diagnosis; no performance improvement claimed yet.
Base: newest origin/master verified as BATCH112 5e44cddd on October 22, 2026.

## Current evidence

- The existing loader fetches all 867 SFX manifest entries after audio unlock. There are 832 distinct
  URLs, so some recordings are fetched/decoded more than once under aliases. All files are already Ogg;
  another lossy encode is not an assumed quality-preserving optimization.
- Distinct voice files: 337 / 3960608 bytes. Steps: 68 / 381673 bytes. Other sounds: 427 / 3185375 bytes.
  Total distinct sound payload: 7527656 bytes. First takes for the 109 non-voice pools total 829977 bytes.
- Existing music-first priority and eight-lane SFX loading remain unchanged at this checkpoint.
- Added an isolated baseline profiler for all 48 campaign levels, at entry and live arena when present,
  with 4x CPU throttle, 915x412 mobile viewport, DPR 2.625. It records FPS, frame cost, active arena state,
  exact source SHA/PIDs and CPU profiles. Each level uses a fresh browser. It is a measurement tool,
  not a release gate with altered budgets.

## Remaining

Select the five measured heaviest scenes, implement cause-based renderer changes, prove exact pixel
equivalence and same-host before/after FPS. Implement region/hero demand loading with URL-level cache,
small core, explicit coverage and actual-ready evidence before needed. No startup improvement, sound
coverage guarantee, renderer improvement, compression saving or Task 5 completion is claimed yet.

## QUESTIONS FOR DANIEL

- Sound quality: recommend retaining existing Ogg recordings and removing redundant fetch/decode work
  before considering another encode. Built payload measurements; no audio asset has been replaced.
- Renderer priority: recommend selecting scenes from the complete measured inventory. Built that
  profiler; existing release FPS/latency budgets remain intact.
