// line_crew_art.js - THE LINE CREW, hand-drawn (claude/hlart, 2026-11-05): THE HOOKJACK (a human line-rigger of the high ropeway, about 26 px) and SKYHOOK (the crew's captain, MASTER OF THE HEAD STATION, about 36 px),
// replacing the greybox rectangles of src/hookjack.js drawHook and src/skyhook-hands.js drawRigger. No goblins: they are men - weathered, wrapped against the cold, in tarred wool and rope.
//   HOOKJACK  slate-blue padded jerkin over a grey wool undershirt, an ochre muffler, a wool cap with the flaps down and rime on it, snow-goggle slit, leather straps, a coil of line bandoleered over one shoulder,
//             a tool belt with a pulley block, hobnailed boots, fingerless mitts, and the iron BOAT-HOOK (a long ash shaft with a forged hook). On the line he hangs from a crank-trolley (two wheels on the cable).
//   SKYHOOK   a long tarred coat to the knee (blue-black, rime on the shoulders), a RED knitted cap, a grey beard, a coil of line over a shoulder, the cutter on his belt in phase two, the iron boat-hook on a chain.
// The poses ARE the game's modes: Hookjack frames come from hookFrame(e) (ride 0/1, tell 2, swipe 3, spin 4, fall 5, saw 6, foot/perch 7); Skyhook's come from POSE (src/skyhook-hands.js: the same table the greybox used).
// EVERY TELL IS A SHAPE DIFFERENT FROM ITS RELEASE: the Hookjack's hook is drawn BACK over his shoulder (tell) then OUT at full reach (swipe); his guard holds the hook ACROSS his body; spin flings it round with a gold ring.
// Pure drawing on a 2d context (rects only). Palette discipline: tools/hl-art-lint.mjs counts every colour.
const R = Math.round;
export const CP = {
  jerkin: ['#161e2a', '#26344a', '#3a4e6a', '#566e8c'], wool: ['#30343c', '#4a505a', '#6c7480'], muffler: ['#6a4010', '#b07a2a', '#e0b050'], cap: ['#1c2230', '#323c52', '#4e5a74'], leather: ['#120c08', '#2e2016', '#523a24', '#7a5a38'],
  skin: ['#6a4430', '#a87450', '#d09870', '#ecb890'], rope: ['#2a2014', '#4e3e24', '#8a7444', '#c0a868'], iron: ['#0e1014', '#222830', '#3c444e', '#68727e', '#9aa4b0', '#d0d8e0'], ash: ['#3a2a1a', '#6a5030', '#9a7a4c'],
  rime: ['#a8bccc', '#dce8f2', '#ffffff'], boot: ['#0c0a08', '#221a14', '#3e3024'], gold: '#ffd36b', red: '#ff6b6b', stars: '#fff0a0',
  coat: ['#0c1018', '#1a2230', '#2a384a', '#46586e'], cape: ['#5a1208', '#a8341e', '#d8523a'], beard: ['#58606a', '#8a929c', '#c0c6cc'], hookIron: ['#3a424c', '#98a2ae', '#dce4ec'], chain: ['#2a3038', '#6a7480', '#a8b2be'],
  lever: ['#3a2a1c', '#6a5038', '#a8885c'], flag: '#ff4a2a',
};
let g_, X_, Y_, F_;
const begin = (g, x, y, f) => { g_ = g; X_ = R(x); Y_ = R(y); F_ = f < 0 ? -1 : 1; };
const rc = (dx, dy, w, h, c) => { g_.fillStyle = c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - Math.max(1, R(w)), Y_ + R(dy), Math.max(1, R(w)), Math.max(1, R(h))); };
const dot = (dx, dy, c) => rc(dx, dy, 1, 1, c);
function ln(x0, y0, x1, y1, c, th = 1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) { const dx = x0 + (x1 - x0) * i / n, dy = y0 + (y1 - y0) * i / n; rc(dx, dy, th, th, c); } }
const limb = (x0, y0, x1, y1, c0, c1, th = 2) => { ln(x0, y0, x1, y1, c0, th); ln(x0, y0 - 0.5, x1, y1 - 0.5, c1, 1); };
const lerp = (a, b, k) => a + (b - a) * k;

