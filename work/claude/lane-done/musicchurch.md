# claude/musicchurch - THE LIT CHURCH gets three new tracks and a zone switch

Base: origin/master b74ce76e. Downloads (Daniel approved exactly these three; each page's licence box re-read 10-17) in bracken-lanes/music-dl-1017church (outside the repo, untrusted, nothing run from it): Wendale Abbey CC-BY 4.0, Crypt CC-BY 3.0, Final Confrontation CC-BY 4.0. Only the audio files were fetched (not the 9 MB Wendale FLAC/MIDI zip).

| id | file | source | treatment | final |
|---|---|---|---|---|
| litchurch | audio/litchurch.ogg (replaces Umplix "Cathedral") | "Wendale Abbey" - Yubatake, 88.4 s | fade-out cut at 84.0 s, last 5 s equal-power crossfaded onto the first 5 s; loop returns to 5.0 s (TRACK_INTRO litchurch: 5.0); +5.0 dB, limiter | 84.0 s, -12.5 LUFS, 690 KB |
| churchcrypt | audio/churchcrypt.ogg (new) | "Crypt" (Dark Loop.mp3) - Machine, 69.9 s | original seam was NOT clean (ends -14.5 dB, starts -25 dB), so last 3 s crossfaded onto first 3 s; loop returns to 3.0 s (TRACK_INTRO churchcrypt: 3.0); +3.2 dB, limiter | 69.85 s, -12.8 LUFS, 998 KB |
| paladin | audio/paladin.ogg (replaces Centurion_of_war "Church combat") | "Final Confrontation" - tcarisland, 168 s | 5 s fade-out cut at 165.0 s, last 4 s crossfaded onto first 4 s (the opening hit lands on the closing chord's tail); loop returns to 4.0 s (TRACK_INTRO paladin: 4.0); -2.4 dB, limiter | 165.0 s, -12.6 LUFS, 2.4 MB |

Loop seams: sample-continuity checked at each file end vs its loop point (max sample step 0.004-0.06, no click). Wendale is the one to listen to: 84 s of reverb-soaked chant looping every 79 s after the first pass.
Old tracks: "Cathedral" and "Church combat" were referenced only by litchurch/paladin (lit-church.js, paladin-boss.js, credits); both overwritten, nothing else used them.

## Zone switch
src/lit-church-hands.js update(): the room the hero stands in (roomAt) is looked up each frame; the four crypt rooms (CRYPT_ROOMS: ossuary, vault, altar, well - the undercity, structural, not the lamps' lit/dark state) ask for 'churchcrypt', every other room for 'litchurch'. It calls ctx.zoneMusic (src/main.js), which does music.play(n) (the engine's usual crossfade, like the Goblin Queen's gqjudge swap) only when state is 'play', no boss and no mini is active, and the current track is one of the two church tracks - so it never overrides a fight, a chase or a menu. After a boss or mini ends, the game's own music.play(L.music) restores 'litchurch' and the next frame re-applies the zone. THE DEACON's mini (src/lit-church.js L.mini.music = 'churchcrypt') fights on the Crypt track; the Paladin's arena music stays 'paladin'.

## Credits
MUSIC_CREDITS (litchurch, churchcrypt, paladin), MUSIC_CREDITS_ROW (short Sound Test rows), MUSIC_NAMES (all three are new Sound Test rows; litchurch/paladin were not listed before), credits page CC_BY rows (Cathedral/Church combat rows replaced, Crypt added), audio/CREDITS.txt (the 10-08 block replaced).

## Checks
- boss-music ok (new asserts: church arena 'paladin', level 'litchurch', mini 'churchcrypt', credited Sound Test rows)
- lit-church ok, 357 checks (credit and zone-switch asserts updated/added)
- soundtest ok; audio-assets ok; textfit soundtest,credits --strict: OVERFLOW 0 TRUNCATED 0 (all clean)
- live probe (scratch/musicchurch-1017/zonecheck.mjs, not committed): start litchurch; ossuary, vault, altar, well -> churchcrypt; nave, graveyard, crossing -> litchurch.
- Not run: the Deacon fight live, a full suite. Loudness: all three -12.5..-12.8 LUFS as the brief asked, but the old church level track was about -20 LUFS, so the nave is now much louder than it was.

## Questions (recommendations)
1. Level tracks at -12.5 are loud next to the rest of the level library (-15 to -24). Rec: leave for Daniel's ears; if the nave is too forward, lower TRACK_GAIN litchurch/churchcrypt to ~0.7 rather than re-encoding.
2. Wendale Abbey is lo-fi and 84 s. Rec: ship; if it tires, layer ambient 'cave' under it via TRACK_LAYER.
3. The Graveyard and Chantry play the nave track; the graveyard is dark/outdoor. Rec: leave (Daniel asked for undercity/crypt only), or add 'graveyard' to CRYPT_ROOMS.
