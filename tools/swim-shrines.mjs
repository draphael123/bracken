// tools/swim-shrines.mjs — A SWIMMER LIGHTS THE SHRINES ON THE WAY, AS A WALKER DOES (level review, 2026-09-24).
//
// A shrine was lit only by touch: within 12 px across and 20 px up of its foot. The Underwater Keep stands its shrines on
// the bed of rooms seventeen rows deep and you cross them swimming in the middle, so in the page a swim that followed the
// route lit 1 of 15 and every death sent you back to the door. main.js's shrineLights() now lights one from anywhere in
// the open water over it. This reads that rule out of main.js and asks it of every level with water: along the main route
// (tools/pacing.mjs's, the reach fill's cheapest way start to boss), every underwater shrine whose column the route SWIMS
// across must be lit by the time it has crossed. A shrine the route never swims over is listed, not failed: pacing says
// which checkpoints are on the way.
// usage: node tools/swim-shrines.mjs [id ...]
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { LEVELS, T, TS } from '../src/level.js';
import { pacing } from './pacing.mjs';

const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const m = MAIN.match(/\n(function shrineLights\(s, px, py, swim\) \{[\s\S]*?\n\})/);
assert(m, 'cannot read shrineLights out of src/main.js');
for (const n of (MAIN.match(/for \(const s of shrines\) if \(!s\.lit[^)]*\)/g) || [])) assert(n.includes('shrineLights('), 'a shrine is lit by a test of its own, not shrineLights: ' + n);
const SOLID = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.WEB]);   /* as isSolid in main.js */
const ruleFor = L => new Function('L', 'TS', 'isSolid', 'return ' + m[1])(L, TS, (x, y) => x < 0 || y < 0 || x >= L.W || y >= L.H || SOLID.has(L.grid[y * L.W + x]));

/* THE RULE BITES: a made-up flooded room, a shrine on its bed, a swimmer eight rows over it; and a roof between them */
{ const W = 5, H = 12, grid = new Uint8Array(W * H); for (let x = 0; x < W; x++) grid[11 * W + x] = T.SOLID;
  const L = { W, H, grid, pools: [{ x0: 0, x1: W * TS, y: 1 * TS, swim: true }] }, lit = ruleFor(L), s = { x: 2 * TS + 8, y: 11 * TS };
  assert(lit(s, s.x, 3 * TS, true), 'a swimmer eight rows over a shrine does not light it');
  assert(!lit(s, s.x, 3 * TS, false), 'a body in the air eight rows over a shrine lights it');
  grid[6 * W + 2] = T.SOLID; assert(!ruleFor(L)(s, s.x, 3 * TS, true), 'a shrine lights through a roof'); }

const want = process.argv.slice(2);
const bad = [], off = [], lit_ = []; let asked = 0, levels = 0;
for (const lv of LEVELS) { if (want.length && !want.includes(lv.id)) continue; if (lv.hidden && !lv.secret) continue;
  const L = lv.build(), pools = (L.pools || []).filter(p => p.swim && !p.arenaTide);
  const dry = (x, y) => (L.airRooms || []).some(([a0, a1, b0, b1]) => x >= a0 * TS && x < (a1 + 1) * TS && y - 8 >= b0 * TS && y - 8 < (b1 + 1) * TS);   /* an air room in the flood is dry: walked, and lit by touch */
  const wetAt = (x, y) => !dry(x, y) && pools.some(p => x >= p.x0 && x <= p.x1 && y - 8 >= (p.streetTide ? p.base + p.tideHi : p.y) && (p.bottom === undefined || y - 8 < p.bottom + TS));
  const shr = L.ents.filter(e => e.t === 'check').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS, e })).filter(s => wetAt(s.x, s.y - 4));
  if (!shr.length) continue; levels++;
  const lit = ruleFor(L), route = pacing(lv).route;
  /* OVER IT: in the same room, with open water between - a route under its floor, or on the far side of a roof, is not crossing it */
  const over = (s, py) => { for (let ty = Math.floor((py - 8) / TS); ty < Math.floor(s.y / TS); ty++) { const t = L.grid[ty * L.W + s.e.x]; if (SOLID.has(t)) return false; } return true; };
  for (const s of shr) { asked++; let crossed = false, ok = false;
    for (let i = 1; i < route.length && !ok; i++) { const [x0, y0] = route[i - 1], [x1, y1] = route[i];
      const c0 = Math.min(x0, x1), c1 = Math.max(x0, x1), sx = s.e.x; if (sx < c0 - 1 || sx > c1 + 1) continue;
      for (let k = 0; k <= 8 && !ok; k++) { const f = k / 8, px = (x0 + (x1 - x0) * f) * TS + 8, py = (y0 + (y1 - y0) * f + 1) * TS, swim = wetAt(px, py);
        if (Math.abs(px - s.x) < 12 && swim && py < s.y && over(s, py)) crossed = true; if (lit(s, px, py, swim)) ok = true; } }
    if (ok && crossed) lit_.push(lv.id + ' @' + s.e.x + ',' + s.e.y); if (ok) continue; (crossed ? bad : off).push(`${lv.id} @${s.e.x},${s.e.y}`); } }
if (off.length) console.log('  not on the swum route (pacing decides whether that matters): ' + off.join(' '));
assert.equal(bad.length, 0, bad.length + ' underwater shrine(s) the swum route crosses without lighting:\n  ' + bad.join('\n  '));
console.log(`swim-shrines: ${asked - off.length - bad.length} lit on the way: ${lit_.join(' ')}`);
console.log(`swim-shrines: ${asked} underwater shrines in ${levels} levels; every one the swum route crosses, it lights (${off.length} not on it).`);
