// kraken.js — THE DROWNED CAUSEWAY: THE KRAKEN, its arms, the feeler that lives in the flats, the drowned fields behind
// them, the thing that moves out on the horizon, and the stones of the road. A new baker, not a redraw.
// Everything is rasterised into a colour buffer (one string a pixel), lit from the upper left with a 2x2 dither between
// steps of a ramp, then given the OUT outline - so a creature this size still reads as a SHAPE first: a dome, an eye, a beak.
//   bakeKrakenHead()   frames face RIGHT (L is the flip), canvas 124x100, anchor ax 58 ay 96 (the water line under the head)
//                      0 rest, 1 blink, 2 ROAR (beak wide), 3 LUNGE (beak thrust, eye narrowed), 4 STUCK (beak in stone, eye
//                      wide and dazed), 5 hurt (eye clenched), 6 KNELLED (flat, eye rolled), 7 INK (the siphon swollen),
//                      8 EMERGE (only the dome and the eye over the water), 9 dead (eye glazed)
//   bakeKrakenArms()   { seg: [r] -> {c, w}, tip, stump }  one lit disc a radius, a sucker on its underside; the arm is laid down
//                      as a chain of these along a curve in src/main.js, so an arm can be any length and any shape
//   bakeKraken()       the bestiary / body pack (small), frames 0 idle, 1 sway, 2 roar, 3 hurt (LAST)
//   bakeFeeler()       36x46 anchor ax 18 ay 45: 0 hide, 1 rise, 2 sway, 3 sway, 4 lash tell, 5 lash, 6 stuck, 7 hurt (LAST)
import { canvas, px, rect, flipX, whiten, outline, mulberry } from '../px.js';
import { OUT } from '../art.js';

const KP = { d0: '#170b16', d1: '#2a1224', m0: '#421c36', m1: '#5e2a44', l0: '#7c3c50', l1: '#9c5a60', hi: '#bf8272', mottle: '#caa08a',
  suck: '#e6c2a6', suckD: '#a86e66', suckC: '#5a2e36', barn: '#d8d2bc', barnD: '#8a8472', scar: '#c99a86',
  eyeW: '#efe29a', eyeY: '#e8b83a', iris: '#d8781c', irisD: '#8a3a10', pupil: '#120810', glint: '#ffffff', glaze: '#9aa0a0',
  beak: '#2a2226', beakM: '#4a3e40', beakL: '#7a6a64', mouth: '#5a1422', tongue: '#9a3a4a', ink: '#161018' };
const RAMP = [KP.d0, KP.d1, KP.m0, KP.m1, KP.l0, KP.l1, KP.hi];

// ---------- a colour buffer ----------
function buf(w, h) { const a = new Array(w * h).fill(null); return { w, h, a,
  set(x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) a[y * w + x] = c; },
  get(x, y) { x |= 0; y |= 0; return x >= 0 && y >= 0 && x < w && y < h ? a[y * w + x] : null; } }; }
function toCanvas(B, out = true) { const [c, g] = canvas(B.w, B.h);
  for (let y = 0; y < B.h; y++) for (let x = 0; x < B.w; x++) { const k = B.a[y * B.w + x]; if (k) px(g, x, y, k); }
  return out ? outline(c, OUT) : c; }
const D2 = [[0, 0.5], [0.75, 0.25]];
// light 0..1 to a ramp colour, dithered between two steps
const lit = (x, y, k, ramp = RAMP) => { const f = Math.max(0, Math.min(0.999, k)) * (ramp.length - 1), i = Math.floor(f), fr = f - i;
  return ramp[fr > D2[y & 1][x & 1] ? Math.min(ramp.length - 1, i + 1) : i]; };
const hsh = (x, y, s = 0) => { let t = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) >>> 0; t = Math.imul(t ^ (t >>> 13), 1274126177); return ((t ^ (t >>> 16)) >>> 0) / 4294967296; };
const LX = -0.55, LY = -0.62, LZ = 0.56;

