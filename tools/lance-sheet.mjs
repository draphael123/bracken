// tools/lance-sheet.mjs - THE QUEEN'S CHAMPION and his charger as a contact sheet (claude/stormhold3art): every pose, standing at the game's own scale (x2 here), the seated ones on the charger. `node tools/lance-sheet.mjs` -> work/claude/shots-stormhold3art/lance-sheet.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots-stormhold3art'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const d = await pg.evalp(`(async () => { const A = await import('/src/lance-art.js'); const ch = A.bakeChampion(), hs = A.bakeCharger(); const K = 2, CW = 300, CH = 250, cols = 4;
    const names = Object.keys(A.F); const n = names.length; const c = document.createElement('canvas'); c.width = CW * cols; c.height = CH * (Math.ceil(n / cols) + 1); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#2a2838'; g.fillRect(0, 0, c.width, c.height);
    const seated = new Set(['ride', 'rideB', 'couch', 'chargeA', 'chargeB', 'wheel', 'rear', 'pennantRide', 'volleyTellRide', 'volleyRide', 'hurtRide']);
    const horseF = { ride: 0, rideB: 5, couch: 0, chargeA: 1, chargeB: 2, wheel: 4, rear: 3, pennantRide: 0, volleyTellRide: 0, volleyRide: 0, hurtRide: 0 };
    const put = (set, f, x, y, s) => { const im = set.R[f]; g.drawImage(im, Math.round(x - set.ax * s), Math.round(y - set.ay * s), im.width * s, im.height * s); };
    names.forEach((nm, i) => { const x0 = (i % cols) * CW, y0 = Math.floor(i / cols) * CH, fx = x0 + 110, fy = y0 + CH - 30; g.fillStyle = '#4a4458'; g.fillRect(x0, fy, CW, 3);
      if (seated.has(nm)) { put(hs, horseF[nm], fx, fy, 1.45 * K); put(ch, A.F[nm], fx, fy - 20 * K, 1.2 * K); } else put(ch, A.F[nm], fx, fy, 1.35 * K);
      g.fillStyle = '#fff'; g.font = '11px monospace'; g.fillText(i + ' ' + nm, x0 + 4, y0 + 12); });
    // a native-size strip of the horse frames
    const y1 = Math.ceil(n / cols) * CH; for (let k = 0; k < hs.R.length; k++) { put(hs, k, 40 + k * 120, y1 + 120, 1.45 * 1.6); g.fillStyle = '#fff'; g.fillText('horse ' + k, 10 + k * 120, y1 + 12); }
    return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'lance-sheet.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
