// prince.js — THE PRINCE'S TOMB, at the bottom of THE UNDERCROWN: THE BURIED PRINCE, the court he calls up out of the
// floor, the sarcophagus he gets up out of and his crown in flight. A new baker, not a redraw. Frames face RIGHT (L is
// the flip) and share one canvas, so the anchor holds. Parts are rasterised into a char grid (limb / gline / gpoly, and
// rpoly for anything laid at an angle), parts that cross the body are laid with an inner outline (layer()), then
// fromGrid + OUT outline - the way frost.js builds the Rimewright and masthead.js the Masthead.
//
// bakeBuriedPrince()  THE BURIED PRINCE (boss) — a tall goblin prince dead a long time and forgotten longer, and a
//   GOBLIN first: a big head, a goblin's green gone dead, a snub-hooked nose, a wide mouth with tusks and the jaw under
//   it rotted to the bone, a patch of bare skull, big sockets with a cold green light in them, two long torn ears
//   standing OUT off the back of the skull, a tarnished crown too big for him slipping back
//   over one ear, a rotted royal coat with a high collar and its gold trim gone brown and a tear over the ribs, a
//   tattered black cloak with grave dirt in its hem, burial wrappings round the wrists and shins, and a long rusted
//   ceremonial sword. He is BIG and he STANDS: every standing frame has both feet on the floor row.
//   frames (PRINCE_F names them for main.js):
//      0 idle A (leaning on the sword, its point on the floor)   1 idle B (the slow undead sway: settled a pixel, head down)
//      2, 3, 4 walk (the sword carried low and forward)
//      5 cut tell (wound right back, the blade over his shoulder behind him, eyes flaring)
//      6 cut (a long lunge through, the blade out level, smear arc)
//      7 sink tell (crouched, a hand in the dirt, the sword stood in the floor)
//      8 sunk (half into the floor to the waist, clawing, a mound round him)
//      9 rise (bursting up out of the floor, arms flung up, dirt going up with him)
//     10 call tell (arms spread up, head back, jaw open, the sword stood in the floor)   11 call (both hands driven down)
//     12 crown tell (BAREHEADED: the crown drawn back in his hand)   13 crown throw (bareheaded, the arm flung out, empty)
//     14 snuff tell (head thrown back, drawing breath)   15 snuff (head thrust out, jaw wide, the grave-wind out of it)
//     16 idle bareheaded   17, 18 walk bareheaded
//     19 BURIED (the opening: beaten down onto his knees under a broken beam, one arm over his head, crown in the dirt)
//     20 reel (thrown back off a blocked cut)
//     21 collapse (on his knees, slumped, the sword and the crown on the floor)
//     22 hurt (LAST: head snapped back, arms flung)
//   canvas 98x82 (grid 96x80)   anchor ax 41, ay 79   pack w/h 22x60
//   reach: standing crown top ay-71, skull top ay-64; idle sword point ax+14, ay-2; CUT blade tip ax+48, ay-36 (smear
//          radius 36 round ax+10, ay-46, from -95 to 35 degrees); cut tell blade tip ax-34, ay-76 (behind him);
//          crown tell crown ax-15, ay-62; sunk: the mound ax-16..ax+16, ay-5..ay-1
//
// bakeCourtier()  a courtier of his: a goblin skeleton in a rag of a purple tabard and a brass chain of office. 13 px
//   wide, 22 tall. frames 0 rise (skull and hands up out of the dirt), 1, 2 walk, 3 claw tell, 4 claw, 5 hurt (LAST)
//   canvas 36x36 (grid 34x34)   anchor ax 17, ay 33   pack w/h 10x20
//
// bakeSarcophagus()  [closed, open] 52x32, drawn from its foot (bottom-centre 26, 30)
// bakeCrownSpin()    eight 22x22 frames of the crown turning over in the air, centred
import { px, fromGrid, outline, flipX, whiten, canvas, rect, fillPoly, line } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const rowsOf = G => G.map(r => r.join(''));
const put = (G, x, y, k) => { x = Math.round(x); y = Math.round(y); if (G[y] && x >= 0 && x < G[y].length) G[y][x] = k; };
const stamp = (G, x, y, rows) => rows.forEach((r, j) => { const row = G[y + j]; if (!row) return; for (let i = 0; i < r.length; i++) { const k = r[i], xx = x + i; if (k === '.' || xx < 0 || xx >= row.length) continue; row[xx] = k; } });
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
// a capsule from a to b, `w` thick; each pixel takes the char of the side it faces: ramp = [dark, base, light], lit from the upper left
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
// A POLYGON LAID AT AN ANGLE. pts are in the part's own frame (d along it, s across it) about origin o, turned by deg;
// pick() is asked in that same frame, so a blade's edge is an edge whichever way the blade points.
function rpoly(G, o, deg, pts, pick) {
  const a = deg * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
  const wp = pts.map(([d, s]) => [o[0] + cs * d - sn * s, o[1] + sn * d + cs * s]);
  gpoly(G, wp, (x, y) => { const dx = x + 0.5 - o[0], dy = y + 0.5 - o[1]; return pick(cs * dx + sn * dy, -sn * dx + cs * dy); });
}
// a swing's smear: a pale grave-green arc of radius r round (cx, cy) in canvas pixels, from a0 to a1 degrees (0 ahead,
// -90 up), drawn after the outline and only on empty pixels
function smear(c, cx, cy, r, a0, a1) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 1.5) for (const [rr, col] of [[r, '#e8f4dc'], [r - 1, a > a0 + (a1 - a0) * 0.35 ? '#9fd8a0' : null], [r - 2, a > a0 + (a1 - a0) * 0.7 ? '#5a9a6a' : null]]) {
    if (!col) continue;
    const x = Math.round(cx + rr * Math.cos(a * Math.PI / 180)), y = Math.round(cy + rr * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 1 || y < 1 || x >= c.width - 1 || y >= c.height - 1) continue;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, col);
  }
}
// push a grid down n rows (the bottom n fall off it): a body going INTO the floor, not a body floating over it
function sinkGrid(G, n) { const w = G[0].length; for (let i = 0; i < n; i++) { G.pop(); G.unshift(Array(w).fill('.')); } }