// a lit ellipsoid; fn(x, y, u, v) may repaint a pixel (ridges, barnacles)
function blob(B, cx, cy, rx, ry, o = {}) {
  const tilt = o.tilt || 0, ct = Math.cos(tilt), st = Math.sin(tilt), pear = o.pear || 0, bias = o.bias || 0;
  const R = Math.max(rx, ry) * (1 + pear) + 2;
  for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, ux = dx * ct + dy * st, uy = -dx * st + dy * ct;
    const v = uy / ry, u = ux / (rx * (1 + pear * v));
    const q = u * u + v * v; if (q > 1) continue;
    const nz = Math.sqrt(1 - q), k = 0.4 + 0.6 * (u * LX + v * LY + nz * LZ) + bias - (q > 0.8 ? 0.22 : 0);   /* the turn of the form goes dark: that is what makes a dome a dome */
    let col = lit(x, y, k, o.ramp);
    if (o.fn) col = o.fn(x, y, u, v, k, col) || col;
    B.set(x, y, col);
  }
}
// a tube along points [[x, y, r], ...] of lit discs, suckers on the side the normal says
function tube(B, pts, o = {}) {
  for (let i = 0; i < pts.length; i++) { const [x, y, r] = pts[i], nx = pts[Math.min(pts.length - 1, i + 1)], pv = pts[Math.max(0, i - 1)];
    const tx = nx[0] - pv[0], ty = nx[1] - pv[1], tl = Math.hypot(tx, ty) || 1, sx = -ty / tl * (o.side || 1), sy = tx / tl * (o.side || 1);
    blob(B, x, y, r, r, { ramp: o.ramp, bias: o.bias });
    if (r >= 2.4 && i % 2 === 0 && o.suckers !== false) { const kx = x + sx * r * 0.62, ky = y + sy * r * 0.62, sr = Math.max(0.9, r * 0.34);
      for (let yy = Math.floor(ky - sr); yy <= Math.ceil(ky + sr); yy++) for (let xx = Math.floor(kx - sr); xx <= Math.ceil(kx + sr); xx++) {
        const d = Math.hypot(xx + 0.5 - kx, yy + 0.5 - ky); if (d > sr) continue; B.set(xx, yy, d < sr * 0.45 ? KP.suckC : d < sr * 0.8 ? KP.suck : KP.suckD); } }
  }
}
const bez = (p0, p1, p2, p3, n, r0, r1) => { const out = []; for (let i = 0; i <= n; i++) { const t = i / n, a = 1 - t;
  out.push([a * a * a * p0[0] + 3 * a * a * t * p1[0] + 3 * a * t * t * p2[0] + t * t * t * p3[0], a * a * a * p0[1] + 3 * a * a * t * p1[1] + 3 * a * t * t * p2[1] + t * t * t * p3[1], r0 + (r1 - r0) * t]); } return out; };
function pack(frames, ax, ay, w, h) { const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(flipX) }, ax, ay, w, h }; }

// the mantle skin: grooves running back over the dome, barnacle crusts on the crown, old white scars
const skin = (seed, scale = 1) => (x, y, u, v, k, col) => {
  if (Math.sin(u * 7 * scale + v * 3 + Math.sin(v * 5) * 0.8) > 0.9 && k > 0.25) return RAMP[Math.max(0, RAMP.indexOf(col) - 2)];
  const h = hsh(x, y, seed); if (k > 0.45 && hsh(Math.floor(x / 3), Math.floor(y / 3), seed + 5) < 0.09 && h < 0.7) return KP.mottle;   /* pale mottling in blotches, the way a squid's skin is */
  if (v < -0.2 && u < 0.2 && h < 0.035) return KP.barn; if (v < -0.1 && u < 0.3 && h < 0.06) return KP.barnD;
  if (Math.abs(u * 1.3 + v - 0.35) < 0.02 * (2 / scale) && v < 0.1 && v > -0.6) return KP.scar;
  return null; };

