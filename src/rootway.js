// src/rootway.js - THE ROOTWAY (claude/rootway, the OPUS GREYBOX, 2026-10-07). Brief: .claude/briefs/brief-rootway.md (scratch/brief-rootway.md),
// the bridge level booked 10-07 between SPOREWOOD and KINGSWOOD (.claude/briefs/bridge-levels-2026-10-01.md #4): the climb up out of the deep
// fungus through giant roots into the canopy, where the goblins' first hoists, lookouts and trophy cages hang.
// This file is the level the game runs, laid by hand (nothing sprinkled); src/rootway-hands.js is its rule and machines, src/huntmaster.js its boss.
//
// THE RULE (L.rule): THE CAPS GROW INTO STEPS; THE GOBLINS' HOISTS DROP WHAT THEY HOLD. STOP ON A BUD TO GROW IT; CUT A HOIST'S ROPE TO DROP ITS LOAD.
//   A BUD is Sporewood's own growcap mover (main.js runs it: stop on one and it rises 56 px under you; a `lean` one carries you over a gap).
//   A HOIST (L.hoists, src/rootway-hands.js): a load on a rope over a pulley, tied off at a CLEAT. Strike the cleat (any blow) - or send an arrow
//   back through its tie-off (`arrow: true`: the cleat is out of every blade's reach) - and the load DROPS:
//     span   a lashed root span: it lands across its gap (L.hoists[i].span = [x0, x1, row]) and stays - a bridge
//     cage   a trophy cage: it crushes what is under it and stays where it lands as a 2x2 block (`land` = its top-left cell) - a step
//     hunter a TROPHY-HUNTER rides it: he lets go himself when you pass under (told); cut it first and he falls dazed
//   EVERY BUD WALL IS FOUR ROWS: a grown cap stands level with its top (no jump climbs four rows; the reach fill rides a bud to its top row).
//   The rope, the cleat and the drop line are drawn (src/rootway-hands.js drawWorld): a dotted plumb line to where the load will land.
//
// FIVE SECTIONS (columns; rows: smaller is higher). The route climbs from row 42 (the fungus floor) to row 18 (the canopy).
//     0-96   THE ROOT CELLAR       TEACH both     a root wall and its bud; a span over a cheap pit; fungus foes
//    96-196  THE GREAT ROOTS       TEST           a leaning cap over a root gap; a cage over two scouts; THE TROPHY-HUNTER (the new foe); a span over a real gap
//   196-296  THE HOIST YARD        REMIX          SET PIECE A, THE TROPHY LARDER (three cages drop onto three stumps: a stair); a cleat you GROW a cap to reach;
//                                                 a hunter hanging over the bud you must grow
//   296-386  THE CANOPY LOOKOUT    EXAM           SET PIECE B, THE LOOKOUT (strike the scout's arrow back through the rope: the span drops); a leaning cap under
//                                                 fire; the arena door
//   386-447  THE HUNTMASTER'S STAND  THE BOSS     src/huntmaster.js
//   447-459  the road out          to KINGSWOOD
export const ROOTWAY = { W: 460, H: 48, floor: 18, arena: [388, 446] };
export const SECTIONS = [['THE ROOT CELLAR', 0, 96], ['THE GREAT ROOTS', 96, 196], ['THE HOIST YARD', 196, 296], ['THE CANOPY LOOKOUT', 296, 386], ["THE HUNTMASTER'S STAND", 386, 460]];
/* each mechanic's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/rootway.mjs and the brief */
export const ARCS = {
  cap: { teach: [20, 36], develop: [96, 116], twist: [228, 270], exam: [330, 352] },        /* the root wall; the leaning cap; the cap to the cleat + the hunter's bud; the leaning cap under fire */
  hoist: { teach: [44, 62], develop: [120, 182], twist: [196, 270], exam: [296, 314] },     /* the span over the pit; the cage on the scouts + the span over the gap; the larder + the high cleat; the lookout */
  arrow: { teach: [296, 314], exam: [388, 446] },                                             /* the lookout (struck back through the rope); the Huntmaster's gold arrows */
};

