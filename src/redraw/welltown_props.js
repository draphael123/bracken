// src/redraw/welltown_props.js - THE WELL TOWN's WATER MACHINES, drawn (claude/welltown3, art pass: claude/welltown3-art). src/well-town-hands.js drawWorld owns WHERE and WHEN;
// this file owns HOW each thing looks. Every function draws in SCREEN pixels at (x, y) = the thing's foot (the floor line under it), and is
// pure drawing (no game state is changed; the only clock is the `time` passed in, or performance.now for the bucket, whose signature has none).
//   drawWell(g, x, y, s, time)      s = { deep, up, wind (0..1 of the wind-up), jar, left, glint (0..1: it can fill your skin now), cistern }
//   drawMudWall(g, x, y, w, h, s, time)   x, y = the wall's top-left; s = { open, wet (0..1: you carry water - show where it would take) }
//   drawFire(g, x, y, h, s, time)   x, y = the column's top-left; s = { lit, wet (0..1: you carry water - it smoulders and hisses toward you) }
//   drawWindlass(g, x, y, s, time)  s = { top, deep, struck (0..1 just after a blow) }
//   drawBucket(g, x, y, w, ropeTopY)   the great well's bucket (a lift) and its rope up to the windlass
//   drawCistern(g, x, y, s)         THE DRY CISTERN's basin: s = { full, got (water-skins in hand) }
//   drawVaultDoor(g, x, y, h)       its vault's door while it is shut
// THE ART RULES: the wells are the ONLY strong blue in town (everything else in the street is sand, mud, whitewash, cloth, palm wood); a mud wall is dark brick cracked where
// water would take it; fire is a barricade of charred palm timber and oiled cloth with real flame layers and a smoke column. THE GLINT: a well that can fill your skin draws its own
// sheen (a bright moving band on the water and twinkles at the rim); the hands' white star may stay or go, it does not clash.

const R = Math.round;
const fr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const pxl = (g, c, x, y) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const K = { white: '#f4ecd8', wash: '#e8dcc2', washD: '#c8b894', washDD: '#a89874', ston: '#d8c4a0', stonD: '#b09872', stonDD: '#8a7452',
  palm: '#7e6444', palmL: '#b09068', palmD: '#4e3a26', palmDD: '#2e2216', rope: '#dccb98', ropeD: '#a89868', iron: '#3a3e46', ironL: '#7a8088',
  mud: '#5e3c24', mudL: '#7a4e30', mudLL: '#946440', mudD: '#3a2416', mudM: '#26160c', mudHeap: '#7a5232',
  water: '#2c78c8', waterD: '#1c58a0', waterL: '#6cc0f0', waterLL: '#c4ecff', char: '#2a1c14', char2: '#3e281a', ember: '#d8481a' };

