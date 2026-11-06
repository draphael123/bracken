// tools/beam-path.mjs - proves src/beam-path.js (claude/colossus4). Node only: no page, no Chrome. node tools/beam-path.mjs
import assert from 'node:assert/strict';
import * as BP from '../src/beam-path.js';
import { trace, makeOpaque } from '../src/light.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
/* path: length, landing, junk points dropped */
const p = BP.path([[0, 0], [30, 40], null, [30, 100]]); ok(p.pts.length === 3 && near(p.len, 110) && p.land[1] === 100, 'a path: its points, its length (50 + 60) and where it lands');
ok(BP.at(p, 0)[0] === 0 && near(BP.at(p, 50 / 110)[1], 40) && BP.at(p, 1)[1] === 100, 'at(): the point a fraction along');
ok(near(BP.at(p, 80 / 110)[1], 70), 'at(): 80 px along is on the second leg');
/* clip: the light stops where it first enters the target box */
const c = BP.clip(BP.path([[0, 10], [100, 10]]), [40, 0, 60, 20]); ok(c.hit && near(c.at[0], 40) && near(c.path.len, 40), 'clip(): a beam through a box stops at its near face');
const c2 = BP.clip(BP.path([[0, 10], [100, 10]]), [40, 30, 60, 50]); ok(!c2.hit && near(c2.path.len, 100), 'clip(): a beam that misses runs its whole way (lands short of him)');
const c3 = BP.clip(BP.path([[0, 0], [50, 0], [50, 100]]), [40, 60, 60, 80]); ok(c3.hit && c3.at[0] === 50 && near(c3.at[1], 60) && c3.path.pts.length === 3, 'clip(): on a later leg (after the mirror)');
/* edge: the instant fires once */
const mem = {}; ok(!BP.edge(mem, 'k', false) && BP.edge(mem, 'k', true) && !BP.edge(mem, 'k', true) && !BP.edge(mem, 'k', false) && BP.edge(mem, 'k', true), 'edge(): true only on the frame it turns on (once a landing)');
/* fromSegs: light.js segments become joined polylines through the tile centres */
const T = { AIR: 0, SOLID: 1 }, grid = (x, y) => (x < 0 || y < 0 || x > 20 || y > 20 ? 1 : 0);
const r = trace(grid, [{ x: 5, y: 0, dir: 'S' }], [{ x: 5, y: 8, state: '\\' }, { x: 12, y: 8, state: '/' }], [], { opaque: makeOpaque(T) });
const ps = BP.fromSegs(r.segs, 16); ok(ps.length === 1 && ps[0].pts.length === 4 && ps[0].pts[1][0] === 5 * 16 + 8 && ps[0].pts[1][1] === 8 * 16 + 8 && ps[0].pts[2][0] === 12 * 16 + 8, 'fromSegs(): sun down, east at the first mirror, up at the second - ONE polyline with its two turns at the mirrors\' centres');
ok(BP.fromSegs([], 16).length === 0 && BP.fromSegs([{ x0: 0, y0: 0, x1: 3, y1: 0 }, { x0: 9, y0: 9, x1: 9, y1: 12 }], 16).length === 2, 'fromSegs(): two sources = two paths');
/* the painter runs on a stub context without throwing, for every kind, solid / preview / ring */
const calls = []; const g = new Proxy({}, { get: (t, k) => (k in t ? t[k] : (...a) => { calls.push(k); return { addColorStop() {} }; }), set: (t, k, v) => { t[k] = v; return true; } });
for (const kind of ['sun', 'dawn', 'fire', 'priest', 'lance', 'nope']) for (const o of [{}, { preview: true }, { ring: true, a: 0.5 }]) BP.drawBeam(g, p, 0, 0, 1.3, { kind, ...o });
BP.drawMarker(g, 10, 10, 0, 0, 2, { word: 'HE COMES TO THE LIGHT', text: (...a) => calls.push('text:' + a[0]) });
ok(calls.includes('stroke') && calls.includes('fillRect') && calls.includes('arc') && calls.includes('text:HE COMES TO THE LIGHT') && calls.includes('save') && calls.includes('restore'), 'drawBeam / drawMarker paint (lines, glints, the ring, the word) and restore the context');
BP.drawBeam(g, BP.path([[1, 1]]), 0, 0, 0, {}); ok(true, 'a one-point path draws nothing (no throw)');
console.log('ok  beam-path  ' + n + ' checks');
