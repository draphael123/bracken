// pirates.js — THE FLOTILLA: the wreckers of a pirate fleet lashed into a floating town over a drowned city, in hot
// noon light. New bakers, not redraws. All frames face RIGHT (L is the flip). Every frame of a sprite shares one canvas,
// so the anchor holds. Anchors follow chars.js: ax = the body's centre column, ay = the outline row just under the feet
// (lowest body pixel on ay-1, its outline on ay); each frame grid is settle()d onto its floor row so that holds in every
// pose. Parts are char grids stamped onto a blank frame grid; blades, pins, grapples, barrels and the quartermaster's
// coat are rasterised into the same grid (limb / gline / gpoly), parts that cross the body are laid with an inner
// outline (layer()), then fromGrid + OUT outline. Reach points are canvas pixels relative to the anchor. The look:
// sunburnt skin, salt-bleached linen slops, red sashes, rotted leather, bare feet, brass and plain grey iron — people
// who work ships and take them, lit hard from above.
//
// bakeCutlass()  DECKHAND — a barefoot hand in a headscarf and an open shirt, a red sash, a brass earring, a missing
//   tooth, a plain heavy CUTLASS.
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (cutlass carried low and forward)
//           4 guard (cutlass up across the face, off hand held out in front)
//           5 slash tell (blade drawn back over the shoulder, body wound back, front foot planted)
//           6 slash (full swing through, blade low and forward, smear arc)
//   canvas 32x28 (grid 30x26; 22 px feet to crown)   anchor ax 15, ay 27   pack w/h 10x18
//   reach (the blade's steel): walk ax+4..ax+9, ay-9..ay-2 (carried low, the hilt's brass at ax+0..ax+5);
//          GUARD ax+1..ax+5, ay-20..ay-14 — it stands up across the face;
//          TELL ax-12..ax-5, ay-20..ay-14 — back over his shoulder, nowhere near the player;
//          SLASH ax+7..ax+15, ay-10..ay-4, the tip at ax+15, ay-5
//
// bakeBoarder()  BOARDER — bigger and wider: bare tattooed arms, a leather jerkin over a bare chest, a straw hat, and
//   a GRAPPLE (three flukes on a ring) with its rope coiled in the off hand.
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (grapple carried at the hip, rope slung across)
//           4 throw tell (body wound back, grapple swung up and behind the shoulder)
//           5 throw (arm out, hand OPEN and EMPTY, the grapple gone, smear off the release)
//           6 haul (both hands on the rope, leaning back, heels dug in, the line taut up and forward)
//   canvas 38x30 (grid 36x28; 25 px feet to hat crown)   anchor ax 18, ay 29   pack w/h 12x20
//   reach: walk grapple flukes ax+4..ax+8, ay-11..ay-6, its rope slung from ax-8 to ax+5;
//          TELL flukes ax-13..ax-9, ay-23..ay-19 — up behind him;
//          THROW the open hand at ax+10, ay-15 (the grapple leaves there; the rope trails ax-6..ax+12);
//          HAUL both fists at about ax+2, ay-13 with the rope running taut from them out to ax+17, ay-20
//
// bakeMarine()  MARINE — the shooter who lives in the rigging: a battered felt hat, a bandolier of bolts across the
//   chest, and a clumsy PISTOL-CROSSBOW (wooden stock, iron lathe, a bolt in the groove).
//   frames: 0 perch idle (crouched on his heels, the weapon across his knees)
//           1 perch scan (same crouch, head turned out to the viewer, both eyes)
//           2 aim (stood up, weapon up and level, the off eye shut)
//           3 shoot (recoil, the bolt gone, a puff of dust off the lathe)
//           4, 5 climb (hand over hand, two poses — the rope itself is the level's)
//   canvas 30x28 (grid 28x26; 22 px feet to hat standing, 17 px crouched)   anchor ax 14, ay 27   pack w/h 10x18
//   reach: perch the weapon lies across the knees, lathe and bolt ax-1..ax+9, ay-8..ay-3;
//          AIM bolt tip ax+11, ay-14, the lathe standing at ax+9, ay-15..ay-10, the stock back at ax+1, ay-12;
//          SHOOT the bolt is gone — muzzle ax+7, ay-12, flash ax+7, ay-15, puff ax+8..ax+11, ay-16..ay-14;
//          climb fists ax+5, ay-20 and ax+5, ay-15 (frame 4), ax+4, ay-19 and ax+5, ay-16 (frame 5)
//
// bakeBosun()  BOSUN — the one who calls the others: heavy, a leather waistcoat over a linen shirt, a BELAYING PIN in
//   one fist and a brass bosun's call on a lanyard at the chest.
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (pin carried low and forward)
//           4 WHISTLE (head back, the call up at his mouth, chest out, pale trills in front of his face)
//           5 swing tell (pin cocked back past his ear, shoulder turned)
//           6 swing (pin driven down and across, smear arc)
//   canvas 36x30 (grid 34x28; 24 px feet to crown)   anchor ax 17, ay 29   pack w/h 12x20
//   reach: walk pin head ax+5..ax+8, ay-8..ay-2;
//          WHISTLE the call at ax+5..ax+6, ay-19 and the trills out to ax+13, ay-22..ay-19 (the pin is out of the
//          fight, hanging at ax-4..ax-1 down to the deck);
//          TELL pin head ax-14..ax-8, ay-19..ay-17 — cocked back behind his head;
//          SWING pin head ax+12..ax+17, ay-9..ay-5 — it comes down and across in front of him
//
// bakeLookout()  LOOKOUT — thin and sun-bleached, a rag round his head, a brass SPYGLASS, a call on a cord.
//   frames: 0 idle (glass hanging at his side, weight on one hip, the off arm out on a rail that is not drawn)
//           1 scan (glass up to the eye, head and body turned along it)
//           2 spot (starting upright, the glass dropping out of his hand, the other hand on the call)
//           3 shout (both hands cupped at the mouth, body pitched forward, pale trills)
//   canvas 28x26 (grid 26x24; 20 px feet to crown)   anchor ax 13, ay 25   pack w/h 8x16
//   reach (brass — the call rides the chest at about ax+1, ay-10 in every frame): idle glass ax+4..ax+6, ay-9..ay-3
//          (hanging by his leg); SCAN glass ax+3..ax+11, ay-17..ay-15 — level, out past his face;
//          spot glass ax+5..ax+9, ay-11..ay-4, falling; SHOUT fists ax+3..ax+5, ay-16..ay-13, trills ax+8..ax+13,
//          ay-18..ay-15
//
// bakeQuarter()  THE QUARTERMASTER (boss) — a woman in a long salt-faded coat over a sash and a cutlass belt, sea
//   boots, a cocked hat with a black feather, one gold earring, a scar down the cheek. A heavy CUTLASS in the right
//   hand and a long horse-PISTOL in the left.
//   frames: 0 idle (weight back, cutlass low, pistol held across the body), 1, 2 walk,
//           3 slash tell (cutlass drawn far back, coat tails swinging after it),
//           4 slash (a long step through, blade out level, coat and hat brim streaming, smear arc),
//           5 shoot tell (pistol up, arm straight, cutlass dropped behind her),
//           6 shoot (recoil, muzzle flash and smoke),
//           7 leap (up and back, coat spread, one boot tucked, cutlass up),
//           8 cut line (the blade slicing DOWN through a rope at her feet, body coiled over it),
//           9 stagger (head down, hat brim over the eyes, off hand out for balance),
//           10 kneel (down on one knee, cutlass point in the deck, holding herself up on it)
//   canvas 44x32 (grid 42x30; 28 px feet to the tip of the feather, 34 px across in the slash)
//   anchor ax 20, ay 31   pack w/h 12x22
//   reach: idle cutlass ax-1..ax+10, ay-16..ay-1 (held low, its point by the deck), the pistol laid across her chest,
//          lock and barrel ax-3..ax+4, ay-18..ay-7;
//          walk the same, the cutlass out to ax+12, ay-1;
//          TELL cutlass ax-19..ax+6, ay-23..ay-14 — drawn far back over her shoulder, nothing in front of her;
//          SLASH cutlass ax+12..ax+22, ay-14..ay-10, the tip at ax+22, ay-12 — the longest reach she has;
//          shoot tell muzzle ax+13, ay-16 (arm straight, the cutlass dropped behind to ax-12, ay-3);
//          SHOOT muzzle about ax+10, ay-21 with the flash ax+10..ax+14, ay-23..ay-19 and smoke out to ax+19, ay-21;
//          LEAP cutlass ax-10..ax+7, ay-28..ay-18 — up and over her, boots ax-7..ax+1, ay-8..ay-1;
//          CUT LINE blade ax+5..ax+8, ay-11..ay-2, its point in the rope, and the cut line lies ax-3..ax+12, ay-7..ay-1;
//          stagger cutlass ax+3..ax+8, ay-6..ay-1 (the pistol trails behind to ax-15);
//          KNEEL the point grounded at ax+9, ay-1, the blade running up to ax+6, ay-7
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
const put = (G, x, y, k) => { x = Math.round(x); y = Math.round(y); if (G[y] && x >= 0 && x < G[y].length) G[y][x] = k; };
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
// a 1-px line (Bresenham) into a grid; k is a char or (i, n) => char along the line; returns the points
function gline(G, x0, y0, x1, y1, k) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const pts = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  pts.forEach(([x, y], i) => put(G, x, y, typeof k === 'function' ? k(i, pts.length) : k));
  return pts;
}
// a capsule from a to b, `w` thick; each pixel takes the char of the side it faces: ramp = [dark, base, light], lit
// from the upper left. a === b gives a disc, which is how fists, knobs and pommels are massed.
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
// a swing's smear: a sun-bleached arc of radius r round (cx, cy) in canvas pixels, from angle a0 to a1 (degrees,
// 0 = ahead, -90 = straight up), drawn after the outline and only on empty pixels; the last 60% gets a second band
function smear(c, cx, cy, r, a0, a1, maxY = Infinity) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 2) for (const [rr, col] of [[r, '#fff6dc'], [r - 1, a > a0 + (a1 - a0) * 0.4 ? '#d8ab7c' : null]]) {
    if (!col) continue;
    const x = Math.round(cx + rr * Math.cos(a * Math.PI / 180)), y = Math.round(cy + rr * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= c.width || y >= c.height || y > maxY) continue;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, col);
  }
}

