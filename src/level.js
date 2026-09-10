// level.js — the level registry. Each level paints a tile grid with a tiny DSL and returns it.
export const TS = 16;
export const T = { AIR: 0, SOLID: 1, ONEWAY: 2, SPIKE: 3, CRATE: 4, REED: 5, PALISADE: 7, PLANK: 8, NET: 9, BOUNCER: 10, SHELF: 11, PORT: 12, CLIMB: 13, RAIL: 14, SOFT: 15 };

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
  const sh = x => x >= col ? x + n : x, shp = p => p >= col * TS ? p + n * TS : p, shpEnd = p => p > col * TS ? p + n * TS : p; // an exclusive end that sits on the cut stays put
  const REF = ['ram', 'cage', 'gate', 'door', 'bell', 'at', 'wall', 'x1', 'pool', 'ifDrained'];
  for (const e of L.ents) { e.x = sh(e.x); for (const k of REF) if (typeof e[k] === 'number') e[k] = sh(e[k]); }
  const R = Object.assign({}, ret, { W: W2 });
  if (R.pools) R.pools = R.pools.map(p => ({ ...p, x0: shp(p.x0), x1: shpEnd(p.x1) }));
  if (R.sleeps) R.sleeps = R.sleeps.map(p => ({ ...p, x0: shp(p.x0), x1: shpEnd(p.x1) }));
  if (R.moversExtra) R.moversExtra = R.moversExtra.map(m => { const o = { ...m }; for (const k of ['x', 'x0', 'x1', 'px']) if (typeof o[k] === 'number') o[k] = shp(o[k]); return o; });
  for (const k of ['weather', 'ambient']) if (R[k]) R[k] = R[k].map(z => ({ ...z, x0: shp(z.x0), x1: z.x1 >= 99999 ? z.x1 : shpEnd(z.x1) }));
  for (const k of ['arena', 'mini']) if (R[k]) { const A = { ...R[k] }; for (const f of ['x0', 'x1', 'trigger']) if (typeof A[f] === 'number') A[f] = shp(A[f]); for (const f of ['wallL', 'wallR', 'gate']) if (typeof A[f] === 'number') A[f] = sh(A[f]); if (A.dais) A.dais = { ...A.dais, x0: shp(A.dais.x0), x1: shp(A.dais.x1) }; R[k] = A; }
  if (R.interiors) R.interiors = R.interiors.map(([x0, x1, y0, y1]) => [sh(x0), sh(x1), y0, y1]);
  if (R.stone) R.stone = R.stone.map(([x0, x1, y0, y1]) => [sh(x0), sh(x1), y0, y1]);
  if (R.scree) R.scree = R.scree.map(z => ({ ...z, x0: sh(z.x0), x1: sh(z.x1) }));
  if (typeof R.duskStart === 'number' && R.duskStart > 0) R.duskStart = shp(R.duskStart);
  if (typeof R.escapeGate === 'number') R.escapeGate = sh(R.escapeGate);
  if (R.storm) R.storm = { ...R.storm, x0: shp(R.storm.x0), x1: shpEnd(R.storm.x1) };
  if (R.rot) R.rot = { x0: shp(R.rot.x0), x1: shpEnd(R.rot.x1) };
  P.R = R; P.done = () => Object.assign(R, { grid: P.grid, ents: L.ents.concat(P.ents) });
  return P;
}

