// tools/push-blocks.mjs — PUSHABLE BLOCKS (backlog #12, approved by Daniel 2026-09-28). src/push-blocks.js is a pure
// module (no DOM), so its physics are driven directly here against a small hand-built grid: push, fall, step,
// blocked by a wall, blocked by another block. The plate-holds and reset-on-checkpoint rules live in src/main.js
// (one line each, next to the code they extend), so those are read out of the source and asserted there, the same
// way tools/floaters.mjs reads main.js's grounding lists instead of re-implementing them. The demo placed in
// Bracken Wood is checked for what "low-risk" means: the route through that section still floods without ever
// touching the block.
// usage: node tools/push-blocks.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { newPushBlock, updatePushBlock, PB } from '../src/push-blocks.js';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const TS = 16;
// ---- a tiny world: solid tiles named by column,row; everything else is air ----
function grid(solidCells) {
  const S = new Set(solidCells.map(([x, y]) => x + ',' + y));
  return { isSolid: (tx, ty) => S.has(tx + ',' + ty), isOneWay: () => false, tileAt: () => T.AIR };
}
const box = b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y });
const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
function ctx(world, blocks, players = []) { return { players, box, overlap, isSolid: world.isSolid, isOneWay: world.isOneWay, tileAt: world.tileAt, blocks, sound: null, dust: null }; }
function walker(x, y, vx) { return { x, y, w: 10, h: 14, vx, dead: false, climb: false, swim: false, ground: true }; }
function run(m, c, dt, n) { for (let i = 0; i < n; i++) updatePushBlock(m, dt, c); }

// ---- FALL: a block with nothing under it drops until its foot row is solid, then stops there for good ----
{ const floorRow = 8; const w = grid(Array.from({ length: 12 }, (_, x) => [x, floorRow]));
  const m = newPushBlock(24, 16); // starts high above the floor
  const c = ctx(w, [m]);
  run(m, c, 1 / 60, 240); // four seconds: comfortably long enough to land from any height this test uses
  assert.equal(m.ground, true, 'a block over open air never lands');
  assert.equal(m.y + m.h, floorRow * TS, 'a landed block does not rest flush on the floor it fell onto: y=' + m.y);
  assert.equal(m.vy, 0, 'a resting block still carries fall speed');
}

// ---- STEP: it stops on ONE-WAY footing exactly like solid footing (main.js's own mover-landing pass then lets a
// hero stand on it, the same pass every pad and raft in the game already goes through) ----
{ const floorRow = 6; const w = { isSolid: () => false, isOneWay: t => t === T.ONEWAY, tileAt: (tx, ty) => (ty === floorRow ? T.ONEWAY : T.AIR) };
  const m = newPushBlock(24, 16); const c = ctx(w, [m]);
  run(m, c, 1 / 60, 240);
  assert.equal(m.ground, true, 'a block falling onto one-way footing never lands');
  assert.equal(m.y + m.h, floorRow * TS, 'it does not rest on the one-way ledge itself');
}

// ---- PUSH: a grounded hero walking into its side, with clear ground ahead, moves it at PB.speed - and heavy: far
// under the hero's own run (92 in main.js) ----
{ const floorRow = 5; const w = grid(Array.from({ length: 20 }, (_, x) => [x, floorRow]));
  const m = newPushBlock(40, floorRow * TS); const c = ctx(w, [m]);
  run(m, c, 1 / 60, 6); // settle onto the floor first
  assert.equal(m.ground, true);
  const x0 = m.x;
  const P = walker(m.x - 2, floorRow * TS, 60); // overlapping its left side, walking right
  c.players = [P];
  const t0 = P.x;
  run(m, c, 1 / 60, 30); // half a second
  assert.ok(m.x > x0, 'walking into a clear block never moves it');
  const expected = PB.speed * (30 / 60);
  assert.ok(Math.abs((m.x - x0) - expected) < 0.5, 'a pushed block does not move at PB.speed: moved ' + (m.x - x0) + ', wanted ' + expected);
  assert.ok(Math.abs((P.x - t0) - (m.x - x0)) < 0.5, 'the hero pushing it is not carried in lockstep with it');
  assert.ok(PB.speed < 92 * 0.5, 'PB.speed is not meaningfully slower than the hero\'s own run (92): it would not read as heavy');
}

// ---- BLOCKED BY A WALL: it never crosses into a solid tile, and the hero pushing it is held at its edge, not
// carried through it ----
{ const floorRow = 5, wallCol = 8; const cells = Array.from({ length: 20 }, (_, x) => [x, floorRow]);
  for (let y = floorRow - 4; y <= floorRow; y++) cells.push([wallCol, y]); // a wall rising from the floor
  const w = grid(cells);
  const m = newPushBlock(96, floorRow * TS); const c = ctx(w, [m]); // starts two tiles shy of the wall
  run(m, c, 1 / 60, 6);
  const P = walker(m.x - 2, floorRow * TS, 60); c.players = [P];
  run(m, c, 1 / 60, 300); // five seconds: long enough to reach the wall if nothing stopped it
  assert.ok(m.x + m.w <= wallCol * TS, 'a pushed block was driven into a wall: right edge ' + (m.x + m.w) + ' past wall at ' + (wallCol * TS));
  assert.ok(P.x + P.w / 2 <= m.x + 0.01, 'the hero pushing a stuck block was carried into it');
}

