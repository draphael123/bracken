# Task H — level music starts from the map (verification running)

Branch: `codex/musicstart`. Base: `origin/master` at `7ade0605`; `origin/claude/music1015` and its five new tracks were already in master.

## Cause and change

- Before: the map entry into Brackenwood requested `brackenwood`, but an intercepted failure of its first Ogg request left `select` playing for at least 10 seconds. There was only **one** request: `loadTrack` swallowed the failure and did not retry (`work/musicstart-before.log`, outside this checkout).
- `src/audio.js` now fades an old file track immediately when `play(name)` requests an unloaded file, cancels its loop, and disposes its sources after the fade. A load gets two retries with short backoff, and its first failure logs one warning per track. The requested track starts when decode succeeds, including a preload that was still pending at entry.
- The world-map cursor in `src/main.js` preloads a node's level track after the cursor rests there, caching the level-to-track lookup to avoid rebuilding the level on later visits.
- New `tools/music-start.mjs` fails only the first `brackenwood.ogg` fetch through CDP interception, proves preload begins while still on the map, enters the level from that node, checks the map track stops immediately, and waits up to 10 seconds for Brackenwood. It also requires a retry and exactly one warning. It is wired into `tools/check.mjs`.
- After: the new check passed with two requests and `brackenwood` playing after map entry (`work/musicstart-after3.log`, outside this checkout).

## Checks

- `audio-assets --decode`: 120/120 tracks decoded, zero bad; all 47 levels and boss arenas resolved to music (`work/musicstart-audio-assets.log`).
- `soundtest`: pass, including save unlock and reload (`work/musicstart-soundtest.log`).
- `boss-music`: pass; every tested synth loop repeats exactly (`work/musicstart-boss-music.log`).
- `shop-theme`: pass, all four shops on credited Ogg (`work/musicstart-shop-theme.log`).
- Scoped `textfit`, `mobile-perf`, and check-runner registration are still being verified.

## QUESTIONS FOR DANIEL

- Recommendation: merge this branch with the coordinator batch after the remaining checks. I built the fetch retry, immediate fade, cursor preload, and failure-injection test; no music, level design, or other game files changed.
