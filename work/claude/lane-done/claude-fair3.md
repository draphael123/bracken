# claude/fair3 - THE HARVEST FAIR, L3: THE WICKER QUEEN (the boss) + mummer polish

Branch `claude/fair3`, on top of `claude/fair2` 5315d1a (the approved L1 + the L2 art). `origin/master` merged before this report: already up to date.
Brief updated: `docs/briefs/harvest-fair.md` (the Boss section is the full record of what she does).

## What changed

- **THE FIGHT, `src/wicker-queen.js`** (pure, no DOM; the Abbot's pattern: every world action is a call, the frame's events are returned):
  - **The rule**: she moves ONLY while no hero looks at her (the mummers' facing rule from `src/mummer.js`, co-op: any hero facing her freezes her). While
    she moves the wicker creaks (her audio tell). **Her maypole ribbons keep turning while she is frozen.**
  - **RIBBON LASH** (red `!!`, 1.0 s told, 20 damage): out from the maypole across the whole green, LOW (jump) or HIGH (duck, `src/duck.js`), in a mixed
    order. Told by the mark, the word LOW/HIGH, a red band across the green at the height it will fly with an up/down arrow over each hero, a swish and
    three calliope notes - drawn over the dark, so it is never hidden. Each hero is judged once, the moment the ribbon reaches him, against his hurt box as
    it stands (ducked, in the air, or standing).
  - **THE SICKLE** (red `!!`, the mummers' 0.6 s red glow, 26 damage): only if she reaches you unseen; unblockable (it comes from behind); a look during the
    glow freezes her and cancels it.
  - **THE CROWNING** (no mark: it throws no blow): two mummers from the crowd, one behind the hero and one ahead; never more than two of hers alive.
  - **THE OPENING, THE BONFIRE**: turn your back to draw her across the green, turn round while she stands on the embers (the bonfire +-40 px): the wicker
    catches (0.4 s) and burns open for 2.8 s at 1.35x; the rest of the time the wicker takes a quarter. She is then flung back off the embers the way she
    came and they are BANKED (drawn grey) for 6 s. Crossing them unseen or being frozen short of them does nothing.
  - **PHASE 2, FULL DARK** (2/3): the green goes black (the game's own `L.dark` pass, with a warm edge on what moves); the look freezes her and her crowd
    only NEAR you - **a radius of 96 px on the side you face**, drawn as the light of your look. **PHASE 3, ALIGHT** (1/3): she lights the green (the full
    look is back), creeps 88 px/s (a hero runs 92) and leaves FIRE behind her; the embers still flare her (2.4 s).
  - 640 health, her base; no difficulty scaling added.
- **HER HANDS in `src/main.js`**: `updateWickerQueen` (the lash sweep per hero, the sickle, the crowning's spawns, the fire trail, the dark, her light),
  `drawWickerGround` (the embers, hot or banked), `drawWickerOver` (the lash band, the ribbons, the red glows, over the dark), `wqHoles` (the light of each
  hero's look, her tells, the embers, in the dark pass). The A8 wiring: EHP, COLS, spawn case, update dispatch, frame (`wqFrame`), death case (`bossEnd`,
  THE FAIR IS OVER), corpse frame, bestiary row + BOSS_T + BEAST_SHORT, hurt and death voices, the boss-death line, the boss bar (`wqBarName`: BURNING /
  FULL DARK / ALIGHT), `windingUp`, POISE/KNOCK skips, `bossOpen`, `BOSS_FELL`, her wake sound. `src/mummer.js`'s `mummerStep` takes an optional shorter
  look (`w.sight`) for her dark.
- **ART, `src/redraw/wicker_queen.js`** (fair2 style, px.js only, 14 frames 64x92, a woven lattice laid pixel by pixel): still, creep x2, sickle tell (red eye
  holes, the sickle up), sickle, lash tell (ribbons taut), lash, crowning (the wheat lit), catch, burn x2 (charred, the cage open on an ember heart), flung
  back, hurt, dead (a heap with the crown on it). Sheet: `work/claude/fair3/wicker-queen-sheet.png` (`node tools/wicker-queen-art.mjs`). Stills of the fight:
  `work/claude/fair3/1-...png` to `10-...png` (`node tools/wicker-queen-shots.mjs`).
- **SOUND** (synth, nothing downloaded): her creak, the catch, the burn, the bank, the sickle and its tell, the lash and its tell, the crowning's bells,
  the dark and the alight, her wake, her hurt and death voices. **Music: `houndmaster`** ("Boss Fight 2" by ansimuz, the benched Hound Master's track - no
  live fight plays it, so she has it to herself). Nothing downloaded.
- **THE LEVEL, `src/harvest-fair.js`**: the green is her arena (walls 622 / 667, 44 tiles inside, trigger 627, past the door), she stands past the bonfire at
  662; the door checkpoint (600) and the elite hobby-horse on the door (608) are as L1 built them; a sign by the door says the rule. **Her reward is the
  fair's one relic slot**: the felted soles lie hidden in the green (`bossDrop`) and appear where she burns; the roof cache over the gate lane that held them
  pays a purse of 7 coins now (deadends passes). The gate opens after her death and walking to it clears the level (`gateAfterBoss`).
- **THE BOT** (`src/lab.js`, bossLab): taught the bonfire opening - stand on the far side of the embers from her with its back turned, look when she is well
  onto them (near enough in the dark), cut her while she burns; face her while the embers are banked; jump the low ribbon, duck the high one; turn on a
  sickle glow (or outrun it when already running for the far side); cut down a crowned mummer that gets near.
- **boss-jump**: she is in the hidden boss table by herself (it reads every level's arena): `?boss=wickerqueen` loads, wakes and is cut down, and as the table's
  last row she is also one of the real-URL rows.
- `src/threat.js`: wickerqueen 6 (a boss is a 6). Fair INDEX 43 -> 48.
- **MUMMER POLISH**: no pilot or check showed a problem with the mummers' numbers, so none were tuned (creep 40, reach 22, glow 0.6, strike 14, horse as L1).
  One thing a check did show: `tools/newlevel.mjs` reported the mummer and the hobby-horse had no hurt voice (rule E9, they fell back on the generic cry), so
  both have their own hurt and death voices now (a wooden mask and cap bells; the carved head and bridle bells).

## The check, `tools/wicker-queen.mjs` (in `tools/check.mjs`)

**Red on the base first**: with the pure module and the check alone on fair2 it failed 6 assertions (the four mark/answer/height rows, windingUp, "the green
is not her arena"); the check was written before the wiring. Green now, in Node and in the page:
frozen when faced (a 90 s fuzz with the hero turning at random: 0 frames she moved while looked at, over 200 frames she moved while not), co-op any-hero and a
dead partner; the ribbons turn while she is frozen (low and high, each after its full 1.0 s tell); every attack told with its mark/answer/height (sickle !!
dodge low, low lash !! jump low, high lash !! duck high, crowning no mark), the bands catch a standing hero and miss a jumping (low) / ducked (high) one; the
bonfire opens her ONLY frozen on the embers (not short of them, not crossing unseen, not left alone for a minute, not on banked embers); phase 2 near-only
(a look from 220 px lets her creep, from 80 px holds her; phase 1 the far look holds); phase 3 faster (x1.5) with fire behind; the crowning never over two;
the level (arena, trigger past the door, her own music, door checkpoint, elite on the door, the relic as her drop, the gate after her). In the page: wakes
at the door, faced 0 px, back turned 35 px, lash 16 on a standing hero and 0 jumped (low) / ducked (high), sickle from behind with a `!!` 21, the embers ->
catch -> burn 2.8 s, a blow 22 burning vs 3 cold, phase 2 dark 0.86 with far 17 px / near 0 px, phase 3 dark 0 with fires, crowning max 2, co-op 0 / 35 px,
death: relic hidden then shown and picked up, gate open, walking to it -> win.

## Checks run

GREEN: wicker-queen, harvest-fair, boss-fight-end (46 fights, 241 s), boss-openings (+ her probe: short 0 / unseen 0 / on the embers burn 3.6 then 2.8),
boss-jump (46 fights, 545 s), tells, answer-tags, duck, and the 7 REQUIRED: architecture, checkpoints, skins, dangling-paths, boss-fight-end,
slopes-trace (unchanged; no level's trace moved), npc-removal. Also green: comments, collectables, deadends, floaters, spawns, threat-holes, one-new-foe,
signs, content-audit, checkpoint-gaps, checkpoint-rule, sprinkle-cap, map-grammar, elites, keys, traps, dressing, killzones, audit.
**NOT GREEN: untold-told** - one run failed on a CROW in the Stockade ("1 hit with no windup in the three seconds before, at 3.90 s"). Nothing in this lane
touches the crow or the Stockade (I added mark rows for the queen only, and the tables still pass tells/answer-tags/duck); a re-run to see whether it is
load-dependent was refused by the permission prompt, so it is UNVERIFIED whether it fails on the base too.
NOT RUN: the full suite (the release suite was running), textfit, pixels, soundtest, readability.

## Pilots (3 heroes x 1 seed, normal health, one life; AFTER only - she is new)

`node tools/wicker-queen-pilot.mjs 1 knight,warden,pyro`, final numbers:

| hero | outcome | seconds | burns (openings) | damage taken |
|---|---|---|---|---|
| knight | win | 61.3 | 6 | 11 |
| warden | win | 61.1 | 6 | 0 |
| pyro | win | 90.2 | 8 | 0 |

3/3 wins, median 61 s. How I got there: the first version (burn 3.6 s x2.2, bank 5 s) - knight won in 33 s on 3 burns; then 2.8 s x1.35, bank 6 s, the
lash 16 -> 20. The first bot also deadlocked (it faced a frozen mummer just outside its reach while the queen crept up behind); fixed in the bot (step in
and cut), not in her. The house band is 60-75% wins and a 90-150 s median: **the bot is a perfect reader** here (it knows her x, the ember edge and the
lash front to the pixel, and it sees in the dark), so its 100% and near-zero damage say the fight is readable and completable for all three, not that it is
too easy for hands. Daniel's hands decide; the lever if it is easy is the burn (2.8 s, x1.35) and the bank (6 s), never her health.

## UNVERIFIED

- Nobody has PLAYED her. The facing reads, the lure timing (the ember zone is 80 px: about 1.4 s of her creep in phase 1, ~0.9 s in phase 3), the 96 px
  dark look, how much the red lash band helps, whether her creak is audible under `houndmaster` - all by hand.
- The audio is unheard (synth written by numbers).
- In the full dark every moving thing gets the game's dark rim; on her (a 90 px sprite) it reads as a pale warm silhouette rather than a thin edge (see
  `work/claude/fair3/6-full-dark.png`). I think that suits an effigy in the dark, but it means you can SEE her anywhere in phase 2 - only the look is short.
- untold-told (above).
- Only the knight, warden and pyro were piloted; paladin, pirate, reaper, geomancer have not fought her. Co-op was checked in the page (one facing holds her),
  not played.
- The camera: her arena is 44 tiles (A7 says about 40); in the zoom view (up to 640 px) the green mostly fits; not checked on a small window.

## QUESTIONS FOR DANIEL (recommendation first; the recommended option is built)

1. **Her reward.** Built: the fair's one relic slot, THE FELTED SOLES, dropped where she burns (the roof cache that held them pays coins now). A fair relic is
   not obvious to me; the nearest idea is **THE MAYPOLE RIBBON** (the look reaches a little further, e.g. the mummers/her are held from 1.25x as far) -
   it would touch the level's own rule. Recommend: keep the soles now; if you want a fair relic, the ribbon, as its own small lane.
2. **Her music.** Built: `houndmaster` ("Boss Fight 2", benched with the Hound Master, played by no live fight). Alternative: `grandmother` ("Ghost Land",
   spookier, but it is Underleaf's boss). Recommend `houndmaster` until she gets a track of her own (a download needs your yes).
3. **Phase 2's look is a radius (96 px on the side you face)**, not a cone. Recommend keeping the radius: the fair's look has always been "facing its side",
   so a shorter reach is the smallest change a player has to learn.
4. **TIER.** The fair is not in main.js's TIER table (L1/L2 left it out), so its foes' and her health and blows do not scale like Waymeet (1.9) or the Fields
   (2.1); `tools/newlevel.mjs` flags it. Built: left out (your rule for this lane was no more health as the lever). Recommend: leave it out and tune by the
   burn window if she proves easy; adding TIER ~2.0 would raise her to about 960 and every mummer to about 80.
5. **Difficulty numbers.** Bot 3/3, median 61 s (band 90-150): see Pilots. Recommend: play her first; if easy, shorten the burn to 2.4 s or bank the embers
   8 s (both are one number in `WQ`).
6. **The crowning's second mummer comes in AHEAD of you** (in view, frozen at once), the first BEHIND (the threat). Recommend keeping one each side: two behind
   at once, in the dark, would be a pincer you cannot answer with one look.