// ---------- THE PRINCE'S PALETTE ----------
// skin s/S/3/4 (light to deep, a grey-green gone to leather); bone and teeth b/B; the socket q, the cold eye e and its
// glow E; the crown's gold y/Y, its tarnish z, verdigris v and a cloudy green stone g; the coat c/C/d with its trim t/T;
// the cloak k/K; grave dirt n/N; the wrappings w/W; the sword's rust r/R, what steel is left i/I, the grip h; the mouth m;
// timber u/U/j (a beam fallen across him)
const PR = { o: OUT,
  s: '#9cb46c', S: '#6c8a4c', 3: '#4a6238', 4: '#2c3e24',   /* a GOBLIN's green, gone dead: it was grey leather, which is anybody */
  b: '#e4dcc2', B: '#aaa088',
  q: '#120e16', e: '#e2ffd8', E: '#6ee48c',
  y: '#d4b24e', Y: '#8c7232', z: '#524628', v: '#6ea48c', g: '#a6e8a8',
  c: '#83507a', C: '#5a3350', d: '#351d30', t: '#b48e42', T: '#6c5428',
  k: '#5e5c6c', K: '#36343f', n: '#6c5a44', N: '#3e3228',
  w: '#d6cbaa', W: '#978c70',
  r: '#b2744e', R: '#744430', i: '#aeb6ba', I: '#666d74', h: '#4a2e1e',
  m: '#1c1418', u: '#8a5a32', U: '#5a391d', j: '#c29c5e' };
const SKIN = ['3', 'S', 's'], SKIN_F = ['4', '3', 'S'];
const COAT = ['d', 'C', 'c'], COAT_F = ['d', 'd', 'C'];

// THE SWORD, laid from the hand along deg: a gold pommel, a grip bound in rotten leather, a broad guard, and a long
// blade more rust than steel, its edge bitten
function sword(G, hand, deg, len) {
  rpoly(G, hand, deg, [[-8, -1.6], [-4, -1.6], [-4, 1.6], [-8, 1.6]], (d, s) => (s < -0.5 ? 'y' : 'Y'));
  rpoly(G, hand, deg, [[-4, -1.1], [2, -1.1], [2, 1.1], [-4, 1.1]], d => (((Math.floor(d) % 2) + 2) % 2 ? 'h' : 'N'));
  rpoly(G, hand, deg, [[2, -5.2], [4.4, -5.2], [4.4, 5.2], [2, 5.2]], (d, s) => (Math.abs(s) > 3.6 ? 'Y' : s < 0 ? 'y' : 'T'));
  rpoly(G, hand, deg, [[4.4, -2], [len, -2], [len + 4, 0], [len, 2], [4.4, 2]], (d, s) => {
    const k = Math.floor(d);
    if (s > 0.9 && (k * 7) % 11 === 3) return 'R';
    if (s < -0.9) return (k * 5) % 9 === 4 ? 'r' : 'i';
    if (s > 0.9) return 'R';
    return (k * 3) % 8 === 5 ? 'R' : (k % 6 === 0 ? 'I' : 'r');
  });
}
// THE CROWN, too big for the head it was made for: a band with green stones and four points, tarnished dark along its foot
function crown(G, o, deg) {
  rpoly(G, o, deg, [[-8, -3], [8, -3], [8, 1.2], [-8, 1.2]], (d, s) => {
    const k = Math.round(d);
    return s > 0.3 ? 'z' : s < -2 ? 'Y' : (k % 5 === 0 ? 'g' : (k * 3) % 7 === 1 ? 'v' : 'y'); });
  for (const [dd, hh] of [[-6, 4], [-2, 5.5], [2, 5.5], [6, 4]])
    rpoly(G, o, deg, [[dd - 2.2, -2.6], [dd + 2.2, -2.6], [dd, -2.6 - hh]], (d, s) => (s < -1.2 - hh ? 'y' : d < dd ? 'Y' : 'y'));
}