/* the BOAT-HOOK: a long ash shaft from the hand, a forged iron head with a hook and a spike (a: shaft end [x, y] behind the hand, b: the head) */
function boatHook(hx, hy, tx, ty, o = {}) {
  ln(hx - (tx - hx) * 0.25, hy - (ty - hy) * 0.25, tx, ty, CP.ash[1], 1); ln(hx - (tx - hx) * 0.25, hy - (ty - hy) * 0.25 - 0.5, tx, ty - 0.5, CP.ash[2], 1);     /* the shaft */
  const dx = tx - hx, dy = ty - hy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  rc(tx - 1, ty - 1, 3, 3, CP.hookIron[0]); dot(tx, ty - 1, CP.hookIron[2]);                                                                                          /* the socket */
  ln(tx + ux * 2, ty + uy * 2, tx + ux * 5, ty + uy * 5, CP.hookIron[1], 1);                                                                                         /* the spike */
  dot(tx + ux * 5, ty + uy * 5, CP.hookIron[2]);
  const px = -uy, py = ux;                                                                                                                                            /* the hook: a curve off the side of the head */
  for (let i = 0; i < 4; i++) { const a = i / 3; dot(tx + px * (2 + a * 3) + ux * (1 - a * 2), ty + py * (2 + a * 3) + uy * (1 - a * 2), i === 3 ? CP.hookIron[2] : CP.hookIron[1]); }
  if (o.glint) dot(tx, ty - 2, CP.hookIron[2]);
}

