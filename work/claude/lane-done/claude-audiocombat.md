# claude/audiocombat (sonnet) - AUDIO FEEL lane 1: combat layers + mix  (10-18)

Nothing here was heard by ear and no browser was opened (PC memory cap). Static checks only; browser checks are listed for the integ.

## What plays now
| Event | Sound |
|---|---|
| Plain swing (`SFX.swingUp(k)`, startSwing) | air (`swish`, 13) + the weapon (`sw_blade`, 10 StarNinjas swings), per-hero volume and rate (table `SWING` in audio.js). The run climbs +4% pitch per cut; the third cut is 25% fuller with the RPG `swing` under it. Heavy-weapon heroes (paladin, reaper, geomancer, berserker) add a low `swing` at rate x0.62. Pyro adds embers (`crackle`); warden and geomancer have no blade layer (spear air / hammer air). The old 70 ms synth tick is only the fallback while files load or "sound files" is off. |
| Landed hit (`SFX.impact`) | unchanged material pool at 0.38, plus a NEW body thud under it: flesh/soft/fungus/bone = `bd_flesh` (7), steel = `bd_plate` (5), stone/shell = `bd_stone` (5), wood/chitin = `bd_wood` (6), crystal = none. A heavy blow adds `bd_heavy` (8) at 0.3. Thud pitch follows the hero's weapon weight (x0.8-1.1). |
| Block | `blk_clash` (10 StarNinjas clashes) at 0.3 x0.88, plus a wooden-backed thud `bd_wood` and a faint sine; synth kept as fallback. |
| Heavy block | clash x0.72 + `bd_plate` + `bd_heavy` + the existing `clang` (now 10 takes) + the old synth thump. |
| Parry | clash x1.3 over the existing `parry` pool. |
| Landing | Tier 0 (hop) unchanged. Tier 1 (drop) adds `ld_jump` (5 takes) 0.3 x0.9 + `bd_heavy` 0.2. Tier 2 (big drop) adds `ld_jump` 0.46 x0.72 + `bd_heavy` 0.34 x0.7. main.js now passes the tier (`SFX.pLand(surface(), tier)`); the `SFX.thud` that heavy landings already played stays. |
| Hero hurt | + body layer: `bd_plate` for knight/paladin/reaper, else `bd_flesh`, at 0.2. Heavy hurt adds `bd_heavy` 0.3. |
| Workhorse pools grown | `clang` 3->10, `crack` 3->9, `stone` 2->9, `slam` 2->6. Also fixed a dead call: `stingerBreak` asked for a pool `crumble` that does not exist (now `crack`). |

## Mix numbers
- VOICE CAP (`MIX_CAP`): 24 recorded sources live at once; per category combat 6, voice 4, foley 3 (category by pool-name prefix, `catOf`). Over a cap, the new sound replaces the quietest-oldest live one in that category if it is louder, else it is dropped (`mixStats` counts played / dropped / stolen / peak). A capped sound reports "played" so its caller does not stack the synth on top. Synth tones are not counted. Applies to `file()` and `voice()`.
- DUCK (`DUCK`, `duckBeat()`): -3 dB (x0.708) on music and the ambience bed, 150 ms hold, about 0.25 s release (setTargetAtTime), gated 120 ms. Fires from hitHeavy, hitFinish, heavy (boss slam), blockHeavy, guardBreak, pHurt, pHurtHeavy. New graph nodes: music -> musicLP -> musicDuck -> master; ambGain -> ambDuck -> sfxGain. The existing `music.duck(on)` is untouched.
- LOUDNESS STANDARD: recorded pools levelled to about -18 dB mean with a peak limiter (build aims at -1 dBFS; vorbis overshoots to 0, so the check allows <= +0.1). Hard-transient pools (rock/wood breaks, stone falls) level lower, to about -27 dB mean, and are compensated by call volume. `SFX_TRIM` = one trim per category (combat/voice/foley/other/amb/ui, all 1.0 now), applied in `file()`/`voice()`: the single knob to move a category. `tools/audio-mix.mjs` enforces it (below). The SFX-slider-scales-ambience quirk is documented, not changed.
- NOT done: panning the hero's swing at the foe (the hero's own swing stays centred; hits on a foe were already placed by `emitAt`); hit-stop-synced scheduling (sound fires in the same frame as the freeze, which the audit judged fine); footsteps (lane 3).

