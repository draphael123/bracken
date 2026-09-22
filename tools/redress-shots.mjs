// tools/redress-shots.mjs — THREE PICTURES OF A LEVEL, THE AUDIT'S WAY (docs/visual-audit.md): stand at its checkpoints (20% / 50% /
// near the end; the start, the middle and the end of a level with fewer than three), RENDER 60 frames with BK.step (BK.sim does not
// draw, and a frame captured after sim alone can draw wrong), and save the 320x180 buffer at 2x as work/audit/NN-id-j.jpg, the
// 640x360 files tools/art-rules.py measures.
//   node tools/redress-shots.mjs [id ...]      (default: the redressed levels and the audit's BEST set, for the comparison)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const REDRESSED = ['scree', 'hanging', 'storm', 'crown', 'undercrown', 'mage', 'fallingtower', 'spire', 'shop', 'shopCrag', 'shopSea'];
const BEST = ['wood', 'marsh', 'kings', 'spore', 'stockade', 'longwater', 'flotilla', 'waymeet', 'fields', 'underleaf', 'moor', 'reef', 'hurricane', 'lamplit'];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : [...REDRESSED, ...BEST];
const out = join(ROOT, 'work/audit'); mkdirSync(out, { recursive: true });
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  for (const id of ids) {
    const shots = await pg.evalp(`(() => {
      const i = __LV.findIndex(l => l.id === ${JSON.stringify(id)}); if (i < 0) return { err: 'no level' };
      BK.load(i); BK.start(); BK.god = true; BK.sim(300);   /* past the level's title card */
      const L = BK.L, sh = (L.ents || []).filter(e => e.t === 'check').map(e => [e.x, e.y]);
      const S = [L.START.x, L.START.y];
      let spots = sh.length >= 3 ? [0.2, 0.5, 0.85].map(f => sh[Math.min(sh.length - 1, Math.floor(f * sh.length))]) : [S, ...sh, ...(L.arena ? [[Math.floor((L.arena.x0 + L.arena.x1) / 32), Math.floor(L.arena.floor / 16) - 1]] : [])].slice(0, 3);
      const ground = f => { const W = L.W, x = Math.floor(W * f); for (let y = 2; y < L.H - 1; y++) if (L.grid[y * W + x] === 0 && L.grid[y * W + x - W] === 0 && L.grid[(y + 1) * W + x] === 1) return [x, y]; return S; };
      for (const f of [0.5, 0.8, 0.3]) if (spots.length < 3) spots.push(ground(f));
      const res = [];
      for (const [x, y] of spots) { BK.tp(x, y); for (let k = 0; k < 60; k++) BK.step(1);
        const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
        res.push(c.toDataURL('image/jpeg', 0.92)); }
      return { i, res };
    })()`);
    if (shots.err) { console.log(id, shots.err); continue; }
    shots.res.forEach((d, j) => writeFileSync(join(out, String(shots.i).padStart(2, '0') + '-' + id + '-' + j + '.jpg'), Buffer.from(d.split(',')[1], 'base64')));
    console.log(id, shots.res.length);
  }
} finally { pg.close(); }
