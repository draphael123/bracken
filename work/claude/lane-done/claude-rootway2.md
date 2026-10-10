# claude/rootway2 - THE ROOTWAY in five named areas + THE HUNTMASTER reworked (Daniel's live playtest, 2026-10-09)

Brief: scratch/brief-rootway2.md (all four new moves, the long stagger + hit cap, the dodge roll, Sporewood mechanics, five named areas).
Base: origin/claude/batch81 + origin/claude/reachcore (merged; conflicts in main.js / reachcore.js / check.mjs resolved keeping both sides) +
origin/claude/rootwayfix (merged twice: its lookout fix, its scout horn, its two new tracks are kept). PORT 8800 for every page tool.

## A. THE LEVEL - five named areas (src/rootway.js SECTIONS)
| Area | Cols | Character / verbs |
|---|---|---|
| 1. THE ROOT CELLAR | 0-96 | DARK under the fungus line (L.darkZones + new `darkLocal`: main.js's dark pass runs in the zone only - the level keeps its own sky), lit by spore glow. The bud taught safe at the root wall, the hoist taught over a cheap pit, Sporewood's SPRING CAP taught (up through a root shelf to coins). Weightier: a trophy-hunter where the bud sets you down, a shield on the far shelf. |
| 2. THE HOLLOW TRUNK | 96-196 | NEW. In at the foot of a hollow trunk, up its insides, out at THE KNOTHOLE: bud against a root shelf -> bud against the next shelf -> root plank -> bud against the high shelf -> THE LEANING CAP across the shaft. Every tier four rows (no jump), every miss a cheap fall to a shelf or the floor. Puffball, spore vent, spring caps (a coin side-show), spore drops. EXAM: a WARDING shield captain on the knothole ledge (gate 157), a trophy-hunter in the knothole, a bow on the bough; then THE TROPHY LINE taught (optional) or root steps down to the road; checkpoint 193. |
| 3. THE HUNTERS' GANTRY | 196-303 | The remix (kept from ziproot): THE TROPHY LARDER (three cages, a stair), the high cleat (grow a cap to reach it), a hunter over your bud, THE GANTRY (cage step + the required trophy line). Weightier: a shield where the larder stair tops out, a spitcap over the brute. Checkpoint 299. |
| 4. THE CANOPY SNARES | 303-360 | The Huntmaster's moves TAUGHT (B8): his archers on root ledges (THE LOOKOUT: strike the arrow back through the rope - rootwayfix's scout sees you from the checkpoint), JAW TRAPS on the root road (jump them, or take a SPORE POD from its cap and throw it on one), a NET coiled over the road (it creaks, it drops: roll through), the leaning cap over a real fall, a net under the last bow. |
| 5. THE TROPHY LODGE | 360-388 | His lodge (trophy rack, skull totem, bone chime, the trophy loft vault): THE SECTION EXAM - a WARDING shield captain (ELITES #3) between two jaw traps with a net over him, a hunter, a bow on the loft step, a pod cap at the door; the shrine (checkpoint 384) after; then his stand. |

New modules: **src/snares.js** (jaw traps + nets, one module for the level and for the boss) and **src/hunt-pods.js** (the spore pod: E takes it off a pod cap, ATTACK throws it in carry-throw's told arc; it springs a trap, it staggers the Huntmaster, a small blow on a foe; THROW_KIND.pod). Rule line unchanged (still what the code does: caps grow into steps, hoists drop what they hold).

## B. THE HUNTMASTER (src/huntmaster.js) - a duelist who keeps his distance
- NEW MOVES, each TOLD (sound + word + colour; marks.js rows; hint-lines routed): **NET THROW** (P1, red !!, 'HIS NET: ROLL THROUGH IT'; a roll's frames go through it; caught = held (P.snare) and he draws **THE HEAVY ARROW** (!!, 14, unblockable)); **SNARES** (P2, he hops about the stand setting 3 jaw traps, max 4 up; a thrown pod springs them); **KNIFE FLURRY** (rush him inside 46 px: a told '!' windup then three cuts a step apart - punishes mashing); **HUNTING HORN** (once a phase from P2: two goblin archers onto the root perches, 12 hp each, they fall back after 15 s). P3 keeps the hoist-drop shot; the poisoned split shot is P2's.
- OPENING: his gold arrow struck back home, or a thrown spore pod on him = **THE LONG STAGGER** (3.75 game s, gold ring + timer + pips, he drops off his perch to the floor). **Hit cap = three blows' worth** (3 x 15 raw; the pips empty as blows land; the blow that fills it lands only its remainder, max 4 blows) - so a heavy spear and a quick sword get the same opening, then the told 3 s WARD. A parry's soft return: a 1.4 s stagger, one blow.
- **DODGE ROLL** (B12): a blade inside 30 px while he guards on the floor - he rolls ~90 px away (past you if against a wall), once a cycle, never in or within 2.5 s of an opening.
- **B15**: never totally shut - his front guard and his ward both take 0.4x with a clank (GO ROUND / HE GUARDS).
- Numbers: hp 940, arrow 10, red 12 + poison 4, knife 9 x3, net 3 + hold 1.1 s, heavy 14, jaw trap 10 + hold 0.9 s.
- Bot (hmPlan): rolls through nets, struggles free, jumps traps, takes / rolls the horn archers' arrows, climbs to cut the archers off the perches, stops cutting when the pips are spent.

## RATES
tools/boss-rates.mjs rootway --ways=practiced, campaign L5, normal health. Before (batch81's Huntmaster, profile human, 4 seeds): 4/4 4/4 4/4 = 100%.
| config | knight | warden | pyro | total | fights (game s) |
|---|---|---|---|---|---|
| **FINAL, WITH FLASKS (profile human), 12 seeds** | **5/12** | **9/12** | **9/12** | **64% (in the 60-70 band)** | K 100-174 (mean 139), W 110-162 (135), P 80-136 (117) |
| FINAL, DRY (human+dry), 6 seeds | 0/6 | 1/6 | 2/6 | 17% | - |
| mash bot (boss), 6 fights | 0 | 0 | 0 | **0/6** | boss left 74-84% |

Tuning path (git history; 8-12 seeds each): hp 1150 + a flat three-blow cap went from 100% to 17%; hp 980-1060 gave 67-94%; the damage-weighted cap (three blows' worth)
cut the warden's edge (her spear blow is 20 raw, the knight's 14, the pyro's 9); 12-seed runs at 78 / 75 / 44 / 53 / 56 / **64%**. 6-seed samples swung +-15% as
warned: only 12-seed rows are quoted. Note on seconds: the game runs at SET.speed 0.6 by default, so his 3.75 game-second stagger is ~6 s of wall clock (QUESTIONS 4).

## WALKER (tools/level-walk.mjs, campaign L5, typical build, human+first, 2 seeds a hero)
| | deaths | arrive % mean/min | lost %/s | measured | stuck spots (the bot's, not the level's: every hero's own legs pass, reach-heroes 0 crossings) |
|---|---|---|---|---|---|
| knight | 0.0 | 97 / 91 | 7 | 43% | the knothole route node (156,22), the lookout (307,18: the walker cannot strike the arrow back), the cellar hollow (77,34) |
| warden | 0.0 | 81 / 64 | 20 | 71% | the trunk plank (137,26) |
| pyro | 0.0 | 81 / 57 | 16 | 60% | the high shelf (133,22), the knothole (156,22) |

**MISSES the v2 target (1-2 deaths, arrive < 50%).** The losses are in the gantry -> lodge stretch (24-72% a section); the cellar and the trunk cost 0-21% (the
trunk is partly unmeasured: the walker's route-follower cannot chain bud -> bud -> plank -> bud -> lean, a human can - tools/reach-heroes.mjs: all seven heroes, 0
crossings their legs cannot make). MASH LEVEL: knight dies (1 death, 152% lost), warden dies (2), pyro dies (1) - the mash bot does NOT clear it.
Level-1 pilot (fresh knight, 3 runs): 38 hits, 1 death, 133% a run, 100% walked (88 lifts: the pilot cannot work buds/cleats). Curve row: 0 deaths, 138% a run (act-I band ok).

## Checks
Green (PORT 8800, one page tool at a time): rootway (the trunk's locks: three buds + the lean; the trunk floor cheap; the spring caps a side-show), rootway-probe
(all green: the cellar spring cap, every hoist, the hunter rides, the lookout arrow, a death keeps the spans; THE HUNTMASTER: B15 front 0.4x, ward 0.4x, the long
stagger 3.75 s, the hit cap (two blows + the remainder = 67.5), a pod staggers him off his perch, the net hold + the heavy arrow, his snares, a jaw trap holds and a
throw springs it, the horn's two archers on the perches, the dodge roll), rootway-aloft (node + --page), zipline --levels=rootway (7 heroes 27/27), reach-heroes
rootway (7 heroes, 0 crossings), level-quality (ROOTWAY CLEARS; density 2.44), mash-gate (green), elites (3 rootway elites, gate 157 holds), tells, hint-shown
(+ --write: one line, NETTED, left the silent baseline because it is routed now - a removal), stuck --static, signs, floaters, collectables, checkpoints,
checkpoint-gaps, threat-holes, one-new-foe, solid-islands, killzones, deadends, throwables, boss-greed.
Re-stamped LEVEL then BOSS: rootway (mash level, pilot, curve, mash boss) and **oreroad** (mash level + boss, pilot, curve: its hash moved in the batch81 + reachcore
merge - reachcore's "Ore Road plug" - and mash-gate was red on it; its boss row is unchanged in kind: 0/6, TIMEOUT, boss left 100%).
Pre-existing reds, not this lane: curve-gate scree (482% a run, an act-2 wall, on batch81), spawns scree goat@545,9, dressing towpath (no ground kit), answer-tags
bellman/acolyte/grandmother. Fixed on the way: tools/reach-heroes.mjs did not parse (an apostrophe inside a single-quoted string, reachcore 63b30c15).
NOT run: the full suite, boss-openings (the whole-roster tool; its Huntmaster row asks that a guard-held minute opens nothing - unchanged by this lane), textfit.

## QUESTIONS FOR DANIEL
1. **Hit cap = three blows' WORTH, not a plain count of three.** A plain three-blow cap gave the warden's spear (20 raw a blow) half again what the knight's
   sword (14) got and twice the pyro's (9): warden 8/8 while the knight sat at 38%. *Built (rec):* three pips of 15 raw each, the blow that fills them lands its
   remainder, never more than four blows. *Alt:* a flat count of three (warden-favoured, about +10% overall).
2. **The spring caps are a side-show, not a required step.** I built a required spring-cap tier in the trunk first; every hero's legs can ride it, but the walker's
   route-follower could not (it walks into the cap's cell, or steers off the bounce), so the trunk was unmeasurable. *Built (rec):* buds carry the trunk (four
   required uses); Sporewood's spring caps are taught in the cellar (up through a root shelf) and bounce a coin column on the trunk floor; puffball, spore vent and
   spore drops are the other Sporewood verbs. *Alt:* the required spring tier for humans, and an unmeasured trunk.
3. **The walker target is missed** (0 deaths, arrive 81-97%). Weight was added at platforming moments (hunters where buds set you down, shields at lips, the
   knothole and lodge elites). *Rec:* re-measure once flasks2 lands; the next lever is the cellar and the trunk (they cost 0-21%), not more foes in the gantry.
4. **Game seconds vs wall clock.** Every boss number is in game seconds and the game runs at speed 0.6, so the 3.75 s stagger is ~6 s to the eye. *Built:* 3.75
   game s (the brief's number, in the codebase's units). *Alt:* 2.25 game s if you meant 3.5-4 s on the clock.
5. **Four shrines, not one an area + one.** Cellar (92), trunk (193), gantry (299), the lodge door (384): the snares and the lodge share the last stretch
   (checkpoint-gaps already flags 86-124 route tiles between them as DENSE). *Rec:* keep.
6. **The horn's archers fall back after 15 s** (12 hp each): the bot could not stay under two bows for the rest of a fight. *Rec:* keep; or let them stay until cut.
7. **The knight is the weak hero (5/12 with flasks, 0/6 dry):** the knife flurry and the jaw traps land on whoever stands closest. *Rec:* keep, in band overall; to
   narrow the spread, flurryAt 46 -> 40 (the warden's spear stays outside it).

## ART FOLLOW-UP (Sonnet)
- THE HOLLOW TRUNK: bark-lined walls (the inside of a trunk, not the open canopy backdrop), the knothole, the root shelves and the plank's lashing, a view up the shaft; the trunk's foot dark-zone tuned with glows.
- THE ROOT CELLAR: the dark pass tuned (0.55 now), more spore-glow lights at the buds and the span, the spring cap's sprite in the root palette.
- JAW TRAPS (set / arming / sprung), the NET coil, its creak shadow and the dropped net; the POD CAP, the spore pod in hand, its burst; the pod's told-arc colours.
- THE TROPHY LODGE: a lodge interior backdrop (beams, hides, his horn on the wall, trophy skulls) - new deco kinds (hornMount, skinRack, lodgeBeam) on the dressing allow-list.
- THE CANOPY SNARES: branch dressing, a snare warning post.
- THE HUNTMASTER's new poses (src/redraw/rootway_art.js paintHuntmaster; borrowed poses for now): the NET swing and throw, the HEAVY ARROW draw (a black broadhead), the HORN
  to his mouth, the SNARE crouch + hop + set, the KNIFE FLURRY (three cuts), the DODGE ROLL; the three gold pips over the timer; the horn's archers arriving on the perches.
- Music: rootwayfix's two tracks stand (Forest Whisper Theme / Call to War).