// ---------- THE HEAD, drawn upright in its own grid and turned onto the body ----------
// AN UNDEAD GOBLIN'S HEAD (Daniel, 2026-09-21: "the Buried Prince to look like an undead goblin"). The old head was a
// gaunt hook-nosed skull with its ears hanging down the back of it, and on a tall body in a long coat that read as a
// lich. What says GOBLIN in this game is the rock goblin's: a BIG head, a snub-hooked nose, a wide mouth, and two long
// ears that stand OUT off the skull. What says DEAD: half the jaw rotted to the bone, a patch of bare skull, a stitch,
// tusks gone yellow and the cold green in the sockets. The grid is drawn at HEAD_S times its size (head()).
const HG = 44, HC = 22, HEAD_S = 1.22;
function headGrid(o) {
  const T = blank(HG, HG), q = (x, y) => [HC + x, HC + y];
  // the far ear, behind: out and up off the back of the skull, dark
  gpoly(T, [q(-3, -4), q(-12, -9), q(-19, -13), q(-16, -8), q(-8, -1)], () => '4');
  limb(T, q(-2, -2), q(2, -2), 12.5, SKIN);                                                                          // the skull, round and big
  gpoly(T, [q(0, -2), q(9, 0), q(9, 4), q(4, 7.5), q(-2, 6)], (x, y) => (y > HC + 3 ? '3' : 'S'));                // the face, wide under the eyes
  /* BONE SHOWING: a patch of bare skull where the scalp went, with a crack in it */
  gpoly(T, [q(-6, -8), q(-1, -9), q(0, -6), q(-5, -4)], () => 'b'); gline(T, ...q(-4, -8), ...q(-3, -5), 'B');
  limb(T, q(6, -1), q(11, 1), 3.4, SKIN); put(T, ...q(12, 2), 'S'); put(T, ...q(11, 3), '3');                     // the nose: a goblin's, long and turned down
  limb(T, q(2.5, -3), q(4.5, -2.5), 3.6, ['q', 'q', 'q']);                                                               // the socket, big and sunk
  /* THE EYE: a cold green light, bigger than the old one - a goblin's eyes are the size of his head's intent */
  put(T, ...q(3, -3), o.eyes === 'dim' ? 'E' : 'e'); put(T, ...q(4, -3), o.eyes === 'dim' ? 'q' : 'e'); put(T, ...q(3, -2), 'E'); put(T, ...q(4, -2), 'E');
  if (o.eyes === 'flare') { put(T, ...q(2, -3), 'E'); put(T, ...q(5, -3), 'E'); put(T, ...q(3, -4), 'E'); put(T, ...q(4, -4), 'E'); }
  gline(T, ...q(-1, -5), ...q(7, -4), '4');                                                                         // the brow, heavy
  // THE MOUTH: wide, ear-ward, and the lower jaw is bone - the flesh has gone off it. Tusks up out of the underbite.
  if (o.jaw === 'open') {
    gpoly(T, [q(-1, 3), q(9, 3), q(8, 10), q(-1, 9)], () => 'm');
    gpoly(T, [q(-1, 8), q(8, 9), q(7, 11), q(-1, 10.5)], () => 'b'); for (const x of [0, 2, 4, 6]) put(T, ...q(x, 9), 'B');
    for (const x of [1, 3, 5, 7]) put(T, ...q(x, 3), 'b');
    put(T, ...q(1, 8), 'b'); put(T, ...q(1, 7), 'b'); put(T, ...q(6, 8), 'b'); put(T, ...q(6, 7), 'b');                   // the tusks, reaching up
  } else {
    gpoly(T, [q(-1, 5), q(7, 5), q(6, 8), q(-1, 7.5)], () => 'b'); gline(T, ...q(0, 6), ...q(6, 6), 'B');              // the bare jawbone
    gline(T, ...q(-1, 4), ...q(9, 3), 'm'); for (const x of [0, 2, 4]) put(T, ...q(x, 5), 'b');
    put(T, ...q(1, 3), 'b'); put(T, ...q(1, 2), 'b'); put(T, ...q(7, 3), 'b'); put(T, ...q(7, 2), 'b');                 // the tusks
  }
  gline(T, ...q(-2, 1), ...q(-2, 5), 'W'); put(T, ...q(-3, 2), 'W'); put(T, ...q(-1, 4), 'W');                     // a stitch down the cheek
  if (o.crown !== 'on') { gline(T, ...q(-6, -9), ...q(4, -9), 'B'); put(T, ...q(-2, -10), 'W'); put(T, ...q(1, -10), 'W'); }   // bareheaded: the pale band where it sat
  // THE NEAR EAR: a goblin's - LONG, standing out and up off the back of the skull, with a dark rim, a pink-grey
  // inside, and a torn notch. A drooping ear read as hair; an ear that stands out reads as a goblin at any size.
  gpoly(T, [q(-3, -4), q(-10, -8), q(-21, -12), q(-18, -7), q(-15, -6), q(-16, -4), q(-9, -1), q(-3, 1)], (x, y) => (y < HC - 6 ? 'S' : 's'));
  gline(T, ...q(-4, -4), ...q(-20, -12), '4'); gline(T, ...q(-5, -2), ...q(-15, -7), '3'); gline(T, ...q(-6, -1), ...q(-12, -4), '3');
  put(T, ...q(-17, -7), '.'); put(T, ...q(-16, -6), '.');                                                           // the notch torn out of it
  if (o.crown === 'on') crown(T, q(0, -7.5), -14);
  return T;
}
function head(G, hd, o) {
  const T = headGrid(o), a = (o.ha || 0) * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a), R = Math.ceil(HC * HEAD_S);
  for (let wy = -R; wy < R; wy++) for (let wx = -R; wx < R; wx++) {
    const lx = Math.round((cs * wx + sn * wy) / HEAD_S) + HC, ly = Math.round((-sn * wx + cs * wy) / HEAD_S) + HC, row = T[ly], k = row && row[lx];
    if (!k || k === '.') continue;
    put(G, hd[0] + wx, hd[1] + wy, k);
  }
}
const neckOf = (hd, ha) => { const a = (ha || 0) * Math.PI / 180; return [hd[0] + Math.cos(a) * -2 - Math.sin(a) * 5, hd[1] + Math.sin(a) * -2 + Math.cos(a) * 5]; };

