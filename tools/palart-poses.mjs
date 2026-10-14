// tools/palart-poses.mjs - PALADIN 2 ART (claude/palart; not in the suite): the paladin's kit poses on one sheet, 5x, no sim.
//   usage: PORT=8900 node tools/palart-poses.mjs <tag> [key,key,...]   -> work/claude/shots/palart/<tag>-poses.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'poses', keys = (process.argv[3] || 'idle,hallow,hallowQ,sanctify,hurlH,heavy,atk,atkB').split(',');
const out = join(ROOT, 'work/claude/shots/palart'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, noWait: true });
try {
  const url = await pg.evalp(`(async()=>{ const C = await import('/src/chars.js'); const SP = C.bakePaladin(); const R = SP.R, keys = ${JSON.stringify(keys)}; const list = [];
    for (const k of keys) if (R[k]) (Array.isArray(R[k]) ? R[k] : [R[k]]).forEach((f, i) => list.push([k, i, f]));
    if (${JSON.stringify(keys)}.includes('hammer')) { const FX = await import('/src/holy-fx.js'); FX.bakeHammer().forEach((f, i) => list.push(['hammer', i, f])); }
    const z = 5, cw = 34 * z + 10, ch = 56 * z + 22, cols = Math.min(7, list.length), c = document.createElement('canvas'); c.width = cols * cw; c.height = Math.ceil(list.length / cols) * ch; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    list.forEach(([k, i, f], n) => { const x = (n % cols) * cw, y = Math.floor(n / cols) * ch; g.fillStyle = (n % 2) ? '#4a5a4a' : '#425242'; g.fillRect(x, y, cw, ch); g.fillStyle = '#5a3a22'; g.fillRect(x, y + 5 + (f.height - 2) * z, cw, 3 * z);
      g.drawImage(f, x + 5, y + 18, f.width * z, f.height * z); g.fillStyle = '#ffd36b'; g.font = '12px monospace'; g.fillText(k + ' ' + i, x + 4, y + 13); });
    return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, tag + '-poses.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('wrote work/claude/shots/palart/' + tag + '-poses.png');
} finally { pg.close(); }
