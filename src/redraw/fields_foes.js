// fields_foes.js — THE HEXED FIELDS: the haunted farm at dusk and then at night under a blue moon, and what walks it.
// A new baker, not a redraw. Everything is rasterised into a colour buffer (one hex string a pixel), lit from the upper
// left with 3-4 tone ramps, parts that cross the body laid with an inner edge (layer()), then the OUT outline - so every
// creature reads as a SHAPE against a dark blue-grey night: a dark rim, bright/mid body tones, one bright eye or lamp pixel.
// GHOST-GREEN ('#1f6a3a' '#3fbf5f' '#7dff8a' '#d8ffd0') is for INTERACTIVE things: of the foes only the marshlight wears it
// (it is struck to light the way). Ghosts are pale moon-blue, never green.
// All frames face RIGHT (L is the flip) and every frame of one baker shares one canvas, so the anchor holds. HURT is LAST.
//
// bakeScarecrow()   THE SCARECROW (regular foe) — a sack head with stitched X eyes glinting amber, a crooked stitched grin,
//   a battered straw hat, a patched moth-eaten red-brown coat, straw out of the cuffs and collar, a rope belt, one leg a
//   wooden peg and one a stuffed trouser leg, a rusty sickle.
//   frames: 0 still A   1 still B (head tilted)   2 TWITCH (the tell: head jerked, straw bristling, arms jolted)
//           3 lurch A (leaning into a hop, peg forward)   4 lurch B (landing)   5 SWIPE TELL (sickle drawn back high)
//           6 swipe (sickle through low-forward, smear)   7 hurt (LAST: knocked back, straw spraying)
//   canvas 36x32   anchor ax 18, ay 30 (the outline row under the feet)   pack w/h 12x22
//
// bakeRook()        A FIELD ROOK (small flock bird, pogo-able) — slate blue-black with a pale grey-blue wing edge, a pale bill
//   and a bright eye.
//   frames: 0 perched   1 peck (head down)   2 wings up   3 wings down   4 DIVE TELL (wings high, head cocked down, beak open)
//           5 dive (tucked, beak forward-down)   6 hurt (LAST: feathers out)
//   canvas 22x18   anchor ax 11, ay 16 (perched feet outline row)   pack w/h 10x7
//
// bakeFarmhand()    A GHOST FARMHAND — a pale moon-blue labourer, hollow eyes with a white pinprick, flat cap, rolled sleeves,
//   braces, a wisp for legs, a hoe in both hands and a warm amber lantern hanging off his belt.
//   frames: 0 drift A   1 drift B (tail swirled)   2 SWING TELL (hoe high overhead, mouth open)   3 swing (hoe down to the floor)
//           4 fade (thin, half-dissolved: passing through walls)   5 hurt (LAST)
//   canvas 40x38   anchor ax 20, ay 36 (the wisp tail's lowest outline row)   pack w/h 12x22
//
// bakePumpkin()     A PUMPKIN LURKER
//   frames: 0 hidden (an ordinary pumpkin, stem and curled leaf)   1 PUFF TELL (lid lifted a crack, yellow slits, spores)
//           2 burst (up on vine legs, lid off, jagged glowing mouth)   3 bite (lunged, mouth snapped)   4 walk A   5 walk B
//           6 hurt (LAST: cracked, pulp)
//   canvas 28x30   anchor ax 13, ay 28 (every frame on that row)   pack w/h 14x12 (burst body is 14x18)
//
// bakeMarshlight()  A WILL-O'-THE-WISP (floater) — a ghost-green flame orb, brighter core, trailing flicker tail, dark eye dots.
//   frames: 0 1 2 3 flicker   4 FLARE TELL (swollen, white-green)   5 hurt (LAST: burst sparks)
//   canvas 22x22   anchor ax 11, ay 16 (lowest opaque row of frame 0; the orb's centre is ay-4)   pack w/h 10x10
//
// bakeHaunt()       A POLTERGEIST PITCHFORK — a wooden-handled iron fork with three rusty tines in a pale-blue haunt ring.
//   frames: 0 hover A (upright)   1 hover B (tilted)   2 THROW TELL (drawn back, shaking, tines forward, glow up)
//           3 thrown (horizontal, tines forward: the projectile)   4 hurt (LAST: bent)
//   canvas 28x28   anchor ax 14, ay 27 (lowest opaque row of frame 0, the glow under the butt)   pack w/h 8x22
//
// bakeFarmGhosts()  THE FAMILY'S GHOSTS (friendly NPCs) — { farmer, wife, child }, each 2 idle frames [idleA, idleB]
//   farmer (beard, straw hat) canvas 22x30 anchor ax 11, ay 28, w/h 10x24
//   wife (shawl, bonnet)      canvas 22x30 anchor ax 11, ay 28, w/h 10x22
//   child (rag doll)          canvas 18x22 anchor ax 9,  ay 20, w/h 8x15
import { canvas, px, flipX, whiten, outline } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) { const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX); return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h }; }
/* A HAUNTED BEAST, out of another level's sprite set. The fields' ghosts are pale moon-blue, so a creature that lives here
   and somewhere else too (the cave bat in the Hollis rafters) is laid onto the ghost ramp GH by how bright each of its pixels
   is AMONG ITS OWN - its darkest tone to GH[1], its brightest to GH[3] - so a near-black bat comes out pale and still has
   its shading. The outline stays the outline and the eye keeps its colour (`keep`), which is what makes it a bat that
   died in the barn and not a cave bat that flew in. The white hit-flash frames are the same silhouettes and are shared. */
export function hauntedSet(set, keep = ['#ff4a3a']) {
  const lum = (r, g2, b) => 0.3 * r + 0.59 * g2 + 0.11 * b;
  const hexRGB = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const out = hexRGB(OUT), ramp = GH.map(hexRGB), kept = keep.map(hexRGB), same = (a, r, g2, b) => a[0] === r && a[1] === g2 && a[2] === b;
  const R = set.R.map(src => {
    const [c, q] = canvas(src.width, src.height); q.drawImage(src, 0, 0);
    const img = q.getImageData(0, 0, c.width, c.height), d = img.data;
    let lo = 255, hi = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] && !same(out, d[i], d[i + 1], d[i + 2]) && !kept.some(k => same(k, d[i], d[i + 1], d[i + 2]))) { const l = lum(d[i], d[i + 1], d[i + 2]); lo = Math.min(lo, l); hi = Math.max(hi, l); }
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3] || same(out, d[i], d[i + 1], d[i + 2]) || kept.some(k => same(k, d[i], d[i + 1], d[i + 2]))) continue;
      const t = hi > lo ? (lum(d[i], d[i + 1], d[i + 2]) - lo) / (hi - lo) : 0, [r, g2, b] = ramp[1 + Math.round(t * 2)];
      d[i] = r; d[i + 1] = g2; d[i + 2] = b; }
    q.putImageData(img, 0, 0); return c; });
  return Object.assign({}, set, { R, L: R.map(flipX) });
}

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
const R0 = Math.round;
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
/* loose pixels laid after the outline (sparks, spores, a haunt ring): no rim, so they read as light and not as bodies */
function afterDots(c, pts, onlyEmpty = false) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
  for (const [x, y, col] of pts) { const xx = R0(x), yy = R0(y); if (xx < 0 || yy < 0 || xx >= c.width || yy >= c.height) continue; if (onlyEmpty && d[(yy * c.width + xx) * 4 + 3]) continue; px(g, xx, yy, col); }
}

// ======================================================================================================================
// THE SCARECROW
// ======================================================================================================================
const SCP = {
  coat: ['#5a2a26', '#8a4234', '#b4623e', '#d8885a'], coatF: ['#44201e', '#6a3228', '#8a4234'],
  patch: ['#8a6a2a', '#c8a048', '#e8c870'], straw: ['#b07c26', '#e0b444', '#fff08c'],
  sack: ['#7a5836', '#ad8452', '#d4b078', '#f0d8a4'], hat: ['#3e3222', '#62523a', '#8a7a52', '#b0a070'], band: '#9a3a2c',
  wood: ['#4e3220', '#80562f', '#b0824c'], trou: ['#3a4262', '#5a6690', '#8894bc'],
  rope: ['#9a7c48', '#e0c88a'], rust: ['#5a2c1c', '#9a5230', '#c8804a'], edge: '#f0e4cc',
  stitch: '#2e1c14', eye: '#ffa726', eyeHi: '#fff2a0', hole: '#241418' };

