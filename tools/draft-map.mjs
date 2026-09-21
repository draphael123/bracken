// tools/draft-map.mjs — any level draft (src/draft/<name>.js) drawn as a greybox map: rock grey, slopes sand, ledges brown, rungs tan,
// mud walls dark brown, quicksand darker, the flood channel pale blue, shade violet, foes red (flyers orange), checkpoints green,
// silvers/strays/relic gold, wells/shop/props white, section starts blue. Across: in strips; a climb: one column.
// usage: node tools/draft-map.mjs <name> [out.png]    (default docs/draft-<name>.png)
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const name = process.argv[2];
const { T } = await import('../src/level.js'); const D = await import(`../src/draft/${name}.js`);
const { isSlope } = await import('../src/slopes.js'); const { shadeZones } = await import('../src/sunstroke.js');
const L = D.build(T), V = D.meta.orientation === 'v', S = 3, strips = V ? 1 : 3, per = V ? L.W : Math.ceil(L.W / strips), rows = V ? L.H : L.H - 12, y0 = V ? 0 : 12;
const c = newCanvas(per * S, strips * (rows * S + 8)), g = c.getContext('2d'); g.fillStyle = '#9cc4e4'; g.fillRect(0, 0, c.width, c.height);
const put = (x, y, col) => { const st = Math.floor(x / per), px = (x - st * per) * S, py = st * (rows * S + 8) + (y - y0) * S; if (y < y0) return; g.fillStyle = col; g.fillRect(px, py, S, S); };
if (L.channel) for (let y = 0; y < L.H; y++) for (let x = L.channel.x0; x <= L.channel.x1; x++) put(x, y, '#c8e0f0');
for (const [x0, x1, a, b] of shadeZones(L)) for (let x = Math.floor(x0 / 16); x < Math.ceil(x1 / 16); x++) for (let y = Math.floor(a / 16); y < Math.ceil(b / 16); y++) put(x, y, '#b39ad0');
for (let y = y0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = L.grid[y * L.W + x];
  const col = t === T.SOLID ? '#6e6a70' : isSlope(t) ? '#e2bb7a' : t === T.ONEWAY || t === T.PLANK ? '#8a5a32' : t === T.NET ? '#d8c8a0' : t === T.CRATE ? '#a0703e' : null; if (col) put(x, y, col); }
for (const m of (L.mudWalls || [])) for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) put(x, y, '#5e3a1c');
for (const q of (L.quicksand || [])) for (let x = q.x0 / 16; x < q.x1 / 16; x++) put(x, q.y / 16, '#6a4424');
for (const [k, v] of Object.entries(L.sections)) if (V) for (let x = 0; x < L.W; x += 2) put(x, v, '#3e6ad0'); else for (let y = y0; y < L.H; y += 2) put(v, y, '#3e6ad0');
const FLY = new Set(['vulture', 'raptor']), GOLD = new Set(['silver', 'stray', 'relic']), WHITE = new Set(['wagon', 'awning', 'winch', 'standard', 'well', 'shop', 'greatwell', 'fire']);
for (const e of L.ents) { const col = D.meta.foes.includes(e.t) ? (FLY.has(e.t) ? '#ff9a3c' : '#d04030') : e.t === 'check' ? '#40c060' : GOLD.has(e.t) ? '#ffd34a' : WHITE.has(e.t) ? '#ffffff' : null; if (col) put(e.x, e.y, col); }
const big = newCanvas(c.width * 2, c.height * 2); big.getContext('2d').drawImage(c, 0, 0, big.width, big.height);
savePNG(big, process.argv[3] || new URL(`../docs/draft-${name}.png`, import.meta.url)); console.log('draft-map:', name, 'written');
