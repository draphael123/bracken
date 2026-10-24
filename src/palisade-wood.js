// src/palisade-wood.js - THE PALISADE WOOD (claude/palisadewood, the OPUS GREYBOX of the level and its boss, 2026-10-24). Brief scratch/brief-palisadewood-1015.md
// (Daniel's 10-15 interview + the '!! 10-18' AUTUMN note) and the Rootway recipe (scratch/review-rootway-recipe-1014.md). THE ROOTWAY -> HERE -> KINGSWOOD.
// This file is the level the game runs, laid by hand (nothing sprinkled); src/palisade-hands.js is its rule and machines (the props, the stake-setter, the
// palisade landmark); THE BATTERING BEAST (src/battering-beast.js + -hands.js) is its boss.
//
// THE STORY BEAT: up out of the Rootway's fungus the caps thin into an ordinary AUTUMN wood (russet and gold, leaves falling, the harvest the goblins took:
// baskets, nut piles, rakes) - and GORM'S FORCES ARE WALLING IT OFF: a long PALISADE under construction through the trees, work crews, scaffolds, stacked
// stakes, half-built watchtowers, siege engines being readied, and supply carts rolling on to Kingswood's Royal Road. THE PALISADE LINE and THE HALF-BUILT
// GATEHOUSE stand on the skyline from the first screen (src/palisade-hands.js drawSky) and grow as you come.
//
// THE RULE (L.rule): THE WALL IS STILL GOING UP: KNOCK OUT A PROP AND WHAT IT HOLDS COMES DOWN.
//   A PROP (L.hoists - the Rootway's / Kingswood's data shape, so the guide, the reach fill and the pilot bot read it unchanged: `cleat` is the prop's foot)
//   is a timber shore with a WEDGE at its foot, lashed with rope, strain marks on it; it glints while it holds. ANY BLOW knocks the wedge out (every hero) and
//   what it holds COMES DOWN - and what it will do is DRAWN FIRST (a dotted ghost of where it lands / the road it rolls):
//     ramp    a SCAFFOLD SECTION folds down into a RAMP (steps laid where it lands: THE FELLED EDGE's ledge, THE SCAFFOLDS' wall)
//     tower   a HALF-BUILT WATCHTOWER topples across a gap - a BRIDGE (THE STAKE YARD's gap, the wall top's unfinished span)
//     bridge  the GATEHOUSE SCAFFOLD falls across the ditch - a BRIDGE (the same cells as a tower, drawn as a scaffold frame)
//     crew    a WORK CREW's WALKWAY drops: the planks go, the crew falls (hurt), the timber comes down on whoever stands under it
//     stakes  a STACK OF STAKES comes down on what is under it, then ROLLS along the road through every foe in its way until a wall stops it
//   What comes down and STAYS (a ramp, a bridge) stays for the attempt: a death lays its cells again. Walkways and stake stacks are put back with the foes.
//
// FIVE NAMED AREAS (A10c: one shrine at the end of each area's exam, one before the boss). Columns; rows: smaller is higher.
//     0-104  THE FELLED EDGE       TEACH   the caps thin out; THE FIRST PROP (a scaffold folds into a RAMP up the ledge - required, safe); a crew on a walkway
//                                          (knock its prop: the crew comes down); exam = THE FELLING CREW (a maul brute and a shield under a walkway); shrine 102
//   104-204  THE STAKE YARD        TEST    STACKED STAKES roll through a patrol; THE STAKE-SETTER (the one new foe: he plants a stake wall in your way - knock it down or
//                                          jump it); THE WATCHTOWER over the gap no jump crosses (REQUIRED); exam = the yard gate (setter + shield + archer, a stake stack
//                                          over them); shrine 202
//   204-306  THE SCAFFOLDS         REMIX + A14 (the real platforming)  up the scaffold tiers to the palisade's top (the second RAMP - REQUIRED); along the UNFINISHED
//                                          WALL TOP: gaps to jump, loose boards that give way, a crew over you, the second WATCHTOWER across the unbuilt span (REQUIRED),
//                                          the half-built tower to climb over; a fall is a climb out of the slot; exam = the wall's end; shrine 299
//   306-390  THE HALF-BUILT GATEHOUSE  EXAM  down into the gatehouse yard: siege engines, supply carts; THE DITCH (its scaffold falls across - REQUIRED), the gate
//                                          stakes roll through the passage's guards, the crew over the gate, a setter; shrine 386, the old forest gate's door
//   390-442  THE OLD FOREST GATE   BOSS    THE BATTERING BEAST is brought up to batter the old gate you came through - two SCAFFOLDS in the clearing, each on a prop
export const PALISADE = { W: 443, H: 44, arena: [394, 438], floor: 25 };
export const SECTIONS = [['THE FELLED EDGE', 0, 104], ['THE STAKE YARD', 104, 204], ['THE SCAFFOLDS', 204, 306], ['THE HALF-BUILT GATEHOUSE', 306, 390], ['THE OLD FOREST GATE', 390, 443]];
/* the rule's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/palisadewood.mjs and the brief */
export const ARCS = {
  ramp: { teach: [14, 26], remix: [205, 216] },                          /* the first prop (the ledge); the wall's ramp */
  crew: { teach: [26, 40], develop: [80, 96], remix: [232, 247], exam: [356, 368] },
  stakes: { teach: [106, 130], develop: [178, 198], exam: [340, 362] },
  tower: { test: [139, 156], remix: [248, 262], exam: [322, 338] },
  setter: { teach: [130, 140], develop: [184, 196], remix: [284, 292], exam: [364, 372] },
};
export const PW_RULE = 'THE WALL IS STILL GOING UP: KNOCK OUT A PROP AND WHAT IT HOLDS COMES DOWN.';

