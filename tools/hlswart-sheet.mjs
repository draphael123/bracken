// tools/hlswart-sheet.mjs - before | after contact sheet (claude/hlswart): node tools/hlswart-sheet.mjs <beforedir> <afterdir> <out.png>  (one headless browser; same file names in both dirs)
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const [bd, ad, out] = process.argv.slice(2);
const names = readdirSync(ad).filter(n => /^\d\d-.*\.png$/.test(n) && readdirSync(bd).includes(n)).sort();
const u = p => 'data:image/png;base64,' + readFileSync(p).toString('base64');
const imgs = names.map(n => [u(join(bd, n)), u(join(ad, n)), n.replace(/\.png$/, '')]);
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async (imgs) => { const W = 480, H = 270, pad = 6, lab = 16, c = document.createElement('canvas'); c.width = 2 * W + 3 * pad; c.height = imgs.length * (H + lab + pad) + pad; const g = c.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false; g.font = '12px monospace';
    for (let i = 0; i < imgs.length; i++) { const y = pad + i * (H + lab + pad); g.fillStyle = '#ddd'; g.fillText(imgs[i][2] + '    BEFORE (greybox)  |  AFTER (art)', pad, y + 12);
      for (let j = 0; j < 2; j++) { const im = new Image(); await new Promise(r => { im.onload = r; im.src = imgs[i][j]; }); g.drawImage(im, pad + j * (W + pad), y + lab, W, H); } }
    return c.toDataURL('image/png'); })(${JSON.stringify(imgs)})`, 120000);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('sheet', names.length, '->', out);
} finally { await pg.close(); }
