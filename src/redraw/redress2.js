// ============================================================================================
// THE SECOND REDRESS (docs/visual-audit.md, fixes 2-4): HIGHCROWN and THE UNDERCROWN (a castle, and the pit it stands on), THE MAGE'S
// tower (the bookcase wallpaper broken up), THE MONASTERY (white on white given a sky to stand against), and the three SHOPS (empty
// brown rooms made into stores). Not wired in. The same plumbing as redraw/crag_redress.js:
//   bakeRedressGround(theme)  -> the SET2 ground shape resolveTiles() reads (castle, undercrown, shopWood, shopCrag, shopSea)
//   bakeRedressSky(theme, h)  -> a 16 x h strip, or null indoors (the back wall is the far layer)
//   bakeRedressFar(theme)     -> 320 x 90 outdoors / 320 x 180 indoors (the back wall, whole screen)
//   bakeRedressMid(theme)     -> 480 x 140 (pillars, shelving, shoring, terraces)
//   bakeRedressNear(theme)    -> 640 x 300 (mostly clear: near pillars, chains, roots, rubble)
//   bakeRedressProps(theme)   -> the dressing for the theme, and REDRESS_KITS[theme]
// Themes: 'castle' (Highcrown) 'undercrown' 'mage' (the Folly and the Falling Tower: sky/far/mid/near only, its tiles stay) 'monastery'
// (the Spire: sky/far/mid only, the monks' tiles stay) 'shopWood' 'shopCrag' 'shopSea'.
// ============================================================================================
import { canvas, px, rect, fillPoly, line, ellipse, circle, mulberry } from '../px.js';

const T = 16, mk = (w, h, fn) => { const [c, g] = canvas(w, h); fn(g); return c; }, per = (w, k, x, p = 0) => Math.sin(x / w * Math.PI * 2 * k + p);
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function bandSky(h, bands) { return mk(16, h, g => { const n = bands.length, step = h / n;
  for (let y = 0; y < h; y++) { const f = y / step, i = Math.min(n - 1, Math.floor(f)), t = f - i; for (let x = 0; x < 16; x++) { const k = (t - 0.6) / 0.4, nx = i + 1 < n && k > 0 && BAYER[(y & 3) * 4 + (x & 3)] / 16 < k; px(g, x, y, bands[nx ? i + 1 : i]); } } }); }
/* coursed blocks over an area: rows `bh` tall, blocks `bw` wide (jittered), offset every other row, a lit top and shaded foot on each */
function courses(g, rnd, P, x0, y0, w, h, bw = 12, bh = 6) {
  rect(g, x0, y0, w, h, P.mortar);
  for (let r = 0, y = y0; y < y0 + h; r++, y += bh) { let x = x0 - (r % 2) * (bw >> 1);
    while (x < x0 + w) { const bwx = bw - 2 + ((rnd() * 5) | 0), a = Math.max(x0, x), b = Math.min(x0 + w, x + bwx - 1), yb = Math.min(y0 + h, y + bh - 1);
      if (b > a) { rect(g, a, y, b - a, yb - y, rnd() < 0.25 ? P.stoneD : rnd() < 0.3 ? P.stoneL : P.stone); rect(g, a, y, b - a, 1, P.stoneL); rect(g, a, yb - 1, b - a, 1, P.stoneD); }
      x += bwx; } } }
const arch = (g, x, y, w, h, col) => { rect(g, x, y + (w >> 1), w, h - (w >> 1), col); ellipse(g, x + w / 2 - 0.5, y + w / 2, w / 2, w / 2, col); };

