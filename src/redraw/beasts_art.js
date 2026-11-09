// beasts_art.js - THE FROST BEASTS (claude/foesart): SNOWRUNNER, GREYMANE, BRUIN (+ the grizzled 'bruinfrost' coat). Real art at the house bar, drawn from px.js primitives plus the form-shader below
// (tapered capsules lit from above-front, a five-step cool-shadow / warm-light ramp, 4x4 ordered dither and a little fur noise tied to the limb so it does not crawl), two-bone leg IK, fur tufts on the silhouette.
// The contract hornsman_art.js keeps: every frame faces RIGHT (L is the flip), every frame of a sprite shares one canvas, ax = the body's centre column, ay = the row under the lowest pixel (settleFrame), w/h = the hit box.
// Frame lists (src/beasts.js BEAST_FRAMES, unchanged from the placeholder pass):
//   SNOWRUNNER (13): 0-1 idle | 2-5 run | 6 snap tell (half-crouch, ears back) | 7 snap | 8 leap tell (rears back, frost puff) | 9 leap | 10 skid | 11 hurt | 12 death
//   GREYMANE   (14): 0-1 idle | 2-5 walk | 6 bite tell (head low, jaws wide) | 7 bite | 8 pounce coil | 9 pounce air | 10 pin | 11 winded | 12 hurt | 13 death
//   BRUIN      (16): 0-1 idle | 2-5 walk | 6 stand + roar | 7 stood, open | 8 maul | 9 charge tell (head low, scrape) | 10-12 charge | 13 dazed | 14 hurt | 15 death
// TELL POSES ARE BUILT TO BE READ AT 1x AND WHITED OUT: every tell frame differs from the stand by SILHOUETTE (crouch / rear / head height / jaw), not by colour, so the engine's opening white flash
// (drawTellFlash) and the amber rim still show a pose. Foe-hands also never draws the white frame over the tell on these kinds (src/main.js drawTellFlash).
import { canvas, px, rect, fillPoly, line, outline, flipX, whiten, hex, rgb } from '../px.js';
import { OUT } from '../art.js';

export function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
export function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
export const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f, c); outline(c, OUT); return settleFrame(c); });

/* ---- the form shader ---- */
const hash = (a, b, s) => { let h = (a * 374761393 + b * 668265263 + s * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const mix = (a, b, k) => { const p = rgb(a), q = rgb(b); return hex(p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k); };
/* five steps, dark to light: shadows slide to a cool violet, lights to a warm white (one hue shift, the house way) */
export const ramp = (base, cool = '#1f1a33', warm = '#fff3dc') => [mix(base, cool, 0.62), mix(base, cool, 0.34), base, mix(base, warm, 0.26), mix(base, warm, 0.52)];

/* a capsule from (ax,ay,r=ar) to (bx,by,br), lit from above and a little in front */
export function taper(g, ax, ay, ar, bx, by, br, R, o = {}) {
  const x0 = Math.floor(Math.min(ax - ar, bx - br)) - 1, x1 = Math.ceil(Math.max(ax + ar, bx + br)) + 1, y0 = Math.floor(Math.min(ay - ar, by - br)) - 1, y1 = Math.ceil(Math.max(ay + ar, by + br)) + 1;
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, LL = Math.sqrt(L2), n = R.length, amp = o.noise === undefined ? 0.15 : o.noise, seed = o.seed || 1, lx = o.lx === undefined ? 0.35 : o.lx, ly = o.ly === undefined ? -0.9 : o.ly, bias = o.bias === undefined ? -0.1 : o.bias - 0.1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const pxx = x + 0.5, pyy = y + 0.5; let s = ((pxx - ax) * dx + (pyy - ay) * dy) / L2; s = s < 0 ? 0 : s > 1 ? 1 : s;
    const cx = ax + dx * s, cy = ay + dy * s, r = ar + (br - ar) * s, ddx = pxx - cx, ddy = pyy - cy;
    if (ddx * ddx + ddy * ddy > r * r) continue;
    const nx = ddx / r, ny = ddy / r, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    let t = 0.5 + 0.5 * (nx * lx + ny * ly + nz * 0.35); t = 0.5 + (o.gain || 1.35) * (t - 0.5) + bias;
    t += (B4[y & 3][x & 3] / 16 - 0.5) * 0.16 + (hash(Math.floor(s * LL), Math.round(ddy), seed) - 0.5) * amp;
    g.fillStyle = R[Math.max(0, Math.min(n - 1, Math.floor(t * n)))]; g.fillRect(x, y, 1, 1);
  }
}
/* two-bone IK: the joint between hip and foot, bent to one side (bend +1 = the joint points back, -1 = forward, for a right-facing body) */
export function ik(hx, hy, fx, fy, l1, l2, bend) {
  let dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy) || 0.01; const dm = l1 + l2 - 0.05; if (d > dm) { fx = hx + dx * dm / d; fy = hy + dy * dm / d; dx = fx - hx; dy = fy - hy; d = dm; }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), ux = dx / d, uy = dy / d;
  return [hx + ux * a + uy * h * bend, hy + uy * a - ux * h * bend, fx, fy];
}
/* little hairs on the silhouette: p = chance per exposed edge pixel */
export function tufts(c, col, seed, p, up = 1, down = 0, back = 0) {
  const g = c.getContext('2d'), W = c.width, H = c.height, d = g.getImageData(0, 0, W, H).data, A = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0, out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (!A(x, y)) continue;
    if (up && !A(x, y - 1) && hash(x, y, seed) < p) out.push([x, y - 1]);
    if (down && !A(x, y + 1) && hash(x, y, seed + 7) < p) out.push([x, y + 1]);
    if (back && !A(x - 1, y) && hash(x, y, seed + 13) < p) out.push([x - 1, y]); }
  g.fillStyle = col; for (const [x, y] of out) g.fillRect(x, y, 1, 1);
}
/* a lit edge: the pixels with nothing above (and optionally in front) go one step lighter, so the top of the back catches the light */
export function rimlight(c, col, front = 0, seed = 3, p = 0.8) {
  const g = c.getContext('2d'), W = c.width, H = c.height, d = g.getImageData(0, 0, W, H).data, A = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0, out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (!A(x, y)) continue; if ((!A(x, y - 1) || (front && !A(x + 1, y))) && hash(x, y, seed) < p) out.push([x, y]); }
  g.fillStyle = col; for (const [x, y] of out) g.fillRect(x, y, 1, 1);
}

