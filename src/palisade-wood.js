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
export const PALISADE = { W: 503, H: 44, arena: [454, 498], floor: 25 };   /* (claude/palisade2: THE BREACH, 60 columns at 307 - the gatehouse and the clearing moved east 60) */
export const SECTIONS = [['THE FELLED EDGE', 0, 104], ['THE STAKE YARD', 104, 204], ['THE SCAFFOLDS', 204, 306], ['THE HALF-BUILT GATEHOUSE', 306, 450], ['THE OLD FOREST GATE', 450, 503]];
/* (claude/palisade2, Daniel 10-25: "platforming sections over destroyed terrain where archers shoot at you") THE BREACH: the gatehouse area's approach, A14's second real
   platforming section - over the crater the beast's ram and the siege fire made: burnt stumps, broken palisade, crumbling boards over a stake pit, three archers on the
   towers still standing. No shrine inside it (fewer checkpoints): shrine three (299) is behind you, shrine four (446) after the gatehouse. Its exam: the last crossing */
export const BREACH = { x0: 307, x1: 366, pitRow: 32, towers: [[324, 19], [349, 18], [365, 22]] };
/* the rule's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/palisadewood.mjs and the brief */
export const ARCS = {
  ramp: { teach: [14, 26], remix: [205, 222] },                          /* the first prop (the ledge); the wall's ramp */
  crew: { teach: [26, 40], develop: [80, 96], remix: [232, 247], exam: [416, 428] },
  stakes: { teach: [106, 130], develop: [178, 198], exam: [400, 422] },
  tower: { test: [139, 156], remix: [248, 262], exam: [382, 398] },
  setter: { teach: [130, 140], develop: [184, 196], remix: [284, 292], exam: [424, 432] },
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
  foe('hound', 15, 37, 'edgeA', { face: -1 });                                      /* the crews' hound: it runs at you over the stumps */
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
  foe('brute', 52, 34, 'edgeB', { face: -1 }); foe('pike', 55, 34, 'edgeB', { face: -1 }); foe('archer', 49, 31, 'edgeB', { face: -1, perch: true });
  plank(46, 51, 32); coins([47, 31], [50, 31]);
  deco(47, 34, 'timber', 1); deco(57, 34, 'stump', 1); crop(49, 34, 'sheaf');
  ground(59, 61, 37);                                                              /* the saw pit (two down, two up) */
  ground(62, 79, 35);
  foe('rockgoblin', 72, 34, 'edgeC', { face: -1 }); foe('pike', 76, 34, 'edgeC', { face: -1 }); foe('hound', 69, 31, 'edgeC', { face: -1, perch: true });                                /* a stake-thrower on the felled ground (art: the reskin) */
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
  foe('shield', 157, 31, 'farTower', { face: -1 }); foe('pike', 163, 31, 'farTower', { face: -1 });
  ground(166, 168, 30);                                                            /* (a step up to the upper yard: two, then one) */   /* (the bridge sets you down in front of the shield) */
  coins([150, 30], [152, 30], [158, 31]);
  ground(169, 204, 29);                                                            /* the yard's upper ground (three up) */
  plank(170, 176, 26); coins([172, 25], [175, 25]);
  foe('brute', 178, 28, 'yardCart', { face: -1 }); foe('hound', 174, 25, 'yardCart', { face: -1, perch: true });
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
  ground(205, 221, 29);
  ground(222, 300, 13);                                                            /* THE PALISADE: the wall itself, its top thirteen rows over the yard */
  /* the scaffold tiers up its face (three rows a tier) */
  plank(206, 209, 26); plank(210, 213, 23); plank(214, 217, 21);                  /* (a straight stair of tiers, left to right: no tier over another) */
  foe('sprig', 208, 25, 'tiers', { face: -1 }); foe('archer', 212, 22, 'tiers', { face: -1, perch: true });
  coins([207, 24], [211, 21], [215, 18]);
  /* THE WALL'S RAMP (REQUIRED, the remix): from the top tier the wall is seven rows - a scaffold section stands against it; its prop folds it into a stair of boards */
  prop('wallRamp', { x: 219, top: 12, cleat: [215, 28], load: 'ramp', steps: [[218, 219, 18, 'O'], [219, 221, 15, 'O']] });   /* (its prop at the scaffold's foot on the yard: knock it, then climb the tiers to the stair) */
  sign(211, 28, 'THE TIERS STOP SHORT OF THE TOP. KNOCK OUT THE SCAFFOLD PROP: IT FOLDS INTO A STAIR.');
  /* THE UNFINISHED WALL TOP (A14): its gaps are sections not yet built - a slot nine rows deep with rungs up its side (a fall is a climb, never the run) */
  sign(223, 12, 'THE WALL TOP IS UNFINISHED. JUMP THE GAPS; A FALL IS A CLIMB OUT OF THE SLOT.');
  air(227, 229, 13, 21); plank(227, 229, 19); plank(227, 229, 16); plank(229, 229, 14);   /* (a one-tile step at the slot's far lip: the climb out) */                 /* slot one: three wide (a jump) */
  ent('silver', 228, 21);                                                          /* SILVER TWO: dropped down slot one by the crew (a fall to it, the rungs back up) */
  /* THE LOOSE BOARDS over slot two: they give way a beat after you stand on them (src/tower-collapse.js); a crew on a walkway over them throws stakes */
  air(238, 241, 13, 21); plank(238, 241, 19); plank(238, 241, 16); plank(241, 241, 14);
  plank(238, 241, 13); crumbles.push({ x0: 238, x1: 241, row: 13, rows: 1, count: 1.05, kind: 'bough' });
  prop('wallCrew', { x: 241, top: 8, cleat: [233, 12], load: 'crew', walk: [236, 246, 8] });
  foe('rockgoblin', 239, 7, 'wallCrew', { face: -1, perch: true }); foe('sprig', 243, 7, 'wallCrew', { face: -1, perch: true });
  foe('pike', 233, 12, 'boards', { face: -1 });
  sign(231, 12, 'THE LOOSE BOARDS GIVE WAY: KEEP MOVING. THE CREW OVER THEM THROWS STAKES.');
  coins([224, 11], [235, 11], [245, 11]);
  plank(222, 225, 9); foe('archer', 224, 8, 'slotOne', { face: -1, perch: true });   /* an archer over slot one: he covers the jump */
  /* THE UNBUILT SPAN (REQUIRED): eight wide - the second watchtower stands on the wall top at its lip */
  air(254, 261, 13, 21); plank(254, 256, 19); plank(254, 256, 16); plank(254, 254, 14);
  prop('wallTower', { x: 252, top: 3, cleat: [249, 12], load: 'tower', span: [254, 261, 13] });
  sign(247, 12, 'THE UNBUILT SPAN. ITS WATCHTOWER STANDS ON A PROP.');
  foe('shield', 264, 12, 'span', { face: -1 }); foe('hound', 267, 12, 'span', { face: -1 });
  coins([257, 11], [259, 11]);
  /* THE HALF-BUILT TOWER on the wall: climb over it (a board, its top, down); the scaffold over it holds a silver */
  plank(268, 270, 10); block(272, 275, 8, 12); foe('archer', 274, 7, 'tower', { face: -1, perch: true });
  plank(276, 279, 5); ent('silver', 278, 4);                                       /* SILVER THREE: on the tower's top scaffold (a jump off the road) */
  plank(277, 279, 10);
  coins([269, 9], [273, 7], [280, 11]);
  /* THE WALL'S END (the area's exam): a brute and a setter on the wall top, an archer on the end scaffold, the crew's walkway over the brute */
  prop('wallExamCrew', { x: 290, top: 8, cleat: [284, 12], load: 'crew', walk: [287, 293, 8] });
  foe('sprig', 290, 7, 'wallEnd', { face: -1, perch: true });
  foe('brute', 291, 12, 'wallEnd', { face: -1 }); setter(287, 12, 'wallEnd');
  plank(295, 298, 9); foe('archer', 297, 8, 'wallEnd', { face: -1, perch: true });
  foe('hornsman', 295, 8, 'wallEnd', { face: -1 });   /* (claude/palisadefoe) THE HORNSMAN, TAUGHT: the crew's handler on the end scaffold beside the archer - his horn hurries the archer over the brute's fight (src/hornsman.js) */
  sign(282, 12, "THE WALL'S END. ITS CREW STANDS OVER THE BRUTE.");
  coins([286, 11], [294, 11]);
  ent('check', 299, 12);                                                           /* SHRINE THREE: the wall top is behind you */

  // ================= 4. THE HALF-BUILT GATEHOUSE (306-450): THE EXAM - every use at once, under the landmark =================
  plank(301, 303, 16); plank(304, 306, 19); plank(301, 303, 22);                   /* down the wall's far face (boards) */
  ground(301, 308, 25);
  // ----- 4a. THE BREACH (307-366, claude/palisade2): A14 OVER DESTROYED TERRAIN, UNDER THE ARCHERS -----
  /* the palisade here is down: the beast's ram broke it and the siege fire took the wood. A crater of stakes (a SPIKE floor, it bites and sets you back) under what is
     left standing: burnt stumps, broken stake butts, a leaning panel, crumbling boards, and the three towers that did not fall - an archer on each. Every jump is in
     their sight (an archer sees within four rows): the draw is told ('!' and his draw pose), the arrow flies an arc you can jump over or drop under. Kill the first two
     by STORMING their towers (the route goes over each one); the third covers the last crossing - the exam */
  sign(304, 24, 'THE BREACH. THE BEAST CAME THROUGH HERE. ARCHERS HOLD THE TOWERS STILL STANDING.');
  ground(309, 361, 33); for (let x = 309; x <= 361; x++) set(x, 32, T.SPIKE);       /* the crater floor: sharpened stakes */
  block(311, 312, 24, 32); coins([311, 22]);                                        /* a burnt stump (up one) */
  block(315, 316, 23, 32); coins([315, 21]);                                        /* a stake butt (two across, up one) */
  plank(319, 322, 22);                                                              /* a leaning palisade panel */
  block(324, 326, 19, 32); foe('archer', 325, 18, 'breachA', { face: -1, perch: true });   /* TOWER ONE (standing): storm it - up three from the panel */
  sign(318, 21, 'THE TOWERS STILL STAND. STORM THEM: KILL THE ARCHER ON TOP.');
  plank(329, 332, 21); crumbles.push({ x0: 329, x1: 332, row: 21, rows: 1, count: 1.05, kind: 'bough' });   /* scorched boards: they give way */
  block(335, 336, 20, 32); coins([335, 18]);                                        /* a burnt stump */
  plank(340, 341, 22);                                                              /* a broken scaffold board */
  block(344, 345, 21, 32);                                                          /* a stump */
  plank(347, 347, 19);                                                              /* a stake butt's head: the step up to tower two */
  block(349, 351, 18, 32); foe('archer', 350, 17, 'breachB', { face: -1, perch: true });   /* TOWER TWO */
  foe('hornsman', 349, 17, 'breachB', { face: -1 });   /* (claude/palisadefoe) THE HORNSMAN on tower two: storm the tower and he is the one to reach (his horn hurries both towers' archers over the crossing) */
  coins([340, 20], [347, 17]);
  /* THE EXAM: the last crossing - crumbling boards over the pit under TOWER THREE's archer, and a pike waiting at the landing */
  sign(352, 17, 'THE LAST CROSSING. THE BOARDS GIVE WAY: KEEP MOVING.');
  plank(354, 356, 20); crumbles.push({ x0: 354, x1: 356, row: 20, rows: 1, count: 1.05, kind: 'bough' });
  plank(359, 361, 21); crumbles.push({ x0: 359, x1: 361, row: 21, rows: 1, count: 1.05, kind: 'bough' });
  coins([355, 18], [360, 19]);
  ground(362, 389, 25);
  block(365, 366, 22, 24); foe('archer', 366, 21, 'breachC', { face: -1, perch: true });   /* TOWER THREE (a stump of a tower: up three) */
  foe('pike', 363, 24, 'breachC', { face: -1 });
  foe('hornsman', 365, 21, 'breachC', { face: -1 });   /* (claude/palisadefoe) THE EXAM's horn: tower three's hornsman hurries the archers over the crumbling boards - cut his horn short, or storm him */
  /* the breach's wreck: what the beast left (art: burnt timber, a broken ram's track, scorched leaves) */
  /* (claude/palisade2) THE SIEGE CAMP'S DRESSING through the wood: the palisade's own stock and the crews' gear (rope, tools, sawdust, stakes cut to length) */
  harvest.push([3, 37, 'sawdust'], [20, 37, 'stakePile'], [42, 32, 'ropeCoil'], [56, 34, 'logStack'], [63, 34, 'sawdust'], [78, 34, 'toolRack'], [99, 31, 'ropeCoil'],
    [112, 31, 'stakePile'], [128, 31, 'sawdust'], [136, 31, 'toolRack'], [165, 31, 'logStack'], [185, 28, 'ropeCoil'], [203, 28, 'stakePile'],
    [207, 28, 'logStack'], [218, 28, 'toolRack'], [226, 12, 'ropeCoil'], [263, 12, 'sawdust'], [285, 12, 'stakePile'], [383, 24, 'toolRack'], [398, 24, 'stakePile'], [445, 24, 'ropeCoil']);
  harvest.push([310, 24, 'brokenStakes'], [327, 31, 'brokenStakes'], [338, 31, 'scorch'], [352, 31, 'brokenStakes'], [363, 24, 'scorch']);
  sign(367, 24, "THE HALF-BUILT GATEHOUSE. THE KING'S SIEGE ENGINES ARE READIED HERE.");
  deco(370, 24, 'siege', 0); deco(376, 24, 'cart', 1); deco(380, 24, 'batteringRam', 0); crop(373, 24, 'apples'); crop(378, 24, 'basket');
  plank(368, 374, 22); coins([369, 21], [373, 21]);
  foe('pike', 372, 24, 'yard2', { face: -1 }); foe('shield', 377, 24, 'yard2', { face: -1 }); foe('brute', 381, 24, 'yard2', { face: -1 }); foe('archer', 371, 21, 'yard2', { face: -1, perch: true }); foe('hornsman', 374, 24, 'yard2', { face: -1 });   /* (claude/palisadefoe) THE HORNSMAN, REMIXED: on the yard's floor under the archer's board, behind the pike and the shield */
  coins([368, 23], [374, 23], [382, 23]);
  /* THE DITCH (REQUIRED): eight wide; the gatehouse scaffold stands on its lip on a prop - it falls across. A fall is a climb (a board up its west wall) */
  prop('gateBridge', { x: 388, top: 14, cleat: [385, 24], load: 'bridge', span: [390, 397, 25] });
  sign(383, 24, 'THE DITCH. THE GATEHOUSE SCAFFOLD STANDS ON A PROP.');
  ground(390, 397, 31); plank(390, 392, 28);
  ground(398, 502, 25);
  /* THE GATEHOUSE: half-built over the road (the passage under it four rows high); its stakes racked on its far side roll back through the passage at its guards */
  block(406, 416, 6, 20);
  foe('shield', 409, 24, 'passage', { face: -1 }); foe('pike', 413, 24, 'passage', { face: -1 }); foe('archer', 411, 5, 'passage', { face: -1, perch: true });
  prop('gateStakes', { x: 420, top: 15, hang: 19, cleat: [402, 24], load: 'stakes', roll: -1, rollMax: 15 });
  sign(400, 24, "THE GATE'S STAKES ROLL BACK THROUGH THE PASSAGE: KNOCK OUT THEIR PROP.");
  deco(404, 24, 'gobPennant', 0); deco(418, 24, 'gobPennant', 1);
  /* the crew over the gate's far side, a setter on the road, the supply carts on to Kingswood */
  prop('gateCrew', { x: 422, top: 18, cleat: [418, 24], load: 'crew', walk: [419, 426, 19] });
  foe('rockgoblin', 421, 18, 'gateCrew', { face: -1, perch: true }); foe('archer', 424, 18, 'gateCrew', { face: -1, perch: true });
  setter(429, 24, 'gateRoad'); foe('brute', 433, 24, 'gateRoad', { face: -1 }); foe('hound', 439, 21, 'gateRoad', { face: -1, perch: true });
  plank(428, 434, 21); plank(437, 443, 22); coins([430, 20], [440, 21]);
  deco(434, 24, 'cart', 0); deco(439, 24, 'barrels', 0); crop(437, 24, 'sheaf'); crop(441, 24, 'nuts');
  sign(432, 24, "THE SUPPLY CARTS ROLL ON TO KINGSWOOD'S ROYAL ROAD.");
  coins([403, 23], [411, 23], [426, 23], [436, 23]);
  ent('check', 446, 24);                                                           /* SHRINE FOUR: the old forest gate's door */
  sign(449, 24, 'THE BATTERING BEAST: DROP A SCAFFOLD ON IT OR IN ITS PATH. IT STICKS IN THE WRECK.');

  // ================= 5. THE OLD FOREST GATE (454-498): THE BATTERING BEAST =================
  /* A clearing at the old forest gate (the gate you came through stands at its west wall: the beast is brought up to batter it). Two scaffolds on the clearing's floor,
     their decks three rows up (a jump onto them out of a charge), each on a PROP at its inner foot: knock it out and the scaffold comes down in the beast's path (src/battering-beast.js) */
  const [A0, A1] = PALISADE.arena, FL = PALISADE.floor;
  plank(A0 + 4, A0 + 8, FL - 3); plank(A1 - 8, A1 - 4, FL - 3);
  ent('torch', A0 + 1, FL - 1); ent('torch', A1 - 1, FL - 1);
  deco(A0 + 14, FL - 1, 'plantedSpears', 0); deco(A1 - 14, FL - 1, 'stakeFence', 1);
  ent('batteringbeast', A1 - 10, FL - 1);
  block(W - 1, W - 1, 0, H - 1);                                                   /* the world's east edge */

  const arena = { x0: A0 * TS, x1: (A1 + 1) * TS, floor: FL * TS, trigger: (A0 + 6) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'batteringbeast', music: 'batteringbeast', tint: '#c87a3a', tintA: 0.08,
    /* THE TWO SCAFFOLDS (src/battering-beast.js geom): deck columns, deck row, the prop's column (its inner foot) and the side the wreck falls to */
    scaffolds: [{ x0: A0 + 4, x1: A0 + 8, row: FL - 3, prop: A0 + 10, dir: 1 }, { x0: A1 - 8, x1: A1 - 4, row: FL - 3, prop: A1 - 10, dir: -1 }], gate: A0 - 1 };
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 37 }, pools: [], falls: [],
    arena, pwood: true, hoists, crumbles, kwoodCrumbles: true, harvest,
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 240,                  /* four shrines, one closing each area's exam (A10c): src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: 460, hi: W - 1, spots: 0, why: 'THE OLD FOREST GATE: columns 450-502 are the beast\'s clearing - no squad stands in a boss arena' }],
    unlocks: [
      { kind: 'hoists', opens: 'what the prop holds comes down: a scaffold folds into a ramp, a watchtower or the gatehouse scaffold falls across as a bridge, a crew\'s walkway drops its crew, a stack of stakes rolls down the road', hud: 'THE PROP GOES: IT COMES DOWN' },
    ],
    duskStart: -1, duskLen: 1, music: 'palisadewood', night: false, glowNight: true,
    interiors: [],
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', fg: 'pwood', haze: 'rgba(220,150,80,0.07)', grass: '#9a7a2a', grassL: '#d0a83a', grassD: '#5e4a1a', dirt: '#4e3420', dirtL: '#63432a', dirtD: '#2e1c10', canopy: ['#8a3a18', '#b8582a', '#d8862e', '#e8b04a'] },
    weather: [{ x0: 0, x1: 99999, kind: 'leaves' }],
    reskin: { rockgoblin: 'lanternhand', brute: 'maulcrew' },   /* (claude/palisadeart) the work crews' own sheets (the setter's is given at spawn: pw.pwSetter): art, names and cards only, so the level's hash is the greybox's */
    ambient: [{ x0: 0, x1: 99999, kind: 'palisade' }],   /* (claude/palisadeart) its own bed: saws, mallets, rope and timber, dry leaves (src/audio.js palisade()) */
    /* THE SEAM from the Rootway (its amber canopy), then russet and gold: the wood is an autumn wood, warming toward the gate */
    tints: [[-24, 104, [220, 150, 70], 0.05], [104, 204, [225, 140, 60], 0.06], [204, 306, [215, 125, 60], 0.06], [306, 450, [210, 110, 55], 0.07], [450, W + 24, [200, 95, 50], 0.08]],
    reachExact: false,
    breach: [BREACH.x0, BREACH.x1],   /* (claude/palisade2) THE BREACH's columns: ash, not leaves, on its floors (src/redraw/palisade_world.js leafLitter) */
  };
}
