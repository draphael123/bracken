// old_tusker_art.js - OLD TUSKER's own drawn pieces (claude/oldtuskerart, the SONNET art pass over the greybox claude/oldtusker). ART ONLY: nothing here reads or changes a
// hitbox, a timer or a number - src/old-tusker-hands.js owns POSE (the contract) and calls these.
//   boarSprite(name, pose, time, phase, flash)  the great old boar, one baked + outlined + alpha-snapped sprite per (pose, 1/8 of its animation cycle, phase, flash)
//   groundGlimpse(...) / clearingDress(...)       THE FELLING CLEARING's cut ground, stumps, sawhorses, log piles, the old boar's wallow, the treeline's sawdust
//   drawSapling(...)                               the treeline giving up a new marked pine
import { canvas, outline } from '../px.js';
import { stumpS, logS, logPileSprite, railFence, blockSprite, drawStump } from './lumber_trail_art.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const OUTC = '#140b07';
const R = Math.round;
/* THE OLD BOAR'S PALETTE: dark bristle-brown hide going grey at the shoulder and muzzle, mud on the belly, ivory tusks stained at the root */
const C = { hide: '#5c3c28', hideM: '#6b4630', hideL: '#85603f', hideH: '#a47c52', hideD: '#3a2418', hideDD: '#24140c', bristle: '#1c120a', bristleT: '#8a8070', grey: '#a89a88', greyD: '#7a6e60', greyL: '#cfc4b0',
  mud: '#46301e', mudL: '#5e4630', scar: '#c9b49a', scarD: '#8a7058', tusk: '#f2ead2', tuskD: '#c8bc9c', tuskS: '#b49a64', snout: '#a77a68', snoutD: '#6a4232', snoutL: '#c8998a', hoof: '#1a120c', hoofL: '#3a2a20',
  eye: '#ffcf6a', red: '#ff4a2a', redD: '#a01c10', gold: '#ffd36b', steam: '#e8e4dc' };

/* ---------- the pose drawing: local px, facing right, his feet at (0,0) ---------- */
function ell(g, x, y, rx, ry, col, rot = 0) { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.6, rx), Math.max(0.6, ry), rot, 0, 7); g.fill(); }
function poly(g, pts, col) { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); }
function box(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); }

