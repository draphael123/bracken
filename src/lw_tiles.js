// lw_tiles.js — THE LONG WATER: tiles and parallax for the coast arc. Waterfalls on the mountain's back
// face, down the river valley, to SALTREACH, the whitewashed fishing town at the river mouth. Warm
// late-afternoon light from the right (the sea side). The sea is creeping inland: barnacles and salt
// crust the dark stone. Same conventions as art.js: 16x16 tiles, crisp px.js primitives only (no AA),
// every bake seeded through mulberry() so it comes out the same every time.
import { canvas, px, rect, line, circle, ellipse, fillPoly, mulberry } from './px.js';

const T = 16;
const SEA = ['#1f5a6a', '#2e7a88', '#4aa0a8', '#7cc8c8'], FOAM = '#e8f4f0';
const SAND = ['#e8d8a8', '#d0bc88', '#a88f5e'];
// wet dark rock: body, mid, light, the lit tops; plus the strata's crack, a second band tone, a deep shade and the band lip
const RK = { d: '#3e454e', m: '#555e68', l: '#6f7a84', top: '#8a96a0', band: '#49515b', crack: '#262b32', deep: '#32383f', lip: '#5a636d' };
const SALT = ['#d8d0c0', '#b0a898'];
const THRIFT = '#e890b0', THRIFT_L = '#f6c2d4', THRIFT_D = '#b0607e';
const GRASS = ['#7a9a5a', '#5a7a44'], GRASS_L = '#9ab86c', GRASS_D = '#3e5a34';
const DRIFT = ['#9a8a74', '#6e604e'], DRIFT_L = '#c4b69c', DRIFT_D = '#4a4034';
const WHITE = '#f0ece0', SLATE = '#4a5664';

// ---------- tiles ----------

// The stone body every solid tile shares: beds of rock split by two seams, at rows 5 and 12. The seams are
// pinned at both tile edges so a cliff's beds line up from tile to tile; between the edges each bows smoothly
// up or down, so a long wall reads as strata, not masonry. The bed between the seams is a paler stone.
// Each seam is a crack with the shaded underside of the bed above and the lit top of the bed below.
function rockBody(g, rnd) {
  const seams = [5, 12].map(s => { const A = (rnd() - 0.5) * 3.2; return Array.from({ length: T }, (_, x) => s + Math.round(A * Math.sin(Math.PI * (x + 0.5) / T))); });
  const inBed = (x, y) => y > seams[0][x] && y < seams[1][x];
  for (let x = 0; x < T; x++) for (let y = 0; y < T; y++) px(g, x, y, inBed(x, y) ? RK.band : RK.d);
  // grain: short streaks along the bedding
  for (let i = 0; i < 7; i++) {
    const x = (rnd() * (T - 2)) | 0, y = (rnd() * T) | 0, n = 2 + ((rnd() * 3) | 0);
    rect(g, x, y, n, 1, rnd() < 0.5 ? RK.deep : (inBed(x, y) ? '#525a64' : '#464d57'));
  }
  // pits: a dark hole with a lit lower lip
  for (let i = 0; i < 2; i++) { const x = 1 + ((rnd() * 13) | 0), y = 1 + ((rnd() * 13) | 0); px(g, x, y, RK.crack); px(g, x + 1, y + 1, RK.lip); }
  for (const sm of seams) {
    let lit = rnd() < 0.85;
    for (let x = 0; x < T; x++) {
      const y = sm[x];
      px(g, x, y, RK.crack);
      if (rnd() < 0.3) px(g, x, y - 1, RK.deep);
      if (rnd() < 0.15) lit = !lit;
      if (lit) px(g, x, y + 1, rnd() < 0.12 ? RK.l : RK.lip);
    }
  }
  // now and then a fracture running down from the upper seam
  if (rnd() < 0.3) {
    let x = 3 + ((rnd() * 10) | 0), y = seams[0][x] + 1; const dir = rnd() < 0.5 ? -1 : 1;
    for (let k = 0; k < 4 && y < T; k++) { px(g, x, y, RK.crack); px(g, x + 1, y, RK.lip); y++; if (k & 1) x += dir; }
  }
  return seams;
}

// One or two barnacles: a pale cone, its shaded side, the dark shadow under it.
function barnacles(g, rnd, x, y, dir = 1) {
  const n = 1 + (rnd() < 0.6 ? 1 : 0);
  for (let i = 0; i < n; i++) { const bx = x + dir * i * 2, by = y + ((rnd() * 2) | 0); px(g, bx, by, SALT[0]); px(g, bx + dir, by, SALT[1]); px(g, bx, by + 1, RK.deep); }
}

// The open side of a solid tile: a cliff face. Every bed of stone ends in its own ledge: the rim is notched at
// each seam and each bed's top is lit where it juts out. The sun is on the right, so right-hand faces (dir -1)
// take the light and left-hand faces sit in shadow. Now and then a barnacle or a streak of dried brine.
function face(g, rnd, seams, x0, dir, y0) {
  const x1 = x0 + dir, lit = dir < 0;
  for (let y = y0; y < T; y++) { px(g, x0, y, lit ? RK.m : RK.crack); if (lit && ((y & 1) === 0)) px(g, x1, y, RK.lip); }
  for (const sm of seams) {
    const y = sm[x0];
    if (y >= y0) { g.clearRect(x0, y, 1, 1); px(g, x1, y, RK.crack); }
    if (y + 1 >= y0 && y + 1 < T) { px(g, x0, y + 1, lit ? RK.top : RK.l); px(g, x1, y + 1, lit ? RK.l : RK.m); }
    if (y - 1 >= y0) px(g, x0, y - 1, RK.crack);
  }
  if (rnd() < 0.55) barnacles(g, rnd, x0 + dir, Math.min(T - 3, y0 + 1 + ((rnd() * 7) | 0)), dir);
  else if (rnd() < 0.5) {
    const sx = x0 + dir * (2 + ((rnd() * 2) | 0)), sy = y0 + ((rnd() * Math.max(1, T - y0 - 5)) | 0), n = 3 + ((rnd() * 3) | 0);
    px(g, sx, sy, SALT[0]); for (let i = 1; i < n && sy + i < T; i++) px(g, sx, sy + i, SALT[1]);
  }
}

// Surface of solid ground: the dark stone under a crust of sand and sea grass, thrift in the grass, the odd
// shell; where the crust ends, its shadow and a barnacle or two on the stone. An open side has its corner worn
// round, the crust spilling over the shoulder and trickling down, and a cliff face below.
function shoreTop(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  const seams = rockBody(g, rnd);
  // crust depth per column: 3 at the tile edges so neighbours meet, 2..5 between
  const cd = new Array(T).fill(3);
  const nb = 1 + (rnd() < 0.6 ? 1 : 0);
  for (let k = 0; k < nb; k++) {
    const cx = 3 + rnd() * 10, r = 2.5 + rnd() * 3, amp = rnd() < 0.7 ? 2 : -1;
    for (let x = 1; x < T - 1; x++) { const d = (x + 0.5 - cx) / r; if (Math.abs(d) < 1) cd[x] = Math.max(2, Math.min(5, cd[x] + Math.round(amp * (1 - d * d)))); }
  }
  // sea grass spans; the rest is sand
  const grass = new Array(T).fill(false);
  const ng = rnd() < 0.75 ? 1 + (rnd() < 0.35 ? 1 : 0) : 0;
  for (let k = 0; k < ng; k++) { const gx = (rnd() * 12) | 0, gw = 4 + ((rnd() * 5) | 0); for (let x = gx; x < Math.min(T, gx + gw); x++) grass[x] = true; }
  for (let x = 0; x < T; x++) {
    const d = cd[x];
    for (let y = 0; y < d; y++) {
      let col;
      if (grass[x]) col = y === 0 ? (rnd() < 0.45 ? GRASS_L : GRASS[0]) : y === d - 1 ? GRASS_D : (((x + y) & 1) ? GRASS[1] : GRASS[0]);
      else col = y === 0 ? (rnd() < 0.15 ? '#f4e8c0' : SAND[0]) : y === d - 1 ? SAND[2] : (rnd() < 0.12 ? SAND[0] : rnd() < 0.1 ? SAND[2] : SAND[1]);
      px(g, x, y, col);
    }
    px(g, x, d, RK.crack);
    if ((x + d) & 1) px(g, x, d + 1, RK.deep);
    if (grass[x] && rnd() < 0.3) { px(g, x, d, GRASS_D); if (rnd() < 0.5) px(g, x, d + 1, GRASS_D); }
  }
  // thrift cushions in the grass, a shell in the sand
  for (let x = 1; x < T - 3; x++) if (grass[x] && grass[x + 2] && rnd() < 0.14) { px(g, x + 1, 0, THRIFT_L); px(g, x + 2, 0, THRIFT); px(g, x, 1, THRIFT_D); px(g, x + 1, 1, THRIFT); px(g, x + 2, 1, THRIFT); px(g, x + 3, 1, THRIFT_D); x += 4; }
  if (rnd() < 0.3) { const x = 2 + ((rnd() * 11) | 0); if (!grass[x] && !grass[x + 1]) { px(g, x, 1, WHITE); px(g, x + 1, 1, SALT[0]); px(g, x, 2, SALT[1]); } }
  if (rnd() < 0.4) { const x = 2 + ((rnd() * 11) | 0); barnacles(g, rnd, x, cd[x] + 2, 1); }
  const side = (x0, dir) => {
    g.clearRect(x0, 0, 1, 1);
    const deep = 4 + ((rnd() * 3) | 0), lit = dir < 0;
    for (let y = 1; y <= deep; y++) {
      const wd = y < 3 ? 2 : y < deep - 1 ? 1 : (rnd() < 0.5 ? 1 : 0);
      for (let i = 0; i < wd; i++) {
        const x = x0 + i * dir, gr = grass[x0 + dir];
        px(g, x, y, gr ? (i === 0 ? (lit ? GRASS_L : GRASS[1]) : GRASS[0]) : (i === 0 ? (lit ? SAND[0] : SAND[2]) : SAND[1]));
      }
    }
    face(g, rnd, seams, x0, dir, deep + 1);
  };
  if (eL) side(0, 1);
  if (eR) side(T - 1, -1);
  return c;
}