function brackenWood() {
  const L = painter(324, 28);
  const { block, floor, plat, spikes, crate, ent, coins, set } = L;

  // ---- 1. Glade: learn to move, jump, swing ----
  floor(0, 30, 22);
  ent('sign', 5, 21, { text: 'ARROWS/WASD MOVE   Z JUMP   X SWING' }); ent('npc', 10, 21, { kind: 'squire' });
  ent('sign', 284, 8, { text: 'THE HIVE. THE QUEEN COMES DOWN TO STING: JUMP IT, THEN CUT HER WHILE SHE PULLS FREE. HER WASPS ARE STEPPING STONES.' });
  ent('deco', 10, 21, { kind: 'cabin' }); ent('npc', 16, 21, { kind: 'woodsman' }); // the woodsman's cabin: he wants his honey back
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
  ent('sign', 78, 21, { text: 'DOWN+X IN THE AIR: PLUNGE. LAND IT ON A FOE AND YOU BOUNCE. HOLD JUMP AS YOU BOUNCE TO GO HIGHER. THE WOOD IS BUILT FOR IT.' });
  ent('check', 82, 21);

  // ---- 3. Wasp pit: pogo chain ----
  ent('wasp', 87, 20); ent('wasp', 90, 20); ent('wasp', 93, 20); ent('wasp', 96, 20);
  floor(98, 120, 22);
  coins([99, 20], [100, 19], [101, 20]);
  ent('sign', 103, 21, { text: 'C BLOCK, V DODGE. A BLOCK TURNS A BLOW AND STAGGERS THE ONE WHO SWUNG IT. SPINED BACKS BREAK THE PLUNGE: CUT THOSE FROM THE SIDE.' });
  ent('thorn', 109, 21, { face: -1 });
  crate(111, 21); crate(112, 21); crate(112, 20);
  ent('sprig', 116, 21, { face: -1 });

  // ---- 4. Thorn climb ----
  floor(121, 129, 22);
  spikes(122, 129, 21);
  plat(119, 20, 3); plat(123, 18, 3); plat(127, 16, 3); plat(123, 14, 3); plat(127, 12, 3); ent('silver', 128, 11);
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
  ent('sign', 256, 8, { text: 'SHIELD GOBLINS HIDE BEHIND IRON. THEIR HELMS ARE STEPPING STONES: PLUNGE THE HELM, LAND BEHIND, CUT.' });
  plat(262, 5, 4); coins([263, 4], [264, 4], [260, 8], [264, 8]); ent('silver', 265, 4);
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
    quest: { n: 3, item: 'pot', name: 'HONEY POT', npc: 'woodsman', done: 'THE POTS ARE HOME', thanks: "THE WOODSMAN'S THANKS" },
    weather: [{ x0: 0, x1: 1500, kind: 'pollen' }, { x0: 3150, x1: 3800, kind: 'mist' }, { x0: 4540, x1: 99999, kind: 'rain' }],
    ambient: [{ x0: 0, x1: 3150, kind: 'forest' }, { x0: 3150, x1: 3800, kind: 'water' }, { x0: 3800, x1: 4540, kind: 'forest' }, { x0: 4540, x1: 99999, kind: 'hive' }],
    arena: { x0: 288 * TS, x1: 321 * TS, floor: 9 * TS, trigger: 292 * TS, wallL: 287, wallR: 321, boss: 'queen', tint: '#e0b040', tintA: 0.12, fx: 'bees' },
  }
  // ---- 5a. THE WASP ORCHARD: a fallen giant across the path (over it through the hives, or through it past the thorns), then a hive glade ----
  // ---- 8b. THE FELLED PINE: a tarn in a cleft between the hollow and the ridge. Four strokes drop the pine across it; wasps hover for the pogo route. ----
  const G0 = grow(L, ret, 235, 36);
  G0.block(235, 241, 15, 27);
  G0.ent('sign', 236, 14, { text: 'FOUR STROKES FELL A PINE AND BRIDGE THE GAP. THE WASPS ARE THE OTHER BRIDGE: POGO ACROSS THEM, HOLDING JUMP.' });
  G0.ent('felltree', 241, 14, { len: 14, dir: 1 });
  G0.R.pools.push({ x0: 242 * TS, x1: 256 * TS, y: 21 * TS });
  G0.block(242, 255, 24, 27);
  G0.ent('wasp', 245, 11); G0.ent('wasp', 250, 11);
  G0.coins([244, 13], [248, 13], [252, 13]);
  G0.block(256, 270, 15, 27);
  G0.ent('check', 259, 14); G0.ent('sprig', 265, 14, { face: -1 }); G0.coins([262, 13], [268, 13]);
  const R0 = G0.done();
  const G = grow(R0, R0, 130, 46);
  G.block(130, 175, 12, 27);
  G.ent('sign', 131, 11, { text: 'THE FALLEN GIANT. OVER THE TOP FOR THE COINS, OR THROUGH THE HOLLOW FOR THE QUIET. THE WOODSMAN\'S SHEEP WENT ONE OF THOSE WAYS.' });
  G.ent('check', 133, 11); G.coins([135, 10], [137, 10]);
  G.block(139, 152, 8, 11); for (let x = 139; x <= 152; x++) { G.set(x, 9, 0); G.set(x, 10, 0); G.set(x, 11, 0); } // the hollow runs the whole trunk
  G.spikes(145, 146, 11); G.ent('spit', 150, 11, { face: -1 }); G.coins([144, 10], [148, 10]); G.ent('silver', 152, 10);
  G.plat(136, 9, 2); G.coins([137, 8], [141, 6]); // up onto the trunk
  G.ent('wasp', 146, 6); G.ent('wasp', 150, 5); G.coins([146, 4], [150, 3]); G.ent('sprig', 144, 7, { face: -1 });
  G.plat(153, 9, 2); G.coins([154, 8]);
  G.ent('deco', 158, 11, { kind: 'hiveBg' }); G.ent('deco', 168, 11, { kind: 'hiveBg' });
  G.spikes(159, 167, 11); G.ent('wasp', 160, 9); G.ent('wasp', 163, 9); G.ent('wasp', 166, 9); G.coins([160, 7], [163, 7], [166, 7]); // pogo the wasps over the thorns
  G.ent('shield', 171, 11, { face: -1 }); G.crate(174, 11); G.coins([170, 9], [173, 10]);
  G.ent('stray', 148, 7, { kind: 'pot' }); // the first honey pot, on top of the giant among the wasps
  const R1 = G.done();
  // ---- 3b. THE BADGER SETT: the road forks. Below, a dug run under the ridge: dark, spitters and thorns, a pot. Above, the ridge itself: wasps, a spitter on a hump, spikes, a cache with the third pot. ----
  const G2 = grow(R1, R1, 121, 44);
  G2.block(121, 126, 22, 27);
  G2.ent('sign', 122, 21, { text: 'THE BADGER SETT BELOW, THE RIDGE ABOVE. BOTH REACH THE CLIMB TO THE HIVE. THE SETT IS DARK AND FULL OF SPRIGS. THE RIDGE IS WASPS.' });
  G2.plat(122, 19, 2); G2.plat(125, 16, 2); // up onto the ridge
  G2.block(127, 158, 14, 17); G2.block(127, 158, 22, 27); G2.block(159, 164, 22, 27);
  G2.R.interiors = (G2.R.interiors || []).concat([[127, 158, 18, 21, 'earth']]);
  G2.ent('glow', 129, 21); G2.ent('glow', 145, 21); G2.ent('glow', 156, 21);
  G2.ent('thorn', 133, 21, { face: -1 }); G2.block(139, 141, 21, 21); G2.ent('spit', 140, 20, { face: -1 });
  G2.spikes(146, 147, 22); G2.crate(150, 21); G2.crate(151, 21); G2.crate(151, 20); G2.ent('sprig', 154, 21, { face: -1 });
  G2.ent('stray', 157, 21, { kind: 'pot' });
  G2.coins([131, 20], [137, 20], [144, 19], [149, 19], [155, 19]);
  // the ridge
  G2.block(133, 135, 13, 13); G2.ent('spit', 134, 12, { face: -1 });
  G2.ent('wasp', 141, 10); G2.ent('wasp', 149, 10); G2.spikes(145, 146, 13); G2.ent('thorn', 152, 13, { face: -1 });
  G2.plat(140, 11, 2); G2.plat(143, 9, 3); G2.ent('stray', 144, 8, { kind: 'pot' });
  G2.coins([130, 12], [138, 12], [143, 8], [145, 8], [151, 11], [157, 12]);
  G2.ent('check', 162, 21); G2.coins([160, 20], [163, 20]);
  return G2.done();
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
  ent('sign', 5, 21, { text: 'PADS SINK UNDER YOU.  KEEP MOVING.' }); ent('npc', 10, 21, { kind: 'squire' });
  ent('sign', 357, 17, { text: 'THE KING\'S COURT. HE DRAWS BREATH BEFORE HE PULLS: HOLD YOUR SHIELD UP. HIS TONGUE COMES STRAIGHT. HIS LEAP DOES NOT.' });
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
  ent('sign', 58, 15, { text: 'THE ARCHERS ON THE STILTS. SLASH AN ARROW TO SEND IT BACK WHERE IT CAME FROM. BLOCK IF YOU ARE SLOW.' });
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
  ent('sign', 112, 17, { text: 'SHALLOWS ARE SLOW AND TIRING, AND THE HOPPERS ARE NOT. KEEP TO THE PLANKS WHERE YOU CAN. JUMP OUT OF WATER EARLY.' });
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
  ent('check', 202, 11); ent('silver', 238, 11);
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
  reeds(356, 15, 2); coins([357, 14], [352, 15]); ent('stray', 356, 14, { kind: 'trap' });

  // ---- 10. The Croaking Court: a shallow pond, reed perches, and the King on his mud dais ----
  block(359, 405, 18, 27);
  for (let x = 367; x <= 380; x++) L.set(x, 18, 0); water(367, 380, 18, true);
  reeds(363, 16, 2); reeds(382, 16, 2); ent('silver', 364, 15);
  block(386, 401, 17, 17);
  for (let x = 402; x <= 403; x++) L.set(x, 18, 0); water(402, 403, 18, true);
  ent('throne', 394, 16); ent('frog', 394, 16);
  ent('deco', 364, 17, { kind: 'frogStatue', v: 0 }); ent('deco', 389, 16, { kind: 'frogStatue', v: 1 }); ent('deco', 399, 16, { kind: 'frogStatue', v: 0 });
  ent('deco', 370, 18, { kind: 'lilyLantern' }); ent('deco', 377, 18, { kind: 'lilyLantern' }); ent('deco', 402, 18, { kind: 'lilyLantern' });

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 }, pools, falls: [], moversExtra: movers,
    duskStart: undefined, music: 'theme2',
    quest: { n: 3, item: 'trap', name: 'EEL TRAP', npc: 'ferryman', done: 'THE TRAPS ARE BACK', thanks: "THE FERRYMAN'S THANKS" },
    palette: { dress: 'marsh', haze: 'rgba(172,192,178,0.24)', grass: '#4a9a6e', grassL: '#7fd1a0', grassD: '#2f6e50', dirt: '#5a4a3c', dirtL: '#736050', dirtD: '#3d3128', sky: [[118, 138, 158], [172, 192, 178]], canopy: ['#1f4a3a', '#2a5e46', '#3a7a55', '#4f9a68'] },
    weather: [{ x0: 0, x1: 99999, kind: 'rain' }, { x0: 1750, x1: 2100, kind: 'mist' }, { x0: 4400, x1: 4800, kind: 'mist' }, { x0: 5400, x1: 5760, kind: 'mist' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'rain' }],
    arena: { x0: 361 * TS, x1: 403 * TS, floor: 18 * TS, trigger: 367 * TS, wallL: 360, wallR: 404, boss: 'frog', dais: { x0: 386 * TS, x1: 402 * TS, h: 16 }, tint: '#3a8a5a', tintA: 0.1, fx: 'motes' },
  }
  // ---- 7b. THE DROWNED VILLAGE: stilt huts over deep water. Planks, sinking pads, archers on the roofs, frogs below. ----
  const G = grow(L, ret, 275, 48);
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) G.set(x, y, T.PLANK); };
  G.block(275, 276, 18, 27); G.ent('sign', 275, 17, { text: 'THE DROWNED VILLAGE. THE FROG KING\'S FLOOD TOOK IT IN A NIGHT. THE PLANKS HOLD. THE WATER DOES NOT. THE FISH TRAPS ARE THE FERRYMAN\'S.' });
  G.R.pools.push({ x0: 277 * TS, x1: 322 * TS, y: 19 * TS, shallow: false, depth: 0 });
  plank(278, 282, 16); plank(286, 290, 15); plank(294, 298, 16); plank(302, 307, 15); plank(311, 315, 16); plank(319, 322, 17);
  G.ent('treehouse', 288, 6); G.ent('treehouse', 304, 6);
  G.ent('pad', 284, 18); G.ent('pad', 300, 18); G.ent('pad', 309, 18); G.ent('pad', 317, 18);
  G.plat(303, 11, 3); G.ent('archer', 304, 10, { face: -1 }); G.plat(287, 11, 3); G.ent('archer', 288, 10, { face: -1 }); G.ent('silver', 306, 10);
  G.ent('wasp', 292, 13); G.ent('wasp', 310, 13);
  G.reeds(283, 15, 2); G.reeds(299, 14, 2); G.reeds(316, 15, 2);
  G.coins([280, 14], [288, 13], [296, 14], [304, 13], [313, 14], [320, 15], [284, 16], [309, 16]);
  G.ent('check', 321, 16); G.ent('stray', 296, 15, { kind: 'trap' });
  const R1 = G.done();
  // ---- 6b. THE FERRY: a deep channel. Pay the ferryman and ride his punt under the archers, or break the sluice, drain the channel to shallows, and wade it with the frogs. ----
  const F = grow(R1, R1, 161, 48);
  F.block(161, 166, 18, 27);
  F.ent('sign', 162, 17, { text: 'THE FERRY. PAY THE MAN AND RIDE DRY, OR BREAK THE SLUICE UPSTREAM AND WADE THE DRAINED CHANNEL. THE CHANNEL FLOOR KEEPS THINGS.' });
  F.ent('sluice', 165, 17, { pool: 167, to: 21 });
  F.ent('npc', 168, 17, { kind: 'ferryman', ride: true });
  F.R.moversExtra.push({ kind: 'raft', x0: 167 * TS, x1: 203 * TS - 64, x: 167 * TS, y: 18 * TS + 8, w: 64, h: 8, speed: 32, ferry: true, toll: 10 });
  F.R.pools.push({ x0: 167 * TS, x1: 203 * TS, y: 19 * TS, shallow: false, depth: 0 });
  F.block(167, 202, 22, 27);
  F.plat(181, 12, 3); F.ent('archer', 182, 11, { face: -1 }); F.plat(193, 12, 3); F.ent('archer', 194, 11, { face: -1 });
  F.ent('wasp', 176, 15); F.ent('wasp', 188, 15); F.ent('wasp', 199, 15);
  F.ent('hopper', 179, 21, { face: -1, ifDrained: 167 }); F.ent('hopper', 191, 21, { face: 1, color: 'yellow', ifDrained: 167 }); F.ent('stray', 185, 21, { kind: 'trap', ifDrained: 167 });
  F.coins([172, 16], [178, 16], [186, 16], [192, 16], [198, 16], [175, 21], [196, 21]);
  F.plat(200, 20, 2); F.block(203, 208, 18, 27); F.ent('check', 206, 17);
  return F.done();
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
  ent('sign', 324, 19, { text: 'THE CHIEFTAIN. CLUB, THEN SWORD AND SHIELD, THEN BOW. HE SWAPS WHEN HE STAGGERS. THE LEAP STOMPS: BE ELSEWHERE.' }); ent('sign', 9, 19, { text: 'TAM WENT AHEAD TO COUNT GOBLINS. THE TRACKS STOP AT THE GATE. A CAGE HANGS SOMEWHERE PAST THE YARD.' });
  ent('sprig', 14, 19, { face: -1 }); ent('sprig', 22, 19, { face: -1 });
  coins([9, 18], [18, 17], [26, 18]);
  ent('cage', 31, 19, { kind: 'bird' });
  ent('torch', 36, 19); ent('treehouse', 40, 8);

  // ---- 2. Watchpost: a horn on the tower. Silence it first. ----
  block(54, 56, 14, 19); plat(53, 13, 5); ent('towertop', 55, 13); ent('silver', 57, 12);
  plat(46, 17, 3); plat(50, 14, 2); plat(59, 16, 2); plat(58, 13, 2); // two ways up
  ent('archer', 55, 12, { face: -1, horn: true });
  ent('check', 45, 19);
  ent('sign', 44, 19, { text: 'THE WATCHTOWER. SILENCE THE HORN FIRST OR THE WHOLE CAMP WAKES. THE HORN BLOWER STANDS ON THE TOP DECK.' });
  ent('sprig', 60, 19, { face: -1 }); ent('sapper', 66, 19, { face: -1 });
  coins([47, 15], [51, 12], [64, 18]);

  // ---- 3. Rope bridge over the ravine, with a goblin at the far end holding a knife ----
  planks(71, 74, 20); planks(75, 86, 21); planks(87, 90, 20);
  net(71, 90, 25); coins([76, 24], [79, 24], [82, 24], [85, 24]); ent('relic', 86, 24, { kind: 'gauntlet' }); ent('silver', 73, 24); // the ravine cache, on the net
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
  ent('sign', 133, 19, { text: 'THE YARD. FREE THE FOX AND IT FIGHTS FOR YOU. TIP THE BRAZIER INTO THE HAY. ROLL THE BARREL DOWN THE RAMP. EVERYTHING HERE IS A WEAPON.' });
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
  net(270, 285, 17); ent('silver', 278, 16);
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
    quest: { n: 3, item: 'coffer', name: 'COFFER', npc: 'squire', done: 'THE KIT IS WHOLE', thanks: "THE SQUIRE'S THANKS" },
    escapeGate: 344, arena: { x0: 327 * TS, x1: 361 * TS, floor: 20 * TS, trigger: 332 * TS, wallL: 326, wallR: 362, boss: 'chief', music: 'boss2', tint: '#c9463d', tintA: 0.1, fx: 'embers' },
  }
  // ---- 5c. THE SAPPERS' TUNNEL: the goblins dug under their own inner wall. A mound blocks the surface; the tunnel is the way. ----
  const G = grow(L, ret, 250, 44);
  G.block(250, 293, 20, 27); G.block(252, 289, 14, 19); // the mound
  for (let x = 250; x <= 291; x++) for (let y = 22; y <= 24; y++) G.set(x, y, 0); // the tunnel
  for (let y = 20; y <= 21; y++) { G.set(250, y, 0); G.set(251, y, 0); G.set(290, y, 0); G.set(291, y, 0); } // the shafts
  for (let y = 20; y <= 24; y++) { G.set(290, y, T.NET); G.set(291, y, T.NET); } // a rope ladder up the far shaft
  G.ent('sign', 249, 19, { text: 'THE SAPPERS DUG UNDER THE WALL. SO WILL YOU. THEY CARRY POWDER: KILL THEM AT A DISTANCE, OR BLOCK THE BLAST.' });
  for (const x of [256, 266, 276, 286]) G.ent('torch', x, 24);
  G.ent('deco', 254, 24, { kind: 'skullPile', v: 0 }); G.ent('deco', 281, 24, { kind: 'skullPile', v: 1 });
  G.ent('sprig', 258, 24, { face: -1 }); G.ent('barrel', 262, 24); G.crate(264, 24); G.ent('sapper', 270, 24, { face: -1 });
  G.spikes(272, 273, 24); G.ent('sprig', 277, 24, { face: -1 }); G.ent('barrel', 279, 24); G.crate(281, 24); G.crate(281, 23);
  G.ent('sapper', 284, 24, { face: -1 }); G.ent('brute', 288, 24, { face: -1 });
  G.coins([255, 23], [260, 23], [268, 23], [275, 22], [283, 23], [289, 23]);
  G.ent('check', 292, 19); G.ent('torch', 293, 19);
  G.ent('treehouse', 262, 8); G.ent('treehouse', 278, 8); G.ent('sprig', 270, 13, { face: -1 }); G.coins([266, 12], [274, 12]); // goblins on the mound, out of reach and out of the way
  G.ent('stray', 267, 23, { kind: 'coffer' });
  const R1 = G.done();
  // ---- 5d. THE WALL WALK: a caged squire at the fork. Above, planks along the top of a stake wall under archers, with a breach to jump. Below, the ditch: sappers, a hound, spikes, a brute. ----
  const W2 = grow(R1, R1, 186, 44);
  W2.block(186, 191, 20, 27);
  W2.ent('sign', 187, 19, { text: 'THE WALL WALK ABOVE, THE DITCH BELOW. BOTH END AT THE KENNELS. THE WALK HAS ARCHERS. THE DITCH HAS SPIKES AND A COFFER.' });
  W2.ent('cage', 189, 19, { kind: 'squire' });
  for (let y = 14; y <= 19; y++) { W2.set(190, y, T.NET); W2.set(191, y, T.NET); }
  const pal2 = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) W2.set(x, y, T.PALISADE); };
  pal2(192, 204, 15, 17); pal2(207, 223, 15, 17);
  for (let x = 192; x <= 204; x++) W2.set(x, 14, T.PLANK); for (let x = 207; x <= 223; x++) W2.set(x, 14, T.PLANK);
  W2.block(192, 223, 22, 27);
  W2.R.interiors = (W2.R.interiors || []).concat([[192, 223, 18, 21, 'earth']]);
  W2.ent('torch', 197, 13); W2.ent('torch', 213, 13); W2.ent('archer', 199, 13, { face: -1 }); W2.ent('sprig', 210, 13, { face: -1 }); W2.ent('archer', 216, 13, { face: -1 }); W2.ent('thorn', 221, 13, { face: -1 });
  W2.ent('stray', 212, 13, { kind: 'coffer' }); W2.coins([195, 12], [202, 12], [209, 12], [214, 12], [219, 12]);
  W2.ent('torch', 194, 21); W2.ent('torch', 210, 21); W2.ent('sapper', 197, 21, { face: -1 }); W2.ent('hound', 203, 21, { face: -1 }); W2.spikes(208, 209, 22); W2.ent('brute', 214, 21, { face: -1 }); W2.ent('sapper', 219, 21, { face: -1 });
  W2.ent('stray', 222, 21, { kind: 'coffer' }); W2.coins([200, 20], [206, 20], [212, 20], [218, 20]);
  W2.block(224, 229, 20, 27); W2.ent('check', 227, 19); W2.coins([225, 18]);
  const R2 = W2.done();
  // ---- 1b. THE SIEGE ENGINE: a catapult lobs barrels down the path as you come. Dodge them, close in, and wreck it. ----
  const C = grow(R2, R2, 30, 40);
  C.floor(30, 69, 20);
  C.ent('sign', 31, 19, { text: 'THE ENGINE THROWS BARRELS DOWN THE ROAD. DODGE THROUGH THEM, CLOSE IN AND WRECK IT. THE ENGINEER FLEES WHEN IT BREAKS.' });
  C.ent('check', 36, 19); C.ent('sprig', 41, 19, { face: -1 }); C.crate(46, 19); C.crate(47, 19); C.crate(47, 18);
  C.ent('sprig', 53, 19, { face: -1 }); C.ent('shield', 59, 19, { face: -1 });
  C.ent('catapult', 64, 19, { every: 2.6 }); C.ent('torch', 61, 19); C.ent('torch', 68, 19);
  C.coins([38, 18], [44, 17], [50, 18], [56, 18], [62, 17]);
  return C.done();
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
  ent('sign', 4, 19, { text: 'CAPS BOUNCE. HOLD JUMP FOR HEIGHT. THE ROT RUNS DOWNHILL.' }); ent('npc', 9, 19, { kind: 'squire' });
  ent('sign', 298, 19, { text: 'THE MOTHER CAP. SHE BREATHES IN AND SEALS. SHE BREATHES OUT AND OPENS. CUT THE GILLS, SPRING OFF THE STUMP, PLUNGE THE HEART.' });
  ent('npc', 11, 19, { kind: 'elder' }); // the elder myconid wants clean light
  ent('glow', 8, 19); ent('puffball', 14, 19); ent('sporeling', 18, 19, { face: -1 }); ent('puffball', 22, 19);
  bouncer(27, 19); coins([27, 15], [27, 12], [27, 9]);
  ent('sporeling', 33, 19, { face: -1 }); ent('glow', 38, 19); ent('sign', 41, 19, { text: 'PUFFBALLS BURST WHEN TOUCHED. SLASH ONE FROM RANGE AND IT BURSTS ON ITS OWN. THE CLOUD DRIFTS DOWNHILL.' });

  // ---- 2. The bouncer canyon: up the caps to the high path ----
  floor(45, 61, 26);
  bouncer(48, 25); plat(47, 19, 3); bouncer(49, 18); plat(48, 12, 3); plat(52, 12, 3); plat(56, 12, 3); ent('silver', 57, 11);
  ent('mover', 52, 16, { len: 2, range: 4, cap: true, speed: 30 });
  ent('vent', 58, 25, { period: 4, on: 1.8, h: 100 }); plat(57, 20, 3); ent('roller', 55, 25, { face: -1 });
  ent('puffball', 53, 11); ent('drone', 58, 8);
  coins([50, 16], [54, 10], [58, 10], [58, 22]); ent('glow', 46, 25); ent('glow', 52, 25);
  ent('sign', 46, 25, { text: 'VENTS LIFT YOU ON A BREATH OF SPORE. ROLLERS POP WHEN PLUNGED. THE DRONES DRIFT TOWARD NOISE.' });
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
  block(121, 125, 12, 27); bouncer(123, 11); ent('glow', 122, 11); ent('silver', 125, 11); // the shelf gives way onto a cap: plunge into it to spring back up
  ent('glow', 104, 3); ent('glow', 128, 3); ent('check', 127, 3); coins([97, 7], [111, 2], [123, 2]);

  // ---- 5. The sleep marsh: violet spores. Block to hold your breath. ----
  block(131, 165, 14, 27);
  plat(132, 8, 2); ent('glow', 132, 13); // a landing on the way down
  ent('sign', 134, 13, { text: 'VIOLET SPORES PUT YOU TO SLEEP WHERE YOU STAND. BLOCK THROUGH A CLOUD, OR RUN. A SLEEPING KNIGHT IS A SPORELING\'S SUPPER.' });
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
  ent('deco', 205, 13, { kind: 'deadTree', v: 0 }); ent('deco', 238, 13, { kind: 'deadTree', v: 1 }); ent('deco', 292, 13, { kind: 'deadTree', v: 0 });
  ent('sign', 201, 13, { text: 'THE STORM. THE VIOLET COMES IN WAVES. STAND UNDER A LIT CAP AND THE SPORES PASS YOU BY. THE CAPS GO OUT IF YOU HIT THEM.' });
  coins([208, 12], [231, 11], [239, 11]);

  // ---- 7. The drone gauntlet: caps on pillars over the drop ----
  shelf(252, 21, 3); shelf(258, 20, 3); shelf(264, 21, 3); ent('silver', 259, 19); // the low road: shelves that give way
  block(245, 271, 26, 27); for (const x of [247, 253, 259, 265, 270]) bouncer(x, 25); ent('glow', 252, 25); ent('glow', 264, 25); // the pit has a floor: caps on it spring you back to the low road
  for (const [px0, top] of [[249, 18], [255, 20], [261, 18], [267, 20]]) { block(px0, px0 + 2, top, 27); for (let i = 0; i < 3; i++) bouncer(px0 + i, top - 1); }
  ent('drone', 252, 6); ent('drone', 264, 6);
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
  ent('deco', 302, 19, { kind: 'deadTree', v: 1 }); ent('deco', 368, 19, { kind: 'deadTree', v: 0 });
  coins([306, 17], [364, 17]);

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: [], sleeps,
    duskStart: -1, duskLen: 1, music: 'theme2', night: false, glowNight: true,
    palette: { sky: [[64, 96, 112], [150, 190, 160]], near: 'mushroom', myc: false, dress: 'myc', haze: 'rgba(120,160,140,0.2)', grass: '#4a8a4a', grassL: '#7ac860', grassD: '#2f5e3a', dirt: '#4a3a3c', dirtL: '#5e4c4a', dirtD: '#33262a', canopy: ['#1f4a3a', '#2a5e46', '#3a7a55', '#4f9a68'] },
    weather: [{ x0: 0, x1: 99999, kind: 'spore' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'hive' }],
    storm: { x0: 201 * TS, x1: 244 * TS, y: 14 * TS },
    rot: { x0: 44 * TS, x1: 296 * TS }, // the wood sickens the deeper you go: a violet wash that grows with x, and lifts when she dies
    quest: { n: 3, item: 'cap', name: 'CLEAN CAP', npc: 'elder', done: 'THE LIGHT IS GATHERED', thanks: "THE ELDER'S THANKS" },
    arena: { x0: 297 * TS, x1: 374 * TS, floor: 20 * TS, trigger: 306 * TS, wallL: 296, wallR: 375, boss: 'mother', tint: '#9a5aa8', tintA: 0.1 },
  }
  // ---- 6c. THE PUFFBALL BOG: three sinks in the ground with caps at the bottom, lurkers between, drones above, a geyser, a shaman ----
  const G = grow(L, ret, 245, 44);
  G.floor(245, 288, 14);
  for (const [x0, x1] of [[252, 255], [262, 266], [274, 278]]) { for (let x = x0; x <= x1; x++) for (let y = 14; y <= 19; y++) G.set(x, y, 0); for (let x = x0; x <= x1; x++) G.set(x, 19, T.BOUNCER); }
  G.ent('sign', 246, 13, { text: 'THE BOG. FALL IN AND THE BOG KEEPS YOU. PLUNGE THE CAPS THAT FLOAT IN IT AND BOUNCE OUT. THE BRIGHT CAP THE ELDER WANTS GREW HERE.' });
  G.ent('lurker', 249, 13); G.ent('deco', 257, 13, { kind: 'deadTree', v: 1 }); G.ent('puffball', 259, 13); G.ent('lurker', 260, 13); G.ent('puffball', 269, 13); G.ent('lurker', 271, 13); G.ent('puffball', 281, 13);
  G.ent('vent', 258, 13, { period: 4, on: 1.5, h: 90, phase: 1 }); G.ent('vent', 270, 13, { period: 5, on: 1.6, h: 90, phase: 3 });
  G.ent('drone', 254, 8); G.ent('drone', 264, 7); G.ent('drone', 276, 8);
  G.ent('glow', 247, 13); G.ent('glow', 257, 13); G.ent('glow', 268, 13); G.ent('glow', 280, 13); G.ent('glow', 287, 13);
  G.ent('shaman', 284, 13, { face: -1 }); G.ent('sporeling', 286, 13, { face: -1 });
  G.coins([253, 11], [254, 10], [263, 11], [264, 10], [265, 11], [275, 11], [276, 10], [277, 11], [250, 12], [272, 12], [283, 12]);
  G.ent('check', 288, 13); G.ent('stray', 264, 18, { kind: 'cap' }); // a clean cap at the bottom of the middle sink
  const R1 = G.done();
  // ---- 6d. THE TUMBLE: a stepped hill. A puffball nest at the top rolls them down tier by tier; jump them, or stomp one and ride the bounce up. ----
  const Tm = grow(R1, R1, 201, 40);
  Tm.block(201, 207, 14, 27); Tm.block(208, 214, 12, 27); Tm.block(215, 221, 10, 27); Tm.block(222, 228, 8, 27); Tm.block(229, 236, 6, 27); Tm.block(237, 240, 14, 27);
  Tm.ent('sign', 202, 13, { text: 'THE TUMBLE. THE NEST ABOVE ROLLS ROLLERS DOWN THE SLOPE. JUMP THEM, OR STOMP ONE AND RIDE IT DOWN. THE NEST ITSELF CAN BE CUT.' });
  Tm.ent('nest', 234, 5, { every: 2.4, dir: -1 });
  Tm.ent('glow', 204, 13); Tm.ent('glow', 218, 9); Tm.ent('glow', 231, 5); Tm.ent('sporeling', 225, 7, { face: -1 }); Tm.ent('puffball', 211, 11);
  Tm.coins([205, 12], [211, 9], [218, 7], [225, 5], [232, 3], [238, 13]);
  Tm.ent('check', 239, 13);
  const R2 = Tm.done();
  // ---- 4b. THE FORK: off the shelf-climb plateau. Above, the cap canopy: ledges, spring caps, a drone. Below, the root cellar: a roofed run of lurkers, a roller and violet spores, with a cap at the end to spring you out. ----
  const Fk = grow(R2, R2, 131, 44);
  Fk.ent('sign', 129, 3, { text: 'THE CAP CANOPY ABOVE, THE ROOT CELLAR BELOW. HOLD DOWN TO LOOK BEFORE YOU DROP. THE CELLAR IS WHERE THE LURKERS SLEEP.' });
  Fk.plat(132, 10, 2); Fk.plat(131, 15, 2); // steps down the shaft, so the cellar is a descent and not a blind drop
  Fk.plat(133, 6, 3); Fk.set(139, 9, T.BOUNCER); Fk.plat(143, 4, 3); Fk.ent('puffball', 144, 3); Fk.plat(148, 6, 3); Fk.ent('drone', 151, 3); Fk.set(153, 8, T.BOUNCER); Fk.plat(156, 4, 3); Fk.ent('stray', 157, 3, { kind: 'cap' });
  Fk.plat(160, 7, 3); Fk.ent('sporeling', 161, 6, { face: -1 }); Fk.ent('mover', 164, 6, { len: 2, range: 4, cap: true, speed: 30 }); Fk.plat(169, 8, 3); Fk.ent('puffball', 170, 7);
  Fk.coins([134, 5], [139, 5], [149, 5], [153, 4], [162, 6], [171, 7]);
  Fk.block(135, 170, 10, 13); Fk.block(131, 174, 20, 27);
  Fk.R.interiors = (Fk.R.interiors || []).concat([[135, 170, 14, 19, 'earth']]);
  Fk.ent('glow', 133, 19); Fk.ent('lurker', 140, 19); Fk.ent('stray', 145, 19, { kind: 'cap' }); Fk.ent('glow', 148, 19); Fk.ent('sporeling', 150, 19, { face: -1 }); Fk.ent('roller', 156, 19, { face: -1, speed: 60 }); Fk.ent('puffball', 160, 19);
  Fk.R.sleeps.push({ x0: 162 * TS, x1: 169 * TS, y0: 14 * TS, y1: 20 * TS }); Fk.ent('drone', 165, 16); Fk.ent('glow', 170, 19); Fk.ent('lurker', 171, 19);
  Fk.set(173, 19, T.BOUNCER); Fk.plat(171, 17, 2); Fk.plat(171, 14, 2); Fk.plat(174, 8, 2);
  Fk.coins([137, 18], [143, 18], [153, 18], [158, 18], [166, 18], [172, 13]);
  return Fk.done();
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
  ent('sign', 4, 19, { text: 'THE GOBLINS LIVE HERE. YOU ARE NOT WELCOME.' }); ent('npc', 9, 19, { kind: 'squire' });
  ent('sign', 313, 13, { text: 'KING GORM. CUT THE BEARERS AND THE THRONE FALLS. HE REACHES FOR YOU: DODGE THE HAND, OR STAND ABOVE IT. A CAGE OR A PARRY BRINGS HIS HEAD DOWN. WHEN HE WALKS, THE ROOF FALLS WHERE HE STEPS.' });
  ent('door', 12, 19, { at: 12 }); ent('folk', 9, 19, { door: 12 }); ent('folk', 17, 19, { door: 12, alt: true }); ent('deco', 20, 19, { kind: 'well' });
  ent('sprig', 22, 19, { face: -1 }); coins([8, 18], [15, 17], [26, 18]);
  ent('sign', 29, 19, { text: 'THE THIEVES OF THE COURT SNATCH GOLD FROM YOUR PURSE AND RUN. CATCH ONE AND IT PAYS BACK WITH INTEREST.' });
  ent('thief', 34, 19, { face: -1 }); ent('door', 40, 19); ent('folk', 38, 19, { door: 40 });
  // the canopy road over the pasture, and a rope ladder up onto the first hall's roof
  plat(6, 16, 3); plat(11, 14, 3); plat(16, 12, 4); plat(22, 14, 3); plat(27, 16, 3); plat(33, 14, 3); plat(38, 12, 3); ent('silver', 18, 11);
  coins([7, 15], [12, 13], [18, 11], [23, 13], [28, 15], [34, 13], [39, 11]); ent('wasp', 25, 11);
  for (let y = 12; y <= 19; y++) set(44, y, T.NET);
  ent('sign', 41, 19, { text: 'ROPES GO UP: JUMP THROUGH THEM. THE ROOF ROAD SKIPS THE HALL AND ITS FIRE. THE HALL HAS THE COURT\'S SILVER.' });
  ent('check', 43, 19);

  // ---- 2. The first hall: inside a trunk. A bell at the far end and a gate under it. ----
  ceiling(45, 84, 16); block(45, 84, 20, 27);
  ent('torch', 48, 19); ent('torch', 60, 19); ent('torch', 72, 19); ent('torch', 82, 19);
  ent('sign', 47, 19, { text: 'PIKE GOBLINS HOLD THE LINE AND BRACE WHEN YOU CHARGE. JUMP THE PIKE AND CUT FROM BEHIND, OR THROW THE SHIELD INTO THEM.' });
  ent('pike', 56, 19, { face: -1 }); ent('sprig', 62, 19, { face: -1 }); ent('pike', 68, 19, { face: -1 });
  ent('brazier', 53, 19); ent('brazier', 66, 19); // oil braziers: tip them onto the line, or get burned
  ent('bell', 80, 19, { gate: 84 }); ent('sprig', 76, 19, { face: 1, ringer: true, bell: 80 });
  gate(84, 15, 19);
  coins([52, 18], [58, 17], [65, 18], [74, 17]);
  // the way around the gate if the bell rings: a two-wide hatch through the roof with ledges up it, onto the high road
  for (let x = 77; x <= 78; x++) for (let y = 13; y <= 16; y++) set(x, y, 0);
  plat(77, 18, 2); plat(77, 16, 2); plat(77, 14, 2); plat(76, 12, 4); ent('silver', 79, 11);
  ent('sign', 73, 19, { text: 'IF THE GATE FALLS: THE ROOF HATCH.' }); ent('torch', 79, 17); coins([77, 15], [78, 13]);

  // ---- 3. FORK ONE. High road: canopy walkways and swings, thieves and wasps. Low road: the burrow with a ram and a drop cage. ----
  // high road (rows 6-12)
  plat(85, 12, 4); plat(91, 10, 3); plat(96, 8, 4);
  movers.push({ kind: 'swing', px: 104 * TS, py: 2 * TS, arm: 80, x: 0, y: 0, w: 48, h: 8, period: 3.2, phase: 0 });
  plat(111, 8, 3); ent('thief', 112, 7, { face: -1 }); plat(116, 9, 4); ent('wasp', 121, 7);
  plat(103, 10, 3); plat(107, 9, 2); plat(123, 10, 2); plat(126, 11, 3); plat(130, 10, 2); // a ledge road under each swing: the swing is the fast way, never the only way
  movers.push({ kind: 'swing', px: 127 * TS, py: 2 * TS, arm: 88, x: 0, y: 0, w: 48, h: 8, period: 3.6, phase: 1.6 });
  plat(134, 9, 4); ent('thief', 136, 8, { face: -1 }); plat(140, 11, 3); plat(145, 13, 4);
  coins([87, 11], [93, 9], [98, 7], [104, 6], [112, 6], [118, 8], [127, 6], [135, 8], [141, 10], [146, 12]);
  // low road (rows 18-22): the burrow
  block(85, 150, 22, 27); ceiling(85, 150, 16);
  for (let x = 85; x <= 150; x++) for (let y = 17; y <= 21; y++) set(x, y, 0);
  ent('torch', 88, 21); ent('torch', 104, 21); ent('torch', 120, 21); ent('torch', 136, 21);
  ent('pike', 96, 21, { face: -1 }); ent('lever', 100, 21, { ram: 106 }); ent('ram', 106, 17); ent('brute', 110, 21, { face: -1 });
  ent('firepit', 93, 21, { period: 3.2, on: 1.4, phase: 0 }); ent('brazier', 114, 21); ent('firepit', 127, 21, { period: 3.2, on: 1.4, phase: 1.6 }); // the burrow burns in gouts
  ent('sprig', 118, 21, { face: -1 }); ent('plate', 124, 21, { cage: 128 }); ent('dropcage', 128, 17); ent('brute', 132, 21, { face: -1 });
  ent('sign', 90, 21, { text: 'THEIR TRAPS: THE LEVER SWINGS THE RAM ACROSS THE ROAD, THE PLATE DROPS THE CAGE. USE THEM ON THE GOBLINS THAT BUILT THEM.' });
  ent('pike', 142, 21, { face: -1 }); coins([93, 20], [114, 20], [126, 19], [138, 20], [147, 20]);
  // the roads rejoin at 150: a slope of ledges from the burrow up to the yard
  block(150, 152, 18, 27); block(153, 158, 16, 27); block(159, 164, 14, 27); block(165, 190, 14, 27);
  ent('check', 167, 13);

  // ---- 4. The kennels: the Hound Master. Walls close, the gate opens when he falls. ----
  ent('torch', 170, 13); ent('torch', 188, 13); ent('cage', 172, 13, { kind: 'bird' });
  ent('greathound', 182, 13); ent('chainpost', 187, 13); // a kennel hound on a chain: cut it loose and it goes for his mount
  ent('sign', 169, 13, { text: 'THE GREAT HOUND. IT LUNGES LOW: JUMP IT. IT POUNCES HIGH: DODGE, OR IT LANDS ON YOU. WHEN IT HOWLS, KILL THE PUPS FAST. IT SKIDS ON A BLOCK.' });
  gate(190, 9, 13);
  block(191, 210, 14, 27); ent('torch', 194, 13); coins([196, 12], [200, 12], [204, 12]); ent('check', 208, 13);
  plat(196, 11, 3); plat(201, 9, 3); plat(206, 11, 3); ent('archer', 202, 8, { face: -1, fire: true }); coins([197, 10], [202, 7], [207, 10]);

  // ---- 5. FORK TWO. Canopy (rows 5-10) over the roots (rows 16-20). ----
  // canopy
  plat(211, 11, 3); plat(216, 9, 3); plat(221, 7, 4);
  movers.push({ kind: 'swing', px: 231 * TS, py: 1 * TS, arm: 90, x: 0, y: 0, w: 48, h: 8, period: 3.0, phase: 0.8 });
  plat(238, 7, 3); ent('thief', 239, 6, { face: -1 }); plat(243, 9, 4); ent('wasp', 248, 6); ent('archer', 245, 8, { face: -1, fire: true });
  movers.push({ kind: 'swing', px: 254 * TS, py: 1 * TS, arm: 96, x: 0, y: 0, w: 48, h: 8, period: 3.4, phase: 2.2 });
  plat(261, 9, 3); plat(266, 11, 3); plat(271, 11, 4);
  plat(228, 9, 2); plat(231, 10, 3); plat(235, 8, 2); plat(250, 10, 2); plat(253, 11, 3); plat(257, 10, 2); // a ledge road under each canopy swing
  coins([212, 10], [217, 8], [223, 6], [231, 5], [239, 5], [245, 7], [254, 5], [262, 8], [267, 10], [272, 10]);
  // roots
  block(211, 275, 21, 27); ceiling(211, 275, 15);
  for (let x = 211; x <= 275; x++) for (let y = 16; y <= 20; y++) set(x, y, 0);
  ent('torch', 214, 20); ent('torch', 230, 20); ent('torch', 246, 20); ent('torch', 262, 20);
  ent('firepit', 216, 20, { period: 3.4, on: 1.5, phase: 0.8 }); ent('brazier', 224, 20); ent('firepit', 265, 20, { period: 3.4, on: 1.5, phase: 2.4 });
  ent('hound', 220, 20, { face: -1 }); ent('pike', 228, 20, { face: -1 }); ent('lever', 234, 20, { ram: 240 }); ent('ram', 240, 16); ent('sprig', 244, 20, { face: -1 }); ent('sprig', 248, 20, { face: -1 });
  ent('plate', 254, 20, { cage: 258 }); ent('dropcage', 258, 16); ent('brute', 262, 20, { face: -1 }); ent('thief', 268, 20, { face: -1 });
  coins([218, 19], [236, 19], [252, 18], [266, 19], [273, 19]);
  block(275, 277, 17, 27); block(278, 281, 15, 27); block(282, 300, 14, 27);
  ent('check', 284, 13);

  // ---- 6. The processional: townsfolk line a carpet, guards bar the way, banners hang. ----
  ent('sign', 286, 13, { text: 'THE COURT. THEY ARE WATCHING FROM THE BRANCHES. THE FIRE ARCHERS LIGHT THE GRASS. THE BRAZIERS CAN BE TIPPED.' });
  for (const x of [288, 292, 296]) ent('carpet', x, 13);
  ent('folk', 289, 13, { door: 300, alt: true }); ent('folk', 293, 13, { door: 300 }); ent('door', 299, 13);
  ent('shield', 295, 13, { face: -1 }); ent('shield', 298, 13, { face: -1 });
  ent('deco', 290, 13, { kind: 'banner', v: 0 }); ent('deco', 297, 13, { kind: 'banner', v: 1 });
  ent('thief', 302, 13, { face: -1 }); coins([289, 12], [294, 12]);
  plat(286, 10, 4); plat(292, 8, 3); ent('archer', 288, 9, { face: -1, fire: true }); coins([287, 9], [293, 7], [294, 7]);
  // the cache: a hidden loft above the court holds the Thief Cloak
  plat(303, 9, 3); plat(307, 7, 3); coins([304, 8], [308, 6], [309, 6]); ent('relic', 308, 6, { kind: 'cloak' });
  ent('check', 312, 13);

  // ---- 7. The throne room: King Gorm Underleaf on his palanquin. ----
  block(300, 429, 14, 27);
  for (let x = 318; x <= 368; x++) ent('carpet', x, 13);
  ent('torch', 320, 13); ent('torch', 366, 13); ent('deco', 326, 13, { kind: 'banner', v: 0 }); ent('deco', 360, 13, { kind: 'banner', v: 1 });
  ent('deco', 332, 13, { kind: 'skullPile', v: 0 }); ent('deco', 354, 13, { kind: 'skullPile', v: 1 });
  ent('brazier', 329, 13); ent('brazier', 359, 13); // the court's braziers: tip them into the King's path
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
    arena: { x0: 316 * TS, x1: 370 * TS, floor: 14 * TS, trigger: 322 * TS, wallL: 315, wallR: 371, boss: 'king', music: 'king', tint: '#c9463d', tintA: 0.12, fx: 'embers' },
    mini: { x0: 168 * TS, x1: 189 * TS, floor: 14 * TS, trigger: 172 * TS, wallL: 167, gate: 190, boss: 'greathound' },
  }
  // ---- 5c. THE TOLL BRIDGE: a rope bridge over the gorge. Pikes hold it, a cutter waits at the far post; if it falls, ledges below lead back up. ----
  const G = grow(L, ret, 284, 44);
  G.block(284, 287, 14, 27); G.block(324, 327, 14, 27);
  for (let x = 288; x <= 323; x++) G.set(x, 14, T.PLANK);
  G.ent('bridge', 288, 14, { x1: 323 });
  G.ent('sign', 285, 13, { text: 'THE TOLL BRIDGE. PAY IN STEEL, AND HURRY: THE GOBLINS CUT THE ROPES BEHIND YOU. IF IT FALLS, THE LEDGES BELOW STILL REACH THE FAR BANK.' });
  G.ent('door', 286, 13); G.ent('torch', 288, 13); G.ent('torch', 323, 13);
  G.ent('pike', 297, 13, { face: -1 }); G.ent('thief', 305, 13, { face: -1 }); G.ent('pike', 313, 13, { face: -1 });
  G.ent('sprig', 325, 13, { face: -1, cutter: true }); G.ent('wasp', 301, 10); G.ent('wasp', 318, 10);
  G.ent('deco', 291, 13, { kind: 'banner', v: 0 }); G.ent('deco', 320, 13, { kind: 'banner', v: 1 });
  G.plat(292, 18, 3); G.plat(298, 17, 3); G.plat(304, 18, 3); G.plat(310, 17, 3); G.plat(316, 18, 3); G.plat(321, 17, 2); G.plat(324, 16, 2); // the way back up if the bridge falls: never more than three tiles to the next ledge
  G.plat(289, 24, 2); G.plat(292, 22, 2); G.plat(289, 20, 2); // and up from the gorge floor to the first ledge
  G.block(288, 323, 26, 27); G.ent('deco', 296, 25, { kind: 'skullPile', v: 0 }); G.ent('deco', 316, 25, { kind: 'skullPile', v: 1 }); // the gorge floor, bones and all
  G.ent('firepit', 302, 25, { period: 3, on: 1.3, phase: 0 }); G.ent('firepit', 311, 25, { period: 3, on: 1.3, phase: 1.5 }); G.ent('silver', 307, 25);
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
  ent('sign', 4, 19, { text: 'THE SCREE PATH. THE HILL TAKES THE CARELESS.' }); ent('npc', 9, 19, { kind: 'squire' });
  wall(18, 19); wall(30, 19); wall(44, 19); ent('deco', 26, 19, { kind: 'fence', v: 0 }); ent('deco', 40, 19, { kind: 'fence', v: 1 });
  ent('goat', 36, 19, { face: -1 }); ent('harpy', 50, 14);
  coins([12, 17], [24, 18], [40, 18], [48, 17]);
  ent('sign', 22, 19, { text: 'THREE EWES STRAYED UP THE HILL WHEN THE RAMS CAME DOWN. THE SHEPHERD WANTS THEM BACK. WALK INTO ONE AND IT FOLLOWS. THE FLEECE IS THE REWARD.' });
  ent('check', 58, 19);

  // ---- 2. The terraces: three steps up the hill, a rockfall, the first stray ----
  block(61, 80, 18, 27); block(81, 100, 16, 27); block(101, 120, 14, 27);
  wall(62, 17); wall(82, 15); wall(102, 13);
  plat(70, 14, 3); plat(66, 16, 2); ent('stray', 71, 13); coins([70, 13], [72, 13]);
  ent('goat', 72, 17, { face: -1 }); ent('shield', 78, 17, { face: -1 }); ent('rockfall', 90, 4, { every: 2.4 }); ent('rockfall', 94, 4, { every: 3.1 });
  ent('deco', 84, 15, { kind: 'stone' }); ent('deco', 106, 13, { kind: 'stone' }); ent('deco', 112, 13, { kind: 'cairn' });
  ent('troll', 92, 15, { face: -1 }); ent('harpy', 110, 8);
  coins([66, 17], [76, 17], [86, 15], [98, 15], [104, 13], [116, 13]);
  ent('check', 118, 13);

  // ---- 3. The windmill rise: the sails lift you to the loft and the high path ----
  block(121, 176, 14, 27);
  ent('deco', 150, 13, { kind: 'mill' });
  for (let i = 0; i < 4; i++) movers.push({ kind: 'wheel', px: 150 * TS + 8, py: 13 * TS - 58, r: 42, phase: i * Math.PI / 2, period: 7, x: 0, y: 0, w: 22, h: 6 });
  plat(156, 6, 4); ent('stray', 158, 5); coins([157, 5], [159, 5]);
  plat(162, 8, 3); plat(167, 9, 3); plat(172, 10, 3); ent('archer', 168, 8, { face: -1 }); ent('harpy', 162, 3); ent('silver', 163, 7);
  coins([163, 7], [168, 7], [173, 9]);
  wall(128, 13); wall(140, 13); ent('goat', 134, 13, { face: -1 }); ent('thorn', 138, 13, { face: -1 }); ent('sprig', 160, 13, { face: -1 });
  ent('sign', 124, 13, { text: 'THE WINDMILL. RIDE THE SAILS UP. THE LOFT IS WORTH THE CLIMB: THE MILLER LEFT SILVER UP THERE WHEN THE RAMS CAME.' });
  ent('deco', 138, 13, { kind: 'cairn' });
  coins([131, 12], [146, 12], [164, 12], [170, 12]);
  ent('check', 174, 13);

  // ---- 4. The scree slope: the loose stone carries you down, rocks come off the cliff, harpies dive ----
  const steps = [[177, 190, 14], [191, 200, 15], [201, 212, 16], [213, 224, 17], [225, 238, 18], [239, 250, 19]];
  for (const [x0, x1, y] of steps) { block(x0, x1, y, 27); if (x0 > 177) scree.push({ x0, x1, y, dir: 1 }); }
  ent('sign', 180, 13, { text: 'SCREE. IT SLIDES UNDER YOU AND CARRIES YOU DOWN. BRACE WITH BLOCK, OR BOUNCE ACROSS IT. THE TROLL THROWS ROCKS FROM ABOVE.' });
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
  ent('goat', 266, 18, { face: -1 }); ent('troll', 261, 18, { face: -1 }); wall(270, 18);
  plat(277, 17, 3); plat(279, 10, 2); ent('silver', 280, 9);
  block(285, 363, 9, 27);
  block(276, 284, 20, 27); // the foot of the wall: a step down from the bank, no pit
  for (let y = 10; y <= 19; y++) { set(283, y, T.CLIMB); set(284, y, T.CLIMB); } // the crag wall: hold into the rock to cling, jump to kick up it
  ent('sign', 276, 18, { text: 'THE CRAG WALL. THE OCHRE ROCK WITH THE CUT HANDHOLDS IS THE KIND YOU CAN CLIMB: HOLD INTO IT TO CLING, JUMP TO KICK UP AND AWAY, THEN BACK IN. THE HARPIES NEST IN THE CRACKS.' });
  ent('rockfall', 281, 2, { every: 2.7 });
  coins([278, 16], [282, 15], [282, 12]);
  ent('sprig', 290, 8, { face: -1 }); ent('deco', 288, 8, { kind: 'stone' });
  ent('check', 294, 8);

  // ---- 6. THE FOLD: the Ram Lord's walled pasture on the plateau ----
  ent('sign', 296, 8, { text: 'THE RAM LORD. HIS HIDE TURNS STEEL. HE ONLY BLEEDS DAZED: STAND BY THE WALL, STEP ASIDE AS HE CHARGES, AND CUT HIM WHILE HE REELS. HE CALLS THE FLOCK. HE TOSSES.' });
  ent('deco', 313, 8, { kind: 'foldGate' }); ent('deco', 327, 8, { kind: 'foldGate' });
  ent('deco', 316, 8, { kind: 'cairn' }); ent('deco', 325, 8, { kind: 'cairn' });
  ent('ramlord', 322, 8);

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: movers,
    duskStart: -1, duskLen: 1, music: 'theme4', night: false, glowNight: false,
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(140,90,150,0.14)', grass: '#8a8a3a', grassL: '#c9b84a', grassD: '#5a5a2a', dirt: '#5a5a66', dirtL: '#6e6e7a', dirtD: '#3a3a44', canopy: ['#4a4458', '#5e5870', '#6a4a7a', '#a07ab8'] },
    stone, scree, strays: 3,
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 312 * TS, x1: 328 * TS, floor: 9 * TS, trigger: 315 * TS, wallL: 311, wallR: 329, boss: 'ram', tint: '#6a4a7a', tintA: 0.12, fx: 'dust' },
  }
  // ---- 4b. THE ROPEWAY: the gorge proper. A swing, a rope lift, the old mill's sails, another swing; harpies on the wind, rocks off the cliff, a ladder out of the bottom. ----
  const GA = grow(L, ret, 256, 56);
  GA.block(256, 257, 19, 27); GA.block(258, 304, 26, 27); GA.block(305, 311, 19, 27);
  GA.ent('sign', 256, 18, { text: 'THE ROPEWAY. SWING FROM THE HOOKS, RIDE THE LIFT WHILE YOU STAND ON IT, RIDE THE SAILS OF THE HIGH MILL. NOTHING UP HERE STAYS STILL.' });
  GA.R.moversExtra.push({ kind: 'swing', px: 263 * TS, py: 8 * TS, arm: 96, x: 0, y: 0, w: 48, h: 8, period: 3.2, phase: 0 });
  GA.plat(268, 16, 3);
  GA.R.moversExtra.push({ kind: 'lift', x: 272 * TS, y: 18 * TS, y0: 18 * TS, y1: 12 * TS, w: 32, h: 8, speed: 30 });
  GA.plat(276, 12, 2);
  GA.block(279, 283, 19, 23); GA.ent('deco', 281, 18, { kind: 'mill' }); // the mill stands on an arch: the gorge floor runs under it
  for (let i = 0; i < 4; i++) GA.R.moversExtra.push({ kind: 'wheel', px: 281 * TS + 8, py: 19 * TS - 58, r: 42, phase: i * Math.PI / 2, period: 7, x: 0, y: 0, w: 22, h: 6 });
  GA.plat(285, 12, 3);
  GA.R.moversExtra.push({ kind: 'swing', px: 291 * TS, py: 6 * TS, arm: 100, x: 0, y: 0, w: 48, h: 8, period: 3.4, phase: 1.5 });
  GA.plat(296, 14, 3); GA.plat(301, 16, 3);
  GA.ent('rockfall', 270, 3, { every: 2.8 }); GA.ent('rockfall', 298, 3, { every: 2.5 });
  GA.ent('harpy', 265, 10); GA.ent('harpy', 288, 8); GA.ent('troll', 308, 18, { face: -1 });
  for (let y = 19; y <= 25; y++) { GA.set(303, y, T.NET); GA.set(304, y, T.NET); GA.set(258, y, T.NET); GA.set(259, y, T.NET); } // rope ladders up both cliffs
  GA.ent('deco', 262, 25, { kind: 'stone', v: 1 }); GA.ent('deco', 290, 25, { kind: 'cairn' }); GA.ent('goat', 268, 25, { face: -1 });
  GA.coins([263, 12], [269, 15], [272, 14], [277, 11], [281, 12], [286, 11], [291, 10], [297, 13], [302, 15], [275, 25], [295, 25]);
  GA.ent('check', 309, 18);
  const RA = GA.done();
  // ---- 3b. THE CAIRN FIELD: standing stones, a gully that drags you back, a goat pen, harpies on the wind ----
  const G = grow(RA, RA, 176, 40);
  G.floor(176, 215, 14);
  for (let x = 190; x <= 197; x++) for (let y = 14; y <= 17; y++) G.set(x, y, 0); // the gully
  G.R.scree.push({ x0: 190, x1: 197, y: 18, dir: -1 }); G.plat(196, 16, 2); for (let y = 14; y <= 17; y++) G.set(198, y, T.CLIMB);
  G.ent('sign', 178, 13, { text: 'THE CAIRN FIELD. THE WIND IN THE GULLY PULLS YOU BACK. WAIT FOR THE LULL, THEN JUMP THE FAR SIDE. THE CAIRNS MARK THE DEAD WHO DID NOT.' });
  G.ent('deco', 181, 13, { kind: 'stone', v: 0 }); G.ent('deco', 186, 13, { kind: 'cairn' }); G.ent('deco', 205, 13, { kind: 'stone', v: 2 }); G.ent('deco', 211, 13, { kind: 'cairn' });
  G.ent('rockfall', 193, 5, { every: 2.4 }); G.ent('harpy', 187, 8); G.ent('harpy', 212, 9);
  G.R.stone.push([200, 200, 13, 13], [208, 208, 13, 13]); G.block(200, 200, 13, 13); G.block(208, 208, 13, 13);
  G.ent('goat', 203, 13, { face: -1 }); G.ent('goat', 206, 13, { face: 1 }); G.ent('sprig', 184, 13, { face: -1 });
  G.coins([180, 12], [185, 11], [192, 17], [195, 17], [199, 12], [204, 11], [210, 12], [214, 12]);
  G.ent('check', 214, 13);
  const RC = G.done();
  // ---- 1b. THE HAMLET: the hill folk's cottages. They bar their doors; goblins raid the lane; the roofs are the high road, and a chimney ledge holds silver. ----
  const B = grow(RC, RC, 61, 48);
  B.floor(61, 108, 20);
  B.ent('sign', 62, 19, { text: 'THE HAMLET. THE HILL FOLK BAR THEIR DOORS TO GOBLINS, AND TO YOU. THEY WILL OPEN THEM WHEN THE RAM LORD IS DEAD. NOT BEFORE.' });
  B.R.stone.push([64, 64, 19, 19], [107, 107, 19, 19]); B.block(64, 64, 19, 19); B.block(107, 107, 19, 19);
  for (const [dx, alt] of [[70, false], [86, true], [102, false]]) { B.ent('door', dx, 19, { kind: 'cottage', at: dx }); B.ent('folk', dx - 3, 19, { door: dx, alt }); B.plat(dx - 2, 18, 5); }
  B.ent('deco', 78, 19, { kind: 'well' }); B.ent('deco', 94, 19, { kind: 'fence', v: 0 });
  B.ent('sprig', 74, 19, { face: -1 }); B.ent('shield', 90, 19, { face: -1 }); B.ent('goat', 99, 19, { face: -1 });
  B.ent('archer', 87, 17, { face: -1 }); B.ent('goat', 80, 19, { face: -1 });
  B.plat(85, 15, 2); B.ent('silver', 85, 14);
  B.coins([68, 17], [71, 17], [77, 18], [84, 17], [88, 17], [100, 17], [103, 17], [96, 18]);
  B.ent('check', 106, 19);
  return B.done();
