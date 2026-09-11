// tidebound.js — THE TIDEBOUND, the remnant of a drowned high-elven realm (graceful, ancient, cold), and the human
// fisherfolk of Saltreach. New bakers, not redraws. All frames face RIGHT (L is the flip). Every frame of a sprite
// shares one canvas, so the anchor holds. Anchors follow chars.js: ax = the body's centre column, ay = the outline row
// just under the feet (lowest body pixel on ay-1, its outline on ay). Parts are char grids stamped onto a blank frame
// grid; limbs, tails, hafts, blades and the cape are rasterised into the same grid (limb / gline / gpoly), parts that
// cross the body are laid with an inner outline (layer()), then fromGrid + OUT outline. Reach points are canvas
// pixels relative to the anchor. The Tidebound look: pale sea-foam skin, aqua-glowing eyes, kelp-dark or foam-white
// hair, coral and verdigris-bronze armour, mother-of-pearl accents, kelp cloaks, barnacle crusts; tall, slim, pointed ears.
//
// bakeScout()  TIDEBOUND SCOUT — slim hooded elf in a kelp cloak (face in the hood's shadow, one lit eye), dark
//   verdigris jerkin, coral belt, bronze greaves, a light harpoon (bronze shaft, pearl head with one barb).
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (harpoon carried upright; body drops on contact)
//           4 watch (still, harpoon upright, head turned to the viewer, both eyes glowing, ear tips out of the hood)
//           5 throw tell (leaning back, harpoon drawn back over the shoulder, front arm aiming)
//           6 throw (lunging, throwing arm whipped out in front, hand open and EMPTY, smear arc)
//   canvas 28x24 (grid 26x22; 19 px feet to hood tip)   anchor ax 13, ay 23   pack w/h 8x16
//   reach: walk/watch harpoon upright at ax+5, point ay-20; tell harpoon point ax+7, ay-18 (butt ax-12, ay-10);
//          throw hand (release point) ax+8, ay-11, fingertips ax+9, ay-12
//
// bakeSiren()  SIREN — a sea-maiden sitting (the game draws the rock): fish tail curled beneath her with a pearl fin
//   trailing, long kelp-dark hair, pointed ear, a thin pearl-and-coral shell necklace, coral shell top.
//   frames: 0 idle (hair drifting down her back, hand in her lap), 1 sing A (mouth open, arms spread wide, hair lifted
//           and fanned back), 2 sing B (arms up in a V, hair streaming up and over; alternate with 1),
//           3 dive (arched over like a leaping fish, fin flicked up behind, head-first, joined hands reaching down)
//   canvas 26x24 (grid 24x22; 19 px tail to crown sitting)   anchor ax 11, ay 23 (lowest tail/fin pixel on ay-1)
//   pack w/h 12x16   dive: hands at ax+10, ay-1
//
// bakeTideguard()  TIDEGUARD — armoured Tidebound soldier: coral breastplate, pauldron and tassets over verdigris,
//   a coral helm with a pearl fin crest and a dark eye-slit glowing at its front, a long bronze trident (pearl points).
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (trident carried upright in the front hand)
//           4 guard (braced wide, trident held across the body at 45 degrees, tines up and forward)
//           5 thrust tell (crouched and coiled back, trident drawn back level, butt far behind, eye-slit flares)
//           6 thrust (lunge, trident driven straight out at chest height, eye-slit flares)
//   canvas 46x30 (grid 44x28; 23 px feet to crest tip)   anchor ax 21, ay 29   pack w/h 10x20
//   reach: walk tines top ay-26 (haft at ax+6); guard tines ax+13, ay-19; tell tines ax+4, ay-10 (butt ax-20, ay-10);
//          THRUST centre tine tip ax+20, ay-13
//
// bakeHerald()  THE TIDE HERALD (boss) — an old elven knight in barnacled coral-and-bronze plate: a tall swept coral
//   fan crest, an open helm showing a pale old face with one glowing eye and a laid-back pointed ear, foam-white hair to
//   the shoulders, pearl gorget, a long kelp cape, and a CORAL GLAIVE (31 px bronze haft, pearl collar, 12 px curved
//   coral blade, edge on the convex side, tip swept back).
//   frames: 0 idle (glaive grounded upright beside him), 1 walk (stately step, near foot forward),
//           2 walk (other foot, cape swings back), 3 sweep tell (twisted back, glaive drawn back low behind him),
//           4 sweep (lunging, glaive swept low and wide in front, blade near the ground, smear along the ground),
//           5 thrust tell (coiled back, glaive pulled back level at shoulder height), 6 thrust (lunge, driven straight out),
//           7 raise (glaive raised overhead in both hands, blade glowing pale with a halo — calling the tide),
//           8 stagger (bent over, near knee dipping, glaive tip stuck in the mud), 9 kneel (defeated: on one knee,
//           head bowed, glaive upright beside him, cape pooled)
//   canvas 76x52 (grid 74x50; 43 px feet to crest top)   anchor ax 37, ay 51   pack w/h 18x36
//   reach: idle glaive at ax+12, blade top ay-46; sweep tell blade tip ax-33, ay-5; SWEEP blade tip ax+30, ay-6
//          (the blade lies low in front, from about ax+17 out to the tip); thrust tell tip ax+15, ay-29 (butt ax-30,
//          ay-25); THRUST tip ax+34, ay-29 (haft at ay-25); raise blade tip ax+25, ay-48 (glow halo to ay-50);
//          stagger blade tip in the mud ax+19, ay-2
//
// bakeFisher(v)  FISHERFOLK of Saltreach (humans): v 0 fisherman (red knit cap, grey beard, yellow-ochre oilskin,
//   boots), v 1 fishwife (headscarf, blue shawl, apron over a brown skirt). Own palette FP.
//   frames: 0 run (stride), 1 run (passing), 2 cower (crouched, arms over head), 3 wave (one arm up, cheering)
//   canvas 16x16 (grid 14x14; 14 px feet to cap)   anchor ax 7, ay 15   pack w/h 8x12
//
// bakeFisherIcon()  a 10x10 HUD icon (outlined canvas, no pack): the fisherman's face under his knit cap.
import { px, fromGrid, outline, flipX, whiten } from '../px.js';
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
const put = (G, x, y, k) => { if (G[y] && x >= 0 && x < G[y].length) G[y][x] = k; };
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
// a 1-px line (Bresenham) into a grid; k is a char or (i, n) => char along the line; returns the points
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
// scanline polygon into a grid (pixel-centre sampling); pick(x, y) gives the char
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