/* ---- A WELL: a whitewashed ring, a palm-wood beam on two posts with a pulley and a rope, the water in it the only strong blue in town ---- */
function jar(g, x, y, s) {
  const c = '#b8683a', cl = '#dc8e58', cd = '#7e4426';
  fr(g, cd, x - 3, y - 2, 6, 2); fr(g, c, x - 5, y - 4, 10, 2); fr(g, c, x - 6, y - 9, 12, 5); fr(g, cl, x - 6, y - 9, 2, 5); fr(g, cd, x + 4, y - 9, 2, 5); fr(g, c, x - 5, y - 11, 10, 2); fr(g, c, x - 3, y - 14, 6, 3); fr(g, cl, x - 3, y - 14, 1, 3);
  fr(g, K.palmD, x - 4, y - 15, 8, 1); fr(g, s.left > 0 ? K.water : K.mudD, x - 2, y - 14, 4, 1); if (s.left > 0) pxl(g, K.waterLL, x - 1, y - 14);
  fr(g, cd, x - 7, y - 11, 1, 3); fr(g, cd, x + 6, y - 11, 1, 3); fr(g, K.wash, x - 5, y - 7, 10, 1); fr(g, cd, x - 5, y - 6, 10, 1);   /* a painted band */
}
export function drawWell(g, x, y, s, time) {
  if (s.jar) { jar(g, x, y, s); return; }
  const cis = !!s.cistern, ring = cis ? '#8aa0b2' : K.wash, ringD = cis ? '#5a7084' : K.washD, ringDD = cis ? '#3e5266' : K.washDD, rim = cis ? '#c4d8e8' : K.white;
  /* the beam: two palm posts, a cross-beam, a pulley hung from it (only a hung rope and bucket when the well is DEEP) */
  fr(g, K.palmD, x - 11, y - 24, 3, 16); fr(g, K.palm, x - 10, y - 24, 2, 16); fr(g, K.palmL, x - 10, y - 24, 1, 16);
  fr(g, K.palmD, x + 8, y - 24, 3, 16); fr(g, K.palm, x + 8, y - 24, 2, 16); fr(g, K.palmL, x + 8, y - 24, 1, 16);
  fr(g, K.palmDD, x - 12, y - 26, 24, 3); fr(g, K.palm, x - 12, y - 26, 24, 2); fr(g, K.palmL, x - 12, y - 26, 24, 1); fr(g, K.rope, x - 11, y - 25, 1, 2); fr(g, K.rope, x + 10, y - 25, 1, 2);
  const px0 = x - 1;
  fr(g, K.iron, px0 - 2, y - 23, 5, 5); fr(g, K.ironL, px0 - 1, y - 22, 3, 3); pxl(g, K.iron, px0, y - 21); fr(g, K.ironL, px0, y - 24, 1, 1);          /* the pulley */
  if (s.deep) { const k = s.up ? 1 : s.wind || 0, by = y - 8 - 7 * k; fr(g, K.rope, px0 + 2, y - 21, 1, by - (y - 21)); if (k > 0) bucketSmall(g, x - 3, by);
    else fr(g, K.rope, px0 + 2, y - 21, 1, 14); }
  else { fr(g, K.rope, px0 - 2, y - 21, 1, 9); fr(g, K.palmD, px0 - 4, y - 13, 5, 4); fr(g, K.palm, px0 - 3, y - 13, 3, 1); fr(g, K.iron, px0 - 4, y - 12, 5, 1); }       /* a bucket hung at rest */
  /* the ring: whitewashed stone, courses, a lit rim, the water's blue inside it */
  fr(g, ringDD, x - 11, y - 10, 22, 10); fr(g, ring, x - 10, y - 10, 20, 9); fr(g, ringD, x + 5, y - 10, 5, 9);
  fr(g, ringDD, x - 10, y - 5, 20, 1); for (const jx of [x - 4, x + 3, x - 8]) fr(g, ringDD, jx, y - 9, 1, 4); for (const jx of [x - 1, x + 6, x - 6]) fr(g, ringDD, jx, y - 4, 1, 4);
  fr(g, rim, x - 11, y - 11, 22, 2); fr(g, ringD, x - 11, y - 9, 22, 1);
  fr(g, cis ? '#16222e' : K.washDD, x - 8, y - 10, 16, 1);
  const glint = s.glint > 0, sh = (Math.floor(time * 2) % 3);
  fr(g, K.waterD, x - 8, y - 9, 16, 3); fr(g, K.water, x - 8, y - 9, 16, 2); fr(g, K.waterL, x - 8 + sh, y - 9, 4, 1); fr(g, K.waterL, x + 1 - sh, y - 8, 3, 1);
  if (glint) { const a = (time * 0.9) % 1, bx = x - 8 + a * 14; fr(g, K.waterL, x - 8, y - 9, 16, 1); fr(g, K.waterLL, bx, y - 9, 4, 1); fr(g, K.waterLL, bx + 1, y - 8, 2, 1);
    for (let i = 0; i < 3; i++) { const tw = Math.sin(time * 7 + i * 2.3); if (tw > 0.2) pxl(g, K.waterLL, x - 9 + i * 8 + (i === 1 ? 1 : 0), y - 12 - i % 2); } }
}
function bucketSmall(g, x, y) { fr(g, K.palmD, x, y, 7, 5); fr(g, K.palm, x + 1, y, 5, 1); fr(g, K.palmL, x + 1, y + 1, 1, 3); fr(g, K.iron, x, y + 1, 7, 1); fr(g, K.iron, x, y + 4, 7, 1); pxl(g, K.waterL, x + 3, y); }

