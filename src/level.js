import { floodReach } from './reachcore.js';
// level.js — the level registry. Each level paints a tile grid with a tiny DSL and returns it.
export const TS = 16;
export const T = { AIR: 0, SOLID: 1, ONEWAY: 2, SPIKE: 3, CRATE: 4, REED: 5, PALISADE: 7, PLANK: 8, NET: 9, BOUNCER: 10, SHELF: 11, PORT: 12, CLIMB: 13, RAIL: 14, SOFT: 15, ICE: 16, WEB: 17, CRYST: 18 };

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
  if (R.fog) R.fog = R.fog.map(z => ({ ...z, x0: shp(z.x0), x1: shpEnd(z.x1) }));
  if (R.slide) R.slide = { ...R.slide, x0: shp(R.slide.x0), x1: shpEnd(R.slide.x1) };
  if (R.ropes) R.ropes = R.ropes.map(r => ({ ...r, x0: shp(r.x0), x1: shp(r.x1), posts: (r.posts || []).map(p => [shp(p[0]), p[1], p[2]]) }));
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
  plat(119, 20, 3); plat(123, 18, 3); plat(127, 16, 3); plat(123, 14, 3); plat(127, 12, 3); plat(124, 10, 2); plat(127, 8, 2); ent('silver', 128, 7); coins([125, 9]); // the silver sits above the canopy: up is worth looking
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
  ent('sign', 357, 17, { text: 'THE KING\'S COURT. HE DRAWS BREATH BEFORE HE PULLS: HOLD YOUR SHIELD UP. HIS TONGUE COMES STRAIGHT. HIS LEAP DOES NOT. WHEN HE CROAKS THE POND RISES: GET TO THE REEDS OR THE DAIS.' });
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
  water(113, 128, 18, true); pools[pools.length - 1].tide = true;
  ent('sign', 112, 17, { text: 'SHALLOWS ARE SLOW AND TIRING, AND THE HOPPERS ARE NOT. KEEP TO THE PLANKS WHERE YOU CAN. JUMP OUT OF WATER EARLY.' });
  ent('hopper', 118, 18, { face: -1 }); ent('hopper', 125, 18, { face: 1, color: 'yellow' });
  coins([115, 15], [121, 15], [127, 15]);
  reeds(120, 14, 2); reeds(124, 11, 2); coins([124, 9], [125, 9], [121, 12]); ent('relic', 125, 10, { kind: 'charm' }); // the reed cache

  // ---- 6. Drift stream: logs ride the current, against you ----
  water(131, 160, 19);
  ent('wisp', 138, 15); ent('wisp', 152, 14); ent('sign', 130, 17, { text: 'THE FOG. IT HIDES THE LOGS. THE WISPS IN IT ARE LIGHT: CUT ONE AND THE FOG THINS.' });
  for (let i = 0; i < 6; i++) movers.push({ kind: 'drift', x0: 131 * TS, x1: 161 * TS - 48, x: 132 * TS + i * 78, y: 18 * TS + 8, w: 48, h: 8, speed: 26 });
  coins([138, 16], [147, 16], [156, 16]);
  block(161, 175, 18, 27);
  ent('check', 168, 17); crate(173, 17);

  // ---- 7. The long river: a big raft, frogs leaping aboard, archers overhead ----
  water(176, 259, 19);
  movers.push({ kind: 'punt', x0: 176 * TS, x1: 259 * TS - 96, x: 176 * TS, y: 18 * TS + 8, w: 96, h: 8, speed: 70, frogs: true, frogMax: 3, frogEvery: 2.4 }); // THE PUNT: it goes where you pole it, and the frogs come aboard
  ent('sign', 174, 17, { text: 'THE PUNT. STAND ON IT AND WALK: IT GOES WHERE YOU PUSH. THE FROGS COME ABOARD. THE SPITTERS IN THE REEDS DO NOT MISS A STANDING MAN.' });
  reeds(212, 16, 2); ent('spit', 212, 15, { face: -1 }); reeds(244, 16, 2); ent('spit', 244, 15, { face: -1 }); reeds(226, 15, 2); coins([226, 14]);
  plat(200, 12, 4); plat(236, 12, 4);
  ent('check', 202, 11); ent('silver', 238, 11);
  ent('wasp', 190, 15); ent('wasp', 218, 15); ent('wasp', 248, 15);
  coins([185, 15], [191, 13], [212, 15], [219, 13], [232, 15], [249, 13]);
  block(260, 274, 18, 27);
  ent('check', 264, 17); crate(270, 17); ent('hopper', 268, 17, { face: -1, color: 'blue' });

  // ---- 8. The flooded grove: a dip full of hoppers, then the slow raft under the archers ----
  block(275, 296, 18, 27);
  for (let x = 280; x <= 292; x++) L.set(x, 18, 0); water(280, 292, 18, true); pools[pools.length - 1].tide = true;
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
    fog: [{ x0: 131 * TS, x1: 161 * TS, alpha: 0.86 }],
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
  G.R.fog = (G.R.fog || []).concat([{ x0: 278 * TS, x1: 322 * TS, alpha: 0.86 }]); G.ent('wisp', 291, 12); G.ent('wisp', 306, 13); G.ent('wisp', 318, 12); // the village drowns in fog too; three wisps light it
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
  ent('sign', 324, 19, { text: 'THE CHIEFTAIN. RED AND A STAMP: THE CLUB. BLUE AND A GLINT: SWORD AND SHIELD. GREEN: THE BOW. HE SWAPS AT THE RACKS BY THE WALLS: BREAK A RACK AND THAT WEAPON IS GONE. THE DAIS IS OUT OF REACH OF CLUB AND SWORD. NOT OF ARROWS. NOT OF THE LEAP.' }); ent('sign', 9, 19, { text: 'TAM WENT AHEAD TO COUNT GOBLINS. THE TRACKS STOP AT THE GATE. A CAGE HANGS SOMEWHERE PAST THE YARD.' });
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
  ent('sign', 133, 19, { text: 'THE YARD. FREE THE FOX AND IT FIGHTS FOR YOU. TIP THE BRAZIER INTO THE HAY. ROLL THE BARREL DOWN THE RAMP. FIRE EATS THE STAKE WALLS: A TIPPED BRAZIER BY A WALL IS A DOOR. EVERYTHING HERE IS A WEAPON.' });
  ent('hound', 136, 19, { face: -1 }); ent('cage', 139, 19, { kind: 'fox' });
  ent('sprig', 144, 19, { face: -1 }); ent('brazier', 150, 19); ent('sprig', 153, 19, { face: 1 }); ent('hound', 157, 19, { face: -1 }); ent('sprig', 159, 19, { face: -1 });
  ent('barrel', 162, 19); ent('shield', 165, 19, { face: -1 }); ent('crank', 167, 19, { wall: 170 }); ent('brazier', 169, 19); // tip it into the stakes and the wall burns
  pal(170, 15, 19);
  ent('brute', 175, 19, { face: -1 }); ent('sapper', 179, 19, { face: -1 }); ent('archer', 182, 19, { face: -1 });
  ent('torch', 130, 19); ent('torch', 147, 19); ent('torch', 173, 19); ent('torch', 181, 19);
  coins([141, 17], [155, 17], [164, 17], [177, 18]);
  ent('check', 184, 19);

  // ---- 5b. The kennels and the armoury: hounds in the yard, an archer on the shed, barrels by the inner gate ----
  floor(186, 249, 20);
  for (let x = 187; x <= 200; x++) set(x, 20, T.RAIL); ent('cart', 188, 19); ent('pike', 195, 19, { face: -1 }); ent('pike', 198, 19, { face: -1 }); ent('sign', 186, 19, { text: 'A LOOT CART ON THE RAIL. CUT IT AND IT ROLLS. THE PIKES HOLD THE LINE. NOT AGAINST A CART.' });
  ent('torch', 188, 19); ent('hound', 193, 19, { face: -1 }); ent('cage', 199, 19, { kind: 'bird' });
  block(203, 205, 15, 19); plat(202, 14, 5); ent('towertop', 204, 14); ent('archer', 204, 13, { face: -1, horn: true }); plat(199, 17, 2); plat(207, 17, 2); coins([203, 13], [207, 16]); // the third horn tower: silence it or the kennels empty onto you
  ent('sapper', 211, 19, { face: -1 }); ent('torch', 214, 19); ent('brute', 217, 19, { face: -1 }); ent('check', 215, 19);
  ent('treehouse', 221, 6);
  ent('barrel', 223, 19); ent('barrel', 226, 19); ent('crank', 229, 19, { wall: 232 }); ent('shield', 231, 19, { face: -1 }); ent('brazier', 228, 19);
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
  ent('rack', 331, 19, { kind: 'club' }); ent('rack', 358, 19, { kind: 'bow' }); block(336, 339, 18, 19); coins([337, 17]); // the racks he swaps at, and a stone dais his club and sword cannot reach
  ent('deco', 331, 19, { kind: 'banner', v: 0 }); ent('deco', 358, 19, { kind: 'banner', v: 1 }); ent('deco', 344, 19, { kind: 'boneThrone' });
  ent('deco', 334, 19, { kind: 'skullPile', v: 0 }); ent('deco', 351, 19, { kind: 'skullPile', v: 1 });
  ent('deco', 344, 6, { kind: 'bough', hang: true }); ent('deco', 338, 8, { kind: 'hangCage', hang: true }); ent('deco', 349, 8, { kind: 'hangCage', hang: true });
  ent('chief', 343, 19);

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: movers,
    duskStart: undefined, music: 'stockade', night: true,
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
    duskStart: -1, duskLen: 1, music: 'cave', night: false, glowNight: true,
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
  ent('sign', 313, 13, { text: 'KING GORM. WHILE THE CROWN SHIMMERS HE TURNS EVERY BLADE. CLIMB THE SCAFFOLD AND TREAD A PLATE WHEN HE PASSES UNDER ITS CAGE: IT HOLDS HIM, AND FOR A WHILE AFTER HIS HEAD IS UP AND HE BLEEDS LIKE ANY MAN. A CAGE THAT MISSES HIM WAS NOT EMPTY. HE THROWS WHAT HE CAN REACH WHILE YOU CLIMB, AND THE LITTER CHARGES: JUMP IT OR CLIMB. THE PITS BURN. WHEN HE RAGES HE CALLS THE COURT DOWN ON YOU.' });
  ent('door', 12, 19, { at: 12 }); ent('folk', 9, 19, { door: 12 }); ent('folk', 17, 19, { door: 12, alt: true }); ent('deco', 20, 19, { kind: 'well' });
  ent('sprig', 22, 19, { face: -1 }); coins([8, 18], [15, 17], [26, 18]); ent('npc', 26, 19, { kind: 'cook' });
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
  ent('bell', 80, 19, { gate: 84 }); ent('sprig', 76, 19, { face: 1, ringer: true, bell: 80 }); ent('stray', 72, 19, { kind: 'cup' });
  gate(84, 15, 19);
  coins([52, 18], [58, 17], [65, 18], [74, 17]);
  // the way around the gate if the bell rings: a two-wide hatch through the roof with ledges up it, onto the high road
  for (let x = 77; x <= 78; x++) for (let y = 13; y <= 16; y++) set(x, y, 0);
  plat(77, 18, 2); plat(77, 16, 2); plat(77, 14, 2); plat(76, 12, 4); ent('silver', 79, 11);
  // THE ROOF ROAD: the hall's fire vents through the roof (jump the puffs), thieves work the ridge, wasps nest in the eaves, an archer watches the ridge
  ent('firevent', 52, 12, { every: 2.6 }); ent('firevent', 63, 12, { every: 3.3 }); ent('firevent', 72, 12, { every: 2.9 });
  ent('thief', 56, 12, { face: -1 }); ent('thief', 69, 12, { face: 1 }); ent('wasp', 60, 9); ent('wasp', 74, 9); ent('archer', 66, 12, { face: -1 });
  plat(58, 9, 3); plat(64, 8, 3); coins([48, 11], [55, 11], [59, 8], [65, 7], [70, 11], [75, 11]);
  ent('sign', 46, 12, { text: 'THE ROOF ROAD. THE HALL BREATHES FIRE THROUGH ITS VENTS. JUMP THE PUFFS. THE THIEVES UP HERE HAVE NOWHERE TO RUN.' });
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
  ent('pike', 142, 21, { face: -1 }); ent('stray', 134, 21, { kind: 'cup' }); coins([93, 20], [114, 20], [126, 19], [138, 20], [147, 20]);
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
  ent('stray', 250, 20, { kind: 'cup' }); coins([218, 19], [236, 19], [252, 18], [266, 19], [273, 19]);
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
  ent('firepit', 335, 12); ent('firepit', 351, 12); // two fire pits in the carpet: the King walks through them, you jump them
  // the galleries: the court cheers from balconies at either end and throws goblets when the King shouts
  plat(318, 9, 6); plat(366, 9, 5); ent('torch', 318, 8); ent('torch', 369, 8);
  for (const x of [319, 321, 323, 367, 369]) ent('folk', x, 8, { court: true, alt: x % 4 === 1 });
  ent('deco', 320, 9, { kind: 'banner', v: 1 }); ent('deco', 368, 9, { kind: 'banner', v: 0 });
  // THE SCAFFOLD: three tiers of ledges up to the winch decks. Every step is two or three tiles up and at most two across.
  for (const x of [325, 338, 351, 360]) plat(x, 11, 3);
  for (const x of [330, 342, 356]) plat(x, 8, 3);
  for (const x of [325, 334, 343, 352, 361]) plat(x, 5, 6);
  // five cages hang under the decks; the plate on each deck drops its cage. On the King's head it holds him: that is the only time he bleeds.
  for (const x of [328, 337, 346, 355, 364]) { ent('dropcage', x, 7, { boss: true }); ent('plate', x, 4, { cage: x }); }
  coins([326, 10], [339, 10], [352, 10], [331, 7], [343, 7], [357, 7], [327, 4], [336, 4], [345, 4], [354, 4], [363, 4]);
  ent('king', 344, 13);

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: movers,
    duskStart: -1, duskLen: 1, music: 'theme3', night: false, glowNight: true,
    interiors: [[45, 84, 17, 19], [85, 150, 17, 21], [211, 275, 16, 20]], // hollowed trunks and burrows: a dark planked backdrop behind the play layer
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(200,120,80,0.16)', grass: '#8a7a2a', grassL: '#c9a83a', grassD: '#5a4a1a', dirt: '#4a3020', dirtL: '#5e3f2a', dirtD: '#2c1a10', canopy: ['#7a2a1a', '#a83a2a', '#c9463d', '#e07060'], hall: true },
    weather: [{ x0: 0, x1: 99999, kind: 'leaves' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'forest' }],
    quest: { n: 3, item: 'cup', name: 'GOLD CUP', npc: 'cook', done: 'THE CUPS ARE OFF HIS TABLE', thanks: "THE SCULLION'S THANKS" },
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
  G.coins([293, 13], [301, 12], [309, 13], [317, 12], [300, 16], [314, 16], [321, 16]);
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
  ent('npc', 13, 19, { kind: 'shepherd' }); ent('dog', 16, 19); // the shepherd's dog walks with you and barks when a ewe is near
  ent('sign', 4, 19, { text: 'THE SCREE PATH. THE HILL TAKES THE CARELESS.' }); ent('npc', 9, 19, { kind: 'squire' });
  wall(18, 19); wall(30, 19); wall(44, 19); ent('deco', 26, 19, { kind: 'fence', v: 0 }); ent('deco', 40, 19, { kind: 'fence', v: 1 });
  ent('goat', 36, 19, { face: -1 }); ent('harpy', 50, 14);
  coins([12, 17], [24, 18], [40, 18], [48, 17]);
  ent('sign', 22, 19, { text: 'THREE EWES STRAYED UP THE HILL WHEN THE RAMS CAME DOWN. THE SHEPHERD WANTS THEM BACK. WALK INTO ONE AND IT FOLLOWS. THE DOG BARKS WHEN ONE IS NEAR. THE FLEECE IS THE REWARD.' });
  ent('check', 58, 19);

  // ---- 2. The terraces: three steps up the hill, a rockfall, the first stray ----
  block(61, 80, 18, 27); block(81, 100, 16, 27); block(101, 120, 14, 27);
  wall(62, 17); wall(82, 15); wall(102, 13);
  plat(70, 14, 3); plat(66, 16, 2); ent('stray', 71, 13); coins([70, 13], [72, 13]);
  ent('goat', 72, 17, { face: -1 }); ent('shield', 78, 17, { face: -1 }); ent('rockfall', 90, 4, { every: 2.4 }); ent('rockfall', 94, 4, { every: 3.1 });
  ent('deco', 84, 15, { kind: 'stone' }); ent('deco', 106, 13, { kind: 'stone' }); ent('deco', 112, 13, { kind: 'cairn' });
  ent('troll', 92, 15, { face: -1 }); ent('harpy', 110, 8);
  plat(86, 12, 3); plat(91, 10, 3); plat(97, 12, 2); coins([87, 11], [92, 9], [98, 11]); // the crest ledges over the second terrace: a coin run above the rockfall
  coins([66, 17], [76, 17], [86, 15], [98, 15], [104, 13], [116, 13]);
  ent('check', 118, 13);

  // ---- 3. The windmill rise: the sails lift you to the loft and the high path ----
  block(121, 176, 14, 27);
  ent('deco', 150, 13, { kind: 'mill' });
  for (let i = 0; i < 4; i++) movers.push({ kind: 'wheel', px: 150 * TS + 8, py: 13 * TS - 58, r: 42, phase: i * Math.PI / 2, period: 7, x: 0, y: 0, w: 22, h: 6 });
  plat(156, 6, 4); ent('stray', 158, 5); coins([157, 5], [159, 5]);
  plat(162, 8, 3); plat(167, 9, 3); plat(172, 10, 3); ent('archer', 168, 8, { face: -1 }); ent('harpy', 162, 3);
  coins([163, 7], [168, 7], [173, 9]);
  wall(128, 13); wall(140, 13); ent('goat', 134, 13, { face: -1 }); ent('thorn', 138, 13, { face: -1 }); ent('sprig', 160, 13, { face: -1 });
  ent('sign', 124, 13, { text: 'THE WINDMILL. RIDE THE SAILS UP. FROM THE LOFT THE RIDGE ROAD RUNS HIGH AND WINDY, HARPIES ALL THE WAY, THE MILLER\'S SILVER AT ITS END. OR KEEP LOW THROUGH THE GULLY WITH THE TROLLS.' });
  ent('deco', 138, 13, { kind: 'cairn' });
  coins([131, 12], [146, 12], [164, 12], [170, 12]);
  ent('check', 174, 13);

  // ---- 4. The scree slope: the loose stone carries you down, rocks come off the cliff, harpies dive ----
  const steps = [[177, 190, 14], [191, 200, 15], [201, 212, 16], [213, 224, 17], [225, 238, 18], [239, 250, 19]];
  for (const [x0, x1, y] of steps) { block(x0, x1, y, 27); if (x0 > 177) scree.push({ x0, x1, y, dir: 1 }); }
  ent('sign', 180, 13, { text: 'SCREE. IT SLIDES UNDER YOU AND CARRIES YOU DOWN. BRACE WITH BLOCK, OR BOUNCE ACROSS IT. THE TROLL THROWS ROCKS FROM ABOVE. WHEN THE HILL COMES DOWN, RUN. DO NOT STOP.' });
  ent('rockfall', 205, 5, { every: 2.6 }); ent('rockfall', 220, 5, { every: 2.2 }); ent('rockfall', 232, 5, { every: 2.9 });
  ent('harpy', 200, 9); ent('harpy', 235, 11);
  plat(246, 16, 3); ent('stray', 247, 15); coins([246, 15], [248, 15]);
  plat(195, 13, 2); plat(200, 14, 2); plat(206, 15, 2); plat(212, 16, 2); plat(218, 16, 3); coins([195, 12], [206, 14], [219, 15]); // stepping ledges down the scree: a dry route for those who would rather hop than slide
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
  ent('sign', 278, 19, { text: 'THE CRAG WALL. THE OCHRE ROCK WITH THE CUT HANDHOLDS IS THE KIND YOU CAN CLIMB: HOLD INTO IT TO CLING, JUMP TO KICK UP AND AWAY, THEN BACK IN. THE HARPIES NEST IN THE CRACKS.' });
  ent('rockfall', 281, 2, { every: 2.7 });
  coins([278, 16], [282, 15], [282, 12]);
  ent('sprig', 290, 8, { face: -1 }); ent('deco', 288, 8, { kind: 'stone' });
  ent('check', 294, 8);

  // ---- 5b. THE GULLY: the last of the open hill before the fold. ----
  ent('deco', 299, 8, { kind: 'cairn' }); ent('deco', 306, 8, { kind: 'stone', v: 1 });
  ent('harpy', 302, 2); ent('goat', 304, 8, { face: -1 });
  coins([300, 7], [305, 7]);

  // ---- 6. THE FOLD: the Ram Lord's walled pasture on the plateau ----
  ent('sign', 296, 8, { text: 'THE RAM LORD. HIS HIDE TURNS STEEL. A GREEN RING UNDER HIM MEANS HE IS DAZED: WHEN HE HITS THE WALL, AND FOR A BREATH WHEN HE LANDS FROM A LEAP. CUT HIM THEN. HE FEINTS: THE FIRST CHARGE MAY STOP SHORT. HE LEAPS: WATCH THE SHADOW. HE TOSSES.' });
  ent('deco', 313, 8, { kind: 'foldGate' }); ent('deco', 327, 8, { kind: 'foldGate' });
  ent('deco', 313, 8, { kind: 'cairn' }); ent('deco', 327, 8, { kind: 'cairn' });
  ent('deco', 320, 8, { kind: 'bothy' }); ent('deco', 315, 8, { kind: 'fence', v: 0 }); ent('deco', 324, 8, { kind: 'fence', v: 1 }); ent('deco', 318, 8, { kind: 'cart' }); // the fold: a shepherd's hut, hurdles, a cart. Walls to run him into and nothing to hide on
  ent('ramlord', 322, 8);

  const ret = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: movers,
    duskStart: -1, duskLen: 1, music: 'theme4', night: false, glowNight: false,
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(140,90,150,0.14)', grass: '#8a8a3a', grassL: '#c9b84a', grassD: '#5a5a2a', dirt: '#5a5a66', dirtL: '#6e6e7a', dirtD: '#3a3a44', canopy: ['#4a4458', '#5e5870', '#6a4a7a', '#a07ab8'] },
    stone, scree, strays: 3, slide: { x0: 184 * TS, x1: 252 * TS, speed: 118 },
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 312 * TS, x1: 328 * TS, floor: 9 * TS, trigger: 315 * TS, wallL: 311, wallR: 329, boss: 'ram', tint: '#6a4a7a', tintA: 0.12, fx: 'dust' },
  }
  // ---- 4b. THE ROPEWAY: the gorge proper. A swing, a rope lift, the old mill's sails, another swing; harpies on the wind, rocks off the cliff, a ladder out of the bottom. ----
  const GA = grow(L, ret, 256, 56);
  GA.block(256, 257, 19, 27); GA.block(258, 304, 26, 27); GA.block(305, 311, 19, 27);
  GA.ent('sign', 256, 18, { text: 'THE ROPEWAY. STONE STEPS TO THE LIFT: RIDE IT WHILE YOU STAND ON IT. THEN THE SAILS OF THE HIGH MILL, AND THE SWING ON THE CABLE. NOTHING UP HERE STAYS STILL.' });
  GA.plat(260, 17, 3); GA.plat(264, 16, 2); GA.plat(268, 16, 3); // stone steps off the cliff top: two up, never more than two across
  GA.R.ropes = [{ x0: 279 * TS + 8, y0: 6 * TS + 4, x1: 305 * TS + 8, y1: 6 * TS + 4, posts: [[279 * TS + 8, 6 * TS + 4, 19 * TS], [305 * TS + 8, 6 * TS + 4, 19 * TS]] }]; // the ropeway cable the swing hangs from
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
  G.ent('goat', 203, 13, { face: -1 }); G.ent('goat', 206, 13, { face: 1 }); G.ent('sprig', 184, 13, { face: -1 }); G.ent('troll', 209, 13, { face: -1 });
  G.plat(202, 11, 2); G.plat(205, 9, 3); G.coins([206, 8]); // a perch over the goat pen
  // THE RIDGE ROAD: from the loft, a high line of ledges over the cairn field and the whole scree slope, harpies all the way, the miller's silver at the end
  for (const [x, y, n] of [[161, 5, 2], [165, 4, 3], [170, 3, 3], [176, 4, 3], [182, 3, 3], [188, 4, 3], [194, 3, 4], [200, 4, 3], [206, 3, 3], [212, 4, 3], [218, 5, 3], [224, 6, 3], [230, 7, 3], [236, 8, 3], [242, 9, 3], [248, 10, 3], [254, 11, 3], [260, 12, 3], [266, 13, 3], [272, 14, 3], [278, 15, 3], [284, 16, 3]]) G.plat(x, y, n);
  G.ent('harpy', 186, 1); G.ent('harpy', 214, 1); G.ent('harpy', 246, 6); G.ent('harpy', 270, 10); G.ent('silver', 285, 15);
  G.coins([166, 3], [177, 3], [195, 2], [207, 2], [219, 4], [237, 7], [255, 10], [267, 12], [279, 14]);
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
  const W = 110, H = 132; const L = painter(W, H); // rows 112-131 are under the roots: the Weaver's hollow
  const { block, plat, ent, coins, set } = L;
  const movers = [], gusts = [], interiors = [];
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
  // ---- THE WEB HOLLOW: under the roots. Everything down here is webbed, and something made it. ----
  ent('doorway', 66, 107, { id: 'hollow-out', to: 'hollow-in', kind: 'goblin' });
  ent('sign', 62, 107, { text: 'SOMETHING WENT DOWN THROUGH THE ROOTS AND DID NOT COME BACK. THE HOLE IS FULL OF WEB.' });
  for (let y = 116; y <= 128; y++) for (let x = 20; x <= 74; x++) set(x, y, 0);
  interiors.push([20, 74, 116, 128, 'earth']);
  ent('doorway', 24, 128, { id: 'hollow-in', to: 'hollow-out', lock: [20, 74], label: 'THE WEB HOLLOW' });
  for (const x of [28, 36, 44, 52, 60, 68]) { ent('deco', x, 116, { kind: 'cobweb', v: x % 3, hang: true }); }
  for (const x of [32, 48, 64]) ent('deco', x, 128, { kind: 'cobweb', v: (x + 1) % 3 });
  ent('torch', 26, 128); ent('spider', 34, 118, { drop: 90 }); ent('spider', 58, 118, { drop: 90 });
  ent('spider', 46, 116, { drop: 110 });
  ent('sign', 22, 128, { text: 'THE WEAVER. SHE RUNS HER THREAD TO GET OVER YOU AND COMES DOWN. SHE IS ONLY WORTH HITTING WHILE SHE IS ON THE FLOOR. SHE SPITS WEB FROM UP THERE: DO NOT BE UNDER IT.' });
  ent('spider', 48, 118, { drop: 170, big: true, mini: true });
  for (let y = 122; y <= 128; y++) set(75, y, T.PORT); // her larder, shut until she is dead
  for (let y = 122; y <= 128; y++) for (let x = 76; x <= 84; x++) set(x, y, 0);
  interiors.push([76, 84, 122, 128, 'earth']);
  ent('silver', 82, 128); ent('stray', 79, 128, { kind: 'lamp' }); coins([78, 127], [80, 127], [83, 127]);
  // 0 -> 1: a rope ladder through the first bough
  band(1, W - 2, tops.t1); hole(100, 105, tops.t1); ladder(102, 103, tops.t1, tops.t0 - 1); // the first ladder stands in the open: nothing between the roots road and its foot
  ent('sign', 93, 107, { text: 'ROPE LADDERS: JUMP UP THROUGH THEM, DROP DOWN WITH DOWN+JUMP. THE VILLAGE IS SEVEN TIERS TALL. THE CROWN IS THE EIGHTH.' });

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
  ent('check', 8, 93);
  // 1 -> 2: a counterweight lift at the trunk
  band(1, W - 2, tops.t2); hole(2, 7, tops.t2);
  movers.push({ kind: 'lift', x: 3 * TS, y: (tops.t1 - 1) * TS, y0: (tops.t1 - 1) * TS, y1: (tops.t2 - 1) * TS, w: 32, h: 8, speed: 34 });
  ent('sign', 8, 93, { text: 'THE LIFT RISES WHILE YOU STAND ON IT AND SINKS WHEN YOU STEP OFF. THE WINCH IS GOBLIN WORK. IT HOLDS.' });

  // ---- Tier 2. THE MARKET (walk right): hill folk and goblins live door to door; the Lamplighter wants three lanterns lit ----
  ent('sign', 8, 79, { text: 'THE MARKET. THE LAMPLIGHTER HAS LOST THREE LAMPS TO THE SQUIRREL KNIGHTS. THE REEVE HATES A LIT LANTERN, SO THE GOBLINS SEND SNUFFERS UP THE BOUGHS TO PUT THE TOWN OUT. STRIKE A DARK LANTERN TWICE TO LIGHT IT. CUT THE SNUFFER AND IT STAYS LIT.' });
  ent('door', 14, 79, { kind: 'cottage', at: 14 }); ent('folk', 11, 79, { door: 14, alt: true }); ent('npc', 22, 79, { kind: 'lamplighter' }); ent('deco', 26, 79, { kind: 'lanternPost' }); ent('lantern', 26, 79); ent('lantern', 56, 79); ent('lantern', 80, 79);
  ent('door', 32, 79, { kind: 'cottage', at: 32 }); ent('folk', 35, 79, { door: 32, alt: true }); ent('deco', 40, 79, { kind: 'well' });
  ent('door', 50, 79, { at: 50 }); ent('folk', 47, 79, { door: 50 }); ent('deco', 56, 79, { kind: 'fence', v: 0 }); ent('door', 64, 79, { at: 64 }); ent('folk', 67, 79, { door: 64 });
  ent('squirrel', 74, 79, { face: -1 }); ent('snuffer', 62, 79, { face: -1 }); ent('shield', 92, 79, { face: -1 });
  plat(58, 76, 3); plat(78, 75, 3); coins([59, 75], [79, 74], [18, 77], [38, 77], [70, 77], [88, 77], [96, 77]);
  movers.push({ kind: 'swing', px: 44 * TS, py: 70 * TS, arm: 70, x: 0, y: 0, w: 32, h: 8, period: 3.0, phase: 0 }); plat(40, 73, 2); plat(48, 72, 2); ent('spit', 49, 71, { face: -1 }); coins([44, 71]); // a rope swing over the well to a spitter's ledge
  ent('check', 96, 79);
  ent('sign', 70, 79, { text: 'THE SNUFFERS PUT OUT WHAT YOU LIGHT. CUT THEM FIRST, THEN RELIGHT THE POST.' });
  // 2 -> 3: the wheel walk: two water wheels stacked at the trunk lift you to the third bough
  band(1, W - 2, tops.t3); hole(100, 107, tops.t3);
  for (let i = 0; i < 4; i++) { movers.push({ kind: 'wheel', px: 104 * TS + 8, py: 75 * TS, r: 42, phase: i * Math.PI / 2, period: 7, x: 0, y: 0, w: 22, h: 6 }); movers.push({ kind: 'wheel', px: 104 * TS + 8, py: 68 * TS, r: 42, phase: i * Math.PI / 2 + 0.8, period: 6.4, x: 0, y: 0, w: 22, h: 6 }); }
  ent('deco', 104, 74, { kind: 'axle', hang: true }); ent('deco', 104, 67, { kind: 'axle', hang: true }); // hubs on beams into the trunk wall
  ent('sign', 93, 79, { text: 'THE WATER WHEELS. RIDE THE PADDLES UP. TWO OF THEM, STACKED. JUMP FROM THE TOP OF THE FIRST TO THE BOTTOM OF THE SECOND.' });

  // ---- Tier 3. THE WINDY BOUGH (walk left): gusts push you along the bough; spiders, a sapper, a goblin house on stilts ----
  ent('sign', 93, 65, { text: 'THE WIND COMES IN GUSTS OFF THE CRAG. WAIT FOR THE LULL, OR LEAN INTO IT AND LET IT CARRY YOU. THE FLAGS SHOW WHICH WAY.' });
  gusts.push({ x0: 20 * TS, x1: 92 * TS, y0: 56 * TS, y1: 66 * TS, dir: -1, period: 5, on: 1.6, phase: 0 });
  gusts.push({ x0: 20 * TS, x1: 90 * TS, y0: 12 * TS, y1: 20 * TS, dir: 1, period: 9, on: 2.2, phase: 3, alt: true, arena: true }); // the crown's crosswind, only while the Reeve fights
  hole(36, 40, tops.t3); ent('mover', 36, tops.t3, { len: 2, range: 3, speed: 36 }); hole(70, 74, tops.t3); ent('mover', 70, tops.t3, { len: 2, range: 3, speed: 36 }); // gaps in the bough with sliding boughs across them: the wind wants you off
  pit(52, 53, tops.t3); pit(30, 31, tops.t3); // pits the wind wants to push you into
  ent('spider', 80, 58, { drop: 100 }); ent('spider', 48, 58, { drop: 100 }); ent('snuffer', 34, 65, { face: 1 }); ent('sprig', 26, 65, { face: 1 }); ent('wasp', 56, 60);
  plat(70, 62, 3); plat(40, 61, 3); coins([71, 61], [41, 60], [86, 63], [56, 63], [26, 63]);
  ent('door', 88, 65, { at: 88 }); ent('folk', 91, 65, { door: 88 }); ent('deco', 14, 65, { kind: 'lanternPost' }); ent('lantern', 14, 65); ent('lantern', 64, 65);
  ent('check', 20, 65); ent('stray', 71, 61, { kind: 'lamp' });
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
  movers.push({ kind: 'lift', x: 62 * TS, y: (tops.t4 - 1) * TS, y0: (tops.t4 - 1) * TS, y1: 44 * TS, w: 32, h: 8, speed: 30 }); plat(66, 44, 3); coins([67, 43]); ent('relic', 68, 43, { kind: 'spurs' }); // a basket lift to a nest of coins
  ent('door', 84, 51, { at: 84 }); ent('folk', 87, 51, { door: 84 }); ent('thorn', 94, 51, { face: -1 });
  coins([26, 49], [38, 49], [50, 49], [60, 46], [80, 47], [98, 49]);
  ent('check', 12, 51);
  // 4 -> 5: swings, a ledge and a rope ladder at the trunk
  band(1, W - 2, tops.t5); hole(100, 105, tops.t5);
  movers.push({ kind: 'swing', px: 96 * TS, py: 46 * TS, arm: 80, x: 0, y: 0, w: 48, h: 8, period: 3.2, phase: 0 });
  movers.push({ kind: 'swing', px: 104 * TS, py: 42 * TS, arm: 80, x: 0, y: 0, w: 48, h: 8, period: 3.4, phase: 1.5 });
  plat(102, 44, 3); ladder(103, 104, tops.t5, 43); for (let y = 44; y <= 51; y++) set(99, y, T.CLIMB); // and a short ochre rock face for those who would rather kick up it
  ent('sign', 92, 51, { text: 'THE LAST CLIMB. SWING, THEN SWING AGAIN, THEN THE ROPE. OR HOLD INTO THE OCHRE ROCK TO CLING AND JUMP TO KICK UP IT. THE WIND IS WORSE UP HERE.' });

  // ---- Tier 5. THE LANTERN STAIR (walk left): the last lamp, a brute at the door, the way to the crown ----
  ent('sign', 93, 37, { text: 'THE LANTERN STAIR. THE REEVE DOES NOT LIKE LIGHT: LIGHT EVERY LANTERN YOU PASS, AND KILL WHAT COMES TO PUT THEM OUT.' });
  ent('door', 88, 37, { kind: 'cottage', at: 88 }); ent('folk', 91, 37, { door: 88, alt: true }); ent('deco', 84, 37, { kind: 'lanternPost' });
  ent('spider', 70, 30, { drop: 100 }); ent('brute', 50, 37, { face: 1 }); ent('door', 60, 37, { kind: 'cottage', at: 60 }); ent('folk', 63, 37, { door: 60, alt: true });
  ent('spider', 40, 30, { drop: 100 }); ent('snuffer', 54, 37, { face: -1 }); ent('snuffer', 24, 37, { face: 1 }); ent('stray', 30, 37, { kind: 'lamp' }); ent('deco', 48, 37, { kind: 'lanternPost' }); ent('deco', 20, 37, { kind: 'lanternPost' }); ent('lantern', 20, 37); ent('lantern', 48, 37); ent('lantern', 84, 37);
  plat(76, 34, 3); plat(26, 33, 3); ent('silver', 28, 32); coins([77, 33], [27, 32], [66, 35], [44, 35], [12, 35]);
  pit(42, 43, tops.t5); pit(72, 73, tops.t5);
  hole(52, 57, tops.t5); shelf(52, tops.t5, 6); hole(14, 18, tops.t5); ent('mover', 14, tops.t5, { len: 2, range: 3, speed: 40 }); ent('wasp', 55, 33); ent('thorn', 36, 37, { face: 1 }); // snapping branch and a sliding bough on the way to the crown
  ent('check', 10, 37);
  // 5 -> crown: the long rope
  band(1, W - 2, tops.crown); hole(2, 5, tops.crown); ladder(3, 4, tops.crown, tops.t5 - 1);

  // ---- The crown: THE OWL REEVE. Three perches on the high branches with a dark lantern on each; ledges climb to every one. ----
  ent('sign', 8, 19, { text: 'THE OWL REEVE. IT SITS ON THE HIGH BRANCHES. CLIMB TO IT AND CUT: TWO CUTS AND IT FLUSHES. LIGHT THE LANTERN ON A PERCH AND IT WILL NOT SIT THERE. LIGHT ALL THREE AND IT MUST COME DOWN TO YOU. ITS TALONS CARRY. DODGE THOSE.' });
  ent('check', 12, 19);
  for (const x of [32, 76]) ent('lantern', x, 19); // two lit lanterns on the floor: a swooping owl still crashes into light
  plat(24, 17, 3); plat(84, 17, 3); plat(29, 14, 3); plat(79, 14, 3); plat(34, 11, 3); plat(74, 11, 3); // the climb either side
  plat(40, 9, 5); plat(51, 12, 6); plat(63, 9, 5); // the three perches
  plat(47, 11, 2); plat(60, 10, 2); plat(70, 11, 2); // the links between them
  for (const [x, y] of [[42, 8], [54, 11], [65, 8]]) ent('lantern', x, y, { dark: true, perch: true }); // a dark lantern on each perch: light it and the perch is denied
  vine(48, 12, 19); vine(61, 11, 19); // two vines from the floor up to the links
  ent('deco', 38, 19, { kind: 'stone', v: 0 }); ent('deco', 68, 19, { kind: 'cairn' });
  coins([25, 16], [30, 13], [35, 10], [85, 16], [80, 13], [75, 10], [47, 10], [61, 9], [71, 10]);
  ent('owl', 54, 11);
  ent('gate', 100, 19);
  coins([103, 51], [104, 50], [105, 51], [107, 51], [103, 43], [104, 43]); // the nook past the rock face pays

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 107 }, pools: [], falls: [], moversExtra: movers, gusts, interiors, vines: [52, 68, 34, 48, 61], perches: [[42, 9], [54, 12], [65, 9]], tall: { top: 20 * TS, bottom: 108 * TS },
    duskStart: -1, duskLen: 1, music: 'town', night: false, glowNight: true,
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', hall: true, haze: 'rgba(140,90,150,0.12)', grass: '#8a8a3a', grassL: '#c9b84a', grassD: '#5a5a2a', dirt: '#5a5a66', dirtL: '#6e6e7a', dirtD: '#3a3a44', canopy: ['#4a4458', '#5e5870', '#6a4a7a', '#a07ab8'] },
    stone: [], scree: [], snowLine: 52,
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    quest: { n: 3, item: 'lamp', name: 'LAMP', npc: 'lamplighter', done: 'THE LAMPS ARE LIT', thanks: "THE LAMPLIGHTER'S THANKS" },
    arena: { x0: 20 * TS, x1: 90 * TS, floor: 20 * TS, trigger: 26 * TS, wallL: 19, wallR: 90, boss: 'owl', tint: '#ffd36b', tintA: 0.08, fx: 'motes' },
    mini: { x0: 20 * TS, x1: 75 * TS, floor: 129 * TS, trigger: 30 * TS, wallL: 19, gate: 75, boss: 'spider', y0: 114 * TS, y1: 131 * TS },
  };
}