// ---------- THE TIDEBOUND PALETTE ----------
// sea-foam skin h/s/S, glowing eye e, open mouth m; kelp-dark hair n/N, elder foam hair f/F; coral c/r/R;
// verdigris bronze z/b/B (+ D, the far side's darkest); mother-of-pearl p/P; kelp k/K/q; barnacle a/A;
// the siren's tail scales t/T/y; the tide's glow x/X
const TB = { o: OUT, h: '#d6ece6', s: '#a8cfc6', S: '#7aa89e', e: '#7ff0e0', m: '#3a2030',
  n: '#2f524c', N: '#1f3a36', f: '#e8f4f0', F: '#b0c8c2',
  c: '#f0a890', r: '#e07a6a', R: '#a04a44',
  z: '#6ab8a8', b: '#4a9a8a', B: '#2f6a60', D: '#1f4640',
  p: '#eef4f4', P: '#c8d8e0',
  k: '#6a8a3a', K: '#4a6a2a', q: '#2e4a1e',
  a: '#c8c0b0', A: '#9a9080',
  t: '#7ad0d0', T: '#3f96a4', y: '#27607a',
  x: '#f4fffc', X: '#a8f4ea' };

// a swing's smear: a pale sea-foam arc of radius r round (cx, cy) in canvas pixels, from angle a0 to a1 (degrees,
// 0 = ahead, -90 = straight up), drawn after the outline and only on empty pixels; the last 60% gets a second band inside
function smear(c, cx, cy, r, a0, a1, maxY = Infinity) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 2) for (const [rr, col] of [[r, '#e4fbf6'], [r - 1, a > a0 + (a1 - a0) * 0.4 ? '#9fdcd0' : null]]) {
    if (!col) continue;
    const x = Math.round(cx + rr * Math.cos(a * Math.PI / 180)), y = Math.round(cy + rr * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= c.width || y >= c.height || y > maxY) continue;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, col);
  }
}

