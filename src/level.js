// level.js — the level registry. Each level paints a tile grid with a tiny DSL and returns it.
export const TS = 16;
export const T = { AIR: 0, SOLID: 1, ONEWAY: 2, SPIKE: 3, CRATE: 4, REED: 5, PALISADE: 7, PLANK: 8, NET: 9, BOUNCER: 10, SHELF: 11, PORT: 12 };

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

// Open a gap of n columns at col: the grid, entities, movers, pools, zones and the arena all slide right, and a painter
// bound to the new grid paints the gap. Every level uses it to add a section without renumbering what came after.
function grow(L, ret, col, n) {
  const W2 = L.W + n, H = L.H; const P = painter(W2, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < L.W; x++) P.grid[y * W2 + (x >= col ? x + n : x)] = L.grid[y * L.W + x];
  const sh = x => x >= col ? x + n : x, shp = p => p >= col * TS ? p + n * TS : p;
  const REF = ['ram', 'cage', 'gate', 'door', 'bell', 'at', 'wall', 'x1'];
  for (const e of L.ents) { e.x = sh(e.x); for (const k of REF) if (typeof e[k] === 'number') e[k] = sh(e[k]); }
  const R = Object.assign({}, ret, { W: W2 });
  if (R.pools) R.pools = R.pools.map(p => ({ ...p, x0: shp(p.x0), x1: shp(p.x1) }));
  if (R.sleeps) R.sleeps = R.sleeps.map(p => ({ ...p, x0: shp(p.x0), x1: shp(p.x1) }));
  if (R.moversExtra) R.moversExtra = R.moversExtra.map(m => { const o = { ...m }; for (const k of ['x', 'x0', 'x1', 'px']) if (typeof o[k] === 'number') o[k] = shp(o[k]); return o; });
  for (const k of ['weather', 'ambient']) if (R[k]) R[k] = R[k].map(z => ({ ...z, x0: shp(z.x0), x1: z.x1 >= 99999 ? z.x1 : shp(z.x1) }));
  for (const k of ['arena', 'mini']) if (R[k]) { const A = { ...R[k] }; for (const f of ['x0', 'x1', 'trigger']) if (typeof A[f] === 'number') A[f] = shp(A[f]); for (const f of ['wallL', 'wallR', 'gate']) if (typeof A[f] === 'number') A[f] = sh(A[f]); if (A.dais) A.dais = { ...A.dais, x0: shp(A.dais.x0), x1: shp(A.dais.x1) }; R[k] = A; }
  if (R.interiors) R.interiors = R.interiors.map(([x0, x1, y0, y1]) => [sh(x0), sh(x1), y0, y1]);
  if (R.stone) R.stone = R.stone.map(([x0, x1, y0, y1]) => [sh(x0), sh(x1), y0, y1]);
  if (R.scree) R.scree = R.scree.map(z => ({ ...z, x0: sh(z.x0), x1: sh(z.x1) }));
  if (typeof R.duskStart === 'number' && R.duskStart > 0) R.duskStart = shp(R.duskStart);
  if (typeof R.escapeGate === 'number') R.escapeGate = sh(R.escapeGate);
  P.R = R; P.done = () => Object.assign(R, { grid: P.grid, ents: L.ents.concat(P.ents) });
  return P;
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
  plat(148, 5, 5); coins([149, 4], [150, 4], [151, 4], [152, 4]); ent('relic', 150, 4, { kind: 'crown' }); // pogo the wasp for the cache
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

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 },
    pools: [{ x0: 85 * TS, x1: 98 * TS, y: 23 * TS }, { x0: 161 * TS, x1: 172 * TS, y: 13 * TS }, { x0: 215 * TS, x1: 218 * TS, y: 16 * TS }, { x0: 251 * TS, x1: 255 * TS, y: 10 * TS }],
    falls: [],
    duskStart: 2700, duskLen: 1000, music: 'theme',
    weather: [{ x0: 0, x1: 1500, kind: 'pollen' }, { x0: 3150, x1: 3800, kind: 'mist' }, { x0: 4540, x1: 99999, kind: 'rain' }],
    ambient: [{ x0: 0, x1: 3150, kind: 'forest' }, { x0: 3150, x1: 3800, kind: 'water' }, { x0: 3800, x1: 4540, kind: 'forest' }, { x0: 4540, x1: 99999, kind: 'hive' }],
    arena: { x0: 288 * TS, x1: 321 * TS, floor: 9 * TS, trigger: 292 * TS, wallL: 287, wallR: 321, boss: 'queen', tint: '#e0b040', tintA: 0.12, fx: 'bees' },
  }
  // ---- 5a. THE WASP ORCHARD: a fallen giant across the path (over it through the hives, or through it past the thorns), then a hive glade ----
  const G = grow(L, ret, 130, 46);
  G.block(130, 175, 12, 27);
  G.ent('sign', 131, 11, { text: 'THE FALLEN GIANT. OVER THE TOP, OR THROUGH THE HOLLOW.' });
  G.ent('check', 133, 11); G.coins([135, 10], [137, 10]);
  G.block(139, 152, 8, 11); for (let x = 139; x <= 152; x++) { G.set(x, 9, 0); G.set(x, 10, 0); G.set(x, 11, 0); } // the hollow runs the whole trunk
  G.spikes(145, 146, 11); G.ent('spit', 150, 11, { face: -1 }); G.coins([144, 10], [148, 10]);
  G.plat(136, 9, 2); G.coins([137, 8], [141, 6]); // up onto the trunk
  G.ent('wasp', 146, 6); G.ent('wasp', 150, 5); G.coins([146, 4], [150, 3]); G.ent('sprig', 144, 7, { face: -1 });
  G.plat(153, 9, 2); G.coins([154, 8]);
  G.ent('deco', 158, 11, { kind: 'hiveBg' }); G.ent('deco', 168, 11, { kind: 'hiveBg' });
  G.spikes(159, 167, 11); G.ent('wasp', 160, 9); G.ent('wasp', 163, 9); G.ent('wasp', 166, 9); G.coins([160, 7], [163, 7], [166, 7]); // pogo the wasps over the thorns
  G.ent('shield', 171, 11, { face: -1 }); G.crate(174, 11); G.coins([170, 9], [173, 10]);
  return G.done();