export const BC = {
  snow: '#dbe7f0', snowSaddle: '#8fa6bd', ear: '#1c2230', eye: '#9ed8ff', nose: '#222a38', breath: '#eef8ff',
  grey: '#6b717e', greyMane: '#4a505e', ice: '#bfe8ff', scar: '#d8cfc0', eyeG: '#ffd36b',
  brown: '#5c3b27', snout: '#a8845c', claw: '#eee6d4', frostFur: '#a49d92', frostSaddle: '#5c4636', mouth: '#3a0e18', tooth: '#fffaf0' };

/* ---- one four-legged beast, facing right. rig: the body; p: the pose ---- */
function quad(g, c, rig, p) {
  const R = rig.R, Rf = rig.Rf, bd = p.dy || 0, ch = p.chestDy || 0, rp = p.rumpDy || 0;
  const rump = [rig.rump[0] + (p.rumpDx || 0), rig.rump[1] + bd + rp, rig.rump[2] * (p.rumpK || 1)], chest = [rig.chest[0] + (p.chestDx || 0), rig.chest[1] + bd + ch, rig.chest[2] * (p.chestK || 1)];
  const hipR = [rump[0] - 0.5, rump[1] + rump[2] * 0.45], hipF = [chest[0] - 0.3, chest[1] + chest[2] * 0.4], gy = rig.gy;
  const H = p.head || {}, S = [chest[0] + rig.neck[0] + (H.dx || 0), chest[1] + rig.neck[1] + (H.dy || 0)], sa = H.tilt || 0, sr = rig.skull * (p.headK || 1), snl = rig.snout * (H.snl || 1);
  const tip = [S[0] + Math.cos(sa) * snl, S[1] + Math.sin(sa) * snl];
  /* feet: [hindFar, frontFar, hindNear, frontNear] as [dx, lift] off the hip, from the pose or from the gait phase */
  const feet = p.feet || (p.gait ? p.gait.map((ph, i) => { const a = ph * Math.PI * 2, st = (p.stride || rig.stride); return [Math.sin(a) * st, Math.max(0, Math.cos(a)) * (p.liftK || 1) * rig.lift]; }) : [[0, 0], [0, 0], [0, 0], [0, 0]]);
  const leg = (i) => { const hip = i % 2 === 0 ? hipR : hipF, f = feet[i], ex = hip[0] + f[0], ey = gy - f[1] + (p.legDy || 0), far = i < 2, hind = i % 2 === 0;
    const [kx, ky] = ik(hip[0], hip[1], ex, ey, rig.l1, rig.l2, hind ? 1 : 0.55); return { hip, kx, ky, ex, ey, far, hind }; };
  const drawLeg = (L) => { const RR = L.far ? Rf : R, r0 = L.far ? rig.legR + 0.3 : (L.hind ? rig.legR * 1.9 : rig.legR * 1.5);
    if (!L.far) { taper(g, L.hip[0], L.hip[1], r0 + 0.9, L.kx, L.ky, rig.legR * 0.8 + 0.8, [RR[0]], { noise: 0 }); taper(g, L.kx, L.ky, rig.legR * 0.8 + 0.8, L.ex, L.ey - 0.6, rig.legR * 0.62 + 0.7, [RR[0]], { noise: 0 }); }
    taper(g, L.hip[0], L.hip[1], r0, L.kx, L.ky, rig.legR * 0.8, RR, { seed: 11 + (L.far ? 1 : 0) });
    taper(g, L.kx, L.ky, rig.legR * 0.8, L.ex, L.ey - 0.6, rig.legR * 0.62, RR, { seed: 21 });
    const pw = L.far ? rig.paw : rig.pawN; rect(g, L.ex - 1, L.ey - 1, 3, 2, pw); px(g, L.ex + 2, L.ey - 1, rig.pawN); };
  const legs = [0, 1, 2, 3].map(leg);
  legs.filter(l => l.far).forEach(drawLeg);
  /* tail */
  const T = p.tail || { a: 0.5, l: rig.tail }, ta = Math.PI + T.a, tl = T.l, mid = [rump[0] + Math.cos(ta) * tl * 0.55, rump[1] - 0.5 + Math.sin(ta) * tl * 0.55 + (T.sag || 0)], end = [rump[0] + Math.cos(ta) * tl, rump[1] - 0.5 + Math.sin(ta) * tl + (T.sag || 0) * 1.6];
  taper(g, rump[0] - 1, rump[1] - 1, rig.tailR, mid[0], mid[1], rig.tailR * 0.95, R, { seed: 5 }); taper(g, mid[0], mid[1], rig.tailR * 0.95, end[0], end[1], rig.tailR * 0.45, R, { seed: 6 });
  taper(g, mid[0] + (end[0] - mid[0]) * 0.55, mid[1] + (end[1] - mid[1]) * 0.55, rig.tailR * 0.8, end[0], end[1], rig.tailR * 0.42, rig.tailRamp || Rf, { seed: 7 });
  /* body: rump to chest, then the neck up to the skull */
  taper(g, rump[0], rump[1], rump[2], chest[0], chest[1], chest[2], R, { seed: 2 });
  if (rig.saddle) taper(g, rump[0] + 1, rump[1] - rump[2] * 0.55, rump[2] * 0.5, chest[0], chest[1] - chest[2] * 0.62, chest[2] * 0.5, rig.saddle, { seed: 4, noise: 0.2 });
  taper(g, chest[0] + 0.5, chest[1] - 0.8, chest[2] * 0.82, S[0], S[1] + 0.8, sr * 1.02, R, { seed: 3, bias: -0.1 });
  if (rig.mane) rig.mane(g, c, chest, S, rump, p);
  /* head: far ear, skull + snout, the jaw, the near ear, the eye */
  const jaw = H.jaw || 0;
  const earA = (H.ear === 'back' ? -2.2 : H.ear === 'flat' ? -2.8 : -1.25), ex = S[0] - 0.6, ey = S[1] - sr * 0.7;
  const ear = (dx, col) => { const e0 = [ex + dx, ey + 0.8], e1 = [e0[0] + Math.cos(earA) * rig.ear, e0[1] + Math.sin(earA) * rig.ear * (H.ear === 'flat' || H.ear === 'back' ? 0.55 : 1)]; fillPoly(g, [[e0[0] - 1.4, e0[1]], [e1[0], e1[1]], [e0[0] + 1.6, e0[1]]], col); px(g, e1[0], e1[1], rig.earTip); };
  ear(-1.2, rig.earFar);
  taper(g, S[0] - 0.5, S[1] - 0.2, sr + 0.8, tip[0], tip[1], rig.snoutR + 0.6, [R[0]], { noise: 0 }); taper(g, S[0], S[1], sr, tip[0], tip[1], rig.snoutR, R, { seed: 8, noise: 0.08, bias: 0.08 });
  if (jaw > 0) {
    const ja = sa + 0.35 + jaw * 0.11, jt = [S[0] + 0.5 + Math.cos(ja) * snl * 0.95, S[1] + sr * 0.35 + Math.sin(ja) * snl * 0.95];
    const mo = [(S[0] + tip[0]) / 2 + 0.5, (S[1] + tip[1]) / 2 + 1.2];
    fillPoly(g, [[S[0] + 1, S[1] + sr * 0.2], [tip[0], tip[1] + rig.snoutR * 0.5], [jt[0], jt[1] - 0.3], [S[0] + 0.5, S[1] + sr * 0.6]], BC.mouth);
    taper(g, S[0] + 0.5, S[1] + sr * 0.35, sr * 0.55, jt[0], jt[1], rig.snoutR * 0.7, Rf, { seed: 9, noise: 0.05 });
    px(g, tip[0] - 1, tip[1] + 1.4, BC.tooth); px(g, tip[0] - 3, tip[1] + 1.6, BC.tooth); px(g, jt[0] - 1, jt[1] - 1, BC.tooth); px(g, jt[0] - 3, jt[1] - 1.4, BC.tooth);
  } else if (rig.fang) px(g, tip[0] - 1, tip[1] + 1.6, BC.tooth);
  px(g, tip[0] + 0.3, tip[1] - 0.6, rig.nose); px(g, tip[0] - 0.7, tip[1] - 0.6, rig.nose);
  if (rig.snoutLight) rect(g, tip[0] - 2.5, tip[1] - 0.2, 3, 1, rig.snoutLight);
  ear(0.8, rig.ear2);
  const eyx = S[0] + sr * 0.35, eyy = S[1] - sr * 0.25 + Math.sin(sa) * 0.6; px(g, eyx, eyy, p.eye || rig.eye); if (!p.eye) px(g, eyx - 1, eyy - 1, rig.brow);
  legs.filter(l => !l.far).forEach(drawLeg);
  return { S, tip, rump, chest, legs, hipR, hipF, gy };
}

