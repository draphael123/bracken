# claude/sfx3 - PART 3: signature boss sounds

Base claude/sfx d4885050 (not on master yet). Kenney Impact Sounds (CC0): licence field re-read on kenney.nl ("Creative Commons CC0"), downloaded to bracken-lanes/sfx-downloads/kenney-impact/ only (zip 801 KB). Credit already in CREDITS.txt + credits page (Kenney); one line added for the new pools. Build: sfx-research/plan3.mjs through build-sfx.mjs (same chain as PART 2: mono 44.1k, ~-17/-18 dB mean, q4).

Size: 15 new ogg, 126,086 B (+27 manifest lines). No new game logic randomness (Math.random only inside the existing take picker).

## What each boss now plays (REC table, src/audio.js; synth stays as fallback)
| Boss / sound | SFX | pool (takes) | treatment |
|---|---|---|---|
| Tide Herald / harbor bells, Saltreach | seaBell | r_bellA (impactBell_heavy 000, 001) | rate 0.8 |
| Tollmaster | tollBell | r_bellB (heavy 002, 003) | rate 0.5 (deep toll) |
| Golem / Rimewright / mage-realm | golemChime | r_glassC (impactGlass_medium 000-002) | rate 0.85, layered over synth |
| Mummer (Grandmother pulls) | mummerBell | r_bellC (heavy 004, + highpassed) | rate 1.9, small and bright |
| Goblin Priest / Bellman | priestBell | r_bellB | rate 1.15 (clearly higher than the toll) |
| Goblin Priest tell | priestBellTell | r_bellC | rate 2.4, layered over the synth double ring (stays the thin high ring, B10) |
| Archmage | archmage, mageRune | r_archF (rubberduck spell_fire_03, 04, 06, lowpassed) | rates 0.85 / 1.1, layered |
| Wicker Queen | wqBurn, wqAlight | r_wqF (spell_fire_05, 07, 02, highpassed) | rates 1.25 / 0.7, layered |
| Huntmaster | hornDrawLow, hornBlastLow (new; huntmaster.js calls them, falls back to the ordinary horn) | r_hornD / r_horn | rate 0.7; the ambush/elite horn stays at 1.0 |
Note: all 7 rubberduck spell_fire files were already used somewhere in PART 2; the new pools reuse them with a different filter and pitch, no new files from that pack.

## Still synth, with candidate packs (none downloaded; Daniel approves any)
thunder / stormZap tail, callerChant and the chants (Windcaller, Archmage intro), bow/bowShot, gust/gustRise, heart, whistleCall, boom, baleBurst, goatCry/bird/fish, lampOn, wqWake/wqCrown/wqDark, dune-worm/maw roars (the creature_roar_01-03 / creature_monster_01-04 in the already-downloaded rubberduck 80 pack are unused: no new download needed, next lane).
Candidates: Kenney Sci-fi Sounds / Digital Audio laser+powerUp (already on disk) for zaps; OpenGameArt "Thunder / lightning" CC0 packs and "Wind" loops for thunder/gust; Kenney Impact Sounds impactMetal_heavy / impactPlate_heavy (already downloaded now) for clanks; a CC0 bow/arrow pack (e.g. "Bow and arrow" on OGA); CC0 chant/choir "Vocal pad" packs for chants.

## Listen list (nothing verified by ear)
1. tollBell (Tollmaster summon, rate 0.5): does it read as a low toll or just muddy?
2. seaBell vs tollBell: distinct enough? (Saltreach bell, Tide Herald phases)
3. priestBell vs priestBellTell: the tell must stay thinner and higher than the ring.
4. mummerBell at 1.9x: bright hand bell, or too tinny/short (0.3 s sources)?
5. golemChime (glass + synth layer): crystalline, or clashes with the synth notes?
6. Archmage cast/rune and Wicker Queen burn/alight layers: do the filtered fire takes sit under the synth?
7. Huntmaster low horn (draw tell and blast): lower, but still obviously the horn tell.
Bells are short (0.3-1.3 s) so lowered rates are the way to get length; levels are one number each in REC.

## Checks (on claude/sfx3, port 8821)
Pass: audio-assets static passes (46 levels, 46 boss arenas, 14 minis, all manifest files exist, every SFX call in the table), boss-music, soundtest, tells (427 tells), untold-told, hint-shown, modulepreload (401 modules, 0 unlisted), textfit credits (16 screens, 197 strings, all counters 0). New files decode clean with ffmpeg.
NOT completed: audio-assets --decode (browser page timed out 3x at 121 s) and mobile-perf (FAILs on wood/welltown/redgorge frames of 1.6-4.2 s): the machine was saturated by other lanes' suites; no code on those paths changed (audio table + 126 KB of ogg + 2 call-sites in huntmaster.js). Re-run both when the box is quiet. Full suite not run.

## QUESTIONS FOR DANIEL
1. Rec: ship after a 5-minute listen to the 7 above; if a bell is wrong, only its rate/pool line in REC changes. Built that.
2. Rec: next lane uses the unused creature_roar/monster takes (no download) for worm/maw/queen roars. Not built.
