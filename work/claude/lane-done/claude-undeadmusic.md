# claude-undeadmusic (Sonnet)

## What changed
1. THE UNDEAD ARCHMAGE'S OWN SOUND. `'archmage:undead'` in src/boss-music.js is no longer a filtered copy of the living theme. It is a corrupted echo of it:
   - the SAME spell motif (three notes climbing the chord on the last three eighths of the 7/8 bar) so he is recognisable;
   - SLOWER: eighth 0.30 s against 0.17 s, loop 33.6 s against 19 s (own step and length via a new `SYNTH_VARIANT` table, because the scheduler used to share one clock between a theme and its voicing);
   - A SEMITONE FLAT (everything x 2^(-1/12)), and DARKER: the fifth of every organ chord is dropped another semitone (a Locrian cloud), the held last motif note slips a semitone more at each four-bar phrase end, and every motif note drifts up to about 20 cents out of tune;
   - NEW VOICES: detuned pipe organ (wide-detuned saws, 4-foot square in the second half) carrying chords and motif; low choir (the chord itself, not an octave up) every four bars; BONE PERCUSSION (a dry knock on the one, clicks on the 2 and the 4 a hair early or late, a rattle of three before each phrase turns); a slow bell tolling every other bar, a note below the living one. No harpsichord, no timpani.
   - Randomness is seeded by the step number only, so the loop repeats exactly (the check proves it).
   - Still wired everywhere it played: fallingtower arena music (fight + chase). Level matches the living theme: both go through BOSS_SYNTH_GAIN, note volumes kept in the same range.
   - SOUND TEST: `'archmage:undead'` is now its own entry in MUSIC_NAMES (after `archmage`), no credit line, so it shows 'made for BRACKEN'. It unlocks when you hear it (the heard hook now receives the full name; before, hearing the undead voicing unlocked the living entry). audio-assets' NO_FILE_BY_DESIGN lists it.
2. CREDIT FIX: the credit in MUSIC_CREDITS was RIGHT; the comment above it was wrong. Evidence: `git log -- audio/stormharbor*` shows b6e35e7c (2026-09-19) added stormharbor.wav (synthesised, Codex) and cad146c6 (2026-09-20) deleted it and added audio/stormharbor.ogg; CREDITS.txt lines 135-139 say the .ogg is "wowchapter1.ogg" from "War on Water: Tracks" by yd (CC0). What disagreed was CREDITS.txt line 130 (the 09-19 synth note, never marked superseded) and the audio.js comment claiming stormharbor/underkeep/fallingtower/burial were synthesised for the game. Fixed both texts; the Sound Test line stays '"wowchapter1" — yd'. underkeep, burial, fallingtower are likewise CC0 recordings now (same history), so their credits stay.

## Checks (named only, no bot pilots)
boss-music, audio-assets, soundtest, textfit, dangling-paths, architecture, comments: see the final message for results.
boss-music extended: the undead theme must be slower (step and loop >= 1.4x), a semitone flat (Db3 and Ab2 present), free of the living theme's triangle harpsichord voice, and have >= 40 dry clicks a loop and 4x the living theme's. PROVED RED on master 6b12a26c's src/boss-music.js: "the undead theme is not slower (step 0.17 s against 0.17 s)".
Numbers: undead 33.6 s, 15.7 osc/s (living 19 s, 21.4 osc/s).

## UNVERIFIED
Nobody has listened to it: I can only prove structure under a mock AudioContext. Daniel should hear it in the Sound Test (unlock by fighting him or editing the save).

## QUESTIONS FOR DANIEL
1. Tempo/darkness: built at eighth 0.30 s (about 1.75x slower). Rec: keep; if it drags in the long chase, try 0.25 s (one constant, UD_STEP).
2. Should a player who has only heard the undead theme also unlock the living 'archmage' entry? Rec: no (built: each entry unlocks on its own).
3. Give the Sound Test entry a nicer label than the raw id 'archmage:undead'? Rec: leave; all rows show raw ids.