function strawTuft(B, x, y, ang, n, len, spread = 0.6) {
  for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * spread, l = len - (i % 2 ? 0.8 : 0);
    seg(B, x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, j => (j === 0 ? SCP.straw[0] : (i % 2 ? SCP.straw[1] : SCP.straw[2]))); }
}
/* THE SICKLE, from the hand along deg: a short grip, then a rusty hook with a pale inner edge. side flips which way it hooks */
function sickle(B, hand, deg, side = 1) {
  const a = deg * Math.PI / 180, d = [Math.cos(a), Math.sin(a)], n = [-d[1] * side, d[0] * side];
  const W = (u, v) => [hand[0] + d[0] * u + n[0] * v, hand[1] + d[1] * u + n[1] * v];
  limb(B, W(-2, 0), W(2.5, 0), 1.8, SCP.wood);
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const th = (90 - t * 215) * Math.PI / 180;
    for (const [rr, col] of [[3.6, t > 0.88 ? SCP.edge : (t < 0.3 ? SCP.rust[0] : SCP.rust[1])], [2.7, t > 0.12 && t < 0.72 ? SCP.edge : null]]) {
      if (!col) continue;
      const p = W(3 + rr * Math.cos(th), -3.6 + rr * Math.sin(th));
      dot(B, p[0], p[1], col);
    }
  }
}
export function bakeScarecrow() {
  const W = 36, H = 32, X = 18, F = 29;
  const frame = o => {
    const B = buf(W, H), lean = o.lean || 0, drop = o.drop || 0, bris = !!o.bristle;
    const hipY = F - 7 + drop, hx0 = X + (o.hipX || 0);
    const cx = X + lean, sy = F - 15 + drop + (o.lift || 0);
    const hd = [cx + 1 + (o.head ? o.head[0] : 0), F - 18 + drop + (o.lift || 0) + (o.head ? o.head[1] : 0)], tilt = o.tilt || 0;
    const shN = [cx + 3, sy + 1], shF = [cx - 3, sy + 1];
    const arm = (T, sh, hand, near) => {
      const ramp = near ? SCP.coat : SCP.coatF, el = [sh[0] + (hand[0] - sh[0]) * 0.5 + (o.slump || 0) * 0.3, sh[1] + (hand[1] - sh[1]) * 0.5 + (o.slump === undefined ? 1 : o.slump)];
      limb(T, sh, el, 3.4, ramp); limb(T, el, hand, 3, ramp);
      const cf = [el[0] + (hand[0] - el[0]) * 0.7, el[1] + (hand[1] - el[1]) * 0.7];
      dot(T, cf[0], cf[1], ramp[0]);
      const ang = Math.atan2(hand[1] - el[1], hand[0] - el[0]);
      strawTuft(T, hand[0], hand[1], ang, near ? 3 : 3, bris ? 4 : 2.6, bris ? 0.75 : 0.6);
    };
    /* the far arm, behind everything */
    layer(B, T => arm(T, shF, o.far, false));
    /* an arm swung back over the shoulder goes behind the head and the coat, not across the face */
    if (o.armBack) { layer(B, T => sickle(T, o.near, o.sickle, o.side || 1)); layer(B, T => arm(T, shN, o.near, true)); }
    /* the peg leg (far) and the stuffed trouser leg (near) */
    const peg = o.peg || [X - 2, F], leg = o.leg || [X + 3, F];
    layer(B, T => { limb(T, [hx0 - 2, hipY - 1], [peg[0], peg[1] - 1], 2.4, SCP.wood); dot(T, peg[0], peg[1], SCP.wood[0]); dot(T, hx0 - 2, hipY + 2, SCP.wood[2]); });
    layer(B, T => {
      const ank = [leg[0] - 1, leg[1] - 2];
      limb(T, [hx0 + 2, hipY - 1], ank, 3.8, SCP.trou);
      const kx = R0(hx0 + 2 + (ank[0] - hx0 - 2) * 0.5), ky = R0(hipY + (ank[1] - hipY) * 0.5);
      dot(T, kx, ky, SCP.patch[1]); dot(T, kx + 1, ky, SCP.patch[0]); dot(T, kx, ky + 1, SCP.patch[0]);
      for (const [dx, dy, k] of [[-1, 1, 1], [0, 2, 2], [1, 2, 1], [2, 2, 2], [3, 2, 1], [2, 1, 0], [3, 1, 2]]) dot(T, ank[0] + dx, ank[1] + dy, SCP.straw[k]);
      if (bris) strawTuft(T, ank[0], ank[1] + 1, Math.PI * 0.95, 2, 3, 0.9);
    });
    /* THE COAT: shoulders to below the hip, a jagged moth-eaten hem, a patch, a lapel, a rope belt */
    layer(B, T => {
      const hem = hipY + 2, hl = hx0 + lean * 0.4;
      poly(T, [[cx - 4, sy], [cx + 4, sy], [cx + 5, sy + 3], [hl + 5, hem], [hl + 3, hem + 1], [hl + 2, hem - 1], [hl, hem + 1], [hl - 2, hem], [hl - 3, hem + 1], [hl - 5, hem - 1], [cx - 5, sy + 3]], (x, y) => {
        const mid = cx + (hl - cx) * Math.max(0, Math.min(1, (y - sy) / (hem - sy))), f = x - mid;
        return f < -2.5 ? SCP.coat[2] : f > 2.5 ? SCP.coat[0] : (y === sy ? SCP.coat[2] : SCP.coat[1]); });
      seg(T, cx + 1, sy + 1, hl + 1, hem, SCP.coat[0]);
      dot(T, cx - 3, sy, SCP.coat[3]); dot(T, cx - 2, sy, SCP.coat[3]); dot(T, cx - 4, sy + 1, SCP.coat[3]);
      /* the patch, stitched on crooked */
      const px0 = R0(cx - 3), py0 = sy + 3;
      for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 3; xx++) dot(T, px0 + xx, py0 + yy, yy === 0 || xx === 0 ? SCP.patch[2] : SCP.patch[1]);
      dot(T, px0 + 2, py0 + 2, SCP.patch[0]); dot(T, px0 - 1, py0 + 1, SCP.stitch); dot(T, px0 + 1, py0 - 1, SCP.stitch);
      /* moth holes */
      dot(T, cx + 3, sy + 4, SCP.hole); dot(T, hl - 2, hem - 2, SCP.hole);
      /* the rope belt, and its knotted end hanging */
      for (let x = R0(hl - 5); x <= R0(hl + 5); x++) dot(T, x, hipY - 1, (x % 2) ? SCP.rope[1] : SCP.rope[0]);
      dot(T, hl + 2, hipY, SCP.rope[1]); dot(T, hl + 2, hipY + 1, SCP.rope[0]); dot(T, hl + 3, hipY + 2, SCP.rope[1]);
    });
    /* straw out of the collar */
    layer(B, T => { strawTuft(T, cx - 2, sy, -Math.PI * 0.8, 2, bris ? 4 : 2.5, 0.5); strawTuft(T, cx + 3, sy, -Math.PI * 0.2, 2, bris ? 4 : 2.5, 0.5); if (bris) strawTuft(T, cx, sy - 1, -Math.PI / 2, 3, 3.5, 0.5); });
    /* THE SACK HEAD, tied at the neck: X eyes of stitching with an amber glint in each, a crooked stitched grin */
    layer(B, T => {
      const ct = Math.cos(tilt), st = Math.sin(tilt), P = (dx, dy) => [hd[0] + dx * ct - dy * st, hd[1] + dx * st + dy * ct];
      ball(T, hd[0], hd[1], 4.4, 4.2, SCP.sack, { tilt, fn: (x, y, u, v, k, col) => (((x * 2 + y * 3) % 5 === 0 && k > 0.35) ? SCP.sack[Math.max(0, SCP.sack.indexOf(col) - 1)] : null) });
      dot(T, ...P(-1, 4), SCP.rope[0]); dot(T, ...P(0, 4), SCP.rope[1]); dot(T, ...P(1, 4), SCP.rope[0]);
      const glow = o.glare ? SCP.eyeHi : SCP.eye;
      for (const [ex, ey, big] of [[-0.5, 0, false], [2.6, 0, true]]) {
        const cells = big ? [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]] : [[0, -1], [-1, 0], [0, 1]];
        for (const [a, b] of cells) dot(T, ...P(ex + a, ey + b), SCP.stitch);
        dot(T, ...P(ex, ey), glow); if (o.glare) { dot(T, ...P(ex + 1, ey), SCP.eye); }
      }
      if (o.gape) { for (const [a, b] of [[0, 2], [1, 2], [2, 3], [3, 2], [1, 3], [2, 2]]) dot(T, ...P(a, b), SCP.stitch); }
      else { for (const [a, b] of [[-1, 2], [0, 2], [1, 3], [2, 2], [3, 2], [4, 1]]) dot(T, ...P(a, b), SCP.stitch); dot(T, ...P(1, 4), SCP.sack[1]); }
      dot(T, ...P(0, 1), SCP.stitch); dot(T, ...P(2, 3), SCP.stitch);
    });
    /* THE HAT: a battered brim, a crown that has fallen in and flopped over, a faded band and a hole in it */
    if (!o.noHat) layer(B, T => {
      const ht = tilt + (o.hatTilt || 0), ct = Math.cos(ht), st = Math.sin(ht), hh = o.hatOff || [0, 0], P = (dx, dy) => [hd[0] + hh[0] + dx * ct - dy * st, hd[1] + hh[1] + dx * st + dy * ct];
      poly(T, [P(-3, -4), P(3, -4), P(2.5, -7), P(0, -8.5), P(-3.5, -8), P(-5, -6.5), P(-3.5, -6.2)], (x, y) => (y > hd[1] + hh[1] - 5.5 ? SCP.band : (x < hd[0] + hh[0] - 1 ? SCP.hat[3] : SCP.hat[2])));
      limb(T, P(-6, -4), P(6, -3.5), 1.9, SCP.hat);
      dot(T, ...P(1, -7), SCP.hole); dot(T, ...P(-5.5, -6), SCP.hat[1]);
      if (bris) { strawTuft(T, ...P(-5, -3), Math.PI * 0.85, 2, 3, 0.6); strawTuft(T, ...P(5, -2), Math.PI * 0.1, 2, 3, 0.6); }
      else { dot(T, ...P(-6, -2), SCP.straw[2]); dot(T, ...P(-5, -2), SCP.straw[1]); }
    });
    /* the near arm, and the sickle in it */
    if (!o.armBack) {
      if (o.sickleBehind) layer(B, T => sickle(T, o.near, o.sickle, o.side || 1));
      layer(B, T => arm(T, shN, o.near, true));
      if (!o.sickleBehind) layer(B, T => sickle(T, o.near, o.sickle, o.side || 1));
    }
    floorCut(B, F);
    const c = toCanvas(B);
    if (o.smear) smear(c, ...o.smear, ['#fff4d0', '#e8b860', '#9a6a3a']);
    if (o.spray) afterDots(c, o.spray.map(([x, y], i) => [x, y, SCP.straw[1 + (i % 2)]]), true);
    return c;
  };
  const stillA = frame({ far: [X - 8, F - 11], near: [X + 9, F - 12], sickle: 75, side: 1 });
  const stillB = frame({ far: [X - 8, F - 10], near: [X + 9, F - 11], head: [0, 1], tilt: 0.3, hatTilt: 0.1, sickle: 85, side: 1, lean: 0 });
  const twitch = frame({ far: [X - 9, F - 16], near: [X + 9, F - 16], head: [3, -1], tilt: -0.45, hatTilt: -0.2, sickle: 60, side: -1, bristle: true, slump: -1, glare: true, lift: -1 });
  const lurchA = frame({ far: [X - 6, F - 14], near: [X + 9, F - 15], lean: 2, head: [1, 0], tilt: 0.15, peg: [X + 3, F], leg: [X - 3, F], sickle: 40, side: 1, hipX: 0 });
  const lurchB = frame({ far: [X - 8, F - 9], near: [X + 9, F - 10], drop: 1, lean: 1, head: [0, 1], tilt: -0.1, peg: [X + 1, F], leg: [X + 4, F], sickle: 95, side: 1, spray: [[X + 7, F], [X - 4, F], [X + 8, F - 1]] });
  const swipeTell = frame({ far: [X + 6, F - 12], near: [X - 7, F - 24], lean: -1, head: [-1, 0], tilt: -0.15, sickle: -150, side: 1, glare: true, gape: true, peg: [X - 4, F], leg: [X + 4, F], armBack: true });
  const swipe = frame({ far: [X - 9, F - 13], near: [X + 9, F - 6], lean: 3, head: [2, 1], tilt: 0.25, sickle: 10, side: 1, glare: true, gape: true, peg: [X - 5, F], leg: [X + 5, F], slump: 0,
    smear: [X + 3, F - 12, 12, -80, 50] });
  const hurt = frame({ far: [X - 11, F - 20], near: [X + 7, F - 20], lean: -3, head: [-3, -1], tilt: -0.6, hatTilt: -0.4, hatOff: [-2, -2], sickle: -20, side: 1, bristle: true, gape: true, peg: [X - 1, F], leg: [X + 4, F], slump: -2,
    spray: [[X - 12, F - 22], [X - 13, F - 18], [X + 9, F - 23], [X + 11, F - 17], [X - 4, F - 26], [X + 2, F - 28], [X - 10, F - 26], [X + 12, F - 21]] });
  return pack([stillA, stillB, twitch, lurchA, lurchB, swipeTell, swipe, hurt], X, F + 1, 12, 22);
}
export const SCARECROW_F = { still: [0, 1], twitch: 2, lurch: [3, 4], swipeTell: 5, swipe: 6, hurt: 7 };

