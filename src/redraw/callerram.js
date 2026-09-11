// callerram.js — boss redraws: THE WINDCALLER (Gale Moor) and THE RAM LORD (Scree Path), each its own sprite at last.
//
// BOTH ARE DRAWN AT 1x. The integrator must drop the 1.5x boss draw scale for both in src/main.js:
//   const bigF = ... : e.t === 'ram' ? 1.5 : e.t === 'windcaller' ? 1.5 : ...   -> delete both clauses (they fall through to 1).
// Both face RIGHT in the R frames; pack() builds the L mirrors and the white hit-flash sets, as in chars.js.
//
// bakeWindcaller() — NEW. Only SPR.windcaller uses it; the ordinary STORM SHAMAN keeps bakeGoblinShaman().
//   A tall, gaunt moor goblin: lyre horns and barred storm feathers on a bone band, burning violet eyes, a storm-grey cloak
//   the wind drags out behind him in rags, a crook with a bone cage of storm hung from it, finger-bone necklace, bone fetishes.
//   Frames (same order and meaning as bakeGoblinShaman):
//     0 idle
//     1 cast   (castFlash) crook raised and its cage lit; the far claw thrown out at chest height, ~(+12, -15) from the anchor,
//              which is where updateWindcaller spawns the bolt (e.y - 14, 12 px out)
//     2 blink / appear / fallen: down on one knee over the crook, eyes dimmed, violet motes lifting off him (reads as
//              dissolving under the blink alpha flicker, and as knocked down in 'fallen')
//     3 howl   (howlTell / howl, and 'ground') arms and crook flung up, mouth open, cloak thrown wide
//     4 walk1, 5 walk2
//   Canvas 44 x 50. Anchor (ax, ay) = (19, 48): feet centre; ay is the feet's last coloured row (as bakeGoblinShaman).
//   Figure ~36 wide (cloak rags to crook; the body itself ~13) x ~42 tall (crook top to feet), feathers ~39 above the feet.
//   Spawn hitbox: recommend w: 16, h: 32 (feet to brow band) — now w: 18, h: 20 in `case 'windcaller':` of src/main.js.
//
// bakeRamLord() — REDRAWN (replaces chars.js bakeRamLord; the crag goat keeps bakeCragRam).
//   A massive near-black ram: a spiralled, ridged, chipped horn that wraps the whole side of the head and comes out past
//   the cheek iron-banded and iron-pointed, a pale grizzled ruff, roman nose, old scar, red eye, beard, studded war-girth,
//   heavy hooves, breath steam.
//   Frames (same order and meaning as before):
//     0 stand   1 run1 (gathered)   2 run2 (extended)
//     3 lower   (lower / buttTell / leapTell / rear-feint tell) head down, horns forward, forelegs braced, a snort of steam
//     4 crash / land: dazed — legs splayed, head hung, X eyes, tongue out, sparks
//     5 rear    (toss / stamp / call / butt) up on the hind legs, forehooves pawing, head tucked
//     6 leap    forelegs folded, hind legs thrown back
//   Canvas 77 x 59. Anchor (ax, ay) = (34, 57): between the fore and hind hooves; ay is the row just under the hooves
//   (hooves' last coloured row 56, outline on 57 — the old bakeRamLord's convention).
//   Figure ~63 wide (rump -29 .. muzzle +33 of ax) x ~42 tall standing (horn crown to hooves); the rear stands ~52.
//   Spawn hitbox: recommend w: 48, h: 32 (rump to chest, hooves to the hump) — now w: 38, h: 21 in `case 'ramlord':`.
//   The player's jump peaks at ~51 px, so he is still jumped over; the head overhangs the box by ~9 px, so when moveBody
//   stops him against the arena wall on a crash his horns are a few px into it, which is the point of that frame.
import { canvas, px, rect, line, fillPoly, outline, flipX, whiten, mulberry } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
// a text grid stamped straight onto a canvas at (x, y); '.' is transparent
function stamp(g, x, y, rows, pal) {
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const k = r[i]; if (k !== '.' && pal[k]) px(g, x + i, y + j, pal[k]); } });
}

