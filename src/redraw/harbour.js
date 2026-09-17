// harbour.js — THE FLOTILLA AT THE END OF THE DAY. The fleet was drawn at hard noon with its own fleet on the horizon, the same
// layers as the Hurricane Deck, and nothing in it moved. This is the same town of ships in harbour light: the sun going down
// behind the old port on the shore, the hulls of the flotilla between you and it with the gold along their rails, washing and
// lanterns strung from hull to hull, a market under striped awnings, the cook fires going, every crew's flag, gulls, hens.
//   bakeSkyHarbour(h)          1 x h column, violet at the top to gold on the water
//   bakeFarHarbour()           640 x 150, horizon row 70: the port town, the mole and its light, the sun on the water
//   bakeMidHarbour()           640 x 160, waterline row 110: the moored hulls, their masts, lines, nets and gangplanks
//   bakeNearHarbour()          640 x 300, rail row ~128: two hulls close by, the market on her deck, the fire, the coops
//   bakeHarbourLife()          the moving parts: flags x6 (3 frames), flame (3), hen (3), gull (2), smoke puff, lantern glow
//   drawHarbourLayer(g, which, layer, f, baseY, cx, dY, time, VW, VH)
//                              lays a layer and then its life ON it: every moving thing is anchored to a point in the baked
//                              layer (so its identity is the layer's, never the screen's) and runs on the game clock
// Each layer carries `.life` (the points the bake left for the moving parts). Everything here is behind the play: the moving
// parts are small, dim against the creatures, and never white.
import { canvas, px, rect, mulberry } from '../px.js';

const SUN = { disc: '#fff0c2', ring: '#ffd88a', gold: '#ffc070', amber: '#f09a62' };
const TOWN = { far: '#b48ea8', farL: '#c8a0b2', mid: '#98769c', midL: '#ac88a8', near: '#7a6290', nearL: '#8e74a0', win: '#ffd27a', winD: '#e0a060', roof: '#6a4c6a' };
const HULL = { d: '#2c1c22', m: '#3c282c', l: '#4e3436', hi: '#644440', rim: '#e8a060', rimL: '#ffd08a', mast: '#34242a', mastL: '#4a3434', rope: '#6e5048', ropeL: '#8a6a5a', cloth: '#d8b494', clothD: '#a88070', port: '#140c10', glass: '#ffc878' };
const FLAGS = [   // six crews, six flags: a field, a charge, the charge's colour
  ['#1e1a22', 'skull', '#ece2cc'], ['#a8343a', 'cross', '#f0e4c8'], ['#2e4e86', 'star', '#f2c64a'],
  ['#2e6a4e', 'fish', '#e8e2c8'], ['#d8a83a', 'bars', '#2a2226'], ['#5a3a78', 'moon', '#f0e0a8']];

const wrapper = w => x => ((Math.round(x) % w) + w) % w;

export function bakeSkyHarbour(h) {
  const [c, g] = canvas(1, h);
  const st = [[0, [44, 54, 112]], [0.22, [78, 76, 140]], [0.4, [150, 104, 152]], [0.54, [214, 132, 136]], [0.66, [240, 164, 112]], [0.78, [255, 200, 120]], [0.9, [255, 226, 160]], [1, [255, 214, 150]]];
  for (let y = 0; y < h; y++) {
    const q = Math.round((y / Math.max(1, h - 1)) * 15) / 15;
    let i = 0; while (i < st.length - 2 && q > st[i + 1][0]) i++;
    const [t0, a] = st[i], [t1, b] = st[i + 1], k = Math.min(1, Math.max(0, (q - t0) / (t1 - t0)));
    px(g, 0, y, 'rgb(' + ((a[0] + (b[0] - a[0]) * k) | 0) + ',' + ((a[1] + (b[1] - a[1]) * k) | 0) + ',' + ((a[2] + (b[2] - a[2]) * k) | 0) + ')');
  }
  return c;
}

