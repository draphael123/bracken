// burial-caverns.js — THE BURIAL CAVERNS, second rework (claude/burial2, 2026-09-26). Brief: docs/briefs/burial-rework-2.md.
// Daniel, 2026-09-25: "The level with the buried boss still feels too long and repetitive." It was 1140 x 112 (curve.mjs cols
// 1,386, the longest level in the game), built in four layers that each added a stretch and none took one away. This is ONE
// builder for the whole level, at 528 x 74 (cols 660): the Grave Causeway, the Restless Rows, the Falling Gallery, the Plague
// Vault, the Bone Stairs and the Last Procession are gone - they were the same floor with more of the same on it - and the
// descent is kept whole, packed under the road where it always was.
//
//   1 THE CANDLE PATH        0-99    the road          earth-cut barrow      the first vent: a candle, a vent, one of the dead
//   2 THE OSSUARY           100-187  the road          the ossuary shelves   the shelves, and THE BLIND VAULT lit vent to vent
//   3 THE CHARNEL GALLERIES 184-296  rows 25-44       bone-stair shaft      two galleries, east then west; THE CHARNEL HOUSE
//   4 THE DROWNED OSSUARY   178-302  rows 45-70       flooded crypt         black water, coffin lifts and swinging chains
//   5 THE GRAVEYARD KEEPER  303-366  rows 45-71       bone-stair shaft      his vault, open graves in its floor; the shaft up
//   6 THE ROTTEN BRIDGES    367-466  the road, dark   earth-cut barrow      THE EXAM: every verb the level taught, in the dark
//   7 THE BURIED DEAD'S LAIR 467-527 the road         processional hall     his bier, three vents in his floor
//
// THE LEVEL'S SENTENCE: LIGHT THE GAS. THE DEAD WILL NOT RISE IN ITS LIGHT. (The machine is in burial-expansion.js.)
import { VENT } from './burial-expansion.js';

export const BW = 528, BH = 74, ROAD = 22;   /* the road's floor row: you stand on row 21 */
/* the descent, in final columns and rows (tools/burial-rework.mjs reads these) */
export const DESCENT = { hole: [184, 187], wall: [188, 359], g: [31, 41], hall: [184, 290, 25, 40], drop: [283, 285], rot: [184, 189],
  oss: [184, 302, 45, 70], water: [190, 298, 66], piers: [[184, 189], [298, 302]], pier: 64, vault: [303, 358, 56, 70], gate: 359, shaft: [360, 366] };
export const BLIND = [140, 187], EXAM = [367, 466], LAIR = [467, 527], AX = 471;
export const BRIDGES = [[388, 401], [407, 419]];
export const SECTIONS = [
  ['THE CANDLE PATH', 0, 99, 6, 21, 'barrow'], ['THE OSSUARY', 100, 187, 6, 24, 'ossuary'], ['THE CHARNEL GALLERIES', 184, 296, 25, 44, 'bonestair'],
  ['THE DROWNED OSSUARY', 178, 302, 45, 70, 'crypt'], ['THE GRAVEYARD KEEPER', 303, 366, 6, 72, 'bonestair'], ['THE ROTTEN BRIDGES', 367, 466, 6, 30, 'barrow'],
  ["THE BURIED DEAD'S LAIR", 467, 527, 6, 21, 'procession']];
export const POISON = { harm: true, poison: true, swim: true, clear: true, foulCol: '#5c8a24', foulColL: '#a6e04a', foulColD: '#1c3212' };

