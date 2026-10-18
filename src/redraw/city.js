// city.js — THE LAMPLIT STREET: the dead of a stone city a hundred feet under the sea, and the two who run it.
// All frames face RIGHT (L is the flip). Every frame of a sprite shares one canvas so the anchor holds; parts
// are char grids stamped onto a blank frame grid, weapons and robes rasterised into the same grid (limb /
// gline / gpoly), anything crossing the body laid with an inner outline (layer()), then fromGrid + OUT.
// Anchors follow chars.js: ax = the body's centre column, ay = the outline row under the feet.
//
// The look: nobody down here has any blood left in them. Flesh is green-grey and bloodless, eyes are pale and
// flat (the Watch's catch the lamplight and go gold when they have seen you), hair is weed. The city's livery
// is deep teal wool gone black at the hem, its brass still bright because brass does not care. The magistrate
// is the only purple in the game, which is the point: he is the only one here who was ever rich.
//
// bakeWatch()  THE DROWNED WATCH — a constable of a drowned city, still walking his beat: a kettle helm, a
//   livery coat with the city's badge, a HALBERD held across himself, and a shuttered lantern at the belt that
//   has been dark for a century. He guards with the haft, so a light blow turns on it and a heavy breaks it.
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (halberd carried upright at the shoulder)
//           4 GUARD (haft across the body, head down behind it)
//           5 thrust tell (halberd drawn back level, both hands, front foot planted)
//           6 thrust (driven out straight — the longest reach of any foot soldier in the game)
//           7 BLINDED (claude/lamplit2art: both hands over the dead eyes, head back, the flare spilling gold round the helm), 8 hurt (head back, halberd dropping, weed flying off him; the LAST frame is the hurt frame)
//   canvas 38x32   anchor ax 18, ay 31
//   reach: walk the axe head ax+2..ax+6, ay-26..ay-20 (up by his ear, nowhere near you);
//          GUARD the haft stands across ax-2..ax+4, ay-24..ay-4;
//          TELL the head is behind him at ax-12..ax-6, ay-16..ay-12;
//          THRUST the spike at ax+19, ay-13, the axe blade ax+13..ax+17, ay-16..ay-10
//
// bakeLampreeve()  THE LAMPREEVE (mid-level fight) — the officer of the city's lamps. He lit this street for
//   forty years and he has been putting it out ever since, on the Tollmaster's word. Long, thin, stooped, a cone-and-hook SNUFFER POLE twice his height, a ladder on
//   his back, and a bag of wicks he has no use for. Where he has been, the street is dark.
//   frames: 0 stride contact, 1 pass, 2 contact (other foot), 3 pass   (pole upright, cone at the top)
//           4 snuff tell (the pole swung up and over, cone open, his eye on the lamp)
//           5 snuff (the cone driven down over a lamp, dark puffing out of the rim)
//           6 sweep tell (the pole drawn low and back, both hands, body coiled)
//           7 sweep (the pole swung through at shin height — a thing you jump, not block)
//           8 draw (he straightens and takes in water, ribs out, cheeks full)
//           9 douse (bent double, the black of it coming out of him in a cone)
//           10 hurt, 11 kneel
//           12 lunge tell (claude/weakboss: back into the dark, crouched, the pole levelled at your middle)
//           13 lunge (driven out of the dark, the cone ahead of him at chest height, a smear behind)
//           15 flaskTell, 16 flaskThrow, 17 hoodFlare (the lesser flare: one arm across the eyes, the pole still in his fist); art pass 10-17
//           14 blinded (the relit stun: the flare in his face: head back, both hands up over his eyes, the pole let fall across his back)
//   canvas 44x40   anchor ax 21, ay 39
//   reach: stride the cone ax-1..ax+5, ay-38..ay-30;
//          SNUFF TELL cone ax+8..ax+16, ay-36..ay-28 — up and out over the lamp;
//          SNUFF cone ax+10..ax+18, ay-22..ay-14, the dark spilling out of it to ax+22;
//          SWEEP TELL the pole lies back along him, cone at ax-16..ax-9, ay-10..ay-4;
//          SWEEP the cone at ax+14..ax+22, ay-8..ay-2 — shin height, the whole width of him;
//          DOUSE the cone of black from his mouth at ax+6..ax+26, ay-26..ay-10
//
// bakeTollmaster()  THE TOLLMASTER (boss) — the magistrate of a city that drowned a hundred years ago and
//   never stopped collecting. Heavy, robed in drowned purple over the chain of office, the LEDGER chained to
//   his wrist and a rod of office in the other hand. He does not swim and he does not walk: he is carried, on
//   a bier, until you kill what is carrying him.
//   frames: 0 idle (on the bier, one hand flat on the ledger)
//           1 ledger tell (the book swung back and up over his shoulder, the chain taut)
//           2 ledger (the book driven through in front of him, chain snapping straight)
//           3 toll tell (head up, the rod out, a finger naming the due)
//           4 toll (the rod thrown down, the weight gone off its chain)
//           5 dark tell (both arms up, the ledger open, the rod across it)
//           6 dark (the arms coming down, his own light going out with the street's)
//           7 set down (the bier on the stones, him stepping off it — the frame where phase two starts)
//           8 walk (on his own feet, the robe dragging), 9 walk (other foot)
//           10 flood tell (arms wide, head back, the water coming up the square)
//           11 hurt, 12 kneel, 13-25 the lamplit2 moves (collect, scales, seal, writ, flared, tilt L/R; art pass 10-17)
//   canvas 56x44   anchor ax 27, ay 43
//   reach: idle the ledger ax-2..ax+8, ay-22..ay-14, the rod ax+10..ax+14, ay-30..ay-8;
//          LEDGER TELL the book ax-18..ax-8, ay-36..ay-26 — behind and over him;
//          LEDGER the book ax+10..ax+22, ay-24..ay-14, its chain ax+2..ax+10 — wide, and a PARRY answers it;
//          TOLL the rod ax+12..ax+20, ay-26..ay-18 and the weight leaves from ax+20, ay-22;
//          DARK both hands ax-10..ax+10, ay-38..ay-32;
//          FLOOD the arms out to ax-18 and ax+18, ay-30
import { px, fromGrid, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

// ---------- the same grid helpers the other redraws use ----------
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const stamp = (G, x, y, rows) => rows.forEach((r, j) => { const row = G[y + j]; if (!row) return; for (let i = 0; i < r.length; i++) { const k = r[i], xx = x + i; if (k === '.' || xx < 0 || xx >= row.length) continue; row[xx] = k === ' ' ? '.' : k; } });
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
// a swing's smear, cold down here: a pale green-white arc rather than the Flotilla's sunlit one
function smear(c, cx, cy, r, a0, a1, maxY = Infinity) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 2) for (const [rr, col] of [[r, '#dff6ee'], [r - 1, a > a0 + (a1 - a0) * 0.4 ? '#7aa8a0' : null]]) {
    if (!col) continue;
    const x = Math.round(cx + rr * Math.cos(a * Math.PI / 180)), y = Math.round(cy + rr * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= c.width || y >= c.height || y > maxY) continue;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, col);
  }
}
const axis = (o, deg) => {
  const a = deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]];
  return (d, s = 0) => [o[0] + u[0] * d + n[0] * s, o[1] + u[1] * d + n[1] * s];
};