const SNOW_R = ramp('#d2e0ec', '#34456a', '#ffffff'), SNOW_RF = ramp('#a3b6c9', '#26304e', '#e4eef8'), SNOW_SAD = ramp('#b4c6d8', '#4a5878', '#f4f9ff');
const SNOW_RIG = { R: SNOW_R, Rf: SNOW_RF, saddle: SNOW_SAD, rump: [9.5, 11.4, 3.7], chest: [17, 10.8, 4.2], neck: [4.4, -2.4], skull: 3.9, snout: 5, snoutR: 1.7, gy: 20, l1: 3.4, l2: 3.6, legR: 1.45, stride: 3.4, lift: 2.8, tail: 8.5, tailR: 2.5, tailRamp: SNOW_SAD,
  paw: '#aebfd0', pawN: '#e8f0f6', tailTip: '#46587a', nose: '#222a38', eye: BC.eye, brow: '#46587a', ear: 5, earTip: BC.ear, earFar: SNOW_RF[1], ear2: SNOW_R[2], fang: true, snoutLight: '#f4faff' };

export function bakeSnowrunner() {
  const W = 34, H = 24;
  const F = frames(W, H, 13, (g, f, c) => {
    const run = f >= 2 && f <= 5, k = f - 2; let p = { head: {}, tail: { a: 0.45, l: 7.5 } };
    if (f <= 1) p = { dy: f ? 0.5 : 0, head: { dy: f ? 0.4 : 0 }, tail: { a: 0.5, l: 7.5 }, feet: [[-1, 0], [0.5, 0], [-0.5, 0], [1, 0]] };
    else if (run) { const ph = k / 4; p = { gait: [ph + 0.45, ph + 0.05, ph + 0.4, ph], dy: -Math.abs(Math.sin(ph * Math.PI * 2)) * 1.4 + 0.5, chestDy: 0.4, head: { dx: 0.5, dy: 0.3, tilt: 0.1 }, tail: { a: 0.15, l: 8 }, stride: 4.2, liftK: 1.3 }; }
    else if (f === 6) p = { dy: 3.4, chestDy: 0.8, rumpDy: -0.6, head: { dx: -0.5, dy: 1.8, tilt: 0.12, ear: 'flat', snl: 1 }, tail: { a: -0.55, l: 7, sag: 0 }, feet: [[-3.5, 0], [4.5, 0], [-2.5, 0], [5.5, 0]], legDy: 0 };   // snap tell: belly low, hindquarters coiled up, ears flat, head down at the hero
    else if (f === 7) p = { dy: 1.2, rumpDx: -1.5, chestDx: 2, chestDy: 0.4, head: { dx: 2.5, dy: 1, tilt: 0.2, jaw: 3 }, tail: { a: 0.1, l: 8 }, feet: [[-5, 0.5], [3.5, 0], [-3, 0], [6, 0.5]] };                            // snap: darting in, jaws open
    else if (f === 8) p = { dy: -0.2, rumpDy: 3.2, chestDy: -3.6, rumpDx: -0.5, chestDx: -3, head: { dx: -0.5, dy: -1.5, tilt: -0.55, ear: 'up', snl: 1 }, tail: { a: -0.2, l: 7, sag: 1.5 }, feet: [[-2, 0], [2.5, 3], [-0.5, 0], [4, 3.5]], legDy: 0 };   // leap tell: REARED - forequarters up, head thrown up, hindquarters sat low
    else if (f === 9) p = { dy: -4.5, rumpDy: 0.5, chestDy: -1, chestDx: 2, rumpDx: -2, head: { dx: 3, dy: 0, tilt: 0.05, jaw: 2 }, tail: { a: 0.05, l: 8 }, feet: [[-6, 1.5], [-4, 2], [4, 1.2], [6.5, 1.5]], legDy: -1 };       // leap: a stretched line, at the throat
    else if (f === 10) p = { dy: 1.2, rumpDy: -0.5, chestDy: 0.7, head: { dx: 1, dy: 1.4, tilt: 0.2 }, tail: { a: 0.55, l: 7 }, feet: [[-4.5, 0], [-4, 0], [4, 0], [5.5, 0]], legDy: 0 };                         // skid: forelegs braced out front, sliding
    else if (f === 11) p = { dy: 0.8, chestDy: 1, head: { dx: -2, dy: 1.6, tilt: 0.3, ear: 'back' }, eye: '#ffffff', tail: { a: 0.9, l: 6 }, feet: [[-3, 0], [-1, 0], [0, 0], [2, 0]] };                                  // hurt: flinching back, ears flat
    else if (f === 12) p = { dy: 6.5, rumpDy: 0.2, chestDy: 0.4, head: { dx: 1.5, dy: 3.4, tilt: 0.55, ear: 'flat' }, eye: '#46587a', tail: { a: 1.3, l: 6 }, feet: [[-4, 0.5], [3.5, 0.5], [-1, 0.5], [5.5, 0.5]] }; // death: down on its side
    const r = quad(g, c, SNOW_RIG, p);
    tufts(c, SNOW_R[3], 31, 0.13, 0, 1, 0); tufts(c, SNOW_R[4], 37, 0.07, 1, 0, 1); rimlight(c, SNOW_R[4], 1, 41, 0.6);
    const pf = (x, y, n = 3) => { for (let i = 0; i < n; i++) px(g, x + i * 2, y - (i % 2 ? 1 : 0), BC.breath); };
    if (f === 8) { pf(r.tip[0] + 2, r.tip[1] - 2); px(g, r.tip[0] + 8, r.tip[1] - 4, BC.breath); }         // the frost puff of the rear-back, over the head
    if (f === 6) { pf(r.tip[0] + 2, r.tip[1] - 1, 2); for (const [x, y] of [[r.hipF[0] + 6, W - 11], [r.hipF[0] + 8, W - 10]]) {} }
    if (f === 7 || f === 9) for (const [dx, dy] of [[-12, 1], [-15, 0], [-18, 1]]) px(g, r.rump[0] + dx, r.rump[1] + dy, '#ffffff');   // speed flecks
    if (f === 10) for (const dx of [-3, 0, 3]) px(g, r.legs[3].ex + dx, r.gy + 0.4, '#e8f4ff');   // snow thrown up off the skid
    if (f === 12) { px(g, r.tip[0] + 1, r.tip[1] + 2, '#46587a'); }
  });
  return pack(F, 17, H - 1, 18, 10);
}

