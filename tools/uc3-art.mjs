// tools/uc3-art.mjs - UNDERCROWN 3's art, rendered and linted in Node (claude/uc3art). No browser.
//   node tools/uc3-art.mjs [out-prefix]  -> <prefix>-prince.png, -parts.png, -fireman.png
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
{ const P = Object.getPrototypeOf(newCanvas(2, 2).getContext('2d')); P.rotate = function () {}; }
const PR = await import('../src/redraw/prince.js');
const UA = await import('../src/redraw/uc3_art.js');
const bad = []; let n = 0; const out = process.argv[2];
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
const big = (list, o, s = 2) => { const sh = sheet(list, o), c = newCanvas(sh.width * s, sh.height * s), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };
/* 1. the Prince: the new poses (24-28) differ from every other frame, hop tell != hop, the flash silhouette = the sprite */
const P = PR.bakeBuriedPrince(), F = PR.PRINCE_F, sg = P.R.map(sig);
if (P.R.length !== 29) bad.push('prince: ' + P.R.length + ' frames (29 expected)');
for (const [nm, i] of [['coil', F.coil], ['leap', F.leap], ['duck', F.duck], ['spark', F.spark], ['scorched', F.scorched]]) { n++;
  if (sg[i].k < 1500) bad.push('prince ' + nm + ': barely drawn (' + sg[i].k + ')');
  for (let j = 0; j < P.R.length; j++) if (j !== i && sg[j].h === sg[i].h) bad.push('prince ' + nm + ' == frame ' + j);
  if (sig(P.white.R[i]).k !== sg[i].k) bad.push('prince ' + nm + ': flash silhouette differs');
  if (P.R[i].width !== P.R[0].width) bad.push('prince ' + nm + ': size'); }
if (out) savePNG(big([0, F.cut, F.heave, F.coil, F.leap, F.duck, F.spark, F.scorched].map(i => P.R[i]), { maxW: 8 * 106, bg: '#2a2030', pad: 4 }, 1), out + '-prince.png');
/* 2. the fireman: 8 frames, one size, the navvy's count, all different bodies from frame 0 where they should be */
const FM = UA.bakeFireman(); n++;
if (FM.R.length !== 8) bad.push('fireman: ' + FM.R.length + ' frames (8 = the miner\'s)'); if (new Set(FM.R.map(c => sig(c).h)).size < 5) bad.push('fireman: frames too alike');
if (out) savePNG(big(FM.R, { maxW: 400, bg: '#444', pad: 4 }, 4), out + '-fireman.png');
/* 3. the parts */
const cell = (w, h, bg, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g); return c; };
const parts = [
  ['gas calm/ready/fuse', cell(240, 70, '#1a1a16', g => { g.fillStyle = '#2a2a24'; g.fillRect(0, 0, 240, 4); UA.drawGas(g, 4, 4, 70, 14, 0.5, { fill: 0.3 }); UA.drawGas(g, 84, 4, 70, 24, 0.5, { rdy: true, fill: 1 }); UA.drawGas(g, 164, 4, 72, 24, 0.5, { hot: true, rdy: true, fill: 1 }); })],
  ['blast 0.1/0.4 + soot', cell(240, 60, '#1a1a16', g => { UA.drawBlast(g, { l: 4, r: 100, t: 4, b: 28 }, 0.1); UA.drawBlast(g, { l: 110, r: 150, t: 4, b: 28 }, 0.4); UA.drawSoot(g, 160, 76, 4, 14, 3); })],
  ['doors shut/open/flash', cell(120, 60, '#1a1a16', g => { UA.drawBrattice(g, 20, 6, 52, false, 0.3); UA.drawBrattice(g, 60, 6, 52, true, 0.3); UA.drawBrattice(g, 100, 6, 52, false, 0.3, 1); })],
  ['canary sing/rdy', cell(100, 40, '#1a1a16', g => { UA.drawCage(g, 25, 36, 0.5, false, 0.8, 0.4); UA.drawCage(g, 70, 36, 0.5, true, 0, 1); })],
  ['pole low/raised', cell(100, 70, '#1a1a16', g => { UA.drawPole(g, 25, 60, 34, 1, 0.3, false); UA.drawPole(g, 70, 60, 22, 1, 0.3, true); })],
  ['rubble shelf/bridge', cell(240, 80, '#1a1a16', g => { g.fillStyle = '#3a3440'; g.fillRect(0, 70, 240, 10); const T = 16;
    UA.drawFallenRubble(g, { state: 'flat', x0: 1, x1: 5, row: 2, flat: { row: 2, deep: 1, land: 4, kind: 'shelf' } }, 0, 0, T, 0); g.fillStyle = '#a89c8c'; g.fillRect(16, 32, 96, 16);
    UA.drawFallenRubble(g, { state: 'flat', x0: 8, x1: 12, row: 3, flat: { row: 3, deep: 1, land: 5, kind: 'bridge' } }, 0, 0, T, 0); })],
];
for (const [name, c] of parts) { n++; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, seen = new Set(); for (let i = 0; i < d.length; i += 4) seen.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]); if (seen.size < 4) bad.push('part ' + name + ': ' + seen.size + ' colours'); }
if (out) savePNG(big(parts.map(p => p[1]), { maxW: 760, bg: '#000', pad: 6 }, 2), out + '-parts.png');
console.log(n + ' checked, ' + bad.length + ' bad' + (bad.length ? '\n  ' + bad.join('\n  ') : '')); process.exit(bad.length ? 1 : 0);
