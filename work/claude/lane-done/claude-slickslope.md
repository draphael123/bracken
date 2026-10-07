# claude/slickslope - THE GLASS SEA's slide gap (Daniel 10-07, live: "This jump can't be beat by the geomancer")

Base: master 56c2cf92. Port 8718. Opus lane.

## What was wrong (measured, real keys: BK.keys / BK.press, fresh save, god, no foes)
- The slide owns vx, so the slide-jump is the SAME for every hero (the geomancer is not different in the code; L32 adds no movement).
  It just had nothing to spare for anyone:
  - frame-perfect (last frame on the foot, jump held 26 frames): 1.24 tiles past the far lip (knight), 1.26 (geomancer)
  - jumping anywhere from the lower slope: -0.2..+0.3 tiles - a toe on the lip, caught by the mantle
  - a normal 14-frame press: 0.27 tiles at best, from a 6-frame window; from most of the slope it fell in
- Why "a long slide that builds momentum" did nothing before: src/slopes.js slideStep bled any speed over the hill's top speed at
  400 px/s/s, so the Glass Sea's slick-glass extra (GS.slideAcc 300, cap x1.3) came to ~5 px/s. Top slide was 183 px/s on glass and sand alike.

## The fix
- THE MOMENTUM IS KEPT: slideStep takes `keep` (a ceiling multiplier; default 1 = every other level unchanged, tools/slopes.mjs green).
  glass-sea-hands `slideKeep` passes the 1.3 ceiling on glass; `GS.slideAcc` 300 -> 120 so the build is gradual (a long slide carries more).
- THE SLOPE: the gentle 3-row rise became a steep 5-row glass dune (128-132), the crest 133-134, and the slick run is 7 steep tiles (135-141,
  was 5). The foot (142), the crack (143-147) and the landing (148-160) did not move; nothing downstream moved (checkpoint 165, shards,
  silvers, the pulse mirror, stuck spots). The sign moved onto the new crest (134, row 28); the gs-slide stuck spot/glint (key at [142,35],
  the foot) is unchanged and still at the point of use.
- THE TEACH: the slide gap is now a SOFT crack (back to the lip, no blow - it is the slide's teach in TEACH 2, A4/A10), like the pulse pit.

## Per hero, before -> after (slide-jump off the foot, full jump: tiles past the far lip; 14-frame press; window of take-off frames that clear)
| hero | full before | full after | 14f before | 14f after | window after (full / 14f) | plain run-jump |
|---|---|---|---|---|---|---|
| knight | 1.24 | 3.44 | 0.27 | 2.17 | 36 / 27 | falls in |
| warden | 1.24* | 3.44 | 0.27* | 2.17 | 36 / 27 | falls in |
| pyro | ~1.2* | 3.42 | ~0.27* | 2.15 | 37 / 27 | toe-hold on the lip (-0.23, the mantle) |
| paladin | ~1.2* | 3.45 | ~0.27* | 2.05 | 37 / 26 | falls in |
| pirate | ~1.2* | 3.44 | ~0.27* | 2.17 | 36 / 27 | falls in |
| reaper | ~1.2* | 3.43 | ~0.27* | 2.18 | 35 / 26 | falls in |
| geomancer | 1.26 | 3.39 | 0.27 | 2.08 | 36 / 26 | falls in |
(* before measured on knight and geomancer with the new tool; the slide physics is hero-independent and the earlier sweep showed all 7 at
183 px/s landing 148.x.) The worst take-off from the last 2 tiles now lands >= 2.16 tiles past (slowest: reaper/paladin).

## Why the checks said "7 heroes, 0 deaths" - and the check fix
1. tools/glasssea-route.mjs's hand slid FRAME-PERFECT (jump on the last foot frame, held 26 frames) and passed on `col() >= 148` -
   a toe on the far lip. It never asked how much room or how wide the window was. FIX: the leap counts only a tile clear of the lip
   (`pastGap`), from the new crest.
2. src/reachcore.js credits a 6-tile run-jump (JUMP_ACROSS) and has no slide, so the 5-wide crack read as a plain jump for anyone.
3. tools/checkpoint-stand.mjs waived the gap as "measured by tools/glasssea.mjs" - which is Node only and never measured it.
   FIX: the waiver now points at the real measurement.
4. NEW CHECK tools/glasssea-slide.mjs (page, in tools/check.mjs's list): all 7 heroes, real keys - A a plain running jump does not make
   the far side; B the slide-jump off the foot lands >= 1 tile past; C >= 20 frames of take-off clear it and every take-off from the last
   2 tiles lands >= 0.75 past; D a 14-frame press lands >= 0.75 past; E down held through the jump lands >= 1 past. Fails on master (C, D).
5. tools/glasssea.mjs (+4): the run is >= 7 steep glass tiles to a one-tile foot (fails on master: 5), the sign on the crest's top, the crack
   soft, and the slick glass KEEPS its build (a second of slide >= 1.2x the hill's top speed; the old clamp held it at 1.03x).

## Checks run (all green unless noted)
- glasssea 114, glasssea-slide (7 heroes), glasssea-aloft, signs, stuck static 897 + runtime 73 spots, slopes --quick
- level-quality glasssea CLEARS (pilot/mash restamped); the gate's only miss is UNDERWELL's stale pilot row (pre-existing on master, not mine)
- glasssea-route base movement (god, no foes), all 7 heroes: walked, 0 deaths, 0 retries, 0 lifts; the leap lands at column 151
- level1-pilot glasssea --write + --curve (knight: 33 hits, 3 deaths, 29 kills over 3 runs; was 36/3/23); curve-gate exit 0 (others stale, pre-existing)
- mash: level row then boss row via tools/mash-bot.mjs: level lows knight 33%, warden 33%, pyro 28% (all < 40%, 0 deaths) - the mash still
  fails the level; boss 0/6; mash-gate 40/40; mash-bot --assert glasssea 0
- slide (180 px/s on sand: unchanged) and uphill (steep 63 up / 101 down) page checks green

## QUESTIONS FOR DANIEL
1. The PYRO's plain running jump catches the far lip by the mantle (-0.23 tiles, a toe-hold; pre-existing, it was -0.37 on master), so
   for her the slide is not strictly needed. Rec: leave it (the gap is a teach and you asked for easier; widening to 6 tiles would make it
   strict for her and still leave ~2.4 tiles of room). Built: left as is; the check reports it.
2. reachcore's 6-tile jump model (JUMP_ACROSS) is optimistic for gaps landing a row up. Rec: a separate lane makes it per-hero
   (run cap x hero) and slide-aware - global, so not done here.
3. The slick glass now really slides faster everywhere a glass slope is slid (the skull's back reaches ~234 px/s): the route pilot is green
   on all 7, but play the skull's back once.
