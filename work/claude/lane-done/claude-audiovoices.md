# claude/audiovoices — AUDIO FEEL lane 2: VOICES (2026-10-18)

Branch claude/audiovoices off master e0436ee8. Nothing here was heard by ear; no browser was opened (PC memory rule). Static checks only.

## Voice set per hero (HERO_KIT, src/audio.js)
| Hero | Kit | effort | hurt | die | Source |
|---|---|---|---|---|---|
| knight | m5 | existing | existing 10 | existing 3 | wolfwoot (unchanged) |
| paladin | m3 | existing 3 | existing 4 | existing 3 | HaelDB (unchanged) |
| pirate | m1 | NEW alias of 2 m1 attack clips (`vo_m1_effort`, no new files) | existing 4 | existing 3 | HaelDB |
| Death Knight (reaper) | dk (NEW) | 5 | 3 | 5 (4 dying breaths + 1 evil) | Little Robot Evil Human + Human Dying Breath |
| pyromancer | f3 | NEW alias of f3 attack (`vo_f3_effort`; before it fell to the pitched goblin clip) | existing 3 | 2 + 3 new high deaths = 5 | cicifyre + Dying Voices Female |
| Warden | wd (NEW, distinct) | 5 | 6 | 5 | Little Robot Good Human (mid-range grunts) + Dying Voices "medium" takes |
| Ranger | rg (NEW, distinct) | 5 | 5 | 4 | Little Robot Good Human (higher grunts, high-passed 160 Hz, +3% speed) + Dying Voices British takes |
| Geomancer | gm (NEW) | f3 attack clips (pitched x0.82 + lowpass: the ONE remaining pitched variant) | 4 | 4 | Dying Voices "low" takes |
| Berserker | ob (NEW) | 6 | 7 | 4 (+4 heavy for roars) | Little Robot Orc growls |

- No hero now grunts with a goblin clip: `pEffort` (both copies, normal + paladin) is `if (gate('heroEffort', 1.5)) heroVo('effort', 0.4)` (no goblin fallback, and at most one effort per 1.5 s; was un-gated 35% of every swing).
- Warden and Ranger each have their own effort + hurt + die set (B7). Geomancer shares effort with the pyromancer (pitched), a GAP, see Questions.

## Foe coverage
All 293 bestiary types (BEASTS in src/main.js) now have a hurt AND a death (was ~120 without). `Object.assign(CAST, {...})` block in src/audio.js (before `vbody`), 130+ rows by family:
- people: m1-m6 / hd kits, plus `ev` (Little Robot Evil Human: priests, thurifer, archdeacon, deacon, abbot, mystic, snuffer, dart-blower, grave warden)
- the dead: `zb` (Little Robot Zombie): bone goblin, husk, apprentice, corsair, marauder, drowned dead, mummy, tomb king/skeletons, sand-drowned/bound, fog wraith, buried dead, undead mage
- scorpions, scarabs, spiders, tide crab, familiar: `sc` (Little Robot Small Creature); bats/skitter/weavers: existing `bug`; lurkers/grindylow/shock eel: existing `slime`
- imps, djinn, hourglass king, cistern queen: `dm` (Demon); raptor, night hunter, sandworm, gorge crab, colossus: `di` (Dinosaur, pitched down for the big ones)
- goblin riders/casters/scouts/kite-riders/trophy-hunters/huntmaster: existing goblin `gobbig` throats; jackal/grave hound: `bark`; matriarch: `scream`
- no throat (synthesised hurt/die from existing pools + tones): stringjack, marionette, masterpiece, wicker man (wood), glass sentinel (glass), colossus (stone under the voice), great drill, construct (brass), tome (paper), willowisp
- the Hawk-Mistress and Harlequin use the f3 woman's kit (no women's pack for foes).