// ---------- THE FLOTILLA PALETTE ----------
// sunburnt skin h/s/S with g for the far limbs, eye e, dark mouth m, a white tooth or trill t; hair k/K;
// salt-bleached linen l/L/q; red sash r/R; rotted leather u/U/v; plain iron i/I/j; brass y/Y; wood w/W; rope p/P;
// straw hat c/C; the quartermaster's faded coat a/A/D; black felt f/F; her feather b/B; muzzle flash x/X; smoke z/Z;
// headscarf n/N; tattoo ink d
const PR = { o: OUT, h: '#f0bc90', s: '#cf8f62', S: '#9e603e', g: '#6b3f29', e: '#f7f3e3', m: '#4d1d23', t: '#f2ead2',
  k: '#3b2517', K: '#644228',
  l: '#f0e7d1', L: '#cbbda2', q: '#8d8270',
  r: '#d14a3a', R: '#8e2b26',
  u: '#ab7340', U: '#7c4f29', v: '#4d3019',
  i: '#e3e9f0', I: '#9ba5b3', j: '#5c6573',
  y: '#e6b94a', Y: '#9c7619',
  w: '#c29c5e', W: '#7c5e31',
  p: '#e0cc9c', P: '#9f8752',
  c: '#f2d88e', C: '#b79540',
  a: '#8d9aa6', A: '#5e6b7a', D: '#3a4450',
  f: '#3e3647', F: '#605672',
  b: '#191622', B: '#514a62',
  x: '#fff6d2', X: '#ffb23c',
  z: '#c6c2bb', Z: '#8e8a85',
  n: '#4f9ab0', N: '#2c5e73',
  d: '#35506b' };

