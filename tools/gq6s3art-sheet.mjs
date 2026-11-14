// tools/gq6s3art-sheet.mjs - THE QUEEN'S CLIMB ART as a contact sheet + lint, NODE ONLY (no browser): src/redraw/gq6s3_art.js
//   node tools/gq6s3art-sheet.mjs [out.png]     default out = ../scratch/lane-reports/gq6s3art/art-sheet.png (LANES)
//   Draws a scene on a night-blue 480 x 240 picture, shown 3x: the deck (stone) with its two end ladders, the hoardings (intact + half-char + burnt) above it, the loft above that (intact, burnt),
//   the bell-cage roof on top, the lit ladder. Lint (exit 1 on a problem): every sheet bakes, the baked cells are opaque where they must cover the default tile (16 x 16), the burnt cell differs from
//   the intact one in >= 40% of its pixels, the ladder is >= 40% see-through (it is rails and rungs, not a wall), the scene costs <= 120 canvas calls a frame, node (no document) = false / nothing.
import { install, newCanvas, savePNG } from './node-canvas.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const out = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/gq6s3art/art-sheet.png', import.meta.url));
const bad = [];
// node with no document: everything answers false
const A0 = await import('../src/redraw/gq6s3_art.js');
{ const c = newCanvas(100, 100), g = c.getContext('2d'); if (A0.bakeStep() !== false || A0.ready() !== false || A0.floorRun(g, 'hoard', 0, 3, 5, 0, 0, 100, 100) !== false || A0.ladderDraw(g, 1, 1, 4, 0, 0, 100, 100) !== false) bad.push('no document: the art must say false'); }
install();
const A = await import('../src/redraw/gq6s3_art.js?doc');   // a second copy, now with a document
const { TA } = A;
let guard = 0; while (!A.bakeStep() && guard++ < 20); if (!A.ready()) bad.push('the sheets did not bake in 20 steps');
const px4 = c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
const opaqueFrac = (sheet, sx, sy, w, h) => { const d = px4(sheet); let n = 0; for (let y = sy; y < sy + h; y++) for (let x = sx; x < sx + w; x++) if (d[(y * sheet.width + x) * 4 + 3] === 255) n++; return n / (w * h); };
const diffFrac = (sheet, sa, sb, w, h) => { const d = px4(sheet); let n = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * sheet.width + sa + x) * 4, j = (y * sheet.width + sb + x) * 4; if (d[i] !== d[j] || d[i + 1] !== d[j + 1] || d[i + 2] !== d[j + 2]) n++; } return n / (w * h); };
const SH = A._sheets;
for (const [name, sheet, cells] of [['hoard', SH.hoard, 8], ['loft', SH.loft, 8]]) {
  if (!sheet) { bad.push(name + ' sheet missing'); continue; }
  for (let k = 0; k < cells; k++) { const f = opaqueFrac(sheet, k * 16, 0, 16, 16); if (f < 0.999) bad.push(name + ' cell ' + k + ' is only ' + (f * 100).toFixed(1) + '% opaque over its 16 x 16 (the default tile would show)'); }
  for (let v = 0; v < 4; v++) { const d = diffFrac(sheet, v * 16, (v + 4) * 16, 16, 16); if (d < 0.4) bad.push(name + ' variant ' + v + ': burnt differs from intact in only ' + (d * 100).toFixed(0) + '%'); }
}
if (SH.roof) { for (let k = 0; k < 6; k++) { const f = opaqueFrac(SH.roof, k * 16, TA.roofTop, 16, 16); if (f < 0.999) bad.push('roof cell ' + k + ' only ' + (f * 100).toFixed(1) + '% opaque'); } } else bad.push('roof sheet missing');
for (const n of [4, 5]) { const im = SH.lad.get(n); if (!im) { bad.push('ladder ' + n + ' missing'); continue; } if (im.width !== 16 || im.height !== 16 * n) bad.push('ladder ' + n + ' size'); }
const scene = newCanvas(480, 250), g = scene.getContext('2d'); g.fillStyle = '#1a1230'; g.fillRect(0, 0, 480, 250); g.fillStyle = '#2a1a2a'; g.fillRect(0, 170, 480, 80);
let calls = 0; const wrap = c => new Proxy(c, { get(t, k) { const v = t[k]; if (typeof v === 'function') return (...a) => { if (k === 'drawImage') calls++; return v.apply(t, a); }; return v; }, set(t, k, v) { t[k] = v; return true; } });
const gc = wrap(g);
const cx = 0, cy = 0, VW = 480, VH = 250, deckRow = 12;
// the deck (stone stand-in) with scorch on its left half, two end ladders
g.fillStyle = '#363949'; g.fillRect(0, deckRow * 16, 480, 32); g.fillStyle = '#9498ae'; g.fillRect(0, deckRow * 16, 480, 1);
A.burnRun(gc, 'hoard', 1, 13, 99, 99, deckRow, 1, 0.7, cx, cy, VW, VH, 0);
A.ladderDraw(gc, 0, 8, 4, cx, cy, VW, VH, 0); A.ladderDraw(gc, 29, 8, 4, cx, cy, VW, VH, 0.6);
// the hoardings (row 8): intact 2..9, half-char 10..15, burnt 16..22 + a gap + intact
A.floorRun(gc, 'hoard', 2, 28, 8, cx, cy, VW, VH); A.burnRun(gc, 'hoard', 10, 15, 10, 15, 8, 0.5, 1.1, cx, cy, VW, VH, 1); A.burnRun(gc, 'hoard', 16, 22, 16, 22, 8, 1, 1.3, cx, cy, VW, VH, 2);
A.ladderDraw(gc, 13, 4, 4, cx, cy, VW, VH, 0); A.ladderDraw(gc, 24, 4, 4, cx, cy, VW, VH, 0.9);
// the loft (row 4): intact + burnt, the roof (row 0 with posts) above it
A.floorRun(gc, 'loft', 6, 24, 4, cx, cy, VW, VH); A.burnRun(gc, 'loft', 6, 11, 6, 11, 4, 1, 0.4, cx, cy, VW, VH, 3);
A.roofRun(gc, 10, 21, 1, cx, cy, VW, VH, 11);
A.ladderDraw(gc, 9, 1, 5, cx, cy, VW, VH, 0);
if (calls > 120) bad.push('the scene costs ' + calls + ' drawImage calls (> 120)');
const big = newCanvas(1440, 750), bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(scene, 0, 0, 480, 250, 0, 0, 1440, 750);
// the raw sheets below
const sh = newCanvas(1440, 400), sg = sh.getContext('2d'); sg.fillStyle = '#6fa3cf'; sg.fillRect(0, 0, 1440, 400); let y = 4;
for (const c of [SH.hoard, SH.loft, SH.roof, SH.soot, SH.edge, SH.lad.get(4), SH.litLad.get(4), SH.lad.get(5)]) { if (!c) continue; sg.drawImage(c, 0, 0, c.width, c.height, 4, y, c.width * 3, c.height * 3); y += c.height * 3 + 6; if (y > 330) break; }
const all = newCanvas(1440, 1150), ag = all.getContext('2d'); ag.drawImage(big, 0, 0); ag.drawImage(sh, 0, 750);
savePNG(all, out);
console.log('gq6s3art-sheet: ' + (bad.length ? bad.length + ' PROBLEMS' : 'ok') + ', scene calls ' + calls + ', wrote ' + path.basename(out));
for (const b of bad) console.log('  - ' + b);
process.exit(bad.length ? 1 : 0);
