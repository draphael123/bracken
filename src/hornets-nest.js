// src/hornets-nest.js - THE HORNET'S NEST (claude/hornetsnest, the OPUS GREYBOX; scratch/brief-hornetsnest-1022.md, Daniel-approved 10-22 "all this makes sense").
// (claude/hornetsnest2, Daniel's 10-23 playtest) MAIN ROAD LEVEL 2: THE LUMBER TRAIL -> THE HORNET'S NEST -> MARSH WOOD. The Hornet Queen's home: a giant paper nest hung
// in an ancient pine. Out of the felling clearing the trail climbs into the old pines (paper scraps, a hum); you climb the pine's roots, in at the nest's mouth and UP
// through it to her BROOD HALL, where she fights BOTH her phases (the hall tears and floods with honey at half). When she dies the nest tears loose: you climb down the
// falling nest along the trunk and out through the great pine's roots to THE MARSH EDGE - reeds, the first water - and on to MARSH WOOD. Her fight is
// src/hornet-queen.js; this level's rule and machines are src/hornets-nest-hands.js.
//
// THE RULE (L.rule, NEST_RULE): WAX AND SMOKE.
//   FRESH COMB IS STICKY: a wax shelf or floor (L.wax) holds your feet - the run's pace drops to a walk (main.js reads P.syrupT, the shared slow).
//   A HANGING COMB (L.combs) hangs on its stalk; ANY BLOW on it cuts it loose and it DROPS straight down (its plumb line is drawn) and lands as a STEP / a
//     BRIDGE on whatever is under it (another landed comb too: two combs stack into a stair) - and whatever stands under it is struck. (src/reachcore.js:
//     the full fill has every comb landed, L.reachSpans; the plain fill does not - each required one is a lock, tools/hornets-nest.mjs proves it for all
//     nine heroes.) Cut combs hang again on a respawn (B4).
//   A SMOULDERING SMOKE POT (L.smokers: the honey-hunters' smoke stands, they never run out): E takes one. CARRIED (like the Fen Road's plank: slower, no
//     swing - but you can jump and climb) the swarms and hornets near you GO QUIET; E sets it down (it smoulders where it stands a while); ATTACK THROWS IT
//     (the told arc) and where it breaks the SMOKE STAYS a few seconds - a quiet patch you climb through.
//
// SEVEN NAMED AREAS (A10c: a shrine closes each area's exam; one before the boss). Columns; rows: smaller is higher. The route climbs from the forest floor
// (row 66) to the brood hall (row 22), drops down the trunk and finishes at the marsh's edge.
//      0-79   THE PINE'S FOOT       TEACH  the smoke stand + a lone swarm over a root step (carry the pot through), THE FIRST COMB (cut it: the step up onto the
//                                          buttress root - REQUIRED), a sticky comb bridge over a root hollow under a hornet, a comb dropped on a drone   shrine 78
//     80-168  THE PAPER GATE        TEST   up the nest's mouth (comb rungs) with a swarm in its throat (carry the pot up), THE COMB BRIDGE (cut it over the
//                                          waste pit - REQUIRED), a waxed floor under darting hornets; EXAM: THE NEST-GUARD under the comb ledge, a swarm at
//                                          his back                                                                                                        shrine 167
//    169-247  THE COMB STAIR        REMIX  (A14) the real platforming: the nest's core climbed on comb shelves - a THROWN pot up to the swarm's ledge, a sticky
//                                          span under a hornet, THE CHAIN (two combs that stack into a stair - REQUIRED); EXAM: the last chain under a swarm
//                                          and two hornets (REQUIRED)                                                                                       shrine 240
//    248-294  THE BROOD CELLS       TEACH THE BOSS  her brood: cells that PULSE before they hatch (smash a pulsing cell, or its drones come); her door
//    295-332  THE BROOD HALL        BOSS      src/hornet-queen.js, BOTH PHASES: P1 comb perches (bait the dive into one: her sting sticks), smoke pots, comb that falls,
//                                             her brood; THE HALL TEARS at half - P2 honey floods the floor (sticky), the torn combs hang (cut one: a step out of the
//                                             honey, or a weight on her), THE LAST COMB in the vault (drop it on her: the big pin)
//    333-353  THE FALLING NEST      DESCENT   (after her death) the nest tears loose: down beside the trunk on comb ledges that give way, falling comb told by its
//                                             ring, a bramble at the foot                                                                                 shrine 351
//    354-419  THE MARSH EDGE        WAY OUT   out through the great pine's roots to the marsh: reeds, the first shallow water, a hornet or two that fled the nest; the gate
// Every number is a FINAL column (tools/hornets-nest.mjs pins the beats).
export const NEST = { W: 420, H: 72, FL: 66 };
export const NEST_RULE = 'FRESH COMB IS STICKY. CUT A HANGING COMB AND IT DROPS - A STEP OR A BRIDGE. CARRY A SMOKE POT AND THE SWARM GOES QUIET.';
export const SECTIONS = [["THE PINE'S FOOT", 0, 79], ['THE PAPER GATE', 80, 168], ['THE COMB STAIR', 169, 247], ['THE BROOD CELLS', 248, 294], ['THE BROOD HALL', 295, 332], ['THE FALLING NEST', 333, 353], ['THE MARSH EDGE', 354, 419]];
/* each verb's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED (tools/hornets-nest.mjs reads these) */
export const ARCS = {
  comb: { teach: [30, 46], test: [112, 128], remix: [196, 214], exam: [214, 226], boss: [295, 332] },     /* the first comb step; the bridge; the chain; the last chain; her torn combs and THE LAST COMB */
  wax: { teach: [56, 70], test: [141, 158], remix: [169, 222], boss: [295, 332] },                          /* the sticky bridge; the waxed floor; the stair's shelves; her perches */
  smoke: { teach: [3, 26], test: [82, 92], remix: [180, 204], exam: [214, 226], boss: [295, 332] },        /* the lone swarm; the gate's throat; THROWN up to the ledge; the exam swarm; her daze */
  brood: { teach: [250, 292], boss: [295, 332] },                                                          /* the pulsing cells, then hers */
};
/* THE BROOD HALL: her one arena, both phases (src/hornet-queen.js) */
export const HALL = { x0: 296, x1: 331, floor: 22, top: 3, wallL: 295, wallR: 332, trigger: 300 };
/* her COMB PERCHES in the hall: [x0, x1, row, id, fall] - wax shelves; a dive that meets one drives her sting into it (src/hornet-queen.js). `fall`: a perch her
   wing-buzz can shake loose (told) - never the last two (L1 and R1 are in the walls) */