/* =============================================================== THE HOOKJACK =============================================================== */
/* pose = { lean, crouch, legs: [[kx, ky, fx, fy] x2], head: [dx, dy], hand: [x, y], tip: [x, y] (the hook head), off: [x, y], grip: bool (both hands up to the trolley), eyes } in his frame (dx forward, dy down from his feet) */
const HP = {
  ride0: { legs: [[-2, -5, -3, 0], [2, -5, 4, -1]], hand: [4, -17], tip: [-5, -12], off: [-2, -17], grip: true },
  ride1: { legs: [[-1, -5, 1, -1], [2, -5, -2, 0]], hand: [4, -17], tip: [-5, -13], off: [-2, -17], grip: true, bob: 1 },
  tell0: { lean: -0.2, legs: [[-2, -5, -4, 0], [2, -5, 1, -1]], hand: [-3, -20], tip: [-9, -31], off: [5, -15], grip: true, back: true },     /* THE TELL: the hook back over the shoulder */
  tell1: { lean: -0.3, legs: [[-2, -5, -5, 0], [2, -5, 2, -1]], hand: [-4, -21], tip: [-11, -32], off: [5, -15], grip: true, back: true, shake: 1 },
  swipe: { lean: 0.3, legs: [[-2, -5, -2, 0], [3, -6, 7, -2]], hand: [9, -15], tip: [27, -14], off: [3, -14], grip: true, reach: true },         /* THE SWIPE: out at full reach */
  spin0: { lean: 0.1, legs: [[-2, -5, -3, -1], [2, -5, 4, 0]], hand: [6, -14], tip: [14, -22], off: [-4, -14], grip: true, spin: 0 },
  spin1: { lean: -0.1, legs: [[-2, -5, -3, 0], [2, -5, 4, -1]], hand: [6, -14], tip: [-8, -6], off: [-4, -14], grip: true, spin: 1 },
  fall0: { lean: 0.5, legs: [[-4, -6, -8, -2], [3, -5, 5, -8]], hand: [-7, -24], tip: [-12, -28], off: [6, -24], free: true },
  fall1: { lean: -0.5, legs: [[-3, -7, -6, -10], [3, -4, 7, -1]], hand: [8, -23], tip: [13, -27], off: [-6, -25], free: true },
  saw0: { crouch: 2, lean: 0.25, legs: [[-2, -5, -4, 0], [3, -5, 5, 0]], hand: [8, -21], tip: [11, -29], off: [6, -16], saw: 0, grip: true },
  saw1: { crouch: 2, lean: 0.3, legs: [[-2, -5, -4, 0], [3, -5, 5, 0]], hand: [8, -21], tip: [11, -29], off: [6, -16], saw: 1, grip: true },
  foot0: { legs: [[-1, -5, -4, 0], [2, -5, 3, -2]], hand: [5, -14], tip: [-2, -22], off: [-3, -13], guard: true },
  foot1: { legs: [[0, -5, 0, 0], [2, -5, 2, 0]], hand: [5, -14], tip: [-1, -23], off: [-3, -13], guard: true },
  foot2: { legs: [[-1, -5, 3, -2], [2, -5, -3, 0]], hand: [5, -14], tip: [-2, -22], off: [-3, -13], guard: true },
  foot3: { legs: [[0, -5, 0, 0], [2, -5, 2, 0]], hand: [5, -14], tip: [-1, -23], off: [-3, -13], guard: true, bob: 1 },
};
export const HOOKJACK_POSES = Object.keys(HP);
export function hookjackPose(e, time) {
  const m = e.mode, a = e.anim || 0, t = time || 0, k = Math.floor(t * 8) & 1;
  if (m === 'tell' || m === 'footTell') return 'tell' + k;
  if (m === 'swipe' || m === 'footSwipe') return 'swipe';
  if (m === 'spin' || m === 'footSpin') return 'spin' + (Math.floor(t * 12) & 1);
  if (m === 'fall') return 'fall' + (Math.floor(t * 9) & 1);
  if (m === 'saw') return 'saw' + (Math.floor(t * 14) & 1);
  if (m === 'foot' || m === 'perch' || m === 'wait') return m === 'foot' && (e.vx || Math.abs(e.walk || 0) > 0 || a) ? 'foot' + (Math.floor((a || t) * 5) & 3) : 'foot' + (m === 'foot' ? (Math.floor(t * 2) & 1 ? 1 : 3) : 1);
  return 'ride' + (Math.floor((a || t) * 3) & 1);
}
function hookjackBody(P, flash, time) {
  const cr = P.crouch || 0, lean = P.lean || 0, hipY = -10 + cr, shY = -19 + cr, bob = P.bob || 0, jit = P.shake ? ((Math.floor(time * 30) & 1) ? 1 : -1) * 0.6 : 0;
  const J = flash ? ['#ffffff', '#ffffff', '#ffffff', '#ffffff'] : CP.jerkin;
  const hx = lean * 3, hdY = -26 + cr + bob + (P.head ? P.head[1] : 0);
  /* legs: boots with hobnailed soles */
  P.legs.forEach((lg, i) => { const [kx, ky, fx, fy] = lg, hx0 = i ? 2 : -1; limb(hx0, hipY, kx, ky + cr * 0.4, CP.wool[0], CP.wool[1], 2); limb(kx, ky + cr * 0.4, fx, fy, CP.boot[1], CP.boot[2], 2); rc(fx - 1, fy - 2, 5, 3, CP.boot[0]); rc(fx - 1, fy - 2, 4, 1, CP.boot[2]); dot(fx + 3, fy, CP.iron[3]); });
  /* the jerkin: padded rows, a belt, the tool belt's pulley block, a strap across */
  for (let y = shY; y < hipY + 3; y++) { const w = 9 + ((y - shY) > 6 ? 1 : 0), sh = lean * (1 - (y - shY) / 12) * 2; rc(-w / 2 + sh, y, w, 1, J[(y - shY) % 4 === 0 ? 1 : 2]); rc(-w / 2 + sh, y, 2, 1, J[3]); rc(w / 2 - 2 + sh, y, 2, 1, J[0]); }
  rc(-4 + lean, shY, 9, 2, J[3]); rc(-5 + lean, hipY - 1, 11, 2, CP.leather[1]); rc(-1 + lean, hipY - 1, 3, 2, CP.iron[3]); dot(lean, hipY - 1, CP.iron[5]);   /* shoulders, belt, buckle */
  ln(-3 + lean, shY + 1, 3 + lean, hipY - 1, CP.leather[2], 1);                                                                                                   /* the strap across */
  rc(-6 + lean, hipY, 3, 4, CP.iron[2]); rc(-6 + lean, hipY, 3, 1, CP.iron[4]); dot(-5 + lean, hipY + 2, CP.iron[0]);                                              /* the pulley block on the belt */
  for (let k = 0; k < 3; k++) rc(-4 + lean + k, shY + 3 + k * 2, 8 - k, 1, CP.rope[1 + (k & 1)]); rc(-4 + lean, shY + 2, 1, 6, CP.rope[2]);                       /* the coil of line bandoleered over the shoulder */
  /* head: muffler, face, goggle slit, the cap with its flaps and rime */
  rc(hx - 3, hdY + 6, 7, 3, CP.muffler[1]); rc(hx - 3, hdY + 6, 7, 1, CP.muffler[2]); rc(hx - 2, hdY + 8, 4, 1, CP.muffler[0]);
  rc(hx - 2, hdY + 1, 6, 6, CP.skin[1]); rc(hx - 2, hdY + 1, 2, 6, CP.skin[2]); rc(hx + 3, hdY + 2, 1, 4, CP.skin[0]);
  rc(hx + 1, hdY + 2, 4, 2, CP.iron[0]); rc(hx + 1, hdY + 2, 4, 1, CP.iron[2]); dot(hx + 3, hdY + 3, P.eyes === 'shut' ? CP.iron[1] : CP.rime[1]);                      /* the snow-goggle slit and a pale eye behind it */
  rc(hx - 3, hdY - 2, 8, 3, CP.cap[1]); rc(hx - 3, hdY - 3, 7, 1, CP.cap[2]); rc(hx - 3, hdY + 1, 2, 5, CP.cap[0]); rc(hx - 4, hdY + 1, 1, 3, CP.cap[1]);        /* the cap, its flap down over the ear */
  rc(hx - 2, hdY - 3, 3, 1, CP.rime[2]); dot(hx + 2, hdY - 2, CP.rime[1]); dot(hx - 4, hdY, CP.rime[0]);
  /* the arms */
  const ox = P.off[0] + jit, oy = P.off[1] + cr, hx2 = P.hand[0] + jit, hy2 = P.hand[1] + cr;
  limb(-2 + lean, shY + 2, ox, oy, J[1], J[3], 2); rc(ox - 1, oy - 1, 3, 3, CP.leather[2]);
  if (P.grip) { rc(ox - 1, oy - 1, 3, 3, CP.leather[2]); }
  limb(2 + lean, shY + 2, hx2, hy2, J[1], J[3], 2); rc(hx2 - 1, hy2 - 1, 3, 3, CP.leather[3]); dot(hx2, hy2 - 1, CP.skin[2]);
  boatHook(hx2, hy2, P.tip[0] + jit, P.tip[1] + cr, { glint: true });
  return { hx: hx2, hy: hy2 };
}
/* the trolley he hangs from: two wheels on the cable, a brass crank, a hanging grip */
function trolley(x, y, ph) { rc(x - 6, y, 13, 2, CP.iron[2]); rc(x - 6, y, 13, 1, CP.iron[4]); rc(x - 5, y - 3, 4, 3, CP.iron[3]); rc(x + 2, y - 3, 4, 3, CP.iron[3]); dot(x - 4, y - 2, CP.iron[5]); dot(x + 3, y - 2, CP.iron[5]);
  rc(x - 1, y + 2, 3, 3, CP.iron[1]); const cr = (ph & 1) ? 1 : -1; rc(x + 5, y - 2 + cr, 3, 1, CP.iron[4]); dot(x + 7, y - 2 + cr, CP.muffler[2]); }
