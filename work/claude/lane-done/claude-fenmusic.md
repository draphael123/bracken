# claude/fenmusic - THE FEN ROAD's level track is "Division By Zero" (creeping orcs), Bobjt, CC0

Base master 5e44cddd. Daniel's pick (10-22, candidate 1). Download: only the "creeping orcs" file from https://opengameart.org/node/87913 (3-creeping_orcs_-_division_by_zero_4.mp3, 960 KB, listed as its own file on the page, so the originals zip was not needed) into bracken-lanes/music-dl-1022fen (untrusted, nothing run from it). Page licence box: CC0.

- audio/fenroad.ogg (new, 987 KB): the creeping-orcs version (the main 2026 mix was NOT used). Source is 47.78 s; trimmed to 47.74 s (drops encoder-padding silence), 30 ms equal-power loop crossfade (tail onto head), limiter, -12.9 LUFS. Loop = the whole 47.74 s (TRACK_INTRO fenroad 0.03 s, same as chieftain/chase). The piece repeats a 17.89 s phrase (checked by autocorrelation), the file ends on a ringing fade and opens on a hit, so the wrap reads as a restart; not auditioned.
- src/fen-road.js: only the `music:` line, 'sleepers' -> 'fenroad'. Bog Troll arena keeps 'boss3'.
- 'sleepers' ("Void Estate") is now used by no level, but stays registered (Sound Test row, credit, file) - unchanged.
- Credits: MUSIC_CREDITS + MUSIC_CREDITS_ROW (src/audio.js), credits page row (src/credits.js CC_BY, CC0 row), audio/CREDITS.txt, Sound Test via MUSIC_NAMES.
- tools/boss-music.mjs: asserts fen road level = 'fenroad', Troll arena = 'boss3', 'fenroad' in Sound Test with Bobjt credit.
- Checks: boss-music ok; soundtest ok; audio-assets ok (48 levels/48 arenas/17 minis resolve, files on disk); textfit soundtest,credits --strict: 176 screens, all zero (TRUNCATED 0).

## QUESTIONS FOR DANIEL
1. The loop is only 48 s (all the creeping-orcs file offers). Rec: ship; listen on the road. Fallback is the 2026 main mix (longer, ~4+ min est.), one-file swap.
2. Peak: the source mp3 is hot, so the ogg is limited to about -12.9 LUFS (vs -12.7 elsewhere). Rec: fine.