// ---------- SCOUT ----------
export function bakeScout() {
  const W = 26, H = 22, X = 12;
  const q = G => outline(fromGrid(rowsOf(G), TB, 1), OUT);
  // parts share one local frame whose column 5 is the body's centre: hood + face, cloak + jerkin, legs
  // the face sits in the hood's shadow so the one lit eye reads as a glow
  const HEAD = [
    'qK.......',
    '.qKkK....',
    '..qKkkkK.',
    '..qKkNNNk',
    '..qKNSSeh',
    '..qKKSsS.',
    '...qKKS..',
  ];
  // head turned to the viewer: both eyes lit, ear tips out through the hood's slits
  const HEAD_F = [
    '....qKq....',
    '...qKkKq...',
    '..qKkkkKq..',
    '..qNNNNNq..',
    '.hqSeSeSqh.',
    '..qKSsSKq..',
    '...qKSKq...',
  ];
  const TORSO = [
    '...qKpB..',
    '..qkKzbB.',
    '..qkKbbB.',
    '..qKKbbB.',
    '..qKKrrR.',
    '...qK.bB.',
  ];
  // near leg: kelp thigh K, bronze greave z/b, bronze boot b; far leg: q thigh, B greave, D boot
  const LEGS = {
    a: ['....qqKK.....', '...qq..KK....', '...qB...zb...', '..qB....zb...', '..BB.....zb..', '.DDD.....bbb.'],
    b: ['....qqKK.....', '....qqKK.....', '....qBzb.....', '...qB.zb.....', '...DD.zb.....', '......bbb....'],
    c: ['....KKqq.....', '...KK..qq....', '...zb...qB...', '..zb....qB...', '..zb.....BB..', '.bbb.....DDD.'],
    d: ['....KKqq.....', '....KKqq.....', '....zbqB.....', '...zb.qB.....', '...bb.qB.....', '......DDD....'],
    stand: ['....qqKK.....', '....qqKK.....', '....qBzb.....', '...qB..zb....', '...BB..zb....', '..DDD..bbb...'],
    brace: ['....qqKK.....', '...qq...KK...', '..qB.....zb..', '..qB......zb.', '..BB......zb.', '.DDD......bbb'],
    lunge: ['.....qqKK....', '....qq...KK..', '...qB....zb..', '..qB.....zb..', '.qB......zb..', 'DD.......bbb.'],
  };
  // the harpoon: a bronze shaft, a pearl head and one barb hooked back
  const harpoon = (G, bx, by, tx, ty) => {
    const pts = gline(G, bx, by, tx, ty, 'b'), n = pts.length;
    pts.slice(n - 2).forEach(([x, y]) => put(G, x, y, 'p'));
    const [x3, y3] = pts[n - 3], ux = Math.sign(tx - bx), uy = Math.sign(ty - by);
    put(G, x3, y3, 'P');
    put(G, x3 - uy - (ux && uy ? ux : 0), y3 + ux, 'P');
  };
  const arm = (G, sh, el, hd, sleeve = 'b', skin = 's') => { gline(G, sh[0], sh[1], el[0], el[1], sleeve); gline(G, el[0], el[1], hd[0], hd[1], skin); put(G, hd[0], hd[1], skin === 's' ? 'h' : 's'); };
  const frame = ({ legs, dx = 0, dy = 0, hx = 0, pose = 'walk' }) => {
    const G = blank(W, H), B = X + dx, O = B - 5;
    if (pose === 'tell') arm(G, [B + 2, 11 + dy], [B + 4, 11 + dy], [B + 6, 10 + dy], 'B', 'S');
    if (pose === 'throw') arm(G, [B, 11 + dy], [B - 2, 12 + dy], [B - 4, 13 + dy], 'B', 'S');
    stamp(G, O, 16, LEGS[legs]);
    stamp(G, O, 10 + dy, TORSO);
    if (pose === 'watch') stamp(G, O - 1, 3 + dy, HEAD_F); else stamp(G, O + hx, 3 + dy, HEAD);
    if (pose === 'walk' || pose === 'watch') { harpoon(G, B + 5, 20, B + 5, 1 + dy); arm(G, [B + 2, 11 + dy], [B + 3, 12 + dy], [B + 5, 14 + dy], 's'); }
    if (pose === 'tell') { harpoon(G, B - 11, 12 + dy, B + 8, 4 + dy); arm(G, [B + 1, 11 + dy], [B - 1, 10 + dy], [B - 3, 9 + dy], 's'); }
    if (pose === 'throw') { arm(G, [B + 1, 11 + dy], [B + 4, 11 + dy], [B + 7, 10 + dy], 's'); put(G, B + 8, 10 + dy, 's'); put(G, B + 8, 9 + dy, 's'); }
    const c = q(G);
    if (pose === 'throw') smear(c, 1 + B + 1, 1 + 11 + dy, 7, -95, -25);
    return c;
  };
  return pack([
    frame({ legs: 'a', dy: 1 }), frame({ legs: 'b' }), frame({ legs: 'c', dy: 1 }), frame({ legs: 'd' }),
    frame({ legs: 'stand', pose: 'watch' }),
    frame({ legs: 'brace', dx: -1, hx: -1, pose: 'tell' }),
    frame({ legs: 'lunge', dx: 1, hx: 1, dy: 1, pose: 'throw' }),
  ], X + 1, H + 1, 8, 16);
}

