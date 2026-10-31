// src/kingswood.js - KINGSWOOD 2: THE KING'S HUNTING WOOD (claude/kingswood2, the OPUS GREYBOX of the LEVEL, 2026-10-22). Brief scratch/brief-kingswood2-1014.md
// ('!! 10-14 LATE': Daniel, "Kingswood is fine but very BLAND; Rootway is the model") and the recipe scratch/review-rootway-recipe-1014.md (Kingswood scored 9/20).
// This file is the level the game runs, laid by hand (nothing sprinkled); src/kingswood-hands.js is its rule and machines; KING GORM (src/main.js 'king') is its boss -
// his two-phase fight and the burning-wood escape are the NEXT lane: his hall (THE KING'S HALL below) is his phase 1 arena as it stands today, moved here whole.
//
// THE RULE (L.rule): THE COURT HOLDS THE ROAD, AND WHAT HANGS OVER IT CAN BE DROPPED ON IT.
//   The court's ROYAL ROPES (src/kingswood-hands.js): strike a rope's PEG and what hangs DROPS - a CAGE crushes what is under it (some land as STEPS), a LOG SPAN lands
//   across a gap (a BRIDGE), a LOG TRAP drops and ROLLS down the road through what stands on it. The court's own PLATES drop their cages (his hall has five), its LEVERS
//   swing the hung RAMS. The court HOLDS THE ROAD: its checkpoints wall the road until you bring something down; its procession marches it.
//
// FIVE NAMED AREAS, one verb each, each closed by an exam and a shrine (A10c, the Rootway recipe). Columns; rows: smaller is higher. The route CLIMBS toward
// THE GREAT OAK (src/redraw/kingswood_oak.js: on the skyline from the first screen, growing as you come; the same tree as his phase 2) from row 39 to row 10.
//     0-122  THE ROYAL ROAD          TEACH   banners and the court's thieves; a cage dropped on a sleeping brute (safe, the sign); THE COURT'S CHECKPOINT: its cage is the
//                                            REQUIRED step over its wall; the first LOG TRAP rolls down the road through a pike line; exam = THE GATE CAPTAIN (an elite under
//                                            his own cage, a dip at his back, a ram on the gatehouse); shrine 118
//   122-206  THE HUNTING STANDS      TEST (A14, the platforming section)  up the King's hunting stands over the meadow where his hounds run: archers on every deck,
//                                            THE LOG SPAN over the gap no jump crosses (REQUIRED), a cage dropped from a deck on the pack below, a swing; exam = THE HOUND
//                                            MASTER's kennel (the mini); shrine 206
//   206-306  THE CAGE GROVE          REMIX (teaches his fight)  the King's catch hung in the boughs: a PLATE on a bough drops its cage on the patrol below (his hall's
//                                            shape), the wasps' boughs, THE CAGE STAIR (three cages cut down = a stair up the great trunk, REQUIRED), and on the canopy road a
//                                            log trap and a plate-cage over THE CAGE-WARDEN (the exam's elite), a fall at his back; shrine 306
//   306-416  THE COURT'S PROCESSION  EXAM (the set piece)  the carpet road under the boughs: the court MARCHES it toward you - hide on the boughs and it passes under
//                                            you, or AMBUSH it from them (a cage, a rolling log, a plate-cage, a ram); then THE COURT GATE (its plate is on the road's step);
//                                            shrine 414, his door
//   416-490  THE KING'S HALL         THE BOSS  King Gorm's hall (phase 1 as today): litter, scaffold, five plates and their cages, galleries; the Great Oak over its roof
/* (claude/kingsfix2) THE ESCAPE IS 40 COLUMNS LONGER (Daniel 10-23: 'a little longer, more fire, more hectic'): THE BOUGH BRIDGE sits at 560-599; the ravine, its shrine and the glade moved east by SH */
export const SH = 40;
export const KINGSWOOD = { W: 650 + SH, H: 44, arena: [420, 474], glade: [602 + SH, 646 + SH] };
export const SECTIONS = [['THE ROYAL ROAD', 0, 122], ['THE HUNTING STANDS', 122, 206], ['THE CAGE GROVE', 206, 306], ["THE COURT'S PROCESSION", 306, 416], ["THE KING'S HALL", 416, 490], ['THE BURNING WOOD', 490, 600 + SH], ["THE KING'S GLADE", 600 + SH, 650 + SH]];
/* the rule's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/kingswood2.mjs and the brief */
export const ARCS = {
  rope: { teach: [18, 32], develop: [44, 58], twist: [138, 158], exam: [240, 262] },          /* the sleeping brute; the checkpoint's step; the log span over the stands' gap; the cage stair */
  log: { teach: [62, 92], develop: [270, 290], exam: [330, 360] },                            /* the road's log trap; the canopy road's; the procession's */
  plate: { teach: [214, 230], develop: [282, 296], exam: [356, 412] },                        /* the grove's bough plate; the warden's; the procession's + the court gate */
  ram: { teach: [96, 108], exam: [372, 384] },                                                 /* the gatehouse ram; the procession's */
  march: { exam: [306, 416] },
};

