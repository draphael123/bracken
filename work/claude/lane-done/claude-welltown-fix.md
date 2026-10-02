# claude/welltown (the FIX lane) - THE WELL TOWN after the review, on COMBAT3

Opus, 2026-10-02. Worktree branch `claude/welltown`, from the greybox 52c948d2. `origin/claude/batch55` (master + COMBAT3 + CANALART) is merged in.
The work list was the reviewer's welltown review (in the lanes' scratch folder, outside the repo), items P1 and P2, plus Daniel's decisions. Nothing ships without Daniel.

## What changed

### The merge, and THE BANDIT KING on COMBAT3 (P1 #3)
- Merged `origin/claude/batch55`. In `tools/check.mjs` every name from both sides is kept: the COMBAT3 names plus `welltown`.
- `src/boss-greed.js`: one new row, `banditking: e => e.mode === 'open'` (the steam opening). No other row was touched.
- **One chip.** His own local x0.05 (`KING.chip`) is gone. The global rule is now his only chip:
  - `kingTake` is x2.6 in the opening and x1 outside it, and `bossChip` makes that x0.05.
  - So there is one chip line, `A SCRATCH: WAIT FOR HIS OPENING`. His `THE MUD PLATE TURNS IT` line is deleted.
  - The room's blows land whole; only a hero's blow is chipped.
  - Greed (4 blows in 2.5 s outside the steam) is answered by the global reprisal.
- His walk frame was fixed: `KING_F.walk` is an array, and `H.frame` handed it to `drawSet` whole. This was the source of textfit's 22 page errors in his arena.

### THE SHADE PLAN (P1 #1, #2)
- **15 market awnings** (`awn()` in `src/well-town.js`). Each is the caravan's own awning prop, and its shade is `SHADE_OF.awning`'s span, so the art and the rule cover the same pixels. They stand over:
  - the gate's steps
  - the market stair
  - the square (two of them)
  - mud wall one
  - the mud-quarter well (two of them)
  - the lane's step
  - roofs A, B, C and E, and the terrace
  - the Kasbah street
  - the deep well
- The **well-house roof is solid** (157-162), with a shade rect.
- The **dovecote's inside is shade**: the 18 rungs are now the breather before the roost.
- The roofs' bandits stand inside their roof's awning.
- **THE SUN check** is in `tools/welltown.mjs`. It walks the pacing route, filled in at a quarter tile, up to his courtyard. No stretch between two shades may be longer than `SUN.maxWalk` (5 s).
  - Longest now: **4.7 s** at the gate's first well, where the sun is taught.
  - Longest before: 11.4, 9.1, 8.8 and 7.5 s.

### The water budget (P2 #5)
- `tools/welltown.mjs` now counts one drink for every sun stretch over `maxWalk`, and one stolen sip at every thief squad.
- It failed on the roost leg at the barricade, as the review predicted.
- Fix: a **one-sip WATER JAR on roof C** (364). It is a `skinwell` with `jar: true`, gives one sip, once a life, and is not a well.
- A new assertion: the barricade still has its sip.

### The set piece and the windlass (P2 #6, #7)
- **The ride is contested.** When the bucket goes down, the well-head thief and a square cutthroat (`follow: true`) come down the well after you to the bucket's foot (`THEY COME DOWN THE WELL AFTER YOU`).
  - The cistern's own well is held by two scorpions (183, 186).
  - CP2 moved to 194, past them.
- **The cistern choice is built.** From 197 to 238 the vault is raised three rows, and a gallery runs over the pillars' caps.
  - A ladder goes up at 197; you drop down at 238.
  - The gallery is the round way, past the sump's squad, with water-skin two at its end. The floor is the quick way.
- **The exam's last well (448) is a DEEP WELL.**
  - Strike its windlass (446) and the bucket winds up in 2 s, under the ledge bowman and two thieves.
  - A fill sends the bucket down again.
  - E at it before then says `THE BUCKET IS DOWN: STRIKE THE WINDLASS`.
  - `ARCS.windlass` now has an exam entry; level-quality counts windlass x2.