// ---------- SIREN ----------
export function bakeSiren() {
  const W = 24, H = 22, X = 10, FL = H - 1;
  const q = G => outline(fromGrid(rowsOf(G), TB, 1), OUT);
  // profile to the right: hair over the back of the head, a pointed ear through it, the eye under a dark fringe
  const HEAD = [
    '..nnnN..',
    '.nnnNNN.',
    'nnNhNNNs',
    'nNnsSseh',
    'nNNnssS.',
    '.nNnSS..',
  ];
  const TORSO = [
    '..sS..',
    '.hpPpS',
    '.hssrS',
    '.hcrcS',
    '..hsS.',
  ];
  // long hair behind her: 0 drifting down her back, 1 lifted and fanned back, 2 streaming up and over
  const HAIR = [
    ['.......nn..', '......nnNN.', '.....nnNNN.', '.....nNNN..', '....nnNN...', '....nNNN...', '...nnNN....', '...nNNN....', '..nnNN.....', '..nNN......', '..nN.......', '...N.......'],
    ['...........', '......nnn..', '..nnnnnNN..', 'nnnNNNNNN..', '.NNnnNNN...', 'N..nNNN....', '..nnNN.....', '.nNN.......', 'nN.........', '...........', '...........', '...........'],
    ['.nn........', 'nnNn.......', '.NnNn.nnn..', '..NnNnnNNN.', '...nNNNNN..', '....nNNN...', '...nnNN....', '..nNNN.....', '..NN.......', '...........', '...........', '...........'],
  ];
  const FIN = ['...pP', '..pPP', '.pPpP', 'pPPPP', '.PPp.'];
  const tail = G => {
    const pts = [[X, 14, 4.6], [X + 1, 16.5, 4.2], [X + 2.5, 18.8, 3.6], [X + 5, 20, 3.0], [X + 7.5, 20.2, 2.4]];
    for (let i = 0; i + 1 < pts.length; i++) limb(G, pts[i], pts[i + 1], (pts[i][2] + pts[i + 1][2]) / 2, ['y', 'T', 't']);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (G[y][x] === 'T' && (x + 2 * y) % 5 === 0) G[y][x] = 'y';
    stamp(G, X + 8, 17, FIN);
  };
  // arms are thin capsules laid with an inner outline so they read over her skin and hair
  const arm = (G, sh, el, hd, far) => layer(G, g => { const R = far ? ['S', 's', 's'] : ['S', 's', 'h']; limb(g, sh, el, 1.5, R); limb(g, el, hd, 1.4, R); put(g, hd[0], hd[1], far ? 's' : 'h'); });
  const sit = ({ hair, sing = 0 }) => {
    const G = blank(W, H);
    stamp(G, X - 8, 3, HAIR[hair]);
    tail(G);
    stamp(G, X - 2, 9, TORSO);
    const head = HEAD.map((r, i) => (sing && i === 4 ? 'nNNnssm.' : r));
    stamp(G, X - 4, 3, head);
    if (sing === 1) arm(G, [X - 1, 10], [X - 4, 9], [X - 7, 8], true);
    if (sing === 2) arm(G, [X - 1, 10], [X - 4, 7], [X - 5, 2], true);
    if (!sing) arm(G, [X + 2, 10], [X + 3, 12], [X + 4, 14]);
    if (sing === 1) arm(G, [X + 2, 10], [X + 5, 9], [X + 8, 8]);
    if (sing === 2) arm(G, [X + 2, 10], [X + 4, 6], [X + 5, 1]);
    return q(G);
  };
  // dive: arched over like a leaping fish, fin flicked down behind, head and joined hands plunging at the bottom
  const dive = () => {
    const G = blank(W, H);
    const pts = [[4, 8, 2.2], [6, 5, 2.8], [9, 3.2, 3.4], [12.5, 3.2, 3.8], [15, 5.5, 4.2], [16.5, 8.5, 4.4]];
    for (let i = 0; i + 1 < pts.length; i++) limb(G, pts[i], pts[i + 1], (pts[i][2] + pts[i + 1][2]) / 2, ['y', 'T', 't']);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (G[y][x] === 'T' && (x + 2 * y) % 5 === 0) G[y][x] = 'y';
    stamp(G, 1, 8, ['..pP', '.pPP', 'pPpP', 'PP.P']);
    layer(G, g => { limb(g, [16.5, 9], [17.5, 12.5], 3.6, ['S', 's', 'h']); put(g, 18, 10, 'p'); put(g, 18, 11, 'r'); put(g, 17, 11, 'P'); });
    // hair streaming back up over her shoulders; her face turned down to the water between her reaching arms
    gline(G, 15, 13, 12, 10, 'N'); gline(G, 14, 14, 11, 12, 'n');
    stamp(G, 14, 13, ['.nnN.', 'nNNNh', 'nNSse', '.Nsss', '..SS.']);
    layer(G, g => { limb(g, [19, 11], [20, 16], 1.6, ['S', 's', 'h']); limb(g, [20, 16], [20, 21], 1.5, ['S', 's', 'h']); put(g, 20, 21, 'h'); });
    return q(G);
  };
  return pack([sit({ hair: 0 }), sit({ hair: 1, sing: 1 }), sit({ hair: 2, sing: 2 }), dive()], X + 1, H + 1, 12, 16);
}

