// tools/theatre-map.mjs - THE MASKWRIGHT'S THEATRE drawn as a map, from the built level's data (no browser): 4 px a tile, the whole level in one
// strip. Rock grey, boards brown, ropes tan, spikes red, the star trap green, FLATS blue (solid: where they stand at load; outline: the other end of
// the track), FLY LINES orange (the batten's two stops) and ochre (the sandbag's), LAMPS yellow with a line to each aim, foes red (a mummer
// crimson, the audience pink), checkpoints green, silvers gold, the walked route (tools/pacing.mjs) cyan dots, section starts marked blue on top.
// usage: node tools/theatre-map.mjs [out.png]   (default work/claude/theatre/map.png)
import { install, newCanvas, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'node:fs';
install();
const { LEVELS, T } = await import('../src/level.js');
const { pacing } = await import('./pacing.mjs');
const lv = LEVELS.find(l => l.id === 'theatre'), L = lv.build(), S = 4, TS = 16, TH = L.theatre;
const c = newCanvas(L.W * S, L.H * S + 12), g = c.getContext('2d');
g.fillStyle = '#1c1a22'; g.fillRect(0, 0, c.width, c.height);
const put = (x, y, col, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x * S), Math.round(y * S) + 12, Math.max(1, Math.round(w * S)), Math.max(1, Math.round(h * S))); };
const line = (x0, y0, x1, y1, col) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * S); for (let i = 0; i <= n; i += 2) { const t = i / n; put(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, col, 0.25, 0.25); } };
for (const [x0, x1, y0, y1] of L.interiors) put(x0, y0, '#2c2a36', x1 - x0 + 1, y1 - y0 + 1);
for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = L.grid[y * L.W + x];
  const col = t === T.SOLID ? '#6e6a70' : t === T.ONEWAY ? '#a0703e' : t === T.NET ? '#d8c8a0' : t === T.SPIKE ? '#e04040' : t === T.BOUNCER ? '#40e070' : null; if (col) put(x, y, col); }
/* the flats: the grid holds each at the end of its track the tools walk; the game puts it at its load end */
for (const f of TH.flats) { const other = f.tools === 'A' ? f.b : f.a, now = f.init === 'A' ? f.a : f.b, tools = f.tools === 'A' ? f.a : f.b;
  const rect = p => f.axis === 'y' ? [f.x0, p, f.w, f.h] : [p, f.y0, f.w, f.y1 - f.y0 + 1];
  { const [x, y, w, h] = rect(tools); put(x, y, '#1c1a22', w, h); }
  { const [x, y, w, h] = rect(now); put(x, y, '#4a7ad0', w, h); }
  { const [x, y, w, h] = rect(now === tools ? other : tools); put(x, y, '#4a7ad0', w, 0.25); put(x, y + h - 0.25, '#4a7ad0', w, 0.25); put(x, y, '#4a7ad0', 0.25, h); put(x + w - 0.25, y, '#4a7ad0', 0.25, h); } }
for (const m of L.moversExtra) if (m.kind === 'fly') { const col = m.role === 'batten' ? '#ff9a3c' : '#c8a040';
  for (const y of [m.yIn, m.yOut]) put(m.x / TS, y / TS, col, m.w / TS, m.role === 'bag' ? 0.8 : 0.4);
  line(m.x / TS + m.w / TS / 2, m.yIn / TS, m.x / TS + m.w / TS / 2, m.yOut / TS, col); }
for (const s of TH.spots) { for (const [ax, ay] of s.aims) line(s.x / TS, s.y / TS, ax / TS, ay / TS - 0.5, s.cue ? '#e0c040' : '#fff080'); put(s.x / TS - 0.5, s.y / TS - 0.5, '#fff080', 1, 1); }
for (const tr of TH.traps) put(tr.x0, tr.row, '#ff60c0', tr.x1 - tr.x0 + 1, 0.5);
const R = pacing(lv); for (const [x, y] of R.route) put(x + 0.35, y + 0.35, '#40d0e0', 0.3, 0.3);
const COL = { mummer: '#ff3050', drunk: '#ff90c0', swornsword: '#e04020', bat: '#c06060', spider: '#c06060', check: '#40e060', silver: '#ffd34a', relic: '#ffd34a', mend: '#ff80a0', gate: '#ffffff', flylock: '#ff9a3c', flatwinch: '#4a9ae0', sign: '#9090a0' };
for (const e of L.ents) if (COL[e.t]) put(e.x + 0.1, e.y + 0.1, COL[e.t], 0.8, e.t === 'check' || e.t === 'gate' ? 1.8 : 0.8);
for (const [, x] of TH.sections) put(x, -3, '#4a7ad0', 0.5, 2.5);
const out = process.argv[2] || 'work/claude/theatre/map.png'; mkdirSync(out.replace(/[\/][^\/]*$/, ''), { recursive: true });
const big = newCanvas(c.width * 2, c.height * 2); big.getContext('2d').drawImage(c, 0, 0, big.width, big.height);
savePNG(big, out); console.log('theatre-map: ' + out + '  (route ' + R.stats.routeTiles + ' tiles, ' + R.route.length + ' points)');
