# claude/lumbertrail - THE LUMBER TRAIL (OPUS greybox): BRACKEN WOOD rebuilt as one felled-timber trail

Branch claude/lumbertrail off master 45d7d8a1 (BATCH103). Level id `wood` (no `needs`), boss THE HORNET QUEEN, all kept.
Brief: scratch/brief-first2.md sec.1; answers scratch/review-first2.md (tutorial corridor, 9 signs + 4 cloned lesson bays, felling optional, first pine at 78%).

## WHAT LANDED
- **src/lumber-trail.js** (new): the level, built in final columns (no grow() splices). Five named areas plus the clearing (L.sections), a shrine closing each area (A10c), one before the boss:
  `0-104 THE WOODSMAN'S CABIN` (cabin, the woodsman's-mark sign, the GULLY BRIDGE fell - required, a miss is a climb back out; the skid road's stump slope + the heavy cut on its shield) /
  `105-205 THE FORD` (wade the ford bed under pogo wasps - the plunge; the LOG RAFT over the deep pool - the first moving platform, SIGNED + glinted; the far bank's crew in a sawdust hollow - the down attack, and a small DROP pine over them; badger, vine pocket) /
  `206-300 THE LUMBER CAMP` (the camp gate's sworn sword - the parry; sawpit; log stacks; THE BRIAR MAUL - the Thorn Chapter's knight, ORDER_AT.wood moved to 254,16 gate 260; the LEAN-TO - required, the only way up the cliff; a woodsmen's store cave) /
  `301-409 THE HIVE PINES` (the ridge's wasps - the RISING CUT sign; THE DROP - the ridge pine felled onto the goblin crew in the hollow, and the way down to them; THE HOLLOW LOG - over or through; canopy vine pocket) /
  `410-509 THE TARN` (exam: the TARN BRIDGE under wasps with a badger charging back along the trunk; the helm pit - two shields on stumps over thorns; the hive knoll) /
  `510-549 THE HIVE CLEARING` (the old arena to the column, shifted +226: her numbers stand; her west-wall pine now marked).
- **The verb in minute one**: first marked pine at col 25 (5% of the level, was 78%). Rule line, one sentence: "FOUR STROKES FELL A MARKED PINE, AND IT FALLS THE WAY IT LEANS: ACROSS A GAP, UP A CLIFF, OR ON WHOEVER STANDS UNDER IT."
- **src/felling.js** (new) + **main.js**: a pine falls the way it leans - a level BRIDGE (`row` lets it lie flush with the banks), a LEAN-TO (`head` above: a ramp walked via the Hurricane's rampFoot, now also reading felled pines), a DROP (`drop`: a ramp down; every common foe under its line is crushed as a room blow, an elite takes half and reels, the hero under the red line takes 12). Every stroke is DRAWN (A3): it creaks, LEANS further, a tally notch fills, and near it the line it will lie along is dashed on the ground (gold; red + a red !! for a drop); the woodsman's blaze on marked trunks. The ranger's arrow fells too. Fall lines are hint-box lines; the dead 'A BRIDGE' / 'TIMBER' / ' MORE' literals are gone (hint-shown-silent shrank).
- **reachcore** counts a felled pine (the plain fill does not); **walk-hints** fells the trail's pines, rides the raft (waits, boards walking, stands still, leaps at the far bank) and swims back out of the tarn; **stuck-spots**: glint + 10 s nudge on the gully, lean-to and tarn pines, the raft, and the two waters' way out.
- **forest-supports**: wood kit `crib` (a woodsman's timber post) - every deck stands on one: solid-islands wood 25 -> 0 (allowance removed).
- Removed for wood: the old builder, REVIEW.wood, MIX.wood, AMBUSH.wood (THE BRAMBLE RIDE), CHECK_DROP.wood (shrines by hand). VAULT_SILVER.wood -> the ford vine pocket (199,9, add). Map node + level name: THE LUMBER TRAIL.
- **New check tools/lumber-trail.mjs** (65 asserts, in tools/check.mjs; RED on master 45d7d8a1 via a throwaway worktree): verb in minute one + rule line, three different fells, the bridges and lean-to are LOCKS (reach fill without that pine misses the gate), drops optional with >= 2 foes under, no 130-col stretch without a marked pine, glints on every required fell + the raft, raft signed, lessons on the trail (one DOWN+X sign, rising cut by wasps, parry at the gate, no cloned flat bays, C-blocks sign cut), six sections + a shrine closing each, the Queen's clearing/position/200 hp unchanged, the felling code wired.
- Checks re-pinned to the new columns (same intent): wood2-beats (tarn badger, held jump asked at the gully stair, west-wall pine), push-blocks (the log round at 90,17), checkpoint-stand (stale model gap), lethal-water (wood 5 -> 2 pools), level-quality GATE now includes wood.

## CHECKS
green: lumber-trail, wood2-beats, level-quality wood (CLEARS: bands 5/41%, mechanics 5/3, secrets 2, checks 5 @105, route 3 pockets, ruleFight 4/18) and the whole gate, solid-islands (wood 0), level-reach, reach-heroes wood (0 crossings, 9 heroes), checkpoint-gaps, checkpoint-stand, checkpoints, answer-tags, dangling-paths, hint-shown, signs, stuck --static, elites, deadends, collectables, killzones, spawns, keys, traps (report), relics, push-blocks, queen-comb, lethal-water (static), dressing, occluders, architecture, floaters, one-new-foe, threat-holes, deadly-water, comments, textfit levelcard + hints/mapcard/plates/menu + talk (strict, 0 issues), mash-gate, curve-gate.
Not run (page, slow or unrelated): the full suite, firsthour (the Queen's perch is the old one, pinned by lumber-trail), attack-tokens, visible-supports (report-only).

## MEASURED (campaign level, PORT 8753, one headless Chrome at a time)
- **Felling, every hero** (page): all 9 fell the gully and lean-to pines (167-313 frames of striking) and cross/climb; the drop crushes 3 of 4 of the ridge crew.
- **Walker** (9 heroes x 2 seeds, human+first, L3): every hero reaches the Queen (walked 97%). Deaths a first run: knight 0.5, warden 1.0, pyro 0.5, paladin 0, pirate 1.5, reaper 0, geomancer 0.5, berserker 0.5, ranger 0.5; arrive mean 33-67%. Target 1-2 deaths / <50%: 2 of 9 on target, the rest a little easy. Act I curve band (0-3 deaths, 40-250% lost) holds. STUCKs are bot limits: knocked into the tarn by the badger (it swims badly), the helm-pit shields, the Briar Maul's yard.
- **Level-1 pilot** (fresh knight, 3 runs, final tree): 159% hp lost a run, 2 deaths (curve row: 151%, 3 deaths) - in the Act I band 40-250% / 0-3 (old wood 111%, 0 deaths).
- **Mash bot** (final tree, re-stamped level THEN boss): level - knight/warden/pyro each die 4x; boss 0/6 (boss left 83-98%).
- **Hornet Queen** (12 seeds k/w/p, practiced; her arena/numbers untouched): with flasks 69% (kn 10, wa 5, py 10 /12) and, after the last edits (sign text, pine marked - no fight change), 56% (kn 9, wa 5, py 6) - pooled 24 seeds 62.5% (kn 19, wa 10, py 16 /24): in band, seed noise. Dry 50% then 53%. The warden is her soft hero (as in review-first2).
- Review (sonnet, static, vs Rootway recipe): recipe 14/20 (Rootway 19, Kingswood 9, Sporewood 7), identity est. 15-16/18, design grade B+ (greybox); its fixes 1-4 + 6 bugs applied in 15f971b9 (verb gap closed by the ford drop, lean-to fight, Queen sign teaches the wood, floating sign, raft glint zone, gully sign wording). A firm B+ vs Rootway needs the art pass (landmark + per-area backdrops).

## ART LANE NOTES (sonnet; greybox placeholders today)
- MARKED PINE: standing pine with the woodsman's blaze (now a pale rect), lean poses per stroke, the stroke tally (now 4 pips over the crown), a STUMP left where it stood once felled (today nothing), the fall line marker (gold dashes / red dashes + red !! for drops).
- FELLED TRUNKS: a level trunk per length (bakeFallenPine(len) stretched today), a DIAGONAL trunk for ramps (rotated sprite today) - and hide the ramp's ONEWAY cell tiles (they draw as stepped log stubs under the trunk: shot 08).
- THE CABIN: cabin + chopping block with the axe (stump deco at 15), woodshed roof deck (7-12 row 19), warm window light.
- CRIB supports (forest-supports-art.js 'crib', greybox) under every deck; the stump-slope steps of the skid road (65-104) as stumps, not dirt.
- THE GULLY (27-36): rocks, a trickle, the stair at the west wall.
- THE FORD: gravel bed + shallow water (112-126), the broken footbridge span (119-120 row 22) and its posts, the landing stone (127-129), the LOG RAFT sprite (5 tiles, the mover at 130,22), the drowned stump (145-146), the sawdust hollow (152-156) and its small marked pine (149).
- VINES (3 swings: 192, 371, 474) hung from pine boughs.
- THE LUMBER CAMP: palisade fence/gate (207, 224), the SAWPIT (228-236) with its saw frame, LOG STACKS (240-246) drawn as stacked logs, the cliff (277-300) and the WOODSMEN'S STORE cave (277-285 rows 14-16), trapper's bird cages (233, 280, 455).
- THE RIDGE: hive pines (hiveBg 311, 326), the crew's den (325-334 rows 14-16).
- THE HOLLOW LOG (353-385 rows 11-13): a hollow bark shell with a dark interior; its crib posts should become broken branch stubs.
- THE TARN: dark water (418-428), the near stone (417), the lost purse; the helm-pit stumps (443-446, 448-451) over thorns; the hive knoll (483-492).
- THE QUEEN'S PINE (515,6): her comb hung visibly in its crown (a hiveBg deco at 519,2 today) - the pine you fell is the one her comb is on (B1/B8).
- LANDMARK: the great hive pine + comb in the far layer from col 0, growing with the climb; a backdrop per area (cabin glade, ford mist, camp, pine ridge, tarn, hive); an axe-chop / saw ambient in the camp.
- New deco kinds wanted: choppingBlock, sawFrame, logPile, skidSled, axe, campTent.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Walker difficulty for the FIRST level**: 0-1.5 deaths a first run, arrivals 33-67% (target 1-2 / <50%); pilot + curve in the Act I band. REC: keep level 1 at this - the game's first ten minutes - and push from the marsh on. Alt: 2-3 more weighty foes at the exams. BUILT: the rec.
2. **The fell as the Queen's opening (B1)**: her numbers were kept (69%). REC: a small boss lane where felling her marked pine in phase 2 drops her comb and opens her (told), retuned to 60-70%. Alt: leave her. BUILT: nothing on her; the pine is marked and her sign now teaches "her sting sticks in wood".
3. **The name**: REC THE LUMBER TRAIL on the map and title card (built). Alt: keep BRACKEN WOOD with the trail as sub-title.
4. **The raft's wasps**: REC the first ride calm (the plunge's wasps hang over the ford instead) - built. Alt: wasps over the raft (a fight while riding).
5. **The dodge sign** was cut (the reviewer's sign load in minute one); dodge is still free to use. REC keep cut. Alt: fold DODGE into the controls sign.
6. **Mechanics lint**: it passes partly on three bird cages (decorative). REC: the art lane makes them trapper's cages that free a songbird that leads to coins (they do drop coins today). Alt: a real third developed gadget (more vines).

## FILES
src/lumber-trail.js, src/felling.js, src/main.js, src/reachcore.js, src/walk-hints.js, src/stuck-spots.js, src/level.js, src/order-chapters.js, src/relics.js, src/checkpoint-thin.js, src/forest-supports(-art).js, src/hint-lines.js, tools/lumber-trail.mjs, tools/wood2-beats.mjs (+ re-pins), docs/level1-pilot.json, docs/level1-curve.json, docs/mash-bot.json. Stills: work/claude/shots/lumbertrail/*.png (uncommitted).
