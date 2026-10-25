// src/underleaf3.js - UNDERLEAF 3: THE GRANDMOTHER'S VILLAGE UNDER THE LEAVES (claude/underleaf3, the OPUS GREYBOX, 2026-10-24; brief
// scratch/brief-underleaf3-1015.md, Daniel's 10-15 interview, all recs; the recipe scratch/review-rootway-recipe-1014.md).
// Underleaf 2's SOUND / HUSH rule is RETIRED from this level (Daniel: "the sound situation just doesn't really work"): the old builder
// (src/level.js underleaf()) and the hush code (main.js MAT_VOL/noiseAt/updateHush, src/hush-hands.js) stay in the tree, unused by any level now,
// for the art lane's reference and a later cleanup lane - deleting them here would only make this branch collide with every other lane on main.js.
// This file is the level the game runs, laid by hand (nothing sprinkled); src/potion-hands.js is its rule, its machines and THE GRANDMOTHER 3.
//
// THE RULE (L.rule): HER JARS CHANGE WHAT THEY BREAK ON - GREEN GROWS A VINE, BLUE LIFTS IN A BUBBLE, RED BURNS.
//   The village is the old witch-matriarch's craft. Her jars stand on racks and shelves along the road and REFILL; INTERACT takes one, ATTACK throws it
//   along the told arc (the carry-throw pot: src/throwables.js THROW_KIND.pot / src/carry-throw.js KINDS.pot - UP lobs, DOWN tosses it at your feet).
//     GREEN  where it breaks on a SEED BED a vine grows: a LADDER up the wall over the bed, or a BRIDGE across the ditch from its lip (it stays grown);
//            anywhere else it sprouts a snare of vines that roots the foes in it a moment
//     BLUE   where it breaks a BUBBLE wobbles: step in (or hit a foe with it) and it LIFTS - you up and over, a foe off its feet and helpless
//     RED    where it breaks it BURNS a while: thorn HEDGES and webs burn away, the THORN-BEAST's coat burns off, foes in it catch
//   State drawn (A3): the jar's colour in your hand and on its shelf, the told arc, the bed's sprout / the hedge's thorns / the well's motes, and the
//   patch each leaves (a vine, a bubble, a fire, a snare).
//
// FIVE NAMED AREAS, one idea each, each closed by its exam and a shrine (A10c), then her cottage. Columns; rows (smaller is higher), ground row 30.
//     0-96   THE HERB GARDEN     TEACH green   the first jar by the first bed (a ladder up the garden wall, nothing to fight); the ditch's bed (a BRIDGE,
//                                              gatherers waiting); a bed under the high leaf (a silver); exam = THE HERB WARDEN at the second wall; shrine 94
//    96-189  THE DRYING LOFTS    TEACH blue + A14 PLATFORMING   the float well under the drying loft (REQUIRED); a foe floated off the loft; THE HANGING RACKS:
//                                              boards over the drying pit, a bubble off a board to the high rack (REQUIRED), down the racks; exam = the archer
//                                              captain on the far loft; shrine 186
//   189-279  THE THORN HEDGES    TEACH red     the first hedge (REQUIRED); webs over a pocket; THE THORN-BEAST (its coat turns a blade: burn it); the hollow's
//                                              hedge with a jar-thrower behind it (REQUIRED); exam = a thorn-beast captain before the third hedge; shrine 276
//   279-372  THE CAULDRON YARD   REMIX         RED then GREEN (the thorns hide a seed bed: REQUIRED), BLUE then GREEN (a bubble up to her leaf, a bridge off it to the
//                                              hearth: REQUIRED), BLUE a foe off the hearth; the jar stair down; exam = THE HUSH LANCE (the road warden); shrine 370
//   372-415  THE VINE GULLY      A14 PLATFORMING (claude/underleaf4, Daniel 10-25: "platforming sections where you have to USE POTIONS to get over them"):
//                                              a stake gully crossed on three vine bridges grown off stumps and a vine ladder up the far cliff - every bridge REQUIRED
//                                              (eight-wide gaps, no jump makes them), a jar on each stump (refills), the jar-thrower and the leaf archer on the cliff
//                                              lobbing at you while you throw = its first exam (no shrine: one named area, THE POTION CROSSING, A10c). A fall is the stakes: hurt, back on your stump
//   415-458  THE BUBBLE SHAFTS   A14 PLATFORMING + REMIX: three floats chained over a thorn chasm (a well on each rack, a blue jar on each), then GREEN THEN BLUE:
//                                              grow a vine ledge high over the chasm off the third rack, and float up to it; the far bank's archer captain = its exam;
//                                              shrine 456. (everything from here on is the old 372-477, shifted +86: XO in the builder)
//   372-427  HER GREAT LEAF      EXAM          all three in a row under the biggest leaf, her cottage in view: burn, grow, float - the ONE stretch where all three are
//                                              required back to back; shrine 424 at her door
//   427-477  HER COTTAGE         THE BOSS      THE GRANDMOTHER 3 (src/potion-hands.js): her brood wards her, her blue-jar opening, her cauldron
export const UL3 = { W: 478 + 86, H: 40, G: 30, arena: [433 + 86, 474 + 86] };   /* (claude/underleaf4: +86 columns at 372 for THE VINE GULLY and THE BUBBLE SHAFTS) */
export const UL4_D = 86;
export const SECTIONS = [['THE HERB GARDEN', 0, 96], ['THE DRYING LOFTS', 96, 189], ['THE THORN HEDGES', 189, 279], ['THE CAULDRON YARD', 279, 372], ['THE POTION CROSSING', 372, 458], ['HER GREAT LEAF', 372 + 86, 427 + 86], ["THE POTION MASTER'S COTTAGE", 427 + 86, 478 + 86]];
/* each colour's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/underleaf.mjs and the brief */
export const ARCS = {
  green: { teach: [9, 15], test: [46, 58], remix: [282, 340], gully: [372, 415], exam: [384 + 86, 393 + 86] },
  blue: { teach: [99, 106], test: [108, 118], remix: [314, 324], shafts: [415, 458], exam: [402 + 86, 410 + 86] },
  red: { teach: [192, 200], test: [217, 234], remix: [284, 292], exam: [375 + 86, 384 + 86] },
};
export const UL3_RULE = 'HER JARS CHANGE WHAT THEY BREAK ON: GREEN GROWS A VINE, BLUE LIFTS IN A BUBBLE, RED BURNS.';

