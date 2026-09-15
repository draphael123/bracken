// strawking.js — THE HEXED FIELDS: THE SCARECROW KING (the boss of THE BURNING CORNFIELD), THE HEADLESS PLOUGHMAN (the
// mini-boss) and the Ploughman's head in flight. A new baker, not a redraw. Frames face RIGHT (L is the flip) and share
// one canvas per pack, so the anchor holds. Parts are rasterised into a char grid (limb / gline / gpoly, rpoly for
// anything laid at an angle, paste() for a part drawn upright in its own grid and turned onto the body), parts that
// cross the body are laid with an inner outline (layer()), then fromGrid + OUT outline - the way prince.js builds the
// Buried Prince. Anchors follow chars.js: ax = the body's centre column, ay = the OUT outline row under the feet.
// ONE GHOST-GREEN (#1f6a3a #3fbf5f #7dff8a #d8ffd0) marks interactive things: here it is ONLY the vines of TANGLED.
//
// bakeStrawKing()  THE SCARECROW KING (boss) — a towering scarecrow lord, about two and a half men tall: a huge burlap
//   sack head with a carved jack-o'-lantern face lit hot amber from inside, a crown of twisted wheat sheaves and rusted
//   nails, a long tattered crimson harvest-lord coat with ochre patches and a frayed hem, a ragged cloak of old sacking,
//   a cage chest of lashed sticks with straw spilling through it, long straw arms with twig fingers, a rope belt hung
//   with dead crows and corn husks, legs of bound straw ending in split wooden stakes, and a huge rusted SCYTHE.
//   frames (STRAWKING_F names them):
//      0 idle A (sway)   1 idle B (sway the other way, straw lifting)   2 walk A (lurching step)   3 walk B
//      4 sweepTell (scythe far back and LOW behind him, wound, eyes flaring)   5 sweep (blade through LOW, knee height)
//      6 callTell (arms high, head back, mouth wide, crows perched on the arms, scythe stood in the ground)
//      7 call (arms flung forward, the crows leaving)
//      8 forkTell (pitchfork back over the shoulder, scythe low in the other hand)   9 fork (throwing arm out, empty)
//     10 lashed (crucifix pose: arms straight out on an invisible crossbar, head slumped, legs dangling together)
//     11 slump (OPENING: down on his knees in a heap, head lolled, arms limp, scythe dropped)
//     12 tangled (stage-2 OPENING: bound and wrenched by GHOST-GREEN vines round the leg, chest and near arm)
//     13 rebuild (hunched, tearing a bale apart and stuffing straw into his chest)
//     14 slamTell (a bale held overhead in both fists)   15 slam (both fists smashed down in front, the bale burst)
//     16 lanternTell (a lit lantern held high, looking at it)   17 lanternThrow (lantern arm flung forward, empty)
//     18 ablaze (FINAL OPENING: his own straw burning from the chest and near arm, flailing, head thrown back)
//     19 dead (a smouldering heap of straw and coat, the sack head on top with its eyes dark, the crown fallen beside)
//     20 hurt (LAST: jolted back, straw spraying out of the chest)
//   canvas 112x96 (grid 110x94)   anchor ax 51, ay 93   pack w/h 26x60
//   every frame's lowest opaque row is ay (feet, knees, stake tips or the heap on the floor row)
//   reach (canvas px relative to the anchor): standing crown top ~ay-82, sack head centre ax+4, ay-64;
//          idle scythe blade ax+18..ax+40, ay-76..ay-62;
//          SWEEP blade tip ~ax+56, ay-15 (blade ax+32..ax+57, ay-24..ay-12; smear along the floor to ax+58);
//          sweepTell blade ax-46..ax-27, ay-25..ay-14 (behind him, nothing in front);
//          FORK throwing hand ax+29, ay-54 (forkTell tines ax+22..ax+30, ay-72..ay-66; hand ax-11, ay-64);
//          lanternTell lantern centre ax+17, ay-68 (flame ax+17, ay-68; lantern ax+14..ax+20, ay-76..ay-61);
//          lanternThrow release hand ax+31, ay-48; slam fists ax+22..ax+28, ay-4; call hands ax+21..ax+27, ay-50;
//          slamTell bale ax-8..ax+9, ay-88..ay-78
//
// bakePloughman()  THE HEADLESS PLOUGHMAN (mini-boss) — a broad dead ploughman with no head: a ragged neck stump with a
//   wisp of pale smoke, a dirty cream smock under a leather jerkin, a leather apron, gaiters and mud-caked boots. He
//   carries his own head, a glowing carved pumpkin, in the crook of his near arm, an ox-goad in his far hand, and pushes
//   a haunted wooden plough with a rusted iron share and a small iron-shod wheel out in front of him.
//   frames (PLOUGHMAN_F): 0 idle, 1 walk A, 2 walk B, 3 chargeTell (braced low, dust at the share), 4 charge (driving,
//     share up throwing dirt), 5 stuck (OPENING: share jammed in a furrow, heaving on the handles, head dropped and dim),
//     6 goadTell (goad raised high behind), 7 goad (thrust forward level), 8 headTell (head lifted high, blazing),
//     9 headThrow (arm flung forward, empty), 10 hurt (LAST)
//   canvas 84x52 (grid 82x50)   anchor ax 27, ay 49 (centred on his body, not the plough)   pack w/h 20x34
//   reach: plough ax+11..ax+48 along the floor (share tip ax+38, wheel front ax+47); GOAD point ax+50, ay-29;
//          goadTell point ax+22, ay-43; headTell head centre ax+13, ay-44; headThrow release hand ax+24, ay-29
//
// bakePloughHead()  four 12x12 canvases of the glowing pumpkin head turning over in flight, centred (6, 6)
import { fromGrid, outline, flipX, whiten, px, mulberry } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const rowsOf = G => G.map(r => r.join(''));
const put = (G, x, y, k) => { x = Math.round(x); y = Math.round(y); if (G[y] && x >= 0 && x < G[y].length) G[y][x] = k; };
const stamp = (G, x, y, rows) => rows.forEach((r, j) => { const row = G[Math.round(y) + j]; if (!row) return; for (let i = 0; i < r.length; i++) { const k = r[i], xx = Math.round(x) + i; if (k === '.' || xx < 0 || xx >= row.length) continue; row[xx] = k; } });
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
// a capsule from a to b, w thick; ramp = [dark, base, light], lit from the upper left
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
// a polygon laid at an angle: pts in the part's own frame (d along it, s across it) about origin o, turned by deg
function rpoly(G, o, deg, pts, pick) {
  const a = deg * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
  const wp = pts.map(([d, s]) => [o[0] + cs * d - sn * s, o[1] + sn * d + cs * s]);
  gpoly(G, wp, (x, y) => { const dx = x + 0.5 - o[0], dy = y + 0.5 - o[1]; return pick(cs * dx + sn * dy, -sn * dx + cs * dy); });
}
// a part drawn upright in its own grid T, turned by deg about T's pivot and laid with that pivot at `at`
function paste(G, T, pivot, at, deg) {
  const a = (deg || 0) * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a), R = Math.ceil(Math.hypot(T.length, T[0].length));
  for (let wy = -R; wy <= R; wy++) for (let wx = -R; wx <= R; wx++) {
    const lx = Math.round(cs * wx + sn * wy + pivot[0]), ly = Math.round(-sn * wx + cs * wy + pivot[1]), row = T[ly], k = row && row[lx];
    if (!k || k === '.') continue;
    put(G, at[0] + wx, at[1] + wy, k);
  }
}
const pt = (o, deg, d) => [o[0] + Math.cos(deg * Math.PI / 180) * d, o[1] + Math.sin(deg * Math.PI / 180) * d];
// a swing's smear along part of an ellipse (canvas px, degrees: 0 ahead, 90 down), after the outline, empty pixels only
function smearE(c, cx, cy, rx, ry, a0, a1, cols) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 1) cols.forEach((col, i) => {
    if (i && a < a0 + (a1 - a0) * (0.3 * i)) return;
    const x = Math.round(cx + (rx - i) * Math.cos(a * Math.PI / 180)), y = Math.round(cy + (ry - i) * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= c.width || y >= c.height - 3) return;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, col);
  });
}
// loose strands flying out from (cx, cy) between angles a0..a1, r0..r1 out, each 2-3 px long
function spray(G, cx, cy, n, a0, a1, r0, r1, seed, keys) {
  const rnd = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const a = (a0 + (a1 - a0) * rnd()) * Math.PI / 180, r = r0 + (r1 - r0) * rnd(), len = 2 + Math.floor(rnd() * 2), k = keys[Math.floor(rnd() * keys.length)];
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, b = a + (rnd() - 0.5) * 1.6;
    gline(G, x, y, x + Math.cos(b) * len, y + Math.sin(b) * len, k);
  }
}