/* a leg: thigh tapering to a thin cannon and a cloven hoof; hinge = knee bend */
function leg(g, x, y0, ang, len, far, bend, hoofUp) {
  g.save(); g.translate(x, y0); g.rotate(ang);
  const c = far ? C.hideD : C.hide, l = far ? C.hideDD : C.hideM;
  poly(g, [[-4.2, 0], [4.2, 0], [2.6 + bend * 0.4, len * 0.55], [1.9, len - 2], [-1.9, len - 2], [-2.6 + bend * 0.4, len * 0.55]], c);
  box(g, -3.5, 0, 2, len * 0.5, l);
  box(g, -2.4, len - 3, 4.8, 1.4, far ? C.hideDD : C.mud);   /* a muddy sock */
  box(g, -2.6, len - 2, 2.4, 2.2, C.hoof); box(g, 0.4, len - 2, 2.4, 2.2, C.hoof); box(g, -2.6, len - 2, 1, 1, C.hoofL);
  g.restore();
}
/* the tusk: a thick curl from the lower jaw, up past the snout; ang tilts it; len grows for the sweep's raised tusks */
function tusk(g, x, y, ang, k = 1, near = true) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(k, k);
  g.fillStyle = near ? C.tusk : C.tuskD; g.beginPath(); g.moveTo(-1.5, 0.5); g.quadraticCurveTo(3, 0.5, 6, -4); g.quadraticCurveTo(7.6, -7, 7.2, -10); g.lineTo(5.6, -9.2); g.quadraticCurveTo(5.6, -5, 2.2, -2.2); g.quadraticCurveTo(0, -1.2, -1.5, -1.6); g.closePath(); g.fill();
  g.fillStyle = C.tuskS; g.beginPath(); g.moveTo(-1.5, 0.5); g.lineTo(1.2, 0.2); g.lineTo(1.4, -1.8); g.lineTo(-1.5, -1.6); g.fill();   /* the stained root */
  g.fillStyle = C.tuskD; g.fillRect(4, -5, 1, 2);
  g.restore();
}
function head(g, name, p, flash, time) {
  const col = c => (flash ? '#ffffff' : c);
  /* skull + the long wedge of the jaw/snout, grey at the muzzle */
  ell(g, 0, 0, 10.5, 9, col(C.hide)); ell(g, -2, -3, 8, 5, col(C.hideM)); ell(g, -3, -5.5, 5, 2.2, col(C.hideL));
  poly(g, [[3, -4], [13, -1], [18, 3], [18.5, 7], [12, 9.5], [4, 9]], col(C.hideM));
  ell(g, 7, 5, 9, 4.2, col(C.grey)); ell(g, 6, 4, 6, 2.2, col(C.greyL));   /* the grey old muzzle */
  poly(g, [[1, 7], [10, 9.5], [16, 8.6], [8, 11.5], [1, 10]], col(C.greyD));   /* the jaw's shade */
  /* the snout disc and its nostrils; the lip */
  ell(g, 17.5, 4.5, 2.8, 4.2, col(C.snout)); ell(g, 18.4, 4, 1.4, 2.5, col(C.snoutL)); box(g, 18, 3, 1.2, 1.4, flash ? '#fff' : C.snoutD); box(g, 18, 5.6, 1.2, 1.4, flash ? '#fff' : C.snoutD);
  box(g, 6, 8.6, 11, 1, col(C.snoutD));
  /* the torn ear: a notch bitten out of it */
  poly(g, [[-6, -6], [-3.5, -14], [0.5, -7]], col(C.hideD)); poly(g, [[-5, -6.5], [-3.5, -11], [-1.6, -7]], col(C.snoutD)); g.clearRect(-4.6, -13.2, 1.6, 1.6);
  /* the heavy brow + the eye (a different one each pose); a scar across the cheek */
  box(g, 1, -3.4, 5, 1.6, col(C.hideDD));
  const ey = p.eye === 'shut' ? col(C.hideDD) : flash ? '#fff' : (p.eye === 'red' ? C.red : C.eye);
  if (p.eye === 'shut') { box(g, 1.5, -1, 4, 1.4, ey); } else { box(g, 2, -2, 3, 2.6, ey); box(g, 3, -1.4, 1, 1.4, C.hideDD); if (p.eye === 'red') { g.globalAlpha = 0.5; ell(g, 3.5, -0.6, 4.2, 3.4, C.red); g.globalAlpha = 1; } }
  box(g, 6, 1.4, 5, 0.9, col(C.scar)); box(g, 8, 0.4, 1, 2.8, col(C.scar));
  /* the tusks: the near one full, a far one behind the lip; sweepTell raises them */
  const ta = p.tusk || 0;
  tusk(g, 13.5, 6.8, ta - 0.1, 0.95, false); tusk(g, 10, 7.8, ta, 1.45, true);
  if (p.eye === 'red' && name !== 'pinned') { /* steam from the snout */
    for (let k = 0; k < 2; k++) { const t = ((time * 1.6 + k * 0.5) % 1); g.globalAlpha = (1 - t) * 0.55; ell(g, 20 + t * 7, 3 - t * 5 - k * 2, 1.4 + t * 2, 1.1 + t * 1.5, C.steam); } g.globalAlpha = 1; }
}
function barrel(g, p, flash, ph, rump, st) {
  const col = c => (flash ? '#ffffff' : c), Y = -17 - rump * 0.25;
  /* the haunch, the belly barrel, the high shoulder hump (a boar is higher fore than aft) */
  ell(g, -13 - st * 0.3, Y + 2.5, 12.5, 10.5, col(C.hide)); ell(g, 0, Y + 3, 21 + st, 9.5, col(C.hide)); ell(g, 10 + st * 0.4, Y - 2.5, 14, 12, col(C.hide));
  ell(g, -3, Y - 3.5, 17 + st, 6.5, col(C.hideM)); ell(g, 8 + st * 0.4, Y - 8, 11, 5.5, col(C.hideL)); ell(g, 6 + st * 0.4, Y - 10.5, 6, 2.2, col(C.hideH));   /* the lit back and shoulder */
  ell(g, -2, Y + 9, 19 + st, 3.4, col(C.hideD));   /* the belly in shade */
  /* the grey frost of age along the withers, the scars (old fights), mud flung on the flank */
  for (let k = 0; k < 14; k++) { const gx = 2 + hash(k, 3) % 22 + st * 0.3, gy = Y - 11 + (hash(k, 5) % 6); box(g, gx, gy, 1 + (k & 1), 1, col(C.bristleT)); }
  for (const [sx, sy, sl] of [[-16, Y - 1, 6], [-9, Y + 2, 7], [-2, Y - 3, 5]]) { g.save(); g.translate(sx, sy); g.rotate(0.6); box(g, 0, 0, sl, 1, col(C.scar)); box(g, 1, 1, sl - 2, 1, col(C.scarD)); g.restore(); }
  for (let k = 0; k < 14; k++) box(g, -18 + (hash(k, 9) % 34), Y + 4 + (hash(k, 11) % 7), 1 + (hash(k, 13) % 3), 1 + (k % 2), col(k % 3 ? C.mud : C.mudL));
  /* the bristled ridge: tall stiff spikes from the neck to the rump, grey-tipped; P2 (ph>1) stands them on end */
  const up = ph > 1 ? 3 : 0;
  for (let k = 0; k < 15; k++) { const bx = -22 - st * 0.4 + k * (3.2 + st / 12), t = k / 14, hump = Math.sin(t * Math.PI * 0.85 + 0.5) * 6, by = Y - 13 - hump * 0.9 - (k > 8 ? (k - 8) * 0.7 : 0) + (k < 3 ? 3 - k : 0) - (k > 11 ? 0 : 0);
    const hh = 3 + (k % 2) + up + (t > 0.4 && t < 0.8 ? 1 : 0); poly(g, [[bx - 1.8, by + 4], [bx + (k % 2 ? 0.8 : -0.4), by - hh], [bx + 1.8, by + 4]], col(C.bristle)); box(g, bx, by - hh, 1, 2, col(C.bristleT)); }
  /* the tail: thin, ending in a tuft */
  g.strokeStyle = col(C.hideDD); g.lineWidth = 1.6; g.beginPath(); g.moveTo(-24 - st, Y - 3); g.quadraticCurveTo(-30 - st, Y - 7, -28 - st, Y - 13); g.stroke(); box(g, -30 - st, Y - 15, 3, 3, col(C.bristle));
}