// ======================================================================================================================
// THE ROOK
// ======================================================================================================================
const RKP = { body: ['#262c4a', '#3e4a76', '#5c6ca2', '#8c9ed0'], wingF: ['#1e2440', '#323c64', '#4a5888'], edge: '#b8c8e4', edgeD: '#7e90b4',
  bill: ['#8a8070', '#d8ccb0', '#f4ecd8'], eye: '#fff08a', leg: '#6a6272', mouth: '#5a1a24' };
export function bakeRook() {
  const W = 22, H = 18, X = 11, F = 15;
  const frame = o => {
    const B = buf(W, H), [bx, by] = o.body, bt = o.bt || 0, [hx, hy] = o.head;
    /* the far wing, behind the body */
    if (o.farWing) layer(B, T => poly(T, o.farWing, (x, y) => ((x + y) % 3 === 0 ? RKP.wingF[2] : RKP.wingF[1])));
    /* the tail: a wedge, the rook's mark */
    layer(B, T => poly(T, o.tail, (x, y) => (y === Math.floor(o.tail[0][1]) ? RKP.body[2] : RKP.body[1])));
    if (o.legs) layer(B, T => { for (const lx of o.legs) { dot(T, lx, F - 1, RKP.leg); dot(T, lx, F, RKP.leg); dot(T, lx + 1, F, RKP.leg); } });
    layer(B, T => ball(T, bx, by, o.rx || 4.6, o.ry || 2.9, RKP.body, { tilt: bt }));
    /* the head and the pale bill */
    layer(B, T => {
      ball(T, hx, hy, 2.4, 2.3, RKP.body, { bias: 0.08 });
      const a = (o.beak || 0) * Math.PI / 180, d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]];
      const base = [hx + d[0] * 1.8, hy + d[1] * 1.8];
      if (o.open) {
        seg(T, base[0] - n[0] * 0.8, base[1] - n[1] * 0.8, base[0] + d[0] * 3.3 - n[0] * 1.8, base[1] + d[1] * 3.3 - n[1] * 1.8, RKP.bill[2]);
        seg(T, base[0] + n[0] * 0.8, base[1] + n[1] * 0.8, base[0] + d[0] * 2.8 + n[0] * 1.8, base[1] + d[1] * 2.8 + n[1] * 1.8, RKP.bill[0]);
        dot(T, base[0] + d[0] * 1.2, base[1] + d[1] * 1.2, RKP.mouth);
      } else {
        limb(T, base, [base[0] + d[0] * 2.6, base[1] + d[1] * 2.6], 2, RKP.bill);
        dot(T, base[0] + d[0] * 3.6, base[1] + d[1] * 3.6, RKP.bill[1]);
      }
      dot(T, hx + (o.eyeD ? o.eyeD[0] : 0.6), hy + (o.eyeD ? o.eyeD[1] : -0.8), RKP.eye);
    });
    /* the near wing, over the body, with its pale edge */
    layer(B, T => {
      poly(T, o.wing, (x, y) => ((x * 3 + y) % 4 === 0 ? RKP.body[0] : RKP.body[1]));
      for (let i = 0; i < o.wing.length - 1; i++) if (o.edgeIdx.includes(i)) seg(T, o.wing[i][0], o.wing[i][1], o.wing[i + 1][0], o.wing[i + 1][1], RKP.edge);
      if (o.fingers) for (const [x, y] of o.fingers) dot(T, x, y, RKP.edgeD);
    });
    floorCut(B, F);
    const c = toCanvas(B);
    if (o.feathers) afterDots(c, o.feathers.map(([x, y], i) => [x, y, i % 2 ? RKP.edge : RKP.body[2]]), true);
    return c;
  };
  const perch = { body: [X - 1, F - 4.5], bt: -0.35, head: [X + 3, F - 8], beak: 5, legs: [X - 1, X + 1],
    tail: [[X - 5, F - 5], [X - 4, F - 3], [X - 9, F - 1], [X - 10, F - 3]],
    wing: [[X - 3, F - 7], [X + 2, F - 6.5], [X + 1, F - 4], [X - 4, F - 3], [X - 8, F - 2.5]], edgeIdx: [2, 3] };
  const peck = { ...perch, bt: -0.05, body: [X - 1, F - 4], head: [X + 4, F - 4.5], beak: 60, eyeD: [0.8, -0.9],
    tail: [[X - 5, F - 5], [X - 5, F - 6], [X - 10, F - 8], [X - 10, F - 6]],
    wing: [[X - 4, F - 6.5], [X + 2, F - 6], [X + 1, F - 3.5], [X - 5, F - 3.5], [X - 9, F - 5.5]] };
  const flyBase = { body: [X - 1, F - 5], bt: -0.05, head: [X + 4, F - 6], beak: 5, tail: [[X - 5, F - 6], [X - 5, F - 4], [X - 10, F - 3], [X - 10, F - 6]] };
  const wingsUp = { ...flyBase,
    farWing: [[X - 1, F - 7], [X + 2, F - 7], [X + 1, F - 13], [X - 2, F - 12]],
    wing: [[X - 3, F - 6], [X + 1, F - 6], [X - 1, F - 11], [X - 4, F - 14], [X - 7, F - 13], [X - 5, F - 10]], edgeIdx: [1, 2], fingers: [[X - 6, F - 13], [X - 4, F - 13]] };
  const wingsDown = { ...flyBase, body: [X - 1, F - 6], head: [X + 4, F - 7], tail: [[X - 5, F - 7], [X - 5, F - 5], [X - 10, F - 4], [X - 10, F - 7]],
    farWing: [[X - 1, F - 7], [X + 2, F - 7], [X + 3, F - 2], [X + 1, F - 2]],
    wing: [[X - 3, F - 6], [X + 1, F - 6], [X, F - 2], [X - 3, F], [X - 6, F - 1], [X - 5, F - 4]], edgeIdx: [1, 2], fingers: [[X - 5, F - 1], [X - 3, F - 1]] };
  const diveTell = { body: [X - 1, F - 4], bt: 0.35, head: [X + 3, F - 2], beak: 50, open: true, eyeD: [0.9, -0.6],
    tail: [[X - 5, F - 6], [X - 4, F - 4], [X - 9, F - 8], [X - 9, F - 10]],
    farWing: [[X - 1, F - 6], [X + 2, F - 6], [X + 4, F - 12], [X + 2, F - 13]],
    wing: [[X - 3, F - 5], [X + 1, F - 5], [X + 1, F - 10], [X - 1, F - 14], [X - 4, F - 13], [X - 4, F - 9]], edgeIdx: [1, 2], fingers: [[X - 3, F - 13], [X - 1, F - 13]] };
  const dive = { body: [X - 1, F - 6], bt: 0.7, rx: 5, ry: 3.2, head: [X + 3, F - 2], beak: 45, eyeD: [0.7, -0.9],
    tail: [[X - 4, F - 9], [X - 3, F - 10], [X - 7, F - 14], [X - 9, F - 12]],
    wing: [[X - 6, F - 11], [X - 1, F - 9], [X + 2, F - 4], [X - 2, F - 4], [X - 6, F - 8]], edgeIdx: [1, 2] };
  const hurt = { body: [X - 1, F - 5], bt: 0.15, head: [X + 3, F - 7], beak: -20, open: true, eyeD: [0.6, -0.8],
    tail: [[X - 5, F - 5], [X - 5, F - 3], [X - 9, F - 2], [X - 10, F - 6]],
    farWing: [[X - 1, F - 6], [X + 2, F - 6], [X + 6, F - 10], [X + 5, F - 12], [X + 3, F - 10]],
    wing: [[X - 3, F - 6], [X, F - 5], [X - 5, F - 1], [X - 8, F - 3], [X - 8, F - 6]], edgeIdx: [1, 2],
    feathers: [[X - 9, F - 11], [X + 7, F - 13], [X - 3, F - 12], [X + 8, F - 2], [X - 11, F - 8], [X + 2, F - 13], [X + 9, F - 7]] };
  return pack([perch, peck, wingsUp, wingsDown, diveTell, dive, hurt].map(frame), X, F + 1, 10, 7);
}
export const ROOK_F = { perch: 0, peck: 1, fly: [2, 3], diveTell: 4, dive: 5, hurt: 6 };