// THE PORT ON THE SHORE, with the sun going down behind it. Three depths of roofs going violet with distance, a church, a
// warehouse row on the quay, the mole running out with the light at its end, and the sun half into the sea with its road of
// gold coming at you. Transparent above the town and the sun.
export function bakeFarHarbour() {
  const w = 640, h = 150, H0 = 70, rnd = mulberry(7101), wrap = wrapper(w), [c, g] = canvas(w, h);
  const P = (x, y, col) => { if (y >= 0 && y < h) px(g, wrap(x), y, col); };
  const R = (x, y, ww, hh, col) => { for (let a = 0; a < ww; a++) for (let b = 0; b < hh; b++) P(x + a, y + b, col); };
  const life = { lights: [], gulls: [] };
  // the sun: a glow, a disc, and the sea cutting it in half
  const sx = 452;
  for (let r = 34; r > 0; r -= 1) { const a = r > 24 ? 0.05 : r > 16 ? 0.09 : 0.16; for (let dy = -r; dy <= 0; dy++) { const hw = Math.round(Math.sqrt(r * r - dy * dy)); for (let dx = -hw; dx <= hw; dx += 1) if ((dx + dy + r) % (r > 16 ? 2 : 1) === 0) P(sx + dx, H0 + dy, 'rgba(255,214,140,' + a + ')'); } }
  for (let dy = -13; dy <= 0; dy++) { const hw = Math.round(Math.sqrt(169 - dy * dy)); for (let dx = -hw; dx <= hw; dx++) P(sx + dx, H0 + dy, dy > -4 ? SUN.ring : SUN.disc); }
  // the sea: gold under the sun going to dusk violet toward us, laid in bands with a dithered seam
  const bandCol = y => { const t = (y - H0) / (h - H0); return t < 0.06 ? '#f4c088' : t < 0.18 ? '#d0907a' : t < 0.36 ? '#a07082' : t < 0.6 ? '#70547a' : '#4e4068'; };
  for (let y = H0; y < h; y++) for (let x = 0; x < w; x++) { const a = bandCol(y), b = bandCol(y + 1); P(x, y, a !== b && ((x + y) & 1) ? b : a); }
  // the swell, a step lighter than what it lies on, longer as it comes at you
  for (let y = H0 + 3; y < h; y++) { const r = y - H0, n = Math.round(w / (8 + r * 0.3)); for (let i = 0; i < n; i++) { const x = (rnd() * w) | 0, len = 1 + ((r / 9) | 0); for (let k = 0; k < len; k++) P(x + k, y, r < 12 ? '#f6c690' : r < 30 ? '#c8928a' : '#8e6c8c'); } }
  // the sun's road on the water
  for (let y = H0 + 1; y < h; y++) { const t = (y - H0) / (h - H0), spread = 5 + t * t * 70, n = Math.round(3 + t * 12);
    for (let i = 0; i < n; i++) { const x = sx + (rnd() - 0.5) * spread * 2, len = 1 + ((t * 4) | 0); for (let k = 0; k < len; k++) P(x + k, y, rnd() < 0.5 ? '#fff0c0' : '#ffd08a'); } }
  // THE TOWN: three rows of roofs, the back row palest. Gaps are left where the sea runs in (either side of the sun) so the
  // light gets through to the water.
  const house = (x, base, ww, hh, col, colL, roofK, lit) => {
    R(x, base - hh, ww, hh, col);
    for (let b = 0; b < hh; b++) P(x + ww - 1, base - hh + b, colL);   /* the sun is behind: only the edge toward it catches */
    const rh = Math.max(3, Math.round(ww * 0.45));
    if (roofK === 0) for (let b = 0; b < rh; b++) for (let a = b; a < ww - b; a++) P(x + a, base - hh - rh + b + 1, b === 0 ? colL : col);   /* gable */
    else if (roofK === 1) { R(x - 1, base - hh - 2, ww + 2, 2, col); P(x + ww, base - hh - 2, colL); }                                            /* flat, with a cornice */
    else { for (let b = 0; b < rh; b++) R(x + ((ww - 2) >> 1) - (b >> 1), base - hh - rh + b + 1, 2 + b, 1, col); }                              /* hipped */
    if (rnd() < 0.5) { R(x + 1 + ((rnd() * (ww - 3)) | 0), base - hh - rh - 2, 2, 4, col); }                                                    /* a chimney */
    if (lit) for (let k = 0; k < Math.floor(ww / 4); k++) for (let row = 0; row < Math.floor((hh - 2) / 5); row++) if (rnd() < 0.18) { const wx = x + 1 + k * 4, wy = base - hh + 2 + row * 5; P(wx, wy, TOWN.win); P(wx, wy + 1, TOWN.winD); if (rnd() < 0.3) life.lights.push([wrap(wx), wy]); }
  };
  const row = (x0, x1, base, hmin, hmax, col, colL, lit) => { for (let x = x0; x < x1;) { const ww = 6 + ((rnd() * 9) | 0); house(x, base, ww, hmin + ((rnd() * (hmax - hmin)) | 0), col, colL, (rnd() * 3) | 0, lit); x += ww + (rnd() < 0.2 ? 2 : 0); } };
  // the hill behind the town, and its back row
  for (let x = 0; x < w; x++) { const u = x / w * Math.PI * 2, top = Math.round(H0 - 26 - 10 * Math.sin(u + 0.6) - 5 * Math.sin(u * 3 + 1.1)); if (x > 360 && x < 540) continue; for (let y = top; y < H0; y++) P(x, y, y === top ? TOWN.farL : TOWN.far); }
  row(-40, 350, H0 - 14, 8, 18, TOWN.far, TOWN.farL, false);
  row(550, 640, H0 - 14, 8, 16, TOWN.far, TOWN.farL, false);
  row(-30, 340, H0 - 5, 10, 22, TOWN.mid, TOWN.midL, true);
  row(560, 630, H0 - 5, 9, 20, TOWN.mid, TOWN.midL, true);
  // the church on the hill, its tower and a lit belfry
  { const x = 118, base = H0 - 20; R(x, base - 34, 9, 34, TOWN.mid); for (let b = 0; b < 12; b++) R(x + 4 - (b >> 2), base - 46 + b, 1 + (b >> 1), 1, TOWN.mid); P(x + 4, base - 48, TOWN.midL); P(x + 4, base - 47, TOWN.mid);
    P(x + 3, base - 28, TOWN.win); P(x + 5, base - 28, TOWN.win); life.lights.push([x + 4, base - 28]); R(x + 9, base - 16, 22, 16, TOWN.mid); for (let a = 0; a < 22; a++) P(x + 9 + a, base - 17 - Math.round(4 * Math.sin(Math.PI * a / 21)), TOWN.mid); }
  // the windmill on the shoulder of the hill
  { const x = 268, base = H0 - 30; for (let b = 0; b < 16; b++) R(x - 2 - (b >> 4), base - b, 5 + ((16 - b) >> 4), 1, TOWN.far); for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) for (let k = 2; k < 11; k++) P(x + dx * k, base - 16 + dy * k, TOWN.farL); }
  // the quay: a warehouse row with its doors lit, and a crane
  row(0, 330, H0, 12, 20, TOWN.near, TOWN.nearL, true);
  R(-10, H0 - 2, 350, 2, '#4a3a58');
  { const x = 300, base = H0 - 2; for (let b = 0; b < 26; b++) P(x, base - b, TOWN.near); for (let a = 0; a < 16; a++) P(x - a, base - 26 + (a >> 3), TOWN.near); for (let b = 0; b < 8; b++) P(x - 15, base - 24 + b, '#6a5470'); R(x - 18, base - 16, 6, 4, TOWN.near); }
  // the mole running out into the water, the light at the end of it
  { R(330, H0 - 3, 90, 3, TOWN.near); for (let a = 330; a < 420; a += 6) P(a, H0 - 4, TOWN.nearL);
    const lx = 416; R(lx - 3, H0 - 26, 7, 23, '#6e5a76'); for (let b = 0; b < 23; b += 6) R(lx - 3, H0 - 26 + b, 7, 2, '#a88a98'); R(lx - 4, H0 - 30, 9, 4, '#4a3a58'); R(lx - 2, H0 - 34, 5, 4, TOWN.win); R(lx - 1, H0 - 36, 3, 2, '#4a3a58'); life.lights.push([lx, H0 - 32, 'beacon']); }
  // ships at anchor off the port, far out, the sun behind their canvas
  for (const [x, ht] of [[486, 16], [512, 11], [596, 13], [196, 9]]) { for (let b = 0; b < ht; b++) P(x, H0 - 1 - b, '#6a4e6a'); for (let k = 0; k < 2; k++) { const yy = H0 - 4 - k * 6, hw = 4 - k; R(x - hw, yy - 4, hw * 2 + 1, 4, '#b48a92'); P(x + hw, yy - 4, '#e6b690'); } R(x - 7, H0 - 2, 15, 2, '#5a4460'); }
  for (let i = 0; i < 5; i++) life.gulls.push([(rnd() * w) | 0, 16 + ((rnd() * 30) | 0), rnd() * 6]);
  c.life = life; c.H0 = H0; return c;
}

