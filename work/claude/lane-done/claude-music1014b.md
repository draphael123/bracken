# claude/music1014b - The Eternal Sands (THE UNDERWELL), Kokopelli's Graveyard Theme (THE TOWPATH)

Downloads (Daniel approved exactly these; each licence re-read on the track's OWN page 10-14, both matched): kept outside the repo in bracken-lanes/music-dl-1014b/<underwell|towpath>/ (zip extracted with unzip into music-dl-1014b/towpath_x/; only the OGG used).

| level | track | licence | treatment | final |
|---|---|---|---|---|
| THE UNDERWELL (`underwell`, replaces Ossuary 6 - Air) | "The Eternal Sands", HitCtrl | CC-BY 3.0 | the author's own loop, whole file loops (115.2 s; both ends at full level, engine's 30 ms crossfade covers the seam); -0.8 dB + peak limiter | 1.79 MB, 115.2 s, stereo q4, about -13.1 LUFS |
| THE TOWPATH (`towpath`, was the in-code synth) | "Kokopelli's Graveyard Theme", Cleyton Kauffman | CC0 | the author's seamless 86.4 s loop (the zip's OGG), whole file loops; +13.2 dB + peak limiter (source was -25.7 LUFS) | 1.23 MB, 86.4 s, stereo q4, about -12.8 LUFS |

Wiring: TRACKS (+ MUSIC_NAMES 'towpath', MUSIC_CREDITS, MUSIC_CREDITS_ROW) in src/audio.js; src/credits.js (Ossuary row replaced by The Eternal Sands, new Towpath row); audio/CREDITS.txt (old Underwell line marked REPLACED, new block). Underwell level music id was already 'underwell' (file swapped); the drip/water bed is a separate synth ambience and untouched. Towpath's level already said music: 'towpath'; the Fog Knight's boss theme is untouched.

Checks: audio-assets --decode ok (117 files clean), boss-music ok, soundtest ok, modulepreload ok (15 not listed = at the budget of 15; no module added by this lane), dangling-paths ok, textfit credits --strict ok (0 findings). Reds: none.

UNVERIFIED: nobody listened. Eternal Sands' seam not auditioned; Kokopelli was limited hard (crest factor ~16 dB, +13 dB gain) so it is louder and flatter than the original.

## QUESTIONS FOR DANIEL
1. The Eternal Sands is lively; if too bright for a dry cistern, lowpass at 9 kHz or fall back to Desert Sanctuary (not downloaded). Rec: listen first.
2. Kokopelli's is slow and gentle; levelled to match the library. If too loud, lower TRACK_GAIN.towpath (not set). Rec: listen first.
3. ossuary file/credit for Kevin MacLeod no longer shipped (not played anywhere else); Sound Test shows the new names. Rec: nothing.
