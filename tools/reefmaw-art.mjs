/* tools/reefmaw-art.mjs - THE REEFMAW ON LAND (src/redraw/reef.js, bakeReefmaw().land; docs/briefs/reef-longer.md), rendered in Node:
   every land frame, right-facing, then the first flipped, x3 on the reef's grey, into work/reef2/reefmaw-land-sheet.png. And the
   contract a boss sprite owes:
     1. one canvas for every land frame, grounded (the lowest body pixel on ay-1 and its outline on ay, as every reef.js set: the anchor holds in every pose)
     2. EVERY TELL HAS ITS OWN POSE: the lunge's coil and the reared tail are neither of them his crawl, and not each other
     3. THE OPENING LOOKS LIKE ONE: belly-up is not the crawl, and the two roll frames are each other turned over
   Node renders lie about light (docs/AGENT-HANDOFF.md) but not about construction. usage: node tools/reefmaw-art.mjs [out.png] */
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const A = await import('../src/redraw/reef.js');
const S0 = A.bakeReefmaw(), S = S0.land;
assert.ok(S && S.R, 'bakeReefmaw() has no .land set');
const NAMES = ['CRAWL', 'CRAWL 2', 'LUNGE TELL', 'LUNGE', 'TAIL TELL', 'TAIL', 'ROLL', 'ROLL 2', 'BEACHED', 'HAUL', 'DEAD'];
assert.equal(S.R.length, NAMES.length, 'a frame for every name');
const w = S.R[0].width, h = S.R[0].height;
assert.ok(S.R.every(c => c.width === w && c.height === h), 'every frame the same canvas');
const low = S.R.map(c => { const d = c._d; for (let y = c.height - 1; y >= 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) return y; return -1; });
low.forEach((y, i) => assert.equal(y, S.ay, NAMES[i] + ' is not grounded on the anchor (lowest row ' + y + ', ay ' + S.ay + ')'));
const hash = c => { const d = c._d; let x = 2166136261; for (let i = 0; i < d.length; i++) x = Math.imul(x ^ d[i], 16777619) >>> 0; return x; };
const H = S.R.map(hash);
for (const [a, b] of [[2, 0], [2, 1], [4, 0], [4, 1], [2, 4], [8, 0], [3, 0], [5, 0], [6, 7]]) assert.notEqual(H[a], H[b], NAMES[a] + ' wears the same picture as ' + NAMES[b]);
/* how far forward the jaw reaches in the lunge, against the crawl: the head must be DRIVEN, not just opened */
const reach = c => { const d = c._d; for (let x = c.width - 1; x >= 0; x--) for (let y = 0; y < c.height; y++) if (d[(y * c.width + x) * 4 + 3]) return x; return -1; };
assert.ok(reach(S.R[3]) - reach(S.R[0]) >= 8, 'the lunge does not drive the head forward of the crawl (' + reach(S.R[3]) + ' vs ' + reach(S.R[0]) + ')');
const K = 3, cols = 4, cellW = w + 8, cellH = h + 10, rows = Math.ceil((S.R.length + 2) / cols);
const out = newCanvas(cols * cellW * K, rows * cellH * K), g = out.getContext('2d');
g.fillStyle = '#2c3a40'; g.fillRect(0, 0, out.width, out.height);
const all = [...S.R.map((c, i) => [c, NAMES[i]]), [S.L[0], 'FACING LEFT'], [S0.R[4], 'IN THE WATER: BITE']];
all.forEach(([c], i) => {
  const x0 = (i % cols) * cellW, y0 = Math.floor(i / cols) * cellH;
  g.fillStyle = '#3c4e56'; g.fillRect((x0 + 2) * K, (y0 + 2) * K, (w + 4) * K, (h + 2) * K);
  g.fillStyle = '#5a6068'; g.fillRect((x0 + 2) * K, (y0 + 2 + h) * K, (w + 4) * K, 2 * K);   /* the floor line under him */
  const d = c._d; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const j = (y * c.width + x) * 4; if (!d[j + 3]) continue;
    g.fillStyle = 'rgb(' + d[j] + ',' + d[j + 1] + ',' + d[j + 2] + ')'; g.fillRect((x0 + 4 + x) * K, (y0 + 2 + y - (c.height - h)) * K, K, K); }
});
const path = process.argv[2] || new URL('../work/reef2/reefmaw-land-sheet.png', import.meta.url);
mkdirSync(new URL('../work/reef2/', import.meta.url), { recursive: true });
savePNG(out, path);
console.log('reefmaw land art: ' + S.R.length + ' frames ' + w + 'x' + h + ', grounded, every tell its own pose; sheet order (four to a row): ' + all.map(([, n]) => n).join(', '));