// ======================================================================================================================
// THE GHOST FARMHAND
// ======================================================================================================================
const GH = ['#4a5a80', '#9ab8e0', '#c8dcf5', '#eef6ff'];
const GHP = { cap: ['#3e4c70', '#5e74a2', '#7c94c4'], brace: '#4a5a80', hollow: '#1a1f38', pin: '#ffffff', mouth: '#262c4c',
  lampFrame: '#3a3040', lamp: ['#ff9a5c', '#ffd36b', '#fff4c8'],
  shaft: ['#8a7a64', '#c0ae8c', '#e6d6b4'], iron: ['#5a6276', '#8e98ae', '#c8d0e0'] };
/* the wisp that is his legs: from the waist, narrowing, swirled one way to a tip on the floor row */
function wisp(B, waist, F, swirl, thin = 1) {
  const [wx, wy] = waist, n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n, y = wy + (F - wy) * t, x = wx + Math.sin(t * Math.PI * 0.9) * swirl * 3 - swirl * t * t * 4, r = (4.4 * (1 - t) + 0.7 * t) * thin;
    ball(B, x, y, r, 1.6, GH, { bias: 0.05 - t * 0.15 });
  }
  /* curls off the tail */
  const tx = wx - swirl * 4 + Math.sin(0.9 * Math.PI) * swirl * 3;
  dot(B, tx - swirl * 2, F - 1, GH[1]); dot(B, tx - swirl * 3, F - 2, GH[2]); dot(B, tx + swirl, F - 3, GH[0]);
}
function hoe(B, hand, deg, len, up = 1) {
  const a = deg * Math.PI / 180, d = [Math.cos(a), Math.sin(a)], n = [-d[1] * up, d[0] * up];
  const tip = [hand[0] + d[0] * len, hand[1] + d[1] * len], butt = [hand[0] - d[0] * 5, hand[1] - d[1] * 5];
  seg(B, butt[0], butt[1], tip[0], tip[1], (i, m) => (i < 2 ? GHP.shaft[0] : (i % 4 === 1 ? GHP.shaft[2] : GHP.shaft[1])));
  /* the blade: a flat iron plate turned across the shaft at its end */
  const p0 = [tip[0] + n[0] * 0.5, tip[1] + n[1] * 0.5];
  for (let k = -0.5; k <= 4.5; k += 0.5) for (let j = -2.5; j <= 1; j += 0.5) {
    const x = p0[0] + n[0] * k + d[0] * j, y = p0[1] + n[1] * k + d[1] * j;
    dot(B, x, y, k >= 4 ? GHP.iron[2] : j < -1 ? GHP.iron[2] : j < 0 ? GHP.iron[1] : GHP.iron[0]);
  }
}
export function bakeFarmhand() {
  const W = 40, H = 38, X = 20, F = 35;
  const frame = o => {
    const B = buf(W, H), lean = o.lean || 0, dy = o.dy || 0;
    const waist = [X + lean * 0.5, F - 11 + dy], chest = [X + lean, F - 15 + dy], hd = [X + 1 + lean + (o.head ? o.head[0] : 0), F - 20 + dy + (o.head ? o.head[1] : 0)];
    const shN = [chest[0] + 3, chest[1] - 1], shF = [chest[0] - 3, chest[1] - 1], thin = o.thin || 1;
    const armF = T => { limb(T, shF, o.far.el, 3, GH); limb(T, o.far.el, o.far.hd, 2.4, GH); dot(T, o.far.el[0], o.far.el[1], GH[3]); ball(T, o.far.hd[0], o.far.hd[1], 1.3, 1.3, GH); };
    const armN = T => { limb(T, shN, o.near.el, 3.2, GH); limb(T, o.near.el, o.near.hd, 2.6, GH);
      const rl = [shN[0] + (o.near.el[0] - shN[0]) * 0.85, shN[1] + (o.near.el[1] - shN[1]) * 0.85]; limb(T, rl, rl, 3.4, [GH[1], GH[2], GH[3]]);
      ball(T, o.near.hd[0], o.near.hd[1], 1.4, 1.4, GH, { bias: 0.1 }); };
    if (o.hoeBehind) layer(B, T => hoe(T, ...o.hoe));
    layer(B, armF, GH[0]);
    layer(B, T => wisp(T, [waist[0], waist[1] + 1], F, o.swirl || 1, thin));
    /* the torso: a work shirt, braces over it, trousers' waistband */
    layer(B, T => {
      const w = 4.5 * thin;
      poly(T, [[chest[0] - w, chest[1] - 2], [chest[0] + w, chest[1] - 2], [chest[0] + w + 0.5, chest[1] + 1], [waist[0] + w - 0.5, waist[1] + 1], [waist[0] - w + 0.5, waist[1] + 1], [chest[0] - w - 0.5, chest[1] + 1]],
        (x, y) => { const f = x - (chest[0] + (waist[0] - chest[0]) * Math.max(0, (y - chest[1] + 2) / 13)); return f < -2 ? GH[2] : f > 2.5 ? GH[0] : GH[1]; });
      dot(T, chest[0] - 3, chest[1] - 2, GH[3]); dot(T, chest[0] - 2, chest[1] - 2, GH[3]);
      seg(T, chest[0] - 2, chest[1] - 2, waist[0] - 2, waist[1], GHP.brace); seg(T, chest[0] + 2, chest[1] - 2, waist[0] + 2, waist[1], GHP.brace);
      for (let x = R0(waist[0] - w + 1); x <= R0(waist[0] + w - 1); x++) dot(T, x, waist[1], GHP.cap[1]);
      dot(T, chest[0], chest[1] - 1, GH[0]);
    }, GH[0]);
    /* the lantern off the belt */
    if (!o.noLamp) layer(B, T => {
      const lx = R0(waist[0] + 3 + (o.lampSwing || 0)), ly = R0(waist[1] + 1);
      dot(T, lx - (o.lampSwing || 0), ly, GHP.lampFrame); dot(T, lx, ly + 1, GHP.lampFrame);
      for (let x = lx - 1; x <= lx + 1; x++) { dot(T, x, ly + 2, GHP.lampFrame); dot(T, x, ly + 6, GHP.lampFrame); }
      for (let yy = ly + 3; yy <= ly + 5; yy++) { dot(T, lx - 1, yy, GHP.lamp[yy === ly + 5 ? 0 : 1]); dot(T, lx, yy, yy === ly + 4 ? GHP.lamp[2] : GHP.lamp[1]); dot(T, lx + 1, yy, GHP.lamp[0]); }
    }, GH[0]);
    /* arms raised overhead go up behind the head, so the face (and its open mouth) still reads on the tell */
    if (o.armsBack) layer(B, armN, GH[0]);
    /* THE HEAD: a long face in a flat cap, hollow sockets with a white pinprick in them */
    layer(B, T => {
      limb(T, [hd[0] - 1, hd[1] + 3], [chest[0], chest[1] - 2], 2.6, GH);
      ball(T, hd[0], hd[1], 3.4, 3.8, GH, { bias: 0.08 });
      /* hollow sockets, two pixels deep, a white pinprick in each */
      for (const ex of [0, 2]) { dot(T, hd[0] + ex, hd[1] - 0.2, GHP.hollow); dot(T, hd[0] + ex, hd[1] + 0.8, GHP.hollow); }
      if (!o.dimEye) { dot(T, hd[0] + 2, hd[1] - 0.2, GHP.pin); dot(T, hd[0], hd[1] - 0.2, '#b8c8e8'); }
      if (o.mouth) { dot(T, hd[0] + 1, hd[1] + 2.2, GHP.mouth); dot(T, hd[0] + 1, hd[1] + 3, GHP.mouth); dot(T, hd[0] + 2, hd[1] + 2.2, GHP.mouth); dot(T, hd[0] + 2, hd[1] + 3, GHP.mouth); }
      else { dot(T, hd[0] + 1, hd[1] + 2.4, GH[0]); dot(T, hd[0] + 2, hd[1] + 2.4, GH[0]); }
      /* the flat cap: a low crown over the brow and a short peak forward */
      poly(T, [[hd[0] - 3.8, hd[1] - 0.5], [hd[0] - 3.5, hd[1] - 3.5], [hd[0] - 1, hd[1] - 4.8], [hd[0] + 2.5, hd[1] - 4.3], [hd[0] + 3.4, hd[1] - 2.2], [hd[0] - 1.5, hd[1] - 1.5]], (x, y) => (y < hd[1] - 3.5 ? GHP.cap[2] : x > hd[0] + 1 ? GHP.cap[0] : GHP.cap[1]));
      seg(T, hd[0] + 1, hd[1] - 2, hd[0] + 4, hd[1] - 2, GHP.cap[0]);
      dot(T, hd[0] - 2, hd[1] - 4, '#9aaed6');
    }, GH[0]);
    if (!o.hoeBehind) layer(B, T => hoe(T, ...o.hoe));
    if (!o.armsBack) layer(B, armN, GH[0]);
    floorCut(B, F);
    if (o.dissolve) {
      /* the fade: whole rows of him go, and what is left of the edges crumbles */
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const h = ((x * 73856093) ^ (y * 19349663)) >>> 0; if (B.get(x, y) && (((y % 3) === 1 && (x + y) % 2) || (h % 7 === 0))) B.del(x, y); }
    }
    const c = toCanvas(B);
    haloGlow(c, false);   /* the same pale rim the haunt wears: translucent blue on warm dirt used to read as a faded villager, not a ghost */
    if (o.dissolve) afterDots(c, [[X - 7, F - 20, GH[2]], [X + 8, F - 25, GH[3]], [X - 9, F - 9, GH[1]], [X + 9, F - 12, GH[2]], [X - 4, F - 28, GH[3]], [X + 6, F - 4, GH[1]]], true);
    if (o.smear) smear(c, ...o.smear, ['#eef6ff', '#9ab8e0', '#4a5a80']);
    if (o.glowDots) afterDots(c, o.glowDots, true);
    return c;
  };
  const driftA = { swirl: 1, far: { el: [X - 1, F - 11], hd: [X + 3, F - 10] }, near: { el: [X + 5, F - 12], hd: [X + 6, F - 10] }, hoe: [[X + 5, F - 10], -140, 16, -1], hoeBehind: true };
  const driftB = { ...driftA, swirl: -1, dy: -1, lampSwing: 1, far: { el: [X - 1, F - 12], hd: [X + 3, F - 11] }, near: { el: [X + 5, F - 13], hd: [X + 6, F - 11] }, hoe: [[X + 5, F - 11], -138, 16, -1] };
  const swingTell = { swirl: 1, lean: -1, head: [0, 1], mouth: true, far: { el: [X - 6, F - 21], hd: [X - 5, F - 28] }, near: { el: [X - 4, F - 20], hd: [X - 3, F - 29] }, hoe: [[X - 3, F - 29], -160, 13, -1], hoeBehind: true, armsBack: true, lampSwing: -1,
    glowDots: [[X - 13, F - 36, GH[3]], [X - 15, F - 33, GH[2]]] };
  const swing = { swirl: -1, lean: 3, head: [1, 1], mouth: true, far: { el: [X + 5, F - 12], hd: [X + 8, F - 9] }, near: { el: [X + 7, F - 13], hd: [X + 10, F - 10] }, hoe: [[X + 9, F - 9], 38, 11, 1], lampSwing: 1,
    smear: [X + 3, F - 11, 16, -110, 20] };
  const fade = { ...driftA, thin: 0.75, dissolve: true, noLamp: false, dimEye: true };
  const hurt = { swirl: -1, lean: -3, head: [-2, -1], mouth: true, dimEye: true, far: { el: [X - 7, F - 17], hd: [X - 9, F - 21] }, near: { el: [X + 1, F - 19], hd: [X + 5, F - 23] }, hoe: [[X + 5, F - 23], -60, 11, 1], lampSwing: -2 };
  return pack([driftA, driftB, swingTell, swing, fade, hurt].map(frame), X, F + 1, 12, 22);
}
export const FARMHAND_F = { drift: [0, 1], swingTell: 2, swing: 3, fade: 4, hurt: 5 };