// ---------- THE DROWNED CITY PALETTE ----------
const CY = { o: OUT,
  h: '#9fb8a8', s: '#7a9687', S: '#587465', g: '#3e5a4e',   // drowned flesh, bloodless
  e: '#cfe8d8', q: '#ffd36b', m: '#16231f',                 // dead eye, the lamplit eye, mouth
  k: '#2a3a34', K: '#415349',                               // hair gone to weed
  c: '#36535e', C: '#253c46', n: '#16262d',                 // the city's livery: deep teal wool, black at the hem
  l: '#b9c4bc', L: '#8d9a92',                               // sodden linen
  y: '#e6b94a', Y: '#9c7619',                               // brass: the badge, the chain of office
  i: '#ccd4dc', I: '#8e98a3', j: '#47515b',                 // iron
  w: '#8a6a44', W: '#5a4228',                               // ash shaft
  p: '#cbb68a', P: '#8e7a52',                               // cord
  r: '#5b3566', R: '#3a2042', d: '#7d4d8c',                 // the magistrate's robe
  a: '#cfc6a8', A: '#9a9078',                               // the ledger's pulped paper
  v: '#2f5a46', V: '#1a3326',                               // weed
  x: '#ffe9a8', X: '#f0c05a',                               // a flame
  z: '#14201e', Z: '#2b403c',                               // the dark he throws
  b: '#d6ddd2', B: '#a8b2a8',                               // barnacle crust
  t: '#9fd6d2', T: '#56898a',                               // glass, held air
  u: '#6d5338', U: '#46321f',                               // leather
};

// ---------- THE DROWNED WATCH ----------
export function bakeWatch() {
  const W = 36, H = 30, X = 17, FL = H - 1;
  const q = G => outline(fromGrid(rowsOf(settle(G)), CY, 1), OUT);
  // 13 wide, column 6 on the centre: a kettle helm with a wide brim, a flat dead face, weed out from under it
  const HEAD = [
    '..iiiiiii....',
    '.iiIiiiiIi...',
    'iiIIIIIIIIi..',
    'jjjjjjjjjjj..',
    '..hhhhhhh....',
    '..hseShseh...',
    '..hsSSSssh...',
    '..vShhhSkv...',
    '...vkSSkv....',
  ];
  // the head down behind the haft (guard and the tell)
  const HEAD_D = [
    '..iiiiiii....',
    '.iiIiiiiIi...',
    'iiIIIIIIIIi..',
    'jjjjjjjjjjj..',
    '..iiiiiii....',
    '..hsSSSssh...',
    '..vShhhSkv...',
    '...vkSSkv....',
    '.............',
  ];
  // the head back, hurt, the helm coming off
  const HEAD_U = [
    '...iiiiiii...',
    '..iiIiiiiIi..',
    '.iiIIIIIIIIi.',
    '..jjjjjjjjj..',
    '...hhhhhhh...',
    '...hseSheh...',
    '...hsmmmsh...',
    '...vShhhSv...',
    '....vkSkv....',
  ];
  // the livery coat with the city's badge on the breast
  const TORSO = [
    '..cCcCc..',
    '.cCCCCCn.',
    'cCCyYCCn.',
    'cCCyyCCn.',
    'cCCCCCCn.',
    '.nCCCCnn.',
    '.nCcCCn..',
    '..nCCn...',
  ];
  const LEGS = {
    stand: ['...nnnn....', '...nnnn....', '..nn..nn...', '..nn..nn...', '..nn..nn...', '.uuu..uuu..', '.uuuu.uuuu.'],
    walkA: ['...nnnn....', '..nn..nn...', '.nn....nn..', '.nn.....nn.', 'nn......nn.', 'uuu....uuu.', 'uuuu...uuuu'],
    walkB: ['...nnnn....', '...nnnn....', '...nnnn....', '..nn.nn....', '..nn..nn...', '.uuu..uuu..', '.uuuu.uuu..'],
    brace: ['...nnnn....', '..nn...nn..', '.nn.....nn.', '.nn......nn', 'nn.......nn', 'uuu.....uuu', 'uuuu....uuu'],
    lunge: ['...nnnn....', '..nn.....nn', '.nn.......n', 'nn........n', 'nn........n', 'uu........u', 'uuu......uu'],
    fall: ['....nnnn...', '....nnnn...', '...nn.nn...', '..nn...nn..', '.nn.....nn.', 'uuu.....uuu', 'uuu......uu'],
  };
  // THE HALBERD: an ash haft with an axe blade one side, a beak the other and a spike on the crown
  const halberd = (G, hand, deg, len) => {
    const A = axis(hand, deg);
    limb(G, A(-len * 0.42), A(len * 0.56), 2.2, ['W', 'w', 'p']);
    // the axe: a broad crescent off one side, its edge bright and its back dark
    gpoly(G, [A(len * 0.26, -1), A(len * 0.34, -8), A(len * 0.52, -9), A(len * 0.58, -1)], (x, y) => ((x + y) & 1) ? 'I' : 'j');
    gline(G, ...A(len * 0.34, -8), ...A(len * 0.52, -9), 'i');
    gline(G, ...A(len * 0.3, -7), ...A(len * 0.54, -8), 'i');
    // the beak on the far side, and the spike standing off the crown
    gpoly(G, [A(len * 0.42, 1), A(len * 0.58, 6), A(len * 0.6, 1)], () => 'I');
    limb(G, A(len * 0.56), A(len * 0.82), 1.8, ['j', 'I', 'i']);
    put(G, ...A(len * 0.84).map(Math.round), 'i'); put(G, ...A(len * 0.8).map(Math.round), 'i');
    for (const [d, ss] of [[len * 0.24, 0], [len * 0.56, 0]]) put(G, ...A(d, ss).map(Math.round), 'j');
    return A(len * 0.84);
  };
  // the dark lantern at his belt: iron, shuttered, and it has not burned in a century
  const LANT = ['.jij.', 'jTTTj', 'jTzTj', 'jTTTj', '.jjj.'];
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 3.0, far ? ['n', 'n', 'C'] : ['n', 'C', 'c']);
    limb(g, el, hd, 2.6, far ? ['n', 'C', 'C'] : ['C', 'c', 'c']);
    limb(g, hd, hd, 2.4, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
  });
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 4;
    const P = v => [B + v[0], v[1] + dy];
    if (o.pole && o.pole[3] === 'back') layer(G, g => halberd(g, P(o.pole[0]), o.pole[1], o.pole[2]));
    arm(G, P([-4, 14]), P(o.far[0]), P(o.far[1]), true);
    stamp(G, B - 5, 22, LEGS[o.legs]);
    stamp(G, O, 14 + dy, TORSO);
    layer(G, g => stamp(g, O - 2 + (o.hx || 0), 5 + dy, o.up ? HEAD_U : o.down ? HEAD_D : HEAD));
    if (o.lant) layer(G, g => stamp(g, P(o.lant)[0], P(o.lant)[1], LANT));
    if (o.pole && o.pole[3] !== 'back') layer(G, g => halberd(g, P(o.pole[0]), o.pole[1], o.pole[2]));
    arm(G, P([2, 14]), P(o.near[0]), P(o.near[1]), false);
    if (o.eye) { const E = P(o.eye); put(G, E[0], E[1], 'q'); }    // he has seen you: the lamplight catches in it
    if (o.glare) layer(G, g => { const [gx, gy] = P(o.glare); for (const [a, b, k] of [[0, 0, 'x'], [-3, -2, 'X'], [3, -3, 'x'], [5, 0, 'X'], [-4, 3, 'X'], [2, 3, 'x'], [-1, -5, 'X'], [6, -4, 'x']]) put(g, gx + a, gy + b, k); });   /* (claude/lamplit2 art) the flare in his face */
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  const walk = k => frame({ legs: k === 1 ? 'walkA' : k === 3 ? 'walkB' : 'stand', dy: k & 1 ? 1 : 0,
    far: [[-4, 17], [-5, 20]], near: [[3, 12], [4, 8]], pole: [[4, 8], -84, 26], lant: [-8, 18] });
  const guard = frame({ legs: 'brace', down: true, hx: 1,
    far: [[-2, 13], [1, 9]], near: [[3, 17], [4, 12]], pole: [[4, 12], -76, 26], lant: [-8, 18], eye: [2, 10] });
  const tell = frame({ legs: 'brace', dx: -1, down: true, hx: -1,
    far: [[-3, 15], [-7, 14]], near: [[2, 15], [-2, 15]], pole: [[-2, 15], -176, 26, 'back'], lant: [-9, 18], eye: [1, 10] });
  const thrust = frame({ legs: 'lunge', dx: 2, dy: 1, hx: 1,
    far: [[0, 15], [6, 14]], near: [[4, 15], [10, 14]], pole: [[10, 14], 2, 26], lant: [-9, 19], eye: [3, 10],
    smear: [1 + X + 13, 1 + 15, 8, -50, 50] });
  const hurtF = frame({ legs: 'fall', dx: -2, dy: 2, up: true,
    far: [[-5, 18], [-8, 21]], near: [[2, 17], [5, 21]], pole: [[5, 21], 44, 26], lant: [-9, 20] });
  /* (claude/lamplit2 art) THE WATCH HATE LIGHT: the relit lamp's flare in his face - both hands thrown over the dead eyes, head back, the halberd let go to hang by its strap, the light spilling gold round the helm */
  const blinded = frame({ legs: 'brace', dx: -1, up: true, hx: -1, glare: [3, 9],
    far: [[-3, 13], [0, 8]], near: [[3, 13], [3, 8]], pole: [[-2, 17], 70, 24, 'back'], lant: [-9, 18] });
  return pack([walk(0), walk(1), walk(2), walk(3), guard, tell, thrust, blinded, hurtF], X + 1, H + 1, 12, 22);
}

