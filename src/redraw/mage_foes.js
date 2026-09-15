// mage_foes.js — THE MAGE'S FOLLY: what got loose in the tower, the Homunculus, the Archmage and his familiar, the
// apprentice at the gate, and THE THREE FORMS the hero wears (the mouse, the bat, the stone golem).
// A baker in the fields_foes.js manner: everything is rasterised into a colour buffer (one hex string a pixel), lit from
// the upper left with 3-4 tone ramps, parts laid over the body with an inner edge (layer()), then the OUT outline, so
// every creature reads as a SHAPE against violet stone and brass. VIOLET LIGHT ('#7a3fbf' '#b07cf0' '#e0c8ff') is the
// tower's magic and is worn by what he made or animated; the forms wear their FONT colour so a player knows at a
// glance which one he is (blue mouse, violet bat, amber golem).
// All frames face RIGHT (L is the flip) and every frame of one baker shares one canvas, so the anchor holds. HURT is LAST.
//
// bakeTopiary()     THE TOPIARY (regular) — a hedge cut as a hound, on a plinth of roots: leaf greens, two violet eyes.
//   frames: 0 still  1 SHIVER (the tell: every leaf bristles)  2 lurch A  3 lurch B  4 SWIPE TELL (a claw of twigs back)
//           5 swipe (the claw through, smear)  6 hurt (LAST: leaves flying)
//   canvas 40x32   anchor ax 20, ay 30   pack w/h 16x22
// bakeArmour()      ANIMATED ARMOUR (regular) — a suit of plate with no one in it, a violet light in the visor, a longsword.
//   frames: 0 idle  1 walk A  2 walk B  3 SWING TELL (sword up over the helm)  4 swing (down, smear)  5 hurt (LAST: plates jolted)
//   canvas 40x40   anchor ax 20, ay 38   pack w/h 12x26
// bakePiece()       A PIECE OF ARMOUR (what it breaks into) — a gauntlet that crawls on its fingers.
//   frames: 0 crawl A  1 crawl B  2 hurt   canvas 16x12   anchor ax 8, ay 10   pack w/h 8x6
// bakeBroom()       THE BROOM (regular, flies) — a broom carrying a slopping bucket, the swarm's kind.
//   frames: 0 fly A  1 fly B  2 DASH TELL (tipped back, bristles fanned)  3 dash  4 hurt   canvas 28x24   anchor ax 14, ay 22   pack w/h 12x10
// bakeMimic()       THE MIMIC CHEST (regular) — a banded chest until it is a mouth.
//   frames: 0 shut (a real chest)  1 open (teeth, a tongue)  2 BITE TELL (jaw wide, drool)  3 bite (snapped shut, smear)  4 hop  5 hurt
//   canvas 28x24   anchor ax 14, ay 22   pack w/h 16x12
// bakeImp()         THE IMP (regular, flies) — a little red-violet devil out of its jar, bat wings, a flame in its hand.
//   frames: 0 hover A  1 hover B  2 THROW TELL (fire held back over the head)  3 throw  4 PUFF (about to hop: hunched in smoke)  5 hurt
//   canvas 24x26   anchor ax 12, ay 24   pack w/h 10x12
// bakeTurret()      THE ARCANE TURRET (regular, still) — a brass eye on a tripod that spits slow orbs.
//   frames: 0 idle  1 CHARGE TELL (the eye brightens)  2 fire (recoiled)  3 hurt   canvas 24x24   anchor ax 12, ay 22   pack w/h 12x14
// bakeHomunculus()  THE HOMUNCULUS (mini) — a pale little man grown in a jar, still wearing its glass bell like a hat.
//   frames: 0 idle  1 walk A  2 walk B  3 SWIPE TELL  4 swipe  5 MOUSE TELL (down on all fours, ears out)  6 scurry
//           7 BAT TELL (wings out, up on its toes)  8 dive  9 GOLEM TELL (stone-armed, arms up)  10 slam  11 spent (OPENING: on its knees, panting)  12 hurt
//   canvas 48x40   anchor ax 24, ay 38   pack w/h 14x22
// bakeArchmage()    THE ARCHMAGE (boss, stages I and II) — tall, gaunt, a violet robe, a brass staff, a beard.
//   frames: 0 idle  1 drift  2 BLINK (robes swirling into smoke)  3 BOLT TELL (staff high, the circle drawn)  4 bolt
//           5 REND TELL (staff down, red)  6 rend  7 shielded (arms folded behind the runes)  8 open (staff dropped, doubled over)
//           9 hurt  10 dead (fallen, the hat rolled off)
//   canvas 48x52   anchor ax 24, ay 50   pack w/h 16x34
// bakeFamiliar()    THE FAMILIAR UNBOUND (boss, stage III) — the cat that sat on his desk, grown into a thing the size of the
//   room: a huge round head, one great eye, forelegs like pillars, the mage's boots sticking out of its mouth.
//   frames: 0 idle  1 SWIPE TELL (a paw raised)  2 swipe  3 SLAM TELL (reared)  4 slam  5 SPIT TELL (cheeks full)  6 spit
//           7 OPEN (head down on the floor, the eye wide)  8 dead   canvas 112x96   anchor ax 56, ay 94   pack w/h 56x60
// bakeApprentice()  THE APPRENTICE (npc) — a boy in a violet robe too big for him.   2 frames   canvas 20x28   ax 10, ay 26
// bakeForms()       { mouse, bat, golem } — the hero as each form.
//   mouse: 0 idle 1 run A 2 run B 3 hurt   canvas 14x10   ax 7, ay 8    pack 6x6
//   bat:   0 flap A 1 flap B 2 hang 3 glide 4 hurt   canvas 20x14   ax 10, ay 12   pack 8x8
//   golem: 0 idle 1 walk A 2 walk B 3 swing 4 hurt   canvas 28x26   ax 14, ay 24   pack 14x18
import { canvas, px, flipX, whiten, outline } from '../px.js';
import { OUT } from '../art.js';

export const VIOLET = ['#3a1c5a', '#7a3fbf', '#b07cf0', '#e0c8ff'];
export const FORM_COL = { mouse: ['#1e3a7a', '#3f7fdf', '#8ac0ff', '#d8ecff'], bat: ['#3a1c5a', '#7a3fbf', '#b07cf0', '#e0c8ff'], golem: ['#6a3a10', '#c07a20', '#f0b040', '#ffe8a0'] };
const BRASS = ['#5a3c14', '#a8782a', '#e0b050', '#fff0b0'];
const STEEL = ['#3a3e4a', '#6a707e', '#a0a8b8', '#e0e6f0'];
const LEAF = ['#1e3a22', '#2e5a30', '#4a8a44', '#8ac060'];
const SKIN = ['#6a4a5a', '#b08a9a', '#e0c0c8', '#fff0f0'];
const R0 = Math.round;

function pack(frames, ax, ay, w, h) { const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX); return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h }; }
// ---------- a colour buffer ----------
function buf(w, h) {
  const a = new Array(w * h).fill(null);
  return { w, h, a,
    set(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (c && x >= 0 && y >= 0 && x < w && y < h) a[y * w + x] = c; },
    del(x, y) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < w && y < h) a[y * w + x] = null; },
    get(x, y) { x = Math.floor(x); y = Math.floor(y); return x >= 0 && y >= 0 && x < w && y < h ? a[y * w + x] : null; } };
}
function toCanvas(B, out = true) {
  const [c, g] = canvas(B.w, B.h);
  for (let y = 0; y < B.h; y++) for (let x = 0; x < B.w; x++) { const k = B.a[y * B.w + x]; if (k) px(g, x, y, k); }
  return out ? outline(c, OUT) : c;
}
/* nothing below the body's floor row F: the outline goes on F+1 and that is the anchor row */
function floorCut(B, F) { for (let y = F + 1; y < B.h; y++) for (let x = 0; x < B.w; x++) B.a[y * B.w + x] = null; }
const D2 = [[0, 0.5], [0.75, 0.25]];
const lit = (x, y, k, ramp) => { const f = Math.max(0, Math.min(0.999, k)) * (ramp.length - 1), i = Math.floor(f), fr = f - i;
  return ramp[fr > D2[y & 1][x & 1] ? Math.min(ramp.length - 1, i + 1) : i]; };