// Below the surface with an open side: a cliff face of bedded stone.
function shoreEdge(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  const seams = rockBody(g, rnd);
  if (eL) face(g, rnd, seams, 0, 1, 0);
  if (eR) face(g, rnd, seams, T - 1, -1, 0);
  return c;
}

// Deep interior: the same beds a shade darker, salt crystallised along the cracks, a pebble set in the stone.
function shoreFill(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  const seams = rockBody(g, rnd);
  for (let i = 0; i < 18; i++) { const x = (rnd() * T) | 0, y = (rnd() * T) | 0; if ((x + y) & 1) px(g, x, y, RK.deep); }
  if (rnd() < 0.6) { const sm = seams[(rnd() * 2) | 0], a = 1 + ((rnd() * 10) | 0), n = 2 + ((rnd() * 4) | 0); for (let x = a; x < Math.min(T - 1, a + n); x++) px(g, x, sm[x], x === a ? SALT[0] : SALT[1]); }
  if (rnd() < 0.25) { const x = 2 + ((rnd() * 10) | 0), y = 1 + ((rnd() * 12) | 0); px(g, x + 1, y, '#5c6570'); rect(g, x, y + 1, 3, 1, '#4c545e'); px(g, x + 2, y, RK.l); px(g, x + 1, y + 2, RK.crack); }
  return c;
}

// Under shallow water: rippled wet sand with a shell or two. The ripple is the same in every variant so a
// pool floor runs seamlessly; only the shells and grains change.
function shoreSilt(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, SAND[1]);
  for (let i = 0; i < 22; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? '#bca676' : '#dcca98');
  for (let r = 0; r < 4; r++) {
    const yb = 3 + r * 4;
    for (let x = 0; x < T; x++) {
      const y = yb + Math.round(Math.sin((x / T) * Math.PI * 2 + r * 1.9));
      if (y < T) px(g, x, y, SAND[2]);
      if (y - 1 >= 0) px(g, x, y - 1, SAND[0]);
    }
  }
  rect(g, 0, 0, T, 1, SAND[2]);
  if (rnd() < 0.7) {
    const x = 1 + ((rnd() * 11) | 0), y = 3 + ((rnd() * 9) | 0), pink = rnd() < 0.4;
    px(g, x + 1, y, WHITE); px(g, x, y + 1, pink ? '#f0c0cc' : SALT[0]); px(g, x + 1, y + 1, WHITE); px(g, x + 2, y + 1, pink ? '#f0c0cc' : SALT[0]); px(g, x + 1, y + 2, SALT[1]);
  }
  if (rnd() < 0.4) { const x = 2 + ((rnd() * 11) | 0), y = 4 + ((rnd() * 10) | 0); px(g, x, y, RK.m); px(g, x + 1, y, RK.l); px(g, x, y + 1, RK.d); }
  if (rnd() < 0.3) { const x = 2 + ((rnd() * 11) | 0), y = 6 + ((rnd() * 8) | 0); px(g, x, y, GRASS[1]); px(g, x + 1, y - 1, GRASS[1]); px(g, x + 2, y - 1, GRASS_D); }
  return c;
}

// A one-way jetty: a sun-bleached driftwood board on top (rows 0-4, the bit you stand on), the stringer under
// it, and below that the tops of the posts, lashed with rope, crusted with barnacles, worn off ragged. end 'L'/'R'
// are the end pieces (a post under each); the middle variants have a post at x 6, none (a coil of rope), x 10.
function jetty(seed, end, v = 0) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  const x0 = end === 'L' ? 1 : 0, x1 = end === 'R' ? T - 1 : T, w = x1 - x0;
  const sx0 = end === 'L' ? 2 : 0, sx1 = end === 'R' ? T - 2 : T;
  rect(g, sx0, 5, sx1 - sx0, 2, DRIFT[1]); rect(g, sx0, 7, sx1 - sx0, 1, DRIFT_D);
  for (let i = 0; i < 3; i++) px(g, sx0 + ((rnd() * (sx1 - sx0)) | 0), 5, '#7e705c');
  const posts = end === 'L' ? [2] : end === 'R' ? [11] : v === 0 ? [6] : v === 2 ? [10] : [];
  for (const p of posts) {
    rect(g, p, 5, 3, 8, DRIFT[1]); rect(g, p, 5, 1, 8, DRIFT_D); rect(g, p + 2, 5, 1, 8, DRIFT[0]);
    px(g, p + 1, 10, DRIFT_D);
    // a ragged, sea-worn end
    px(g, p, 12, DRIFT_D); px(g, p + 1, 13, DRIFT[1]); px(g, p + 2, 13, DRIFT_D);
    // a band of rope lashed round where the post meets the stringer
    rect(g, p, 6, 3, 2, SALT[1]); px(g, p + 2, 6, SALT[0]); px(g, p + 1, 7, SALT[0]); px(g, p, 8, SALT[1]);
    if (rnd() < 0.7) { px(g, p + (rnd() < 0.5 ? 0 : 2), 11, SALT[0]); px(g, p + 1, 11, SALT[1]); }
    if (rnd() < 0.5) px(g, p + 1, 12, GRASS[1]);
  }
  // no post: a coil of spare rope hung off the stringer
  if (!end && v === 1) {
    for (let x = 5; x <= 10; x++) { const y = 7 + Math.round(2.5 * Math.sin(Math.PI * (x - 5) / 5)); px(g, x, y, SALT[1]); if (x > 5 && x < 10) px(g, x, y - 1, (x & 1) ? SALT[0] : SALT[1]); }
    px(g, 8, 11, SALT[1]); px(g, 8, 12, SALT[0]);
  }
  // the board
  rect(g, x0, 0, w, 5, DRIFT[0]); rect(g, x0, 0, w, 1, DRIFT_L); rect(g, x0, 4, w, 1, DRIFT[1]);
  for (let i = 0; i < 4; i++) rect(g, x0 + ((rnd() * (w - 3)) | 0), 1 + ((rnd() * 3) | 0), 2 + ((rnd() * 4) | 0), 1, '#86775f');
  for (let i = 0; i < 3; i++) px(g, x0 + ((rnd() * w) | 0), 0, '#d8ccb4');
  if (rnd() < 0.5) { const kx = x0 + 2 + ((rnd() * (w - 5)) | 0); px(g, kx, 2, DRIFT[1]); px(g, kx + 1, 2, DRIFT_D); px(g, kx + 1, 3, DRIFT[1]); }
  if (!end && rnd() < 0.5) { const j = 3 + ((rnd() * 10) | 0); rect(g, j, 1, 1, 4, DRIFT_D); px(g, j + 1, 1, DRIFT_L); }
  for (const p of posts) px(g, p + 1, 2, RK.d);
  // the tide line: salt dried along the lower edge
  for (let x = x0; x < x1; x++) if (rnd() < 0.25) px(g, x, 4, SALT[1]);
  if (end === 'L') { g.clearRect(1, 0, 1, 1); g.clearRect(1, 4, 1, 1); rect(g, 1, 1, 1, 3, DRIFT_D); px(g, 2, 0, DRIFT_L); }
  if (end === 'R') { g.clearRect(T - 2, 0, 1, 1); g.clearRect(T - 2, 4, 1, 1); rect(g, T - 2, 1, 1, 3, DRIFT_D); px(g, T - 3, 0, '#d8ccb4'); }
  return c;
}

