// tools/fogknight-zoom.mjs - the Fog Knight's poses big (4x) on the night ground (claude/fogknightart3; not in the suite).  PORT=8927 node tools/fogknight-zoom.mjs out.png "walk high,cutTell,..." [zoom] [time]
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || join(ROOT, 'work/claude/fogknightart3/zoom.png');
const POSES = (process.argv[3] || 'walk high,walk low,walk full,cutTell,cut,lunge').split(','), Z = +(process.argv[4] || 4), T = +(process.argv[5] || 1.3);
const pg = await openPage({ audio: false, fonts: false, noWait: true });
try {
  const url = await pg.evalp(`(async()=>{ const K = await import('/src/redraw/fog_knight_art.js');
    const poses = ${JSON.stringify(POSES)}, Z = ${Z}, cw = 110, ch = 100, per = Math.min(poses.length, 6), rows = Math.ceil(poses.length / per);
    const M = { 'walk high': { mode: 'walk', stance: 'high' }, 'walk low': { mode: 'walk', stance: 'low' }, 'walk full': { mode: 'walk', stance: 'full' } };
    const c = document.createElement('canvas'); c.width = cw * Z * per; c.height = ch * Z * rows; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    poses.forEach((p, i) => { const k = document.createElement('canvas'); k.width = cw; k.height = ch; const q = k.getContext('2d'); q.imageSmoothingEnabled = false; q.fillStyle = '#16242c'; q.fillRect(0, 0, cw, ch); q.fillStyle = '#243238'; q.fillRect(0, ch - 8, cw, 8);
      K.drawKnight(q, 55, ch - 8, 1, { stance: 'high', alpha: 1, visor: 1, sag: 0, p: 0.6, ...(M[p] || { mode: p }) }, ${T}); g.drawImage(k, (i % per) * cw * Z, Math.floor(i / per) * ch * Z, cw * Z, ch * Z); });
    return c.toDataURL('image/png'); })()`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + out);
} finally { pg.close(); }