// ---------- LEVEL 8: THE MINEWORKS ----------
// Under the Hanging Village. Three galleries step down through the rock on rails and an ore lift, to the forge at the bottom.
// ============================================================================================
// LEVEL 8 - THE SUNSPIRE. A mountain of crystal between the tree-city and the high moor.
// You climb it, and it comes apart while you do. A crystal ledge rings under a standing weight,
// then crazes, then goes, and it takes the crystals touching it with it and drops the pieces on
// whatever is below - which you can use, if you are the one choosing when it happens.
// Halfway up you break out of the cloud into the sun, and the sun makes all of it faster.
// ============================================================================================
function theSunspire() {
  const W = 96, H = 222; const L = painter(W, H);
  const { block, plat, ent, coins, set, spikes } = L;
  const movers = [];
  const CLOUD = 100; // above this row the sun is on the rock
  const cryst = (x, n, y) => { for (let i = 0; i < n; i++) set(x + i, y, T.CRYST); };
  const spires = (y, up, ...xs) => xs.forEach((x, i) => ent('deco', x, y, { kind: 'spire', v: (x + i) % 2, hang: up }));
  block(0, 0, 0, H - 1); block(W - 1, W - 1, 0, H - 1);

  // THE JUMP ENVELOPE, off the knight's own numbers. He rises 3.2 tiles, and the higher he lands the
  // less of the arc is left: +0 rows buys 4 tiles across, +1 buys 3.6, +2 buys 3.2, +3 buys 2.5.
  // Nothing on this mountain is placed by eye. A SHELF is a rock band with a crystal gap in it, and a
  // STAIR always finishes three rows under that gap, where the jump up through it is legal.
  // Build the stair FIRST and put the shelf's gap wherever the stair actually arrived.
  const climb = (fromTop, top, x0, x1, startX, gw) => {
    const land = top + 3;
    let y = fromTop - 3, x = startX, dir = 1, n = 0;
    while (y > land) {
      x = Math.max(x0, Math.min(x1 - 4, x));
      cryst(x, 4, y);
      if (n % 4 === 1) coins([x + 1, y - 1]);
      const nx = x + dir * 3; if (nx > x1 - 4 || nx < x0) dir = -dir;
      x += dir * 3; y -= 2; n++;
    }
    x = Math.max(x0, Math.min(x1 - 4, x));
    cryst(x, 4, land);
    const gx = Math.max(2, Math.min(W - 2 - gw, x - ((gw - 4) >> 1)));
    block(1, gx - 1, top, top + 2); block(gx + gw, W - 2, top, top + 2);
    cryst(gx, gw, top);
    return { top, gx, gw, mid: gx + (gw >> 1) };
  };
  // THE THERMALS - the mountain breathes. A glowing crack in the rock lets go a column of hot air every
  // few seconds, and the column carries you straight up while you stay in it. A vent lifts you `rise`
  // rows and two more, so you come out over the ledge beside it with time to steer onto it. Every
  // ledge in a chain sits one tile clear of the column below it, never over it.
  const vent = (x, row, rise, o = {}) => ent('vent', x, row - 1, { heat: true, h: (rise + 2) * TS, period: o.period || 4.2, on: o.on || 2.2, phase: o.phase || 0, lift: o.lift || 190, w: 12, glass: !!o.glass });
  const shelf = (top, gx, gw) => { block(1, gx - 1, top, top + 2); block(gx + gw, W - 2, top, top + 2); cryst(gx, gw, top); return { top, gx, gw }; };
  // a GEODE: a hollow under a flush crystal lid. Stand on the lid, drop in, jump out once it regrows.
  const geode = (x0, x1, top) => {
    block(x0 - 1, x1 + 1, top + 3, top + 3);
    for (let y = top + 1; y <= top + 2; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR);
    cryst(x0 + 1, x1 - x0 - 1, top);
  };
  // a CHIMNEY: two rock faces two apart up the right wall, kicked up. Slow, and it does not break.
  const chimney = (floorRow, topBand) => {
    for (let y = topBand; y <= floorRow; y++) set(W - 2, y, T.CLIMB);
    for (let y = topBand; y <= floorRow - 5; y++) set(W - 5, y, T.CLIMB);
    for (let y = topBand; y <= topBand + 2; y++) { set(W - 4, y, T.AIR); set(W - 3, y, T.AIR); }
    plat(W - 4, topBand, 2);
    coins([W - 4, floorRow - 4], [W - 3, floorRow - 9], [W - 4, floorRow - 14]);
  };

  // ---- Tier 0. THE FOOT, with a camp where somebody gave up and the first geode ----
  block(0, W - 1, 218, H - 1);
  ent('npc', 8, 217, { kind: 'squire' });
  ent('sign', 4, 217, { text: 'THE SUNSPIRE. THE CRYSTAL WILL HOLD YOU, BUT NOT FOR LONG. IT RINGS, THEN IT CRAZES, THEN IT GOES, AND IT TAKES WHAT IT IS TOUCHING WITH IT. KEEP MOVING. STRIKE ONE AND IT BREAKS WHEN YOU SAY SO.' });
  ent('deco', 16, 217, { kind: 'cairn' }); ent('sprig', 30, 217, { face: -1 });
  spires(217, false, 22, 38, 52); spires(218, true, 28, 46);
  ent('check', 20, 217); coins([12, 216], [26, 216], [44, 216]);
  ent('sign', 62, 217, { text: 'THE MOUNTAIN IS HOLLOW IN PLACES. WHERE THE GLASS LIES FLAT IN THE ROCK THERE IS ROOM UNDER IT. STAND ON IT AND FIND OUT WHAT FOR. IT GROWS BACK, AND YOU CAN JUMP UP THROUGH IT.' });
  geode(66, 74, 218); coins([70, 217], [67, 220], [69, 220], [71, 220], [73, 220]);
  ent('deco', 84, 217, { kind: 'tent' }); ent('deco', 89, 217, { kind: 'lanternPost' });
  ent('deco', 92, 217, { kind: 'bones', v: 1 }); coins([80, 217], [87, 217]);

  // ---- Tier 1. THE LOWER FACE: the first crystal climb ----
  climb(218, 196, 30, 70, 34, 15);
  ent('rockgoblin', 20, 195, { face: 1 }); ent('rockgoblin', 74, 195, { face: -1 }); ent('grub', 50, 195, { face: -1 });
  ent('sign', 6, 195, { text: 'THE LOWER FACE. THE CRYSTAL RUNS ARE THE QUICK WAY. THE HARPIES KNOW YOU CANNOT STOP ON THEM.' });
  ent('check', 8, 195); coins([21, 194], [75, 194]);
  ent('sign', 78, 195, { text: 'A CRYSTAL YOU STRIKE BREAKS WHEN YOU SAY SO, AND WHAT COMES OFF IT FALLS ON WHATEVER IS UNDER IT. THERE IS USUALLY SOMETHING UNDER IT.' });
  geode(14, 22, 196); coins([18, 195], [15, 198], [17, 198], [19, 198], [21, 198], [30, 195], [38, 195], [44, 195]);
  ent('deco', 90, 195, { kind: 'bones' }); coins([86, 195], [91, 195]);

  // ---- Tier 2. THE BREATHING ROCK: the thermals, taught on rock where a miss only drops you back ----
  ent('sign', 48, 195, { text: 'THE MOUNTAIN BREATHES. WHERE THE ROCK IS CRACKED AND GLOWING IT LETS GO A GREAT BREATH EVERY FEW SECONDS, AND THE BREATH WILL CARRY YOU. STAND IN IT, GO UP, AND STEER OFF IT AT THE TOP.' });
  vent(74, 196, 10, { phase: 0 }); plat(76, 186, 5);
  vent(79, 186, 8, { phase: 1.4 }); plat(73, 178, 5);
  vent(75, 178, 6, { phase: 2.8 });
  shelf(172, 73, 5);
  coins([74, 190], [74, 186], [79, 181], [75, 175]);
  ent('harpy', 50, 184); ent('bat', 84, 182); ent('bat', 62, 178);
  ent('check', 60, 195);

  // ---- Tier 3. THE ORGAN: it grows in ranks and they all ring the same note ----
  climb(172, 152, 12, 84, 20, 13);
  spires(152, true, 44, 62, 78); spires(151, false, 8, 88);
  ent('harpy', 34, 166); ent('harpy', 62, 162); ent('bat', 44, 164);
  ent('shardling', 40, 151, { face: 1 }); ent('shardling', 66, 151, { face: -1 });
  ent('bat', 30, 146); ent('grub', 56, 151, { face: 1 });
  ent('sign', 6, 151, { text: 'THE ORGAN. IF ONE OF THEM GOES THEY ALL GO. CROSS IT LIKE YOU MEAN IT.' });
  coins([26, 151], [70, 151]);
  geode(8, 16, 152); coins([12, 151], [9, 154], [11, 154], [13, 154], [15, 154]);
  // the first chimney, from the organ's far end up to the long shelf's
  chimney(171, 152);
  ent('sign', 88, 171, { text: 'A CHIMNEY. HOLD INTO THE ROCK AND IT HOLDS YOU; JUMP AND YOU KICK OFF IT. SLOWER THAN THE GLASS, BUT IT IS STILL THERE WHEN YOU COME BACK DOWN.' });
  ent('silver', 86, 151); ent('deco', 80, 151, { kind: 'bones' }); coins([76, 151], [83, 151], [80, 171], [84, 171]);
  ent('deco', 4, 171, { kind: 'cairn' }); coins([8, 171], [13, 171]);

  // ---- Tier 4. THE LONG SHELF ----
  climb(152, 132, 20, 76, 30, 35);
  ent('harpy', 40, 126); ent('rockgoblin', 66, 131, { face: -1 }); ent('shardling', 30, 131, { face: 1 });
  ent('sign', 62, 131, { text: 'THE LONG SHELF. THIRTY-FIVE ACROSS AND NOTHING UNDER IT. RUN.' });
  ent('check', 74, 131); coins([32, 131], [44, 131], [56, 131]);
  ent('stray', 12, 131, { kind: 'shard' }); coins([18, 131], [24, 131]);
  geode(82, 92, 132); ent('silver', 87, 134); coins([83, 134], [85, 134], [89, 134], [91, 134]);

  // ---- Tier 5. THE FLUE: every thermal goes up through a crystal lid, and the lid gives under you ----
  ent('sign', 93, 131, { text: 'THE FLUE. EVERY BREATH HERE GOES UP THROUGH GLASS, AND THE GLASS WILL NOT HOLD YOU FOR LONG AT THE TOP. STEP OFF IT. AND GLASS THAT BREAKS OVER A LIVE BREATH GOES UP, NOT DOWN: REMEMBER THAT WHEN SOMETHING WITH WINGS COMES FOR YOU.' });
  vent(78, 132, 8, { phase: 0 }); cryst(76, 5, 124);
  plat(68, 124, 5); vent(70, 124, 8, { phase: 1.4 }); cryst(68, 5, 116);
  plat(76, 116, 5); vent(78, 116, 8, { phase: 2.8 });
  shelf(108, 76, 5);
  coins([78, 128], [70, 120], [78, 112], [70, 123], [78, 115]);
  ent('harpy', 58, 118); ent('harpy', 86, 114);
  coins([20, 107], [40, 107], [60, 107], [82, 107], [86, 107], [91, 107]);
  geode(10, 20, 108); coins([15, 107], [11, 110], [13, 110], [15, 110], [17, 110], [19, 110]);

  // ---- Tier 6. THE CLOUD LINE. You come out of the grey into the sun ----
  climb(108, CLOUD, 26, 70, 66, 15); // the stair starts where the flue lets you out, not forty tiles away
  ent('sign', 8, CLOUD - 1, { text: 'ABOVE THE CLOUD THE SUN IS ON THE ROCK ALL DAY AND THE CRYSTAL IS HALF AS PATIENT. IT GOES BRIGHT BEFORE IT GOES. THE BREATHS ARE HOTTER UP HERE, AND THEY CARRY FURTHER.' });
  spires(CLOUD, true, 14, 24, 52, 62); spires(CLOUD - 1, false, 6, 88);
  ent('check', 10, CLOUD - 1); coins([16, CLOUD - 1], [80, CLOUD - 1]); ent('harpy', 58, 94);
  ent('sign', 84, CLOUD - 1, { text: 'THE CLOUD IS UNDER YOU NOW. SO IS EVERYTHING ELSE.' });

  // ---- Tier 7. THE GLARE, and the eyrie up a goat path off the glass ----
  climb(CLOUD, 80, 20, 76, 28, 15);
  ent('shardling', 30, 79, { face: 1 }); ent('shardling', 48, 79, { face: -1 }); ent('harpy', 62, 74);
  coins([28, 79], [60, 79], [16, 79], [21, 79]); ent('check', 10, 79); ent('deco', 4, 79, { kind: 'cairn' });
  ent('sign', 6, 79, { text: 'THE GLARE. THE ROCK LEDGES ARE THE ONLY REST UP HERE AND THERE ARE NOT MANY.' });
  for (let y = 86; y <= CLOUD - 1; y++) set(W - 2, y, T.CLIMB);
  plat(84, 97, 3); plat(89, 95, 3); plat(84, 93, 3); plat(89, 91, 3); plat(80, 89, 14);
  coins([90, 94], [85, 92], [90, 90]);
  ent('stray', 88, 88, { kind: 'shard' }); ent('deco', 83, 88, { kind: 'bones' }); ent('harpy', 78, 84);

  // ---- Tier 8. THE BELLOWS: hot, tall breaths in the glare, glass that goes in a second, and the harpies ride them ----
  ent('sign', 20, 79, { text: 'THE BELLOWS. THE BREATHS UP HERE THROW YOU HIGH, AND THE GLASS AT THE TOP IS LIT THROUGH. KEEP GOING.' });
  vent(14, 80, 11, { lift: 230, period: 4.6, on: 2.4, phase: 0 }); plat(16, 69, 5);
  // the glass sits three rows under the shelf, not one: with no headroom there was no hop off it at all
  vent(19, 69, 7, { lift: 230, period: 4.6, on: 2.4, phase: 1.5 }); cryst(17, 5, 62);
  plat(23, 62, 5); vent(25, 62, 6, { lift: 230, period: 4.6, on: 2.4, phase: 3.0 });
  shelf(56, 23, 5);
  coins([14, 74], [19, 65], [25, 59], [14, 70], [19, 67]);
  ent('harpy', 40, 70); ent('harpy', 30, 64);
  geode(80, 90, 80); coins([81, 82], [83, 82], [85, 82], [87, 82], [89, 82], [70, 79], [76, 79]);

  // ---- Tier 9. THE UPPER GLARE, and the second chimney: the only way up it that is not glass ----
  climb(56, 36, 18, 78, 26, 15);
  ent('shardling', 60, 35, { face: -1 });
  ent('check', 12, 35); coins([32, 35], [66, 35]);
  chimney(55, 36);
  coins([70, 55], [78, 55], [84, 55], [40, 55], [50, 55], [6, 55], [12, 55], [18, 55]); ent('deco', 3, 55, { kind: 'bones', v: 1 });

  // ---- Tier 10. THE CROWN: the Roc's nest. Glass set in the rock where she dives, and two breaths ----
  const s10 = climb(36, 30, 30, 62, 38, 11);
  block(1, s10.gx - 1, 31, 34); block(s10.gx + s10.gw, W - 2, 31, 34); // the crown's body, either side of the way up
  spikes(4, 12, 29); spikes(80, 90, 29);
  spires(30, true, 8, 20, 74, 86); spires(29, false, 16, 78);
  // glass set flush in the crown's rock: where her dive puts her talons through it and holds her
  cryst(14, 6, 30); cryst(49, 6, 30); cryst(66, 6, 30);
  // two breaths with a knuckle of glass over each: stand on the glass while she is over it and the breath is coming
  // the crown's breaths blow the glass out themselves, half a second in: be where she hovers over one when it goes
  vent(26, 30, 5, { period: 5, on: 2.4, phase: 0, lift: 220, glass: true }); cryst(24, 4, 27);
  vent(60, 30, 5, { period: 5, on: 2.4, phase: 2.5, lift: 220, glass: true }); cryst(58, 4, 27);
  ent('sign', 16, 29, { text: 'THE ROC. THE HARPIES\' MOTHER NESTS ON THE PEAK, AND THE SUN HAS TURNED THE ENDS OF HER FEATHERS TO GLASS. WATCH FOR HER SHADOW: SHE COMES DOWN WHERE IT IS, AND IF IT IS ON THE GLASS SHE STAYS DOWN. THE BREATHS UP HERE BLOW THE GLASS OVER THEM OUT, AND IT GOES UP: SHE HOVERS OFF YOUR SHOULDER, SO STAND WHERE THAT PUTS HER OVER ONE.' });
  ent('roc', 72, 29);
  // the last hop to the gate is over the thorns on two pieces of crystal, which will not wait for you
  plat(79, 29, 5); cryst(85, 3, 27); cryst(89, 3, 27); // a plank over the first of the thorns, then the glass
  ent('check', 18, 29); ent('gate', 92, 29);
  ent('silver', 90, 26);
  ent('stray', 25, 26, { kind: 'shard' });
  // the crawl under the crown ends in a hollow either side, and the second chimney comes up into the right one
  for (let y = 32; y <= 34; y++) { for (let x = 70; x <= 93; x++) set(x, y, T.AIR); for (let x = 3; x <= 16; x++) set(x, y, T.AIR); }
  coins([74, 35], [78, 35], [86, 35], [90, 35]); ent('deco', 82, 35, { kind: 'bones', v: 1 });
  ent('deco', 6, 35, { kind: 'cairn' }); coins([4, 35], [9, 35], [15, 35]);


  // ---- MORE GOING ON. Every floor used to be a stair up one side and a walk to a wall on the other. ----
  // SIDE ROUTES: a goat path of stone up the side the crystal stair does not use, through a small lid of
  // glass in the shelf above - slower, and it does not break, and it means neither end of a floor is a wall.
  const sideRoute = (floorRow, shelfTop, xa, xb) => {
    for (let yy = shelfTop + 1; yy <= shelfTop + 2; yy++) for (let x = xa; x <= xa + 2; x++) set(x, yy, T.AIR); // cut the gap first
    cryst(xa, 3, shelfTop);
    let y = floorRow - 2, k = 0;
    while (y > shelfTop + 6) { const x = k % 2 ? xb : xa; plat(x, y, 3); if (k % 2) coins([x + 1, y - 1]); y -= 2; k++; }
    // the last three stack straight up under the gap: the far ledges are under the rock, and a jump from there bangs its head
    plat(xa, shelfTop + 6, 3); plat(xa, shelfTop + 4, 3); plat(xa, shelfTop + 2, 3); coins([xa + 1, shelfTop + 1]);
  };
  sideRoute(218, 196, 86, 90);     // the lower face, up the far wall past the camp
  sideRoute(196, 172, 4, 8);       // the breathing rock's near end, up to the organ
  sideRoute(80, 56, 84, 88);       // the bellows' far side, up to the chimney's foot
  // STALACTITES: glass hanging under the shelves, each one over a step you have to stand on - the tops of the
  // stairs, the side routes, the long walk under the cloud shelf. Pass under one and it shivers, then drops.
  const stal = (x, y) => { if (L.grid[(y - 1) * W + x] === T.SOLID && L.grid[y * W + x] === T.AIR) ent('stal', x, y); };
  for (const [x, y] of [[51, 199], [91, 199], [9, 175], [33, 155], [24, 103], [44, 103], [88, 103], [41, 83], [84, 84], [77, 59], [39, 39], [10, 32], [80, 32]]) stal(x, y);
  // ISLANDS: in the two emptiest chambers, glass hung in the air, a shardling on it, and gold at the top
  for (const [x, y, n] of [[40, 78, 4], [45, 76, 4], [50, 74, 4], [55, 72, 4], [60, 70, 4], [65, 68, 4], [70, 66, 4], [75, 64, 4]]) cryst(x, n, y);
  coins([41, 77], [51, 73], [61, 69], [71, 65], [76, 63], [77, 63], [78, 63]); ent('shardling', 56, 71, { face: 1 }); ent('harpy', 66, 60);
  for (const [x, y] of [[2, 129], [6, 127], [2, 125], [6, 123], [2, 121], [6, 119], [2, 117], [6, 115]]) cryst(x, 3, y);
  plat(2, 113, 6); coins([2, 112], [3, 112], [4, 112], [5, 112], [6, 112], [3, 126], [7, 118]); ent('deco', 5, 112, { kind: 'bones' }); ent('shardling', 7, 122, { face: -1 });
  // and more of the mountain's own: bats in the shade below the cloud, harpies and shardlings above it
  ent('bat', 60, 205); ent('bat', 24, 186); ent('shardling', 40, 171, { face: 1 }); ent('harpy', 20, 142); ent('bat', 70, 140);
  ent('harpy', 40, 44); ent('shardling', 40, 55, { face: -1 }); ent('harpy', 70, 104);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 4, y: 217 }, pools: [], falls: [], moversExtra: movers,
    duskStart: 99999, duskLen: 1, music: 'sunspire', night: false, hasCryst: true, cloudLine: CLOUD, // duskStart -1 means ALWAYS dusk: this one is daylight
    tall: { top: 26 * TS, bottom: 218 * TS },
    quest: { n: 3, item: 'shard', name: 'SUNSHARD', npc: 'squire', done: 'THE LIGHT IS CARRIED DOWN', reward: 'relic', relic: 'sunshard' },
    palette: { sky: [[126, 176, 214], [214, 232, 240]], far: 'crag', mid: 'crag', near: 'crag', dress: 'crag',
      haze: 'rgba(200,222,240,0.16)', grass: '#bcd4e4', grassL: '#e8f2fa', grassD: '#8ea8bc',
      dirt: '#5a6478', dirtL: '#727e94', dirtD: '#3c4456', canopy: ['#5a6478', '#6e7a90', '#8494ac', '#a8bcd0'] },
    weather: [{ x0: 0, x1: 99999, kind: 'mist' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 2 * TS, x1: 94 * TS, floor: 30 * TS, trigger: 24 * TS, wallL: 1, wallR: 94, boss: 'roc', music: 'roc', tint: '#bfe6f5', tintA: 0.08, fx: 'motes' },
  };
}

