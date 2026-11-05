// src/heart-mountain.js - THE HEART OF THE MOUNTAIN (claude/heartlevel, the OPUS GREYBOX of the level, 2026-11-05; Daniel 11-04 17:28/17:29 + 11-05 08:08 "HEART OF THE
// MOUNTAIN LEVEL opus code-only"; arc doc scratch/arc-mountain-demon.md V3 "eruption builds; the exam of everything"; scratch/lane-reports/heartplan.md for the two fights).
// The volcano's burning INSIDE, from the lava tubes down to the SEAL. THE FIRE DRAKE (src/fire-drake.js, its hands src/fire-drake-hands.js) is the mini boss at its end, in
// THE CALDERA (the drakelab room's geometry, re-laid here: 32 tiles, the seal in the middle, two basalt ledges); beating it plays scene A (src/heart-scenes.js) and loads
// THE SKY FIGHT ('heartsky', the skylab arena under the Heart's own name). This file is the level, laid by hand (nothing sprinkled); src/heart-mountain-hands.js is its rule
// and its one new foe (THE MAGMA LEAPER).
//
// THE RULE (L.rule): THE MOUNTAIN'S HEART BEATS. ON THE BEAT THE CRUST MELTS AND THE VENTS BLOW. STRIKE A WARD-STONE AND THE CRUST AROUND IT HOLDS.
//   THE BEAT (one clock, HM.beat): a told throb (the crust's cracks glow, the rumble: HM.beat.tell s), then THE SURGE (HM.beat.surge s): every CRUST span melts (its cells go
//     to air: a hero on it drops into the magma - BURNED, handed back to the last bank, L.waterHurts), every HEART VENT blows (a lift: ride it up). Then the crust cools again.
//     THE ERUPTION BUILDS: the beat quickens the deeper you go (HM.zones: 7.0 s at the throat, 4.5 s at the seal's door).
//   A CRUST (L.hmCrust, ent 'hmcrust'): cooled magma over a magma channel - one-way footing between beats.
//   A WARD-STONE (L.hmWards, ent 'hmward'): an obsidian standing stone of the seal's old keepers. ANY blow on it HOLDS its crusts a while (HM.ward.hold s, beat or no beat;
//     struck during a surge, they harden at once). Then it is SPENT a moment. It is the verb: the long channels are crossed on a held crust, the leapers fought on one.
//   A HEART VENT (ent 'vent' with heart: true): a fumarole that blows only on the beat (src/main.js reads HMH.ventOn).
//   THE SEAL'S CHAINS (L.hmChains, ent 'hmchain'): the three great chains run up through the rock from the seal - T.CLIMB columns hung from the roof.
//   BASALT RAFTS ('mover', stone): slabs drifting on the magma lake.
//   THE MAGMA LEAPER (e.t 'leaper', the level's ONE new foe): it lives in the magma; on the TELL it rises under you (bubbles, a red !!), on THE BEAT it leaps at you; cut it
//     in the air, or fight it where it lands (a held crust is the place); it flops back in. Everything else is the Demon King's servant's dead come to break the seal
//     (wights, bone archers, husks - an elite husk keeps the door) and the fire's own wisps. NO GOBLINS.
//
// FOUR NAMED AREAS + THE CALDERA (TEACH -> TEST -> REMIX -> EXAM). Columns; rows: smaller is higher. Start + TWO shrines (Daniel: fewer; Salt & Sanctuary death cost) - and the
// drake's own shrine, set by the split seal when it is beaten (the sky fight's checkpoint is mount-up, src/heart-scenes.js checkpointOf).
//      0-104  THE THROAT         TEACH: the first crust (a sign, nothing on it), the first heart vent (the only way up), the first leaper (channel B, a pillar to wait on)
//    105-196  THE CHAIN GALLERY  TEACH THE WARD: a 40-tile channel no run crosses between two beats - strike the ward-stone. TEST: a ward, a leaper and the dead on the crust
//    197-282  THE MAGMA LAKE     SHRINE ONE. REMIX: basalt rafts and pillars over the lake, a crust held by a ward on a pillar, three leapers, a heart vent out
//    283-349  THE SEAL'S DOOR    EXAM: a crust floor over magma in four spans, two wards (one on a stub pillar), two leapers, the dead and an elite paladin; SHRINE TWO
//    350-383  THE CALDERA        THE FIRE DRAKE (mini boss), chained to the seal
import { DC } from './drake-caldera.js';

