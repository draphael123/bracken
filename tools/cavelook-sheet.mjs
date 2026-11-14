// tools/cavelook-sheet.mjs - master | new contact sheet from stills (claude/cavelook). One headless browser.
//   node tools/cavelook-sheet.mjs <dir> <out.png> <width-per-cell> <name[@x,y,w,h]> [<name[@x,y,w,h]> ...]
// For each name it lays <dir>/mst1-<name>.png (left, MASTER) beside <dir>/new-<name>.png (right, NEW); an optional crop (source pixels) magnifies a region.
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [dir, out, cw, ...names] = process.argv.slice(2), CW = +cw || 640;
const u = p => 'data:image/png;base64,' + readFileSync(p).toString('base64');
const rows = names.map(s => { const [nn, c] = s.split('@'), [na, nb] = nn.split('|'), n = nb ? na + ' / ' + nb : na; return { n, crop: c ? c.split(',').map(Number) : null, a: u(join(dir, 'mst1-' + na + '.png')), b: u(join(dir, 'new-' + (nb || na) + '.png')) }; });
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async (rows, CW) => { const pad = 6, lab = 16; const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
    const ims = []; for (const r of rows) ims.push([await load(r.a), await load(r.b)]);
    const hs = rows.map((r, i) => { const w = r.crop ? r.crop[2] : ims[i][0].width, h = r.crop ? r.crop[3] : ims[i][0].height; return Math.round(CW * h / w); });
    const c = document.createElement('canvas'); c.width = 2 * CW + 3 * pad; c.height = hs.reduce((s, h) => s + h + lab + pad, pad); const g = c.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false; g.font = '12px monospace';
    let y = pad; for (let i = 0; i < rows.length; i++) { g.fillStyle = '#ddd'; g.fillText(rows[i].n + '      MASTER 3df8e7fdb  |  NEW cavelook', pad, y + 12);
      for (let j = 0; j < 2; j++) { const im = ims[i][j], cr = rows[i].crop || [0, 0, im.width, im.height]; g.drawImage(im, cr[0], cr[1], cr[2], cr[3], pad + j * (CW + pad), y + lab, CW, hs[i]); } y += hs[i] + lab + pad; }
    return c.toDataURL('image/png'); })(${JSON.stringify(rows)}, ${CW})`, 120000);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('sheet', rows.length, '->', out);
} finally { await pg.close(); }