const LX = -0.55, LY = -0.62, LZ = 0.56;
const dot = (B, x, y, c) => B.set(R0(x), R0(y), c);
function seg(B, x0, y0, x1, y1, c) {
  x0 = R0(x0); y0 = R0(y0); x1 = R0(x1); y1 = R0(y1);
  const pts = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  pts.forEach(([x, y], i) => B.set(x, y, typeof c === 'function' ? c(i, pts.length, x, y) : c));
  return pts;
}
function poly(B, pts, pick) {
  let y0 = 1e9, y1 = -1e9; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
    const sy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= sy) !== (b[1] <= sy)) xs.push(a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5); x < Math.ceil(xs[i + 1] - 0.5); x++) B.set(x, y, typeof pick === 'function' ? pick(x, y) : pick);
  }
}
/* a capsule from a to b, w thick, lit from the upper left: ramp [dark, base, light, (hi)] */
function limb(B, a, b, w, ramp) {
  const ax = a[0] + 0.5, ay = a[1] + 0.5, bx = b[0] + 0.5, by = b[1] + 0.5, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, r = w / 2;
  for (let y = Math.floor(Math.min(ay, by) - r); y <= Math.ceil(Math.max(ay, by) + r); y++) for (let x = Math.floor(Math.min(ax, bx) - r); x <= Math.ceil(Math.max(ax, bx) + r); x++) {
    const t = Math.max(0, Math.min(1, ((x + 0.5 - ax) * dx + (y + 0.5 - ay) * dy) / L2)), ox = x + 0.5 - ax - dx * t, oy = y + 0.5 - ay - dy * t, d = Math.hypot(ox, oy);
    if (d > r) continue;
    const s = d < 0.3 ? 0.1 : (-ox * 0.6 - oy * 0.8) / d;
    B.set(x, y, s > 0.85 && ramp[3] && d > r * 0.45 ? ramp[3] : s > 0.3 ? ramp[2] : s < -0.4 ? ramp[0] : ramp[1]);
  }
}
/* a lit ellipsoid; o.fn(x, y, u, v, k, col) may repaint a pixel */
function ball(B, cx, cy, rx, ry, ramp, o = {}) {
  const t = o.tilt || 0, ct = Math.cos(t), st = Math.sin(t), R = Math.max(rx, ry) + 1;
  for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, ux = dx * ct + dy * st, uy = -dx * st + dy * ct, u = ux / rx, v = uy / ry, q = u * u + v * v;
    if (q > 1) continue;
    const nz = Math.sqrt(1 - q), k = 0.42 + 0.62 * (u * LX + v * LY + nz * LZ) + (o.bias || 0) - (q > 0.72 ? 0.14 : 0);
    let col = o.flat ? ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(k * ramp.length)))] : lit(x, y, k, ramp);
    if (o.fn) col = o.fn(x, y, u, v, k, col) || col;
    B.set(x, y, col);
  }
}
/* a flat lit box: ramp [dark, base, light]; the top row and left column take the light, the bottom and right the dark */
function box(B, x, y, w, h, ramp) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) B.set(xx, yy, yy === y || xx === x ? ramp[2] : yy === y + h - 1 || xx === x + w - 1 ? ramp[0] : ramp[1]); }
/* draw a part into its own buffer, give it an inner edge where it lies over what is already there, then lay it on */
function layer(B, fn, edge = OUT) {
  const T = buf(B.w, B.h); fn(T);
  for (let y = 0; y < B.h; y++) for (let x = 0; x < B.w; x++) {
    if (T.get(x, y)) continue;
    const by = T.get(x - 1, y) || T.get(x + 1, y) || T.get(x, y - 1) || T.get(x, y + 1);
    if (by && B.get(x, y)) B.set(x, y, edge);
  }
  for (let i = 0; i < T.a.length; i++) if (T.a[i]) B.a[i] = T.a[i];
}
/* a swing's smear, drawn after the outline on empty pixels only: an arc of radius r round (cx, cy), a0..a1 degrees (0 ahead, -90 up) */
function smear(c, cx, cy, r, a0, a1, cols) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 2) for (let j = 0; j < cols.length; j++) {
    if (a < a0 + (a1 - a0) * j * 0.3) continue;
    const rr = r - j, x = R0(cx + rr * Math.cos(a * Math.PI / 180)), y = R0(cy + rr * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= c.width || y >= c.height) continue;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, cols[j]);
  }
}
/* loose pixels laid after the outline (sparks, leaves, smoke): no rim, so they read as light and not as bodies */
function afterDots(c, pts) { const g = c.getContext('2d'); for (const [x, y, col] of pts) px(g, x, y, col); }
/* a cheap deterministic scatter */
function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// =====================================================================================================================
// THE TOPIARY. A hound cut out of yew on a knot of roots. Rounded leaf masses, a long muzzle, ears like clipped
// wings, the two eyes the only light on it; when it shivers the silhouette grows spikes of leaf.
export function bakeTopiary() {
  const W = 40, H = 32, X = 20, F = 29;
  const frame = (pose) => {
    const B = buf(W, H), r = rnd(11);
    const leaf = (x, y, rx, ry, bristle = 0) => { ball(B, x, y, rx, ry, LEAF, { bias: -0.05 }); if (bristle) for (let i = 0; i < 12; i++) { const a = r() * 6.3, d = (0.7 + r() * 0.3); dot(B, x + Math.cos(a) * (rx + bristle) * d, y + Math.sin(a) * (ry + bristle) * d, LEAF[2]); } };
    const lean = pose === 'lurchA' ? 3 : pose === 'lurchB' ? -2 : 0, bob = pose === 'lurchA' ? -2 : pose === 'lurchB' ? 1 : 0, br = pose === 'shiver' ? 2 : 0;
    /* the roots it stands on */
    limb(B, [X - 8, F - 3], [X + 6, F - 1], 3, ['#2a1a10', '#4a3020', '#6a4a2c']); limb(B, [X - 3, F - 4], [X + 8, F - 2], 3, ['#2a1a10', '#4a3020', '#6a4a2c']);
    /* haunches, body, chest: three leaf masses */
    leaf(X - 6 + lean, F - 12 + bob, 7, 7, br); leaf(X + 2 + lean, F - 13 + bob, 8, 6, br); leaf(X + 8 + lean, F - 12 + bob, 5, 5, br);
    /* legs: clipped stumps */
    limb(B, [X - 8 + lean, F - 8], [X - 9, F - 2], 3, LEAF); limb(B, [X - 3 + lean, F - 7], [X - 2, F - 2], 3, LEAF);
    limb(B, [X + 6 + lean, F - 8], [X + 5, F - 2], 3, LEAF); limb(B, [X + 10 + lean, F - 7], [X + 11, F - 2], 3, LEAF);
    /* the head: a long muzzle forward, two ears */
    const hx = X + 12 + lean + (pose === 'swipe' ? 2 : 0), hy = F - 17 + bob + (pose === 'swipeTell' ? -2 : 0);
    layer(B, T => { leaf.call(null, 0, 0, 0, 0); ball(T, hx, hy, 6, 5, LEAF, { bias: 0.05 }); limb(T, [hx + 3, hy + 1], [hx + 9, hy + 3], 4, LEAF); limb(T, [hx - 3, hy - 4], [hx - 5, hy - 9], 2, LEAF); limb(T, [hx + 1, hy - 4], [hx + 2, hy - 9], 2, LEAF);
      if (br) for (let i = 0; i < 6; i++) dot(T, hx - 6 + i * 2, hy - 6 - (i % 2) * 2, LEAF[3]); });
    /* the eyes: violet, and brighter in the tell */
    const ec = pose === 'shiver' || pose === 'swipeTell' ? VIOLET[3] : VIOLET[2];
    dot(B, hx + 1, hy - 1, ec); dot(B, hx + 2, hy - 1, ec); dot(B, hx + 4, hy - 1, ec);
    /* the claw: twigs forward off the near foreleg */
    if (pose === 'swipeTell') layer(B, T => { limb(T, [X + 6 + lean, F - 9], [X + 1, F - 15], 3, LEAF); for (let i = 0; i < 3; i++) seg(T, X + 1 - i, F - 15 - i * 2, X - 2 - i, F - 19 - i, '#6a4a2c'); });
    else if (pose === 'swipe') layer(B, T => { limb(T, [X + 6 + lean, F - 9], [X + 15, F - 6], 3, LEAF); for (let i = 0; i < 3; i++) seg(T, X + 15, F - 6 - i * 2, X + 19, F - 7 - i * 3, '#6a4a2c'); });
    if (pose === 'hurt') { for (let i = 0; i < 8; i++) B.del(X - 8 + i * 3, F - 16 + (i % 3) * 2); }
    floorCut(B, F);
    const c = toCanvas(B);
    if (pose === 'swipe') smear(c, X + 8, F - 9, 12, -40, 30, [LEAF[3], LEAF[2]]);
    if (pose === 'hurt') afterDots(c, [[X - 10, F - 20, LEAF[2]], [X - 12, F - 15, LEAF[3]], [X + 14, F - 22, LEAF[2]], [X - 6, F - 24, LEAF[3]], [X + 10, F - 26, LEAF[2]]]);
    if (pose === 'shiver') afterDots(c, [[X - 8, F - 22, LEAF[3]], [X + 4, F - 23, LEAF[3]], [X - 2, F - 24, LEAF[2]], [X + 9, F - 21, LEAF[3]]]);
    return c;
  };
  return pack(['still', 'shiver', 'lurchA', 'lurchB', 'swipeTell', 'swipe', 'hurt'].map(frame), X, F + 1, 16, 22);
}