export const REDRESS_PAL = {
  castle: { stone: '#5e6878', stoneL: '#7a8698', stoneD: '#465060', mortar: '#343a46', floor: '#6a6e7a', floorL: '#8a8e9a', floorD: '#4a4e5a', rug: '#7a2a4a', rugL: '#a83e62', gold: '#d8b048', banner: '#6a2a5a', bannerL: '#9a3e84', torch: '#ffb85a', night: '#1a1e36', moon: '#e8ecff', plank: '#5e6878', plankL: '#8a94a4', plankD: '#343a46' },
  undercrown: { stone: '#4e4640', stoneL: '#6a6058', stoneD: '#3a332e', mortar: '#26201c', floor: '#5a4430', floorL: '#86684a', floorD: '#34281e', root: '#7a4a32', rootL: '#a0643e', timber: '#6a5236', timberL: '#8e7050', timberD: '#3e2e1e', drip: '#6a8a9a', lamp: '#ffc860', plank: '#6a5236', plankL: '#8e7050', plankD: '#3e2e1e' },
  mage: { wall: '#2a2244', wallL: '#3a3058', wallD: '#1c1630', wood: '#4a3024', woodL: '#6a4630', woodD: '#2e1e16', books: ['#8a2a3a', '#2a5a8a', '#3a7a4a', '#9a7a2a', '#6a3a8a', '#8a5a3a'], gold: '#e8c24a', candle: '#fff0b0', flame: '#ffb84a', moon: '#dfe6ff', window: '#3a4a88' },
  monastery: { stone: '#d8c8a8', stoneL: '#f0e4c8', stoneD: '#a8987c', roof: '#8a3a2a', roofL: '#b04e36', flags: ['#e8c24a', '#c84a3a', '#3a8ac8', '#4aa86a', '#f0f0e0'], pine: '#2e5a3e', pineL: '#447a52', cloud: '#f4f6fa', cloudD: '#c8d4e4' },
  shopWood: { wall: '#4e3622', wallL: '#6a4a30', wallD: '#36241a', floor: '#b08a58', floorL: '#d0aa72', floorD: '#7a5a3a', shelf: '#5a3e28', stone: '#6e5a48', stoneL: '#8a7460', stoneD: '#4e3e32', mortar: '#3a2c22', plank: '#7a5a3a', plankL: '#9a7650', plankD: '#4e3a26', lamp: '#ffc860' },
  shopCrag: { wall: '#5e5a60', wallL: '#7a7680', wallD: '#44404a', floor: '#6a6468', floorL: '#8a8488', floorD: '#48444a', shelf: '#5a4232', stone: '#5e5a60', stoneL: '#7a7680', stoneD: '#44404a', mortar: '#2e2c32', plank: '#6a6468', plankL: '#8a8488', plankD: '#48444a', lamp: '#ffc860' },
  shopSea: { wall: '#4a5a62', wallL: '#627680', wallD: '#34424a', floor: '#7a6448', floorL: '#9a8260', floorD: '#4e3e2c', shelf: '#5a4230', stone: '#4a5a62', stoneL: '#627680', stoneD: '#34424a', mortar: '#26303a', plank: '#7a6448', plankL: '#9a8260', plankD: '#4e3e2c', lamp: '#ffd070', brass: '#c8a040' },
};