// ---------- THE SCARECROW KING'S PALETTE ----------
// burlap a/A/2/5 (light to deep); the carving q and its glow 9/e/E and fire F; wheat w/W/V; nails n/N with heads i;
// the coat c/C/d with ochre patches and trim p/P; sacking k/K/j; sticks t/T/u; straw y/Y/Z; rope r/R; crows b/B;
// corn husks h/H; the scythe's steel x/X and rust m/M, its haft l/L; lantern iron I/J; ghost-green vines v/6/7/8;
// smoke S/3
const KP = { o: OUT,
  a: '#d4aa6a', A: '#a87c46', 2: '#70502c', 5: '#463018',
  q: '#1e0e0a', 9: '#fff4c4', e: '#ffd36b', E: '#ff9a5c', F: '#d8482a',
  w: '#f8e08c', W: '#cda444', V: '#86662a', n: '#c8783f', N: '#723c22', i: '#c4cad0',
  c: '#d8563f', C: '#a03532', d: '#621e28', p: '#eab44c', P: '#aa722c',
  k: '#a08a62', K: '#6c5c3c', j: '#443821',
  t: '#bc8852', T: '#7c5432', u: '#3c2818',
  y: '#ffe690', Y: '#dcae4c', Z: '#9c7630',
  r: '#e6d09c', R: '#98834f', b: '#2c2838', B: '#8a86a6', h: '#efe4aa', H: '#ab9d5c',
  x: '#f2f6f8', X: '#a2aab4', m: '#c87444', M: '#7a3e22', l: '#b07a44', L: '#664220',
  I: '#4c4c58', J: '#8c8c9a',
  v: '#1f6a3a', 6: '#3fbf5f', 7: '#7dff8a', 8: '#d8ffd0',
  S: '#9290a2', 3: '#5a586a' };
const STRAW = ['Z', 'Y', 'y'], STRAW_F = ['Z', 'Z', 'Y'];
const COAT = ['d', 'C', 'c'], COAT_F = ['d', 'd', 'C'];
const TWIG = ['u', 'T', 't'];

// crows: perched, flying, and hung dead off the belt by the feet; a corn husk
const CROW_PERCH = ['....bb.', '...bBeP', 'bbbbbb.', '.bBBb..', '..R.R..'];
const CROW_FLY = ['B.....B.', 'bB...Bb.', '.bbbbbeP', '..bbb...'];
const CROW_FLY2 = ['........', '.bbbbbeP', 'bB.bb...', 'B.......'];
const CROW_DEAD = ['.R.', '.R.', 'bbb', 'bBb', 'bbb', '.b.', '.P.'];
const HUSK = ['.H', 'hH', 'hH', 'hh', 'hH', '.h'];

// THE CROWN: a twisted band of wheat, sheaves fanned up out of it and rusted nails driven up between them
function crownDraw(T, cx, cy) {
  for (const [nx, len, a] of [[-7, 5, -0.45], [0, 6, 0], [6, 5, 0.4]]) {
    const x1 = cx + nx + Math.sin(a) * len, y1 = cy - 1 - Math.cos(a) * len;
    gline(T, cx + nx, cy - 1, x1, y1, 'n'); gline(T, cx + nx + 1, cy - 1, x1 + 1, y1 + 1, 'N');
    gline(T, x1 - 1, y1, x1 + 1, y1, 'i');
  }
  for (const [sx, len, a] of [[-9, 5, -0.6], [-5, 7, -0.3], [-2, 8, -0.1], [2, 8, 0.1], [5, 7, 0.3], [8, 5, 0.55]]) {
    const ux = Math.sin(a), uy = -Math.cos(a), x0 = cx + sx, y0 = cy - 1;
    gline(T, x0, y0, x0 + ux * len, y0 + uy * len, 'W');
    for (let k = len - 4; k <= len; k++) { put(T, x0 + ux * k, y0 + uy * k, 'w'); put(T, x0 + ux * k + 1, y0 + uy * k, k % 2 ? 'W' : 'w'); }
    put(T, x0 + ux * (len + 2) - 1, y0 + uy * (len + 2), 'w'); put(T, x0 + ux * (len + 2) + 2, y0 + uy * (len + 1), 'w');
  }
  for (let dx = -10; dx <= 9; dx++) for (let r = 0; r < 2; r++) put(T, cx + dx, cy + r + Math.round(dx * 0.08), ((dx + r * 2) % 3 === 0) ? 'V' : r ? 'W' : 'w');
}

// ---------- THE SACK HEAD, drawn upright in its own grid and turned onto the body ----------
const HG = 56, HC = 28;
function kingHeadGrid(o) {
  const T = blank(HG, HG), q = (x, y) => [HC + x, HC + y];
  // the ruff of burlap gathered under the rope, frayed
  gpoly(T, [q(-5, 8), q(5, 8), q(10, 14), q(7, 13), q(5, 15), q(2, 13), q(0, 15), q(-2, 13), q(-5, 15), q(-7, 13), q(-10, 14)], (x, y) => (x < HC - 2 ? '2' : (x + y) % 5 === 0 ? '2' : 'A'));
  // the sack: big and lumpy, lit from the upper left, coarse weave flecks
  gpoly(T, [q(-8, -10), q(-2, -12), q(5, -11), q(10, -7), q(12, 0), q(10, 7), q(5, 10), q(-4, 10), q(-10, 7), q(-12, 0), q(-11, -6)], (x, y) => {
    const X = x - HC, Y = y - HC, s = X * 0.15 - Y * 0.9;
    if (X < -8 || (X < -6 && Y > 4)) return (x + y) % 4 === 0 ? '5' : '2';
    if ((x * 3 + y * 7) % 13 === 0) return s > 4 ? 'A' : '2';
    return s > 5 ? 'a' : s < -6 ? '2' : 'A';
  });
  gline(T, ...q(-11, 1), ...q(-9, 7), '2'); gline(T, ...q(-4, 9), ...q(5, 9), '2');
  // a sewn seam down the back and a darker patch stitched on
  gline(T, ...q(-4, -11), ...q(-6, 9), '5');
  for (let y = -9; y <= 7; y += 3) { const x = -4 - Math.round((y + 11) / 10); put(T, ...q(x - 1, y), 'a'); put(T, ...q(x + 1, y), '2'); }
  for (let y = -5; y <= -1; y++) for (let x = -10; x <= -7; x++) put(T, ...q(x, y), (y === -5 || x === -10) ? 'r' : '5');
  // the rope tie round the neck
  for (let x = -6; x <= 6; x++) { put(T, ...q(x, 9), x % 2 ? 'r' : 'R'); put(T, ...q(x, 10), x % 2 ? 'R' : 'r'); }
  put(T, ...q(-7, 11), 'r'); put(T, ...q(-8, 12), 'R');
  // THE CARVED FACE: angry triangle eyes, a hole of a nose, a jagged grin; the carving is rimmed dark, the light is inside
  const E = o.eyes || 'glow';
  const lit = k => (E === 'dark' ? 'q' : E === 'dim' ? (k === '9' || k === 'e' ? 'E' : k === 'E' ? 'F' : k) : E === 'flare' ? (k === 'e' ? '9' : k === 'E' ? 'e' : k) : k);
  const face = (x, y, rows) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') put(T, ...q(x + i, y + j), lit(r[i])); });
  face(2, -7, ['......qq', '....qqEq', '..qqEeeq', '.qEee9eq', 'qEe999eq', 'qqqqqqqq']);
  face(-5, -7, ['q.....', 'qEq...', 'qeeEqq', 'qe99eq', 'q999Eq', 'qqqqqq']);
  face(0, 0, ['.q', 'qE', 'qq']);
  if (o.mouth === 'wide') face(-3, 3, ['..qqqqqq..', '.qEe.eEqq.', 'qEe9e9eEq.', 'qEe999eEq.', 'qEe9e9eEq.', '.qEeeeEq..', '..qqqqq...']);
  else face(-4, 3, ['q..........q', 'qEq.qq.qq.Eq', '.qEqEeqEeqEq', '.qe9ee9e9eq.', '..qEqqEqqq..', '...q..q.....']);
  if (E === 'flare') for (const [x, y] of [[5, -8], [7, -7], [8, -6], [-4, -8], [-5, -7]]) put(T, ...q(x, y), 'e');
  if (o.crown !== 'off') crownDraw(T, HC - 1, HC - 12);
  return T;
}
function kingHead(G, hd, o) { paste(G, kingHeadGrid(o), [HC, HC], hd, o.ha || 0); }
const kneck = (hd, ha) => { const a = (ha || 0) * Math.PI / 180; return [hd[0] - Math.sin(a) * 10, hd[1] + Math.cos(a) * 10]; };