;
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
  reeds(120, 14, 2); reeds(124, 11, 2); coins([124, 9], [125, 9], [121, 12]); ent('relic', 125, 10, { kind: 'charm' }); // the reed cache

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

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 }, pools, falls: [], moversExtra: movers,
    duskStart: undefined, music: 'theme2',
    palette: { dress: 'marsh', haze: 'rgba(172,192,178,0.24)', grass: '#4a9a6e', grassL: '#7fd1a0', grassD: '#2f6e50', dirt: '#5a4a3c', dirtL: '#736050', dirtD: '#3d3128', sky: [[118, 138, 158], [172, 192, 178]], canopy: ['#1f4a3a', '#2a5e46', '#3a7a55', '#4f9a68'] },
    weather: [{ x0: 0, x1: 99999, kind: 'rain' }, { x0: 1750, x1: 2100, kind: 'mist' }, { x0: 4400, x1: 4800, kind: 'mist' }, { x0: 5400, x1: 5760, kind: 'mist' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'rain' }],
    arena: { x0: 361 * TS, x1: 403 * TS, floor: 18 * TS, trigger: 367 * TS, wallL: 360, wallR: 404, boss: 'frog', dais: { x0: 386 * TS, x1: 402 * TS, h: 16 }, tint: '#3a8a5a', tintA: 0.1, fx: 'motes' },
  }
  // ---- 7b. THE DROWNED VILLAGE: stilt huts over deep water. Planks, sinking pads, archers on the roofs, frogs below. ----
  const G = grow(L, ret, 275, 48);
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) G.set(x, y, T.PLANK); };
  G.block(275, 276, 18, 27); G.ent('sign', 275, 17, { text: 'THE DROWNED VILLAGE. THE PLANKS HOLD. THE WATER DOES NOT.' });
  G.R.pools.push({ x0: 277 * TS, x1: 322 * TS, y: 19 * TS, shallow: false, depth: 0 });
  plank(278, 282, 16); plank(286, 290, 15); plank(294, 298, 16); plank(302, 307, 15); plank(311, 315, 16); plank(319, 322, 17);
  G.ent('treehouse', 288, 6); G.ent('treehouse', 304, 6);
  G.ent('pad', 284, 18); G.ent('pad', 300, 18); G.ent('pad', 309, 18); G.ent('pad', 317, 18);
  G.plat(303, 11, 3); G.ent('archer', 304, 10, { face: -1 }); G.plat(287, 11, 3); G.ent('archer', 288, 10, { face: -1 });
  G.ent('wasp', 292, 13); G.ent('wasp', 310, 13);
  G.reeds(283, 15, 2); G.reeds(299, 14, 2); G.reeds(316, 15, 2);
  G.coins([280, 14], [288, 13], [296, 14], [304, 13], [313, 14], [320, 15], [284, 16], [309, 16]);
  G.ent('check', 321, 16);
  return G.done();