// ---------- TIDEGUARD ----------
export function bakeTideguard() {
  const W = 44, H = 28, X = 20, FL = H - 1;
  const q = G => outline(fromGrid(rowsOf(G), TB, 1), OUT);
  const NEAR = ['B', 'b', 'z'], FAR = ['D', 'B', 'b'];
  // coral helm, a verdigris fin crest rising at the back, and a dark eye-slit with the glow at its front
  const HELM = [
    'P......',
    'pP.....',
    '.pPp...',
    '..pPpPp',
    '.RcccrR',
    '.RccrrR',
    '.RrNNee',
    '.RrrrR.',
    '..RRr..',
  ];
  const TORSO = [
    '...BzB..',
    '..BcccR.',
    '.BbccrrR',
    '.BbcrrrR',
    '.BbRrrR.',
    '..BzbbB.',
    '..RcrcR.',
    '..BbBbB.',
  ];
  const PAULDRON = ['.cc.', 'crrR', 'RrR.'];
  const leg = (G, hip, knee, ank, near, lift = 0) => {
    const R = near ? NEAR : FAR;
    limb(G, hip, knee, 2.3, R); limb(G, knee, [ank[0], ank[1] - lift], 2.0, R);
    put(G, knee[0], knee[1], near ? 'c' : 'R');
    stamp(G, ank[0] - 1, FL - 1 - lift, near ? ['zb..', 'Bbbb'] : ['BD..', 'DDDD']);
  };
  const arm = (G, sh, el, hd, near) => {
    const R = near ? NEAR : FAR;
    limb(G, sh, el, 2.2, R); limb(G, el, hd, 2.0, R);
    put(G, hd[0], hd[1], near ? 'z' : 'b');
  };
  // the trident: a long bronze haft, a crossbar, two side tines and a longer centre tine, pearl points
  const trident = (G, b, t) => {
    const L = Math.hypot(t[0] - b[0], t[1] - b[1]), u = [(t[0] - b[0]) / L, (t[1] - b[1]) / L], n = [-u[1], u[0]];
    const P = (d, s = 0) => [Math.round(b[0] + u[0] * d + n[0] * s), Math.round(b[1] + u[1] * d + n[1] * s)];
    gline(G, ...P(0), ...P(L - 4), 'b');
    put(G, ...P(0), 'B');
    const sp = Math.abs(u[0]) > 0.3 && Math.abs(u[1]) > 0.3 ? 2.9 : 2;
    gline(G, ...P(L - 4, -sp), ...P(L - 4, sp), 'B');
    for (const s of [-sp, sp]) { gline(G, ...P(L - 4, s), ...P(L - 1.5, s), 'z'); put(G, ...P(L - 1.5, s), 'p'); }
    gline(G, ...P(L - 4), ...P(L), 'z'); put(G, ...P(L), 'p');
  };
  const frame = ({ dx = 0, dy = 0, hx = 0, legs, arms, tri, glare = false }) => {
    const G = blank(W, H), B = X + dx;
    layer(G, g => arm(g, [B - 2, 15 + dy], ...arms.far, false));
    if (tri.back) layer(G, g => trident(g, tri.b, tri.t));
    layer(G, g => leg(g, [B - 1, 20 + dy], ...legs.far, false, legs.farLift));
    layer(G, g => leg(g, [B + 1, 20 + dy], ...legs.near, true, legs.nearLift));
    stamp(G, B - 4, 13 + dy, TORSO);
    const helm = glare ? HELM.map((r, i) => (i === 6 ? '.RrNexx' : r)) : HELM;
    layer(G, g => stamp(g, B - 3 + hx, 5 + dy, helm));
    if (!tri.back) layer(G, g => trident(g, tri.b, tri.t));
    layer(G, g => { arm(g, [B + 2, 15 + dy], ...arms.near, true); stamp(g, B + 1, 14 + dy, PAULDRON); });
    return q(G);
  };
  // legs: { far: [knee, ankle], near: [knee, ankle] }
  const walk = (i) => {
    const s = [1, 0, -1, 0][i], dy = s ? 1 : 0, B = X;
    const legs = s ? { far: [[B - 1 - 2 * s, 23 + dy], [B - 1 - 3 * s, FL - 1]], near: [[B + 1 + 2 * s, 23 + dy], [B + 1 + 3 * s, FL - 1]] }
      : i === 1 ? { far: [[B, 23], [B - 2, FL - 1]], near: [[B + 1, 23], [B + 1, FL - 1]], farLift: 1 }
        : { far: [[B - 1, 23], [B - 1, FL - 1]], near: [[B + 2, 23], [B, FL - 1]], nearLift: 1 };
    return frame({ dy, legs, arms: { far: [[B - 3, 18 + dy], [B - 3 + s, 20 + dy]], near: [[B + 3, 18 + dy], [B + 6, 18 + dy]] }, tri: { b: [B + 6, 25 + dy], t: [B + 6, 1 + dy] } });
  };
  const guard = frame({ dy: 1, legs: { far: [[X - 4, 23], [X - 5, FL - 1]], near: [[X + 4, 23], [X + 5, FL - 1]] },
    arms: { far: [[X - 1, 19], [X + 1, 18]], near: [[X + 4, 16], [X + 5, 14]] }, tri: { b: [X - 7, 25], t: [X + 12, 6] } });
  const tell = frame({ dx: -2, dy: 2, hx: -1, glare: true, legs: { far: [[X - 7, 24], [X - 7, FL - 1]], near: [[X + 2, 23], [X + 4, FL - 1]] },
    arms: { far: [[X - 1, 19], [X + 1, 18]], near: [[X - 3, 19], [X - 6, 18]] }, tri: { b: [X - 20, 18], t: [X + 4, 18] } });
  const thrust = frame({ dx: 2, dy: 1, hx: 1, glare: true, legs: { far: [[X - 3, 23], [X - 6, FL - 1]], near: [[X + 7, 22], [X + 8, FL - 1]] },
    arms: { far: [[X + 2, 17], [X + 4, 15]], near: [[X + 6, 16], [X + 10, 15]] }, tri: { b: [X - 5, 15], t: [X + 20, 15] } });
  return pack([walk(0), walk(1), walk(2), walk(3), guard, tell, thrust], X + 1, H + 1, 10, 20);
}