## Files and licences
- NEW oggs in audio/sfx/vo/ (146 files, +2.3 MB; vo/ is now 5.0 MB): wd_ rg_ gm_ dk_ ob_ ev_ zb_ dm_ di_ sc_ and f3_die_2-4. Recipe: tools/build-voices-1018.mjs (node + ffmpeg; mono 44.1 kHz Vorbis q4, mean -16.5 dB, peak <= -1.5 dB).
- audio/manifest.json: 51 new pools appended at the END of the file (conflict with AUDIOCOMBAT's appends is mechanical: keep both), `vo_f3_die` extended, `vo_f3_effort`, `vo_m1_effort`, `vo_gm_*` aliases.
- Dying Voices - Female - RPG, Galacti-Chron, https://opengameart.org/content/dying-voices-female-rpg : licence field CC-BY 3.0 AND CC0 (page notice: CC0); used under CC0, credited anyway ('Galacti-Chron' in SFX_CREDIT_NAMES, audio/CREDITS.txt).
- Voices Sound Effects Library, Little Robot Sound Factory, https://opengameart.org/content/voices-sound-effects-library : CC-BY 3.0, "Attribute Little Robot Sound Factory, link www.littlerobotsoundfactory.com". Credited: new CC_BY row in src/credits.js (credits page), audio/CREDITS.txt.
- Downloads sit untouched in C:\Users\Daniel Raphael\.claude\bracken-lanes\sfx-dl-1018-dyingvoices\ and ...\sfx-dl-1018-littlerobot\ (each its own folder; zips + unzipped x/). Female Gruntwork 1 NOT used. The Female RPG voice pack, Battlecry and the other optional packs were not downloaded (brief: only the two named packs).
- Also changed: src/credits.js (SFX_CREDIT_NAMES, CC_BY), audio/CREDITS.txt, tools/voices-check.mjs (new gate).

## Checks run (static)
- node --check src/audio.js, src/credits.js, tools/*.mjs : ok
- node tools/voices-check.mjs : ok (293 bestiary types hurt+die, 179 CAST rows resolve to real manifest pools, 9 heroes on 9 distinct kits, no goblin effort fallback, both packs credited)
- node tools/audio-assets.mjs : ok (719 manifest files exist)
- node tools/ship-fixes.mjs : ok

## Browser checks for the integ (none run here)
- `node tools/soundtest.mjs` (new kits / voices list in the Sound Test), `node tools/textfit.mjs credits` (the CC_BY page list grew by one row, pages shift), mobile-perf (146 more fetch+decode at start; if it hurts, trim zb/dm/di/sc/ob alert and the second half of each die pool).
- Register `tools/voices-check.mjs` in tools/check.mjs's static list (I did not touch that giant line to keep the merge clean).
- VOICE CAP: foe voices still go through `voice()` with no polyphony cap. A crowd of 12 `m6`/`zb` foes dying together is the case the voice cap (AUDIOCOMBAT) should cover with a `voices` category; `heroEffort` is gated in my function only.
- Resolve possible merge points: HERO_KIT line (one line, mine), the two `pEffort` lines, `Object.assign(CAST...)` block, the end of manifest.json.

## LISTEN LIST for Daniel (nobody has heard any of this)
1. The nine heroes back to back in the Sound Test: effort, hurt, death. Especially Warden vs Ranger vs Geomancer vs Pyromancer (do they sound like four people?).
2. The Little Robot "Good Human" grunts used for Warden/Ranger effort were chosen by a pitch estimate (not by ear): they may be male or too similar. If wrong, swap indices in tools/build-voices-1018.mjs (`H('..')`).
3. The Dying Voices "head" hurt clips (first word cut at the first pause: "Ugh", "Oh", "No"): are they clean, not cut mid-syllable?
4. Death Knight (evil voices + dying breaths): menacing or comic? Berserker orc growls: right for a man, or too monstrous?
5. Imps/djinn (Demon), the dead (Zombie): too many different voices in the desert/church/circus levels?
6. Wooden foes (marionette, stringjack, wicker man) synth cracks, tome page rustle, willowisp chirp: placeholder quality.

## QUESTIONS (rec + built)
1. Geomancer: still shares effort (pitched f3) with the Pyromancer; no pack gave a third distinct woman's grunt. REC (built as is): accept for now; the alternative is Female Gruntwork 1 (licence ambiguous BY-SA vs BY 4.0: ask the author) or a paid pack.
2. Gender of the Little Robot "Good Human" clips is unverified: REC listen first (item 2 above); built by pitch estimate.
3. Foe-voice cadence: foe hurt voices remain at the existing gates (0.09 s per type); REC leave until the voice cap lands.