// =====================================================================================================================
// THE ANIMATED ARMOUR. Plate with nothing in it: a barrel cuirass, pauldrons like bells, a great helm with a violet
// light where a face would be, gauntlets on a longsword. Slow, and it holds the sword high for a long beat.
export function bakeArmour() {
  const W = 40, H = 40, X = 20, F = 37;
  const frame = (pose) => {
    const B = buf(W, H);
    const step = pose === 'walkA' ? 2 : pose === 'walkB' ? -2 : 0, jolt = pose === 'hurt' ? -3 : 0;
    /* legs: greaves and sabatons */
    limb(B, [X - 4, F - 14], [X - 5 - step, F - 2], 4, STEEL); limb(B, [X + 3, F - 14], [X + 4 + step, F - 2], 4, STEEL);
    box(B, X - 8 - step, F - 3, 6, 3, STEEL); box(B, X + 2 + step, F - 3, 6, 3, STEEL);
    /* the cuirass and the faulds */
    ball(B, X + jolt, F - 21, 7, 8, STEEL, { bias: 0.05 }); box(B, X - 7 + jolt, F - 15, 14, 3, STEEL);
    seg(B, X - 6 + jolt, F - 24, X + 6 + jolt, F - 24, STEEL[3]); seg(B, X + jolt, F - 26, X + jolt, F - 15, STEEL[0]);
    /* pauldrons */
    layer(B, T => { ball(T, X - 8 + jolt, F - 25, 4, 3, STEEL); ball(T, X + 8 + jolt, F - 25, 4, 3, STEEL); });
    /* the helm: a bucket with a slot, the light behind it */
    layer(B, T => { ball(T, X + 1 + jolt, F - 32, 5, 6, STEEL, { bias: 0.08 }); box(T, X - 4 + jolt, F - 34, 10, 2, STEEL); });
    const lc = pose === 'swingTell' ? VIOLET[3] : VIOLET[2]; for (let i = 0; i < 4; i++) dot(B, X - 1 + i + jolt, F - 32, i === 1 || i === 2 ? lc : VIOLET[1]);
    /* the arm and the sword */
    const arm = (from, to, tip, blade) => layer(B, T => { limb(T, from, to, 4, STEEL); ball(T, to[0], to[1], 2.5, 2.5, STEEL); seg(T, to[0], to[1], tip[0], tip[1], (i, n) => i < 2 ? BRASS[1] : blade ? STEEL[3] : STEEL[2]); seg(T, to[0] + 1, to[1], tip[0] + 1, tip[1], STEEL[1]); });
    if (pose === 'swingTell') arm([X + 6 + jolt, F - 24], [X + 4, F - 36], [X + 7, F - 56], true);
    else if (pose === 'swing') arm([X + 6 + jolt, F - 24], [X + 12, F - 12], [X + 26, F - 4], true);
    else arm([X + 6 + jolt, F - 24], [X + 9 + step, F - 14], [X + 12 + step, F - 30], true);
    floorCut(B, F);
    const c = toCanvas(B);
    if (pose === 'swing') smear(c, X + 4, F - 24, 24, -70, 40, [STEEL[3], STEEL[2], VIOLET[2]]);
    if (pose === 'hurt') afterDots(c, [[X - 12, F - 30, STEEL[3]], [X + 14, F - 34, STEEL[2]], [X - 10, F - 20, STEEL[3]]]);
    return c;
  };
  return pack(['idle', 'walkA', 'walkB', 'swingTell', 'swing', 'hurt'].map(frame), X, F + 1, 12, 26);
}
export function bakePiece() {
  const W = 16, H = 12, X = 8, F = 9;
  const frame = (pose) => {
    const B = buf(W, H), k = pose === 'crawlB' ? 1 : 0;
    ball(B, X, F - 4, 4, 3, STEEL, { bias: 0.05 });
    for (let i = 0; i < 4; i++) limb(B, [X - 3 + i * 2, F - 3], [X - 4 + i * 2 + (i % 2 === k ? 2 : 0), F - 1], 1.5, STEEL);
    dot(B, X + 3, F - 5, VIOLET[2]);
    if (pose === 'hurt') B.del(X - 2, F - 6);
    floorCut(B, F); return toCanvas(B);
  };
  return pack(['crawlA', 'crawlB', 'hurt'].map(frame), X, F + 1, 8, 6);
}