export function burialCaverns({ painter, T, TS }) {
  const L = painter(BW, BH), { block, set, ent, coins, plat } = L, G = ROAD;
  const interiors = [], structures = [], pools = [], moversExtra = [], gasVents = [], candles = [], darkZones = [], crumble = [], calm = [];
  const cut = (a, b, t, bot) => { for (let y = t; y <= bot; y++) for (let x = a; x <= b; x++) set(x, y, T.AIR); };
  const net = (x, a, b) => { for (let y = a; y <= b; y++) set(x, y, T.NET); };
  const deco = (kind, x, y = G - 1, v = 0) => ent('deco', x, y, { kind, v });
  const sign = (x, text, y = G - 1) => ent('sign', x, y, { text });
  const arch = (x, y, n, floor) => { plat(x, y, n); structures.push({ x0: x, x1: x + n - 1, top: y, floor, kind: 'arch' }); };
  const vent = (x, y = G, phase = 0) => gasVents.push({ x, y, phase, period: 3.4, hitT: 0, litT: 0 });
  const candle = (x, y = G - 1) => candles.push({ x, y });
  /* a pit of green water `w` wide in a floor at row `fl`: poison, a chain at each end to climb out (C5) */
  const pit = (a, b, fl, deep = 5) => { cut(a, b, fl, fl + deep - 1); pools.push({ x0: a * TS, x1: (b + 1) * TS, y: (fl + 1) * TS, depth: (deep - 1) * TS, bottom: (fl + deep) * TS, ...POISON });
    net(a, fl + 2, fl + deep - 1); net(b, fl + 2, fl + deep - 1); };   /* under the water and no higher: a chain you climb out on (C5), not a rung that catches a short jump at the lip (S2) */
  block(0, BW - 1, 0, BH - 1);

  // ======================================================================== 1. THE CANDLE PATH (0-99), earth-cut barrow
  const floorAt = x => x < 26 ? 18 : x < 34 ? 20 : G;
  for (let x = 2; x <= 99; x++) cut(x, x, 6, floorAt(x) - 1);
  interiors.push([2, 99, 6, 21, 'barrow']);
  ent('check', 5, 17); sign(8, 'THE BURIAL CAVERNS. THE DEAD UNDER THE HILL FEAR ONE THING: FIRE.', 17);
  ent('zombie', 20, 17, { face: -1 }); deco('grave', 14, 17); deco('bones', 23, 17);
  /* THE LESSON, on open ground with nothing else near it: a lit candle, a vent, and one of the dead in the vent's light */
  sign(37, 'TAKE FIRE FROM A CANDLE. STRIKE A GAS VENT WITH IT AND THE GAS BURNS.');
  candle(40); vent(46, G, 0.4); calm.push([34, 58, 6, G]);   /* and the sprinkler keeps off it */ ent('zombie', 50, G - 1, { buried: true, face: -1 });
  sign(53, 'A BURNING VENT IS A LAMP. THE DEAD WILL NOT RISE IN ITS LIGHT.');
  /* the first jump that can fail: three tiles of green water, and something waiting where you land (S1, S2) */
  pit(60, 62, G); ent('zombie', 66, G - 1, { face: -1 });
  arch(70, 18, 5, G); net(74, 18, G - 1); ent('bonearcher', 72, 17, { face: -1 }); coins([71, 16], [73, 16]);   /* over the landing: it shoots the jump */
  sign(78, 'KEEP A PALE FACE IN SIGHT. TURN AWAY AND IT FOLLOWS.'); ent('boo', 84, 17, { face: -1 });
  block(78, 82, 6, 13); ent('stal', 80, 14, { stone: true });   /* DUST FALLS BEFORE STONE */
  pit(88, 90, G); ent('corpse', 94, G - 1, { risen: true, face: -1 });   /* a barrow soldier at the landing (S1): the level's first elite (level.js ELITES) */ ent('bat', 92, 12);
  for (const x of [12, 30, 44, 57, 76, 97]) ent('torch', x, floorAt(x) - 1);
  for (const x of [27, 64, 86]) deco(x % 2 ? 'bones' : 'grave', x, floorAt(x) - 1);

  // ======================================================================== 2. THE OSSUARY (100-187), the shelves
  cut(100, 187, 6, G - 1); interiors.push([100, 187, 6, 24, 'ossuary']);
  ent('check', 102, G - 1); sign(104, 'THE OSSUARY. THE FIRST GRAVE CANDLE IS ON THE HIGH SHELF.');
  for (const [x, y, n] of [[106, 20, 5], [111, 18, 5], [116, 16, 5], [121, 14, 5], [126, 12, 8]]) arch(x, y, n, G);
  net(134, 12, G - 1); ent('stray', 131, 11, { kind: 'lamp' }); ent('silver', 132, 11); deco('grave', 128, 11, 1);
  ent('bonearcher', 123, 13, { face: -1 });   /* on the shelves over the road: the climb and the walk under it are both in its line */
  ent('zombie', 113, G - 1, { face: -1 }); ent('husk', 129, G - 1, { face: -1 }); ent('boo', 119, 9, { face: -1 }); ent('spider', 136, 6, { face: -1 });
  for (const x of [109, 124, 138]) ent('torch', x, G - 1); deco('coffer', 137); deco('candelabra', 118);
  /* THE BLIND VAULT: dark from its door to the rotten floor. A candle at the door; three vents, the dead in the dark between them,
     and a pit of green water in the middle. Light a vent and take fire from it for the next: you light your way through. */
  darkZones.push({ x0: BLIND[0] * TS, x1: (BLIND[1] + 1) * TS, y0: 6 * TS, y1: 26 * TS, dark: 0.6, name: 'THE BLIND VAULT' });
  sign(142, 'THE BLIND VAULT. LIGHT THE VENTS TO SEE: THE DEAD LIE BETWEEN THEM.'); candle(144); ent('torch', 140, G - 1);
  vent(148, G, 0); ent('zombie', 152, G - 1, { buried: true, face: -1 });
  pit(155, 157, G); ent('zombie', 159, G - 1, { buried: true, face: -1 });   /* at the landing, in the dark (S1) */
  vent(162, G, 1.3); ent('zombie', 167, G - 1, { buried: true, face: -1 }); ent('bat', 165, 9);
  vent(173, G, 2.2); ent('zombie', 177, G - 1, { buried: true, face: -1 });
  ent('check', 180, G - 1);
  /* THE ROTTEN FLOOR: the road stops at a wall and the way on is down */
  sign(182, 'THE FLOOR IS ROTTEN AND THE ROAD IS DOWN. THE LOWER ROAD LEADS BACK UP.');
  cut(DESCENT.hole[0], DESCENT.hole[1], G, 24);

  // ======================================================================== 3. THE CHARNEL GALLERIES (184-296, rows 25-44)
  { const [hx0, hx1, ht, hb] = DESCENT.hall, [g1, g2] = DESCENT.g;
    cut(hx0, hx1, ht, hb); interiors.push([hx0, hx1, ht, 44, 'bonestair']);
    block(hx0, DESCENT.drop[0] - 1, g1, g1 + 1); block(DESCENT.drop[1] + 1, hx1, g1, g1 + 1);   /* gallery one, walked east: its drop is three tiles wide */
    cut(291, 296, 27, g1 - 1); interiors.push([291, 296, 27, 30, 'bonestair']);   /* the side vault over the drop (S7: the far side of the gap pays) */
    ent('stray', 294, g1 - 1, { kind: 'lamp' }); ent('silver', 295, g1 - 1); deco('grave', 292, g1 - 1);
    block(hx0, hx1, g2, g2 + 1);                                                  /* gallery two, walked west */
    cut(DESCENT.rot[0], DESCENT.rot[1], g2, 44);                                 /* its west end: the rotten floor, into the Drowned Ossuary */
    for (const [x, y, n] of [[205, 28, 5], [232, 28, 6], [274, 28, 4]]) arch(x, y, n, g1);
    for (const [x, y, n] of [[236, 38, 5], [256, 38, 6]]) arch(x, y, n, g2);
    ent('check', 230, g1 - 1); sign(186, 'THE CHARNEL GALLERIES. EACH ONE ENDS IN A DROP TO THE NEXT.', g1 - 1);
    for (const [t, x, y] of [['bonearcher', 207, 27], ['bonegob', 220, 30], ['zombie', 247, 30], ['bonearcher', 234, 27], ['bonegob', 266, 30],
      ['bonearcher', 276, 27], ['spider', 214, 25], ['spider', 252, 25], ['husk', 281, 40], ['spider', 288, 33], ['corpse', 205, 40], ['bat', 196, 35]])
      ent(t, x, y, { face: -1, ...(t === 'corpse' ? { risen: true } : {}) });
    pit(276, 278, g2, 3); pit(212, 214, g2, 3);                                  /* two jumps over green water in gallery two (S2) */
    for (let x = 190; x < 280; x += 12) { ent('torch', x, g1 - 1); coins([x + 4, g1 - 2]); }
    for (let x = 196; x < 288; x += 14) if (x < 210 || x > 216) ent('torch', x, g2 - 1);
    ent('mend', 199, g2 - 1);                                                     /* after the Charnel House and its two pits (S5) */
  }
  /* THE CHARNEL HOUSE, the one ambush: gallery two's doors seal and the dead come out of the shelves */
  const ambushes = [{ name: 'THE CHARNEL HOUSE', row: DESCENT.g[1] - 1, y0: 34, wallL: 226, wallR: 270, check: [272, DESCENT.g[1] - 1],   /* y0: only gallery two's own floor sets it off - gallery one shares its columns */
    waves: [[['zombie', 238], ['bonegob', 250], ['zombie', 262], ['bonearcher', 258, 37]], [['husk', 244], ['bonegob', 256], ['zombie', 232], ['bonearcher', 238, 37], ['wight', 266]]] }];

  // ======================================================================== 4. THE DROWNED OSSUARY (184-302, rows 45-70)
  { const [ox0, ox1, oy0, oy1] = DESCENT.oss, [wx0, wx1, wy] = DESCENT.water;
    cut(ox0, ox1, oy0, oy1); interiors.push([ox0, ox1, oy0, oy1, 'crypt']);
    pools.push({ x0: wx0 * TS, x1: wx1 * TS, y: wy * TS, depth: (oy1 + 1 - wy) * TS, bottom: (oy1 + 1) * TS, swim: true, clear: true, foulCol: '#1e2a2e', foulColL: '#3a5a5e', foulColD: '#0e1416' });
    for (const [a, b] of DESCENT.piers) block(a, b, DESCENT.pier, oy1);          /* two rows over the water: a swimmer climbs out onto either */
    ent('check', 186, DESCENT.pier - 1);                                          /* THE WEST PIER, where the galleries drop you (the 206-tile gap, closed) */
    sign(188, 'THE DROWNED OSSUARY. THE COFFINS RISE AND THE CHAINS SWING: CROSS ON THEM.', DESCENT.pier - 1);
    for (const [x, ph] of [[208, 0], [234, 1.4], [260, 2.6], [282, 0.8]]) ent('mover', x, 63, { len: 3, vert: true, rise: 6, period: 4.4, ph });
    for (const [px, ph] of [[222, 0], [246, 1.2], [272, 2.2]]) moversExtra.push({ kind: 'swing', px: px * TS, py: oy0 * TS, arm: 7 * TS, x: 0, y: 0, w: 40, h: 8, period: 3.4, phase: ph });
    for (const [x, y, n] of [[216, 55, 5], [242, 51, 5], [268, 55, 5]]) arch(x, y, n, wy);
    for (const [t, x, y] of [['bonearcher', 218, 54], ['bonearcher', 270, 54], ['bonegob', 246, 50], ['bat', 226, 53], ['bat', 256, 51], ['boo', 286, 57], ['spider', 232, 45], ['spider', 276, 45]]) ent(t, x, y, { face: -1 });
    for (let x = 212; x < 296; x += 10) coins([x, 62]);
    /* the second grave candle: a vault in the west wall, over the pier */
    cut(178, 183, 57, 60); interiors.push([178, 183, 57, 60, 'crypt']); plat(184, 61, 4);
    ent('stray', 180, 60, { kind: 'lamp' }); ent('silver', 182, 60); ent('torch', 179, 60);
  }

  // ======================================================================== 5. THE GRAVEYARD KEEPER (303-366)
  const [vx0, vx1, vy0, vy1] = DESCENT.vault, graves = [];
  { block(DESCENT.piers[1][1], DESCENT.piers[1][1], DESCENT.oss[2], vy0 - 1);     /* the vault's west wall over its door */
    block(vx0, vx1 + 1, DESCENT.oss[2], vy0 - 1);                                 /* and its roof */
    cut(vx0, vx1, vy0, vy1); interiors.push([vx0, DESCENT.gate, vy0, vy1 + 2, 'bonestair']);
    for (const gx of [313, 329, 345]) { cut(gx, gx + 1, vy1 + 1, vy1 + 2); graves.push(gx); deco('grave', gx + 3, vy1); }
    ent('check', 300, DESCENT.pier - 1);                                          /* on the east pier, at his door */
    sign(298, 'THE GRAVEYARD KEEPER. DODGE HIS DIG BESIDE AN OPEN GRAVE AND THE GROUND GIVES.', DESCENT.pier - 1);
    ent('gravewarden', 335, vy1, { face: -1, mini: true });
    for (let y = vy0; y <= vy1; y++) set(DESCENT.gate, y, T.PORT);                /* his door east, a portcullis: his death lifts it */
    for (const x of [306, 320, 338, 352]) ent('torch', x, vy1);
    /* AND UP: the shaft to the road. THE LOWER ROAD LEADS BACK UP. */
    const [sx0, sx1] = DESCENT.shaft;
    cut(sx0, sx1, G, vy1); interiors.push([sx0, sx1, 6, vy1, 'bonestair']);   /* up to the road's roof: its mouth is the shaft's, not the exam's */
    for (const [y, rise, ph] of [[66, 10, 0], [52, 10, 1.6], [38, 10, 3.2], [27, 5, 0.8]]) ent('mover', sx0 + 1, y, { len: 3, vert: true, rise, period: 5, ph });
    for (const y of [60, 46, 33]) plat(sx0, y, 2);
    for (const y of [64, 50, 36, 25]) coins([sx0 + 3, y]);
    ent('mend', 361, vy1); ent('check', 364, vy1);                                /* after the Keeper: a heart (S5), and a checkpoint at the foot of the climb (S4) */
    net(sx1, G, vy1);                                                             /* THE CHAIN, all the way: hung last, nothing is dug after it (I) */
  }

  // ======================================================================== 6. THE ROTTEN BRIDGES (367-466): THE EXAM, in the dark
  cut(360, BW - 3, 6, G - 1);
  interiors.push([EXAM[0], EXAM[1], 6, 21, 'barrow']);
  darkZones.push({ x0: EXAM[0] * TS, x1: (EXAM[1] + 1) * TS, y0: 6 * TS, y1: 31 * TS, dark: 0.6, name: 'THE ROTTEN BRIDGES' });
  ent('check', 369, G - 1); sign(371, 'THE ROTTEN BRIDGES. A BOARD HOLDS A MOMENT: KEEP WALKING. THE CHAINS CLIMB OUT.');
  candle(374);
  block(378, 383, 6, 17); vent(381, G, 1.0);                                    /* a low pass with a vent in it: light it, or wait for the green to go out */
  for (const [a, b] of BRIDGES) {
    cut(a, b, G, G + 7); pools.push({ x0: a * TS, x1: (b + 1) * TS, y: (G + 1) * TS, depth: 7 * TS, bottom: (G + 8) * TS, ...POISON });
    net(a, G - 1, G + 7); net(b, G - 1, G + 7);
    for (let x = a + 1; x < b; x++) set(x, G, T.PLANK);
    crumble.push({ x0: a + 1, x1: b - 1, row: G, tile: T.PLANK, quiet: 0 });
    calm.push([a - 1, b + 1, 12, G + 8]);                                         /* nobody is garrisoned on a board that drops */
    for (let x = a + 3; x < b - 1; x += 4) coins([x, G - 2]);
  }
  /* the pier between the spans: the level's elite husk holds it (level.js ELITES), and an archer over it shoots down both spans -
     and you cannot stop to block on a board (S1). A candle on the pier: fire for what comes next. */
  arch(402, 18, 4, G); ent('bonearcher', 404, 17, { face: -1 }); candle(405); ent('torch', 403, G - 1);
  /* two jumps over green water with a vent between them, and one of the dead buried at the far landing (S1, S2) */
  ent('zombie', 421, G - 1, { buried: true, face: -1 }); vent(424, G, 0.2); pit(428, 430, G);   /* one of the dead at the bridge's landing, and a vent beside it to keep him there */ vent(435, G, 1.7); ent('torch', 436, G - 1);
  block(430, 434, 6, 13); ent('stal', 432, 14, { stone: true });
  pit(440, 442, G); ent('zombie', 445, G - 1, { buried: true, face: -1 });
  arch(448, 16, 5, G); net(453, 16, G - 1); ent('bonegob', 450, 15, { face: -1 }); coins([449, 14], [451, 14]);   /* throws down on the last run */
  ent('boo', 457, 15, { face: -1 }); vent(460, G, 2.6); ent('corpse', 463, G - 1, { risen: true, face: -1 });
  for (const x of [376, 386, 420, 452]) ent('torch', x, G - 1);   /* (386: a lamp at the first span's end, so from the dark one is always ahead) */

  // ======================================================================== 7. THE BURIED DEAD'S LAIR (467-527): the processional hall
  interiors.push([LAIR[0], LAIR[1] - 2, 6, 21, 'procession']);
  ent('check', 468, G - 1); sign(469, 'THE BURIED DEAD. BURN THE GAS UNDER HIM AND HE OPENS. HIS HANDS AND SKULLS REACH THE LEDGES.');
  const wallL = AX - 1, wallR = AX + 42;
  /* THE TIERS (unchanged from 2026-09-24, tools/buried-dead.mjs): a step at each wall (48 px), low (48), high (96: over the nova),
     and THE CROWN, a bier hung on chains 128 px up over the grave he rises from */
  for (const x of [AX + 7, AX + 30]) arch(x, G - 3, 4, G);
  for (const x of [AX + 11, AX + 26]) arch(x, G - 6, 4, G);
  for (const x of [AX + 1, AX + 37]) arch(x, G - 3, 3, G);
  plat(AX + 17, G - 8, 7); structures.push({ x0: AX + 17, x1: AX + 23, top: 6, floor: G - 8, kind: 'chains' });
  for (let y = 6; y < G; y++) set(wallR, y, T.PORT);
  /* THE VENTS IN HIS FLOOR, and a candle at each wall: his opening is one you light (A11) */
  vent(AX + 5, G, 0.5); vent(AX + 20, G, 1.6); vent(AX + 35, G, 2.7); candle(AX + 1); candle(AX + 41);
  deco('grave', AX + 4); deco('grave', AX + 38);
  ent('burieddead', AX + 20, G - 1); ent('gate', BW - 4, G - 1); ent('torch', AX + 2, G - 1); ent('torch', AX + 40, G - 1);
  const arena = { x0: AX * TS, x1: wallR * TS, floor: G * TS, y0: 6 * TS, y1: (G + 1) * TS, trigger: (AX + 3) * TS, wallL, wallR, boss: 'burieddead', music: 'boss3', tint: '#526044', tintA: 0.1 };

  // ======================================================================== the level's own things
  for (let x = 10; x < 180; x += 6) if (L.grid[G * BW + x] === T.SOLID && L.grid[(G - 1) * BW + x] === T.AIR && !pools.some(p => x * TS >= p.x0 - TS && x * TS < p.x1 + TS)) coins([x, G - 2]);
  /* A PILLAR AT EVERY SEAM (level review, 2026-09-24: "hard vertical seams where the earth backdrop meets the ossuary wall"). Found,
     not listed: every two rooms of different kinds that touch side by side get a pillar over the join, both rows they share. */
  for (const a of interiors) for (const b of interiors) if (a !== b && a[4] !== b[4] && a[1] + 1 === b[0]) { const top = Math.max(a[2], b[2]), bot = Math.min(a[3], b[3]);
    if (bot > top) structures.push({ x0: b[0] - 1, x1: b[0], top, floor: bot + 1, kind: 'seam', look: [a[4], b[4]] }); }
  for (const e of L.ents) if (e.t === 'wight') e.t = 'zombie';   /* the fields' dead are the barrow's walking dead down here */
  const quest = { n: 3, item: 'lamp', name: 'GRAVE CANDLES', done: 'THE DEAD ARE LIT' };
  return { W: BW, H: BH, grid: L.grid, ents: L.ents, START: { x: 4, y: 17 }, interiors, structures, pools, falls: [], moversExtra, music: 'burial',
    underground: true, dark: 0.08, edgeLit: true, duskStart: -1, duskLen: 1, night: true, nightA: 0.04, burialLook: true, checkRun: 100, noStack: true, risenDead: true,
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'none', ledges: 'staging', haze: 'rgba(44,42,64,0.1)', murkCol: '#444651', murkLit: '#85808a', grass: '#747780', grassL: '#a8a3ab', grassD: '#484953', dirt: '#484650', dirtL: '#66626b', dirtD: '#303039', canopy: ['#20202c', '#292b37', '#353643', '#454653'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'cave' }], calm,
    gasVents, candles, darkZones, crumble, burialSections: SECTIONS.map(s => s.slice()), arena, ambushes, graves, graveRows: [vy1 + 1, vy1 + 2], quest,
    mini: { name: 'THE GRAVEYARD KEEPER', x0: vx0 * TS, x1: (vx1 + 1) * TS, floor: (vy1 + 1) * TS, trigger: (vx0 + 4) * TS, wallL: vx0 - 1, gate: DESCENT.gate, boss: 'gravewarden', y0: vy0 * TS, y1: (vy1 + 2) * TS },
    burialPlaces: [['THE BLIND VAULT', ...BLIND], ['THE ROTTEN BRIDGES', BRIDGES[0][0], BRIDGES[1][1]]], ventLight: VENT.light };
}