// ================= GROUND =================
function groundSet(theme) {
  const P = REDRESS_PAL[theme], s0 = 9300 + Object.keys(REDRESS_PAL).indexOf(theme) * 97, tile = (seed, fn) => { const rnd = mulberry(seed); return mk(T, T, g => fn(g, rnd)); };
  const planked = theme === 'shopWood' || theme === 'shopSea';
  const face = (g, rnd) => { if (theme === 'undercrown') { rect(g, 0, 0, T, T, P.floorD); for (let k = 0; k < 26; k++) { const x = (rnd() * T) | 0, y = (rnd() * T) | 0; rect(g, x, y, 1 + ((rnd() * 3) | 0), 1 + ((rnd() * 2) | 0), rnd() < 0.5 ? P.floor : P.stoneD); } if (rnd() < 0.5) { const x = 2 + ((rnd() * 10) | 0), y = 3 + ((rnd() * 9) | 0); rect(g, x, y, 4, 3, P.stone); rect(g, x, y, 4, 1, P.stoneL); } }
    else courses(g, rnd, P, 0, 0, T, T, theme === 'castle' ? 14 : 10, theme === 'castle' ? 8 : 6); };
  const top = {}, edge = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) { const k = eL + '' + eR;
    top[k] = [0, 1, 2, 3].map(i => tile(s0 + i * 3 + eL * 11 + eR * 17, (g, rnd) => { face(g, rnd);
      if (planked) { rect(g, 0, 0, T, 5, P.floor); rect(g, 0, 0, T, 1, P.floorL); rect(g, 0, 4, T, 1, P.floorD); for (let x = (i * 5) % 8; x < T; x += 8) rect(g, x, 0, 1, 4, P.floorD); }
      else if (theme === 'castle') { rect(g, 0, 0, T, 4, P.floor); rect(g, 0, 0, T, 1, P.floorL); rect(g, 0, 3, T, 1, P.floorD); rect(g, (i * 7) % 12, 0, 1, 3, P.floorD); }
      else if (theme === 'undercrown') { rect(g, 0, 0, T, 3, P.floor); for (let x = 0; x < T; x++) if (rnd() < 0.4) px(g, x, 0, P.floorL); if (rnd() < 0.5) rect(g, 3 + ((rnd() * 8) | 0), 1, 3, 2, P.stoneL); }
      else { rect(g, 0, 0, T, 4, P.floor); rect(g, 0, 0, T, 1, P.floorL); rect(g, 0, 3, T, 1, P.floorD); rect(g, 8, 0, 1, 3, P.floorD); }
      if (eL) { g.clearRect(0, 0, 1, 1); rect(g, 0, 1, 1, T - 1, P.stoneL || P.floorL); } if (eR) { g.clearRect(T - 1, 0, 1, 1); rect(g, T - 1, 1, 1, T - 1, P.stoneD || P.floorD); } }));
    if (eL || eR) edge[k] = [0, 1].map(i => tile(s0 + 40 + i + eL * 5 + eR * 7, (g, rnd) => { face(g, rnd); if (eL) rect(g, 0, 0, 1, T, P.stoneL || P.floorL); if (eR) rect(g, T - 1, 0, 1, T, P.stoneD || P.floorD); })); }
  const plat = (seed, end) => tile(seed, (g, rnd) => { const x0 = end === 'L' ? 1 : 0, x1 = end === 'R' ? T - 1 : T;
    if (theme === 'castle') { rect(g, x0, 3, x1 - x0, 4, P.stone); rect(g, x0, 3, x1 - x0, 1, P.stoneL); rect(g, x0, 7, x1 - x0, 1, P.stoneD); for (let x = x0 + 2; x < x1; x += 5) rect(g, x, 8, 2, 4, P.stoneD); rect(g, x0, 12, x1 - x0, 1, P.mortar); }   // a balcony on corbels
    else { rect(g, x0, 3, x1 - x0, 5, P.plank); rect(g, x0, 3, x1 - x0, 1, P.plankL); rect(g, x0, 7, x1 - x0, 1, P.plankD); for (let k = 0; k < 4; k++) px(g, x0 + ((rnd() * (x1 - x0)) | 0), 5, P.plankD); if (end) rect(g, end === 'L' ? x0 : x1 - 2, 8, 2, 5, P.plankD); } });
  const muck = (seed, wet) => tile(seed, (g, rnd) => { rect(g, 0, 0, T, T, P.floorD); for (let k = 0; k < 20; k++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? P.floor : P.mortar || P.floorD); if (wet) rect(g, 3, 2, 9, 1, '#5a7a8a'); });
  return { top, edge, fill: [0, 1, 2, 3].map(i => tile(s0 + 60 + i, face)), silt: [0, 1, 2].map(i => muck(s0 + 70 + i, false)), wet: [0, 1, 2].map(i => muck(s0 + 75 + i, true)),
    ledge: [0, 1, 2].map(i => plat(s0 + 80 + i, null)), ledgeL: plat(s0 + 85, 'L'), ledgeR: plat(s0 + 86, 'R') };
}
export const bakeRedressGround = theme => ['castle', 'undercrown', 'shopWood', 'shopCrag', 'shopSea'].includes(theme) ? groundSet(theme) : null;

// ================= SKIES (outdoors, and the castle's night through its windows) =================
export function bakeRedressSky(theme, h = 180) {
  if (theme === 'monastery') return bandSky(h, ['#1e4a9a', '#2a5eb0', '#3a74c4', '#5a92d4', '#86b2e0', '#b8d2ec']);   // a deep high-altitude blue, lighter to the cloud sea
  if (theme === 'mage') return bandSky(h, ['#120e22', '#1a1430', '#221a3e', '#2c224c']);
  return null;                                                                                                          // indoors: the far layer is the whole back wall
}

