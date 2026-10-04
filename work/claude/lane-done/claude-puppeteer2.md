# claude/puppeteer2: THE PUPPETEER reworked (Opus, 2026-10-04)

Daniel, 10-02: the theatre is very good and the puppets are "pretty cool to fight" (minor polish later, not now). Rework the boss: three visits, his two slow attacks, a chained lever, no fall, four scene changes, real music.
Base: master 1dd5b181, then merged **origin/master 44c8e47d** (batch64: relics removed, leveling cards) and **origin/claude/weight bb65aba7** (COMMITMENT + STAMINA, not yet on master). All final numbers are on master + WEIGHT.
**Not shipped live:** he needs Daniel's playtest (design standard B9).

## Headline numbers (final build)

| | THEATRE3 (before) | PUPPETEER2 (after) |
|---|---|---|
| human-speed bot, 21 fights (salts 1-7 x knight/warden/pyro, L22, no skills, normal health, one fight per page) | 4/6 = 67% (2 salts) | **12/21 = 57%**: knight 5/7, warden 4/7, pyro 3/7 |
| fight length (wins) | 52-99 s | **85-180 s** |
| mash bot vs the Puppeteer (3 heroes x 2 seeds, L22) | 0/6 | **0/6** (all die, boss 96-100% left); level-1 variant 0/3 |
| visits to kill him | - | knight usually 4, warden/pyro 4-5 (cap 1/3 a visit) |

Measured with `node tools/puppeteer-bot21.mjs` (new). Tuning trail, 21 fights each:

