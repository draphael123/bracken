// freebooter_art.js - THE FREEBOOTER, THE HAND-DRAWN SHEET (claude/pfart, 2026-11-05; the greybox of claude/water1 src/freebooter-hands.js drew rectangles - the API is kept: the pose keys ARE the boss's modes,
// src/freebooter-boss.js). Pure drawing on a 2d context g at (x, y) = his feet on screen; f = facing (+1 right). o = { mode, p (the move's progress 0..1), n (the cut's index 0-4), flash, ward }.
// HE IS (a hero-turned-boss: the playable freebooter's kit, the pirate who got a fleet): a lean man about 38 px with the hat - a long oxblood coat open over a gold sash, a white shirt, a red-brown
// kerchief, black tricorn with a drooping white feather, tall cuffed boots, a cutlass in the right hand, a long pistol in the left (a second at the sash), an earring, a short dark beard, a cold white-teeth grin.
// EVERY MOVE HAS ITS OWN WINDUP AND ITS OWN RELEASE (B16) and the TELLS READ AS SHAPES:
//   idle / walk / guard      cutlass up in a duelist's guard, the pistol low behind - he breathes, he does not stand still
//   pistolTell (!!)          the long pistol leveled at arm's length at your chest, his head tucked behind it, the other hand on his hip, coat blown back  -> pistolFire: the arm kicks UP, smoke
//   reload (OPEN)            crouched low behind a shoulder, the muzzle UP, the ramrod in his teeth-side hand going down the barrel, powder horn out, head down, a curl of smoke
//   cutsTell (!)             the cutlass drawn back over the shoulder, point behind him, weight on the back foot     -> cuts (five: alternating high/low arcs, an arc trail) -> cutsRec (blade low, bent, panting)
//   bootTell (!)             knee up to the chest, a hand on the hilt, leaning back          -> boot (leg out flat at shin height, a dust fan) -> bootRec (hopping back onto both feet)
//   riposteTell (!)          blade drawn back at the hip, the point straight at you, a smile        -> riposte (a lunge: the arm straight, the front knee bent) -> riposteRec
//   haulTell / haulWait      the bosun's whistle to his lips and the grapnel whirling over the hat on its line -> hauling, leaning back with both hands on the line
//   boardTell -> boardAir    a crouch with the blade low and back, then a leap with the blade forward and the coat streaming
//   plungeTell (!!)          off the deck: both hands on the hilt OVER his head, the point DOWN, legs tucked -> plungeAir (the dive: the blade straight down, coat flaring up) -> plungeRec (landing crouch)
//   stuck (OPEN)             on one knee, both hands on a hilt that is buried in the deck, a boot braced on it, hauling, splinters - the readable window
//   flash                    a ball of powder smoke over the spot he left
//   sleep / wake             slumped on a keg, the hat over his eyes, a bottle; waking: the hat tips up
//   dead (drawDeadFreebooter) he goes to his knees, the hat rolls, the pistol drops, he lies on the deck; then his red flag comes down (the hands)
// Palette discipline: his own ramp below + the fleet's steel and brass + the powder smoke's greys. tools/pf-art-lint.mjs checks every colour.
const R = Math.round, D2R = Math.PI / 180;
export const FBP = {
  coat: ['#2a0a10', '#4c141a', '#74202a', '#9a3434', '#c4503e'], sash: ['#5e4216', '#a07a28', '#dcb44a', '#fff0a4'], shirt: ['#7a7468', '#b8b2a2', '#e8e2d2'],
  hat: ['#0a080e', '#1a1620', '#322d3c'], feather: ['#a8a49a', '#e8e4da'], skin: ['#76462e', '#b47852', '#d89a70', '#f0bd96'], beard: ['#1a1210', '#2e2218'],
  leather: ['#120d0a', '#2a1e16', '#4a3626', '#6e5238'], steel: ['#3c4250', '#808898', '#c8d0dc', '#f4f8ff'], iron: ['#14161a', '#2c3038', '#4a505c'], wood: ['#2a1c12', '#4a3220', '#6e4c30'],
  brass: ['#8a6a1c', '#c9a340', '#f0d070'], smoke: ['#3a3a44', '#6a6a76', '#a0a0aa', '#d0d0d8'], spark: ['#ff8a2a', '#ffc84a', '#fff6c8'], kerch: ['#6a1e1a', '#9a3028'], teeth: '#f4f0e4', dust: ['#c9b27c', '#8a7454'],
};
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
let g_, X_, Y_, F_, T_;
const rc = (dx, dy, w, h, c) => { g_.fillStyle = c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - R(w), Y_ + R(dy), R(w), R(h)); };      /* a rect in his frame: dx forward, dy down from the feet */
const dot = (dx, dy, c) => rc(dx, dy, 1, 1, c);
function ln(x0, y0, x1, y1, c, th = 1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) { const dx = x0 + (x1 - x0) * i / n, dy = y0 + (y1 - y0) * i / n; for (let a = 0; a < th; a++) for (let b = 0; b < th; b++) dot(dx + a - (th > 1 ? 0 : 0), dy + b, c); } }
/* a limb of two tones: dark under, lit over */
const limb = (x0, y0, x1, y1, c0, c1) => { ln(x0, y0, x1, y1, c0, 2); ln(x0, y0 - 0.5, x1, y1 - 0.5, c1, 1); };
function blade(hx, hy, deg, len, tip) {                                                                                                    /* a cutlass from the hand: guard, grip, a curved steel blade */
  const a = deg * D2R, dx = Math.cos(a), dy = -Math.sin(a);
  ln(hx - dx * 3, hy - dy * 3, hx, hy, FBP.leather[2], 1);                                                                                  /* grip */
  ln(hx - dy * 2, hy + dx * 2, hx + dy * 2, hy - dx * 2, FBP.brass[1], 1);                                                                   /* the knuckle guard */
  for (let i = 1; i <= len; i++) { const curve = Math.sin(i / len * Math.PI) * 1.4, bx = hx + dx * i - dy * curve * 0.5, by = hy + dy * i + dx * curve * 0.5; dot(bx, by, i > len - 3 ? FBP.steel[3] : FBP.steel[1]); dot(bx - dy * 0.0 + (dy ? 0 : 0), by - 1, i % 2 ? FBP.steel[2] : FBP.steel[3]); }
  if (tip) dot(hx + dx * (len + 1), hy + dy * (len + 1), FBP.steel[3]);
}
function pistol(hx, hy, deg, len = 11) {                                                                                                  /* a long flintlock: barrel, brass cap, lock, curved butt */
  const a = deg * D2R, dx = Math.cos(a), dy = -Math.sin(a);
  for (let i = -3; i <= len; i++) dot(hx + dx * i, hy + dy * i, i < 0 ? FBP.wood[2] : i > len - 2 ? FBP.iron[2] : FBP.iron[1]);
  dot(hx + dx * 1, hy + dy * 1 - 1, FBP.steel[2]); dot(hx + dx * len, hy + dy * len, FBP.brass[2]);                                          /* the cock (hammer) and the muzzle cap */
  dot(hx - dx * 3 - dy * 0, hy - dy * 3 + 1, FBP.wood[1]); dot(hx - dx * 4, hy - dy * 4 + 2, FBP.wood[0]);
}
function smoke(dx, dy, k, n = 5, spread = 1) { for (let i = 0; i < n; i++) { const u = clamp(k * 1.2 - i * 0.12), r = 2 + i * spread, ox = i * 3 * u * spread + Math.sin(T_ * 4 + i) * 1, oy = -u * 10 - i * 2;
  g_.globalAlpha = clamp(0.8 - u * 0.7); rc(dx + ox - r / 2, dy + oy - r / 2, r, r * 0.7, FBP.smoke[Math.min(3, 1 + (i >> 1))]); } g_.globalAlpha = 1; }