// ================= FAR =================
export function bakeRedressFar(theme) {
  const P = REDRESS_PAL[theme], rnd = mulberry(9700 + theme.length * 13);
  if (theme === 'castle') return mk(320, 180, g => {                        // THE GREAT HALL's back wall: granite, three tall windows on the night, banners between
    courses(g, rnd, { stone: '#4a5262', stoneL: '#5a6474', stoneD: '#3a4150', mortar: '#2a2e3a' }, 0, 0, 320, 180, 16, 8);
    for (const x of [40, 150, 260]) { arch(g, x - 2, 26, 30, 96, '#2a2e3a'); arch(g, x, 28, 26, 92, P.night); rect(g, x + 12, 28, 2, 92, '#2a2e3a'); rect(g, x, 70, 26, 2, '#2a2e3a');
      circle(g, x + 7, 44, 4, P.moon); for (let k = 0; k < 5; k++) px(g, x + 3 + k * 5, 90 + (k % 2) * 8, '#8a90b8'); rect(g, x - 4, 120, 34, 4, '#5a6474'); }
    for (const x of [100, 210]) { rect(g, x, 20, 16, 70, P.banner); rect(g, x, 20, 16, 2, P.gold); fillPoly(g, [[x, 90], [x + 8, 82], [x + 16, 90]], '#4a5262'); rect(g, x + 2, 22, 1, 66, P.bannerL);
      ellipse(g, x + 8, 44, 4, 5, P.gold); ellipse(g, x + 8, 43, 2, 3, P.banner); }                      // the queen's banner: a gold crown-knot on plum
    for (const x of [100, 210]) for (let dy = -30; dy <= 30; dy++) for (let dx = -30; dx <= 30; dx++) { const d = Math.hypot(dx, dy * 1.2) / 30; if (d >= 1) continue;   // torchlight pooled on the wall: a dithered warm glow, densest at the flame
      const b = BAYER[((dy + 64) & 3) * 4 + ((dx + 64) & 3)] / 16; if (b < (1 - d) * 0.75) px(g, x + 8 + dx, 100 + dy, d < 0.35 ? '#c88a4a' : d < 0.65 ? '#9a6a48' : '#6e5650'); }
    for (const x of [100, 210]) { rect(g, x + 6, 104, 4, 8, '#3a3030'); ellipse(g, x + 8, 100, 3, 5, P.torch); px(g, x + 8, 97, '#fff0c0'); }
    rect(g, 0, 150, 320, 30, '#3a4150'); rect(g, 0, 150, 320, 2, '#5a6474'); });
  if (theme === 'undercrown') return mk(320, 180, g => {                    // THE PIT: dark earth, the castle's foundation arches overhead, water finding its way down
    rect(g, 0, 0, 320, 180, '#1e1a18'); for (let k = 0; k < 300; k++) px(g, (rnd() * 320) | 0, (rnd() * 180) | 0, rnd() < 0.5 ? '#2a2420' : '#161210');
    for (const x of [0, 110, 220]) { courses(g, rnd, { stone: '#3e3834', stoneL: '#524a44', stoneD: '#2e2a26', mortar: '#1a1614' }, x + 10, 0, 90, 34, 12, 6); arch(g, x + 30, 18, 50, 40, '#1e1a18'); }
    for (let k = 0; k < 7; k++) { const x = 20 + k * 45; for (let y = 34, xx = x; y < 70 + (k % 3) * 20; y++) { px(g, xx, y, P.root); if (y % 6 === 0) xx += (k % 2) ? 1 : -1; } }
    for (const x of [70, 190, 280]) for (let y = 40; y < 180; y += 9) px(g, x, y, P.drip);
    for (let k = 0; k < 60; k++) { const x = (k * 53) % 320, y = 28 + (k * 7) % 12; rect(g, x, y, 3, 2, k % 3 ? '#4a6a34' : '#6a8a44'); }   // moss where the water runs off the foundations
    for (const x of [40, 150, 260]) { for (let r = 22; r > 0; r -= 5) circle(g, x, 120, r, r > 16 ? '#2a2018' : r > 10 ? '#4a3420' : '#7a5228'); rect(g, x - 2, 116, 5, 7, '#2a2420'); rect(g, x - 1, 118, 3, 3, P.lamp); } });   // lamps hung on the shoring, each in its pool of light
  if (theme === 'mage') return mk(320, 90, g => {                           // THE TOWER'S HIGH WALL, far off: tall windows and the moon
    rect(g, 0, 20, 320, 70, P.wallD); for (const x of [30, 120, 210, 290]) { arch(g, x, 26, 16, 50, P.window); rect(g, x + 7, 26, 2, 50, P.wallD); } circle(g, 250, 12, 7, P.moon); });
  if (theme === 'monastery') return mk(320, 90, g => {                      // THE CLOUD SEA, and far peaks standing out of it
    for (const [x, h, w] of [[40, 56, 40], [120, 70, 56], [210, 48, 36], [280, 62, 44]]) { fillPoly(g, [[x - w, 70], [x, 70 - h], [x + w, 70]], '#6a86b4'); fillPoly(g, [[x - 8, 70 - h + 10], [x, 70 - h], [x + 8, 70 - h + 10]], '#f4f6fa'); }
    for (let x = 0; x < 320; x++) { const y = 62 + Math.round(4 * per(320, 5, x) + 2 * per(320, 13, x)); rect(g, x, y, 1, 90 - y, P.cloud); px(g, x, y + 3, P.cloudD); } });
  // the shops: a back wall, shelved, lit by a lamp or two
  return mk(320, 180, g => { const fn = shopWalls[theme]; fn(g, P, rnd); });
}
const shelfRow = (g, P, rnd, x0, x1, y, kinds) => { rect(g, x0, y, x1 - x0, 3, P.shelf); rect(g, x0, y, x1 - x0, 1, '#8a6a4a');
  let x = x0 + 2; while (x < x1 - 6) { const k = kinds[(rnd() * kinds.length) | 0]; k(g, x, y); x += 8 + ((rnd() * 5) | 0); } };
