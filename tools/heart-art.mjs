// tools/heart-art.mjs - THE HEART OF THE MOUNTAIN's art, rendered and linted in Node (claude/art4). No browser.
//   node tools/heart-art.mjs [out-prefix]  -> <prefix>-leaper.png, -crust.png, -set.png, -world.png
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const HA = await import('../src/redraw/heart_art.js');
const bad = []; let n = 0; const out = process.argv[2];
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
const big = (list, o, s = 2) => { const sh = sheet(list, o), c = newCanvas(sh.width * s, sh.height * s), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };
const cell = (w, h, bg, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g); return c; };
const colours = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, seen = new Set(); for (let i = 0; i < d.length; i += 4) seen.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]); return seen.size; };
/* 1. THE LEAPER: 7 poses, one size, all different, flash silhouette = sprite */
const LP = HA.bakeLeaper(); n++;
if (LP.R.length !== 7) bad.push('leaper: ' + LP.R.length + ' frames (7 expected)');
const sg = LP.R.map(sig); for (let i = 0; i < LP.R.length; i++) { n++; if (sg[i].k < 120) bad.push('leaper ' + i + ': barely drawn (' + sg[i].k + ')'); for (let j = 0; j < i; j++) if (sg[j].h === sg[i].h) bad.push('leaper ' + i + ' == frame ' + j); if (sig(LP.white.R[i]).k !== sg[i].k) bad.push('leaper ' + i + ': flash silhouette differs'); }
const under = cell(120, 36, '#c8321a', g => { HA.drawLeaper(g, 20, 30, 1, 'under', 0, 0.3, false, 24); HA.drawLeaper(g, 60, 30, 1, 'leapTell', 0, 0.4, false, 24, 0.5); HA.drawLeaper(g, 100, 30, -1, 'under', 0, 0.9, false, 24); });
if (out) savePNG(big([...LP.R, under], { maxW: 700, bg: '#5a2a20', pad: 4 }, 4), out + '-leaper.png');
/* 2. THE CRUST: cool at k 0 / .5 / 1, held, warn, melted - on a magma bed */
const crustRow = (k, st, id) => cell(130, 26, '#7a2210', g => { HA.drawMagmaSkin(g, 0, 130, 14, k, st === 'melted' ? 1 : 0, 0.5, 3, 12); HA.drawCrust(g, 6, 124, 6, k, st, 0.3, id); });
const crusts = [[0, 'cool'], [0.5, 'cool'], [1, 'cool'], [0, 'held'], [0, 'warn'], [1, 'melted']].map(([k, st], i) => crustRow(k, st, 4 + i));
for (const c of crusts) { n++; if (colours(c) < 6) bad.push('crust cell barely drawn'); }
if (out) savePNG(big(crusts, { maxW: 560, bg: '#000', pad: 4 }, 3), out + '-crust.png');
/* 3. THE SET: wards (idle / holding / warn / spent), a chain, vents (still / warm / blow), the ledge column, the seal door shut and open */
const parts = [
  ['wards', cell(260, 70, '#1a1216', g => { HA.drawWard(g, 24, 64, 0, 2, 0, 0.3, 0); HA.drawWard(g, 78, 64, 8, 2, 0, 0.3, 1); HA.drawWard(g, 132, 64, 1, 2, 0, 0.3, 0); HA.drawWard(g, 186, 64, 0, 2, 2.1, 0.3, 0); HA.drawWardLine(g, 90, 46, 240, 30, 0.2); })],
  ['chain k0/k1', cell(70, 110, '#2a1c20', g => { HA.drawHeartChain(g, 18, 0, 104, 0.1, 0, 0.2); HA.drawHeartChain(g, 52, 0, 104, 0.45, 1, 0.2); })],
  ['vents', cell(170, 100, '#1a1216', g => { HA.drawHeartVent(g, 24, 94, 9, 90, 'still', 0, 0.3); HA.drawHeartVent(g, 70, 94, 9, 90, 'warm', 0.8, 0.3); HA.drawHeartVent(g, 130, 94, 9, 90, 'blow', 1, 0.3); })],
  ['column + door shut/open', cell(240, 140, '#1a1216', g => { HA.drawColumn(g, 0, 56, 6, 100, 0.4); g.fillStyle = '#33262c'; g.fillRect(0, 100, 240, 30); HA.drawSealDoor(g, 100, 60, 130, true, 0.6, 0.3); HA.drawSealDoor(g, 180, 60, 130, false, 0.2, 0.3); })],
  ['backdrop zone 0 / pulse / zone 1', cell(360, 110, '#000', g => { const sub = (x, p, z) => { const c = newCanvas(115, 100), h = c.getContext('2d'); HA.drawHeartBackdrop(h, 300, 600, 115, 100, {}, 0.5 + x, 0, false, p, z); g.drawImage(c, x * 120 / 1, 5); }; sub(0, 0, 0); sub(1, 1, 0.5); sub(2, 0, 1); })],
];
for (const [name, c] of parts) { n++; if (colours(c) < 6) bad.push(name + ': barely drawn (' + colours(c) + ' colours)'); }
if (out) savePNG(big(parts.map(p => p[1]), { maxW: 780, bg: '#000', pad: 6 }, 2), out + '-set.png');
console.log(n + ' checked, ' + bad.length + ' bad' + (bad.length ? '\n  ' + bad.join('\n  ') : '')); process.exit(bad.length ? 1 : 0);