function eye(B, ex, ey, r, state) {
  // the socket: a rim of dark flesh lifted off the head
  blob(B, ex, ey, r + 3, r + 2, { bias: -0.12 });
  if (state === 'shut' || state === 'blink') { for (let x = -r; x <= r; x++) { const yy = Math.round(ey + Math.abs(x) * 0.18 * (state === 'shut' ? -1 : 1)); B.set(ex + x, yy, KP.d0); B.set(ex + x, yy + 1, KP.m1); }
    if (state === 'shut') for (const s of [-1, 1]) for (let q = 1; q < 4; q++) B.set(ex + s * (r + q), ey - q, KP.d0);   /* clenched */
    return; }
  const ry = state === 'narrow' ? r * 0.45 : state === 'wide' ? r * 1.05 : r * 0.82, rx = state === 'wide' ? r * 1.1 : r;
  for (let y = Math.floor(ey - ry); y <= Math.ceil(ey + ry); y++) for (let x = Math.floor(ex - rx); x <= Math.ceil(ex + rx); x++) {
    const u = (x + 0.5 - ex) / rx, v = (y + 0.5 - ey) / ry; if (u * u + v * v > 1) continue;
    B.set(x, y, state === 'glazed' ? (v < 0 ? '#c8c8b8' : KP.glaze) : v < -0.3 ? KP.eyeW : KP.eyeY); }
  if (state === 'glazed') { for (let x = -2; x <= 2; x++) B.set(ex + x, ey, '#6a6e6e'); return; }
  const ix = ex + (state === 'rolled' ? -1 : 1), iy = ey + (state === 'rolled' ? -Math.round(ry * 0.5) : 0), ir = state === 'wide' ? r * 0.38 : r * 0.58;
  for (let y = Math.floor(iy - ir); y <= Math.ceil(iy + ir); y++) for (let x = Math.floor(ix - ir); x <= Math.ceil(ix + ir); x++) {
    const d = Math.hypot(x + 0.5 - ix, y + 0.5 - iy); if (d > ir || Math.abs(y + 0.5 - ey) > ry) continue; B.set(x, y, d > ir * 0.7 ? KP.irisD : KP.iris); }
  // THE PUPIL IS A BAR. A goat's, a cuttlefish's: nothing about it is a person looking at you
  if (state === 'wide') { B.set(ix, iy, KP.pupil); B.set(ix + 1, iy, KP.pupil); }
  else if (state === 'rolled') { for (let x = -1; x <= 1; x++) B.set(ix + x, iy, KP.pupil); }
  else { const pw = Math.round(ir * 1.1); for (let x = -pw; x <= pw; x++) { B.set(ix + x, iy, KP.pupil); if (Math.abs(x) < pw - 1) B.set(ix + x, iy - 1, KP.pupil); } }
  B.set(ex - Math.round(rx * 0.45), ey - Math.round(ry * 0.5), KP.glint); B.set(ex - Math.round(rx * 0.45) + 1, ey - Math.round(ry * 0.5), KP.glint);
  if (state === 'rage' || state === 'narrow') for (let q = 0; q < 3; q++) B.set(ex - rx + 1 + q, ey + q - 1, '#c9463d');
}
// THE BEAK: a black parrot's hook, and the red of the mouth behind it when it opens
// a black hook with a pale ridge along its top and a glint on the point, and a shorter lower jaw under it
function beak(B, bx, by, s, open) {
  const oy = open * 8 * s;
  const up = [[bx - 7 * s, by - 7 * s], [bx + 4 * s, by - 11 * s], [bx + 12 * s, by - 8 * s], [bx + 17 * s, by - 1 * s], [bx + 18 * s, by + 6 * s], [bx + 14 * s, by + 10 * s], [bx + 12 * s, by + 3 * s], [bx + 4 * s, by + 1 * s], [bx - 6 * s, by + 1 * s]];
  const lo = [[bx - 5 * s, by + 3 * s + oy * 0.4], [bx + 9 * s, by + 4 * s + oy], [bx + 8 * s, by + 9 * s + oy], [bx - 3 * s, by + 8 * s + oy * 0.5]];
  if (open > 0.1) poly(B, [[bx - 5 * s, by], [bx + 12 * s, by + 2 * s], [bx + 9 * s, by + 5 * s + oy], [bx - 3 * s, by + 5 * s + oy * 0.5]], (x, y) => ((x + y) % 5 === 0 ? KP.tongue : KP.mouth));
  poly(B, lo, (x, y) => (y < by + 4.5 * s + oy ? KP.beakM : KP.beak));
  poly(B, up, () => KP.beak);
  for (let i = 0; i <= 16; i++) { const t = i / 16, x = bx - 5 * s + t * 21 * s, y = by - 7.5 * s - Math.sin(t * Math.PI * 0.9) * 3 * s + t * t * 9 * s; B.set(x, y, t > 0.7 ? KP.beakL : KP.beakM); }
  B.set(bx + 16 * s, by + 6 * s, '#d8d0c8'); B.set(bx + 3 * s, by - 8 * s, '#b0a498');
}
function poly(B, pts, pick) { let y0 = 1e9, y1 = -1e9; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) { const sy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= sy) !== (b[1] <= sy)) xs.push(a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5); x < Math.ceil(xs[i + 1] - 0.5); x++) B.set(x, y, pick(x, y)); } }