/* ---- A MUD WALL: a bricked doorway of dark mud brick in a pale plaster frame, cracks that read as 'water would take this'. opened: a slumped heap ---- */
const CRACKS = [[[0.5, 0.0], [0.42, 0.14], [0.52, 0.28], [0.4, 0.44], [0.5, 0.58], [0.38, 0.72], [0.46, 0.86], [0.4, 1]], [[0, 0.52], [0.18, 0.46], [0.34, 0.55], [0.52, 0.5], [0.7, 0.58], [0.86, 0.52], [1, 0.6]], [[0.72, 0.0], [0.78, 0.18], [0.68, 0.34], [0.76, 0.5]]];
export function drawMudWall(g, x, y, w, h, s, time) {
  if (s.open) { const hh = Math.min(14, Math.max(8, h / 4)); fr(g, K.mudM, x - 3, y + h - 2, w + 6, 2); fr(g, K.mud, x - 2, y + h - 4, w + 4, 4); fr(g, K.mudHeap, x, y + h - hh + 3, w, hh - 3); fr(g, K.mudL, x + 2, y + h - hh + 1, w - 4, 4); fr(g, K.mudLL, x + 4, y + h - hh, w - 8, 2);
    fr(g, K.mudD, x + w - 4, y + h - 6, 3, 3); fr(g, K.mudLL, x + 1, y + h - 5, 3, 2); fr(g, K.mudD, x + 5, y + h - 4, 4, 2); fr(g, K.mudL, x + w / 2, y + h - hh - 1, 4, 2);
    for (let i = 0; i < 3; i++) pxl(g, K.waterL, x + 3 + i * 5, y + h - 3 - (i % 2)); return; }
  const wet = s.wet > 0, base = wet ? '#46281a' : K.mud, mort = wet ? '#1a0e08' : K.mudM;
  fr(g, K.washDD, x - 2, y, w + 4, h); fr(g, K.wash, x - 2, y, 2, h); fr(g, K.wash, x + w, y, 2, h); fr(g, K.washD, x - 1, y, 1, h); fr(g, K.washD, x + w, y, 1, h);   /* the whitewashed frame */
  fr(g, mort, x, y + 2, w, h - 2); fr(g, K.wash, x - 2, y, w + 4, 2); fr(g, K.washD, x - 2, y + 2, w + 4, 1);
  for (let row = 0; row * 5 + 3 < h; row++) { const off = (row & 1) ? 4 : 0, ry = y + 3 + row * 5;
    for (let bx = -8; bx < w; bx += 8) { const x0 = bx + off, t = (row * 7 + (x0 + 16)) % 5, c = t === 0 ? K.mudL : t === 3 ? K.mudD : base; const ax = Math.max(0, x0 + 1), bw = Math.min(w, x0 + 8) - ax; if (bw > 0) { fr(g, c, x + ax, ry, bw, 4); fr(g, wet ? '#5a3624' : K.mudLL, x + ax, ry, bw, 1); } } }
  /* the cracks: dark, jagged, lit along one edge; where water would take it */
  const crack = wet ? '#050201' : '#1c0e06';
  for (const path of CRACKS) for (let i = 0; i < path.length - 1; i++) { const [ax, ay] = path[i], [bx, by] = path[i + 1], x0 = x + ax * (w - 1), y0 = y + 3 + ay * (h - 5), x1 = x + bx * (w - 1), y1 = y + 3 + by * (h - 5), n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0;
    for (let k = 0; k <= n; k++) { const px0 = x0 + (x1 - x0) * k / (n || 1), py0 = y0 + (y1 - y0) * k / (n || 1); pxl(g, crack, px0, py0); if (!wet) pxl(g, '#a8744a', px0 + 1, py0); else if (((k + i) & 3) === 0) pxl(g, '#4a90c8', px0 + 1, py0); } }
  /* the tide of salt where damp has been, along the foot */
  for (let i = 0; i < w; i += 3) pxl(g, wet ? '#8a7a68' : K.washD, x + i + (i % 2), y + h - 2 - (i % 2));
  fr(g, K.mudM, x, y + h - 1, w, 1);
  if (wet) { for (let i = 0; i < 3; i++) { const ph = (time * 0.9 + i * 0.37) % 1, dx = x + w * (0.3 + 0.2 * i), dy = y + 6 + ph * (h - 10); pxl(g, '#8ac8f0', dx, dy); pxl(g, '#4a90c8', dx, dy + 1); }
    for (let i = 0; i < 4; i++) { const ph = (time * 0.6 + i * 0.27) % 1; g.globalAlpha = 0.6 * (1 - ph); pxl(g, '#c8a070', x + ((i * 7 + 3) % Math.max(1, w - 2)) + Math.sin(time * 3 + i) * 2, y + h - 3 - ph * 14); g.globalAlpha = 1; } }
}

