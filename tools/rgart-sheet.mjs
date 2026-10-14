// tools/rgart-sheet.mjs - the contact sheet for claude/rgart: every before/after pair from tools/rgart-shots.mjs side by side (before left, after right), half size.
//   usage: PORT=8897 node tools/rgart-sheet.mjs   -> work/claude/shots/rgart/contact-sheet.png (needs before/ and after/ shots made first)
import { openPage, ROOT } from './cdp.mjs';
import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const dir = join(ROOT, 'work/claude/shots/rgart'), names = readdirSync(join(dir, 'after')).filter(n => n.endsWith('.png') && !n.includes('zoom')).sort();
const pg = await openPage({});
try {
  const d = await pg.evalp(`(async()=>{ const names = ${JSON.stringify(names)}, load = u => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = u + '?' + Date.now(); });
    const rows = []; for (const n of names) rows.push([n, await load('/work/claude/shots/rgart/before/' + n), await load('/work/claude/shots/rgart/after/' + n)]);
    const W = 640, H = 360, pad = 6, lab = 14, c = document.createElement('canvas'); c.width = W * 2 + pad * 3; c.height = rows.length * (H + lab + pad) + pad; const g = c.getContext('2d'); g.fillStyle = '#1b1626'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false; g.font = '11px monospace';
    rows.forEach(([n, b, a], i) => { const y = pad + i * (H + lab + pad); g.fillStyle = '#ffd36b'; g.fillText(n.replace('.png', '') + (b ? '' : '   (no before: a new piece)'), pad, y + 10);
      if (b) g.drawImage(b, pad, y + lab, W, H); else { g.fillStyle = '#2a2236'; g.fillRect(pad, y + lab, W, H); } if (a) g.drawImage(a, W + pad * 2, y + lab, W, H); });
    return c.toDataURL('image/png'); })()`, 120000);
  writeFileSync(join(dir, 'contact-sheet.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/shots/rgart/contact-sheet.png (' + names.length + ' pairs)');
} finally { pg.close(); }