/* GREYMANE: the lead wolf. Iron-grey, hunched, a frost-crusted mane over the shoulders, a scar across the muzzle, amber eyes. */
const GRY_R = ramp(BC.grey, '#262b3c', '#f1ecde'), GRY_RF = ramp('#4b5160', '#1a1d2a', '#c9cdd6'), GRY_MANE = ramp(BC.greyMane, '#141824', '#9aa4b6'), GRY_ICE = ramp('#a9d8f0', '#3a5a86', '#ffffff');
const GRY_RIG = { R: GRY_R, Rf: GRY_RF, saddle: GRY_MANE, rump: [11, 13, 4.9], chest: [22, 11.2, 6.1], neck: [6.2, -1.6], skull: 4.4, snout: 6.2, snoutR: 1.9, gy: 24, l1: 4.4, l2: 4.8, legR: 1.7, stride: 4.2, lift: 3, tail: 9.5, tailR: 2.4,
  paw: '#3b4050', pawN: '#6a7080', tailTip: '#cfeaff', nose: '#14161c', eye: BC.eyeG, brow: '#262b3c', ear: 4.3, earTip: '#262b3c', earFar: GRY_RF[1], ear2: GRY_R[1], fang: true, snoutLight: null,
  mane(g, c, chest, S, rump, p) { taper(g, chest[0] - 2.5, chest[1] - 1.5, chest[2] * 0.95, chest[0] + 2.6, chest[1] - 0.6, chest[2] * 0.85, GRY_MANE, { seed: 14, noise: 0.28 });
    for (let i = 0; i < 9; i++) { const x = chest[0] - 6 + i * 1.7, y = chest[1] - chest[2] * 0.95 - (i % 3 === 1 ? 1.6 : 0.4); rect(g, x, y, 1, 2, i % 2 ? GRY_ICE[3] : GRY_ICE[4]); } } };

