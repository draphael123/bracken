/* the Scalder in action on the Gate Watch, from the real page: docs/stormhold/after-scalder-<mode>.png */
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { writeFileSync } from 'fs';
const pg = await openPage();
try {
  const shots = await pg.evalp(`(async () => { const M = await import('/src/level.js'); BK.load(M.LEVELS.findIndex(l => l.id === 'storm')); BK.start(); BK.god = true; BK.sim(200);
    for (const e of BK.enemies()) if (e.t === 'sprig' && e.x < 50 * 16) e.alive = false;
    const E = BK.enemies().find(e => e.t === 'scalder' && e.x < 50 * 16); E.pourCd = 0; BK.tp(41, 27); BK.P.climb = true;
    const out = {}; const grab = () => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); };
    for (let f = 0; f < 400 && Object.keys(out).length < 2; f++) { BK.step(1); if (E.mode === 'pourTell' && E.modeT < 0.35 && !out.tell) out.tell = grab(); if (E.mode === 'pour' && E.modeT < 0.2 && !out.pour) { for (let k = 0; k < 6; k++) BK.step(1); out.pour = grab(); } }
    return out; })()`);
  for (const [k, u] of Object.entries(shots)) { writeFileSync(ROOT + 'docs/stormhold/after-scalder-' + k + '.png', Buffer.from(u.split(',')[1], 'base64')); console.log('wrote', k); }
} finally { pg.close(); }
process.exit(0);
