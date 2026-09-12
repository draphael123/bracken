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
  ent('sign', 5, 21, { text: 'ARROWS/WASD MOVE   Z JUMP   X SWING', pyro: 'ARROWS/WASD MOVE   Z JUMP   X STAFF   TAP C: AN EMBER   HOLD C: THE JET', paladin: 'ARROWS/WASD MOVE   Z JUMP   X MAUL, SLOW AND HEAVY' }); ent('npc', 10, 21, { kind: 'squire' });
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
  ent('sign', 78, 21, { text: 'DOWN+X IN THE AIR: PLUNGE. LAND IT ON A FOE AND YOU BOUNCE. HOLD JUMP AS YOU BOUNCE TO GO HIGHER. THE WOOD IS BUILT FOR IT.', pyro: 'DOWN+X IN THE AIR: THE FIREDROP. A FIREBALL GOES DOWN AHEAD OF YOU, AND YOU BOUNCE OFF WHAT YOU LAND ON. HOLD JUMP AS YOU BOUNCE TO GO HIGHER. THE WOOD IS BUILT FOR IT.', paladin: 'DOWN+X IN THE AIR: HAMMERFALL. THE GROUND CARRIES THE BLOW BOTH WAYS, AND YOU BOUNCE OFF WHAT YOU LAND ON. HOLD JUMP AS YOU BOUNCE TO GO HIGHER.' });
  ent('check', 82, 21);

  // ---- 3. Wasp pit: pogo chain ----
  ent('wasp', 87, 20); ent('wasp', 90, 20); ent('wasp', 93, 20); ent('wasp', 96, 20);
  floor(98, 120, 22);
  coins([99, 20], [100, 19], [101, 20]);
  ent('sign', 103, 21, { text: 'C BLOCK, V DODGE. A BLOCK TURNS A BLOW AND STAGGERS THE ONE WHO SWUNG IT. SPINED BACKS BREAK THE PLUNGE: CUT THOSE FROM THE SIDE.', pyro: 'NO SHIELD: V DODGE. TAP C FOR AN EMBER, HOLD IT FOR THE JET. THE HOTTER YOU RUN, THE HARDER IT ALL LANDS. SPINED BACKS BREAK THE PLUNGE: BURN THOSE FROM THE SIDE.', paladin: 'HOLD C: THE AEGIS, A WARD IN FRONT OF YOU FOR A BREATH AND A HALF. TAP C WITH HALF THE LIGHT: MEND. V: THE HEAVY STEP. SPINED BACKS BREAK THE PLUNGE: STRIKE THOSE FROM THE SIDE.' });
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
  ent('sign', 256, 8, { text: 'SHIELD GOBLINS HIDE BEHIND IRON. THEIR HELMS ARE STEPPING STONES: PLUNGE THE HELM, LAND BEHIND, CUT.', pyro: 'SHIELD GOBLINS HIDE BEHIND IRON. FIRE GOES OVER A SHIELD: ARC AN EMBER. THEIR HELMS ARE STEPPING STONES: FIREDROP THE HELM, LAND BEHIND, BURN.', paladin: 'SHIELD GOBLINS HIDE BEHIND IRON. THEIR HELMS ARE STEPPING STONES: HAMMERFALL THE HELM, LAND BEHIND, STRIKE.' });
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
  G0.ent('wasp', 245, 13); G0.ent('wasp', 249, 13); G0.ent('wasp', 253, 13); // (level with the wasp pit's: just under the bank, so a jump off it gets above them; they hung too high to reach)
  G0.coins([244, 13], [248, 13], [252, 13]);
  G0.block(256, 270, 15, 27);
  G0.ent('check', 259, 14); G0.ent('sprig', 265, 14, { face: -1 }); G0.coins([262, 13], [268, 13]);
  const R0 = G0.done();
  const G = grow(R0, R0, 130, 46);
  G.block(130, 175, 12, 27);
  G.ent('sign', 131, 11, { text: 'THE FALLEN GIANT. OVER THE TOP FOR THE COINS, OR THROUGH THE HOLLOW FOR THE QUIET. THE WOODSMAN\'S SHEEP WENT ONE OF THOSE WAYS.' });
  G.ent('check', 133, 11); G.coins([135, 10], [137, 10]);
  G.block(139, 152, 8, 11); for (let x = 139; x <= 152; x++) { G.set(x, 9, 0); G.set(x, 10, 0); G.set(x, 11, 0); } // the hollow runs the whole trunk
  G.ent('spit', 150, 11, { face: -1 }); /* (the spikes inside the trunk sat under a roof too low to jump them) */ G.coins([144, 10], [148, 10]); G.ent('silver', 152, 10);
  G.plat(136, 9, 2); G.coins([137, 8], [141, 6]); // up onto the trunk
  G.ent('wasp', 146, 6); G.ent('wasp', 150, 5); G.coins([146, 4], [150, 3]); G.ent('sprig', 144, 7, { face: -1 });
  G.plat(153, 9, 2); G.coins([154, 8]);
  G.ent('deco', 158, 11, { kind: 'hiveBg' }); G.ent('deco', 168, 11, { kind: 'hiveBg' });
  G.spikes(159, 167, 11); G.block(161, 162, 10, 11); G.block(165, 166, 10, 11); // a bed of thorns under the hives, and two mounds of earth up out of it to hop across
  G.ent('wasp', 163, 7); G.ent('wasp', 167, 7); G.coins([161, 9], [165, 9], [163, 5], [167, 5]); // the wasps over the gaps are for the gold above them
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
  ent('sign', 357, 17, { text: 'THE KING\'S COURT. HE DRAWS BREATH BEFORE HE PULLS: HOLD YOUR SHIELD UP. HIS TONGUE COMES STRAIGHT. HIS LEAP DOES NOT. WHEN HE CROAKS THE POND RISES: GET TO THE REEDS OR THE DAIS.', pyro: 'THE KING\'S COURT. HE DRAWS BREATH BEFORE HE PULLS: GET OUT OF THE LINE OF IT. HIS TONGUE COMES STRAIGHT. HIS LEAP DOES NOT. WHEN HE CROAKS THE POND RISES: GET TO THE REEDS OR THE DAIS.', paladin: 'THE KING\'S COURT. HE DRAWS BREATH BEFORE HE PULLS: RAISE THE AEGIS. HIS TONGUE COMES STRAIGHT. HIS LEAP DOES NOT. WHEN HE CROAKS THE POND RISES: GET TO THE REEDS OR THE DAIS.' });
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
  ent('sign', 58, 15, { text: 'THE ARCHERS ON THE STILTS. SLASH AN ARROW TO SEND IT BACK WHERE IT CAME FROM. BLOCK IF YOU ARE SLOW.', pyro: 'THE ARCHERS ON THE STILTS. BURN AN ARROW OUT OF THE AIR WITH THE JET, OR DODGE IT.', paladin: 'THE ARCHERS ON THE STILTS. STRIKE AN ARROW TO SEND IT BACK WHERE IT CAME FROM. THE AEGIS TURNS THEM TOO.' });
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
  ent('wisp', 138, 15); ent('wisp', 152, 14); ent('sign', 130, 17, { text: 'THE FOG ON THE STREAM. THE RAFT WAITS AT THE BANK: STEP ON AND IT CARRIES YOU OVER. THE WISPS IN THE FOG ARE LIGHT: CUT ONE AND IT THINS.' });
  movers.push({ kind: 'raft', x0: 131 * TS, x1: 161 * TS - 96, x: 131 * TS, y: 18 * TS, w: 96, h: 8, speed: 34 }); // (six drifting logs in the fog were luck: a raft waits at the bank and carries you over)
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
  for (let y = 20; y <= 27; y++) { set(250, y, 0); set(251, y, 0); } net(250, 251, 26); for (let y = 21; y <= 25; y++) set(250, y, T.NET); // miss the lift and the net catches you: rungs up to where it waits
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
  for (let y = 12; y <= 27; y++) { set(315, y, 0); set(316, y, 0); } net(315, 316, 26); for (let y = 20; y <= 25; y++) set(316, y, T.NET); // and rungs up out of this one to the floor
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
  G.ent('sign', 249, 19, { text: 'THE SAPPERS DUG UNDER THE WALL. SO WILL YOU. THEY CARRY POWDER: KILL THEM AT A DISTANCE, OR BLOCK THE BLAST.', pyro: 'THE SAPPERS DUG UNDER THE WALL. SO WILL YOU. THEY CARRY POWDER: KILL THEM AT A DISTANCE: THAT IS WHAT EMBERS ARE FOR.', paladin: 'THE SAPPERS DUG UNDER THE WALL. SO WILL YOU. THEY CARRY POWDER: KILL THEM AT A DISTANCE, OR TAKE THE BLAST ON THE AEGIS.' });
  for (const x of [256, 266, 276, 286]) G.ent('torch', x, 24);
  G.ent('deco', 254, 24, { kind: 'skullPile', v: 0 }); G.ent('deco', 281, 24, { kind: 'skullPile', v: 1 });
  G.ent('sprig', 258, 24, { face: -1 }); G.ent('barrel', 262, 24); G.crate(264, 24); G.ent('sapper', 270, 24, { face: -1 });
  G.ent('sprig', 277, 24, { face: -1 }); /* (a bed of spikes under a roof you cannot jump in was here: no way past it but through) */ G.ent('barrel', 279, 24); G.crate(281, 24); G.crate(281, 23);
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
  const web = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.WEB); }; // a curtain: cut it, or burn it
  const sleeps = [];

  // ---- 1. The mycelium glade: caps bounce, puffballs burst ----
  floor(0, 44, 20);
  ent('sign', 4, 19, { text: 'CAPS BOUNCE. HOLD JUMP FOR HEIGHT. THE ROT RUNS DOWNHILL.' }); ent('npc', 9, 19, { kind: 'squire' });
  ent('sign', 298, 19, { text: 'THE MOTHER CAP. SHE BREATHES IN AND SEALS. SHE BREATHES OUT AND OPENS. CUT THE GILLS, SPRING OFF THE STUMP, PLUNGE THE HEART.' });
  ent('npc', 11, 19, { kind: 'elder' }); // the elder myconid wants clean light
  ent('glow', 8, 19); ent('puffball', 14, 19); ent('sporeling', 18, 19, { face: -1 }); ent('puffball', 22, 19);
  bouncer(27, 19); coins([27, 15], [27, 12], [27, 9]);
  ent('spitcap', 30, 19, { face: -1 }); ent('sign', 31, 19, { text: 'SPITCAPS ARE ROOTED: THEY THROW INSTEAD. THE BOMB IS NOTHING, THE CLOUD IT LEAVES IS SLEEP. WHEN ONE SWELLS IT IS AT ITS WEAKEST.' });
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
  ent('spitcap', 77, 11, { face: -1 }); ent('spitcap', 84, 11, { face: 1 });
  web(81, 8, 11); ent('spider', 82, 7, { drop: 70 }); coins([80, 10]);
  ent('glow', 66, 11); ent('glow', 83, 11); ent('lurker', 87, 11); bouncer(90, 11); shelf(91, 7, 3); coins([91, 6], [92, 6], [93, 6]); ent('relic', 92, 6, { kind: 'lantern' }); /* the grove cache */ ent('sporeling', 91, 11, { face: -1 }); ent('puffball', 94, 11); ent('glow', 97, 11);
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
  ent('sign', 134, 13, { text: 'VIOLET SPORES PUT YOU TO SLEEP WHERE YOU STAND. BLOCK THROUGH A CLOUD, OR RUN. A SLEEPING KNIGHT IS A SPORELING\'S SUPPER.', pyro: 'VIOLET SPORES PUT YOU TO SLEEP WHERE YOU STAND. BURN A CLOUD AWAY WITH THE JET, OR RUN. A SLEEPING KNIGHT IS A SPORELING\'S SUPPER.', paladin: 'VIOLET SPORES PUT YOU TO SLEEP WHERE YOU STAND. HOLD THE AEGIS THROUGH A CLOUD, OR RUN. A SLEEPING KNIGHT IS A SPORELING\'S SUPPER.' });
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
  // THE WEB TUNNELS. The fungus is somebody's larder: curtains across the road, weavers hanging in them,
  // and the spiders that spin them dropping out of the roof. Cut a curtain and the whole thing goes.
  ent('sign', 167, 13, { text: 'WEB ACROSS THE ROAD. ONE CUT TAKES A WHOLE CURTAIN. WEAVERS SPIT IT AT YOUR FEET: MASH OUT AND KEEP MOVING. FIRE EATS IT ALL.' });
  ent('lurker', 172, 13); ent('sporeling', 176, 13, { face: -1 }); ent('roller', 181, 13, { face: -1, speed: 70 }); ent('puffball', 185, 13);
  web(174, 12, 13); web(180, 12, 13); web(188, 12, 13); web(195, 12, 13); // waist high across the tunnel: cut them, burn them, or vault the lot
  ent('weaver', 177, 11, { face: -1 }); ent('weaver', 191, 11, { face: -1 }); ent('spider', 184, 11, { drop: 44 }); ent('spider', 198, 11, { drop: 44 });
  ent('deco', 170, 13, { kind: 'sporePod' }); ent('deco', 186, 13, { kind: 'sporePod' });
  ent('lurker', 189, 13); ent('sporeling', 193, 13, { face: -1 }); ent('shield', 197, 13, { face: -1 });
  ent('glow', 168, 13); ent('glow', 178, 13); ent('glow', 187, 13); ent('glow', 196, 13); coins([174, 12], [183, 12], [191, 12]);

  // ---- 6b. The lantern terrace: glow caps light the way, a second shaman raises the dead ----
  floor(201, 244, 14);
  ent('check', 202, 13); ent('glow', 203, 13); ent('puffball', 206, 13); ent('lurker', 210, 13); ent('sporeling', 214, 13, { face: -1 }); ent('glow', 217, 13);
  ent('vent', 208, 13, { period: 4.5, on: 1.8, h: 96, phase: 2 }); plat(206, 8, 4); coins([207, 7], [209, 7]); ent('mover', 229, 9, { len: 2, range: 5, cap: true, speed: 34 }); ent('glow', 233, 13);
  bouncer(220, 13); plat(218, 8, 5); coins([220, 10], [219, 6], [221, 6]);
  sleeps.push({ x0: 226 * TS, x1: 233 * TS, y0: 8 * TS, y1: 14 * TS }); ent('sporeling', 229, 13, { face: -1 }); ent('glow', 227, 13);
  ent('shaman', 237, 13, { face: -1 }); ent('spitcap', 224, 13, { face: -1 }); ent('sporeling', 241, 13, { face: -1 }); ent('glow', 243, 13);
  ent('sign', 244, 13, { text: 'THE PILLARS. HOLD JUMP, OR PLUNGE INTO THE CAPS.' });
  ent('deco', 205, 13, { kind: 'deadTree', v: 0 }); ent('deco', 238, 13, { kind: 'deadTree', v: 1 }); ent('deco', 292, 13, { kind: 'deadTree', v: 0 });
  ent('sign', 201, 13, { text: 'THE STORM. THE VIOLET COMES IN WAVES. STAND UNDER A LIT CAP AND THE SPORES PASS YOU BY. THE CAPS GO OUT IF YOU HIT THEM.' });
  coins([208, 12], [231, 11], [239, 11]);

  // ---- 7. The drone gauntlet: caps on pillars over the drop ----
  shelf(252, 21, 3); shelf(258, 20, 3); shelf(264, 21, 3); ent('silver', 259, 19); // the low road: shelves that give way
  block(245, 271, 26, 27); for (const x of [247, 253, 259, 265, 270]) bouncer(x, 25); ent('glow', 252, 25); ent('glow', 264, 25); // the pit has a floor: caps on it spring you back to the low road
  for (const [px0, top] of [[249, 18], [255, 20], [261, 18], [267, 20]]) { block(px0, px0 + 2, top, 27); for (let i = 0; i < 3; i++) bouncer(px0 + i, top - 1); }
  ent('drone', 252, 6); ent('drone', 264, 6);
  ent('weaver', 256, 8, { face: -1 }); ent('weaver', 268, 10, { face: -1 }); ent('spider', 262, 5, { drop: 120 });
  web(257, 12, 17); web(266, 12, 17); // curtains strung between the pillars: cut them or take the long way round
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
  web(308, 14, 19); web(312, 14, 19); ent('spider', 310, 13, { drop: 110, big: true }); // THE LARDER: something big keeps the door
  ent('weaver', 316, 15, { face: -1 }); ent('spitcap', 300, 19, { face: 1 }); ent('spitcap', 372, 19, { face: -1 });
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
  const R3 = Fk.done();
  // ---- 7b. THE DEEP GILLS and THE SPROUTS: down into a cellar under the caps, black as pitch but for the glowbuds you strike,
  // then out up a shaft on sprouts that shoot up when you stand on them (each step is a head too high to jump). ----
  const Dg = grow(R3, R3, 424, 48), TSZ = 16;
  Dg.block(424, 429, 14, 27);                                                  // the lip
  Dg.block(430, 447, 4, 9); Dg.block(430, 445, 25, 27); Dg.block(446, 447, 23, 27); // the cellar: a roof over it, a floor under it, a step up at the far end
  Dg.plat(431, 17, 2); Dg.plat(434, 21, 2);                                     // shelves down into it, so it is a climb down and not a blind drop
  Dg.block(448, 452, 22, 27); Dg.block(453, 457, 18, 27); Dg.block(458, 471, 14, 27); // the shaft: floor, the sprout shelf, the lip out
  Dg.ent('sign', 425, 13, { text: 'THE DEEP GILLS. BLACK AS A CELLAR DOWN THERE. STRIKE A GLOWBUD AND IT LIGHTS THE PLACE A WHILE. BEYOND IT THE SPROUTS GROW WHEN YOU STAND ON THEM: RIDE THEM UP.' });
  for (const x of [432, 437, 442]) Dg.ent('glowbud', x, 24); Dg.ent('glowbud', 434, 20);
  Dg.ent('lurker', 439, 24); Dg.ent('sporeling', 444, 24, { face: -1 }); Dg.ent('drone', 451, 16);
  Dg.coins([433, 23], [436, 23], [440, 23], [443, 22], [455, 16], [460, 12], [462, 12]);
  Dg.ent('check', 466, 13);
  Dg.R.moversExtra = (Dg.R.moversExtra || []).concat([ // the sprouts: a bud you hop on; stand on it and it shoots up 56px, holds, and withers back
    { kind: 'growcap', x: 450 * TSZ + 8 - 16, y: 22 * TSZ - 8, y0: 22 * TSZ - 8, y1: 22 * TSZ - 64, w: 32, h: 8, rise: 56, state: 'bud', k: 0 },
    { kind: 'growcap', x: 456 * TSZ + 8 - 16, y: 18 * TSZ - 8, y0: 18 * TSZ - 8, y1: 18 * TSZ - 64, w: 32, h: 8, rise: 56, state: 'bud', k: 0 }]);
  Dg.R.dark = 0.01; Dg.R.darkZones = (Dg.R.darkZones || []).concat([{ x0: 430 * TSZ, x1: 448 * TSZ, y0: 9 * TSZ, y1: 26 * TSZ, dark: 0.9 }]);
  return Dg.done();
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
  ent('sign', 47, 19, { text: 'PIKE GOBLINS HOLD THE LINE AND BRACE WHEN YOU CHARGE. JUMP THE PIKE AND CUT FROM BEHIND, OR THROW THE SHIELD INTO THEM.', pyro: 'PIKE GOBLINS HOLD THE LINE AND BRACE WHEN YOU CHARGE. JUMP THE PIKE AND BURN FROM BEHIND, OR ARC EMBERS OVER THE LINE.', paladin: 'PIKE GOBLINS HOLD THE LINE AND BRACE WHEN YOU CHARGE. JUMP THE PIKE AND STRIKE FROM BEHIND, OR CHARGE THE LINE.' });
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
  ent('sign', 169, 13, { text: 'THE GREAT HOUND. IT LUNGES LOW: JUMP IT. IT POUNCES HIGH: DODGE, OR IT LANDS ON YOU. WHEN IT HOWLS, KILL THE PUPS FAST. IT SKIDS ON A BLOCK.', pyro: 'THE GREAT HOUND. IT LUNGES LOW: JUMP IT. IT POUNCES HIGH: DODGE, OR IT LANDS ON YOU. WHEN IT HOWLS, KILL THE PUPS FAST. IT DOES NOT LIKE FIRE.', paladin: 'THE GREAT HOUND. IT LUNGES LOW: JUMP IT. IT POUNCES HIGH: DODGE, OR IT LANDS ON YOU. WHEN IT HOWLS, KILL THE PUPS FAST. IT SKIDS ON THE AEGIS.' });
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
  plat(284, 12, 2); plat(298, 8, 3); // a step up to the court's ledges (they started a head too high to jump) and one across the gap to the loft
  ent('check', 312, 13);

  // ---- 7. The throne room: King Gorm Underleaf on his palanquin. ----
  block(300, 429, 14, 27);
  for (let x = 318; x <= 368; x++) ent('carpet', x, 13);
  ent('torch', 320, 13); ent('torch', 366, 13); ent('deco', 326, 13, { kind: 'banner', v: 0 }); ent('deco', 360, 13, { kind: 'banner', v: 1 });
  ent('deco', 332, 13, { kind: 'skullPile', v: 0 }); ent('deco', 354, 13, { kind: 'skullPile', v: 1 });
  plat(322, 3, 3); plat(367, 3, 3); // the archers' perches under the roof, level with the winch decks: the King calls bowmen up when you hide on the scaffold
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
  const R2 = G.done();

  // ---- 4b. THE FIRED WOOD ----
  // They put the wood between the kennels and the canopy to the torch rather than let you walk it. The floor of
  // it is burning, so the crossing is all leaning trunks, branches that give way, and two ropes over the worst.
  const F = grow({ W: R2.W, H: R2.H, grid: R2.grid, ents: R2.ents }, R2, 210, 54);
  F.block(210, 218, 14, 27); F.block(259, 263, 14, 27); // the two banks
  F.block(219, 258, 25, 27); // the burning floor of it, far enough down that a fall is a mistake, not the end
  F.ent('sign', 212, 13, { text: 'THEY FIRED THE WOOD RATHER THAN LET YOU WALK IT. GO OVER IT: THE BRANCHES THAT GLOW GIVE WAY, THE ROPES DO NOT. NOTHING DOWN THERE IS WORTH THE BURN.' });
  F.ent('torch', 216, 13); F.ent('torch', 260, 13);
  F.plat(221, 13, 3); F.plat(226, 12, 3);
  for (let i = 0; i < 3; i++) F.set(231 + i, 11, T.SHELF); // a branch already burning through
  F.plat(236, 12, 3); F.plat(241, 14, 3);
  for (let i = 0; i < 3; i++) F.set(246 + i, 12, T.SHELF);
  F.plat(251, 13, 3); F.plat(255, 12, 3);
  // the ropes: the fast way over the two widest gaps, with a ledge road under each so it is never the only way
  F.R.moversExtra.push({ kind: 'swing', px: 233 * TS, py: 4 * TS, arm: 88, x: 0, y: 0, w: 48, h: 8, period: 3.2, phase: 0.4 });
  F.R.moversExtra.push({ kind: 'swing', px: 250 * TS, py: 4 * TS, arm: 96, x: 0, y: 0, w: 48, h: 8, period: 3.6, phase: 2.0 });
  // the fire comes up through it in gouts, and the archers on the far bank light whatever you are standing on
  F.ent('firevent', 224, 13, { every: 2.7 }); F.ent('firevent', 239, 12, { every: 3.2 }); F.ent('firevent', 253, 13, { every: 2.9 });
  F.ent('firepit', 228, 24, { period: 3.2, on: 1.6, phase: 0 }); F.ent('firepit', 243, 24, { period: 3.2, on: 1.6, phase: 1.6 });
  F.ent('brazier', 234, 24); F.ent('brazier', 249, 24);
  F.ent('archer', 261, 13, { face: -1, fire: true }); F.ent('archer', 214, 13, { face: 1, fire: true });
  F.ent('wasp', 229, 8); F.ent('wasp', 244, 7); F.ent('wasp', 256, 9); // smoked out of the eaves and furious
  F.ent('thief', 222, 12, { face: -1 }); F.ent('thief', 252, 12, { face: -1 }); // carrying what they could grab
  F.ent('sprig', 237, 11, { face: -1 }); F.ent('sprig', 257, 11, { face: -1 });
  // the floor of the burn: a way back up if you fall, and something worth the trip
  F.plat(224, 21, 3); F.plat(236, 21, 3); F.plat(246, 21, 3); // somewhere to stand out of the worst of it
  for (const y of [22, 20, 18, 16]) F.plat(255, y, 3); // and the ladder of ledges up the far bank: a fall costs you the crossing, not the run
  F.ent('silver', 236, 24); F.ent('deco', 231, 24, { kind: 'skullPile', v: 0 }); F.ent('deco', 247, 24, { kind: 'skullPile', v: 1 });
  F.ent('hound', 225, 24, { face: 1 }); F.ent('hound', 241, 24, { face: -1 }); // their dogs got left down there and they are not friendly now
  F.coins([222, 12], [227, 11], [233, 9], [237, 11], [242, 13], [247, 11], [252, 12], [256, 11], [224, 20], [240, 18], [252, 18]);
  F.ent('check', 217, 13);
  return F.done();
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
  ent('sign', 180, 13, { text: 'SCREE. IT SLIDES UNDER YOU AND CARRIES YOU DOWN. BRACE WITH BLOCK, OR BOUNCE ACROSS IT. THE TROLL THROWS ROCKS FROM ABOVE. WHEN THE HILL COMES DOWN, RUN. DO NOT STOP.', pyro: 'SCREE. IT SLIDES UNDER YOU AND CARRIES YOU DOWN. BOUNCE ACROSS IT, OR RUN. THE TROLL THROWS ROCKS FROM ABOVE. WHEN THE HILL COMES DOWN, RUN. DO NOT STOP.', paladin: 'SCREE. IT SLIDES UNDER YOU AND CARRIES YOU DOWN. BOUNCE ACROSS IT, OR RUN. THE TROLL THROWS ROCKS FROM ABOVE. WHEN THE HILL COMES DOWN, RUN. DO NOT STOP.' });
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

  // ---- 5b. THE GULLY: the last of the open hill before the fold. ----
  ent('deco', 299, 8, { kind: 'cairn' }); ent('deco', 304, 7, { kind: 'stone', v: 1 });
  ent('harpy', 295, 2); ent('goat', 293, 8, { face: -1 });
  coins([296, 7], [302, 6]);
  // the Ram Lord's stile: a lip of rock one step up outside the fold gate. The goats can't take a step, the harpies don't come this far: a quiet place to stand before the fight.
  block(300, 311, 8, 8); ent('check', 308, 7);

  // ---- 6. THE FOLD: the Ram Lord's walled pasture on the plateau ----
  ent('sign', 307, 7, { text: 'THE RAM LORD. HIS HIDE TURNS STEEL. A GREEN RING UNDER HIM MEANS HE IS DAZED: WHEN HE HITS THE WALL, AND FOR A BREATH WHEN HE LANDS FROM A LEAP. CUT HIM THEN. HE FEINTS: THE FIRST CHARGE MAY STOP SHORT. HE LEAPS: WATCH THE SHADOW. HE TOSSES.' });
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
  [108, 94, 80, 66, 52, 38, 20].forEach((top, i) => { for (const x of [16, 46, 76, 98]) { if (top > tops.crown) ent('deco', x, top - 1, { kind: 'pillar', v: (x + i) % 3 }); /* (the crown has nothing over it: its pillars stood up into the sky) */ if (top < 108) { ent('deco', x - 2, top + 4, { kind: 'strut', v: 0 }); ent('deco', x + 2, top + 4, { kind: 'strut', v: 1 }); } } });

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
  ent('sign', 8, 19, { text: 'THE OWL REEVE. IT SITS ON THE HIGH BRANCHES. CLIMB TO IT AND CUT: TWO CUTS AND IT FLUSHES. LIGHT THE LANTERN ON A PERCH AND IT WILL NOT SIT THERE. LIGHT ALL THREE AND IT MUST COME DOWN TO YOU. ITS TALONS CARRY. DODGE THOSE. WHEN IT GOES UP OUT OF SIGHT, WATCH FOR ITS SHADOW. AND THE LIGHT HURTS ITS EYES: LIGHT A PERCH WHILE IT SITS THERE, OR STRIKE A LIT LANTERN WHILE IT IS CLOSE, AND IT FALLS.' });
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
    arena: { x0: 20 * TS, x1: 90 * TS, floor: 20 * TS, trigger: 21 * TS, y0: 4 * TS, wallL: 19, wallR: 90, boss: 'owl', tint: '#ffd36b', tintA: 0.08, fx: 'motes' },
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

  // (pass two) the frost: some who came up for the glass are still here, and the slab over the crown's thorns stands on a glass stem
  ent('deco', 30, 195, { kind: 'frozen', v: 0 }); ent('deco', 20, 131, { kind: 'frozen', v: 1 }); ent('deco', 12, 79, { kind: 'frozen', v: 0 }); ent('deco', 44, 55, { kind: 'frozen', v: 1 });
  set(87, 28, T.CRYST); set(87, 29, T.CRYST);
  L.ents = L.ents.filter(e => !(e.t === 'deco' && e.kind === 'spire' && e.x === 16 && e.y === 29)); // it stood on the sign
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 4, y: 217 }, pools: [], falls: [], moversExtra: movers,
    duskStart: 99999, duskLen: 1, music: 'sunspire', night: false, hasCryst: true, cloudLine: CLOUD, frost: true, snowLine: 999,
    slick: [[24, 50, 196], [8, 40, 172], [4, 30, 132], [21, 70, 108], [2, 40, 80], [30, 80, 56]], // ice underfoot on the long floors: slow to start, slow to stop // duskStart -1 means ALWAYS dusk: this one is daylight
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
  plat(47, 13, 3); plat(50, 11, 3); plat(54, 10, 4); ent('key', 64, 14, { kind: 'iron' }); coins([44, 13], [48, 13], [52, 13], [56, 9], [58, 9], [60, 13]); // steps to the shelf: it was five rows off the floor
  ent('stray', 56, 9, { kind: 'folk' });
  ent('sign', 39, 14, { text: 'THE SMITHY. THEY ARE MAKING SOMETHING LONG AND SHARP FOR SOMEONE LARGE.' });
  // the second span: long, watched from both ends, and a cutter on the far post
  block(151, 152, 32, 45); block(178, 179, 32, 45);
  // (the span over the sootworks gorge came down: THE CHIMNEYS, below, are the crossing now)
  ent('stormshaman', 181, 31, { face: -1 }); // (the rope cutter could drop the only way on: a shaman holds the far end instead)
  ent('archer', 151, 31, { face: 1, fire: true }); ent('rockgoblin', 179, 31, { face: -1 }); // (her floor there is row 32: these two were standing two rows over it)
  ent('sign', 148, 31, { text: 'A GOBLIN WITH AN AXE IS WORTH MORE THAN A GOBLIN WITH A SWORD, IF HE IS STANDING ON THE ROPE. THE SHIELD CARRIES.', pyro: 'A GOBLIN WITH AN AXE IS WORTH MORE THAN A GOBLIN WITH A SWORD, IF HE IS STANDING ON THE ROPE. AN EMBER CARRIES.', paladin: 'A GOBLIN WITH AN AXE IS WORTH MORE THAN A GOBLIN WITH A SWORD, IF HE IS STANDING ON THE ROPE. THE BLESSED HAMMER CARRIES.' });
  ent('deco', 152, 31, { kind: 'lanternPost' }); ent('deco', 179, 31, { kind: 'lanternPost' }); // a lamp on each bank of the chimneys (they stood in the air over the old span)
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
  ent('sign', 302, BY - 1, { text: 'THE CASTLE BRIDGE, AND THE QUEEN\'S LANCE ON IT. HE CANNOT TURN WHILE HE IS CHARGING: GET UP ON A LOOKOUT OVER A PIER AND HE GOES UNDER YOU, AND INTO THE NEXT POST. THE FIRE CAGES HANG OVER THE SPANS: CUT A CHAIN AS HE GOES UNDER. WHEN HIS PENNANT GOES UP THE STORM COMES DOWN THE BRIDGE AT HIM: BRACE, OR GET UP A TOWER.' });
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

  // ---- (pass two) THE CHIMNEYS: the old sootworks gorge. The span is down; the chimney stacks still stand a hop apart,
  // and the sweeps who live in them come up to throw soot. The gorge has a floor
  // now and a rope ladder up the near side: a fall is a climb back, not a death. ----
  for (let x = 153; x <= 177; x++) set(x, 32, T.AIR);
  block(153, 177, 44, 45); for (let y = 32; y <= 43; y++) set(153, y, T.NET);
  for (const [x0, top] of [[155, 31], [159, 29], [164, 30], [168, 29], [173, 30]]) { block(x0, x0 + 1, top, 43); ent('chimpot', x0 + 1, top - 1); } // up-hops are two tiles, drops three
  // a rope ladder down every shaft, not just the first: the stacks wall each one off from the next (the last one
  // climbs the far bank instead, so a fall there is a way on)
  for (const [lx, top] of [[157, 31], [161, 29], [166, 30], [170, 29], [177, 32]]) for (let y = top; y <= 43; y++) set(lx, y, T.NET);
  ent('sweep', 159, 28, { face: -1 }); ent('sweep', 168, 28, { face: -1 });
  ent('sign', 150, 31, { text: 'THE CHIMNEYS. THE SPAN IS DOWN, BUT THE STACKS OF THE OLD SOOTWORKS STILL STAND. MIND THE SWEEPS: THEY LIVE IN THEM, AND THEY THROW SOOT. FALL, AND EVERY SHAFT HAS A LADDER.' });
  coins([157, 28], [160, 27], [165, 28], [169, 27], [171, 27], [176, 29], [162, 40], [171, 40]);
  // ---- (pass two) THE HOUSES AS PLACES. The longhouse is a feast: tables to fight over and three chandeliers to cut down
  // on whoever is under them. The smithy's forge breathes up to the shelf. The tannery hangs its hides from racks you climb. ----
  for (const x of [121, 138, 152]) ent('weight', x, 4, { len: 4, lamp: true, hang: true });
  plat(124, 14, 5); plat(142, 14, 5); ent('sapper', 146, 15, { face: -1 }); ent('hearthgob', 128, 15, { face: 1 });
  ent('vent', 52, 14, { heat: true, h: 90, period: 3.4, on: 1.5, lift: 240, w: 12 });
  plat(80, 11, 3); plat(85, 9, 3); plat(90, 11, 3); coins([81, 10], [86, 8], [91, 10]);
  for (const x of [79, 84, 89, 94]) ent('deco', x, 6, { kind: 'banner', v: x % 2, hang: true });
  ent('sprig', 82, 13, { face: 1 }); ent('sprig', 88, 13, { face: -1 });
  // ---- (pass two) more of the goblins that live here: bombers on the street, a shaman on the roofs, a sweep in a house chimney ----
  ent('sapper', 124, 31, { face: -1 }); ent('sapper', 200, 31, { face: -1 }); ent('stormshaman', 139, 25, { face: -1 }); ent('sweep', 122, 25, { face: -1 });

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
  const W = 258, H = 70; const L = painter(W, H);
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
  ent('archer', 60, 51, { face: -1 }); ent('javelin', 72, 51, { face: -1 });
  ent('stray', 26, 51, { kind: 'seal' });
  // the gatehouse top, off the wall walk: a silver among the crenels
  plat(22, 50, 3); plat(22, 48, 3); plat(22, 46, 3); coins([13, 43], [16, 43], [19, 43]); // (its silver went to the watchtower on the road up)
  // the courtyard: stables, a kennel, a well, the barracks door
  ent('deco', 36, 63, { kind: 'cart' }); ent('deco', 42, 63, { kind: 'barrels' }); ent('deco', 76, 63, { kind: 'well' }); ent('deco', 86, 63, { kind: 'spearRack' });
  ent('deco', 56, 63, { kind: 'banner', v: 0 }); ent('torch', 48, 63); ent('torch', 80, 63);
  ent('hound', 64, 63, { face: -1 }); ent('soldier', 28, 63, { face: 1 });
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
  ent('soldier', 138, 63, { face: -1 }); ent('javelin', 160, 63, { face: -1 });
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
  plat(140, 14, 16); ent('javelin', 152, 13, { face: 1 }); ent('stray', 141, 13, { kind: 'seal' }); // the choir loft
  stair([[158, 17, 3], [154, 15, 3]]);
  plat(128, 12, 4); coins([128, 11], [130, 11]); stair([[134, 16, 3], [131, 14, 2]]); // up in the rafters (its silver went to the scaffolds)
  ent('deco', 127, 19, { kind: 'counter' }); ent('key', 128, 19, { kind: 'brass' });

  // ---- THE GREAT HALL (floor 20) and THE ROOF (8): THE GOBLIN QUEEN ----
  // (the hall was 108 tiles long: a long walk to a woman on a chair. Now it is 44, with her dais at the far end.)
  block(208, W - 1, 20, H - 1);                 // the castle's mass under the hall
  block(208, W - 1, 8, 9);                      // the hall's roof, and the roof walk on it
  block(252, W - 1, 0, 19);                     // the far wall
  block(206, 207, 2, 7);                        // the battlement at the near end of the roof
  block(240, 251, 18, 19); block(237, 239, 19, 19); // the dais and its step
  ent('deco', 247, 17, { kind: 'throne' });
  ent('gqueen', 246, 17);
  plat(213, 14, 24);                            // the gallery
  // (no archers on the gallery any more: the court has left her to it)
  for (const x of [216, 226, 235]) ent('support', x, 19, { top: 14 });
  for (const x of [212, 224, 236]) ent('deco', x, 13, { kind: 'hallWindow' });
  ent('deco', 219, 19, { kind: 'banner', v: 0 }); ent('deco', 233, 19, { kind: 'banner', v: 1 });
  for (const x of [210, 229]) ent('torch', x, 19);
  for (const x of [219, 231, 245]) ent('weight', x, 10, { len: 3, lamp: true, hang: true, gq: true }); // her chandeliers: when she stands, she throws at them
  ent('sign', 209, 19, { text: 'THE QUEEN. HER PLATE TURNS EVERY BLADE. THE GALLERY STANDS ON THREE PILLARS, EACH HOLDING ITS OWN STRETCH: BREAK A PILLAR WITH HER UNDER IT AND IT COMES DOWN ON HER, AND WHILE SHE IS PINNED SHE BLEEDS. HER MASONS BUILD THEM BACK. SHE THROWS HER SCEPTRE (LOW GOING, HIGH COMING BACK), SHE GOES UP ON HER GALLERY TO COME DOWN ON YOU, AND AT THE LAST SHE STEPS THROUGH SHADOW.' });
  // the roof: three peaks with an iron rod on each, and a step up to each
  block(214, 218, 4, 7); block(228, 232, 4, 7); block(242, 246, 4, 7);
  plat(211, 6, 3); plat(219, 6, 3); plat(225, 6, 3); plat(233, 6, 3); plat(239, 6, 3); plat(247, 6, 3);
  ent('rod', 216, 3); ent('rod', 230, 3); ent('rod', 244, 3);

  const interiors = [[124, 206, 10, 63, 'stone'], [208, 251, 10, 19, 'stone']];
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 1, y: 63 }, pools: [], falls: [], moversExtra: [], interiors,
    reachExact: true, // the carts are the Forgemaster's props, not a way around the castle
    duskStart: -1, duskLen: 1, music: 'highcrown', night: true, glowNight: true, nightA: 0.3,
    quest: { n: 3, item: 'seal', name: 'ROYAL SEALS', npc: 'squire', done: 'HER ORDERS MEAN NOTHING NOW', reward: 'relic', relic: 'banner' },
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'none', haze: 'rgba(150,140,190,0.14)',
      grass: '#8a8a98', grassL: '#a8a8b8', grassD: '#5a5a66', dirt: '#4a4a58', dirtL: '#5e5e6c', dirtD: '#32323c',
      canopy: ['#2a2a38', '#3a3a4a', '#4a4a5c', '#5a5a6e'] },
    weather: [{ x0: 0, x1: 123 * TS, kind: 'snow' }], ambient: [{ x0: 0, x1: 123 * TS, kind: 'wind' }],

    mini: { x0: 126 * TS, x1: 198 * TS, floor: 40 * TS, trigger: 134 * TS, wallL: 125, gate: 199, boss: 'forgemaster', y0: 26 * TS, y1: 41 * TS, slag: [140 * TS + 8, 158 * TS + 8, 180 * TS + 8] },
    arena: { x0: 208 * TS, x1: 251 * TS, floor: 20 * TS, trigger: 211 * TS, wallL: 207, wallR: 252, boss: 'gqueen', music: 'queen', tint: '#5a2a7a', tintA: 0.08, fx: 'dust',
      roof: 8 * TS, gallery: { row: 14, x0: 213, x1: 236 }, hole: { x0: 221, x1: 224, y0: 8, y1: 9 }, rubble: [[216, 17, 4], [221, 15, 4], [216, 13, 4], [221, 11, 4], [221, 9, 4]] },
  };
}

