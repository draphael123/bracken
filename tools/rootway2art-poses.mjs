// tools/rootway2art-poses.mjs - THE HUNTMASTER's pose sheet (claude/rootway2art). Not in the suite. Paints every pose of src/redraw/rootway_art.js paintHuntmaster on a dark card.
//   usage: PORT=8810 node tools/rootway2art-poses.mjs <tag>   -> work/claude/rootway2art/<tag>/poses.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/rootway2art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const d = await pg.evalp(`(async()=>{ const A = await import('/src/redraw/rootway_art.js');
    const cols = [
      ['walk', {}], ['aimTell', { draw: 1 }], ['splitTell', { draw: 1 }], ['loose', {}],
      ['netSwing', { k: 0.3 }], ['netSwing', { k: 1 }], ['netThrow', { k: 0.2 }], ['netThrow', { k: 0.9 }],
      ['heavyDraw', { k: 0.3 }], ['heavyDraw', { k: 1 }], ['hornBlow', { k: 0.15 }], ['hornBlow', { k: 1 }],
      ['snareCrouch', {}], ['snareHop', {}], ['flurryTell', {}], ['flurry', { cut: 0 }],
      ['flurry', { cut: 1 }], ['flurry', { cut: 2 }], ['roll', { k: 0.1 }], ['roll', { k: 0.35 }],
      ['roll', { k: 0.55 }], ['roll', { k: 0.9 }], ['open', {}], ['open', { fall: true }],
      ['leapTell', {}], ['leap', {}], ['caught', {}], ['recover', {}]];
    const cw = 64, ch = 64, perRow = 8, rows = Math.ceil(cols.length / perRow), S = 3;
    const c = document.createElement('canvas'); c.width = cw * perRow * S; c.height = ch * rows * S; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#2a1c2c'; g.fillRect(0, 0, c.width, c.height);
    const labels = [];
    cols.forEach(([mode, o], i) => { const t = document.createElement('canvas'); t.width = cw; t.height = ch; const tg = t.getContext('2d');
      tg.fillStyle = '#3a2a3a'; tg.fillRect(0, ch - 6, cw, 6);
      A.paintHuntmaster(tg, { x: 26, y: ch - 6, f: 1, mode, t: 0.37, weak: {}, open: mode === 'open' ? 1 : 0, perch: -1, hurt: false, ...o });
      const cx = (i % perRow) * cw * S, cy = Math.floor(i / perRow) * ch * S; g.drawImage(t, cx, cy, cw * S, ch * S);
      g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(mode + (o.k != null ? ' k' + o.k : '') + (o.cut != null ? ' c' + o.cut : '') + (o.fall ? ' fall' : ''), cx + 3, cy + 11); });
    return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'poses.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('poses', out);
} finally { pg.close(); }