;
}

// ---------- LEVEL 7: THE HANGING VILLAGE ----------
// A tree-city that goes up, not across. Six tiers of floor bands zig-zag to the crown; every tier has a different way up.
function hangingVillage() {
  const W = 110, H = 112; const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const movers = [], gusts = [];
  const band = (x0, x1, top) => block(x0, x1, top, top + 3);
  const hole = (x0, x1, top) => { for (let y = top; y <= top + 3; y++) for (let x = x0; x <= x1; x++) set(x, y, 0); };
  const ladder = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET); };
  const shelf = (x, y, n) => { for (let i = 0; i < n; i++) set(x + i, y, T.SHELF); };
  const pit = (x0, x1, top) => { for (let x = x0; x <= x1; x++) { set(x, top, 0); set(x, top + 1, T.SPIKE); } }; // a rotten stretch of bough with goblin spikes set under it
  const vine = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); }; // a hanging vine: climb it like a rope
  block(0, 0, 0, H - 1); block(W - 1, W - 1, 0, H - 1); // the trunk walls either side
  const tops = { t0: 108, t1: 94, t2: 80, t3: 66, t4: 52, t5: 38, crown: 20 };
  // the mountain itself: rock pillars behind every ledge, stacked so each reads as one cliff from the valley to the crown, with timber struts under the ledges
  [108, 94, 80, 66, 52, 38, 20].forEach((top, i) => { for (const x of [16, 46, 76, 98]) { ent('deco', x, top - 1, { kind: 'pillar', v: (x + i) % 3 }); if (top < 108) { ent('deco', x - 2, top + 4, { kind: 'strut', v: 0 }); ent('deco', x + 2, top + 4, { kind: 'strut', v: 1 }); } } });

  // ---- Tier 0. THE ROOTS: goblin shanties among the roots, a hill-folk cottage, the first spider ----
  block(0, W - 1, tops.t0, H - 1);
  ent('npc', 9, 107, { kind: 'squire' }); ent('sign', 4, 107, { text: 'THE HANGING VILLAGE. A TOWN ON THE CLIFF. UP IS THE ONLY WAY: ROPES, ROCK, WHEELS AND SWINGS.' });
  ent('door', 14, 107, { at: 14 }); ent('folk', 11, 107, { door: 14 }); ent('sprig', 22, 107, { face: -1 });
  ent('door', 34, 107, { at: 34 }); ent('folk', 31, 107, { door: 34 }); ent('deco', 44, 107, { kind: 'well' });
  ent('door', 60, 107, { kind: 'cottage', at: 60 }); ent('folk', 57, 107, { door: 60, alt: true });
  ent('sprig', 50, 107, { face: -1 }); ent('spider', 76, 100, { drop: 110 }); ent('squirrel', 88, 107, { face: -1 }); ent('shield', 94, 107, { face: -1 });
  plat(24, 104, 3); plat(38, 102, 3); ent('mover', 68, 103, { len: 2, range: 6, speed: 40 }); ent('wasp', 45, 101); coins([8, 105], [25, 103], [39, 101], [66, 105], [72, 100], [84, 105], [98, 105]);
  ent('check', 98, 107);
  // 0 -> 1: a rope ladder through the first bough
  band(1, W - 2, tops.t1); hole(100, 105, tops.t1); ladder(102, 103, tops.t1, tops.t0 - 1); // the first ladder stands in the open: nothing between the roots road and its foot
  ent('sign', 96, 107, { text: 'ROPE LADDERS: JUMP UP THROUGH THEM, DROP DOWN WITH DOWN+JUMP. THE VILLAGE IS SEVEN TIERS TALL. THE CROWN IS THE EIGHTH.' });

  // ---- Tier 1. THE LOWER BOUGHS (walk left): spiders under the bough above, a branch that snaps over a gap, an archer's nest ----
  hole(66, 71, tops.t1); shelf(66, tops.t1, 6); vine(68, tops.t1, tops.t0 - 1); // the snapping branch: fall and you land on the roots, and a vine climbs back up through the gap
  hole(50, 55, tops.t1); movers.push({ kind: 'swing', px: 52 * TS + 8, py: (tops.t1 - 9) * TS, arm: 76, x: 0, y: 0, w: 32, h: 8, period: 3.0, phase: 0.5, vine: true }); vine(52, tops.t1, tops.t0 - 1); // a vine swings over a second gap; the vine below it is the way back up
  pit(78, 79, tops.t1); ent('sign', 82, 93, { text: 'MIND THE PITS. THE BOUGH IS ROTTEN IN PLACES AND THE SPIKES UNDER IT ARE GOBLIN WORK. THE VINES CLIMB LIKE ROPES.' });
  hole(28, 33, tops.t1); ent('mover', 28, tops.t1, { len: 2, range: 4, speed: 44 }); ent('wasp', 30, 90); // a second gap: a bough that slides, and a wasp over it
  ent('sign', 74, 93, { text: 'THE BRANCH SNAPS UNDER A STANDING WEIGHT. KEEP MOVING. IT GROWS BACK IN A BREATH OR TWO.' });
  ent('spider', 84, 86, { drop: 100 }); ent('spider', 58, 86, { drop: 100 }); ent('spider', 36, 86, { drop: 100 });
  ent('sprig', 46, 93, { face: 1 }); ent('thorn', 20, 93, { face: 1 }); plat(20, 90, 3); ent('archer', 21, 89, { face: 1 });
  ent('door', 44, 93, { at: 44 }); ent('folk', 47, 93, { door: 44 });
  coins([92, 91], [80, 91], [62, 91], [54, 91], [40, 91], [22, 88], [12, 91]);
  ent('check', 8, 93); ent('silver', 68, 90);
  // 1 -> 2: a counterweight lift at the trunk
  band(1, W - 2, tops.t2); hole(2, 7, tops.t2);
  movers.push({ kind: 'lift', x: 3 * TS, y: (tops.t1 - 1) * TS, y0: (tops.t1 - 1) * TS, y1: (tops.t2 - 1) * TS, w: 32, h: 8, speed: 34 });
  ent('sign', 8, 93, { text: 'THE LIFT RISES WHILE YOU STAND ON IT AND SINKS WHEN YOU STEP OFF. THE WINCH IS GOBLIN WORK. IT HOLDS.' });

  // ---- Tier 2. THE MARKET (walk right): hill folk and goblins live door to door; the Lamplighter wants three lanterns lit ----
  ent('sign', 8, 79, { text: 'THE MARKET. THE LAMPLIGHTER HAS LOST THREE LAMPS TO THE SQUIRREL KNIGHTS. THE REEVE HATES A LIT LANTERN. THAT IS WORTH KNOWING.' });
  ent('door', 14, 79, { kind: 'cottage', at: 14 }); ent('folk', 11, 79, { door: 14, alt: true }); ent('npc', 22, 79, { kind: 'lamplighter' }); ent('deco', 26, 79, { kind: 'lanternPost' });
  ent('door', 32, 79, { kind: 'cottage', at: 32 }); ent('folk', 35, 79, { door: 32, alt: true }); ent('deco', 40, 79, { kind: 'well' }); ent('stray', 44, 79, { kind: 'lamp' });
  ent('door', 50, 79, { at: 50 }); ent('folk', 47, 79, { door: 50 }); ent('deco', 56, 79, { kind: 'fence', v: 0 }); ent('door', 64, 79, { at: 64 }); ent('folk', 67, 79, { door: 64 });
  ent('squirrel', 74, 79, { face: -1 }); ent('sprig', 84, 79, { face: -1 }); ent('shield', 92, 79, { face: -1 });
  plat(58, 76, 3); plat(78, 75, 3); coins([59, 75], [79, 74], [18, 77], [38, 77], [70, 77], [88, 77], [96, 77]);
  movers.push({ kind: 'swing', px: 44 * TS, py: 70 * TS, arm: 70, x: 0, y: 0, w: 32, h: 8, period: 3.0, phase: 0 }); plat(40, 73, 2); plat(48, 72, 2); ent('spit', 49, 71, { face: -1 }); coins([44, 71]); // a rope swing over the well to a spitter's ledge
  ent('check', 96, 79);
  // 2 -> 3: the wheel walk: two water wheels stacked at the trunk lift you to the third bough
  band(1, W - 2, tops.t3); hole(100, 107, tops.t3);
  for (let i = 0; i < 4; i++) { movers.push({ kind: 'wheel', px: 104 * TS + 8, py: 75 * TS, r: 42, phase: i * Math.PI / 2, period: 7, x: 0, y: 0, w: 22, h: 6 }); movers.push({ kind: 'wheel', px: 104 * TS + 8, py: 68 * TS, r: 42, phase: i * Math.PI / 2 + 0.8, period: 6.4, x: 0, y: 0, w: 22, h: 6 }); }
  ent('deco', 104, 74, { kind: 'axle', hang: true }); ent('deco', 104, 67, { kind: 'axle', hang: true }); // hubs on beams into the trunk wall
  ent('sign', 98, 79, { text: 'THE WATER WHEELS. RIDE THE PADDLES UP. TWO OF THEM, STACKED. JUMP FROM THE TOP OF THE FIRST TO THE BOTTOM OF THE SECOND.' });

  // ---- Tier 3. THE WINDY BOUGH (walk left): gusts push you along the bough; spiders, a sapper, a goblin house on stilts ----
  ent('sign', 96, 65, { text: 'THE WIND COMES IN GUSTS OFF THE CRAG. WAIT FOR THE LULL, OR LEAN INTO IT AND LET IT CARRY YOU. THE FLAGS SHOW WHICH WAY.' });
  gusts.push({ x0: 20 * TS, x1: 92 * TS, y0: 56 * TS, y1: 66 * TS, dir: -1, period: 5, on: 1.6, phase: 0 });
  gusts.push({ x0: 20 * TS, x1: 90 * TS, y0: 12 * TS, y1: 20 * TS, dir: 1, period: 9, on: 2.2, phase: 3, alt: true, arena: true }); // the crown's crosswind, only while the Reeve fights
  hole(36, 40, tops.t3); ent('mover', 36, tops.t3, { len: 2, range: 3, speed: 36 }); hole(70, 74, tops.t3); ent('mover', 70, tops.t3, { len: 2, range: 3, speed: 36 }); // gaps in the bough with sliding boughs across them: the wind wants you off
  pit(52, 53, tops.t3); pit(30, 31, tops.t3); // pits the wind wants to push you into
  ent('spider', 80, 58, { drop: 100 }); ent('spider', 48, 58, { drop: 100 }); ent('sapper', 60, 65, { face: 1 }); ent('sprig', 26, 65, { face: 1 }); ent('wasp', 56, 60);
  plat(70, 62, 3); plat(40, 61, 3); coins([71, 61], [41, 60], [86, 63], [56, 63], [26, 63]);
  ent('door', 88, 65, { at: 88 }); ent('folk', 91, 65, { door: 88 }); ent('deco', 14, 65, { kind: 'lanternPost' });
  ent('check', 16, 65); ent('stray', 71, 61, { kind: 'lamp' });
  // 3 -> 4: snapping branches up the trunk
  band(1, W - 2, tops.t4); hole(2, 9, tops.t4);
  shelf(8, 63, 2); shelf(4, 60, 2); shelf(8, 57, 2); shelf(4, 54, 2); shelf(7, 51, 2);
  ent('sign', 12, 65, { text: 'THE BRANCHES SNAP UNDER YOU. CLIMB QUICK.' });

  // ---- Tier 4. THE UPPER BOUGHS (walk right): the squirrel knight's ground; spiders, an archer nest, silver on a high ledge ----
  ent('sign', 10, 51, { text: 'THE SQUIRREL KNIGHT STEALS AND CLIMBS. CATCH IT BEFORE IT REACHES THE TRUNK, OR IT TAKES YOUR GOLD TO THE CROWN.' });
  ent('door', 20, 51, { kind: 'cottage', at: 20 }); ent('folk', 17, 51, { door: 20, alt: true });
  hole(32, 37, tops.t4); movers.push({ kind: 'swing', px: 34 * TS + 8, py: (tops.t4 - 9) * TS, arm: 76, x: 0, y: 0, w: 32, h: 8, period: 3.2, phase: 1.2, vine: true }); vine(34, tops.t4, tops.t3 - 1); pit(90, 91, tops.t4); // a vine swing over a gap to the windy bough, a vine up through it, a pit by the thorn
  ent('squirrel', 30, 51, { face: 1 }); ent('spider', 45, 44, { drop: 100 }); ent('spider', 65, 44, { drop: 100 });
  plat(56, 48, 3); ent('archer', 57, 47, { face: -1 }); plat(72, 46, 2); ent('silver', 73, 45); plat(76, 49, 3);
  set(40, tops.t4 - 1, T.BOUNCER); plat(38, 45, 2); plat(43, 43, 3); coins([39, 44], [44, 42], [45, 42]); ent('wasp', 48, 44); // a springy bough up to a high ledge
  movers.push({ kind: 'lift', x: 62 * TS, y: (tops.t4 - 1) * TS, y0: (tops.t4 - 1) * TS, y1: 44 * TS, w: 32, h: 8, speed: 30 }); plat(66, 44, 3); coins([67, 43]); // a basket lift to a nest of coins
  ent('door', 84, 51, { at: 84 }); ent('folk', 87, 51, { door: 84 }); ent('thorn', 94, 51, { face: -1 });
  coins([26, 49], [38, 49], [50, 49], [60, 46], [80, 47], [98, 49]);
  ent('check', 12, 51);
  // 4 -> 5: swings, a ledge and a rope ladder at the trunk
  band(1, W - 2, tops.t5); hole(100, 105, tops.t5);
  movers.push({ kind: 'swing', px: 96 * TS, py: 46 * TS, arm: 80, x: 0, y: 0, w: 48, h: 8, period: 3.2, phase: 0 });
  movers.push({ kind: 'swing', px: 104 * TS, py: 42 * TS, arm: 80, x: 0, y: 0, w: 48, h: 8, period: 3.4, phase: 1.5 });
  plat(102, 44, 3); ladder(103, 104, tops.t5, 43); for (let y = 44; y <= 51; y++) set(99, y, T.CLIMB); // and a short ochre rock face for those who would rather kick up it
  ent('sign', 90, 51, { text: 'THE LAST CLIMB. SWING, THEN SWING AGAIN, THEN THE ROPE. OR HOLD INTO THE OCHRE ROCK TO CLING AND JUMP TO KICK UP IT. THE WIND IS WORSE UP HERE.' });

  // ---- Tier 5. THE LANTERN STAIR (walk left): the last lamp, a brute at the door, the way to the crown ----
  ent('sign', 96, 37, { text: 'THE CROWN IS CLOSE. THE REEVE DOES NOT LIKE LIGHT: LIGHT EVERY LANTERN YOU PASS. THE LAMPLIGHTER WOULD.' });
  ent('door', 88, 37, { kind: 'cottage', at: 88 }); ent('folk', 91, 37, { door: 88, alt: true }); ent('deco', 84, 37, { kind: 'lanternPost' });
  ent('spider', 70, 30, { drop: 100 }); ent('brute', 50, 37, { face: 1 }); ent('door', 60, 37, { kind: 'cottage', at: 60 }); ent('folk', 63, 37, { door: 60, alt: true });
  ent('spider', 40, 30, { drop: 100 }); ent('stray', 30, 37, { kind: 'lamp' }); ent('deco', 48, 37, { kind: 'lanternPost' }); ent('deco', 20, 37, { kind: 'lanternPost' });
  plat(76, 34, 3); plat(26, 33, 3); coins([77, 33], [27, 32], [66, 35], [44, 35], [12, 35]);
  pit(42, 43, tops.t5); pit(72, 73, tops.t5);
  hole(52, 57, tops.t5); shelf(52, tops.t5, 6); hole(14, 18, tops.t5); ent('mover', 14, tops.t5, { len: 2, range: 3, speed: 40 }); ent('wasp', 55, 33); ent('thorn', 36, 37, { face: 1 }); // snapping branch and a sliding bough on the way to the crown
  ent('check', 10, 37);
  // 5 -> crown: the long rope
  band(1, W - 2, tops.crown); hole(2, 5, tops.crown); ladder(3, 4, tops.crown, tops.t5 - 1);

  // ---- The crown: THE OWL REEVE. Three lit lanterns on the great bough; bait its swoops into the light. ----
  ent('sign', 8, 19, { text: 'THE OWL REEVE. IT SWOOPS: STAND BY A LIT LANTERN AND STEP ASIDE, AND IT CRASHES INTO THE LIGHT. IT SCREECHES SPIDERS DOWN. ITS GUST PUSHES. ITS TALONS CARRY. DODGE THOSE.' });
  ent('check', 12, 19);
  for (const x of [32, 54, 76]) ent('lantern', x, 19);
  plat(26, 17, 3); plat(81, 17, 3); plat(51, 12, 6);
  ent('deco', 40, 19, { kind: 'stone', v: 0 }); ent('deco', 68, 19, { kind: 'cairn' });
  ent('owl', 54, 11);
  ent('gate', 100, 19);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 107 }, pools: [], falls: [], moversExtra: movers, gusts, vines: [52, 68, 34], tall: { top: 20 * TS, bottom: 108 * TS },
    duskStart: -1, duskLen: 1, music: 'theme4', night: false, glowNight: true,
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', hall: true, haze: 'rgba(140,90,150,0.12)', grass: '#8a8a3a', grassL: '#c9b84a', grassD: '#5a5a2a', dirt: '#5a5a66', dirtL: '#6e6e7a', dirtD: '#3a3a44', canopy: ['#4a4458', '#5e5870', '#6a4a7a', '#a07ab8'] },
    stone: [], scree: [], snowLine: 52,
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    quest: { n: 3, item: 'lamp', name: 'LAMP', npc: 'lamplighter', done: 'THE LAMPS ARE LIT', thanks: "THE LAMPLIGHTER'S THANKS" },
    arena: { x0: 20 * TS, x1: 90 * TS, floor: 20 * TS, trigger: 26 * TS, wallL: 19, wallR: 90, boss: 'owl', tint: '#ffd36b', tintA: 0.08, fx: 'motes' },
  };
}