/* ---- A FIRE: a barricade of charred palm timber lashed with oiled cloth, flame in layers and a smoke column; wet: it hisses steam; out: charred wood and a thread of smoke ---- */
function timbers(g, x, y, h, lit, time) {
  for (const [dx, w] of [[1, 4], [6, 4], [11, 4]]) { fr(g, K.char, x + dx, y, w, h); fr(g, K.char2, x + dx, y, 1, h); fr(g, '#14100c', x + dx + w - 1, y, 1, h);
    for (let k = 3; k < h; k += 9) fr(g, '#14100c', x + dx, y + k, w, 1); }
  for (let k = 5; k < h - 3; k += 14) { fr(g, '#8a6a50', x, y + k, 16, 2); fr(g, '#5a4230', x, y + k + 2, 16, 1); fr(g, '#a88868', x + 2, y + k, 3, 1); for (let i = 0; i < 4; i++) fr(g, '#2a1c14', x + i * 5 + (k % 3), y + k + 2, 2, 2); }
  fr(g, '#6a3a20', x + 12, y + h - 5, 3, 5); fr(g, '#b8683a', x + 12, y + h - 5, 1, 5); fr(g, K.char, x - 1, y + h - 2, 18, 2);   /* an oil jar at its foot */
  if (lit) for (let k = 4; k < h; k += 11) { const f = 0.5 + 0.5 * Math.sin(time * 9 + k); g.globalAlpha = 0.5 + 0.4 * f; fr(g, K.ember, x + ((k * 3) % 11) + 1, y + k, 2, 1); fr(g, '#ffb040', x + ((k * 5) % 9) + 2, y + k + 3, 1, 1); g.globalAlpha = 1; }
}
function tongue(g, cx, base, w, h, t, ph) {
  const sw = Math.sin(t * 8 + ph) * 1.6, jit = 0.86 + 0.14 * Math.sin(t * 13 + ph * 2.1);
  for (const [col, kw, kh] of [['#c42a14', 1, 1], ['#ff7a22', 0.78, 0.82], ['#ffc23a', 0.54, 0.6], ['#fff0a8', 0.26, 0.34]]) { const hh = Math.max(2, R(h * kh * jit)), ww = Math.max(1, w * kw);
    for (let r = 0; r < hh; r++) { const f = r / hh, half = Math.max(0.6, ww * 0.5 * (1 - f * f * 0.92)); fr(g, col, cx - half + sw * f * f, base - 1 - r, half * 2, 1); } }
}
function smoke(g, x, y, time, k, n) {
  for (let i = 0; i < n; i++) { const a = (time * 0.42 + i / n) % 1, r = 2 + a * 6 * k, px0 = x + Math.sin(time * 1.3 + i * 2.1) * 3 + a * 8, py0 = y - a * 44 * k; g.globalAlpha = 0.5 * (1 - a) * (a < 0.1 ? a * 10 : 1); fr(g, a < 0.4 ? '#4a4048' : '#7a747a', px0 - r, py0 - r, r * 2, r * 1.6); g.globalAlpha = 1; }
}
export function drawFire(g, x, y, h, s, time) {
  if (!s.lit) { timbers(g, x, y, h, false, time);
    for (let k = 0; k < 14; k++) { const a = (time * 0.35 + k / 14) % 1, wx = x + 8 + Math.sin(a * 9 + time) * 2 + a * 3; g.globalAlpha = 0.55 * (1 - a); pxl(g, '#8a8490', wx, y - 2 - a * 34); g.globalAlpha = 1; }
    pxl(g, K.ember, x + 5, y + h - 6); pxl(g, '#ffb040', x + 9, y + h - 12); return; }
  const wet = s.wet > 0, hk = wet ? 0.8 : 1;
  { const gl = g.createRadialGradient(x + 8, y + h * 0.4, 2, x + 8, y + h * 0.4, 38 + h * 0.2); gl.addColorStop(0, 'rgba(255,150,50,0.34)'); gl.addColorStop(1, 'rgba(255,100,30,0)'); g.fillStyle = gl; g.fillRect(x - 32, y - 20, 80, h + 60); }
  timbers(g, x, y, h, true, time);
  for (let k = h - 2, i = 0; k > -8; k -= 9, i++) { tongue(g, x + 8 + Math.sin(i * 2.3) * 3, y + k + 8, 10 + (i % 2) * 3, (12 + (i % 3) * 3) * hk, time, i * 1.3); }
  tongue(g, x + 8, y + 6, 12, 22 * hk, time, 0.4);
  smoke(g, x + 8, y - 8, time, 1, 7);
  for (let i = 0; i < 5; i++) { const a = (time * 0.9 + i * 0.21) % 1; g.globalAlpha = 1 - a; pxl(g, i % 2 ? '#ffd36b' : '#ff8a3a', x + 3 + ((i * 7) % 11) + Math.sin(time * 4 + i) * 2, y - 4 - a * 26); g.globalAlpha = 1; }
  if (wet) for (const sx of [x - 3, x + 18]) for (let i = 0; i < 4; i++) { const a = (time * 0.8 + i * 0.25 + (sx > x ? 0.4 : 0)) % 1; g.globalAlpha = 0.7 * (1 - a); fr(g, '#f0f4f8', sx + Math.sin(time * 5 + i) * 1.5, y + h - 8 - a * 26, 3 + a * 2, 3); g.globalAlpha = 1; }
}

