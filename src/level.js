// level.js — the level registry. Each level paints a tile grid with a tiny DSL and returns it.
export const TS = 16;
export const T = { AIR: 0, SOLID: 1, ONEWAY: 2, SPIKE: 3, CRATE: 4, REED: 5, PALISADE: 7, PLANK: 8, NET: 9, BOUNCER: 10, SHELF: 11 };

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
  const L = painter(324, 28);
  const { block, floor, plat, spikes, crate, ent, coins, set } = L;

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
  plat(148, 5, 5); coins([149, 4], [150, 4], [151, 4], [152, 4]); // pogo the wasp for the cache
  ent('thorn', 153, 11, { face: -1 });
  crate(157, 11);
  ent('mover', 161, 12, { len: 3, range: 8 });
  coins([164, 9], [167, 9]);

  // ---- 6. Arena ----
  block(172, 199, 12, 27);
  ent('check', 174, 11);
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

  // ---- 8. The ridge: log climb under fire, a wasp gap, then the helm pit ----
  plat(236, 13, 3); plat(240, 11, 3);
  coins([237, 12], [241, 10]);
  block(243, 250, 9, 27);
  ent('spit', 244, 8, { face: 1 });
  ent('wasp', 252, 7); ent('wasp', 254, 7);
  block(255, 323, 9, 27);
  // the helm pit: four shieldbearers on posts over spikes. Their helms clank and bounce you across.
  for (let x = 258; x <= 266; x++) for (let y = 9; y <= 12; y++) set(x, y, 0);
  spikes(258, 266, 12);
  for (const x of [259, 262, 265]) { block(x, x + 1, 11, 12); ent('shield', x, 10, { face: -1 }); }
  ent('sign', 256, 8, { text: 'THEIR HELMS ARE STEPPING STONES.' });
  plat(262, 5, 4); coins([263, 4], [264, 4], [260, 8], [264, 8]);
  // the quiet walk: nothing to fight between the pit and the gate
  coins([270, 7], [273, 7], [276, 7]);
  ent('check', 280, 8);
  ent('gate', 284, 8);

  // ---- 9. The hive clearing: the Hornet Queen. Two low combs to fight from. ----
  // Vine walls at 287 and 321 close once you step in past 292.
  block(323, 323, 0, 8);
  plat(292, 6, 3); plat(315, 6, 3);
  ent('deco', 296, 8, { kind: 'hiveBg' }); ent('deco', 314, 8, { kind: 'hiveBg' });
  ent('deco', 293, 5, { kind: 'drip', hang: true }); ent('deco', 300, 4, { kind: 'drip', hang: true }); ent('deco', 309, 5, { kind: 'drip', hang: true }); ent('deco', 318, 4, { kind: 'drip', hang: true });
  ent('queen', 304, 3);

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 },
    pools: [{ x0: 85 * TS, x1: 98 * TS, y: 23 * TS }, { x0: 161 * TS, x1: 172 * TS, y: 13 * TS }, { x0: 215 * TS, x1: 218 * TS, y: 16 * TS }, { x0: 251 * TS, x1: 255 * TS, y: 10 * TS }],
    falls: [],
    duskStart: 2700, duskLen: 1000, music: 'theme',
    weather: [{ x0: 0, x1: 1500, kind: 'pollen' }, { x0: 3150, x1: 3800, kind: 'mist' }, { x0: 4540, x1: 99999, kind: 'rain' }],
    ambient: [{ x0: 0, x1: 3150, kind: 'forest' }, { x0: 3150, x1: 3800, kind: 'water' }, { x0: 3800, x1: 4540, kind: 'forest' }, { x0: 4540, x1: 99999, kind: 'hive' }],
    arena: { x0: 288 * TS, x1: 321 * TS, floor: 9 * TS, trigger: 292 * TS, wallL: 287, wallR: 321, boss: 'queen', tint: '#e0b040', tintA: 0.12, fx: 'bees' },
  };
}