// ---------- THE LAMPLIGHTER ----------
export function bakeLampreeve() {
  const W = 44, H = 40, X = 21, FL = H - 1;
  const q = G => outline(fromGrid(rowsOf(settle(G)), CY, 1), OUT);
  // 13 wide, column 6 on the centre: a tall battered hat, a long face, a lamp-burn scar down one cheek
  const HEAD = [
    '...jjjjj.....',
    '...jJJJj.....',
    '..jjjjjjj....',
    '.jjjjjjjjj...',
    '...hhhhh.....',
    '..hseShse....',
    '..hsSSSsh....',
    '..khShhSk....',
    '...kkSSk.....',
  ];
  const HEAD_U = [   // head back: the draw, and hurt
    '....jjjjj....',
    '....jJJJj....',
    '...jjjjjjj...',
    '..jjjjjjjjj..',
    '....hhhhh....',
    '...hseShse...',
    '...hsmmmsh...',
    '...khShhSk...',
    '....kkSSk....',
  ];
  const HEAD_D = [   // head down over the work
    '...jjjjj.....',
    '...jJJJj.....',
    '..jjjjjjj....',
    '.jjjjjjjjj...',
    '..jjjjjjj....',
    '..hsSSSsh....',
    '..khShhSk....',
    '...kkSSk.....',
    '.............',
  ];
  // a long sodden coat of the city's teal, worn thin; the wick bag slung across it
  const TORSO = [
    '..cCcCc..',
    '.cCCCCCn.',
    'cCCpCCCn.',
    'cCpCCCCn.',
    'cpCCCCCn.',
    'pCCCCCnn.',
    '.nCCCCn..',
    '..nCCn...',
  ];
  const LEGS = {
    stand: ['...nnnn....', '..nn..nn...', '..nn..nn...', '..n....n...', '..n....n...', '..n....n...', '.uu....uu..', '.uuu..uuu..'],
    strideA: ['...nnnn....', '..nn...nn..', '.nn.....nn.', '.n.......nn', 'n.........n', 'n.........n', 'uu.......uu', 'uuu.....uuu'],
    strideB: ['...nnnn....', '...nnnn....', '...nnnn....', '..n..nn....', '..n...nn...', '.n.....n...', '.uu....uu..', '.uuu..uuu..'],
    coil: ['...nnnn....', '..nn..nn...', '.nn....nn..', '.n......nn.', 'n.......nn.', 'n.......n..', 'uu.....uu..', 'uuu...uuu..'],
    lunge: ['...nnnn....', '..nn.....nn', '.nn.......n', 'n.........n', 'n.........n', 'n.........n', 'uu........u', 'uuu......uu'],
    bent: ['....nnnn...', '...nn..nn..', '..nn....nn.', '..n......n.', '..n......n.', '..n......n.', '.uu.....uu.', '.uuu...uuu.'],
    kneel: ['...........', '....nnnn...', '...nn..nn..', '..nn...nn..', '..n....nn..', '.nnnnn.nn..', 'uuuuuu.uu..', 'uuuuuu.uuu.'],
  };
  // THE SNUFFER POLE: a long ash rod with an iron cone on the end and a wick hook beside it. The cone is the
  // read: it is the biggest, simplest shape on him and it is always pointing at what he means to put out.
  const pole = (G, hand, deg, len) => {
    const A = axis(hand, deg);
    limb(G, A(-len * 0.22), A(len * 0.72), 1.8, ['W', 'w', 'p']);
    const tip = A(len);
    // THE CONE: a bell of iron on the end of it, narrow at the haft and wide at the mouth, with a pale rim.
    // It is the biggest simple shape on him and it always points at what he means to put out.
    gpoly(G, [A(len * 0.66, -2), A(len * 1.0, -7), A(len * 1.0, 7), A(len * 0.66, 2)], (x, y) => ((x + y) & 1) ? 'i' : 'I');
    gline(G, ...A(len * 1.0, -7), ...A(len * 1.0, 7), 'i');
    gline(G, ...A(len * 0.94, -6), ...A(len * 0.94, 6), 'j');   // the shadow inside the mouth of it
    gline(G, ...A(len * 0.66, -2), ...A(len * 1.0, -7), 'i');
    gline(G, ...A(len * 0.66, 2), ...A(len * 1.0, 7), 'j');
    // the wick hook, standing off the side of the mouth
    gline(G, ...A(len * 0.86, 7), ...A(len * 0.92, 11), 'I'); put(G, ...A(len * 1.0, 11).map(Math.round), 'i'); put(G, ...A(len * 0.96, 11).map(Math.round), 'I');
    return tip;
  };
  // the ladder across his back: three rungs of it showing past his shoulder
  const LADDER = ['w.w', 'www', 'w.w', 'www', 'w.w', 'www', 'w.w'];
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 2.8, far ? ['n', 'n', 'C'] : ['n', 'C', 'c']);
    limb(g, el, hd, 2.4, far ? ['n', 'C', 'C'] : ['C', 'c', 'c']);
    limb(g, hd, hd, 2.2, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
  });
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 4;
    const P = v => [B + v[0], v[1] + dy];
    if (o.ladder) layer(G, g => stamp(g, B - 9, 16 + dy, LADDER));
    if (o.pole && o.pole[3] === 'back') layer(G, g => pole(g, P(o.pole[0]), o.pole[1], o.pole[2]));
    arm(G, P([-4, 20]), P(o.far[0]), P(o.far[1]), true);
    stamp(G, B - 5, 30, LEGS[o.legs]);
    stamp(G, O, 22 + dy, TORSO);
    layer(G, g => stamp(g, O - 2 + (o.hx || 0), 13 + dy, o.up ? HEAD_U : o.down ? HEAD_D : HEAD));
    if (o.pole && o.pole[3] !== 'back') layer(G, g => pole(g, P(o.pole[0]), o.pole[1], o.pole[2]));
    arm(G, P([2, 20]), P(o.near[0]), P(o.near[1]), false);
    if (o.dark) layer(G, g => { // the dark coming off him: a cone of black water, ragged at its edge
      const [dx0, dy0, deg, len] = o.dark, A = axis(P([dx0, dy0]), deg);
      for (let t = 2; t < len; t += 1) { const sp = 1 + t * 0.42;
        for (let s = -sp; s <= sp; s += 1) if (((t + s) & 1) === 0 || t < 5) put(g, ...A(t, s).map(Math.round), Math.abs(s) > sp - 1.2 ? 'T' : Math.abs(s) > sp - 2.4 ? 'Z' : 'z'); } });
    if (o.puff) layer(G, g => { const [ux, uy] = P(o.puff); for (const [a, b, k] of [[0, 0, 'z'], [2, -1, 'Z'], [-2, 1, 'z'], [4, 1, 'Z'], [-1, -3, 'z'], [3, -4, 'Z'], [6, -2, 'z']]) put(g, ux + a, uy + b, k); });
    if (o.flask) layer(G, g => { const [fx, fy] = P(o.flask);   /* (claude/lamplit2 art) THE OIL FLASK in his fist: a round glass of whale oil, amber behind the glass, a cork, and a rag of wick in the neck that is already burning */
      const R = [' ..TTT.. ', ' .TttttT. ', 'TtyyyytT', 'Tyyxyyyt', 'Tyyyyyyt', 'TYyyyyYT', ' TYYYYT ', '  TTTT  '];
      for (let j = 0; j < R.length; j++) for (let i = 0; i < R[j].length; i++) { const k = R[j][i]; if (k !== ' ' && k !== '.') put(g, fx - 3 + i, fy + j, k === 'y' ? 'X' : k === 'Y' ? 'q' : k === 'x' ? 'x' : k); }
      put(g, fx - 1, fy - 1, 'u'); put(g, fx, fy - 1, 'u'); put(g, fx - 1, fy - 2, 'U'); put(g, fx, fy - 2, 'U');
      put(g, fx + 1, fy - 3, 'p'); put(g, fx + 1, fy - 4, 'x'); put(g, fx + 2, fy - 5, 'X'); put(g, fx + 1, fy - 5, 'x'); });
    if (o.glare) layer(G, g => { const [gx, gy] = P(o.glare); for (const [a, b2, k] of [[0, 0, 'x'], [-3, -2, 'X'], [3, -3, 'x'], [5, 0, 'X'], [-4, 3, 'X'], [2, 3, 'x'], [-1, -5, 'X'], [6, -5, 'x'], [-6, -1, 'x']]) put(g, gx + a, gy + b2, k); });
    if (o.scorch) layer(G, g => { for (const [a, b2, k] of [[-2, 24, 'z'], [-1, 25, 'Z'], [0, 27, 'z'], [3, 26, 'Z'], [1, 23, 'z'], [-3, 28, 'X'], [4, 24, 'x'], [2, 29, 'X']]) put(g, B + a, b2 + dy, k); });   /* the flare's burn on the coat */
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  const stride = k => frame({ legs: k === 1 ? 'strideA' : k === 3 ? 'strideB' : 'stand', dy: k & 1 ? 1 : 0, ladder: true,
    far: [[-4, 24], [-5, 27]], near: [[3, 24], [4, 20]], pole: [[4, 20], -86, 20] });
  const snuffTell = frame({ legs: 'coil', ladder: true, hx: 1,
    far: [[-2, 20], [1, 15]], near: [[4, 21], [7, 17]], pole: [[7, 17], -40, 21] });
  const snuff = frame({ legs: 'lunge', dx: 1, dy: 1, down: true, ladder: true,
    far: [[0, 21], [4, 19]], near: [[5, 20], [9, 18]], pole: [[9, 18], 8, 20], puff: [16, 19],
    smear: [1 + X + 12, 1 + 18, 12, -60, 0] });
  const sweepTell = frame({ legs: 'coil', dx: -1, down: true, hx: -1, ladder: true,
    far: [[-4, 22], [-8, 24]], near: [[1, 23], [-4, 25]], pole: [[-4, 25], -168, 20, 'back'] });
  const sweep = frame({ legs: 'lunge', dx: 2, dy: 2, ladder: true,
    far: [[-1, 22], [3, 26]], near: [[4, 24], [8, 28]], pole: [[8, 28], 4, 20],
    smear: [1 + X + 12, 1 + 30, 14, -40, 30] });
  const draw = frame({ legs: 'stand', up: true, dy: -1, ladder: true,
    far: [[-5, 21], [-7, 18]], near: [[4, 24], [6, 21]], pole: [[6, 21], -74, 20], puff: [8, 14] });
  const douse = frame({ legs: 'bent', dx: 1, dy: 2, down: true, ladder: true,
    far: [[-3, 23], [-6, 25]], near: [[4, 22], [7, 24]], pole: [[7, 24], 42, 20], dark: [9, 17, 4, 20] });
  const hurtF = frame({ legs: 'kneel', dx: -2, dy: 3, up: true,
    far: [[-5, 24], [-9, 26]], near: [[2, 23], [5, 27]], pole: [[5, 27], 56, 20] });
  const kneel = frame({ legs: 'kneel', dy: 4, down: true,
    far: [[-4, 25], [-7, 28]], near: [[3, 25], [5, 30]], pole: [[5, 30], 86, 20] });
  const lungeTell = frame({ legs: 'coil', dx: -2, down: true, hx: -1, ladder: true,
    far: [[-5, 22], [-8, 23]], near: [[0, 23], [-3, 24]], pole: [[-3, 24], -4, 21] });
  /* THE LUNGE, at its real reach (claude/crouchart). The pole used to start at the hand 12 px out and run 22 more, off the right edge of the 46 px
     canvas: the cone was cut away and what showed was a stump. The hit is DMG.reeveLunge inside 18 px of him (main.js updateLampreeve), so the
     whole pole - shaft, cone and hook - is now inside ax+22: the body a step further back, the hands drawn in, the cone's mouth at the reach. */
  const lunge = frame({ legs: 'lunge', dx: 1, dy: 2, down: true, ladder: true,
    far: [[0, 21], [3, 22]], near: [[3, 22], [7, 22]], pole: [[7, 22], 2, 15],
    smear: [1 + X + 6, 1 + 22, 8, -60, 0] });
  const blinded = frame({ legs: 'stand', dx: -1, up: true, ladder: true, scorch: true, glare: [2, 9],
    far: [[-2, 18], [1, 14]], near: [[3, 18], [4, 14]], pole: [[-4, 24], -120, 20, 'back'] });
  /* (claude/lamplit2 art) THE OIL FLASK: the wind-up has him leaning right back with the flask cocked behind his hat, a burning wick and all, the pole trailing low in the other hand (his weight on the back foot is the tell); the throw is the release - the whole arm flung out and up, open hand, the body thrown after it, the oil still shaking off the fingers */
  const flaskTell = frame({ legs: 'coil', dx: -2, up: true, ladder: true, hx: -2,
    far: [[-3, 23], [-1, 28]], near: [[-1, 17], [-8, 10]], pole: [[-1, 28], 18, 20, 'back'], flask: [-12, 5] });
  const flaskThrow = frame({ legs: 'lunge', dx: 2, dy: 1, ladder: true, hx: 1,
    far: [[-3, 23], [-1, 28]], near: [[5, 18], [13, 12]], pole: [[-1, 28], 22, 20, 'back'], glare: [16, 11],
    smear: [1 + X + 9, 1 + 13, 9, -170, -70] });
  /* the HOOD's flare (the lesser opening): one arm thrown up across the eyes, the pole still in the other fist, flinching away; the RELIT flare (frame 14) takes both hands and the pole out of him */
  const hoodFlare = frame({ legs: 'stand', dx: -1, up: true, ladder: true, hx: -1, glare: [3, 8],
    far: [[-3, 21], [-1, 27]], near: [[3, 16], [5, 11]], pole: [[-1, 27], 28, 18, 'back'] });
  return pack([stride(0), stride(1), stride(2), stride(3), snuffTell, snuff, sweepTell, sweep, draw, douse, hurtF, kneel, lungeTell, lunge, blinded, flaskTell, flaskThrow, hoodFlare], X + 1, H + 1, 14, 30);
}