// THE FLOTILLA ITSELF, seen across the water with the sun behind it: five hulls moored in a line, black against the gold with
// the light running along their rails; laundry, lanterns and a cargo net strung between them, gangplanks across the gaps, and a
// different crew's flag at every masthead.
export function bakeMidHarbour() {
  const w = 640, h = 160, W = 110, rnd = mulberry(7202), wrap = wrapper(w), [c, g] = canvas(w, h);
  const P = (x, y, col) => { if (y >= 0 && y < h) px(g, wrap(x), y, col); };
  const life = { lanterns: [], flags: [], smoke: [] };
  // the water under them
  for (let y = W; y < h; y++) for (let x = 0; x < w; x++) { const t = (y - W) / (h - W); P(x, y, t < 0.08 ? '#a87480' : t < 0.3 ? '#7e5c7a' : t < 0.65 ? '#5a4668' : '#44385a'); }
  for (let y = W + 2; y < h; y++) { const r = y - W; for (let i = 0; i < w / (9 + r * 0.3); i++) { const x = (rnd() * w) | 0; for (let k = 0; k < 2 + (r >> 6); k++) P(x + k, y, r < 10 ? '#f0b88a' : '#9a7490'); } }
  const decks = [];
  const ship = (x0, len, ht, nmast, flagI) => {
    const deck = i => Math.round(W - ht * (0.82 + 0.18 * Math.pow(Math.abs(i / (len - 1) - 0.45) * 2, 2.2)));
    for (let i = 0; i < len; i++) { const t0 = deck(i);
      for (let y = t0; y <= W; y++) { const k = (y - t0) % 4; P(x0 + i, y, k === 3 ? HULL.d : (y - t0) > (W - t0) * 0.6 ? HULL.d : k === 0 ? HULL.l : HULL.m); }
      P(x0 + i, t0, HULL.rimL); P(x0 + i, t0 + 1, (i & 3) ? HULL.rim : HULL.hi); P(x0 + i, t0 + 2, HULL.d);
      if (i % 11 === 5 && i > 4 && i < len - 5) { for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) P(x0 + i + a, t0 + 6 + b, HULL.glass); }   /* the lit ports */
      P(x0 + i, W, (i & 1) ? '#ffcf90' : '#e89a70'); }
    // her quarterdeck, with the lit stern windows
    const qw = Math.round(len * 0.26), qh = Math.round(ht * 0.35), qt = deck(0) - qh;
    for (let a = 0; a < qw; a++) for (let b = 0; b < qh; b++) P(x0 + a, qt + b, (b % 4) === 3 ? HULL.d : HULL.m);
    for (let a = 0; a < qw; a++) { P(x0 + a, qt, HULL.rimL); P(x0 + a, qt + 1, HULL.rim); }
    for (let k = 0; k < Math.max(1, Math.floor(qw / 8)); k++) for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) P(x0 + 3 + k * 8 + a, qt + 4 + b, (a + b) & 1 ? HULL.glass : '#f0a860');
    // the bowsprit
    for (let j = 0; j < Math.round(len * 0.22); j++) P(x0 + len - 1 + j, deck(len - 1) - 2 - Math.round(j * 0.45), HULL.mast);
    const masts = [];
    for (let k = 0; k < nmast; k++) {
      const i = Math.round(len * (0.3 + 0.5 * (nmast > 1 ? k / (nmast - 1) : 0.4))), base = deck(i), mh = Math.round(ht * (2.2 + rnd() * 0.5)), top = base - mh;
      for (let j = 0; j < mh; j++) { P(x0 + i, base - j, HULL.mast); if (j < mh * 0.6) P(x0 + i + 1, base - j, HULL.mastL); }
      for (let q = 0; q < 2; q++) { const yy = base - Math.round(mh * (0.45 + q * 0.3)), yl = Math.round(len * (0.16 - q * 0.05));
        for (let a = -yl; a <= yl; a++) { P(x0 + i + a, yy, HULL.mast); if (Math.abs(a) < yl * 0.7) P(x0 + i + a, yy + 1, (a + 20) % 6 ? HULL.cloth : HULL.clothD); }
        P(x0 + i + yl, yy, HULL.rim); }
      for (const side of [-1, 1]) for (let s = 0; s < 2; s++) { const ex = i + side * Math.round(len * (0.06 + s * 0.03)); for (let j = 0; j <= 24; j++) { const t = j / 24; if ((j + s) % 5 === 0) continue; P(x0 + i + (ex - i) * t, Math.round(top + 3 + (base + 2 - top - 3) * t), HULL.rope); } }
      life.flags.push([wrap(x0 + i + 1), top, (flagI + k) % FLAGS.length]);
      masts.push([x0 + i, top, base]);
    }
    decks.push({ x0, len, deck, masts });
  };
  const xs = [[8, 104, 36, 3], [138, 84, 30, 2], [250, 96, 34, 2], [374, 76, 28, 2], [482, 120, 40, 3]];
  xs.forEach(([x, len, ht, n], i) => ship(x, len, ht, n, i * 2 + 1));
  // what is strung between them: a line from a masthead of one to the next, sagging, with its load
  const line = (xa, ya, xb, yb, sag, load) => {
    const n = Math.max(1, Math.round(xb - xa)), yat = i => Math.round(ya + (yb - ya) * (i / n) + sag * Math.sin(Math.PI * i / n));
    for (let i = 0; i <= n; i++) P(xa + i, yat(i), HULL.rope);
    if (load === 'lanterns') for (let i = 6; i < n - 4; i += 9) { const y = yat(i); P(xa + i, y + 1, HULL.mast); P(xa + i, y + 2, '#c87a3a'); P(xa + i, y + 3, '#a05a2a'); life.lanterns.push([wrap(xa + i), y + 2]); }
    if (load === 'washing') for (let i = 4; i < n - 6; i += 7 + ((rnd() * 5) | 0)) { const y = yat(i), ww = 4 + ((rnd() * 3) | 0), hh = 5 + ((rnd() * 5) | 0), col = ['#c89a8a', '#8a9ab0', '#b8a070', '#a86060', '#d0b8a0', '#7a9a88'][(rnd() * 6) | 0];
      for (let a = 0; a < ww; a++) for (let b = 1; b <= hh - (a === 0 || a === ww - 1 ? 1 : 0); b++) P(xa + i + a, yat(i + a) + b, a === ww - 1 ? '#6a4a50' : col); }
    return yat;
  };
  for (let s = 0; s < decks.length; s++) { const A = decks[s], B = decks[(s + 1) % decks.length], bx0 = s === decks.length - 1 ? B.x0 + w : B.x0;
    const am = A.masts[A.masts.length - 1], bm = B.masts[0], bmx = s === decks.length - 1 ? bm[0] + w : bm[0];
    line(am[0], am[1] + 8, bmx, bm[1] + 8, 10, 'lanterns');
    line(am[0], am[1] + Math.round((am[2] - am[1]) * 0.55), bmx, bm[1] + Math.round((bm[2] - bm[1]) * 0.55), 7, 'washing');
    // the gangplank across the gap, deck to deck
    const ya = A.deck(A.len - 1), yb = B.deck(0), xa = A.x0 + A.len - 2, xb = bx0 + 2, n = xb - xa;
    for (let i = 0; i <= n; i++) { const y = Math.round(ya + (yb - ya) * i / n); P(xa + i, y - 1, HULL.rimL); P(xa + i, y, HULL.hi); P(xa + i, y + 1, HULL.d); if (i % 4 === 0) { P(xa + i, y - 2, HULL.mast); P(xa + i, y - 3, HULL.mast); } }
    for (let i = 0; i <= n; i += 2) P(xa + i, Math.round(ya + (yb - ya) * i / n) - 4, HULL.rope);
  }
  // a cargo net between the third and fourth hulls, full
  { const xa = 330, ya = 58, n = 34, dep = 18;
    for (let i = 0; i <= n; i += 3) for (let j = 0; j <= dep; j++) P(xa + i + Math.round(j * 0.3), ya + j + Math.round(dep * 0.3 * Math.sin(Math.PI * i / n)), HULL.rope);
    for (let j = 0; j <= dep; j += 3) for (let i = 0; i <= n; i++) P(xa + i, ya + j + Math.round(dep * 0.3 * Math.sin(Math.PI * i / n)), HULL.rope);
    for (let a = 0; a < 12; a++) for (let b = 0; b < 8; b++) P(xa + 11 + a, ya + 9 + b, b === 0 ? HULL.rim : a === 11 ? HULL.d : '#6a4a3a'); }
  // awnings over the market decks and the smoke of the cook fires
  for (const D of decks) { const i = Math.round(D.len * 0.62), y = D.deck(i);
    for (let a = -7; a <= 7; a++) { const col = ((a + 16) >> 2) & 1 ? '#c86a58' : '#e8c8a0'; P(D.x0 + i + a, y - 9, col); P(D.x0 + i + a, y - 8, col); }
    for (const a of [-7, 7]) for (let b = 0; b < 8; b++) P(D.x0 + i + a, y - 8 + b, HULL.mast);
    life.smoke.push([wrap(D.x0 + Math.round(D.len * 0.4)), D.deck(Math.round(D.len * 0.4)) - 3]); }
  c.life = life; c.W = W; return c;
}

