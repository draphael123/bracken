// tools/hlswitch-diff.mjs - how many pixels differ between pairs of stills (claude/hlswitchproof): node tools/hlswitch-diff.mjs a.png b.png [c.png d.png ...]  (pairs; composed in the page's canvas)
import { openPage } from './cdp.mjs';
import { readFileSync } from 'node:fs';
const f = process.argv.slice(2), pairs = []; for (let i = 0; i + 1 < f.length; i += 2) pairs.push([f[i], f[i + 1]]);
const url = p => 'data:image/png;base64,' + readFileSync(p).toString('base64');
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async (pairs) => { const load = u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = u; }); const out = [];
  for (const [a, b] of pairs) { const A = await load(a), B = await load(b); const c = document.createElement('canvas'); c.width = A.width; c.height = A.height; const g = c.getContext('2d'); g.drawImage(A, 0, 0); const da = g.getImageData(0, 0, c.width, c.height).data; g.clearRect(0, 0, c.width, c.height); g.drawImage(B, 0, 0); const db = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < da.length; i += 4) if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) n++; out.push(n + ' of ' + c.width * c.height + ' (' + (100 * n / (c.width * c.height)).toFixed(2) + '%)'); } return out; })(${JSON.stringify(pairs.map(p => [url(p[0]), url(p[1])]))})`, 120000);
  f.length && pairs.forEach((p, i) => console.log(p[0].split(/[\/]/).pop() + '  vs  ' + p[1].split(/[\/]/).pop() + ': ' + r[i])); } finally { await pg.close(); }