const lineSag = (fr) => fr;
/* e: the game's foe (x, y = his feet; face; mode; anim; flash; sawT; modeT) */
export function drawHookjack(g, e, cx, cy, time) {
  const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1, name = hookjackPose(e, time), P = HP[name], hang = !!P.grip && !P.guard && !P.saw && !P.free, flash = e.flash > 0;
  begin(g, x, y, f);
  if (hang) { trolley(0, -30 - (P.bob || 0), Math.floor(time * 6)); ln(1, -27, 2, -22, CP.rope[1], 1); }                                                         /* the crank-trolley on the rope, and its strap down to his hands */
  if (hang) { ln(P.off[0], P.off[1] - 1, 0, -28, CP.iron[3], 1); }
  const h = hookjackBody(P, flash, time);
  if (P.saw !== undefined) {                                                                                                                                            /* THE SAW: a pull-saw blade at the cable's pylon, sparks of rope */
    const k = P.saw; ln(h.hx + 2, h.hy - 3, h.hx + 9, h.hy - 3 + k, CP.iron[4], 1); ln(h.hx + 2, h.hy - 2, h.hx + 9, h.hy - 2 + k, CP.iron[2], 1); for (let i = 0; i < 4; i++) dot(h.hx + 3 + i * 2, h.hy - 3 + k + ((i + k) & 1), CP.iron[5]);
    dot(h.hx + 10, h.hy - 5 + k, CP.rope[3]); dot(h.hx + 12, h.hy - 4 - k, CP.rope[2]); }
  if (P.spin !== undefined) { const a = time * 14; for (let i = 0; i < 6; i++) { const aa = a + i * 1.05; dot(Math.cos(aa) * 12 + 5, Math.sin(aa) * 12 - 14, i === 0 ? CP.hookIron[2] : CP.hookIron[0]); } }   /* the hook flung round: an orbit of fragments */
  if (P.reach) { for (let i = 0; i < 5; i++) { g.globalAlpha = 0.5 - i * 0.09; rc(9 + i * 4, -16 + i, 5, 1, CP.rime[1]); } g.globalAlpha = 1; }                    /* the swipe's streak */
  if (e.mode === 'saw') { const k = Math.max(0, e.sawT) / 2.2, bx = R(e.x - cx) - 10, by = R(e.y - cy) - 44; g.fillStyle = CP.iron[1]; g.fillRect(bx, by, 21, 3); g.fillStyle = CP.red; g.fillRect(bx, by, Math.round(21 * (1 - k)), 3); g.fillStyle = CP.iron[4]; g.fillRect(bx, by, 21, 1); }   /* the fray bar */
  if (name.startsWith('spin') && (e.mode === 'spin' || e.mode === 'footSpin')) { const a = 13; g.fillStyle = CP.gold; for (let i = 0; i < 16; i++) { const aa = i / 16 * Math.PI * 2; g.fillRect(x + R(Math.cos(aa) * a), y - 14 + R(Math.sin(aa) * a), 1, 1); } }   /* PARRIED: the gold ring: one blow drops him */
}