// ---------- LEVEL 8: THE MINEWORKS ----------
// Under the Hanging Village. Three galleries step down through the rock on rails and an ore lift, to the forge at the bottom.
function theMineworks() {
  const W = 200, H = 56; const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const carve = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, 0); };
  const rail = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.RAIL); };
  const soft = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOFT); };
  const shelf = (x, y, n) => { for (let i = 0; i < n; i++) set(x + i, y, T.SHELF); };
  const ladder = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET); };
  block(0, W - 1, 0, H - 1);
  const interiors = [];
  const gallery = (x0, x1, y0, y1) => { carve(x0, x1, y0, y1); interiors.push([x0, x1, y0, y1, 'stone']); };

  // ---- Gallery A. The miners' camp, then the first rails, stepping down the grade to the ore lift ----
  gallery(2, 127, 10, 19); gallery(64, 127, 20, 22); gallery(88, 127, 23, 25);
  for (const x of [14, 40, 52, 68, 80, 92, 104, 116]) ent('deco', x, 19, { kind: 'timber', v: 0 });
  for (const x of [12, 30, 42, 54, 70, 88, 106, 122]) ent('deco', x, 36, { kind: 'timber', v: 1 });
  for (const x of [16, 28, 44, 58, 70, 84, 98, 114, 128, 144]) ent('deco', x, 51, { kind: 'timber', v: 0 });
  ent('npc', 7, 19, { kind: 'squire' }); ent('sign', 4, 19, { text: 'THE MINEWORKS. THE FOREMAN LOST THREE CANARIES. THE CARTS ROLL WHEN YOU RIDE THEM.' });
  ent('npc', 10, 19, { kind: 'foreman' }); ent('door', 18, 19, { kind: 'cottage', at: 18 }); ent('folk', 15, 19, { door: 18, alt: true }); ent('door', 30, 19, { kind: 'cottage', at: 30 }); ent('folk', 33, 19, { door: 30, alt: true });
  for (const x of [8, 20, 32, 46, 58, 76, 98, 114]) ent('minerlamp', x, 10);
  ent('deco', 24, 19, { kind: 'cart' }); ent('deco', 36, 19, { kind: 'barrels' });
  rail(40, 60, 20); ent('cart', 42, 19); ent('sign', 38, 19, { text: 'JUMP IN. THE CART ROLLS WITH THE GRADE AND FLIES THE BROKEN RAILS. JUMP AS IT LEAVES THE RAIL AND YOU CLEAR THE GAP TOGETHER. IT SMASHES WHAT IT HITS.' });
  rail(64, 84, 23); rail(88, 121, 26); set(100, 25, T.CRATE); set(100, 24, T.CRATE);
  ent('miner', 72, 22, { face: -1 }); ent('miner', 96, 25, { face: -1 }); ent('sprig', 54, 19, { face: -1 });
  soft(117, 117, 17, 19); carve(118, 121, 16, 19); ent('stray', 120, 19, { kind: 'canary' }); ent('miner', 119, 19, { face: -1 }); // the first canary, in a pocket a miner digs open
  ent('bat', 80, 12); ent('bat', 106, 15);
  coins([44, 17], [50, 17], [56, 17], [66, 21], [74, 21], [82, 21], [92, 24], [106, 24], [112, 24]);
  ent('check', 62, 19); ent('check', 86, 22);
  // the ore lift: the pan goes down while a cart sits on it
  carve(122, 125, 26, 36); ent('orelift', 124, 26, { to: 37 }); plat(122, 29, 2); ent('silver', 123, 28); ent('sign', 112, 25, { text: 'THE ORE LIFT. IT SINKS UNDER A LOADED CART. RIDE YOURS ONTO THE PAN.' });

  // ---- Gallery B. Back the other way: a collapsing gallery, gas seams on the rails, bats in the dark ----
  gallery(2, 127, 28, 36);
  for (const x of [6, 22, 46, 64, 82, 100, 118]) ent('minerlamp', x, 28);
  rail(60, 118, 37); ent('cart', 110, 36, { dir: -1 }); ent('gas', 96, 36, { period: 7, phase: 0 }); ent('gas', 76, 36, { period: 7, phase: 3.5 });
  ent('bat', 90, 30); ent('bat', 70, 31); ent('miner', 104, 36, { face: -1 });
  ent('check', 120, 36); ent('sign', 116, 36, { text: 'THE TIMBERS ARE ROTTEN PAST THE RAIL. RUN.' });
  shelf(36, 37, 21); gallery(36, 58, 38, 40); carve(35, 35, 38, 40); ladder(35, 35, 38, 40); ent('stray', 57, 40, { kind: 'canary' }); ent('silver', 38, 40); ent('minerlamp', 47, 38, { lit: false }); // the collapse: the floor snaps, you land in a pocket with the second canary
  rail(12, 32, 37); ent('cart', 30, 36, { dir: -1 }); ent('gas', 20, 36, { period: 6, phase: 1 }); ent('bat', 26, 30);
  coins([70, 35], [86, 35], [102, 35], [40, 35], [50, 35], [16, 35], [24, 35]);
  ent('check', 12, 36);
  // the shaft to the deep gallery
  carve(6, 9, 37, 51); ladder(7, 8, 38, 51);

  // ---- Gallery C. The deep gallery: near dark, rails to the forge, a soft plug the cart smashes ----
  gallery(2, 160, 42, 51);
  ent('minerlamp', 20, 42); for (const x of [40, 60, 80, 100]) ent('minerlamp', x, 51, { lit: false }); // the deep gallery's lamps have gone cold: strike one alight and the bats hunt it, not you
  rail(12, 118, 52); ent('cart', 14, 51); soft(108, 109, 47, 51); ent('sign', 10, 51, { text: 'DARK. THE BATS HUNT LIGHT. STRIKE A COLD LAMP ALIGHT AND THEY HUNT THAT INSTEAD.' });
  ent('bat', 30, 44); ent('bat', 50, 45); ent('bat', 75, 44); ent('miner', 40, 51, { face: -1 }); ent('miner', 86, 51, { face: -1 });
  ent('gas', 55, 51, { period: 7, phase: 2 }); ent('gas', 80, 51, { period: 7, phase: 5 });
  plat(90, 48, 3); ent('stray', 91, 47, { kind: 'canary' }); coins([22, 50], [36, 50], [48, 50], [64, 50], [72, 50], [96, 50]);
  ent('check', 112, 51);
  // ---- The Forge. THE FORGEMASTER. ----
  rail(120, 156, 52); ent('cart', 156, 51, { auto: true, dir: -1, speed: 120 });
  ent('minerlamp', 122, 51); ent('minerlamp', 142, 51); ent('hammer', 132, 51); ent('boiler', 150, 51); plat(156, 49, 2); plat(152, 46, 2); plat(148, 44, 3); ent('silver', 149, 43); // the coal chute: a climb up the forge wall to the silver
  ent('deco', 126, 51, { kind: 'barrels' }); ent('deco', 154, 51, { kind: 'cart' });
  ent('forgemaster', 140, 51);
  ent('sign', 114, 51, { text: 'THE FORGE. THE HAMMER DROPS WHEN IT GLOWS. SLAG FALLS FROM THE CHUTES. THE CARTS KEEP COMING. BURST HIS BOILER: SIX STRIKES ON THE VALVE, SIX EMBERS, OR A CART YOU RODE INTO IT. THE STEAM SCALDS HIM.' });

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 4, y: 19 }, pools: [], falls: [], moversExtra: [], interiors,
    duskStart: -1, duskLen: 1, music: 'cave', night: true, glowNight: true, dark: 0.72,
    palette: { sky: 'night', dress: 'none', hall: true, grass: '#6a6a78', grassL: '#8a8a98', grassD: '#4a4a58', dirt: '#5a5a66', dirtL: '#6e6e7a', dirtD: '#3a3a44', canopy: ['#2a2a34', '#3a3a44', '#4a4a58', '#5a5a66'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'hive' }],
    quest: { n: 3, item: 'canary', name: 'CANARY', npc: 'foreman', done: 'THE BIRDS ARE BACK', reward: 'relic', relic: 'lamp' },
    arena: { x0: 120 * TS, x1: 158 * TS, floor: 52 * TS, trigger: 124 * TS, wallL: 119, wallR: 159, boss: 'forgemaster', tint: '#ff9a5c', tintA: 0.08, fx: 'embers', slag: [126 * TS + 8, 138 * TS + 8, 148 * TS + 8] },
  };
}

