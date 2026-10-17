// tools/hurricane2art-world-sheet.mjs - THE HURRICANE DECK 2's world art alone (claude/hurricane2art; not in the suite): drawBack at fixed camera spots on a flat sea-grey ground, to see the pieces without the game round them,
// and a no-throw pass over every draw entry. node tools/hurricane2art-world-sheet.mjs [outdir]    env GLOW=1 (store seams lit)
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/claude/hurricane2art'; mkdirSync(out, { recursive: true });
const page = async glow => {
  const M = await import('/src/hurricane2-art.js'); const A = M.makeHurricane2Art({ on: () => true, VW: () => 320, glow: () => glow, felled: () => false, heelDir: () => 1 });
  const spots = { fore: [1880, 60], main: [3800, 40], galley: [2700, 190], poop: [7160, 140], store: [7080, 230], mizzen: [7600, 20], arena: [9040, 40], swing1: [840, 90], b2: [4000, 380], b4: [7700, 380] };
  const S = 2, W = 320, H = 180, names = Object.keys(spots), cv = document.createElement('canvas'); cv.width = 2 * W * S; cv.height = Math.ceil(names.length / 2) * H * S; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const txt = (s, x, y, c) => { g.fillStyle = c; g.font = '8px monospace'; g.fillText(s, x, y); };
  names.forEach((n, i) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const q = c.getContext('2d'); q.imageSmoothingEnabled = false; q.fillStyle = '#2a3a44'; q.fillRect(0, 0, W, H);
    const [cx, cy] = spots[n]; A.drawBack(q, cx, cy, 3.3);
    const m = { x: 4300, y: 330, w: 80, h: 8, dy: -0.3, kind: undefined, vert: true }; if (n === 'b2') A.hatch(q, { ...m, x: cx + 100, y: cy - 30 }, cx, cy, 3.3);
    if (n === 'swing1') A.swing(q, { px: 920, py: 128, x: 904, y: 208, w: 32, h: 8 }, cx, cy, 3.3);
    if (n === 'arena') { A.ward(q, 160, 120, 2.2); A.lineWant(q, 60, 150, 140, 2.2, (t, x, y) => { q.fillStyle = '#a8cfc6'; q.fillText(t, x - 10, y); }); A.flatSea(q, 250, 150, 2.2); }
    g.drawImage(c, (i % 2) * W * S, Math.floor(i / 2) * H * S, W * S, H * S); txt(n, (i % 2) * W * S + 4, Math.floor(i / 2) * H * S + 10, '#fff'); });
  return cv.toDataURL('image/png');
};
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(${page.toString()})(${+(process.env.GLOW || 0)})`, 120000);
  writeFileSync(join(out, process.env.NAME || 'world.png'), Buffer.from(r.split(',')[1], 'base64')); console.log('wrote; errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
