// gastric_polyp_art.js - THE GASTRIC POLYP, THE HAND-DRAWN POSE SET (claude/whaleart, 2026-11-12). The Whale greybox (src/whale-hands.js) drew the polyp as a pink stalk with a rectangle head and a dark square for a mouth.
// This draws a creature: a wet pink STALK rooted in the whale's flesh, a swollen HEAD wearing a crown of small warts (the polyps), a FACE with two eyes you can read at 1x (a white eye, a yellow iris, a black
// pupil, a heavy brow) and a mouth that tells the spit. Every part is its own OUTLINED MASS on the sr_draw kit (root mound, stalk, head, cheeks, lips, tongue, eyes).
// Pure drawing, fillRect only (tools/wh-art-sheet.mjs rasterises it in node, no browser). g = a 2d context, (x, y) = the root on screen (the feet), f = facing (+1 right),
// o = { mode (the sim's mode), pose (a name, overrides mode), h (the sim's current stalk height: the swell and the shrink are drawn from it), hurtT, flash, seed, bodyOnly, still, alpha, P }.
// THE POSES (src/gastric-polyp.js modes): polypIn (a shut knot in the flesh: a seam, two shut eyes, a bile bead) / polypSwell (the stalk lengthens: drawn from o.h) / polypOut (the watch: eyes open, mouth a slit)
//   / polypSpitWind (THE TELL: head thrown back, cheeks swollen and glowing green, the eyes narrowed, the brow low) -> polypSpit (the RELEASE: head thrust forward, mouth wide, a glob leaving)
//   / polypRec (slumped, drooling, eyes half shut) / polypHurt (a flinch, eyes squeezed) / polypShrink (drawn from o.h) / polypDead (the fall: a deflating head, the eyes crossed out, bile running).
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp, lerp } from './sr_draw.js';
const R = Math.round;
export const PCOL = {
  out: '#12060a', flesh: ['#3a1220', '#6a2434', '#a04456', '#d8808a'], pale: ['#8a4a50', '#c88a88', '#e8b8b0', '#f8dcd0'], bile: ['#2e3a10', '#586c1c', '#8aa22c', '#c8e070'],
  hot: '#e8f0a0', eyeW: '#f4ecd8', iris: '#e0c030', pupil: '#1a0a0a', mouth: '#2a0810', tongue: '#c04858', tooth: '#f4ecd8', gold: '#ffd36b', white: '#f6fbfc', red: '#ff6b6b', vein: '#6a2a5a',
};
const C = PCOL;
const P0 = { h: 20, tilt: 0, lean: 0, puff: 0, mouth: 0.15, eye: 'open', glow: 0, fx: null, droop: 0 };
const mk = o => ({ ...P0, ...o });
export const POSES = {
  polypIn:       mk({ h: 4, knot: true, eye: 'shut', mouth: 0 }),
  polypSwell:    mk({ h: 14, tilt: -8, eye: 'half', mouth: 0.2, fx: 'drip' }),
  polypShrink:   mk({ h: 12, tilt: 14, eye: 'half', mouth: 0, fx: 'drip' }),
  polypOut:      mk({ h: 20, tilt: 0, eye: 'open', mouth: 0.15 }),
  polypSpitWind: mk({ h: 22, tilt: -30, lean: -3, puff: 1, mouth: 0.3, eye: 'narrow', glow: 1, fx: 'glint' }),
  polypSpit:     mk({ h: 18, tilt: 22, lean: 3, puff: 0, mouth: 1, eye: 'wide', fx: 'spit' }),
  polypRec:      mk({ h: 16, tilt: 38, lean: 2, puff: 0, mouth: 0.4, eye: 'half', droop: 1, fx: 'drool' }),
  polypHurt:     mk({ h: 18, tilt: -20, lean: -3, puff: 0, mouth: 0.7, eye: 'squeeze' }),
  polypDead:     mk({ h: 8, tilt: 52, lean: 3, puff: 0, mouth: 0.8, eye: 'dead', droop: 1, fx: 'ooze' }),
};
export const poseNames = () => Object.keys(POSES);
const MODE_POSE = { in: 'polypIn', swell: 'polypSwell', shrink: 'polypShrink', out: 'polypOut', spitTell: 'polypSpitWind', spit: 'polypSpit', rec: 'polypRec' };
export function poseOfPolyp(mode, o = {}) {
  if (o.hurtT > 0 && (mode === 'out' || mode === 'rec' || mode === 'spitTell')) return 'polypHurt';
  return MODE_POSE[mode] || 'polypOut';
}
let g_, X_, Y_, F_ = 1, TINT_ = 0, ALPHA_ = 1;
const rc = (dx, dy, w, h, c, a = 1) => { const al = a * ALPHA_; if (al !== 1) g_.globalAlpha = al; g_.fillStyle = TINT_ > 0 ? mixC(c, '#ffffff', TINT_) : c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - R(w), Y_ + R(dy), R(w), R(h)); if (al !== 1) g_.globalAlpha = 1; };
const FL = L => flush(L, rc, C.out);
const rot = (dx, dy, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [dx * c - dy * s, dx * s + dy * c]; };
const hashN = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };

