/* tools/saltlook-pose.mjs <outdir> <mode,mode..> - THE HERALD HELD IN GIVEN MODES (forced by e.mode, modeT 4), hero 70 px off, a still each, with the hitbox outlined for sweep / thrust (claude/saltlook). Pose check only. BRACKEN_LW3=1 LW3=1 */
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2], modes = (process.argv[3] || 'thrust').split(','); mkdirSync(out, { recursive: true });
const HB = { sweep: (e, f) => [e.x + (f > 0 ? -6 : -62), e.x + (f > 0 ? 62 : 6), e.y - 14, e.y + 4], thrust: (e, f) => [e.x + (f > 0 ? 0 : -112), e.x + (f > 0 ? 112 : 0), e.y - 30, e.y - 6] };
const pg = await openPage({ audio: true, fonts: false, seed: 11, hints: 'none' });
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.load(__LV.findIndex(l => l.id === 'longwater')); BK.start(); BK.god = true; BK.sim(60); BK.tp(655, 29); BK.sim(300);
    window.__H = () => BK.enemies().find(x => x.t === 'herald' && x.lw3);
    window.__shot = hb => { const b = BK.buf, c = document.createElement('canvas'); c.width = b.width * 2; c.height = b.height * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height);
      const v = BK.view; if (hb) { g.strokeStyle = '#ff2a2a'; g.lineWidth = 2; g.strokeRect(Math.round((hb[0] - v.x) * 2), Math.round((hb[2] - v.y) * 2), Math.round((hb[1] - hb[0]) * 2), Math.round((hb[3] - hb[2]) * 2)); } return c.toDataURL('image/png'); }; return true; })()`);
  for (const m of modes) {
    const s = await pg.evalp(`(() => { const e = __H(); e.mode = ${JSON.stringify(m)}; e.modeT = 4; e.face = -1; e.hurtT = 0; BK.P.x = e.x - 90; BK.P.y = e.y - 4; BK.P.vx = 0; BK.step(3); e.mode = ${JSON.stringify(m)}; e.modeT = 4; BK.step(2); return { x: e.x, y: e.y, face: e.face }; })()`);
    for (const k of ['', '-hitbox']) { if (k && !HB[m]) continue; const d = await pg.evalp(`__shot(${k ? JSON.stringify(HB[m](s, s.face)) : 'null'})`); writeFileSync(join(out, 'look-pose-' + m + k + '.png'), Buffer.from(d.split(',')[1], 'base64')); }
    console.log(m, JSON.stringify(s)); }
  console.log('errors', JSON.stringify((pg.errors || []).slice(0, 3)));
} finally { await pg.close(); }
