// tools/cavelook-diffmap.mjs - where two stills differ (claude/cavelook): node tools/cavelook-diffmap.mjs a.png b.png out.png  -> bounding box, grid of counts, and a map (differing pixels red over a dimmed copy of b)
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [a, b, out] = process.argv.slice(2), u = p => 'data:image/png;base64,' + readFileSync(p).toString('base64');
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async (ua, ub) => { const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; }); const A = await load(ua), B = await load(ub), w = A.width, h = A.height;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, w, h).data; g.clearRect(0, 0, w, h); g.drawImage(B, 0, 0); const im = g.getImageData(0, 0, w, h), db = im.data;
  const grid = Array.from({ length: 6 }, () => Array(8).fill(0)); let x0 = w, y0 = h, x1 = 0, y1 = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) { grid[Math.floor(y * 6 / h)][Math.floor(x * 8 / w)]++; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); db[i] = 255; db[i + 1] = 0; db[i + 2] = 255; } else { db[i] >>= 2; db[i + 1] >>= 2; db[i + 2] >>= 2; } }
  g.putImageData(im, 0, 0); return { box: [x0, y0, x1, y1], grid, map: c.toDataURL('image/png') }; })(${JSON.stringify(u(a))}, ${JSON.stringify(u(b))})`, 120000);
  writeFileSync(out, Buffer.from(r.map.split(',')[1], 'base64')); console.log('box', r.box.join(','), '\n' + r.grid.map(x => x.join('\t')).join('\n'));
} finally { await pg.close(); }
