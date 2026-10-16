# Task E — boss rates speed

Branch: `codex/bossrates-speed`. Base: `origin/master` at `7ade0605` (BATCH96).

## Changes and evidence

- The old `runFights` already reused one browser **per worker**. Its costly step was `pg.reload()` for every seed, after the first page load on each browser. A three-seed Scree profile measured browser boot at 5.9 s, reloads at 5.7/6.8/9.9 s, and fight simulation at 3.5/3.5/3.0 s (`work/bossrates-profile-before.log`, outside this checkout).
- `tools/cdp.mjs` now accepts an explicit borrowed browser port and exposes the port on a page. `tools/boss-run.mjs` owns one browser and runs each seed in a fresh disposable context, with workers drawing from the shared queue. No `boss-rates.mjs` CLI or row-output changes.
- Before: `unburied` (Death Knight), `welltown` (Cistern Queen), and `scree` (Ram Lord), three heroes and 12 practiced seeds each, `--profile=human --jobs=2`: 108 rows, no runner errors, 741.3 s wall (`work/bossrates-before.json` and `.log`, outside this checkout).
- First post-change smoke: Scree knight seeds 1–3 matched the baseline row objects byte for byte, including outcomes and fight times (`work/bossrates-smoke.json` and `.log`, outside this checkout).
- After: the same 108 fights at `--jobs=2` completed in **515.5 s**, saving 225.8 s (30.5%). The seeded JSON rows matched **exactly**, including every outcome, fight time, health, bot statistic, and loadout; fight-time difference was zero frames (`work/bossrates-after.json` and `.log`, outside this checkout).
- A three-seed post-change profile measured fresh-context boot at 5.2/5.6/4.5 s, simulation at 3.3/3.4/3.3 s, and context disposal at 11–15 ms (`work/bossrates-profile-after.log`, outside this checkout). The per-seed reload was the main time saved.

  | Boss row | Knight wins | Warden wins | Pyro wins | Largest fight-time difference |
  | --- | ---: | ---: | ---: | ---: |
  | `unburied` (Death Knight) | 6/12 | 12/12 | 8/12 | 0 frames |
  | `welltown` (Cistern Queen) | 12/12 | 12/12 | 12/12 | 0 frames |
  | `scree` (Ram Lord) | 7/12 | 5/12 | 12/12 | 0 frames |

- Read-only Chrome process samples during the full run showed one BRACKEN `look` profile at **3.08, 3.20, 2.41, and 1.74 GB** of working set, with no upward trend. Budget **4 GB for `--jobs=2`** beside a full suite on a 16 GB release PC; this is a measured operating recommendation, not a hard software cap. This development host has 32 GB and the run did coexist with Task D's serial suite; a 16 GB host trial remains unverified.

## Checks

- `node --check tools/cdp.mjs` and `tools/boss-run.mjs`, `git diff --check`, three-seed smoke, and the 108-fight baseline/post-change runs passed. No ERR rows in either full run.

## QUESTIONS FOR DANIEL

- Recommendation: use `--jobs=2` and reserve 4 GB for boss rates when a full suite is running on the 16 GB release PC. I built single-browser context reuse, retained the CLI/output format, and proved all 108 rows unchanged. A run on the actual 16 GB PC would confirm the memory recommendation.
