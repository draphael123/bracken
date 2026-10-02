// tools/canal-map.mjs - THE FOG CANAL drawn as a map, from the built level's data (no browser): 4 px a tile, the whole level in one strip.
// Rock grey, boards brown, ladders tan; the WATER blue at each reach's built level with a lighter band up to the highest it can stand (a lock);
// lock GATES dark red; SWING BRIDGES orange; FOG grey wash (a THICK bank darker); lantern posts yellow; foghorns white; paddles and capstans
// small squares; the weir's paths (the head race, the MILL CUT green, the WEIR red); foes (bargees brown, archers pink, grindylows green, wisps
// cyan); checkpoints green, silvers gold; the walked route (tools/pacing.mjs) cyan dots; JENNY GREENTEETH's footprint outlined purple.
// usage: node tools/canal-map.mjs [out.png]   (default work/claude/canal/map.png)
import { install, newCanvas, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'node:fs';
install();
const { LEVELS, T } = await import('../src/level.js');
const { pacing } = await import('./pacing.mjs');
const lv = LEVELS.find(l => l.id === 'canal'), L = lv.build(), S = 4, TS = 16, D = L.canal;
const c = newCanvas(L.W * S, L.H * S + 12), g = c.getContext('2d');
g.fillStyle = '#12161a'; g.fillRect(0, 0, c.width, c.height);
const put = (x, y, col, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x * S), Math.round(y * S) + 12, Math.max(1, Math.round(w * S)), Math.max(1, Math.round(h * S))); };
const line = (x0, y0, x1, y1, col) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * S); for (let i = 0; i <= n; i += 2) { const t = i / n; put(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, col, 0.3, 0.3); } };
for (const [x0, x1, y0, y1] of L.interiors) put(x0, y0, '#262a30', x1 - x0 + 1, y1 - y0 + 1);
for (const f of D.fogs) { g.globalAlpha = f.thick ? 0.35 : 0.15; put(f.x0, f.y0, '#b0bebc', f.x1 - f.x0 + 1, f.y1 - f.y0 + 1); g.globalAlpha = 1; }
for (const p of L.pools) { const x0 = p.x0 / TS, w = (p.x1 - p.x0) / TS, y = p.y / TS, b = (p.bottom || p.y + 64) / TS; put(x0, y, p.shallow ? '#3a6a8a' : '#2a4a7a', w, b - y); }
for (const r of D.reaches) if (r.lo !== r.hi) { g.globalAlpha = 0.5; put(r.x0, r.hi, '#5a8ac0', r.x1 - r.x0 + 1, r.lo - r.hi); g.globalAlpha = 1; }
for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = L.grid[y * L.W + x];
  const col = t === T.SOLID ? '#6a6a70' : t === T.ONEWAY ? '#a0703e' : t === T.NET ? '#d8c8a0' : t === T.SPIKE ? '#e04040' : null; if (col) put(x, y, col); }
for (const gt of D.gates) put(gt.x, gt.top, gt.weir ? '#e06040' : '#8a2a2a', 1, gt.bot - gt.top + 1);
for (const b of D.bridges) put(b.x0, b.row, '#ff9a3c', b.x1 - b.x0 + 1, 0.6);
for (const [x0, x1, row, kind] of D.weeds) put(x0, row - 0.2, kind === 'bright' ? '#8ad060' : '#2e4a30', x1 - x0 + 1, 0.4);
const W = D.weir; const path = (pts, col) => { for (let i = 1; i < pts.length; i++) line(pts[i - 1][0] / TS, pts[i - 1][1] / TS, pts[i][0] / TS, pts[i][1] / TS, col); };
path(W.head, '#e8e0c0'); path([W.head[W.head.length - 1]].concat(W.cut.filter(p => p[0] > W.junction)), '#60e080'); path([W.head[W.head.length - 1]].concat(W.fall.filter(p => p[0] > W.junction)), '#ff6050');
const R = pacing(lv); for (const [x, y] of R.route) put(x + 0.35, y + 0.35, '#40d0e0', 0.3, 0.3);
const COL = { gaffer: '#c08040', archer: '#ff90c0', grindylow: '#40e070', willowisp: '#80fff0', check: '#40e060', silver: '#ffd34a', mend: '#ff80a0', gate: '#ffffff', sign: '#9090a0',
  lanternpost: '#ffcf6a', foghorn: '#ffffff', locksluice: '#c0c0ff', swingcap: '#ff9a3c' };
for (const e of L.ents) if (COL[e.t]) put(e.x + 0.1, e.y + 0.1, COL[e.t], 0.8, e.t === 'check' || e.t === 'gate' ? 1.8 : e.elite ? 1.6 : 0.8);
const J = L.lockArena; if (J) { const y0 = J.R - 16, y1 = J.R + 1; put(J.sx, y0, '#b070ff', 40, 0.4); put(J.sx, y1, '#b070ff', 40, 0.4); put(J.sx, y0, '#b070ff', 0.4, y1 - y0); put(J.sx + 39.6, y0, '#b070ff', 0.4, y1 - y0); }
for (const [, x] of D.sections) put(x, -3, '#4a7ad0', 0.5, 2.5);
const out = process.argv[2] || 'work/claude/canal/map.png'; mkdirSync(out.replace(/[\/][^\/]*$/, ''), { recursive: true });
const big = newCanvas(c.width * 2, c.height * 2); big.getContext('2d').imageSmoothingEnabled = false; big.getContext('2d').drawImage(c, 0, 0, big.width, big.height);
savePNG(big, out); console.log('canal-map: ' + out + '  (route ' + R.stats.routeTiles + ' tiles, ' + R.route.length + ' points)');