// TWO HULLS CLOSE BY, a gangplank between them. On the nearer one the market: a striped awning over a stall of fish hung by the
// tail and baskets of fruit, a cook fire in an iron brazier with a pot on a tripod, a coop of hens against the rail, casks and
// sacks, a mast with a string of lanterns off it. Opaque below her rail. Backlit, so dark, with gold on every top edge.
export function bakeNearHarbour() {
  const w = 640, h = 300, rnd = mulberry(7303), wrap = wrapper(w), [c, g] = canvas(w, h);
  const P = (x, y, col) => { if (y >= 0 && y < h) px(g, wrap(x), y, col); };
  const R = (x, y, ww, hh, col) => { for (let a = 0; a < ww; a++) for (let b = 0; b < hh; b++) P(x + a, y + b, col); };
  const life = { fires: [], hens: [], lanterns: [], flags: [], smoke: [] };
  const N = { d: '#221418', m: '#2e1e22', l: '#3c282a', hi: '#523834', rim: '#d8905a', rimL: '#f8c07a', mast: '#2a1a1e', mastL: '#3e2a2c', rope: '#6a4c44' };
  // the two hulls: A from 0 to 404, B from 420 to 640 (sitting lower), both with a sheer
  const hulls = [[0, 404, 128, 6], [422, 640, 138, 4]];
  const railY = (x, H) => { const [x0, x1, y0, s] = H, u = (x - x0) / (x1 - x0); return Math.round(y0 - s * Math.pow(Math.abs(u - 0.5) * 2, 2)); };
  for (const H of hulls) for (let x = H[0]; x < H[1]; x++) { const t0 = railY(x, H);
    for (let y = t0; y < h; y++) { const k = (y - t0) % 5, deep = (y - t0) / (h - t0); P(x, y, k === 4 ? N.d : deep > 0.3 ? (k === 0 ? N.m : N.d) : k === 0 ? N.l : N.m); }
    P(x, t0 - 2, N.rimL); P(x, t0 - 1, N.rim); P(x, t0 + 3, N.hi);
    if ((x - H[0]) % 46 === 20) for (let a = 0; a < 12; a++) for (let b = 0; b < 9; b++) P(x + a, t0 + 16 + b, a === 0 || b === 0 ? N.hi : (a + b) & 1 ? '#f0a860' : '#c87840');   /* lit ports */ }
  // bulwark stanchions and a rail above the deck on A
  for (let x = 4; x < 400; x += 12) { const t0 = railY(x, hulls[0]); for (let b = 0; b < 8; b++) P(x, t0 - 3 - b, N.mastL); }
  for (let x = 0; x < 404; x++) { const t0 = railY(x, hulls[0]); P(x, t0 - 11, N.rimL); P(x, t0 - 10, N.mast); }
  // the gangplank from A's rail down to B
  { const xa = 390, xb = 440, ya = railY(390, hulls[0]) - 11, yb = railY(440, hulls[1]) - 2;
    for (let i = 0; i <= xb - xa; i++) { const y = Math.round(ya + (yb - ya) * i / (xb - xa)); R(xa + i, y, 1, 3, N.m); P(xa + i, y, N.rimL); if (i % 5 === 2) P(xa + i, y + 1, N.d); }
    for (let i = 0; i <= xb - xa; i += 1) P(xa + i, Math.round(ya + (yb - ya) * i / (xb - xa)) - 7 + Math.round(2 * Math.sin(Math.PI * i / (xb - xa))), N.rope); }
  const deckY = x => railY(x, hulls[0]) - 11;   /* what A's things stand on, as seen over her rail */
  // a MAST on each hull going out of the top of the frame, with its lantern string
  for (const [mx, H] of [[64, hulls[0]], [520, hulls[1]]]) { const base = railY(mx, H);
    for (let y = 0; y < base; y++) { R(mx, y, 7, 1, N.mast); P(mx + 5, y, N.mastL); P(mx + 6, y, N.rim); }
    for (const hy of [30, 70]) R(mx - 1, hy, 9, 3, '#1a1014');
    life.flags.push([mx + 7, 6, mx < 300 ? 0 : 4]); }
  { const ya = 22, n = 456, yat = i => Math.round(ya + 18 * Math.sin(Math.PI * i / n));
    for (let i = 0; i <= n; i++) P(71 + i, yat(i), N.rope);
    for (let i = 10; i < n - 6; i += 16) { const y = yat(i); P(71 + i, y + 1, N.mast); R(70 + i, y + 2, 3, 3, '#b86a30'); P(71 + i, y + 3, '#ffd080'); life.lanterns.push([71 + i, y + 3]); } }
  // THE STALL: the awning, the posts, the counter, the fish and the baskets
  { const x = 150, y = deckY(150);
    for (let a = 0; a < 58; a++) { const sag = Math.round(2 * Math.sin(Math.PI * a / 57)); const col = (a >> 5) & 1 ? '#e8d0a8' : '#b8484a';
      for (let b = 0; b < 6; b++) P(x + a, y - 40 + sag + b, b === 5 ? ((a & 1) ? col : N.d) : col); if (a % 6 === 3) P(x + a, y - 34 + sag, col); P(x + a, y - 41 + sag, N.rimL); }
    for (const a of [1, 56]) R(x + a, y - 35, 2, 35, N.mastL);
    R(x + 2, y - 12, 54, 12, N.l); R(x + 2, y - 12, 54, 1, N.rimL); for (let a = 4; a < 54; a += 9) R(x + a, y - 10, 1, 10, N.d);
    for (let k = 0; k < 6; k++) { const fx = x + 8 + k * 8; P(fx, y - 33, N.rope); for (let b = 0; b < 8; b++) { P(fx, y - 32 + b, b < 2 ? '#8a9098' : '#b8bcc8'); if (b > 1 && b < 6) P(fx + 1, y - 32 + b, '#6a7078'); } P(fx - 1, y - 24, '#8a9098'); P(fx + 1, y - 24, '#8a9098'); }
    for (const [bx, col, col2] of [[x + 6, '#e8862a', '#ffb050'], [x + 22, '#b83a3a', '#e05a4a'], [x + 38, '#7a9a3a', '#a8c050']]) { R(bx, y - 16, 12, 4, '#6a4a2a'); for (let a = 0; a < 12; a += 2) P(bx + a, y - 16, '#8a6a3a'); for (let a = 1; a < 11; a += 3) { P(bx + a, y - 18, col); P(bx + a + 1, y - 18, col2); P(bx + a, y - 17, col); P(bx + a + 1, y - 19, col2); } } }
  // THE COOK FIRE: a brazier on legs, the tripod and the pot over it; the flames and the smoke are the life
  { const x = 250, y = deckY(250);
    R(x - 7, y - 10, 15, 5, '#2a2226'); R(x - 7, y - 10, 15, 1, '#5a4a4a'); for (const a of [-6, 6]) R(x + a, y - 5, 1, 5, '#2a2226');
    for (let b = 0; b < 24; b++) { P(x - 8 + Math.round(b * 0.33), y - 1 - b, N.mastL); P(x + 8 - Math.round(b * 0.33), y - 1 - b, N.mastL); }
    R(x - 5, y - 20, 11, 7, '#1c1618'); R(x - 5, y - 20, 11, 1, '#5a4e4e'); P(x, y - 23, '#3a3032'); for (let b = 0; b < 3; b++) P(x, y - 26 + b, '#3a3032');
    life.fires.push([x - 4, y - 12]); life.smoke.push([x, y - 22]); }
  // THE COOP: slatted crates against the rail, the hens run the deck in front of them
  { const x = 300, y = deckY(300);
    for (const [cx, ch] of [[x, 14], [x + 18, 14], [x + 9, 12]]) { const cy = cx === x + 9 ? y - 26 : y - 14; R(cx, cy, 17, ch, '#4a3226'); R(cx, cy, 17, 1, N.rimL); for (let a = 2; a < 17; a += 3) R(cx + a, cy + 2, 1, ch - 3, '#1a1012'); }
    life.hens.push([x - 30, y, 50], [x + 40, y, 30]); }
  // casks, sacks and a coil of line along the rest of her
  for (const x of [26, 100, 350]) { const y = deckY(x); for (let k = 0; k < 2; k++) { const cx = x + k * 11; R(cx, y - 13, 10, 13, '#4a3024'); R(cx, y - 13, 10, 1, N.rimL); R(cx, y - 9, 10, 1, '#1a1216'); R(cx, y - 4, 10, 1, '#1a1216'); P(cx + 9, y - 11, N.rim); } }
  for (const x of [120, 370]) { const y = deckY(x); for (let a = 0; a < 12; a++) for (let b = 0; b < 8 - Math.abs(a - 6) / 2; b++) P(x + a, y - 1 - b, b === Math.floor(7 - Math.abs(a - 6) / 2) ? '#c8a070' : '#8a6a4a'); }
  // on B: a boat turned over on her deck, and a man's washing on a line to her mast
  { const y = railY(560, hulls[1]) - 2; for (let a = 0; a < 44; a++) { const d = Math.round(7 * Math.sin(Math.PI * a / 43)); R(560 + a, y - d, 1, d, a % 5 ? N.l : N.d); P(560 + a, y - d, N.rimL); } }
  { const yat = i => Math.round(40 + 10 * Math.sin(Math.PI * i / 60)); for (let i = 0; i <= 60; i++) P(527 + i, yat(i), N.rope);
    for (let i = 8; i < 54; i += 11) { const col = ['#a86060', '#8a9ab0', '#c8b890', '#7a9a88'][(i / 11) & 3]; R(527 + i, yat(i) + 1, 6, 8, col); R(532 + i, yat(i) + 1, 1, 8, '#4a3438'); } }
  c.life = life; return c;
}

