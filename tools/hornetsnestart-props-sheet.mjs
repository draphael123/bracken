// tools/hornetsnestart-props-sheet.mjs - THE HORNET'S NEST's PROPS and FOES on one sheet (claude/hornetsnestart): the comb (fresh / set), the stand, the pot, the smoke cloud, the brood cell
// (idle / pulse / broken), the wax pillar, the four foe skins' frames and the swarm's five poses, at 4x.   TAG=after PORT=<port> node tools/hornetsnestart-props-sheet.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const TAG = process.env.TAG || 'after';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const P = await import('/src/redraw/hornets_nest_props.js'); const Z = 4, S = BK.SPR; const c = document.createElement('canvas'); c.width = 1400; c.height = 1000; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#7f9560'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#10080a'; g.font = '12px monospace';
    const at = (x, y, fn, label) => { g.save(); g.translate(x, y); g.scale(Z, Z); fn(g); g.restore(); g.fillText(label, x, y + 8); };
    at(10, 20, h => { P.stalk(h, 24, 36, 12); P.slab(h, 0, 36, 48, 32, false, 1.2); }, 'comb (hangs, falls)');
    at(250, 20, h => P.slab(h, 0, 36, 48, 32, true, 1.2), 'comb (landed)');
    at(490, 20, h => P.stand(h, 20, 50, 1.3), 'smoke stand'); at(640, 20, h => P.pot(h, 12, 40, 1.1, true), 'pot');
    at(760, 20, h => P.cloud(h, 40, 40, 46, 1, 2.2), 'smoke cloud');
    at(1000, 20, h => P.cell(h, 20, 50, 'idle', 0, 1), 'brood cell'); at(1100, 20, h => P.cell(h, 20, 50, 'pulse', 0.3, 1.1), 'pulse early'); at(1200, 20, h => P.cell(h, 20, 50, 'pulse', 0.9, 1.15), 'pulse late'); at(1300, 20, h => P.cell(h, 20, 50, 'broken', 0, 1), 'hatched');
    const row = (names, y) => names.forEach((n, j) => { const s = S[n]; s.R.forEach((f, i) => g.drawImage(f, 0, 0, f.width, f.height, 10 + i * 17 * Z + (j % 1) * 0, y, f.width * Z, f.height * Z)); g.fillText(n, 10, y - 2); });
    row(['hornet'], 380); row(['combdrone'], 480); row(['nestguard'], 600); row(['venomspitter'], 740); row(['swarm'], 850);
    return c.toDataURL('image/png'); })()`, 120000);
  writeFileSync(join(out, 'hornetsnestart-' + TAG + '-props-sheet.png'), Buffer.from(r.split(',')[1], 'base64')); console.log('written', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
