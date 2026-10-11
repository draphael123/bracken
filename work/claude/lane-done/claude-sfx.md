# claude/sfx - PART 2: recorded SFX (download + wire)

Seven CC0 packs (Daniel's 10-11 approval), licence field re-read on each page before download: Kenney RPG Audio, Interface Sounds, Digital Audio, Music Jingles; rubberduck 80 CC0 RPG SFX and 40 CC0 water/splash/slime SFX; StumpyStrust "Their Coming" horn. Zips kept outside the repo (bracken-lanes/sfx-downloads/<pack>/); only audio files were opened; scripts in bracken-lanes/sfx-research/ (build-sfx.mjs, plan-sfx.mjs; ffmpeg only, no Python).

How: each take trimmed of edge silence, mono 44.1 kHz, levelled to about -18 dB mean with peak <= -1 dBFS (the existing pools sit at -14..-22 mean, -1 peak), 3 ms fade-in, short fade-out, libvorbis q4 (same as the earlier lanes). 152 files, r_<pool>_N.ogg, in audio/sfx/, registered in audio/manifest.json.
Wiring: one table (REC) in src/audio.js just before SFX_NAMES wraps each SFX: recorded take if the pool has loaded and sfxFiles is on, else the original synth runs unchanged (sfxFiles OFF, still-loading, voices-off for cries). `layer` entries play the take AND the synth. Gates (tell, caw, snort) kept. Hero tables: paladin keeps its plate jump/dodge, pyro keeps its crackle jump, reaper keeps its dodge.

Bytes added: 1,232,481 B of ogg (152 files; audio/sfx 4.0 MB -> about 5.2 MB) + about 11 KB manifest. Credits: audio/CREDITS.txt (new section) + src/credits.js names page gets Kenney, rubberduck, StumpyStrust.

## SFX -> pool (takes) -> pack/file
| SFX | pool (takes) | source |
|---|---|---|
| pJump | r_jump (4) | Kenney RPG cloth2, cloth4, handleSmallLeather, beltHandle1 |
| jump | r_boing (3) | Kenney Digital phaseJump1-3 |
| pDodge, dodge, leap | r_dodge (4; leap at 0.75x) | Kenney RPG cloth1, cloth3, clothBelt, clothBelt2 |
| charge, wqSickleTell | r_charge (3) | Kenney RPG drawKnife1-3 |
| foeSlash | r_slash (5) | Kenney RPG knifeSlice, knifeSlice2; rubberduck blade_01-03 |
| throwWhoosh | swish (existing 13) | no download |
| coin, coinUp | r_coin (4; coinUp pitched by streak) | Kenney RPG handleCoins, handleCoins2; rubberduck item_coins_01, _03 |
| thud, geoThud, golemStomp(layer) | r_thud (4) | Kenney RPG dropLeather; rubberduck wood_01, wood_03, item_wood_02 |
| splash | r_splash (5) | rubberduck water splash_02, 06, 08, 13, 14 |
| waveCrash | r_wave (4) | water splash_01, 05, 07, 11 |
| squelch | r_squelch (4) | water slime_03, 05, 08, 13 |
| puff | r_puff (3, lowpassed 1.8k) | Kenney RPG cloth1, cloth4, handleSmallLeather2 |
| hiss | r_hiss (4, highpassed) | water splash_09, 10, bubble_02, slime_12 |
| buzz | r_buzz (3) | Kenney Digital lowRandom, lowThreeTone, lowDown |
| uiSel | r_uiSel (4) | Kenney Interface select_001-004 |
| menuOpen / menuClose | r_open / r_close (3 each) | Kenney Interface open_001-003 / close_001-003 |
| equip | r_equip (3) | Kenney Interface pluck_001, 002; RPG metalClick |
| rankUp | r_rankUp (3) | Kenney Jingles HIT03, 09, 10 |
| tell(false) | r_tellS (3) | Kenney Interface question_001-003 |
| tell(true) | r_tellB (4) | Interface bong_001; Digital twoTone1, twoTone2; Jingles HIT00 |
| strikeTell | r_strike (4) | Kenney Digital phaserUp1, 3, 5, 7 |
| sting | r_sting (3) | Jingles HIT01, 02, 06 |
| medal | r_medal (3) | Jingles STEEL09, 11, 04 |
| check | r_check (3) | Jingles STEEL00, 05, 15 |
| win | r_win (3) | Jingles STEEL01, 02, 07 |
| levelStart | r_levelStart (3) | Jingles HIT03, 04, 05 |
| bossDown, judgement (layer) | r_bossDown (3) | Jingles HIT15, HIT11, STEEL07 |
| zap, spark, stormZap | r_zap (3; spark 1.6x, stormZap 0.85x) | Kenney Digital zap1, zap2, zapTwoTone |
| mageBolt, mageBoltTell | r_spell (4) | rubberduck spell_01, 02, spell_fire_06, 07 |
| mageRuneTell | r_spellT (3) | rubberduck spell_fire_01, 02, 05 |
| pyreBoom (layer) | r_fire (2) | rubberduck spell_fire_03, 04 |
| priestCenserTell, gateLift | r_chain (3) | rubberduck chain_01-03 |
| golemShatter (layer) | r_stones (4) | rubberduck stones_01, 02, 04, item_stone_01 |
| rumble, geoQuake (layer) | r_rumble (3, lowpassed) | rubberduck stones_03, stones_02, item_stone_01 |
| ropeHaul | r_creak (3) | Kenney RPG creak1-3 |
| gateDrop | r_gate (3) | Kenney RPG doorClose_1, 2; rubberduck chain_03 |
| gateOpen | r_door (3) | Kenney RPG doorOpen_1, 2, creak2 |
| mend (layer), aegis | r_chime (4) | rubberduck item_gem_01-04 |
| rattle | r_rattle (4) | Kenney RPG metalPot2, 3; rubberduck metal_03, chain_02 |
| haft | r_haft (4) | rubberduck wood_01, 02, 03, 05 |
| tipRing | r_ring (3) | rubberduck metal_01-03 |
| braceSet | r_latch (4) | Kenney RPG metalLatch; rubberduck lock_01-03 |
| wqLashTell (layer) | r_dodge | (reuse) |
| hornBlast | r_horn (2, 1.8 s) | StumpyStrust theircoming, theircoming3 |
| hornDraw | r_hornD (2, 1.9 s, 0.9 s fade-in) | same files |
| snort | vo_ogre_alert 1.5x | no download (creature kit) |
| screech, queenShriek | vo_scream | no download |
| bark, yelp | vo_bark (yelp 1.55x) | no download |
| boreRoar, mawRoar | roar (0.5x / 0.7x) | no download |
| caw | amb_gull 0.8x | no download |
| croak | croak | no download |

67 SFX names now play a recording (about 38 recorded-only with synth fallback, 14 layered over the synth, 15 reuse existing pools). Synth-only still: thunder, bells (seaBell, tollBell, golemChime, mummerBell, priestBell, priestBellTell: need Impact Sounds impactBell_heavy - Impact Sounds is credited but was not one of the 7 approved downloads, so not fetched), chants, bow, gust/gustRise, heart, whistleCall, boom, baleBurst, goatCry/bird/fish, lampOn.

## Not by ear
I cannot listen. Takes were chosen by file name, duration and level; nothing is verified by ear. Worth a 5-minute listen on the Sound Test / tools/soundboard.html, especially: r_tellS (Interface "question" chirps as the generic small tell), r_hiss, r_puff, snort (ogre grunt at 1.5x), caw (gull at 0.8x), the rank/medal jingles. Levels in REC are one line each (v).

## Checks
All pass on claude/sfx: audio-assets (--decode too: 114 tracks clean), boss-music, soundtest, tells, untold-told, hint-shown, modulepreload (401 modules, 0 unlisted), mobile-perf (inside budget at 4x CPU), textfit credits (16 screens, 197 strings, all counters 0). Not run: the full suite.

## For PART 3 (signature boss sounds), from these same packs
- Bells (Tide Herald, Tollmaster, Golem, Mummer, Goblin Priest): fetch Kenney Impact Sounds impactBell_heavy_000-004 (needs approval; already credited).
- Casters (Archmage, Wicker Queen): r_spell / r_spellT / r_fire already on disk; rubberduck 80 spell_fire_01-07 has unused takes (03, 04 only used in r_fire).
- Horn boss / Huntmaster: r_horn / r_hornD; a second, lower horn pitch via rate 0.7.
- Golem / Geomancer / Dune Worm: r_stones, r_rumble, r_thud with the rate knob; rubberduck 80 creature_monster_01-04 and creature_roar_01-03 (in the 80 RPG pack, unused) for worm/maw/queen roars.
- Gates/winch/Great Drill: r_chain, r_gate, r_door; Kenney RPG metalPot1, beltHandle2, chop unused.
- Lightning/Stormcaller: Digital zapThreeToneUp/Down, laser1-9, powerUp1-12 unused.