// ======================================================================================================================
// THE PUMPKIN LURKER
// ======================================================================================================================
const PKP = { skin: ['#6e2a10', '#b24e16', '#e8781e', '#ffa844'], hi: '#ffd890', groove: '#5a200c',
  stem: ['#3e3a1e', '#6a6030', '#9a8c48'], leaf: ['#2e4a1e', '#4a6e2c', '#7a9c46'],
  vine: ['#1c3016', '#2e5024', '#4e7a34', '#76a04a'], glow: ['#ff8a1e', '#ffc83a', '#fff4a0'], inside: '#2a0e10',
  spore: ['#4a3e5e', '#7a6a90', '#a898c0'], pulp: ['#ffcf6a', '#f0a040', '#fff0c0'] };
/* a pumpkin whose foot is on row by: five lit lobes back to front, grooves between them */
function pumpkin(B, cx, by, o = {}) {
  const ry = 5.6, cy = by - ry + 0.5;
  for (const [dx, rx, r2, bias] of [[-4.2, 3.2, 5.0, -0.1], [4.4, 3.2, 5.0, -0.18], [-2, 3.4, 5.5, 0], [2.3, 3.4, 5.5, -0.06], [0, 3.2, 5.7, 0.05]])
    layer(B, T => ball(T, cx + dx, cy + (5.6 - r2) * 0.5, rx, r2, PKP.skin, { bias, fn: (x, y, u, v, k) => (k > 0.93 && u < -0.1 && v < -0.2 ? PKP.hi : null) }), PKP.groove);
}
function pumpkinFace(B, cx, cy, mode) {
  const G = PKP.glow;
  /* the eyes: two glowing triangles, narrowed to slits when it snaps */
  for (const ex of [-3, 1]) {
    if (mode === 'snap') { dot(B, cx + ex, cy - 1, G[0]); dot(B, cx + ex + 1, cy - 1, G[2]); dot(B, cx + ex + 2, cy - 1, G[1]); continue; }
    dot(B, cx + ex + 1, cy - 2, G[2]); dot(B, cx + ex, cy - 1, G[1]); dot(B, cx + ex + 1, cy - 1, G[2]); dot(B, cx + ex + 2, cy - 1, G[0]);
  }
  if (mode === 'wide') {
    /* a jack-o'-lantern grin: a wide glowing slot with jagged teeth down from the top and up from the bottom */
    for (let x = -4; x <= 4; x++) {
      const e = Math.abs(x) === 4, top = cy + (e ? 0 : 1), bot = cy + (e ? 2 : 4) - (Math.abs(x) === 3 ? 1 : 0);
      for (let y = top; y <= bot; y++) dot(B, cx + x, y, y === bot ? G[0] : (y <= top + 1 ? G[1] : G[2]));
    }
    for (const x of [-2, 1]) { dot(B, cx + x, cy + 1, PKP.skin[2]); dot(B, cx + x, cy + 2, PKP.skin[1]); }
    for (const x of [-1, 2]) { dot(B, cx + x, cy + 4, PKP.skin[1]); dot(B, cx + x, cy + 3, PKP.skin[0]); }
  } else if (mode === 'snap') {
    for (let x = -4; x <= 4; x++) { dot(B, cx + x, cy + 2 + ((x + 4) % 2), G[1]); if ((x + 4) % 2) dot(B, cx + x, cy + 2, G[2]); }
  }
}
export function bakePumpkin() {
  const W = 28, H = 30, X = 13, F = 27;
  const frame = o => {
    const B = buf(W, H), lift = o.lift || 0, cx = X + (o.dx || 0), by = F - lift;
    /* vine legs, behind */
    if (o.legs) for (const [hx, fx, kx] of o.legs) layer(B, T => {
      const hip = [cx + hx, by - 1], foot = [X + fx, F], knee = [(hip[0] + foot[0]) / 2 + kx, (hip[1] + foot[1]) / 2 - 1];
      limb(T, hip, knee, 2.2, PKP.vine); limb(T, knee, [foot[0], foot[1] - 1], 1.8, PKP.vine);
      dot(T, foot[0] + 1, F, PKP.vine[1]); dot(T, foot[0] - 1, F, PKP.vine[1]); dot(T, foot[0], F, PKP.vine[2]);
      dot(T, knee[0] - Math.sign(kx || 1) * 2, knee[1] - 1, PKP.vine[3]); dot(T, knee[0] - Math.sign(kx || 1) * 2, knee[1] - 2, PKP.vine[2]);
    });
    if (o.legs) layer(B, T => { ball(T, cx, by - 1, 4, 2, PKP.vine); dot(T, cx - 5, by - 3, PKP.vine[3]); dot(T, cx + 5, by - 2, PKP.vine[2]); });
    if (o.leaf) layer(B, T => {
      poly(T, [[cx - 11, F], [cx - 8, F - 4], [cx - 5, F - 3], [cx - 4, F], [cx - 7, F + 1]], (x, y) => (y < F - 2 ? PKP.leaf[2] : PKP.leaf[1]));
      seg(T, cx - 10, F, cx - 5, F - 2, PKP.leaf[0]);
      seg(T, cx - 4, F - 3, cx - 2, F - 5, PKP.vine[2]); dot(T, cx - 3, F - 6, PKP.vine[2]); dot(T, cx - 4, F - 6, PKP.vine[3]);
    });
    const P = buf(W, H), cy = by - 5;
    pumpkin(P, cx, by);
    if (o.face) pumpkinFace(P, cx + 1, cy, o.face);
    if (o.crack) { seg(P, cx - 1, by - 11, cx + 1, by - 7, PKP.inside); seg(P, cx + 1, by - 7, cx - 1, by - 3, PKP.inside); dot(P, cx + 2, by - 5, PKP.inside); dot(P, cx - 2, by - 8, PKP.pulp[0]); }
    /* the lid: everything above the cut. hidden: stem on; tell: lifted a crack; burst: gone */
    const cut = by - 9;
    if (o.lid === 'off' || o.lid === 'crack') {
      /* the lid is a cap round the stem: the shoulders of the pumpkin stay round */
      const lidRows = [], inLid = (x, y) => y <= cut && Math.abs(x - cx) <= 3.5;
      for (let y = 0; y <= cut; y++) for (let x = 0; x < W; x++) { const k = P.get(x, y); if (k && inLid(x, y)) { lidRows.push([x, y, k]); P.del(x, y); } }
      if (o.lid === 'off') {
        for (let x = R0(cx - 3); x <= R0(cx + 3); x++) { P.set(x, cut + 1, Math.abs(x - cx) < 3 ? PKP.inside : PKP.skin[0]); P.set(x, cut, Math.abs(x - cx) < 3 ? PKP.groove : null); }
        dot(P, cx - 1, cut + 1, PKP.glow[0]); dot(P, cx + 1, cut + 1, PKP.glow[1]);
      } else {
        for (let x = R0(cx - 3); x <= R0(cx + 3); x++) { P.set(x, cut, PKP.inside); P.set(x, cut - 1, PKP.inside); }
        for (const [x, y, k] of lidRows) P.set(x + (o.lidDx || 0), y - 2, k);
        dot(P, cx - 2, cut, PKP.glow[1]); dot(P, cx - 1, cut, PKP.glow[2]); dot(P, cx + 1, cut, PKP.glow[2]); dot(P, cx + 2, cut, PKP.glow[1]);
      }
    }
    for (let i = 0; i < P.a.length; i++) if (P.a[i]) { const x = i % W, y = (i / W) | 0; if (B.get(x, y) && !(P.get(x - 1, y) && P.get(x + 1, y) && P.get(x, y - 1) && P.get(x, y + 1))) P.a[i] = PKP.groove; }
    for (let i = 0; i < P.a.length; i++) if (P.a[i]) B.a[i] = P.a[i];
    if (o.lid !== 'off') layer(B, T => {
      const top = o.lid === 'crack' ? by - 13 : by - 11, sx = cx + (o.lidDx || 0);
      limb(T, [sx, top + 1], [sx + 1, top - 2], 1.9, PKP.stem); dot(T, sx + 2, top - 2, PKP.stem[1]);
    });
    floorCut(B, F);
    const c = toCanvas(B);
    if (o.spores) afterDots(c, o.spores.map(([x, y], i) => [x, y, PKP.spore[i % 3]]));
    if (o.pulp) afterDots(c, o.pulp.map(([x, y], i) => [x, y, PKP.pulp[i % 3]]), true);
    return c;
  };
  const hidden = { leaf: true };
  const puff = { leaf: true, lid: 'crack', face: null, spores: [[X - 1, F - 14], [X + 2, F - 16], [X, F - 15], [X - 3, F - 17], [X + 4, F - 18], [X + 1, F - 19], [X - 2, F - 20], [X + 3, F - 22], [X, F - 23], [X + 5, F - 14], [X - 5, F - 15], [X + 1, F - 25]] };
  const LEGS = [[-4, -8, -3], [4, 8, 3], [-2, -3, -2], [2, 3, 2]];
  const burst = { lift: 7, lid: 'off', face: 'wide', legs: LEGS };
  const bite = { lift: 6, dx: 4, lid: 'off', face: 'snap', legs: [[-4, -5, -3], [4, 11, 3], [-2, -1, -2], [2, 6, 2]] };
  const walkA = { lift: 7, lid: 'off', face: 'wide', legs: [[-4, -9, -3], [4, 6, 3], [-2, -1, -2], [2, 5, 2]] };
  const walkB = { lift: 6, lid: 'off', face: 'wide', legs: [[-4, -6, -3], [4, 9, 3], [-2, -5, -2], [2, 1, 2]] };
  const hurt = { lift: 5, dx: -2, lid: 'off', face: 'snap', crack: true, legs: [[-4, -8, -3], [4, 5, 3], [-2, -4, -2], [2, 2, 2]],
    pulp: [[X - 8, F - 16], [X + 7, F - 18], [X - 5, F - 20], [X + 4, F - 21], [X - 10, F - 12], [X + 9, F - 13], [X, F - 22], [X - 2, F - 19]] };
  return pack([hidden, puff, burst, bite, walkA, walkB, hurt].map(frame), X, F + 1, 14, 12);
}
export const PUMPKIN_F = { hidden: 0, puffTell: 1, burst: 2, bite: 3, walk: [4, 5], hurt: 6 };