// The waterfall section's flat tops: the same stone slick and dark with a film of water and moss, no sand.
function wetTop(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rockBody(g, rnd);
  for (let y = 2; y < 8; y++) for (let x = 0; x < T; x++) if (((x + y) & 1) && rnd() < 0.8 - y * 0.1) px(g, x, y, RK.deep);
  for (let x = 0; x < T; x++) { px(g, x, 0, RK.m); px(g, x, 1, RK.d); px(g, x, 2, (x & 1) ? RK.crack : RK.d); }
  // the film of water on the crown catches the sky
  let x = (rnd() * 4) | 0;
  while (x < T) {
    const n = 2 + ((rnd() * 4) | 0);
    for (let i = 0; i < n && x + i < T; i++) { px(g, x + i, 0, i === 1 ? FOAM : SEA[3]); if (rnd() < 0.5) px(g, x + i, 1, RK.l); }
    x += n + 2 + ((rnd() * 4) | 0);
  }
  // moss clumps with strands hanging over the lip, a drip at the end of some
  const nm = 1 + (rnd() < 0.6 ? 1 : 0);
  for (let k = 0; k < nm; k++) {
    const mx = (rnd() * 12) | 0, mw = 3 + ((rnd() * 4) | 0);
    for (let i = 0; i < mw && mx + i < T; i++) {
      const xx = mx + i;
      px(g, xx, 0, rnd() < 0.35 ? GRASS[0] : GRASS[1]); px(g, xx, 1, GRASS[1]); px(g, xx, 2, (xx & 1) ? GRASS_D : GRASS[1]);
      if (rnd() < 0.45) { const L = 1 + ((rnd() * 4) | 0); for (let j = 0; j < L; j++) px(g, xx, 3 + j, GRASS_D); if (rnd() < 0.5) px(g, xx, 3 + L, SEA[3]); }
    }
  }
  return c;
}

export function bakeShoreTiles() {
  const top = {}, edge = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) {
    const k = eL + '' + eR;
    top[k] = [0, 1, 2, 3].map(i => shoreTop(2100 + i + eL * 7 + eR * 13, eL, eR));
    if (eL || eR) edge[k] = [0, 1].map(i => shoreEdge(2200 + i + eL * 3 + eR * 5, eL, eR));
  }
  return {
    top, edge,
    fill: [0, 1, 2, 3].map(i => shoreFill(2300 + i)),
    silt: [0, 1, 2].map(i => shoreSilt(2400 + i)),
    ledge: [0, 1, 2].map(i => jetty(2500 + i, null, i)), ledgeL: jetty(2510, 'L'), ledgeR: jetty(2511, 'R'),
    wet: [0, 1, 2].map(i => wetTop(2600 + i)),
  };
}

// ---------- the waterfall column ----------
// 3 frames, 24 x h. The falling body is a 24px-periodic pattern: each frame moves every streak down 8px (fast
// columns 16px), so frames 0>1>2>0 loop without a jump, and if h is a multiple of 24 the body tiles vertically
// (the mist is only on the bottom 8 rows). Rims are see-through and breathe as the water falls.
export function bakeWaterfall(h) {
  const W = 24, PER = 24, rnd = mulberry(4040);
  const cols = [];
  for (let x = 0; x < W; x++) {
    const edge = Math.min(x, W - 1 - x);
    const base = edge === 0 ? null : edge === 1 ? 'rgba(124,200,200,0.55)' : edge < 4 ? SEA[3] : edge < 7 ? '#a8dcd8' : '#c6ebe5';
    const pat = new Array(PER).fill(base);
    if (edge <= 1) {
      // the rim: runs of spray and gaps
      for (let k = 0; k < PER; k++) if (rnd() < (edge === 0 ? 0.35 : 0.2)) pat[k] = edge === 0 ? 'rgba(232,244,240,0.4)' : null;
    } else {
      const ns = edge < 4 ? 1 : 2;
      for (let s = 0; s < ns; s++) {
        const k0 = (rnd() * PER) | 0, n = 3 + ((rnd() * 7) | 0), col = edge < 4 ? SEA[2] : (rnd() < 0.65 ? FOAM : '#ffffff');
        for (let i = 0; i < n; i++) pat[(k0 + i) % PER] = col;
      }
      if (edge >= 4 && rnd() < 0.5) { const k0 = (rnd() * PER) | 0; pat[k0] = SEA[3]; pat[(k0 + 1) % PER] = SEA[3]; }
    }
    cols.push({ pat, sp: rnd() < 0.5 ? 1 : 2 });
  }
  return [0, 1, 2].map(f => {
    const [c, g] = canvas(W, h);
    for (let x = 0; x < W; x++) {
      const cl = cols[x];
      for (let y = 0; y < h; y++) { const col = cl.pat[(((y - f * 8 * cl.sp) % PER) + PER) % PER]; if (col) px(g, x, y, col); }
    }
    // mist boiling up where it lands
    const my = h - 8;
    for (let y = Math.max(0, my); y < h; y++) for (let x = 0; x < W; x++) {
      const t = (y - my) / 8, k = ((x * 5 + y * 3 + f * 7) % 9);
      if (k < 4 - t * 2) px(g, x, y, t < 0.6 ? 'rgba(240,248,246,0.75)' : 'rgba(232,244,240,0.45)');
    }
    for (let i = 0; i < 3; i++) {
      const cx = 4 + ((f * 7 + i * 8) % 17), cy = h - 5 + ((i + f) % 3) - 1;
      ellipse(g, cx, cy, 3.5 + (i & 1), 2.5, 'rgba(244,250,248,0.8)', 'rgba(232,244,240,0.35)');
    }
    return c;
  });
}

// ---------- background layers ----------

// Late afternoon over the sea: cornflower up top, a lavender band, rose, then peach and a warm cream at the
// horizon. Stepped bands, like the other skies.
export function bakeSkySea(h) {
  const [c, g] = canvas(1, h);
  const st = [[0, [106, 138, 184]], [0.28, [156, 154, 192]], [0.5, [214, 170, 160]], [0.64, [232, 184, 144]], [0.78, [248, 220, 176]], [1, [252, 232, 196]]];
  for (let y = 0; y < h; y++) {
    const q = Math.round((y / Math.max(1, h - 1)) * 11) / 11;
    let i = 0; while (i < st.length - 2 && q > st[i + 1][0]) i++;
    const [t0, a] = st[i], [t1, b] = st[i + 1], k = Math.min(1, Math.max(0, (q - t0) / (t1 - t0)));
    px(g, 0, y, 'rgb(' + ((a[0] + (b[0] - a[0]) * k) | 0) + ',' + ((a[1] + (b[1] - a[1]) * k) | 0) + ',' + ((a[2] + (b[2] - a[2]) * k) | 0) + ')');
  }
  return c;
}

// Horizontal bands of colour from row y0 to y1 across the width; at each change of band one row is
// checkered and the next is lightly peppered, so the sea deepens in 16-bit steps rather than a smear.
function bands(g, w, y0, y1, cols, cuts) {
  const n = y1 - y0, at = r => { const t = r / n; let i = 0; while (i < cuts.length && t >= cuts[i]) i++; return i; };
  for (let r = 0; r < n; r++) {
    const i = at(r), j = at(r + 1), p = r > 0 ? at(r - 1) : i, y = y0 + r;
    if (j !== i) { for (let x = 0; x < w; x++) px(g, x, y, ((x + y) & 1) ? cols[j] : cols[i]); }
    else { rect(g, 0, y, w, 1, cols[i]); if (p !== i) for (let x = 0; x < w; x++) if (((x + 2 * y) & 3) === 0) px(g, x, y, cols[p]); }
  }
}
// A distant gull: 'M' gliding or 'V' with the wings up.
function gull(g, w, x, y, up, col) {
  const pts = up ? [[0, 0], [1, 1], [2, 1], [3, 1], [4, 0]] : [[0, 1], [1, 0], [2, 1], [3, 0], [4, 1]];
  for (const [a, b] of pts) px(g, (((x + a) % w) + w) % w, y + b, col);
}