// ---------- TIDE HERALD ----------
export function bakeHerald() {
  const W = 74, H = 50, X = 36, FL = H - 1, HL = 31, BL = 12;
  const P = Object.assign({}, TB, { u: '#6a5a40', U: '#3e3426' });
  const q = G => outline(fromGrid(rowsOf(G), P, 1), OUT);
  const NEAR = ['B', 'b', 'z'], FAR = ['D', 'B', 'b'];
  // coral fan crest, barnacled at the root; bronze dome; coral brow; an old pale face with one lit eye in a dark socket,
  // a long ear laid back through foam-white hair that falls to his shoulders
  const HEAD = [
    '...cccc.........',
    '..crrRrcc.......',
    '..RrrRrrRcc.....',
    '...RrrRrrRrc....',
    '....RrrRrrRrc...',
    '...AaRRRRRRRRa..',
    '...BzzzzzzzzbB..',
    '..BzzbbbbbbbbbB.',
    '..BbRRcccccrrrRB',
    '.fBbBSSSSNNNS...',
    '.hsSBSshsSeNh...',
    '.fFBBsssssSss...',
    '.FfBBsSsssSs....',
    '.fFfBBsSsSs.....',
    '.fFfFBBSSS......',
    '..fFfFF.........',
    '..FfFf..........',
    '...FF...........',
  ];
  const TORSO = [
    '......PppppP......',
    '.....BzzzzbbB.....',
    '....BzzzbbbbbB....',
    '...BzzbbrcrbbbB...',
    '...BzbbrcccrbbB...',
    '...BzbbbrrrbbbB...',
    '...BzbbbbrbbbbB...',
    '....BbbbbbbbbB....',
    '....RcccpcccrR....',
    '....BbbbbbbbbB....',
    '...RcrRcrRcrRcR...',
    '...RrrRrrRrrRrR...',
    '...aRRAaRRaARRA...',
    '....BbB.BbB.BbB...',
  ];
  const PAUL_N = ['..cccc..', '.crrrrR.', 'crrcrrRR', 'aRrrRAR.', '.AaRR...'];
  const PAUL_F = ['.RRRR.', 'RRrrRD', 'DRRRD.'];
  const stampShear = (G, x, y, rows, k) => rows.forEach((r, i) => stamp(G, x + Math.round(k * (1 - i / (rows.length - 1))), y + i, [r]));
  const elbow = (sh, hd, L, side) => { const dx = hd[0] - sh[0], dy = hd[1] - sh[1], d = Math.hypot(dx, dy) || 1, h = Math.sqrt(Math.max(0, L * L - d * d / 4)); return [(sh[0] + hd[0]) / 2 - dy / d * h * side, (sh[1] + hd[1]) / 2 + dx / d * h * side]; };
  const axis = gl => { const a = gl.deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]]; return { u, n, at: (d, s = 0) => [gl.butt[0] + u[0] * d + n[0] * s, gl.butt[1] + u[1] * d + n[1] * s] }; };
  // the glaive: a bronze haft, a pearl collar, and a long curved coral blade (edge on the convex side, tip swept back)
  const glaive = (G, gl, blade) => {
    const { at } = axis(gl), cv = gl.cv || -1;
    limb(G, at(0), at(HL), 1.9, ['B', 'b', 'z']);
    limb(G, at(0), at(0.6), 2.6, ['D', 'B', 'b']);
    limb(G, at(HL - 1.2), at(HL + 0.4), 3.2, ['P', 'P', 'p']);
    for (let t = 0; t <= BL; t += 0.2) {
      const o = cv * t * t / 48, w = t < 3 ? 2.6 + t * 0.35 : 3.65 - (t - 3) * (2.5 / (BL - 3));
      for (let s = -w / 2; s <= w / 2 + 0.01; s += 0.2) {
        const p = at(HL + 1 + t, o + s), x = Math.round(p[0]), y = Math.round(p[1]), side = -cv * s;
        const k = t > BL - 0.8 ? 'c' : side > w / 2 - 0.9 ? 'c' : side < -(w / 2 - 0.8) ? 'R' : 'r';
        put(G, x, y, gl.glow ? { c: 'x', r: 'X', R: 'e' }[k] : k);
        if (blade) blade.push([x, y]);
      }
    }
  };
  const leg = (G, hip, knee, ank, near, foot) => {
    const R = near ? NEAR : FAR;
    limb(G, hip, knee, 4.2, R); limb(G, knee, ank, 3.6, R);
    stamp(G, knee[0] - 1, knee[1] - 1, near ? ['cr', 'rR'] : ['RR', 'RD']);
    const f = foot || [ank[0] - 1, FL - 1];
    stamp(G, f[0], f[1], near ? ['zbbb..', 'Bbbbbb'] : ['BDDD..', 'DDDDDD']);
  };
  const arm = (G, sh, hd, near, side) => {
    const R = near ? NEAR : FAR, el = elbow(sh, hd, 8, side);
    limb(G, sh, el, 3.8, R); limb(G, el, hd, 3.4, R);
    limb(G, hd, hd, 3.4, near ? ['B', 'z', 'p'] : ['D', 'B', 'z']);
  };
  const cape = (G, B, dy, sw, pooled) => {
    const pts = pooled ? [[B - 5, 22 + dy], [B + 1, 21 + dy], [B + 2, FL], [B - 20, FL], [B - 12, 40 + dy / 3]]
      : [[B - 7, 22 + dy], [B + 1, 21 + dy], [B - 2, 32 + dy], [B - 2, FL - 1], [B - 16 - sw * 2, FL], [B - 13 - sw, 38], [B - 11, 29 + dy]];
    gpoly(G, pts, (x, y) => {
      if (y >= FL - 1 || (pooled && y >= FL - 2 && x < B - 12)) return 'q';
      const f = ((Math.floor((x - B) + (y - 20) * 0.35 + sw) % 4) + 4) % 4;
      return f === 0 ? 'q' : f === 1 && y < 36 ? 'k' : 'K';
    });
    for (let x = B - 20; x < B; x += 3) if (G[FL][x] === 'q' && G[FL][x + 1] === 'q') G[FL][x] = '.';
  };
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, hx = o.hx || 0, hy = o.hy || 0, bow = o.bow || 0;
    const sh = { near: [B + 5 + bow, 23 + dy], far: [B - 4 + bow, 23 + dy] }, hip = { near: [B + 3, 34 + dy], far: [B - 3, 34 + dy] };
    const gl = o.gl, { at } = axis(gl), grip = h => (typeof h === 'number' ? at(h).map(Math.round) : h), blade = [];
    cape(G, B + Math.round(bow / 2), dy, o.sw || 0, o.pooled);
    layer(G, g => { arm(g, sh.far, grip(o.hands.far), false, o.sideF || 1); stamp(g, sh.far[0] - 3, sh.far[1] - 2, PAUL_F); });
    if (gl.back) layer(G, g => glaive(g, gl, blade));
    layer(G, g => leg(g, hip.far, ...o.legs.far, false, o.legs.farFoot));
    layer(G, g => leg(g, hip.near, ...o.legs.near, true, o.legs.nearFoot));
    layer(G, g => stampShear(g, B - 9, 21 + dy, TORSO, bow));
    if (gl.over) layer(G, g => glaive(g, gl, blade));
    layer(G, g => stamp(g, B - 7 + hx + bow, 7 + dy + hy, HEAD));
    if (!gl.back && !gl.over) layer(G, g => glaive(g, gl, blade));
    layer(G, g => { arm(g, sh.near, grip(o.hands.near), true, o.sideN || 1); stamp(g, sh.near[0] - 4, sh.near[1] - 2, PAUL_N); });
    if (o.mud) stamp(G, o.mud[0], o.mud[1], ['..u.U..', '.uUuUu.', 'uUUuUUu']);
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    if (gl.glow) {
      const g2 = c.getContext('2d'), d = g2.getImageData(0, 0, c.width, c.height).data;
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        if (d[(y * c.width + x) * 4 + 3]) continue;
        let m = 9; for (const [bx, by] of blade) m = Math.min(m, Math.hypot(bx + 1 - x, by + 1 - y));
        if (m <= 2.3) px(g2, x, y, '#a8f4ea');
      }
    }
    return c;
  };
  const stand = { far: [[X - 3, 42], [X - 3, FL - 2]], near: [[X + 4, 42], [X + 4, FL - 2]] };
  const idle = frame({ legs: stand, gl: { butt: [X + 12, FL], deg: -90 }, hands: { near: 17, far: [X - 5, 34] }, sideN: 1 });
  const walk1 = frame({ dy: 1, legs: { far: [[X - 5, 43], [X - 7, FL - 2]], near: [[X + 6, 42], [X + 8, FL - 2]] }, gl: { butt: [X + 13, FL - 2], deg: -90 }, hands: { near: 15, far: [X - 6, 34] }, sideN: 1 });
  const walk2 = frame({ dy: 1, sw: 3, legs: { far: [[X + 1, 43], [X + 3, FL - 2]], near: [[X + 1, 42], [X - 3, FL - 2]] }, gl: { butt: [X + 12, FL - 2], deg: -90 }, hands: { near: 15, far: [X - 3, 35] }, sideN: 1 });
  const sweepTellG = { butt: [X + 7, 29], deg: 160, back: true };
  const sweepTell = frame({ dx: -2, dy: 2, hx: -2, legs: { far: [[X - 9, 43], [X - 10, FL - 2]], near: [[X + 5, 42], [X + 7, FL - 2]] }, gl: sweepTellG, hands: { near: 6, far: 12 }, sideN: 1, sideF: 1 });
  const sweepG = { butt: [X - 13, 34], deg: 18 };
  const sweep = frame({ dx: 3, dy: 3, hx: 2, bow: 1, legs: { far: [[X - 5, 44], [X - 9, FL - 2]], near: [[X + 10, 42], [X + 11, FL - 2]] }, gl: sweepG, hands: { near: 23, far: 17 }, sideN: -1, sideF: -1, smear: [1 + X + 16, 1 + 18, 30, 56, 112, FL - 1] });
  const thrustTellG = { butt: [X - 29, 25], deg: 0 };
  const thrustTell = frame({ dx: -2, dy: 1, hx: -2, legs: { far: [[X - 8, 43], [X - 9, FL - 2]], near: [[X + 4, 42], [X + 6, FL - 2]] }, gl: thrustTellG, hands: { near: 22, far: 30 }, sideN: 1, sideF: -1 });
  const thrustG = { butt: [X - 10, 25], deg: 0 };
  const thrust = frame({ dx: 4, dy: 2, hx: 2, bow: 1, legs: { far: [[X - 4, 43], [X - 9, FL - 2]], near: [[X + 11, 42], [X + 12, FL - 2]] }, gl: thrustG, hands: { near: 23, far: 16 }, sideN: -1, sideF: -1 });
  const raiseG = { butt: [X - 18, 13], deg: -10, glow: true, over: true };
  const raise = frame({ dx: -1, hy: -1, legs: { far: [[X - 5, 42], [X - 6, FL - 2]], near: [[X + 4, 42], [X + 5, FL - 2]] }, gl: raiseG, hands: { near: 26, far: 14 }, sideN: 1, sideF: 1 });
  const staggerG = { butt: [X - 9, 14], deg: 55 };
  const stagger = frame({ dx: 1, dy: 5, hx: 3, hy: 2, bow: 3, legs: { far: [[X - 6, 45], [X - 11, FL - 2]], near: [[X + 7, 46], [X + 5, FL - 2]] }, gl: staggerG, hands: { near: 22, far: 17 }, sideN: -1, sideF: -1, mud: [X + 12, FL - 2] });
  const kneelG = { butt: [X + 14, FL], deg: -90 };
  const kneel = frame({ dy: 9, hx: 2, hy: 3, bow: 2, pooled: true, legs: { far: [[X - 4, FL - 1], [X - 11, FL - 1]], near: [[X + 9, 42], [X + 9, FL - 2]], farFoot: [X - 14, FL - 1] }, gl: kneelG, hands: { near: 13, far: [X - 1, 42] }, sideN: 1 });
  return pack([idle, walk1, walk2, sweepTell, sweep, thrustTell, thrust, raise, stagger, kneel], X + 1, H + 1, 18, 36);
}

