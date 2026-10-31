// src/sporewood.js - SPOREWOOD 2: THE MOTHER'S KNOT (claude/sporewood2, the OPUS GREYBOX of level + boss, 2026-10-22). Brief scratch/brief-sporewood2-1015.md
// (Daniel 10-14 "spores help you, fewer debuff clouds"; the 10-15 interview approved the plan) and the recipe scratch/review-rootway-recipe-1014.md (Sporewood 7/20:
// a quarter of its length never used the rule, 41 debuffers nobody could answer, no named areas, no landmark, and a last filter that deleted its own signature actors).
// This file is the level the game runs, laid by hand (nothing sprinkled); src/sporewood-hands.js is its rule and machines; THE MOTHER CAP 2 (src/mother-cap2.js) its boss.
//
// THE RULE (L.rule): THE CAPS GROW INTO STEPS, AND THE SPORES HELP YOU.
//   A BUD (the growcap mover main.js runs): stop on one and it rises four rows under you; a LEANING one carries you over a gap. Three kinds of its own here:
//     dark   a bud in the Lantern Hollows grows only in light: a struck LANTERN CAP (a glowbud) within reach of it lights it (and wakes it at once)
//     seed   a SEED CAP grows when it is STRUCK, not stood on, and stands a while as a STEP (the Mother's own kind: her hollow is ringed with them)
//   THE SPORES HELP YOU (src/sporewood-hands.js):
//     BOUNCE CAP   a springy cap (T.BOUNCER): land on it and it throws you; hold jump for higher
//     LANTERN CAP  strike it: it lights the dark undergrowth, the dark buds grow, and a lurker in its light is DAZZLED (out of its cap, no lunge)
//     MEND PUFF    walk into it or strike it: its spores close your wounds (a small heal), once a life
//     PUFFBALL     strike it and it bursts into a SPRING SPORE that hangs a few seconds: land on it and it throws you like a bounce cap
//   The debuffers are cut to ten, and every one has an answer the level teaches: a spitcap is struck while it swells, a lurker is lit, a weaver is cut, the
//   drone is met in the open. The spore drops (told, on a count) fall on the buds: they are the bud's rhythm, not noise.
//
// FIVE NAMED AREAS, each TEACH -> TEST -> REMIX -> EXAM, each closed by an exam and a shrine (A10c). Columns; rows: smaller is higher. The route climbs toward
// THE MOTHER'S KNOT (src/redraw/sporewood_knot.js: a cap-cathedral on the skyline from the first screen, its knot glowing, growing as you come) from row 40 to row 7.
//      0-100  THE MYCELIUM GLADE    TEACH   the bud against a root wall (safe), the bounce cap, a mend puff, the spitcap; the bounce pit (REQUIRED: no jump crosses);
//                                           exam = THE CAP TERRACE (two buds up, one under a spore drop, a shield and a spitcap on its lips); shrine 97
//    100-198  THE LANTERN HOLLOWS   TEST    under the cap canopy, dark: lantern caps light the way, the dark buds grow only in their light (REQUIRED), lurkers wait in
//                                           the caps (light them); exam = THE DARK SHAFT (three dark buds up, three lanterns, a weaver and a lurker); shrine 194
//    198-298  THE PUFFBALL BOG      REMIX + A14 (the platforming section)  cap stalks over the bog: a leaning cap over a gap, a bud under a spore drop, the bounce cap
//                                           to the high stalk, puffballs that burst into spring spores (a shortcut and a silver); exam = THE CAP LADDER (lean, bud, the
//                                           bounce well no jump crosses); a fall is the climb again (stairs up every stalk); shrine 294
//    298-358  THE WEB LARDER        REMIX + EXAM  the Mother's larder in her roots: web curtains (one cut), the weaver, a bud stair up the root wall, and THE SPORE MAGE
//                                           (the Order's battle mage, the elite) holding the larder's end; shrine 356
//    358-408  THE MOTHER'S KNOT     her approach: SEED CAPS taught (strike one: it grows a step - REQUIRED), A ROOT KNOT taught (plunge onto it from above: it opens -
//                                           her key, B14; it opens a root door on the last silver), her gill pods, her skulls, a sign at her door
//    408-460  THE MOTHER'S HOLLOW   THE BOSS (src/mother-cap2.js)
//    460-471  the road out          to THE ROOTWAY
export const SPOREWOOD = { W: 472, H: 44, arena: [410, 458], floor: 15, mother: 434, DY: 1 };   /* floor: her hollow's floor row AS BUILT (the rows below are laid one higher: DY) */
export const SECTIONS = [['THE MYCELIUM GLADE', 0, 100], ['THE LANTERN HOLLOWS', 100, 198], ['THE PUFFBALL BOG', 198, 298], ['THE WEB LARDER', 298, 358], ["THE MOTHER'S KNOT", 358, 408], ["THE MOTHER'S HOLLOW", 408, 472]];
/* each verb's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/sporewood2.mjs and the brief */
export const ARCS = {
  bud: { teach: [26, 32], develop: [76, 92], twist: [206, 262], exam: [312, 340] },            /* the root wall; the cap terrace; the bog's lean + spore-drop bud; the larder stair */
  bounce: { teach: [20, 26], develop: [56, 68], twist: [232, 246], exam: [272, 282] },          /* the glade's cap; the bounce pit; the bog's bounce stalk; the cap ladder's well */
  lantern: { teach: [106, 124], develop: [130, 140], exam: [160, 192] },                        /* the first lantern; the dark bud wall; the dark shaft */
  spring: { teach: [204, 214], develop: [236, 250] },                                            /* the puffballs: the shortcut, the high silver */
  mend: { teach: [8, 12] },
  seed: { teach: [360, 372], exam: [410, 458] },                                                 /* the seed caps at her door; her hollow */
  knot: { teach: [376, 386], exam: [410, 458] },                                                 /* the root knot; HER knot */
};
const SAY_SIGNS = {
  start: "SPOREWOOD. THE MOTHER'S KNOT GLOWS OVER THE WOOD: CLIMB TO IT.",
  mend: 'A MEND PUFF. WALK INTO IT OR STRIKE IT: ITS SPORES CLOSE YOUR WOUNDS.',
  bounce: 'A BOUNCE CAP. LAND ON IT AND IT THROWS YOU: HOLD JUMP FOR HIGHER.',
  bud: 'THE CAPS GROW INTO STEPS. JUMP ONTO A BUD AND STAND STILL: IT RISES UNDER YOU.',
};