// a heading in degrees into a local frame: u is along it, n is 90 degrees clockwise of it (so +s is the edge side of a
// blade held point-forward, and the underside of a barrel)
const axis = (o, deg) => {
  const a = deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]];
  return (d, s = 0) => [o[0] + u[0] * d + n[0] * s, o[1] + u[1] * d + n[1] * s];
};
// a plain heavy cutlass: a leather grip with a brass pommel and knuckle bow, and a slightly curved blade — a dark back
// and one bright edge, 2 px of steel, or 3 for the quartermaster's heavier one (th 0.95). cv bends the last of the
// blade towards the edge. Returns the tip.
function cutlass(G, hand, deg, len = 10, th = 0.55, cv = 1) {
  const P = axis(hand, deg);
  limb(G, P(-2.6), P(0.4), 2.2, ['v', 'U', 'u']);
  limb(G, P(-3.4), P(-3.4), 2.0, ['Y', 'y', 'y']);
  gline(G, ...P(1.0, 1.2), ...P(-2.2, 2.4), 'y');
  gline(G, ...P(1.0, -1.4), ...P(1.0, 1.4), 'Y');
  const band = th > 0.8 ? [[-1, 'j'], [0, 'I'], [0.95, 'i']] : [[-0.5, 'j'], [0.5, 'i']];
  let tip = P(len);
  for (let t = 1.7; t <= len; t += 0.28) {
    const f = (t - 1.7) / Math.max(0.01, len - 1.7), o = cv * f * f * len * 0.13;
    for (const [s, k] of band) put(G, ...P(t, o + s), f > 0.9 && s < 0 ? 'I' : k);
    tip = P(t, o);
  }
  return tip.map(Math.round);
}
// a belaying pin: a turned oak club, a knob at the butt and a heavy head
function belay(G, hand, deg, len = 7) {
  const P = axis(hand, deg);
  limb(G, P(-2.4), P(-2.4), 2.8, ['W', 'W', 'w']);
  limb(G, P(-1.8), P(len - 1.6), 2.0, ['W', 'w', 'w']);
  limb(G, P(len - 1.6), P(len), 3.2, ['W', 'w', 'c']);
  return P(len).map(Math.round);
}
// a long horse-pistol: a walnut butt hanging back under the hand, a brass lock and cock, and a thin iron barrel
function pistol(G, hand, deg, len = 8) {
  const P = axis(hand, deg);
  limb(G, P(-1.2, 3.2), P(-0.2, 0.6), 2.4, ['W', 'W', 'w']);
  limb(G, P(-0.6, 0.2), P(1.4, 0.2), 2.4, ['Y', 'y', 'y']);
  put(G, ...P(0.6, -1.6), 'Y');
  limb(G, P(2), P(len), 1.5, ['j', 'I', 'i']);
  return P(len).map(Math.round);
}
// the pistol-crossbow: a stubby wooden stock and butt, a brass trigger, an iron lathe standing across the front with
// its string drawn back to the nut, and a bolt lying in the groove when it is loaded
function pxbow(G, hand, deg, loaded) {
  const P = axis(hand, deg);
  limb(G, P(-3.6, 1.8), P(-1.2, 0.4), 2.4, ['W', 'W', 'w']);
  limb(G, P(-1.4, 0.2), P(3.8, 0.2), 2.0, ['W', 'w', 'w']);
  put(G, ...P(-0.4, 1.8), 'Y');
  gline(G, ...P(3.8, -2.4), ...P(3.8, 2.4), 'j');
  put(G, ...P(3.8, -2.4), 'I'); put(G, ...P(3.8, 2.4), 'I');
  gline(G, ...P(3.6, -2.2), ...P(2.2, 0), 'P');
  gline(G, ...P(3.6, 2.2), ...P(2.2, 0), 'P');
  if (loaded) { gline(G, ...P(2.2), ...P(6), 'W'); put(G, ...P(6), 'i'); put(G, ...P(5.4), 'I'); }
  return P(loaded ? 6 : 3.8).map(Math.round);
}
// a brass spyglass: a drawn tube with a wider bell at the object end
function spyglass(G, a, b) {
  limb(G, a, b, 1.4, ['Y', 'y', 'y']);
  limb(G, b, b, 2.2, ['Y', 'y', 'y']);
  put(G, ...a, 'Y');
  return b.map(Math.round);
}
// a bosun's call on its lanyard: a brass bowl and pipe at (x, y), the cord running up to the back of the neck
const call = (G, x, y, nx, ny) => { gline(G, nx, ny, x, y + 1, 'P'); put(G, x, y, 'y'); put(G, x + 1, y, 'y'); put(G, x, y + 1, 'Y'); put(G, x + 1, y + 1, 'y'); };
// two pale trills in front of a mouth — the one mark that makes a whistle read at 1x
const TRILL = [
  '..tt..t',
  '.tt...t',
  '.tt...t',
  '..tt..t',
];
// the grapple: three hooked flukes on a ring, drawn flukes-up or flukes-down, and a loose coil of rope
const GRAP_U = [
  'i.i.i',
  'Ij.jI',
  '.III.',
  '..I..',
  '..j..',
];
const GRAP_D = [
  '..j..',
  '..I..',
  '.III.',
  'Ij.jI',
  'i.i.i',
];
const COIL = [
  '.pP.',
  'pPpP',
  'PpPp',
  '.Pp.',
];

