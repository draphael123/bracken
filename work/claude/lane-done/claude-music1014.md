# claude/music1014 - Sylvan Waltz (KINGSWOOD), Throne Room (HIGHCROWN), Deadly Ruins (THE BURIED CITY)

Downloads (Daniel approved exactly these; each licence re-read on the track's own page 10-14, all matched): kept outside the repo in bracken-lanes/music-dl-1014/<kingswood|highcrown|buriedcity>/. The zip was extracted with unzip, only the Loop folder's Deadly Ruins.wav used.

| level | track | licence | treatment | final |
|---|---|---|---|---|
| KINGSWOOD (id kings, was theme3) -> `kingswood` | "Sylvan Waltz", Otto Halmen | CC-BY 3.0 | intro (first 11.08 s) + main loop (86.08 s) in one file; main's 2.97 s audio tail laid over the loop head, intro's 3.66 s tail laid under the main's start (first pass only); plays the intro once then loops from 14.7447 s (TRACK_INTRO) | 1.73 MB, 100.8 s, stereo q4, -12.5 LUFS |
| HIGHCROWN (`highcrown`, replaces the shared 12 Music Loops file) | "Throne Room", Of Far Different Nature | CC-BY 4.0 | the single track does not loop: 8 s equal-power fade-loop (last 8 s crossfaded onto first 8 s); first pass plays the original opening, later passes loop from 8.0 s (TRACK_INTRO) | 2.10 MB, 129.8 s, stereo q4, -12.5 LUFS |
| THE BURIED CITY (`buriedcity`, replaces JaggedStone) | "Deadly Ruins", Some Weirdo | CC0 | the author's own 48.0 s loop wav, +1.7 dB with limiter, whole file loops | 0.55 MB, 48.0 s, stereo q4, -12.5 LUFS |

Wiring: TRACKS/MUSIC_NAMES/MUSIC_CREDITS/MUSIC_CREDITS_ROW/TRACK_INTRO in src/audio.js; level music id in src/level.js; credits page entries in src/credits.js (Of Far Different Nature shown as "Far Different Nature" in the names list to fit the column; the CC-BY page has the full name); audio/CREDITS.txt (new block + old highcrown/buriedcity lines marked replaced).

Checks: audio-assets ok (incl. --decode, 116 files clean), boss-music ok, modulepreload (7 not listed, within budget 15, unchanged), comments/homepaths/dangling-paths/soundtest/architecture ok, textfit credits --strict ok (first run truncated the long composer name; fixed with the alias), mobile-perf (title,map,wood) inside budget. Reds: none.

UNVERIFIED: nobody listened. Throne Room's crossfade is not tempo-aligned (the ending is loud, the opening quiet); Deadly Ruins' loop wraps from -0.05 to 0 (engine's 30 ms crossfade covers it).

## QUESTIONS FOR DANIEL
1. Throne Room loop: fade-loop built. If the crossfade sounds off, the artist's Loop Box #3 has a true loop (not downloaded, not approved). Rec: listen first.
2. theme3 ("Level 3", Juhani Junkala) is no longer played by any level (Kingswood left it); it stays in the Sound Test as an orphan. Same for the JaggedStone file (deleted from the repo) and the old Highcrown chiptune (replaced). Rec: leave.
3. Kingswood is a festive waltz; it is also the track while the goblin court hunts you. Rec: keep, swap if it reads too light.
