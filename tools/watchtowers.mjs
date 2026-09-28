/* tools/watchtowers.mjs — STORMHOLD IS LOCKED FROM ABOVE (docs/briefs/stormhold-town.md §3). Every gate's key hangs at the top
   of a watchtower and the tower's rope is the way back down to its gate. Node only. Asserts, for each of the three towers:
     the key of its kind stands on its top deck, and a lock gate needing that kind stands at its gate column;
     a rope ladder reaches the top deck (the reach model does not ride a rope, so the ladder is the way down too);
     its rope starts on the top deck, runs east and down, ends LEFT of its gate, and a hero hanging off it meets no rock;
     the sign at its foot names the key it holds.
   Then drives updateTowerSlides out of main.js in a vm: UP grabs the rope, the rope carries him east, JUMP lets go. */
import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs'; import vm from 'node:vm'; import { LEVELS, T } from '../src/level.js';
const TS = 16, L = LEVELS.find(l => l.id === 'storm').build(), s = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
assert.equal(L.watchtowers.length, 3, 'three watchtowers'); assert.equal(L.zipLines.length, 3, 'a rope off each');
const kinds = new Set();
for (const [i, t] of L.watchtowers.entries()) { const tag = t.name || 'tower ' + i, z = L.zipLines[i]; kinds.add(t.key);
  const key = L.ents.find(e => e.t === 'key' && e.kind === t.key);
  assert.ok(key && key.x >= t.x0 && key.x <= t.x1 && key.y === t.top - 1, tag + ': the ' + t.key + ' key stands on its top deck (row ' + (t.top - 1) + ')');
  const gate = L.ents.find(e => e.t === 'lockgate' && e.needs === t.key);
  assert.ok(gate && gate.x === t.gate && gate.x > t.x1, tag + ': its gate needs the ' + t.key + ' key and stands east of it at ' + t.gate);
  let ladder = false; for (let x = t.x0; x <= t.x1; x++) if (at(x, t.top) === T.NET) ladder = true;
  assert.ok(ladder, tag + ': a rope ladder reaches the top deck');
  assert.ok(z.x0 >= t.x0 * TS && z.x0 <= (t.x1 + 1) * TS && z.y0 === t.top * TS - 12, tag + ': the rope starts on the top deck');
  assert.ok(z.x1 > z.x0 && z.y1 > z.y0, tag + ': the rope runs east and down');
  assert.ok(z.x1 < gate.x * TS, tag + ': the rope ends before its gate, not past it');
  for (let px = z.x0 + 8; px <= z.x1 - 5; px += 4) { const feet = z.y0 + (z.y1 - z.y0) * (px - z.x0) / (z.x1 - z.x0) + 12;
    for (const [ox, oy] of [[-5, -2], [5, -2], [-5, -22], [5, -22], [0, -12]]) { const tx = Math.floor((px + ox) / TS), ty = Math.floor((feet + oy) / TS);
      assert.notEqual(at(tx, ty), T.SOLID, tag + ': a hero on the rope meets rock at ' + tx + ',' + ty); } }
  assert.ok(L.ents.some(e => e.t === 'sign' && Math.abs(e.x - t.x0) <= 3 && e.text.includes(t.key.toUpperCase() + ' KEY')), tag + ': the sign at its foot names the ' + t.key + ' key');
}
assert.equal(kinds.size, 3, 'three different keys');
const z = L.zipLines[0], P = { x: z.x0, y: z.y0 + 12, vx: 0, vy: 0 }, noop = () => {}, c = vm.createContext({ L, P, keys: { up: true }, jumpPress: false, SFX: new Proxy({}, { get: () => noop }) });
vm.runInContext(s.slice(s.indexOf('function updateTowerSlides'), s.indexOf('function towerLever')), c);
c.updateTowerSlides(1 / 60); assert.equal(P.zip, z); assert.equal(P.vx, 210);
c.jumpPress = true; c.updateTowerSlides(1 / 60); assert.equal(P.zip, null); assert.equal(P.vy, -240); assert.equal(P.zipRelease, .6);
console.log('Three watchtowers, three keys on their top decks, a ladder up each and a clear rope down to each gate; grab and jump-release verified.');
