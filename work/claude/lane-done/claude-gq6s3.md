# GQ6S3 - THE ARENA BURNS AWAY AND YOU CLIMB (Highcrown pass 6, item 3, slice S3) - lane report
Lane GQ6S3, code only, 11-13. Branch claude/gq6s2 (worktree bracken-gq6s2) on 41ad47bbe (S2). Nothing merged, nothing deployed, no browser run. Free RAM was 6.9 GB; node only.
Flag: GQ6S3_SHIPS = false (src/gq6s3.js), lab override ?gq6s3=1 / BRACKEN_GQ6S3=1 (tools/cdp.mjs hook). S3 on implies S2 on (src/gq6s2.js: S2 = gq6s2On() || S3). All flags off = master d216feb87 (hash-identical); S2 only = what S2 did at 41ad47bbe (hash-identical, proved below).

## WHAT IS BUILT (flag ON)
Daniel's decisions are built as given: 3 tiers burnt by HER HEALTH at 85 / 70 / 50 pct, the final 12-tile platform reached at 50, the tier ladders ARE the climb (the old east-end stub is gone as a stub), blows still chip 0.5x, nothing is invulnerable.
- THE TIERS (all from the tower table, so they follow the +96 slide):
  - DECK (row 20, stand 19) -> at 85 pct THE HOARDINGS: tile row 16 (stand 15), cols 874-930 = the two parapet walks joined across the cupola (57 tiles; only cols 883-921 are new). Ladders at the two ENDS: cols 873 and 931, rows 16-19.
  - 70 pct THE BELL LOFT: tile row 12 (stand 11), cols 888-916 (29 tiles, one-way). Ladders at its ends: cols 887 and 917, rows 12-15, standing on the hoardings' unburnt middle.
  - 50 pct THE BELL-CAGE ROOF: S2's platform byte for byte (12 solid tiles, row 7, cols 896-907, her spot, the two sky rings). Its ladder is now at the WEST END, col 895, rows 7-11, standing on the loft's unburnt foot.
  - LADDERS AT THE END OF A FLOOR, never in it: the top rung is at the floor's own tile row, so there is no hole to walk into and no one-tile gap in the climb. (Why: the game's climb code drops a hero off a rung when none of the tiles at his feet is a rung, src/main.js ~11980; S2's ladder ran through a one-way tile, which leaves a ~6 px dead zone - see S2 note below.)