// THE HIGH STORE: the same trade in a stone cellar under the crags, with the shepherd and the old knight for company.
function theShopCrag() {
  const L = painter(40, 28);
  const { block, floor, ent, set } = L;
  floor(0, 39, 20); block(0, 1, 0, 27); block(38, 39, 0, 27); block(0, 39, 0, 12);
  ent('sign', 7, 19, { text: 'THE HIGH STORE. UP AT THE COUNTER TO TRADE. UP AT THE DOOR TO LEAVE.' });
  ent('exit', 3, 19); ent('torch', 10, 19); ent('torch', 31, 19);
  ent('deco', 14, 19, { kind: 'wares', v: 1 }); ent('deco', 34, 19, { kind: 'wares', v: 0 });
  ent('deco', 23, 19, { kind: 'counter' }); ent('npc', 24, 19, { kind: 'keeper' });
  ent('deco', 29, 19, { kind: 'cart' }); ent('deco', 18, 19, { kind: 'lanternPost' }); ent('deco', 8, 19, { kind: 'bones', v: 0 });
  ent('npc', 12, 19, { kind: 'shepherd' }); ent('npc', 35, 19, { kind: 'oldknight' });
  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 4, y: 19 }, pools: [], falls: [], moversExtra: [],
    duskStart: -1, duskLen: 1, music: 'select', night: true, shop: true, interiors: [[2, 37, 13, 19, 'stone']], stone: [[0, 39, 0, 27]],
    palette: { hall: true, sky: 'night', dress: 'none', dirt: '#5a5a66', dirtL: '#6e6e7a', dirtD: '#3a3a44', grass: '#6a6a78', grassL: '#8a8a98', grassD: '#4a4a58' },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
  };
}