export function buildRootway({ painter, T, TS }) {
  const { W, H } = ROOTWAY, FL = ROOTWAY.floor;
  const L = painter(W, H), { set, block, ent } = L;
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1);
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const SKINS = { archer: 'gobscout', weaver: 'rootweaver', spider: 'rootspider', lurker: 'rootlurker' };   /* THE ART PASS: the cast wears the roots' colours (cnSkin: a corpse dies in its own skin) - src/redraw/rootway_art.js bakeRootSkins */
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ squad }, SKINS[t] ? { cnSkin: SKINS[t] } : {}, o || {}));
  const glow = (x, y) => ent('glow', x, y);
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v) => ent('deco', x, y, { kind, v: v || 0 });
  const tag = (x, y) => ent('stray', x, y, { kind: 'tag' });            /* A TROPHY TAG: the quest (L.quest) - the hunters' bone tags */
  const caps = [], hoists = [], decor = [], vaultDoors = [];
  /* A BUD (Sporewood's sprout, the same mover): `row` is the ground row it sits on; it spans columns x..x+1 */
  const bud = (x, row, o = {}) => { const rise = o.rise ?? 56, y0 = row * TS - 8; caps.push({ kind: 'growcap', x: x * TS, y: y0, y0, y1: y0 - rise, w: 32, h: 8, rise, state: 'bud', k: 0, ...(o.lean ? { bx: x * TS } : {}), ...o }); };
  /* A HOIST: id, the rope's column `x` (a load is centred on it), its pulley row `top`, the load's bottom row while it hangs `hang`, the CLEAT [x, y]
     (y: the cell a foe would stand in; the cleat's box is that cell and the one over it), and what it holds. */
  const hoist = (id, o) => { hoists.push(Object.assign({ id, cut: false }, o)); if (!o.boss) ent('hoist', o.cleat[0], o.cleat[1], { id }); return o; };   /* (an ent at its cleat: the guide's stuck spots and the tools name it there; src/rootway-hands.js runs the hoist itself from L.hoists) */
  /* A WELL: a gap from column x0 to x1 down to `bottom` (its floor's top row), with a stair of root shelves up its NEAR (west) wall every three rows,
     so a fall costs the climb back and nothing else (A10). The top shelf is three rows under the lip and never within a jump of the far lip. */
  const well = (x0, x1, lip, bottom) => { air(x0, x1, 0, bottom - 1); ground(x0, x1, bottom); let k = 0; for (let r = bottom - 3; r > lip; r -= 3, k++) plank(x0 + (k % 2 ? 3 : 0), x0 + (k % 2 ? 4 : 1), r); };
  /* A CHASM (the fix pass, A10 amended): THE EXAM's gaps have no floor - the canopy is over open air and a fall is THE FALL (back to the checkpoint).
     Told (a sign at the checkpoint before it, a warning post on each near lip), and only where the verb that crosses it was taught over a cheap well first
     (the span: the cellar pit; the leaning cap: the root gap) */
  const chasm = (x0, x1, lip) => { air(x0, x1, 0, H - 1); deco(x0 - 1, lip - 1, 'warnPost', 0); };

  // ================= 1. THE ROOT CELLAR (0-96): TEACH the bud and the hoist, where a miss is cheap =================
  block(0, 0, 0, H - 1);                                                          /* the world's west edge */
  block(1, 70, 0, 25); block(71, 96, 0, 19);                                      /* the cellar's root roof (it lifts as the roots climb) */
  ground(1, 30, 42);
  sign(5, 41, "THE ROOTWAY. UP OUT OF THE FUNGUS, INTO THE GOBLINS' WOOD.");
  glow(8, 41); deco(11, 41, 'sporePod'); glow(18, 41); deco(24, 41, 'tinyCap', 1);
  foe('sporeling', 14, 41, 'cellarA', { face: -1 }); foe('spitcap', 21, 41, 'cellarA', { face: -1 }); foe('weaver', 18, 41, 'cellarA', { face: -1 });   /* (FIX PASS: a weaver in the first squad - Sporewood's own, heavier than fodder) */
  coins([12, 39], [16, 39]);
  plank(5, 13, 39); plank(16, 23, 39); coins([8, 38], [20, 38]);                  /* root shelves over the cellar floor (a second height) */
  ent('vent', 14, 41, { period: 5, on: 1.6, h: 140, phase: 0 }); plank(13, 15, 35); coins([14, 34]); foe('spitcap', 13, 34, 'cellarA', { face: 1 });   /* (FIX PASS: a ranged foe over the road - fire from above that a blade on the floor does not reach, v2) */   /* a spore vent up to a root knot */
  /* THE ROOT WALL: four rows, more than any jump - and a bud at its foot. The first REQUIRED use, with nothing else on it */
  ground(31, 52, 38);
  bud(29, 42); sign(25, 41, 'THE CAPS GROW INTO STEPS. JUMP ONTO A BUD AND STAND STILL: IT RISES UNDER YOU.');
  glow(33, 37); coins([34, 36], [36, 36]); deco(44, 37, 'rootDecor', 1);
  foe('sporeling', 42, 37, 'wallTop', { face: -1 }); foe('lurker', 35, 37, 'wallTop'); foe('spider', 39, 26, 'wallTop', { drop: 180 });   /* (FIX PASS: a spider in the root roof drops on the wall top) */   /* (FIX PASS: a lurker in the wall top where the cap sets you down - a foe at the platforming moment) */
  /* THE FIRST HOIST: a lashed root span hangs over a pit eight wide (no jump crosses it). The pit has a floor and a bud by its near wall that takes
     you back up to the near lip only (the far wall is four rows, and seven columns off the grown cap): a miss costs the climb. Strike the cleat
     and the span drops into place */
  air(53, 60, 26, 41); ground(53, 60, 42); bud(53, 42); foe('spider', 59, 26, 'spanSpider', { drop: 180 });   /* (FIX PASS: a spider over the span's far end: it drops as you cross) */
  hoist('cellarSpan', { x: 57, top: 27, hang: 32, cleat: [51, 37], load: 'span', span: [53, 60, 38] });
  sign(47, 37, 'A GOBLIN HOIST. STRIKE THE CLEAT AND IT DROPS WHAT IT HOLDS.');
  /* (FIX PASS, v2: the roots shed spore clumps where you stop to work a hoist - Sporewood's told drop, on a beat: strike, then step out from under it) */
  ent('rockfall', 49, 26, { spore: true, every: 2.6, tell: 0.9 }); ent('rockfall', 36, 26, { spore: true, every: 3.0, tell: 0.9 });   /* (and on the wall top, where the cap sets you down) */
  ground(61, 75, 38);
  /* (a hollow under the far shelf, in off the pit's floor: a dead end with the first silver - fall in, or drop through the span) */
  air(61, 70, 40, 43); ent('silver', 69, 43); coins([63, 43], [66, 43]); glow(62, 43);
  foe('lurker', 67, 37, 'shelfB'); foe('sporeling', 72, 37, 'shelfB', { face: -1 }); foe('spitcap', 63, 37, 'shelfB', { face: -1 });   /* (FIX PASS: a spitcap on the far lip spits at you as you cut the cleat and cross the span) */
  ent('vent', 64, 37, { period: 4.5, on: 1.6, h: 110, phase: 1 }); plank(63, 65, 33); coins([63, 32], [65, 32]); foe('spitcap', 64, 32, 'shelfB', { face: -1 });   /* a spore vent's puff to a root shelf five rows up (a pocket over the road) */
  plank(66, 74, 35);                                                              /* a root over the shelf */
  ent('rockfall', 75, 20, { spore: true, every: 2.7, tell: 0.9 });   /* (a spore drop at the foot of the three-row step) */
  ground(76, 104, 35);                                                            /* a three-row step: a jump (the cellar's last) */
  plank(80, 90, 32); coins([83, 31], [87, 31]); foe('spitcap', 85, 31, 'stepTop', { face: -1 });
  deco(80, 34, 'mushroom', 1); glow(86, 34);
  foe('spitcap', 88, 34, 'stepTop', { face: -1 }); foe('lurker', 78, 34, 'stepTop'); foe('weaver', 84, 34, 'stepTop', { face: -1 });   /* (FIX PASS: the cellar's end - a lurker where the three-row jump lands you, a sporeling and the spitcap behind it) */
  ent('check', 92, 34);                                                           /* CHECKPOINT ONE */
  deco(96, 34, 'gobPennant', 0);                                                  /* the first goblin mark */

  // ================= 2. THE GREAT ROOTS (96-196): TEST - the leaning cap, a cage on the scouts, THE TROPHY-HUNTER, a span over a real gap =================
  sign(98, 34, 'SOME BUDS LEAN AS THEY GROW. STOP ON ONE AT THE EDGE AND IT CARRIES YOU OVER.');
  well(105, 114, 35, 45);                                                         /* a root gap ten wide; root shelves up its near wall */
  bud(103, 35, { rise: 16, lean: 160, growT: 1.6 }); ent('rockfall', 101, 0, { spore: true, every: 2.8, tell: 0.9 });   /* (a spore drop on the lip where you wait for the cap to lean) */                              /* THE LEANING CAP: it sets you down by the far root */
  ground(115, 128, 35); plank(117, 126, 32);
  foe('lurker', 120, 34, 'rootLurk'); foe('spitcap', 121, 31, 'rootLurk', { face: -1 });   /* (FIX PASS: a spitcap on the root over the landing spits at you as the leaning cap carries you over) */
  /* A TROPHY CAGE over two goblin SCOUTS on the root floor below: strike its cleat from the root above and it crushes them (or fight them) */
  ground(129, 158, 38);
  hoist('scoutCage', { x: 139, top: 23, hang: 30, cleat: [127, 34], load: 'cage', land: [138, 36] });
  sign(124, 34, 'A CAGE HANGS OVER THEM. CUT IT DOWN ON THEIR HEADS.');
  foe('archer', 138, 37, 'scouts', { face: -1 }); foe('archer', 139, 37, 'scouts', { face: -1 });   /* (both under the cage's two columns) */
  deco(131, 37, 'trophyRack'); coins([133, 36], [144, 36]);
  /* THE TROPHY-HUNTER (the one new foe): he rides a hoist down onto you as you pass under - cut its cleat first and he falls dazed */
  plank(143, 151, 35);
  hoist('hunterA', { x: 154, top: 24, hang: 32, cleat: [148, 37], load: 'hunter' }); foe('trophyhunter', 154, 32, 'hoistA', { face: -1, hang: 'hunterA' });
  sign(146, 37, 'A HUNTER RIDES THE HOIST. CUT ITS ROPE AND HE FALLS.'); ent('rockfall', 152, 0, { spore: true, every: 2.9, tell: 0.9 });
  tag(157, 37);                                                                   /* TROPHY TAG ONE, where he hung */
  ground(159, 172, 35); plank(161, 170, 32); foe('archer', 166, 31, 'rootSpit', { face: -1 });   /* (FIX PASS: a ranged foe over the road - fire from above that a blade on the floor does not reach, v2) */
  foe('spitcap', 168, 34, 'rootSpit', { face: -1 }); foe('shield', 164, 34, 'rootSpit', { face: -1 }); glow(162, 34); /* (FIX PASS: heavier, v2) */
  /* A SPAN OVER A REAL GAP: nine wide, a well under it */
  well(173, 181, 35, 45);
  hoist('gapSpan', { x: 177, top: 23, hang: 29, cleat: [171, 34], load: 'span', span: [173, 181, 35] }); ent('rockfall', 169, 0, { spore: true, every: 2.7, tell: 0.9 });
  ground(182, 190, 35); ground(191, 206, 32);
  /* THE GREAT ROOTS' EXAM (FIX PASS, v2 recipe 4): the goblins hold the far side of the span - a SHIELD on the landing, a TROPHY-HUNTER who lunges at you as you
     step off it (knockback by a well), a SCOUT on the root step over them; the checkpoint after them */
  sign(166, 34, 'THE GOBLINS HOLD THE FAR SIDE. DROP THE SPAN, THEN CROSS UNDER THEIR BOW.');
  foe('shield', 188, 34, 'gapGuard', { face: -1 }); foe('trophyhunter', 184, 34, 'gapGuard', { face: -1 }); foe('archer', 191, 31, 'gapGuard', { face: -1 });
  deco(185, 34, 'warnPost', 0); coins([184, 33], [187, 33]);
  ent('check', 193, 31);                                                          /* CHECKPOINT TWO */
  plank(196, 205, 29); foe('archer', 201, 28, 'larderGallery', { face: 1 }); ent('vent', 198, 31, { period: 4.5, on: 1.6, h: 70, phase: 2 }); coins([199, 28], [203, 28]);   /* a vent up to the larder's gallery */

  // ================= 3. THE HOIST YARD (196-296): REMIX - THE TROPHY LARDER, a cleat you grow a cap to reach, a hunter over your bud =================
  /* SET PIECE A, THE TROPHY LARDER: three stumps in a fungus pit, rising four rows each - no jump climbs from one to the next - and a cage hangs over the
     east half of each. Cut a cage down and it lands on its stump as a half-step: stump, cage, next stump, cage, the far lip. All three ropes tie off on the near lip */
  sign(198, 31, 'THE TROPHY LARDER. CUT THE CAGES DOWN ONTO THE STUMPS: THEY MAKE A STAIR.'); ent('rockfall', 203, 0, { spore: true, every: 2.8, tell: 0.9 }); ent('rockfall', 213, 0, { spore: true, every: 3.1, tell: 0.9 });
  air(207, 224, 0, 44); ground(207, 224, 45); for (const r of [42, 39, 36, 33]) plank(207, 208, r);   /* the pit, and root shelves up its near wall (a fall costs the climb) */
  ground(210, 214, 39); ground(215, 219, 35); ground(220, 224, 31);   /* (each stump runs to the next: no one-column slot to fall into between them) */               /* THE STUMPS: tops 39, 35, 31 - four rows apart (the far lip is 27) */
  hoist('larder1', { x: 214, top: 19, hang: 31, cleat: [201, 31], load: 'cage', land: [213, 37] });
  hoist('larder2', { x: 219, top: 17, hang: 27, cleat: [203, 31], load: 'cage', land: [218, 33] });
  hoist('larder3', { x: 224, top: 15, hang: 23, cleat: [205, 31], load: 'cage', land: [223, 29] });   /* (FIX PASS: each cage lands flush against the next stump - no one-column slot between them) */
  decor.push({ kind: 'larder', x0: 207, x1: 224, y: 15 });
  plank(226, 228, 24); plank(229, 231, 21); ent('silver', 230, 20);              /* SILVER TWO: up a root over the far lip (a pocket) */
  coins([210, 37], [215, 33], [220, 29]);
  deco(208, 44, 'skullPile', 0); glow(207, 44);
  foe('sporeling', 209, 44, 'larderPit', { face: -1 });
  ground(225, 238, 27); ent('rockfall', 226, 0, { spore: true, every: 2.8, tell: 0.9 });   /* (on the larder's far lip, where the stair tops out) */
  foe('archer', 231, 26, 'larderBow', { face: -1 }); foe('trophyhunter', 234, 26, 'larderBow', { face: -1 });   /* (FIX PASS: a hunter on the far lip lunges at you as you top the stair) */
  /* A CLEAT ON THE ROOT'S FACE, high over the floor: grow the bud under it and strike it from the cap - the span over the next gap drops */
  bud(237, 27); ground(239, 246, 23); foe('shield', 244, 22, 'highRoot', { face: -1 });   /* (FIX PASS: a shield holds the root by the span: his push is toward the well) */ /* (FIX PASS: the cap stands flush against the root - no one-column corner between them to fall into) */
  hoist('highCleat', { x: 251, top: 12, hang: 17, cleat: [238, 19], load: 'span', span: [247, 255, 23], face: true });
  sign(228, 26, 'THE CLEAT IS HIGH ON THE ROOT. GROW THE CAP UNDER IT, THEN JUMP AND STRIKE.');
  well(247, 255, 23, 35);
  ground(256, 268, 23); plank(256, 261, 20);
  foe('brute', 259, 22, 'yardBrute', { face: -1 }); coins([257, 21], [260, 21]);
  /* A HUNTER HANGS OVER THE BUD YOU MUST GROW (the root wall beyond is four rows): stop on the bud and he drops on you - cut him first */
  bud(267, 23);   /* (FIX PASS: flush against the root wall - no one-column corner between the cap and the wall) */
  hoist('hunterB', { x: 267, top: 6, hang: 12, cleat: [262, 22], load: 'hunter' }); foe('trophyhunter', 267, 12, 'hoistB', { face: -1, hang: 'hunterB' });
  ground(269, 303, 19);
  tag(272, 18);                                                                   /* TROPHY TAG TWO */
  plank(273, 282, 16); plank(288, 296, 16); coins([276, 15], [292, 15]); ent('vent', 295, 18, { period: 4, on: 1.4, h: 90, phase: 1 });   /* the canopy's upper boughs, a vine between them, a vent up to the last */
  /* THE HOIST YARD'S EXAM (FIX PASS, v2 recipe 4): up the hunter's bud into the hunt's pickets - a SHIELD on the root, a SCOUT on the bough over him, the SAPPER's
     bombs behind them; the checkpoint after them */
  sign(270, 18, "THE YARD'S END: THE HUNT'S PICKETS HOLD IT, A BOW ON THE BOUGH OVER THEM.");
  foe('sapper', 284, 18, 'yardExam', { face: -1 }); foe('shield', 279, 18, 'yardExam', { face: -1 }); foe('archer', 277, 15, 'yardExam', { face: -1 }); foe('trophyhunter', 287, 18, 'yardExam', { face: -1 }); deco(278, 18, 'hangCage', 0);
  ent('check', 290, 18);                                                          /* CHECKPOINT THREE */

  // ================= 4. THE CANOPY LOOKOUT (296-386): THE EXAM =================
  /* SET PIECE B, THE LOOKOUT: a scout on a lookout across a chasm eight wide; the bridge span hangs on a hoist whose tie-off runs down past his
     post to a cleat no blade reaches. Strike his arrow back: it flies home through the rope and the span drops. (If he falls, another takes the post) */
  sign(297, 18, 'HE CANNOT MISS FROM THERE. STRIKE HIS ARROW BACK: IT FLIES HOME THROUGH THE ROPE.');
  /* (FIX PASS, THE EXAM: a TROPHY-HUNTER hangs over the lookout's near lip - he rides down BEHIND you as you wait for the arrow, and his lunge drives you at the
     chasm. Told as every hunter is (the creak, the '!'); taught at hunter A and the hunter's bud; cut his cleat first and he falls dazed) */
  hoist('hunterC', { x: 301, top: 5, hang: 11, cleat: [298, 18], load: 'hunter' }); foe('trophyhunter', 301, 11, 'lookoutHunter', { face: 1, hang: 'hunterC' });
  sign(292, 18, 'NO ROOTS UNDER THE CANOPY: FROM HERE A FALL IS THE END.');
  chasm(304, 311, 19); ent('rockfall', 302, 0, { spore: true, every: 2.6, tell: 0.9 });   /* (THE EXAM: a spore drop on the lip where you wait for his arrow) */                                                            /* THE EXAM's first gap: no floor (A10 amended) */
  ground(312, 340, 19);
  plank(314, 318, 16); decor.push({ kind: 'lookout', x0: 313, x1: 319, y: 16 });
  hoist('lookout', { x: 308, top: 8, hang: 13, cleat: [312, 15], load: 'span', span: [304, 311, 19], arrow: true, post: [316, 15] });
  foe('archer', 316, 15, 'lookout', { face: -1, lookout: true });
  coins([314, 17], [318, 17]); tag(338, 18); plank(322, 336, 16); ent('rockfall', 320, 0, { spore: true, every: 2.6, tell: 0.9 });                                      /* TROPHY TAG THREE: past the lookout, on the root road */
  foe('shield', 328, 18, 'roadGuard', { face: -1 }); foe('trophyhunter', 334, 18, 'roadGuard', { face: -1 }); foe('archer', 322, 15, 'roadGuard', { face: -1 });   /* (FIX PASS: a bow on the root over the road) */
  /* the leaning cap over a gap, under a scout's fire from a perch past it */
  chasm(341, 350, 19); ent('rockfall', 337, 0, { spore: true, every: 2.9, tell: 0.9 });                                                            /* THE EXAM's last gap: no floor (A10 amended) */
  bud(339, 19, { rise: 16, lean: 160, growT: 1.6 });
  ground(351, 387, 19);
  plank(355, 359, 15); foe('archer', 357, 14, 'perchBow', { face: -1 }); foe('archer', 366, 18, 'perchBow', { face: -1 });   /* (FIX PASS: two bows on the cap's ride: a hit knocks you off it) */
  foe('spitcap', 362, 18, 'lastCap', { face: -1 }); foe('trophyhunter', 354, 18, 'lastCap', { face: -1 });   /* (FIX PASS: a hunter where the last leaning cap sets you down, by the chasm) */                               /* the last of the fungus */
  /* THE TROPHY LOFT (the vault): the hunters' store in a hollow root over the road - four tags open its door (E at it): a silver */
  block(364, 372, 8, 13); air(365, 371, 9, 12); plank(373, 376, 13); plank(377, 379, 16);
  for (let y = 9; y <= 12; y++) set(372, y, T.SOLID); vaultDoors.push({ x0: 372, x1: 372, y0: 9, y1: 12 });
  ent('loft', 374, 12); ent('silver', 366, 12); tag(376, 12);                        /* TROPHY TAG FOUR: on the loft's step */
  foe('shield', 374, 18, 'doorGuard', { face: -1 }); foe('archer', 379, 18, 'doorGuard', { face: -1 });
  ent('rockfall', 381, 0, { spore: true, every: 2.7, tell: 0.9 });
  sign(381, 18, "THE HUNTMASTER'S STAND. HIS GOLD ARROWS COME BACK TO HIM. HIS RED ONES DO NOT.");
  ent('check', 384, 18);                                                          /* CHECKPOINT FOUR: the door */
  for (const [fx, fy] of [[140, 37], [222, 28], [300, 18], [352, 18]]) decor.push({ kind: 'goldArrow', x: fx, y: fy });   /* his gold-fletched arrows stand in the roots (B8) */

  // ================= 5. THE HUNTMASTER'S STAND (388-446) =================
  const [A0, A1] = ROOTWAY.arena;
  for (const cx of [387, 447]) for (let y = 0; y < FL - 6; y++) set(cx, y, T.SOLID);   /* the root walls over his two doors */
  ground(A0, A1, FL); ground(447, 459, FL);
  plank(A0 + 4, A0 + 10, FL - 4); plank(A1 - 10, A1 - 4, FL - 4);               /* THE ROOT PERCHES (he leaps to them; a bud under each, so do you) */
  bud(A0 + 6, FL); bud(A1 - 8, FL);
  hoist('hmL', { x: A0 + 7, top: 0, hang: FL - 9, cleat: [A0 + 12, FL - 4], load: 'cage', boss: true });   /* (FIX PASS: the perch cages tie off on the arena side of their perch - a few strides from the floor's middle, so the cage is an opening a hero reaches in his perch time -
     at the perch's height: a JUMP and a cut, never a blow that strays off a floor fight and drops the cage on nothing) */
  hoist('hmM', { x: Math.floor((A0 + A1) / 2), top: 0, hang: FL - 7, cleat: [Math.floor((A0 + A1) / 2) - 3, FL - 4], load: 'cage', boss: true });
  hoist('hmR', { x: A1 - 6, top: 0, hang: FL - 9, cleat: [A1 - 12, FL - 4], load: 'cage', boss: true });
  ent('huntmaster', A1 - 14, FL - 1, { face: -1 });
  const arena = { x0: A0 * TS, x1: (A1 + 1) * TS, floor: FL * TS, trigger: (A0 + 4) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'huntmaster', music: 'boss3', tint: '#c89040', tintA: 0.06,
    start: [A0 + 6, FL - 1], huntmaster: true, perches: [[A0 + 4, A0 + 10, FL - 4], [A1 - 10, A1 - 4, FL - 4]] };
  ent('gate', 456, FL - 1);

  const START = { x: 3, y: 41 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: caps.concat([{ kind: 'swing', px: 285 * TS + 8, py: 9 * TS, arm: 80, x: 0, y: 0, w: 32, h: 8, period: 3.2, phase: 0.5, vine: true }]),   /* a root vine between the canopy's upper boughs (a second way along them, never the only one) */
    arena, gateAfterBoss: true, rootway: true, hoists, decor, vaultDoors,
    squadBands: [{ lo: 386, hi: 459, spots: 0, why: "THE HUNTMASTER'S STAND: columns 386-459 are his arena and the road out - no squad stands in a boss arena (as the sky road)" }],
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,                  /* four checkpoints (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    quest: { n: 4, item: 'tag', name: 'TROPHY TAGS', done: 'FOUR TAGS: TAKE THEM TO THE TROPHY LOFT', thanks: 'THE TROPHY LOFT OPENS' },
    unlocks: [
      { kind: 'stray', opens: 'THE TROPHY LOFT (a silver) once all four trophy tags are brought to it', hud: 'TROPHY TAGS n/4 (the quest counter); at the loft: THE LOFT WANTS FOUR TAGS' },
      { kind: 'loft', opens: 'THE TROPHY LOFT (a silver)', hud: 'THE TROPHY LOFT OPENS' },
      { kind: 'hoists', opens: 'its load: a span lands across its gap (a bridge), a cage lands as a step, a hunter falls', hud: 'THE HOIST DROPS WHAT IT HOLDS' },
    ],
    music: 'rootway',   /* "Lanterns in the Hollowed Forest" by Tsorthan Grove, CC0 (audio/CREDITS.txt); the Huntmaster keeps his composed boss3 */
    ambient: [{ x0: 0, x1: 200 * TS, kind: 'drip' }, { x0: 200 * TS, x1: 99999, kind: 'wind' }],   /* the fungus drips at the foot; the canopy's wind at the top (the art pass: its own bed) */
    weather: [{ x0: 0, x1: 180 * TS, kind: 'spore' }],
    palette: { sky: [[64, 96, 112], [196, 168, 120]], noNear: true, noFg: true, near: 'mushroom', myc: true, dress: 'myc', haze: 'rgba(150,130,120,0.18)', grass: '#5a8a3a', grassL: '#8ac050', grassD: '#34562a', dirt: '#4a3a30', dirtL: '#5e4a3a', dirtD: '#33261e', canopy: ['#2a1f38', '#4e3a50', '#8a5a3a', '#c88a3a'] },
    /* THE SEAM IT CARRIES: the fungus violet at its foot, warming through the climb into Kingswood's autumn amber in the canopy (L.tints crossfade over 24 columns) */
    tints: [[0, 120, [150, 90, 200], 0.14], [120, 220, [190, 120, 150], 0.10], [220, 320, [220, 140, 90], 0.12], [320, W + 24, [230, 150, 70], 0.15]],
    duskStart: -1, duskLen: 1, night: false, glowNight: true,
    reachExact: false,
  };
}