// ---------- THE TOLLMASTER ----------
export function bakeTollmaster() {
  const W = 56, H = 44, X = 27, FL = H - 1;
  const q = G => outline(fromGrid(rowsOf(settle(G)), CY, 1), OUT);
  // 15 wide, column 7 on the centre: a magistrate's flat cap, a heavy jowled face, the chain of office at the
  // throat. He is the only thing down here with gold on him.
  const HEAD = [
    '..RRRRRRRRR....',
    '.RrrrrrrrrrR...',
    '.RrrdddrrrrR...',
    '..RRRRRRRRR....',
    '...hhhhhhh.....',
    '..hhseShseh....',
    '..hsSSSSSsh....',
    '..hsShhhSsh....',
    '...hSSSSSh.....',
    '...yyYyYyy.....',
  ];
  const HEAD_U = [   // the head back: the toll called, the flood called
    '...RRRRRRRRR...',
    '..RrrrrrrrrrR..',
    '..RrrdddrrrrR..',
    '...RRRRRRRRR...',
    '....hhhhhhh....',
    '...hhseShseh...',
    '...hsmmmmmsh...',
    '...hsShhhSsh...',
    '....hSSSSSh....',
    '....yyYyYyy....',
  ];
  const HEAD_D = [   // down over the ledger
    '..RRRRRRRRR....',
    '.RrrrrrrrrrR...',
    '.RrrdddrrrrR...',
    '..RRRRRRRRR....',
    '..RRRRRRRRR....',
    '..hsSSSSSsh....',
    '..hsShhhSsh....',
    '...hSSSSSh.....',
    '...yyYyYyy.....',
    '...............',
  ];
  // the robe's chest: heavy, with the chain of office lying on it and the city's seal hanging from it
  const TORSO = [
    '...rRrRr...',
    '..rRyYyRr..',
    '.rRyRRRyRr.',
    '.rRRyYyRRR.',
    'rRRRyRRRRR.',
    'rRRRRRRRRR.',
    '.RRRRRRRR..',
    '.RRRRRRRR..',
  ];
  // THE BIER: four poles on four shoulders, a board, and him on it. Drawn under him while he is carried, and
  // gone the moment he steps off, which is the only way phase two can be read from across the room.
  const bier = (G, B, dy, tilt = 0) => {
    const y0 = 30 + dy;
    if (tilt) { for (let x = B - 16; x <= B + 16; x++) { const t = Math.round((x - B) * tilt * 0.22); put(G, x, y0 + t, 'w'); put(G, x, y0 + 1 + t, 'W'); put(G, x, y0 + 2 + t, 'U'); }   /* (claude/lamplit2) A BEARER STUMBLES: the bier goes down at his corner */
      for (const sx of [-13, -9, 9, 13]) { const t = Math.round(sx * tilt * 0.22), n = Math.sign(sx) === Math.sign(tilt) ? 3 : 6; for (let j = 3; j < 3 + n; j++) put(G, B + sx, y0 + j + t, j & 1 ? 'W' : 'w'); } return; }
    for (let x = B - 14; x <= B + 14; x++) { put(G, x, y0, 'w'); put(G, x, y0 + 1, 'W'); put(G, x, y0 + 2, 'U'); }
    for (const sx of [-13, -9, 9, 13]) { for (let j = 3; j < 8; j++) put(G, B + sx, y0 + j, j & 1 ? 'W' : 'w'); }
    for (let x = B - 16; x <= B + 16; x += 1) put(G, x, y0 - 1, (x & 3) === 0 ? 'U' : 'u');   // the rail along it
    for (const px0 of [-15, -11, 11, 15]) { put(G, B + px0, y0 - 1, 'y'); put(G, B + px0, y0 - 2, 'Y'); } // and its gilt pins
    // the pall hanging off it, purple gone black in the water
    gpoly(G, [[B - 14, y0 + 3], [B + 14, y0 + 3], [B + 12, y0 + 7], [B - 12, y0 + 7]], (x, y) => ((x + y) & 7) === 0 ? 'd' : ((x + y) & 1) ? 'z' : 'R'); // the pall: black with a thread of purple in it
  };
  // THE LEDGER: a great book on a chain, the thing he hits with. Shown open (reading, the dark) or shut (a club).
  const ledger = (G, hand, deg, open) => {
    const A = axis(hand, deg);
    if (open) {
      gpoly(G, [A(-6, -4), A(6, -4), A(6, 4), A(-6, 4)], (x, y) => ((x + y) & 1) ? 'a' : 'A');
      gline(G, ...A(-6, 0), ...A(6, 0), 'A');
      for (let s = -3; s <= 3; s += 2) gline(G, ...A(-5, s), ...A(5, s), 'A');
      gline(G, ...A(-6, -4), ...A(6, -4), 'A'); gline(G, ...A(-6, 4), ...A(6, 4), 'A');
    } else { // shut: a dark leather cover with the page edges pale along one side and two brass clasps
      gpoly(G, [A(-5, -3), A(5, -3), A(5, 3), A(-5, 3)], (x, y) => ((x + y) & 3) === 0 ? 'u' : 'U');
      gline(G, ...A(-5, 3), ...A(5, 3), 'a'); gline(G, ...A(-5, 2), ...A(5, 2), 'A');
      gline(G, ...A(-5, -3), ...A(5, -3), 'v');
      for (const d of [-2, 2]) { put(G, ...A(d, -3).map(Math.round), 'y'); put(G, ...A(d, -2).map(Math.round), 'Y'); }
    }
    return A(0);
  };
  // the chain from his wrist to the book's spine
  const chain = (G, a, b) => gline(G, a[0], a[1], b[0], b[1], i => (i & 1) ? 'i' : 'j');
  // the rod of office: black wood with a brass cap and the weight on its chain
  const rod = (G, hand, deg, len, weight) => {
    const A = axis(hand, deg);
    limb(G, A(-2), A(len), 2.0, ['z', 'j', 'I']);
    put(G, ...A(len).map(Math.round), 'y'); put(G, ...A(len - 1).map(Math.round), 'Y');
    if (weight) { const wp = A(len + 7), wx = Math.round(wp[0]), wy = Math.round(wp[1]);   /* (claude/lamplit2 art) THE COUNTERWEIGHT: a brass drum the size of a loaf on four links of chain, a banded rim and the city's scale cut into its face */
      const D = ['..yyyy..', '.yxyyyY.', 'yxyYYyYy', 'yyY..Yyy', 'yyYjjYyY', 'yyYYYYyY', '.yYyyYY.', '..YYYY..'];
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const k = D[j][i]; if (k !== '.') put(G, wx - 4 + i, wy - 4 + j, k); }
      put(G, wx - 3, wy - 3, 'x'); put(G, wx - 2, wy - 3, 'x');
      const top = [Math.round(wp[0] + (A(len)[0] - wp[0]) * 0.55), Math.round(wp[1] + (A(len)[1] - wp[1]) * 0.55)];
      chain(G, A(len).map(Math.round), [wx, wy - 4]); put(G, wx, wy - 5, 'i'); put(G, top[0], top[1], 'I'); }
  };
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 3.4, far ? ['R', 'R', 'r'] : ['R', 'r', 'd']);
    limb(g, el, hd, 3.0, far ? ['R', 'r', 'r'] : ['r', 'd', 'd']);
    limb(g, hd, hd, 2.6, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
  });
  // the robe's skirt, which is all he has instead of legs while he is carried
  const skirt = (G, B, dy, pose) => {
    const top = 24 + dy, bot = pose === 'bier' ? 29 + dy : FL;
    const pts = {
      bier: [[-7, top], [7, top], [9, bot], [-9, bot]],
      stand: [[-8, top], [8, top], [12, FL], [-12, FL]],
      stride: [[-8, top], [8, top], [14, FL], [-10, FL]],
      wide: [[-9, top], [9, top], [16, FL], [-16, FL]],
      pooled: [[-8, top], [8, top], [17, FL], [-17, FL]],
    }[pose];
    gpoly(G, pts.map(([x, y]) => [B + x, y]), (x, y) => {
      const f = ((Math.floor((x - B) * 0.7 + (y - top) * 0.3) % 4) + 4) % 4;
      return y > FL - 2 ? 'z' : f === 0 ? 'z' : f === 1 ? 'R' : f === 2 ? 'R' : 'r';
    });
  };
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 5;
    const P = v => [B + v[0], v[1] + dy];
    if (o.bier) bier(G, B, dy, o.tilt || 0);
    if (o.book && o.book[3] === 'back') layer(G, g => { const c = ledger(g, P(o.book[0]), o.book[1], o.book[2]); chain(g, P(o.wrist), c.map(Math.round)); });
    if (o.rod && o.rod[3] === 'back') layer(G, g => rod(g, P(o.rod[0]), o.rod[1], o.rod[2], o.weight));
    skirt(G, B, dy, o.skirt);
    arm(G, P([-5, 22]), P(o.far[0]), P(o.far[1]), true);
    stamp(G, O, 22 + dy, TORSO);
    layer(G, g => stamp(g, O - 2 + (o.hx || 0), 12 + dy, o.up ? HEAD_U : o.down ? HEAD_D : HEAD));
    if (o.rod && o.rod[3] !== 'back') layer(G, g => rod(g, P(o.rod[0]), o.rod[1], o.rod[2], o.weight));
    if (o.book && o.book[3] !== 'back') layer(G, g => { const c = ledger(g, P(o.book[0]), o.book[1], o.book[2]); chain(g, P(o.wrist), c.map(Math.round)); });
    arm(G, P([3, 22]), P(o.near[0]), P(o.near[1]), false);
    if (o.box) layer(G, g => { const [bx, by] = P(o.box);   /* (claude/lamplit2 art) THE TOLL BOX: an iron-banded strongbox, brass corner plates, a hasp, and a slot in the lid the flames go into (it glows when they do) */
      for (let j = -4; j <= 3; j++) for (let i = -4; i <= 4; i++) put(g, bx + i, by + j, j <= -3 ? 'i' : (i === -4 || i === 4 || j === 3) ? 'j' : (i === -1 || i === 1) ? 'I' : (j & 1) ? 'u' : 'U');
      for (const [a, b] of [[-4, -4], [4, -4], [-4, 3], [4, 3]]) put(g, bx + a, by + b, 'y');
      put(g, bx, by - 1, 'y'); put(g, bx, by, 'Y');
      put(g, bx - 1, by - 4, o.box[2] ? 'x' : 'z'); put(g, bx, by - 4, o.box[2] ? 'x' : 'z'); put(g, bx + 1, by - 4, o.box[2] ? 'x' : 'z');
      if (o.box[2]) for (const [a, b, k] of [[-1, -5, 'X'], [1, -6, 'x'], [0, -7, 'X'], [2, -5, 'x'], [-2, -6, 'X'], [0, -9, 'x'], [1, -8, 'X']]) put(g, bx + a, by + b, k); });
    if (o.seal) layer(G, g => { const [sx, sy] = P(o.seal);   /* (claude/lamplit2 art) THE SEAL OF DEBT: a turned brass handle with a knob, and under it a disc of red wax, the city's scale pressed into its face */
      for (let j = -8; j <= -3; j++) put(g, sx, sy + j, j & 1 ? 'y' : 'Y'); for (const i of [-2, -1, 0, 1, 2]) put(g, sx + i, sy - 9, i === 0 ? 'x' : 'y'); put(g, sx - 2, sy - 8, 'Y'); put(g, sx + 2, sy - 8, 'Y');
      for (let i = -3; i <= 3; i++) put(g, sx + i, sy - 2, 'y');
      for (let j = -1; j <= 3; j++) for (let i = -5; i <= 5; i++) if (Math.abs(i) + Math.abs(j) * 1.4 < 6.2) put(g, sx + i, sy + j, j === 3 ? 'R' : (j === 1 && Math.abs(i) < 3) ? 'y' : j === -1 ? 'd' : 'r'); });
    if (o.writ) layer(G, g => { const [wx, wy] = P(o.writ);   /* (claude/lamplit2 art) THE WRIT OF DROWNING: a long scroll unrolled to its length, the black ink in lines, a roller of ash at each end, and the red seal hanging on a cord */
      for (let j = -6; j <= 6; j++) for (let i = -3; i <= 3; i++) put(g, wx + i, wy + j, (i === -3 || i === 3) ? 'A' : (j & 1) ? 'a' : (i === 0 || (i + j) % 3 === 0) ? 'z' : 'a');
      for (const j of [-7, 7]) for (let i = -4; i <= 4; i++) put(g, wx + i, wy + j, (i === -4 || i === 4) ? 'y' : 'w');
      put(g, wx + 4, wy + 8, 'p'); put(g, wx + 4, wy + 9, 'p'); for (const [a, b] of [[3, 10], [4, 10], [5, 10], [4, 11], [3, 11], [5, 11]]) put(g, wx + a, wy + b, b === 11 ? 'R' : 'r'); });
    if (o.burn) layer(G, g => { const t = [[-9, 33, 5], [-5, 31, 4], [-1, 33, 6], [4, 32, 4], [9, 33, 5], [-7, 25, 3], [7, 26, 3], [-3, 23, 3], [2, 22, 4], [11, 31, 3], [-11, 30, 3]];   /* (claude/lamplit2 art) HIS ROBES CATCH: tongues of fire along the hem and up the shoulders, hot gold at the root and a white-gold tip */
      for (const [a, b, h] of t) for (let j = 0; j < h; j++) { const w = j < h - 2 ? 1 : 0; for (let i = -w; i <= w; i++) put(g, B + a + i, b + dy - j, j === 0 ? 'X' : j < h - 1 ? ((i + j) & 1 ? 'x' : 'X') : 'x'); } });
    if (o.out) layer(G, g => { // the light going out of him: black beads coming off his hands
      for (const [a, b] of [[-9, -6], [-5, -9], [0, -11], [5, -9], [9, -6], [-7, -2], [7, -2]]) put(g, B + a, 18 + dy + b, (a & 1) ? 'z' : 'Z'); });
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  const idle = frame({ bier: true, skirt: 'bier',
    far: [[-6, 25], [-4, 27]], near: [[5, 25], [7, 27]],
    book: [[-1, 27], 0, false], wrist: [5, 25], rod: [[7, 27], -78, 14] });
  const ledgerTell = frame({ bier: true, skirt: 'bier', dx: -1, down: true, hx: -1,
    far: [[-4, 24], [-2, 22]], near: [[1, 22], [-5, 16]],
    book: [[-10, 12], -150, false, 'back'], wrist: [-5, 16], rod: [[-2, 22], 150, 14, 'back'] });
  const ledgerHit = frame({ bier: true, skirt: 'stride', dx: 1, dy: 1,
    far: [[-4, 25], [-6, 27]], near: [[5, 23], [11, 21]],
    book: [[16, 19], 10, false], wrist: [11, 21], rod: [[-6, 27], 160, 14, 'back'],
    smear: [1 + X + 14, 1 + 20, 17, -120, 10] });
  const tollTell = frame({ bier: true, skirt: 'bier', up: true,
    far: [[-5, 25], [-3, 27]], near: [[5, 23], [9, 19]],
    book: [[-3, 28], 0, false], wrist: [-5, 25], rod: [[9, 19], -18, 14], weight: true });
  const toll = frame({ bier: true, skirt: 'bier', dx: 1,
    far: [[-5, 25], [-3, 27]], near: [[5, 24], [10, 24]],
    book: [[-3, 28], 0, false], wrist: [-5, 25], rod: [[10, 24], 14, 14],
    smear: [1 + X + 12, 1 + 22, 14, -60, 40] });
  const darkTell = frame({ bier: true, skirt: 'bier', up: true, dy: -1,
    far: [[-6, 20], [-9, 14]], near: [[5, 20], [8, 14]],
    book: [[0, 8], -90, true], wrist: [8, 14], rod: [[-9, 14], -110, 14, 'back'] });
  const dark = frame({ bier: true, skirt: 'bier', down: true,
    far: [[-6, 23], [-10, 20]], near: [[5, 23], [9, 20]],
    book: [[0, 14], -90, true], wrist: [9, 20], rod: [[-10, 20], -150, 14, 'back'], out: true });
  const setDown = frame({ skirt: 'stand', dy: 1, down: true,
    far: [[-6, 26], [-8, 29]], near: [[5, 26], [8, 29]],
    book: [[-2, 31], 0, false], wrist: [5, 26], rod: [[8, 29], -70, 14] });
  const walkA = frame({ skirt: 'stride', dy: 1,
    far: [[-6, 25], [-7, 28]], near: [[5, 25], [8, 28]],
    book: [[-1, 30], 4, false], wrist: [5, 25], rod: [[8, 28], -74, 14] });
  const walkB = frame({ skirt: 'stand',
    far: [[-6, 26], [-6, 29]], near: [[5, 26], [7, 29]],
    book: [[-2, 31], -4, false], wrist: [5, 26], rod: [[7, 29], -80, 14] });
  const floodTell = frame({ skirt: 'wide', up: true, dy: -1,
    far: [[-6, 22], [-13, 18]], near: [[5, 22], [12, 18]],
    book: [[-17, 20], -20, true], wrist: [-13, 18], rod: [[12, 18], -34, 14] });
  const hurtF = frame({ skirt: 'pooled', dx: -2, dy: 2, up: true,
    far: [[-6, 27], [-10, 30]], near: [[4, 27], [7, 31]],
    book: [[0, 34], 16, false], wrist: [4, 27], rod: [[7, 31], 30, 14] });
  const kneel = frame({ skirt: 'pooled', dy: 4, down: true,
    far: [[-6, 29], [-9, 32]], near: [[4, 29], [6, 33]],
    book: [[-1, 36], 0, false], wrist: [4, 29], rod: [[6, 33], 84, 14] });
  /* (claude/lamplit2, greybox for the art lane: B16 - every new move its OWN windup and release) */
  const collectTell = frame({ bier: true, skirt: 'bier', up: true, dy: -1,
    far: [[-5, 24], [-3, 27]], near: [[5, 20], [7, 13]], book: [[-2, 28], 0, false], wrist: [-5, 24], box: [8, 10] });
  const collect = frame({ bier: true, skirt: 'bier', dx: 1,
    far: [[-5, 24], [-3, 27]], near: [[5, 22], [11, 19]], book: [[-2, 28], 0, false], wrist: [-5, 24], box: [13, 18, true] });
  const scalesLowTell = frame({ bier: true, skirt: 'bier', dx: -1, hx: -1,
    far: [[-5, 24], [-3, 27]], near: [[1, 23], [-6, 27]], book: [[-2, 28], 0, false], wrist: [-5, 24], rod: [[-6, 27], 196, 12, 'back'], weight: true });
  const scalesHighTell = frame({ bier: true, skirt: 'bier', dx: -1, up: true,
    far: [[-5, 24], [-3, 27]], near: [[1, 20], [-7, 15]], book: [[-2, 28], 0, false], wrist: [-5, 24], rod: [[-7, 15], -160, 12, 'back'], weight: true });
  const scalesSwing = frame({ bier: true, skirt: 'bier', dx: 1,
    far: [[-5, 24], [-3, 27]], near: [[5, 23], [11, 23]], book: [[-2, 28], 0, false], wrist: [-5, 24], rod: [[11, 23], 6, 12], weight: true,
    smear: [1 + X + 10, 1 + 26, 16, -70, 50] });
  const sealTell = frame({ skirt: 'stand', up: true, dy: -1,
    far: [[-6, 25], [-8, 28]], near: [[5, 19], [6, 10]], book: [[-2, 31], 0, false], wrist: [-6, 25], seal: [6, 8] });
  const sealHit = frame({ skirt: 'wide', dx: 1, dy: 2, down: true,
    far: [[-6, 26], [-9, 29]], near: [[5, 26], [12, 33]], book: [[-2, 33], 0, false], wrist: [-6, 26], seal: [13, 34],
    smear: [1 + X + 12, 1 + 22, 14, -80, 60] });
  const writTell = frame({ skirt: 'stand', down: true,
    far: [[-6, 24], [-2, 22]], near: [[5, 24], [5, 21]], wrist: [-2, 22], book: [[-6, 31], 0, false], writ: [2, 21] });
  const writRead = frame({ skirt: 'wide', up: true, dy: -1,
    far: [[-6, 21], [-1, 15]], near: [[5, 21], [6, 15]], wrist: [-1, 15], book: [[-6, 31], 0, false], writ: [3, 13] });
  const flared = frame({ bier: true, skirt: 'bier', dx: -2, up: true, burn: true,
    far: [[-6, 21], [-11, 15]], near: [[5, 21], [10, 15]], book: [[-14, 22], -60, true], wrist: [-11, 15], rod: [[10, 15], -30, 14] });
  const flaredFoot = frame({ skirt: 'pooled', dx: -2, dy: 1, up: true, burn: true,
    far: [[-6, 22], [-11, 16]], near: [[5, 22], [10, 16]], book: [[-14, 24], -60, true], wrist: [-11, 16], rod: [[10, 16], -30, 14] });
  const tiltL = frame({ bier: true, skirt: 'bier', dx: -2, dy: 2, tilt: -1, up: true,
    far: [[-6, 25], [-11, 29]], near: [[5, 24], [9, 19]], book: [[-12, 32], 30, false], wrist: [-11, 29], rod: [[9, 19], -40, 14] });
  const tiltR = flipX(tiltL);   /* the other corner: the bier goes down on the right (main picks 24 or 25 by the stumbling bearer's side) */
  return pack([idle, ledgerTell, ledgerHit, tollTell, toll, darkTell, dark, setDown, walkA, walkB, floodTell, hurtF, kneel,
    collectTell, collect, scalesLowTell, scalesHighTell, scalesSwing, sealTell, sealHit, writTell, writRead, flared, flaredFoot, tiltL, tiltR], X + 1, H + 1, 18, 30);
}
