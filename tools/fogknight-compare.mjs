// tools/fogknight-compare.mjs - THE FOG KNIGHT 2 beside THE CRUSADER (claude/fogknightart2; not in the suite): the Crusader's frames and the knight's poses at 1x (left) and 2x, on the night ground.
//   PORT=8926 node tools/fogknight-compare.mjs [out.png] [poses, comma list]
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || join(ROOT, 'work/claude/fogknightart2/compare-crusader.png');
const POSES = (process.argv[3] || 'walk high,walk low,cutTell,cut,lunge,plunge').split(',');
const pg = await openPage({ audio: false, fonts: false, noWait: true });
try {
  const url = await pg.evalp(`(async()=>{ const W = await import('/src/redraw/waymeet.js'), K = await import('/src/redraw/fog_knight_art.js'); const S = W.bakePaladinBoss(); const F = S.R;
    const poses = ${JSON.stringify(POSES)}, M = { 'walk high': { mode: 'walk', stance: 'high' }, 'walk low': { mode: 'walk', stance: 'low' }, 'walk full': { mode: 'walk', stance: 'full' } };
    const cw = 120, ch = 100, n = poses.length, c = document.createElement('canvas'); c.width = cw * n * 3; c.height = ch * 2 * 2 + ch * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#16242c'; g.fillRect(0, 0, c.width, c.height);
    const cell = (draw, gx, gy, z, bg) => { const k = document.createElement('canvas'); k.width = cw; k.height = ch; const q = k.getContext('2d'); q.imageSmoothingEnabled = false; q.fillStyle = bg; q.fillRect(0, 0, cw, ch); q.fillStyle = '#243238'; q.fillRect(0, ch - 8, cw, 8); draw(q); g.drawImage(k, gx, gy, cw * z, ch * z); };
    const cr = [0, 4, 6, 9, 15, 19, 20, 12];
    poses.forEach((p, i) => { const fi = cr[i % cr.length];
      cell(q => q.drawImage(F[fi], 10, -2), i * cw, 0, 1, '#3a4a3a'); cell(q => q.drawImage(F[fi], 10, -2), i * cw * 2 + 0, 0, 1, '#3a4a3a');
      });
    // 2x rows
    g.fillStyle = '#16242c'; g.fillRect(0, 0, c.width, c.height);
    poses.forEach((p, i) => { const fi = cr[i % cr.length], gx = i * cw * 2;
      cell(q => q.drawImage(F[fi], 10, -2), gx, 0, 2, '#2a3a34');
      cell(q => K.drawKnight(q, 60, ch - 8, 1, { stance: 'high', alpha: 1, visor: 1, sag: 0, p: 0.6, ...(M[p] || { mode: p }) }, 1.3), gx, ch * 2, 2, '#16242c');
      cell(q => q.drawImage(F[fi], 10, -2), gx, ch * 4 + 4, 1, '#2a3a34'); cell(q => K.drawKnight(q, 60, ch - 8, 1, { stance: 'high', alpha: 1, visor: 1, sag: 0, p: 0.6, ...(M[p] || { mode: p }) }, 1.3), gx + cw, ch * 4 + 4, 1, '#16242c'); });
    return c.toDataURL('image/png'); })()`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + out);
} finally { pg.close(); }