// THE SCYTHE: an ash haft with a peg grip, an iron collar and a long curved blade, more rust than steel, its edge bright
function scythe(G, hand, deg, len, bdeg, blen, side) {
  limb(G, pt(hand, deg, -9), pt(hand, deg, len), 3, ['L', 'l', 'l']);
  const peg = pt(hand, deg, len * 0.42), pd = deg + 90;
  limb(G, peg, pt(peg, pd, side * 4), 1.8, ['L', 'L', 'l']);
  const root = pt(hand, deg, len), curl = blen * 0.2;
  rpoly(G, root, bdeg, (() => { const up = [], dn = []; for (let i = 0; i <= 10; i++) { const t = i / 10, sc = side * curl * t * t, w = 6.4 * (1 - t) + 0.8; up.push([t * blen - 1, sc - w / 2]); dn.push([t * blen - 1, sc + w / 2]); } dn.push([blen + 1, side * curl * 1.1]); return up.concat(dn.reverse()); })(),
    (d, s) => { const t = Math.max(0, Math.min(1, d / blen)), sc = side * curl * t * t, w = 6.4 * (1 - t) + 0.8, rel = (s - sc) * side, k = Math.floor(d);
      if (rel > w / 2 - 1) return 'x';
      if (rel < -w / 2 + 1) return (k * 5) % 7 < 3 ? 'm' : 'M';
      return (k * 7) % 9 === 4 || (k * 3) % 11 === 2 ? 'm' : 'X'; });
  limb(G, root, root, 3.6, ['I', 'J', 'J']);
}
// THE PITCHFORK: a haft, an iron ferrule, a crossbar and three tines
function fork(G, hand, deg, len) {
  limb(G, pt(hand, deg, -13), pt(hand, deg, len), 2.2, ['L', 'l', 'l']);
  const e = pt(hand, deg, len), pd = deg + 90;
  limb(G, pt(e, pd, -4), pt(e, pd, 4), 2, ['I', 'J', 'J']);
  for (const s of [-3.5, 0, 3.5]) { const b = pt(e, pd, s); gline(G, ...b, ...pt(b, deg, 7), 'X'); put(G, ...pt(b, deg, 7), 'x'); put(G, ...pt(b, deg, 8), 'x'); }
}
// THE LANTERN, hung from the hand by its bail: an iron cap and base, a glass full of flame
function lantern(G, hd) {
  const [x, y] = [Math.round(hd[0]), Math.round(hd[1])];
  gline(G, x - 2, y + 2, x, y, 'J'); gline(G, x + 2, y + 2, x, y, 'J');
  for (let dx = -3; dx <= 3; dx++) put(G, x + dx, y + 3, dx === -3 || dx === 3 ? 'I' : 'J');
  for (let yy = y + 4; yy <= y + 11; yy++) for (let dx = -3; dx <= 3; dx++) {
    const e = Math.abs(dx) === 3, core = Math.abs(dx) <= 1 && yy >= y + 6 && yy <= y + 9;
    put(G, x + dx, yy, e ? 'I' : core ? (yy >= y + 8 ? '9' : 'e') : (yy === y + 4 ? 'E' : 'e'));
  }
  put(G, x, y + 6, 'E'); put(G, x, y + 5, 'F');
  for (let dx = -4; dx <= 4; dx++) put(G, x + dx, y + 12, dx === 0 ? 'J' : 'I');
  put(G, x, y + 13, 'I');
}
// A BALE: straw, two twine bands; burst, it has lost a corner and strands stick out of the break
function bale(G, x, y, w, h, burst) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    if (burst && xx + yy * 1.3 > w + h - 7) continue;
    put(G, x + xx, y + yy, yy === 0 ? 'y' : yy === h - 1 ? 'Z' : ((xx * 3 + yy) % 5 === 0 ? 'Z' : xx === 0 ? 'Y' : (xx + yy) % 4 === 0 ? 'y' : 'Y'));
  }
  for (const bx of [Math.round(w * 0.25), Math.round(w * 0.7)]) for (let yy = 0; yy < h; yy++) if (!(burst && bx + yy * 1.3 > w + h - 7)) put(G, x + bx, y + yy, 'R');
}
// FIRE: a tongue of flame h tall, red at the rim to white at the heart
function flame(G, x, y, h, lean) {
  for (let r = 0; r <= h; r++) {
    const f = r / h, hw = f < 0.35 ? 1.2 + f * 6 : (1 - f) * 5.2, cx = x + lean * f * f * 3 + Math.sin(r * 1.3) * 0.6 * f;
    for (let dx = -Math.ceil(hw); dx <= Math.ceil(hw); dx++) {
      const e = Math.abs(dx) / Math.max(0.8, hw);
      if (e > 1.05) continue;
      put(G, cx + dx, y - r, e > 0.75 ? 'F' : e > 0.45 ? 'E' : (f < 0.45 && e < 0.3 ? '9' : 'e'));
    }
  }
}
// A VINE COILED round the stretch a..b: r out from it, `turns` times; the front of each turn lit, the back dark
function coil(G, a, b, r, turns, phase) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, N = Math.max(8, Math.round(L * 1.5));
  let prev = null;
  for (let i = 0; i <= N; i++) {
    const t = i / N, ph = t * turns * Math.PI * 2 + (phase || 0), o = Math.sin(ph) * r, p = [a[0] + dx * t + nx * o, a[1] + dy * t + ny * o];
    if (prev) limb(G, prev, p, 2.6, Math.cos(ph) > 0 ? ['6', '7', '8'] : ['v', 'v', '6']);
    prev = p;
  }
}
function vine(G, pts) {
  for (let i = 1; i < pts.length; i++) limb(G, pts[i - 1], pts[i], 2.6, ['v', '6', '7']);
  for (let i = 1; i < pts.length; i++) { const m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; put(G, m[0] - 2, m[1] - 1, '6'); put(G, m[0] - 3, m[1] - 2, '7'); put(G, m[0] + 1, m[1], '8'); }
}

