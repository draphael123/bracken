/* tools/curtain-wall.mjs — measures the DRAFT Curtain Wall (src/draft/curtain-wall.js) spliced into the real Stormhold, the way
   a build session will splice it with grow(): open CURTAIN.N columns at CURTAIN.SEAM, shift everything past it, paint the
   section, and run the reach model. Proves: the Long Bridge is still reached; the climb is really climbed (the foot and the
   wall-walk are both walked, ~20 rows apart); the Serjeant's gate holds the way on; checkpoints and the silver are reached;
   foes a screen in the section; route-breaks (cut ropes, ledges a jump short) finds nothing new. Node only. */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { CURTAIN, layCurtainWall } from '../src/draft/curtain-wall.js';
import { audit } from './route-breaks.mjs';

const TS = 16, C = CURTAIN;
function spliced(sealGate = false) {
  const S = LEVELS.find(l => l.id === 'storm').build(), W0 = S.W, H = S.H, N = C.N, W = W0 + N, grid = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W0; x++) grid[y * W + (x >= C.SEAM ? x + N : x)] = S.grid[y * W0 + x];
  const sh = x => x >= C.SEAM ? x + N : x, shp = p => p >= C.SEAM * TS ? p + N * TS : p;
  const ents = S.ents.map(e => ({ ...e, x: sh(e.x) }));
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const P = { set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); },
    plat: (x, y, n) => { for (let i = 0; i < n; i++) set(x + i, y, T.ONEWAY); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) };
  const out = layCurtainWall(P, C.SEAM, T);
  if (sealGate) for (let y = 0; y < H; y++) if (grid[y * W + C.SEAM + C.SERJEANT.gate] === T.PORT) grid[y * W + C.SEAM + C.SERJEANT.gate] = T.SOLID;
  const A = S.arena; const arena = { ...A, x0: shp(A.x0), x1: shp(A.x1), trigger: shp(A.trigger), wallL: sh(A.wallL), wallR: sh(A.wallR) };
  return { ...S, W, grid, ents, arena, bridges: (S.bridges || []).map(b => ({ ...b, x: sh(b.x), x1: sh(b.x1) })), moversExtra: (S.moversExtra || []).map(m => ({ ...m, x: m.x !== undefined ? shp(m.x) : m.x, x0: m.x0 !== undefined ? shp(m.x0) : m.x0, x1: m.x1 !== undefined ? shp(m.x1) : m.x1 })), mini: out.mini, gusts: (S.gusts || []).concat(out.gusts) };
}
const L = spliced(), R = floodReach(L, T, { rides: true }), reached = (x, y) => R.seen.has(x + ',' + y), c = n => C.SEAM + n;
const trig = Math.floor(L.arena.trigger / TS), deck = L.arena.floor / TS - 1;
assert.ok([...R.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= trig && Math.abs(y - deck) <= 1; }), 'the Long Bridge is still reached past the wall');
const inBox = (x0, x1, y0, y1) => [...R.seen].map(k => k.split(',').map(Number)).filter(([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1).length;
assert.ok(inBox(c(12), c(60), C.FOOT - 1, C.FOOT) > 20, 'the foot of the wall is walked');
assert.ok(inBox(c(C.WALL[0]), c(C.SERJEANT.x0), C.WALK, C.WALK) > 10, 'the wall-walk is walked');
assert.ok(C.FOOT - C.WALK >= 20, 'the climb is ~20 rows: ' + (C.FOOT - C.WALK));
{ const Rs = floodReach(spliced(true), T, { rides: true }); assert.ok(![...Rs.seen].some(k => +k.split(',')[0] >= trig), 'the Serjeant\'s gate holds the way to the bridge'); }
for (const e of L.ents.filter(e => (e.t === 'check' || e.t === 'silver') && e.x >= c(0) && e.x < c(C.N))) { let ok = false;
  for (let dy = -2; dy <= 5 && !ok; dy++) for (let dx = -3; dx <= 3 && !ok; dx++) ok = reached(e.x + dx, e.y + dy); assert.ok(ok, e.t + ' reached at ' + e.x + ',' + e.y); }
const NOT = new Set(['sign', 'check', 'coin', 'deco', 'silver', 'mover', 'rod', 'murderhole', 'gateserjeant', 'torch', 'brazier']);
const foes = L.ents.filter(e => e.x >= c(0) && e.x < c(C.N) && !NOT.has(e.t)).length, screens = C.N / 24 + (C.FOOT - C.WALK) / 12;
console.log('Curtain Wall (draft) spliced at ' + C.SEAM + ': Stormhold ' + (L.W - C.N) + ' -> ' + L.W + ' wide; ' + foes + ' placed foes on ' + screens.toFixed(1) + ' screens (' + (foes / screens).toFixed(2) + ' a screen before any GARRISON row)');
const found = audit(L).findings.filter(f => f.x >= c(0) && f.x < c(C.N) && 'ABCD'.includes(f.k));
assert.deepEqual(found.map(f => f.k + ' ' + f.what), [], 'route-breaks finds nothing in the section');
console.log('the wall is climbed, walked and held; the bridge is reached past it.');