// ============================================================================================
// LEVEL 10 - STORMHOLD, the last hold.
// What is left of the goblins after Kingswood, the Stockade and the crags has fallen back up
// the mountain to the town they came from, and the Queen's castle stands over it in the snow.
// The village is the lock and the castle is the door: three tiers, three houses, three keys,
// three gates. You go indoors for the keys. You cross bridges to get anywhere. Then the last
// gate opens on a bridge a quarter of a mile long, and the Queen's Lance is standing on it.
// ============================================================================================
function stormhold() {
  const L = painter(430, 46); // rows 0-17 are the indoors, off where the street cannot reach
  const { block, floor, plat, ent, coins, set, spikes } = L;
  const movers = [], interiors = [], bridges = [];
  const gateCol = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
  const room = (x0, x1, y0, y1, st = 'stone') => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, 0); interiors.push([x0, x1, y0, y1, st]); };
  block(0, 429, 0, 18); // the indoor band is solid rock; every room below is cut out of it
  const roofs = [];
  const roof = (x0, x1, y) => { block(x0, x1, y - 2, y); roofs.push([x0, x1, y]); }; // a goblin roof: two courses of slate, and a house under it
  // A span of rope and plank between two piers. `give` planks snap under a standing weight.
  const span = (x0, x1, y, o) => { const opt = o || {};
    for (let x = x0; x <= x1; x++) set(x, y, opt.give ? T.SHELF : T.PLANK);
    bridges.push({ x: x0, x1, y, sway: opt.sway || 0, cut: !!opt.cut });
    ent('deco', x0, y - 1, { kind: 'bridgepost' }); ent('deco', x1, y - 1, { kind: 'bridgepost' }); };

  // ---- 1. THE UNDER STREET: the market gone to a war camp. Snow, stalls, and the castle above it all. ----
  floor(0, 60, 34);
  ent('npc', 8, 33, { kind: 'squire' });
  ent('sign', 4, 33, { text: 'STORMHOLD. WHAT IS LEFT OF THEM LIVES HERE, AND THE QUEEN IS IN THE CASTLE ABOVE IT. THE GATES ARE LOCKED AND THE KEYS ARE INDOORS. STAND IN A DOORWAY AND PRESS UP.' });
  ent('deco', 16, 33, { kind: 'cairn' }); ent('torch', 12, 33); ent('deco', 24, 33, { kind: 'barrels' });
  ent('sprig', 30, 33, { face: -1 }); ent('shield', 40, 33, { face: -1 }); ent('torch', 34, 33);
  coins([14, 32], [22, 31], [36, 32], [48, 32]);
  ent('check', 20, 33); coins([10, 32], [18, 31], [28, 32], [36, 31]);
  // the first house: it is already open, so the doorway teaches itself
  roof(44, 54, 30);
  ent('doorway', 48, 33, { id: 'hearth-out', to: 'hearth-in', kind: 'goblin' });
  ent('sign', 44, 33, { text: 'THE FIRST DOOR IS ON THE LATCH. WHAT IS INSIDE IS ASLEEP, AND WHAT IS ON THE NAIL IS THE BRASS KEY.' });
  room(6, 30, 6, 13, 'hall');
  ent('doorway', 9, 13, { id: 'hearth-in', to: 'hearth-out', lock: [6, 30], label: 'THE HEARTH HOUSE' });
  ent('torch', 12, 13); ent('brazier', 20, 13); ent('deco', 26, 13, { kind: 'barrels' });
  ent('hearthgob', 18, 13, { face: -1 }); ent('key', 28, 13, { kind: 'brass' });
  coins([12, 12], [16, 12], [20, 12], [24, 12], [26, 11]);
  ent('sign', 7, 13, { text: 'HEARTH GOBLINS SLEEP BY THE FIRE UNTIL YOU ARE CLOSE, AND THEN THEY FIGHT WITH WHATEVER IS TO HAND.' });
  // the first span: short, low, and the planks give
  block(61, 62, 34, 45); block(75, 76, 34, 45);
  span(63, 74, 34, { give: true });
  ent('sign', 58, 33, { text: 'THE PLANKS GIVE UNDER A STANDING WEIGHT. KEEP MOVING.' });
  ent('deco', 66, 33, { kind: 'lanternPost' });
  floor(77, 96, 34); ent('archer', 86, 33, { face: -1 }); coins([80, 33], [84, 32], [88, 32], [90, 33]);
  ent('check', 60, 33);
  ent('lockgate', 96, 33, { needs: 'brass', h: 6 }); gateCol(96, 28, 33);
  ent('check', 92, 33);

  // ---- 2. SMOKE ROW: forges and tanneries, and the spans start being watched. ----
  floor(97, 150, 32);
  ent('sign', 99, 31, { text: 'SMOKE ROW. THEY WORK IRON FOR THE CASTLE HERE. THE TOWERS COVER EVERY SPAN: PICK YOUR MOMENT.' });
  ent('deco', 104, 31, { kind: 'forge' }); ent('brazier', 108, 31); ent('brazier', 120, 31); ent('check', 140, 31);
  ent('hearthgob', 114, 31, { face: -1 }); ent('brute', 130, 31, { face: -1 }); ent('sprig', 140, 31, { face: -1 });
  roof(110, 124, 28); roof(132, 146, 28);
  // the rooftops are a road: up the lean-to steps at the forge, across the slates, over the archer's perch
  // (the silver up here had no way to it at all: the roofs sit six rows over the street)
  plat(103, 30, 3); plat(106, 28, 3);
  plat(126, 26, 4); ent('archer', 127, 25, { face: -1 }); coins([102, 30], [110, 29], [118, 30], [127, 25], [132, 29], [136, 30], [144, 29], [146, 30]);
  ent('silver', 128, 25);
  // the smithy: the iron key, and the smith
  ent('doorway', 118, 31, { id: 'smithy-out', to: 'smithy-in', kind: 'goblin' });
  room(38, 66, 6, 14, 'stone');
  ent('doorway', 41, 14, { id: 'smithy-in', to: 'smithy-out', lock: [38, 66], label: 'THE SMITHY' });
  ent('brazier', 46, 14); ent('deco', 52, 14, { kind: 'anvil' }); ent('torch', 60, 14);
  ent('hearthgob', 50, 14, { face: -1 }); ent('hearthgob', 58, 14, { face: -1 }); ent('miner', 62, 14, { face: -1 });
  plat(47, 13, 3); plat(50, 11, 3); plat(54, 10, 4); ent('key', 64, 14, { kind: 'iron' }); // steps to the shelf: it was five rows off the floor coins([44, 13], [48, 13], [52, 13], [56, 9], [58, 9], [60, 13]);
  ent('stray', 56, 9, { kind: 'folk' });
  ent('sign', 39, 14, { text: 'THE SMITHY. THEY ARE MAKING SOMETHING LONG AND SHARP FOR SOMEONE LARGE.' });
  // the second span: long, watched from both ends, and a cutter on the far post
  block(151, 152, 32, 45); block(178, 179, 32, 45);
  span(153, 177, 32, { sway: 1 });
  ent('stormshaman', 177, 31, { face: -1 }); // (the rope cutter could drop the only way on: a shaman holds the far end instead)
  ent('archer', 151, 30, { face: 1, fire: true }); ent('rockgoblin', 179, 30, { face: -1 });
  ent('sign', 148, 31, { text: 'A GOBLIN WITH AN AXE IS WORTH MORE THAN A GOBLIN WITH A SWORD, IF HE IS STANDING ON THE ROPE. THE SHIELD CARRIES.' });
  ent('deco', 160, 31, { kind: 'lanternPost' }); ent('deco', 170, 31, { kind: 'lanternPost' });
  floor(180, 208, 32); ent('sprig', 190, 31, { face: -1 }); ent('shield', 200, 31, { face: -1 });
  coins([184, 31], [194, 30], [204, 31]);
  // the tannery: a house you go through, not into, and the second captive
  roof(186, 198, 28); ent('doorway', 190, 31, { id: 'tan-out', to: 'tan-in', kind: 'goblin' });
  room(74, 98, 6, 13, 'earth');
  ent('doorway', 77, 13, { id: 'tan-in', to: 'tan-out', lock: [74, 98], label: 'THE TANNERY' });
  ent('torch', 82, 13); ent('hearthgob', 88, 13, { face: -1 }); ent('spider', 92, 7, { drop: 90 });
  ent('stray', 95, 13, { kind: 'folk' }); coins([80, 12], [84, 12], [88, 12], [90, 12], [96, 13]);
  ent('lockgate', 208, 31, { needs: 'iron', h: 6 }); gateCol(208, 26, 31);
  ent('check', 204, 31);

  // ---- 3. THE HALLS: the officers' houses under the crag, and every span at once. ----
  floor(209, 250, 30);
  ent('sign', 211, 29, { text: 'THE HALLS. THE QUEEN\'S OFFICERS KEEP HOUSE UNDER THE CRAG. THE LAST KEY IS IN THE LONGHOUSE AND THE LONGHOUSE IS FULL.' });
  ent('deco', 218, 29, { kind: 'banner', v: 0 }); ent('deco', 240, 29, { kind: 'banner', v: 1 });
  ent('brute', 224, 29, { face: -1 }); ent('pike', 234, 29, { face: -1 }); ent('archer', 246, 29, { face: -1, fire: true }); ent('check', 240, 29);
  roof(214, 232, 26); roof(236, 248, 26); ent('torch', 216, 29); ent('torch', 244, 29);
  coins([214, 28], [220, 27], [228, 28], [232, 27], [238, 28], [244, 27], [248, 28]);
  // the longhouse: the deepest room, the bone key at the back of it
  ent('doorway', 228, 29, { id: 'long-out', to: 'long-in', kind: 'cottage' });
  room(106, 160, 4, 15, 'hall');
  ent('doorway', 109, 15, { id: 'long-in', to: 'long-out', lock: [106, 160], label: 'THE LONGHOUSE' });
  ent('torch', 114, 15); ent('brazier', 124, 15); ent('brazier', 142, 15); ent('torch', 154, 15);
  ent('hearthgob', 120, 15, { face: -1 }); ent('hearthgob', 134, 15, { face: 1 }); ent('brute', 146, 15, { face: -1 });
  plat(112, 14, 3); plat(115, 12, 3); plat(118, 11, 4); plat(123, 10, 3); plat(128, 8, 5); plat(136, 10, 4); ent('archer', 129, 7, { face: -1 }); // a real way into the rafters
  ent('stray', 130, 7, { kind: 'folk' }); ent('key', 158, 15, { kind: 'bone' });
  coins([116, 10], [120, 10], [126, 7], [130, 7], [137, 9], [139, 9], [150, 14], [154, 14]);
  ent('sign', 107, 15, { text: 'THE LONGHOUSE. THE THIRD OF THE HILL FOLK IS UP IN THE RAFTERS AND THE BONE KEY IS AT THE FAR END.' });
  // a swaying span with a cutter, over the drop, to the last gate
  block(251, 252, 30, 45); block(274, 275, 30, 45);
  span(253, 273, 30, { sway: 2, give: true });
  ent('stormshaman', 273, 29, { face: -1 }); ent('harpy', 262, 20);
  ent('archer', 251, 29, { face: 1, fire: true });
  floor(276, 300, 30); ent('sprig', 284, 29, { face: -1 }); ent('shield', 294, 29, { face: -1 });
  ent('silver', 288, 25); plat(286, 26, 4); coins([280, 29], [288, 25], [296, 29]);
  ent('lockgate', 300, 29, { needs: 'bone', h: 7 }); gateCol(300, 23, 29);
  ent('check', 296, 29);

  // ---- 4. THE LONG BRIDGE: seven spans, six piers, and the Queen's Lance. ----
  // one height the whole way, so his charge has one line to run and the piers are the rhythm
  const BY = 30, P0 = 302; // the deck row: the piers are solid from here down and the deck planks sit on it
  // the bridgehead: the one column between the bone gate and the first pier was open to the gorge, and
  // anyone who walked through the gate without jumping fell out of the world on the way to the fight
  block(301, 301, BY, 45);
  ent('check', 304, BY - 1);
  ent('sign', 302, BY - 1, { text: 'THE CASTLE BRIDGE, AND THE QUEEN\'S LANCE ON IT. HE CANNOT TURN WHILE HE IS CHARGING: GET UP ON A LOOKOUT OVER A PIER AND HE GOES UNDER YOU, AND INTO THE NEXT POST. THE FIRE CAGES HANG OVER THE SPANS: CUT A CHAIN AS HE GOES UNDER.' });
  const piers = [];
  for (let k = 0; k < 7; k++) { const px0 = P0 + k * 18, px1 = px0 + 4;
    block(px0, px1, BY, 45); piers.push([px0, px1]);
    // sound planks: a duel of blocks and parries cannot be fought on boards that drop you for standing still.
    // The give-planks are the street's lesson; out here the hazard is the holes his charge leaves.
    if (k > 0) { const s0 = px0 - 13, s1 = px0 - 1; span(s0, s1, BY, { sway: k >= 3 ? 2 : 1 }); }
    if (k >= 1 && k <= 5) { ent('deco', px0 + 2, BY - 1, { kind: 'bridgetower' });
      plat(px0, BY - 3, 5); ent('brazier', px0 + 4, BY - 4); } // a lookout on every tower pier: hop up and his charge goes under you
    // a fire cage over the middle of every span, on a lamp-standard: cut its chain as he goes under it
    if (k > 0) ent('weight', px0 - 7, BY - 9, { len: 6, lamp: true });
  }
  // the last span, from the seventh pier to the gatehouse. Without it the bridge stopped nine tiles
  // short of the door and there was no way off it at all.
  span(415, 423, BY, { sway: 2 });
  // the towers loose at you on the open spans
  ent('archer', 322, BY - 1, { face: 1, fire: true }); ent('archer', 358, BY - 1, { face: -1, fire: true });
  ent('rockgoblin', 394, BY - 1, { face: -1 }); ent('archer', 412, BY - 1, { face: -1, fire: true });
  // (no rope cutter out here: a span dropping out from under a duel on a timer nobody can see is not a fight)
  for (const x of [310, 328, 346, 364, 382, 400]) { ent('deco', x, BY - 1, { kind: 'lanternPost' }); coins([x + 4, BY - 2]); }
  ent('silver', 373, BY - 2);
  // the far gatehouse, and the way out
  block(428, 429, 20, 45); floor(424, 429, BY);
  ent('deco', 426, BY - 1, { kind: 'gatehouse' });
  ent('gate', 427, BY - 1);
  ent('lance', 320, BY - 1);

  // THE HOUSES. Every roof has a house under it, walls down to the street: the door you go in by is its
  // door, and a roof with no way in gets a door that stays shut. (They were a slate slab over a lone door.)
  const houses = roofs.map(([x0, x1, y]) => { const mx = (x0 + x1) >> 1; let fy = y + 1; while (fy < L.H && L.grid[fy * L.W + mx] === T.AIR) fy++;
    const door = L.ents.find(e => e.t === 'doorway' && e.y === fy - 1 && e.x > x0 && e.x < x1);
    return { x0: x0 + 1, x1: x1 - 1, y0: y + 1, y1: fy - 1, door: door ? door.x : null, seed: x0 }; }).filter(h => h.y1 >= h.y0 + 1);

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 33 }, pools: [], falls: [], moversExtra: movers, interiors, bridges, houses,
    indoorRow: 18, // rows 0-18 are the insides of the houses: the camera never shows them from the street, nor the street from inside
    duskStart: -1, duskLen: 1, music: 'stormhold', night: true, glowNight: true, nightA: 0.26,
    quest: { n: 3, item: 'folk', name: 'HILL FOLK', npc: 'squire', done: 'THEY ARE OUT OF THEIR CELLARS', reward: 'relic', relic: 'shoes' },
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(150,160,200,0.16)',
      grass: '#cfd8e2', grassL: '#eef4ff', grassD: '#9aa8bc', dirt: '#4a4a58', dirtL: '#62626e', dirtD: '#32323c',
      canopy: ['#3a3a48', '#4a4a5a', '#5a5a6c', '#6a6a80'] },
    weather: [{ x0: 0, x1: 99999, kind: 'snow' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    castle: true, // the castle grows over the whole level: drawn behind everything
    arena: { x0: 302 * TS, x1: 429 * TS, floor: 30 * TS, trigger: 308 * TS, wallL: 301, wallR: 429, boss: 'lance', music: 'boss2', tint: '#6a7a9a', tintA: 0.10, fx: 'dust' },
  };
}