// the castle's own second pass (a watch in the ward, THE LEADS over the keep, the armoury gantry's ledges), written
// against the castle before it grew: it runs first, then the Scaffolds and the mountain road are opened around it
const crownReview = L => { const R = rv(L); R.ent('check', 62, 63);
    for (const [t, x, y, f] of [['soldier', 40, 63, -1], ['javelin', 76, 63, 1], ['heavy', 110, 63, -1], ['soldier', 140, 63, 1], ['javelin', 166, 63, -1], ['soldier', 190, 63, -1], ['hearthgob', 150, 51, 1], ['hearthgob', 186, 51, -1], ['javelin', 150, 19, 1]]) R.ent(t, x, y, { face: f });
    R.plat(149, 12, 3); R.plat(151, 10, 3);
    for (let x = 151; x <= 153; x++) { R.tile(x, 9, T.AIR); R.tile(x, 8, T.ONEWAY); }
    for (let x = 194; x <= 196; x++) { R.tile(x, 9, T.AIR); R.tile(x, 8, T.ONEWAY); }
    R.ent('sign', 156, 7, { text: 'THE LEADS. THE WHOLE MOUNTAIN IS UNDER YOU. THE HATCH AT THE FAR END DROPS YOU BACK INTO THE CHAPEL: DOWN AND JUMP.' });
    R.ent('deco', 170, 7, { kind: 'banner', v: 1 }); R.ent('deco', 182, 7, { kind: 'barrels' });
    // the armoury gantry's silver had no way up to it: ledges from the floor to the gantry, two rows at a time
    R.plat(129, 38, 3); R.plat(132, 36, 3); R.plat(134, 34, 2); R.plat(139, 31, 2); R.plat(146, 29, 2);
    // the far corner of the entrance hall past the stair, and the leads past the second hatch: something at the end of each
    R.coin(200, 63); R.coin(204, 63); R.ent('deco', 202, 63, { kind: 'spearRack' }); R.coin(200, 7); R.coin(203, 7); R.coin(205, 7); };