// =====================================================================================================================
// THE BROOM. A besom flying handle-first with a bucket hooked over it, water slopping; the bristles beat like a tail.
export function bakeBroom() {
  const W = 28, H = 24, X = 14, F = 21;
  const WOOD = ['#3a2410', '#6a4420', '#9a6a34', '#c89a5c'], PAIL = ['#2a2e3a', '#4a5262', '#7a8494', '#b0bac8'];
  const frame = (pose) => {
    const B = buf(W, H), tilt = pose === 'dashTell' ? -0.5 : pose === 'dash' ? 0.25 : 0, fan = pose === 'flyB' || pose === 'dashTell' ? 2 : 0;
    const hx0 = X - 10, hy0 = F - 9 + (tilt > 0 ? -3 : tilt < 0 ? 4 : 0), hx1 = X + 8, hy1 = F - 9 + (tilt > 0 ? 3 : tilt < 0 ? -4 : 0);
    /* the bristles at the back */
    for (let i = -3; i <= 3; i++) seg(B, hx0 + 2, hy0, hx0 - 6 - (i % 2 ? 1 : 0), hy0 + i * (2 + fan) + (i > 0 ? 2 : 0), i === 0 ? WOOD[2] : WOOD[1]);
    /* the handle */
    limb(B, [hx0, hy0], [hx1, hy1], 3, WOOD);
    /* the bucket, hung from the handle by its handle */
    const bx = X + 2, by = (hy0 + hy1) / 2;
    seg(B, bx - 3, by + 2, bx, by - 1, PAIL[2]); seg(B, bx + 3, by + 2, bx, by - 1, PAIL[2]);
    layer(B, T => { box(T, bx - 4, by + 2, 8, 6, PAIL); box(T, bx - 4, by + 2, 8, 1, PAIL); for (let i = 0; i < 6; i++) dot(T, bx - 3 + i, by + 3, i % 2 ? '#8ac0ff' : '#d8ecff'); });
    if (pose === 'dash' || pose === 'flyA') { dot(B, bx - 5, by + 1, '#d8ecff'); dot(B, bx + 5, by, '#8ac0ff'); }
    if (pose === 'hurt') { B.del(bx, by + 4); B.del(bx + 1, by + 5); }
    floorCut(B, F);
    const c = toCanvas(B);
    if (pose === 'dash') smear(c, X - 2, by, 12, 150, 210, [WOOD[3], PAIL[3]]);
    if (pose === 'hurt') afterDots(c, [[bx - 6, by - 2, '#d8ecff'], [bx + 7, by - 3, '#8ac0ff'], [bx + 2, by - 5, '#d8ecff']]);
    return c;
  };
  return pack(['flyA', 'flyB', 'dashTell', 'dash', 'hurt'].map(frame), X, F + 1, 12, 10);
}

// =====================================================================================================================
// THE MIMIC. A banded oak chest with brass corners; open, the lid is a jaw of teeth and a tongue runs out of it.
export function bakeMimic() {
  const W = 28, H = 24, X = 14, F = 21;
  const OAK = ['#3a2410', '#6a4420', '#9a6a34', '#c89a5c'];
  const frame = (pose) => {
    const B = buf(W, H), open = pose === 'open' ? 4 : pose === 'biteTell' ? 8 : pose === 'hop' ? 3 : 0, hop = pose === 'hop' ? -3 : 0;
    /* the body of the chest */
    box(B, X - 8, F - 8 + hop, 16, 8, OAK); for (const bx of [X - 6, X + 4]) for (let y = F - 8 + hop; y < F + hop; y++) B.set(bx, y, BRASS[1]);
    dot(B, X - 8, F - 8 + hop, BRASS[2]); dot(B, X + 7, F - 8 + hop, BRASS[2]); dot(B, X - 8, F - 1 + hop, BRASS[0]); dot(B, X + 7, F - 1 + hop, BRASS[0]);
    if (open) { /* the mouth: dark inside, teeth on both edges, the tongue */
      for (let y = F - 8 + hop - open; y < F - 8 + hop; y++) for (let x = X - 8; x < X + 8; x++) B.set(x, y, '#2a0a1a');
      for (let x = X - 7; x < X + 8; x += 2) { dot(B, x, F - 8 + hop - open, '#f0f0e0'); dot(B, x, F - 9 + hop, '#f0f0e0'); }
      if (pose === 'biteTell') { limb(B, [X + 2, F - 9 + hop], [X + 9, F - 5 + hop], 3, ['#8a2a4a', '#d0406a', '#f08aa0']); dot(B, X + 10, F - 3, '#8ac0ff'); }
    }
    /* the lid: domed, banded */
    const ly = F - 8 + hop - open;
    layer(B, T => { for (let x = X - 8; x < X + 8; x++) for (let y = ly - 4; y < ly; y++) if (y > ly - 4 || (x > X - 7 && x < X + 7)) T.set(x, y, y === ly - 4 || y === ly - 3 && (x === X - 7 || x === X + 6) ? OAK[2] : OAK[1]); for (const bx of [X - 6, X + 4]) for (let y = ly - 4; y < ly; y++) T.set(bx, y, BRASS[1]); dot(T, X, ly - 2, BRASS[2]); });
    if (pose === 'bite') { for (let x = X - 7; x < X + 8; x += 2) dot(B, x, F - 8 + hop, '#f0f0e0'); }
    if (open) { dot(B, X - 4, ly + 1, VIOLET[3]); dot(B, X + 3, ly + 1, VIOLET[3]); }   /* two eyes in the dark of it */
    if (pose === 'hurt') { B.del(X - 2, F - 5); B.del(X + 1, F - 4); }
    floorCut(B, F);
    const c = toCanvas(B);
    if (pose === 'bite') smear(c, X + 6, F - 8, 8, -60, 20, ['#f0f0e0', OAK[3]]);
    if (pose === 'hurt') afterDots(c, [[X - 10, F - 12, OAK[3]], [X + 11, F - 14, BRASS[2]], [X + 2, F - 15, OAK[2]]]);
    return c;
  };
  return pack(['shut', 'open', 'biteTell', 'bite', 'hop', 'hurt'].map(frame), X, F + 1, 16, 12);
}