/* ---- A WINDLASS: a palm-wood frame on two posts, a rope drum, a crank that spins when struck (s.struck 0..1) ---- */
export function drawWindlass(g, x, y, s, time) {
  fr(g, K.palmD, x - 9, y - 22, 4, 22); fr(g, K.palm, x - 8, y - 22, 2, 22); fr(g, K.palmL, x - 8, y - 22, 1, 22);
  fr(g, K.palmD, x + 6, y - 22, 4, 22); fr(g, K.palm, x + 7, y - 22, 2, 22); fr(g, K.palmL, x + 7, y - 22, 1, 22);
  fr(g, K.palmD, x - 10, y - 2, 21, 2); fr(g, K.palmDD, x - 8, y - 9, 3, 2); fr(g, K.palmDD, x + 6, y - 9, 3, 2);   /* the sill and the braces */
  fr(g, K.iron, x - 9, y - 16, 2, 4); fr(g, K.iron, x + 7, y - 16, 2, 4);                                       /* bearings */
  fr(g, K.palmDD, x - 6, y - 19, 13, 8); fr(g, K.palm, x - 6, y - 19, 13, 7); fr(g, K.palmL, x - 6, y - 19, 13, 1);                                                 /* the drum */
  for (let i = -5; i < 7; i += 2) { fr(g, K.rope, x + i, y - 18, 1, 6); fr(g, K.ropeD, x + i + 1, y - 18, 1, 6); }                                                /* the rope, coiled */
  fr(g, K.rope, x - 6, y - 18, 1, 14); fr(g, K.ropeD, x - 5, y - 12, 1, 8);                                                                               /* and the fall of it */
  const a = (s.struck || 0) * Math.PI * 4 + 0.7, ax = x + 10, ay = y - 15, hx = ax + Math.cos(a) * 7, hy = ay + Math.sin(a) * 7;
  fr(g, K.iron, ax - 1, ay - 1, 3, 3); const n = 8; for (let i = 0; i <= n; i++) pxl(g, K.ironL, ax + (hx - ax) * i / n, ay + (hy - ay) * i / n);
  fr(g, K.palmD, hx - 1, hy - 1, 3, 3); pxl(g, K.palmL, hx, hy - 1);
  if (s.struck > 0.05) for (let i = 0; i < 3; i++) { g.globalAlpha = s.struck; pxl(g, '#fff0c0', ax + Math.cos(a + 2.2 + i) * 9, ay + Math.sin(a + 2.2 + i) * 9); g.globalAlpha = 1; }
}