;
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
  net(71, 90, 25); coins([76, 24], [79, 24], [82, 24], [85, 24]); ent('relic', 86, 24, { kind: 'gauntlet' }); // the ravine cache, on the net
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
  ent('torch', 188, 19); ent('hound', 193, 19, { face: -1 }); ent('cage', 199, 19, { kind: 'bird' }); ent('deco', 196, 19, { kind: 'cart' });
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
  // the rafter climb, both sides, two tiles a jump, for when the hall burns; the gate sits on the top beam
  plat(327, 18, 2); plat(329, 16, 3); plat(333, 14, 2); plat(336, 12, 2); plat(334, 10, 4); plat(338, 11, 3); plat(342, 9, 5);
  plat(360, 18, 2); plat(356, 16, 3); plat(353, 14, 2); plat(350, 12, 2); plat(350, 10, 4); plat(347, 11, 3);
  ent('brazier', 354, 19); ent('torch', 328, 19); ent('torch', 361, 19);
  ent('deco', 331, 19, { kind: 'banner', v: 0 }); ent('deco', 358, 19, { kind: 'banner', v: 1 }); ent('deco', 344, 19, { kind: 'boneThrone' });
  ent('deco', 336, 19, { kind: 'skullPile', v: 0 }); ent('deco', 351, 19, { kind: 'skullPile', v: 1 });
  ent('deco', 344, 6, { kind: 'bough', hang: true }); ent('deco', 338, 8, { kind: 'hangCage', hang: true }); ent('deco', 349, 8, { kind: 'hangCage', hang: true });
  ent('chief', 343, 19);

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: movers,
    duskStart: undefined, music: 'theme', night: true,
    palette: { dress: 'camp', haze: 'rgba(24,18,44,0.3)', sky: 'night', canopy: ['#16301f', '#1f4a2a', '#2a5e36', '#3a7a48'] },
    weather: [{ x0: 1900, x1: 99999, kind: 'smoke' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'forest' }],
    escapeGate: 344, arena: { x0: 327 * TS, x1: 361 * TS, floor: 20 * TS, trigger: 332 * TS, wallL: 326, wallR: 362, boss: 'chief', tint: '#c9463d', tintA: 0.1, fx: 'embers' },
  }
  // ---- 5c. THE SAPPERS' TUNNEL: the goblins dug under their own inner wall. A mound blocks the surface; the tunnel is the way. ----
  const G = grow(L, ret, 250, 44);
  G.block(250, 293, 20, 27); G.block(252, 289, 14, 19); // the mound
  for (let x = 250; x <= 291; x++) for (let y = 22; y <= 24; y++) G.set(x, y, 0); // the tunnel
  for (let y = 20; y <= 21; y++) { G.set(250, y, 0); G.set(251, y, 0); G.set(290, y, 0); G.set(291, y, 0); } // the shafts
  for (let y = 20; y <= 24; y++) { G.set(290, y, T.NET); G.set(291, y, T.NET); } // a rope ladder up the far shaft
  G.ent('sign', 249, 19, { text: 'THE SAPPERS DUG UNDER THE WALL. SO WILL YOU.' });
  for (const x of [256, 266, 276, 286]) G.ent('torch', x, 24);
  G.ent('deco', 254, 24, { kind: 'skullPile', v: 0 }); G.ent('deco', 281, 24, { kind: 'skullPile', v: 1 });
  G.ent('sprig', 258, 24, { face: -1 }); G.ent('barrel', 262, 24); G.crate(264, 24); G.ent('sapper', 270, 24, { face: -1 });
  G.spikes(272, 273, 24); G.ent('sprig', 277, 24, { face: -1 }); G.ent('barrel', 279, 24); G.crate(281, 24); G.crate(281, 23);
  G.ent('sapper', 284, 24, { face: -1 }); G.ent('brute', 288, 24, { face: -1 });
  G.coins([255, 23], [260, 23], [268, 23], [275, 22], [283, 23], [289, 23]);
  G.ent('check', 292, 19); G.ent('torch', 293, 19);
  G.ent('treehouse', 262, 8); G.ent('treehouse', 278, 8); G.ent('sprig', 270, 13, { face: -1 }); G.coins([266, 12], [274, 12]); // goblins on the mound, out of reach and out of the way
  return G.done();