export function bakeStrawKing() {
  const W = 110, H = 94, X = 50, FL = H - 3;
  // A LEG: a bundle of straw bound at the knee and the ankle, ending in a split wooden stake
  const leg = (G, hip, knee, foot, near, pose) => {
    const R = near ? STRAW : STRAW_F, ank = pose === 'kneel' ? [foot[0] + 5, foot[1] - 1] : [foot[0], foot[1] - 6];
    limb(G, hip, knee, 5.6, R);
    limb(G, knee, ank, 4.6, R);
    for (const [p, q2] of [[hip, knee], [knee, ank]]) { const L = Math.hypot(q2[0] - p[0], q2[1] - p[1]) || 1; for (let k = 2; k < L - 1; k += 3) put(G, p[0] + (q2[0] - p[0]) * k / L - 1, p[1] + (q2[1] - p[1]) * k / L, near ? 'Z' : 'Z'); }
    const band = (c, a) => { const nx = Math.cos(a), ny = Math.sin(a); limb(G, [c[0] - nx * 2.6, c[1] - ny * 2.6], [c[0] + nx * 2.6, c[1] + ny * 2.6], 1.6, ['R', 'r', 'r']); };
    const aK = Math.atan2(ank[1] - knee[1], ank[0] - knee[0]) + Math.PI / 2;
    band(knee, aK); band([knee[0] + (ank[0] - knee[0]) * 0.8, knee[1] + (ank[1] - knee[1]) * 0.8], aK);
    put(G, knee[0] - 3, knee[1] - 2, 'y'); put(G, knee[0] + 3, knee[1] + 2, 'y');
    if (pose === 'kneel') { limb(G, ank, [foot[0] - 1, foot[1] - 1], 2.2, TWIG); limb(G, ank, [foot[0] - 1, foot[1] + 1], 2.2, TWIG); return; }
    if (pose === 'point') { limb(G, ank, [foot[0], foot[1]], 2.4, near ? TWIG : ['u', 'T', 'T']); return; }
    limb(G, ank, [foot[0] - 2, foot[1]], 2.2, near ? TWIG : ['u', 'T', 'T']);
    limb(G, ank, [foot[0] + 3, foot[1]], 2.2, near ? TWIG : ['u', 'T', 'T']);
    put(G, ank[0] - 3, ank[1] - 1, 'y'); put(G, ank[0] + 3, ank[1] - 1, 'Y');
  };
  // AN ARM: a crimson sleeve to a ragged cuff with straw bursting from it, a straw forearm bound at the wrist, twig fingers
  const arm = (G, sh, el, hd, near, hand) => {
    limb(G, sh, el, 5.4, near ? COAT : COAT_F);
    limb(G, el, hd, 3.4, near ? STRAW : STRAW_F);
    const a = Math.atan2(hd[1] - el[1], hd[0] - el[0]), cf = [el[0] + Math.cos(a) * 1.5, el[1] + Math.sin(a) * 1.5];
    limb(G, cf, cf, 5.6, near ? ['d', 'C', 'C'] : ['d', 'd', 'C']);
    for (const k of [-1, 0, 1]) { const b = a + k * 0.7; gline(G, cf[0] + Math.cos(b) * 3, cf[1] + Math.sin(b) * 3, cf[0] + Math.cos(b) * 5, cf[1] + Math.sin(b) * 5, near ? 'y' : 'Y'); }
    const wr = [hd[0] - Math.cos(a) * 2, hd[1] - Math.sin(a) * 2];
    put(G, wr[0], wr[1], 'r'); put(G, wr[0] - Math.sin(a), wr[1] + Math.cos(a), 'R');
    limb(G, hd, hd, 3.2, near ? TWIG : ['u', 'T', 'T']);
    if (hand === 'fist') { gline(G, hd[0], hd[1], hd[0] + Math.cos(a + 1.4) * 3, hd[1] + Math.sin(a + 1.4) * 3, 'T'); return; }
    const fingers = hand === 'droop' ? [1.2, 1.5, 1.8, 1.1].map(k => Math.PI / 2 + (k - 1.45) * 0.8 - a) : [-0.8, -0.28, 0.22, 0.7];
    fingers.forEach((k, i) => { const b = a + k, len = i === 3 ? 4 : 6; const m = [hd[0] + Math.cos(b) * len * 0.6, hd[1] + Math.sin(b) * len * 0.6];
      gline(G, hd[0], hd[1], m[0], m[1], near ? 'T' : 'u'); gline(G, m[0], m[1], m[0] + Math.cos(b + 0.4) * len * 0.5, m[1] + Math.sin(b + 0.4) * len * 0.5, near ? 't' : 'T'); });
  };
  // THE COAT: shoulders to the knee, a gold-trimmed front, ochre patches, frayed hem with straw poking out under it
  const coat = (G, c, hip, hem, lean, sw) => {
    const L = hip[0] + lean;
    const pts = [[c[0] - 8, c[1] - 8], [c[0] + 6, c[1] - 9], [c[0] + 10, c[1] - 2], [hip[0] + 9, hip[1]], [L + 13 + sw, hem - 2], [L + 10, hem + 1], [L + 7, hem - 1], [L + 4, hem + 2], [L, hem], [L - 4, hem + 3], [L - 8, hem], [L - 13 - sw, hem + 1], [hip[0] - 9, hip[1]], [c[0] - 10, c[1] - 1]];
    gpoly(G, pts, (x, y) => { const mid = c[0] + (L - c[0]) * Math.max(0, Math.min(1, (y - c[1]) / Math.max(1, hem - c[1]))); const f = x - mid;
      return f > 4 ? 'c' : f < -5 ? 'd' : ((x * 7 + y * 5) % 23 === 0 ? 'd' : 'C'); });
    gline(G, c[0] + 6, c[1] - 8, L + 12 + sw, hem - 2, i => (i % 6 === 3 ? 'P' : 'p'));
    const patch = (px0, py0, w, h) => { for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) { const row = G[py0 + yy]; if (!row || row[px0 + xx] === '.' || row[px0 + xx] === undefined) continue; row[px0 + xx] = (yy === 0 || xx === 0) ? 'P' : (xx + yy) % 3 === 0 ? 'P' : 'p'; } };
    patch(Math.round(hip[0] - 7 + lean * 0.3), Math.round(hip[1] + 4), 5, 4); patch(Math.round(c[0] - 8), Math.round(c[1] - 3), 3, 5); patch(Math.round(L + 5), Math.round(hem - 7), 4, 3);
    for (let x = Math.round(L - 13 - sw); x <= L + 13 + sw; x += 3) if (G[Math.round(hem)] && G[Math.round(hem)][x] !== '.') { put(G, x, hem + 2, (x % 2) ? 'y' : 'Y'); put(G, x, hem + 3, 'Y'); }
    gpoly(G, [[c[0] - 8, c[1] - 8], [c[0] - 7, c[1] - 14], [c[0] - 2, c[1] - 11], [c[0] + 2, c[1] - 8]], (x, y) => (y < c[1] - 12 ? 'p' : 'C'));
    for (const [sx, dir] of [[c[0] + 7, -0.9], [c[0] - 9, -2.3]]) for (const k of [-0.4, 0, 0.4]) gline(G, sx, c[1] - 8, sx + Math.cos(dir + k) * 4, c[1] - 8 + Math.sin(dir + k) * 4, 'y');
  };
  // THE CAGE CHEST: a gap in the coat over a lattice of lashed sticks, straw stuffed behind them and spilling out
  const cage = (G, c, hip) => {
    const top = c[1] - 7, bot = hip[1] - 2;
    const pts = [[c[0], top], [c[0] + 8, top], [c[0] + 9, c[1] + 2], [hip[0] + 8, bot], [hip[0] + 1, bot], [c[0] - 1, c[1] + 2]];
    gpoly(G, pts, (x, y) => ((x + y) % 3 === 0 ? 'u' : (x * 5 + y) % 4 === 0 ? 'Z' : 'Y'));
    const edge = y => { const t = (y - top) / Math.max(1, bot - top); return [c[0] - 1 + (hip[0] + 1 - c[0] + 1) * t, c[0] + 9 + (hip[0] + 8 - c[0] - 9) * t]; };
    for (let y = top + 1; y < bot; y += 3) { const [l, r] = edge(y); gline(G, l - 1, y, r + 1, y + 1, 't'); gline(G, l, y + 1, r, y + 2, 'T'); }
    const [lt, rt] = edge(top), [lb, rb] = edge(bot);
    gline(G, (lt + rt) / 2, top - 1, (lb + rb) / 2, bot + 1, 'T');
    for (let y = top + 1; y < bot; y += 3) { const [l, r] = edge(y); put(G, (l + r) / 2, y, 'r'); put(G, (l + r) / 2 + 1, y + 1, 'R'); }
    for (let y = top + 2; y < bot; y += 3) { const [, r] = edge(y); gline(G, r + 1, y, r + 3, y - 1 + (y % 2), 'y'); }
  };
  // THE BELT: a rope, and what hangs from it
  const belt = (G, hip, lean) => {
    const y0 = hip[1] - 1;
    for (let x = -10; x <= 9; x++) { put(G, hip[0] + x, y0 - Math.round(x * 0.1), x % 2 ? 'r' : 'R'); put(G, hip[0] + x, y0 + 1 - Math.round(x * 0.1), x % 2 ? 'R' : 'r'); }
    stamp(G, hip[0] - 7, y0 + 2, CROW_DEAD); stamp(G, hip[0] - 1, y0 + 2, HUSK); stamp(G, hip[0] + 5 + lean, y0 + 1, CROW_DEAD);
  };
  // THE CLOAK OF SACKING, behind everything: off the shoulders to the shins, torn into holes and tatters
  const cloak = (G, c, hip, sw, hemY) => {
    const back = hip[0] - 15 - sw * 2, fx = hip[0] + 4;
    const pts = [[c[0] + 2, c[1] - 10], [c[0] - 9, c[1] - 9], [c[0] - 14 - sw, c[1] + 6], [back, hemY - 6]];
    const n = 9; for (let i = 1; i < n; i++) { const t = i / n; pts.push([back + (fx - back) * t, hemY + (i % 2 ? 2 : -3) - (i === 4 ? 6 : 0)]); }
    pts.push([fx, hemY - 4], [c[0] + 4, c[1]]);
    gpoly(G, pts, (x, y) => (y > hemY - 2 ? 'j' : ((x * 3 + y) % 17 === 0 ? 'j' : (x + (y >> 2)) % 7 === 0 ? 'k' : (y % 9 === 0 ? 'j' : 'K'))));
    for (const [dx, dy] of [[5, -12], [6, -12], [6, -11], [10, -24], [3, -3]]) put(G, back + dx, hemY + dy, '.');
  };

  const frame = o => {
    const G = blank(W, H), c = o.chest, hip = o.hip, hd = o.head;
    const shN = [c[0] + 6, c[1] - 7], shF = [c[0] - 6, c[1] - 8];
    if (!o.noBody) {
      layer(G, g => cloak(g, c, hip, o.sw || 0, o.cloakHem !== undefined ? o.cloakHem : FL - 9));
      if (o.floorScythe) layer(G, g => scythe(g, ...o.floorScythe));
      if (o.scytheF) layer(G, g => scythe(g, ...o.scytheF));
      if (o.balePre) layer(G, g => bale(g, ...o.balePre));
      if (o.coilFar) layer(G, g => o.coilFar(g));
      layer(G, g => arm(g, shF, o.far.el, o.far.hd, false, o.far.hand || 'open'));
      if (o.planted) layer(G, g => scythe(g, ...o.planted));
      layer(G, g => leg(g, [hip[0] - 3, hip[1]], o.legs.far[0], o.legs.far[1], false, o.pose));
      layer(G, g => leg(g, [hip[0] + 3, hip[1] + 1], o.legs.near[0], o.legs.near[1], true, o.pose));
      layer(G, g => coat(g, c, hip, o.hem !== undefined ? o.hem : FL - 15, o.lean || 0, o.sw || 0));
      layer(G, g => cage(g, c, hip));
      layer(G, g => belt(g, hip, o.lean || 0));
      layer(G, g => limb(g, [c[0] + 1, c[1] - 6], kneck(hd, o.ha), 3, TWIG));
    }
    if (o.pre) o.pre(G);
    layer(G, g => kingHead(g, hd, o));
    if (o.crownFloor) layer(G, g => { const T = blank(30, 30); crownDraw(T, 15, 20); paste(g, T, [15, 17], o.crownFloor[0], o.crownFloor[1]); });
    if (o.bale) layer(G, g => bale(g, ...o.bale));
    if (o.scytheN) layer(G, g => scythe(g, ...o.scytheN));
    if (o.forkN) layer(G, g => fork(g, ...o.forkN));
    if (!o.noBody && o.near) layer(G, g => arm(g, shN, o.near.el, o.near.hd, true, o.near.hand || 'open'));
    if (o.lantern) layer(G, g => lantern(g, o.lantern));
    if (o.post) layer(G, g => o.post(g));
    if (o.fx) for (const [x, y, rows] of o.fx) stamp(G, x, y, rows);
    for (let y = FL + 1; y < H; y++) G[y].fill('.');
    const cv = outline(fromGrid(rowsOf(G), KP, 1), OUT);
    if (o.smear) smearE(cv, ...o.smear, ['#fff4c4', '#ffd36b', '#ff9a5c']);
    return cv;
  };

  const STAND = { near: [[X + 5, FL - 16], [X + 6, FL]], far: [[X - 4, FL - 16], [X - 5, FL]] };
  const WIDE = { near: [[X + 9, FL - 15], [X + 13, FL]], far: [[X - 7, FL - 15], [X - 12, FL]] };
  const idleA = frame({ chest: [X + 1, FL - 46], hip: [X, FL - 31], head: [X + 3, FL - 64], ha: 4, legs: STAND,
    near: { el: [X + 12, FL - 40], hd: [X + 14, FL - 28], hand: 'fist' }, far: { el: [X - 10, FL - 40], hd: [X - 11, FL - 28] },
    scytheN: [[X + 14, FL - 28], -84, 44, 16, 22, 1] });
  const idleB = frame({ chest: [X, FL - 45], hip: [X, FL - 31], head: [X + 1, FL - 63], ha: -5, sw: 2, legs: STAND,
    near: { el: [X + 11, FL - 39], hd: [X + 13, FL - 27], hand: 'fist' }, far: { el: [X - 11, FL - 39], hd: [X - 13, FL - 28] },
    scytheN: [[X + 13, FL - 27], -88, 44, 12, 22, 1],
    post: g => { for (const [x, y, x2, y2] of [[X - 9, FL - 57, X - 12, FL - 63], [X - 6, FL - 58, X - 7, FL - 65], [X + 9, FL - 57, X + 12, FL - 63], [X - 14, FL - 36, X - 17, FL - 41]]) gline(g, x, y, x2, y2, 'y'); } });
  const walkA = frame({ chest: [X + 3, FL - 45], hip: [X + 1, FL - 30], head: [X + 6, FL - 63], ha: 9, lean: 2, sw: 3,
    legs: { near: [[X + 10, FL - 15], [X + 13, FL]], far: [[X - 5, FL - 14], [X - 11, FL]] },
    near: { el: [X + 13, FL - 39], hd: [X + 17, FL - 28], hand: 'fist' }, far: { el: [X - 8, FL - 39], hd: [X - 13, FL - 30] },
    scytheN: [[X + 17, FL - 28], -72, 42, 14, 22, 1] });
  const walkB = frame({ chest: [X + 2, FL - 47], hip: [X + 1, FL - 32], head: [X + 4, FL - 65], ha: -3, sw: 1,
    legs: { near: [[X + 4, FL - 17], [X + 2, FL]], far: [[X + 1, FL - 16], [X + 3, FL]] },
    near: { el: [X + 12, FL - 41], hd: [X + 14, FL - 29], hand: 'fist' }, far: { el: [X - 8, FL - 41], hd: [X - 7, FL - 29] },
    scytheN: [[X + 14, FL - 29], -80, 42, 16, 22, 1] });
  const sweepTell = frame({ chest: [X - 3, FL - 44], hip: [X, FL - 30], head: [X - 2, FL - 61], ha: -12, eyes: 'flare', sw: 3, lean: -2, legs: WIDE,
    near: { el: [X - 1, FL - 34], hd: [X - 10, FL - 25], hand: 'fist' }, far: { el: [X - 11, FL - 36], hd: [X - 17, FL - 24], hand: 'fist' },
    scytheN: [[X - 10, FL - 25], 170, 17, 186, 20, -1] });
  const sweep = frame({ chest: [X + 6, FL - 42], hip: [X + 3, FL - 29], head: [X + 11, FL - 59], ha: 14, eyes: 'flare', mouth: 'wide', lean: 3, sw: 4,
    legs: { near: [[X + 14, FL - 14], [X + 19, FL]], far: [[X - 3, FL - 13], [X - 11, FL]] },
    near: { el: [X + 17, FL - 39], hd: [X + 23, FL - 32], hand: 'fist' }, far: { el: [X + 11, FL - 37], hd: [X + 17, FL - 30], hand: 'fist' },
    scytheN: [[X + 23, FL - 32], 42, 16, 4, 24, 1], smear: [X + 8, FL - 18, 50, 11, 12, 125] });
  const callTell = frame({ chest: [X, FL - 46], hip: [X, FL - 31], head: [X + 1, FL - 62], ha: -28, eyes: 'flare', mouth: 'wide', sw: 1, legs: STAND,
    near: { el: [X + 11, FL - 59], hd: [X + 16, FL - 73] }, far: { el: [X - 10, FL - 60], hd: [X - 15, FL - 74] },
    planted: [[X + 24, FL + 4], -90, 48, 12, 22, 1],
    fx: [[X + 10, FL - 72, CROW_PERCH], [X - 17, FL - 72, CROW_PERCH], [X + 20, FL - 84, CROW_FLY2]] });
  const call = frame({ chest: [X + 3, FL - 45], hip: [X + 1, FL - 31], head: [X + 7, FL - 62], ha: 12, eyes: 'flare', mouth: 'wide', lean: 2, sw: 2, legs: WIDE,
    near: { el: [X + 15, FL - 50], hd: [X + 27, FL - 49] }, far: { el: [X + 9, FL - 50], hd: [X + 21, FL - 46] },
    planted: [[X - 22, FL + 4], -94, 48, -90, 22, -1],
    fx: [[X + 32, FL - 64, CROW_FLY], [X + 42, FL - 54, CROW_FLY2], [X + 36, FL - 78, CROW_FLY], [X + 46, FL - 70, CROW_FLY2]] });
  const forkTell = frame({ chest: [X - 2, FL - 45], hip: [X, FL - 31], head: [X, FL - 62], ha: -8, eyes: 'flare', sw: 2, lean: -1, legs: WIDE,
    near: { el: [X - 5, FL - 57], hd: [X - 11, FL - 64], hand: 'fist' }, far: { el: [X - 2, FL - 40], hd: [X + 5, FL - 31], hand: 'fist' },
    scytheF: [[X + 5, FL - 31], 64, 18, 8, 20, 1], forkN: [[X - 11, FL - 64], -8, 32] });
  const forkThrow = frame({ chest: [X + 5, FL - 44], hip: [X + 2, FL - 30], head: [X + 10, FL - 60], ha: 12, mouth: 'wide', lean: 3, sw: 4,
    legs: { near: [[X + 13, FL - 14], [X + 17, FL]], far: [[X - 3, FL - 13], [X - 10, FL]] },
    near: { el: [X + 17, FL - 53], hd: [X + 29, FL - 54] }, far: { el: [X + 1, FL - 38], hd: [X + 6, FL - 29], hand: 'fist' },
    scytheF: [[X + 6, FL - 29], 64, 18, 8, 20, 1] });
  const lashed = frame({ chest: [X, FL - 47], hip: [X, FL - 31], head: [X + 5, FL - 60], ha: 38, eyes: 'dim', legs: { near: [[X + 1, FL - 16], [X + 1, FL]], far: [[X - 1, FL - 16], [X - 1, FL]] }, pose: 'point',
    near: { el: [X + 18, FL - 54], hd: [X + 31, FL - 54], hand: 'droop' }, far: { el: [X - 17, FL - 55], hd: [X - 30, FL - 55], hand: 'droop' }, hem: FL - 14, cloakHem: FL - 7 });
  const slump = frame({ chest: [X + 4, FL - 25], hip: [X - 3, FL - 12], head: [X + 15, FL - 26], ha: 68, eyes: 'dim', hem: FL - 1, cloakHem: FL, pose: 'kneel',
    legs: { near: [[X + 6, FL - 2], [X - 8, FL - 1]], far: [[X, FL - 2], [X - 14, FL - 1]] },
    near: { el: [X + 13, FL - 14], hd: [X + 18, FL - 2] }, far: { el: [X + 3, FL - 12], hd: [X + 7, FL - 1] },
    floorScythe: [[X + 10, FL - 2], 0, 26, -6, 20, -1],
    post: g => spray(g, X, FL - 14, 14, 180, 360, 10, 17, 11, ['y', 'Y']) });
  const tangled = frame({ chest: [X - 1, FL - 46], hip: [X, FL - 31], head: [X - 3, FL - 62], ha: -24, eyes: 'flare', mouth: 'wide', lean: -2, sw: 2,
    legs: { near: [[X + 4, FL - 16], [X + 4, FL]], far: [[X - 3, FL - 16], [X - 4, FL]] },
    near: { el: [X + 13, FL - 38], hd: [X + 21, FL - 23] }, far: { el: [X - 11, FL - 58], hd: [X - 15, FL - 71] },
    floorScythe: [[X - 40, FL - 2], 0, 24, -4, 18, -1],
    post: g => {
      coil(g, [X + 3, FL - 30], [X + 5, FL - 2], 3.2, 2.5, 0);
      coil(g, [X - 10, FL - 50], [X + 11, FL - 42], 3.5, 2, 1);
      coil(g, [X + 13, FL - 38], [X + 21, FL - 24], 2.6, 1.5, 0.5);
      vine(g, [[X + 34, FL], [X + 31, FL - 8], [X + 26, FL - 15], [X + 21, FL - 22]]);
      vine(g, [[X - 20, FL], [X - 17, FL - 7], [X - 11, FL - 12], [X - 5, FL - 20]]);
      vine(g, [[X + 11, FL - 42], [X + 18, FL - 44], [X + 24, FL - 40]]);
      for (const [x, y] of [[X + 37, FL - 2], [X - 23, FL - 2], [X + 27, FL - 41]]) { put(g, x, y, '7'); put(g, x + 1, y - 1, '8'); }
    } });
  const rebuild = frame({ chest: [X + 4, FL - 38], hip: [X, FL - 26], head: [X + 10, FL - 53], ha: 26, eyes: 'flare', lean: 3, sw: 2, hem: FL - 9, cloakHem: FL - 4,
    legs: { near: [[X + 9, FL - 12], [X + 8, FL]], far: [[X - 5, FL - 11], [X - 9, FL]] },
    near: { el: [X + 15, FL - 35], hd: [X + 9, FL - 40], hand: 'fist' }, far: { el: [X + 10, FL - 24], hd: [X + 18, FL - 18], hand: 'fist' },
    balePre: [X + 15, FL - 17, 14, 9, true],
    post: g => { spray(g, X + 24, FL - 14, 16, 200, 400, 4, 12, 7, ['y', 'Y', 'Z']); spray(g, X + 9, FL - 40, 12, 180, 360, 3, 9, 5, ['y', 'Y']); gline(g, X + 9, FL - 40, X + 5, FL - 37, 'y'); gline(g, X + 10, FL - 41, X + 6, FL - 39, 'Y'); } });
  const slamTell = frame({ chest: [X - 1, FL - 46], hip: [X, FL - 31], head: [X - 2, FL - 60], ha: -30, eyes: 'flare', mouth: 'wide', sw: 1, legs: WIDE,
    near: { el: [X + 11, FL - 64], hd: [X + 12, FL - 80], hand: 'fist' }, far: { el: [X - 5, FL - 66], hd: [X - 2, FL - 81], hand: 'fist' },
    bale: [X - 3, FL - 89, 17, 10, false] });
  const slam = frame({ chest: [X + 8, FL - 33], hip: [X + 2, FL - 24], head: [X + 16, FL - 45], ha: 36, eyes: 'flare', mouth: 'wide', lean: 4, sw: 3, hem: FL - 7, cloakHem: FL - 3,
    legs: { near: [[X + 11, FL - 10], [X + 11, FL]], far: [[X - 6, FL - 9], [X - 12, FL]] },
    near: { el: [X + 20, FL - 24], hd: [X + 27, FL - 3], hand: 'fist' }, far: { el: [X + 15, FL - 22], hd: [X + 22, FL - 3], hand: 'fist' },
    post: g => { spray(g, X + 25, FL - 3, 30, 180, 360, 5, 16, 3, ['y', 'Y', 'Z']); for (const [x, y] of [[X + 12, FL - 1], [X + 33, FL - 1]]) bale(g, x, y - 2, 4, 3, false); } });
  const lanternTell = frame({ chest: [X, FL - 46], hip: [X, FL - 31], head: [X + 2, FL - 62], ha: -20, eyes: 'flare', sw: 1, legs: STAND,
    near: { el: [X + 13, FL - 60], hd: [X + 16, FL - 77], hand: 'fist' }, far: { el: [X - 10, FL - 40], hd: [X - 11, FL - 28], hand: 'fist' },
    scytheF: [[X - 11, FL - 28], -96, 42, -164, 22, -1], lantern: [X + 16, FL - 77] });
  const lanternThrow = frame({ chest: [X + 6, FL - 44], hip: [X + 2, FL - 30], head: [X + 11, FL - 60], ha: 12, mouth: 'wide', lean: 3, sw: 4,
    legs: { near: [[X + 13, FL - 14], [X + 17, FL]], far: [[X - 3, FL - 13], [X - 10, FL]] },
    near: { el: [X + 19, FL - 50], hd: [X + 31, FL - 47] }, far: { el: [X - 4, FL - 38], hd: [X - 9, FL - 28], hand: 'fist' },
    scytheF: [[X - 9, FL - 28], -100, 42, -164, 22, -1] });
  const ablaze = frame({ chest: [X - 2, FL - 46], hip: [X, FL - 31], head: [X - 3, FL - 62], ha: -32, eyes: 'flare', mouth: 'wide', sw: 3, lean: -1, legs: WIDE,
    near: { el: [X + 12, FL - 58], hd: [X + 22, FL - 67] }, far: { el: [X - 13, FL - 49], hd: [X - 23, FL - 56] },
    post: g => {
      for (const [x, y, h, l] of [[X + 3, FL - 38, 12, 0.3], [X + 7, FL - 32, 9, -0.2], [X + 1, FL - 46, 10, -0.5], [X + 12, FL - 58, 9, 0.2], [X + 17, FL - 62, 10, -0.3], [X + 22, FL - 67, 8, 0.4], [X + 7, FL - 48, 7, 0.6], [X - 8, FL - 20, 6, 0]]) flame(g, x, y, h, l);
      for (const [x, y] of [[X + 8, FL - 62], [X - 2, FL - 60], [X + 20, FL - 80], [X + 26, FL - 76], [X + 13, FL - 72], [X - 6, FL - 36]]) put(g, x, y, (x + y) % 2 ? 'e' : 'E');
    } });
  const dead = frame({ noBody: true, chest: [X, FL - 20], hip: [X, FL - 10], head: [X + 2, FL - 20], ha: 84, eyes: 'dark', crown: 'off',
    crownFloor: [[X + 32, FL - 3], 16],
    pre: g => {
      layer(g, t => scythe(t, [X - 40, FL - 2], 0, 22, 2, 18, -1));
      layer(g, t => { limb(t, [X - 26, FL - 3], [X - 14, FL - 4], 4.4, STRAW_F); limb(t, [X - 34, FL - 1], [X - 26, FL - 3], 2.2, TWIG); limb(t, [X - 22, FL - 1], [X - 12, FL - 2], 4, STRAW); limb(t, [X - 30, FL], [X - 22, FL - 1], 2.2, TWIG); });
      layer(g, t => gpoly(t, [[X - 20, FL + 1], [X - 16, FL - 7], [X - 7, FL - 11], [X + 6, FL - 12], [X + 15, FL - 8], [X + 22, FL + 1]], (x, y) => ((x * 7 + y * 3) % 13 === 0 ? 'd' : y > FL - 4 ? 'd' : x > X + 6 ? 'c' : 'C')));
      layer(g, t => { for (let yy = FL - 9; yy <= FL - 6; yy++) for (let xx = X - 8; xx <= X - 4; xx++) put(t, xx, yy, (yy === FL - 9 || xx === X - 8) ? 'P' : 'p'); gline(t, X - 14, FL - 3, X + 18, FL - 5, i => (i % 2 ? 'r' : 'R')); stamp(t, X + 10, FL - 6, ['bbbB.', '.bbbbP']); });
      layer(g, t => { limb(t, [X + 12, FL - 4], [X + 24, FL - 2], 3.2, STRAW); for (const k of [-0.5, 0, 0.5]) gline(t, X + 24, FL - 2, X + 24 + Math.cos(k) * 5, FL - 2 + Math.sin(k) * 3, 'T'); });
      spray(g, X, FL - 6, 26, 170, 370, 12, 22, 21, ['y', 'Y', 'Z']);
    },
    post: g => {
      for (const [x, y] of [[X - 4, FL - 12], [X + 8, FL - 11], [X - 12, FL - 6]]) { put(g, x, y, 'F'); put(g, x + 1, y, 'E'); }
      for (const [sx, sy, n] of [[X - 6, FL - 22, 14], [X + 9, FL - 30, 12], [X - 14, FL - 12, 9]]) for (let i = 0; i < n; i++) put(g, sx + Math.round(Math.sin(i * 0.7) * 2), sy - i, i % 3 === 2 ? '.' : i > n * 0.6 ? '3' : 'S');
    } });
  const hurt = frame({ chest: [X - 4, FL - 45], hip: [X - 1, FL - 31], head: [X - 5, FL - 61], ha: -26, eyes: 'flare', mouth: 'wide', lean: -3, sw: 4,
    legs: { near: [[X + 4, FL - 15], [X + 7, FL]], far: [[X - 6, FL - 15], [X - 9, FL]] },
    near: { el: [X + 6, FL - 48], hd: [X + 14, FL - 52], hand: 'fist' }, far: { el: [X - 14, FL - 47], hd: [X - 22, FL - 52] },
    scytheN: [[X + 14, FL - 52], -135, 24, -30, 20, 1],
    post: g => spray(g, X + 4, FL - 42, 26, -70, 70, 7, 20, 9, ['y', 'Y', 'y']) });
  const frames = [idleA, idleB, walkA, walkB, sweepTell, sweep, callTell, call, forkTell, forkThrow, lashed, slump, tangled, rebuild,
    slamTell, slam, lanternTell, lanternThrow, ablaze, dead, hurt];
  return pack(frames, X + 1, FL + 2, 26, 60);
}
// the names the runtime reads frames by, in the order bakeStrawKing packs them
export const STRAWKING_F = { idle: 0, idleB: 1, walk: [2, 3], sweepTell: 4, sweep: 5, callTell: 6, call: 7, forkTell: 8, fork: 9,
  lashed: 10, slump: 11, tangled: 12, rebuild: 13, slamTell: 14, slam: 15, lanternTell: 16, lanternThrow: 17, ablaze: 18, dead: 19, hurt: 20 };