function marshWood() {
  const L = painter(406, 28);
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
  ent('check', 109, 15);

  // ---- 5. Wading shallows: a dip in the ground, water to just under the banks ----
  block(111, 130, 18, 27); block(113, 128, 19, 27); for (let x = 113; x <= 128; x++) L.set(x, 18, 0);
  water(113, 128, 18, true);
  ent('sign', 112, 17, { text: 'SHALLOWS ARE SLOW AND TIRING.' });
  ent('hopper', 118, 18, { face: -1 }); ent('hopper', 125, 18, { face: 1, color: 'yellow' });
  coins([115, 15], [121, 15], [127, 15]);
  reeds(120, 14, 2); reeds(124, 11, 2); coins([124, 9], [125, 9], [121, 12]); // the reed cache

  // ---- 6. Drift stream: logs ride the current, against you ----
  water(131, 160, 19);
  for (let i = 0; i < 6; i++) movers.push({ kind: 'drift', x0: 131 * TS, x1: 161 * TS - 48, x: 132 * TS + i * 78, y: 18 * TS + 8, w: 48, h: 8, speed: 26 });
  coins([138, 16], [147, 16], [156, 16]);
  block(161, 175, 18, 27);
  ent('check', 168, 17); crate(173, 17);

  // ---- 7. The long river: a big raft, frogs leaping aboard, archers overhead ----
  water(176, 259, 19);
  movers.push({ kind: 'raft', x0: 176 * TS, x1: 258 * TS - 224, x: 176 * TS, y: 18 * TS + 8, w: 224, h: 8, speed: 40, frogs: true, frogMax: 4, frogEvery: 2.2 });
  plat(200, 12, 4); plat(236, 12, 4);
  ent('check', 202, 11);
  ent('wasp', 190, 15); ent('wasp', 218, 15); ent('wasp', 248, 15);
  coins([185, 15], [191, 13], [212, 15], [219, 13], [232, 15], [249, 13]);
  block(260, 274, 18, 27);
  ent('check', 264, 17); crate(270, 17); ent('hopper', 268, 17, { face: -1, color: 'blue' });

  // ---- 8. The flooded grove: a dip full of hoppers, then the slow raft under the archers ----
  block(275, 296, 18, 27);
  for (let x = 280; x <= 292; x++) L.set(x, 18, 0); water(280, 292, 18, true);
  ent('hopper', 283, 18, { face: -1, color: 'yellow' }); ent('hopper', 289, 18, { face: -1, color: 'blue' });
  reeds(294, 15, 3); coins([295, 14], [282, 15], [288, 15]);
  ent('check', 296, 17);
  for (let x = 297; x <= 334; x++) for (let y = 18; y <= 27; y++) L.set(x, y, 0);
  water(297, 334, 19);
  movers.push({ kind: 'raft', x0: 297 * TS, x1: 329 * TS - 144, x: 297 * TS, y: 18 * TS + 8, w: 144, h: 8, speed: 26, frogs: true, frogMax: 3, frogEvery: 2.8 });
  plat(309, 11, 3); ent('archer', 310, 10, { face: -1 }); plat(323, 11, 3); ent('archer', 324, 10, { face: -1 });
  ent('wasp', 313, 15); ent('wasp', 326, 15);
  coins([303, 15], [308, 10], [316, 15], [322, 10], [329, 15]);
  for (const x of [330, 332, 334]) ent('pad', x, 18); // finish the crossing on sinking pads while the frogs leap after you
  block(335, 344, 18, 27);
  ent('thorn', 338, 17, { face: -1 }); crate(340, 17); ent('hopper', 342, 17, { face: -1, color: 'yellow' });
  ent('check', 344, 17);

  // ---- 9. Mud flats, short ----
  block(345, 358, 18, 27);
  ent('thorn', 348, 17, { face: -1 });
  for (let x = 351; x <= 355; x++) L.set(x, 18, 0); water(351, 355, 18, true);
  ent('hopper', 353, 18, { face: -1, color: 'blue' });
  reeds(356, 15, 2); coins([357, 14], [352, 15]);

  // ---- 10. The Croaking Court: a shallow pond, reed perches, and the King on his mud dais ----
  block(359, 405, 18, 27);
  for (let x = 367; x <= 380; x++) L.set(x, 18, 0); water(367, 380, 18, true);
  reeds(363, 16, 2); reeds(382, 16, 2);
  block(386, 401, 17, 17);
  for (let x = 402; x <= 403; x++) L.set(x, 18, 0); water(402, 403, 18, true);
  ent('throne', 394, 16); ent('frog', 394, 16);
  ent('deco', 364, 17, { kind: 'frogStatue', v: 0 }); ent('deco', 389, 16, { kind: 'frogStatue', v: 1 }); ent('deco', 399, 16, { kind: 'frogStatue', v: 0 });
  ent('deco', 370, 18, { kind: 'lilyLantern' }); ent('deco', 377, 18, { kind: 'lilyLantern' }); ent('deco', 402, 18, { kind: 'lilyLantern' });

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 }, pools, falls: [], moversExtra: movers,
    duskStart: undefined, music: 'theme2',
    palette: { dress: 'marsh', haze: 'rgba(172,192,178,0.24)', grass: '#4a9a6e', grassL: '#7fd1a0', grassD: '#2f6e50', dirt: '#5a4a3c', dirtL: '#736050', dirtD: '#3d3128', sky: [[118, 138, 158], [172, 192, 178]], canopy: ['#1f4a3a', '#2a5e46', '#3a7a55', '#4f9a68'] },
    weather: [{ x0: 0, x1: 99999, kind: 'rain' }, { x0: 1750, x1: 2100, kind: 'mist' }, { x0: 4400, x1: 4800, kind: 'mist' }, { x0: 5400, x1: 5760, kind: 'mist' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'rain' }],
    arena: { x0: 361 * TS, x1: 403 * TS, floor: 18 * TS, trigger: 367 * TS, wallL: 360, wallR: 404, boss: 'frog', dais: { x0: 386 * TS, x1: 402 * TS, h: 16 }, tint: '#3a8a5a', tintA: 0.1, fx: 'motes' },
  };
}


