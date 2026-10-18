// tools/church3art-pal-sheet.mjs - the Paladin boss's rows (hero frames + claude/church3art's own: snuff pair) in the page. PORT=8745 node tools/church3art-pal-sheet.mjs <out.png> [scale] [rows e.g. 0,30,32,33]
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync } from 'fs';
const out = process.argv[2] || 'pal.png', z = +(process.argv[3] || 4), rows = (process.argv[4] || '0,28,30,32,33,34,35,36').split(',').map(Number);
const pg = await openPage({ audio: false, fonts: false, noWait: true });
try {
  const url = await pg.evalp(`(async()=>{ const C = await import('/src/chars.js'), A = await import('/src/redraw/paladin_boss_art.js'), PB = await import('/src/paladin-boss.js');
    const K = C.bakePaladin({}); const one = ([k, i]) => { const a = K.R[k] ?? K.R.idle; return Array.isArray(a) ? a[Math.min(i, a.length - 1)] : a; };
    const P = PB.PAL_POSES.map(one); if (A.snuffTell) { P[32] = A.snuffTell(P[32]); P[33] = A.snuff(P[33]); }
    const items = ${JSON.stringify(rows)}.map(i => P[i]); const w = Math.max(...items.map(c => c.width)), h = Math.max(...items.map(c => c.height));
    const c = document.createElement('canvas'); c.width = items.length * (w * ${z} + 8); c.height = h * ${z} + 8; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#5a5870'; g.fillRect(0, 0, c.width, c.height);
    items.forEach((f, i) => g.drawImage(f, i * (w * ${z} + 8) + 4, 4, f.width * ${z}, f.height * ${z})); return c.toDataURL('image/png'); })()`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + out);
} finally { pg.close(); }
