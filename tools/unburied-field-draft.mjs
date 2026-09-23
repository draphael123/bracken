/* tools/unburied-field-draft.mjs — measures the DRAFT Unburied Field (src/draft/unburied-field.js), Node only: every act walked;
   BOTH act-two routes walked (the high one over the wrecks, the low one in the trench) and each alone still carries you on;
   the siege tower climbed to its top; the Standard-Bearer's gate holds the way on; the Death Knight's arena reached; three
   silvers and every checkpoint reached; encounters 3-5; route-breaks clean.
   THIS TOOL MEASURES THE GEOMETRY ONLY. tools/unburied.mjs measures the same draft against the BRIEF - its features, its
   hazards, its rooms and the rules the brief's last line names - and that is the one in the suite. */
import assert from 'node:assert/strict';
import { T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { build, UF } from '../src/draft/unburied-field.js';
import { audit } from './route-breaks.mjs';

const fill = S => { const R = floodReach(S, T, { rides: true }); return { R, seen: [...R.seen].map(k => k.split(',').map(Number)) }; };
const L = build(T), { R, seen } = fill(L), reached = (x, y) => R.seen.has(x + ',' + y);
const near = e => { for (let dy = -2; dy <= 5; dy++) for (let dx = -3; dx <= 3; dx++) if (reached(e.x + dx, e.y + dy)) return true; return false; };
const box = (x0, x1, y0, y1) => seen.filter(([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1).length;
for (const [k, [a, b]] of Object.entries(UF.ACTS)) { const n = box(a, b, 0, UF.H); console.log('  ' + k.padEnd(8) + n + ' cells'); assert.ok(n > 60, k + ' walked'); }
assert.ok(box(UF.HIGH[0], UF.HIGH[1], 0, 32) > 30, 'the high route is walked'); assert.ok(box(UF.LOW[0], UF.LOW[1], UF.G + 3, UF.G + 5) > 30, 'the low route is walked');
const past = s => s.some(([x]) => x > UF.TOWER[0]);
{ const S = build(T); for (let x = UF.LOW[0]; x <= UF.LOW[1]; x++) for (let y = UF.G + 1; y <= UF.G + 5; y++) S.grid[y * S.W + x] = T.SOLID; assert.ok(past(fill(S).seen), 'the high route alone carries you on'); }
{ const S = build(T); for (let i = 0; i < S.grid.length; i++) { const x = i % S.W, y = (i / S.W) | 0; if (x >= UF.HIGH[0] && x <= UF.HIGH[1] && y < UF.G - 3 && S.grid[i] === T.ONEWAY) S.grid[i] = T.AIR; } assert.ok(past(fill(S).seen), 'the low route alone carries you on'); }
assert.ok(box(UF.TOWER[0], UF.TOWER[1] + 4, 18, 21) > 3, 'the siege tower is climbed to its top');
{ const S = build(T); for (let y = 0; y < S.H; y++) if (S.grid[y * S.W + UF.MINI.gate] === T.PORT) S.grid[y * S.W + UF.MINI.gate] = T.SOLID; assert.ok(!fill(S).seen.some(([x]) => x > UF.MINI.gate + 1), 'the Standard-Bearer holds the way on'); }
assert.ok(seen.some(([x, y]) => x >= UF.ARENA.x0 + 4 && y === UF.G), 'the Death Knight\'s arena is reached');
const silvers = L.ents.filter(e => e.t === 'silver'); assert.equal(silvers.length, 3); for (const s of silvers) assert.ok(near(s), 'silver reached at ' + s.x + ',' + s.y);
for (const c of L.ents.filter(e => e.t === 'check')) assert.ok(near(c), 'checkpoint reached at ' + c.x + ',' + c.y);
for (const e of L.encounters) assert.ok(e.n >= 3 && e.n <= 5, e.name + ': ' + e.n);
console.log('  ' + L.encounters.length + ' encounters (' + L.encounters.map(e => e.n).join(' ') + '), 1 ambush (' + L.ambushes[0].waves.flat().length + ' in ' + L.ambushes[0].waves.length + ' wave)');
const f = audit(L).findings.filter(q => 'ABCD'.includes(q.k)); for (const q of f) console.log('  route-break ' + q.k + ' ' + q.what);
assert.equal(f.length, 0, 'route-breaks finds nothing');
console.log('the field is crossed high or low, the tower climbed, the banner holds the way, the chapel reached.');
