# claude/musicswap - real recordings for THE DEEP, UNDERLEAF and the Mineworks song

## What was found first (the brief's picture was out of date)
- No level played the synth tracks any more. UNDERLEAF's level data said `music: 'sleepers'` (Void Estate), THE DEEP's said `music: 'trench'` (Underwater Theme), and nothing at all plays `mineworks` (the Ore Road moved to its own `oreroad` recording on 09-23). The three synth names only lived in the Sound Test's list (and so could never be unlocked: unlock needs a level to play them).
- So "replace the synth" became: add real files under those three names, put the new songs on the levels that were meant to have them, and delete the dead synth code.

## What changed
- audio/deep.ogg - "Underwater Theme II" by CleytonKauffman (CC0), used whole, 104.72 s. THE DEEP now plays `deep` (was `trench`).
- audio/deepdread.ogg - "the_abyss" (Ambience of a Fallen Age) by Umplix (CC0): an 80.0 s section (source 0:30-1:50 plus a 6 s overlap), the last 6 s equal-power crossfaded onto the first 6 s, so it loops with no seam (last sample -0.073, first -0.071). Played under `deep` at half the track's gain.
- audio/underleaf.ogg - "Lush, Mossy Grotto" by Tarush Singhal (CC0), 137.14 s, 48 -> 44.1 kHz, 30 ms of encoder silence trimmed. UNDERLEAF now plays `underleaf` (was `sleepers`).
- audio/mineworks.ogg - "At Work (Loop)" by HorrorPen (CC-BY 3.0), 103.38 s. No level plays it (see questions).
- src/audio.js: TRACKS entries; a small generic `TRACK_LAYER` (deep -> deepdread, gain 0.5): the layer loops natively on the main track's own gain node, so it fades, ducks, muffles and stops with the track (verified in a real page: `deep` starts the 104.7 s track and an 80.0 s looping source; the other tracks start one source). Deleted the synth: HUSH/MINE/DEEP note tables, their step lengths and their three branches in `schedule()` (nothing else used them). MUSIC_CREDITS lines added.
- tools/audio-assets.mjs: mineworks, underleaf, deep removed from NO_FILE_BY_DESIGN.
- audio/CREDITS.txt: header and a new LEVEL MUSIC SWAP block with title, author, URL, licence (CC-BY credit line for At Work, and the abyss layer). docs/LEVEL-DESIGN-GUIDE.md: "CC0 only" -> "CC0, or CC-BY with a credit line: Daniel 10-01".

## Loop points and loudness (EBU R128, whole file)
| file | length | loop | before | after (integrated / peak) |
|---|---|---|---|---|
| deep.ogg | 104.72 s | the composer's seamless loop, whole file | -17.3 LUFS | -12.5 / -0.7 dBFS |
| underleaf.ogg | 137.14 s | the composer's loop (starts and ends mid-music at -25..-28 dB, no gap) | -20.3 LUFS | -12.6 / -0.6 dBFS |
| mineworks.ogg | 103.38 s | the composer's loop (tail fades to -35 dB, head -20 dB, no gap) | -16.9 LUFS | -12.3 / -0.5 dBFS |
| deepdread.ogg | 80.00 s | crossfaded loop, 0:00 = source 0:30 | -27.1 LUFS | -20.8 / -7.3 dBFS (then x0.5 in play = about -27 LUFS, ~14 dB under the music) |
Library for comparison: sleepers -11.8, trench -12.9, oreroad -10.6, witchlight -12.7, barrows -11.7. Gain is in the file (TRACK_GAIN stays 1.0). The engine's 30 ms equal-power loop crossfade covers the small step at the ends (Underwater II: last sample 0.026, first 0.000).
OGG Vorbis q4, 44.1 kHz stereo (deepdread q3), same as the rest.

## Checks (all run alone, named)
audio-assets ok, soundtest ok (both parts), boss-music ok, level-quality ok (every gated level clears the bar), dangling-paths ok, architecture ok, comments ok, homepaths ok, textfit: `textfit soundtest --strict` ok (0 truncated). The full `textfit` run timed out at 560 s on this loaded PC, so only its soundtest screens were run (they are the only screens this change touches).
Sound Test credit lines are shortened to fit one row (they were truncated): "Underwater II - C. Kauffman", "Mossy Grotto - Tarush Singhal", "At Work - HorrorPen (CC-BY)". CREDITS.txt has the full text.

## UNVERIFIED
- Nobody has listened to it: levels, loop seams and the dread layer's balance were measured, not heard. The 0.5 layer gain is a guess from loudness numbers.
- The Deep's existing ambient bed (ambDeep) plays too; the three layers together were not mixed by ear.
- Browser decode of the new files was only exercised through music.play (it decoded and played); `audio-assets --decode` not run.

## QUESTIONS FOR DANIEL (recommendation first; conservative option is what is built)
1. Which level should play "At Work" (mineworks)? None does today; built as a Sound Test song only, so it stays "???" until some level plays it. Rec: the Ore Road, as the track for its mine section, or keep oreroad and give At Work to a future mining level. Not changed: the Ore Road's own track (oreroad) and its tests are untouched.
2. THE DEEP and UNDERLEAF now play the new songs, so "Underwater Theme" (trench.ogg) and "Void Estate" (sleepers.ogg) have no level any more: they remain in the Sound Test but can only be heard via old saves. Rec: keep the files; reuse them as a mini/boss or a future level's track, or retire them (delete files + MUSIC_NAMES entries) if you do not want orphans.
3. Is "At Work" CC-BY credit enough on the Sound Test row alone, or should it also be on the credits/title screen? Rec: add one "Music credits" line to the credits screen when you want to ship (CREDITS.txt already has the full attribution and licence link).
4. Dread layer volume: 0.5 (about 14 dB under the music). Rec: keep, then adjust by ear in `TRACK_LAYER` in src/audio.js (one number).
