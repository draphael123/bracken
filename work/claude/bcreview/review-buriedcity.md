# REVIEW: THE BURIED CITY + THE HOURGLASS KING - read-only, BCREVIEW lane, 2026-10-09
Worktree bracken-bcreview (claude/bcreview off claude/buriedcity 9ab2cf71), port 8785. No src/ or tools/ changed.
Evidence: shots in work/claude/bcreview/shots/ (b01-b22, 2x game canvas, god mode); real-key probes work/claude/bcreview/probe-*.mjs; walk.log / route.log beside them.
Compared against Mage's Folly + design-standard v2 + common-1008.

## 0. HEADLINE
The rule is the best-built of the desert arc: one sentence true to the code, an E verb on every room, the state drawn (sand body, roof streams, OPEN/SHUT + gauge on each lever), four distinct uses,
a real teach > test > remix > exam arc. The resume pass fixed the right things. Three things are wrong:
1. THE KING'S LEVERS CANNOT BE PULLED IN PHASES 2 AND 3 (real keys, knight/warden/pyro). Phase two's sand banks bury both levers and the pull test rejects a hero standing on the bank.
   The "opening is the level's verb" is dead for two thirds of the fight; the lane's 61% was won on phase-one openings + brass chip.
2. THE CITY LOOKS LIKE OPEN DESERT. Every street shows a sunset sky, a sun disc, clouds and dunes. "Buried under a sand roof" exists only in the data.
3. DIFFICULTY IS STILL ~ZERO: walker arrives 98/100/98% (target < 50), 1-2 blows in the whole level at L36. Where weight goes: section 4.
Plus an A10 gap: the trap hall's open floor-gate is a real, silent, UNTAUGHT death.

## 1. SCORES (design-standard v2)
- RULE USE (A1-A5): 10/12. A1 true to code 3/3; A2 verb 3/3; A3 state drawn 2/3 (the spike cellar's stakes are invisible in its dark box; the king's levers do not glow when his glass is low);
  A4 arc 3/3 (first room > granary > cellar + hourglass > great gate (required) > shaft > trap hall (required exam)); A5 fights during the rule 2/3 (slingers over every ride, the trap squad on the lip
  while the hall fills, constructs JAMMED by moving sand - good; but the walker kills them all before they swing). The king's dead levers in P2/P3 cost the rest. 12/12 after M1 + the draw fixes.
