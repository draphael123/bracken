# claude/archmage2b - THE FALLING TOWER'S CHASE AND THE UNDEAD ARCHMAGE, harder

Brief: scratch/brief-archmage2.md (Daniel 10-02, with the 10-03 addition from scratch/audit-stuck.md #1). Base: master 1dd5b181, then
merged origin/master 44c8e47d and origin/claude/weight ec840442 (WEIGHT landed during the lane; every boss number below is measured AFTER it).

## 1. The rising dark matters (src/spiral-chase.js RISE, src/chase.js, src/main.js)

Daniel's complaint: "the chase up to the Undead Archmage has poison - it doesn't do anything". The cause: it rose at 11-15 px/s, started
only on the first step, and its rubber band slowed it to 0.8x close under you. No moving hero was ever reached, and the green read as poison.

- It starts AT ENTRY: you come out of his ring onto the stair's floor and it is already rising. A banner says HIS DARK MAGIC RISES: CLIMB!,
  and a dark band sits on the bottom edge of the screen for the whole climb (new chase option `band`).
- It rises at 30 px/s, then 36, then 42. Each SURGE is told first: a banner, thunder, and a flash in its colour (new).
- Contact HURTS: 21 raw damage, about 28 at normal health after the game's damage scale. It then THROWS YOU UP onto the nearest ledge over
  its front that is still there (new `knockTo` and `chaseSafeAbove`; failing stone that has gone does not count). It holds for 1.2 s, so
  it cannot hit twice in a row.
- NO SOFT-LOCK: it never rises past the underside of the next landing over you until your feet have stood at that landing's height
  (new `caps`, and chaseStep now takes `ground`, so a jump does not count). There is always somewhere over it to stand.
- Its rubber band (min 72 px, slow 0.4) keeps it fair: a hero who keeps climbing stays ahead, and a hero who stops is reached in a few seconds.
- The test that fails on master: tools/tower-chase.mjs now asserts that the dark starts at entry, that contact is hurt + thrown up + capped,
  and that it rises at about 30 px/s. In the page, a hero who stands is hurt and thrown UP 3 times, and dies of it at 30 s. On master the
  dark started on the first step and killed outright.

## 2. Longer and harder: nine flights (was six), one checkpoint at the foot

The flights are now drawn up in one frame (`DRAWN`) and mirrored per direction. The stair is rows 70-139: it goes deeper and the top is unchanged.
You come out of the ring on the right (arrive 103, checkpoint 101; CHECK_PIN moved to 101,139).

| # | flight | new? |
|---|--------|------|
| 1 | THE STAIR | |
| 2 | THE BROKEN STAIR | |
| 3 | THE PENDULUM | NEW |
| 4 | THE FAILING STAIR | |
| 5 | THE ICE STAIR | NEW |
| 6 | THE STONES | |
| 7 | THE BOOK GAUNTLET | NEW |
| 8 | THE GALLERY | |
| 9 | THE LAST STAIR | |

- **THE PENDULUM**: two of the clock's brass weights swing over the two gaps, against each other. Each weight is at its lowest at chest
  height over the gap's higher lip. A weight hurts 16 and no shield turns it. The answer: let a weight swing back over you, then go as it turns.
- **THE ICE STAIR**: his frost freezes the step you stand on and the next one up for 4.5 s. This is real slick physics (`L.slick`), drawn
  as ice, and told as "FROST: IT FREEZES THE STEPS".
- **THE BOOK GAUNTLET**: while you are on this flight, a book shakes in a niche on the far wall for 0.7 s with a ! over it. Then it flies
  down the flight at chest or knee height. It hurts 12; a shield turns it, or you can jump it.
- Each new flight has a sign where it begins, and a line is said the first time you reach it.
- The tower-ascent rule line is now owned here and matches the code:
  "CLIMB. CRACKED STONE GOES AFTER THREE BEATS, AND HIS DARK RISES UP HIS STAIR UNDER YOU." Every failing step on the stair now counts
  3-2-1. The last stair's failing step counted 2, so it was changed.
- The stair bot (src/lab.js chaseClimb) now waits out a swing using `pendSafe`, and guards or jumps the books.
- Times: every hero climbs it in **59-80 s** (tower-chase, health held up). The dark caught a climbing hero **0 times** in that run.
  Normal-health pilot (tools/stair-pilot.mjs, which now breaks damage down by source):

  | hero | time | damage | from the dark | from the pendulum | hp left |
  |------|------|--------|---------------|-------------------|---------|
  | knight | 76 s | 95 | 74 | 21 | 5 |
  | pyro | 49 s | 0 | 0 | 0 | 88 |
  | reaper | 65 s | 37 | 37 | 0 | 58 |
  | geomancer | 65 s | 21 | 0 | 21 | 74 |

  No deaths. This pilot was measured before the dark's damage went from 28 to 21 raw, and before WEIGHT.
- The VARIETY lane's mimics, turrets, brooms and imps in the tower are untouched.

## 3. The Undead Archmage: three new attacks, one per stage (src/undead-mage.js; check: tools/undead-moves.mjs, in the check list)

- **BONE STORM** (stage 1 on; boneTell, 1.1 s, a red !!):
  - A ring of 12 skulls is drawn round you with its gaps flashing. It follows you through the tell, then is set where you are.
  - It closes in over 2.6 s while turning, and he holds the storm while it lasts.
  - A skull hurts 11 and nothing turns it. The answer is to fly out through a gap.
  - Every cycle of his order changes it: one wide gap, then two narrow ones turning the other way.
- **PHYLACTERY ECHO** (stage 2 on):
  - After his fire, frost, poison, hand or lightning, a pale ghost of him stays where he cast.
  - 0.5 s later it casts the same spell from there, at where you are then: dodge twice.
  - The lightning's echo falls where you stood when the first one hit, told by its own pale column.
  - It never echoes a ring move or the mark.
- **GRAVE PULL** (stage 3 only; pullTell, a red !!; his order skips it before stage 3):
  - A black-violet void tears open at the sky's edge behind you.
  - For 3.4 s it drags the carpet toward it at up to 64 px/s (the carpet flies at 160) while he goes on casting.
  - Touching the void hurts 18 and throws you back toward the middle of the sky.
- His bestiary card says all three. The new marks are generated by `tells --write`. The carpet bot (src/lab.js) knows all three moves,
  and its warden now uses her deflect tap on bolts (on the beat), as her kit says.
- Health went from 600 to 840. The fight was far too easy for the bot: 5/5 wins before the change, a knight in 29-44 s, and 11/12 with the
  new moves before WEIGHT.

### Numbers (human-speed bot, tools/combat-pilots.mjs, one fight per page; new `--salts`; after WEIGHT, health 840)

- **12/20 = 60%** (21 fights; knight salt 1 failed to load the page).
  - knight **5/6** (wins in 67-85 s)
  - warden **0/7** (dies with 32-60% of his health left; one timeout at 35%)
  - pyro **7/7** (82-157 s)
- An earlier 21-fight run without the warden's deflect gave 13/21: knight 6/7, warden 0/7, pyro 7/7.
- At 960 health: 5/12 (knight 2/4, warden 0/4, pyro 3/4).
- **Mash bot**: boss 0/6, mini 0/6. docs/mash-bot.json was re-stamped by the bot, level row first, then boss.

## 4. Real music (audio/undeadmage.ogg)

- The track is "Colossal Boss Battle Theme" by Matthew Pablo, CC-BY 3.0: "Blackmoor Colossus Loop.wav", the loop with the choir, from
  scratch/archmagemusic.
- It was encoded to Ogg Vorbis q3: 1.6 MB, 117 s.
- It plays from the first step of the stair into the fight with no break (arena.music 'undeadmage').
- It is credited in MUSIC_CREDITS, in the credits page's CC_BY list, and in audio/CREDITS.txt.
- The synth 'archmage:undead' voicing is removed, since nothing else used it. tools/boss-music.mjs and tools/audio-assets.mjs were updated to match.

## Checks (named runs only)

- Green after the master and WEIGHT merges:
  - Stair and tower: tower-chase, tower-ascent, tower-flyers, checkpoint-gaps (after the pin move).
  - The fight: archmage-rings, undead-realms, undead-moves (new), boss-openings, boss-greed, boss-fight-end, tells.
  - The gates: mash-gate, level-quality, stuck, pixels/floats, hint-shown.
- Green before the merges: tower-collapse, tower-cutouts, tower-hall, chase, archmage-room, archmage-folly, undead-foes, checkpoints,
  checkpoint-stand, floaters, architecture, dangling-paths, answer-tags, audio-assets, boss-music, soundtest.
- Deliberate test changes, so you can see them:
  - archmage-rings: his order is 14 moves now. It still asserts that round 3's 12 moves are all in it.
  - tower-chase: rewritten for the new dark and the nine flights.
  - boss-music and audio-assets: the synth voicing is gone.
  - MASH_REPORT_ONLY: fallingtower's 'mini' entry is removed, because the Sexton now holds 0/6.
  - hint-shown-silent: one line (WINDED) dropped by `--write`. It came from the WEIGHT merge.
- Fixes along the way:
  - Three signs stood against the stair's right wall, and pixels caught them running into the stone. Each now stands one tile in.
  - A number() call with no hint-lines route is gone.

## Gates still open

- **DANIEL'S PLAYTEST GATE.** Nobody has played the stair or the fight by hand.
- **The warden is 0/7** against him after WEIGHT. That breaks "no hero at 0/N". She was already the marginal hero before WEIGHT: she won,
  but finished on 1-88 hp. WEIGHT cut the hero's health from 200 to 156. Health alone cannot fix this: at 720 the knight and pyro would be
  near 100%.

## Questions for Daniel (the recommended option is the one built)

1. **The warden 0/7.**
   - Rec: ship at 840, and have a WEIGHT follow-up look at the warden on the carpet (her damage output and the 156 hp), across bosses
     rather than in this one.
   - Alt: 720 health. The overall rate would be about 70% and she might get 1-2/7.
2. **Being thrown UP by the dark.** It sets you on the nearest standing ledge over its front with a small pop. It is a placement, not a
   ballistic throw.
   - Rec: keep it (it can never drop you into a gap).
   - Alt: a real knock-up arc.
3. **Dark damage.** 21 raw is about 28 at normal health.
   - Rec: keep.
   - Alt: 18 if the playtest feels punishing.
4. **The pendulum's answer.** You go as a weight turns over you, so the weight trails behind you. The sign says exactly that.
   - Rec: keep.
   - Alt: slower weights (period 3.2 s).
5. **Rule line:** "CLIMB. CRACKED STONE GOES AFTER THREE BEATS, AND HIS DARK RISES UP HIS STAIR UNDER YOU."
   - Rec: keep. It now names both machines the level runs.