export const PERCHES = [[296, 300, 20, 'L1'], [327, 331, 20, 'R1'], [303, 307, 18, 'L2', 1], [320, 324, 18, 'R2', 1], [310, 317, 16, 'C', 1]];   /* L1/R1 two rows over the floor (a jump), L2/R2 two over them, C two over those */
/* her BROOD CELLS in the hall: [col, row] - the cell a wax pocket stands in (on the floor, and on the two wall perches) */
export const HALL_CELLS = [[301, 21], [326, 21], [297, 19], [330, 19]];
/* THE HALL TEARS (P2, src/hornet-queen.js): the inner perches tear loose and HANG as TORN COMBS - each with its foot three rows over the hall's floor (a rising cut from the
   honey reaches it) and over her low pass (cut as she passes under: PINNED); THE LAST COMB, the royal comb, sags out of the vault between them - its foot three rows over
   a torn comb once that one is cut down into the honey (stand on it, at its inner end, and cut the last comb: an arrow, an ember or a thrown pot reaches it too).
   HONEY floods the floor between the two wall perches [x0, x1, row]: sticky (src/hornets-nest-hands.js addHoney) */
export const HALL_P2 = { torn: [{ id: 'tornW', x0: 302, x1: 306, row: 17, rows: 2 }, { id: 'tornE', x0: 321, x1: 325, row: 17, rows: 2 }], last: { id: 'last', x0: 307, x1: 320, row: 14, rows: 3 }, honey: [301, 326, 22] };
/* THE FALLING NEST's comb ledges (crumbling: L.crumbles), [x0, x1, row]: west and east by turns down the drop beside the trunk */
export const LEDGES = [[341, 346, 29], [333, 338, 36], [341, 346, 43], [333, 338, 50], [341, 346, 57]];

