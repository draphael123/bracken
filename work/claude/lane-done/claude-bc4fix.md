# claude/bc4fix - BURIED CITY 4 FIXES (OPUS, 2026-10-15) - base master c33c3204, PORT 8940, one page at a time
Brief: scratch/brief-buriedcity4fix-1015.md (Daniel played BC4 live; six items, all recs). Shots: work/claude/shots/bc4fix/.

## 1. SAND-BOUND FLOAT - cause found, fixed, checked
- CAUSE: src/buried-city-hands.js `unbury()` treated a slope tile as "filled", so every turn of a TILTING DUNE (writeTilt -> unburyIn) lifted whatever stood on the dune to the TOP of its slope TILE - up to 15 px over the drawn sand. A foe within 420 px fell back next frame; a desert foe further off is never stepped by main.js (updateDesertFoe's 420 px cut), so it HUNG there until you came back (the works3 sand-bound by the dune at 378, the roof sand-bound by the dune at 742).
- FIX: a body standing on a slope's surface is not buried; one lifted onto a slope stands on its surface (src/slopes.js surfaceY). Plus `settleFar`: a sand-drowned / sand-bound beyond 420 px is set down on the footing under it each frame.
- CHECK (new, page): tools/bc-bound-footing.mjs - every sand-bound, its glasses + every glass of a dune/riser within 12 cols struck and run out with the hero near AND far, and stood ON the tilting dune while it turns both ways (near/far); fails on > 2 px for 3 frames. PROVED RED on master (sand-bound 19 px over the dune at 745,9), green here. Also an opt-in `--floats` watch on tools/buried-city-route.mjs (knight god route with foes: none).
- Physics of every other scenario (rooms, risers, slabs, wake) never floated (probe + route watch).

## 2. GEARS - real brass gear (src/redraw/buried_city_fix_art.js gearIcon)
A toothed ring (8 teeth), hub hole, spoke windows, lit top-left, 8 turning frames, a glint every ~2 s, a slow bob; the same gear (10 px) on the HUD's GEARS n/5. Was the fallback blue mushroom (main.js stray branch had no 'gear').

## 3. ELITE BYPASS -> GATE + COIN CACHE
- Every elite exam now holds a gate ahead of him (existing elite-gate code): hallsEnd 318 -> gate 325 (past the stakes); foundry 556 -> gate 558 (clear of the pipes); courtyard 815 -> gate 821 (the antechamber door); throneGuard 661 (already).
- AUDIT FOUND two over-the-top slots: the yard and the throne street are 11 rows tall, an elite gate 10 - a hero is 14 px and fits the 1-row slot under the roof (the throne guard's from his balcony). A one-cell LINTEL closes each (558 row 33, 661 row 21). Asserted: every elite gate has floor under it and stone over it.
- COIN CACHE behind each new gate (327, 576, 839): a drawn heap of coin spilling from a toppled brass-bound sandstone casket, glints (brighter once open), 5 coins on it; told once on sight: HIS GATE KEEPS A CACHE OF COIN: PUT HIM DOWN. Route untouched (reach-heroes 0 for all 9 heroes).

## 4. THE HOURGLASSES READ (flip kept)
- In reach: a gold STRIKE glint on the crown + "STRIKE / E".
- Struck: a jolt + ring of light, then the sand visibly RUNS UP (bottom bulb empties into the top, grains climbing the neck, gold chevrons climbing both sides; it falls back when it runs out). The old half turn-over (after which sand fell DOWN) is gone.
- THE LINK: a trail of gold grains runs from the glass to EVERYTHING it moves (risers, sinkers, banks, sand-falls, tilting dunes, timed slabs, its sand-bound) in 0.9 s, gold brackets pulse on each; faint while it runs; idle + near, a pale ghost of the link shows the targets before you strike. Asserted: every glass moves >= 1 thing.
- CAMERA: for 1.8 s after a hero's strike the camera leans to the middle of what it moved, never losing the hero (main.js updateCamera, src/buried-city-flip.js F.cam).
- DECORATIVE GLASSES: the "caged hourglass by a SHUT gate" in his photo is THE HOURGLASS TOWER backdrop seen indoors (four pillars = a cage, right over the upper bulb's SHUT lever). Indoors it is now FAR: 38% alpha, no cage pillars, no plinth (outdoors it stays the landmark, flip turn kept). The glass works' shelves/racks of blown glasses are darkened and moved off the five working glasses.
- Signs/lines: TURN -> STRIKE everywhere (2 signs, 3 lines, 1 nudge).

## 5. HOURGLASS KING P2: THE SAND RISES IN STEPS
Each withdraw in phase two (as he glides off, after his own word) raises the throne room's sand ONE LAYER (max 2 rows), told THE SAND RISES: IT CARRIES YOU UP TO HIM, drawn heaving up with a lit lip. The fight's floor IS the sand's top (G.floorY moves: his blows, the drift, banks, blocks, throne, great glass ride it); at 2 layers the ledge is a row up and the low slab three - it HELPS reach his slabs; every ledge/slab stays above the sand and the roof is 14+ rows off (no crush, no trap; levers ride up and stay pullable). Phase three: after THE GATES RUN DRY the sand runs out a layer every 0.5 s (THE GATES RUN DRY: HIS SAND RUNS OUT). Cleared on a new attempt and at his death (buriedcity-exit green). The tide's warning was renamed THE SAND TIDE COMES: UP ON A LEDGE (it also began "THE SAND RISES").
B10/B15/B17 unchanged (no new attack; boss-read, boss-openings green).

## 6. PILOT STUCK SPOTS - no real snag
Campaign walker (knight + pyro, L40): pyro walked the rooftops incl. 747,12 and 805,18; both passed 554,45 (foundry elite duel won) and 632,51 (trap hall). The pilot's four are its own: a fight death (554), the trap hall's told drop (632), the tilt hollow (747: the walker climbs out) and the exam's lethal sea (805). The walker's own stalls (320,32 the halls elite duel; 358,28 works1 riser timing; 710,14 knight's breach jump, pyro passed) are bot timing; the 8-hero base-movement route is unchanged. Nothing changed for item 6.

## KING RATES (3-seed sanity, boss-rates --ways=practiced --profile=human --flasks=kit, L40)
knight 3/3, warden 2/3, pyro 2/3 = **7/9 = 78%** (fights 106-181 s; losses at 21-25% boss left). Above 60-70% on 3 seeds (noisy; BC4tune's 12 seeds were 69%) - the rising sand makes his slabs easier to reach. Rec: the planned SONNET tune lane runs 12 seeds and, if still high, trims (blows x1.08 -> ~x1.15 or hp 2500 -> 2650). Not tuned here.

## CHECKS (all green)
tools/buried-city.mjs **398** (was 358; +40 bc4fix asserts) | bc-bound-footing (new) | level-quality buriedcity **CLEARS** | reach-heroes buriedcity 0 | boss-read | boss-openings | boss-fight-end (63) | corpses | buriedcity-exit | buried-city-levers 30 pulls | drawn-solids | hint-shown | modulepreload | floaters | textfit SCOPED (TEXTFIT_LEVELS=buriedcity hints,talk,bestiary,boss --strict: 596 screens, all 0) | mash boss **0/6**, mash level 0/3 clears.
RE-STAMPED (the level changed on purpose: gates, lintels, caches; the King: the sand): pilot + curve row (now 6 deaths / 349% a run, was 12 / 506%: in act 5's band, mid), mash LEVEL row then BOSS row (docs/mash-bot.json, docs/level1-pilot.json, docs/level1-curve.json). Nothing else re-stamped.
STATED TEST CHANGES (none weakened): buried-city.mjs drawTower regex `fk = 0\)` -> `fk = 0[,)]` (a new trailing param); the tide line string (renamed). tools/buried-city-route.mjs gains opt-in --floats.

## ART (grade: B / B+ by my read; no follow-up required)
Gear (B+), coin cache (B), link FX + strike glint (B), sand layers (B-: a heave band + lit lip over the city's own sand tiles). Optional SONNET polish: a nicer drained-sand seep FX in P3 and a casket sprite variant per cache.

## QUESTIONS FOR DANIEL (rec first = built)
1. King now 78% on 3 seeds (target 60-70). Rec: the sonnet tune lane confirms on 12 seeds and trims if high. Alt: cap the sand at 1 layer.
2. Caches pay 5 coins each (+15 coins to the level). Rec: keep. Alt: a silver instead (the level is at 2 of its 3 silver).
3. The tower indoors is faint (38%). Rec: keep. Alt: hide it indoors entirely.