- IDENTITY (A8, /18): greybox TODAY ~8/18, POTENTIAL ~15-16/18 after section 6. Good already: own cast idea (construct, sand-drowned, brass scorpion, sand-folk slingers - correct past the Queen), the GREAT SAND-GATE is a true
  trebuchet-test set piece (a full-height wall of sand until you turn the wheel, a verb, changes the route), the HOURGLASS (one pull runs one hall into the next) is the second, own music bed, no goblins.
  Missing: any underground look, a landmark in view (BCH.drawBack's Hourglass Tower is in none of 22 shots), lights, platform variety (40+ identical thin planks), one masonry brick everywhere.
- DIFFICULTY v2: 3/10. BOSS (B1-B15): 6/9 today, 8/9 after M1.

## 2. THE LANE'S SPECIFIC ASKS
### 2a. Can a melee hero reach the wall levers inside the 5.8 s low window?
Real keys, god mode (probe-arena.mjs): run speed ~60 px/s (3.8 tiles/s). Lever W col 527, lever E col 560 (local 3 / 36), king mid at col 544. Wall to wall 8.4 s (knight, warden) / 7.5 s (pyro). Room centre to a lever ~4.3 s.
Window 5.76 s => ~1.4 s slack from where he fights. PHASE ONE: legal, no hero needs more than base movement, and the natural fight is beside lever W (you enter at col 526, he walks to you, keep 46 px).
Thin: one thrown cog or pendulum in the window ends it. P3's glass is 8 s so its window is 3.8 s < 4.3 s from centre: reachable only if you already fight within ~10 tiles of a lever.
PHASES TWO AND THREE: NOT REACHABLE AT ALL (M1).
### 2b. Is the trap hall's real-death fall told enough (A10 amended)?
No: told by words only, never taught, never drawn as lethal. Walking off the lip falls ~18 rows in ~2 s then dies (probe-fall.mjs: hp 100 -> 0, respawn at the checkpoint). What exists: a sign at 446 ("A FALL HERE IS THE END"), three tiles
before the lever, under the squad's feet; the open gate is a flat near-black box (b16) that looks exactly like the granary (b06) and the spike cellar (b09), which are survivable. A10 amended allows an exam death "once taught", and nothing
before col 446 teaches "open floor-gate = bottomless": the spike cellar and the lower bulb are both survivable. Knockback is NOT a risk: a construct at 447 beside a hero on the lip moved him 0.6 tile in 900 frames (probe-trap.mjs; the lip is col 452). => M3.
### 2c. Do the sand drifts and rotten balconies respect A10?
Yes. Drifts (82-84, 158-160, 397-399, 476-478) are src/quicksand.js: survivable by design, never kills or drowns (max depth 12 px, 5 px a jump press, a jump out at -250), one row deep over solid rock so no fall-through.
Rotten balconies (72-76 @31, 286-291 @27, 508-512 @27) drop you 2-3 rows to the street, no damage, back in 4 s, none is the route's only footing (gear one at 74,30 is optional). Both are told (sign at 78, the crumble's own cracks and 3-2-1 count). No fix.
### 2d. Level-quality crumble place-count quirk: real tool bug or intended?
REAL TOOL BUG (unit mismatch), not intended. tools/level-quality.mjs line 211 makes every SYSTEM_ARRAYS item a place at `it.x0 / TS`. Right for px arrays (quicksand is stored x0*TS) and wrong for TILE-column arrays: L.crumbles
(src/tower-collapse.js: x0 72, x1 76) is in tile columns, so 72 -> 4.5, 286 -> 17.9, 508 -> 31.75 and two crumbles 40 columns apart collapse into one place (Harvest Fair's awnings use the same field). The lane's spacing (72/286/508) is real and
harmless here, but the tool under-counts clustered crumbles everywhere. Fix in the tool lane: a unit table (tile arrays use `it.x0`, px arrays `it.x0 / TS`), re-run `--all`; buriedcity still clears (3 crumbles + 4 drifts = 7 real places).

## 3. MUST-FIX (exact columns / values)
### M1. The king's levers are unreachable in phases two and three  [src/hourglass-king.js HK_STAGE.banks, src/hourglass-king-hands.js bank(), src/buried-city-hands.js atLever]
- Cause: phase two writes T.SOFT at local cols 0-5 and 34-39, rows R-1..R-3 (cols 524-529 and 558-563, rows 27-29). The levers stand at local 3 / 36 (cols 527 / 560), feet row 29: INSIDE the banks. SOFT is solid to walking: a hero held
  against the bank stops at x=530.3 (45 px from the lever; leverR is 20); jumping against it does nothing. The only way onto the bank is from the ledge (cols 532-537 @27) by a two-tile hop (all three heroes make it), and standing on the bank top
  (feet y 432) fails atLever's lower bound (442) `P.y >= (lv.row+1-1-1)*TS-6` (probe-bank4.mjs: interact false at x 528.4, y 27 for knight, warden and pyro).
- The lab bot (hkPlan) walks to the lever on the floor and presses talk, so it is blocked the same way. Retune AFTER the fix; expect the band to move up.
- Fix, one literal: HK_STAGE.banks [[0,5],[34,39]] -> [[0,2],[37,39]], AND the same literal hard-coded in src/hourglass-king-hands.js bank() (`[[0, 5], [34, 39]]`: a second source of truth; read HK_STAGE.banks there). The levers stay on the floor two tiles clear of the sand, the banks still shrink the arena
  3 columns a side, the drag stop (lever +/- 40 px) lands the king on open floor.
- Rejected alternative: keep the banks and widen atLever for arena levers to feet y [(row-3)*16-6, (row+1)*16+4]. The king (noGrav, stops 40 px from the lever) then stands on the floor 3 rows under a hero on the bank: his box top is y=442, the hero's feet 432, a level swing misses (B12 fails).
- ADD A TEST: tools/buried-city.mjs asserts leverPulled/drag on pure data only. Add a real-key probe (probe-bank4.mjs is the shape): in every phase a grounded hero on the floor within leverR of each lever gets 'stall' when the glass is low.
### M2. The level reads as open desert (identity; art lane, but it is a must: the premise is "buried")
Every shot: sunset gradient, sun disc, clouds, dune silhouettes behind streets that are rows 17-46 under a sand roof (b05 market, b09 cellar, b14 foundry has dunes behind the "old street", b19/b22 a sunset behind the throne). palette.set 'desert' keeps the desert sky for the whole level. Only cols 0-34 should show sky. Section 6 item 1.
### M3. The trap hall's death is not taught, not drawn, not cheap  [src/buried-city.js]
- TEACH IT SAFE FIRST (A4/A10): one small OPEN floor-gate before the exam where the fall is survivable, e.g. the foundry yard at cols 404-408 (between the drift at 397-399 and CP3 at 410): a 3-wide open floor-gate, two rows deep with a one-way step out, lever at 403 (shut = a sand bridge),
  sign "AN OPEN FLOOR-GATE IS A DROP"; the fall costs 25-30% and returns you to the lip (A10 base). The exam is then "the same thing without a floor".
- DRAW IT AS A DROP: falling-sand streaks in the open void, a depth gradient (today #140c06 for 3 px), lamps at the lips 451 and 466 (red open, gold shut).
- SIGN AT THE LEVER: the sign is at 446, the lever at 449, the squad (construct 447, drowned 443) is already on you at the sign. Move it to 450, the lip side of the lever.
- DEATH COST: a death sends you to CP3 (410): the shaft ride + slinger + drowned again + the street. Rec: CP3 410 -> 437 (the first tile after the shaft). checkpoint-gaps today reads 146/135/141/107; re-run after (437 > 515 is ~78 columns, CP4 is the door shrine). Fallback: keep 410 and ship the safe teach alone.
### M4. Weight: three elites + trim the trash (section 4).
### M5. The king's levers need a read when his glass is low  [src/buried-city-hands.js drawWorld + src/hourglass-king-hands.js]
The gauge and "GLASS LOW" sit over HIM; the levers are 8-16 tiles away and drawn as plain stubs (b22). B10/A3/A6: while his glass is low and he is not warded, glow both levers gold, a ring on the nearer one, and point the stuck guide's way arrow at it. With 1.4 s of slack nobody should hunt for the lever.
### M6. Smaller
- GRANARY EXIT (b06): the shelf at 129-132 @23 dead-ends into the wall at col 133 (rows 18-22 solid); the real door is at the SAND TOP, three rows lower. The walker's knight was STUCK there (route node 25/106, hero 132,23; warden and pyro passed). A player climbs toward the slinger and finds no way on.
  End the shelf at col 131 or open (133, 22), and glint the door when the sand is full.
- SPIKE CELLAR (b09): the stakes are invisible; draw them.
- PILOT: tools/buried-city-route pyro "LIFT at THE HOURGLASS (3 tries)". Real keys walk pyro 245 -> 312 over both bulbs with no trouble (probe-bulb.mjs): a pilot artifact (the hp 88 hand), not the level. Knight and warden: 8/8 legs, 0 lifts, 0 deaths.
- BCH sun hook is local (dunes 0-34); when src/drain.js lands point it at L.sun (already listed).

## 4. DIFFICULTY v2 - where the weight goes
Walker, L36 typical build, human+first, 1 seed (work/claude/bcreview/walk.log): knight 0 deaths, arrive 98 (min 93), 19 kills, 1 hit; warden 0 deaths, arrive 100, 25 kills, 2 hits; pyro 0 deaths, arrive 98 (min 93), 23 kills.
Per-section loss is 0-13%. Targets 1-2 deaths and arrive < 50%: missed, as at the Ksar. The lane's diagnosis (skills clear squads before they swing) is right; the answer is weight at three moments, not more squads.
Census (35): constructs 10, slingers 10, drowned 9, scorpions 6 - 15 of 35 are cheap melee trash.
1. ELITES = THE SECTION EXAMS (hazard behind, CP after):
   - HALLS: construct at 295 -> ELITE, drop the scorpion at 289, keep the drowned at 284; the lower-bulb pit you just crossed is the hazard behind. MOVE CP2 from 280 to ~300 (CP after the exam; 145 > 300 = 155, 300 > 410 = 110).
   - QUARTER: foundry construct at 388 -> ELITE with the drift at 397-399 behind him (held in it you are his mark), the slinger at 394 stays, drop the drowned at 400; CP3 (410, or 437) is after.
   - THRONE: 486 already is one; scorpion 492 + slinger 488 are the right size.
   - TEACH: the first construct (152) stays plain.
2. WEIGHT PER FOE: construct hp 105 -> ~160, poke 21 -> 28, sweep 25 -> 34 (both stay told); sanddrowned foeHit 3.8 -> 4.6, brass scorpion 3.4 -> 4.2.
3. TRIM TRASH (35 -> 30): cut scorpion 110, scorpion 171, drowned 285, scorpion 232, drowned 444 (keep the construct on the trap lip).
4. SLINGERS ARE 29%: cut 114 and 196 (8 left).
5. Do not touch the teach (0-89) or the granary ride: the drowned at 81/86 and the granary slinger are right.
Expect arrive ~65-70%; the act-5 level sweep owns the rest. Level-1 pilot and mash bot: lane-stamped (docs/level1-pilot.json, docs/mash-bot.json), not re-run by me; the pilot cannot work the sand-gates (98 lifts) so it measures little.

## 5. THE HOURGLASS KING (B1-B15)
Kind: puzzle/construct king, opening = the level's verb; B13 satisfied (always hittable: brass x0.45, ward x0.40, turning x1.0; the opening is something you DO).
B1 fits the place; B2 ok; B3 ward ~3 s told; B4 stands where the sand left him; B5 one new move a phase (slip P2, hour P3); B6 61% with flasks (band 60-70; warden 1/6); B7 no soft-lock, nothing teleports; B8 the whole level is his glass + the Warden gate at 486-493 foreshadows;
B10 the read is good (gold ring + timer bar, WARDED shell, "HIS BRASS" word); B12 P1 yes, P2/P3 NO (M1); B14 the key is the lever, told by chime + gold gauge, every hero can make it once M1 is done; B15 floors in and the cap hole closed.
WARDEN 1/6: do not touch slipR 22 -> 18 until M1 is fixed and the bands re-measured (the warden currently gets no P2/P3 openings at all). After M1, P3's 3.8 s window needs either lowAt 0.55 in P3 (4.4 s) or the fight kept within ~10 tiles of a lever; measure it.
Arena art: sunset behind the throne (M2); the throne is a flat brown rectangle; the two ledges (local 8-13, 26-31 @ dy3) are today's only way onto the banks and stay as an angle after M1.

## 6. ART-PASS LIST (Sonnet art lane, in priority)
1. BACKDROP: replace the desert sky/sun/dune layers under cols 35-563 with a BURIED interior: dim coursed back wall darker than the floor, far arches and columns, a pale light shaft from the sinkhole (25-33) fading by ~col 60, dust motes, the sand roof's underside as a ceiling band. Sky + sun stay on the dunes (0-34) only. The foundry dunes (b14) and the throne sunset (b19, b22) go.
2. LANDMARK: the Hourglass Tower (BCH.drawBack draws it today, not visible in any shot): tall, parallax-far, in view on most screens, its glass fills as you advance.
3. LIGHTS: hanging brass lanterns on the streets, lit lamps at every shrine, lamps flanking the trap hall lip (M3), a lamp over each sand-gate lever.
4. SAND-GATE ART: a gate housing in the wall with the slot and gauge so "room = sand, gate = this" reads from 6 tiles; roof-hole streams on filling rooms; the Great Sand-Gate grille (344-348 @42) as a huge brass sluice with a visible linkage back to the wheel at 313.
5. PLATFORM VARIETY: stone corbels with a post, rope bridges, awning poles (market stalls: draw cloth), a toppled column as the granary ramp, arches; ROTTEN balconies read as split wood with dust, sound ones as stone.
6. MASONRY: one brick tile everywhere (b03-b17). Four district variants: market (painted, awnings), halls (clean ashlar + brass inlay), quarter (water-stained clay), throne street (gilded frieze, tall columns), plus rubble dressing.
7. CAST (colour shifts today): construct with a clock-face head and an exposed escapement; sand-drowned in bleached rags with sand trickling off; brass scorpion with visible cogs; own-skin corpses (tools/corpses.mjs).
8. KING: a crown of gears, a big readable glass (its sand is the read), a real throne with the two lever housings; ward shell and open ring are fine.
9. SPIKE CELLAR stakes; TRAP HALL void gradient + falling sand (M3).
10. MUSIC: the lane's rec "Loopable Dungeon Ambience" (CC0) for the halls, "Ancient Ruins" (CC-BY 3.0) a good second for the throne street; king's theme stays synth. Daniel's yes first, re-read each licence.

## 7. IDEAS (ranked; S = hours, M = a lane-day)
1. [S] Glow the levers + "PULL" arrow when his glass is low (M5): it also teaches the whole boss in ten seconds.
2. [S] lowAt 0.48 -> 0.52 in P1/P2 and 0.55 in P3 (a 6.2 s / 4.4 s window) instead of touching the slip.
3. [M] A construct you drown on purpose: a lever that fills the quarter's foundry room over an elite at the right moment (SAND IN ITS GEARS already exists as a side effect; make it a plan, A9).
4. [S] A second teach of the open floor-gate inside the first sand room: once drained, a 2-wide slot in its floor shows the dark drop (survivable, 2 rows). Pairs with M3.
5. [S] A sun-glare drain patch on the sinkhole stair's top step (A13) so "the last of the sun" teaches the arc's resource.
6. [M] The quarter's dormant constructs stand up one per wheel notch (1, 2, 3), so the wheel becomes a pacing choice; the 3 turns exist.
7. [M] His own cog bowled at him during the drag (P1): a told "his own gear jams him" x2.0, a reason to pull while he is facing you.

## QUESTIONS FOR DANIEL (rec first)
1. King's levers in P2/P3: rec = shrink the banks to local 0-2 / 37-39 (levers stay on the floor); alt = keep banks over levers and pull from the bank top (the king then stands 3 rows under you: a B12 problem).
2. Trap hall death: rec = teach a survivable open floor-gate at the foundry (404-408) + draw the real one as a lethal lamp-lit void; alt = make it a 25-30% fall + return to the lip like every non-exam pit (A10 base).
3. Weight: rec = three elites (295, 388, 486) + construct hp x1.5 + trim 5 trash foes + 2 slingers; alt = leave it to the act-5 sweep as the lane proposes (arrival stays ~98%).
4. CP2 280 -> 300 and CP3 410 -> 437: rec = yes (the exam elites get a shrine after; a trap-hall death costs the squad, not the clock shaft).
