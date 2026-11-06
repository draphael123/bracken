import assert from 'node:assert/strict';
import { makeSpriteView } from './catalogue.mjs';

assert(process.env.CI);
const original = { frames: [] };
function setup() {
  let builds = 0;
  const target = { a: undefined, b: undefined };
  const pending = new Map([['a', original], ['b', original]]);
  const view = makeSpriteView(target, pending, value => { builds++; return value; });
  return { view, builds: () => builds };
}
for (const lock of [Object.seal, Object.freeze, Object.preventExtensions]) {
  for (const removeSibling of [false, true]) {
    const { view, builds } = setup();
    const eager = { a: original, b: original };
    if (removeSibling) {
      delete view.b;
      delete eager.b;
    }
    assert.equal(builds(), 0);
    assert.equal(lock(view), view);
    lock(eager);
    assert.equal(builds(), removeSibling ? 1 : 2);
    assert.deepEqual(Object.getOwnPropertyDescriptors(view), Object.getOwnPropertyDescriptors(eager));
    assert.equal(Object.isSealed(view), Object.isSealed(eager));
    assert.equal(Object.isFrozen(view), Object.isFrozen(eager));
    const replacement = {};
    assert.equal(Reflect.set(view, 'a', replacement), Reflect.set(eager, 'a', replacement));
    assert.equal(view.a, eager.a);
  }
}
{
  const { view, builds } = setup();
  assert.deepEqual(Reflect.ownKeys(view), ['a', 'b']);
  assert.equal(builds(), 0);
  assert.equal(view.a, original);
  assert.equal(view.a, original);
  assert.equal(builds(), 1);
  assert.equal(Object.getOwnPropertyDescriptor(view, 'b').value, original);
  assert.equal(builds(), 2);
}
console.log('PASS catalogue integrity component: six integrity cases and lazy-read identity');
