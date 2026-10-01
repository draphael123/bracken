# claude/fairfix - the Harvest Fair brought to the reviewer's bar (layout + foes)

Base: claude/fairlevel 19601c0. Opus lane. Everything the review listed was approved by Daniel and is built here.

## Step 0: the fair as one branch

- Merged origin/claude/levelq (the level-quality lint), origin/claude/fairmusic (the `harvestfair` and `wickerqueen` synth tracks, `music.setTempo`) and origin/claude/fairboss (the Wicker Queen on her carousel).
- The tempo mismatch is fixed. fairboss called `music.tempo(rate)`, but in fairmusic `music.tempo` is a value, not a function. Now `updateWickerQueen` makes one call: `music.setTempo(1 + 0.32 * (organRate - 1) / (RING.speed[2] / RING.speed[0] - 1))`. The organ follows the ring from 1.0 up to 1.32. The old per-phase WQ_TEMPO line is gone; WQ_TEMPO is now only the fallback when there is no ring.
- The level plays `harvestfair` and the green plays `wickerqueen`. The green had been on 'houndmaster'.
- Deleted the stray untracked tools/level-quality.mjs in the fairlevel worktree. It matched levelq's copy except for line endings.
- The integration commit (2af4ccc) was pushed after wicker-queen, harvest-fair, audio-assets and boss-fight-end were green.

## The fixes, one by one

1. **Each high road now carries its own test** (src/harvest-fair.js).
   - Boardwalk: a mummer on the planks (col 110). THE BARKER, an elite, stands at the far end over the terrace (col 157). His call turns you round, putting your back to the planks' mummer, or, from the terrace, to the stair-top mummer.
   - Swing ride: a MARIONETTE on island A. You ride the chair toward it looking at it, so it comes to meet you. A horse at the near end of island B faces the way you come, so you land with your back to it.
   - Night lane: a mummer held only while its guttering lantern burns.
   - Corn-top walk: a scarecrow mummer in the full dark.
   - Hall of mirrors: a marionette by the door. The true glass that answers the mummer also works the marionette's strings.
2. **The exam is one space (525-619).**
   - The small carousel sits under a striped canopy. The canopy is dark, like the hall (a second entry in `L.halls`). It has two guttering lanterns, a true mirror panel at the far end and a cracked one at the near end. A mummer and a marionette ride it.
   - Then a rick, and the tall striker up to the night lane.
   - A blind stall wall (`L.blinds`) with a mummer behind it that creeps up unseen.
   - The gallery and the booth.
   - The barker on his crate.
   - The door guard on an unlit stretch (`L.unlit`). There it can be held only from 88 px, but it finds you from 176 px (`w.near` in horseStep).
3. **Nothing resolves itself.**
   - The slide now ends in a three-row drop over a horse stall cut under its foot. The stall's horse faces out, so it is at your back when you land. A mummer stands on the hill ahead: the combine.
   - The carousels' periods are 3.6 s and 3.4 s (were 5 and 4.5). A hop over the disc no longer resets the turn clock: the clock counts a rider up to 6 rows above the disc. The page test turns a hero who runs across and one who hops across.
4. **Signs cut from 15 to 8.** Dropped: 69, 130, 236, 311, 401, 520 and 562. The refresher is now "DON'T TURN YOUR BACK ON THEM." and nothing more.
5. **THE GHOST TRAIN** (L.chases, src/chase.js). The cutting is now 469-524.
   - The train comes out of the tunnel behind you. It kills on contact, like every other chase (the brief allowed kill).
   - Speed-ups are told: 60, then 74, then 86 px/s.
   - Three timed beams (periods 2.6, 2.3 and 2.9 s, each up for 1.2 s). You duck under one or wait for it to lift.
   - Two mummers stand a few steps before beams (478, 505). Running from the train means passing a mummer, and the next beam holds you with it at your back.
   - It runs over any foe it overtakes in the cutting (`runsOver`).
   - The shrine at 466 is before the start line. New `train` look.
   - The 470 heart is gone.
6. **Night at height.** A night sky (deep blue, stars, a moon) is painted behind the world, going to night with height the way the look does. The overlay is deeper (0.8, was 0.66). Warm pools sit under lit lanterns in the dark. The halls and the unlit stretch are dark. Captures: 08-night-lane, 01-boardwalk-barker.
7. **Hearts and shrines.**
   - The hearts at 470 and 597 are gone.
   - The checkpoint ceiling is now 200 route tiles game-wide. Changed: tools/checkpoint-rule.mjs (MAX), tools/checkpoint-thin.mjs (PICK_MAX 175, IDEAL 145), RULES B6/S4 and the LONGGAP line, docs/DESIGN.md B6, docs/LEVEL-DESIGN-GUIDE.md, docs/LEVEL-QUALITY.md and the checkpoint-gaps header. No other level's checkpoints were touched, and checkpoint-gaps is green for all 33 levels.
   - The fair has 5 shrines: 8, 199, 383, 466 and 600. Their route positions are 2, 193, 386, 470, 604, and the boss trigger is at 634. Gaps: 191, 193, 84, 134, 30. The level sets `checkRun: 200` so the filler adds none.
