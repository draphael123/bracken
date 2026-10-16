# Task H — level music starts from the map

Branch: `codex/musicstart`. Base: `origin/master` at `7ade0605`; `origin/claude/music1015` and its five new tracks were already in master.

## Cause and change

- Before: the map entry into Brackenwood requested `brackenwood`, but an intercepted failure of its first Ogg request left `select` playing for at least 10 seconds. There was only **one** request: `loadTrack` swallowed the failure and did not retry (`work/musicstart-before.log`, outside this checkout).
- `src/audio.js` now fades an old file track immediately when `play(name)` requests an unloaded file, cancels its loop, and disposes its sources after the fade. A load gets two retries with short backoff, and its first failure logs one warning per track. The requested track starts when decode succeeds, including a preload that was still pending at entry.
- The world-map cursor in `src/main.js` preloads a node's level track after the cursor rests there, caching the level-to-track lookup to avoid rebuilding the level on later visits.
- New `tools/music-start.mjs` fails only the first `brackenwood.ogg` fetch through CDP interception, proves preload begins while still on the map, and holds the retry response until after entry. It checks that the map track stops **while the level file is still unloaded**, then releases the retry and waits up to 10 seconds for Brackenwood. It also requires exactly one warning. It is wired into `tools/check.mjs`.
- After: the strengthened check passed with two requests and `brackenwood` playing after map entry (`work/musicstart-after-held.log`, outside this checkout).

## Checks

- `audio-assets --decode`: 120/120 tracks decoded, zero bad; all 47 levels and boss arenas resolved to music (`work/musicstart-audio-assets.log`).
- `soundtest`: pass, including save unlock and reload (`work/musicstart-soundtest.log`).
- `boss-music`: pass; every tested synth loop repeats exactly (`work/musicstart-boss-music.log`).
- `shop-theme`: pass, all four shops on credited Ogg (`work/musicstart-shop-theme.log`).
- Scoped `node tools/check.mjs textfit`: pass, 0 pictures, 234.6 s (`work/musicstart-textfit.log`).
- `node tools/check.mjs music-start`: pass, 21.3 s (`work/musicstart-check-runner.log`).
- `mobile-perf`: the first full run had map at 58.8 fps but Red Gorge at 38.2 fps against its unchanged 40 fps budget (`work/musicstart-mobile-perf.log`). A focused Red Gorge run on the unmodified game base passed at 57.1 fps (`work/musicstart-base-redgorge.log`). A second **full** run on this branch passed unchanged: map 60.0 fps, wood 58.4, Well Town 56.3, Red Gorge 43.6, and the check's structural/input guards green (`work/musicstart-mobile-perf-2.log`). The initial borderline red was not hidden or used to change the budget.
- `node --check` for the edited JS files and `git diff --check` passed. Task H is ready for the coordinator batch.

## QUESTIONS FOR DANIEL

- Recommendation: merge this branch with the coordinator batch. I built the fetch retry, immediate fade, cursor preload, and failure-injection test; no music, level design, or other game files changed.