export function bakeGreymane() {
  const W = 44, H = 28;
  const F = frames(W, H, 14, (g, f, c) => {
    const walk = f >= 2 && f <= 5, k = f - 2; let p = {};
    if (f <= 1) p = { dy: f ? 0.5 : 0, head: { dy: f ? 0.6 : 0, tilt: 0.12 }, tail: { a: 0.9, l: 9.5 }, feet: [[-1, 0], [0.5, 0], [-0.5, 0], [1.5, 0]] };
    else if (walk) { const ph = k / 4; p = { gait: [ph, ph + 0.5, ph + 0.5, ph], dy: Math.abs(Math.sin(ph * Math.PI * 2)) * -0.6 + 0.3, head: { dy: 0.8, dx: 0.5, tilt: 0.15 }, tail: { a: 0.8, l: 9.5 }, stride: 4.4 }; }
    else if (f === 6) p = { dy: 3.4, chestDy: 1.8, rumpDy: -0.8, head: { dx: 1, dy: 4.5, tilt: 0.45, jaw: 5, ear: 'back' }, tail: { a: 0.5, l: 9 }, feet: [[-3.5, 0], [4, 0], [-2, 0], [5.5, 0]] };                         // bite tell: shoulders dropped, head low, JAWS WIDE
    else if (f === 7) p = { dy: 1.8, chestDx: 3, chestDy: 1.2, rumpDx: -1.5, head: { dx: 3.5, dy: 3.2, tilt: 0.3, jaw: 5 }, tail: { a: 0.5, l: 9.5 }, feet: [[-5, 0], [3, 0], [-3.5, 0], [6, 0]] };                          // bite: the lunge
    else if (f === 8) p = { dy: 3.6, rumpDy: 2.6, chestDy: -2, chestDx: -2.5, rumpDx: -1.5, head: { dx: -0.5, dy: -0.8, tilt: -0.08, ear: 'up' }, tail: { a: 0.1, l: 9 }, feet: [[-5.5, 0], [4.5, 0], [-3.5, 0], [6.5, 0]], legDy: 0 }; // pounce coil: hindquarters tucked under and loaded, eyes up and level, mane up
    else if (f === 9) p = { dy: -6, chestDx: 3, chestDy: -1.5, rumpDx: -3.5, rumpDy: 1, head: { dx: 3.5, dy: -0.5, tilt: 0.12, jaw: 3 }, tail: { a: 0.05, l: 10 }, feet: [[-8, 2], [-5, 2.5], [5, 1.5], [8.5, 2]], legDy: -1 };       // pounce air: stretched out, forepaws reaching for the hero
    else if (f === 10) p = { dy: 1, chestDy: 1.4, chestDx: 1.5, head: { dx: 2, dy: 3, tilt: 0.4, jaw: 3 }, tail: { a: 0.7, l: 9.5 }, feet: [[-4, 0], [5, 0], [-2, 0], [6.5, 0]] };                                      // pin: standing over, a paw on the hero, head down
    else if (f === 11) p = { dy: 5.5, rumpDy: 0.6, head: { dx: 0.5, dy: 4, tilt: 0.5, ear: 'back' }, tail: { a: 1.2, l: 8 }, feet: [[-4, 0], [2, 0], [-1, 0], [4.5, 0]], eye: BC.greyMane };                       // winded: slumped on its forelegs, tongue out (below)
    else if (f === 12) p = { dy: 1, chestDy: 1, head: { dx: -2.5, dy: 2.5, tilt: 0.3, ear: 'back' }, eye: '#ffffff', tail: { a: 1.2, l: 8 }, feet: [[-3, 0], [-0.5, 0], [0, 0], [2.5, 0]] };               // hurt
    else if (f === 13) p = { dy: 9, rumpDy: 0.6, chestDy: 0.4, head: { dx: 1.5, dy: 4.6, tilt: 0.55, ear: 'flat' }, eye: BC.greyMane, tail: { a: 1.35, l: 8 }, feet: [[-5, 0.5], [4.5, 0.5], [-1.5, 0.5], [7, 0.5]] };   // death
    const r = quad(g, c, GRY_RIG, p);
    /* the scar across the muzzle and the frost caught in the ruff */
    rect(g, r.tip[0] - 3.5, r.S[1] - 1.5 + (p.head && p.head.tilt ? p.head.tilt * 2 : 0), 1, 3, BC.scar); px(g, r.tip[0] - 2.5, r.S[1] + 1.5, BC.scar);
    tufts(c, GRY_R[3], 33, 0.3, 1, 1, 0); tufts(c, GRY_ICE[4], 39, 0.14, 1, 0, 0); rimlight(c, GRY_R[4], 1, 43, 0.55);
    if (f === 11) rect(g, r.tip[0] - 3, r.tip[1] + 1.5, 2, 2, '#d8647a');   // the tongue
    if (f === 8) for (const [dx, dy] of [[1, -3], [4, -5], [7, -3]]) px(g, r.S[0] + dx, r.S[1] + dy, BC.breath);
    if (f === 9) for (const dx of [-14, -17, -20]) px(g, r.rump[0] + dx, r.rump[1] - 1 + (dx % 2), '#ffffff');
    if (f === 6) for (const [dx, dy] of [[0, 0], [3, -1]]) px(g, r.legs[3].ex + 3 + dx, r.gy - 0.6 + dy, '#d9c58c');   // the paw scrape: a scatter of grit
    if (f === 12 || f === 13) {}
  });
  return pack(F, 22, H - 1, 26, 15);
}

