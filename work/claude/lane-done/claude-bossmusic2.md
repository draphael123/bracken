# claude/bossmusic2 - lane report (2026-09-30)

Daniel approved three more synth boss themes, built like 'archmage' in src/boss-music.js (no file, nothing downloaded, own gain
BOSS_SYNTH_GAIN). Based on claude/bossmusic (be4961bd).

## What changed
- src/boss-music.js: three new themes ('drownedking', 'winchmaster', 'gargoyle') and a shared `bell()` voice; registered in
  BOSS_SYNTH_BASE and SYNTH_BOSS (the audio.js scheduler needed no change).
- Arenas: keep (level.js) -> 'drownedking', oreroad (ore-road.js) -> 'winchmaster', witchlight (witchlight.js) -> 'gargoyle'
  (were boss3, boss3, boss4).
- audio.js MUSIC_NAMES (this is also the Sound Test list, the way 'archmage' was added) and tools/audio-assets.mjs
  NO_FILE_BY_DESIGN gain the three names.
- tools/boss-music.mjs: asserts the three arenas' music (fails on the old values: confirmed by putting witchlight.js back to
  boss4, which failed "the Gate Gargoyle's arena is not on his stone-grind theme"), runs all six voicings on the mock
  AudioContext (no throw, density, loop repeats note for note across the seam, no hole over 2 steps - 3 for the 6/8 dirge, whose
  beats are 3 eighths apart), and asserts no two themes play the same notes.

## The three tracks (I cannot listen; this is what the code plays)
**drownedking** - G minor, 6/8 (two dotted beats of three eighths), dotted-quarter = 50, eighth 0.4 s, 16 bars = 38.4 s, 7.6 osc/s.
- Bars 1-8, the flooded hall: a sawtooth drone on the root under a lowpass at 260 Hz (plus a sine an octave up), a bell tolled on
  the one of every other bar (inharmonic sine partials, 4.5 s ring), a low choir (three detuned saws, lowpassed dark, slow attack,
  two bars a breath) on Gm - Eb - Cm - D, a slow triangle lament (D Bb C / Bb G / G Eb F / F# D A), sine bass rocking on beats 1 and 4,
  and a high sine water-drip every third bar.
- Bars 9-16, THE SURGE (built in; nothing tells the music when he lets go): the choir is fuller and brighter and doubled an octave
  up, a soft saw doubles the tune an octave up, the drone louder, drums in (kick on the one, tom plus a cracked noise on the four,
  small pickup toms), and bar 16 has a falling tom roll and the big low bell to end the loop.
**winchmaster** - E minor with major chords on C, D, G and B, 12/8 (four dotted beats), dotted-quarter = 132, eighth 0.152 s, 16 bars = 29 s, 14.3 osc/s.
- Percussion: a chain rattle (high noise) on every eighth, accented on the beats; the anvil (inharmonic 880 Hz bell plus a noise
  clang) on beats 2 and 4; kick on 1 and 3; in the second half a cart-wheel slap on the off beats.
- A pumping sawtooth bass on every dotted beat; the driving brass riff (scooped sawtooth through a lowpass, seven hits a bar, root
  root third third fifth fourth third, same rhythm every bar, re-rooted Em Em C D Em G Am B), doubled an octave up in the second half.
- The ratcheting winch: square ticks on the last beat of every fourth bar that double up, 1-2-3-4 ticks a step, rising in pitch;
  in the second half a two-tick ratchet on the last beat of every bar. The loop ends on one more anvil (the winch locking off).
**gargoyle** - C with Db and Gb (the tritone), 4/4 at 66, eighth 0.455 s, 16 bars = 58 s, 7.4 osc/s.
- The stone ostinato: a dry low sawtooth plus a sine, C C C Db C on the same pulse every bar, with one note bent to the tritone at
  the end of each four-bar phrase; a long slow noise scrape on beats 1 and 3; a deep thud on every quarter (never stops).
- Tritone stabs: C3 + Gb3 + C4 squares, detuned, on beat 3 of every second bar (every bar, and again on the last eighth, in the
  second half). The great bell (C3, 6 s) on the one of each four bars; a falling peal of four bells (Gb Eb C Ab) in the second half of
  every fourth bar; a stone clack on 2 and 4 and a bell on the Gb in the second half; a four-bar low breath of saws underneath.

## Checks (named runs only)
See the list in the final message / below.

## QUESTIONS FOR DANIEL (recommendation first)
1. The Drowned King's surge is on a timer (second half of the 38 s loop), not on his real phase change ("HE LETS GO"). A hook
   (music.play('drownedking:surge') from his phase 2 start) needs a small main.js edit. Rec: leave the built-in swell; add the hook
   only if the timer feels wrong after you hear it.
2. Levels are unchanged: loudness (0.62) is shared with the other synth themes and may need +-20% after a listen.
3. Remaining shared tracks: boss (Hornet Queen), boss2 (Chieftain, Harbor Warden), boss3 (Diving Bell, Buried Dead). Rec: Buried Dead
   next, then the Wicker Queen.
