# hornetmusic (sonnet) - music for THE HORNET'S NEST
- Level: hornetnest.ogg = "Cathedral in the forest (ambient loop)" by congusbongus, CC0 (page re-read 10-23). 136.97 s, 3.0 s equal-power crossfade, loop returns to 3.0 s (TRACK_INTRO), +1 dB + limiter, -13.1 LUFS.
- Boss: hornetqueen.ogg = "Basilisk Boss Battle Loop" by beardalaxy, CC0 (page re-read 10-23). 33.41 s, author's own loop (30 ms xfade), -13.4 LUFS. Both hornetsnest arenas (arena, arena2) use it; the old 'queen' entry stays (old Hornet Queen).
- Buzz bed: synthesized in WebAudio (src/audio.js addBuzzBed; detuned saws, band-pass, 29 Hz wing-beat chop, hiss), always on under 'hornetqueen' at 0.03, swells (buzzSwell) on her wing-buzz, brood, cloakTell (+0.10, 1.6 s) and the cloak itself (+0.16, held 10 s). Bound in hornet-queen-hands.js SOUND. NOT heard by ear in this lane: levels are guesses, tune BED in audio.js.
- Credits: audio/CREDITS.txt, src/credits.js CC_BY rows, Sound Test rows (MUSIC_NAMES, MUSIC_CREDITS_ROW, MUSIC_CREDITS).
- Checks: boss-music ok (new asserts), audio-assets ok (--decode timed out in the slow browser, ffprobe decoded both files), soundtest ok, textfit credits+soundtest 0 findings (full textfit: mapcard scope hit the 480 s limit on this loaded PC, unrelated), level-quality hornetsnest music row ok.
## QUESTIONS FOR DANIEL
1. Buzz bed loudness - rec: keep subtle (0.03 base); built that. Listen in the Hornet Queen fight and say louder/quieter.