function theStockade() {
  const L = painter(366, 28);
  const { block, floor, plat, crate, ent, coins, set } = L;
  const pal = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PALISADE); };
  const planks = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.PLANK); };
  const net = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.NET); };
  const movers = [];

  // ---- 1. The outer wood: first signs of the goblins ----
  floor(0, 70, 20);
  ent('sign', 4, 19, { text: 'THE GOBLINS BUILT HERE. BREAK IT.' });
  ent('sprig', 14, 19, { face: -1 }); ent('sprig', 22, 19, { face: -1 });
  coins([9, 18], [18, 17], [26, 18]);
  ent('cage', 31, 19, { kind: 'bird' });
  ent('torch', 36, 19); ent('treehouse', 40, 8);

  // ---- 2. Watchpost: a horn on the tower. Silence it first. ----
  block(54, 56, 14, 19); plat(53, 13, 5); ent('towertop', 55, 13);
  plat(46, 17, 3); plat(50, 14, 2); plat(59, 16, 2); plat(58, 13, 2); // two ways up
  ent('archer', 55, 12, { face: -1, horn: true });
  ent('check', 45, 19);
  ent('sign', 44, 19, { text: 'SILENCE THE HORN FIRST.' });
  ent('sprig', 60, 19, { face: -1 }); ent('sapper', 66, 19, { face: -1 });
  coins([47, 15], [51, 12], [64, 18]);

  // ---- 3. Rope bridge over the ravine, with a goblin at the far end holding a knife ----
  planks(71, 74, 20); planks(75, 86, 21); planks(87, 90, 20);
  net(71, 90, 25); coins([76, 24], [79, 24], [82, 24], [85, 24]); // the ravine cache, on the net
  plat(78, 23, 3); plat(83, 23, 3); block(87, 90, 23, 27); block(89, 90, 22, 27);
  ent('bridge', 71, 20, { x1: 90 });
  floor(91, 185, 20);
  ent('sprig', 92, 19, { face: -1, cutter: true });
  coins([76, 19], [81, 19], [86, 19]);
  ent('check', 95, 19);

  // ---- 4. The palisade gate: crank it open, or roll a barrel into it ----
  ent('barrel', 96, 19); ent('crank', 98, 19, { wall: 101 });
  pal(101, 15, 19);
  ent('sapper', 106, 19, { face: -1 }); ent('sapper', 112, 19, { face: -1 }); ent('sprig', 109, 19, { face: -1 });
  ent('torch', 103, 19); ent('torch', 115, 19);

  // ---- 5. The yard: every tool in one room. Free the fox, tip the brazier on the hounds, roll the barrel into the inner gate. ----
  ent('treehouse', 122, 7); ent('treehouse', 150, 6); ent('treehouse', 176, 8);
  block(120, 128, 17, 19); ent('brute', 124, 16, { face: -1 }); coins([121, 15], [126, 15]);
  ent('check', 131, 19);
  ent('sign', 133, 19, { text: 'THE YARD. FREE THE FOX. TIP THE BRAZIER. ROLL THE BARREL.' });
  ent('hound', 136, 19, { face: -1 }); ent('cage', 139, 19, { kind: 'fox' });
  ent('sprig', 144, 19, { face: -1 }); ent('brazier', 150, 19); ent('sprig', 153, 19, { face: 1 }); ent('hound', 157, 19, { face: -1 }); ent('sprig', 159, 19, { face: -1 });
  ent('barrel', 162, 19); ent('shield', 165, 19, { face: -1 }); ent('crank', 167, 19, { wall: 170 });
  pal(170, 15, 19);
  ent('brute', 175, 19, { face: -1 }); ent('sapper', 179, 19, { face: -1 }); ent('archer', 182, 19, { face: -1 });
  ent('torch', 130, 19); ent('torch', 147, 19); ent('torch', 173, 19); ent('torch', 181, 19);
  coins([141, 17], [155, 17], [164, 17], [177, 18]);
  ent('check', 184, 19);

  // ---- 5b. The kennels and the armoury: hounds in the yard, an archer on the shed, barrels by the inner gate ----
  floor(186, 249, 20);
  ent('torch', 188, 19); ent('hound', 193, 19, { face: -1 }); ent('cage', 199, 19, { kind: 'bird' });
  block(202, 208, 18, 19); ent('archer', 205, 17, { face: -1 }); coins([203, 16], [207, 16]);
  ent('sapper', 211, 19, { face: -1 }); ent('torch', 214, 19); ent('brute', 217, 19, { face: -1 }); ent('check', 215, 19);
  ent('treehouse', 221, 6);
  ent('barrel', 223, 19); ent('barrel', 226, 19); ent('crank', 229, 19, { wall: 232 }); ent('shield', 231, 19, { face: -1 });
  pal(232, 15, 19);
  ent('sprig', 236, 19, { face: -1 }); ent('hound', 240, 19, { face: -1 }); ent('torch', 235, 19); ent('torch', 246, 19);
  coins([193, 17], [213, 17], [224, 16], [238, 17], [244, 18]);
  ent('check', 247, 19);

  // ---- 6. The lift to the upper walkway ----
  for (let y = 20; y <= 27; y++) { set(250, y, 0); set(251, y, 0); } net(250, 251, 26);
  movers.push({ kind: 'lift', x: 250 * TS, y: 20 * TS, y0: 20 * TS, y1: 12 * TS, w: 32, h: 8, speed: 30 });
  block(252, 269, 12, 27);
  ent('sapper', 260, 11, { face: -1 }); coins([256, 10], [264, 10]);

  // ---- 7. The high bridge and the second tower ----
  planks(270, 273, 12); planks(274, 281, 13); planks(282, 285, 12);
  net(270, 285, 17);
  plat(272, 15, 2); plat(280, 15, 2); plat(283, 13, 2); // the way back up once the ropes are cut: net → ledge → bank, either side
  ent('bridge', 270, 12, { x1: 285 });
  block(286, 314, 12, 27);
  ent('sprig', 287, 11, { face: -1, cutter: true }); ent('check', 292, 11);
  plat(295, 10, 2); plat(299, 8, 2);
  block(302, 304, 8, 11); plat(301, 7, 5); ent('towertop', 303, 7);
  ent('archer', 303, 6, { face: -1, horn: true });
  ent('brute', 309, 11, { face: -1 }); ent('hound', 312, 11, { face: -1 });
  ent('torch', 290, 11); ent('torch', 308, 11);
  coins([277, 11], [296, 9], [300, 7], [311, 10]);

  // ---- 8. Down to the great hall ----
  for (let y = 12; y <= 27; y++) { set(315, y, 0); set(316, y, 0); } net(315, 316, 26);
  movers.push({ kind: 'lift', x: 315 * TS, y: 12 * TS, y0: 12 * TS, y1: 20 * TS, w: 32, h: 8, speed: 30 });
  floor(317, 365, 20);
  ent('hound', 320, 19, { face: -1 }); ent('check', 323, 19);

  // ---- 9. The great hall: the Chieftain, archers on the balcony, a brazier by the wall ----
  plat(329, 15, 4); plat(356, 15, 4);
  plat(334, 10, 4); plat(342, 9, 5); plat(351, 10, 4);
  plat(326, 18, 2); plat(336, 12, 2); plat(352, 12, 2); plat(360, 18, 2); // the rafter climb, both sides, for when the hall burns
  ent('brazier', 354, 19); ent('torch', 328, 19); ent('torch', 361, 19);
  ent('deco', 331, 19, { kind: 'banner', v: 0 }); ent('deco', 358, 19, { kind: 'banner', v: 1 }); ent('deco', 344, 19, { kind: 'boneThrone' });
  ent('deco', 336, 19, { kind: 'skullPile', v: 0 }); ent('deco', 351, 19, { kind: 'skullPile', v: 1 });
  ent('deco', 338, 8, { kind: 'hangCage', hang: true }); ent('deco', 349, 8, { kind: 'hangCage', hang: true });
  ent('chief', 343, 19);

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: movers,
    duskStart: undefined, music: 'theme', night: true,
    palette: { dress: 'camp', haze: 'rgba(24,18,44,0.3)', sky: 'night', canopy: ['#16301f', '#1f4a2a', '#2a5e36', '#3a7a48'] },
    weather: [{ x0: 1900, x1: 99999, kind: 'smoke' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'forest' }],
    arena: { x0: 327 * TS, x1: 361 * TS, floor: 20 * TS, trigger: 332 * TS, wallL: 326, wallR: 362, boss: 'chief', tint: '#c9463d', tintA: 0.1, fx: 'embers' },
  };
}