8. **Music lint** (tools/level-quality.mjs).
   - A borrowed track now fails: one played by any other campaign level, boss arena or mini, or a stock stand-in (`STOCK_MUSIC`: marketday).
   - The boss room's track is judged too. It may be the level's own or one of the generic `BOSS_POOL` (boss..boss4), never another boss's own.
   - A synth track (read from src/audio.js) counts as real.
   - Proof: on the pre-integration fair (19601c0) it says `FAIL music marketday BORROWED: also STOCK`. On this branch it passes with harvestfair / wickerqueen, and the Folly passes (musUnder / boss4).
9. **Housekeeping.**
   - The header now names the real shrine columns.
   - The gallery 2 comment says three targets.
   - "TICKETS 1" was not stuck. It is the level's ticket counter, and it stays while you hold tickets. It now sits on a HUD plate with a ticket icon and shows "n/8" toward the booth, and it hides in the green.
10. **New foes** (src/fair-foes.js, pure; art in src/redraw/fair_art.js).
    - **THE MARIONETTE** moves only while a hero LOOKS at it. One hero looking is enough in co-op, the mirror's look counts, and the dark shortens the look. Inside reach it jerks (a told 0.45 s '!'), then cuts at the chest. A shield turns the cut, a duck lets it over (HEIGHT high), and turning your back cancels it. It walks at 66 px/s, faster than a mummer creeps. Its strings are drawn into the dark.
    - **THE BARKER** is an elite (ELITE entry, `own`). He calls every 4.4 s with a told 0.8 s wind-up: the trumpet comes up, rings go out, you hear the horn, and the first time a hint shows. The call then turns EVERY hero in range to face him, each one in co-op, and holds the facing 0.9 s. A blow in the wind-up cuts the call. He swings his cane at close range (a '!' block).
    - Placed in: the hall, island A and the exam (marionettes); the boardwalk's end and the exam (barkers).
    - Supporting changes:
      - src/marks.js: BY_HAND, ANSWER and HEIGHT rows, then `tells --write`.
      - Bestiary cards.
      - THREAT weights: marionette 5, barker 7.
      - Death colours.
      - The windingUp list.
    - **one-new-foe needs no change.** It measures new kinds along the gate chain. The fair now brings two of its own (marionette, barker), so it stays green even once the Maskwright's Theatre, placed before it, shows the mummer and the hobby-horse first. harvest-fair now asserts both kinds are placed, every fair foe is a squad or an elite, and both barkers are elites.
    - **DENSITY now counts designed encounters.** One squad, one elite, one ambush room, the mini, or a clump of other foes within 8 columns each counts once, per 24-column screen. Documented in docs/LEVEL-QUALITY.md. The Folly reads 1.03 (32 encounters), and campaign walking levels read 0.68-1.56. Limits: 0.8-2.0 per screen, and at most 30% empty screens.
    - **The fair has 27 foes, every one in a designed encounter:** 18 mummers, 4 horses, 3 marionettes and 2 barkers, in 22 encounters.

IDEAS from the review:
- Built:
  - The slide-foot horse and the mummer on the hill (a pincer).
  - Beams in the chase.
- Not built (none needed for the bar; ask if wanted):
  - A horse's charge onto spikes hurting it.
  - A gallery behind you in the hall.
  - The tall striker as the maze-top exit.
  - A target on a wheel car.
  - Lanterns relighting as you pass.

## Level-quality (fair and Folly)

| measure | fair before (fairlevel) | fair now | Folly |
|---|---|---|---|
| flat (empty / level ground) | 9% / 23% | 4% / 26% | 11% / 33% |
| bands | 5, 42% | 5, 44% | 8, 61% |
| mechanics | 10 kinds, 5 developed | 10, 5 | 12, 4 |
| music | marketday (now FAILS as stock) | harvestfair / wickerqueen ok | musUnder / boss4 ok |
| secrets | 2 | 2 | 3 |
| checks | 6, 108 tiles each | 5, 130 each | 7, 103 |
| encounters | ok | ok | ok |
| density | 0.60 foes/screen FAIL | 0.84 encounters/screen, 24% empty ok | 1.03, 23% |
| slopes | drawn | drawn | none |
| route | 17 rows, 5 pockets | 17 rows, 5 pockets | 30 rows, 5 |
| **bar** | misses (density) | **CLEARS 10/10** | **CLEARS 10/10** |