/* ---- BRUIN: the cave bear ---- */
function bearPal(frost) { return frost
  ? { R: ramp(BC.frostFur, '#2b2230', '#fffaf0'), Rf: ramp('#6c665c', '#1f1a28', '#d8d2c4'), sad: ramp(BC.frostSaddle, '#1c1420', '#9a826a'), snout: '#d8cbb4', paw: '#2a2028', pawN: '#4a3c3a', eye: '#bfe8ff', tip: '#d8e4f0' }
  : { R: ramp(BC.brown, '#1f1428', '#f0d8b8'), Rf: ramp('#3c271b', '#150e1c', '#a8845c'), sad: ramp('#3c2619', '#120c18', '#8a6644'), snout: BC.snout, paw: '#1c1214', pawN: '#34201a', eye: '#ffd36b', tip: '#8a6644' }; }

function bearRig(P) { return { R: P.R, Rf: P.Rf, saddle: P.sad, rump: [13, 18.5, 7.6], chest: [27, 15.6, 9.2], neck: [10, 1.2], skull: 6.8, snout: 7, snoutR: 3.4, gy: 33, l1: 6.4, l2: 6.6, legR: 3.1, stride: 4.5, lift: 3.4, tail: 4, tailR: 2.5,
  paw: P.paw, pawN: P.pawN, tailTip: P.R[1], nose: '#120c0a', eye: P.eye, brow: P.R[0], ear: 3, earTip: P.R[1], earFar: P.Rf[1], ear2: P.R[2], fang: true, snoutLight: P.snout,
  mane(g, c, chest, S) { taper(g, chest[0] - 1, chest[1] - 3, chest[2] * 0.78, chest[0] + 3, chest[1] - 2.4, chest[2] * 0.65, P.sad, { seed: 16, noise: 0.28 }); } }; }