- EVERY BURN STEP IS TOLD, 3.0 s: the span smoulders (Highcrown's own bay 'smoke' art: seams + smoke), 'crumble' at 0 s and again at ~1.4 s, "THE FIRE CLIMBS - GO UP!" over every hero, "UP THE LADDER!" at the next tier's ladders (they glow gold; the next tier is laid at the tell), one hint line, and in her last 0.6 s "SHE CLIMBS" + 'portalOpen'. At 3.0 s the span catches ('crack'), she blinks up and HOLDS every attack until every living seat is on the new tier. Nothing burns during the tell (0 fire hits proved).
- THE BURN: step 1 = the whole deck (cols 873-931); step 2 = the hoardings' two ends (cols 874-886 and 918-930; the loft's ladder feet 887-917 never burn); step 3 = the loft except cols 893-898 (the roof ladder's foot never burns). A burnt span is a PERMANENT fire floor under the bay rule (GQ3.esc: 3 hp / 0.8 s, a push up, spare + noKnock: it cannot kill). No holes. A hero on a ladder or in the air is not on it. Ladders never burn.
- A FAIR WAY UP: she holds until everyone is up, the fire cannot kill, and the route is short (numbers below).
- ON EVERY TIER she fights with S2's list (sweep, lash, crown, volley, boulder, rockfall, the rage's Mountain only on the roof), from the tier's own rings (T1 four, T2 two, roof the two sky rings); every hit of hers on any tier carries noKnock; she never walks off an end; leap/quake, ambush, blink, storm, perch, hatch, bays, reinforcements are dropped from 85 pct on. S2's roof reshapes (rockfall = 3 rocks, the Mountain's 12 columns, the volley's second ring 0.4 s behind) are keyed to the FINAL platform only: on T1/T2 rockfall is the deck's 6 shadows and the volley fires both rings at once.
- SHE ARRIVES ON YOUR SIDE: on each tier she lands 120 px in from the end the hero came up (S2's "she should just be there" kept).
- CO-OP: a downed seat is returned ON her current tier (arena.respawn = the tier's west end + 24 px; src/main.js bleedBack reads it, unset = the old spot); the hold waits for every LIVING seat; a downed seat does not hold her.
- LAST-RESORT ANTI-SOFT-LOCK (said plainly, replaces S2's 25 s / 20 s stand-in): if a seat is still below 60 s into a hold, or nobody is on her tier 45 s after a fall, the tower lifts whoever is below onto the tier ("THE TOWER LIFTS YOU"). A human needs < 8 s; this is for bots and AFK seats. The lab bot used it 0 times in the proof fights.
- LAB BOT: src/lab.js gqueenReact (stage roof, runs first): E.botGoal(P) - when the fire is told or she has gone up and the hero is not on her tier, walk to the ladder of the next tier up from the level he stands on (the deck's two by the side of the cupola he is on), hold UP on it and keep holding while on it. null with the flag off. The burn-off hand is the same route (she never fights ON a burning tier: burning spans are always below her).

## NUMBERS (tools/gq6s3.mjs R; reaper 92 x 0.8 = 73.6 px/s is the slowest hero; ladder 74 px/s)
- Step 1 (deck): worst start = just east of the cupola, walk 5.90 s + climb 0.86 s = 6.8 s; fire cost 12 hp (4 ticks; cap 12). The long walk is the only expensive one: the ladders are at the ends. West half: 9 hp.
- Step 2 (hoardings' ends): walked clear INSIDE the 3.0 s tell from every start on a burning end: 0 fire. (Worst walk 2.9 s.)
- Step 3 (loft): worst walk 4.65 s + climb 1.08 s; fire cost at most 3 hp (one tick).
- A fall from the hoardings to the burning deck: climbs back in 6.6 s, 21 hp of fire; nothing of hers hits him while he is below.
- Fights with movers (the engine's own route hand, 74 px/s climb, 73.6 px/s walk): 1 seat 46 s, 4 seats 43 s (autostrike on her stones): tiers 1@18.8 s, 2@27.4 s, 3@34.9 s (1 seat); lifts used 0; 8 fire ticks (24 hp) in the whole fight.
- Soaks, 2 x 90 s per tier: no dropped move, no bay / soldier / perch; hits 18 / 24 / 39 on T1 / T2 / roof, all noKnock; she never leaves a tier; stones only from the tier's own rings; rockfall 6 shadows on T1 (16% of 912 px) and T2 (31% of 464 px), 3 rocks on the roof.
- Draw: one Highcrown bay-fire call per visible span, clipped to the screen, culled when off the screen, half flame density (art: drawBay got two optional params, defaults = the old look): worst frame (3 stacked spans on screen) 1738 canvas calls; one 96 px bay is 449. Browser owes the ms.

## FILES
src/gq6s3.js (new: flag, S3N numbers, tierGeom / spansFor / arriveX), src/gq6s2.js (the tier engine: tg / cg, thresholds, layTier / unlayTiers, burn spans, botGoal, draw; S2-only paths untouched), src/gqueen-hands.js (burnt-span fire tick; rockfall / mountain / volley keyed to GS2.final(); env art + setRespawn), src/main.js (5 told words in MOVE_WORDS; bleedBack reads arena.respawn), src/lab.js (the climb hand), src/redraw/gq3_art.js (drawBay step / wstep params), index.html (modulepreload), tools/cdp.mjs (BRACKEN_GQ6S3), tools/gq6s3.mjs (new), tools/gq4q.mjs + gq5q2.mjs + gqueen3.mjs (also pin BRACKEN_GQ6S3 = '0': they prove the deck fight).

## PROOFS RUN (node, each individually; tools/check.mjs NOT run)
- tools/gq6s3.mjs: flags OFF 5 checks (level 1810830c, seeded 100 s fight e4235c29 / 145 events = master's, no engine, stub still there); BRACKEN_GQ6S2=1 6 checks (seeded fight ce11ad58 / 172 events = 41ad47bbe's; botGoal null; no burn spans); BRACKEN_GQ6S3=1 106 checks: G geometry + laid / reset byte-identical, B thresholds 85/70/50 + order + 4 s + health-not-time, T tells (3.0 s, words, hint, sounds, 0 fire in the tell, spans), F the bay rule (3 hp / 0.8 s, spare, ladder and floors above spared), R route (slowest hero, every start x, fire cost), S no soft-lock (full fights 1 and 4 seats, last-resort lift 1 and 2, a fall, co-op hold / downed seat / respawn / reset), A attack set per tier, K noKnock, L bot hand + lab.js wiring, Q wiring, P draw cost.
- The two identity pins were made on the OTHER trees (GQ6S3_ROOT=<git archive of d216feb87 / 41ad47bbe> node tools/gq6s3.mjs --hash): master level 1810830c sim e4235c29, S2-only level 1810830c sim ce11ad58; this branch gives the same.
- Flags OFF, all green: gq6s2 (4), gq6fix, gq5q1, gq5q2, gq4q, gqueen3, queen-stair, gprincess, crown-exam, level-quality, floaters, solid-islands, floating-geometry, checkpoints (290), spawns (2665), sprinkle-cap, architecture (77 levels), comments, tells (1195 rows), anchor-lint, goblin-lint, foe-cast-lint, bc5-art-lint (446).
- S2 ON (BRACKEN_GQ6S2=1): gq6s2 68 checks green (unchanged). S3 ON: gq6fix, gq5q1, queen-stair, gprincess, level-quality green; gq5q2 / gq4q / gqueen3 pin the deck fight (they now pin BRACKEN_GQ6S3 = '0' too) and are green with S3 set.
- Not run (they open a browser): gq6fix-bells / -entry / -teach / -lag / -textfit, mark-integrity, stuck, highcrown2, every *-shots tool.

## NOT BUILT / CUT (said plainly)
- The bell PERCH on T1 (plan: T0 and T1): the perch is on the deck only (before 85 pct). The rope / the great bell under the loft are not built (needs a tier-aware rope hook in gq5q2). Rec: a later S3b if Daniel wants the bell on T1.
- The cupola's one-way frame (row 14) is NOT removed: the roof art draws it statically from the tower table, so dropping the tiles would leave a drawn frame you fall through. It is harmless (a ledge 2 rows over the hoardings).
- Blink on T1/T2 (the plan's "blink exits 24 px inside each end") is not built: tiers use S2's list with no blink; she only walks.
- Reinforcements: all dropped from 85 pct (as the plan said).

## UNVERIFIED / BROWSER OWED (flag ?gq6s3=1)
1. THE CLIMB BY HAND, every hero, slowest = reaper: walk to a ladder, grab (UP at the foot), climb 4 / 4 / 5 rungs, step off at the top onto the floor beside it. The one-tile-gap dead zone is avoided by design, but this is the first thing to watch. Do all 9 heroes' hit boxes grab the rung column (ladders are 1 tile, x = col * 16 + 8)?
2. CAMERA: does it follow the hero up 3 tiers (deck 320 -> roof 112) and keep her, the shards and the rings on screen (camBelow / camLock were copied at bossStart)? Plate / hint text fit (5 new words + 3 hints; gq6fix-textfit style recording).
3. DRAW: the burnt spans (bay fire art), the smoulder tell, gold ladder glow, the runtime-laid hoarding / loft / roof tiles (default tile sprites, greybox look), the east ladder (col 931) and the restored stub rung (no stale sprite). p95 frame time with every span burning vs off (target <= +2 ms; worst frame 1738 canvas calls).
4. CO-OP: bleedBack's arena.respawn (a downed seat lands on her tier), 4-seat hold feel.
5. The burn feel: 12 hp on the long deck walk, the hop from the fire's push on a ladder foot, the 3.0 s tell vs a slow human; do the two deck ladders at the far ENDS feel too far from the middle (the cupola splits the deck)? 
6. Lab bots (S5 joint tune): the climb hand is built, bot win rate NOT measured; every hero's boss rate with flasks on the whole fight is the tune lane's.
7. S2's own ladder (flag S2 only) runs THROUGH a one-way tile (the platform's 2nd tile): by the game's climb code that leaves a ~6 px dead zone where no rung is under the hero, which may drop him off the ladder. S3 does not use it (the roof ladder is at the end). Rec: if S2 is ever shipped alone, move its ladder to the end too (one line in pfGeom).

## ART LIST (for an art look; today everything is greybox + Highcrown's bay fire art)
- Hoardings floor (new cols 883-921) and bell-loft floor: timber tiles in the Highcrown outer-hoarding look (reuse the outside stretch's hoarding), charred-plank variant for a burnt span (today a dark strip from drawBay).
- Burning span strip: a baked 4-frame 16 px flame strip + a 2-frame smoulder overlay (today drawBay's flames, half density on wide spans).
- Ladders: rope/timber ladder tile pair (rung + top rung) in Highcrown stone-and-oak; a gold glow is a rect today.
- The great bell hung under the loft (reuse the bell prop) - only if the S3b rope is wanted.
- Bell-cage roof cap (L/M/R), sky-ring portals over the roof (reuse drawRoyalPortal) - carried from S2.

## QUESTIONS (recommended answer first; built as the recommendation)
1. Ladders at the ENDS of each floor (not in the middle as the plan had them): the deck's two are 5.9 s apart from the cupola's flanks, cost up to 12 hp. Rec: keep (no holes, no dead-zone gap; every other step costs 0-3 hp). (alt: add a third deck ladder left of the cupola, e.g. col 883, by dropping the stone step there)
2. Last-resort lift 60 s hold / 45 s after a fall. Rec: keep. (alt: remove it and let a stuck seat wait forever)
3. Bell perch only on the deck (cut from T1). Rec: keep for now; S3b if wanted. (alt: build the rope hook so the bell hangs under each tier)
4. noKnock on every tier (not just the roof) so a blow never throws a hero off a 1-tile-wide climb edge. Rec: keep. (alt: knock-back on T1 / T2, a fall costs a climb)
5. Burn fire cost: 3 hp / 0.8 s (the bay rule). Rec: keep. (alt: gentler 2 hp on the deck only)
