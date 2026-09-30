# fairmusic lane: the Harvest Fair's own music (eerie band organ)

Base: claude/housekeep a6d58b4. All synth, no files, no downloads (same route as underleaf/mineworks/deep: a track name with no TRACKS entry is played by the synth scheduler in src/audio.js).

## What changed
- src/audio.js: new synth block "THE HARVEST FAIR'S OWN MUSIC" (fairStep, pipe, glock, FAIR_LEAD/FAIR_HARM/WQ_HARM), a branch at the top of schedule()'s loop, `music.setTempo(m)` + `music.tempo`, exported `WQ_TEMPO`, both names added to MUSIC_NAMES (Sound Test; unlock-by-hearing works as for every track). The music box now plays under 'harvestfair' (it was gated on 'marketday').
- src/harvest-fair.js: level music 'marketday' -> 'harvestfair'; arena music 'houndmaster' -> 'wickerqueen'. ('marketday' stays for the other level that uses it.)
- src/main.js (2 tiny edits): WQ_TEMPO added to the audio import; one line in updateWickerQueen: `if (music.want === 'wickerqueen') music.setTempo(WQ_TEMPO[e.phase] || 1);`. Fight logic untouched.
- tools/audio-assets.mjs: 'harvestfair','wickerqueen' added to NO_FILE_BY_DESIGN. tools/harvest-fair.mjs: base-track assertion now expects 'harvestfair'.

## The tracks (described, not listened to)
- harvestfair: A minor, 3/4, 132 bpm, 16 bars (about 22 s), loops on a 96-step counter so there is no seam. Calliope = square + slightly sharp sawtooth pipe through a lowpass, sagging a different few cents flat each bar; oom-pah bass (triangle root on 1, square triad stabs on 2 and 3); sine glockenspiel counter-line (with a bell overtone) answering on beats 2/3 and running down at phrase ends; one quarter-tone-flat pickup note before the loop point as the "wrong note". Chords Am Am Dm Am F Dm E E / Am G F E Am Dm E Am.
- wickerqueen: same tune at 164 bpm, an octave of pipe under the lead, deep sine bass, drums (kick on 1, noise snare on 2 and 3, hat on the off-eighths, tom fill on the last beat of every fourth bar), darker harmony (bars 2 and 14 go to B-flat, bar 10 to G minor with the lead's B lowered).
- Winding-down music box: kept as the level's mechanic; it is only active under 'harvestfair' (stops when the boss track starts, as it did under houndmaster; resumes after the fight). I did not add a boss-death sting.

## THE TEMPO HOOK (for the coordinator / fairboss merge)
- `music.setTempo(m)` (from src/audio.js `music`): m is a multiplier on the current fair track's own speed, 1 = as written, clamped 0.6..2, eased in over about one bar (each 3/4 step moves a quarter of the way). `music.tempo` reads the target. `music.play(anything)` resets to 1.
- `WQ_TEMPO = [1, 1, 1.15, 1.32]` indexed by phase (1,2,3) is exported from src/audio.js and applied in main.js updateWickerQueen while `music.want === 'wickerqueen'`.
- If fairboss replaces updateWickerQueen / adds ring speed: call `music.setTempo(x)` each frame or on speed change, e.g. x = 1 + 0.32 * (ringSpeed - ringMin) / (ringMax - ringMin), or step values 1 / 1.15 / 1.32. If it renames phases, keep the one-line hook or move it. Only 'harvestfair'/'wickerqueen' respond to it.

## Checks (all green)
audio-assets, harvest-fair, wicker-queen, boss-fight-end, dangling-paths, homepaths, architecture, checkpoints, skins, slopes-trace (unchanged), npc-removal, hint-shown. No "music" check exists in tools/check.mjs beyond audio-assets. A mocked-AudioContext run of the scheduler (both tracks, tempo 1 and 1.32) ran without errors; note density rose about 33% at 1.32.

## UNVERIFIED
Nothing was heard; there is no headless audio render here (no browser AudioContext render was done to avoid load). Mix levels (pipe 0.14, boss 0.11, bass 0.34 through the 0.16 music bus) are set by reasoning against the other synth tracks, so it may need a volume nudge once listened to. Bot pilots not run (fight logic unchanged).

## QUESTIONS FOR DANIEL
1. Boss death: add a short winding-down music-box sting as the fight ends? Rec: yes, small, but later in a polish pass; not built.
2. Should the box keep playing over the band organ in the level? Rec: keep (built), lower it if it fights the glockenspiel.
3. Should the boss's final phase also drop the glockenspiel and detune the pipes further? Rec: wait until it has been heard.