function sporewood() {
  const L = painter(376, 28);
  const { block, floor, plat, crate, ent, coins, set } = L;
  const bouncer = (x, y) => set(x, y, T.BOUNCER);
  const shelf = (x, y, len) => { for (let i = 0; i < len; i++) set(x + i, y, T.SHELF); };
  const sleeps = [];

  // ---- 1. The mycelium glade: caps bounce, puffballs burst ----
  floor(0, 44, 20);
  ent('sign', 4, 19, { text: 'CAPS BOUNCE. HOLD JUMP FOR HEIGHT.' });
  ent('glow', 8, 19); ent('puffball', 14, 19); ent('sporeling', 18, 19, { face: -1 }); ent('puffball', 22, 19);
  bouncer(27, 19); coins([27, 15], [27, 12], [27, 9]);
  ent('sporeling', 33, 19, { face: -1 }); ent('glow', 38, 19); ent('sign', 41, 19, { text: 'SLASH A PUFFBALL FROM RANGE.' });

  // ---- 2. The bouncer canyon: up the caps to the high path ----
  floor(45, 61, 26);
  bouncer(48, 25); plat(47, 19, 3); bouncer(49, 18); plat(48, 12, 3); plat(52, 12, 3); plat(56, 12, 3);
  ent('mover', 52, 16, { len: 2, range: 4, cap: true, speed: 30 });
  ent('vent', 58, 25, { period: 4, on: 1.8, h: 100 }); plat(57, 20, 3); ent('roller', 60, 25, { face: -1 });
  ent('puffball', 53, 11); ent('drone', 58, 8);
  coins([50, 16], [54, 10], [58, 10], [58, 22]); ent('glow', 46, 25); ent('glow', 61, 25);
  ent('sign', 46, 25, { text: 'VENTS LIFT. ROLLERS POP.' });
  block(60, 100, 12, 27);

  // ---- 3. The lurker grove: some of the mushrooms are hungry ----
  ent('check', 63, 11);
  ent('lurker', 70, 11); ent('sporeling', 74, 11, { face: -1 }); ent('puffball', 76, 11); ent('lurker', 79, 11); ent('roller', 85, 11, { face: -1 });
  ent('glow', 66, 11); ent('glow', 83, 11); ent('lurker', 87, 11); bouncer(90, 11); shelf(91, 7, 3); coins([91, 6], [92, 6], [93, 6]); // the grove cache ent('sporeling', 91, 11, { face: -1 }); ent('puffball', 94, 11); ent('glow', 97, 11);
  coins([72, 9], [81, 9], [89, 9]);

  // ---- 4. Shelf climb under the shaman; shelves snap under you ----
  shelf(99, 10, 2); shelf(96, 8, 2); shelf(99, 6, 2);
  block(101, 130, 4, 27);
  ent('shaman', 108, 3, { face: -1 }); ent('sporeling', 114, 3, { face: -1 }); ent('sporeling', 119, 3, { face: -1 });
  for (let x = 121; x <= 125; x++) for (let y = 4; y <= 27; y++) set(x, y, 0); shelf(121, 4, 5);
  block(121, 125, 12, 27); bouncer(123, 11); ent('glow', 122, 11); // the shelf gives way onto a cap: plunge into it to spring back up
  ent('glow', 104, 3); ent('glow', 128, 3); ent('check', 127, 3); coins([97, 7], [111, 2], [123, 2]);

  // ---- 5. The sleep marsh: violet spores. Block to hold your breath. ----
  block(131, 165, 14, 27);
  plat(132, 8, 2); ent('glow', 132, 13); // a landing on the way down
  ent('sign', 134, 13, { text: 'VIOLET SPORES PUT YOU TO SLEEP. BLOCK THROUGH.' });
  sleeps.push({ x0: 137 * TS, x1: 147 * TS, y0: 10 * TS, y1: 14 * TS }, { x0: 153 * TS, x1: 162 * TS, y0: 10 * TS, y1: 14 * TS });
  // ride the gusts over the violet: each vent lifts you to a shelf, the shelf gives way, the next gust catches you
  ent('vent', 139, 13, { period: 4, on: 1.5, h: 90, phase: 0 }); ent('vent', 144, 13, { period: 4, on: 1.5, h: 90, phase: 2 }); ent('vent', 155, 13, { period: 4, on: 1.5, h: 90, phase: 1 }); ent('vent', 160, 13, { period: 4, on: 1.5, h: 90, phase: 3 });
  shelf(138, 9, 3); shelf(143, 9, 3); shelf(154, 9, 3); shelf(159, 9, 3);
  ent('sporeling', 142, 13, { face: -1 }); ent('drone', 145, 9); ent('sporeling', 150, 13, { face: -1 }); ent('drone', 158, 10); ent('shield', 160, 13, { face: -1 });
  ent('vent', 148, 13, { period: 5, on: 2, h: 90, phase: 1 }); plat(146, 8, 5); coins([147, 7], [150, 7]);
  ent('glow', 135, 13); ent('glow', 149, 13); ent('glow', 164, 13); coins([140, 11], [156, 11]);
  ent('check', 165, 13);

  // ---- 6. The mycelium tunnels: low roof, no room to plunge ----
  block(166, 200, 14, 27); block(166, 200, 0, 10);
  ent('lurker', 172, 13); ent('sporeling', 176, 13, { face: -1 }); ent('roller', 181, 13, { face: -1, speed: 70 }); ent('puffball', 185, 13);
  ent('lurker', 189, 13); ent('sporeling', 193, 13, { face: -1 }); ent('shield', 197, 13, { face: -1 });
  ent('glow', 168, 13); ent('glow', 178, 13); ent('glow', 187, 13); ent('glow', 196, 13); coins([174, 12], [183, 12], [191, 12]);

  // ---- 6b. The lantern terrace: glow caps light the way, a second shaman raises the dead ----
  floor(201, 244, 14);
  ent('check', 202, 13); ent('glow', 203, 13); ent('puffball', 206, 13); ent('lurker', 210, 13); ent('sporeling', 214, 13, { face: -1 }); ent('glow', 217, 13);
  ent('vent', 208, 13, { period: 4.5, on: 1.8, h: 96, phase: 2 }); plat(206, 8, 4); coins([207, 7], [209, 7]); ent('mover', 229, 9, { len: 2, range: 5, cap: true, speed: 34 }); ent('glow', 233, 13);
  bouncer(220, 13); plat(218, 8, 5); coins([220, 10], [219, 6], [221, 6]);
  sleeps.push({ x0: 226 * TS, x1: 233 * TS, y0: 8 * TS, y1: 14 * TS }); ent('sporeling', 229, 13, { face: -1 }); ent('glow', 227, 13);
  ent('shaman', 237, 13, { face: -1 }); ent('sporeling', 241, 13, { face: -1 }); ent('glow', 243, 13);
  ent('sign', 244, 13, { text: 'THE PILLARS. HOLD JUMP, OR PLUNGE INTO THE CAPS.' });
  ent('sign', 201, 13, { text: 'THE STORM. LIT CAPS KEEP THE SPORES OFF.' });
  coins([208, 12], [231, 11], [239, 11]);

  // ---- 7. The drone gauntlet: caps on pillars over the drop ----
  shelf(252, 21, 3); shelf(258, 20, 3); shelf(264, 21, 3); // the low road: shelves that give way
  block(245, 271, 26, 27); for (const x of [247, 253, 259, 265, 270]) bouncer(x, 25); ent('glow', 250, 25); ent('glow', 262, 25); // the pit has a floor: caps on it spring you back to the low road
  for (const [px0, top] of [[249, 18], [255, 20], [261, 18], [267, 20]]) { block(px0, px0 + 2, top, 27); for (let i = 0; i < 3; i++) bouncer(px0 + i, top - 1); }
  ent('drone', 252, 6); ent('drone', 258, 8); ent('drone', 264, 6);
  coins([252, 8], [258, 10], [264, 8], [270, 9]);
  floor(271, 295, 14);
  ent('check', 280, 13); ent('glow', 290, 13);

  // ---- 8. The hollow: the Mother Cap. Caps under her fling you up to the gills; shelves by the walls give a breather, briefly ----
  block(296, 375, 20, 27);
  bouncer(332, 19); bouncer(338, 19);
  shelf(327, 15, 2); shelf(342, 15, 2);
  ent('gill', 330, 13); ent('gill', 333, 12); ent('gill', 337, 12); ent('gill', 340, 13);
  ent('mother', 335, 19);
  ent('deco', 305, 19, { kind: 'rootDecor', v: 0 }); ent('deco', 318, 19, { kind: 'rootDecor', v: 1 }); ent('deco', 352, 19, { kind: 'rootDecor', v: 2 }); ent('deco', 366, 19, { kind: 'rootDecor', v: 0 });
  ent('deco', 310, 19, { kind: 'sporePod' }); ent('deco', 322, 19, { kind: 'sporePod' }); ent('deco', 348, 19, { kind: 'sporePod' }); ent('deco', 360, 19, { kind: 'sporePod' });
  ent('deco', 314, 19, { kind: 'skullPile', v: 0 }); ent('deco', 356, 19, { kind: 'skullPile', v: 1 });
  ent('glow', 300, 19); ent('glow', 370, 19); ent('glow', 314, 19); ent('glow', 356, 19);
  coins([306, 17], [364, 17]);

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: [], sleeps,
    duskStart: -1, duskLen: 1, music: 'theme2', night: false, glowNight: true,
    palette: { sky: [[64, 96, 112], [150, 190, 160]], near: 'mushroom', myc: false, dress: 'myc', haze: 'rgba(120,160,140,0.2)', grass: '#4a8a4a', grassL: '#7ac860', grassD: '#2f5e3a', dirt: '#4a3a3c', dirtL: '#5e4c4a', dirtD: '#33262a', canopy: ['#1f4a3a', '#2a5e46', '#3a7a55', '#4f9a68'] },
    weather: [{ x0: 0, x1: 99999, kind: 'spore' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'hive' }],
    storm: { x0: 201 * TS, x1: 244 * TS, y: 14 * TS },
    arena: { x0: 297 * TS, x1: 374 * TS, floor: 20 * TS, trigger: 306 * TS, wallL: 296, wallR: 375, boss: 'mother', tint: '#9a5aa8', tintA: 0.1 },
  };
}

export const LEVELS = [
  { id: 'wood', name: 'BRACKEN WOOD', sub: 'forest and hive', build: brackenWood },
  { id: 'marsh', name: 'MARSH WOOD', sub: 'water and the frog', build: marshWood, needs: 'wood' },
  { id: 'stockade', name: 'THE STOCKADE', sub: 'the goblin camp', build: theStockade, needs: 'marsh' },
  { id: 'spore', name: 'SPOREWOOD', sub: 'the deep fungus', build: sporewood, needs: 'stockade' },
];
