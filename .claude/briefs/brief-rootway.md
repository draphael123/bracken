# BRIEF: THE ROOTWAY + THE GOBLIN HUNTMASTER (claude/rootway, Opus greybox, 2026-10-07)
Source: .claude/briefs/bridge-levels-2026-10-01.md #4 (booked 10-07; Daniel confirmed the Huntmaster as briefed on 10-07).
Standard: scratch/design-standard.md A1-A12, B1-B14. Models: THE SKY ROAD (bridge insert on the main road), THE GANG LEADER
(a duelist whose own projectile is struck back), KINGSWOOD (plate + drop cage), SPOREWOOD (growcap buds: stop on one and it rises).

## PLACE ON THE ROAD
Main road: ... THE STOCKADE > SPOREWOOD > **THE ROOTWAY** > KINGSWOOD > THE SCREE PATH ...
- LEVELS: appended (the array is an append log; map nodes and saves count by index) as `{ id: 'rootway', needs: 'spore' }`;
  `kings.needs` becomes `'rootway'` (Daniel-approved design change; any test pinning spore -> kings is re-pointed and SAID).
- Map: wood sheet, node at the existing WOOD_PATH bend between Sporewood (199,38) and Kingswood (141,24) - (171,26).
- Act I (src/foe-react.js ACTS, THE GREENWOOD). Campaign level for the boss bot: tools/boss-level.mjs campaignLevel('rootway').
- The colour seam it now owns: fungus VIOLET at its foot -> autumn AMBER in its canopy (Sporewood's palette at col 0, a tint
  ramp over the climb, Kingswood's amber light at the arena). SPORESEAM (origin/claude/sporeseam, unmerged) warmed Sporewood's
  last screens and Kingswood's first ones; the Rootway carries the transition itself, so the seam reads either way.

## THE RULE (L.rule, and it is what the code does)
"THE CAPS GROW INTO STEPS; THE GOBLINS' HOISTS DROP WHAT THEY HOLD. STOP ON A BUD TO GROW IT; CUT A HOIST'S ROPE TO DROP ITS LOAD."
- CAP BUDS (Sporewood's own growcap movers, the same code): stop on a bud and it rises under you; some LEAN over a gap.
- HOISTS (new, src/rootway-hands.js): a goblin hoist hangs a LOAD on a rope tied off at a CLEAT. STRIKE THE CLEAT (any blow), or
  send an arrow back through its rope, and the load DROPS: a LOG SPAN lands across a gap and stays (a bridge), a TROPHY CAGE
  crushes whatever is under it and stays as a block you can stand on (a step), a HUNTER rides one down onto you (cut it first and
  he falls dazed). The rope, the cleat and the drop line are DRAWN (A3): a dotted plumb line to where it will land, the cleat glints.
- Verbs: GROW (stop on a bud), CUT (strike a cleat), SEND IT BACK (strike an arrow home - it cuts a rope it passes through).

## TEACH SAFE -> TEST -> REMIX -> EXAM (columns approximate; the build file carries the exact ARCS table)
| Section | Cols | Arc | What happens |
|---|---|---|---|
| 1 THE ROOT CELLAR | 0-95 | TEACH both | violet fungus floor. A root wall: a bud at its foot (cap step, the first REQUIRED use). A log span hangs over a shallow pit (floor + spring cap under it: failure is cheap) - strike its cleat, the log drops, walk over (hoist, REQUIRED). Fungus foes (sporelings, a spitcap, a lurker). |
| 2 THE GREAT ROOTS | 95-195 | TEST | climbing giant roots: a LEANING cap carries you over a root gap; a TROPHY CAGE hangs over two goblin SCOUTS (archers) on a root shelf - cut its cleat from the root above and it crushes them (optional, rewarded); the first TROPHY-HUNTER rides a hoist down at you (the new foe, alone); a log span over a real gap (required). Fungus thinning, goblins arriving. |
| 3 THE HOIST YARD | 195-295 | REMIX (3+ distinct uses) | SET PIECE A, THE TROPHY LARDER: three cages hang over three stumps in a fungus pit - drop them in order and each lands as a STEP (a cage is a block): a stair across the pit appears where there was none. A cleat high on a root you can only reach by GROWING a cap under it (cap + hoist combined). A hunter hangs on a hoist over a bud: cut him down before you grow it. |
| 4 THE CANOPY LOOKOUT | 295-385 | EXAM | SET PIECE B, THE LOOKOUT: a goblin scout on a lookout across a chasm; the bridge log hangs on a hoist whose rope runs past his post, out of every blade's reach. STRIKE HIS ARROW BACK - it flies home through the rope and the bridge drops (the boss's key, taught, REQUIRED). Then a leaning cap over a gap under archer fire, a hoist bridge with a hunter overhead, a shield + bow pair at the arena door. |
| 5 THE HUNTMASTER'S STAND | 388-446 | BOSS | below. |
| road out | 446-459 | | the gate to Kingswood. |
Checkpoints: four, >= 90 route tiles apart (start, ~100, ~200, ~300, the arena door ~386).

## FOES (designed squads, nothing sprinkled; fungus thins as goblins take over)
- Fungus (sections 1-2, a few in 3): sporeling (melee), spitcap (ranged), lurker (melee ambush).
- Goblins (sections 2-5): SCOUTS = archers on lookouts and root shelves (ranged; their arrows are the boss's teacher), shield
  goblins (heavy), a brute (heavy), a sapper (runner).
- THE ONE NEW FOE: THE GOBLIN TROPHY-HUNTER (`trophyhunter`, role runner): rides a hoist down onto you (told: the rope creaks,
  a yellow !, his shadow on the floor), fights on foot with a quick spear jab (yellow !, a shield turns it); cut his hoist while he
  hangs and he falls DAZED (1.8 s). A CV machine in src/rootway-hands.js (the desert's machine runner, as the kite-rider).
- Roles >= 3 (melee, ranged, heavy, runner). Living goblins are fine (before the Goblin Queen).
- The reskinned ranged foe (A9): the scouts wear the archer AI; their own skin (`cnSkin: 'gobscout'`) is the art pass's.

## REWARDS
Three silvers: one in a pocket under a root (off route), one on the Trophy Larder's top cage stump, and THE TROPHY LOFT
(the vault): four TROPHY TAGS (bone tags the hunters hang on their kills; L.quest, 'TROPHY TAGS n/4') open the loft's door
(E at it) - it pays a silver. Never a relic.

## FORESHADOWING THE BOSS (B8)
His trophy cages hang all the way up the climb (some with fungus-folk caught in them); his GOLD-fletched arrows stand in the
roots; a scout's sign at the lookout: THE HUNTMASTER TAUGHT THEM: AN ARROW STRUCK BACK FLIES HOME; at the door: THE HUNTMASTER'S
STAND. HIS GOLD ARROWS COME BACK TO HIM. HIS RED ONES DO NOT.

## THE BOSS: THE GOBLIN HUNTMASTER (src/huntmaster.js; DUELIST, B11 - always hittable, guards by angle)
The goblins' master of the hunt: a lean goblin in a trophy MASK, a great bow, a quiver on a strap, a bracer, a skinning knife.
- ARENA: a root-floored stand 56 columns wide; two ROOT PERCHES (5 rows up), a cap BUD under each (every hero reaches a perch
  with base movement); three HOISTS with trophy cages (over each perch and the middle), each tied off at a cleat on the floor.
- GUARD BY ANGLE (B11, never untouchable up close): standing his ground (aiming, between shots) he holds the great bow across
  himself - a blow from the FRONT is turned (clank, flash, 'GUARDS FRONT: GO ROUND' through src/boss-read.js); from BEHIND, from
  ABOVE (a jump or plunge) or while he DRAWS / slashes / lands, he takes it whole. No teleport: his LEAP to a perch is told
  (crouch, '!'), once per cycle at most, never in or right after an opening, and a bud under every perch lets you follow (B12).
- HIS KEY (B14, PR-reflect; the Archmage-firebolt shape): A GOLD-GLINTING ARROW STRUCK BACK flies home and breaks the phase's
  WEAK POINT: P1 the QUIVER STRAP (his volleys lose an arrow), P2 the BRACER (his draw slows), P3 the TROPHY MASK (THE BIG
  OPENING). A break opens him (STAGGER = STILL, B4): P1/P2 3.5 s x1.5, P3 the mask 5 s x2. A gold arrow sent home once the
  phase's point is broken still staggers him 1.2 s. RED (poisoned) arrows cannot be struck back: a blade that meets one does not
  turn it ('POISON: DODGE IT'); dodge or jump them. The read: gold glint + a gold '!' = strike it; red trail + red '!!' = dodge.
- LEVEL VERB OPENING (B1): cut a hoist's cleat while he stands under its cage (on a perch, or mid-floor) and it drops on him:
  CAUGHT, open 3 s x1.5 (King Gorm's shape, so Kingswood's drop is foreshadowed). The goblins winch a cage back up after 8 s.
- B3 WARD: after every opening a told ~3 s ward (a ring + 'HE GUARDS'): no blade lands, an arrow sent home glances off.
- PHASES (one new told move each; each changes the arena or the rule):
  - P1 (100-67%): AIMED SHOT (gold, '!'), VOLLEY (three gold in a fan, '!'), KNIFE SLASH up close ('!', a shield turns it), the LEAP.
  - P2 (67-33%) NEW: THE POISONED SPLIT SHOT ('!!'): three arrows fanned, the outer two RED; the middle one gold. The floor
    where a red one lands stays poisoned 3 s (the arena changes).
  - P3 (33-0%) NEW: THE HOIST-DROP SHOT ('!!' at the cage over you, its shadow on the floor 0.9 s): he shoots a hoist's rope and
    drops its cage on YOU (the rule turned on you). The cages stay down where they fall until winched: the floor fills with steps.
- NUMBERS (start; tuned on the bot): hp ~700, arrows 9-12, knife 14, cage 16 + caged 1 s, poison 3/tick.
  Target 50-60% human bot (tools/boss-rates.mjs, profile human, campaign level) across knight/warden/pyro, no hero at 0,
  fight 90-150 s; mash 0/6 (the greed reprisal + his front guard). Daniel's playtest gate (B9).
- THE BOT (src/lab.js branch, plan in src/huntmaster.js): reads his tells a reaction late; v2 only: STRIKES GOLD ARROWS BACK
  (faces the arrow and swings as it enters reach; some let go), dodges/jumps red ones, cuts a cleat when he stands under a cage,
  climbs a bud to follow him to a perch, cuts from behind / above when he guards, cuts hard when he is open.

## MUSIC (A12) - Daniel picks; nothing downloaded
Level placeholder: Sporewood's track until a pick; boss: a composed-in-code synth theme ('huntmaster', src/boss-music.js).
Picks are listed in the lane report (work/claude/lane-done/claude-rootway.md).

## OUT OF SCOPE FOR THE GREYBOX (the Sonnet art pass)
Own tile kit (root bark, cap flesh, hoist timber), the backdrop (the great roots rising into the canopy, the goblin hoists' silhouette
as the landmark), the trophy-hunter's and the Huntmaster's own sprites (greybox recolours until then), the scouts' cnSkin, lights,
the ambient bed (fungus drip at the foot -> canopy birds and creaking rope at the top).