// The far distance: the open sea under the horizon, islands in the haze (a lighthouse on the big one), a sail,
// gulls. Transparent above the islands. Horizon row = round(h * 0.51) (46 for h = 90). Tiles horizontally.
export function bakeFarSea(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const H0 = Math.round(h * 0.51), D = h - H0;
  bands(g, w, H0, h, ['#b4dcd4', SEA[3], SEA[2], SEA[1], SEA[0]], [2 / D, 0.3, 0.64, 0.9]);
  // swell: dashes a step lighter than the water they sit on, longer and sparser toward us
  const lighter = y => { const t = (y - H0) / D; return t < 0.3 ? '#a8dcd8' : t < 0.64 ? SEA[3] : t < 0.9 ? SEA[2] : SEA[1]; };
  const darker = y => { const t = (y - H0) / D; return t < 0.3 ? SEA[2] : t < 0.64 ? SEA[1] : SEA[0]; };
  for (let y = H0 + 3; y < h; y++) {
    const r = y - H0, n = Math.round(w / (9 + r * 0.35));
    for (let i = 0; i < n; i++) {
      const x = (rnd() * w) | 0, len = 1 + ((r / 9) | 0) + (rnd() < 0.3 ? 1 : 0);
      for (let k = 0; k < len; k++) px(g, (x + k) % w, y, lighter(y));
      if (r > 8 && rnd() < 0.5) for (let k = 0; k < len; k++) px(g, (x + k + 1) % w, y + 1, darker(y + 1));
    }
  }
  // the sun's glitter path, off to the right
  const gx = w * 0.66 + (rnd() - 0.5) * 16;
  for (let y = H0 + 1; y < h; y++) {
    const r = y - H0, spread = 3 + r * 0.8;
    for (let k = 0; k < 3; k++) {
      if (rnd() > 0.75 - (r / D) * 0.45) continue;
      const x = Math.round(gx + (rnd() + rnd() + rnd() - 1.5) * spread * 1.3), len = 1 + ((rnd() * (1 + r / 12)) | 0);
      for (let i = 0; i < len; i++) px(g, (((x + i) % w) + w) % w, y, r < D * 0.35 ? '#fff0d4' : '#f8dcb0');
    }
  }
  // islands in the haze, lit on their seaward (right) slopes
  const isles = [{ x: w * 0.08, wd: 44, ht: 8 }, { x: w * 0.4, wd: 76, ht: 15, light: true }, { x: w * 0.8, wd: 26, ht: 5 }];
  const topY = new Array(w).fill(H0);
  for (const s of isles) {
    s.x = Math.round(s.x + (rnd() - 0.5) * 12); const ph = rnd() * 6;
    for (let i = 0; i < s.wd; i++) {
      const u = (i + 0.5) / s.wd, hh = s.ht * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.7) * (1 + 0.16 * Math.sin(u * 9 + ph));
      const x = (((s.x + i) % w) + w) % w; topY[x] = Math.min(topY[x], H0 - Math.round(hh));
    }
  }
  for (let x = 0; x < w; x++) {
    const y0 = topY[x]; if (y0 >= H0) continue;
    const yl = topY[(x - 1 + w) % w], yr = topY[(x + 1) % w];
    for (let y = y0; y < H0; y++) {
      let col = '#b6a9b6';
      if (y === y0) col = yr > y0 || yr === y0 ? '#d4c0b8' : '#c4b4b8';
      else if (yr > y && y < y0 + 3) col = '#ccbab6';
      else if (yl > y0 && ((x + y) & 1)) col = '#a697a8';
      if (y === H0 - 1) col = '#9e98a8';
      px(g, x, y, col);
    }
    if ((x & 1) === 0) px(g, x, H0, '#a2c6c6');
    if ((x & 3) === 1 && H0 - y0 > 4) px(g, x, H0 + 1, '#a2c6c6');
  }
  // the lighthouse on the big island, and the keeper's cottage
  const big = isles[1]; let lx = big.x, best = H0;
  for (let i = 0; i < big.wd; i++) { const x = (((big.x + i) % w) + w) % w; if (topY[x] < best) { best = topY[x]; lx = x; } }
  const ty = topY[lx];
  rect(g, lx, ty - 7, 2, 8, WHITE); rect(g, lx + 1, ty - 6, 1, 7, '#d6ccc6'); rect(g, lx, ty - 4, 2, 1, '#c86a6a');
  px(g, lx, ty - 8, '#fff0b8'); px(g, lx + 1, ty - 8, '#ffd27a'); rect(g, lx, ty - 9, 2, 1, SLATE);
  const cy = topY[(lx + 5) % w];
  rect(g, lx + 3, cy - 2, 4, 3, WHITE); rect(g, lx + 6, cy - 2, 1, 3, '#d6ccc6'); rect(g, lx + 3, cy - 3, 4, 1, SLATE);
  // a fishing boat under sail
  const bx = Math.round(w * 0.24 + rnd() * 20), by = H0 + 5;
  rect(g, bx, by, 5, 1, SLATE); px(g, bx + 1, by + 1, '#3a4450'); px(g, bx + 3, by + 1, '#3a4450');
  fillPoly(g, [[bx + 2, by - 5], [bx + 2, by], [bx + 5, by]], '#f6e6cc'); px(g, bx + 2, by - 5, DRIFT[1]);
  for (let k = 0; k < 4; k++) px(g, bx + k, by + 2, '#a2c6c6');
  // gulls
  for (let i = 0; i < 4; i++) gull(g, w, (rnd() * w) | 0, 6 + ((rnd() * (H0 - 26)) | 0), rnd() < 0.5, '#5e6678');
  return c;
}