export function buildSporewood({ painter, T, TS }) {
  const { W, H } = SPOREWOOD;
  /* THE ROWS BELOW ARE LAID ONE ROW HIGH (DY): every floor of the climb sits on a row a multiple of four, and a root shelf three rows over a floor then stood in the
     floor's own 4-row height band (tools/level-quality.mjs: the second-height share). Built one row lower, the shelves read as a second height. Rows in the comments
     are the laid rows; a block from row 0 (a roof, the west edge) still starts at row 0. */
  const DY = SPOREWOOD.DY, L = painter(W, H);
  const set = (x, y, v) => L.set(x, y + DY, v);
  const block = (x0, x1, y0, y1) => L.block(x0, x1, y0 === 0 ? 0 : y0 + DY, Math.min(H - 1, y1 + DY));
  const ent = (t, x, y, o = {}) => L.ent(t, x, y + DY, o.door ? { ...o, door: [o.door[0], o.door[1], o.door[2] + DY, o.door[3] + DY] } : o);
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1);
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const spring = (x, y) => set(x, y, T.BOUNCER);                                     /* A BOUNCE CAP: the springy cap tile (main.js: plain -400, held -480, plunged -560) */
  const web = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.WEB); };    /* a curtain: one cut clears it (or fire) */
  const sign = (x, y, text, o) => ent('sign', x, y, { text, ...(o || {}) });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ squad }, o || {}));
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v, o) => ent('deco', x, y, { kind, v: v || 0, ...(o || {}) });
  const glow = (x, y) => ent('glow', x, y);
  const lantern = (x, y) => ent('glowbud', x, y, { lantern: true });              /* A LANTERN CAP: main.js's glowbud (strike: it lights for 14 s and wakes the buds near it) */
  const mend = (x, y) => ent('mendpuff', x, y);                                       /* A MEND PUFF (src/sporewood-hands.js) */
  const puff = (x, y) => ent('springpuff', x, y);                                     /* A PUFFBALL that bursts into a SPRING SPORE (src/sporewood-hands.js) */
  const drip = (x, every, y = 0) => ent('rockfall', x, y, { spore: true, every, tell: 0.9 });  /* a told spore drop onto a bud: its rhythm (y: under a canopy, the row it lets go from) */
  const caps = [], pools = [];
  /* A BUD (the growcap mover): `row` is the ground row it sits on; it spans columns x..x+1. o.lean (px sideways as it grows), o.dark (grows only in a lantern's
     light), o.seed (grows when STRUCK, stands as a step; o.rise its height), o.growT, o.hold */
  const bud = (x, row, o = {}) => { const rise = o.rise ?? 56, y0 = (row + DY) * TS - 8; caps.push({ kind: 'growcap', x: x * TS, y: y0, y0, y1: y0 - rise, w: 32, h: 8, rise, state: 'bud', k: 0, ...(o.lean ? { bx: x * TS } : {}), ...o }); };
  /* a STAIR of root shelves up the EAST face of a stalk (x1 its last column), every three rows from `bottom` up to under its `top`: a fall into the bog is the
     climb back to the stalk you fell from (nothing here is bottomless, A10) */
  /* a GAUNTLET'S BOG POOL (claude/sporeplat): the pit floor row F, foul water over it (a fall stings while you climb out - the bog's own pool) */
  const gpool = (a, b, F) => pools.push({ x0: a * TS, x1: (b + 1) * TS, y: (F - 3 + DY) * TS + 6, bottom: (F + 1 + DY) * TS, swim: true, clear: true, harm: true, bog: true, foulCol: '#5a6a2a', foulColL: '#b4cc68', foulColD: '#1c2814', wash: 0.6 });
  const stair = (x1, top, bottom) => { for (let r = bottom - 3; r > top + 1; r -= 3) plank(x1 + 1, x1 + 2, r); };

  block(0, 0, 0, H - 1);                                                            /* the world's west edge */

  // ================= 1. THE MYCELIUM GLADE (0-100): TEACH the bud, the bounce cap, the mend puff and the spitcap, where a miss is cheap =================
  ground(1, 29, 40);
  sign(4, 39, SAY_SIGNS.start);
  glow(10, 39); deco(2, 39, 'sporePod'); deco(13, 39, 'tinyCap', 1);
  plank(2, 13, 37); coins([4, 36], [9, 36]);                                        /* a root shelf over the glade floor (a second height) */
  mend(8, 39); sign(6, 39, SAY_SIGNS.mend);
  /* THE BOUNCE CAP, taught where it costs nothing: a cap in the floor, a shelf six rows over it (a held jump only) with the first silver - well west of the
     root wall, so it is never a way round the bud */
  spring(17, 40); sign(14, 39, SAY_SIGNS.bounce);
  plank(15, 19, 34); ent('silver', 16, 33); coins([18, 33], [19, 33]); deco(15, 33, 'mushroom', 1);
  foe('sporeling', 24, 39, 'gladeA', { face: -1 });
  coins([21, 37], [24, 37]);
  /* THE ROOT WALL: four rows (no jump climbs four), and a bud at its foot. The first REQUIRED bud, nothing else on it */
  ground(30, 58, 36); bud(28, 40); sign(27, 39, SAY_SIGNS.bud);
  glow(33, 35); deco(37, 35, 'rootDecor', 1); coins([32, 34], [35, 34]);
  plank(31, 57, 33); coins([33, 32], [48, 32]);                                    /* a root shelf over the wall top */
  /* the wall top: THE SPITCAP, taught. It swells before it spits: strike it then (a sign at the point of use) */
  foe('spitcap', 43, 35, 'wallTop', { face: -1 });
  sign(39, 35, 'A SPITCAP SWELLS BEFORE IT SPITS. STRIKE IT THEN; STEP OUT OF ITS CLOUD.');
  coins([46, 34], [51, 34]); deco(54, 35, 'sporePod'); drip(45, 3.1);
  /* THE BOUNCE PIT: eight wide (no jump crosses), a floor four rows down with bounce caps on it - one throws you out over the far lip (hold jump: higher).
     REQUIRED. A miss is a bounce back out, either side */
  air(59, 66, 0, 39); ground(59, 66, 40); for (let x = 59; x <= 66; x++) spring(x, 40);   /* (its whole floor is cap: wherever you land, it throws you) */
  sign(56, 35, 'NO JUMP CROSSES. DROP IN: A BOUNCE CAP THROWS YOU OUT.');
  coins([62, 37], [63, 35], [65, 37]);
  ground(67, 78, 36); glow(70, 35); deco(73, 35, 'tinyCap', 2); foe('brute', 71, 35, 'pitFar', { face: -1 }); foe('archer', 76, 35, 'pitFar', { face: -1 });   /* (where the bounce throws you out: a heavy, the pit at your back) */
  /* THE GLADE'S EXAM, THE CAP TERRACE: two buds up two four-row tiers - the first under a spore drop on a count (let it burst, then stop on the bud), a SHIELD on
     the first tier where the cap sets you down, a SPITCAP on the second tier's lip over the bud, a sporeling behind it. Shrine at the top */
  bud(77, 36); ground(79, 104, 32); drip(78, 2.8);
  sign(70, 35, 'SPORES FALL ON THE BUDS. LET ONE BURST, THEN STOP ON THE BUD.');
  foe('shield', 82, 31, 'terrace', { face: -1 });
  bud(85, 32); ground(87, 104, 28);
  plank(88, 89, 25); plank(97, 102, 25);                                            /* root shelves over the top tier (split: none spans the gap) */
  foe('spitcap', 88, 27, 'terrace', { face: -1, perch: true }); foe('brute', 89, 27, 'terrace', { face: -1, perch: true }); drip(87, 2.9);   /* (the terrace's heavy, where the bud sets you down) */
  /* THE TERRACE'S FALL (claude/sporewood2tune, the walker band): the top tier ends in a REAL GAP, six wide, no floor - a fall is the end (back to the last shrine). A pillar of two BOUNCE CAPS stands in it: a hop from the lip onto them, and they throw you over to the far lip
     (hold jump for height). Told: the sign on the lip, a warning post each side, the pit's mouth the same as the bounce pit taught (which had a floor); a spitcap holds the far lip */
  air(91, 96, 28, 42); ground(93, 94, 28); spring(93, 28); spring(94, 28); deco(90, 27, 'warnPost', 0); deco(97, 27, 'warnPost', 1);
  sign(86, 27, 'THE TERRACE ENDS IN A DROP. THE BOUNCE CAPS THROW YOU OVER. MISS AND YOU FALL.');
  foe('spitcap', 98, 27, 'terraceFar', { face: -1 });
  coins([80, 30], [83, 30], [87, 26], [89, 26], [93, 22], [95, 22]); glow(99, 27); deco(102, 27, 'sporePod');
  ent('check', 100, 27);                                                            /* SHRINE ONE: the glade's exam is behind you */

  // ================= 2. THE LANTERN HOLLOWS (100-198): TEST - dark under the cap canopy; the lantern caps light the way and the dark buds grow only in it =================
  block(104, 198, 0, 13);                                                           /* THE CAP CANOPY over the hollows */
  sign(102, 27, 'THE LANTERN HOLLOWS. STRIKE A LANTERN CAP: THE CAPS GROW ONLY IN ITS LIGHT.');
  /* down into the hollow: three steps */
  ground(105, 110, 31); ground(111, 116, 34); ground(117, 137, 38); plank(111, 116, 31);
  lantern(108, 30);                                                                 /* LANTERN ONE, on the first step: the teach */
  glow(114, 33);
  /* the first LURKER, by the second lantern: strike the lantern and its light dazzles him out of his cap (a sign at the point of use) */
  lantern(120, 37); foe('lurker', 125, 37, 'hollowA'); foe('brute', 128, 37, 'hollowA', { face: -1 }); foe('shield', 134, 37, 'hollowB', { face: -1 });   /* (a guard at the dark bud's lantern: light it under his blade) */
  sign(118, 37, "LURKERS HIDE AMONG THE CAPS. A LANTERN'S LIGHT DAZZLES THEM OUT.");
  plank(118, 127, 35);                                                              /* a root shelf over the hollow floor (well short of the dark bud's wall) */
  coins([122, 36], [127, 36], [131, 36]);
  /* THE DARK BUD WALL: four rows, a bud at its foot that grows only in light; its lantern is beside it. REQUIRED (the lantern and the bud) */
  ground(138, 160, 34); bud(136, 38, { dark: true }); lantern(133, 37);
  /* (claude/sporeplat) GAUNTLET ONE, THE LANTERN LEDGES: the wall top is cut into cap stalks over a bog pool (142-156): hop to the first lit ledge, hop to the bounce
     pair, and the bounce throws you up to the high ledge. Few foes: the shaman and a lurker wait at the far lip. A fall stings and is the climb back (a plank up each east face). */
  air(142, 156, 34, 39); ground(144, 145, 34); ground(148, 149, 34); spring(148, 34); spring(149, 34); ground(150, 151, 30); ground(154, 156, 30);
  gpool(142, 156, 40); stair(141, 34, 40); stair(145, 34, 40); stair(151, 30, 40);
  plank(144, 145, 31); plank(150, 151, 27); plank(154, 156, 27);   /* (a shelf over each ledge: a second height, and a way to save a bad hop) */
  lantern(144, 33); lantern(154, 29); deco(141, 33, 'warnPost', 0);
  sign(139, 33, 'THE LANTERN LEDGES. HOP THE LIT STALKS; THE BOUNCE CAPS THROW YOU UP. THE BOG STINGS.');
  sign(130, 37, 'THIS BUD IS DARK. LIGHT THE LANTERN CAP BESIDE IT, THEN STOP ON THE BUD.');
  /* the wall top: a lurker in the caps, the hollows' SHAMAN (he raises the dead: the kill-first target), a mend puff for after */
  foe('lurker', 158, 33, 'wallTop2'); foe('shaman', 160, 33, 'wallTop2', { face: -1 });
  lantern(159, 33); mend(157, 33); plank(139, 141, 31);
  coins([143, 32], [146, 31], [152, 26], [155, 26]);
  /* THE DARK SHAFT (the hollows' EXAM): down off the wall into a room under the canopy, and up its far side on three dark buds, each lit by the lantern beside it;
     a lurker on the first tier, a WEAVER on the second, a spore drop on the middle bud. A miss is a fall a tier (cheap) */
  ground(161, 198, 40);
  /* a nook in the wall's foot off the shaft's floor (a pocket west of the way on): gold, lit by its own lantern */
  air(158, 160, 37, 39); lantern(159, 39); coins([158, 39], [159, 39], [160, 39]);
  lantern(165, 39); bud(168, 40, { dark: true }); ground(170, 198, 36);
  foe('lurker', 174, 35, 'shaft', { perch: true }); foe('archer', 178, 35, 'shaft', { face: -1, perch: true }); foe('sporeling', 163, 39, 'shaft', { face: 1 });
  lantern(176, 35); bud(180, 36, { dark: true }); ground(182, 198, 32); drip(180, 3.0, 14);
  foe('weaver', 184, 31, 'shaft', { face: -1, perch: true }); foe('shield', 183, 31, 'shaft2', { face: -1 });
  lantern(186, 31); bud(188, 32, { dark: true }); ground(190, 198, 28); foe('brute', 192, 27, 'shaftTop', { face: -1 });   /* (the shaft's top: a heavy where the last bud sets you down, the shaft at your back) */
  sign(163, 39, 'THE DARK SHAFT. EVERY BUD HAS ITS LANTERN.');
  coins([166, 38], [178, 34], [189, 26], [192, 26]); glow(196, 27); plank(191, 197, 25);
  ent('check', 194, 27);                                                            /* SHRINE TWO */

  // ================= 3. THE PUFFBALL BOG (198-298): REMIX, and the level's real platforming (A14) =================
  /* Cap stalks stand up out of the bog; the way on is along their tops. The bog floor is no death: a stalk's east face has a stair of root shelves, so a fall
     is the climb back to the stalk you fell from. Rollers trundle the bog floor (plunge one: it pops); puffballs on the stalks burst into SPRING SPORES. */
  ground(198, 300, 40);                                                             /* THE BOG FLOOR */
  for (const [a, b] of [[210, 217]]) pools.push({ x0: a * TS, x1: (b + 1) * TS, y: (37 + DY) * TS + 6, bottom: (41 + DY) * TS, swim: true, clear: true, harm: true, bog: true, foulCol: '#5a6a2a', foulColL: '#b4cc68', foulColD: '#1c2814', wash: 0.6 });   /* (the bog's water: a fall in stings while you climb out) */
  ground(199, 205, 28);                                                             /* the lip out of the hollows (to stalk one's foot: no one-column shaft beside it) */
  sign(200, 27, 'THE PUFFBALL BOG. STRIKE A PUFFBALL: IT BURSTS INTO A SPRING SPORE YOU CAN BOUNCE OFF.');
  puff(202, 27); air(200, 204, 37, 39);                                            /* (a hollow under the lip, in off the bog floor) */
  /* stalk one, a hop up; on its east edge a LEANING bud over the first gap (eight wide: no jump) */
  ground(206, 209, 26); stair(209, 26, 40);
  bud(208, 26, { rise: 16, lean: 112, growT: 1.6 }); sign(204, 27, 'THIS CAP LEANS. STOP ON IT AT THE EDGE AND IT CARRIES YOU ACROSS.');
  coins([207, 24], [212, 22], [215, 22]); foe('archer', 230, 21, 'stalk3', { face: -1 });   /* (a goblin forager's bow over the crossing - the Stockade's, come down into the fungus) */
  /* stalk two: a bud under a spore drop against stalk three's wall (four rows) */
  ground(218, 221, 26); bud(220, 26); drip(221, 2.7); foe('shield', 219, 25, 'stalk2', { face: -1 });
  ground(222, 232, 22); stair(232, 22, 40);
  foe('spitcap', 227, 21, 'stalk3', { face: -1 }); foe('brute', 224, 21, 'stalk3', { face: -1 });   /* (where the bud sets you down) */   /* the spitcap on the lip over the bud */
  coins([224, 20], [229, 20]); plank(224, 229, 19);
  /* THE BOUNCE STALK: down to a stalk capped with a bounce cap, and up off it to the high stalk, four rows over it (no jump climbs four) */
  ground(236, 238, 26); spring(236, 26); spring(237, 26); spring(238, 26);
  /* THE BOUNCE STALK'S FALL (claude/sporewood2tune, the walker band): it was a stalk with a bog floor under it and a stub to catch a miss. Now a REAL GAP (three wide before the caps, two after, no floor, no stub) runs either side of the cap pillar: a miss is a fall - the end, back to the last shrine. Told: the sign on stalk three's
     lip and a warning post each side; the bounce was taught twice before it (the glade's pit, the terrace's pillar), and a lurker holds the high stalk where the throw lands you */
  air(233, 235, 27, 42); air(239, 240, 27, 42); deco(232, 21, 'warnPost', 0); deco(241, 21, 'warnPost', 1);
  sign(229, 21, 'THE BOUNCE STALK THROWS YOU UP TO THE HIGH STALK. NO FLOOR UNDER IT: MISS AND YOU FALL.'); sign(248, 21, 'THE CAP LADDER: NO FLOOR UNDER IT. THE BOG KEEPS WHAT FALLS IN.');
  ground(241, 251, 22);
  foe('drone', 247, 17, 'highStalk', { perch: true }); foe('brute', 243, 21, 'highStalk', { face: -1 }); foe('lurker', 248, 21, 'highStalk'); lantern(244, 21);   /* (its lantern: strike it and the lurker is dazzled out of its cap) */ drip(244, 2.8);   /* (where the bounce throws you: a heavy, the gap at your back) */
  mend(245, 21); puff(247, 21);
  /* THE HIGH SILVER: a cap hung high over the bog (on a stalk of its own), reached off the spring spore of the puffball under it - or a plunged bounce */
  plank(246, 249, 16); ent('silver', 248, 15); coins([246, 15], [249, 15]);
  /* rollers on the bog floor between the stalks */
  ent('roller', 214, 39, { face: 1, speed: 50 }); ent('roller', 241, 39, { face: -1, speed: 55 }); 
  /* THE BOG'S EXAM, THE CAP LADDER: a leaning cap over a gap no jump crosses, a bud under a spore drop to a stalk with a SPITCAP on its lip and a SHIELD behind,
     then THE BOUNCE WELL - eight wide, no jump crosses, a bounce-cap floor four rows down: off it to the last stalk. Shrine on it */
  bud(250, 22, { rise: 16, lean: 112, growT: 1.6 });
  /* THE EXAM's GAP HAS NO FLOOR (A10 amended): the bog under the cap ladder's leaning cap keeps what falls in - a fall is the end (back to the shrine). Told: the sign at
     the last shrine's lip and a warning post on the near lip; the lean was taught first over a gap with a floor (stalk one) */
  air(252, 258, 23, 42); deco(251, 21, 'warnPost', 0); deco(259, 21, 'warnPost', 1);
  ground(259, 264, 22);
  bud(263, 22); drip(264, 2.9); ground(265, 274, 18);
  foe('spitcap', 268, 17, 'ladder', { face: -1 }); foe('brute', 266, 17, 'ladder', { face: -1 }); foe('shield', 272, 17, 'ladder', { face: -1 }); foe('archer', 274, 17, 'ladder', { face: -1 }); plank(266, 272, 15);
  sign(261, 21, 'THE CAP LADDER: LEAN, GROW, BOUNCE.');
  air(275, 282, 0, 22); ground(275, 282, 23); for (const x of [276, 279, 282]) spring(x, 23);
  ground(283, 300, 19); plank(284, 292, 16); foe('brute', 286, 18, 'ladderTop', { face: -1 });   /* (where the well throws you: a heavy on the lip) */
  coins([276, 20], [279, 18], [282, 20], [284, 17]); glow(287, 18); deco(290, 18, 'sporePod');
  air(224, 230, 37, 39); air(218, 221, 37, 39);   /* hollows in the stalks' feet, in off the bog floor: what fell finds gold. (claude/sporewood2tune: the nook at 260-263 is gone and 231-232 stay wall - both opened onto a bottomless gap and CAUGHT a fall on their floor: a hero who missed the leaning cap stood in the nook with no way out, not dead - the walker stalled there in 5 runs of 6) */
  ent('check', 294, 18);                                                            /* SHRINE THREE */

  // ================= 4. THE WEB LARDER (298-358): her larder in the roots - webs, the weaver, the bud stair, and THE SPORE MAGE =================
  block(298, 358, 0, 5);                                                            /* the root roof over the larder */
  for (const x of [302, 318, 336, 350]) deco(x, 6, 'cobweb', x % 3, { hang: true });
  sign(297, 18, 'THE WEB LARDER. THE MOTHER KEEPS HER CATCH HERE. ONE CUT CLEARS A WEB.');
  ground(301, 315, 19);
  web(304, 15, 18); web(311, 15, 18);
  foe('weaver', 308, 16, 'larderDoor', { face: -1, perch: true }); plank(305, 310, 15); foe('shield', 302, 18, 'larderDoor', { face: -1 });         /* (a root ledge over the larder floor, level with the first tier: walked onto from it) */                              /* the larder's WEAVER hangs between its curtains: cut him or cut the web */
  deco(306, 18, 'bones', 0); deco(309, 18, 'skullPile', 0);
  /* THE LARDER STAIR: two four-row tiers up the root wall, a bud at each foot (no web on a tier: a web's top is footing, and a curtain there was a stair round the bud) */
  bud(314, 19); ground(316, 358, 15);
  /* (claude/sporeplat) GAUNTLET TWO, THE ROOT SPAN: the second tier is cut into stalks over a bog pool (318-330): a LEANING cap carries you off the stair's top over the bog, a hop down
     (two wide) onto a bounce pair, and the pair throws you up against the next wall to the tier's pad and its bud. One spider keeps the pad; no other foe. The stalks keep every route
     lock: nothing here reaches the larder's end without the bud at 332. A fall stings and is the climb back (a plank up each east face). */
  air(318, 330, 15, 22); ground(325, 326, 15); ground(329, 330, 19); spring(329, 19); spring(330, 19); bud(316, 15, { rise: 16, lean: 112, growT: 1.6 });
  gpool(318, 330, 23); stair(317, 15, 23); stair(326, 15, 23);
  sign(309, 18, 'THE ROOT SPAN. THE LEANING CAP CARRIES YOU OVER THE BOG. THE BOUNCE CAPS THROW YOU UP.');
  foe('spider', 334, 7, 'larderStair', { drop: 110, perch: true });   /* (the larder's keeper: it drops off the root roof on whoever reaches the pad) */
  coins([319, 13], [322, 12], [325, 13], [328, 16], [331, 12]);
  bud(332, 15); ground(334, 358, 11); foe('brute', 337, 10, 'larderEnd', { face: -1 });
  coins([336, 9], [340, 9]); plank(336, 351, 8);   /* a root shelf over the larder's end (claude/sporeplat: the second height the Root Span's tier gave up) */
  /* THE LARDER'S EXAM: the elite (level.js ELITES spore: THE SPORE MAGE, the Order's battle mage, replaces this shield) holds its end - his gate at 353 */
  foe('shield', 346, 10, 'larderEnd', { face: -1 }); foe('archer', 351, 10, 'larderEnd', { face: -1 }); foe('shield', 341, 10, 'larderEnd', { face: -1 });   /* (a forager's bow behind the mage, a shield before him) */
  glow(338, 10); deco(349, 10, 'skullPile', 1);
  ent('check', 404, 4);                                                             /* SHRINE FOUR (claude/bossheal 10-30, Daniel: a shrine before every boss): the knot's gauntlet - the root break and the bounce caps - is behind you, her door a few steps on. Moved from 356,10 (the larder's end, 53 route tiles before her door, the gauntlet between): a fall in the gauntlet comes back HERE */

  // ================= 5. THE MOTHER'S KNOT (358-408): her approach - the SEED CAPS and A ROOT KNOT taught, her gill pods and skulls, her door =================
  ground(359, 367, 11);
  sign(358, 10, "THE MOTHER'S KNOT. HER SEED CAPS GROW WHEN STRUCK; HER KNOTS OPEN FROM ABOVE.");
  /* THE SEED CAPS, taught: a six-row root wall and a pair of seed caps at its foot. Strike either and the pair grows a STAIR - the near one a low step, the one
     against the wall a high one: up them both (no jump climbs six rows, and the low step is too far from the wall to jump from). REQUIRED */
  bud(363, 11, { seed: true, rise: 40, hold: 14, pair: 'door' }); bud(366, 11, { seed: true, rise: 88, hold: 14, pair: 'door' });
  sign(360, 10, 'A SEED CAP. STRIKE IT: IT GROWS A STAIR OF TWO STEPS. CLIMB IT.');
  ground(368, 404, 5);
  /* (claude/sporeplat) GAUNTLET THREE, THE ROOT BREAK: the stair's top lands on a three-wide lip; a LEANING cap carries you over a real gap (six wide) to the knot's island, then the
     bounce pillar over the second break. A fall is the end (back to the shrine, a dozen columns off): told by the post, the sign, and the two caps taught before it. */
  air(371, 376, 5, 42); bud(369, 5, { rise: 16, lean: 96, growT: 1.6 }); deco(378, 4, 'warnPost', 1);
  /* A ROOT KNOT on the wall top: jump, and PLUNGE onto it from above (down and attack in the air) - it opens the root door beside it, down to the last silver.
     Optional (a teach on the way): HER knot opens her the same way */
  ent('rootknot', 377, 4, { door: [379, 380, 5, 8] });
  sign(381, 4, 'A ROOT KNOT OPENS FROM ABOVE: JUMP, THEN PLUNGE ONTO IT. SO DOES HERS.');
  sign(368, 4, 'THE ROOT BREAKS. STAND ON THE LEANING CAP: IT CARRIES YOU OVER. MISS AND YOU FALL.');
  for (let y = 5; y <= 8; y++) { set(379, y, T.PORT); set(380, y, T.PORT); }   /* THE ROOT DOOR, shut (T.PORT, so the reach fill counts it open: L.reachDoors; the art pass draws it as roots) */
  air(381, 386, 6, 8); spring(380, 9); ent('silver', 385, 8); coins([382, 8], [384, 8]); glow(383, 8);   /* the knot's cellar: the third silver; a bounce cap under the door to spring back out */
  /* her approach: gill pods, skulls, her roots across the way; the last fight before her door - a BRUTE (the weighty one) and a sporeling */
  for (const [x, k, v] of [[382, 'sporePod', 1], [389, 'skullPile', 0], [393, 'rootDecor', 2], [398, 'sporePod', 0], [402, 'skullPile', 1]]) deco(x, 4, k, v);
  foe('brute', 400, 4, 'knotDoor', { face: -1 }); foe('shield', 402, 4, 'knotDoor', { face: -1 });
  /* HER APPROACH'S FALL (claude/sporewood2tune): the last stretch before her door breaks in a REAL GAP, seven wide, no floor, a pillar of THREE bounce caps in it (integ117: three, not two - the paladin's thrown carry fell 23 px short of the far lip over a two-cap pillar) - hop on, be thrown over. A heavy waits where it throws you. Told: the post each side, the sign */
  air(392, 398, 5, 42); ground(394, 396, 5); spring(394, 5); spring(395, 5); spring(396, 5); deco(391, 4, 'warnPost', 0); deco(399, 4, 'warnPost', 1);
  sign(388, 4, 'THE ROOT BREAKS HERE. HOP ONTO THE BOUNCE CAPS: THEY THROW YOU OVER. MISS AND YOU FALL.');
  plank(370, 391, 2); plank(399, 402, 2); plank(405, 408, 6); coins([386, 1], [390, 1]);                 /* a root over her approach */
  coins([372, 3], [374, 3], [390, 3], [400, 3]);
  sign(403, 4, 'HER CAP TURNS BLADES. GROW HER SEED CAPS, CLIMB, AND PLUNGE ONTO HER KNOT.');
  ground(405, 408, 9);                                                              /* down into her hollow */

  // ================= 6. THE MOTHER'S HOLLOW (408-460): THE MOTHER CAP 2 (src/mother-cap2.js) =================
  const [A0, A1] = SPOREWOOD.arena, F = SPOREWOOD.floor - DY, MX = SPOREWOOD.mother;   /* (F: her floor's laid row) */
  ground(A0 - 1, A1 + 1, F);
  /* her SEED CAPS: a pair a side by her stalk - struck, a pair grows a STAIR toward her knot: the outer one a LOW step (3 rows), the inner one a HIGH step (6 rows)
     up against the rim of her cap. src/sporewood-hands.js grows them when struck; in her second phase she WITHERS them (src/mother-cap2.js) */
  bud(MX - 6, F, { seed: true, mother: true, rise: 40, hold: 9, pair: 'L' }); bud(MX - 4, F, { seed: true, mother: true, rise: 84, hold: 9, pair: 'L' });   /* (the high caps' inner edges stand 40 px off her knot: a running jump off one comes down on it) */
  bud(MX + 3, F, { seed: true, mother: true, rise: 84, hold: 9, pair: 'R' }); bud(MX + 5, F, { seed: true, mother: true, rise: 40, hold: 9, pair: 'R' });
  /* two root shelves at her walls, three rows up (a breath out of the net in her second phase) */
  plank(A0 + 1, A0 + 5, F - 3); plank(A1 - 5, A1 - 1, F - 3);
  for (const [x, k, v] of [[A0 + 5, 'rootDecor', 0], [A0 + 9, 'sporePod', 0], [A1 - 9, 'sporePod', 1], [A1 - 5, 'rootDecor', 1], [A0 + 15, 'skullPile', 0], [A1 - 15, 'skullPile', 1]]) deco(x, F - 1, k, v);
  glow(A0 + 2, F - 1); glow(A1 - 2, F - 1);
  ent('mother', MX, F - 1);
  /* the road out, to the Rootway */
  ground(A1 + 1, W - 1, F); plank(462, 469, F - 3); deco(464, F - 1, 'rootDecor', 2); deco(468, F - 1, 'sporePod', 1); glow(466, F - 1);

  const arena = { x0: A0 * TS, x1: A1 * TS, floor: (F + DY) * TS, trigger: (A0 + 3) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'mother', music: 'sporemother', tint: '#9a5aa8', tintA: 0.1 };
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 39 + DY }, pools, falls: [], moversExtra: caps,
    arena, sporewood2: true,
    reskin: { shield: 'myconidguard', brute: 'capbrute', archer: 'sporearcher' },   /* (claude/sporewood2art) THEME FIT: the goblin heavies are the wood's own people - art + names only, src/main.js gives the skin at spawn (so the level's hash is the greybox's) */
    knot: { x: MX * TS + 8, y: (F + DY) * TS - 118 },   /* THE MOTHER'S KNOT: the landmark's anchor (src/redraw/sporewood_knot.js) and her knot's place */
    reachDoors: [{ x0: 379, x1: 380, y0: 5 + DY, y1: 8 + DY }],   /* the root knot's door (optional: the fill counts it open; the knot is plunged, src/sporewood-hands.js) */
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,                  /* four shrines, one closing each area's exam (A10c), the last one at her door: src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: 408, hi: W - 1, spots: 0, why: "THE MOTHER'S HOLLOW: columns 408-471 are her arena and the road out - no squad stands in a boss arena" }],
    unlocks: [
      { kind: 'glowbud', opens: 'its light: the dark buds near it grow, a lurker in it is dazzled out of his cap', hud: 'THE LANTERN CAP LIGHTS' },
      { kind: 'rootknot', opens: 'the root door under it, to the last silver', hud: 'THE KNOT OPENS' },
      { kind: 'mendpuff', opens: 'a small heal', hud: 'THE SPORES MEND YOU' },
      { kind: 'springpuff', opens: 'a spring spore to bounce off (the high silver over the bog)', hud: 'A SPRING SPORE' },
    ],
    duskStart: -1, duskLen: 1, music: 'sporewood', night: false, glowNight: true,   /* "Mysterious Ambience (song21)" by cynicmusic, CC0 - SPOREWOOD's own theme (audio/CREDITS.txt) */
    interiors: [],
    palette: { sky: [[64, 96, 112], [150, 190, 160]], near: 'mushroom', myc: true, dress: 'myc', haze: 'rgba(150,170,130,0.1)', grass: '#4a8a4a', grassL: '#7ac860', grassD: '#2f5e3a', dirt: '#4a3a3c', dirtL: '#5e4c4a', dirtD: '#33262a', canopy: ['#2a1f38', '#3a2a4c', '#4e3a64', '#66507e'] },
    weather: [{ x0: 0, x1: 99999, kind: 'spore' }],
    /* the glade's insects, the hollows' drip, the larder's silence, her hollow's heartbeat - one bed a place (art lane: own beds; the drip until then) */
    ambient: [{ x0: 0, x1: 100 * TS, kind: 'forest' }, { x0: 100 * TS, x1: 198 * TS, kind: 'drip' }, { x0: 198 * TS, x1: 298 * TS, kind: 'water' }, { x0: 298 * TS, x1: 358 * TS, kind: 'cave' }, { x0: 358 * TS, x1: 408 * TS, kind: 'wind' }, { x0: 408 * TS, x1: 99999, kind: 'deep' }],   /* (claude/sporewood2art) one bed a place: the glade's morning, the hollows' drip, the bog's water, the larder's cave hush, the roots' wind, her hollow's deep */
    /* THE DARK: the Lantern Hollows (the canopy over them), and the knot's cellar */
    dark: 0.01, darkZones: [{ x0: 104 * TS, x1: 198 * TS, y0: (14 + DY) * TS, y1: 44 * TS, dark: 0.86 }, { x0: 378 * TS, x1: 387 * TS, y0: (5 + DY) * TS, y1: (10 + DY) * TS, dark: 0.7 }],
    /* the wood sickens toward her: violet over the glade, deeper in the hollows, the larder's grey-green, her pink (the seam into the Rootway past her) */
    tints: [[-24, 100, [150, 190, 120], 0.05], [100, 198, [50, 70, 120], 0.1], [198, 298, [130, 160, 80], 0.07], [298, 358, [150, 150, 130], 0.08], [358, 408, [180, 90, 70], 0.09], [408, W + 24, [130, 50, 120], 0.11]],   /* (claude/sporewood2art: earth and fungus, one place at a time - no longer one violet wash) */
    reachExact: false,
  };
}
