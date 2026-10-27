# ROOKERY 2 - OPUS GREYBOX lane - DONE (claude/rookery2, pushed; NOT merged, NOT deployed)
Branch HEAD: see `git log -1 claude/rookery2` (the report commit; last code commit 70d62407). Base master 8098c94c. Worktree bracken-rookery2, port 6612.
New greybox level hash **1090cc32a3c3** (was ee598da83779); tools/rookeryart.mjs now holds the new hash for the art lane. New files: src/gale-harpy.js, src/rookery-anchors.js, tools/anchor-lint.mjs, tools/rookery2-shots.mjs (no ad-block names).

## A. LEVEL
- **A1 CATCH A RIDE** (src/rookery-hands.js RIDE, L.rkRides). A ride harpy dives at a hero standing on her MOUNT. You can block the dive, or step off and let her hit the rock. Either way she is knocked down. She then LIFTS for 1.6 s with a gold **UP: GRAB** box. Grab her with UP or GRAB and she carries you along a fixed path, drawn first as a dotted feather trail. She shakes you off at the path's end. JUMP lets go with normal air control, and you cannot attack while carried. Only a harpy's dive knocks a rider off. A gust shoves the harpy off her line and it springs back.
  Four rides, each **REQUIRED and proven a lock** (tools/rookery.mjs). The plain legs-only fill no longer reaches the summit.
  - TEACH: THE FIRST RIDE, out of the gully. The face is 5 rows high and the gully floor is under the whole ride.
  - TEST: THE HARPY'S GAP, a 10-wide chasm. A fall is a climb back.
  - REMIX: THE HUNG NEST. You ride THROUGH the nest's cracked arm, "her flight breaks what it hits". The nest drops and she sets you on it. A gale harpy beats at the rider.
  - EXAM: THE LAST RIDE, replacing the top slab. A shrieker calls dives at you and a gale harpy holds the summit lip.
  - Dive-breaks-rock stays as the secondary rule: 9 cracks, 8 baited plus the hung nest.
  - The bot side: reachcore has a ride edge, and the walker (src/playtest.js) and the pilot have ride hands. The page probe rides all four and lands within 2 tiles of each land spot.
- **A2 THE GALE HARPY** (src/gale-harpy.js, a pure shared module with a world interface, ready for Windcaller 4 and the Roc).
  - Moves: she hovers at her perch. Her tell is wings spread back for 0.6 s, with a yellow ! and a dashed cone. Then she beats a 0.5 s GUST that shoves everything in the cone: 270 px/s plus lift. A shield braces it to half the push and no lift.
  - Fairness: she is hittable in the tell, and a blow there breaks the gust. She has 26 HP. She never gusts within 0.5 s of a dive, and dives wait out a gust too.
  - Placed 3 times: taught on the narrow ledge, then at the hung nest and the last ride. She has her own bestiary entry, a tells row and an answer row.
- **A3 ANCHORS.** src/rookery-anchors.js gives every roost, gale perch and hung-nest arm an anchor, in this order of preference: stand / bracket into a face / rock SPIRE from the footing below / chain.
  - All anchors are drawn as greybox spires, corbels and lashings, with a nest roost on top.
  - Rookery piers now go down to footing at any depth (no free piers). Any ledge 4 or more tiles long stands on two piers. The off-wall climb boards are 2 wide.
  - **tools/anchor-lint.mjs** (node-only) flags: islands with no support; overhangs that run past their posts; thin cantilevers; props standing on air; roosts, perches and arms with no anchor.
  - It is wired into level-quality as an `anchors` row, gated for the rookery only. **Rookery: 0 faults.**
  - **Other levels it flags (listed, not fixed)**: wood 6, marsh 22, stockade 11, spore 19, kings 40, scree 17, hanging 15, spire 7, moor 8, storm 29, crown 85, longwater 2, reef 15, flotilla 31, hurricane 9, lamplit 13, underleaf 22, deep 29, keep 9, causeway 6, harbor 6, waymeet 2, undercrown 17, fields 14, burial 3, mage 13, fallingtower 69, burning 7, witchlight 19, oreroad 19, unburied 34, caravan 13, fair 16, theatre 15, canal 23, welltown 15, redgorge 55, underwell 35, skyroad 21, glasssea 26, ksar 44, rootway 17, minecart 38, church 29, towpath 25, buriedcity 5, sealedpyramid 7, fenroad 10, hornetsnest 35, palisadewood 29, kitchengate 18.
  - Most of these are "overhang", ledge ends past their post. Run `node tools/anchor-lint.mjs <id>` for coordinates.
