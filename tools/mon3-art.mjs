// tools/mon3-art.mjs - MONASTERY 3's art, rendered and linted in Node (claude/art4). No browser.
//   node tools/mon3-art.mjs [out-prefix]  -> <prefix>-swinger.png, -props.png, -rooms.png
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const MA = await import('../src/redraw/mon3_art.js');
const MON = await import('../src/redraw/monastery.js');
const bad = []; let n = 0; const out = process.argv[2];
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
const big = (list, o, s = 2) => { const sh = sheet(list, o), c = newCanvas(sh.width * s, sh.height * s), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };
/* 1. the censer-swinger: the priest's ten frames, one size, every one different from the priest's own, flash silhouette = sprite */
const P = MON.bakeGoblinPriest(), S = MA.bakeCenserSwinger(); n++;
if (S.R.length !== P.R.length) bad.push('swinger: ' + S.R.length + ' frames (' + P.R.length + ' expected)');
for (let i = 0; i < S.R.length; i++) { n++; if (S.R[i].width !== P.R[i].width || S.R[i].height !== P.R[i].height) bad.push('swinger ' + i + ': size'); if (sig(S.R[i]).h === sig(P.R[i]).h) bad.push('swinger ' + i + ' == the priest\'s frame'); if (sig(S.white.R[i]).k !== sig(S.R[i]).k) bad.push('swinger ' + i + ': flash silhouette differs'); }
if (new Set(S.R.map(c => sig(c).h)).size < 9) bad.push('swinger: frames too alike');
if (out) savePNG(big([...P.R.slice(0, 5), ...S.R], { maxW: 520, bg: '#444', pad: 3 }, 3), out + '-swinger.png');
/* 2. the props */
const PR = MA.bakeMon3Props(); for (const c of [...PR.statueDefaced, ...PR.crate]) { n++; if (sig(c).k < 60) bad.push('prop barely drawn'); }
const cell = (w, h, bg, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g); return c; };
if (out) savePNG(big([...PR.statueDefaced, ...PR.crate, cell(60, 40, '#2a2420', g => { MA.drawCandle(g, 12, 36, true, 0.3); MA.drawCandle(g, 30, 36, false, 0.9, 2); MA.drawCandle(g, 48, 36, true, 1.7, 5); })], { maxW: 300, bg: '#555', pad: 6 }, 4), out + '-props.png');
/* 3. the rooms: each draw call must paint something and throw nothing */
const rooms = [
  ['feast tables', cell(260, 80, '#2a2218', g => { g.fillStyle = '#d8cfc0'; g.fillRect(0, 70, 260, 10); MA.drawTables(g, [[1, 7, 3, 5], [9, 15, 2, 5]], 0, 0, 260, 80, 0.4); })],
  ['chandelier', cell(160, 60, '#2a2218', g => { MA.drawChandeliers(g, [[5, 0, 3, 1, 9]], 0, 0, 160, 60, 0.4); })],
  ['flue', cell(110, 150, '#3a3228', g => { MA.drawFlue(g, [[0, 5, 0, 8]], 0, 0, 110, 150, 0.7); })],
  ['nook', cell(60, 40, '#6a5a44', g => { MA.drawNook(g, [[0, 2, 0, 1]], 0, 0, 60, 40, 0.5); })],
  ['cells', cell(160, 100, '#4a4034', g => { MA.drawCells(g, [[0, 9, 166, 181]], 0, 177 * 16 - 90, 160, 100, 0.5); })],
  ['dorter', cell(200, 60, '#4a4034', g => { MA.drawDorter(g, [[0, 12, 5, 0]], 0, 0, 200, 60, 0.5); MA.drawBunks(g, [[0, 3, 4], [5, 3, 4]], 0, 0, 200, 60); })],
  ['cliff', cell(180, 80, '#7a8aa0', g => { MA.drawCliffBack(g, [[40, 30]], 0, 0, 180, 80); g.fillStyle = '#6a6460'; g.fillRect(100, 40, 48, 40); MA.drawSpires(g, [[6, 2, 3]], 0, 0, 180, 80); })],
  ['rope bell + bridge up/lowering/down', cell(340, 130, '#8aa0c0', g => { MA.drawRopeBell(g, 18, 44, false, 0); MA.drawRopeBell(g, 48, 44, true, 0);
    MA.drawBridge(g, { hx: 330, ry: 112, len: 120, left: false, k: 0, down: false, time: 0.3 }); MA.drawBridge(g, { hx: 330, ry: 112, len: 120, left: false, k: 0.5, down: false, time: 0.3 }); })],
];
for (const [name, c] of rooms) { n++; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, seen = new Set(); for (let i = 0; i < d.length; i += 4) seen.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]); if (seen.size < 6) bad.push(name + ': barely drawn (' + seen.size + ' colours)'); }
if (out) savePNG(big(rooms.map(r => r[1]), { maxW: 700, bg: '#000', pad: 6 }, 2), out + '-rooms.png');
console.log(n + ' checked, ' + bad.length + ' bad' + (bad.length ? '\n  ' + bad.join('\n  ') : '')); process.exit(bad.length ? 1 : 0);
