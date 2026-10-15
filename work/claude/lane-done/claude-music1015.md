# claude/music1015 - five tracks: KING GORM, the shops, title/menu, BRACKEN WOOD, THE MAGE'S FOLLY

Downloads (Daniel approved exactly these, 10-15; each licence re-read on the track's own page today, all matched; The Bard's Tale shows CC0): kept outside the repo in bracken-lanes/music-dl-1015/<gorm|shop|menu|brackenwood|folly>/; verified WAV/Ogg Vorbis, sizes as listed. Nothing run from those folders. All final files: OGG Vorbis q4 stereo 44.1 kHz, loudness-matched to the library's -12.5 LUFS (ebur128, peak limiter at -1 dBFS).

| slot | file / wiring | track, licence | treatment | final |
|---|---|---|---|---|
| gorm | audio/gorm.ogg; kings arena (KING GORM) music 'goblinroyal' -> 'gorm'; the Goblin Queen (crown) keeps the synth 'goblinroyal' | "Determined Pursuit (epic orchestra loop)", Emma_MA, CC0 | author's loop, whole file loops; +0.3 dB (src -12.8) | 1.76 MB, 108.0 s, -12.5 LUFS |
| shop | audio/store.ogg (id 'store', all 4 shops); store.wav deleted; TRACK_GAIN store 1.8 removed (it was for the quiet synth) | "Medieval: The Bard's Tale", RandomMind, CC0 | author's loop wav, whole file loops; -0.5 dB (src -12.0) | 0.89 MB, 57.7 s, -12.6 LUFS |
| menu | audio/select.ogg replaced in place (id 'select' stays: menuTrack() default, titleTrack, map, the store's "Stage Select" music item, and the 3 yard levels with music 'select' all keep working) | "A Small Fire Will Do (Calming Loop)", Trex0n, CC0; courtesy credit Cal McEachern + link | author's 24-bit loop, whole file loops; +9.6 dB with limiter (src -22.1) | 0.84 MB, 64.0 s, -12.7 LUFS |
| brackenwood | audio/brackenwood.ogg; level 'wood' music 'theme' -> 'brackenwood' | "(Orchestral) Round Glasses", Clement Panchout, CC-BY 4.0 | not a loop (starts quiet at -21 dB, ends loud): last 4 s equal-power crossfaded onto the first 4 s; first pass plays the original opening, later passes loop from 4.0 s (TRACK_INTRO); -0.5 dB | 1.13 MB, 61.3 s, -12.7 LUFS |
| folly | audio/folly.ogg; level 'mage' music 'musUnder' -> 'folly'; the Archmage keeps his own theme | "Loop: Lonely Witch", HorrorPen, CC-BY 3.0 | author's loop, whole file loops; -2.6 dB (src -9.9, much hotter than the library) | 0.89 MB, 55.4 s, -12.5 LUFS |

Title/forest: titleTrack() is unchanged (still null for the forest region, so the title there plays menuTrack(), i.e. the new menu tune). The wood LEVEL was not on the menu tune: it played 'theme' (Stage 1 chiptune), now 'brackenwood'. 'theme' is still used by the desert hook and as a fallback.

Credits: MUSIC_CREDITS (+ MUSIC_CREDITS_ROW for the Sound Test) in src/audio.js; five rows in src/credits.js CC_BY (credits page; Trex0n row names Cal McEachern); audio/CREDITS.txt (new block at the end, old Stage Select and Warm Counter lines marked replaced); MUSIC_NAMES gains gorm, brackenwood, folly.

Tests touched (updated to the new truth, not weakened): tools/boss-music.mjs (kings arena now 'gorm'; crown still 'goblinroyal'); tools/shop-theme.mjs (asserted the old 22 kHz PCM store.wav; now asserts 4 shops on 'store' and a stereo 44.1 kHz Ogg Vorbis store.ogg wired in audio.js and credited).

Checks (PORT 8946): audio-assets --decode ok (120 files clean), boss-music ok, shop-theme ok, soundtest ok, textfit credits+soundtest --strict ok (0 findings), modulepreload ok (8 unlisted of budget 15, same as master without the lane; no module added), comments ok, homepaths ok, dangling-paths ok. Reds: none. No whatsnew edit (not this lane's).

UNVERIFIED: nobody listened. Round Glasses' fade-loop is not tempo-aligned (loud ending dips into the quiet opening); A Small Fire Will Do was boosted +9.6 dB with a limiter (calm piece, now at library loudness: may feel loud for a menu); the Lonely Witch and Bard's Tale loop seams not auditioned.

## QUESTIONS FOR DANIEL
1. A Small Fire Will Do is levelled to -12.5 LUFS like everything else; if too loud for a menu, add TRACK_GAIN.select ~0.6. Rec: listen first.
2. The Trex0n page asks for "a link to what you've created": the credit names Cal McEachern but there is no game URL to link yet. Rec: add the link when BRACKEN has a public page.
3. Round Glasses loop: if the crossfade sounds off, a shorter fade (2 s) or a different loop point is a one-line change. Rec: listen first.
4. Juhani's "Stage Select" and the "Warm Counter" synth are no longer shipped (select.ogg/store.wav replaced); Stage 1 ('theme') and MintoDog's musUnder remain for other uses. Rec: nothing.