// ============================================================================================
// LEVEL 11 - HIGHCROWN, the Goblin Queen's castle.
// Stormhold's long bridge ends at her drawbridge. Everything the goblins have left is in here: the
// Outer Ward under the walls, the Keep climbed floor by floor - the entrance hall, the kitchens, the
// armoury where her smith works, the chapel - and at the top her hall, her throne, and her roof.
// THE ALARM: every section has a sentry and a bell. Seen, he runs for it; rung, the gates of that hall
// drop and the garrison turns out, and they lift only when the garrison is down. Catch him first.
// THE WINCHES: a struck winch holds its portcullis up for a few seconds; a cut counterweight falls.
// ============================================================================================
function highcrown() {
  const W = 324, H = 70; const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const port = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const lid = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const stair = steps => steps.forEach(([x, y, n]) => plat(x, y, n || 4));

  // ---- 1. THE OUTER WARD: over the drawbridge, through the gatehouse, across the courtyard under the walls ----
  block(0, W - 1, 64, H - 1);
  air(3, 10, 64, H - 1); for (let x = 3; x <= 10; x++) set(x, 64, T.PLANK); // the drawbridge over the moat
  ent('npc', 1, 63, { kind: 'squire' });
  ent('sign', 0, 63, { text: 'HIGHCROWN. HER CASTLE, AND THE LAST OF THEM IN IT. THE WATCH CARRY BELLS: A SENTRY WHO SEES YOU RUNS FOR HIS, AND A RUNG BELL SHUTS THAT HALL AND TURNS OUT THE GARRISON. SEE HIM FIRST.' });
  // the gatehouse: a tower over an arch, and a portcullis on a winch
  block(11, 21, 44, 57); port(16, 58, 63);
  ent('winch', 8, 63, { gate: 16, gy0: 58, gy1: 63, hold: 6 });
  ent('sign', 6, 63, { text: 'THE WINCH. STRIKE IT AND IT HOLDS THE GATE UP A FEW BREATHS. IT DOES NOT HOLD IT UP FOR LONG, AND IT DOES NOT CARE WHAT IS UNDER IT WHEN IT DROPS.' });
  ent('check', 22, 63);
  // the wall walk, archers on it, and the steps up to it
  plat(22, 52, 53);
  stair([[30, 62], [34, 60], [38, 58], [42, 56], [46, 54]]);
  ent('archer', 60, 51, { face: -1 }); ent('archer', 72, 51, { face: -1 });
  ent('stray', 26, 51, { kind: 'seal' });
  // the gatehouse top, off the wall walk: a silver among the crenels
  plat(22, 50, 3); plat(22, 48, 3); plat(22, 46, 3); ent('silver', 16, 43); coins([13, 43], [19, 43]);
  // the courtyard: stables, a kennel, a well, the barracks door
  ent('deco', 36, 63, { kind: 'cart' }); ent('deco', 42, 63, { kind: 'barrels' }); ent('deco', 76, 63, { kind: 'well' }); ent('deco', 86, 63, { kind: 'spearRack' });
  ent('deco', 56, 63, { kind: 'banner', v: 0 }); ent('torch', 48, 63); ent('torch', 80, 63);
  ent('hound', 64, 63, { face: -1 }); ent('sprig', 28, 63, { face: 1 });
  ent('sentry', 66, 63, { section: 'ward', range: 8, face: 1 });
  ent('bell', 84, 63, { section: 'ward' });
  ent('sign', 26, 63, { text: 'THE WARD. THE SENTRY BY THE WELL HAS A BELL BY THE BARRACKS. CATCH HIM BEFORE HE REACHES IT, OR BREAK IT. THE WEIGHT OVER THE BARRACKS DOOR WILL COME DOWN IF YOU CUT IT.' });
  plat(91, 55, 6); ent('weight', 94, 55, { len: 6 }); // a counterweight over the barracks door (low enough to cut with a jump)
  ent('deco', 95, 63, { kind: 'cabin' });
  // the inner wall, its gate open until the alarm drops it
  block(101, 103, 44, 57);
  ent('check', 106, 63);
  // the keep door: a second winch
  port(121, 58, 63); ent('winch', 116, 63, { gate: 121, gy0: 58, gy1: 63, hold: 5 });
  ent('sign', 110, 63, { text: 'THE KEEP. ENTRANCE HALL, KITCHENS, ARMOURY, CHAPEL, AND HER HALL AT THE TOP. EACH FLOOR HAS ITS OWN WATCH.' });
  ent('archer', 108, 43, { face: -1 }); plat(106, 44, 6);
  coins([40, 60], [44, 60], [52, 63], [88, 63], [98, 60], [112, 63]);

  // ---- THE KEEP: four floors inside one stone tower ----
  block(123, 207, 8, 9);                       // its roof
  block(123, 123, 10, 57); block(207, 207, 20, 63); block(207, 207, 10, 13); // its walls (door at the foot, hall door at the top)
  block(124, 206, 52, 53); block(124, 206, 40, 41); block(124, 206, 20, 25); // the floors between

  // F0. THE ENTRANCE HALL (floor 64)
  ent('check', 128, 63);
  ent('deco', 132, 63, { kind: 'banner', v: 1 }); ent('deco', 146, 63, { kind: 'spearRack' }); ent('deco', 168, 63, { kind: 'barrels' });
  ent('torch', 140, 63); ent('torch', 164, 63);
  ent('sentry', 152, 63, { section: 'hall', range: 12, face: 1 }); ent('bell', 176, 63, { section: 'hall' });
  ent('shield', 138, 63, { face: -1 });
  air(198, 201, 52, 53); lid(198, 201, 52);    // the stair up, through the floor above
  stair([[184, 62], [188, 60], [192, 58], [196, 56], [198, 54]]);
  ent('sign', 134, 63, { text: 'THE ENTRANCE HALL. HER WATCH WALKS IT. THE STAIR IS AT THE FAR END, AND THE GATE BEFORE IT DROPS WITH THE BELL.' });

  // F1. THE KITCHENS (floor 52)
  ent('check', 196, 51);
  ent('brazier', 186, 51); ent('brazier', 164, 51); ent('deco', 176, 51, { kind: 'barrels' }); ent('deco', 150, 51, { kind: 'wares', v: 0 });
  ent('hearthgob', 190, 51, { face: -1 }); ent('hearthgob', 168, 51, { face: -1 }); ent('hearthgob', 146, 51, { face: 1 });
  ent('folk', 180, 51, { door: 206 }); ent('folk', 156, 51, { door: 124, alt: true });
  ent('brute', 160, 51, { face: 1 }); plat(157, 43, 6); ent('weight', 160, 43, { len: 6 }); // the meat hook's counterweight, over the cook's brute
  stair([[184, 50, 3], [180, 48, 3], [175, 46, 4]]); ent('stray', 176, 45, { kind: 'seal' }); // the larder's high shelf
  air(125, 128, 40, 41); lid(125, 128, 40);    // the stair up to the armoury
  stair([[138, 50], [134, 48], [130, 46], [126, 44], [125, 42]]);
  ent('check', 142, 51);
  ent('deco', 128, 51, { kind: 'barrels' }); coins([126, 51], [129, 51], [132, 51]); // the cold larder in the corner
  ent('sign', 144, 51, { text: 'THE ARMOURY IS OVERHEAD, AND HER SMITH IS IN IT. HIS IRON TURNS HALF OF EVERY CUT. A TUB INTO HIM STUNS HIM, AND A STUNNED SMITH TAKES IT ALL.' });

  // F2. THE ARMOURY (floor 40) - THE FORGEMASTER. Rails on the floor, a beam rail over it, the gantry, the anvil, the hammer, the boiler.
  for (let x = 129; x <= 196; x++) set(x, 40, T.RAIL);
  ent('cart', 196, 39, { auto: true, dir: -1, speed: 120 }); ent('cart', 132, 39);
  for (let x = 140; x <= 184; x++) set(x, 35, T.RAIL); ent('cart', 184, 34, { auto: true, dir: -1, speed: 110 });
  stair([[132, 37, 3], [136, 32, 3], [142, 30, 3], [148, 28, 4], [156, 30, 3], [162, 32, 3], [168, 37, 3]]);
  ent('silver', 149, 27);
  ent('hammer', 150, 39); ent('anvil', 158, 39); ent('boiler', 176, 39); ent('hotplate', 144, 39); ent('hotplate', 166, 39); ent('hotplate', 186, 39);
  for (const x of [130, 150, 172, 194]) ent('torch', x, 39);
  ent('deco', 138, 39, { kind: 'barrels' });
  ent('forgemaster', 172, 39, { mini: true });
  port(199, 26, 39);                            // the armoury door, shut until the smith is down
  air(200, 205, 21, 25); lid(200, 205, 20);    // up through the thick floor to the chapel (cut the shaft BEFORE the steps go in it)
  stair([[200, 38, 3], [203, 36, 3], [200, 34, 3], [203, 32, 3], [200, 30, 3], [203, 28, 3], [200, 26, 3], [203, 24, 3], [200, 22, 3]]);

  // F3. THE CHAPEL (floor 20) - the bell tower's own bell, two of the watch, the key on the altar
  ent('check', 202, 19);
  port(206, 14, 19); ent('lockgate', 206, 19, { needs: 'brass', h: 6 });
  ent('sign', 198, 19, { text: 'THE CHAPEL. HER HALL IS THROUGH THAT GATE AND THE KEY TO IT IS ON THE ALTAR AT THE FAR END. THE CHAPEL BELL IS THE LOUDEST IN THE CASTLE.' });
  ent('sentry', 186, 19, { section: 'chapel', range: 10, face: -1 }); ent('sentry', 166, 19, { section: 'chapel', range: 6, face: 1 });
  ent('bell', 176, 19, { section: 'chapel' });
  for (const x of [134, 154, 178, 196]) ent('torch', x, 19);
  ent('deco', 144, 19, { kind: 'banner', v: 0 }); ent('deco', 188, 19, { kind: 'banner', v: 1 });
  for (const x of [140, 164, 184]) ent('deco', x, 13, { kind: 'hallWindow' });
  plat(140, 14, 16); ent('archer', 152, 13, { face: 1 }); ent('stray', 141, 13, { kind: 'seal' }); // the choir loft
  stair([[158, 17, 3], [154, 15, 3]]);
  plat(128, 12, 4); ent('silver', 129, 11); stair([[134, 16, 3], [131, 14, 2]]); // up in the rafters
  ent('deco', 127, 19, { kind: 'counter' }); ent('key', 128, 19, { kind: 'brass' });

  // ---- THE GREAT HALL (floor 20) and THE ROOF (8): THE GOBLIN QUEEN ----
  block(208, W - 1, 20, H - 1);                 // the castle's mass under the hall
  block(208, W - 1, 8, 9);                      // the hall's roof, and the roof walk on it
  block(317, W - 1, 0, 19);                     // the far wall
  block(206, 207, 2, 7);                        // the battlement at the near end of the roof
  block(300, 316, 18, 19); block(296, 299, 19, 19); // the dais and its step
  ent('deco', 309, 17, { kind: 'throne' });
  ent('gqueen', 308, 17);
  plat(214, 14, 80);                            // the gallery
  ent('archer', 230, 13, { face: 1 }); ent('archer', 256, 13, { face: 1 }); ent('archer', 282, 13, { face: 1 });
  for (const x of [222, 256, 290]) ent('support', x, 19, { top: 14 });
  for (const x of [218, 244, 268, 294]) ent('deco', x, 13, { kind: 'hallWindow' });
  ent('deco', 234, 19, { kind: 'banner', v: 0 }); ent('deco', 278, 19, { kind: 'banner', v: 1 });
  for (const x of [212, 240, 270]) ent('torch', x, 19);
  ent('sign', 211, 19, { text: 'THE QUEEN. SHE HAS NEVER FOUGHT ALONE. WHERE SHE POINTS, THE GALLERY LOOSES: BRING THE GALLERY DOWN ON HER, IT STANDS ON THREE PILLARS. SHE WILL NOT STAY IN HER CHAIR, AND IF SHE GOES FOR THE ROOF, THE STORM IS UP THERE.' });
  // the roof: three peaks with an iron rod on each, and a step up to each
  block(222, 226, 4, 7); block(262, 266, 4, 7); block(300, 304, 4, 7);
  plat(219, 6, 3); plat(227, 6, 3); plat(259, 6, 3); plat(267, 6, 3); plat(297, 6, 3); plat(305, 6, 3);
  ent('rod', 224, 3); ent('rod', 264, 3); ent('rod', 302, 3);

  const interiors = [[124, 206, 10, 63, 'stone'], [208, 316, 10, 19, 'stone']];
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 1, y: 63 }, pools: [], falls: [], moversExtra: [], interiors,
    reachExact: true, // the carts are the Forgemaster's props, not a way around the castle
    duskStart: -1, duskLen: 1, music: 'highcrown', night: true, glowNight: true, nightA: 0.3,
    quest: { n: 3, item: 'seal', name: 'ROYAL SEALS', npc: 'squire', done: 'HER ORDERS MEAN NOTHING NOW', reward: 'relic', relic: 'banner' },
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'none', haze: 'rgba(150,140,190,0.14)',
      grass: '#8a8a98', grassL: '#a8a8b8', grassD: '#5a5a66', dirt: '#4a4a58', dirtL: '#5e5e6c', dirtD: '#32323c',
      canopy: ['#2a2a38', '#3a3a4a', '#4a4a5c', '#5a5a6e'] },
    weather: [{ x0: 0, x1: 123 * TS, kind: 'snow' }], ambient: [{ x0: 0, x1: 123 * TS, kind: 'wind' }],
    alarms: [
      { id: 'ward', gates: [[102, 58, 63]], garrison: [{ t: 'brute', x: 96, y: 63 }, { t: 'shield', x: 92, y: 63 }, { t: 'sprig', x: 98, y: 63 }] },
      { id: 'hall', gates: [[182, 54, 63]], garrison: [{ t: 'pike', x: 150, y: 63 }, { t: 'pike', x: 158, y: 63 }, { t: 'shield', x: 144, y: 63 }] },
      { id: 'chapel', gates: [[160, 10, 19]], garrison: [{ t: 'pike', x: 172, y: 19 }, { t: 'brute', x: 182, y: 19 }, { t: 'archer', x: 146, y: 13 }] },
    ],
    mini: { x0: 126 * TS, x1: 198 * TS, floor: 40 * TS, trigger: 134 * TS, wallL: 125, gate: 199, boss: 'forgemaster', y0: 26 * TS, y1: 41 * TS, slag: [140 * TS + 8, 158 * TS + 8, 180 * TS + 8] },
    arena: { x0: 208 * TS, x1: 316 * TS, floor: 20 * TS, trigger: 214 * TS, wallL: 207, wallR: 317, boss: 'gqueen', music: 'queen', tint: '#5a2a7a', tintA: 0.08, fx: 'dust',
      roof: 8 * TS, gallery: { row: 14, x0: 214, x1: 293 }, hole: { x0: 255, x1: 258, y0: 8, y1: 9 }, rubble: [[250, 17, 4], [255, 15, 4], [250, 13, 4], [255, 11, 4], [255, 9, 4]] },
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
    duskStart: -1, duskLen: 1, music: 'select', night: true, shop: true, interiors: [[2, 37, 13, 19, 'stone']],
    // No `stone` zone here. It used to carry one to mark the room as stone-dressed, but since the menhirs
    // became single organic sprites drawn OVER cleared tiles, a zone the size of the whole shop blanked
    // its floor and walls and left the keeper standing in the dark. palette.hall already dresses it.
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