const jar = c => (g, x, y) => { rect(g, x, y - 7, 5, 7, c); rect(g, x + 1, y - 8, 3, 1, '#e8d8b0'); px(g, x + 1, y - 6, '#ffffff'); };
const sack = c => (g, x, y) => { ellipse(g, x + 3, y - 4, 3.5, 4, c); rect(g, x + 2, y - 9, 2, 2, c); };
const books = (g, x, y) => { for (let k = 0; k < 4; k++) rect(g, x + k * 2, y - 7 - (k % 2), 2, 7 + (k % 2), ['#8a2a3a', '#2a5a8a', '#9a7a2a', '#3a7a4a'][k]); };
const coil = c => (g, x, y) => { ellipse(g, x + 3, y - 3, 4, 3, c); ellipse(g, x + 3, y - 3, 2, 1.5, '#3a2c22'); };
const shopWalls = {
  shopWood: (g, P, rnd) => { rect(g, 0, 0, 320, 180, P.wall); for (let x = 0; x < 320; x += 12) { rect(g, x, 0, 1, 180, P.wallD); rect(g, x + 1, 0, 1, 180, P.wallL); }   // a log store: plank walls, hanging herbs, shelves of jars and sacks
    for (let x = 10; x < 320; x += 26) { line(g, x, 0, x, 14, '#3a2c20'); for (let k = 0; k < 5; k++) line(g, x, 14, x - 3 + k * 1.5, 26, k % 2 ? '#6a8a3a' : '#8aa04a'); }
    shelfRow(g, P, rnd, 20, 300, 70, [jar('#b0602a'), jar('#6a8a3a'), sack('#c8a870'), jar('#8a3a3a')]); shelfRow(g, P, rnd, 20, 300, 110, [sack('#c8a870'), jar('#d8b048'), books]);
    circle(g, 160, 40, 5, P.lamp); circle(g, 160, 40, 3, '#fff0c0'); line(g, 160, 0, 160, 35, '#3a2c20'); rect(g, 0, 150, 320, 30, P.wallD); },
  shopCrag: (g, P, rnd) => { courses(g, rnd, P, 0, 0, 320, 180, 18, 9);                                                       // a mountain store: stone, pelts, rope, lanterns
    for (const x of [40, 250]) { fillPoly(g, [[x, 20], [x + 30, 20], [x + 34, 60], [x + 15, 70], [x - 4, 60]], '#8a6a4a'); rect(g, x + 4, 24, 22, 2, '#a8886a'); }   // pelts
    shelfRow(g, P, rnd, 90, 230, 60, [coil('#b8a070'), jar('#6a7a8a'), sack('#a8a098')]); shelfRow(g, P, rnd, 90, 230, 100, [coil('#b8a070'), books, jar('#d8b048')]);
    for (const x of [70, 250]) { rect(g, x, 110, 6, 8, '#3a3a40'); rect(g, x + 1, 112, 4, 4, P.lamp); line(g, x + 3, 90, x + 3, 110, '#2a2a30'); } rect(g, 0, 150, 320, 30, P.wallD); },
  shopSea: (g, P, rnd) => { rect(g, 0, 0, 320, 180, P.wall); for (let y = 0; y < 180; y += 10) { rect(g, 0, y, 320, 1, P.wallD); rect(g, 0, y + 1, 320, 1, P.wallL); }   // a chandler's: planked like a hull, nets, a ship's wheel, brass
    for (let x = 20; x < 110; x += 6) line(g, x, 10, x + 10, 60, '#8a7a5a'); for (let y = 12; y < 60; y += 6) line(g, 20, y, 118, y + 2, '#8a7a5a');
    circle(g, 240, 40, 22, P.shelf); circle(g, 240, 40, 16, P.wall); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; line(g, 240, 40, 240 + Math.cos(a) * 26, 40 + Math.sin(a) * 26, P.shelf); } circle(g, 240, 40, 4, P.brass);
    shelfRow(g, P, rnd, 20, 300, 90, [coil('#c8b080'), jar(P.brass), sack('#c8b890'), jar('#4a6a8a')]); shelfRow(g, P, rnd, 20, 300, 124, [coil('#c8b080'), jar(P.brass), books]);
    rect(g, 150, 10, 8, 10, P.brass); rect(g, 151, 12, 6, 6, P.lamp); rect(g, 0, 150, 320, 30, P.wallD); },
};