/* ---- THE GREAT WELL's BUCKET: a wooden tub on a bridle, water slopping over the rim, its rope up to the windlass ---- */
export function drawBucket(g, x, y, w, ropeTopY) {
  const t = (typeof performance !== 'undefined' ? performance.now() : 0) / 1000, mx = x + w / 2;
  if (ropeTopY != null) { const ry = Math.max(ropeTopY, y - 10); for (let k = ropeTopY; k < y - 9; k++) pxl(g, k % 3 ? K.rope : K.ropeD, mx - 1, k); }
  for (let i = 0; i < 12; i++) { const f = i / 12; pxl(g, K.rope, x + 2 + (mx - x - 2) * f, y - 1 - 9 * f * 0.9); pxl(g, K.rope, x + w - 3 - (x + w - 3 - mx) * f, y - 1 - 9 * f * 0.9); }  /* the bridle */
  fr(g, K.iron, mx - 2, y - 11, 4, 3); fr(g, K.ironL, mx - 1, y - 10, 2, 1);
  fr(g, K.palmDD, x, y, w, 8); fr(g, K.palm, x + 1, y + 2, w - 2, 5);                                                     /* the tub: staves and hoops */
  for (let i = 4; i < w - 2; i += 5) fr(g, K.palmD, x + i, y + 2, 1, 5); fr(g, K.palmL, x + 2, y + 3, 1, 3);
  fr(g, K.iron, x, y + 2, w, 1); fr(g, K.iron, x, y + 6, w, 1); fr(g, K.ironL, x + 1, y + 2, w - 2, 0.5);
  fr(g, K.palmL, x, y, 3, 2); fr(g, K.palmL, x + w - 3, y, 3, 2);                                                         /* the rim, at both ends */
  fr(g, K.waterD, x + 3, y, w - 6, 2); fr(g, K.water, x + 3, y, w - 6, 1); const sl = Math.sin(t * 5) * 2;
  fr(g, K.waterL, x + 5 + sl + 2, y, 5, 1); fr(g, K.waterL, x + w - 12 - sl, y, 4, 1);
  for (let i = 0; i < 3; i++) { const a = (t * 1.1 + i / 3) % 1; g.globalAlpha = 1 - a; pxl(g, K.waterL, x + 5 + i * (w - 10) / 3, y + 4 + a * 12); g.globalAlpha = 1; }   /* drips off the tub */
}

