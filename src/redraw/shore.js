// shore.js — THE LONG WATER's wildlife: river and shore creatures the creeping sea has pushed inland and turned mean.
// New bakers. All frames face RIGHT (L is the flip); every frame of a sprite shares one canvas, so the anchor holds.
// Anchors follow chars.js: ax = the body's centre column, ay = the outline row just under the lowest pixel (lowest
// pixel on ay-1, in every frame). Parts are char grids stamped onto a blank frame grid; parts that cross the body are
// laid with an inner outline (layer(), as soldiers.js); the eel's body is rasterised into its grid along a centreline
// (tube()); each frame grid is settle()d onto its floor row, then fromGrid + OUT outline. Reach points are in canvas
// pixels relative to the anchor.
//
// bakeTurtle()  SNAPPING TURTLE — heavy river turtle: knobbly dark domed shell of quilted scutes with pale edges and a
//   serrated rear rim, weed sprouting on top and trailing down its back, a big blunt head with an amber eye and a
//   hooked pale beak, thick legs with pale claws, a pointed tail.
//   frames: 0 walk (near fore leg reaching, near hind pushed back), 1 walk (swapped), 2 SNAP (body lurches 1 px on,
//           neck shot out, beak gaping red), 3 HIDE (head and legs pulled in, shell down on its plastron, an eye
//           glinting in the dark front opening, claw tips showing)
//   canvas 35x13 (grid 33x11; 11 px tall, 25 long walking)   anchor ax 11, ay 12   pack w/h 16x10
//   reach: walk beak front x ax+14, y ay-7..ay-4 (hook tip ay-4); SNAP beak tip x ax+22 (8 past frame 0), y ay-8..ay-7
//
// bakeEel()  EEL — long dark eel: dark flank, lit back edge, pale belly, a fin fringe round the tail, a blunt head
//   with a glinting pale eye and a row of teeth along the mouth.
//   frames: 0, 1 swim (S-curves in opposite phase, swinging widest at the tail), 2 LUNGE (body straightened, jaws
//           flung open top and bottom, surging 3 px further forward), 3 CURL (hurt: body wound into a ring, head dropped
//           on the ground beside it, eye shut, jaw hanging)
//   canvas 33x12 (grid 31x10; 7 px tall, 28 long swimming)   anchor ax 14, ay 11 (belly on ay-1)   pack w/h 20x8
//   reach: swim snout x ax+14, y ay-4; LUNGE upper jaw tip x ax+17, y ay-5 (jaws span ay-7..ay-1)
//
// bakeHeronFoe()  GREY HERON — tall wader: white face and neck with black streaks, black crest stripe and plume, grey
//   back and folded wing with dark primaries, white breast plumes, long yellow-brown legs, a yellow dagger bill.
//   frames: 0 STAND (neck folded in an S), 1 STEP (near leg drawn up, toes curled), 2 STRIKE TELL (crouched, neck
//           wound back so the head sits low over the shoulders, crest raised, eye flares red, bill cocked down),
//           3 STRIKE (pitched forward, far leg thrown back, neck and bill driven out and down, eye red), 4 FLY A (wings
//           up, neck tucked, legs trailing), 5 FLY B (wings down, body lifted)
//   canvas 32x27 (grid 30x25; 25 px feet to crown standing)   anchor ax 13, ay 26   pack w/h 10x20
//   reach: STRIKE bill tip x ax+14, y ay-8 (knee height); STAND bill tip x ax+11, y ay-24; TELL bill tip x ax+4, y ay-16
//
// bakeCrab()  SHORE CRAB grown too big — seen head-on as it scuttles sideways: broad red-brown shell lit along the top,
//   eyes on stalks, one big claw on the leading (facing) side and a small one behind, three jointed legs a side.
//   frames: 0, 1 sidestep (the two sides' legs alternate), 2 CLAWS UP (both claws raised high over the eyes, pincers
//           open: guard / threat), 3 FLIPPED (on its back: pale belly and apron up, legs pedalling, claws limp — the
//           weak state)
//   canvas 25x16 (grid 23x14; 12 px tall, 23 wide with legs)   anchor ax 12, ay 15   pack w/h 14x9
//   reach: big claw fingertips x ax+6..ax+10, y ay-12, its front edge x ax+11, y ay-10..ay-9; CLAWS UP big pincer
//          tips x ax+5..ax+6 and ax+10..ax+11, y ay-14 (small pincer tips x ax-10 / ax-8, y ay-14)
import { fromGrid, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

// same as chars.js (whiten through a lambda: .map(whiten) would pass the index as the colour and bake black sheets)
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
// a char grid to lay parts onto: stamp() writes a block of rows at (x, y), '.' is see-through
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const stamp = (G, x, y, rows) => rows.forEach((r, j) => { const row = G[y + j]; if (!row) return; for (let i = 0; i < r.length; i++) { const k = r[i], xx = x + i; if (k === '.' || xx < 0 || xx >= row.length) continue; row[xx] = k === ' ' ? '.' : k; } });
const rowsOf = G => G.map(r => r.join(''));
// drop a frame's drawing onto the grid's bottom row, so every frame's lowest pixel lands on ay-1
function settle(G) {
  let low = G.length - 1; while (low >= 0 && G[low].every(k => k === '.')) low--;
  const n = G.length - 1 - low; if (n <= 0 || low < 0) return G;
  const w = G[0].length; for (let i = 0; i < n; i++) { G.pop(); G.unshift(Array(w).fill('.')); }
  return G;
}
// draw a part on its own grid, then lay it over G with a 1-px OUT line wherever it sits on something already drawn
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

// ---------- TURTLE ----------
const TU = { o: OUT, K: '#7a8a4a', S: '#5a6a3a', s: '#3e4a28', d: '#2a3218', w: '#7aa84a', W: '#4a7a30',
  j: '#9a9068', h: '#6e6848', H: '#46422c', b: '#d0c490', B: '#8a7e58', e: '#f0c040', c: '#e8e0c0', m: '#c05050', p: '#a89660' };
export function bakeTurtle() {
  const W = 33, H = 11;
  const q = G => outline(fromGrid(rowsOf(settle(G)), TU, 1), OUT);
  const SHELL = [
    '....KS..KS..KS...',
    '...KKSsKKSsKKSs..',
    '.KSSssdSssdSssds.',
    'KKSSsKKSSsKKSSsKs',
    'KSSssKSSssKSSssSd',
    'SssddSssddSssddsd',
    'KSdKSdKSdKSdKSdKd',
    'd.d.dddddddddddd.',
  ];
  // weed over the shell: a sprout between the knobs, a strand draped down the back
  const WEED = ['.......w', '......w.', '..w.....', '.wW.....', 'W.......', 'W.......', 'W.......', 'W.......'];
  const HEAD = [
    '..jjjj..',
    '.jjhhjh.',
    'jhhhheoh',
    'hhhhhhhb',
    'HhhhHbbb',
    '.HHHBBHb',
  ];
  const SNAPHEAD = [
    '..jjjjj...',
    '.jjhhhjbb.',
    'jhhheohhbB',
    'hhhhHmmm.B',
    'hhhHmmm...',
    'HHhhhbb...',
    '.HHHHBb...',
  ];
  const TAIL = ['..jh', '.hhH', 'hH..'];
  // near legs (lit skin, pale claws) and far legs (shadow) — reaching forward or pushed back
  const NEAR = { fwd: ['jhH..', '.jhH.', '.hHcc'], back: ['..jhH', '.jhH.', 'hHcc.'] };
  const FAR = { fwd: ['HHH..', '.HHH.', '.HHBB'], back: ['..HHH', '.HHH.', 'HHBB.'] };
  const walk = (step, snap) => {
    const G = blank(W, H), dx = snap ? 1 : 0;
    stamp(G, 0 + dx, 5, TAIL);
    if (step === 0) { stamp(G, (snap ? 10 : 12) + dx, 8, FAR.back); stamp(G, 5 + dx, 8, FAR.fwd); }
    else { stamp(G, 15 + dx, 8, FAR.fwd); stamp(G, 2 + dx, 8, FAR.back); }
    stamp(G, 5 + dx, 8, ['pppppppppp']);
    stamp(G, 2 + dx, 0, SHELL);
    stamp(G, 2 + dx, 0, WEED);
    if (snap) layer(G, g => { stamp(g, 18 + dx, 4, ['jjjjjjj', 'hhhhhhh', 'HHHHHHH']); stamp(g, 22 + dx, 1, SNAPHEAD); });
    else layer(G, g => { stamp(g, 17, 5, ['hh', 'HH']); stamp(g, 17, 2, HEAD); });
    if (snap) layer(G, g => { stamp(g, 14 + dx, 8, NEAR.back); stamp(g, 3 + dx, 8, NEAR.back); });
    else if (step === 0) layer(G, g => { stamp(g, 15, 8, NEAR.fwd); stamp(g, 2, 8, NEAR.back); });
    else layer(G, g => { stamp(g, 12, 8, NEAR.back); stamp(g, 6, 8, NEAR.fwd); });
    return q(G);
  };
  const hide = () => {
    const G = blank(W, H);
    stamp(G, 2, 2, SHELL);
    stamp(G, 2, 2, WEED.slice(0, 7));
    stamp(G, 3, 10, ['.pppppppppppp..']);
    stamp(G, 16, 8, ['.ddd', 'deod', 'cc.c']);
    stamp(G, 2, 10, ['c']);
    return q(G);
  };
  return pack([walk(0), walk(1), walk(0, true), hide()], 11, 12, 16, 10);
}

// ---------- EEL ----------
const EE = { o: OUT, a: '#5e7672', m: '#3e5452', d: '#2a3a3a', b: '#a8b8a0', e: '#f8f0b0', t: '#f4f0dc', r: '#8a2a30', f: '#4e6664' };
// a tapered tube along a centreline (pts tail -> head, each [x, y, r]); every cell takes its nearest sample and is
// shaded by which side of the spine it sits on: back edge m, flank d, belly b; a fin fringe f past the body radius
function tube(G, pts, fin = 0) {
  const n = pts.length;
  for (let y = 0; y < G.length; y++) for (let x = 0; x < G[0].length; x++) {
    let bi = -1, bd = 1e9;
    for (let i = 0; i < n; i++) { const dx = x + 0.5 - pts[i][0], dy = y + 0.5 - pts[i][1], d = dx * dx + dy * dy; if (d < bd) { bd = d; bi = i; } }
    const [px, py, r] = pts[bi], d = Math.sqrt(bd), f = fin && bi < n * 0.45 ? fin * (1 - bi / (n * 0.45)) + 0.35 : 0;
    if (d > r + f) continue;
    const a = pts[Math.max(0, bi - 1)], c = pts[Math.min(n - 1, bi + 1)], tx = c[0] - a[0], ty = c[1] - a[1], tl = Math.hypot(tx, ty) || 1;
    const v = ((x + 0.5 - px) * (ty / tl) + (y + 0.5 - py) * (-tx / tl)) / Math.max(r, 0.01);
    G[y][x] = d > r ? 'f' : v > 0.45 ? 'm' : v < -0.55 ? 'b' : 'd';
  }
}
export function bakeEel() {
  const W = 31, H = 10;
  const q = G => outline(fromGrid(rowsOf(settle(G)), EE, 1), OUT);
  const HEAD = [
    '.mmaa...',
    'dddmeoa.',
    'ddddddmm',
    'drtrtrt.',
    'bbbbbb..',
  ];
  const HEADOPEN = [
    '.mmaa....',
    'dddmeoaa.',
    'ddddddmmm',
    'dddtrtrt.',
    'ddrrrrr..',
    'ddbtbtbt.',
    'bbbbbbbb.',
  ];
  // tail at x0, neck at x1; the wave swings widest at the tail and dies out at the neck
  const path = (x0, x1, yc, amp, ph) => { const pts = []; for (let x = x0; x <= x1; x += 0.25) { const u = (x - x0) / (x1 - x0); pts.push([x, yc + amp * (0.2 + 0.8 * (1 - u)) * Math.sin(x / 2.1 + ph), 0.5 + 1.2 * Math.min(1, u * 1.7)]); } return pts; };
  const swim = ph => {
    const G = blank(W, H);
    tube(G, path(1, 22, 6, 2.6, ph), 0.8);
    stamp(G, 20, 4, HEAD);
    return q(G);
  };
  const lunge = () => {
    const G = blank(W, H), pts = [];
    for (let x = 0; x <= 23; x += 0.25) pts.push([x, 7, 0.5 + 1.5 * Math.min(1, x / 12)]);
    tube(G, pts, 0.8);
    stamp(G, 22, 3, HEADOPEN);
    return q(G);
  };
  // hurt: the tail and body wound into a ring, the neck arched over it and the head dropped on the ground beside it,
  // eye shut, jaw hanging open
  const curl = () => {
    const G = blank(W, H), ring = [], neck = [];
    for (let t = 0; t <= 1; t += 0.003) { const th = 0.3 + t * Math.PI * 1.7; ring.push([9 + 4 * Math.cos(th), 5.4 + 3.4 * Math.sin(th), 0.5 + 0.8 * Math.min(1, t * 1.3)]); }
    const [x0, y0] = ring[ring.length - 1];
    for (let t = 0; t <= 1; t += 0.02) { const u = 1 - t; neck.push([u * u * x0 + 2 * u * t * 15.5 + t * t * 16.5, u * u * y0 + 2 * u * t * 3 + t * t * 6.5, 1.3 + 0.3 * t]); }
    tube(G, ring);
    layer(G, g => { tube(g, neck); stamp(g, 16, 4, ['.mmaa...', 'ddmmoma.', 'dddddmmm', 'ddrtrt..', 'bbrrrrt.', '.bbbbb..']); });
    return q(G);
  };
  return pack([swim(0), swim(Math.PI), lunge(), curl()], 14, 11, 20, 8);
}

// ---------- HERON ----------
const HE = { o: OUT, g: '#c8d0d4', G: '#8a96a0', D: '#5e6a74', w: '#eef2f0', k: '#26262e', y: '#e0b040', Y: '#a07820', e: '#f0d040', E: '#ff5a2a', l: '#c8a868', L: '#8a6a40' };
export function bakeHeronFoe() {
  const W = 30, H = 25;
  const q = rows => outline(fromGrid(rowsOf(settle(rows.map(r => r.split('')))), HE, 1), OUT);
  const BODY = [
    '..........ggggggw.............',
    '.......gggggGGGkww............',
    '.....ggGGGGGGGGkww............',
    '....gGGGGGGGGGGGkww...........',
    '...DGGGGGGGGGGGGwww...........',
    '..kDDGGGGGGGGGGgwww...........',
    '.kkDDDDDGGGGGggwgw............',
    '.k.....ggggggg.w.w............',
  ];
  const stand = q([
    '..............kkkw............',
    '..........kkkkwkewyyyyyy......',
    '..............wwwwYYYY........',
    '...............gww............',
    '..............gw..............',
    '.............gw...............',
    '.............gk...............',
    '.............gw...............',
    '..............gk..............',
    ...BODY,
    '..........L..l................',
    '..........L..l................',
    '..........L..l................',
    '..........L..l................',
    '..........L..l................',
    '..........L..l................',
    '..........L..l................',
    '.........LLL.lll..............',
  ]);
  const step = q([
    '..............kkkw............',
    '..........kkkkwkewyyyyyy......',
    '..............wwwwYYYY........',
    '...............gww............',
    '..............gw..............',
    '.............gw...............',
    '.............gk...............',
    '.............gw...............',
    '..............gk..............',
    ...BODY,
    '..........L..l................',
    '..........L..l................',
    '..........L..ll...............',
    '..........L...ll..............',
    '..........L....l..............',
    '..........L...ll..............',
    '..........L...................',
    '.........LLL..................',
  ]);
  // tell: crouched, the neck wound back into a tight S so the head sits low over the shoulders, crest up, eye flared,
  // the bill cocked down at the target
  const tell = q([
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '.....kk.......................',
    '......kk......................',
    '.......kkkkw..................',
    '........kwEwyy................',
    '........wwwwYyyy..............',
    '..........gwwYYyy.............',
    '...........gw.................',
    '............gww...............',
    '...........gwwk...............',
    '.......ggggggkw...............',
    '.....gggggGGkkww..............',
    '....ggGGGGGGGkww..............',
    '...gGGGGGGGGGGwww.............',
    '..DDGGGGGGGGGgwww.............',
    '.kkDDDDGGGGgggwgw.............',
    'kk....ggggggg.w.w.............',
    '.........L...l................',
    '.........L...l................',
    '........LL..ll................',
    '........L...l.................',
    '.......LLL..lll...............',
  ]);
  // strike: the whole bird pitched forward, neck and bill driven out and down, bill tip 14 ahead of ax at knee height
  const strike = q([
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    'kk............................',
    '.kkD..........................',
    '..kDDgg.......................',
    '...DGGGggg....................',
    '....GGGGGGggg.................',
    '.....GGGGGGGkgg...............',
    '......gGGGGGGkwww.............',
    '.......ggGGGGGkwww............',
    '.........gggggwwwgw...........',
    '..........LL..l.gww...........',
    '..........L...l..kgw.kk.......',
    '.........LL...l...gwkkEwyy....',
    '.........L....l....wwwwYYyy...',
    '........LL....l......wwYY.....',
    '........L.....l...............',
    '.......LL.....l...............',
    '.......L......l...............',
    '......LL......l...............',
    '......L......lll..............',
    '....LLL.......................',
  ]);
  const flyA = q([
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..kk..........................',
    '..kDkk........................',
    '...kDDkk......................',
    '....kDDGGg....................',
    '.....kDGGgg...................',
    '......DGGGgg..................',
    '.......GGGGg..................',
    '........GGGgg.................',
    '.........GGgg....kkkw.........',
    '..........Ggg...kkwkew........',
    '.........ggGgggggwwwwyyyyy....',
    '.....gggggGGGGGGgwwwYYY.......',
    '...kkDDGGGGGGGGGkww...........',
    'LLLkDDDGGGGGGGGgww............',
    '...LLkgggggggggww.............',
    '.....L........................',
    '..............................',
    '..............................',
  ]);
  const flyB = q([
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '..............................',
    '...................kkkw.......',
    '..................kkwkew......',
    '...........ggggg.gwwwwyyyyy...',
    '.....ggggggGGGGggwwwYYY.......',
    '...kkDDGGGGGGGGGgww...........',
    'LLLkDDDGGGGGGGGGgw............',
    '...LLkggGGGGGGgggw............',
    '.....L..GGGGGGGg..............',
    '.......DGGGGGGg...............',
    '......DDGGGGGg................',
    '.....kDDGGGGg.................',
    '....kkDDGGg...................',
    '....kkDDg.....................',
    '.....kk.......................',
  ]);
  return pack([stand, step, tell, strike, flyA, flyB], 13, 26, 10, 20);
}

// ---------- CRAB ----------
const CR = { o: OUT, r: '#b8483a', R: '#8a3028', h: '#e07060', p: '#e8c8a8', P: '#c0a080', x: '#2a1a1a', l: '#ffffff', d: '#5a2018', t: '#f0d8c0' };
export function bakeCrab() {
  const W = 23, H = 14;
  const q = G => outline(fromGrid(rowsOf(settle(G)), CR, 1), OUT);
  const mir = rows => rows.map(r => r.split('').reverse().join(''));
  const SHELL = [
    '..hhhhhhhhhh..',
    '.hhrrhrrrrhrrR',
    'hrrrrrrrrrrrrR',
    'RrrrrrrrrrrrRR',
    '.RRRdRRRRdRRR.',
  ];
  const EYES = ['l....l', 'x....x', 'R....R'];
  const BIG = ['.tt.tt.', '.hrdrd.', 'hhrrrRd', 'hrrrrRR', '.RRRRR.', '..rR...'];
  const SMALL = ['.tt..', 'hrd..', 'hrR..', '.rR..', '..rr.', '...rr'];
  const BIGUP = ['tt...td', 'hr...rd', 'hrr.rRd', '.hrrrR.', '.hrrRR.', '..RRR..', '..rR...', '.rR....'];
  const SMALLUP = ['t.t..', 'r.d..', 'rrR..', '.rR..', '..rr.', '...r.', '...rr', '....r'];
  // three jointed legs a side: thigh out from under the shell, knee, shin down to a dark tip; each side wears the
  // other set, so the two sides step alternately
  const LEGS = {
    a: ['rrr......', 'R.rrr....', 'R........', 'R.rrrrr.r', 'R.R.....R', 'd.d.....d'],
    b: ['.rrr.....', '.R.rr....', '.R.......', '.d.rrrr.r', '...R....R', '...d....d'],
  };
  const walk = (k, up) => {
    const G = blank(W, H), K = k === 'a' ? 'b' : 'a';
    stamp(G, 0, 8, LEGS[k]); stamp(G, 14, 8, mir(LEGS[K]));
    stamp(G, 9, 3, EYES);
    stamp(G, 5, 6, SHELL);
    if (up) layer(G, g => { stamp(g, 1, 0, SMALLUP); stamp(g, 16, 0, BIGUP); });
    else layer(G, g => { stamp(g, 1, 2, SMALL); stamp(g, 16, 2, BIG); });
    return q(G);
  };
  // flipped: on its back, pale belly and apron up, legs pedalling the air, claws dropped limp either side
  const flipped = () => {
    const G = blank(W, H);
    stamp(G, 0, 3, [
      '......d..........d.....',
      '...d..R..........R..d..',
      '...R..R..........R..R..',
      '...R.rr..........rr.R..',
      '...rrr............rrr..',
      '.....rppppppppppppr....',
      '....ppPppppPPppppPpp...',
      '....PppPppPppPppPpphhh.',
      '.th..PPpppPppPpppPrhrrr',
      'trRrrrRRRRRRRRRRRrrrRRt',
      '.dR.....RRrrrrRR..RRRR.',
    ]);
    return q(G);
  };
  return pack([walk('a'), walk('b'), walk('a', true), flipped()], 12, 15, 14, 9);
}