export const HEART = { W: 390, H: 60 };
export const HEART_RULE = "THE MOUNTAIN'S HEART BEATS. ON THE BEAT THE CRUST MELTS AND THE VENTS BLOW. STRIKE A WARD-STONE AND THE CRUST AROUND IT HOLDS.";
export const SECTIONS = [['THE THROAT', 0, 104], ['THE CHAIN GALLERY', 105, 196], ['THE MAGMA LAKE', 197, 282], ["THE SEAL'S DOOR", 283, 349], ['THE CALDERA', 350, 389]];
/* THE ERUPTION BUILDS: the beat's period (s) by column - read by src/heart-mountain-hands.js (by the leading hero's column). No beat in the caldera (the drake's own vents) */
export const ZONES = [[0, 104, 7.0], [105, 196, 6.0], [197, 282, 5.2], [283, 349, 4.5]];
/* the rule's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/heart-level.mjs */
export const ARCS = {
  crust: { teach: [24, 32], test: [71, 86], remix: [257, 265], exam: [297, 330] },
  vent: { teach: [44, 44], test: [194, 194], remix: [281, 281], exam: [314, 314] },
  ward: { teach: [114, 156], test: [175, 188], remix: [255, 265], exam: [296, 330] },
  leaper: { teach: [71, 86], test: [117, 156], remix: [231, 267], exam: [297, 330] },
};
export const HM_SIGNS = {
  lore: 'THE MOUNTAIN IS HOLLOW TO ITS HEART. THE DEAD WENT DOWN BEFORE YOU, TO BREAK WHAT IS SEALED THERE.',
  crust: 'THE HEART BEATS: THE CRUST MELTS. WATCH ITS CRACKS GLOW - CROSS BETWEEN THE BEATS.',
  vent: 'ON THE BEAT THE VENTS BLOW. STAND ON ONE AND RIDE IT UP.',
  leaper: 'THE MAGMA HAS TEETH. ON THE BEAT A LEAPER JUMPS AT YOU: CUT IT IN THE AIR, OR WAIT ON THE PILLAR.',
  ward: 'A WARD-STONE OF THE OLD KEEPERS. STRIKE IT: THE CRUST NEAR IT HOLDS A WHILE, BEAT OR NO BEAT.',
  lake: 'THE LAKE. RIDE THE BASALT; THE WARD ON THE PILLAR HOLDS THE LAST CRUST.',
  door: "THE SEAL'S DOOR. THE HEART BEATS FAST HERE.",
  drake: 'THE CALDERA. THE FIRE DRAKE IS CHAINED TO THE SEAL: BAIT ITS LUNGE PAST THE SCORCHED RING.',
};
/* the map's two nodes, for the mountain / demon-act sheet when the map lane lays it (src/main.js HEART_ON_MAP is false until the art pass and the mountain sheet land):
   THE HEART on the mountain's fire side, THE BREACH (scene B's 'to') as the demon act's first node. x, y are sheet coordinates (320 x 180), the map lane's to move */
export const HEART_NODES = [
  { id: 'heart', kind: 'level', levelId: 'heart', x: 160, y: 60, plate: 'above', name: 'THE HEART OF THE MOUNTAIN' },
  { id: 'breach', kind: 'level', levelId: 'breach', x: 168, y: 120, plate: 'below', name: 'THE BREACH', ghost: true },
];