- **A4 CAPS.** In rookery_tiles.js, capBand gives every walkable top and shelf a full-width rock-and-guano crust: a ragged edge, grit, drips, and rolled-over free ends (greybox).

## B. THE SHRIEK SISTERS
- **B1 Three bars.** drawBars shows one bar per sister, named over her bar, with her colour pip. A fallen sister's bar is crossed out. Gold blinks while she is open. In P2 the survivor's bar glows. The plate is lifted 7 px to make room.
- **B2 Phase 2 at TWO dead, any order** (stepSurvivor, P2KIT).
  - The survivor GROWS over a 1.5 s told transform to 1.3x, with no HP added. Her hitbox grows with her.
  - She wears the dead sisters' parts as placeholder marks (drawGifts).
  - She runs her own moves plus a reduced set of theirs, one at a time:
    - Diver survivor: dive, chain, plus SHOCK and BOULDER.
    - Shrieker survivor: mark, echo, shock, plus DIVE and BOULDER.
    - Snatcher survivor: boulder, plus DIVE and SHOCK.
  - All three variants are tested with never two tells at once.
  - The one-fall changes from sisters2 are kept.
- **B3 The verb in the fight.**
  - **P1:** a sister knocked down (blocked dive or rake, or a grab struck loose) climbs off the rock for 1.1 s (UP: GRAB). Grab her and she ferries you up to **THE SHRIEKER'S PERCH**, a new bone nest on a spire 7 rows up and out of any jump.
  - Between moves the shrieker now SITS on that perch. Land beside her and she is **CORNERED**: open at 1.5x for up to 24% of her HP over 2.6 s, then she flees behind a told ward.
  - The nest TIPS you off after 3.4 s, so you cannot camp on it.
  - **P2:** THE SNATCH. The survivor seizes you after a red !! talon line and carries you higher and across. Two strikes in the air and you fall together. She lands STUNNED: 3.2 s, up to 30% of her HP. Otherwise she drops you for 14 damage.
- **B4 Poses.** New POSE entries (ferryWait, ferry, perched, startled, grow) are placeholders with their final timings. Gift marks too.
- **Bestiary** text is rewritten. Tells: `tells --write` was run and the table is green. answer-tags is green.

## TUNE (BOT_PROFILE=human, campaign L14, flasks = kit, practiced)
- **HP**: 770/580/670 -> **830/625/720**. dive.downed 1.3 -> 1.1, to trim the knight's block-and-open edge.
- **Rates**: at final HP, two n=12/hero runs on different seeds:
  - Seeds 1-12: k 9/12, w 5/12, p 11/12 = 69%. Taken before P2 hover changed 110 -> 96; seeds 13-24 ran after the change.
  - Seeds 13-24: k 11/12, w 6/12, p 4/12 = 58%.
  - **Combined n=24/hero: knight 20/24 (83%), warden 11/24 (46%), pyro 15/24 (63%) = 64%, in band.** No hero at 0.
  - Runs at the earlier settings were 72% and 74%.
  - The knife edge is still here: the same settings gave 58-69%. Read ±8.
- **Fight length (wins)**: 81-184 s, median ~120 s. Dry: not run.
- **Mash: boss 0/6** (boss left 86-91%). Level mash rows restamped.
- **Ride use by the bot**: it rides about 1-3 times a fight; CORNERED happens about once in a warden or knight fight. P2 snatches are frequent, but the bot rarely lands both strikes. A player will land them more often.
- **B15:** every mode of every sister is at least 0.4x (tools/rookery.mjs).