// =====================================================================================================================
// THE IMP. Red-violet skin, a paunch, bat wings, two horns, a tail; a flame cupped in one hand. It hovers a little off
// the floor and hunches into its own smoke before it hops.
export function bakeImp() {
  const W = 24, H = 26, X = 12, F = 23;
  const IMP = ['#4a1030', '#8a2a5a', '#c04a7a', '#f090b0'];
  const frame = (pose) => {
    const B = buf(W, H), up = pose === 'hoverB' ? 1 : 0, hunch = pose === 'puff' ? 3 : 0;
    const bx = X, by = F - 9 + up + hunch;
    /* wings, behind */
    const wl = pose === 'hoverB' || pose === 'throw' ? -6 : -3;
    poly(B, [[bx - 3, by - 4], [bx - 10, by + wl], [bx - 9, by + 1]], IMP[0]); poly(B, [[bx + 3, by - 4], [bx + 10, by + wl], [bx + 9, by + 1]], IMP[0]);
    /* tail */
    seg(B, bx - 2, by + 4, bx - 7, by + 8, IMP[1]); dot(B, bx - 8, by + 8, IMP[2]);
    /* body, legs, head, horns */
    ball(B, bx, by + 1, 4, 5 - hunch * 0.5, IMP, { bias: 0.05 });
    limb(B, [bx - 2, by + 4], [bx - 3, by + 8], 2, IMP); limb(B, [bx + 2, by + 4], [bx + 3, by + 8], 2, IMP);
    layer(B, T => { ball(T, bx, by - 6 + hunch, 4, 3.5, IMP, { bias: 0.1 }); seg(T, bx - 3, by - 8 + hunch, bx - 4, by - 11 + hunch, BRASS[2]); seg(T, bx + 3, by - 8 + hunch, bx + 4, by - 11 + hunch, BRASS[2]); });
    dot(B, bx - 1, by - 6 + hunch, '#ffe080'); dot(B, bx + 2, by - 6 + hunch, '#ffe080'); seg(B, bx - 1, by - 4 + hunch, bx + 2, by - 4 + hunch, IMP[0]);
    /* the arm and the fire */
    const FIRE = ['#ff6b2c', '#ffa040', '#ffe080'];
    if (pose === 'throwTell') { limb(B, [bx + 3, by - 1], [bx + 1, by - 12], 2, IMP); layer(B, T => ball(T, bx + 1, by - 15, 3, 3, FIRE, { flat: true })); }
    else if (pose === 'throw') { limb(B, [bx + 3, by - 1], [bx + 10, by - 3], 2, IMP); }
    else if (pose !== 'puff') { limb(B, [bx + 3, by], [bx + 7, by + 2], 2, IMP); layer(B, T => ball(T, bx + 8, by + 1, 2, 2.5, FIRE, { flat: true })); }
    if (pose === 'hurt') { B.del(bx, by); B.del(bx + 1, by + 2); }
    floorCut(B, F);
    const c = toCanvas(B);
    if (pose === 'puff') afterDots(c, [[bx - 6, by - 10, VIOLET[2]], [bx + 6, by - 9, VIOLET[3]], [bx - 8, by - 4, VIOLET[1]], [bx + 8, by - 3, VIOLET[2]], [bx, by - 13, VIOLET[3]], [bx - 3, by + 7, VIOLET[2]]]);
    if (pose === 'throw') afterDots(c, [[bx + 11, by - 5, FIRE[1]], [bx + 12, by - 4, FIRE[2]], [bx + 10, by - 7, FIRE[0]]]);
    if (pose === 'hurt') afterDots(c, [[bx - 7, by - 12, IMP[3]], [bx + 7, by - 13, IMP[2]]]);
    return c;
  };
  return pack(['hoverA', 'hoverB', 'throwTell', 'throw', 'puff', 'hurt'].map(frame), X, F + 1, 10, 12);
}

// =====================================================================================================================
// THE ARCANE TURRET. A brass sphere on a tripod with one glass eye, which is the barrel; it brightens for a beat and spits
// a slow orb. Still, so it is placed on a plinth or hung under a ceiling (drawn turned over).
export function bakeTurret() {
  const W = 24, H = 24, X = 12, F = 21;
  const frame = (pose) => {
    const B = buf(W, H), rec = pose === 'fire' ? -2 : 0;
    for (const dx of [-5, 0, 5]) limb(B, [X + dx * 0.4, F - 8], [X + dx, F - 1], 2, BRASS);
    box(B, X - 7, F - 2, 14, 2, BRASS);
    layer(B, T => { ball(T, X + rec, F - 12, 6, 6, BRASS, { bias: 0.02 }); seg(T, X - 5 + rec, F - 12, X + 5 + rec, F - 12, BRASS[0]); });
    /* the eye: glass, a violet pupil, hot in the tell */
    const ec = pose === 'chargeTell' ? ['#b07cf0', '#e0c8ff', '#ffffff'] : pose === 'fire' ? ['#7a3fbf', '#b07cf0', '#e0c8ff'] : ['#2a1040', '#7a3fbf', '#b07cf0'];
    layer(B, T => { ball(T, X + 3 + rec, F - 12, 3, 3, ec, { flat: true }); });
    dot(B, X + 4 + rec, F - 13, '#ffffff');
    if (pose === 'hurt') { B.del(X - 2, F - 14); B.del(X - 1, F - 15); }
    floorCut(B, F);
    const c = toCanvas(B);
    if (pose === 'fire') afterDots(c, [[X + 8, F - 12, VIOLET[3]], [X + 9, F - 13, VIOLET[2]], [X + 9, F - 11, VIOLET[2]]]);
    if (pose === 'chargeTell') afterDots(c, [[X + 8, F - 15, VIOLET[3]], [X + 8, F - 9, VIOLET[3]], [X + 10, F - 12, VIOLET[2]]]);
    return c;
  };
  return pack(['idle', 'chargeTell', 'fire', 'hurt'].map(frame), X, F + 1, 12, 14);
}

// =====================================================================================================================
// THE HOMUNCULUS. A pale, big-headed little man grown in a jar, the glass bell still on its head like a hat, a stitched
// smile, black button eyes. Each trick borrows a form's silhouette: ears and a tail; wings; stone fists.
export function bakeHomunculus() {
  const W = 48, H = 40, X = 24, F = 37;
  const GLASS = ['#4a6a8a', '#8ab0c8', '#c8e8f0', '#ffffff'];
  const frame = (pose) => {
    const B = buf(W, H);
    const step = pose === 'walkA' ? 2 : pose === 'walkB' ? -2 : 0, low = pose === 'mouseTell' || pose === 'scurry' || pose === 'spent' ? 6 : 0, big = pose === 'golemTell' || pose === 'slam' ? 1 : 0;
    const bx = X + (pose === 'scurry' ? 3 : 0), by = F - 12 + low;
    /* legs */
    if (low && pose !== 'spent') { limb(B, [bx - 4, by + 4], [bx - 8, by + 8], 3, SKIN); limb(B, [bx + 4, by + 4], [bx + 8, by + 8], 3, SKIN); }
    else if (pose === 'spent') { limb(B, [bx - 3, by + 3], [bx - 7, by + 8], 3, SKIN); limb(B, [bx + 3, by + 3], [bx + 7, by + 8], 3, SKIN); }
    else { limb(B, [bx - 3, by + 4], [bx - 4 - step, by + 10], 3, SKIN); limb(B, [bx + 3, by + 4], [bx + 4 + step, by + 10], 3, SKIN); }
    /* body */
    ball(B, bx, by, 5 + big, 6 - low * 0.3, SKIN, { bias: 0.04 });
    for (let i = 0; i < 3; i++) dot(B, bx - 1 + i, by + 2, '#8a5a6a');   /* the stitches */
    /* arms: by pose */
    const ARM = big ? ['#3a3430', '#6a6058', '#9a9088', '#c8c0b8'] : SKIN;
    if (pose === 'swipeTell') { limb(B, [bx + 4, by - 2], [bx + 2, by - 12], 3, ARM); limb(B, [bx - 4, by - 1], [bx - 7, by + 3], 3, ARM); }
    else if (pose === 'swipe') { limb(B, [bx + 4, by - 2], [bx + 14, by + 2], 3, ARM); limb(B, [bx - 4, by - 1], [bx - 7, by + 3], 3, ARM); }
    else if (pose === 'golemTell') { limb(B, [bx + 5, by - 2], [bx + 9, by - 12], 4, ARM); limb(B, [bx - 5, by - 2], [bx - 9, by - 12], 4, ARM); ball(B, bx + 9, by - 13, 3, 3, ARM); ball(B, bx - 9, by - 13, 3, 3, ARM); }
    else if (pose === 'slam') { limb(B, [bx + 5, by - 1], [bx + 10, by + 8], 4, ARM); limb(B, [bx - 5, by - 1], [bx - 10, by + 8], 4, ARM); ball(B, bx + 10, by + 8, 3, 2.5, ARM); ball(B, bx - 10, by + 8, 3, 2.5, ARM); }
    else if (pose === 'batTell' || pose === 'dive') { const wu = pose === 'batTell' ? -12 : 4; poly(B, [[bx - 3, by - 3], [bx - 16, by + wu], [bx - 12, by + 3]], VIOLET[0]); poly(B, [[bx + 3, by - 3], [bx + 16, by + wu], [bx + 12, by + 3]], VIOLET[0]); limb(B, [bx + 4, by - 1], [bx + 6, by + 4], 3, SKIN); limb(B, [bx - 4, by - 1], [bx - 6, by + 4], 3, SKIN); }
    else if (low) { limb(B, [bx + 4, by], [bx + 8, by + 6], 3, SKIN); limb(B, [bx - 4, by], [bx - 8, by + 6], 3, SKIN); }
    else { limb(B, [bx + 4, by - 1], [bx + 6 + step, by + 5], 3, SKIN); limb(B, [bx - 4, by - 1], [bx - 6 - step, by + 5], 3, SKIN); }
    /* the head, and the bell jar on it */
    const hy = by - 10 + (low ? 3 : 0) + (pose === 'spent' ? 2 : 0);
    layer(B, T => { ball(T, bx, hy, 6, 5.5, SKIN, { bias: 0.08 }); });
    dot(B, bx + 1, hy - 1, '#1b1626'); dot(B, bx + 4, hy - 1, '#1b1626'); for (let i = 0; i < 4; i++) dot(B, bx + i, hy + 2, i % 2 ? '#8a5a6a' : '#5a3040');
    if (pose === 'mouseTell' || pose === 'scurry') { limb(B, [bx - 3, hy - 5], [bx - 5, hy - 9], 2, SKIN); limb(B, [bx + 3, hy - 5], [bx + 5, hy - 9], 2, SKIN); seg(B, bx - 5, by + 2, bx - 12, by - 2, SKIN[1]); }
    layer(B, T => { for (let y = hy - 9; y <= hy - 5; y++) for (let x = bx - 5; x <= bx + 5; x++) if ((x - bx) * (x - bx) / 30 + (y - hy + 7) * (y - hy + 7) / 6 <= 1) T.set(x, y, y === hy - 9 ? GLASS[3] : x === bx - 5 || x === bx + 5 ? GLASS[0] : GLASS[1]); seg(T, bx - 5, hy - 5, bx + 5, hy - 5, GLASS[2]); });
    if (pose === 'hurt') { B.del(bx - 1, by); B.del(bx + 2, by + 1); }
    floorCut(B, F);
    const c = toCanvas(B);
    if (pose === 'swipe') smear(c, bx + 4, by - 2, 14, -50, 30, [SKIN[3], SKIN[2]]);
    if (pose === 'slam') afterDots(c, [[bx - 14, by + 6, '#c8c0b8'], [bx + 14, by + 6, '#c8c0b8'], [bx - 15, by + 3, '#9a9088'], [bx + 15, by + 3, '#9a9088']]);
    if (pose === 'spent') afterDots(c, [[bx + 8, hy - 4, GLASS[2]], [bx + 10, hy - 7, GLASS[3]], [bx + 9, hy - 10, GLASS[2]]]);
    if (pose === 'hurt') afterDots(c, [[bx - 9, hy - 6, SKIN[3]], [bx + 9, hy - 8, SKIN[2]]]);
    return c;
  };
  return pack(['idle', 'walkA', 'walkB', 'swipeTell', 'swipe', 'mouseTell', 'scurry', 'batTell', 'dive', 'golemTell', 'slam', 'spent', 'hurt'].map(frame), X, F + 1, 14, 22);
}
export const HOMUNCULUS_F = { idle: 0, walk: [1, 2], swipeTell: 3, swipe: 4, mouseTell: 5, scurry: 6, batTell: 7, dive: 8, golemTell: 9, slam: 10, spent: 11, hurt: 12 };

