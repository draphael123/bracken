# claude/fair1 - THE HARVEST FAIR, L1: brief + greybox + the facing mechanic (STOPPED FOR DANIEL'S APPROVAL)

Branch `claude/fair1`, based on `claude/chase` a4a1efc (batch45 + the universal duck + the chase engine). `origin/master` merged: already up to date (master is
behind this branch). Nothing of L2 (art) or L3 (the Wicker Queen) was started.

## What changed

- **THE FACING MECHANIC, `src/mummer.js`** (pure, reusable by any level): a hero LOOKS at a foe when he is alive, on the same screen and facing its side.
  - **THE MUMMER**: moves ONLY while no hero faces it; freezes the frame it is looked at; a frozen mummer can be hit (the knight kills it in 3 blows, hp 40);
    cap bells JINGLE while it creeps (the audio tell, silent when it stands); within 22 px its mask GLOWS RED for 0.6 s (the visual tell, plays the game's
    wind-up sound) and then it strikes for 14 (unblockable: it comes from behind you); a look cancels the strike.
  - **THE HOBBY-HORSE (the elite)**: charges the moment a back is turned (0.45 s rear first, a look cancels it), a committed 190 px run at 230 px/s for 22,
    freezes where the charge ends (a haystack, wall, spike or pit edge ends it early), and will not charge again until it has been looked at once.
    Being ELITE it holds the green's door: the door is shut until it is dead (the game's own elite gate machinery, `eliteGate`/`eliteWatch`).
  - **CO-OP: a foe is frozen if ANY hero faces it**; it moves (and the horse charges) only when EVERY hero has his back to it. Said in both bestiary cards.
  - **THE CAROUSEL** (`L.carousels`): a rider is turned round every 5 s (4.5 s on the small ride) after a 1.3 s warning (calliope phrase, "THE RIDE TURNS",
    bulbs go red) and cannot turn back for 0.5 s (under the mask's 0.6 s glow, so a turn never lands a blow he could not answer). New `P.faceLock`, read in
    the two movement lines that set `P.face`.
  - Hooks in `src/main.js`: `updateMummer`, `updateFair`, `drawFair` (canopy, painted horses, hay over the spring caps, maypole, bonfire), spawn cases,
    `EHP`, `COLS`, ELITE row, `windingUp`, frame picks, bestiary rows, six SFX in `src/audio.js`. Greybox art `src/redraw/fair_greybox.js` (placeholder).
- **THE LEVEL, `src/harvest-fair.js`** (W 672 x H 36, placed wholly by hand, no garrison sprinkle, no filler; appended to LEVELS so no index or save moves):

  | section | columns | beat | encounter |
  |---|---|---|---|
  | THE GATE | 0-118 | TEACH | ONE mummer alone on a flat lane, three signs; then a stall-roof hop and a 3-wide spike pit |
  | THE STALL STAIR | 118-246 | DEVELOP | a PINCER on a 12-tile slope climb: two mummers you pass at the foot come up behind you, one waits at the top |
  | THE CAROUSEL | 246-374 | TWIST | the ride turns you (warned); a mummer at each end, the one you froze is behind you now |
  | THE HAYRICKS | 374-502 | COMBINE | two hobby-horses and three haystacks (the Sporewood cap bounce) each with 3 tiles of spikes past it; the third throws you to a ledge with a silver |
  | THE LAST ROUND | 502-620 | EXAM | a mummer, a small ride with a mummer AND a horse on it, a haystack over spikes, another mummer, and the elite door guard |
  | THE MAYPOLE GREEN | 622-672 | boss room (greybox) | door (shut by the elite), checkpoint before it (col 600), maypole, bonfire, gate at the far end. No boss |

  Nine mummers, four horses (one elite). Checkpoints 8, 124, 252, 380, 508 and the door's 600 (92-128 apart). Sunset to dusk over the length
  (`duskStart/duskLen`, per-section tints), music `marketday`. Rule: DON'T TURN YOUR BACK ON THEM.
- **WIRING**: `fair.needs = waymeet`, `fields.needs = fair`; map node `fair` at (72,148) between Waymeet and the Hexed Fields, `INLAND_PATH` gets the point;
  `src/dressing.js` (`fair` uses Waymeet's stalls, bunting, hay and lanterns), `src/threat.js` (mummer 3, hobbyhorse 4), `src/marks.js` (rows for
  `mummer|glow` and `hobbyhorse|rear`: `!!`, dodge / jump, low), `tools/additional-areas.mjs` (the chain now names the fair), `tools/check.mjs` (`harvest-fair`).
- **BRIEF** `docs/briefs/harvest-fair.md`, committed. **CAPTURES** one per section: `work/claude/fair1/1-the-gate-teach.png`,
  `2-the-stall-stair-develop.png`, `3-the-carousel-twist.png`, `4-the-hayricks-combine.png`, `5-the-last-round-exam.png`, `6-the-maypole-green.png`
  (`node tools/fair-shots.mjs` remakes them; god mode, placeholder art).

## The new check, `tools/harvest-fair.mjs` (also in `tools/check.mjs`)

Red on the base first: run on a4a1efc + the check alone it died `ERR_MODULE_NOT_FOUND src/mummer.js`. Now green: the pure rule (looks / co-op any-hero-facing; a
fuzz of 3,600 frames with the hero turning at random: zero frames a mummer moved while faced; freeze on the look frame; bells only while it creeps; glow told
0.6 s and cancelled by a look; the horse rears, charges committed even if the hero turns, freezes where it ends, no second charge until looked at, a look
during the rear cancels; the carousel warns before it turns and turns nobody who is not on it), the level (exists, wired, rule, brief, map order, a facing
encounter in every 100 columns, the arc teach/develop/twist/combine/exam with its shape, slopes in the climb, 12 haystack tiles, the green with its door,
checkpoint before it, none inside, gate, no boss, the elite holding the door), and IN THE PAGE (a faced mummer moves 0 px, a turned back makes it creep with
bells, the strike hurts from behind, a look during the glow cancels it, a frozen mummer dies in 3 blows, co-op one hero facing = frozen and both away =
creeps, the horse's rear/charge/skid and stand-still and re-arm, the carousel's warn then turn then facing lock then release, the elite's door shut then open).

## Checks (all green)

harvest-fair, tells, answer-tags, comments, map-grammar, sprinkle-cap (the fair is "by hand"), checkpoint-gaps, checkpoint-rule, checkpoints, architecture,
skins, dangling-paths, npc-removal, boss-fight-end (45 fights, 237 s), slopes-trace (unchanged: the tool does not need the fair added - it drives four
named levels, not every level, and no other level's frames moved), additional-areas (+ runtime), elites (41, the fair's door opens), signs, one-new-foe,
threat-holes, content-audit, audit, floaters, spawns, killzones, collectables, keys, deadends, dressing, traps (the one open trap is `keep`'s and predates
this). NOT run: the full suite (a release suite is running), textfit, pixels, soundtest.

## Numbers

INDEX (tools/curve.mjs): the fair reads **34** (13 foes, threat 51, 2 kinds, hazard 33, worst gap 128) against the ~117 target; Waymeet 113, Fields 136.
The body-count INDEX cannot reach 117 in a level that has "fewer, better foes" (that would take about five times the bodies), so curve.mjs now prints
"fair is 79 EASIER than waymeet" and "fields is 102 harder than fair - a wall" (12 out-of-line steps, was 10). curve.mjs is advisory, not in the suite.
See QUESTION 1.

## UNVERIFIED

- Nobody has PLAYED it. Real hands decide: the mummer's 40 px/s creep, the 22 px reach and 0.6 s glow, the horse's 0.45 s rear vs 230 px/s charge, the
  pincer's spacing on the stair, the carousel's 5 s period, the haystack ranges (spikes are 3 tiles past each rick, sized off the -400/-480 bounce, not walked
  with all six heroes), the greybox pace. The bot walked none of it; only the scripted page tests above ran.
- Only the knight was driven (co-op with the warden). Pyromancer/Freebooter/Paladin/Reaper/Warden have not walked the fair; the climb is slopes (uphill is
  slower for everyone) and the hay bounce is shared, so nothing should be hero-specific, but it is untested.
- The mummer strike and the horse's charge were made unblockable (they come from behind); the marks are red `!!`. `tools/answer-tags.mjs` lists the fair as
  asking for only two of the four answers (dodge = look, jump) - an advisory, not a failure.
- `tools/pacing.mjs`: 2 creatures within 2 tiles of a landing (the mummer at 313 and the small ride's horse at 547, both at a disc edge). By design (the
  ride's ends) but a play-tester should say if it feels cheap.
- The carousel disc, haystacks, maypole and bonfire are drawn by `drawFair` from rectangles; the haystack draws OVER the spring-cap tile art. All placeholder.
- The map node position (72,148) passes map-grammar but its label was not looked at on the map screen.

## QUESTIONS FOR DANIEL (each with my recommendation; the conservative option is built)

1. **INDEX ~117 vs FEWER, BETTER FOES.** The INDEX counts bodies, and the fair (13 foes) reads 34, which the curve tool calls a collapse after Waymeet and a
   wall before the Fields. Adding bodies would break the sprinkle rule. Recommend: leave it, and (a) raise the mummer to 5 and the horse to 6 in `src/threat.js`
   (a mummer is constant attention, the elite is a 3x weight) which lifts it to about 45, and/or (b) give the tool an "authored encounter" credit later.
   Built: 3 and 4, index 34.
2. **The carousel's forced turn.** It flips the rider's facing and locks it 0.5 s. Alternative: no lock (a turn you can undo instantly). Recommend keeping the
   lock: without it the twist is one keypress. Built: lock 0.5 s.
3. **Strikes are unblockable (red `!!`).** A shield cannot cover your back. Alternative: blockable yellow `!` (a Knight with block held). Recommend
   unblockable, so the ONLY answers are look (mummer) and jump/haystack (horse), and the rule stays the level. Built: unblockable.
4. **The elite guards the DOOR and the checkpoint is 8 tiles before it** (col 600, horse at 608, door 620). You can hop the horse and reach the door with it
   alive behind you; it stays shut until the horse dies. Recommend keeping (facing it kills it for free). Built as described.
5. **The horse charges the way it faces you, then a look re-arms it.** A hero who never looks back after the first charge is never charged twice. Recommend
   keeping (it rewards the look, which is the level's whole verb). Alternative: re-arm on a timer. Built: look re-arms.
6. **Haystack art** is a golden mound over the existing spring-cap tile (the Sporewood cap). L2 should give it real art and a rustle sound; the tile stays a
   BOUNCER so the bounce is the shared code.
7. **Level furniture not built** (greybox): a shop or shrine, three quest strays, three silvers, a relic, a hearts/`mend` after the hard stretches, a second
   hard-road fork (F7, S5, S7). Only one silver (the third rick's ledge). Recommend L2, with the art.
8. **Music**: `marketday` is a stand-in (Waymeet's neighbour track). The "music box that winds down" idea needs a track or a tempo ramp in `src/audio.js` (L2).

STOPPED FOR APPROVAL.
