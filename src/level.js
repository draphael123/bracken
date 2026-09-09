// level.js — the level registry. Each level paints a tile grid with a tiny DSL and returns it.
export const TS = 16;
export const T = { AIR: 0, SOLID: 1, ONEWAY: 2, SPIKE: 3, CRATE: 4, REED: 5 };

function painter(W, H) {
  const grid = new Uint8Array(W * H), ents = [];
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const block = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); };
  const floor = (x0, x1, top) => block(x0, x1, top, H - 1);
  const plat = (x, y, len) => { for (let i = 0; i < len; i++) set(x + i, y, T.ONEWAY); };
  const reeds = (x, y, len) => { for (let i = 0; i < len; i++) set(x + i, y, T.REED); };
  const spikes = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); };
  const crate = (x, y) => set(x, y, T.CRATE);
  const ent = (t, x, y, extra = {}) => ents.push({ t, x, y, ...extra });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  return { W, H, grid, ents, set, block, floor, plat, reeds, spikes, crate, ent, coins };
}

function brackenWood() {
  const L = painter(312, 28);
  const { block, floor, plat, spikes, crate, ent, coins } = L;

  // ---- 1. Glade: learn to move, jump, swing ----
  floor(0, 30, 22);
  ent('sign', 5, 21, { text: 'ARROWS/WASD MOVE   Z JUMP   X SWING' });
  coins([12, 20], [13, 19], [14, 20]);
  ent('sprig', 22, 21, { face: -1 });
  floor(34, 49, 22);
  coins([31, 19], [32, 18], [33, 19]);
  crate(40, 21); crate(44, 21); crate(44, 20);
  ent('sprig', 47, 21, { face: -1 });
  floor(53, 84, 22);
  coins([50, 19], [51, 18], [52, 19]);

  // ---- 2. Spitter ledge, then the shieldbearer step ----
  block(58, 63, 20, 21);
  ent('spit', 58, 19, { face: -1 });
  ent('coin', 62, 19);
  block(66, 75, 20, 21);
  ent('shield', 71, 19, { face: -1 });
  plat(64, 18, 6);
  coins([66, 17], [68, 17]);
  ent('sign', 78, 21, { text: 'DOWN+X IN THE AIR: PLUNGE.  BOUNCE OFF FOES.' });
  ent('check', 82, 21);

  // ---- 3. Wasp pit: pogo chain ----
  ent('wasp', 87, 20); ent('wasp', 90, 20); ent('wasp', 93, 20); ent('wasp', 96, 20);
  floor(98, 120, 22);
  coins([99, 20], [100, 19], [101, 20]);
  ent('sign', 103, 21, { text: 'C BLOCK   V DODGE.   SPINED BACKS BREAK THE PLUNGE.' });
  ent('thorn', 109, 21, { face: -1 });
  crate(111, 21); crate(112, 21); crate(112, 20);
  ent('sprig', 116, 21, { face: -1 });

  // ---- 4. Thorn climb ----
  floor(121, 129, 22);
  spikes(122, 129, 21);
  plat(119, 20, 3); plat(123, 18, 3); plat(127, 16, 3); plat(123, 14, 3); plat(127, 12, 3);
  coins([124, 17], [128, 15], [124, 13]);

  // ---- 5. Plateau ----
  block(130, 160, 12, 27);
  ent('check', 133, 11);
  coins([136, 10], [138, 10], [140, 10]);
  block(144, 146, 10, 11);
  ent('spit', 145, 9, { face: -1 });
  ent('wasp', 145, 7);
  ent('thorn', 153, 11, { face: -1 });
  crate(157, 11);
  ent('mover', 161, 12, { len: 3, range: 8 });
  coins([164, 9], [167, 9]);

  // ---- 6. Arena ----
  block(172, 199, 12, 27);
  ent('thorn', 178, 11, { face: -1 });
  ent('shield', 184, 11, { face: -1 });
  ent('sprig', 189, 11, { face: -1 });
  ent('thorn', 196, 11, { face: -1 });
  block(191, 194, 9, 11);
  ent('spit', 192, 8, { face: -1 });
  plat(186, 8, 4);
  coins([176, 9], [187, 7], [188, 7]);

  // ---- 7. The hollow: a drop, a stream, a shrine ----
  block(200, 214, 15, 27);
  ent('sprig', 206, 14, { face: -1 });
  coins([203, 13], [209, 12], [212, 13]);
  block(218, 234, 15, 27);
  coins([215, 12], [216, 11], [217, 12]);
  ent('check', 221, 14);
  ent('thorn', 228, 14, { face: -1 });
  crate(232, 14); crate(232, 13);

  // ---- 8. The ridge: log climb under fire, a wasp gap, the last stand ----
  plat(236, 13, 3); plat(240, 11, 3);
  coins([237, 12], [241, 10]);
  block(243, 250, 9, 27);
  ent('spit', 244, 8, { face: 1 });
  ent('wasp', 252, 7); ent('wasp', 254, 7);
  block(255, 311, 9, 27);
  ent('shield', 259, 8, { face: -1 });
  ent('thorn', 265, 8, { face: -1 });
  plat(262, 5, 4);
  coins([257, 7], [263, 4], [264, 4]);
  ent('check', 268, 8);
  ent('gate', 272, 8);

  // ---- 9. The hive clearing: the Hornet Queen ----
  // Vine walls at 275 and 309 close once you step in past 280.
  block(311, 311, 0, 8);
  ent('queen', 292, 3);

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 },
    pools: [{ x0: 85 * TS, x1: 98 * TS, y: 23 * TS }, { x0: 161 * TS, x1: 172 * TS, y: 13 * TS }, { x0: 215 * TS, x1: 218 * TS, y: 16 * TS }, { x0: 251 * TS, x1: 255 * TS, y: 10 * TS }],
    falls: [],
    duskStart: 2700, duskLen: 1000, music: 'theme',
    weather: [{ x0: 0, x1: 1500, kind: 'pollen' }, { x0: 3150, x1: 3800, kind: 'mist' }, { x0: 4350, x1: 99999, kind: 'rain' }],
    ambient: [{ x0: 0, x1: 3150, kind: 'forest' }, { x0: 3150, x1: 3800, kind: 'water' }, { x0: 3800, x1: 4350, kind: 'forest' }, { x0: 4350, x1: 99999, kind: 'hive' }],
    arena: { x0: 276 * TS, x1: 309 * TS, floor: 9 * TS, trigger: 280 * TS, wallL: 275, wallR: 309, boss: 'queen' },
  };
}

