# claude/musicgq - THE GOBLIN QUEEN gets her own music (court, judgement, entrance) + the escape loop reserved

Based on claude/music1015 (not yet in master). Downloads (Daniel approved exactly these four files, 10-15; each page's licence box re-read 10-16, all matched): kept outside the repo in bracken-lanes/music-dl-1015gq/<courtroom|sting|escape>/; verified Ogg Vorbis/WAV; nothing run from there.

| id | file | source, licence | treatment | final |
|---|---|---|---|---|
| gqueen | audio/gqueen.ogg | "Courtroom" Spring Spring CC0 + first 12 s of "Sinister Boss Appears!" cynicmusic CC0 | entrance cut to 12 s, 2.5 s fade, overlapped 2 s onto Courtroom; Courtroom's last 4 s crossfaded onto its first 4 s; first pass plays entrance + opening, later passes loop from 14.0 s (TRACK_INTRO); +0.9 dB, limiter | 1.75 MB, 119.7 s, -12.5 LUFS, peak -1.3 |
| gqjudge | audio/gqjudge.ogg | "Judgement" Spring Spring CC0 | last 4 s crossfaded onto first 4 s, loop from 4.0 s; +7.7 dB (src -19.2), limiter | 1.27 MB, 130.3 s, -12.6 LUFS, peak -1.1 |
| gqescape | audio/gqescape.ogg | "Frantic Game Play (Looping)" Eric Matyas CC-BY 3.0 | 2 s self-crossfade, loop from 2.0 s; +4.9 dB (src -16.7), limiter. Registered, credited, in the Sound Test; NOTHING plays it | 0.61 MB, 40.2 s, -12.6 LUFS, peak -0.8 |

Wiring: level 'crown' arena music 'goblinroyal' -> 'gqueen' (src/level.js); at her phase 1->2 (66% hp, "THE STORM COMES IN", src/main.js gqueen update) music.play('gqjudge') - the existing playFile fades the old track under the new one (cheap crossfade); phase 3 keeps Judgement. A death/retry restarts on 'gqueen' via the arena music at wake. King Gorm untouched ('gorm'). 'goblinroyal' synth left in boss-music.js, still in MUSIC_NAMES/Sound Test (no arena uses it now; kept because tools reference it).
Entrance sting: no separate one-shot mechanism needed - it is baked into gqueen.ogg ahead of the loop (TRACK_INTRO), so it plays once per fight start.

Credits: MUSIC_CREDITS + MUSIC_CREDITS_ROW + MUSIC_NAMES (gqueen, gqjudge, gqescape) in src/audio.js; three rows in src/credits.js CC_BY (Spring Spring, cynicmusic, Matyas); audio/CREDITS.txt block at the end.

Tests touched (updated to the new truth, not weakened): tools/boss-music.mjs - crown arena now asserts 'gqueen' (was 'goblinroyal'); new assert that the three tracks are in the Sound Test with credits; log line reworded.

Checks (PORT 8964, single runs): audio-assets --decode ok (123 files clean; first attempt hit the 121 s CDP timeout under suite load, passed on retry), boss-music ok, soundtest ok, textfit credits+soundtest --strict ok (0 findings), modulepreload ok (8 unlisted of budget 15, unchanged), comments ok, homepaths ok, dangling-paths ok. Reds: none.

UNVERIFIED: nobody listened. Seams are crossfades, not tempo-aligned: Courtroom ends on a loud climax (-8 dB) and crossfades into its steadier opening; Judgement has a quiet dip near 100 s; the 12 s cut of the entrance (the original is a 44 s piece that ends in silence) is a time cut, not a musical phrase. The Judgement switch is a plain fade, not beat-matched.

## QUESTIONS FOR DANIEL
1. Entrance length: I used 12 s of the 44 s "Sinister Boss Appears!" (fade-out). Rec: listen; if you want the whole 44 s as a slow build, or none, it is a re-bake of gqueen.ogg and TRACK_INTRO.
2. Judgement from phase 2 (66%) or only phase 3 (33%)? Rec: phase 2 as built (one-line change in main.js).
3. Courtroom's climax-then-crossfade loop point: if it sounds abrupt, loop on a shorter span (cut before the climax). Rec: listen first.
4. 'goblinroyal' synth is now unused by any arena. Rec: leave it (Sound Test entry, tests) until a later cleanup.