// ---------- the moving parts ----------
let LIFE = null;
export function bakeHarbourLife() {
  if (LIFE) return LIFE;
  const flags = FLAGS.map(([field, charge, cc]) => [0, 1, 2].map(f => { const [c, g] = canvas(12, 9);
    for (let a = 0; a < 11; a++) { const wave = Math.round(Math.sin(a * 0.7 - f * 2.1) * (a / 10) * 1.6); for (let b = 0; b < 7; b++) { let col = field;
        if (charge === 'skull' && ((a >= 4 && a <= 6 && b >= 1 && b <= 3) || (b === 5 && (a === 3 || a === 7)) || (b === 4 && a === 5))) col = cc;
        if (charge === 'cross' && (a === 4 || b === 3)) col = cc;
        if (charge === 'star' && ((a === 5 && b >= 1 && b <= 5) || (b === 3 && a >= 3 && a <= 7))) col = cc;
        if (charge === 'fish' && b === 3 && a >= 2 && a <= 8 || (charge === 'fish' && (a === 8 && (b === 2 || b === 4)))) col = cc;
        if (charge === 'bars' && (b === 1 || b === 5)) col = cc;
        if (charge === 'moon' && (Math.hypot(a - 5, b - 3) < 2.6 && Math.hypot(a - 6, b - 2.5) >= 2)) col = cc;
        px(g, a + 1, b + 1 + wave, a === 10 ? '#1a1216' : col); } }
    rect(g, 0, 0, 1, 9, '#2a1a1e'); return c; }));
  const flame = [0, 1, 2].map(f => { const [c, g] = canvas(9, 10); const hs = [[3, 6, 4], [5, 4, 6], [4, 7, 3]][f];
    hs.forEach((hh, i) => { const x = 1 + i * 3; for (let b = 0; b < hh; b++) { px(g, x, 9 - b, b < 2 ? '#ffd070' : b < hh - 1 ? '#f08a3a' : '#c8482a'); if (b < hh - 2) px(g, x + 1, 9 - b, b < 1 ? '#fff0b0' : '#ffb050'); } });
    return c; });
  const hen = [0, 1, 2].map(f => { const [c, g] = canvas(8, 8);   /* 0 walking, 1 walking (legs), 2 pecking */
    const body = f === 2 ? [[1, 4], [2, 3], [3, 3], [4, 3], [5, 4], [2, 4], [3, 4], [4, 4], [1, 5], [2, 5], [3, 5], [4, 5]] : [[1, 3], [2, 3], [3, 3], [4, 3], [1, 4], [2, 4], [3, 4], [4, 4], [2, 5], [3, 5], [4, 5]];
    for (const [a, b] of body) px(g, a, b, '#e8dcc8'); px(g, 1, 4 - (f === 2 ? 0 : 1), '#c8b8a0');
    if (f === 2) { px(g, 6, 6, '#e8dcc8'); px(g, 7, 7, '#e0a030'); px(g, 6, 5, '#c83a2a'); } else { px(g, 5, 2, '#e8dcc8'); px(g, 5, 1, '#c83a2a'); px(g, 6, 2, '#e0a030'); }
    px(g, 3, 6, '#b8862a'); px(g, 3 + (f === 1 ? 1 : 0), 7, '#b8862a'); return c; });
  const gull = [0, 1].map(f => { const [c, g] = canvas(7, 3); const pts = f ? [[0, 0], [1, 1], [2, 1], [3, 2], [4, 1], [5, 1], [6, 0]] : [[0, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 2]]; for (const [a, b] of pts) px(g, a, b, '#4a3a4c'); return c; });
  LIFE = { flags, flame, hen, gull }; return LIFE;
}
const h01 = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