// ---------- DECKHAND ----------
export function bakeCutlass() {
  const W = 30, H = 26, X = 14;
  const q = G => outline(fromGrid(rowsOf(settle(G)), PR, 1), OUT);
  // parts are 9 wide with column 4 on the body's centre; the profile faces right, so the face sits at columns 5-8
  const HEAD = [
    '..nnNn...',
    '.nnnnnNN.',
    '.NnnnnnSs',
    'hsShhSeSh',
    '.kKhhhhms',
    '..kKShhSy',
    '...kKSs..',
  ];
  const TORSO = [
    '..sShhS..',
    '.lLlllLq.',
    'lLlshhLq.',
    'lLlshhLq.',
    'lLllllLq.',
    '.rRrrRq..',
    '.qRrrRq..',
    '.qLllLq..',
  ];
  // legs are 13 wide with column 6 on the centre: slops to the knee, then bare shins and bare feet; the near leg is
  // the lit one (s/h), the far one stays a tone back (S) so the stride reads
  const LEGS = {
    a: ['....qqLl.....',
      '...qq..Ll....',
      '...qS...ss...',
      '..SS....ss...',
      '..SS....ss...',
      '.SS.....sh...',
      'SSs....shhh..'],
    b: ['....qqLl.....',
      '....qqLl.....',
      '....qSls.....',
      '...SS..ss....',
      '...SS..ss....',
      '..SS...shh...',
      '..SSs........'],
    c: ['....Llqq.....',
      '...Ll..qq....',
      '...ls...Sq...',
      '..ss....SS...',
      '..ss....SS...',
      '.sh.....SS...',
      'shhh....SSs..'],
    d: ['....Llqq.....',
      '....Llqq.....',
      '....lsqS.....',
      '...ss..SS....',
      '...ss..SS....',
      '..shh..SSs...',
      '.shhh........'],
    guard: ['....qqLl.....',
      '...qq...Ll...',
      '..SS.....ss..',
      '..SS.....ss..',
      '.SS......ss..',
      '.SS......sh..',
      'SSs.....shhh.'],
    tell: ['....qqLl.....',
      '...qq..Ll....',
      '..SS...ls....',
      '..SS...ss....',
      '.SS....ss....',
      '.SS....sh....',
      'SSs...shhh...'],
    slash: ['....qqLl.....',
      '...qq....Ll..',
      '..SS......ss.',
      '.SS.......ss.',
      '.SS.......ss.',
      'SS........sh.',
      'Ss.......shhh'],
  };
  // a rolled linen sleeve to the elbow and a bare forearm beyond it; the near forearm carries an ink mark
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 2.2, far ? ['q', 'q', 'L'] : ['q', 'L', 'l']);
    limb(g, el, hd, 1.9, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
    put(g, hd[0], hd[1], far ? 'S' : 'h');
    if (!far) put(g, el[0] + 1, el[1] + 1, 'd');
  });
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 4;
    const hand = [B + o.hand[0], o.hand[1] + dy];
    if (o.back) layer(G, g => cutlass(g, hand, o.deg, o.len));
    arm(G, [B - 2, 13 + dy], [B + o.far[0][0], o.far[0][1] + dy], [B + o.far[1][0], o.far[1][1] + dy], true);
    stamp(G, B - 6, 19, LEGS[o.legs]);
    stamp(G, O, 11 + dy, TORSO);
    layer(G, g => stamp(g, O + (o.hx || 0), 4 + dy, HEAD));
    if (!o.back) layer(G, g => cutlass(g, hand, o.deg, o.len));
    arm(G, [B + 2, 13 + dy], [B + o.near[0][0], o.near[0][1] + dy], hand, false);
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  const walk = i => frame({ legs: 'abcd'[i], dy: i === 0 || i === 2 ? 1 : 0,
    hand: [3, 16], deg: 44, len: 9,
    far: [[-4, 15], [-5, 18]], near: [[2, 15]] });
  const guard = frame({ legs: 'guard', dy: 1,
    hand: [1, 14], deg: -74, len: 10,
    far: [[3, 14], [7, 14]], near: [[1, 15]] });
  const tell = frame({ legs: 'tell', dx: -1, dy: 1, hx: -1, back: true,
    hand: [-3, 12], deg: -147, len: 10,
    far: [[1, 15], [3, 16]], near: [[-1, 13]] });
  const slash = frame({ legs: 'slash', dx: 1, dy: 1, hx: 1,
    hand: [5, 15], deg: 24, len: 11,
    far: [[-2, 14], [-3, 16]], near: [[3, 14]],
    smear: [1 + X + 3, 1 + 15, 13, -96, 30] });
  return pack([walk(0), walk(1), walk(2), walk(3), guard, tell, slash], X + 1, H + 1, 10, 18);
}

// ---------- BOARDER ----------
export function bakeBoarder() {
  const W = 36, H = 28, X = 17;
  const q = G => outline(fromGrid(rowsOf(settle(G)), PR, 1), OUT);
  // 11 wide with column 5 on the centre; the straw hat's brim runs the whole width
  const HEAD = [
    '....ccc....',
    '...ccccC...',
    '..cccccCC..',
    '.CCCCCCCCC.',
    '..kkhhShSs.',
    '..kShhheSh.',
    '...kKhhhms.',
    '...kKShhSy.',
    '....kKSs...',
  ];
  const TORSO = [
    '...sShhS...',
    '..UUvvvvv..',
    '.UUvshhvvv.',
    '.UUvshhvvv.',
    'UUvvshhvvv.',
    'UUvvshhvvv.',
    '.rRrrrRRv..',
    '.vRrrrRv...',
    '..vLllLq...',
    '..qLllLq...',
  ];
  const LEGS = {
    a: ['.....qqLl......',
      '....qq..Ll.....',
      '....qS...ss....',
      '...SS....ss....',
      '...SS....ss....',
      '..SS.....ss....',
      '..SS.....sh....',
      '.SSs....shhh...'],
    b: ['.....qqLl......',
      '.....qqLl......',
      '.....qSls......',
      '....SS..ss.....',
      '....SS..ss.....',
      '...SS...ss.....',
      '...SS...shh....',
      '...SSs.........'],
    c: ['.....Llqq......',
      '....Ll..qq.....',
      '....ls...Sq....',
      '...ss....SS....',
      '...ss....SS....',
      '..ss.....SS....',
      '..sh.....SS....',
      '.shhh...SSs....'],
    d: ['.....Llqq......',
      '.....Llqq......',
      '.....lsqS......',
      '....ss..SS.....',
      '....ss..SS.....',
      '...ss...SS.....',
      '...shh..SSs....',
      '..shhh.........'],
    wind: ['.....qqLl......',
      '...qqq..Ll.....',
      '..SS.....ss....',
      '..SS.....ss....',
      '.SS......ss....',
      '.SS......ss....',
      '.SS......sh....',
      'SSs.....shhh...'],
    lunge: ['.....qqLl......',
      '....qq....Ll...',
      '...SS......ss..',
      '..SS.......ss..',
      '..SS.......ss..',
      '.SS........ss..',
      '.SS........sh..',
      'SSs.......shhh.'],
    dug: ['....qqLl.......',
      '..qqq...Ll.....',
      '.SS......ss....',
      '.SS.......ss...',
      'SS........ss...',
      'SS........ss...',
      'SSs.......shh..',
      'Sss......shhhh.'],
  };
  // bare arms, heavy and tattooed: one ink band above each elbow
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 2.8, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
    limb(g, el, hd, 2.4, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
    limb(g, hd, hd, 2.4, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
    put(g, el[0], el[1] - 1, far ? 'g' : 'd');
  });
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 5;
    const P = (v) => [B + v[0], v[1] + dy];
    if (o.grap && o.grap[2] === 'back') layer(G, g => stamp(g, B + o.grap[0], o.grap[1] + dy, GRAP_D));
    arm(G, P([-3, 15]), P(o.far[0]), P(o.far[1]), true);
    stamp(G, B - 7, 20, LEGS[o.legs]);
    stamp(G, O, 11 + dy, TORSO);
    layer(G, g => stamp(g, O + (o.hx || 0), 3 + dy, HEAD));
    arm(G, P([3, 15]), P(o.near[0]), P(o.near[1]), false);
    if (o.rope) layer(G, g => { for (let i = 0; i + 1 < o.rope.length; i++) gline(g, ...P(o.rope[i]), ...P(o.rope[i + 1]), (j) => (j % 3 ? 'P' : 'p')); });
    if (o.coil) layer(G, g => stamp(g, B + o.coil[0], o.coil[1] + dy, COIL));
    if (o.grap && o.grap[2] !== 'back') layer(G, g => stamp(g, B + o.grap[0], o.grap[1] + dy, o.grap[2] === 'down' ? GRAP_D : GRAP_U));
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  const walk = i => frame({ legs: 'abcd'[i], dy: i === 0 || i === 2 ? 1 : 0,
    far: [[-5, 18], [-6, 20]], near: [[5, 18], [6, 21]],
    coil: [-8, 19], rope: [[6, 22], [0, 23], [-6, 21]], grap: [4, 17, 'up'] });
  const tell = frame({ legs: 'wind', dx: -1, dy: 1, hx: -1,
    far: [[-1, 17], [2, 18]], near: [[-4, 12], [-7, 10]],
    coil: [3, 19], rope: [[-7, 11], [-2, 17], [4, 20]], grap: [-12, 4, 'back'] });
  const thr = frame({ legs: 'lunge', dx: 2, dy: 1, hx: 1,
    far: [[-3, 17], [-5, 19]], near: [[5, 13], [8, 12]],
    coil: [-8, 19], rope: [[10, 10], [4, 15], [-5, 20]],
    smear: [1 + X + 5, 1 + 14, 10, -104, 10] });
  const haul = frame({ legs: 'dug', dx: -2, dy: 2, hx: -1,
    far: [[1, 13], [4, 12]], near: [[2, 14], [5, 13]],
    rope: [[4, 13], [19, 6]] });
  return pack([walk(0), walk(1), walk(2), walk(3), tell, thr, haul], X + 1, H + 1, 12, 20);
}

