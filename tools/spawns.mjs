// tools/spawns.mjs — NO CREATURE STARTS INSIDE THE ROCK, AND NO FISH STARTS ON DRY LAND.
//
// "Some enemies stuck in terrain to start with." A creature is placed by its FEET on a tile, and its box is as wide and as
// tall as its spawn case in src/main.js says; after grow() has moved half a level, the review pass has laid a platform,
// the garrison has sprinkled forty more and the ambush rooms have been filled, nothing looked at whether that box is in
// the air. This builds every level the way the game does and reads each creature's box off its own spawn case:
//   STUCK   the box (less a pixel all round) overlaps a solid tile of the BUILT grid
//   DRY     an eel, angler or urchin is not in a swim pool; a siren is nowhere near one
// Ambush waves are read too, on the floor they are dropped onto. Exit code 1 on any hit.
import { readFileSync } from 'fs';
import { LEVELS, T, TS } from '../src/level.js';

const SRC = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const SOLID = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.WEB]);
// THE BOX OF EVERY CREATURE, off its spawn case: `w: 12, h: 14`, or the bigger of `e.big ? 34 : 20`
const BOX = {};
for (const m of SRC.matchAll(/case '(\w+)':([^\n]*(?:\n(?!\s*case ')[^\n]*){0,3})/g)) {
  const [, name, body] = m; if (BOX[name] || !/enemies\.push|boss = /.test(body)) continue;
  const num = s => { const n = s.match(/(\d+)\s*:\s*(\d+)|(\d+)/); return n ? (n[3] ? [+n[3], +n[3]] : [+n[2], +n[1]]) : null; };   /* [as it comes, e.big]: a troll is not a hill troll */
  const w = body.match(/\bw: ([^,]+),/), h = body.match(/\bh: ([^,]+),/);
  if (w && h && num(w[1]) && num(h[1])) BOX[name] = [num(w[1]), num(h[1])];
}
// A TIDE'S WATER IS WHERE IT COMES UP TO. A pool that rises and falls is built at low water; an urchin on the bed of the
// carrack's hold is dry at the start and under twelve rows of sea a minute later.
const surface = p => p.tideHi !== undefined && p.base !== undefined ? Math.min(p.y, p.base + p.tideHi) : p.y;
// WHO LIVES IN A WALL ON PURPOSE: a clinger grips the rock face, a gill is in the cave wall, a lurker is under the moss
const IN_ROCK = new Set(['clinger', 'gill', 'lurker', 'sweep', 'mother', 'reefmaw']);   /* and the Reef Maw lies in its hole until it rises */
const INWATER = new Set(['eel', 'angler', 'urchin']);

const want = process.argv.slice(2);
let bad = 0, n = 0;
for (const lv of LEVELS) {
  if ((lv.hidden && !lv.secret) || lv.id === 'custom' || (want.length && !want.includes(lv.id))) continue;
  const L = lv.build(), W = L.W, H = L.H, pools = L.pools || [];
  const solid = (tx, ty) => tx < 0 || tx >= W ? true : ty < 0 || ty >= H ? false : SOLID.has(L.grid[ty * W + tx]);
  const out = [];
  const look = (t, x, y, from, big) => {
    const box = BOX[t]; if (!box) return; n++;
    const px = x * TS + 8, py = (y + 1) * TS, w = box[0][big ? 1 : 0], h = box[1][big ? 1 : 0];
    if (!IN_ROCK.has(t)) { let hit = 0;
      for (let ty = Math.floor((py - h + 2) / TS); ty <= Math.floor((py - 2) / TS); ty++) for (let tx = Math.floor((px - w / 2 + 2) / TS); tx <= Math.floor((px + w / 2 - 2) / TS); tx++) if (solid(tx, ty)) hit++;   /* two pixels in: a troll's eighteen-pixel box grazes the next column by one and walks out of it */
      if (hit) out.push('STUCK ' + t + '@' + x + ',' + y + from + ' (' + hit + ' tile' + (hit > 1 ? 's' : '') + ')'); }
    if (INWATER.has(t) && !pools.some(p => p.swim && px > p.x0 && px < p.x1 && py - 4 > surface(p) && py - 4 <= (p.bottom !== undefined ? p.bottom : p.y + 60) + TS))
      out.push('DRY ' + t + '@' + x + ',' + y + from + ' is not in a swim pool');
    if (t === 'siren' && !pools.some(p => p.swim && px > p.x0 - 3 * TS && px < p.x1 + 3 * TS && py > surface(p) - 3 * TS && py < (p.bottom !== undefined ? p.bottom : p.y + 60) + TS))
      out.push('DRY siren@' + x + ',' + y + from + ' has no water to sit by');
  };
  for (const e of L.ents) look(e.t, e.x, e.y, e.garrison ? ' (garrison)' : '', !!e.big);
  for (const A of (L.ambushes || [])) for (const wv of A.waves) for (const [t, x, y] of wv) look(t, x, y === undefined || y === null ? A.row : y, ' (ambush ' + A.name + ')');
  if (out.length) { bad += out.length; console.log('  ' + lv.id.padEnd(11) + out.length + ': ' + out.join('  ')); }
}
console.log('\n' + n + ' creatures checked against the built levels. ' + (bad ? bad + ' start in the rock or out of the water.' : 'none start in the rock or out of the water.'));
process.exit(bad ? 1 : 0);
