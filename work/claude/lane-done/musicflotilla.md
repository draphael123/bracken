# claude/musicflotilla - THE ADMIRAL'S CHAMPION gets "Pirate Indenture" (Eldritch Grim, CC0)

Base: origin/claude/flotilla2art ef203f11. Page licence box re-read 10-17: CC0. Downloaded exactly the one track (both its files: pirate_indenture.wav 6.7 MB, pirate_indenture_loop.wav 2.6 MB) into bracken-lanes/music-dl-1017flotilla (untrusted, nothing run from it).

- File: audio/admiral.ogg (new key 'admiral'). Full track's first 21.3 s (4 s build, then the opening variation) + the author's own 14.49 s loop file, joined at its opening hit. 35.8 s, 670 KB, ogg q5.
- Loop point: TRACK_INTRO admiral = 21.3 (the opening plays once, then the 14.49 s author loop; seam is the author's, ends/starts at zero).
- Loudness: boss -12.7 LUFS (source -13.2/-13.3; +0.7 dB, limiter, peak ~-0.0 dBFS). Level track flotilla.ogg is -28.2 LUFS (siblings: longwater -27.1, reef -24.5, hurricane -25.3), so it is in family with the level library, only ~3 dB under; NOT clearly below, so TRACK_GAIN.flotilla left alone. The level-to-boss step is ~15 dB, the library norm for bosses (captain -12.9, kraken -11.6).
- Wiring: level.js arena music 'champion' -> 'admiral'; admirals-champion-hands.js music() always plays 'admiral' (no phase swap; it is one track); audio.js TRACKS, TRACK_INTRO, MUSIC_NAMES ('champion' replaced by 'admiral'), MUSIC_CREDITS row; credits.js CC0 row; audio/CREDITS.txt. The code-composed 'champion' synth theme stays in boss-music.js, unused and out of the Sound Test.
- Checks: audio-assets ok; boss-music ok (asserts arena 'admiral', Sound Test + credit + loop point); admirals-champion ok (5 heroes); soundtest ok; textfit soundtest,credits --strict: admiral row fits; only red is the pre-existing gqueen row TRUNCATED (from musicgq).
- Not run: the fight live by ear; the full suite.

## Questions (recommendations)
1. The loop is 14.5 s, short for a long duel. Rec: ship; layer 'ambShip' via TRACK_LAYER if it tires.
2. Delete the unused 'champion' synth theme (boss-music.js)? Rec: leave until the tune lane merges, then remove in a tiny follow-up.
3. Level track flotilla at -28 LUFS vs bosses -12.7. Rec: leave for Daniel's ears; raise TRACK_GAIN.flotilla to ~1.5 only if the deck feels quiet.
4. gqueen Sound Test row truncates (pre-existing). Rec: shorten MUSIC_CREDITS_ROW.gqueen to '"Courtroom" — Spring Spring'.