// ---------- THE HEADLESS PLOUGHMAN ----------
// smock s/S/2; jerkin j/J/5; apron and breeches a/A; gaiters g/G; boots b/B with mud n/N; dead hands h/H; the stump's
// flesh d/D and its dark q; the pumpkin p/P/4 with its stalk t; glow 9/e/E/F; plough wood w/W/u; iron i/I/x with rust
// m/M; the goad's stick k/K; smoke z/Z
const PP = { o: OUT,
  s: '#eee2be', S: '#bea97f', 2: '#806f4e', j: '#7e4c2a', J: '#50301a', 5: '#321e10', a: '#7e5a36', A: '#4e3420',
  g: '#8a8058', G: '#585034', b: '#56402c', B: '#30241a', n: '#94785a', N: '#5e4c34', h: '#bcc0a8', H: '#80846e',
  d: '#a4503e', D: '#6a2a24', q: '#1e0e0a', p: '#f08a30', P: '#b0541c', 4: '#6a2e12', t: '#7a5430',
  9: '#fff4c4', e: '#ffd36b', E: '#ff9a5c', F: '#c8482a',
  w: '#c08c50', W: '#80582f', u: '#4a3018', i: '#c4cad0', I: '#6a7078', x: '#eef2f4', m: '#c87444', M: '#7a3e22',
  k: '#d0a672', K: '#8a6a40', z: '#dfe2ec', Z: '#9296aa' };

