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
// FIVE NAMED AREAS (claude/rootway2, Daniel 2026-10-09: "concept not bad, could use some work" - the level was repetitive; each area now has its own character, A8/A4).
// Columns; rows: smaller is higher. The route climbs from row 42 (the fungus floor) to row 18 (the canopy).
//     0-96   THE ROOT CELLAR       TEACH    dark, under the fungus line, lit by spore glow: a bud against a root wall (safe), a span over a cheap pit (the hoist taught)
//    96-196  THE HOLLOW TRUNK      TEST     a vertical climb up the inside of a hollow trunk: buds against root shelves, Sporewood's SPRING CAP, the LEANING CAP across the shaft;
//                                           the goblins hold the knothole (an elite); out on the bough, THE TROPHY LINE taught (optional)
//   196-303  THE HUNTERS' GANTRY  REMIX    the hoists remixed with the zip lines: THE TROPHY LARDER (three cages, a stair), the high cleat (grow a cap to reach it), a hunter over
//                                           your bud, THE GANTRY (a cage for a step, the trophy line over the well)
//   303-360  THE CANOPY SNARES     TEACH THE BOSS  his archers on root ledges (THE LOOKOUT: strike the arrow back through the rope), his JAW TRAPS (jump them or throw a pod),
//                                           his NETS (roll through), the leaning cap over a real fall
//   360-388  THE TROPHY LODGE      EXAM     his lodge: the section exam (an elite among traps and a net), the shrine, his door
//   388-447  THE HUNTMASTER'S STAND  THE BOSS  src/huntmaster.js
//   447-459  the road out          to KINGSWOOD
export const ROOTWAY = { W: 460, H: 48, floor: 18, arena: [388, 446] };
export const SECTIONS = [['THE ROOT CELLAR', 0, 96], ['THE HOLLOW TRUNK', 96, 196], ["THE HUNTERS' GANTRY", 196, 303], ['THE CANOPY SNARES', 303, 360], ['THE TROPHY LODGE', 360, 388], ["THE HUNTMASTER'S STAND", 388, 460]];   /* (claude/rootway2, Daniel 10-09: five named areas, each its own character, then the stand) */
/* each mechanic's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/rootway.mjs and the brief */
export const ARCS = {
  cap: { teach: [20, 36], develop: [100, 150], twist: [228, 270], exam: [330, 352] },        /* the root wall; the trunk (buds, the spring cap, the lean); the cap to the cleat + the hunter's bud; the leaning cap over the fall */
  hoist: { teach: [44, 62], develop: [196, 240], twist: [240, 300], exam: [296, 314] },     /* the span over the pit; the larder; the high cleat + the gantry; the lookout */
  arrow: { teach: [296, 314], exam: [388, 446] },                                             /* the lookout (struck back through the rope); the Huntmaster's gold arrows */
  snare: { teach: [312, 332], develop: [350, 360], exam: [360, 388] },                        /* (claude/rootway2) the jaw traps and the net on the canopy road; the net at the last cap; the lodge exam - then he sets them himself */
  zip: { teach: [163, 186], exam: [276, 292] },                                               /* the trophy line off the bough (optional); the gantry's (required) */
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
  const caps = [], hoists = [], decor = [], vaultDoors = [], zips = [], podCaps = [], jaws = [], nets = [];   /* (claude/rootway2: the spore pods' caps, the jaw traps and the nets - src/hunt-pods.js, src/snares.js) */
  /* A TROPHY LINE (src/zipline.js, claude/ziproot): from the deck at column x0 (standing row top) down to column x1 (landing floor row endRow); the rope hangs 12 px over the feet at each end */
  const rope = (x0, top, x1, endRow, groundRow) => ({ x0: x0 * TS + 8, y0: top * TS - 12, x1: x1 * TS + 8, y1: endRow * TS - 12, posts: [[x0 * TS + 8, top * TS - 12, top * TS], [x1 * TS + 8, endRow * TS - 12, groundRow * TS]] });
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
  set(20, 41, T.BOUNCER); coins([20, 36], [20, 33]); sign(9, 41, 'A SPRING CAP. LAND ON IT AND IT THROWS YOU UP: HOLD JUMP FOR HIGHER.');   /* (claude/rootway2) SPOREWOOD's SPRING CAP, taught safe under the cellar roof: up through the root shelf, a coin column */
  ent('vent', 14, 41, { period: 5, on: 1.6, h: 140, phase: 0 }); plank(13, 15, 35); coins([14, 34]); foe('spitcap', 13, 34, 'cellarA', { perch: true, face: 1 });   /* (FIX PASS: a ranged foe over the road - fire from above that a blade on the floor does not reach, v2) */   /* a spore vent up to a root knot */
  /* THE ROOT WALL: four rows, more than any jump - and a bud at its foot. The first REQUIRED use, with nothing else on it */
  ground(31, 52, 38);
  bud(29, 42); sign(25, 41, 'THE CAPS GROW INTO STEPS. JUMP ONTO A BUD AND STAND STILL: IT RISES UNDER YOU.');
  glow(33, 37); coins([34, 36], [36, 36]); deco(44, 37, 'rootDecor', 1);
  foe('sporeling', 42, 37, 'wallTop', { face: -1 }); foe('trophyhunter', 47, 37, 'wallTop', { face: -1 });   /* (claude/rootway2, v2: the hunters have come down into the cellar - a lunge where the bud sets you down) */ foe('lurker', 35, 37, 'wallTop'); foe('spider', 39, 26, 'wallTop', { perch: true, drop: 180 });   /* (FIX PASS: a spider in the root roof drops on the wall top) */   /* (FIX PASS: a lurker in the wall top where the cap sets you down - a foe at the platforming moment) */
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
  foe('lurker', 67, 37, 'shelfB'); foe('sporeling', 72, 37, 'shelfB', { face: -1 }); foe('spitcap', 63, 37, 'shelfB', { face: -1 }); foe('shield', 70, 37, 'shelfB', { face: -1 });   /* (FIX PASS: a spitcap on the far lip spits at you as you cut the cleat and cross the span) */
  ent('vent', 64, 37, { period: 4.5, on: 1.6, h: 110, phase: 1 }); plank(63, 65, 33); coins([63, 32], [65, 32]); foe('spitcap', 64, 32, 'shelfB', { perch: true, face: -1 });   /* a spore vent's puff to a root shelf five rows up (a pocket over the road) */
  plank(66, 74, 35);                                                              /* a root over the shelf */
  ent('rockfall', 75, 20, { spore: true, every: 2.7, tell: 0.9 });   /* (a spore drop at the foot of the three-row step) */
  ground(76, 104, 35);                                                            /* a three-row step: a jump (the cellar's last) */
  plank(80, 90, 32); coins([83, 31], [87, 31]); foe('spitcap', 85, 31, 'stepTop', { perch: true, face: -1 });
  deco(80, 34, 'mushroom', 1); glow(86, 34);
  foe('spitcap', 88, 34, 'stepTop', { face: -1 }); foe('lurker', 78, 34, 'stepTop'); foe('weaver', 84, 34, 'stepTop', { face: -1 });   /* (FIX PASS: the cellar's end - a lurker where the three-row jump lands you, a sporeling and the spitcap behind it) */
  ent('check', 92, 34);                                                           /* CHECKPOINT ONE */
  deco(96, 34, 'gobPennant', 0);                                                  /* the first goblin mark */

  // ================= 2. THE HOLLOW TRUNK (96-196): the bud TESTED - a climb up the inside of a great hollow trunk (claude/rootway2, Daniel 10-09) =================
  /* In at its foot, up its insides, out at THE KNOTHOLE near its top: a bud against a root shelf (four rows - no jump), Sporewood's SPRING CAP (jump onto it: it throws you up
     through a root plank), a bud on the plank against the high shelf, and the LEANING CAP across the shaft to the knothole's ledge. Every miss is a fall to a shelf or the
     hollow's floor (cheap: the climb again). The fungus is still thick down here and thins as you climb; spore pods and puffballs in the dark (L.darkZones) */
  sign(98, 34, 'THE HOLLOW TRUNK. THE CAPS GROW INTO STEPS: CLIMB ITS INSIDES TO THE KNOTHOLE.');
  block(103, 110, 0, 31);                                                         /* the trunk's west wall: in at its foot (rows 32-34) */
  ground(105, 150, 35);                                                           /* the hollow's floor */
  block(111, 150, 0, 6);                                                          /* the trunk goes on up over you */
  block(151, 156, 0, H - 1); air(151, 156, 19, 22);                               /* its east wall, and THE KNOTHOLE near its top */
  glow(108, 34); glow(119, 34); glow(131, 34); deco(114, 34, 'sporePod'); deco(124, 34, 'tinyCap', 1); deco(136, 34, 'mushroom', 1);
  ent('puffball', 121, 34); foe('sporeling', 116, 34, 'trunkFloor', { face: -1 }); foe('weaver', 129, 34, 'trunkFloor', { face: -1 });
  ent('vent', 126, 34, { period: 4.5, on: 1.6, h: 96, phase: 1 }); coins([126, 31], [126, 29]);                          /* a puff of spores up to a few coins (a lift to nowhere: the way is the caps) */
  /* TIER ONE: a bud against the first root shelf, four rows up */
  bud(139, 35); block(141, 150, 31, 34);
  /* TIER TWO: a second bud on the shelf against the next one up (four rows), and the root plank west off it */
  bud(143, 31); block(145, 150, 27, 30); foe('trophyhunter', 148, 26, 'trunkShelf', { face: -1 });   /* (v2: a weighty foe where the cap sets you down - his lunge throws you back down the shaft) */
  foe('lurker', 142, 30, 'trunkShelf');
  /* SPOREWOOD's SPRING CAPS on the hollow's floor (the climb's side-show: a bounce up a coin column under the high shelf - hold jump and they throw you higher) */
  set(116, 35, T.BOUNCER); set(117, 35, T.BOUNCER); coins([116, 31], [117, 29], [116, 28]);
  plank(134, 144, 27); foe('spider', 136, 9, 'trunkShelf', { perch: true, drop: 200 }); ent('rockfall', 138, 7, { spore: true, every: 2.8, tell: 0.9 });   /* (spores shed from the trunk's insides where you land) */
  /* TIER THREE: a bud on the plank's end against the high shelf (four rows) */
  bud(134, 27); block(111, 133, 23, 26); foe('spider', 122, 8, 'trunkHigh', { perch: true, drop: 180 }); foe('archer', 116, 22, 'trunkHigh', { face: 1 }); foe('spitcap', 128, 22, 'trunkHigh', { face: 1 });
  tag(112, 22);                                                                   /* TROPHY TAG ONE, at the high shelf's back (off the road: a step aside) */
  /* TIER FOUR: THE LEANING CAP across the shaft to the knothole's ledge (ten wide: no jump) - the first real test of the lean, over the plank and the floor */
  bud(132, 23, { rise: 16, lean: 160, growT: 1.6 }); sign(126, 22, 'THIS CAP LEANS. STOP ON IT AT THE EDGE AND IT CARRIES YOU ACROSS.');
  block(144, 150, 23, 24); ent('rockfall', 147, 7, { spore: true, every: 2.9, tell: 0.9 });
  /* THE HOLLOW TRUNK's EXAM (v2 recipe 4): the goblins hold the knothole - a SHIELD CAPTAIN on the ledge the leaning cap sets you down on (level.js ELITES, gate 157:
     a knock-back is a fall into the shaft, cheap but the climb again), a TROPHY-HUNTER in the knothole behind him, a bow on the bough outside */
  foe('shield', 147, 22, 'knothole', { face: -1 }); foe('trophyhunter', 154, 22, 'knothole', { face: -1 }); foe('archer', 161, 22, 'knothole', { face: -1 });
  sign(145, 22, 'THE GOBLINS HOLD THE KNOTHOLE. THE WAY OUT IS THROUGH THEM.');
  /* OUT ON THE BOUGH: root steps down to the road, and THE TROPHY LINE, TAUGHT (claude/ziproot): from the bough's deck down to the road - UP takes the
     handle, the line carries you down. Optional (the steps walk down); a miss costs nothing; no foe at its landing */
  ground(157, 162, 23); plank(163, 168, 23); ground(167, 170, 26); ground(171, 174, 29); ground(175, 190, 32);
  zips.push(rope(168, 23, 186, 32, 32)); sign(164, 22, 'A TROPHY LINE. UP TAKES THE HANDLE; IT CARRIES YOU DOWNHILL. JUMP LETS GO, DOWN DROPS.'); coins([171, 24], [175, 26], [179, 28]);
  deco(158, 22, 'gobPennant', 1); deco(176, 31, 'trophyRack'); glow(188, 31);
  ground(191, 206, 32);
  ent('check', 193, 31);                                                          /* CHECKPOINT TWO */
  plank(196, 205, 29); foe('archer', 201, 28, 'larderGallery', { face: 1 }); ent('vent', 198, 31, { period: 4.5, on: 1.6, h: 70, phase: 2 }); coins([199, 28], [203, 28]);   /* a vent up to the larder's gallery */

  // ================= 3. THE HUNTERS' GANTRY (196-303): REMIX - the hoists and the zip lines: THE TROPHY LARDER, a cleat you grow a cap to reach, a hunter over your bud, THE GANTRY =================
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
  foe('archer', 231, 26, 'larderBow', { face: -1 }); foe('trophyhunter', 234, 26, 'larderBow', { face: -1 }); foe('shield', 227, 26, 'larderBow', { face: -1 });   /* (claude/rootway2, v2: a shield where the stair tops out - his push is back down the larder) */   /* (FIX PASS: a hunter on the far lip lunges at you as you top the stair) */
  /* A CLEAT ON THE ROOT'S FACE, high over the floor: grow the bud under it and strike it from the cap - the span over the next gap drops */
  bud(237, 27); ground(239, 246, 23); foe('shield', 244, 22, 'highRoot', { face: -1 });   /* (FIX PASS: a shield holds the root by the span: his push is toward the well) */ /* (FIX PASS: the cap stands flush against the root - no one-column corner between them to fall into) */
  hoist('highCleat', { x: 251, top: 12, hang: 17, cleat: [238, 19], load: 'span', span: [247, 255, 23], face: true });
  sign(228, 26, 'THE CLEAT IS HIGH ON THE ROOT. GROW THE CAP UNDER IT, THEN JUMP AND STRIKE.');
  well(247, 255, 23, 35);
  ground(256, 268, 23); plank(256, 261, 20);
  foe('brute', 259, 22, 'yardBrute', { face: -1 }); foe('spitcap', 258, 19, 'yardBrute', { perch: true, face: -1 }); coins([257, 21], [260, 21]);
  /* A HUNTER HANGS OVER THE BUD YOU MUST GROW (the root wall beyond is four rows): stop on the bud and he drops on you - cut him first */
  bud(267, 23);   /* (FIX PASS: flush against the root wall - no one-column corner between the cap and the wall) */
  hoist('hunterB', { x: 267, top: 6, hang: 12, cleat: [262, 22], load: 'hunter' }); foe('trophyhunter', 267, 12, 'hoistB', { face: -1, hang: 'hunterB' });
  ground(269,303,19);
  tag(269,18);                                                                   /* TROPHY TAG TWO */
  /* THE HUNTERS' GANTRY (claude/ziproot, Daniel 2026-10-08: ZIP LINES): the road's last stretch is a well ten wide with a ledge a storey under the far lip. The hunters' trophy line
     hangs from a gantry five rows over the road - no jump reaches it - and a CAGE hangs over the road at its foot: cut it down and it lands on a root stump as a two-row step (stump, cage, gantry, ledge).
     UP takes the handle and the line carries you over the well to the ledge, where the hunt holds the landing; the ledge's bud grows you up the root wall to the road. A miss is a
     fall into the well (a shelf stair up its near wall, A10). The bow on the bough over the road covers the line. */
  sign(270,18,"THE GANTRY. CUT THE CAGE DOWN FOR A STEP: THE TROPHY LINE CARRIES YOU OVER THE WELL.");
  air(281, 290, 0, 26); ground(281, 290, 27); plank(281, 282, 24); plank(281, 282, 21);                                                             /* the well, and root shelves up its near wall (a fall costs the climb) */
  hoist('gantry', { x: 275, top: 9, hang: 13, cleat: [271,18], load: 'cage', land: [274,16] });
  ground(273, 275, 18);                                                            /* a root stump under the cage's place: one row up from the road (a step), and the cage lands on it - road, stump, cage, gantry: 1 + 2 + 2 rows, nothing taller than a jump */
  coins([277,13],[279,13]); foe('shield', 276, 18, 'yardExam', { face: -1 });   /* (the yard's shield captain: level.js ELITES upgrades him; the squad spans the road and the landing - one fight) */
  plank(276,280,14);   /* THE GANTRY, a hunters' deck over the road (rope + 12 = feet) */
  air(291, 296, 19, 22); ground(291, 296, 23);                                          /* THE LEDGE a storey under the far lip, and the root wall to the road (the ledge's bud, flush against it) */
  bud(295,23);
  zips.push(rope(279,14,292,23,23));                                               /* the trophy line: gantry to ledge (the hero's feet = rope + 12) */
  foe('trophyhunter', 294, 22, 'yardExam', { face: -1 }); deco(291,22,'warnPost',0); glow(293,22);   /* THE LANDING: the hunter holds the ledge and a bow covers the line (difficulty v2: a foe at the landing) */
  coins([284,13],[287,14],[290,16]);                                               /* a trail of trophies along the line */
  ent('check', 299, 18);                                                          /* CHECKPOINT THREE */
  deco(278, 13, 'hangCage', 0);

  // ================= 4. THE CANOPY SNARES (303-360): the Huntmaster's moves TAUGHT in his own branches (claude/rootway2, B8: the approach sets him up) =================
  /* his archers on root ledges (the lookout: strike the arrow back), his JAW TRAPS on the bough (jump them, or take a SPORE POD and throw it on one - src/snares.js, src/hunt-pods.js),
     his NETS coiled in the branches (they drop as you pass under: roll through) - each met here, where it is cheap, before he uses it on you. The exam's gaps are real falls */
  /* SET PIECE B, THE LOOKOUT: a scout on a lookout across a chasm eight wide; the bridge span hangs on a hoist whose tie-off runs down past his
     post to a cleat no blade reaches. Strike his arrow back: it flies home through the rope and the span drops. (If he falls, another takes the post) */
  sign(302, 18, 'HE CANNOT MISS FROM THERE. STRIKE HIS ARROW BACK: IT FLIES HOME THROUGH THE ROPE.');
  /* (FIX PASS, THE EXAM: a TROPHY-HUNTER hangs over the lookout's near lip - he rides down BEHIND you as you wait for the arrow, and his lunge drives you at the
     chasm. Told as every hunter is (the creak, the '!'); taught at hunter A and the hunter's bud; cut his cleat first and he falls dazed) */
  hoist('hunterC', { x: 301, top: 5, hang: 11, cleat: [298, 18], load: 'hunter' }); foe('trophyhunter', 301, 11, 'lookoutHunter', { face: 1, hang: 'hunterC' });
  sign(301, 18, 'NO ROOTS UNDER THE CANOPY: FROM HERE A FALL IS THE END.');
  chasm(304, 311, 19); ent('rockfall', 302, 0, { spore: true, every: 2.6, tell: 0.9 });   /* (THE EXAM: a spore drop on the lip where you wait for his arrow) */                                                            /* THE EXAM's first gap: no floor (A10 amended) */
  ground(312, 340, 19);
  plank(314, 318, 16); decor.push({ kind: 'lookout', x0: 313, x1: 319, y: 16 });
  hoist('lookout', { x: 308, top: 8, hang: 13, cleat: [312, 15], load: 'span', span: [304, 311, 19], arrow: true, post: [316, 15] });
  foe('archer', 316, 15, 'lookout', { face: -1, lookout: true });
  coins([314, 17], [318, 17]); tag(338, 18); plank(322, 336, 16);                                      /* TROPHY TAG THREE: past the lookout, on the root road */
  /* THE SNARES, TAUGHT: a pod cap, two jaw traps on the root road (jump them, or spring one with a pod), then a NET coiled under the root over the road */
  podCaps.push([313, 19]); jaws.push([320, 19], [325, 19]); sign(318, 18, 'JAW TRAPS. JUMP THEM - OR TAKE A POD (E) AND THROW IT ON ONE: IT SNAPS ON NOTHING.');
  nets.push({ x0: 329, x1: 331, row: 19, top: 17 }); sign(327, 18, 'A NET HANGS OVER THE ROAD. WHEN IT CREAKS, ROLL THROUGH IT.');
  foe('shield', 334, 18, 'roadGuard', { face: -1 }); foe('trophyhunter', 337, 18, 'roadGuard', { face: -1 }); foe('archer', 323, 15, 'roadGuard', { perch: true, face: -1 });   /* (a bow on the root ledge over the traps: v2, a foe at the platforming moment) */   /* (FIX PASS: a bow on the root over the road) */
  /* the leaning cap over a gap, under a scout's fire from a perch past it */
  chasm(341, 350, 19); ent('rockfall', 337, 0, { spore: true, every: 2.9, tell: 0.9 });                                                            /* THE EXAM's last gap: no floor (A10 amended) */
  bud(339, 19, { rise: 16, lean: 160, growT: 1.6 });
  ground(351, 387, 19);
  plank(355, 359, 15); foe('archer', 357, 14, 'lastCap', { perch: true, face: -1 }); foe('archer', 366, 18, 'lastCap', { face: -1 });   /* (FIX PASS: two bows on the cap's ride: a hit knocks you off it) */
  foe('spitcap', 362, 18, 'lastCap', { face: -1 }); foe('trophyhunter', 354, 18, 'lastCap', { face: -1 });   /* (FIX PASS: a hunter where the last leaning cap sets you down, by the chasm) */                               /* the last of the fungus */
  /* THE TROPHY LOFT (the vault): the hunters' store in a hollow root over the road - four tags open its door (E at it): a silver */
  block(364, 372, 8, 13); air(365, 371, 9, 12); plank(373, 376, 13); plank(377, 379, 16);
  for (let y = 9; y <= 12; y++) set(372, y, T.SOLID); vaultDoors.push({ x0: 372, x1: 372, y0: 9, y1: 12 });
  ent('loft', 374, 12); ent('silver', 366, 12); tag(376, 12);                        /* TROPHY TAG FOUR: on the loft's step */
  nets.push({ x0: 357, x1: 359, row: 19, top: 16 });                             /* (a net under the bow's perch where the last cap sets you down) */
  // ================= 5. THE TROPHY LODGE (360-388): his lodge - trophies, skins, his horn on the wall - THE SECTION EXAM, the shrine, then his stand =================
  sign(361, 18, 'THE TROPHY LODGE. HIS TROPHIES ON THE WALLS - AND HIS SNARES ON THE FLOOR.'); deco(362, 18, 'trophyRack'); deco(370, 18, 'skullTotem'); deco(383, 18, 'boneChime');
  /* THE EXAM (v2 recipe 4): a SHIELD CAPTAIN (level.js ELITES) on the lodge floor between two jaw traps, a net over him, a bow on the loft's step - every one of the Huntmaster's
     tools at once, a pod cap at the lodge door to spring them; THE SHRINE after (checkpoint four, the stand's door) */
  podCaps.push([363, 19]); jaws.push([368, 19], [379, 19]); nets.push({ x0: 374, x1: 376, row: 19, top: 14 });
  foe('shield', 372, 18, 'lodgeExam', { face: -1 }); foe('trophyhunter', 376, 18, 'lodgeExam', { face: -1 }); foe('archer', 378, 15, 'lodgeExam', { perch: true, face: -1 });
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
  const arena = { x0: A0 * TS, x1: (A1 + 1) * TS, floor: FL * TS, trigger: (A0 + 4) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'huntmaster', music: 'huntmaster', tint: '#c89040', tintA: 0.06,
    start: [A0 + 6, FL - 1], huntmaster: true, perches: [[A0 + 4, A0 + 10, FL - 4], [A1 - 10, A1 - 4, FL - 4]] };
  ent('gate', 456, FL - 1);
  /* (claude/rootway2) THE STAND's POD CAPS: a ripe spore pod at each wall (E takes it, ATTACK throws it - src/hunt-pods.js): on him, his long stagger; on a jaw trap he set, it springs it */
  podCaps.push([A0 + 1, FL], [A1 - 1, FL]);

  const START = { x: 3, y: 41 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: caps,
    arena, gateAfterBoss: true, rootway: true, podCaps, jaws, nets, hoists,
    darkLocal: true, darkZones: [{ x0: 0, x1: 102 * TS, y0: 0, y1: H * TS, dark: 0.55, name: 'THE ROOT CELLAR' }, { x0: 103 * TS, x1: 157 * TS, y0: 21 * TS, y1: H * TS, dark: 0.35, name: 'THE HOLLOW TRUNK' }],   /* (claude/rootway2) the cellar under the fungus line is DARK - its spore glow is its light; the trunk's foot is dim. darkLocal: main.js's dark pass runs in these zones only (L.dark stays 0: the level keeps its own sky, its steps, its reverb) */ decor, vaultDoors, zipLines: zips, ropes: zips,
    squadBands: [{ lo: 400, hi: 459, spots: 0, why: "THE HUNTMASTER'S STAND: columns 386-459 are his arena and the road out - no squad stands in a boss arena (as the sky road)" }],
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,                  /* four checkpoints (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    quest: { n: 4, item: 'tag', name: 'TROPHY TAGS', done: 'FOUR TAGS: TAKE THEM TO THE TROPHY LOFT', thanks: 'THE TROPHY LOFT OPENS' },
    unlocks: [
      { kind: 'stray', opens: 'THE TROPHY LOFT (a silver) once all four trophy tags are brought to it', hud: 'TROPHY TAGS n/4 (the quest counter); at the loft: THE LOFT WANTS FOUR TAGS' },
      { kind: 'loft', opens: 'THE TROPHY LOFT (a silver)', hud: 'THE TROPHY LOFT OPENS' },
      { kind: 'hoists', opens: 'its load: a span lands across its gap (a bridge), a cage lands as a step, a hunter falls', hud: 'THE HOIST DROPS WHAT IT HOLDS' },
    ],
    music: 'rootway',   /* "Forest Whisper Theme" by Cleyton Kauffman, CC0 (audio/CREDITS.txt); the Huntmaster has his own: "Call to War" by Umplix, CC0 */
    ambient: [{ x0: 0, x1: 99999, kind: 'rootway' }],   /* its own bed (src/audio.js rootway): the air inside a great tree - leaves, timber, lanterns, spore pops, a far hide-drum */
    weather: [{ x0: 0, x1: 180 * TS, kind: 'spore' }],
    palette: { sky: [[64, 96, 112], [196, 168, 120]], noNear: true, noFg: true, near: 'mushroom', myc: true, dress: 'myc', haze: 'rgba(150,130,120,0.18)', grass: '#5a8a3a', grassL: '#8ac050', grassD: '#34562a', dirt: '#4a3a30', dirtL: '#5e4a3a', dirtD: '#33261e', canopy: ['#2a1f38', '#4e3a50', '#8a5a3a', '#c88a3a'] },
    /* THE SEAM IT CARRIES: the fungus violet at its foot, warming through the climb into Kingswood's autumn amber in the canopy (L.tints crossfade over 24 columns) */
    tints: [[0, 120, [150, 90, 200], 0.14], [120, 220, [190, 120, 150], 0.10], [220, 320, [220, 140, 90], 0.12], [320, W + 24, [230, 150, 70], 0.15]],
    duskStart: -1, duskLen: 1, night: false, glowNight: true,
    reachExact: false,
  };
}