export function buildHornetsNest({ painter, T, TS }) {
  const { W, H, FL } = NEST, L = painter(W, H), { set, block, ent } = L;
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1);
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const shelf = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const sign = (x, y, text, o = {}) => ent('sign', x, y, { text, ...o });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const combs = [], wax = [], smokers = [], cells = [], crumbles = [], hallSmokers = [], hallWax = [], pools = [];
  /* A HANGING COMB: cells x0..x1, rows row..row+rows-1 while it hangs (AIR in the grid: it is drawn and struck, not stood on). `land` (its top row once down)
     is computed at the end, once the ground is laid, unless the comb lands on another comb (a chain: given) */
  const hang = (id, x0, x1, row, rows = 2, o = {}) => combs.push({ id, x0, x1, row, rows, ...o });
  const waxed = (x0, x1, row) => wax.push([x0, x1, row]);   /* the footing row whose top is fresh comb (sticky) */
  const smoke = (x, row) => smokers.push([x, row]);          /* a smoke stand in the cell (x, row); its pot sits on row+1's top */
  const swarm = (x, y, o = {}) => ent('swarm', x, y, { perch: true, ...o });   /* (integ116: a flyer hangs above its squad's floor on purpose - tools/sprinkle-cap.mjs's perch exemption) */
  const hornet = (x, y, o = {}) => ent('wasp', x, y, { sting: true, cnSkin: 'hornet', perch: true, ...o });
  const drone = (x, y, o = {}) => ent('sprig', x, y, { cnSkin: 'combdrone', face: -1, ...o });
  /* (claude/hornetsnest2, Daniel 10-23: the venom spitter read as a MAGE - gone; hornets only) THE FAT HONEY HORNET (src/honey-hornet.js, the nest's one new heavy): slow, its
     plated abdomen turns a cut from behind; its told RAM; its honey globs leave sticky patches; SMOKE makes it drowsy - it sinks to the ground, open */
  const fat = (x, y, o = {}) => ent('honeyhornet', x, y, { face: -1, perch: true, ...o });
  const stinger = (x, y, o = {}) => ent('spit', x, y, { cnSkin: 'stinger', face: -1, ...o });   /* THE STINGER HORNET: the spitter's machine under a NEST HORNET on the comb - it curls its abdomen (a yellow !) and flicks venom (a hornet, not a mage) */

  // ================= 1. THE PINE'S FOOT (0-79): TEACH - the smoke stand, the lone swarm, THE FIRST COMB, the sticky bridge =================
  ground(0, 41, FL);
  smoke(6, FL - 1);
  sign(3, FL - 1, "THE HONEY-HUNTERS' SMOKE POTS STILL SMOULDER. E TAKES ONE: THE SWARM NEAR YOU GOES QUIET.");
  ground(16, 24, FL - 2);                                   /* a root step under the first swarm */
  swarm(20, FL - 6, { squad: 'foot' }); hornet(27, FL - 6, { squad: 'foot' }); ent('badger', 30, FL - 1, { face: -1, cnSkin: 'boar', squad: 'foot' });   /* a boar rooting at the pine's foot (the trail's own: its charge is jumped) */
  shelf(8, 13, FL - 3); shelf(27, 31, FL - 3);              /* low roots over the forest floor (a second height) */
  sign(12, FL - 1, 'A SWARM. CARRY A POT AND IT SLEEPS. ATTACK THROWS THE POT; THE SMOKE STAYS.');
  coins([18, FL - 4], [21, FL - 4], [23, FL - 4]);
  /* THE FIRST COMB: the buttress root stands four rows over the forest floor - no jump makes it. A comb hangs off the pine's low bough beside it: cut it,
     it drops at the root's foot as a step (REQUIRED) */
  hang('first', 36, 39, FL - 5, 2, { teach: true });   /* (every comb hangs with its foot three rows over the footing you cut it from: a rising cut reaches it) */
  sign(31, FL - 1, 'A COMB HANGS ON ITS STALK. CUT IT AND IT DROPS - WHAT IT LANDS ON, YOU CAN STAND ON.');
  ground(42, 46, FL - 4); ground(47, 50, FL - 6); ground(51, 53, FL - 8); ground(54, 61, FL - 10);   /* the buttress root climbs in knuckles: 62, 60, 58, 56 */
  coins([43, FL - 5], [48, FL - 7], [52, FL - 9]);
  /* THE STICKY BRIDGE: a root hollow, a fresh comb shelf across it, a hornet over it (a fall is a climb back out, not a death) */
  ground(62, 67, FL - 6);                                    /* the hollow's bed (row 60) */
  ground(62, 62, FL - 8);                                    /* a knuckle in the hollow: 60 -> 58 -> the bridge at 56 */
  shelf(62, 67, FL - 10); waxed(62, 67, FL - 10);            /* the comb across it */
  ground(68, 79, FL - 10);
  hornet(65, FL - 14, { squad: 'hollow' }); stinger(69, FL - 11, { squad: 'hollow' });
  sign(58, FL - 11, 'FRESH COMB IS STICKY: IT HOLDS YOUR FEET. A HORNET STINGS ON ITS ! - STEP OFF ITS LINE.');
  coins([64, FL - 12], [66, FL - 12]);
  /* a comb over a comb drone: the first DROP (cut it: it lands on him) */
  hang('drop1', 71, 73, FL - 15, 2, { onFoe: true });
  drone(72, FL - 11, { squad: 'hollow' });
  ground(76, 79, FL - 12);                                   /* a root shoulder up under the nest's lip (row 54) */
  coins([77, FL - 13]);
  /* the pine's low bough over the knuckles: a silver in the bark (a dead end that pays) */
  shelf(55, 59, FL - 12); coins([55, FL - 13], [56, FL - 13], [58, FL - 13]);   /* up off the knuckle at 56 */
  shelf(60, 63, FL - 14); shelf(64, 68, FL - 16); coins([61, FL - 15]); ent('silver', 66, FL - 17);   /* the pine's low boughs, up over the hollow: a honey-hunter's cache (a dead end that pays) */

  // ================= 2. THE PAPER GATE (80-168): TEST - the gate's throat, THE COMB BRIDGE, the waxed floor; EXAM: THE NEST-GUARD =================
  /* THE NEST: its paper shell hangs from the pine's boughs at the top of the world - one mass from row 0 down to row 51 over 80-332 - with its cells carved
     out of it; the forest's undergrowth fills under it (93-332, row 52 down: the art lane draws the dark under the nest) */
  block(80, 332, 0, 51); ground(93, 332, 52);
  ground(80, 92, FL - 12);                                   /* the root shoulder under the nest's lip */
  /* THE MOUTH: up from the shoulder into the shell at 82-89 on comb rungs, wall to wall, two rows apart */
  air(82, 89, 26, 51);
  for (let i = 0, y = 52; y >= 34; i++, y -= 2) { if (i % 2) shelf(85, 89, y); else shelf(82, 86, y); }   /* (five wide, overlapping by two: a straight hop up or across - the swarm, not the footing, is the test here) */
  smoke(91, FL - 13);                                        /* a smoke stand at the mouth (on the shoulder) */
  cells.push({ x: 81, y: FL - 13 });                         /* a brood cell crusting the mouth: the brood met first, where nothing else is on you */
  swarm(86, 42, { squad: 'throat' }); hornet(91, 30, { squad: 'throat' });   /* (the hornet keeps the throat's head, over the chamber's floor, not the rungs) */                                             /* THE GATE'S THROAT: a swarm in the middle of the rungs - climb with the pot in hand */
  sign(88, FL - 13, "THE GATE'S THROAT HUMS. TAKE A POT UP WITH YOU: YOU CANNOT SWING, BUT YOU CAN JUMP.");
  /* THE LOWER CELLS: a long chamber, floor 34; the comb bridge over the waste pit */
  air(90, 140, 26, 33);
  hornet(100, 29, { squad: 'cells' }); drone(108, 33, { squad: 'cells' }); fat(104, 29, { squad: 'cells' }); stinger(98, 30, { squad: 'cells', perch: true });   /* THE FIRST FAT HONEY HORNET: up the throat with a pot in hand, you meet it with its answer */
  sign(96, 33, 'A FAT HONEY HORNET: ITS BACK IS PLATED - HIT ITS HEAD. SMOKE IT AND IT SINKS, OPEN.');
  shelf(95, 104, 31); shelf(129, 136, 31);                  /* comb shelves along the chamber's wall (a second height) */
  coins([94, 32], [98, 31], [102, 32]);
  /* THE COMB BRIDGE (REQUIRED): an eight-wide gap down into the waste pit; the comb over it is wider than the gap - cut it and it lands across */
  cells.push({ x: 112, y: 33 });                             /* a cell on the lower cells' floor, by the gap */
  air(118, 125, 34, 39);                                     /* the waste pit, bed at row 40, a stair back up its WEST wall (the near side: a fall is a climb back, never a way across): 40 -> 38 -> 36 -> 34 */
  block(118, 119, 38, 39); block(118, 118, 36, 37);
  hang('bridge', 117, 126, 30, 1, { bridge: true });
  sign(113, 33, 'THE COMB OVER THE GAP IS WIDER THAN THE GAP. CUT IT: IT LANDS ACROSS.');
  coins([121, 39], [123, 39]); ent('silver', 124, 39);   /* the waste pit's bed: whoever falls in finds the nest's loot (a dead end that pays) */
  /* THE WAXED FLOOR: the chamber's far half is fresh comb under darting hornets (slow feet, quick stings) */
  air(141, 168, 24, 31);                                     /* (a step up from 34 to 32 at 141) */
  waxed(142, 156, 32);
  hornet(146, 27, { squad: 'wax' }); fat(152, 27, { squad: 'wax' }); stinger(150, 28, { squad: 'wax' });   /* a fat honey hornet over the waxed floor: its globs on fresh comb (slow feet, its ram) */
  shelf(144, 150, 29);
  coins([145, 30], [150, 30], [155, 30]);
  smoke(139, 33);
  /* THE EXAM: THE NEST-GUARD (an elite: the shieldbearer's machine under a soldier hornet's wax plate - he guards his front) on the floor under the comb
     ledge (plunge him from it), a swarm at his back */
  shelf(157, 162, 29); waxed(157, 162, 29); block(155, 156, 31, 31);   /* the comb ledge three rows over the floor, a knuckle of wax up to it */
  ent('shield', 158, 31, { face: -1, cnSkin: 'nestguard', elite: true, gate: 165 });   /* he holds the chamber's way on: a gate across it until he falls (the shrine past it) */
  swarm(163, 28, { squad: 'guard' });
  sign(143, 31, 'THE NEST-GUARD: WAX PLATE TURNS THE FRONT: GO ROUND, OR DROP ON HIM.');
  ent('check', 168, 31);

  // ================= 3. THE COMB STAIR (169-247): REMIX (A14) - the nest's core climbed on comb shelves =================
  /* the core: a tall shaft 169-247, floor 32, up to row 4; the route snakes up it to the brood cells' sill at row 8 */
  air(169, 247, 4, 31);
  /* stage 1: west shelves up off the floor */
  shelf(170, 173, 30); shelf(174, 177, 28); shelf(178, 181, 26); shelf(182, 185, 24);   /* a stair of comb shelves rising east under the span */
  coins([171, 29], [175, 27], [179, 25]);
  /* stage 2: the sticky span east under a hornet, to the swarm's ledge - throw a pot up onto it (the smoke stand is on the floor under the span) */
  shelf(186, 194, 22); waxed(186, 194, 22);   /* the span starts past the stair's head: a hop up onto it, never up through it */
  hornet(185, 18, { squad: 'span' });
  block(195, 196, 20, 31);                                   /* a wax pillar: the span's east end; the swarm's ledge runs east off its top */
  shelf(197, 208, 20);
  swarm(201, 17, { squad: 'span' }); fat(205, 15, { squad: 'span' });   /* a fat honey hornet over the swarm's ledge: its globs on the sticky span, its ram as you climb; THE SWARM ON THE LEDGE: lob a pot up onto it from the span */
  smoke(186, 31);
  sign(183, 31, 'A SWARM SITS ON THE LEDGE OVER THE SPAN. CARRY A POT UP: UP+ATTACK LOBS IT HIGH.');
  coins([190, 21], [199, 19], [203, 19]);
  /* stage 3: THE CHAIN (REQUIRED) - the wall east of the ledge stands six rows over it. Two combs hang over the ledge's end, one over the other: cut them and
     they stack on the ledge into a stair (the low one is cut from the ledge, the high one from the low one, or the high one first: they stack either way) */
  block(209, 214, 14, 31);
  hang('chainA', 205, 207, 15, 2, { chain: 'A', land: 18 });
  hang('chainB', 206, 208, 13, 2, { chain: 'A', land: 16, on: 'chainA' });
  hornet(211, 10, { squad: 'chain' });
  sign(198, 19, 'TWO COMBS OVER THE LEDGE. CUT BOTH: THEY STACK INTO A STAIR UP THE WALL.');
  coins([206, 17], [210, 13], [213, 13]);
  /* stage 4 + THE EXAM: a sticky shelf east off the wall top, and the LAST CHAIN up the high wall under a swarm and two hornets (REQUIRED) */
  shelf(215, 222, 14); waxed(215, 222, 14);
  block(223, 247, 8, 31);                                    /* the high wall: its top (row 8) runs east to the brood cells */
  hang('lastA', 219, 221, 9, 2, { chain: 'B', land: 12 });
  hang('lastB', 220, 222, 7, 2, { chain: 'B', land: 10, on: 'lastA' });
  swarm(217, 10, { squad: 'exam' }); hornet(221, 4, { squad: 'exam' }); hornet(214, 6, { squad: 'exam' }); fat(232, 5, { squad: 'exam' }); stinger(228, 7, { squad: 'exam' });   /* the exam's heavy waits on the wall top */
  smoke(212, 13);
  coins([218, 13], [221, 9], [226, 7]);
  air(223, 247, 4, 7);
  ent('check', 292, 9);   /* (claude/bossheal 10-30, Daniel: a shrine before every boss) the nursery's last step, her door a few columns on: this was 240,7, fifty tiles back before the brood cells */

  // ================= 4. THE BROOD CELLS (248-294): TEACH THE BOSS - cells that pulse before they hatch =================
  air(248, 294, 3, 9);                                       /* the nursery: floor 10, two rows under the wall top (a step down at 248) */
  for (const [x, y] of [[258, 9], [267, 9], [277, 9], [286, 9]]) cells.push({ x, y });   /* brood cells on the nursery floor (a wax pocket each) */
  sign(251, 9, 'BROOD CELLS PULSE BEFORE THEY HATCH. SMASH A PULSING CELL, OR ITS DRONES COME OUT.');
  coins([262, 8], [272, 8], [282, 8]);
  hornet(272, 5, { squad: 'brood' }); fat(282, 6, { squad: 'brood' }); stinger(278, 9, { squad: 'brood' });   /* the last fat honey hornet keeps her nursery: smoke is behind you now - its head, or its ram on your shield */
  shelf(262, 266, 8); shelf(257, 260, 5); ent('silver', 258, 4); shelf(272, 277, 8); shelf(284, 288, 8);   /* the nursery's upper comb (a second height; a silver in the brood's own wax) */
  air(295, 295, 3, 9);                                       /* her door: the nursery floor runs out over the hall; you drop in */
  sign(290, 9, 'HER STING STICKS IN COMB. STAND ON A PERCH AS SHE DIVES. SMOKE HER AND SHE FALLS.');

  // ================= 5. THE BROOD HALL (295-332): THE BOSS, BOTH PHASES - src/hornet-queen.js =================
  air(HALL.x0, HALL.x1, HALL.top, HALL.floor - 1);
  for (const [x0, x1, row] of PERCHES) { shelf(x0, x1, row); hallWax.push([x0, x1, row]); }   /* her perches are fresh comb too (sticky: L.wax), but hers - not the level's ents */
  air(HALL.wallR, HALL.wallR, HALL.floor - 3, HALL.floor - 1);   /* the hall's east wall: her arena wall shuts it; when she dies the nest tears loose there - the way down */
  hallSmokers.push([297, HALL.floor - 1], [330, HALL.floor - 1]);   /* her hall's own stands (the hands run them like the level's) */
  ent('hornetqueen', 313, HALL.floor - 7, { face: -1 });

  // ================= 6. THE FALLING NEST (333-353): DESCENT (after her death) - down beside the trunk on comb ledges that give way =================
  /* the drop: 333-346 between the nest's torn side (332) and the great pine's trunk (347-352, solid from the sky to row 59); at the foot a root arch under
     the trunk (rows 60-65) opens on the pine's roots and the marsh beyond */
  air(333, 346, 0, FL - 1);
  block(347, 352, 0, FL - 7); air(347, 353, FL - 6, FL - 1);
  ground(333, 353, FL);
  block(333, 335, HALL.floor, HALL.floor);                   /* the hall floor's torn edge */
  for (const [x0, x1, row] of LEDGES) { shelf(x0, x1, row); crumbles.push({ x0, x1, row, count: 2, kind: 'comb' }); }
  for (let x = 333; x <= 338; x++) set(x, FL - 1, T.SPIKE); /* a bramble at the foot of the drop, under the west ledges: the ledges are the way down */
  ent('check', 351, FL - 1);

  // ================= 7. THE MARSH EDGE (354-419): THE WAY OUT - the great pine's roots down to the marsh: reeds, the first water =================
  const water = (x0, x1, yTop) => pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: yTop * TS + 4, shallow: true, depth: 12 });   /* (MARSH WOOD's own shallows: you wade them) */
  const reeds = (x, y, n) => { for (let i = 0; i < n; i++) set(x + i, y, T.REED); };
  ground(354, 366, FL);
  shelf(358, 362, FL - 2);                                   /* a root of the great pine arching over the floor (a second height) */
  hornet(364, FL - 6, { squad: 'edge' });                    /* a hornet that fled the falling nest, over the roots */
  ground(367, 374, FL + 1); water(367, 374, FL);             /* THE FIRST WATER: a shallow pool where the roots give way to the marsh (wade it) */
  reeds(366, FL - 1, 1); reeds(375, FL - 1, 1);
  ground(375, 388, FL); shelf(379, 384, FL - 3);             /* a root hummock, a last root shelf over it */
  drone(384, FL - 1, { squad: 'edge' });                     /* a comb drone that came down with the nest */
  coins([380, FL - 4], [382, FL - 4]);
  ground(389, 398, FL + 1); water(389, 398, FL); reeds(388, FL - 1, 1); reeds(394, FL - 1, 2); reeds(399, FL - 1, 1);   /* the second water, reeds standing in it */
  ground(399, W - 1, FL);
  sign(356, FL - 1, 'THE MARSH BEGINS WHERE THE PINE ENDS. THE BULLFROG KING KEEPS THE WATER AHEAD.');
  ent('gate', 416, FL - 1);

  /* WHERE EACH COMB LANDS: its plumb line down to the first footing under any of its columns (a chained comb names its own: it lands on the one under it) */
  const foot = v => v === T.SOLID || v === T.ONEWAY || v === T.PLANK || v === T.SPIKE;
  for (const c of combs) { if (c.land !== undefined) continue; let y = c.row + c.rows; for (; y < H; y++) { let hit = false; for (let x = c.x0; x <= c.x1; x++) if (foot(L.grid[y * W + x])) hit = true; if (hit) break; } c.land = y - c.rows; }
  const reachSpans = combs.map(c => [c.x0, c.x1, c.land]);
  /* THE MACHINES AS ENTS (the hands read the arrays; the tools - level-quality's gadgets, the stuck guide - read these): a comb at its middle, a stand, a wax shelf, a brood cell */
  for (const c of combs) ent('comb', (c.x0 + c.x1) >> 1, c.row + c.rows - 1, { id: c.id, land: c.land });   /* (in its lowest row: where the guide's glint and its done-test look) */
  for (const [x, row] of smokers) ent('smoker', x, row);
  for (const [x0, x1, row] of wax) ent('wax', (x0 + x1) >> 1, row - 1, { x0, x1 });   /* (hallSmokers / hallWax are the boss room's: not listed here) */
  for (const c of cells) ent('broodcell', c.x, c.y);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 2, y: FL - 1 }, pools, falls: [], moversExtra: [], gateAfterBoss: true,   /* (claude/hornetsnest2) her death opens the way on: the descent and the marsh's edge to the gate */
    foeHit: { hornet: 0.85 },   /* a nest hornet's sting is the river wasp's machine at 0.85 of its blow (claude/hornetsnest2: 0.6 -> 0.85 with the venom spitters gone: the level-1 curve read EASY at 30%) */
    squadBands: [{ lo: 400, hi: 419, spots: 0, why: "THE MARSH EDGE: the last columns (past the second water) are the marsh's bank and the gate - the way out after her death" }],
    hornetsNest: true, palette: { dress: 'wood' }, /* integ116: names the forest kit it has always painted with (tools/skins.mjs: nothing falls through unnamed) */ combs, wax: wax.concat(hallWax), smokers: smokers.concat(hallSmokers), broodCells: cells, crumbles, reachSpans,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''), name, x0, x1 })),
    tints: [[0, 79, [214, 196, 120], 0.10], [80, 168, [220, 190, 120], 0.14], [169, 247, [230, 170, 70], 0.16], [248, 294, [200, 120, 70], 0.18], [295, 332, [220, 150, 50], 0.18], [333, 353, [120, 150, 110], 0.10], [354, 419, [120, 160, 110], 0.12]],   /* the pine's green-gold, the paper's parchment, the comb's amber deepening to the brood's red-amber, then out under the pine to the marsh's green */
    music: 'hornetnest',   /* claude/hornetmusic: "Cathedral in the forest (ambient loop)" by congusbongus, CC0 */
    ambient: [{ x0: 0, x1: 80 * TS, kind: 'forest' }, { x0: 80 * TS, x1: 333 * TS, kind: 'cave' }, { x0: 333 * TS, x1: 99999, kind: 'forest' }],
    arena: { x0: HALL.x0 * TS, x1: (HALL.x1 + 1) * TS, floor: HALL.floor * TS, trigger: HALL.trigger * TS, wallL: HALL.wallL, wallR: HALL.wallR, boss: 'hornetqueen', music: 'hornetqueen', tint: '#e0a040', tintA: 0.12, fx: 'dust', stage: 1,
      top: HALL.top * TS, perches: PERCHES.map(([x0, x1, row, id, fall]) => ({ x0, x1, row, id, fall: !!fall })), cells: HALL_CELLS.map(([x, y]) => ({ x, y })), p2: HALL_P2 },
    descent: { x0: 333, x1: 353, top: HALL.floor, bottom: FL, ledges: LEDGES, check: [351, FL - 1], out: HALL.wallR },   /* THE FALLING NEST, after her death (src/hornet-queen-hands.js tick) */
  };
}