// ---------- Level 9. GALE MOOR: the high moor above the mine. The wind is the verb: it carries you, it pins you, it lifts you. ----------
function galeMoor() {
  const L = painter(908, 30);
  const { block, floor, plat, spikes, ent, coins, set } = L;
  const movers = [], gusts = [], pools = [], hags = [], stone = [];
  // a standing stone never walls off the walk: you pass in front of it, and only its crown is a ledge to land on
  const menhir = (x, y0, y1) => { set(x, y0, T.ONEWAY); stone.push([x, x, y0, y1]); };
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.PLANK); };
  const ladder = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET); };

  // ---- 1. THE MOOR GATE: heather, standing stones, the last still air before the causeway ----
  floor(0, 40, 22);
  ent('sign', 4, 21, { text: 'GALE MOOR. THE WIND OWNS THIS GROUND. THE FLAGS SHOW IT COMING: JUMP INTO A GUST AND IT CARRIES YOU FURTHER THAN YOUR LEGS CAN. THE UPDRAFTS LIFT YOU. THE HARES RUN WITH IT.' });
  ent('npc', 9, 21, { kind: 'squire' }); ent('flagpost', 14, 21); ent('deco', 20, 21, { kind: 'stone', v: 0 }); ent('deco', 30, 21, { kind: 'cairn' }); ent('flagpost', 34, 21);
  ent('hare', 26, 21, { face: 1 }); coins([12, 20], [18, 19], [24, 20]);
  ent('check', 38, 21);

  // ---- 2. THE CAUSEWAY: posts and planks over the bog. The gaps are longer than a jump; the gusts make up the rest. Stand still in the bog and it stands up. ----
  block(40, 111, 25, 29); pools.push({ x0: 41 * TS, x1: 111 * TS, y: 24 * TS + 4, shallow: true, depth: 12 }); hags.push({ x0: 41 * TS, x1: 111 * TS });
  for (const [x0, x1] of [[41, 47], [52, 57], [62, 67], [72, 77], [82, 87], [92, 97], [102, 110]]) { plank(x0, x1, 21); ent('deco', x0, 20, { kind: 'fence', v: 0 }); }
  gusts.push({ x0: 40 * TS, x1: 112 * TS, y0: 8 * TS, y1: 24 * TS, dir: 1, period: 5, on: 2.2, phase: 0, moor: true, k: 1.5 });
  ent('flagpost', 44, 20); ent('flagpost', 76, 20); ent('flagpost', 108, 20);
  ent('kite', 62, 11); ent('kite', 92, 11); ent('sign', 42, 20, { text: 'THE CAUSEWAY. WAIT FOR THE GUST, THEN JUMP. THE BOG BELOW IS SLOW, AND SOMETHING IN IT DOES NOT LIKE A STANDING MAN.' });
  coins([50, 18], [60, 17], [70, 18], [80, 17], [90, 18], [100, 18]);

  // ---- 3. THE STONE CIRCLE: the wind spins round the ring, every gust the other way. The silver is on the centre stone. ----
  floor(111, 150, 22);
  menhir(116, 19, 21); menhir(144, 19, 21); menhir(130, 17, 21); ent('silver', 130, 16); ent('vent', 126, 21, { period: 4, on: 2.4, h: 100, wind: true });
  for (const x of [120, 124, 136, 140]) ent('deco', x, 21, { kind: 'stone', v: x % 3 });
  gusts.push({ x0: 112 * TS, x1: 149 * TS, y0: 8 * TS, y1: 23 * TS, dir: 1, period: 2.8, on: 1.3, phase: 0.4, alt: true, moor: true, k: 1.2 });
  ent('flagpost', 118, 21); ent('flagpost', 142, 21); ent('hare', 122, 21, { face: 1 }); ent('hare', 138, 21, { face: -1 });
  ent('sign', 112, 21, { text: 'THE CIRCLE. THE WIND GOES ROUND THE STONES, ONE WAY AND THEN THE OTHER. THE UPDRAFT BY THE CENTRE STONE, AND THE RIGHT GUST, PUT YOU ON TOP OF IT.' });
  coins([118, 20], [123, 19], [127, 18], [134, 18], [138, 19], [147, 20]);
  ent('check', 148, 21);

  // ---- 4. THE BOTHY: the lee of the hill. Still air, a warm door, and Tam, who goes no higher. ----
  floor(150, 180, 22);
  ent('deco', 158, 21, { kind: 'bothy' }); ent('npc', 164, 21, { kind: 'squire', bothy: true }); ent('torch', 161, 21); ent('deco', 172, 21, { kind: 'fence', v: 1 });
  ent('sign', 153, 21, { text: 'THE LEE OF THE HILL. NO WIND HERE. THE SHEPHERD\'S CHILDREN LOST THREE KITES ON THE FIELD AHEAD, UP ON THE POSTS. THE WIND WILL LIFT YOU TO THEM.' });
  ent('check', 176, 21); coins([156, 20], [168, 20]);

  // ---- 5. THE KITE FIELD: goblins hang from box kites and drop stones. Three lost kites on tall posts, reached on the updrafts. ----
  floor(180, 240, 22);
  gusts.push({ x0: 180 * TS, x1: 240 * TS, y0: 4 * TS, y1: 23 * TS, dir: 1, period: 6, on: 2.4, phase: 2, moor: true, k: 1.3 });
  menhir(190, 15, 21); ent('stray', 190, 14, { kind: 'kite' }); ent('vent', 186, 21, { period: 5, on: 3, h: 120, wind: true });
  menhir(212, 13, 21); ent('stray', 212, 12, { kind: 'kite' }); ent('vent', 208, 21, { period: 5, on: 3, h: 150, wind: true, phase: 1.5 });
  menhir(232, 16, 21); ent('stray', 232, 15, { kind: 'kite' }); ent('vent', 228, 21, { period: 5, on: 3, h: 110, wind: true, phase: 3 });
  ent('kite', 197, 10); ent('kite', 220, 9); ent('kite', 236, 11); ent('harpy', 224, 7);
  for (let x = 200; x <= 205; x++) set(x, 22, 0); block(200, 205, 24, 29); pools.push({ x0: 200 * TS, x1: 206 * TS, y: 22 * TS + 4, shallow: true, depth: 12 }); hags.push({ x0: 200 * TS, x1: 206 * TS });
  ent('flagpost', 184, 21); ent('flagpost', 216, 21); ent('hare', 226, 21, { face: -1 }); ent('sailer', 202, 21, { face: -1 }); ent('sailer', 234, 21, { face: -1 });
  ent('sign', 181, 21, { text: 'THE KITE FIELD. THE GOBLINS HANG UNDER THE KITES AND DROP STONES. CUT THE STRING OR THE GOBLIN AND DOWN THEY BOTH COME. THE LOST KITES ARE ON THE POSTS.' });
  coins([188, 19], [194, 17], [210, 16], [217, 19], [230, 18], [237, 19]);
  ent('check', 238, 21);

  // ---- 6. THE RIDGE RUN: the wind against you the whole way up. The updrafts by each step are the only way to make ground. ----
  block(240, 252, 22, 29); block(253, 264, 20, 29); block(265, 276, 18, 29); block(277, 288, 16, 29); block(289, 300, 14, 29);
  gusts.push({ x0: 240 * TS, x1: 301 * TS, y0: 4 * TS, y1: 23 * TS, dir: -1, period: 6, on: 3.2, phase: 1, moor: true, k: 1.1 });
  ent('vent', 250, 21, { period: 4, on: 2.6, h: 80, wind: true }); ent('vent', 262, 19, { period: 4, on: 2.6, h: 80, wind: true, phase: 1 }); ent('vent', 274, 17, { period: 4, on: 2.6, h: 80, wind: true, phase: 2 }); ent('vent', 286, 15, { period: 4, on: 2.6, h: 80, wind: true, phase: 3 });
  ent('harpy', 262, 8); ent('harpy', 286, 5); ent('hare', 270, 17, { face: -1 }); ent('hare', 294, 13, { face: -1 }); ent('sailer', 258, 19, { face: 1 }); ent('sailer', 282, 15, { face: 1 });
  ent('flagpost', 246, 21); ent('flagpost', 282, 15);
  ent('sign', 242, 21, { text: 'THE RIDGE. THE WIND COMES DOWN IT AND WILL NOT LET YOU UP. WAIT BY AN UPDRAFT FOR THE LULL, RIDE IT, AND RUN FOR THE NEXT.' });
  coins([248, 20], [258, 18], [268, 16], [280, 14], [292, 12], [298, 12]);
  ent('check', 298, 13);

  // ---- 7. THE HOWLING GAP: the ridge ends at a chasm. Five standing stones rise out of the bog, and between them the air goes UP: step off into a gap, the updraft lifts you, the gust carries you to the next stone. ----
  floor(301, 306, 14);
  block(307, 365, 27, 29); pools.push({ x0: 307 * TS, x1: 366 * TS, y: 26 * TS + 4, shallow: true, depth: 12 }); hags.push({ x0: 307 * TS, x1: 366 * TS });
  const pillar = (x, top, bottom = 26) => { set(x, top, T.ONEWAY); set(x + 1, top, T.ONEWAY); stone.push([x, x + 1, top, bottom]); };
  pillar(312, 14); pillar(322, 12); pillar(334, 15); pillar(346, 11); pillar(358, 13);
  floor(366, 396, 14);
  for (const [x, h, w] of [[309, 230, 40], [318, 260, 64], [329, 220, 80], [341, 290, 80], [353, 250, 80], [363, 240, 48]]) ent('vent', x, 26, { period: 100, on: 100, h, wind: true, w }); // the whole gap is an updraft: the bog is a delay, never a trap
  gusts.push({ x0: 300 * TS, x1: 366 * TS, y0: 2 * TS, y1: 26 * TS, dir: 1, period: 5, on: 2.2, phase: 0, moor: true, k: 1.5 });
  ent('flagpost', 304, 13); ent('flagpost', 335, 14); ent('flagpost', 368, 13);
  ent('harpy', 330, 6); ent('harpy', 350, 4);
  ent('sign', 302, 13, { text: 'THE HOWLING GAP. THE STONES STAND IN THE BOG, AND THE AIR BETWEEN THEM GOES UP. STEP OFF INTO A GAP: THE UPDRAFT LIFTS YOU, THE GUST CARRIES YOU ON. DO NOT STAND STILL DOWN THERE.' });
  ent('silver', 346, 10); coins([313, 12], [323, 10], [335, 13], [347, 9], [359, 11], [318, 18], [341, 16], [353, 17]);
  ent('check', 368, 13);

  // ---- 8. THE GALLERY OF GUSTS: ledges over the thorns, the wind turning every three breaths. Jump with it and you fly; against it you fall short. A tall stone at the end, and an updraft to get over it. ----
  block(397, 423, 15, 29); spikes(397, 423, 14);
  for (const x of [402, 413]) plat(x, 12, 6); // six tiles between each: only the tailwind gets you there. Let go of the stick over the ledge or it carries you past.
  floor(424, 476, 14); pillar(430, 8, 13);
  ent('vent', 427, 13, { period: 4, on: 2.2, h: 150, wind: true, w: 20 });
  gusts.push({ x0: 380 * TS, x1: 440 * TS, y0: 2 * TS, y1: 15 * TS, dir: 1, period: 3, on: 1.4, phase: 0, alt: true, moor: true, k: 1.4 });
  ent('flagpost', 386, 13); ent('flagpost', 404, 11); ent('flagpost', 425, 13); ent('hare', 390, 13, { face: 1 }); ent('harpy', 405, 5);
  ent('sign', 382, 13, { text: 'THE GALLERY. THE WIND TURNS EVERY THREE BREATHS. JUMP WITH IT AND YOU FLY; AGAINST IT YOU FALL IN THE THORNS. THE STONE AT THE END: RIDE THE UPDRAFT OVER IT.' });
  coins([404, 10], [415, 10], [427, 8], [430, 7], [434, 12]);
  ent('check', 436, 13);

  // ---- 9. THE WHISTLE STONES: the moor asks for everything it taught you at once. Four tall stones
  // over the thorns with an updraft in every gap and a wind that turns, so each crossing is
  // lift, then carry, then land - and the harpies work the gaps because they know you cannot stop. ----
  block(437, 508, 15, 29); spikes(437, 508, 14);
  floor(437, 444, 14);
  const whistle = (x, top) => { pillar(x, top, 14); ent('flagpost', x, top - 1); }; // down through the thorns to the ground (it stood on the thorn tops, a tile in the air)
  whistle(448, 9); whistle(464, 6); whistle(480, 10); whistle(496, 7);
  for (const [x, h] of [[456, 190], [472, 210], [488, 180], [502, 200]]) ent('vent', x, 13, { period: 100, on: 100, h, wind: true, w: 26 });
  gusts.push({ x0: 444 * TS, x1: 508 * TS, y0: 0, y1: 14 * TS, dir: 1, period: 3.6, on: 1.6, phase: 0, alt: true, moor: true, k: 1.45 });
  ent('sign', 439, 13, { text: 'THE WHISTLE STONES. THE AIR GOES UP IN EVERY GAP AND THE WIND TURNS EVERY FEW BREATHS. STEP OFF, LET IT LIFT YOU, AND LET THE GUST DO THE CARRYING. THERE IS NOTHING UNDER YOU BUT THORNS.' });
  ent('harpy', 456, 3); ent('harpy', 488, 2); ent('kite', 472, 4);
  ent('sailer', 442, 13, { face: 1 }); ent('hare', 504, 13, { face: -1 });
  coins([448, 8], [464, 5], [480, 9], [496, 6], [456, 4], [488, 3]);
  ent('silver', 464, 5);
  floor(504, 548, 14); ent('check', 506, 13);

  // ---- 9. THE FLAG ROAD: the last walk to the summit. Stones, hares, and the flags all pointing one way. ----
  for (const [x, top] of [[538, 10], [543, 12]]) pillar(x, top, 13);
  ent('deco', 516, 13, { kind: 'cairn' }); ent('deco', 528, 13, { kind: 'stone', v: 1 }); ent('flagpost', 513, 13); ent('flagpost', 532, 13);
  ent('hare', 540, 13, { face: 1 }); ent('harpy', 530, 4);
  gusts.push({ x0: 510 * TS, x1: 536 * TS, y0: 4 * TS, y1: 14 * TS, dir: 1, period: 3.4, on: 1.5, phase: 0, alt: true, moor: true, k: 1.3 });
  coins([518, 12], [530, 12]);
  gusts.push({ x0: 512 * TS, x1: 548 * TS, y0: 2 * TS, y1: 15 * TS, dir: 1, period: 6, on: 2, phase: 1, moor: true, k: 1.2 });
  ent('sign', 514, 13, { text: 'THE FLAG ROAD. THE FLAGS ALL POINT ONE WAY: OVER THE MILLS, ACROSS THE TUMBLE, TO THE KITE POST AT THE EDGE OF THE SKY. THE SHAMAN WAITS ON THE SUMMIT BEYOND IT.' });
  coins([518, 12], [524, 9], [530, 12], [536, 8], [544, 10]); ent('check', 546, 13);

  // ---- 10. THE MILLS: an old stone mill at the edge of a bog gully, and two more beyond it. The wind turns
  // the sails, and turns them back when it turns: ride a sail up and over and step off at the top. ----
  floor(548, 557, 14);
  block(558, 590, 24, 29); pools.push({ x0: 558 * TS, x1: 591 * TS, y: 23 * TS + 4, shallow: true, depth: 12 }); // (no bog-wights under the mills: the sails are hard enough)
  ladder(558, 558, 14, 23); // a rope ladder up the near bank for anyone the gully takes
  plat(560, 12, 2);
  for (const hx of [566, 575, 584]) for (let i = 0; i < 4; i++) movers.push({ kind: 'wheel', mill: true, first: i === 0, towerH: 14 * TS, px: hx * TS + 8, py: 9 * TS, r: 42, phase: i * Math.PI / 2, period: 6, x: 0, y: 0, w: 40, h: 6 }); // broad sails: riding a turning wheel is the whole test
  floor(591, 600, 14);
  gusts.push({ x0: 548 * TS, x1: 600 * TS, y0: 2 * TS, y1: 24 * TS, dir: 1, period: 4.6, on: 2.8, phase: 0, alt: true, moor: true, k: 0.35 }); // it turns the sails; it barely touches you
  ent('sign', 549, 13, { text: 'THE MILLS. THE WIND TURNS THE SAILS, AND WHEN THE WIND TURNS SO DO THEY. RIDE A SAIL UP AND STEP OFF AT THE TOP. THE GULLY IS ONLY BOG: THE LADDER BY THE BANK GETS YOU OUT.' });
  ent('check', 552, 13); ent('flagpost', 555, 13); ent('flagpost', 594, 13);
  coins([561, 11], [566, 6], [575, 6], [584, 6], [570, 22], [571, 22], [580, 22], [581, 22]);

  // ---- 11. THE TUMBLE: the last open moor, heather bales the wind rolls at you, and hornblowers on the
  // mounds who wind their horns at you as you come. (The mounds are steps, never walls.) ----
  floor(600, 650, 14);
  block(612, 615, 12, 13); block(630, 634, 12, 13); block(642, 644, 13, 13);
  ent('horn', 613, 11, { face: -1 }); ent('horn', 631, 11, { face: -1 });
  for (const x of [604, 622, 640]) ent('bale', x, 13, { x0: 600, x1: 650 });
  ent('hare', 626, 13, { face: -1 });
  gusts.push({ x0: 600 * TS, x1: 650 * TS, y0: 2 * TS, y1: 14 * TS, dir: -1, period: 5, on: 2.6, phase: 1, alt: true, moor: true, k: 1 });
  ent('sign', 601, 13, { text: 'THE TUMBLE. THE WIND ROLLS THE CUT HEATHER ABOUT UP HERE, AND A BALE AT FULL TILT WILL PUT YOU ON YOUR BACK: JUMP IT OR CUT IT. THE HORNBLOWERS ON THE MOUNDS BLOW YOU BACK TOWARD THEM.' });
  ent('check', 603, 13); ent('flagpost', 608, 13); ent('flagpost', 637, 13); ent('deco', 620, 13, { kind: 'cairn' });
  coins([606, 11], [613, 9], [620, 11], [631, 9], [638, 11], [646, 12]);

  // ---- 12. THE KITE POST: the edge of the moor, a wall of stone, and past it nothing but air. The shepherds'
  // great kite is tethered here. ----
  floor(650, 663, 14); block(664, 665, 5, 29);
  ent('stormkite', 659, 13);
  ent('sign', 652, 13, { text: 'THE KITE POST. PAST THE WALL IS THE SKY ROAD TO THE SUMMIT, AND THE ONLY WAY DOWN IT IS UNDER THE GREAT KITE. TAKE HOLD: THE ARROWS STEER, THE ROLL IS A DART. IT DOES NOT WAIT FOR YOU.' });
  ent('check', 655, 13); ent('flagpost', 662, 13);

  // ---- 13. THE SKY ROAD: the kite carries you down the wind to the summit - through the teeth of the crags,
  // the crow strings, the needle and the storm. The view does not wait. ----
  block(666, 859, 26, 29); spikes(666, 859, 25);
  const spire = (x, top) => { block(x, x + 1, top, 25); stone.push([x, x + 1, top, 25]); }, crag = (x, bot) => { block(x, x + 1, 0, bot); stone.push([x, x + 1, 0, bot]); };
  const rock = (x0, x1, y0, y1) => { block(x0, x1, y0, y1); stone.push([x0, x1, y0, y1]); }; // loose stone in the air, not grass
  const string = (x, y, n, gap, o) => { for (let i = 0; i < n; i++) ent('crow', x + i * gap, y, Object.assign({ ph: i * 0.7 }, o || {})); };
  const ribbon = (x0, x1, y, amp) => { for (let x = x0; x <= x1; x += 2) coins([x, Math.round(y + Math.sin((x - x0) * 0.35) * amp)]); };
  // everything out here stands on the gorge floor: nothing hangs in the air (Daniel: no floating rocks)
  const tower = (x0, x1, top) => { block(x0, x1, top, 25); stone.push([x0, x1, top, 25]); };
  // the teeth: spires of every height, so you go over the short ones low and the tall ones high
  spire(704, 13); spire(709, 8); spire(714, 11); spire(719, 7); spire(724, 13); spire(729, 9); spire(734, 11);
  // the flock, among the stacks
  tower(742, 744, 11); tower(748, 749, 15); tower(756, 758, 12);
  string(746, 7, 4, 2); string(754, 9, 4, 2); string(764, 5, 3, 3, { amp: 18 });
  // the organ pipes: tall stacks shoulder to shoulder - you skim along over their tops
  for (const [x, top] of [[766, 10], [770, 8], [774, 10], [778, 7], [782, 9], [786, 7], [790, 10]]) tower(x, x + 1, top);
  string(784, 5, 3, 2, { amp: 3 });
  // the storm: the shaman's weather, bolts out of the cloud on a beat
  for (const [x, ph] of [[803, 0], [811, 1.1], [819, 2.2], [827, 0.5], [846, 1.6]]) ent('skybolt', x, 18, { top: 2, period: 3.2, phase: ph });
  tower(806, 807, 12); tower(820, 822, 11); tower(838, 839, 9); spire(850, 14);
  ent('harpy', 810, 5); ent('harpy', 832, 4); ent('kite', 800, 5); ent('kite', 828, 6);
  string(815, 9, 4, 2); string(840, 12, 5, 2, { amp: 14 });
  ribbon(670, 700, 10, 3); ribbon(736, 741, 9, 1); ribbon(766, 792, 5, 1); ribbon(852, 858, 8, 2);
  gusts.push({ x0: 666 * TS, x1: 860 * TS, y0: 0, y1: 26 * TS, dir: -1, period: 7, on: 1.8, phase: 2, moor: true, k: 0.8 });

  // ---- 14. THE SUMMIT: three standing stones and two ledges in a ring of thorns. The shaman blinks between
  // them and throws the sky at you. The kite's string goes over the near edge and puts you down on it. ----
  block(860, 907, 13, 29);
  pillar(866, 12, 12); pillar(868, 10, 12); pillar(882, 4, 12); pillar(897, 8, 12);
  plat(875, 7, 2); plat(890, 6, 2);
  ent('vent', 878, 12, { period: 100, on: 100, h: 108, wind: true, w: 18 }); ent('vent', 893, 12, { period: 100, on: 100, h: 94, wind: true, w: 18 }); // always on: the question is never WHEN, only where
  gusts.push({ x0: 861 * TS, x1: 906 * TS, y0: 0, y1: 13 * TS, dir: 1, period: 5, on: 2.2, phase: 0, alt: true, moor: true, k: 1.5, arena: true });
  ent('flagpost', 865, 12); ent('flagpost', 901, 12);
  ent('windcaller', 882, 3);
  ent('sign', 870, 12, { text: 'THE SHAMAN OF THE MOOR. HE BLINKS FROM STONE TO STONE AND THROWS THE SKY AT YOU. STRIKE A BOLT, OR TAKE IT ON YOUR SHIELD, AND IT GOES BACK AT HIM AND KNOCKS HIM OFF HIS STONE. EVERY THIRD TIME HE COMES DOWN TO THE GROUND TO GATHER SOMETHING BIG: THAT IS YOUR MOMENT.' });
  ent('check', 864, 12); ent('gate', 905, 12);
  const roosts = [[868, 9], [882, 3], [897, 7], [875, 6], [890, 5]]; // where he stands: a stone's top, a ledge
  for (const e of L.ents) if (e.t === 'vent' && e.wind) { e.h = Math.round((e.h || 112) * 1.5); e.lift = 270; } // the moor's wind lifts you well clear of whatever it is meant to lift you onto

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 }, pools, falls: [], moversExtra: movers, gusts, hags, stone, roosts, thermals: true,
    duskStart: -1, duskLen: 1, music: 'adventure', night: false, glowNight: false,
    palette: { sky: [[126, 148, 182], [214, 220, 214]], far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(200,210,220,0.18)', grass: '#7a8a3a', grassL: '#a8b84a', grassD: '#4a5a2a', dirt: '#5a5040', dirtL: '#6e6450', dirtD: '#3a3228', canopy: ['#5a6a7a', '#7a8a9a', '#9aa8b8', '#c8d0d8'] },
    quest: { n: 3, item: 'kite', name: 'KITE', npc: 'squire', done: 'THE KITES ARE HOME', reward: 'relic', relic: 'windcloak' },
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }, { x0: 476 * TS, x1: 548 * TS, kind: 'mist' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 861 * TS, x1: 905 * TS, floor: 13 * TS, trigger: 868 * TS, wallL: 860, wallR: 906, boss: 'windcaller', music: 'boss2', tint: '#bfe6f5', tintA: 0.06, fx: 'dust' },
    flight: { x1: 864, speed: 78, camY: 2, down: [] }, // the Sky Road: the kite lets go over the summit's near edge
  };
}

