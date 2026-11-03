# DEMO TRANSITIONS - lane report, branch claude/demotransitions (11-02, Sonnet)

Branch: claude/demotransitions, worktree bracken-demotransitions. Built from claude/batch138 (b845b577) + claude/hornetsnest2art (f716287f) merged in (one conflict: tools/check.mjs test list - kept demo-impact + hornetsnest-fog). Tip SHA: the last commit of the branch (printed in the lane's final message). Pushed. Not merged, not deployed.

## ROWS BUILT (src/transitions.js TABLE, in road order) - every one walked in the page
1. wood > hornetsnest - the existing hornetsnest2 walk-out (pine gate, col 549), kept as is.
2. hornetsnest > marsh - WALK + FERRY SCENE (scene 'ferry', bank 'nest'): the party walks into the nest's exit gate (gate end: no open beat), walk, shore (3.3 s), ride (7.5 s), fade; arrives with arrive.ferry. The old wood>marsh scene art is reused; the left bank is a variant with no woodsmen's logs / axe (a smoke pot + a scrap of nest paper by the stump).
3. marsh > fenroad - walk-out, bog-oak palisade (open.kind 'bog'), cols 781-782 rows 12-17 go to air after the Frog falls.
4. fenroad > stockade - WALK + ROAD SCENE (scene 'road'), gate end (the Bog Troll's gate): see below.
5. stockade > spore - walk-out through the escape gate: the Chieftain's death is NOT a clear - the hall burns and the party climbs the rafters to a gate (L.escapeGate, col 596, row 9); the walk-out starts when they walk into it (gate end, walk.to col 600), then fade.
6. spore > rootway - walk-out, 'light' kind (the arena has no end wall: only the spill of light beyond the arena is drawn, no gate), col 470.
7. rootway > underleaf - walk-out at the Huntmaster's exit gate (gate end).
8. underleaf > palisadewood - walk-out, 'leaf' hedge-gate col 563 rows 24-29.
9. palisadewood > kings - walk-out, 'palisade' breach col 502 rows 19-24.
10. kings > burning (the SPUR) - WALK + SMOKE SCENE; plays only when the spur is open (PROG.burningOpen: Gorm beaten in one life); walk.to col 478 (Kingswood's arena is mid-level, W=690).
11. kings > scree - plain walk-out, used when the spur is SHUT (Gorm felled the party). BEYOND THE DEMO: delete the row to drop it.

Gate-end mechanism (new, main.js): the gate-win branch now does winLevel(); trnBegin(); so Hornet's Nest, Fen Road, Rootway and the Stockade (levels that end at a gate, not on the boss kill) get a row. Clear is credited and SAVED first (asserted).
Other main.js changes: trnBegin passes { burningOpen } to entryFor (rows may carry `when`), lets a SPUR through the needs check (opensOn.level), walk.to / open.w / open.kind 'light', scenes drawn by kind and for ANY scene beat (isSceneBeat), the arrival ambience stays the level's own unless it is a ferry.
ARRIVAL BUG FIXED: the old arrival put the party at x=12 (col 0), which is INSIDE the boundary wall in Underleaf, Palisade Wood, Kingswood, Rootway, Sporewood. It now starts at the leftmost column of the open, floored run that leads to the level's start and walks 36+ px in (asserted for every row: solid footing, clear air, nobody hurt / fell).

## THE 3 SCENES (src/transitions-art.js drawFerryScene / drawRoadScene / drawSmokeScene; pure maths in transitions.js)
(a) NEST > MARSH FERRY: back as built; ~12.5 s on the water, jetty + ferryman + marsh arriving, arrival steps off the ferry.
(b) FEN ROAD > STOCKADE, 'road' 8.2 s: the party walks in place on the lamp-lit boardwalk (planks, piles, rope rails, lamps scrolling), reed layers in 3 parallaxes, and the STOCKADE grows on the skyline from a hazy smudge (horn towers, torch glows, smoke curls) to a wall of sharpened points with the camp gate dead ahead. Reuses the marsh kit.
(c) KINGSWOOD > BURNING VILLAGE, 'smoke' 8.0 s: dusk over the hunting wood; the party walks onto the court road and STOPS; three smoke columns rise out of the far hills (taller + darker over time), the sky goes ember, ash and sparks blow in; Gorm's snapped standard and a dented crown lie at the road's edge behind them.
All dialogue-free, skippable (MIN_SKIP 0.8 s), reduce-motion = no drift / slower slide.
Shots: scratch\lane-reports\demotransitions-shots\ (<from>-full-a/b/c[/d/e].png: scenes at ~1.6 s / 50% / 90%, ferry + 2 ride frames, walk-outs at the open beat and mid-walk). NOTE: the FIRST frame (a) of some rows (kings, stockade, rootway, underleaf, palisadewood, marsh) came out as a dim frame of the source level with its zone-title card - a capture artefact of the tool (the same frame is clean when taken in isolation); frames b / c are the real scene frames.

## CHECKS (all green)
- node tools/demo-transitions.mjs (NEW, 113 rows, added to tools/check.mjs): every pair of the road has a row of the right kind, beats / caps / arrive, a skip at EVERY moment (0.11 s grid) of EVERY row ends done through a <= 0.35 s fade (soft-lock), the scenes' maths, source wiring, new-file names.
- node tools/demo-transitions.mjs --browser (201 green): per row - boss falls / party walks into the gate, the transition PLAYS, clear credited AND in localStorage, the gap is air after the open beat, next level loaded, arrival on solid footing in clear air, control back, nobody fell / hurt / dead after 4 s; skips in ride / road / smoke / walk / open land in the same state; 3 and 4 seats walked out (one walker per seat); reduce-motion (kings, fenroad, hornetsnest); ?trans off, NEVER and FIRST TIME-seen do not play, ALWAYS does; page console clean.
- node tools/demo-transitions.mjs --perf: phone 915x412 DPR 2.6, 4x CPU: ferry 59 fps, road 60, smoke 51 (one 200 ms first-frame bake spike), all >= 40.
- tools/transition-woodmarsh.mjs 34 green (--browser too; one source assertion updated for the generic scene clock). Its --perf is STALE since hornetsnest2 (it waits for a wood ferry that no longer exists) - superseded by demo-transitions --perf.
- tools/act-cards.mjs 16 green.
NOT RUN: the full suite and textfit (no new text: the skip hint is the only text); level-walk / reach tools (arena and level data untouched).
OWED / NOT MACHINE-TESTED: a co-op ARRIVAL with 3-4 seats (BK.load drops a co-op session in every harness, so only the walk-out of every seat is asserted) - one hand test; touch skip (same TCH.hit as before).
Harness note: one headless page crashed (Inspector.targetCrashed) after ~25 level loads; the tool now opens a fresh page every 2 runs.

## ART LANE: what to redraw next (all greybox-plus, recoloured or rect-built)
1. Road scene: the stockade skyline sprite (rects: logs, 3 horn towers, gate) - real goblin-camp art, banners, iron on the gate, torch fires; the boardwalk kit is the marsh's.
2. Smoke scene: hills, tree line (pine() in a dark palette - Kingswood is an autumn oak/pine hunting wood), the plumes are ellipse stacks (want painted smoke with fire at the base + the village's roofline); Gorm's standard + crown are 30 px of rects.
3. Nest ferry: the left bank needs the nest's marsh edge (the Lumber Trail's gold morning sky + pine strip are still the sky / treeline).
4. Gate looks: pine is the Lumber Trail's; bog / palisade / leaf are the same rails recoloured (palisade needs sharpened tops, leaf a living hedge, bog lashed reed); the 'light' kind (Sporewood) has no gate at all - a root-arch / fungus-knot opening would read better. The 2-wide bog gap (cols 781-782) draws a 1-column gate.

## QUESTIONS FOR DANIEL (each: my build = the recommendation)
1. Kingswood > Burning Village AUTO-LOADS the village after the smoke scene when the spur is open (per the brief). The spur is optional / pyro-class: should a non-pyro party be sent in? REC (built): yes, it is the story beat. Alt: the scene ends on the map with the spur node lit.
2. A kings > scree walk-out row exists for the shut-spur case (beyond the demo). REC: keep.
3. The Stockade's exit is the burning hall's rafter gate (the Chieftain's death is not a clear), so its walk-out is only ~4 tiles + fade, with no 'way opens' beat. REC: fine (the fire is the beat).
4. Sporewood has no end wall: a 'light' spill instead of a gate. REC: the art lane draws a root-arch.
5. FIRST TIME setting applies to every row (replays only on ALWAYS); the nest > marsh ferry is ~14 s on first view, skippable. REC: keep.