// HIGHCROWN, WHOLE. The castle above is the core; round it:
//  - it sits on the MOUNTAIN now: thirty rows of crag under it, and the moat is a chasm to the bottom of the world;
//  - THE ROAD UP: the level starts at the foot of a gully and climbs a switchback of five terraces cut into the
//    rock, over the mountain's shoulder past a watchtower and an eyrie, across a rope bridge over a gorge with a
//    fall of water in it, through a barbican tower and up a broken stone bridge to the drawbridge;
//  - THE SCAFFOLDS: inside the walls, between the ward and the keep, they are digging the foundations of a new
//    tower. The pit has no bottom you would survive; across it stand three scaffold towers, a gantry over them, a
//    bucket on a rope that swings you over the widest gap, chains to climb, and a hoist that lets you down the far side.
function growDown(L, n) { // add n rows under the level: each column carries on down as its bottom row was (rock stays rock, a chasm stays a chasm)
  const H2 = L.H + n, g = new Uint8Array(L.W * H2); g.set(L.grid);
  for (let y = L.H; y < H2; y++) for (let x = 0; x < L.W; x++) g[y * L.W + x] = L.grid[(L.H - 1) * L.W + x];
  L.grid = g; L.H = H2; return L;
}
function shiftCrown(R, col, n) { // what grow() does not know about in the castle: the alarms, the smith's slag, the Queen's hall parts
  const sh = x => x >= col ? x + n : x, shp = p => p >= col * TS ? p + n * TS : p;
  if (R.alarms) R.alarms = R.alarms.map(a => ({ ...a, gates: a.gates.map(([c, y0, y1]) => [sh(c), y0, y1]), garrison: a.garrison.map(gd => ({ ...gd, x: sh(gd.x) })) }));
  if (R.mini && R.mini.slag) R.mini = { ...R.mini, slag: R.mini.slag.map(shp) };
  if (R.arena) { const A = { ...R.arena };
    if (A.gallery) A.gallery = { ...A.gallery, x0: sh(A.gallery.x0), x1: sh(A.gallery.x1) };
    if (A.hole) A.hole = { ...A.hole, x0: sh(A.hole.x0), x1: sh(A.hole.x1) };
    if (A.rubble) A.rubble = A.rubble.map(([x, y, w]) => [sh(x), y, w]);
    R.arena = A; }
  return R;
}
function highcrownWhole() {
  const L0 = highcrown(); crownReview(L0); growDown(L0, 30);

  // ---- THE SCAFFOLDS (opened at the old column 104, seventy wide: x 104-173) ----
  const S = grow(L0, L0, 104, 70); shiftCrown(S.R, 104, 70);
  { const { block, ent, set, coins } = S;
    const deck = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.PLANK); };
    const rungs = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); };
    block(104, 107, 64, S.R.H - 1); block(162, 173, 64, S.R.H - 1); // the two banks of the foundation pit; between them, nothing to the bottom
    ent('check', 105, 63);
    ent('sign', 106, 63, { text: 'THE NEW TOWER. THEY ARE DIGGING ITS FOUNDATIONS, AND THE PIT HAS NO BOTTOM YOU WOULD WALK AWAY FROM. UP THE SCAFFOLD, OVER ON THE BUCKET, UP THE CHAIN, ALONG THE GANTRY, AND THE HOIST LETS YOU DOWN THE FAR SIDE.' });
    // tower A: decks four rows apart, a ladder of rungs up its far side
    for (const y of [62, 58, 54, 50, 46]) deck(109, 116, y); rungs(116, 47, 61);
    ent('soldier', 112, 57, { face: 1 }); ent('javelin', 111, 49, { face: 1 });
    // the gantry over everything, with planks missing, and a mason on it who throws what he has
    deck(109, 124, 40); deck(127, 138, 40); deck(142, 159, 40);
    ent('rockgoblin', 134, 39, { face: -1 }); ent('javelin', 156, 39, { face: -1 });
    // the bucket: it hangs from the gantry over the widest gap (117-126) and swings from tower to tower
    S.R.moversExtra = (S.R.moversExtra || []).concat([{ kind: 'swing', px: 122 * TS, py: 41 * TS, arm: 80, x: 0, y: 0, w: 48, h: 8, period: 3.4, phase: 0, bucket: true }]);
    // tower B: the landing deck, and a chain up from it to the gantry
    for (const y of [46, 52, 58]) deck(127, 134, y); rungs(132, 41, 45); rungs(127, 47, 57); // (the lower decks catch a short jump off the bucket, and the rungs climb back)
    ent('hearthgob', 130, 57, { face: -1 }); coins([129, 51], [131, 51], [133, 51]);
    // tower C: the hoist's crane and a deck below with a silver on it; the chain back up if you get off there
    for (const y of [48, 56]) deck(151, 157, y); rungs(151, 41, 55);
    ent('silver', 155, 55);
    S.R.moversExtra = S.R.moversExtra.concat([{ kind: 'lift', x: 160 * TS, y: 40 * TS, y0: 40 * TS, y1: 64 * TS, w: 32, h: 8, speed: 46, top: 36 * TS }]);
    // the poles, braces and the crane: drawn, grounded at the bottom of the pit
    ent('scaffold', 109, 40, { x1: 116 }); ent('scaffold', 127, 40, { x1: 134 }); ent('scaffold', 150, 36, { x1: 157, crane: true }); // (the crane's jib reaches four tiles past the tower, over the hoist)
    ent('torch', 106, 63); ent('torch', 164, 63); ent('deco', 168, 63, { kind: 'barrels' });
  }
  const L1 = S.done();

  // ---- THE ROAD UP (opened at column 0, 140 wide) ----
  const M = grow(L1, L1, 0, 140); shiftCrown(M.R, 0, 140);
  { const { block, ent, set, coins } = M, BOT = M.R.H - 1;
    const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
    // the gully: a rock wall on the left, the mountain on the right, and five terraces between that the road
    // zig-zags up, each shelf cut into the rock on one side, a pair of rock steps up at the open end
    block(0, 40, 96, BOT); block(0, 2, 72, 95); block(41, 64, 72, BOT);
    block(3, 8, 94, 95); block(3, 6, 92, 93);            // T1 -> T2, on the left
    block(9, 40, 90, 91);                                // T2, off the mountain
    block(37, 40, 88, 89); block(39, 40, 86, 87);        // T2 -> T3, on the right
    block(3, 36, 84, 85);                                // T3, off the wall
    block(3, 6, 82, 83); block(3, 4, 80, 81);            // T3 -> T4, on the left
    block(7, 40, 78, 79);                                // T4, off the mountain
    block(36, 40, 76, 77); block(38, 40, 74, 75);        // T4 -> the top, on the right
    block(0, 35, 72, 73);                                // T5: a spur back over the gully (a gibbet, and gold)
    ent('check', 12, 95);
    ent('npc', 15, 95, { kind: 'squire' });
    ent('sign', 18, 95, { text: 'HIGHCROWN IS AT THE TOP OF THIS ROAD. THE ROAD GOES UP THE GULLY IN FIVE TURNS, OVER THE SHOULDER, AND ACROSS TWO DROPS TO HER DRAWBRIDGE. THE WATCH CARRY BELLS: A SENTRY WHO SEES YOU RUNS FOR HIS. SEE HIM FIRST.' });
    ent('goat', 30, 89, { face: -1 }); ent('soldier', 20, 83, { face: 1 }); ent('goat', 26, 77, { face: -1 }); ent('javelin', 22, 71, { face: 1 });
    ent('deco', 23, 95, { kind: 'cairn' }); ent('deco', 28, 95, { kind: 'deadTree', v: 0 }); ent('deco', 12, 83, { kind: 'stone', v: 1 }); ent('deco', 20, 89, { kind: 'bones', v: 0 });
    ent('deco', 10, 71, { kind: 'hangCage' }); ent('deco', 30, 77, { kind: 'deadTree', v: 1 });
    coins([8, 93], [5, 91], [38, 87], [40, 85], [5, 81], [4, 79], [37, 75], [39, 73], [4, 70], [6, 70], [8, 70]);
    // the shoulder: an eyrie on the rocks, a broken engine from a siege that failed, the watchtower with its ladder
    ent('check', 44, 71);
    ent('deco', 46, 71, { kind: 'eyrie' }); ent('harpy', 47, 62); ent('harpy', 58, 60);
    block(51, 55, 61, 71); for (const x of [51, 53, 55]) set(x, 60, T.SOLID); for (let y = 61; y <= 71; y++) set(50, y, T.NET);
    ent('silver', 54, 59); ent('deco', 59, 71, { kind: 'siege' });
    // the gorge, a fall of water down its near side, and a rope bridge over it
    for (let x = 65; x <= 78; x++) set(x, 72, T.PLANK);
    ent('cascade', 64, 73, { y1: BOT });
    ent('deco', 64, 71, { kind: 'bridgepost' }); ent('harpy', 72, 63);
    // the barbican: a tower with a passage through it at the bridge's height
    block(79, 92, 56, BOT); air(79, 92, 68, 71); for (const x of [79, 82, 85, 88, 91]) set(x, 55, T.SOLID);
    M.R.interiors = (M.R.interiors || []).concat([[79, 92, 68, 71, 'stone']]);
    ent('torch', 85, 71); ent('heavy', 88, 71, { face: -1 }); /* a heavy knight holds the barbican */
    // a stone bridge that climbs to the castle's rock in broken steps, each on its own pier
    block(93, 96, 72, 73); block(94, 95, 74, BOT);
    block(99, 102, 70, 71); block(100, 101, 72, BOT);
    block(105, 108, 68, 69); block(106, 107, 70, BOT);
    block(110, 111, 66, 67); block(110, 111, 68, BOT);
    block(112, 139, 64, BOT);                            // the castle's rock, before the moat
    ent('harpy', 104, 60); ent('check', 116, 63);
    ent('deco', 122, 63, { kind: 'siege' }); ent('deco', 132, 63, { kind: 'hangCage' }); ent('deco', 127, 63, { kind: 'cairn' });
    coins([97, 69], [103, 67], [109, 65]);
  }
  // ---- HER GATES TAKE A KEY ----
  // They used to drop behind you and only open when the room was cleared. Now each is a portcullis with its key
  // on somebody in the room before it: find the key, open the gate, and fight whatever you feel like fighting.
  { const { ent, set, coins } = M;
    const port = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
    port(242, 58, 63); ent('lockgate', 242, 63, { needs: 'brass', h: 6 });
    port(392, 54, 63); ent('lockgate', 392, 63, { needs: 'iron', h: 10 });
    port(370, 10, 19); ent('lockgate', 370, 19, { needs: 'bone', h: 10 });
    ent('key', 228, 63, { kind: 'brass' }); ent('key', 380, 63, { kind: 'iron' }); ent('key', 358, 19, { kind: 'bone' });
    ent('sign', 232, 63, { text: 'THE WARD GATE IS BARRED AND THE KEY IS ON ONE OF THEM. THEY ARE NOT CARRYING IT WELL.' });
    ent('heavy', 236, 63, { face: -1 }); ent('soldier', 230, 63, { face: 1 }); ent('javelin', 224, 63, { face: -1 });
    ent('soldier', 384, 63, { face: -1 }); ent('javelin', 376, 63, { face: 1 }); ent('soldier', 388, 63, { face: -1 });
    ent('soldier', 362, 19, { face: -1 }); ent('heavy', 354, 19, { face: 1 }); ent('javelin', 366, 19, { face: -1 });

    // ---- THE ROAD UP: it was a long empty walk, and it is her road, so it is watched ----
    ent('deco', 186, 63, { kind: 'tent' }); ent('deco', 191, 63, { kind: 'tent' }); ent('brazier', 183, 63);
    ent('deco', 196, 63, { kind: 'barrels' }); ent('deco', 179, 63, { kind: 'spearRack' }); ent('deco', 200, 63, { kind: 'cart' });
    ent('sign', 177, 63, { text: 'THE ROAD PICKET. THERE IS A POT ON THE FIRE AND A GAME OF STONES HALF PLAYED. NOBODY HAS WATCHED THE ROAD IN A WHILE.' });
    ent('soldier', 188, 63, { face: 1 }); ent('javelin', 193, 63, { face: -1 }); ent('soldier', 198, 63, { face: -1 });
    coins([181, 62], [187, 62], [192, 62], [197, 62], [202, 62]);
    ent('deco', 208, 63, { kind: 'bones' }); ent('hound', 206, 63, { face: 1 }); ent('hound', 212, 63, { face: -1 });
    coins([205, 62], [209, 62], [213, 62]);
    ent('soldier', 218, 63, { face: -1 }); ent('archer', 168, 63, { face: 1 });
    ent('brazier', 172, 63); coins([170, 62], [174, 62], [220, 62]);
  }
  const R = M.done();
  // the old start by the drawbridge: the squire and her sign moved to the foot of the road
  R.ents = R.ents.filter(e => !((e.t === 'npc' && e.kind === 'squire' && e.x === 141) || (e.t === 'sign' && e.x === 140)));
  R.START = { x: 12, y: 95 };
  R.weather = [{ x0: 0, x1: 333 * TS, kind: 'snow' }]; R.ambient = [{ x0: 0, x1: 333 * TS, kind: 'wind' }];
  return R;
}