// ---------------------------------------------------------------- THE WINDCALLER
const WC = { g: '#6faa4a', G: '#3f6e2c', d: '#2c4a1e', c: '#6a7088', C: '#474a5e', l: '#9aa2b8', r: '#3a3450', R: '#261f36', q: '#4e4668', b: '#e8dcc0', B: '#b8a888',
  f: '#2e2c3a', F: '#555a6e', w: '#dfe6ee', v: '#c9a0ff', V: '#8a5acc', m: '#f4ecff', n: '#7a5432', N: '#45291a', k: '#c9463d', t: '#f3f0d2', i: '#8a919c' };
const WC_FACE = [ // 3/4 to the right: heavy brow, burning eyes, a hooked nose, hollow cheeks, two tusks
  '..gggggggg...',
  '.gGGGggGGGg..',
  '.gdmvdgdmvgg.',
  '.ggddgggddGgg',
  '..gggggggGggg',
  '..dgggggGGgGg',
  '...dgGGGGgg..',
  '...dtddddtd..',
  '....dgggd....',
  '.....dgd.....',
];
const WC_FACE_OPEN = WC_FACE.slice(0, 5).concat([
  '..dggRRRGGgGg',
  '...dRRRRRgg..',
  '...dtRRRRtd..',
  '....dgggd....',
  '.....dgd.....',
]);
const WC_CROOK = [ // the staff's head: a crook, and hung from it a bone cage with the storm in it. The staff enters at col 0.
  '..NNNN.....',
  '.N....N....',
  'N......N...',
  'N.......i..',
  'N.......i..',
  'N......bbb.',
  'N.....b.v.b',
  'N.....bvmvb',
  'N.....b.v.b',
  'N......bbb.',
  'N.......k..',
];

