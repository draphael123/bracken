// tools/rgart-poses.mjs - THE RANGER'S OWN RIG (claude/rangerart; not in the suite): her baked frames on one sheet, no sim.
//   usage: PORT=8914 node tools/rgart-poses.mjs <tag> [key,key,...] [zoom]   -> work/claude/shots/rangerart/<tag>-poses.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'poses', keys = (process.argv[3] || 'idle,run,jump,fall,atk,windup,rgLoose').split(','), z = +(process.argv[4] || 4);
const out = join(ROOT, 'work/claude/shots/rangerart'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, noWait: true });
try {
  const url = await pg.evalp(`(async()=>{ const C = await import('/src/chars.js'); const SP = C.bakeRanger(); (await import('/src/flask-art.js')).addDrink(SP, 'ranger'); const R = SP.R, keys = ${JSON.stringify(keys)}; const list = [];
    for (const k of keys) if (R[k]) (Array.isArray(R[k]) ? R[k] : [R[k]]).forEach((f, i) => list.push([k, i, f])); else list.push([k + ' MISSING', 0, null]);
    const z = ${z}, cw = Math.max(...list.map(l => l[2] ? l[2].width : 34)) * z + 8, ch = Math.max(...list.map(l => l[2] ? l[2].height : 40)) * z + 22, cols = Math.min(${process.env.COLS || 8}, list.length), c = document.createElement('canvas'); c.width = cols * cw; c.height = Math.ceil(list.length / cols) * ch; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    list.forEach(([k, i, f], n) => { const x = (n % cols) * cw, y = Math.floor(n / cols) * ch; g.fillStyle = (n % 2) ? '#6a7a5e' : '#627256'; g.fillRect(x, y, cw, ch); g.fillStyle = '#ffe9a0'; g.font = '11px monospace'; g.fillText(k + ' ' + i, x + 3, y + 12);
      if (!f) return; g.drawImage(f, x + 4, y + 18, f.width * z, f.height * z); g.fillStyle = '#e33'; g.fillRect(x + 4 + SP.ax * z, y + 18 + SP.ay * z + (f.height - 0) * 0, z, 1); });
    return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, tag + '-poses.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('wrote work/claude/shots/rangerart/' + tag + '-poses.png');
  if (pg.errors.length) console.log('page errors:', pg.errors);
} finally { pg.close(); }