/* the BODY: legs (a stance), coat, sash, head, hat. P = the pose: { lean, crouch, legs: [[kx,ky,fx,fy] x2] | stance, headDy, headTilt, coatFlare, eyes:'open'|'shut', grin, arm: [hx, hy] (blade hand), off: [hx, hy] }. */
function body(P, back) {
  const cr = P.crouch || 0, lean = P.lean || 0, hipY = -13 + cr, shY = -25 + cr * 0.9, shX = lean * 0.6, hdX = lean, hdY = -31 + cr * 0.85 + (P.headDy || 0), flare = P.coatFlare || 0;
  /* legs: two tall cuffed boots */
  const legs = P.legs || [[-1, -7, -3, 0], [2, -7, 4, 0]];
  legs.forEach((lg, i) => { const [kx, ky, fx, fy] = lg, hx = i ? 2 : -1; limb(hx, hipY, kx, ky + cr * 0.4, FBP.leather[1], FBP.leather[2]); limb(kx, ky + cr * 0.4, fx, fy, FBP.leather[0], FBP.leather[1]);
    rc(fx - 2, fy - 2, 6, 3, FBP.leather[0]); rc(fx - 2, fy - 2, 5, 1, FBP.leather[2]); rc(kx - 2, ky + cr * 0.4 - 1, 4, 2, FBP.leather[3]); });                  /* boot, its toe, the turned cuff */
  /* the coat: a long skirt to the knee that streams back with `flare`, a gold sash, buttons */
  const top = shY, bot = hipY + 7 + flare * 2;
  for (let y = top; y < bot; y++) { const k = (y - top) / Math.max(1, bot - top), wd = 7 + k * 3 + (flare > 0 ? flare * k * 3 : 0), sh = lean * (1 - k) * 0.6;
    rc(-wd / 2 - sh - (flare > 0 ? flare * k * 3 : 0), y, wd, 1, FBP.coat[y % 5 === 0 ? 1 : 2]); rc(-wd / 2 - sh - (flare > 0 ? flare * k * 3 : 0) + wd - 2, y, 2, 1, FBP.coat[1]); rc(-wd / 2 - sh - (flare > 0 ? flare * k * 3 : 0) + 1, y, 1, 1, FBP.coat[3]); }
  rc(-1 + shX * 0.2, top + 1, 3, bot - top - 2, FBP.shirt[1]); rc(0 + shX * 0.2, top + 2, 1, 3, FBP.shirt[2]);                                    /* the open coat shows the shirt */
  for (let k = 0; k < 3; k++) dot(-2 + shX * 0.2, top + 3 + k * 3, FBP.sash[2]);
  rc(-5 + lean * 0.2, hipY - 3, 11, 3, FBP.sash[1]); rc(-5 + lean * 0.2, hipY - 3, 11, 1, FBP.sash[3]); rc(4 + lean * 0.2, hipY - 2, 3, 5 + flare, FBP.sash[1]);   /* the sash and its tail */
  rc(-4 + lean * 0.2, hipY - 5, 3, 3, FBP.iron[1]); rc(-4 + lean * 0.2, hipY - 5, 2, 1, FBP.wood[2]);                                                /* the second pistol in the sash */
  rc(-6 + shX, shY, 12, 3, FBP.coat[3]); rc(-6 + shX, shY, 12, 1, FBP.coat[4]); rc(-4 + shX, shY + 3, 3, 1, FBP.coat[0]);                            /* the shoulders and the lapel's turn */
  /* head: skin, a kerchief at the neck, the beard, the eye, an earring; the tricorn */
  rc(hdX - 1, hdY + 7, 4, 2, FBP.kerch[0]); dot(hdX + 1, hdY + 8, FBP.kerch[1]);
  rc(hdX - 3, hdY, 7, 8, FBP.skin[1]); rc(hdX - 3, hdY, 2, 8, FBP.skin[2]); rc(hdX + 2, hdY + 2, 2, 5, FBP.skin[0]); rc(hdX - 2, hdY + 5, 6, 3, FBP.beard[1]); rc(hdX - 2, hdY + 6, 5, 2, FBP.beard[0]);
  dot(hdX + 2, hdY + 3, P.eyes === 'shut' ? FBP.skin[0] : FBP.hat[0]); dot(hdX + 3, hdY + 3, P.eyes === 'shut' ? FBP.skin[0] : FBP.shirt[2]); dot(hdX - 3, hdY + 5, FBP.brass[2]);
  if (P.grin) { rc(hdX, hdY + 6, 4, 1, FBP.teeth); dot(hdX + 3, hdY + 6, FBP.beard[0]); }
  const hat = P.hat === 'off' ? null : P.hat === 'tip' ? 1 : 0, ty = hdY - 4 - (hat === 1 ? -3 : 0);
  if (hat !== null) { rc(hdX - 6, ty + 3, 14, 3, FBP.hat[0]); rc(hdX - 6, ty + 3, 14, 1, FBP.hat[2]); rc(hdX - 4, ty, 10, 4, FBP.hat[1]); rc(hdX - 4, ty, 3, 3, FBP.hat[2]); rc(hdX - 7, ty + 2, 2, 2, FBP.hat[0]); rc(hdX + 7, ty + 2, 2, 2, FBP.hat[0]); rc(hdX - 3, ty + 4, 9, 1, FBP.sash[1]);   /* the brim turned up three ways, a gold band */
    for (let k = 0; k < 6; k++) { dot(hdX - 5 - k, ty + 1 + (k >> 1) + Math.round(Math.sin(T_ * 3 + k) * 0.6), k < 3 ? FBP.feather[1] : FBP.feather[0]); } }          /* a white feather drooping aft */
  return { shX, shY, hdX, hdY, hipY, cr };
}
const ARM = (B, hx, hy, c0 = FBP.coat[1], c1 = FBP.coat[3]) => { limb(B.shX + 3, B.shY + 2, hx, hy, c0, c1); rc(hx - 1, hy - 1, 3, 3, FBP.skin[1]); dot(hx, hy - 1, FBP.skin[3]); };                /* a sleeve to a hand */