// THE TRIALS. A practice yard for each hero: stations in a row, each with a sign that says what to do, straw men
// to do it to, and a gate that lifts when it is done. Nothing in a trial can hurt you. The gate at the far end
// is the way out. (L.trial: the stations - where each starts, its gate, what counts, how many.)
function trialYard(hero) {
  const ST = {
    knight: [
      ['hit', 3, 'THE SWING. X STRIKES. HIT THE STRAW MAN THREE TIMES.', [['dummy', 16], ['dummy', 20]]],
      ['block', 3, 'THE SHIELD. HOLD C TO RAISE IT, AND FACE THE ARCHER. TURN THREE OF HIS ARROWS.', [['archer', 22]]],
      ['pogo', 3, 'THE PLUNGE. JUMP, THEN DOWN+X IN THE AIR. LAND ON THE STRAW MEN AND YOU BOUNCE: BOUNCE THREE TIMES.', [['dummy', 12], ['dummy', 16], ['dummy', 20]]],
      ['dodge', 2, 'THE DODGE. V ROLLS YOU THROUGH A BLOW. ROLL TWICE.', []]],
    pyro: [
      ['ember', 3, 'THE EMBER. TAP C AND ONE FLIES. SET THE STRAW MAN ALIGHT THREE TIMES.', [['dummy', 18]]],
      ['heat', 1, 'THE JET. HOLD C. EVERYTHING YOU BURN FILLS YOUR HEAT: BURN THE STRAW MAN UNTIL THE BAR IS FULL.', [['dummy', 14], ['dummy', 18]]],
      ['firedrop', 2, 'THE FIREDROP. JUMP, THEN DOWN+X IN THE AIR: A FIREBALL GOES DOWN AHEAD OF YOU. HIT A STRAW MAN FROM ABOVE TWICE.', [['dummy', 14], ['dummy', 19]]],
      ['dodge', 2, 'NO SHIELD. YOU DODGE: V. ROLL TWICE. YOUR OWN FIRE NEVER BURNS YOU.', []]],
    paladin: [
      ['hit', 3, 'THE MAUL. X, SLOW AND HEAVY: EVERY THIRD BLOW IN A RUN STAGGERS. EVERY BLOW FILLS THE LIGHT. HIT THE STRAW MAN THREE TIMES.', [['dummy', 18]]],
      ['aegis', 3, 'THE AEGIS. HOLD C: A WARD IN FRONT OF YOU FOR A BREATH AND A HALF, THEN IT MUST REST. TURN THREE ARROWS.', [['archer', 22]]],
      ['mend', 1, 'MEND. HALF THE LIGHT HEALS YOU: TAP C. IT ROOTS YOU A MOMENT. THE LIGHT HAS BEEN FILLED FOR YOU HERE.', []],
      ['hammerfall', 2, 'HAMMERFALL. JUMP, THEN DOWN+X IN THE AIR: THE GROUND CARRIES THE BLOW BOTH WAYS. CATCH THE STRAW MEN IN IT TWICE.', [['dummy', 12], ['dummy', 22]]],
      ['judgement', 1, 'JUDGEMENT. WITH A FULL LIGHT, PRESS C AGAIN AND THE SKY ANSWERS. IT HAS BEEN FILLED FOR YOU HERE.', [['dummy', 14], ['dummy', 20]]]],
  }[hero];
  const SW = 26, W = 8 + ST.length * SW + 26, H = 24; const L = painter(W, H);
  const { block, ent, set } = L;
  block(0, W - 1, 20, H - 1); block(0, 1, 0, 19); block(W - 2, W - 1, 0, 19);
  const trial = [];
  ST.forEach(([kind, n, text, things], i) => { const x0 = 4 + i * SW, gate = x0 + SW - 2;
    ent('sign', x0 + 2, 19, { text }); ent('torch', x0 + 6, 19);
    for (const [t, dx] of things) { if (t === 'archer') { block(x0 + dx - 2, x0 + dx + 2, 17, 19); ent('archer', x0 + dx, 16, { face: -1 }); } else ent('dummy', x0 + dx, 19); }
    for (let y = 14; y <= 19; y++) set(gate, y, T.PORT); block(gate, gate, 0, 13);
    trial.push({ x0, gate, kind, n, fill: kind === 'mend' ? 60 : kind === 'judgement' ? 100 : 0 }); });
  const xe = 4 + ST.length * SW;
  ent('sign', xe + 2, 19, { text: 'THE TRIAL IS DONE. THE GATE AHEAD TAKES YOU BACK TO THE MAP. THE HERO MENU WILL SEND YOU HERE AGAIN WHENEVER YOU LIKE.' });
  ent('gate', xe + 14, 19);
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: [], interiors: [], trial,
    duskStart: -1, duskLen: 1, music: 'select', reachExact: true,
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(200,120,80,0.12)', grass: '#6a8a3a', grassL: '#9ac050', grassD: '#3a5a24', dirt: '#4a3020', dirtL: '#5e3f2a', dirtD: '#2c1a10' },
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
  for (const [x0, x1] of [[41, 48], [52, 58], [62, 68], [72, 78], [82, 88], [92, 98], [102, 110]]) { plank(x0, x1, 21); for (const sx of [x0 + 1, x1 - 1]) ent('deco', sx, 24, { kind: 'stilt' }); } // three-tile gaps now, on stilts driven into the bog
  gusts.push({ x0: 40 * TS, x1: 112 * TS, y0: 8 * TS, y1: 24 * TS, dir: 1, period: 5, on: 4.2, phase: 0, moor: true, k: 1.6 });
  ent('flagpost', 44, 20); ent('flagpost', 76, 20); ent('flagpost', 108, 20);
  ent('kite', 62, 11); ent('kite', 92, 11); ent('sign', 42, 20, { text: 'THE CAUSEWAY. WAIT FOR THE GUST, THEN JUMP. THE BOG BELOW IS SLOW, AND SOMETHING IN IT DOES NOT LIKE A STANDING MAN.' });
  coins([50, 18], [60, 17], [70, 18], [80, 17], [90, 18], [100, 18]);

  // ---- 3. THE STONE CIRCLE: the wind spins round the ring, every gust the other way. The silver is on the centre stone. ----
  floor(111, 150, 22);
  menhir(116, 19, 21); menhir(144, 19, 21); menhir(130, 17, 21); ent('silver', 130, 16); ent('vent', 126, 21, { period: 4, on: 2.4, h: 100, wind: true });
  for (const x of [120, 124, 136, 140]) ent('deco', x, 21, { kind: 'stone', v: x % 3 });
  gusts.push({ x0: 112 * TS, x1: 149 * TS, y0: 8 * TS, y1: 23 * TS, dir: 1, period: 2.8, on: 2.0, phase: 0.4, alt: true, moor: true, k: 1.25 });
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
  gusts.push({ x0: 180 * TS, x1: 240 * TS, y0: 4 * TS, y1: 23 * TS, dir: 1, period: 6, on: 4.4, phase: 2, moor: true, k: 1.4 });
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
  gusts.push({ x0: 300 * TS, x1: 366 * TS, y0: 2 * TS, y1: 26 * TS, dir: 1, period: 5, on: 4.2, phase: 0, moor: true, k: 1.6 });
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
  gusts.push({ x0: 380 * TS, x1: 440 * TS, y0: 2 * TS, y1: 15 * TS, dir: 1, period: 3, on: 2.3, phase: 0, alt: true, moor: true, k: 1.5 });
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
  gusts.push({ x0: 444 * TS, x1: 508 * TS, y0: 0, y1: 14 * TS, dir: 1, period: 3.6, on: 2.7, phase: 0, alt: true, moor: true, k: 1.5 });
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
  gusts.push({ x0: 510 * TS, x1: 536 * TS, y0: 4 * TS, y1: 14 * TS, dir: 1, period: 3.4, on: 2.5, phase: 0, alt: true, moor: true, k: 1.4 });
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
  ent('sign', 870, 12, { text: 'THE SHAMAN OF THE MOOR. HE BLINKS FROM STONE TO STONE AND THROWS THE SKY AT YOU. STRIKE A BOLT, OR TAKE IT ON YOUR SHIELD, AND IT GOES BACK AT HIM AND KNOCKS HIM OFF HIS STONE. EVERY THIRD TIME HE COMES DOWN TO THE GROUND TO GATHER SOMETHING BIG: THAT IS YOUR MOMENT.', pyro: 'THE SHAMAN OF THE MOOR. HE BLINKS FROM STONE TO STONE AND THROWS THE SKY AT YOU. STRIKE A BOLT WITH YOUR STAFF AND IT GOES BACK AT HIM AND KNOCKS HIM OFF HIS STONE. EVERY THIRD TIME HE COMES DOWN TO THE GROUND TO GATHER SOMETHING BIG: THAT IS YOUR MOMENT.', paladin: 'THE SHAMAN OF THE MOOR. HE BLINKS FROM STONE TO STONE AND THROWS THE SKY AT YOU. STRIKE A BOLT, OR TAKE IT ON THE AEGIS, AND IT GOES BACK AT HIM AND KNOCKS HIM OFF HIS STONE. EVERY THIRD TIME HE COMES DOWN TO THE GROUND TO GATHER SOMETHING BIG: THAT IS YOUR MOMENT.' });
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
// ============================================================================================
// LEVEL 12 - THE LONG WATER. Three days after the Queen fell, the melt off Highcrown began to run salt. The goblins paid
// the deep a tribute for a hundred years to keep it asleep; the tribute has stopped, and the sea is coming inland to
// collect. Down the mountain's back face on the falls, down the river on the Ferryman's raft with the Bore coming up it,
// into SALTREACH at the river mouth, where the Tidebound are walking up the streets - and the Tide Herald is waiting in
// the square with the sea behind him.
// Its own look: the shore tile set, the sea sky and coast parallax, swim pools, waterfalls, the Bore, the tide.
function longWater() {
  const W = 416, H = 40; const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const pools = [], falls = [], movers = [];
  const shallow = (x0, x1, top, d) => { const rows = Math.max(1, Math.round(d / TS)); air(x0, x1, top, top + rows - 1); pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: top * TS + 2, shallow: true, depth: rows * TS - 2 }); };
  const deep = (x0, x1, top, bottom, extra) => pools.push(Object.assign({ x0: x0 * TS, x1: (x1 + 1) * TS, y: top * TS + 4, shallow: false, swim: true, clear: true, bottom: bottom * TS }, extra || {}));
  const fall = (lipX, y0, y1) => falls.push({ x0: (lipX + 1) * TS - 6, x1: (lipX + 1) * TS + 20, y0: y0 * TS + 1, y1: y1 * TS + 6 }); // pours off the lip at lipX into the next terrace, out of the channel above it
  const plunge = (x0, x1, top, depth) => { air(x0, x1, top, top + depth - 1); deep(x0, x1, top, top + depth); };

  // ---- 1. THE MELTFALLS: Highcrown's back face, five terraces and a fall off every lip ----
  block(0, 13, 8, H - 1);
  ent('npc', 4, 7, { kind: 'squire' });
  ent('sign', 2, 7, { text: 'THE LONG WATER. THE MELT OFF THE MOUNTAIN RUNS SALT. THERE ARE BARNACLES ON THE STONES UP HERE, A HUNDRED MILES FROM THE SEA. FOLLOW THE WATER DOWN.' });
  ent('check', 4, 7); shallow(8, 13, 8, 16); // the stream on the top ledge, running for the lip
  fall(13, 8, 12);
  block(14, 33, 12, H - 1); plunge(14, 18, 12, 3); ent('eel', 16, 14);
  shallow(22, 33, 12, 16); ent('turtle', 27, 12, { face: -1 });
  for (const x of [24, 29]) ent('deco', x, 12, { kind: 'coralTuft', v: x % 3 });
  ent('sign', 20, 11, { text: 'CORAL, GROWING IN A MOUNTAIN STREAM. THE FALLS HAVE POOLS UNDER THEM: THE WATER IS DEEP, BUT YOU CAN SWIM. HOLD UP TO RISE, DOWN TO DIVE, JUMP AT THE SURFACE TO CLIMB OUT.' });
  coins([16, 13], [17, 13], [19, 10], [22, 10], [24, 9], [26, 9], [28, 9], [30, 10]); ent('crab', 31, 11, { face: -1 });
  fall(33, 12, 16);
  block(34, 55, 16, H - 1); plunge(34, 38, 16, 3);
  ent('eel', 36, 18); coins([35, 18], [37, 18]); // the second pool, for anyone who dives
  air(30, 33, 13, 15); ent('silver', 31, 15); coins([32, 15], [30, 15]); // the cave behind the second fall
  shallow(41, 55, 16, 16); ent('heronfoe', 47, 15, { face: -1 });
  ent('deco', 40, 15, { kind: 'barnacleRock', v: 0 }); ent('deco', 53, 16, { kind: 'saltCrust', v: 1 });
  coins([41, 14], [44, 15], [45, 13], [47, 13], [49, 13], [51, 15], [54, 14], [36, 15], [38, 15], [43, 13], [52, 13]);
  fall(55, 16, 20);
  block(56, 79, 20, H - 1); plunge(56, 60, 20, 3); ent('eel', 58, 22);
  ent('deco', 66, 19, { kind: 'drownedHut' }); ent('check', 63, 19);
  ent('sign', 70, 19, { text: 'THE SCOUTS ARE NOT GOBLINS. THEY ARE TALLER, AND THEY DO NOT SPEAK, AND THEY THROW A HARPOON HARDER THAN A MAN CAN.' });
  ent('sign', 62, 19, { text: 'THE SHEPHERD\'S HUT. THE WATER CAME UP THE HILL IN THE NIGHT. THERE ARE FISH IN THE CHIMNEY. SOMEONE PALE WAS WATCHING FROM THE ROCKS.' });
  block(73, 79, 18, 19); shallow(74, 79, 18, 16); ent('scout', 69, 19, { face: 1 }); ent('scout', 77, 17, { face: -1 });
  coins([57, 22], [59, 22], [62, 18], [64, 18], [67, 17], [70, 17], [75, 16], [78, 16], [61, 19], [65, 18], [72, 17], [76, 16]);
  fall(79, 18, 24);
  block(80, 105, 24, H - 1); plunge(80, 91, 24, 4); ent('eel', 84, 27); ent('eel', 89, 27);
  shallow(96, 105, 24, 16); ent('check', 95, 23); ent('sign', 92, 23, { text: 'THE POOL UNDER THIS FALL IS DEEPER THAN THE OTHERS AND THERE ARE TWO EELS IN IT. THE COINS AT THE BOTTOM ARE WORTH ONE BREATH, NOT TWO.' });
  ent('crab', 99, 23, { face: -1 }); ent('turtle', 103, 23, { face: -1 });
  ent('deco', 93, 23, { kind: 'barnacleRock', v: 1 }); ent('deco', 103, 24, { kind: 'coralTuft', v: 1 });
  coins([81, 26], [83, 25], [86, 25], [87, 26], [89, 25], [90, 26], [92, 22], [96, 22], [100, 21], [103, 21], [104, 22]);
  fall(105, 24, 28);
  block(106, 127, 28, H - 1); shallow(110, 122, 28, 16); ent('heronfoe', 116, 27, { face: -1 });
  for (const x of [112, 119]) ent('deco', x, 28, { kind: 'coralTuft', v: x % 3 });
  for (const [x, y, k, v] of [[21, 11, 'barnacleRock', 0], [46, 16, 'coralTuft', 2], [68, 19, 'barnacleRock', 1], [101, 24, 'saltCrust', 1], [97, 24, 'coralTuft', 0], [124, 27, 'barnacleRock', 0], [124, 27, 'saltCrust', 1]]) ent('deco', x, y, { kind: k, v });
  block(128, 139, 27, H - 1); // the ferry dock
  ent('sign', 129, 26, { text: 'THE FERRY. STAND ON THE RAFT AND IT GOES. THE BORE COMES UP THE RIVER ON THE TIDE: ON THE RAFT IT ONLY LIFTS YOU; IN THE WATER GET UP ON A ROCK. THE ROCKS WILL KNOCK YOU OFF THE RAFT: JUMP THEM. AND DO NOT LISTEN TO THE SINGING.' });
  air(132, 138, 30, 32); air(139, 139, 29, 32); // THE SMUGGLERS' CUT: a dry room under the dock, its mouth in the river
  ent('silver', 134, 32); coins([136, 31], [137, 32], [133, 31]);
  ent('sign', 136, 32, { text: 'SOMEBODY KEPT THIS ROOM DRY UNDER THE DOCK, AND KEPT IT QUIET. THERE IS A ROPE LADDER CUT OFF AT THE TOP AND A CHEST WITH THE HINGES PRISED OFF.' });
  ent('check', 132, 26); ent('deco', 138, 26, { kind: 'seaLantern', v: 1 }); ent('deco', 136, 26, { kind: 'netPoles' }); // (the Ferryman used to stand here: the raft goes without him)
  coins([108, 26], [110, 26], [112, 25], [114, 25], [117, 24], [120, 25], [123, 26], [124, 25], [126, 26], [130, 25], [134, 25], [137, 25]); ent('scout', 124, 27, { face: -1 });

  // ---- 2. THE FERRY RUN: the river, the raft, the rocks, the sirens and the Bore ----
  block(140, 277, 34, H - 1); deep(140, 277, 28, 34, { river: true, flow: 34 }); // it is a river: it carries whatever is in it downstream
  // ---- THE SUNKEN CART: something went in here with a cart and never came up. Two breaths of trapped air
  // under the rocks, an old eel in the hollow, and the river pushing you off it the whole time.
  ent('sign', 137, 26, { text: 'SOMETHING WENT IN OFF THIS DOCK WITH A CART AND NEVER CAME UP. THE AIR UNDER THE ROCKS DOWNSTREAM WILL HOLD YOU IF YOU KNOW WHERE IT IS, AND THE RIVER WILL NOT WAIT WHILE YOU LOOK. THERE IS AN OLD EEL LIVING IN THE HOLLOW WITH IT.' });
  ent('deco', 196, 31, { kind: 'airBell' }); ent('deco', 228, 31, { kind: 'airBell' });
  ent('deco', 210, 33, { kind: 'rowboat' }); ent('deco', 220, 33, { kind: 'netPoles' });
  ent('eel', 206, 33, { big: true }); ent('eel', 222, 33); ent('siren', 200, 31); // THE OLD EEL is what the cart went in with
  ent('silver', 212, 33); coins([192, 30], [200, 32], [208, 33], [216, 32], [224, 31], [232, 30]);

  movers.push({ kind: 'raft', ferry: true, free: true, x0: 140 * TS, x1: 272 * TS, x: 140 * TS, y: 28 * TS - 4, w: 96, h: 8, speed: 58, big: true });
  for (const x of [166, 198, 232, 258]) block(x, x + 1, 26, 33); // rocks in the stream: jump them on the raft, stand on them in the water
  ent('check', 232, 25); // the middle rock: somewhere to come back to on a long river
  ent('siren', 166, 25, { face: -1 }); ent('siren', 198, 25, { face: -1 }); ent('siren', 258, 25, { face: -1 });
  ent('mover', 210, 24, { len: 3, range: 12, speed: 30 }); // a hatch cover, still drifting
  coins([212, 22], [216, 22], [220, 22]);
  ent('eel', 176, 31); ent('eel', 214, 31); ent('eel', 246, 31);
  coins([233, 25], [234, 24]);
  coins([152, 26], [156, 24], [160, 25], [164, 24], [172, 25], [178, 24], [184, 26], [190, 25], [196, 23], [206, 25], [212, 24], [220, 26], [226, 25], [230, 23], [236, 24], [240, 25], [244, 24], [250, 26], [256, 23], [262, 24], [266, 25], [270, 24]);
  coins([150, 32], [190, 32], [224, 32], [268, 32]); // down on the riverbed, for a held breath

  // ---- 3. SALTREACH: the fishing town at the river mouth, half in the water ----
  block(278, 299, 27, H - 1);
  ent('check', 282, 26); ent('npc', 287, 26, { kind: 'squire' });
  ent('sign', 280, 26, { text: 'SALTREACH. HALF THE TOWN IS IN THE WATER AND THE TIDEBOUND ARE WALKING UP THE STREETS, TAKING THE FISHERFOLK DOWN WITH THEM. THE LOW STREET FLOODS WITH THE TIDE; THE JETTY STAYS DRY.' });
  for (const [x, v] of [[291, 0], [297, 1]]) ent('deco', x, 26, { kind: 'fishCottage', v });
  block(300, 331, 29, H - 1); plat(300, 26, 32); // the low street, and the jetty over it
  pools.push({ x0: 300 * TS, x1: 332 * TS, y: 29 * TS + 2, base: 29 * TS, tideLo: 2, tideHi: -28, tidePeriod: 20, swim: true, shallow: true, depth: 0, bottom: 29 * TS, runTide: true });
  ent('sign', 300, 25, { text: 'THE LOW STREET. AT HIGH WATER THIS IS A CANAL AND THE JETTY IS THE ONLY DRY ROAD. AT LOW WATER THERE IS SILVER OUT ON THE FLATS.' });
  ent('sluice', 302, 25); ent('sign', 305, 25, { text: 'THE SLUICE. THE TOWN USED IT TO DRAIN THE LOW STREET AFTER A SPRING TIDE. STRIKE THE WHEEL AND YOU HAVE A WHILE ON THE FLATS BEFORE THE SEA COMES BACK.' });
  ent('deco', 303, 28, { kind: 'rowboat' }); ent('deco', 327, 28, { kind: 'netPoles' }); ent('silver', 330, 28); // the sand flats under the jetty's far end: walk them at low tide, swim them at high
  ent('stray', 305, 28, { kind: 'fisher' }); ent('tideguard', 309, 28, { face: -1 });
  ent('crab', 319, 28, { face: -1 }); ent('crab', 325, 28, { face: 1 });
  coins([284, 25], [289, 25], [294, 25], [302, 25], [304, 27], [312, 27], [314, 25], [320, 27], [322, 28], [308, 24], [318, 24], [324, 25], [328, 24]);
  block(332, 367, 27, H - 1);
  for (const [x, v] of [[336, 0], [344, 1], [352, 0], [360, 1]]) ent('deco', x, 26, { kind: 'fishCottage', v });
  for (const x of [334, 349, 365]) ent('deco', x, 26, { kind: 'seaLantern', v: 1 });
  ent('stray', 341, 26, { kind: 'fisher' }); ent('tideguard', 345, 26, { face: -1 });
  ent('stray', 358, 26, { kind: 'fisher' }); ent('tideguard', 355, 26, { face: 1 }); ent('scout', 363, 26, { face: -1 });
  ent('deco', 333, 26, { kind: 'bellTower' });
  ent('check', 364, 26); ent('sign', 350, 26, { text: 'THE TRIBUTE CHEST STANDS OPEN IN THE STREET AND NOBODY HAS TOUCHED IT. WHATEVER THEY ARE TAKING, IT IS NOT GOLD.' });
  ent('deco', 339, 26, { kind: 'buoy' }); ent('deco', 353, 26, { kind: 'tributeChest' });
  coins([335, 24], [338, 25], [340, 24], [343, 25], [348, 25], [351, 24], [356, 25], [359, 24], [362, 25], [366, 25], [333, 25], [346, 24], [354, 24], [364, 24]);

  // ---- 4. THE SQUARE: the Tide Herald. The sea comes up the square in three steps; the stones in it are the dry ground ----
  block(368, 408, 30, H - 1);
  block(372, 375, 28, 29); block(378, 380, 27, 29); block(386, 390, 28, 29); block(393, 394, 28, 29); block(395, 397, 26, 29); block(402, 405, 28, 29); /* a step up to the high stone, or it walled the square in two */
  block(409, 411, 28, H - 1); block(412, W - 1, 27, H - 1);
  pools.push({ x0: 369 * TS, x1: 409 * TS, y: 30 * TS + 6, base: 30 * TS, swim: true, shallow: true, depth: 0, bottom: 30 * TS, arenaTide: true });
  ent('herald', 391, 29);
  ent('sign', 366, 26, { text: 'THE SQUARE. SOMEONE IS STANDING ON THE WATER. WHEN THE TIDE GOES OUT IT LEAVES HIM IN THE MUD: THAT IS WHEN HE CAN BE HURT.' });
  ent('gate', 414, 26);

  const ret = {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 7 }, pools, falls, moversExtra: movers,
    duskStart: 99999, duskLen: 1, music: 'longwater', night: false,
    wetZone: [0, 107], bore: { x0: 140 * TS, x1: 278 * TS, surface: 28 * TS + 4, period: 12, speed: 280, h: 30 },
    quest: { n: 3, item: 'fisher', name: 'FISHERFOLK', npc: 'squire', done: 'THE FISHERFOLK ARE SAFE', reward: 'relic', relic: 'tidecharm' },
    palette: { set: 'shore', sky: 'sea', far: 'sea', mid: 'coast', near: 'shore', fg: 'shore', dress: 'shore', haze: 'rgba(248,220,176,0.10)',
      grass: '#7a9a5a', grassL: '#a8c47a', grassD: '#5a7a44', dirt: '#555e68', dirtL: '#6f7a84', dirtD: '#3e454e', canopy: ['#2a4a44', '#3a5e54', '#4a7264', '#6a8a70'] },
    weather: [{ x0: 0, x1: 108 * TS, kind: 'mist' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 369 * TS, x1: 409 * TS, floor: 30 * TS, trigger: 370 * TS, wallL: 368, wallR: 409, boss: 'herald', music: 'boss2', tint: '#3a8aa0', tintA: 0.08, fx: 'motes' },
  };
  const R1 = ret;
  // ---- 5. THE SLUICE STAIR: the old gates, and the piers of them riding up and down on the water ----
  const G = grow({ W: R1.W, H: R1.H, grid: R1.grid, ents: R1.ents }, R1, 350, 66);
  { const { block, plat, ent, coins, set } = G;
    const net = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET); };
    block(350, 358, 27, H - 1); block(407, 415, 27, H - 1);          // the two banks of it
    block(350, 415, 36, H - 1);                                       // and the floor of the channel under the water
    G.R.pools.push({ x0: 359 * TS, x1: 407 * TS, y: 30 * TS, bottom: 36 * TS, shallow: false, swim: true, sea: true, clear: true });
    net(357, 358, 26, 35); net(407, 408, 26, 35);                     // a way back up onto either bank out of the water
    // the gates themselves, standing over the channel, and the fall out of the near one
    ent('deco', 355, 26, { kind: 'netPoles' }); ent('deco', 411, 26, { kind: 'netPoles' }); // on the banks: there is nothing to stand on over the channel, and the nets are at 357 and 407
    ent('sluice', 356, 26); G.R.falls.push({ x0: 362 * TS - 6, x1: 362 * TS + 18, y0: 20 * TS, y1: 30 * TS + 6 });
    ent('sign', 352, 26, { text: 'THE SLUICE STAIR. THE PIERS RIDE UP AND DOWN ON THE WATER: TAKE ONE AS IT COMES UP AND BE OFF IT BEFORE IT GOES. THE SCOUTS ON THE FAR BANK WILL NOT WAIT FOR YOU.' });
    ent('check', 354, 26);
    // SIX PIERS. Each one rises out of the channel and sinks back on its own beat: read them, do not rush them.
    const piers = [[365, 0.0], [372, 0.35], [379, 0.7], [386, 0.15], [393, 0.5], [400, 0.85]];
    for (const [x, ph] of piers) ent('mover', x, 34, { len: 3, range: 0, vert: true, rise: 8, period: 3.4, ph, stone: true });
    coins([366, 26], [373, 26], [380, 26], [387, 26], [394, 26], [401, 26]);
    // and a high road for anyone who would rather not: three planks off the gate frames, and a rope between them
    plat(363, 20, 3); plat(371, 18, 3); plat(380, 20, 3); plat(389, 18, 3); plat(398, 20, 3);
    coins([364, 19], [372, 17], [381, 19], [390, 17], [399, 19]);
    G.R.moversExtra.push({ kind: 'swing', px: 376 * TS, py: 12 * TS, arm: 88, x: 0, y: 0, w: 32, h: 8, period: 3.2, phase: 0.5 });
    G.R.moversExtra.push({ kind: 'swing', px: 394 * TS, py: 12 * TS, arm: 96, x: 0, y: 0, w: 32, h: 8, period: 3.6, phase: 2.2 });
    // who is holding it
    ent('scout', 411, 26, { face: -1 }); ent('scout', 413, 26, { face: -1 }); ent('tideguard', 409, 26, { face: -1 });
    ent('siren', 370, 32); ent('siren', 390, 33); ent('eel', 382, 34);
    ent('silver', 386, 17);
    ent('sign', 410, 26, { text: 'PAST THE STAIR. THE SQUARE IS AHEAD AND THE SEA IS STANDING IN IT.' });
  }
  return G.done();
}