/* the animation index a pose's own cycle uses: 8 steps of its own rhythm, so the cache stays small and the stride still reads */
const FREQ = p => (p.legs === 'walk' ? 9 : p.legs === 'run' ? 22 : p.legs === 'paw' ? 14 : p.kick ? 22 : p.shake ? 50 : p.legs === 'skid' ? 18 : 0);
export function animStep(p, time) { const f = FREQ(p); return f ? Math.floor((((time * f) / (Math.PI * 2)) % 1) * 8) & 7 : 0; }
const STEAM_T = time => Math.floor(time * 5) % 5;   /* snout steam: 5 puffs a second's worth of frames */

function drawBoar(g, name, p, k, ph, flash, time) {
  const ang = k * Math.PI / 4, s = Math.sin(ang), col = c => (flash ? '#ffffff' : c);
  if (p.lying) {   /* on his side, belly toward us: PINNED he kicks, SLEEPING he is a heap rooting in the duff */
    const kick = p.kick ? s * 3.2 : 0, sleep = p.eye === 'shut';
    ell(g, 0, -10, 24, 10.5, col(C.hide)); ell(g, -3, -14, 19, 5.5, col(C.hideM)); ell(g, -4, -17, 11, 2.2, col(C.hideL)); ell(g, 0, -4, 20, 3, col(C.hideD));
    for (let q = 0; q < 12; q++) box(g, -20 + q * 3.4, -20 - (q % 3) * 0.7 + (q > 8 ? 1 : 0), 2, 4 + (q % 3), col(C.bristle));   /* the ridge, seen end-on along his back */
    for (let q = 0; q < 10; q++) box(g, -16 + (hash(q, 4) % 28), -12 + (hash(q, 6) % 8), 2, 1, col(q % 2 ? C.mud : C.scar));
    for (let q = 0; q < 4; q++) { const kx = -14 + q * 8, kk = p.kick ? Math.sin(ang + q * 1.7) * 3.4 : sleep ? (q & 1) * 0.6 : 0;
      g.save(); g.translate(kx, -4); g.rotate(p.kick ? kk * 0.12 + (q & 1 ? 0.25 : -0.25) : 0.1 * (q & 1)); poly(g, [[-3.6, 0], [3.6, 0], [2.2, 7 + kk], [-2.2, 7 + kk]], col(C.hideD)); box(g, -2.4, 6.4 + kk, 2, 2.6, C.hoof); box(g, 0.4, 6.4 + kk, 2, 2.6, C.hoof); g.restore(); }
    g.save(); g.translate(R(26 + (p.kick ? s * 0.6 : 0)), -10); g.rotate(sleep ? 0.3 : -0.1 + kick * 0.02);
    ell(g, 0, 0, 9, 7.5, col(C.hide)); ell(g, 6, 3, 8, 4.4, col(C.grey)); ell(g, 14, 3, 2.6, 3.6, col(C.snout)); box(g, 14, 2, 1, 1.2, C.snoutD); box(g, 14, 4.4, 1, 1.2, C.snoutD);
    poly(g, [[-5, -5], [-3, -12], [0, -6]], col(C.hideD)); tusk(g, 8, 6, 0.1, 0.85, true);
    if (sleep) { box(g, 2, -1, 4, 1.4, col(C.hideDD)); } else { box(g, 2, -2, 3, 2.4, p.eye === 'red' ? col(C.red) : col(C.eye)); }
    g.restore();
    if (sleep) { for (let q = 0; q < 2; q++) { const t = ((time * 0.6 + q * 0.5) % 1); g.globalAlpha = (1 - t) * 0.6; ell(g, 34 + t * 5, -16 - t * 8, 1.6 + t * 2.4, 1.2 + t * 1.8, C.steam); } g.globalAlpha = 1; }
    return;
  }
  const rump = p.rump || 0, st = p.stretch || 0, wk = p.legs === 'walk' ? s : p.legs === 'run' ? s : 0;
  g.save();
  if (p.rear) { g.translate(-14, 0); g.rotate(-0.58); g.translate(14, 0); }
  if (p.pitch) { const px0 = p.pitch > 0 ? 13 : -14; g.translate(px0, 0); g.rotate(p.pitch); g.translate(-px0, 0); }   /* nose-down about the fore feet (rump up), or head-up about the hind feet */
  if (p.shake) g.translate(R(s * 1.6), 0);
  /* legs */
  const paw = p.legs === 'paw' ? Math.max(0, s) : 0, run = p.legs === 'run', lung = p.legs === 'lunge', skid = p.legs === 'skid', splay = p.legs === 'splay';
  const sw = (x, ph0) => run ? Math.sin(ang + ph0) * 0.95 : p.legs === 'walk' ? Math.sin(ang + ph0) * 0.32 : 0;
  const base = (x, near) => splay ? (x > 0 ? 0.34 : -0.34) : skid ? (x > 0 ? -0.4 : -0.22) : lung ? (x > 0 ? 0.42 : -0.18) : p.rear && x > 0 ? 0.2 : 0;
  const L = 10.5;
  leg(g, -12 - st, -9 - rump * 0.2, base(-12) + sw(-12, 0.4), L, true, 1);
  leg(g, 9 + st, -9, base(9) + sw(9, 3.5), L, true, 1);
  if (p.rear) { /* the reared stance: forelegs folded up under the chest, ready to come down */
    g.save(); g.translate(13, -10); g.rotate(-0.7); poly(g, [[-3.6, 0], [3.6, 0], [2, 7], [-2, 7]], C.hide); box(g, -2, 6, 4, 3, C.hoof); g.restore(); g.save(); g.translate(8, -8); g.rotate(-0.95); poly(g, [[-3.2, 0], [3.2, 0], [2, 6], [-2, 6]], C.hideD); box(g, -2, 5, 4, 3, C.hoof); g.restore(); }
  barrel(g, p, flash, ph, rump, st);
  leg(g, -15 - st, -8 - rump * 0.25, base(-15) - sw(-15, 0.4), L, false, 1);
  if (!p.rear) leg(g, 13 + st, -8 - paw * 4.5, base(13) - sw(13, 3.5) + (p.legs === 'paw' ? -0.5 * paw : 0), L - paw * 3, false, 1);
  /* the head, hung off the shoulder by its pose */
  const [hx, hy, hr] = p.head || [0, 0, 0];
  g.save(); g.translate(R(21 + st + hx), R(-17 + hy)); g.rotate(hr); g.scale(1.22, 1.22); head(g, name, p, flash, time); g.restore();
  if (p.legs === 'paw') { /* the raked ground: dust thrown behind the raking hoof, a furrow */
    for (let q = 0; q < 4; q++) box(g, 17 + q * 2 + (paw ? 1 : 0), -1 - (q % 2) * 1.5 - paw * 1.5, 2, 1.4, q % 2 ? '#a8885a' : '#c9b27c'); box(g, 15, 0, 9, 1, '#6a4a2a'); }
  if (name === 'rootTell') { /* the snout dug in: heaped earth on both sides of it */
    ell(g, 36, -2, 6, 3, '#4a3020'); ell(g, 36, -4, 3, 1.6, '#6a4a2a'); box(g, 33, -6, 2, 2, '#2e5a34'); box(g, 40, -5, 2, 2, '#4a3020'); }
  if (name === 'root') { for (let q = 0; q < 5; q++) { const t = ((time * 2.4 + q * 0.2) % 1); box(g, 26 + q * 3 - t * 4, -26 - t * 12 + (q % 2) * 4, 3, 2, q % 2 ? '#4a3020' : '#6a4a2a'); } }
  if (name === 'stomp') { box(g, 14, -1, 14, 2, '#8e6a40'); box(g, 19, -3, 7, 2, '#c9b27c'); box(g, 28, -1, 6, 1, '#6a4a2a'); }
  if (name === 'sweepTell') { g.globalAlpha = 0.55; g.fillStyle = C.gold; g.fillRect(R(24), R(-30), 1, 4); g.fillRect(R(22), R(-28), 5, 1); g.globalAlpha = 1; }
  if (name === 'chargeTell') { for (let q = 0; q < 3; q++) box(g, -22 - q * 4, -3 - q * 2, 2, 1.4, '#a8885a'); }
  if (p.dazed) for (let q = 0; q < 3; q++) { const a = k * Math.PI / 4 + q * 2.1; box(g, 20 + Math.cos(a) * 9, -36 + Math.sin(a) * 3, 2, 2, C.gold); }
  g.restore();
}