const WALKL = (t) => { const s = Math.sin(t * 8); return [[-1 + s * 3, -7, -3 + s * 5, 0 - (s > 0.6 ? 1 : 0)], [2 - s * 3, -7, 4 - s * 5, 0 - (s < -0.6 ? 1 : 0)]]; };
const SET = [[-2, -7, -4, 0], [3, -7, 6, 0]];

/* ---------- THE POSES ---------- */
const POSE = {
  idle: (p, t, o) => { const b = Math.sin(t * 2.2) * 0.7; return { lean: -1, legs: SET, headDy: b * 0.5, grin: Math.sin(t * 0.6) > 0.7, draw: B => { ARM(B, 13, -22 + b); blade(13, -22 + b, 70, 18); ARM(B, -4, -14, FBP.coat[0], FBP.coat[2]); pistol(-4, -14, 250, 7); } }; },
  walk: (p, t, o) => ({ lean: 2, legs: WALKL(t), headDy: Math.abs(Math.sin(t * 8)) * -0.6, draw: B => { ARM(B, 12, -21); blade(12, -21, 66, 18); ARM(B, -5, -15, FBP.coat[0], FBP.coat[2]); pistol(-5, -15, 250, 7); } }),
  guard: (p, t, o) => ({ lean: 0, legs: SET, crouch: 1, grin: true, draw: B => { ARM(B, 14, -21 + Math.sin(t * 3)); blade(14, -21 + Math.sin(t * 3), 78, 19); ARM(B, -3, -15, FBP.coat[0], FBP.coat[2]); pistol(-3, -15, 245, 7); } }),
  pistolTell: (p, t, o) => ({ lean: -3, legs: [[-3, -7, -6, 0], [3, -7, 7, 0]], headDy: 1, coatFlare: 1, draw: B => { const e = ease(clamp(p * 1.6)), hx = lerp(8, 16, e), hy = lerp(-26, -23, e); ARM(B, hx, hy); pistol(hx, hy, 0, 12); ARM(B, -6, -13, FBP.coat[0], FBP.coat[2]); dot(hx + 13, hy, FBP.spark[0]); } }),
  pistolFire: (p, t, o) => ({ lean: -5, legs: [[-4, -7, -8, 0], [3, -7, 7, 0]], coatFlare: 2, draw: B => { ARM(B, 14, -29); pistol(14, -29, 38, 12); ARM(B, -6, -13, FBP.coat[0], FBP.coat[2]);
    if (p < 0.5) { rc(26, -36, 4, 3, FBP.spark[2]); rc(24, -34, 3, 3, FBP.spark[1]); rc(29, -37, 2, 2, FBP.spark[0]); } smoke(24, -34, p, 5, 1.2); } }),
  reload: (p, t, o) => { const rod = Math.sin(t * 9) * 3; return { lean: 3, crouch: 7, legs: [[-4, -5, -6, 0], [5, -4, 8, 0]], headDy: 4, eyes: 'open', draw: B => { ARM(B, 7, -17); pistol(7, -17, 82, 11); ARM(B, 10, -22 + rod, FBP.coat[0], FBP.coat[2]);
    ln(10, -22 + rod, 8, -22 + rod + 8, FBP.steel[1], 1); dot(7, -19, FBP.sash[2]); rc(-4, -12, 4, 3, FBP.leather[2]); dot(-3, -13, FBP.brass[2]); smoke(7, -29, (t * 1.3) % 1, 4, 0.8); } }; },
  cutsTell: (p, t, o) => ({ lean: -4, legs: [[-4, -7, -8, 0], [3, -7, 6, 0]], coatFlare: 1, draw: B => { const e = ease(p), hy = lerp(-24, -30, e); ARM(B, -2, hy); blade(-2, hy, 155, 20); ARM(B, 5, -17, FBP.coat[0], FBP.coat[2]); pistol(5, -17, 235, 6); } }),
  cuts: (p, t, o) => { const n = o.n || 0, hi = n % 2 === 0, k = ease(clamp(p * 5 - n * 0)), deg = hi ? lerp(150, -40, ((p * 5) % 1)) : lerp(-40, 150, ((p * 5) % 1)), hx = 12 + ((p * 5) % 1) * 4, hy = hi ? -26 : -12;
    return { lean: 3 + n, legs: [[1, -7, -2, 0], [7, -7, 11, 0]], coatFlare: 1, grin: true, draw: B => { ARM(B, hx, hy); blade(hx, hy, deg, 22);
      for (let i = 0; i < 14; i++) { const a = (deg + (hi ? -1 : 1) * i * 5) * D2R; g_.globalAlpha = 0.5 * (1 - i / 14); dot(hx + Math.cos(a) * 22, hy - Math.sin(a) * 22, FBP.steel[3]); } g_.globalAlpha = 1; ARM(B, -3, -15, FBP.coat[0], FBP.coat[2]); } }; },
  cutsRec: (p, t, o) => ({ lean: 6, crouch: 3, legs: [[2, -6, -3, 0], [8, -6, 12, 0]], headDy: 2, draw: B => { ARM(B, 13, -9); blade(13, -9, -50, 20); ARM(B, 2, -14, FBP.coat[0], FBP.coat[2]); if (Math.sin(t * 12) > 0) dot(B.hdX + 4, B.hdY - 2, FBP.shirt[2]); } }),
  bootTell: (p, t, o) => ({ lean: -4, legs: [[-4, -6, -6, 0], [7, -17, 2, -11]], coatFlare: 1, draw: B => { ARM(B, 5, -17); blade(5, -17, 20, 14); ARM(B, -5, -16, FBP.coat[0], FBP.coat[2]); } }),
  boot: (p, t, o) => ({ lean: -6, crouch: 2, legs: [[-5, -6, -9, 0], [14, -9, 25, -8]], coatFlare: 2, draw: B => { ARM(B, 3, -16); blade(3, -16, 105, 15); ARM(B, -6, -14, FBP.coat[0], FBP.coat[2]); if (p < 0.6) { for (let i = 0; i < 4; i++) rc(24 + i * 2 + p * 5, -6 + (i & 1) * 2, 2, 1, FBP.dust[i & 1]); } } }),
  bootRec: (p, t, o) => ({ lean: 2, crouch: 2, legs: [[-1, -6, -3, -2 - R(Math.sin(p * 9) * 2)], [3, -7, 7, 0]], draw: B => { ARM(B, 10, -20); blade(10, -20, 60, 17); ARM(B, -4, -15, FBP.coat[0], FBP.coat[2]); } }),
  riposteTell: (p, t, o) => ({ lean: -2, crouch: 2, legs: [[-4, -6, -7, 0], [4, -6, 8, 0]], grin: true, draw: B => { ARM(B, 2, -14); blade(2, -14, 12, 22); ARM(B, -5, -16, FBP.coat[0], FBP.coat[2]); } }),
  riposte: (p, t, o) => ({ lean: 8, crouch: 3, legs: [[-4, -6, -9, 0], [8, -8, 14, 0]], coatFlare: 2, grin: true, draw: B => { ARM(B, 17, -19); blade(17, -19, 2, 20, true); ARM(B, -6, -13, FBP.coat[0], FBP.coat[2]); } }),
  riposteRec: (p, t, o) => ({ lean: 7, crouch: 3, legs: [[-3, -6, -8, 0], [8, -8, 13, 0]], draw: B => { ARM(B, 16, -17); blade(16, -17, 8, 20); ARM(B, -4, -14, FBP.coat[0], FBP.coat[2]); } }),
  haulTell: (p, t, o) => ({ lean: -2, legs: SET, draw: B => { const a = t * 11; ARM(B, 3, -33); dot(4, -33, FBP.brass[2]); dot(5, -33, FBP.brass[1]);                 /* the bosun's call at his lips */
    ARM(B, 4, -39, FBP.coat[0], FBP.coat[2]); for (let i = 0; i < 14; i++) { const q = a + i * 0.45, rx = 4 + Math.cos(q) * 9, ry = -42 + Math.sin(q) * 3; dot(rx, ry, i < 12 ? FBP.leather[3] : FBP.iron[2]); } dot(4 + Math.cos(a) * 9, -42 + Math.sin(a) * 3 + 1, FBP.steel[2]); } }),
  haulWait: (p, t, o) => ({ lean: -6, crouch: 3, legs: [[-5, -6, -10, 0], [4, -7, 6, 0]], draw: B => { const s = Math.sin(t * 5) * 1.5; ARM(B, 10 + s, -18); ARM(B, 6 - s, -15, FBP.coat[0], FBP.coat[2]); for (let i = 0; i < 14; i++) dot(10 + i * 2, -18 - i * 0.2 + Math.sin(i + t * 4), i % 3 ? FBP.leather[3] : FBP.leather[2]); } }),
  boardTell: (p, t, o) => ({ lean: -5, crouch: 7, legs: [[-5, -5, -8, 0], [6, -4, 9, 0]], coatFlare: 1, draw: B => { ARM(B, -2, -12); blade(-2, -12, 150, 17); ARM(B, 4, -15, FBP.coat[0], FBP.coat[2]); } }),
  boardAir: (p, t, o) => ({ lean: 6, legs: [[-6, -9, -13, -6], [3, -10, 1, -5]], coatFlare: 3, draw: B => { ARM(B, 16, -25); blade(16, -25, -6, 20, true); ARM(B, -7, -28, FBP.coat[0], FBP.coat[2]); } }),
  plungeTell: (p, t, o) => ({ lean: 1, legs: [[-3, -10, -4, -4], [3, -11, 5, -5]], coatFlare: 1, grin: true, draw: B => { ARM(B, 5, -38); ARM(B, 3, -38, FBP.coat[0], FBP.coat[2]); blade(4, -38, -85, 17); } }),
  plungeAir: (p, t, o) => ({ lean: 2, legs: [[-3, -12, -2, -8], [4, -12, 4, -7]], coatFlare: 4, headDy: 1, draw: B => { ARM(B, 3, -36); ARM(B, 1, -36, FBP.coat[0], FBP.coat[2]); blade(3, -36, -90, 22, true); } }),
  plungeRec: (p, t, o) => ({ lean: 4, crouch: 8, legs: [[-4, -4, -7, 0], [6, -4, 9, 0]], headDy: 4, draw: B => { ARM(B, 10, -12); ARM(B, 8, -10, FBP.coat[0], FBP.coat[2]); blade(10, -12, -88, 14); } }),
  stuck: (p, t, o) => { const h = Math.sin(t * 8) * 1.2; return { lean: 6, crouch: 8, legs: [[-5, -5, -9, 0], [9, -9, 13, -1]], headDy: 4 + h * 0.5, eyes: 'open', draw: B => {
    ARM(B, 12, -14 + h); ARM(B, 10, -11 + h, FBP.coat[0], FBP.coat[2]); blade(12, -14 + h, -86, 22);                                                                    /* the blade buried to the quillons, both hands on the hilt */
    rc(10, 0, 6, 2, FBP.wood[1]); rc(9, 0, 8, 1, FBP.wood[2]); if (Math.sin(t * 8) > 0.4) { dot(18, -3, FBP.dust[0]); dot(7, -2, FBP.dust[1]); dot(20, -1, FBP.wood[2]); } if (Math.sin(t * 3) > 0.7) dot(B.hdX - 4, B.hdY + 2, FBP.shirt[2]); } }; },
  sleep: (p, t, o) => ({ lean: 4, crouch: 10, legs: [[4, -4, 8, 0], [7, -4, 11, 0]], eyes: 'shut', hat: 'tip', headDy: 3, draw: B => { ARM(B, 8, -12); rc(8, -14, 2, 5, FBP.brass[0]); rc(8, -14, 2, 1, FBP.brass[2]); rc(-8, 0, 12, 12, FBP.wood[1]); rc(-8, 0, 12, 1, FBP.wood[2]); rc(-8, 5, 12, 1, FBP.iron[1]); rc(-8, 9, 12, 1, FBP.iron[1]);   /* a keg under him, a bottle in his hand */
    if (Math.sin(t * 1.2) > 0) { const k = (t * 0.8) % 1; g_.globalAlpha = 1 - k; dot(10, -36 - k * 8, FBP.shirt[2]); dot(12, -40 - k * 8, FBP.shirt[1]); g_.globalAlpha = 1; } } }),
  wake: (p, t, o) => ({ lean: lerp(4, 0, p), crouch: lerp(10, 0, ease(p)), legs: SET, hat: p < 0.5 ? 'tip' : null, headDy: lerp(3, 0, p), grin: p > 0.6, eyes: p < 0.3 ? 'shut' : 'open', draw: B => { ARM(B, lerp(8, 14, p), lerp(-12, -21, p)); blade(lerp(8, 14, p), lerp(-12, -21, p), lerp(20, 72, p), 18); } }),
};
const ALIAS = { pistol: 'pistolFire', cuts: 'cuts', haul: 'haulWait', board: 'boardAir', plunge: 'plungeAir', riposte: 'riposte', boot: 'boot' };