/* LAY A LAYER, AND ITS LIFE ON IT. x on screen is the layer's own x less the scroll, tiled; y is baseY plus the layer's share of
   the camera's climb (dY * f). The life is drawn at the SAME offsets, so it never slides off the thing it belongs to. */
export function drawHarbourLayer(g, which, c, f, baseY, cx, dY, time, VW, VH) {
  const w = c.width; let x0 = ((-cx * f) % w + w) % w; if (x0 > 0) x0 -= w;
  const y0 = Math.round(baseY + dY * f); if (y0 > VH) return;
  for (let x = x0; x < VW; x += w) g.drawImage(c, Math.round(x), y0);
  const A = bakeHarbourLife(), lf = c.life || {};
  for (let ox = x0; ox < VW; ox += w) { const X = Math.round(ox);
    const on = (lx, pad) => X + lx > -pad && X + lx < VW + pad;
    for (const [lx, ly, ph] of (lf.gulls || [])) {   /* gulls going round over the port, each on its own circle */
      const t = time * 0.35 + ph, gx = X + lx + Math.round(Math.cos(t) * 22), gy = y0 + ly + Math.round(Math.sin(t) * 6);
      if (gx > -8 && gx < VW) { g.globalAlpha = 0.8; g.drawImage(A.gull[Math.floor(time * 3 + ph * 7) % 2], gx, gy); g.globalAlpha = 1; } }
    for (const [lx, ly, kind] of (lf.lights || [])) { if (!on(lx, 6)) continue;   /* a window in the town now and then going warmer, the light at the end of the mole turning */
      if (kind === 'beacon') { const k = 0.5 + 0.5 * Math.sin(time * 1.6); g.globalAlpha = 0.18 + 0.3 * k; g.fillStyle = '#fff0b0'; g.fillRect(X + lx - 4, y0 + ly - 1, 9, 3); g.fillRect(X + lx - 1, y0 + ly - 3, 3, 7); g.globalAlpha = 1; continue; }
      const k = Math.sin(time * (0.5 + h01(lx, ly)) + lx); if (k > 0.6) { g.globalAlpha = (k - 0.6) * 1.2; g.fillStyle = '#fff2b8'; g.fillRect(X + lx, y0 + ly, 1, 1); g.globalAlpha = 1; } }
    for (const [lx, ly] of (lf.lanterns || [])) { if (!on(lx, 6)) continue;   /* each lantern breathing on its own clock */
      const k = 0.5 + 0.5 * Math.sin(time * (1.3 + h01(lx, ly) * 1.5) + lx * 0.37);
      g.globalAlpha = 0.14 + 0.1 * k; g.fillStyle = '#ffc060'; g.fillRect(X + lx - 2, y0 + ly - 1, 5, 3); g.fillRect(X + lx - 1, y0 + ly - 2, 3, 5);
      g.globalAlpha = 0.7 + 0.3 * k; g.fillStyle = '#ffe0a0'; g.fillRect(X + lx, y0 + ly, 1, 1); g.globalAlpha = 1; }
    for (const [lx, ly, fi] of (lf.flags || [])) { if (!on(lx, 14)) continue;
      g.drawImage(A.flags[fi % A.flags.length][Math.floor(time * 5 + h01(lx, fi) * 3) % 3], X + lx, y0 + ly); }
    for (const [lx, ly] of (lf.smoke || [])) { if (!on(lx, 30)) continue;   /* the cook smoke going up and leaning off with the air */
      for (let k = 0; k < 5; k++) { const t = (time * 0.22 + k / 5 + h01(lx, k)) % 1, sx = X + lx + Math.round(t * t * 16 + Math.sin(time + k) * 1.5), sy = y0 + ly - Math.round(t * 30), r = 1 + Math.round(t * 3);
        g.globalAlpha = 0.26 * (1 - t); g.fillStyle = '#b8a0a8'; g.fillRect(sx - r, sy - r, r * 2 + 1, r * 2 + 1); } g.globalAlpha = 1; }
    for (const [lx, ly] of (lf.fires || [])) { if (!on(lx, 12)) continue;
      g.drawImage(A.flame[Math.floor(time * 9 + h01(lx, ly) * 3) % 3], X + lx, y0 + ly - 5);
      g.globalAlpha = 0.1 + 0.05 * Math.sin(time * 11 + lx); g.fillStyle = '#ffa050'; g.fillRect(X + lx - 5, y0 + ly - 12, 19, 16); g.globalAlpha = 1; }
    for (const [lx, ly, span] of (lf.hens || [])) { if (!on(lx, span + 10)) continue;   /* a hen goes up the deck, stops, pecks, comes back */
      const per = 7 + h01(lx, span) * 4, t = ((time + h01(span, lx) * per) % per) / per, walk = t < 0.35 ? t / 0.35 : t < 0.5 ? 1 : t < 0.85 ? 1 - (t - 0.5) / 0.35 : 0;
      const face = t < 0.35 || t >= 0.85 ? 1 : -1, pecking = (t >= 0.35 && t < 0.5) || t >= 0.85, fr = pecking ? (Math.floor(time * 4) % 2 ? 2 : 0) : Math.floor(time * 8) % 2;
      const hx = X + lx + Math.round(walk * span), hy = y0 + ly - 8;
      if (face > 0) g.drawImage(A.hen[fr], hx, hy); else { g.save(); g.translate(hx + 8, hy); g.scale(-1, 1); g.drawImage(A.hen[fr], 0, 0); g.restore(); } }
  }
}
