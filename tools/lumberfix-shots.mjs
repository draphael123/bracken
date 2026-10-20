// tools/lumberfix-shots.mjs - a SWEEP of the whole Lumber Trail (claude/lumberfix): a frame every ~STEP columns along the route (nearest coin), 4 frames to a sheet.
//   usage: PORT=8777 node tools/lumberfix-shots.mjs <tag> [step=22]  -> work/claude/shots/lumberfix/<tag>/sheet-N.png. Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', step = +(process.argv[3] || 22), out = join(ROOT, 'work/claude/shots/lumberfix', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [], frames = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.SET.zoom = 'close'; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.state = 'play'; BK.god = true; BK.sim(4);
    const L = BK.L, pts = L.ents.filter(e => e.t === 'coin' || e.t === 'check').map(e => [e.x, e.y]);
    for (let x = 8; x < L.W - 4; x += ${step}) { let best = null; for (const p of pts) if (Math.abs(p[0] - x) < ${step} / 2 + 4 && (!best || Math.abs(p[0] - x) < Math.abs(best[0] - x))) best = p; if (!best) continue;
      BK.tp(x, best[1]); BK.P.vx = BK.P.vy = 0; for (let i = 0; i < 40; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1);
      const c = document.createElement('canvas'); c.width = BK.view.VW; c.height = BK.view.VH; c.getContext('2d').drawImage(BK.buf, 0, 0); frames.push([x, c]); }
    const VW = BK.view.VW, VH = BK.view.VH;
    for (let s = 0; s * 4 < frames.length; s++) { const c = document.createElement('canvas'); c.width = VW * 2; c.height = VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      for (let k = 0; k < 4 && s * 4 + k < frames.length; k++) { g.drawImage(frames[s * 4 + k][1], (k % 2) * VW, ((k / 2) | 0) * VH); g.fillStyle = '#fff'; g.fillRect((k % 2) * VW, ((k / 2) | 0) * VH, 30, 9); g.fillStyle = '#000'; g.font = '8px monospace'; g.fillText('x' + frames[s * 4 + k][0], (k % 2) * VW + 2, ((k / 2) | 0) * VH + 8); }
      res.push(['sheet-' + s, c.toDataURL('image/png')]); }
    return res; })()`, 600000);
  for (const [n, d] of r) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('sheets', r.length, out);
} finally { await pg.close(); }