// ======================================================================================================================
// THE MARSHLIGHT
// ======================================================================================================================
const GG = ['#1f6a3a', '#3fbf5f', '#7dff8a', '#d8ffd0'];
export function bakeMarshlight() {
  const W = 22, H = 22, X = 11, CY = 12;
  const frame = o => {
    const B = buf(W, H), r = o.r || 4, cx = X + (o.dx || 0), cy = CY + (o.dy || 0), ph = o.ph || 0;
    /* the flicker tail: tongues of flame trailing back and up */
    layer(B, T => {
      /* the main flame, licking up and back off the top of the orb, and a torn-off tongue of it */
      for (let i = 12; i >= 1; i--) {
        const t = i / 12, x = cx - t * 5 + Math.sin(t * 4 + ph) * 1.4 * t, y = cy - t * 9, rr = r * 0.85 * (1 - t * 0.85);
        ball(T, x, y, rr, rr, GG, { flat: true, bias: -0.15 + t * 0.2 });
      }
      const fx = cx - 6 + Math.sin(ph) * 1.2, fy = cy - 8 - Math.cos(ph) * 1.2;
      dot(T, fx, fy, GG[2]); dot(T, fx, fy - 1, GG[1]);
      for (const [a, l] of [[-75 + Math.cos(ph) * 20, 3], [-130 + Math.sin(ph * 2) * 15, 3]]) {
        const rad = a * Math.PI / 180; seg(T, cx + Math.cos(rad) * (r - 1), cy + Math.sin(rad) * (r - 1), cx + Math.cos(rad) * (r + l - 2), cy + Math.sin(rad) * (r + l - 2), (j, n) => (j < n - 1 ? GG[1] : GG[2]));
      }
    }, GG[0]);
    /* the orb and its core */
    layer(B, T => {
      ball(T, cx, cy, r, r, o.flare ? [GG[1], GG[2], GG[3], '#ffffff'] : GG, { bias: 0.1 });
      ball(T, cx + 0.3, cy + 0.2, r * 0.45, r * 0.45, o.flare ? ['#ffffff'] : [GG[3], GG[3], '#f4fff0'], { flat: true });
      dot(T, cx + 1, cy - 0.5, '#0e2a18'); dot(T, cx + 2.6, cy - 0.5, '#0e2a18');
      if (o.flare) { dot(T, cx + 1, cy - 0.5, GG[0]); dot(T, cx + 2.6, cy - 0.5, GG[0]); }
    }, GG[0]);
    const c = toCanvas(B);
    if (o.sparks) afterDots(c, o.sparks, true);
    return c;
  };
  const frames = [frame({ ph: 0 }), frame({ ph: 1.6, dy: -0.4 }), frame({ ph: 3.2, r: 4.3 }), frame({ ph: 4.8, dy: 0.4 }),
    frame({ ph: 1, r: 5.4, flare: true, sparks: [[X - 7, CY - 7, GG[3]], [X + 7, CY - 6, '#ffffff'], [X + 8, CY + 2, GG[2]], [X - 2, CY - 9, '#ffffff'], [X + 3, CY + 8, GG[3]]] }),
    frame({ ph: 2.5, r: 3, sparks: [[X - 6, CY - 5, GG[2]], [X + 6, CY - 6, GG[3]], [X + 7, CY + 3, GG[2]], [X - 5, CY + 5, GG[3]], [X, CY - 8, '#ffffff'], [X + 1, CY + 7, GG[2]], [X - 8, CY, GG[3]], [X + 8, CY - 1, '#ffffff'], [X - 3, CY - 7, GG[1]], [X + 4, CY + 6, GG[1]]] })];
  let ay = 0; const g = frames[0].getContext('2d'), d = g.getImageData(0, 0, W, H).data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) ay = y;
  return pack(frames, X, ay, 10, 10);
}
export const MARSHLIGHT_F = { flicker: [0, 1, 2, 3], flareTell: 4, hurt: 5 };

