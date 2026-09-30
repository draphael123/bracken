// tools/fair-map.mjs - THE HARVEST FAIR as one picture (claude/fairlevel): rock, slopes, ledges, movers' paths, foes, silvers, tickets, shrines, secrets, the reach fill.
// A greybox map for eyes (and for the report). Not in the suite.   usage: node tools/fair-map.mjs [out.png]   (default work/claude/fairlevel/fair-map.png)
import { install, newCanvas, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
install();
const { LEVELS, T } = await import('../src/level.js'); const { floodReach } = await import('../src/reachcore.js'); const { isSlope } = await import('../src/slopes.js');
const L = LEVELS.find(l => l.id === 'fair').build(), R = floodReach(L, T, { rides: true });
const S = 6, strips = 3, per = Math.ceil(L.W / strips), y0 = 0, rows = L.H, sh = rows * S + 10;
const c = newCanvas(per * S, strips * sh), g = c.getContext('2d'); g.fillStyle = '#d9a86a'; g.fillRect(0, 0, c.width, c.height);
const put = (x, y, col, w = 1, h = 1) => { const st = Math.floor(x / per); if (st >= strips || y < 0) return; g.fillStyle = col; g.fillRect((x - st * per) * S, st * sh + (y - y0) * S, w * S, h * S); };
for (let s = 0; s < strips; s++) { g.fillStyle = '#c99658'; g.fillRect(0, s * sh, c.width, sh - 8); }
for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = L.grid[y * L.W + x];
  const col = t === T.SOLID ? '#5a4a3c' : isSlope(t) ? '#e8c860' : t === T.ONEWAY || t === T.PLANK ? '#8a4a22' : t === T.SPIKE ? '#d02020' : t === T.BOUNCER ? '#ffe060' : t === T.CRATE ? '#a0703e' : null; if (col) put(x, y, col); }
for (const w of (L.walls || [])) for (let y = w.y0; y <= w.y1; y++) for (let x = w.x0; x <= w.x1; x++) put(x, y, '#a070c0');
for (const [x, y] of R.seen ? [...R.seen].map(k => k.split(',').map(Number)) : []) if (L.grid[(y + 1) * L.W + x] !== 0) put(x, y, 'rgba(60,200,90,0.35)');
for (const m of (L.moversExtra || [])) { if (m.kind === 'wheel') for (let a = 0; a < 48; a++) { const th = a / 48 * 6.283; put(Math.floor((m.px + Math.cos(th) * m.r) / 16), Math.floor((m.py + Math.sin(th) * m.r) / 16), '#5090ff'); }
  if (m.kind === 'swing') for (let k = -9; k <= 9; k++) { const th = 0.9 * k / 9; put(Math.floor((m.px + Math.sin(th) * m.arm) / 16), Math.floor((m.py + Math.cos(th) * m.arm) / 16), '#5090ff'); } }
for (const e of L.ents) { const col = e.t === 'mummer' ? '#ff2020' : e.t === 'hobbyhorse' ? '#ff8000' : e.t === 'marionette' ? '#20a0ff' : e.t === 'barker' ? '#ffff00' : e.t === 'wickerqueen' ? '#c000c0' : e.t === 'check' ? '#20c020' : e.t === 'silver' ? '#ffffff' : e.t === 'mend' ? '#ff60a0' : e.t === 'sign' ? '#3060ff' : null; if (col) put(e.x, e.y, col, 1, e.t === 'check' ? 2 : 1); }
for (const t of (L.tickets || [])) put(t.x, t.row, '#00e0e0');
for (const c of (L.chases || [])) { for (let x = Math.floor(c.trigger / 16); x <= Math.floor(c.end / 16); x++) put(x, Math.floor(c.zone[3] / 16) - 4, 'rgba(120,230,150,0.8)'); for (const q of c.beams || []) for (let x = Math.floor(q.x0 / 16); x < Math.ceil(q.x1 / 16); x++) put(x, Math.floor(q.y / 16), '#ffffff'); }   /* (claude/fairfix) the ghost train's run and its beams */
for (const s of (L.strikers || [])) put(s.x, s.row - 1, '#ffb000', 1, 1);
for (const t of ((L.gallery || {}).targets || [])) put(t.x, t.row, '#ff00ff');
for (const [x0, x1, y] of ((L.gallery || {}).planks || [])) for (let x = x0; x <= x1; x++) put(x, y, '#e0a0ff');
const out = process.argv[2] || fileURLToPath(new URL('../work/claude/fairlevel/fair-map.png', import.meta.url));
mkdirSync(dirname(out), { recursive: true });
savePNG(c, out); console.log('fair-map written', L.W + 'x' + L.H);
