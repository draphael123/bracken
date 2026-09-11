// callerram.js — boss redraws: THE WINDCALLER and THE RAM LORD (drafting)
import { canvas, px, rect, line, circle, ellipse, fillPoly, fromGrid, outline, flipX, whiten, mulberry } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(whiten), whiteL = white.map(flipX);
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
const WC_CROOK = [ // the staff's head: a crook, and hung from it a bone cage with the storm in it. The staff enters at col 1.
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
  const W = 40, H = 46, C = WC;
  const P = (g, x, y, k) => px(g, x, y, C[k]);
  const poly = (g, pts, k) => fillPoly(g, pts, C[k]);
  const staff = (g, x0, y0, x1, y1) => { // bottom (x0,y0) to the crook's heel (x1,y1)
    line(g, x0, y0, x1, y1, C.N, 1); line(g, x0 + 1, y0, x1 + 1, y1, C.n, 1);
    stamp(g, x1, y1 - 10, WC_CROOK, C);
    P(g, x1 + 1, y1 - 7, 'b'); P(g, x1 + 1, y1 - 6, 'B'); // a knuckle-bone lashed to the crook
  };
  const ribbons = (g, x, y, wind) => { for (let k = 0; k < 2; k++) line(g, x, y + k * 2, x - wind - k * 2, y + k * 2 + 1 + k, C[k ? 'B' : 'l'], 1); };
  const arm = (g, sx, sy, ex, ey, hx, hy, open) => { // sleeve to the elbow, a bare gaunt forearm, long fingers
    line(g, sx, sy, ex, ey, C.q, 2); line(g, ex, ey, hx, hy, C.g, 1); line(g, ex + 1, ey, hx + 1, hy, C.G, 1);
    if (open) { P(g, hx, hy, 'g'); P(g, hx + 1, hy - 1, 'g'); P(g, hx + 2, hy - 2, 'g'); P(g, hx + 2, hy, 'g'); P(g, hx + 3, hy - 1, 'G'); P(g, hx - 1, hy - 1, 'g'); P(g, hx - 1, hy - 2, 'G'); }
    else { rect(g, hx, hy - 1, 2, 3, C.g); P(g, hx + 1, hy + 1, 'G'); }
  };
  const headdress = (g, ox, oy, wind) => { // ox,oy = the face's top-left
    // feathers first: tall storm feathers raked back by the wind
    for (let k = 0; k < 5; k++) { const bx = ox + 2 + k * 2, tx = bx - wind - (4 - k) + 1, ty = oy - 10 - (k === 2 ? 2 : k === 1 || k === 3 ? 1 : 0);
      line(g, bx, oy - 1, tx, ty, C.f, 1); line(g, bx + 1, oy - 1, tx + 1, ty, C.F, 1); P(g, tx, ty, 'w'); P(g, tx + 1, ty, 'w'); P(g, tx + 1, ty + 1, 'w'); }
    // two long horns, a lyre of them
    const horn = pts => { for (let i = 0; i + 1 < pts.length; i++) line(g, ox + pts[i][0], oy + pts[i][1], ox + pts[i + 1][0], oy + pts[i + 1][1], C[i < 2 ? 'B' : 'b'], 1);
      for (let i = 0; i + 1 < 2; i++) line(g, ox + pts[i][0] + 1, oy + pts[i][1], ox + pts[i + 1][0] + 1, oy + pts[i + 1][1], C.b, 1); };
    horn([[1, -1], [-1, -3], [-3 - wind, -6], [-3 - wind, -9], [-1 - wind, -11]]);
    horn([[10, -1], [12, -3], [13, -6], [13 - (wind > 1 ? 1 : 0), -9], [11, -11]]);
    // the band: bone, with red beads
    rect(g, ox, oy - 1, 12, 2, C.b); rect(g, ox, oy, 12, 1, C.B); for (const x of [2, 6, 10]) P(g, ox + x, oy - 1, 'k');
  };
  const face = (g, ox, oy, open, wind) => {
    fillPoly(g, [[ox + 2, oy + 1], [ox - 5 - wind, oy - 2], [ox + 2, oy + 5]], C.g); line(g, ox + 1, oy + 2, ox - 3 - wind, oy - 1, C.G, 1); // the long back ear, swept
    P(g, ox - 1, oy + 4, 'b'); P(g, ox - 1, oy + 5, 'k'); // a bone in the ear
    stamp(g, ox, oy, open ? WC_FACE_OPEN : WC_FACE, C);
  };
  const feet = (g, a, b, y = 44) => { // back and front foot, long-toed
    rect(g, a, y - 2, 3, 3, C.G); P(g, a - 1, y, 'G'); P(g, a + 3, y, 'd');
    rect(g, b, y - 2, 3, 3, C.g); P(g, b + 3, y, 'g'); P(g, b + 4, y, 'G'); P(g, b, y - 2, 'G');
  };
  // the cloak: a storm-grey mantle from the shoulders that the wind takes out behind him in long rags
  const cloak = (g, pts) => {
    poly(g, pts, 'c');
    const [sx, sy] = pts[0];
    for (let i = 2; i < pts.length - 3; i += 2) { const [x, y] = pts[i]; line(g, sx - 2, sy + 2 + i, x + 3, y, C.C, 1); } // folds run with the wind
    for (let i = 0; i + 1 < 3; i++) line(g, pts[i][0], pts[i][1] + 1, pts[i + 1][0], pts[i + 1][1] + 1, C.l, 1); // light on the top edge
  };
  const robe = (g, dy, hem) => { // a long narrow robe, near-black violet, ragged at the foot
    poly(g, [[15, 22 + dy], [22, 22 + dy], [23, 30], [25, hem], [13, hem], [15, 30]], 'r');
    line(g, 16, 23 + dy, 15, hem - 1, C.R, 1); line(g, 21, 24 + dy, 23, hem - 1, C.q, 1); // shadow at the back, a fold catching light
    for (let x = 13; x <= 25; x += 3) P(g, x, hem, 'r'), P(g, x + 1, hem, 'R');
    rect(g, 15, 31, 9, 1, C.N); // the belt, and what hangs from it: bones and a little skull
    P(g, 17, 32, 'b'); P(g, 17, 33, 'B'); P(g, 17, 34, 'b'); rect(g, 19, 32, 2, 2, C.b); P(g, 19, 33, 'R'); P(g, 22, 32, 'N'); P(g, 22, 33, 'b'); P(g, 22, 34, 'B');
    for (let y = 23 + dy; y < 31; y += 2) P(g, 20, y, 'b'); // a string of finger-bones down his chest
  };
  const mantle = (g, dy) => { // a collar of storm feathers
    poly(g, [[12, 23 + dy], [16, 19 + dy], [23, 20 + dy], [25, 24 + dy], [20, 25 + dy], [15, 26 + dy]], 'f');
    for (const [x, y] of [[13, 23], [16, 25], [19, 24], [22, 24], [24, 23]]) P(g, x, y + dy, 'w');
    for (const [x, y] of [[15, 22], [18, 21], [21, 22]]) P(g, x, y + dy, 'F');
  };
  const frame = ({ cl, st = null, near = null, far = null, open = false, fx = 15, fy = 11, wind = 1, legs = [15, 20], dy = 0, hem = 42, rib = null, after = null }) => {
    const [c, g] = canvas(W, H);
    if (far) arm(g, ...far);
    cloak(g, cl);
    if (legs) feet(g, ...legs);
    robe(g, dy, hem);
    mantle(g, dy);
    if (st) staff(g, ...st);
    if (rib) ribbons(g, ...rib);
    headdress(g, fx, fy, wind); face(g, fx, fy, open, wind);
    if (near) arm(g, ...near);
    outline(c, OUT);
    if (after) after(g, P);
    return c;
  };
  const glowAt = (x, y, big) => (g, P) => { P(g, x, y - 2, 'v'); P(g, x, y + 2, 'v'); P(g, x - 2, y, 'v'); P(g, x + 2, y, 'v'); if (big) { P(g, x - 3, y - 3, 'm'); P(g, x + 3, y - 3, 'v'); P(g, x + 3, y + 3, 'm'); P(g, x - 3, y + 3, 'v'); } };
  const CL_IDLE = [[21, 21], [14, 20], [8, 20], [3, 21], [0, 23], [4, 25], [1, 27], [5, 29], [2, 32], [6, 33], [3, 36], [8, 37], [6, 40], [10, 40], [11, 43], [15, 42], [16, 26]];
  const idle = frame({ cl: CL_IDLE, st: [29, 44, 29, 11], near: [23, 24, 25, 30, 28, 28], rib: [29, 4, 3] });
  const F = [idle, idle, idle, idle, idle, idle];
  return pack(F, 18, 44, 16, 30);
}

export function bakeRamLord() {
  const [c, g] = canvas(8, 8); rect(g, 1, 1, 6, 6, '#888'); outline(c, OUT);
  return pack([c], 4, 7, 6, 6);
}