// ======================================================================================================================
// THE HAUNT (a poltergeist pitchfork)
// ======================================================================================================================
const HTP = { wood: ['#4e3220', '#86592f', '#b8884c'], iron: ['#3e3a44', '#6e6a74', '#a8a4ac'], rust: ['#6a3420', '#a0582e', '#cc8a52'] };
/* the fork from its butt along deg: handle, a ferrule, a crossbar and three tines. bend (deg) kinks the handle halfway */
function fork(B, butt, deg, o = {}) {
  const L1 = 13, a0 = deg * Math.PI / 180, bend = (o.bend || 0) * Math.PI / 180;
  const mid = [butt[0] + Math.cos(a0) * L1 * 0.5, butt[1] + Math.sin(a0) * L1 * 0.5], a1 = a0 + bend;
  const head = [mid[0] + Math.cos(a1) * L1 * 0.5, mid[1] + Math.sin(a1) * L1 * 0.5];
  limb(B, butt, mid, 2, HTP.wood); limb(B, mid, head, 2, HTP.wood);
  const d = [Math.cos(a1), Math.sin(a1)], n = [-d[1], d[0]], Wp = (u, v) => [head[0] + d[0] * u + n[0] * v, head[1] + d[1] * u + n[1] * v];
  limb(B, Wp(0, 0), Wp(1.5, 0), 2.6, HTP.iron);
  for (let v = -3; v <= 3; v += 0.5) dot(B, ...Wp(2.5, v), v < 0 ? HTP.iron[2] : HTP.iron[1]);
  for (const [v, bendT] of [[-3, o.tineBend ? -1.8 : 0], [0, 0], [3, 0]]) {
    for (let u = 3; u <= 9; u += 0.5) {
      const t = (u - 3) / 6, vv = v * (1 - t * 0.25) + bendT * t * t * 3;
      dot(B, ...Wp(u, vv), u > 7.5 ? HTP.iron[2] : ((u * 2) % 5 === 1 ? HTP.rust[2] : (u > 5.5 ? HTP.rust[1] : HTP.rust[0])));
    }
  }
  return { head, d, n, mid };
}
function hauntRing(c, cx, cy, d, rw, rh, bright, phase = 0) {
  const n = [-d[1], d[0]], back = [], front = [];
  for (let i = 0; i < 64; i++) {
    const th = i / 64 * Math.PI * 2 + phase, s = Math.sin(th), x = cx + n[0] * rw * Math.cos(th) + d[0] * rh * s, y = cy + n[1] * rw * Math.cos(th) + d[1] * rh * s;
    if (!bright && (i % 16 === 7 || i % 16 === 8)) continue;
    const col = i % 16 === 0 ? '#eef6ff' : (s > 0 ? (bright ? '#eef6ff' : '#c8dcf5') : '#9ab8e0');
    (s > 0 ? front : back).push([x, y, col]);
  }
  afterDots(c, back, true); afterDots(c, front, false);
}
/* the haunt's glow hugging the whole tool: a checker of dim moon-blue just outside the rim, solid and brighter on the tell */
function haloGlow(c, bright) {
  const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data, on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  const pts = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (on(x, y)) continue;
    if ((on(x + 1, y) || on(x - 1, y) || on(x, y + 1) || on(x, y - 1)) && (bright || (x + y) % 2 === 0)) pts.push([x, y, bright ? '#9ab8e0' : '#4a5a80']);
  }
  for (const [x, y, col] of pts) px(g, x, y, col);
}
export function bakeHaunt() {
  const W = 28, H = 28, X = 14;
  const frame = o => {
    const B = buf(W, H);
    const f = fork(B, o.butt, o.deg, o);
    const c = toCanvas(B);
    haloGlow(c, !!o.bright);
    const rc = [f.mid[0] + f.d[0] * 2, f.mid[1] + f.d[1] * 2];
    hauntRing(c, rc[0], rc[1], f.d, o.bright ? 7 : 6, 1.5, o.bright, o.phase || 0);
    /* A FACE IN THE HAUNTING, not a body on it: two hollow eyes and a mouth held in the swirl round the fork's
       neck, so what used to read as a loose blue smear now reads as something LOOKING at you - the same hollow
       dark the fields' other ghosts use, small enough that the fork is still the thing nobody is holding */
    afterDots(c, [[rc[0] - 2, rc[1] - 0.5, '#141824'], [rc[0] + 2, rc[1] - 0.5, '#141824'], [rc[0], rc[1] + 2, '#141824']], false);
    if (o.shake) afterDots(c, o.shake, true);
    return c;
  };
  const hoverA = { butt: [X, 25], deg: -90 };
  const hoverB = { butt: [X - 3, 24], deg: -72, phase: 0.5 };
  const tell = { butt: [X - 9, 19], deg: -20, bright: true, phase: 0.2,
    shake: [[X - 12, 12, '#c8dcf5'], [X - 12, 14, '#9ab8e0'], [X - 11, 23, '#c8dcf5'], [X - 13, 21, '#9ab8e0'], [X + 2, 5, '#eef6ff'], [X + 4, 27, '#eef6ff']] };
  const thrown = { butt: [X - 12, 14], deg: 0 };
  const hurt = { butt: [X - 2, 25], deg: -80, bend: -40, tineBend: true, phase: 1.2 };
  const frames = [hoverA, hoverB, tell, thrown, hurt].map(frame);
  let ay = 0; const g = frames[0].getContext('2d'), d = g.getImageData(0, 0, W, H).data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) ay = y;
  return pack(frames, X, ay, 8, 22);
}
export const HAUNT_F = { hover: [0, 1], throwTell: 2, thrown: 3, hurt: 4 };

// ======================================================================================================================
// THE BOO (a Mario boo, dropped into the Hexed Fields) — a round, floating thing that only moves while your back is
// turned. Faced, it stops dead and covers its eyes with both paws: harmless, and it does not move at all. Violet-white,
// never blue like the haunt or green-grey like the wight, and round where they are a tool and a block - the one shape
// in the family with no legs, no tool and no cap, just a body and a wisp of a tail.
// ======================================================================================================================
const BOOP = { skin: ['#463a72', '#8478c0', '#cfc8f4', '#f8f4ff'], hollow: '#120f22', paw: ['#382c5c', '#6a5aa8', '#c0b4ec'] };
function booPaw(T, x, y, o = {}) { ball(T, x, y, 3, 3.2, BOOP.paw, { bias: 0.16, tilt: o.tilt || 0 }); }
export function bakeBoo() {
  const W = 26, H = 30, X = 13, F = 27, cx = X, cy = F - 14, r = 9;
  const frame = o => {
    const B = buf(W, H);
    layer(B, T => wisp(T, [cx, cy + 7], F, o.swirl || 1, 1.15), BOOP.skin[0]);   /* the tail: wider than the farmhand's, no legs at all */
    layer(B, T => ball(T, cx, cy, r, r * 1.05, BOOP.skin, { bias: 0.14 }));      /* the round body: the whole silhouette, not a head on a torso */
    if (!o.cover) layer(B, T => { ball(T, cx - r + 2, cy + 5, 2.6, 2.6, BOOP.skin, { bias: 0.08 }); ball(T, cx + r - 2, cy + 5, 2.6, 2.6, BOOP.skin, { bias: 0.08 }); }, BOOP.skin[0]);   /* stubby arms at rest */
    else layer(B, T => { booPaw(T, cx - 3.5, cy - 2 + (o.shiver || 0), { tilt: -0.3 }); booPaw(T, cx + 3.5, cy - 2 - (o.shiver || 0), { tilt: 0.3 }); }, BOOP.paw[0]);   /* BOTH PAWS OVER THE FACE: the whole tell, no text needed */
    const c = toCanvas(B);
    haloGlow(c, !!o.bright);
    if (!o.cover) {
      afterDots(c, [[cx - 3, cy - 1, BOOP.hollow], [cx + 3, cy - 1, BOOP.hollow]], false);   /* hollow eyes, watching for your back to turn */
      afterDots(c, [[cx - 2, cy + 3, BOOP.hollow], [cx - 1, cy + 4, BOOP.hollow], [cx, cy + 4, BOOP.hollow], [cx + 1, cy + 4, BOOP.hollow], [cx + 2, cy + 3, BOOP.hollow]], false);   /* a jagged little grin */
    }
    if (o.hurt) afterDots(c, [[cx - 5, cy - 6, BOOP.paw[2]], [cx + 6, cy - 5, '#f8f4ff'], [cx - 6, cy + 2, BOOP.paw[1]], [cx + 5, cy + 7, BOOP.paw[2]]], true);
    return c;
  };
  const driftA = { swirl: 1 };
  const driftB = { swirl: -1 };
  const freezeA = { cover: true, bright: true };
  const freezeB = { cover: true, bright: true, shiver: 1 };
  const hurt = { swirl: -1, hurt: true };
  const frames = [driftA, driftB, freezeA, freezeB, hurt].map(frame);
  let ay = 0; const g = frames[0].getContext('2d'), d = g.getImageData(0, 0, W, H).data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) ay = y;
  return pack(frames, X, ay, 14, 20);
}
export const BOO_F = { drift: [0, 1], freeze: [2, 3], hurt: 4 };