// The mid distance: headlands with thin waterfalls pouring off their cliffs, sea stacks and an arch, the river
// mouth with SALTREACH on its slope, and up the valley the mountain the Long Water comes down from. Hazy and cool.
// Laid out for 480 wide (scales with w); waterline at round(h * 0.77) (108 for h = 140), the nearer sea painted
// below it so the layer holds up even when the far layer is switched off. Transparent above. Tiles horizontally.
export function bakeMidCoast(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const W = Math.round(h * 0.77), S = w / 480;
  const M = { rock: '#828698', rockD: '#6e7286', rockL: '#9a9cac', lit: '#b8a8a6', litL: '#ccb8aa', shade: '#6c6e84', wet: '#5e6676', grass: '#7e9478', grassL: '#a0ac84', grassD: '#687c68', far: '#a69eb2', farL: '#c2b0b4', farD: '#978fa6', sand: '#d8c8a4', sandD: '#c0ac88', fall: '#dcecea', fallD: '#b4d6d6', white: '#ece6da', whiteD: '#cfc8c0', roof: '#646e7e', roofL: '#7e8898' };
  const wrap = x => ((Math.round(x) % w) + w) % w;
  const hsh = (x, y) => { let n = (x * 374761393 + y * 668265263) ^ seed; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  // the nearer sea
  bands(g, w, W, h, [SEA[3], SEA[2], SEA[1], SEA[0]], [0.08, 0.4, 0.82]);
  for (let y = W + 2; y < h; y++) {
    const r = y - W, n = Math.round(w / (14 + r * 0.4));
    for (let i = 0; i < n; i++) { const x = (rnd() * w) | 0, len = 2 + ((r / 7) | 0) + (rnd() < 0.3 ? 1 : 0), col = r < 12 ? SEA[3] : r < 24 ? SEA[2] : SEA[1]; for (let k = 0; k < len; k++) px(g, (x + k) % w, y, col); }
  }
  // the mountain up the valley, where the Long Water comes down: far off, a main peak with shoulders either
  // side, lit on its seaward face, a thread of falls down it
  const mx = 258 * S, mtn = new Array(w).fill(W);
  const peak = (xc, hw, ht, x) => { const d = Math.abs(x - xc) / hw; return d < 1 ? ht * Math.pow(1 - d, 1.2) : 0; };
  for (let x = 0; x < w; x++) for (const dx of [-w, 0, w]) {
    const xx = x - dx, hh = Math.max(peak(mx, 56 * S, 72, xx), peak(mx + 26 * S, 36 * S, 50, xx), peak(mx - 30 * S, 32 * S, 40, xx));
    if (hh > 0) mtn[x] = Math.min(mtn[x], W - Math.round(hh + (3 * Math.sin(xx * 0.29) + 1.5 * Math.sin(xx * 0.83)) * Math.min(1, hh / 20)));
  }
  for (let x = 0; x < w; x++) {
    const y0 = mtn[x]; if (y0 >= W) continue;
    const east = mtn[(x + 2) % w] > y0, west = mtn[(x - 2 + w) % w] > y0;
    for (let y = y0; y < W; y++) {
      let col = M.far;
      if (y === y0) col = east ? M.farL : '#b4a8b6';
      else if (east && y < y0 + 6) col = ((x + y) & 1) || y < y0 + 3 ? M.farL : M.far;
      else if (west && y < y0 + 12 && ((x + y) & 1)) col = M.farD;
      px(g, x, y, col);
    }
  }
  for (let y = W - 56, x = mx + 4 * S; y < W - 22; y++) { if (y >= mtn[wrap(x)] + 2) px(g, wrap(x), y, (y & 3) ? '#d6e4e6' : '#f0f6f4'); if ((y & 7) === 0) x += 1; }
  // the land: a headland, two stacks, the valley's west side, the town's headland, a sea arch
  const sm = t => t * t * (3 - 2 * t);
  const prof = (m, x) => { if (x < m.x0 || x > m.x1) return 0; const k = x < m.xl ? sm((x - m.x0) / (m.xl - m.x0)) : x > m.xr ? sm((m.x1 - x) / (m.x1 - m.xr)) : 1; return m.top * k; };
  const masses = [[8, 70, 124, 146, 70], [163, 166, 173, 177, 38], [187, 189, 192, 195, 22], [198, 222, 232, 254, 34], [260, 350, 412, 436, 62], [440, 443, 457, 461, 26]].map(m => ({ x0: m[0] * S, xl: m[1] * S, xr: m[2] * S, x1: m[3] * S, top: m[4] }));
  const top = new Array(w).fill(W), ph = [rnd() * 6, rnd() * 6, rnd() * 6];
  for (let x = 0; x < w; x++) {
    let best = 0; for (const m of masses) for (const dx of [-w, 0, w]) best = Math.max(best, prof(m, x - dx));
    if (best > 0.5) { const u = x / w * Math.PI * 2; best += (2.6 * Math.sin(u * 18 + ph[0]) + 1.6 * Math.sin(u * 41 + ph[1]) + 0.9 * Math.sin(u * 97 + ph[2])) * Math.min(1, best / 12); }
    top[x] = best >= 1 ? W - Math.round(best) : W;
  }
  for (let x = 0; x < w; x++) {
    const y0 = top[x]; if (y0 >= W) continue;
    const T_ = k => top[wrap(x + k)], yr = T_(1), yr3 = T_(3), yl3 = T_(-3);
    const tall = W - y0, slope = Math.abs(T_(2) - T_(-2)) / 4, low = tall < 8;
    // turf: a thin lip on the plateaus, a deep mantle down the gentle slopes, hardly any on the cliffs
    const gb = low ? tall : slope > 1.5 ? 1 + (hsh(x, 1) > 0.6 ? 1 : 0) : slope > 0.35 ? 6 + Math.round(10 * (1.5 - slope) / 1.15 + hsh(x, 2) * 3) : 4 + Math.round(hsh(x, 3) * 2);
    for (let y = y0; y < W; y++) {
      let col;
      if (y < y0 + gb && !(low && y >= W - 2)) {
        col = y === y0 ? (yr >= y0 ? M.grassL : M.grass) : (((x + y) & 1) && y > y0 + 1) ? M.grassD : M.grass;
        if (y === y0 + gb - 1 && ((x + y) & 1)) col = M.grassD;
        if (!low && hsh(x >> 2, y >> 2) < 0.07) col = M.rockL;
      } else if (low) col = y >= W - 1 ? M.sandD : M.sand;
      else {
        col = M.rock;
        const s = ((((W - y) + Math.round(x * 0.2 / S)) % 7) + 7) % 7;
        if (s === 0 && hsh(x, y) > 0.25) col = M.rockL;
        else if (s === 1 && hsh(x, y) > 0.55) col = M.rockD;
        if (y === y0 + gb) col = M.rockD;
        if (y < yr3) col = y < yr ? M.litL : (((x + y) & 1) || y < T_(2)) ? M.lit : col;
        else if (y < yl3 && ((x + y) & 1)) col = M.shade;
        if (y >= W - 2) col = M.wet;
      }
      px(g, x, y, col);
    }
  }
  // fissures down the faces, lit on their right lip
  for (let i = 0; i < w / 9; i++) {
    const x = (rnd() * w) | 0; if (W - top[x] < 16) continue;
    let y = top[x] + 6 + ((rnd() * 14) | 0); const n = 4 + ((rnd() * 12) | 0);
    for (let k = 0; k < n && y < W - 2; k++, y++) { px(g, x, y, M.rockD); if (rnd() < 0.5) px(g, (x + 1) % w, y, M.rockL); }
  }
  // the sea arch: a hole punched through the last mass, rimmed dark
  const ax = 450 * S, ary = 15, arx = 5 * S;
  for (let y = W - ary; y < W; y++) for (let x = Math.floor(ax - arx - 1); x <= Math.ceil(ax + arx + 1); x++) {
    const dx = (x + 0.5 - ax) / arx, dy = (y + 0.5 - W) / ary;
    if (dx * dx + dy * dy <= 1) g.clearRect(wrap(x), y, 1, 1);
    else if ((dx * dx + dy * dy) * 0.8 <= 1 && top[wrap(x)] <= y) px(g, wrap(x), y, M.shade);
  }
  // foam where the swell meets the foot of the land, and the land's reflection under it
  for (let x = 0; x < w; x++) {
    if (top[x] >= W) continue;
    const tall = W - top[x];
    if (x % 3) px(g, x, W, FOAM);
    if (rnd() < 0.35) px(g, x, W + 1, '#bfe4e0');
    const R = Math.min(7, Math.round(tall / 9));
    for (let y = W + 2; y < W + 2 + R && y < h; y++) if (((x + y) & 1) && rnd() < 0.8 - (y - W) * 0.08) px(g, x, y, '#4f8793');
  }
  // the river coming down the valley to the sea, with sand spits either side
  const rx = 257 * S;
  fillPoly(g, [[rx - 2, W - 7], [rx + 1, W - 7], [rx + 9, W], [rx - 11, W]], '#a4d2ce', '#b8dcd8');
  line(g, rx - 1, W - 6, rx + 3, W - 1, '#dcecea', 1);
  line(g, rx - 3, W - 6, rx - 13, W, M.sand, 1); line(g, rx + 2, W - 6, rx + 11, W, M.sand, 1);
  rect(g, rx - 14, W, 6, 1, M.sand); rect(g, rx + 8, W, 7, 1, M.sand);
  // SALTREACH on the slope above the river mouth: whitewashed cottages, slate roofs, a chapel
  const house = (x, big) => {
    x = wrap(x); const bw = big ? 6 : 5, by = Math.min(top[x], top[wrap(x + bw - 1)]) + 1;
    rect(g, x, by - 3, bw, 4, M.white); rect(g, x, by - 3, 1, 4, M.whiteD);
    rect(g, x - 1, by - 4, bw + 2, 1, M.roof); rect(g, x, by - 5, bw, 1, M.roof); px(g, x + bw - 1, by - 5, M.roofL);
    px(g, x + bw - 2, by - 2, M.rockD); if (big) px(g, x + 2, by - 1, M.rockD);
  };
  for (const hx of [266, 272, 279, 285, 298, 305, 312]) house(hx * S, hx === 279 || hx === 305);
  for (const hx of [236, 243]) house(hx * S, false);
  const chx = wrap(291 * S), chy = top[chx] + 1;
  rect(g, chx, chy - 9, 3, 10, M.white); rect(g, chx, chy - 9, 1, 10, M.whiteD); fillPoly(g, [[chx - 0.5, chy - 9], [chx + 1.5, chy - 14], [chx + 3.5, chy - 9]], M.roof); px(g, chx + 1, chy - 6, M.rockD);
  // boats drawn up at the mouth, masts up
  for (const bx0 of [247, 268]) { const bx = wrap(bx0 * S); rect(g, bx, W - 1, 5, 1, '#5e6070'); px(g, bx + 1, W, '#5e6070'); px(g, bx + 3, W, '#5e6070'); rect(g, bx + 2, W - 7, 1, 6, '#6e6a70'); }
  // waterfalls pouring off the cliffs into the sea
  const fall = (x0, wdth, fromY) => {
    x0 = wrap(x0); const y0 = fromY === undefined ? top[x0] : fromY;
    for (let y = y0; y < W; y++) for (let i = 0; i < wdth; i++) {
      const x = wrap(x0 + i), edge = i === 0 || i === wdth - 1;
      px(g, x, y, edge ? (((x + y) & 1) ? M.fallD : M.fall) : (((y + i * 3) % 5) < 2 ? FOAM : M.fall));
    }
    if (fromY === undefined) { px(g, wrap(x0 - 1), y0, M.fall); px(g, wrap(x0 + wdth), y0 + 1, M.fallD); }
    ellipse(g, x0 + wdth / 2, W, 3 + wdth, 2.5, FOAM, '#cfe8e4');
    for (let k = 0; k < 6; k++) px(g, wrap(x0 + wdth / 2 + (rnd() - 0.5) * 14), W - 2 - ((rnd() * 4) | 0), '#e0f0ee');
  };
  fall(131 * S, 3); fall(420 * S, 2); fall(96 * S, 1, top[wrap(96 * S)] + 11);
  // gulls working the cliffs
  for (let i = 0; i < 4; i++) gull(g, w, (rnd() * w) | 0, 14 + ((rnd() * 40) | 0), rnd() < 0.5, '#5e6474');
  return c;
}

// The near band: wind-bent coastal pines leaning inland, dark alders, the roofs of two boathouses and the nets
// drying by them, all standing in a low bank of shore scrub with wet barnacled boulders and rushes along its
// top. Darker and more saturated than mid. Transparent above; the crowns reach up to row ~60, the bank's top
// runs at about h - 34 (±12) and everything under it is opaque scrub. Laid out for 640 wide. Tiles horizontally.
export function bakeNearShore(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const S = w / 640;
  let rr = rnd;
  const at = (fn, x, ...a) => { const sd = (rnd() * 4294967296) >>> 0; for (const dx of [-w, 0, w]) { rr = mulberry(sd); fn(x + dx, ...a); } rr = rnd; };
  const ph = [rr() * 6, rr() * 6, rr() * 6];
  const bankY = x => { const u = x / w * Math.PI * 2; return Math.round(h - 34 + 6 * Math.sin(u * 3 + ph[0]) + 4 * Math.sin(u * 7 + ph[1]) + 2 * Math.sin(u * 19 + ph[2])); };
  // a pine the sea wind has pushed inland: orange-lit bark, flat layered pads of needles
  const PN = ['#142c26', '#204438', '#2e5c48', '#4a7650', '#8a9a5a'];
  const pad = (x, y, rx, ry) => {
    ellipse(g, x, y + 1.5, rx, ry, PN[0]);
    for (let k = -rx + 1; k < rx - 1; k += 2) { const yy = Math.round(y + 1.5 + ry * Math.sqrt(Math.max(0, 1 - (k / rx) * (k / rx)))); px(g, Math.round(x + k), yy, PN[0]); if (rr() < 0.5) px(g, Math.round(x + k), yy + 1, PN[0]); }
    ellipse(g, x - rx * 0.06, y, rx * 0.92, ry * 0.78, PN[1], PN[0]);
    ellipse(g, x + rx * 0.12, y - ry * 0.3, rx * 0.68, ry * 0.46, PN[2], PN[1]);
    ellipse(g, x + rx * 0.32, y - ry * 0.52, rx * 0.36, ry * 0.24, PN[3]);
    for (let k = 0; k < rx * 0.5; k++) px(g, Math.round(x + rx * 0.2 + rr() * rx * 0.6), Math.round(y - ry * 0.7 + rr() * 1.5), PN[4]);
    for (let k = 0; k < rx * 0.5; k++) { const nx = Math.round(x + (rr() - 0.5) * rx * 1.5), ny = Math.round(y + (rr() - 0.2) * ry * 0.9); px(g, nx, ny, PN[0]); px(g, nx + 1, ny - 1, PN[2]); }
  };
  const pine = (x, lean, top) => {
    const cxAt = t => x - lean * t * t;
    for (let y = top; y < h; y++) {
      const t = (h - y) / (h - top), cx = cxAt(t), wd = Math.round(11 - 5 * t), x0 = Math.round(cx - wd / 2), up = t > 0.5;
      rect(g, x0, y, wd, 1, up ? '#7a4a30' : '#583a2a');
      px(g, x0, y, '#34241a'); px(g, x0 + 1, y, up ? '#5a3a26' : '#46301f');
      px(g, x0 + wd - 1, y, up ? '#c8804c' : '#9a6242'); if (wd > 6) px(g, x0 + wd - 2, y, up ? '#a0663e' : '#7a5034');
      if (rr() < 0.14) rect(g, x0 + 2, y, Math.max(1, wd - 4), 1, '#3e2a1c');
    }
    // dead stubs low on the trunk
    for (const t of [0.4, 0.55]) if (rr() < 0.7) { const sx = cxAt(t), sy = h - t * (h - top), side = rr() < 0.5 ? -1 : 1; line(g, sx, sy, sx + side * 7, sy - 3, '#4a3024', 1); }
    // the crown: limbs from the top third swept inland, carrying a flat umbrella of needle pads
    for (const [t, side, k] of [[0.72, -1, 1.25], [0.79, 1, 0.55], [0.85, -1, 1.0], [0.91, 1, 0.6], [0.96, -1, 0.8]]) {
      const sx = cxAt(t), sy = h - t * (h - top), len = (18 + rr() * 14) * k * S, ex = sx + side * len, ey = sy - 4 - rr() * 6;
      line(g, sx, sy, (sx + ex) / 2, sy - 1, '#4a3024', 2); line(g, (sx + ex) / 2, sy - 1, ex, ey, '#4a3024', 2);
      const r = 11 + rr() * 6 * k;
      pad(ex - side * r * 0.3, ey - 4, r * 0.65, 3.2);
      pad(ex - side * 2, ey + 1, r, 4.5);
      pad(ex + side * r * 0.5, ey - 1, r * 0.7, 3.5);
    }
    const tx = cxAt(1);
    pad(tx - 20, top + 3, 13, 4);
    pad(tx - 8, top + 5, 24 + rr() * 6, 6);
    pad(tx + 7, top, 15 + rr() * 4, 4.5);
    pad(tx - 4, top - 4, 12, 3.5);
  };
  // an alder: a grey trunk forking under a ragged rounded crown, lit warm on the upper right
  const AL = ['#1e3824', '#2a4e2c', '#3c6636', '#58823e', '#8a9e50'];
  const lobe = (x, y, r) => {
    circle(g, x, y, r, AL[0]);
    circle(g, x + r * 0.1, y - r * 0.2, r * 0.82, AL[1], AL[0]);
    circle(g, x + r * 0.26, y - r * 0.4, r * 0.5, AL[2], AL[1]);
    if (r > 6) circle(g, x + r * 0.4, y - r * 0.56, r * 0.24, AL[3], AL[2]);
    for (let k = 0; k < r * 1.2; k++) {
      const a = rr() * Math.PI * 2, rad = r * (0.92 + rr() * 0.18), lx = Math.round(x + Math.cos(a) * rad), ly = Math.round(y + Math.sin(a) * rad);
      px(g, lx, ly, (Math.sin(a) < -0.2 && Math.cos(a) > -0.3) ? (rr() < 0.5 ? AL[4] : AL[3]) : AL[0]);
    }
  };
  const alder = (x, top) => {
    // three grey stems rising out of the bank, spreading as they go
    const sy = top + 56;
    for (const [dx, lean, wd] of [[-4, -16, 6], [1, 3, 8], [6, 17, 5]]) {
      for (let y = sy; y < h; y++) {
        const t = (h - y) / (h - sy), cx = x + dx + lean * Math.pow(t, 1.5), ww = Math.max(2, Math.round(wd - 2 * t)), x0 = Math.round(cx - ww / 2);
        rect(g, x0, y, ww, 1, '#4c4a42'); px(g, x0, y, '#2e2c26'); px(g, x0 + ww - 1, y, '#8a8472'); if (ww > 4) px(g, x0 + ww - 2, y, '#6c685c');
        if (rr() < 0.1) px(g, x0 + 1, y, '#2e2c26');
      }
    }
    // the crown: a broad ragged mass of lobes, drawn from the bottom up so the lit tops sit in front
    const cx = x, cy = top + 46, RX = 48 + rr() * 8, RY = 36, lobes = [];
    for (let k = 0; k < 28; k++) { const a = rr() * Math.PI * 2, d = Math.sqrt(rr()); lobes.push([cx - 4 + Math.cos(a) * RX * d * 0.8, cy + Math.sin(a) * RY * d * 0.75, 9 + rr() * 6]); }
    lobes.push([cx - RX * 0.6, cy + RY * 0.45, 13], [cx + RX * 0.5, cy + RY * 0.4, 12], [cx - 2, cy - RY * 0.7, 12], [cx - RX * 0.75, cy + RY * 0.1, 10]);
    lobes.sort((p, q) => q[1] - p[1]);
    for (const [lx, ly, r] of lobes) lobe(lx, ly, r);
  };
  // a boathouse, long and low: hipped slate roof with lichen, whitewash under the eaves, the arch of the boat door
  const boathouse = (x, wd, roofY) => {
    const eave = roofY + 14;
    rect(g, x, eave, wd, h - eave, '#b8b09e'); rect(g, x + wd - 5, eave, 5, h - eave, '#e6dccb'); rect(g, x, eave, 2, h - eave, '#9e978a');
    for (const wx of [x + 8, x + wd - 20]) { rect(g, wx, eave + 5, 5, 4, DRIFT[1]); rect(g, wx + 1, eave + 6, 3, 2, '#2a3038'); px(g, wx + 3, eave + 6, '#e8b890'); }
    const dx0 = Math.round(x + wd * 0.38), dw = Math.round(wd * 0.28);
    rect(g, dx0 - 1, eave + 6, dw + 2, h - eave - 6, DRIFT[1]); rect(g, dx0, eave + 8, dw, h - eave - 8, '#1e2228'); ellipse(g, dx0 + dw / 2, eave + 8, dw / 2, 3, '#1e2228');
    rect(g, x + wd - 22, roofY - 7, 5, 9, '#8e887c'); rect(g, x + wd - 23, roofY - 8, 7, 1, '#6e6a64'); px(g, x + wd - 18, roofY - 7, '#b0a898');
    fillPoly(g, [[x - 5, eave + 1], [x + 8, roofY], [x + wd - 8, roofY], [x + wd + 5, eave + 1]], SLATE);
    for (let y = roofY + 2; y <= eave; y += 3) {
      const k = (y - roofY) / (eave + 1 - roofY), xa = x + 8 - 13 * k, xb = x + wd - 8 + 13 * k;
      rect(g, xa, y, xb - xa, 1, '#3a4450');
      for (let xx = xa + (((y - roofY) / 3) & 1) * 3; xx < xb - 1; xx += 6) px(g, xx, y - 1, '#5a6676');
    }
    fillPoly(g, [[x + wd - 8, roofY], [x + wd + 5, eave + 1], [x + wd - 4, eave + 1]], '#5e6a7a');
    rect(g, x + 8, roofY, wd - 16, 1, '#6e7a88'); rect(g, x + wd - 24, roofY, 16, 1, '#a8aaa4');
    for (let i = 0; i < wd / 5; i++) px(g, Math.round(x + rr() * (wd - 4)), Math.round(roofY + 3 + rr() * 10), rr() < 0.55 ? '#c8b060' : SALT[1]);
    rect(g, x - 5, eave + 1, wd + 10, 1, '#2a3038'); rect(g, x, eave + 2, wd, 1, '#8e887c');
    const gx = Math.round(x + wd * 0.3); px(g, gx, roofY - 1, WHITE); px(g, gx + 1, roofY - 1, SALT[0]); px(g, gx + 1, roofY - 2, WHITE); px(g, gx - 1, roofY - 1, SLATE);
  };
  // nets drying between two poles, cork floats along the head rope
  const nets = (x, y) => {
    rect(g, x, y, 2, h - y, DRIFT[1]); rect(g, x + 28, y + 2, 2, h - y - 2, DRIFT[1]); px(g, x + 1, y, DRIFT[0]); px(g, x + 29, y + 2, DRIFT[0]);
    for (let xx = x + 2; xx < x + 28; xx++) {
      const t = (xx - x - 2) / 26, yt = Math.round(y + 2 + 6 * Math.sin(Math.PI * t) + t * 2);
      px(g, xx, yt, '#8a8474'); if (xx % 5 === 0) px(g, xx, yt, '#d08a48');
      for (let yy = yt + 1; yy < yt + 18; yy++) if (((xx + yy) % 3) === 0 || ((xx - yy) % 3) === 0) px(g, xx, yy, '#6e6a60');
    }
  };
  // the bank of shore scrub everything stands in
  const bank = () => {
    for (let x = 0; x < w; x++) { const y = bankY(x); rect(g, x, y + 3, 1, h - y - 3, '#182a20'); }
    for (let x = 0; x < w; x += 5) {
      const r = 4 + rr() * 4, cx = x + rr() * 3, cy = bankY(x) + 3 + rr() * 2;
      at(xx => { circle(g, xx, cy, r, '#1e3426'); circle(g, xx + r * 0.2, cy - r * 0.25, r * 0.7, '#2a4630', '#1e3426'); circle(g, xx + r * 0.35, cy - r * 0.45, r * 0.35, '#3a5a38'); px(g, Math.round(xx + r * 0.5), Math.round(cy - r * 0.7), '#7a8a4a'); }, cx);
    }
    for (let i = 0; i < w / 3; i++) { const x = (rr() * w) | 0, y0 = bankY(x) + 6, y = y0 + ((rr() * (h - y0)) | 0); px(g, x, y, rr() < 0.7 ? '#10201a' : '#26402c'); }
    for (let i = 0; i < w / 24; i++) { const x = (rr() * w) | 0, y = bankY(x) + 2 + ((rr() * 8) | 0); px(g, x, y, '#d88a3c'); if (rr() < 0.5) px(g, (x + 1) % w, y + 1, '#b0622a'); }
  };
  // a mound of scrub that breaks the bank's line, sea-buckthorn berries in it
  const shrub = (x, y, r) => {
    for (const [ox, oy, k] of [[-r * 0.6, r * 0.2, 0.7], [r * 0.55, r * 0.25, 0.65], [0, 0, 1]]) {
      const bx = x + ox, by = y + oy, rad = r * k;
      circle(g, bx, by, rad, '#1c3226'); circle(g, bx + rad * 0.15, by - rad * 0.25, rad * 0.75, '#284430', '#1c3226'); circle(g, bx + rad * 0.3, by - rad * 0.45, rad * 0.4, '#38583a');
      for (let q = 0; q < rad; q++) { const a = -1.3 + rr() * 1.4; px(g, Math.round(bx + Math.cos(a) * rad), Math.round(by + Math.sin(a) * rad), rr() < 0.5 ? '#7a8a4a' : '#56703e'); }
    }
    for (let q = 0; q < r * 0.6; q++) px(g, Math.round(x + (rr() - 0.5) * r * 1.6), Math.round(y - r * 0.2 + rr() * r * 0.6), rr() < 0.6 ? '#d88a3c' : '#b0622a');
  };
  // marram: pale dune grass, a warm fringe along the top of the bank
  const marram = (x, y, n, hmax) => {
    for (let i = 0; i < n; i++) {
      const bx = x + (rr() - 0.5) * n * 1.8, hh = hmax * (0.5 + rr() * 0.5), lean = 1 - rr() * 6;
      line(g, bx, y, bx + lean, y - hh, rr() < 0.4 ? '#b8b07a' : rr() < 0.6 ? '#9a9868' : '#7a7a52', 1);
    }
  };
  // a wet boulder: the shaded flank, the sunlit crown and seaward flank, a crevice, barnacles low down
  const rock = (x, base, wd, ht) => {
    fillPoly(g, [[x, base], [x + wd * 0.06, base - ht * 0.55], [x + wd * 0.3, base - ht], [x + wd * 0.68, base - ht * 0.94], [x + wd * 0.96, base - ht * 0.45], [x + wd, base]], RK.d);
    fillPoly(g, [[x, base], [x + wd * 0.06, base - ht * 0.55], [x + wd * 0.22, base - ht * 0.6], [x + wd * 0.2, base]], '#30363e', RK.d);
    fillPoly(g, [[x + wd * 0.3, base - ht], [x + wd * 0.68, base - ht * 0.94], [x + wd * 0.96, base - ht * 0.45], [x + wd * 0.7, base - ht * 0.5], [x + wd * 0.42, base - ht * 0.74]], RK.m);
    line(g, x + wd * 0.3, base - ht, x + wd * 0.68, base - ht * 0.94, RK.top, 1);
    line(g, x + wd * 0.68, base - ht * 0.94, x + wd * 0.96, base - ht * 0.45, RK.l, 1);
    line(g, x + wd * 0.42, base - ht * 0.74, x + wd * 0.5, base - ht * 0.2, RK.crack, 1);
    for (let k = 0; k < wd * 0.5; k++) px(g, Math.round(x + 2 + rr() * (wd - 4)), Math.round(base - 2 - rr() * ht * 0.3), rr() < 0.5 ? SALT[0] : SALT[1]);
    rect(g, x + 1, base - 1, wd - 2, 1, RK.crack);
    if (rr() < 0.5) { const tx = x + wd * 0.45, ty = base - ht * 0.95; ellipse(g, tx, ty, 4, 1.8, GRASS[1], GRASS_D); px(g, Math.round(tx - 1), Math.round(ty - 1), THRIFT); px(g, Math.round(tx + 1), Math.round(ty - 1), THRIFT_L); px(g, Math.round(tx), Math.round(ty - 2), THRIFT); }
  };
  const driftLog = (x, y, len) => {
    fillPoly(g, [[x, y], [x + len, y - 4], [x + len, y], [x, y + 4]], DRIFT[0]);
    line(g, x, y, x + len, y - 4, DRIFT_L, 1); line(g, x, y + 4, x + len, y, DRIFT_D, 1);
    ellipse(g, x + len, y - 2, 1.5, 2.2, '#b8aa90'); px(g, Math.round(x + len), Math.round(y - 2), DRIFT[1]);
    line(g, x + 3, y + 1, x - 4, y - 5, DRIFT[1], 2);
  };
  const rushes = (x, y, n, hmax) => {
    for (let i = 0; i < n; i++) {
      const bx = x + (rr() - 0.5) * n * 1.6, hh = hmax * (0.45 + rr() * 0.55), lean = -(1 + rr() * 5);
      const col = rr() < 0.35 ? '#3a5a2e' : rr() < 0.6 ? '#4a6c38' : '#5e7e42';
      line(g, bx, y, bx + lean, y - hh, col, 1);
      if (rr() < 0.3) rect(g, Math.round(bx + lean), Math.round(y - hh), 1, 3, '#6a5840');
      else if (rr() < 0.3) px(g, Math.round(bx + lean), Math.round(y - hh), '#8aa058');
    }
  };
  // back to front
  for (const [x, lean, tp] of [[60, 32, 70], [340, 38, 88], [600, 28, 64]]) at(pine, x * S, lean * S, tp);
  for (const [x, tp] of [[160, 116], [420, 128]]) at(alder, x * S, tp);
  at(nets, 300 * S, bankY(300 * S) - 34);
  at(boathouse, 200 * S, 92, bankY(246 * S) - 30); at(boathouse, 468 * S, 72, bankY(504 * S) - 28);
  bank();
  for (let i = 0; i < w / 70; i++) { const x = rnd() * w; at(shrub, x, bankY(x) - 2, 9 + rnd() * 6); }
  for (let i = 0; i < w / 58; i++) { const x = rnd() * w, wd = 12 + rnd() * 16, ht = 8 + rnd() * 9; at(rock, x, bankY(x) + 7 + rnd() * 6, wd, ht); }
  at(driftLog, 120 * S, bankY(120 * S) + 2, 34);
  for (let i = 0; i < w / 40; i++) { const x = rnd() * w; at(marram, x, bankY(x) + 4, 6 + ((rnd() * 6) | 0), 10 + rnd() * 10); }
  for (let i = 0; i < w / 34; i++) { const x = rnd() * w; at(rushes, x, bankY(x) + 5, 5 + ((rnd() * 7) | 0), 16 + rnd() * 22); }
  return c;
}

// The foreground: sparse. Now and then a pine bough or an alder twig hanging in from the top edge, a few dark
// rushes along the bottom, spray motes drifting. Mostly transparent, drawn over the play field.
export function bakeFGShore(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const D = '#12221f', M = '#1a322c', L = '#27463a';
  let rr = rnd;
  const at = (fn, x, ...a) => { const sd = (rnd() * 4294967296) >>> 0; for (const dx of [-w, 0, w]) { rr = mulberry(sd); fn(x + dx, ...a); } rr = rnd; };
  // a pointed leaf from (x, y) along angle a: dark blade, a lit midrib on its upper half
  const leaf = (x, y, a, len) => {
    const tx = x + Math.cos(a) * len, ty = y + Math.sin(a) * len, mx = x + Math.cos(a) * len * 0.45, my = y + Math.sin(a) * len * 0.45, nx = -Math.sin(a) * 2.2, ny = Math.cos(a) * 2.2;
    fillPoly(g, [[x, y], [mx + nx, my + ny], [tx, ty], [mx - nx, my - ny]], M);
    line(g, x, y, mx + Math.cos(a) * 1.5, my + Math.sin(a) * 1.5, L, 1);
  };
  const bough = (x, pineLike) => {
    const len = 44 + rr() * 18, dir = rr() < 0.5 ? -1 : 1, pts = [];
    for (let k = 0; k <= len; k += 2) pts.push([x + dir * k * 0.85, -3 + k * 0.3 + (k * k) / (len * 2.4)]);
    for (let i = 0; i + 1 < pts.length; i++) line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], D, i < pts.length / 2 ? 2 : 1);
    for (let i = 2; i < pts.length; i++) {
      const [bx, by] = pts[i];
      if (pineLike) { const s = 3 + (pts.length - i) * 0.16; for (const ax of [-0.7, 0, 0.7]) line(g, bx, by, bx + ax * s, by + s * (ax ? 0.9 : 1.2), (i + (ax > 0 ? 1 : 0)) & 1 ? M : L, 1); }
      else if (i % 3 === 0) for (const side of [-1, 1]) leaf(bx, by, Math.PI / 2 + side * 0.95 - dir * 0.25, 6);
    }
    if (!pineLike) { const [ex, ey] = pts[pts.length - 1]; for (const da of [-0.7, 0, 0.7]) leaf(ex, ey, Math.PI / 2 - dir * 0.6 + da, 7); for (const k of [0.4, 0.7]) { const [cx, cy] = pts[Math.round(pts.length * k)]; rect(g, Math.round(cx), Math.round(cy + 1), 1, 4, '#2a2218'); } }
  };
  const nb = Math.max(1, Math.round(w / 320));
  for (let i = 0; i < nb; i++) at(bough, (i + 0.15 + rnd() * 0.6) * w / nb, i % 2 === 0);
  const clumps = Math.max(2, Math.round(w / 110));
  for (let i = 0; i < clumps; i++) {
    const x = rnd() * w, n = 4 + ((rnd() * 5) | 0), tall = 10 + rnd() * 14;
    for (let f = 0; f < n; f++) {
      const bx = x + (f - n / 2) * 1.6, hh = tall * (0.55 + rnd() * 0.45), lean = -1 - rnd() * 4, col = f & 1 ? D : M, head = rnd() < 0.3;
      at(xx => { line(g, xx, h + 1, xx + lean, h - hh, col, 1); if (head) rect(g, Math.round(xx + lean), Math.round(h - hh), 1, 3, '#2a2418'); }, bx);
    }
  }
  for (let i = 0; i < w / 20; i++) {
    const x = (rnd() * w) | 0, y = 12 + ((rnd() * (h - 40)) | 0);
    if (rnd() < 0.2) { px(g, x, y, 'rgba(240,248,246,0.8)'); px(g, x - 1, y, 'rgba(232,244,240,0.35)'); px(g, (x + 1) % w, y, 'rgba(232,244,240,0.35)'); px(g, x, y - 1, 'rgba(232,244,240,0.35)'); px(g, x, y + 1, 'rgba(232,244,240,0.35)'); }
    else px(g, x, y, 'rgba(232,244,240,0.5)');
  }
  return c;
}
