// tools/ram-bank.mjs — THE RAM LORD'S OPENING IS CAUSED, NOT WAITED FOR (RULES A11; the design audit on claude/designaudit
// §6 THE SCREE PATH, plan 4). Before this, his fold was a 16-tile box: a charge crossed it well inside his 3s timer no matter
// where the player stood, so the wall crash - his only opening (A6) - happened every time regardless of anything the player did.
// The fold is now about 30 tiles, with a scree bank on one wall (src/level.js, L.arena.bank): the crash still always drops rock,
// but baiting him into the BANKED wall (by standing on the far side when he lowers his head) buries him deeper - more rock, a
// longer daze - which only happens because of where the player chose to stand. This reads the built level for the widened
// arena and the bank flag, then runs updateRam itself in a VM to prove the bank crash is a strictly bigger opening than an
// ordinary wall crash, not just a different message.
//   node tools/ram-bank.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { LEVELS } from '../src/level.js';
import * as RLD from '../src/ram-lord.js';   /* (claude/scree2) updateRam asks src/ram-lord.js for his fold's overhangs, his ward and his pace */

const L = LEVELS.find(l => l.id === 'scree').build();
const A = L.arena;
assert.equal(A.boss, 'ram', 'the Scree Path\'s arena is the Ram Lord\'s');
const tiles = (A.x1 - A.x0) / 16;
assert(tiles >= 28, 'the fold is widened past its old 16-tile box (A11): ' + tiles + ' tiles');
assert(A.bank === 1 || A.bank === -1, 'the arena names which wall the scree bank stands against: ' + A.bank);

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const src = main.slice(main.indexOf('function updateRam'), main.indexOf('function traceBeams'));
assert(/atBank/.test(src), 'updateRam knows about the banked wall');

const noop = () => {};
const P = { x: 0, y: 0, dead: false };
const rocks = [], waves = [], parts = [], enemies = [];
const ctx = {
  P, rocks, waves, parts, enemies, Math,
  moveBody: (e, dx, dy) => { e.x += dx; e.y += dy; return { ground: true }; },
  damagePlayer: () => 'hit', number: noop, dust: noop, sparks: noop, shakeCam: noop, zoomKick: noop,
  SFX: new Proxy({}, { get: () => noop }),
  DMG: new Proxy({}, { get: () => 10 }),
  RLD, bossActive: false, ramCtx: () => ({ say: noop, sfx: noop }),   /* (claude/scree2) the charge runs outside a live fight here: no overhang step */
};
/* claude/bosswave1 made the daze a module const above updateRam: read its real values from main.js so the slice can see them */
const dz = /const RAM_DAZE = ([\d.]+), RAM_DAZE_TAKE = ([\d.]+)/.exec(main); assert(dz, 'RAM_DAZE consts found in main.js');
ctx.RAM_DAZE = +dz[1]; ctx.RAM_DAZE_TAKE = +dz[2];
vm.createContext(ctx);
vm.runInContext(src, ctx);

// a fresh charge, about to hit a wall: run it until it crashes, once against the banked wall and once against the other
const arena = { x0: 0, x1: 30 * 16, floor: 9 * 16 };
const run = (face, bank) => {
  const e = { x: face < 0 ? arena.x0 + 40 : arena.x1 - 40, y: arena.floor, vx: face * 260, vy: 0, mode: 'charge', modeT: 3, face, phase: 1, anim: 0, hitT: 0, chain: 0 };
  const A2 = { ...arena, bank };
  ctx.L = { arena: A2 }; ctx.A = A2;
  for (let t = 0; t < 3 && e.mode === 'charge'; t += 1 / 60) ctx.updateRam.call(ctx, e, 1 / 60);
  return e;
};
const atBank = run(-1, -1);   // charges toward x0, and x0 is the banked wall
const plain = run(1, -1);     // charges toward x1, the OTHER wall - same bank flag, opposite side
assert.equal(atBank.mode, 'crash', 'the ram crashes when he reaches a wall');
assert.equal(plain.mode, 'crash', 'and the other wall still crashes him too');
assert(atBank.modeT > plain.modeT, 'the banked wall bakes in a longer daze than an ordinary wall crash: ' + atBank.modeT.toFixed(2) + ' vs ' + plain.modeT.toFixed(2));
const rocksAt = (e, before) => rocks.length - before;
console.log('ram-bank  fold ' + tiles + ' tiles, bank on ' + (A.bank > 0 ? 'x1' : 'x0') + '; a wall crash daze ' + plain.modeT.toFixed(2) + 's, the banked wall ' + atBank.modeT.toFixed(2) + 's - a caused opening, not a waited one.');
