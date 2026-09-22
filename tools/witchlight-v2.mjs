/* tools/witchlight-v2.mjs — measures the DRAFT redesign of THE WITCHLIGHT STAIR (src/draft/witchlight-v2.js), Node only:
   every place walked from the cavern mouth, the Gargoyle's arena reached; the cloister's brambles crossed ONLY by the glyphs
   (take their footing away and the stair is cut); the Hedge Warden's gate holds the way; three silvers and every checkpoint
   reached; encounters of 3-5 with quiet between; route-breaks finds no cut rope, capped rope, wall or near miss. */
import assert from 'node:assert/strict';
import { T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { build, WL2 } from '../src/draft/witchlight-v2.js';
import { audit } from './route-breaks.mjs';

const L = build(T), R = floodReach(L, T, { rides: true }), seen = [...R.seen].map(k => k.split(',').map(Number));
const walked = (x0, x1) => seen.filter(([x]) => x >= x0 && x <= x1).length, reached = (x, y) => R.seen.has(x + ',' + y);
const near = e => { for (let dy = -2; dy <= 5; dy++) for (let dx = -3; dx <= 3; dx++) if (reached(e.x + dx, e.y + dy)) return true; return false; };
for (const [name, [a, b]] of Object.entries(WL2.PLACES)) { const n = walked(a, b); console.log('  ' + name.padEnd(10) + ' ' + n + ' cells walked'); assert.ok(n > 25, name + ' is walked'); }
const A = L.arena, lip = seen.some(([x, y]) => x >= A.x0 / 16 && x <= A.x1 / 16 && y <= 31); assert.ok(lip, "the Gargoyle's slabs are reached");
{ const S = build(T); S.glyphBridges = []; const Rs = floodReach(S, T, { rides: true }); assert.ok(![...Rs.seen].some(k => +k.split(',')[0] > 214), 'without the glyphs the cloister cannot be crossed'); }
{ const S = build(T); for (let y = 0; y < S.H; y++) if (S.grid[y * S.W + WL2.MINI.gate] === T.PORT) S.grid[y * S.W + WL2.MINI.gate] = T.SOLID;
  const Rs = floodReach(S, T, { rides: true }); assert.ok(![...Rs.seen].some(k => +k.split(',')[0] > WL2.MINI.gate + 2), "the Hedge Warden's gate holds the way on"); }
const silvers = L.ents.filter(e => e.t === 'silver'); assert.equal(silvers.length, 3); for (const s of silvers) assert.ok(near(s), 'silver reached at ' + s.x + ',' + s.y);
for (const c of L.ents.filter(e => e.t === 'check')) assert.ok(near(c), 'checkpoint reached at ' + c.x + ',' + c.y);
for (const e of L.encounters) assert.ok(e.n >= 3 && e.n <= 5, e.name + ' is 3-5 strong: ' + e.n);
const foes = L.ents.filter(e => e.enc).length;
console.log('  ' + L.encounters.length + ' encounters, ' + foes + ' foes (' + L.encounters.map(e => e.n).join(' ') + ')');
const f = audit(L).findings.filter(q => 'ABCD'.includes(q.k)); for (const q of f) console.log('  route-break ' + q.k + ' ' + q.what);
assert.equal(f.length, 0, 'route-breaks finds nothing');
console.log('the redesigned stair is walked place by place, the glyphs carry the cloister, the Warden holds the gate, the Gargoyle waits on top.');