/* ---- THE DRY CISTERN: a carved sandstone basin; dry it is a bed of cracked mud, each skin poured in a drop over it; full it is deep blue ---- */
export function drawCistern(g, x, y, s) {
  const t = (typeof performance !== 'undefined' ? performance.now() : 0) / 1000;
  fr(g, K.stonDD, x - 15, y - 11, 30, 11); fr(g, K.ston, x - 14, y - 11, 28, 10); fr(g, K.stonD, x + 8, y - 11, 6, 10); fr(g, '#f4e8cc', x - 15, y - 12, 30, 2);
  fr(g, K.stonDD, x - 14, y - 5, 28, 1); for (const jx of [x - 9, x - 2, x + 6]) fr(g, K.stonDD, jx, y - 10, 1, 5); for (const jx of [x - 12, x - 5, x + 3]) fr(g, K.stonDD, jx, y - 4, 1, 4);
  fr(g, K.stonDD, x - 12, y - 10, 24, 5);
  if (s.full) { fr(g, K.waterD, x - 12, y - 10, 24, 5); fr(g, K.water, x - 12, y - 10, 24, 3); fr(g, K.waterL, x - 12 + (R(t * 4) % 6), y - 10, 6, 1); fr(g, K.waterL, x + 2 - (R(t * 3) % 5), y - 9, 5, 1); fr(g, K.waterLL, x - 6 + R(Math.sin(t * 3) * 4), y - 10, 2, 1); }
  else { fr(g, '#6a5236', x - 12, y - 10, 24, 5); fr(g, '#8a6c48', x - 12, y - 10, 24, 1);
    for (let i = 0; i < 5; i++) { fr(g, '#3a2a1a', x - 11 + i * 5, y - 9 + (i % 2), 3, 1); fr(g, '#3a2a1a', x - 9 + i * 5, y - 8 + (i % 2), 1, 2); } fr(g, K.washD, x - 3, y - 7, 6, 1);
    for (let i = 0; i < (s.got || 0); i++) { const bx = x - 10 + i * 6, by = y - 18 - Math.sin(t * 3 + i) * 1; fr(g, K.water, bx + 1, by + 1, 2, 3); fr(g, K.water, bx, by + 3, 4, 2); pxl(g, K.waterLL, bx + 1, by + 3); pxl(g, K.waterL, bx + 1, by + 2); } }
}

/* ---- THE VAULT's door: iron-strapped palm planks in a dressed stone frame, a brass lock-plate, a carved drop over it saying what opens it ---- */
export function drawVaultDoor(g, x, y, h) {
  fr(g, K.stonDD, x - 2, y - 3, 20, h + 3); fr(g, K.ston, x - 2, y - 3, 20, 3); fr(g, '#f4e8cc', x - 2, y - 3, 20, 1); fr(g, K.ston, x - 2, y, 2, h); fr(g, K.stonD, x + 16, y, 2, h);
  fr(g, K.palmDD, x, y, 16, h); for (let px0 = 0; px0 < 16; px0 += 4) { fr(g, K.palmD, x + px0, y, 3, h); fr(g, K.palm, x + px0, y, 1, h); }
  for (const k of [0.2, 0.8]) { const sy = y + h * k - 2; fr(g, K.iron, x, sy, 16, 4); fr(g, K.ironL, x, sy, 16, 1); for (let i = 2; i < 16; i += 5) pxl(g, '#aab0b8', x + i, sy + 2); }
  fr(g, '#8a5e18', x + 4, y + h / 2 - 5, 8, 9); fr(g, '#c9962a', x + 5, y + h / 2 - 4, 6, 7); fr(g, '#f0c860', x + 5, y + h / 2 - 4, 6, 1); pxl(g, '#2a1a08', x + 8, y + h / 2 - 1); fr(g, '#2a1a08', x + 8, y + h / 2, 1, 2);
  fr(g, K.water, x + 7, y + 4, 2, 3); fr(g, K.water, x + 6, y + 6, 4, 2); pxl(g, K.waterLL, x + 7, y + 6);
}