// ================= MID =================
export function bakeRedressMid(theme) {
  const P = REDRESS_PAL[theme], rnd = mulberry(9800 + theme.length * 7), W = 480, H = 140;
  return mk(W, H, g => {
    if (theme === 'castle') { for (let x = 20; x < W; x += 120) { rect(g, x, 0, 18, H, P.stone); rect(g, x, 0, 3, H, P.stoneL); rect(g, x + 15, 0, 3, H, P.stoneD); rect(g, x - 4, 20, 26, 6, P.stoneL); rect(g, x - 4, H - 10, 26, 10, P.stoneD);   // columns
        rect(g, x + 7, 40, 4, 8, '#3a3030'); ellipse(g, x + 9, 38, 3, 4, P.torch); px(g, x + 9, 36, '#fff0c0'); }                  // a torch on each
      for (let x = 70; x < W; x += 120) { rect(g, x, 30, 36, 64, P.rug); rect(g, x, 30, 36, 2, P.gold); rect(g, x + 4, 36, 28, 52, P.rugL); for (let k = 0; k < 3; k++) rect(g, x + 8, 44 + k * 14, 20, 6, P.rug); }   // tapestries
      for (const x of [110, 350]) { line(g, x, 0, x, 16, '#2a2e3a'); rect(g, x - 16, 16, 32, 3, P.gold); for (let k = 0; k < 5; k++) { rect(g, x - 14 + k * 7, 12, 2, 4, '#f0e0c0'); px(g, x - 14 + k * 7, 11, P.torch); } } }   // chandeliers
    else if (theme === 'undercrown') { for (let x = 30; x < W; x += 90) { rect(g, x, 20, 8, H - 20, P.timber); rect(g, x, 20, 2, H - 20, P.timberL); line(g, x + 8, 30, x + 40, 20, P.timber); line(g, x + 8, 31, x + 40, 21, P.timberD); rect(g, x - 10, 16, 60, 5, P.timber); rect(g, x - 10, 16, 60, 1, P.timberL); }   // shoring
      for (let k = 0; k < 16; k++) { let x = (k * 31) % W; for (let y = 0; y < 30 + (k % 4) * 16; y++) { px(g, x, y, k % 2 ? P.root : P.rootL); if (y % 7 === 0) x += (k % 3) - 1; } }
      for (const x of [140, 380]) { rect(g, x, 60, 6, 8, '#2a2420'); rect(g, x + 1, 62, 4, 4, P.lamp); line(g, x + 3, 21, x + 3, 60, '#2a2420'); } }
    else if (theme === 'mage') {                                                                                                 /* THE WALLPAPER BROKEN: shelves of different heights and widths, a gap for a window, a stair, a ladder */
      let x = 0; while (x < W) { const w = 26 + ((rnd() * 40) | 0), top = 10 + ((rnd() * 50) | 0);
        if (rnd() < 0.18) { arch(g, x + 6, top + 10, 16, 50, P.window); circle(g, x + 12, top + 24, 3, P.moon); x += 30; continue; }
        rect(g, x, top, w, H - top, P.wood); rect(g, x, top, w, 2, P.woodL); rect(g, x + w - 2, top, 2, H - top, P.woodD);
        for (let y = top + 4; y < H - 8; y += 14) { rect(g, x + 2, y + 11, w - 4, 2, P.woodD); let bx = x + 3; while (bx < x + w - 5) { const bw = 2 + ((rnd() * 2) | 0), bh = 7 + ((rnd() * 4) | 0); if (rnd() < 0.85) rect(g, bx, y + 11 - bh, bw, bh, P.books[(rnd() * P.books.length) | 0]); bx += bw + (rnd() < 0.15 ? 3 : 0); } }
        if (rnd() < 0.3) { for (let y = top; y < H; y += 5) rect(g, x + w - 8, y, 6, 1, P.woodL); rect(g, x + w - 8, top, 1, H - top, P.woodL); rect(g, x + w - 3, top, 1, H - top, P.woodL); }   // a rolling ladder
        x += w + 2 + ((rnd() * 8) | 0); }
      for (let k = 0; k < 10; k++) { const cx = (k * 53 + 20) % W, cy = 8 + (k * 17) % 40; rect(g, cx, cy, 2, 5, P.candle); px(g, cx, cy - 1, P.flame); px(g, cx + 1, cy - 2, '#fff6d0'); } }   // floating candles
    else if (theme === 'monastery') { for (let x = 0; x < W; x++) { const y = 84 + Math.round(8 * per(W, 2, x) + 4 * per(W, 7, x, 1)); rect(g, x, y, 1, H - y, x % 7 ? '#7e6e5a' : '#6e604e'); px(g, x, y, '#a8987c'); }   // the peak's body, whole, under every terrace
      for (let k = 0; k < 4; k++) { const x = 20 + k * 120, y = 60 + (k % 2) * 22;                 // terraces down the peak, a hall on each
        rect(g, x - 10, y + 20, 100, H - y - 20, '#8a7a64'); rect(g, x - 10, y + 20, 100, 2, '#b0a084'); rect(g, x, y, 70, 20, P.stone); rect(g, x, y, 70, 2, P.stoneL); rect(g, x + 10, y + 8, 6, 12, '#5a4a3a'); rect(g, x + 50, y + 8, 6, 12, '#5a4a3a');
        fillPoly(g, [[x - 8, y], [x + 35, y - 18], [x + 78, y]], P.roof); line(g, x - 8, y, x + 35, y - 18, P.roofL);
        for (let f = 0; f < 10; f++) { const fx = x + 70 + f * 5; rect(g, fx, y - 10 + Math.round(f * 1.2), 3, 4, P.flags[f % 5]); } line(g, x + 70, y - 10, x + 120, y + 2, '#6a5a4a');   // prayer flags
        for (let p = 0; p < 3; p++) { const px0 = x - 30 + p * 12; for (let r = 0; r < 20; r++) rect(g, px0 - (r >> 2), y + 30 - 20 + r, (r >> 1) + 1, 1, r % 4 ? P.pine : P.pineL); } } }
    else { rect(g, 0, H - 30, W, 30, '#00000000'); for (let x = 30; x < W; x += 110) { rect(g, x, 60, 60, 36, P.shelf); rect(g, x, 60, 60, 3, P.floorL); rect(g, x + 4, 70, 52, 2, '#3a2c22'); } }   // the shop counters, in rows
  });
}
// ================= NEAR =================
export function bakeRedressNear(theme) {
  const P = REDRESS_PAL[theme], W = 640, H = 300;
  return mk(W, H, g => {
    if (theme === 'castle') { for (const x of [0, 400]) { rect(g, x, 0, 30, H, '#262a34'); rect(g, x + 26, 0, 4, H, '#3a4050'); } for (const x of [180, 520]) for (let y = 0; y < 90; y += 4) { rect(g, x, y, 3, 3, '#2a2e38'); } }   // near pillars, hanging chains
    else if (theme === 'undercrown') { for (let k = 0; k < 8; k++) { const x = k * 90; fillPoly(g, [[x, H], [x + 20, H - 50 - (k % 3) * 20], [x + 60, H - 30], [x + 80, H]], '#16120f'); } for (let k = 0; k < 10; k++) { let x = k * 67; for (let y = 0; y < 90; y++) { px(g, x, y, '#2a2018'); if (y % 9 === 0) x++; } } }
    else if (theme === 'mage') { for (const x of [60, 340, 560]) { line(g, x, 0, x, 60, '#3a3050'); circle(g, x, 66, 6, '#3a3050'); circle(g, x, 66, 3, P.flame); } }   // hanging lamps
  });
}
// ================= DRESSING =================
export function bakeRedressProps(theme) {
  const P = REDRESS_PAL[theme], m = (w, h, fn) => mk(w, h, fn);
  const common = { barrel: m(12, 14, g => { rect(g, 1, 1, 10, 13, '#6a4a30'); rect(g, 0, 3, 12, 2, '#3a3a40'); rect(g, 0, 10, 12, 2, '#3a3a40'); rect(g, 3, 1, 1, 13, '#8a6440'); }),
    crate: m(14, 12, g => { rect(g, 0, 0, 14, 12, '#7a5a3a'); rect(g, 0, 0, 14, 1, '#9a7650'); line(g, 0, 0, 13, 11, '#4e3a26'); rect(g, 0, 11, 14, 1, '#4e3a26'); }) };
  if (theme === 'castle') return { ...common, suit: m(10, 24, g => { rect(g, 3, 0, 4, 5, '#9aa4b4'); rect(g, 2, 5, 6, 10, '#8a94a4'); rect(g, 2, 15, 2, 9, '#7a8494'); rect(g, 6, 15, 2, 9, '#7a8494'); line(g, 9, 2, 9, 24, '#c8ccd8'); }),
    brazier: m(12, 14, g => { rect(g, 2, 8, 8, 2, '#3a3a40'); line(g, 3, 10, 1, 14, '#3a3a40'); line(g, 8, 10, 10, 14, '#3a3a40'); ellipse(g, 6, 6, 4, 3, P.torch); px(g, 6, 3, '#fff0c0'); }),
    rug: m(32, 3, g => { rect(g, 0, 0, 32, 3, P.rug); rect(g, 0, 0, 32, 1, P.gold); }) };
  if (theme === 'undercrown') return { ...common, rubble: m(16, 7, g => { for (let k = 0; k < 6; k++) rect(g, k * 2 + (k % 2), 7 - 2 - (k % 3), 4, 2 + (k % 3), k % 2 ? P.stone : P.stoneD); }),
    prop: m(6, 30, g => { rect(g, 1, 0, 4, 30, P.timber); rect(g, 1, 0, 1, 30, P.timberL); rect(g, 0, 0, 6, 3, P.timberD); }), lamp: m(6, 8, g => { rect(g, 0, 2, 6, 6, '#2a2420'); rect(g, 1, 3, 4, 4, P.lamp); }) };
  return common;
}
export const REDRESS_KITS = { castle: { kinds: ['suit', 'brazier', 'rug', 'barrel'], density: 0.18 }, undercrown: { kinds: ['rubble', 'rubble', 'prop', 'lamp', 'crate'], density: 0.26 },
  shopWood: { kinds: ['barrel', 'crate'], density: 0.3 }, shopCrag: { kinds: ['crate', 'barrel'], density: 0.3 }, shopSea: { kinds: ['barrel', 'barrel', 'crate'], density: 0.35 } };