// ---------- THE HEAD ----------
// One creature, drawn at three sizes by the same hand: `s` scales everything, so the bestiary gets the same animal as the fight.
function headInto(B, X, Y, s, o) {
  const sk = skin(7, 1), dy = (o.dy || 0) * s, lean = o.lean || 0;
  // the arm roots under the head, thick and curling out into the water
  if (!o.noRoots) for (const [a, b, c2, d, side] of [[[-26, 6], [-44, 14], [-50, 2], [-58, -8], -1], [[-8, 12], [-14, 26], [-30, 30], [-40, 22], -1], [[16, 12], [22, 26], [40, 28], [50, 18], 1], [[30, 4], [50, 8], [58, -4], [62, -16], 1]])
    tube(B, bez([X + a[0] * s, Y + a[1] * s + dy], [X + b[0] * s, Y + b[1] * s + dy], [X + c2[0] * s, Y + c2[1] * s + dy], [X + d[0] * s, Y + d[1] * s + dy], Math.round(14 * s), 9 * s, 2.2 * s), { side });
  // THE MANTLE: a dome that leans back from the face, wider at the bottom, ridged
  blob(B, X - 6 * s + lean * s, Y - 40 * s + dy, 34 * s, 42 * s, { tilt: -0.42 + lean * 0.02, pear: 0.22, fn: sk });
  // the brow over the eye, and the cheek the beak comes out of
  blob(B, X + 22 * s, Y - 14 * s + dy, 22 * s, 17 * s, { tilt: 0.2, fn: sk, bias: 0.04 });
  blob(B, X + 24 * s, Y - 30 * s + dy, 14 * s, 8 * s, { tilt: 0.3, bias: -0.05 });
  if (o.ink) blob(B, X - 26 * s, Y - 8 * s + dy, 11 * s, 9 * s, { bias: 0.1 });   /* the siphon, swollen with it */
  /* THE FACE HAS TO READ UNDER THAT DOME: an eye the size of a cartwheel and a beak like a ship's prow */
  eye(B, Math.round(X + 24 * s), Math.round(Y - 24 * s + dy), Math.max(2, Math.round(12 * s)), o.eye || 'open');
  beak(B, X + 32 * s + (o.thrust || 0) * s, Y - 2 * s + dy, s * 1.45, o.open || 0);
  if (o.stars) for (const [sx, sy] of [[8, -70], [26, -76], [40, -64]]) { const x = Math.round(X + sx * s), y = Math.round(Y + sy * s + dy); B.set(x, y, '#fff6c8'); for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) B.set(x + ox, y + oy, '#e6b94a'); }
  if (o.water) for (let x = 0; x < B.w; x++) for (let y = Math.round(Y - 16 * s); y < B.h; y++) B.a[y * B.w + x] = null;   /* EMERGE: only what is over the water (canvas row 80 is the sea), and the eye just clear of it */
}
export function bakeKrakenHead() {
  const W = 124, H = 100, X = 58, Y = 96;
  const f = o => { const B = buf(W, H); headInto(B, X, Y, 1, o); return toCanvas(B); };
  const frames = [f({}), f({ eye: 'blink' }), f({ open: 1, eye: 'rage', lean: -3 }), f({ open: 0.5, thrust: 8, eye: 'narrow', lean: 4 }), f({ open: 0.2, thrust: 10, eye: 'wide', stars: true, dy: 6 }),
    f({ eye: 'shut', open: 0.3, lean: -4 }), f({ eye: 'rolled', dy: 10, stars: true }), f({ ink: true, eye: 'narrow', lean: -2 }), f({ water: true, dy: 0, noRoots: true }), f({ eye: 'glazed', open: 0.6, dy: 8 })];
  return pack(frames, X, Y, 60, 60);
}
// THE ARMS. A disc a radius: the draw lays them tip-first so the thick end sits over the thin
// Each radius comes as a FILL (no outline) and a RIM (the outline alone): the draw lays every rim of an arm first and every fill
// over them, so the arm has one outline round the whole of it instead of a ring round every disc - a tentacle, not a string of beads.
// The skin is the head's, a step darker (the arms are wet and in its shadow), and the suckers are laid separately on the side
// the curve says is underneath.
const ARMRAMP = [KP.d0, KP.d0, KP.d1, KP.m0, KP.m1, KP.l0, KP.l1];
export function bakeKrakenArms() {
  const seg = [], segW = [], rim = [], suck = [];
  for (let r = 1; r <= 22; r++) { const n = r * 2 + 6, B = buf(n, n), c0 = n / 2;
    blob(B, c0, c0, r, r, { ramp: ARMRAMP, bias: -0.06, fn: (x, y, u, v, k, col) => (Math.abs(v + 0.15) < 0.09 && r > 5 ? ARMRAMP[Math.max(0, ARMRAMP.indexOf(col) - 1)] : null) });
    const fill = toCanvas(B, false), withRim = outline(toCanvas(B, false), OUT), [rc, rg] = canvas(n, n);
    rg.drawImage(withRim, 0, 0); rg.globalCompositeOperation = 'destination-out'; rg.drawImage(fill, 0, 0);
    seg[r] = fill; segW[r] = whiten(fill); rim[r] = rc;
    const sr = Math.max(1, r * 0.3), S = buf(Math.ceil(sr * 2) + 3, Math.ceil(sr * 2) + 3), sc = S.w / 2;
    for (let y = 0; y < S.h; y++) for (let x = 0; x < S.w; x++) { const d = Math.hypot(x + 0.5 - sc, y + 0.5 - sc); if (d <= sr) S.set(x, y, d < sr * 0.45 ? KP.suckC : d < sr * 0.8 ? KP.suck : KP.suckD); }
    suck[r] = toCanvas(S, false); }
  // the curl at the end of an arm
  const T = buf(20, 20); tube(T, bez([3, 16], [3, 4], [16, 2], [14, 11], 12, 3, 1), { side: -1 }); const tip = toCanvas(T);
  // a cut arm: the stump, pale meat and a black bead of ink in the middle of it
  const S = buf(26, 26); blob(S, 13, 13, 11, 11); for (let y = 6; y < 21; y++) for (let x = 6; x < 21; x++) { const d = Math.hypot(x + 0.5 - 13, y + 0.5 - 13); if (d < 7) S.set(x, y, d < 3 ? KP.ink : d < 5 ? KP.suckD : KP.suck); }
  return { seg, segW, rim, suck, tip, tipW: whiten(tip), stump: toCanvas(S) };
}
// THE BESTIARY'S KRAKEN: the same head at half size, with three arms up out of the sea round it
export function bakeKraken() {
  const W = 72, H = 58, X = 34, Y = 56;
  const f = (ph, o) => { const B = buf(W, H);
    for (const [bx, lean, side] of [[-26, -1, 1], [30, 1, -1], [-4, 0.3, 1]]) { const sw = Math.sin(ph + bx) * 4;
      tube(B, bez([X + bx * 0.9, Y - 2], [X + bx + sw, Y - 20], [X + bx + lean * 14 - sw, Y - 38], [X + bx + lean * 8 + sw * 1.5, Y - 52], 16, 4.5, 1.2), { side }); }
    headInto(B, X, Y, 0.52, o); return toCanvas(B); };
  return pack([f(0, {}), f(1.6, { eye: 'blink' }), f(3, { open: 1, eye: 'rage' }), f(4.2, { eye: 'shut', open: 0.3 })], X, Y, 40, 40);
}
// THE FEELER: one arm up out of a hole in the flats. The kraken's, or its young's; nobody has dug down to see
export function bakeFeeler() {
  const W = 38, H = 46, X = 19, Y = 45;
  const hole = B => { for (let x = -9; x <= 9; x++) { B.set(X + x, Y, KP.d0); if (Math.abs(x) < 7) B.set(X + x, Y - 1, x % 3 ? '#4a4038' : '#6a5e50'); } for (const x of [-10, 10]) B.set(X + x, Y - 1, '#8a7a64'); };
  const f = (a, b, c, d, r0 = 5, o = {}) => { const B = buf(W, H); hole(B);
    if (a) tube(B, bez([X, Y - 1], [X + a[0], Y + a[1]], [X + b[0], Y + b[1]], [X + c[0], Y + c[1]], d || 14, r0, 1.3), { side: o.side || 1 });
    if (o.bubbles) for (const [bx, by] of [[-3, -5], [2, -9], [-1, -14]]) B.set(X + bx, Y + by, '#e8f4f0');
    return toCanvas(B); };
  const frames = [
    f([1, -3], [-2, -5], [2, -6], 6, 3, { bubbles: true }),                       // 0 hide: the tip, just
    f([4, -10], [-6, -18], [2, -24], 12, 5),                                     // 1 rise
    f([6, -14], [-8, -28], [4, -40], 16, 5.5),                                   // 2 sway
    f([-6, -14], [8, -28], [-2, -41], 16, 5.5, { side: -1 }),                    // 3 sway
    f([-8, -12], [-14, -34], [-2, -42], 16, 5.5, { side: -1 }),                  // 4 LASH TELL: reared back over its own root
    f([6, -14], [14, -10], [18, -3], 16, 5.5),                                   // 5 lash: thrown forward along the ground
    f([8, -6], [14, -2], [18, -2], 16, 5.5),                                     // 6 stuck: lying out on the ground
    f([-4, -10], [-10, -20], [-4, -26], 14, 5.5, { side: -1 }),                  // 7 hurt (LAST): flinched back and curled
  ];
  return pack(frames, X, Y, 10, 28);
}

