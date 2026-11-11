/* tools/maker-mechanisms.mjs (claude/maker) - THE MAKER's MECHANISMS work when you play them.
   A LEVER hit with the sword opens the DOOR column it is linked to (and not the other one), a PRESSURE PLATE stood on
   opens its door, a KEY opens the gate of its own metal (and a gate of another metal stays shut), a LOCKED GATE builds its
   own bars when placed, LINK sends a lever to a door it is not nearest to, and the traps (crusher, fire jet, rolling
   puffball, push block) run without an error.   node tools/maker-mechanisms.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(9), audio: false, seed: 1109 });
try {
  const r = await pg.evalp(`(async () => {
    const MP = await import('/src/maker-palette.js'), W = 110, d = MKR.blank(W, 28), r = {};
    const door = (x, y0, y1) => { for (let y = y0; y <= y1; y++) d.grid[y * W + x] = 12; };
    door(30, 14, 19); door(36, 14, 19); door(45, 14, 19);
    const lever = MP.entFor('lever', 25, 19); lever.link = 36;   /* LINKed past the nearer door at 30 */
    d.ents = [{ t: 'gate', x: 105, y: 19 }, lever, MP.entFor('plate', 43, 19), MP.entFor('key:brass', 50, 19), MP.entFor('lockgate:brass', 60, 19),
      MP.entFor('lockgate:iron', 66, 19), MP.entFor('pushblock', 72, 19), MP.entFor('crusher', 80, 19), MP.entFor('firevent', 86, 19), MP.entFor('roller', 95, 19)];
    for (const e of d.ents) MP.afterPlace(d, e);
    r.bars = [16, 17, 18, 19].every(y => d.grid[y * W + 60] === 12) && d.grid[15 * W + 60] === 0;
    d.start = { x: 5, y: 19 }; MKR.doc = d; MKR.play(); BK.god = true; BK.step(30);
    const cell = (x, y) => BK.L.grid[y * W + x];
    BK.tp(24, 19); BK.P.face = 1; BK.step(5);
    for (let k = 0; k < 3; k++) { dispatchEvent(new KeyboardEvent('keydown', { key: 'x' })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: 'x' })); BK.step(30); }
    r.leverOpensLinked = cell(36, 18) === 0; r.leverLeavesNearer = cell(30, 18) === 12;
    BK.tp(43, 19); BK.step(20); r.plateOpens = cell(45, 18) === 0;
    BK.tp(50, 19); BK.step(20); BK.tp(59, 19); BK.step(40); r.keyOpensItsGate = cell(60, 18) === 0;
    BK.tp(65, 19); BK.step(40); r.otherGateShut = cell(66, 18) === 12;
    BK.tp(70, 19); BK.step(600); r.trapsRan = true;
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  for (const k of ['bars', 'leverOpensLinked', 'leverLeavesNearer', 'plateOpens', 'keyOpensItsGate', 'otherGateShut', 'trapsRan']) assert(r[k], 'maker mechanisms: ' + k + ' failed ' + JSON.stringify(r));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-mechanisms: levers open their linked door, plates open theirs, keys open their own gate, gates build their bars, traps run.');
} finally { pg.close(); }
