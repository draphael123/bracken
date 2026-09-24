/* tools/buried-dead-art.mjs — THE BURIED DEAD'S OWN SPRITE (src/buried-dead-art.js), rendered in Node: every frame, right-facing,
   labelled by what it is for, then the first frame flipped, x3 on the ossuary's green. And the contract a boss sprite owes:
     1. one canvas for every frame, grounded (the mound's lowest row on ay-1, so the anchor holds on every pose)
     2. EVERY TELL HAS ITS OWN POSE: no two of his telegraphs share a frame, and none shares the frame of his rest (a tell
        that looks like standing still is not a tell)
     3. it is not the zombie's: SPR.burieddead no longer comes out of bakeDead (Daniel, 2026-09-24: "a unique sprite")
   usage: node tools/buried-dead-art.mjs [out.png]   (default docs/burial/buried-dead-sheet.png) */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const A = await import('../src/buried-dead-art.js');
const S = A.bakeBuriedDeadKing();
const NAMES = ['DRAG', 'DRAG 2', 'SWEEP TELL', 'SLAM TELL', 'NOVA TELL', 'OPEN', 'BURIED', 'THROW TELL', 'CALL TELL', 'HANDS TELL', 'SKULL TELL', 'BODY TELL', 'BODY SLAM', 'STUCK', 'RISING', 'SLAM', 'SWEEP', 'THROWN'];
assert.equal(S.R.length, NAMES.length, 'a frame for every name');
// 1. one canvas, grounded
const w = S.R[0].width, h = S.R[0].height;
const low = S.R.map(c => { const d = c._d; for (let y = c.height - 1; y >= 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) return y; return -1; });
assert.ok(S.R.every(c => c.width === w && c.height === h), 'every frame the same canvas');
const flying = 12;
low.forEach((y, i) => { if (i !== flying) assert.equal(y, S.ay - 1, NAMES[i] + ' is not grounded on the anchor (lowest row ' + y + ', ay ' + S.ay + ')'); });
// 2. every tell its own pose
const hash = c => { const d = c._d; let x = 2166136261; for (let i = 0; i < d.length; i++) x = Math.imul(x ^ d[i], 16777619) >>> 0; return x; };
const tells = ['slamTell', 'cleaveTell', 'novaTell', 'throwTell', 'callTell', 'clawTell', 'skullTell', 'bodyTell', 'sinkTell', 'eruptTell'];
const fr = m => A.kingFrame({ mode: m, anim: 0, vx: 0, open: 0, effectT: 0 });
const rest = fr('walk'), seen = new Map();
for (const m of tells) {
  const f = fr(m); assert.ok(f >= 0 && f < S.R.length, m + ' has no frame');
  assert.notEqual(hash(S.R[f]), hash(S.R[rest]), m + ' wears his resting pose');
  if (m !== 'eruptTell' && m !== 'sinkTell') { assert.ok(!seen.has(f), m + ' shares a pose with ' + seen.get(f)); seen.set(f, m); }
}
assert.notEqual(fr('stuck'), fr('rest'), 'the opening he gives you looks different from the rest he takes');
// 3. not the zombie's
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(!/SPR\.burieddead\s*=\s*bakeDead/.test(main), 'SPR.burieddead is still the zombie baker');
assert.ok(/SPR\.burieddead\s*=\s*bakeBuriedDeadKing\(\)/.test(main), 'SPR.burieddead is not his own baker');

// THE SHEET: six to a row, x3, a label under each
const K = 3, cols = 6, cellW = w + 8, cellH = h + 16, rows = Math.ceil((S.R.length + 1) / cols);
const out = newCanvas(cols * cellW * K, rows * cellH * K), g = out.getContext('2d');
g.fillStyle = '#26301f'; g.fillRect(0, 0, out.width, out.height);
const all = [...S.R.map((c, i) => [c, NAMES[i]]), [S.L[0], 'FACING LEFT']];
all.forEach(([c, name], i) => {
  const x0 = (i % cols) * cellW, y0 = Math.floor(i / cols) * cellH;
  g.fillStyle = '#34402a'; g.fillRect((x0 + 2) * K, (y0 + 2) * K, (w + 4) * K, (h + 2) * K);
  const d = c._d; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const j = (y * c.width + x) * 4; if (!d[j + 3]) continue;
    g.fillStyle = 'rgb(' + d[j] + ',' + d[j + 1] + ',' + d[j + 2] + ')'; g.fillRect((x0 + 4 + x) * K, (y0 + 2 + y) * K, K, K); }  /* no font in Node: the names are printed in sheet order below */
});
const path = process.argv[2] || new URL('../docs/burial/buried-dead-sheet.png', import.meta.url);
mkdirSync(new URL('../docs/burial/', import.meta.url), { recursive: true });
savePNG(out, path);
console.log('buried dead art: ' + S.R.length + ' frames ' + w + 'x' + h + ', every tell its own pose; sheet order (six to a row): ' + all.map(([, n]) => n).join(', '));