// THE SHIPWRECK REEF. The Herald's glaive pointed out to sea, and this is what it pointed at: the reef where the
// tribute fleet went down, and the ROYAL SEALS with it. Four ways of moving, one after the other. THE TIDEWAY: the
// backs of wrecked hulls, crossed between tides, with the rigging as the high road when the sea is up. THE WRECKS:
// the inside of a carrack lying on her side, decks to climb while the hold fills. THE REEF SHELF: all underwater,
// where breath is the clock, air bells are the safe beats and the currents decide what you can reach. THE KEEL: the
// tribute ship herself, up her ribs to the stern cabin. Then the hole at the end of it, and what lives in the hole.
function shipwreckReef() {
  const W = 460, H = 44; const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const net = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET); };
  const pools = [], movers = [], gusts = [], darkZones = [];
  const deep = (x0, x1, top, bottom, extra) => pools.push(Object.assign({ x0: x0 * TS, x1: (x1 + 1) * TS, y: top * TS + 4, shallow: false, swim: true, clear: true, bottom: bottom * TS }, extra || {}));
  const current = (x0, x1, y0, y1, dir) => gusts.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y0: y0 * TS, y1: y1 * TS, dir, period: 1e9, on: 1e9, phase: 0, k: 1, current: true });

  // ---- 1. THE TIDEWAY: the backs of the wrecks, and the sea coming and going over them ----
  block(0, 12, 28, H - 1);
  ent('npc', 4, 27, { kind: 'squire' });
  ent('sign', 2, 27, { text: 'THE SHIPWRECK REEF. THE TRIBUTE NEVER STOPPED: THE SHIP CARRYING IT WENT DOWN HERE, AND THE THREE ROYAL SEALS WITH HER. BRING THEM BACK AND THE SEA HAS NO QUARREL LEFT. THE TIDE COMES OVER THE LOW HULLS: TAKE THE RIGGING WHEN IT DOES.' });
  ent('check', 9, 27);
  block(13, 118, 33, H - 1); // the reef bed under it all
  block(16, 26, 26, 32); block(30, 42, 27, 32); block(46, 58, 25, 32); block(62, 74, 27, 32); block(78, 92, 26, 32); block(96, 118, 24, 32);
  pools.push({ x0: 13 * TS, x1: 119 * TS, y: 33 * TS - 20, base: 33 * TS, tideLo: -20, tideHi: -148, tidePeriod: 22, swim: true, shallow: true, depth: 0, bottom: 33 * TS, runTide: true, bell: true });
  net(28, 29, 17, 25); net(60, 61, 15, 24); net(94, 95, 16, 23); // the shrouds: the high road when the sea is over the backs
  plat(30, 18, 12); plat(50, 16, 10); plat(76, 17, 18); // spars across, from shroud to shroud
  ent('deco', 22, 25, { kind: 'mastStump' }); ent('deco', 52, 24, { kind: 'mastStump' });
  ent('deco', 36, 26, { kind: 'sailRag', v: 0 }); ent('deco', 84, 25, { kind: 'sailRag', v: 1 });
  ent('deco', 66, 26, { kind: 'wreckBow' }); ent('deco', 104, 23, { kind: 'capstan' });
  for (const [x, y, v] of [[20, 25, 0], [48, 24, 1], [88, 25, 2], [108, 23, 0]]) ent('deco', x, y, { kind: 'coralFan', v });
  for (const [x, y, r] of [[43, 22, 5], [59, 21, 5], [75, 22, 6]]) ent('mover', x, y, { len: 2, range: r, speed: 26 }); // wreckage still afloat: the high road between the shrouds
  ent('seabell', 100, 23); ent('sign', 98, 23, { text: "A SHIP'S BELL, STILL ON ITS BRACKET. STRIKE IT: THE BIRDS GO UP OFF THE WRECKS, AND THE DROWNED STOP WHAT THEY ARE DOING TO LISTEN." });
  ent('sailor', 50, 24, { face: -1 }); ent('sailor', 86, 25, { face: -1 }); ent('netter', 106, 23, { face: -1 });
  ent('petrel', 40, 19); ent('petrel', 88, 17);
  ent('urchin', 36, 31); ent('urchin', 70, 31);
  ent('sign', 18, 25, { text: 'THE WRECKS LIE WHERE THE REEF PUT THEM. HOLD UP TO CLIMB THE SHROUDS. AND WATCH THE WATER: WHEN IT RISES THE LOW BACKS GO UNDER, AND SO DO YOU.' });
  ent('silver', 51, 15); ent('check', 100, 23);
  coins([18, 25], [24, 25], [33, 26], [38, 26], [50, 24], [55, 24], [66, 26], [72, 26], [80, 25], [90, 25], [100, 23], [110, 23]);
  coins([31, 17], [36, 17], [42, 17], [52, 15], [56, 15], [78, 16], [84, 16], [90, 16]);

  // ---- 2. THE WRECKS: inside the carrack, decks up out of a hold that fills ----
  block(119, 121, 8, H - 1); block(210, 212, 8, H - 1); block(119, 212, 32, H - 1);
  air(119, 121, 21, 23); // the gash in her side you walk in through
  block(122, 209, 6, 7); // her flank overhead: the inside of a ship, not the sky
  plat(124, 28, 20); plat(152, 28, 18); plat(184, 28, 22);
  plat(130, 23, 22); plat(166, 23, 26);
  plat(124, 18, 18); plat(150, 18, 20); plat(186, 18, 20);
  plat(126, 13, 30); plat(170, 13, 34);
  net(146, 147, 14, 31); net(196, 197, 9, 22); // companionway ropes, bottom to top
  air(210, 212, 29, 31); // the breach in her side: out into the reef
  air(162, 172, 33, 35); for (const x of [160, 161]) for (let y = 33; y <= 35; y++) set(x, y, T.CRATE); // HER STRONGROOM, cargo stacked across the door
  ent('silver', 170, 35); coins([164, 35], [166, 34], [168, 35], [171, 34]);
  ent('sign', 164, 35, { text: 'THE STRONGROOM. THE TRIBUTE WENT DOWN WITH HER AND NOBODY CAME BACK FOR IT. THE LOCK IS STILL SET FROM THE INSIDE.' });
  ent('capstan', 198, 27, { link: 'hoist' }); ent('sign', 194, 27, { text: 'THE CARGO HOIST. THREE TURNS OF THE CAPSTAN AND THE CHAIN RUNS FREE: STAND ON THE PALLET AND IT WILL TAKE YOU UP HER DECKS.' });
  ent('deco', 133, 31, { kind: 'seaChest' }); ent('stray', 150, 31, { kind: 'seal' });
  ent('deco', 160, 31, { kind: 'wheel' }); ent('deco', 190, 27, { kind: 'rigging', v: 0 }); ent('deco', 172, 22, { kind: 'rigging', v: 1 });
  ent('deco', 142, 12, { kind: 'shipBell' }); ent('deco', 200, 12, { kind: 'figurehead' });
  ent('check', 130, 12); ent('check', 200, 27); ent('sign', 128, 12, { text: 'HER HOLD FILLS AND EMPTIES WITH THE SEA OUTSIDE. THE FIRST SEAL IS DOWN THERE IN THE DARK. GO DOWN WHEN THE WATER GOES OUT, AND CLIMB WHEN IT COMES BACK.' });
  movers.push({ kind: 'lift', link: 'hoist', locked: true, x: 202 * TS, y: 27 * TS, y0: 27 * TS, y1: 12 * TS, w: 32, h: 8, speed: 34 }); // the pallet: it runs her whole side once the capstan is turned
  pools.push({ x0: 122 * TS, x1: 210 * TS, y: 32 * TS - 8, base: 32 * TS, tideLo: -8, tideHi: -272, tidePeriod: 26, swim: true, shallow: true, depth: 0, bottom: 32 * TS, runTide: true, bell: false });
  ent('sailor', 136, 27, { face: 1 }); ent('sailor', 176, 22, { face: -1 }); ent('sailor', 196, 17, { face: -1 });
  ent('netter', 160, 17, { face: 1 }); ent('netter', 190, 12, { face: -1 });
  ent('urchin', 128, 30); ent('urchin', 168, 30); ent('urchin', 200, 30);
  coins([178, 12], [180, 12]);
  coins([126, 27], [131, 27], [156, 27], [162, 27], [188, 27], [194, 27]);
  coins([134, 22], [140, 22], [170, 22], [176, 22], [182, 22]);
  coins([128, 17], [134, 17], [154, 17], [160, 17], [190, 17], [196, 17]);
  coins([130, 12], [136, 12], [148, 12], [174, 12], [182, 12], [196, 12]);

  // ---- 3. THE REEF SHELF: under the whole way, on one breath at a time ----
  block(213, 330, 0, 12); block(213, 330, 37, H - 1);
  block(232, 234, 20, 36); block(258, 260, 13, 24); block(258, 260, 30, 36); block(286, 288, 21, 36); block(310, 312, 13, 26);
  // coral pillars, and the way through weaves: over the first, through the window in the second, over the third, under the fourth
  block(262, 280, 34, 36); block(296, 308, 33, 36);
  deep(210, 330, 13, 37, { reef: true, capped: true, flow: -26 }); // rock all the way over it: there is no surface to breathe at, and the sea under it sets you back the way you came
  darkZones.push({ x0: 262 * TS, x1: 331 * TS, y0: 12 * TS, y1: 38 * TS, dark: 0.72 }); // the deep half of the shelf: the anglers are the only lights in it
  current(236, 256, 14, 36, 1); current(290, 308, 14, 32, -1); // one carries you on, one stands in your way
  ent('check', 270, 33); ent('check', 302, 32);
  ent('sign', 264, 33, { text: 'THE DEEP HALF OF THE SHELF IS BLACK. THE LIGHTS DOWN THERE ARE NOT LANTERNS: THEY ARE ON THE ENDS OF STALKS, AND THEY ARE ATTACHED TO SOMETHING.' }); // the two coral humps you can stand on, down here
  for (const [x, y] of [[226, 36], [244, 36], [262, 33], [278, 33], [298, 32], [316, 36]]) ent('deco', x, y, { kind: 'airBell' }); // a bell every few strokes: the breath is the clock down here
  ent('sign', 218, 36, { text: 'NO AIR DOWN HERE BUT WHAT THE DIVING BELLS HOLD. SWIM TO A BELL BEFORE YOUR BREATH GOES. THE CURRENT WILL CARRY YOU IF YOU LET IT, AND HOLD YOU IF YOU FIGHT IT.' });
  for (const [x, y, v] of [[220, 36, 0], [244, 36, 1], [266, 33, 2], [300, 32, 0], [322, 36, 1]]) ent('deco', x, y, { kind: 'kelpTall', v });
  for (const [x, y, v] of [[238, 36, 0], [276, 33, 1], [316, 36, 0]]) ent('deco', x, y, { kind: 'brainCoral', v });
  ent('deco', 250, 36, { kind: 'urchinRock', v: 0 }); ent('deco', 294, 36, { kind: 'urchinRock', v: 1 });
  ent('mover', 290, 30, { len: 3, range: 16, speed: 42 }); // a drifting plank: ride it through the current that will not let you swim
  ent('urchin', 240, 26); ent('urchin', 254, 20); ent('urchin', 282, 28); ent('urchin', 300, 22); ent('urchin', 318, 30);
  ent('angler', 264, 30, { face: -1 }); ent('angler', 292, 24, { face: -1 }); ent('angler', 320, 28, { face: -1 });
  ent('eel', 224, 34); ent('eel', 276, 32);
  block(320, 328, 16, 19); air(321, 327, 17, 18); // the alcove the adverse current guards
  ent('stray', 324, 18, { kind: 'seal' });
  ent('silver', 255, 15);
  coins([218, 33], [224, 30], [230, 27], [238, 24], [244, 22], [250, 18], [256, 16], [264, 20], [272, 26], [280, 30], [290, 28], [298, 24], [306, 20], [314, 18], [322, 22], [328, 30]);

  // ---- 4. THE KEEL: the tribute ship, up her ribs to the stern cabin ----
  block(331, 345, 30, H - 1); block(346, 352, 28, H - 1); block(353, 362, 26, H - 1);
  block(366, 374, 24, H - 1); block(378, 386, 22, H - 1);
  block(382, 400, 16, 17); block(382, 383, 17, 21); block(398, 400, 17, 21);
  air(382, 383, 19, 20); plat(377, 21, 6); // her cabin door, and the gangway to it off the ribs
  block(382, 400, 21, 21);
  net(376, 377, 14, 23); net(364, 365, 19, 25); // her ribs, standing out of the reef and up past her cabin roof
  block(331, 340, 38, H - 1); // (a pool used to be carved here, entirely inside solid rock: it did nothing but cost a draw)
  ent('check', 334, 29); ent('deco', 338, 29, { kind: 'wreckStern' });
  ent('sign', 336, 29, { text: 'THE TRIBUTE SHIP. THE LAST SEAL IS IN THE STERN CABIN, WHICH IS NOW THE ONLY DRY ROOM IN THE SEA. CLIMB HER RIBS.' });
  ent('deco', 356, 25, { kind: 'anchor' }); ent('deco', 370, 23, { kind: 'spar', v: 0 }); ent('deco', 390, 20, { kind: 'seaChest' });
  ent('deco', 344, 29, { kind: 'lanternBuoy', v: 1 }); ent('deco', 388, 20, { kind: 'shipBell' });
  ent('sign', 386, 20, { text: "THE CAPTAIN'S SEAL, STILL IN HER CABIN, AND THE WAX NOT EVEN CRACKED. SHE WENT DOWN WITH IT RATHER THAN HAND IT OVER. NOW YOU KNOW WHAT SHE WAS AFRAID OF." });
  ent('stray', 392, 20, { kind: 'seal' });
  ent('sailor', 348, 27, { face: -1 }); ent('sailor', 370, 23, { face: -1 }); ent('netter', 358, 25, { face: -1 });
  ent('petrel', 360, 18); ent('petrel', 386, 14);
  movers.push({ kind: 'lift', x: 404 * TS, y: 25 * TS, y0: 25 * TS, y1: 14 * TS, w: 32, h: 8, speed: 30 }); // the stern tackle, still rigged
  coins([404, 13], [408, 13], [396, 14], [392, 14]);
  ent('check', 404, 25);
  block(387, 412, 26, H - 1); block(413, 424, 28, H - 1); // the broken deck under her cabin, running on to the hole
  ent('sign', 406, 25, { text: 'THE HOLE AT THE END OF THE REEF. SOMETHING IN IT HAS BEEN EATING THE DEAD OF THIS SHIP FOR A HUNDRED YEARS. IT COMES OUT WHEN THE WATER IS HIGH: STAND ON THE STONES.' });
  coins([334, 29], [340, 29], [348, 27], [356, 25], [362, 25], [368, 23], [374, 23], [380, 21], [386, 21], [396, 20], [404, 25], [410, 25], [418, 27]);

  // ---- THE MAW: the arena, and the holes it lives in ----
  block(425, 456, 34, H - 1);
  block(430, 433, 31, 33); block(438, 442, 30, 33); block(447, 450, 31, 33); // coral stools: dry ground when the water comes up
  block(453, 456, 30, H - 1); block(457, W - 1, 29, H - 1);
  pools.push({ x0: 425 * TS, x1: 453 * TS, y: 34 * TS + 6, base: 34 * TS, swim: true, shallow: true, depth: 0, bottom: 34 * TS, arenaTide: true });
  ent('deco', 427, 33, { kind: 'airBell' }); ent('deco', 452, 33, { kind: 'airBell' });
  for (const x of [429, 437, 445, 451]) ent('deco', x, 33, { kind: 'bubbleVent' }); // its four holes, each one venting: watch which one is breathing
  ent('reefmaw', 440, 33);
  ent('gate', 458, 28);

  const ret = {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 27 }, pools, falls: [], moversExtra: movers, gusts, darkZones,
    duskStart: 99999, duskLen: 1, music: 'reef', night: false,
    interiors: [[34, 93, 26, 29, 'stone'], [116, 177, 22, 29, 'stone'], [247, 300, 24, 26, 'stone'], [302, 371, 17, 21, 'stone']], // ONLY the enclosed spaces: a backdrop that reaches above a deck hangs a stone wall in the sky
    wetZone: [0, 119], storm: true, dark: 0.01,
    hullZones: [[16, 26, 26, 30], [30, 42, 27, 31], [46, 58, 25, 29], [62, 74, 27, 31], [78, 92, 26, 30], [96, 118, 24, 28], [119, 212, 6, 34], [378, 400, 15, 25]], // her timbers; below them the reef takes over again
    quest: { n: 3, item: 'seal', name: 'ROYAL SEALS', npc: 'squire', done: 'THE SEALS ARE FOUND', reward: 'relic', relic: 'diverlamp' },
    palette: { set: 'reef', sky: 'storm', far: 'reef', mid: 'wrecks', near: 'reef', fg: 'reef', dress: 'reef', haze: 'rgba(180,200,205,0.12)',
      grass: '#5f7a68', grassL: '#88a890', grassD: '#40564a', dirt: '#4a5058', dirtL: '#666e78', dirtD: '#32363e', canopy: ['#1e3a3a', '#2c4e4a', '#3a6258', '#548070'] },
    weather: [{ x0: 0, x1: 213 * TS, kind: 'rain' }, { x0: 331 * TS, x1: 99999, kind: 'rain' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 425 * TS, x1: 453 * TS, floor: 34 * TS, y0: 24 * TS, trigger: 426 * TS, wallL: 424, wallR: 453, boss: 'reefmaw', music: 'boss2', tint: '#2a5a60', tintA: 0.1, fx: 'motes',
      holes: [429 * TS, 437 * TS, 445 * TS, 451 * TS] },
  };
  return ret;
}

