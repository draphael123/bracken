/* src/demo-teaser.js - THE END CARD'S 'WHAT'S IN THE FULL GAME' VIGNETTES (claude/demoend2, Daniel 11-07 demo idea 2).
   Five tiny pixel pictures of later content - the Buried City desert, Highcrown, the Long Water, the Drake and the Demon King - BAKED here, in code, from a few rects, slopes and a seeded
   hash: no image files ship (nothing to preload, nothing the demo's lean first load has to carry) and no page is needed to make them. bake(id) is pure: it returns { w, h, px } with px an
   RGBA byte array (ImageData-ready), the same bytes every call. demo-end.js paints each onto a small canvas and scales it up with crisp pixels.
   They are mood pictures in the game's own palette, not captures: real stills from the later levels can replace them by swapping a scene's painter (OWED: browser stills, see the lane report). */
export const W = 64, H = 36;
/* the order they show in; label = what the caption says (level / boss names as the game spells them) */
export const SCENES = [
  { id: 'desert', label: 'THE BURIED CITY' },
  { id: 'crown', label: 'HIGHCROWN' },
  { id: 'water', label: 'THE LONG WATER' },
  { id: 'drake', label: 'THE DRAKE' },
  { id: 'demon', label: 'THE DEMON KING' },
];
const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const mix = (a, b, t) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t));
const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function canvas() {
  const px = new Uint8ClampedArray(W * H * 4);
  const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255; };
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
  const sky = (top, bot, y1 = H) => { for (let y = 0; y < y1; y++) { const c = mix(top, bot, y / Math.max(1, y1 - 1)); for (let x = 0; x < W; x++) put(x, y, c); } };
  const disc = (cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + 1) put(cx + x, cy + y, c); };
  /* a ground silhouette: height(x) -> the column is filled from that row down */
  const ground = (fn, c, c2) => { for (let x = 0; x < W; x++) { const top = Math.round(fn(x)); for (let y = top; y < H; y++) put(x, y, c2 && y === top ? c2 : c); } };
  const tri = (x0, y0, x1, y1, x2, y2, c) => {
    const mnY = Math.floor(Math.min(y0, y1, y2)), mxY = Math.ceil(Math.max(y0, y1, y2)), mnX = Math.floor(Math.min(x0, x1, x2)), mxX = Math.ceil(Math.max(x0, x1, x2));
    const sg = (ax, ay, bx, by, qx, qy) => (qx - bx) * (ay - by) - (ax - bx) * (qy - by);
    for (let y = mnY; y <= mxY; y++) for (let x = mnX; x <= mxX; x++) { const d1 = sg(x, y, x0, y0, x1, y1), d2 = sg(x, y, x1, y1, x2, y2), d3 = sg(x, y, x2, y2, x0, y0); if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) put(x, y, c); }
  };
  return { px, put, rect, sky, disc, ground, tri };
}
const stars = (g, n, ymax, c, seed) => { for (let k = 0; k < n; k++) g.put(hash(k, 1, seed) * W, hash(k, 2, seed) * ymax, c); };
const PAINT = {
  /* THE BURIED CITY: a low gold sun over dunes and a half-sunk pyramid */
  desert(g) {
    g.sky(hex('#2b1b45'), hex('#f0a45a')); stars(g, 10, 10, hex('#f4e6c0'), 3);
    g.disc(46, 20, 6, hex('#ffe9a8')); g.disc(46, 20, 4, hex('#fff6d0'));
    g.ground(x => 24 + Math.sin(x * 0.11) * 2.2, hex('#b4623a'));
    g.tri(10, 27, 24, 12, 38, 27, hex('#7e4128')); g.tri(24, 12, 38, 27, 24, 27, hex('#5a2c1d')); g.rect(23, 11, 2, 2, hex('#ffd36b'));
    g.ground(x => 28 + Math.sin(x * 0.17 + 1.3) * 2.6, hex('#7a3a26'), hex('#a8532f'));
    g.rect(52, 23, 1, 5, hex('#2b1b2b')); g.rect(50, 24, 1, 2, hex('#2b1b2b')); g.rect(54, 25, 1, 2, hex('#2b1b2b'));   /* a cactus */
  },
  /* HIGHCROWN: the castle on its hill at dusk, banners out, windows lit */
  crown(g) {
    g.sky(hex('#34406e'), hex('#e8a47a')); stars(g, 14, 12, hex('#e8e8ff'), 5);
    g.disc(52, 8, 3, hex('#f4f0d8'));
    g.ground(x => 30 + Math.abs(x - 32) * 0.12, hex('#1d2a2b'));
    const wall = hex('#2c2a40'), lit = hex('#ffd36b'), roof = hex('#5a2a3a');
    g.rect(14, 18, 36, 12, wall);
    for (const [x, h] of [[12, 22], [29, 28], [46, 22]]) { g.rect(x, 30 - h + 2, 7, h, wall); g.tri(x - 1, 30 - h + 2, x + 3.5, 30 - h - 5, x + 8, 30 - h + 2, roof); g.rect(x + 3, 30 - h - 7, 1, 3, hex('#cfc7a0')); g.rect(x + 4, 30 - h - 7, 3, 2, hex('#c43c3c')); }
    for (const [x, y] of [[15, 22], [32, 17], [48, 22], [22, 24], [40, 24], [32, 24]]) g.put(x, y, lit);
    g.rect(29, 26, 6, 5, hex('#171322')); g.rect(30, 25, 4, 1, hex('#171322'));
  },
  /* THE LONG WATER: a ship on a moonlit sea, the moon's road on the swell */
  water(g) {
    g.sky(hex('#10213f'), hex('#2f6a86'), 21); stars(g, 12, 14, hex('#dff4ff'), 8);
    g.disc(44, 9, 4, hex('#f2f6e4'));
    for (let y = 21; y < H; y++) for (let x = 0; x < W; x++) { const wv = Math.sin(x * 0.5 + y * 1.7) + hash(x >> 1, y, 4) * 0.6, base = mix(hex('#1c4a66'), hex('#0b1c33'), (y - 21) / 15); g.put(x, y, wv > 0.9 ? mix(base, hex('#6fb4cf'), 0.55) : base); }
    for (let y = 22; y < H; y += 2) { const w = 2 + ((y - 22) >> 1); g.rect(44 - (w >> 1) + Math.round(Math.sin(y) * 1.5), y, w, 1, hex('#e8f0c8')); }
    const hull = hex('#1a1424'), sail = hex('#d8cfae');
    g.tri(14, 22, 38, 22, 34, 27, hull); g.rect(14, 21, 24, 2, hull); g.rect(25, 8, 1, 14, hull);
    g.tri(26, 9, 26, 20, 36, 20, sail); g.tri(24, 11, 24, 20, 17, 20, mix(sail, hex('#10213f'), 0.25)); g.put(26, 7, hex('#c43c3c')); g.put(27, 7, hex('#c43c3c'));
  },
  /* THE DRAKE: frost on one side, fire on the other, the beast between with its wings spread */
  drake(g) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const t = x / (W - 1), cold = mix(hex('#cfe8f4'), hex('#4a6a9a'), y / H), hot = mix(hex('#ffb04a'), hex('#8a1d12'), y / H); g.put(x, y, mix(cold, hot, Math.min(1, Math.max(0, (t - 0.35) / 0.3)))); }
    g.ground(x => x < 32 ? 27 - Math.abs(Math.sin(x * 0.25)) * 4 : 29 - Math.abs(Math.sin(x * 0.3 + 1)) * 3, hex('#1b1626'));
    for (let x = 0; x < 28; x += 3) g.put(x, 24 - Math.abs(Math.sin(x * 0.25)) * 4, hex('#eaf6ff'));   /* snow caps */
    for (let x = 36; x < W; x += 3) g.put(x, 26 - Math.abs(Math.sin(x * 0.3 + 1)) * 3, hex('#ff8a2a'));   /* embers on the ridge */
    const d = hex('#120e1c');
    g.tri(32, 14, 6, 6, 18, 18, d); g.tri(32, 14, 58, 6, 46, 18, d); g.tri(32, 14, 14, 20, 22, 16, d); g.tri(32, 14, 50, 20, 42, 16, d);   /* the wings */
    g.rect(29, 13, 6, 9, d); g.rect(27, 10, 4, 4, d); g.tri(26, 11, 21, 12, 26, 13, d); g.tri(28, 10, 26, 6, 30, 9, d); g.rect(33, 21, 3, 6, d); g.tri(35, 24, 44, 29, 35, 27, d);   /* body, head, horn, tail */
    g.put(28, 11, hex('#ffd36b'));
  },
  /* THE DEMON KING: a horned shape over a red sky and a lava floor */
  demon(g) {
    g.sky(hex('#1c0b1c'), hex('#b8301c'), 28); stars(g, 6, 8, hex('#ff9a6a'), 9);
    g.ground(x => 25 + Math.abs(Math.sin(x * 0.4)) * 3 + (x % 7 === 0 ? -2 : 0), hex('#190b14'));
    for (let y = 29; y < H; y++) for (let x = 0; x < W; x++) g.put(x, y, mix(hex('#ff7a22'), hex('#c4380f'), hash(x >> 1, y, 2) * 0.8));
    const d = hex('#0d0510');
    g.tri(32, 10, 18, 28, 46, 28, d); g.rect(26, 12, 12, 17, d); g.rect(20, 14, 24, 6, d);
    g.rect(27, 6, 10, 7, d); g.tri(27, 7, 22, 0, 29, 6, d); g.tri(37, 7, 42, 0, 35, 6, d);   /* head and horns */
    g.tri(20, 15, 8, 28, 26, 24, d); g.tri(44, 15, 56, 28, 38, 24, d);   /* the great arms */
    g.rect(29, 9, 2, 1, hex('#ffd36b')); g.rect(33, 9, 2, 1, hex('#ffd36b')); g.rect(30, 8, 4, 1, hex('#8a1d12'));
    g.disc(32, 20, 2, hex('#ff5a2a'));
  },
};
export function bake(id) { const g = canvas(); if (!PAINT[id]) throw new Error('no such teaser scene: ' + id); PAINT[id](g); return { w: W, h: H, px: g.px }; }
/* paint a baked scene onto a <canvas> (browser only) */
export function paint(cv, id) { cv.width = W; cv.height = H; const ctx = cv.getContext('2d'); if (!ctx) return false; const s = bake(id); ctx.putImageData(new ImageData(s.px, s.w, s.h), 0, 0); return true; }
