// src/fen-road.js - THE FEN ROAD (claude/fenroad, the OPUS greybox; scratch/brief-fenroad-1020.md, every rec Daniel-approved 10-20 ~07:38:
// "needs a boss. Every level needs a boss. And a new enemy type."). A NEW ACT I LEVEL on the road MARSH WOOD -> THE FEN ROAD -> THE STOCKADE.
// The goblins' HALF-BUILT BOARDWALK out of the marsh to their Stockade, over a fen whose water bites (L.waterHurts, as the Marsh's).
// RULE (what the code does - src/fen-road-hands.js): A BOWED SECTION CREAKS, THEN GOES UNDER WITH WHOEVER STANDS ON IT. CUT ITS LASHING AND IT GOES AT ONCE.
//   THE VERB (A2): a SAG section (ents 'sag': a run of rotten boards) bows under a hero's weight (a creak, the boards drawn bending) and after
//   its hold it goes under for a few seconds, taking whoever stands on it into the biting water; a goblin is too light to bow it. Every sag has a
//   LASHING on a post at its near end: strike it and the section goes at once - with the crew on it, or the BARRICADE stood on it (the required use).
//   The boss's opening is the same verb: lure the BOG TROLL's burst under a rotten section and it collapses on him (src/bog-troll.js).
// THE HORN, taught warm (the Stockade's rule): the first STILT-WALKER lookout stands on a dry bank and his horn calls two sprigs only; the next ones
//   call worse. Distant war horns and the Stockade's palisade growing on the horizon say where the road goes (drawn by src/fen-road-hands.js).
// FOUR NAMED AREAS + the crossing, a shrine closing each area's exam (A10c), the last one before the boss:
//      0-104  THE PEAT CUTTINGS     TEACH  the first bowed boards over cheap water, the peat trench and its pit, the FIRST LASHING (a crew of two on the far
//                                          side: cut it as they cross), the first STILT-WALKER (his horn calls two sprigs: a warm lesson)          shrine 101
//    105-210  THE WORK CREWS        TEST   CREW GAPS (the crew lays the road ahead of you plank by plank - or hop the piles), a lashing under a bowman,
//                                          the PLANK YARD (stacks to climb, a silver on top), a stilt-walker on the yard, THE BARRICADE (required:
//                                          it stands on a bowed section - cut the lashing and it goes under)                                       shrine 206
//    211-310  THE STILT POSTS       REMIX  the road is down: a real platforming stretch (A14) over the biting water - stilt decks, bowed two-board
//                                          steps, lily pads, up to a lookout walk and down again; a horn lookout on the high post                  shrine 307
//    311-404  THE PALISADE ROAD     EXAM   the Stockade's horns; SOMETHING UNDER THE ROAD takes a crewman (the troll, foreshadowed - B8); a lashing, a
//                                          crew gap, two stilt-walkers (one with a horn and a real crew)                                            shrine 400
//    405-451  THE TROLL'S CROSSING  BOSS   THE BOG TROLL, under the boardwalk at the Stockade's gate (src/bog-troll.js)
// Every number is a FINAL column (nothing is grown in after): tools/fen-road.mjs pins the beats.
export const SECTIONS = [['THE PEAT CUTTINGS', 0, 104], ['THE WORK CREWS', 105, 210], ['THE STILT POSTS', 211, 310], ['THE PALISADE ROAD', 311, 404], ["THE TROLL'S CROSSING", 405, 451]];
export const FEN_RULE = 'BOWED BOARDS SINK UNDER YOU. STRIKE A LASHING AND THEY GO AT ONCE.';
export const ROAD = 18, WATER = 19, BED = 23;   /* the boardwalk's row, the water's surface row, the bed's first row */
/* THE ARENA: the troll's crossing at the Stockade's gate. Three ROTTEN sections (arena sags: a longer hold, so you can stand on one and lure him) and
   the two stretches he RIPS in his phase two (src/bog-troll.js): islands 407-418, 422-433, 437-450, every rotten section on one of them */
export const ARENA = { x0: 407, x1: 450, gate: 405, wallR: 451, trigger: 411, boss: 428, rot: [[413, 4], [427, 4], [441, 4]], rip: [[419, 421], [434, 436]] };

