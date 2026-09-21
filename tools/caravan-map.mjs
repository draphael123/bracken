// tools/caravan-map.mjs — the SUNKEN CARAVAN greybox drawn as a map (docs/caravan-draft.png): 3 px a tile, the level in three
// strips. Rock grey, slopes sand, ledges brown, rungs tan, QUICKSAND dark brown, SHADE violet, foes red, vultures orange,
// checkpoints green, silvers/strays/relic gold, wagons and awnings white, section starts marked blue. usage: node tools/caravan-map.mjs
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const { T } = await import('../src/level.js'); const { buildSunkenCaravan } = await import('../src/draft/sunken-caravan.js');
const { isSlope } = await import('../src/slopes.js'); const { shadeZones } = await import('../src/sunstroke.js');
const L = buildSunkenCaravan(T), S = 3, strips = 3, per = Math.ceil(L.W / strips), rows = 26, y0 = 14;   // rows 14..39
const c = newCanvas(per * S, strips * (rows * S + 8)), g = c.getContext('2d'); g.fillStyle = '#9cc4e4'; g.fillRect(0, 0, c.width, c.height);
const put = (x, y, col, w = 1, h = 1) => { const st = Math.floor(x / per), px = (x - st * per) * S, py = st * (rows * S + 8) + (y - y0) * S; if (y < y0) return; g.fillStyle = col; g.fillRect(px, py, w * S, h * S); };
const Z = shadeZones(L); for (const [x0, x1, a, b] of Z) for (let x = Math.floor(x0 / 16); x < Math.ceil(x1 / 16); x++) for (let y = Math.floor(a / 16); y < Math.ceil(b / 16); y++) put(x, y, '#b39ad0');
for (let y = y0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = L.grid[y * L.W + x];
  const col = t === T.SOLID ? '#6e6a70' : isSlope(t) ? '#e2bb7a' : t === T.ONEWAY || t === T.PLANK ? '#8a5a32' : t === T.NET ? '#d8c8a0' : t === T.CRATE ? '#a0703e' : null; if (col) put(x, y, col); }
for (const q of L.quicksand) for (let x = q.x0 / 16; x < q.x1 / 16; x++) put(x, q.y / 16, '#6a4424');
for (const k of Object.values(L.sections)) for (let y = y0; y < L.H; y += 2) put(k, y, '#3e6ad0');
const COL = { scorpion: '#d04030', sandgob: '#d04030', bandit: '#d04030', archer: '#d04030', vulture: '#ff9a3c', check: '#40c060', silver: '#ffd34a', stray: '#ffd34a', relic: '#ffd34a', wagon: '#ffffff', awning: '#ffffff', winch: '#ffffff', standard: '#ffffff' };
for (const e of L.ents) if (COL[e.t]) put(e.x, e.y, COL[e.t]);
const big = newCanvas(c.width * 2, c.height * 2); big.getContext('2d').drawImage(c, 0, 0, big.width, big.height);
savePNG(big, process.argv[2] || new URL('../docs/caravan-draft.png', import.meta.url)); console.log('caravan-map: written');