export function buildKingswood({ painter, T, TS }) {
  const { W, H } = KINGSWOOD;
  const L = painter(W, H), { set, block, ent } = L;
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1);
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const sign = (x, y, text, o) => ent('sign', x, y, { text, ...(o || {}) });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ squad }, o || {}));
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v, o) => ent('deco', x, y, { kind, v: v || 0, ...(o || {}) });
  const gate = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
  const hoists = [], movers = [], crumbles = [];
  /* A ROYAL ROPE: id, the load's column `x` (a cage spans x-1..x; a log three tiles centred on x), its pulley row `top`, the load's bottom row while it hangs `hang`,
     the PEG [x, y] (y: the cell a hero stands in to strike it), and what it holds: { load: 'cage', land?: [x, y] } | { load: 'span', span: [x0, x1, row] } |
     { load: 'log', roll: +1/-1, rollMax? }. An ent at the peg (the guide's stuck spots and the tools name it there; src/kingswood-hands.js runs the rope from L.hoists) */
  const rope = (id, o) => { hoists.push(Object.assign({ id, cut: false }, o)); if (!o.boss) ent('hoist', o.cleat[0], o.cleat[1], { id }); return o; };
  const swing = (px, py, arm, period, phase) => movers.push({ kind: 'swing', px: px * TS, py: py * TS, arm, x: 0, y: 0, w: 48, h: 8, period, phase });

  block(0, 0, 0, H - 1);                                                           /* the world's west edge */

  // ================= 1. THE ROYAL ROAD (0-122): TEACH the drop, where a miss is cheap; the court's checkpoints hold the road =================
  ground(1, 36, 40);
  sign(6, 39, "THE ROYAL ROAD, INTO THE KING'S HUNTING WOOD. HIS COURT HOLDS IT.");   /* (claude/gorm2) two tiles right (Daniel 10-22) */
  deco(7, 39, 'gobPennant', 0); deco(16, 39, 'banner', 0); deco(33, 39, 'banner', 1);
  plank(6, 9, 37); plank(10, 18, 34); coins([12, 33], [15, 33]);                 /* THE ROYAL BOX: the court's viewing stand over the road (a second height) */
  sign(10, 39, 'COURT THIEVES SNATCH GOLD AND RUN. CATCH ONE AND IT PAYS YOU BACK MORE.');
  foe('thief', 14, 39, 'roadA', { face: -1 });
  coins([8, 37], [12, 37], [19, 38]);
  /* THE FIRST ROPE, SAFE: a cage hangs over a sleeping brute; the peg stands at the roadside, five tiles off him. Cut it: the cage kills him and stays where it lands as
     a step - up to a ledge with the first gold off the road */
  rope('teachCage', { x: 28, top: 26, hang: 33, cleat: [23, 39], load: 'cage', land: [27, 38] });
  sign(20, 39, 'WHAT HANGS OVER THE ROAD CAN BE DROPPED ON IT. STRIKE THE PEG.');
  foe('brute', 28, 39, 'teach', { face: 1, sleeper: true });
  plank(29, 34, 35); coins([30, 34], [32, 34], [34, 34]);                          /* (the cage's step is the way up to it: no jump reaches it from the road) */
  /* a rise; the court's bowman on a hunting perch over the road */
  ground(37, 58, 38);
  plank(40, 44, 35); foe('archer', 42, 34, 'perchA', { face: -1, perch: true });
  foe('thief', 47, 37, 'perchA', { face: -1 }); plank(47, 52, 35);
  coins([39, 36], [45, 36]);
  /* THE COURT'S CHECKPOINT: the court's wall across the road, five rows (no jump). Its guard stands under its cage; the cage is the step over it (REQUIRED) */
  block(59, 64, 33, 37);
  rope('checkCage', { x: 58, top: 26, hang: 31, cleat: [52, 37], load: 'cage', land: [57, 36] });
  sign(49, 37, "THE COURT'S CHECKPOINT. CUT ITS CAGE DOWN: IT LANDS AS A STEP.");
  foe('shield', 57, 37, 'checkpoint', { face: -1 }); foe('sprig', 55, 37, 'checkpoint', { face: -1 });
  deco(60, 32, 'gobPennant', 1); deco(63, 32, 'warnPost', 0); ent('torch', 61, 32);
  /* the high road: banners, and THE LOG TRAP over a pike line (it rolls east, the way the road runs, and splits on the stump) */
  ground(59, 89, 33);
  deco(67, 32, 'banner', 0); deco(86, 32, 'banner', 1); plank(60, 68, 30); coins([62, 29], [66, 29]);   /* a bough over the high road */
  rope('roadLog', { x: 76, top: 24, hang: 28, cleat: [70, 32], load: 'log', roll: 1, rollMax: 14 });
  sign(66, 32, 'A LOG TRAP. CUT ITS PEG: IT DROPS, THEN ROLLS DOWN THE ROAD.');
  foe('pike', 77, 32, 'logLine', { face: -1 }); foe('sprig', 81, 32, 'logLine', { face: -1 }); foe('sprig', 84, 32, 'logLine', { face: -1 });
  coins([72, 31], [80, 30], [86, 31]);
  block(90, 91, 30, 32);                                                           /* the stump the log splits on (three rows: a jump) */
  plank(78, 83, 30); coins([79, 29], [82, 29]);                                    /* (a bough over the road: a second height) */
  /* THE GATE CAPTAIN (the area's exam): the court's gatehouse on the rise - an elite brute under his own cage, a shield beside him, a bow on the gatehouse roof and a
     RAM hung in its arch (the lever by the door). A dip at his back. The checkpoint after him is the shrine */
  ground(92, 104, 31);
  plank(96, 99, 28); foe('archer', 97, 27, 'gatehouse', { face: 1, perch: true }); deco(99, 30, 'banner', 0);
  rope('captainCage', { x: 102, top: 20, hang: 25, cleat: [95, 30], load: 'cage' });
  foe('brute', 102, 30, 'gatehouse', { face: -1 }); foe('shield', 99, 30, 'gatehouse', { face: -1 });
  ent('lever', 93, 30, { ram: 105 }); ent('ram', 105, 26, { hang: true });       /* the gatehouse's ram: the lever swings it through whatever stands under the arch */
  sign(93, 30, 'THE GATE CAPTAIN HOLDS THE ROAD. HIS CAGE HANGS OVER HIM; THE LEVER SWINGS THE RAM.');
  ground(105, 107, 34);                                                            /* the dip at his back (three deep: a knock-back costs the climb) */
  ground(108, 130, 31);
  air(99, 104, 32, 33);                                                            /* THE GATEHOUSE CELLAR: a low burrow back in under the gatehouse off the dip (a pocket: the court's takings; west, away from the way on) */
  coins([96, 29], [106, 32], [112, 29]);
  ent('torch', 114, 30); deco(110, 30, 'gobPennant', 0); plank(110, 116, 28); coins([112, 27], [115, 27]);
  ent('check', 118, 30);                                                           /* SHRINE ONE: the Royal Road's exam is behind you */

  // ================= 2. THE HUNTING STANDS (122-206): TEST, and the level's real platforming (A14) =================
  /* The King's hunting stands over the meadow his hounds run: decks on posts, a ledge stair inside each stand (a fall into the meadow costs the climb, never the run),
     an archer on every deck, the gap no jump crosses (THE LOG SPAN, REQUIRED), a cage dropped from a deck on the pack below (optional), a rope swing */
  sign(124, 30, 'THE HUNTING STANDS. THE KING SHOOTS FROM UP HERE; HIS HOUNDS RUN BELOW.');
  ground(131, 174, 39);                                                            /* THE MEADOW (the hunting ground), eight rows down */
  /* stand A */
  plank(132, 139, 30);                                                             /* its deck: a step down from the lip */
  plank(132, 135, 36); plank(135, 138, 33); coins([133, 35], [137, 32]);           /* the ledge stair inside it, up from the meadow */
  foe('sprig', 136, 29, 'standA', { face: -1 });
  /* stand B: a jump up from A; its archer covers A */
  plank(143, 150, 28);
  plank(144, 147, 36); plank(146, 149, 33); plank(143, 146, 31);
  foe('archer', 148, 27, 'standB', { face: -1 }); foe('shield', 146, 27, 'standB', { face: -1 });   /* the deck's guard stands between you and the span's peg */
  /* THE GAP: eight wide, no jump crosses it. A log span hangs on a royal rope over it, its peg on B's deck: cut it and it lands across, a bridge (REQUIRED) */
  rope('standSpan', { x: 155, top: 19, hang: 24, cleat: [149, 27], load: 'span', span: [151, 158, 28] });
  sign(144, 27, 'NO JUMP CROSSES THIS GAP. A LOG HANGS OVER IT: CUT ITS PEG.');
  foe('hound', 141, 38, 'meadow', { face: 1 }); foe('hound', 155, 38, 'meadow', { face: -1 });
  foe('royalboar', 166, 38, 'meadow', { face: -1 });                              /* THE ROYAL BOAR (claude/gorm2, the level's new foe): it roots in the King's meadow and charges its length - jump it, or cut the meadow cage on it */
  /* stand C: past the span, an archer on its deck; a cage hangs under the deck over the meadow pack (cut it from the deck: optional, the ambush taught) */
  plank(159, 166, 28);                                                             /* (no ledge stair up C or D from the meadow: a fall past the gap walks back to B and climbs again - the span stays a lock) */
  foe('archer', 165, 27, 'standC', { face: -1 }); foe('thief', 161, 27, 'standC', { face: -1 });   /* (where the span sets you down) */
  rope('meadowCage', { x: 141, top: 21, hang: 25, cleat: [138, 29], load: 'cage' });   /* (over the gap between A and B: cut from A's deck, it falls on the pack in the meadow) */
  coins([152, 26], [155, 25], [158, 26]);
  air(124, 130, 36, 38); ent('silver', 125, 38); deco(128, 38, 'trophyRack', 0);   /* SILVER ONE: THE HUNTERS' HIDE, dug in under the road off the meadow (off the road: a fall, then the climb) */
  /* stand D: up again, and a rope swing over the last gap (the ledge road under it is the slow way) */
  plank(168, 174, 25);                                                             /* D's deck: a jump up from C */
  foe('archer', 173, 24, 'standD', { face: -1 }); foe('sprig', 170, 24, 'standD', { face: -1 });
  coins([170, 24], [176, 21], [180, 21]);
  /* THE KENNEL (THE HOUND MASTER, the area's exam - a mini, B18): the yard on the hill past the stands; walls close, the gate opens when he falls */
  ground(175, 214, 26);
  ent('torch', 178, 25); ent('torch', 196, 25); ent('cage', 180, 25, { kind: 'bird' });
  ent('greathound', 192, 25, { mini: true }); ent('chainpost', 197, 25);
  sign(177, 25, 'GREAT HOUND: JUMP THE LUNGE, DODGE THE POUNCE, KILL THE PUPS. A BLOCK SKIDS IT.', { pyro: 'GREAT HOUND: JUMP THE LUNGE, DODGE THE POUNCE, KILL THE PUPS. IT HATES FIRE.', paladin: 'GREAT HOUND: JUMP THE LUNGE, DODGE THE POUNCE, KILL THE PUPS. THE AEGIS SKIDS IT.' });
  gate(199, 20, 25);
  coins([202, 24], [204, 24]); plank(200, 206, 23); coins([201, 22], [205, 22]);
  ent('check', 168, 24);                                                           /* SHRINE: the hunting stands' span and meadow are behind you, the kennel's gate a few steps on (claude/bossheal 10-30: a shrine before every mini) */
  ent('check', 205, 25);                                                           /* SHRINE TWO: the kennel is behind you */

  // ================= 3. THE CAGE GROVE (206-306): REMIX - the drop turned on the court, and his fight taught =================
  sign(208, 25, 'THE CAGE GROVE. THE KING HANGS HIS CATCH IN THE BOUGHS.');
  deco(210, 25, 'hangCage', 0, { hang: true }); deco(232, 22, 'hangCage', 1, { hang: true });
  /* THE BOUGH PLATE (his hall's shape, taught): a plate on a bough, its cage hung beside it over the road; the patrol walks under it */
  plank(214, 220, 23); ent('plate', 218, 22, { cage: 223 }); ent('dropcage', 223, 19);
  sign(213, 25, 'STAND ON A PLATE AND ITS CAGE FALLS. THE KING HAS FIVE IN HIS HALL.');
  foe('brute', 224, 25, 'boughPlate', { face: -1 }); foe('sprig', 228, 25, 'boughPlate', { face: -1 });
  coins([215, 22], [219, 22]); plank(225, 231, 23);
  /* the wasps' boughs: a rise, the wasps out of their hives, a cage over a shield (cut it from the bough) */
  ground(215, 232, 26); ground(233, 249, 23);
  plank(236, 241, 20); foe('wasp', 238, 17, 'hives', { perch: true }); foe('wasp', 246, 18, 'hives', { perch: true });   /* (integ115) the wasps hang above the squad's floor on purpose (sprinkle-cap's e.perch) */
  rope('hiveCage', { x: 245, top: 14, hang: 18, cleat: [240, 19], load: 'cage' });
  foe('shield', 245, 22, 'hives', { face: -1 }); foe('sprig', 242, 22, 'hives', { face: -1 });
  deco(234, 22, 'gobPennant', 1); coins([237, 19], [240, 19], [247, 21]);
  /* THE CAGE STAIR: the great trunk, twelve rows. Three cages hang down its face; each one cut lands as the next step (REQUIRED) - the King's larder made a stair */
  ground(250, 252, 23);
  rope('stairA', { x: 252, top: 6, hang: 14, cleat: [249, 22], load: 'cage', land: [251, 21] });
  ground(253, 256, 19);                                                            /* LEDGE ONE: four rows over the road (the first cage is the step to it) */
  rope('stairB', { x: 256, top: 4, hang: 11, cleat: [254, 18], load: 'cage', land: [255, 17] });
  ground(257, 260, 15);                                                            /* LEDGE TWO: four rows over ledge one */
  rope('stairC', { x: 260, top: 2, hang: 8, cleat: [258, 14], load: 'cage', land: [259, 13] });
  ground(261, 300, 11);                                                            /* THE CANOPY ROAD: the trunk's top, four rows over ledge two */
  sign(246, 22, 'THE CAGE STAIR. EACH CAGE YOU CUT DOWN IS THE NEXT STEP UP.');
  foe('sprig', 255, 18, 'stair', { face: -1 }); foe('archer', 259, 14, 'stair', { face: -1, perch: true });
  coins([254, 17], [258, 13]);
  /* THE CANOPY ROAD: a log trap down the road through a hound and a shield, then THE CAGE-WARDEN (the area's exam, an elite) under a plate's cage, the fall at his back */
  plank(262, 267, 8); plank(276, 283, 8); coins([264, 7], [279, 7]);              /* the canopy's high boughs */
  rope('canopyLog', { x: 270, top: 4, hang: 7, cleat: [267, 10], load: 'log', roll: 1, rollMax: 16 });   /* (its peg stands past the stair's head: a hero still on the third cage is not drawn to it) */
  foe('hound', 272, 10, 'canopy', { face: -1 }); foe('shield', 277, 10, 'canopy', { face: -1 });
  block(285, 286, 9, 10);                                                          /* the knot the log splits on (two rows: a step) */
  plank(287, 292, 7); ent('plate', 289, 6, { cage: 295 }); ent('dropcage', 295, 4);
  foe('brute', 295, 10, 'warden', { face: -1 }); foe('wasp', 292, 4, 'warden', { perch: true });
  sign(281, 10, 'THE CAGE-WARDEN. HIS PLATE IS ON THE BOUGH OVER HIM.');
  deco(298, 10, 'hangCage', 0, { hang: true }); coins([288, 6], [291, 6], [298, 9]);
  /* the fall at his back: the canopy ends over the grove floor */
  ground(301, 303, 30); ground(304, 312, 12);
  for (const y of [27, 24, 21, 18, 15]) plank(301, 303, y);                       /* (and a ladder of boughs back up the gap: a fall costs the climb, not the run) */
  ent('check', 307, 11);                                                           /* SHRINE THREE: the grove's exam is behind you */

  // ================= 4. THE COURT'S PROCESSION (306-416): THE EXAM - the court marches its road =================
  /* The carpet road under the great boughs. Past the shrine the court's horn: the procession marches down the road toward you (src/kingswood-hands.js). On the
     boughs over the road it does not see you and passes under, out through the side gate; on the road it sees you and turns on you. From the boughs: a cage, a log
     that rolls INTO the court, a plate-cage and the ram in the arch - the ambush. Then the court gate: its plate is on the road's step */
  ground(313, 489, 14);
  sign(310, 11, "THE COURT'S PROCESSION. HIDE ON THE BOUGHS OVER THE ROAD, OR DROP SOMETHING ON IT.");
  deco(315, 13, 'gobPennant', 0); deco(317, 13, 'banner', 1);                     /* the side gate the court leaves by */
  for (let x = 322; x <= 400; x += 2) ent('carpet', x, 13);
  plank(318, 320, 11);                                                             /* the step up to the boughs (a board: the court marches under it) */
  plank(321, 333, 10); plank(337, 351, 10); plank(355, 371, 10);                   /* THE BOUGHS: four rows over the road (no jump from it; the step at their foot) */
  plank(334, 336, 8); plank(352, 354, 8);                                          /* (the crotch between two boughs) */
  rope('procCage', { x: 336, top: 3, hang: 11, cleat: [331, 9], load: 'cage' });
  rope('procLog', { x: 354, top: 3, hang: 11, cleat: [349, 9], load: 'log', roll: 1, rollMax: 30 });
  ent('plate', 366, 9, { cage: 370 }); ent('dropcage', 370, 11);
  ent('lever', 374, 13, { ram: 380 }); ent('ram', 380, 9, { hang: true });       /* the arch's ram: it swings across the road at the boughs' end */
  deco(326, 9, 'banner', 1, { hang: true }); deco(344, 9, 'banner', 0, { hang: true }); deco(362, 9, 'banner', 1, { hang: true });
  coins([324, 9], [330, 9], [341, 9], [347, 9], [359, 9], [365, 9]);
  ent('silver', 335, 7);                                                           /* SILVER TWO: in the crotch of the boughs, over the march */
  /* THE COURT (marchers: src/kingswood-hands.js; e.kw is copied onto the foe): out of the view from the trigger, front to back */
  foe('archer', 391, 10, 'courtStand', { face: -1, perch: true });               /* the court's bow on its stand by the gate: it looses on the road and the boughs alike */
  for (const [t, x] of [['pike', 384], ['shield', 387], ['sprig', 390], ['brute', 393], ['shield', 396], ['sprig', 399], ['pike', 402]]) foe(t, x, 13, 'procession', { face: -1, kw: { march: 'court' } });
  plank(386, 396, 11); plank(412, 418, 11); coins([389, 10], [393, 10]);        /* the court's stands along the road's end */
  /* THE COURT GATE: shut across the road; its plate is on the step the road climbs before it (you cannot cross without standing on it) */
  block(403, 406, 12, 13); ent('plate', 405, 11, { gate: 410 });
  gate(410, 4, 13);
  deco(408, 13, 'banner', 0); deco(412, 13, 'banner', 1); ent('torch', 409, 13); ent('torch', 413, 13);
  sign(401, 13, 'THE COURT GATE. THE PLATE ON THE STEP LIFTS IT.');
  ent('check', 414, 13);                                                           /* SHRINE FOUR: his door */
  sign(416, 13, "KING GORM: STRIKE ANY CAGE ROPE OR PEG WHEN HE IS UNDER IT. HIS ARCHERS ARE ONLY PRESSURE.");   /* (claude/kingsfix2) the ropes are free at any moment */

  // ================= 5. THE KING'S HALL (420-474): KING GORM UNDERLEAF, phase 1 as it stands (his old throne room, moved here whole; the next lane reworks it) =================
  const [A0, A1] = KINGSWOOD.arena, ax = c => A0 + c;                              /* (the old hall's columns, from its west wall) */
  for (let x = ax(2); x <= ax(52); x++) ent('carpet', x, 13);
  ent('torch', ax(4), 13); ent('torch', ax(50), 13); deco(ax(10), 13, 'banner', 0); deco(ax(44), 13, 'banner', 1);
  deco(ax(16), 13, 'skullPile', 0); deco(ax(38), 13, 'skullPile', 1);
  plank(ax(6), ax(8), 3); plank(ax(51), ax(53), 3);                                /* the archers' perches under the roof, level with the winch decks */
  plank(ax(2), ax(7), 9); plank(ax(50), ax(54), 9); ent('torch', ax(2), 8); ent('torch', ax(53), 8);   /* the galleries: the court cheers from them */
  for (const c of [3, 5, 7, 51, 53]) ent('folk', ax(c), 8, { court: true, alt: c % 4 === 1 });
  deco(ax(4), 8, 'banner', 1); deco(ax(52), 8, 'banner', 0);
  /* THE SCAFFOLD: three tiers of ledges up to the winch decks */
  for (const c of [9, 22, 35, 44]) plank(ax(c), ax(c) + 2, 11);
  for (const c of [14, 26, 40]) plank(ax(c), ax(c) + 2, 8);
  for (const c of [9, 18, 27, 36, 45]) plank(ax(c), ax(c) + 5, 5);
  /* (claude/gorm2) five cages under the decks, each on a ROYAL ROPE tied off to TWO PEGS on the floor, three tiles either side of it. Two RAFTER ARCHERS file onto the deck of the live one
     and hold its rope (src/gorm-hands.js): bring them down (the scaffold, or a ROCK from a heap) and its peg drops the cage - on his head, HELD (x2). Three heaps of the
     court's cobbles at the hall's two ends (E takes one, UP lobs it to a deck). The plates are gone (Daniel 10-22: the cages move from plates to ropes) */
  const HALL_CAGES = [12, 21, 30, 39, 48];
  for (const c of HALL_CAGES) ent('dropcage', ax(c), 7, { boss: true });
  coins([ax(10), 10], [ax(23), 10], [ax(36), 10], [ax(15), 7], [ax(27), 7], [ax(41), 7], [ax(11), 4], [ax(20), 4], [ax(29), 4], [ax(38), 4], [ax(47), 4]);
  ent('king', ax(28), 13);
  /* his hall's east door: the King's takings on the shelf, then the wood */
  deco(480, 13, 'lootHeap', 1); deco(486, 13, 'idol', 0);
  ent('silver', 484, 10); plank(482, 486, 11);                                      /* SILVER THREE: the King's takings on the shelf past his hall */

  // ================= 6. THE BURNING WOOD (490-640): THE ESCAPE (claude/gorm2) - a forward RUN, the fire behind you =================
  /* His P1 bar empties: the court TORCHES the wood and his bearers carry him off east; you are FULLY HEALED, and the fire comes after you from his hall
     (src/gorm-hands.js: it hurries when you are far ahead, it never stops until the glade). Not a climb (the Goblin Queen's castle is the climb): a run
     east through the King's wood, the floor under the canopy burning (up into the boughs), BURNING BRANCHES on marked spots (a creak, a red ring),
     TORCH GOBLINS lighting the road in front of you ('!', the patch flickers first). Its exam: THE BURNING RAVINE - three boughs over burning ground,
     a torch goblin on the middle one, a branch over it; a fall is a climb out of the fire (a bough ladder), the wall of fire coming. A shrine at its end. */
  ground(490, 511, 14);
  foe('sprig', 507, 13, 'run', { face: -1, kw: { torch: true } });                /* the first torch goblin: he lights the road in front of you (teach) */
  /* the canopy over the burning floor (the court fired the undergrowth): up into the boughs */
  ground(512, 541, 14);
  plank(510, 515, 12); plank(518, 523, 10); plank(526, 531, 10); plank(534, 539, 11);
  coins([520, 9], [528, 9], [536, 10]);
  /* the road again: a torch goblin pair, a fallen trunk to hop */
  ground(542, 559, 14);
  foe('sprig', 549, 13, 'run2', { face: -1, kw: { torch: true } }); foe('sprig', 555, 13, 'run2', { face: -1, kw: { torch: true } });
  block(557, 558, 13, 13);
  /* (claude/kingsfix2) THE BOUGH BRIDGE (560-599, the escape's one more told beat; Daniel 10-23): the floor under it is ALL burning ground, and the way over it is a road of
     BOUGHS THAT BURN THROUGH - six cracked limbs a gap apart, each one goes a beat after you stand on it (src/tower-collapse.js, the crack and the dust tell it; it is back
     four seconds on). Keep moving and it holds; stop and it is gone under you. A fall is a drop onto the burning floor, not a death: low stumps lead back up (the bough ladder). */
  ground(560, 560 + 39, 14);                                                        /* (its floor burns only under the gaps between the limbs: falling costs the fire's lead and a patch, not the whole run) */
  plank(561, 562, 12);                                                              /* the step up onto the first limb */
  const BR = [[564, 567, 11], [570, 573, 10], [576, 579, 10], [582, 585, 9], [588, 591, 10], [594, 597, 11]];   /* (never more than one row up from limb to limb: the warden's jump is ~1.3 rows from a standing start) */
  for (const [x0, x1, y] of BR) { plank(x0, x1, y); crumbles.push({ x0, x1, row: y, rows: 1, count: 1.05, kind: 'bough' }); }
  plank(568, 569, 12); plank(574, 575, 12); plank(580, 581, 12); plank(586, 587, 12); plank(592, 593, 12); plank(598, 599, 12);   /* the low stumps between the limbs: a hero that fell climbs back up (a hop each) */
  foe('sprig', 584, 8, 'run3', { face: -1, kw: { torch: true }, perch: true });   /* a torch goblin on the fourth limb: he lights it ahead of you */
  coins([566, 10], [572, 9], [578, 9], [584, 8], [590, 9], [596, 10]);
  sign(560, 13, 'THE BOUGHS BURN THROUGH A BEAT AFTER YOU STAND ON THEM. KEEP MOVING.');
  /* THE BURNING RAVINE (the exam): a rise, then three boughs over the burning ravine floor; a torch goblin on the middle bough */
  ground(560 + SH, 568 + SH, 12);
  ground(569 + SH, 584 + SH, 16);
  plank(571 + SH, 575 + SH, 10); plank(578 + SH, 582 + SH, 9); plank(582 + SH, 584 + SH, 14); plank(582 + SH, 584 + SH, 12);   /* (a bough ladder up the ravine's east wall: a fall is a climb out of the fire) */
  foe('sprig', 580 + SH, 8, 'ravine', { face: -1, kw: { torch: true }, perch: true });
  ground(585 + SH, 600 + SH, 10);
  foe('sprig', 589 + SH, 9, 'ravine', { face: -1 });
  coins([573 + SH, 9], [580 + SH, 8], [587 + SH, 9]);
  sign(492, 13, 'THE WOOD BURNS BEHIND YOU. RUN EAST, UP INTO THE BOUGHS OVER THE BURNING GROUND.');
  ent('check', 595 + SH, 9);                                                       /* SHRINE: the wood is behind you - his glade below */

  // ================= 7. THE KING'S GLADE (640-690): KING GORM's LAST STAND (P2) under THE GREAT OAK, half on fire =================
  /* A clearing round the great oak (src/gorm-hands.js drawBack: the trunk, the King's door, the boughs out over the glade, the crown burning on its right),
     his hunting lodge and the stump he uses for a throne. In the oak's boughs hang a LOG TRAP, two CAGES and a BEEHIVE, each on a rope to a PEG on the
     floor: drop them on him - THE LEVEL'S RULE IS HIS LAST OPENING. Down into the glade off the shrine's ledge. */
  ground(600 + SH, 648 + SH, 14);
  for (let x = 603 + SH; x <= 645 + SH; x += 3) ent('carpet', x, 13);
  ent('torch', 603 + SH, 13); ent('torch', 645 + SH, 13);
  block(W - 1, W - 1, 0, H - 1);                                                   /* the world's east edge */

  const [G0, G1] = KINGSWOOD.glade;
  const glade = { x0: G0 * TS, x1: G1 * TS, floor: 14 * TS, trigger: (G0 + 6) * TS, wallL: G0 - 1, wallR: G1 + 1, boss: 'king', music: 'gorm', tint: '#d9583c', tintA: 0.14, fx: 'embers', glade: true };
  /* (claude/gorm2) KING GORM 2's data (src/gorm-hands.js): his hall's ropes, decks, archers' marks and heaps; the burning wood's fire line, burning floors and branches; the glade's oak and hangings */
  const gorm = {
    hall: { x0: A0 * TS, x1: A1 * TS, floor: 14 * TS, order: [1, 3, 0, 4, 2], heaps: [ax(3), ax(53)].map(c => c * TS + 8),
      ropes: HALL_CAGES.map(c => ({ x: ax(c) * TS + 8, pegs: [(ax(c) - 3) * TS + 8, (ax(c) + 3) * TS + 8], deck: [ax(c - 3) * TS, (ax(c + 2) + 1) * TS, 5 * TS], archers: [ax(c - 2) * TS + 8, ax(c + 1) * TS + 8] })) },
    run: { x0: 490 * TS, fireMax: (588 + SH) * TS, cpX: (593 + SH) * TS, surgeAt: 559 * TS, burn: [[512, 541, 14], [568, 569, 14], [574, 575, 14], [580, 581, 14], [586, 587, 14], [592, 593, 14], [598, 599, 14], [569 + SH, 584 + SH, 16]],
      branches: [[496, 14], [503, 14], [510, 14], [519, 10], [528, 10], [537, 11], [545, 14], [553, 14], [566, 11], [575, 12], [583, 9], [590, 10], [579 + SH, 9], [591 + SH, 10]].map(([x, y]) => ({ x: x * TS + 8, y: y * TS })) },
    glade: { trunkX: (624 + SH) * TS + 8, stumpX: (631 + SH) * TS, lodgeX: (606 + SH) * TS, boughs: [[0, 4 * TS, 300, -1], [0, 5 * TS, 330, 1], [0, 2 * TS, 200, -1], [0, 3 * TS, 220, 1]],
      hangs: [{ id: 'gladeLog', kind: 'log', x: (605 + SH) * TS, top: 3 * TS, y0: 8 * TS, pegs: [(609 + SH) * TS + 8], pegY: 14 * TS, roll: 1 },
        { id: 'gladeCageA', kind: 'cage', x: (614 + SH) * TS, top: 4 * TS, y0: 8 * TS, pegs: [(611 + SH) * TS, (617 + SH) * TS], pegY: 14 * TS },
        { id: 'gladeHive', kind: 'hive', x: (627 + SH) * TS, top: 4 * TS, y0: 7 * TS, pegs: [(624 + SH) * TS, (630 + SH) * TS], pegY: 14 * TS },
        { id: 'gladeCageB', kind: 'cage', x: (639 + SH) * TS, top: 5 * TS, y0: 8 * TS, pegs: [(636 + SH) * TS, (642 + SH) * TS], pegY: 14 * TS }] },
  };
  const arena = { x0: A0 * TS, x1: A1 * TS, floor: 14 * TS, trigger: (A0 + 6) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'king', music: 'gorm', tint: '#c9463d', tintA: 0.12, fx: 'embers' };
  const mini = { x0: 176 * TS, x1: 198 * TS, floor: 26 * TS, trigger: 181 * TS, wallL: 175, gate: 199, boss: 'greathound' };
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 39 }, pools: [], falls: [], moversExtra: movers,
    arena, mini, kwood: true, hoists, glade, gorm, lastArena: glade, crumbles, kwoodCrumbles: true,
    reachDoors: [{ x0: 410, x1: 410, y0: 4, y1: 13 }],   /* THE COURT GATE: its plate is on the road's step before it (the fill counts it open) */
    procession: { id: 'court', trigger: 318, exit: 316, dir: -1 },
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 240,                  /* (claude/kingsfix2: the escape is 40 columns longer - shrine four's door to the wood's shrine is 221 columns: no shrine in the run, as before) five shrines, one closing each area's exam (A10c): src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: 416, hi: 489, spots: 0, why: "THE KING'S HALL: columns 416-489 are his arena and the road out - no squad stands in a boss arena" }, { lo: 600 + SH, hi: 649 + SH, spots: 0, why: "THE KING'S GLADE: his last stand - no squad stands in a boss arena" }],
    unlocks: [
      { kind: 'hoists', opens: 'its load: a cage crushes what is under it (and some land as steps), a log span lands as a bridge, a log trap rolls down the road', hud: 'THE ROPE PARTS: IT DROPS' },
      { kind: 'plate', opens: 'its cage falls on what stands under it; the court gate lifts', hud: 'THE CAGE FALLS' },
      { kind: 'lever', opens: 'the hung ram swings through the arch', hud: 'THE RAM SWINGS' },
    ],
    duskStart: -1, duskLen: 1, music: 'kingswood', night: false, glowNight: true,
    interiors: [],
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(200,120,80,0.16)', grass: '#8a7a2a', grassL: '#c9a83a', grassD: '#5a4a1a', dirt: '#4a3020', dirtL: '#5e3f2a', dirtD: '#2c1a10', canopy: ['#7a2a1a', '#a83a2a', '#c9463d', '#e07060'], hall: true },
    weather: [{ x0: 0, x1: 99999, kind: 'leaves' }],
    /* the open wood keeps its birds; the King's hall has its hearth (the next lane gives the court its own bed: horn and drum) */
    ambient: [{ x0: 0, x1: 122 * TS, kind: 'court' }, { x0: 122 * TS, x1: 306 * TS, kind: 'forest' }, { x0: 306 * TS, x1: 416 * TS, kind: 'court' }, { x0: 416 * TS, x1: 99999, kind: 'fire' }],
    /* THE SEAM from the Rootway (its violet-to-amber), then the wood WARMS toward the oak: amber on the road, red-gold in the grove, ember over his hall */
    tints: [[-24, 14, [150, 90, 200], 0.10], [-24, 122, [230, 150, 70], 0.12], [122, 206, [220, 140, 80], 0.12], [206, 306, [220, 110, 70], 0.13], [306, 416, [210, 90, 60], 0.14], [416, W + 24, [200, 70, 50], 0.15]],
    reachExact: false,
  };
}