export function bakeBruin(frost = false) {
  const P = bearPal(frost), W = 56, H = 50, rig = bearRig(P);
  const standing = (g, c, o) => {   // up on the hind legs: a tall body, the arms raised; o: { lean, armF:[x,y], armB:[x,y], mouth, head dy }
    const l = o.lean || 0, hipY = 33, pelv = [20 + l * 0.3, hipY, 7.4], chest = [24 + l, 21, 9.6], S = [28 + l * 1.2, 10.6 + (o.hy || 0), 6.1];
    for (const [dx, far] of [[-5, 1], [3, 0]]) { const ex = 20 + dx * 1.1, fx = ex + (far ? -0.5 : 0.5); taper(g, 20 + dx * 0.9, hipY + 2, 5, fx, 44.5, 3.6, far ? P.Rf : P.R, { seed: 12 + dx }); rect(g, fx - 3, 44, 8, 3, far ? P.paw : P.pawN); for (let i = 0; i < 3; i++) px(g, fx + 4, 44.4 + i * 0.8, BC.claw); }
    const arm = (a, far) => { const sh = [chest[0] + (far ? -3 : 3), chest[1] - 6], el = [(sh[0] + a[0]) / 2 + (far ? -3 : 3), (sh[1] + a[1]) / 2 + 3 + (o.sag || 0)];
      taper(g, sh[0], sh[1], 4, el[0], el[1], 3.3, far ? P.Rf : P.R, { seed: 31 }); taper(g, el[0], el[1], 3.3, a[0], a[1], 3, far ? P.Rf : P.R, { seed: 32 });
      ellipseFill(g, a[0], a[1], 3.5, 3.1, far ? P.paw : P.pawN); for (let i = 0; i < 3; i++) { px(g, a[0] + 3 + (o.claw || 0), a[1] - 1.5 + i * 1.7, BC.claw); px(g, a[0] + 2 + (o.claw || 0), a[1] - 1.5 + i * 1.7, BC.claw); } };
    arm(o.armB, 1);
    taper(g, pelv[0], pelv[1], pelv[2], chest[0], chest[1], chest[2], P.R, { seed: 2 }); taper(g, pelv[0] + 1.5, pelv[1] - 1, pelv[2] * 0.7, chest[0] + 1.5, chest[1] + 2, chest[2] * 0.7, mix2(P.R), { seed: 3, noise: 0.2 });
    taper(g, chest[0] - 4, chest[1] - 3, 6, chest[0] + 2, chest[1] - 5, 5, P.sad, { seed: 17, noise: 0.28 });
    arm(o.armF, 0);
    taper(g, chest[0] + 1, chest[1] - 6, 6.2, S[0], S[1] + 1, S[2], P.R, { seed: 4 });
    taper(g, S[0] + 3, S[1] + 1.4, 3.4, S[0] + 8, S[1] + 2.6, 2.7, ramp(P.snout), { seed: 5, noise: 0.05 });
    rect(g, S[0] + 9, S[1] + 0.8, 2, 2, P.paw === '#1c1214' ? '#120c0a' : '#2a2028');   // the nose
    if (o.mouth) { fillPoly(g, [[S[0] + 3, S[1] + 3.4], [S[0] + 10, S[1] + 3.6], [S[0] + 9, S[1] + 7.8], [S[0] + 4, S[1] + 7.2]], BC.mouth); px(g, S[0] + 4, S[1] + 4, BC.tooth); px(g, S[0] + 9, S[1] + 4, BC.tooth); px(g, S[0] + 5, S[1] + 7, BC.tooth); px(g, S[0] + 8, S[1] + 7, BC.tooth); }
    fillPoly(g, [[S[0] - 4.6, S[1] - 3.6], [S[0] - 3.4, S[1] - 8.4], [S[0] - 0.4, S[1] - 4.6]], P.R[1]); fillPoly(g, [[S[0] - 4, S[1] - 4.5], [S[0] - 3.2, S[1] - 7.4], [S[0] - 1.6, S[1] - 5]], P.R[2]);
    px(g, S[0] + 3, S[1] - 1.4, o.eyeC || P.eye); px(g, S[0] + 2, S[1] - 2.4, P.R[0]); px(g, S[0] + 3, S[1] - 2.4, P.R[0]);
    return { S, chest };
  };
  const F = frames(W, H, 16, (g, f, c) => {
    const walk = f >= 2 && f <= 5, k = f - 2, ch = f >= 10 && f <= 12; let p = null, r = null;
    if (f <= 1) p = { dy: f ? 0.5 : 0, head: { dy: f ? 0.8 : 0, tilt: 0.2 }, tail: { a: 0.5, l: 4 }, feet: [[-1, 0], [0.5, 0], [-0.5, 0], [1, 0]] };
    else if (walk) { const ph = k / 4; p = { gait: [ph, ph + 0.5, ph + 0.5, ph], dy: Math.abs(Math.sin(ph * Math.PI * 2)) * -0.8, head: { dy: 1.2, tilt: 0.28 }, tail: { a: 0.5, l: 4 }, stride: 5 }; }
    else if (f === 9) p = { dy: 4.4, chestDy: 2.6, rumpDy: -1, chestDx: 1, head: { dx: 1, dy: 4.4, tilt: 0.5, jaw: 2 }, tail: { a: 0.3, l: 4 }, feet: [[-4, 0], [3.5, 0], [-2, 0], [6, 1.6]], legDy: 0 };      // charge tell: head down between the shoulders, a forepaw dragging the dirt
    else if (ch) { const ph = (f - 10) / 3; p = { gait: [ph + 0.45, ph + 0.02, ph + 0.4, ph], dy: -Math.abs(Math.sin(ph * Math.PI * 2)) * 2.2 + 1.2, chestDy: 1.2, head: { dx: 1.5, dy: 3, tilt: 0.4 }, tail: { a: 0.2, l: 4 }, stride: 6.5, liftK: 1.6 }; }
    else if (f === 13) p = { dy: 4, chestDy: 3, head: { dx: 0.5, dy: 4.4, tilt: 0.5, ear: 'back' }, eye: P.R[0], tail: { a: 0.9, l: 4 }, feet: [[-5, 0], [2, 0], [-2, 0], [4, 0]] };    // dazed: head hung low (the host draws the stars)
    else if (f === 14) p = { dy: 1, chestDy: 1.4, head: { dx: -2, dy: 2.4, tilt: 0.3, ear: 'back' }, eye: '#ffffff', tail: { a: 0.9, l: 4 }, feet: [[-3, 0], [-0.5, 0], [0, 0], [2.5, 0]] };
    else if (f === 15) p = { dy: 11, rumpDy: 0.4, head: { dx: 1, dy: 5.6, tilt: 0.5, ear: 'flat' }, eye: P.R[0], tail: { a: 1.2, l: 4 }, feet: [[-6, 0.5], [5, 0.5], [-1, 0.5], [8, 0.5]] };   // death: slumped, a heap
    if (p) r = quad(g, c, rig, p);
    else if (f === 6) r = standing(g, c, { armB: [37, 5], armF: [45, 9], mouth: true, hy: -0.6, claw: 1, sag: -2, lean: -1 });          // STAND + ROAR: reared to full height, both arms flung wide and up, jaws open
    else if (f === 7) r = standing(g, c, { armB: [34, 29], armF: [41, 26], mouth: false, sag: 1, lean: -2, hy: 1.8 });                    // stood, open: arms low and wide, chest bare
    else if (f === 8) r = standing(g, c, { armB: [38, 38], armF: [45, 36], mouth: true, lean: 3, hy: 2.8, claw: 0, sag: 2 });              // the maul: both paws coming down
    tufts(c, P.R[3], 51, 0.22, 1, 1, 0); tufts(c, P.R[4], 53, 0.1, 1, 0, 1); rimlight(c, P.R[4], 1, 57, 0.55);
    if (f === 6) for (const [dx, dy, a] of [[14, -1], [17, -3], [20, -1], [23, -3]]) px(g, r.S[0] + dx, r.S[1] + dy + 4, BC.breath);   // breath of the roar
    if (f === 9) for (const [dx, dy] of [[1, 0], [3, -1], [5, 0], [2, -2]]) px(g, r.legs[3].ex + 4 + dx, rig.gy - 1 + dy, '#d9c58c');
    if (ch) for (const dx of [-26, -30, -34]) px(g, r.rump[0] + dx, r.rump[1] + 2 + (dx % 2), '#e8ddc8');
  });
  return pack(F, 27, H - 1, 28, 16);
}
const mix2 = R => R;   // (the belly lightening reuses the body ramp)
function ellipseFill(g, cx, cy, rx, ry, col) { for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) px(g, x, y, col); } }

/* the pale grizzled coat for act VI (cnSkin 'bruinfrost'): its own ramp, a dark saddle left on the back, frost on the tips - not a tint */
export function bakeBruinFrost() { return bakeBruin(true); }