export function bakeWindcaller() {
  const W = 44, H = 50, XO = 1, YO = 4, C = WC; // drawn with the ground at y=44, then shifted by (XO, YO) for margin and headroom
  const P = (g, x, y, k) => px(g, x, y, C[k]);
  const poly = (g, pts, k) => fillPoly(g, pts, C[k]);
  const staff = (g, x0, y0, x1, y1) => { // bottom (x0,y0) to the crook's heel (x1,y1)
    line(g, x0, y0, x1, y1, C.N, 1); line(g, x0 + 1, y0, x1 + 1, y1, C.n, 1);
    stamp(g, x1, y1 - 10, WC_CROOK, C);
    P(g, x1 + 1, y1 - 7, 'b'); P(g, x1 + 1, y1 - 6, 'B'); // a knuckle-bone lashed to the crook
  };
  const arm = (g, sx, sy, ex, ey, hx, hy, open) => { // sleeve to the elbow, a bare gaunt forearm, long fingers
    line(g, sx, sy, ex, ey, C.q, 2); line(g, ex, ey, hx, hy, C.g, 1); line(g, ex + 1, ey, hx + 1, hy, C.G, 1);
    if (open) { const s = hx >= ex ? 1 : -1; P(g, hx, hy, 'g'); P(g, hx + s, hy - 1, 'g'); P(g, hx + 2 * s, hy - 2, 'g'); P(g, hx + s, hy + 1, 'g'); P(g, hx + 2 * s, hy + 1, 'G'); P(g, hx, hy - 2, 'g'); P(g, hx, hy - 3, 'G'); }
    else { rect(g, hx, hy - 1, 2, 3, C.g); P(g, hx + 1, hy + 1, 'G'); }
  };
  const headdress = (g, ox, oy, wind) => { // ox,oy = the face's top-left
    // four storm feathers, fanned and raked back by the wind
    const tips = [[-5, -5], [-2, -7], [2, -8], [6, -6]];
    tips.forEach(([dx, dy], k) => { const bx = ox + 3 + k * 2, tx = bx + dx - wind - k * 2 + 2, ty = oy + dy;
      line(g, bx, oy - 1, tx, ty, C.l, 1); P(g, tx, ty, 'w'); P(g, Math.round(bx + (tx - bx) * 0.75), Math.round(oy - 1 + (ty - oy + 1) * 0.75), 'f'); P(g, Math.round(bx + (tx - bx) * 0.4), Math.round(oy - 1 + (ty - oy + 1) * 0.4), 'F'); });
    // two long horns, a lyre of them
    const horn = pts => { for (let i = 0; i + 1 < pts.length; i++) line(g, ox + pts[i][0], oy + pts[i][1], ox + pts[i + 1][0], oy + pts[i + 1][1], C[i < 1 ? 'B' : 'b'], 1);
      line(g, ox + pts[0][0] + 1, oy + pts[0][1], ox + pts[1][0] + 1, oy + pts[1][1], C.b, 1); };
    horn([[1, -1], [-1, -3], [-2 - wind, -5], [-2 - wind, -7], [0 - wind, -8]]);
    horn([[10, -1], [12, -3], [13, -5], [13, -7], [11, -8]]);
    // the band: bone, with red beads
    rect(g, ox, oy - 1, 12, 2, C.b); rect(g, ox, oy, 12, 1, C.B); for (const x of [2, 6, 10]) P(g, ox + x, oy - 1, 'k');
  };
  const face = (g, ox, oy, open, wind, dim) => {
    fillPoly(g, [[ox + 2, oy + 1], [ox - 5 - wind, oy - 2], [ox + 2, oy + 5]], C.g); line(g, ox + 1, oy + 2, ox - 3 - wind, oy - 1, C.G, 1); // the long back ear, swept
    P(g, ox - 1, oy + 4, 'b'); P(g, ox - 1, oy + 5, 'k'); // a bone in the ear
    stamp(g, ox, oy, open ? WC_FACE_OPEN : WC_FACE, dim ? Object.assign({}, C, { m: C.V, v: C.d }) : C);
  };
  const feet = (g, a, b) => { // back and front foot, long-toed
    rect(g, a, 42, 3, 3, C.G); P(g, a - 1, 44, 'G'); P(g, a + 3, 44, 'd');
    rect(g, b, 42, 3, 3, C.g); P(g, b + 3, 44, 'g'); P(g, b + 4, 44, 'G'); P(g, b, 42, 'G');
  };
  // the cloak: a storm-grey mantle from the shoulders that the wind takes out behind him in long rags
  const cloak = (g, pts0) => {
    const pts = pts0.map(([x, y]) => [x < 16 ? Math.round(16 - (16 - x) * 0.8) : x, y]); // (authored wide, pulled in a fifth)
    poly(g, pts, 'c');
    const [sx, sy] = pts[0];
    for (let i = 3; i < pts.length - 3; i += 2) { const [x, y] = pts[i]; line(g, sx - 3, sy + 2 + (i >> 1), x + 3, y, C.C, 1); } // folds run with the wind
    for (let i = 0; i + 1 < 3; i++) line(g, pts[i][0], pts[i][1] + 1, pts[i + 1][0], pts[i + 1][1] + 1, C.l, 1); // light on the top edge
  };
  const robe = (g, top, hem, kneel) => { // a long narrow robe, near-black violet, pinched at the waist, ragged at the foot
    const pts = kneel ? [[16, top], [22, top], [24, 36], [27, hem], [11, hem], [14, 36]] : [[15, top], [22, top], [22, 31], [25, hem], [13, hem], [16, 31]];
    poly(g, pts, 'r');
    line(g, pts[0][0] + 1, top + 1, pts[4][0] + 2, hem - 1, C.R, 1); line(g, pts[1][0] - 1, top + 2, pts[3][0] - 2, hem - 1, C.q, 1); // shadow at the back, a fold catching light
    for (let x = pts[4][0]; x <= pts[3][0]; x += 3) { P(g, x, hem, 'r'); P(g, x + 1, hem + 1, 'R'); }
    const by = kneel ? 36 : 31; rect(g, pts[5][0], by, pts[2][0] - pts[5][0] + 1, 1, C.N); // the belt, and what hangs from it: bones and a little skull
    P(g, 17, by + 1, 'b'); P(g, 17, by + 2, 'B'); P(g, 17, by + 3, 'b'); rect(g, 19, by + 1, 2, 2, C.b); P(g, 19, by + 2, 'R'); P(g, 21, by + 1, 'N'); P(g, 21, by + 2, 'b'); P(g, 21, by + 3, 'B');
  };
  const mantle = (g, dy) => { // a collar of storm feathers, and a necklace of finger-bones
    poly(g, [[12, 23 + dy], [16, 19 + dy], [23, 20 + dy], [25, 24 + dy], [20, 25 + dy], [15, 26 + dy]], 'f');
    for (const [x, y] of [[13, 23], [16, 25], [19, 25], [22, 24], [24, 23]]) P(g, x, y + dy, 'w');
    for (const [x, y] of [[15, 22], [18, 21], [21, 22]]) P(g, x, y + dy, 'F');
    for (const [x, y] of [[18, 26], [20, 27], [22, 26]]) P(g, x, y + dy, 'b');
  };
  const frame = ({ cl, st = null, near = null, far = null, open = false, fx = 15, fy = 12, wind = 1, legs = [15, 20], farOver = false, bob = 0, robeTop = 22, hem = 42, kneel = false, dim = false, mdy = 0, after = null }) => {
    const [c, g] = canvas(W, H);
    g.save(); g.translate(XO, YO);
    if (legs) feet(g, ...legs);
    g.translate(0, -bob);
    if (far && !farOver) arm(g, ...far);
    cloak(g, cl);
    if (far && farOver) arm(g, ...far);
    robe(g, robeTop, hem + bob, kneel);
    mantle(g, mdy);
    if (st) staff(g, ...st);
    headdress(g, fx, fy, wind); face(g, fx, fy, open, wind, dim);
    if (near) arm(g, ...near);
    g.restore();
    outline(c, OUT);
    if (after) { g.save(); g.translate(XO, YO - bob); after(g, P); g.restore(); }
    return c;
  };
  const spark = (x, y, big) => (g, P) => { P(g, x, y - 2, 'v'); P(g, x, y + 2, 'v'); P(g, x - 2, y, 'v'); P(g, x + 2, y, 'v'); if (big) { P(g, x - 3, y - 3, 'm'); P(g, x + 3, y - 3, 'v'); P(g, x + 3, y + 3, 'm'); P(g, x - 3, y + 3, 'v'); } };
  const both = (...fs) => (g, P) => fs.forEach(f => f(g, P));
  // 0 idle: leaning on the crook, the cloak out behind him
  const idle = frame({ cl: [[21, 21], [14, 20], [8, 19], [3, 19], [0, 21], [4, 23], [1, 26], [5, 28], [2, 31], [6, 32], [3, 35], [8, 36], [5, 39], [10, 39], [10, 43], [14, 42], [16, 26]],
    st: [29, 44, 29, 13], near: [22, 24, 25, 30, 28, 28] });
  // 1 cast: the crook up and the storm in it lit; the other claw thrown out at chest height, where the bolt leaves
  const cast = frame({ cl: [[21, 21], [14, 19], [7, 17], [2, 17], [0, 19], [3, 21], [0, 24], [4, 26], [0, 29], [5, 30], [1, 34], [6, 35], [3, 38], [9, 38], [8, 42], [13, 42], [16, 26]],
    st: [26, 39, 29, 9], near: [22, 24, 25, 21, 27, 16], far: [16, 24, 22, 29, 29, 29, true], open: true, wind: 2,
    after: both(spark(31, 29, true), spark(37, 2, false)) });
  // 2 fallen / dissolving: down on one knee over the crook, the light going out of him, motes rising off the cloak
  const fallen = frame({ cl: [[21, 30], [14, 29], [8, 30], [4, 33], [1, 37], [4, 38], [0, 41], [5, 42], [4, 44], [12, 44], [16, 34]],
    st: [31, 44, 28, 22], near: [22, 33, 24, 38, 29, 34], fx: 17, fy: 25, wind: -1, legs: [11, 21], robeTop: 31, hem: 43, kneel: true, dim: true, mdy: 10,
    after: (g, P) => { for (const [x, y, k] of [[3, 30, 'v'], [7, 26, 'm'], [1, 34, 'V'], [12, 24, 'v'], [5, 22, 'v'], [10, 19, 'm'], [26, 18, 'v'], [2, 27, 'm']]) P(g, x, y, k); } });
  // 3 howl: arms flung up, the crook high, mouth open on the call, the cloak thrown wide
  const howl = frame({ cl: [[21, 21], [14, 17], [8, 14], [3, 13], [0, 15], [3, 17], [0, 20], [4, 22], [0, 25], [5, 27], [1, 31], [6, 32], [2, 36], [8, 37], [5, 41], [11, 40], [11, 43], [15, 42], [16, 26]],
    st: [27, 38, 30, 9], near: [22, 24, 26, 19, 28, 14], far: [15, 23, 10, 20, 6, 14, true], farOver: true, open: true, fx: 15, fy: 11, wind: 3,
    after: both(spark(38, 3, true), spark(6, 9, false)) });
  // 4 / 5 walk: a long stride, the crook swung and planted
  const walk1 = frame({ cl: [[21, 21], [14, 20], [8, 19], [3, 20], [0, 22], [4, 24], [1, 27], [5, 29], [2, 32], [6, 33], [4, 36], [8, 37], [6, 40], [10, 40], [11, 43], [14, 42], [16, 26]],
    st: [31, 44, 31, 13], near: [22, 24, 26, 29, 30, 28], legs: [12, 23] });
  const walk2 = frame({ cl: [[21, 21], [14, 20], [8, 19], [3, 18], [0, 20], [4, 22], [1, 25], [5, 27], [2, 30], [6, 31], [3, 34], [8, 35], [6, 38], [10, 38], [10, 42], [14, 41], [16, 26]],
    st: [27, 43, 28, 12], near: [22, 24, 24, 29, 27, 27], legs: [16, 19], bob: 1 });
  return pack([idle, cast, fallen, howl, walk1, walk2], 19, 48, 16, 32);
}

