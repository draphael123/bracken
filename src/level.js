import {polishTower,buildTowerAscent} from './tower-ascent.js';
import {buildBurningVillage} from './burning-village.js';
import {buildWitchlight} from './witchlight.js';
import { buildOreRoad } from './ore-road.js';
import { reworkScree } from './scree-rework.js';
import {hauntedCoast} from './haunted-coast.js';
import {stormShipPolish} from './storm-ship.js';
import {polishCoastAndTown} from './coast-town.js';
import {crabTrench,underwaterKeep} from './deep-split.js';
import {stormwreckHarbor,burialCaverns} from './additional-areas.js';
import { singleAmbush } from './ambush.js';
import { COMBAT } from './combat.js';
import { floodReach } from './reachcore.js';
import { findDeadEnds } from './deadends.js';
import { spanOf, THREAT } from './threat.js';
import { buildUnburiedField } from './unburied-field.js';
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
  const REF = ['ram', 'cage', 'gate', 'door', 'bell', 'at', 'wall', 'x0', 'x1', 'pool', 'ifDrained'];
  for (const e of L.ents) { e.x = sh(e.x); for (const k of REF) if (typeof e[k] === 'number') e[k] = sh(e[k]); }
  const R = Object.assign({}, ret, { W: W2 });
  if (R.pools) R.pools = R.pools.map(p => ({ ...p, x0: shp(p.x0), x1: shpEnd(p.x1) }));
  for(const key of ['gusts','hags','airRails','downCliffs'])if(R[key])R[key]=R[key].map(z=>({...z,x0:shp(z.x0),x1:shpEnd(z.x1),...(z.shelters?{shelters:z.shelters.map(([x0,x1,y])=>[shp(x0),shpEnd(x1),y])}:{})}));
  if(R.roosts)R.roosts=R.roosts.map(([x,y])=>[sh(x),y]);
  if(R.flight)R.flight={...R.flight,x1:sh(R.flight.x1)};
  if (R.sleeps) R.sleeps = R.sleeps.map(p => ({ ...p, x0: shp(p.x0), x1: shpEnd(p.x1) }));
  if (R.moversExtra) R.moversExtra = R.moversExtra.map(m => { const o = { ...m }; for (const k of ['x', 'x0', 'x1', 'px']) if (typeof o[k] === 'number') o[k] = shp(o[k]); return o; });
  for (const k of ['weather', 'ambient']) if (R[k]) R[k] = R[k].map(z => ({ ...z, x0: shp(z.x0), x1: z.x1 >= 99999 ? z.x1 : shpEnd(z.x1) }));
  for (const k of ['arena', 'mini']) if (R[k]) { const A = { ...R[k] }; for (const f of ['x0', 'x1', 'trigger']) if (typeof A[f] === 'number') A[f] = shp(A[f]); for (const f of ['wallL', 'wallR', 'gate']) if (typeof A[f] === 'number') A[f] = sh(A[f]); if (A.dais) A.dais = { ...A.dais, x0: shp(A.dais.x0), x1: shp(A.dais.x1) }; R[k] = A; }
  if (R.ambushes) R.ambushes = R.ambushes.map(A => ({ ...A, wallL: sh(A.wallL), wallR: sh(A.wallR), trigger: typeof A.trigger === 'number' ? sh(A.trigger) : A.trigger, check: Array.isArray(A.check) ? [sh(A.check[0]), A.check[1]] : A.check, waves: A.waves.map(w => w.map(([t, x, y, o]) => [t, sh(x), y, o])) }));   /* an ambush is in TILES, like the walls */
  if (R.interiors) R.interiors = R.interiors.map(([x0, x1, y0, y1, st]) => [sh(x0), sh(x1), y0, y1, st]); // keep the room's KIND: dropping it made every grown level's interior the default timber
  if (R.structures) R.structures = R.structures.map(z => ({...z,x0:sh(z.x0),x1:sh(z.x1)}));
  if (R.stone) R.stone = R.stone.map(([x0, x1, y0, y1]) => [sh(x0), sh(x1), y0, y1]);
  if (R.scree) R.scree = R.scree.map(z => ({ ...z, x0: sh(z.x0), x1: sh(z.x1) }));
  if (R.fog) R.fog = R.fog.map(z => ({ ...z, x0: shp(z.x0), x1: shpEnd(z.x1) }));
  if (R.slide) R.slide = { ...R.slide, x0: shp(R.slide.x0), x1: shpEnd(R.slide.x1) };
  if (R.ropes) R.ropes = R.ropes.map(r => ({ ...r, x0: shp(r.x0), x1: shp(r.x1), posts: (r.posts || []).map(p => [shp(p[0]), p[1], p[2]]) }));
  if (typeof R.duskStart === 'number' && R.duskStart > 0) R.duskStart = shp(R.duskStart);
  if (typeof R.escapeGate === 'number') R.escapeGate = sh(R.escapeGate);
  if (R.storm) R.storm = { ...R.storm, x0: shp(R.storm.x0), x1: shpEnd(R.storm.x1) };
  if (R.rot) R.rot = { x0: shp(R.rot.x0), x1: shpEnd(R.rot.x1) };
  if (R.lessons) R.lessons = R.lessons.map(z => ({ ...z, x0: sh(z.x0), x1: sh(z.x1) }));   /* the wood's teaching moments are in TILES, like the walls */
  P.R = R; P.done = () => Object.assign(R, { grid: P.grid, ents: L.ents.concat(P.ents) });
  return P;
}

function brackenWood() {
  const L = painter(324, 28);
  const { block, floor, plat, spikes, crate, ent, coins, set } = L;

  // ---- 1. Glade: learn to move, jump, swing ----
  floor(0, 30, 22);
  ent('sign', 5, 21, { text: 'ARROWS/WASD MOVE   Z JUMP   X SWING', pyro: 'ARROWS/WASD MOVE   Z JUMP   X STAFF   TAP C: AN EMBER   HOLD C: THE JET', paladin: 'ARROWS/WASD MOVE   Z JUMP   X MAUL, SLOW AND HEAVY' }); ent('npc', 10, 21, { kind: 'squire' });
  ent('sign', 284, 8, { text: 'THE HIVE. THE QUEEN DIVES TO STING: JUMP IT, THEN CUT HER WHILE SHE PULLS FREE.' });
  ent('deco', 10, 21, { kind: 'cabin' }); ent('npc', 16, 21, { kind: 'woodsman' }); // the woodsman's cabin: he wants his honey back
  coins([12, 20], [13, 19], [14, 20]);
  ent('sprig', 22, 21, { face: -1 }); ent('sign', 26, 21, { text: 'TAP A WAY TWICE TO DASH: IT CLEARS A GAP.' });   /* the gap, and a sprig past the crates. (The dash ATTACK is the Stockade's lesson now: the first wood teaches two keys, the heavy and the down attack) */
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
  ent('shield', 71, 19, { face: -1 });   /* the heavy blow's second beat, and its exam: the lone guard on the flat before this taught it (THE LESSONS, at the end of this function), so this one has no sign of its own */
  plat(64, 18, 6);
  coins([66, 17], [68, 17]);
  ent('sign', 78, 21, { text: 'DOWN+X IN THE AIR: PLUNGE. LAND ON A FOE TO BOUNCE; HOLD JUMP TO BOUNCE HIGHER.', pyro: 'DOWN+X IN THE AIR: FIREDROP. BOUNCE OFF WHAT YOU HIT; HOLD JUMP TO GO HIGHER.', paladin: 'DOWN+X IN THE AIR: HAMMERFALL. BOUNCE OFF WHAT YOU HIT; HOLD JUMP TO GO HIGHER.', warden: 'DOWN+X IN THE AIR: PLUNGE. PIN A FOE ON THE GROUND; OVER A DROP, VAULT OFF IT.' });
  ent('check', 82, 21);

  // ---- 3. Wasp pit: pogo chain ----
  ent('wasp', 87, 19, { pogo: true }); ent('wasp', 90, 19, { pogo: true }); ent('wasp', 93, 19, { pogo: true }); ent('wasp', 96, 19, { pogo: true });   /* a pogo chain: THE MIX leaves these wasps */
  plat(88, 22, 2); plat(92, 22, 2); plat(96, 22, 2);   /* STUMPS IN THE POND. The wasps were the only way over, so the wood could not be finished by anyone who killed them first. The wasps went up out of the way: a pogo is a shortcut now, not the road */
  floor(98, 120, 22);
  coins([99, 20], [100, 19], [101, 20]);
  ent('sign', 103, 21, { text: 'C BLOCKS AND STAGGERS. V DODGES. SPINED BACKS BREAK A PLUNGE: CUT THEM SIDE-ON.', pyro: 'V DODGES. TAP C: EMBER. HOLD C: JET. SPINED BACKS BREAK A PLUNGE: BURN THEM SIDE-ON.', paladin: 'HOLD C: AEGIS. TAP C: MEND. V: HEAVY STEP. SPINED BACKS BREAK A PLUNGE.' });
  ent('thorn', 109, 21, { face: -1 });
  crate(111, 21); crate(112, 21); crate(112, 20);
  ent('sprig', 116, 21, { face: -1 });   /* (the rising cut's sign stood here: a first wood seven lessons deep teaches none of them, so it teaches two) */

  // ---- 4. Thorn climb ----
  floor(121, 129, 22);
  /* (a bed of spikes lay under the zigzag climb here: in the wood that teaches the game, a missed hop costs the climb, not a life) */
  plat(119, 20, 3); plat(123, 18, 3); plat(127, 16, 3); plat(123, 14, 3); plat(127, 12, 3); plat(124, 10, 2); plat(127, 8, 2); ent('silver', 128, 7); coins([125, 9]); // the silver sits above the canopy: up is worth looking
  coins([124, 17], [128, 15], [124, 13]);

  // ---- 5. Plateau ----
  block(130, 160, 12, 27);
  ent('check', 133, 11);
  coins([136, 10], [138, 10], [140, 10]);
  block(144, 146, 10, 11);
  ent('spit', 145, 9, { face: -1 });
  ent('wasp', 145, 7);
  /* THE CROWN STAYS WITHIN REACH AFTER THE WASP FALLS: permanent branch steps keep the cache a climb, not a spent enemy. */
  plat(147, 8, 2); plat(145, 6, 2);
  plat(148, 5, 5); coins([147, 7], [145, 5], [149, 4], [150, 4], [151, 4], [152, 4]); ent('relic', 150, 4, { kind: 'crown' });
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
  block(243, 252, 9, 27); // a longer takeoff lip puts the two paid bounces inside their reach
  ent('spit', 244, 8, { face: 1 });
  ent('wasp', 255, 7, { pogo: true }); ent('wasp', 259, 7, { pogo: true });
  block(255, 323, 9, 27);
  // the helm pit: four shieldbearers on posts over spikes. Their helms clank and bounce you across.
  for (let x = 258; x <= 266; x++) for (let y = 9; y <= 12; y++) set(x, y, 0);
  spikes(258, 266, 12);
  for (const x of [259, 262, 265]) { block(x, x + 1, 11, 12); ent('shield', x, 10, { face: -1 }); }
  ent('sign', 256, 8, { text: 'SHIELD GOBLINS HIDE BEHIND IRON. PLUNGE THE HELM, LAND BEHIND, CUT.', pyro: 'SHIELD GOBLINS HIDE BEHIND IRON. ARC AN EMBER OVER, OR FIREDROP THE HELM.', paladin: 'SHIELD GOBLINS HIDE BEHIND IRON. HAMMERFALL THE HELM, LAND BEHIND, STRIKE.' });
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
  /* The comb hangs as wax, not footing: the Queen shakes pieces loose, but nobody can stand on her ceiling. */
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
  G0.ent('sign', 236, 14, { text: 'FOUR STROKES FELL A PINE TO BRIDGE THE GAP. OR POGO ACROSS THE WASPS.' });
  G0.ent('felltree', 241, 14, { len: 14, dir: 1 });
  G0.R.pools.push({ x0: 242 * TS, x1: 253 * TS, y: 21 * TS, depth: 3 * TS });
  G0.block(242, 255, 24, 27);
  G0.ent('wasp', 245, 13, { pogo: true }); G0.ent('wasp', 248, 13, { pogo: true }); G0.ent('wasp', 253, 13, { pogo: true }); // (level with the wasp pit's: just under the bank, so a jump off it gets above them; they hung too high to reach)
  G0.coins([244, 13], [248, 13], [252, 13]);
  G0.block(253, 270, 15, 27); // the far lip is inside two paid bounces, even under the paladin's heavier feet
  G0.ent('check', 259, 14); G0.ent('sprig', 265, 14, { face: -1 }); G0.coins([262, 13], [268, 13]);
  const R0 = G0.done();
  const G = grow(R0, R0, 130, 46);
  G.block(130, 175, 12, 27);
  G.ent('sign', 131, 11, { text: 'THE FALLEN GIANT: OVER THE TOP FOR COINS, OR THROUGH THE HOLLOW FOR QUIET.' });
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
  G2.ent('sign', 122, 21, { text: 'THE SETT BELOW IS DARK AND FULL OF SPRIGS. THE RIDGE ABOVE IS WASPS.' });
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
  // THE LEVEL THAT TEACHES THE GAME HAD THE LEAST TO SAY IN IT: eight signs, and a hundred and fifty-one
  // columns of silence through the hive, the crown and the whole run home. There is no tutorial in this
  // game, there are signs. (These columns were final when G2 was the last grow; the three lesson grows below
  // come after and slide them, like every entity, by 78.)
  G2.ent('sign', 200, 11, { text: 'THE HIVE IS A CEILING, AND ALL UNDER IT IS ANGRY. DO NOT STAND UNDER A HOLE.' });
  G2.ent('sign', 249, 11, { text: 'A CROWN IN A WOOD, AND NOBODY LEFT TO WEAR IT. WHAT LIES HERE IS YOURS.' });
  G2.ent('sign', 288, 11, { text: 'THORNS NEVER MOVE: GO OVER THEM. A HELD JUMP IS HIGHER THAN A TAPPED ONE.' });
  const R2 = G2.done();
  // ---- THE LESSONS. The yard (THE HERO'S TRIAL) is optional, and the wood threw a new player into real fights without
  // the things that matter most. It taught seven (dash, shield, pogo, heavy, sweep, third cut, dash attack), and a first
  // wood seven lessons deep teaches none of them, so it teaches TWO KEYS: the heavy blow through a guard, and the down
  // attack - the pogo off a body, then the same blow onto the ground among a crowd. Each is a moment of its own on the
  // road: a checkpoint, a sign, the foe on flat ground with nothing else in reach, and a hint the first time it happens
  // (lessonHint in main.js, once a save, never if the trial taught it). The third stretch is not a key: it is where the
  // wood's own charging foe, the badger, is met alone, before the sett it comes out of. (The sweep and the third cut
  // are still hinted where a guard turns a blow; the dash attack is the Stockade's lesson.)
  // Grown LAST and in DESCENDING column order, so every number below is a column of the level as G2 left it:
  // the badger at 121 (between the crate sprig and the sett fork), the down attack at 98 (the far bank of the wasp pond,
  // straight after the pogo chain), the heavy blow at 53 (past the second dash gap, before the spitter's ledge). 26 each. ----
  const LC = grow(R2, R2, 121, 26);   // c. THE BADGER: out of a scrape in the bank, on flat ground, alone
  LC.floor(121, 146, 22);
  LC.ent('check', 123, 21); LC.ent('deco', 125, 21, { kind: 'stump', v: 0 });
  LC.ent('sign', 127, 21, { text: 'A BADGER OUT OF ITS SETT. ON ITS ! IT CHARGES: JUMP IT, THEN COME DOWN ON ITS BACK.' });
  LC.coins([130, 20], [132, 19], [134, 20]);
  LC.ent('badger', 139, 21, { face: -1 });
  LC.coins([142, 18], [145, 20]);
  const RC = LC.done();
  // d. THE PERFECT GUARD (the knight rework): straight after the sign that teaches C, a lone SWORN SWORD on the flat - the slowest
  // blow in the game, one at a time, and his sword FLASHES on the beat (e.lesson: the trial's long tell, and for a knight the flash
  // comes a reaction's length before the blow lands). Raised as it flashes, the shield turns it for nothing, he reels, and the next
  // cut is heavy. Grown at 121 AFTER the badger, so it comes BEFORE the badger on the road.
  const LD = grow(RC, RC, 121, 26);
  LD.floor(121, 146, 22);
  LD.ent('check', 123, 21); LD.ent('deco', 125, 21, { kind: 'fern', v: 0 });
  LD.ent('sign', 127, 21, { text: 'A PERFECT GUARD: RAISE C AS HIS SWORD FLASHES. HE REELS, AND YOUR NEXT CUT IS HEAVY.', pyro: 'ROLL THROUGH HIS CUT WITH V AS HIS SWORD FLASHES, AND HE REELS OPEN.', reaper: 'ROLL THROUGH HIS CUT WITH V AS HIS SWORD FLASHES, AND HE REELS OPEN.', paladin: 'HOLD C FOR THE AEGIS AS HIS SWORD FLASHES, AND HE REELS OPEN.', pirate: 'TAP C AS HIS SWORD FLASHES: THE PARRY TURNS IT, AND HE REELS OPEN.', warden: 'TAP C AS HIS SWORD FLASHES: THE DEFLECT TURNS IT, AND HE REELS OPEN.' });
  LD.coins([130, 20], [132, 19], [134, 20]);
  LD.ent('swornsword', 139, 21, { face: -1, lesson: 'parry' });
  LD.ent('deco', 143, 21, { kind: 'stump', v: 1 }); LD.coins([145, 20]);
  LD.R.lessons = (LD.R.lessons || []).concat([{ kind: 'parry', x0: 122, x1: 146 }]);
  const RD = LD.done();
  const LB = grow(RD, RD, 98, 26);    // b. THE DOWN ATTACK: three sprigs bunched on the flat - come down among them and the ground throws them
  LB.floor(98, 123, 22);
  LB.ent('check', 100, 21); LB.ent('deco', 102, 21, { kind: 'fern', v: 0 });
  LB.ent('sign', 104, 21, { text: 'DOWN+X IN THE AIR, ONTO THE GROUND: IT KNOCKS WHAT STANDS BESIDE YOU OFF ITS FEET.', warden: 'DOWN+X IN THE AIR, ONTO THE GROUND: THE CRACK RUNS AHEAD AND TRIPS WHAT IT MEETS.', paladin: 'DOWN+X IN THE AIR: HAMMERFALL. THE GROUND CARRIES IT BOTH WAYS UNDER THEIR FEET.', pyro: 'DOWN+X IN THE AIR: FIREDROP. THE FIRE GOES DOWN AHEAD OF YOU: LAND AMONG THEM.', pirate: 'DOWN+X IN THE AIR: COME DOWN AMONG THEM. MISS, AND YOU STAND THERE A BEAT.', reaper: 'DOWN+X IN THE AIR: COME DOWN AMONG THEM. MISS, AND YOU STAND THERE A BEAT.' });
  LB.coins([107, 18], [109, 17], [111, 18]);
  LB.ent('sprig', 113, 21, { face: -1 }); LB.ent('sprig', 115, 21, { face: -1 }); LB.ent('sprig', 117, 21, { face: -1 });
  LB.ent('deco', 121, 21, { kind: 'stump', v: 1 }); LB.coins([122, 20]);
  LB.R.lessons = (LB.R.lessons || []).concat([{ kind: 'down', x0: 99, x1: 123 }]);
  const RB = LB.done();
  const LA = grow(RB, RB, 53, 26);    // a. THE HEAVY BLOW: a lone shield goblin on the flat, and a held swing goes through what he turns
  LA.floor(53, 78, 22);
  LA.ent('check', 55, 21); LA.ent('deco', 57, 21, { kind: 'stump', v: 0 });
  LA.ent('sign', 59, 21, { text: 'A RAISED SHIELD TURNS A CUT. HOLD X AND LET GO: THE SHIELD CHARGE GOES THROUGH IT.', pyro: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE BELLOWS GO THROUGH IT.', paladin: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE OVERHEAD GOES THROUGH IT.', pirate: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE PISTOL GOES THROUGH ANY GUARD.', reaper: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE PLANTED BLADE GOES THROUGH ANY GUARD.', warden: 'A RAISED SHIELD TURNS A CUT. HOLD X: THE SHAFT GOES ROUND IT, BOTH SIDES AT ONCE.' });
  LA.coins([62, 20], [64, 19], [66, 20]);
  LA.ent('shield', 68, 21, { face: -1 });
  LA.ent('deco', 73, 21, { kind: 'fern', v: 1 }); LA.coins([74, 20], [77, 20]);
  LA.R.lessons = (LA.R.lessons || []).concat([{ kind: 'heavyblow', x0: 54, x1: 78 }]);
  return LA.done();
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
  ent('sign', 357, 17, { text: 'THE FROG KING. A BREATH: SHIELD UP. HIS CROAK RAISES THE POND: GET TO THE REEDS.', pyro: 'THE FROG KING. A BREATH: GET OUT OF LINE. A CROAK RAISES THE POND: TO THE REEDS.', paladin: 'THE FROG KING. A BREATH: RAISE THE AEGIS. A CROAK RAISES THE POND: TO THE REEDS.' });
  ent('sprig', 16, 21, { face: -1 });
  coins([9, 20], [12, 19]);

  // ---- 2. Lily pond: pads that sink ----
  water(25, 43, 23);
  for (const x of [27, 30, 33, 36, 39, 42]) ent('pad', x, 22, { big: x === 27 || x === 36 });   // the first pad of the game is a big one: you learn the sink on the leaf that forgives it
  coins([30, 20], [36, 20], [42, 20]);
  floor(44, 55, 22);
  ent('check', 47, 21);

  // ---- 3. Reed climb under an archer ----
  reeds(49, 20, 3); reeds(52, 18, 3); reeds(55, 16, 2);
  block(56, 74, 16, 27);
  ent('archer', 62, 15, { face: -1 });
  ent('sign', 58, 15, { text: 'ARCHERS ON THE STILTS. SLASH AN ARROW TO SEND IT BACK, OR BLOCK IT.', pyro: 'THE ARCHERS ON THE STILTS. BURN AN ARROW OUT OF THE AIR WITH THE JET, OR DODGE IT.', paladin: 'ARCHERS ON THE STILTS. STRIKE AN ARROW TO SEND IT BACK. THE AEGIS TURNS THEM TOO.' });
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
  ent('sign', 112, 17, { text: 'SHALLOWS SLOW YOU AND NOT THE HOPPERS. KEEP TO THE PLANKS. JUMP OUT EARLY.' });
  ent('hopper', 118, 18, { face: -1 }); ent('hopper', 125, 18, { face: 1, color: 'yellow' });
  coins([115, 15], [121, 15], [127, 15]);
  reeds(120, 14, 2); reeds(124, 11, 2); coins([124, 9], [125, 9], [121, 12]); ent('relic', 125, 10, { kind: 'charm' }); // the reed cache

  // ---- 6. THE GAR HOLE. A raft over a foggy stream stood here, and the ferry's raft came straight after it: two rides back
  // to back, and six water crossings in the marsh that read alike. The stream is a bank now, with one deep hole in it
  // three strides wide, and in the hole the marsh's own fish: the gar. Met here alone, on solid ground, where you can
  // stand back and watch it throw itself out onto the bank and lie there - and learn that a fish on the grass is low,
  // so the low sweep and the plunge are what it answers to. (The wisps and the fog live on in the drowned village.) ----
  block(131, 160, 18, 27); for (let x = 144; x <= 146; x++) for (let y = 18; y <= 23; y++) L.set(x, y, 0);
  pools.push({ x0: 144 * TS, x1: 147 * TS, y: 19 * TS, shallow: false, depth: 0, bottom: 24 * TS });
  ent('sign', 132, 17, { text: 'A GAR LIES IN THE DARK WATER. IT THROWS ITSELF ON THE BANK: SWEEP IT, OR PLUNGE IT THERE.' });
  ent('gar', 145, 20, { face: -1 });
  coins([138, 15], [145, 14], [152, 15], [157, 16]);
  block(161, 175, 18, 27);
  ent('check', 168, 17); crate(173, 17);
  ent('sign', 171, 17, { text: 'A BUD PAD SPRINGS. LAND ON IT.' });   // taught once, on the bank, before the first bud at 191

  // ---- 7. The long river: lily pads across it, three strides apart, and a reed bed to rest on every so often ----
  /* THE PUNT WENT. Walking to one end of a raft to steer it was a chore, not a crossing, and the marsh already has
     its own verb for water: the pad that sinks under you. Nothing lives on this stretch - the pads are the question. */
  water(176, 259, 19);
  ent('sign', 175, 17, { text: 'LILY PADS SINK UNDER YOU. HOP ON, AND REST ON THE REED BEDS.' });   /* a step off the crate it was standing half inside */
  /* BIG, SMALL, SMALL, BIG. Twenty-four identical hops three strides apart was a metronome, and the owner called it boring
     on the first play. The big pads are the rests and the landings (two tiles, a slower sink, a flower on every one); the
     small ones between are the quick hops. A small-to-big hop is four strides centre to centre and a small-to-small is
     three: the paladin, the shortest jump in the game, carries 58 px level to level against 64 and 48. */
  const BIG = new Set([178, 188, 198, 208, 215, 224, 230, 239, 248, 254]);
  /* AND THREE OF THEM ARE BUDS. A bud pad throws you a tier up the moment you land on it: at 191 and 233 onto the old
     eel-men's stages over the water (coins up there, and the pads go on underneath, so it is a choice you make in the air),
     and at 258, the last pad, because the far bank stands four rows over the water there and a jump will not make it
     (hard by the bank: two columns of drift on the way up is what the reach fill allows a rise of four, and it is right). */
  const BUD = new Set([191, 233, 258]);
  for (const x of [178, 181, 184, 188, 191, 194, 198, 201, 204, 208, 215, 218, 221, 224, 230, 233, 236, 239, 242, 248, 251, 254, 258]) ent('pad', x, 18, { big: BIG.has(x), spring: BUD.has(x) });
  plat(193, 14, 7); plat(203, 14, 6); plat(235, 14, 7);   // the stages: one row of boards a tier over the pads, each one a drop onto the next reed bed at its far end
  coins([195, 13], [197, 13], [201, 10], [205, 13], [207, 13], [237, 13], [239, 13], [241, 13]);
  /* AND THINGS LIVE IN THE RIVER NOW ("so it's not so boring"). Every one is told, and none is on a pad or a stage:
     - three river eels, each in a gap between two pads (186, 237, 252): a boil and a yellow ! and it leaps as high as
       your hop, so you wait on the pad and go after it drops. 237 is under the second stage: the low road has the eel,
       the high road has the coins;
     - a wasp posted over the 218-221 gap, above the arc of the hop, that stings when the hop brings you up to it: block
       it, cut it, or come down on it, which is a pogo.
     (A plain wasp hung between the stages as a pogo step too, and it cost the level a point of difficulty it did not
     earn: the river eels are a new kind here, and a kind is worth three. The index stays within six of where it was.) */
  for (const x of [186, 237, 252]) ent('eel', x, 20, { leap: true });
  ent('wasp', 219, 12, { sting: true, pogo: true });
  block(260, 263, 14, 17);   // the far bank's lip, four rows over the water: the last bud is the way up it
  reeds(211, 16, 2); reeds(226, 16, 2); reeds(244, 16, 2);
  ent('check', 211, 15); ent('silver', 244, 13);
  coins([184, 16], [193, 16], [202, 16], [217, 16], [226, 14], [235, 16], [253, 16]);
  block(260, 274, 18, 27);
  ent('check', 264, 17); crate(270, 17); ent('hopper', 268, 17, { face: -1, color: 'blue' });

  // ---- 8. The Reed Island: dry fighting ground, then the slow raft under the archers ----
  block(275, 296, 18, 27);
  // The ambush needs room to retreat: the old tidal dip is solid bank now.
  ent('hopper', 283, 17, { face: -1, color: 'yellow' }); ent('hopper', 289, 17, { face: -1, color: 'blue' });
  reeds(294, 15, 3); coins([295, 14], [282, 15], [288, 15]);
  ent('check', 296, 17);
  for (let x = 297; x <= 334; x++) for (let y = 18; y <= 27; y++) L.set(x, y, 0);
  water(297, 328, 19);
  ent('crank', 295, 17, { raftCall: 'marsh-grove' });
  movers.push({ kind: 'raft', callId: 'marsh-grove', x0: 297 * TS, x1: 329 * TS - 144, x: 297 * TS, y: 18 * TS + 8, w: 144, h: 8, speed: 26, frogs: true, frogMax: 3, frogEvery: 2.8 });
  plat(309, 11, 3); ent('archer', 310, 10, { face: -1 }); plat(323, 11, 3); ent('archer', 324, 10, { face: -1 });
  ent('wasp', 313, 15); ent('wasp', 326, 15);
  coins([303, 15], [308, 10], [316, 15], [322, 10], [331, 15]);
  /* THE RAFT DOCKS AT A BANK. The crossing used to finish on three sinking pads with both archers still loosing at you: a
     sinking-pad run is a thing you do with your whole attention, and nothing ranged covers one now. The archers shoot over
     the raft, which holds; the pads are the long river's and the pond's */
  block(329, 344, 18, 27);
  ent('thorn', 338, 17, { face: -1 }); crate(340, 17); ent('hopper', 342, 17, { face: -1, color: 'yellow' });
  ent('check', 344, 17);

  // ---- 9. Mud flats, short ----
  block(345, 358, 18, 27);
  // (a thorn stood at 348, two strides from where the flats are landed on, and a blue frog in the puddle four strides on:
  // a fight at a landing, the last thing before the King's court. Both went - the flats are a breath before the boss now -
  // and what they carried paid for the river's eels; the landing is kept calm at the end of this builder.)
  for (let x = 351; x <= 355; x++) L.set(x, 18, 0); water(351, 355, 18, true);
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
    duskStart: undefined, music: 'theme2', waterHurts: true, noStack: true,   /* the garrison steps past a tile a creature already holds (see garrison) */
    quest: { n: 3, item: 'trap', name: 'EEL TRAP', npc: 'ferryman', done: 'THE TRAPS ARE BACK', thanks: "THE FERRYMAN'S THANKS" },
    palette: { dress: 'marsh', haze: 'rgba(172,192,178,0.24)', grass: '#4a9a6e', grassL: '#7fd1a0', grassD: '#2f6e50', dirt: '#5a4a3c', dirtL: '#736050', dirtD: '#3d3128', sky: [[118, 138, 158], [172, 192, 178]], canopy: ['#1f4a3a', '#2a5e46', '#3a7a55', '#4f9a68'] },
    weather: [{ x0: 0, x1: 99999, kind: 'rain' }, { x0: 1750, x1: 2100, kind: 'mist' }, { x0: 4400, x1: 4800, kind: 'mist' }, { x0: 5400, x1: 5760, kind: 'mist' }],
    fog: [],   /* (the foggy stream is the gar hole now: the fog is the drowned village's) */
    ambient: [{ x0: 0, x1: 99999, kind: 'rain' }],
    /* THE STAGES STAND ON POLES. A row of boards over open water with nothing under it is a floor hanging in the air
       (B9): each stage is driven into the river on two poles, with a rope rail between them, the way the drowned
       village's huts stand on stilts. Every pole is put in a gap between pads, never through one. */
    ropes: [[193, 199, 3091, 3197], [203, 208, 3251, 3304], [235, 241, 3761, 3852]].map(([a, b, p0, p1]) => ({ x0: a * TS, y0: 14 * TS - 11, x1: (b + 1) * TS, y1: 14 * TS - 11, posts: [[p0, 14 * TS - 9, 19 * TS + 3], [p1, 14 * TS - 9, 19 * TS + 3]] })),
    arena: { x0: 361 * TS, x1: 403 * TS, floor: 18 * TS, trigger: 367 * TS, wallL: 360, wallR: 404, boss: 'frog', dais: { x0: 386 * TS, x1: 402 * TS, h: 16 }, music: 'frogking', tint: '#3a8a5a', tintA: 0.1, fx: 'motes' },
  }
  // ---- 7b. THE DROWNED VILLAGE: stilt huts over deep water. Planks, sinking pads, archers on the roofs, frogs below. ----
  const G = grow(L, ret, 275, 48);
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) G.set(x, y, T.PLANK); };
  G.block(275, 276, 18, 27); G.ent('sign', 275, 17, { text: 'THE DROWNED VILLAGE. THE PLANKS HOLD, THE FOG DOES NOT: CUT A WISP AND IT THINS.' });
  G.R.pools.push({ x0: 277 * TS, x1: 322 * TS, y: 19 * TS, shallow: false, depth: 0 });
  plank(278, 282, 16); plank(286, 291, 15); plank(294, 298, 16); plank(302, 308, 15); plank(311, 315, 16); plank(319, 322, 17);   /* 291 and 308 reach one board further: the two gaps the pads used to fill are two strides now */
  /* THE HUTS STAND IN THE WATER. They were set ten tiles up with nothing under them, which is a house floating
     over a lake; the archers' platforms are their roofs, and their stilts go down into the flood. */
  G.ent('treehouse', 288, 13); G.ent('treehouse', 304, 13);
  // THE DROWNED VILLAGE IS A PLANK CROSSING IN FOG. It was a lily crossing too - thirteen sinking pads under two archers on
  // the roofs - and the marsh had six crossings that read alike, three of them pads, one of them under fire. The river is
  // the pad crossing; this one is the village's own: boards and reed tufts that HOLD, hut to hut, in a fog you read one
  // plank at a time, with the archers loosing at you on footing that does not sink and the water under it biting.
  G.plat(303, 11, 3); G.ent('archer', 304, 10, { face: -1 }); G.plat(287, 11, 3); G.ent('archer', 288, 10, { face: -1 }); G.ent('silver', 306, 10);
  G.ent('wasp', 293, 13, { pogo: true }); G.ent('wasp', 309, 13, { pogo: true });   // THE BACKS ARE INSIDE A JUMP: the plunge carries you from the planks up to the roofs.
  // THE WATER UNDER THE VILLAGE BITES: a river eel in one gap, told on a count, and a GAR in the other, which throws itself up
  // onto the boards beside the gap (met alone at the gar hole first) and lies there to be swept off them.
  G.ent('gar', 292, 20, { face: -1 }); G.ent('eel', 309, 20, { leap: true });
  /* (0.58, not the stream's 0.86: at 0.86 the next plank stood six points off the fog, at 0.66 two in five of them still
     did not read, and a pad crossing is asked of you here where the stream only asks you to stand on a raft. It is still a
     bank you see through only near yourself, and the wisps still clear it.) */
  G.R.fog = (G.R.fog || []).concat([{ x0: 278 * TS, x1: 322 * TS, alpha: 0.58 }]); G.ent('wisp', 291, 12); G.ent('wisp', 306, 13); G.ent('wisp', 318, 12); // the village drowns in fog too; three wisps light it
  G.reeds(283, 15, 2); G.reeds(299, 14, 2); G.reeds(316, 15, 2);
  G.coins([280, 14], [288, 13], [296, 14], [304, 13], [313, 14], [320, 15], [284, 16], [309, 16]);
  G.ent('check', 321, 16); G.ent('stray', 296, 15, { kind: 'trap' });
  const R1 = G.done();
  // ---- 6b. THE FERRY: a deep channel. Pay the ferryman and ride his raft under the archers, or break the sluice, drain the channel to shallows, and wade it with the frogs. ----
  const F = grow(R1, R1, 161, 48);
  F.block(161, 166, 18, 27);
  F.ent('sign', 162, 17, { text: 'PAY THE FERRY TO RIDE DRY, OR BREAK THE SLUICE AND WADE THE DRAINED CHANNEL.' });
  F.ent('sluice', 165, 17, { pool: 167, to: 21 });
  F.ent('npc', 168, 17, { kind: 'ferryman', ride: true });
  F.ent('crank', 164, 17, { raftCall: 'marsh-ferry' });
  F.R.moversExtra.push({ kind: 'raft', callId: 'marsh-ferry', x0: 167 * TS, x1: 203 * TS - 64, x: 167 * TS, y: 18 * TS + 8, w: 64, h: 8, speed: 32, ferry: true, toll: 10 });
  F.R.pools.push({ x0: 167 * TS, x1: 203 * TS, y: 19 * TS, shallow: false, depth: 0, bottom: 22 * TS });   /* its bed is its floor: a fall in is a splash until the sluice drains it to shallows */
  F.block(167, 202, 22, 27);
  F.plat(181, 12, 3); F.ent('archer', 182, 11, { face: -1 }); F.plat(193, 12, 3); F.ent('archer', 194, 11, { face: -1 });
  F.ent('wasp', 176, 15); F.ent('wasp', 188, 15); F.ent('wasp', 199, 15);
  F.ent('hopper', 179, 21, { face: -1, ifDrained: 167 }); F.ent('hopper', 191, 21, { face: 1, color: 'yellow', ifDrained: 167 }); F.ent('stray', 185, 21, { kind: 'trap', ifDrained: 167 });
  F.coins([172, 16], [178, 16], [186, 16], [192, 16], [198, 16], [175, 21], [196, 21]);
  F.plat(200, 20, 2); F.block(203, 208, 18, 27); F.ent('check', 206, 17);
  // AND THE MARSH WENT QUIET FOR A HUNDRED AND THIRTY COLUMNS: the whole pad crossing and the archers
  // after it, which is where both of its rules are actually asked for.
  F.ent('sign', 274, 15, { text: 'SPITTERS THROW IN ARCS. STAND WHERE THE LAST ONE LANDED.' });   /* on the reed bed: at 286 it stood five rows up over the open lake */
  F.ent('sign', 335, 10, { text: 'THE BOARDS HOLD. THE WATER UNDER THEM BITES, AND A GAR WILL COME UP ONTO THEM.' });
  F.ent('sign', 405, 10, { text: 'ARCHERS ACROSS THE WATER. GO WHEN AN ARROW FLIES: THE NEXT IS A MOMENT AWAY.' });
  // A BUD LANDS YOU ON THE STAGES AND THE BANK'S LIP, and the garrison read all three as fresh floor and stood a spitter and
  // two thorns where you come down. They are landings: kept calm (in final columns, after both grows).
  F.R.calm = (F.R.calm || []).concat([[240, 257, 9, 14], [282, 290, 9, 14], [305, 312, 9, 14]]);
  // AND THE OTHER LANDINGS IT STOOD THINGS ON: the drowned village's planks (a turtle and a frog were two strides from where
  // the pads put you down, and its spitters stood in the fog) and the mud flats' first step. Its eels, wasps and archers are
  // the village's fight now.
  F.R.calm = F.R.calm.concat([[326, 371, 12, 17], [440, 452, 14, 18]]);
  // AND NOTHING THAT SHOOTS OVER THE FIRST PADS: the garrison stood an archer on the bank at 14, in range of the whole lily
  // pond, and a turtle at its edge. The pond is where the sink is learnt.
  F.R.calm = F.R.calm.concat([[8, 46, 14, 22]]);
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
  ent('sign', 324, 19, { text: 'CHIEFTAIN: RED IS THE CLUB, BLUE THE SWORD, GREEN THE BOW. BREAK A RACK TO END ONE.' }); ent('sign', 9, 19, { text: 'TAM WENT AHEAD TO COUNT GOBLINS. HIS TRACKS STOP AT THE GATE. A CAGE HANGS PAST IT.' });
  /* THE DASH ATTACK, taught (the wood teaches the heavy and the down attack; this is the third key). One guard alone on the flat
     road with room to run at him: a light cut rings off his shield, a dash with a swing out of it knocks him OFF BALANCE
     (the guard family's unbalance in main.js), and the hint says so once (lessonHint 'dashatk'). The shield at the siege
     engine is its exam. (Two sprigs stood here: the camp's first word was two things walking at you.) */
  ent('sign', 13, 19, { text: 'HIS SHIELD IS UP. DOUBLE-TAP TOWARD HIM AND SWING: THE DASH ATTACK THROWS HIM OFF BALANCE.' });
  ent('shield', 25, 19, { face: -1 });
  coins([9, 18], [18, 17], [21, 18]);
  ent('cage', 31, 19, { kind: 'bird' });
  ent('torch', 36, 19); ent('treehouse', 40, 8);
  // ---- THE GANTRY. Forty tiles of flat camp road with nothing to do on it but hold right. They have built a
  // walkway over the top of it to watch the road from, and the only things worth taking in this end of the
  // camp are up there: a climb, three stepped ledges, a rope down off the far end, and their own KNIGHT
  // standing on it - the first goblin knight in the game, on the one stretch you cannot simply walk past.
  { for (let y = 13; y <= 19; y++) { set(44, y, T.NET); set(45, y, T.NET); }   // the ladder up to it
    plat(46, 12, 5); plat(54, 10, 5); plat(62, 12, 5);                        // up, over, and down again
    for (let y = 13; y <= 19; y++) { set(66, y, T.NET); set(67, y, T.NET); }  // and the rope down the far end
    /* (a pike and an archer stood up here, over the horn tower: two ideas on one stretch, and the level's rule is the horn. The
       gantry is the climb to the silver now, and the tower is the only thing watching the road) */
    ent('silver', 55, 9);
    coins([47, 11], [50, 11], [56, 9], [59, 9], [63, 11], [65, 11]); }
  // one guard at the armoury gate with its elite (the brute at 292 and the one at the tunnel mouth went: THE STOCKADE was level three and one of the densest levels in the game)
  ent('shield', 223, 19, { face: -1 });   /* base coordinates: 307 in the built level */

  // ---- 2. Watchpost: a horn on the tower. Silence it first. ----
  block(54, 56, 14, 19); plat(53, 13, 5); ent('towertop', 55, 13); ent('coin', 57, 12);
  plat(46, 17, 3); plat(50, 14, 2); plat(59, 16, 2); plat(58, 13, 2); // two ways up
  ent('archer', 55, 12, { face: -1, horn: true });
  ent('check', 45, 19);
  ent('sign', 44, 19, { text: 'HE PUTS DOWN HIS BOW TO BLOW THE HORN. SILENCE HIM BEFORE IT SOUNDS, OR THE CAMP COMES.' });   /* THE RULE, said at the first tower: the horn's wind-up is drawn over him now (drawHornTell in main.js) */
  coins([47, 15], [51, 12], [64, 18]);

  // ---- 3. Rope bridge over the ravine, with a goblin at the far end holding a knife ----
  planks(71, 74, 20); planks(75, 86, 21); planks(87, 90, 20);
  net(71, 90, 25); coins([76, 24], [79, 24], [82, 24], [85, 24]); ent('relic', 86, 24, { kind: 'gauntlet', hang: true }); ent('silver', 73, 24); // the ravine cache, on the net
  plat(78, 23, 3); plat(83, 23, 3); block(87, 90, 23, 27); block(89, 90, 22, 27);
  ent('bridge', 71, 20, { x1: 90 });
  floor(91, 185, 20);
  ent('sprig', 92, 19, { face: -1, cutter: true });
  coins([76, 19], [81, 19], [86, 19]);
  ent('check', 95, 19);

  // ---- 4. The palisade gate: crank it open, or roll a barrel into it ----
  ent('barrel', 96, 19); ent('crank', 98, 19, { wall: 101 });
  pal(101, 15, 19);
  ent('sprig', 109, 19, { face: -1 });   /* (and a sapper: the gate is the idea here, not a bomb) */
  ent('torch', 103, 19); ent('torch', 115, 19);

  // ---- 5. The yard: every tool in one room. Free the fox, tip the brazier on the hounds, roll the barrel into the inner gate. ----
  ent('treehouse', 122, 7); ent('treehouse', 150, 6); ent('treehouse', 176, 8);
  block(120, 128, 17, 19); coins([121, 15], [126, 15]);
  ent('check', 131, 19);
  ent('sign', 133, 19, { text: 'THE YARD IS A WEAPON: FREE THE FOX, TIP THE BRAZIER, ROLL THE BARREL.' });
  ent('hound', 136, 19, { face: -1 }); ent('cage', 139, 19, { kind: 'fox' });
  ent('sprig', 144, 19, { face: -1 }); ent('brazier', 150, 19); ent('sprig', 153, 19, { face: 1 }); ent('hound', 157, 19, { face: -1 }); ent('sprig', 159, 19, { face: -1 });
  ent('barrel', 162, 19); ent('shield', 165, 19, { face: -1 }); ent('crank', 167, 19, { wall: 170 }); ent('brazier', 169, 19); // tip it into the stakes and the wall burns
  pal(170, 15, 19);
  ent('brute', 175, 19, { face: -1 }); ent('archer', 182, 19, { face: -1 });   /* a brute and an archer behind the burning gate (the sapper between them went) */
  ent('torch', 130, 19); ent('torch', 147, 19); ent('torch', 173, 19); ent('torch', 181, 19);
  coins([141, 17], [155, 17], [164, 17], [177, 18]);
  ent('check', 184, 19);

  // ---- 5b. The kennels and the armoury: hounds in the yard, an archer on the shed, barrels by the inner gate ----
  floor(186, 249, 20);
  for (let x = 187; x <= 200; x++) set(x, 20, T.RAIL); ent('cart', 188, 19); ent('pike', 195, 19, { face: -1 }); ent('pike', 198, 19, { face: -1 }); ent('sign', 186, 19, { text: 'A LOOT CART ON THE RAIL. CUT IT AND IT ROLLS. THE PIKES HOLD THE LINE. NOT AGAINST A CART.' });
  ent('torch', 188, 19); ent('hound', 193, 19, { face: -1 }); ent('cage', 199, 19, { kind: 'bird' });
  block(203, 205, 15, 19); plat(202, 14, 5); ent('towertop', 204, 14); ent('archer', 204, 13, { face: -1, horn: true }); plat(199, 17, 2); plat(207, 17, 2); coins([203, 13], [207, 16]); // the third horn tower: silence it or the kennels empty onto you
  ent('torch', 214, 19); ent('brute', 217, 19, { face: -1 }); ent('check', 215, 19);
  ent('treehouse', 221, 6);
  ent('barrel', 223, 19); ent('barrel', 226, 19); ent('crank', 229, 19, { wall: 232 }); ent('brazier', 228, 19);
  pal(232, 15, 19);
  ent('hound', 240, 19, { face: -1 }); ent('torch', 235, 19); ent('torch', 246, 19);
  coins([193, 17], [213, 17], [224, 16], [238, 17], [244, 18]);
  ent('check', 247, 19);

  // ---- 6. The lift to the upper walkway ----
  for (let y = 20; y <= 27; y++) { set(250, y, 0); set(251, y, 0); } net(250, 251, 26); for (let y = 21; y <= 25; y++) set(250, y, T.NET); // miss the lift and the net catches you: rungs up to where it waits
  movers.push({ kind: 'lift', x: 250 * TS, y: 20 * TS, y0: 20 * TS, y1: 12 * TS, w: 32, h: 8, speed: 30 });
  block(252, 269, 12, 27);
  coins([256, 10], [264, 10]);   /* (a sapper met you off the lift: a fight at a landing) */

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
  ent('check', 323, 19);   /* (a hound stood at the foot of the lift: the hall's door is a breath, not a fight) */

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
    duskStart: undefined, music: 'stockade', night: true, lessons: [{ kind: 'dashatk', x0: 11, x1: 29 }],   /* the dash attack's lesson (lessonHint in main.js) */
    palette: { dress: 'camp', ledges: 'lashed', haze: 'rgba(24,18,44,0.3)', sky: 'night',   /* nothing in a goblin camp is sawn: split poles, laid side by side and lashed */ canopy: ['#16301f', '#1f4a2a', '#2a5e36', '#3a7a48'] },
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
  G.ent('sign', 249, 19, { text: 'SAPPERS CARRY POWDER. KILL THEM FROM A DISTANCE, OR BLOCK THE BLAST.', pyro: 'SAPPERS CARRY POWDER. KILL THEM FROM A DISTANCE: THAT IS WHAT EMBERS ARE FOR.', paladin: 'SAPPERS CARRY POWDER. KILL THEM FROM AFAR, OR TAKE THE BLAST ON THE AEGIS.' });
  for (const x of [256, 266, 276, 286]) G.ent('torch', x, 24);
  G.ent('deco', 254, 24, { kind: 'skullPile', v: 0 }); G.ent('deco', 273, 24, { kind: 'skullPile', v: 1 });   /* 281 was where the crate stack goes: the skulls were inside it */
  G.ent('sapper', 258, 24, { face: -1 }); G.ent('barrel', 262, 24);   /* the tunnel is its sappers: the first thing in it is one */ G.crate(264, 24); G.ent('sapper', 270, 24, { face: -1 });
  /* (a sprig, and a bed of spikes under a roof you cannot jump in, were here) */ G.ent('barrel', 279, 24); G.crate(281, 24); G.crate(281, 23);
  G.ent('sapper', 284, 24, { face: -1 }); G.ent('brute', 288, 24, { face: -1 });
  G.coins([255, 23], [260, 23], [268, 23], [275, 22], [283, 23], [289, 23]);
  G.ent('check', 292, 19); G.ent('torch', 293, 19);
  G.ent('treehouse', 262, 8); G.ent('treehouse', 278, 8); G.coins([266, 12], [274, 12]);   /* (a goblin stood on the mound, out of reach and out of the way: a body the count paid for and the level did not) */
  G.ent('stray', 267, 24, { kind: 'coffer' });
  const R1 = G.done();
  // ---- 5d. THE WALL WALK: a caged squire at the fork. Above, planks along the top of a stake wall under archers, with a breach to jump. Below, the ditch: sappers, a hound, spikes, a brute. ----
  const W2 = grow(R1, R1, 186, 44);
  W2.block(186, 191, 20, 27);
  W2.ent('sign', 187, 19, { text: 'THE WALL WALK HAS ARCHERS. THE DITCH HAS SPIKES AND A COFFER. BOTH GO ON.' });
  W2.ent('cage', 189, 19, { kind: 'squire' });
  for (let y = 14; y <= 19; y++) { W2.set(190, y, T.NET); W2.set(191, y, T.NET); }
  const pal2 = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) W2.set(x, y, T.PALISADE); };
  pal2(192, 204, 15, 17); pal2(207, 223, 15, 17);
  for (let x = 192; x <= 204; x++) W2.set(x, 14, T.PLANK); for (let x = 207; x <= 223; x++) W2.set(x, 14, T.PLANK);
  W2.block(192, 223, 22, 27);
  W2.R.interiors = (W2.R.interiors || []).concat([[192, 223, 18, 21, 'earth']]);
  W2.ent('torch', 197, 13); W2.ent('torch', 213, 13); W2.ent('archer', 199, 13, { face: -1 }); W2.ent('archer', 216, 13, { face: -1 }); W2.ent('thorn', 221, 13, { face: -1 });   /* the wall walk is its archers */
  W2.ent('stray', 212, 13, { kind: 'coffer' }); W2.coins([195, 12], [202, 12], [209, 12], [214, 12], [219, 12]);
  // THE DITCH'S BRAMBLES ARE A THROW TARGET: the hound and the brute stand two tiles off either edge of the spike
  // bed, close enough that a heavy blow or a dash sends either one into it (combat-variety-brief #8) - they used
  // to stand five tiles off, which asked for a blow harder than most heroes throw at 203/214 range.
  W2.ent('torch', 194, 21); W2.ent('torch', 210, 21); W2.ent('hound', 206, 21, { face: -1 }); W2.spikes(208, 209, 22); W2.ent('brute', 211, 21, { face: -1 }); W2.ent('sapper', 219, 21, { face: -1 });
  W2.ent('stray', 222, 21, { kind: 'coffer' }); W2.coins([200, 20], [206, 20], [212, 20], [218, 20]);
  W2.block(224, 229, 20, 27); W2.ent('check', 227, 19); W2.coins([225, 18]);
  const R2 = W2.done();
  // ---- 1b. THE SIEGE ENGINE: a catapult lobs barrels down the path as you come. Dodge them, close in, and wreck it. ----
  const C = grow(R2, R2, 30, 40);
  C.floor(30, 69, 20);
  C.ent('sign', 31, 19, { text: 'THE ENGINE THROWS BARRELS. DODGE THROUGH, CLOSE IN, WRECK IT.' });
  C.ent('check', 36, 19); C.crate(46, 19);   /* the engine is the idea: one sprig and the shield (the dash attack's exam) between you and it */ C.crate(47, 19); C.crate(47, 18);
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
  ent('sign', 298, 19, { text: 'MOTHER CAP: CUT THE GILLS WHEN SHE OPENS, SPRING OFF THE STUMP, PLUNGE THE HEART.' });
  ent('npc', 11, 19, { kind: 'elder' }); // the elder myconid wants clean light
  ent('glow', 8, 19); ent('puffball', 14, 19); ent('sporeling', 18, 19, { face: -1 }); ent('puffball', 22, 19);
  bouncer(27, 19); coins([27, 15], [27, 12], [27, 9]);
  ent('spitcap', 30, 19, { face: -1 }); ent('sign', 31, 19, { text: 'SPITCAPS THROW SLEEP CLOUDS. A SWOLLEN ONE IS AT ITS WEAKEST.' });
  ent('sporeling', 33, 19, { face: -1 }); ent('glow', 38, 19); ent('sign', 41, 19, { text: 'PUFFBALLS BURST WHEN TOUCHED. SLASH ONE FROM RANGE. THE CLOUD DRIFTS DOWNHILL.' });

  // ---- 2. The bouncer canyon: up the caps to the high path ----
  floor(45, 61, 26);
  bouncer(48, 25); plat(47, 19, 3); bouncer(49, 18); plat(48, 12, 3); plat(52, 12, 3); plat(56, 12, 3); ent('silver', 57, 11);
  ent('mover', 52, 16, { len: 2, range: 4, cap: true, speed: 30 });
  ent('vent', 58, 25, { period: 4, on: 1.8, h: 100 }); plat(57, 22, 3);   /* TWO ROWS LOWER. At 20 it sat right where the vent's lift runs out, so the gust set you down on it and you stood there going nowhere; at 22 you stand inside the lift and it carries you */ ent('roller', 55, 25, { face: -1 });
  ent('puffball', 53, 11); ent('drone', 58, 8);
  coins([50, 16], [54, 10], [58, 10], [58, 20]); ent('glow', 46, 25); ent('glow', 52, 25);
  ent('sign', 46, 25, { text: 'VENTS LIFT YOU. ROLLERS POP WHEN PLUNGED. DRONES DRIFT TOWARD NOISE.' });
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
  ent('sign', 134, 13, { text: 'VIOLET SPORES PUT YOU TO SLEEP. BLOCK THROUGH A CLOUD, OR RUN.', pyro: 'VIOLET SPORES PUT YOU TO SLEEP. BURN A CLOUD AWAY WITH THE JET, OR RUN.', paladin: 'VIOLET SPORES PUT YOU TO SLEEP. HOLD THE AEGIS THROUGH A CLOUD, OR RUN.' });
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
  ent('sign', 167, 13, { text: 'ONE CUT CLEARS A WEB. WEAVER SPIT HOLDS YOUR FEET: MASH OUT. FIRE EATS WEB.' });
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
  ent('sign', 201, 13, { text: 'THE CAPS GROW INTO STEPS. WAIT FOR THEM TO RISE, THEN CLIMB.' });
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
    palette: { sky: [[64, 96, 112], [150, 190, 160]], near: 'mushroom', myc: true, dress: 'myc', haze: 'rgba(120,160,140,0.2)', grass: '#4a8a4a', grassL: '#7ac860', grassD: '#2f5e3a', dirt: '#4a3a3c', dirtL: '#5e4c4a', dirtD: '#33262a', canopy: ['#1f4a3a', '#2a5e46', '#3a7a55', '#4f9a68'] },
    weather: [{ x0: 0, x1: 99999, kind: 'spore' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'hive' }],
    storm: { x0: 201 * TS, x1: 244 * TS, y: 14 * TS },
    rot: { x0: 44 * TS, x1: 296 * TS }, // the wood sickens the deeper you go: a violet wash that grows with x, and lifts when she dies
    quest: { n: 3, item: 'cap', name: 'CLEAN CAP', npc: 'elder', done: 'THE LIGHT IS GATHERED', thanks: "THE ELDER'S THANKS" },
    arena: { x0: 297 * TS, x1: 374 * TS, floor: 20 * TS, trigger: 306 * TS, wallL: 296, wallR: 375, boss: 'mother', music: 'sporemother', tint: '#9a5aa8', tintA: 0.1 },
  }
  // ---- 6c. THE PUFFBALL BOG: three sinks in the ground with caps at the bottom, lurkers between, drones above, a geyser, a shaman ----
  const G = grow(L, ret, 245, 44);
  G.floor(245, 288, 14);
  for (const [x0, x1] of [[252, 255], [262, 266], [274, 278]]) { for (let x = x0; x <= x1; x++) for (let y = 14; y <= 19; y++) G.set(x, y, 0); for (let x = x0; x <= x1; x++) G.set(x, 19, T.BOUNCER); }
  G.ent('sign', 246, 13, { text: 'THE BOG KEEPS WHAT FALLS IN. PLUNGE THE FLOATING CAPS TO BOUNCE OUT.' });
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
  Tm.ent('sign', 202, 13, { text: 'THE NEST ROLLS ROLLERS DOWN. JUMP THEM, OR STOMP ONE AND RIDE IT.' });
  Tm.ent('nest', 234, 5, { every: 2.4, dir: -1 });
  Tm.ent('glow', 204, 13); Tm.ent('glow', 218, 9); Tm.ent('glow', 231, 5); Tm.ent('sporeling', 225, 7, { face: -1 }); Tm.ent('puffball', 211, 11);
  Tm.coins([205, 12], [211, 9], [218, 7], [225, 5], [232, 3], [238, 13]);
  Tm.ent('check', 239, 13);
  const R2 = Tm.done();
  // ---- 4b. THE FORK: off the shelf-climb plateau. Above, the cap canopy: ledges, spring caps, a drone. Below, the root cellar: a roofed run of lurkers, a roller and violet spores, with a cap at the end to spring you out. ----
  const Fk = grow(R2, R2, 131, 44);
  Fk.ent('sign', 129, 3, { text: 'CAP CANOPY ABOVE, ROOT CELLAR BELOW. HOLD DOWN TO LOOK. LURKERS SLEEP BELOW.' });
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
  Dg.ent('sign', 425, 13, { text: 'IT IS DARK DOWN HERE: STRIKE A GLOWBUD FOR LIGHT. SPROUTS GROW UNDER YOUR FEET.' });
  for (const x of [432, 437, 442]) Dg.ent('glowbud', x, 24); Dg.ent('glowbud', 434, 20);
  Dg.ent('lurker', 439, 24); Dg.ent('sporeling', 444, 24, { face: -1 }); Dg.ent('drone', 451, 16);
  Dg.coins([433, 23], [436, 23], [440, 23], [443, 22], [455, 16], [460, 12], [462, 12]);
  Dg.ent('check', 466, 13);
  Dg.R.moversExtra = (Dg.R.moversExtra || []).concat([ // the sprouts: a bud you hop on; stand on it and it shoots up 56px, holds, and withers back
    { kind: 'growcap', x: 450 * TSZ + 8 - 16, y: 22 * TSZ - 8, y0: 22 * TSZ - 8, y1: 22 * TSZ - 64, w: 32, h: 8, rise: 56, state: 'bud', k: 0 },
    { kind: 'growcap', x: 456 * TSZ + 8 - 16, y: 18 * TSZ - 8, y0: 18 * TSZ - 8, y1: 18 * TSZ - 64, w: 32, h: 8, rise: 56, state: 'bud', k: 0 }]);
  Dg.R.dark = 0.01; Dg.R.darkZones = (Dg.R.darkZones || []).concat([{ x0: 430 * TSZ, x1: 448 * TSZ, y0: 9 * TSZ, y1: 26 * TSZ, dark: 0.9 }]);
  const R=Dg.done();R.sleeps=[];R.storm=null;
  R.ents=R.ents.filter(e=>!['puffball','roller','nest','shaman','drone','gill'].includes(e.t));
  for(const e of R.ents)if(e.t==='sign'&&/SLEEP|SPORES|PUFFBALL|ROLLERS|GILLS|BROOD|NEST/.test(e.text||''))e.text='FOLLOW THE CAPS. BOUNCE TO THE HIGH ROAD; STRIKE GLOWBUDS TO LIGHT THE ROOTS.';
  const A=R.arena,m=R.ents.find(e=>e.t==='mother'),mx=m.x,fy=A.floor/TS;
  A.x0=(mx-23)*TS;A.x1=(mx+24)*TS;A.wallL=mx-24;A.wallR=mx+25;A.trigger=(mx-21)*TS;
  for(let x=mx-23;x<=mx+24;x++)for(let y=fy-12;y<fy;y++)R.grid[y*R.W+x]=T.AIR;
  for(const [dx,dy] of [[-18,2],[-14,4],[-10,6],[8,6],[12,4],[16,2]])for(let k=0;k<3;k++)R.grid[(fy-dy)*R.W+mx+dx+k]=T.ONEWAY;
  for(const x of [mx-3,mx+3])R.grid[(fy-1)*R.W+x]=T.BOUNCER;
  R.ents=R.ents.filter(e=>e.t==='mother'||e.x<mx-23||e.x>mx+24||['deco','glow','coin'].includes(e.t));
  R.ents.push({t:'glowbud',x:mx-8,y:fy-1,motherNode:true},{t:'sign',x:mx-22,y:fy-1,text:'STRIKE THE MARKED ROOT. SPRING TO THE HEART. THE ROOT MOVES AFTER EACH OPENING.'});
  for(const x of [450,456])R.ents.push({t:'glowbud',x:x-1,y:x===450?21:17,mycelium:true});
  return R;
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
  ent('sign', 313, 13, { text: 'KING GORM\'S CROWN TURNS BLADES. DROP A CAGE ON HIM FROM THE PLATES, THEN CUT.' });
  ent('door', 12, 19, { at: 12 }); ent('folk', 9, 19, { door: 12 }); ent('folk', 17, 19, { door: 12, alt: true }); ent('deco', 20, 19, { kind: 'well' });
  ent('sprig', 22, 19, { face: -1 }); coins([8, 18], [15, 17], [26, 18]); ent('npc', 26, 19, { kind: 'cook' });
  ent('sign', 29, 19, { text: 'COURT THIEVES SNATCH GOLD AND RUN. CATCH ONE AND IT PAYS YOU BACK MORE.' });
  ent('thief', 34, 19, { face: -1 }); ent('door', 40, 19); ent('folk', 38, 19, { door: 40 });
  // the canopy road over the pasture, and a rope ladder up onto the first hall's roof
  plat(6, 16, 3); plat(11, 14, 3); plat(16, 12, 4); plat(22, 14, 3); plat(27, 16, 3); plat(33, 14, 3); plat(38, 12, 3); ent('coin', 18, 11);   /* the court's silver is the hall's, as its sign says: this one is gold */
  coins([7, 15], [12, 13], [18, 11], [23, 13], [28, 15], [34, 13], [39, 11]); ent('wasp', 25, 11);
  for (let y = 12; y <= 19; y++) set(44, y, T.NET);
  ent('sign', 41, 19, { text: 'JUMP UP THROUGH ROPES. THE ROOF ROAD SKIPS THE FIRE; THE HALL HAS SILVER.' });
  ent('check', 43, 19);

  // ---- 2. The first hall: inside a trunk. A bell at the far end and a gate under it. ----
  ceiling(45, 84, 16); block(45, 84, 20, 27);
  ent('torch', 48, 19); ent('torch', 60, 19); ent('torch', 72, 19); ent('torch', 82, 19);
  ent('sign', 47, 19, { text: 'PIKES BRACE WHEN YOU CHARGE. JUMP THE PIKE AND CUT BEHIND, OR THROW THE SHIELD.', pyro: 'PIKES BRACE WHEN YOU CHARGE. JUMP THE PIKE AND BURN BEHIND, OR ARC EMBERS OVER.', paladin: 'PIKES BRACE WHEN YOU CHARGE. JUMP THE PIKE AND STRIKE BEHIND, OR CHARGE IT.' });
  ent('pike', 56, 19, { face: -1 }); ent('sprig', 62, 19, { face: -1 }); ent('sprig', 68, 19, { face: -1 });
  ent('brazier', 53, 19); ent('brazier', 66, 19); // oil braziers: tip them onto the line, or get burned
  ent('bell', 80, 19, { gate: 84 }); ent('sprig', 76, 19, { face: 1, ringer: true, bell: 80 }); ent('stray', 72, 19, { kind: 'cup' });
  /* (the gate under the bell starts open: the bell drops it, and it lifts again - it was shut from the start, and nothing on the road side opened it) */
  coins([52, 18], [58, 17], [65, 18], [74, 17]);
  // the way around the gate if the bell rings: a two-wide hatch through the roof with ledges up it, onto the high road
  for (let x = 77; x <= 78; x++) for (let y = 13; y <= 16; y++) set(x, y, 0);
  plat(77, 18, 2); plat(77, 16, 2); plat(77, 14, 2); plat(76, 12, 4); ent('silver', 79, 11);
  // THE ROOF ROAD: the hall's fire vents through the roof (jump the puffs), thieves work the ridge, wasps nest in the eaves, an archer watches the ridge
  ent('firevent', 52, 12, { every: 2.6 }); ent('firevent', 63, 12, { every: 3.3 }); ent('firevent', 72, 12, { every: 2.9 });
  ent('thief', 56, 12, { face: -1 }); ent('thief', 69, 12, { face: 1 }); ent('wasp', 60, 9); ent('wasp', 74, 9); ent('archer', 66, 12, { face: -1 });
  plat(58, 10, 3); plat(61, 8, 2); plat(64, 8, 3); coins([48, 11], [55, 11], [59, 9], [65, 7], [70, 11], [75, 11]);   /* the first ledge was four rows off the roof road: a jump is three */   /* a step between the two: the far ledge was three across and one up from nothing */
  ent('sign', 46, 12, { text: 'THE ROOF ROAD. JUMP THE FIRE FROM THE VENTS. THIEVES UP HERE CANNOT RUN.' });
  ent('sign', 73, 19, { text: 'IF THE GATE FALLS: THE ROOF HATCH.' }); ent('torch', 78, 17); coins([77, 15], [78, 13]);   /* 79 was a tile past the ledge and the torch stood in the air */

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
  plat(146, 19, 3);   /* THE WAY OUT OF THE TRUNK: its floor sits four rows under the road outside, one more than a jump */
  ent('torch', 88, 21); ent('torch', 104, 21); ent('torch', 120, 21); ent('torch', 136, 21);
  ent('pike', 96, 21, { face: -1 }); ent('lever', 100, 21, { ram: 106 }); ent('ram', 106, 17, { hang: true }); ent('brute', 110, 21, { face: -1 });
  ent('firepit', 93, 21, { period: 3.2, on: 1.4, phase: 0 }); ent('brazier', 114, 21); ent('firepit', 127, 21, { period: 3.2, on: 1.4, phase: 1.6 }); // the burrow burns in gouts
  ent('sprig', 118, 21, { face: -1 }); ent('plate', 124, 21, { cage: 128 }); ent('dropcage', 128, 17); ent('brute', 132, 21, { face: -1 });
  ent('sign', 90, 21, { text: 'THEIR TRAPS WORK ON THEM: THE LEVER SWINGS THE RAM, THE PLATE DROPS THE CAGE.' });
  ent('sprig', 142, 21, { face: -1 }); ent('stray', 134, 21, { kind: 'cup' }); ent('gobmage', 137, 21, { face: -1 });   /* a composed pair: the reader keeps its distance behind the brute at 132, so closing on one means passing the other */
  coins([93, 20], [114, 20], [126, 19], [138, 20], [147, 20]);
  // the roads rejoin at 150: a slope of ledges from the burrow up to the yard
  block(150, 152, 18, 27); block(153, 158, 16, 27); block(159, 164, 14, 27); block(165, 190, 14, 27);
  ent('check', 167, 13);

  // ---- 4. The kennels: the Hound Master. Walls close, the gate opens when he falls. ----
  ent('torch', 170, 13); ent('torch', 188, 13); ent('cage', 172, 13, { kind: 'bird' });
  ent('greathound', 182, 13, { mini: true }); ent('chainpost', 187, 13);   /* mini:true like every other mini (audit 2026-09-24: bossLab could not find him) - the game already treated him as the mini */ // a kennel hound on a chain: cut it loose and it goes for his mount
  ent('sign', 169, 13, { text: 'GREAT HOUND: JUMP THE LUNGE, DODGE THE POUNCE, KILL THE PUPS. A BLOCK SKIDS IT.', pyro: 'GREAT HOUND: JUMP THE LUNGE, DODGE THE POUNCE, KILL THE PUPS. IT HATES FIRE.', paladin: 'GREAT HOUND: JUMP THE LUNGE, DODGE THE POUNCE, KILL THE PUPS. THE AEGIS SKIDS IT.' });
  gate(190, 9, 13);
  block(191, 210, 14, 27); ent('torch', 194, 13); coins([196, 12], [200, 12], [204, 12]); ent('check', 208, 13);
  plat(196, 11, 3); plat(201, 9, 3); plat(206, 11, 3); ent('archer', 202, 8, { face: -1, fire: true }); coins([197, 10], [202, 7], [207, 10]);

  // ---- 5. FORK TWO. Canopy (rows 5-10) over the roots (rows 16-20). ----
  // canopy
  plat(211, 11, 3); plat(216, 9, 3); plat(221, 7, 4);
  movers.push({ kind: 'swing', px: 231 * TS, py: 1 * TS, arm: 90, x: 0, y: 0, w: 48, h: 8, period: 3.0, phase: 0.8 });
  plat(238, 7, 3); ent('thief', 239, 6, { face: -1 }); plat(243, 9, 4); ent('wasp', 248, 6); ent('archer', 245, 8, { face: -1, fire: true }); ent('shield', 243, 8, { face: -1 });   /* a composed pair, not another lone bow: the shield stands on the near edge of the same perch, between the walkway and her fire arrows */
  movers.push({ kind: 'swing', px: 254 * TS, py: 1 * TS, arm: 96, x: 0, y: 0, w: 48, h: 8, period: 3.4, phase: 2.2 });
  plat(261, 9, 3); plat(266, 11, 3); plat(271, 11, 4);
  plat(228, 9, 2); plat(231, 10, 3); plat(235, 8, 2); plat(250, 10, 2); plat(253, 11, 3); plat(257, 10, 2); // a ledge road under each canopy swing
  coins([212, 10], [217, 8], [223, 6], [231, 6], [239, 6], [245, 7], [254, 6], [262, 8], [267, 10], [272, 10]);   /* the apex of the arc was a course over the top of anybody's jump */
  // roots
  block(211, 275, 21, 27); ceiling(211, 274, 15);   /* the roof stops a column short of the way out: ending ON the exit block left a gap one tile high, and nobody fits through that */
  for (let x = 211; x <= 275; x++) for (let y = 16; y <= 20; y++) set(x, y, 0);
  ent('torch', 214, 20); ent('torch', 230, 20); ent('torch', 246, 20); ent('torch', 262, 20);
  ent('firepit', 216, 20, { period: 3.4, on: 1.5, phase: 0.8 }); ent('brazier', 224, 20); ent('firepit', 265, 20, { period: 3.4, on: 1.5, phase: 2.4 });
  ent('hound', 220, 20, { face: -1 }); ent('pike', 228, 20, { face: -1 }); ent('lever', 234, 20, { ram: 240 }); ent('ram', 240, 16, { hang: true }); ent('sprig', 244, 20, { face: -1 }); ent('sprig', 248, 20, { face: -1 });
  ent('plate', 254, 20, { cage: 258 }); ent('dropcage', 258, 16); ent('brute', 262, 20, { face: -1 }); ent('thief', 268, 20, { face: -1 });
  ent('stray', 250, 20, { kind: 'cup' }); coins([218, 19], [236, 19], [252, 19], [266, 19], [273, 19]);
  block(275, 277, 17, 27); block(278, 281, 15, 27); block(282, 300, 14, 27);
  block(273, 274, 19, 20);   /* THE STEP OUT OF THE ROOTS: the way up was four tiles from the burrow floor and a jump is three */
  ent('check', 284, 13);

  // ---- 6. The processional: townsfolk line a carpet, guards bar the way, banners hang. ----
  ent('sign', 286, 13, { text: 'THE COURT WATCHES FROM THE BRANCHES. FIRE ARCHERS LIGHT THE GRASS. BRAZIERS TIP.' });
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
  ent('deco', 320, 8, { kind: 'banner', v: 1 }); ent('deco', 368, 8, { kind: 'banner', v: 0 });   /* ON the gallery, not level with its boards: at row 9 they hung a tile under it in open air */
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
  G.ent('sign', 285, 13, { text: 'THE TOLL BRIDGE. PAY AND HURRY: THEY CUT THE ROPES. LEDGES BELOW STILL CROSS.' });
  G.ent('door', 286, 13); G.ent('torch', 288, 13); G.ent('torch', 323, 13);
  G.ent('pike', 297, 13, { face: -1 }); G.ent('thief', 305, 13, { face: -1 }); G.ent('thief', 313, 13, { face: -1 });
  G.ent('sprig', 325, 13, { face: -1, cutter: true }); G.ent('wasp', 301, 10);
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
  F.ent('sign', 212, 13, { text: 'THE WOOD IS BURNING. GO OVER: GLOWING BRANCHES GIVE WAY, ROPES DO NOT.' });
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
  F.ent('wasp', 229, 8); F.ent('wasp', 248, 7); /* smoked out of the eaves and furious */
  F.ent('thief', 222, 12, { face: -1 }); F.ent('thief', 252, 12, { face: -1 }); // carrying what they could grab
  F.ent('sprig', 237, 11, { face: -1 }); F.ent('sprig', 257, 11, { face: -1 });
  // the floor of the burn: a way back up if you fall, and something worth the trip
  F.plat(224, 21, 3); F.plat(236, 21, 3); F.plat(246, 21, 3); // somewhere to stand out of the worst of it
  for (const y of [22, 20, 18, 16]) F.plat(255, y, 3); // and the ladder of ledges up the far bank: a fall costs you the crossing, not the run
  F.ent('silver', 236, 24); F.ent('deco', 231, 24, { kind: 'skullPile', v: 0 }); F.ent('deco', 247, 24, { kind: 'skullPile', v: 1 });
  F.ent('hound', 225, 24, { face: 1 }); F.ent('hound', 241, 24, { face: -1 }); // their dogs got left down there and they are not friendly now
  F.coins([222, 12], [227, 11], [233, 9], [237, 11], [242, 13], [247, 11], [252, 12], [256, 11], [224, 20], [240, 18], [254, 17]);   /* it was a column short of the ledge it belongs on */
  F.ent('check', 217, 13);
  const R3 = F.done();

  // ---- 4c. THE HANGING ROOTS: past the kennels the wood falls away into a bramble gully, and the only way
  // over is what hangs across it - root ledges, a branch already cracking, one rope. The storm shamans have
  // the far side: one down on a stump in the gully throwing the weather up at you, one on the bank waiting.
  const H = grow({ W: R3.W, H: R3.H, grid: R3.grid, ents: R3.ents }, R3, 191, 42);
  H.block(191, 194, 14, 27); H.block(229, 232, 14, 27);                     /* the two banks */
  H.block(195, 228, 24, 27); H.spikes(201, 222, 23);                         /* the gully floor, and the brambles in it */
  H.block(207, 208, 14, 23);                                                  /* a dead stump standing out of the brambles, level with the banks: a stepping stone with a shaman on it, not a pit */
  H.ent('sign', 192, 13, { text: 'THE BRAMBLES HOLD YOU. CROSS ABOVE: THE CRACKED BRANCH GIVES, THE ROPE HOLDS.' });
  H.ent('check', 193, 13); H.ent('torch', 194, 13);
  H.plat(196, 12, 3); H.plat(201, 10, 2); H.plat(205, 12, 2);
  for (let i = 0; i < 3; i++) H.set(209 + i, 11, T.SHELF);                  /* the branch that is going */
  H.plat(209, 13, 3); H.plat(213, 11, 2); H.plat(216, 10, 2);                 /* under the branch, the way that does not break */
  H.R.moversExtra.push({ kind: 'swing', px: 220 * TS, py: 2 * TS, arm: 88, x: 0, y: 0, w: 48, h: 8, period: 3.4, phase: 1.1 });
  H.plat(218, 11, 2); H.plat(222, 12, 3); H.plat(226, 13, 2);                /* the ledge road under the rope: the rope is the fast way, never the only way */
  for (const y of [22, 20, 18, 16]) { H.plat(196, y, 2); H.plat(225, y, 3); }   /* a fall costs you the crossing, not the run */
  H.ent('stormshaman', 207, 13, { face: -1 });                               /* on the stump, in your way */
  H.ent('stormshaman', 231, 13, { face: -1 }); H.ent('soldier', 229, 13, { face: -1 });
  H.ent('wasp', 216, 6);
  H.coins([197, 11], [201, 9], [206, 11], [210, 10], [216, 9], [219, 10], [223, 11], [227, 12]);
  const R4 = H.done();

  // ---- 2b. THE KNIGHTS' ROAD: out of the first hall and into the open, where the King keeps his own. A shield
  // line on the road, heavy knights behind it, storm shamans up on the old waystones, and a rampart walk of
  // ledges over all of it for anyone who would rather go over the top than through the middle.
  const K = grow({ W: R4.W, H: R4.H, grid: R4.grid, ents: R4.ents }, R4, 85, 48);
  K.block(85, 132, 20, 27);                                                    /* the road */
  K.block(100, 102, 17, 19); K.block(118, 120, 17, 19);                        /* the waystones */
  K.ent('sign', 86, 19, { text: "THE KNIGHTS' ROAD. SHIELDS, PLATE, AND SHAMANS ON THE STONES. THE WALL WALK GOES OVER IT." });
  K.ent('check', 88, 19); K.ent('torch', 87, 19); K.ent('torch', 112, 19); K.ent('torch', 131, 19);
  K.ent('deco', 94, 19, { kind: 'banner', v: 0 }); K.ent('deco', 125, 19, { kind: 'banner', v: 1 });
  /* THE FIRST PLATE MEETS YOU ALONE: one heavy knight on the road, the waystone between him and the shield line, so his grab is learned before the crowd */
  K.ent('heavy', 95, 19, { face: -1 });
  K.ent('soldier', 108, 19, { face: -1 }); K.ent('soldier', 112, 19, { face: -1 });
  K.ent('heavy', 126, 19, { face: -1 });
  K.ent('javelin', 114, 19, { face: -1 });
  K.ent('sign', 90, 19, { text: 'SHIELD UP IN FRONT OF PLATE AND HE GRABS IT. A RED MARK MEANS MOVE.' });
  K.ent('stormshaman', 119, 16, { face: -1 });   /* the near stone stays empty: the lone knight is a lesson, not an ambush */
  /* THE WALL WALK: the roof road off the hall, carried across the open to the canopy - no gap over three, no step over two */
  K.plat(86, 12, 3); K.plat(90, 10, 3); K.plat(95, 12, 3); K.plat(99, 10, 2); K.plat(103, 11, 3);
  for (let i = 0; i < 3; i++) K.set(107 + i, 10, T.SHELF);
  K.plat(107, 12, 3);                                                          /* and under it, the way that does not break */
  K.plat(112, 12, 3); K.plat(116, 10, 3); K.plat(121, 11, 3); K.plat(125, 12, 3); K.plat(129, 12, 4);
  K.ent('archer', 117, 9, { face: -1 }); K.ent('thief', 104, 10, { face: -1 });
  K.coins([87, 11], [91, 9], [96, 11], [104, 10], [108, 9], [113, 11], [122, 10], [126, 11], [92, 18], [104, 18], [116, 18], [128, 18]);
  const road=K.done();
  // THE OLD STONE: the court built on a gatehouse and an aqueduct. The arches carry the high road.
  const O=grow(road,road,472,48), a=472;
  O.block(a,a+47,14,27); O.R.structures=[];
  O.ent('sign',a+1,13,{text:'THE OLD STONE. CLIMB THE GATEHOUSE. THE RAM STILL GUARDS THE LAST ARCH.'});
  for(const x of [a+8,a+17,a+28,a+39]) {O.block(x,x,8,13);O.R.structures.push({kind:'stone',x0:x,x1:x+1,top:8,floor:14});}
  for(const x of [a+9,a+20,a+30]){O.plat(x,12,3);O.plat(x+3,10,3);}
  O.plat(a+6,7,13);O.plat(a+23,7,9);O.plat(a+36,7,7);
  for(const [x,y] of [[a+2,12],[a+4,10],[a+5,8],[a+19,9],[a+21,8],[a+32,9],[a+34,8],[a+43,9],[a+45,12]])O.plat(x,y,3);
  O.R.structures.push({kind:'arch',x0:a+6,x1:a+18,top:7,floor:14},{kind:'arch',x0:a+23,x1:a+42,top:7,floor:14});
  O.ent('archer',a+15,6,{face:-1});O.ent('shield',a+26,6,{face:-1});O.ent('brute',a+40,13,{face:-1});
  O.ent('lever',a+34,13,{ram:a+39});O.ent('ram',a+39,8,{hang:true});O.ent('silver',a+30,6);O.ent('check',a+46,11);
  O.coins([a+5,9],[a+11,6],[a+22,7],[a+37,6],[a+44,8]);
  const stone=O.done(), HN=grow(stone,stone,354,48), h=354;
  // THE HUNTING STANDS: ladders inside grounded towers, a rope walk, and one cuttable stand over the patrol.
  HN.block(h,h+47,14,27);HN.ent('sign',h+1,13,{text:'THE HUNTING STANDS. CLIMB INSIDE. CUT THE CRACKED POST TO DROP ITS DECK ON THE PATROL.'});
  for(const x of [h+5,h+29]){HN.plat(x,6,9);for(const [dx,y] of [[1,12],[4,10],[1,8]])HN.plat(x+dx,y,3);for(let y=6;y<=13;y++)HN.set(x+7,y,T.NET);HN.R.structures.push({kind:'timber',x0:x,x1:x+8,top:6,floor:14});HN.ent('archer',x+2,5,{face:-1});}
  for(let x=h+14;x<h+29;x++)HN.set(x,6,T.PLANK);HN.ent('bridge',h+14,6,{x1:h+28});
  HN.R.moversExtra.push({kind:'swing',px:(h+22)*TS,py:1*TS,arm:64,x:0,y:0,w:48,h:8,period:3.2,phase:0});
  HN.plat(h+39,9,5);HN.ent('timber',h+39,13,{x0:h+39,x1:h+43,row:9,floor:13,deep:1,hp:2,mound:1});
  HN.ent('sprig',h+41,13,{face:-1});HN.ent('shield',h+43,13,{face:-1});HN.ent('check',h+46,13);
  HN.coins([h+7,11],[h+10,9],[h+8,7],[h+17,5],[h+25,5],[h+34,7],[h+42,8]);
  const done=HN.done();done.playtestSections=[{name:'THE HUNTING STANDS',x0:354,x1:401},{name:'THE OLD STONE',x0:520,x1:567}];
  // Older isolated canopy ledges now have timber legs; the swinging logs retain their ropes.
  for(const [x,top,floor] of [[144,8,16],[159,8,16],[182,9,16],[311,13,25],[326,12,25]])done.structures.push({kind:'timber',x0:x,x1:x+2,top,floor});
  done.timber=true;done.masonry=[[520,567,6,27]];done.palette.ledges='beam';return done;
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
  ent('sign', 22, 19, { text: 'THREE EWES STRAYED. WALK INTO ONE AND IT FOLLOWS. THE SHEPHERD PAYS IN FLEECE.' });
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
  ent('sign', 124, 13, { text: 'RIDE THE MILL SAILS UP TO THE RIDGE AND ITS SILVER, OR KEEP LOW WITH THE TROLLS.' });
  ent('deco', 138, 13, { kind: 'cairn' });
  coins([131, 12], [146, 12], [164, 12], [170, 12]);
  ent('check', 174, 13);

  // ---- 4. The scree slope: the loose stone carries you down, rocks come off the cliff, harpies dive ----
  const steps = [[177, 190, 14], [191, 200, 15], [201, 212, 16], [213, 224, 17], [225, 238, 18], [239, 250, 19]];
  for (const [x0, x1, y] of steps) { block(x0, x1, y, 27); if (x0 > 177) scree.push({ x0, x1, y, dir: 1 }); }
  ent('sign', 180, 13, { text: 'SCREE SLIDES YOU DOWN: BLOCK TO BRACE, OR BOUNCE ACROSS. IF THE HILL FALLS, RUN.', pyro: 'SCREE SLIDES YOU DOWN: BOUNCE ACROSS IT OR RUN. IF THE HILL FALLS, DO NOT STOP.', paladin: 'SCREE SLIDES YOU DOWN: BOUNCE ACROSS IT OR RUN. IF THE HILL FALLS, DO NOT STOP.' });
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
  plat(277, 17, 3); plat(279, 10, 2); ent('coin', 280, 9);
  block(285, 363, 9, 27);
  block(276, 284, 20, 27); // the foot of the wall: a step down from the bank, no pit
  for (let y = 10; y <= 19; y++) { set(283, y, T.CLIMB); set(284, y, T.CLIMB); } // the crag wall: hold into the rock to cling, jump to kick up it
  ent('sign', 278, 19, { text: 'OCHRE ROCK WITH HANDHOLDS CLIMBS: HOLD INTO IT TO CLING, JUMP TO KICK UP.' });
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
  ent('sign', 307, 7, { text: 'THE RAM LORD TURNS STEEL. CUT HIM WHEN A GREEN RING SHOWS: AFTER A WALL OR LEAP.' });
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
    arena: { x0: 312 * TS, x1: 328 * TS, floor: 9 * TS, trigger: 315 * TS, wallL: 311, wallR: 329, boss: 'ram', music: 'ramlord', tint: '#6a4a7a', tintA: 0.12, fx: 'dust' },
  }
  // ---- 4b. THE ROPEWAY: the gorge proper. A swing, a rope lift, the old mill's sails, another swing; harpies on the wind, rocks off the cliff, a ladder out of the bottom. ----
  const GA = grow(L, ret, 256, 56);
  GA.block(256, 257, 19, 27); GA.block(258, 304, 26, 27); GA.block(305, 311, 19, 27);
  GA.ent('sign', 256, 18, { text: 'RIDE THE LIFT, THEN THE MILL SAILS, THEN THE CABLE SWING. NOTHING STAYS STILL.' });
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
  G.ent('sign', 178, 13, { text: 'THE GULLY WIND PULLS YOU BACK. WAIT FOR THE LULL, THEN JUMP.' });
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
  B.ent('sign', 62, 19, { text: 'THE HILL FOLK BAR THEIR DOORS UNTIL THE RAM LORD IS DEAD.' });
  B.R.stone.push([64, 64, 19, 19], [107, 107, 19, 19]); B.block(64, 64, 19, 19); B.block(107, 107, 19, 19);
  for (const [dx, alt] of [[70, false], [86, true], [102, false]]) { B.ent('door', dx, 19, { kind: 'cottage', at: dx }); B.ent('folk', dx - 3, 19, { door: dx, alt }); B.plat(dx - 2, 18, 5); }
  B.ent('deco', 78, 19, { kind: 'well' }); B.ent('deco', 94, 19, { kind: 'fence', v: 0 });
  B.ent('sprig', 74, 19, { face: -1 }); B.ent('shield', 90, 19, { face: -1 }); B.ent('goat', 99, 19, { face: -1 });
  B.ent('archer', 87, 17, { face: -1 }); B.ent('goat', 80, 19, { face: -1 });
  B.plat(85, 15, 2); B.ent('silver', 85, 14);
  B.coins([68, 17], [71, 17], [77, 18], [84, 17], [88, 17], [100, 17], [103, 17], [96, 18]);
  B.ent('check', 106, 19);
  const RD = B.done();
  // ---- 5c. THE GLASS QUARRY: where the hill folk took the glass out of the crag, and what grew back in it ----
  const Q = grow(RD, RD, 436, 44);
  Q.block(436, 479, 9, 27);
  for (let x = 447; x <= 469; x++) Q.set(x, 9, T.CRYST);      // the seam: his floor, and the half of the room that burns
  Q.ent('check', 438, 8);
  Q.ent('sign', 442, 8, { text: 'THE GLASS QUARRY. THE HIGH ROAD GOES OVER THE SEAM; THE LOW ONE GOES THROUGH.' });
  // the stagings the quarrymen left: the cold road over his seam, and never more than three tiles a hop
  Q.plat(445, 6, 3); Q.plat(450, 5, 3); Q.plat(455, 4, 3); Q.plat(460, 4, 3); Q.plat(465, 5, 3); Q.plat(470, 6, 3);
  Q.coins([446, 5], [451, 4], [461, 3], [466, 4], [471, 5], [443, 8], [473, 8]);
  Q.ent('deco', 439, 8, { kind: 'stone' }); Q.ent('deco', 474, 8, { kind: 'stone', v: 1 });
  Q.ent('deco', 444, 8, { kind: 'cairn' }); Q.ent('silver', 456, 3);
  /* (the Suncatcher lived here: he is gone from the scree, and his code is kept for a frost level) */
  return reworkScree(Q.done(), T);   /* THE SCREE PATH REWORK (2026-09-23): loose rock, broken stone, and the road under fire - src/scree-rework.js */
;
}

// ============================================================================================
// THE SECRET LEVEL - UNDERLEAF. King Gorm Underleaf was named after somewhere, and this is it.
// You only get here by putting him down in under three minutes, which means the runners he sent
// never got home: the village does not know, and it is two in the morning.
//
// THE RULE: IT IS NIGHT, SO NOTHING CAN SEE YOU. IT CAN ONLY HEAR YOU.
//   1. The ground has a voice. Thatch and moss and rope are silent; a loose board is the worst
//      thing in the village. The way through Underleaf is a way across MATERIALS.
//   2. Your verbs have a voice. A swing carries. A heavy blow carries further. A kill carries
//      furthest of all. Blocking makes no sound at all, which is the answer to the last fight.
//   3. What wakes wakes its neighbours. Not an alarm - a WINDOW LIGHTING, and then the door.
//
// It is not a stealth level with a fail state. You choose when the village wakes up: you can go
// quiet the whole way, or kick the first door in and fight the length of the street.
// ============================================================================================
function underleaf() {
  const L = painter(520, 46);                      /* rows 0-18 are the insides of the houses */
  const { block, floor, plat, ent, coins, set, spikes } = L;
  const movers = [], interiors = [], roofs = [], pools = [];
  block(0, 519, 0, 18);
  const room = (x0, x1, y0, y1, st = 'timber') => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); interiors.push([x0, x1, y0, y1, st]); };
  // A THATCHED ROOF IS THE QUIET ROAD, and a house IS its roof: the street runs on underneath, because a
  // building that blocks the road is a wall. Three courses - the walkable straw and the two under it - and
  // the roof sprite covers all three, so no bare rock is ever left standing in a village.
  const thatch = (x0, x1, y) => { for (let x = x0; x <= x1; x++) { set(x, y, T.SOFT); set(x, y + 1, T.SOLID); set(x, y + 2, T.SOLID); } roofs.push([x0, x1, y]); };
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.PLANK); };       /* loud */
  const loose = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SHELF); };        /* the worst */
  const moss = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SOFT); };          /* silent */
  const water = (x0, x1, yTop) => pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: yTop * TS + 4, shallow: true, depth: 12 });
  const gateCol = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); };
  const R = 34;                                    /* the street */
  // A LADDER AGAINST THE GABLE. Every roof in Underleaf has one, on the near side of the house, and it runs
  // one row ABOVE the straw so you can climb past the eave and step onto it - a ladder that stops under the
  // roof it serves is a ladder into a ceiling, and that is what was blocking the tower.
  const ladder = (x, top) => { for (let y = top; y <= R - 1; y++) set(x, y, T.NET); };
  const run = (x0, x1, y, step) => { for (let x = x0; x <= x1; x += (step || 4)) coins([x, y]); };

  // ---- 1. THE BACK LANE. Over the garden wall, in among the beans, and the first window. ----
  floor(0, 74, R);
  moss(0, 20, R); boards(40, 52, R); moss(56, 74, R);
  ent('sign', 4, R - 1, { text: 'UNDERLEAF SLEEPS, BUT HEARS. MOSS AND THATCH ARE QUIET; BOARDS AND KILLS ARE NOT.' });
  ent('npc', 10, R - 1, { kind: 'elder' });
  ent('check', 15, R - 1);
  ent('deco', 6, R - 1, { kind: 'gardenWall', v: 0 }); ent('deco', 24, R - 1, { kind: 'waterButt' });
  ent('deco', 14, R - 1, { kind: 'beanpoles', v: 0 }); ent('deco', 28, R - 1, { kind: 'skep' });
  ent('deco', 18, R - 1, { kind: 'washing' }); ent('deco', 12, R - 1, { kind: 'pot' });
  coins([8, R - 2], [22, R - 2], [50, R - 2], [4, R - 2], [16, R - 2], [32, R - 2], [42, R - 2], [54, R - 2]);
  // the first house teaches the whole level on one screen: a loud board, a ladder, a window in the wall
  thatch(30, 44, 28);
  ent('window', 36, R - 3, { gob: 'sprig', dx: 38, dy: R - 1 });
  ent('sign', 26, R - 1, { text: 'THE DITCH BOARDS ARE LOUD; THE THATCH IS QUIET. THE LADDER IS AT THE GABLE END.' });
  ladder(29, 27); plat(46, 30, 3);
  run(31, 43, 27, 3);
  loose(48, 50, R);                                /* a board somebody never nailed back down */
  ent('deco', 54, R - 1, { kind: 'cart' }); ent('deco', 38, R - 1, { kind: 'barrels' });
  ent('deco', 46, R - 1, { kind: 'gardenWall', v: 1 }); ent('deco', 60, R - 1, { kind: 'waterButt' });
  ent('deco', 52, R - 1, { kind: 'beanpoles', v: 1 }); ent('deco', 66, R - 1, { kind: 'gardenWall', v: 2 });
  ent('deco', 68, R - 1, { kind: 'washing' }); ent('deco', 72, R - 1, { kind: 'chickenCoop' });
  ent('hearthgob', 42, 27, { face: -1, sleeper: true });        /* out on the warm thatch over his own fire */
  ent('sprig', 62, R - 1, { face: -1, sleeper: true }); ent('sprig', 34, 27, { face: 1, sleeper: true });
  ent('archer', 20, R - 1, { face: 1, sleeper: true }); ent('thief', 44, R - 1, { face: -1, sleeper: true });
  ent('thief', 56, R - 1, { face: -1, sleeper: true });
  ent('assassin', 70, R - 1, { face: -1 });
  ent('sign', 64, R - 1, { text: 'ONE OF THEM IS AWAKE. HIS LUNGE CANNOT BE BLOCKED; THE STAB AFTER IT CAN.' });
  coins([58, R - 2], [64, R - 2], [72, R - 2]);

  // ---- 2. THE MILL. The wheel is the loudest thing in the valley and it is on your side. ----
  floor(75, 158, R);
  for (let x = 98; x <= 114; x++) set(x, R, T.AIR);
  block(98, 114, R + 1, 45); water(98, 114, R);     /* the millpond: one tile deep, and wading is the loudest floor here */
  ent('sign', 78, R - 1, { text: 'THE MILL WHEEL HIDES ALL SOUND NEAR IT. WADING THE POND IS THE LOUDEST THING.' });
  ent('deco', 88, R - 1, { kind: 'punt' }); ent('deco', 94, R - 1, { kind: 'netPoles' });
  plat(100, 32, 3); plat(106, 32, 3); plat(112, 32, 3);   /* stepping stones, for anyone who would rather not wade */
  coins([101, 31], [107, 31], [113, 31]);
  thatch(118, 139, 28);
  ent('deco', 122, R - 1, { kind: 'mill' });
  ladder(117, 27);
  run(119, 138, 27, 4);
  // IN ONE END AND OUT THE OTHER. A house you have to walk back out of the way you came in is a dead end with
  // furniture in it, so every enterable building in Underleaf has a far door: you cross it, you do not visit it.
  ent('doorway', 122, R - 1, { id: 'mill-out', to: 'mill-in', kind: 'goblin' });
  ent('doorway', 136, R - 1, { id: 'mill-far', to: 'mill-back', kind: 'goblin' });
  ent('doorway', 126, 27, { id: 'mill-top', to: 'mill-in', kind: 'goblin', label: 'DOWN THE CHIMNEY' });
  ent('window', 132, R - 3, { gob: 'sapper', dx: 134, dy: R - 1 });
  // ---- THE MILL LOFT: sacks to get up on, the hoist beam, and the brass key out on the end of it ----
  room(96, 124, 5, 13, 'hall');
  ent('doorway', 99, 13, { id: 'mill-in', to: 'mill-out', lock: [96, 124], label: 'THE MILL LOFT' });
  ent('doorway', 122, 13, { id: 'mill-back', to: 'mill-far', lock: [96, 124], label: 'OUT THE TAIL DOOR' });
  for (const [px2, py2] of [[102, 11], [107, 12], [110, 9], [115, 11]]) plat(px2, py2, 4);   /* the sack stack, three high */
  for (let x = 108; x <= 114; x++) set(x, 7, T.PLANK);                            /* the hoist beam over the trap */
  ent('key', 112, 6, { kind: 'brass' });
  ent('deco', 103, 13, { kind: 'barrels' }); ent('deco', 118, 13, { kind: 'wares' }); ent('torch', 107, 13);
  ent('deco', 100, 13, { kind: 'pot' }); ent('deco', 120, 13, { kind: 'waterButt' });
  ent('sprig', 116, 13, { face: -1, sleeper: true }); ent('sprig', 104, 10, { face: 1, sleeper: true });
  ent('thief', 111, 8, { face: -1, sleeper: true });
  ent('spider', 102, 6, { drop: 60 });                                            /* the odd spider, in the rafters */
  coins([104, 10], [111, 8], [116, 10], [108, 11], [112, 6]);
  ent('sign', 97, 13, { text: 'THE MILLER SLEEPS. THE BRASS KEY IS ON THE HOIST BEAM. SOMETHING IS ABOVE.' });
  for (let i = 0; i < 4; i++) movers.push({ kind: 'wheel', px: 145 * TS + 8, py: 30 * TS, r: 30, phase: i * Math.PI / 2, period: 6.5, x: 0, y: 0, w: 20, h: 6 });
  ent('berserker', 151, R - 1, { face: -1, chained: true });
  ent('sign', 147, R - 1, { text: 'THE BERSERKER CANNOT TURN WHILE HE RUNS. GO THROUGH HIM AND HIT HIS BACK.' });
  ent('sapper', 84, R - 1, { face: 1, sleeper: true });
  ent('archer', 92, R - 1, { face: -1, sleeper: true }); ent('shield', 128, 27, { face: -1, sleeper: true });
  ent('sprig', 94, R - 1, { face: 1, sleeper: true }); ent('assassin', 144, R - 1, { face: -1 });
  ent('deco', 80, R - 1, { kind: 'barrels' }); ent('deco', 86, R - 1, { kind: 'pot' });
  ent('deco', 96, R - 1, { kind: 'trough' }); ent('deco', 142, R - 1, { kind: 'cart' });
  ent('check', 60, R - 1); ent('check', 92, R - 1); ent('check', 140, R - 1); ent('check', 154, R - 1);
  coins([82, R - 2], [90, R - 2], [148, R - 2], [78, R - 2], [86, R - 2], [96, R - 2], [144, R - 2], [152, R - 2], [156, R - 2]);
  gateCol(157, 26, R - 1); ent('lockgate', 157, R - 1, { needs: 'brass', h: 8 });

  // ---- 3. THE TERRACE AND THE WINDMILL. Every door here has somebody behind it. ----
  floor(158, 250, R);
  boards(162, 192, R);
  ent('sign', 159, R - 1, { text: 'THIS STREET IS ALL BOARDS. THE THATCH ABOVE IS QUIET; EVERY HOUSE HAS A LADDER.' });
  // EVERY ROOF DERIVES ITS OWN FURNITURE. Five houses at five heights: a ladder at the gable, a window one
  // storey up in the WALL (never in the sky over the straw), and a run of coins along the top.
  for (const [x0, x1, y, gob] of [[164, 176, 28, 'sprig'], [180, 192, 26, 'archer'], [196, 208, 28, 'sprig'], [212, 224, 26, 'shield'], [228, 240, 27, 'sapper']]) {
    thatch(x0, x1, y);
    ent('window', x0 + 4, R - 3, { gob, dx: x0 + 6, dy: R - 1 });
    ent('deco', x0 + 9, R - 1, { kind: 'waterButt' });
    ent('deco', x0 + 11, y - 1, { kind: 'washing' });
    ladder(x0 - 1, y - 1);
    run(x0 + 1, x1 - 1, y - 1, 3);
  }
  plat(177, 27, 2); plat(193, 27, 2); plat(209, 27, 2); plat(225, 26, 2);   /* and a board between each pair */
  coins([168, R - 2], [186, R - 2], [206, R - 2], [224, R - 2], [242, R - 2], [172, R - 2], [198, R - 2], [214, R - 2], [236, R - 2]);
  ent('assassin', 188, 25, { face: -1 }); ent('assassin', 220, 25, { face: -1 });
  ent('assassin', 208, 27, { face: 1 });
  ent('brute', 172, R - 1, { face: -1, sleeper: true });
  ent('shield', 202, R - 1, { face: 1, sleeper: true });
  ent('hearthgob', 218, 25, { face: -1, sleeper: true });
  ent('sprig', 234, R - 1, { face: -1, sleeper: true }); ent('pike', 246, R - 1, { face: -1, sleeper: true });
  ent('archer', 166, 27, { face: 1, sleeper: true }); ent('thief', 198, 27, { face: -1, sleeper: true });
  ent('silver', 204, 26);
  ent('check', 200, R - 1);
  // THE WINDMILL. Its sails turn well clear of its own cap, and they are the lift onto the high line: step on
  // at the bottom of the turn off the cap, ride it up, step off at the top onto the boards over the churchyard.
  thatch(243, 251, 25);
  for (let i = 0; i < 4; i++) movers.push({ kind: 'wheel', px: 247 * TS + 8, py: 22 * TS, r: 34, phase: i * Math.PI / 2, period: 7.5, x: 0, y: 0, w: 22, h: 6 });
  ladder(242, 24);
  ent('sign', 236, R - 1, { text: 'RIDE A WINDMILL SAIL UP TO THE HIGH BOARDS. NOBODY SLEEPS UP THERE.' });
  ent('stray', 246, 24, { kind: 'lamp' });
  ent('check', 238, R - 1);

  // ---- 4. THE CHURCHYARD AND THE CHURCH. The high line comes down onto the nave. ----
  floor(251, 336, R);
  moss(254, 270, R); moss(296, 314, R);
  // the high line: staging boards from the top of the sails down onto the church roof
  plat(254, 21, 4); plat(262, 22, 4); plat(268, 24, 3);
  coins([255, 20], [263, 21], [269, 23], [258, 20], [265, 21]);
  ent('archer', 262, 21, { face: 1 }); ent('assassin', 254, 20, { face: 1 });
  ent('sign', 254, R - 1, { text: 'THE BELL TOWER HAS A STRAW ROOF AND NOBODY ON IT. CLIMB UP: A CANDLE IS BURNING BY THE BELL.' });
  ent('deco', 252, R - 1, { kind: 'lychgate' });
  ent('deco', 260, R - 1, { kind: 'yew', v: 0 }); ent('deco', 300, R - 1, { kind: 'yew', v: 1 });
  for (const [gx, v] of [[256, 0], [258, 1], [266, 2], [269, 0], [272, 1], [304, 2], [308, 0], [312, 1]])
    ent('deco', gx, R - 1, { kind: 'grave', v });
  ent('sign', 264, R - 1, { text: 'EVERY GOBLIN YOU HAVE KILLED CAME FROM A PLACE LIKE THIS. THINGS SLEEP UNDER THE YEW.' });
  ent('spider', 260, 27, { drop: 120 });            /* the odd spider, in the yew */
  ent('check', 268, R - 1);
  thatch(274, 294, 26);                             /* the nave roof, over an open street */
  ent('doorway', 278, R - 1, { id: 'church-out', to: 'church-in', kind: 'goblin' });
  ent('doorway', 292, R - 1, { id: 'church-far', to: 'church-back', kind: 'goblin' });
  ent('doorway', 284, 25, { id: 'church-top', to: 'church-in', kind: 'goblin', label: 'IN THROUGH THE LOUVRE' });
  ladder(273, 25); run(275, 293, 25, 3);
  ent('window', 288, R - 3, { gob: 'shield', dx: 290, dy: R - 1 });
  ent('sapper', 286, R - 1, { face: -1, sleeper: true });
  ent('brute', 328, R - 1, { face: -1, sleeper: true }); ent('sprig', 278, 25, { face: 1, sleeper: true });
  ent('assassin', 302, R - 1, { face: 1 }); ent('archer', 290, 25, { face: -1, sleeper: true });
  ent('deco', 296, R - 1, { kind: 'gardenWall', v: 1 });
  coins([260, R - 2], [306, R - 2], [332, R - 2], [254, R - 2], [270, R - 2], [298, R - 2], [310, R - 2], [322, R - 2], [334, R - 2]);
  // ---- THE CHURCH INSIDE: a nave with a gallery over the aisle, the rood beam, and the vestry door out ----
  room(140, 196, 5, 16, 'hall');
  ent('doorway', 144, 16, { id: 'church-in', to: 'church-out', lock: [140, 196], label: 'THE CHURCH' });
  ent('doorway', 193, 16, { id: 'church-back', to: 'church-far', lock: [140, 196], label: 'OUT THROUGH THE VESTRY' });
  for (const px2 of [152, 166, 180]) { ent('deco', px2, 16, { kind: 'pillar' }); plat(px2 - 2, 14, 3); plat(px2 - 1, 11, 4); }   /* the first step by each pillar was four rows off the floor: something to bounce on was the only way to the rood beam and its key */
  for (let x = 184; x <= 190; x++) set(x, 9, T.PLANK);                                 /* the rood beam */
  ent('key', 188, 8, { kind: 'iron' });
  ent('torch', 148, 16); ent('torch', 186, 16); ent('brazier', 168, 16);
  ent('deco', 158, 16, { kind: 'counter' }); ent('deco', 176, 16, { kind: 'coffer' });
  ent('sprig', 160, 16, { face: -1, sleeper: true }); ent('shield', 178, 16, { face: -1, sleeper: true });
  ent('sprig', 167, 10, { face: 1, sleeper: true }); ent('archer', 181, 10, { face: -1, sleeper: true });
  ent('assassin', 190, 16, { face: -1 });
  ent('sign', 141, 16, { text: 'THE IRON KEY IS ON THE ROOD BEAM. THE ONES AWAKE ARE ON THE GALLERY.' });
  coins([150, 15], [158, 15], [166, 15], [176, 15], [184, 15], [153, 10], [167, 10], [181, 10], [188, 8]);
  ent('silver', 170, 10);
  // THE TOWER. It is a house like every other house here - straw on top, a front below, the street running
  // under it - so nothing on this stretch is a bare stone slab. The ladders run PAST the straw on both sides.
  thatch(314, 328, 21);
  ladder(313, 20); ladder(329, 20);
  plat(310, 27, 3); plat(330, 27, 3);
  ent('deco', 320, 20, { kind: 'bellTower' });
  ent('bell', 320, 20);   /* THE ROOF IS A REWARD, NOT A FIGHT: the Bellringer mini that held it was cut after a playtest, and his portcullis at column 330 with him. What is left up here is quiet straw, a coin run, the lamp and a bell nobody rings */
  coins([316, 20], [324, 20], [320, 20], [311, 26], [331, 26]);
  ent('stray', 326, 20, { kind: 'lamp' });
  ent('check', 334, R - 1);
  gateCol(336, 26, R - 1); ent('lockgate', 336, R - 1, { needs: 'iron', h: 8 });

  // ---- 5. THE SCHOOL. One long low roof, a yard of boards, the bone key on the master's desk. ----
  floor(337, 408, R);
  boards(344, 364, R);
  ent('sign', 340, R - 1, { text: 'THE SCHOOL: A LOUD YARD, A QUIET ROOF. THE BONE KEY IS ON THE MASTER\'S DESK.' });
  thatch(352, 390, 28);
  ent('doorway', 356, R - 1, { id: 'school-out', to: 'school-in', kind: 'goblin' });
  ent('doorway', 386, R - 1, { id: 'school-far', to: 'school-back', kind: 'goblin' });
  ent('doorway', 370, 27, { id: 'school-top', to: 'school-in', kind: 'goblin', label: 'DOWN THE BELL-COTE' });
  ent('window', 364, R - 3, { gob: 'archer', dx: 362, dy: R - 1 });
  ladder(351, 27); ladder(391, 27); run(353, 389, 27, 3);
  ent('deco', 342, R - 1, { kind: 'gardenWall', v: 0 }); ent('deco', 350, R - 1, { kind: 'trough' });
  ent('deco', 346, R - 1, { kind: 'dovecote' }); ent('deco', 398, R - 1, { kind: 'skep' });
  ent('deco', 374, 27, { kind: 'washing' }); ent('deco', 394, R - 1, { kind: 'barrels' });
  // ---- THE SCHOOLROOM: three benches to stand on, and the master's desk up on its dais ----
  room(210, 258, 7, 15, 'hall');
  ent('doorway', 214, 15, { id: 'school-in', to: 'school-out', lock: [210, 258], label: 'THE SCHOOLROOM' });
  ent('doorway', 255, 15, { id: 'school-back', to: 'school-far', lock: [210, 258], label: 'OUT AT THE BELL-COTE' });
  for (const bx of [220, 230, 240]) { plat(bx, 13, 5); ent('deco', bx + 1, 12, { kind: 'counter' }); }
  plat(243, 12, 3); plat(246, 10, 6);
  ent('key', 250, 9, { kind: 'bone' });
  ent('deco', 248, 9, { kind: 'clerkDesk' }); ent('torch', 216, 15);
  ent('assassin', 244, 12, { face: -1 }); ent('sprig', 222, 12, { face: 1, sleeper: true });
  ent('cutter', 236, 15, { face: -1, sleeper: true }); ent('thief', 218, 15, { face: 1, sleeper: true });
  ent('sign', 211, 15, { text: 'GOBLINS LEARN THREE THINGS; THE THIRD IS WHEN TO RUN. THE KEY IS ON THE DAIS.' });
  coins([222, 12], [232, 12], [242, 12], [250, 9], [220, 14], [238, 14]);
  ent('assassin', 378, 27, { face: -1 });
  ent('berserker', 400, R - 1, { face: -1 });
  ent('shield', 348, R - 1, { face: 1, sleeper: true }); ent('sapper', 360, 27, { face: 1, sleeper: true });
  ent('sprig', 378, R - 1, { face: -1, sleeper: true }); ent('thief', 342, R - 1, { face: 1, sleeper: true });
  ent('cutter', 386, 27, { face: -1, sleeper: true });
  ent('stray', 368, 27, { kind: 'lamp' });
  ent('check', 366, R - 1); ent('check', 404, R - 1);
  coins([344, R - 2], [396, R - 2], [402, R - 2], [338, R - 2], [350, R - 2], [358, R - 2], [366, R - 2], [382, R - 2], [392, R - 2], [406, R - 2]);

  // ---- 6. THE GREEN. Nowhere to hide, and two wells that are the same well. ----
  floor(409, 470, R);
  ent('sign', 412, R - 1, { text: 'THE GREEN HAS NOTHING TO HIDE BEHIND. THE TWO WELLS ARE JOINED BELOW.' });
  ent('well', 418, R - 1, { pair: 462 }); ent('well', 462, R - 1, { pair: 418 });
  ent('deco', 430, R - 1, { kind: 'stall' }); ent('deco', 448, R - 1, { kind: 'stall' });
  ent('deco', 424, R - 1, { kind: 'lanternPost' }); ent('deco', 454, R - 1, { kind: 'lanternPost' });
  ent('deco', 410, R - 1, { kind: 'stocks' }); ent('deco', 464, R - 1, { kind: 'trough' });   /* off the lock gate's column */
  for (let x = 436; x <= 442; x++) set(x, R, T.AIR);
  block(436, 442, R + 1, 45); water(436, 442, R);   /* the duck pond, out in the open */
  thatch(420, 430, 28); thatch(452, 462, 28);
  ladder(419, 27); ladder(451, 27); plat(432, 31, 3); plat(447, 31, 3);
  ent('window', 424, R - 3, { gob: 'archer', dx: 426, dy: R - 1 });
  ent('window', 456, R - 3, { gob: 'sprig', dx: 458, dy: R - 1 });
  ent('assassin', 446, R - 1, { face: -1 });
  ent('assassin', 426, 27, { face: 1 });
  ent('archer', 422, 27, { face: 1, sleeper: true });
  ent('sapper', 460, 27, { face: -1, sleeper: true });
  ent('brute', 414, R - 1, { face: 1, sleeper: true }); ent('shield', 444, R - 1, { face: -1, sleeper: true });
  ent('pike', 466, R - 1, { face: -1, sleeper: true });
  ent('silver', 439, 33);
  run(421, 429, 27, 3); run(453, 461, 27, 3);
  coins([416, R - 2], [434, 30], [440, 30], [446, R - 2], [452, R - 2], [464, R - 2]);
  ent('check', 432, R - 1); ent('check', 466, R - 1);
  gateCol(469, 26, R - 1); ent('lockgate', 469, R - 1, { needs: 'bone', h: 8 });

  // ---- 7. THE GRANDMOTHER. She never was asleep. ----
  floor(470, 519, R);
  boards(470, 519, R);   /* HER ROOM IS ONE LONG BRIDGE. It was boards, moss and loose planks, and the loose ones gave way under her own feet. */
  ent('sign', 472, R - 1, { text: 'SHE HUNTS BY SOUND. A RAISED SHIELD IS SILENT, BUT SHE DOES NOT ONLY LISTEN.' });
  ent('deco', 476, R - 1, { kind: 'yew', v: 1 });   /* (470 grew through the lock gate beside it) */   /* (the garden wall, the skeps and the beanpoles are gone: the bridge is the room) */
  coins([480, R - 2], [492, R - 2], [512, R - 2], [486, R - 2], [500, R - 2], [508, R - 2], [474, R - 2]);
  ent('grandmother', 504, R - 1);
  ent('gate', 518, R - 1);

  // EVERY THATCH GETS A HOUSE UNDER IT: a front, both its doors, and a chimney still going. A roof without a
  // house is three courses of bare rock standing in a village, which is the one thing this level cannot have.
  const houses = roofs.map(([x0, x1, y]) => {
    const drs = L.ents.filter(e => e.t === 'doorway' && !e.lock && e.x > x0 && e.x < x1 && e.y >= y).map(e => e.x);
    return { x0: x0 + 1, x1: x1 - 1, y0: y + 3, y1: R - 1, door: drs.length ? drs[0] : null, door2: drs.length > 1 ? drs[1] : null, seed: x0, asleep: true, thatch: true };
  }).filter(h => h.y1 >= h.y0 && h.x1 > h.x0);

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: R - 1 }, pools, falls: [], moversExtra: movers, interiors, roofs, houses,
    indoorRow: 18, hush: true,
    duskStart: -1, duskLen: 1, music: 'sleepers', night: true, glowNight: true, nightA: 0.24,
    // the mill's own din: inside this, nothing you do can be heard over the wheel
    din: [{ x0: 108 * TS, x1: 136 * TS }],
    quest: { n: 3, item: 'lamp', name: 'CANDLES', npc: 'elder', done: 'THE DEAD ARE LIT', reward: 'relic', relic: 'soles' },
    palette: { set: 'village', sky: 'night', far: 'village', mid: 'village', near: 'village', dress: 'village', haze: 'rgba(40,44,70,0.20)',
      grass: '#3a5a46', grassL: '#4e7a58', grassD: '#263a2e', dirt: '#3a3444', dirtL: '#4a4458', dirtD: '#26222e',
      canopy: ['#1c2430', '#242e3c', '#2c3848', '#36445a'] },
    weather: [{ x0: 0, x1: 99999, kind: 'mist' }], ambient: [{ x0: 0, x1: 99999, kind: 'forest' }],
    arena: { x0: 472 * TS, x1: 516 * TS, floor: R * TS, trigger: 478 * TS, wallL: 471, wallR: 517, boss: 'grandmother', camBelow: 1, music: 'grandmother', tint: '#2a3444', tintA: 0.12, fx: 'motes' },
  };
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
  ent('npc', 9, 107, { kind: 'squire' }); ent('sign', 4, 107, { text: 'THE HANGING VILLAGE. UP IS THE ONLY WAY: ROPES, ROCK, WHEELS AND SWINGS.' });
  ent('door', 14, 107, { at: 14 }); ent('folk', 11, 107, { door: 14 }); ent('sprig', 22, 107, { face: -1 });
  ent('door', 34, 107, { at: 34 }); ent('folk', 31, 107, { door: 34 }); ent('deco', 44, 107, { kind: 'well' });
  ent('door', 60, 107, { kind: 'cottage', at: 60 }); ent('folk', 57, 107, { door: 60, alt: true });
  ent('sprig', 50, 107, { face: -1 }); ent('spider', 76, 100, { drop: 110 }); ent('squirrel', 88, 107, { face: -1 }); ent('shield', 94, 107, { face: -1 });
  plat(24, 104, 3); plat(38, 102, 3); ent('mover', 68, 103, { len: 2, range: 6, speed: 40 }); ent('wasp', 45, 101); coins([8, 105], [25, 103], [39, 101], [66, 105], [72, 100], [84, 105], [98, 105]);
  ent('check', 98, 107);
  // ---- THE WEB HOLLOW: under the roots. Everything down here is webbed, and something made it. ----
  ent('doorway', 66, 107, { id: 'hollow-out', to: 'hollow-in', kind: 'goblin' });
  ent('doorway', 74, 107, { id: 'hollow-far', to: 'hollow-back', kind: 'goblin' });
  ent('sign', 62, 107, { text: 'SOMETHING WENT DOWN THROUGH THE ROOTS AND DID NOT COME BACK. THE HOLE IS FULL OF WEB.' });
  for (let y = 116; y <= 128; y++) for (let x = 20; x <= 74; x++) set(x, y, 0);
  interiors.push([20, 74, 116, 128, 'earth']);
  ent('doorway', 24, 128, { id: 'hollow-in', to: 'hollow-out', lock: [20, 74], label: 'THE WEB HOLLOW' });
  ent('doorway', 71, 128, { id: 'hollow-back', to: 'hollow-far', lock: [20, 74], label: 'OUT THE FAR SPLIT' });
  for (const x of [28, 36, 44, 52, 60, 68]) { ent('deco', x, 116, { kind: 'cobweb', v: x % 3, hang: true }); }
  for (const x of [32, 48, 64]) ent('deco', x, 128, { kind: 'cobweb', v: (x + 1) % 3 });
  ent('torch', 26, 128); ent('spider', 34, 118, { drop: 90 }); ent('spider', 58, 118, { drop: 90 });
  ent('spider', 46, 116, { drop: 110 });
  ent('sign', 22, 128, { text: 'THE WEAVER DROPS FROM HER THREAD. HIT HER ON THE FLOOR; KEEP OUT FROM UNDER HER.' });
  ent('spider', 48, 118, { drop: 170, big: true, mini: true });
  for (let y = 122; y <= 128; y++) set(75, y, T.PORT); // her larder, shut until she is dead
  for (let y = 122; y <= 128; y++) for (let x = 76; x <= 84; x++) set(x, y, 0);
  interiors.push([76, 84, 122, 128, 'earth']);
  ent('silver', 82, 128); ent('stray', 79, 128, { kind: 'lamp' }); coins([78, 127], [80, 127], [83, 127]);
  // 0 -> 1: a rope ladder through the first bough
  band(1, W - 2, tops.t1); hole(100, 105, tops.t1); ladder(102, 103, tops.t1, tops.t0 - 1); // the first ladder stands in the open: nothing between the roots road and its foot
  ent('sign', 93, 107, { text: 'JUMP UP THROUGH ROPE LADDERS; DOWN+JUMP TO DROP. SEVEN TIERS, THEN THE CROWN.' });

  // ---- Tier 1. THE LOWER BOUGHS (walk left): spiders under the bough above, a branch that snaps over a gap, an archer's nest ----
  hole(66, 71, tops.t1); shelf(66, tops.t1, 6); vine(68, tops.t1, tops.t0 - 1); // the snapping branch: fall and you land on the roots, and a vine climbs back up through the gap
  hole(50, 55, tops.t1); movers.push({ kind: 'swing', px: 52 * TS + 8, py: (tops.t1 - 9) * TS, arm: 76, x: 0, y: 0, w: 32, h: 8, period: 3.0, phase: 0.5, vine: true }); vine(52, tops.t1, tops.t0 - 1); // a vine swings over a second gap; the vine below it is the way back up
  pit(78, 79, tops.t1); ent('sign', 82, 93, { text: 'THE BOUGH IS ROTTEN IN PLACES, WITH SPIKES BELOW. VINES CLIMB LIKE ROPES.' });
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
  ent('sign', 8, 93, { text: 'THE LIFT RISES WHILE YOU STAND ON IT AND SINKS WHEN YOU STEP OFF.' });

  // ---- Tier 2. THE MARKET (walk right): hill folk and goblins live door to door; the Lamplighter wants three lanterns lit ----
  ent('sign', 8, 79, { text: 'STRIKE A DARK LANTERN TWICE TO LIGHT IT. CUT THE SNUFFERS OR THEY PUT IT OUT.' });
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
  ent('sign', 93, 79, { text: 'RIDE THE WATER WHEEL PADDLES UP, THEN JUMP ACROSS TO THE SECOND WHEEL.' });

  // ---- Tier 3. THE WINDY BOUGH (walk left): gusts push you along the bough; spiders, a sapper, a goblin house on stilts ----
  ent('sign', 93, 65, { text: 'THE CRAG WIND COMES IN GUSTS. WAIT FOR THE LULL OR RIDE IT. THE FLAGS SHOW IT.' });
  gusts.push({ x0: 20 * TS, x1: 92 * TS, y0: 56 * TS, y1: 66 * TS, dir: -1, period: 5, on: 1.6, phase: 0 });
  gusts.push({ x0: 20 * TS, x1: 90 * TS, y0: 12 * TS, y1: 20 * TS, dir: 1, period: 9, on: 2.2, phase: 3, alt: true, arena: true }); // the crown's crosswind, only while the Reeve fights
  hole(36, 40, tops.t3); ent('mover', 36, tops.t3, { len: 2, range: 3, speed: 36 }); hole(70, 74, tops.t3); ent('mover', 70, tops.t3, { len: 2, range: 3, speed: 36 }); // gaps in the bough with sliding boughs across them: the wind wants you off
  pit(52, 53, tops.t3); pit(30, 31, tops.t3); // pits the wind wants to push you into
  ent('spider', 80, 58, { drop: 100 }); ent('spider', 48, 58, { drop: 100 }); ent('snuffer', 34, 65, { face: 1 }); ent('sprig', 26, 65, { face: 1 }); ent('wasp', 56, 60);
  plat(70, 63, 3); plat(40, 61, 3); coins([71, 62],   /* the lamp's ledge was four rows off the floor */ [41, 60], [86, 63], [56, 63], [26, 63]);
  ent('door', 88, 65, { at: 88 }); ent('folk', 91, 65, { door: 88 }); ent('deco', 14, 65, { kind: 'lanternPost' }); ent('lantern', 14, 65); ent('lantern', 64, 65);
  ent('check', 20, 65); ent('stray', 71, 62, { kind: 'lamp' });
  // 3 -> 4: snapping branches up the trunk
  band(1, W - 2, tops.t4); hole(2, 9, tops.t4);
  shelf(8, 63, 2); shelf(4, 60, 2); shelf(8, 57, 2); shelf(4, 54, 2); shelf(7, 51, 2);
  ent('sign', 12, 65, { text: 'THE BRANCHES SNAP UNDER YOU. CLIMB QUICK.' });

  // ---- Tier 4. THE UPPER BOUGHS (walk right): the squirrel knight's ground; spiders, an archer nest, silver on a high ledge ----
  ent('sign', 10, 51, { text: 'THE SQUIRREL KNIGHT STEALS GOLD. CATCH IT BEFORE IT REACHES THE TRUNK.' });
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
  ent('sign', 92, 51, { text: 'THE LAST CLIMB: SWING, SWING, ROPE. OR CLING TO THE OCHRE ROCK AND KICK UP.' });

  // ---- Tier 5. THE LANTERN STAIR (walk left): the last lamp, a brute at the door, the way to the crown ----
  ent('sign', 93, 37, { text: 'THE REEVE HATES LIGHT. LIGHT EVERY LANTERN; KILL WHAT COMES TO PUT THEM OUT.' });
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
  ent('sign', 8, 19, { text: 'STRIKE A LAMP. ITS GLOW DROPS THE REEVE. HIT HER WHILE SHE LIES DAZZLED.' });
  ent('sign', 16, 19, { text: 'DEAD BOUGHS HANG ON PEGS. CUT A PEG WHEN THE REEVE IS LOW UNDER ITS BOUGH.' });
  ent('check', 12, 19);
  for (const x of [32, 54, 76]) ent('lantern', x, 19, {owl: true, dark: true}); // two lit lanterns on the floor: a swooping owl still crashes into light
  plat(24, 17, 3); plat(84, 17, 3); plat(29, 14, 3); plat(79, 14, 3); plat(34, 11, 3); plat(74, 11, 3); // the climb either side
  plat(40, 9, 5); plat(51, 12, 6); plat(63, 9, 5); // the three perches
  plat(47, 11, 2); plat(60, 10, 2); plat(70, 11, 2); // the links between them
  for (const [x, y] of [[42, 8], [54, 11], [65, 8]]) ent('lantern', x, y, { dark: true, perch: true, owl: true }); // a dark lantern on each perch: light it and the perch is denied
  vine(48, 12, 19); vine(61, 11, 19); // two vines from the floor up to the links
  ent('deco', 38, 19, { kind: 'stone', v: 0 }); ent('deco', 68, 19, { kind: 'cairn' });
  // THE DEAD BOUGHS: under each outer perch a dead limb hangs on a rope run along the branch to a peg on the floor. Cut the peg while the Reeve
  // is LOW under the limb (skimming, stuck in the boards, dazed) and it pins it: the one window the player makes. Placed on the row under the branch.
  ent('deadfall', 41, 10, { peg: 44, pegY: 19, hang: true }); ent('deadfall', 66, 10, { peg: 63, pegY: 19, hang: true });
  coins([25, 16], [30, 13], [35, 10], [85, 16], [80, 13], [75, 10], [47, 10], [61, 9], [71, 10]);
  ent('owl', 54, 11);
  ent('gate', 100, 19);
  coins([103, 51], [104, 50], [105, 51], [107, 51], [103, 43], [104, 43]); // the nook past the rock face pays


  for(const m of movers)if(m.kind==='lift'){const tx=Math.floor((m.x+16)/TS);let row=Math.floor(Math.min(m.y0,m.y1)/TS)-1;while(row>0&&!L.grid[row*W+tx])row--;m.top=(row+1)*TS;}
  // A house for every inhabited door; two large public buildings mark the roots and market.
  for(const d of [...L.ents].filter(e=>e.t==='door'))ent('deco',d.x,d.y,{kind:(d.x===60&&d.y===107)||(d.x===50&&d.y===79)?'villageHall':'hangingHouse'});
  for(const [x,y,k] of [[23,107,'barrels'],[24,79,'stall'],[45,79,'shopSign'],[72,79,'stall'],[82,79,'barrels'],[27,93,'washing'],[63,51,'washing']])ent('deco',x,y,{kind:k});
  return {
    hangingTown:true, W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 107 }, pools: [], falls: [], moversExtra: movers, gusts, interiors, vines: [52, 68, 34, 48, 61], perches: [[42, 9], [54, 12], [65, 9]], tall: { top: 20 * TS, bottom: 108 * TS },
    duskStart: -1, duskLen: 1, music: 'town', night: false, glowNight: true,
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', hall: true, haze: 'rgba(140,90,150,0.12)', grass: '#8a8a3a', grassL: '#c9b84a', grassD: '#5a5a2a', dirt: '#5a5a66', dirtL: '#6e6e7a', dirtD: '#3a3a44', canopy: ['#4a4458', '#5e5870', '#6a4a7a', '#a07ab8'] },
    stone: [], scree: [], snowLine: 52,
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    quest: { n: 3, item: 'lamp', name: 'LAMP', npc: 'lamplighter', done: 'THE LAMPS ARE LIT', thanks: "THE LAMPLIGHTER'S THANKS" },
    arena: { x0: 20 * TS, x1: 90 * TS, floor: 20 * TS, trigger: 21 * TS, y0: 4 * TS, wallL: 19, wallR: 90, boss: 'owl', music: 'owlreeve', tint: '#ffd36b', tintA: 0.08, fx: 'motes' },
    mini: { x0: 20 * TS, x1: 75 * TS, floor: 129 * TS, trigger: 30 * TS, wallL: 19, gate: 75, boss: 'spider', y0: 114 * TS, y1: 131 * TS },
  };
}

// ---------- LEVEL 8: THE MINEWORKS ----------
// Under the Hanging Village. Three galleries step down through the rock on rails and an ore lift, to the forge at the bottom.
// ============================================================================================
// LEVEL 8 - THE MONASTERY ON THE CLIFF. Between the tree-city and the high moor, an old house of monks
// built up the face of the mountain: a gatehouse at the foot, terraces, a scriptorium dug into the rock,
// bell towers joined by bridges, a cloister on the ledge where the cloud ends, shrines, and a broken roof
// at the top where the Roc nests. She drove the monks out. What they built still answers a blow: strike a
// prayer wheel and its stair turns, strike a bell and its bridge comes down, stand in a basket and the
// other one comes up past you. The incense they left still burns, and its smoke still carries you.
// Halfway up you come out of the grey into the sun.
// ============================================================================================
function theMonastery() {
  const W = 96, H = 222; const L = painter(W, H);
  const { block, plat, ent, coins, set, spikes } = L;
  const movers = [], facades = [], masonry = [], interiors = [], flags = [], hangers = [];
  const CLOUD = 100; // above this row the sun is on the stone
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x, y, n) => { for (let i = 0; i < n; i++) set(x + i, y, T.ONEWAY); };
  block(0, 0, 0, H - 1); block(W - 1, W - 1, 0, H - 1);

  // THE JUMP ENVELOPE, off the knight's own numbers. He rises 3.2 tiles, and the higher he lands the
  // less of the arc is left: +0 rows buys 4 tiles across, +1 buys 3.6, +2 buys 3.2, +3 buys 2.5.
  // Nothing on this mountain is placed by eye. A FLOOR is a band of rock with a trapdoor of boards in it,
  // and a STAIR always finishes three rows under that trapdoor, where the jump up through it is legal.
  // Build the stair FIRST and put the trapdoor wherever the stair actually arrived.
  const stair = (fromTop, top, x0, x1, startX, gw) => {
    const land = top + 3;
    let y = fromTop - 3, x = startX, dir = 1, n = 0;
    while (y > land) {
      x = Math.max(x0, Math.min(x1 - 4, x));
      boards(x, y, 4);
      if (n % 4 === 1) coins([x + 1, y - 1]);
      const nx = x + dir * 3; if (nx > x1 - 4 || nx < x0) dir = -dir;
      x += dir * 3; y -= 2; n++;
    }
    x = Math.max(x0, Math.min(x1 - 4, x));
    boards(x, land, 4);
    const gx = Math.max(2, Math.min(W - 2 - gw, x - ((gw - 4) >> 1)));
    block(1, gx - 1, top, top + 2); block(gx + gw, W - 2, top, top + 2);
    boards(gx, top, gw);
    return { top, gx, gw, mid: gx + (gw >> 1) };
  };
  // THE INCENSE. The monks' braziers still burn, and every few seconds one of them lets go a column of
  // hot smoke that carries you straight up while you stay in it. A brazier lifts you `rise` rows and two
  // more, so you come out over the ledge beside it with time to steer onto it. Every ledge in a chain
  // sits one tile clear of the column below it, never over it.
  const brazier = (x, row, rise, o = {}) => ent('vent', x, row - 1, { heat: true, incense: true, h: (rise + 2) * TS, period: o.period || 4.2, on: o.on || 2.2, phase: o.phase || 0, lift: o.lift || 190, w: 12, ember: !!o.ember });
  const band = (top, gx, gw) => { block(1, gx - 1, top, top + 2); block(gx + gw, W - 2, top, top + 2); boards(gx, top, gw); return { top, gx, gw }; };
  // a CELLAR: a hollow under a trapdoor in the flags. Press down to drop in; jump up through the boards to come out.
  const cellar = (x0, x1, top) => {
    block(x0 - 1, x1 + 1, top + 3, top + 3);
    air(x0, x1, top + 1, top + 2);
    boards(x0 + 1, top, x1 - x0 - 1);
  };
  // a CHIMNEY: two rock faces two apart up a wall, kicked up. Slow, and nothing about it moves.
  const chimney = (floorRow, topBand) => {
    for (let y = topBand; y <= floorRow; y++) set(W - 2, y, T.CLIMB);
    for (let y = topBand; y <= floorRow - 5; y++) set(W - 5, y, T.CLIMB);
    for (let y = topBand; y <= topBand + 2; y++) { set(W - 4, y, T.AIR); set(W - 3, y, T.AIR); }
    plat(W - 4, topBand, 2);
    coins([W - 4, floorRow - 4], [W - 3, floorRow - 9], [W - 4, floorRow - 14]);
  };
  const chimneyL = (floorRow, topBand) => {
    for (let y = topBand; y <= floorRow; y++) set(1, y, T.CLIMB);
    for (let y = topBand; y <= floorRow - 5; y++) set(4, y, T.CLIMB);
    for (let y = topBand; y <= topBand + 2; y++) { set(2, y, T.AIR); set(3, y, T.AIR); }
    plat(2, topBand, 2);
    coins([3, floorRow - 4], [2, floorRow - 9], [3, floorRow - 14]);
  };
  // A PRAYER WHEEL. Its stair is a line of boards off one pivot board, each two up and two across from the
  // last, and one blow on the wheel turns the whole line a quarter turn about the pivot: a stair that rose to
  // the right now rises to the left. The pivot board never moves, the wheel stands on the floor under it, and
  // a hero who is left on the wrong side walks back to the wheel and strikes it again.
  const wheel = (floorRow, px, py, n, start) => {
    const arm = s => { const out = []; for (let k = 1; k <= n; k++) out.push([px + s * 2 * k, py - 2 * k, 3]); return out; };
    const a = arm(1), b = arm(-1);
    boards(px, py, 3);
    for (const [x, y, w] of (start === 'b' ? b : a)) boards(x, y, w);
    ent('pwheel', px + 1, floorRow, { a, b, st: start === 'b' ? 1 : 0, pivot: [px, py] });
  };
  // A COUNTERWEIGHT: two baskets on one rope over a wheel. Stand in one and it sinks, and the other comes up past
  // you; step out and they settle back level. The rising one is the way up: jump across as it passes, and off it
  // before it takes your weight down. The reach model sees the pair as one ride, from the top of the rising
  // basket's run to the foot of the sinking one's (cwBand).
  let pairN = 0;
  const pair = (ax, bx, rest, R, hubRow) => { const id = 'cw' + (pairN++), x0 = Math.min(ax, bx), x1 = Math.max(ax, bx) + 1;
    const band = { x0, x1, y0: rest - R, y1: rest + R }, hubX = (Math.min(ax, bx) + 2) * TS;
    for (const [role, x] of [['a', ax], ['b', bx]]) movers.push({ kind: 'lift', cw: id, role, x: x * TS, y: rest * TS, y0: rest * TS, y1: (rest + R) * TS, yUp: (rest - R) * TS, w: 32, h: 8, speed: 36, top: hubRow * TS, hubX, cwBand: band });
  };
  // A BELL TOWER: two walls of laid stone, a door through the foot of each, a stair of timber landings up the
  // inside (two rows apart, turn and turn about), and a belfry floor with a hatch over the last landing.
  const tower = (x0, top, floor) => { const x1 = x0 + 7;
    block(x0, x0, top, floor); block(x1, x1, top, floor); air(x0, x0, floor - 2, floor); air(x1, x1, floor - 2, floor);
    for (let x = x0; x <= x1; x++) set(x, top, T.SOLID);
    let r = floor - 1, left = true; while (r > top + 1) { plat(left ? x0 + 1 : x0 + 4, r, 3); r -= 2; left = !left; }
    boards(!left ? x0 + 1 : x0 + 4, top, 3);
    masonry.push([x0, x0, top, floor], [x1, x1, top, floor], [x0, x1, top, top]);
    interiors.push([x0 + 1, x1 - 1, top + 1, floor, 'monkTower']);
    facades.push([x0 - 1, x1 + 1, top - 7, top - 1, 'monkBelfry']);
  };

  // ---- 1. THE GATEHOUSE: the pilgrims' door, the gate that fell, and the stair the pilgrims climbed ----
  block(0, W - 1, 218, H - 1);
  facades.push([1, 13, 203, 217, 'monkTower', { arch: [211, 217], roof: true }]);
  facades.push([14, 27, 209, 217, 'monkCurtain']);
  ent('npc', 8, 217, { kind: 'squire' });
  ent('sign', 4, 217, { text: 'THE MONASTERY. THE ROC DROVE THE MONKS OUT. WHAT THEY BUILT STILL ANSWERS A BLOW.' });
  ent('deco', 17, 217, { kind: 'portcullis' }); ent('deco', 25, 217, { kind: 'shrine', v: 0 });   /* was a stoneLantern: see THE SAND CASTLES below */
  ent('check', 21, 217); coins([12, 216], [28, 216], [44, 216]);
  stair(218, 196, 30, 70, 34, 15);
  // Grounded arcades carry the first terrace; their open arches leave the stair visible.
  facades.push([1, 28, 196, 217, 'monkCurtain', {arch:[211,217]}], [72,94,196,217,'monkCurtain',{arch:[211,217]}]);
  for(const [x,k] of [[13,'prayerFlags'],[76,'herbBed'],[81,'monkChores'],[90,'flagPost']]) ent('deco',x,217,{kind:k});
  ent('deco',46,195,{kind:'well'}); ent('deco',64,195,{kind:'incenseStand'});
  ent('fledgling', 42, 217, { face: -1 });
  ent('sign', 62, 217, { text: 'A TRAPDOOR IN THE FLAGS. PRESS DOWN TO DROP IN, JUMP UP THROUGH IT TO COME OUT.' });
  cellar(66, 74, 218); coins([70, 217], [67, 220], [69, 220], [71, 220], [73, 220]);
  ent('sprig', 68, 220, { face: 1 });                               // a looter in the undercroft: nobody has swept it for years
  ent('sprig', 54, 217, { face: -1 }); ent('sprig', 78, 217, { face: -1 });   // looters in the gate yard, going through the pilgrims' packs
  ent('deco', 84, 217, { kind: 'pilgrimLeanTo' }); ent('deco', 89, 217, { kind: 'lanternPost' });
  ent('deco', 92, 217, { kind: 'bones', v: 1 }); coins([80, 217], [87, 217]);

  // ---- 2. THE LOWER TERRACES: bean rows gone to seed, and the incense that still burns for nobody ----
  ent('rockgoblin', 20, 195, { face: 1 }); ent('rockgoblin', 86, 195, { face: -1 }); ent('fledgling', 30, 195, { face: 1 });
  ent('sign', 6, 195, { text: 'THE LOWER TERRACES. THE MONKS GREW BEANS HERE. THE GOBLINS DIG FOR THEIR SILVER.' });
  ent('check', 8, 195); coins([21, 194], [75, 194]);
  cellar(14, 22, 196); coins([18, 195], [15, 198], [17, 198], [19, 198], [21, 198], [30, 195], [38, 195], [44, 195]);
  ent('sentry', 20, 198, { face: -1 }); ent('sprig', 66, 195, { face: -1 });   // a lookout posted on the root cellar, and a looter in the bean rows
  for (const [x, k, v] of [[26, 'beanpoles', 0], [35, 'gardenWall', 1], [40, 'skep', 0], [54, 'beanpoles', 1], [58, 'gardenWall', 2]]) ent('deco', x, 195, { kind: k, v });
  ent('deco', 91, 195, { kind: 'bones' }); coins([88, 195], [92, 195]);
  ent('sign', 48, 195, { text: 'THE INCENSE STILL BURNS. STAND IN THE SMOKE AS IT RISES, AND STEER OFF AT THE TOP.' });
  brazier(74, 196, 10, { phase: 0 }); plat(76, 186, 5);
  brazier(79, 186, 8, { phase: 1.4 }); plat(73, 178, 5);
  brazier(75, 178, 6, { phase: 2.8 });
  band(172, 73, 5);
  coins([74, 190], [74, 186], [79, 181], [75, 175]);
  ent('harpy', 50, 184); ent('bat', 84, 182); ent('bat', 62, 178);
  ent('check', 60, 195);

  // ---- 3. THE SCRIPTORIUM: a gallery dug into the cliff, its shelves, and the first prayer wheel ----
  interiors.push([2, 93, 153, 171, 'monkScript']);
  band(152, 57, 8);
  air(31, 37, 153, 154); boards(31, 152, 7);                       // the reading loft's trapdoor
  wheel(171, 47, 169, 7, 'b');                                      // it is turned to the loft: strike it to face the way on
  ent('sign', 40, 171, { text: 'A PRAYER WHEEL. STRIKE IT AND ITS STAIR TURNS. STRIKE IT AGAIN AND IT TURNS BACK.' });
  chimney(171, 152);
  ent('sign', 88, 171, { text: 'A CHIMNEY: HOLD INTO THE ROCK TO CLING, JUMP TO KICK OFF. SLOW, BUT IT STAYS.' });
  ent('fledgling', 64, 171, { face: -1 }); ent('rockgoblin', 84, 171, { face: -1 });
  ent('gobmage', 34, 171, { face: 1 });   // THE GOBLIN MAGE at home among the shelves, under the prayer wheel's stair: it reads at you from the wheel all the way up the stair, and to stop it you go back down. (It holds the far end the chick at 24 and the bat at 44 did: the gallery is no harder for having a reader in it)
  for (const [x, k, v] of [[10, 'bookshelf', 0], [15, 'bookshelf', 1], [19, 'lectern', 0], [30, 'bookpile', 0], [34, 'bookshelf', 0], [56, 'candelabra', 0], [70, 'bookpile', 1], [80, 'bookshelf', 1]]) ent('deco', x, 171, { kind: k, v });
  coins([26, 171], [70, 171], [8, 171], [13, 171]);
  // THE READING LOFT: over the gallery's roof, where the wheel's other stair goes
  block(26, 26, 145, 151); block(41, 41, 145, 151); block(26, 41, 144, 144);
  masonry.push([26, 41, 144, 151]); interiors.push([27, 40, 145, 151, 'monkScript']);
  ent('silver', 29, 151); coins([33, 151], [35, 151], [37, 151], [39, 151]); ent('deco', 38, 151, { kind: 'lectern' });

  // ---- 3b. THE STACKS: a hanging walkway over the shelves, and the book hoist up through the floor above ----
  for (const [x, y] of [[66, 150], [69, 148], [66, 146], [69, 144], [66, 142], [63, 140], [60, 138]]) plat(x, y, 3);
  boards(26, 137, 32);                                              // the walkway
  hangers.push([30, 138, 143], [44, 138, 151], [54, 138, 151]);    // on posts down to the loft's roof and the gallery floor
  pair(23, 20, 135, 3, 127);                                        // the book hoist: board the right basket, jump to the left as it passes
  block(1, W - 2, 132, 134);                                        // the floor of the bell yards
  air(19, 40, 132, 134);                                            // broken through where the hoist rises
  chimneyL(151, 132);                                               // and the slow way up, that nothing can take away
  ent('sign', 52, 136, { text: 'STAND IN A BASKET AND IT SINKS, AND THE OTHER COMES UP PAST YOU. JUMP ACROSS AS IT GOES BY.' });
  ent('rockgoblin', 12, 151, { face: 1 }); ent('bat', 12, 142); ent('bat', 70, 140);   /* a miner belongs in a mine; the rock goblin throws what this mountain is made of */
  ent('gobmage', 40, 136, { face: 1 });   // and a second one out on the hanging walkway, reading over the stacks where the harpy was: it has the steps up from the check below it, and nowhere to walk off to but the walkway's end
  ent('check', 72, 151); coins([32, 136], [40, 136], [48, 136], [8, 151], [16, 151]);
  for (const [x, k, v] of [[48, 'bookshelf', 0], [52, 'bookshelf', 1], [84, 'bookpile', 0]]) ent('deco', x, 151, { kind: k, v });

  // ---- 4. THE BELL TOWERS: three towers and a flue, a bell in each belfry, and the bridges between them ----
  tower(8, 118, 131);
  tower(41, 118, 131);
  tower(70, 118, 131);
  ent('tbell', 11, 117, { span: [16, 40, 118] });                   // the first bell: the drawbridge over the broken floor
  ent('sign', 9, 117, { text: 'A BELL. STRIKE IT AND WHAT HANGS FROM ITS TOWER COMES DOWN.' });
  for (let x = 49; x <= 69; x++) set(x, 118, T.PLANK);              // the rope bridge the Roc left standing
  ent('tbell', 73, 117, { span: [78, 83, 118] });                   // the second: over to the flue
  // THE FLUE: the old kitchens' chimney, with its hearth at the bridges' height and the braziers that still breathe in it
  block(84, 84, 101, 114); block(84, 94, 118, 131);
  masonry.push([84, 84, 101, 131], [84, 94, 118, 131]); interiors.push([85, 94, 103, 117, 'monkFlue']);
  brazier(90, 118, 8, { phase: 0 }); plat(85, 110, 4);
  brazier(86, 110, 10, { phase: 1.6 });
  coins([90, 112], [86, 104], [87, 116]);
  ent('sign', 17, 131, { text: 'THE BELL TOWERS. NOBODY HAS RUNG THEM SINCE THE ROC CAME.' });
  ent('check', 13, 117); ent('check', 6, 131); coins([31, 117], [36, 117], [58, 117], [63, 117]);
  // THE BELL YARD under the bridges, where the looters camp: down a tower's hatch, and back up its stair
  ent('stray', 60, 131, { kind: 'bead' }); ent('rockgoblin', 55, 131, { face: 1 }); ent('rockgoblin', 66, 131, { face: -1 });
  for (const [x, k, v] of [[52, 'herbBed', 0], [63, 'pilgrimLeanTo', 0], [81, 'incenseStand', 0]]) ent('deco', x, 131, { kind: k, v });
  ent('harpy', 30, 110); ent('fledgling', 58, 110); ent('harpy', 80, 106);   /* her chicks, not a kite: the eyrie is the one thing up here that was already hers */

  // ---- 5. THE CLOUD CLOISTER. You come out of the grey into the sun, onto the monks' cloister ----
  band(100, 85, 5);
  facades.push([40, 74, 91, 99, 'monkCloister']);
  wheel(99, 20, 97, 7, 'a');                                        // the second wheel: its stair goes up to the shrines, or round to the alcove
  set(18, 99, T.SOLID); set(19, 99, T.SOLID); masonry.push([18, 19, 99, 99]);   // a step up to the pivot board
  ent('check', 30, 99); ent('check', 80, 99);
  ent('sign', 84, 99, { text: 'THE CLOUD IS UNDER YOU NOW. SO IS EVERYTHING ELSE.' });
  // the goat path up the far wall, to a shrine with a string of beads on it
  for (let y = 86; y <= CLOUD - 1; y++) set(W - 2, y, T.CLIMB);
  for (const [x, y] of [[91, 98], [88, 96], [91, 94], [88, 92]]) plat(x, y, 3);
  plat(78, 90, 13); coins([92, 97], [89, 95], [92, 93]);
  ent('stray', 82, 89, { kind: 'bead' }); ent('deco', 86, 89, { kind: 'shrine', v: 0 }); ent('harpy', 72, 84);

  // ---- 6. THE UPPER SHRINES: prayer flags on every line, shrines on the ledges, and the bellows ----
  const s7gap = [31, 37];
  block(1, s7gap[0] - 1, 80, 82); block(s7gap[1] + 1, W - 2, 80, 82); boards(s7gap[0], 80, s7gap[1] - s7gap[0] + 1);
  // THE ALCOVE, where the second wheel's other stair goes: a shrine walled in on the ledge
  air(4, 9, 81, 82); boards(4, 80, 6);
  block(12, 12, 74, 79); block(1, 12, 73, 73); masonry.push([1, 12, 73, 73], [12, 12, 74, 79]); interiors.push([1, 11, 74, 79, 'monkShrine']);
  ent('deco', 6, 79, { kind: 'shrine', v: 1 }); coins([3, 79], [5, 79], [8, 79], [10, 79]); ent('mend', 10, 79);
  ent('sign', 26, 79, { text: 'THE UPPER SHRINES. PRAYER FLAGS ON EVERY LINE, AND NOBODY LEFT TO READ THEM.' });
  ent('check', 22, 79); coins([28, 79], [60, 79], [44, 79]);
  ent('fledgling', 50, 79, { face: -1 }); ent('fledgling', 68, 79, { face: -1 });   /* (the harpy over them at 62,72 made way for the priests) */
  // THE GOBLIN PRIESTS at the shrines: one among the chicks and the herd billy on the ledge, where a blessed billy is the
  // reason to go for the robe first, and one by the foot of the scaffold, behind the goat that grazes up it. Both clear
  // of the way up through the boards at 31-37 and the cellar's trapdoor at 81-89
  ent('gobpriest', 57, 79, { face: -1 }); ent('gobpriest', 41, 79, { face: 1 });
  ent('sign', 16, 79, { text: 'THE BELLOWS THROW YOU HIGH. KEEP GOING AT THE TOP.' });
  brazier(14, 80, 11, { lift: 230, period: 4.6, on: 2.4, phase: 0 }); plat(16, 69, 5);
  brazier(19, 69, 7, { lift: 230, period: 4.6, on: 2.4, phase: 1.5 });
  plat(23, 62, 5); brazier(25, 62, 6, { lift: 230, period: 4.6, on: 2.4, phase: 3.0 });
  band(56, 23, 5);
  coins([14, 74], [19, 65], [25, 59], [14, 70], [19, 67]);
  ent('harpy', 30, 64);   /* (not a second at 40,70 over the priest by the scaffold: a bird and a blessing on the same few tiles is a crowd) */
  cellar(80, 90, 80); coins([81, 82], [83, 82], [85, 82], [87, 82], [89, 82], [70, 79], [76, 79]);
  // THE SCAFFOLD the monks left up the east face, with a shrine at the top of it
  for (const [x, y] of [[44, 78], [49, 76], [54, 74], [59, 72], [64, 70], [69, 68], [74, 66], [78, 64]]) plat(x, y, 4);
  coins([45, 77], [55, 73], [65, 69], [75, 65], [79, 63]); ent('silver', 81, 63); ent('deco', 80, 63, { kind: 'shrine', v: 0 });
  flags.push([2, 60, 22, 57], [30, 66, 76, 60], [8, 86, 36, 84], [50, 44, 90, 40], [4, 42, 30, 46]);

  // ---- 6b. THE TEMPLE HALL: the guardian the monks set over their relics, still standing its watch ----
  // Stone does not bleed. A bell does what a blade cannot: its note goes into the stone and cracks it for a
  // few seconds, and the hall has two, hung low enough to strike from a jump. It is only cracked if it is
  // standing under the bell when the bell is struck.
  block(29, 50, 48, 49);                                            // the hall's roof
  for (let y = 50; y <= 55; y++) set(51, y, T.PORT);                // the way on, shut while it stands
  masonry.push([29, 51, 48, 49]); interiors.push([30, 50, 50, 55, 'monkHall']);
  ent('check', 24, 55);
  ent('sign', 27, 55, { text: 'STONE DOES NOT BLEED. STRIKE A BELL WHILE IT STANDS UNDER IT, AND THE NOTE CRACKS IT.' });
  ent('tbell', 36, 51, { guard: true, hang: true }); ent('tbell', 45, 51, { guard: true, hang: true });
  ent('golem', 43, 55, { mini: true });
  coins([33, 55], [38, 55], [47, 55], [49, 55]);
  ent('deco', 31, 55, { kind: 'statue', v: 0 });

  // ---- 6c. THE LAST CLIMB, and the second chimney: the way up it that nothing turns ----
  stair(56, 36, 52, 84, 78, 15); // the stair to the nest starts at the FAR end of the ledge: the hall is on the road, not beside it
  ent('fledgling', 60, 35, { face: -1 });
  ent('check', 12, 35); coins([32, 35], [66, 35]);
  chimney(55, 36);
  coins([70, 55], [78, 55], [84, 55], [40, 55], [50, 55], [6, 55], [12, 55], [18, 55]); ent('deco', 3, 55, { kind: 'bones', v: 1 });
  ent('deco', 64, 55, { kind: 'shrine', v: 1 }); ent('deco', 10, 55, { kind: 'flagPost', v: 0 }); ent('deco', 88, 35, { kind: 'flagPost', v: 1 });

  // ---- 7. THE NEST: the monastery's broken summit roof, and what nests on it ----
  const s10 = stair(36, 30, 30, 62, 38, 11);
  block(1, s10.gx - 1, 31, 34); block(s10.gx + s10.gw, W - 2, 31, 34); // the roof's body, either side of the way up
  spikes(4, 12, 29); spikes(80, 90, 29);
  masonry.push([1, W - 2, 30, 34]);
  // the old roof boards still lie in the stone where her dive puts her talons through them and holds her
  const roofBoards = [];
  // two braziers in the roof: when one breathes it throws its coals up, and a bird over it comes down


  ent('sign', 16, 29, { text: 'THE BELFRY. A GOBLIN IN THE ABBOT\'S CHAIR, BLESSING HIS OWN.' });
  // THE NEST BELL: it hangs on its frame between the two middle boards. She comes over it to scream at the roof,
  // and a bell struck under her goes through her like a blow - so the answer to her scream is here
  ent('tbell', 56, 29, { abbot: true });
  ent('sign', 22, 29, { text: 'STRIKE THE GREAT BELL WITH HIM UNDER IT: THE NOTE GOES THROUGH THE RITE.' });
  ent('abbot', 72, 29);   /* THE FALSE ABBOT, at the far end of the ringing floor: the great bell is at 56, and getting him under it is the fight */
  // the last hop to the gate is over the thorns on two stones set on a pillar
  plat(79, 29, 5); block(85, 87, 27, 27); block(89, 91, 27, 27); block(87, 87, 28, 29);
  ent('check', 18, 29); ent('gate', 92, 29);
  ent('silver', 90, 26);
  ent('stray', 38, 29, { kind: 'bead' });
  // the crawl under the roof ends in a hollow either side, and the second chimney comes up into the right one
  for (let y = 32; y <= 34; y++) { for (let x = 70; x <= 93; x++) set(x, y, T.AIR); for (let x = 3; x <= 16; x++) set(x, y, T.AIR); }
  coins([74, 35], [78, 35], [86, 35], [90, 35]); ent('deco', 82, 35, { kind: 'bones', v: 1 });
  ent('deco', 6, 35, { kind: 'prayerFlags', v: 1 }); coins([4, 35], [9, 35], [15, 35]);

  // ---- MORE GOING ON. Every floor used to be a stair up one side and a walk to a wall on the other. ----
  // SIDE ROUTES: a goat path of boards up the side the main stair does not use, through a small trapdoor in
  // the floor above - slower, and it means neither end of a floor is a wall.
  const sideRoute = (floorRow, shelfTop, xa, xb) => {
    for (let yy = shelfTop + 1; yy <= shelfTop + 2; yy++) for (let x = xa; x <= xa + 2; x++) set(x, yy, T.AIR); // cut the gap first
    boards(xa, shelfTop, 3);
    let y = floorRow - 2, k = 0;
    while (y > shelfTop + 6) { const x = k % 2 ? xb : xa; plat(x, y, 3); if (k % 2) coins([x + 1, y - 1]); y -= 2; k++; }
    // the last three stack straight up under the gap: the far ledges are under the rock, and a jump from there bangs its head
    plat(xa, shelfTop + 6, 3); plat(xa, shelfTop + 4, 3); plat(xa, shelfTop + 2, 3); coins([xa + 1, shelfTop + 1]);
  };
  sideRoute(218, 196, 86, 90);     // the gatehouse, up the far wall past the pilgrims' shelter
  sideRoute(196, 172, 4, 8);       // the terraces' near end, up into the scriptorium
  sideRoute(80, 56, 84, 88);       // the bellows' far side, up to the chimney's foot
  // LOOSE MASONRY: a stone in the vault over a step you have to stand on shivers when you pass under, and drops.
  const stal = (x, y) => { if (L.grid[(y - 1) * W + x] === T.SOLID && L.grid[y * W + x] === T.AIR) ent('stal', x, y, { stone: true }); };
  for (const [x, y] of [[51, 199], [91, 199], [9, 175], [24, 103], [44, 103], [88, 103], [41, 83], [84, 84], [77, 59], [39, 39], [10, 32], [80, 32]]) stal(x, y);
  // and more of the mountain's own: bats in the shade below the cloud, harpies and fledglings above it
  ent('bat', 60, 205); ent('bat', 24, 186); ent('harpy', 20, 142);
  ent('harpy', 40, 44); ent('fledgling', 62, 55, { face: -1 });

  // ---- THE RINGING FLOOR. It was a NEST while the Roc had it - heaped rafters, bones she did not finish, the shells
  // of what she hatched - and with her gone the roof stays ON (she is what tore it off, mid-fight), so this is a ROOM
  // again: the floor the monks rang their bells from, with the goblins' own squalor spread over the top of it.
  for (const [x, v] of [[10, 0], [86, 1]]) ent('deco', x, 29, { kind: 'bellFrame', v });      /* the two lesser bells' frames, empty: those bells went down the mountain */
  for (const [x, v] of [[20, 0], [44, 1], [72, 0]]) ent('deco', x, 29, { kind: 'incenseStand', v });   /* what he fills the censer from */
  for (const [x, v] of [[27, 0], [66, 1]]) ent('deco', x, 29, { kind: 'bookshelf', v });      /* the psalters, still on their shelf */
  ent('deco', 34, 29, { kind: 'statue' }); ent('deco', 80, 29, { kind: 'monkChores', v: 0 });
  for (const [x, v] of [[6, 0], [90, 1]]) ent('deco', x, 29, { kind: 'prayerFlags', v });
  ent('sign', 30, 29, { text: 'HE WILL NOT STAND UNDER IT. GUARD HIS CHAIN AND IT HAULS HIM THERE.' });
  // THE FLOORS THE MONKS LAID: flagstones where there was a building, crag where there was only the mountain; and the stacks,
  // dug into the cliff under the bell yards, have their shelves behind them (the look pass saw open sky inside the rock)
  masonry.push([1, 40, 218, 221], [1, 94, 172, 174], [1, 94, 152, 154], [1, 94, 132, 134], [40, 74, 100, 102], [29, 51, 56, 58]);
  interiors.push([1, 94, 135, 151, 'monkScript']);
  // THE BELFRY'S BEAM WALK: a ladder from the ringing floor, with a sheltered landing either side.
  plat(43,24,9);plat(59,24,9);plat(47,27,4);plat(61,27,4);
  for(let y=24;y<30;y++)set(58,y,T.NET);
  // NOTHING IS DUG AFTER THIS LINE: the goat path's rock face above is the last tile laid
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 4, y: 217 }, pools: [], falls: [], moversExtra: movers,
    duskStart: 99999, duskLen: 1, music: 'sunspire', night: false, cloudLine: CLOUD, snowLine: 28,   /* snow only on the stones over the roof: on the roof it hid the boards */
    belfry: {roofGone:false}, monk: { flags, hangers, boards: roofBoards }, facades, masonry, interiors,
    tall: { top: CLOUD * TS, bottom: 218 * TS, col: '64,70,84', deepest: 0.26 },
    quest: { n: 3, item: 'bead', name: 'PRAYER BEADS', npc: 'squire', done: 'THE BEADS ARE RESTRUNG', reward: 'relic', relic: 'sunshard' },
    palette: { sky: [[146, 156, 172], [230, 216, 196]], far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', ledges: 'beam',
      haze: 'rgba(222,208,190,0.14)', grass: '#7c8a56', grassL: '#9aa86c', grassD: '#5a6640',
      dirt: '#6a625a', dirtL: '#827a70', dirtD: '#4a443e', canopy: ['#5a5650', '#6e6a62', '#86806e', '#a89c84'] },
    weather: [{ x0: 0, x1: 99999, kind: 'mist' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 2 * TS, x1: 94 * TS, floor: 30 * TS, y0: 24 * TS, trigger: 40 * TS, wallL: 1, wallR: 94, boss: 'abbot', music: 'roc', tint: '#e8c88a', tintA: 0.10, fx: 'motes' },   /* it used to wake a quarter of the way across the summit, before you had seen the nest. THE FALSE ABBOT has it now (2026-09-22): the Roc was a giant bird in a bell tower, and this level's own rule is that what the monks built answers a blow. Her code is untouched and she is placed nowhere - restorable, as the Harbor was. (The track is still hers: he has not got one of his own yet.) */
    mini: { x0: 30 * TS, x1: 50 * TS, floor: 56 * TS, trigger: 34 * TS, wallL: 29, gate: 51, boss: 'golem', y0: 48 * TS, y1: 57 * TS },
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
  ent('sign', 4, 33, { text: 'STORMHOLD. THE GATES ARE LOCKED AND THE KEYS ARE INDOORS. PRESS UP AT A DOOR.' });
  ent('deco', 16, 33, { kind: 'cairn' }); ent('torch', 12, 33); ent('deco', 24, 33, { kind: 'barrels' });
  ent('sprig', 30, 33, { face: -1 }); ent('shield', 40, 33, { face: -1 }); ent('torch', 34, 33);
  coins([14, 32], [22, 31], [36, 32], [48, 32]);
  ent('check', 20, 33); coins([10, 32], [18, 31], [28, 32], [36, 31]);
  // the first house: it is already open, so the doorway teaches itself
  roof(44, 54, 30);
  ent('doorway', 48, 33, { id: 'hearth-out', to: 'hearth-in', kind: 'goblin' });
  ent('doorway', 53, 33, { id: 'hearth-far', to: 'hearth-back', kind: 'goblin' });
  ent('sign', 44, 33, { text: 'THIS DOOR IS ON THE LATCH. INSIDE IS ASLEEP, AND THE BRASS KEY IS ON THE NAIL.' });
  room(6, 30, 6, 13, 'hall');
  ent('doorway', 9, 13, { id: 'hearth-in', to: 'hearth-out', lock: [6, 30], label: 'THE HEARTH HOUSE' });
  ent('torch', 12, 13); ent('brazier', 20, 13); ent('deco', 26, 13, { kind: 'barrels' });
  ent('hearthgob', 18, 13, { face: -1 }); ent('key', 26, 13, { kind: 'brass' });
  ent('doorway', 29, 13, { id: 'hearth-back', to: 'hearth-far', lock: [6, 30], label: 'OUT THE BACK' });
  coins([12, 12], [16, 12], [20, 12], [24, 12], [26, 11]);
  ent('sign', 7, 13, { text: 'HEARTH GOBLINS SLEEP BY THE FIRE UNTIL YOU COME CLOSE.' });
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
  // the smithy: the smith, his shelf, and the first captive (the iron key was up his shelf, two houses back from the gate it opens;
  // a player at that gate went into the tannery beside it and found no key. It lives in the tannery now: every key in Stormhold is
  // in the house nearest its gate)
  ent('doorway', 113, 31, { id: 'smithy-out', to: 'smithy-in', kind: 'goblin' });
  ent('doorway', 122, 31, { id: 'smithy-far', to: 'smithy-back', kind: 'goblin' });
  room(38, 66, 6, 14, 'stone');
  ent('doorway', 41, 14, { id: 'smithy-in', to: 'smithy-out', lock: [38, 66], label: 'THE SMITHY' });
  ent('brazier', 46, 14); ent('deco', 52, 14, { kind: 'anvil' }); ent('torch', 60, 14);
  ent('hearthgob', 50, 14, { face: -1 }); ent('hearthgob', 58, 14, { face: -1 }); ent('miner', 62, 14, { face: -1 });
  plat(47, 13, 3); plat(50, 11, 3); plat(54, 10, 4); coins([44, 13], [48, 13], [52, 13], [56, 9], [58, 9], [60, 13], [63, 13], [64, 13]); // steps to the shelf: it was five rows off the floor (the coins at the end of it are where the iron key lay)
  ent('stray', 56, 9, { kind: 'folk' });
  ent('doorway', 65, 14, { id: 'smithy-back', to: 'smithy-far', lock: [38, 66], label: 'OUT THE SLACK-TUB DOOR' });
  ent('sign', 39, 14, { text: 'THE SMITHY. THE BACK DOOR IS PAST THE SHELF.' });
  // the second span: long, watched from both ends, and a cutter on the far post
  block(151, 152, 32, 45); block(178, 179, 32, 45);
  // (the span over the sootworks gorge came down: THE CHIMNEYS, below, are the crossing now)
  ent('stormshaman', 181, 31, { face: -1 }); // (the rope cutter could drop the only way on: a shaman holds the far end instead)
  ent('archer', 151, 31, { face: 1, fire: true }); ent('rockgoblin', 179, 31, { face: -1 }); // (her floor there is row 32: these two were standing two rows over it)
  ent('sign', 148, 31, { text: 'AN AXE GOBLIN ON THE ROPE WILL CUT IT. THROW THE SHIELD AT HIM.', pyro: 'AN AXE GOBLIN ON THE ROPE WILL CUT IT. AN EMBER REACHES HIM.', paladin: 'AN AXE GOBLIN ON THE ROPE WILL CUT IT. THE BLESSED HAMMER REACHES HIM.' });
  ent('deco', 152, 31, { kind: 'lanternPost' }); ent('deco', 179, 31, { kind: 'lanternPost' }); // a lamp on each bank of the chimneys (they stood in the air over the old span)
  floor(180, 208, 32); ent('sprig', 190, 31, { face: -1 }); ent('shield', 200, 31, { face: -1 });
  coins([184, 31], [194, 30], [204, 31]);
  // the tannery: a house you go through, not into, the second captive, and the iron key for the gate just past its far door
  roof(186, 198, 28); ent('doorway', 188, 31, { id: 'tan-out', to: 'tan-in', kind: 'goblin' });
  ent('doorway', 196, 31, { id: 'tan-far', to: 'tan-back', kind: 'goblin' });
  room(74, 98, 6, 13, 'earth');
  ent('doorway', 77, 13, { id: 'tan-in', to: 'tan-out', lock: [74, 98], label: 'THE TANNERY' });
  ent('torch', 82, 13); ent('hearthgob', 88, 13, { face: -1 }); ent('spider', 92, 7, { drop: 90 });
  ent('key', 93, 13, { kind: 'iron' });   /* under the spider's thread: you take it past the goblin and the drop */
  ent('stray', 95, 13, { kind: 'folk' }); coins([80, 12], [84, 12], [88, 12], [90, 12]);
  ent('doorway', 97, 13, { id: 'tan-back', to: 'tan-far', lock: [74, 98], label: 'OUT PAST THE PITS' });
  ent('lockgate', 208, 31, { needs: 'iron', h: 6 }); gateCol(208, 26, 31);
  ent('check', 204, 31);

  // ---- 3. THE HALLS: the officers' houses under the crag, and every span at once. ----
  floor(209, 250, 30);
  ent('sign', 211, 29, { text: 'THE HALLS UNDER THE CRAG. THE LAST KEY IS IN THE LONGHOUSE, AND IT IS FULL.' });
  ent('deco', 218, 29, { kind: 'banner', v: 0 }); ent('deco', 240, 29, { kind: 'banner', v: 1 });
  ent('brute', 224, 29, { face: -1 }); ent('pike', 234, 29, { face: -1 }); ent('archer', 246, 29, { face: -1, fire: true }); ent('check', 240, 29); ent('shield', 249, 29, { face: -1 });   /* a composed pair: the shield stands past her fire arrows, on the same hall floor - go round the guard and into the flames, or through the guard first */
  roof(214, 232, 26); roof(236, 248, 26); ent('torch', 216, 29); ent('torch', 244, 29);
  coins([214, 28], [220, 27], [228, 28], [232, 27], [238, 28], [244, 27], [248, 28]);
  // the longhouse: the deepest room, the bone key at the back of it
  ent('doorway', 220, 29, { id: 'long-out', to: 'long-in', kind: 'cottage' });
  ent('doorway', 244, 29, { id: 'long-far', to: 'long-back', kind: 'cottage' });
  room(106, 160, 4, 15, 'hall');
  ent('doorway', 109, 15, { id: 'long-in', to: 'long-out', lock: [106, 160], label: 'THE LONGHOUSE' });
  ent('torch', 114, 15); ent('brazier', 124, 15); ent('brazier', 142, 15); ent('torch', 154, 15);
  ent('hearthgob', 120, 15, { face: -1 }); ent('hearthgob', 134, 15, { face: 1 }); ent('brute', 146, 15, { face: -1 });
  plat(112, 14, 3); plat(115, 12, 3); plat(118, 11, 4); plat(123, 10, 3); plat(128, 8, 5); plat(136, 10, 4); ent('archer', 129, 7, { face: -1 }); // a real way into the rafters
  ent('stray', 130, 7, { kind: 'folk' }); ent('key', 156, 15, { kind: 'bone' });
  ent('doorway', 159, 15, { id: 'long-back', to: 'long-far', lock: [106, 160], label: 'OUT THE GABLE END' });
  coins([116, 10], [120, 10], [126, 7], [130, 7], [137, 9], [139, 9], [150, 14], [154, 14]);
  ent('sign', 107, 15, { text: 'THE LONGHOUSE. THE BONE KEY AND THE WAY OUT ARE BOTH AT THE FAR END.' });
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
  ent('sign', 302, BY - 1, { text: 'THE QUEEN\'S LANCE CANNOT TURN MID-CHARGE. STAND ON A LOOKOUT AND LET HIM PASS.' });
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
  /* (THE BARRICADES WENT. Six palisades across the bridge made the Queen's Lance a fight about walls; the bridge is bare now,
     and the weights over it are what you bring down on him.) */
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
  ent('sign', 150, 31, { text: 'THE SPAN IS DOWN: CLIMB THE STACKS. SWEEPS THROW SOOT. EVERY SHAFT HAS A LADDER.' });
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
    const drs = L.ents.filter(e => e.t === 'doorway' && !e.lock && e.y === fy - 1 && e.x > x0 && e.x < x1).map(e => e.x);
    return { x0: x0 + 1, x1: x1 - 1, y0: y + 1, y1: fy - 1, door: drs.length ? drs[0] : null, door2: drs.length > 1 ? drs[1] : null, seed: x0 }; }).filter(h => h.y1 >= h.y0 + 1);

  // THE WATCHTOWERS: permanent banks carry the legs; each upper deck repays the climb.
  const watchtowers=[{x0:28,x1:35,top:23,floor:34,kind:'timber',payoff:'horn'},{x0:180,x1:185,top:21,floor:32,kind:'timber',payoff:'weight'},{x0:277,x1:283,top:21,floor:30,kind:'timber',payoff:'gate'}],zipLines=[];
  for(const [i,z] of watchtowers.entries()){
    plat(z.x0,z.top,z.x1-z.x0+1);for(let y=z.top;y<z.floor;y++)set(z.x0,y,T.NET);
    for(let x=z.x0+2;x<=z.x1;x++)if(L.grid[(z.top+5)*L.W+x]===T.AIR)set(x,z.top+5,T.ONEWAY);
    ent('sprig',z.x0+3,z.top+4,{face:-1});ent(i===0?'horn':'archer',z.x0+3,z.top-1,{face:-1});
    ent('sign',z.x0+1,z.floor-1,{text:i===0?'THE HORN TOWER. CLIMB INSIDE AND SILENCE IT. UP TAKES THE ROPE; JUMP LETS GO.':i===1?'THE SOOT WATCH. STRIKE THE WINCH TO DROP ITS WEIGHT ON THE ROOF BELOW.':'THE GATE WATCH. ITS TOP WINCH OPENS THE CAMP BARRIER. TAKE THE ROPE BACK DOWN.'});
    const end=[42,204,295][i],endY=[29,27,27][i];zipLines.push({x0:(z.x1-1)*TS+8,y0:z.top*TS-18,x1:end*TS+8,y1:endY*TS-18,posts:[[(z.x1-1)*TS+8,z.top*TS-18,z.top*TS],[end*TS+8,endY*TS-18,(i===0?34:i===1?32:30)*TS]]});
  }
  ent('weight',187,19,{len:3,hang:true});ent('archer',187,25,{face:-1});ent('lever',184,20,{dropWeight:187});
  gateCol(285,27,29);ent('lever',282,20,{openColumn:[285,27,29]});
  return {
    watchtowers,structures:watchtowers,zipLines,ropes:zipLines,
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 33 }, pools: [], falls: [], moversExtra: movers, interiors, bridges, houses,
    indoorRow: 18, // rows 0-18 are the insides of the houses: the camera never shows them from the street, nor the street from inside
    duskStart: -1, duskLen: 1, music: 'stormhold', night: true, glowNight: true, nightA: 0.26,
    quest: { n: 3, item: 'folk', name: 'HILL FOLK', npc: 'squire', done: 'THEY ARE OUT OF THEIR CELLARS', reward: 'relic', relic: 'shoes' },
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(150,160,200,0.16)',
      grass: '#cfd8e2', grassL: '#eef4ff', grassD: '#9aa8bc', dirt: '#4a4a58', dirtL: '#62626e', dirtD: '#32323c',
      canopy: ['#3a3a48', '#4a4a5a', '#5a5a6c', '#6a6a80'] },
    weather: [{ x0: 0, x1: 99999, kind: 'snow' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    castle: true, // the castle grows over the whole level: drawn behind everything
    arena: { x0: 302 * TS, x1: 429 * TS, floor: 30 * TS, trigger: 308 * TS, wallL: 301, wallR: 429, boss: 'lance', music: 'musCastle', tint: '#6a7a9a', tintA: 0.10, fx: 'dust' },
  };
}


// ============================================================================================
// THE UNDERCROWN - the secret level under Highcrown, and the only one in the game that goes DOWN.
//
// The castle stands on a hill that is not there any more. They dug the iron out from under it for two
// hundred years and stopped only because the diggers stopped coming back, and what is left is a hole
// with a castle balanced on it. NOTHING DOWN HERE IS HOLDING ITSELF UP: every gallery is a span of roof
// on a set of timber, and a set of timber is three blows of your own.
//
// THE VERB IS THE COLLAPSE, and it is never simply good. Cutting a set does three things at once:
//   IT KILLS whatever was standing under the span. That is the weapon.
//   IT OPENS A HOLE where the roof was, which is the way down - or the way something comes down at you.
//   IT LEAVES A MOUND of rubble on the floor, which is a stair you did not have and a wall across a
//   gallery you may still have wanted.
// So you are not clearing a mine. You are choosing which parts of it still exist, and you are doing it
// in one direction, because everything you break is behind you the moment you use it.
//
// It opens on the ONE THING Highcrown can be asked for that its gold time cannot: four goblins in five.
// Underleaf asks you to be quick through Kingswood; the Undercrown asks you to leave nothing standing in
// Highcrown, which is the opposite instruction to the same castle.
// ============================================================================================
function undercrown() {
  const L = painter(154, 196);
  const { block, floor, plat, ent, coins, set, spikes } = L;
  const movers = [], interiors = [], pools = [];
  block(0, 153, 0, 195);                             // it is all rock until something is dug out of it
  const cut = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  // A GALLERY: a level driven into the rock, timbered, with a roof course over it that can be brought down.
  const gallery = (x0, x1, fl, h = 4) => { cut(x0, x1, fl - h, fl - 1); interiors.push([x0, x1, fl - h, fl - 1, 'mine']);   /* 'mine', not the burrows' 'earth': the mine's wall is lit enough to stand a walkway off (drawRoom) */ };
  const shaft = (x, w, y0, y1) => { cut(x, x + w - 1, y0, y1); };
  const ladder = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); };
  const rail = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.RAIL); };
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.PLANK); };
  const shelf = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SHELF); };
  /* A POOL WITH NO BOTTOM IS PAINTED TO THE FOOT OF THE SCREEN: drawWater has nothing else to stop at, so from the tomb a hundred
     rows under it the flooded level's one course of water washed half the Prince's fight blue. `bottom` is the rock it lies on. */
  /* AND IT IS POISON. This water is not swum: it kills whoever goes in, and it was drawn as clean blue water, which says "swim".
     `harm` + `poison` give it drawFoul's scum and gas in a sick green, with no wrecks and no fins in it (a look only: harm hurts a
     swimmer, and nobody swims here). */
  const water = (x0, x1, yTop, d, bottom) => pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: yTop * TS + 4, depth: d || 40, harm: true, poison: true, foulCol: '#5c8a24', foulColL: '#a6e04a', foulColD: '#1c3212', ...(bottom !== undefined ? { bottom: bottom * TS } : {}) });
  // A SET OF TIMBER. `state` says what it will take: sound wants three blows of your own, cracked wants
  // one (or a heavy landing anywhere under it), going is already failing and drops on its own once you
  // walk under it. deep is how many courses of roof come out when it goes.
  const timber = (x, fl, x0, x1, row, o = {}) => ent('timber', x, fl - 1, { x0, x1, row, floor: fl - 1, deep: o.deep || 2, state: o.state || 'sound', ...(o.tomb ? { tomb: true, hp: o.hp, mound: o.mound } : {}) });

  // ---- 1. THE ADIT (rows 10-24). In under the castle's own footings, and the first set teaches it. ----
  gallery(2, 46, 24, 4);
  ent('sign', 4, 23, { text: 'CUT A TIMBER SET AND THE ROOF FALLS ON WHAT IS UNDER, LEAVING A MOUND TO CLIMB.' });
  ent('check', 6, 23);
  ent('deco', 10, 23, { kind: 'barrels' }); ent('minerlamp', 14, 23, { lit: true }); ent('deco', 18, 23, { kind: 'wares' });
  ent('minerlamp', 30, 23, { lit: true }); ent('minerlamp', 42, 23, { lit: true });
  rail(20, 46, 24); ent('cart', 44, 23);
  coins([8, 22], [12, 22], [16, 22], [22, 22], [28, 22], [34, 22], [40, 22]);
  ent('sign', 20, 23, { text: 'THREE BLOWS DROP THIS ROOF ON THEM. THE MOUND IT LEAVES IS YOUR WAY UP.' });
  timber(30, 24, 24, 36, 19, { deep: 3 });
  ent('miner', 28, 23, { face: 1 }); ent('sprig', 34, 23, { face: -1 });
  ent('propman', 20, 23, { face: 1 });
  ent('rockgoblin', 40, 23, { face: -1 }); ent('miner', 44, 23, { face: -1 }); ent('sprig', 36, 23, { face: -1 });
  ent('bat', 22, 20); ent('bat', 38, 20);
  ent('deco', 26, 23, { kind: 'barrels' }); ent('deco', 38, 23, { kind: 'wares' }); ent('deco', 12, 23, { kind: 'coffer' });
  ent('stray', 16, 23, { kind: 'lamp' });                          /* the first lamp: somebody put it down and did not pick it up */
  ent('check', 22, 23);
  cut(24, 36, 15, 18); interiors.push([24, 36, 15, 18, 'mine']);   /* the working above it, and row 19 between them is the roof the set holds */
  coins([26, 17], [30, 17], [34, 17], [28, 17], [32, 17]); ent('silver', 30, 17);
  ent('minerlamp', 26, 18, { lit: false }); ent('deco', 34, 18, { kind: 'barrels' });

  // ---- 2. THE FIRST WORKINGS (rows 24-58). Galleries stacked three deep, joined by a shaft. ----
  shaft(46, 6, 16, 44);
  gallery(40, 86, 34, 4);
  ent('check', 50, 33);
  rail(50, 84, 34); ent('cart', 82, 33, { auto: true, dir: -1, speed: 110 });
  boards(47, 49, 34);   /* a landing off the ladder: the gallery floor stopped three tiles short of it, over the drop, and every trip down was a jump from a rung */
  ent('minerlamp', 54, 33, { lit: true }); ent('minerlamp', 70, 33, { lit: true }); ent('minerlamp', 84, 33, { lit: true });
  ent('deco', 58, 33, { kind: 'barrels' });
  ent('sign', 52, 33, { text: 'THE PROPMAN KEEPS THE TIMBER UP. KILL THE MAN FIRST, THEN CUT THE WOOD.' });
  timber(62, 34, 56, 70, 29, { deep: 2 });
  timber(78, 34, 72, 84, 29, { deep: 2, state: 'cracked' });
  ent('propman', 68, 33, { face: -1 }); ent('propman', 80, 33, { face: -1 });
  ent('rockgoblin', 62, 33, { face: -1 }); ent('miner', 74, 33, { face: 1 });
  ent('sprig', 44, 33, { face: 1 }); ent('sprig', 56, 33, { face: -1 }); ent('miner', 54, 33, { face: -1 });
  ent('rockgoblin', 44, 33, { face: -1 }); ent('sentry', 66, 33, { section: 'works', range: 9, face: 1 });
  ent('bell', 44, 33, { section: 'works' });
  ent('deco', 64, 33, { kind: 'wares' }); ent('deco', 76, 33, { kind: 'barrels' }); ent('deco', 44, 33, { kind: 'coffer' });
  ent('check', 68, 33);
  ent('sign', 74, 33, { text: 'THE SENTRY\'S BELL AT THE SHAFT HEAD CARRIES TO EVERYTHING BELOW.' });
  coins([54, 32], [60, 32], [66, 32], [72, 32], [78, 32], [84, 32], [42, 32], [46, 32], [50, 32], [57, 32], [63, 32], [69, 32], [75, 32], [81, 32]);
  cut(56, 84, 25, 28); interiors.push([56, 84, 25, 28, 'mine']);   /* row 29 is the roof over the gallery below */
  coins([58, 27], [64, 27], [70, 27], [76, 27], [82, 27], [61, 27], [67, 27], [73, 27], [79, 27]);
  ent('stray', 66, 28, { kind: 'lamp' });                          /* the second: up in the old working, where nobody goes */
  ent('deco', 57, 28, { kind: 'barrels' }); ent('minerlamp', 72, 28, { lit: false });
  ent('bat', 60, 27); ent('bat', 76, 27);

  shaft(86, 6, 26, 56);
  ent('clinger', 87, 34, { face: 1 }); ent('clinger', 87, 46, { face: 1 });
  ent('sign', 84, 33, { text: 'CLINGERS DROP WHEN YOU ARE IN THE AIR BESIDE THEM. SWING TO SHAKE ONE OFF.' });

  // ---- 3. THE FLOODED LEVEL (rows 46-84). They stopped pumping a long time ago. ----
  gallery(10, 90, 56, 6);
  ent('check', 84, 55);
  for (let x = 20; x <= 52; x++) set(x, 56, T.AIR);
  block(20, 52, 57, 62); water(20, 52, 56, 60, 57);
  ent('sign', 80, 55, { text: 'THE PLANKS ARE THE ONLY DRY WAY, AND THE TIMBER OVER THEM IS ALREADY GOING.' });
  boards(20, 32, 54); boards(38, 52, 54);                          /* the dry way: two courses over the water, and reachable off either bank */
  plat(34, 52, 4);                                                 /* and the step over the gap in the middle of it */
  timber(28, 54, 22, 34, 49, { deep: 2, state: 'going' });         /* the sets stand ON the planks, and the course they hold is the gallery's own roof */
  timber(44, 54, 38, 50, 49, { deep: 2 });
  ent('propman', 54, 55, { face: -1 }); ent('propman', 70, 55, { face: 1 });
  ent('rockgoblin', 66, 55, { face: -1 }); ent('rockgoblin', 14, 55, { face: 1 });
  ent('miner', 74, 55, { face: -1 }); ent('miner', 58, 55, { face: 1 }); ent('sprig', 18, 55, { face: 1 });
  ent('grub', 82, 55, { face: -1 }); ent('grub', 12, 55, { face: 1 });
  ent('bat', 64, 50); ent('bat', 78, 50); ent('bat', 34, 50);
  ent('rockgoblin', 60, 55, { face: 1 }); ent('sprig', 76, 55, { face: -1 });
  ent('check', 62, 55);
  ent('deco', 70, 55, { kind: 'barrels' }); ent('deco', 16, 55, { kind: 'wares' }); ent('deco', 84, 55, { kind: 'coffer' });
  ent('sign', 66, 55, { text: 'GAS SITS IN THE LOW PLACES. SOMETHING OLD LIVES IN THE WATER.' });
  ent('stray', 80, 55, { kind: 'lamp' });                          /* the third: still burning, which is the worst of the three */
  ent('minerlamp', 62, 55, { lit: true }); ent('minerlamp', 78, 55, { lit: true });
  ent('gas', 44, 55); ent('gas', 30, 55);
  coins([26, 51], [30, 51], [40, 51], [46, 51], [60, 54], [68, 54], [76, 54], [86, 54], [28, 51], [42, 51], [56, 54], [64, 54], [72, 54], [82, 54], [12, 54], [16, 54]);
  ent('silver', 36, 50);   /* it was set INTO the rock course over the gallery; one row down it hangs over the ledge */
  ent('clinger', 9, 62, { face: 1 });
  shaft(6, 6, 56, 88);
  ent('clinger', 7, 70, { face: 1 }); ent('clinger', 7, 80, { face: 1 });

  // ---- 4. THE GREAT STOPE (rows 84-124). One void, crossed on the timber itself. ----
  cut(6, 96, 88, 122); interiors.push([6, 96, 88, 122, 'mine']);
  block(0, 103, 123, 128);
  floor(6, 30, 122); floor(80, 96, 122);
  ent('check', 12, 121);
  ent('sign', 10, 121, { text: 'THE GREAT STOPE. EVERY SPAN IS A SET THAT CAN FALL, EVEN THE ONE YOU STAND ON.' });
  boards(30, 44, 112); boards(52, 66, 112); boards(40, 56, 100);
  plat(46, 106, 6); plat(24, 106, 6); plat(68, 106, 6);
  plat(10, 90, 6); plat(17, 94, 6); plat(24, 98, 8); plat(33, 100, 7);   /* the stages down the west wall: off the rope, and onto the top walkway */
  ent('propman', 36, 111, { face: 1 });   /* he was THE OVERMAN, the stope's mini: cut 2026-09-21 (Daniel). A propman like the rest now */
  ent('propman', 60, 111, { face: -1 });
  ent('rockgoblin', 46, 99, { face: 1 }); ent('miner', 54, 99, { face: -1 });
  ent('rockgoblin', 26, 121, { face: 1 }); ent('miner', 94, 121, { face: -1 }); ent('sprig', 82, 121, { face: -1 });
  ent('sprig', 32, 111, { face: 1 }); ent('miner', 64, 111, { face: -1 });
  ent('check', 46, 105);
  ent('sign', 30, 111, { text: 'THE PROPMEN RESET WHAT YOU CUT. TAKE THEM OFF THE SPAN FIRST; MIND YOUR OWN.' });
  ent('clinger', 7, 96, { face: 1 }); ent('clinger', 95, 104, { face: -1 });
  ent('bat', 40, 92); ent('bat', 62, 92); ent('bat', 52, 94); ent('bat', 30, 96); ent('bat', 74, 96);
  ent('rockgoblin', 52, 111, { face: -1 }); ent('sprig', 44, 99, { face: 1 });
  timber(37, 112, 30, 44, 112, { deep: 1 });
  timber(59, 112, 52, 66, 112, { deep: 1, state: 'cracked' });
  timber(48, 100, 40, 56, 100, { deep: 1 });
  coins([32, 111], [38, 111], [44, 111], [54, 111], [60, 111], [66, 111], [42, 99], [48, 99], [54, 99], [26, 105], [70, 105], [35, 111], [41, 111], [57, 111], [63, 111], [45, 99], [51, 99], [28, 105], [72, 105], [48, 105]);
  ent('silver', 48, 97);
  ent('minerlamp', 14, 121, { lit: true }); ent('minerlamp', 88, 121, { lit: true });
  ent('deco', 20, 121, { kind: 'barrels' }); ent('deco', 92, 121, { kind: 'wares' });
  ent('deco', 26, 121, { kind: 'coffer' }); ent('minerlamp', 32, 121, { lit: false }); ent('minerlamp', 76, 121, { lit: true });
  coins([18, 120], [24, 120], [84, 120], [90, 120]);
  plat(74, 100, 6);
  ent('check', 94, 121);

  // ---- 4b. THE GLITTER VEIN (rows 106-121, east of the stope). The iron ran out into THIS: a cavern of glass. They
  //          crossed its poison on ledges of the stuff, and a crystal ledge takes your weight for about a breath
  //          before it crazes and goes - it grows back, slowly. (CRYST: the Sunspire's tile, and hasCryst below.)
  cut(97, 150, 106, 121); interiors.push([97, 150, 106, 121, 'crystal']);
  ent('check', 99, 121);
  ent('sign', 101, 121, { text: 'THE GLITTER VEIN. THE IRON RAN OUT INTO GLASS. IT WILL NOT HOLD YOU FOR LONG.' });
  for (let x = 106; x <= 140; x++) set(x, 122, T.AIR);
  water(106, 140, 122, 20, 123);                                   /* the vein's floor is the same dead water as the flooded level */
  const glass = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.CRYST); };
  glass(107, 109, 120); glass(113, 115, 119); glass(119, 121, 120); glass(125, 127, 119); glass(131, 133, 120); glass(137, 139, 119);
  glass(116, 119, 116); glass(128, 131, 116);                      /* the high way: two more, for the silver and the brave */
  ent('silver', 130, 114);
  coins([108, 118], [114, 117], [120, 118], [126, 117], [132, 118], [138, 117], [117, 114], [118, 114], [129, 114]);
  ent('minerlamp', 102, 121, { lit: true }); ent('minerlamp', 146, 121, { lit: true }); ent('minerlamp', 104, 121, { lit: false });
  ent('deco', 99, 121, { kind: 'barrels' }); ent('deco', 148, 121, { kind: 'wares' });
  ent('shardling', 103, 121, { face: -1 }); ent('rockgoblin', 144, 121, { face: -1 }); ent('miner', 142, 121, { face: -1 }); ent('shardling', 149, 121, { face: -1 });
  ent('bat', 112, 110); ent('bat', 124, 108); ent('bat', 136, 110);
  // THE WAY DOWN is a shaft off the east bank, into the barrow the miners broke into last and walled up first.
  shaft(144, 6, 122, 130);

  // ---- 4c. THE GOBLIN BARROW (rows 131-140). The Prince's people, buried in rows in the rock, and what is left of
  //          them getting up. The miners walled it up; the drift you want goes west out of it.
  cut(96, 150, 131, 140); interiors.push([96, 150, 131, 140, 'ossuary']);
  ent('check', 146, 140);
  ent('sign', 142, 140, { text: 'THE GOBLIN BARROW. HIS PEOPLE WERE BURIED IN ROWS. THEY ARE NOT STAYING DOWN.' });
  plat(104, 137, 5); plat(120, 136, 6); plat(134, 137, 5);         /* the biers: three stone shelves the dead were laid on */
  ent('bonegob', 138, 140, { face: -1 }); ent('bonegob', 124, 140, { face: -1 }); ent('bonegob', 110, 140, { face: 1 });
  ent('bonearcher', 122, 135, { face: -1 }); ent('bonegob', 100, 140, { face: 1 });
  ent('bat', 116, 133); ent('bat', 130, 133);
  ent('gas', 116, 140); ent('gas', 130, 140);                       /* barrow air, in the low places between the biers */
  for (const [x, k, v] of [[102, 'stone', 0], [108, 'bones', 0], [114, 'stone', 1], [118, 'bones', 1], [128, 'stone', 0], [132, 'bones', 0], [140, 'stone', 1], [106, 'banner', 0]]) ent('deco', x, 140, { kind: k, ...(v ? { v } : {}) });
  ent('minerlamp', 144, 140, { lit: true }); ent('minerlamp', 112, 140, { lit: false }); ent('minerlamp', 98, 140, { lit: true });
  coins([106, 136], [122, 135], [124, 135], [136, 136], [142, 139], [128, 139], [114, 139], [102, 139]);

  // ---- 5. THE LAST DRIFT AND THE PIT. A boss arena is entered from the LEFT - the trigger is a line you
  //         cross going right - so nothing drops you into his pit. The barrow lets out into a low drift over it,
  //         and you walk the whole length of that drift to the ladder at the far end before you meet him.
  cut(10, 95, 137, 140); interiors.push([10, 95, 137, 140, 'mine']);
  ent('check', 86, 140);
  ent('sign', 82, 140, { text: 'THE LAST DRIFT. THE LADDER DOWN IS AT THE FAR END.' });
  ent('minerlamp', 74, 140, { lit: false }); ent('minerlamp', 40, 140, { lit: true }); ent('deco', 62, 140, { kind: 'barrels' });
  ent('rockgoblin', 68, 140, { face: -1 }); ent('miner', 50, 140, { face: 1 }); ent('sprig', 30, 140, { face: 1 });
  ent('propman', 58, 140, { face: -1 });
  timber(44, 141, 36, 54, 136, { deep: 2 });
  coins([78, 139], [70, 139], [62, 139], [54, 139], [46, 139], [38, 139], [30, 139], [22, 139], [16, 139]);
  shaft(10, 6, 141, 166);

  cut(4, 98, 144, 166); interiors.push([4, 98, 144, 166, 'mine']);
  floor(4, 98, 167);
  // THE PRINCE'S TOMB. The vault at the bottom of the mine that they walled a goblin prince into and then forgot. Its roof
  // is LOW and it stands on three timber sets, and that is the fight: cut a set while he is under it and the roof buries
  // him again. Four dead men's lamps burn round it; past half he breathes them out, and the dark is his until you light
  // them. The doorways are exactly the height of the arena's walls, so a shut tomb is shut.
  block(29, 75, 144, 155);                                          /* the vault roof: eleven courses of room under it */
  block(29, 29, 156, 160); block(75, 75, 156, 160);                 /* the lintels over its two doors */
  ent('check', 16, 166);
  ent('sign', 20, 166, { text: 'THE PRINCE\'S TOMB. CUT A SET WHILE HE IS UNDER IT, AND KEEP THE LAMPS LIT.' });
  ent('minerlamp', 12, 166, { lit: true }); ent('minerlamp', 86, 166, { lit: true });
  ent('deco', 24, 166, { kind: 'barrels' }); ent('deco', 78, 166, { kind: 'wares' }); ent('deco', 8, 166, { kind: 'coffer' });
  ent('sprig', 20, 166, { face: 1 }); ent('rockgoblin', 14, 166, { face: 1 }); ent('miner', 26, 166, { face: 1 });
  coins([16, 165], [22, 165], [8, 165], [80, 165], [84, 165], [90, 165]);
  // the tomb itself: the sets, each post just OUTSIDE its span so the hand that cuts it is not under the roof it drops
  timber(36, 167, 37, 44, 155, { deep: 1, tomb: true, hp: 2, mound: 1 });
  timber(59, 167, 51, 58, 155, { deep: 1, tomb: true, hp: 2, mound: 1 });
  timber(64, 167, 65, 72, 155, { deep: 1, tomb: true, hp: 2, mound: 1 });
  /* two of the four have gone out down the years: lighting them is the first thing the tomb asks of you, and all four lit is when THE LIGHT FINDS HIM */
  ent('minerlamp', 33, 166, { lit: true }); ent('minerlamp', 46, 166, { lit: false }); ent('minerlamp', 61, 166, { lit: false }); ent('minerlamp', 73, 166, { lit: true });
  ent('deco', 41, 166, { kind: 'stone' }); ent('deco', 55, 166, { kind: 'stone', v: 1 }); ent('deco', 69, 166, { kind: 'stone' });   /* the grave slabs of whoever went down with him */
  ent('deco', 39, 166, { kind: 'bones' }); ent('deco', 67, 166, { kind: 'bones', v: 1 }); ent('deco', 71, 166, { kind: 'banner' });   /* and his banner, what is left of it */
  coins([40, 165], [54, 165], [68, 165]);
  ent('prince', 49, 166, { face: -1 });                             /* in his sarcophagus, between the first two sets */
  ent('gate', 90, 166);

  // EVERY LADDER IS HUNG LAST. A gallery cut after a ladder erases the rungs it runs through and does it
  // silently: the shaft still looks like a shaft, and there is a four-course gap in the middle of it that
  // you only find by falling down it. Nothing is dug after this line.
  ladder(46, 18, 43); ladder(90, 28, 55); ladder(10, 56, 87); ladder(146, 121, 139); ladder(14, 141, 166); ladder(78, 100, 121);

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 4, y: 23 }, pools, falls: [], moversExtra: movers, interiors,
    timber: true, hasCryst: true, dark: 0.14, edgeLit: true, underground: true,   /* hasCryst: the Glitter Vein's ledges craze under you (updateCrystal) */   /* it was too dark to see the floor: less black, and every edge you can stand on is lit */
    duskStart: -1, duskLen: 1, music: 'barrows', night: true, glowNight: true, nightA: 0.12,   /* the readability pass: under the night wash, the tall gloom and the murk the open air measured L* 6-9 (a walkway needs 20 to read): the washes thinner, the far wall a lit brown, and the gloom a mine's grey, not the canopy's green */
    tall: { top: 10 * TS, bottom: 168 * TS, col: '18,16,22', deepest: 0.12 },
    quest: { n: 3, item: 'lamp', name: 'DEAD MEN\'S LAMPS', npc: 'squire', done: 'THEY ARE ALL ACCOUNTED FOR', reward: 'relic', relic: 'soles' },
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'none', ledges: 'staging', haze: 'rgba(30,26,34,0.2)', murkCol: '#3e3846', murkLit: '#7a5a34',   /* a mine's platform is staging: sawn boards over a joist, not a felled tree */
      grass: '#5a4a3a', grassL: '#6e5c48', grassD: '#3a2e22', dirt: '#3a3028', dirtL: '#4a3e32', dirtD: '#241d18',
      canopy: ['#1a1620', '#241e28', '#2e2632', '#3a303e'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'cave' }],
    arena: { x0: 30 * TS, x1: 74 * TS, floor: 167 * TS, trigger: 34 * TS, wallL: 29, wallR: 75, boss: 'prince', music: 'musDungeon', tint: '#1e2420', tintA: 0.14, fx: 'dust', y0: 144 * TS, y1: 168 * TS },
  };
}


// ============================================================================================
// THE DEEP - the trench the tribute went into, and the only level in the game where you are
// too LIGHT to be where you are going.
//
// Five levels of sea and every one of them is a journey ACROSS: the tide moves the floor, the
// breath runs down, the decks are the road, the wash comes from windward, the lamps are air.
// This one goes DOWN, and it inverts the thing the whole game takes for granted - that you
// fall. Here you float, and falling is something you have to arrange.
//
// THE VERB IS BALLAST. A stone off a wreck's deck is a key that opens DOWNWARD: carry it and
// you sink, walk the bottom, and move like a man in armour; let it go - the JUMP key, because
// underwater that key has always meant GO UP - and you surge, and the stone lies where it
// falls until you come back for it. There are only so many of them in a room, and two things
// down here have opinions about which of you is holding one.
//
// AND WHAT IS AT THE BOTTOM. Thirty years of the goblin Queen's tribute went into this trench,
// hull on hull, and none of it was ever going to the goblins.
// ============================================================================================
function theDeep(){return crabTrench(deepAndKeep(),T,TS);}
function theUnderwaterKeep(){return underwaterKeep(deepAndKeep(),T,TS);}
function deepAndKeep() {
  // THE SHAPE: down the trench through six places that each look and move differently, out along the cold road at the
  // bottom of it, and through his castle to his throne. W is wide for the castle; the trench is the left 112 columns.
  const W = 304, H = 204;
  const L = painter(W, H);
  const { block, floor, plat, ent, coins, set } = L;
  const movers = [], interiors = [], pools = [], airRooms = [], darkZones = [], facades = [];
  block(0, W - 1, 0, H - 1);
  const cut = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  /* A SHIP HAS A HULL UNDER HER DECK. One row of planking is a three-pixel board, and three pixels at the
     bottom of a dark trench is nothing at all: every creature down here read as standing on open water. */
  const deck = (x0, x1, y) => { for (let x = x0; x <= x1; x++) { set(x, y, T.PLANK); set(x, y + 1, T.SOLID); set(x, y + 2, T.SOLID); } };
  const hull = (x0, x1, y0, y1) => { cut(x0, x1, y0, y1); interiors.push([x0, x1, y0, y1, 'ship']);
    airRooms.push([x0, x1, y0, y1]); };   /* HER HOLD IS THE AIR. The deck is the road and the hold under it is the breath; the open trench between two ships is the price */
  const rope = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); };
  const rock = (x0, x1, y0, y1) => block(x0, x1, y0, y1);
  // THE WATER, from the shelf to the floor of the trench, and a second sheet over the castle. `bottom` is how far down
  // the swim reaches; under it is rock, and the rock is where a stone puts you. The two overlap by two columns: two
  // pools that only touch leave a dry course between them.
  const sea = (x0, x1, top, bot) => pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: top * TS, swim: true, bottom: bot * TS, depth: (bot - top) * TS, clear: true, wash: 0.34, grad: false });
  /* CLEAR WATER. Every other swim pool in the game says `clear` and this one did not, so drawWater took the
     branch that paints the pool as an OPAQUE rectangle over everything in it - a hundred and fifty rows of
     flat blue, with the decks, the wrecks and the creatures all underneath it. The wash goes over the top
     of the level instead, thin, because it has to cover the whole descent. */
  const stone = (x, y, kind) => ent('ballast', x, y, { kind: kind || 'stone' });
  const air = (x, y) => ent('deco', x, y, { kind: 'airBell' });
  // A TON MORE AIR, AND A PLACE FOR EVERY KIND OF IT (src/deepair.js is where the breath clock and tools/breath.mjs read
  // it back). Each kind is signposted where it is first met. Everything else the deep draws and runs is in D.
  const D = { zones: [], vents: [], clams: [], bulbs: [], wrecks: [], pockets: [], jellies: [], kelp: [], fish: [], currents: [], props: [], banners: [], shafts: [], masonry: [], gates: [], rime: [], icicles: [] };
  /* WHERE THE REEF'S DRESSING DOES NOT GO: it lays coral and boulders on any open floor, which is right for a reef and wrong
     over the leviathan's bones, on the ice, and in his halls. main.js takes it back out of these at load. */
  D.noDress = [[38, 103, 186, 198], [104, 303, 140, 203]];
  const pocket = (x0, x1, y0, y1) => { airRooms.push([x0, x1, y0, y1]); D.pockets.push([x0, x1, y0, y1]); };   /* air under a roof: the surface of it shines */
  const vent = (x, y, h, hot, drain) => D.vents.push({ x, y, h, hot: !!hot, drain: !!drain });
  const clam = (x, y) => D.clams.push({ x, y });
  const kelp = (x, y, h, bulb) => { D.kelp.push({ x, y, h }); if (bulb) D.bulbs.push({ x, y: y - h }); };
  const wreck = (x, y) => D.wrecks.push({ x, y });
  const jelly = (x, y, hue) => D.jellies.push({ x, y, hue: hue || 0 });
  const prop = (k, x, y, o) => D.props.push(Object.assign({ k, x, y }, o || {}));
  const zone = (name, x0, x1, y0, y1, col, a) => D.zones.push({ name, x0, x1, y0, y1, col, a });
  const fish = (x, y, n, col) => D.fish.push({ x, y, n, col });

  // ---- 1. THE SHELF (rows 10-28). The last dry deck in the world, and the first stone. ----
  cut(4, 107, 10, 27);
  deck(4, 40, 28); block(4, 40, 29, 31);
  ent('sign', 6, 27, { text: 'YOU ARE TOO LIGHT FOR THE DEEP. CARRY A STONE TO WALK THE BOTTOM; JUMP TO DROP IT.' });
  ent('check', 8, 27);
  ent('deco', 12, 27, { kind: 'capstan' }); ent('deco', 20, 27, { kind: 'seaChest' }); ent('deco', 32, 27, { kind: 'anchor' });
  ent('deco', 26, 27, { kind: 'coiledCable' }); ent('deco', 36, 27, { kind: 'mastStump' });
  stone(16, 27); stone(28, 27);
  coins([10, 26], [14, 26], [22, 26], [30, 26], [38, 26]);
  ent('sailor', 24, 27, { face: -1 }); ent('lookout', 34, 27, { face: -1 });
  ent('netter', 14, 27, { face: 1 }); ent('crab', 30, 27, { face: -1 });
  ent('petrel', 48, 22); ent('scout', 20, 27, { face: 1 });
  ent('sign', 34, 27, { text: 'A HULL KEEPS AIR UNDER ITS DECK. SO DO BELLS, VENTS, CLAMS AND KELP: LOOK FOR THE SHINE.' });
  // the water starts where the deck ends, and the first shelf of rock is what teaches the verb
  sea(41, 107, 20, 35);   /* it has to reach PAST the shelf floor: two pools that only touch leave a dry course between them */
  rock(58, 107, 22, 26); rock(41, 50, 30, 31);
  cut(41, 107, 28, 31);   /* the water beside the deck goes down to the shelf floor */
  ent('sign', 38, 27, { text: 'THE SHELF OVERHANGS. CARRY A STONE, WALK UNDER, LET GO ON THE FAR SIDE.' });
  air(52, 21); coins([44, 24], [48, 24], [54, 24]);
  rock(41, 107, 32, 33); cut(51, 57, 32, 33);                       /* the only way down is the gap under the shelf */
  sea(6, 105, 34, 199);                                            /* and from here to the floor of the trench it is all water */
  coins([52, 31], [55, 31]);
  /* THE FIRST POCKET: the overhang was seventeen seconds of water with nothing in it. The sea keeps air under a lip of rock,
     and you can see it from below: a flat bright line where the water meets it. */
  pocket(74, 82, 27, 28); pocket(96, 104, 27, 28);
  ent('sign', 60, 31, { text: 'AIR GATHERS UNDER AN OVERHANG. WHERE THE WATER SHINES FLAT OVER YOU, BREATHE.' });
  coins([78, 30], [100, 30], [104, 31]); clam(106, 31);
  zone('THE SHELF', 4, 107, 10, 33, [200, 230, 240], 0.06);
  D.shafts.push({ x: 60, y0: 10, y1: 33, w: 3, lean: 0.25 }, { x: 88, y0: 10, y1: 21, w: 2, lean: 0.25 });

  // ---- 2. THE WRECK STACK (rows 34-72). Ships stacked, and their decks are the road down. ----
  cut(6, 105, 34, 72);
  rock(0, 5, 34, 72); rock(106, 111, 34, 72);
  ent('check', 54, 41); air(54, 38); air(90, 52); air(20, 60);
  ent('sign', 50, 41, { text: 'THE DECKS ARE THE ONLY FLOOR, AND THE AIR IS IN THE HOLDS.' });
  deck(30, 58, 42); hull(31, 57, 38, 41);
  deck(66, 96, 48); hull(67, 95, 44, 47);
  deck(14, 44, 56); hull(15, 43, 52, 55);
  deck(58, 90, 64); hull(59, 89, 60, 63);
  stone(40, 41); stone(78, 47); stone(26, 55); stone(70, 63);
  coins([34, 41], [44, 41], [52, 41], [70, 47], [80, 47], [90, 47], [20, 55], [30, 55], [38, 55], [64, 63], [74, 63], [84, 63]);
  ent('sailor', 48, 41, { face: -1 }); ent('merrowspear', 84, 47, { face: -1 }); ent('angler', 24, 50);   /* THE MERROW: her harpoon works as well off a hold's deck as off the reef */
  ent('scout', 34, 55, { face: 1 }); ent('eel', 96, 58); ent('crab', 68, 63, { face: 1 });
  ent('sailor', 74, 47, { face: 1 }); ent('crab', 38, 41, { face: -1 }); ent('netter', 22, 55, { face: 1 });
  ent('scout', 86, 63, { face: -1 }); ent('puffer', 52, 46); ent('urchin', 44, 60);
  ent('petrel', 66, 36); ent('angler', 88, 56); ent('eel', 30, 46);
  ent('siren', 60, 52); ent('tideguard', 92, 47, { face: -1 });
  ent('boarder', 42, 41, { face: 1 }); ent('merrowbrute', 80, 63, { face: -1 });
  ent('wight', 56, 41, { face: -1 }); ent('wight', 36, 55, { face: 1 });
  ent('sailor', 90, 47, { face: -1 }); ent('sailor', 66, 63, { face: 1 }); ent('tideguard', 20, 55, { face: 1 });
  ent('check', 78, 47); ent('check', 62, 63);
  ent('sign', 70, 47, { text: 'THE SHORTEST WAY BETWEEN TWO DECKS IS A STONE.' });
  ent('deco', 36, 41, { kind: 'wreckBow' }); ent('deco', 86, 47, { kind: 'sternWindows' });
  ent('deco', 22, 55, { kind: 'capstan' }); ent('deco', 80, 63, { kind: 'shipBell' });
  /* THE LANTERNS STILL LIT ON THEIR DECKS: the stack is the one place down here a man's light is burning */
  ent('deco', 33, 41, { kind: 'lanternDeck', v: 1 }); ent('deco', 94, 47, { kind: 'lanternDeck', v: 1 }); ent('deco', 17, 55, { kind: 'lanternDeck', v: 1 }); ent('deco', 88, 63, { kind: 'lanternDeck', v: 1 });
  rope(100, 34, 70); rope(8, 40, 70);
  ent('silver', 92, 38);
  ent('stray', 94, 47, { kind: 'coffer' });
  /* THE FIRST VENT, on a lip of the east wall, and the first bell on her side, over the throat: the stack's two gaps */
  rock(102, 105, 60, 61); vent(104, 59, 9);
  ent('sign', 102, 59, { text: 'A CRACK THAT BUBBLES IS BREATHING FOR YOU. SWIM INTO THE COLUMN.' });
  wreck(69, 72); vent(87, 72, 8);
  ent('sign', 72, 72, { text: 'A DIVING BELL ON HER SIDE STILL HAS HER AIR. PUT YOUR HEAD IN HER MOUTH.' });
  vent(10, 72, 12); rock(6, 7, 62, 63); pocket(6, 7, 64, 65); vent(31, 72, 9); clam(37, 72);        /* the west side of the stack: a vent by the rope, and a lip of rock with air under it */
  zone('THE WRECK STACK', 6, 105, 34, 73, [150, 170, 160], 0.07);

  cut(74, 82, 73, 73);                                             /* the throat into the kelp */

  // ---- 3. THE KELP FOREST (rows 74-112). Rooted things that will not let you go up, and a forest of them. ----
  cut(6, 105, 74, 112);
  rock(0, 5, 74, 112); rock(106, 111, 74, 112);
  ent('check', 16, 81); air(20, 78); air(88, 92); air(48, 104);   /* clear of the hull under the deck at 88 */
  ent('sign', 20, 81, { text: 'THE BEDS WAIT. WHAT GRABS YOU HOLDS YOU DOWN, STONE OR NOT: CUT IT OFF.' });
  deck(12, 40, 82); hull(13, 39, 78, 81);
  deck(62, 98, 88); hull(63, 97, 84, 87);
  deck(20, 52, 96); hull(21, 51, 92, 95);
  deck(60, 96, 104); hull(61, 95, 100, 103);
  rock(40, 62, 106, 110); cut(44, 50, 106, 110);
  stone(24, 81); stone(80, 87); stone(36, 95); stone(72, 103);
  ent('holdfast', 30, 81, { face: -1 }); ent('holdfast', 80, 87, { face: -1 });
  ent('holdfast', 40, 95, { face: 1 }); ent('holdfast', 84, 103, { face: -1 });
  ent('holdfast', 56, 105, { face: 1 });
  ent('angler', 56, 92); ent('eel', 42, 100); ent('netter', 90, 87, { face: -1 });
  ent('urchin', 46, 106); ent('jelly', 54, 105); ent('urchin', 36, 106);   /* (54 was a row down inside the shelf) */
  ent('sailor', 34, 81, { face: -1 }); ent('crab', 70, 87, { face: 1 }); ent('scout', 46, 95, { face: -1 });
  ent('tideguard', 76, 103, { face: -1 }); ent('siren', 24, 90); ent('petrel', 60, 76);
  ent('eel', 84, 96); ent('angler', 18, 100); ent('netter', 50, 103, { face: 1 });
  ent('boarder', 24, 81, { face: 1 }); ent('boarder', 88, 87, { face: -1 });
  ent('wight', 44, 95, { face: -1 }); ent('wight', 68, 103, { face: 1 });
  ent('lamprey', 72, 92); ent('angler', 30, 108); ent('siren', 88, 98);
  ent('check', 76, 87); ent('check', 66, 103);
  ent('sign', 66, 87, { text: 'THE BEDS NEVER MOVE. THEY ONLY HAVE TO BE WHERE YOU WERE GOING.' });
  coins([16, 81], [26, 81], [34, 81], [68, 87], [76, 87], [86, 87], [24, 95], [32, 95], [44, 95], [64, 103], [78, 103], [90, 103]);
  ent('deco', 18, 81, { kind: 'kelpTall' }); ent('deco', 92, 87, { kind: 'coralFan' });
  ent('deco', 28, 95, { kind: 'brainCoral' }); ent('deco', 84, 103, { kind: 'kelpTall' });
  rope(10, 76, 110); ent('silver', 30, 78);
  ent('stray', 50, 95, { kind: 'coffer' });
  /* THE FOREST: strands off every deck and the bed, swaying, and the fish that live in it. The bladders at the tops of
     some of them are full of air, and a blade opens them. */
  for (const [x, y, h, b] of [[8, 112, 7], [15, 112, 9], [22, 112, 6], [26, 112, 8, 1], [34, 112, 5], [54, 112, 6], [66, 112, 5], [78, 112, 6], [92, 112, 7], [100, 112, 9, 1],
    [41, 105, 6, 1], [56, 105, 8, 1], [60, 105, 5], [70, 103, 9, 1], [80, 103, 6], [92, 103, 7], [24, 95, 8], [34, 95, 6], [48, 95, 7],
    [66, 87, 9], [90, 87, 8, 1], [75, 87, 5], [16, 81, 6], [28, 81, 7], [38, 81, 5]]) kelp(x, y, h, b);
  clam(58, 105); clam(16, 112); clam(96, 112);
  pocket(64, 72, 107, 108); pocket(84, 92, 107, 108);               /* and air caught under the hull of the lowest ship */
  ent('sign', 64, 103, { text: 'KELP BLADDERS HOLD AIR. CUT ONE AND BREATHE WHAT COMES OUT.' });
  ent('sign', 60, 105, { text: 'A SHUT CLAM KEEPS A BREATH. STRIKE IT OPEN AND SWIM INTO IT.' });
  vent(25, 112, 10);
  fish(50, 86, 7, '#ffd36b'); fish(30, 106, 6, '#bfe6f5'); fish(84, 96, 8, '#ff9a5c'); fish(14, 90, 5, '#bfe6f5');
  zone('THE KELP FOREST', 6, 105, 74, 113, [90, 180, 90], 0.12);
  darkZones.push({ x0: 6 * TS, x1: 106 * TS, y0: 74 * TS, y1: 113 * TS, dark: 0.14 });   /* under the canopy: the bladders are the lights */

  cut(30, 38, 113, 113);                                           /* and down into the garden */

  // ---- 4. THE CORAL GARDEN (rows 114-150). One claw, and its whole job is your hands - in the only colour down here. ----
  cut(6, 105, 114, 150);
  rock(0, 5, 114, 150); rock(106, 111, 114, 150);
  ent('check', 86, 121); air(86, 118); air(30, 130); air(76, 144);
  ent('sign', 82, 121, { text: 'THE PRISE WANTS YOUR STONE. KILL IT BEFORE YOU PICK ONE UP.' });
  deck(58, 98, 122); hull(59, 97, 118, 121);
  deck(14, 52, 130); hull(15, 51, 126, 129);
  deck(56, 94, 138); hull(57, 93, 134, 137);
  deck(16, 54, 146); hull(17, 53, 142, 145);
  stone(70, 121); stone(30, 129); stone(66, 137); stone(28, 145, 'chain');
  ent('prise', 84, 121, { face: -1 }); ent('prise', 26, 129, { face: 1 });
  ent('prise', 78, 137, { face: -1 }); ent('prise', 40, 145, { face: 1 });
  ent('holdfast', 44, 129, { face: -1 }); ent('holdfast', 46, 145, { face: -1 });
  ent('angler', 96, 134); ent('eel', 20, 140); ent('crab', 90, 122, { face: -1 });
  ent('prise', 62, 121, { face: 1 }); ent('prise', 66, 137, { face: -1 });
  ent('sailor', 90, 137, { face: -1 }); ent('scout', 20, 129, { face: 1 }); ent('netter', 50, 145, { face: -1 });
  ent('tideguard', 30, 145, { face: 1 }); ent('siren', 72, 130); ent('puffer', 58, 150);   /* on the shelf, not a row inside it */
  ent('eel', 82, 126); ent('petrel', 36, 116); ent('crab', 24, 145, { face: 1 });
  ent('wight', 34, 129, { face: 1 }); ent('wight', 86, 121, { face: -1 });
  ent('boarder', 70, 121, { face: 1 }); ent('boarder', 26, 145, { face: 1 });
  ent('marine', 78, 129, { face: -1 }); ent('bosun', 74, 137, { face: 1 });
  ent('cutlass', 22, 129, { face: 1 }); ent('cutlass', 48, 145, { face: -1 });
  ent('prise', 92, 121, { face: -1 }); ent('tideguard', 62, 137, { face: -1 }); ent('tideguard', 44, 145, { face: -1 });
  ent('check', 40, 129); ent('check', 76, 137);
  ent('sign', 30, 129, { text: 'THE PRISE STEAL WHAT YOU CARRY. DOWN HERE THAT IS WORSE THAN BLOOD.' });
  coins([62, 121], [74, 121], [88, 121], [20, 129], [34, 129], [46, 129], [60, 137], [72, 137], [86, 137], [22, 145], [36, 145], [48, 145]);
  ent('deco', 66, 121, { kind: 'wreckStern' }); ent('deco', 24, 129, { kind: 'figurehead' });
  ent('deco', 88, 137, { kind: 'anchor' }); ent('deco', 44, 145, { kind: 'seaChest' });
  ent('silver', 92, 118);
  ent('stray', 20, 145, { kind: 'coffer' });
  rock(10, 96, 151, 157); cut(14, 22, 151, 157);                    /* the last throat, down into the drop */
  /* THE GARDEN'S COLOUR, and its breath: a lip on each wall with a clam on it, and a vent on the floor by the throat */
  for (const [x, y, v] of [[60, 121, 0], [80, 121, 2], [96, 121, 1], [16, 129, 1], [50, 129, 0], [58, 137, 2], [92, 137, 0], [18, 145, 2], [52, 145, 1], [30, 150, 0], [60, 150, 1], [86, 150, 2], [44, 150, 2], [74, 150, 0]]) prop('coral', x, y, { v });
  rock(6, 10, 122, 123); clam(8, 121); rock(100, 105, 142, 143); clam(103, 141); prop('coral', 101, 141, { v: 1 });
  vent(26, 150, 7); clam(70, 150); vent(96, 150, 12); clam(48, 150);
  fish(40, 136, 6, '#ff9ad0'); fish(76, 128, 6, '#ffd36b');
  zone('THE CORAL GARDEN', 6, 105, 114, 157, [240, 120, 170], 0.08);

  // ---- 5. THE GLOWING DROP (rows 158-186). Black water, and the only lights in it are alive. ----
  cut(8, 103, 158, 198);
  rock(8, 24, 166, 167); rock(8, 22, 174, 175); rock(8, 16, 182, 183);   /* shelves down the west wall, each one keeping a breath */
  rock(88, 103, 170, 171); rock(96, 103, 180, 181);
  pocket(48, 60, 158, 159); pocket(74, 86, 158, 159);               /* the garden's floor is the drop's roof, and it keeps air under it */
  ent('check', 12, 165);
  ent('sign', 10, 165, { text: 'THE GLOWING DROP. THE JELLIES ARE THE ONLY LIGHT: STRIKE ONE AND IT BURNS BRIGHT.' });
  clam(20, 165); wreck(12, 173); vent(21, 173, 6); clam(12, 181); clam(98, 169); vent(100, 179, 8);
  for (const [x, y, h] of [[40, 164, 0], [60, 170, 0], [76, 161, 0], [28, 179, 1], [50, 183, 0], [84, 176, 1], [66, 186, 1], [94, 163, 0], [34, 170, 0], [20, 188, 1]]) jelly(x, y, h);
  ent('angler', 30, 172); ent('angler', 70, 176); ent('angler', 56, 162); ent('lamprey', 44, 178); ent('eel', 84, 166);
  ent('siren', 62, 182); ent('jelly', 14, 173); ent('urchin', 92, 169);   /* over the rock band, not in it */
  coins([16, 165], [22, 165], [10, 173], [14, 173], [10, 181], [26, 178], [40, 176], [60, 174], [80, 170], [100, 169], [98, 179]);
  zone('THE GLOWING DROP', 8, 103, 158, 186, [130, 100, 210], 0.12);
  darkZones.push({ x0: 8 * TS, x1: 104 * TS, y0: 158 * TS, y1: 187 * TS, dark: 0.22 });
  for (const [x, y, v] of [[16, 165, 0], [23, 165, 2], [18, 173, 1], [14, 181, 2], [92, 169, 1], [101, 169, 0], [99, 179, 2]]) prop('coral', x, y, { v, glow: true });   /* the shelves grow their own light */

  // ---- 6. THE LEVIATHAN'S BED (rows 187-198). It died on the vents, and they are still going under its ribs. ----
  rock(8, 30, 194, 198); rock(31, 38, 196, 198);                    /* the west end of the bed banks up */
  ent('check', 14, 193);
  ent('sign', 16, 193, { text: 'IT DIED ON THE VENTS. THEIR HEAT THROWS YOU UP; THEIR BUBBLES ARE STILL AIR.' });
  vent(22, 193, 8); clam(27, 193); wreck(35, 195);
  for (let x = 42; x <= 86; x += 4) prop('vertebra', x, 198);
  for (const [x, v] of [[44, 0], [52, 1], [60, 0], [68, 1], [76, 0], [84, 1]]) { prop('rib', x, 198, { v }); set(x + (v ? -1 : 1), 195, T.ONEWAY); }
  prop('skull', 93, 198); pocket(89, 94, 196, 198);                /* and there is still air in the dome of its head */
  vent(48, 198, 9, true); vent(64, 198, 10, true); vent(80, 198, 9, true); clam(56, 198); wreck(72, 198); vent(100, 198, 7);
  ent('crab', 40, 198, { face: 1 }); ent('crab', 88, 198, { face: -1 }); ent('wight', 58, 198, { face: -1 }); ent('eel', 70, 190);
  ent('check', 60, 198);
  coins([44, 194], [52, 194], [60, 194], [68, 194], [76, 194], [84, 194], [96, 196], [102, 196]);
  zone('THE LEVIATHAN\'S BED', 8, 103, 187, 198, [240, 130, 70], 0.12);
  darkZones.push({ x0: 8 * TS, x1: 104 * TS, y0: 187 * TS, y1: 199 * TS, dark: 0.2 });

  // ---- 7. THE COLD ROAD (x 104-157, rows 188-198). The trench drains east along it, to his wall. ----
  cut(104, 157, 188, 198);
  sea(104, 301, 140, 199);
  for (const x of [112, 123, 134]) { cut(x, x + 3, 185, 187); pocket(x, x + 3, 185, 187); }   /* niches up into the ice, and air in every one */
  D.currents.push({ x0: 104, x1: 145, y0: 190, y1: 198, fx: 58, fy: 0, kind: 'cold' });   /* the bottom of the road runs; under the ice it is slack */
  D.rime.push([104, 157, 198]); D.icicles.push([104, 111, 188], [116, 122, 188], [127, 133, 188], [138, 157, 188]);
  ent('check', 106, 198);
  ent('sign', 108, 198, { text: 'THE COLD ROAD RUNS TO HIS CASTLE. TO GO BACK AGAINST IT, KEEP UP UNDER THE ICE.' });
  ent('eel', 118, 193); ent('eel', 140, 192); ent('angler', 128, 195); ent('urchin', 116, 198); ent('jelly', 138, 198);
  coins([114, 186], [125, 186], [136, 186], [120, 196], [130, 196], [142, 196]);
  zone('THE COLD ROAD', 104, 157, 184, 198, [140, 200, 245], 0.16);
  darkZones.push({ x0: 104 * TS, x1: 158 * TS, y0: 184 * TS, y1: 199 * TS, dark: 0.24 });

  // ---- 8. THE DROWNED WARD (x 146-212, rows 156-198). His outer yard, and his face in every corner of it. ----
  // the gatehouse on the near side of the wall: a stair full of water up to the wall-walk, and the long way in
  cut(146, 157, 164, 187);
  for (const [x0, x1, y] of [[146, 150, 184], [153, 157, 180], [146, 150, 176], [153, 157, 172], [146, 150, 168]]) for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY);
  pocket(146, 157, 164, 165); wreck(148, 175); clam(148, 183);
  cut(158, 161, 164, 167);                                          /* the breach in the wall-walk */
  // THE WATER GATE: a portcullis in the curtain, wound up by the wheel beside it. The short way; the stair is always there.
  cut(158, 161, 192, 198); for (let y = 192; y <= 198; y++) set(160, y, T.PORT);
  D.gates.push({ wheel: [154, 198], col: 160, y0: 192, y1: 198 });
  ent('check', 150, 198);
  ent('sign', 152, 198, { text: 'HIS WATER GATE. STRIKE THE WHEEL THREE TIMES, OR TAKE THE GATEHOUSE STAIR.' });
  cut(162, 212, 160, 198);
  rock(162, 172, 160, 163); pocket(158, 172, 164, 165);             /* the roof of the wall-walk, and the air under it */
  cut(186, 196, 156, 159); pocket(186, 196, 156, 158);              /* a dome over the yard that never let its air go */
  rock(162, 181, 180, 181); rock(168, 169, 182, 189); rock(174, 175, 182, 189); rock(180, 181, 182, 189);   /* the cloister: spandrels off its roof, and its arches open on to the yard under them */
  pocket(162, 167, 182, 183); pocket(170, 173, 182, 183); pocket(176, 179, 182, 183);
  rock(193, 201, 197, 198); vent(197, 196, 10);                     /* his fountain, and it still breathes */
  rock(200, 212, 176, 177); pocket(201, 212, 178, 179);             /* a gallery off the keep wall, and the air kept under it */
  ent('wight', 206, 175, { face: -1 }); coins([203, 175], [209, 175]);
  prop('statue', 188, 198); prop('statue', 206, 198, { v: 1 }); prop('statue', 171, 179);
  prop('brazier', 164, 179); prop('brazier', 191, 198); prop('brazier', 210, 198);
  D.banners.push({ x: 178, y: 160 }, { x: 204, y: 160 }, { x: 166, y: 164 });
  clam(184, 198); clam(209, 198);
  ent('check', 165, 179); ent('check', 184, 198);
  ent('sign', 167, 179, { text: 'HIS OWN PEOPLE PUT HIM UP IN EVERY YARD. THE AIR IS UNDER THE CLOISTER ROOF.' });
  ent('watch', 178, 198, { face: -1 }); ent('watch', 203, 198, { face: -1 }); ent('wight', 165, 198, { face: 1 }); ent('wight', 190, 198, { face: 1 });
  ent('tideguard', 173, 179, { face: 1 }); ent('siren', 196, 172); ent('angler', 205, 182); ent('eel', 152, 178); ent('watch', 208, 198, { face: -1 });
  coins([150, 183], [155, 179], [150, 175], [155, 171], [150, 167], [164, 179], [172, 179], [178, 179], [190, 194], [202, 198], [191, 158], [160, 166]);
  rock(213, 216, 150, 198); cut(213, 216, 192, 198);               /* the keep's wall, and its door */
  facades.push([162, 212, 150, 198, 'curtain', { sea: true }], [182, 185, 160, 198, 'tower', { sea: true, arch: [192, 198] }], [146, 157, 150, 187, 'tower', { sea: true, lit: false }]);
  D.masonry.push([140, 303, 140, 203]);
  zone('THE DROWNED WARD', 146, 212, 150, 198, [120, 175, 150], 0.10);
  darkZones.push({ x0: 146 * TS, x1: 213 * TS, y0: 150 * TS, y1: 199 * TS, dark: 0.22 });

  // ---- 9. THE GREAT HALL (x 217-250, rows 166-198). Vaulted, and every vault still holding a breath. ----
  cut(217, 250, 170, 198);
  for (const [x0, x1] of [[220, 225], [231, 237], [243, 248]]) { cut(x0, x1, 166, 169); pocket(x0, x1, 166, 168); D.shafts.push({ x: (x0 + x1) / 2, y0: 166, y1: 198, w: 3, lean: 0.28 }); }
  rock(227, 228, 188, 198); rock(239, 240, 184, 198);              /* the columns that are left */
  vent(223, 198, 8, false, true); vent(235, 198, 8, false, true);   /* the drains in his floor breathe the same as any vent */
  prop('chandelier', 231, 198); prop('statue', 221, 198); prop('statue', 245, 198, { v: 1 }); prop('brazier', 233, 198); prop('brazier', 243, 198);
  D.banners.push({ x: 229, y: 170 }, { x: 241, y: 170 }, { x: 226, y: 170 });
  ent('check', 218, 198);
  ent('watch', 224, 198, { face: -1 }); ent('watch', 244, 198, { face: -1 }); ent('wight', 236, 198, { face: -1 }); ent('tideguard', 228, 187, { face: 1 }); ent('siren', 236, 176); ent('wight', 219, 198, { face: 1 }); ent('tideguard', 240, 183, { face: -1 });
  coins([222, 166], [234, 166], [246, 166], [228, 187], [240, 183], [226, 196], [238, 196]);
  facades.push([217, 250, 166, 198, 'curtain', { sea: true }]);
  zone('THE GREAT HALL', 217, 250, 166, 198, [210, 175, 110], 0.08);
  darkZones.push({ x0: 217 * TS, x1: 251 * TS, y0: 166 * TS, y1: 199 * TS, dark: 0.22 });
  cut(251, 252, 193, 198); vent(250, 198, 7, false, true);          /* his door, and a drain breathing at it */
  ent('check', 249, 198);
  ent('sign', 247, 198, { text: 'THE THRONE ROOM. HE SWIMS NOW: PUT A PILLAR BETWEEN YOU AND HIS CHARGE.' });

  // ---- THE THRONE ROOM (x 253-293, rows 164-198). All of it, and the man it was going to. ----
  // Mostly water, because he swims and so do you; footing on the dais, the pillar stumps and what is left of his galleries;
  // air in the three vaults and in the bell by his throne, so breath is a pressure and not a sentence.
  cut(253, 293, 168, 198);
  for (const [x0, x1] of [[256, 262], [270, 276], [284, 290]]) { cut(x0, x1, 164, 167); pocket(x0, x1, 164, 166); D.shafts.push({ x: (x0 + x1) / 2, y0: 164, y1: 198, w: 4, lean: 0.3 }); }
  rock(274, 290, 196, 198); rock(277, 287, 194, 195); rock(280, 284, 192, 193);   /* the dais */
  rock(260, 261, 186, 198); rock(267, 268, 191, 198);              /* broken pillars: his charge stops on them */
  rock(265, 266, 168, 174);                                         /* and the stump of one hanging from the vault */
  for (let x = 253; x <= 257; x++) set(x, 181, T.ONEWAY); for (let x = 289; x <= 293; x++) set(x, 178, T.ONEWAY);   /* his galleries, broken off at the wall */
  prop('throne', 282, 191); air(289, 195);
  /* THE AIR IN HIS HALL. Three vaults over your head and a bell at his elbow was air in the CORNERS: you left the fight to breathe and
     came back to it. So the room breathes where the fight is - a column off the floor between his two pillars, a crack in the stump of
     the left one, a bell wreck on the step of his dais and another on the broken gallery. Every one of them is somewhere he can reach
     you: the floor column stands in his SLAM, the stump is where his charge ends, the dais step is his own ground. Breathing is a
     position now and not a corner - and he can take them away (DROWNED BREATH, updateDrownedKing). */
  vent(264, 198, 12); vent(260, 185, 8); wreck(276, 195); wreck(290, 177);
  prop('chandelier', 271, 198); prop('statue', 291, 177); prop('brazier', 275, 195);
  D.banners.push({ x: 268, y: 168 }, { x: 280, y: 168 }, { x: 254, y: 168 });
  stone(257, 198); stone(292, 198, 'chest'); clam(263, 198); vent(254, 198, 7, false, true);
  ent('drownedking', 282, 191, { face: -1 });
  cut(294, 295, 193, 198); cut(296, 300, 193, 198);
  ent('gate', 299, 198);
  facades.push([253, 293, 164, 198, 'curtain', { sea: true }], [279, 285, 168, 191, 'tower', { sea: true }]);
  zone('THE THRONE ROOM', 253, 300, 164, 198, [120, 200, 220], 0.10);
  darkZones.push({ x0: 253 * TS, x1: 301 * TS, y0: 164 * TS, y1: 199 * TS, dark: 0.12 });

  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 6, y: 27 }, pools, falls: [], moversExtra: movers, interiors, airRooms, darkZones, facades, deep: D,
    ballast: true, dark: 0.08, edgeLit: 'rgba(200,236,240,0.6)',   /* the readability pass: the open water sat under the 20 L* a walkway needs to read, so less black in the zones, and a cold lit lip on every edge you can stand on */
    duskStart: -1, duskLen: 1, music: 'trench', night: true, glowNight: true, nightA: 0.1,
    tall: { top: 20 * TS, bottom: 199 * TS, col: '6,16,28', deepest: 0.18 },   /* the deeper you go the less there is, and down here it is blue-black, not the canopy's green */
    quest: { n: 3, item: 'coffer', name: 'TRIBUTE COFFERS', npc: 'squire', done: 'THIRTY YEARS OF IT, AND NONE OF IT EVER GOT THERE', reward: 'relic', relic: 'gauntlet' },
    palette: { set: 'reef', sky: 'drowned', far: 'sea', mid: 'wrecks', near: 'reef', dress: 'reef', haze: 'rgba(10,24,34,0.34)', murkCol: '#265260', murkLit: '#4a949c',   /* (the readability pass: the wrecks behind the water are the open water's own colour, and at '#183440' they measured L* 19 under the washes) */
      grass: '#2e4a4a', grassL: '#3e5e5c', grassD: '#1c3030', dirt: '#22343c', dirtL: '#2e444c', dirtD: '#14222a',
      canopy: ['#0c1820', '#122230', '#182c3c', '#1e3648'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'deep' }],
    arena: { x0: 252 * TS, x1: 294 * TS, floor: 199 * TS, trigger: 256 * TS, wallL: 252, wallR: 294, boss: 'drownedking', music: 'boss3', tint: '#123040', tintA: 0.16, fx: 'motes', y0: 164 * TS, y1: 199 * TS, throne: [282 * TS + 8, 192 * TS] },
  };
}

// ============================================================================================
// LEVEL 11 - HIGHCROWN, the Goblin Queen's castle.
// Stormhold's long bridge ends at her drawbridge. Everything the goblins have left is in here: the
// Outer Ward under the walls, her smith's armoury out in the bailey, the Keep climbed floor by floor - the entrance
// hall, the kitchens, her throne gallery, the chapel - and at the top her apartments, her hall, her throne, and her roof.
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
  ent('sign', 6, 63, { text: 'STRIKE THE WINCH TO HOLD THE GATE UP A FEW BREATHS. IT DROPS ON WHAT IS UNDER.' });
  ent('check', 22, 63);
  // the wall walk, archers on it, and the steps up to it
  plat(22, 52, 53);
  stair([[30, 62], [34, 60], [38, 58], [42, 56], [46, 54]]);
  ent('archer', 60, 51, { face: -1 }); ent('javelin', 72, 51, { face: -1 });
  ent('sign', 50, 51, { text: 'A SPEAR THAT MISSES YOU AND HITS THE WALL STAYS THERE A WHILE. STAND ON IT.' });
  ent('stray', 26, 51, { kind: 'seal' });
  // the gatehouse top, off the wall walk: a silver among the crenels
  plat(22, 50, 3); plat(22, 48, 3); plat(22, 46, 3); coins([13, 43], [16, 43], [19, 43]); // (its silver went to the watchtower on the road up)
  // the courtyard: stables, a kennel, a well, the barracks door
  ent('deco', 36, 63, { kind: 'cart' }); ent('deco', 42, 63, { kind: 'barrels' }); ent('deco', 76, 63, { kind: 'well' }); ent('deco', 86, 63, { kind: 'spearRack' });
  ent('deco', 56, 63, { kind: 'banner', v: 0 }); ent('torch', 48, 63); ent('torch', 80, 63);
  ent('hound', 64, 63, { face: -1 }); ent('soldier', 28, 63, { face: 1 });
  ent('sentry', 66, 63, { section: 'ward', range: 8, face: 1 });
  ent('bell', 84, 63, { section: 'ward' });
  ent('sign', 26, 63, { text: 'CATCH THE SENTRY BEFORE HE RINGS THE BARRACKS BELL, OR BREAK THE BELL.' });
  plat(91, 55, 6); ent('weight', 94, 55, { len: 6 }); // a counterweight over the barracks door (low enough to cut with a jump)
  ent('deco', 95, 63, { kind: 'cabin' });
  // the inner wall, its gate open until the alarm drops it
  block(101, 103, 44, 57);
  ent('check', 106, 63);
  // the keep door: a second winch
  port(121, 58, 63); ent('winch', 116, 63, { gate: 121, gy0: 58, gy1: 63, hold: 5 });
  ent('sign', 110, 63, { text: 'THE KEEP: HALL, KITCHENS, HER GALLERY, CHAPEL, AND HER ROOMS AT THE TOP.' });
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
  ent('sign', 134, 63, { text: 'HER WATCH WALKS THE HALL. THE GATE BY THE STAIR DROPS WHEN A BELL RINGS.' });

  // F1. THE KITCHENS (floor 52)
  ent('check', 196, 51);
  ent('brazier', 186, 51); ent('brazier', 164, 51); ent('deco', 176, 51, { kind: 'barrels' }); ent('deco', 150, 51, { kind: 'wares', v: 0 });
  ent('hearthgob', 190, 51, { face: -1 }); ent('hearthgob', 168, 51, { face: -1 }); ent('hearthgob', 146, 51, { face: 1 });
  ent('folk', 180, 51, { door: 206 }); ent('folk', 156, 51, { door: 124, alt: true });
  ent('brute', 160, 51, { face: 1 }); plat(157, 43, 6); ent('weight', 160, 43, { len: 6 }); // the meat hook's counterweight, over the cook's brute
  ent('gobmage', 152, 51, { face: -1 });   /* a composed pair: the reader keeps to the larder side of the cook's brute, so closing on one crosses the other's ground */
  stair([[184, 50, 3], [180, 48, 3], [175, 46, 4]]); ent('stray', 176, 45, { kind: 'seal' }); // the larder's high shelf
  air(125, 128, 40, 41); lid(125, 128, 40);    // the stair up to her gallery
  stair([[138, 50], [134, 48], [130, 46], [126, 44], [125, 42]]);
  ent('check', 142, 51);
  ent('deco', 128, 51, { kind: 'barrels' }); coins([126, 51], [129, 51], [132, 51]); // the cold larder in the corner
  ent('sign', 144, 51, { text: 'UP THE STAIR IS HER GALLERY. HER KNIGHTS HOLD THE FLOOR, HER BOWS THE BALCONIES.' });

  // F2. HER THRONE GALLERY (floor 40). Where her court waited on her: the chair of state on its dais, a balcony at each end for
  // her bows over a floor her knights hold, and the queens before her on the walls. (This floor was the armoury. The smith and
  // everything he fights with went out into the bailey, halfway up the castle - see THE ARMOURY in highcrownWhole.)
  stair([[131, 38, 3], [135, 36, 3]]); plat(139, 34, 20);           // the west balcony, up from the stair head
  plat(172, 34, 13); stair([[186, 36, 3], [190, 38, 3]]);           // the east balcony, and its steps down to the shaft
  block(163, 168, 38, 39); ent('deco', 165, 37, { kind: 'throne' }); // her chair of state, between the two
  ent('deco', 160, 39, { kind: 'idol', v: 0 }); ent('deco', 171, 39, { kind: 'idol', v: 1 });
  ent('soldier', 146, 39, { face: -1 }); ent('heavy', 156, 39, { face: -1 }); ent('heavy', 176, 39, { face: -1 }); ent('pike', 184, 39, { face: -1 });
  ent('javelin', 150, 33, { face: -1 }); ent('archer', 178, 33, { face: -1 });
  for (const x of [130, 152, 174, 196]) ent('torch', x, 39);
  for (const x of [148, 181]) ent('deco', x, 29, { kind: 'hallWindow' });
  ent('deco', 142, 39, { kind: 'banner', v: 1 }); ent('deco', 192, 39, { kind: 'banner', v: 0 });
  coins([142, 33], [146, 33], [176, 33], [180, 33]);
  air(200, 205, 21, 25); lid(200, 205, 20);    // up through the thick floor to the chapel (cut the shaft BEFORE the steps go in it)
  stair([[200, 38, 3], [203, 36, 3], [200, 34, 3], [203, 32, 3], [200, 30, 3], [203, 28, 3], [200, 26, 3], [203, 24, 3], [200, 22, 3]]);

  // F3. THE CHAPEL (floor 20) - the bell tower's own bell, two of the watch, the key on the altar
  ent('check', 202, 19);
  port(206, 14, 19); ent('lockgate', 206, 19, { needs: 'brass', h: 6 });
  ent('sign', 198, 19, { text: 'THE CHAPEL. THE KEY TO HER ROOMS IS ON THE ALTAR. THIS BELL IS THE LOUDEST.' });
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
  for (const x of [216, 221, 226, 231, 235]) ent('support', x, 19, { top: 14 });
  for (const x of [212, 224, 236]) ent('deco', x, 13, { kind: 'hallWindow' });
  ent('deco', 219, 19, { kind: 'banner', v: 0 }); ent('deco', 233, 19, { kind: 'banner', v: 1 });
  for (const x of [210, 229]) ent('torch', x, 19);
  for (const x of [219, 231, 245]) ent('weight', x, 10, { len: 3, lamp: true, hang: true, gq: true }); // her chandeliers: when she stands, she throws at them
  ent('sign', 209, 19, { text: 'HER PLATE TURNS BLADES. BREAK A PILLAR WITH HER UNDER IT: PINNED, SHE BLEEDS.' });
  // the roof: three peaks with an iron rod on each, and a step up to each
  block(214, 218, 4, 7); block(228, 232, 4, 7); block(242, 246, 4, 7);
  plat(211, 6, 3); plat(219, 6, 3); plat(225, 6, 3); plat(233, 6, 3); plat(239, 6, 3); plat(247, 6, 3);
  ent('rod', 216, 3); ent('rod', 230, 3); ent('rod', 244, 3);

  // FOUR FLOORS, FOUR ROOMS. The whole keep was drawn with her throne room's wall, so you came up out of the
  // armoury into what looked like her hall and the Queen seemed to be standing right behind the smith. Each
  // floor wears its own room now. (The armoury's iron went out to the bailey with him; this floor hangs her queens.)
  const interiors = [[124, 206, 54, 63, 'guard'], [124, 206, 42, 53, 'kitchen'], [124, 206, 26, 41, 'gallery'],
    [124, 206, 8, 25, 'chapel'], [208, 251, 8, 19, 'royal']];
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 1, y: 63 }, pools: [], falls: [], moversExtra: [], interiors,
    reachExact: true, // the carts are the Forgemaster's props, not a way around the castle
    duskStart: -1, duskLen: 1, music: 'highcrown', night: true, glowNight: true, nightA: 0.3,   /* (L.mini is laid with his armoury, in highcrownWhole) */
    quest: { n: 3, item: 'seal', name: 'ROYAL SEALS', npc: 'squire', done: 'HER ORDERS MEAN NOTHING NOW', reward: 'relic', relic: 'banner' },
    palette: { sky: 'crag', far: 'crag', mid: 'crag', near: 'crag', dress: 'none', ledges: 'beam', haze: 'rgba(150,140,190,0.14)',   /* three hundred ledges inside a castle, and every one of them was a log off the forest floor */
      grass: '#8a8a98', grassL: '#a8a8b8', grassD: '#5a5a66', dirt: '#4a4a58', dirtL: '#5e5e6c', dirtD: '#32323c',
      canopy: ['#2a2a38', '#3a3a4a', '#4a4a5c', '#5a5a6e'] },
    weather: [{ x0: 0, x1: 123 * TS, kind: 'snow' }], ambient: [{ x0: 0, x1: 123 * TS, kind: 'wind' }],
    arena: { x0: 208 * TS, x1: 251 * TS, floor: 20 * TS, trigger: 224 * TS, wallL: 207, wallR: 252, boss: 'gqueen', music: 'queen', tint: '#5a2a7a', tintA: 0.08, fx: 'dust',
      roof: 8 * TS, gallery: { row: 14, x0: 213, x1: 236 }, hole: { x0: 221, x1: 224, y0: 8, y1: 9 }, rubble: [[216, 17, 4], [221, 15, 4], [216, 13, 4], [221, 11, 4], [221, 9, 4]] },
  };
}

// the castle's own second pass (a watch in the ward, the walk over the keep roof, the far corners paid), written
// against the castle before it grew: it runs first, then the Scaffolds and the mountain road are opened around it
const crownReview = L => { const R = rv(L); R.ent('check', 62, 63);
    for (const [t, x, y, f] of [['soldier', 40, 63, -1], ['javelin', 76, 63, 1], ['heavy', 110, 63, -1], ['soldier', 140, 63, 1], ['javelin', 166, 63, -1], ['soldier', 190, 63, -1], ['hearthgob', 150, 51, 1], ['hearthgob', 186, 51, -1], ['javelin', 150, 19, 1]]) R.ent(t, x, y, { face: f });
    R.plat(149, 12, 3); R.plat(151, 10, 3);
    for (let x = 151; x <= 153; x++) { R.tile(x, 9, T.AIR); R.tile(x, 8, T.ONEWAY); }
    for (let x = 194; x <= 196; x++) { R.tile(x, 9, T.AIR); R.tile(x, 8, T.ONEWAY); }
    R.ent('sign', 156, 7, { text: 'THE LEADS. THE HATCH AT THE FAR END DROPS YOU INTO THE CHAPEL: DOWN AND JUMP.' });
    R.ent('deco', 170, 7, { kind: 'banner', v: 1 }); R.ent('deco', 182, 7, { kind: 'barrels' });
    // (the armoury gantry's ledges went out to the bailey with the armoury: they are laid in THE ARMOURY, below)
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
  /* AND HIS BEAM. beamL/beamR were never shifted, so once the castle grew round him they still said columns 142-182 while his armoury
     stood at 556-628: every time he took the beam he was clamped four hundred columns away, hanging at beam height outside his room. */
  if (R.mini && R.mini.beamL !== undefined) R.mini = { ...R.mini, beamL: shp(R.mini.beamL), beamR: shp(R.mini.beamR) };
  if (R.arena) { const A = { ...R.arena };
    if (A.gallery) A.gallery = { ...A.gallery, x0: sh(A.gallery.x0), x1: sh(A.gallery.x1) };
    if (A.hole) A.hole = { ...A.hole, x0: sh(A.hole.x0), x1: sh(A.hole.x1) };
    if (A.rubble) A.rubble = A.rubble.map(([x, y, w]) => [sh(x), y, w]);
    R.arena = A; }
  if (R.masonry) R.masonry = R.masonry.map(([x0, x1, y0, y1]) => [sh(x0), sh(x1), y0, y1]);   /* the laid stone and the wall faces behind the play: new to the castle, so grow() cannot know them */
  if (R.facades) R.facades = R.facades.map(f => { const o = f.slice(); o[0] = sh(f[0]); o[1] = sh(f[1]); return o; });
  if (R.tints) R.tints = R.tints.map(([x0, x1, c, a]) => [sh(x0), sh(x1), c, a]);
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
    ent('sign', 106, 63, { text: 'THE PIT HAS NO BOTTOM. SCAFFOLD, BUCKET, CHAIN, GANTRY, THEN THE HOIST.' });
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
    ent('sign', 18, 95, { text: 'HIGHCROWN IS UP THIS ROAD. SENTRIES RUN FOR THEIR BELLS: SEE THEM FIRST.' });
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
    M.R.interiors = (M.R.interiors || []).concat([[79, 92, 68, 71, 'guard']]);
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
    ent('key', 228, 63, { kind: 'brass' }); ent('key', 380, 63, { kind: 'iron' }); ent('key', 384, 19, { kind: 'bone' });
    ent('sign', 232, 63, { text: 'THE WARD GATE IS BARRED AND THE KEY IS ON ONE OF THEM. THEY ARE NOT CARRYING IT WELL.' });
    ent('heavy', 236, 63, { face: -1 }); ent('soldier', 230, 63, { face: 1 }); ent('javelin', 224, 63, { face: -1 });
    ent('soldier', 384, 63, { face: -1 }); ent('javelin', 376, 63, { face: 1 }); ent('soldier', 388, 63, { face: -1 });
    /* THE BONE KEY IS EAST OF ITS GATE. The chapel is entered from the armoury shaft at its east end, so the room before the
       bone gate is the chapel's east half. The key and the three carrying it stood west of the gate they open, with the altar's
       key and the choir loft's seal: none of the three could ever be had (tools/keys.mjs floods it) */
    ent('javelin', 378, 19, { face: 1 }); ent('soldier', 382, 19, { face: 1 }); ent('heavy', 392, 19, { face: 1 });

    // ---- THE ROAD UP: it was a long empty walk, and it is her road, so it is watched ----
    ent('deco', 186, 63, { kind: 'tent' }); ent('deco', 191, 63, { kind: 'tent' }); ent('brazier', 183, 63);
    ent('deco', 196, 63, { kind: 'barrels' }); ent('deco', 179, 63, { kind: 'spearRack' }); ent('deco', 200, 63, { kind: 'cart' });
    ent('sign', 177, 63, { text: 'THE ROAD PICKET. A POT ON THE FIRE, A GAME HALF PLAYED, AND NOBODY WATCHING.' });
    ent('soldier', 188, 63, { face: 1 }); ent('javelin', 193, 63, { face: -1 }); ent('soldier', 198, 63, { face: -1 });
    coins([181, 62], [187, 62], [192, 62], [197, 62], [202, 62]);
    ent('deco', 208, 63, { kind: 'bones' }); ent('hound', 206, 63, { face: 1 }); ent('hound', 212, 63, { face: -1 });
    coins([205, 62], [209, 62], [213, 62]);
    ent('soldier', 218, 63, { face: -1 }); ent('archer', 168, 63, { face: 1 });
    ent('brazier', 172, 63); coins([170, 62], [174, 62], [220, 62]);
  }
  let R = M.done();
  // the old start by the drawbridge: the squire and her sign moved to the foot of the road
  R.ents = R.ents.filter(e => !((e.t === 'npc' && e.kind === 'squire' && e.x === 141) || (e.t === 'sign' && e.x === 140)));
  R.START = { x: 12, y: 95 };

  // ---- A CASTLE IN THE MOUNTAIN, NOT GREY ROCK WITH ROOMS IN IT ----
  // What the masons LAID is drawn as coursed ashlar (L.masonry, crown_tiles.js) against the crag they built it on, and
  // the rest of the castle stands behind the play (L.facades): the curtain behind the ward's wall walk, which was a
  // plank across the sky; the towers the gatehouse and the inner gate hang from, which were slabs floating over their
  // own portcullises; turrets on the keep; and the far wall of every drop, which was a slot of sunset cut down through
  // the mountain to the bottom of the world. Written in the castle's columns as they stand HERE: shiftCrown carries
  // both through the three sections grown in below.
  const BOT = R.H - 1;
  R.masonry = [[51, 55, 60, 71], [79, 92, 55, BOT], [93, 96, 72, BOT], [99, 102, 70, BOT], [105, 108, 68, BOT], [110, 111, 66, BOT],
    [151, 161, 44, 57], [151, 243, 64, 65], [241, 243, 44, 57], [314, 332, 64, 65], [333, 417, 0, 66], [418, R.W - 1, 0, 63]];
  R.facades = [[3, 40, 74, 95, 'crag'], [65, 78, 73, BOT, 'chasm'], [93, 111, 74, BOT, 'chasm'], [143, 150, 65, BOT, 'chasm'], [248, 301, 65, BOT, 'chasm'],
    [162, 240, 50, 63, 'curtain'], [151, 161, 38, 63, 'tower', { arch: [58, 63] }], [239, 243, 36, 63, 'tower', { arch: [58, 63], lit: false }],
    [333, 337, 1, 7, 'tower', { roof: true }], [411, 415, 1, 7, 'tower', { roof: true }]];
  const deckAt = S => (x0, x1, y) => { for (let x = x0; x <= x1; x++) S.set(x, y, T.PLANK); };
  const shelfAt = S => (x0, x1, y) => { for (let x = x0; x <= x1; x++) S.set(x, y, T.SHELF); };
  const rungsAt = S => (x, y0, y1) => { for (let y = y0; y <= y1; y++) S.set(x, y, T.NET); };
  // (grown right to left, so each section is painted in the columns it opens and the later grows carry it)

  // ---- THE BAKEHOUSE YARD, BURNING (opened at column 314, seventy wide: final 464-533) ----
  // Between the scaffolds and the keep door. The yard is alight and its floor has gone into the burning cellars, so the
  // way over is what still stands: a wall stump with a fire pit on it, a joist, the bakehouse chimney throwing gouts, a
  // scaffold, the hoist beam with its chain, the granary gable. A fall is fire. The chain has joists under it and the
  // beam over it, so it is never the only way; the joists that give way are only ever under something that does not.
  { const X = 314, B = grow(R, R, X, 70); shiftCrown(B.R, X, 70);
    const { block, ent, coins } = B, deck = deckAt(B), shelf = shelfAt(B), rungs = rungsAt(B);
    block(X, X + 7, 64, BOT); block(X + 64, X + 69, 62, BOT);                 // the two lips of the yard
    block(X + 10, X + 12, 62, BOT);                                            // a wall stump
    deck(X + 15, X + 17, 60);                                                  // a joist
    block(X + 20, X + 24, 58, BOT);                                            // the bakehouse chimney stack
    deck(X + 27, X + 36, 56); deck(X + 27, X + 33, 62);                        // the scaffold (every rise of two rows is three columns or less: the jump that makes it is not a pixel-perfect one)
    deck(X + 36, X + 47, 45);                                                  // the hoist beam over the widest of it
    shelf(X + 39, X + 40, 58); deck(X + 43, X + 45, 58);                       // and the joists under it, one of them burning through
    block(X + 47, X + 52, 56, BOT);                                            // the granary gable
    deck(X + 55, X + 57, 58); deck(X + 59, X + 61, 60);
    B.R.pools = (B.R.pools || []).concat([{ x0: (X + 8) * TS, x1: (X + 64) * TS, y: 66 * TS + 6, fire: true }]);
    B.R.moversExtra = (B.R.moversExtra || []).concat([{ kind: 'swing', px: (X + 41) * TS + 8, py: 46 * TS, arm: 136, x: 0, y: 0, w: 48, h: 8, period: 3.6, phase: 0.8 }]);
    for (const [a, b, top] of [[X + 15, X + 17, 60], [X + 27, X + 36, 56], [X + 36, X + 47, 45], [X + 39, X + 40, 58], [X + 43, X + 45, 58], [X + 55, X + 57, 58], [X + 59, X + 61, 60]]) ent('scaffold', a, top, { x1: b });
    ent('check', X + 1, 63); ent('sign', X + 3, 63, { text: 'THE BAKEHOUSE YARD IS ALIGHT, AND THE CELLARS UNDER IT. KEEP OFF THE FIRE.' });
    ent('firepit', X + 11, 61, { period: 3.2, on: 1.3, phase: 0 });
    ent('firevent', X + 22, 57, { every: 2.8 }); ent('firevent', X + 60, 59, { every: 3.1 });
    ent('hearthgob', X + 31, 55, { face: -1 }); ent('hearthgob', X + 50, 55, { face: -1 }); ent('archer', X + 67, 61, { face: -1, fire: true });
    ent('brazier', X + 31, 61); ent('torch', X + 5, 63); ent('torch', X + 68, 61); ent('deco', X + 49, 55, { kind: 'cauldron' });
    coins([X + 9, 60], [X + 14, 58], [X + 18, 57], [X + 25, 54], [X + 38, 44], [X + 41, 44], [X + 44, 44], [X + 44, 57], [X + 54, 55], [X + 58, 57], [X + 63, 59]);
    B.R.masonry = B.R.masonry.concat([[X + 10, X + 12, 62, 70], [X + 20, X + 24, 58, 70], [X + 47, X + 52, 56, 70]]);
    B.R.facades = B.R.facades.concat([[X + 8, X + 63, 40, 69, 'burning']]);
    rungs(X + 36, 46, 55); rungs(X + 33, 57, 61);                              // LADDERS LAST: nothing is dug in the yard after these
    R = B.done(); }

  // ---- THE CRAG WALK (opened at column 244, seventy wide: final 324-393) ----
  // Past the ward gate her curtain does not go round the spur of the mountain, it goes UP it: crag in two-row steps, a
  // tower on each shoulder, the bridge between the first two with its middle broken out, the wall walk to the third with
  // a breach in it, and a ladder and a hoarding down the last tower's back onto the scaffold bank. Every drop is to the
  // bottom of the world, and every one has the rock's far wall behind it now.
  { const X = 244, C = grow(R, R, X, 70); shiftCrown(C.R, X, 70);
    const { block, plat, ent, coins } = C, deck = deckAt(C), rungs = rungsAt(C);
    block(X, X + 8, 64, BOT);                                                  // the ward's ground runs on to the foot of the spur
    block(X + 9, X + 12, 62, BOT); block(X + 13, X + 16, 60, BOT); block(X + 17, X + 20, 58, BOT); block(X + 21, X + 23, 56, BOT);   // the crag
    block(X + 24, X + 29, 54, BOT);                                            // the first tower
    deck(X + 30, X + 33, 54); deck(X + 36, X + 38, 54);                        // its bridge, the middle out of it
    block(X + 39, X + 45, 52, BOT); block(X + 42, X + 45, 48, 51); plat(X + 40, 50, 2);   // the second tower, and the step up its upper stage
    block(X + 46, X + 52, 48, BOT); block(X + 56, X + 58, 48, BOT);           // the wall walk, and the breach in it
    block(X + 59, X + 64, 46, BOT);                                            // the third tower
    block(X + 65, X + 69, 64, BOT); plat(X + 66, 58, 3); plat(X + 66, 54, 3); plat(X + 66, 50, 3);   // its back, and the hoarding down it
    ent('scaffold', X + 66, 50, { x1: X + 68 });
    ent('check', X + 2, 63); ent('sign', X + 4, 63, { text: 'THE CRAG WALK. HER WALL GOES UP THE MOUNTAIN, AND THE WAY ON GOES WITH IT.' });
    ent('goat', X + 14, 59, { face: -1 }); ent('soldier', X + 27, 53, { face: -1 }); ent('harpy', X + 34, 47);
    ent('check', X + 43, 47); ent('javelin', X + 50, 47, { face: -1 }); ent('soldier', X + 57, 47, { face: -1 }); ent('archer', X + 62, 45, { face: -1 });
    ent('torch', X + 26, 53); ent('torch', X + 47, 47); ent('deco', X + 60, 45, { kind: 'banner', v: 1 }); ent('deco', X + 19, 57, { kind: 'cairn' });
    coins([X + 11, 60], [X + 15, 58], [X + 19, 55], [X + 22, 54], [X + 31, 52], [X + 34, 51], [X + 37, 52], [X + 54, 45], [X + 67, 49], [X + 67, 53], [X + 67, 57]);
    C.R.masonry = C.R.masonry.concat([[X + 24, X + 29, 54, 60], [X + 39, X + 45, 48, 58], [X + 46, X + 58, 48, 55], [X + 59, X + 64, 46, 58]]);
    C.R.facades = C.R.facades.concat([[X + 30, X + 38, 55, BOT, 'chasm'], [X + 53, X + 55, 49, BOT, 'chasm'], [X + 24, X + 29, 44, 53, 'tower'], [X + 42, X + 45, 36, 47, 'tower', { roof: true }],
      [X + 46, X + 58, 44, 47, 'curtain'], [X + 59, X + 64, 34, 45, 'tower']]);
    rungs(X + 65, 46, 63);                                                     // LADDERS LAST: nothing is dug on the spur after this
    R = C.done(); }

  // ---- THE BURNING SIEGE LINES (opened at column 112, eighty wide: final 112-191) ----
  // At the foot of her outer bastion lie the works of the last army that came up this road: two siege towers, a ram's
  // pent-house, mantlets, a catapult on a pier of the old outwork, scaling ledges up the bastion - and the ditch under
  // all of it burns, fed with pitch off the wall. You cross on the wreck. Every step is timber or stone; nothing is a
  // rope and nothing is a creature's back.
  { const X = 112, D = grow(R, R, X, 80); shiftCrown(D.R, X, 80);
    const { block, plat, ent, coins } = D, deck = deckAt(D), rungs = rungsAt(D);
    block(X, X + 7, 66, BOT);                                                  // the near bank of the ditch
    deck(X + 10, X + 15, 60); deck(X + 11, X + 16, 66);                        // the first siege tower: its fighting deck and its foot
    block(X + 19, X + 23, 64, BOT);                                            // a pier of the old outwork
    deck(X + 27, X + 29, 63);                                                  // a mantlet
    deck(X + 33, X + 37, 64);                                                  // the ram's pent-house roof
    deck(X + 40, X + 45, 62); deck(X + 40, X + 45, 56);                        // the second tower
    deck(X + 49, X + 51, 62); deck(X + 54, X + 56, 60);                        // two more mantlets
    block(X + 61, X + 64, 60, BOT);                                            // the outwork's last buttress
    deck(X + 68, X + 70, 62);
    block(X + 72, X + 79, 64, BOT); block(X + 73, X + 79, 46, 57);           // the bastion: its foot, and its tower over the arch
    /* the fire stands two rows under the lowest deck: from anything you stand on in the lines, it is in the frame */
    D.R.pools = (D.R.pools || []).concat([{ x0: (X + 8) * TS, x1: (X + 72) * TS, y: 68 * TS + 6, fire: true }]);
    for (const [a, b, top] of [[X + 10, X + 15, 60], [X + 27, X + 29, 63], [X + 33, X + 37, 64], [X + 40, X + 45, 56], [X + 49, X + 51, 62], [X + 54, X + 56, 60], [X + 68, X + 70, 62]]) ent('scaffold', a, top, { x1: b });
    ent('check', X + 2, 65); ent('sign', X + 4, 65, { text: 'THE OLD SIEGE LINES, STILL BURNING. GO OVER THE WRECK: THE DITCH IS FIRE.' });
    ent('deco', X + 20, 63, { kind: 'siege' }); ent('firepit', X + 23, 63, { period: 3.2, on: 1.4, phase: 0.6 });
    ent('firevent', X + 35, 63, { every: 2.9 }); ent('firevent', X + 44, 61, { every: 3.0 }); ent('firevent', X + 63, 59, { every: 3.3 });
    ent('javelin', X + 12, 59, { face: 1 }); ent('rockgoblin', X + 42, 55, { face: -1 }); ent('soldier', X + 62, 59, { face: -1 }); ent('archer', X + 76, 45, { face: -1, fire: true });
    ent('torch', X + 6, 65); ent('brazier', X + 75, 63); ent('deco', X + 61, 59, { kind: 'bones', v: 1 });
    coins([X + 9, 64], [X + 17, 62], [X + 25, 61], [X + 31, 62], [X + 38, 60], [X + 47, 60], [X + 53, 58], [X + 59, 58], [X + 66, 60], [X + 71, 62], [X + 11, 59], [X + 14, 59], [X + 41, 55], [X + 71, 47], [X + 74, 45], [X + 78, 45]);
    D.R.masonry = D.R.masonry.concat([[X + 72, X + 79, 64, 67], [X + 73, X + 79, 46, 57]]);
    D.R.facades = D.R.facades.concat([[X + 8, X + 71, 66, BOT, 'chasm'], [X + 44, X + 71, 50, 65, 'curtain'], [X + 72, X + 79, 40, 63, 'tower', { arch: [58, 63] }]]);
    rungs(X + 15, 61, 65); rungs(X + 45, 57, 61); rungs(X + 72, 46, 63);      // LADDERS LAST: nothing is dug in the ditch after these (the last a scaling ladder up the bastion, to the archer on it)
    R = D.done(); }

  // ---- HER APARTMENTS: THE BANQUET HALL AND THE LEADS (opened at column 638, eighty wide: final 722-801) ----
  // The keep's top door used to open straight into her Great Hall, so the Queen stood one room past the smith. Between them now: her
  // banquet hall, three steps down from the chapel door, a vault sixteen rows high with the tables laid and the chandeliers on long
  // chains (the castle's rule: cut one down on whoever is under it); then out of its far door onto THE LEADS - a chimney stack up a
  // ladder, a gutter, the bell turret with its sentry, and down onto the terrace at her doors. The bell on the turret is a real one:
  // rung, it drops a gate off the turret and turns out the watch, and the gate lifts when they are down.
  { const X = 638, Q = grow(R, R, X, 80); shiftCrown(Q.R, X, 80);
    const { block, plat, ent, coins } = Q, rungs = rungsAt(Q);
    block(X, X + 79, 26, BOT);                                                 // the castle's mass under all of it
    block(X, X + 1, 20, 25); block(X + 2, X + 3, 22, 25); block(X + 4, X + 5, 24, 25);   // the chapel door's landing, and three steps down into the hall
    block(X, X + 43, 8, 9); block(X + 42, X + 43, 10, 19);                   // the hall's roof, and its east wall over the door to the leads
    block(X + 32, X + 39, 24, 25);                                             // the high table's dais
    ent('sign', X + 1, 19, { text: 'HER BANQUET HALL. CUT A CHANDELIER DOWN ON WHOEVER IS UNDER IT.' });
    ent('deco', X + 12, 25, { kind: 'longTable', v: 0 }); ent('deco', X + 23, 25, { kind: 'longTable', v: 1 });
    ent('deco', X + 34, 23, { kind: 'candelabra' }); ent('deco', X + 38, 23, { kind: 'candelabra' }); ent('deco', X + 8, 25, { kind: 'caskRack' });
    for (const x of [X + 14, X + 25]) ent('weight', x, 10, { len: 12, lamp: true, hang: true });   /* hung to a jump's cut over the floor (row 22): a lamp on the dais would be at the head of anyone stood on it */
    ent('soldier', X + 14, 25, { face: -1 }); ent('hearthgob', X + 19, 25, { face: -1 }); ent('heavy', X + 25, 25, { face: -1 }); ent('javelin', X + 38, 23, { face: -1 });
    ent('torch', X + 7, 25); ent('torch', X + 30, 25); ent('torch', X + 41, 25);
    coins([X + 33, 23], [X + 37, 23], [X + 39, 23]);
    // THE LEADS, out in the wind
    block(X + 50, X + 53, 16, 25);                                             // a chimney stack, with a ladder up its face
    plat(X + 56, 14, 3);                                                       // a lead gutter
    block(X + 61, X + 69, 12, 25);                                             // the bell turret
    block(X + 70, X + 72, 16, 25); block(X + 73, X + 79, 20, 25);             // a buttress down off it, and the terrace at her doors
    block(X + 78, X + 79, 2, 13);                                              // the door-tower over the Great Hall's doors (her arena's west wall shuts in them)
    ent('sign', X + 45, 25, { text: 'THE LEADS. A SENTRY WATCHES FROM THE BELL TURRET: GET TO HIM BEFORE HE RINGS.' });
    ent('sentry', X + 69, 11, { section: 'leads', range: 1, face: -1 }); ent('bell', X + 68, 11, { section: 'leads' });   /* at the turret's far end, three tiles past anywhere a jump puts you down on it: seen, he has a step to run, not a whole roof */
    ent('check', X + 74, 19); ent('torch', X + 76, 19);
    ent('deco', X + 62, 11, { kind: 'gobPennant', v: 1 }); ent('deco', X + 71, 15, { kind: 'warStandard', v: 0 });
    coins([X + 49, 13], [X + 57, 12], [X + 59, 11], [X + 64, 10]);
    Q.R.alarms = (Q.R.alarms || []).concat([{ id: 'leads', gates: [[X + 70, 10, 15]], garrison: [{ t: 'soldier', x: X + 63, y: 11 }, { t: 'heavy', x: X + 67, y: 11 }, { t: 'javelin', x: X + 51, y: 15 }] }]);
    Q.R.arena = { ...Q.R.arena, wallL: X + 79 };                               /* grow() leaves a wall column left of the cut where it was: her west wall is the door-tower now, not the keep's */
    Q.R.interiors = Q.R.interiors.concat([[X, X + 41, 10, 25, 'royal']]);
    Q.R.masonry = Q.R.masonry.concat([[X, X + 79, 0, 63]]);
    Q.R.facades = Q.R.facades.concat([[X + 61, X + 69, 3, 11, 'tower', { roof: true }], [X + 78, X + 79, 0, 19, 'tower', { arch: [14, 19], lit: false }]]);
    /* the lead flat between the stack and the turret is a pit if you miss the gutter: a second ladder takes you back up the stack to try it again */
    rungs(X + 49, 16, 25); rungs(X + 54, 16, 25);                              // LADDERS LAST: nothing is dug on the leads after these
    R = Q.done(); }

  // ---- THE ARMOURY (opened at column 464, eighty-four wide: final 464-547) ----
  // THE FORGEMASTER was the last room of the keep, one door from the Queen, and the level's two big fights stood back to back in its
  // last tenth. His armoury is out in the bailey now, halfway up: past the scaffold bank a stone forge-house stands on the ward's own
  // ground, and the gate he holds lets you out into the bakehouse yard. Inside it is the room he had on the keep's second floor,
  // column for column - rails, beam rail, gantry, hammer, anvil, boiler, plates and the slag spots - twenty-four rows lower.
  { const X = 464, F = grow(R, R, X, 84); shiftCrown(F.R, X, 84);
    const { block, plat, ent, set } = F;
    const c = x => X - 120 + x;                                                /* c(): a column of the keep's old armoury (its wall 125 to its door 199) in this room */
    block(X, X + 83, 64, BOT);                                                 // the bailey's ground, under the forge-house and either side of it
    block(X + 4, X + 81, 46, 49); block(X + 4, X + 5, 50, 57); block(X + 80, X + 81, 50, 57);   // its roof, and its end walls over the two doors
    block(X + 54, X + 57, 40, 45);                                             // the forge chimney
    for (let x = c(129); x <= c(196); x++) set(x, 64, T.RAIL);
    ent('cart', c(196), 63, { auto: true, dir: -1, speed: 120 }); ent('cart', c(132), 63);
    for (let x = c(140); x <= c(184); x++) set(x, 59, T.RAIL); ent('cart', c(184), 58, { auto: true, dir: -1, speed: 110 });
    for (const [x, y, n] of [[132, 61, 3], [136, 56, 3], [142, 54, 3], [148, 52, 4], [156, 54, 3], [162, 56, 3], [168, 61, 3]]) plat(c(x), y, n);
    for (const [x, y, n] of [[129, 62, 3], [132, 60, 3], [134, 58, 2], [139, 55, 2], [146, 53, 2]]) plat(c(x), y, n);   // the gantry's silver had no way up to it: ledges from the floor, two rows at a time
    ent('silver', c(149), 51);
    ent('hammer', c(150), 63); ent('anvil', c(158), 63); ent('boiler', c(176), 63); for (const x of [144, 166, 186]) ent('hotplate', c(x), 63);
    for (const x of [130, 150, 172, 194]) ent('torch', c(x), 63);
    ent('deco', c(138), 63, { kind: 'barrels' });
    ent('forgemaster', c(172), 63, { mini: true });
    for (let y = 50; y <= 63; y++) set(c(199), y, T.PORT);                    // his gate onto the bakehouse yard, shut until the smith is down
    ent('check', X + 1, 63); ent('sign', X + 2, 63, { text: 'THE ARMOURY. THE SMITH\'S IRON TURNS HALF A CUT. ROLL A TUB INTO HIM AND HE TAKES IT ALL.' });
    ent('torch', X + 82, 63);
    /* THE BEAM RAIL over the armoury floor is his second storey: he leaps to it, pours off it, and drops off it. Written here, in the
       columns he fights in, and laid last of all the grows, so nothing after it has to carry beamL/beamR or the slag across a cut. */
    F.R.mini = { x0: c(126) * TS, x1: c(198) * TS, floor: 64 * TS, trigger: c(134) * TS, wallL: c(125), gate: c(199), boss: 'forgemaster', y0: 50 * TS, y1: 65 * TS,
      slag: [c(140) * TS + 8, c(158) * TS + 8, c(180) * TS + 8], beam: 59 * TS, beamL: c(142) * TS, beamR: c(182) * TS };
    F.R.interiors = F.R.interiors.concat([[X + 6, X + 79, 50, 65, 'forge']]);
    F.R.masonry = F.R.masonry.concat([[X + 4, X + 81, 46, 49], [X + 4, X + 5, 50, 57], [X + 80, X + 81, 50, 57], [X + 54, X + 57, 40, 45]]);
    R = F.done(); }

  R.palette = Object.assign({}, R.palette, { mid: 'crown' });   /* her walls climbing the far shoulders, where the crags' bare ridge was */
  R.bgSpan = 200;                                                /* a hundred rows tall: the ridges ride behind every storey, not only the road at the bottom */
  R.tints = [[112, 191, [255, 120, 50], 0.10], [548, 617, [255, 110, 40], 0.12], [722, 763, [255, 190, 120], 0.06], [766, 801, [150, 170, 230], 0.08]];   /* the light of the two fires on everything near them; the candles in her banquet hall, and the cold on the leads */
  /* NOBODY ON A ROOF NOBODY CAN CLIMB. The garrison sprinkler takes the highest floor in a column, and the forge-house roof and the
     banquet hall's are the highest floors there are: it stood a soldier and a pike up on the armoury's slates, out of everyone's reach. */
  R.calm = (R.calm || []).concat([[468, 545, 36, 49], [722, 765, 0, 9], [783, 791, 8, 12]]);   /* (and the bell turret's top is the sentry's alone: you land on it) */
  // the snow and the wind stop at the forge-house wall: past it is inside the walls, and on fire. They come back on the leads.
  R.weather = [{ x0: 0, x1: 468 * TS, kind: 'snow' }, { x0: 766 * TS, x1: 802 * TS, kind: 'snow' }]; R.ambient = [{ x0: 0, x1: 468 * TS, kind: 'wind' }, { x0: 766 * TS, x1: 802 * TS, kind: 'wind' }];
  // The furnace approach and the captains' gallery each get a complete additional encounter.
  { const X=470, n=40, F=grow(R,R,X,n); shiftCrown(F.R,X,n);
    F.block(X,X+n-1,64,F.R.H-1); F.block(X,X+n-1,46,49);
    F.R.interiors.push([X,X+n-1,50,63,'forge']); F.R.masonry.push([X,X+n-1,46,49],[X,X+n-1,64,66]);
    F.ent('check',X+2,63); F.ent('sign',X+3,63,{text:'THE FURNACE LINE. CROSS THE HOT PLATES BETWEEN THEIR BURSTS.'});
    for(const dx of [12,24,33]) { F.ent('hotplate',X+dx,63); F.ent('deco',X+dx-3,63,{kind:'barrels'}); }
    for(const dx of [7,19,36]) F.ent('torch',X+dx,63);
    F.ent('hearthgob',X+17,63,{face:-1}); F.ent('heavy',X+29,63,{face:-1});
    F.coins([X+8,62],[X+15,62],[X+23,62],[X+32,62]); R=F.done(); }
  { const X=762,n=48,F=grow(R,R,X,n);shiftCrown(F.R,X,n);
    F.block(X,X+n-1,20,F.R.H-1); F.block(X,X+n-1,8,9);
    F.R.interiors.push([X,X+n-1,10,19,'royal']); F.R.masonry.push([X,X+n-1,8,9],[X,X+n-1,20,26]);
    F.ent('check',X+2,19);F.ent('sign',X+3,19,{text:'THE CAPTAINS HALL. GOBLINS DROP FROM THE BALCONIES. FALLING LAMPS STRIKE BOTH SIDES.'});
    for(const dx of [12,28,40]) { F.ent('weight',X+dx,10,{len:6,lamp:true,hang:true,unstable:true});F.plat(X+dx+1,14,3); for(let y=14;y<20;y++)F.set(X+dx+3,y,T.NET); F.ent('soldier',X+dx+2,13,{face:-1,balcony:true}); }
    F.ent('heavy',X+23,19,{face:-1});
    for(const dx of [7,22,44])F.ent('torch',X+dx,19);
    for(const dx of [9,20,34])F.ent('deco',X+dx,19,{kind:'longTable',v:0});
    F.coins([X+8,18],[X+18,18],[X+31,18],[X+42,18]);R=F.done(); }

  // ---- THE TEMPERERS (docs/briefs/crown-temperer.md) ----
  // Highcrown is a working forge with an anvil, a hammer, a boiler, six hot plates and six braziers in it, and
  // until now not one regular foe touched any of it. He does: he breaks off the fight, runs to the nearest LIT
  // brazier, and comes back with the blade glowing and one blow no shield turns. So he goes where the braziers
  // are - 187, 252, 263, 619, 718 and 740 - and NEVER in the forge hall at 482-570, which is the Forgemaster's
  // and does not want a second fire idea in it. Three of them, each one standing in somebody else's fight,
  // because alone he is a non-event and that is correct.
  //
  // THESE ARE FINAL COLUMNS. Nothing is grown after this line, so what is written here is what the built level
  // has; every grow() and shiftCrown() above is already done.
  for (const [x, y] of [[255, 63], [624, 61], [727, 51]]) R.ents.push({ t: 'temperer', x, y, face: -1 });
  return R;
}

function openYard() {
  const W = 120, H = 30; const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  block(0, W - 1, 22, H - 1); block(0, 1, 0, 21); block(W - 2, W - 1, 0, 21);          // the yard, walled
  ent('sign', 4, 21, { text: 'THE OPEN YARD. NOTHING HERE HURTS OR ENDS. ESC TO RETURN TO THE MAP.' });
  ent('torch', 8, 21); ent('torch', 112, 21);
  // ---- the straw men: one on the floor, one on a table, one over the pit ----
  for (const x of [16, 22, 28]) ent('dummy', x, 21);
  ent('sign', 14, 21, { text: 'STRAW MEN STAND FOR ANYTHING. X X X IS A THIRD CUT; A DASH, THEN X, IS A DASH ATTACK.' });
  // ---- the steps: every height worth jumping, in a row you can read ----
  plat(36, 19, 4); plat(43, 17, 4); plat(50, 15, 4); plat(57, 13, 4);
  ent('sign', 34, 21, { text: 'THE STEPS GO UP TWO ROWS AT A TIME. DOWN+JUMP ON A LEDGE TO DROP THROUGH.' });
  coins([37, 18], [44, 16], [51, 14], [58, 12]);
  ent('dummy', 52, 14);
  // ---- the gap: wide enough that a walk will not do it ----
  for (let x = 64; x <= 71; x++) for (let y = 22; y < H; y++) set(x, y, T.AIR);
  block(64, 71, 28, H - 1);                                                             // a floor at the bottom of it, so nothing is lost
  ent('sign', 62, 21, { text: 'THE GAP. A JUMP WILL NOT CROSS IT. TAP A WAY TWICE TO DASH, OR COME AT IT OFF THE STEPS.' });
  ent('dummy', 68, 27);                                                                 // and one at the bottom to plunge onto
  // ---- the wall: a climb, and a ledge to plunge off ----
  block(78, 79, 8, 21); for (let y = 9; y <= 20; y++) { set(78, y, T.NET); set(79, y, T.NET); }
  plat(80, 8, 6);
  ent('sign', 74, 21, { text: 'CLIMB THE WALL AND PLUNGE: DOWN AND SWING IN THE AIR. LAND ON STRAW TO BOUNCE.' });
  for (const x of [86, 90, 94]) ent('dummy', x, 21);
  coins([81, 7], [84, 7]);
  // ---- and two guards, which is the only thing in here you cannot simply hit ----
  ent('shield', 102, 21, { face: -1 }); ent('soldier', 108, 21, { face: -1 });
  ent('sign', 98, 21, { text: 'A GUARD TURNS A LIGHT BLOW. HOLD X, OR DOWN+X UNDER IT. UP+X THROWS HIM UP.' });
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 6, y: 21 }, pools: [], falls: [], moversExtra: [], interiors: [],
    trial: [], openYard: true, duskStart: -1, duskLen: 1, music: 'select', reachExact: true, noCoin: true,
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(200,120,80,0.12)', grass: '#6a8a3a', grassL: '#9ac050', grassD: '#3a5a24', dirt: '#4a3020', dirtL: '#5e3f2a', dirtD: '#2c1a10' },
  };
}

// THE TRIALS. A practice yard for each hero: stations in a row, each with a sign that says what to do, straw men
// to do it to, and a gate that lifts when it is done. Nothing in a trial can hurt you. The gate at the far end
// is the way out. (L.trial: the stations - where each starts, its gate, what counts, how many.)
function trialYard(hero) {
  /* THE DEATH KNIGHT'S C, IN ONE PLACE. His C is being reworked into THE BLOOD WARD: these two steps are the only lines
     of his yard that speak of it, so the rework changes his words (and what counts) here and nowhere else. */
  const REAPER_C = {
    ward: ['ward', 3, 'THE BLOOD WARD: HOLD C TO WARD, RELEASE TO NOVA. TAKE THREE OF THE ARCHER\'S ARROWS ON IT.', [['archer', 22]], 'HOLD LB, THEN LET GO'],
    meter: ['meter', 1, 'BLOOD SURGE: HIS BAR FILLS WITH WHAT HE TAKES. FULL, HOLD F. IT IS FILLED FOR YOU HERE.', [['dummy', 14], ['sprig', 20]], 'HOLD Y WITH A FULL BAR'],
  };
  /* HIS F IS NOT A TREE SKILL'S SLOT. The Death Knight's F is SUMMON SKELETON once his GRAVELORD root has it and EMPTY until then (and, held
     on a full bar, the surge above), and it is no tree skill a yard can lend, so the shared step's F is not asked of him: his skills from the tree go on G, and G is what he is asked for */
  const SKILL_G = ['skill', 1, 'G: A SKILL FROM THE TALENT TREE (Q). ONE NOT YET LEARNED IS LENT HERE. USE IT.', [['dummy', 14], ['sprig', 20]], 'RT', ['skillG']];
  /* THE NEW CUTS, THE SAME FOR EVERY HERO: what the controls page promises, a gate each. The goblins in these yards are straw
     inside (see e.trainer in main.js): they can be thrown, tripped and cut all day, they never go down, and they keep to their yard. */
  const DASH = ['dashatk', 2, 'TAP A WAY TWICE TO DASH, X AT ONCE: THE ATTACK CARRIES YOU THROUGH. LAND IT TWICE.', [['dummy', 15], ['dummy', 21]], 'TAP THE STICK TWICE, THEN X'];
  const RISE = ['rise', 2, 'UP+X: THE RISING CUT LAUNCHES A SMALL FOE. CUT IT AGAIN WHILE IT HANGS. LAUNCH TWO.', [['sprig', 14], ['sprig', 19]], 'UP+X'];
  const SWEEP = ['sweep', 2, 'DOWN+X: THE LOW SWEEP GOES UNDER A RAISED SHIELD AND TRIPS HIM. TRIP THEM TWICE.', [['shield', 14], ['shield', 20]], 'DOWN+X'];
  const SKILL = ['skill', 2, 'F AND G: SKILLS FROM THE TALENT TREE (Q). ANY NOT YET LEARNED ARE LENT HERE. USE BOTH.', [['dummy', 14], ['sprig', 20]], 'Y, THEN RT', ['skillF', 'skillG']];
  const MARKS = ['tellY', 'tellR'];   /* the marks step wants one of each */
  const ST = {
    knight: [
      ['hit', 3, 'THE SWING. X STRIKES. HIT THE STRAW MAN THREE TIMES.', [['dummy', 16], ['dummy', 20]], 'X'],
      ['third', 2, 'THE THIRD CUT: X THREE TIMES IN A RUN. THE THIRD LANDS HEAVY AND SHOVES. LAND TWO.', [['dummy', 16], ['dummy', 20]], 'X, X, X'],
      ['block', 3, 'THE SHIELD. HOLD C TO RAISE IT, AND FACE THE ARCHER. TURN THREE OF HIS ARROWS.', [['archer', 22]], 'HOLD LB'],
      ['dodge', 2, 'THE DODGE. V ROLLS YOU THROUGH A BLOW. ROLL TWICE.', [], 'B'],
      ['flash', 2, 'THE BEAT: RAISE C AS HIS SWORD FLASHES WHITE, AND HE REELS OPEN. TURN HIS CUT TWICE.', [['swornsword', 18]], 'LB AS THE SWORD FLASHES'],
      ['tells', 2, 'ONE YELLOW ! : THE SHIELD TAKES IT. TWO RED !! : NOTHING DOES, SO GET CLEAR. DO BOTH.', [['hedgeknight', 18]], 'LB FOR !    B OR A FOR !!', MARKS],
      ['pogo', 3, 'THE PLUNGE: JUMP, THEN DOWN+X. BOUNCE OFF THE STRAW MEN THREE TIMES.', [['dummy', 12], ['dummy', 16], ['dummy', 20]], 'A, THEN DOWN+X'],
      ['heavyblow', 2, 'THE SHIELD CHARGE: HOLD X TO BRACE, LET GO TO RUSH. THE BASH BREAKS A GUARD. LAND IT TWICE.', [['dummy', 14], ['dummy', 20]], 'HOLD X, LET GO'],
      DASH, RISE, SWEEP,
      ['meter', 1, 'BLOCKS FILL RESOLVE. FULL, TAP C: THE LAST CHARGE. RUN IT THROUGH ALL THREE STRAW MEN.', [['dummy', 9], ['dummy', 12], ['dummy', 15]], 'LB WITH A FULL BAR'],   /* a line of straw men inside one charge's run (13 tiles), so the step is the thing itself: it carries through */
      SKILL],
    pyro: [
      ['ember', 3, 'THE EMBER. TAP C AND ONE FLIES. SET THE STRAW MAN ALIGHT THREE TIMES.', [['dummy', 18]], 'TAP LB'],
      ['dodge', 2, 'NO SHIELD: YOU LIVE BY THE DODGE. V ROLLS YOU THROUGH A BLOW. ROLL TWICE.', [], 'B'],
      ['third', 2, 'THE STAFF: X THREE TIMES IN A RUN. THE THIRD BLOW LANDS HEAVY AND SHOVES. LAND TWO.', [['dummy', 16], ['dummy', 20]], 'X, X, X'],
      ['meter', 1, 'HOLD C: THE JET FILLS YOUR HEAT. FULL, PRESS C AGAIN: THE PYRE. THROW IT AT THE STRAW.', [['dummy', 14], ['dummy', 18]], 'HOLD LB, THEN LB AGAIN'],
      ['firedrop', 2, 'THE FIREDROP: JUMP, THEN DOWN+X. HIT A STRAW MAN FROM ABOVE TWICE.', [['dummy', 14], ['dummy', 19]], 'A, THEN DOWN+X'],
      ['heavyblow', 2, 'HOLD X FOR THE BELLOWS: A CONE THAT THROWS DOWN AND BURNS. LAND IT TWICE.', [['dummy', 14], ['dummy', 20]], 'HOLD X'],
      ['flash', 2, 'THE BEAT: ROLL THROUGH HIS CUT WITH V AS THE SWORD FLASHES WHITE, AND HE REELS. TWICE.', [['swornsword', 18]], 'B AS THE SWORD FLASHES'],
      ['tells', 2, 'ONE YELLOW ! : ROLL THROUGH IT. TWO RED !! : ROLL THROUGH OR GET CLEAR. DO BOTH.', [['hedgeknight', 18]], 'B THROUGH BOTH, OR A CLEAR', MARKS],
      DASH, RISE, SWEEP, SKILL],
    reaper: [
      ['hit', 3, 'THE CLEAVE: X COMES DOWN SLOW AND HARD THROUGH WHAT IS IN FRONT OF HIM. HIT THREE.', [['dummy', 16], ['dummy', 20]], 'X'],
      ['third', 2, 'THE THIRD CUT: X THREE TIMES IN A RUN, SLOW AS IT IS. THE THIRD LANDS HEAVY. LAND TWO.', [['dummy', 16], ['dummy', 20]], 'X, X, X'],
      ['heavyblow', 2, 'HOLD X: HE PLANTS THE BLADE, AND BLOOD BOLTS FAN OUT THROUGH ANY GUARD. LAND IT TWICE.', [['dummy', 13], ['dummy', 21]], 'HOLD X'],
      REAPER_C.ward,
      ['dodge', 2, 'V: THE PASSING. HE GOES THIN AND NOTHING TOUCHES HIM. ROLL TWICE.', [], 'B'],
      ['flash', 2, 'THE BEAT: ROLL THROUGH HIS CUT WITH V AS THE SWORD FLASHES WHITE, AND HE REELS. TWICE.', [['swornsword', 18]], 'B AS THE SWORD FLASHES'],
      ['tells', 2, 'ONE YELLOW ! CAN BE TURNED OR ROLLED. TWO RED !! CANNOT BE TURNED: GET CLEAR. DO BOTH.', [['hedgeknight', 18]], 'B THROUGH BOTH, OR A CLEAR', MARKS],
      ['pogo', 2, 'THE CULL: JUMP, THEN DOWN+X. A SHADE TEARS OUT AND FIGHTS FOR HIM. BOUNCE TWICE.', [['dummy', 12], ['dummy', 16], ['dummy', 20]], 'A, THEN DOWN+X'],
      DASH, RISE, SWEEP, REAPER_C.meter, SKILL_G],
    pirate: [
      ['hit', 3, 'THE CUTLASS: X AND KEEP GOING, A RUN OF FIVE. HIT THE STRAW MAN THREE TIMES.', [['dummy', 18]], 'X'],
      ['third', 2, 'THE THIRD CUT: X THREE TIMES IN A RUN. THE THIRD LANDS HEAVY AND SHOVES. LAND TWO.', [['dummy', 16], ['dummy', 20]], 'X, X, X'],
      ['parry', 3, 'NO SHIELD: TAP C TO PARRY. IT TURNS A YELLOW BLOW AND LOADS THE PISTOL. TURN THREE.', [['archer', 22]], 'TAP LB'],
      ['dodge', 2, 'V ROLLS. HE HAS GOT OUT OF THE WAY FOR A LIVING. ROLL TWICE.', [], 'B'],
      ['flash', 2, 'THE BEAT: TAP C AS HIS SWORD FLASHES WHITE. THE PARRY LEAVES HIM OPEN. TURN IT TWICE.', [['swornsword', 18]], 'TAP LB AS IT FLASHES'],
      ['tells', 2, 'ONE YELLOW ! : A PARRY TURNS IT. TWO RED !! : NOTHING DOES, SO GET CLEAR. DO BOTH.', [['hedgeknight', 18]], 'TAP LB FOR !    B OR A FOR !!', MARKS],
      ['heavyblow', 2, 'HOLD X: THE PISTOL GOES THROUGH ANY GUARD, THEN RELOADS. FIRE IT TWICE.', [['dummy', 14], ['dummy', 20]], 'HOLD X'],
      ['hook', 2, 'HOLD C: THE HOOK HAULS YOU TO RIGGING, OR A MAN TO YOU. THROW IT TWICE.', [['dummy', 20]], 'HOLD LB'],
      DASH, RISE, SWEEP,
      ['meter', 1, 'PLUNDER FILLS AS YOU FIGHT. FULL, TAP C: THE BLACK FLAG. IT IS FILLED FOR YOU HERE.', [['dummy', 14], ['sprig', 20]], 'LB WITH A FULL BAR'],
      SKILL],
    paladin: [
      ['third', 2, 'THE MAUL: X, THREE IN A RUN. EVERY THIRD BLOW STAGGERS AND EVERY BLOW FILLS THE LIGHT.', [['dummy', 18]], 'X, X, X'],
      ['aegis', 3, 'THE AEGIS: HOLD C FOR A WARD THAT LASTS A BREATH AND A HALF. TURN THREE ARROWS.', [['archer', 22]], 'HOLD LB'],
      ['flash', 2, 'THE BEAT: HOLD C FOR THE AEGIS AS HIS SWORD FLASHES WHITE, AND HE REELS OPEN. TWICE.', [['swornsword', 18]], 'HOLD LB AS IT FLASHES'],
      ['tells', 2, 'ONE YELLOW ! : THE AEGIS TAKES IT. TWO RED !! : NOTHING DOES, SO GET CLEAR. DO BOTH.', [['hedgeknight', 18]], 'HOLD LB FOR !    B OR A FOR !!', MARKS],
      ['mend', 1, 'MEND: TAP C TO SPEND HALF THE LIGHT ON HEALING. IT ROOTS YOU A MOMENT.', [], 'TAP LB'],
      ['hammerfall', 2, 'HAMMERFALL: JUMP, THEN DOWN+X. THE GROUND CARRIES IT BOTH WAYS. CATCH TWO.', [['dummy', 12], ['dummy', 22]], 'A, THEN DOWN+X'],
      ['heavyblow', 2, 'HOLD X FOR THE OVERHEAD: IT BREAKS A RAISED SHIELD. LAND IT TWICE.', [['dummy', 14], ['dummy', 20]], 'HOLD X'],
      ['dodge', 2, 'V: THE HEAVY STEP. THE PAULDRON GOES FIRST AND TURNS WHAT IT MEETS. STEP TWICE.', [], 'B'],
      DASH, RISE, SWEEP,
      ['judgement', 1, 'JUDGEMENT: WITH A FULL LIGHT, PRESS C AGAIN. IT IS FILLED FOR YOU HERE.', [['dummy', 14], ['dummy', 20]], 'LB WITH A FULL BAR'],
      SKILL],
  }[hero];
  const SW = 26, W = 8 + ST.length * SW + 26, H = 24; const L = painter(W, H);
  const { block, ent, set } = L;
  block(0, W - 1, 20, H - 1); block(0, 1, 0, 19); block(W - 2, W - 1, 0, 19);
  const trial = [];
  ST.forEach(([kind, n, text, things, pad, kinds], i) => { const x0 = 4 + i * SW, gate = x0 + SW - 2;
    if (kind === 'heavyblow' && hero === 'pirate') L.coins([x0 + 8, 18], [x0 + 11, 18], [x0 + 16, 18], [x0 + 19, 18]);   // his powder, lying about
    ent('sign', x0 + 2, 19, { text }); ent('torch', x0 + 6, 19);
    for (const [t, dx] of things) { if (t === 'archer') { block(x0 + dx - 2, x0 + dx + 2, 18, 19); ent('archer', x0 + dx, 17, { face: -1, lx0: x0 + 1, lx1: gate - 1 }); } else if (t === 'dummy') ent('dummy', x0 + dx, 19);
      else ent(t, x0 + dx, 19, { face: -1, trainer: t === 'swornsword' || t === 'hedgeknight' ? 'drill' : 'still', lx0: x0 + 1, lx1: gate - 1 }); }   /* a drill fights you (it cannot hurt you here); a still one stands and takes it */
    for (let y = 14; y <= 19; y++) set(gate, y, T.PORT); block(gate, gate, 0, 13);
    trial.push({ x0, gate, kind, n, text, pad, kinds, fill: kind === 'mend' ? 60 : kind === 'judgement' || (kind === 'meter' && hero !== 'pyro') ? 100 : 0 }); });
  const xe = 4 + ST.length * SW;
  ent('sign', xe + 2, 19, { text: 'THE TRIAL IS DONE. THE GATE AHEAD RETURNS YOU TO THE MAP.' });
  ent('gate', xe + 14, 19);
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: [], interiors: [], trial,
    duskStart: -1, duskLen: 1, music: 'select', reachExact: true,
    palette: { sky: 'autumn', near: 'autumn', dress: 'wood', haze: 'rgba(200,120,80,0.12)', grass: '#6a8a3a', grassL: '#9ac050', grassD: '#3a5a24', dirt: '#4a3020', dirtL: '#5e3f2a', dirtD: '#2c1a10' },
  };
}

// THE HIGH STORE: the same trade in a stone cellar under the crags, with the shepherd and the old knight for company.
function theShopSea() {
  const L = painter(44, 30);
  const { block, floor, ent, set, plat } = L;
  const net = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET); };
  floor(0, 43, 22); block(0, 1, 0, 29); block(42, 43, 0, 29); block(0, 43, 0, 14);
  block(2, 41, 15, 15);                                   // her deck beams overhead
  ent('sign', 7, 21, { text: "THE CHANDLER'S HULK. UP AT THE COUNTER TO TRADE, UP AT THE HATCH TO LEAVE." });
  ent('exit', 3, 21); ent('torch', 11, 21); ent('torch', 33, 21);
  net(4, 5, 16, 21);                                      // the hatch she lets you in by
  ent('deco', 15, 21, { kind: 'wares', v: 0 }); ent('deco', 37, 21, { kind: 'wares', v: 1 });
  ent('deco', 24, 21, { kind: 'counter' }); ent('npc', 25, 21, { kind: 'keeper' });
  ent('deco', 19, 21, { kind: 'rumBarrels', v: 0 }); ent('deco', 29, 21, { kind: 'kegStack' });
  ent('deco', 13, 21, { kind: 'coiledCable', v: 0 }); ent('deco', 39, 21, { kind: 'plunder', v: 1 });
  ent('deco', 9, 21, { kind: 'lanternDeck', v: 1 }); ent('deco', 31, 21, { kind: 'chartTable' });
  ent('deco', 21, 21, { kind: 'seaChest' }); ent('deco', 35, 21, { kind: 'waterButt' });
  ent('npc', 17, 21, { kind: 'ferryman' }); ent('npc', 28, 21, { kind: 'squire' });
  plat(6, 18, 4); plat(12, 18, 3);                        // her upper shelf, where the dear stuff lives
  ent('deco', 7, 17, { kind: 'seaChest' }); ent('deco', 13, 17, { kind: 'plunder', v: 0 });
  return {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 4, y: 21 }, pools: [], falls: [], moversExtra: [],
    duskStart: -1, duskLen: 1, music: 'store', night: true, shop: true, interiors: [[2, 41, 16, 21, 'ship']],
    palette: { set: 'ship', hall: true, sky: 'night', dress: 'none',
      dirt: '#4a4038', dirtL: '#5e5246', dirtD: '#2e2620', grass: '#6a5c4c', grassL: '#8a7a64', grassD: '#453c2c' },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'water' }],
  };
}
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
    duskStart: -1, duskLen: 1, music: 'store', night: true, shop: true, interiors: [[2, 37, 13, 19, 'stone']],
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
    duskStart: -1, duskLen: 1, music: 'store', night: true, shop: true, interiors: [[2, 37, 13, 19]],
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
  ent('sign', 4, 21, { text: 'GALE MOOR. JUMP INTO A GUST AND IT CARRIES YOU FAR. THE FLAGS SHOW IT COMING.' });
  ent('npc', 9, 21, { kind: 'squire' }); ent('flagpost', 14, 21); ent('deco', 20, 21, { kind: 'stone', v: 0 }); ent('deco', 30, 21, { kind: 'cairn' }); ent('flagpost', 34, 21);
  ent('hare', 26, 21, { face: 1 }); coins([12, 20], [18, 19], [24, 20]);
  ent('check', 38, 21);

  // ---- 2. THE CAUSEWAY: posts and planks over the bog. The gaps are longer than a jump; the gusts make up the rest. Stand still in the bog and it stands up. ----
  block(40, 111, 25, 29); pools.push({ x0: 41 * TS, x1: 111 * TS, y: 24 * TS + 4, shallow: true, depth: 12 }); hags.push({ x0: 41 * TS, x1: 111 * TS });
  for (const [x0, x1] of [[41, 48], [52, 58], [62, 68], [72, 78], [82, 88], [92, 98], [102, 110]]) { plank(x0, x1, 21); for (const sx of [x0 + 1, x1 - 1]) ent('deco', sx, 24, { kind: 'stilt' }); } // three-tile gaps now, on stilts driven into the bog
  gusts.push({ x0: 40 * TS, x1: 112 * TS, y0: 8 * TS, y1: 24 * TS, dir: 1, period: 5, on: 4.2, phase: 0, moor: true, k: 1.6 });
  ent('flagpost', 44, 20); ent('flagpost', 76, 20); ent('flagpost', 108, 20);
  ent('kite', 62, 11); ent('kite', 92, 11); ent('sign', 42, 20, { text: 'THE CAUSEWAY. WAIT FOR THE GUST, THEN JUMP. DO NOT STAND IN THE BOG.' });
  coins([50, 18], [60, 17], [70, 18], [80, 17], [90, 18], [100, 18]);

  // ---- 3. THE STONE CIRCLE: the wind spins round the ring, every gust the other way. The silver is on the centre stone. ----
  floor(111, 150, 22);
  menhir(116, 19, 21); menhir(144, 19, 21); menhir(130, 17, 21); ent('silver', 130, 16); ent('vent', 126, 21, { period: 4, on: 2.4, h: 100, wind: true });
  for (const x of [120, 124, 136, 140]) ent('deco', x, 21, { kind: 'stone', v: x % 3 });
  gusts.push({ x0: 112 * TS, x1: 149 * TS, y0: 8 * TS, y1: 23 * TS, dir: 1, period: 2.8, on: 2.0, phase: 0.4, alt: true, moor: true, k: 1.25 });
  ent('flagpost', 118, 21); ent('flagpost', 142, 21); ent('hare', 122, 21, { face: 1 }); ent('hare', 138, 21, { face: -1 });
  ent('sign', 112, 21, { text: 'THE WIND CIRCLES THE STONES. THE CENTRE UPDRAFT AND A GUST PUT YOU ON TOP.' });
  coins([118, 20], [123, 19], [127, 18], [134, 18], [138, 19], [147, 20]);
  ent('check', 148, 21);
  ent('check', 92, 24);   /* the opening gap was a hundred and ten */

  // ---- 4. THE BOTHY: the lee of the hill. Still air, a warm door, and Tam, who goes no higher. ----
  floor(150, 180, 22);
  ent('deco', 158, 21, { kind: 'bothy' }); ent('npc', 164, 21, { kind: 'squire', bothy: true }); ent('torch', 161, 21); ent('deco', 172, 21, { kind: 'fence', v: 1 });
  ent('sign', 153, 21, { text: 'NO WIND IN THE LEE. THREE LOST KITES HANG ON THE POSTS AHEAD: RIDE UP TO THEM.' });
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
  ent('sign', 181, 21, { text: 'KITE GOBLINS DROP STONES. CUT THE STRING OR THE GOBLIN AND BOTH COME DOWN.' });
  coins([188, 19], [194, 17], [210, 16], [217, 19], [230, 18], [237, 19]);
  ent('check', 238, 21);

  // ---- 6. THE RIDGE RUN: the wind against you the whole way up. The updrafts by each step are the only way to make ground. ----
  block(240, 252, 22, 29); block(253, 264, 20, 29); block(265, 276, 18, 29); block(277, 288, 16, 29); block(289, 300, 14, 29);
  gusts.push({ x0: 240 * TS, x1: 301 * TS, y0: 4 * TS, y1: 23 * TS, dir: -1, period: 6, on: 3.2, phase: 1, moor: true, k: 1.1 });
  ent('vent', 250, 21, { period: 4, on: 2.6, h: 80, wind: true }); ent('vent', 262, 19, { period: 4, on: 2.6, h: 80, wind: true, phase: 1 }); ent('vent', 274, 17, { period: 4, on: 2.6, h: 80, wind: true, phase: 2 }); ent('vent', 286, 15, { period: 4, on: 2.6, h: 80, wind: true, phase: 3 });
  ent('harpy', 262, 8); ent('harpy', 286, 5); ent('hare', 270, 17, { face: -1 }); ent('hare', 294, 13, { face: -1 }); ent('sailer', 258, 19, { face: 1 }); ent('sailer', 282, 15, { face: 1 });
  ent('flagpost', 246, 21); ent('flagpost', 282, 15);
  ent('sign', 242, 21, { text: 'THE RIDGE WIND HOLDS YOU BACK. WAIT BY AN UPDRAFT FOR THE LULL, RIDE IT, RUN ON.' });
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
  ent('sign', 302, 13, { text: 'THE AIR GOES UP BETWEEN THE STONES. STEP OFF: THE UPDRAFT LIFTS, THE GUST CARRIES.' });
  ent('silver', 346, 10); coins([313, 12], [323, 10], [335, 13], [347, 9], [359, 11], [318, 18], [341, 16], [353, 17]);
  ent('check', 368, 13);

  // ---- 8. THE GALLERY OF GUSTS: ledges over the thorns, the wind turning every three breaths. Jump with it and you fly; against it you fall short. A tall stone at the end, and an updraft to get over it. ----
  block(397, 423, 15, 29); spikes(397, 423, 14);
  for (const x of [402, 413]) plat(x, 12, 6); // six tiles between each: only the tailwind gets you there. Let go of the stick over the ledge or it carries you past.
  floor(424, 476, 14); pillar(430, 8, 13);
  ent('vent', 427, 13, { period: 4, on: 2.2, h: 150, wind: true, w: 20 });
  gusts.push({ x0: 380 * TS, x1: 440 * TS, y0: 2 * TS, y1: 15 * TS, dir: 1, period: 3, on: 2.3, phase: 0, alt: true, moor: true, k: 1.5 });
  ent('flagpost', 386, 13); ent('flagpost', 404, 11); ent('flagpost', 425, 13); ent('hare', 390, 13, { face: 1 }); ent('harpy', 405, 5);
  ent('sign', 382, 13, { text: 'THE WIND TURNS EVERY THREE BREATHS. JUMP WITH IT AND FLY; AGAINST IT, THORNS.' });
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
  ent('sign', 439, 13, { text: 'EVERY GAP LIFTS YOU AND THE WIND TURNS OFTEN. STEP OFF AND LET IT CARRY YOU.' });
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
  ent('sign', 514, 13, { text: 'THE FLAGS POINT THE WAY: OVER THE MILLS AND THE TUMBLE TO THE KITE POST.' });
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
  ent('sign', 549, 13, { text: 'THE MILL SAILS TURN WITH THE WIND: RIDE ONE UP. THE BANK LADDER LEAVES THE BOG.' });
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
  ent('sign', 601, 13, { text: 'BALES ROLL WITH THE WIND: JUMP OR CUT THEM. HORNBLOWERS BLOW YOU BACK.' });
  ent('check', 603, 13); ent('flagpost', 608, 13); ent('flagpost', 637, 13); ent('deco', 620, 13, { kind: 'cairn' });
  coins([606, 11], [613, 9], [620, 11], [631, 9], [638, 11], [646, 12]);

  // ---- 12. THE KITE POST: the edge of the moor, a wall of stone, and past it nothing but air. The shepherds'
  // great kite is tethered here. ----
  floor(650, 663, 14); block(664, 665, 5, 29);
  ent('stormkite', 659, 13);
  ent('sign', 652, 13, { text: 'TAKE HOLD OF THE GREAT KITE: ARROWS STEER, ROLL DARTS. IT WILL NOT WAIT.' });
  ent('check', 655, 13); ent('flagpost', 662, 13);
  // TWO HUNDRED AND NINE COLUMNS WITH NO CHECKPOINT IN THEM, the worst run in the game, and it is the last
  // stretch before the Windcaller - so a death out here costs you the whole approach. Three now: fifty-five,
  // forty, forty and seventy-four.
  /* (the checkpoints at 704, 757 and 806 went: they stood under the Sky Road, where you fly on the kite from 659 to 864 and never touch the ground to take one) */

  // ---- 13. THE SKY ROAD: the kite carries you down the wind to the summit - through the teeth of the crags,
  // the crow strings, the needle and the storm. The view does not wait. ----
  block(666, 859, 26, 29); spikes(666, 859, 25);
  const spire = (x, top) => { block(x, x + 1, top, 25); stone.push([x, x + 1, top, 25]); }, crag = (x, bot) => { block(x, x + 1, 0, bot); stone.push([x, x + 1, 0, bot]); };
  const rock = (x0, x1, y0, y1) => { block(x0, x1, y0, y1); stone.push([x0, x1, y0, y1]); }; // loose stone in the air, not grass
  const string = (x, y, n, gap, o) => { for (let i = 0; i < n; i++) ent('harpy', x + i * gap, y, Object.assign({ ph: i * 0.7 }, o || {})); };
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
  ent('sign', 870, 12, { text: 'THE SHAMAN BLINKS AND THROWS BOLTS. STRIKE OR BLOCK ONE BACK TO KNOCK HIM DOWN.', pyro: 'THE SHAMAN BLINKS AND THROWS BOLTS. STRIKE ONE BACK WITH YOUR STAFF TO DROP HIM.', paladin: 'THE SHAMAN BLINKS AND THROWS BOLTS. STRIKE OR AEGIS ONE BACK TO KNOCK HIM DOWN.' });
  ent('check', 864, 12); ent('gate', 905, 12);
  const roosts = [[868, 9], [882, 3], [897, 7], [875, 6], [890, 5]]; // where he stands: a stone's top, a ledge
  for (const e of L.ents) if (e.t === 'vent' && e.wind) { e.h = Math.round((e.h || 112) * 1.5); e.lift = 270; } // the moor's wind lifts you well clear of whatever it is meant to lift you onto

  const base = {
    W: L.W, H: L.H, grid: L.grid, ents: L.ents, START: { x: 3, y: 21 }, pools, falls: [], moversExtra: movers, gusts, hags, stone, roosts, thermals: true,
    duskStart: -1, duskLen: 1, music: 'adventure', night: false, glowNight: false,
    palette: { sky: [[126, 148, 182], [214, 220, 214]], far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(200,210,220,0.18)', grass: '#7a8a3a', grassL: '#a8b84a', grassD: '#4a5a2a', dirt: '#5a5040', dirtL: '#6e6450', dirtD: '#3a3228', canopy: ['#5a6a7a', '#7a8a9a', '#9aa8b8', '#c8d0d8'] },
    quest: { n: 3, item: 'kite', name: 'KITE', npc: 'squire', done: 'THE KITES ARE HOME', reward: 'relic', relic: 'windcloak' },
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }, { x0: 476 * TS, x1: 548 * TS, kind: 'mist' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 861 * TS, x1: 905 * TS, floor: 13 * TS, trigger: 868 * TS, wallL: 860, wallR: 906, boss: 'windcaller', music: 'musMountain', tint: '#bfe6f5', tintA: 0.06, fx: 'dust' },
    flight: { x1: 864, speed: 78, camY: 2, down: [] }, // the Sky Road: the kite lets go over the summit's near edge
  };
  // WIND RIVERS: the stream is the fast road; a bank ladder returns anyone who misses its exit.
  const R=grow(base,base,240,48);R.floor(240,287,26);R.floor(240,244,22);R.floor(283,287,20);
  for(let y=22;y<26;y++)R.set(241,y,T.NET);for(let y=20;y<26;y++)R.set(283,y,T.NET);
  R.plat(272,17,4);R.ent('sign',242,21,{text:'WIND RIVERS. JUMP INTO THE WOOL STREAM. JUMP AGAIN TO LEAVE IT.'});R.ent('check',286,19);R.coins([250,18],[259,18],[270,18],[274,16],[281,19]);
  R.R.airRails=[{x0:246*TS,x1:282*TS,y:19*TS,speed:280}];
  const mid=R.done(),D=grow(mid,mid,558,40);D.floor(558,597,22);D.floor(558,562,14);D.block(584,588,7,21);D.floor(589,597,14);
  for(let y=7;y<22;y++)D.set(583,y,T.NET);for(let y=14;y<22;y++)D.set(562,y,T.NET);
  for(const row of [18,14,10])D.plat(580,row,3);   /* THE LIPS STOP SHORT OF THE ROPE (Daniel 2026-09-22): four wide, they were laid over column 583 and cut the rope in three - the climb stopped under every lip and the level could not be finished */
  D.ent('sign',561,13,{text:'DOWNDRAFT CLIFF. CLIMB IN THE LULL. REST ON THE SHELTERED STONE LIPS.'});D.ent('check',595,13);D.coins([577,21],[581,17],[581,13],[581,9],[586,6]);
  D.R.downCliffs=[{x0:579*TS,x1:585*TS,y0:7*TS,y1:22*TS,period:5,on:2.5,shelters:[18,14,10].map(y=>[580*TS,584*TS,y*TS])}];
  D.R.stormSummit=true;D.R.playtestSections=[{name:'WIND RIVERS',x0:240,x1:287},{name:'DOWNDRAFT CLIFF',x0:558,x1:597}];
  return D.done();
}

// MORE GOLD. Every real wood runs this after it is built: it finds the long walkable stretches that pay
// too little for their length and lays small arcs of coins along them - never on a boss floor, never
// in water, never on top of a sign, a door, a gate or a friend, never inside anything solid, and the
// same arcs every time. A stretch that already has its share of coin is left as it is.

// THREE SILVER COINS HIDE IN EVERY WOOD, and the game only counts three: a silver's progress bit is
// `1 << i` and the ledger reads bits 1, 2 and 4. Seven levels had drifted over that across the rounds -
// the Hurricane had SEVEN - and every one past the third was a pickup that lit up, made its noise, and
// did nothing at all. Keep the three that are furthest apart (they are the three that ask for the most
// walking) and turn the rest into what they are worth in gold.
function silverTrim(L) {
  const sv = L.ents.filter(e => e.t === 'silver');
  if (sv.length <= 3) return L;
  const tall = L.H > L.W, key = e => tall ? e.y : e.x;
  const sorted = sv.slice().sort((a, b) => key(a) - key(b));
  const keep = new Set([sorted[0], sorted[sorted.length - 1]]);
  /* and the one furthest from both ends, so the three are spread over the whole walk */
  let best = null, bd = -1;
  for (const e of sorted) { if (keep.has(e)) continue;
    const d = Math.min(Math.abs(key(e) - key(sorted[0])), Math.abs(key(e) - key(sorted[sorted.length - 1])));
    if (d > bd) { bd = d; best = e; } }
  if (best) keep.add(best);
  L.silverExtra = sv.length - keep.size;
  for (const e of sv) { if (keep.has(e)) continue;
    e.t = 'coin';
    for (const dx of [-2, 2]) L.ents.push({ t: 'coin', x: e.x + dx, y: e.y }); }
  return L;
}

function sprinkleCoins(L) {
  const W = L.W, H = L.H, g = L.grid;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const stand = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.REED || t === T.CRYST;
  // a boss room is a box, not a column: the Sunspire's roof arena spans the whole mountain's width
  const rooms = [L.arena, L.mini].filter(Boolean).map(A => [A.x0 / TS - 1, A.x1 / TS + 1, (A.y0 !== undefined ? A.y0 / TS : A.floor / TS - 16) - 1, A.floor / TS + 1]);
  const wet = (x, y) => (L.pools || []).some(p => (p.shallow || p.harm) && x * TS >= p.x0 && x * TS <= p.x1 && y * TS + 8 > p.y - 2); // over a wading pool is fine, IN it is not - but you can swim to a coin, and the Deep is one pool a hundred and fifty rows deep
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
  const before = coins.size; let added = 0;
  // HOW MUCH GOLD IS A LEVEL'S WORTH? A flat two hundred is a lot in a four-hundred-column wood and
  // nothing in a nine-hundred-column moor, so it is measured against the same SPAN the difficulty curve
  // and the bot score against. The campaign's own typical is about forty a hundred.
  const span = spanOf(W, H);
  const cap = Math.min(345, Math.max(110, Math.round(span * 0.315) - before));   /* a quarter less: a playthrough paid 157% of everything the store sells */ // a lot more gold: there should always be some in sight
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
  // A LEVEL THAT GOES DOWN HAS NO LONG FLAT RUNS IN IT, and every pass above this one needs one. The Deep
  // came out at fourteen coins a hundred against a campaign typical of forty, and the Undercrown at
  // seventeen - not because they were meant to be poor but because the sprinkler could not see their shape.
  // In a shaft the way you travel is the ROPE and the DROP, so that is where the gold goes.
  { const put = (x, y) => { if (!free(x, y)) return false; L.ents.push({ t: 'coin', x, y }); coins.add(x + ',' + y); added++; return true; };
    const nearC = (x, y) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -2; dy <= 2; dy++) if (coins.has((x + dx) + ',' + (y + dy))) return true; return false; };
    // DOWN A ROPE: every third rung, off the side you can take with one hand (the rung itself is not air)
    for (let x = 1; x < W - 1 && added < cap; x++) { let run = 0;
      for (let y = 1; y < H && added < cap; y++) {
        const rope = at(x, y) === T.NET || at(x, y) === T.CLIMB;
        if (!rope) { run = 0; continue; }
        run++; if (run < 4 || run % 3 || nearC(x, y)) continue;
        if (!put(x + 1, y)) put(x - 1, y); } }
    // AND THE DROP OFF A LEDGE: three down the line of the fall, where you are going anyway
    for (let y = 2; y < H - 8 && added < cap; y++) for (let x = 1; x < W - 1 && added < cap; x++) {
      if (!(stand(at(x, y + 1)) && !solid(at(x, y)))) continue;          /* standing here */
      const d = x + 1 < W && !stand(at(x + 1, y + 1)) && at(x + 1, y) === T.AIR ? 1 : (!stand(at(x - 1, y + 1)) && at(x - 1, y) === T.AIR ? -1 : 0);
      if (!d) continue;                                                  /* with a lip on one side of it */
      let fall = 0; while (fall < 14 && at(x + d, y + 1 + fall) === T.AIR) fall++;
      if (fall < 6 || nearC(x + d, y + 2)) continue;                     /* and a real drop under the lip */
      for (const k of [2, 5, 8]) if (k < fall) put(x + d, y + k);
      x += 2; }
  }
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
  /* WHERE THE AIR IS, in the one list the breath clock and tools/breath.mjs both read (src/deepair.js). Every bit of it
     below is written LEFT of the grow at column 350, so it needs no remapping whether grow() carries these fields or not. */
  const airRooms = [], D = { vents: [], clams: [], bulbs: [], wrecks: [], pockets: [] };
  const vent = (x, y, h) => D.vents.push({ x, y, h });
  const clam = (x, y) => D.clams.push({ x, y });
  const wreck = (x, y) => D.wrecks.push({ x, y });

  // ---- 1. THE MELTFALLS: Highcrown's back face, five terraces and a fall off every lip ----
  block(0, 13, 8, H - 1);
  ent('npc', 4, 7, { kind: 'squire' });
  ent('sign', 2, 7, { text: 'THE LONG WATER. THE MOUNTAIN MELT RUNS SALT. FOLLOW THE WATER DOWN.' });
  ent('check', 4, 7); shallow(8, 13, 8, 16); // the stream on the top ledge, running for the lip
  fall(13, 8, 12);
  block(14, 33, 12, H - 1); plunge(14, 18, 12, 3); ent('eel', 16, 14);
  shallow(22, 33, 12, 16); ent('turtle', 27, 12, { face: -1 });
  for (const x of [24, 29]) ent('deco', x, 12, { kind: 'coralTuft', v: x % 3 });
  ent('sign', 20, 11, { text: 'YOU CAN SWIM: UP TO RISE, DOWN TO DIVE, JUMP AT THE SURFACE TO CLIMB OUT.' });
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
  ent('sign', 70, 19, { text: 'THE SCOUTS ARE NOT GOBLINS. THEY THROW A HARPOON HARDER THAN A MAN CAN.' });
  ent('sign', 62, 19, { text: 'THE WATER CAME UP THE HILL IN THE NIGHT. THERE ARE FISH IN THE CHIMNEY.' });
  block(73, 79, 18, 19); shallow(74, 79, 18, 16); ent('scout', 69, 19, { face: 1 }); ent('scout', 77, 17, { face: -1 });
  coins([57, 22], [59, 22], [62, 18], [64, 18], [67, 17], [70, 17], [75, 16], [78, 16], [61, 19], [65, 18], [72, 17], [76, 16]);
  fall(79, 18, 24);
  block(80, 105, 24, H - 1); plunge(80, 91, 24, 4); ent('eel', 84, 27); ent('eel', 89, 27);
  shallow(96, 105, 24, 16); ent('check', 95, 23); ent('sign', 92, 23, { text: 'TWO EELS IN THIS POOL. THE COINS ON THE BOTTOM ARE WORTH ONE BREATH, NOT TWO.' });
  ent('crab', 99, 23, { face: -1 }); ent('turtle', 103, 23, { face: -1 });
  ent('deco', 93, 23, { kind: 'barnacleRock', v: 1 }); ent('deco', 103, 24, { kind: 'coralTuft', v: 1 });
  coins([81, 26], [83, 25], [86, 25], [87, 26], [89, 25], [90, 26], [92, 22], [96, 22], [100, 21], [103, 21], [104, 22]);
  fall(105, 24, 28);
  block(106, 127, 28, H - 1); shallow(110, 122, 28, 16); ent('heronfoe', 116, 27, { face: -1 });
  for (const x of [112, 119]) ent('deco', x, 28, { kind: 'coralTuft', v: x % 3 });
  for (const [x, y, k, v] of [[21, 11, 'barnacleRock', 0], [46, 16, 'coralTuft', 2], [68, 19, 'barnacleRock', 1], [101, 24, 'saltCrust', 1], [97, 24, 'coralTuft', 0], [124, 27, 'barnacleRock', 0], [124, 27, 'saltCrust', 1]]) ent('deco', x, y, { kind: k, v });
  block(128, 139, 27, H - 1); // the ferry dock
  ent('sign', 129, 26, { text: 'STAND ON THE RAFT AND IT GOES. JUMP THE ROCKS. DO NOT LISTEN TO THE SINGING.' });
  air(132, 138, 30, 32); air(139, 139, 29, 32); // THE SMUGGLERS' CUT: a dry room under the dock, its mouth in the river
  ent('coin', 134, 32); coins([136, 31], [137, 32], [133, 31]);
  ent('sign', 136, 32, { text: 'A DRY ROOM UNDER THE DOCK, A CUT LADDER, AND A CHEST PRISED OPEN.' });
  ent('check', 132, 26); ent('deco', 138, 26, { kind: 'seaLantern', v: 1 }); ent('deco', 136, 26, { kind: 'netPoles' }); // (the Ferryman used to stand here: the raft goes without him)
  coins([108, 26], [110, 26], [112, 25], [114, 25], [117, 24], [120, 25], [123, 26], [124, 25], [126, 26], [130, 25], [134, 25], [137, 25]); ent('scout', 124, 27, { face: -1 });

  // ---- 2. THE FERRY RUN: the river, the raft, the rocks, the sirens and the Bore ----
  block(140, 277, 34, H - 1); deep(140, 277, 28, 34, { river: true, flow: 34 }); // it is a river: it carries whatever is in it downstream
  // ---- THE SUNKEN CART: something went in here with a cart and never came up. Two breaths of trapped air
  // under the rocks, an old eel in the hollow, and the river pushing you off it the whole time.
  ent('sign', 137, 26, { text: 'AIR UNDER THE ROCKS DOWNSTREAM WILL SAVE YOU. THE RIVER WILL NOT WAIT.' });
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
  ent('sign', 280, 26, { text: 'SALTREACH. THE LOW STREET FLOODS WITH THE TIDE; THE JETTY STAYS DRY.' });
  for (const [x, v] of [[291, 0], [297, 1]]) ent('deco', x, 26, { kind: 'fishCottage', v });
  block(300, 331, 29, H - 1); plat(300, 26, 32); // the low street, and the jetty over it
  pools.push({ x0: 300 * TS, x1: 332 * TS, y: 29 * TS + 2, base: 29 * TS, tideLo: 2, tideHi: -28, tidePeriod: 20, swim: true, shallow: true, depth: 0, bottom: 29 * TS, streetTide: true });
  ent('sign', 300, 25, { text: 'AT HIGH WATER THE LOW STREET IS A CANAL. AT LOW WATER, SILVER ON THE FLATS.' });
  ent('sluice', 302, 25); ent('sign', 305, 25, { text: 'STRIKE THE SLUICE WHEEL TO DRAIN THE STREET A WHILE, BEFORE THE SEA RETURNS.' });
  ent('deco', 303, 28, { kind: 'rowboat' }); ent('deco', 327, 28, { kind: 'netPoles' }); ent('coin', 330, 28); // the sand flats under the jetty's far end: walk them at low tide, swim them at high
  ent('stray', 305, 28, { kind: 'fisher' }); ent('tideguard', 309, 28, { face: -1 });
  ent('crab', 319, 28, { face: -1 }); ent('crab', 325, 28, { face: 1 });
  ent('urchin', 313, 28, { stays: true }); ent('urchin', 316, 28, { stays: true }); ent('urchin', 322, 28, { stays: true }); ent('urchin', 329, 28, { stays: true });   /* on the flats: at high water they are in the canal with you, at low water they are the floor you walk. By hand (the garrison's water test fails where the street's surface sits on it), and they STAY when the Sluice Bridge room is emptied for its ambush: they are the flats, not the ambushers */
  coins([284, 25], [289, 25], [294, 25], [302, 25], [304, 27], [312, 27], [314, 25], [320, 27], [322, 28], [308, 24], [318, 24], [324, 25], [328, 24]);
  block(332, 367, 27, H - 1);
  for (const [x, v] of [[336, 0], [344, 1], [352, 0], [360, 1]]) ent('deco', x, 26, { kind: 'fishCottage', v });
  for (const x of [334, 349, 365]) ent('deco', x, 26, { kind: 'seaLantern', v: 1 });
  ent('stray', 341, 26, { kind: 'fisher' }); ent('tideguard', 345, 26, { face: -1 });
  ent('stray', 358, 26, { kind: 'fisher' }); ent('tideguard', 355, 26, { face: 1 }); ent('scout', 363, 26, { face: -1 });
  ent('deco', 333, 26, { kind: 'bellTower' });
  ent('check', 364, 26); ent('sign', 350, 26, { text: 'THE TRIBUTE CHEST STANDS OPEN AND UNTOUCHED. WHAT THEY TAKE IS NOT GOLD.' });
  ent('deco', 339, 26, { kind: 'buoy' }); ent('deco', 353, 26, { kind: 'tributeChest' });
  coins([335, 24], [338, 25], [340, 24], [343, 25], [348, 25], [351, 24], [356, 25], [359, 24], [362, 25], [366, 25], [333, 25], [346, 24], [354, 24], [364, 24]);

  // ---- 4. THE SQUARE: the Tide Herald. The sea comes up the square in three steps; the stones in it are the dry ground ----
  block(368, 408, 30, H - 1);
  block(372, 375, 28, 29); block(378, 380, 27, 29); block(386, 390, 28, 29); block(393, 394, 28, 29); block(395, 397, 26, 29); block(402, 405, 28, 29); /* a step up to the high stone, or it walled the square in two */
  block(409, 411, 28, H - 1); block(412, W - 1, 27, H - 1);
  pools.push({ x0: 369 * TS, x1: 409 * TS, y: 30 * TS + 6, base: 30 * TS, swim: true, shallow: true, depth: 0, bottom: 30 * TS, arenaTide: true });
  ent('herald', 391, 29);
  ent('sign', 366, 26, { text: 'THE HERALD WALKS ON WATER. WHEN THE TIDE LEAVES HIM IN THE MUD, HURT HIM.' });
  ent('gate', 414, 26);

  // ================= THE AIR IN THE RIVER =================
  // The ferry run is a hundred and forty tiles of moving water with two bells in the whole of it, and the river is
  // pushing you off them the entire time. It is not a hard swim - the worst of it measures a second - but two bells
  // under a river is not enough to SEE, and the sign on the dock promises AIR UNDER THE ROCKS DOWNSTREAM. So there is
  // some, and it says so the way every other mouth of air in the game says so: it bubbles.
  { const gat = (x, y) => L.grid[y * W + x];
    const bed = x => gat(x, 32) === T.AIR && gat(x, 33) === T.AIR && gat(x, 34) === T.SOLID;
    for (let x = 148; x <= 272; x += 16) if (bed(x)) vent(x, 33, 5);
    for (const x of [172, 204, 240, 264]) if (bed(x)) clam(x, 33);
    for (const x of [188, 252]) if (bed(x)) wreck(x, 33);   /* what went into the river with the cart, and never came up */
  }

  const ret = {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 7 }, pools, falls, moversExtra: movers, airRooms, deep: D,
    duskStart: 99999, duskLen: 1, music: 'longwater', night: false,
    wetZone: [0, 107], bore: { x0: 140 * TS, x1: 278 * TS, surface: 28 * TS + 4, period: 12, speed: 280, h: 30 },
    quest: { n: 3, item: 'fisher', name: 'FISHERFOLK', npc: 'squire', done: 'THE FISHERFOLK ARE SAFE', reward: 'relic', relic: 'tidecharm' },
    palette: { set: 'shore', sky: 'sea', far: 'sea', mid: 'coast', near: 'shore', fg: 'shore', dress: 'shore', haze: 'rgba(248,220,176,0.10)',
      grass: '#7a9a5a', grassL: '#a8c47a', grassD: '#5a7a44', dirt: '#555e68', dirtL: '#6f7a84', dirtD: '#3e454e', canopy: ['#2a4a44', '#3a5e54', '#4a7264', '#6a8a70'] },
    weather: [{ x0: 0, x1: 108 * TS, kind: 'mist' }], ambient: [{ x0: 0, x1: 99999, kind: 'shore' }],
    arena: { x0: 369 * TS, x1: 409 * TS, floor: 30 * TS, trigger: 370 * TS, wallL: 368, wallR: 409, boss: 'herald', music: 'herald', tint: '#3a8aa0', tintA: 0.08, fx: 'motes' },
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
    ent('sign', 352, 26, { text: 'THE PIERS RISE AND FALL. RIDE ONE UP AND GET OFF BEFORE IT SINKS.' });
    ent('check', 354, 26);
    // SIX PIERS. Each one rises out of the channel and sinks back on its own beat: read them, do not rush them.
    const piers = [[365, 0.0], [372, 0.35], [379, 0.7], [386, 0.15], [393, 0.5], [400, 0.85]];
    for (const [x, ph] of piers) ent('mover', x, 34, { len: 3, range: 0, vert: true, rise: 8, period: 3.4, ph, stone: true });
    coins([366, 26], [373, 26], [380, 26], [387, 26], [394, 26], [401, 26]);
    // and a high road for anyone who would rather not. These were one-way LEDGES, which in a shore palette are
    // green and mossy, so five slabs of turf hung in the open sky over the sea and looked like a mistake. They
    // are rock now, and the tide has them: each one rises and falls out of step with the next, which is the
    // rule of this level said one more time.
    for (const [x, y, ph] of [[363, 22, 0], [371, 21, 0.55], [380, 22, 1.1], [389, 21, 1.65], [398, 22, 2.2]])
      ent('mover', x, y, { len: 3, range: 0, vert: true, rise: 26, period: 4.2, ph, stone: true });
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
  /* WHERE THE AIR IS, in the one list the breath clock and tools/breath.mjs both read (src/deepair.js) */
  const airRooms = [], D = { vents: [], clams: [], bulbs: [], wrecks: [], pockets: [] };
  const pocket = (x0, x1, y0, y1) => { airRooms.push([x0, x1, y0, y1]); D.pockets.push([x0, x1, y0, y1]); };
  const vent = (x, y, h) => D.vents.push({ x, y, h });
  const clam = (x, y) => D.clams.push({ x, y });

  // ---- 1. THE TIDEWAY: the backs of the wrecks, and the sea coming and going over them ----
  block(0, 12, 28, H - 1);
  ent('npc', 4, 27, { kind: 'squire' });
  ent('sign', 2, 27, { text: 'THE REEF. BRING BACK THE THREE ROYAL SEALS. WHEN THE TIDE RISES, TAKE THE RIGGING.' });
  ent('check', 9, 27);
  block(13, 118, 33, H - 1); // the reef bed under it all
  block(16, 26, 26, 32); block(30, 42, 27, 32); block(46, 58, 25, 32); block(62, 74, 27, 32); block(78, 92, 26, 32); block(96, 118, 24, 32);
  pools.push({ x0: 13 * TS, x1: 119 * TS, y: 33 * TS - 20, base: 33 * TS, tideLo: -20, tideHi: -148, tidePeriod: 22, swim: true, shallow: true, depth: 0, bottom: 33 * TS, streetTide: true, bell: true });
  net(28, 29, 17, 25); net(60, 61, 15, 24); net(94, 95, 16, 23); // the shrouds: the high road when the sea is over the backs
  plat(30, 18, 12); plat(50, 16, 10); plat(76, 17, 18); // spars across, from shroud to shroud
  ent('deco', 22, 25, { kind: 'mastStump' }); ent('deco', 52, 24, { kind: 'mastStump' });
  ent('deco', 36, 26, { kind: 'sailRag', v: 0 }); ent('deco', 84, 25, { kind: 'sailRag', v: 1 });
  ent('deco', 66, 26, { kind: 'wreckBow' }); ent('deco', 104, 23, { kind: 'capstan' });
  for (const [x, y, v] of [[20, 25, 0], [48, 24, 1], [88, 25, 2], [108, 23, 0]]) ent('deco', x, y, { kind: 'coralFan', v });
  for (const [x, y, r] of [[43, 22, 5], [59, 21, 5], [75, 22, 6]]) ent('mover', x, y, { len: 2, range: r, speed: 26 }); // wreckage still afloat: the high road between the shrouds
  ent('seabell', 100, 23); ent('sign', 98, 23, { text: "STRIKE THE SHIP'S BELL: THE BIRDS GO UP AND THE DROWNED STOP TO LISTEN." });
  ent('scout', 50, 24, { face: -1 }); ent('sailor', 86, 25, { face: -1 }); ent('siren', 106, 23, { face: -1 });
  ent('petrel', 40, 19); ent('petrel', 88, 17);
  ent('urchin', 44, 32); ent('urchin', 76, 32);   /* in the troughs between the backs: they were built inside two of the wrecks */
  ent('sign', 18, 25, { text: 'HOLD UP TO CLIMB THE SHROUDS. WHEN THE WATER RISES THE LOW DECKS GO UNDER.' });
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
  ent('sign', 164, 35, { text: 'THE STRONGROOM. THE LOCK IS STILL SET FROM THE INSIDE.' });
  ent('capstan', 198, 27, { link: 'hoist' }); ent('sign', 194, 27, { text: 'TURN THE CAPSTAN THREE TIMES, THEN STAND ON THE PALLET TO RIDE UP HER DECKS.' });
  ent('deco', 133, 31, { kind: 'seaChest' }); ent('stray', 150, 31, { kind: 'seal' });
  ent('deco', 160, 31, { kind: 'wheel' }); ent('deco', 190, 27, { kind: 'rigging', v: 0 }); ent('deco', 172, 22, { kind: 'rigging', v: 1 });
  ent('deco', 142, 12, { kind: 'shipBell' }); ent('deco', 200, 12, { kind: 'figurehead' });
  ent('check', 130, 12); ent('check', 200, 27); ent('sign', 128, 12, { text: 'THE FIRST SEAL IS IN THE HOLD. GO DOWN WHEN THE WATER DROPS; CLIMB WHEN IT RISES.' });
  movers.push({ kind: 'lift', link: 'hoist', locked: true, x: 202 * TS, y: 27 * TS, y0: 27 * TS, y1: 12 * TS, w: 32, h: 8, speed: 34 }); // the pallet: it runs her whole side once the capstan is turned
  pools.push({ x0: 122 * TS, x1: 210 * TS, y: 32 * TS - 8, base: 32 * TS, tideLo: -8, tideHi: -272, tidePeriod: 26, swim: true, shallow: true, depth: 0, bottom: 32 * TS, streetTide: true, bell: false });
  ent('sailor', 136, 27, { face: 1 }); ent('scout', 176, 22, { face: -1 }); ent('sailor', 196, 17, { face: -1 });
  ent('netter', 160, 17, { face: 1 }); ent('netter', 190, 12, { face: -1 });
  ent('urchin', 128, 30); ent('crab', 168, 30); ent('urchin', 200, 30);
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
  darkZones.push({ x0: 262 * TS, x1: 331 * TS, y0: 12 * TS, y1: 38 * TS, dark: 0.42 }); // the deep half of the shelf: the anglers are the only lights in it (0.72 put the footing under the 20 L* it needs to read)
  current(236, 256, 14, 36, 1); current(290, 308, 14, 32, -1); // one carries you on, one stands in your way
  ent('check', 270, 33); ent('check', 302, 32);
  ent('sign', 264, 33, { text: 'THE LIGHTS IN THE DEEP ARE NOT LANTERNS. THEY ARE ON STALKS, ON SOMETHING.' }); // the two coral humps you can stand on, down here
  for (const [x, y] of [[226, 36], [244, 36], [262, 33], [278, 33], [298, 32], [316, 36]]) ent('deco', x, y, { kind: 'airBell' }); // a bell every few strokes: the breath is the clock down here
  ent('sign', 218, 36, { text: 'THE ONLY AIR IS IN THE DIVING BELLS: REACH ONE BEFORE YOUR BREATH GOES.' });
  for (const [x, y, v] of [[220, 36, 0], [244, 36, 1], [266, 33, 2], [300, 32, 0], [322, 36, 1]]) ent('deco', x, y, { kind: 'kelpTall', v });
  for (const [x, y, v] of [[238, 36, 0], [276, 33, 1], [316, 36, 0]]) ent('deco', x, y, { kind: 'brainCoral', v });
  ent('deco', 250, 36, { kind: 'urchinRock', v: 0 }); ent('deco', 294, 36, { kind: 'urchinRock', v: 1 });
  ent('mover', 290, 30, { len: 3, range: 16, speed: 42 }); // a drifting plank: ride it through the current that will not let you swim
  ent('turtle', 240, 26); ent('crab', 254, 20); ent('urchin', 282, 28); ent('urchin', 300, 22); ent('urchin', 318, 30);
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
  ent('sign', 336, 29, { text: 'THE LAST SEAL IS IN THE STERN CABIN, THE ONLY DRY ROOM LEFT. CLIMB HER RIBS.' });
  ent('deco', 356, 25, { kind: 'anchor' }); ent('deco', 370, 23, { kind: 'spar', v: 0 }); ent('deco', 390, 20, { kind: 'seaChest' });
  ent('deco', 344, 29, { kind: 'lanternBuoy', v: 1 }); ent('deco', 388, 20, { kind: 'shipBell' });
  ent('sign', 386, 20, { text: "THE CAPTAIN'S SEAL, UNBROKEN. SHE WENT DOWN RATHER THAN HAND IT OVER." });
  ent('stray', 392, 20, { kind: 'seal' });
  ent('sailor', 348, 27, { face: -1 }); ent('sailor', 370, 23, { face: -1 }); ent('netter', 358, 25, { face: -1 });
  ent('petrel', 360, 18); ent('petrel', 386, 14);
  movers.push({ kind: 'lift', x: 404 * TS, y: 25 * TS, y0: 25 * TS, y1: 14 * TS, w: 32, h: 8, speed: 30 }); // the stern tackle, still rigged
  coins([404, 13], [408, 13], [396, 14], [392, 14]);
  ent('check', 404, 25);
  block(387, 412, 26, H - 1); block(413, 424, 28, H - 1); // the broken deck under her cabin, running on to the hole
  ent('sign', 406, 25, { text: 'SOMETHING LIVES IN THE HOLE AT THE REEF\'S END. WHEN THE WATER RISES, TAKE THE STONES.' });
  coins([334, 29], [340, 29], [348, 27], [356, 25], [362, 25], [368, 23], [374, 23], [380, 21], [386, 21], [396, 20], [404, 25], [410, 25], [418, 27]);

  // ---- THE MAW: the arena, and the holes it lives in ----
  block(425, 456, 34, H - 1);
  block(430, 433, 31, 33); block(438, 442, 30, 33); block(447, 450, 31, 33); // coral stools: dry ground when the water comes up
  block(453, 456, 30, H - 1); block(457, W - 1, 29, H - 1);
  pools.push({ x0: 425 * TS, x1: 453 * TS, y: 34 * TS + 6, base: 34 * TS, swim: true, shallow: true, depth: 0, bottom: 34 * TS, arenaTide: true });
  ent('deco', 427, 33, { kind: 'airBell' }); ent('deco', 444, 33, { kind: 'airBell' });   /* not in the two-tile slot at 452: the bell is twice that wide and stood in the rock both sides */
  for (const x of [429, 437, 445, 451]) ent('deco', x, 33, { kind: 'bubbleVent' }); // its four holes, each one venting: watch which one is breathing
  ent('reefmaw', 440, 33);
  ent('gate', 458, 28);

  // ================= THE AIR ON THE SHELF (nothing is dug after this: it reads the finished grid) =================
  // Her own sign says THE ONLY AIR IS IN THE DIVING BELLS, and there were six of them strung through a hundred and
  // twenty tiles of water with rock laid over the whole of it, so there is no surface anywhere to come up to. The
  // deepest corner of it measured 5.05s against a six second lung. Six bells is a tightrope; it is also one idea said
  // once. The shelf keeps its air three ways now, and a swimmer can see the next one from the last:
  //   UNDER THE ROOF  the rock over the shelf is not flat, and air has gathered in the hollows of it
  //   OFF THE BED     cracks in the reef floor, each with its column of gas standing over it
  //   IN THE CLAMS    shut on a lungful until something strikes them
  // Every placement asks the grid first, so none of it lands inside a coral pillar or a hump of the bed.
  { const gat = (x, y) => L.grid[y * W + x];
    const bed = x => gat(x, 35) === T.AIR && gat(x, 36) === T.AIR && gat(x, 37) === T.SOLID;
    const roof = (x, n) => { for (let q = 0; q < n; q++) if (!(gat(x + q, 12) === T.SOLID && gat(x + q, 13) === T.AIR && gat(x + q, 14) === T.AIR)) return false; return true; };
    for (let x = 216; x <= 320; x += 18) if (roof(x, 6)) pocket(x, x + 5, 13, 14);
    for (let x = 218; x <= 326; x += 12) if (bed(x)) vent(x, 36, 8);
    for (const x of [228, 246, 290, 318]) if (bed(x)) clam(x, 36);
    /* THE ALCOVE the adverse current guards. The last royal seal is in it and there was not one breath of air in the
       room: seven tiles of water walled in on all four sides. Now the pocket the seal was left in has air in it. */
    { let ok = true; for (let x = 321; x <= 327; x++) if (gat(x, 17) !== T.AIR || gat(x, 18) !== T.AIR) ok = false;
      if (ok) pocket(321, 327, 17, 18); }
  }

  const ret = {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 27 }, pools, falls: [], moversExtra: movers, gusts, darkZones, airRooms, deep: D,
    duskStart: 99999, duskLen: 1, music: 'reef', night: false,
    interiors: [[34, 93, 26, 29, 'ship'], [116, 177, 22, 29, 'ship'], [247, 300, 24, 26, 'ship'], [302, 371, 17, 21, 'ship']], // ONLY the enclosed spaces: a backdrop that reaches above a deck hangs a stone wall in the sky
    wetZone: [0, 119], storm: true, dark: 0.01, edgeLit: 'rgba(210,244,244,0.7)',   /* the readability pass: at high tide her decks were teal under teal; a cold lit lip on every edge you can stand on reads through the water */
    hullZones: [[16, 26, 26, 30], [30, 42, 27, 31], [46, 58, 25, 29], [62, 74, 27, 31], [78, 92, 26, 30], [96, 118, 24, 28], [119, 212, 6, 34], [378, 400, 15, 25]], // her timbers; below them the reef takes over again
    quest: { n: 3, item: 'seal', name: 'ROYAL SEALS', npc: 'squire', done: 'THE SEALS ARE FOUND', reward: 'relic', relic: 'diverlamp' },
    palette: { set: 'reef', sky: 'storm', far: 'reef', mid: 'wrecks', near: 'reef', fg: 'reef', dress: 'reef', haze: 'rgba(180,200,205,0.12)',
      grass: '#5f7a68', grassL: '#88a890', grassD: '#40564a', dirt: '#4a5058', dirtL: '#666e78', dirtD: '#32363e', canopy: ['#1e3a3a', '#2c4e4a', '#3a6258', '#548070'] },
    weather: [{ x0: 0, x1: 213 * TS, kind: 'rain' }, { x0: 331 * TS, x1: 99999, kind: 'rain' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'shore' }],
    arena: { x0: 425 * TS, x1: 453 * TS, floor: 34 * TS, y0: 24 * TS, trigger: 426 * TS, wallL: 424, wallR: 453, boss: 'reefmaw', music: 'reefmaw', tint: '#2a5a60', tintA: 0.1, fx: 'motes',
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
  const pools = [], movers = [], hullZones = [], airRooms = [];
  /* WHERE THE AIR IS, in the one list the breath clock and tools/breath.mjs both read (src/deepair.js) */
  const D = { vents: [], clams: [], bulbs: [], wrecks: [], pockets: [] };
  const pocket = (x0, x1, y0, y1) => { airRooms.push([x0, x1, y0, y1]); D.pockets.push([x0, x1, y0, y1]); };
  const vent = (x, y, h) => D.vents.push({ x, y, h });
  const clam = (x, y) => D.clams.push({ x, y });

  // the sea the whole town floats on: fall in and you swim, and the nets down every side are how you get back up
  block(0, W - 1, 38, H - 1); block(377, W - 1, 11, 37); // past her stern the level ends: no water, nowhere to fall
  pools.push({ x0: 0, x1: W * TS, y: 30 * TS, bottom: 38 * TS, shallow: false, swim: true, clear: true, sea: true, harm: true, foulCol: '#7a8a3a', foulColL: '#b8c85a', foulColD: '#3a4a1e' }); // tar, bilge and worse: swim it and it eats you, so cross above it

  // ---- THE ROCK: the Ferryman will not go closer than this ----
  block(0, 22, 26, 37);
  ent('npc', 4, 25, { kind: 'squire' });
  ent('sign', 2, 25, { text: 'THE FLOTILLA: FOUR SHIPS LASHED INTO A TOWN. PRESSED FISHERFOLK WORK THE OARS.' });
  ent('check', 8, 25); ent('deco', 17, 25, { kind: 'rowboat' });
  ent('sign', 14, 25, { text: 'CLIMB THE NETS ON THE HULLS TO GET OUT OF THE WATER. YOU WILL BE SEEN.' });
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
  ent('sign', 36, 23, { text: 'THE GALLEY. STOP THE LOOKOUT BEFORE HIS WHISTLE WAKES THE TOWN.' });
  for (const [x, y] of [[40, 29], [62, 29], [82, 29]]) ent('stray', x, y, { kind: 'fisher' });
  for (const x of [38, 60, 80]) ent('deco', x, 29, { kind: 'oarBench' });
  ent('deco', 44, 29, { kind: 'oar' }); ent('deco', 70, 29, { kind: 'oar' });
  // THE PRESS GANG: eight of them in the open with a bosun whistling them onto you. They come in a crowd
  // because a crowd is the only way they take anybody, and the crowd is the problem to solve.
  ent('sailor', 44, 23, { face: -1 }); ent('netter', 50, 23, { face: -1 }); ent('crab', 56, 23, { face: 1 });
  ent('cutlass', 61, 23, { face: 1 }); ent('cutlass', 68, 23, { face: -1 }); ent('cutlass', 74, 23, { face: -1 });
  ent('sailor', 84, 23, { face: 1 }); ent('cutlass', 90, 23, { face: -1 });
  ent('bosun', 78, 23, { face: -1 }); ent('bosun', 66, 29, { face: -1 }); ent('scout', 51, 10, { face: -1 });
  ent('sign', 42, 23, { text: 'THE PRESS GANG: BACK TO THE MAST AND SWING WIDE, OR KILL THE BOSUN FIRST.' });
  ent('sign', 56, 23, { text: 'THEIR GALLEY FIRE IS STILL LIT. WHOEVER WAS COOKING LEFT IN A HURRY.' });
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
  ent('manta', 104, 29);   /* skims the harbour under the swinging ropes and dives at whoever lands on the Galley or the Hulk */

  // ---- 2. THE HULK: a prize they never finished stripping ----
  block(113, 176, 22, 37); hullZones.push([113, 176, 22, 37]);
  rot(120, 130, 22); rot(146, 156, 22); // her planking is rotten through here
  air(116, 173, 24, 29); air(134, 138, 22, 23); // the hold, and the hole down into it
  pools.push({ x0: 116 * TS, x1: 174 * TS, y: 26 * TS, bottom: 30 * TS, shallow: false, swim: true, clear: true });
  net(170, 171, 22, 29); net(120, 121, 22, 29); // her ladders: up out of the flooded hold at either end
  ent('silver', 150, 29);
  ent('sign', 116, 21, { text: 'THE HULK. GREY PLANKS WILL NOT HOLD YOU: STAND ON ONE AND YOU GO THROUGH.' });
  ent('boarder', 128, 21, { face: -1 }); ent('boarder', 162, 21, { face: -1 });
  // THE CHOKE: her boarding net is the only quick way through the hulk's waist and they are standing in the
  // doorway of it, where a wide swing catches the frame and a heavy blow does not.
  ent('boarder', 152, 21, { face: -1 }); ent('boarder', 156, 21, { face: -1 }); ent('bosun', 160, 21, { face: -1 });
  ent('cutlass', 168, 21, { face: -1 }); ent('netter', 130, 29, { face: 1 });
  ent('sign', 148, 21, { text: 'NO ROOM TO SWING IN THE NET DOORWAY: GO THROUGH HEAVY, OR ROUND BY THE HOLD.' });
  net(145, 146, 10, 21); ent('marine', 146, 9, { face: -1 });
  ent('sign', 144, 21, { text: 'THE HOLD IS FLOODED. THERE IS A LADDER AT EITHER END.' });
  ent('deco', 140, 21, { kind: 'plunder', v: 1 }); ent('deco', 168, 21, { kind: 'rumBarrels', v: 0 });
  ent('coin', 172, 28); // down in her flooded hold, under the rotten planking
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
  ent('sign', 173, 21, { text: 'KNOCK THE PLANK DOWN TO REACH THE POWDER HOY, OR SWIM AND CLIMB HER NET.' });
  net(181, 182, 24, 36); net(183, 184, 24, 29);
  ent('mover', 179, 22, { len: 2, range: 0, bob: true }); coins([179, 21]); // a hatch cover riding the swell, for anyone who will not drop the plank
  ent('manta', 181, 28);   /* the same harbour, under the plank crossing */

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
  ent('sign', 228, 24, { text: 'STRIKE THE GUN TO OPEN THE FLAGSHIP\'S SIDE. KEGS BLOW IF HIT: MIND YOUR FEET.' });
  // THE RIGGING: three marines above her deck, shooting down it while you cross, and a spar to go up after them
  ent('marine', 198, 14, { face: -1 }); ent('marine', 210, 14, { face: -1 }); ent('scout', 222, 14, { face: -1 });
  ent('crab', 200, 24, { face: -1 }); ent('cutlass', 224, 24, { face: -1 }); ent('bosun', 214, 24, { face: 1 });
  ent('boarder', 236, 24, { face: -1 }); ent('sailor', 190, 24, { face: 1 });
  net(196, 197, 15, 23); net(210, 211, 15, 23); net(224, 225, 15, 23);
  for (let x = 197; x <= 224; x++) set(x, 14, T.ONEWAY);
  coins([200, 13], [210, 13], [220, 13]);
  ent('sign', 194, 24, { text: 'MARINES SHOOT DOWN THE DECK AND THE SHOTS SKIP OFF THE PLANKS. TAKE THE LINES UP.' });
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
  ent('sign', 250, 21, { text: 'THE QUARTERMASTER WILL NOT FIGHT ON ONE DECK: SHE CLIMBS AND CUTS THE WAY UP.' });
  ent('marine', 306, 15, { face: -1 }); ent('marine', 340, 10, { face: -1 }); // they were standing in the air over her quarterdeck
  ent('cutlass', 262, 21, { face: -1 }); ent('cutlass', 284, 21, { face: -1 }); ent('boarder', 320, 15, { face: -1 });
  ent('cutlass', 274, 21, { face: 1 }); ent('bosun', 284, 21, { face: -1 }); ent('lookout', 316, 15, { face: 1 }); ent('cutlass', 344, 15, { face: -1 });
  for (const [x, y] of [[266, 21], [322, 21], [312, 15], [348, 10]]) ent('cannon', x, y, { deck: true });
  // HER AFT GUN DECK: it was fifty tiles of empty corridor under her quarterdeck. It is her magazine now.
  ent('deco', 334, 21, { kind: 'plunder', v: 1 }); ent('deco', 352, 21, { kind: 'kegStack' }); ent('deco', 344, 21, { kind: 'lanternDeck', v: 0 });
  ent('silver', 360, 21); ent('cutlass', 340, 21, { face: -1 }); ent('marine', 356, 21, { face: -1 });
  // ================= HER GUNS, AND WHERE YOU LEARN THEM =================
  // Every gun in the fleet is laid and loaded, and one blow on the breech fires it. The first two are out
  // here with six of her own crew standing down the line of the first, so the lesson arrives whole: a gun
  // goes off, the deck clears, and you know what the four in her arena are for.
  ent('cannon', 118, 21, { deck: true });
  ent('sign', 114, 21, { text: 'STRIKE THE BREECH AND THE GUN FIRES DOWN THE DECK. THEN IT IS TOO HOT A WHILE.' });
  ent('cannon', 192, 24, { deck: true });
  ent('sign', 188, 24, { text: 'THE FLEET IS FULL OF THEM, AND SO IS HER SHIP. A BALL WILL BREAK A GUARD NOTHING ELSE WILL.' });
  coins([330, 20], [338, 20], [346, 20], [354, 20], [362, 20]); ent('sign', 326, 21, { text: 'HER MAGAZINE: POWDER AFT, GUNS FORWARD. DO NOT LINGER.' }); // HER OWN GUNS: when she goes behind her guard, bring one to bear
  ent('sign', 306, 15, { text: 'HER CHART MARKS THE WRECKS, AND A RING ROUND SOMETHING DEEPER: THEIR SHARE.' });
  ent('deco', 312, 15, { kind: 'chartTable' }); ent('deco', 344, 10, { kind: 'plunder', v: 0 });
  ent('deco', 360, 10, { kind: 'plunder', v: 2 });
  ent('deco', 256, 26, { kind: 'lanternDeck', v: 1 }); ent('deco', 288, 26, { kind: 'rumBarrels', v: 1 });
  // THE FLAGSHIP: three masts, full canvas, and the black flag at her main truck
  for (const [x, v] of [[268, 0], [306, 1], [344, 0]]) ent('deco', x, 21, { kind: 'mastTall', v });
  ent('deco', 262, 13, { kind: 'sailRag', v: 0 }); ent('deco', 300, 8, { kind: 'sailRag', v: 1 }); ent('deco', 338, 4, { kind: 'sailRag', v: 0 });
  ent('deco', 268, 9, { kind: 'pennant', v: 1 }); ent('deco', 306, 4, { kind: 'pennant', v: 1 }); ent('deco', 344, 0, { kind: 'pennant', v: 1 });
  ent('deco', 280, 19, { kind: 'rigging', v: 0 }); ent('deco', 326, 19, { kind: 'rigging', v: 1 });
  // ================= HER MASTS, WHICH WERE NOT THERE =================
  // Every flag and every rag of canvas on the fleet was hung in open sky: mastTall is a five-tile prop and
  // the masts it stands for are twenty, so the pennants flew on nothing at all. Each one gets a mast under
  // it now - shrouds from the flag down to the first thing solid - which is also twenty tiles of rigging to
  // climb that the level never had.
  for (const e of L.ents) {
    if (e.t !== 'deco' || (e.kind !== 'pennant' && e.kind !== 'sailRag')) continue;
    for (let y = e.y + 1; y < H; y++) { const i2 = y * W + e.x;
      if (L.grid[i2] !== T.AIR) break;
      L.grid[i2] = T.NET; if (e.x + 1 < W && L.grid[y * W + e.x + 1] === T.AIR) L.grid[y * W + e.x + 1] = T.NET; }
  }

  for (const x of [252, 264, 276, 288, 316, 330]) ent('deco', x, 24, { kind: 'gunport', v: x % 2 });
  ent('deco', 246, 21, { kind: 'figurehead' }); ent('deco', 292, 18, { kind: 'wheel' });   /* on the deck: 296,21 was inside the quarterdeck */
  ent('deco', 244, 21, { kind: 'boardingNet' });
  ent('check', 254, 21); ent('check', 304, 15); ent('silver', 300, 26);

  coins([258, 21], [266, 21], [274, 21], [282, 21], [290, 21]);
  coins([252, 26], [266, 26], [278, 26], [296, 26]);
  coins([306, 15], [314, 15], [322, 15], [330, 15]);
  coins([342, 10], [350, 10], [358, 10], [366, 10]);
  /* A WAY UP SHE CANNOT CUT (rule B4). Her two cuts take the lines at 302 and 330; the shrouds at 306 now run all the way down
     to the main deck, so a player who loses sight of her in the rigging can always follow her onto the second deck.
     (Laid last: nothing is dug after it.) */
  for (let y = 16; y <= 21; y++) for (const x of [306, 307]) { const i3 = y * W + x; if (L.grid[i3] === T.AIR || L.grid[i3] === T.ONEWAY) L.grid[i3] = T.NET; }
  ent('quarter', 288, 21);
  ent('gate', 374, 10);

  // ================= THE AIR IN THE HULK (nothing is dug after this: it reads the finished grid) =================
  // The flotilla had NO air in it at all - not one box in the whole level - and the one place you actually go under is
  // the prize's flooded hold, which you cross twice. Her harbour is tar and bilge and kills whatever swims in it, so
  // there is deliberately none out there: air in the foul water would be a promise the level does not keep. In her hold
  // there is air where a hold keeps it - trapped up under her deck beams, leaking off the bed of her, and in the clams
  // that have grown on her since she was taken.
  { const gat = (x, y) => L.grid[y * W + x];
    const hold = x => gat(x, 28) === T.AIR && gat(x, 29) === T.AIR && gat(x, 30) === T.SOLID;
    const roofed = (x, n) => { for (let q = 0; q < n; q++) if (!(gat(x + q, 23) === T.SOLID && gat(x + q, 24) === T.AIR && gat(x + q, 26) === T.AIR)) return false; return true; };
    for (const x of [122, 150]) if (roofed(x, 6)) pocket(x, x + 5, 24, 26);   /* up under her deck beams, over the flood */
    for (const x of [126, 140, 154, 166]) if (hold(x)) vent(x, 29, 4);
    for (const x of [132, 160]) if (hold(x)) clam(x, 29);
    for (const x of [130, 162]) if (hold(x)) ent('deco', x, 29, { kind: 'airBell' });   /* what they went down in to strip her */
  }

  const ret = {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 25 }, pools, falls: [], moversExtra: movers, hullZones, airRooms, deep: D,
    duskStart: 99999, duskLen: 1, music: 'flotilla', night: false, swell: { amp: 2, period: 4.6 },
    interiors: [[34, 93, 26, 30, 'ship'], [116, 173, 24, 30, 'ship'], [248, 340, 24, 27, 'ship'], [340, 372, 12, 15, 'ship']],
    // ROOMS OF THEIR OWN (dressing only: [x0, x1, top row, floor row, kind]): the first hull's galley, the second's flooded brig,
    // the powder room under the Quartermaster's deck, and her own cabin up under her poop with the charts on the table
    cabins: [[36, 70, 26, 30, 'galley'], [118, 172, 26, 30, 'brig'], [288, 338, 24, 27, 'magazine'], [341, 371, 12, 16, 'cabin']],
    quest: { n: 3, item: 'fisher', name: 'FISHERFOLK', npc: 'squire', done: 'THE OARS ARE EMPTY', reward: 'relic', relic: 'blackflag' },
    palette: { set: 'ship', sky: 'harbour', far: 'harbour', mid: 'harbour', near: 'harbour', fg: 'rig', dress: 'ship', haze: 'rgba(255,196,140,0.08)',   /* a town of ships at the end of the day (src/redraw/harbour.js) */
      grass: '#8a9a5a', grassL: '#b4c47a', grassD: '#5a6a3a', dirt: '#6a5a44', dirtL: '#9a8464', dirtD: '#43382a', canopy: ['#2a4a44', '#3a5e54', '#4a7264', '#6a8a70'] },
    ambient: [{ x0: 0, x1: 99999, kind: 'ship' }],
    arena: { x0: 258 * TS, x1: 374 * TS, floor: 22 * TS, y0: 8 * TS, trigger: 262 * TS, wallL: 257, wallR: 374, boss: 'quarter', music: 'quartermaster', tint: '#c9b27c', tintA: 0.06, fx: 'motes',
      decks: [[22 * TS, 260, 370], [16 * TS, 304, 370], [11 * TS, 338, 368]], cuts: [[302, 303, 11, 21], [330, 331, 6, 16]], fallFrom: 366, fallTo: 304 },
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
  const pools = [], movers = [], hullZones = [], darkZones = [], airRooms = [];
  const FOUL = { foulCol: '#7a8a3a', foulColL: '#b8c85a', foulColD: '#3a4a1e' };
  /* WHERE THE AIR IS, in the one list the breath clock and tools/breath.mjs both read (src/deepair.js) */
  const D = { vents: [], clams: [], bulbs: [], wrecks: [], pockets: [] };
  const pocket = (x0, x1, y0, y1) => { airRooms.push([x0, x1, y0, y1]); D.pockets.push([x0, x1, y0, y1]); };
  const vent = (x, y, h) => D.vents.push({ x, y, h });
  const clam = (x, y) => D.clams.push({ x, y });
  const wreck = (x, y) => D.wrecks.push({ x, y });

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
  ent('deco', 14, 17, { kind: 'figurehead', hang: true });                 // her head, hung off the bow under your feet
  ent('deco', 20, 15, { kind: 'shipBell' }); ent('deco', 46, 15, { kind: 'anchor' });
  ent('sign', 18, 15, { text: 'HER BELL. THEY RANG IT FOR THE WATCH AND FOR THE DEAD, AND IT IS STILL RINGING ITSELF.' });
  ent('sign', 26, 19, { text: 'THE WAVE COMES FROM WINDWARD. TAKE A LINE, CLIMB, OR GO BELOW. ON DECK, JUMP IT.' });
  ent('check', 30, 19); ent('npc', 34, 19, { kind: 'squire' });
  ent('sign', 44, 19, { text: 'HER LANTERNS ROLLED INTO THE CORNERS. BRING THEM BACK FOR HER LIGHTS.' });
  ent('sign', 50, 19, { text: 'SHE ROLLS. WHEN SHE HEELS, HOLD A LINE, PUT A BITT AT YOUR BACK, OR STAND ON THE SAND.' });
  ent('deco', 40, 19, { kind: 'kegStack' }); ent('deco', 24, 19, { kind: 'hammock', v: 0 }); ent('deco', 32, 19, { kind: 'rumBarrels', v: 1 }); ent('deco', 46, 19, { kind: 'washing' }); ent('deco', 28, 19, { kind: 'hammock', v: 1 });
  coins([28, 18], [36, 18], [48, 18]);

  // ================= 2. THE FORE WAIST: her foremast, and the hands still aboard =================
  net(72, 73, 6, 19); ent('deco', 72, 19, { kind: 'mastTall', v: 0 }); ent('deco', 66, 12, { kind: 'sailRag', v: 0 });
  ent('deco', 72, 5, { kind: 'pennant', v: 1 });
  for (const x of [60, 86, 100, 112]) shroud(x);
  for (const [x0, x1, y] of [[74, 88, 12], [60, 70, 11], [100, 112, 12]]) { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); }
  ent('sailor', 62, 19, { rise: true, face: -1 }); ent('netter', 92, 19, { face: -1 }); ent('crab', 106, 19, { face: 1 });
  ent('scout', 76, 19, { face: 1 }); ent('tideguard', 114, 19, { face: -1 }); ent('cutlass', 70, 26, { face: 1 }); ent('scout', 100, 26, { face: -1 });
  ent('lookout', 72, 5, { face: -1 });
  for (const [gx, gy] of [[80, 8], [84, 7], [88, 8]]) ent('petrel', gx, gy, { gull: true, face: -1 });   /* A FLOCK in the wind over her yards: they come down one at a time */
  ent('cargo', 92, 18, { kind: 'barrel' }); ent('cargo', 110, 18, { kind: 'crate' });   /* loose on her deck, and they go where she leans */
  ent('sign', 57, 19, { text: 'THEY WANT HER BACK AND THEY DO NOT CARE THAT SHE IS SINKING.' });
  air(66, 67, 20, 20); net(66, 67, 20, 26); // the fore hatch down into her hold
  // FORWARD OF THE HATCH: her forepeak, where the cable and the spare canvas live. It is a walk with an end
  // to it, so it is worth the walk - the stores, the men guarding them, and her silver at the head of her.
  ent('sign', 60, 26, { text: 'THE FOREPEAK. THEY PUT MEN ON IT, SO SOMETHING IS DOWN THERE.' });
  ent('deco', 56, 26, { kind: 'coiledCable', v: 0 }); ent('deco', 48, 26, { kind: 'kegStack' });
  ent('deco', 40, 26, { kind: 'rumBarrels', v: 1 }); ent('deco', 32, 26, { kind: 'waterButt' });
  ent('deco', 26, 26, { kind: 'plunder', v: 2 }); ent('deco', 22, 26, { kind: 'chartTable' });
  ent('cutlass', 44, 26, { face: 1 }); ent('marine', 34, 26, { face: 1 }); ent('bosun', 26, 26, { face: 1 });
  ent('torch', 38, 26); ent('silver', 24, 26);
  coins([58, 25], [54, 25], [50, 25], [46, 25], [42, 25], [38, 25], [30, 25], [28, 25], [22, 25], [20, 25]);
  ent('deco', 56, 19, { kind: 'rumBarrels', v: 0 }); ent('deco', 116, 19, { kind: 'boardingNet' });
  ent('stray', 90, 26, { kind: 'lamp' }); ent('torch', 84, 26); // her third lantern, rolled forward into her fore hold
  ent('check', 96, 19);
  coins([64, 18], [76, 18], [90, 18], [104, 18], [66, 10], [82, 10], [106, 11], [58, 18], [70, 18], [84, 18], [98, 18], [112, 18], [74, 10], [94, 25], [78, 25], [110, 25]);

  // ================= 3. THE BREACH: she is open to the sea amidships, and the sea has come in =================
  // Her waist is stove clean through and her hold is full to the deckhead. It is the same sea that is outside
  // her, so it is swum, not survived: over it on the spars and her own wreckage, or down into it and across.
  air(126, 174, 20, 26);
  pools.push({ x0: 126 * TS, x1: 175 * TS, y: 20 * TS + 2, bottom: 27 * TS, shallow: false, swim: true, clear: true });   /* PLAIN SEAWATER. It was bilge - harm and a foul green - and the flooded hold is better without the poison: the room, the route and everything in it are as they were, and the water is the sea */
  ent('sign', 121, 19, { text: 'SHE IS OPEN TO THE SEA AMIDSHIPS AND HER HOLD IS FULL OF IT. SWIM IT, OR GO OVER.' });
  plat(129, 17, 4); plat(137, 15, 4); plat(146, 17, 4); plat(155, 15, 4); plat(164, 17, 4);
  bob(133, 19); bob(142, 19); bob(151, 19); bob(160, 19); bob(169, 19); // her own wreckage, riding what is in her
  for (const x of [134, 143, 152, 161, 170]) net(x, x + 1, 14, 26);      // and a net hanging into the water at every bay of it: a swim is never a room with no door
  net(124, 125, 14, 19); net(175, 176, 14, 19);
  movers.push({ kind: 'swing', px: 150 * TS, py: 8 * TS, arm: 88, x: 0, y: 0, w: 32, h: 8, period: 3.2, phase: 0.6 });
  ent('marine', 140, 14, { face: -1 }); ent('seawitch', 165, 16, { caller: true, face: -1 }); ent('lookout', 138, 14, { face: 1 }); ent('cutlass', 131, 16, { face: 1 }); // on her spars: the deck is gone under them
  coins([133, 18], [142, 18], [151, 18], [160, 18], [169, 18], [138, 14], [156, 14]);
  ent('deco', 122, 19, { kind: 'boardingNet' }); ent('deco', 118, 19, { kind: 'kegStack' }); ent('deco', 178, 19, { kind: 'rumBarrels', v: 0 }); ent('deco', 172, 19, { kind: 'boardingNet' });

  // ================= 4. THE GALLEY: a house on her deck, and the only dry corner in her =================
  block(184, 216, 16, 19); air(186, 214, 17, 19); air(184, 185, 17, 19); air(215, 216, 17, 19);
  plat(217, 16, 4); net(182, 183, 15, 19); net(217, 218, 15, 19);
  ent('torch', 190, 19); ent('deco', 194, 19, { kind: 'kegStack' }); ent('deco', 206, 19, { kind: 'chickenCoop' });
  ent('sign', 188, 19, { text: 'HER GALLEY. THE STOVE IS OUT AND THE COOK IS GONE AND THE KETTLE IS STILL SWINGING.' });
  ent('bosun', 202, 19, { face: -1 }); ent('cutlass', 210, 19, { face: -1 }); ent('sailor', 194, 19, { face: 1 }); ent('marine', 218, 15, { face: -1 });
  ent('check', 186, 19); ent('stray', 212, 19, { kind: 'lamp' });
  ent('deco', 198, 15, { kind: 'lanternDeck', v: 1 });
  coins([192, 18], [200, 18], [208, 18], [196, 15], [212, 15]);

  // ================= 5. THE MAIN WAIST: her mainmast, her tops, and the worst of the open deck =================
  net(270, 271, 6, 19); ent('deco', 270, 19, { kind: 'mastTall', v: 1 }); ent('deco', 264, 11, { kind: 'sailRag', v: 1 });
  ent('deco', 270, 5, { kind: 'pennant', v: 2 }); ent('deco', 270, 4, { kind: 'crowNest' });
  for (const x of [232, 248, 284, 300, 316]) shroud(x);
  for (const [x0, x1, y] of [[272, 288, 11], [250, 262, 12], [292, 306, 12], [232, 246, 11]]) { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); }
  ent('scout', 280, 10, { face: -1 }); ent('lookout', 270, 4, { face: -1 });
  ent('sailor', 232, 19, { rise: true, face: -1 }); ent('sailor', 241, 19, { rise: true, face: -1 }); ent('cutlass', 300, 19, { face: -1 }); ent('boarder', 312, 19, { face: -1 });
  ent('cutlass', 232, 26, { face: 1 }); ent('bosun', 260, 26, { face: -1 }); ent('seawitch', 300, 11, { caller: true, face: -1 });
  // HER PUMPS, amidships, where there was nothing but deck: three strikes on the brake and the water in her
  // hold goes down for twenty seconds - which is the only way to walk her orlop dry and get what is down there.
  // HER GUN DECK: four laid guns on the orlop, and the last one trained on the magazine's bulkhead
  block(268, 286, 21, 26);                                                 // the magazine, sealed
  air(272, 282, 22, 25);
  for (const x of [228, 240, 252]) ent('cannon', x, 26, { deck: true });
  ent('cannon', 264, 26, { hole: [268, 271, 22, 25] });
  ent('sign', 224, 26, { text: 'STRIKE A BREECH AND THE GUN FIRES. THE LAST ONE AIMS AT THE MAGAZINE WALL.' });
  ent('deco', 276, 26, { kind: 'kegStack' }); ent('deco', 280, 26, { kind: 'plunder', v: 1 });
  ent('deco', 278, 26, { kind: 'coiledCable', v: 1 });   /* 284 is inside the bulkhead: it was pushed out against it */ coins([273, 25], [278, 25], [282, 25]);
  ent('pump', 244, 19, { pool: 424 }); ent('sign', 240, 19, { text: 'WORK THE PUMP BRAKE TO DRAIN THE HOLD. THE ORLOP HIDES SOMETHING WHEN DRY.' });
  ent('deco', 250, 19, { kind: 'kegStack' }); ent('deco', 252, 19, { kind: 'waterButt' });   /* not on the shroud's foot at 248: a net is no floor, and it sank a row into the rail */
  ent('sign', 226, 19, { text: 'THE WAIST IS THE WORST OF HER: NO RAIL WORTH THE NAME AND NOTHING TO HOLD BUT THE SHROUDS.' });
  air(236, 237, 20, 20); net(236, 237, 20, 26);
  ent('deco', 228, 19, { kind: 'washing' }); ent('deco', 320, 19, { kind: 'boardingNet' }); ent('deco', 246, 19, { kind: 'kegStack' }); ent('deco', 264, 19, { kind: 'rumBarrels', v: 1 }); ent('deco', 308, 19, { kind: 'washing' }); ent('deco', 286, 19, { kind: 'hammock', v: 0 });
  movers.push({ kind: 'swing', px: 276 * TS, py: 8 * TS, arm: 88, x: 0, y: 0, w: 32, h: 8, period: 3.2, phase: 0.4 });
  movers.push({ kind: 'swing', px: 296 * TS, py: 8 * TS, arm: 96, x: 0, y: 0, w: 32, h: 8, period: 3.6, phase: 2 });
  coins([230, 18], [244, 18], [258, 18], [274, 18], [288, 18], [304, 18], [318, 18], [278, 10], [298, 11], [236, 18], [252, 18], [266, 18], [282, 18], [296, 18], [312, 18], [240, 25], [256, 25], [272, 25], [290, 25]);
  // AMIDSHIPS: the hands who are still trying to save her, and do not care that you are aboard
  ent('sign', 290, 19, { text: 'HER MAIN. THE CREW ARE STILL WORKING HER AND THEY WILL STILL KILL YOU FOR HER.' });
  ent('boarder', 322, 19, { face: -1 }); ent('sailor', 318, 19, { rise: true, face: -1 }); ent('bosun', 328, 19, { face: -1 });
  ent('check', 292, 19);
  // THE MAIN COMES DOWN (L.felled). Walk aft of her pump and the sky marks her mainmast and the deck she will land on;
  // a breath later she is down: her tops in a heap across the waist at 289, and her mast lying from the deck at 258 up
  // into the main yard at 280 - the old road shut and a new one up into the rigging. The orlop under her is still a
  // way aft, so nobody is ever shut in, and a death before the trigger stands her back up.
  ent('check', 222, 19); ent('sign', 234, 19, { text: 'HER MAIN IS THE TALLEST THING FOR A MILE, AND THE SKY HAS BEEN LOOKING AT IT ALL NIGHT.' });
  ent('cargo', 248, 18, { kind: 'barrel' }); ent('cargo', 302, 18, { kind: 'crate' });

  // ---- HER BULKHEADS: iron across the orlop, and only a round shot moves one ----
  { const door = (x, gun, teach) => {
      for (let y = 23; y <= 26; y++) { set(x, y, T.SOLID); set(x + 1, y, T.SOLID); }
      ent('bulkhead', x, 26, { span: [x, x + 1, 23, 26] });
      ent('cannon', gun, 26, { deck: true });
      if (teach) { ent('sign', teach, 26, { text: 'IRON BULKHEADS: AIM A GUN AT THE DOOR AND STRIKE THE BREECH. THEN LET IT COOL.' }); }   /* the sign wants a deck under it */
    };
    door(372, 358, 353);                      // 1. the gun sits in front of the door: the verb, taught plainly
    door(596, 612, null);                     // 2. the gun is BEYOND it - come at it from the far side
    ent('sign', 586, 26, { text: 'THIS ONE IS TRAINED THE WRONG WAY. THE HATCH ABOVE HER GOES DOWN PAST THE DOOR.' });
    for (let y = 20; y <= 22; y++) { set(604, y, T.AIR); set(605, y, T.AIR); }   // the hatch down past it
    set(604, 22, T.PLANK); set(605, 22, T.PLANK);
    door(208, 194, null);                     // 3. and one on the long dark run forward
    ent('sign', 186, 26, { text: 'THE FORWARD MAGAZINE. THEY SHUT IT WHEN SHE STRUCK AND NOBODY HAS BEEN IN SINCE.' });
    coins([374, 25], [376, 25], [598, 25], [600, 25], [210, 25], [212, 25]);
  }

  // ================= 6. UNDER HER: the rent in her side, and the sea in the lightning =================
  // She is holed at the turn of the bilge. You go into the water and out under her keel, and the sky is looking
  // for the water the whole way: an air bell every so often, and a hatch aft to come up through.
  air(336, 350, 20, 27); // the rent: her planking gone from the deck to the keel
  rot(332, 335, 20); rot(351, 354, 20);
  ent('check', 328, 19); ent('sign', 330, 19, { text: 'HER SIDE IS GONE. GO UNDER THE KEEL. WHEN THE SKY LIGHTS, BE UNDER THE WATER.' });
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
  ent('stray', 448, 26, { kind: 'lamp' }); ent('coin', 464, 26); ent('deco', 456, 26, { kind: 'plunder', v: 1 }); coins([446, 26], [454, 26], [462, 26], [470, 26]); // (under the water until the pumps run)
  ent('netter', 440, 26, { face: 1 }); ent('marine', 470, 26, { face: -1 }); ent('boarder', 456, 26, { face: -1 }); ent('crab', 464, 26, { face: -1 });
  ent('sign', 426, 26, { text: 'THE PUMPS HAVE STOPPED. WADING IS SLOW, AND SHE IS SINKING FASTER.' });
  ent('check', 432, 26);
  coins([434, 25], [442, 25], [450, 25], [458, 25], [466, 25], [474, 25]);
  for (const hx of [428, 476] ) { air(hx, hx + 1, 20, 20); net(hx, hx + 1, 20, 26); } // up onto her deck at either end

  // ================= 7b. THE EYE OF THE STORM: over her after hatch the wind drops, and there are stars =================
  // Fifty tiles of dead calm between the Weather Deck and the wreck (L.eye): no sea, no sky, no roll, no rain, the band
  // gone quiet, and nobody on her deck but a hand who has sat down to die. It is the only quiet place in her, and a
  // promise about the rest of her: past it the wash comes quicker and harder and the sky strikes more often.
  ent('sign', 436, 19, { text: 'THE EYE. THE WIND HAS DROPPED AND THE STARS ARE OUT. IT WILL NOT LAST.' });
  ent('npc', 452, 19, { kind: 'cook', name: 'HER COOK', lines: ['IT IS THE EYE OF IT. IT GOES QUIET LIKE THIS, AND THEN IT COMES BACK THE OTHER WAY, AND WORSE.', 'HER BOAT IS ON THE DAVITS ABAFT HERE. STRIKE THE WINCH AND SHE GOES DOWN TO THE OIL. SHE WILL CARRY YOU UNDER THE WRECK.', 'MIND THE BEAM IN THE WRECK. GET DOWN UNDER IT. I AM NOT GETTING UP, KNIGHT. TELL THE CAPTAIN I KEPT MY WATCH.'] });
  ent('deco', 446, 19, { kind: 'waterButt' }); ent('deco', 458, 19, { kind: 'coiledCable', v: 0 });
  coins([440, 17], [444, 16], [448, 17], [460, 17], [464, 16], [468, 17]);
  ent('check', 474, 19);
  // HER BOAT. On her davits over the oil, level with the deck. Strike the winch and she goes down to the oil; step
  // aboard and she goes, under the wreck's stove-in bottom (a beam across it you get down under), with the sky
  // marking her as she goes, to a rope ladder up her own side at the far end. The planks over the oil stay: the boat
  // is a way across, never the only one.
  ent('davit', 481, 19);
  movers.push({ kind: 'lifeboat', x: 486 * TS + 2, y: 19 * TS, hx0: 486 * TS + 2, hy: 19 * TS, w: 72, h: 8, speed: 70, dockX: 557 * TS - 72, beamX: 523 * TS + 8 });

  // ================= 8. THE WRECK ALONGSIDE: a smaller ship stove in against her, and oil on the water =================
  air(486, 556, 20, 27); // the gap between the two hulls, open to the sea
  block(500, 544, 24, 27); hullZones.push([500, 544, 24, 25]); // the wreck herself, down to her gunwale in it
  air(504, 540, 25, 26); air(500, 544, 26, 27); air(520, 521, 24, 24); net(520, 521, 24, 26);   /* her bottom is gone: her boat's lane runs under her deck */ // and a way up out of the wreck's hold, or it is a hole you fall into
  block(486, 556, 34, 35);                      // she is aground: the oil has a bottom, and things lie on it
  pools.push({ x0: 486 * TS, x1: 557 * TS, y: 28 * TS, bottom: 34 * TS, shallow: false, swim: true, harm: true, clear: true, pumpOil: true, oilHi: 28 * TS, ...FOUL }); // her oil on the water, and her beam takes it down
  ent('sign', 482, 19, { text: 'OIL BETWEEN THE SHIPS. CROSS ON THE ROPES, OR STRIKE THE WINCH AND TAKE HER BOAT.' });
  net(555, 556, 20, 33);   /* the rope ladder her boat fetches up against, and one more way out of the oil */
  plat(488, 17, 4); plat(497, 15, 4); plat(508, 17, 5); plat(520, 15, 4); plat(530, 17, 4); plat(542, 15, 4); plat(551, 17, 5);
  bob(493, 21); bob(515, 21); bob(536, 21); bob(547, 21);
  movers.push({ kind: 'swing', px: 504 * TS, py: 8 * TS, arm: 104, x: 0, y: 0, w: 32, h: 8, period: 3.4, phase: 1.1 });
  movers.push({ kind: 'swing', px: 528 * TS, py: 8 * TS, arm: 112, x: 0, y: 0, w: 32, h: 8, period: 3.8, phase: 2.6 });
  net(484, 485, 14, 19); net(557, 558, 14, 19);
  ent('deco', 512, 24, { kind: 'mastTall', v: 0 }); net(512, 513, 14, 33); // the wreck's mast, lying against her: a way up, and down into the oil
  net(494, 495, 20, 33); net(548, 549, 20, 33);                            // two more over the side: the oil is never a room with no door
  net(504, 505, 24, 33); net(538, 539, 24, 33);                            // and two through the wreck herself, or the oil under her is a lid
  ent('deco', 522, 23, { kind: 'sternWindows' }); ent('deco', 506, 23, { kind: 'boardingNet' }); ent('check', 508, 16);
  // HER OIL PUMP: work the beam and the foul water goes down to her bottom for twenty seconds, which is the
  // only way to walk under the wreck and take what went down with her.
  ent('pump', 508, 23, { pool: 486 });
  ent('sign', 502, 23, { text: 'WORK THIS BEAM TO SINK THE OIL A WHILE. SOMETHING LIES ON THE BOTTOM.' });
  ent('deco', 500, 33, { kind: 'plunder', v: 0 }); ent('deco', 536, 33, { kind: 'plunder', v: 2 }); ent('coin', 518, 33);
  coins([496, 33], [508, 33], [524, 33], [532, 33], [544, 33]);
  ent('scout', 516, 23, { face: -1 }); ent('tideguard', 534, 23, { face: -1 }); ent('seawitch', 499, 14, { caller: true, face: -1 }); ent('sailor', 490, 16, { face: 1 }); ent('lookout', 512, 13, { face: -1 }); ent('cutlass', 552, 16, { face: -1 });
  ent('manta', 495, 20); ent('manta', 545, 20);   /* the gap between the two hulls is open air down to the oil: she skims it and dives at the wreck's deck or the ropes either side */
  ent('coin', 528, 23); ent('deco', 532, 23, { kind: 'plunder', v: 2 });
  coins([493, 20], [500, 14], [510, 16], [520, 14], [530, 16], [540, 14], [548, 16], [518, 23], [526, 23]);
  ent('check', 560, 19);

  // ================= 9. THE AFT WAIST: her mizzen, her powder, and the last of the open deck =================
  net(600, 601, 6, 19); ent('deco', 600, 19, { kind: 'mastTall', v: 1 }); ent('deco', 594, 12, { kind: 'sailRag', v: 0 });
  ent('deco', 600, 5, { kind: 'pennant', v: 1 });
  for (const x of [572, 586, 614, 630, 646] ) shroud(x);
  for (const [x0, x1, y] of [[602, 616, 11], [580, 594, 12], [620, 634, 12]]) { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); }
  ent('boarder', 578, 19, { face: -1 }); ent('sailor', 592, 19, { rise: true, face: -1 }); ent('bosun', 624, 19, { face: -1 });
  ent('scout', 610, 10, { face: -1 }); ent('sailor', 640, 19, { rise: true, face: -1 }); ent('lookout', 600, 5, { face: -1 });
  ent('cutlass', 566, 19, { face: 1 }); ent('boarder', 601, 19, { face: -1 }); ent('seawitch', 628, 11, { caller: true, face: -1 });
  for (const [gx, gy] of [[644, 8], [648, 7], [652, 8]]) ent('petrel', gx, gy, { gull: true, face: -1 });
  // THE LOOSE GUN. Walk aft of her checkpoint and her aft gun works at its lashings and parts them. From then on
  // every heel runs it down her deck between two bitts (561 and 627): it crushes you, it crushes her crew, and it
  // goes through the cargo stacked across her waist at 614, which nothing else will. Strike it or dash into it to
  // send it at them. The spar at 608 still goes over the cargo, so the gun is a way through, never the only one.
  ent('loosegun', 586, 18, { trigger: 578 }); ent('cargowall', 614, 18, { span: [614, 615, 16, 18] }); ent('cargo', 570, 18, { kind: 'barrel' });
  ent('sign', 580, 19, { text: 'HER AFT GUN IS WORKING LOOSE. WHEN SHE HEELS IT RUNS: STRIKE IT AT THEM, OR AT HER CARGO.' });
  ent('deco', 621, 19, { kind: 'plunder', v: 1 }); coins([617, 18], [620, 18], [622, 18]);
  ent('check', 572, 19); ent('sign', 566, 19, { text: 'THE LAST OF HER OPEN DECK. HER POWDER IS UNDER YOUR FEET AND HER CAPTAIN IS AFT.' });
  air(636, 637, 20, 20); net(636, 637, 20, 26);
  ent('deco', 570, 19, { kind: 'rumBarrels', v: 0 }); ent('deco', 650, 19, { kind: 'boardingNet' }); ent('deco', 584, 19, { kind: 'kegStack' }); ent('deco', 616, 19, { kind: 'washing' }); ent('deco', 644, 19, { kind: 'hammock', v: 1 }); ent('deco', 596, 19, { kind: 'boardingNet' });
  ent('deco', 606, 26, { kind: 'kegStack' }); ent('deco', 620, 26, { kind: 'kegStack' }); ent('torch', 614, 26);
  ent('cutlass', 630, 26, { face: -1 }); ent('coin', 644, 26);
  // HER POWDER STORE, under the quarterdeck: the reason nobody goes aft with a light
  for (const hx of [664, 700, 730]) { air(hx, hx + 1, 20, 20); net(hx, hx + 1, 20, 26); }
  // THE DARK HOLD: no lamp of hers has burned back here in a year, and the only light is what comes through
  // her deck seams when the sky goes off.
  darkZones.push({ x0: 560 * TS, x1: 656 * TS, y0: 20 * TS, y1: 28 * TS, dark: 0.88 });
  ent('sign', 564, 26, { text: 'NO LIGHT BACK HERE. WAIT FOR THE SKY AND WALK WHILE IT IS WHITE.' });
  ent('deco', 576, 26, { kind: 'hammock', v: 0 }); ent('deco', 592, 26, { kind: 'bones', v: 1 });
  ent('marine', 584, 26, { face: -1 }); ent('cutlass', 600, 26, { face: 1 }); ent('boarder', 640, 26, { face: -1 });
  ent('sign', 660, 26, { text: 'HER POWDER STORE. NO LIGHT, NO IRON. THE CAPTAIN WAITS AFT.' });
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
  ent('sign', 652, 19, { text: 'THE CAPTAIN: BLADE, PISTOLS AND A HOOK. WHEN HE CALLS THE SEA, TAKE A LINE.' });
  net(700, 701, 8, 15); ent('deco', 700, 15, { kind: 'mastTall', v: 1 }); ent('deco', 700, 7, { kind: 'pennant', v: 1 });
  net(676, 677, 11, 15); net(716, 717, 11, 15); net(730, 731, 11, 15); // THE ARENA'S HANDHOLDS
  for (let x = 690; x <= 710; x++) set(x, 10, T.ONEWAY);
  ent('deco', 686, 15, { kind: 'sailRag', v: 1 }); ent('deco', 722, 15, { kind: 'rigging', v: 0 });
  ent('deco', 668, 15, { kind: 'lanternDeck', v: 0 }); ent('deco', 740, 15, { kind: 'sternWindows' });
  ent('deco', 736, 19, { kind: 'plunder', v: 1 }); ent('torch', 664, 19); ent('check', 696, 19); // the last one outside his walls
  coins([682, 14], [694, 14], [706, 14], [718, 14], [728, 14], [696, 9], [704, 9]);
  ent('captain', 732, 15);

  // ---- AND HER DECK IS NOT A PAVEMENT ----
  // Three hundred tiles of her waist were one flat line at row 19. Every dozen tiles now there is planking
  // that gives under a standing weight, a fallen spar to step up on, or a hole you jump, so crossing her
  // waist is a thing you do rather than a thing you hold right through.
  for (const [x, kind] of [[64, 'rot'], [96, 'spar'], [108, 'hole'], [232, 'rot'], [258, 'spar'], [292, 'hole'],
                           [580, 'rot'], [608, 'spar'], [628, 'hole'], [644, 'rot']]) {
    if (kind === 'rot') { rot(x, x + 3, 19); }
    else if (kind === 'spar') { plat(x - 1, 16, 5); plat(x + 4, 14, 4); }
    else { for (let q = 0; q <= 2; q++) set(x + q, 19, T.AIR); }             // a hole in her: jump it or drop into her hold
  }
  movers.push({ kind: 'swing', px: 120 * TS, py: 9 * TS, arm: 92, x: 0, y: 0, w: 32, h: 8, period: 3.3, phase: 1.4 });
  movers.push({ kind: 'swing', px: 600 * TS, py: 9 * TS, arm: 96, x: 0, y: 0, w: 32, h: 8, period: 3.7, phase: 0.3 });
  movers.push({ kind: 'swing', px: 636 * TS, py: 9 * TS, arm: 84, x: 0, y: 0, w: 32, h: 8, period: 3.1, phase: 2.2 });
  ent('deco', 700, 14, { kind: 'sternWindows' });                            // THE GREAT CABIN, lit from inside
  ent('deco', 716, 15, { kind: 'chartTable' }); ent('deco', 690, 15, { kind: 'wheel' });

  // FIVE POCKETS OF DECK WITH ONE WAY IN AND NO WAY ON. The whole rule of this ship is THE RIGGING IS THE
  // LEVEL: the deck under the upper works is broken into bays by the deckhouses, and you drop into a bay off
  // a shroud, take what is down there, and go back up another. Most of the bays have a shroud at each end.
  // Five of them did not, so they were forty tiles of walking out and forty back for a coin - and one of
  // them, the long bay abaft the mainmast, was shut at BOTH ends. Every bay has two shrouds now.
  for (const x of [266, 267, 287, 288, 370, 371, 374, 375, 557, 558, 594, 595])
    for (let y = 20; y <= 26; y++) set(x, y, T.NET);
  // HER BITTS (iron posts to put your back to when she heels) and the cargo only her loose gun goes through
  const BITTS = [[80, 18], [102, 18], [238, 18], [310, 18], [561, 18], [627, 18]];
  for (const [x, y] of BITTS) set(x, y, T.SOLID);
  for (let y = 16; y <= 18; y++) for (let x = 614; x <= 615; x++) set(x, y, T.SOLID);

  // ================= THE AIR UNDER HER (nothing is dug after this: it reads the finished grid) =================
  // Seven hundred tiles of sea ran under her keel with three bells in it, and those three sat a row too high to give a
  // swimmer anything at all: the worst coin down there was fifty-three seconds from a breath against a six second lung.
  // Air does not want placing by hand along a hull - it goes wherever her bottom planking still holds. So this walks her
  // length and asks the grid the question the fiction asks: is her bottom whole over this spot, with open water under it?
  // Where it is, there is air trapped against the underside of her. Where she is opened to the sea - the rent amidships
  // at 336, the gap between the two hulls at 486 - there is none, because it went up years ago. One rule, both jobs.
  { const gat = (x, y) => L.grid[y * W + x];
    const held = (x, n) => { for (let q = 0; q < n; q++) if (!(gat(x + q, 27) === T.SOLID && gat(x + q, 28) === T.AIR && gat(x + q, 29) === T.AIR)) return false; return true; };
    const bed = x => gat(x, 40) === T.AIR && gat(x, 41) === T.AIR && gat(x, 42) === T.SOLID;
    for (let x = 20; x <= 734; x += 20) if (held(x, 6)) pocket(x, x + 5, 28, 29);
    // AND HER BOTTOM BREATHES TOO. Thirteen rows below her keel a pocket up against her planking is too far to reach on
    // one lung, so the storm-turned bed vents between them, half a pocket out of step: a column of bubbles off the sand.
    for (let x = 30; x <= 734; x += 20) if (bed(x)) vent(x, 41, 7);
    // and things to steer by down there, where what was on her deck went down with her
    for (const x of [188, 452, 664]) if (bed(x)) wreck(x, 41);
    for (const x of [96, 276, 560, 700]) if (bed(x)) clam(x, 41);
  }

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 24, y: 19 }, pools, falls: [], moversExtra: movers,
    duskStart: 99999, duskLen: 1, music: 'hurricane', night: false, dark: 0.06,
    swell: { amp: 3, period: 3.8 }, stormClouds: true,
    // THE WASH: the rule of her open deck. It builds to windward, it tells you, and then it takes the deck.
    wash: { y0: 17 * TS, y1: 20 * TS, x0: 16 * TS, x1: 744 * TS, every: 9, tell: 3, speed: 210, dmg: 12 },   /* (18: a wave nobody jumped cost a fifth of a hero every nine seconds) */
    // THE LIGHTNING: it picks somewhere near you, says so, and hits it. Over water it runs along the surface.
    storm2: { every: 9, tell: 1.2, y: 20 * TS, zones: [[330 * TS, 424 * TS], [486 * TS, 558 * TS], [560 * TS, 744 * TS]] },
    hullZones, darkZones, airRooms, deep: D,
    interiors: [[20, 740, 21, 26, 'ship'], [186, 214, 17, 19, 'ship'], [504, 540, 25, 26, 'ship'], [662, 742, 17, 19, 'ship']],
    // ROOMS OF THEIR OWN in her hold and her deckhouses (dressing only: [x0, x1, top row, floor row, kind]): the galley forward,
    // the brig, the powder room aft of the mainmast, the chart room in the first deckhouse and the Captain's cabin under his deck
    cabins: [[22, 64, 21, 27, 'galley'], [70, 124, 21, 27, 'brig'], [184, 216, 17, 20, 'chart'], [292, 366, 21, 27, 'magazine'], [664, 700, 17, 20, 'cabin']],
    quest: { n: 3, item: 'lamp', name: 'HER LANTERNS', npc: 'squire', done: 'SHE HAS HER LIGHTS BACK', reward: 'relic', relic: 'stormline' },
    palette: { set: 'ship', sky: 'storm', far: 'stormsea', mid: 'swells', near: 'none', fg: 'rig', dress: 'ship', haze: 'rgba(150,170,180,0.16)',   /* one ship and the sea (src/redraw/storm.js) */
      grass: '#5f6a68', grassL: '#88928f', grassD: '#40484a', dirt: '#4a5058', dirtL: '#666e78', dirtD: '#32363e', canopy: ['#1e2a3a', '#2c3a4a', '#3a4a5a', '#54687a'] },
    weather: [{ x0: 0, x1: 431 * TS, kind: 'rain' }, { x0: 477 * TS, x1: 99999, kind: 'rain' }],   /* and none in the eye */
    ambient: [{ x0: 0, x1: 431 * TS, kind: 'ship' }, { x0: 431 * TS, x1: 477 * TS, kind: 'shore' }, { x0: 477 * TS, x1: 99999, kind: 'ship' }],
    arena: { x0: 702 * TS, x1: 744 * TS, floor: 16 * TS, y0: 6 * TS, trigger: 708 * TS, wallL: 701, wallR: 744, boss: 'captain', music: 'captain', tint: '#2a5a6a', tintA: 0.12, fx: 'motes' },
    // HER MASTS GO ONE AT A TIME. Lightning finds the fore first, then the main, then the mizzen.
    masts: [{ x: 72, at: 104 * TS, fell: false }, { x: 600, at: 640 * TS, fell: false }],   /* the main is not struck behind you: she is L.felled, in front of you */
    // SHE ROLLS: every ~15 s (x0.8 past the eye) a 2.4 s counted tell, then 3.4 s heeled over at 0.05 rad. The slope
    // pushes 92 px/s down her deck, rows 19-20 only (her open deck, not her yards, holds or deckhouses).
    roll: { every: 15, tell: 2.4, hold: 3.4, heel: 0.05, push: 92, x0: 53, x1: 744, y0: 19, y1: 20, not: [[428, 480]], grip: [[84, 87], [226, 229], [596, 599]], bitts: BITTS },
    felled: { x: 270, zone: [240, 256], band: [258, 292], foot: [258, 19], head: [280, 11], wall: [289, 291, 15, 18], tell: 1.8 },
    eye: { x0: 430, x1: 478, hard: { wash: 0.72, speed: 1.2, dmg: 1.15, storm: 0.65, roll: 0.8, push: 1.12 } },
    calm: [[430, 478, 10, 20]],   /* the garrison leaves the eye's deck empty */
    risers: true, callers: true, gulls: true,   /* her garrison's drowned hands rise, her storm-shamans call, her birds flock */
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
  const mass = (x0, x1) => { block(x0, x1, UP, 27); interiors.push([x0, x1, 28, ST - 1, 'drowned']); };
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
  air(34, 36, 11, 12); plat(37, 13, 2);         // torn open at the stern: her hold is a room you can get into
  ent('deco', 12, 12, { kind: 'sealDrift', v: 1 }); ent('deco', 24, 12, { kind: 'plunder', v: 0 }); ent('silver', 30, 12);
  ent('sign', 18, 12, { text: 'THE TRIBUTE SHIP SANK ON THE CITY SHE WAS PAYING. HER CARGO IS STILL ABOARD.' });
  ent('deco', 20, 9, { kind: 'mastStump' }); ent('deco', 12, 9, { kind: 'wreckBow' }); ent('deco', 30, 9, { kind: 'sternWindows' });
  ent('sign', 8, 9, { text: 'THE DROWNED CITY\'S LAMPS STILL BURN. UNDER EVERY HOOD THERE IS AIR.' });
  ent('check', 10, 9); ent('npc', 14, 9, { kind: 'squire' });
  ent('sign', 26, 9, { text: 'TAKE FIRE FROM A BURNING LAMP, CARRY IT, AND STRIKE A DEAD ONE TO LIGHT IT.' });
  plat(37, 10, 3); net(40, 41, 6, ST - 1);      // the diver's line: off the wreck and down through the surface
  ent('sign', 44, UP - 1, { text: 'THE ROOFS ARE DRY AND SLOW. THE STREET IS FAST AND LEAVES YOU NO AIR.' });
  mass(44, 76); air(58, 59, UP, 27); net(58, 59, UP, ST - 1);   // the first shaft down into the street
  flood(8, 44);                                 // the way in: you come down through the water and out of it
  lamp(22); lamp(50); lamp(66, true); lamp(74);
  ent('deco', 30, ST - 1, { kind: 'lampWreck', v: 0 }); ent('deco', 54, ST - 1, { kind: 'shellDrift', v: 0 });
  ent('deco', 6, ST - 1, { kind: 'sealDrift', v: 1 }); ent('deco', 10, ST - 1, { kind: 'sealDrift', v: 0 }); coins([8, 36], [14, 36]); // what went off the tribute ship, west along the paving
  ent('angler', 30, 32); ent('crab', 24, ST - 1); ent('urchin', 38, ST - 1);
  ent('check', 52, UP - 1);
  coins([20, 36], [26, 34], [34, 36], [48, 36], [56, 34], [64, 36], [72, 36], [46, 21], [62, 21]);
  weed(28, ST - 1, 1); weed(70, ST - 1, 0);

  // ================= 2. THE FISH MARKET: two roads, and the tide down the middle of one =================
  mass(80, 128); mass(136, 186);                // with a courtyard open to the water line between them
  flood(150, 190);                              // and the market's far end, where the main under it has gone
  darkZones.push({ x0: 78 * TS, x1: 190 * TS, y0: 26 * TS, y1: 42 * TS, dark: 0.4 });
  plat(130, 23, 5); plat(130, 21, 4);          // the courtyard: a ledge on the water, and a step across it
  air(94, 95, UP, 27); net(94, 95, UP, ST - 1); air(168, 169, UP, 27); net(168, 169, UP, ST - 1);
  ent('sign', 82, UP - 1, { text: "THE FISH MARKET. THE BEST TAKINGS ARE DOWN ON THE STREET, WITH THE WATCH." });
  for (const x of [86, 112, 150, 176]) ent('deco', x, UP - 1, { kind: 'stall', v: x % 2 });
  for (const x of [100, 124, 160]) ent('deco', x, UP - 1, { kind: 'column', v: x % 2 });
  ent('deco', 140, UP - 1, { kind: 'drownedCart' }); ent('deco', 118, UP - 1, { kind: 'sealDrift', v: 0 });
  lamp(84); lamp(104); lamp(124, true); lamp(146); lamp(166, true); lamp(184);
  lampUp(90); lampUp(132, true); lampUp(172);
  ent('wight', 98, UP - 1, { face: -1 }); ent('tideguard', 154, UP - 1, { face: -1 });
  ent('watch', 136, ST - 1, { face: 1 }); ent('wight', 100, ST - 1, { face: -1 }); ent('scout', 152, ST - 1, { face: -1 });   /* the first watchman on his own, between the pillars */
  ent('sign', 108, ST - 1, { text: 'THE WATCH THRUSTS FROM RANGE. GET INSIDE AND HE SWEEPS YOUR FEET: JUMP IT.' });
  ent('eel', 158, 33); ent('eel', 172, 31); ent('urchin', 164, ST - 1); ent('crab', 178, ST - 1); ent('urchin', 186, ST - 1);
  ent('snuffer', 120, UP - 1, { face: -1 });    // it only comes where the light has gone, and it takes more of it
  ent('stray', 128, ST - 1, { kind: 'lamp' });  // the first of his three lamps, down on the stones
  ent('deco', 156, ST - 1, { kind: 'plunder', v: 1 });
  ent('check', 88, UP - 1); ent('check', 134, 22); ent('check', 180, ST - 1);   /* (at 130 the step over the ledge went through the lamp on it) */
  ent('sign', 148, ST - 1, { text: 'THE TIDE RUNS THIS STREET, THEN TURNS. GO WITH IT AND IT CARRIES YOU TWO LAMPS.' });
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
  air(241, 242, 18, 21);                        // and the passage OUT behind the gate, or the hall is a box
  port(240, 16, 21);                            // the gate itself, shut until he is down
  interiors.push([196, 239, 14, 21, 'drowned']);
  darkZones.push({ x0: 196 * TS, x1: 240 * TS, y0: 13 * TS, y1: 23 * TS, dark: 0.66 });
  ent('sign', 190, UP - 1, { text: 'SOMETHING IN THE MARKET HALL IS PUTTING THE LAMPS OUT, ONE AT A TIME.' });
  ent('check', 190, UP - 1);                    // the one outside his wall
  for (const x of [200, 210, 220, 230, 237]) lampUp(x);
  ent('deco', 206, UP - 1, { kind: 'stall', v: 1 }); ent('deco', 226, UP - 1, { kind: 'drownedCart' });
  ent('deco', 216, 13, { kind: 'lampMain', v: 0, hang: true });
  ent('lampreeve', 234, UP - 1, { face: -1 });
  coins([202, 21], [208, 19], [214, 21], [222, 19], [228, 21], [234, 19]);
  ent('sign', 244, UP - 1, { text: 'HE WAS THE LAMPREEVE, AND LIT THIS STREET FORTY YEARS. SOMEONE TOLD HIM TO STOP.' });
  ent('check', 246, UP - 1); ent('deco', 248, UP - 1, { kind: 'lampWreck', v: 1 });

  // ================= 4. THE COUNTING HOUSE: where the tribute went =================
  // The vaults rise through the masonry band, so their crowns are ABOVE the water line: the ceiling shape IS
  // the air. Swim up into a pocket, breathe, swim on. The seals of thirty years are behind a portcullis and
  // the key is on the clerk who was locking it.
  mass(254, 356);
  flood(288, 340);                              // the counting house: its vaults are the flooded part of it
  darkZones.push({ x0: 254 * TS, x1: 356 * TS, y0: 26 * TS, y1: 42 * TS, dark: 0.4 });
  ent('sign', 256, UP - 1, { text: 'THE COUNTING HOUSE. AIR STANDS UNDER THE VAULTS: GO FROM CROWN TO CROWN.' });
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
  ent('deco', 330, ST - 1, { kind: 'plunder', v: 0 }); ent('silver', 334, ST - 1); ent('deco', 338, ST - 1, { kind: 'plunder', v: 2 }); ent('deco', 344, ST - 1, { kind: 'sealDrift', v: 1 });
  ent('stray', 333, 22, { kind: 'lamp' });                              // the second lamp, up in a vault
  ent('watch', 276, ST - 1, { face: -1 }); ent('watch', 312, ST - 1, { face: 1 }); ent('watch', 346, ST - 1, { face: -1 });
  ent('wight', 290, UP - 1, { face: -1 }); ent('tideguard', 324, UP - 1, { face: 1 });
  ent('eel', 296, 33); ent('angler', 316, 30); ent('angler', 330, 34); ent('urchin', 300, ST - 1); ent('crab', 320, ST - 1);
  ent('check', 263, UP - 1); ent('check', 271, 22); ent('check', 348, ST - 1);   /* (at 266 it was under the pocket's lip) */
  coins([258, 36], [266, 34], [274, 36], [282, 34], [290, 36], [298, 34], [306, 36], [314, 34], [322, 36], [338, 34], [346, 36],
    [272, 22], [302, 26], [334, 22], [264, 21], [292, 21], [328, 21], [352, 21]);
  for (const x of [272, 310, 340]) weed(x, ST - 1, x % 3);

  // ================= 5. THE LAMP WORKS: the machine the whole city breathes through =================
  // The bellows house. Three strikes on the beam and it blows the mains out: the water in the next stretch of
  // street goes down for twenty seconds AND every dead lamp in it comes up. Stop working it and it comes back.
  mass(358, 428);
  block(362, 363, 10, 21); block(424, 426, 10, 21); block(364, 423, 10, 11);
  air(362, 363, 18, 21); air(424, 426, 18, 21);
  interiors.push([364, 423, 12, 21, 'drowned']);
  ent('sign', 360, UP - 1, { text: 'THE LAMP WORKS PUSH AIR DOWN THE CITY PIPES. WORK THE BEAM.' });
  ent('deco', 380, UP - 1, { kind: 'bellows' }); ent('deco', 404, UP - 1, { kind: 'bellows' });
  ent('deco', 392, 11, { kind: 'lampMain', v: 0, hang: true }); ent('deco', 416, 11, { kind: 'lampMain', v: 1, hang: true });
  ent('pump', 396, UP - 1);
  ent('sign', 400, UP - 1, { text: 'WHILE THE BEAM WORKS, THE PROCESSION ROAD SINKS AND ITS LAMPS RISE.' });
  for (const x of [368, 388, 412, 422]) lampUp(x);
  ent('scout', 374, UP - 1, { face: 1 }); ent('watch', 410, UP - 1, { face: -1 });
  ent('snuffer', 418, UP - 1, { face: -1 });
  ent('stray', 386, UP - 1, { kind: 'lamp' });                          // the third lamp, on the bellows floor
  ent('npc', 372, UP - 1, { kind: 'lamplighter' });                     // the last lamplighter, and he will not leave
  ent('check', 366, UP - 1); ent('check', 420, UP - 1);
  ent('deco', 408, UP - 1, { kind: 'plunder', v: 1 }); ent('deco', 398, UP - 1, { kind: 'sealDrift', v: 0 });
  coins([366, 21], [374, 19], [382, 21], [390, 19], [398, 21], [406, 19], [414, 21], [422, 19]);

  // ================= 6. THE PROCESSION ROAD: the widest street and the fewest lamps =================
  // The hardest swim in the level, and the one the pump answers: a shallow pumped pool over the paving, piers
  // of the collapsed bridge rising and falling through it, and the watch in numbers along both roads.
  mass(430, 470); mass(480, 520); mass(530, 568);
  // the one stretch THE LAMP WORKS answers: while the beam is working its surface drops to wading depth and
  // its dead lamps come up, and when the beam stops it fills again
  pools.push({ x0: 468 * TS, x1: 524 * TS, y: WL, bottom: ST * TS, shallow: false, swim: true, clear: true, runTide: true, pumpRoad: true, roadHi: WL, roadLo: 37 * TS });
  darkZones.push({ x0: 428 * TS, x1: 572 * TS, y0: 26 * TS, y1: 42 * TS, dark: 0.44 });
  for (const [a, b] of [[470, 480], [520, 530]]) { plat(a + 1, 23, b - a - 2); plat(a + 2, 20, 3); } // two courtyards open on the water
  air(444, 445, UP, 27); net(444, 445, UP, ST - 1); air(556, 557, UP, ST - 1); net(556, 557, UP, ST - 1);
  ent('sign', 432, UP - 1, { text: 'THE PROCESSION ROAD. THE LAMPS ALONG IT ARE MOSTLY DEAD.' });
  lamp(434); lamp(456, true); lamp(476); lamp(498, true); lamp(516, true); lamp(540); lamp(562, true);
  lampUp(440, true); lampUp(492); lampUp(546, true);
  for (const x of [452, 486, 508, 536]) ent('deco', x, ST - 1, { kind: 'column', v: x % 2 });
  ent('deco', 466, ST - 1, { kind: 'drownedCart' }); ent('deco', 504, ST - 1, { kind: 'lampWreck', v: 0 }); ent('deco', 552, ST - 1, { kind: 'lampWreck', v: 1 });
  // THE PIERS of the collapsed bridge: they come up out of the paving and go down again
  for (const [x, ph] of [[448, 0], [462, 1.1], [494, 2.2], [512, 0.6], [544, 1.7]])
    ent('mover', x, ST - 1, { len: 3, range: 0, vert: true, rise: 9, period: 3.6, ph, stone: true });
  ent('wight', 438, ST - 1, { face: -1 }); ent('watch', 460, ST - 1, { face: 1 }); ent('watch', 488, ST - 1, { face: -1 });
  ent('watch', 510, ST - 1, { face: 1 }); ent('wight', 534, ST - 1, { face: -1 }); ent('tideguard', 560, ST - 1, { face: -1 });
  ent('scout', 450, UP - 1, { face: -1 }); ent('watch', 500, UP - 1, { face: 1 }); ent('watch', 550, UP - 1, { face: -1 });
  ent('angler', 476, 33); ent('angler', 516, 31); ent('eel', 482, 34); ent('eel', 496, 30); ent('eel', 508, 33);
  ent('urchin', 474, ST - 1); ent('urchin', 488, ST - 1); ent('crab', 502, ST - 1); ent('urchin', 514, ST - 1); ent('urchin', 520, ST - 1);
  ent('snuffer', 496, UP - 1, { face: -1 });
  ent('silver', 472, 22); ent('deco', 522, 22, { kind: 'plunder', v: 2 });
  ent('check', 436, UP - 1); ent('check', 472, 22); ent('check', 522, 22); ent('check', 564, UP - 1);
  ent('sign', 526, 22, { text: 'THE LAST LAMPS ARE DEAD AND THE SQUARE AHEAD IS LIT. HE KEEPS ONLY HIS OWN.' });
  coins([434, 36], [442, 34], [450, 36], [458, 34], [466, 36], [476, 34], [484, 36], [492, 34], [500, 36], [508, 34], [516, 36], [526, 34], [534, 36], [542, 34], [550, 36], [558, 34], [566, 36],
    [440, 21], [456, 21], [490, 21], [504, 21], [546, 21], [562, 21], [472, 22], [522, 22]);
  for (const x of [446, 484, 514, 554]) weed(x, ST - 1, x % 3);

  // ================= 7. THE TOLL GATE: his square =================
  // A raised plaza above the water line, lit in two rings of lamps, with a brazier at either end to carry fire
  // from. He puts the rings out one at a time; in his last phase he calls the water up into the square itself.
  mass(570, W - 1); block(570, W - 1, 28, 37);   // his gate stands on a solid mole: the street stops under it
  block(574, 575, 6, 21); block(696, 698, 6, 21); block(576, 695, 6, 7);
  air(574, 575, 18, 21);
  interiors.push([576, 695, 8, 21, 'drowned']);
  darkZones.push({ x0: 576 * TS, x1: 698 * TS, y0: 7 * TS, y1: 23 * TS, dark: 0.66 });
  ent('sign', 572, UP - 1, { text: 'THE TOLLMASTER DOUSES LAMPS. PARRY THE BOOK, JUMP THE ROD, NEVER BLOCK THE WEIGHT.' });
  ent('check', 578, UP - 1);                     // the one outside his walls
  ent('deco', 584, UP - 1, { kind: 'tollPost' }); ent('deco', 596, UP - 1, { kind: 'magistrate' });
  ent('deco', 604, UP - 1, { kind: 'sealDrift', v: 1 }); ent('deco', 614, UP - 1, { kind: 'grating' });
  ent('deco', 628, UP - 1, { kind: 'column', v: 0 }); ent('deco', 640, UP - 1, { kind: 'drownedCart' });
  lampUp(588); lampUp(600); lampUp(612); lampUp(624); lampUp(638, true);
  ent('watch', 592, UP - 1, { face: -1 }); ent('watch', 608, UP - 1, { face: 1 });
  ent('watch', 632, UP - 1, { face: -1 }); ent('snuffer', 644, UP - 1, { face: -1 });
  ent('check', 646, UP - 1);                     // three tiles outside his wall: a death costs the square, not the road
  ent('sign', 616, UP - 1, { text: 'HIS BRAZIERS NEVER GO OUT. TAKE FIRE FROM ONE TO RELIGHT THE LAMPS HE TAKES.' });
  coins([582, 21], [590, 19], [598, 21], [606, 19], [614, 21], [622, 19], [630, 21], [638, 19], [646, 21]);
  // HIS SQUARE: 44 tiles, two rings of lamps, the braziers at the edges, and the pool that fills it
  ent('brazier', 652, UP - 1); ent('brazier', 690, UP - 1);
  for (const x of [656, 664, 672, 683, 688]) lampUp(x);   /* 680 stood under the cornice at 678, and its post ran up through the cornice */
  ent('deco', 646, 7, { kind: 'lampMain', v: 0, hang: true }); ent('deco', 670, 7, { kind: 'lampMain', v: 1, hang: true });
  ent('deco', 658, UP - 1, { kind: 'column', v: 0 }); ent('deco', 636, UP - 1, { kind: 'column', v: 1 });
  plat(632, 20, 4); plat(638, 18, 3); plat(678, 20, 4);      // cornices over the square: the dash and the mantle
  ent('tollmaster', 684, UP - 1, { face: -1 });
  pools.push({ x0: 650 * TS, x1: 695 * TS, y: UP * TS + 8, bottom: UP * TS + 8, base: UP * TS + 8, shallow: true, depth: 0, dry: true, swim: false, clear: true, square: true });
  coins([633, 19], [639, 17], [656, 19], [668, 19], [679, 19], [688, 19]);
  ent('deco', 668, UP - 1, { kind: 'plunder', v: 0 });

  // ================= THE STREET, AS A PLACE: piers, and things hanging in the water =================
  // A flooded street with nothing in it is a box of blue. The city's arcade is still standing down there, so
  // every dozen tiles a pier comes down from the vault or up off the paving - never both in one bay, so the
  // street is a slalom you swim rather than a corridor you hold right on. They break the long swims up, they
  // give you something to put between yourself and an angler, and they are what makes the road read as a road.
  const busyAt = (x, r) => L.ents.some(e => e.t !== 'coin' && Math.abs(e.x - x) <= r && e.y >= 26 && e.y <= 40);
  const arcade = (x0, x1, seed) => {
    let k = seed;
    for (let mark = x0 + 8; mark < x1 - 8; mark += 13) {
      let x = -1; for (const o of [0, 2, -2, 4, -4, 6, -6]) if (!busyAt(mark + o, 2) && mark + o > x0 + 3 && mark + o < x1 - 5) { x = mark + o; break; }
      if (x < 0) continue;
      k++;
      if (k & 1) { block(x, x + 1, 28, 32); for (let y = 33; y <= 34; y++) { set(x, y, T.NET); set(x + 1, y, T.NET); } }  // a hanging pier, with its chain
      else { block(x, x + 1, 34, 37); set(x - 1, 34, T.ONEWAY); set(x + 2, 34, T.ONEWAY); }                                // a standing pier with a broken cornice
      if ((k & 3) === 0) ent('deco', x, k & 1 ? 32 : 33, { kind: 'lampMain', v: k & 1, hang: true });
    }
  };
  arcade(0, 44, 0); arcade(44, 78, 1); arcade(78, 190, 0); arcade(254, 356, 1); arcade(428, 572, 0);
  // and the weed that grows on a street nobody walks: along the paving, and hanging off the vault
  for (let x = 6; x < 570; x += 9) { if (busyAt(x, 2)) continue;
    if ((x % 18) === 6 && L.grid[37 * W + x] === T.AIR && L.grid[38 * W + x] === T.SOLID) ent('deco', x, 37, { kind: 'cityWeed', v: (x >> 3) % 3 });
    else if ((x % 27) === 15 && L.grid[28 * W + x] === T.AIR && L.grid[27 * W + x] === T.SOLID) ent('deco', x, 28, { kind: 'cityWeed', v: 2, hang: true });
  }

  // ================= THE ROOFS, AS A CLIMB: the dry road is not a corridor =================
  // Everything above is laid out section by section; this pass goes back along the roof road and BREAKS it.
  // Storeys stand on it, holes go through it into the street, mooring chains hang past it, and two hoists
  // swing over the courtyards. The point is that the safe road costs you jumps, and every hole in it is also
  // a way down to the fast one.
  const storey = (x0, x1, top) => { block(x0, x1, top, UP - 1); for (let x = x0; x <= x1; x++) set(x, top, T.SOLID); }; // a floor standing on the road
  const chain = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); };   // a mooring chain: climb it
  const holeIn = (x0, x1) => { air(x0, x1, UP, 27); };                                  // straight through into the water
  const hoist = (px, py, arm, period, phase) => movers.push({ kind: 'swing', px: px * TS, py: py * TS, arm, x: 0, y: 0, w: 30, h: 8, period, phase });

  // 1. the descent: one house to go over before the water, so the first thing the level asks for is a jump
  storey(62, 70, 18); plat(59, 20, 3); chain(71, 18, 21);
  ent('deco', 66, 17, { kind: 'shellDrift', v: 0 }); coins([60, 19], [66, 16], [72, 19]);

  // 2. the fish market: two market houses, three holes through the road, and a hoist over the courtyard
  storey(106, 110, 18); plat(103, 20, 3); chain(111, 18, 21);
  storey(142, 148, 18); plat(139, 20, 3); plat(149, 20, 3); chain(141, 14, 17);
  holeIn(92, 94); holeIn(180, 183); plat(181, 20, 2);
  hoist(132, 12, 96, 3.4, 0.6);                // and the hoist over it, which is the way up onto the roofs
  ent('deco', 108, 17, { kind: 'lampWreck', v: 1 }); ent('deco', 146, 17, { kind: 'shellDrift', v: 1 });
  ent('lantern', 145, 17, { city: true, dark: true });     // a lamp up on the market roof, and it is out
  coins([104, 19], [108, 16], [112, 19], [140, 19], [145, 16], [150, 19], [93, 19], [182, 19], [131, 20], [133, 20]);
  ent('coin', 108, 16);

  // 3. the counting house: its vault crowns are five rows over the road, so the way across a vault is the
  // broken arch on either side and the chain down the middle of it - or you drop in and swim, which is where
  // the air pocket and the seals are anyway
  for (const vx of [268, 300, 330]) {
    plat(vx - 2, 20, 4); plat(vx + 8, 20, 4); chain(vx + 5, 15, 26);   // and on up through the crown: the vaults are a high road too
    coins([vx - 1, 19], [vx + 9, 19], [vx + 5, 21]);
  }

  // 4. the lamp works: the machine floor is a climb. Beams, the bellows tops, and a chain to the pipe gallery.
  plat(370, 20, 4); plat(378, 18, 4); plat(386, 16, 4);
  plat(398, 20, 5); plat(406, 18, 4); plat(414, 16, 4); chain(392, 12, 21);
  coins([371, 19], [379, 17], [387, 15], [399, 19], [407, 17], [415, 15], [392, 16]);
  ent('lantern', 415, 15, { city: true, dark: true });     // the gallery lamp: worth the climb

  // 5. the procession road: a hoist over each courtyard, because the piers only take you halfway
  hoist(474, 14, 96, 3.2, 0.2); hoist(524, 14, 96, 3.6, 1.8);

  // 6. the approach to the toll gate: the last climb before his square
  storey(618, 626, 18); plat(615, 20, 3); chain(627, 18, 21);
  coins([616, 19], [622, 16], [628, 19]);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 10, y: 9 }, pools, falls: [], moversExtra: movers,
    duskStart: 99999, duskLen: 1, music: 'drowned', night: false, glowNight: true, dark: 0.32, darkZones, edgeLit: 'rgba(190,236,232,0.75)',   /* the readability pass: the flooded street was teal on teal (its walkways at a third of the contrast they need) under dark 0.5, so less of it, and a cold lit lip on every edge you can stand on */
    lampAir: true,                               // THE RULE: a lit lamp is a lungful of air
    // the cold of the place, as banks over the dry street: only a lamp opens a hole in it
    fog: [{ x0: 44 * TS, x1: 152 * TS, y0: 24 * TS, y1: 42 * TS, alpha: 0.5 },
      { x0: 190 * TS, x1: 290 * TS, y0: 24 * TS, y1: 42 * TS, alpha: 0.52 },
      { x0: 340 * TS, x1: 470 * TS, y0: 24 * TS, y1: 42 * TS, alpha: 0.48 },
      { x0: 524 * TS, x1: 700 * TS, y0: 24 * TS, y1: 42 * TS, alpha: 0.54 }],
    fogLamps: true,                              // and it is the LAMPS that cut it, not a wisp
    fogCol: '150,186,178',                       // and it is cold green water in it, not the marsh's white
    // the slabs over the market hall, the lamp works and his square are roofs, not floors: no gold up there
    noCoin: [[194, 242, 0, 12], [362, 426, 0, 10], [574, 698, 0, 6]],
    streetTide: { every: 14, tell: 2.4, flow: 34 },
    interiors,
    quest: { n: 3, item: 'lamp', name: 'HIS LAMPS', npc: 'lamplighter', done: 'THE STREET HAS ITS LIGHTS', reward: 'relic', relic: 'wick' },
    palette: { set: 'city', sky: 'drowned', far: 'city', mid: 'city', near: 'city', fg: 'city', dress: 'none', haze: 'rgba(20,70,66,0.22)',
      grass: '#4e7a58', grassL: '#7e9490', grassD: '#24402c', dirt: '#46595c', dirtL: '#58706f', dirtD: '#243036',
      canopy: ['#0d2826', '#113331', '#16403d', '#1b4c48'] },
    weather: [{ x0: 0, x1: 99999, kind: 'pollen' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'drip' }],
    mini: { x0: 198 * TS, x1: 238 * TS, floor: UP * TS, y0: 13 * TS, y1: 23 * TS, trigger: 204 * TS, wallL: 197, gate: 240, boss: 'lampreeve' },
    arena: { x0: 650 * TS, x1: 694 * TS, floor: UP * TS, y0: 8 * TS, trigger: 658 * TS, wallL: 649, wallR: 694, boss: 'tollmaster', music: 'tollmaster', tint: '#2a4a5a', tintA: 0.14, fx: 'motes' },
  };
}



// ============================================================================================
// LEVEL 20 - WAYMEET. You came up out of the sea and the sea went back with you, and nobody inland knows
// why. Three roads meet here, so everything going anywhere goes through it: an inn worth the name, a smith
// who never sits down, a stable yard full of other people's horses, and sworn swords off the road waiting
// for weather and waiting for work. The work is you. Somebody has put it about that the man who was at
// Highcrown when it fell should answer for it, and has hung a purse on it - so the innkeeper still serves,
// the smith still works, the crier still cries, and every blade in the common room has just looked up.
// ITS OWN RULE: holding the shield is not the answer to a man who fights the way you do. The PARRY is -
// the guard raised as the blow lands, six frames - and the town teaches it on slower and slower men until
// the last one, who cannot be hurt any other way at all.
//
// THE HEIGHTS, because a town is the first level in this game built mostly upward off one street:
//   36  the road          35  what you stand on
//   33  the awnings over the stalls (a jump clears three rows, so this is the first step up)
//   29  the roofs, and the men on them: a ladder from the street, or two hops off an awning
//   0-24 the insides. The camera never shows one of them from the street.
function waymeet() {
  const W = 776, H = 46, R = 36;
  const L = painter(W, H);
  const { block, floor, plat, ent, coins, set, spikes } = L;
  const movers = [], interiors = [], roofs = [], pools = [], ladders = [];
  block(0, W - 1, 0, 24);
  const room = (x0, x1, y0, y1, st = 'timber') => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); interiors.push([x0, x1, y0, y1, st]); };
  /* A HOUSE IS ITS ROOF and the street runs on underneath it, because a building that blocks the road is a
     wall and this town has one road. Three courses: the tile you walk on and the two under it. */
  const tiles = (x0, x1, y) => { for (let x = x0; x <= x1; x++) { set(x, y, T.SOLID); set(x, y + 1, T.SOLID); set(x, y + 2, T.SOLID); } roofs.push([x0, x1, y]); };
  const awning = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const board = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.PLANK); };
  /* EVERY LADDER IS HUNG LAST (rules I): they are written down here and laid after the last thing is dug */
  const ladder = (x, top) => ladders.push([x, top, R - 1]);
  const stair = (x, y0, y1) => ladders.push([x, y0, y1]);
  const post = (x) => ent('deco', x, R - 1, { kind: 'lanternPost' });
  const sign = (x, text) => ent('sign', x, R - 1, { text });

  // ---------------- 1. THE WEST ROAD (x 0-84). The milestone, the gate, and the notice. ----------------
  floor(0, 84, R);
  sign(4, 'WAYMEET. THREE ROADS MEET, SO THE INN IS FULL OF MEN WITH NOTHING TO DO.');
  ent('check', 8, R - 1);
  ent('deco', 6, R - 1, { kind: 'fence', v: 0 });   /* a cairn stood here: a stepped stone pile reads as a beach sandcastle in this dusty road light, so it is gone, not reskinned */
  ent('npc', 16, R - 1, { kind: 'shepherd' }); ent('dog', 20, R - 1); ent('deco', 24, R - 1, { kind: 'fence', v: 1 });
  coins([10, R - 2], [14, R - 2], [18, R - 2], [22, R - 2], [28, R - 2]);
  /* THE GATEHOUSE: a wall with an arch through it. You do not go round a town wall. */
  block(30, 49, 24, R - 1);
  room(30, 49, R - 6, R - 1, 'hall');
  ent('deco', 30, R - 1, { kind: 'gatehouse' });
  post(28); post(52);
  sign(52, 'THE NOTICE HAS YOUR FACE: A SUMMONS WITH A PURSE. NOBODY WANTS YOU DEAD. THEY DRAW.');
  ent('deco', 56, R - 1, { kind: 'stocks' }); ent('deco', 62, R - 1, { kind: 'trough' });
  /* THE FIRST ONE, in the arch, where you cannot walk round him - and he is the slowest man in the town. */
  ent('swornsword', 40, R - 1, { face: -1 });
  sign(68, 'RAISE THE SHIELD AS HIS BLOW LANDS, NOT BEFORE, AND HE IS WIDE OPEN.');
  ent('hedgeknight', 80, R - 1, { face: -1 }); ent('swornsword', 66, R - 1, { face: -1 });   /* the first hedge knight, alone on the street: his feint is learned before the market */
  sign(74, 'THE HEDGE KNIGHT FEINTS. A GUARD RAISED ON THE FAKE IS STILL UP WHEN THE REAL ONE LANDS.');
  ent('runner', 58, R - 1, { face: -1 }); ent('swornsword', 61, R - 1, { face: -1 }); ent('swornsword', 76, R - 1, { face: -1 }); ent('crossbow', 83, R - 1, { face: -1 });   /* THE ROAD'S OWN: a squire who runs for the swords, where a goblin cutpurse used to stand */
  coins([34, R - 2], [38, R - 2], [42, R - 2], [58, R - 2], [66, R - 2], [72, R - 2], [80, R - 2]);

  // ---------------- 2. THE MARKET CROSS (x 85-206). The square, and the town going about it. -----------
  floor(85, 206, R);
  ent('deco', 92, R - 1, { kind: 'well' }); ent('deco', 100, R - 1, { kind: 'stall', v: 0 });
  ent('deco', 110, R - 1, { kind: 'stall', v: 1 }); ent('deco', 118, R - 1, { kind: 'wares' });
  ent('deco', 188, R - 1, { kind: 'waterButt' }); ent('deco', 196, R - 1, { kind: 'dovecote' });
  post(96); post(186);
  ent('npc', 104, R - 1, { kind: 'bard' }); ent('dog', 122, R - 1); ent('dog', 200, R - 1);
  sign(88, 'THE MARKET CROSS. NOBODY HERE IS YOUR ENEMY, AND EVERYONE IS IN THE WAY.');
  /* THE MARKET HALL (x 95-123) is the square's crowd, locked in by AMBUSH; the men placed in it here stand down when the room
     fills. THE HORSE FAIR (x 181-209) was a second room and is ground again: its men are the fair's own crowd. */
  for (const x of [96, 106, 114, 122, 190, 202]) ent('swornsword', x, R - 1, { face: -1 });
  ent('crossbow', 104, R - 4, { face: -1 }); ent('runner', 194, R - 1, { face: -1 }); ent('hedgeknight', 184, R - 1, { face: -1 });
  ent('deco', 102, R - 10, { kind: 'bunting', hang: true });   /* left up from the fair */
  sign(192, 'THE BOY RUNS TO FETCH THE SWORDS. SHUT HIM UP, OR DEAL WITH WHAT HE BRINGS.');
  awning(98, 120, R - 3);                                   /* the awnings over the stalls: the first thing above the road */
  coins([102, R - 4], [110, R - 4], [118, R - 4], [90, R - 2], [192, R - 2], [200, R - 2]);
  ent('check', 198, R - 1);

  // ---------------- 2b. THE STOCKS & MARKET SQUARE (x 124-180). Fair day, and the pens are railed. --------------
  /* PLATFORMING, AND THE NEW CREATURE'S HOME. Between the market hall and the horse fair the square is given over to the
     beasts: iron-railed pens down the middle of the road, and the only way across them is what the fair left standing -
     the steps of the market cross, the stocks, and a shop sign swung out on its pulley. The Broken Lance has been
     emptying into the square since noon, and its regulars have found the high places.
       INTRODUCE  one drunk on the market cross steps, throwing at a man on flat road: see the ring, step off it.
       DEVELOP    two short pens with the stocks for a step between, under a drunk on a house roof you can climb to.
       TWIST      the long pen, crossed only on the swinging sign, while a second drunk throws bottles.
       TEST       the long pen again with both of them in reach of it, the balcony behind you and the bottle ahead. */
  ent('check', 127, R - 1);
  sign(129, 'FAIR DAY, AND THE DRUNKS ARE OUT. THE RING ON THE ROAD IS WHERE IT LANDS.');
  ent('npc', 130, R - 1, { kind: 'cook' });
  /* THE CARTER'S WAGON, left standing in the road with a drinker up on its bed: over your head, one jump from the road
     for whoever wants to put him on his back, and on nobody's landing */
  board(132, 136, R - 4); ent('deco', 134, R - 1, { kind: 'cart' });   /* the tilt on its poles, a hay wagon's height */
  for (const x of [132, 136]) ent('deco', x, R - 1, { kind: 'stilt' });
  block(131, 131, R - 1, R - 1);                             /* the mounting block under the end of it: the step up to him (clear of the sign's post) */
  ent('drunk', 134, R - 5, { face: -1, range: 1 });
  ent('deco', 138, R - 1, { kind: 'column' });              /* the market cross itself */
  coins([133, R - 6], [135, R - 6], [137, R - 2], [139, R - 2]);
  spikes(140, 142, R); block(143, 144, R - 1, R - 1); spikes(145, 147, R);   /* the first pen, and the stocks standing in it */
  ent('deco', 143, R - 2, { kind: 'stocks' });
  coins([141, R - 3], [146, R - 3]);
  tiles(150, 155, R - 9);                                    /* a house with the road under it, and a drunk at the eaves (its roof starts past the landing: nobody jumps into its gutter) */
  ent('drunk', 153, R - 10, { face: -1, range: 1 });
  ent('silver', 151, R - 11); coins([152, R - 11], [155, R - 11]);
  ladder(149, R - 10);                                       /* up to her eaves, beside the house and clear of the jumps */
  ent('deco', 153, R - 1, { kind: 'hayBale', v: 1 });
  block(156, 157, R - 2, R - 1);                             /* the mounting block, level with the sign */
  spikes(158, 165, R);                                       /* the long pen: eight tiles of railing and nothing standing in it */
  ent('mover', 158, R - 2, { len: 2, range: 5, speed: 30 });   /* the ironmonger's sign, swung out on its pulley */
  awning(166, 168, R - 2); ent('deco', 167, R - 1, { kind: 'stall', v: 0 });   /* and a stall's canopy to come down on */
  ent('deco', 161, R - 9, { kind: 'bunting', hang: true });
  coins([159, R - 4], [162, R - 4], [165, R - 4]);
  tiles(170, 176, R - 9);                                    /* and a second house, with the one who has found the bottles */
  ent('drunk', 173, R - 10, { face: -1, range: 2 });
  ent('deco', 174, R - 1, { kind: 'wares', v: 1 });
  coins([168, R - 2], [172, R - 2], [176, R - 2]);
  /* AND THEN A FIGHT, under the second house where the bottles cannot follow: the square alternates, crossing then crowd */
  ent('hedgeknight', 176, R - 1, { face: -1 }); ent('swornsword', 174, R - 1, { face: -1 });

  // ---------------- 3. THE BROKEN LANCE (x 207-300). The inn, the common room, and the beer garden. ----------
  floor(207, 300, R);
  tiles(212, 262, R - 7);                                  /* her roof, and the road runs under it */
  ladder(210, R - 8); ladder(264, R - 8);
  ent('deco', 236, R - 8, { kind: 'innSign', hang: true });
  post(216); post(258);
  sign(210, 'THE BROKEN LANCE. A GOOD FIRE, A BAD NAME, AND A DOOR ALWAYS OPEN.');
  ent('doorway', 224, R - 1, { id: 'lance-out', to: 'lance-in' });
  ent('doorway', 252, R - 1, { id: 'lance-back', to: 'lance-far' });
  ent('deco', 230, R - 1, { kind: 'barrels' }); ent('deco', 246, R - 1, { kind: 'waterButt' });
  ent('npc', 218, R - 1, { kind: 'oldknight' });
  coins([220, R - 2], [228, R - 2], [240, R - 2], [256, R - 2]);
  coins([216, R - 9], [230, R - 9], [244, R - 9], [258, R - 9]);
  for (const x of [220, 234, 248, 260]) ent('swornsword', x, R - 8, { face: -1 });   /* they are on her roof too */
  ent('crossbow', 240, R - 8, { face: -1 }); ent('crossbow', 226, R - 8, { face: -1 }); ent('hedgeknight', 254, R - 8, { face: -1 }); ent('swornsword', 238, R - 1, { face: -1 }); ent('swornsword', 250, R - 1, { face: -1 });
  /* THE BEER GARDEN. Outside her east wall, under the bunting: the one stretch of this town where nobody stands up
     when you walk in. The town drinks here - a carter, a knight with his helm on the bench beside him, a goodwife,
     a lad and an old soldier - and the tapster pours for anyone, even the man on the notice. It is the breath
     between the common room and the lists, so it holds no fight at all. */
  ent('deco', 267, R - 1, { kind: 'fence', v: 0 }); post(269); post(297);
  for (const x of [272, 283, 294]) ent('deco', x, R - 7, { kind: 'bunting', hang: true });
  ent('deco', 276, R - 1, { kind: 'longTable', v: 0 }); ent('deco', 273, R - 1, { kind: 'bench' }); ent('deco', 279, R - 1, { kind: 'bench' });
  ent('deco', 288, R - 1, { kind: 'longTable', v: 1 }); ent('deco', 285, R - 1, { kind: 'bench' }); ent('deco', 291, R - 1, { kind: 'bench' });
  ent('deco', 295, R - 1, { kind: 'barrels' }); ent('deco', 299, R - 1, { kind: 'caskRack' });
  ent('guest', 273, R - 1, { v: 0, face: 1 }); ent('guest', 279, R - 1, { v: 1, face: -1 });
  ent('guest', 285, R - 1, { v: 2, face: 1 }); ent('guest', 291, R - 1, { v: 1, face: -1 });
  ent('guest', 282, R - 1, { v: 3, face: 1 }); ent('guest', 270, R - 1, { v: 4, face: 1 });
  ent('npc', 297, R - 1, { kind: 'barkeep' });
  sign(266, 'THE BEER GARDEN. THEY DRINK TO YOUR HEALTH HERE: THE PURSE IS FOR YOU ALIVE.');
  coins([274, R - 2], [286, R - 2], [296, R - 2]);
  /* THE COMMON ROOM. Two doors, so you come out the far end and do not walk the same street twice. */
  /* `floor` fills to the bottom of the WORLD, so a floor laid inside a room on row 21 buries the street
     twenty rows below it. A room cut out of the solid block at the top already has one: rows 21-24. */
  room(20, 62, 8, 20, 'hall');
  ent('doorway', 24, 20, { id: 'lance-in', to: 'lance-out' });
  ent('doorway', 58, 20, { id: 'lance-far', to: 'lance-back' });
  /* FURNISH IT. A room forty tiles wide with four things in it is a barn; a common room is benches and
     tables and a fire somebody is cooking on, and the men who stand up out of it. */
  ent('deco', 29, 20, { kind: 'hearth' });                                 /* the fire nobody lets out */
  ent('deco', 35, 20, { kind: 'bench' }); ent('deco', 38, 20, { kind: 'longTable', v: 0 }); ent('deco', 41, 20, { kind: 'bench' });
  ent('deco', 49, 20, { kind: 'bench' }); ent('deco', 52, 20, { kind: 'longTable', v: 1 }); ent('deco', 55, 20, { kind: 'bench' });
  ent('deco', 58, 20, { kind: 'caskRack' }); ent('deco', 61, 20, { kind: 'coffer' }); ent('deco', 24, 20, { kind: 'barrels' });
  ent('deco', 45, 17, { kind: 'mugShelf', hang: true }); ent('deco', 52, 13, { kind: 'wares' }); ent('deco', 36, 13, { kind: 'caskRack' });
  ent('deco', 45, 20, { kind: 'counter' });
  ent('deco', 37, 8, { kind: 'hallWindow', hang: true }); ent('deco', 49, 8, { kind: 'hallWindow', hang: true });
  awning(30, 54, 14);                                      /* the gallery over the common room */
  stair(27, 14, 20); stair(56, 14, 20);
  ent('sign', 22, 20, { text: 'THE COMMON ROOM. THE INNKEEPER WILL NOT LOOK AT YOU. THE REST PUT DOWN THEIR CUPS.' });
  /* THE COMMON ROOM STANDS UP. This is the room the level is for: nine of them at once in a space the
     size of a barn, with two on the gallery shooting down into it. */
  for (const x of [30, 36, 44, 50, 56]) ent('swornsword', x, 20, { face: 1 });
  ent('hedgeknight', 40, 20, { face: 1 }); ent('hedgeknight', 52, 20, { face: -1 });
  ent('heavy', 34, 20, { face: 1 });
  ent('crossbow', 33, 13, { face: 1 }); ent('crossbow', 48, 13, { face: -1 });
  ent('swornsword', 42, 13, { face: -1 });
  ent('runner', 26, 20, { face: 1 }); ent('swornsword', 60, 20, { face: -1 });
  coins([26, 19], [30, 19], [36, 19], [44, 19], [50, 19], [56, 19], [34, 13], [40, 13], [46, 13]);
  ent('check', 60, 20); ent('silver', 40, 12);
  ent('stray', 50, 12, { kind: 'cup' });   /* over the gallery's own boards, so the gallery is the way to it */

  // ---------------- 4. THE TILT-YARD (x 301-350). The lists, and the man who keeps them. -----------------
  /* THE MINI. A yard between two gates with a rail down it and benches either side, and the Serjeant of the Lists
     on his horse at the far end. The gate shuts behind you. He charges the length of the yard: the benches are two
     rows up and a horse cannot follow you onto one, and a charge taken on the shield puts his horse up on its hind
     legs - and, once he is half beaten, puts him in the dirt. */
  floor(301, 350, R);
  ent('check', 297, R - 1);
  sign(300, 'THE LISTS. THE SERJEANT RIDES AT ANYTHING THAT COMES THROUGH THE GATE. THE BENCHES ARE SAFE.');
  for (const x of [311, 325, 339]) { awning(x, x + 3, R - 2); ent('deco', x + 1, R - 1, { kind: 'fence', v: 1 }); }
  for (const x of [306, 344]) ent('deco', x, R - 1, { kind: 'lanternPost' });
  for (const x of [318, 332]) ent('deco', x, R - 1, { kind: 'hayBale', v: x % 2 });   /* straw for the falls, not a goblin's banner: these are the town's own lists */
  for (const x of [305, 314, 328, 342]) ent('deco', x, R - 10, { kind: 'bunting', hang: true });
  ent('lancer', 342, R - 1, { face: -1, mini: true, range: 20 });
  for (let y = 25; y <= R - 1; y++) set(348, y, T.PORT);                   /* the far gate, shut until he is down */
  coins([312, R - 3], [326, R - 3], [340, R - 3]);

  // ---------------- 5. THE DYERS' ROW (x 351-450). The lane is a dye run, so the road is the roofs. ------
  /* PLATFORMING. Every vat in the row empties into one channel down the middle of the lane, and it is hot and it
     is purple and it eats you if you swim it. The way along is over the dyers' roofs, their drying awnings and the
     beams they hang the cloth from, with a sign on a pulley over the widest gap. A ladder climbs out of the
     channel beside every roof, so a fall costs blood and time, never the run. */
  floor(351, 356, R); floor(445, 450, R);
  floor(357, 444, R + 4);
  pools.push({ x0: 357 * TS, x1: 445 * TS, y: R * TS + 4, bottom: (R + 4) * TS, shallow: false, swim: true, harm: true, clear: true,
    foulCol: '#7a3a9a', foulColL: '#b07ad0', foulColD: '#3e1a58' });
  sign(352, "THE DYERS' ROW. THE RUN-OFF IS SCALDING. KEEP TO THE ROOFS.");
  awning(353, 356, R - 2);
  tiles(358, 366, R - 4); stair(357, R - 4, R + 3);
  awning(371, 375, R - 4); stair(370, R - 4, R + 3);
  tiles(378, 388, R - 6); stair(377, R - 6, R + 3);
  ent('mover', 390, R - 6, { len: 2, range: 5, speed: 34 });   /* the dyer's sign on its pulley */
  tiles(399, 410, R - 6); stair(398, R - 6, R + 3);
  awning(413, 418, R - 3); stair(419, R - 3, R + 3);
  plat(421, R - 5, 3); plat(426, R - 7, 3);
  stair(422, R - 4, R + 3); stair(427, R - 6, R + 3);   /* rules B9: the drying beams hang their ladders into the run-off - what holds them up, and a way out for whoever falls */
  tiles(431, 443, R - 5); stair(430, R - 5, R + 3);
  ent('crossbow', 384, R - 7, { face: -1 }); ent('crossbow', 407, R - 7, { face: -1 }); ent('swornsword', 437, R - 6, { face: -1 }); ent('crossbow', 364, R - 5, { face: -1 }); ent('swornsword', 402, R - 7, { face: -1 });
  ent('deco', 362, R - 12, { kind: 'bunting', hang: true });   /* the dyed cloth, strung out to dry */ ent('deco', 404, R - 7, { kind: 'shopSign', v: 2 });
  coins([354, R - 3], [360, R - 5], [364, R - 5], [373, R - 5], [382, R - 7], [392, R - 8], [402, R - 7], [415, R - 4], [422, R - 6], [427, R - 8], [436, R - 6], [441, R - 6]);
  ent('silver', 427, R - 9);
  ent('stray', 405, R - 8, { kind: 'cup' });
  ent('check', 448, R - 1);
  coins([362, R + 2], [400, R + 2], [436, R + 2]);   /* in the run-off: something for whoever falls in */

  // ---------------- 6. THE KING'S BRIDGE (x 451-560). The river, and the serjeants who ride the bridge. ------
  /* THE NEW CREATURE'S HOME. A stone bridge over the river with a tower at each end and a refuge over every pier -
     the bays people have always stepped into to let a cart by. Two serjeants ride it end to end. A refuge is two
     rows up and a lance cannot reach it; the charge taken on the shield unhorses the rider. THE MACHINE: the west
     tower's portcullis hangs on a drum. Strike the drum as a rider goes under it and the gate comes down on him. */
  floor(451, 560, R);
  for (let x = 473; x <= 539; x++) { if ((x >= 486 && x <= 487) || (x >= 500 && x <= 501) || (x >= 514 && x <= 515) || (x >= 528 && x <= 529)) continue; for (let y = R + 2; y <= R + 8; y++) set(x, y, T.AIR); }
  pools.push({ x0: 473 * TS, x1: 540 * TS, y: (R + 4) * TS, bottom: (R + 9) * TS, shallow: false, swim: true, clear: true, wash: 0.45 });
  sign(456, "THE KING'S BRIDGE. STEP INTO A REFUGE, OR TAKE THE LANCE ON YOUR SHIELD.");
  ent('deco', 468, R - 1, { kind: 'bridgetower' }); ent('deco', 542, R - 1, { kind: 'bridgetower' });
  ent('winch', 466, R - 1, { gate: 471, gy0: R - 4, gy1: R - 1, hold: 5, drop: true });
  sign(462, 'THE PORTCULLIS DRUM. STRIKE IT AND THE GATE DROPS ON WHOEVER IS UNDER IT.');
  for (const px2 of [486, 500, 514, 528]) { plat(px2 - 1, R - 2, 4); ent('deco', px2, R - 1, { kind: 'bridgepost' }); }
  ent('lancer', 489, R - 1, { face: 1, range: 17 });
  ent('lancer', 524, R - 1, { face: -1, range: 15 });
  ent('crossbow', 548, R - 1, { face: -1 }); ent('swornsword', 453, R - 1, { face: 1 }); ent('hedgeknight', 460, R - 1, { face: -1 }); ent('hedgeknight', 552, R - 1, { face: -1 }); ent('swornsword', 544, R - 1, { face: -1 }); ent('heavy', 559, R - 1, { face: -1 });
  coins([486, R - 3], [500, R - 3], [514, R - 3], [528, R - 3], [478, R - 2], [508, R - 2], [536, R - 2]);
  post(454); post(546); post(558);
  ent('check', 556, R - 1);

  // ---------------- 7. THE MASONS' WALL (x 561-650). The chapel close, walled, and the wall half built. ------
  /* PLATFORMING, UP. The close's only gate is bricked up for the repairs, so the way in is the masons' scaffold:
     boards and ladders, a hod-hoist that goes up and down on its own, a board missing, then along the top of the
     wall where the courses are not all laid - a plank on a pulley over the widest break - and down the far side.
     Every break in the wall has a masons' ladder in it, and something at the bottom for climbing down to it. */
  floor(561, 650, R);
  sign(562, "THE MASONS' WALL. THE GATE IS BRICKED UP. GO OVER.");
  board(566, 573, R - 2); stair(565, R - 2, R - 1);
  ent('mover', 575, R - 2, { len: 2, vert: true, rise: 2, period: 3.4 });   /* the hod-hoist */
  board(578, 586, R - 4); board(591, 598, R - 4);
  for (const x of [579, 585, 592, 597]) ent('deco', x, R - 1, { kind: 'stilt' });   /* rules B9: a board stands on its poles */   /* the last board runs up to the wall's face: the top course is a step from it */
  stair(589, R - 4, R - 1);                                /* the missing board has a ladder under it */
  block(600, 612, R - 6, R - 1); block(618, 628, R - 6, R - 1); block(632, 641, R - 6, R - 1);
  ent('mover', 613, R - 6, { len: 2, range: 2, speed: 30 });   /* a plank on a pulley over the break */
  stair(613, R - 6, R - 1); stair(617, R - 6, R - 1); stair(629, R - 6, R - 1); stair(631, R - 6, R - 1);
  coins([615, R - 2], [630, R - 2]);                       /* at the foot of each break */
  board(642, 646, R - 3); stair(647, R - 3, R - 1);
  ent('crossbow', 624, R - 7, { face: -1 }); ent('swornsword', 638, R - 7, { face: -1 });
  ent('hedgeknight', 594, R - 5, { face: -1 }); ent('swornsword', 568, R - 1, { face: -1 }); ent('swornsword', 580, R - 1, { face: -1 }); ent('crossbow', 583, R - 5, { face: -1 }); ent('swornsword', 606, R - 7, { face: -1 }); ent('hedgeknight', 650, R - 1, { face: -1 }); ent('crossbow', 645, R - 4, { face: -1 });
  coins([569, R - 3], [582, R - 5], [593, R - 5], [604, R - 7], [610, R - 7], [622, R - 7], [636, R - 7], [644, R - 4]);
  ent('stray', 626, R - 7, { kind: 'cup' });

  // ---------------- 8. THE CHAPEL YARD (x 651-775). Under the bell, with the town watching. -----------
  floor(651, W - 1, R);
  // ---------------- 8a. THE CHURCH ALE (x 651-704). The parish brews for the chapel, and the parish has drunk it. ------
  /* PLATFORMING BEFORE THE BELL. A church ale on the green inside the lychgate: trestles, kegs on a dray, and the town
     too far gone to go home. The yard between you and the Paladin is railed, one grave is freshly dug, and the drinkers
     have climbed everything that will hold them.
       INTRODUCE  a drunk up on the ale-stake's kegs, over a flat green: the ring again, somewhere new.
       DEVELOP    the open grave, glass in the bottom of it and two chest tombs for steps, a ladder at each end.
       TWIST      the brewer's dray: a drunk ON the way for once - over him, under him, or put him on his back.
       TEST       the churchyard railing, on the bell-rope plank, with the dray behind and a bottle from the church house. */
  ent('check', 652, R - 1);
  sign(654, 'THE CHURCH ALE. THE PARISH BREWED FOR THE CHAPEL, AND HAS DRUNK IT.');
  ent('deco', 656, R - 1, { kind: 'longTable', v: 0 }); ent('deco', 653, R - 1, { kind: 'bench' });
  ent('guest', 655, R - 1, { v: 2, face: 1 }); ent('guest', 657, R - 1, { v: 0, face: -1 });
  /* THE CHAPEL'S OWN keep the ale: a fight on the green first, then the crossing, where the parish is too drunk to fight */
  ent('swornsword', 656, R - 1, { face: -1 }); ent('hedgeknight', 658, R - 1, { face: -1 });
  block(659, 661, R - 2, R - 1);                            /* the ale-stake: kegs racked two high, a step up to the lychgate */
  ent('deco', 660, R - 3, { kind: 'kegStack' });
  /* THE ALE BOOTH over the green, and the first drinker up at its eaves: the chapel's men are under his roof where he
     cannot throw, and the moment you step out from under it onto the kegs, he can */
  tiles(651, 657, R - 9);
  ent('drunk', 655, R - 10, { face: -1, range: 1 });
  ent('deco', 664, R - 1, { kind: 'lychgate' }); ent('deco', 666, R - 1, { kind: 'yew', v: 0 });
  coins([658, R - 2], [663, R - 2], [666, R - 2]);
  /* THE NEW GRAVE: two courses deep, the broken glass of the afternoon in the bottom of it, a sexton's ladder at each end,
     and three chest tombs standing up out of it to cross on */
  for (let x = 668; x <= 682; x++) { set(x, R, T.AIR); set(x, R + 1, T.AIR); set(x, R + 2, x === 668 || x === 682 ? T.AIR : T.SPIKE); }
  block(671, 672, R - 1, R + 2); block(675, 676, R - 1, R + 2); block(679, 680, R - 1, R + 2);
  stair(668, R, R + 2); stair(682, R, R + 2);
  ent('deco', 671, R - 2, { kind: 'grave', v: 0 }); ent('deco', 676, R - 2, { kind: 'grave', v: 1 }); ent('deco', 680, R - 2, { kind: 'grave', v: 2 });
  coins([673, R - 3], [677, R - 3], [681, R - 3]);
  /* THE BREWER'S DRAY: boards on a cart, kegs on the boards, a drinker on the kegs - and the road goes under it too */
  board(684, 688, R - 4); ent('deco', 686, R - 1, { kind: 'cart' });   /* the dray's tilt on its poles */
  for (const x of [684, 688]) ent('deco', x, R - 1, { kind: 'stilt' });
  ent('drunk', 686, R - 5, { face: -1, range: 1 });
  coins([685, R - 6], [687, R - 6]);
  /* THE CHURCHYARD RAILING, and the bell-rope's plank run out over it */
  /* a keg on its side at each end, level with the plank: whoever falls among the railings climbs out on one of them in a
     two-row step, never a pixel-perfect jump (rules E4) */
  block(689, 689, R - 1, R - 1); block(698, 698, R - 1, R - 1);
  spikes(690, 697, R);
  ent('mover', 691, R - 1, { len: 2, range: 4, speed: 32 });
  coins([692, R - 4], [695, R - 4]);
  tiles(699, 703, R - 9);                                    /* the church house, and the last of them on its roof with the bottles */
  ent('drunk', 701, R - 10, { face: -1, range: 1 });
  ent('check', 700, R - 1);
  sign(702, 'ONLY HIS OWN SWORD, MET ON THE BEAT, BREAKS HIS WARD. ROLL THE BASH.');
  /* THE YARD ITSELF, because the last room in a level should not be an empty stretch of road: the tower
     at one end, the yews at the other, and the stones he has been standing among all afternoon. */
  ent('deco', 704, R - 1, { kind: 'bellTower' });
  for (const [x, v] of [[712, 0], [720, 1], [728, 2], [736, 0], [744, 1], [752, 2]]) ent('deco', x, R - 1, { kind: 'grave', v });
  ent('deco', 708, R - 1, { kind: 'yew', v: 1 }); ent('deco', 756, R - 1, { kind: 'yew', v: 0 });
  ent('deco', 748, R - 1, { kind: 'lychgate' }); ent('deco', 724, R - 1, { kind: 'grave', v: 0 });   /* a cairn stood here too: the same stepped stone pile that reads as a sandcastle, swapped for one more headstone in the row it already keeps */
  /* SOMETHING TO GET OFF THE GROUND ONTO. Daniel: "I'd like some more platforms in waymeet for the paladin boss
     fight" - and as in the ossuary, the fight was already written for it: THE BASH only lands within 44px of the
     floor, the OATH within 28. The yard was eleven rows of open air over a flat street, so neither could ever be
     answered with your feet. Table tombs at R-3 (48px: over the bash and the oath) and the tower stair and lychgate
     roof at R-6 (96px). Deliberately NOT higher: JUDGEMENT reaches 110px, and a ledge over that would be a roof to
     sit on rather than a place to stand. Each upper ledge touches a lower one, so it is a three-row hop, not a leap. */
  for (const x of [710, 740]) { for (let j = x; j < x + 4; j++) if (L.grid[(R - 3) * W + j] === T.AIR) set(j, R - 3, T.ONEWAY); }
  for (const x of [706, 744]) { for (let j = x; j < x + 4; j++) if (L.grid[(R - 6) * W + j] === T.AIR) set(j, R - 6, T.ONEWAY); }
  post(702); post(754); post(730);
  ent('closedhelm', 738, R - 1, { face: -1 });
  ent('gate', 770, R - 1);

  /* THE LADDERS, LAST: nothing is dug after this line */
  for (const [x, y0, y1] of ladders) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  /* EVERY ROOF IS A HOUSE. Three courses of clay tile over the street were three courses of bare rock with a
     forest behind them: a roof needs a front under it - timber, limewash, its windows coming on - and the
     street runs on in front of it. */
  const houses = roofs.map(([x0, x1, y]) => {
    const drs = L.ents.filter(e => e.t === 'doorway' && e.x > x0 && e.x < x1 && e.y >= y).map(e => e.x);
    return { x0: x0 + 1, x1: x1 - 1, y0: y + 3, y1: R - 1, door: drs.length ? drs[0] : null, door2: drs.length > 1 ? drs[1] : null, seed: x0, town: true, tiles: true };
  }).filter(h => h.y1 >= h.y0 && h.x1 > h.x0);

  /* THE TOWN IS NOT A WALL: forty-four sworn swords was a street you could not see the end of. Every fourth stands down. */
  { let n = 0; L.ents = L.ents.filter(e => !(e.t === 'swornsword' && ++n % 4 === 0)); }
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: R - 1 }, pools, falls: [], moversExtra: movers, interiors, roofs, houses,
    indoorRow: 24,                                 /* rows 0-24 are insides: never shown from the street */
    music: 'waymeet', duskStart: 0.55, duskLen: 0.45,
    quest: { n: 3, item: 'cup', name: 'HIS CUPS', done: 'THE HOUSE IS SQUARE AGAIN', reward: 'relic', relic: 'spurs' },
    palette: { set: 'village', dress: 'village', ledges: 'staging', sky: 'dusk', far: 'town', mid: 'town', near: 'town', nearSet: 'town',
      haze: 'rgba(210,190,160,0.12)', murkCol: '#2e2a34',
      grass: '#6a8a46', grassL: '#8fb060', grassD: '#47612e', dirt: '#7a6248', dirtL: '#8f7458', dirtD: '#54402c',
      canopy: ['#2a3a24', '#3a5230', '#4a6a3c', '#5e8248'] },
    weather: [{ x0: 0, x1: 99999, kind: 'pollen' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'town' }],
    arena: { x0: 706 * TS, x1: 750 * TS, floor: R * TS, trigger: 712 * TS, wallL: 705, wallR: 751, boss: 'closedhelm',
      music: 'closedhelm', tint: '#3a2a20', tintA: 0.1, fx: 'dust' },
    mini: { x0: 303 * TS, x1: 347 * TS, floor: R * TS, y0: (R - 10) * TS, y1: (R + 1) * TS, trigger: 309 * TS, wallL: 302, gate: 348, boss: 'lancer', name: 'THE SERJEANT OF THE LISTS' },
    /* WHAT THE MASONS LAID is drawn as coursed stone, not the street's earth: the close wall and the King's Bridge with its piers */
    masonry: [[671, 672, R - 1, R + 3], [675, 676, R - 1, R + 3], [679, 680, R - 1, R + 3],   /* the chest tombs in the new grave */ [600, 612, R - 6, R + 2], [618, 628, R - 6, R + 2], [632, 641, R - 6, R + 2], [471, 541, R, R + 1], [486, 487, R + 2, R + 9], [500, 501, R + 2, R + 9], [514, 515, R + 2, R + 9], [528, 529, R + 2, R + 9]],
  };
}

// ---------- THE ROAD INLAND: THE HUNT ----------
// The goblin lord's hunting grounds, an hour's ride out of Waymeet: the meet on the lawn, the kennel yards and their
// drop gates, the park pale and the man paid to watch it, the deer park and its high seats, the lodge, the drive down
// to the ford, and the ring where the Hound Master waits. THE RULE: the pack is his weapon, and the whistle is his tell.
// Said three ways - the whippers-in whistle the kennelled hounds up in every yard, the kennel gates drop on a pack that
// is under them, and the Master himself calls his dogs with the same purple whistle before he ever swings.
function theHunt() {
  const W = 620, H = 34, R = 26;
  const L = painter(W, H);
  const { block, floor, plat, ent, coins, set } = L;
  const movers = [], interiors = [], pools = [], ladders = [];
  const sign = (x, text, y = R - 1) => ent('sign', x, y, { text });
  const held = (...xs) => { for (const x of xs) ent('hound', x, R - 1, { held: true, face: -1 }); };
  const whip = (x, y = R - 1) => ent('horn', x, y, { whistle: true, face: -1 });
  const carve = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  /* A KENNEL WALL: twelve courses of stone with the road through a tunnel in it, and a drop gate in the middle of the
     tunnel on a winch the far side. Too high to jump; the gate starts UP; a ladder the far side goes to the top. */
  const kennelWall = gx => { block(gx - 2, gx + 2, R - 12, R - 1); carve(gx - 2, gx + 2, R - 4, R - 1); interiors.push([gx - 2, gx + 2, R - 4, R - 1, 'hall']);
    ent('winch', gx + 4, R - 1, { gate: gx, gy0: R - 4, gy1: R - 1, hold: 5, drop: true }); ladders.push([gx + 3, R - 13, R - 1]); };
  /* A HIGH SEAT: the lord's shooting box, a floor of boards on two ladders that are its legs */
  const highSeat = (x, top) => { for (let i = 0; i < 5; i++) set(x + i, top, T.PLANK); ladders.push([x, top + 1, R - 1], [x + 4, top + 1, R - 1]); };

  floor(0, W - 1, R);                                        /* the park is one lawn: every section below cuts it or builds on it */

  // ---------------- 1. THE MEET (x 0-84). The lawn before the kennels, where the lord's hunt gathers. ----------------
  sign(3, 'THE LORD HUNTS TODAY. THE WHISTLE LOOSES THE PACK, SO THE WHISTLE IS THE TELL.');
  ent('check', 7, R - 1);
  ent('npc', 12, R - 1, { kind: 'woodsman' });
  ent('deco', 21, R - 1, { kind: 'tent', v: 0 }); ent('deco', 28, R - 1, { kind: 'banner', v: 0 }); ent('deco', 33, R - 1, { kind: 'cart' });
  ent('deco', 40, R - 1, { kind: 'hayBale', v: 0 }); ent('deco', 44, R - 1, { kind: 'spearRack' }); ent('deco', 50, R - 1, { kind: 'trough' });
  ent('sprig', 26, R - 1, { face: -1 }); ent('thief', 37, R - 1, { face: -1 });
  sign(47, 'A WHIPPER-IN FIGHTS WITH HIS WHISTLE. REACH HIM BEFORE HE BLOWS IT.');
  whip(63); held(56, 59, 67);                                /* the first pack: three dogs and the man who looses them, alone on the grass */
  ent('check', 60, R - 1);
  /* THE STAND: the lord watches the meet from a scaffold of benches, and his bowman watches you from the top of it */
  plat(70, R - 2, 5); plat(75, R - 4, 5); plat(80, R - 2, 4);
  ent('archer', 77, R - 5, { face: -1 });
  ent('deco', 71, R - 1, { kind: 'barrels' }); ent('deco', 16, R - 1, { kind: 'fence', v: 0 }); ent('deco', 55, R - 1, { kind: 'hayBale', v: 1 });
  coins([10, R - 2], [18, R - 2], [24, R - 2], [30, R - 2], [42, R - 2], [52, R - 2], [72, R - 3], [77, R - 6], [82, R - 3]);

  // ---------------- 2. THE KENNEL YARDS (x 85-190). Three walls, a gate in each, and a pack in every yard. -----------
  sign(87, 'STRIKE THE WINCH PAST A KENNEL GATE AND THE GATE DROPS, ON ANY DOG UNDER IT.');
  ent('deco', 90, R - 1, { kind: 'bones', v: 0 });
  /* YARD ONE: a crowd in the open, and the whipper-in at the back of it */
  held(96, 99, 102); whip(105); ent('soldier', 92, R - 1, { face: -1 });
  kennelWall(110);
  ent('check', 118, R - 1);
  /* YARD TWO: a kennel shed with its roof over the road, the dogs under it and their man on top */
  block(122, 136, R - 6, R - 6); interiors.push([122, 136, R - 5, R - 1, 'timber']); ladders.push([121, R - 7, R - 1]);
  held(126, 130); whip(133, R - 7); ent('pike', 139, R - 1, { face: -1 }); ent('brute', 128, R - 1, { face: -1 });
  ent('deco', 124, R - 1, { kind: 'trough' }); ent('deco', 135, R - 1, { kind: 'barrels' });
  ent('stray', 131, R - 1, { kind: 'fox' });
  coins([114, R - 2], [124, R - 7], [128, R - 7], [132, R - 7], [138, R - 2]);
  sign(141, 'THE GATE WINDS ITSELF BACK UP. STRIKE THE WINCH AGAIN.');
  kennelWall(144);
  /* YARD THREE: bowmen on the wall tops shoot down into the yard you have to cross */
  held(152, 155, 159, 162); whip(166);
  ent('archer', 143, R - 13, { face: 1 }); ent('archer', 177, R - 13, { face: -1 });
  ent('soldier', 170, R - 1, { face: -1 });
  kennelWall(178);
  ent('silver', 178, R - 15);                                 /* up the far ladder and along the top of the last wall */
  coins([150, R - 2], [157, R - 2], [164, R - 2], [176, R - 14], [180, R - 14]);

  // ---------------- 3. THE PARK PALE (x 184-229). The ha-ha, and the man the lord pays to watch the gate. ------------
  /* THE HA-HA: a sunk fence you do not see until you are on its lip. Down in, and up the far side two rows at a time */
  carve(186, 195, R, R + 3); block(194, 195, R + 2, R + 3);
  ent('goat', 190, R + 3, { face: -1 });
  coins([188, R + 2], [192, R + 2]);
  ent('check', 198, R - 1);
  sign(199, 'THE STALKER. RED MARK: HE LUNGES, SO ROLL. YELLOW: THE KNIFE, SO BLOCK.');
  /* THE KEEPER'S YARD, walled behind you when you walk in; the park wall across its far end, and its gate shut */
  ent('deco', 206, R - 1, { kind: 'stump', v: 0 }); ent('deco', 212, R - 1, { kind: 'fern', v: 1 });
  ent('assassin', 216, R - 1, { face: -1, mini: true });
  block(225, 229, R - 12, R - 1); carve(225, 229, R - 6, R - 1); interiors.push([225, 229, R - 6, R - 1, 'hall']);
  for (let y = R - 6; y <= R - 1; y++) set(225, y, T.PORT);   /* the park gate: it lifts when he falls */

  // ---------------- 4. THE DEER PARK (x 230-350). Open grass, the high seats, and everything in it runs. ------------
  sign(232, 'THE DEER PARK. THE LORD SHOOTS FROM THE HIGH SEATS. CLIMB ONE.');
  block(244, 256, R - 2, R - 1); block(247, 253, R - 4, R - 3);   /* the park rolls, two rows at a time */
  ent('stray', 250, R - 5, { kind: 'fox' });
  ent('hare', 240, R - 1); ent('hare', 259, R - 1); ent('crow', 252, R - 8, { face: -1 });
  ent('check', 252, R - 5);
  sign(259, 'A HOUND WILL NOT CLIMB A LADDER. A BOWMAN WILL WAIT AT THE TOP OF ONE.');
  highSeat(262, R - 8); ent('archer', 264, R - 9, { face: -1 });
  ent('goat', 274, R - 1, { face: -1 }); ent('hare', 282, R - 1);
  /* THE SECOND SEAT has its whipper-in: the dogs sit round the legs of it, and he looses them from above your head */
  highSeat(290, R - 8); whip(292, R - 9); held(284, 287, 297, 300);
  ent('crow', 305, R - 9, { face: -1 });
  ent('check', 306, R - 1);
  /* THE LORD'S OWN SEAT: twice the height of the others, and the view from it is worth a silver */
  highSeat(318, R - 12); ent('archer', 320, R - 13, { face: -1 }); ent('silver', 320, R - 15);
  ent('goat', 330, R - 1, { face: -1 }); ent('javelin', 338, R - 1, { face: -1 }); ent('hare', 344, R - 1);
  whip(348); held(334, 341, 345);                                 /* the dogs at the lodge door, and their man in the doorway */
  ent('deco', 312, R - 1, { kind: 'deadTree', v: 0 }); ent('deco', 237, R - 1, { kind: 'stone', v: 2 }); ent('deco', 278, R - 1, { kind: 'bushDeco', v: 1 }); ent('deco', 326, R - 1, { kind: 'stump', v: 0 });
  coins([236, R - 2], [248, R - 6], [252, R - 6], [264, R - 10], [276, R - 2], [292, R - 10], [310, R - 2], [320, R - 14], [334, R - 2], [342, R - 2]);

  // ---------------- 5. THE LODGE (x 351-440). His trophies, his table, and a counter with nobody behind it. ------------
  block(356, 434, R - 12, R - 1); carve(357, 433, R - 9, R - 1);
  carve(356, 356, R - 3, R - 1); carve(434, 434, R - 3, R - 1);   /* the two doors */
  interiors.push([357, 433, R - 9, R - 1, 'hall']);
  ladders.push([355, R - 13, R - 1], [435, R - 13, R - 1]);       /* up either end onto the roof */
  sign(352, 'THE LODGE. THE TABLE IS SET AND THE COUNTER IS SHUT.');
  plat(360, R - 5, 22); plat(404, R - 5, 27);                     /* the galleries, each run to its own ladder */
  plat(397, R - 2, 3); plat(400, R - 4, 3);                       /* and the steps up to the east one past the counter */
  sign(402, 'THE TABLE IS LAID FOR AFTER THE KILL. NOBODY HAS SAID WHOSE.');
  plat(383, R - 7, 14);                                           /* the rafters over the counter */
  ladders.push([359, R - 4, R - 1], [431, R - 4, R - 1]);
  ent('deco', 366, R - 1, { kind: 'hearth' }); ent('deco', 369, R - 1, { kind: 'bench' }); ent('deco', 372, R - 1, { kind: 'longTable', v: 0 }); ent('deco', 375, R - 1, { kind: 'bench' });
  ent('deco', 380, R - 1, { kind: 'caskRack' }); ent('deco', 391, R - 1, { kind: 'counter' });
  ent('deco', 400, R - 1, { kind: 'barrels' }); ent('deco', 407, R - 1, { kind: 'bench' }); ent('deco', 410, R - 1, { kind: 'longTable', v: 1 }); ent('deco', 413, R - 1, { kind: 'bench' });
  ent('deco', 420, R - 1, { kind: 'skullPile', v: 0 }); ent('deco', 426, R - 1, { kind: 'skullPile', v: 1 });
  ent('deco', 368, R - 6, { kind: 'banner', v: 0 }); ent('deco', 424, R - 6, { kind: 'banner', v: 1 }); ent('deco', 412, R - 6, { kind: 'spearRack' });
  ent('deco', 376, R - 9, { kind: 'hallWindow', hang: true }); ent('deco', 416, R - 9, { kind: 'hallWindow', hang: true });
  ent('check', 385, R - 1);
  /* THE HALL STANDS UP: a crowd under a gallery with no room over your head, and throwers on the gallery */
  ent('soldier', 364, R - 1, { face: -1 }); ent('soldier', 378, R - 1, { face: -1 }); ent('pike', 398, R - 1, { face: -1 });
  ent('soldier', 404, R - 1, { face: -1 }); ent('brute', 418, R - 1, { face: -1 }); ent('heavy', 428, R - 1, { face: -1 });
  ent('javelin', 372, R - 6, { face: -1 }); ent('javelin', 414, R - 6, { face: -1 }); ent('thief', 395, R - 8, { face: -1 });
  ent('stray', 424, R - 6, { kind: 'fox' });
  ent('silver', 390, R - 9);
  coins([362, R - 2], [370, R - 6], [378, R - 6], [386, R - 8], [394, R - 8], [402, R - 2], [410, R - 6], [420, R - 6], [430, R - 2]);

  // ---------------- 6. THE DRIVE (x 441-548). The beaters' line through the bracken, down to the ford. --------------
  sign(442, 'THE DRIVE. THEY BEAT THE BRACKEN DOWN TO THE FORD, AND TODAY YOU ARE THE DEER.');
  ent('check', 446, R - 1);
  whip(458); held(450, 453, 462, 465);
  block(468, 480, R - 2, R - 1);                                  /* the beaters' bank */
  ent('javelin', 472, R - 3, { face: -1 }); ent('javelin', 477, R - 3, { face: -1 });
  kennelWall(488);                                                /* the drive's last gate, in the hedge-bank */
  ent('check', 496, R - 1);
  sign(498, 'THE FORD. SWIM IT, AND COME UP READY: THE FAR BANK IS THEIRS.');
  /* THE FORD: the one stretch of the park that is not grass */
  carve(501, 515, R, R + 3);
  pools.push({ x0: 501 * TS, x1: 516 * TS, y: R * TS, swim: true, clear: true, bottom: (R + 4) * TS, depth: 4 * TS, wash: 0.35 });
  ent('archer', 522, R - 1, { face: -1 }); ent('goat', 528, R - 1, { face: -1 }); ent('shield', 519, R - 1, { face: -1 }); ent('shield', 525, R - 1, { face: -1 });
  whip(538); held(531, 534, 542, 545);
  ent('deco', 518, R - 1, { kind: 'stump', v: 1 }); ent('deco', 548, R - 1, { kind: 'fence', v: 0 });
  coins([452, R - 2], [460, R - 2], [470, R - 3], [476, R - 3], [494, R - 2], [504, R + 2], [508, R + 2], [512, R + 2], [520, R - 2], [536, R - 2]);

  // ---------------- 7. THE KILL (x 549-619). The Hound Master's ring, and the kennel hound chained in it. ------------
  sign(551, 'THE HOUND MASTER. HIS HOUND TAKES THE CUT UNTIL IT REARS OR SPRAWLS.');
  ent('check', 556, R - 1);
  sign(560, 'CUT THE KENNEL HOUND OFF ITS POST AND IT GOES FOR HIS MOUNT.');
  ent('deco', 563, R - 1, { kind: 'banner', v: 0 }); ent('deco', 611, R - 1, { kind: 'banner', v: 1 });
  ent('gate', 614, R - 1);                                        /* the park's far gate, and the road on out of it */
  ent('chainpost', 604, R - 1);
  ent('master', 596, R - 1, { face: -1 });
  block(616, W - 1, R - 14, R - 1);                               /* the park's far pale */
  coins([553, R - 2], [558, R - 2]);

  /* EVERY LADDER IS HUNG LAST (rules I): nothing is dug or laid after this line */
  for (const [x, y0, y1] of ladders) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: R - 1 }, pools, falls: [], moversExtra: movers, interiors,
    music: 'marketday', duskStart: -1, duskLen: 1,
    quest: { n: 3, item: 'fox', name: 'FOX CUBS', npc: 'woodsman', done: 'THE CUBS ARE BACK IN THE BRACKEN', reward: 'relic', relic: 'fleece' },
    /* a morning park: a pale gold sky, bracken-green and gold on the ground, and the trees a darker green than any wood before */
    palette: { sky: [[168, 196, 178], [242, 226, 180]], dress: 'wood', haze: 'rgba(236,222,170,0.14)',
      grass: '#7a9a3a', grassL: '#a8c050', grassD: '#4e6a28', dirt: '#6a5238', dirtL: '#80664a', dirtD: '#463624',
      canopy: ['#2e4a26', '#42622e', '#5e7e36', '#86a044'] },
    weather: [{ x0: 0, x1: 99999, kind: 'leaves' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'forest' }],
    arena: { x0: 568 * TS, x1: 608 * TS, floor: R * TS, trigger: 574 * TS, wallL: 567, wallR: 609, boss: 'master', music: 'houndmaster', tint: '#4a3a1a', tintA: 0.1, fx: 'dust' },
    mini: { x0: 202 * TS, x1: 225 * TS, floor: R * TS, y0: (R - 8) * TS, y1: (R + 1) * TS, trigger: 206 * TS, wallL: 201, gate: 225, boss: 'assassin', name: 'THE STALKER' },
  };
}

// ============================================================================================
// THE QUARRY PASS - the road inland goes through the hill, and the hill is being cut.
//
// THE HILL THROWS WHAT IT CAN LIFT. The face over the spoil heaps lets go of a stone on a beat;
// the goblins on the benches throw what they dig; and at the top of the pass the Hill Troll
// throws boulders, the floor, and the crane stones off their chains. The same stones are yours:
// a stone on a chain is a stone you can drop, and a slab on a hoist is a door you can lift.
//
// SEVEN SECTIONS: the road up, the spoil heaps, the cutting (the Quarry Dog in its yard), the
// crane yard (the mason's lodge), the blasting gallery, the saddle, and the troll's bowl.
// FIVE LANDMARKS: the rockfall summit, the hoist pallet, the gantry, the slab gates, the saddle.
// ============================================================================================
function quarryPass() {
  const W = 600, H = 40, R = 30, Y = 34, B = 24;       /* R the road, Y the cutting yard, B the upper bench */
  const L = painter(W, H);
  const { block, floor, plat, ent, coins, set } = L;
  const movers = [], interiors = [], pools = [], stone = [];
  const cut = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const heap = (x0, x1, h) => block(x0, x1, R - h, R - 1);
  const net = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); };
  const beam = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.PLANK); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  /* A SLAB ON A HOIST: a column of dressed stone that the winch beside it lifts for a count, and lets down again on
     whatever is standing in it. The level's machine, three times over. */
  const slab = (x, y0, y1, wx, wy, hold) => { for (let y = y0; y <= y1; y++) set(x, y, T.PORT); ent('winch', wx, wy, { gate: x, gy0: y0, gy1: y1, hold }); };
  /* A STONE ON A CHAIN, hung from a beam: strike the hook and it drops on what is under it, then the crane winds it back up. */
  const crane = (x, y, len, o = {}) => ent('weight', x, y, { len, crane: true, hang: true, ...o });

  // ---------------- 1. THE ROAD UP (x 0-79). The toll hut, the foreman, and the first goats. ----------------
  floor(0, 79, R);
  sign(5, R - 1, 'THE QUARRY PASS. THE ROAD INLAND GOES THROUGH THE HILL, AND THEY ARE CUTTING IT.');
  ent('check', 8, R - 1);
  ent('deco', 11, R - 1, { kind: 'tent', v: 0 }); ent('npc', 15, R - 1, { kind: 'foreman' }); ent('brazier', 18, R - 1);
  ent('deco', 22, R - 1, { kind: 'cart' }); ent('deco', 26, R - 1, { kind: 'barrels' }); ent('deco', 32, R - 1, { kind: 'cairn' });
  sign(29, R - 1, 'A GOAT COMES DOWN THE ROAD AT A RUN. TAKE IT ON THE SHIELD AND IT REARS.');
  heap(44, 52, 2); heap(56, 66, 2);
  ent('sprig', 36, R - 1, { face: -1 }); ent('goat', 48, R - 3, { face: -1 }); ent('rockgoblin', 61, R - 3, { face: -1 });
  ent('rockgoblin', 70, R - 1, { face: -1 }); ent('goat', 76, R - 1, { face: -1 }); ent('miner', 40, R - 1, { face: -1 });
  ent('deco', 54, R - 1, { kind: 'fence', v: 0 }); ent('deco', 72, R - 1, { kind: 'stone', v: 1 });
  coins([12, R - 2], [20, R - 2], [34, R - 2], [48, R - 4], [60, R - 4], [68, R - 2]);

  // ---------------- 2. THE SPOIL HEAPS (x 80-169). Up the tip, under a face that drops what it likes. ----------------
  floor(80, 169, R);
  heap(84, 151, 2); heap(90, 145, 4); heap(96, 139, 6); heap(104, 131, 8);   /* every step two rows */
  block(98, 136, 0, 2); stone.push([98, 136, 0, 2]);                          /* THE BROW: the worked face hanging over the summit */
  sign(88, R - 3, 'THE FACE OVER THE SUMMIT LETS A STONE GO ON A BEAT. WATCH THE MARK, THEN GO.');
  ent('rockfall', 110, 3, { every: 2.6 }); ent('rockfall', 119, 3, { every: 3.1 }); ent('rockfall', 127, 3, { every: 2.3 });
  plat(112, R - 10, 4); plat(117, R - 12, 4);                                 /* the old staging up the face, two rows a board */
  ent('silver', 119, R - 14);
  ent('stray', 124, R - 9, { kind: 'canary' });                               /* the first: in its cage on the summit, under the stones */
  ent('goat', 88, R - 3, { face: -1 }); ent('rockgoblin', 100, R - 7, { face: -1 }); ent('archer', 108, R - 9, { face: -1 });
  ent('rockgoblin', 130, R - 9, { face: -1 }); ent('goat', 136, R - 7, { face: -1 }); ent('sapper', 144, R - 5, { face: -1 });
  ent('horn', 150, R - 3, { face: -1 }); ent('miner', 158, R - 1, { face: -1 }); ent('brute', 164, R - 1, { face: -1 });
  ent('deco', 92, R - 5, { kind: 'bones', v: 0 }); ent('deco', 142, R - 5, { kind: 'stone', v: 2 }); ent('deco', 156, R - 1, { kind: 'cairn' });
  ent('check', 160, R - 1);
  coins([86, R - 4], [94, R - 6], [102, R - 8], [114, R - 11], [119, R - 13], [134, R - 8], [148, R - 4]);

  // ---------------- 3. THE CUTTING (x 170-259). Down into the yard, the Quarry Dog, and up the hoist. ----------------
  floor(170, 177, R + 2); floor(178, 221, Y);
  floor(222, 259, B); stone.push([222, 259, B, H - 1]);                       /* THE BENCH: cut square out of the hill */
  sign(172, R + 1, 'THE QUARRY DOG IS LOOSE IN THE YARD. WHEN IT SKIDS, OR LANDS, IT IS YOURS.');
  ent('miner', 174, R + 1, { face: -1 }); ent('rockgoblin', 181, Y - 1, { face: -1 });
  ent('deco', 176, R + 1, { kind: 'barrels' }); ent('deco', 183, Y - 1, { kind: 'wares', v: 0 });
  /* THE YARD: the gate shuts behind you, the far gate is the dog's, and the pallet is behind that */
  ent('greathound', 208, Y - 1, { face: -1, mini: true });
  for (let y = Y - 6; y <= Y - 1; y++) set(216, y, T.PORT);
  ent('check', 218, Y - 1);
  /* THE HOIST PALLET: a stone on four ropes that goes up the bench and down again, whether or not you are on it */
  ent('mover', 219, Y - 1, { len: 3, range: 0, vert: true, rise: Y - B - 1, period: 4.6, ph: 0, stone: true });
  sign(224, B - 1, 'STRIKE THE HOIST AND THE SLAB GOES UP. IT COMES DOWN AGAIN ON WHATEVER IS UNDER IT.');
  ent('miner', 230, B - 1, { face: -1 }); ent('rockgoblin', 238, B - 1, { face: -1 }); ent('sapper', 242, B - 1, { face: -1 });
  ent('archer', 234, B - 1, { face: -1 });
  ent('deco', 227, B - 1, { kind: 'wares', v: 1 }); ent('deco', 244, B - 1, { kind: 'cart' });
  block(249, 255, 0, B - 7); stone.push([249, 255, 0, B - 7]);               /* the cut the slab hangs in */
  slab(252, B - 6, B - 1, 247, B - 1, 6);
  coins([180, Y - 2], [226, B - 2], [236, B - 2], [246, B - 2]);

  // ---------------- 4. THE CRANE YARD (x 256-349). The gantry, its stones, and the mason's lodge. ----------------
  floor(256, 349, B); stone.push([256, 349, B, H - 1]);
  ent('check', 260, B - 1);
  sign(264, B - 1, 'A STONE ON A CHAIN IS A STONE YOU CAN DROP. JUMP AND STRIKE THE HOOK.');
  beam(270, 330, B - 10);                                                     /* THE GANTRY: a beam you can walk, on two legs you can climb */
  crane(282, B - 9, 6); crane(300, B - 9, 6); crane(318, B - 9, 6);
  ent('miner', 282, B - 1, { face: -1 }); ent('rockgoblin', 300, B - 1, { face: -1 }); ent('miner', 318, B - 1, { face: 1 });
  ent('brute', 290, B - 1, { face: -1 }); ent('sapper', 332, B - 1, { face: -1 }); ent('rockgoblin', 310, B - 1, { face: -1 }); ent('goat', 326, B - 1, { face: -1 }); ent('gobmage', 285, B - 1, { face: -1 });   /* a composed pair on the gantry floor: the reader holds behind the brute, so the fast way to it runs past him first */
  ent('archer', 296, B - 11, { face: -1 }); ent('archer', 312, B - 11, { face: 1 });
  ent('silver', 306, B - 12);
  ent('stray', 276, B - 11, { kind: 'canary' });                              /* the second: on the gantry, where the crane man left it */
  ent('deco', 274, B - 1, { kind: 'barrels' }); ent('deco', 324, B - 1, { kind: 'wares', v: 0 });
  /* THE MASON'S LODGE: the one roof on the hill, and the counter the masons left standing under it */
  sign(334, B - 1, 'THE MASON\'S LODGE. THE COUNTER IS BARE AND NOBODY CAME BACK UP FOR IT.');
  ent('deco', 338, B - 1, { kind: 'counter' }); ent('deco', 344, B - 1, { kind: 'wares', v: 1 });
  ent('deco', 347, B - 1, { kind: 'barrels' });
  ent('check', 342, B - 1);
  coins([266, B - 2], [286, B - 11], [292, B - 11], [322, B - 11], [328, B - 11], [336, B - 2]);

  // ---------------- 5. THE BLASTING GALLERY (x 350-439). Into the hill on the rails, and a shaft up to the old drift. ----------------
  floor(350, 439, B); block(350, 439, 0, B - 7); stone.push([350, 439, 0, B - 7]);
  interiors.push([350, 438, B - 6, B - 1, 'earth']);
  for (let x = 358; x <= 434; x++) set(x, B, T.RAIL);
  ent('cart', 432, B - 1, { auto: true, dir: -1, speed: 110 });
  sign(354, B - 1, 'THE BLASTING GALLERY. THE CARTS RUN ON THEIR OWN NOW. HEAR ONE, JUMP IT.');
  ent('minerlamp', 362, B - 1, { lit: true }); ent('minerlamp', 390, B - 1, { lit: true }); ent('minerlamp', 418, B - 1, { lit: true });
  ent('miner', 372, B - 1, { face: -1 }); ent('rockgoblin', 386, B - 1, { face: -1 }); ent('grub', 398, B - 1, { face: -1 });
  ent('miner', 412, B - 1, { face: -1 }); ent('sapper', 424, B - 1, { face: -1 }); ent('sapper', 378, B - 1, { face: -1 });
  ent('rockfall', 384, B - 6, { every: 2.8 }); ent('rockfall', 414, B - 6, { every: 2.4 });   /* a blasted roof lets go of what the blast loosened */
  ent('bat', 380, B - 4); ent('bat', 404, B - 4); ent('gas', 406, B - 1);
  ent('check', 396, B - 1);
  /* THE OLD DRIFT: they drove it for the blasting powder and walked away from it */
  cut(367, 368, B - 12, B - 7); cut(367, 420, B - 16, B - 13); interiors.push([367, 420, B - 16, B - 13, 'earth']);
  ent('clinger', 367, B - 9, { face: 1 });
  ent('bat', 392, B - 15); ent('rockgoblin', 400, B - 13, { face: -1 });
  ent('silver', 416, B - 14); ent('minerlamp', 406, B - 13, { lit: false }); ent('deco', 412, B - 13, { kind: 'barrels' });
  coins([376, B - 14], [384, B - 14], [396, B - 14], [404, B - 14]);
  sign(426, B - 1, 'THE BLAST DOOR IS A SLAB ON A HOIST. STRIKE IT, AND DO NOT STAND IN THE DOOR.');
  slab(437, B - 6, B - 1, 434, B - 1, 5);
  coins([360, B - 2], [370, B - 2], [382, B - 2], [410, B - 2], [428, B - 2]);

  // ---------------- 6. THE SADDLE (x 440-519). Out on the top of the pass, and across the gap on the pallet. ----------------
  floor(440, 452, B); floor(469, 490, B); floor(491, 497, B + 2); floor(498, 504, B + 4);
  ent('check', 444, B - 1);
  sign(447, B - 1, 'THE SADDLE. THE PALLET STILL RUNS ON ITS ROPE. RIDE IT, AND DO NOT WAIT ON IT.');
  ent('mover', 453, B, { len: 3, range: 13, stone: true, speed: 30 });
  ent('stray', 471, B - 1, { kind: 'canary' });                               /* the third: where the rope over the gap comes in */
  ent('harpy', 462, B - 8); ent('harpy', 480, B - 7); ent('kite', 470, B - 6); ent('kite', 488, B - 5);
  ent('goat', 478, B - 1, { face: -1 }); ent('rockgoblin', 486, B - 1, { face: -1 }); ent('archer', 494, B + 1, { face: -1 });
  ent('deco', 472, B - 1, { kind: 'cairn' }); ent('deco', 484, B - 1, { kind: 'stone', v: 0 });
  coins([442, B - 2], [448, B - 2], [458, B - 3], [466, B - 3], [474, B - 2], [482, B - 2], [494, B], [500, B + 2]);

  // ---------------- 7. THE TROLL'S BOWL (x 505-599). A last checkpoint outside the wall, and him. ----------------
  floor(505, 599, R); stone.push([541, 583, R, H - 1]);
  ent('check', 512, R - 1);
  sign(516, R - 1, 'THE HILL TROLL THROWS WHAT IT CAN LIFT. DROP A CRANE STONE ON IT FIRST.');
  ent('brute', 522, R - 1, { face: -1 }); ent('rockgoblin', 530, R - 1, { face: -1 });
  ent('deco', 520, R - 1, { kind: 'bones', v: 1 }); ent('deco', 534, R - 1, { kind: 'cairn' });
  ent('check', 536, R - 1);
  sign(538, R - 1, 'A RED MARK IS NO SHIELD\'S BUSINESS. GET OFF THE GROUND, OR OUT OF THE WAY.');
  beam(549, 575, R - 10);                                                     /* the bowl's gantry, and its three stones */
  crane(555, R - 9, 6, { arena: true }); crane(562, R - 9, 6, { arena: true }); crane(569, R - 9, 6, { arena: true });
  ent('troll', 576, R - 1, { big: true, face: -1 });
  ent('gate', 594, R - 1);
  coins([510, R - 2], [526, R - 2], [588, R - 2]);

  // EVERY LADDER IS HUNG LAST. Nothing is dug after this line.
  net(270, B - 10, B - 1); net(330, B - 10, B - 1);                          /* the gantry legs */
  net(368, B - 13, B - 1);                                                    /* the drift shaft */
  net(549, R - 10, R - 1); net(575, R - 10, R - 1);                          /* the bowl's gantry legs */

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: R - 1 }, pools, falls: [], moversExtra: movers, interiors, stone,
    music: 'quarry', duskStart: 0.7, duskLen: 0.3,
    quest: { n: 3, item: 'canary', name: 'CANARIES', npc: 'foreman', done: 'THE CAGES SING AGAIN', reward: 'relic', relic: 'lamp' },
    palette: { sky: [[146, 172, 196], [236, 218, 184]], far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', ledges: 'staging',
      haze: 'rgba(236,220,180,0.14)', murkCol: '#3a342c',
      grass: '#8a9446', grassL: '#b0ba62', grassD: '#5a6230', dirt: '#a0947c', dirtL: '#bcb098', dirtD: '#6e6454',
      canopy: ['#6a6258', '#8a8274', '#a89c88', '#d0c4ac'] },
    weather: [],
    ambient: [{ x0: 0, x1: 350 * TS, kind: 'wind' }, { x0: 350 * TS, x1: 440 * TS, kind: 'cave' }, { x0: 440 * TS, x1: 99999, kind: 'wind' }],
    arena: { x0: 542 * TS, x1: 582 * TS, floor: R * TS, y0: (R - 14) * TS, trigger: 546 * TS, wallL: 541, wallR: 583, boss: 'troll',
      music: 'hilltroll', tint: '#5a4a30', tintA: 0.1, fx: 'dust' },
    mini: { x0: 186 * TS, x1: 216 * TS, floor: Y * TS, y0: B * TS, y1: (Y + 1) * TS, trigger: 190 * TS, wallL: 185, gate: 216, boss: 'greathound', name: 'THE QUARRY DOG' },
  };
}

// THE FROSTFELL - the high fell over the road inland, where the ice-cutters worked the tarns.
// THE RULE: FIRE TAKES THE ICE, AND THE COLD GIVES IT BACK. The cutters left a FIREBOX by every
// sheet of ice they had a use for. Strike one and it roars: the ice it governs melts from the box
// outward, and when it gutters the cold closes over the same tiles again. It opens a door, it drops a
// tarn full of trolls into black water, it takes the rime off the thing in the glacier - and it takes
// the ice out from under you just the same. Said three ways: pale ice over black water you can see
// through the holes, steam and orange light on ice that is going, and a frost that creeps back
// sparkling a moment before the sheet closes.
//   1 THE COL            0-79    the way up, rams on the rise, the first ice underfoot
//   2 THE CUTTERS' CAMP  80-159  tents, a pedlar, and the store hut with an ice door (the firebox, taught)
//   3 THE ICE QUARRY     160-229 the mini: the quarry troll among the cut blocks, then the haul road
//   4 THE FROZEN TARNS   230-329 three tarns: holes to slide over, a sheet of trolls to drop, a gantry over it
//   5 THE FROZEN FALL    330-409 a climb up the face beside a frozen waterfall, and the cave behind it
//   6 THE HIGH SNOWFIELD 410-499 crevasses, kites on the wind, and the buried dead who get up for the still
//   7 THE GLACIER        500-611 down into the ice, and the Rimewright's hall
// ============================================================================================
function theFrostfell() {
  const W = 612, H = 34, G = 27, FS = 15;
  const L = painter(W, H);
  const { block, floor, plat, ent, coins, set, spikes } = L;
  const pools = [], slick = [], interiors = [];
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const ice = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.ICE); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  /* A TARN: an ice sheet one course thick over three rows of black water, and holes sawn in it. The water is
     dead water (no swimming in this cold): the ice is the only floor, and the sheet is slick end to end. */
  const tarn = (x0, x1, ...holes) => {
    air(x0, x1, G + 1, H - 1); ice(x0, x1, G, G);   /* no bed: a tarn up here goes down further than anyone has been */
    for (const hx of holes) air(hx, hx + 2, G, G);
    pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: (G + 1) * TS, bottom: H * TS });
    slick.push([x0, x1, G]);
  };
  /* A FIREBOX, and the rectangle of ice it answers for (none: it only warms what stands by it) */
  const firebox = (x, y, r) => ent('firebox', x, y, r ? { x0: r[0], x1: r[1], y0: r[2], y1: r[3] } : {});

  // ---------------- 1. THE COL (x 0-79). The way up, and the first ice underfoot. ----------------
  floor(0, 79, G);
  sign(4, G - 1, 'THE FROSTFELL. FIRE TAKES THE ICE, AND THE COLD GIVES IT BACK.');
  ent('check', 7, G - 1); ent('npc', 10, G - 1, { kind: 'squire' });
  ent('deco', 14, G - 1, { kind: 'cairn' }); ent('hare', 20, G - 1);
  block(26, 33, G - 2, G - 1); block(34, 45, G - 4, G - 1); block(46, 51, G - 2, G - 1);   /* the rise: two rows a step */
  ent('goat', 40, G - 5, { face: -1 }); ent('harpy', 37, G - 10); ent('deco', 44, G - 5, { kind: 'frozen', v: 0 });
  ice(54, 66, G, G); slick.push([54, 66, G]);   /* a frozen puddle with rock under it: the slide taught where a slip costs nothing */
  sign(53, G - 1, 'ICE UNDERFOOT: SLOW TO START AND SLOWER TO STOP. THE RAMS KNOW IT.');
  ent('goat', 63, G - 1, { face: -1 }); ent('crow', 60, G - 8); ent('rockgoblin', 72, G - 1, { face: -1 });
  ent('deco', 76, G - 1, { kind: 'cairn' });
  coins([28, G - 3], [38, G - 5], [42, G - 5], [58, G - 2], [62, G - 2]);

  // ---------------- 2. THE CUTTERS' CAMP (x 80-159). The firebox, taught on a door. ----------------
  floor(80, 159, G);
  ent('check', 84, G - 1);
  sign(86, G - 1, "THE ICE-CUTTERS' CAMP. THEY LEFT IN A HURRY, AND LEFT THEIR FIREBOXES LAID.");
  ent('deco', 90, G - 1, { kind: 'tent', v: 0 }); ent('deco', 96, G - 1, { kind: 'cart' }); ent('deco', 100, G - 1, { kind: 'barrels' });
  ent('deco', 104, G - 1, { kind: 'tent', v: 1 }); ent('deco', 92, G - 1, { kind: 'frozen', v: 1 });
  ent('wight', 98, G - 1, { face: -1 }); ent('rockgoblin', 106, G - 1, { face: -1 });
  /* THE STORE HUT: stone walls, a turf roof the road goes over, and a door of ice on its far side that a
     man cannot cut. The firebox by it can. */
  block(110, 113, G - 2, G - 1); block(114, 117, G - 4, G - 1);   /* up the snow bank onto the roof */
  block(118, 132, G - 6, G - 1); air(119, 131, G - 4, G - 1); interiors.push([119, 131, G - 4, G - 1, 'hall']);
  ice(132, 132, G - 4, G - 1);
  firebox(134, G - 1, [132, 132, G - 4, G - 1]);
  sign(144, G - 1, 'STRIKE THE FIREBOX. THE ICE BY IT GOES, AND WHEN THE FIRE DOES, IT COMES BACK.');
  ent('stray', 124, G - 1, { kind: 'pick' }); ent('deco', 121, G - 1, { kind: 'barrels' });
  coins([122, G - 1], [127, G - 1], [129, G - 3]);
  /* the smoke hole in the roof: the slow way in, for whoever will not wait on a fire */
  for (const x of [125, 126]) { set(x, G - 6, T.ONEWAY); set(x, G - 5, T.AIR); }
  ent('rockgoblin', 129, G - 7, { face: -1 }); ent('kite', 146, G - 9);
  /* THE CUTTERS' TENT: a pedlar came up for their custom, and the weather sent him back down without it */
  ent('deco', 151, G - 1, { kind: 'tent', v: 0 });
  sign(147, G - 1, "THE CUTTERS' TENT. THE PEDLAR WHO PITCHED IT WENT DOWN THE HILL AND LEFT IT STANDING.");
  ent('rockgoblin', 140, G - 1, { face: -1 }); ent('wight', 154, G - 1, { face: -1 });
  /* the squatters: goblins came up for what the cutters left and sleep by the laid fires */
  ent('hearthgob', 94, G - 1, { face: 1 }); ent('hearthgob', 102, G - 1, { face: -1 }); ent('hearthgob', 138, G - 1, { face: 1 });
  ent('check', 156, G - 1);
  coins([86, G - 2], [94, G - 2], [111, G - 3], [115, G - 5], [122, G - 7], [138, G - 2], [141, G - 2], [152, G - 2]);

  // ---------------- 3. THE ICE QUARRY (x 160-229). The quarry troll, then the haul road. ----------------
  floor(160, 229, G);
  sign(158, G - 1, 'THE QUARRY. SOMETHING BIG HAS BEEN LIVING ON WHAT THE CUTTERS LEFT.');
  ice(170, 171, G - 2, G - 1); ice(179, 180, G - 1, G - 1); ice(188, 189, G - 2, G - 1); ice(195, 195, G - 2, G - 1);   /* blocks of cut ice, left where they were sawn */
  ent('troll', 184, G - 1, { big: true, mini: true, face: -1 });
  /* the quarry face, and the haul tunnel through it that the troll has been keeping shut */
  block(197, 202, 6, G - 5); air(198, 202, G - 4, G - 1);
  for (let y = G - 4; y <= G - 1; y++) set(197, y, T.PORT);
  sign(206, G - 1, 'THE HAUL ROAD RUNS DOWN TO THE TARNS, WHERE THE CUTTERS SAWED THEIR ICE.');
  ent('deco', 207, G - 1, { kind: 'cart' }); ent('rockgoblin', 216, G - 1, { face: -1 }); ent('goat', 224, G - 1, { face: -1 });
  /* the ice teeth: where the melt runs off the road it freezes in blades, and a sledge goes round them */
  spikes(210, 212, G); spikes(219, 221, G);
  ent('harpy', 220, G - 8); ent('deco', 227, G - 1, { kind: 'cairn' });
  coins([174, G - 3], [192, G - 2], [208, G - 2], [214, G - 2], [222, G - 2]);

  // ---------------- 4. THE FROZEN TARNS (x 230-329). Slide, drop, and cross over. ----------------
  floor(230, 329, G);
  tarn(234, 254, 240, 248);
  ent('goat', 236, G - 1, { face: 1 }); ent('crow', 246, G - 7); ent('crow', 250, G - 8);
  sign(231, G - 1, 'THE TARNS. THE WATER UNDER THE ICE IS BLACK, AND NOTHING COMES BACK OUT OF IT.');
  /* the left outcrop, and the firebox that answers for the whole of the middle tarn */
  block(255, 255, G - 2, G - 1); block(256, 261, G - 4, G - 1);
  ent('check', 257, G - 5); firebox(259, G - 5, [262, 288, G, G]);
  sign(256, G - 5, 'THIS FIREBOX TAKES THE WHOLE TARN, AND ANYTHING STANDING ON IT.');
  tarn(262, 288);
  ent('troll', 271, G - 1, { face: -1 }); ent('troll', 283, G - 1, { face: -1 }); ent('rockgoblin', 277, G - 1, { face: -1 });
  /* THE CUTTERS' GANTRY: planks from outcrop to outcrop, the way over that no fire takes away */
  for (let x = 265; x <= 288; x++) set(x, G - 4, T.PLANK);
  ent('harpy', 269, G - 10); ent('harpy', 283, G - 11);
  ent('silver', 276, G - 7);   /* over the middle of the gantry, in among the harpies: a jump off the planks for it */
  block(289, 290, G - 2, G - 1); block(291, 296, G - 4, G - 1); block(297, 297, G - 2, G - 1);
  ent('check', 293, G - 5); ent('deco', 295, G - 5, { kind: 'cairn' });
  tarn(298, 322, 304, 314);
  ent('crow', 309, G - 7); ent('shardling', 320, G - 1, { face: -1 }); ent('goat', 300, G - 1, { face: 1 });
  ent('check', 326, G - 1);
  coins([244, G - 2], [252, G - 2], [258, G - 6], [268, G - 5], [276, G - 5], [284, G - 5], [300, G - 2], [310, G - 2], [320, G - 2]);

  // ---------------- 5. THE FROZEN FALL (x 330-409). Up the face, and the cave behind the ice. ----------------
  floor(330, 351, G);
  block(352, 409, 13, H - 1);                          /* the massif */
  ice(350, 351, 13, G - 1);                            /* the fall itself: stopped in one night and never started again */
  air(352, 362, G - 5, G - 1); interiors.push([352, 362, G - 5, G - 1, 'crystal']);
  firebox(346, G - 1, [350, 351, G - 5, G - 1]);
  sign(333, G - 1, 'THE FROZEN FALL. THERE IS A CAVE BEHIND IT, AND A FIREBOX IN FRONT OF IT.');
  ent('stray', 360, G - 1, { kind: 'pick' }); ent('silver', 357, G - 3); ent('bat', 356, G - 5);
  /* up the face on the snow ledges, two rows at a time */
  plat(332, G - 2, 4); plat(338, G - 4, 4); plat(344, G - 6, 4); plat(338, G - 8, 4); plat(332, G - 10, 4); plat(338, G - 12, 4); plat(344, 13, 6);
  ent('harpy', 335, G - 14); ent('harpy', 347, G - 17); ent('crow', 342, G - 16);
  ent('check', 356, 12);
  sign(358, 12, 'THE SNOWFIELD. WHAT IS BURIED UP HERE GETS UP FOR ANYONE WHO STANDS STILL.');
  ent('goat', 372, 12, { face: -1 }); ent('shardling', 383, 12, { face: -1 }); ent('troll', 394, 12, { face: -1 }); ent('wight', 404, 12, { face: -1 });
  ent('deco', 366, 12, { kind: 'frozen', v: 1 }); ent('deco', 391, 12, { kind: 'cairn' });
  spikes(368, 370, 13); spikes(378, 380, 13); spikes(386, 388, 13); spikes(398, 400, 13);   /* ice teeth along the top of the massif */
  spikes(336, 338, G);   /* and under the face, where whatever fell off it froze */
  coins([334, G - 3], [340, G - 5], [346, G - 7], [340, G - 9], [334, G - 11], [340, G - 13], [376, 11], [386, 11], [398, 11]);

  // ---------------- 6. THE HIGH SNOWFIELD (x 410-499). Crevasses, and nowhere to stand still. ----------------
  block(410, 499, FS, H - 1);
  ent('check', 414, FS - 1);
  sign(416, FS - 1, 'THE CREVASSES DO NOT GIVE BACK WHAT FALLS IN THEM. JUMP THEM LIKE YOU MEAN IT.');
  for (const cx of [425, 447, 471]) { air(cx, cx + 2, FS, H - 1); pools.push({ x0: cx * TS, x1: (cx + 3) * TS, y: (H - 4) * TS, bottom: H * TS }); }
  ent('shardling', 437, FS - 1, { face: -1 }); ent('wight', 444, FS - 1, { face: -1 }); ent('kite', 438, FS - 8);
  spikes(432, 434, FS); spikes(456, 458, FS); spikes(463, 465, FS); spikes(490, 491, FS);   /* the snow hides ice teeth: they show as a ridge, and they are jumped */
  ent('stray', 452, FS - 1, { kind: 'pick' }); ent('deco', 454, FS - 1, { kind: 'cart' });
  ent('shardling', 458, FS - 1, { face: -1 }); ent('crow', 456, FS - 6); ent('kite', 462, FS - 8); ent('wight', 468, FS - 1, { face: -1 }); ent('troll', 440, FS - 1, { face: -1 });
  ent('check', 478, FS - 1);
  /* THE WAYMARK: a pillar of old ice the cutters used for a sighting post, with the last silver on it */
  block(481, 482, FS - 2, FS - 1); block(485, 487, FS - 4, FS - 1);
  ent('silver', 486, FS - 6); ent('goat', 493, FS - 1, { face: -1 }); ent('harpy', 490, FS - 9);
  ent('deco', 420, FS - 1, { kind: 'frozen', v: 0 }); ent('deco', 444, FS - 1, { kind: 'cairn' }); ent('deco', 468, FS - 1, { kind: 'frozen', v: 1 });
  coins([420, FS - 2], [426, FS - 3], [448, FS - 3], [472, FS - 3], [481, FS - 3], [486, FS - 5], [496, FS - 2]);

  // ---------------- 7. THE GLACIER (x 500-611). Down into the ice, and the Rimewright's hall. ----------------
  block(500, W - 1, 0, H - 1);
  air(500, 503, 6, FS - 1);
  /* the way down is a stair of the glacier's own ledges, two rows a step, the roof coming down with it */
  [[500, 505, 15], [506, 511, 17], [512, 517, 19], [518, 523, 21], [524, 529, 23], [530, 535, 25], [536, 555, 27]].forEach(([x0, x1, f]) => air(x0, x1, f - 6, f - 1));
  air(556, 596, 17, G - 1);                             /* THE HALL: forty across and ten high - all of it on the screen at once - and a roof that drops what it holds */
  air(597, W - 1, G - 6, G - 1);
  interiors.push([500, W - 1, 6, G - 1, 'stone']);
  ent('bat', 508, 11); ent('grub', 520, 20, { face: -1 }); ent('bat', 527, 17); ent('shardling', 533, 24, { face: -1 });
  ent('spider', 545, 21, { drop: 70 }); ent('rockgoblin', 547, G - 1, { face: -1 });
  ent('spider', 515, 13, { drop: 60 }); ent('spider', 522, 15, { drop: 60 });   /* the ice spiders keep to the roof of the stair */
  spikes(540, 542, G);
  sign(537, G - 1, 'THE RIMEWRIGHT. BURN THE RIME OFF IT AT A FIREBOX, OR BREAK ITS OWN SPIRES ON IT.');
  ent('check', 550, G - 1);
  firebox(565, G - 1); firebox(587, G - 1);
  ent('suncatcher', 584, G - 1);
  ent('gate', 606, G - 1);
  coins([502, 14], [509, 16], [515, 18], [521, 20], [527, 22], [533, 24], [544, G - 2], [600, G - 2]);

  /* WHAT THE FELL KEEPS: the cutters' leavings, the stones they piled, and the ones the cold kept */
  for (const [x, y, kind, v] of [[18, G - 1, 'stone', 0], [30, G - 3, 'cairn', 0], [50, G - 3, 'bones', 0], [70, G - 1, 'deadTree', 0], [82, G - 1, 'lanternPost', 0],
    [108, G - 1, 'barrels', 0], [214, G - 1, 'bones', 1], [328, G - 1, 'deadTree', 1], [331, G - 1, 'bones', 0], [374, 12, 'stone', 1], [408, 12, 'deadTree', 0],
    [412, FS - 1, 'cairn', 0], [428, FS - 1, 'bones', 1], [450, FS - 1, 'frozen', 1], [476, FS - 1, 'stone', 2], [495, FS - 1, 'deadTree', 1],
    [503, FS - 1, 'bones', 0], [520, 20, 'spire', 1], [535, 24, 'spire', 0], [598, G - 1, 'bones', 1], [603, G - 1, 'cairn', 0]]) ent('deco', x, y, { kind, v });
  ent('wight', 375, 12, { face: -1 }); ent('harpy', 401, 7);

  /* THE LADDERS ARE HUNG LAST: nothing is dug after this line. The cutters' shaft from the top of the massif
     down into the cave behind the fall - the long way in, for whoever will not wait on a fire. */
  air(361, 361, 14, G - 6); for (let y = 13; y <= G - 1; y++) set(361, y, T.NET);
  for (let y = G - 5; y <= G - 1; y++) set(126, y, T.NET);   /* and the store hut's ladder up to its smoke hole, the way back out */

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: G - 1 }, pools, falls: [], moversExtra: [], interiors, slick,
    hags: [{ x0: 430 * TS, x1: 468 * TS }],        /* the buried cutters: stand still on the snowfield and one gets up */
    duskStart: 99999, duskLen: 1, music: 'snow', night: false, frost: true, snowLine: 999,
    quest: { n: 3, item: 'pick', name: 'ICE PICKS', npc: 'squire', done: 'THE CUTTERS HAVE THEIR PICKS BACK', reward: 'relic', relic: 'crampons' },
    palette: { sky: [[118, 132, 158], [206, 214, 228]], far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(214,224,240,0.22)',
      grass: '#dfe8f2', grassL: '#ffffff', grassD: '#a4b4c8', dirt: '#525c74', dirtL: '#68748c', dirtD: '#383f52',
      canopy: ['#46506a', '#5a6680', '#76849c', '#a6b4c8'] },
    weather: [{ x0: 0, x1: 99999, kind: 'snow' }, { x0: 230 * TS, x1: 330 * TS, kind: 'mist' }, { x0: 410 * TS, x1: 500 * TS, kind: 'wind' }],
    ambient: [{ x0: 0, x1: 500 * TS, kind: 'wind' }, { x0: 500 * TS, x1: 99999, kind: 'cave' }],
    arena: { x0: 556 * TS, x1: 596 * TS, floor: G * TS, y0: 16 * TS, trigger: 561 * TS, wallL: 555, wallR: 597, boss: 'suncatcher', music: 'rimewright', tint: '#bfe6f5', tintA: 0.12, fx: 'motes' },
    mini: { x0: 162 * TS, x1: 196 * TS, floor: G * TS, y0: (G - 14) * TS, y1: (G + 1) * TS, trigger: 166 * TS, wallL: 161, gate: 197, boss: 'troll', name: 'THE QUARRY TROLL' },
  };
}

// ============================================================================================================
// THE SKY SHIP. A goblin galleon under sail above the clouds, lashed to a harbour that floats. ONE RULE, said
// three ways: THE WIND GOES WHERE THE SAILS SAY. The sails fill and swing, the flags stream, the cloud comes past
// in the gusts - and the sheet winches are yours: strike one and the wind in that part of her comes round.
// Under all of it is the sky, and the sky catches nobody.
//   1 THE CLOUD HARBOUR   the quay, the chandler, the mooring mast
//   2 THE GANGWAYS        pontoons under gasbags, a headwind, the first sheet winch
//   3 THE FORECASTLE      her bow, her figurehead, a crowd on the open deck under the foremast
//   4 THE GUN DECK        down the hatch: the Boatswain's room, and her guns
//   5 THE RIGGING         her waist is holed to the sky: over it on the yard, up to the crow's nest
//   6 THE WAIST           sail goblins riding the wind down her deck, and the second winch
//   7 THE CARGO BALLOON   the hatch is open to the cloud: the updraft, the slings, the gondola
//   8 THE QUARTERDECK     THE MASTHEAD, in his own rigging, with the wind for a floor
// ============================================================================================================
function theSkyShip() {
  const W = 600, H = 44, R = 26;
  const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const gusts = [], movers = [], stone = [], interiors = [], nets = [];
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const rock = (x0, x1, y0, y1) => { block(x0, x1, y0, y1); stone.push([x0, x1, y0, y1]); };
  /* EVERY ROPE IS HUNG LAST (rule I): a cut made after a net takes its rungs out and says nothing */
  const net = (x0, x1, y0, y1) => nets.push([x0, x1, y0, y1]);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  /* A PONTOON IS RIGGED TO SOMETHING: a gasbag over it, and its rope down to the boards */
  const pontoon = (x0, x1) => { block(x0, x1, R, R + 1); const m = (x0 + x1) >> 1; ent('balloon', m, R - 8, { r: 3 }); net(m, m, R - 4, R - 1); };
  const gust = (x0, x1, y0, y1, o) => gusts.push(Object.assign({ x0: x0 * TS, x1: x1 * TS, y0: y0 * TS, y1: y1 * TS, dir: 1, period: 5, on: 3, phase: 0, moor: true, k: 1 }, o));

  // ---------------- 1. THE CLOUD HARBOUR (x 0-64). A quay on a rock that floats, the chandler, the mooring mast. ----------------
  block(0, 64, R, R + 3); block(3, 61, R + 4, R + 5); block(9, 55, R + 6, R + 6);   /* an old hull moored as a quay */
  ent('balloon', 14, R - 12, { r: 4 }); ent('balloon', 58, R - 13, { r: 4 }); net(14, 14, R - 8, R - 1); net(58, 58, R - 8, R - 1);   /* and the gasbags that hold her up */
  sign(3, R - 1, 'THE CLOUD HARBOUR. THE SAILS SAY WHERE THE WIND GOES. GO WITH IT, OR TURN IT.');
  ent('check', 7, R - 1); ent('npc', 11, R - 1, { kind: 'squire' });
  sign(15, R - 1, 'HER PIGEONS GOT LOOSE WHEN THEY BOARDED HER. THREE OF THEM ARE STILL ON HER.');
  ent('deco', 19, R - 1, { kind: 'stall', v: 1 });
  sign(27, R - 1, 'THE HARBOUR CHANDLER. HIS STALL IS UP AND HIS SHUTTERS ARE DOWN.');
  ent('deco', 31, R - 1, { kind: 'barrels' });
  /* THE MOORING MAST: her bow line is made fast at the top of it, and so is the best view in the harbour */
  plat(39, 9, 8); plat(45, 17, 5); net(42, 43, 10, R - 1);
  ent('deco', 42, R - 1, { kind: 'mastTall', v: 0 }); ent('deco', 40, 8, { kind: 'pennant', v: 2 });
  ent('silver', 44, 7);
  sign(37, R - 1, 'THE MOORING MAST HOLDS HER BOW LINE. CLIMB IT: THE HARBOUR PAYS AT THE TOP.');
  ent('lookout', 46, 16, { face: -1 });
  ent('cutlass', 34, R - 1, { face: -1 }); ent('cutlass', 55, R - 1, { face: -1 });
  ent('thief', 50, R - 1, { face: -1 }); ent('archer', 45, 8, { face: 1 });   /* a cutpurse on the quay, and a bow at the top of the mast */
  ent('flagpost', 61, R - 1);
  coins([10, R - 2], [18, R - 2], [30, R - 2], [48, R - 2], [52, R - 2], [41, 8], [46, 8]);

  // ---------------- 2. THE GANGWAYS (x 65-149). Pontoons under gasbags, and the wind across the gaps between them. ----------------
  pontoon(69, 75); pontoon(80, 87);
  /* THE FIRST SHEET WINCH. The gap past it is a jump in a lull, a stroll with the wind behind you - and the wind is against you */
  ent('sheet', 86, R - 1, { id: 'gangway' });
  sign(81, R - 1, 'A SHEET WINCH. STRIKE IT AND THE SAILS COME ROUND, AND SO DOES THE WIND.');
  gust(76, 101, 8, R + 2, { dir: -1, period: 6, on: 3.6, k: 1.2, helm: 'gangway' });
  block(93, 100, R, R + 1); ent('balloon', 96, 12, { r: 3 }); plat(94, 16, 5); net(96, 96, 17, R - 1);   /* a basket under this one: somebody keeps birds */
  ent('stray', 95, 15, { kind: 'pigeon' }); ent('check', 99, R - 1); ent('flagpost', 94, R - 1);
  pontoon(106, 112); ent('mover', 114, R - 1, { len: 2, range: 0, bob: true });
  pontoon(118, 124);
  /* a rope off a gasbag across the last of it, for anyone who would rather swing than wait */
  ent('balloon', 128, 7, { r: 4 }); movers.push({ kind: 'swing', px: 128 * TS + 8, py: 11 * TS, arm: 128, x: 0, y: 0, w: 32, h: 8, period: 3.4, phase: 0.8 });
  pontoon(130, 136);
  for (let x = 137; x <= 147; x++) set(x, R, T.PLANK);         /* her gangway, run out to the last pontoon */
  gust(102, 150, 4, R + 2, { dir: 1, period: 4.4, on: 2.6, alt: true, k: 1.1 });
  ent('sailer', 111, R - 1, { face: -1 }); ent('kite', 104, 12); ent('kite', 121, 10); ent('kite', 140, 11);
  ent('cutlass', 120, R - 1, { face: -1 }); ent('sapper', 123, R - 1, { face: -1 }); ent('boarder', 134, R - 1, { face: -1 }); ent('boarder', 144, R - 1, { face: -1 });
  ent('shield', 141, R - 1, { face: -1 }); ent('shield', 147, R - 1, { face: -1 });   /* THE GANGWAY IS A CHOKE: two shields and a boarder on a plank one man wide */
  ent('harpy', 90, 14); ent('harpy', 127, 13);                  /* and the harpies work the gaps, because you cannot stop in them */
  ent('flagpost', 133, R - 1);
  sign(139, R - 1, 'HER BOARDING NET. SHE IS A GOBLIN SHIP, AND SHE IS NOT TIED UP FOR VISITORS.');
  coins([72, R - 2], [84, R - 2], [90, R - 5], [104, R - 3], [110, R - 2], [116, R - 3], [122, R - 2], [128, R - 4], [134, R - 2], [142, R - 2]);

  // ---------------- 3. THE FORECASTLE (x 148-214). Her bow, her figurehead, and a crowd on her open deck. ----------------
  block(150, W - 1, R, R + 7);                                  /* HER HULL, bow to stern: two courses of deck and her sides under them */
  block(154, W - 5, R + 8, R + 9); block(164, W - 16, R + 10, R + 10);   /* and her keel */
  block(150, 176, R - 4, R - 1);                                /* the forecastle */
  net(148, 149, R - 4, R + 5);                                  /* the boarding net over her bow */
  ent('deco', 149, R + 2, { kind: 'figurehead', hang: true });
  sign(152, R - 5, 'HER FORECASTLE. A GOBLIN GALLEON UNDER FULL SAIL, AND EVERY HAND ON HER HEARD YOU.');
  ent('check', 155, R - 5); ent('deco', 159, R - 5, { kind: 'shipBell' }); ent('deco', 173, R - 5, { kind: 'anchor' });
  ent('lookout', 162, R - 5, { face: -1 }); ent('cutlass', 166, R - 5, { face: -1 }); ent('horn', 172, R - 5, { face: -1 });   /* a hornblower on her forecastle: the first wind here that is a goblin's */
  net(177, 177, R - 4, R - 1);                                  /* down off her forecastle, and back up it */
  /* HER FOREMAST: a yard over the crowd, and a shooter on the one above it */
  plat(189, 15, 15); plat(192, 10, 9); net(196, 197, 9, R - 1);
  ent('deco', 196, R - 1, { kind: 'mastTall', v: 1 }); ent('deco', 193, 9, { kind: 'pennant', v: 0 });
  ent('sail', 196, 11, { w: 8, h: 4 }); ent('sail', 196, 16, { w: 14, h: 6 });
  ent('marine', 199, 9, { face: -1 });
  sign(180, R - 1, 'A CROWD ON OPEN DECK. PUT YOUR BACK TO THE MAST, OR GET UP ON THE YARD OVER THEM.');
  for (const x of [185, 192, 204]) ent('cutlass', x, R - 1, { face: -1 });
  ent('boarder', 200, R - 1, { face: -1 }); ent('boarder', 188, R - 1, { face: -1 }); ent('bosun', 207, R - 1, { face: -1 });
  ent('keg', 183, R - 1); ent('javelin', 198, R - 1, { face: -1 }); ent('archer', 193, 9, { face: -1 });
  gust(178, 214, 2, R, { dir: 1, period: 4.6, on: 2.8, alt: true, k: 0.9 });
  coins([158, R - 6], [166, R - 6], [182, R - 2], [190, 14], [200, 14], [196, 9]);
  /* THE DECKHOUSE amidships: there is no way along her deck past it, only down through her guns */
  block(215, 284, R - 8, R - 1);
  net(215, 284, R - 9, R - 9);                                  /* and her boarding netting stretched over the top of it */
  for (const x of [226, 250, 274]) ent('deco', x, R - 4, { kind: 'sternWindows' });

  // ---------------- 4. THE GUN DECK (x 213-288). Down her hatch: the Boatswain's room, and her guns. ----------------
  air(213, 214, R, R + 1); net(213, 214, R, R + 5);
  air(213, 288, R + 2, R + 5); interiors.push([213, 288, R + 2, R + 5, 'ship']);
  sign(209, R - 1, 'THE GUN DECK IS DOWN THIS HATCH. THE BOATSWAIN KEEPS IT, AND HE WHISTLES.');
  ent('check', 211, R - 1);
  /* THE BOATSWAIN'S ROOM. The hatch shuts behind you and his gate shuts in front of you */
  for (let y = R + 2; y <= R + 5; y++) set(241, y, T.PORT);
  ent('bosun', 235, R + 5, { face: -1, mini: true });
  ent('deco', 222, R + 5, { kind: 'hammock', v: 0 }); ent('deco', 230, R + 5, { kind: 'kegStack' });
  /* HER GUNS, past his gate: strike a breech and the deck in front of it is cleared */
  ent('cannon', 246, R + 5, { deck: true }); ent('cannon', 266, R + 5, { deck: true });
  sign(244, R + 5, 'STRIKE A BREECH AND THE GUN FIRES DOWN HER DECK. THEN IT IS TOO HOT A WHILE.');
  ent('check', 251, R + 5);
  ent('sapper', 273, R + 5, { face: -1 }); ent('javelin', 254, R + 5, { face: -1 });   /* a powder monkey with a lit fuse, in a corridor with her guns in it */
  ent('boarder', 257, R + 5, { face: -1 }); ent('cutlass', 262, R + 5, { face: -1 }); ent('boarder', 274, R + 5, { face: -1 }); ent('cutlass', 279, R + 5, { face: -1 });
  ent('deco', 283, R + 5, { kind: 'chickenCoop' }); ent('stray', 281, R + 5, { kind: 'pigeon' });
  for (const x of [220, 236, 256, 270]) ent('deco', x, R + 3, { kind: 'gunport', v: x % 2 });
  coins([218, R + 5], [226, R + 5], [248, R + 5], [254, R + 5], [270, R + 5], [276, R + 5]);
  air(286, 287, R, R + 1); net(286, 287, R, R + 5);             /* and up out of it aft of the deckhouse */

  // ---------------- 5. THE RIGGING (x 285-380). Her waist is holed to the sky. Over it on the yard, up to the crow's nest. ----------------
  air(300, 318, R, R + 10);                                     /* the hole in her: deck, sides and keel, and cloud under it */
  net(296, 297, 17, R - 1);                                     /* the shrouds up to the spar */
  plat(296, 16, 46);                                            /* the spar and the main yard, one run over the hole */
  plat(320, 10, 18); plat(325, 4, 8); net(328, 329, 5, R - 1);  /* the topsail yard, the crow's nest, her mainmast */
  ent('deco', 328, 3, { kind: 'crowNest' }); ent('deco', 328, R - 1, { kind: 'mastTall', v: 0 });
  ent('silver', 331, 2);
  net(350, 351, 17, R - 1);                                     /* down the far shrouds */
  ent('sail', 329, 11, { w: 16, h: 4 }); ent('sail', 329, 17, { w: 22, h: 6 });
  gust(286, 380, 0, R, { dir: 1, period: 4, on: 2.6, alt: true, k: 1.1 });
  sign(290, R - 1, 'HER WAIST IS HOLED TO THE SKY. GO OVER ON THE YARD, WITH THE WIND BEHIND YOU.');
  ent('check', 293, R - 1);
  ent('marine', 323, 9, { face: -1 }); ent('marine', 338, 15, { face: -1 }); ent('cutlass', 306, 15, { face: -1 });
  L.spikes(301, 303, 15); L.spikes(309, 310, 15);                /* THE SPAR IS SPLINTERED where the shot went through her: hop the teeth */
  ent('archer', 334, 9, { face: -1 }); ent('archer', 314, 15, { face: -1 }); ent('harpy', 342, 2); ent('cutlass', 326, 15, { face: -1 });
  ent('javelin', 366, R - 1, { face: -1 }); ent('sapper', 378, R - 1, { face: -1 });
  ent('kite', 312, 7); ent('kite', 346, 5);
  ent('boarder', 358, R - 1, { face: -1 }); ent('cutlass', 375, R - 1, { face: -1 });
  ent('check', 356, R - 1); ent('flagpost', 353, R - 1);
  ent('deco', 312, 17, { kind: 'rigging', v: 0 }); ent('deco', 344, 17, { kind: 'rigging', v: 1 });
  coins([302, 15], [306, 15], [314, 15], [318, 15], [324, 9], [334, 9], [326, 3], [332, 3], [362, R - 2], [368, R - 2]);

  // ---------------- 6. THE WAIST (x 380-470). Sail goblins riding the wind down her open deck, and the second winch. ----------------
  ent('sheet', 385, R - 1, { id: 'waist' });
  sign(380, R - 1, 'SAIL GOBLINS RIDE THE WIND AT YOU. BLOCK ONE AND SHE SPILLS, OR TURN THE WIND ON THEM.');
  gust(381, 472, 6, R + 1, { dir: -1, period: 6, on: 4, k: 1, helm: 'waist' });
  air(418, 421, R, R + 10); air(446, 449, R, R + 10);           /* two stove bays, open to the cloud */
  for (const x of [404, 432, 458, 466]) ent('sailer', x, R - 1, { face: -1 });
  ent('boarder', 412, R - 1, { face: -1 }); ent('cutlass', 428, R - 1, { face: -1 }); ent('bosun', 442, R - 1, { face: -1 });
  ent('keg', 425, R - 1); ent('keg', 454, R - 1);
  ent('horn', 414, R - 1, { face: -1 }); ent('horn', 462, R - 1, { face: -1 }); ent('javelin', 435, R - 1, { face: -1 }); ent('archer', 437, 14, { face: -1 });
  L.spikes(399, 401, R - 1); L.spikes(407, 408, R - 1);         /* boarding spikes across her deck, to be jumped into the wind */
  plat(434, 15, 14); net(440, 441, 10, R - 1); ent('sail', 440, 16, { w: 12, h: 5 }); ent('marine', 445, 14, { face: -1 });
  ent('deco', 440, R - 1, { kind: 'mastTall', v: 1 }); ent('deco', 440, 9, { kind: 'pennant', v: 1 });
  ent('check', 396, R - 1); ent('check', 452, R - 1);
  coins([390, R - 2], [400, R - 2], [410, R - 2], [419, R - 3], [424, R - 2], [436, 14], [444, 14], [447, R - 3], [462, R - 2]);

  // ---------------- 7. THE CARGO BALLOON (x 470-547). Her cargo hatch is open to the cloud, and her balloon is over it. ----------------
  air(478, 531, R, R + 10);
  sign(467, R - 1, 'HER CARGO HATCH IS OPEN TO THE CLOUD. THE UPDRAFT PUTS YOU IN THE SLING.');
  ent('check', 470, R - 1);
  net(474, 475, 7, R - 1); plat(474, 6, 13);                    /* the cargo derrick: a post, and its boom out over the hatch */
  plat(480, 15, 5); net(482, 482, 7, 14);                       /* and the sling on the boom */
  ent('vent', 477, R - 1, { period: 100, on: 100, h: 170, wind: true, w: 14, lift: 270 });
  ent('balloon', 505, 6, { r: 11 });                            /* HER CARGO BALLOON, and the gondola slung under it */
  plat(492, 17, 26); net(496, 496, 12, 16); net(514, 514, 12, 16);
  ent('stray', 504, 16, { kind: 'pigeon' }); ent('marine', 511, 16, { face: -1 }); ent('silver', 497, 10);
  net(537, 538, 9, R - 1); plat(522, 8, 17);                    /* the far derrick */
  plat(522, 19, 5); net(524, 524, 9, 18);
  gust(476, 534, 0, R, { dir: 1, period: 5, on: 2.4, alt: true, k: 0.9 });
  ent('kite', 487, 13); ent('kite', 528, 13); ent('harpy', 500, 22); ent('harpy', 486, 3);
  ent('stormshaman', 527, 7, { face: -1 });                      /* a shaman out on the far boom, throwing the sky at the gondola */
  coins([481, 14], [484, 14], [494, 16], [500, 16], [508, 16], [516, 16], [523, 18], [526, 18], [478, 5], [484, 5], [528, 7], [534, 7]);

  // ---------------- 8. THE QUARTERDECK (x 532-599). THE MASTHEAD, in his own rigging, with the wind for a floor. ----------------
  sign(535, R - 1, 'THE MASTHEAD RIDES HIS SAIL AT YOU ON THE WIND. TURN THE WIND AND HE FOULS IN IT.');
  ent('check', 543, R - 1);
  net(570, 571, 12, R - 1); plat(561, 17, 20); plat(565, 12, 12);   /* his mast, his yard, his topsail yard */
  net(555, 556, 18, R - 1); net(585, 586, 18, R - 1);           /* and the shrouds up to it */
  ent('sheet', 553, R - 1, { id: 'quarter' });
  ent('sail', 570, 18, { w: 18, h: 5 }); ent('sail', 570, 13, { w: 10, h: 3 });
  ent('deco', 570, 11, { kind: 'pennant', v: 1 }); ent('flagpost', 590, R - 1);
  gust(549, 593, 4, R, { dir: 1, period: 5, on: 3.2, alt: true, k: 0.75, arena: true, helm: 'quarter' });
  ent('masthead', 583, R - 1);
  ent('gate', 596, R - 1); block(598, W - 1, 0, R - 1);
  ent('deco', 597, R - 5, { kind: 'sternWindows' });

  /* HER SIDE, the length of her: gunports down the hull and a rope over it, so she reads as a ship and not a pier */
  for (let x = 160; x < 596; x += 14) { if ((x >= 298 && x <= 320) || (x >= 416 && x <= 423) || (x >= 444 && x <= 451) || (x >= 476 && x <= 533)) continue;
    ent('deco', x, R + 4, { kind: 'gunport', v: x % 2 }); }

  /* THE ROPES, LAST: nothing is cut after this line */
  for (const [x0, x1, y0, y1] of nets) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: R - 1 }, pools: [], falls: [], moversExtra: movers, gusts, stone, interiors,
    music: 'skysail', duskStart: 99999, duskLen: 1, night: false, cloudSea: (R + 4) * TS, noCoin: [[212, 287, 8, R - 9]],
    quest: { n: 3, item: 'pigeon', name: 'HER PIGEONS', npc: 'squire', done: 'THE PIGEONS ARE HOME', reward: 'relic', relic: 'keelstone' },
    palette: { set: 'ship', dress: 'ship', sky: [[58, 104, 186], [255, 206, 158]], far: 'crag', mid: 'crag', near: 'crag', noFg: true, haze: 'rgba(255,236,200,0.10)',
      grass: '#8a9a5a', grassL: '#b4c47a', grassD: '#5a6a3a', dirt: '#6a5a44', dirtL: '#9a8464', dirtD: '#43382a', canopy: ['#6a7a9a', '#8a9ab8', '#b0bcd4', '#dfe6f0'] },
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: 549 * TS, x1: 593 * TS, floor: R * TS, y0: 4 * TS, trigger: 553 * TS, wallL: 548, wallR: 594, boss: 'masthead', music: 'masthead', tint: '#e8c89a', tintA: 0.06, fx: 'motes',
      mast: 571 * TS, yard: 17 * TS },                          /* his mizzen and its yard: where he goes up, and where he comes down from */
    mini: { x0: 216 * TS, x1: 241 * TS, floor: (R + 6) * TS, y0: (R + 1) * TS, y1: (R + 7) * TS, trigger: 220 * TS, wallL: 215, gate: 241, boss: 'bosun', name: 'THE BOATSWAIN' },
  };
}

// ============================================================================================================
// THE DROWNED CAUSEWAY. The old pilgrim road out across the tidal flats to the island chapel, which the sea took a
// hundred years ago and gives back twice a minute. ONE RULE, said three ways: THE TIDE TAKES THE ROAD. The bells in
// the towers toll before it comes (three strokes), a line of foam stands up where the water will be, and the gauge
// at the top of the screen runs down - and every TIDE BELL is yours: strike one and the tide turns on your word.
// High water carries you up onto the arches and the ship decks; low water gives you the road, the stones across the
// channels, the chapel crypt and the holds. Out at the end of the road, where it goes into the sea, something waits.
//   1 THE LANDING         the sea wall, the pilgrims' squire, the first tide bell
//   2 THE MILE ROAD       the road on its piers, the first dip, the feelers in the flats, the stepping stones
//   3 THE ARCADE          a roofed gallery that floods to its vaults, and the broken road along its top
//   4 THE CHAPEL          the drowned chapel on its steps (they lock you in), and the crypt under the road
//   5 THE WRECK FIELD     hulls on the flats, holds at low water and decks at high, channels with anglers in
//   6 THE BROKEN SPANS    the road in pieces on its piers, a tower and its bell over the deep water
//   7 THE LAST MILE       the road into the open sea, the waystones, and the fog
//   8 THE KRAKEN'S REACH  the end of the road
// Rows: the road stands on 24, the raised stone on 18, the flats on 30, the bed is 40. HIGH WATER is row 20 (the road
// is three rows under it); LOW WATER is row 31 (under the flats). The pool is built at LOW water: every tool reads the
// level as the road you can walk, and the tide in src/main.js (updateCauseTide) moves it.
// ============================================================================================================
function theDrownedCauseway() {
  const W = 612, H = 44, R = 24, RH = 18, FL = 30, HW = 20, LWR = 31;
  const L = painter(W, H);
  const { block, plat, ent, coins, set } = L;
  const nets = [], interiors = [], airRooms = [];
  /* WHERE THE AIR IS, in the one list the breath clock and tools/breath.mjs both read (src/deepair.js) */
  const D = { vents: [], clams: [], bulbs: [], wrecks: [], pockets: [] };
  const vent = (x, y, h) => D.vents.push({ x, y, h });
  const clam = (x, y) => D.clams.push({ x, y });
  const wreck = (x, y) => D.wrecks.push({ x, y });
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const net = (x0, x1, y0, y1) => nets.push([x0, x1, y0, y1]);   /* EVERY ROPE IS HUNG LAST (rule I) */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const deco = (kind, x, y, o) => ent('deco', x, y, Object.assign({ kind }, o || {}));
  /* THE ROAD: three courses of dressed stone on piers, with the sea going through the arches between them */
  /* (it is built solid to the bed: the arches between the piers were sealed pockets under the road that every tool read as a trap
     and nobody could see; the sea shows through the broken arches and the channels instead) */
  const road = (x0, x1, top = R) => block(x0, x1, top, H - 1);
  const bell = (x, y) => ent('tidebell', x, y);
  block(0, W - 1, 40, H - 1);   /* the bed of the flats, under everything */

  // ---------------- 1. THE LANDING (x 0-44). The sea wall, the squire who lost his pilgrims, the first tide bell. ----------------
  block(0, 40, RH, 39);
  sign(2, RH - 1, 'THE DROWNED CAUSEWAY. THE TIDE TAKES THE ROAD TWICE A MINUTE, AND THE BELLS SAY WHEN.');
  ent('npc', 6, RH - 1, { kind: 'squire' }); ent('check', 9, RH - 1);
  sign(12, RH - 1, 'THREE PILGRIMS WENT OUT ON THE ROAD AT LOW WATER. THE TIDE CAME IN BEHIND THEM.');
  bell(18, RH - 1); sign(15, RH - 1, 'A TIDE BELL. STRIKE IT AND THE TIDE TURNS NOW, NOT WHEN IT LIKES.');
  deco('wayShrine', 24, RH - 1); deco('fencePosts', 30, RH - 1); deco('drownedTree', 36, RH - 1);
  coins([5, RH - 2], [21, RH - 2], [27, RH - 2], [33, RH - 2]);
  block(41, 42, 20, 39); block(43, 44, 22, 39);   /* the steps down off the sea wall */
  sign(40, RH - 1, 'HIGH WATER LIFTS YOU. LOW WATER GIVES YOU THE ROAD. EITHER WILL GET YOU ACROSS.');

  // ---------------- 2. THE MILE ROAD (x 45-160). The road on its piers, the first dip, the feelers, the stones. ----------------
  road(45, 78); deco('waystone', 50, R - 1); deco('waystone', 72, R - 1, { v: 1 });
  sign(76, R - 1, 'THE FLATS HAVE ARMS IN THEM. THE MUD STIRS BEFORE ONE COMES UP.');
  /* THE FIRST DIP: the road sags into the flats here, and it is the first stretch the sea covers */
  block(79, 80, 26, H - 1); block(81, 94, 28, H - 1); block(95, 96, 26, H - 1);
  /* THE FISHERS' HAMLET, on stilts over the dip: a boardwalk over the high water, ladders down the stilts to the flats, a boat moored
     between the stilts that the flood lifts to the boards, and the fishwife who has watched the tide come in for forty years */
  for (let x = 83; x <= 92; x++) set(x, 18, T.PLANK);
  net(82, 82, 18, 27); net(93, 93, 18, 27);
  ent('mover', 86, 28, { len: 3, vert: true, rise: 8, tide: true });   /* THE BOAT: on the mud at low water, up at the boards at high */
  deco('fishCottage', 89, 17); deco('netPoles', 84, 17); deco('fishTrap', 92, 17, { v: 1 });
  ent('npc', 86, 17, { kind: 'shepherd', name: 'THE FISHWIFE', lines: ['THREE BELLS, THEN THE FOAM, THEN THE SEA. TWICE A MINUTE ON THIS ROAD, AND THE SAME WAY EVERY TIME.',
    'MY BOAT SITS IN THE MUD AT LOW WATER AND RIDES UP TO MY DOOR AT HIGH. ANYTHING MOORED ON THIS ROAD DOES THE SAME. USE THEM.',
    'PAST THE WRECKS THE SEA RUNS OUT UNDER THE OLD ARCH WHEN IT FALLS. IT WILL CARRY A SWIMMER THROUGH, IF THE SWIMMER LETS IT.'] });
  ent('feeler', 90, 27); coins([83, 26], [92, 26], [86, 15], [90, 15]);
  road(97, 120); ent('check', 100, R - 1); deco('waystone', 110, R - 1);
  deco('fishCottage', 104, R - 1, { v: 1 }); deco('barrels', 98, R - 1);   /* the smokehouse on the road end of the hamlet: its chimney smokes (causeLife) */
  ent('sailor', 112, R - 1, { face: -1 }); ent('petrel', 104, 14); ent('scout', 118, R - 1, { face: -1 });
  /* THE STONES. At low water a line of them across the channel; at high water the channel is a swim */
  block(121, 122, 26, 39); block(145, 146, 26, 39);
  for (const x of [125, 129, 133, 137, 141]) block(x, x + 1, 28, 39);
  net(123, 123, 26, 34); net(143, 143, 26, 34);   /* a jump out of the sea does not clear three courses: rungs up the banks, for a fall at low water */
  sign(119, R - 1, 'AT LOW WATER THE STONES ARE A ROAD. AT HIGH WATER, SWIM IT, AND WATCH THE URCHINS.');
  ent('urchin', 127, 36); ent('urchin', 139, 35); ent('eel', 131, 37);
  ent('mover', 129, 28, { len: 2, vert: true, rise: 8, tide: true });   /* A RAFT moored on the second stone: a dry deck over the urchins at high water (not on the pilgrim's stone) */
  coins([126, 27], [130, 27], [134, 27], [138, 27], [142, 27]);
  ent('stray', 134, 27, { kind: 'fisher' });
  road(147, 160); ent('feeler', 152, R - 1); ent('crab', 157, R - 1, { face: -1 });

  // ---------------- 3. THE ARCADE (x 160-250). A roofed gallery that floods to its roof, with vaults where the air stays. ----------------
  road(160, 250);
  block(165, 244, RH, 21);   /* the gallery roof, and the road along the top of it */
  /* THE VAULTS: where the roof goes up, the water cannot close: the air stays in them at high water */
  for (const v of [184, 210, 234]) { air(v, v + 4, RH, 21); block(v - 1, v + 5, 16, 17); }
  /* THE BROKEN SPAN: the top road is down here, open to the sky, and the gallery under it with it */
  air(222, 224, RH, 21);
  interiors.push([165, 244, 22, 23, 'hall']);
  plat(155, 22, 3); plat(158, 20, 3); plat(246, 20, 3); plat(249, 22, 3);   /* the steps up onto the top of it, both ends */
  sign(162, R - 1, 'THE ARCADE FLOODS TO ITS ROOF. BREATHE IN THE VAULTS, WHERE THE ROOF GOES UP.');
  ent('check', 163, R - 1); ent('check', 206, RH - 1);
  for (const x of [176, 198, 228]) ent('sailor', x, R - 1, { face: -1 });
  ent('netter', 216, R - 1, { face: -1 }); ent('crab', 240, R - 1, { face: -1 });
  ent('petrel', 190, 13); ent('petrel', 200, 12); ent('petrel', 232, 11); ent('scout', 243, RH - 1, { face: -1 });
  ent('silver', 212, 14);
  coins([170, 23], [180, 23], [192, 23], [204, 23], [220, 23], [236, 23], [170, 17], [178, 17], [196, 17], [218, 17], [230, 17], [242, 17]);
  deco('brokenArch', 172, RH - 1); deco('wayShrine', 226, R - 1);

  // ---------------- 4. THE CHAPEL (x 250-330). The island chapel on its steps, and the crypt the sea keeps. ----------------
  road(250, 330);
  block(259, 262, 22, 23);                        /* the chapel steps */
  block(263, 300, 20, 23);                        /* its floor, over the high water */
  block(263, 265, 8, 16); block(297, 300, 8, 16); /* its walls, the doors under them */
  block(263, 300, 8, 9);                          /* its roof */
  block(301, 304, 22, 23);
  interiors.push([266, 296, 10, 19, 'chapel']);
  sign(257, R - 1, 'THE ISLAND CHAPEL. THE DROWNED STILL COME TO IT, AND THEY SHUT THE DOORS BEHIND YOU.');
  ent('check', 256, R - 1);
  bell(281, 19); sign(278, 19, 'THE CHAPEL BELL IS A TIDE BELL TOO. THE CROWD INSIDE WILL NOT WAIT FOR IT.');
  deco('wayShrine', 272, 19); deco('wayShrine', 290, 19);
  ent('stray', 294, 19, { kind: 'fisher' });
  coins([268, 18], [276, 18], [286, 18], [292, 18]);
  /* THE CRYPT, under the road past the chapel. Always half full; at high water full to the vault, and one bell of air */
  air(309, 311, R, R + 2); air(306, 326, 27, 37); net(310, 310, R, 34);   /* the ladder down the hole, for the way out at low water */
  deco('airBell', 322, 37);
  sign(314, R - 1, 'THE CRYPT. AT HIGH WATER IT FILLS: ONE BELL OF AIR DOWN THERE.');
  ent('silver', 324, 35); coins([312, 36], [316, 36], [320, 36]); deco('seaChest', 318, 37);
  ent('eel', 314, 33); ent('urchin', 308, 36);
  ent('sailor', 268, 19, { face: -1 }); ent('crab', 324, R - 1, { face: -1 }); ent('feeler', 328, R - 1); ent('check', 318, R - 1);

  // ---------------- 5. THE WRECK FIELD (x 331-420). Hulls on the flats: holds at low water, decks at high. ----------------
  block(331, 332, 26, 39); block(333, 334, 28, 39);
  block(335, 420, FL, 39);
  air(352, 358, FL, 39); air(392, 398, FL, 39);   /* the two channels: deep at any tide */
  for (const x of [353, 357, 393, 397]) block(x, x, 38, 39);
  ent('check', 336, FL - 1);
  sign(334, 27, 'THE WRECK FIELD. AT LOW WATER, THE HOLDS. AT HIGH WATER, THE DECKS AND THE RIGGING.');
  ent('eel', 395, 34); ent('urchin', 354, 37); ent('angler', 437, 35, { face: -1 }); ent('urchin', 454, 38);   /* the channels' own fish, where the sprinkler cannot be trusted with them */
  /* WRECK ONE: a coaster on her keel, a gash in her side into the hold */
  block(339, 350, 25, 29); for (let x = 339; x <= 350; x++) set(x, 24, T.PLANK); air(340, 348, 26, 28); air(339, 339, 27, 28);
  plat(336, 27, 2); plat(337, 25, 2);
  deco('mastStump', 345, 23); coins([341, 27], [344, 27], [347, 27]); deco('seaChest', 346, 28);
  /* WRECK TWO: a big merchantman across the flats, her yard and her rigging up over the second channel */
  block(360, 388, 24, 29); for (let x = 360; x <= 388; x++) set(x, 23, T.PLANK); air(362, 385, 25, 28); air(386, 388, 26, 28);
  plat(359, 27, 1); plat(358, 25, 2);
  net(374, 374, 12, 22); plat(366, 12, 17); plat(386, 16, 5);
  ent('silver', 380, 10); deco('rigging', 368, 22, { v: 0 });
  ent('stray', 372, 28, { kind: 'fisher' });
  coins([364, 28], [370, 28], [378, 28], [382, 28], [368, 11], [376, 11], [388, 15]);
  /* WRECK THREE: her bow, stood up out of the flats */
  block(400, 401, 28, 29); block(402, 405, 26, 29); block(406, 409, 24, 29); block(410, 413, 22, 29);   /* up her bow in two-row steps */
  deco('figurehead', 412, 21);
  ent('crab', 336, FL - 1); ent('crab', 411, 21, { face: -1 }); ent('netter', 366, 22, { face: -1 }); ent('sailor', 344, 23, { face: -1 });
  ent('sailor', 375, 28, { face: -1 }); ent('tideguard', 382, 22, { face: -1 }); ent('heronfoe', 391, FL - 1);
  ent('angler', 355, 36, { face: -1 }); ent('angler', 395, 36, { face: -1 }); ent('eel', 356, 33); ent('urchin', 394, 38);
  ent('feeler', 415, FL - 1); ent('petrel', 380, 6); ent('siren', 390, FL - 1, { face: -1 });   /* on the flats by the second channel */
  coins([354, 29], [396, 29], [406, 23], [411, 21]);

  // ---------------- 6. THE BROKEN SPANS (x 421-510). The road in pieces on its piers, and a tower over the deep water. ----------------
  block(417, 418, 28, 39); block(419, 420, 26, 39);   /* up off the flats onto the spans, two rows a step */
  road(421, 432); road(439, 450); road(458, 470); road(477, 510);
  for (const [a, b] of [[433, 438], [451, 457], [471, 476]]) { net(a, a, R + 1, 32); net(b, b, R + 1, 32); }   /* rungs up the pier faces, for a fall at low water */
  /* THE SEA ARCH: the span between the first two breaks is hollow under the water, and when the tide falls the sea runs out through it to
     the open water (causeCurrents). A grotto in its roof keeps a bell of air and what the sea washed into it */
  air(439, 450, 32, 36); air(443, 447, 27, 30); air(444, 445, 31, 31); deco('airBell', 446, 30); ent('mend', 444, 29);   /* (a sea chest would not fit under the grotto's roof: the pixels check saw it run into the rock) */
  /* THE SEAL ROCK in the last break: dry at low water, where the seals lie; under ten rows of sea at high */
  block(472, 475, 30, 39);
  ent('check', 424, R - 1);
  sign(426, R - 1, 'THE SPANS ARE DOWN. JUMP THEM AT LOW WATER, SWIM THEM AT HIGH. THE TOWER BELL TURNS IT.');
  block(462, 466, RH, 23); bell(464, RH - 1);
  net(461, 461, RH, 23);
  ent('petrel', 466, 12); ent('petrel', 446, 12); ent('petrel', 486, 10);
  ent('feeler', 444, R - 1); ent('feeler', 482, R - 1); ent('crab', 448, R - 1, { face: -1 }); ent('tideguard', 485, R - 1, { face: -1 }); ent('scout', 468, RH - 1, { face: -1 });
  ent('eel', 454, 36); ent('eel', 436, 34); ent('urchin', 455, 38);
  /* THE PILGRIMS' WAYSTATION: a holm of old stone in the road that the high water never covers, a driftwood fire, and the three who
     reached it when the bells rang, waiting for the ones who did not */
  block(487, 488, 22, 23); block(489, 490, 20, 23); block(491, 505, 19, 23); block(506, 507, 21, 23);
  deco('tent', 493, 18); ent('brazier', 498, 18); deco('lanternPost', 504, 18); deco('waystone', 501, 18, { v: 1 });
  ent('check', 499, 18);
  ent('npc', 495, 18, { kind: 'oldknight', name: 'A PILGRIM', lines: ['WE CAME OUT AT LOW WATER, SIX OF US. THE BELLS RANG AND WE RAN FOR THE HIGH STONE. THREE OF US DID NOT RUN FAST ENOUGH.', 'IF YOU FIND THEM ON THE ROAD, SEND THEM BACK TO THE BOY AT THE SEA WALL. HE CAME ALL THIS WAY FOR US.'] });
  ent('npc', 502, 18, { kind: 'ferryman', name: 'A PILGRIM', lines: ['THE FIRE IS DRIFTWOOD AND THE DRIFTWOOD IS WRECK. WE DO NOT ASK WHOSE.', 'THE LIGHT PAST HERE IS STILL KEPT. BEYOND THE LIGHT THE SEA STANDS UP AT THE END OF THE ROAD. WE PRAY HERE, AND WE GO NO FURTHER.'] });
  coins([435, 21], [454, 21], [473, 21], [464, 15], [480, 23], [492, 17], [505, 17]);

  // ---------------- 7. THE LAST MILE (x 511-565). The road into the open sea, and the fog. ----------------
  road(511, 565);
  /* THE BREAKERS: the sea comes over this mile from the end of the road in waves (causeBreakers). The old parapet stones stand along it,
     and the lee of a stone is where a wave cannot take your feet: the lesson the Kraken's jets ask for at the end of the mile */
  for (const x of [515, 523, 533, 549, 558]) block(x, x, R - 1, R - 1);
  deco('waystone', 519, R - 1); deco('brokenArch', 527, R - 1); deco('wayShrine', 553, R - 1);
  sign(512, R - 1, 'THE SEA BREAKS OVER THE LAST MILE. THE LEE OF A STONE KEEPS YOUR FEET.');
  /* THE LIGHT: a lighthouse over the road with the road through its foot. Its keeper at the door, its beam turning through the fog, its
     tender moored to the tower that the flood lifts to the stair door, and the lamp gallery at the top */
  block(540, 543, 7, 23); air(540, 543, 21, 23);
  for (let x = 537; x <= 546; x++) set(x, 7, T.PLANK);   /* the lamp gallery round the top */
  for (let x = 544; x <= 545; x++) set(x, 18, T.PLANK);   /* the stair door, on the sea side, over the high water */
  net(544, 544, 8, 17);
  ent('mover', 546, R, { len: 2, vert: true, rise: 4, tide: true });   /* THE TENDER: it lies on the road at low water and floats up to the stair door at high */
  ent('npc', 537, R - 1, { kind: 'lamplighter', name: 'THE KEEPER OF THE LIGHT', lines: ['THE LIGHT IS FOR SHIPS. THERE HAVE BEEN NO SHIPS IN TEN YEARS. I KEEP IT FOR WHATEVER IS OUT THERE, SO I SEE IT COMING.',
    'THE SEA BREAKS OVER THIS MILE FROM THE END OF THE ROAD. A WAVE CANNOT TOUCH WHAT STANDS IN THE LEE OF A STONE. REMEMBER THAT AT THE END.',
    'MY TENDER RIDES UP TO THE STAIR DOOR AT HIGH WATER, AND THE STAIR GOES UP TO THE LAMP. THE VIEW FROM THE TOP IS NOT ONE I RECOMMEND.'] });
  coins([538, 6], [545, 6], [546, 6]);
  ent('sailor', 521, R - 1, { face: -1 }); ent('tideguard', 530, R - 1, { face: -1 }); ent('feeler', 536, R - 1); ent('netter', 555, R - 1, { face: -1 });
  ent('check', 561, R - 1);
  sign(551, R - 1, 'THE ROAD GOES OUT INTO THE SEA AND STOPS. THE WATER AT THE END OF IT IS BREATHING.');
  coins([517, 23], [525, 23], [547, 23], [556, 23]);

  // ---------------- 8. THE KRAKEN'S REACH (x 566-609). The end of the road, and what lives off the end of it. ----------------
  block(566, 609, R, R + 1); for (let x = 567; x < 609; x += 8) block(x, x + 1, R + 2, 39);
  block(566, 567, 22, 23); block(568, 570, 20, 23); block(571, 572, 22, 23);   /* the old tower's footing, stepped both sides, and its bell */
  ent('knell', 569, 19);
  block(584, 584, 22, 23); block(585, 589, 21, 23); block(590, 590, 22, 23);   /* the shrine plinth */
  ent('knell', 587, 20);   /* and the shrine's own bell: the tower's is thirty strides from where its head comes up */
  block(597, 598, 23, 23); block(599, 606, 22, 23); for (let x = 599; x <= 606; x++) set(x, 21, T.PLANK);   /* the wreck she came in on */
  deco('waystone', 583, R - 1); deco('waystone', 597, 22, { v: 1 });   /* on pier columns: the sea takes the road between the piers, never over one */
  block(610, W - 1, 0, 39);
  ent('kraken', 604, 20);   /* on the wreck's deck: it is in the sea past the end of the road until it wakes */

  /* THE ROPES, LAST: nothing is cut after this line */
  for (const [x0, x1, y0, y1] of nets) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.NET);

  // ================= THE AIR ON THE FLATS, AND IN HIS REACH =================
  // Two bells on six hundred tiles of road - one in the crypt, one in the grotto of the sea arch - and the KRAKEN'S own
  // water had none at all: four hundred and sixteen tiles of it, the whole of the arena at the end of the road, with no
  // air anywhere a swimmer could reach. The flats vent where the sea has worked its way under the road, and his reach
  // vents between the piers, so the last fight is not also a breath-holding contest. (After the ropes: nothing is cut
  // below this line, so the grid it reads is the finished one.)
  { const gat = (x, y) => L.grid[y * W + x];
    const bed = x => gat(x, 38) === T.AIR && gat(x, 39) === T.AIR && gat(x, 40) === T.SOLID;
    for (let x = 100; x <= 560; x += 20) if (bed(x)) vent(x, 39, 6);
    for (let x = 570; x <= 608; x += 6) if (bed(x)) vent(x, 39, 8);   /* his reach, between the piers */
    for (const x of [130, 356, 396, 454]) if (bed(x)) clam(x, 39);
    for (const x of [344, 470]) if (bed(x)) wreck(x, 39);
  }

  const tideSea = { x0: 4 * TS, x1: 565 * TS, y: LWR * TS, base: 42 * TS, bottom: 40 * TS, swim: true, clear: true, wash: 0.42, grad: false, causeTide: true, loY: LWR * TS, hiY: HW * TS };
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: RH - 1 }, falls: [], interiors, airRooms, deep: D,
    pools: [tideSea, { x0: 566 * TS, x1: 610 * TS, y: 26 * TS, base: 42 * TS, bottom: 40 * TS, swim: true, clear: true, wash: 0.66, arenaTide: true, krakenSea: true }],
    causeTide: { low: 16, warn: 4, rise: 3, high: 14, ebb: 2, fall: 3.5, first: 12 },
    leviathan: { arena: 566 * TS },
    /* THE SEA AS A TOOLBOX (src/main.js, the causeway block). In tiles. CURRENTS run in a box of water by the phase of the tide (px/s,
       + is seaward): the flood across the dip, the ebb over the stones, and the fall out through the sea arch. The BREAKERS come over
       the last mile from the end of the road and a stone's lee turns them. The FOG of the last mile, and the light's lamp that cuts it */
    causeCurrents: [{ x0: 79, x1: 96, y0: 19, y1: 28, rise: -40 }, { x0: 122, x1: 145, y0: 20, y1: 39, high: 45, ebb: 45 }, { x0: 433, x1: 457, y0: 31, y1: 37, fall: 120, ebb: 70 }],
    causeBreakers: { x0: 511, x1: 565, every: 4.4, row: R },
    causeFog: { x0: 505, x1: 566, lamp: [541.5, 5] },
    noDress: [[535, 548, 2, 8]],   /* the lamp gallery round the top of the light: the dress took its boards for a quay and stood a mooring post on it */
    /* WHAT LIVES ON THE ROAD: gulls wheeling over the hamlet, the wrecks, the fire and the light; the smokehouse chimney; the seals on
       their rock; crabs on the flats at low water; buoys riding the tide in the open water; the hamlet's stilts */
    causeLife: { gulls: [[88, 11], [150, 13], [372, 7], [498, 12], [541, 2]], smoke: [[106, 19]], seals: [[472, 475, 30]], crabs: [[81, 94, 28], [335, 338, 30], [389, 391, 30], [414, 420, 30]],
      buoys: [127, 135, 355, 395, 436, 453], stilts: [[85, 18, 28], [90, 18, 28]] },
    music: 'causeway', duskStart: 99999, duskLen: 1, night: false,
    quest: { n: 3, item: 'fisher', name: 'THE PILGRIMS', npc: 'squire', done: 'THE PILGRIMS ARE ACROSS', thanks: 'THEY PRAY FOR YOU' },
    palette: { set: 'shore', sky: 'storm', far: 'causeway', mid: 'causeway', near: 'reef', noFg: true, dress: 'shore', haze: 'rgba(120,150,140,0.14)',
      grass: '#5f7a68', grassL: '#7e9a86', grassD: '#40564a', dirt: '#4e5856', dirtL: '#66706c', dirtD: '#343c3a', canopy: ['#1e2e2c', '#2c403c', '#3a524c', '#506a62'] },
    weather: [{ x0: 0, x1: 510 * TS, kind: 'rain' }, { x0: 510 * TS, x1: 99999, kind: 'mist' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'shore' }],
    arena: { x0: 566 * TS, x1: 610 * TS, floor: R * TS, y0: 4 * TS, trigger: 574 * TS, wallL: 565, wallR: 610, boss: 'kraken', music: 'kraken', tint: '#203a38', tintA: 0.12, fx: 'motes',
      tower: 569 * TS + 8, plinth: [585 * TS, 590 * TS], stones: [583 * TS + 8, 597 * TS + 8], holes: [[578, 580], [594, 595]], rest: 604 * TS },   /* rest: where he is, out in the sea past the last stone - never a body on the road */
  };
}

// ============================================================================================
// THE HEXED FIELDS - the farms under the Archmage's hill, on the road inland between the Causeway and the Hunt.
//
// IF IT GLOWS GREEN, YOU CAN USE IT. His runoff drains down the hill into their ditches, and the farm has gone
// wrong: the crops are dead, the furniture floats, the scarecrows walk and the family is still at home. Three
// things, each INTRODUCED, DEVELOPED, TWISTED and TESTED, and every one of them glows the same green:
//   HEX VINES       strike a trough, a bucket or a sluice and the runoff shoots a vine up out of the dirt. It holds,
//                   it droops and flashes, and it goes back into the ground (the lane; the orchard; the barn's
//                   bucket SHRINKS the bales out of your way instead; the crypt wall).
//   PHANTOM PLANKS  moonlight is a floor. A cloud comes over the moon on a beat you can read, its shadow sweeps
//                   across the land toward you, and then the planks are not there (the pasture; the wisps that
//                   light the way; the open graves).
//   POLTERGEISTS    the farm's own things float on slow loops and carry you (the farmhouse; the barn's bale; the hay
//                   cart the ghost horse pulls downhill; the headstones), and one of them throws itself at you.
// EIGHT SECTIONS: the lane, the dead orchard, the moonlit pasture (the Ploughman in the furrows), the farmhouse,
// the windmill, the threshing barn, the hay cart ride, the family plot - and the burning cornfield at the end.
// ============================================================================================
function theHexedFields() {
  const W = 712, H = 44, G = 34, O = 32;
  const L = painter(W, H);
  const { block, plat, ent, coins, set, spikes } = L;
  const moversExtra = [], interiors = [], nets = [], phantoms = [], shrinks = [], pools = [], gusts = [], trunks = [];
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const net = (x, y0, y1) => nets.push([x, y0, y1]);   /* EVERY LADDER IS HUNG LAST (rule I) */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const deco = (kind, x, y, o) => ent('deco', x, y, Object.assign({ kind }, o || {}));
  const ground = (x0, x1, top = G) => block(x0, x1, top, H - 1);
  /* A HEX VINE: a bud in the dirt on floor row `row`, `w` tiles wide, that shoots `rise` tiles up when its group's runoff is spilled */
  const vine = (x, row, rise, group, w = 2) => moversExtra.push({ kind: 'hexvine', group, x: x * TS, y: row * TS - 8, y0: row * TS - 8, y1: (row - rise) * TS - 8, w: w * TS, h: 8, rise: rise * TS, state: 'bud', k: 0 });
  const spill = (kind, x, y, group, o) => ent('hexspill', x, y, Object.assign({ kind, group }, o || {}));
  const phantom = (x0, x1, row) => { for (let x = x0; x <= x1; x++) set(x, row, T.PLANK); phantoms.push([x0, x1, row]); };
  const ghost = (art, x, row, len, o) => ent('mover', x, row, Object.assign({ len, ghost: art }, o || {}));
  const trunk = (x, top, bottom) => trunks.push([x, top, bottom]);   /* a dead bough or a timber post under a ledge: drawn, not solid */

  // ---------------- 1. THE LANE OUT OF TOWN (x 0-93). Dusk. The farmers going home, the ditches, and the first vine. ----------------
  ground(0, 93);
  sign(2, G - 1, 'THE HEXED FIELDS. THE ARCHMAGE\'S RUNOFF IS IN THE DITCHES, AND THE FARMS HAVE GONE WRONG.');
  ent('check', 6, G - 1);
  ent('npc', 10, G - 1, { kind: 'shepherd', name: 'THE FARMER', lines: ['THREE OF MY EWES BOLTED INTO THE FIELDS WHEN THE SCARECROWS GOT UP.', 'ONE IN THE DEAD ORCHARD, ONE IN THE HOLLIS HOUSE, AND ONE WENT UP THE MILL.', 'BRING THEM HOME AND MY OLD LAMP IS YOURS. YOU WILL WANT A LIGHT OUT THERE.'] });
  ent('npc', 16, G - 1, { kind: 'hillfolk', name: 'A FARMHAND', lines: ['NOT ME. I AM GOING HOME, AND I AM BOLTING THE DOOR.', 'THE CLOUD COMES OVER THE MOON AND THE PLANKS OVER THE BOG ARE NOT THERE. I SAW IT.'] });
  sign(20, G - 1, 'IF IT GLOWS GREEN, YOU CAN USE IT. MOST OF THE REST OUT HERE WANTS YOU DEAD.');
  air(24, 26, G, G + 1); spikes(24, 26, G + 1);                    /* the first ditch: a hop, and the brambles in it */
  air(34, 37, G, G + 2); spikes(34, 37, G + 2);                    /* the second: brambles in the bottom */
  deco('scarePost', 42, G - 1);                                    /* the scarecrow that was on it is not on it */
  sign(45, G - 1, 'A SCARECROW ONLY MOVES WHILE YOUR BACK IS TO IT. KEEP YOUR EYES ON IT.');
  /* THE FIRST VINE: a hedge bank of bales across the lane too tall to jump, and a trough of runoff beside it. The vine is
     the way the lane teaches, but its leaf stands fifty-six pixels over the lane against a fifty-one pixel jump, and it
     does not carry a hero up: struck from the bud, it shoots up past him (measured, all five heroes stayed on the lane).
     So a half bale against the bank's face is the way for everyone: two rows up onto it, two rows up onto the bank, and
     a stair you can see from the sign. (The owner's playtest: most heroes stopped here.) */
  sign(49, G - 1, 'STRIKE THE TROUGH. THE RUNOFF GROWS A VINE, AND A VINE DOES NOT STAY UP LONG.');
  spill('trough', 51, G - 1, 'lane'); vine(53, G, 3, 'lane');
  block(57, 59, G - 4, G - 1); block(55, 56, G - 2, G - 1);
  coins([57, G - 6], [58, G - 6], [59, G - 6]);
  ent('check', 66, G - 1); ent('pumpkin', 79, G - 1, { face: -1 }); ent('crossbow', 92, G - 2, { face: -1 }); ent('hedgeknight', 88, G - 1, { face: -1 }); ent('wight', 30, G - 1); ent('rook', 47, G - 1, { face: -1 });   /* a patrol off the road inland, come out to see what walks the farms: a hedge knight where a goblin shield stood, and their crossbowman up on the bank where the goblins' bowman knelt - the same fight, a blade in front of a shooter up a step. And a lurker in the pumpkins by the stack, where a cutpurse was. The owner: "they should be knights, or haunted things". Nothing goblin is left in the fields */
  ent('scarecrow', 74, G - 1, { face: -1 });
  ent('rook', 82, G - 1, { face: -1 }); ent('runner', 86, G - 1, { face: -1 });   /* the hedge knight's squire: his shout fetches the sworn sword the garrison stands by the stack */
  deco('crookedFence', 84, G - 1);
  block(90, 93, G - 1, G - 1);                                     /* a bank up onto the orchard, a row at a time */
  coins([28, G - 2], [40, G - 2], [63, G - 2], [70, G - 2], [78, G - 2]);
  deco('deadCorn', 29, G - 1, { v: 1 }); deco('farmLantern', 39, G - 1); deco('leaningBarn', 72, G - 1); deco('crookedFence', 69, G - 1, { v: 1 }); deco('hayStack', 77, G - 1);

  // ---------------- 2. THE DEAD ORCHARD (x 94-195). Brambles on the floor, and the way over them is up the vines into the boughs. ----------------
  ground(94, 195, O);
  ent('check', 99, O - 1); deco('deadCorn', 96, O - 1, { v: 2 }); deco('brokenCart', 160, O - 1);
  sign(101, O - 1, 'THE DEAD ORCHARD. BRAMBLES ON THE FLOOR, SO GO UP: STRIKE THE SLUICE AND CLIMB THE VINES.');
  spill('sluice', 106, O - 1, 'orch');
  vine(110, O, 2, 'orch'); vine(113, O, 4, 'orch'); vine(116, O, 6, 'orch'); vine(119, O, 8, 'orch');
  spikes(112, 112, O - 1); spikes(115, 115, O - 1); spikes(118, 118, O - 1); spikes(122, 124, O - 1);   /* a staircase of four, two rows a step */
  /* THE BRAMBLE DITCH: twenty-three tiles of thorns across the orchard floor */
  air(128, 150, O, O + 2); spikes(128, 150, O + 2);
  /* THE BOUGHS over it: dead limbs a few tiles apart, and the apples still coming down off them on a beat */
  plat(121, 24, 7); plat(131, 23, 5); plat(139, 24, 5); plat(147, 23, 5);
  trunk(124, 25, O - 1); trunk(133, 24, O + 1); trunk(141, 25, O + 1); trunk(149, 24, O + 1);
  ent('rockfall', 137, 14, { every: 2.4, apple: true }); ent('rockfall', 145, 15, { every: 2.8, apple: true });
  sign(122, 23, 'THE APPLES FALL ON A BEAT. COUNT IT, THEN CROSS.');
  /* the high bough: a bucket on the limb, and the vine it grows is the only way up to it. Two rows, not four: a leaf four
     rows up could only be ridden from the bud, and the bucket is three tiles from the bud, so nobody but a long reach
     ever rode it. Two rows up is a jump onto the leaf from the limb and a jump off it onto the silver's bough */
  spill('bucket', 131, 22, 'bough'); vine(134, 23, 2, 'bough');
  plat(137, 18, 4); trunk(139, 19, 23); ent('silver', 138, 17);
  ent('stray', 150, 22, { kind: 'sheep' });
  coins([122, 22], [126, 22], [132, 21], [141, 23], [148, 22]);
  ent('check', 156, O - 1);
  ent('scarecrow', 183, O - 1, { face: -1 }); spikes(165, 166, O - 1);   /* brambles through the floor of the supper: something light thrown into them stays there */ ent('haunt', 190, O - 4, { face: -1 }); ent('crow', 135, 19, { face: -1 }); ent('crow', 151, 18, { face: -1 });
  /* THE ROOT CELLAR: a hatch in the orchard floor, and a ladder back up the far end of it */
  air(188, 189, O, O + 1); air(180, 194, O + 2, O + 6); air(181, 181, O, O + 1); net(181, O, O + 6);
  deco('pumpkinPatch', 186, O - 1); ent('haunt', 185, O + 3, { face: -1 });   /* a fork in the cellar's rafters: the farm's own haunt where a wood's spider hung */
  coins([183, O + 6], [185, O + 6], [187, O + 6], [190, O + 6], [192, O + 6]);
  coins([158, O - 2], [184, O - 2], [193, O - 2]);

  // ---------------- 3. THE MOONLIT PASTURE (x 196-290). Phantom planks over the sunken bog, and the cloud comes over the moon. ----------------
  ground(196, 207);
  ent('check', 200, G - 1); deco('crookedFence', 205, G - 1);
  sign(202, G - 1, 'MOONLIGHT HOLDS THE PHANTOM PLANKS. WHEN THE CLOUD\'S SHADOW COMES ACROSS, BE ON THE GRASS.');
  block(208, 282, 39, H - 1);                                      /* the bog's bed */
  /* THE TUSSOCKS: grass to wait out the dark on, every sixteen tiles, each with a ladder down its face out of the bog */
  for (const x of [220, 236, 252, 268]) block(x + 1, x + 2, G, 38);
  phantom(208, 220, G); phantom(223, 236, G); phantom(239, 252, G); phantom(255, 268, G); phantom(271, 282, G);
  sign(222, G - 1, 'STRIKE A WISP AND ITS LIGHT HOLDS THE PLANKS, EVEN UNDER THE CLOUD.');
  ent('marshlight', 229, 30); ent('marshlight', 246, 29); ent('marshlight', 262, 30); ent('marshlight', 214, 30); ent('marshlight', 274, 29);
  ent('crow', 232, 25, { face: -1 }); ent('crow', 236, 26, { face: -1 }); ent('crow', 258, 25, { face: -1 }); ent('crow', 262, 24, { face: -1 });   /* crows down the wind over the bog: a step, if you pogo them */
  ent('silver', 245, 37);
  ent('check', 253, G - 1);
  ent('farmhand', 277, G - 2, { face: -1 });
  ground(283, 334);
  deco('ghostCow', 292, G - 1); ent('rook', 286, G - 1, { face: -1 }); ent('pumpkin', 289, G - 1, { face: -1 });   /* a lurker in the pumpkins at the edge of the Ploughman's furrows, on the far bank (it was a heron: a marsh bird, not a haunted field's). A pumpkin and not a scarecrow: the stretch before the mini stays a breath (tools/pacing.mjs) */
  coins([212, G - 2], [216, G - 2], [227, G - 2], [232, G - 2], [243, G - 2], [248, G - 2], [259, G - 2], [264, G - 2], [275, G - 2], [279, G - 2]);

  // ---------------- THE FURROWS (x 291-331). The Headless Ploughman, and the hedge-bank gate he stands in front of. ----------------
  ent('check', 291, G - 1);
  sign(293, G - 1, 'THE PLOUGHMAN. RED: JUMP HIS PLOUGH. AT THE END OF THE FURROW IT STICKS: CUT HIM THEN.');
  ent('ploughman', 320, G - 1, { face: -1, mini: true });
  block(327, 331, G - 12, G - 1); air(327, 331, G - 6, G - 1); interiors.push([327, 331, G - 6, G - 1, 'earth']);
  for (let y = G - 6; y <= G - 1; y++) set(327, y, T.PORT);       /* the hedge gate: it lifts when he falls */

  // ---------------- 4. THE FARMHOUSE (x 332-401). Up through the house on its own floating furniture, and out of the chimney. ----------------
  ground(332, 462);
  deco('farmLantern', 334, G - 1); ent('check', 337, G - 1); deco('milkChurn', 339, G - 1);
  sign(335, G - 1, 'THE HOLLIS FARM. SOMETHING IN THERE MOVES THE FURNITURE. STAND ON IT AND IT CARRIES YOU UP.');
  block(340, 400, 11, G - 1);
  air(341, 399, 27, 33); air(341, 399, 20, 25); air(341, 399, 13, 18);   /* the kitchen, the bedrooms, the attic */
  air(340, 340, 30, 33);                                                  /* the front door */
  interiors.push([341, 399, 27, 33, 'kitchen'], [341, 399, 20, 25, 'hall'], [341, 399, 13, 18, 'hall']);
  /* THE KITCHEN: the family at home, and the table that goes up through the ceiling */
  deco('hearth', 346, G - 1); ent('check', 343, G - 1);
  ent('npc', 351, G - 1, { kind: 'ghostfarmer', name: 'OLD HOLLIS', lines: ['YOU CAN SEE ME. THEN YOU CAN SEE WHAT HIS WATER DID TO US.', 'THE TABLE WILL TAKE YOU UP. IT TAKES EVERYONE UP, THESE DAYS.'] });
  deco('portrait', 348, 27, { hang: true }); deco('portrait', 353, 27, { hang: true }); deco('candle', 363, G - 1); ent('haunt', 361, 30, { face: -1 });
  air(356, 359, 26, 26); ghost('table', 357, 33, 2, { vert: true, rise: 7, period: 5, ph: 0 });
  /* THE BEDROOMS: the floor fallen through, and the bed that goes back and forth over the hole */
  air(366, 376, 26, 26); ghost('bed', 364, 26, 3, { range: 10, speed: 30 });
  ent('farmhand', 346, 24, { face: 1 }); ent('wight', 368, G - 1); ent('bat', 349, 14); ent('bat', 372, 20);
  ent('boo', 390, 23, { face: -1 });   /* THE HALLWAY TO THE CHIMNEY: walked along, back to it, the whole length of the bedroom hall */
  ent('npc', 393, 25, { kind: 'ghostwife', name: 'MISTRESS HOLLIS', lines: ['MIND THE CHAIRS. THEY MEAN NO HARM. THE FORK IN THE ATTIC DOES.', 'THE MOON COMES AND GOES OUT IN THE PASTURE. SO DO WE.'] });
  air(386, 389, 19, 19); ghost('chair', 387, 25, 2, { vert: true, rise: 6, period: 5.5, ph: 0.5 });
  /* THE ATTIC: a hole in the boards, two chairs bobbing over it, and a fork that knows you are there */
  air(361, 371, 19, 19); ghost('chair', 362, 18, 2, { range: 8, speed: 24 }); ghost('table', 366, 15, 2, { bob: true, ph: 1.4 });
  ent('haunt', 378, 16, { face: -1 });
  ent('npc', 350, 18, { kind: 'ghostchild', name: 'LITTLE HOLLIS', lines: ['MY EWE CAME UP HERE. SHE IS FRIGHTENED OF THE FORK.', 'DADDY SAYS NOT TO GO UP THE CHIMNEY. EVERYBODY GOES UP THE CHIMNEY.'] });
  ent('stray', 382, 18, { kind: 'sheep' });
  deco('portrait', 385, 13, { hang: true });
  /* THE CHIMNEY: up the flue on its rungs, out over the roof, and down the ladder on the gable end */
  block(391, 394, 6, 10); air(392, 393, 6, 12); net(392, 6, 18);
  net(401, 11, 33);
  coins([349, 32], [361, 32], [370, 25], [379, 25], [396, 25], [356, 18], [375, 17], [396, 17], [396, 10], [398, 10]);

  // ---------------- 5. THE WINDMILL (x 402-462). The miller's store at its foot, the gears inside, and the sails outside. ----------------
  ent('check', 405, G - 1);
  sign(407, G - 1, 'THE MILLER\'S STORE. HE SOLD TO THE LIVING, AND HE IS NOT ONE OF THEM NOW.');
  block(416, 428, 14, G - 1); air(417, 427, 15, 33); air(416, 416, 30, 33);
  interiors.push([417, 427, 15, 33, 'stone']);
  sign(413, G - 1, 'UP THROUGH THE GEARS AND OUT ON THE SAILS. THE WIND AT THE TOP IS NOT YOUR FRIEND.');
  plat(420, 32, 4); plat(424, 30, 3); plat(418, 28, 4);
  for (let i = 0; i < 4; i++) moversExtra.push({ kind: 'wheel', gear: true, px: 422 * TS + 8, py: 24 * TS, r: 26, phase: i * Math.PI / 2, period: 9, x: 0, y: 0, w: 18, h: 6 });
  plat(424, 21, 4); plat(418, 19, 3);
  air(421, 421, 14, 14);
  ent('stray', 418, 13, { kind: 'sheep' }); ent('rook', 426, 13, { face: -1 });
  ent('boo', 423, 25, { face: 1 });   /* THE GEAR CLIMB: turn your back on it going up the mill's stairs and it closes the gap */
  /* THE SAILS: four torn arms turning slowly round a hub over the roof, from the roof to the top of the sky */
  for (let i = 0; i < 4; i++) moversExtra.push({ kind: 'wheel', torn: true, first: i === 0, px: 422 * TS + 8, py: 9 * TS, r: 56, phase: i * Math.PI / 2, period: 16, x: 0, y: 0, w: 22, h: 6 });
  gusts.push({ x0: 410 * TS, x1: 440 * TS, y0: 2 * TS, y1: 13 * TS, dir: 1, period: 6, on: 1.5, phase: 0, k: 0.5 });
  /* THE MILL STEPS: off the top of the sails and down the scaffold on the far side */
  plat(429, 8, 4); plat(435, 11, 4); plat(440, 14, 4); plat(445, 17, 4); plat(441, 20, 3); plat(446, 23, 4); plat(451, 26, 4); plat(455, 29, 4);
  for (const [x, r] of [[431, 8], [437, 11], [442, 14], [447, 17], [442, 20], [448, 23], [453, 26], [457, 29]]) trunk(x, r + 1, G - 1);
  ent('crow', 438, 5, { face: -1 }); ent('crow', 443, 6, { face: -1 }); ent('crow', 448, 5, { face: -1 });
  spikes(431, 453, G - 1); ent('pumpkin', 455, G - 1, { face: -1 });                                      /* a thorn bed under the steps: a fall off them is a fall into it. And a lurker in the pumpkins at their foot, where a feral goat stood */
  ent('bat', 420, 16); ent('bat', 425, 18);                        /* the mill's rafters. The fields' bats are the farm's dead ones: drawn pale, moon-blue and red-eyed (hauntedSet in src/redraw/fields_foes.js) */
  /* THE HIDDEN HAYLOFT: a line of ledges off the steps, to a hatch in the thickness of the barn's wall */
  plat(447, 13, 2); plat(451, 11, 3); plat(456, 10, 3); plat(460, 12, 3); trunk(452, 12, 16); trunk(457, 11, 16);
  coins([431, 7], [436, 10], [441, 13], [446, 16], [447, 22], [452, 25], [456, 28], [452, 10], [457, 9]);

  // ---------------- 6. THE THRESHING BARN (x 464-538). The machine wakes when you come in: climb, and keep going right. ----------------
  ent('check', 460, G - 1);
  sign(462, G - 1, 'THE THRESHING BARN. THE MACHINE IN THERE WAKES WHEN YOU COME IN. CLIMB, AND KEEP GOING RIGHT.');
  ground(463, 538); block(464, 538, 4, G - 1); air(468, 535, 9, 33); air(464, 467, 29, 33);
  air(464, 466, 10, 11); ent('silver', 465, 11);                  /* the hidden hayloft, in the thickness of the wall */
  interiors.push([468, 535, 9, 33, 'timber']);
  ent('thresher', 471, G - 1, { x1: 529, trigger: 474 });
  block(474, 475, 32, 33);                                         /* a bale to step up from */
  plat(478, 30, 4); plat(484, 28, 4); plat(490, 26, 4); plat(496, 24, 4);
  deco('hayStack', 484, G - 1); deco('plough', 496, G - 1); deco('hayStack', 507, G - 1, { v: 1 }); deco('milkChurn', 512, G - 1);
  ghost('bale', 501, 23, 2, { vert: true, rise: 5, period: 4.5 }); ent('check', 506, 17);
  plat(504, 18, 17);
  /* THE TWIST: a stack of bales across the top loft, and a bucket of runoff that shrinks them out of the way */
  spill('bucket', 507, 17, 'barn', { shrink: true }); shrinks.push({ x0: 512, x1: 514, y0: 14, y1: 17, group: 'barn' });
  sign(505, 17, 'THE RUNOFF SHRINKS WHAT IT DOES NOT GROW. KICK THE BUCKET AT THE BALES.');
  ent('haunt', 509, 12, { face: -1 });
  plat(522, 22, 4); plat(527, 26, 3); plat(530, 29, 4);
  for (const [x, r] of [[480, 30], [486, 28], [492, 26], [498, 24], [507, 18], [518, 18], [524, 22], [528, 26], [532, 29]]) trunk(x, r + 1, G - 1);
 ent('bat', 486, 10); ent('bat', 514, 10); ent('bat', 528, 11); ent('pumpkin', 518, G - 1); ent('pumpkin', 524, G - 1); ent('wight', 500, G - 1); ent('haunt', 492, 22, { face: -1 });   /* the barn's rafters */
  ent('boo', 500, 20, { face: -1 });   /* THE BARN: over the loft's climb, where the thresher already has your eyes on the floor */
  air(536, 538, 24, 27);                                           /* the hayloft door out onto the hill road */
  coins([479, 29], [485, 27], [491, 25], [497, 23], [506, 17], [510, 17], [517, 17], [523, 21], [531, 28]);

  // ---------------- 7. THE HAY CART RIDE (x 539-634). A ghost horse pulls the cart down the hill road; it drives through the fences. ----------------
  ground(539, 546, 28);
  ent('check', 541, 27);
  sign(543, 27, 'THE HAY CART GOES WHEN YOU GET ON. IT DRIVES THROUGH THE FENCES. YOU DO NOT: JUMP THEM.');
  block(547, 619, 39, H - 1);                                      /* the valley under the road */
  spikes(548, 557, 38); spikes(559, 570, 38); spikes(572, 583, 38); spikes(585, 593, 38); spikes(608, 608, 38); spikes(611, 612, 38); spikes(615, 616, 38); spikes(619, 619, 38);
  /* THE DOCK IS SOLID GROUND THROUGH COLUMN 546; THE CART DOCKS AT 547, THE FIRST COLUMN OF THE OPEN PIT.
     Docked three tiles further back (544, inside the solid block above) its wheels drew into the dirt the
     dock is made of and the ground itself always won the landing check, so P.onMover was never set and it
     never left the dock. Flush with the pit's edge, stepping off the dock's last solid tile is a landing
     onto the mover, the way every other boarding in this level works. */
  moversExtra.push({ kind: 'haycart', x0: 547 * TS, x1: 594 * TS, x: 547 * TS, y: 28 * TS, w: 48, h: 8, speed: 62, state: 'dock', t: 0 });
  for (const x of [558, 571, 584]) block(x, x, 27, 38);            /* the fence posts: a row over the cart's bed */
  ent('rook', 571, 26, { face: -1 });
  ground(595, 606, 28);
  ent('haunt', 600, 24, { face: -1 }); ent('hedgeknight', 633, 31, { face: -1 }); ent('crossbow', 629, 29, { face: -1 });   /* the road's patrol at the foot of the hill road: a hedge knight, and their crossbowman on the bank over him, where a goblin cutpurse and a goblin bowman stood. The same fight - a blade in front of a shooter up a step - with the road's own men */
  /* THE BROKEN ROAD: the bank has gone into the valley, and a bucket of runoff grows the way across */
  sign(598, 27, 'THE ROAD HAS GONE INTO THE VALLEY. KICK THE BUCKET AND WALK THE VINES OVER.');
  ent('check', 599, 27); spill('bucket', 603, 27, 'road'); vine(609, 39, 11, 'road'); vine(613, 39, 11, 'road'); vine(617, 39, 11, 'road');
  ground(620, 626, 28); ground(627, 630, 30); ground(631, 634, 32); deco('deadCorn', 621, 27);
  coins([549, 26], [555, 26], [562, 26], [575, 26], [588, 26], [609, 26], [613, 26], [617, 26]);

  // ---------------- 8. THE FAMILY PLOT (x 635-668). Everything at once: open graves under phantom planks, vines up the crypt, floating headstones. ----------------
  ground(635, 711);
  deco('farmLantern', 635, G - 1); ent('check', 637, G - 1);
  sign(638, G - 1, 'THE HOLLIS PLOT. THE ROAD TO THE TOWER GOES THROUGH THE FAMILY.');
  air(640, 644, G, G + 2); spikes(640, 644, G + 2); phantom(640, 644, G);
  air(647, 651, G, G + 2); spikes(647, 651, G + 2); phantom(647, 651, G);
  ent('marshlight', 646, 30); ent('farmhand', 632, 30, { face: 1 }); ent('pumpkin', 645, G - 1, { face: -1 });
  ent('boo', 650, 26, { face: 1 });   /* THE FAMILY PLOT: between the two graves, where a player's eyes go down to the phantom planks */
  spill('sluice', 652, G - 1, 'crypt'); vine(653, G, 2, 'crypt'); vine(655, G, 4, 'crypt'); vine(657, G, 6, 'crypt');
  block(659, 664, 28, G - 1);                                      /* the family crypt */
  block(666, 667, 24, G - 1);                                      /* the iron railing, too tall to jump */
  ghost('headstone', 663, 27, 2, { vert: true, rise: 4, period: 4.2 });
  plat(668, 29, 1);
  ent('check', 668, G - 1);
  coins([642, G - 2], [649, G - 2], [660, 27], [662, 27]);

  // ---------------- THE BURNING CORNFIELD (x 669-711). The Scarecrow King, on his bales, his poles and his scaffold. ----------------
  block(679, 680, 32, 33); block(690, 691, 32, 33); block(702, 703, 32, 33);   /* the bale stacks */
  plat(681, 30, 3); plat(677, 28, 3); plat(692, 30, 3); plat(688, 28, 3); plat(695, 28, 4); plat(691, 26, 4); plat(698, 24, 4); plat(699, 31, 3); plat(682, 26, 3);   /* the cornfield scaffold */
  for (const [x, r] of [[682, 30], [678, 28], [693, 30], [689, 28], [697, 28], [692, 26], [700, 24], [700, 30], [683, 26]]) trunk(x, r + 1, G - 1);
  for (const x of [675, 686, 707]) ent('croppole', x, G - 1);
  spill('trough', 672, G - 1, 'kingL', { arena: true }); vine(684, G, 3, 'kingL');
  spill('trough', 709, G - 1, 'kingR', { arena: true }); vine(697, G, 3, 'kingR');
  ent('strawking', 694, G - 1, { face: -1 });
  block(711, W - 1, 0, G - 1);

  /* THE LADDERS, LAST: nothing is dug or laid after this line */
  net(421, 14, 18);                                                /* the windmill's roof hatch */
  for (const x of [220, 236, 252, 268]) net(x, G + 1, 38);        /* up out of the bog at every tussock */
  net(208, G + 1, 38); net(282, G + 1, 38);
  net(547, 30, 38); net(607, 30, 38);                              /* up out of the valley at both ends of the ride */
  net(665, 28, 33);                                                /* BEHIND THE FAMILY CRYPT: the slot between it and the railing */
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  pools.push({ x0: 208 * TS, x1: 283 * TS, y: 36 * TS + 8, bottom: 39 * TS, swim: true, clear: true, harm: true, foulCol: '#2e3a30', wash: 0.55, bog: true });
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: G - 1 }, pools, falls: [], moversExtra, interiors, gusts,
    music: 'fields', duskStart: 99999, duskLen: 1, night: true, nightA: 0.16, edgeLit: true,
    fields: { moon: { lit: 7, warn: 2.8, dark: 3.4, first: 9 }, phantoms, shrinks, trunks, dusk: [30, 150], crypt: [659, 28],
      skins: [[340, 400, 11, 12, 'thatch'], [391, 394, 6, 10, 'stone'], [340, 400, 13, 33, 'timber'], [416, 428, 14, 33, 'stone'], [464, 538, 4, 8, 'thatch'], [464, 538, 9, 35, 'timber'], [666, 667, 24, 33, 'stone'], [327, 331, 22, 33, 'thatch'], [679, 680, 32, 33, 'bale'], [690, 691, 32, 33, 'bale'], [702, 703, 32, 33, 'bale'], [474, 475, 32, 33, 'bale'], [57, 59, 30, 33, 'bale'], [55, 56, 32, 33, 'bale']] },
    quest: { n: 3, item: 'sheep', name: 'THE LOST EWES', npc: 'shepherd', done: 'THE EWES ARE HOME', reward: 'relic', relic: 'lamp' },
    palette: { sky: [[40, 48, 96], [104, 120, 164]], far: 'fields', mid: 'fields', near: 'fields', dress: 'village', haze: 'rgba(130,150,210,0.10)',
      grass: '#7a946e', grassL: '#a4bc8e', grassD: '#4a6048', dirt: '#5e5444', dirtL: '#7a6c54', dirtD: '#3c3428', canopy: ['#161a2a', '#1e2436', '#262e44', '#303a52'] },
    weather: [{ x0: 0, x1: 99999, kind: 'leaves' }],
    ambient: [{ x0: 0, x1: 340 * TS, kind: 'wind' }, { x0: 340 * TS, x1: 402 * TS, kind: 'hall' }, { x0: 402 * TS, x1: 464 * TS, kind: 'wind' }, { x0: 464 * TS, x1: 539 * TS, kind: 'hold' }, { x0: 539 * TS, x1: 99999, kind: 'wind' }],
    mini: { x0: 296 * TS, x1: 327 * TS, floor: G * TS, y0: (G - 10) * TS, y1: (G + 1) * TS, trigger: 300 * TS, wallL: 295, gate: 327, boss: 'ploughman', name: 'THE HEADLESS PLOUGHMAN' },
    ambushes: [{ name: 'THE PICKERS\' SUPPER', row: O - 1, wallL: 152, wallR: 178, check: [151, O - 1], waves: [[['scarecrow', 158], ['scarecrow', 174], ['pumpkin', 163], ['pumpkin', 170]], [['farmhand', 160, O - 3], ['swornsword', 167], ['pumpkin', 176], ['hedgeknight', 171]]] }],   /* wave two, the road's patrol walking in on the supper: a sworn sword that plants, a hedge knight to BREAK (poise-heavy, where the hounds were), a pumpkin light enough to throw into the brambles, and the ghost through the wall */
    calm: [[0, 22, 0, 43], [52, 68, 24, 43], [104, 156, 12, 33], [186, 198, 26, 43], [206, 285, 26, 43], [336, 404, 0, 43], [410, 460, 0, 43], [462, 540, 0, 33], [539, 634, 18, 43], [636, 668, 20, 43]],   /* no garrison on the lane's first steps, the planks, the roofs, the ride, or the graves */
    arena: { x0: 670 * TS, x1: 710 * TS, floor: G * TS, y0: 8 * TS, trigger: 675 * TS, wallL: 669, wallR: 710, boss: 'strawking', music: 'scarecrowking', tint: '#3a1a10', tintA: 0.1, fx: 'embers', poles: [675, 686, 707] },
  };
}

// ============================================================================================
// THE MAGE'S FOLLY - the Archmage's tower and its walled grounds on the hill over THE HEXED FIELDS.
//
// THE ROOM IS THE SPELL, NOT THE DRINKER. The tower rewrites what is round you and leaves you as you are: stacks that
// slide when their rune is struck, books that fly, a brass sky that turns, counterweights on chains, and a corridor
// where the floor and the ceiling have changed places. Nothing here asks the hero to be something else, so every
// crossing is walked, jumped, climbed or struck by all six of them.
// THE GRAVITY IS THE TOWER'S OWN. A GLYPH on the floor (or on the ceiling) turns the room over on contact - P.flip,
// and the ceiling is where you stand. It was never a potion: it is the room's rule, and it is the rule the Archmage
// borrows for the third beat of his middle stage.
// SIX SECTIONS: the overgrown grounds (the hedge maze, and over the barred gatehouse by its wall walk), the library
// (the runes that slide the stacks, the flying books, the hung galleries across the hall; the Homunculus at the end
// of it), the alchemy lab (vats and spitters, the trapdoor down into the wine cellar and the rope back, the
// counterweight and the grating), the orrery (up the turning planets, and the hung arms over the drop), the
// upside-down floor (the glyphs turn the room over), and the observatory (all three verbs again, then the boss).
// A runeshelf is built in its SLID position so the tools can walk it, and the game puts it down at load; a LANE is
// footing for the reach model only, where a turned-over hero walks the ceiling. The ceiling turrets are hung by the
// game (mage.hung).
// ============================================================================================
function theMagesFolly() {
  const W = 712, H = 48, G = 40, F = 16;                        /* G: the ground floor row; F: the floor of the upper tower */
  const L = painter(W, H);
  const { block, plat, ent, coins, set, spikes } = L;
  const moversExtra = [], interiors = [], nets = [], pools = [], shelves = [], skins = [], hedges = [], chains = [];
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const net = (x, y0, y1) => nets.push([x, y0, y1]);   /* EVERY LADDER IS HUNG LAST (rule I) */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const deco = (kind, x, y, o) => ent('deco', x, y, Object.assign({ kind }, o || {}));
  const ground = (x0, x1, top = G) => block(x0, x1, top, H - 1);
  /* THE COUNTERWEIGHT: a brass weight on a chain. Strike it and it falls, and the grating it is chained to runs up
     and stays up a little after - long enough to get under it if you came at it running */
  const weight = (x, y, gate) => ent('gplate', x, y, { gate });
  /* A RUNESHELF: a stack that slides UP into its recess when its rune is struck. Built slid (open); at load the stack is
     down (yDown: the row its top is at when down; yUp: when up; h rows tall) */
  const runeshelf = (x0, x1, yDown, yUp, h) => { for (let y = yUp; y < yUp + h; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); for (let y = yDown; y < yDown + h; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); shelves.push({ x0, x1, yDown, yUp, h }); ent('rune', x0, yDown + h - 1, { shelf: shelves.length - 1 }); };
  /* A FLYING BOOK: a platform that patrols between x0 and x1 at row y */
  const book = (x0, x1, y, o) => moversExtra.push(Object.assign({ kind: 'book', mage: true, x0: x0 * TS, x1: x1 * TS, x: x0 * TS, y: y * TS, w: 26, h: 6, speed: 44, dir: 1, ph: 0 }, o || {}));
  /* A LANE THE MODEL WALKS UPSIDE DOWN: no body in the game, only the reach fill's footing where a turned-over hero
     walks the ceiling. (m.x0/x1/y is what src/reachcore.js reads as a ride band.) */
  const lane = (x0, x1, y, what) => moversExtra.push({ kind: 'lane', mage: true, what, x0: x0 * TS, x1: x1 * TS, x: x0 * TS, y: y * TS, w: 16, h: 2 });
  const planet = (px, py, r, period, n) => { for (let i = 0; i < n; i++) moversExtra.push({ kind: 'wheel', planet: true, mage: true, first: i === 0, px: px * TS + 8, py: py * TS, r, phase: i * Math.PI * 2 / n, period, x: 0, y: 0, w: 22, h: 6, world: (px * 7 + i) % 4 }); };
  const chain = (x, top, bot) => chains.push([x, top, bot]);   /* a chain from the ceiling to a hung shelf: drawn, not solid */
  const hedge = (x0, x1, y0, y1) => { block(x0, x1, y0, y1); hedges.push([x0, x1, y0, y1]); };
  const wall = (x0, x1, y0, y1, kind) => { block(x0, x1, y0, y1); skins.push([x0, x1, y0, y1, kind]); };

  // ---------------- 1. THE OVERGROWN GROUNDS (x 0-117). Night on the hill: the hedge maze, the topiary, and the gate. ----------------
  ground(0, 700);
  sign(2, G - 1, 'THE MAGE\'S FOLLY. HIS SPILLS RUINED THE FARMS BELOW. WHAT GOT LOOSE UP HERE IS WORSE.');
  ent('check', 6, G - 1);
  ent('npc', 10, G - 1, { kind: 'apprentice', name: 'THE APPRENTICE', lines: ['I RAN. HE TURNED THE BUTLER INTO A CHAIR AND THE CHAIR INTO A DOG.', 'THREE LENSES CAME OUT OF THE GREAT TELESCOPE WHEN THE ROOM WENT OVER. ONE IN THE HEDGES, ONE IN THE STACKS, ONE UP THE ORRERY.', 'BRING THEM AND HIS CLOAK IS YOURS. HE WILL NOT WANT IT WHERE HE IS GOING.'] });
  sign(14, G - 1, 'NOTHING UP HERE STAYS WHERE HE PUT IT. STRIKE WHAT GLOWS, AND WATCH THE FLOOR.');
  /* THE HEDGE MAZE: low hedges to walk the tops of, tall ones to go under, and the topiary standing in the lanes */
  hedge(18, 19, G - 2, G - 1);
  hedge(22, 30, G - 4, G - 1); air(25, 26, G - 2, G - 1);           /* the first tall hedge: an arch cut through it at the foot */
  deco('topiaryUrn', 20, G - 1); ent('topiary', 31, G - 1, { face: -1 });
  hedge(34, 35, G - 2, G - 1); hedge(38, 39, G - 2, G - 1); hedge(42, 43, G - 2, G - 1);
  coins([34, G - 4], [38, G - 4], [42, G - 4]);
  ent('topiary', 40, G - 1, { face: -1 }); ent('imp', 44, G - 6, { face: -1 }); ent('imp', 60, G - 6, { face: -1 });   /* a beast between the low hedges, and an imp that got as far as the garden */
  ent('broom', 37, G - 1, { face: -1 });
  sign(45, G - 1, 'THE TOPIARY ONLY LOOKS LIKE A HEDGE. IT SHIVERS BEFORE IT MOVES: THAT IS YOUR WARNING.');
  /* THE TOPIARY LAWN: a crowd in the open, told before they wake */
  ent('check', 47, G - 1);
  ent('topiary', 52, G - 1, { face: -1 }); ent('topiary', 57, G - 1, { face: -1 }); ent('topiary', 62, G - 1, { face: 1 });
  deco('sundial', 55, G - 1); deco('topiaryUrn', 60, G - 1);
  coins([50, G - 2], [54, G - 3], [59, G - 2]);
  /* THE WALL HEDGE: over it by two steps, along its top where a beast waits with no room to swing, and down the far side */
  hedge(66, 66, G - 2, G - 1); hedge(67, 76, G - 4, G - 1);
  ent('topiary', 74, G - 5, { face: -1 });
  coins([69, G - 6], [71, G - 6], [75, G - 6]);
  ent('stray', 76, G - 5, { kind: 'lens' });                       /* the lens in the hedges: on the far end of the wall hedge, past the beast */
  ent('check', 79, G - 1);
  /* THE GATEKEEPER'S STALL: the last built thing before the gate, and it is as empty as the tower */
  deco('stall', 84, G - 1); sign(82, G - 1, 'THE GATEKEEPER\'S STALL. HE LEFT WHEN THE HEDGES STARTED WALKING.');
  ent('broom', 92, G - 1, { face: -1 }); ent('broom', 95, G - 1, { face: -1 });
  /* THE BARRED GATE: the gatehouse is shut and stays shut. The garden wall beside it is not, and the gatehouse has a
     breach at the height of its wall walk: three steps up the buttress, straight through, and a rope down the far side */
  sign(96, G - 1, 'THE GATE IS BARRED AND WILL STAY BARRED. THE WALL BESIDE IT IS BROKEN: GO OVER.');
  wall(102, 108, G - 16, G - 1, 'gate');                             /* the gatehouse: sixteen rows of wall */
  air(102, 108, G - 9, G - 7);                                       /* THE BREACH, at the wall walk's height: three rows, walked straight through */
  block(96, 97, G - 2, G - 1); block(98, 99, G - 4, G - 1); block(100, 101, G - 6, G - 1);   /* the fallen buttress: two rows a step (rule E4) */
  ent('check', 114, G - 1);
  ent('imp', 112, G - 5, { face: -1 }); ent('topiary', 117, G - 1, { face: -1 });   /* an imp over the lamp, waiting for whoever comes down the rope, and the last hedge beast at the tower door */
  coins([97, G - 3], [99, G - 5], [104, G - 8], [106, G - 8]);
  deco('ivyWall', 100, G - 1); deco('lamppost', 116, G - 1);

  // ---------------- 2. THE LIBRARY (x 118-262). The runes slide the stacks, the books fly, and the bat is taught from the rafters. ----------------
  wall(118, 262, 6, G - 1, 'tower');
  air(120, 261, 14, G - 1); air(118, 119, 36, G - 1);              /* the hall, and the front door */
  interiors.push([120, 261, 14, G - 1, 'library']);
  ent('check', 123, G - 1); deco('lectern', 125, G - 1);
  sign(121, G - 1, 'THE LIBRARY. STRIKE THE RUNE ON A STACK AND THE STACK SLIDES. THE BOOKS FLY: RIDE THEM.');
  /* THE STACKS: two runeshelves in the way, built slid (the recess above holds them in the grid), down at load */
  block(127, 128, G - 2, G - 1); block(131, 132, G - 4, G - 1);     /* shelves to climb, two rows a step */
  coins([128, G - 4], [132, G - 6]);
  runeshelf(134, 135, G - 6, G - 12, 6);                             /* the first: six rows of books across the floor; the rune lifts them into the recess */
  ent('armour', 140, G - 1, { face: -1 }); ent('broom', 128, G - 5, { face: -1 });
  deco('bookpile', 138, G - 1); deco('candelabra', 143, G - 1);
  /* THE ARCHIVE SHAFT: the floor is gone, the books cross it, and the familiar's nest is at the bottom of it */
  air(146, 156, G, G + 6);
  book(145, 156, G - 4); book(147, 156, G - 2, { ph: 3, dir: -1 });
  lane(145, 157, G - 1, 'book');
  ent('imp', 151, G + 6, { face: -1 }); deco('nest', 149, G + 6); ent('mend', 148, G + 5); ent('spider', 154, G + 6);   /* THE FAMILIAR'S NEST: the heart it left, and what has moved in since */
  ent('bat', 140, 20); ent('bat', 152, 19); ent('bat', 165, 21);   /* the rafters */
  runeshelf(159, 160, G - 6, G - 12, 6);                             /* the second stack, on the far side of the shaft */
  ent('check', 163, G - 1);
  /* THE GALLERY: up the shelves to the reading gallery, and the violet font on it */
  block(166, 167, G - 2, G - 1); block(168, 169, G - 4, G - 1); block(170, 172, G - 6, G - 1); plat(174, G - 8, 3);
  plat(178, G - 10, 10); block(178, 187, G - 9, G - 9);              /* the gallery: a shelf of stone under the boards */
  chain(179, 14, G - 10); chain(186, 14, G - 10);
  sign(179, G - 11, 'THE HALL IS CROSSED ON WHAT HANGS OVER IT. MIND THE FLOOR: IT IS A LONG WAY DOWN.');
  ent('check', 185, G - 11);
  /* THE CROSSING: from the gallery's end to the far gallery on three shelves hung from the rafters, with a book flying
     the middle of it for whoever would rather ride than jump. Every gap is a plain jump; the floor a long way under is
     full of armour */
  plat(190, G - 11, 3); chain(190, 14, G - 11); chain(192, 14, G - 11);
  plat(196, G - 12, 3); chain(196, 14, G - 12); chain(198, 14, G - 12);
  plat(202, G - 11, 3); chain(202, 14, G - 11); chain(204, 14, G - 11);
  book(193, 201, G - 15, { ph: 1 });
  plat(206, G - 10, 8); block(206, 213, G - 9, G - 9); chain(207, 14, G - 10); chain(212, 14, G - 10);
  coins([191, G - 13], [197, G - 14], [203, G - 13], [211, G - 12], [212, G - 12], [213, G - 12]);
  ent('stray', 190, 16, { kind: 'lens' }); plat(189, 17, 3);        /* the lens in the stacks: on a rafter ledge, up a rope from the gallery's end (or a bat that lets go of the roof) */
  /* THE FLOOR UNDER IT: one armour and its broom, and a haunt at the far gallery's foot. It had two armours, a broom, a haunt and
     an imp over them, with the roof's turret and bat in the same twenty columns: a fall off a shelf landed in nine */
  ent('armour', 196, G - 1, { face: -1 }); ent('broom', 201, G - 1, { face: 1 }); ent('haunt', 205, G - 6, { face: -1 }); ent('bat', 196, 18); ent('imp', 168, G - 9, { face: 1 });
  deco('bookpile', 189, G - 1); deco('globe', 204, G - 1); deco('candelabra', 198, G - 1);
  coins([176, G - 10], [180, G - 12], [184, G - 12], [193, G - 2], [201, G - 2], [208, G - 12]);
  /* THE READING ROOM (the ambush): a quiet room of tables until it shuts */
  ent('check', 216, G - 1); deco('longTable', 222, G - 1); deco('longTable', 230, G - 1, { v: 1 }); deco('candelabra', 226, G - 1);
  /* THE HOMUNCULUS'S CELL: the mini, behind a stone wall, and the gate into the lab lifts when he falls */
  ent('check', 237, G - 1);
  sign(235, G - 1, 'THE THING NEXT DOOR THROWS WHAT IS ON ITS SHELVES. IT PANTS AFTER A TRICK: CUT IT THEN.');
  ent('homunculus', 254, G - 1, { face: -1, mini: true });
  for (let y = G - 6; y <= G - 1; y++) set(262, y, T.PORT);         /* the lab door: it lifts when he falls */
  coins([244, G - 2], [258, G - 2]);

  // ---------------- 3. THE ALCHEMY LAB (x 263-380). Vats, spitters, down through the rotten boards to the cellar, and back up its rope. ----------------
  wall(263, 380, 10, G - 1, 'tower');
  air(263, 379, 22, G - 1);
  interiors.push([263, 379, 22, G - 1, 'lab']);
  ent('check', 266, G - 1); deco('cauldron', 269, G - 1);
  sign(268, G - 1, 'THE ALCHEMY LAB. THE VATS BURN. A SPITTER BUBBLES FIRST: THE SHIELD TURNS ITS GOB.');
  /* THE VATS: acid set into the floor, and a spitter on the rim of each. Every vat is crossed on something standing in it,
     never on a jump the slowest legs in the game only just make (the paladin's running jump is 3.6 tiles, the Warden's 4) */
  air(273, 276, G, G + 3); pools.push({ x0: 273 * TS, x1: 277 * TS, y: G * TS + 6, bottom: (G + 3) * TS, swim: true, clear: true, harm: true, foulCol: '#4a1e6a', wash: 0.5, acid: true });
  block(274, 275, G - 2, G + 3);   /* THE STILL'S FIREBOX, standing up out of the first vat: a one-tile hop up onto it, two rows, and one off */
  ent('vatspit', 278, G - 1);
  air(283, 290, G, G + 3); pools.push({ x0: 283 * TS, x1: 291 * TS, y: G * TS + 6, bottom: (G + 3) * TS, swim: true, clear: true, harm: true, foulCol: '#4a1e6a', wash: 0.5, acid: true });
  block(284, 285, G - 2, G + 3);   /* the second vat's firebox, a tile out from the rim */
  plat(288, G - 2, 2); chain(288, 22, G - 2); chain(289, 22, G - 2); /* a retort shelf hung over the far half of the vat, level with the firebox: two tiles across to it, one tile off it onto the floor */
  ent('vatspit', 281, G - 1); ent('vatspit', 292, G - 1);
  coins([274, G - 4], [287, G - 4], [289, G - 3]);
  /* THE BENCH: jars, and the imps that were in them */
  ent('check', 295, G - 1);
  deco('bench', 299, G - 1); deco('jars', 304, G - 1); deco('retorts', 310, G - 1);
  ent('imp', 301, G - 1, { face: -1 }); ent('mimic', 307, G - 1); ent('armour', 317, G - 1, { face: -1 }); ent('haunt', 296, G - 6, { face: -1 }); ent('bat', 310, 24); ent('imp', 280, G - 6, { face: -1 });   /* a cleaver nobody is holding, and what roosts in the pipes. One imp out of the jars, not two, and no brooms: the bench is the mimic's, and the vats behind it are enough to be going on with */
  /* THE ROTTEN BOARDS: the floor over the cellar gave way years ago and was never mended. Press down and go through */
  sign(319, G - 1, 'THE BOARDS OVER THE WINE CELLAR ARE ROTTEN. PRESS DOWN ON THEM AND GO THROUGH.');
  ent('check', 325, G - 1);
  air(328, 331, G, G + 1); plat(328, G, 4);                          /* one-way board: a way DOWN, and the cellar rope is the way back */
  /* THE WINE CELLAR, under the cracked floor: racks, a silver, the brass key, and the way out of it is small */
  air(306, 334, G + 2, G + 6);
  deco('wineRack', 310, G + 6); deco('wineRack', 318, G + 6, { v: 1 }); deco('wineRack', 326, G + 6);
  ent('silver', 308, G + 5); ent('key', 331, G + 6, { kind: 'brass' });
  ent('mimic', 322, G + 6); ent('spider', 314, G + 6); ent('bat', 330, G + 3);
  sign(330, G + 6, 'THE WAY BACK UP IS THE CELLAR ROPE, AT THE FAR END PAST THE RACKS.');
  air(333, 334, G, G + 1);                                           /* the cellar's shaft up into the still room's floor: the rope is hung in it last */
  coins([312, G + 4], [316, G + 4], [320, G + 4], [324, G + 4], [328, G + 4]);
  /* THE STILL ROOM: the counterweight that opens the grating, struck and then run for */
  ent('check', 346, G - 1);
  sign(348, G - 1, 'STRIKE THE COUNTERWEIGHT AND THE GRATING RUNS UP. IT STAYS UP A LITTLE AFTER: RUN.');
  weight(356, G - 1, 363);
  ent('armour', 351, G - 1, { face: 1 });   /* one of the orrery floor's armours, moved down to stand at the counterweight: the run to the grating stays clear */
  ent('haunt', 360, G - 6, { face: -1 }); ent('broom', 342, G - 4, { face: 1 });   /* a haunt in the still's steam over the grating's side, and a broom at the still room's door */
  for (let y = G - 4; y <= G - 1; y++) set(363, y, T.PORT);         /* the grating */
  deco('still', 359, G - 1);
  ent('check', 370, G - 1);
  ent('turret', 375, G - 3); block(374, 376, G - 2, G - 1);          /* a turret on a plinth, covering the lab door */
  deco('jars', 372, G - 1, { v: 1 });
  air(378, 380, 36, G - 1);                                        /* the door into the orrery */
  coins([353, G - 2], [365, G - 2], [369, G - 2]);

  // ---------------- 4. THE ORRERY (x 381-500). A brass sky turns under the dome; ride the planets up, and the bat over the drop. ----------------
  wall(381, 500, 0, G - 1, 'tower');
  air(383, 498, 6, G - 1); air(381, 382, 36, G - 1);               /* the chamber, and its door from the lab */
  interiors.push([383, 498, 6, G - 1, 'orrery']);
  ent('check', 386, G - 1); deco('orreryBase', 420, G - 1);
  ent('broom', 390, G - 4, { face: 1 });                             /* one of the three brooms the elite's floor had, sweeping the door instead */
  sign(388, G - 1, 'THE ORRERY. THE PLANETS TURN ON THEIR ARMS. RIDE THEM UP: THE DOOR OUT IS AT THE TOP.');
  /* THE FLOOR: the base of the great model, and what guards it */
  /* THE GILDED ARMOUR HAS THE FLOOR TO ITSELF. It stood shoulder to shoulder with three more armours, three brooms and a turret
     in one screen (882 health): the elite is a fight, and a fight needs the room to back off in. An imp at the door, the
     turret on its ring, a haunt, and the plain armour at the far end where the planets start */
  ent('imp', 394, G - 1, { face: -1 }); ent('armour', 408, G - 1, { face: -1 }); ent('armour', 434, G - 1, { face: -1 }); ent('haunt', 420, G - 7, { face: -1 }); ent('bat', 452, 10); ent('bat', 440, 12);
  plat(400, G - 6, 3); chain(400, 6, G - 6); chain(402, 6, G - 6); ent('turret', 401, G - 7);   /* a turret on a hung brass ring */
  coins([394, G - 2], [404, G - 8], [412, G - 2], [424, G - 2]);
  /* THE PLANETS: three hubs, each carrying two worlds round; a step up to the first, and a brass ledge under each hub's low point */
  block(440, 441, G - 2, G - 1);
  spikes(442, 468, G - 1);                                         /* THE GLASS: the floor under the planets is broken glass. Ride, or bleed */
  planet(444, 33, 52, 10, 2);
  plat(447, 28, 5); ent('check', 449, 27);
  planet(454, 24, 60, 12, 2);
  plat(458, 19, 5); ent('check', 460, 18);
  planet(465, 15, 56, 10, 2);
  plat(469, 11, 6); block(469, 474, 12, 12);                         /* the balcony */
  ent('check', 471, 10);
  ent('haunt', 474, 8, { face: -1 });                                /* a haunt under the dome at the balcony's end, over the brackets */
  ent('stray', 466, 8, { kind: 'lens' }); plat(465, 9, 3);         /* the lens up the orrery: on a bracket over the far planet's arc */
  ent('broom', 450, 14, { face: -1 }); ent('broom', 462, 24, { face: 1 });
  coins([445, 26], [448, 27], [456, 17], [460, 18], [466, 5], [472, 10]);
  /* THE DROP: the balcony ends and the pit under it is spiked. Two brass brackets hang off the dome over it, a jump
     apart, so the walk to the door is three steps with the glass a long way under them */
  sign(470, 10, 'THE ARMS DO NOT REACH THE DOOR. THE BRACKETS DO: THREE STEPS, AND MIND WHAT IS UNDER THEM.');
  air(475, 488, 12, 44); spikes(475, 488, 44); block(475, 488, 45, H - 1);
  plat(478, 11, 3); chain(478, 6, 11); chain(480, 6, 11);
  plat(483, 11, 3); chain(483, 6, 11); chain(485, 6, 11);
  plat(489, 11, 8); block(489, 496, 12, 12);
  ent('check', 493, 10);
  coins([479, 10], [484, 10]);
  air(497, 500, 8, 11);                                            /* the door out at the top */
  /* THE LOCKED STUDY: at the foot of the drop's far side, under a slab; the brass key from the cellar opens it, and a rope brings you back up */
  block(489, 493, 33, 33); block(494, 494, 33, 35); for (let y = G - 4; y <= G - 1; y++) set(494, y, T.PORT); ent('lockgate', 494, G - 1, { needs: 'brass', h: 4 });
  deco('desk', 490, G - 1); deco('bookpile', 492, G - 1, { v: 1 }); ent('silver', 491, G - 4); ent('mimic', 497, G - 1); coins([490, G - 3], [492, G - 3]);
  net(498, 12, G - 1);

  // ---------------- 5. THE UPSIDE-DOWN FLOOR (x 501-590). A spell gone wrong: the glyphs turn the room over, and the ceiling is a floor. ----------------
  wall(501, 590, 0, H - 1, 'tower');
  air(501, 590, 6, F - 1);                                          /* the corridor: floor F, ceiling row 5 */
  interiors.push([501, 590, 6, F - 1, 'flip']);
  ent('check', 503, F - 1);
  sign(505, F - 1, 'THE ROOM WENT OVER. STEP ON A GLYPH AND YOU GO WITH IT: THE CEILING IS YOUR FLOOR.');
  ent('glyph', 511, F - 1);
  /* taught: the floor drops away, the ceiling carries you over it, and a hung block is a step */
  air(516, 530, F, 44); spikes(516, 530, 44);
  block(521, 523, 6, 6);                                           /* a block hanging from the ceiling: a step, upside down */
  lane(509, 548, F - 1, 'flip');
  ent('glyph', 546, 6, { ceiling: true });
  coins([514, 7], [519, 7], [526, 7], [533, 7], [540, 7]);
  ent('check', 549, F - 1);
  /* tested: over again, a turret on the ceiling, a gap in the ceiling to jump, and back */
  sign(551, F - 1, 'AGAIN, AND LONGER. MIND THE TURRET: IT IS THE RIGHT WAY UP FOR ONCE.');
  ent('glyph', 555, F - 1);
  air(560, 580, F, 44); spikes(560, 580, 44);
  air(565, 569, 4, 5);                                             /* a notch in the ceiling: a flipped hero jumps it, or falls up into it and jumps out (two rows: never a trap) */
  lane(553, 586, F - 1, 'flip');
  ent('glyph', 584, 6, { ceiling: true });
  coins([558, 7], [563, 7], [571, 7], [578, 7]);
  ent('check', 587, F - 1);
  /* THE ROOF LEADS: a rope from the corridor up through the ceiling onto the leads outside, where the wind is and a silver was left */
  air(500, 506, 0, 4); air(507, 526, 0, 3); block(507, 526, 4, 5);
  ent('silver', 524, 3); deco('chimneypot', 512, 3); deco('chimneypot', 519, 3, { v: 1 }); ent('crow', 510, 1, { face: -1 }); ent('crow', 517, 0, { face: -1 });   /* the roof's own crows */
  coins([509, 2], [514, 2], [521, 2]);

  // ---------------- 6. THE OBSERVATORY (x 591-655). All three at once under the dome, and the Archmage past the last door. ----------------
  wall(591, W - 1, 0, H - 1, 'tower');
  air(593, 700, 2, F - 1); air(590, 592, 12, F - 1);              /* the dome, and the way in from the corridor */
  interiors.push([593, 700, 2, F - 1, 'dome']);
  ent('check', 595, F - 1); deco('telescope', 604, F - 1);
  ent('imp', 603, F - 6, { face: -1 }); ent('armour', 600, F - 1, { face: -1 });   /* one of the bench's imps, got as far as the telescope, and an armour set to watch it */
  sign(597, F - 1, 'THE OBSERVATORY. HIS DOOR IS AT THE END, PAST A CLIMB, A CROSSING AND THE LAST WEIGHT.');
  /* THE CLIMB: the stacks he shifted to get at the telescope make a stair over the standing grating */
  block(605, 606, F - 2, F - 1); block(607, 608, F - 4, F - 1); block(609, 610, F - 6, F - 1);
  coins([606, F - 3], [608, F - 5], [610, F - 7]);
  /* THE CROSSING: the floor is gone under the great telescope's pit, and three brackets hang over it off the dome */
  ent('check', 613, F - 1);
  air(617, 630, F, 24); spikes(617, 630, 24);
  plat(619, F - 1, 3); chain(619, 3, F - 1); chain(621, 3, F - 1);
  plat(624, F - 2, 3); chain(624, 3, F - 2); chain(626, 3, F - 2);
  plat(628, F - 1, 3); chain(628, 3, F - 1); chain(630, 3, F - 1);
  /* THE LAST WEIGHT: strike it and run the grating before it comes down again */
  ent('check', 636, F - 1);
  weight(642, F - 1, 649);
  for (let y = F - 4; y <= F - 1; y++) set(649, y, T.PORT);
  ent('check', 654, F - 1); ent('broom', 634, F - 4, { face: -1 });   /* a broom off the crossing's last bracket, clear of the grating run */
  ent('imp', 645, F - 1, { face: -1 }); ent('broom', 598, F - 4, { face: -1 }); ent('bat', 630, 3);
  ent('haunt', 601, F - 9, { face: -1 }); ent('armour', 639, F - 1, { face: 1 });   /* a haunt up in the telescope's dome, and an armour at the last weight, the way the still room has one at the first */
  coins([602, F - 2], [621, F - 3], [627, F - 3], [644, F - 2], [651, F - 2]);   /* (609 is inside the stair now: its gold is on the steps above) */
  deco('starChart', 620, 2, { hang: true }); deco('candelabra', 640, F - 1);

  // ---------------- THE ARCHMAGE'S STUDY (x 656-700). The top of the tower: his dais, his islands, and the room he rewrites. ----------------
  block(686, 694, F - 1, F - 1);                                     /* his dais: one step up, so a stone man can climb it */
  deco('orreryBase', 678, F - 1, { arena: true });
  ent('archmage', 690, F - 2, { face: -1 });
  /* the flood, built dry: it fills in his second stage (tools/newlevel.mjs and killzones ignore a pool that starts dry) */
  pools.push({ x0: 665 * TS, x1: 686 * TS, y: F * TS, base: F * TS, bottom: F * TS, dry: true, depth: 0, arenaTide: true, swim: true, clear: true, harm: true, foulCol: '#4a1e6a', wash: 0.5, acid: true, magePool: true });
  /* his ceiling cage, for the room turned over: two bars on chains from the dome. The course at their roots is left
     open, so a hero walking the ceiling goes in under them on his own legs */
  block(687, 687, 3, 5); block(695, 695, 3, 5);
  chain(687, 1, 3); chain(695, 1, 3);
  block(701, W - 1, 0, H - 1);

  /* THE LADDERS, LAST: nothing is dug or laid after this line */
  net(157, G, G + 6);                                              /* down the archive shaft to the nest and back */
  net(213, G - 9, G - 1);                                          /* off the far gallery, down to the floor */
  net(188, 17, G - 11);                                            /* up from the gallery's end to the rafter ledge */
  net(109, G - 7, G - 1);                                          /* down the far side of the gatehouse breach into the grounds */
  net(334, G - 1, G + 6);                                          /* the cellar rope: the way back up out of the wine cellar */
  net(503, 5, F - 2);                                              /* up through the corridor's ceiling onto the roof leads */
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: G - 1 }, pools, falls: [], moversExtra, interiors, gusts: [],
    music: 'musUnder', night: true, nightA: 0.14, edgeLit: true, duskStart: 99999, duskLen: 1,
    mage: { shelves, skins, hedges, chains, dais: [686, 694], flood: [665, 686], stacks: [668, 673, 678, 683], weight: 670, cage: [[687, 2], [695, 2]], hung: [[574, 6], [624, 2]], outside: 118 },
    quest: { n: 3, item: 'lens', name: 'THE LOST LENSES', npc: 'apprentice', done: 'THE LENSES ARE FOUND', reward: 'relic', relic: 'windcloak' },
    palette: { sky: 'mage', far: 'mage', mid: 'mage', near: 'mage', dress: 'village', haze: 'rgba(120,90,180,0.10)',
      grass: '#4e6a52', grassL: '#6c8c70', grassD: '#34483a', dirt: '#4a4652', dirtL: '#645e6c', dirtD: '#2e2a36', canopy: ['#181428', '#221c36', '#2c2446', '#3a3058'] },
    weather: [{ x0: 0, x1: 118 * TS, kind: 'leaves' }],
    ambient: [{ x0: 0, x1: 118 * TS, kind: 'wind' }, { x0: 118 * TS, x1: 501 * TS, kind: 'hall' }, { x0: 501 * TS, x1: 99999, kind: 'wind' }],
    mini: { x0: 238 * TS, x1: 262 * TS, floor: G * TS, y0: (G - 12) * TS, y1: (G + 1) * TS, trigger: 242 * TS, wallL: 237, gate: 262, boss: 'homunculus', name: 'THE HOMUNCULUS' },
    ambushes: [{ name: 'THE READING ROOM', row: G - 1, wallL: 218, wallR: 234, check: false, waves: [[['broom', 222], ['broom', 231], ['armour', 226]], [['armour', 221], ['imp', 230, G - 6], ['broom', 226], ['broom', 232]]] }],
    noCoin: [[118, 262, 0, 13], [263, 380, 0, 21], [102, 108, 0, 23], [381, 500, 0, 5]],   /* the tower's roofs and the gatehouse top: the sprinkler treats an assisted level as all reachable */
    calm: [[0, 18, 0, 47], [20, 32, 0, 47], [66, 77, 30, 38], [96, 124, 0, 47], [144, 158, 0, 47], [176, 214, 26, 47], [233, 264, 0, 47], [290, 318, 22, 47], [318, 346, 0, 47], [362, 372, 0, 47], [386, 436, 30, 47], [436, 502, 0, 47], [501, 590, 0, 47], [591, 656, 0, 47]],   /* no garrison on the lanes, the flipped floor or the test room, nor on the three floors thinned by hand (the stacks' crossing, the bench, the gilded armour's) */
    arena: { x0: 657 * TS, x1: 700 * TS, floor: F * TS, y0: 0, trigger: 662 * TS, wallL: 656, wallR: 700, boss: 'archmage', music: 'boss4', tint: '#2a1a40', tintA: 0.04, fx: 'motes' },
  };
}

/* THIS ARRAY IS AN APPEND LOG. ITS ORDER IS NOT THE CAMPAIGN'S ORDER — the `needs` chain is, and nothing else.
   New levels go on the END, always, because map nodes and saves count levels by ARRAY INDEX and inserting one in
   the middle moves every node and every save after it. So `burning`, `witchlight` and `oreroad` sit in this tail
   while belonging in the middle of the road. If you are writing anything that asks "which level comes before this
   one", READ `needs`, NEVER THE ROW ABOVE. Two tools did it the other way and measured six of 28 levels against a
   level they do not follow (tools/curve.mjs, tools/one-new-foe.mjs; docs/AGENT-HANDOFF.md, EXPENSIVE LESSONS). */
export const LEVELS = [
  { id: 'wood', name: 'BRACKEN WOOD', sub: 'forest and hive', rule: 'THE HIVE FIRST. THE WOOD IS QUIETER WITHOUT IT.', build: brackenWood },
  { id: 'marsh', name: 'MARSH WOOD', sub: 'water and the frog', rule: 'THE CHANNEL IS DEEP: PAY THE FERRYMAN, OR DRAIN IT AND WADE.', build: marshWood, needs: 'wood' },
  { id: 'stockade', name: 'THE STOCKADE', sub: 'the goblin camp', rule: 'EVERY TOWER HAS A HORN. SILENCE THE BLOWER BEFORE IT SOUNDS.', build: theStockade, needs: 'marsh' },
  { id: 'spore', name: 'SPOREWOOD', sub: 'the deep fungus', rule: 'THE CAPS GROW INTO STEPS. CLIMB TO THE MOTHERS KNOT.', build: sporewood, needs: 'stockade' },
  { id: 'kings', name: 'KINGSWOOD', sub: 'the court under the leaves', rule: 'THE COURT HOLDS THE ROAD, AND WHAT HANGS OVER IT CAN BE DROPPED ON IT.', build: kingswood, needs: 'spore' },
  { id: 'scree', arc: 'the crags', name: 'THE SCREE PATH', sub: 'the foothills at dusk', rule: 'THE SLOPE MOVES UNDER YOU AND THE CLIFF DROPS WHAT IT LIKES.', build: screePath, needs: 'kings' },
  { id: 'hanging', name: 'THE HANGING VILLAGE', sub: 'the town on the cliff', rule: 'EIGHT FLOORS ON ONE CLIFF, AND THE WAY UP IS THROUGH THEM.', build: hangingVillage, needs: 'scree' },
  { id: 'spire', name: 'THE MONASTERY', sub: 'and the goblin in its chair', rule: 'WHAT THE MONKS BUILT STILL ANSWERS A BLOW. CLIMB.', build: theMonastery, needs: 'hanging' },
  { id: 'moor', name: 'GALE MOOR', sub: 'the high moor', rule: 'THE WIND IS THE VERB: IT CARRIES YOU, IT PINS YOU, IT LIFTS YOU.', build: galeMoor, needs: 'spire' },
  { id: 'storm', name: 'STORMHOLD', sub: 'the last hold', rule: 'THREE GATES, AND EVERY KEY IS INDOORS.', build: stormhold, needs: 'oreroad' },
  { id: 'crown', name: 'HIGHCROWN', sub: 'the goblin queen\'s castle', rule: 'EVERY HALL HAS A BELL, AND A GATE THAT DROPS WITH IT.', build: highcrownWhole, needs: 'storm' },   /* (2026-09-23: the Ore Road is the way to her gate now) */
  { id: 'longwater', arc: 'the sea', name: 'THE LONG WATER', sub: 'the river to the sea', rule: 'THE TIDE DECIDES WHERE THE FLOOR IS.', build: longWater, needs: 'crown' },
  { id: 'reef', name: 'THE SHIPWRECK REEF', sub: 'the road out to sea', rule: 'BREATH IS THE CLOCK. THE AIR IS IN BELLS, A SWIM APART.', build: shipwreckReef, needs: 'longwater' },
  { id: 'flotilla', name: 'THE FLOTILLA', sub: 'the town of ships', rule: 'FOUR HULLS LASHED TOGETHER: THE WAY PAST IS OVER THEM, NOT THROUGH.', build: theFlotilla, needs: 'reef' },
  { id: 'hurricane', name: 'THE HURRICANE DECK', sub: 'one ship, one storm', rule: 'THE WASH COMES FROM WINDWARD. THE RIGGING IS THE LEVEL.', build: theHurricane, needs: 'flotilla' },
  { id: 'lamplit', name: 'THE LAMPLIT STREET', sub: 'the city under it', rule: 'THE LAMPS ARE AIR.', build: theLamplitStreet, needs: 'hurricane' },
  { id: 'underleaf', name: 'UNDERLEAF', sub: "the king's own village, asleep", rule: 'NOTHING HERE CAN SEE YOU. IT CAN HEAR YOU.', build: underleaf, hidden: true, secret: true, needsTime: { id: 'kings', t: 180 } },
  { id: 'shop', name: 'THE STORE', sub: 'ask the keeper', build: theShop, hidden: true },
  { id: 'trial_open', name: 'THE OPEN YARD', sub: 'straw men, ledges and room', build: openYard, hidden: true },
  { id: 'trial_knight', name: "THE KNIGHT'S TRIAL", sub: 'sword, shield and plunge', build: () => trialYard('knight'), hidden: true },
  { id: 'trial_pyro', name: "THE PYROMANCER'S TRIAL", sub: 'ember, jet and heat', build: () => trialYard('pyro'), hidden: true },
  { id: 'trial_paladin', name: "THE PALADIN'S TRIAL", sub: 'maul, aegis and light', build: () => trialYard('paladin'), hidden: true },
  { id: 'trial_pirate', name: "THE FREEBOOTER'S TRIAL", sub: 'cutlass, pistol and hook', build: () => trialYard('pirate'), hidden: true },
  { id: 'trial_reaper', name: "THE DEATH KNIGHT'S TRIAL", sub: 'greatsword, grave and bone', build: () => trialYard('reaper'), hidden: true },
  { id: 'shopCrag', name: 'THE HIGH STORE', sub: 'ask the keeper', build: theShopCrag, hidden: true },
  { id: 'shopSea', name: 'THE CHANDLER', sub: 'ask the keeper', build: theShopSea, hidden: true },
  { id: 'deep', name: 'THE DEEP', sub: 'the trench the tribute went into', rule: 'YOU ARE TOO LIGHT TO BE DOWN HERE.', build: theDeep, needs: 'lamplit' },
  { id: 'keep', name: 'THE UNDERWATER KEEP', sub: 'his court beneath the waves', rule: 'FOLLOW THE AIR THROUGH THE FLOODED VAULTS.', build: theUnderwaterKeep, needs: 'deep' },
  /* THE SECOND ROAD. The sea arc closes in the trench; this opens the one that goes inland, which is
     why it is allowed to be quieter than the boss before it - see the arc rule in tools/curve.mjs. */
  /* THE DROWNED CAUSEWAY: the last of the coast, after the Deep and before the road inland. The Kraken is the coast's last word */
  { id: 'causeway', name: 'THE DROWNED CAUSEWAY', sub: 'the pilgrim road the sea took', rule: 'THE TIDE TAKES THE ROAD. THE BELLS SAY WHEN, AND THE BELLS ARE YOURS.', build: theDrownedCauseway, needs: 'keep' },
  { id: 'harbor', name: 'STORMWRECK HARBOR', sub: 'from broken quay to lighthouse', rule: 'CROSS THE MARKET, DRYDOCK AND STORM WALL. THE WARDEN HOLDS THE SEA GATE.', build: ()=>stormwreckHarbor({painter,T,TS}), needs: 'causeway' },
  { id: 'waymeet', name: 'WAYMEET', sub: 'where the roads meet, and everyone stops', arc: 'the road inland',
    rule: 'THE SHIELD IS NOT A WALL HERE. IT IS A BEAT.', build: waymeet, needs: 'causeway' },   /* the causeway again: Stormwreck Harbor is out of the campaign (Daniel, 2026-09-20: 'it offers nothing new') */
  { id: 'undercrown', name: 'THE UNDERCROWN', sub: 'the hole the castle stands on', rule: 'NOTHING DOWN HERE IS HOLDING ITSELF UP.', build: undercrown, hidden: true, secret: true, needsKills: { id: 'crown', pct: 0.8 } },
  /* THE HEXED FIELDS: the road inland leaves the coast through the farms under the Archmage's hill, and the Hunt waits past them */
  { id: 'fields', name: 'THE HEXED FIELDS', sub: "the farms under the archmage's hill", rule: 'IF IT GLOWS GREEN, YOU CAN USE IT. THE MOON DECIDES THE REST.', build: theHexedFields, needs: 'waymeet' },
  /* THE MAGE'S FOLLY: the tower on the hill the runoff came down from. The room is what changes, never the hero */
  { id: 'burial', name: 'THE BURIAL CAVERNS', sub: 'the dead under the hill', rule: 'FOLLOW THE CANDLES. THE LOWER ROAD ALWAYS LEADS BACK UP.', build: ()=>burialCaverns({painter,T,TS}), needs: 'fields' },
  { id: 'mage', name: "THE MAGE'S FOLLY", sub: "the archmage's tower", rule: 'THE ROOM IS THE SPELL. STRIKE WHAT GLOWS, AND THE GLYPHS TURN THE FLOOR OVER.', build: theMagesFolly, needs: 'witchlight' },   /* (batch 4c: the Witchlight Stair is the road up to it now) */
  { id: 'fallingtower', name: 'THE FALLING TOWER', sub: 'the last way up', rule: 'CLIMB. EVERY FLOOR YOU LEAVE FALLS. THE DEAD MAGE WAITS IN THE SKY.', build: ()=>buildTowerAscent({painter,T,TS}), needs: 'mage' },
  /* THE BURNING VILLAGE (batch 5): the Pyromancer's class level, off the Stockade on the road to Sporewood. Appended here, not
     between them, so no level's index moves (the map's nodes and the saves count by index) */
  { id: 'burning', name: 'THE BURNING VILLAGE', sub: 'the goblins came down the road', rule: 'ONLY HIS FIRE SPREADS. WATER PUTS IT OUT. GET THE VILLAGE OUT.', build: ()=>buildBurningVillage({painter,T,TS}), needs: 'stockade' },
  /* THE WITCHLIGHT STAIR (batch 4c): the run up the tower's hill between the Burial Caverns and the Folly. Appended, like the
     village, so no index moves; the Folly needs it now */
  { id: 'witchlight', name: 'THE WITCHLIGHT STAIR', sub: 'the road up the tower hill', rule: 'SLABS DRIFT, RUNES LIFT, GLYPHS TURN YOU OVER. CLIMB TO THE GATE.', build: ()=>buildWitchlight({painter,T,TS}), needs: 'burial' },
  /* THE ORE ROAD (2026-09-23): the castle's supply line, a cableway over the gorge between Stormhold and Highcrown. Appended so no
     index moves; Highcrown needs it now */
  { id: 'oreroad', name: 'THE ORE ROAD', sub: "the castle's supply line", rule: 'THE BUCKETS ARE THE FLOOR. STEP ON, STEP OFF, AND DO NOT STAND ON RUST.', build: ()=>buildOreRoad({painter,T,TS}), needs: 'moor' },
  /* THE UNBURIED FIELD (Lane C, 2026-09-23/25): the optional Death Knight class level, a spur off THE WITCHLIGHT STAIR.
     Appended so no index moves; brief .claude/briefs/unburied-field.md, gate on hero 'reaper' via coinNeeds: 'unburied'
     in src/main.js's hero table. Map node NOT placed here (docs/briefs/map-redesign.md 4.2: node (158,46), spur: true) -
     that is Lane B's, per the Lane C report. */
  { id: 'unburied', name: 'THE UNBURIED FIELD', sub: 'a battle nobody buried', rule: 'THE DEAD RISE WHEN A BANNER STANDS. CUT THE BEARERS OR FIGHT THE CROWD.', build: ()=>buildUnburiedField({painter,T,TS}), needs: 'witchlight' },
  { id: 'custom', name: 'YOUR WOOD', sub: 'made by hand', build: () => CUSTOM.build(), hidden: true },
];

/* THE MIX. A level that is one creature is one question asked forty times. Some of each crowd is swapped for a
   creature from elsewhere, standing on the same spot, so the second half of a level asks something the first did
   not - and the creatures that only ever lived in one place get a second home. [from, to, every Nth]
   A creature marked pogo is part of a POGO CHAIN and is never swapped: the tarn's first wasp became a crow, and a crow
   flying off is a gap in the chain. It still counts, so nothing else in the crowd changes. A creature marked fat is a
   LESSON (the wood's old fat sprig, placed by hand for the third cut) and is left alone the same way. */
const MIX = {
  wood: [['wasp', 'crow', 4], ['sprig', 'lurker', 3], ['spit', 'hopper', 3]],
  moor: [['harpy', 'crow', 3]],
  waymeet: [['swornsword', 'hedgeknight', 4], ['swornsword', 'heavy', 8]],   /* a KNIGHT'S town: the hedge knight and the heavy, never the drowned watch or a goblin soldier */
  hunt: [['sprig', 'thief', 2], ['archer', 'javelin', 4]],
  undercrown: [['sprig', 'shardling', 2]],
  deep: [['sailor', 'watch', 4]],
  skyship: [['kite', 'crow', 2]],
};
for (const lv of LEVELS) {
  const mix = MIX[lv.id]; if (!mix || !lv.build || lv.build.mixed) continue;
  const build = lv.build;
  lv.build = (...a) => { const out = build(...a);
    for (const [from, to, every] of mix) { let n = 0;
      for (const e of out.ents) if (e.t === from && !e.boss && !e.mini && ++n % every === 0 && !e.pogo && !e.fat) { e.t = to; delete e.sleeper; if (to === 'crow') { e.speed = 90; e.wake = 260; } } }
    return out; };
  lv.build.mixed = true;
}

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
  wood: L => { const R = rv(L); R.ent('check', 166, 21);
    /* THE BADGER's own ground: one in the sett's dark run, where the corridor is four rows tall and a jump over it is still
       a jump (it is met alone on the flat at 191 first, and it is in the Bramble Ride's first wave) */
    R.ent('badger', 209, 21, { face: -1 });
    /* THE HIVE IS FELT FROM THE START ("most of these honeycombs added throughout the level with wasps around them"). Its
       paper combs hang in the trees behind five stretches of the wood, not only in the Queen's hall and the giant's glade,
       and each keeps a couple of wasps posted high over it: never over a landing, a crate hop or the mover's gap, and at
       least five rows over the floor, so the hop that reaches a crate does not reach them. The sett ridge and the helm
       ridge have wasps of their own already, so their combs bring none. */
    R.ent('deco', 38, 21, { kind: 'hiveBg', v: 1 }); R.ent('wasp', 37, 15); R.ent('wasp', 39, 14);
    R.ent('deco', 214, 13, { kind: 'hiveBg', v: 2 });
    R.ent('deco', 348, 11, { kind: 'hiveBg', v: 1 }); R.ent('wasp', 344, 7); R.ent('wasp', 347, 6);
    R.ent('deco', 432, 14, { kind: 'hiveBg', v: 2 }); R.ent('wasp', 430, 9); R.ent('wasp', 435, 8);
    R.ent('deco', 452, 8, { kind: 'hiveBg', v: 0 }); },   /* not 171: the log step is right over it there, and the shrine ran up through it. (114 before THE THREE LESSONS grew the wood by 78 columns ahead of it) */
  // a checkpoint by the old stones, and lily pads over the two long shallows (hop them and you are across
  // before a wader is halfway), with gold on the way
  marsh: L => { const R = rv(L); R.ent('check', 163, 17); for (const x of [115, 118, 121, 124, 127, 465, 468, 471, 474]) { R.ent('pad', x, 17); R.coin(x, 15); } },
  // and its own light in every part of it, so the long fungus wood stops being one colour from end to end
  spore: L => { rv(L).ent('check', 330, 13);
    L.tints = [[0, 120, [120, 200, 90], 0.10], [120, 175, [210, 150, 80], 0.14], [175, 245, [150, 90, 200], 0.12], [245, 285, [220, 190, 120], 0.12], [285, 325, [120, 70, 170], 0.16], [325, 420, [80, 170, 180], 0.14], [420, 504, [200, 60, 150], 0.16]]; },
  // the court's long runs went a hundred and twenty tiles without a checkpoint
  kings: L => { const R = rv(L); R.ent('check', 153, 21); R.ent('check', 405, 20); },   /* moved with the Knights' Road (+48 at 85) and the Hanging Roots (+42 at 191) */
  scree: L => { rv(L).ent('check', 330, 18); },
  // the sappers' tunnel was the busiest 38 tiles in the busiest level: the brute and one sapper go, and it is a
  // held breath between the walls instead of another fight
  stockade: L => { L.ents = L.ents.filter(e => !((e.t === 'brute' && e.x === 372 && e.y >= 21) || (e.t === 'sapper' && e.x === 368 && e.y >= 21))); },
  // a silver four rows over the street: a step up to it
  storm: L => { rv(L).plat(282, 28, 3); for (const e of L.ents) if (e.t === 'deco' && e.kind === 'cairn') { e.kind = 'skullTotem'; e.v = 0; } },
  // one spider in four goes: a fall off a climb should not land you in three more of them
  hanging: L => { let n = 0; for (let i = L.ents.length - 1; i >= 0; i--) { const e = L.ents[i]; if (e.t === 'spider' && !e.big && !e.mini && (n++ % 4) === 3) L.ents.splice(i, 1); } },
  // THE CLOUD CAMP: a foreman's tent and fire in the cloister's corner, and someone to tell you about the sun; and
  // the looters, digging in the terraces and under the stacks for whatever the monks buried
  spire: L => { const R = rv(L); R.ent('deco', 4, 99, { kind: 'pilgrimLeanTo', v: 0 }); R.ent('npc', 8, 99, { kind: 'foreman' }); R.ent('brazier', 11, 99);
    R.ent('sign', 14, 99, { text: 'THE CLOUD CLOISTER. ABOVE THE CLOUD THE SMOKE GOES HIGHER AND THE BIRDS GET BOLDER.' });
    R.ent('rockgoblin', 32, 195, { face: -1 }); R.ent('sentry', 20, 151, { face: 1 }); },   /* were MINERS: the pick is about to be the Ore Road's own thing (a throw that disarms him), and two of them up here diluted both levels */
  // the castle had the fewest foes of anywhere: a watch in the ward, a hall guard, the kitchens staffed. And THE
  // LEADS: from the choir loft up through a hatch onto the keep roof, a run along it with the whole mountain
  // below, and a second hatch down at the far end of the chapel
};
// SET DRESSING. After the gold, every real wood gets its own things left about on its ground - hives and
// birdhouses in the wood, fish traps in the marsh, spear racks and tents in the camp, spore pods under the
// fungus, cairns and fences on the hills, barrels and lamp posts in the towns, the Queen's banners in her
// castle. Only on open ground with room over it, spaced out, never in a boss room, never on a sign, a door,
// a gate or a friend, and the same every time. (The per-100 dressing count was the thinnest number we had.)
export const DRESS = {
  wood: [['beehive'], ['birdhouse'], ['trunk', 3], ['fence', 2], ['deadTree', 2], ['cairn'], ['stone', 3], ['fern', 3], ['mushroom', 2], ['stump', 2], ['rock', 3], ['flower', 2], ['bushDeco', 3]],   /* the first wood was the thinnest: fences and stones */
  marsh: [['fishTrap', 2], ['lilyLantern'], ['deadTree', 2], ['fence', 2], ['barrels'], ['frogStatue', 1], ['cattail', 2], ['fern', 3], ['mushroom', 2], ['moss', 2], ['stump', 2]],
  stockade: [['barrels'], ['spearRack'], ['skullPile', 2], ['tent', 2], ['cart'], ['bones', 2], ['banner', 2], ['gobPennant', 3], ['warStandard', 2], ['ragBanner', 3], ['hideBanner', 2], ['skullTotem', 2], ['trophyRack', 2], ['stakeFence', 2], ['lootHeap', 2], ['cookSpit'], ['cauldron'], ['hideRack', 2], ['warnPost', 2], ['boneChime', 2]],   /* the war camp: every flag they have, and the camp's own mess */
  spore: [['sporePod'], ['rootDecor', 3], ['cobweb', 3], ['deadTree', 2], ['bones', 2], ['mushroom', 2], ['moss', 2], ['fern', 3], ['stump', 2]],
  kings: [['banner', 2], ['barrels'], ['lanternPost'], ['spearRack'], ['hangCage'], ['trunk', 3], ['gobPennant', 3], ['ragBanner', 3], ['clothStrip', 3], ['skullTotem', 2], ['idol', 2], ['lootHeap', 2], ['trophyRack', 2], ['cauldron'], ['boneChime', 2], ['warnPost', 2]],   /* the court: idols, the king's takings, trophies */
  scree: [['stone', 3], ['cairn'], ['fence', 2], ['deadTree', 2], ['bones', 2]],
  hanging: [['lanternPost'], ['barrels'], ['birdhouse'], ['beehive']],
  /* THE SAND CASTLES (Daniel, 2026-09-22, with a screenshot of one): the stone lantern is a pale tan stack with a wide
     flat cap, and at 320x180 against the sky that silhouette is a sandcastle turret and nothing else - it was in this
     roster AND it was the level's dead-end stash, so eight of them stood along the mountain. The monastery has plenty
     that reads: flags on a post, a shrine with a roof on it, a censer stand, the bee skeps. */
  spire: [['prayerFlags', 2], ['herbBed'], ['skep'], ['incenseStand', 2], ['monkChores'], ['stone', 3], ['shrine', 2], ['flagPost', 2]],
  moor: [['stone', 3], ['cairn'], ['fence', 2], ['bones', 2], ['deadTree', 2]],
  storm: [['barrels'], ['lanternPost'], ['spearRack'], ['banner', 2], ['cart'], ['tent', 2], ['warStandard', 2], ['hideBanner', 2], ['gobPennant', 3], ['stakeFence', 2], ['hideRack', 2], ['cookSpit'], ['cauldron'], ['trophyRack', 2], ['clothStrip', 3], ['boneChime', 2], ['warnPost', 2]],   /* the hill clans' hold: hides, stakes, standards */
  crown: [['banner', 2], ['barrels'], ['spearRack'], ['lanternPost'], ['hangCage'], ['clothStrip', 4], ['warStandard', 2], ['gobPennant', 4], ['lootHeap', 2], ['trophyRack', 2], ['idol', 2], ['cauldron'], ['boneChime', 2]],   /* the Queen's castle: her strips in the halls, the loot of the whole wood */
  lamplit: [['cityWeed', 3], ['shellDrift', 2], ['lampWreck', 2], ['sealDrift', 2], ['drownedCart'], ['column', 2]],
  underleaf: [['barrels'], ['wares'], ['fence', 2], ['cart'], ['well'], ['lanternPost'], ['beehive'], ['idol', 2], ['hideRack', 2], ['cauldron'], ['cookSpit'], ['gobPennant', 3], ['lootHeap', 2], ['boneChime', 2], ['clothStrip', 3], ['trophyRack', 2]],   /* a village at home: pots on, hides out, the household gods */
  undercrown: [['barrels'], ['wares'], ['bones', 2], ['cairn'], ['stone', 3], ['cart'], ['spearRack'], ['lootHeap', 2], ['cauldron'], ['boneChime', 2], ['skullTotem', 2], ['warnPost', 2], ['clothStrip', 3], ['ragBanner', 3]],   /* the mine: the dig's takings and its warnings */
  quarry: [['stone', 3], ['cairn'], ['bones', 2], ['cart'], ['barrels'], ['wares', 2], ['fence', 2], ['rock', 3], ['warnPost', 2], ['stakeFence', 2], ['cookSpit'], ['lootHeap', 2], ['gobPennant', 2]],   /* the diggers' camp: posts on the ledges, a spit going, what they have dug up */
  deep: [['glowCoral', 3], ['tubeWorms', 2], ['seaLily', 2], ['boneHeap', 2], ['tributeSpill', 2], ['shellDrift', 2], ['seaChest']],   /* THE TRENCH's own, not the reef's: coral that makes its light, worms off the warmth, lilies, bones and spilt tribute */
  longwater: [['coralTuft', 3], ['barnacleRock', 2], ['saltCrust', 2], ['kelp', 3], ['pierPost'], ['netPoles']],
  causeway: [['barnacleRock', 2], ['saltCrust', 2], ['kelp', 3], ['shellDrift', 2], ['fencePosts'], ['spar', 2], ['pierPost']],   /* the pilgrim road: wrack, shells, weed and what the tide leaves on the stone */
  reef: [['coralFan', 3], ['brainCoral', 2], ['urchinRock', 2], ['kelpTall', 3], ['spar', 2], ['mastStump']],
  frost: [['cairn'], ['stone', 3], ['bones', 2], ['deadTree', 2], ['frozen', 2]],
  burning: [['barrels'], ['fence', 2], ['cart'], ['hayBale', 2], ['brokenCart'], ['milkChurn'], ['waterPump'], ['crookedFence', 2], ['lanternPost'], ['stump', 2]],   /* a farming village on the road: its carts, its hay, its pumps */
  oreroad: [['barrels', 2], ['cart'], ['lanternPost', 2], ['lootHeap', 2], ['cairn']],   /* THE ORE ROAD: the stations' ore, their carts and their lamps */
  witchlight: [['topiaryUrn', 2], ['lamppost', 2], ['ivyWall', 2], ['stone', 3], ['grave', 2], ['bones', 2]],   /* THE WITCHLIGHT STAIR: the tower's garden going wild down the hill, and the graves of the dead that followed you up */
  mage: [['candelabra'], ['bookpile', 2], ['jars', 2], ['topiaryUrn'], ['lamppost'], ['ivyWall'], ['stone', 3]],   /* the tower: candles, books and jars; the grounds: urns, lamps and ivy */
  fields: [['deadCorn', 3], ['crookedFence', 2], ['hayStack', 2], ['pumpkinPatch'], ['farmLantern'], ['milkChurn'], ['plough'], ['brokenCart'], ['waterPump'], ['fieldGrave', 3], ['stone', 3], ['deadTree', 2]],   /* the farm, gone wrong: dead corn, crooked fences, the lanterns they left in the fields */
  hunt: [['fence', 2], ['stump', 2], ['fern', 3], ['hayBale', 2], ['trough'], ['tent', 2], ['banner', 2], ['spearRack'], ['bushDeco', 3], ['flower', 2], ['stone', 3], ['deadTree', 2], ['hideRack', 2], ['trophyRack', 2], ['gobPennant', 3], ['cookSpit'], ['warStandard']],   /* the lord's hunt: hides drying, antlers racked, his pennants */
  skyship: [['kegStack'], ['rumBarrels', 2], ['coiledCable', 2], ['washing'], ['hammock', 2], ['lanternDeck', 2], ['plunder', 3], ['waterButt'], ['gobPennant', 3], ['lootHeap', 2], ['boneChime', 2], ['ragBanner', 2]],   /* a pirate crew's: pennants, plunder and bones on a line */
};
// per level: what to add, and how many of each. Read tools/curve.mjs before you touch these numbers.
const GARRISON = {
  marsh: [['hopper', 5], ['spit', 4], ['archer', 3], ['thorn', 3], ['turtle', 3], ['heronfoe', 3]],   // 46 was thirteen under the level before it
  spore: [['sporeling', 4], ['spitcap', 3], ['weaver', 2], ['thorn', 2], ['spider', 1]],   // eight kinds was the thinnest roster in the wood
  moor: [['goat', 5], ['rockgoblin', 5], ['harpy', 4], ['kite', 4], ['troll', 2], ['sailer', 3]],   // seven kinds over NINE HUNDRED columns, and twenty-three of them crows
  scree: [['harpy', 4], ['goat', 4], ['rockgoblin', 3], ['troll', 1]],
  hanging: [['snuffer', 3], ['cutter', 2], ['rockgoblin', 2]],   // thirty-four creatures over eight floors: the thinnest level in the crags       // 58 sat twenty-two under Kingswood
  /* EIGHT KINDS, NOT ELEVEN (2026-09-22). The crow, the goat, the kite, the spider and the snuffer each landed once or
     twice over six hundred columns - a cast nobody can learn, so no encounter on the mountain had a shape. What is left
     is the mountain's own (the birds, the bats, the rock) and the goblins who took the monastery, who are the False
     Abbot's congregation now and so belong here twice over. The weights still total 67: the density does not move. */
  spire: [['fledgling', 14], ['harpy', 11], ['bat', 9], ['sentry', 9], ['rockgoblin', 9], ['troll', 5], ['gobpriest', 5], ['gobmage', 5]],   // 47 sat THIRTY-ONE under the Hanging Village: the thinnest level in the game for its place
  storm: [['hearthgob', 5], ['cutter', 5], ['sentry', 2], ['pike', 1]],
  crown: [['soldier', 5], ['javelin', 4], ['heavy', 3], ['pike', 2]],   // the peak of act two, and it was reading under Stormhold before it. Her HEAVY KNIGHTS live here and nowhere earlier.
  longwater: [['scout', 5], ['tideguard', 6], ['crab', 6], ['siren', 4], ['eel', 3], ['netter', 2], ['angler', 3], ['turtle', 4], ['heronfoe', 3], ['lamprey', 2], ['puffer', 1], ['jelly', 1], ['merrowspear', 2], ['merrowbrute', 1]],   // replacing weight, not piling on: three of the eel/angler/siren's slots go to the new wildlife
  reef: [['angler', 9], ['crab', 7], ['sailor', 4], ['netter', 4], ['petrel', 5], ['scout', 5], ['tideguard', 4], ['turtle', 5], ['eel', 5], ['siren', 4], ['urchin', 2], ['lookout', 1], ['puffer', 2], ['lamprey', 2], ['jelly', 1], ['merrowspear', 3], ['merrowcaller', 2]],
  quarry: [['rockgoblin', 7], ['goat', 5], ['miner', 5], ['archer', 3], ['harpy', 3], ['horn', 2], ['sapper', 3], ['brute', 2], ['shield', 3], ['hound', 3]],   // a few points over the Hunt in tools/curve.mjs
  hurricane: [['cutlass', 3], ['scout', 4], ['tideguard', 3], ['marine', 2], ['boarder', 2], ['sailor', 4], ['petrel', 3], ['seawitch', 2]],   /* one ship in one storm: half her garrison is the storm's now, drowned hands, gulls and her own sea witch, not another cutlass */
  mage: [['broom', 8], ['imp', 7], ['armour', 6], ['topiary', 5], ['turret', 4], ['bat', 4], ['haunt', 3], ['apprentice', 5], ['zombie', 3]],   /* AND THE FOLLY KEEPS ITS OWN DEAD: the apprentices who did not get out are in the tower before it falls, so the undead of the sequel are not a surprise it invents */   /* the tower's own: what he made, what he animated and what he left switched on. No goblins up here */
  fields: [['scarecrow', 10], ['wight', 10], ['pumpkin', 7], ['rook', 6], ['swornsword', 6], ['hedgeknight', 6], ['farmhand', 4], ['haunt', 3], ['crow', 4]],   /* the fields' own: scarecrows and the bog's dead, what floats, and a patrol of the road's knights come out to the farms. The goats and hounds were beasts from other levels, not the farm's ghosts; the knights take their two slots at the same counts, so the shuffle puts everyone else where it did */
  hunt: [['hound', 6], ['crow', 4], ['goat', 3], ['archer', 3], ['soldier', 4], ['hare', 3], ['brute', 2], ['pike', 2], ['shield', 2], ['javelin', 2]],   // the park's own: dogs off the leash, the lord's riders, and what they are hunting
  frost: [['wight', 8], ['rockgoblin', 6], ['harpy', 6], ['troll', 6], ['shardling', 6], ['goat', 3], ['kite', 3], ['hearthgob', 4], ['bat', 2]],   // the fell's own: the buried cutters, the squatters in their camp, and what lives on the ice
  causeway: [['scout', 8], ['tideguard', 6], ['watch', 2], ['feeler', 8], ['petrel', 5], ['cutlass', 3], ['sailor', 2], ['crab', 4], ['netter', 2], ['jelly', 1], ['puffer', 1], ['lamprey', 1], ['merrowcaller', 1], ['merrowbrute', 1]],   /* the drowned pilgrims' road: its dead, its crabs, and the arms in the flats (its fish are put in the channels by hand: the sprinkler found the Kraken's own sea under the arena road) */
  skyship: [['cutlass', 8], ['boarder', 7], ['archer', 5], ['javelin', 4], ['sapper', 3], ['marine', 3], ['bosun', 2], ['lookout', 2], ['shield', 2]],   /* a goblin galleon's whole crew, over her decks, yards and slings - and now a shield in her roster too, so the squads rule (0.4) actually screens her bow, spear and sapper the way it already does in Kingswood's Knights' Road: two cutlass hands stood down to pay for it, the count unchanged */
  /* THE FOUR LEVELS THE SPRINKLER HAD NEVER HEARD OF. Stormwreck Harbor, the Keep, the Burial Caverns and the Falling
     Tower were built without a row here, so each of them was only ever the creatures its builder placed by hand:
     1.4 to 2.3 a screen against Kingswood's 4.8 and Sporewood's 5.5, which is most of why they played empty. */
  harbor: [['cutlass', 11], ['boarder', 10], ['scout', 11], ['tideguard', 10], ['petrel', 11], ['marine', 8], ['sailor', 8], ['netter', 6], ['crab', 8], ['angler', 8], ['eel', 6], ['lookout', 4], ['bosun', 4], ['bonecorsair', 6], ['lanternshade', 4], ['puffer', 2]],   /* the wrecked harbour's own: the crews the storm put ashore, the birds over them, and what the Lamplit Street's dead washed in with */
  keep: [['wight', 14], ['tideguard', 10], ['watch', 9], ['eel', 9], ['angler', 7], ['siren', 5], ['merrowspear', 5], ['jelly', 5], ['merrowbrute', 3], ['manta', 3], ['urchin', 3], ['puffer', 3], ['lamprey', 3]],   /* a drowned castle: its own garrison still at their posts, and the deep water's wildlife moved in over them */
  burning: [['sprig', 10], ['archer', 4], ['burngob', 4], ['emberwisp', 4], ['thief', 3], ['hound', 3], ['sapper', 3], ['shield', 2], ['pike', 2]],   /* THE BURNING VILLAGE: the Stockade's goblins down the road, his burning ones, and his wisps */
  burial: [['zombie', 16], ['husk', 9], ['wight', 14], ['bat', 13], ['bonegob', 8], ['bonearcher', 9], ['bonecorsair', 7], ['boo', 11], ['lanternshade', 5], ['haunt', 8], ['spider', 6]],   /* and something that SHOOTS: over 1,140 tiles nothing in here could reach the hero across a room */   /* forty-four zombies and nothing else was the whole roster under the hill */
  /* witchlight: NO ROW. The redesigned stair (2026-09-22) is authored ENCOUNTERS of 3-5 with quiet between - Daniel agreed to it over an even sprinkle (src/witchlight.js) */
  fallingtower: [['tome', 3], ['apprentice', 3], ['haunt', 2], ['bat', 2], ['imp', 1], ['armour', 1], ['boo', 1]],   /* the Folly's own staff, and what got loose in it. Small since the ascent (2026-09-21): the builder puts a creature on every tier, and this fills between them - on every floor (L.stackedFloors). NO ZOMBIE AND NO HUSK since the tower was made longer (2026-09-22): Daniel asked for FEWER of them, and the builder's own three zombies plus the cistern's elite husk are the whole count - a row here would quietly put more back. The TOMES lead it instead. */
  lamplit: [['watch', 6], ['wight', 9], ['snuffer', 8], ['tideguard', 8], ['scout', 8], ['crab', 4], ['angler', 5], ['sailor', 4], ['netter', 3], ['urchin', 2], ['siren', 2], ['puffer', 2], ['lamprey', 2], ['jelly', 1], ['merrowspear', 2], ['merrowbrute', 1]],  // the LAST level must be the hardest thing in the game, and it was reading EASIER than Highcrown
};
// ============ THE CHECKPOINTS, LOOKED AT AS A SET ============
// Measured across the campaign and they are bunched and then absent: Highcrown had ELEVEN of them and SEVEN
// of its gaps were zero - they were stacked on the same tile, so a hundred-tile castle had four real ones.
// Kingswood had a hundred and eighteen columns between two and then a gap of two. Stormhold had a run of a
// hundred and twenty-six. This does both halves of the job: it throws away any checkpoint standing on top of
// another, and then fills any run longer than seventy-two by putting one on the nearest ground the player can
// actually stand on. A tall level is measured by HEIGHT, because that is the direction you travel it.
function checkpoints(L) {
  const W = L.W, H = L.H, g = L.grid, tall = H > 60;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const stand = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.CRYST;
  const wet = (x, y) => (L.pools || []).some(p => x * TS >= p.x0 && x * TS <= p.x1 && y * TS + 8 > p.y - 2);
  const rooms = [L.arena, L.mini].filter(Boolean).map(A => [A.x0 / TS - 2, A.x1 / TS + 2]).concat((L.ambushes || []).map(A => [A.wallL - 1, A.wallR + 1, A.y0 !== undefined ? A.y0 : A.row - 9, A.row + 2]));   /* never a checkpoint inside an ambush room: you would wake up locked in */
  const key = e => tall ? e.y : e.x;
  let ch = (L.ents || []).filter(e => e.t === 'check').sort((a, b) => key(a) - key(b));
  // 1. one of them is enough
  const kept = [];
  // TWO ON THE SAME TILE is a duplicate; two on the same FLOOR at opposite ends of a castle are not. Highcrown
  // has seven checkpoints on one row because it has seven rooms on that row, and keying on one axis threw six
  // of them away and left a two-hundred-tile run.
  for (const c of ch) { if (kept.some(k => Math.abs(k.x - c.x) < 5 && Math.abs(k.y - c.y) < 5)) continue; kept.push(c); }
  L.ents = L.ents.filter(e => e.t !== 'check' || kept.includes(e));
  ch = kept;
  // 2. and no run longer than seventy-two
  const MAXRUN = 72;
  const place = (want) => {
    let best = null, bd = 1e9;
    for (let x = 4; x < W - 4; x++) for (let y = 2; y < H - 2; y++) {
      if (!stand(at(x, y + 1)) || at(x, y) !== T.AIR || at(x, y - 1) !== T.AIR || at(x, y - 2) !== T.AIR) continue;
      // A LEDGE ONE TILE WIDER THAN ITS FOOTING still holds a checkpoint. Asking for three tiles meant the
      // Long Water's two-tile ledges out in the river were all rejected, the filler gave up silently, and a
      // ninety-four column run with no checkpoint in it stood. (The garrison placer learned this on the
      // Sunspire and this one never heard about it.)
      if (!stand(at(x - 1, y + 1)) && !stand(at(x + 1, y + 1))) continue;
      if (wet(x, y) || rooms.some(([a2, b2, c2, d2]) => x >= a2 && x <= b2 && (c2 === undefined || (y >= c2 && y <= d2)))) continue;
      const d = Math.abs((tall ? y : x) - want); if (d < bd) { bd = d; best = [x, y]; }
    }
    return bd < MAXRUN ? best : null;   /* the nearest ground that will hold one, even if it is most of a run away */
  };
  const marks = ch.map(key);
  const runs = [];
  for (let i = 1; i < marks.length; i++) if (marks[i] - marks[i - 1] > MAXRUN) runs.push([marks[i - 1], marks[i]]);
  if (marks.length && marks[0] > MAXRUN) runs.push([0, marks[0]]);
  const put = [];
  for (const [a2, b2] of runs) { const n = Math.ceil((b2 - a2) / MAXRUN);
    for (let k = 1; k < n; k++) { const want = a2 + (b2 - a2) * k / n;
      const spot = place(want);
      if (spot && !put.some(([px, py]) => Math.abs((tall ? py : px) - (tall ? spot[1] : spot[0])) < 12)) {
        put.push(spot); L.ents.push({ t: 'check', x: spot[0], y: spot[1], filled: true }); } } }
  return L;
}
function garrison(L, id) {
  const source = GARRISON[id]; if (!source) return L;
  const set = source.map(([kind,n])=>[kind,Math.max(1,Math.round(n*COMBAT.garrison))]);
  const W = L.W, H = L.H, g = L.grid;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const stand = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.CRYST;
  const rooms = [L.arena, L.mini].filter(Boolean).map(A => [A.x0 / TS - 2, A.x1 / TS + 2, (A.y0 !== undefined ? A.y0 / TS : A.floor / TS - 16) - 2, A.floor / TS + 2])
    .concat((L.ambushes || []).map(A => [A.wallL - 1, A.wallR + 1, (A.y0 !== undefined ? A.y0 : A.row - 9) - 1, A.row + 2])).concat(L.calm || []);   /* an ambush room is empty until it shuts, and a calm is kept calm */
  const wet = (x, y) => (L.pools || []).some(p => x * TS >= p.x0 && x * TS <= p.x1 && y * TS + 8 > p.y - 2);
  const deepUnder = (x, y) => (L.pools || []).some(p => !p.shallow && !p.swim && x * TS >= p.x0 && x * TS <= p.x1 && y * TS + 8 > p.y - 2);
  const KEEP = new Set(['sign', 'check', 'npc', 'doorway', 'gate', 'lockgate', 'key', 'stray', 'silver', 'relic', 'shrine', 'cage', 'lever', 'vent', 'mover', 'capstan', 'pump', 'cannon', 'bulkhead', 'plank', 'cart', 'bell', 'seabell', 'winch', 'crank', 'support', 'nest', 'sheet', 'captive', 'watertrough', 'villagewell']);
  const keep = L.ents.filter(e => KEEP.has(e.t)).map(e => [e.x, e.y]);
  /* NOT ON TOP OF ONE ALREADY THERE (L.noStack). The sprinkler never looked at the creatures a builder put down by hand, so
     a spot it took could be the very tile an archer stands on: after the Marsh's crossings were calmed, four of its
     garrison came down on four of its own foes. A level that says noStack has the sprinkler step past a held tile. (A
     flag, not a rule for everyone: seven other levels stack a pair today, and turning it on there reshuffles them.) */
  const held = L.noStack ? new Set(L.ents.filter(e => !KEEP.has(e.t) && e.t !== 'coin' && e.t !== 'deco' && e.t !== 'pad').map(e => e.x + ',' + e.y)) : null;
  // every place a creature could stand, left to right
  const spots = [];
  for (let x = 6; x < W - 6; x++) for (let y = 2; y < H - 1; y++) {
    if (!stand(at(x, y + 1)) || at(x, y) !== T.AIR || at(x, y - 1) !== T.AIR || at(x, y - 2) !== T.AIR) continue;
    if (!stand(at(x - 1, y + 1)) && !stand(at(x + 1, y + 1))) continue;          // a ledge one tile wider than it stands on: the Sunspire has almost nothing three tiles across
    if (rooms.some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d)) continue;
    if (keep.some(([kx, ky]) => Math.abs(kx - x) < 4 && Math.abs(ky - y) < 4)) continue;
    if (deepUnder(x, y)) break;   /* the bed of deep water is no floor for anyone: it put a heron, a spitter and a thorn on the Marsh ferry channel's */
    spots.push([x, y, wet(x, y)]); if (!L.stackedFloors) break; y += 2;                     // one per column: the highest floor (a tower of floors stacked on each other offers every one of them)
  }
  if (L.stackedFloors) spots.sort((a, b) => a[1] - b[1] || a[0] - b[0]);   /* and banded by HEIGHT, so every floor gets its share */
  if (spots.length < 8) return L;
  // HOW FAR APART IS FAR ENOUGH depends on the shape of the level. Eight columns is right for a road; on a
  // tower ninety-six wide it rejects nearly every spot, which is why the Sunspire asked for fifty-five and
  // got fourteen. A tall level spaces by HEIGHT instead.
  // WHO CAN BE PUT IN THE WATER. The Long Water is mostly water, so refusing every wet spot left the
  // sprinkler nowhere to work - and an eel belongs in the water anyway.
  const SWIMS = new Set(['eel', 'angler', 'siren', 'netter', 'petrel', 'turtle', 'urchin', 'heronfoe', 'gull', 'sailor', 'puffer', 'jelly', 'lamprey', 'manta', ...(L.swimGarrison || [])]);   /* L.swimGarrison: a level that IS water says who else belongs in it. The Underwater Keep is submerged end to end, so every spot the sprinkler found was wet and its own drowned garrison - wights, watchmen, the merrow - could not be put in any of them: it asked for sixty-eight and placed nineteen fish. */   /* the new wildlife swims too: without this the sprinkler could only put a jellyfish on dry ground */
  // AND WHO MUST BE BY IT. SWIMS says who MAY be put in the water; nothing said who must. Anglers and urchins were put on
  // the paving over the Lamplit Street's floods and hung in the air there all level (thirteen of them), and crabs, herons
  // and turtles were put down a hundred tiles from any water. A swimmer takes a spot IN a swim pool; a siren and a wader
  // take one in the water or within three tiles of it, when the level has any.
  const INWATER = new Set(['eel', 'angler', 'urchin', 'puffer', 'jelly', 'lamprey']), BYWATER = new Set(['siren', 'turtle', 'crab', 'heronfoe', 'netter', 'sailor']);
  const pools = L.pools || [];
  const swimIn = (x, y) => pools.some(p => p.swim && x * TS >= p.x0 + 12 && (x + 1) * TS <= p.x1 - 12 && (y + 1) * TS > p.y + 12);
  const byWater = (x, y) => pools.some(p => !p.harm && (x + 1) * TS > p.x0 - 3 * TS && x * TS < p.x1 + 3 * TS && (y + 1) * TS >= p.y - 3 * TS && (y + 1) * TS <= (p.bottom !== undefined ? p.bottom : p.y + 40) + TS);
  const bySwim = (x, y) => pools.some(p => p.swim && (x + 1) * TS > p.x0 - 3 * TS && x * TS < p.x1 + 3 * TS && (y + 1) * TS >= p.y - 3 * TS && (y + 1) * TS <= (p.bottom !== undefined ? p.bottom : p.y + 60) + TS);   /* a siren sings over water you can drown in, not a wading pool */
  /* AND WATER IS NOT ROOM: a swim pool's spot can still have rock in it, and the Long Water put an eel a tile inside the bank
     the moment the new wildlife shifted the draw. A swimmer needs its own tile and the one over it clear. */
  const clearHere = (x, y) => [x - 1, x, x + 1].every(cx => cx < 0 || cx >= L.W || (!solid(L.grid[y * L.W + cx]) && !solid(L.grid[Math.max(0, y - 1) * L.W + cx])));   /* its own column is not enough: a fish is wider than a tile, and the reef put an angler's nose in the rock */
  const fits = (kind, x, y, isWet) => (!SWIMS.has(kind) || clearHere(x, y)) && (!isWet || SWIMS.has(kind)) && (!INWATER.has(kind) || swimIn(x, y)) && (kind !== 'siren' || bySwim(x, y)) && (!BYWATER.has(kind) || !pools.length || isWet || byWater(x, y));
  const tall = W < 220, minDX = tall ? 4 : 8, minDY = tall ? 9 : 6;
  const taken = [], left = [];
  const squads = set.some(([k]) => k === 'shield' || k === 'soldier'); let squadN = 0;
  const rnd = mulberryL(id.length * 613 + id.charCodeAt(1) * 7 + 11);
  const want = set.reduce((s, [, n]) => s + n, 0);
  // spread them: walk the level in `want` bands and take one spot from each, so a garrison is never a crowd
  const list = [];
  for (const [kind, n] of set) for (let i = 0; i < n; i++) list.push(kind);
  for (let i = list.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const t = list[i]; list[i] = list[j]; list[j] = t; }
  for (let b = 0; b < list.length; b++) {
    const lo = Math.floor(spots.length * b / list.length), hi = Math.floor(spots.length * (b + 1) / list.length);
    let put = null;
    for (let k = lo; k < hi; k++) { const [x, y, isWet] = spots[(k + ((rnd() * (hi - lo)) | 0)) % Math.max(1, hi - lo) + lo] || spots[k];
      if (held && held.has(x + ',' + y)) continue;
      if (!fits(list[b], x, y, isWet)) continue;
      if (taken.some(([tx, ty]) => Math.abs(tx - x) < minDX && Math.abs(ty - y) < minDY)) continue; put = [x, y]; break; }
    if (!put) { left.push(list[b]); continue; }
    taken.push(put);
    L.ents.push({ t: list[b], x: put[0], y: put[1], face: rnd() < 0.5 ? -1 : 1, garrison: true });
    /* A SQUAD, NOT A SPRINKLE: in a goblin wood every other bow or spitter gets a shield in front of it, on its own ground */
    if (squads && ['archer', 'javelin', 'spit', 'scout', 'sapper'].includes(list[b]) && (squadN++ % 2 === 0)) {
      const sx = put[0] - 2, sy = put[1];
      if (spots.some(([x2, y2]) => x2 === sx && y2 === sy) && !taken.some(([tx, ty]) => Math.abs(tx - sx) < 2 && Math.abs(ty - sy) < 2)) { taken.push([sx, sy]); L.ents.push({ t: 'shield', x: sx, y: sy, face: 1, garrison: true }); } }
  }
  // whatever the bands could not fit goes anywhere still free: a band with no room used to simply lose its
  // creature, which is how the Sunspire asked for thirty-one and got thirteen
  for (const kind of left) {
    let put = null;
    for (let k = 0; k < spots.length; k++) { const [x, y, isWet] = spots[((k * 7 + ((rnd() * spots.length) | 0)) % spots.length)];
      if (held && held.has(x + ',' + y)) continue;
      if (!fits(kind, x, y, isWet)) continue;
      if (taken.some(([tx, ty]) => Math.abs(tx - x) < minDX && Math.abs(ty - y) < minDY)) continue; put = [x, y]; break; }
    if (!put) continue;   /* one kind with no water to go in is not a reason to drop every kind after it */
    taken.push(put);
    L.ents.push({ t: kind, x: put[0], y: put[1], face: rnd() < 0.5 ? -1 : 1, garrison: true });
  }
  return L;
}
/* GOBLIN THINGS PUT DOWN BY HAND, where the sprinkler cannot know to put them: a warning at the way in, a standard
   and a totem on the boss approach, the takings behind a gate. [kind, x, y, v, hang]. Grounded kinds snap to the floor
   they are given; a hung one is given the row just under its rock. Checked against signs, doors, checkpoints and the
   arena by hand, and tools/floaters.mjs checks the floors. */
const GOBLIN_CAMP = {
  stockade: [['warnPost', 22, 19, 0], ['stakeFence', 56, 19, 1], ['hideBanner', 90, 19, 0], ['trophyRack', 130, 19, 0], ['hideRack', 243, 13, 1], ['cookSpit', 260, 13], ['lootHeap', 364, 13, 0], ['skullTotem', 386, 11, 1], ['warStandard', 441, 11, 0]],
  kings: [['gobPennant', 16, 19, 2], ['warnPost', 35, 19, 1], ['cauldron', 167, 12], ['cookSpit', 194, 12], ['boneChime', 432, 16, 0, true], ['skullTotem', 497, 13, 0], ['warStandard', 506, 13, 1], ['lootHeap', 684, 13, 1], ['idol', 702, 13, 0]],
  storm: [['warnPost', 86, 33, 0], ['hideRack', 119, 15, 0], ['lootHeap', 133, 15, 1], ['boneChime', 192, 19, 1, true], ['gobPennant', 200, 31, 1], ['cookSpit', 229, 29], ['cauldron', 287, 29]],
  crown: [['warnPost', 22, 71, 1], ['hideBanner', 33, 71, 1],['gobPennant', 684, 7, 3], ['ragBanner', 716, 7, 2], ['cauldron', 706, 63], ['boneChime', 712, 54, 0, true], ['trophyRack', 710, 51, 1], ['skullTotem', 745, 51, 0], ['clothStrip', 724, 10, 3, true], ['warStandard', 738, 19, 1]],   /* the keep's own moved 220 right with the siege lines, the crag walk and the bakehouse yard grown in front of it, and 84 more with the armoury */
  underleaf: [['gobPennant', 32, 33, 2], ['cookSpit', 325, 33], ['lootHeap', 376, 33, 0], ['boneChime', 237, 7, 1, true], ['idol', 444, 33, 1]],
  undercrown: [['stakeFence', 80, 28, 0], ['skullTotem', 42, 111, 1], ['boneChime', 26, 88, 0, true], ['ragBanner', 58, 122, 0], ['clothStrip', 20, 88, 2, true], ['warnPost', 26, 140, 0], ['lootHeap', 52, 140, 1], ['cauldron', 68, 140]],
};
/* WHAT HANGS FROM THE ROCK, and how tall it is. The sprinkler finds floor; one of these wants a roof over that floor
   with room for its length and a hero under it, or it is not put down. */
const HUNG_H = { clothStrip: 62, boneChime: 40 };
/* AND WHAT STANDS TALLER THAN THREE ROWS. The sprinkler asks for three rows of air, which is a barrel's worth: a war
   standard put under a gallery three rows up ran its skull through the boards. */
const TALL_ROWS = { warStandard: 5, hideBanner: 4, skullTotem: 4 };
function dressLevel(L, id) {
  const set = DRESS[id]; if (!set) return L;
  for (const [kind, x, y, v, hang] of GOBLIN_CAMP[id] || []) L.ents.push(Object.assign({ t: 'deco', x, y, kind, v: v || 0 }, hang ? { hang: true } : {}));
  const W = L.W, H = L.H, g = L.grid, rnd = mulberryL(id.length * 977 + id.charCodeAt(0));
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const rooms = [L.arena, L.mini].filter(Boolean).map(A => [A.x0 / TS - 2, A.x1 / TS + 2, (A.y0 !== undefined ? A.y0 / TS : A.floor / TS - 16) - 1, A.floor / TS + 1]);
  const KEEP = new Set(['sign', 'check', 'npc', 'doorway', 'gate', 'lockgate', 'key', 'stray', 'silver', 'relic', 'shrine', 'cage', 'lever', 'vent', 'torch', 'brazier', 'lantern', 'mover', 'nest', 'deco', 'stormkite', 'winch', 'bell', 'weight', 'support', 'rod', 'felltree', 'sluice', 'crank', 'flagpost', 'barricade', 'sheet', 'balloon', 'sail']);
  const keep = L.ents.filter(e => KEEP.has(e.t)).map(e => [e.x, e.y]);
  const placed = [];
  const clear = (x, y) => keep.every(([kx, ky]) => Math.abs(kx - x) > 3 || Math.abs(ky - y) > 3) && placed.every(([px, py]) => Math.abs(px - x) > 7 || Math.abs(py - y) > 4);
  const wet = (x, y) => (L.pools || []).some(p => (p.shallow || p.harm) && x * TS >= p.x0 && x * TS <= p.x1 && y * TS + 8 > p.y - 2); // in a WADING pool, not by it: a fish trap wants a bank. Coral belongs under the sea, so a swim pool is not a reason to leave a floor bare
  const stoneAt = (x, y) => (L.stone || []).some(z => x >= z[0] - 1 && x <= z[1] + 1 && y >= z[2] - 1 && y <= z[3] + 1);
  // A PLANK IS A FLOOR ONLY WHEN SOMETHING IS UNDER IT. A one-tile bridge board reads as ground the same as a
  // mountain by this test, so the sprinkler dressed the Monastery's own rope bridge with a standing stone and a
  // stack of masonry over open sky (tools/floaters.mjs, "sand castles" - a heavy prop with nothing under it for
  // six rows reads as floating, not resting). A bridge over a short drop is still a floor; six is the Monastery's
  // own bell-tower floors' clearance plus two, so a real floor never trips it.
  const PLANK_DROP = 6;
  const plankFloats = (x, y) => { let d = 0, yy = y + 1; while (d < PLANK_DROP && at(x, yy) === T.AIR) { d++; yy++; } return d >= PLANK_DROP; };
  for (let y = 2; y < H - 1; y++) for (let x = 2; x < W - 2; x++) {
    // open ground three tiles wide with three rows of air over it
    let ok = true; for (let dx = -1; dx <= 1 && ok; dx++) { const b = at(x + dx, y + 1); if (b !== T.SOLID && b !== T.PLANK) ok = false; else if (b === T.PLANK && plankFloats(x + dx, y + 1)) ok = false; for (let dy = 0; dy < 3 && ok; dy++) if (at(x + dx, y - dy) !== T.AIR) ok = false; }
    /* L.noDress: boxes [x0, x1, y0, y1] in tiles that get nothing (a lamp gallery is a floor by the tile rule, and it grew a mooring post) */
    if (!ok || rnd() > (id === 'marsh' || id === 'moor' ? 0.4 : id === 'wood' || id === 'spore' ? 0.3 : 0.2) || wet(x, y) || stoneAt(x, y) || !clear(x, y) || (L.interiors || []).some(([a, b, c, d]) => x >= a - 1 && x <= b + 1 && y >= c - 7 && y <= d + 1) || rooms.some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d) || (L.noDress || []).some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d)) continue;
    const [kind, nv] = set[(rnd() * set.length) | 0], v = nv ? (rnd() * nv) | 0 : 0;
    if (HUNG_H[kind]) { const need = Math.ceil(HUNG_H[kind] / TS) + 2; let top = 0;
      for (let k = 3; k <= 10 && y - k >= 1; k++) if (at(x, y - k) !== T.AIR) { if (at(x, y - k) === T.SOLID && k >= need) top = y - k + 1; break; }
      if (!top || !clear(x, top) || !clear(x, top - 2)) continue;   /* clear where it HANGS too, and over it: the floor under a bell is not the bell */
      L.ents.push({ t: 'deco', x, y: top, kind, v, hang: true, dressed: true }); placed.push([x, y]); continue; }
    if (TALL_ROWS[kind]) { let room = true; for (let dy = 3; dy < TALL_ROWS[kind] && room; dy++) if (at(x, y - dy) !== T.AIR) room = false; if (!room) continue; }
    L.ents.push({ t: 'deco', x, y, kind, v, dressed: true }); placed.push([x, y]);
  }
  // AND THEN TAKE BACK ANYTHING THE LEVEL HAS SINCE BUILT OVER. The sprinkler only lays dressing on open
  // ground, but a level can stack crates or raise a palisade on that ground afterwards, and the skull pile
  // ends up inside the crate. (The playtest bot found one in the stockade.)
  L.ents = L.ents.filter(e => !e.dressed || at(e.x, e.y) === T.AIR);
  // TWO OF THE SAME CREATURE ON THE SAME TILE is a copy-paste, never a design: one of them is invisible
  // behind the other and the room is a creature heavier than it reads.
  { const seen = new Set();
    L.ents = L.ents.filter(e => { if (!/^(sprig|spit|wasp|hopper|shield|archer|thorn|soldier|javelin|heavy|brute|sapper|hound|pike|cutlass|boarder|marine|watch|wight|snuffer|cutter|sentry|rockgoblin|miner|goat|harpy|crab|scout|eel|urchin|angler|siren|sailor|netter|petrel)$/.test(e.t)) return true;
      const k = e.t + '@' + e.x + ',' + e.y; if (seen.has(k)) return false; seen.add(k); return true; }); }
  return L;
}
const mulberryL = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
/* ============ AMBUSH ROOMS ============
   Where a level means to jump you, in its FINAL coordinates (after every grow and graft - read them off the built grid):
   the two gate columns, the row the floor stands on, and waves of [creature, x, y?, extra]. Wave one is the crowd; wave
   two is LED BY AN ELITE of the level's own roster ([kind, x, y, { elite: true }]: bigger, with moves of its own), and
   its moves are the lesson - with fewer bodies beside it, so the room still clears in twenty to forty seconds. The room is emptied of its creatures when it is built,
   so it reads as a quiet yard until it shuts, and a checkpoint goes at its door: die inside and you wake outside, with
   the room put back. check: [x, y] places that checkpoint by hand; false when one already stands at the door. The engine
   is updateAmbush in src/main.js, and section Q of RULES-LEVELS-AND-BOSSES.md says what makes a good one. */
const AMBUSH = {
  wood: [{ name: 'THE BRAMBLE RIDE', row: 11, wallL: 288, wallR: 325, check: [278, 11],   /* (every column here is 78 past what it was: THE THREE LESSONS grew the wood ahead of the giant) */
    waves: [[['sprig', 294], ['sprig', 321], ['thorn', 308], ['badger', 300]], [['shield', 316], ['spit', 322], ['thorn', 294], ['crow', 306, 6]]] }],
  marsh: [{ name: 'THE REED ISLAND', row: 17, wallL: 371, wallR: 389, check: false,
    waves: [[['hopper', 386], ['turtle', 380]], [['thorn', 384], ['archer', 387], ['heronfoe', 381], ['spit', 373]]] }],
  stockade: [{ name: 'THE KENNEL YARD', row: 19, wallL: 170, wallR: 209, check: [167, 16],
    waves: [[['sprig', 176], ['sprig', 203], ['hound', 196], ['hound', 182]], [['shield', 195], ['archer', 201, null, { elite: true }], ['sapper', 184]]] }],
  spore: [{ name: 'THE UNDERCAP', row: 19, wallL: 135, wallR: 170, check: [132, 19],
    waves: [[['sporeling', 142], ['sporeling', 163], ['lurker', 152]], [['shield', 160], ['spitcap', 166], ['weaver', 146], ['sporeling', 140]]] }],
  kings: [{ name: "THE KING'S ROAD", row: 13, wallL: 277, wallR: 308, check: [274, 12],
    waves: [[['thief', 282], ['thief', 303], ['sprig', 292], ['hound', 286]], [['shield', 296, null, { elite: true }], ['archer', 305], ['hound', 286]]] }],
  scree: [{ name: 'THE GOAT TRACK', row: 13, wallL: 173, wallR: 202, check: [168, 13],
    waves: [[['goat', 178], ['goat', 198], ['sprig', 191], ['harpy', 185, 8]], [['shield', 193], ['archer', 199], ['troll', 180], ['rockgoblin', 186]]] }],
  hanging: [{ name: 'THE CLIFF HALL', row: 65, wallL: 43, wallR: 69, y0: 56, check: false,
    waves: [[['sprig', 48], ['sprig', 65], ['snuffer', 58]], [['brute', 57, null, { elite: true }], ['archer', 66], ['cutter', 49]]] }],
  spire: [{ name: 'THE CLOISTER', row: 99, wallL: 40, wallR: 74, check: false,
    waves: [[['fledgling', 46], ['fledgling', 66], ['rockgoblin', 56], ['bat', 52, 94]], [['rockgoblin', 64], ['troll', 48], ['harpy', 56, 93], ['fledgling', 68]]] }],
  moor: [{ name: 'THE CAIRN RIDGE', row: 13, wallL: 596, wallR: 633,
    waves: [[['goat', 602], ['goat', 628], ['rockgoblin', 615], ['crow', 612, 7]], [['rockgoblin', 626], ['troll', 604, null, { elite: true }], ['goat', 620]]] }],
  storm: [{ name: 'THE HEARTH HALL', row: 31, wallL: 98, wallR: 152, check: false,
    waves: [[['sprig', 104], ['sprig', 146], ['hearthgob', 128], ['cutter', 117]], [['shield', 140], ['archer', 148], ['pike', 126, null, { elite: true }]]] }],
  longwater: [{ name: 'THE SLUICE BRIDGE', row: 26, wallL: 293, wallR: 339, check: false,
    waves: [[['scout', 297], ['scout', 336], ['crab', 316, 25], ['crab', 324, 25]], [['tideguard', 330, 25], ['scout', 336], ['netter', 298], ['heronfoe', 316, 25]]] }],
  flotilla: [{ name: 'THE WAIST', row: 23, wallL: 62, wallR: 92, check: [57, 23],
    waves: [[['cutlass', 66], ['cutlass', 88], ['scout', 76], ['crab', 83]], [['boarder', 84], ['marine', 90], ['bosun', 68], ['cutlass', 75]]] }],
  /* THE DROWNED CHAPEL: the doors are the gates (the door columns under the two walls), its floor is over the high water */
  causeway: [{ name: 'THE DROWNED CHAPEL', row: 19, wallL: 265, wallR: 297, check: false,
    waves: [[['sailor', 270], ['sailor', 292], ['crab', 281], ['netter', 276]], [['tideguard', 288], ['scout', 293], ['sailor', 272], ['crab', 284]]] }],
  /* ONE ROOM A LEVEL. Three levels had two, and the second was the same lesson again a few minutes on. Kept: THE WEATHER DECK
     (the Hurricane's middle, out in the level's own storm with the rail and the sea to throw them over; THE ORLOP was a flat hold
     at the start, twenty tiles past the Boarding Master's gate - back to back with a fight). THE LAMP ISLAND (a quay under a
     lamp with the river under it; THE STORM DRAIN was a dark tunnel, a corridor where the tells are hardest to read). THE
     MARKET HALL (a hall with a gallery over it; THE HORSE FAIR sent a mounted lancer in a hundred tiles before the level's own
     mini, THE LANCER). The cut rooms are ground again: the creatures the level placed in them stand where they were put. */
  hurricane: [{ name: 'THE WEATHER DECK', row: 18, wallL: 389, wallR: 427, check: false,
    waves: [[['sailor', 394], ['cutlass', 422], ['scout', 408]], [['boarder', 414], ['marine', 422], ['bosun', 396], ['lookout', 404]]] }],
  lamplit: [{ name: 'THE LAMP ISLAND', row: 21, wallL: 481, wallR: 519, check: false,
    waves: [[['scout', 486], ['scout', 514], ['wight', 500], ['crab', 492]], [['tideguard', 506], ['scout', 514], ['watch', 488], ['snuffer', 498]]] }],
  waymeet: [{ name: 'THE MARKET HALL', row: 35, wallL: 95, wallR: 123, check: [91, 35],
    waves: [[['swornsword', 100], ['runner', 118], ['swornsword', 110], ['hedgeknight', 114]], [['swornsword', 112], ['crossbow', 119], ['swornsword', 100], ['hedgeknight', 106]]] }],
};
/* THE ROOM'S OWN MACHINERY STAYS: a firepit, a hanging ram or a rockfall is a hazard to knock them into, not a creature */
const AMB_KEEP = new Set(['rockfall', 'catapult', 'towertop', 'dropcage', 'firepit', 'firevent', 'hotplate', 'hammer', 'skybolt', 'sweep', 'bale', 'ram', 'gas', 'timber', 'minerlamp', 'ballast']);
function ambushRooms(L, id) {
  const list = (L.ambushes || []).concat(AMBUSH[id] || []); if (!list.length) return L;
  L.ambushes = list.map(A=>singleAmbush(A,id));   /* a copy per build: the run's state lives on it */
  for (const A of L.ambushes) {
    const y0 = A.y0 !== undefined ? A.y0 : A.row - 9, inRoom = (e, pad) => e.x >= A.wallL - pad && e.x <= A.wallR + pad && e.y >= y0 && e.y <= A.row + 2;
    L.ents = L.ents.filter(e => !(e.t === 'check' ? inRoom(e, 1) : THREAT[e.t] > 0 && !AMB_KEEP.has(e.t) && !e.boss && !e.mini && !e.stays && inRoom(e, 0)));   /* stays: a creature that belongs to the room's ground, not to its ambush */
    if (A.check !== false) { const [cx, cy] = A.check || [A.wallL - 3, A.row]; L.ents.push({ t: 'check', x: cx, y: cy }); }
  }
  return L;
}
/* ============ THE ELITES ============
   "Maybe add some elite enemies in levels that you need to kill to progress?" An elite is an ordinary creature of the
   level's own roster stood somewhere with room to fight it: three times the health, a heavier bar, a gold trim, a name
   and ONE rule of its own (the ELITE table in src/main.js). [creature, x, y, { gate }] in the level's FINAL columns. An
   ent already of that kind within three tiles on the same row is made the elite (it keeps its place in the crowd); none
   there and one is put down. `gate` is a column the elite HOLDS: a portcullis across the route that is down until it
   dies, by any means - a blade, a drop, a spike. Every level with no mini has one. Never in a boss or mini room or an
   ambush room, never at a landing. tools/elites.mjs checks that the elite can be reached with its gate shut, that the
   gate actually holds the route, and that nothing counted stands in the gate. */
const ELITES = {
  /* and the same four had no elite either: every other level has its one big fight on the way to the boss */
  burning: [['brute', 386, 25, { face: -1, gate: 398 }]],   /* THE BARN CAPTAIN holds the barn's far door */
  harbor: [['bosun', 292, 29, { face: -1 }], ['marine', 700, 25, { face: -1 }]],
  keep: [['wight', 247, 58, { face: -1 }], ['tideguard', 590, 58, { face: -1 }]],   /* the inner keep starts at KEEP_APPROACH (560) */
  burial: [['husk', 300, 33, { face: -1 }], ['wight', 396, 31, { face: -1 }], ['husk', 950, 31, { face: -1 }]],   /* (the wight left the Falling Gallery's road, walled up in batch 4b, for the Grave Causeway before its green water) */
  oreroad: [['heavy', 455, 12, { face: -1, gate: 472 }]],   /* THE ORE ROAD: the drum yard's foreman holds the last gate onto the drum house's deck (the rework of 2026-09-25 moved the whole level east, so his column moved with it) */
  witchlight: [['husk', 108, 76, { face: -1 }], ['armour', 286, 34, { face: -1 }]],   /* the redesign: the second pier's captain calls up the gorge's dead; the warden armour on the tall hedge guards its silver */
  fallingtower: [['armour', 28, 215, { face: -1 }], ['husk', 52, 146, { face: -1 }], ['armour', 38, 119, { face: 1, gate: 30 }]],   /* the ascent (2026-09-21): the orrery's guard, the cistern's husk over the poison, and the bell loft's warden, whose gate shuts the way to the first lift. The orrery moved 36 rows up when the Reading Room and the Pendulum Gallery went in (2026-09-22) and its guard came with it; the cistern and the loft did not move. The husk sits ON the cistern's own first-tier husk, so it is UPGRADED, not added: one husk in the tower, and it is this one. */
  wood: [['shield', 147, 21, { gate: 157 }]],
  marsh: [['thorn', 65, 15, { gate: 72 }]],
  stockade: [['brute', 302, 19, { gate: 317 }]],
  spore: [['shield', 412, 13, { gate: 430 }]],
  kings: [['brute', 433, 20]],
  scree: [['troll', 403, 18, { gate: 414 }]],
  hanging: [['shield', 85, 107]],
  /* THE MONASTERY keeps the Temple Guardian in its hall, so neither of its two holds a gate. Both stand on a floor the
     level walks the LENGTH of, and neither stands at the trapdoor either end of it: a crag troll loose in the
     scriptorium, on the long walk from the trapdoor at 73-77 to the prayer wheel at 47, and the herd billy out on the
     shrines' ledge above the cloud, clear of the way up at 31-37, the cellar at 81-89 and the bellows at 14 */
  spire: [['troll', 61, 171], ['goat', 62, 79]],
  moor: [['goat', 168, 21, { gate: 200 }], ['troll', 432, 13]],
  storm: [['pike', 250, 29, { gate: 257 }]],
  /* HIGHCROWN has the Forgemaster's armoury, so neither holds a gate: the King's Champion alone in the siege yard (clear of
     its winch), and the Hearth Boss rallying his cooks in the keep's kitchen. The Leads' alarm gate at 792 is left alone */
  crown: [['heavy', 208, 63], ['hearthgob', 710, 51]],
  longwater: [['tideguard', 419, 26, { gate: 427 }]],
  reef: [['tideguard', 355, 25, { gate: 361 }]],   /* on the dry ledge out of the last of the water, holding the climb to the wreck */
  flotilla: [['boarder', 162, 21, { gate: 175 }]],
  hurricane: [['boarder', 38, 19, { gate: 46 }], ['cutlass', 456, 18]],   /* the only column on the ship a gate holds is the passage out of the cabin: everything past it has three ways round */
  lamplit: [['watch', 595, 21]],
  deep: [['watch', 30, 27, { gate: 41 }]],
  causeway: [['tideguard', 66, 23, { gate: 79 }]],
  waymeet: [['hedgeknight', 465, 35], ['heavy', 548, 35]],
  fields: [['scarecrow', 230, 33]],
  mage: [['armour', 408, 39]],
};
/* THE GATE AN ELITE HOLDS, the same shape as an ambush room's (ambushWall in main.js): it stands on its own column's floor
   near the elite's row, up to a ceiling or ten tiles, and a floor you can drop through under it is shut too. One function,
   read by the game when it lays the gate and by tools/elites.mjs when it checks it. */
export function eliteGate(L, col, row) {
  const at = (x, y) => (x < 0 || x >= L.W) ? T.SOLID : (y < 0 || y >= L.H) ? T.AIR : L.grid[y * L.W + x];
  let bot = row; while (bot > row - 4 && at(col, bot) !== T.AIR) bot--;
  while (bot < row + 6 && at(col, bot + 1) === T.AIR) bot++;
  let top = bot; while (top > bot - 9 && top > 0 && at(col, top - 1) === T.AIR) top--;
  const sill = [T.ONEWAY, T.RAIL, T.PLANK].includes(at(col, bot + 1)) ? bot + 1 : -1;
  return { col, top, bot, sill };
}
function elites(L, id) {
  for (const [t, x, y, o] of ELITES[id] || []) {
    const was = L.ents.find(e => e.t === t && e.y === y && Math.abs(e.x - x) <= 3 && !e.mini && !e.boss && !e.elite);
    if (was) Object.assign(was, { x, elite: true }, o || {}); else L.ents.push(Object.assign({ t, x, y, face: -1, elite: true }, o || {}));
  }
  return L;
}
/* ============ EVERY DEAD END PAYS ============
   "Whenever there's a dead end like this, like in the deep, there needs to be some type of collectible." Every pocket
   src/deadends.js finds (a walk that runs five tiles or more past its last way on to a wall - on land, under water or up
   high) with nothing at its far end gets a CACHE there, on the built level, after the gold and before the dressing: coins
   packed against the end, a heart that waits for you when the pocket is long, wet or spiked, and the level's own stash
   prop on its last floor. Never a silver (three a level, the ledger reads three bits) and never a quest item (counted).
   The check is tools/deadends.mjs, and the rule is section R of RULES-LEVELS-AND-BOSSES.md. */
const STASH = { oreroad: 'lootHeap', witchlight: 'coffer', burning: 'barrels', mage: 'coffer', fields: 'stump', wood: 'stump', marsh: 'stump', spore: 'mushroom', hunt: 'stump', stockade: 'lootHeap', kings: 'lootHeap', storm: 'lootHeap', crown: 'lootHeap', underleaf: 'lootHeap', undercrown: 'lootHeap', quarry: 'lootHeap',
  scree: 'cairn', spire: 'shrine', moor: 'cairn', frost: 'cairn', hanging: 'barrels', waymeet: 'barrels',
  longwater: 'tributeChest', reef: 'seaChest', deep: 'seaChest', keep: 'seaChest', lamplit: 'seaChest', flotilla: 'plunder', hurricane: 'plunder', skyship: 'plunder' };
const STASH_V = { lootHeap: 2, plunder: 3, stump: 2, mushroom: 2 };
function payDeadEnds(L, id) {
  const owed = findDeadEnds(L, T).pockets.filter(p => !p.paid); if (!owed.length) return L;
  const W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
  /* NOT IN A POOL THAT KILLS, not on or under spikes, and not on top of anything the level put down on purpose */
  const deadly = (L.pools || []).filter(p => !p.shallow && !p.swim && !p.dry);
  const drowns = (x, y) => deadly.some(p => x * TS + 8 > p.x0 && x * TS + 8 < p.x1 && (y + 1) * TS > p.y + 9);
  const HELD = new Set(['sign', 'check', 'npc', 'doorway', 'gate', 'lockgate', 'key', 'stray', 'silver', 'relic', 'shrine', 'cage', 'lever', 'vent', 'torch', 'brazier', 'lantern', 'mover', 'nest', 'winch', 'crank', 'bell', 'ballast']);
  const held = L.ents.filter(e => HELD.has(e.t));
  const busy = new Set(L.ents.filter(e => e.t === 'coin' || e.t === 'mend').map(e => e.x + ',' + e.y));
  const free = (x, y) => at(x, y) === T.AIR && at(x, y - 1) !== T.SPIKE && at(x, y + 1) !== T.SPIKE && !busy.has(x + ',' + y) && !drowns(x, y) && !held.some(e => Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1);
  const put = (t, x, y, o) => { L.ents.push(Object.assign({ t, x, y, stash: true }, o || {})); if (t !== 'deco') busy.add(x + ',' + y); };
  /* A CURRENT TAKES LOOSE GOLD (main.js drifts every coin in a flowing swim pool, and nothing stops it at rock): a cache at
     the end of a pocket in the Reef's current slid into the wall it was laid against. Gold goes only in still water; a
     pocket whose end is in a current is paid with the heart, which stays where it is put. */
  const flowing = (x, y) => (L.pools || []).some(q => q.flow && q.swim && !q.dry && x * TS + 8 > q.x0 && x * TS + 8 < q.x1 && (y + 1) * TS - 6 > q.y);
  const coinOk = (x, y) => free(x, y) && !flowing(x, y);
  for (const p of owed) {
    const zone = p.zone.filter(([x, y]) => free(x, y));
    /* THE PRICE OF THE WALK: five coins, and one more at twelve tiles, twenty and thirty-two; a heart for a long one, a swim, spikes or a current */
    const n = 5 + (p.len >= 12) + (p.len >= 20) + (p.len >= 32), heart = p.len >= 20 || p.danger || (p.kind === 'water' && p.len >= 12) || p.zone.some(([x, y]) => flowing(x, y));
    /* the last floor (or bed) before the wall takes the prop and the heart - when the end is all rope there is none, and the
       gold still goes beside it below */
    const tip = zone.find(([x, y]) => at(x, y + 1) !== T.AIR && at(x, y + 1) !== T.SPIKE) || zone[0];
    if (tip) { const [tx, ty] = tip, kind = STASH[id];
      /* ROOM FOR THE CHEST: a chest or a plunder heap is wider than its tile and taller than a coin, so laid hard against the end wall
         (or under a deck's low beams) it was drawn through the rock. It takes the first floor back from the end with a clear tile
         either side and a clear row over all three; no such floor, no prop - the gold and the heart still pay */
      const roomy = (x, y) => [-1, 0, 1].every(dx => at(x + dx, y) === T.AIR && at(x + dx, y - 1) === T.AIR) && (at(x, y + 1) === T.SOLID || at(x, y + 1) === T.PLANK) && at(x - 1, y + 1) !== T.AIR && at(x + 1, y + 1) !== T.AIR;
      const spot = kind && zone.find(([x, y]) => roomy(x, y) && !L.ents.some(e => e.t === 'deco' && Math.abs(e.x - x) <= 1 && Math.abs(e.y - y) <= 1));
      if (spot) put('deco', spot[0], spot[1], { kind, v: (spot[0] + spot[1]) % (STASH_V[kind] || 1) });
      /* THE HEART BESIDE THE CHEST, NOT IN IT: laid on the prop's own tile the chest was drawn over it. The next floor back
         from the end, or the tile over the prop */
      if (heart) { const by = zone.find(([x, y]) => x !== tx && at(x, y + 1) !== T.AIR && at(x, y + 1) !== T.SPIKE);
        if (by) put('mend', by[0], by[1]); else if (free(tx, ty - 1)) put('mend', tx, ty - 1); else put('mend', tx, ty); } }
    /* packed against the end, nearest the wall first: two high on land, a block under water */
    let laid = 0;
    for (const [x, y, wet] of zone) for (const yy of wet ? [y] : [y, y - 1]) if (laid < n && coinOk(x, yy)) { put('coin', x, yy); laid++; }
    /* AND BESIDE IT, where the end is a rope: a rung is not air, so a chimney or a shaft that ends on its own rope had
       nowhere to take gold - the air a step to either side is in reach from the rope */
    for (const [x, y] of p.zone) for (const [dx, dy] of [[1, 0], [-1, 0], [1, -1], [-1, -1]]) if (laid < n && coinOk(x + dx, y + dy)) { put('coin', x + dx, y + dy); laid++; }
  }
  return L;
}

export const BRIDGE_STANDING = new Set(['deco','torch','brazier','lantern','firepit','sign','npc','check','bell','carpet']);
export function bridgeSpanUnder(L,e) {return (L.ents||[]).find(b=>b.t==='bridge' && e!==b && e.x>=b.x && e.x<=(b.x1??b.x) && Math.abs(e.y+1-b.y)<0.01);}
function bankBridgeProps(L) {
  for(const e of L.ents){if(!BRIDGE_STANDING.has(e.t)||e.hang||e.perch)continue;const b=bridgeSpanUnder(L,e);if(!b)continue;
    let best=null,dist=Infinity;
    for(const edge of [b.x-2,(b.x1??b.x)+2])for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){
      const x=edge+dx,y=e.y+dy;if(x<1||x>=L.W-1||y<1||y>=L.H-1)continue;
      if(L.grid[y*L.W+x]!==T.AIR||![T.SOLID,T.ONEWAY].includes(L.grid[(y+1)*L.W+x])||bridgeSpanUnder(L,{x,y}))continue;
      const d=Math.abs(x-e.x)+Math.abs(y-e.y)*3;if(d<dist){best={x,y};dist=d;}}
    if(best)Object.assign(e,best);
  }return L;
}

for (const lv of LEVELS) if (!lv.hidden || lv.secret) { const b = lv.build, id = lv.id; lv.build = () => { const L = b(); if (REVIEW[id]) REVIEW[id](L); return polishTower(hauntedCoast(stormShipPolish(polishCoastAndTown(bankBridgeProps(dressLevel(payDeadEnds(sprinkleCoins(silverTrim(checkpoints(elites(garrison(ambushRooms(L, id), id), id)))), id), id)),id,T),id,T),id,T),id,T); }; }
// The editor puts its document here. Nothing else writes to it, and with no editor open it hands
// back an empty room, so LEVELS is always safe to build.
export const CUSTOM = { build: () => ({ W: 40, H: 28, grid: new Uint8Array(40 * 28), ents: [], START: { x: 3, y: 19 }, pools: [], falls: [], moversExtra: [], interiors: [], palette: {}, duskStart: -1, duskLen: 1 }) };

/* EVERY CHECKPOINT STANDS ON FLOOR (Daniel, 2026-09-23: "the checkpoints should be grounded properly"). A checkpoint is a
   marker three tiles wide at its foot; placed on a ledge's last tile it hung half over air - sixteen did, in twelve levels,
   because a stretch or a later edit moved the floor out from under them. Fix the rule, not the rows: when any level is
   built, a checkpoint whose three tiles underfoot are not all floor slides to the nearest spot within three columns
   where they are (and where it is not inside rock). tools/checkpoints.mjs asserts the result for every level. */
export const CHECK_FLOORLESS = new Set([T.AIR, T.SPIKE, T.CLIMB, T.WEB, T.BOUNCER]);
export const CHECK_BLOCKED = new Set([T.SOLID, T.CRATE, T.PALISADE, T.ICE, T.SOFT, T.CRYST, T.SHELF]);
/* the marker's foot is narrower than a tile, so the rule is: the tile under its centre is floor and so is one beside it,
   and it is not standing inside anything solid. Where a full three tiles of floor is within three columns, it goes there. */
export function checkStands(L, x, y, strict) {
  const at = (cx, cy) => (cx < 0 || cy < 0 || cx >= L.W || cy >= L.H) ? T.SOLID : L.grid[cy * L.W + cx], fl = cx => !CHECK_FLOORLESS.has(at(cx, y + 1));
  if (CHECK_BLOCKED.has(at(x, y)) || !fl(x)) return false;
  /* a spot it may MOVE to must also have room for its body: nothing solid in the three columns across its two rows
     (the Lamplit Street's slid one onto floor beside a wall step and ran 14 px into the masonry - tools/headless floats) */
  if (strict && (at(x, y) !== T.AIR || at(x, y - 1) !== T.AIR || [-1, 1].some(d => CHECK_BLOCKED.has(at(x + d, y))))) return false;   /* its body is two rows tall: both must be open air where it moves to (a one-way plank above counts - the Lamplit Street's lamp came up through one) */
  return strict ? fl(x - 1) && fl(x + 1) : fl(x - 1) || fl(x + 1);
}
export function groundCheckpoints(L) {
  if (!L || !L.grid || !L.ents) return L;
  for (const e of L.ents) { if (e.t !== 'check' || checkStands(L, e.x, e.y, true)) continue;
    let moved = false; for (const d of [1, -1, 2, -2, 3, -3]) if (checkStands(L, e.x + d, e.y, true)) { e.x += d; moved = true; break; }
    if (!moved && !checkStands(L, e.x, e.y, false)) for (const d of [1, -1, 2, -2, 3, -3]) if (checkStands(L, e.x + d, e.y, false) && L.grid[e.y * L.W + e.x + d] === T.AIR && L.grid[(e.y - 1) * L.W + e.x + d] === T.AIR) { e.x += d; break; } }
  return L;
}
for (const lv of LEVELS) { const b = lv.build; if (typeof b === 'function') lv.build = (...a) => groundCheckpoints(b(...a)); }
