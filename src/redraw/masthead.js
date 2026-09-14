// masthead.js — THE SKY SHIP: THE MASTHEAD, the biggest of the sail goblins and the one who taught the rest. A new baker,
// not a redraw. Frames face RIGHT (L is the flip) and share one canvas, so the anchor holds; every frame grid is settle()d
// onto its floor row. Parts are rasterised into a char grid (limb / gline / gpoly), parts that cross the body are laid with
// an inner outline (layer()), then fromGrid + OUT outline - the way src/redraw/pirates.js builds the flotilla.
// The look: a pot-bellied moor goblin twice the size of his crew, in a patched sailcloth jerkin and a red sash, a leather
// cap with brass goggles pushed up on it, bare green feet, a rope harness, a furled sail on a spar across his back, and a
// long GAFF HOOK to work it with.
//   frames: 0 idle (the gaff stood upright), 1, 2 walk,
//           3 gaff tell (the hook drawn back over his shoulder, body wound back),
//           4 gaff swing (a long step through, the hook out low and forward, smear arc),
//           5 sail tell (the spar planted on the deck in front of him, the sail half up and filling),
//           6 under sail (a full belly of canvas ahead of him, leaning into it, feet trailing),
//           7 aloft (hanging under the sail spread over him like a kite, feet dangling),
//           8 the drop (the canvas streaming up above him, feet first),
//           9 boom tell (both fists on the sheet, hauling it back, eyes screwed shut),
//           10 boom (arms thrown forward, the line running out of them),
//           11 FOULED (wrapped in his own canvas and lashed with its lines, dizzy, stars),
//           12 tangled / reel (sat down hard on the deck, a hand to his head),
//           13 hurt (LAST: head thrown back, eyes shut, arms flung out)
//   canvas 74x58 (grid 72x56)   anchor ax 32, ay 55   pack w/h 20x34
//   reach: idle hook ax+11..ax+16, ay-43..ay-37 (up over his head); SWING hook ax+30..ax+37, ay-15..ay-8, the tip about
//          ax+36, ay-12; TELL hook ax-22..ax-16, ay-47..ay-41 (back over his shoulder, nothing in front of him);
//          UNDER SAIL the canvas ax-2..ax+27, ay-50..ay-16; ALOFT the canopy ax-20..ax+22, ay-54..ay-42
import { px, fromGrid, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const rowsOf = G => G.map(r => r.join(''));
const put = (G, x, y, k) => { x = Math.round(x); y = Math.round(y); if (G[y] && x >= 0 && x < G[y].length) G[y][x] = k; };
function settle(G) {
  let low = G.length - 1; while (low >= 0 && G[low].every(k => k === '.')) low--;
  const n = G.length - 1 - low; if (n <= 0 || low < 0) return G;
  const w = G[0].length; for (let i = 0; i < n; i++) { G.pop(); G.unshift(Array(w).fill('.')); }
  return G;
}
function layer(G, fn) {
  const h = G.length, w = G[0].length, T = blank(w, h);
  fn(T);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (T[y][x] !== '.') continue;
    const by = (T[y - 1] && T[y - 1][x] !== '.') || (T[y + 1] && T[y + 1][x] !== '.') || (x > 0 && T[y][x - 1] !== '.') || (x + 1 < w && T[y][x + 1] !== '.');
    if (by && G[y][x] !== '.') G[y][x] = 'o';
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (T[y][x] !== '.') G[y][x] = T[y][x];
}
function gline(G, x0, y0, x1, y1, k) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const pts = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  pts.forEach(([x, y], i) => put(G, x, y, typeof k === 'function' ? k(i, pts.length) : k));
  return pts;
}
function limb(G, a, b, w, ramp) {
  const ax = a[0] + 0.5, ay = a[1] + 0.5, bx = b[0] + 0.5, by = b[1] + 0.5, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, r = w / 2;
  for (let y = Math.floor(Math.min(ay, by) - r); y <= Math.ceil(Math.max(ay, by) + r); y++) for (let x = Math.floor(Math.min(ax, bx) - r); x <= Math.ceil(Math.max(ax, bx) + r); x++) {
    const row = G[y]; if (!row || x < 0 || x >= row.length) continue;
    const t = Math.max(0, Math.min(1, ((x + 0.5 - ax) * dx + (y + 0.5 - ay) * dy) / L2)), ox = x + 0.5 - ax - dx * t, oy = y + 0.5 - ay - dy * t, d = Math.hypot(ox, oy);
    if (d > r) continue;
    const s = d < 0.3 ? 0 : (-ox * 0.6 - oy * 0.8) / d;
    row[x] = s > 0.4 ? ramp[2] : s < -0.4 ? ramp[0] : ramp[1];
  }
}
function gpoly(G, pts, pick) {
  let y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
    const sy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= sy) !== (b[1] <= sy)) xs.push(a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5); x < Math.ceil(xs[i + 1] - 0.5); x++) put(G, x, y, pick(x, y));
  }
}
function smear(c, cx, cy, r, a0, a1) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 2) for (const [rr, col] of [[r, '#fff6dc'], [r - 1, a > a0 + (a1 - a0) * 0.4 ? '#dfe8c0' : null]]) {
    if (!col) continue;
    const x = Math.round(cx + rr * Math.cos(a * Math.PI / 180)), y = Math.round(cy + rr * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= c.width || y >= c.height) continue;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, col);
  }
}
const axis = (o, deg) => {
  const a = deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]];
  return (d, s = 0) => [o[0] + u[0] * d + n[0] * s, o[1] + u[1] * d + n[1] * s];
};

