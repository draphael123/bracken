# claude/winch5 - THE WINCHMASTER 5 (Ore Road boss), scratch/brief-winchmaster5.md

Base: live master 3595a284. Commits: 4757230c (the design + bot hands), 968c49e5 (tuning, fixes, mash re-stamp), this report.

## What was built
- ORE ARMOUR (src/winchmaster.js, round seven): he wakes plated, packs ore (told: mode `plating`, the haul pose, plates
  forming, said) every time he takes the cable to a NEW housing (retreat or jam), and in phase two again after 12 s bare.
  Plated, a blade lands at 0.4 (B15 floor) and CLANKS `ORE: THROW IT` (main.js wardedDamage -> src/boss-read.js). The
  x0.05 chip is retired for him: he is on OWN_WARD in src/boss-greed.js (greed still counts outside openings).
- THE ROCK (new src/winch-rocks.js): E takes a rock off a loaded skip of his lines (riding it, or beside it level at a line
  end); one rock per skip per lap; skips stay loaded. Highlighted while he is plated (gold ring on the ore), `E: A ROCK`
  over the skip in reach, a one-time hint on first reach. ATTACK throws it along src/carry-throw.js's told arc (new kind
  `orerock`; ring turns gold when it will hit him). Hit -> winchRock: plates SHATTER, he is knocked onto his ledge,
  STAGGERED x2 (gold ring + timer, stands still), purse 12% of his health; then a told 3 s WARD (pale shell, blades 0.4,
  rocks turned) and he hauls himself back up the same housing BARE (whole damage) - or retreats if a quarter went.
  A blow drops the rock; THROW_KIND row `orerock` (carry speed).
- THE JAM stays a bonus (downed x2, purse 15%, shakes his ore off).
- ONE NEW TOLD THROWN ATTACK A PHASE (red !!, marks/answers/heights rows, MARK regenerated): P1 ORE TOSS (arcing chunk,
  red ring where it lands, thrown at where you will be), P2 SPILL (tips a loaded high-line skip over you: red strip under
  it, its ore drops), P3 THE CHAIN SWEEP (hook dragged low along his floor to 112 px - jump it). Rotation is now
  least-recently-used; stub check: no move over ~35% of his cycle (reverse 22 / send 26 / hook 26 / toss 26).
- Phase two: PLATED HE HOLDS HIS DRUM - he leaps only while bare.
- Kept: size, housings circuit, retreats, rockfall, brake bar at his feet (anti-mash), descent, phase three.
- Fixes found by the bot: phase three he rode off past a rider coming to him forever (now rides only at a hero on the
  other floor); his phase-three floor ran 24 px short of the deck's planks (a stand-still cheese spot); bot ladder-foot
  stalls.
- Bot hands (src/lab.js): read his plates, fetch a rock (ride / wait at his ledge's lip), throw on BK.winchRocks().aimAt(),
  hop the toss, step from under a spill, jump the sweep, cut him staggered.
- Numbers: hp 360 -> 480, WINCH_HIT 0.55 -> 1.3.

## Rates (campaign L10, practiced, 10 seeds per hero)
- WITH FLASKS (profile human): knight 8/10, warden 6/10, pyro 5/10 = 63% (band 60-70, no hero at 0), median 115 s.
- DRY (human+dry, reported alongside): knight 2/10, warden 1/10, pyro 1/10 = 13%.
- Mash: 0/6 (all TIMEOUT, 0 blows landed) - docs/mash-bot.json oreroad BOSS row re-stamped only (level hash unchanged).

## Checks (green, alone)
ore-road, boss-greed, boss-read, tells, throwables. A draw-on page run raised no page errors; canvas frames checked
(plates, toss ring, stagger ring + clock).
Test adaptation (same strictness, said here): tools/ore-road.mjs ROUND FOUR's "half while his drum runs" asserts became
"0.4 in his ore armour (>=0.4, <1)", the main.js regex now asserts winchTake + the purse, and the told-text regex asserts
the `ORE: THROW IT` clank; the circuit now also asserts the told plating on arrival; A1 lists twelve tells; the leap
scenarios set him bare (plated he holds his drum, asserted separately). New scenarios: rock/shatter/stagger still/ward/
back up bare/whole, retreat-in-stagger re-plates, rock during plating, P2 re-plate, purse, toss/spill/sweep hit+miss.

## Music picks (none downloaded - Daniel picks)
1. "Boss Battle #8 Metal" - nene - CC0 - https://opengameart.org/content/boss-battle-8-metal (guitar/drums + electronics)
2. "Mammoth" - congusbongus - CC-BY 4.0 / OGA-BY 4.0 - https://opengameart.org/content/mammoth (industrial rock, "constructing big war machines")
3. "Industria" - TrueCynder - CC-BY 3.0 - https://opengameart.org/content/industria (short piece for industrial areas / factories)

## QUESTIONS FOR DANIEL
1. The arena deck sign still says "CLIMB UP AND FIGHT HIM, OR RIDE A LOADED BUCKET INTO HIS DRUM". Rec: change it to
   teach the rock - but it changes the level's hash and drops the Ore Road LEVEL mash row (re-stamp needed). Built: left
   as is; the rock is taught at the point of use (E: A ROCK + one-time hint).
2. The housing ladders are kept (the brief says the bucket lines are the way in). Rec: keep - the rocks are only on the
   skips, so the rides matter; removing ladders is a geometry change.
3. A rock can be taken riding a skip OR standing beside one at a line end. Rec: keep - when he is on the Head Frame no
   line runs toward him from the west.
4. Phase two: he leaps only while bare (plated he holds his drum). Rec: keep - gives P2 a break-then-chase rhythm.
5. Opening purses: a stagger pays at most 12% of him, a jam 15% (the first run: one stagger took 80%). Rec: keep.
6. Hero spread with flasks k 8 / w 6 / p 5 of 10; dry 13% - he leans hard on flasks. OK per B6?
7. "Cutting a line" (brief item 2) was not added as a new move; he fights riders with REVERSE, THE HOOK, SEND, SPILL.

## Resumed: music + sign (10-08 night)
- MUSIC: "Boss Battle #8 Metal" by nene - licence on the page read: CC0. Downloaded opening (9.6 s) + loop (51 s) wavs, joined, mono, Vorbis q4 -> audio/winchmaster.ogg (588 KB), TRACK_INTRO 9.6 s (opening once, then the loop). Wired in TRACKS, MUSIC_CREDITS(+ROW), src/credits.js CC_BY row, audio/CREDITS.txt. The composed chase stays in src/boss-music.js unplayed; winchmaster dropped from NO_FILE_BY_DESIGN (audio-assets) and from the synth list in tools/boss-music.mjs.
- SIGN: 'HIS ORE TURNS A BLADE. THROW A ROCK FROM A LOADED SKIP. A LOADED BUCKET JAMS HIS DRUM.' (the longer suggested wording ran 3 lines; signs allows 2).
- Re-stamped: oreroad LEVEL mash row then BOSS row (still 0/6), level1-curve oreroad row. No pilot row exists for oreroad.
- Green alone: audio-assets, boss-music, soundtest, textfit (8520 screens, all zero), signs, ore-road, mash-gate, curve-gate (remaining stale rows are other levels, pre-existing). audio-assets --decode (browser) timed out/flaky under load (Failed to fetch on unrelated files); static pass green, ffmpeg decoded the ogg.