// ---------- MARINE ----------
export function bakeMarine() {
  const W = 28, H = 26, X = 13;
  const q = G => outline(fromGrid(rowsOf(settle(G)), PR, 1), OUT);
  const HEAD = [
    '...fFf...',
    '..ffFff..',
    '.fffffffF',
    '..kkhheSh',
    '...khhhms',
    '...kShhSs',
    '....kSs..',
  ];
  // head turned out to the viewer: the brim squares up and both eyes show under it
  const HEAD_F = [
    '..ffFf...',
    '.fffFff..',
    'ffffffff.',
    '.ShheheS.',
    '.kShhhSs.',
    '..kSmSs..',
    '...kSs...',
  ];
  // sighting down the weapon: the off eye is shut to a dark line
  const HEAD_A = [
    '...fFf...',
    '..ffFff..',
    '.fffffffF',
    '..kkhhSSh',
    '...khhhms',
    '...kShhSs',
    '....kSs..',
  ];
  // the bandolier runs from the shoulder by his face down across the chest, with the bolt heads showing above it
  const TORSO = [
    '..sShhS..',
    '.lLlUUq..',
    'lLliUUq..',
    'lLiUUlq..',
    'lUUilLq..',
    'UUlllLq..',
    '.rRrrRq..',
    '.qLllLq..',
  ];
  const LEGS = {
    crouch: ['...qqLLll....',
      '..qqLLllss...',
      '..qSllssss...',
      '..SS..ss.....',
      '.SSs..ss.....',
      'SSs..shhh....'],
    crouch2: ['...qqLLll....',
      '..qqLLllss...',
      '..qSllssss...',
      '..SS..ss.....',
      '.SSs..ss.....',
      'SSs...shhh...'],
    stand: ['....qqLl.....',
      '....qqLl.....',
      '...qS..ls....',
      '...SS..ss....',
      '..SS...ss....',
      '..SS...sh....',
      '.SSs..shhh...'],
    brace: ['....qqLl.....',
      '...qq...Ll...',
      '..SS.....ss..',
      '..SS.....ss..',
      '.SS......ss..',
      '.SS......sh..',
      'SSs.....shhh.'],
    climbA: ['....qqLl.....',
      '...qqLLll....',
      '..qSS.llss...',
      '..SS...sss...',
      '..SS..shhh...',
      '.SSs.........',
      'SSs..........'],
    climbB: ['....qqLl.....',
      '....qqLLl....',
      '...qSSlss....',
      '..SS...ss....',
      '.SSs...ss....',
      '.......ss....',
      '......shhh...'],
  };
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 2.2, far ? ['q', 'q', 'L'] : ['q', 'L', 'l']);
    limb(g, el, hd, 1.9, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
    put(g, hd[0], hd[1], far ? 'S' : 'h');
  });
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 4;
    const P = v => [B + v[0], v[1] + dy];
    arm(G, P([-2, 13]), P(o.far[0]), P(o.far[1]), true);
    if (!o.legsFront) stamp(G, B - 6, o.legsY || 19, LEGS[o.legs]);
    stamp(G, O, 11 + dy, TORSO);
    layer(G, g => stamp(g, O + (o.hx || 0), 4 + dy, o.head === 'front' ? HEAD_F : o.head === 'aim' ? HEAD_A : HEAD));
    if (o.legsFront) layer(G, g => stamp(g, B - 6, o.legsY || 19, LEGS[o.legs]));
    if (o.bow) layer(G, g => pxbow(g, P(o.bow[0]), o.bow[1], o.bow[2]));
    arm(G, P([2, 13]), P(o.near[0]), P(o.near[1]), false);
    if (o.puff) { const [cx, cy] = P(o.puff); layer(G, g => { stamp(g, cx, cy, ['.zZ.', 'zZ.z', '.Zz.']); put(g, cx - 1, cy + 1, 'x'); }); }
    if (o.rope) layer(G, g => { for (let y = o.rope[1]; y <= o.rope[2]; y++) { put(g, o.rope[0], y, y % 3 ? 'p' : 'P'); put(g, o.rope[0] + 1, y, y % 3 === 1 ? 'p' : 'P'); } });
    return q(G);
  };
  const perch = h => frame({ legs: h === 'front' ? 'crouch2' : 'crouch', legsY: 20, legsFront: true, dy: 5, head: h,
    far: [[-3, 15], [-1, 17]], near: [[1, 15], [3, 17]], bow: [[3, 17], -2, true] });
  const aim = frame({ legs: 'brace', dy: 1, head: 'aim',
    far: [[1, 14], [3, 14]], near: [[3, 13], [5, 13]], bow: [[5, 13], -3, true] });
  const shoot = frame({ legs: 'brace', dx: -1, dy: 1, hx: -1, head: 'aim',
    far: [[0, 14], [2, 15]], near: [[2, 12], [4, 12]], bow: [[4, 12], -14, false], puff: [9, 9] });
  const climbA = frame({ legs: 'climbA', dy: 1,
    far: [[3, 12], [5, 13]], near: [[4, 9], [6, 5]] });
  const climbB = frame({ legs: 'climbB',
    far: [[3, 9], [5, 6]], near: [[4, 13], [5, 10]] });
  return pack([perch('side'), perch('front'), aim, shoot, climbA, climbB], X + 1, H + 1, 10, 18);
}