// ---------- THE FIELDS BEHIND IT ----------
const SEA = ['#243836', '#2e4644', '#3a5654', '#4c6a66', '#6a8682', '#9ab0a8'];
// FAR: the drowned country under a storm. A horizon of grey-green sea with the old hedge lines and fence posts still standing
// in it, a line of the causeway's own towers going out to nothing, and bare trees up to their knees. 320x90, horizon row 50.
export function bakeFarCauseway(w, h, seed) {
  const rnd = mulberry(seed * 131 + 7), [c, g] = canvas(w, h), H0 = 50;
  for (let y = H0; y < h; y++) { const t = (y - H0) / (h - H0), col = t < 0.08 ? SEA[5] : t < 0.25 ? SEA[4] : t < 0.5 ? SEA[3] : t < 0.8 ? SEA[2] : SEA[1]; rect(g, 0, y, w, 1, col); }
  for (let y = H0 + 2; y < h; y++) { const n = Math.round(w / (10 + (y - H0) * 0.5)); for (let i = 0; i < n; i++) { const x = (rnd() * w) | 0, len = 1 + (((y - H0) / 10) | 0); rect(g, x, y, len, 1, y % 2 ? SEA[4] : SEA[3]); } }
  // the hedges: long dark lines across the flats, broken where the sea took them
  for (let k = 0; k < 5; k++) { const y = H0 + 4 + k * 6 + ((rnd() * 3) | 0); for (let x = 0; x < w; x++) if (Math.sin(x * 0.07 + k * 2.1) > -0.35 && hsh(x, y, k) > 0.12) { px(g, x, y, SEA[1]); if (hsh(x, y, 9) < 0.3) px(g, x, y - 1, '#2a3a36'); } }
  // fence posts, a row of them marching out
  for (let x = 6; x < w; x += 9 + ((rnd() * 5) | 0)) { const y = H0 + 10 + ((rnd() * 22) | 0); rect(g, x, y - 3, 1, 4, '#34423e'); px(g, x, y + 1, SEA[5]); }
  // the distant causeway: a thin stone line on the horizon, and its towers
  rect(g, 0, H0 - 1, w, 1, '#5a6a66');
  for (let x = 20; x < w; x += 70 + ((rnd() * 30) | 0)) { const th = 7 + ((rnd() * 5) | 0); rect(g, x, H0 - th, 3, th, '#4e5c5a'); rect(g, x - 1, H0 - th - 1, 5, 1, '#4e5c5a'); px(g, x + 1, H0 - th - 2, '#4e5c5a'); px(g, x + 1, H0 - th + 2, '#2c3634'); }
  // drowned trees: a trunk and a few bare limbs, standing in water
  for (let k = 0; k < 6; k++) { const x = (rnd() * w) | 0, y = H0 + 3 + ((rnd() * 14) | 0), th = 6 + ((rnd() * 7) | 0);
    rect(g, x, y - th, 1, th, '#2c3834'); for (let q = 0; q < 3; q++) { const by = y - th + 1 + q * 2, dir = q % 2 ? 1 : -1; for (let i = 1; i < 4; i++) px(g, x + dir * i, by - i + 1, '#2c3834'); } px(g, x, y + 1, SEA[5]); }
  return c;
}
// MID: nearer, the old road's broken arches standing in the water, a bell tower with its bell gone green, and the wrack. 480x140.
export function bakeMidCauseway(w, h, seed) {
  const rnd = mulberry(seed * 977 + 3), [c, g] = canvas(w, h), WL = h - 20;
  const S0 = '#3a4644', S1 = '#4a5856', S2 = '#5e6c68', S3 = '#76847e';
  const pierAt = (x, top, pw) => { rect(g, x, top, pw, WL - top, S1); rect(g, x, top, 1, WL - top, S2); rect(g, x + pw - 1, top, 1, WL - top, S0); for (let y = top + 3; y < WL; y += 4) rect(g, x + 1, y, pw - 2, 1, S0); };
  for (let x = -10; x < w; x += 150 + ((rnd() * 40) | 0)) {
    const top = WL - 46 - ((rnd() * 10) | 0), span = 34, pw = 8;
    pierAt(x, top, pw); pierAt(x + span + pw, top + ((rnd() * 6) | 0), pw);
    for (let i = 0; i <= span; i++) { const t = i / span, ay = top + 2 + Math.round((1 - Math.sin(t * Math.PI)) * 12); if (hsh(x + i, 3, 5) < 0.12 && t > 0.4 && t < 0.7) continue; rect(g, x + pw + i, top, 1, ay - top, S1); px(g, x + pw + i, ay, S0); px(g, x + pw + i, top, S3); }
    // the road on top, broken off at one end
    rect(g, x - 2, top - 3, span + pw * 2 + 2, 3, S2); rect(g, x - 2, top - 3, span + pw * 2 + 2, 1, S3);
    for (let k = 0; k < 4; k++) px(g, x + 3 + k * 11, top + 4 + (k % 2), '#c8c2ae');   /* barnacles and gull lime on the stone */
    // a bell tower on one of them in two
    if (rnd() < 0.55) { const tx = x + span + pw + 1, tt = top - 38; rect(g, tx, tt, 7, 36, S1); rect(g, tx, tt, 1, 36, S2); rect(g, tx + 2, tt + 6, 3, 6, '#1e2624'); px(g, tx + 3, tt + 10, '#4a9a8a'); px(g, tx + 3, tt + 9, '#4a9a8a');
      rect(g, tx - 1, tt - 2, 9, 2, S3); rect(g, tx + 1, tt - 6, 5, 4, S0); px(g, tx + 3, tt - 8, S0); px(g, tx + 3, tt - 7, S0); }
  }
  // drowned trees and posts in front of them
  for (let k = 0; k < 7; k++) { const x = (rnd() * w) | 0, th = 16 + ((rnd() * 16) | 0);
    for (let y = WL - th; y < WL; y++) rect(g, x, y, 2, 1, '#2a3432');
    for (let q = 0; q < 4; q++) { const by = WL - th + 3 + q * 4, dir = q % 2 ? 1 : -1, len = 4 + ((rnd() * 5) | 0); for (let i = 1; i < len; i++) px(g, x + (dir > 0 ? 1 : 0) + dir * i, by - Math.round(i * 0.7), '#2a3432'); } }
  // the water line in front, and its wrack
  for (let y = WL; y < h; y++) rect(g, 0, y, w, 1, y < WL + 2 ? SEA[5] : y < WL + 6 ? SEA[3] : SEA[2]);
  for (let x = 0; x < w; x += 3) if (hsh(x, WL, 2) < 0.5) px(g, x, WL + 3 + ((hsh(x, 1, 1) * 8) | 0), SEA[4]);
  return c;
}
// THE THING OUT THERE. A back the length of a ship, a ridge of spines, and one arm up out of the sea in a hook. Drawn dark
// against the horizon and cut off at the water line by the draw, so it can come up and go down again. 160x54, water line row 52.
export function bakeLeviathan(v = 0) {
  const W = 160, H = 54, WL = 52, [c, g] = canvas(W, H), dark = '#1c2624', mid = '#26322f', rim = '#56665f';
  for (let x = 0; x < W; x++) { const t = x / W, top = WL - Math.round(Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.8) * (v ? 18 : 24));
    rect(g, x, top, 1, WL - top + 2, (x + top) % 7 === 0 ? mid : dark); px(g, x, top, rim); }
  for (let k = 0; k < 9; k++) { const x = 22 + k * 13, t = x / W, top = WL - Math.round(Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.8) * (v ? 18 : 24)), sh = 4 + (k % 3) * 2;
    for (let i = 0; i < sh; i++) { rect(g, x - Math.round(i * 0.4), top - i, Math.max(1, 3 - (i >> 1)), 1, dark); } px(g, x, top - sh, rim); }
  // the arm, up in a hook
  const ax = v ? 128 : 38; let px0 = ax, py0 = WL;
  for (let i = 0; i < 40; i++) { const t = i / 40, x = ax + Math.sin(t * 2.6) * 14 * (v ? -1 : 1) * t, y = WL - t * 48, r = 4 - t * 3.2;
    for (let yy = -Math.ceil(r); yy <= Math.ceil(r); yy++) for (let xx = -Math.ceil(r); xx <= Math.ceil(r); xx++) if (xx * xx + yy * yy <= r * r) px(g, Math.round(x + xx), Math.round(y + yy), dark);
    if (i % 3 === 0) px(g, Math.round(x - r), Math.round(y), rim); px0 = x; py0 = y; }
  return c;
}