## Files and licences
All four packs: licence box re-read 10-18 = CC0. Each downloaded into its own folder `bracken-lanes/sfx-dl-1018-<pack>/` (starninjas-sword, rubberduck-75, qubodup-impact, macro-jumplanding).
- StarNinjas "20 Sword Sound Effects" (CC0): `sw_blade_0-9`, `blk_clash_0-9`.
- qubodup "Impact" (CC0): bd_flesh_0-1, bd_stone_0, bd_wood_0, clang2_6, stone2_6.
- Macro "Jump Landing" (CC0, credit as a courtesy: Dan Knoflicek): ld_jump_0-2.
- rubberduck "75 CC0 breaking / falling / hit" (CC0): clang2, crack2, stone2, slam2, bd_wood_1-3.
- Kenney Impact Sounds (already credited): the rest of bd_*, ld_jump_3-4.
- 80 new oggs (audio/sfx, 589 KB), 8 new manifest pools + 4 grown. Credited in audio/CREDITS.txt (block at the end), src/credits.js `SFX_CREDIT_NAMES` (+ 'qubodup', 'Dan Knoflicek'), tools/ship-fixes.mjs CC0 list. Female Gruntwork 1 untouched. Build script: a copy of sfx-research/build-sfx.mjs (limit 0.8, per-pool compressor on crack2/stone2/clang2/bd_plate), kept outside the repo.
- New: `tools/audio-mix.mjs` (static + ffmpeg loudness; 0 problems). Code: src/audio.js (mix block above the samples section, SWING, bodyThud, swingUp, impact, block/blockHeavy/parry, land, end-of-file wrappers, Sound Test rows `swingThird`, `pLandDrop`, `pLandBig`), src/main.js (one call site).

## Checks run (all static)
node --check audio.js and main.js; `tools/audio-assets.mjs` ok; `tools/audio-mix.mjs` 0 problems (144 pools, 80 files measured); `tools/ship-fixes.mjs` ok (credits drift); a node-only mock-AudioContext smoke over all 9 heroes calling swingUp/impact/block/parry/pLand/pHurt/heavy/hitHeavy (no throw; peak live sources 13 of 24 in the mock). `tools/dangling-paths.mjs` was red before the new files were committed (untracked files cited by the manifest); re-run it on the committed tree.

## Browser checks for the integ
- soundtest (new rows swingThird, pLandDrop, pLandBig; credits names).
- boss-music (the duck nodes sit on the music path).
- mobile-perf (more sources per hit, now capped).
- textfit credits (two more names; names pages hold 16 each, so a page may be added).
- tells + juice + combat-feel (SFX call shapes are unchanged).
- Open the Sound Test and play each hero's swing; watch the console for a decode failure on any new ogg.

## LISTEN LIST (Sound Test, EFFECTS rows; pick each hero in the game first, the swing/hurt rows follow the chosen hero)
1. swingUp and swingThird for knight, paladin, pyro, warden, geomancer, berserker, ranger, pirate, reaper: does each weapon sound different, and not like a tick? Is the air too loud over the blade?
2. Landed hits (fight a dummy): flesh/steel/stone/wood thud under the hit; then a heavy blow: too boomy?
3. block, blockHeavy, parry: the clash is a sword-on-sword sample and may be too bright for a wooden shield.
4. pLandDrop, pLandBig versus the hop landing; pHurt and pHurtHeavy body layer.
5. Crates (crack), stone, slam, clang: do they repeat less? Check slam2 (generic "falling" samples chosen blind), crack2 rock breaks, stone2.
6. Ducking: in a boss fight, does the music dip on a slam and feel pumpy?

## QUESTIONS FOR DANIEL (rec first; built = rec)
1. Weapon families per hero are my reading (knight/pirate/ranger blade, paladin mace, reaper scythe, pyro fire, warden spear, geomancer hammer, berserker axe). REC keep and correct by ear. Built.
2. Duck depth -3 dB / 150 ms. REC keep; if it pumps, set DUCK.depth to 0.8 (one number). Built -3 dB.
3. Voice cap 24 / combat 6 / voice 4 / foley 3. REC keep until a real 12-foe melee is listened to. Built.
4. The hero's swing stays centred (not placed at the foe). REC keep (a swing is the hero's own body). Built that way.
