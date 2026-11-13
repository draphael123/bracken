/* tools/saltlook-crab.mjs <outdir> - THE POOL CRAB'S PINCH, TELL AND STRIKE, NEXT TO A HERO ON ITS SHELF, WITH THE HIT BOX OUTLINED (claude/saltlook). Not in the suite. BRACKEN_LW3=1 LW3=1. */
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2]; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true, fonts: false, seed: 11, hints: 'none' });
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.load(__LV.findIndex(l => l.id === 'longwater')); BK.start(); BK.god = true; BK.sim(60); BK.tp(434, 29); BK.sim(60);
    window.__C = () => BK.enemies().filter(e => e.t === 'poolcrab' && e.alive && Math.abs(e.y - BK.P.y) < 20).sort((a, b) => Math.abs(a.x - BK.P.x) - Math.abs(b.x - BK.P.x))[0];
    window.__shot = hb => { const b = BK.buf, c = document.createElement('canvas'); c.width = b.width * 2; c.height = b.height * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height);
      const v = BK.view; if (hb) { g.strokeStyle = '#ff2a2a'; g.lineWidth = 2; g.strokeRect(Math.round((hb[0] - v.x) * 2), Math.round((hb[2] - v.y) * 2), Math.round((hb[1] - hb[0]) * 2), Math.round((hb[3] - hb[2]) * 2)); } return c.toDataURL('image/png'); }; return true; })()`);
  const save = async (n, hb) => writeFileSync(join(out, 'look-crab2-' + n + '.png'), Buffer.from((await pg.evalp(`__shot(${hb ? JSON.stringify(hb) : 'null'})`)).split(',')[1], 'base64'));
  const seen = new Set(); let info = null;
  for (let f = 0; f < 1500 && !(seen.has('pinchTell') && seen.has('pinch')); f++) {
    const s = await pg.evalp(`(() => { const e = __C(); if (!e) return null; BK.P.hp = 9999; return { mode: e.mode, x: e.x, y: e.y, face: e.face, mt: e.modeT, px: BK.P.x, py: BK.P.y }; })()`);
    if (!s) { await pg.evalp(`(() => { const hs = BK.enemies().filter(e => e.t === 'poolcrab' && e.alive); const e = hs.find(q => Math.round(q.y / 16) === 30) || hs[0]; BK.P.x = e.x + 36; BK.P.y = e.y; BK.P.vx = 0; return 1; })()`); await pg.evalp('BK.step(2)'); continue; }
    const hb = [s.x + (s.face > 0 ? 0 : -24), s.x + (s.face > 0 ? 24 : 0), s.y - 14, s.y + 2];
    if (s.mode === 'pinchTell' && !seen.has('pinchTell')) { seen.add('pinchTell'); await save('pinchTell-a', null); for (let k = 0; k < 18; k++) await pg.evalp('BK.step(1)'); await save('pinchTell-held', hb); }
    else if (s.mode === 'pinch' && !seen.has('pinch')) { seen.add('pinch'); await save('pinch-a', hb); await pg.evalp('BK.step(3)'); await save('pinch-b', hb); info = s; }
    else if (s.mode === 'walk' && !seen.has('walk')) { seen.add('walk'); await save('walk', null); }
    await pg.evalp(`(() => { const e = __C(); if (e && Math.abs(BK.P.x - e.x) > 60) { BK.P.x = e.x + 30 * (BK.P.x > e.x ? 1 : -1); BK.P.vx = 0; } BK.step(1); return 1; })()`);
  }
  console.log('seen', [...seen], JSON.stringify(info), 'errors', JSON.stringify((pg.errors || []).slice(0, 3)));
} finally { await pg.close(); }