// THE STORE: a room you walk into. The keeper is behind the counter; UP at the counter trades, UP at the door leaves.
function theShop() {
  const L = painter(40, 28);
  const { block, floor, ent, set } = L;
  floor(0, 39, 20); block(0, 1, 0, 27); block(38, 39, 0, 27); block(0, 39, 0, 12);
  ent('sign', 7, 19, { text: 'THE STORE. UP AT THE COUNTER TO TRADE. UP AT THE DOOR TO LEAVE.' });
  ent('exit', 3, 19); ent('torch', 10, 19); ent('torch', 31, 19);
  ent('deco', 14, 19, { kind: 'wares', v: 0 }); ent('deco', 34, 19, { kind: 'wares', v: 1 });
  ent('deco', 23, 19, { kind: 'counter' }); ent('npc', 24, 19, { kind: 'keeper' });
  for (let x = 12; x <= 30; x++) ent('carpet', x, 19);
  ent('deco', 29, 19, { kind: 'barrels' }); ent('deco', 18, 19, { kind: 'lanternPost' });
  ent('npc', 12, 19, { kind: 'bard' }); ent('npc', 34, 19, { kind: 'oldknight' }); // company in the store: a bard who sings the news and an old knight who knows the price of silver
  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 4, y: 19 }, pools: [], falls: [], moversExtra: [],
    duskStart: -1, duskLen: 1, music: 'select', night: true, shop: true, interiors: [[2, 37, 13, 19]],
    palette: { hall: true, sky: 'night', dress: 'none', dirt: '#4a3020', dirtL: '#5e3f2a', dirtD: '#2c1a10', grass: '#6a5a3a', grassL: '#8a7a4a', grassD: '#3a2a1a' },
    weather: [], ambient: [],
  };
}