export function buildFenRoad({ painter, T, TS }) {
  const W = 452, H = 28, L = painter(W, H);
  const { block, floor, plat, reeds, ent, coins, set } = L;
  const pools = [], movers = [], sagCells = [], machine = [];
  const sign = (x, y, text, o = {}) => ent('sign', x, y, { text, ...o });
  const deco = (kind, x, y, o = {}) => ent('deco', x, y, { kind, ...o });
  const planks = (x0, x1, y = ROAD) => { for (let x = x0; x <= x1; x++) set(x, y, T.PLANK); };
  /* THE BITING WATER under a stretch of road: its surface a row under the boards, a bed four rows down (a fall in is a splash, the hurt, and the last
     sound board you stood on - src/fen-road-hands.js keeps that footing on the boards, not back on the last bank) */
  const water = (x0, x1) => { pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: WATER * TS, shallow: false, depth: 0, bottom: BED * TS, fen: true }); block(x0, x1, BED, H - 1); };
  /* A BOWED SECTION: w boards of rotten plank at row r (a machine: the hands draw it, bow it, sink it and float it back) */
  const sag = (id, x0, w, o = {}) => { for (let x = x0; x < x0 + w; x++) { set(x, o.row || ROAD, T.PLANK); sagCells.push([x, o.row || ROAD]); } ent('sag', x0, o.row || ROAD, { id, w, ...o }); };
  /* ITS LASHING: a post at the section's near end (strike it: the section goes) */
  const lash = (x, id, row = ROAD) => ent('lashing', x, row - 1, { sag: id });
  /* A CREW GAP: w columns of open water in the road with piles standing in it (every hero hops them); the crew's layer stands on the far bank and lays
     the road plank by plank, from his side toward you, while you are near (src/fen-road-hands.js) */
  const crewGap = (id, x0, w, piles, dir = -1) => { for (let x = x0; x < x0 + w; x++) { set(x, ROAD, T.AIR); sagCells.push([x, ROAD]); } for (const p of piles) { block(p, p, ROAD, BED - 1); } ent('crewgap', x0, ROAD, { id, w, dir, piles }); };

  // ================= 1. THE PEAT CUTTINGS (0-104): TEACH =================
  floor(0, 14, ROAD);
  sign(5, 17, 'THE GOBLINS\' ROAD TO THEIR STOCKADE. A BOWED BOARD CREAKS, THEN GOES UNDER: KEEP MOVING.');
  deco('stump', 9, 17, { v: 1 }); coins([7, 16], [11, 16]);
  /* the first bowed boards, over cheap water with the bank either side: a fall here is a splash and a step back */
  water(15, 27); planks(15, 27); sag('a', 19, 4);
  coins([19, 16], [20, 15], [21, 15], [22, 16]); reeds(25, 16, 2);
  floor(28, 36, ROAD); ent('sprig', 33, 17, { face: -1 });
  /* THE PEAT CUTTING: the goblins dig the fen for the road's fill. A trench four rows down, a pit two deeper in its middle (a silver in the cutter's
     hut at its west wall - a pocket off the route), out by the steps at its east end */
  floor(37, 38, 20); floor(39, 52, 22); floor(51, 52, 20);
  for (let x = 42; x <= 47; x++) for (let y = 22; y <= 23; y++) set(x, y, T.AIR);   /* the pit, two rows deeper and six wide: no jump clears it */
  ent('sprig', 41, 21, { face: -1 }); ent('sprig', 49, 21, { face: -1 }); ent('spit', 53, 17, { face: -1 });   /* the cutters in the trench; a spitter on its east lip lobbing in */
  coins([44, 23], [45, 23], [46, 23]); deco('rock', 40, 21, { v: 1 });
  plat(39, 19, 3); ent('silver', 40, 18);   /* the cutter's shelf: up out of the trench's west end, a silver (off the route) */
  /* THE FIRST LASHING: the crew stands on the far side of a bowed section. Strike the lashing on its post as they cross: it goes under with them */
  water(53, 70); planks(53, 70); sag('b', 61, 4); lash(58, 'b');
  sign(55, 17, 'THE CREW COMES OVER THE BOWED BOARDS. STRIKE THE LASHING ON ITS POST AS THEY CROSS.');
  ent('sprig', 66, 17, { face: -1 }); ent('sprig', 69, 17, { face: -1 });
  plat(56, 14, 4); coins([57, 13], [58, 13]); reeds(67, 15, 2);
  /* THE FIRST STILT-WALKER: a lookout on a dry bank, a horn at his belt. Taught warm: his horn calls two sprigs out of the hut behind him */
  floor(71, 84, ROAD);
  sign(72, 17, 'A LOOKOUT ON STILTS. HIS HORN CALLS HIS CREW. GO LOW: A SWEEP OR A SLIDE CUTS A STILT.');
  deco('bothy', 82, 17, { v: 0 });
  ent('stiltwalker', 79, 17, { face: -1, horn: true, pack: [{ dx: 48, y: ROAD * TS, t: 'sprig' }, { dx: 56, y: ROAD * TS, t: 'sprig' }] });
  coins([75, 16], [77, 16]);
  /* out over the water again: two bowed sections in a row under a bowman on the lookout walk (a fight while the rule runs, A5) */
  water(85, 98); planks(85, 98); sag('c', 88, 3); sag('d', 93, 3);
  plat(86, 14, 4); ent('archer', 87, 13, { face: -1 }); plat(92, 13, 3); coins([92, 12], [93, 12]);
  coins([89, 16], [94, 16]);
  floor(99, 110, ROAD);
  ent('check', 101, 17);

  // ================= 2. THE WORK CREWS (105-210): TEST =================
  sign(106, 17, 'THE CREW LAYS THE ROAD AHEAD OF YOU. HOP THE PILES, OR WAIT FOR THE PLANKS.');
  /* CREW GAP ONE: the road stops at open water; the layer stands on the far side with his mallet */
  water(111, 116); crewGap('g1', 111, 6, [112, 115]);
  floor(117, 124, ROAD); ent('sprig', 118, 17, { face: -1, layer: 'g1' }); ent('shield', 122, 17, { face: -1 });
  deco('timber', 120, 17, { v: 0 }); coins([113, 16], [114, 15], [116, 16]);
  /* a second lashing, under a bowman on a stilt deck over it */
  water(125, 150); planks(125, 150); sag('e', 136, 4); lash(133, 'e');
  ent('sprig', 143, 17, { face: -1 }); ent('sprig', 146, 17, { face: -1 });
  plat(127, 14, 5); coins([128, 13], [130, 13]); plat(139, 13, 4); ent('archer', 140, 12, { face: -1 });
  plat(146, 14, 3); coins([146, 13], [147, 13]);
  /* THE PLANK YARD: the crews' stacks on a peat island - climb them for a silver; a stilt-walker keeps the yard (no horn: a gaff fight on the flat) */
  floor(151, 172, ROAD);
  plat(153, 15, 4); plat(157, 12, 4); plat(161, 9, 3); ent('silver', 162, 8); coins([154, 14], [158, 11]);
  deco('timber', 155, 17, { v: 1 }); deco('gobPennant', 159, 17, { v: 0 });
  ent('stiltwalker', 167, 17, { face: -1 });
  ent('wasp', 164, 12);
  /* CREW GAP TWO, its layer and a spitter on the far bank */
  water(173, 178); crewGap('g2', 173, 6, [174, 177]);
  floor(179, 186, ROAD); ent('sprig', 180, 17, { face: -1, layer: 'g2' }); ent('spit', 185, 17, { face: -1 }); coins([175, 15], [176, 15]);
  /* THE BARRICADE (the required use, A4): the crew have stacked their road-planks four high on a bowed section - no jump goes over it. Strike the
     lashing and the section goes under, and the barricade with it. The crew behind it is the area's exam */
  water(187, 200); planks(187, 200); sag('f', 191, 4, { load: [[192, 14], [192, 15], [192, 16], [192, 17], [193, 14], [193, 15], [193, 16], [193, 17]] }); lash(189, 'f');
  for (const [x, y] of [[192, 14], [192, 15], [192, 16], [192, 17], [193, 14], [193, 15], [193, 16], [193, 17]]) { set(x, y, T.CRATE); machine.push([x, y]); }
  sign(187, 17, 'THEIR BARRICADE STANDS ON A BOWED SECTION. STRIKE ITS LASHING AND IT GOES UNDER.');
  ent('shield', 197, 17, { face: -1 }); ent('sprig', 199, 17, { face: -1 }); plat(196, 14, 4); ent('archer', 198, 13, { face: -1 });
  floor(201, 214, ROAD); coins([202, 16], [204, 16]);
  ent('check', 206, 17);

  // ================= 3. THE STILT POSTS (211-310): REMIX - the platforming stretch (A14) =================
  sign(211, 17, 'THE ROAD IS DOWN. STILT DECKS, PADS AND BOWED BOARDS: KEEP MOVING.');
  water(215, 300);
  /* every hop here is one any hero makes from a run: level gaps of three tiles at most, a rise of two rows at most */
  sag('h1', 216, 2); plat(220, 17, 3); ent('pad', 225, 18, { big: true }); sag('h2', 228, 2);
  plat(232, 16, 3); plat(236, 14, 3); plat(240, 12, 3);
  /* the lookout walk: the high deck, and the horn lookout on its post. His horn calls a bowman and a spitter onto the decks round him */
  plat(244, 11, 7); ent('stiltwalker', 248, 10, { face: -1, horn: true, pack: [{ dx: 104, y: 12 * TS, t: 'archer' }, { dx: -120, y: 12 * TS, t: 'spit' }] });
  coins([245, 10], [246, 10], [250, 10]);
  plat(254, 12, 3); ent('silver', 259, 6); plat(258, 7, 2);   /* a silver up on the crow's nest (off the route) */
  plat(257, 14, 3); sag('h3', 262, 2, { row: 16 }); plat(266, 16, 3); ent('pad', 271, 18, {}); ent('pad', 274, 18, { big: true });
  ent('wasp', 272, 14);
  plat(277, 16, 3); ent('spit', 278, 15, { face: -1 }); sag('h4', 282, 3, { row: 16 }); plat(287, 15, 3); plat(291, 16, 3);
  ent('pad', 296, 18, { big: true }); ent('eel', 293, 20, { leap: true });
  coins([226, 16], [233, 15], [237, 13], [241, 11], [267, 15], [283, 15], [288, 14]);
  floor(301, 316, ROAD);
  ent('sprig', 304, 17, { face: -1 }); ent('shield', 309, 17, { face: -1 });   /* the landing's guard: the area's exam ends on the bank */
  ent('check', 307, 17);

  // ================= 4. THE PALISADE ROAD (311-404): EXAM =================
  sign(312, 17, 'THE STOCKADE\'S HORNS. SOMETHING ELSE IS UNDER THE ROAD.');
  water(317, 398); planks(317, 351); planks(358, 398);
  sag('i', 322, 4); lash(320, 'i'); ent('sprig', 329, 17, { face: -1 }); ent('shield', 331, 17, { face: -1 });
  /* SOMETHING UNDER THE ROAD (B8): bubbles under the boards, then an arm out of the water takes a crewman under */
  ent('undertow', 337, ROAD, {}); ent('sprig', 338, 17, { face: -1, victim: true });
  plat(340, 14, 6); coins([341, 13], [343, 13], [345, 13]);
  ent('stiltwalker', 346, 17, { face: -1 });
  crewGap('g3', 352, 6, [353, 356]); ent('sprig', 359, 17, { face: -1, layer: 'g3' }); plat(360, 13, 4); ent('archer', 361, 12, { face: -1 });
  sag('j', 366, 4); lash(364, 'j');
  ent('stiltwalker', 374, 17, { face: -1, horn: true, pack: [{ dx: 56, y: ROAD * TS, t: 'shield' }, { dx: 72, y: ROAD * TS, t: 'sprig' }] });
  plat(368, 14, 5); coins([369, 13], [371, 13]);
  sag('k', 380, 3); plat(385, 14, 5); ent('spit', 387, 13, { face: -1 });
  coins([323, 16], [367, 16], [381, 16], [391, 16]);
  floor(399, 406, ROAD);
  ent('check', 400, 17);
  sign(402, 17, 'THE BOG TROLL FEELS YOUR WEIGHT ON THE BOARDS. LURE HIS BURST UNDER A ROTTEN SECTION.');

  // ================= 5. THE TROLL'S CROSSING (405-451): THE BOG TROLL (src/bog-troll.js) =================
  ent('gate', ARENA.gate, 17);
  water(407, 450); planks(407, 450);
  ARENA.rot.forEach(([x0, w], i) => sag('rot' + i, x0, w, { arena: true }));
  block(ARENA.wallR, ARENA.wallR, 0, H - 1);
  ent('bogtroll', ARENA.boss, 17, { face: -1 });

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 17 }, pools, falls: [], moversExtra: movers, fenroad: true,
    waterHurts: true, noStack: true, sagCells, machineCells: [...sagCells, ...machine].map(([x, y]) => y * W + x),
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''), name, x0, x1 })),
    music: 'sleepers', duskStart: undefined,
    palette: { dress: 'marsh', haze: 'rgba(160,170,150,0.30)', grass: '#5a7a4a', grassL: '#86a86a', grassD: '#3a5232', dirt: '#3e3226', dirtL: '#57473a', dirtD: '#2a2018', sky: [[120, 128, 132], [176, 180, 164]], canopy: ['#2a3a2e', '#34483a', '#405844', '#4e6a50'] },
    weather: [{ x0: 0, x1: 99999, kind: 'mist' }],
    fog: [{ x0: 215 * TS, x1: 300 * TS, alpha: 0.22 }],
    ambient: [{ x0: 0, x1: 99999, kind: 'rain' }],
    tints: [[0, 104, [150, 140, 100], 0.10], [105, 210, [140, 120, 90], 0.10], [211, 310, [110, 140, 130], 0.14], [311, 404, [150, 110, 80], 0.14], [405, 451, [90, 110, 80], 0.16]],
    arena: { x0: ARENA.x0 * TS, x1: ARENA.x1 * TS, floor: ROAD * TS, trigger: ARENA.trigger * TS, wallL: ARENA.gate + 1, wallR: ARENA.wallR, boss: 'bogtroll', music: 'boss3', tint: '#4a6a3a', tintA: 0.12, fx: 'motes',
      water: WATER * TS, bed: BED * TS, rip: ARENA.rip, rot: ARENA.rot.map(([x0, w], i) => ({ id: 'rot' + i, x0, w })) },
  };
}
