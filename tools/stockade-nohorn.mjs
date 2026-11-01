// tools/stockade-nohorn.mjs - THE STOCKADE CANNOT SOFT-LOCK ON THE HORN (claude/smallfix6, Daniel 11-01: "if you don't get the horn and go down the
// path, you get stuck"). The barred gate opens only to a horn blown within GATE.r; the dozing blower on the walk is the first horn. No browser:
//   1. static: with the gate SEALED (the reach fill otherwise counts it open), everything west of it is one region: the walk, the blower, the yard,
//      and the SPARE horn's post - and from the yard the walk is reachable again (no one-way drop past the blower)
//   2. the spare is told (a sign: 'A HORN OPENS THE GATE') and owed only while no horn is held
//   3. the hands, run on a mock host: a hero with no horn walks to the spare and holds a horn (the gate then opens to his blow); a blower who dies over
//      nothing leaves his horn on the post, not in the void; a blower who dies on the walk drops it onto the planks
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { makeStockadeHands } from '../src/stockade-hands.js';
const TS = 16, fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const lv = LEVELS.find(l => l.id === 'stockade'); const L = lv.build();
const gate = L.stockade.gate, spare = L.stockade.spare;
const blower = L.ents.find(e => e.t === 'archer' && e.stk && e.stk.drops && e.stk.dozing);   /* (claude/stockade3-1101: the Watchpost blower drops a horn too now - this is the walk's dozer) */
check(!!blower, 'no dropping blower on the walk');
check(!!spare, 'L.stockade.spare (the spare horn\'s post) is missing');
if (blower && spare) {
  /* 1. region west of the sealed gate */
  const g2 = L.grid.slice(); for (let y = 0; y < L.H; y++) { const i = y * L.W + gate.x; if (g2[i] === T.PORT || g2[i] === T.PALISADE) g2[i] = T.SOLID; }
  const sealed = { ...L, grid: g2, reachDoors: [] };
  const R = floodReach(sealed, T, { rides: true }), at = (r, x, y) => r.seen.has(r.key(x, y));
  const sx = Math.floor(spare.x / TS), sy = spare.y / TS - 1;
  check(at(R, blower.x, blower.y), 'with the gate shut the blower\'s walk is not reachable from the start');
  check(at(R, sx, sy), 'with the gate shut the SPARE horn\'s post (' + sx + ',' + sy + ') is not reachable: a hero with no horn is locked out');
  check(!at(R, gate.x + 1, 19), 'the sealed gate leaks: the east side is reachable without the horn (test is void)');
  const Y = floodReach(sealed, T, { rides: true, seeds: [[sx, sy]] });
  check(at(Y, blower.x, blower.y), 'from the yard the dozing blower\'s walk cannot be reached again: a one-way drop past him');
  check(at(Y, blower.x + 18, blower.y), 'from the yard the walk\'s far end is not reachable');
  check(sx < gate.x && sx > gate.x - 8, 'the spare post is not just before the gate (tile ' + sx + ', gate ' + gate.x + ')');
  /* 2. told */
  check(L.ents.some(e => e.t === 'sign' && /HORN OPENS THE GATE/.test(e.text || '') && e.x < gate.x && e.x >= sx - 3), 'no sign tells "A HORN OPENS THE GATE" before the gate');
  /* 3. the hands */
  let bodies = [], P = { x: 0, y: 0, dead: 0 }, said = [], opened = null;
  const grid = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? 1 : L.grid[y * L.W + x];
  const ctx = new Proxy({ get L() { return L; }, TS, T, sfx: new Proxy({}, { get: () => () => {} }), P: () => P, enemies: () => bodies, boss: () => null, VW: () => 320,
    number: (x, y, t) => said.push(t), text() {}, dust() {}, sparks() {}, shake() {}, overlap: () => false, atkBox: () => null, hitOnce: () => false,
    solidAt: (tx, ty) => { const t = grid(tx, ty); return t === T.SOLID || t === T.PALISADE || t === T.PORT || t === T.CRATE; }, oneWay: (tx, ty) => { const t = grid(tx, ty); return t === T.PLANK || t === T.ONEWAY; },
    openCells: (x, y0, y1) => { opened = [x, y0, y1]; }, hurt() {}, damage() {}, moveBody: () => ({}), turned() {}, hornSounds() {}, enemyCount: () => 0 }, { get: (t, k) => k in t ? t[k] : () => {} });
  const H = makeStockadeHands(ctx); H.load();
  const pickups = () => H.read().pickups;
  check(pickups().length === 1, 'a fresh run has exactly the spare horn hung (got ' + pickups().length + ')');
  P = { x: spare.x - 120, y: spare.y, dead: 0 }; for (let i = 0; i < 20; i++) H.update(1 / 60);
  check(said.includes('A HORN OPENS THE GATE'), 'walking up to the gate with no horn does not tell "A HORN OPENS THE GATE"');
  P = { x: spare.x, y: spare.y, dead: 0 }; H.update(1 / 60);
  check(H.read().held, 'standing at the spare post does not give a horn: the hero is shut out');
  check(pickups().length === 0, 'the spare is still hung after it was taken');
  /* a hero who already holds a horn is not owed a spare (a death keeps the horn): reset keeps it away */
  H.reset(); check(pickups().length === 0, 'after a death with the horn in hand the spare hangs again');
  /* the blower dies over nothing */
  const H2 = makeStockadeHands(ctx); H2.load();
  const voidFoe = { alive: false, drops: true, x: 30 * TS, y: (L.H + 2) * TS - 8 };
  bodies = [voidFoe]; P = { x: 0, y: 0, dead: 0 }; H2.update(1 / 60);
  const lost = H2.read().pickups.filter(k => Math.abs(k.x - spare.x) > 1 || Math.abs(k.y - spare.y) > 1);
  check(lost.length === 0, 'a blower who died over the void left a horn out of reach: ' + JSON.stringify(lost));
  /* the blower dies on the walk: the horn lands on the planks */
  const H3 = makeStockadeHands(ctx); H3.load(); const walkFoe = { alive: false, drops: true, x: blower.x * TS + 8, y: (blower.y + 1) * TS };
  bodies = [walkFoe]; H3.update(1 / 60); for (let i = 0; i < 120; i++) H3.update(1 / 60);
  const dropped = H3.read().pickups.find(k => Math.abs(k.x - walkFoe.x) < 2);
  check(dropped && dropped.y <= (blower.y + 1) * TS + 1 && dropped.y >= blower.y * TS, 'the horn the blower drops does not land on the walk: ' + JSON.stringify(dropped));
}
if (fails.length) { console.log('stockade-nohorn: FAIL\n  - ' + fails.join('\n  - ')); process.exit(1); }
console.log('stockade-nohorn: OK (a hero with no horn reaches the spare post, can climb back to the blower, and the dropped horn is never out of reach)');