### Pours under threat, and foes that use the rule (P2 #8, #9)
- A **second perch** (pole and boards at house D's west end, bowman at 368,14) covers the burning barricade.
- The **lane-two pair** now stands just past MUD WALL ONE, in its awning, so the pour opens onto them.
- The **gate pair** stands on the mud house's steps, under an awning, so the optional pour is taught with them watching.
- **Roof pairs B and E** stand in their roofs' awnings.

### The rest of the P2 list
- **E at a well with a full skin** now falls through to the pour or the drink (`src/well-town-hands.js`). So E beside the courtyard well pours on a burning King.
- **CP3** moved from the mud-quarter well to **roof A (326,17)**, outside the dovecote's window. Route checkpoints are now 78 / 198 / 343 / 489. The gaps are 120 / 145 / 146, against 114 / 99 / 198 before.
- **DANIEL: a checkpoint respawn refills the skin.** `H.reset` on a respawn fills every player's skin.

### Daniel 10-02: no relic
- The vault now pays the third silver and three coins.
- Removed: the gourd's `RELICS` entry, its icon (`bakeGourdIcon`), its fourth sip, and its check. The vault and its key route stay.

### Music
- **The level track** is `audio/welltown.ogg`, Dizzy Crow's "Desert Calmness and Fighting (Orchestral)", CC0. It was already on disk; nothing was downloaded.
  - The file is Negev-Desert-Intro (7.000 s) followed by Negev-Desert-Loop (42.000 s).
  - Gain: +5.6 dB under a peak limiter, giving **-12.5 LUFS** and a -1.1 dBFS peak. Encoded to Vorbis q4.
  - `src/audio.js` has a new small `TRACK_INTRO` (`welltown: 7.0`). The first pass plays the whole file; every later pass starts at 7.0 s.
  - Credits are in `MUSIC_CREDITS`, which also feeds the credits page, and in `audio/CREDITS.txt`.
  - The `caravan` placeholder is gone, and welltown's `music` row is deleted from `REPORT_ONLY`.
  - **The Fight intro and loop are left on disk.** The engine has no combat-layer swap: `TRACK_LAYER` is a constant under-layer, and the chase swap is for chases. See question 1.
- **THE BANDIT KING's theme** is in `src/boss-music.js`:
  - D Phrygian dominant in 6/8, eighth 0.263 s, 16 bars = 25 s.
  - A war-drum ostinato, with a roll every fourth bar.
  - A D-A drone.
  - A reedy zurna lead: square plus saw, a scoop into each note, and a late vibrato drawn as pitch automation (no LFO oscillator).
  - A half-step off-beat stab (D, then Eb).
  - **Phase two** (`banditking:p2`, played when his men take the well) is faster (eighth 0.21 s), with the zurna an octave up and the drum doubled.
  - His own Sound Test entry: `MUSIC_NAMES` plus a credit.
  - `tools/boss-music.mjs` asserts 6/8, the faster phase two, the octave, and the augmented second.

### P3 and P4
- E over a well while the skin is not full ("E WIND" over a deep well that is down), and a rope and bucket on the deep well.
- The gatehouse top is two rows lower (bowmen at row 18, 144 px over the street).
- `src/level.js`: the canal's comment is back on its own line.
- The concept page is re-synced: the gallery, the contested ride, the deep well, the shade plan, no trough fire, no relic, and the music.
- `tools/welltown-route.mjs`:
  - Every hit point lost is booked to what dealt it (SUN or the foe), with tallies per leg.
  - New legs: CP2, the jar, the deep well.
  - With `god=0` it fails if the foes deal under half of the damage.
- Pilot kills went from 0 to 4-5 (the level-1 pilot now finishes some desert foes). The play bot's target list was not touched.

## Numbers, before -> after

| measure | before (greybox, pre-COMBAT3 caches / the review) | after (this branch) |
|---|---|---|
| longest open-sun walk on the route | 11.4 / 9.1 / 8.8 / 7.5 s | **4.7 s** (gate, teaching), then 4.2 / 3.4 / 3.0 |
| route hand, knight, no god, no drink, no block | 16 deaths in 889 s, never reached the barricade; sun 88% of damage | **reaches the courtyard, 0 deaths, 271 s**; foes **67%** of damage (SUN 88, archer 84, scorpion 78, cutthroat 13) |
| level-1 no-ability pilot (knight, 3 runs) | 81 blows, 3 deaths, 0 kills | **33 blows, 0 deaths, 4 kills** |
| mash bot, boss | 0/6 | **0/6** (all heroes die; boss left 75-95%) |
| mash bot, level | knight and warden die, pyro 6% | knight **dies**; warden 22%, pyro 30% (all under 40%) |
| human bot, THE BANDIT KING (21 fights, normal health) | 15/21 = 71% (knight 7/7, warden 3/7, pyro 5/7) | **15/21 = 71%** (knight 5/7, warden 3/7, pyro 7/7), median win 69.5 s |
| checkpoint gaps (route tiles) | 78 / 114 / 99 / 198 | 78 / 120 / 145 / 146 |

**The death spike.** Neither the route hand nor the level-1 pilot dies any more, so there is no spike left to ease and nothing was eased. The mash target holds: the knight dies.

**The boss by hero.** The knight is no longer the outlier, so the review's red phase-two sweep was not built. The warden's three losses are long fights:
- 106-140 s, needing 6-8 openings against the knight's 3-4.
- His boss-left at death was 6-25%.
- In his `hitBy`, the King was telling the knives for only 57 of about 700 points, so a HIGH knife fan would not move him.

Neither change was made; see question 2.

## Checks (run by name, all green on the final branch)

welltown (32 asserts), welltown-probe (18), level-quality (welltown: CLEARS, and the music WARN is gone), boss-greed, mash-gate, boss-music, soundtest, audio-assets, tells, hint-shown, architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, npc-removal, slopes-trace, dressing, one-new-foe, sprinkle-cap, floaters, signs, boss-openings, boss-fight-end.

- **slopes-trace** was rebased for welltown only (`--rebase=welltown`), because the gatehouse top was lowered two rows. The other five levels are identical.
- **textfit**: 0 welltown items after the frame fix. Its remaining flags are other levels' and not this lane's: the fair sign "TICKETS 0/35", the theatre's bossjump title, and 7 long hints elsewhere.
- **audio-assets --decode** timed out in the page; this is a pre-existing load issue. welltown.ogg was decoded and measured with ffmpeg instead.

## UNVERIFIED
- Nothing was played by hand and no screenshots were taken. These are not seen on screen:
  - the awnings standing on the roofs
  - the men dropping down the well (they are placed falling at the bucket's foot)
  - the deep well's greybox rope and bucket
  - the jar
  - E over a well
- The music is not listened to by a human: the intro-to-loop seam (the engine's 30 ms crossfade) and the King's theme by ear.
- Co-op: INTERACT is still player 1's only (see question 4).
- The map node is unchanged (welltown 206,146 and the WELL STORE). The map was re-laid on `claude/mapspace`, which is not merged; when it lands, the desert nodes must pass that branch's map-spacing check. INLAND, COAST and CRAG were not touched.

## QUESTIONS FOR DANIEL (the recommended option is built)
1. **The Fight intro and loop** (Negev-Fight) are on disk and unused: there is no combat-layer swap in the engine. *Rec:* a small music lane adds a section swap (the roost and the Kasbah play Fight) using the same `TRACK_INTRO` trick. *Alternative:* leave the calm track alone.
2. **The King by hero** is knight 5/7, warden 3/7, pyro 7/7 (71% overall, in band). *Rec:* keep. The warden is the slow-damage hero and his losses are close. *Alternative:* the review's levers (a red phase-two sweep, a HIGH knife fan), which the data does not point at.
3. **Difficulty after the sun fix.** The level-1 pilot now takes 33 blows with 0 deaths (the canal fix landed at 69 and 9). The mash knight still dies. *Rec:* keep it and judge it in a human play. *Option:* the review's upgrade A (a Firebrand reskin of the slinger) as the kill-first foe that hardens the square.
4. **Co-op INTERACT.** Player 2 cannot fill, pour or drink. *Rec:* wire `WTH.interact` for both players, as `asPlayer` does elsewhere (a small lane).
5. **Roof C's one-sip jar**, added for the water budget. *Rec:* keep. It is not a well, so drinking on the roost is still a choice.
6. **Shade over the deep well and the gate's steps.** I shaded both so that the foes, not the sun, carry the exam (the hand died there in the sun). *Rec:* keep; the walk to the well is still the sun's.
7. **Upgrades from the review that were not built:** A (Firebrand), C (the cistern ambush), D (the roof awnings as weapons, the strongest). *Rec:* D next, as a small lane.