// MORE GOLD. Every real wood runs this after it is built: it finds the long walkable stretches that pay
// too little for their length and lays small arcs of coins along them - never on a boss floor, never
// in water, never on top of a sign, a door, a gate or a friend, never inside anything solid, and the
// same arcs every time. A stretch that already has its share of coin is left as it is.
function sprinkleCoins(L) {
  const W = L.W, H = L.H, g = L.grid;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const stand = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.REED || t === T.CRYST;
  // a boss room is a box, not a column: the Sunspire's roof arena spans the whole mountain's width
  const rooms = [L.arena, L.mini].filter(Boolean).map(A => [A.x0 / TS - 1, A.x1 / TS + 1, (A.y0 !== undefined ? A.y0 / TS : A.floor / TS - 16) - 1, A.floor / TS + 1]);
  const wet = (x, y) => (L.pools || []).some(p => x * TS >= p.x0 && x * TS <= p.x1 && y * TS + 8 > p.y - 2); // over the water is fine, in it is not
  // a wading floor: lift its coin to just over the water, if a jump from the bottom still reaches it
  const dry = ([x, y]) => { const p = (L.pools || []).find(p => x * TS >= p.x0 && x * TS <= p.x1 && y * TS + 8 > p.y - 2); if (!p) return [x, y];
    const ny = Math.floor((p.y - 10) / TS); return y - ny <= 3 && at(x, ny) === T.AIR ? [x, ny] : [x, y]; };
  // a coin placed by hand inside a ledge or a wall is lifted to the first open space above it
  for (const e of L.ents) if (e.t === 'coin') { let n = 0; while (at(e.x, e.y) !== T.AIR && e.y > 1 && n++ < 4) e.y--; }
  const coins = new Set(L.ents.filter(e => e.t === 'coin').map(e => e.x + ',' + e.y));
  const FIXED = new Set(['sign', 'check', 'npc', 'doorway', 'gate', 'lockgate', 'key', 'stray', 'silver', 'relic', 'shrine', 'cage', 'lever', 'vent', 'torch', 'brazier', 'lantern', 'mover', 'nest']);
  const keep = L.ents.filter(e => FIXED.has(e.t)); // things that stay put; a foe walks away from its gold
  const busy = (x, y) => keep.some(e => Math.abs(e.x - x) <= 2 && Math.abs(e.y - y) <= 2);
  // and only where you can get to it: the reach fill says so for any level it can model whole (a roof
  // with no way up is not a place to put gold); a level that leans on movers can fence its own off in L.noCoin
  const R = floodReach(L, T), gettable = (x, y) => R.assisted || R.jumpNear(x, y);
  const fenced = (x, y) => (L.noCoin || []).some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d);
  const free = (x, y) => at(x, y) === T.AIR && !coins.has(x + ',' + y) && !busy(x, y) && !wet(x, y) && !rooms.some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d) && gettable(x, y) && !fenced(x, y);
  const before = coins.size; let added = 0; const cap = Math.min(200, Math.max(150, Math.round(before * 1.6))); // a lot more gold: there should always be some in sight
  // the ground as you walk it: follow the surface through steps of up to three rows (a jump), and lay a pair
  // every seven tiles or so where there is none near (the rolling woods have almost no flat runs at all)
  const paths = [];
  { const foot = (x, y) => stand(at(x, y + 1)) && !solid(at(x, y)) && at(x, y) !== T.SPIKE && !solid(at(x, y - 1)) && at(x, y + 1) !== T.CRYST;
    const used = new Set(), near = (x, y) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -2; dy <= 2; dy++) if (coins.has((x + dx) + ',' + (y + dy))) return true; return false; };
    for (let x = 0; x < W && added < cap; x++) for (let y = 1; y < H - 1 && added < cap; y++) {
      if (!foot(x, y) || used.has(x + ',' + y)) continue;
      const path = [[x, y]]; used.add(x + ',' + y); let cx = x, cy = y;
      for (;;) { let ny = null; for (const dy of [0, -1, 1, -2, 2, -3, 3]) if (foot(cx + 1, cy + dy) && !used.has((cx + 1) + ',' + (cy + dy))) { ny = cy + dy; break; } if (ny === null) break; cx++; cy = ny; path.push([cx, cy]); used.add(cx + ',' + cy); }
      if (path.length < 8) continue;
      // pairs and threes by turns, every three steps: a trail you can follow with your eyes
      for (let i = 2, n = 0; i < path.length - 3 && added < cap; i += 3, n++) { const pts = [path[i], path[i + 1]];
        if (n % 2 && path[i + 2][1] === path[i][1] && path[i + 1][1] === path[i][1]) pts.splice(1, 1, [path[i + 1][0], path[i + 1][1] - 1], path[i + 2]);
        for (let k = 0; k < pts.length; k++) pts[k] = dry(pts[k]);
        if (pts.some(([px, py]) => near(px, py) || !free(px, py))) continue;
        for (const [px, py] of pts) { L.ents.push({ t: 'coin', x: px, y: py }); coins.add(px + ',' + py); added++; } }
      paths.push(path); } }
  // HOP ARCS: over open, flat ground with room above it, three coins in the air where a jump would take
  // you - so the walk between things is also a line of little jumps worth making
  { const clear = (x, y) => at(x, y) === T.AIR && !coins.has(x + ',' + y);
    const nearA = (x, y) => { for (let dx = -2; dx <= 2; dx++) for (let dy = -1; dy <= 4; dy++) if (coins.has((x + dx) + ',' + (y - dy))) return true; return false; };
    for (const path of paths) for (let i = 4; i < path.length - 4 && added < cap; i += 7) { const [cx, cy] = path[i];
      if (path[i - 1][1] !== cy || path[i + 1][1] !== cy) continue;
      let room = true; for (let dx = -1; dx <= 1 && room; dx++) for (let dy = 1; dy <= 4; dy++) if (!clear(cx + dx, cy - dy)) { room = false; break; }
      if (!room || nearA(cx, cy)) continue;
      const pts = [[cx - 1, cy - 2], [cx, cy - 3], [cx + 1, cy - 2]];
      if (!pts.every(([px, py]) => free(px, py))) continue;
      for (const [px, py] of pts) { L.ents.push({ t: 'coin', x: px, y: py }); coins.add(px + ',' + py); added++; } } }
  for (let y = 2; y < H - 1 && added < cap; y++) {
    let x0 = -1;
    for (let x = 0; x <= W && added < cap; x++) {
      const ok = x < W && stand(at(x, y + 1)) && !solid(at(x, y)) && at(x, y) !== T.SPIKE && !solid(at(x, y - 1)) && at(x, y + 1) !== T.CRYST;
      if (ok && x0 < 0) x0 = x;
      if (ok || x0 < 0) continue;
      const x1 = x - 1, len = x1 - x0 + 1; x0 = -1;
      if (len < 6) continue;
      let have = 0; for (let k = x1 - len + 1; k <= x1; k++) for (let dy = 0; dy <= 3; dy++) if (coins.has(k + ',' + (y - dy))) have++;
      const want = Math.floor(len / 5) - have; if (want <= 0) continue;
      // arcs of three: low, high, low - the height of a hop, so they read as a line to run and jump along
      for (let a = 0, cx = x1 - len + 1 + 3; a < want && cx + 2 <= x1 - 2 && added < cap; cx += Math.max(5, Math.floor(len / (want + 1)))) {
        const pts = [[cx, y], [cx + 1, y - 1], [cx + 2, y]];
        if (!pts.every(([px, py]) => free(px, py))) continue;
        for (const [px, py] of pts) { L.ents.push({ t: 'coin', x: px, y: py }); coins.add(px + ',' + py); added++; }
        a++;
      }
    }
  }
  // gaps you jump: an arc of gold over the middle, where the jump goes anyway
  for (let y = 2; y < H - 2 && added < cap; y++) for (let x = 1; x < W - 6 && added < cap; x++) {
    if (!(stand(at(x, y + 1)) && !solid(at(x, y)))) continue;
    let gw = 0; while (gw < 5 && !stand(at(x + 1 + gw, y + 1)) && !solid(at(x + 1 + gw, y))) gw++;
    if (gw < 2 || gw > 4 || !stand(at(x + 1 + gw, y + 1)) || solid(at(x + 1 + gw, y))) continue;
    const mid = x + 1 + (gw >> 1), pts = gw >= 3 ? [[mid - 1, y - 1], [mid, y - 2], [mid + 1, y - 1]] : [[mid, y - 1], [mid, y - 2]];
    if (!pts.every(([px, py]) => free(px, py) && !solid(at(px, py - 1)))) continue;
    for (const [px, py] of pts) { L.ents.push({ t: 'coin', x: px, y: py }); coins.add(px + ',' + py); added++; }
    x += gw;
  }
  // short ledges with nothing on them get a pair
  for (let y = 2; y < H - 1 && added < cap; y++) { let x0 = -1;
    for (let x = 0; x <= W && added < cap; x++) {
      const t1 = at(x, y + 1), ok = x < W && (t1 === T.ONEWAY || t1 === T.PLANK || t1 === T.SHELF) && at(x, y) === T.AIR;
      if (ok && x0 < 0) x0 = x;
      if (ok || x0 < 0) continue;
      const x1 = x - 1, len = x1 - x0 + 1, s0 = x0; x0 = -1;
      if (len < 3 || len > 12) continue;
      let have = false; for (let k = s0; k <= x1; k++) for (let dy = 0; dy <= 2; dy++) if (coins.has(k + ',' + (y - dy))) have = true;
      if (have) continue;
      const m0 = s0 + (len >> 1) - 1, pts = [[m0, y], [m0 + 1, y]];
      if (!pts.every(([px, py]) => free(px, py))) continue;
      for (const [px, py] of pts) { L.ents.push({ t: 'coin', x: px, y: py }); coins.add(px + ',' + py); added++; }
    } }
  return L;
}
export const LEVELS = [
  { id: 'wood', name: 'BRACKEN WOOD', sub: 'forest and hive', build: brackenWood },
  { id: 'marsh', name: 'MARSH WOOD', sub: 'water and the frog', build: marshWood, needs: 'wood' },
  { id: 'stockade', name: 'THE STOCKADE', sub: 'the goblin camp', build: theStockade, needs: 'marsh' },
  { id: 'spore', name: 'SPOREWOOD', sub: 'the deep fungus', build: sporewood, needs: 'stockade' },
  { id: 'kings', name: 'KINGSWOOD', sub: 'the court under the leaves', build: kingswood, needs: 'spore' },
  { id: 'scree', name: 'THE SCREE PATH', sub: 'the foothills at dusk', build: screePath, needs: 'kings' },
  { id: 'hanging', name: 'THE HANGING VILLAGE', sub: 'the town on the cliff', build: hangingVillage, needs: 'scree' },
  { id: 'spire', name: 'THE SUNSPIRE', sub: 'the mountain of crystal', build: theSunspire, needs: 'hanging' },
  { id: 'moor', name: 'GALE MOOR', sub: 'the high moor', build: galeMoor, needs: 'spire' },
  { id: 'storm', name: 'STORMHOLD', sub: 'the last hold', build: stormhold, needs: 'moor' },
  { id: 'crown', name: 'HIGHCROWN', sub: 'the goblin queen\'s castle', build: highcrown, needs: 'storm' },
  { id: 'shop', name: 'THE STORE', sub: 'ask the keeper', build: theShop, hidden: true },
  { id: 'shopCrag', name: 'THE HIGH STORE', sub: 'ask the keeper', build: theShopCrag, hidden: true },
  { id: 'custom', name: 'YOUR WOOD', sub: 'made by hand', build: () => CUSTOM.build(), hidden: true },
];
// THE REVIEW PASS (2026-09-11). Each wood's fixes from the level review, laid on the finished level in its
// own final coordinates (some woods are grafted from several builders) before the gold and the dressing.
const rv = L => ({
  ent: (t, x, y, o) => L.ents.push({ t, x, y, ...(o || {}) }),
  coin: (x, y) => L.ents.push({ t: 'coin', x, y }),
  tile: (x, y, t) => { if (x >= 0 && y >= 0 && x < L.W && y < L.H) L.grid[y * L.W + x] = t; },
  plat: (x, y, w) => { for (let k = 0; k < w; k++) if (L.grid[y * L.W + x + k] === T.AIR) L.grid[y * L.W + x + k] = T.ONEWAY; },
});
const REVIEW = {
  // a checkpoint in the long run between the thorn cut and the high path
  wood: L => { const R = rv(L); R.ent('check', 119, 21); },
  // a checkpoint by the old stones, and lily pads over the two long shallows (hop them and you are across
  // before a wader is halfway), with gold on the way
  marsh: L => { const R = rv(L); R.ent('check', 163, 17); for (const x of [115, 118, 121, 124, 127, 465, 468, 471, 474]) { R.ent('pad', x, 17); R.coin(x, 15); } },
  // and its own light in every part of it, so the long fungus wood stops being one colour from end to end
  spore: L => { rv(L).ent('check', 330, 13);
    L.tints = [[0, 120, [120, 200, 90], 0.10], [120, 175, [210, 150, 80], 0.14], [175, 245, [150, 90, 200], 0.12], [245, 285, [220, 190, 120], 0.12], [285, 325, [120, 70, 170], 0.16], [325, 420, [80, 170, 180], 0.14], [420, 504, [200, 60, 150], 0.16]]; },
  // the court's long runs went a hundred and twenty tiles without a checkpoint
  kings: L => { const R = rv(L); R.ent('check', 105, 21); R.ent('check', 267, 20); },
  scree: L => { rv(L).ent('check', 330, 18); },
  // the sappers' tunnel was the busiest 38 tiles in the busiest level: the brute and one sapper go, and it is a
  // held breath between the walls instead of another fight
  stockade: L => { L.ents = L.ents.filter(e => !((e.t === 'brute' && e.x === 372 && e.y >= 21) || (e.t === 'sapper' && e.x === 368 && e.y >= 21))); },
  // a silver four rows over the street: a step up to it
  storm: L => { rv(L).plat(282, 28, 3); },
  // one spider in four goes: a fall off a climb should not land you in three more of them
  hanging: L => { let n = 0; for (let i = L.ents.length - 1; i >= 0; i--) { const e = L.ents[i]; if (e.t === 'spider' && !e.big && !e.mini && (n++ % 4) === 3) L.ents.splice(i, 1); } },
  // THE CLOUD CAMP: a foreman's tent and fire at the cloud line, and someone to tell you about the sun; and
  // goblins who break the glass, who see you on crystal and smash it out from under you
  spire: L => { const R = rv(L); R.ent('deco', 12, 99, { kind: 'tent', v: 0 }); R.ent('npc', 15, 99, { kind: 'foreman' }); R.ent('brazier', 17, 99);
    R.ent('sign', 20, 99, { text: 'THE CLOUD LINE. ABOVE IT THE SUN IS ON THE GLASS, AND EVERYTHING UP THERE HAPPENS FASTER: THE LEDGES CRACK SOONER, THE BREATHS COME QUICKER. REST HERE FIRST.' });
    R.ent('miner', 32, 195, { glass: true, face: -1 }); R.ent('miner', 24, 151, { glass: true, face: 1 }); },
  // the castle had the fewest foes of anywhere: a watch in the ward, a hall guard, the kitchens staffed. And THE
  // LEADS: from the choir loft up through a hatch onto the keep roof, a run along it with the whole mountain
  // below, and a second hatch down at the far end of the chapel
  crown: L => { const R = rv(L); R.ent('check', 62, 63);
    for (const [t, x, y, f] of [['sprig', 40, 63, -1], ['sprig', 76, 63, 1], ['pike', 110, 63, -1], ['shield', 140, 63, 1], ['sprig', 166, 63, -1], ['sprig', 190, 63, -1], ['hearthgob', 150, 51, 1], ['hearthgob', 186, 51, -1], ['sprig', 150, 19, 1]]) R.ent(t, x, y, { face: f });
    R.plat(149, 12, 3); R.plat(151, 10, 3);
    for (let x = 151; x <= 153; x++) { R.tile(x, 9, T.AIR); R.tile(x, 8, T.ONEWAY); }
    for (let x = 194; x <= 196; x++) { R.tile(x, 9, T.AIR); R.tile(x, 8, T.ONEWAY); }
    R.ent('sign', 156, 7, { text: 'THE LEADS. THE WHOLE MOUNTAIN IS UNDER YOU. THE HATCH AT THE FAR END DROPS YOU BACK INTO THE CHAPEL: DOWN AND JUMP.' });
    R.ent('deco', 170, 7, { kind: 'banner', v: 1 }); R.ent('deco', 182, 7, { kind: 'barrels' });
    // the armoury gantry's silver had no way up to it: ledges from the floor to the gantry, two rows at a time
    R.plat(129, 38, 3); R.plat(132, 36, 3); R.plat(134, 34, 2); R.plat(139, 31, 2); R.plat(146, 29, 2); },
};
// SET DRESSING. After the gold, every real wood gets its own things left about on its ground - hives and
// birdhouses in the wood, fish traps in the marsh, spear racks and tents in the camp, spore pods under the
// fungus, cairns and fences on the hills, barrels and lamp posts in the towns, the Queen's banners in her
// castle. Only on open ground with room over it, spaced out, never in a boss room, never on a sign, a door,
// a gate or a friend, and the same every time. (The per-100 dressing count was the thinnest number we had.)
const DRESS = {
  wood: [['beehive'], ['birdhouse'], ['trunk', 3], ['fence', 2], ['deadTree', 2], ['cairn'], ['stone', 3]],
  marsh: [['fishTrap', 2], ['lilyLantern'], ['deadTree', 2], ['fence', 2], ['barrels'], ['frogStatue', 1]],
  stockade: [['barrels'], ['spearRack'], ['skullPile', 2], ['tent', 2], ['cart'], ['bones', 2], ['banner', 2]],
  spore: [['sporePod'], ['rootDecor', 3], ['cobweb', 3], ['deadTree', 2], ['bones', 2]],
  kings: [['banner', 2], ['barrels'], ['lanternPost'], ['spearRack'], ['hangCage'], ['trunk', 3]],
  scree: [['stone', 3], ['cairn'], ['fence', 2], ['deadTree', 2], ['bones', 2]],
  hanging: [['lanternPost'], ['barrels'], ['birdhouse'], ['beehive']],
  spire: [['cairn'], ['bones', 2], ['stone', 3]],
  moor: [['stone', 3], ['cairn'], ['fence', 2], ['bones', 2], ['deadTree', 2]],
  storm: [['barrels'], ['lanternPost'], ['spearRack'], ['banner', 2], ['cart'], ['tent', 2]],
  crown: [['banner', 2], ['barrels'], ['spearRack'], ['lanternPost'], ['hangCage']],
};
function dressLevel(L, id) {
  const set = DRESS[id]; if (!set) return L;
  const W = L.W, H = L.H, g = L.grid, rnd = mulberryL(id.length * 977 + id.charCodeAt(0));
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const rooms = [L.arena, L.mini].filter(Boolean).map(A => [A.x0 / TS - 2, A.x1 / TS + 2, (A.y0 !== undefined ? A.y0 / TS : A.floor / TS - 16) - 1, A.floor / TS + 1]);
  const KEEP = new Set(['sign', 'check', 'npc', 'doorway', 'gate', 'lockgate', 'key', 'stray', 'silver', 'relic', 'shrine', 'cage', 'lever', 'vent', 'torch', 'brazier', 'lantern', 'mover', 'nest', 'deco', 'stormkite', 'winch', 'bell', 'weight', 'support', 'rod', 'felltree', 'sluice', 'crank', 'flagpost']);
  const keep = L.ents.filter(e => KEEP.has(e.t)).map(e => [e.x, e.y]);
  const placed = [];
  const clear = (x, y) => keep.every(([kx, ky]) => Math.abs(kx - x) > 3 || Math.abs(ky - y) > 3) && placed.every(([px, py]) => Math.abs(px - x) > 9 || Math.abs(py - y) > 4);
  const wet = (x, y) => (L.pools || []).some(p => x * TS >= p.x0 && x * TS <= p.x1 && y * TS + 8 > p.y - 2); // in the water, not by it: a fish trap wants a bank
  const stoneAt = (x, y) => (L.stone || []).some(z => x >= z[0] - 1 && x <= z[1] + 1 && y >= z[2] - 1 && y <= z[3] + 1);
  for (let y = 2; y < H - 1; y++) for (let x = 2; x < W - 2; x++) {
    // open ground three tiles wide with three rows of air over it
    let ok = true; for (let dx = -1; dx <= 1 && ok; dx++) { if (at(x + dx, y + 1) !== T.SOLID) ok = false; for (let dy = 0; dy < 3 && ok; dy++) if (at(x + dx, y - dy) !== T.AIR) ok = false; }
    if (!ok || rnd() > (id === 'marsh' || id === 'moor' ? 0.4 : 0.2) || wet(x, y) || stoneAt(x, y) || !clear(x, y) || rooms.some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d)) continue;
    const [kind, nv] = set[(rnd() * set.length) | 0];
    L.ents.push({ t: 'deco', x, y, kind, v: nv ? (rnd() * nv) | 0 : 0, dressed: true }); placed.push([x, y]);
  }
  return L;
}
const mulberryL = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
for (const lv of LEVELS) if (!lv.hidden) { const b = lv.build, id = lv.id; lv.build = () => { const L = b(); if (REVIEW[id]) REVIEW[id](L); return dressLevel(sprinkleCoins(L), id); }; }
// The editor puts its document here. Nothing else writes to it, and with no editor open it hands
// back an empty room, so LEVELS is always safe to build.
export const CUSTOM = { build: () => ({ W: 40, H: 28, grid: new Uint8Array(40 * 28), ents: [], START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: [], interiors: [], palette: {}, duskStart: -1, duskLen: 1 }) };
