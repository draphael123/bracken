/* a contact sheet of deco kinds as the page draws them: node work/stormhold/propsheet.mjs kind,kind,... */
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { writeFileSync } from 'fs';
const kinds = process.argv[2].split(',');
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { BK.load(M.LEVELS.findIndex(l => l.id === 'storm')); BK.start(); BK.sim(30); return 1; })`);
  const url = await pg.evalp(`(() => { const ks = ${JSON.stringify(kinds)}, P = BK.PROP; const pics = ks.map(k => { let c = P[k] || (P.town && P.town[k]); if (Array.isArray(c)) c = c[0]; return c && c.width ? c : null; });
    const W = pics.reduce((a, c) => a + (c ? c.width : 10) + 8, 8), H = Math.max(...pics.map(c => c ? c.height : 10)) + 16;
    const o = document.createElement('canvas'); o.width = W * 3; o.height = H * 3; const g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#3a3a48'; g.fillRect(0, 0, o.width, o.height);
    let x = 8; for (const c of pics) { if (c) g.drawImage(c, x * 3, (H - 8 - c.height) * 3, c.width * 3, c.height * 3); x += (c ? c.width : 10) + 8; }
    return o.toDataURL('image/png'); })()`);
  writeFileSync(ROOT + 'docs/stormhold/propsheet.png', Buffer.from(url.split(',')[1], 'base64')); console.log('ok');
} finally { pg.close(); }
process.exit(0);