// ---------- FISHERFOLK OF SALTREACH ----------
// human skin s/S, eye o, open mouth m; knit cap l/c/C; beard d/D; oilskin j/y/Y; trousers t/T; boots w/W;
// shawl v/u/U; apron a/A; skirt k/K; headscarf g/r/R; hair h
const FP = { o: OUT, s: '#e8c0a0', S: '#c89878', m: '#6a2a2a',
  l: '#e06a50', c: '#c0483a', C: '#8a2e28', d: '#a89888', D: '#6e6054',
  j: '#f0d070', y: '#d8b048', Y: '#a88430', t: '#5a5a6a', T: '#3a3a48', w: '#5a4234', W: '#34261e',
  v: '#6a8ac0', u: '#4a6a9a', U: '#2f4a70', a: '#ece4d0', A: '#b8ae98', k: '#8a5a3a', K: '#5c3a24',
  g: '#e0a060', r: '#c07040', R: '#84482a', h: '#6a4a30' };

export function bakeFisher(v = 0) {
  const W = 14, H = 14, X = 6;
  const q = G => outline(fromGrid(rowsOf(G), FP, 1), OUT);
  // parts share a local frame whose column 4 is the body's centre
  const HEAD = v === 0 ? [
    '..lcc...',
    '.lccccC.',
    '.CCCCCCC',
    '.DSsoss.',
    '.DdSsss.',
    '.Dddddd.',
    '..dDdD..',
  ] : [
    '..gggr..',
    '.grrrrR.',
    '.RrhhsR.',
    '.RhsoSs.',
    '.RRssss.',
    '..RRsS..',
    '...RR...',
  ];
  const CHEER = v === 0 ? ['.DdSssm.', 5] : ['.RRssmm.', 4];
  const BODY = v === 0 ? ['.jyyyY..', 'jyyyyYY.', 'yyyyyYY.', '.YyyyY..'] : ['.vuuuuU.', 'vuuuuuUU', '.UaaaaU.', '.kaaAaK.'];
  const LEGS = v === 0 ? {
    runA: ['..tT.tT..', '.tT...tT.', 'wW.....wW'],
    runB: ['...tTT...', '..wW.tT..', '.....wW..'],
    stand: ['..tT.tT..', '..tT.tT..', '.wWW.wWW.'],
    cower: ['.tTTTTTt.', 'wWW...wWW'],
  } : {
    runA: ['.kkaAaK..', 'kkkkKKKK.', 'wW.....wW'],
    runB: ['..kaAaK..', '.kkkKKKK.', '.....wW..'],
    stand: ['..kaAaK..', '.kkkkKKK.', '.wW...wW.'],
    cower: ['kkkkKKKKK', 'wW.....wW'],
  };
  const sleeve = v === 0 ? ['Y', 'y', 'j'] : ['U', 'u', 'v'];
  const arm = (G, sh, el, hd) => layer(G, g => { limb(g, sh, el, 1.6, sleeve); limb(g, el, hd, 1.5, sleeve); put(g, hd[0], hd[1], 's'); });
  const frame = ({ legs, dy = 0, pose }) => {
    const G = blank(W, H), O = X - 4;
    if (pose === 'runA') arm(G, [X - 1, 8 + dy], [X - 2, 9 + dy], [X - 4, 9 + dy]);
    if (pose === 'runB') arm(G, [X - 1, 8 + dy], [X, 10 + dy], [X + 2, 10 + dy]);
    if (pose === 'cower') arm(G, [X - 1, 8 + dy], [X - 3, 5 + dy], [X - 1, 2 + dy]);
    const L = LEGS[legs]; stamp(G, O, H - L.length, L);
    stamp(G, O, 7 + dy, BODY);
    const head = pose === 'wave' ? HEAD.map((r, i) => (i === CHEER[1] ? CHEER[0] : r)) : HEAD;
    stamp(G, O, dy, head);
    if (pose === 'runA') arm(G, [X + 1, 8 + dy], [X + 2, 10 + dy], [X + 4, 9 + dy]);
    if (pose === 'runB') arm(G, [X + 1, 8 + dy], [X, 10 + dy], [X - 2, 11 + dy]);
    if (pose === 'cower') arm(G, [X + 1, 8 + dy], [X + 4, 5 + dy], [X + 3, 2 + dy]);
    if (pose === 'wave') { arm(G, [X + 1, 8], [X + 3, 5], [X + 4, 1]); put(G, X + 5, 1, 's'); put(G, X + 4, 0, 's'); arm(G, [X - 1, 8], [X - 2, 10], [X - 2, 11]); }
    return q(G);
  };
  return pack([
    frame({ legs: 'runA', pose: 'runA', dy: 1 }), frame({ legs: 'runB', pose: 'runB' }),
    frame({ legs: 'cower', pose: 'cower', dy: 3 }),
    frame({ legs: 'stand', pose: 'wave' }),
  ], X + 1, H + 1, 8, 12);
}

// the rescue quest's HUD icon: a fisherman's face under his knit cap, 10x10 with its outline
export function bakeFisherIcon() {
  return outline(fromGrid([
    '..lccc..',
    '.lccccC.',
    'CCCCCCCC',
    '.sossos.',
    '.ssSSss.',
    '.dssssd.',
    '.dddddD.',
    '..dDDd..',
  ], FP, 1), OUT);
}