// ---------------------------------------------------------------- THE RAM LORD
// Drawn into a buffer of palette keys first (so the fleece can be shaded by what is around each pixel), then rendered.
// The buffer keeps DX columns left of design-x 0 and DY rows above design-y 0, so a reared pose can go above the top of the standing one.
function keyBuf(W, H, DX, DY) {
  const K = new Array(W * (H + DY)).fill(null), HH = H + DY;
  const set = (x, y, k) => { x = Math.floor(x) + DX; y = Math.floor(y) + DY; if (x >= 0 && y >= 0 && x < W && y < HH) K[y * W + x] = k; };
  const get = (x, y) => { x += DX; y += DY; return (x < 0 || y < 0 || x >= W || y >= HH) ? null : K[y * W + x]; };
  const g = { fillStyle: null, fillRect(x, y, w, h) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, this.fillStyle); } };
  return { K, g, get, set, W, HH };
}
const RM = {
  u: '#4e443c', U: '#342c28', z: '#221c1a', h: '#6a5e54', H: '#86796c', // the fleece: near-black brown, grizzled on top
  m: '#857a6b', a: '#a89c8a', A: '#c4b8a4', // the ruff, and the paler muzzle and beard
  o: '#c9b27c', O: '#8a7448', e: '#eadcae', E: '#5a4828', // horn
  i: '#8a919c', I: '#4e5562', j: '#dfe6ee', // iron
  k: '#231d1a', K: '#5a5048', // hooves
  n: '#6a4a2a', N: '#3e2616', // harness leather
  r: '#ff4a3a', s: '#c98a7a', p: '#c9463d', y: '#ffd36b', w: '#eef2f6', W: '#b8c4d0',
};

