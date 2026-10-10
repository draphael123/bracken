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
- Numbers: hp 940, arrow 10, red 14 + poison 5, knife 10 x3, net 3 + hold 1.1 s, heavy 14, jaw trap 10 + hold 0.9 s.
- Bot (hmPlan): rolls through nets, struggles free, jumps traps, takes / rolls the horn archers' arrows, climbs to cut the archers off the perches, stops cutting when the pips are spent.

## RATES
RATES_TABLE

## WALKER (tools/level-walk.mjs, campaign L5, human+first, 2 seeds a hero)
WALKER_TABLE

## Checks
CHECKS

## QUESTIONS FOR DANIEL
QUESTIONS

## ART FOLLOW-UP (Sonnet)
ART
