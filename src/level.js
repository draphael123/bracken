// level.js — the forest slice, authored with a tiny paint DSL over a tile grid.
export const W = 274, H = 28, TS = 16;
export const T = { AIR: 0, SOLID: 1, ONEWAY: 2, SPIKE: 3, CRATE: 4 };

const grid = new Uint8Array(W * H);
const ents = [];
const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
const floor = (x0, x1, top) => block(x0, x1, top, H - 1);
const block = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); };
const plat = (x, y, len) => { for (let i = 0; i < len; i++) set(x + i, y, T.ONEWAY); };
const spikes = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); };
const crate = (x, y) => set(x, y, T.CRATE);
const ent = (t, x, y, extra = {}) => ents.push({ t, x, y, ...extra });
const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));

// ---- 1. Glade: learn to move, jump, swing ----
floor(0, 30, 22);
ent('sign', 5, 21, { text: 'ARROWS/WASD MOVE   Z JUMP   X SWING' });
coins([12, 20], [13, 19], [14, 20]);
ent('sprig', 22, 21, { face: -1 });
// pit 31-33
floor(34, 49, 22);
coins([31, 19], [32, 18], [33, 19]);
crate(40, 21); crate(44, 21); crate(44, 20);
ent('sprig', 47, 21, { face: -1 });
// pit 50-52
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
plat(119, 20, 3);
plat(123, 18, 3);
plat(127, 16, 3);
plat(123, 14, 3);
plat(127, 12, 3);
coins([124, 17], [128, 15], [124, 13]);

// ---- 5. Plateau ----
block(130, 160, 12, H - 1);
ent('check', 133, 11);
coins([136, 10], [138, 10], [140, 10]);
block(144, 146, 10, 11);
ent('spit', 145, 9, { face: -1 });
ent('wasp', 145, 7);
ent('thorn', 153, 11, { face: -1 });
crate(157, 11);
// mover gap 161-171
ent('mover', 161, 12, { len: 3, range: 8 });
coins([164, 9], [167, 9]);

// ---- 6. Arena ----
block(172, 199, 12, H - 1);
ent('thorn', 178, 11, { face: -1 });
ent('shield', 184, 11, { face: -1 });
ent('sprig', 189, 11, { face: -1 });
ent('thorn', 196, 11, { face: -1 });
block(191, 194, 9, 11);
ent('spit', 192, 8, { face: -1 });
plat(186, 8, 4);
coins([176, 9], [187, 7], [188, 7]);

// ---- 7. The hollow: a drop, a stream, a shrine ----
block(200, 214, 15, H - 1);
ent('sprig', 206, 14, { face: -1 });
coins([203, 13], [209, 12], [212, 13]);
// stream gap 215-217
block(218, 234, 15, H - 1);
coins([215, 12], [216, 11], [217, 12]);
ent('check', 221, 14);
ent('thorn', 228, 14, { face: -1 });
crate(232, 14); crate(232, 13);

// ---- 8. The ridge: log climb under fire, a wasp gap, the last stand ----
plat(236, 13, 3);
plat(240, 11, 3);
coins([237, 12], [241, 10]);
block(243, 250, 9, H - 1);
ent('spit', 244, 8, { face: 1 });
// wasp gap 251-254
ent('wasp', 252, 7); ent('wasp', 254, 7);
block(255, W - 1, 9, H - 1);
ent('shield', 259, 8, { face: -1 });
ent('thorn', 265, 8, { face: -1 });
plat(262, 5, 4);
coins([257, 7], [263, 4], [264, 4]);
ent('gate', 270, 8);

export const START = { x: 3, y: 21 };
export const LEVEL = { W, H, grid, ents, START };
export const tileAt = (tx, ty) => (tx < 0 || tx >= W) ? T.SOLID : (ty < 0 || ty >= H) ? T.AIR : grid[ty * W + tx];