;
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
  ent('glow', 66, 11); ent('glow', 83, 11); ent('lurker', 87, 11); bouncer(90, 11); shelf(91, 7, 3); coins([91, 6], [92, 6], [93, 6]); ent('relic', 92, 6, { kind: 'lantern' }); // the grove cache ent('sporeling', 91, 11, { face: -1 }); ent('puffball', 94, 11); ent('glow', 97, 11);
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

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: [], sleeps,
    duskStart: -1, duskLen: 1, music: 'theme2', night: false, glowNight: true,
    palette: { sky: [[64, 96, 112], [150, 190, 160]], near: 'mushroom', myc: false, dress: 'myc', haze: 'rgba(120,160,140,0.2)', grass: '#4a8a4a', grassL: '#7ac860', grassD: '#2f5e3a', dirt: '#4a3a3c', dirtL: '#5e4c4a', dirtD: '#33262a', canopy: ['#1f4a3a', '#2a5e46', '#3a7a55', '#4f9a68'] },
    weather: [{ x0: 0, x1: 99999, kind: 'spore' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'hive' }],
    storm: { x0: 201 * TS, x1: 244 * TS, y: 14 * TS },
    arena: { x0: 297 * TS, x1: 374 * TS, floor: 20 * TS, trigger: 306 * TS, wallL: 296, wallR: 375, boss: 'mother', tint: '#9a5aa8', tintA: 0.1 },
  }
  // ---- 6c. THE PUFFBALL BOG: three sinks in the ground with caps at the bottom, lurkers between, drones above, a geyser, a shaman ----
  const G = grow(L, ret, 245, 44);
  G.floor(245, 288, 14);
  for (const [x0, x1] of [[252, 255], [262, 266], [274, 278]]) { for (let x = x0; x <= x1; x++) for (let y = 14; y <= 19; y++) G.set(x, y, 0); for (let x = x0; x <= x1; x++) G.set(x, 19, T.BOUNCER); }
  G.ent('sign', 246, 13, { text: 'THE BOG. FALL IN, PLUNGE THE CAPS, BOUNCE OUT.' });
  G.ent('lurker', 249, 13); G.ent('puffball', 259, 13); G.ent('lurker', 260, 13); G.ent('puffball', 269, 13); G.ent('lurker', 271, 13); G.ent('puffball', 281, 13);
  G.ent('vent', 258, 13, { period: 4, on: 1.5, h: 90, phase: 1 }); G.ent('vent', 270, 13, { period: 5, on: 1.6, h: 90, phase: 3 });
  G.ent('drone', 254, 8); G.ent('drone', 264, 7); G.ent('drone', 276, 8);
  G.ent('glow', 247, 13); G.ent('glow', 257, 13); G.ent('glow', 268, 13); G.ent('glow', 280, 13); G.ent('glow', 287, 13);
  G.ent('shaman', 284, 13, { face: -1 }); G.ent('sporeling', 286, 13, { face: -1 });
  G.coins([253, 11], [254, 10], [263, 11], [264, 10], [265, 11], [275, 11], [276, 10], [277, 11], [250, 12], [272, 12], [283, 12]);
  G.ent('check', 288, 13);
  return G.done();
;
}