/* =============================================================== SKYHOOK =============================================================== */
/* p = the POSE entry of src/skyhook-hands.js (crouch, lean, hand, off, hook, legs, grip, coil, rope, butt, cutter, bracket, stars, look); drawn at his feet, facing right, like the greybox */
export function drawRiggerArt(g, p, flash, time, ph, x, y, f) {
  begin(g, x, y, f);
  const cr = p.crouch || 0, lean = p.lean || 0, K = flash ? ['#ffffff', '#ffffff', '#ffffff', '#ffffff'] : CP.coat, top = -34 + cr, sh = lean * 4;
  if (p.legs === 'down') {                                                                                                                                              /* DOWN: on his back across the rock */
    rc(-16, -9, 32, 8, K[2]); rc(-16, -9, 32, 2, K[3]); rc(-16, -2, 32, 2, K[0]); rc(13, -12, 8, 8, CP.skin[1]); rc(13, -12, 3, 8, CP.skin[2]); rc(13, -14, 8, 3, CP.cape[1]); rc(14, -15, 6, 1, CP.cape[2]); rc(17, -7, 5, 3, CP.beard[1]);
    rc(-23, -6, 8, 4, CP.boot[1]); rc(-23, -6, 8, 1, CP.boot[2]); rc(-14, -5, 26, 1, CP.leather[1]);
    ln(4, -7, p.hand[0], p.hand[1], K[1], 2); if (p.hook) boatHook(p.hand[0], p.hand[1], p.hook[0], p.hook[1]);
    if (p.bracket) { rc(-5, -15, 7, 4, CP.iron[3]); rc(-5, -15, 7, 1, CP.iron[5]); dot(0, -14, CP.iron[0]); }
    if (p.stars) for (let i = 0; i < 3; i++) { const a = time * 3 + i * 2.1; dot(16 + Math.cos(a) * 10, -20 + Math.sin(a) * 3, CP.stars); }
    return; }
  /* legs */
  const hip = top + 24, lg = (kx, ky, fx, fy, i) => { limb(i ? 3 : -3, hip, kx, ky + cr * 0.4, K[0], K[1], 3); rc(fx - 2, fy - 3, 7, 4, CP.boot[0]); rc(fx - 2, fy - 3, 6, 1, CP.boot[2]); dot(fx + 4, fy, CP.iron[3]); };
  if (p.legs === 'hang') { const s = Math.round(Math.sin(time * 6) * 3); lg(-4 + s, -8, -4 + s, 0, 0); lg(4 + s, -8, 4 + s, 0, 1); }
  else if (p.legs === 'swing') { lg(8, -6, 11, -3, 0); lg(12, -5, 15, 0, 1); }
  else if (p.legs === 'kneel') { lg(-8, -3, -9, 0, 0); lg(8, -10, 9, -6, 1); rc(7, -3, 6, 3, CP.boot[1]); }
  else { lg(-4, -9, -5, 0, 0); lg(4, -9, 5, 0, 1); }
  /* THE LONG TARRED COAT: to the knee, rime on the shoulders, a belt, a coil of line, buttons of horn */
  for (let yy = top + 6; yy < top + 28; yy++) { const k = (yy - top - 6) / 22, w = 12 + k * 6, s0 = sh * (1 - k); rc(-w / 2 + s0, yy, w, 1, K[(yy & 3) === 0 ? 1 : 2]); rc(-w / 2 + s0, yy, 3, 1, K[3]); rc(w / 2 - 2 + s0, yy, 2, 1, K[0]); }
  rc(-1 + sh * 0.4, top + 8, 1, 18, K[0]); for (let k = 0; k < 4; k++) dot(1 + sh * 0.4, top + 10 + k * 4, CP.beard[2]);
  rc(-7 + sh * 0.5, top + 6, 14, 3, K[3]); rc(-7 + sh * 0.5, top + 6, 14, 1, K[3]); rc(-6 + sh * 0.5, top + 6, 3, 1, CP.rime[1]); dot(2 + sh * 0.5, top + 6, CP.rime[0]); dot(-1 + sh * 0.5, top + 5, CP.rime[2]);   /* shoulders and the rime on them */
  rc(-9 + sh * 0.3, top + 15, 18, 2, CP.leather[1]); rc(-1 + sh * 0.3, top + 15, 4, 2, CP.iron[3]); dot(1 + sh * 0.3, top + 15, CP.iron[5]);               /* the belt */
  if (ph > 1) { rc(4 + sh * 0.3, top + 16, 5, 6, CP.iron[2]); rc(4 + sh * 0.3, top + 16, 5, 1, CP.iron[4]); rc(5 + sh * 0.3, top + 14, 1, 3, CP.hookIron[1]); rc(7 + sh * 0.3, top + 14, 1, 3, CP.hookIron[1]); }   /* the cutter's jaws on his belt (phase two) */
  for (let k = 0; k < 4; k++) rc(-8 + sh * 0.4 + k, top + 8 + k * 2, 10 - k, 1, CP.rope[1 + (k & 1)]); rc(-8 + sh * 0.4, top + 7, 1, 9, CP.rope[2]);              /* the coil of line over the shoulder */
  /* head: the red knitted cap, grey beard, a weathered face, a hard eye */
  const hdX = lean * 5;
  rc(hdX - 4, top - 1, 9, 8, CP.skin[1]); rc(hdX - 4, top - 1, 3, 8, CP.skin[2]); rc(hdX + 4, top, 1, 6, CP.skin[0]);
  rc(hdX - 4, top + 4, 9, 5, CP.beard[1]); rc(hdX - 4, top + 4, 4, 5, CP.beard[2]); rc(hdX - 3, top + 8, 7, 1, CP.beard[0]); rc(hdX + 1, top + 4, 4, 1, CP.beard[0]);
  rc(hdX + 1, top + 1, 4, 2, CP.iron[0]); dot(hdX + 3, top + 1, p.look ? CP.rime[2] : CP.rime[1]); dot(hdX + 3, top + 2, CP.iron[1]);                                      /* the brow and the eye */
  rc(hdX - 5, top - 5, 11, 5, CP.cape[1]); rc(hdX - 5, top - 5, 11, 2, CP.cape[2]); rc(hdX - 5, top - 1, 11, 1, CP.cape[0]); rc(hdX - 3, top - 7, 7, 2, CP.cape[1]); rc(hdX - 1, top - 8, 3, 1, CP.cape[2]); dot(hdX, top - 3, CP.cape[0]); dot(hdX + 3, top - 4, CP.cape[0]); rc(hdX - 6, top - 3, 1, 3, CP.cape[0]);   /* the cap: knit rows, a bobble, a turned brim */
  /* arms + the boat-hook and its chain */
  limb(-4 + sh, top + 9, p.off[0], p.off[1] + cr, K[1], K[3], 3); rc(p.off[0] - 1, p.off[1] + cr - 1, 3, 3, CP.leather[2]);
  limb(4 + sh, top + 9, p.hand[0], p.hand[1] + cr, K[1], K[3], 3); rc(p.hand[0] - 1, p.hand[1] + cr - 1, 3, 3, CP.leather[3]); dot(p.hand[0], p.hand[1] + cr - 1, CP.skin[2]);
  if (p.hook) { const hx = p.hook[0], hy = p.hook[1] + cr;
    if (p.butt) { ln(p.hand[0], p.hand[1] + cr, hx, hy, CP.ash[1], 1); rc(hx - 3, hy - 2, 5, 5, CP.iron[2]); rc(hx - 3, hy - 2, 5, 1, CP.iron[4]); }                                     /* the hook reversed: its butt-cap forward */
    else { boatHook(p.hand[0], p.hand[1] + cr, hx, hy, { glint: true }); for (let q = 0; q < 5; q++) dot(p.hand[0] + (hx - p.hand[0]) * 0.2 - 2, p.hand[1] + cr + 3 + q, q % 2 ? CP.chain[1] : CP.chain[2]); } }   /* and the chain hanging off the shaft */
  if (p.coil) { for (let a = 0; a < 6.3; a += 0.8) dot(p.off[0] + Math.cos(a) * 4, p.off[1] + cr + Math.sin(a) * 4, CP.chain[1 + ((a * 2) | 0) % 2]); }                              /* the chain coiled in his fist */
  if (p.cutter === 'jaw') { rc(p.hand[0] + 1, p.hand[1] + cr - 5, 7, 3, CP.iron[3]); rc(p.hand[0] + 1, p.hand[1] + cr + 1, 7, 3, CP.iron[3]); rc(p.hand[0] + 1, p.hand[1] + cr - 5, 7, 1, CP.iron[5]); }
  if (p.cutter === 'up') { rc(p.hand[0] - 2, p.hand[1] + cr - 9, 5, 9, CP.iron[3]); rc(p.hand[0] - 3, p.hand[1] + cr - 11, 7, 3, CP.hookIron[1]); rc(p.hand[0] - 2, p.hand[1] + cr - 9, 1, 9, CP.iron[5]); }
  if (p.bracket) { rc(p.hand[0] - 3, p.hand[1] + cr - 7, 6, 4, CP.iron[3]); rc(p.hand[0] - 3, p.hand[1] + cr - 7, 6, 1, CP.iron[5]); dot(p.hand[0], p.hand[1] + cr - 5, CP.iron[0]); }
  if (p.stars) for (let i = 0; i < 3; i++) { const a = time * 4 + i * 2.1; dot(Math.cos(a) * 9, top - 10 + Math.sin(a) * 2, CP.stars); }
}
/* the TROLLEY he rides his high line on (over his head) */
export function drawSkyTrolley(g, x, y, f, time, tilt = 0) {
  begin(g, x, y, f);
  rc(-9, 0, 18, 4, CP.iron[2]); rc(-9, 0, 18, 1, CP.iron[4]); rc(-9, 3, 18, 1, CP.iron[0]); rc(-8, -4, 5, 4, CP.iron[3]); rc(3, -4, 5, 4, CP.iron[3]); dot(-6, -3, CP.iron[5]); dot(5, -3, CP.iron[5]);      /* frame, two wheels on the cable */
  rc(-2, 4, 4, 4, CP.iron[1]); rc(-1, 8, 2, 4, CP.hookIron[0]);                                                                                                                                       /* the hanger down to his hands */
  const k = Math.floor(time * 10) & 1; rc(8, -2 + k, 5, 1, CP.iron[4]); dot(12, -2 + k, CP.muffler[2]);                                                                                                /* the crank */
}
/* the HOOK in flight (head at x, y; the chain is drawn by the hands from the thrower) */
export function drawSkyHook(g, x, y, f, time) {
  begin(g, x, y, f);
  rc(-2, -4, 5, 8, CP.hookIron[1]); rc(-2, -4, 2, 8, CP.hookIron[2]); rc(-2, 3, 5, 1, CP.hookIron[0]); rc(2, -5, 4, 2, CP.hookIron[1]); rc(5, -4, 2, 5, CP.hookIron[1]); dot(6, 1, CP.hookIron[2]); rc(0, -7, 2, 3, CP.chain[1]);
  const t = Math.floor(time * 20) & 1; dot(-3, t ? -5 : 4, CP.rime[1]);
}
export function chainLine(g, x0, y0, x1, y1, time) { const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3)); for (let i = 0; i <= n; i++) { const t = i / n; g.fillStyle = (i & 1) ? CP.chain[1] : CP.chain[2]; g.fillRect(R(lerp(x0, x1, t)), R(lerp(y0, y1, t) + Math.sin(t * Math.PI) * 2), 2, 2); } }
/* the red rag tied on the high line where a lever starts to slip him (a marker) */
export function drawRag(g, x, y, time) { g.fillStyle = CP.iron[2]; g.fillRect(x - 1, y - 1, 3, 3); const w = Math.round(Math.sin(time * 5 + x) * 1); for (let i = 0; i < 6; i++) { g.fillStyle = i > 3 ? CP.cape[1] : CP.cape[2]; g.fillRect(x - 1 + (i > 2 ? w : 0), y + 2 + i, 2 + (i < 3 ? 1 : 0), 1); } g.fillStyle = CP.cape[0]; g.fillRect(x, y + 8, 1, 1); }
/* a TENSION LEVER: a stone-footed iron frame, a wound drum, a ratchet pawl, a lever in three states (rest: leaning back; struck: thrown forward; hot: gold-banded) */
export function drawLeverArt(g, x, y, swing, hot, now, time) {
  g.fillStyle = CP.iron[1]; g.fillRect(x - 9, y - 4, 18, 4); g.fillStyle = CP.iron[3]; g.fillRect(x - 9, y - 4, 18, 1);                                                                             /* the stone-bolted bed */
  g.fillStyle = CP.iron[2]; g.fillRect(x - 7, y - 13, 14, 9); g.fillStyle = CP.iron[4]; g.fillRect(x - 7, y - 13, 14, 1); g.fillStyle = CP.iron[0]; g.fillRect(x - 7, y - 5, 14, 1);                       /* the drum housing */
  for (let k = 0; k < 4; k++) { g.fillStyle = CP.rope[1 + (k & 1)]; g.fillRect(x - 6 + k * 3, y - 12, 2, 7); } g.fillStyle = CP.rope[3]; g.fillRect(x - 6, y - 12, 12, 1);                                    /* the line wound on the drum */
  g.fillStyle = CP.iron[5]; g.fillRect(x - 2, y - 16, 4, 3); g.fillStyle = CP.iron[0]; g.fillRect(x - 1, y - 15, 2, 1); g.fillRect(x + 4, y - 15, 1, 2);                                                 /* the pawl and its tooth */
  const a = swing > 0 ? 0.9 : -0.5, lx = x + Math.round(Math.sin(a) * 15), ly = y - 14 - Math.round(Math.cos(a) * 15);
  const n = 16; for (let i = 0; i <= n; i++) { const t = i / n; g.fillStyle = CP.lever[1 + (i & 1)]; g.fillRect(R(lerp(x, lx, t)), R(lerp(y - 14, ly, t)), 3, 3); }
  g.fillStyle = hot ? CP.gold : CP.iron[4]; g.fillRect(lx - 2, ly - 2, 5, 5); g.fillStyle = CP.iron[0]; g.fillRect(lx, ly, 1, 1);                                                               /* the grip */
  if (hot) { g.globalAlpha = now ? 0.6 + 0.4 * Math.sin(time * 24) : 0.45; g.fillStyle = now ? '#fff3a0' : '#ffb347'; g.fillRect(x - 10, y - 28, 20, 1); g.fillRect(x - 10, y - 1, 20, 1); g.fillRect(x - 10, y - 28, 1, 28); g.fillRect(x + 9, y - 28, 1, 28); g.globalAlpha = 1; }
}