export function drawFreebooter(g, x, y, f, o = {}, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f || 1; T_ = time || 0;
  const mode = POSE[o.mode] ? o.mode : (ALIAS[o.mode] || 'idle'), P = POSE[mode](clamp(o.p == null ? 0 : o.p), time, o);
  if (o.ward) g.globalAlpha = 0.92;
  const B = body(P); P.draw(B);
  if (o.flash) smoke(0, -10, clamp(o.flash), 6, 1.6);
  g.globalAlpha = 1;
}
/* THE POWDER FLASH where he WAS: a ball of smoke and sparks (k 0..1 over its life) */
export function drawFlashBall(g, x, y, k, time) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = 1; T_ = time || 0;
  for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.3, r = 4 + k * 16 + (i % 3) * 3; g.globalAlpha = clamp(1 - k * 1.1); rc(Math.cos(a) * r - 3, -14 + Math.sin(a) * r * 0.7 - 3, 6 + (i % 3), 5 + (i % 2), FBP.smoke[1 + (i % 3)]); }
  for (let i = 0; i < 6; i++) { const a = i * 1.05, r = 3 + k * 20; g.globalAlpha = clamp(1 - k * 1.6); dot(Math.cos(a) * r, -14 + Math.sin(a) * r * 0.8, FBP.spark[i % 3]); }
  g.globalAlpha = 1;
}
/* HE FALLS: k 0..1 - to his knees, the hat rolling off, the pistol dropped, then lying on the deck */
export function drawDeadFreebooter(g, x, y, f, k, time) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f || 1; T_ = time || 0; k = clamp(k);
  if (k < 0.45) { const e = ease(k / 0.45); const P = { lean: lerp(0, 6, e), crouch: lerp(0, 9, e), legs: [[-4, -5, -7, 0], [6 + e * 2, -4, 9, 0]], headDy: e * 4, hat: 'off', eyes: 'open', draw: B => { ARM(B, 10, lerp(-20, -6, e)); blade(10, lerp(-20, -6, e), lerp(60, -70, e), 17); ARM(B, -3, -13, FBP.coat[0], FBP.coat[2]); } };
    const B = body(P); P.draw(B); }
  else { const e = ease((k - 0.45) / 0.55);                                                                                                    /* lying on the deck, face up, the coat spread */
    for (let i = 0; i < 26; i++) { const wd = i < 9 ? 4 : i < 20 ? 6 : 3; rc(-12 + i, -wd - 1, 1, wd, i < 9 ? FBP.leather[1] : i < 20 ? FBP.coat[i % 5 === 0 ? 1 : 2] : FBP.leather[0]); }
    rc(-3, -7, 9, 1, FBP.sash[1]); rc(-3, -6, 4, 1, FBP.sash[2]); rc(-18 - (1 - e) * 4, -7, 7, 6, FBP.skin[1]); rc(-18, -4, 6, 3, FBP.beard[1]); dot(-15, -5, FBP.hat[0]); rc(-12, -6, 3, 4, FBP.kerch[0]);
    rc(-30 + e * 8, -3, 2, 3, FBP.steel[1]); rc(-30 + e * 8, -3, 18, 1, FBP.steel[2]); rc(15, -2, 8, 2, FBP.iron[1]); rc(22, -3, 3, 2, FBP.wood[2]); }
  /* the hat rolls off: an arc across the deck */
  const hk = clamp(k * 1.6), hx = 8 + hk * 26, hy = -34 + (hk < 0.5 ? -hk * 12 : (hk - 0.5) * 2 * 34 * 0.35 + 0), rolled = hk >= 1;
  if (!rolled) { rc(hx - 5, hy, 11, 3, FBP.hat[0]); rc(hx - 3, hy - 3, 7, 4, FBP.hat[1]); } else { rc(hx - 6, -4, 12, 4, FBP.hat[0]); rc(hx - 6, -4, 12, 1, FBP.hat[2]); rc(hx - 3, -7, 7, 3, FBP.hat[1]); dot(hx + 1, -2, FBP.feather[1]); rc(hx - 9, -3, 4, 1, FBP.feather[0]); }
  g.globalAlpha = 1;
}
/* THE FIGHT'S PIECES: the pistol's aim and shot trace (the hands call these) */
export function drawAimLine(g, x0, y0, x1, y1, lock, time) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4)); for (let i = 0; i <= n; i++) { if (!lock && i % 2) continue; const u = i / n; g.globalAlpha = lock ? 0.9 : 0.5; g.fillStyle = lock ? '#ff3b3b' : '#ff9a8a'; g.fillRect(R(x0 + (x1 - x0) * u), R(y0 + (y1 - y0) * u), 1, 1); }
  if (lock) { g.fillStyle = '#ff3b3b'; g.fillRect(R(x1) - 3, R(y1), 7, 1); g.fillRect(R(x1), R(y1) - 3, 1, 7); } g.globalAlpha = 1;
}
export function drawBallTrace(g, x0, y0, x1, y1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3)); for (let i = 0; i <= n; i++) { const u = i / n; g.globalAlpha = 0.25 + 0.7 * u; g.fillStyle = i % 4 ? FBP.spark[2] : FBP.smoke[3]; g.fillRect(R(x0 + (x1 - x0) * u), R(y0 + (y1 - y0) * u), 1, 1); } g.globalAlpha = 1; }
export function drawPlungeMark(g, x, y, r, lock, time) { const w = r * 2; g.globalAlpha = lock ? 0.9 : 0.5; g.fillStyle = lock ? '#ff3b3b' : '#ff8a7a'; g.fillRect(R(x - r), y - 2, w, 2); g.fillRect(R(x - r), y - 6, 2, 4); g.fillRect(R(x + r) - 2, y - 6, 2, 4);
  if (lock) { g.fillRect(R(x) - 1, y - 12 - R(Math.sin(time * 14) * 2), 3, 7); g.fillRect(R(x) - 1, y - 3, 3, 1); } g.globalAlpha = 1; }
/* his red flag on the flagship's mast: k = 1 up ... 0 struck */
export function drawFlag(g, x, y, k, time) { g.fillStyle = '#1a140e'; g.fillRect(x, y - 80, 2, 80); const fy = R(y - 76 + (1 - k) * 56); for (let i = 0; i < 22; i++) { const w = R(Math.sin(time * 5 + i * 0.5) * 1.5); g.fillStyle = i % 5 === 4 ? '#8a1e22' : '#c43a34'; g.fillRect(x + 2 + i, fy + w, 1, 9); } if (k > 0.2) { g.fillStyle = '#e8e2d2'; g.fillRect(x + 9, fy + 3, 4, 3); g.fillRect(x + 10, fy + 6, 2, 2); } }