function kingswood() {
  const L = painter(430, 28);
  const { block, floor, plat, crate, ent, coins, set } = L;
  const gate = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
  const ceiling = (x0, x1, y) => block(x0, x1, y - 3, y); // a roof three tiles thick, open sky above it
  const movers = [];

  // ---- 1. The rust wood: goblins live here. Townsfolk bolt for their doors. ----
  floor(0, 44, 20);
  ent('sign', 4, 19, { text: 'THE GOBLINS LIVE HERE. YOU ARE NOT WELCOME.' });
  ent('door', 12, 19, { at: 12 }); ent('folk', 9, 19, { door: 12 }); ent('folk', 17, 19, { door: 12, alt: true }); ent('deco', 20, 19, { kind: 'well' });
  ent('sprig', 22, 19, { face: -1 }); coins([8, 18], [15, 17], [26, 18]);
  ent('sign', 29, 19, { text: 'THIEVES SNATCH GOLD. CATCH THEM FOR INTEREST.' });
  ent('thief', 34, 19, { face: -1 }); ent('door', 40, 19); ent('folk', 38, 19, { door: 40 });
  // the canopy road over the pasture, and a rope ladder up onto the first hall's roof
  plat(6, 16, 3); plat(11, 14, 3); plat(16, 12, 4); plat(22, 14, 3); plat(27, 16, 3); plat(33, 14, 3); plat(38, 12, 3);
  coins([7, 15], [12, 13], [18, 11], [23, 13], [28, 15], [34, 13], [39, 11]); ent('wasp', 25, 11);
  for (let y = 12; y <= 19; y++) set(44, y, T.NET);
  ent('sign', 41, 19, { text: 'ROPES GO UP. THE ROOF ROAD SKIPS THE HALL.' });
  ent('check', 43, 19);

  // ---- 2. The first hall: inside a trunk. A bell at the far end and a gate under it. ----
  ceiling(45, 84, 16); block(45, 84, 20, 27);
  ent('torch', 48, 19); ent('torch', 60, 19); ent('torch', 72, 19); ent('torch', 82, 19);
  ent('sign', 47, 19, { text: 'PIKES HOLD THE LINE. JUMP THEM, OR THROW.' });
  ent('pike', 56, 19, { face: -1 }); ent('sprig', 62, 19, { face: -1 }); ent('pike', 68, 19, { face: -1 });
  ent('bell', 80, 19, { gate: 84 }); ent('sprig', 76, 19, { face: 1, ringer: true, bell: 80 });
  gate(84, 15, 19);
  coins([52, 18], [58, 17], [65, 18], [74, 17]);
  // the way around the gate if the bell rings: a two-wide hatch through the roof with ledges up it, onto the high road
  for (let x = 77; x <= 78; x++) for (let y = 13; y <= 16; y++) set(x, y, 0);
  plat(77, 18, 2); plat(77, 16, 2); plat(77, 14, 2); plat(76, 12, 4);
  ent('sign', 73, 19, { text: 'IF THE GATE FALLS: THE ROOF HATCH.' }); ent('torch', 79, 17); coins([77, 15], [78, 13]);

  // ---- 3. FORK ONE. High road: canopy walkways and swings, thieves and wasps. Low road: the burrow with a ram and a drop cage. ----
  // high road (rows 6-12)
  plat(85, 12, 4); plat(91, 10, 3); plat(96, 8, 4);
  movers.push({ kind: 'swing', px: 104 * TS, py: 2 * TS, arm: 80, x: 0, y: 0, w: 48, h: 8, period: 3.2, phase: 0 });
  plat(111, 8, 3); ent('thief', 112, 7, { face: -1 }); plat(116, 9, 4); ent('wasp', 121, 7);
  movers.push({ kind: 'swing', px: 127 * TS, py: 2 * TS, arm: 88, x: 0, y: 0, w: 48, h: 8, period: 3.6, phase: 1.6 });
  plat(134, 9, 4); ent('thief', 136, 8, { face: -1 }); plat(140, 11, 3); plat(145, 13, 4);
  coins([87, 11], [93, 9], [98, 7], [104, 6], [112, 6], [118, 8], [127, 6], [135, 8], [141, 10], [146, 12]);
  // low road (rows 18-22): the burrow
  block(85, 150, 22, 27); ceiling(85, 150, 16);
  for (let x = 85; x <= 150; x++) for (let y = 17; y <= 21; y++) set(x, y, 0);
  ent('torch', 88, 21); ent('torch', 104, 21); ent('torch', 120, 21); ent('torch', 136, 21);
  ent('pike', 96, 21, { face: -1 }); ent('lever', 100, 21, { ram: 106 }); ent('ram', 106, 17); ent('brute', 110, 21, { face: -1 });
  ent('sprig', 118, 21, { face: -1 }); ent('plate', 124, 21, { cage: 128 }); ent('dropcage', 128, 17); ent('brute', 132, 21, { face: -1 });
  ent('sign', 90, 21, { text: 'THEIR TRAPS: THE LEVER SWINGS THE RAM, THE PLATE DROPS THE CAGE.' });
  ent('pike', 142, 21, { face: -1 }); coins([93, 20], [114, 20], [126, 19], [138, 20], [147, 20]);
  // the roads rejoin at 150: a slope of ledges from the burrow up to the yard
  block(150, 152, 18, 27); block(153, 158, 16, 27); block(159, 164, 14, 27); block(165, 190, 14, 27);
  ent('check', 167, 13);

  // ---- 4. The kennels: the Hound Master. Walls close, the gate opens when he falls. ----
  ent('torch', 170, 13); ent('torch', 188, 13); ent('cage', 172, 13, { kind: 'bird' });
  ent('master', 182, 13);
  ent('sign', 169, 13, { text: 'THE HOUND MASTER. BLOCK THE CHARGE, THEN PLUNGE THE RIDER.' });
  gate(190, 9, 13);
  block(191, 210, 14, 27); ent('torch', 194, 13); coins([196, 12], [200, 12], [204, 12]); ent('check', 208, 13);
  plat(196, 11, 3); plat(201, 9, 3); plat(206, 11, 3); ent('archer', 202, 8, { face: -1 }); coins([197, 10], [202, 7], [207, 10]);

  // ---- 5. FORK TWO. Canopy (rows 5-10) over the roots (rows 16-20). ----
  // canopy
  plat(211, 11, 3); plat(216, 9, 3); plat(221, 7, 4);
  movers.push({ kind: 'swing', px: 231 * TS, py: 1 * TS, arm: 90, x: 0, y: 0, w: 48, h: 8, period: 3.0, phase: 0.8 });
  plat(238, 7, 3); ent('thief', 239, 6, { face: -1 }); plat(243, 9, 4); ent('wasp', 248, 6); ent('archer', 245, 8, { face: -1 });
  movers.push({ kind: 'swing', px: 254 * TS, py: 1 * TS, arm: 96, x: 0, y: 0, w: 48, h: 8, period: 3.4, phase: 2.2 });
  plat(261, 9, 3); plat(266, 11, 3); plat(271, 11, 4);
  coins([212, 10], [217, 8], [223, 6], [231, 5], [239, 5], [245, 7], [254, 5], [262, 8], [267, 10], [272, 10]);
  // roots
  block(211, 275, 21, 27); ceiling(211, 275, 15);
  for (let x = 211; x <= 275; x++) for (let y = 16; y <= 20; y++) set(x, y, 0);
  ent('torch', 214, 20); ent('torch', 230, 20); ent('torch', 246, 20); ent('torch', 262, 20);
  ent('hound', 220, 20, { face: -1 }); ent('pike', 228, 20, { face: -1 }); ent('lever', 234, 20, { ram: 240 }); ent('ram', 240, 16); ent('sprig', 244, 20, { face: -1 }); ent('sprig', 248, 20, { face: -1 });
  ent('plate', 254, 20, { cage: 258 }); ent('dropcage', 258, 16); ent('brute', 262, 20, { face: -1 }); ent('thief', 268, 20, { face: -1 });
  coins([218, 19], [236, 19], [252, 18], [266, 19], [273, 19]);
  block(275, 277, 17, 27); block(278, 281, 15, 27); block(282, 300, 14, 27);
  ent('check', 284, 13);

  // ---- 6. The processional: townsfolk line a carpet, guards bar the way, banners hang. ----
  ent('sign', 286, 13, { text: 'THE COURT. THEY ARE WATCHING.' });
  for (const x of [288, 292, 296]) ent('carpet', x, 13);
  ent('folk', 289, 13, { door: 300, alt: true }); ent('folk', 293, 13, { door: 300 }); ent('door', 299, 13);
  ent('shield', 295, 13, { face: -1 }); ent('shield', 298, 13, { face: -1 });
  ent('deco', 290, 13, { kind: 'banner', v: 0 }); ent('deco', 297, 13, { kind: 'banner', v: 1 });
  ent('thief', 302, 13, { face: -1 }); coins([289, 12], [294, 12]);
  plat(286, 10, 4); plat(292, 8, 3); ent('archer', 288, 9, { face: -1 }); coins([287, 9], [293, 7], [294, 7]);
  // the cache: a hidden loft above the court holds the Thief Cloak
  plat(303, 9, 3); plat(307, 7, 3); coins([304, 8], [308, 6], [309, 6]); ent('relic', 308, 6, { kind: 'cloak' });
  ent('check', 312, 13);

  // ---- 7. The throne room: King Gorm Underleaf on his palanquin. ----
  block(300, 429, 14, 27);
  for (let x = 318; x <= 368; x++) ent('carpet', x, 13);
  ent('torch', 320, 13); ent('torch', 366, 13); ent('deco', 326, 13, { kind: 'banner', v: 0 }); ent('deco', 360, 13, { kind: 'banner', v: 1 });
  ent('deco', 332, 13, { kind: 'skullPile', v: 0 }); ent('deco', 354, 13, { kind: 'skullPile', v: 1 });
  // the galleries: the court cheers from balconies either side and throws goblets when the King shouts
  plat(318, 9, 6); plat(363, 9, 6); ent('torch', 318, 8); ent('torch', 368, 8);
  for (const x of [319, 321, 323, 364, 366, 368]) ent('folk', x, 8, { court: true, alt: x % 4 === 1 });
  ent('deco', 320, 9, { kind: 'banner', v: 1 }); ent('deco', 366, 9, { kind: 'banner', v: 0 });
  // three cages hang over the carpet; the King drops them on you
  for (const x of [330, 343, 356]) ent('dropcage', x, 6, { boss: true });
  ent('deco', 338, 6, { kind: 'hangCage', hang: true }); ent('deco', 350, 6, { kind: 'hangCage', hang: true });
  ent('king', 344, 13);

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: movers,
    duskStart: -1, duskLen: 1, music: 'theme3', night: false, glowNight: true,
    interiors: [[45, 84, 17, 19], [85, 150, 17, 21], [211, 275, 16, 20]], // hollowed trunks and burrows: a dark planked backdrop behind the play layer
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(200,120,80,0.16)', grass: '#8a7a2a', grassL: '#c9a83a', grassD: '#5a4a1a', dirt: '#4a3020', dirtL: '#5e3f2a', dirtD: '#2c1a10', canopy: ['#7a2a1a', '#a83a2a', '#c9463d', '#e07060'], hall: true },
    weather: [{ x0: 0, x1: 99999, kind: 'leaves' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'forest' }],
    arena: { x0: 316 * TS, x1: 370 * TS, floor: 14 * TS, trigger: 322 * TS, wallL: 315, wallR: 371, boss: 'king', music: 'boss2', tint: '#c9463d', tintA: 0.12, fx: 'embers' },
    mini: { x0: 168 * TS, x1: 189 * TS, floor: 14 * TS, trigger: 172 * TS, wallL: 167, gate: 190, boss: 'master' },
  }
  // ---- 5c. THE TOLL BRIDGE: a rope bridge over the gorge. Pikes hold it, a cutter waits at the far post; if it falls, ledges below lead back up. ----
  const G = grow(L, ret, 284, 44);
  G.block(284, 287, 14, 27); G.block(324, 327, 14, 27);
  for (let x = 288; x <= 323; x++) G.set(x, 14, T.PLANK);
  G.ent('bridge', 288, 14, { x1: 323 });
  G.ent('sign', 285, 13, { text: 'THE TOLL BRIDGE. PAY IN STEEL, AND HURRY: THEY CUT ROPES.' });
  G.ent('door', 286, 13); G.ent('torch', 288, 13); G.ent('torch', 323, 13);
  G.ent('pike', 297, 13, { face: -1 }); G.ent('thief', 305, 13, { face: -1 }); G.ent('pike', 313, 13, { face: -1 });
  G.ent('sprig', 325, 13, { face: -1, cutter: true }); G.ent('wasp', 301, 10); G.ent('wasp', 318, 10);
  G.ent('deco', 291, 13, { kind: 'banner', v: 0 }); G.ent('deco', 320, 13, { kind: 'banner', v: 1 });
  G.plat(292, 18, 3); G.plat(299, 17, 3); G.plat(306, 18, 3); G.plat(313, 17, 3); G.plat(320, 18, 3); G.plat(324, 16, 2); // the way back up if the bridge falls
  G.plat(289, 24, 2); G.plat(292, 22, 2); G.plat(289, 20, 2); // and up from the gorge floor to the first ledge
  G.block(288, 323, 26, 27); G.ent('deco', 296, 25, { kind: 'skullPile', v: 0 }); G.ent('deco', 316, 25, { kind: 'skullPile', v: 1 }); // the gorge floor, bones and all
  G.coins([293, 13], [301, 12], [309, 13], [317, 12], [300, 16], [314, 16], [321, 17]);
  G.ent('check', 326, 13);
  return G.done();
