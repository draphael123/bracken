# claude/musicmarsh - five picks wired (MARSH WOOD, FROG KING, STOCKADE CHIEFTAIN, BELLCRAB, CHASES)

Base: live master f84fd0c4. Converter: ffmpeg 9.0.2 (winget, on PATH) with the musicchurch recipe (end X s crossfaded onto start X s, loop returns to X via TRACK_INTRO, loudness set by ebur128, -1 dBFS limiter, libvorbis 112 kbps). Helpers in work/tmp-musicmarsh/ (uncommitted). Downloads untouched in scratch/music-dl-1019.

| key | file | source | treatment | final |
|---|---|---|---|---|
| marsh (new) | audio/marsh.ogg | Forest River Spirits, Tausdei CC-BY 3.0 | cut at 171.0 s (before fade-out), last 4 s xfaded onto first 4 s, loop returns 4.0 s; +9.5 dB (source was -22 LUFS, limiter bites a little) | 171 s loop, 2.3 MB, -13.8 LUFS |
| frogking (file replaced) | audio/frogking.ogg | Cloudmurk, Elyvilon CC-BY 4.0 | tempo found 80 bpm = 3.0 s bar; best bar-aligned loop 138-234 s (32 bars, 96 s; refine found zero drift); +3 s overlap xfaded onto head, loop returns 3.0 s; -2.0 dB | 99 s file / 96 s loop, 1.4 MB, -12.8 LUFS |
| chieftain (new) | audio/chieftain.ogg | Raiders March (loop), Bobjt CC0 | author's own loop, 30 ms xfade, loop returns 0.03 s; +1.9 dB | 62.4 s loop, 0.85 MB, -12.8 LUFS |
| bellcrab (new) | audio/bellcrab.ogg | Underwater Boss' Temple Song, Senor Moreno CC-BY 4.0 (FLAC) | cut at 88.0 s (before reverb tail), last 3.5 s xfaded onto first 3.5 s, loop returns 3.5 s; +2.8 dB | 88 s, 0.89 MB, -12.7 LUFS |
| chase (new) | audio/chase.ogg | Chase!, Wolfgang_ CC0 | author's loop (32 bars at 100 bpm), 30 ms xfade; +0.3 dB | 76.8 s loop, 1.1 MB, -12.8 LUFS |

Total added ~6.6 MB (frogking.ogg shrank 2.1 -> 1.4 MB). All seams sample-continuity checked (max step at loop point <= 0.015 except frogking's 0.42 = a downbeat drum hit, and chieftain/chase 30 ms joins). Other neighbours measure -11.3 (theme2/frogking/boss) to -12.7 (brackenwood/kingswood); boss2 is -6.9 (untouched).

## Wiring (each pick is one key/file swap)
- level.js MARSH WOOD music 'theme2' -> 'marsh'. Title region (src/title-region.js marsh row) also 'theme2' -> 'marsh' (my call: the region picture should sound like its level; revert that one word if Daniel wants Stage 2 on the title).
- Frog King arena already used key 'frogking' (Spring Spring Gyokaijuu): the file was REPLACED, no level edit. Gyokaijuu is gone from the game (CREDITS.txt line rewritten).
- level.js stockade arena (boss 'chief') 'boss2' -> 'chieftain'. boss2 still serves the Harbor Master (harbor-expansion) - untouched.
- deep-split.js bellcrab arena 'boss3' -> 'bellcrab' (boss3 still serves the Buried Dead).
- CHASES: scree-chase.js rockslide 'boss2' -> 'chase' and the ?chase=demo corridor in main.js 'boss' -> 'chase'. Other 'boss' uses untouched. (Spiral-stair/fallingtower chase plays its arena.music, not changed.)
- audio.js, all on their own new lines: TRACKS (+marsh, chieftain, bellcrab, chase), `Object.assign(TRACK_INTRO, ...)`, `Object.assign(MUSIC_CREDITS_ROW, ...)`, `MUSIC_NAMES.push(...)`, MUSIC_CREDITS entries (frogking line edited in place, 4 new). Credits page: CC_BY rows for marsh, frogking, bellcrab (chieftain/chase are CC0, parsed into the composer list from MUSIC_CREDITS; Bobjt and Wolfgang_ were already there). audio/CREDITS.txt block added. Non-ASCII n-tilde written "Senor" in game strings (pixel font), "Señor Moreno" in CREDITS.txt.
- tools/boss-music.mjs: asserts for marsh level, frog arena, chieftain arena and the credited Sound Test rows (own lines).
- MERGE NOTE for marsh2: my only touch on level.js is line ~504 (`music: 'marsh'`) and the stockade arena line ~729 (`music: 'chieftain'`); the frog arena line is NOT edited.

## Checks (node only)
- node --check on all touched src + boss-music.mjs: ok. audio-assets: ok (47 levels, 47 boss arenas, 17 minis, all tracks exist). audio-mix: 0 problems.
- boss-music.mjs: ok (incl. the new marsh/frog/stockade/credit asserts).
- !! Disclosure: my first check loop ran `soundtest`, `whatsnew` and `scree-chase` without noticing they launch headless Chrome (whatsnew ok, scree-chase ok, soundtest could not boot the page). They finished and exited on their own; I did not kill anything. Not run since: textfit (Chrome).

## Integ must run
textfit soundtest,credits --strict (new Sound Test rows marsh/frogking/bellcrab and the credits pages now have 3 more CC-BY rows: CCBY_PER 2 means the page count changes), soundtest, boss-music, audio-assets (--decode would verify the oggs), a listen to the five loops (nothing here was auditioned: marsh is calm/quiet and was lifted 9.5 dB).

## QUESTIONS FOR DANIEL (recs built)
1. Marsh level track is quiet orchestral (-13.8 LUFS after a big lift, ~2:51 loop); rec built as is. If it is too pretty for a bog, the swap is a one-file change (Mist Forest 1-3 is the alternative).
2. Title region marsh row follows the level ('marsh'); rec yes.
3. Frog King loop is 96 s of a 5:09 piece (bars 46-78); alternative cut: 162-246 s (84 s, higher similarity score).