export function bakeRamLord() {
  const W = 77, H = 48, DX = 5, DY = 11; // design space: hooves' last row at y=45; DX/DY of margin and headroom (the rear) around it
  const rot = (x, y, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };
  const A = { hf: [10, 28], hn: [16, 29], ff: [37, 28], fn: [45, 29] }; // where the legs leave the body
  const frame = ({ bodyA = 0, pivot = [16, 31], off = [0, 0], poll = [48, 13], headA = 0.08, legs, steam = 0, daze = false, sparks = false, mouth = false }) => {
    const B = keyBuf(W, H, DX, DY), g = B.g;
    const T = (x, y) => { const [X, Y] = rot(x, y, pivot[0], pivot[1], bodyA); return [X + off[0], Y + off[1]]; };
    const polyT = (pts, k) => fillPoly(g, pts.map(p => T(p[0], p[1])), k);
    const oval = (cx, cy, rx, ry, k, xf = T) => { const pts = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; pts.push(xf(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry)); } fillPoly(g, pts, k); };
    const thick = (x0, y0, x1, y1, w0, w1, k) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2)); for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, w = w0 + (w1 - w0) * t; rect(g, Math.round(x - w / 2), Math.round(y - w / 2), Math.round(w), Math.round(w), k); } };
    // the head rides on the body at the poll, then turns by its own angle
    const [PX, PY] = T(poll[0], poll[1]);
    const HT = (x, y) => { const [X, Y] = rot(x, y, 0, 0, headA); return [PX + X, PY + Y]; };
    const polyH = (pts, k) => fillPoly(g, pts.map(p => HT(p[0], p[1])), k);
    const setH = (x, y, k) => { const [X, Y] = HT(x + 0.5, y + 0.5); B.set(X, Y, k); };
    // ---- a horn: a thick spiral from the top of the skull back, down and round beside the cheek; ridged; iron-banded at the tip
    const horn = (cx, cy, far) => {
      const a0 = -1.3, a1 = -6.55, r0 = 8, rm = 5.7, r1 = 8.6, w0 = 6.6, w1 = 2.2, steps = 560; let L = 0, prev = null;
      const pos = t => { const a = a0 + (a1 - a0) * t, r = t < 0.72 ? r0 + (rm - r0) * t / 0.72 : rm + (r1 - rm) * (t - 0.72) / 0.28; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
      for (let i = 0; i <= steps; i++) {
        const t = i / steps, w = w0 + (w1 - w0) * t, [x, y] = pos(t);
        if (prev) L += Math.hypot(x - prev[0], y - prev[1]); prev = [x, y];
        const p0 = pos(Math.max(0, t - 0.002)), p1 = pos(Math.min(1, t + 0.002)), tx = p1[0] - p0[0], ty = p1[1] - p0[1], tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
        const [wx0, wy0] = HT(x, y), [wx1, wy1] = HT(x + nx, y + ny), wn = [wx1 - wx0, wy1 - wy0];
        for (let s = -w / 2; s <= w / 2; s += 0.3) {
          if (!far && t > 0.33 && t < 0.37 && s > w / 2 - 1.6) continue; // a chip out of the horn
          const lit = -(wn[0] + wn[1]) * 0.7071 * (s / (w / 2)); // light from the upper left
          const ridge = (L % 2.7) < 0.9 && Math.abs(s) < w / 2 - 0.4;
          let k = far ? (lit > 0.35 ? 'o' : lit < -0.2 ? 'E' : ridge ? 'E' : 'O') : (lit > 0.45 ? (ridge ? 'o' : 'e') : lit < -0.35 ? (ridge ? 'E' : 'O') : ridge ? 'O' : 'o');
          if (!far && t > 0.83 && t < 0.88) k = lit > 0.4 ? 'j' : lit < -0.3 ? 'I' : 'i'; // an iron band
          if (!far && t > 0.955) k = lit > 0.2 ? 'j' : 'i'; // and an iron point
          const [X, Y] = HT(x + nx * s, y + ny * s); B.set(X, Y, k);
        }
      }
    };
    // ---- legs: a shaggy thigh, a knee, a thin cannon, a heavy hoof
    const leg = (tx, ty, kx, ky, hx, hy, near) => {
      thick(tx, ty, kx, ky, 6, 4, near ? 'u' : 'U'); thick(kx, ky, hx, hy - 2, 3.2, 3, near ? 'u' : 'U');
      if (near) { thick(kx + 1, ky, hx + 1, hy - 2, 1, 1, 'U'); B.set(Math.round(kx) - 2, Math.round(ky), 'h'); } // shade down the front of the cannon, a tuft at the knee
      rect(g, Math.round(hx) - 2, Math.round(hy) - 1, 5, 2, 'k'); rect(g, Math.round(hx) - 2, Math.round(hy) - 2, 5, 1, 'K'); // the hoof
    };
    const L4 = legs.map(([id, kx, ky, hx, hy]) => { const [tx, ty] = T(...A[id]); return kx === 'rel' ? [id, tx, ty, tx + ky, ty + hx, tx + hy[0], ty + hy[1]] : [id, tx, ty, kx, ky, hx, hy]; });
    for (const [id, ...p] of L4) if (id === 'hf' || id === 'ff') leg(...p, false);
    horn(-4, 3, true); // the far horn, peeking over the skull
    // ---- the body: rump, barrel, the great hump of the shoulders, the neck
    polyT([[6, 18], [1, 16], [0, 20], [4, 23]], 'u');
    oval(14, 24, 10, 8.5, 'u'); oval(28, 25, 15, 8, 'u'); oval(41, 20, 10.5, 10.5, 'u');
    polyT([[35, 13], [45, 8], [51, 13], [52, 25], [44, 28]], 'u');
    // shade the fleece: grizzled light along the top, dark along the belly and the front edges, curls throughout
    const rng = mulberry(7);
    const K0 = B.K.slice(), at = (x, y) => { x += DX; y += DY; return (x < 0 || y < 0 || x >= W || y >= B.HH) ? null : K0[y * W + x]; };
    for (let y = -DY; y < H; y++) for (let x = -DX; x < W - DX; x++) { if (at(x, y) !== 'u') continue;
      const up = at(x, y - 1), up2 = at(x, y - 2), dn = at(x, y + 1), dn2 = at(x, y + 2), lf = at(x - 1, y);
      if (!up) B.set(x, y, 'H'); else if (!up2 || !lf) B.set(x, y, 'h');
      else if (!dn) B.set(x, y, 'z'); else if (!dn2 || !at(x + 1, y)) B.set(x, y, 'U');
      else if (rng() < 0.14) { B.set(x, y, 'h'); if (at(x + 1, y + 1) === 'u') B.set(x + 1, y + 1, 'U'); } }
    // the ruff: a pale grizzled mane down the throat and chest, ragged at the bottom
    polyT([[42, 16], [50, 14], [54, 22], [53, 28], [54, 33], [51, 31], [50, 35], [47, 31], [45, 34], [43, 30], [40, 32], [39, 24]], 'm');
    for (const [x, y] of [[45, 19], [48, 22], [44, 24], [50, 26], [46, 28], [42, 27], [51, 18]]) { const [X, Y] = T(x, y); B.set(X, Y, 'a'); B.set(X + 1, Y + 1, 'U'); }
    // a war-harness: a girth strap behind the shoulder, iron-studded, with a buckle plate
    { const s0 = T(33, 14), s1 = T(32, 32); thick(s0[0], s0[1], s1[0], s1[1], 2, 2, 'n'); for (let k = 0; k < 4; k++) { const t = 0.12 + k * 0.25; B.set(s0[0] + (s1[0] - s0[0]) * t, s0[1] + (s1[1] - s0[1]) * t, 'i'); }
      const [bx, by] = T(32, 24); rect(g, Math.round(bx) - 1, Math.round(by) - 1, 3, 3, 'I'); B.set(bx - 1, by - 1, 'j'); }
    // ---- near legs over the body
    for (const [id, ...p] of L4) if (id === 'hn' || id === 'fn') leg(...p, true);
    // ---- the head: a long roman-nosed face, pale at the muzzle, a beard, a scar, a red eye under a heavy brow
    polyH([[-4, -3], [3, -4], [9, -1], [13, 3], [15, 6], [15, 9], [13, 11], [8, 11], [4, 9], [0, 7], [-4, 3]], 'u');
    polyH([[11, 3], [14, 4], [15.5, 7], [15, 10], [12, 11], [10, 8]], 'a');
    polyH([[6, 10], [11, 11], [10, 15], [8, 13], [7, 15], [5, 12]], 'a'); setH(7, 12, 'A'); setH(9, 12, 'A');
    for (const [x, y] of [[0, -3], [2, -4], [4, -3], [6, -2], [8, -1], [10, 1], [12, 3]]) setH(x, y, 'h');
    for (const [x, y] of [[5, 8], [7, 9], [9, 9]]) setH(x, y, 'U');
    setH(14, 6, 'z'); setH(14, 7, 'z'); if (mouth) { setH(12, 10, 'p'); setH(13, 10, 'p'); setH(13, 11, 'p'); } else { setH(12, 10, 'U'); setH(13, 10, 'U'); }
    if (daze) { setH(5, 0, 'z'); setH(7, 0, 'z'); setH(6, 1, 'z'); setH(5, 2, 'z'); setH(7, 2, 'z'); }
    else { setH(4, 0, 'z'); setH(5, 0, 'z'); setH(6, 0, 'z'); setH(7, 1, 'z'); setH(5, 1, 'z'); setH(6, 1, 'r'); setH(6, 2, 'U'); }
    for (const [x, y] of [[8, -2], [9, -1], [9, 0], [10, 1], [11, 2]]) setH(x, y, 's'); // an old scar down the brow
    { const [ex, ey] = HT(-6, 4); oval(0, 0, 3.9, 3.9, 'U', (x, y) => [ex + x, ey + y]); } // the hollow inside the curl
    setH(-7, 3, 'm'); setH(-6, 3, 'a'); setH(-6, 4, 's'); setH(-5, 4, 'm'); // the ear, down in it
    // the near horn, the signature: it curls round the whole side of the head and comes out forward, iron on the point
    horn(-6, 4, false);
    const [c, cg] = canvas(W, B.HH);
    for (let y = 0; y < B.HH; y++) for (let x = 0; x < W; x++) { const k = B.K[y * W + x]; if (k) px(cg, x, y, RM[k]); }
    outline(c, OUT);
    // breath steam and impact sparks go on after the outline: they are air, not body
    const [NX, NY] = HT(15.5, 6.5);
    if (steam) { const d = steam > 1 ? 1.6 : 0.75; for (const [x, y, k] of [[2, -1, 'w'], [3, -2, 'W'], [4, -1, 'w'], [5, -3, 'W'], [2, 1, 'W'], [7, -2, 'w'], [8, -4, 'W'], [5, 0, 'w']]) px(cg, Math.round(NX + x * d) + DX, Math.round(NY + y * d) + DY, RM[k]); }
    if (sparks) for (const [x, y] of [[-14, -6], [-10, -11], [-4, -12], [-16, 0], [2, -13]]) px(cg, Math.round(PX + x) + DX, Math.round(PY + y) + DY, RM.y);
    return c;
  };
  const F = [
    // 0 stand: head high, blowing
    frame({ steam: 1, legs: [['hf', 7, 36, 9, 45], ['hn', 14, 37, 16, 45], ['ff', 37, 36, 37, 45], ['fn', 45, 36, 46, 45]] }),
    // 1 run, gathered: legs under him
    frame({ off: [0, -1], poll: [49, 14], headA: 0.3, legs: [['hf', 14, 35, 18, 43], ['hn', 19, 36, 23, 45], ['ff', 33, 36, 31, 43], ['fn', 40, 37, 38, 45]] }),
    // 2 run, extended: legs flung fore and aft
    frame({ off: [0, -2], poll: [49, 14], headA: 0.3, legs: [['hf', 4, 33, 2, 41], ['hn', 9, 35, 6, 44], ['ff', 43, 34, 49, 40], ['fn', 51, 35, 56, 43]] }),
    // 3 lower: the tell. Head down, horns forward, forelegs braced, a snort of steam
    frame({ bodyA: 0.06, poll: [50, 15], headA: 0.95, steam: 2, legs: [['hf', 5, 36, 5, 45], ['hn', 11, 37, 11, 45], ['ff', 40, 37, 44, 45], ['fn', 48, 37, 52, 45]] }),
    // 4 crash / land: legs splayed, head hung, eyes gone, tongue out
    frame({ off: [0, 3], poll: [50, 15], headA: 0.55, daze: true, mouth: true, sparks: true, legs: [['hf', 4, 40, 3, 45], ['hn', 11, 41, 9, 45], ['ff', 42, 41, 45, 45], ['fn', 50, 41, 54, 45]] }),
    // 5 rear: up on the hind legs, forehooves pawing, head tucked to bring the horns down
    frame({ bodyA: -0.42, poll: [50, 15], headA: 0.1, mouth: true, legs: [['hf', 6, 38, 9, 45], ['hn', 12, 38, 15, 45], ['ff', 'rel', 7, 1, [9, 8]], ['fn', 'rel', 10, -2, [13, 5]]] }),
    // 6 leap: forelegs folded, hind legs thrown back
    frame({ bodyA: -0.12, off: [0, -3], poll: [49, 13], headA: 0.15, legs: [['hf', 'rel', -4, 5, [-9, 8]], ['hn', 'rel', -3, 6, [-8, 9]], ['ff', 'rel', 4, 5, [0, 8]], ['fn', 'rel', 5, 5, [1, 9]]] }),
  ];
  return pack(F, 29 + DX, 46 + DY, 48, 32);
}