;
}


// ---------- THE CRAGS, level 1: THE SCREE PATH ----------
// Foothills at dusk. Pastures and dry-stone walls, the shepherd's bothy, a cliff that drops rocks, the windmill, the scree slope, and the Ram Lord's fold.
function screePath() {
  const L = painter(364, 28);
  const { block, floor, plat, crate, ent, coins, set } = L;
  const movers = [], stone = [], scree = [];
  const wall = (x, y) => { block(x, x, y, y); stone.push([x, x, y, y]); };

  // ---- 1. The lower pasture: sheep, walls, the bothy and the shepherd ----
  floor(0, 60, 20);
  ent('deco', 8, 19, { kind: 'bothy' }); ent('torch', 14, 19);
  ent('npc', 13, 19, { kind: 'shepherd' });
  ent('sign', 4, 19, { text: 'THE SCREE PATH. THE HILL TAKES THE CARELESS.' });
  wall(18, 19); wall(30, 19); wall(44, 19); ent('deco', 26, 19, { kind: 'fence', v: 0 }); ent('deco', 40, 19, { kind: 'fence', v: 1 });
  ent('goat', 36, 19, { face: -1 }); ent('harpy', 50, 14);
  coins([12, 17], [24, 18], [40, 18], [48, 17]);
  ent('sign', 22, 19, { text: 'THREE EWES STRAYED UP THE HILL. THE SHEPHERD WANTS THEM BACK.' });
  ent('check', 58, 19);

  // ---- 2. The terraces: three steps up the hill, a rockfall, the first stray ----
  block(61, 80, 18, 27); block(81, 100, 16, 27); block(101, 120, 14, 27);
  wall(62, 17); wall(82, 15); wall(102, 13);
  plat(70, 14, 3); ent('stray', 71, 13); coins([70, 13], [72, 13]);
  ent('goat', 72, 17, { face: -1 }); ent('rockfall', 90, 4, { every: 2.4 }); ent('rockfall', 94, 4, { every: 3.1 });
  ent('deco', 84, 15, { kind: 'stone' }); ent('deco', 106, 13, { kind: 'stone' }); ent('deco', 112, 13, { kind: 'cairn' });
  ent('goat', 96, 15, { face: -1 }); ent('harpy', 110, 8); ent('sprig', 108, 13, { face: -1 });
  coins([66, 17], [76, 17], [86, 15], [98, 15], [104, 13], [116, 13]);
  ent('check', 118, 13);

  // ---- 3. The windmill rise: the sails lift you to the loft and the high path ----
  block(121, 176, 14, 27);
  ent('deco', 150, 13, { kind: 'mill' });
  for (let i = 0; i < 4; i++) movers.push({ kind: 'wheel', px: 150 * TS + 8, py: 13 * TS - 58, r: 42, phase: i * Math.PI / 2, period: 7, x: 0, y: 0, w: 22, h: 6 });
  plat(156, 6, 4); ent('stray', 158, 5); coins([157, 5], [159, 5]);
  plat(162, 8, 3); plat(167, 9, 3); plat(172, 10, 3); ent('archer', 168, 8, { face: -1 }); ent('harpy', 162, 3);
  coins([163, 7], [168, 7], [173, 9]);
  wall(128, 13); wall(140, 13); ent('goat', 134, 13, { face: -1 }); ent('sprig', 144, 13, { face: -1 }); ent('sprig', 160, 13, { face: -1 });
  ent('sign', 124, 13, { text: 'RIDE THE SAILS. THE LOFT IS WORTH THE CLIMB.' });
  ent('deco', 138, 13, { kind: 'cairn' });
  coins([131, 12], [146, 12], [164, 12], [170, 12]);
  ent('check', 174, 13);

  // ---- 4. The scree slope: the loose stone carries you down, rocks come off the cliff, harpies dive ----
  const steps = [[177, 190, 14], [191, 200, 15], [201, 212, 16], [213, 224, 17], [225, 238, 18], [239, 250, 19]];
  for (const [x0, x1, y] of steps) { block(x0, x1, y, 27); if (x0 > 177) scree.push({ x0, x1, y, dir: 1 }); }
  ent('sign', 180, 13, { text: 'SCREE. IT SLIDES. BRACE OR BOUNCE.' });
  ent('rockfall', 205, 5, { every: 2.6 }); ent('rockfall', 220, 5, { every: 2.2 }); ent('rockfall', 232, 5, { every: 2.9 });
  ent('harpy', 200, 9); ent('harpy', 235, 11);
  plat(246, 16, 3); ent('stray', 247, 15); coins([246, 15], [248, 15]);
  coins([186, 13], [196, 14], [208, 15], [218, 16], [230, 17], [242, 18]);
  ent('deco', 184, 13, { kind: 'stone' }); ent('deco', 244, 18, { kind: 'stone' });
  // the gorge: a gap with a lone boulder pillar to cross it
  block(254, 255, 21, 27);
  block(256, 275, 19, 27);
  ent('check', 260, 18);

  // ---- 5. The crag wall: ledges up to the plateau, rocks on the way ----
  ent('goat', 266, 18, { face: -1 }); wall(270, 18);
  plat(278, 16, 3); plat(274, 13, 3); plat(279, 10, 3); plat(283, 12, 2);
  block(285, 363, 9, 27);
  ent('rockfall', 281, 2, { every: 2.7 });
  coins([279, 15], [275, 12], [280, 9], [284, 11]);
  ent('sprig', 290, 8, { face: -1 }); ent('deco', 288, 8, { kind: 'stone' });
  ent('check', 294, 8);

  // ---- 6. THE FOLD: the Ram Lord's walled pasture on the plateau ----
  ent('sign', 296, 8, { text: 'THE RAM LORD. DODGE THE CHARGE. HE HITS THE WALL, YOU HIT HIM.' });
  ent('deco', 301, 8, { kind: 'foldGate' }); ent('deco', 344, 8, { kind: 'foldGate' });
  ent('deco', 306, 8, { kind: 'cairn' }); ent('deco', 340, 8, { kind: 'cairn' });
  ent('ramlord', 332, 8);

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: movers,
    duskStart: -1, duskLen: 1, music: 'theme4', night: false, glowNight: false,
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(140,90,150,0.14)', grass: '#8a8a3a', grassL: '#c9b84a', grassD: '#5a5a2a', dirt: '#5a5a66', dirtL: '#6e6e7a', dirtD: '#3a3a44', canopy: ['#4a4458', '#5e5870', '#6a4a7a', '#a07ab8'] },
    stone, scree, strays: 3,
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 300 * TS, x1: 346 * TS, floor: 9 * TS, trigger: 304 * TS, wallL: 299, wallR: 347, boss: 'ram', tint: '#6a4a7a', tintA: 0.12, fx: 'dust' },
  }
  // ---- 3b. THE CAIRN FIELD: standing stones, a gully that drags you back, a goat pen, harpies on the wind ----
  const G = grow(L, ret, 176, 40);
  G.floor(176, 215, 14);
  for (let x = 190; x <= 197; x++) for (let y = 14; y <= 17; y++) G.set(x, y, 0); // the gully
  G.R.scree.push({ x0: 190, x1: 197, y: 18, dir: -1 }); G.plat(196, 16, 2);
  G.ent('sign', 178, 13, { text: 'THE CAIRN FIELD. THE GULLY PULLS YOU BACK. JUMP THE FAR SIDE.' });
  G.ent('deco', 181, 13, { kind: 'stone', v: 0 }); G.ent('deco', 186, 13, { kind: 'cairn' }); G.ent('deco', 205, 13, { kind: 'stone', v: 2 }); G.ent('deco', 211, 13, { kind: 'cairn' });
  G.ent('rockfall', 193, 5, { every: 2.4 }); G.ent('harpy', 187, 8); G.ent('harpy', 212, 9);
  G.R.stone.push([200, 200, 13, 13], [208, 208, 13, 13]); G.block(200, 200, 13, 13); G.block(208, 208, 13, 13);
  G.ent('goat', 203, 13, { face: -1 }); G.ent('goat', 206, 13, { face: 1 }); G.ent('sprig', 184, 13, { face: -1 });
  G.coins([180, 12], [185, 11], [192, 17], [195, 17], [199, 12], [204, 11], [210, 12], [214, 12]);
  G.ent('check', 214, 13);
  return G.done();
;
}

export const LEVELS = [
  { id: 'wood', name: 'BRACKEN WOOD', sub: 'forest and hive', build: brackenWood },
  { id: 'marsh', name: 'MARSH WOOD', sub: 'water and the frog', build: marshWood, needs: 'wood' },
  { id: 'stockade', name: 'THE STOCKADE', sub: 'the goblin camp', build: theStockade, needs: 'marsh' },
  { id: 'spore', name: 'SPOREWOOD', sub: 'the deep fungus', build: sporewood, needs: 'stockade' },
  { id: 'kings', name: 'KINGSWOOD', sub: 'the court under the leaves', build: kingswood, needs: 'spore' },
  { id: 'scree', name: 'THE SCREE PATH', sub: 'the foothills at dusk', build: screePath, needs: 'kings' },
];