// the pumpkin head in its own 14x14 grid, centre (7, 7), face to the right; glow 'bright' | 'lit' | 'dim'
function pumpkinGrid(glow) {
  const T = blank(14, 14), c = 7;
  for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) {
    const dx = (x + 0.5 - c) / 5.6, dy = (y + 0.5 - c - 0.5) / 4.6;
    if (dx * dx + dy * dy > 1) continue;
    const rib = Math.abs(Math.round((x - c) * 0.9)) % 3 === 0 && x !== c + 1;
    T[y][x] = dy > 0.55 ? 'P' : (dx < -0.55 && dy > -0.3) ? 'P' : rib ? 'P' : (dx < -0.2 && dy < -0.3) ? 'p' : 'p';
  }
  put(T, 5, 3, '4'); put(T, 6, 2, 't'); put(T, 6, 1, 't'); put(T, 7, 1, 't');
  const L = glow === 'dim' ? { 9: 'E', e: 'E', E: 'F' } : glow === 'bright' ? { 9: '9', e: '9', E: 'e' } : { 9: '9', e: 'e', E: 'E' };
  for (const [x, y, k] of [[7, 6, 'e'], [8, 6, 'q'], [7, 5, 'q'], [10, 6, 'e'], [11, 6, 'E'], [10, 5, 'q'], [11, 5, 'q'], [8, 7, 'q'], [11, 7, 'q']]) put(T, x, y, k === 'q' ? 'q' : L[k]);
  put(T, 7, 6, L.e); put(T, 10, 6, L[9]);
  for (let x = 6; x <= 11; x++) { put(T, x, 9, x % 2 ? L.e : L[9]); put(T, x, 8, x === 7 || x === 10 ? 'q' : L.E); }
  put(T, 5, 8, 'q'); put(T, 12, 8, 'q'); put(T, 8, 10, 'q'); put(T, 9, 10, L.E); put(T, 10, 10, 'q');
  return T;
}