function marshWood() {
  const L = painter(388, 28);
  const { block, floor, plat, reeds, crate, ent, coins } = L;
  const pools = [], movers = [];
  // shallow pools: the dip floor is one tile below the banks; the surface sits 4px under the bank top
  const water = (x0, x1, yTop, shallow = false) => pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: yTop * TS + (shallow ? 4 : 0), shallow, depth: shallow ? 12 : 0 });

  // ---- 1. The bank ----
  floor(0, 24, 22);
  ent('sign', 5, 21, { text: 'PADS SINK UNDER YOU.  KEEP MOVING.' });
  ent('sprig', 16, 21, { face: -1 });
  coins([9, 20], [12, 19]);

  // ---- 2. Lily pond: pads that sink ----
  water(25, 43, 23);
  for (const x of [27, 30, 33, 36, 39, 42]) ent('pad', x, 22);
  coins([30, 20], [36, 20], [42, 20]);
  floor(44, 55, 22);
  ent('check', 47, 21);

  // ---- 3. Reed climb under an archer ----
  reeds(49, 20, 3); reeds(52, 18, 3); reeds(55, 16, 2);
  block(56, 74, 16, 27);
  ent('archer', 62, 15, { face: -1 });
  ent('sign', 58, 15, { text: 'SLASH AN ARROW TO SEND IT BACK.' });
  coins([50, 19], [53, 17]);

  // ---- 4. Archer island ----
  water(75, 79, 17); ent('wasp', 77, 14);
  block(80, 86, 16, 27); ent('archer', 83, 15, { face: -1 }); coins([82, 14], [84, 14]);
  water(87, 90, 17); ent('wasp', 89, 14);
  block(91, 110, 16, 27);
  ent('sprig', 100, 15, { face: -1 }); crate(106, 15); crate(106, 14);

  // ---- 5. Wading shallows: a dip in the ground, water to just under the banks ----
  block(111, 130, 18, 27); block(113, 128, 19, 27); for (let x = 113; x <= 128; x++) L.set(x, 18, 0);
  water(113, 128, 18, true);
  ent('sign', 112, 17, { text: 'SHALLOWS ARE SLOW AND TIRING.' });
  ent('hopper', 118, 18, { face: -1 }); ent('hopper', 125, 18, { face: 1 });
  coins([115, 15], [121, 15], [127, 15]);

  // ---- 6. Drift stream: logs ride the current, against you ----
  water(131, 160, 19);
  for (let i = 0; i < 6; i++) movers.push({ kind: 'drift', x0: 131 * TS, x1: 161 * TS - 48, x: 132 * TS + i * 78, y: 18 * TS + 8, w: 48, h: 8, speed: 26 });
  coins([138, 16], [147, 16], [156, 16]);
  block(161, 175, 18, 27);
  ent('archer', 163, 17, { face: -1 });
  ent('check', 168, 17); crate(173, 17);

  // ---- 7. The long river: a big raft, frogs leaping aboard, archers overhead ----
  water(176, 259, 19);
  movers.push({ kind: 'raft', x0: 176 * TS, x1: 256 * TS - 96, x: 176 * TS, y: 18 * TS + 8, w: 96, h: 8, speed: 40, frogs: true });
  plat(200, 12, 4); ent('archer', 202, 11, { face: -1 });
  plat(236, 12, 4); ent('archer', 238, 11, { face: 1 });
  ent('wasp', 190, 15); ent('wasp', 218, 15); ent('wasp', 248, 15);
  coins([185, 15], [191, 13], [212, 15], [219, 13], [232, 15], [249, 13]);
  block(260, 274, 18, 27);
  ent('check', 264, 17); crate(270, 17); ent('hopper', 268, 17, { face: -1 });

  // ---- 8. The flooded grove: pools, pads, hoppers ----
  block(275, 318, 18, 27);
  for (let x = 280; x <= 292; x++) L.set(x, 18, 0); water(280, 292, 18, true);
  ent('hopper', 283, 18, { face: -1 }); ent('hopper', 289, 18, { face: -1 });
  reeds(294, 15, 3); coins([295, 14], [282, 15], [288, 15]);
  for (let x = 297; x <= 306; x++) for (let y = 18; y <= 27; y++) L.set(x, y, 0);
  water(297, 306, 19);
  for (const x of [298, 301, 304]) ent('pad', x, 18);
  coins([299, 16], [302, 16], [305, 16]);
  ent('thorn', 311, 17, { face: -1 }); ent('hopper', 316, 17, { face: -1 });
  crate(314, 17);

  // ---- 9. Mud flats ----
  block(319, 340, 18, 27);
  ent('thorn', 324, 17, { face: -1 });
  for (let x = 328; x <= 334; x++) L.set(x, 18, 0); water(328, 334, 18, true);
  ent('hopper', 331, 18, { face: -1 });
  reeds(336, 15, 3); coins([337, 14], [330, 15]);
  ent('check', 339, 17);

  // ---- 10. The frog pond ----
  block(341, 387, 18, 27);
  for (let x = 352; x <= 372; x++) L.set(x, 18, 0); water(352, 372, 18, true);
  ent('frog', 362, 17);

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 }, pools, falls: [], moversExtra: movers,
    duskStart: undefined, music: 'theme2',
    palette: { grass: '#4a9a6e', grassL: '#7fd1a0', grassD: '#2f6e50', dirt: '#5a4a3c', dirtL: '#736050', dirtD: '#3d3128', sky: [[118, 138, 158], [172, 192, 178]], canopy: ['#1f4a3a', '#2a5e46', '#3a7a55', '#4f9a68'] },
    weather: [{ x0: 0, x1: 99999, kind: 'rain' }, { x0: 1750, x1: 2100, kind: 'mist' }, { x0: 4400, x1: 4800, kind: 'mist' }, { x0: 5100, x1: 5500, kind: 'mist' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'rain' }],
    arena: { x0: 343 * TS, x1: 385 * TS, floor: 18 * TS, trigger: 349 * TS, wallL: 342, wallR: 386, boss: 'frog' },
  };
}

export const LEVELS = [
  { id: 'wood', name: 'BRACKEN WOOD', sub: 'forest and hive', build: brackenWood },
  { id: 'marsh', name: 'MARSH WOOD', sub: 'water and the frog', build: marshWood, needs: 'wood' },
];
