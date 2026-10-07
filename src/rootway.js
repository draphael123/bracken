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
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ squad }, o || {}));
  const glow = (x, y) => ent('glow', x, y);
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const deco = (x, y, kind, v) => ent('deco', x, y, { kind, v: v || 0 });
  const tag = (x, y) => ent('stray', x, y, { kind: 'tag' });            /* A TROPHY TAG: the quest (L.quest) - the hunters' bone tags */
  const caps = [], hoists = [], decor = [], vaultDoors = [];
  /* A BUD (Sporewood's sprout, the same mover): `row` is the ground row it sits on; it spans columns x..x+1 */
  const bud = (x, row, o = {}) => { const rise = o.rise ?? 56, y0 = row * TS - 8; caps.push({ kind: 'growcap', x: x * TS, y: y0, y0, y1: y0 - rise, w: 32, h: 8, rise, state: 'bud', k: 0, ...(o.lean ? { bx: x * TS } : {}), ...o }); };
  /* A HOIST: id, the rope's column `x` (a load is centred on it), its pulley row `top`, the load's bottom row while it hangs `hang`, the CLEAT [x, y]
     (y: the cell a foe would stand in; the cleat's box is that cell and the one over it), and what it holds. */
  const hoist = (id, o) => { hoists.push(Object.assign({ id, cut: false }, o)); return o; };
  /* A WELL: a gap from column x0 to x1 down to `bottom` (its floor's top row), with a stair of root shelves up its NEAR (west) wall every three rows,
     so a fall costs the climb back and nothing else (A10). The top shelf is three rows under the lip and never within a jump of the far lip. */
  const well = (x0, x1, lip, bottom) => { air(x0, x1, 0, bottom - 1); ground(x0, x1, bottom); let k = 0; for (let r = bottom - 3; r > lip; r -= 3, k++) plank(x0 + (k % 2 ? 3 : 0), x0 + (k % 2 ? 4 : 1), r); };

  // ================= 1. THE ROOT CELLAR (0-96): TEACH the bud and the hoist, where a miss is cheap =================
  block(0, 0, 0, H - 1);                                                          /* the world's west edge */
  block(1, 70, 0, 25); block(71, 96, 0, 19);                                      /* the cellar's root roof (it lifts as the roots climb) */
  ground(1, 30, 42);
  sign(5, 41, "THE ROOTWAY. UP OUT OF THE FUNGUS, INTO THE GOBLINS' WOOD.");
  glow(8, 41); deco(11, 41, 'sporePod'); glow(18, 41); deco(24, 41, 'tinyCap', 1);
  foe('sporeling', 14, 41, 'cellarA', { face: -1 }); foe('spitcap', 21, 41, 'cellarA', { face: -1 });
  coins([12, 39], [16, 39]);
  plank(5, 13, 39); plank(16, 23, 39); coins([8, 38], [20, 38]);                  /* root shelves over the cellar floor (a second height) */
  ent('vent', 14, 41, { period: 5, on: 1.6, h: 140, phase: 0 }); plank(13, 15, 35); coins([14, 34]);   /* a spore vent up to a root knot */
  /* THE ROOT WALL: four rows, more than any jump - and a bud at its foot. The first REQUIRED use, with nothing else on it */
  ground(31, 52, 38);
  bud(29, 42); sign(25, 41, 'THE CAPS GROW INTO STEPS. STOP ON A BUD AND IT RISES UNDER YOU.');
  glow(33, 37); coins([34, 36], [36, 36]); deco(44, 37, 'rootDecor', 1);
  foe('sporeling', 42, 37, 'wallTop', { face: -1 });
  /* THE FIRST HOIST: a lashed root span hangs over a pit eight wide (no jump crosses it). The pit has a floor and a bud by its near wall that takes
     you back up to the near lip only (the far wall is four rows, and seven columns off the grown cap): a miss costs the climb. Strike the cleat
     and the span drops into place */
  air(53, 60, 26, 41); ground(53, 60, 42); bud(53, 42);
  hoist('cellarSpan', { x: 57, top: 27, hang: 32, cleat: [51, 37], load: 'span', span: [53, 60, 38] });
  sign(47, 37, 'A GOBLIN HOIST. STRIKE THE CLEAT AND IT DROPS WHAT IT HOLDS.');
  ground(61, 75, 38);
  /* (a hollow under the far shelf, in off the pit's floor: a dead end with the first silver - fall in, or drop through the span) */
  air(61, 70, 40, 43); ent('silver', 69, 43); coins([63, 43], [66, 43]); glow(62, 43);
  foe('lurker', 67, 37, 'shelfB'); foe('sporeling', 72, 37, 'shelfB', { face: -1 });
  ent('vent', 64, 37, { period: 4.5, on: 1.6, h: 110, phase: 1 }); plank(63, 65, 33); coins([63, 32], [65, 32]);   /* a spore vent's puff to a root shelf five rows up (a pocket over the road) */
  plank(66, 74, 35);                                                              /* a root over the shelf */
  ground(76, 104, 35);                                                            /* a three-row step: a jump (the cellar's last) */
  plank(80, 90, 32); coins([83, 31], [87, 31]);
  deco(80, 34, 'mushroom', 1); glow(86, 34);
  foe('spitcap', 88, 34, 'stepTop', { face: -1 });
  ent('check', 92, 34);                                                           /* CHECKPOINT ONE */
  deco(96, 34, 'gobPennant', 0);                                                  /* the first goblin mark */

  // ================= 2. THE GREAT ROOTS (96-196): TEST - the leaning cap, a cage on the scouts, THE TROPHY-HUNTER, a span over a real gap =================
  sign(98, 34, 'SOME BUDS LEAN AS THEY GROW. STOP ON ONE AT THE EDGE AND IT CARRIES YOU OVER.');
  well(105, 114, 35, 45);                                                         /* a root gap ten wide; root shelves up its near wall */
  bud(103, 35, { rise: 16, lean: 160, growT: 1.6 });                              /* THE LEANING CAP: it sets you down by the far root */
  ground(115, 128, 35); plank(117, 126, 32);
  foe('lurker', 120, 34, 'rootLurk');
  /* A TROPHY CAGE over two goblin SCOUTS on the root floor below: strike its cleat from the root above and it crushes them (or fight them) */
  ground(129, 158, 38);
  hoist('scoutCage', { x: 139, top: 23, hang: 30, cleat: [127, 34], load: 'cage', land: [138, 36] });
  sign(124, 34, 'A CAGE HANGS OVER THEM. CUT IT DOWN ON THEIR HEADS.');
  foe('archer', 136, 37, 'scouts', { face: -1 }); foe('archer', 141, 37, 'scouts', { face: -1 });
  deco(131, 37, 'trophyRack'); coins([133, 36], [144, 36]);
  /* THE TROPHY-HUNTER (the one new foe): he rides a hoist down onto you as you pass under - cut its cleat first and he falls dazed */
  plank(143, 151, 35);
  hoist('hunterA', { x: 154, top: 24, hang: 32, cleat: [148, 37], load: 'hunter' }); foe('trophyhunter', 154, 32, 'hoistA', { face: -1, hang: 'hunterA' });
  sign(146, 37, 'A HUNTER RIDES THE HOIST. CUT ITS ROPE AND HE FALLS.');
  tag(157, 37);                                                                   /* TROPHY TAG ONE, where he hung */
  ground(159, 172, 35); plank(161, 170, 32);
  foe('spitcap', 168, 34, 'rootSpit', { face: -1 }); glow(162, 34);
  /* A SPAN OVER A REAL GAP: nine wide, a well under it */
  well(173, 181, 35, 45);
  hoist('gapSpan', { x: 177, top: 23, hang: 29, cleat: [171, 34], load: 'span', span: [173, 181, 35] });
  ground(182, 190, 35); ground(191, 206, 32);
  foe('shield', 188, 34, 'gapGuard', { face: -1 });
  deco(185, 34, 'warnPost', 0); coins([184, 33], [187, 33]);
  ent('check', 193, 31);                                                          /* CHECKPOINT TWO */
  plank(196, 205, 29); ent('vent', 198, 31, { period: 4.5, on: 1.6, h: 70, phase: 2 }); coins([199, 28], [203, 28]);   /* a vent up to the larder's gallery */

  // ================= 3. THE HOIST YARD (196-296): REMIX - THE TROPHY LARDER, a cleat you grow a cap to reach, a hunter over your bud =================
  /* SET PIECE A, THE TROPHY LARDER: three stumps in a fungus pit, rising four rows each - no jump climbs from one to the next - and a cage hangs over the
     east half of each. Cut a cage down and it lands on its stump as a half-step: stump, cage, next stump, cage, the far lip. All three ropes tie off on the near lip */
  sign(198, 31, 'THE TROPHY LARDER. CUT THE CAGES DOWN ONTO THE STUMPS: THEY MAKE A STAIR.');
  air(207, 224, 0, 44); ground(207, 224, 45); for (const r of [42, 39, 36, 33]) plank(207, 208, r);   /* the pit, and root shelves up its near wall (a fall costs the climb) */
  ground(210, 213, 39); ground(215, 218, 35); ground(220, 223, 31);               /* THE STUMPS: tops 39, 35, 31 - four rows apart (the far lip is 27) */
  hoist('larder1', { x: 213, top: 19, hang: 31, cleat: [201, 31], load: 'cage', land: [212, 37] });
  hoist('larder2', { x: 218, top: 17, hang: 27, cleat: [203, 31], load: 'cage', land: [217, 33] });
  hoist('larder3', { x: 223, top: 15, hang: 23, cleat: [205, 31], load: 'cage', land: [222, 29] });
  decor.push({ kind: 'larder', x0: 207, x1: 224, y: 15 });
  plank(226, 228, 24); plank(229, 231, 21); ent('silver', 230, 20);              /* SILVER TWO: up a root over the far lip (a pocket) */
  coins([210, 37], [215, 33], [220, 29]);
  deco(213, 44, 'skullPile', 0); deco(219, 44, 'bones', 0); glow(215, 44);
  foe('sporeling', 214, 44, 'larderPit', { face: -1 });
  ground(225, 238, 27);
  foe('archer', 231, 26, 'larderBow', { face: -1 });
  /* A CLEAT ON THE ROOT'S FACE, high over the floor: grow the bud under it and strike it from the cap - the span over the next gap drops */
  bud(236, 27); ground(239, 246, 23);
  hoist('highCleat', { x: 251, top: 12, hang: 17, cleat: [238, 19], load: 'span', span: [247, 255, 23], face: true });
  sign(228, 26, 'THE CLEAT IS HIGH ON THE ROOT. GROW A CAP UNDER IT, THEN STRIKE.');
  well(247, 255, 23, 35);
  ground(256, 268, 23); plank(256, 261, 20);
  foe('brute', 259, 22, 'yardBrute', { face: -1 }); coins([257, 21], [260, 21]);
  /* A HUNTER HANGS OVER THE BUD YOU MUST GROW (the root wall beyond is four rows): stop on the bud and he drops on you - cut him first */
  bud(266, 23);
  hoist('hunterB', { x: 267, top: 6, hang: 12, cleat: [262, 22], load: 'hunter' }); foe('trophyhunter', 267, 12, 'hoistB', { face: -1, hang: 'hunterB' });
  ground(269, 303, 19);
  tag(272, 18);                                                                   /* TROPHY TAG TWO */
  plank(273, 282, 16); plank(288, 296, 16); coins([276, 15], [292, 15]); ent('vent', 295, 18, { period: 4, on: 1.4, h: 90, phase: 1 });   /* the canopy's upper boughs, a vine between them, a vent up to the last */
  foe('sapper', 284, 18, 'yardSapper', { face: -1 }); deco(278, 18, 'hangCage', 0);
  ent('check', 290, 18);                                                          /* CHECKPOINT THREE */

  // ================= 4. THE CANOPY LOOKOUT (296-386): THE EXAM =================
  /* SET PIECE B, THE LOOKOUT: a scout on a lookout across a chasm eight wide; the bridge span hangs on a hoist whose tie-off runs down past his
     post to a cleat no blade reaches. Strike his arrow back: it flies home through the rope and the span drops. (If he falls, another takes the post) */
  sign(297, 18, 'HE CANNOT MISS FROM THERE. STRIKE HIS ARROW BACK: IT FLIES HOME THROUGH THE ROPE.');
  well(304, 311, 19, 35);
  ground(312, 340, 19);
  plank(314, 318, 16); decor.push({ kind: 'lookout', x0: 313, x1: 319, y: 16 });
  hoist('lookout', { x: 308, top: 8, hang: 13, cleat: [312, 15], load: 'span', span: [304, 311, 19], arrow: true, post: [316, 15] });
  foe('archer', 316, 15, 'lookout', { face: -1, lookout: true });
  coins([314, 17], [318, 17]); tag(338, 18); plank(322, 336, 16);                                      /* TROPHY TAG THREE: past the lookout, on the root road */
  foe('shield', 328, 18, 'roadGuard', { face: -1 }); foe('trophyhunter', 334, 18, 'roadGuard', { face: -1 });
  /* the leaning cap over a gap, under a scout's fire from a perch past it */
  well(341, 350, 19, 35);
  bud(339, 19, { rise: 16, lean: 160, growT: 1.6 });
  ground(351, 387, 19);
  plank(355, 359, 15); foe('archer', 357, 14, 'perchBow', { face: -1 });
  foe('spitcap', 362, 18, 'lastCap', { face: -1 });                               /* the last of the fungus */
  /* THE TROPHY LOFT (the vault): the hunters' store in a hollow root over the road - four tags open its door (E at it): a silver */
  block(364, 372, 8, 13); air(365, 371, 9, 12); plank(373, 376, 13); plank(377, 379, 16);
  for (let y = 9; y <= 12; y++) set(372, y, T.SOLID); vaultDoors.push({ x0: 372, x1: 372, y0: 9, y1: 12 });
  ent('loft', 374, 12); ent('silver', 366, 12); tag(376, 12);                        /* TROPHY TAG FOUR: on the loft's step */
  foe('shield', 374, 18, 'doorGuard', { face: -1 }); foe('archer', 379, 18, 'doorGuard', { face: -1 });
  sign(381, 18, "THE HUNTMASTER'S STAND. HIS GOLD ARROWS COME BACK TO HIM. HIS RED ONES DO NOT.");
  ent('check', 384, 18);                                                          /* CHECKPOINT FOUR: the door */
  for (const [fx, fy] of [[140, 37], [222, 28], [300, 18], [352, 18]]) decor.push({ kind: 'goldArrow', x: fx, y: fy });   /* his gold-fletched arrows stand in the roots (B8) */

  // ================= 5. THE HUNTMASTER'S STAND (388-446) =================
  const [A0, A1] = ROOTWAY.arena;
  for (const cx of [387, 447]) for (let y = 0; y < FL - 6; y++) set(cx, y, T.SOLID);   /* the root walls over his two doors */
  ground(A0, A1, FL); ground(447, 459, FL);
  plank(A0 + 4, A0 + 10, FL - 4); plank(A1 - 10, A1 - 4, FL - 4);               /* THE ROOT PERCHES (he leaps to them; a bud under each, so do you) */
  bud(A0 + 6, FL); bud(A1 - 8, FL);
  hoist('hmL', { x: A0 + 7, top: 0, hang: FL - 9, cleat: [A0 + 2, FL - 1], load: 'cage', boss: true });
  hoist('hmM', { x: Math.floor((A0 + A1) / 2), top: 0, hang: FL - 7, cleat: [Math.floor((A0 + A1) / 2) - 3, FL - 1], load: 'cage', boss: true });
  hoist('hmR', { x: A1 - 6, top: 0, hang: FL - 9, cleat: [A1 - 1, FL - 1], load: 'cage', boss: true });
  ent('huntmaster', A1 - 14, FL - 1, { face: -1 });
  const arena = { x0: A0 * TS, x1: (A1 + 1) * TS, floor: FL * TS, trigger: (A0 + 4) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'huntmaster', music: 'boss3', tint: '#c89040', tintA: 0.06,
    start: [A0 + 3, FL - 1], huntmaster: true, perches: [[A0 + 4, A0 + 10, FL - 4], [A1 - 10, A1 - 4, FL - 4]] };
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
    music: 'cave',   /* (the greybox) a PLACEHOLDER - Sporewood's benched track: Daniel picks the level's own CC0/CC-BY track (tools/level-quality.mjs REPORT_ONLY music) */
    ambient: [{ x0: 0, x1: 200 * TS, kind: 'drip' }, { x0: 200 * TS, x1: 99999, kind: 'wind' }],   /* the fungus drips at the foot; the canopy's wind at the top (the art pass: its own bed) */
    weather: [{ x0: 0, x1: 180 * TS, kind: 'spore' }],
    palette: { sky: [[64, 96, 112], [196, 168, 120]], near: 'mushroom', myc: true, dress: 'myc', haze: 'rgba(150,130,120,0.18)', grass: '#5a8a3a', grassL: '#8ac050', grassD: '#34562a', dirt: '#4a3a30', dirtL: '#5e4a3a', dirtD: '#33261e', canopy: ['#2a1f38', '#4e3a50', '#8a5a3a', '#c88a3a'] },
    /* THE SEAM IT CARRIES: the fungus violet at its foot, warming through the climb into Kingswood's autumn amber in the canopy (L.tints crossfade over 24 columns) */
    tints: [[0, 120, [150, 90, 200], 0.14], [120, 220, [190, 120, 150], 0.10], [220, 320, [220, 140, 90], 0.12], [320, W + 24, [230, 150, 70], 0.15]],
    duskStart: -1, duskLen: 1, night: false, glowNight: true,
    reachExact: false,
  };
}