// ---------- BOSUN ----------
export function bakeBosun() {
  const W = 34, H = 28, X = 16;
  const q = G => outline(fromGrid(rowsOf(settle(G)), PR, 1), OUT);
  // 11 wide with column 5 on the centre: a balding sunburnt head, hair round the back of it, a heavy black beard
  const HEAD = [
    '...sShS....',
    '..sshhhhS..',
    '.ksShhhhSs.',
    '.kShhhheSh.',
    '..khhhhhms.',
    '..kKkkkkSy.',
    '...kkkkSs..',
  ];
  // the whistle: the head tipped back and the beard jutting up and forward, the jaw open at the top of the face
  const HEAD_W = [
    '...sShS....',
    '..sshhhhSs.',
    '..ksShhheSh',
    '..kShhhhhSs',
    '..khhhhhmms',
    '..kKkkkkkSs',
    '...kkkkkS..',
  ];
  const TORSO = [
    '....sShhS....',
    '..uUUllluUv..',
    '.uUUllllluUv.',
    'uUUUllllluUvv',
    'uUUUlllllUvv.',
    'uUUUllllUUvv.',
    '..rRrrrRRv...',
    '..vRrrrRv....',
    '...vLllLq....',
    '...qLllLq....',
  ];
  const LEGS = {
    a: ['.....qqLl......',
      '....qq..Ll.....',
      '....qS...ss....',
      '...SS....ss....',
      '...SS....ss....',
      '..SS.....sh....',
      '.SSs....shhh...'],
    b: ['.....qqLl......',
      '.....qqLl......',
      '.....qSls......',
      '....SS..ss.....',
      '....SS..ss.....',
      '...SS...shh....',
      '...SSs.........'],
    c: ['.....Llqq......',
      '....Ll..qq.....',
      '....ls...Sq....',
      '...ss....SS....',
      '...ss....SS....',
      '..ss.....SS....',
      '.shhh...SSs....'],
    d: ['.....Llqq......',
      '.....Llqq......',
      '.....lsqS......',
      '....ss..SS.....',
      '....ss..SS.....',
      '...shh..SSs....',
      '..shhh.........'],
    plant: ['.....qqLl......',
      '...qqq..Ll.....',
      '..SS.....ss....',
      '..SS.....ss....',
      '.SS......ss....',
      '.SS......sh....',
      'SSs.....shhh...'],
    cock: ['.....qqLl......',
      '....qq..Ll.....',
      '...SS...ls.....',
      '..SS....ss.....',
      '..SS....ss.....',
      '.SS.....sh.....',
      'SSs....shhh....'],
    swing: ['.....qqLl......',
      '....qq....Ll...',
      '...SS......ss..',
      '..SS.......ss..',
      '..SS.......ss..',
      '.SS........sh..',
      'SSs.......shhh.'],
  };
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 2.6, far ? ['q', 'q', 'L'] : ['q', 'L', 'l']);
    limb(g, el, hd, 2.1, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
    limb(g, hd, hd, 2.2, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
  });
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 5;
    const P = v => [B + v[0], v[1] + dy];
    if (o.back) layer(G, g => belay(g, P(o.pin[0]), o.pin[1]));
    arm(G, P([-4, 15]), P(o.far[0]), P(o.far[1]), true);
    stamp(G, B - 7, 21, LEGS[o.legs]);
    stamp(G, B - 6, 12 + dy, TORSO);
    layer(G, g => stamp(g, O + (o.hx || 0), 5 + dy, o.whistle ? HEAD_W : HEAD));
    if (!o.back) layer(G, g => belay(g, P(o.pin[0]), o.pin[1]));
    arm(G, P([4, 15]), P(o.near[0]), P(o.near[1]), false);
    if (o.whistle) {
      layer(G, g => stamp(g, B + 6, 6 + dy, TRILL));
      layer(G, g => call(g, B + 4, 9 + dy, B - 1, 13 + dy));
    } else layer(G, g => call(g, B + 1, 15 + dy, B - 1, 12 + dy));
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  const walk = i => frame({ legs: 'abcd'[i], dy: i === 0 || i === 2 ? 1 : 0,
    far: [[-5, 18], [-6, 21]], near: [[3, 17], [4, 18]], pin: [[4, 18], 62] });
  const whistle = frame({ legs: 'plant', dx: 1, hx: 1, whistle: true,
    far: [[-4, 17], [-5, 20]], near: [[3, 14], [5, 11]], pin: [[-4, 19], 84] });
  const tell = frame({ legs: 'cock', dx: -1, dy: 1, hx: -1, back: true,
    far: [[1, 17], [3, 18]], near: [[-2, 13], [-5, 11]], pin: [[-5, 11], -160] });
  const swing = frame({ legs: 'swing', dx: 2, dy: 1, hx: 1,
    far: [[-2, 17], [-4, 19]], near: [[5, 15], [8, 17]], pin: [[8, 17], 30],
    smear: [1 + X + 5, 1 + 15, 13, -92, 34] });
  return pack([walk(0), walk(1), walk(2), walk(3), whistle, tell, swing], X + 1, H + 1, 12, 20);
}