export function buildHeartMountain({ painter, T, TS }) {
  const { W, H } = HEART, BOT = H - 1;
  const L = painter(W, H), { set, block, ent } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const rock = (x0, x1, f) => block(x0, x1, f + 1, BOT);               /* basalt from the feet row f's floor down to the bottom of the world: nothing floats */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ squad, face: -1 }, o || {}));
  const crusts = [], wards = [], chains = [], pools = [], leapers = [];
  /* A MAGMA CHANNEL x0..x1 under feet row f: the crust spans lie on row f+1 (one-way), ON the magma - its surface one row under them, its bed four rows under that */
  const channel = (id, x0, x1, f, spans, o = {}) => {
    const surf = f + 2, bed = surf + 4;
    air(x0, x1, f + 1, bed - 1); block(x0, x1, bed, BOT);
    pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: surf * TS + 6, bottom: bed * TS, fire: true, heart: id });
    for (const [a, b, cid] of spans) { fill(a, b, f + 1, f + 1, T.ONEWAY); crusts.push({ id: cid, x0: a, x1: b, y: f + 1, ch: id }); ent('hmcrust', a, f + 1, { id: cid, x1: b }); }
    for (const [a, b] of o.pillars || []) block(a, b, f + 1, bed - 1);
    return { surf, bed };
  };
  /* A WARD-STONE at column x on feet row f: what it holds (crust ids) */
  const ward = (id, x, f, holds) => { wards.push({ id, x, f, holds }); ent('hmward', x, f, { id }); };
  /* A CHAIN of the seal, hung from the rock at row y0 down to row y1 (T.CLIMB): climbable */
  const chain = (id, x, y0, y1) => { fill(x, x, y0, y1, T.CLIMB); chains.push({ id, x, y0, y1 }); ent('hmchain', x, y1, { id, y0 }); };
  /* A HEART VENT: blows on the beat (h px, lift px/s) */
  const vent = (x, f, rows, lift) => ent('vent', x, f, { heat: true, heart: true, h: rows * TS, lift: lift || 300, period: 7, on: 1.4 });
  const leaper = (x, f, squad) => { leapers.push({ x, f }); foe('leaper', x, f, squad); };

  /* the roof: the inside of the cone, rock from the tubes to the caldera's lintel (the caldera itself is open to the crater's throat) */
  block(0, DC_X.wallL, 0, 3); block(0, 1, 0, BOT);

  // ================= 1. THE THROAT (0-104): TEACH =================
  rock(2, 16, 21);                                           /* the lava tube's mouth: you come in here */
  sign(8, 21, HM_SIGNS.lore); sign(13, 21, HEART_RULE);
  rock(17, 19, 23); rock(20, 23, 25);
  coins([18, 22], [21, 24]);
  channel('A', 24, 32, 25, [[24, 32, 'a1']]);                /* TEACH: one crust, nothing on it */
  sign(22, 25, HM_SIGNS.crust);
  coins([26, 24], [28, 24], [30, 24]);
  rock(33, 46, 25);
  foe('wight', 39, 25, 'throatA', { face: -1 });
  vent(44, 25, 13, 320);                                     /* TEACH THE VENT: the throat's wall is nine rows high - the beat's breath is the only way up */
  sign(41, 25, HM_SIGNS.vent);
  rock(47, 62, 16);                                          /* the upper shelf */
  block(50, 72, 4, 9); air(53, 60, 6, 8);                    /* the cone's rock hangs low over it: a NICHE in it, reached up a chain */
  chain('c0', 61, 9, 15); ent('silver', 54, 8);              /* SILVER ONE: up the first chain into the niche */
  coins([56, 8], [58, 8]);
  foe('bonearcher', 58, 16, 'throatB', { face: -1 }); foe('emberwisp', 52, 13, 'throatB');
  rock(63, 66, 19); rock(67, 70, 22);
  coins([64, 18], [68, 21]);
  channel('B', 71, 86, 22, [[71, 77, 'b1'], [80, 86, 'b2']], { pillars: [[78, 79]] });   /* TEST: two crusts and a basalt pillar to wait a beat on; THE FIRST LEAPER */
  sign(69, 22, HM_SIGNS.leaper);
  leaper(75, 22, 'leaperB');
  coins([78, 21], [79, 21]);
  rock(87, 104, 22);
  foe('wight', 92, 22, 'throatC'); foe('wight', 97, 22, 'throatC'); foe('emberwisp', 102, 18, 'throatC');
  coins([90, 22], [95, 22]);

  // ================= 2. THE CHAIN GALLERY (105-196): TEACH THE WARD, TEST =================
  /* the shaft down: the gallery lies nineteen rows under the throat. THE SEAL'S FIRST CHAIN hangs in it from the roof: down it (or drop), and back up it to the pocket */
  rock(105, 116, 41);
  block(111, 188, 4, 26);                                   /* the gallery's low roof: the cone's rock comes down to row 26 over it */
  chain('c1', 110, 4, 40);
  air(111, 116, 22, 25);                                     /* a POCKET in the shaft's wall, off the chain's side (a silver) */
  ent('silver', 115, 25); coins([112, 25], [113, 25]);
  coins([110, 30], [110, 36]);
  ward('w1', 114, 41, ['c1a', 'c1b', 'c1c', 'c1d']);
  sign(111, 41, HM_SIGNS.ward);
  /* THE WARD TAUGHT - THE LOCK: forty tiles of crust. The fastest hero's sprint (the pyromancer, 122 px/s) needs 5.1 s to cross it and the crust stands 4.6 s between two
     beats here (6.0 - 1.4): no run crosses it. A held crust (HM.ward.hold, 10 s) carries the slowest hero (the blood knight, 74 px/s: 8.6 s) - tools/heart-level.mjs proves both */
  channel('C', 117, 156, 41, [[117, 126, 'c1a'], [127, 136, 'c1b'], [137, 146, 'c1c'], [147, 156, 'c1d']]);
  leaper(131, 41, 'leaperC');
  coins([121, 40], [131, 40], [141, 40], [151, 40]);
  rock(157, 170, 41);
  foe('wight', 159, 41, 'galleryA'); foe('bonearcher', 169, 38, 'galleryA', { face: -1 }); foe('husk', 165, 41, 'galleryA');
  block(167, 170, 39, 41);                                   /* a basalt step the archer stands on (a second height) */
  rock(171, 173, 38); rock(174, 175, 35);
  coins([172, 37], [174, 34]);
  ward('w2', 175, 35, ['d1', 'd2']);
  channel('D', 176, 188, 35, [[176, 182, 'd1'], [183, 188, 'd2']]);   /* TEST: a ward, a leaper and the dead on the crust */
  leaper(180, 35, 'leaperD'); foe('wight', 186, 35, 'galleryD', { face: -1 });
  coins([179, 34], [185, 34]);
  rock(189, 196, 35);
  vent(194, 35, 14, 330);                                    /* up out of the gallery on the beat (eleven rows) */
  coins([190, 35]);
  chain('c2', 190, 4, 20);                                   /* THE SECOND CHAIN, hung beside the vent's column (a picture: it runs on down to the seal) */

  // ================= 3. THE MAGMA LAKE (197-282): SHRINE ONE, REMIX =================
  rock(197, 214, 24);
  ent('check', 203, 24);                                     /* SHRINE ONE */
  block(199, 211, 4, 15); air(200, 212, 12, 14); chain('c4', 212, 15, 21);   /* a CHAIN up from the shrine into a hollow of the cone's rock (coins: a breather's look over the lake) */
  coins([202, 14], [205, 14], [208, 14]);
  foe('emberwisp', 210, 20, 'lakeTop');
  foe('wight', 211, 24, 'lakeTop');
  rock(215, 220, 31); rock(221, 224, 37); rock(225, 230, 43);   /* down the lake's wall */
  coins([217, 30], [222, 36], [227, 42]);
  sign(228, 43, HM_SIGNS.lake);
  /* THE LAKE: one channel of magma under the basalt; three pillars stand out of it; rafts drift between; the last span is a crust a ward on the pillar before it holds */
  channel('E', 231, 267, 43, [[257, 265, 'e1']], { pillars: [[242, 243], [255, 256], [266, 267]] });
  ent('mover', 231, 44, { len: 3, range: 8, speed: 30, stone: true, raft: true });   /* BASALT RAFTS: on the magma's skin, bank to pillar, pillar to pillar */
  ent('mover', 244, 44, { len: 3, range: 8, speed: 34, stone: true, raft: true });
  ward('w3', 255, 43, ['e1']);
  leaper(237, 43, 'lakeL1'); leaper(250, 43, 'lakeL2'); leaper(261, 43, 'lakeL3');
  foe('emberwisp', 249, 36, 'lakeSky');
  coins([242, 43], [256, 43], [261, 42]);
  rock(268, 282, 43);
  foe('bonearcher', 276, 43, 'lakeFar', { face: -1 }); foe('wight', 272, 43, 'lakeFar');
  vent(281, 43, 15, 340);                                    /* up out of the lake on the beat (twelve rows) */
  chain('c3', 270, 4, 30);                                   /* THE THIRD CHAIN: it hangs over the far bank down toward the seal */
  block(271, 277, 4, 30); air(271, 276, 28, 29);             /* the cone's rock hangs down over the far bank: a POCKET in it at the chain's foot (a silver) */
  ent('silver', 275, 29); coins([273, 29]);

  // ================= 4. THE SEAL'S DOOR (283-349): EXAM, SHRINE TWO =================
  rock(283, 296, 31);
  foe('husk', 287, 31, 'doorA'); foe('bonearcher', 291, 31, 'doorA');
  sign(284, 31, HM_SIGNS.door);
  ward('w4', 296, 31, ['f1', 'f2']);
  channel('F', 297, 330, 31, [[297, 304, 'f1'], [305, 312, 'f2'], [315, 322, 'f3'], [323, 330, 'f4']], { pillars: [[313, 314]] });
  ward('w5', 313, 31, ['f3', 'f4']);
  vent(314, 31, 12, 300);                                    /* on the stub: the beat's breath carries you up through the hole in the rock over it, into a pocket (a silver) */
  block(309, 320, 4, 22); air(311, 318, 19, 21); air(313, 315, 22, 22);   /* the cone's rock over the stub, hollow, a hole in its floor over the vent */
  ent('silver', 317, 21); coins([311, 21], [312, 21]);
  leaper(301, 31, 'doorL1'); leaper(325, 31, 'doorL2');
  foe('wight', 309, 31, 'doorB'); foe('wight', 319, 31, 'doorB');
  coins([300, 30], [309, 30], [319, 30], [327, 30]);
  rock(331, 349, 31);
  block(331, 343, 4, 22); air(332, 342, 19, 21); chain('c5', 343, 22, 28);   /* the cone's rock over the door, hollow: up a chain from the floor (coins, and a look down on the door) */
  coins([334, 21], [337, 21], [340, 21]);
  block(336, 339, 30, 31); foe('bonearcher', 338, 29, 'doorC', { face: -1 });   /* the archer's step at the door (two rows: up and over it) */
  foe('husk', 344, 31, 'doorElite', { elite: true, gate: 350 });               /* THE CINDER HUSK: the door's keeper, an elite (its gate is the caldera's door) */
  ent('check', 347, 31);                                     /* SHRINE TWO: the drake's retry point, at the caldera's door */

  // ================= 5. THE CALDERA (350-389): THE FIRE DRAKE =================
  const A = DC_X, FLOOR = A.floor;                           /* the drakelab room's geometry, moved: its floor at row 32 (feet 31) */
  rock(A.wallL, W - 1, FLOOR - 1);
  block(A.wallL, A.wallL, 0, FLOOR - 7);                     /* the door's lintel (the 6-row arena wall, src/main.js setWall, shuts the rest when it wakes) */
  block(A.wallR, W - 1, 0, FLOOR - 1);                       /* the far wall: the crater's side, floor to sky */
  for (const [a, b] of A.ledges) for (let x = a; x <= b; x++) set(x, A.ledgeRow, T.ONEWAY);
  /* each ledge stands on a basalt column (L.structures 'hmColumn', drawn by src/heart-mountain-hands.js drawStructure; anchor-lint reads it): it sinks with the ledge in P3 */
  const structures = A.ledges.map(([a, b]) => ({ x0: a, x1: b, top: A.ledgeRow, floor: FLOOR, kind: 'hmColumn' }));
  ent('firedrake', A.drake, FLOOR - 1, { face: -1 });
  const seal = ((A.x0 + A.x1 + 1) / 2) * TS;
  const arena = { x0: A.x0 * TS, x1: (A.x1 + 1) * TS, floor: FLOOR * TS, trigger: A.trigger * TS, wallL: A.wallL, wallR: A.wallR, boss: 'firedrake', music: 'boss3',
    tint: '#a03a1a', tintA: 0.12, seal,
    ledges: A.ledges.map(([a, b]) => [a * TS, (b + 1) * TS, (FLOOR - A.ledgeRow) * TS]),
    ledgeTiles: A.ledges.map(([a, b]) => [a, b, A.ledgeRow]) };
  sign(A.wallL - 2, FLOOR - 1, HM_SIGNS.drake);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 5, y: 21 }, pools, falls: [], moversExtra: [],
    arena, heartLevel: true, caldKit: true, rule: HEART_RULE,
    hmCrust: crusts, hmWards: wards, hmChains: chains, hmZones: ZONES, hmLeapers: leapers,
    waterHurts: true,                                       /* the magma BURNS and hands you back to the last bank (src/main.js: a fire pool, L.waterHurts) */
    calm: [[0, W - 1, 0, H - 1]],                            /* placed wholly by hand: nothing sprinkled */
    checkRun: 260,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: A.wallL - 2, hi: W - 1, spots: 0, why: "THE CALDERA: the drake's arena - no squad stands in it" }],
    unlocks: [
      { kind: 'hmward', opens: 'a bridge (the crust it holds stays through the next beat)', hud: 'THE CRUST HOLDS' },
    ],
    structures, floatMachines: A.ledges.map(([a, b]) => ({ x0: a, x1: b, y0: A.ledgeRow, y1: A.ledgeRow, why: "THE FIRE DRAKE's basalt ledges: they stand on drawn columns and sink in its P3 (src/fire-drake-hands.js)" })),
    duskStart: 99999, duskLen: 1, music: 'mountain', night: false, glowNight: false,
    palette: { dress: 'none', near: 'none', noFg: true, noNear: true, haze: 'rgba(200,90,40,0.16)', sky: [[40, 16, 14], [130, 50, 26]], ledges: 'rock' },
    ambient: [{ x0: 0, x1: W * TS, kind: 'blaze2' }],
    tints: [[-24, W + 24, [255, 140, 90], 0.05]],
    reachExact: false,
  };
}
/* THE CALDERA's geometry in this level (DC's room, its floor at row 32, its door column at 350) */
export const DC_X = (() => {
  const dx = 350 - DC.wallL, floor = 32;
  return { wallL: 350, wallR: DC.wallR + dx, x0: DC.x0 + dx, x1: DC.x1 + dx, trigger: DC.trigger + dx, drake: DC.drake + dx, floor,
    ledges: DC.ledges.map(([a, b]) => [a + dx, b + dx]), ledgeRow: floor - (DC.FLOOR - DC.ledgeRow) };
})();
