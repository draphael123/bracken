/* tools/saltlook-crab3.mjs <outdir> - EVERY POOL-CRAB POSE, FORCED BY MODE, ONE IN WATER (low tide, on the flats) AND ONE ON A DRY SHELF, hero 60 px off, NO overlap (claude/saltlook). Pose check only. BRACKEN_LW3=1 LW3=1. */
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2]; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true, fonts: false, seed: 11, hints: 'none' });
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.load(__LV.findIndex(l => l.id === 'longwater')); BK.start(); BK.god = true; BK.sim(60);
    window.__cr = (row) => BK.enemies().filter(e => e.t === 'poolcrab' && e.alive).sort((a, b) => Math.abs(Math.round(a.y / 16) - row) - Math.abs(Math.round(b.y / 16) - row))[0];
    window.__shot = hb => { const b = BK.buf, c = document.createElement('canvas'); c.width = b.width * 2; c.height = b.height * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height);
      const v = BK.view; if (hb) { g.strokeStyle = '#ff2a2a'; g.lineWidth = 2; g.strokeRect(Math.round((hb[0] - v.x) * 2), Math.round((hb[2] - v.y) * 2), Math.round((hb[1] - hb[0]) * 2), Math.round((hb[3] - hb[2]) * 2)); } return c.toDataURL('image/png'); }; return true; })()`);
  const bayLow = async () => { for (let i = 0; i < 30 && (await pg.evalp(`BK.pirateFleet().tides[0].ph`)) !== 'low'; i++) await pg.evalp('BK.sim(90)'); };
  for (const [label, row] of [['water', 34], ['shelf', 30]]) {
    await bayLow();
    const e0 = await pg.evalp(`(() => { const e = __cr(${row}); BK.tp(e.x / 16 - 4, e.y / 16 - 2); BK.sim(80); return { x: e.x, y: e.y, row: Math.round(e.y / 16) }; })()`); console.log(label, JSON.stringify(e0));
    for (const m of ['walk', 'pinchTell', 'pinch', 'rec', 'flipped', 'digTell', 'buried', 'emerge']) {
      const hb = await pg.evalp(`(() => { const e = __cr(${row}); e.mode = ${JSON.stringify(m)}; e.modeT = 4; e.face = 1; e.cool = 99; BK.P.x = e.x - 64; BK.P.hp = 9999; BK.step(2); e.mode = ${JSON.stringify(m)}; e.modeT = 4; e.face = 1; BK.step(1); return [e.x, e.x + 24, e.y - 14, e.y + 2]; })()`);
      const d = await pg.evalp(`__shot(${/pinch/.test(m) ? JSON.stringify(hb) : 'null'})`); writeFileSync(join(out, 'look-crab3-' + label + '-' + m + '.png'), Buffer.from(d.split(',')[1], 'base64')); }
  }
  console.log('errors', JSON.stringify((pg.errors || []).slice(0, 3)));
} finally { await pg.close(); }