export function drawPolyp(g, x, y, f, o = {}, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = o.alpha ?? 1; TINT_ = (o.flash > 0 || o.flashT > 0) ? 0.5 : 0;
  const key = o.pose || poseOfPolyp(o.mode, { hurtT: o.hurtT }), P = o.P || POSES[key] || POSES.polypOut, body = !!o.bodyOnly, tm = time + (o.seed || 0);
  const sway = o.still || P.knot ? 0 : Math.sin(tm * 2.2) * 0.8, h = (o.h != null && (key === 'polypSwell' || key === 'polypShrink' || key === 'polypOut' || key === 'polypSpitWind' || key === 'polypSpit' || key === 'polypRec')) ? clamp(o.h, 6, 22) : P.h;
  /* ---- the root mound: a lip of flesh the stalk comes out of, with cilia ---- */
  { const L = new Layer(); ell(L, 0, -1, P.knot ? 9 : 8, P.knot ? 5.4 : 3.6, C.flesh, { tex: C.flesh[0] });
    for (let k = -3; k <= 3; k++) pset(L, k * 2.2, -3 - ((hashN(k, 3) % 3) === 0 ? 1 : 0), C.pale[1]);
    if (!P.knot) for (let k = 0; k < 3; k++) pset(L, -5 + k * 5, -1, C.vein);
    FL(L); }
  if (P.knot) {
    /* a shut knot: a seam down the middle like a closed sphincter, two shut eyes with lashes, a bile bead, a breathing swell */
    const L = new Layer(), br = o.still ? 0 : Math.sin(tm * 2) * 0.5;
    ell(L, 0, -6, 6, 5 + br, C.pale, { tex: C.pale[0] });
    line(L, 0, -10, 0, -3, C.flesh[0], 1); line(L, -1, -9, -1, -5, C.flesh[1], 1);
    for (const sx of [-3, 3]) { line(L, sx - 1, -6, sx + 1, -6, C.mouth, 1); pset(L, sx - 1, -5, C.mouth); pset(L, sx + 1, -5, C.mouth); pset(L, sx, -7, C.flesh[1]); }
    pset(L, 0, -2, C.bile[2]); pset(L, 1, -2, C.bile[3]); pset(L, -2, -8, C.pale[3]);
    FL(L);
    if (!body) rc(2, -12 - ((tm * 6) % 3), 1, 1, C.pale[3], 0.6);
    return;
  }
  /* ---- the stalk: a ringed capsule, a dark vein down its back ---- */
  const lean = P.lean + sway, neck = [lean, -h];
  { const L = new Layer();
    cap(L, 0, -2, neck[0] - 0.5, neck[1] + 2, 3.9, 3.2, C.flesh, { tex: C.flesh[0] });
    for (let k = 1; k < 4; k++) { const t = k / 4, px = lerp(0, neck[0], t), py = lerp(-2, neck[1] + 2, t); pset(L, px - 2, py, C.flesh[0]); pset(L, px - 1, py, C.flesh[0]); pset(L, px + 2, py - 1, C.pale[1]); }
    line(L, -2, -3, neck[0] - 2, neck[1] + 3, C.vein, 1);
    FL(L); }
  /* ---- the head: a swollen bulb of pale flesh with a crown of warts; the cheeks balloon on the tell ---- */
  const hc = rot(0, -6.6, P.tilt), hx = neck[0] + hc[0], hy = neck[1] + hc[1] + P.droop * 1.5, rx = 8.2 + P.puff * 1.8, ry = 6.8 + P.puff * 0.6;
  const at = (dx, dy) => { const r = rot(dx, dy, P.tilt); return [hx + r[0], hy + r[1]]; };
  { const L = new Layer();
    ell(L, hx, hy, rx, ry, C.pale, { rot: P.tilt * 0.5, tex: C.pale[0] });
    for (const [dx, dy, s] of [[-4, -6.2, 1.6], [-0.5, -7.4, 1.9], [3.4, -6.4, 1.5]]) { const q = at(dx, dy); ell(L, q[0], q[1], s, s, C.pale.map(c => mixC(c, C.flesh[3], 0.25))); pset(L, q[0] + 0.5, q[1] - 0.5, C.pale[3]); }   /* the crown of warts */
    for (let k = 0; k < 5; k++) { const q = at(-6 + k * 1.2, -1 + (k % 2) * 3); pset(L, q[0], q[1], C.flesh[2]); }
    const v = at(-2, -3); pset(L, v[0], v[1], C.vein); pset(L, v[0] - 1, v[1] + 1, C.vein); pset(L, v[0] - 1, v[1] + 2, C.vein);
    FL(L); }
  /* the cheeks (puffed on the tell: each a pale-green mass, a bile glow inside) */
  if (P.puff > 0.1) { const L = new Layer(), q = at(3.5, 3.6), q2 = at(-2.4, 3.8), gl = P.glow ? 0.5 + 0.5 * Math.sin(tm * 18) : 0;
    ell(L, q[0], q[1], 4.2 + P.puff * 2.2, 3.4 + P.puff * 1.8, [mixC(C.pale[1], C.bile[2], 0.45), mixC(C.pale[2], C.bile[2], 0.55), mixC(C.pale[3], C.bile[3], 0.6)]);
    ell(L, q2[0], q2[1], 3 + P.puff * 1.4, 2.6 + P.puff, [mixC(C.pale[1], C.bile[2], 0.4), mixC(C.pale[2], C.bile[2], 0.5)]);
    pset(L, q[0] + 1, q[1] - 1, gl > 0.5 ? C.hot : C.bile[3]); pset(L, q[0], q[1], C.bile[3]); pset(L, q[0] + 2, q[1] + 1, C.bile[3]);
    FL(L); }
  /* ---- the face ---- */
  { const L = new Layer(), ey = P.eye;
    /* brow: a heavy dark ridge over both eyes (lower on the tell, higher on a thrust) */
    const bl = ey === 'narrow' || ey === 'squeeze' ? 0.8 : ey === 'wide' ? -1.2 : 0;
    for (let k = 0; k < 8; k++) { const q = at(0.2 + k * 1.1, -3.4 + bl + (k > 5 ? 0.8 : 0)); pset(L, q[0], q[1], C.flesh[0]); pset(L, q[0], q[1] + 0.6, C.flesh[1]); }
    const eye = (dx, dy, s, far) => { const q = at(dx, dy);
      if (ey === 'shut' || ey === 'squeeze' || ey === 'dead') { for (let k = -2; k <= 2; k++) pset(L, q[0] + k, q[1] + (ey === 'squeeze' ? (k & 1) * -1 : (Math.abs(k) > 1 ? 1 : 0)), C.mouth); if (ey === 'dead' && !far) { for (const [a, b] of [[-1, -1], [1, 1], [1, -1], [-1, 1]]) pset(L, q[0] + a, q[1] + b - 0, C.red); } return; }
      const hh = ey === 'half' ? 2 : ey === 'narrow' ? 2 : ey === 'wide' ? s + 1 : s, ww = s;
      ell(L, q[0], q[1], ww / 2 + 0.6, hh / 2 + 0.6, [C.eyeW, C.eyeW, C.eyeW]);
      const ix = q[0] + (far ? 0.5 : 1), iy = q[1] + (ey === 'half' ? 0.5 : 0);
      for (let j = 0; j < Math.max(1, Math.min(2, hh)); j++) for (let i = 0; i < 2; i++) pset(L, ix - 0.5 + i, iy - 0.5 + j, ey === 'narrow' ? C.gold : C.iris);
      pset(L, ix + 0.5, iy, C.pupil); if (ey === 'wide' || ey === 'narrow') pset(L, ix - 0.5, iy, C.pupil);
      if (ey === 'half') for (let k = -2; k <= 2; k++) pset(L, q[0] + k, q[1] - 1, C.flesh[1]); };   /* a heavy lid */
    eye(2.4, -1.2, 4, false); eye(7.2, -1.2, 3, true);
    FL(L);
    /* the mouth: lips (a mass), the dark opening, a tongue, two teeth; it OPENS to the spit */
    const Lm = new Layer(), m = P.mouth, mc = at(5.2, 3.1), open = 1 + m * 4.2;
    ell(Lm, mc[0], mc[1], 3.4 + m * 1.6, 1.9 + m * 2.2, [C.flesh[2], C.flesh[3], C.flesh[3]]);
    for (let j = 0; j < Math.max(1, R(open)); j++) for (let i = -2 - R(m * 1.4); i <= 2 + R(m * 1.4); i++) { if (Math.abs(i) + (j > 2 ? 1 : 0) > 3 + m * 1.6) continue; pset(Lm, mc[0] + i, mc[1] - 1 + j, C.mouth); }
    if (m > 0.25) { for (let i = -1; i <= 1; i++) pset(Lm, mc[0] + i, mc[1] + R(open * 0.6) - 1, C.tongue); pset(Lm, mc[0] - 2, mc[1] - 1, C.tooth); pset(Lm, mc[0] + 2, mc[1] - 1, C.tooth); }
    if (m > 0.8) { pset(Lm, mc[0] - 1, mc[1] + 1, C.bile[3]); pset(Lm, mc[0], mc[1], C.bile[2]); pset(Lm, mc[0] + 1, mc[1] + 1, C.bile[3]); }
    FL(Lm);
    /* two gill-like nostril pits */
    const n1 = at(8.4, 0.6); rc(n1[0], n1[1], 1, 1, C.mouth); }
  if (body) return;
  /* ---- effects (never outlined) ---- */
  const fx = P.fx, mc = at(7, 3);
  if (fx === 'glint') { const k = 0.5 + 0.5 * Math.sin(tm * 20); rc(mc[0] - 1, mc[1] - 1, 3, 3, C.hot, 0.25 + 0.4 * k); for (let i = 0; i < 3; i++) rc(hx + 6 + i * 3, hy - 9 - i * 2 + Math.sin(tm * 9 + i) * 1, 1, 2, C.bile[3], 0.8); rc(hx - 3, hy - 12, 1, 3, C.red, 0.7); rc(hx - 3, hy - 8, 1, 1, C.red, 0.7); }
  if (fx === 'spit') { for (let i = 0; i < 4; i++) rc(mc[0] + 3 + i * 3, mc[1] - 2 + (i & 1) * 2, 2 + (i & 1), 2, i & 1 ? C.bile[2] : C.bile[3], 0.9 - i * 0.14); rc(mc[0] + 1, mc[1] - 1, 2, 4, C.hot, 0.8); }
  if (fx === 'drip' || fx === 'drool') { const d = (tm * 5 + 1) % 5; rc(mc[0], mc[1] + 3 + d, 1, 2, C.bile[3], 0.7 * (1 - d / 5)); rc(0, -1, 1, 1, C.bile[3], 0.6); }
  if (fx === 'ooze') { for (let i = 0; i < 4; i++) rc(-4 + i * 3, -1 - (i & 1), 2, 1, C.bile[2], 0.8); rc(mc[0] + 1, mc[1] + 2, 1, 5, C.bile[3], 0.8); }
}
/* the fall: k 0..1 - the head deflates (the stalk folds, the eyes crossed out), bile runs, the root mound is left; fades at the end */
export function drawPolypDead(g, x, y, f, k, time = 0, o = {}) {
  const kk = clamp(k), A = POSES.polypOut, B = POSES.polypDead, e = Math.min(1, kk / 0.6), P = { ...B, h: lerp(A.h, B.h, e), tilt: lerp(A.tilt, B.tilt, e), lean: lerp(A.lean, B.lean, e), mouth: lerp(0.15, B.mouth, e), puff: 0, fx: kk > 0.2 ? 'ooze' : null, eye: kk > 0.1 ? 'dead' : 'open' };
  drawPolyp(g, x, y, f, { ...o, P, h: P.h, alpha: kk > 0.85 ? 1 - (kk - 0.85) / 0.15 * 0.9 : 1, still: true, flash: 0 }, time);
  if (!o.bodyOnly) { g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = 1; TINT_ = 0; for (let i = 0; i < 3; i++) { const up = ((time * 18 + i * 7) % 16) * (1 - kk * 0.6); rc(-3 + i * 3, -10 - up, 2, 2, C.bile[3], 0.8 * (1 - kk)); } }
}
/* the bile glob in flight: a fat green drop with a pale core and a tail along its path (vx, vy = its velocity) */
export function drawGlob(g, x, y, vx = 0, vy = 0, time = 0, kind = 'bile') {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = 1; ALPHA_ = 1; TINT_ = 0;
  const sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp, egg = kind === 'egg';
  for (let i = 1; i <= 4; i++) rc(-ux * i * 3.2 - 1, -uy * i * 3.2 - 1, 3 - (i > 2 ? 1 : 0), 3 - (i > 2 ? 1 : 0), egg ? '#c8b880' : C.bile[1 + (i & 1)], 0.5 - i * 0.1);
  const L = new Layer(), w = 1 + Math.sin(time * 24) * 0.4;
  ell(L, 0, 0, 3.6 + w * 0.3, 3.4 - w * 0.3, egg ? ['#6a5a30', '#a89860', '#e8e0b0'] : [C.bile[0], C.bile[1], C.bile[2]]);
  pset(L, -1, -1, egg ? '#fff4c8' : C.hot); pset(L, 1, 1, egg ? '#a89860' : C.bile[3]); if (!egg) pset(L, 0, -1, C.bile[3]);
  FL(L);
}