// THE FLOTILLA. A pirate fleet lashed into a floating town over the drowned city, working the wrecks and paying the
// sea for the right. Four ships and the water between them: THE GALLEY (her oar deck full of Saltreach's missing
// fisherfolk), THE HULK (a rotted prize whose deck goes through under you, and whose hold is full), THE POWDER HOY
// (kegs, and a gun pointed at the flagship's side) and THE FLAGSHIP, where the Quartermaster falls back deck by deck
// and cuts the lines behind her. What moves is the water between the hulls: ropes to swing, planks to drop, nets to
// climb, and a long way down into the sea if you misjudge it.
function theFlotilla() {
  const W = 400, H = 40; const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const net = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET); };
  const rail = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.RAIL); };
  const rot = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SHELF); }; // planking that goes through under a standing weight
  const pools = [], movers = [], hullZones = [];

  // the sea the whole town floats on: fall in and you swim, and the nets down every side are how you get back up
  block(0, W - 1, 38, H - 1); block(377, W - 1, 11, 37); // past her stern the level ends: no water, nowhere to fall
  pools.push({ x0: 0, x1: W * TS, y: 30 * TS, bottom: 38 * TS, shallow: false, swim: true, clear: true, sea: true, harm: true, foulCol: '#7a8a3a', foulColL: '#b8c85a', foulColD: '#3a4a1e' }); // tar, bilge and worse: swim it and it eats you, so cross above it

  // ---- THE ROCK: the Ferryman will not go closer than this ----
  block(0, 22, 26, 37);
  ent('npc', 4, 25, { kind: 'squire' });
  ent('sign', 2, 25, { text: 'THE FLOTILLA. FOUR SHIPS LASHED TOGETHER AND A TOWN BUILT ON TOP OF THEM. THEY WORK THE WRECKS AND PAY THE SEA A SHARE. THE FISHERFOLK THEY PRESSED OUT OF SALTREACH ARE ON THE OARS OF THE FIRST ONE.' });
  ent('check', 8, 25); ent('deco', 17, 25, { kind: 'rowboat' });
  ent('sign', 14, 25, { text: 'THE WATER BETWEEN THE HULLS IS DEEP AND THE NETS DOWN THEIR SIDES ARE HOW YOU GET BACK OUT OF IT. NOBODY DROWNS HERE. THEY JUST GET SEEN.' });
  coins([6, 25], [12, 25], [18, 25]);

  // ---- the first crossing: a lashed spar, then a rope ----
  // FROM THE ROCK TO THE GALLEY: a spar, two crates riding the swell, and a rope to swing the last of it
  plat(23, 25, 4); net(29, 30, 26, 36);
  ent('mover', 26, 23, { len: 2, range: 0, bob: true }); ent('mover', 28, 20, { len: 2, range: 3, speed: 20, bob: true });
  coins([26, 22], [28, 18]);
  movers.push({ kind: 'swing', px: 29 * TS, py: 13 * TS, arm: 96, x: 0, y: 0, w: 32, h: 8, period: 3.0, phase: 0 });

  // ---- 1. THE GALLEY: long, low, and full of other people's neighbours ----
  block(31, 96, 24, 37); hullZones.push([31, 96, 24, 37]); // her hull goes to the bottom: the way past is over her, not under
  air(34, 93, 26, 29); // her oar deck
  air(58, 60, 24, 25); net(59, 59, 24, 29); // the hatch down to it, and the ladder back up
  rail(31, 34, 23); rail(93, 96, 23);
  net(50, 51, 12, 23); plat(47, 11, 7); // her shrouds and the crow's nest
  ent('lookout', 50, 10, { face: 1 });
  ent('sign', 36, 23, { text: 'THE GALLEY. HER OAR DECK IS UNDER YOUR FEET AND THE HATCH IS AMIDSHIPS. THE LOOKOUT IN HER TOPS HAS A WHISTLE: IF HE GETS IT TO HIS MOUTH, THE WHOLE TOWN KNOWS.' });
  for (const [x, y] of [[40, 29], [62, 29], [82, 29]]) ent('stray', x, y, { kind: 'fisher' });
  for (const x of [38, 60, 80]) ent('deco', x, 29, { kind: 'oarBench' });
  ent('deco', 44, 29, { kind: 'oar' }); ent('deco', 70, 29, { kind: 'oar' });
  // THE PRESS GANG: eight of them in the open with a bosun whistling them onto you. They come in a crowd
  // because a crowd is the only way they take anybody, and the crowd is the problem to solve.
  ent('cutlass', 44, 23, { face: -1 }); ent('cutlass', 50, 23, { face: -1 }); ent('cutlass', 56, 23, { face: 1 });
  ent('cutlass', 61, 23, { face: 1 }); ent('cutlass', 68, 23, { face: -1 }); ent('cutlass', 74, 23, { face: -1 });
  ent('cutlass', 84, 23, { face: 1 }); ent('cutlass', 90, 23, { face: -1 });
  ent('bosun', 78, 23, { face: -1 }); ent('bosun', 66, 29, { face: -1 }); ent('marine', 51, 10, { face: -1 });
  ent('sign', 42, 23, { text: 'THE PRESS GANG. EIGHT OF THEM AND A WHISTLE: GET YOUR BACK TO HER MAST AND SWING WIDE, OR TAKE THE BOSUN FIRST AND WATCH THEM STOP COMING.' });
  ent('sign', 56, 23, { text: 'THEIR GALLEY FIRE IS STILL LIT AND THERE IS A POT ON IT. WHOEVER WAS COOKING WENT UP ON DECK IN A HURRY.' });
  ent('deco', 54, 23, { kind: 'cookPot' }); ent('deco', 84, 23, { kind: 'washing' }); ent('deco', 88, 23, { kind: 'waterButt' });
  ent('deco', 66, 23, { kind: 'hammock', v: 0 }); ent('deco', 46, 23, { kind: 'coiledCable', v: 0 });
  // THE GALLEY'S RIG: two masts, her mainsail, shrouds either side, her colours at the truck
  for (const [x, v] of [[50, 0], [78, 1]]) ent('deco', x, 23, { kind: 'mastTall', v });
  ent('deco', 44, 16, { kind: 'sailRag', v: 0 }); ent('deco', 72, 15, { kind: 'sailRag', v: 1 });
  ent('deco', 56, 20, { kind: 'rigging', v: 0 }); ent('deco', 86, 20, { kind: 'rigging', v: 1 });
  ent('deco', 50, 9, { kind: 'pennant', v: 0 }); ent('deco', 78, 10, { kind: 'pennant', v: 2 });
  for (const x of [36, 48, 62, 76, 88]) ent('deco', x, 26, { kind: 'gunport', v: x % 2 });
  ent('deco', 33, 23, { kind: 'figurehead' }); ent('deco', 92, 23, { kind: 'boardingNet' });
  ent('check', 34, 23); ent('check', 88, 23);
  coins([36, 23], [42, 23], [48, 23], [56, 23], [64, 23], [72, 23], [80, 23], [90, 23]);
  coins([36, 29], [48, 29], [56, 29], [74, 29], [88, 29]);
  coins([50, 17], [50, 14], [49, 10], [52, 10]);

  // ---- the second crossing: a rope over open water, and a net up the prize's side ----
  // THE LONG GAP: their washing line of spars, two swinging ropes out of the tops, and nothing under it but the harbour
  movers.push({ kind: 'swing', px: 100 * TS, py: 9 * TS, arm: 112, x: 0, y: 0, w: 32, h: 8, period: 3.4, phase: 1.2 });
  movers.push({ kind: 'swing', px: 108 * TS, py: 8 * TS, arm: 120, x: 0, y: 0, w: 32, h: 8, period: 3.0, phase: 0.2 });
  ent('mover', 98, 22, { len: 2, range: 0, bob: true }); ent('mover', 104, 19, { len: 2, range: 4, speed: 22, bob: true });
  ent('mover', 109, 22, { len: 2, range: 0, bob: true });
  net(110, 111, 18, 36);
  coins([98, 21], [104, 17], [109, 21]);

  // ---- 2. THE HULK: a prize they never finished stripping ----
  block(113, 176, 22, 37); hullZones.push([113, 176, 22, 37]);
  rot(120, 130, 22); rot(146, 156, 22); // her planking is rotten through here
  air(116, 173, 24, 29); air(134, 138, 22, 23); // the hold, and the hole down into it
  pools.push({ x0: 116 * TS, x1: 174 * TS, y: 26 * TS, bottom: 30 * TS, shallow: false, swim: true, clear: true });
  net(170, 171, 22, 29); net(120, 121, 22, 29); // her ladders: up out of the flooded hold at either end
  ent('silver', 150, 29);
  ent('sign', 116, 21, { text: 'THE HULK. THEY TOOK HER TWO SUMMERS AGO AND NEVER FINISHED STRIPPING HER. THE GREY PLANKS WILL NOT HOLD A MAN: STAND ON ONE AND YOU WILL GO THROUGH TO WHAT IS UNDER IT.' });
  ent('boarder', 128, 21, { face: -1 }); ent('boarder', 162, 21, { face: -1 });
  // THE CHOKE: her boarding net is the only quick way through the hulk's waist and they are standing in the
  // doorway of it, where a wide swing catches the frame and a heavy blow does not.
  ent('boarder', 152, 21, { face: -1 }); ent('boarder', 156, 21, { face: -1 }); ent('bosun', 160, 21, { face: -1 });
  ent('cutlass', 168, 21, { face: -1 }); ent('cutlass', 130, 29, { face: 1 });
  ent('sign', 148, 21, { text: 'THEY HAVE THE NET DOORWAY. THERE IS NO ROOM IN IT FOR A WIDE SWING: COME THROUGH HEAVY, OR GO ROUND THROUGH HER HOLD.' });
  net(145, 146, 10, 21); ent('marine', 146, 9, { face: -1 });
  ent('sign', 144, 21, { text: 'THE HOLD IS FULL OF WATER AND SOMEBODY ELSE OWNED IT FIRST. THERE IS A LADDER AT EITHER END.' });
  ent('deco', 140, 21, { kind: 'plunder', v: 1 }); ent('deco', 168, 21, { kind: 'rumBarrels', v: 0 });
  ent('silver', 172, 28); // down in her flooded hold, under the rotten planking
  ent('deco', 124, 29, { kind: 'hammock', v: 1 }); ent('deco', 145, 9, { kind: 'crowNest' });
  net(145, 146, 10, 20); plat(144, 10, 3); // her mast is climbable and her top is a place to stand: the lookout up there was standing on nothing
  // THE HULK'S RIG: one mast still standing, her canvas in rags, her shrouds hanging off her
  ent('deco', 145, 21, { kind: 'mastTall', v: 1 }); ent('deco', 152, 14, { kind: 'sailRag', v: 1 });
  ent('deco', 122, 19, { kind: 'rigging', v: 1 }); ent('deco', 166, 19, { kind: 'rigging', v: 0 });
  ent('deco', 145, 8, { kind: 'pennant', v: 1 });
  for (const x of [120, 136, 150, 164]) ent('deco', x, 24, { kind: 'gunport', v: (x / 2) % 2 });
  ent('deco', 176, 21, { kind: 'boardingNet' }); ent('deco', 114, 21, { kind: 'boardingNet' });
  ent('check', 118, 21); ent('check', 168, 21);
  coins([118, 21], [134, 21], [142, 21], [160, 21], [172, 21]);
  coins([120, 28], [126, 28], [154, 28], [166, 28]);
  coins([145, 16], [146, 12]);

  // ---- the third crossing: their boarding plank, stowed upright until somebody drops it ----
  ent('plank', 176, 21, { span: [177, 182], row: 21 });
  ent('sign', 173, 21, { text: 'THEIR BOARDING PLANK IS STOWED AGAINST THE RAIL. KNOCK IT DOWN AND IT WILL REACH THE POWDER HOY. OR SWIM, AND CLIMB HER NET, AND BE SEEN DOING IT.' });
  net(181, 182, 24, 36); net(183, 184, 24, 29);
  ent('mover', 179, 22, { len: 2, range: 0, bob: true }); coins([179, 21]); // a hatch cover riding the swell, for anyone who will not drop the plank

  // ---- 3. THE POWDER HOY: what they blast wrecks open with ----
  block(183, 240, 25, 37); hullZones.push([183, 240, 25, 37]);
  rail(183, 186, 24);
  ent('keg', 192, 24); ent('keg', 206, 24); ent('keg', 220, 24);
  ent('deco', 198, 24, { kind: 'kegStack' }); ent('deco', 212, 24, { kind: 'chickenCoop' });
  ent('deco', 206, 24, { kind: 'mastTall', v: 0 }); ent('deco', 200, 17, { kind: 'sailRag', v: 0 });
  ent('deco', 206, 11, { kind: 'pennant', v: 2 }); ent('deco', 228, 22, { kind: 'rigging', v: 0 });
  for (const x of [190, 204, 218, 232]) ent('deco', x, 27, { kind: 'gunport', v: x % 2 });
  ent('deco', 184, 24, { kind: 'boardingNet' }); ent('deco', 240, 24, { kind: 'boardingNet' });
  ent('cannon', 232, 24, { hole: [245, 247, 24, 26] });
  ent('sign', 228, 24, { text: 'THE GUN IS LAID ON THE FLAGSHIP ALREADY: THEY WERE GOING TO CUT HER OUT IF THE SHARE WENT WRONG. STRIKE IT AND IT WILL OPEN HER SIDE. THE KEGS GO UP IF YOU HIT THEM, SO MIND WHERE YOU ARE STANDING.' });
  // THE RIGGING: three marines above her deck, shooting down it while you cross, and a spar to go up after them
  ent('marine', 198, 14, { face: -1 }); ent('marine', 210, 14, { face: -1 }); ent('marine', 222, 14, { face: -1 });
  ent('cutlass', 200, 24, { face: -1 }); ent('cutlass', 224, 24, { face: -1 }); ent('bosun', 214, 24, { face: 1 });
  ent('boarder', 236, 24, { face: -1 }); ent('cutlass', 190, 24, { face: 1 });
  net(196, 197, 15, 23); net(210, 211, 15, 23); net(224, 225, 15, 23);
  for (let x = 197; x <= 224; x++) set(x, 14, T.ONEWAY);
  coins([200, 13], [210, 13], [220, 13]);
  ent('sign', 194, 24, { text: 'MARINES IN HER RIGGING: THEY SHOOT DOWN THE DECK, SO DO NOT WALK IT. THE LINES GO UP EITHER SIDE OF THEM.' });
  ent('lookout', 188, 24, { face: 1 });
  ent('check', 186, 24);
  coins([190, 24], [196, 24], [204, 24], [216, 24], [226, 24], [236, 24]);

  // ---- the last crossing: her side, and the nets they board from ----
  net(243, 244, 16, 36);
  movers.push({ kind: 'swing', px: 242 * TS, py: 9 * TS, arm: 104, x: 0, y: 0, w: 32, h: 8, period: 3.2, phase: 2.1 });
  ent('mover', 242, 21, { len: 2, range: 0, bob: true }); coins([242, 20]);

  // ---- 4. THE FLAGSHIP ----
  block(245, 376, 22, 37); hullZones.push([245, 376, 22, 37]);
  air(248, 340, 24, 26); // her gun deck, behind the side the hoy's gun opens
  // HER DECKS: the fight wants a flat floor with things to jump onto, not walls to be cornered against, so
  // the quarterdeck and the poop are PLATFORMS on a few posts and the main deck runs clear from end to end.
  plat(300, 16, 77); block(300, 301, 17, 21); block(372, 376, 17, 21);
  plat(336, 11, 41); block(370, 371, 12, 15);
  ent('deco', 352, 15, { kind: 'sternWindows' });
  net(302, 303, 11, 21); net(330, 331, 6, 16); // the two quick ways up her: she cuts one, then the other
  net(366, 367, 11, 15); // and the stern ladder she cannot cut: whatever she does, there is a way after her
  block(292, 295, 19, 21); block(296, 299, 17, 21); // and the broken stair she cannot cut, up to her quarterdeck
  net(310, 311, 17, 26); // the ladder up out of her gun deck, for anyone the falling deck drops into it
  rail(245, 248, 21); rail(296, 299, 15);
  ent('sign', 250, 21, { text: 'THE FLAGSHIP. THE QUARTERMASTER HAS THE RUN OF HER AND SHE WILL NOT STAND AND FIGHT ON ONE DECK: SHE GOES UP, AND SHE CUTS AWAY WHAT SHE CAME UP BY.' });
  ent('marine', 306, 15, { face: -1 }); ent('marine', 340, 10, { face: -1 }); // they were standing in the air over her quarterdeck
  ent('cutlass', 262, 21, { face: -1 }); ent('cutlass', 284, 21, { face: -1 }); ent('boarder', 320, 15, { face: -1 });
  ent('cutlass', 274, 21, { face: 1 }); ent('bosun', 284, 21, { face: -1 }); ent('lookout', 316, 15, { face: 1 }); ent('cutlass', 344, 15, { face: -1 });
  for (const [x, y] of [[266, 21], [322, 21], [312, 15], [348, 10]]) ent('cannon', x, y, { deck: true });
  // HER AFT GUN DECK: it was fifty tiles of empty corridor under her quarterdeck. It is her magazine now.
  ent('deco', 334, 21, { kind: 'plunder', v: 1 }); ent('deco', 352, 21, { kind: 'kegStack' }); ent('deco', 344, 21, { kind: 'lanternDeck', v: 0 });
  ent('silver', 360, 21); ent('cutlass', 340, 21, { face: -1 }); ent('marine', 356, 21, { face: -1 });
  coins([330, 20], [338, 20], [346, 20], [354, 20], [362, 20]); ent('sign', 326, 21, { text: 'HER MAGAZINE. THE POWDER IS AFT AND HER GUNS ARE FORWARD, AND SHE WILL NOT THANK YOU FOR BEING DOWN HERE.' }); // HER OWN GUNS: when she goes behind her guard, bring one to bear
  ent('sign', 306, 15, { text: 'HER CHART HAS THE WRECKS MARKED, AND A RING DRAWN ROUND SOMETHING DEEPER, WITH A NOTE: THEIR SHARE, PAID MONTHLY.' });
  ent('deco', 312, 15, { kind: 'chartTable' }); ent('deco', 344, 10, { kind: 'plunder', v: 0 });
  ent('deco', 360, 10, { kind: 'plunder', v: 2 });
  ent('deco', 256, 26, { kind: 'lanternDeck', v: 1 }); ent('deco', 288, 26, { kind: 'rumBarrels', v: 1 });
  // THE FLAGSHIP: three masts, full canvas, and the black flag at her main truck
  for (const [x, v] of [[268, 0], [306, 1], [344, 0]]) ent('deco', x, 21, { kind: 'mastTall', v });
  ent('deco', 262, 13, { kind: 'sailRag', v: 0 }); ent('deco', 300, 8, { kind: 'sailRag', v: 1 }); ent('deco', 338, 4, { kind: 'sailRag', v: 0 });
  ent('deco', 268, 9, { kind: 'pennant', v: 1 }); ent('deco', 306, 4, { kind: 'pennant', v: 1 }); ent('deco', 344, 0, { kind: 'pennant', v: 1 });
  ent('deco', 280, 19, { kind: 'rigging', v: 0 }); ent('deco', 326, 19, { kind: 'rigging', v: 1 });
  for (const x of [252, 264, 276, 288, 316, 330]) ent('deco', x, 24, { kind: 'gunport', v: x % 2 });
  ent('deco', 246, 21, { kind: 'figurehead' }); ent('deco', 296, 21, { kind: 'wheel' });
  ent('deco', 244, 21, { kind: 'boardingNet' });
  ent('check', 254, 21); ent('check', 304, 15); ent('silver', 300, 26);

  coins([258, 21], [266, 21], [274, 21], [282, 21], [290, 21]);
  coins([252, 26], [266, 26], [278, 26], [296, 26]);
  coins([306, 15], [314, 15], [322, 15], [330, 15]);
  coins([342, 10], [350, 10], [358, 10], [366, 10]);
  ent('quarter', 288, 21);
  ent('gate', 374, 10);

  const ret = {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 25 }, pools, falls: [], moversExtra: movers, hullZones,
    duskStart: 99999, duskLen: 1, music: 'flotilla', night: false, swell: { amp: 2, period: 4.6 },
    interiors: [[34, 93, 26, 30, 'stone'], [116, 173, 24, 30, 'stone'], [248, 340, 24, 27, 'stone'], [340, 372, 12, 15, 'stone']],
    quest: { n: 3, item: 'fisher', name: 'FISHERFOLK', npc: 'squire', done: 'THE OARS ARE EMPTY', reward: 'relic', relic: 'blackflag' },
    palette: { set: 'ship', sky: 'glare', far: 'fleet', mid: 'ships', near: 'hulls', fg: 'rig', dress: 'ship', haze: 'rgba(240,235,205,0.10)',
      grass: '#8a9a5a', grassL: '#b4c47a', grassD: '#5a6a3a', dirt: '#6a5a44', dirtL: '#9a8464', dirtD: '#43382a', canopy: ['#2a4a44', '#3a5e54', '#4a7264', '#6a8a70'] },
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 258 * TS, x1: 374 * TS, floor: 22 * TS, y0: 8 * TS, trigger: 262 * TS, wallL: 257, wallR: 374, boss: 'quarter', music: 'boss2', tint: '#c9b27c', tintA: 0.06, fx: 'motes',
      decks: [[22 * TS, 260, 370], [16 * TS, 304, 370], [11 * TS, 338, 368]], cuts: [[302, 303, 11, 21], [330, 331, 6, 16]], fallTo: 292 },
  };
  return ret;
}