// ---------- THE MASTHEAD PALETTE ----------
// goblin green g/G/h with a dark pupil x, a mouth m and tusks t; leather u/U/v; sailcloth c/C/D with its red band q/Q;
// wood w/W; the gaff's iron i/I/j; brass y/Y and a goggle lens l; rope p/P; his sash r/R; the stars over a dizzy head s
const MP = { o: OUT, g: '#6faa4a', G: '#3f6e2c', h: '#9ad06a', e: '#f3f0d2', x: '#2a1a14', t: '#f0e6c8', m: '#4d1d23',
  u: '#8a5a32', U: '#5c3a1d', v: '#3a2414', c: '#efe6d2', C: '#c9b27c', D: '#8a7a58', q: '#c9463d', Q: '#8f2f28',
  w: '#c29c5e', W: '#7c5e31', i: '#e3e9f0', I: '#9ba5b3', j: '#5c6573', y: '#e6b94a', Y: '#9c7619', l: '#bfe6f5',
  p: '#e0cc9c', P: '#9f8752', r: '#d14a3a', R: '#8e2b26', s: '#fff6c8' };

export function bakeMasthead() {
  const W = 72, H = 56, X = 32, FL = H - 1;
  const q = G => outline(fromGrid(rowsOf(settle(G)), MP, 1), OUT);
  // feet, as [dx, dy] from the body's base: two thick goblin legs in leather breeches and two big bare feet
  const LEGS = { stand: [[-5, 0], [5, 0]], walkA: [[-9, 0], [8, -1]], walkB: [[-2, -1], [3, 0]], lunge: [[-10, 0], [11, 0]], brace: [[-11, 0], [9, 0]],
    trail: [[-12, -3], [-5, -1]], dangle: [[-4, -3], [5, -6]], point: [[-2, 0], [3, -2]], sit: [[9, 0], [14, -1]] };
  const legs = (G, B, T, pose, sit) => {
    LEGS[pose].forEach(([fx, fy], k) => {
      const hip = [B + (k ? 4 : -4), T - 10], foot = [B + fx, (sit ? FL : T) + fy];
      limb(G, hip, [foot[0], foot[1] - 2], 4.6, k ? ['U', 'u', 'u'] : ['v', 'U', 'u']);
      limb(G, [foot[0] - 1, foot[1] - 1], [foot[0] + 2, foot[1] - 1], 3.4, ['G', 'g', 'h']);
    });
  };
  // the belly: a sailcloth jerkin with a patch on it, a red sash, and his harness rope across it
  const torso = (G, B, T, lean) => {
    const pts = [[B - 9, T - 10], [B + 9, T - 10], [B + 12 + lean * 0.5, T - 17], [B + 8 + lean, T - 25], [B - 8 + lean, T - 25], [B - 12 + lean * 0.5, T - 17]];
    gpoly(G, pts, (x, y) => { const f = x - B - lean * (T - 10 - y) / 15; return ((x * 5 + y * 3) % 17 === 0) ? 'D' : f < -5 ? 'D' : f > 4 ? 'c' : 'C'; });
    for (let yy = T - 21; yy <= T - 18; yy++) for (let x = B - 5 + lean; x <= B - 2 + lean; x++) put(G, x, yy, yy === T - 21 || x === B - 5 + lean ? 'Q' : 'q');
    for (let x = B - 12; x <= B + 12; x++) { const yy = T - 12; if (G[yy] && G[yy][x] !== '.' && G[yy][x] !== undefined) { put(G, x, yy, 'r'); put(G, x, yy + 1, x % 3 ? 'R' : 'r'); } }
    gline(G, B - 7 + lean, T - 24, B + 8, T - 13, i => (i % 4 === 0 ? 'P' : 'p'));
  };
  // the head: big and low on the shoulders, two long ears, a nose, tusks, and a leather cap with the goggles pushed up
  const head = (G, hx, hy, o) => {
    gpoly(G, [[hx - 5, hy - 1], [hx - 16, hy - 6], [hx - 6, hy + 3]], () => 'G');
    limb(G, [hx, hy], [hx, hy], 14, ['G', 'g', 'h']);
    gpoly(G, [[hx + 6, hy - 2], [hx + 16, hy - 7], [hx + 6, hy + 3]], (x, y) => (y < hy - 2 ? 'h' : 'g'));
    limb(G, [hx + 7, hy + 1], [hx + 8, hy + 2], 3.2, ['G', 'g', 'h']);
    if (o.eyes === 'shut') { gline(G, hx - 3, hy - 1, hx - 1, hy - 1, 'x'); gline(G, hx + 2, hy - 1, hx + 4, hy - 1, 'x'); }
    else if (o.eyes === 'dizzy') for (const ex of [hx - 2, hx + 3]) { put(G, ex - 1, hy - 3, 'x'); put(G, ex + 1, hy - 3, 'x'); put(G, ex, hy - 2, 'x'); put(G, ex - 1, hy - 1, 'x'); put(G, ex + 1, hy - 1, 'x'); }
    else { for (const ex of [hx - 3, hx + 2]) { put(G, ex, hy - 2, 'e'); put(G, ex + 1, hy - 2, 'e'); put(G, ex, hy - 1, 'e'); put(G, ex + 1, hy - 1, 'x'); } gline(G, hx - 4, hy - 3, hx + 4, hy - 4, 'G'); }
    if (o.mouth === 'open') { for (let y = hy + 3; y <= hy + 5; y++) gline(G, hx - 1, y, hx + 5, y, 'm'); put(G, hx, hy + 3, 't'); put(G, hx + 4, hy + 3, 't'); }
    else { gline(G, hx - 1, hy + 4, hx + 5, hy + 3, 'm'); put(G, hx + 5, hy + 2, 't'); put(G, hx, hy + 3, 't'); }
    if (!o.noCap) {
      gpoly(G, [[hx - 7, hy - 4], [hx + 8, hy - 4], [hx + 7, hy - 8], [hx + 1, hy - 11], [hx - 6, hy - 8]], (x, y) => (y === hy - 5 ? 'v' : x < hx - 2 ? 'U' : 'u'));
      for (const gx of [hx - 1, hx + 4]) { limb(G, [gx, hy - 8], [gx, hy - 8], 3.6, ['Y', 'y', 'y']); put(G, gx, hy - 8, 'l'); }
    }
  };
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    const ramp = far ? ['G', 'G', 'g'] : ['G', 'g', 'h'];
    limb(g, sh, el, 4, ramp); limb(g, el, hd, 3.6, ramp); limb(g, hd, hd, 4.2, ramp);
  });
  // THE GAFF: a long ash pole and an iron hook on the end of it, curled back
  const gaff = (G, hand, deg, len) => { const A = axis(hand, deg);
    limb(G, A(-4), A(len), 2.2, ['W', 'w', 'w']);
    for (const [d, s] of [[len + 1, 0], [len + 2, -1], [len + 3, -2], [len + 3, -3], [len + 2, -4], [len + 1, -5], [len + 1, 1], [len + 2, 1]]) put(G, ...A(d, s), 'I');
    put(G, ...A(len + 2, -2), 'i'); put(G, ...A(len + 3, 1), 'j'); put(G, ...A(len + 4, 1), 'i');
  };
  // the furled sail on his back: a spar across his shoulders, the canvas rolled on it, three ties
  const furl = (G, B, T, lean) => {
    limb(G, [B - 18, T - 20], [B + 6 + lean, T - 31], 2.2, ['W', 'W', 'w']);
    limb(G, [B - 15, T - 21], [B + lean, T - 29], 5.4, ['D', 'C', 'c']);
    for (const f of [0.2, 0.5, 0.8]) { const x = B - 15 + (15 + lean) * f, y = T - 21 - 8 * f; gline(G, x, y - 3, x + 1, y + 2, 'P'); }
  };
  const canvasOf = (x0, y0) => (x, y) => { const r = y - y0; return r >= 3 && r <= 4 ? 'q' : r === 5 ? 'Q' : ((x * 3 + y * 5) % 13 === 0) ? 'D' : ((y - y0) % 8 === 7) ? 'C' : x < x0 + 3 ? 'C' : 'c'; };
  // the sail half up: the spar stood on the deck in front of him, the canvas filling off its yard
  const sailHalf = (G, B, T) => {
    limb(G, [B + 12, T - 4], [B + 13, T - 46], 2.6, ['W', 'w', 'w']);
    gpoly(G, [[B + 2, T - 44], [B + 24, T - 46], [B + 27, T - 32], [B + 18, T - 22], [B + 7, T - 26]], canvasOf(B + 2, T - 46));
    gline(G, B + 1, T - 45, B + 25, T - 47, 'W');
  };
  // under full sail: a belly of canvas out ahead of him, and him behind it
  const sailFull = (G, B, T) => {
    limb(G, [B + 14, T - 8], [B + 16, T - 50], 2.6, ['W', 'w', 'w']);
    gpoly(G, [[B + 3, T - 48], [B + 28, T - 49], [B + 34, T - 38], [B + 32, T - 24], [B + 23, T - 16], [B + 9, T - 18], [B + 13, T - 32]], canvasOf(B + 3, T - 50));
    gline(G, B + 2, T - 49, B + 29, T - 50, 'W');
  };
  // aloft: the sail spread over him like a kite, and him hung under it on two lines
  const canopy = (G, B, T) => {
    gpoly(G, [[B - 20, T - 41], [B + 22, T - 41], [B + 18, T - 50], [B + 1, T - 54], [B - 16, T - 50]], canvasOf(B - 20, T - 55));
    gline(G, B - 19, T - 41, B - 7, T - 31, 'p'); gline(G, B + 21, T - 41, B + 9, T - 31, 'p');
  };
  // the drop: the canvas streaming up over him
  const streamer = (G, B, T) => {
    gpoly(G, [[B - 5, T - 40], [B + 6, T - 40], [B + 11, T - 55], [B + 2, T - 50], [B - 8, T - 54]], canvasOf(B - 8, T - 55));
    gline(G, B - 5, T - 40, B - 6, T - 32, 'p'); gline(G, B + 6, T - 40, B + 7, T - 32, 'p');
  };
  // FOULED: the canvas round him and its lines round that
  const wrap = (G, B, T) => {
    gpoly(G, [[B - 13, T - 3], [B + 13, T - 3], [B + 16, T - 16], [B + 11, T - 28], [B - 10, T - 29], [B - 16, T - 15]],
      (x, y) => (((x * 2 + y) % 11 === 0) ? 'D' : (T - y) % 9 === 4 ? 'q' : x < B - 6 ? 'C' : 'c'));
    for (const k of [0, 1, 2]) gline(G, B - 15, T - 24 + k * 8, B + 15, T - 19 + k * 7, i => (i % 3 ? 'p' : 'P'));
  };
  const stars = (G, B, T) => { for (const [sx, sy] of [[-8, -44], [2, -48], [11, -43]]) { put(G, B + sx, T + sy, 's'); for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) put(G, B + sx + ox, T + sy + oy, 'y'); } };

  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), T = FL + (o.dy || 0), lean = o.lean || 0;
    const S = (dx, dy) => [B + dx + (dy < -12 ? lean : 0), T + dy];
    if (o.canopy) canopy(G, B, T);
    if (o.streamer) streamer(G, B, T);
    if (o.furl) furl(G, B, T, lean);
    if (o.gaff && o.gaff[3] === 'back') layer(G, g => gaff(g, S(...o.gaff[0]), o.gaff[1], o.gaff[2]));
    arm(G, S(-7, -23), S(...o.far[0]), S(...o.far[1]), true);
    legs(G, B, T, o.legs, o.sit);
    torso(G, B, T, lean);
    if (o.wrap) layer(G, g => wrap(g, B, T));
    layer(G, g => head(g, B + 1 + lean + ((o.head || {}).hx || 0), T - 32 + ((o.head || {}).hy || 0), o.head || {}));
    if (o.sail === 'half') layer(G, g => sailHalf(g, B, T));
    if (o.gaff && o.gaff[3] !== 'back') layer(G, g => gaff(g, S(...o.gaff[0]), o.gaff[1], o.gaff[2]));
    if (o.near) arm(G, S(6, -23), S(...o.near[0]), S(...o.near[1]), false);
    if (o.sail === 'full') layer(G, g => sailFull(g, B, T));
    if (o.rope) layer(G, g => gline(g, ...S(...o.rope[0]), ...S(...o.rope[1]), i => (i % 3 ? 'p' : 'P')));
    if (o.stars) stars(G, B, T);
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  const idle = frame({ legs: 'stand', furl: true, far: [[-10, -16], [-10, -10]], near: [[9, -16], [10, -13]], gaff: [[10, -13], -84, 26] });
  const walk1 = frame({ legs: 'walkA', furl: true, far: [[-11, -17], [-13, -11]], near: [[9, -17], [11, -13]], gaff: [[11, -13], -74, 26] });
  const walk2 = frame({ legs: 'walkB', furl: true, far: [[-9, -16], [-8, -10]], near: [[8, -16], [9, -12]], gaff: [[9, -12], -92, 26] });
  const slashTell = frame({ legs: 'brace', dx: -2, lean: -2, furl: true, far: [[-3, -18], [1, -14]], near: [[-1, -31], [-7, -33]], gaff: [[-7, -33], -140, 17, 'back'], head: { hx: -1 } });
  const slash = frame({ legs: 'lunge', dx: 2, lean: 3, furl: true, far: [[-6, -18], [-10, -14]], near: [[11, -20], [14, -17]], gaff: [[14, -17], 18, 19], head: { mouth: 'open' },
    smear: [1 + X + 2 + 14 + 3, 1 + FL - 17, 20, -110, 30] });
  const sailTell = frame({ legs: 'brace', dx: -4, far: [[4, -17], [11, -15]], near: [[10, -19], [12, -14]], sail: 'half' });
  const sail = frame({ legs: 'trail', dx: -6, lean: 3, far: [[6, -21], [13, -23]], near: [[11, -19], [14, -16]], sail: 'full', head: { mouth: 'open' } });
  const aloft = frame({ legs: 'dangle', canopy: true, far: [[-10, -28], [-7, -32]], near: [[10, -28], [9, -32]], gaff: [[3, -12], 96, 13], head: { mouth: 'open' } });
  const drop = frame({ legs: 'point', streamer: true, far: [[-9, -29], [-6, -33]], near: [[9, -29], [7, -33]], gaff: [[8, -13], 78, 12], head: { mouth: 'open' } });
  const boomTell = frame({ legs: 'brace', dx: -3, lean: -3, furl: true, far: [[-9, -18], [-12, -16]], near: [[-2, -18], [-9, -17]], rope: [[-10, -17], [28, -44]], head: { hx: -1, eyes: 'shut' } });
  const boom = frame({ legs: 'lunge', dx: 1, lean: 3, furl: true, far: [[6, -20], [12, -19]], near: [[12, -21], [18, -19]], rope: [[18, -19], [32, -23]], head: { mouth: 'open' } });
  const fouled = frame({ legs: 'stand', wrap: true, far: [[-10, -12], [-11, -8]], head: { hy: 4, eyes: 'dizzy' }, stars: true });
  const tangled = frame({ legs: 'sit', sit: true, dy: 6, far: [[-11, -14], [-14, -8]], near: [[8, -25], [4, -33]], head: { hy: 2, eyes: 'dizzy' } });
  const hurt = frame({ legs: 'brace', dx: -2, lean: -3, furl: true, far: [[-12, -26], [-16, -30]], near: [[10, -26], [14, -30]], gaff: [[14, -30], -58, 18], head: { hx: -3, hy: 1, eyes: 'shut', mouth: 'open' } });
  return pack([idle, walk1, walk2, slashTell, slash, sailTell, sail, aloft, drop, boomTell, boom, fouled, tangled, hurt], X, FL, 20, 34);
}
