// tools/ram-art-sheet.mjs - contact sheets of the SCREE 3 art as PNGs (claude/scree3art). Not in the suite. Needs a headless browser (one, ~1 GB).
//   usage: OUT=<dir> node tools/ram-art-sheet.mjs [poses|props|fx|all]   -> <dir>/sheet-*.png (4x, nearest-neighbour)
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUT || 'work/claude/scree3art-shots', what = process.argv[2] || 'all'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{ const res = [], S = 4, W = '${what}';
    const sheet = (name, w, h, draw) => { const c = document.createElement('canvas'); c.width = w * S; c.height = h * S; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#6a5a52'; g.fillRect(0, 0, c.width, c.height);
      const s = document.createElement('canvas'); s.width = w; s.height = h; const sg = s.getContext('2d'); sg.imageSmoothingEnabled = false; sg.fillStyle = '#6a5a52'; sg.fillRect(0, 0, w, h); draw(sg, w, h);
      g.drawImage(s, 0, 0, w * S, h * S); res.push([name, c.toDataURL('image/png')]); };
    if (W === 'poses' || W === 'all') { const { bakeRamLord } = await import('/src/redraw/callerram.js'); const R = bakeRamLord(); const idx = [0, 3, 5, 4, 7, 8, 9, 10];
      sheet('sheet-poses', 320, 140, (g, w, h) => { idx.forEach((i, k) => { const f = R.R[i], x = (k % 4) * 80 + 2, row = k >> 2, gy = 66 + row * 70; g.fillStyle = '#3e3024'; g.fillRect(x - 2, gy, 80, 3); g.drawImage(f, x, gy - R.ay + 1); }); }); }
    if (W === 'props' || W === 'all') { const { drawProp } = await import('/src/scree-lip.js'); const st = ['armed', 'glint', 'knock0', 'knock1', 'spent', 'rearm1', 'rearm2'];
      sheet('sheet-prop-states', 36 * 7, 44, (g, w, h) => { st.forEach((k, i) => { g.fillStyle = '#3e3024'; g.fillRect(i * 36, 38, 36, 6); drawProp(g, i * 36 + 18, 38, k, 1); }); }); }
    if (W === 'fx' || W === 'all') { const A = await import('/src/scree-art.js');
      sheet('sheet-boulder', 28 * 12, 30, (g) => { for (let k = 0; k < 12; k++) g.drawImage(A.boulderFrame(k / 12 * Math.PI * 2 + 0.01), k * 28 + 2, 3); });
      sheet('sheet-socket-ridge', 140, 40, (g) => { g.drawImage(A.boulderSocket(), 2, 4); g.drawImage(A.boulderFrame(0), 42, 12); for (let v = 0; v < 3; v++) { g.fillStyle = '#3e3024'; g.fillRect(70 + v * 26, 30, 26, 3); g.drawImage(A.shardRidge(v), 70 + v * 26, 24); } });
      sheet('sheet-crack-dust', 108 * 2, 78, (g) => { for (let v = 0; v < 3; v++) g.drawImage(A.stompCrack(v), 2, 4 + v * 12); for (let k = 0; k < 7; k++) g.drawImage(A.dustRing(k), 100 + (k % 2) * 0 - 0, 0 + 0); }); }
    return res; })()`, 120000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { await pg.close(); }