export function bakeBuriedPrince() {
  const W = 96, H = 80, X = 40, FL = H - 3;
  // A LEG: breeches under the coat to the knee, then a shin that is skin on bone with a wrapping round it, and a long bony goblin foot
  const leg = (G, hip, knee, foot, near, kneel) => {
    const R = near ? SKIN : SKIN_F, ank = [foot[0] - 1, foot[1] - 3];
    limb(G, hip, knee, 4.4, near ? COAT : COAT_F);
    limb(G, knee, ank, 2.8, R);
    for (const t of [0.35, 0.6]) { const x = knee[0] + (ank[0] - knee[0]) * t, y = knee[1] + (ank[1] - knee[1]) * t; put(G, x - 1, y, near ? 'w' : 'W'); put(G, x, y, near ? 'w' : 'W'); put(G, x + 1, y + 1, 'W'); }
    if (kneel) { limb(G, ank, [foot[0] - 5, foot[1] - 1], 2.6, R); return; }
    gpoly(G, [[foot[0] - 4, foot[1] - 3], [foot[0] + 1, foot[1] - 3], [foot[0] + 7, foot[1] - 1], [foot[0] + 7, foot[1] + 1], [foot[0] - 4, foot[1] + 1]], (x, y) => (y <= foot[1] - 3 ? R[2] : y === foot[1] ? R[0] : R[1]));
    put(G, foot[0] + 6, foot[1], near ? 'B' : '4'); put(G, foot[0] + 3, foot[1], near ? 'B' : '4');
  };
  // AN ARM: the coat's sleeve to the elbow with what is left of a gold cuff, a forearm of skin on bone in its wrappings, a hand of long nails
  const arm = (G, sh, el, hd, near, fist) => {
    limb(G, sh, el, 4.4, near ? COAT : COAT_F);
    const cf = [el[0] + (hd[0] - el[0]) * 0.12, el[1] + (hd[1] - el[1]) * 0.12];
    limb(G, cf, cf, 4.8, near ? ['T', 't', 't'] : ['T', 'T', 't']);
    limb(G, el, hd, 2.6, near ? SKIN : SKIN_F);
    for (const t of [0.5, 0.64]) { const x = el[0] + (hd[0] - el[0]) * t, y = el[1] + (hd[1] - el[1]) * t; put(G, x, y, near ? 'w' : 'W'); put(G, x + 1, y, 'W'); }
    limb(G, hd, hd, 3.6, near ? SKIN : SKIN_F);
    if (fist) return;
    const a = Math.atan2(hd[1] - el[1], hd[0] - el[0]);
    for (const k of [-0.55, 0, 0.55]) { const b = a + k; gline(G, hd[0] + Math.cos(b) * 1.6, hd[1] + Math.sin(b) * 1.6, hd[0] + Math.cos(b) * 4.6, hd[1] + Math.sin(b) * 4.6, near ? 'B' : '4'); }
  };
  // THE COAT: shoulders to below the knee, a front edge of tarnished trim with its buttons, a high collar, a tear over the ribs, grave dirt in the hem
  const coat = (G, c, hip, hem, lean, sw) => {
    const L = hip[0] + lean;
    const pts = [[c[0] - 6, c[1] - 7], [c[0] + 5, c[1] - 7], [c[0] + 7, c[1] - 1], [hip[0] + 6, hip[1]], [L + 9 + sw, hem - 1], [L + 5, hem + 1], [L + 1, hem - 1], [L - 3, hem + 2], [L - 7, hem], [L - 11 - sw, hem - 2], [hip[0] - 7, hip[1]], [c[0] - 8, c[1] - 1]];
    gpoly(G, pts, (x, y) => { const mid = c[0] + (L - c[0]) * Math.max(0, Math.min(1, (y - c[1]) / Math.max(1, hem - c[1]))); const f = x - mid;
      return f > 4 ? 'c' : f < -4 ? 'd' : ((x * 7 + y * 5) % 19 === 0 ? 'd' : 'C'); });
    gline(G, c[0] + 5, c[1] - 6, L + 8 + sw, hem - 2, i => (i % 5 === 2 ? 'y' : 't'));
    for (let x = hip[0] - 7; x <= hip[0] + 6; x++) { put(G, x, hip[1] - 1, (x % 3) ? 'T' : 't'); }
    gpoly(G, [[c[0] - 3, c[1] - 3], [c[0] + 2, c[1] - 4], [c[0] + 3, c[1] + 3], [c[0] - 2, c[1] + 4]], () => 'q');
    for (const yy of [-2, 0, 2]) gline(G, c[0] - 2, c[1] + yy, c[0] + 2, c[1] + yy - 1, 'B');
    for (let x = Math.round(L - 11 - sw); x <= L + 9 + sw; x++) { const yy = hem - ((x * 5) % 3 === 0 ? 1 : 0); if (G[yy] && G[yy][x] && G[yy][x] !== '.' && (x * 7) % 4 !== 0) put(G, x, yy, (x % 2) ? 'N' : 'n'); }
    gpoly(G, [[c[0] - 6, c[1] - 6], [c[0] - 5, c[1] - 12], [c[0] - 1, c[1] - 9], [c[0] + 1, c[1] - 6]], (x, y) => (y < c[1] - 10 ? 't' : 'C'));
    const ep = [c[0] + 3, c[1] - 6]; limb(G, ep, [ep[0] + 3, ep[1] + 1], 3.6, ['T', 't', 'y']);
    for (const dx of [0, 2, 4]) put(G, ep[0] + dx, ep[1] + 3, 'Y');
  };
  // THE CLOAK, behind everything: off the shoulders and down past the knees, tattered into holes, the dirt of the grave in its hem
  const cloak = (G, c, hip, sw, hemY) => {
    const back = hip[0] - 14 - sw * 2, fx = hip[0] + 3;
    const pts = [[c[0] - 1, c[1] - 8], [c[0] - 9, c[1] - 6], [c[0] - 12 - sw, c[1] + 6], [back, hemY - 5]];
    const n = 8; for (let i = 1; i < n; i++) { const t = i / n; pts.push([back + (fx - back) * t, hemY + (i % 2 ? 2 : -3) - (i === 3 ? 5 : 0)]); }
    pts.push([fx, hemY - 3], [c[0] + 2, c[1] + 2]);
    gpoly(G, pts, (x, y) => (y > hemY - 3 ? ((x % 3) ? 'N' : 'n') : ((x + Math.floor(y / 3)) % 5 === 0 ? 'k' : 'K')));
    for (const [dx, dy] of [[4, -10], [5, -10], [9, -6], [2, -18]]) put(G, back + dx, hemY + dy, '.');
  };
  const frame = o => {
    const G = blank(W, H), c = o.chest, hip = o.hip, hd = o.head;
    const shN = [c[0] + 3, c[1] - 5], shF = [c[0] - 3, c[1] - 6];
    layer(G, g => cloak(g, c, hip, o.sw || 0, o.cloakHem !== undefined ? o.cloakHem : FL - 5));
    if (o.floorSword) layer(G, g => sword(g, ...o.floorSword));
    if (o.swordF) layer(G, g => sword(g, ...o.swordF));
    layer(G, g => arm(g, shF, o.far.el, o.far.hd, false, !!o.swordF));
    if (o.planted) layer(G, g => sword(g, ...o.planted));
    layer(G, g => leg(g, [hip[0] - 3, hip[1]], o.legs.far[0], o.legs.far[1], false, o.kneel));
    layer(G, g => leg(g, [hip[0] + 2, hip[1] + 1], o.legs.near[0], o.legs.near[1], true, o.kneel));
    layer(G, g => coat(g, c, hip, o.hem !== undefined ? o.hem : FL - 12, o.lean || 0, o.sw || 0));
    layer(G, g => limb(g, [c[0] + 1, c[1] - 7], neckOf(hd, o.ha), 3.4, SKIN_F));
    layer(G, g => head(g, hd, o));
    if (o.beam) layer(G, g => { limb(g, o.beam[0], o.beam[1], 5.5, ['U', 'u', 'j']); gline(g, o.beam[0][0] + 6, o.beam[0][1] + 1, o.beam[0][0] + 14, o.beam[0][1] + 3, 'U'); });
    if (o.swordN) layer(G, g => sword(g, ...o.swordN));
    layer(G, g => arm(g, shN, o.near.el, o.near.hd, true, !!o.swordN));
    if (o.crown === 'hand') layer(G, g => crown(g, [o.near.hd[0] - 1, o.near.hd[1] - 4], 70));
    if (o.crownFloor) layer(G, g => crown(g, o.crownFloor, 12));
    if (o.sink) {
      sinkGrid(G, o.sink);
      const mx = o.moundX !== undefined ? o.moundX : X;
      layer(G, g => { for (let x = mx - 17; x <= mx + 17; x++) { const h = Math.round(5 * (1 - Math.abs(x - mx) / 18)); for (let k = 0; k < h; k++) put(g, x, FL - k, k === h - 1 ? 'n' : ((x + k) % 3 ? 'N' : 'n')); } });
    }
    if (o.fx) for (const [x, y, rows] of o.fx) stamp(G, x, y, rows);
    /* NOTHING UNDER THE FLOOR ROW: what a sword point, a sunk body or a nail puts below it would stand him on air or on the canvas edge */
    for (let y = FL + 1; y < H; y++) G[y].fill('.');
    const cv = outline(fromGrid(rowsOf(G), PR, 1), OUT);
    if (o.smear) smear(cv, ...o.smear);
    return cv;
  };
  const STAND = { near: [[X + 4, FL - 15], [X + 6, FL]], far: [[X - 3, FL - 15], [X - 5, FL]] };
  const idleO = { chest: [X + 2, FL - 43], hip: [X, FL - 28], head: [X + 6, FL - 56], crown: 'on', legs: STAND,
    near: { el: [X + 8, FL - 37], hd: [X + 9, FL - 26] }, far: { el: [X - 4, FL - 37], hd: [X - 3, FL - 26] }, swordN: [[X + 9, FL - 26], 78, 21] };
  const idleBO = { ...idleO, chest: [X + 2, FL - 42], head: [X + 5, FL - 55], ha: 5, sw: 1,
    near: { el: [X + 8, FL - 36], hd: [X + 9, FL - 25] }, far: { el: [X - 4, FL - 36], hd: [X - 4, FL - 25] }, swordN: [[X + 9, FL - 25], 80, 20] };
  const walkA = { chest: [X + 3, FL - 43], hip: [X + 1, FL - 28], head: [X + 7, FL - 56], ha: 3, crown: 'on', lean: 1, sw: 2,
    legs: { near: [[X + 7, FL - 15], [X + 11, FL]], far: [[X - 4, FL - 15], [X - 9, FL]] },
    near: { el: [X + 9, FL - 37], hd: [X + 12, FL - 28] }, far: { el: [X - 4, FL - 37], hd: [X - 7, FL - 28] }, swordN: [[X + 12, FL - 28], 35, 24] };
  const walkB = { chest: [X + 3, FL - 44], hip: [X + 1, FL - 29], head: [X + 7, FL - 57], ha: 2, crown: 'on', sw: 1,
    legs: { near: [[X + 4, FL - 16], [X + 3, FL]], far: [[X + 1, FL - 15], [X, FL]] },
    near: { el: [X + 8, FL - 38], hd: [X + 10, FL - 28] }, far: { el: [X - 3, FL - 38], hd: [X - 4, FL - 28] }, swordN: [[X + 10, FL - 28], 45, 24] };
  const walkC = { chest: [X + 3, FL - 43], hip: [X + 1, FL - 28], head: [X + 7, FL - 56], ha: 3, crown: 'on', lean: 1,
    legs: { near: [[X, FL - 15], [X - 5, FL]], far: [[X + 4, FL - 15], [X + 9, FL]] },
    near: { el: [X + 8, FL - 37], hd: [X + 8, FL - 27] }, far: { el: [X - 1, FL - 37], hd: [X + 1, FL - 27] }, swordN: [[X + 8, FL - 27], 55, 24] };
  const bare = f => ({ ...f, crown: 'off' });
  const cutTell = frame({ chest: [X - 1, FL - 42], hip: [X, FL - 28], head: [X + 2, FL - 54], ha: -12, crown: 'on', eyes: 'flare', jaw: 'open', sw: 2,
    legs: { near: [[X + 7, FL - 15], [X + 11, FL]], far: [[X - 5, FL - 15], [X - 10, FL]] },
    near: { el: [X - 3, FL - 53], hd: [X - 9, FL - 57] }, far: { el: [X + 4, FL - 37], hd: [X + 9, FL - 33] }, swordN: [[X - 9, FL - 57], -160, 25] });
  const cut = frame({ chest: [X + 7, FL - 40], hip: [X + 3, FL - 27], head: [X + 13, FL - 51], ha: 14, crown: 'on', eyes: 'flare', jaw: 'open', lean: 3, sw: 3,
    legs: { near: [[X + 12, FL - 15], [X + 17, FL]], far: [[X - 3, FL - 14], [X - 10, FL]] },
    near: { el: [X + 19, FL - 41], hd: [X + 25, FL - 37] }, far: { el: [X, FL - 35], hd: [X - 5, FL - 29] }, swordN: [[X + 25, FL - 37], 20, 26],
    smear: [X + 11, FL - 45, 36, -95, 35] });
  const sinkTell = frame({ chest: [X + 5, FL - 32], hip: [X + 1, FL - 20], head: [X + 11, FL - 42], ha: 28, crown: 'on', eyes: 'flare', hem: FL - 6, cloakHem: FL - 2, lean: 2,
    legs: { near: [[X + 9, FL - 11], [X + 10, FL]], far: [[X - 4, FL - 10], [X - 7, FL]] },
    near: { el: [X + 13, FL - 22], hd: [X + 16, FL - 6] }, far: { el: [X + 2, FL - 21], hd: [X + 4, FL - 6] },
    planted: [[X + 24, FL - 20], 90, 16], fx: [[X + 8, FL - 1, ['.N..n.N']], [X - 8, FL, ['nN.NnN.nNn']]] });
  const sunk = frame({ chest: [X + 2, FL - 43], hip: [X, FL - 28], head: [X + 5, FL - 56], ha: -10, crown: 'on', eyes: 'flare', jaw: 'open', legs: STAND,
    near: { el: [X + 12, FL - 52], hd: [X + 17, FL - 60] }, far: { el: [X - 7, FL - 52], hd: [X - 11, FL - 59] }, sink: 30,
    fx: [[X - 14, FL - 8, ['n...N']], [X + 12, FL - 10, ['.N', 'n.']]] });
  const rise = frame({ chest: [X + 2, FL - 45], hip: [X, FL - 30], head: [X + 5, FL - 58], ha: -8, crown: 'on', eyes: 'flare', jaw: 'open', sw: 3, legs: STAND,
    near: { el: [X + 11, FL - 53], hd: [X + 17, FL - 61] }, far: { el: [X - 6, FL - 53], hd: [X - 10, FL - 62] }, swordN: [[X + 17, FL - 61], 8, 24], sink: 9,
    fx: [[X - 20, FL - 22, ['n', '.', '.N']], [X + 22, FL - 26, ['N.', '.n']], [X - 10, FL - 34, ['N']], [X + 30, FL - 14, ['n']], [X - 26, FL - 12, ['.n', 'N.']]] });
  const callTell = frame({ chest: [X + 1, FL - 42], hip: [X, FL - 28], head: [X + 3, FL - 55], ha: -26, crown: 'on', eyes: 'flare', jaw: 'open', sw: 1,
    legs: { near: [[X + 6, FL - 15], [X + 9, FL]], far: [[X - 4, FL - 15], [X - 8, FL]] },
    near: { el: [X + 11, FL - 51], hd: [X + 18, FL - 61] }, far: { el: [X - 8, FL - 51], hd: [X - 14, FL - 61] },
    planted: [[X + 15, FL - 27], 90, 24], fx: [[X + 18, FL - 67, ['g']], [X + 23, FL - 60, ['.g']], [X - 15, FL - 68, ['g']], [X - 19, FL - 59, ['g.']]] });
  const call = frame({ chest: [X + 2, FL - 41], hip: [X, FL - 28], head: [X + 5, FL - 53], ha: 10, crown: 'on', eyes: 'flare', jaw: 'open', sw: 2,
    legs: { near: [[X + 6, FL - 15], [X + 9, FL]], far: [[X - 4, FL - 15], [X - 8, FL]] },
    near: { el: [X + 12, FL - 37], hd: [X + 18, FL - 25] }, far: { el: [X - 9, FL - 37], hd: [X - 14, FL - 25] },
    planted: [[X + 15, FL - 27], 90, 24], fx: [[X + 16, FL - 18, ['g.g']], [X - 17, FL - 18, ['g.g']]] });
  const crownTell = frame({ chest: [X, FL - 42], hip: [X, FL - 28], head: [X + 3, FL - 54], ha: -8, crown: 'hand', eyes: 'flare', sw: 1,
    legs: { near: [[X + 7, FL - 15], [X + 10, FL]], far: [[X - 5, FL - 15], [X - 9, FL]] },
    near: { el: [X - 4, FL - 52], hd: [X - 11, FL - 57] }, far: { el: [X + 1, FL - 36], hd: [X + 5, FL - 25] }, swordF: [[X + 5, FL - 25], 72, 24] });
  const crownThrow = frame({ chest: [X + 5, FL - 42], hip: [X + 2, FL - 28], head: [X + 10, FL - 53], ha: 8, crown: 'off', jaw: 'open', lean: 2, sw: 3,
    legs: { near: [[X + 11, FL - 15], [X + 15, FL]], far: [[X - 3, FL - 15], [X - 9, FL]] },
    near: { el: [X + 15, FL - 46], hd: [X + 26, FL - 47] }, far: { el: [X - 1, FL - 35], hd: [X + 2, FL - 25] }, swordF: [[X + 2, FL - 25], 80, 24] });
  const snuffTell = frame({ chest: [X, FL - 44], hip: [X, FL - 28], head: [X + 2, FL - 58], ha: -32, crown: 'on', eyes: 'flare', sw: 1,
    legs: STAND, near: { el: [X + 6, FL - 36], hd: [X + 5, FL - 44] }, far: { el: [X - 5, FL - 36], hd: [X - 9, FL - 30] }, swordF: [[X - 9, FL - 30], 118, 22] });
  const snuff = frame({ chest: [X + 6, FL - 41], hip: [X + 2, FL - 28], head: [X + 15, FL - 50], ha: 22, crown: 'on', eyes: 'flare', jaw: 'open', lean: 2, sw: 3,
    legs: { near: [[X + 8, FL - 15], [X + 11, FL]], far: [[X - 3, FL - 15], [X - 8, FL]] },
    near: { el: [X + 4, FL - 33], hd: [X, FL - 25] }, far: { el: [X - 4, FL - 35], hd: [X - 10, FL - 29] }, swordF: [[X - 10, FL - 29], 118, 22],
    fx: [[X + 26, FL - 49, ['.k.k']], [X + 30, FL - 52, ['k..k.k']], [X + 34, FL - 46, ['.k', 'k.']], [X + 39, FL - 50, ['k']]] });
  const buried = frame({ chest: [X + 5, FL - 20], hip: [X - 2, FL - 12], head: [X + 13, FL - 23], ha: 48, crown: 'off', eyes: 'dim', jaw: 'open', hem: FL - 1, cloakHem: FL, kneel: true,
    legs: { near: [[X + 6, FL - 3], [X - 2, FL]], far: [[X - 1, FL - 2], [X - 9, FL]] },
    near: { el: [X + 15, FL - 12], hd: [X + 19, FL - 2] }, far: { el: [X + 1, FL - 30], hd: [X + 8, FL - 35] },
    beam: [[X - 22, FL - 33], [X + 28, FL - 25]], crownFloor: [X + 30, FL - 3], floorSword: [[X - 30, FL - 5], 0, 26],
    fx: [[X - 16, FL - 2, ['.n.N', 'NnNnN']], [X + 20, FL - 1, ['n.N', 'NnN']], [X + 4, FL - 40, ['N']], [X - 6, FL - 37, ['.n']]] });
  const reel = frame({ chest: [X - 3, FL - 42], hip: [X, FL - 28], head: [X - 3, FL - 54], ha: -30, crown: 'on', eyes: 'flare', jaw: 'open',
    legs: { near: [[X + 5, FL - 15], [X + 8, FL]], far: [[X - 7, FL - 15], [X - 13, FL]] },
    near: { el: [X - 2, FL - 53], hd: [X - 7, FL - 62] }, far: { el: [X + 4, FL - 37], hd: [X + 12, FL - 37] }, swordN: [[X - 7, FL - 62], -160, 22] });
  const collapse = frame({ chest: [X + 4, FL - 20], hip: [X - 2, FL - 11], head: [X + 11, FL - 23], ha: 62, crown: 'off', eyes: 'dim', jaw: 'open', hem: FL - 1, cloakHem: FL, kneel: true,
    legs: { near: [[X + 7, FL - 2], [X - 3, FL]], far: [[X + 1, FL - 2], [X - 9, FL]] },
    near: { el: [X + 10, FL - 11], hd: [X + 13, FL - 1] }, far: { el: [X, FL - 11], hd: [X + 2, FL - 1] },
    floorSword: [[X + 18, FL - 5], 0, 28], crownFloor: [X + 44, FL - 3] });
  const hurt = frame({ chest: [X - 2, FL - 42], hip: [X, FL - 28], head: [X - 1, FL - 55], ha: -24, crown: 'on', eyes: 'flare', jaw: 'open', sw: 2,
    legs: { near: [[X + 4, FL - 15], [X + 6, FL]], far: [[X - 4, FL - 15], [X - 7, FL]] },
    near: { el: [X + 7, FL - 43], hd: [X + 15, FL - 47] }, far: { el: [X - 7, FL - 39], hd: [X - 13, FL - 41] }, swordN: [[X + 15, FL - 47], -30, 24] });
  const frames = [frame(idleO), frame(idleBO), frame(walkA), frame(walkB), frame(walkC), cutTell, cut, sinkTell, sunk, rise, callTell, call,
    crownTell, crownThrow, snuffTell, snuff, frame(bare(idleO)), frame(bare(walkA)), frame(bare(walkC)), buried, reel, collapse, hurt];
  return pack(frames, X + 1, FL + 2, 22, 60);
}
// the names main.js reads frames by, in the order bakeBuriedPrince packs them
export const PRINCE_F = { idle: 0, idleB: 1, walk: [2, 3, 4], cutTell: 5, cut: 6, sinkTell: 7, sunk: 8, rise: 9, callTell: 10, call: 11,
  crownTell: 12, crownThrow: 13, snuffTell: 14, snuff: 15, bareIdle: 16, bareWalk: [17, 18], buried: 19, reel: 20, dead: 21, hurt: 22 };