/* ---------- the sprite: a pose x its cycle step x phase x flash, baked once ---------- */
export const BOAR_ANCHOR = { ax: 70, ay: 92, w: 140, h: 118 };
export function boarSprite(name, pose, time, ph, flash) {
  const k = animStep(pose, time), sk = pose.eye === 'red' || pose.eye === 'shut' && pose.lying ? STEAM_T(time) : 0, key = `${name}|${k}|${ph > 1 ? 2 : 1}|${flash ? 1 : 0}|${sk}`;
  return once(key, () => { const [c, g] = canvas(BOAR_ANCHOR.w, BOAR_ANCHOR.h); g.translate(BOAR_ANCHOR.ax, BOAR_ANCHOR.ay); drawBoar(g, name, pose, k, ph, flash, (sk || 0) * 0.2 + 0.02);
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.setTransform(1, 0, 0, 1, 0, 0); g.putImageData(img, 0, 0);   /* snap the soft edges: pixel art */
    return outline(c, OUTC); });
}

/* ---------- THE TREELINE GIVES UP A NEW MARKED PINE: a green shoot, then a young pine grown to size ---------- */
export function drawSapling(g, drawPineFn, x, y, k, time) {   /* k 0..1: the growth */
  const kk = Math.max(0.06, k); g.save(); g.translate(R(x), R(y)); g.scale(0.25 + 0.75 * kk, kk); drawPineFn(g, 0, 0); g.restore();
  g.fillStyle = '#4a3020'; for (let q = 0; q < 5; q++) g.fillRect(R(x - 8 + q * 4), R(y - 1 - (q % 2)), 3, 2);   /* turned earth round the root */
}
export function drawShoot(g, x, y, k) {   /* the spent stump's green shoot (the last 1.4 s of its wait) */
  const h = 4 + 14 * k; g.fillStyle = '#2a5636'; g.fillRect(R(x - 1), R(y - 7 - h), 2, R(h)); g.fillStyle = '#53944a'; g.fillRect(R(x - 3), R(y - 7 - h), 6, 2); g.fillRect(R(x - 2), R(y - 9 - h), 4, 2); g.fillStyle = '#78b45c'; g.fillRect(R(x - 1), R(y - 11 - h), 2, 2);
}