/* ---- A SHADE CASTER (claude/welltown5, Daniel 10-03: "there should be shade overhanging areas that give you shade"): the thing overhead that casts a
   tinted shade under it. x0..x1, y = its top (screen px), floor = the floor line under it (screen px). kind 'cloth': market cloths strung on a rope
   across the span (striped panels, each sagging, scalloped hems, guy ropes at the ends - tied to the walls or to palm posts when s.posts); kind 'roof':
   a well-house roof of palm beams and reed matting on two posts. The tinted shade under it is main.js's (L.shadeArt); this draws only the caster ---- */
const CLOTH = ['#e8dcc2', '#b8463a', '#d8a24a', '#e8dcc2', '#9a5a3a'];
export function drawCaster(g, x0, x1, y, floor, s, time) {
  const w = x1 - x0;
  /* its shadow on the floor under it: a violet band where the shade meets the ground (the tint above it is main.js's) */
  g.fillStyle = 'rgba(78,46,90,0.34)'; g.fillRect(x0, floor - 2, w, 2); g.fillStyle = 'rgba(78,46,90,0.22)'; g.fillRect(x0, floor, w, 5);
  if (s.kind === 'roof') {
    for (const px0 of [x0 + 3, x1 - 6]) { fr(g, K.palmD, px0, y + 6, 3, floor - y - 6); fr(g, K.palmL, px0, y + 6, 1, floor - y - 6); }
    fr(g, K.palmDD, x0 - 2, y + 6, w + 4, 3); fr(g, K.palm, x0 - 2, y + 6, w + 4, 2);
    for (let i = 0; i < w + 8; i += 2) { const k = Math.abs(i - (w + 8) / 2) / ((w + 8) / 2); fr(g, i % 4 ? '#c8a868' : '#a8884c', x0 - 4 + i, y + R(4 * k), 2, 6 - R(4 * k)); }
    fr(g, '#7a5e30', x0 - 4, y + 5, w + 8, 1);
    return;
  }
  const n = Math.max(1, Math.round(w / 72)), pw = w / n, sway = Math.sin(time * 1.3) * 0.6;
  fr(g, K.ropeD, x0, y + 1, w, 1);                                                                                     /* the rope it hangs from */
  for (let p = 0; p < n; p++) { const a = x0 + p * pw, col = CLOTH[(p + (s.v || 0)) % CLOTH.length];
    for (let x = 0; x < pw; x++) { const sag = R((5 + sway) * Math.sin(x / pw * Math.PI)), y0 = y + 2 + sag, c = ((x >> 2) & 1) ? col : tintC(col);
      fr(g, c, a + x, y0 - sag * 0.5, 1, 7 + sag * 0.5); fr(g, '#00000030', a + x, y0 + 6, 1, 1);
      if ((x % 4 === 1 || x % 4 === 2)) fr(g, c, a + x, y0 + 7, 1, 1); }                                                 /* scallops */
    fr(g, K.ropeD, a, y, 2, 3); }                                                                                       /* a knot at each panel */
  for (const [px0, d] of [[x0, -1], [x1 - 1, 1]]) {
    if (s.posts) { fr(g, K.palmD, px0 - (d > 0 ? 2 : 0), y, 3, floor - y); fr(g, K.palmL, px0 - (d > 0 ? 2 : 0), y, 1, floor - y); }
    else for (let i = 0; i < 6; i++) pxl(g, K.ropeD, px0 + d * i * 0.5, y - i);                                         /* tied off at the wall */
  }
}
const tintC = c => { const n = parseInt(c.slice(1), 16), f = 0.82; return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * f).toString(16).padStart(2, '0')).join(''); };