export const LEVELS = [
  { id: 'wood', name: 'BRACKEN WOOD', sub: 'forest and hive', build: brackenWood },
  { id: 'marsh', name: 'MARSH WOOD', sub: 'water and the frog', build: marshWood, needs: 'wood' },
  { id: 'stockade', name: 'THE STOCKADE', sub: 'the goblin camp', build: theStockade, needs: 'marsh' },
  { id: 'spore', name: 'SPOREWOOD', sub: 'the deep fungus', build: sporewood, needs: 'stockade' },
  { id: 'kings', name: 'KINGSWOOD', sub: 'the court under the leaves', build: kingswood, needs: 'spore' },
  { id: 'scree', name: 'THE SCREE PATH', sub: 'the foothills at dusk', build: screePath, needs: 'kings' },
  { id: 'hanging', name: 'THE HANGING VILLAGE', sub: 'the town on the cliff', build: hangingVillage, needs: 'scree' },
  { id: 'mineworks', name: 'THE MINEWORKS', sub: 'under the mountain', build: theMineworks, needs: 'hanging' },
  { id: 'shop', name: 'THE STORE', sub: 'ask the keeper', build: theShop, hidden: true },
  { id: 'shopCrag', name: 'THE HIGH STORE', sub: 'ask the keeper', build: theShopCrag, hidden: true },
];