## Pilots

- **Route pilot** (tools/fair-route.mjs: real keys, no god mode, foes removed):
  - Knight: LOW (gate to the green's door, through the ghost train), HIGH (wheel, three chairs, tower, slide) and STRIKE roads all green.
  - Pyro: all three green.
  - The pyro had failed HIGH (chair 0) and STRIKE on the untouched base as well. This was pilot tooling, not the level. Her longer jump carried her past island A, and her walk climbed the roof stair onto the boardwalk before the pad. The pilot now steers off a chair toward the island and counts the climb.
- **Wicker Queen bossLab** (normal health, salt 1): knight win 77.2 s (50 taken), warden win 105.7 s (16), pyro win 107.6 s (74). This is identical to fairboss's own after-numbers, so the integration changed nothing in the fight.

## Checks

Green by name:
- level-quality (fair 10/10, mage 10/10), harvest-fair, wicker-queen, boss-fight-end, boss-openings, chase, duck.
- checkpoint-gaps (every level, 200 ceiling), checkpoints, architecture, skins, dangling-paths, npc-removal.
- signs, sprinkle-cap, hint-shown, elites, audio-assets, tells, one-new-foe, answer-tags, untold-told, foe-tactics.
- slopes, slopes-trace (unchanged: it does not trace the fair), map-grammar, comments, homepaths.
- Also: floaters, spawns, collectables, deadends, keys, traps, killzones, audit.

Load flakes seen and rerun alone green: hint-shown and slopes-trace (both "the page never put up window.BK" under load). **FINAL CHECKS after merging master (batch50):** all 30 named checks above pass in one run ("30 of 232 checks pass - A SUBSET").

New assertions:
- harvest-fair: pure tests of the marionette, the barker and the dark horse; the high roads; the exam; the stall; the chase; the shrines; and a fourth page run (marionette, barker, co-op call, carousel crossed running and hopping, slide landing, train kill and run-over). tools/chase.mjs lists the fair.
- These failed first against the unfinished build: the chase zone bottom (the train never started), the slide's charge timing, the hall's count and the co-op marionette case.
- Mutation proof for the carousel: with the old rules (grounded-only clock, 5 s period) the page crossing gives run 0 / hop 0 turns. With the new rules it gives 1 / 1.

## Captures

work/claude/fairfix/fair-map.png (the full map) and work/claude/fairfix/after/:
- boardwalk-barker, islands, hall-marionette (+zoom), slide-stall, corn-top-dark
- ghost-train-chase in motion, ghost-train-beams
- exam-canopy, night-lane at night, blind-stall-barker, door-guard-unlit

New tool: tools/fairfix-shots.mjs.

## UNVERIFIED

- Nobody has played it. The chase's beams, the barker's call lock, and the dark door guard need Daniel's hands.
- The route pilot removes foes, so the fights on the high roads (island B horse, island A marionette) are proved only piece by piece: the islands' placement and the foes' page behaviour.
- The exam canopy reads dark-ish but not as dark as the hall in the capture (its disc skirt sits below the dark band).
- The slide-foot horse can rear while you are still sliding over its stall (it is within 7 rows), so its charge meets you as you land. The test asserts the charge comes from behind you.

## QUESTIONS FOR DANIEL (each with my recommendation; the recommended option is what is built)

1. **Foe count 27** vs the brief's 22-26. Rec: keep. Every one is a designed encounter. Cutting one would empty a screen and drop density under the bar (it passes at 24% empty).
2. **The ghost train kills on contact** (like the Falling Tower's chase), with a shrine 10 columns before it. Rec: keep kill. Alternative: 'hurt' 45.
3. **The barker's call locks your facing for 0.9 s.** Rec: keep, and tune after you play. 0.6 s would be gentler.
4. **The dark door guard finds you from 176 px but can be held only from 88 px.** Rec: keep. It is the exam's last question: close in fast or jump the charge.
5. **Checkpoint ceiling 200**, now game-wide, as you approved. The level filler still fills runs over 150 columns in other levels, which I left alone so no other level's checkpoints moved. Rec: leave the filler.
6. **The level-quality boss pool** (boss, boss2, boss3, boss4 may be shared by arenas). Rec: keep. Otherwise the Folly and two others fail on boss4.