// ================= 14. THE HURRICANE DECK =================
// One ship, one storm, and no second ship to jump to. The sea does the moving here: a wall of water builds to
// windward, you get a breath of warning, and when it breaks over her anything not holding a line goes over the
// side. The rigging is the level: every line, shroud and ratline is a handhold, and the hold below is shelter
// that costs you time. (IN PROGRESS: no boss yet, no music of its own, hidden from the map.)
function theHurricane() {
  const W = 760, H = 44; const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const net = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET); };
  const rail = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.RAIL); };
  const rot = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SHELF); }; // planking that gives under a standing weight
  const shroud = x => net(x, x + 1, 13, 19);   // a hand on any of these and the wave only soaks you
  const bob = (x, y, len = 2) => ent('mover', x, y, { len, range: 0, bob: true }); // wreckage riding the swell
  const pools = [], movers = [], hullZones = [];
  const FOUL = { foulCol: '#7a8a3a', foulColL: '#b8c85a', foulColD: '#3a4a1e' };

  // THE SEA. Swimmable, and the worst place to be in a storm: the lightning runs along it.
  pools.push({ x0: 0, x1: W * TS, y: 28 * TS, bottom: 42 * TS, shallow: false, swim: true, clear: true, sea: true });
  block(0, W - 1, 42, H - 1); // the bottom of the world under it

  // ---- HER HULL, the length of her ----
  block(16, 744, 20, 27); hullZones.push([16, 744, 20, 27]);
  air(20, 740, 21, 26); // her hold, hollow from her head to her stern
  net(14, 15, 19, 30); net(745, 746, 19, 30); // HER LIFELINES over the bow and the stern
  rail(53, 660, 19); // the waist is open deck: nothing between you and the sea but the rail

  // ================= 1. THE FORECASTLE: you come up out of her head =================
  block(16, 52, 16, 19); air(22, 50, 17, 19); air(51, 52, 17, 19);
  plat(53, 16, 4); net(53, 54, 15, 19);
  ent('sign', 26, 19, { text: 'THE WAVE COMES FROM WINDWARD AND YOU GET A BREATH OF WARNING. TAKE A LINE, GET UP INTO THE YARDS, OR GET BELOW. THE DECK IS NOT A PLACE TO STAND WHEN SHE SHIPS ONE.' });
  ent('check', 30, 19); ent('npc', 34, 19, { kind: 'squire' });
  ent('sign', 44, 19, { text: 'HER LANTERNS ARE BLOWN OUT AND ROLLED INTO HER CORNERS. BRING THEM BACK AND SHE HAS HER LIGHTS.' });
  ent('deco', 40, 19, { kind: 'kegStack' }); ent('deco', 24, 19, { kind: 'hammock', v: 0 }); ent('deco', 32, 19, { kind: 'rumBarrels', v: 1 }); ent('deco', 46, 19, { kind: 'washing' }); ent('deco', 28, 19, { kind: 'hammock', v: 1 });
  coins([28, 18], [36, 18], [48, 18]);

  // ================= 2. THE FORE WAIST: her foremast, and the hands still aboard =================
  net(72, 73, 6, 19); ent('deco', 72, 19, { kind: 'mastTall', v: 0 }); ent('deco', 66, 12, { kind: 'sailRag', v: 0 });
  ent('deco', 72, 5, { kind: 'pennant', v: 1 });
  for (const x of [60, 86, 100, 112]) shroud(x);
  for (const [x0, x1, y] of [[74, 88, 12], [60, 70, 11], [100, 112, 12]]) { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); }
  ent('cutlass', 62, 19, { face: -1 }); ent('cutlass', 92, 19, { face: -1 }); ent('cutlass', 106, 19, { face: 1 });
  ent('cutlass', 76, 19, { face: 1 }); ent('boarder', 114, 19, { face: -1 }); ent('cutlass', 70, 26, { face: 1 }); ent('marine', 100, 26, { face: -1 });
  ent('lookout', 72, 5, { face: -1 }); ent('marine', 80, 11, { face: -1 });
  ent('sign', 57, 19, { text: 'THEY WANT HER BACK AND THEY DO NOT CARE THAT SHE IS SINKING.' });
  air(66, 67, 20, 20); net(66, 67, 20, 26); // the fore hatch down into her hold
  ent('deco', 56, 19, { kind: 'rumBarrels', v: 0 }); ent('deco', 116, 19, { kind: 'boardingNet' });
  ent('stray', 90, 26, { kind: 'lamp' }); ent('torch', 84, 26); // her third lantern, rolled forward into her fore hold
  ent('check', 96, 19);
  coins([64, 18], [76, 18], [90, 18], [104, 18], [66, 10], [82, 10], [106, 11], [58, 18], [70, 18], [84, 18], [98, 18], [112, 18], [74, 10], [94, 25], [78, 25], [110, 25]);

  // ================= 3. THE BREACH: she is open to the sea amidships, and what is in her eats you =================
  // Her waist is stove clean through. The bilge stands in her, green and thick, and the only way over it is
  // what is floating in it and the two spars they lashed across.
  air(126, 174, 20, 26);
  pools.push({ x0: 126 * TS, x1: 175 * TS, y: 20 * TS + 2, bottom: 27 * TS, shallow: false, swim: true, harm: true, clear: true, ...FOUL });
  ent('sign', 121, 19, { text: 'SHE IS OPEN TO THE SEA HERE AND HER BILGE IS STANDING IN HER. THE GREEN WILL EAT YOU: GO OVER IT.' });
  plat(129, 17, 4); plat(137, 15, 4); plat(146, 17, 4); plat(155, 15, 4); plat(164, 17, 4);
  bob(133, 19); bob(142, 19); bob(151, 19); bob(160, 19); bob(169, 19); // her own wreckage, riding what is in her
  net(124, 125, 14, 19); net(175, 176, 14, 19);
  movers.push({ kind: 'swing', px: 150 * TS, py: 8 * TS, arm: 88, x: 0, y: 0, w: 32, h: 8, period: 3.2, phase: 0.6 });
  ent('marine', 140, 14, { face: -1 }); ent('cutlass', 166, 16, { face: -1 }); ent('lookout', 138, 14, { face: 1 }); ent('cutlass', 131, 16, { face: 1 }); // on her spars: the deck is gone under them
  coins([133, 18], [142, 18], [151, 18], [160, 18], [169, 18], [138, 14], [156, 14]);
  ent('deco', 122, 19, { kind: 'boardingNet' }); ent('deco', 118, 19, { kind: 'kegStack' }); ent('deco', 178, 19, { kind: 'rumBarrels', v: 0 }); ent('deco', 172, 19, { kind: 'boardingNet' });

  // ================= 4. THE GALLEY: a house on her deck, and the only dry corner in her =================
  block(184, 216, 16, 19); air(186, 214, 17, 19); air(184, 185, 17, 19); air(215, 216, 17, 19);
  plat(217, 16, 4); net(182, 183, 15, 19); net(217, 218, 15, 19);
  ent('torch', 190, 19); ent('deco', 194, 19, { kind: 'kegStack' }); ent('deco', 206, 19, { kind: 'chickenCoop' });
  ent('sign', 188, 19, { text: 'HER GALLEY. THE STOVE IS OUT AND THE COOK IS GONE AND THE KETTLE IS STILL SWINGING.' });
  ent('bosun', 202, 19, { face: -1 }); ent('cutlass', 210, 19, { face: -1 }); ent('cutlass', 194, 19, { face: 1 }); ent('marine', 218, 15, { face: -1 });
  ent('check', 186, 19); ent('stray', 212, 19, { kind: 'lamp' });
  ent('deco', 198, 15, { kind: 'lanternDeck', v: 1 });
  coins([192, 18], [200, 18], [208, 18], [196, 15], [212, 15]);

  // ================= 5. THE MAIN WAIST: her mainmast, her tops, and the worst of the open deck =================
  net(270, 271, 6, 19); ent('deco', 270, 19, { kind: 'mastTall', v: 1 }); ent('deco', 264, 11, { kind: 'sailRag', v: 1 });
  ent('deco', 270, 5, { kind: 'pennant', v: 2 }); ent('deco', 270, 4, { kind: 'crowNest' });
  for (const x of [232, 248, 284, 300, 316]) shroud(x);
  for (const [x0, x1, y] of [[272, 288, 11], [250, 262, 12], [292, 306, 12], [232, 246, 11]]) { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); }
  ent('marine', 280, 10, { face: -1 }); ent('lookout', 270, 4, { face: -1 });
  ent('boarder', 240, 19, { face: -1 }); ent('cutlass', 256, 19, { face: -1 }); ent('cutlass', 300, 19, { face: -1 }); ent('boarder', 312, 19, { face: -1 });
  ent('cutlass', 232, 26, { face: 1 }); ent('bosun', 260, 26, { face: -1 }); ent('marine', 292, 12, { face: -1 });
  // HER PUMPS, amidships, where there was nothing but deck: three strikes on the brake and the water in her
  // hold goes down for twenty seconds - which is the only way to walk her orlop dry and get what is down there.
  ent('pump', 244, 19); ent('sign', 240, 19, { text: 'HER PUMPS. WORK THE BRAKE AND THE WATER IN HER HOLD GOES DOWN WHILE THEY RUN. THERE IS SOMETHING IN THE ORLOP THAT IS ONLY THERE WHEN IT IS DRY.' });
  ent('deco', 248, 19, { kind: 'kegStack' }); ent('deco', 252, 19, { kind: 'waterButt' });
  ent('sign', 226, 19, { text: 'THE WAIST IS THE WORST OF HER: NO RAIL WORTH THE NAME AND NOTHING TO HOLD BUT THE SHROUDS.' });
  air(236, 237, 20, 20); net(236, 237, 20, 26);
  ent('deco', 228, 19, { kind: 'washing' }); ent('deco', 320, 19, { kind: 'boardingNet' }); ent('deco', 246, 19, { kind: 'kegStack' }); ent('deco', 266, 19, { kind: 'rumBarrels', v: 1 }); ent('deco', 308, 19, { kind: 'washing' }); ent('deco', 286, 19, { kind: 'hammock', v: 0 });
  movers.push({ kind: 'swing', px: 276 * TS, py: 8 * TS, arm: 88, x: 0, y: 0, w: 32, h: 8, period: 3.2, phase: 0.4 });
  movers.push({ kind: 'swing', px: 296 * TS, py: 8 * TS, arm: 96, x: 0, y: 0, w: 32, h: 8, period: 3.6, phase: 2 });
  coins([230, 18], [244, 18], [258, 18], [274, 18], [288, 18], [304, 18], [318, 18], [278, 10], [298, 11], [236, 18], [252, 18], [266, 18], [282, 18], [296, 18], [312, 18], [240, 25], [256, 25], [272, 25], [290, 25]);
  // AMIDSHIPS: the hands who are still trying to save her, and do not care that you are aboard
  ent('sign', 288, 19, { text: 'HER MAIN. THE CREW ARE STILL WORKING HER AND THEY WILL STILL KILL YOU FOR HER.' });
  ent('boarder', 322, 19, { face: -1 }); ent('cutlass', 316, 19, { face: -1 }); ent('bosun', 328, 19, { face: -1 });
  ent('check', 292, 19);

  // ================= 6. UNDER HER: the rent in her side, and the sea in the lightning =================
  // She is holed at the turn of the bilge. You go into the water and out under her keel, and the sky is looking
  // for the water the whole way: an air bell every so often, and a hatch aft to come up through.
  air(336, 350, 20, 27); // the rent: her planking gone from the deck to the keel
  rot(332, 335, 20); rot(351, 354, 20);
  ent('check', 328, 19); ent('sign', 330, 19, { text: 'HER SIDE IS GONE HERE. UNDER HER KEEL AND AFT IS THE ONLY WAY ON. WHEN THE SKY LIGHTS UP, BE UNDER THE WATER AND NOT IN THE TOP OF IT.' });
  net(334, 335, 21, 27); net(348, 349, 21, 27); // down the broken frames into the water
  air(356, 420, 28, 29); // (the water under her: the pool already fills it, this only keeps the hull off it)
  for (const x of [360, 384, 408]) ent('deco', x, 28, { kind: 'airBell' }); // air trapped up against her keel
  ent('deco', 370, 41, { kind: 'plunder', v: 0 }); ent('deco', 396, 41, { kind: 'plunder', v: 2 }); // what went out of her rent, lying on the bottom
  ent('silver', 382, 41);
  ent('eel', 366, 33); ent('eel', 402, 35); ent('eel', 388, 30); ent('urchin', 378, 41); ent('urchin', 392, 41); ent('urchin', 404, 41); ent('petrel', 356, 29); ent('petrel', 412, 29);
  coins([358, 32], [366, 36], [374, 30], [382, 38], [390, 32], [398, 36], [406, 30], [414, 34]);
  air(414, 418, 20, 27); net(415, 416, 21, 27); // the hatch aft: up out of the water into her flooded hold
  ent('sign', 420, 19, { text: 'UP THROUGH HER AFTER HATCH. SHE IS FULL TO THE ORLOP BACK HERE.' });

  // ================= 7. HER FLOODED HOLD: over your boots and rising, and the pumps have stopped =================
  pools.push({ x0: 424 * TS, x1: 478 * TS, y: 25 * TS + 4, bottom: 27 * TS, shallow: true, depth: 24, pumped: true, base: 25 * TS + 4 }); // HER PUMPS answer this one
  ent('torch', 430, 26); ent('torch', 460, 26);
  ent('deco', 436, 26, { kind: 'kegStack' }); ent('deco', 452, 26, { kind: 'rumBarrels', v: 1 }); ent('deco', 472, 26, { kind: 'hammock', v: 1 }); ent('deco', 430, 26, { kind: 'plunder', v: 2 });
  ent('deco', 444, 26, { kind: 'hammock', v: 0 }); ent('deco', 468, 26, { kind: 'plunder', v: 1 });
  ent('stray', 448, 26, { kind: 'lamp' }); ent('silver', 464, 26); ent('deco', 456, 26, { kind: 'plunder', v: 1 }); coins([446, 26], [454, 26], [462, 26], [470, 26]); // (under the water until the pumps run)
  ent('cutlass', 440, 26, { face: 1 }); ent('marine', 470, 26, { face: -1 }); ent('boarder', 456, 26, { face: -1 }); ent('cutlass', 464, 26, { face: -1 });
  ent('sign', 426, 26, { text: 'THE PUMPS HAVE STOPPED AND NOBODY IS GOING BACK TO THEM. WADING IS SLOW: SHE IS TAKING IT FASTER THAN THAT.' });
  ent('check', 432, 26);
  coins([434, 25], [442, 25], [450, 25], [458, 25], [466, 25], [474, 25]);
  for (const hx of [428, 476] ) { air(hx, hx + 1, 20, 20); net(hx, hx + 1, 20, 26); } // up onto her deck at either end

  // ================= 8. THE WRECK ALONGSIDE: a smaller ship stove in against her, and oil on the water =================
  air(486, 556, 20, 27); // the gap between the two hulls, open to the sea
  block(500, 544, 24, 27); hullZones.push([500, 544, 24, 27]); // the wreck herself, down to her gunwale in it
  air(504, 540, 25, 26); air(520, 521, 24, 24); net(520, 521, 24, 26); // and a way up out of the wreck's hold, or it is a hole you fall into
  pools.push({ x0: 486 * TS, x1: 557 * TS, y: 28 * TS, bottom: 34 * TS, shallow: false, swim: true, harm: true, clear: true, ...FOUL }); // her oil on the water
  ent('sign', 482, 19, { text: 'SHE HAS RUN SOMETHING DOWN AND IT IS STILL ALONGSIDE. THERE IS OIL ON THE WATER BETWEEN THEM AND IT BURNS YOUR EYES: CROSS ON THE WRECKAGE AND THE ROPES.' });
  plat(488, 17, 4); plat(497, 15, 4); plat(508, 17, 5); plat(520, 15, 4); plat(530, 17, 4); plat(542, 15, 4); plat(551, 17, 5);
  bob(493, 21); bob(515, 21); bob(536, 21); bob(547, 21);
  movers.push({ kind: 'swing', px: 504 * TS, py: 8 * TS, arm: 104, x: 0, y: 0, w: 32, h: 8, period: 3.4, phase: 1.1 });
  movers.push({ kind: 'swing', px: 528 * TS, py: 8 * TS, arm: 112, x: 0, y: 0, w: 32, h: 8, period: 3.8, phase: 2.6 });
  net(484, 485, 14, 19); net(557, 558, 14, 19);
  ent('deco', 512, 24, { kind: 'mastTall', v: 0 }); net(512, 513, 14, 23); // the wreck's mast, lying against her: a way up
  ent('deco', 522, 23, { kind: 'sternWindows' }); ent('deco', 506, 23, { kind: 'boardingNet' }); ent('check', 508, 16);
  ent('cutlass', 516, 23, { face: -1 }); ent('boarder', 534, 23, { face: -1 }); ent('marine', 500, 14, { face: -1 }); ent('cutlass', 490, 16, { face: 1 }); ent('lookout', 512, 13, { face: -1 }); ent('cutlass', 552, 16, { face: -1 });
  ent('silver', 528, 23); ent('deco', 532, 23, { kind: 'plunder', v: 2 });
  coins([493, 20], [500, 14], [510, 16], [520, 14], [530, 16], [540, 14], [548, 16], [518, 23], [526, 23]);
  ent('check', 560, 19);

  // ================= 9. THE AFT WAIST: her mizzen, her powder, and the last of the open deck =================
  net(600, 601, 6, 19); ent('deco', 600, 19, { kind: 'mastTall', v: 1 }); ent('deco', 594, 12, { kind: 'sailRag', v: 0 });
  ent('deco', 600, 5, { kind: 'pennant', v: 1 });
  for (const x of [572, 586, 614, 630, 646] ) shroud(x);
  for (const [x0, x1, y] of [[602, 616, 11], [580, 594, 12], [620, 634, 12]]) { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); }
  ent('boarder', 578, 19, { face: -1 }); ent('cutlass', 592, 19, { face: -1 }); ent('bosun', 624, 19, { face: -1 });
  ent('marine', 610, 10, { face: -1 }); ent('cutlass', 640, 19, { face: -1 }); ent('lookout', 600, 5, { face: -1 });
  ent('cutlass', 566, 19, { face: 1 }); ent('boarder', 604, 19, { face: -1 }); ent('marine', 634, 12, { face: -1 }); ent('cutlass', 650, 19, { face: -1 });
  ent('check', 572, 19); ent('sign', 566, 19, { text: 'THE LAST OF HER OPEN DECK. HER POWDER IS UNDER YOUR FEET AND HER CAPTAIN IS AFT.' });
  air(636, 637, 20, 20); net(636, 637, 20, 26);
  ent('deco', 570, 19, { kind: 'rumBarrels', v: 0 }); ent('deco', 650, 19, { kind: 'boardingNet' }); ent('deco', 584, 19, { kind: 'kegStack' }); ent('deco', 616, 19, { kind: 'washing' }); ent('deco', 644, 19, { kind: 'hammock', v: 1 }); ent('deco', 596, 19, { kind: 'boardingNet' });
  ent('deco', 606, 26, { kind: 'kegStack' }); ent('deco', 620, 26, { kind: 'kegStack' }); ent('torch', 614, 26);
  ent('cutlass', 630, 26, { face: -1 }); ent('silver', 644, 26);
  // HER POWDER STORE, under the quarterdeck: the reason nobody goes aft with a light
  for (const hx of [664, 700, 730]) { air(hx, hx + 1, 20, 20); net(hx, hx + 1, 20, 26); }
  ent('sign', 660, 26, { text: 'HER POWDER STORE. NO LIGHT, NO IRON ON THE DECK, AND THE MAN WHO SAID SO IS AFT ON HER QUARTERDECK.' });
  ent('deco', 670, 26, { kind: 'kegStack' }); ent('deco', 686, 26, { kind: 'kegStack' }); ent('deco', 712, 26, { kind: 'rumBarrels', v: 1 });
  ent('deco', 696, 26, { kind: 'plunder', v: 0 }); ent('deco', 724, 26, { kind: 'plunder', v: 2 });
  ent('torch', 706, 26); ent('boarder', 680, 26, { face: 1 }); ent('marine', 718, 26, { face: -1 }); ent('cutlass', 736, 26, { face: -1 });
  ent('silver', 734, 26); ent('check', 666, 26);
  coins([674, 25], [682, 25], [690, 25], [698, 25], [708, 25], [716, 25], [726, 25], [738, 25]);
  coins([574, 18], [588, 18], [604, 18], [618, 18], [634, 18], [648, 18], [608, 10], [628, 11], [612, 25], [626, 25], [568, 18], [580, 18], [596, 18], [612, 18], [624, 18], [640, 18], [654, 18], [590, 12], [618, 12]);
  ent('check', 654, 19);

  // ================= 10. HER QUARTERDECK: THE CAPTAIN, who has not left her =================
  block(660, 744, 16, 19); air(662, 742, 17, 19); air(660, 661, 17, 19);
  plat(656, 16, 4); net(657, 658, 15, 19);
  ent('sign', 652, 19, { text: 'HER QUARTERDECK. HE HAS NOT LEFT HER AND HE WILL NOT. HE FIGHTS WITH A BLADE AND A BRACE OF PISTOLS, HE WILL HAUL YOU OFF YOUR FEET WITH A HOOK, AND WHEN HE CALLS THE SEA IT COMES: TAKE A LINE AND LET IT PASS HIM.' });
  net(700, 701, 8, 15); ent('deco', 700, 15, { kind: 'mastTall', v: 1 }); ent('deco', 700, 7, { kind: 'pennant', v: 1 });
  net(676, 677, 11, 15); net(716, 717, 11, 15); net(730, 731, 11, 15); // THE ARENA'S HANDHOLDS
  for (let x = 690; x <= 710; x++) set(x, 10, T.ONEWAY);
  ent('deco', 686, 15, { kind: 'sailRag', v: 1 }); ent('deco', 722, 15, { kind: 'rigging', v: 0 });
  ent('deco', 668, 15, { kind: 'lanternDeck', v: 0 }); ent('deco', 740, 15, { kind: 'sternWindows' });
  ent('deco', 736, 19, { kind: 'plunder', v: 1 }); ent('torch', 664, 19); ent('check', 696, 19); // the last one outside his walls
  coins([682, 14], [694, 14], [706, 14], [718, 14], [728, 14], [696, 9], [704, 9]);
  ent('captain', 732, 15);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 24, y: 19 }, pools, falls: [], moversExtra: movers,
    duskStart: 99999, duskLen: 1, music: 'hurricane', night: false, dark: 0.06,
    swell: { amp: 3, period: 3.8 }, stormClouds: true,
    // THE WASH: the rule of her open deck. It builds to windward, it tells you, and then it takes the deck.
    wash: { y0: 8 * TS, y1: 20 * TS, x0: 16 * TS, x1: 744 * TS, every: 8.5, tell: 2.2, speed: 320, dmg: 18 },
    // THE LIGHTNING: it picks somewhere near you, says so, and hits it. Over water it runs along the surface.
    storm2: { every: 9, tell: 1.2, y: 20 * TS, zones: [[330 * TS, 424 * TS], [486 * TS, 558 * TS], [560 * TS, 744 * TS]] },
    hullZones,
    interiors: [[20, 740, 21, 26, 'stone'], [186, 214, 17, 19, 'stone'], [504, 540, 25, 26, 'stone'], [662, 742, 17, 19, 'stone']],
    quest: { n: 3, item: 'lamp', name: 'HER LANTERNS', npc: 'squire', done: 'SHE HAS HER LIGHTS BACK', reward: 'relic', relic: 'stormline' },
    palette: { set: 'ship', sky: 'storm', far: 'fleet', mid: 'ships', near: 'hulls', fg: 'rig', dress: 'ship', haze: 'rgba(150,170,180,0.16)',
      grass: '#5f6a68', grassL: '#88928f', grassD: '#40484a', dirt: '#4a5058', dirtL: '#666e78', dirtD: '#32363e', canopy: ['#1e2a3a', '#2c3a4a', '#3a4a5a', '#54687a'] },
    weather: [{ x0: 0, x1: 99999, kind: 'rain' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 702 * TS, x1: 744 * TS, floor: 16 * TS, y0: 6 * TS, trigger: 708 * TS, wallL: 701, wallR: 744, boss: 'captain', music: 'drowned', tint: '#2a5a6a', tintA: 0.12, fx: 'motes' },
    // HER MASTS GO ONE AT A TIME. Lightning finds the fore first, then the main, then the mizzen.
    masts: [{ x: 72, at: 104 * TS, fell: false }, { x: 270, at: 316 * TS, fell: false }, { x: 600, at: 640 * TS, fell: false }],
  };
}