export function bakePloughman() {
  const W = 82, H = 50, X = 26, FL = H - 3;
  // the plough in its own grid: the share tip on the floor at PIV; handles back up to the grips, a beam out to a small
  // iron-shod wheel, the standard, the iron mouldboard and the rusted share, a coulter knife
  const PW = 64, PH = 44, PIV = [44, 38];
  const ploughGrid = () => {
    const T = blank(PW, PH), s = PIV[0], gy = PIV[1];
    limb(T, [s - 11, gy - 3], [s - 28, gy - 17], 2.4, ['u', 'W', 'W']);
    limb(T, [s - 9, gy - 4], [s - 26, gy - 16], 2.6, ['W', 'w', 'w']);
    limb(T, [s - 28, gy - 17], [s - 29, gy - 19], 2.2, ['u', 'u', 'W']);
    limb(T, [s - 26, gy - 16], [s - 27, gy - 18], 2.4, ['u', 'W', 'w']);
    limb(T, [s - 18, gy - 11], [s + 8, gy - 9], 3.2, ['W', 'w', 'w']);
    limb(T, [s - 5, gy - 10], [s - 6, gy - 1], 2.6, ['u', 'W', 'w']);
    limb(T, [s - 16, gy - 1], [s - 3, gy - 1], 2, ['u', 'u', 'W']);
    gpoly(T, [[s - 9, gy - 8], [s - 3, gy - 7], [s + 1, gy - 1], [s - 9, gy]], (x, y) => ((x * 3 + y) % 5 === 0 ? 'M' : y < gy - 5 ? 'i' : 'I'));
    gpoly(T, [[s - 5, gy - 3], [s + 2, gy], [s - 8, gy + 1]], (x, y) => (y >= gy ? 'x' : (x % 3 === 0 ? 'm' : 'I')));
    gline(T, s + 3, gy - 9, s + 5, gy - 2, 'I'); gline(T, s + 4, gy - 9, s + 6, gy - 3, 'i');
    for (let a = 0; a < 360; a += 12) { const r = a % 24 ? 3.6 : 3.2; put(T, s + 8 + Math.cos(a * Math.PI / 180) * 3.6, gy - 3.5 + Math.sin(a * Math.PI / 180) * 3.6, r > 3.4 ? 'I' : 'i'); }
    gline(T, s + 6, gy - 5, s + 10, gy - 2, 'W'); gline(T, s + 10, gy - 5, s + 6, gy - 2, 'W'); put(T, s + 8, gy - 4, 'u');
    for (const [x, y] of [[s - 7, gy + 1], [s - 2, gy + 1]]) put(T, x, y, 'm');
    return T;
  };
  const PLOUGH = ploughGrid();
  const leg = (G, hip, knee, foot, near) => {
    const ank = [foot[0] - 1, foot[1] - 4];
    limb(G, hip, knee, 5, near ? ['A', 'a', 'a'] : ['A', 'A', 'a']);
    limb(G, knee, ank, 4.4, near ? ['G', 'g', 'g'] : ['G', 'G', 'g']);
    const m = [(knee[0] + ank[0]) / 2, (knee[1] + ank[1]) / 2]; gline(G, m[0] - 2, m[1], m[0] + 2, m[1] - 1, 'G');
    gpoly(G, [[ank[0] - 3, ank[1] - 1], [ank[0] + 2, ank[1] - 1], [foot[0] + 5, foot[1] - 2], [foot[0] + 5, foot[1] + 1], [foot[0] - 3, foot[1] + 1]],
      (x, y) => (y >= foot[1] ? (x % 2 ? 'N' : 'n') : y >= foot[1] - 1 ? 'n' : near ? 'b' : 'B'));
  };
  const arm = (G, sh, el, hd, near, hand) => {
    limb(G, sh, el, 5, near ? ['2', 'S', 's'] : ['2', '2', 'S']);
    limb(G, el, el, 5.4, near ? ['S', 's', 's'] : ['2', 'S', 'S']);
    limb(G, el, hd, 3.4, near ? ['H', 'h', 'h'] : ['H', 'H', 'h']);
    limb(G, hd, hd, 4, near ? ['H', 'h', 'h'] : ['H', 'H', 'h']);
    if (hand === 'open') { const a = Math.atan2(hd[1] - el[1], hd[0] - el[0]); for (const k of [-0.6, 0, 0.6]) gline(G, hd[0] + Math.cos(a + k) * 2, hd[1] + Math.sin(a + k) * 2, hd[0] + Math.cos(a + k) * 4, hd[1] + Math.sin(a + k) * 4, near ? 'h' : 'H'); }
  };
  const goad = (G, hand, deg, len) => {
    limb(G, pt(hand, deg, -9), pt(hand, deg, len), 1.8, ['K', 'k', 'k']);
    const e = pt(hand, deg, len); gline(G, ...e, ...pt(e, deg, 3), 'I'); put(G, ...pt(e, deg, 4), 'x'); put(G, ...pt(e, deg, 2), 'i');
  };
  const body = (G, c, hip) => {
    gpoly(G, [[c[0] - 6, c[1] - 6], [c[0] + 5, c[1] - 6], [c[0] + 10, c[1] - 2], [c[0] + 10, c[1] + 3], [hip[0] + 10, FL - 11], [hip[0] - 9, FL - 10], [c[0] - 10, c[1] + 3], [c[0] - 10, c[1] - 2]],
      (x, y) => (x > c[0] + 5 ? 's' : x < c[0] - 6 ? '2' : (x * 5 + y * 3) % 11 === 0 ? '2' : 'S'));
    gpoly(G, [[c[0] - 6, c[1] - 5], [c[0] + 3, c[1] - 5], [c[0] + 6, c[1] + 1], [c[0] + 6, hip[1] - 1], [c[0] - 9, hip[1]], [c[0] - 9, c[1] + 1]], (x, y) => (x < c[0] - 5 ? 'J' : y === c[1] - 3 ? '5' : 'j'));
    for (let y = c[1] - 2; y < hip[1] - 1; y += 2) put(G, c[0] + 5, y, 'k');
    for (let x = hip[0] - 9; x <= hip[0] + 9; x++) put(G, x, hip[1] - 1 + (x > hip[0] + 6 ? 0 : 0), x === hip[0] + 4 ? 'i' : '5');
    gpoly(G, [[hip[0] + 1, hip[1]], [hip[0] + 9, hip[1] - 1], [hip[0] + 11, FL - 8], [hip[0] + 2, FL - 7]], (x, y) => (x === hip[0] + 1 || y === FL - 8 ? 'A' : 'a'));
    // the stump: a collar of smock, raw flesh, a white knob of bone
    limb(G, [c[0] - 3, c[1] - 5], [c[0] + 5, c[1] - 6], 3, ['2', 'S', 's']);
    gpoly(G, [[c[0] - 2, c[1] - 6], [c[0] + 4, c[1] - 7], [c[0] + 3, c[1] - 10], [c[0] + 1, c[1] - 9], [c[0], c[1] - 11], [c[0] - 2, c[1] - 9]], (x, y) => (y < c[1] - 8 ? 'd' : 'D'));
    put(G, c[0] + 1, c[1] - 8, 'q'); put(G, c[0] + 2, c[1] - 8, 's');
  };
  const smoke = (G, base, drift) => { for (let i = 0; i < 8; i++) { const x = base[0] + Math.round(Math.sin(i * 0.8) * 1.5 + drift * i / 10), y = base[1] - i; if (i % 4 === 3) continue; put(G, x, y, i > 4 ? 'Z' : 'z'); if (i < 4) put(G, x + 1, y, 'Z'); } };
  const frame = o => {
    const G = blank(W, H), c = o.chest, hip = o.hip;
    const shN = [c[0] + 7, c[1] - 3], shF = [c[0] - 8, c[1] - 4];
    if (o.floorGoad) layer(G, g => goad(g, ...o.floorGoad));
    if (o.goad && !o.goadFront) layer(G, g => goad(g, ...o.goad));
    layer(G, g => arm(g, shF, o.far.el, o.far.hd, false, o.far.hand));
    if (o.goad && o.goadFront === 'mid') layer(G, g => goad(g, ...o.goad));
    layer(G, g => leg(g, [hip[0] - 3, hip[1]], o.legs.far[0], o.legs.far[1], false));
    layer(G, g => leg(g, [hip[0] + 3, hip[1]], o.legs.near[0], o.legs.near[1], true));
    layer(G, g => body(g, c, hip));
    layer(G, g => smoke(g, [c[0] + 1, c[1] - 12], o.drift || -2));
    if (o.headAt) layer(G, g => paste(g, pumpkinGrid(o.glow || 'lit'), [7, 7], o.headAt, o.headDeg || 0));
    layer(G, g => { paste(g, PLOUGH, PIV, o.plough[0], o.plough[1]); });
    if (o.mound) layer(G, g => { const [mx, w] = o.mound; for (let x = mx - w; x <= mx + w; x++) { const h = Math.round(4 * (1 - Math.abs(x - mx) / (w + 1))); for (let k = 0; k <= h; k++) put(g, x, FL - k, k === h ? 'n' : (x + k) % 3 ? 'N' : 'n'); } });
    layer(G, g => arm(g, shN, o.near.el, o.near.hd, true, o.near.hand));
    if (o.goad && o.goadFront === true) layer(G, g => goad(g, ...o.goad));
    if (o.fx) for (const [x, y, rows] of o.fx) stamp(G, x, y, rows);
    for (let y = FL + 1; y < H; y++) G[y].fill('.');
    const cv = outline(fromGrid(rowsOf(G), PP, 1), OUT);
    if (o.smear) smearE(cv, ...o.smear, ['#fff4c4', '#ffd36b']);
    return cv;
  };
  const STAND = { near: [[X + 3, FL - 9], [X + 4, FL]], far: [[X - 3, FL - 9], [X - 4, FL]] };
  const base = { chest: [X + 1, FL - 26], hip: [X, FL - 16], legs: STAND, plough: [[X + 38, FL], 0], headAt: [X + 13, FL - 23],
    near: { el: [X + 6, FL - 17], hd: [X + 14, FL - 17] }, far: { el: [X - 10, FL - 21], hd: [X - 7, FL - 16] }, goad: [[X - 7, FL - 16], -106, 22] };
  const idle = frame(base);
  const walkA = frame({ ...base, legs: { near: [[X + 6, FL - 9], [X + 9, FL]], far: [[X - 4, FL - 9], [X - 9, FL]] }, plough: [[X + 39, FL], 0], drift: -4,
    far: { el: [X - 10, FL - 21], hd: [X - 8, FL - 17] }, goad: [[X - 8, FL - 17], -112, 22] });
  const walkB = frame({ ...base, chest: [X + 1, FL - 27], hip: [X, FL - 17], headAt: [X + 13, FL - 24], legs: { near: [[X + 2, FL - 10], [X, FL]], far: [[X + 1, FL - 9], [X + 3, FL]] }, plough: [[X + 38, FL], -2],
    near: { el: [X + 6, FL - 18], hd: [X + 14, FL - 18] }, far: { el: [X - 10, FL - 22], hd: [X - 7, FL - 17] }, goad: [[X - 7, FL - 17], -100, 22] });
  const chargeTell = frame({ ...base, chest: [X + 3, FL - 21], hip: [X - 2, FL - 13], headAt: [X + 14, FL - 18], legs: { near: [[X + 5, FL - 8], [X + 6, FL]], far: [[X - 6, FL - 6], [X - 11, FL]] },
    plough: [[X + 37, FL], 4], near: { el: [X + 7, FL - 13], hd: [X + 14, FL - 13] }, far: { el: [X - 8, FL - 17], hd: [X - 4, FL - 12] }, goad: [[X - 4, FL - 12], -150, 24], drift: -6,
    fx: [[X + 33, FL - 2, ['n.N.n']], [X + 38, FL - 4, ['.Z.n']], [X + 44, FL - 1, ['N.n']], [X + 29, FL - 3, ['Z']]] });
  const charge = frame({ ...base, chest: [X + 8, FL - 22], hip: [X + 2, FL - 14], headAt: [X + 19, FL - 18], legs: { near: [[X + 8, FL - 8], [X + 10, FL]], far: [[X - 3, FL - 6], [X - 11, FL]] },
    plough: [[X + 44, FL - 3], -10], near: { el: [X + 11, FL - 13], hd: [X + 17, FL - 14] }, far: { el: [X - 2, FL - 17], hd: [X + 3, FL - 13] }, goad: [[X + 3, FL - 13], -168, 24], drift: -9,
    fx: [[X + 46, FL - 12, ['n..N', '.N..', '..n.']], [X + 52, FL - 8, ['N.n', '...', 'n..']], [X + 42, FL - 16, ['.n', 'N.']], [X + 56, FL - 4, ['n', '.', 'N']], [X + 48, FL - 1, ['nNn']]] });
  const stuck = frame({ ...base, chest: [X + 4, FL - 20], hip: [X - 4, FL - 14], headAt: [X - 15, FL - 5], glow: 'dim', headDeg: -30, drift: 3,
    legs: { near: [[X + 1, FL - 8], [X - 1, FL]], far: [[X - 8, FL - 7], [X - 13, FL]] },
    plough: [[X + 36, FL + 6], 11], near: { el: [X + 8, FL - 13], hd: [X + 13, FL - 13] }, far: { el: [X + 3, FL - 14], hd: [X + 10, FL - 14] },
    goad: null, floorGoad: [[X - 20, FL - 1], 2, 18], mound: [X + 37, 9],
    fx: [[X + 28, FL - 6, ['N.', '.n']], [X + 46, FL - 5, ['.n', 'N.']], [X + 16, FL - 22, ['z.z']]] });
  const goadTell = frame({ ...base, chest: [X, FL - 26], legs: { near: [[X + 5, FL - 9], [X + 7, FL]], far: [[X - 4, FL - 9], [X - 8, FL]] },
    far: { el: [X - 10, FL - 31], hd: [X - 12, FL - 38] }, goad: [[X - 12, FL - 38], -8, 30], goadFront: true });
  const goadThrust = frame({ ...base, chest: [X + 4, FL - 26], hip: [X + 1, FL - 16], headAt: [X + 16, FL - 23], legs: { near: [[X + 7, FL - 9], [X + 10, FL]], far: [[X - 3, FL - 9], [X - 8, FL]] },
    near: { el: [X + 8, FL - 18], hd: [X + 15, FL - 17] }, far: { el: [X + 8, FL - 29], hd: [X + 17, FL - 30] }, goad: [[X + 17, FL - 30], 0, 30], goadFront: true, drift: -5 });
  const headTell = frame({ ...base, chest: [X, FL - 26], headAt: [X + 13, FL - 41], glow: 'bright',
    near: { el: [X + 10, FL - 27], hd: [X + 12, FL - 34] }, legs: { near: [[X + 5, FL - 9], [X + 7, FL]], far: [[X - 4, FL - 9], [X - 8, FL]] },
    fx: [[X + 13, FL - 49, ['e']], [X + 4, FL - 43, ['e']], [X + 22, FL - 42, ['e']], [X + 6, FL - 48, ['E']], [X + 20, FL - 48, ['E']]] });
  const headThrow = frame({ ...base, chest: [X + 4, FL - 26], hip: [X + 1, FL - 16], headAt: null, legs: { near: [[X + 7, FL - 9], [X + 10, FL]], far: [[X - 3, FL - 9], [X - 8, FL]] },
    near: { el: [X + 14, FL - 27], hd: [X + 23, FL - 30], hand: 'open' }, drift: -5 });
  const hurt = frame({ ...base, chest: [X - 3, FL - 26], hip: [X - 1, FL - 16], headAt: [X + 10, FL - 25], drift: 5, plough: [[X + 38, FL], -4],
    legs: { near: [[X + 3, FL - 9], [X + 5, FL]], far: [[X - 5, FL - 9], [X - 7, FL]] },
    near: { el: [X + 3, FL - 18], hd: [X + 11, FL - 19] }, far: { el: [X - 13, FL - 27], hd: [X - 17, FL - 32], hand: 'open' }, goad: [[X - 17, FL - 32], -130, 22] });
  return pack([idle, walkA, walkB, chargeTell, charge, stuck, goadTell, goadThrust, headTell, headThrow, hurt], X + 1, FL + 2, 20, 34);
}
export const PLOUGHMAN_F = { idle: 0, walk: [1, 2], chargeTell: 3, charge: 4, stuck: 5, goadTell: 6, goad: 7, headTell: 8, headThrow: 9, hurt: 10 };

// ---------- THE HEAD IN FLIGHT ----------
export function bakePloughHead() {
  const out = [];
  for (let i = 0; i < 4; i++) {
    const G = blank(10, 10), T = pumpkinGrid('bright');
    paste(G, T, [7, 7], [5, 5], i * 90);
    out.push(outline(fromGrid(rowsOf(G), PP, 1), OUT));
  }
  return out;
}