// =====================================================================================================================
// THE ARCHMAGE. Tall and thin in a violet robe that does not quite reach the floor, a pointed hat gone soft, a long
// white beard, a brass staff with a glass at the top. He drifts rather than walks; the robe hem trails smoke.
export function bakeArchmage() {
  const W = 48, H = 52, X = 24, F = 49;
  const ROBE = ['#2a1040', '#4a2a7a', '#7a4ab8', '#a880e0'], BEARD = ['#8a8a9a', '#c8c8d8', '#f0f0f8', '#ffffff'];
  const frame = (pose) => {
    const B = buf(W, H);
    const dead = pose === 'dead', bend = pose === 'open' ? 6 : 0, drift = pose === 'drift' ? -2 : 0, blink = pose === 'blink';
    if (dead) { /* fallen across the floor, the hat off */
      limb(B, [X - 14, F - 4], [X + 8, F - 3], 8, ROBE); ball(B, X + 11, F - 5, 5, 4, SKIN, { bias: 0.1 }); limb(B, [X + 8, F - 4], [X + 18, F - 2], 3, BEARD);
      poly(B, [[X - 22, F - 1], [X - 16, F - 12], [X - 10, F - 1]], ROBE[1]); seg(B, X + 4, F - 12, X + 20, F - 8, BRASS[1]);
      floorCut(B, F); return toCanvas(B);
    }
    const bx = X, by = F - 22 + drift;
    /* the robe: a long taper to the hem, smoke where the feet would be */
    poly(B, [[bx - 5, by - 6 + bend], [bx + 5, by - 6 + bend], [bx + 10, F - 2], [bx - 10, F - 2]], (x, y) => x < bx - 3 ? ROBE[0] : x > bx + 4 ? ROBE[2] : ROBE[1]);
    for (let i = 0; i < 6; i++) seg(B, bx - 8 + i * 3, F - 4, bx - 9 + i * 3, F - 1, ROBE[0]);
    /* sleeves and hands */
    const ARMC = ROBE;
    if (pose === 'boltTell') { limb(B, [bx + 4, by - 2 + bend], [bx + 6, by - 18], 5, ARMC); ball(B, bx + 6, by - 19, 2, 2, SKIN); }
    else if (pose === 'rendTell') { limb(B, [bx + 4, by - 2], [bx + 10, by + 8], 5, ARMC); ball(B, bx + 11, by + 9, 2, 2, SKIN); }
    else if (pose === 'shield') { limb(B, [bx + 5, by - 2], [bx - 4, by + 2], 5, ARMC); limb(B, [bx - 5, by - 2], [bx + 4, by + 2], 5, ARMC); }
    else if (pose === 'open') { limb(B, [bx + 4, by + 4], [bx + 9, by + 12], 5, ARMC); limb(B, [bx - 4, by + 4], [bx - 8, by + 12], 5, ARMC); }
    else { limb(B, [bx + 4, by - 2], [bx + 9, by + 6], 5, ARMC); ball(B, bx + 10, by + 7, 2, 2, SKIN); }
    /* the staff, unless dropped */
    if (pose !== 'open') { const sx = pose === 'boltTell' ? bx + 7 : pose === 'rendTell' ? bx + 12 : pose === 'bolt' ? bx + 12 : bx + 10, sy0 = pose === 'boltTell' ? by - 36 : pose === 'rendTell' || pose === 'rend' ? by - 4 : by - 20, sy1 = pose === 'boltTell' ? by - 4 : pose === 'rendTell' || pose === 'rend' ? F - 1 : F - 4;
      layer(B, T => { seg(T, sx, sy0, sx, sy1, BRASS[1]); seg(T, sx + 1, sy0, sx + 1, sy1, BRASS[0]); ball(T, sx, sy0 - 2, 3, 3, pose === 'boltTell' || pose === 'bolt' ? ['#7a3fbf', '#e0c8ff', '#ffffff'] : pose === 'rendTell' || pose === 'rend' ? ['#7a1020', '#ff6b6b', '#ffd0d0'] : VIOLET, { flat: true }); }); }
    else { seg(B, bx - 12, F - 3, bx + 14, F - 6, BRASS[1]); ball(B, bx + 15, F - 7, 3, 3, VIOLET, { flat: true }); }
    /* the head: beard, face, the hat */
    const hy = by - 12 + bend * 1.5;
    layer(B, T => { poly(T, [[bx - 4, hy + 2], [bx + 5, hy + 2], [bx + 2, hy + 16 + bend], [bx - 3, hy + 14 + bend]], (x, y) => (x + y) % 3 ? BEARD[1] : BEARD[2]); ball(T, bx + 1, hy, 4, 4.5, SKIN, { bias: 0.1 }); });
    dot(B, bx + 2, hy - 1, blink ? VIOLET[3] : '#1b1626'); dot(B, bx + 4, hy - 1, blink ? VIOLET[3] : '#1b1626'); seg(B, bx, hy + 1, bx + 5, hy + 1, BEARD[0]);
    layer(B, T => { poly(T, [[bx - 7, hy - 3], [bx + 8, hy - 3], [bx + 6, hy - 5], [bx, hy - 24], [bx - 3, hy - 5]], (x, y) => x < bx - 1 ? ROBE[0] : ROBE[1]); seg(T, bx - 7, hy - 3, bx + 8, hy - 3, ROBE[2]); dot(T, bx + 1, hy - 14, BRASS[2]); dot(T, bx - 1, hy - 9, BRASS[2]); });
    if (pose === 'hurt') { B.del(bx, by); B.del(bx + 1, by + 3); B.del(bx - 2, by + 6); }
    floorCut(B, F);
    const c = toCanvas(B);
    if (blink) afterDots(c, [[bx - 10, F - 6, VIOLET[2]], [bx + 12, F - 8, VIOLET[3]], [bx - 12, by, VIOLET[1]], [bx + 13, by - 4, VIOLET[2]], [bx - 8, hy - 18, VIOLET[3]], [bx + 10, hy - 20, VIOLET[2]]]);
    if (pose === 'bolt') afterDots(c, [[bx + 16, by - 24, VIOLET[3]], [bx + 15, by - 20, VIOLET[2]], [bx + 17, by - 27, '#ffffff']]);
    if (pose === 'rend') afterDots(c, [[bx + 16, F - 3, '#ff6b6b'], [bx + 18, F - 5, '#ffd0d0'], [bx + 20, F - 3, '#ff6b6b']]);
    if (pose === 'hurt') afterDots(c, [[bx - 10, by - 6, ROBE[3]], [bx + 12, by - 8, ROBE[2]], [bx + 2, hy - 26, BRASS[2]]]);
    return c;
  };
  return pack(['idle', 'drift', 'blink', 'boltTell', 'bolt', 'rendTell', 'rend', 'shield', 'open', 'hurt', 'dead'].map(frame), X, F + 1, 16, 34);
}
export const ARCHMAGE_F = { idle: 0, drift: 1, blink: 2, boltTell: 3, bolt: 4, rendTell: 5, rend: 6, shield: 7, open: 8, hurt: 9, dead: 10 };

