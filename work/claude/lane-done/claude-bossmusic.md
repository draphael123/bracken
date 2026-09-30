# claude/bossmusic - lane report (2026-09-30)

Daniel: the Archmage and the Undead Archmage have no theme of their own, nor do the Goblin King and Queen; they may share one
each, different from the standard boss music. The Kraken has its own.

## What changed
- NEW `src/boss-music.js`: two synth themes with no file, run by the audio.js step scheduler (`SYNTH_BOSS`). audio.js: two names
  in MUSIC_NAMES, the scheduler branch, and a loudness hook (`BOSS_SYNTH_GAIN` 0.62 against a file boss's 0.5 x the file level;
  it honours the duck, the volume slider and the music toggle).
- `'archmage'` is the Mage's Folly Archmage (level.js). `'archmage:undead'` is the Undead Archmage (tower-ascent.js arena), the
  same composition with a dark voicing. The `:undead` suffix is split in one place (`splitTrack`); the Sound Test lists one song
  ('archmage') and unlocks it from either fight. His spiral-stair chase still plays his arena music from the first step
  (main.js reads arena.music there, unchanged) and the tower-chase check still passes.
- `'goblinroyal'` is King Gorm (kings arena) AND the Goblin Queen (crown arena).
- tools/audio-assets.mjs: NO_FILE_BY_DESIGN gains both names, and a `name:variant` resolves to its base. audio/CREDITS.txt: one line.
- NEW check `boss-music` (tools/boss-music.mjs, in check.mjs's list): the wiring of the four arenas, then the real scheduler
  against a mock AudioContext for all three voicings.

## THE AUDIT (who plays what, before and after)
Levels marked hidden and not secret are not built by the audit (the Hound Master's level is one of them).

| Level | Boss | Music before | Music after | Own track? |
|---|---|---|---|---|
| wood | Hornet Queen | boss (default) | boss | SHARED: generic, this is the standard boss track |
| marsh | Bullfrog King | frogking | same | own |
| stockade | Goblin Chieftain | boss2 | same | generic (boss2; also Harbor Warden) |
| spore | Mother Cap | sporemother | same | own |
| kings | King Gorm (the Goblin King) | king (king.mp3) | goblinroyal | king.mp3 is the SAME RECORDING as boss4 (CREDITS.txt says so), so he sounded like the Archmage |
| kings mini | Great Hound | minicharge | same | generic mini track |
| scree | Ram Lord | ramlord | same | own |
| hanging | Owl Reeve | owlreeve | same | own (mini spider: minicharge) |
| spire | False Abbot | roc | same | own (mini Golem: monasterygolem, own) |
| moor | Windcaller | windcaller | same | own |
| storm | Queen's Lance | lance | same | own |
| crown | Goblin Queen | queen (queen.ogg) | goblinroyal | had a file, but not one that read as hers |
| crown mini | Forgemaster | minicharge | same | generic mini |
| longwater | Herald | herald | same | own |
| reef | Reefmaw | reefmaw | same | own |
| flotilla | Quartermaster | quartermaster | same | own |
| hurricane | Captain | captain | same | own |
| lamplit | Tollmaster | tollmaster | same | own (mini Reeve: minicharge) |
| underleaf | Grandmother | grandmother | same | own |
| deep | Diving Bell | boss3 | same | generic (boss3) |
| keep | Drowned King | boss3 | same | generic (boss3) |
| causeway | KRAKEN | kraken (kraken.ogg, "Castle Boss") | same | CONFIRMED: its own |
| harbor | Harbor Warden | boss2 | same | generic (boss2) (mini Bosun: minicharge) |
| waymeet | Paladin | closedhelm | same | own (mini Serjeant: minicharge) |
| undercrown | Buried Prince | musDungeon | same | borrowed (an old level track) |
| fields | Scarecrow King | scarecrowking | same | own (mini Ploughman: minicharge) |
| burial | Buried Dead | boss3 | same | generic (boss3) (mini Gravewarden: minicharge) |
| mage | ARCHMAGE | boss4 | archmage | new, shared with the Undead Archmage |
| fallingtower | UNDEAD ARCHMAGE (and his stair) | boss4 | archmage:undead | new, same composition |
| burning | Pyromancer | pyroboss | same | own |
| witchlight | Gate Gargoyle | boss4 | boss4 | generic (boss4, the "Great Boss" recording) |
| oreroad | Winchmaster | boss3 | same | generic (boss3) |
| unburied | Death Knight | deathknight | same | own |
| caravan | Dune Worm | duneworm | same | own |
| fair | Wicker Queen | houndmaster | same | borrowed (the Hound Master's) |

Every other mini (Homunculus, Sexton, Hedge Warden, Barrow Rider, ...) plays the one shared `minicharge` track.

## The two tracks (I cannot listen; this is what the code plays)
**archmage** (src/boss-music.js): D minor, 7/8 grouped 2+2+3, eighth = 0.17 s (quarter about 176), 16 bars = 19 s, loops on the bar.
- Harpsichord: a square pluck plus a triangle octave, a four-note arpeggio per bar (first four eighths).
- Spell motif: three rising chord tones on the last three eighths of every bar, triangle plus a sine bell an octave over, the third
  held, a noise shimmer at the end of each four-bar phrase.
- Organ: sawtooth triad under a lowpass, one per bar. Choir: two detuned saws through a slow-attack lowpass, one four-bar breath.
- Timpani on the one, bass on the 2+2+3. No drum kit.
- Chords: Dm - Bb - Gm - A7, then Eb (the flat second, Phrygian) - Cm - Bdim - A7 held. Bars 9-16: organ doubled at the octave,
  arpeggio an octave up, motif doubled below.
- Undead (`archmage:undead`): arpeggio an octave DOWN on a dry lowpassed sawtooth (no sparkle bell), organ a fourth lower, choir
  lowpassed and detuned wide (32 cents), a lower timpani, a low noise breath, and a bell tolled every fourth bar.

**goblinroyal**: F Phrygian dominant, 4/4 march at 116, eighth = 0.259 s, 16 bars = 33 s.
- War drums: low kick on 1 and 3, cracked noise snare on 2 and 4, toms falling over every fourth bar; the second half adds a ghost tom.
- Low brass stabs (two or three scooped sawtooths, lowpassed) on a swaggering 3+3+2. Bass roots F F Db C / F Bb Gb C.
- Crude fanfare in bars 1-4 of each half: a detuned sawtooth trumpet, slightly sharp, dotted call and answer, whose last note is a
  deliberately wrong Gb over the C.
- Mocking bassoon (second half, bars 5-8): narrow lowpassed square, a scoop into each staccato note, a pompous waddle.
  The 16-bar loop ends on a trombone-fail slide down. First-half bars 5-8 have a mock-solemn held chord instead.

## Checks (named runs only; no pilots)
Green: boss-music (new; archmage 21.4 oscillators/s, undead 14.9, goblinroyal 8.8 plus noise; every loop repeats note for note
across the seam; no hole over 2 steps; the undead voicing differs from the living one), audio-assets, boss-fight-end (46 fights),
boss-openings, tower-chase, tower-ascent, undead-realms, folly-runtime, queen-court, kings2-beats, soundtest, architecture,
checkpoints, skins, npc-removal, slopes-trace (every level identical), homepaths, comments, dangling-paths (green after the commit;
it named the then-untracked src/boss-music.js).

archmage-folly: FAILED once in the big parallel batch (no failing line survived in the log; it is a fight check that does not test
music), then PASSED run alone (the final `ok archmage-folly` printed; the process then hung on teardown under load and was timed out).
I treat it as a load flake; UNVERIFIED that it is one.

The boss-music wiring assertions fail on the old level values (boss4, king, queen), so they prove the change.

UNVERIFIED: how it sounds. The mix level (0.62) is an estimate; synth voices may need +-20% after a listen. I found an old quirk: after
any file track plays, a LATER no-file track (underleaf, mineworks) inherits that file's music gain. Not touched; the two new themes set
their own gain on play.

## QUESTIONS FOR DANIEL (recommendation first)
1. The standard boss music (`boss`) now plays only for the Hornet Queen; boss2 is the Chieftain + Harbor Warden; boss3 is the Diving
   Bell, Drowned King, Buried Dead and Winchmaster; boss4 is the Gate Gargoyle. Is that much sharing OK? Rec: give these their own
   themes first, leave the rest:
   - Drowned King (keep): a slow flooded-hall dirge, drone plus a bell and a low choir, water drips, 6/8 that surges when he lets go.
   - Winchmaster (oreroad): a rattling mine-cart chase, chain and anvil percussion in 12/8, a brass riff over it.
   - Gate Gargoyle (witchlight): a stone-grinding ostinato, bell-tower peals, tritone stabs.
   - Buried Dead and Diving Bell: lowest priority.
2. The Wicker Queen plays the Hound Master's track; the Buried Prince plays musDungeon. Rec: give the Wicker Queen her own (a pastoral
   folk dirge gone wrong); leave the Prince.
3. King Gorm's king.mp3 was the same recording as the Archmage's boss4. The Goblin Queen had queen.ogg. Both now play goblinroyal;
   king.mp3 and queen.ogg stay in the Sound Test. Rec: keep them there.
4. The Sound Test shows one song ('archmage') and plays the living voicing; the Undead voicing is heard only in his fight. Rec: fine.
5. The Goblin Chieftain (boss2) is also a goblin boss. Should he join goblinroyal? Rec: no, he keeps boss2.