// ---------- LOOKOUT ----------
export function bakeLookout() {
  const W = 26, H = 24, X = 12;
  const q = G => outline(fromGrid(rowsOf(settle(G)), PR, 1), OUT);
  // a rag knotted round bleached hair; a thin face with a squint
  const HEAD = [
    '..lLll...',
    '.lLlLLq..',
    '.qKKKhSs.',
    'KKhhhSeSh',
    '.KhhhhmSs',
    '..KShhSs.',
    '...KSs...',
  ];
  // the eye wide and the mouth open: he has seen something
  const HEAD_O = [
    '..lLll...',
    '.lLlLLq..',
    '.qKKKhSs.',
    'KKhhhSeSh',
    '.Khhhhess',
    '..KShmms.',
    '...KSs...',
  ];
  const TORSO = [
    '..sShS..',
    '.lLllq..',
    'lLlshq..',
    'lLlshq..',
    '.rRrRq..',
    '.qLlLq..',
  ];
  const LEGS = {
    lean: ['...qqLl.....',
      '...qqLl.....',
      '..qS..ls....',
      '..SS..ss....',
      '.SS...ss....',
      '.SS...sh....',
      'SSs..shhh...'],
    turn: ['...qqLl.....',
      '..qq...Ll...',
      '..SS....ss..',
      '.SS.....ss..',
      '.SS.....ss..',
      'SS......sh..',
      'Ss.....shhh.'],
    up: ['...qqLl.....',
      '...qq.Ll....',
      '..SS...ls...',
      '..SS...ss...',
      '.SS....ss...',
      '.SS....sh...',
      'SSs...shhh..'],
    pitch: ['...qqLl.....',
      '..qq....Ll..',
      '.SS......ss.',
      '.SS......ss.',
      'SS.......ss.',
      'SS.......sh.',
      'Ss......shhh'],
  };
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 1.9, far ? ['q', 'q', 'L'] : ['q', 'L', 'l']);
    limb(g, el, hd, 1.7, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
    put(g, hd[0], hd[1], far ? 'S' : 'h');
  });
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 4;
    const P = v => [B + v[0], v[1] + dy];
    arm(G, P([-2, 13]), P(o.far[0]), P(o.far[1]), true);
    stamp(G, B - 5, 17, LEGS[o.legs]);
    stamp(G, O, 11 + dy, TORSO);
    layer(G, g => stamp(g, O + (o.hx || 0), 5 + dy, o.open ? HEAD_O : HEAD));
    arm(G, P([2, 13]), P(o.near[0]), P(o.near[1]), false);
    if (o.glass) layer(G, g => spyglass(g, P(o.glass[0]), P(o.glass[1])));
    layer(G, g => call(g, B + 1, 14 + dy, B - 1, 12 + dy));
    if (o.trill) layer(G, g => stamp(g, B + o.trill[0], o.trill[1] + dy, TRILL));
    return q(G);
  };
  const idle = frame({ legs: 'lean',
    far: [[-4, 14], [-7, 14]], near: [[3, 14], [4, 16]], glass: [[4, 16], [5, 20]] });
  const scan = frame({ legs: 'turn', dx: 1, hx: 1,
    far: [[-1, 14], [1, 15]], near: [[3, 12], [4, 9]], glass: [[3, 9], [9, 8]] });
  const spot = frame({ legs: 'up', dy: -1, hx: 1, open: true,
    far: [[0, 14], [1, 14]], near: [[4, 14], [6, 16]], glass: [[6, 16], [8, 20]] });
  const shout = frame({ legs: 'pitch', dx: 1, dy: 1, hx: 1, open: true,
    far: [[1, 12], [3, 10]], near: [[3, 13], [4, 9]], trill: [6, 5] });
  return pack([idle, scan, spot, shout], X + 1, H + 1, 8, 16);
}