// =====================================================================================================================
// THE FAMILIAR UNBOUND. His cat, grown into a hill: a round grey body, forelegs like columns, a huge head with ONE great
// violet eye (the other lost to the growing), a torn ear, a mouth with the mage's boots and staff-end sticking out of it.
export function bakeFamiliar() {
  const W = 112, H = 96, X = 56, F = 93;
  const FUR = ['#2a2436', '#4a4260', '#726a8a', '#a09ab8'];
  const frame = (pose) => {
    const B = buf(W, H);
    const rear = pose === 'slamTell' ? -14 : 0, down = pose === 'open' ? 22 : pose === 'slam' ? 6 : 0, dead = pose === 'dead';
    if (dead) { ball(B, X, F - 22, 44, 22, FUR, { bias: -0.05 }); ball(B, X + 24, F - 30, 22, 18, FUR, { bias: 0.02 }); dot(B, X + 30, F - 34, '#1b1626'); seg(B, X + 26, F - 36, X + 34, F - 32, '#1b1626'); seg(B, X + 44, F - 22, X + 54, F - 20, BRASS[1]); floorCut(B, F); return toCanvas(B); }
    /* the body: a great haunch behind, a chest forward */
    ball(B, X - 18, F - 30 + rear * 0.3, 30, 28, FUR, { bias: -0.05 });
    ball(B, X + 8, F - 36 + rear, 26, 24, FUR, { bias: 0.02 });
    /* the tail */
    for (let i = 0; i < 6; i++) limb(B, [X - 44 + i * 3, F - 40 + Math.sin(i) * 6], [X - 41 + i * 3, F - 40 + Math.sin(i + 1) * 6], 5 - i * 0.5, FUR);
    /* the forelegs: pillars */
    const pawUp = pose === 'swipeTell' ? -30 : pose === 'swipe' ? 6 : pose === 'slamTell' ? -34 : 0;
    limb(B, [X - 4, F - 26 + rear], [X - 8, F - 4], 12, FUR); ball(B, X - 8, F - 4, 9, 4, FUR);
    layer(B, T => { limb(T, [X + 18, F - 24 + rear], [X + 30 + (pose === 'swipe' ? 14 : 0), F - 4 + pawUp], 12, FUR); ball(T, X + 30 + (pose === 'swipe' ? 14 : 0), F - 4 + pawUp, 9, 4, FUR); for (let i = 0; i < 4; i++) dot(T, X + 24 + i * 4 + (pose === 'swipe' ? 14 : 0), F - 2 + pawUp, '#e0e6f0'); });
    /* the head: forward and up, or down on the floor when it is open */
    const hx = X + 26, hy = F - 54 + rear + down;
    layer(B, T => { ball(T, hx, hy, 24, 20, FUR, { bias: 0.06 }); poly(T, [[hx - 16, hy - 14], [hx - 8, hy - 30], [hx - 2, hy - 16]], FUR[1]); poly(T, [[hx + 6, hy - 16], [hx + 14, hy - 26], [hx + 18, hy - 12]], FUR[1]); dot(T, hx + 16, hy - 20, OUT); });
    /* the eye, the size of a shield */
    const EYE = pose === 'open' ? ['#7a3fbf', '#e0c8ff', '#ffffff'] : pose === 'spitTell' || pose === 'swipeTell' || pose === 'slamTell' ? ['#3a1c5a', '#b07cf0', '#e0c8ff'] : ['#2a1040', '#7a3fbf', '#b07cf0'];
    layer(B, T => { ball(T, hx + 4, hy - 4, 8, 7, EYE, { flat: true }); ball(T, hx + 6, hy - 4, 2, 5, ['#1b1626', '#1b1626', '#1b1626'], { flat: true }); dot(T, hx + 2, hy - 8, '#ffffff'); });
    dot(B, hx - 8, hy - 3, '#1b1626'); dot(B, hx - 9, hy - 3, '#1b1626');   /* the scar where the other was */
    /* the mouth: the mage's boots and the end of his staff sticking out of it */
    const my = hy + 12;
    seg(B, hx - 10, my, hx + 14, my, '#1b1626');
    for (let i = 0; i < 6; i++) dot(B, hx - 8 + i * 4, my + 1, '#e8e8e0');
    if (pose === 'spitTell') { ball(B, hx - 8, my - 4, 8, 7, FUR); ball(B, hx + 14, my - 4, 6, 6, FUR); }
    layer(B, T => { limb(T, [hx + 2, my + 2], [hx + 4, my + 12], 4, ['#2a1a10', '#4a3020', '#6a4a2c']); limb(T, [hx + 8, my + 2], [hx + 11, my + 11], 4, ['#2a1a10', '#4a3020', '#6a4a2c']); seg(T, hx - 4, my + 3, hx - 10, my + 14, BRASS[1]); ball(T, hx - 11, my + 15, 3, 3, VIOLET, { flat: true }); });
    if (pose === 'hurt') { B.del(hx - 2, hy + 2); B.del(hx + 10, hy + 4); }
    floorCut(B, F);
    const c = toCanvas(B);
    if (pose === 'swipe') smear(c, X + 24, F - 20, 30, -80, 20, ['#e0e6f0', FUR[3], FUR[2]]);
    if (pose === 'slam') afterDots(c, [[X - 30, F - 6, '#a09ab8'], [X + 60, F - 6, '#a09ab8'], [X - 34, F - 10, '#726a8a'], [X + 64, F - 10, '#726a8a']]);
    if (pose === 'spit') afterDots(c, [[hx + 26, my - 6, VIOLET[3]], [hx + 30, my - 8, VIOLET[2]], [hx + 28, my - 3, VIOLET[2]]]);
    return c;
  };
  return pack(['idle', 'swipeTell', 'swipe', 'slamTell', 'slam', 'spitTell', 'spit', 'open', 'dead', 'hurt'].map(frame), X, F + 1, 56, 60);
}
export const FAMILIAR_F = { idle: 0, swipeTell: 1, swipe: 2, slamTell: 3, slam: 4, spitTell: 5, spit: 6, open: 7, dead: 8, hurt: 9 };