export function buildUnderleaf3({ painter, T, TS, knightRow }) {
  const { W, H, G } = UL3;
  const L = painter(W, H); let XO = 0;   /* (claude/underleaf4) the columns the old HER GREAT LEAF and HER COTTAGE moved right, to make room for the two platforming areas */
  const set = (x, y, v) => L.set(x + XO, y, v), block = (x0, x1, y0, y1) => L.block(x0 + XO, x1 + XO, y0, y1);
  const ent = (t, x, y, o) => { const p = { ...(o || {}) }; if (XO) for (const k of ['x0', 'x1']) if (typeof p[k] === 'number') p[k] += XO; return L.ent(t, x + XO, y, p); };
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1);
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const board = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };   /* a drying rack's board / a leaf you can stand on */
  const net = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); };          /* a twine ladder (the way back up out of a pit) */
  const spikes = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); };    /* bramble stakes */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v, o) => ent('deco', x, y, { kind, v: v || 0, ...(o || {}) });
  const reachSpans = [], reachDoors = [], reachVents = [];
  /* HER JARS: a rack with one jar on it (col: green | blue | red), at a standing row; it refills (src/potion-hands.js) */
  const jar = (x, y, col) => ent('jarshelf', x, y, { col });
  /* ONE OF HER CAULDRONS: it brews one colour and fills a jar again in a breath (a jar is taken off its rim like a shelf's) */
  const brew = (x, y, col) => ent('brewpot', x, y, { col });
  /* A SEED BED. ladder: a vine from the bed's row up to `top` (one row over the wall it climbs); bridge: a vine across [x0, x1] at `row` from the lip */
  const ladderBed = (x, y, top) => { ent('vinebed', x, y, { grow: 'ladder', top }); for (let r = top; r <= y; r++) reachSpans.push([x + XO, x + XO, r]); };
  const bridgeBed = (x, y, x0, x1, row) => { ent('vinebed', x, y, { grow: 'bridge', x0, x1, row }); reachSpans.push([x0 + XO, x1 + XO, row]); };
  /* A THORN HEDGE: barred cells (T.PORT) a red fire burns away */
  const hedge = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.PORT); ent('thornhedge', x0, y1, { x0, x1, y0, y1 }); reachDoors.push({ x0: x0 + XO, x1: x1 + XO, y0, y1 }); };
  /* A FLOAT WELL: a mossy spring where a blue bubble rides h rows (the reach fill rides it like a vent) */
  const well = (x, y, h) => { ent('floatwell', x, y, { h }); reachVents.push({ t: 'vent', x: x + XO, y, h: h * TS }); };

  block(0, 0, 0, H - 1);                                                                   /* the world's west edge */

  // ================= 1. THE HERB GARDEN (0-96): TEACH green, where a miss costs nothing =================
  ground(1, 14, G);
  sign(4, 29, "UNDERLEAF: THE POTION MASTER'S VILLAGE. HER JARS CHANGE WHAT THEY BREAK ON.");
  jar(9, 29, 'green');
  sign(7, 29, 'HER GREEN JAR: INTERACT TAKES IT, ATTACK THROWS IT. ON A SEED BED, A VINE GROWS.');
  ladderBed(13, 29, 23);                                                                   /* up the garden wall: nothing to fight here */
  deco(3, 29, 'barrels', 1); deco(11, 29, 'hideRack', 0);
  coins([5, 28], [10, 28]);
  board(2, 5, 27); board(8, 11, 27);
  ground(14, 44, 24);                                                                      /* the upper garden: six rows over the lane */
  ground(26, 30, 22);                                                                      /* a raised herb bed */
  foe('sprig', 22, 23, { squad: 'garden' }); foe('sprig', 34, 23, { squad: 'garden' }); foe('thief', 40, 23, { face: -1 });
  board(16, 25, 20); board(31, 41, 20);                                                    /* drying racks over the beds (a second height) */
  coins([19, 19], [21, 19], [28, 21], [37, 19], [39, 19], [42, 23]);
  deco(24, 23, 'hideRack', 1); deco(32, 21, 'barrels', 2);
  ground(45, 49, G);                                                                       /* down off the upper garden into the ditch lane */
  jar(46, 29, 'green'); board(44, 47, 27);
  sign(47, 29, "A SEED BED ON THE DITCH'S LIP: A GREEN JAR ON IT GROWS A BRIDGE ACROSS.");
  bridgeBed(49, 29, 50, 57, G);
  ground(50, 57, 34); spikes(50, 57, 33);                                                  /* THE THORN DITCH: eight wide, stakes in its bed */
  ground(58, 79, G);
  foe('sprig', 60, 29, { squad: 'ditch' }); foe('sprig', 63, 29, { squad: 'ditch' });
  ground(64, 68, 27); foe('rockgoblin', 66, 26, { face: -1, herb: 'jarthrower' });         /* the first jar-thrower, on a raised bed */
  board(59, 62, 27); coins([60, 26], [66, 25]);
  /* the high leaf and its silver: a bed under it, a green jar beside it (optional - a pocket off the road) */
  jar(70, 29, 'green'); ladderBed(72, 29, 19); board(73, 79, 20); board(67, 70, 27);
  ent('silver', 77, 19); coins([74, 19], [75, 19]);
  ground(80, 87, G); board(81, 84, 27);
  /* THE GARDEN'S EXAM: the herb warden at the second wall, his gatherers with him - a bed at the wall's foot, the jar back along the lane */
  jar(78, 29, 'green');
  ground(88, 96, 24); ladderBed(87, 29, 23);
  foe('shield', 85, 29, { elite: true, squad: 'warden' }); foe('sprig', 82, 29, { squad: 'warden' });
  sign(80, 29, 'THE HERB WARDEN KEEPS THE WALL. THE BED IS AT ITS FOOT.');
  ent('check', 94, 23);
  coins([84, 25], [90, 23], [92, 23]);

  // ================= 2. THE DRYING LOFTS (96-189): TEACH blue; THE HANGING RACKS (A14) =================
  ground(97, 104, G); board(96, 99, 27);
  jar(99, 29, 'blue');
  sign(98, 29, 'HER BLUE JAR: HOLD DOWN AND BREAK IT AT YOUR FEET, STEP INTO THE BUBBLE: IT LIFTS YOU.');
  well(103, 29, 8);
  ground(105, 118, 22);                                                                    /* THE DRYING LOFT: eight rows up, no stair */
  deco(100, 29, 'hideRack', 1);
  jar(108, 21, 'blue');
  sign(109, 21, 'A BLUE JAR ON A FOE LIFTS HIM OFF HIS FEET: UP THERE HE CAN DO NOTHING.');
  foe('shield', 116, 21, { squad: 'loft' }); foe('sprig', 113, 21, { squad: 'loft' });
  board(105, 108, 19); board(114, 117, 19); board(110, 113, 19); coins([111, 18], [112, 18]);                                         /* a rack over the loft */
  coins([106, 20], [111, 18], [114, 20]);
  /* THE HANGING RACKS: boards over the drying pit (stakes in its floor; a twine ladder at each end back up), a bubble off a board to the high rack */
  ent('silver', 133, 33);                                                                  /* the second silver: dropped in the drying pit, between the stakes (the twine ladder at 119 is the way back up) */
  ground(119, 149, 34); spikes(125, 128, 33); spikes(139, 146, 33); net(119, 21, 33);
  board(121, 123, 21); board(126, 128, 19); board(131, 133, 20); board(136, 139, 19); board(142, 145, 18);
  foe('archer', 138, 18, { face: -1 });
  jar(143, 17, 'blue'); well(144, 17, 7);
  sign(141, 17, 'THE HIGH RACK: A BUBBLE OFF THE BOARD. NO JUMP REACHES IT.');
  ground(150, 152, 12);                                                                    /* the drying post: the high rack hangs off it */
  board(145, 149, 12); board(153, 156, 12);
  foe('rockgoblin', 155, 11, { face: -1, herb: 'jarthrower' });
  ground(153, 171, 30); spikes(158, 163, 29); net(168, 17, 29);
  board(159, 161, 14); board(164, 166, 16); board(169, 171, 18);
  coins([122, 20], [127, 18], [132, 19], [137, 17], [147, 11], [154, 11], [160, 13], [165, 15]);
  /* THE LOFTS' EXAM: the archer captain on the far loft, a jar-thrower and a gatherer with him */
  ground(172, 184, 22);
  foe('archer', 180, 21, { elite: true, squad: 'farloft' }); foe('sprig', 176, 21, { squad: 'farloft' }); foe('rockgoblin', 183, 21, { squad: 'farloft', herb: 'jarthrower' });
  ground(185, 188, 26); ent('check', 186, 25); board(173, 177, 19); board(179, 183, 19);
  coins([174, 21], [178, 21], [187, 25]);

  // ================= 3. THE THORN HEDGES (189-279): TEACH red =================
  ground(189, 205, G);
  jar(192, 29, 'red');
  sign(193, 29, "HER RED JAR BURNS: THORNS, WEBS, AND THE THORN-BEAST'S COAT.");
  hedge(198, 199, 23, 29);
  board(189, 191, 27); board(200, 204, 27);
  foe('sprig', 202, 29, { squad: 'hedge1' }); foe('thief', 204, 29, { squad: 'hedge1' });
  ground(205, 205, 28); ground(206, 214, 26);                                              /* a bank, and a pocket in it behind a web */
  air(209, 213, 27, 28); for (let y = 27; y <= 28; y++) set(214, y, T.WEB);
  coins([210, 28], [211, 28], [212, 28], [207, 25], [213, 25]);
  board(201, 203, 26);
  ground(215, 216, 30); ground(217, 240, 33);                                              /* THE HOLLOW: down among the roots */
  jar(218, 32, 'red');
  sign(219, 32, 'THE THORN-BEAST: ITS COAT TURNS A BLADE. BURN IT, THEN CUT.');
  foe('brute', 224, 32, { thornCoat: true });
  jar(228, 32, 'red');
  hedge(232, 233, 26, 32);
  board(220, 222, 30); coins([221, 29], [226, 31]);
  ground(234, 237, 33); ground(238, 240, 31);
  foe('rockgoblin', 239, 30, { face: -1, herb: 'jarthrower' });
  ground(241, 271, G);
  board(244, 247, 27); board(251, 254, 27); board(258, 261, 27);
  foe('sprig', 249, 29); foe('thief', 253, 29);
  /* THE HEDGES' EXAM: a thorn-beast captain and his gatherers before the third hedge - burn him, burn it */
  brew(256, 29, 'red');
  foe('brute', 264, 29, { elite: true, squad: 'thornexam', thornCoat: true }); foe('sprig', 261, 29, { squad: 'thornexam' }); foe('sprig', 267, 29, { squad: 'thornexam' });
  hedge(270, 271, 23, 29);
  ground(272, 280, G); ent('check', 276, 29); board(273, 276, 27); board(279, 283, 27);
  coins([245, 26], [252, 26], [259, 26], [274, 28], [278, 28]);

  // ================= 4. THE CAULDRON YARD (279-372): REMIX - colours combined =================
  ground(281, 292, G);
  jar(284, 29, 'red'); jar(287, 29, 'green');
  sign(282, 29, 'THE THORNS HIDE A SEED BED. BURN THEM, THEN GROW IT.');
  hedge(290, 291, 24, 29); ladderBed(292, 29, 22);
  ground(293, 318, 23);                                                                    /* THE YARD: seven rows over the lane */
  brew(298, 22, 'red'); brew(309, 22, 'blue');
  foe('sprig', 300, 22, { squad: 'yard' }); foe('shield', 305, 22, { squad: 'yard' }); foe('rockgoblin', 312, 22, { squad: 'yard', herb: 'jarthrower' });
  board(301, 304, 20); ent('silver', 303, 19); board(294, 297, 20); board(307, 311, 20);                                             /* a rack over the yard: the third silver */
  coins([296, 22], [302, 18], [308, 22]);
  jar(314, 22, 'blue'); well(316, 22, 7);
  sign(313, 22, 'A BUBBLE UP TO HER LEAF. A SEED BED ON ITS EDGE.');
  board(317, 322, 16); jar(319, 15, 'green'); bridgeBed(322, 15, 323, 331, 16);
  ground(319, 331, 31); spikes(320, 331, 30); net(319, 22, 30);                            /* under the leaf: the stake pit (a twine ladder back up) */
  ground(332, 345, 16);                                                                    /* THE GREAT HEARTH: her old fire's stones */
  brew(334, 15, 'blue');
  sign(335, 15, 'FLOAT HIM OFF THE HEARTH.');
  foe('shield', 341, 15, { face: -1 }); foe('sprig', 338, 15);
  coins([324, 15], [328, 15], [337, 14], [343, 14]);
  /* THE JAR STAIR: down off the hearth, the jar-throwers on its landings */
  board(362, 365, 27); board(368, 372, 27);
  ground(346, 350, 19); ground(351, 355, 22); ground(356, 360, 25); ground(361, 372, G);
  foe('rockgoblin', 349, 18, { face: -1, herb: 'jarthrower' }); foe('sprig', 358, 24);
  board(352, 354, 19); coins([348, 18], [353, 21], [358, 24]);
  /* THE YARD'S EXAM: THE HUSH LANCE, the road warden, on the yard's last ground; his gatherer with him */
  { const kn = knightRow('underleaf'); if (kn) ent(kn[0], kn[1], kn[2], { ...kn[3], elite: true, squad: 'lance' }); }
  foe('sprig', 363, 29, { squad: 'lance' });
  ent('check', 370, 29);
  coins([362, 28], [368, 28]);

  // ================= 4b. THE VINE GULLY (372-415): A14 - GREEN PLATFORMING (claude/underleaf4) =================
  /* a stake gully three stumps wide: no jump crosses an eight-wide gap (reachcore: six with a run-up), so each stump is reached on a vine bridge grown
     off the one before; a jar stands on every stump (it refills), and the far cliff is climbed on a vine ladder. The stakes send a fall back to the
     last stump stood on (hazardBack): no soft-lock. The exam is the cliff: a jar-thrower and a leaf archer up there lob at you while you throw. */
  ground(373, 376, G);
  sign(373, 29, 'THE VINE GULLY: NO JUMP CROSSES IT. GROW YOUR BRIDGES, STUMP BY STUMP.');
  jar(374, 29, 'green'); bridgeBed(376, 29, 377, 384, G);                                  /* the bank's bed: the first bridge */
  ground(377, 406, 36); spikes(377, 384, 35); spikes(388, 395, 35); spikes(399, 406, 35);   /* the gully floor: stakes from wall to wall */
  ground(385, 387, 29); jar(385, 28, 'green'); bridgeBed(387, 28, 388, 395, 29);           /* the first stump */
  ground(396, 398, 28); jar(396, 27, 'green'); bridgeBed(398, 27, 399, 406, 28);           /* the second stump, a row higher */
  ground(407, 409, 28); jar(407, 27, 'green'); ladderBed(409, 27, 20);                     /* the third stump, at the cliff's foot */
  ground(410, 420, 21);                                                                    /* THE CLIFF: seven rows over the stump */
  foe('rockgoblin', 414, 20, { face: -1, herb: 'jarthrower', squad: 'gully' }); foe('archer', 418, 20, { face: -1, squad: 'gully' });
  board(379, 382, 26); board(390, 393, 25); board(401, 404, 24);                           /* drying racks over the gully: the coins, and a ledge to land on */
  coins([380, 25], [381, 25], [391, 24], [392, 24], [402, 23], [403, 23], [412, 20]);
  board(411, 417, 17); coins([413, 16], [415, 16]);                                      /* a rack over the cliff top (a second height) */

  // ================= 4c. THE BUBBLE SHAFTS (415-458): A14 - BLUE PLATFORMING + REMIX (claude/underleaf4) =================
  /* three floats chained over a thorn chasm: a well on the cliff's lip lifts you to the first rack, a well on each rack to the next (a blue jar on each,
     it refills); then the REMIX - off the third rack a GREEN jar grows a vine ledge high over the chasm, and only a BLUE float reaches it. From the vine
     ledge the far bank; its archer captain is the exam. A fall into the thorns sends you back to the last rack you stood on. */
  sign(416, 20, 'THE BUBBLE SHAFTS: FLOAT FROM RACK TO RACK. A BUBBLE RIDES A WELL HIGHER.');
  jar(417, 20, 'blue'); well(420, 20, 7);                                                  /* the lip's well: up to the first rack */
  ground(421, 446, 36); spikes(421, 446, 35);                                              /* THE CHASM: thorns from wall to wall */
  board(422, 425, 14); jar(422, 13, 'blue'); well(425, 13, 6);                             /* the first rack: its well rides six rows */
  board(428, 431, 8);                                                                      /* the second rack, high: no well - the drop to the third is the way on */
  board(435, 438, 13); jar(435, 12, 'green'); jar(436, 12, 'blue'); well(438, 12, 7);      /* the third rack: a GREEN and a BLUE */
  bridgeBed(438, 12, 439, 445, 6);                                                         /* REMIX: the vine LEDGE grows high over the chasm - only a float reaches it */
  sign(437, 12, 'GROW THE VINE LEDGE, THEN FLOAT UP TO IT.');
  ground(446, 457, 7); board(447, 455, 3);                                                                     /* THE FAR BANK, high */
  foe('archer', 452, 6, { face: -1, elite: true, squad: 'shafts' }); foe('sprig', 449, 6, { squad: 'shafts' });
  ground(458, 458, 24);                                                                    /* the bank's foot: the way down to her great leaf */
  coins([423, 13], [424, 13], [429, 7], [430, 7], [440, 5], [442, 5], [444, 5], [448, 6]);
  ent('check', 456, 6);

  XO = 86;   /* (claude/underleaf4) the rest is the old level, shifted right */
  // ================= 5. HER GREAT LEAF (372-427): EXAM - burn, grow, float, back to back =================
  ground(373, 392, G);
  sign(374, 29, 'HER GREAT LEAF. HER COTTAGE IS UNDER IT: BURN, GROW, AND FLOAT YOUR WAY TO HER DOOR.');
  jar(377, 29, 'red'); hedge(382, 383, 23, 29); board(373, 376, 27); board(386, 389, 27); 
  jar(386, 29, 'green'); ladderBed(392, 29, 23);
  foe('sprig', 388, 29, { squad: 'leafA' }); foe('thief', 390, 29, { squad: 'leafA' });
  ground(393, 410, 24);
  foe('rockgoblin', 400, 23, { squad: 'leafB', herb: 'jarthrower' }); foe('sprig', 405, 23, { squad: 'leafB' });
  brew(403, 23, 'blue'); well(408, 23, 7);
  board(411, 418, 18);                                                                     /* her leaf's stalk end */
  ground(411, 418, 31); spikes(412, 418, 30); net(411, 24, 30);
  ground(419, 426, 18);                                                                    /* her stoop */
  foe('rockgoblin', 417, 17, { face: -1, herb: 'jarthrower' });
  ent('check', 424, 17);
  coins([395, 23], [398, 23], [413, 17], [416, 17], [421, 17]);
  sign(421, 17, 'THE POTION MASTER. RED BURNS HER HEDGE, GREEN PULLS HER DOWN, BLUE LIFTS HER OUT.');

  // ================= 6. HER COTTAGE (427-477): THE GRANDMOTHER 3 =================
  ground(427, 428, 22); ground(429, 431, 26); ground(432, 477, G);
  block(477, 477, 0, H - 1);
  jar(435, 29, 'blue'); jar(453, 29, 'blue'); jar(471, 29, 'blue');                                              /* her shelves either side of the room: the opening's jars */
  ent('grandmother', 460, 29);
  ent('gate', 476, 29);
  coins([440, 28], [446, 28], [466, 28]);

  const arena = { x0: (433 + XO) * TS, x1: (475 + XO) * TS, floor: G * TS, trigger: (438 + XO) * TS, wallL: 432 + XO, wallR: 476 + XO, boss: 'grandmother', camBelow: 4, music: 'grandmother', tint: '#2a3a24', tintA: 0.12, fx: 'motes' };
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 29 }, pools: [], falls: [], moversExtra: [], interiors: [],
    arena, jars: true, ul3: true, reachSpans, reachDoors, reachVents,
    reskin: { sprig: 'herbgatherer', thief: 'herbthief', shield: 'herbwarden', rockgoblin: 'jarthrower', archer: 'leafarcher', brute: 'thornbeast' },   /* (claude/underleafart) THE VILLAGE'S OWN PEOPLE: art + names only, src/main.js gives the skin at spawn (so the level's hash is the greybox's) */
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 240,                  /* five shrines, one closing each area's exam and one at her door (A10c): src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: 427 + XO, hi: 477 + XO, spots: 0, why: "HER COTTAGE: columns 513-563 are her arena - no squad stands in a boss arena" }],
    unlocks: [
      { kind: 'jarshelf', opens: 'its jar: green grows a vine on a seed bed (a ladder or a bridge), blue lifts in a bubble, red burns a thorn hedge away', hud: 'THE JAR BREAKS: WHAT IT BREAKS ON CHANGES' },
      { kind: 'vinebed', opens: 'a green jar grows its vine: a ladder up the wall or a bridge across the ditch', hud: 'THE VINE GROWS' },
      { kind: 'thornhedge', opens: 'a red jar burns it away: the road on', hud: 'THE THORNS BURN AWAY' },
      { kind: 'floatwell', opens: 'a blue jar broken in it lifts you up the wall', hud: 'THE BUBBLE LIFTS YOU' },
    ],
    duskStart: -1, duskLen: 1, music: 'underleaf', night: false, glowNight: true,
    /* EARTHY, NOT GAUDY (the brief): moss greens, root browns and candle amber under the leaves - the one strong accent is her jars' glow (drawn by src/potion-hands.js) */
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(70,90,50,0.18)', grass: '#4a6a32', grassL: '#6a8a42', grassD: '#2e4420', dirt: '#3e2e1e', dirtL: '#54402a', dirtD: '#241a10', canopy: ['#24361c', '#2e4422', '#3a522a', '#4a6234'] },
    weather: [{ x0: 0, x1: 99999, kind: 'leaves' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],   /* (BATCH120 integ: ambient-landmarks - only the woods play forest birdsong; Underleaf keeps the night wind it had on master. QUESTION FOR DANIEL if it wants its own bed) */
    tints: [[-24, 96, [140, 170, 90], 0.10], [96, 189, [170, 150, 90], 0.10], [189, 279, [150, 110, 70], 0.12], [279, 372, [180, 120, 60], 0.12], [372, 415, [140, 170, 90], 0.11], [415, 458, [150, 170, 200], 0.10], [458, W + 24, [200, 140, 70], 0.13]],
    reachExact: false,
  };
}