// ============================================================================================================
// LEVEL 15 - THE LAMPLIT STREET
// A stone city a hundred feet under the sea, lit by the whale-oil lamps that have burned in it since it went
// down. ONE RULE, said three ways: THE LAMPS ARE AIR. Under each lamp's iron hood is a bubble of air, so the
// route through the flooded streets is lamp to lamp; the lamps can be put out, by the Lampreeve, by the
// Tollmaster, and you light them again by carrying fire from one to the next; and out of the light the drowned
// watch hear you from twice as far.
// The city is built on two levels and the level cuts between them all the way along:
//   THE ROOF ROAD, row 22 - the tops of the lower city's masonry, above the water line. Dry, broken, slow.
//   THE STREET,    row 38 - the paving, under ten rows of water. Fast with the tide, and you cannot breathe.
// The water line is row 24, which is INSIDE the masonry band (rows 22-27), so nothing in the street is within
// reach of a surface: only a lamp, a vault pocket or a courtyard shaft gives you air.
// Why there is any air at all down here: THE LAMP WORKS has been pushing it down the city's lamp mains for a
// hundred years. That is the level's machine room, and working it is how you relight a whole section.
// ============================================================================================================
function theLamplitStreet() {
  const W = 700, H = 46; const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const net = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET); };
  const rail = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.RAIL); };
  const port = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
  const pools = [], movers = [], interiors = [], darkZones = [];
  const ST = 38, UP = 22, WL = 24 * TS;        // the paving, the roof road, and the water line between them
  // the masonry of the lower city: its top is the roof road, its underside is the street's vault
  const mass = (x0, x1) => { block(x0, x1, UP, 27); interiors.push([x0, x1, 28, ST - 1, 'stone']); };
  // a flooded stretch of street. The tide runs down all of them and turns on a timer.
  const flood = (x0, x1) => pools.push({ x0: x0 * TS, x1: x1 * TS, y: WL, bottom: ST * TS, shallow: false, swim: true, clear: true, runTide: true });
  const lamp = (x, dark) => ent('lantern', x, ST - 1, { city: true, dark: !!dark });
  const lampUp = (x, dark) => ent('lantern', x, UP - 1, { city: true, dark: !!dark });
  const weed = (x, y, v) => ent('deco', x, y, { kind: 'cityWeed', v: v || 0 });

  block(0, W - 1, ST, 41);                      // THE PAVING, the whole length of the city
  block(0, W - 1, 42, H - 1);                   // and what it is laid on

  // ================= 1. THE DESCENT: down the line from the boat, past the tribute ship =================
  // Above the water line, so the lamp economy is taught in air before it is asked for under it.
  block(4, 36, 10, 13); air(7, 33, 11, 12);     // the wreck of the tribute ship, lying across the roofs
  ent('deco', 20, 9, { kind: 'mastStump' }); ent('deco', 12, 9, { kind: 'wreckBow' }); ent('deco', 30, 9, { kind: 'sternWindows' });
  ent('sign', 8, 9, { text: 'THE CITY WENT DOWN A HUNDRED YEARS AGO AND ITS LAMPS ARE STILL BURNING. NOBODY KNOWS ON WHAT. UNDER EVERY HOOD THERE IS AIR: THAT IS HOW YOU CROSS A STREET DOWN HERE.' });
  ent('check', 10, 9); ent('npc', 14, 9, { kind: 'squire' });
  ent('sign', 26, 9, { text: 'A DEAD LAMP IS A ROAD THAT IS NOT THERE. STAND AT A BURNING ONE TO TAKE FIRE IN YOUR HAND, CARRY IT, AND STRIKE THE DEAD ONE.' });
  plat(37, 10, 3); net(40, 41, 6, ST - 1);      // the diver's line: off the wreck and down through the surface
  ent('sign', 44, UP - 1, { text: 'THE WATER STARTS HERE. THE ROOFS ARE DRY AND SLOW. THE STREET IS FAST AND IT DOES NOT LET YOU BREATHE.' });
  mass(44, 76); air(58, 59, UP, 27); net(58, 59, UP, ST - 1);   // the first shaft down into the street
  flood(0, 44); flood(44, 78);
  lamp(22); lamp(50); lamp(66, true); lamp(74);
  ent('deco', 30, ST - 1, { kind: 'lampWreck', v: 0 }); ent('deco', 54, ST - 1, { kind: 'shellDrift', v: 0 });
  ent('silver', 6, ST - 1); ent('deco', 10, ST - 1, { kind: 'sealDrift', v: 0 }); coins([8, 36], [14, 36]); // what went off the tribute ship, west along the paving
  ent('eel', 34, 32); ent('urchin', 46, ST - 1); ent('urchin', 62, ST - 1);
  ent('check', 52, UP - 1);
  coins([20, 36], [26, 34], [34, 36], [48, 36], [56, 34], [64, 36], [72, 36], [46, 21], [62, 21]);
  weed(28, ST - 1, 1); weed(70, ST - 1, 0);

  // ================= 2. THE FISH MARKET: two roads, and the tide down the middle of one =================
  mass(80, 128); mass(136, 186);                // with a courtyard open to the water line between them
  flood(78, 190);
  darkZones.push({ x0: 78 * TS, x1: 190 * TS, y0: 26 * TS, y1: 42 * TS, dark: 0.88 });
  plat(130, 23, 5); plat(131, 20, 3);           // the courtyard: a ledge on the water, and a cornice over it
  air(94, 95, UP, 27); net(94, 95, UP, ST - 1); air(168, 169, UP, 27); net(168, 169, UP, ST - 1);
  ent('sign', 82, UP - 1, { text: "THE FISH MARKET. THE STALLS ARE STILL STANDING AND WHAT IS IN THEM IS STILL IN THEM. THE GOOD TAKINGS ARE DOWN ON THE STREET, WHICH IS WHERE THE WATCH ARE." });
  for (const x of [86, 112, 150, 176]) ent('deco', x, UP - 1, { kind: 'stall', v: x % 2 });
  for (const x of [100, 124, 160]) ent('deco', x, UP - 1, { kind: 'column', v: x % 2 });
  ent('deco', 140, UP - 1, { kind: 'drownedCart' }); ent('deco', 118, UP - 1, { kind: 'sealDrift', v: 0 });
  lamp(84); lamp(104); lamp(124, true); lamp(146); lamp(166, true); lamp(184);
  lampUp(90); lampUp(132, true); lampUp(172);
  ent('watch', 98, UP - 1, { face: -1 }); ent('watch', 154, UP - 1, { face: -1 });
  ent('watch', 114, ST - 1, { face: -1 }); ent('watch', 160, ST - 1, { face: 1 });
  ent('eel', 108, 33); ent('eel', 144, 31); ent('urchin', 92, ST - 1); ent('urchin', 136, ST - 1); ent('urchin', 178, ST - 1);
  ent('snuffer', 120, UP - 1, { face: -1 });    // it only comes where the light has gone, and it takes more of it
  ent('stray', 128, ST - 1, { kind: 'lamp' });  // the first of his three lamps, down on the stones
  ent('silver', 156, ST - 1);
  ent('check', 88, UP - 1); ent('check', 130, 22); ent('check', 180, ST - 1);
  ent('sign', 148, ST - 1, { text: 'THE TIDE RUNS DOWN THIS STREET AND THEN IT TURNS. GO WITH IT AND IT CARRIES YOU TWO LAMPS; GO AGAINST IT AND IT WILL NOT LET YOU REACH ONE.' });
  coins([84, 36], [92, 34], [100, 36], [108, 34], [116, 36], [124, 34], [132, 36], [140, 34], [148, 36], [156, 34], [164, 36], [172, 34], [180, 36],
    [88, 21], [96, 21], [104, 21], [120, 21], [150, 21], [164, 21], [178, 21], [131, 19]);
  for (const x of [96, 110, 138, 170]) weed(x, ST - 1, x % 3);
  for (const x of [106, 158]) ent('deco', x, ST - 1, { kind: 'shellDrift', v: 1 });

  // ================= 3. THE MARKET HALL: the Lampreeve, in a shrinking pool of light =================
  // Dry, because the lamp mains still blow it out: the only room in the level with a floor you can jump from,
  // which is what his low sweep needs. Five lamps, and he is working his way along them.
  mass(188, 252);
  block(194, 195, 12, 21); block(240, 242, 12, 21); block(196, 239, 12, 13);
  air(194, 195, 18, 21);                        // the door in off the roof road
  port(240, 16, 21);                            // and the gate out, shut until he is down
  interiors.push([196, 239, 14, 21, 'stone']);
  darkZones.push({ x0: 196 * TS, x1: 240 * TS, y0: 13 * TS, y1: 23 * TS, dark: 0.9 });
  ent('sign', 190, UP - 1, { text: 'THE MARKET HALL. SOMETHING IN THERE IS PUTTING THE LAMPS OUT ONE AT A TIME, AND WHEN THE LAST ONE GOES IT WILL STILL BE IN THERE WITH YOU.' });
  ent('check', 190, UP - 1);                    // the one outside his wall
  for (const x of [200, 210, 220, 230, 237]) lampUp(x);
  ent('deco', 206, UP - 1, { kind: 'stall', v: 1 }); ent('deco', 226, UP - 1, { kind: 'drownedCart' });
  ent('deco', 216, 13, { kind: 'lampMain', v: 0, hang: true });
  ent('lampreeve', 234, UP - 1, { face: -1 });
  coins([202, 21], [208, 19], [214, 21], [222, 19], [228, 21], [234, 19]);
  ent('sign', 244, UP - 1, { text: 'HE WAS THE LAMPREEVE. HE LIT THIS STREET FOR FORTY YEARS. SOMEBODY DOWN HERE TOLD HIM TO STOP.' });
  ent('check', 246, UP - 1); ent('deco', 248, UP - 1, { kind: 'lampWreck', v: 1 });

  // ================= 4. THE COUNTING HOUSE: where the tribute went =================
  // The vaults rise through the masonry band, so their crowns are ABOVE the water line: the ceiling shape IS
  // the air. Swim up into a pocket, breathe, swim on. The seals of thirty years are behind a portcullis and
  // the key is on the clerk who was locking it.
  mass(254, 356);
  flood(252, 356);
  darkZones.push({ x0: 254 * TS, x1: 356 * TS, y0: 26 * TS, y1: 42 * TS, dark: 0.86 });
  ent('sign', 256, UP - 1, { text: 'THE COUNTING HOUSE. THIRTY YEARS OF TRIBUTE CAME IN HERE AND NONE OF IT EVER WENT OUT AGAIN. THE AIR STANDS UP UNDER THE VAULTS: GO FROM CROWN TO CROWN.' });
  for (const [vx, lip] of [[268, true], [300, false], [330, true]]) {   // three vaults, three pockets
    block(vx - 3, vx + 13, 16, 17); air(vx, vx + 10, 18, 27);
    if (lip) plat(vx + 1, 23, 4);                                       // two of them have a ledge to stand on
    ent('deco', vx + 5, 17, { kind: 'lampMain', v: 1, hang: true });
  }
  air(260, 261, UP, 27); net(260, 261, UP, ST - 1);                      // the clerks' stair down off the roof
  air(350, 351, UP, 27); net(350, 351, UP, ST - 1);
  lamp(258); lamp(280); lamp(296, true); lamp(318); lamp(340, true); lamp(354);
  ent('lantern', 270, 22, { city: true }); ent('lantern', 332, 22, { city: true }); // a lamp on a pocket's ledge
  ent('deco', 286, ST - 1, { kind: 'clerkDesk' }); ent('deco', 306, ST - 1, { kind: 'sealDrift', v: 1 }); ent('deco', 322, ST - 1, { kind: 'sealDrift', v: 0 });
  ent('key', 292, ST - 1, { kind: 'bone' });                            // on the clerk who was locking up
  ent('deco', 294, ST - 1, { kind: 'bones', v: 1 });
  port(326, 28, ST - 1); ent('lockgate', 326, ST - 1, { needs: 'bone', h: 10 });
  ent('deco', 336, ST - 1, { kind: 'grating' });
  ent('silver', 330, ST - 1); ent('silver', 334, ST - 1); ent('silver', 338, ST - 1); ent('deco', 344, ST - 1, { kind: 'sealDrift', v: 1 });
  ent('stray', 333, 22, { kind: 'lamp' });                              // the second lamp, up in a vault
  ent('watch', 276, ST - 1, { face: -1 }); ent('watch', 312, ST - 1, { face: 1 }); ent('watch', 346, ST - 1, { face: -1 });
  ent('watch', 290, UP - 1, { face: -1 }); ent('watch', 324, UP - 1, { face: 1 });
  ent('eel', 282, 33); ent('eel', 316, 30); ent('angler', 342, 34); ent('urchin', 300, ST - 1); ent('urchin', 320, ST - 1);
  ent('check', 266, UP - 1); ent('check', 271, 22); ent('check', 348, ST - 1);
  coins([258, 36], [266, 34], [274, 36], [282, 34], [290, 36], [298, 34], [306, 36], [314, 34], [322, 36], [338, 34], [346, 36],
    [272, 22], [302, 26], [334, 22], [264, 21], [292, 21], [328, 21], [352, 21]);
  for (const x of [272, 310, 340]) weed(x, ST - 1, x % 3);

  // ================= 5. THE LAMP WORKS: the machine the whole city breathes through =================
  // The bellows house. Three strikes on the beam and it blows the mains out: the water in the next stretch of
  // street goes down for twenty seconds AND every dead lamp in it comes up. Stop working it and it comes back.
  mass(358, 428);
  block(362, 363, 10, 21); block(424, 426, 10, 21); block(364, 423, 10, 11);
  air(362, 363, 18, 21); air(424, 426, 18, 21);
  interiors.push([364, 423, 12, 21, 'stone']);
  ent('sign', 360, UP - 1, { text: 'THE LAMP WORKS. A HUNDRED YEARS IT HAS BEEN PUSHING AIR DOWN THE CITY PIPES, AND THAT IS THE ONLY REASON ANY OF THIS IS DRY. WORK THE BEAM.' });
  ent('deco', 380, UP - 1, { kind: 'bellows' }); ent('deco', 404, UP - 1, { kind: 'bellows' });
  ent('deco', 392, 11, { kind: 'lampMain', v: 0, hang: true }); ent('deco', 416, 11, { kind: 'lampMain', v: 1, hang: true });
  ent('pump', 396, UP - 1);
  ent('sign', 400, UP - 1, { text: 'WHILE THE BEAM IS WORKING, THE PROCESSION ROAD GOES DOWN AND ITS LAMPS COME UP. WHEN IT STOPS, SO DOES THE ROAD.' });
  for (const x of [368, 388, 412, 422]) lampUp(x);
  ent('watch', 374, UP - 1, { face: 1 }); ent('watch', 410, UP - 1, { face: -1 });
  ent('snuffer', 418, UP - 1, { face: -1 });
  ent('stray', 386, UP - 1, { kind: 'lamp' });                          // the third lamp, on the bellows floor
  ent('npc', 372, UP - 1, { kind: 'lamplighter' });                     // the last lamplighter, and he will not leave
  ent('check', 366, UP - 1); ent('check', 420, UP - 1);
  ent('silver', 408, UP - 1); ent('deco', 398, UP - 1, { kind: 'sealDrift', v: 0 });
  coins([366, 21], [374, 19], [382, 21], [390, 19], [398, 21], [406, 19], [414, 21], [422, 19]);

  // ================= 6. THE PROCESSION ROAD: the widest street and the fewest lamps =================
  // The hardest swim in the level, and the one the pump answers: a shallow pumped pool over the paving, piers
  // of the collapsed bridge rising and falling through it, and the watch in numbers along both roads.
  mass(430, 470); mass(480, 520); mass(530, 568);
  // the one stretch THE LAMP WORKS answers: while the beam is working its surface drops to wading depth and
  // its dead lamps come up, and when the beam stops it fills again
  pools.push({ x0: 428 * TS, x1: 572 * TS, y: WL, bottom: ST * TS, shallow: false, swim: true, clear: true, runTide: true, pumpRoad: true, roadHi: WL, roadLo: 37 * TS });
  darkZones.push({ x0: 428 * TS, x1: 572 * TS, y0: 26 * TS, y1: 42 * TS, dark: 0.92 });
  for (const [a, b] of [[470, 480], [520, 530]]) { plat(a + 1, 23, b - a - 2); plat(a + 2, 20, 3); } // two courtyards open on the water
  air(444, 445, UP, 27); net(444, 445, UP, ST - 1); air(556, 557, UP, ST - 1); net(556, 557, UP, ST - 1);
  ent('sign', 432, UP - 1, { text: 'THE PROCESSION ROAD. THEY CARRIED HIM UP AND DOWN IT ONCE A YEAR AND EVERY HOUSE ON IT PAID. THE LAMPS ALONG IT ARE MOSTLY DEAD.' });
  lamp(434); lamp(456, true); lamp(476); lamp(498, true); lamp(516, true); lamp(540); lamp(562, true);
  lampUp(440, true); lampUp(492); lampUp(546, true);
  for (const x of [452, 486, 508, 536]) ent('deco', x, ST - 1, { kind: 'column', v: x % 2 });
  ent('deco', 466, ST - 1, { kind: 'drownedCart' }); ent('deco', 504, ST - 1, { kind: 'lampWreck', v: 0 }); ent('deco', 552, ST - 1, { kind: 'lampWreck', v: 1 });
  // THE PIERS of the collapsed bridge: they come up out of the paving and go down again
  for (const [x, ph] of [[448, 0], [462, 1.1], [494, 2.2], [512, 0.6], [544, 1.7]])
    ent('mover', x, ST - 1, { len: 3, range: 0, vert: true, rise: 9, period: 3.6, ph, stone: true });
  ent('watch', 438, ST - 1, { face: -1 }); ent('watch', 460, ST - 1, { face: 1 }); ent('watch', 488, ST - 1, { face: -1 });
  ent('watch', 510, ST - 1, { face: 1 }); ent('watch', 534, ST - 1, { face: -1 }); ent('watch', 560, ST - 1, { face: -1 });
  ent('watch', 450, UP - 1, { face: -1 }); ent('watch', 500, UP - 1, { face: 1 }); ent('watch', 550, UP - 1, { face: -1 });
  ent('angler', 470, 33); ent('angler', 524, 31); ent('eel', 444, 31); ent('eel', 482, 34); ent('eel', 518, 30); ent('eel', 558, 33);
  ent('urchin', 442, ST - 1); ent('urchin', 478, ST - 1); ent('urchin', 506, ST - 1); ent('urchin', 542, ST - 1); ent('urchin', 566, ST - 1);
  ent('snuffer', 496, UP - 1, { face: -1 });
  ent('silver', 472, 23); ent('silver', 522, 23);
  ent('check', 436, UP - 1); ent('check', 472, 22); ent('check', 522, 22); ent('check', 564, UP - 1);
  ent('sign', 526, 22, { text: 'THE LAST LAMPS ON THE ROAD ARE DEAD AND THE SQUARE AT THE END OF IT IS LIT. HE KEEPS HIS OWN LIGHT ON AND NOBODY ELSE\'S.' });
  coins([434, 36], [442, 34], [450, 36], [458, 34], [466, 36], [476, 34], [484, 36], [492, 34], [500, 36], [508, 34], [516, 36], [526, 34], [534, 36], [542, 34], [550, 36], [558, 34], [566, 36],
    [440, 21], [456, 21], [490, 21], [504, 21], [546, 21], [562, 21], [472, 22], [522, 22]);
  for (const x of [446, 484, 514, 554]) weed(x, ST - 1, x % 3);

  // ================= 7. THE TOLL GATE: his square =================
  // A raised plaza above the water line, lit in two rings of lamps, with a brazier at either end to carry fire
  // from. He puts the rings out one at a time; in his last phase he calls the water up into the square itself.
  mass(570, W - 1); block(570, W - 1, 28, 37);   // his gate stands on a solid mole: the street stops under it
  block(574, 575, 6, 21); block(696, 698, 6, 21); block(576, 695, 6, 7);
  air(574, 575, 18, 21);
  interiors.push([576, 695, 8, 21, 'stone']);
  darkZones.push({ x0: 576 * TS, x1: 698 * TS, y0: 7 * TS, y1: 23 * TS, dark: 0.9 });
  ent('sign', 572, UP - 1, { text: 'THE TOLL GATE. A HUNDRED YEARS OF SHARES CAME DOWN HERE TO A MAN IN A CHAIR. HE IS CARRIED, HE DOES NOT SWIM, AND HE WILL PUT THE LAMPS OUT TO DO IT IN THE DARK. PARRY THE BOOK. JUMP THE ROD. DO NOT TRY TO BLOCK THE WEIGHT.' });
  ent('check', 578, UP - 1);                     // the one outside his walls
  ent('deco', 584, UP - 1, { kind: 'tollPost' }); ent('deco', 596, UP - 1, { kind: 'magistrate' });
  ent('deco', 604, UP - 1, { kind: 'sealDrift', v: 1 }); ent('deco', 614, UP - 1, { kind: 'grating' });
  ent('deco', 628, UP - 1, { kind: 'column', v: 0 }); ent('deco', 640, UP - 1, { kind: 'drownedCart' });
  lampUp(588); lampUp(600); lampUp(612); lampUp(624); lampUp(638, true);
  ent('watch', 592, UP - 1, { face: -1 }); ent('watch', 608, UP - 1, { face: 1 });
  ent('watch', 632, UP - 1, { face: -1 }); ent('snuffer', 644, UP - 1, { face: -1 });
  ent('check', 646, UP - 1);                     // three tiles outside his wall: a death costs the square, not the road
  ent('sign', 620, UP - 1, { text: 'THE BRAZIERS IN HIS SQUARE NEVER WENT OUT. WHEN HE TAKES THE LAMPS, TAKE FIRE OFF ONE AND PUT THEM BACK: IT COSTS YOU THE SECONDS HE WANTS.' });
  coins([582, 21], [590, 19], [598, 21], [606, 19], [614, 21], [622, 19], [630, 21], [638, 19], [646, 21]);
  // HIS SQUARE: 44 tiles, two rings of lamps, the braziers at the edges, and the pool that fills it
  ent('brazier', 652, UP - 1); ent('brazier', 690, UP - 1);
  for (const x of [656, 664, 672, 680, 688]) lampUp(x);
  ent('deco', 646, 7, { kind: 'lampMain', v: 0, hang: true }); ent('deco', 670, 7, { kind: 'lampMain', v: 1, hang: true });
  ent('deco', 658, UP - 1, { kind: 'column', v: 0 }); ent('deco', 636, UP - 1, { kind: 'column', v: 1 });
  plat(632, 20, 4); plat(638, 18, 3); plat(678, 20, 4);      // cornices over the square: the dash and the mantle
  ent('tollmaster', 684, UP - 1, { face: -1 });
  pools.push({ x0: 650 * TS, x1: 695 * TS, y: UP * TS + 8, bottom: UP * TS + 8, base: UP * TS + 8, shallow: true, depth: 0, dry: true, swim: false, clear: true, square: true });
  coins([633, 19], [639, 17], [656, 19], [668, 19], [679, 19], [688, 19]);
  ent('silver', 668, UP - 1);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 10, y: 9 }, pools, falls: [], moversExtra: movers,
    duskStart: 99999, duskLen: 1, music: 'drowned', night: false, glowNight: true, dark: 0.5, darkZones,
    lampAir: true,                               // THE RULE: a lit lamp is a lungful of air
    streetTide: { every: 14, tell: 2.4, flow: 34 },
    interiors,
    quest: { n: 3, item: 'lamp', name: 'HIS LAMPS', npc: 'lamplighter', done: 'THE STREET HAS ITS LIGHTS', reward: 'relic', relic: 'wick' },
    palette: { set: 'city', sky: 'drowned', far: 'city', mid: 'city', near: 'city', fg: 'city', dress: 'none', haze: 'rgba(20,70,66,0.22)',
      grass: '#4e7a58', grassL: '#7e9490', grassD: '#24402c', dirt: '#46595c', dirtL: '#58706f', dirtD: '#243036',
      canopy: ['#0d2826', '#113331', '#16403d', '#1b4c48'] },
    weather: [{ x0: 0, x1: 99999, kind: 'pollen' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'water' }],
    mini: { x0: 198 * TS, x1: 238 * TS, floor: UP * TS, y0: 13 * TS, y1: 23 * TS, trigger: 204 * TS, wallL: 197, gate: 240, boss: 'lampreeve' },
    arena: { x0: 650 * TS, x1: 694 * TS, floor: UP * TS, y0: 8 * TS, trigger: 658 * TS, wallL: 649, wallR: 694, boss: 'tollmaster', music: 'drowned', tint: '#2a4a5a', tintA: 0.14, fx: 'motes' },
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
  { id: 'spire', name: 'THE SUNSPIRE', sub: 'the mountain of crystal', build: theSunspire, needs: 'hanging' },
  { id: 'moor', name: 'GALE MOOR', sub: 'the high moor', build: galeMoor, needs: 'spire' },
  { id: 'storm', name: 'STORMHOLD', sub: 'the last hold', build: stormhold, needs: 'moor' },
  { id: 'crown', name: 'HIGHCROWN', sub: 'the goblin queen\'s castle', build: highcrownWhole, needs: 'storm' },
  { id: 'longwater', name: 'THE LONG WATER', sub: 'the river to the sea', build: longWater, needs: 'crown' },
  { id: 'reef', name: 'THE SHIPWRECK REEF', sub: 'the road out to sea', build: shipwreckReef, needs: 'longwater' },
  { id: 'flotilla', name: 'THE FLOTILLA', sub: 'the town of ships', build: theFlotilla, needs: 'reef' },
  { id: 'hurricane', name: 'THE HURRICANE DECK', sub: 'one ship, one storm', build: theHurricane, needs: 'flotilla' },
  { id: 'lamplit', name: 'THE LAMPLIT STREET', sub: 'the city under it', build: theLamplitStreet, needs: 'hurricane' },
  { id: 'shop', name: 'THE STORE', sub: 'ask the keeper', build: theShop, hidden: true },
  { id: 'trial_knight', name: "THE KNIGHT'S TRIAL", sub: 'sword, shield and plunge', build: () => trialYard('knight'), hidden: true },
  { id: 'trial_pyro', name: "THE PYROMANCER'S TRIAL", sub: 'ember, jet and heat', build: () => trialYard('pyro'), hidden: true },
  { id: 'trial_paladin', name: "THE PALADIN'S TRIAL", sub: 'maul, aegis and light', build: () => trialYard('paladin'), hidden: true },
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
  lamplit: [['cityWeed', 3], ['shellDrift', 2], ['lampWreck', 2], ['sealDrift', 2], ['drownedCart'], ['column', 2]],
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
