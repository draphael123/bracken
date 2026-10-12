/* tools/unburied-footings.mjs - NO FLOATING GEOMETRY IN THE UNBURIED FIELD (claude/unbfloat, Daniel 2026-10-12: "the Unburied Field has a lot of floating geometry").
   tools/solid-islands.mjs only sees groups that touch nothing: a plank keyed into a palisade's side, or a palisade whose feet hang a few rows over a trench, is joined to
   the ground by the grid and passes. This one looks at every OVERHANG of the built level instead: a run of non-air tiles (a rope, T.NET, is not one) with three or more rows
   of AIR straight under its first column and nothing solid under the run. Each such run must have, under or beside it, a drawn footing from L.structures (a trestle, a
   pier, a cairn of headstones, a corbel brace, a shore, a cart frame: src/redraw/unburied_siege.js) that covers its columns and reaches the run's row, or sit in a
   facade the level paints over a wall (the toppled tower, the Order's gatehouse and curtain wall), or be listed in KEYED with the line that says why.
   (A palisade or rock run must be covered WHOLE by one footing; a board run needs one under part of it.) Run: node tools/unburied-footings.mjs   (Node only; --list prints every overhang and what holds it)
   Proved red first: with the three footings deleted it names the plank and both palisades. */
import { LEVELS, T } from '../src/level.js';
const L = LEVELS.find(l => l.id === 'unburied').build(), W = L.W, H = L.H, g = L.grid, list = process.argv.includes('--list');
const N = k => Object.keys(T).find(n => T[n] === k);
/* what is allowed to hang: [x0, x1, row, why] - none today (every overhang is held by a structure or a painted facade) */
const KEYED = [];
const FACADE_OK = new Set(['ubtower', 'ubtower2', 'ubwall']);   /* painted over a wall: the siege tower's decks and ladder, the gatehouse's gallery and gate arch */
const fac = (L.facades || []).filter(f => FACADE_OK.has(f[4]));
const holds = (x0, x1, y, whole) => (L.structures || []).filter(z => (whole ? z.x0 <= x0 && z.x1 >= x1 : z.x1 >= x0 && z.x0 <= x1) && z.top <= y + 3 && z.floor > y + 1).map(z => z.kind);
let n = 0, bare = [];
for (let y = 0; y < H - 1; y++) { let x = 0; while (x < W) {
  const t = g[y * W + x]; if (t === T.AIR || t === T.NET || g[(y + 1) * W + x] !== T.AIR) { x++; continue; }
  let x1 = x; while (x1 + 1 < W && g[y * W + x1 + 1] !== T.AIR && g[y * W + x1 + 1] !== T.NET && g[(y + 1) * W + x1 + 1] === T.AIR) x1++;
  let d = 0; while (y + 1 + d < H && g[(y + 1 + d) * W + x] === T.AIR) d++;
  if (d >= 3) { n++; const by = holds(x, x1, y, t === T.PALISADE || t === T.SOLID), inFacade = fac.some(f => x >= f[0] && x1 <= f[1] && y >= f[2] && y <= f[3]), keyed = KEYED.find(k => k[0] <= x && k[1] >= x1 && k[2] === y);
    const why = by.length ? by.join('+') : inFacade ? 'painted facade' : keyed ? 'keyed: ' + keyed[3] : '';
    if (list) console.log(N(t).padEnd(9), '@' + x + (x1 > x ? '-' + x1 : '') + ',' + y, 'air', d, why || 'NOTHING');
    if (!why) bare.push(N(t) + ' @' + x + (x1 > x ? '-' + x1 : '') + ',' + y + ' (' + d + ' rows of air under it)'); }
  x = x1 + 1; } }
for (const b of bare) console.log('  FAIL floating: ' + b);
console.log(bare.length ? 'unburied-footings: ' + bare.length + ' overhang(s) with no drawn footing' : 'ok  unburied-footings  ' + n + ' overhangs, every one on a drawn footing or a painted wall');
process.exit(bare.length ? 1 : 0);
