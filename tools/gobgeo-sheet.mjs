// tools/gobgeo-sheet.mjs - THE GOBLIN GEOMANCER's art, rendered and linted in Node (claude/gobgeo). NO browser.
//   node tools/gobgeo-sheet.mjs [out.png]   -> contact sheet (default work/claude/lane-done/gobgeo-sheet.png): his 15 frames x3, flipped L x3, his stone and the seals x3.
//   Lint: one canvas size; every frame drawn (>= 250 px) and none the same as another; the flash silhouette is the frame's; every mode has a frame; the hurt pose is LAST.
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
install();
const A = await import('../src/redraw/gob_geomancer_art.js');
const out = process.argv[2] || 'work/claude/lane-done/gobgeo-sheet.png';
const bad = [];
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
const S = A.bakeGobGeomancer(), sigs = S.R.map(sig);
if (S.R.length !== A.GG_FRAMES) bad.push('frames ' + S.R.length + ' != ' + A.GG_FRAMES);
S.R.forEach((c, i) => { if (c.width !== S.R[0].width || c.height !== S.R[0].height) bad.push('frame ' + i + ': size'); if (sigs[i].k < 250) bad.push('frame ' + i + ': barely drawn (' + sigs[i].k + ')'); });
const seen = new Map(); sigs.forEach((s, i) => { if (seen.has(s.h)) bad.push('frame ' + i + ' draws the same as ' + seen.get(s.h)); else seen.set(s.h, i); });
S.white.R.forEach((c, i) => { if (sig(c).k !== sigs[i].k) bad.push('frame ' + i + ': flash silhouette differs'); });
if (A.GGF.hurt !== A.GG_FRAMES - 1) bad.push('the hurt pose is not the last frame (main.js HAS_HURT draws R.length - 1)');
for (const m of ['idle', 'walk', 'rockTell', 'slateTell', 'shellTell', 'release', 'stagger']) { const f = A.ggFrame({ mode: m, anim: 0.3, vx: m === 'walk' ? 30 : 0, relMove: 'rockTell' }); if (!(f >= 0 && f < A.GG_FRAMES)) bad.push('mode ' + m + ' has no frame'); }
for (const [a, b] of [['rockTell', 'rock'], ['slateTell', 'slate'], ['shellTell', 'shell']]) if (A.GGF[a] === A.GGF[b]) bad.push(a + ' and its release share a frame');
/* the sheet */
const up = (c, s) => { const o = newCanvas(c.width * s, c.height * s), g = o.getContext('2d'); for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const d = c.getContext('2d').getImageData(x, y, 1, 1).data; if (!d[3]) continue; g.fillStyle = 'rgba(' + d[0] + ',' + d[1] + ',' + d[2] + ',' + d[3] / 255 + ')'; g.fillRect(x * s, y * s, s, s); } return o; };
const cell = (w, h, bg, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g); return c; };
const parts = cell(150, 40, '#2a2d38', g => { A.drawRock(g, 10, 20, 0.1, false, 0); A.drawRock(g, 24, 20, 0.2, true, 1); A.drawSlate(g, 42, 20, 1, 0, false); A.drawSlate(g, 58, 20, 1, -0.4, true);
  for (let k = 0; k < 4; k++) A.drawChunk(g, 74 + k * 9, 20, k, k & 1); A.drawSeal(g, 122, 20, 0.3, 0); A.drawSeal(g, 140, 20, 0.3, 1); });
const face = cell(60, 50, '#2a2d38', g => { g.fillStyle = '#3e4150'; g.fillRect(10, 2, 40, 46); A.drawCrackedFace(g, 14, 6, 16, 40, 0.5); });
const shell = cell(80, 60, '#2a2d38', g => A.drawShell(g, 40, 30, 22, 0.3));
const items = [...S.R.map(c => up(c, 3)), ...S.L.slice(0, 8).map(c => up(c, 3)), up(parts, 3), up(face, 3), up(shell, 3)];
const sh = sheet(items, { maxW: 1200, bg: '#4a6a8a' });
mkdirSync(path.dirname(out), { recursive: true }); savePNG(sh, out);
if (bad.length) { console.log('gobgeo-sheet: ' + bad.length + ' problems\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('gobgeo-sheet: ok - ' + A.GG_FRAMES + ' frames (' + S.R[0].width + 'x' + S.R[0].height + '), all distinct, flash silhouettes match; sheet -> ' + out);