// ---------- THE QUARTERMASTER ----------
export function bakeQuarter() {
  const W = 42, H = 30, X = 19, FL = H - 1;
  const q = G => outline(fromGrid(rowsOf(settle(G)), PR, 1), OUT);
  // 13 wide with column 6 on the centre: a cocked hat with a black feather, a hard face with one gold earring and a
  // scar down the cheek, dark hair clubbed behind
  const HEAD = [
    'b............',
    '.bB..........',
    '..bb.........',
    '...bf........',
    '..fffFF......',
    '.ffffFFFf....',
    'ffffffffFFFf.',
    '..kkkkkkSs...',
    '..kShhhSeSh..',
    '..kKhShhhms..',
    '...kKSShhSy..',
    '....kKSShs...',
  ];
  // the brim pulled down over the eyes, the head dropped
  const HEAD_D = [
    'b............',
    '.bB..........',
    '..bb.........',
    '...bf........',
    '..fffFF......',
    '.ffffFFFf....',
    'ffffffffFFFf.',
    '..ffffffff...',
    '..kkhhhShs...',
    '..kKhShhhms..',
    '...kKSShhSy..',
    '....kKSShs...',
  ];
  const TORSO = [
    '...aAaAa...',
    '..aAAAAAD..',
    '.aAAlLlAAD.',
    '.aAAlLlAAD.',
    'aAAAlLlAAD.',
    'aAArRrrAAD.',
    '.DAArRrADD.',
    '.DAuUuuAD..',
    '..DAAAAD...',
    '..DAAAAD...',
  ];
  const BOOTS = {
    stand: ['.....UUuu......',
      '....UU..uu.....',
      '....Uv...uu....',
      '...vv....uu....',
      '...vv....uu....',
      '..vv.....uu....',
      '..vv.....uuU...',
      '.vvvv...uuuuU..'],
    walkA: ['.....UUuu......',
      '...UU....uu....',
      '...Uv.....uu...',
      '..vv......uu...',
      '..vv......uu...',
      '.vv.......uu...',
      '.vv.......uuU..',
      'vvvv.....uuuuU.'],
    walkB: ['.....UUuu......',
      '.....UUuu......',
      '....Uv.uu......',
      '...vv..uu......',
      '...vv..uu......',
      '..vv...uuU.....',
      '..vv...uuuU....',
      '.vvvv..........'],
    tell: ['.....UUuu......',
      '...UUU..uu.....',
      '..vv.....uu....',
      '..vv.....uu....',
      '.vv......uu....',
      '.vv......uu....',
      'vv.......uuU...',
      'vvv.....uuuuU..'],
    lunge: ['.....UUuu......',
      '....UU.....uu..',
      '...vv.......uu.',
      '..vv........uu.',
      '..vv........uu.',
      '.vv.........uu.',
      '.vv.........uuU',
      'vvv........uuuu'],
    leap: ['.....UUuu......',
      '....UU..uuu....',
      '...Uv..uuuuU...',
      '..vv...uUUu....',
      '..vv...........',
      '.vv............',
      '.vvU...........',
      'vvvU...........'],
    plant: ['.....UUuu......',
      '...UUU..uu.....',
      '..Uv.....uu....',
      '..vv.....uu....',
      '.vv......uu....',
      '.vv......uu....',
      'vv.......uuU...',
      'vvv.....uuuuU..'],
    kneel: ['...............',
      '.....UUuu......',
      '....UU..uu.....',
      '...Uv...uu.....',
      '..vv....uu.....',
      '..vv....uu.....',
      '.vvvvv..uu.....',
      'vvvvvvv.uuuU...'],
  };
  // the long coat: a skirt of faded cloth hanging off the waist, its tails thrown by the step. The outline is given in
  // fractions of the skirt's own height so that a crouched or kneeling frame folds it instead of turning it inside out.
  const coat = (G, B, dy, pose) => {
    const top = 20 + dy, HH = Math.max(3, FL - top), Y = f => top + Math.round(f * HH);
    const pts = {
      stand: [[-6, 0], [5, 0], [5, 0.72], [3, 1], [-6, 1], [-8, 0.66]],
      swing: [[-6, 0], [5, 0], [4, 0.66], [2, 0.92], [-9, 1], [-12, 0.6], [-7, 0.25]],
      stream: [[-6, 0], [5, 0], [5, 0.55], [3, 0.78], [-11, 0.92], [-15, 0.5], [-7, 0.18]],
      spread: [[-7, 0], [5, 0], [6, 0.4], [2, 0.62], [-9, 0.8], [-16, 0.42], [-11, 0.1]],
      pooled: [[-6, 0], [5, 0], [6, 1], [-11, 1], [-13, 0.5], [-8, 0.2]],
    }[pose];
    gpoly(G, pts.map(([x, f]) => [B + x, Y(f)]), (x, y) => {
      const f = ((Math.floor((x - B) * 0.8 + (y - top) * 0.4) % 4) + 4) % 4;
      return y > FL - 2 ? 'D' : f === 0 ? 'D' : f === 1 ? 'A' : f === 2 ? 'A' : 'a';
    });
  };
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 3.0, far ? ['D', 'D', 'A'] : ['D', 'A', 'a']);
    limb(g, el, hd, 2.6, far ? ['D', 'A', 'A'] : ['A', 'a', 'a']);
    limb(g, hd, hd, 2.4, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
  });
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 6;
    const P = v => [B + v[0], v[1] + dy];
    if (o.blade && o.blade[3] === 'back') layer(G, g => cutlass(g, P(o.blade[0]), o.blade[1], o.blade[2], 0.95));
    if (o.gun && o.gun[3] === 'back') layer(G, g => pistol(g, P(o.gun[0]), o.gun[1], o.gun[2]));
    coat(G, B, dy, o.coat);
    arm(G, P([-4, 16]), P(o.far[0]), P(o.far[1]), true);
    stamp(G, B - 7, 22, BOOTS[o.boots]);
    stamp(G, O + 1, 12 + dy, TORSO);
    layer(G, g => stamp(g, O + (o.hx || 0), 2 + dy, o.down ? HEAD_D : HEAD));
    if (o.blade && o.blade[3] !== 'back') layer(G, g => cutlass(g, P(o.blade[0]), o.blade[1], o.blade[2], 0.95));
    arm(G, P([3, 16]), P(o.near[0]), P(o.near[1]), false);
    if (o.gun && o.gun[3] !== 'back') layer(G, g => pistol(g, P(o.gun[0]), o.gun[1], o.gun[2]));
    if (o.rope) layer(G, g => { for (let k = 0; k < 4; k += 2) for (let e = 0; e < 2; e++) gline(g, P(o.rope[k])[0], P(o.rope[k])[1] + e, P(o.rope[k + 1])[0], P(o.rope[k + 1])[1] + e, (i) => ((i + e) % 3 ? 'P' : 'p')); });
    if (o.flash) {
      const F = P(o.flash);
      layer(G, g => { stamp(g, F[0], F[1], ['..X..', '.XxX.', 'XxxxX', '.XxX.', '..X..']); stamp(g, F[0] + 5, F[1], ['.zZz.', 'zZZzZ', '.zZz.']); });
    }
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  const idle = frame({ boots: 'stand', coat: 'stand',
    far: [[-4, 19], [-2, 18]], near: [[4, 19], [5, 21]],
    blade: [[5, 21], 58, 11], gun: [[-2, 18], -32, 8] });
  const walk1 = frame({ boots: 'walkA', coat: 'swing', dy: 1,
    far: [[-5, 19], [-3, 19]], near: [[5, 19], [6, 21]],
    blade: [[6, 21], 52, 11], gun: [[-3, 19], -36, 8] });
  const walk2 = frame({ boots: 'walkB', coat: 'stand',
    far: [[-4, 20], [-2, 20]], near: [[4, 20], [5, 22]],
    blade: [[5, 22], 48, 11], gun: [[-2, 20], -40, 8] });
  const slashTell = frame({ boots: 'tell', dx: -2, dy: 1, hx: -1, coat: 'swing',
    far: [[-2, 18], [1, 18]], near: [[-3, 14], [-6, 12]],
    blade: [[-6, 12], -160, 12, 'back'], gun: [[1, 18], -30, 8, 'back'] });
  const slash = frame({ boots: 'lunge', dx: 3, dy: 1, hx: 2, coat: 'stream',
    far: [[-2, 18], [-4, 20]], near: [[4, 16], [7, 16]],
    blade: [[7, 16], 4, 13], gun: [[-4, 20], 150, 8, 'back'],
    smear: [1 + X + 7, 1 + 16, 15, -98, 24] });
  const shootTell = frame({ boots: 'plant', coat: 'stand', dy: 1,
    far: [[1, 15], [4, 14]], near: [[-1, 19], [-3, 21]],
    gun: [[4, 14], -6, 9], blade: [[-3, 21], 146, 10, 'back'] });
  const shoot = frame({ boots: 'stand', dx: -1, dy: 1, hx: -1, coat: 'swing',
    far: [[1, 16], [4, 13]], near: [[-1, 20], [-3, 22]],
    gun: [[4, 13], -24, 9], blade: [[-3, 22], 150, 10, 'back'], flash: [11, 6] });
  const leap = frame({ boots: 'leap', dx: -1, dy: 2, hx: 1, coat: 'spread',
    far: [[-2, 14], [-4, 12]], near: [[2, 13], [3, 11]],
    blade: [[3, 11], -78, 11], gun: [[-4, 12], -130, 8, 'back'] });
  const cut = frame({ boots: 'tell', dx: 1, dy: 3, hx: 1, coat: 'stream', down: true,
    far: [[-2, 17], [0, 19]], near: [[4, 13], [5, 14]],
    blade: [[5, 14], 82, 11], gun: [[0, 19], 160, 8, 'back'],
    rope: [[-4, 25], [3, 25], [7, 24], [11, 20]] });
  const stagger = frame({ boots: 'stand', dx: -1, dy: 4, hx: 2, coat: 'swing', down: true,
    far: [[-3, 17], [-6, 16]], near: [[4, 18], [6, 21]],
    blade: [[6, 21], 62, 10], gun: [[-6, 16], -176, 8, 'back'] });
  const kneel = frame({ boots: 'kneel', dy: 5, hx: 2, coat: 'pooled', down: true,
    far: [[-3, 17], [-1, 19]], near: [[5, 17], [7, 16]],
    blade: [[7, 16], 80, 8], gun: [[-1, 19], 170, 8, 'back'] });
  return pack([idle, walk1, walk2, slashTell, slash, shootTell, shoot, leap, cut, stagger, kneel], X + 1, H + 1, 12, 22);
}