/* ---------- THE FELLING CLEARING: dressing along the floor (behind the fight), all low, none of it a solid ---------- */
function bakeSawhorse() {
  const [c, g] = canvas(44, 24);
  const B = ['#1c120a', '#2e1c0f', '#4a2f19', '#6a4425', '#8c6034', '#b07e48'];
  for (const x0 of [4, 32]) { for (let k = 0; k < 2; k++) { g.save(); g.translate(x0 + (k ? 6 : 0), 22); g.rotate(k ? 0.28 : -0.28); g.fillStyle = B[3]; g.fillRect(-1, -20, 3, 21); g.fillStyle = B[5]; g.fillRect(-1, -20, 1, 21); g.restore(); } }
  g.fillStyle = B[4]; g.fillRect(2, 8, 40, 4); g.fillStyle = B[5]; g.fillRect(2, 8, 40, 1); g.fillStyle = B[1]; g.fillRect(2, 11, 40, 1);   /* the cross-rail */
  g.fillStyle = '#e2cb92'; g.fillRect(41, 8, 1, 4);
  /* a half-sawn plank across it, a saw stuck in the cut */
  g.fillStyle = '#c7a766'; g.fillRect(8, 5, 26, 3); g.fillStyle = '#e2cb92'; g.fillRect(8, 5, 26, 1); g.fillStyle = '#9a7442'; g.fillRect(8, 7, 26, 1);
  g.fillStyle = '#8a929a'; g.fillRect(24, 0, 8, 6); g.fillStyle = '#c4ccd4'; g.fillRect(24, 0, 8, 1); g.fillStyle = '#4a2f19'; g.fillRect(22, 0, 2, 3);
  return outline(c, OUTC);
}
function bakeWallow() {   /* the old boar's wallow: a flat mud pan, a wet rim, trampled reeds */
  const [c, g] = canvas(88, 14);
  ell(g, 44, 9, 42, 5, '#2a1a10'); ell(g, 44, 8, 38, 4, '#4a3320'); ell(g, 42, 7.5, 28, 2.6, '#5e4630'); ell(g, 36, 7, 12, 1.2, '#7a6040');
  for (let q = 0; q < 16; q++) { g.fillStyle = q % 3 ? '#3a2a18' : '#6a5238'; g.fillRect(R(6 + (hash(q, 2) % 76)), R(5 + (hash(q, 3) % 7)), 2 + (q & 1), 1); }
  for (const rx of [4, 9, 80, 84]) { g.fillStyle = '#4a6a34'; g.fillRect(rx, 1, 1, 7); g.fillStyle = '#6a8a4a'; g.fillRect(rx + 1, 3, 1, 5); }
  return c;
}
function bakeChips() {
  const [c, g] = canvas(64, 6);
  for (let q = 0; q < 26; q++) { g.fillStyle = ['#f4e6bd', '#e2cb92', '#c7a766', '#9a7442'][hash(q, 7) % 4]; g.fillRect(2 + (hash(q, 1) % 58), 2 + (hash(q, 2) % 4), 2 + (q & 1), 1); }
  return c;
}
/* sprites at fixed fractions of the arena, so the dressing is the same fight after fight; cx, cy = camera; fy = the floor's y (world) */
export function clearingDress(g, x0, x1, fy, cx, cy, VW, time) {
  const W = x1 - x0, X = f => x0 + W * f, floorY = R(fy - cy);
  if (x1 < cx - 40 || x0 > cx + VW + 40) return;
  const put = (spr, wx, dy = 0, flip = false) => { const sx = R(wx - cx - spr.width / 2); if (sx < -spr.width || sx > VW) return; if (flip) { g.save(); g.translate(sx + spr.width, floorY - spr.height + dy); g.scale(-1, 1); g.drawImage(spr, 0, 0); g.restore(); } else g.drawImage(spr, sx, floorY - spr.height + dy); };
  /* the wallow, off-centre, where he roots; chips and sawdust under the stumps and horses */
  put(once('wallow', bakeWallow), X(0.37), 3);
  put(once('chips', bakeChips), X(0.12), 2); put(once('chips', bakeChips), X(0.78), 2); put(once('chips', bakeChips), X(0.56), 2);
  /* the edges: a log stack and a fence at the west, the sawhorse and the chopping block with the axe at the east, stumps scattered (the old ones the level places are dressing too) */
  put(logPileSprite(), X(0.045), 0); put(railFence(1), X(0.1), 0, false); put(stumpS(1), X(0.19), 0); put(logS(1), X(0.27), 0, true);
  put(once('horse', bakeSawhorse), X(0.66), 0); put(stumpS(0), X(0.74), 0); put(blockSprite(), X(0.87), 0); put(railFence(0), X(0.94), 0, true); put(logPileSprite(), X(0.975), 0, true);
}
export const _boarKeys = () => memo.size;

