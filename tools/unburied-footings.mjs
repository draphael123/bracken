/* tools/unburied-footings.mjs - NO FLOATING GEOMETRY IN THE UNBURIED FIELD (claude/unbfloat, Daniel 2026-10-12: "a lot of floating geometry", then "platforms in the air, high up").
   tools/solid-islands.mjs only sees groups that touch nothing, and tools/unburied-aloft.mjs takes a painted facade or a wall for a support: a plank keyed into a palisade, a palisade
   whose feet hang over a trench, a deck stuck on a hide wall with legs painted in the BACKGROUND layer all pass them and all read, to a player at 320x180, as floating.
   This one looks at every OVERHANG of the built level (a run of non-air tiles, a rope T.NET excepted, with three or more rows of AIR straight under it) and asks for a VISIBLE support:
     - an L.structures footing that covers the run (a palisade / rock run: covered WHOLE by one; a board run: under part of it, within a tile of its row) and reaches ground or a ledge, AND
     - that footing, RENDERED here with the game's own draw function (src/redraw/unburied_sets.js drawStructure), is really there to see: on every pixel row of its box a run of >= 3 opaque px,
       and one 8-connected path of opaque pixels from its top row to its bottom row (a pair of shores that thin to nothing before the ground fails this),
     - or the overhang is in KEYED below with the line that says why a player reads it as held (a frame he is inside, braces he can see) - never "a facade is behind it".
   Run: node tools/unburied-footings.mjs   (Node only; --list prints every overhang and what holds it)
   Proved red first on the live geometry (master 4fabe26c + the first pass): it named the toppled tower's two lower west decks (shores that thin to 0-2 px) and the 24 deck (a painted ladder and legs only). */
import { LEVELS, T } from '../src/level.js';
import { install } from './node-canvas.mjs';
install();
const UBS = await import('../src/redraw/unburied_sets.js');
const L = LEVELS.find(l => l.id === 'unburied').build(), W = L.W, H = L.H, g = L.grid, list = process.argv.includes('--list');
const N = k => Object.keys(T).find(n => T[n] === k);
/* [x0, x1, row, why a player reads it as held]: the frame he is INSIDE, or braces that are drawn in the tiles' own layer */
const KEYED = [
  [248, 252, 21, 'inside the toppled tower: its timber frame, hoarding and hide wall stand round and under the deck, cross-braced to the ground (screenshot upper-2)'],
  [248, 250, 27, 'inside the toppled tower: same frame'],
  [259, 262, 21, 'the tower crest deck: two diagonal braces drawn down to the tower body (upper-2)'],
  [342, 346, 24, 'the standing siege tower: its own boarded frame and ladder, the deck is its top floor (upper-2)'],
  [354, 362, 24, 'the gatehouse gallery: a truss of struts under it into the wall (upper-2)'],
  [355, 355, 31, 'the gate arch (stone over the portcullis)'], [357, 357, 31, 'the gate arch (stone over the portcullis)'],
];
const BAKED = new Set(['timber']);   /* drawn by main.js's drawStructures itself: two 4 px posts, cross-braced, floor to deck (the bridges' trestles; screenshot upper-2 x290) */
const cache = {};
function visible(z) {
  if (BAKED.has(z.kind)) return null;
  const key = [z.kind, z.x1 - z.x0, z.floor - z.top].join(); if (key in cache) return cache[key];
  const w = (z.x1 - z.x0 + 1) * 16, h = (z.floor - z.top) * 16, c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); UBS.drawStructure(ctx, z.kind, 0, w, 0, h, z.x0);
  const d = ctx.getImageData(0, 0, w, h).data, on = (x, y) => d[(y * w + x) * 4 + 3] > 128;
  let thin = -1;
  for (let y = 0; y < h && thin < 0; y++) { let best = 0, run = 0; for (let x = 0; x < w; x++) { if (on(x, y)) { run++; if (run > best) best = run; } else run = 0; } if (best < 3) thin = y; }
  const seen = new Uint8Array(w * h), st = []; for (let x = 0; x < w; x++) if (on(x, 0)) { seen[x] = 1; st.push(x); }
  let reach = false; while (st.length) { const j = st.pop(), x = j % w, y = (j / w) | 0; if (y === h - 1) { reach = true; break; }
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const k = yy * w + xx; if (!seen[k] && on(xx, yy)) { seen[k] = 1; st.push(k); } } }
  return cache[key] = thin >= 0 ? 'thins to under 3 px at row ' + thin + ' of ' + h : !reach ? 'no unbroken path from its top to its bottom' : null;
}
const holds = (x0, x1, y, whole) => (L.structures || []).filter(z => (whole ? z.x0 <= x0 && z.x1 >= x1 : z.x1 >= x0 && z.x0 <= x1) && z.top <= y + 3 && z.floor > y + 1);
let n = 0, bare = [];
for (let y = 0; y < H - 1; y++) { let x = 0; while (x < W) {
  const t = g[y * W + x]; if (t === T.AIR || t === T.NET || g[(y + 1) * W + x] !== T.AIR) { x++; continue; }
  let x1 = x; while (x1 + 1 < W && g[y * W + x1 + 1] !== T.AIR && g[y * W + x1 + 1] !== T.NET && g[(y + 1) * W + x1 + 1] === T.AIR) x1++;
  let d = 0; while (y + 1 + d < H && g[(y + 1 + d) * W + x] === T.AIR) d++;
  if (d >= 3) { n++;
    const zs = holds(x, x1, y, t === T.PALISADE || t === T.SOLID), keyed = KEYED.find(k => k[0] <= x && k[1] >= x1 && k[2] === y);
    const good = zs.filter(z => !visible(z)), bad = zs.map(z => visible(z) && z.kind + ' ' + visible(z)).filter(Boolean);
    const why = keyed ? 'keyed' : good.length ? good.map(z => z.kind).join('+') : '';
    const label = N(t) + ' @' + x + (x1 > x ? '-' + x1 : '') + ',' + y;
    if (list) console.log(label.padEnd(24), 'air', String(d).padStart(2), why || 'NOT VISIBLE' + (bad.length ? ' (' + bad.join('; ') + ')' : ' (no footing)'));
    if (!why) bare.push(label + ' (' + d + ' rows of air under it; ' + (bad.length ? bad.join('; ') : 'no drawn footing') + ')'); }
  x = x1 + 1; } }
for (const b of bare) console.log('  FAIL floating: ' + b);
console.log(bare.length ? 'unburied-footings: ' + bare.length + ' overhang(s) with no visible footing' : 'ok  unburied-footings  ' + n + ' overhangs, every one on a visible footing or a keyed frame');
process.exit(bare.length ? 1 : 0);