// ---------- THE STONES OF THE ROAD ----------
const ST = { o: '#3a4240', d: '#4e5856', m: '#66706c', l: '#848e88', h: '#a4ada6', iron: '#3a3436', ironL: '#6a6266', rust: '#8a5a3a', barn: '#d8d2bc', weed: '#4a6a3a', weedD: '#34502a' };
const stone = (B, x0, y0, x1, y1, seed) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const e = Math.min(x - x0, x1 - x, y - y0), h = hsh(x, y, seed);
  B.set(x, y, x === x0 || y === y0 ? ST.l : x === x1 ? ST.d : h < 0.08 ? ST.d : h > 0.94 ? ST.h : e < 2 && (x - x0) < 3 ? ST.l : ST.m); } };
const weedFoot = (B, x0, x1, y) => { for (let x = x0; x <= x1; x++) { const n = 1 + ((hsh(x, y, 3) * 3) | 0); for (let k = 0; k < n; k++) B.set(x, y - k, k ? ST.weed : ST.weedD); if (hsh(x, y, 4) < 0.2) B.set(x, y - n, ST.barn); } };
// THE WAYSTONE: an old iron-bound mile stone the height of a man. The road was measured in them; the Kraken breaks its beak on them
export function bakeWaystone(v = 0) {
  const W = 18, H = 32, B = buf(W, H);
  stone(B, 2, 4 + v, 15, 31, 11 + v); for (let x = 3; x <= 14; x++) B.set(x, 3 + v + (x > 6 && x < 11 ? -1 : 0), ST.l);
  for (const y of [10, 22]) for (let x = 2; x <= 15; x++) { B.set(x, y, ST.iron); B.set(x, y + 1, (x % 4) ? ST.ironL : ST.rust); }
  // the mile, cut: a ring and a bar
  for (const [x, y] of [[8, 14], [9, 14], [7, 15], [10, 15], [7, 16], [10, 16], [8, 17], [9, 17], [8, 19], [9, 19]]) B.set(x, y, ST.o);
  if (v) for (let k = 0; k < 6; k++) B.set(12 - k, 5 + k * 2, ST.o);   /* cracked, where the beak found it */
  weedFoot(B, 1, 16, 31); return toCanvas(B);
}
// A WAYSIDE SHRINE: a stone box with a pitched cap and a niche, the kind a pilgrim leaves a shell in
export function bakeWayShrine() {
  const W = 22, H = 30, B = buf(W, H);
  stone(B, 4, 10, 17, 29, 21); for (let y = 2; y < 10; y++) for (let x = 11 - (y - 1); x <= 10 + (y - 1); x++) B.set(x, y, y === 9 ? ST.d : x < 11 ? ST.l : ST.m);
  for (let y = 13; y <= 20; y++) for (let x = 8; x <= 13; x++) B.set(x, y, y < 15 && (x === 8 || x === 13) ? ST.m : '#1e2422');
  for (const [x, y, k] of [[10, 19, '#f0e0c8'], [11, 19, '#e0a890'], [9, 18, '#ffd36b']]) B.set(x, y, k);
  weedFoot(B, 3, 18, 29); return toCanvas(B);
}
// A BROKEN ARCH: two courses of an arch left standing on the road with the sky through it. Background, walked past
export function bakeBrokenArch() {
  const W = 52, H = 46, B = buf(W, H);
  stone(B, 2, 8, 10, 45, 31); stone(B, 41, 14, 49, 45, 32);
  for (let i = 0; i <= 30; i++) { const t = i / 30, y0 = 8 + Math.round((1 - Math.sin(t * Math.PI)) * 12) - 6, y1 = y0 + 6; if (t > 0.62) break;
    for (let y = y0; y <= y1; y++) B.set(11 + i, y, y === y0 ? ST.l : y === y1 ? ST.d : (i % 5 === 0 ? ST.d : ST.m)); }
  for (let k = 0; k < 5; k++) B.set(38 + k, 12 + k, ST.o);
  weedFoot(B, 1, 11, 45); weedFoot(B, 40, 50, 45); return toCanvas(B);
}
// A DROWNED TREE: grey and bare, with the tideline on it
export function bakeDrownedTree() {
  const W = 34, H = 44, B = buf(W, H), T0 = '#4a4640', T1 = '#6e6860', T2 = '#8e887c';
  for (let y = 12; y < 44; y++) { const w2 = y > 38 ? 3 : 2; for (let x = -w2; x <= w2; x++) B.set(17 + x + (y < 20 ? Math.round((20 - y) * 0.2) : 0), y, x < 0 ? T2 : x > 0 ? T0 : T1); }
  const limb = (x, y, dx, dy, n) => { for (let i = 0; i < n; i++) { B.set(Math.round(x + dx * i), Math.round(y + dy * i), T1); B.set(Math.round(x + dx * i), Math.round(y + dy * i) + 1, T0); } };
  limb(17, 22, -1, -0.8, 12); limb(18, 18, 1, -0.9, 11); limb(16, 14, -0.4, -1, 9); limb(9, 14, -0.6, -0.5, 5); limb(27, 9, 0.7, -0.6, 5);
  for (let x = 13; x <= 21; x++) { B.set(x, 34, '#b8b09a'); B.set(x, 35, '#5a5a4a'); }   /* the tideline */
  return toCanvas(B);
}
// FENCE POSTS still standing out on the flats, with the wrack caught on the wire
export function bakeFencePosts() {
  const W = 34, H = 18, B = buf(W, H);
  for (const x of [3, 16, 29]) for (let y = 3 + (x % 3); y < 18; y++) { B.set(x, y, '#6e604e'); B.set(x + 1, y, '#4e4438'); }
  for (let x = 3; x <= 30; x++) { B.set(x, 7 + Math.round(Math.sin(x * 0.4)), '#3a3430'); if (hsh(x, 1, 7) < 0.3) B.set(x, 8 + Math.round(Math.sin(x * 0.4)), ST.weed); }
  return toCanvas(B);
}
// THE TIDE BELL: a bronze bell gone green, hung in a stone frame. Strike it and the causeway's tide turns on your word. 24x34
export function bakeTideBell(swing = 0) {
  const W = 26, H = 36, B = buf(W, H), bz = ['#2f6a60', '#4a9a8a', '#7cc8b8', '#c8f0e0'];
  stone(B, 1, 2, 4, 35, 41); stone(B, 21, 2, 24, 35, 42); for (let x = 1; x <= 24; x++) { B.set(x, 1, ST.l); B.set(x, 2, ST.m); B.set(x, 3, ST.d); }
  const cx = 13 + swing * 3, top = 5;
  for (let y = 0; y < 14; y++) { const r = y < 3 ? 3 + y * 0.6 : 4.8 + y * 0.28; for (let x = -Math.round(r); x <= Math.round(r); x++) B.set(Math.round(cx + x - swing * (13 - y) * 0.2), top + y + 2, x < -r * 0.3 ? bz[2] : x > r * 0.5 ? bz[0] : bz[1]); }
  for (let x = -6; x <= 6; x++) B.set(Math.round(cx + x), top + 16, bz[0]);
  B.set(13, 4, ST.iron); B.set(13, 5, ST.iron); B.set(Math.round(cx), top + 17, '#2a2426'); B.set(Math.round(cx), top + 18, '#2a2426');
  B.set(Math.round(cx) - 3, top + 7, bz[3]);
  return toCanvas(B);
}