// =====================================================================================================================
// THE APPRENTICE. A boy in a violet robe with the sleeves rolled, a satchel, hair in his eyes.
export function bakeApprentice() {
  const W = 20, H = 28, X = 10, F = 25;
  const ROBE = ['#2a1040', '#4a2a7a', '#7a4ab8', '#a880e0'];
  const frame = (k) => {
    const B = buf(W, H);
    poly(B, [[X - 3, F - 16], [X + 3, F - 16], [X + 5, F - 1], [X - 5, F - 1]], (x) => x < X - 1 ? ROBE[0] : x > X + 2 ? ROBE[2] : ROBE[1]);
    limb(B, [X + 3, F - 14], [X + 6, F - 8 + k], 3, ROBE); ball(B, X + 6, F - 7 + k, 1.5, 1.5, SKIN);
    box(B, X - 6, F - 9, 5, 4, ['#3a2410', '#6a4420', '#9a6a34']);
    layer(B, T => { ball(T, X, F - 20, 4, 4, SKIN, { bias: 0.1 }); poly(T, [[X - 5, F - 21], [X + 5, F - 22], [X + 3, F - 25], [X - 4, F - 24]], '#4a3020'); });
    dot(B, X + 1, F - 20, '#1b1626'); dot(B, X + 3, F - 20, '#1b1626');
    floorCut(B, F); return toCanvas(B);
  };
  return pack([frame(0), frame(1)], X, F + 1, 10, 22);
}

// =====================================================================================================================
// THE THREE FORMS. Small, and each one wears its font's colour so it can never be mistaken for a creature of the tower.
export function bakeForms() {
  const M = FORM_COL.mouse, Bc = FORM_COL.bat, Gc = FORM_COL.golem;
  const mouse = (() => { const W = 14, H = 10, X = 7, F = 7;
    const frame = (pose) => { const B = buf(W, H), k = pose === 'runA' ? 1 : pose === 'runB' ? -1 : 0;
      ball(B, X, F - 3, 5, 3, M, { bias: 0.05 }); ball(B, X + 4, F - 4, 2.5, 2, M, { bias: 0.1 }); dot(B, X + 6, F - 4, '#1b1626'); dot(B, X + 3, F - 6, M[2]); dot(B, X + 5, F - 7, M[2]);
      seg(B, X - 5, F - 3, X - 9 + k, F - 6 - k, M[1]); for (let i = 0; i < 3; i++) dot(B, X - 3 + i * 3 + k, F - 1, M[0]);
      if (pose === 'hurt') B.del(X, F - 3);
      floorCut(B, F); return toCanvas(B); };
    return pack(['idle', 'runA', 'runB', 'hurt'].map(frame), X, F + 1, 6, 6); })();
  const bat = (() => { const W = 20, H = 14, X = 10, F = 11;
    const frame = (pose) => { const B = buf(W, H), up = pose === 'flapA' ? -4 : pose === 'flapB' ? 3 : pose === 'glide' ? 0 : pose === 'hang' ? 6 : 0;
      const by = pose === 'hang' ? F - 5 : F - 6;
      if (pose === 'hang') { poly(B, [[X - 2, by - 4], [X - 7, by + 6], [X - 3, by + 4]], Bc[0]); poly(B, [[X + 2, by - 4], [X + 7, by + 6], [X + 3, by + 4]], Bc[0]); }
      else { poly(B, [[X - 2, by], [X - 10, by + up], [X - 6, by + 4]], Bc[0]); poly(B, [[X + 2, by], [X + 10, by + up], [X + 6, by + 4]], Bc[0]); seg(B, X - 2, by, X - 9, by + up, Bc[2]); seg(B, X + 2, by, X + 9, by + up, Bc[2]); }
      ball(B, X, by + 1, 3, 3.5, Bc, { bias: 0.05 }); dot(B, X - 1, by, '#ffe080'); dot(B, X + 1, by, '#ffe080'); dot(B, X - 2, by - 3, Bc[2]); dot(B, X + 2, by - 3, Bc[2]);
      if (pose === 'hurt') B.del(X, by + 2);
      floorCut(B, F); return toCanvas(B); };
    return pack(['flapA', 'flapB', 'hang', 'glide', 'hurt'].map(frame), X, F + 1, 8, 8); })();
  const golem = (() => { const W = 28, H = 26, X = 14, F = 23;
    const STONE = ['#4a3420', '#8a6234', '#c0904c', '#f0c070'];
    const frame = (pose) => { const B = buf(W, H), step = pose === 'walkA' ? 2 : pose === 'walkB' ? -2 : 0;
      limb(B, [X - 4, F - 8], [X - 5 - step, F - 1], 5, STONE); limb(B, [X + 4, F - 8], [X + 5 + step, F - 1], 5, STONE);
      ball(B, X, F - 13, 8, 7, STONE, { bias: 0.02 }); seg(B, X - 4, F - 12, X + 2, F - 10, STONE[0]); dot(B, X + 3, F - 15, STONE[3]);
      if (pose === 'swing') { limb(B, [X + 6, F - 15], [X + 13, F - 8], 5, STONE); ball(B, X + 13, F - 7, 3, 3, STONE); }
      else { limb(B, [X + 6, F - 15], [X + 9 + step, F - 6], 5, STONE); ball(B, X + 9 + step, F - 5, 3, 3, STONE); }
      limb(B, [X - 6, F - 15], [X - 9 - step, F - 6], 5, STONE); ball(B, X - 9 - step, F - 5, 3, 3, STONE);
      layer(B, T => { ball(T, X + 1, F - 20, 4, 3.5, STONE, { bias: 0.08 }); }); dot(B, X + 1, F - 20, Gc[2]); dot(B, X + 3, F - 20, Gc[2]);
      if (pose === 'hurt') { B.del(X - 2, F - 13); B.del(X + 1, F - 11); }
      floorCut(B, F); const c = toCanvas(B); if (pose === 'swing') smear(c, X + 6, F - 14, 12, -30, 60, [Gc[3], Gc[2]]); return c; };
    return pack(['idle', 'walkA', 'walkB', 'swing', 'hurt'].map(frame), X, F + 1, 14, 18); })();
  return { mouse, bat, golem };
}
