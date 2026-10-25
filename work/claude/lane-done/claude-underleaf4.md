# UNDERLEAF 4 (claude/underleaf4) - DONE (greybox; art pass for the new poses/sections still owed before live)
Branch claude/underleaf4 off claude/batch121 1dacbb8d. Head: see the final commit on the branch (this report is in it). NOT merged, NOT deployed.

## Changes
1. ROAD MOVE (Daniel 10-25 08:00): Sporewood -> Rootway -> UNDERLEAF -> Palisade Wood -> Kingswood (act I); Scree -> Hanging (act II).
   - src/level.js: underleaf needs 'rootway', palisadewood needs 'underleaf', hanging needs 'scree' (kings/scree unchanged).
   - src/foe-react.js ACTS: underleaf in act I after rootway; out of act II.
   - src/main.js: TIER underleaf 0.8 -> 0.54 (between rootway 0.52 / palisade 0.56); TIER_BOSS kept frozen 0.7 (see Q2); WOOD_NODES node (196,72) between Rootway and Palisade, WOOD_PATH vertex, crag node + CRAG_PATH vertex removed; src/map-plate-spots.js underleaf board [-60,22] (only that row; the solver churns all 44).
   - OLD SAVES: PROG.underleaf4Mig (once): a save past the Rootway keeps the Palisade Wood open (palisadeOpen), a save that had Underleaf open keeps it (underleafOpen); levelLocked honours both.
   - Road assertions fixed at the cause: tools/under-order.mjs (rewritten for the new road, 30 rows), kingswood2, level-reach, rootway, palisadewood (+ runs the new migration), map-forks (palisade rows), one-new-foe (palisadewood grandfathered: Underleaf's sprig/rock-goblin reskins now come first - drop when claude/palisade2 lands; underleaf left the list).
   - Palisade-lane overlap kept to one-liners: its LEVELS.push `needs`, tools/palisadewood.mjs 3 lines, map-forks 2 lines.
2. OLD ART OUT: GROUND_KITS.underleaf (src/dressing.js) drops `skep` (the "sandcastles") and `gardenWall` (the grey "stone blocks"); the sprinkle kit drops `beehive`; the two placed beehives are clay jars. Before/after: before-art-c6/c60/c204.png -> after-art-*.png.
3. A14 PLATFORMING - THE POTION CROSSING (one named area, +86 columns at 372, everything after shifted via an XO painter offset):
   - THE VINE GULLY (green): a stake gully, 3 stumps, eight-wide gaps (no hero jumps them) -> 3 REQUIRED vine bridges + a REQUIRED vine ladder up a 7-row cliff; a green jar on every stump (refills); the jar-thrower + leaf archer on the cliff lob at you while you throw (its exam). A fall = stakes hurt + back to your stump (no soft-lock).
   - THE BUBBLE SHAFTS (blue + REMIX): 3 chained floats over a thorn chasm (wells on the lip, rack 1, rack 3), then GREEN-then-BLUE: grow a vine ledge high over the chasm off rack 3 and float up to it; far-bank archer captain (SWIFT/WARDING affixes) = the exam; shrine 456.
   - Every new use is a LOCK (floodReach: without it the boss room is lost) and glinted+nudged (src/stuck-spots.js); racks stand on tall bone poles (island-posts DROP underleaf 28); walker steering for bubble rides (walkHint).
4. THE POTION MASTER (rename + 3 phases, src/potion-hands.js; t/save key/test ids stay 'grandmother'):
   - P1 GREEN BRAMBLE: thorn-hedge ward; RED jar burns it -> OPEN. Moves: staff, VINE LASH (new, own pose), green jar -> thorns, small brood of 2 (no ward).
   - P2 BLUE BUBBLES: aloft on bubbles out of reach; GREEN jar on/under her -> vine snares her down -> OPEN. Moves: fireballs (marked), BUBBLE TRAPS (new: drift at you, lift you helpless 1.1 s, own pose).
   - P3 RED CAULDRON: ring of cauldron fire (burns a hero beside her); BLUE jar lifts her out -> OPEN (float). Moves: staff, red jar -> burning ground, cauldron gouts.
   - Guard x0.4 + GUARDED clank outside openings (B15 floor; never 0), x2 on a purse of 11% per opening, told 3 s re-form; her room's shelves brew the phase's colour (said + drawn); the jar her guard needs is drawn over her head; boss bar "THE POTION MASTER  <PHASE>/OPEN". Brood ward retired.
   - Name everywhere on screen: bestiary card, boss bar (both spots), level sub, signs, section banner, brood/gardener cards. marks.js rows for lashTell/trapTell (tells --write), boss-greed OPEN_RULE + tool clause, bot (src/lab.js) per phase using the told arc.
   - Numbers: GM.hp 1600, dmg sweep 36 / lash 32 / fire 40 / gout 40 / thorns+burn 18 / ring 18 / trap 12.

## Rates (BOT_PROFILE=human, flasks kit, practiced, campaignLevel L7 = the tool's act-I level now)
- WITH FLASKS n=12: knight 7/12, warden 8/12, pyro 9/12 = 24/36 = **67% IN BAND** (was 92% at L9 as the Grandmother).
- Fight length: knight mean 143 s (125-157), warden 114 s (89-138), pyro 102 s (80-129).
- DRY n=6: 3/6, 3/6, 2/6 = 44% (report-only).
- MASH boss 0/6 (all dead 36-43 s, she keeps 96-98%). Level mash: every hero dies (4 deaths each). Pilot (fresh L1 knight, 3 runs): 55 hits, 7 deaths, 100% walked.

## Checks run (green)
tools/underleaf.mjs (rewritten boss section, 141 checks incl. 23 locks and old saves), under-order 30/30, kingswood2, rootway, palisadewood, level-reach, act-cards, map-grammar, map-spacing, map-scale, map-forks (browser), curve-shape, one-new-foe, goblin-lint, elites, level-quality (UNDERLEAF CLEARS: bands 40%, 6 checks @96), tells, solid-islands, floaters, secrets, stuck (static + runtime 318 spots), boss-greed, damage-caps, camera-fill, reach-heroes underleaf (all 9 heroes route, 0 misses), level1-pilot --write, mash-bot --write (level + boss).
Not run: tools/check.mjs (per instructions).
## Reds (not mine)
- mash-gate: oreroad stale hash (pre-existing on master). small-adds: spore/mother paladin+ranger (pre-existing, B121 list).
- level-walk (report-only, as on underleaf3): knight stalls at the first hedge (202) and drops into the new gully's stakes several times (5 deaths) - the walker's own driving; walkHint now steers bubble rides.

## Stills (work/claude/lane-done/underleaf4/)
before-art-c6/c60/c204, before-boss-room | after-art-c6/c60/c204 | gully-1-bank, gully-2-bridges-grown, gully-3-cliff | shafts-1-lip, shafts-2-racks, shafts-3-remix, shafts-4-farbank | boss-p1-hedge, boss-p1-lashTell, boss-p1-opened, boss-p2-aloft, boss-p2-snared, boss-p3-ring, boss-p3-floated.

## QUESTIONS FOR DANIEL (rec + what I built)
1. Two platforming sections as ONE named area "THE POTION CROSSING" with one shrine (A10c + level-quality's checkpoint spacing failed with a shrine each: 7 checks @82 tiles). Rec: keep one shrine (fewer checkpoints is your direction). Built: one area, one shrine; the gully's exam has no shrine after it.
2. TIER_BOSS underleaf left at its frozen 0.7 (only TIER moved to 0.54) so XP rows elsewhere don't shift. Rec: keep; re-run `node tools/boss-level.mjs --write-xp` after this ships (B121 Q2). Built: as described.
3. Art pass: her new poses (lash, bubble trap) and the hedge/ring/bubble guard draws are greybox on her rig; the gully stumps and racks use the kit. Rec: a sonnet art lane before live (art-before-live). Built: greybox.
4. Pyro/knight spread is small now (75%/58%). Rec: accept. Knight fights run long (max 157 s, band 90-150). Rec: accept or trim GM.hp 1600->1500 in the art lane's re-measure.
5. Palisade Wood now brings no new foe (Underleaf's reskins come first). Rec: claude/palisade2 gives it its own foe; built: grandfathered in one-new-foe with a drop-when note.

## Next step
Coordinator: merge with claude/palisade2 (expect small conflicts in tools/palisadewood.mjs, map-forks, one-new-foe, the palisadewood LEVELS line); then the art lane for the Potion Master's new poses + the crossing, re-measure (n=12) after it.