| step | result |
|---|---|
| first build (visit x1.0, stagger 4 s) | 20/21, 47-141 s |
| tighter restring windows, harder slow attacks, stagger 3 s | 20/21 |
| visit x0.7, sturdier duo (pre-merge) | 16/21 |
| same, after merging master + WEIGHT | 15/21 |
| visit x0.58 | 12/21. **Rejected:** boss-greed's global rule wants a blow in an opening to land whole (>= 30 of 40), and the brief says "full damage" |
| x1.0 again + sturdier duo | 16/21 (3 visits, 69-169 s) |
| more duo health / harder hazards | 17/21 (the bot cuts strings and dodges told hazards, so neither moves it) |
| **final: visit x0.8** (the greed rule's floor is x0.75), hazards harder | **12/21 = 57%** |

## The fight (src/puppeteer.js header is the design; src/puppeteer-hands.js binds and draws it)

1. **The puppets are the main event.** The Harlequin and the Brute (phase 3: the masterpiece) are unchanged in how they fight. Green windows, clank, gold cuts and limp limbs are all as THEATRE3 left them.
   - Numbers changed: health (Harlequin 70, Brute 220, masterpiece 200) and down times (3.5 / 4.5 / 5.5 s, x0.92 per cycle, never under x0.75). Dropping BOTH is now a real timing check.
   - Phase 1 rest between blows: 0.6 s (was 0.9).
2. **His two slow attacks.** They take turns, never both at once, with a gap of 4.0 / 3.8 / 3.5 s by phase:
   - **The prop drop:** a sandbag or a painted set piece, onto a growing shadow (1.4 s, !!, 30).
   - **The snare line:** a line from the grid with a red bar, told 1.3 s at its wing. Both heights are marked across the stage. It sweeps slowly at 115 px/s: low is jumped, high is ducked (26, and it holds you 0.6 s).
   - Marks: `puppeteer|dropTell` (!!, dodge, low), `snareLowTell` (!!, jump, low), `snareHighTell` (!!, duck, high). They replace the whip and flail rows.
   - The house's constant throws, his whip and the per-cycle extra moves are gone, for a slow, deliberate pace.
3. **The lever** (the pin rail that sends the batten) is drawn chained with a padlock until both puppets are down.
   - A strike clunks and says once: `THE LEVER IS CHAINED: DROP BOTH PUPPETS`.
   - When both are down: the chain falls, the lever pulses with the house glint (src/stuck-guide.js drawGlint), a cue sounds, and the line `THE LEVER IS FREE: RIDE UP TO HIM` shows.
   - He stumbles along the gallery towards the batten end. You have 12 s (x cycle) or he strings them again (`TOO SLOW`) and the chain goes back on.
   - His drops keep coming while you go up (up under fire).
4. **No fall.** When you step onto the gallery he **reels** for 3.0 s: OPEN, x0.8, with a gold ring, a timer bar and a red bar for what is left of the visit.
   - A visit takes at most 1/3 of him. If the cap is spent, the visit ends at once.
   - Then the **told knockback** (1.0 s: his bar whirls, the gallery glows red, `HE THROWS YOU OFF THE GALLERY`). Anyone still up takes 12 and is thrown out over the stage, through the one-way gallery (main.js `fling`: a throw and a fall, never a teleport).
   - Then a scene change, the duo strung again, and the next cycle.
   - A hero on the gallery outside a visit is thrown down the same way, with no new scene.
5. **Scenes.** The four scenes are shuffled per fight (the fight's dice). Cycles 0-2 take the first three. **The fourth is the finale's mid-cycle shift:** the first puppet down in phase 3 brings it on (`THE SCENE SHIFTS`). A fourth or fifth visit reuses a scene, never the one just played.
   - Each scene's name is written over the stage as it comes in.
   - Every effect is told, and the first one is said once.
   - **No two tells ever run together** (his or the scene's).

| scene | what happens | how it is told |
|---|---|---|
| STORM | a gust shoves heroes (through main.js's wind pass, like the moor and the Windcaller) and makes the puppets drift. Brace by holding DOWN or block | the wing curtains billow first, then streaks |
| NIGHT | dark over the stage; two drifting spotlights; a little light round every hero. **A puppet out of the light cannot be hurt** ("fight in the light") | a spent puppet in the dark gets a dashed grey ring; `IN THE DARK: STRIKE IT IN THE LIGHT` |
| INFERNO | two sets of trapdoors take turns. Each glows and smokes 1.3 s, then burns 1.4 s (28). The strips between never burn | the glow and smoke, then the flames |
| SEA | a painted wave flat rises in a wing 1.3 s, then rolls the stage at 150 px/s (low: jump, 28) | the rising wave |

6. **Music.** `audio/puppeteer.ogg` is "Dissonant Waltz" by Yubatake, CC-BY 4.0, from the file Daniel approved. Nothing was downloaded.
   - The file is the first 234.239 s. `TRACK_INTRO.puppeteer = 34.135`: the opening plays once, then a 200.1 s loop on the waltz's return (band/pitch-class match 0.77, waveform 0.48 at the seam, plus the player's 30 ms crossfade).
   - Mastered to about -14.1 LUFS, -1.0 dBTP.
   - Credited in MUSIC_CREDITS (Sound Test row `"Dissonant Waltz" — Yubatake`), on the credits page (src/credits.js CC_BY) and in audio/CREDITS.txt.
   - The synth overture is deleted. audio-assets takes 'puppeteer' off NO_FILE_BY_DESIGN.

## Fixes found on the way
- The visit cap was keyed on `take < 1`. With any multiplier under 1, blows in his opening went down the "warded" branch, so the cap never applied and the ward line fired. It now keys on `pupOpen` (main.js wardedDamage).
- The first knockback threw heroes towards him, which could land them in the batten's well at the door. It now always throws out over the stage.

## Checks (named, never the suite)
**Green on the final build:**
- puppeteer, theatre, boss-openings, boss-greed, boss-fight-end
- boss-navigation (the theatre row run alone: the longwater/reaper row ahead of it fails on this merged build; see UNVERIFIED)
- mash-gate, level-quality, stuck, corpses
- tells, hint-shown, answer-tags
- audio-assets, boss-music, soundtest
- architecture, dangling-paths, slopes-trace
- textfit (hints, bestiary, soundtest, credits, plates; its one TRUNCATED is the Djinn's bestiary name, not mine; the full run timed out under load)

Rewritten for the new rules (each says why in its header):
- **tools/puppeteer.mjs**: every rule above, pure plus page. Red on the THEATRE3 module.
- **tools/boss-openings.mjs** theatre row: both down frees the lever and opens nothing; up on the gallery he staggers open for >= 3 s. The scripted cutter now gets 120 s, because the duo is sturdier and WEIGHT commits swings.
- **tools/boss-greed.mjs**: the theatre "opener" row samples the stagger.

Also:
- tools/puppeteer-shots.mjs shows the new beats (SHOTS_OUT to redirect).
- tools/puppeteer-bot21.mjs is the 21-fight band.
- docs/mash-bot.json theatre boss rows were re-stamped by the bot (`mash-bot.mjs theatre --l1 --probe --write`). The level row was carried.
- tools/hint-shown-silent.txt was rewritten with `--write` (the merge removed a WINDED line).
- **tools/boss-navigation.mjs (a rules change):** the theatre row gets 300 s (every other row keeps 180). The fight is 2-3 minutes now. At 180 s the knight had already ridden up and stood on the gallery, but timed out with 10% left; at 300 s it kills him in 200 s.
- **The credits page:** a fourth CC-BY credit did not fit on one page (textfit COLLIDE x3 with the footer). The CC-BY credits are now two to a page (src/credits.js CCBY_PER), and the 'ALL THE REST IS CC0' line is on the last of them. textfit credits+soundtest: 0 problems.

## UNVERIFIED
- **Nobody has seen or heard it.**
  - I looked at stills (tools/puppeteer-shots.mjs): the chain, the night's dark and spotlights, the flames, the snare bar and the reeling ring all draw.
  - Not checked: the sea's wave (small, 18 px), the curtain billow, how readable the chain and padlock are at 1x, and the loop seam by ear.
- **Co-op is not tested.** The knockback flings each hero on the gallery; the gust shoves through each player's wind pass.
- boss-navigation fails on its **longwater/reaper** row on this merged build, before it reaches the theatre. That row is not mine (it is probably the WEIGHT merge). The theatre row was run alone and is green.
- The page check's human-bot row now asks the bot to FINISH him with refill health while taking real damage (as boss-navigation does). At 57% a single normal-health seed is a coin toss, and the win rate is the 21-fight band.

## QUESTIONS FOR DANIEL (the recommended option is built)
1. **A visit pays x0.8, not "full damage", so a visit is usually about 1/4 of him** (the cap stays 1/3, and a strong visit hits it). The fight is 4-5 visits.
   - At x1.0 the bot won 16/21 in 3 visits. x0.75 is the floor the global greed rule allows.
   - *Rec: keep x0.8.* *Alternative:* x1.0 and accept about 75%.
2. **The 4th scene is the finale's mid-cycle shift** (the first puppet down in phase 3). *Rec: keep.* *Alternative:* a random 4th-cycle scene only.
3. **Night rule: a puppet in the dark cannot be hurt.** *Rec: keep* (it makes "fight in the light" a verb). *Alternative:* visual only.
4. **The audience no longer throws** (THEATRE3's house props), and his whip and flail are gone. His two slow attacks replace them, for the slow pace you asked for. *Rec: keep.*
5. **The duo got more health and shorter down times.** That is tuning, not new moves. *Rec: keep;* polish them in your puppet pass.
6. **Two check rows changed with the design:** tools/puppeteer.mjs's bot row now uses refill health (finish him, take real damage), and boss-navigation gives the theatre 300 s. *Rec: keep* (a 2-3 minute, 57% boss cannot promise a win on one normal seed inside 180 s).