## CHECKS (all run alone; one browser at a time)
- **Green**:
  - tools/rookery.mjs, extended with the rides, gale, perch, P2 in all 3 orders, and the snatch.
  - rookery-probe (page): the four rides in the real game, the hung nest, the gale shove, the boss.
  - level-quality rookery: CLEARS THE BAR (new anchors row ok, mechanics 7 kinds, rides x4). The blocking WARN is report-only, as before.
  - anchor-lint, solid-islands, reach-heroes rookery (all 9 heroes 0 crossings).
  - tells, answer-tags, boss-read, boss-openings, boss-greed (52 bosses and 16 minis hold).
  - ability-poses, foe-pass, foe-tactics, foe-tempo, floaters, floating-geometry, drawn-solids, blow-tags.
  - checkpoints, checkpoint-gaps, deadends, collectables, killzones, elites, dressing.
  - one-new-foe, map-grammar, comments, rookeryart (new hash).
  - corpses CORPSES_ONLY=rookery; textfit bestiary (337 screens, 0 issues).
- **Restamped** on hash 1090cc32a3c3:
  - docs/mash-bot.json (level, then boss).
  - level1-pilot: 43 blows, 6 deaths, walked 100%.
  - Curve: 244%, 4 deaths, act II band ok.
  - campaign-xp rookery row (run 824 -> 891): still L14, and the Sky Road still L15.
- **Not run**: the full suite or check.mjs (as told), mobile-perf, textfit levelcard, dry rates.
- **Watch**: 2 of about 110 boss-rates fights hung the page for 20 min ("Runtime.evaluate did not answer"). One was the very first knight fight, one in a pyro run.
  - I could not reproduce it: 24 bossLab fights under a hang-catcher with the CDP pause ready all finished in 2-7 s.
  - It may be the loaded PC. If it shows up again at integ, run work/tmp-rookery2/dbg-hang.mjs; it pauses the page and prints the stack.

## FOR THE SONNET ART LANE (timings are final; greybox shapes to replace)
- **Level**:
  - Ride harpy: LIFT 1.6 s (climbing off the rock, talons hanging), CARRY with the hero (1.6-3.2 s), the shake-off.
  - The HERO HANGING pose (rides, the ferry, the P2 snatch). Today he hangs with two talon lines.
  - The ride's feather trail, the mount scratches, the UP: GRAB box.
  - The **GALE HARPY** sheet (today crag frames tinted teal): hover, wings-back tell 0.6 s, beat 0.5 s, broken tumble 0.7 s, card; the gust cone and streaks.
  - **Anchors**: rock spires with rope, sinew and bone lashings; corbels from faces; a roost nest on each ride roost and gale perch. The hung nest's arm must come off its spire (bakeArm starts in the air today).
  - The **cap tile** in each zone's stone.
  - Lanterns and gibbets must hang from or stand on something, with no wood (theme fit).
- **Boss**:
  - Per sister: ferryWait 1.1 s, ferry, perched, CORNERED 2.6 s, grow 1.5 s.
  - The **P2 survivor look ×3**: diver crest and wing bar; shrieker crest fan and throat sac; snatcher satchel and talons, all painted into her sheet (today drawGifts rectangles).
  - The P2 carry and the fall together.
  - Still owed from the brief: idle wingbeat, dive wind-up, recover, the shriek's inhale and scream, hurt, stunned, **a death per sister**.
  - The three-bar style.
- **Room**: the perch nest and spire, anchored shelves, nests, spires, the monastery roof, wind streaks.

## QUESTIONS FOR DANIEL (rec first; built = rec)
1. **The warden is lowest (46%) and the knight highest (83%).** The knight blocks dives, so he gets knocked-down sisters and rides more. Rec: ship at 64% combined and let the art-pass tune re-measure n=24. I built nothing hero-specific.
2. **P2's SNATCH**: the bot rarely lands both strikes in the 1.8 s hold. Rec: keep 2 strikes (a player mashes faster); if the art lane's playtest says it is a trap, lengthen the hold to 2.2 s.
3. **Gale gusts in the arena** (brief: "may appear"). Rec: not now, the fight is already dense. I built none in the arena; the module is ready.
4. **The other 50 levels anchor-lint flags** (mostly ledge ends past their post). Rec: one polish lane a week walks them act by act, worst first (crown 85, fallingtower 69, redgorge 55).
5. **The gale harpy pushes the hero but no loose props** (the rookery has none that move; the module's `props` hook is there). Rec: the art lane adds loose eggs or rocks on the gale ledges only if they read.
Shots: work/claude/shots/rookery2/ (anchors-gap, anchors-nest, caps, gale-tell, ride, boss-bars, boss-ferry, boss-cornered, p2-survivor, p2-snatch). PIDs: bracken-rookery2/pids.txt (all exited).