// ======================================================================================================================
// THE FAMILY'S GHOSTS (friendly)
// ======================================================================================================================
const FG = { dark: '#4a5a80', mid: '#7e98c4', warm: '#ffd36b', warmD: '#e8a860', cheek: '#e8c8d8', doll: ['#8a7a9a', '#c0b0d0', '#e4d8f0'], button: '#2a2440' };
/* a kind face looking right: warm eyes, a soft mouth */
function kindFace(T, hd, o = {}) {
  dot(T, hd[0] + 0.5, hd[1], FG.warmD); dot(T, hd[0] + 2.5, hd[1], FG.warm);
  if (o.blink) { dot(T, hd[0] + 0.5, hd[1], FG.dark); dot(T, hd[0] + 2.5, hd[1], FG.dark); }
  dot(T, hd[0] + 3.2, hd[1] + 1.5, FG.cheek);
  dot(T, hd[0] + 1.5, hd[1] + 2.4, GH[0]); dot(T, hd[0] + 2.5, hd[1] + 2.2, GH[0]);
}
export function bakeFarmGhosts() {
  const legs = (T, X, F, hip, gap) => {
    limb(T, [X - gap, hip], [X - gap, F - 1], 2.6, GH); limb(T, [X + gap, hip], [X + gap, F - 1], 2.8, GH);
    for (const [lx, k] of [[X - gap, GH[0]], [X + gap, GHP.cap[1]]]) { seg(T, lx - 1, F, lx + 2, F, k); dot(T, lx - 1, F - 1, k); dot(T, lx + 1, F - 1, k); }
  };
  // THE FARMER: broad, in overalls, a beard to his chest and a wide straw hat
  const farmer = b => {
    const W = 22, H = 30, X = 11, F = 27, B = buf(W, H), up = b ? -1 : 0, hd = [X + 1, F - 18 + up];
    layer(B, T => legs(T, X, F, F - 9, 2));
    layer(B, T => { limb(T, [X - 3, F - 14 + up], [X - 5, F - 7], 2.8, GH); ball(T, X - 5, F - 7, 1.4, 1.4, GH); }, GH[0]);
    layer(B, T => {
      poly(T, [[X - 5, F - 15 + up], [X + 5, F - 15 + up], [X + 5, F - 8], [X - 5, F - 8]], (x, y) => (x < X - 2 ? GH[2] : x > X + 2 ? GH[0] : GH[1]));
      poly(T, [[X - 3, F - 12 + up], [X + 3, F - 12 + up], [X + 4, F - 7], [X - 4, F - 7]], (x, y) => (x < X - 1 ? GHP.cap[2] : GHP.cap[1]));
      dot(T, X - 2, F - 12 + up, GH[3]); dot(T, X + 2, F - 12 + up, GH[3]);
      seg(T, X - 2, F - 15 + up, X - 2, F - 12 + up, GHP.cap[0]); seg(T, X + 2, F - 15 + up, X + 2, F - 12 + up, GHP.cap[0]);
      dot(T, X, F - 10 + up, GHP.cap[0]);
    }, GH[0]);
    layer(B, T => {
      ball(T, hd[0], hd[1], 3.3, 3.5, GH, { bias: 0.1 });
      /* the beard, full and to the chest */
      poly(T, [[hd[0] - 2, hd[1] + 1], [hd[0] + 4, hd[1] + 1], [hd[0] + 3.5, hd[1] + 4], [hd[0] + 1, hd[1] + 7], [hd[0] - 1.5, hd[1] + 4]], (x, y) => ((x + y) % 3 === 0 ? GH[2] : GH[3]));
      kindFace(T, hd, { blink: false });
      dot(T, hd[0] + 1.5, hd[1] + 2.4, GH[1]); dot(T, hd[0] + 2.5, hd[1] + 2.2, GH[0]);
      /* the straw hat, wide and low */
      poly(T, [[hd[0] - 2.5, hd[1] - 2], [hd[0] - 2, hd[1] - 5.5], [hd[0] + 2.5, hd[1] - 5.5], [hd[0] + 3, hd[1] - 2]], (x, y) => (x < hd[0] ? '#e4ecf8' : GH[2]));
      limb(T, [hd[0] - 6, hd[1] - 2], [hd[0] + 6, hd[1] - 2], 1.8, [GH[0], GH[2], GH[3]]);
      seg(T, hd[0] - 2, hd[1] - 3, hd[0] + 2, hd[1] - 3, GH[0]);
    }, GH[0]);
    layer(B, T => { limb(T, [X + 3, F - 14 + up], [X + 5, F - 8], 2.8, GH); ball(T, X + 5, F - 7.5, 1.4, 1.4, GH, { bias: 0.1 }); }, GH[0]);
    floorCut(B, F); return toCanvas(B);
  };
  // THE FARMWIFE: a long skirt to the floor, an apron, a shawl over the shoulders and a bonnet
  const wife = b => {
    const W = 22, H = 30, X = 11, F = 27, B = buf(W, H), up = b ? -1 : 0, hd = [X + 1, F - 17 + up];
    layer(B, T => {
      poly(T, [[X - 3, F - 12], [X + 3, F - 12], [X + 6, F], [X - 6, F]], (x, y) => (x < X - 2 ? GH[2] : x > X + 3 ? GH[0] : GH[1]));
      poly(T, [[X, F - 11], [X + 4, F - 11], [X + 5, F - 2], [X + 1, F - 2]], (x, y) => (x < X + 2 ? GH[3] : GH[2]));
      for (let x = X - 5; x <= X + 5; x += 2) dot(T, x, F, GH[0]);
    }, GH[0]);
    layer(B, T => {
      /* the shawl, crossed over the chest */
      poly(T, [[X - 5, F - 14 + up], [X + 5, F - 14 + up], [X + 4, F - 10], [X + 1, F - 8], [X - 5, F - 10]], (x, y) => (x < X - 1 ? GHP.cap[2] : (x + y) % 4 === 0 ? GHP.cap[0] : GHP.cap[1]));
      dot(T, X + 1, F - 9, GH[3]); dot(T, X - 5, F - 9, GHP.cap[1]); dot(T, X - 6, F - 8, GHP.cap[0]);
      limb(T, [X + 2, F - 11], [X + 4, F - 11], 2, GH);
    }, GH[0]);
    layer(B, T => {
      ball(T, hd[0], hd[1], 3.1, 3.3, GH, { bias: 0.1 });
      kindFace(T, hd);
      /* the bonnet: a deep brim round the face and a frill behind, its ribbon under the chin */
      poly(T, [[hd[0] - 4, hd[1] + 2], [hd[0] - 4, hd[1] - 3], [hd[0] - 1, hd[1] - 5], [hd[0] + 3, hd[1] - 4.5], [hd[0] + 4.5, hd[1] - 2], [hd[0] + 2, hd[1] - 2.5], [hd[0] - 1, hd[1] - 1], [hd[0] - 1.5, hd[1] + 2.5]], (x, y) => (x < hd[0] - 1 ? GH[3] : GH[2]));
      seg(T, hd[0] + 4, hd[1] - 2, hd[0] + 1, hd[1] - 2.5, GH[0]);
      dot(T, hd[0] - 1, hd[1] + 3.5, GHP.cap[1]); dot(T, hd[0], hd[1] + 3.5, GHP.cap[0]);
    }, GH[0]);
    floorCut(B, F); return toCanvas(B);
  };
  // THE CHILD: small, in a smock, hugging a rag doll
  const child = b => {
    const W = 18, H = 22, X = 9, F = 19, B = buf(W, H), up = b ? -1 : 0, hd = [X + 1, F - 11 + up];
    layer(B, T => legs(T, X, F, F - 4, 1));
    layer(B, T => poly(T, [[X - 3, F - 8 + up], [X + 3, F - 8 + up], [X + 4, F - 3], [X - 4, F - 3]], (x, y) => (x < X - 1 ? GH[2] : x > X + 2 ? GH[0] : GH[1])), GH[0]);
    layer(B, T => {
      ball(T, hd[0], hd[1], 3, 3, GH, { bias: 0.12 });
      kindFace(T, [hd[0] - 0.5, hd[1]], { blink: false });
      /* hair: a mop over the brow and a tuft behind */
      poly(T, [[hd[0] - 3.5, hd[1] + 0.5], [hd[0] - 3, hd[1] - 2.5], [hd[0], hd[1] - 3.8], [hd[0] + 3, hd[1] - 2.5], [hd[0] + 3, hd[1] - 1], [hd[0] + 0.5, hd[1] - 1.8], [hd[0] - 1.5, hd[1] + 0.5]], (x, y) => ((x + y) % 3 === 0 ? GH[0] : GHP.cap[2]));
    }, GH[0]);
    /* the doll, held against the chest, one arm of it swinging */
    layer(B, T => {
      const dx = X + 3, dy2 = F - 7 + up;
      limb(T, [dx, dy2 - 1], [dx, dy2 + 2], 2.4, FG.doll);
      ball(T, dx + 0.5, dy2 - 2.5, 1.6, 1.6, FG.doll, { flat: true });
      dot(T, dx + 1, dy2 - 3, FG.button); dot(T, dx, dy2 - 4, '#e8a860'); dot(T, dx - 1, dy2 - 3, '#e8a860');
      seg(T, dx + 1, dy2 + 3, dx + (b ? 3 : 2), dy2 + 5, FG.doll[0]);
    }, GH[0]);
    layer(B, T => { limb(T, [X + 2, F - 8 + up], [X + 3, F - 5 + up], 2.2, GH); ball(T, X + 4, F - 5 + up, 1.2, 1.2, GH, { bias: 0.1 }); }, GH[0]);
    floorCut(B, F); return toCanvas(B);
  };
  return {
    farmer: pack([farmer(false), farmer(true)], 11, 28, 10, 24),
    wife: pack([wife(false), wife(true)], 11, 28, 10, 22),
    child: pack([child(false), child(true)], 9, 20, 8, 15),
  };
}
