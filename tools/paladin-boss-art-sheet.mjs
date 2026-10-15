// tools/paladin-boss-art-sheet.mjs - the Paladin boss's own poses (rebound, falter, reel) and his bestiary card beside the hero frames they are made from (claude/church2art; not in the suite).
//   usage: PORT=8945 node tools/paladin-boss-art-sheet.mjs [out.png] [scale]
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || join(ROOT, 'work/claude/church-art/paladin-boss-poses.png'), z = +(process.argv[3] || 4);
const pg = await openPage({ audio: false, fonts: false, noWait: true });
try {
  const url = await pg.evalp(`(async()=>{ const C = await import('/src/chars.js'), A = await import('/src/redraw/paladin_boss_art.js'), PB = await import('/src/paladin-boss.js');
    const K = C.bakePaladin({}); const one = ([k, i]) => { const a = K.R[k] ?? K.R.idle; return Array.isArray(a) ? a[Math.min(i, a.length - 1)] : a; };
    const P = PB.PAL_POSES.map(one), idle = Array.isArray(K.R.idle) ? K.R.idle[0] : K.R.idle, cf = A.cardFrames(idle, K.ax, K.ay);
    const items = [P[0], P[24], A.rebound(P[24]), P[29], A.falter(P[29]), P[30], A.reel(P[30]), ...cf.R]; const w = Math.max(...items.map(c => c.width)), h = Math.max(...items.map(c => c.height));
    const c = document.createElement('canvas'); c.width = items.length * (w * ${z} + 8); c.height = h * ${z} + 8; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#5a5870'; g.fillRect(0, 0, c.width, c.height);
    items.forEach((f, i) => g.drawImage(f, i * (w * ${z} + 8) + 4, 4, f.width * ${z}, f.height * ${z})); return c.toDataURL('image/png'); })()`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + out);
} finally { pg.close(); }
