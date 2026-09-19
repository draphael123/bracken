import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// THE POLE MUST COME BACK: exercise the real mover update without the draw or a browser.
// The live swim-and-board proof still belongs in the page; this guards the ferry's state between rides.
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const update = src.slice(src.indexOf('function updateMovers(dt) {'), src.indexOf('const dusk =', src.indexOf('function updateMovers(dt) {')));
const noop = () => {};
function fixture(extra = {}) {
  const m = { kind: 'raft', x0: 100, x1: 500, x: 100, y: 80, w: 64, speed: 32, ...extra };
  const P = { dead: 0, onMover: null };
  const c = vm.createContext({ movers: [m], P, enemies: [], parts: [], updateCarts: noop, number: noop, SFX: { thud: noop, splash: noop }, burst: noop, HOP: { green: { hp: 3 }, yellow: { hp: 3 }, blue: { hp: 3 } } });
  vm.runInContext(update, c);
  const step = n => { for (let i = 0; i < n; i++) c.updateMovers(1 / 60); };
  return { m, P, c, step };
}
for (const extra of [{}, { ferry: true, paid: true }, { ferry: true, free: true }, { frogs: true, frogT: 100, bored: true }]) {
  const { m, P, c, step } = fixture(extra);
  step(90); assert.equal(m.x, m.x0, 'empty dock waits');
  P.onMover = m; step(120); assert(m.x > m.x0, 'rider starts crossing');
  P.onMover = null; step(30); assert(!m.returning, 'a short jump keeps its ride');
  P.onMover = m; step(1); assert.equal(m.offT, 0, 'boarding clears the grace timer');
  const frog = { alive: true, t: 'hopper', raft: m }; c.enemies.push(frog);
  P.onMover = null; step(73); assert(m.returning && !m.moving, 'living rider left behind gets a return');
  const x = m.x; step(1); assert(m.x < x && x - m.x < m.speed / 60, 'return is visible and slower, never a teleport');
  P.onMover = m; step(1); assert(m.returning, 'boarding the return does not reverse it halfway');
  P.onMover = null; step(1500); assert.equal(m.x, m.x0); assert(!m.done && !m.moving && !m.returning, 'home waits for another crossing');
  for (const k of ['paid', 'free', 'bored']) assert.equal(m[k], extra[k], k + ' survives recovery');
  assert(c.enemies.includes(frog), 'passenger frog survives recovery');
  P.onMover = m; step(1000); assert.equal(m.x, m.x1); assert(m.done && !m.returning, 'rider completes second crossing');
  step(120); assert.equal(m.x, m.x1, 'occupied far dock stays');
  P.onMover = null; step(73); assert(m.returning, 'empty far dock also returns');
  step(1500); assert.equal(m.x, m.x0);
}
{
  const { m, P, step } = fixture({ ferry: true, paid: false });
  P.onMover = m; step(120); assert.equal(m.x, m.x0, 'unpaid ferry stays');
  m.paid = true; step(60); assert(m.x > m.x0, 'paying still unlocks ferry');
}
{
  const { m, P, c, step } = fixture({ frogs: true, frogT: 0.001 });
  P.onMover = m; step(1); assert.equal(c.enemies.length, 1, 'outbound frogs still board');
  P.dead = 1; P.onMover = null; step(90); assert(!m.returning, 'death leaves recovery to respawn');
}
console.log('rafts: grace, slow return, reboarding, far dock, toll, free ferry, frogs and bore state pass.');