// ---------- A COURTIER ----------
const CP = { o: OUT, x: '#f2ecd6', b: '#d8cfb4', B: '#9a9078', q: '#120e16', e: '#b8ffb4', c: '#7a4a70', C: '#4e2c48', y: '#c9a84a', Y: '#7e6630', n: '#6c5a44', N: '#3e3228' };
export function bakeCourtier() {
  const W = 34, H = 34, X = 16, FL = H - 3, BONE = ['B', 'b', 'x'];
  const frame = o => {
    const G = blank(W, H), hip = o.hip, c = o.chest, hd = o.head;
    const bone = (g, a, b, w) => limb(g, a, b, w, BONE);
    // the far arm and leg
    layer(G, g => { bone(g, [c[0] - 2, c[1] - 2], o.far.el, 1.8); bone(g, o.far.el, o.far.hd, 1.6); for (const k of [-0.6, 0.6]) { const a = Math.atan2(o.far.hd[1] - o.far.el[1], o.far.hd[0] - o.far.el[0]) + k; gline(g, o.far.hd[0], o.far.hd[1], o.far.hd[0] + Math.cos(a) * 3, o.far.hd[1] + Math.sin(a) * 3, 'B'); } });
    layer(G, g => { bone(g, [hip[0] - 1, hip[1]], o.legs.far[0], 2); bone(g, o.legs.far[0], o.legs.far[1], 1.8); gline(g, o.legs.far[1][0] - 1, o.legs.far[1][1], o.legs.far[1][0] + 2, o.legs.far[1][1], 'B'); });
    layer(G, g => { bone(g, [hip[0] + 1, hip[1]], o.legs.near[0], 2); bone(g, o.legs.near[0], o.legs.near[1], 1.8); gline(g, o.legs.near[1][0] - 1, o.legs.near[1][1], o.legs.near[1][0] + 3, o.legs.near[1][1], 'b'); });
    // the spine and the ribs, and the rag of a tabard over the hips with his brass chain across it
    layer(G, g => { gline(g, hip[0], hip[1], c[0], c[1] - 3, 'b');
      for (let k = 0; k < 3; k++) gline(g, c[0] - 3, c[1] - 3 + k * 2, c[0] + 3, c[1] - 2 + k * 2, k === 1 ? 'B' : 'b');
      gpoly(g, [[c[0] - 3, c[1] + 2], [c[0] + 4, c[1] + 2], [hip[0] + 5, hip[1] + 4], [hip[0] + 2, hip[1] + 6], [hip[0] - 1, hip[1] + 4], [hip[0] - 4, hip[1] + 5]], (x, y) => ((x + y) % 4 === 0 ? 'C' : 'c'));
      gline(g, c[0] - 3, c[1] - 3, c[0] + 3, c[1] + 1, i => (i % 2 ? 'Y' : 'y')); });
    // the skull: a goblin's, long in the jaw, with the bones of its ears still swept back, and a pinprick of the prince's light in it
    layer(G, g => { limb(g, [hd[0] - 1, hd[1]], [hd[0] + 1, hd[1] - 1], 6.4, BONE);
      gpoly(g, [[hd[0], hd[1]], [hd[0] + 5, hd[1] + 1], [hd[0] + 4, hd[1] + 4], [hd[0] - 1, hd[1] + 3]], () => 'b');
      gline(g, hd[0] - 2, hd[1] - 1, hd[0] - 7, hd[1] + 2, 'B'); gline(g, hd[0] - 2, hd[1], hd[0] - 6, hd[1] + 3, 'b');
      put(g, hd[0] + 2, hd[1] - 1, 'q'); put(g, hd[0] + 3, hd[1] - 1, 'q'); put(g, hd[0] + 2, hd[1] - 1, o.flare ? 'x' : 'e');
      gline(g, hd[0] + 1, hd[1] + 2, hd[0] + 4, hd[1] + 2, 'q'); put(g, hd[0] + 2, hd[1] + 2, 'x'); put(g, hd[0] + 4, hd[1] + 3, 'x'); });
    layer(G, g => { bone(g, [c[0] + 2, c[1] - 2], o.near.el, 1.8); bone(g, o.near.el, o.near.hd, 1.6); for (const k of [-0.6, 0, 0.6]) { const a = Math.atan2(o.near.hd[1] - o.near.el[1], o.near.hd[0] - o.near.el[0]) + k; gline(g, o.near.hd[0], o.near.hd[1], o.near.hd[0] + Math.cos(a) * 3.4, o.near.hd[1] + Math.sin(a) * 3.4, 'x'); } });
    if (o.sink) { sinkGrid(G, o.sink); layer(G, g => { for (let x = X - 10; x <= X + 10; x++) { const h = Math.round(3 * (1 - Math.abs(x - X) / 11)); for (let k = 0; k < h; k++) put(g, x, FL - k, k === h - 1 ? 'n' : 'N'); } }); }
    for (let y = FL + 1; y < H; y++) G[y].fill('.');
    return outline(fromGrid(rowsOf(G), CP, 1), OUT);
  };
  const base = { hip: [X, FL - 9], chest: [X + 1, FL - 15], head: [X + 3, FL - 22], legs: { near: [[X + 2, FL - 5], [X + 2, FL]], far: [[X - 2, FL - 5], [X - 2, FL]] } };
  const rise = frame({ ...base, flare: true, near: { el: [X + 6, FL - 22], hd: [X + 8, FL - 26] }, far: { el: [X - 4, FL - 22], hd: [X - 6, FL - 26] }, sink: 12 });
  const walk1 = frame({ ...base, legs: { near: [[X + 4, FL - 5], [X + 5, FL]], far: [[X - 2, FL - 5], [X - 5, FL]] }, near: { el: [X + 4, FL - 10], hd: [X + 7, FL - 8] }, far: { el: [X - 3, FL - 10], hd: [X - 4, FL - 6] } });
  const walk2 = frame({ ...base, chest: [X + 1, FL - 16], head: [X + 3, FL - 23], legs: { near: [[X + 1, FL - 6], [X, FL]], far: [[X + 1, FL - 5], [X + 2, FL]] }, near: { el: [X + 3, FL - 11], hd: [X + 4, FL - 7] }, far: { el: [X - 1, FL - 11], hd: [X - 1, FL - 7] } });
  const clawTell = frame({ ...base, flare: true, chest: [X, FL - 15], head: [X + 1, FL - 22], legs: { near: [[X + 4, FL - 5], [X + 5, FL]], far: [[X - 3, FL - 5], [X - 5, FL]] }, near: { el: [X - 2, FL - 21], hd: [X - 5, FL - 25] }, far: { el: [X - 5, FL - 18], hd: [X - 9, FL - 21] } });
  const claw = frame({ ...base, flare: true, chest: [X + 3, FL - 14], head: [X + 6, FL - 20], legs: { near: [[X + 6, FL - 5], [X + 8, FL]], far: [[X - 2, FL - 5], [X - 5, FL]] }, near: { el: [X + 9, FL - 13], hd: [X + 13, FL - 10] }, far: { el: [X + 7, FL - 11], hd: [X + 11, FL - 7] } });
  const hurt = frame({ ...base, chest: [X - 1, FL - 15], head: [X - 1, FL - 22], near: { el: [X + 3, FL - 18], hd: [X + 7, FL - 21] }, far: { el: [X - 4, FL - 17], hd: [X - 8, FL - 18] } });
  return pack([rise, walk1, walk2, clawTell, claw, hurt], X + 1, FL + 2, 10, 20);
}

