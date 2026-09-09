// level.js — the forest slice, authored with a tiny paint DSL over a tile grid.
export const W = 206, H = 28, TS = 16;
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
const acorns = (...pts) => pts.forEach(([x, y]) => ent('acorn', x, y));

// ---- 1. Glade: learn to move, jump, swing ----
floor(0, 30, 22);
ent('sign', 5, 21, { text: 'ARROWS/WASD MOVE   Z JUMP   X SWING' });
acorns([12, 20], [13, 19], [14, 20]);
ent('sprig', 22, 21, { face: -1 });
// pit 31-33
floor(34, 49, 22);
acorns([31, 19], [32, 18], [33, 19]);
crate(40, 21); crate(44, 21); crate(44, 20);
ent('sprig', 47, 21, { face: -1 });
// pit 50-52
floor(53, 84, 22);
acorns([50, 19], [51, 18], [52, 19]);

// ---- 2. Spitter ledge, then the shieldbearer step ----
block(58, 63, 20, 21);
ent('spit', 58, 19, { face: -1 });
ent('acorn', 62, 19);
block(66, 75, 20, 21);
ent('shield', 71, 19, { face: -1 });
plat(64, 18, 6);
acorns([66, 17], [68, 17]);
ent('sign', 78, 21, { text: 'DOWN+X IN THE AIR: PLUNGE.  BOUNCE OFF FOES.' });
ent('check', 82, 21);

// ---- 3. Wasp pit: pogo chain ----
ent('wasp', 87, 20); ent('wasp', 90, 20); ent('wasp', 93, 20); ent('wasp', 96, 20);
floor(98, 120, 22);
acorns([99, 20], [100, 19], [101, 20]);
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
acorns([124, 17], [128, 15], [124, 13]);

// ---- 5. Plateau ----
block(130, 160, 12, H - 1);
ent('check', 133, 11);
acorns([136, 10], [138, 10], [140, 10]);
block(144, 146, 10, 11);
ent('spit', 145, 9, { face: -1 });
ent('wasp', 145, 7);
ent('thorn', 153, 11, { face: -1 });
crate(157, 11);
// mover gap 161-171
ent('mover', 161, 12, { len: 3, range: 8 });
acorns([164, 9], [167, 9]);

// ---- 6. Arena and gate ----
block(172, W - 1, 12, H - 1);
ent('thorn', 178, 11, { face: -1 });
ent('shield', 184, 11, { face: -1 });
ent('sprig', 189, 11, { face: -1 });
ent('thorn', 196, 11, { face: -1 });
block(191, 194, 9, 11);
ent('spit', 192, 8, { face: -1 });
plat(186, 8, 4);
acorns([176, 9], [187, 7], [188, 7]);
ent('gate', 201, 11);

export const START = { x: 3, y: 21 };
export const LEVEL = { W, H, grid, ents, START };
export const tileAt = (tx, ty) => (tx < 0 || tx >= W) ? T.SOLID : (ty < 0 || ty >= H) ? T.AIR : grid[ty * W + tx];