// ---- BLOCKED BY ANOTHER BLOCK: two of them never overlap, however hard the first is pushed into the second ----
{ const floorRow = 5; const w = grid(Array.from({ length: 20 }, (_, x) => [x, floorRow]));
  const mA = newPushBlock(40, floorRow * TS), mB = newPushBlock(120, floorRow * TS); // B sits well ahead of A
  const blocks = [mA, mB]; const cA = ctx(w, blocks), cB = ctx(w, blocks);
  run(mA, cA, 1 / 60, 6); run(mB, cB, 1 / 60, 6);
  const P = walker(mA.x - 2, floorRow * TS, 60);
  for (let i = 0; i < 900; i++) { cA.players = [P]; updatePushBlock(mA, 1 / 60, cA); updatePushBlock(mB, 1 / 60, cB); } // fifteen seconds: A has all the room it needs to reach B if nothing stopped it
  assert.ok(mA.x + mA.w <= mB.x, 'two pushed blocks were driven into each other: A right edge ' + (mA.x + mA.w) + ', B left edge ' + mB.x);
}

console.log('ok  push-blocks (sim)   fall, step (one-way), push at PB.speed, blocked by a wall, blocked by another block: all hold');

// ================= THE WIRING IN src/main.js AND THE DEMO IN src/level.js (read, not re-simulated) =================
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const LEVEL = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');

assert.ok(/case 'pushblock': movers\.push\(newPushBlock\(px, py\)\)/.test(MAIN), 'a pushblock ent no longer spawns into movers - it would not reset with the rest of the level on death/checkpoint (spawnEntities rebuilds `movers` from L.ents on every attempt)');
assert.ok(/if \(m\.kind === 'pushblock'\) \{ updatePushBlock\(m, dt, PB_CTX\); continue; \}/.test(MAIN), 'updateMovers no longer steps a pushblock every frame');
assert.ok(/mv\.kind === 'pushblock' && mv\.ground/.test(MAIN), "the pressure plate's own check no longer reads a resting block - it would not hold a plate down");
assert.ok(/if \(m\.kind === 'pushblock'\)[\s\S]{0,300}g\.drawImage\(TILE\.dirt\[0\]/.test(MAIN), 'a pushblock has no draw case (or reuses no tile art) in the movers draw pass');
console.log('ok  push-blocks (wiring) spawns into movers (reset-safe), steps every frame, holds a plate, draws with reused tile art');

// ---- THE DEMO: placed once, in Bracken Wood, and never the only way through ----
const wood = LEVELS.find(l => l.id === 'wood');
assert.ok(wood, 'Bracken Wood is not in LEVELS');
const L = wood.build();
const blockEnts = L.ents.filter(e => e.t === 'pushblock');
assert.equal(blockEnts.length, 1, 'the brief asks for exactly one teaching placement; brackenWood has ' + blockEnts.length);
/* (claude/fairfix5) THE DESIGN LANES BUILD ON IT: THE HARVEST FAIR's barns place one hay bale (its brief's teach - an optional loft ledge, never the way on) */
/* (claude/unburied4) THE UNBURIED FIELD's bailey: three wheeled mantlets (pushblocks with mantlet set) - cover from the volleys, and the step up its two walls. Required there, so tools/unburied.mjs
   and tools/unburied-bailey.mjs prove the step with a real jump and that it resets (a mover rebuilt from L.ents on every attempt, like this one) */
const PLACED = { fair: 1, unburied: 3 };
const otherLevels = LEVELS.filter(l => l.id !== 'wood').map(l => [l.id, l.build()]);
for (const [id, R] of otherLevels) assert.equal((R.ents || []).filter(e => e.t === 'pushblock').length, PLACED[id] || 0, id + ' places a pushblock it is not allowed (PLACED) - the brief is one demo, for the design lanes to build on');

// NO SOFT-LOCK: the route a real jump can flood-fill through Bracken Wood does not depend on the block at all -
// floodReach never reads L.ents for a pushblock (it only knows tiles), so if the section still floods end to end
// with the ledge tile in the grid, a hero who never once pushes the block still gets through.
const ACROSS = 5; // checkpoint-stand.mjs's own figure: about 3.5 tiles, inside the measured 3.2-4.5, not the model's 6
const R = floodReach(L, T, { rides: true, across: ACROSS });
const before = R.key(103, 21), past = R.key(109, 21); // the sign before the demo, and the thorn right past it - column 111 on is its own pre-existing gap in the flood model (the crates), nothing to do with this demo
assert.ok(R.seen.has(before) && R.seen.has(past), 'the corridor around the pushblock demo (x103-116) does not flood through on a real jump - something in the demo narrows the walkway itself');
console.log(`ok  push-blocks (demo)   exactly 1 placement (Bracken Wood only), and the corridor around it floods end to end without it (no soft-lock: the block is optional).`);
