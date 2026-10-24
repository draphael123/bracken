# claude/underleaf3 - UNDERLEAF 3: THE GRANDMOTHER'S VILLAGE + HER POTIONS (OPUS greybox, level + boss) - 2026-10-24

Brief: scratch/brief-underleaf3-1015.md (Daniel's 10-15 interview, all recs; approved for Saturday). Base 408eb9bc (BATCH117). Merges clean with claude/batch118 (git merge-tree, 0 conflicts). Greybox: the art lane follows (art before live). Not merged, not deployed.

## What was built
**The level** - `src/underleaf3.js` (laid by hand, nothing sprinkled; LEVELS row id/position/`needs: 'kings'` unchanged, so saves keep their index). Rule line: *HER JARS CHANGE WHAT THEY BREAK ON: GREEN GROWS A VINE, BLUE LIFTS IN A BUBBLE, RED BURNS.*
- Five NAMED areas, each with its own idea, exam and closing shrine (A10c), banner on entry, then her cottage:
  THE HERB GARDEN 0-96 (teach GREEN) / THE DRYING LOFTS 96-189 (teach BLUE + **A14 platforming**: THE HANGING RACKS over a staked drying pit, a bubble off a board to the high rack) / THE THORN HEDGES 189-279 (teach RED, the thorn-beast) / THE CAULDRON YARD 279-372 (REMIX: red-then-green, blue-then-green, blue a foe off the hearth, the jar stair) / HER GREAT LEAF 372-427 (EXAM: burn, grow, float back to back) / THE GRANDMOTHER'S COTTAGE 427-477.
- Shrines 94 / 186 / 276 / 370 / 424 (one per area exam + her door). 14 REQUIRED jar uses, each a proven LOCK, each glinted + nudged (src/stuck-spots.js). 3 silvers (high leaf, drying-pit floor, yard rack). Goblins kept (before the Goblin Queen). No new foe: herb-gatherers (sprig/thief), jar-throwers (rockgoblin, `herb: 'jarthrower'` for the art lane), the THORN-BEAST (a brute with `thornCoat`: x0.4 + "BURN IT" until a red fire burns the coat off), THE HUSH LANCE road warden moved to the yard's exam (order-chapters `at` updated).
- Earthy palette (moss/root/candle amber), her jars the one accent; landmark = her cauldron cottage under the great leaf (greybox: the art lane draws the leaf/backdrop).

**The rule** - `src/potion-hands.js` (module; main.js only wires it). The carry-throw POT stays and is the potion system (THROW_KIND.pot / KINDS.pot: the told arc is the arc flown; UP lobs, DOWN tosses at your feet).
- GREEN: on a SEED BED grows a vine LADDER (NET rungs) or BRIDGE (one-way) that stays through a death; elsewhere a snare roots foes.
- BLUE: a bubble wobbles where it breaks; step in and it lifts you (float wells mark the designed lifts; JUMP pops it); a foe it meets is lifted helpless.
- RED: burns (the hero's own fires: webs burn, foes catch); THORN HEDGES (barred cells) burn away and stay gone; the thorn-beast's coat burns off.
- Shelves refill (pot respawn); HER CAULDRONS (`brewpot`) refill in 0.8 s. Every jar is highlighted in its colour; beds/hedges/wells drawn (A3).

**THE GRANDMOTHER 3** (same boss id `grandmother`; AI in potion-hands `granStep`, main.js updateGrandmother delegates):
- BROOD: she summons 3 small goblins (4 in phase two); while one stands she is WARDED x0.4 (clank + WARDED, B15 - never 0). Brood bites are nips (x0.6, new generic `src.nip` in damagePlayer).
- OPENING: brood dead -> a BLUE jar floats her helpless: OPEN x2 (gold ring + bar), purse 15% of her, ~3.2 s; then a told 3 s ward (x0.4, no bubble holds her). A blue jar while the brood stands: THE BROOD HOLDS HER DOWN.
- MOVES (each told): STAFF (staffTell, a shield turns it), FIREBALLS (fireballTell: spots marked on the floor first), HURLED JAR (jarTell: green = thorns, red = burning ground, spot marked), BROOD call; PHASE TWO (55%): she STIRS THE CAULDRON - bigger brood + cauldron GOUTS on marked spots. 5 told moves. A hero who keeps his distance gets her lantern sooner. Fire never "takes" on her (the witch-fire's mistress: a burn does not stay; flame blows land).
- 3 blue shelves in her room (no soft-lock; they refill).
- Boss bot (src/lab.js): keeps off marked spots, cuts the brood first, fetches a blue jar and throws it at her, cuts her floated.

**Hush retired from this level only**: the old builder `underleaf()` and all hush code (main.js MAT_VOL/noiseAt/updateHush, src/hush-hands.js, the Bellman) stay in the tree, used by no level now (see QUESTIONS).

## Measures (campaign L7, BOT_PROFILE=human, harnesscard-rates --mode=new)
| profile | knight | warden | pyro | all | mean fight |
|---|---|---|---|---|---|
| **with flasks (target 60-70%)**, 12 seeds | 4/12 | 9/12 | 12/12 | **25/36 = 69%** | 103 s (k 124, w 114, p 70) |
| dry (human+dry), 4 seeds | 1/4 | 1/4 | 3/4 | 5/12 = 42% | - |
| mash bot boss | 0/2 | 0/2 | 0/2 | **0/6** | dies in 57-65 s, boss 80-87% left |
- Level mash: every hero dies (2 deaths each). Pilot: 29 hits, 3 deaths (fresh L1 knight). Curve: act I, 208% lost, 3 deaths (in band 40-250%, 0-3). All re-stamped after the final level edit (level then boss).
- The pyro outclasses her (100%, ~70 s fights); the knight is lowest (33%). Tuning path: 0/4,0/4,4/4 -> brood ward/purse/range pressure/burn rule/nips -> 69%.

## Checks run (green)
tools/underleaf.mjs (rewritten, 105 checks incl. old saves), level-quality underleaf (CLEARS: bands 42%, 5 gadget kinds all developed, 2 secrets off route, 5 checks @94 tiles, density 1.17, route 21 rows), solid-islands (0 bare), reach-heroes (all 9 heroes route, 0 crossings), tells, elites (affixes added for the herb warden SHIELDED + thorn-beast captain THORNED), stuck static + runtime (298 spots), damage-caps (her floated purse), boss-greed, order-knights, relics, one-new-foe, deadends, collectables, signs, keys, checkpoint-gaps, spawns, architecture, killzones, comments, zoom-coverage, map-grammar, map-spacing, camera-fill, hint-shown, floaters, throwables, curve-gate, mash-gate (underleaf).

## Reds (not mine - same on base 408eb9bc)
- rule-openings: THE GARGOYLE rune stun + POISE row (both fail on base too).
- mash-gate: oreroad stale hash (fails on base too). traps: 39 to fix game-wide (the report lists 2 underleaf pockets: the drying-pit floor and the stake pit under her leaf - each has a twine ladder back up; the trap tool may not read NET as a way out).
- level-walk (report-only): the walker reaches the boss but stalls 4 times (high rack descent, past hedge 1, on the leaf's bridge bed, the great-leaf well) and died twice on the spikes; the old Underleaf walker also stalled. walkHint for jars is in (src/potion-hands.js), needs a walker lane.

## Before / after (work/claude/lane-done/underleaf3/)
Before (the hush village): before-lane.png, before-mill.png, before-churchyard.png, before-school.png, before-boss.png.
After: after-1-garden-teach.png, after-2-ditch-bridge.png, after-3-float-well.png, after-4-hanging-racks.png, after-5-thorn-hedge.png, after-6-thorn-beast.png, after-7-cauldron-yard.png, after-8-her-leaf-bridge.png, after-9-her-great-leaf.png, after-10-boss-brood.png, after-11-boss-fireball-marks.png, after-12-boss-floated.png.

## QUESTIONS FOR DANIEL (rec + what I built)
1. **Delete the hush code?** Rec: a small cleanup lane after BATCH119 merges deletes underleaf() + the Underleaf-only hush (hush-hands.js, Bellman, streetgate/alarm/darkcache/tollbell/keynail props, noiseAt calls). Built: kept dormant (no level uses it) so this branch stays merge-clean with every lane on main.js.
2. **Per-hero spread** (pyro 100%, knight 33%, overall 69%). Rec: accept for act I (lean high, no hero at 0/N) and let the art/tune lane narrow it; alt: a knight-only lever is not available without a hero-specific rule. Built: 69%.
3. **Her marks over windups**: her new tells (staffTell, fireballTell, jarTell, stirTell, broodTell) call their mark at the tell but have no persistent MARK row (adding BY_HAND rows makes tools/tells.mjs rewrite the whole MARK table, which collides with BATCH118's reflow). Rec: the coordinator adds the 5 BY_HAND rows and runs `node tools/tells.mjs --write` once after BATCH118 merges (rows: staffTell '!', fireballTell '!!', jarTell '!!', stirTell '!!', broodTell ''). ANSWER/HEIGHT rows are in.
4. **Fire never takes on her** (the witch-fire's mistress) - built to stop the pyro burning her down; flame blows still land. Rec: keep.
5. **Exam pits as real deaths** (A10 amended): built as HURT (stakes bite + return) everywhere, nothing in L.examSpans. Rec: let the tune lane mark the hanging racks' right pit and her leaf's stake pit as exam spans once Daniel plays it.
6. **B16 poses / 1.3x older look**: she draws with the old sprite set (mode->frame map in potion-hands granFrame). Rec: the art lane (bent, hooded, gnarled staff, lantern; own poses per move).
7. **Music**: unchanged (underleaf track; boss room 'grandmother'). Rec: keep unless you ask.
8. **Brood nips (src.nip)**: a small generic hook in main.js damagePlayer (a summoned small thing bites for a share). Rec: keep; reusable by other summoners.