/* ---------- THE WOODSMEN'S KITE (the trail's seven kite goblins): a spruce-twig frame, bark-cloth / oilcloth patched with birch-bark, a hemp string, a tail of woodchips and a pine cone ---------- */
export const WOOD_KITE_COLS = ['#a8885a', '#6a8a4a', '#b8663a', '#7a8a96'];   /* birch-bark cloth, moss green, rust oilcloth, rain-grey sailcloth */
export function drawWoodKite(g, kx, ky, col, time) {
  g.fillStyle = col; g.beginPath(); g.moveTo(kx, ky - 8); g.lineTo(kx + 7, ky); g.lineTo(kx, ky + 8); g.lineTo(kx - 7, ky); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,240,200,0.28)'; g.beginPath(); g.moveTo(kx, ky - 8); g.lineTo(kx + 7, ky); g.lineTo(kx, ky); g.closePath(); g.fill();   /* the lit quarter */
  g.fillStyle = '#e2cb92'; g.fillRect(kx + 2, ky - 3, 3, 2); g.fillRect(kx - 5, ky + 1, 2, 2);   /* birch-bark patches */
  g.fillStyle = '#3e2614'; g.fillRect(kx, ky - 8, 1, 16); g.fillRect(kx - 7, ky, 14, 1);          /* the spruce-twig cross */
  g.fillStyle = '#8c6034'; g.fillRect(kx - 8, ky, 1, 1); g.fillRect(kx + 7, ky, 1, 1); g.fillRect(kx, ky - 9, 1, 1); g.fillRect(kx, ky + 8, 1, 1);   /* lashed tips */
  for (let k = 1; k < 4; k++) { const sx = kx - 1 + Math.round(Math.sin(time * 6 + k) * 2); g.fillStyle = k % 2 ? '#e2cb92' : '#9a7442'; g.fillRect(sx, ky + 8 + k * 4, 3, 2); if (k === 3) { g.fillStyle = '#6a4425'; g.fillRect(sx, ky + 8 + k * 4 + 2, 2, 3); g.fillStyle = '#8c6034'; g.fillRect(sx - 1, ky + 8 + k * 4 + 3, 4, 1); } }   /* a tail of chips ending in a pine cone */
}