export function buildPalisadeWood({ painter, T, TS }) {
  const { W, H } = PALISADE;
  const L = painter(W, H), { set, block, ent } = L;
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1);
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const sign = (x, y, text, o) => ent('sign', x, y, { text, ...(o || {}) });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ squad }, o || {}));
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v, o) => ent('deco', x, y, { kind, v: v || 0, ...(o || {}) });
  const hoists = [], crumbles = [], harvest = [];
  /* A PROP: id, the load's column `x`, the top row of what it holds `top`, its foot `cleat` [x, y] (y: the cell a hero stands in to strike it), and what it holds:
       { load: 'ramp', steps: [[x0, x1, row, 'S'|'O']] }   steps laid where the section lands ('S' a solid block from `row` down to the ground, 'O' a one-way board)
       { load: 'tower'|'bridge', span: [x0, x1, row] }       one-way cells across the gap
       { load: 'crew', walk: [x0, x1, row] }                 the walkway's boards (laid here) - cleared when it drops
       { load: 'stakes', hang: row, roll: +1|-1, rollMax }   the stack's bottom row while it is racked
     An ent at the prop's foot names it for the guide, the tools and the gadget count (src/threat.js: worth 0) */
  const KIND = { ramp: 'scaffoldprop', tower: 'towerprop', bridge: 'towerprop', crew: 'crewprop', stakes: 'stakeprop' };
  const prop = (id, o) => { hoists.push(Object.assign({ id, cut: false }, o)); if (o.load === 'crew') plank(o.walk[0], o.walk[1], o.walk[2]); ent(KIND[o.load], o.cleat[0], o.cleat[1], { id }); return o; };
  const setter = (x, y, squad, o) => foe('sprig', x, y, squad, Object.assign({ face: -1, pw: { pwSetter: true } }, o || {}));   /* THE STAKE-SETTER (src/palisade-hands.js): the goblin with the mallet and an armful of stakes */
  const crop = (x, y, k) => harvest.push([x, y, k]);   /* the harvest the goblins took (greybox props drawn by src/palisade-hands.js: basket, nuts, rake, sheaf, apples) */

  block(0, 0, 0, H - 1);                                                           /* the world's west edge */

  // ================= 1. THE FELLED EDGE (0-104): TEACH - the fungus thins into the autumn wood, and the goblins are felling it =================
  ground(1, 24, 38);
  sign(5, 37, "THE PALISADE WOOD. GORM'S GOBLINS ARE WALLING OFF THE FOREST FOR THEIR KING.");
  deco(2, 37, 'mushroom', 0); deco(9, 37, 'fern', 0); deco(11, 37, 'stump', 0); deco(16, 37, 'timber', 0);   /* (the last caps of the Rootway, then stumps: the felling) */
  crop(7, 37, 'basket'); crop(13, 37, 'nuts');
  foe('sprig', 14, 37, 'edgeA', { face: -1 });
  coins([8, 36], [12, 36]);
  plank(4, 9, 35); coins([5, 34], [8, 34]);                                        /* a felled trunk propped on its stump (a second height) */
  /* THE FIRST PROP, SAFE: a scaffold section stands against the ledge (five rows: no jump), held by a prop at the roadside. Knock it out: the section folds down
     into a ramp of two steps up the ledge. Nothing hurts here - a miss costs a walk back */
  sign(10, 37, 'THE WALL IS STILL GOING UP. KNOCK OUT A PROP AND WHAT IT HOLDS COMES DOWN.');
  sign(17, 37, 'STRIKE THE PROP: THE SCAFFOLD COMES DOWN AS A RAMP.');
  prop('edgeRamp', { x: 22, top: 29, cleat: [19, 37], load: 'ramp', steps: [[21, 22, 36, 'S'], [23, 24, 34, 'S']] });
  ground(25, 44, 33);                                                              /* THE LEDGE */
  /* a WORK CREW on a walkway over the ledge: knock its prop and the crew comes down (teach - optional; they come down to you anyway) */
  prop('edgeCrew', { x: 34, top: 28, cleat: [28, 32], load: 'crew', walk: [31, 38, 28] });
  foe('sprig', 33, 27, 'edgeCrew', { face: -1, perch: true }); foe('sprig', 36, 27, 'edgeCrew', { face: -1, perch: true });
  sign(26, 32, 'A CREW ON A WALKWAY. KNOCK OUT ITS PROP: THE CREW COMES DOWN.');
  coins([30, 31], [40, 31], [43, 31]); crop(41, 32, 'rake');
  ground(45, 58, 35);
  foe('brute', 52, 34, 'edgeB', { face: -1 }); foe('sprig', 56, 34, 'edgeB', { face: -1 });
  plank(46, 51, 32); coins([47, 31], [50, 31]);
  deco(47, 34, 'timber', 1); deco(57, 34, 'stump', 1); crop(49, 34, 'sheaf');
  ground(59, 61, 38);                                                              /* the saw pit (three down, three up) */
  ground(62, 79, 35);
  foe('rockgoblin', 72, 34, 'edgeC', { face: -1 });                                /* a stake-thrower on the felled ground (art: the reskin) */
  plank(64, 70, 32); coins([65, 31], [68, 31]);
  deco(66, 34, 'stump', 0); deco(75, 34, 'fruitTree', 0); crop(69, 34, 'apples');
  coins([64, 33], [70, 33], [77, 33]);
  ground(80, 128, 32);
  /* THE FELLING CREW (the area's exam): the foreman's maul brute and a shield under the crew's walkway; knock its prop and the walkway comes down on them. An archer
     on the stand behind */
  prop('edgeExamCrew', { x: 90, top: 27, cleat: [83, 31], load: 'crew', walk: [86, 94, 27] });
  foe('sprig', 89, 26, 'felling', { face: -1, perch: true });
  foe('brute', 92, 31, 'felling', { face: -1 }); foe('shield', 88, 31, 'felling', { face: -1 });
  plank(96, 100, 28); foe('archer', 98, 27, 'felling', { face: -1, perch: true });
  sign(81, 31, 'THE FELLING CREW. THEIR WALKWAY HANGS OVER THEM.');
  coins([85, 30], [97, 27], [100, 27]); deco(101, 31, 'gobPennant', 0);
  ent('check', 102, 31);                                                           /* SHRINE ONE: the felled edge's exam is behind you */

  // ================= 2. THE STAKE YARD (104-204): TEST - stacked stakes, the stake-setter, the first watchtower =================
  sign(105, 31, 'THE STAKE YARD. THE WALL IS SHARPENED HERE.');
  prop('yardStakes', { x: 114, top: 25, hang: 29, cleat: [110, 31], load: 'stakes', roll: 1, rollMax: 15 });
  sign(108, 31, 'STACKED STAKES. KNOCK OUT THEIR PROP: THEY COME DOWN AND ROLL.');
  foe('pike', 117, 31, 'stakeLine', { face: -1 }); foe('sprig', 121, 31, 'stakeLine', { face: -1 }); foe('sprig', 124, 31, 'stakeLine', { face: -1 });
  plank(117, 119, 30); plank(120, 127, 27); coins([122, 26], [125, 26]);        /* the sharpeners' bench and the drying rack over the yard */
  deco(126, 31, 'spearRack', 0); coins([116, 30], [122, 30]);
  block(129, 130, 30, 31);                                                         /* the chopping block the stakes split on (two rows: a hop) */
  ground(129, 146, 32);
  /* THE STAKE-SETTER (the level's new foe): he plants a wall of stakes between you - knock it down (two blows) or jump it */
  setter(138, 31, 'setterA');
  sign(132, 31, 'A STAKE-SETTER PLANTS A WALL IN YOUR WAY. KNOCK IT DOWN, OR JUMP IT.');
  crop(134, 31, 'basket'); deco(141, 31, 'stakeFence', 0);
  /* THE GAP: eight wide, no jump crosses it. A half-built watchtower stands on its lip on a prop: knock it out and the tower falls across - a bridge (REQUIRED).
     A fall is a climb out of the pit (boards up its west wall); the woodcutters' hollow off its floor holds a silver */
  prop('yardTower', { x: 145, top: 21, cleat: [142, 31], load: 'tower', span: [147, 154, 32] });
  sign(140, 31, "NO JUMP CROSSES THIS GAP. KNOCK OUT THE WATCHTOWER'S PROP: IT FALLS ACROSS.");
  ground(147, 154, 42);
  plank(147, 149, 39); plank(151, 153, 36); plank(147, 149, 33);
  ground(155, 168, 32);
  air(155, 160, 39, 41); ent('silver', 159, 41); crop(157, 41, 'nuts');             /* SILVER ONE: THE WOODCUTTERS' HOLLOW (off the pit's floor - off the road) */
  plank(156, 158, 30); plank(160, 164, 28); foe('archer', 162, 27, 'farTower', { face: -1, perch: true });
  foe('sprig', 166, 31, 'farTower', { face: -1 });
  coins([150, 30], [152, 30], [158, 31]);
  ground(169, 204, 29);                                                            /* the yard's upper ground (three up) */
  plank(170, 176, 26); coins([172, 25], [175, 25]);
  deco(171, 28, 'cart', 0); crop(174, 28, 'sheaf');
  /* THE YARD GATE (the area's exam): a setter and a shield hold it, an archer on the scaffold over the gate; a stake stack racked over them rolls through them */
  prop('yardExamStakes', { x: 183, top: 21, hang: 25, cleat: [179, 28], load: 'stakes', roll: 1, rollMax: 13 });
  setter(186, 28, 'yardGate'); foe('shield', 190, 28, 'yardGate', { face: -1 });
  plank(193, 197, 25); foe('archer', 195, 24, 'yardGate', { face: -1, perch: true });
  block(198, 199, 27, 28);                                                         /* the gatepost the stakes split on */
  sign(176, 28, 'THE YARD GATE. ITS STAKES ARE RACKED OVER THE GUARD.');
  coins([181, 27], [188, 27], [194, 24]); deco(200, 26, 'gobPennant', 1);
  ent('check', 202, 28);                                                           /* SHRINE TWO: the yard gate is behind you */

  // ================= 3. THE SCAFFOLDS (204-306): REMIX + A14 - up the scaffolds and along the unfinished wall top =================
  sign(205, 28, 'THE SCAFFOLDS. CLIMB THE WALL THEY ARE BUILDING.');
  ground(205, 212, 29);
  ground(213, 300, 13);                                                            /* THE PALISADE: the wall itself, its top thirteen rows over the yard */
  /* the scaffold tiers up its face (three rows a tier) */
  plank(206, 211, 26); plank(212, 215, 23); plank(206, 211, 20);
  foe('sprig', 208, 25, 'tiers', { face: -1 }); foe('archer', 214, 22, 'tiers', { face: -1, perch: true });
  coins([209, 24], [213, 21], [208, 18]);
  /* THE WALL'S RAMP (REQUIRED, the remix): from the top tier the wall is seven rows - a scaffold section stands against it; its prop folds it into a stair of boards */
  prop('wallRamp', { x: 213, top: 12, cleat: [210, 19], load: 'ramp', steps: [[212, 214, 17, 'O'], [212, 215, 15, 'O']] });
  air(212, 212, 13, 16);                                                           /* (the wall's foot stands back a tile at the ramp: the boards land against it) */
  sign(207, 19, 'THE WALL IS TOO HIGH. KNOCK OUT THE SCAFFOLD PROP: IT FOLDS INTO A STAIR.');
  /* THE UNFINISHED WALL TOP (A14): its gaps are sections not yet built - a slot nine rows deep with rungs up its side (a fall is a climb, never the run) */
  sign(218, 12, 'THE WALL TOP IS UNFINISHED. JUMP THE GAPS; A FALL IS A CLIMB OUT OF THE SLOT.');
  air(227, 229, 13, 21); plank(227, 229, 19); plank(227, 229, 16);                 /* slot one: three wide (a jump) */
  ent('silver', 228, 21);                                                          /* SILVER TWO: dropped down slot one by the crew (a fall to it, the rungs back up) */
  /* THE LOOSE BOARDS over slot two: they give way a beat after you stand on them (src/tower-collapse.js); a crew on a walkway over them throws stakes */
  air(238, 241, 13, 21); plank(238, 241, 19); plank(238, 241, 16);
  plank(238, 241, 13); crumbles.push({ x0: 238, x1: 241, row: 13, rows: 1, count: 1.05, kind: 'bough' });
  prop('wallCrew', { x: 241, top: 8, cleat: [233, 12], load: 'crew', walk: [236, 246, 8] });
  foe('rockgoblin', 239, 7, 'wallCrew', { face: -1, perch: true }); foe('sprig', 243, 7, 'wallCrew', { face: -1, perch: true });
  sign(231, 12, 'THE LOOSE BOARDS GIVE WAY: KEEP MOVING. THE CREW OVER THEM THROWS STAKES.');
  coins([224, 11], [235, 11], [245, 11]);
  /* THE UNBUILT SPAN (REQUIRED): eight wide - the second watchtower stands on the wall top at its lip */
  air(254, 261, 13, 21); plank(254, 256, 19); plank(254, 256, 16);
  prop('wallTower', { x: 252, top: 3, cleat: [249, 12], load: 'tower', span: [254, 261, 13] });
  sign(247, 12, 'THE UNBUILT SPAN. ITS WATCHTOWER STANDS ON A PROP.');
  foe('sprig', 265, 12, 'span', { face: -1 });
  coins([257, 11], [259, 11]);
  /* THE HALF-BUILT TOWER on the wall: climb over it (a board, its top, down); the scaffold over it holds a silver */
  plank(268, 270, 10); block(272, 275, 7, 12); foe('archer', 274, 6, 'tower', { face: -1, perch: true });
  plank(276, 279, 4); ent('silver', 278, 3);                                       /* SILVER THREE: on the tower's top scaffold (a jump off the road) */
  plank(277, 279, 10);
  coins([269, 9], [273, 6], [280, 11]);
  /* THE WALL'S END (the area's exam): a brute and a setter on the wall top, an archer on the end scaffold, the crew's walkway over the brute */
  prop('wallExamCrew', { x: 290, top: 8, cleat: [284, 12], load: 'crew', walk: [287, 293, 8] });
  foe('sprig', 290, 7, 'wallEnd', { face: -1, perch: true });
  foe('brute', 291, 12, 'wallEnd', { face: -1 }); setter(287, 12, 'wallEnd');
  plank(295, 298, 9); foe('archer', 297, 8, 'wallEnd', { face: -1, perch: true });
  sign(282, 12, "THE WALL'S END. ITS CREW STANDS OVER THE BRUTE.");
  coins([286, 11], [294, 11]);
  ent('check', 299, 12);                                                           /* SHRINE THREE: the wall top is behind you */

  // ================= 4. THE HALF-BUILT GATEHOUSE (306-390): THE EXAM - every use at once, under the landmark =================
  plank(301, 303, 16); plank(304, 306, 19); plank(301, 303, 22);                   /* down the wall's far face (boards) */
  ground(301, 329, 25);
  sign(307, 24, "THE HALF-BUILT GATEHOUSE. THE KING'S SIEGE ENGINES ARE READIED HERE.");
  deco(310, 24, 'siege', 0); deco(316, 24, 'cart', 1); deco(320, 24, 'batteringRam', 0); crop(313, 24, 'apples'); crop(318, 24, 'basket');
  plank(308, 314, 22); coins([309, 21], [313, 21]);
  foe('pike', 312, 24, 'yard2', { face: -1 }); foe('shield', 317, 24, 'yard2', { face: -1 });
  coins([308, 23], [314, 23], [322, 23]);
  /* THE DITCH (REQUIRED): eight wide; the gatehouse scaffold stands on its lip on a prop - it falls across. A fall is a climb (a board up its west wall) */
  prop('gateBridge', { x: 328, top: 14, cleat: [325, 24], load: 'bridge', span: [330, 337, 25] });
  sign(323, 24, 'THE DITCH. THE GATEHOUSE SCAFFOLD STANDS ON A PROP.');
  ground(330, 337, 31); plank(330, 332, 28);
  ground(338, 442, 25);
  /* THE GATEHOUSE: half-built over the road (the passage under it four rows high); its stakes racked on its far side roll back through the passage at its guards */
  block(346, 356, 6, 20);
  foe('shield', 349, 24, 'passage', { face: -1 }); foe('pike', 353, 24, 'passage', { face: -1 });
  prop('gateStakes', { x: 360, top: 15, hang: 19, cleat: [342, 24], load: 'stakes', roll: -1, rollMax: 15 });
  sign(340, 24, "THE GATE'S STAKES ARE RACKED BEYOND THE PASSAGE: KNOCK OUT THEIR PROP. THEY ROLL BACK THIS WAY.");
  deco(344, 24, 'gobPennant', 0); deco(358, 24, 'gobPennant', 1);
  /* the crew over the gate's far side, a setter on the road, the supply carts on to Kingswood */
  prop('gateCrew', { x: 362, top: 18, cleat: [358, 24], load: 'crew', walk: [359, 366, 19] });
  foe('rockgoblin', 361, 18, 'gateCrew', { face: -1, perch: true }); foe('archer', 364, 18, 'gateCrew', { face: -1, perch: true });
  setter(369, 24, 'gateRoad');
  plank(368, 374, 21); plank(377, 383, 22); coins([370, 20], [380, 21]);
  deco(374, 24, 'cart', 0); deco(379, 24, 'barrels', 0); crop(377, 24, 'sheaf'); crop(381, 24, 'nuts');
  sign(372, 24, "THE SUPPLY CARTS ROLL ON TO KINGSWOOD'S ROYAL ROAD.");
  coins([343, 23], [351, 23], [366, 23], [376, 23]);
  ent('check', 386, 24);                                                           /* SHRINE FOUR: the old forest gate's door */
  sign(389, 24, 'THE BATTERING BEAST. KNOCK OUT A SCAFFOLD PROP SO THE SCAFFOLD FALLS IN ITS PATH: IT CHARGES INTO THE WRECK AND STICKS.');

  // ================= 5. THE OLD FOREST GATE (394-438): THE BATTERING BEAST =================
  /* A clearing at the old forest gate (the gate you came through stands at its west wall: the beast is brought up to batter it). Two scaffolds on the clearing's floor,
     their decks three rows up (a jump onto them out of a charge), each on a PROP at its inner foot: knock it out and the scaffold comes down in the beast's path (src/battering-beast.js) */
  const [A0, A1] = PALISADE.arena, FL = PALISADE.floor;
  plank(A0 + 4, A0 + 8, FL - 3); plank(A1 - 8, A1 - 4, FL - 3);
  ent('torch', A0 + 1, FL - 1); ent('torch', A1 - 1, FL - 1);
  deco(A0 + 14, FL - 1, 'plantedSpears', 0); deco(A1 - 14, FL - 1, 'stakeFence', 1);
  ent('batteringbeast', A1 - 10, FL - 1);
  block(W - 1, W - 1, 0, H - 1);                                                   /* the world's east edge */

  const arena = { x0: A0 * TS, x1: (A1 + 1) * TS, floor: FL * TS, trigger: (A0 + 6) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'batteringbeast', music: 'boss3', tint: '#c87a3a', tintA: 0.08,
    /* THE TWO SCAFFOLDS (src/battering-beast.js geom): deck columns, deck row, the prop's column (its inner foot) and the side the wreck falls to */
    scaffolds: [{ x0: A0 + 4, x1: A0 + 8, row: FL - 3, prop: A0 + 10, dir: 1 }, { x0: A1 - 8, x1: A1 - 4, row: FL - 3, prop: A1 - 10, dir: -1 }], gate: A0 - 1 };
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 37 }, pools: [], falls: [],
    arena, pwood: true, hoists, crumbles, kwoodCrumbles: true, harvest,
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 240,                  /* four shrines, one closing each area's exam (A10c): src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: 390, hi: W - 1, spots: 0, why: 'THE OLD FOREST GATE: columns 390-442 are the beast\'s clearing - no squad stands in a boss arena' }],
    unlocks: [
      { kind: 'hoists', opens: 'what the prop holds comes down: a scaffold folds into a ramp, a watchtower or the gatehouse scaffold falls across as a bridge, a crew\'s walkway drops its crew, a stack of stakes rolls down the road', hud: 'THE PROP GOES: IT COMES DOWN' },
    ],
    duskStart: -1, duskLen: 1, music: 'kingswood', night: false, glowNight: true,
    interiors: [],
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(210,140,70,0.16)', grass: '#9a7a2a', grassL: '#d0a83a', grassD: '#5e4a1a', dirt: '#4e3420', dirtL: '#63432a', dirtD: '#2e1c10', canopy: ['#8a3a18', '#b8582a', '#d8862e', '#e8b04a'] },
    weather: [{ x0: 0, x1: 99999, kind: 'leaves' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'forest' }],
    /* THE SEAM from the Rootway (its amber canopy), then russet and gold: the wood is an autumn wood, warming toward the gate */
    tints: [[-24, 20, [200, 130, 90], 0.10], [-24, 104, [220, 150, 70], 0.11], [104, 204, [225, 140, 60], 0.12], [204, 306, [215, 125, 60], 0.12], [306, 390, [210, 110, 55], 0.13], [390, W + 24, [200, 95, 50], 0.13]],
    reachExact: false,
  };
}