// ---------- THE SARCOPHAGUS ----------
// Old dark stone with a goblin prince lying on the lid in relief, crowned, his hands on a sword; opened, the lid is shoved
// half off it and leant against its side, and what is inside is dark and full of dirt.
export function bakeSarcophagus() {
  const mk = open => {
    const [c, g] = canvas(52, 32);
    rect(g, 4, 14, 44, 16, '#4c4854'); rect(g, 4, 14, 44, 1, '#6c6876'); rect(g, 4, 28, 44, 2, '#302c38');
    for (const x of [8, 20, 32]) { rect(g, x, 17, 10, 9, '#3e3a46'); rect(g, x, 17, 10, 1, '#2a2632'); rect(g, x, 25, 10, 1, '#5a5664'); }
    rect(g, 24, 19, 4, 4, '#5a5664'); rect(g, 25, 20, 2, 1, '#2a2632');                         /* a skull carved on the middle panel */
    for (const [x, y] of [[6, 26], [15, 27], [41, 25], [44, 28]]) rect(g, x, y, 2, 2, '#3e3228');   /* the dirt of the mine got into it */
    if (!open) {
      rect(g, 2, 8, 48, 7, '#5c5866'); rect(g, 2, 8, 48, 1, '#7c7888'); rect(g, 2, 14, 48, 1, '#34303c');
      fillPoly(g, [[8, 10], [38, 10], [42, 12], [38, 13], [8, 13]], '#6e6a7a');                      /* him, on the lid */
      rect(g, 40, 9, 5, 2, '#8c7232'); rect(g, 41, 8, 1, 1, '#8c7232'); rect(g, 43, 8, 1, 1, '#8c7232');
      line(g, 12, 11, 30, 11, '#8a8696', 1); rect(g, 28, 10, 2, 3, '#8c7232');
    } else {
      rect(g, 5, 11, 42, 4, '#120e16'); rect(g, 7, 13, 38, 2, '#3e3228');
      for (const [x, y] of [[12, 12], [26, 12], [34, 13]]) rect(g, x, y, 3, 1, '#6c5a44');
      fillPoly(g, [[2, 29], [8, 29], [22, 4], [16, 4]], '#5c5866'); line(g, 16, 4, 2, 28, '#7c7888', 1);
      fillPoly(g, [[6, 24], [10, 24], [17, 11], [14, 11]], '#6e6a7a');
      rect(g, 38, 12, 2, 6, '#d6cbaa'); rect(g, 39, 18, 1, 3, '#978c70');                          /* a wrapping, hanging over the edge */
    }
    return outline(c, OUT);
  };
  return [mk(false), mk(true)];
}

// ---------- THE CROWN IN FLIGHT ----------
export function bakeCrownSpin() {
  const out = [];
  for (let i = 0; i < 8; i++) { const G = blank(24, 24); crown(G, [12, 13], i * 45); out.push(outline(fromGrid(rowsOf(G), PR, 1), OUT)); }
  return out;
}
