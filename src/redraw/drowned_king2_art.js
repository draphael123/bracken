// drowned_king2_art.js - THE DROWNED KING 2, THE HAND-DRAWN POSE SET (claude/k2art, 2026-11-12). The greybox of claude/keepfloods mapped his moves onto the live king's swim sheet (src/king_swim.js) and drew the
// trident as a line; this draws HIM: one pose per move mode, a WINDUP pose and a RELEASE pose for every told move (B16), every pose readable as a shape, with the trident and the cursed model on him.
// Pure drawing, fillRect only (so tools/k2art-sheet.mjs rasterises it in node with no browser). g = a 2d context, (x, y) = his feet on screen, f = facing (+1 right). o = the state (see kingState).
// BODY: a green plate body laid along an axis (a = 0 swimming forward, -90 standing) with a mail-and-weed cape trailing, a gold belt, a narrow grey face with two lamps, a gold crown, a weed beard, the TRIDENT.
// THE POSES (K2_POSE_SET; the keys are his move modes, src/drowned-king2.js K2_POSES names them in words):
//   swim / walk / beached   the stroke (arms and legs beat, the trident carried forward-up) / upright on the floor / slumped on the floor (beached: heavy, head low)
//   thrustTell (!)          coiled: the trident drawn back to the hip, point on you, the off-hand out as a sight  -> thrust: arm LOCKED straight, body stretched along the line, speed lines
//   recover / recoil        trident dropped low, head down, panting  /  reeled back off a turned blow, the trident flung up
//   sweepTell (!!)          crouched, the trident low and wound back behind his heel  -> sweep: the shaft flat and low across the floor, a white arc
//   hurlTell (!!)           the trident cocked back over the shoulder, the off-hand pointing the line, a red glint on the tines  -> hurl: the throwing arm full out, the hand open and EMPTY
//   bare / recallTell (!) / recall   open-handed and reaching / the open hand out to the weapon, a gold ring on the palm / the fist closing and hauling
//   decreeTell (!!)         the trident high over the crown in both hands, gold rays growing  -> decree: the butt driven down, a gold ring along the floor
//   pinned / heave          bent double, both palms up against the bars, crown askew, stars  /  the gate lifted on his back, straining
//   curse                   arched back, arms flung, mouth open, the crown slipping, the flesh greying, the eyes going green (k = the curse's progress)
//   graspTell (!!)          bowed, both hands pointing at the floor, green  -> grasp: both fists driven down   |   leechTell (!) head thrown back, the jaw open, a green throat -> leech: the head thrust out
//   prongTell (!!)          the trident up in both hands, three ghost prongs fanning off its head
//   shellTell               curled, arms crossed, coral and bone climbing him (k)  -> shell: coral on the shoulders, a bone mask, a ridge down the chest  -> shellOpen: the shell split, gold, shards
//   open                    OPEN: on one knee gasping, the trident dropped   |   hurt: thrown back off a blow   |   sleep / wake: slumped on his trident, then the lamps lit   |   dead (drawDeadKing2): to his knees, the crown rolls, the trident falls
// THE CURSED MODEL (e.cursed, from the curse on): grey-green flesh and plate, green lamps, the crown slipped with a green flame, a ragged cape, the trident's tines ghost-green.
// Palette discipline: his own ramps below (the live king's colours, lifted to read under the throne room's water) + the keep's verdigris iron; tools/k2-art-lint.mjs checks every colour.
const R = Math.round, D2R = Math.PI / 180;
export const K2P = {
  plate: ['#17332c', '#2a5e4e', '#3f8f7d', '#5e9c86', '#8cc4ae'], gold: ['#5a4412', '#a07e22', '#e0bc44', '#fff0a8'], iron: ['#12161c', '#3a4452', '#6e7e8e', '#aab2bc', '#d4dce4'],
  skin: ['#4e5e5a', '#6e7e7a', '#a8b8b2', '#d0dcd6'], weed: ['#2a5a40', '#3e8a60', '#8fd160'], beard: ['#8aa89e', '#bcd0c8'], mail: ['#2c3440', '#4e5664', '#7a8494', '#aab2bc'],
  lamp: ['#7ff0e0', '#dffffa'], dim: '#3a6a64', mouth: '#12201e', curse: { skin: ['#3a4a40', '#566a5c', '#7e9484', '#a6bcaa'], plate: ['#101e1a', '#1e3c34', '#2e5a4c', '#44705e', '#6a9884'], eyes: '#8fd160', flame: ['#2a5a30', '#8fd160', '#d4f4a0'] },
  coral: ['#4a1c22', '#7a3438', '#b45a52', '#e08a78'], bone: ['#6a6254', '#a89c84', '#d8ccb0', '#f2ead4'], red: '#ff6b6b', hot: '#ffd36b', white: '#f6fbfc', spark: '#fff0a8',
};
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
const hx = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mixC = (c, d, k) => { const A = hx(c), B = hx(d), m = i => R(A[i] + (B[i] - A[i]) * k); return '#' + [m(0), m(1), m(2)].map(v => v.toString(16).padStart(2, '0')).join(''); };

/* ---------- the pose table: what each mode looks like. angles in degrees on SCREEN (0 = forward, 90 = down, -90 = up); a/aD = the body's axis wet / dry (0 swims forward, -90 stands); ---------- */
/* cy = the body's centre above his feet (wet / dry); arms = [upper, lower] angles; tri = { by: 'F'|'B', ang | 'aim', grip } or null; aim = follow the told line; k = the move's progress 0..1 */
const AIM = 'aim', TIP = 'tr';
export const K2_POSE_SET = {
  idle:       { a: 0, aD: -88, armF: [30, 55], armB: [10, 40], tri: { by: 'B', ang: -38, grip: 10 }, cape: 1, legs: 1 },
  sleep:      { a: 30, aD: -100, cyD: 16, armF: [100, 90], armB: [95, 85], tri: { by: 'F', ang: -90, grip: 6, plant: true }, head: [-1, 4], eyes: 'dim', cape: 0.7, legs: 0, still: true },
  wake:       { a: -10, aD: -92, armF: [60, 80], armB: [40, 70], tri: { by: 'F', ang: -90, grip: 6, plant: true }, eyes: 'flare', cape: 0.8, legs: 0.3 },
  beached:    { aD: -80, a: 0, cyD: 17, armF: [75, 90], armB: [65, 85], tri: { by: 'B', ang: 80, grip: 16, drag: true }, head: [-2, 3], cape: 0.8, legs: 0.2, still: true },
  open:       { a: 38, aD: -50, cy: 18, cyD: 11, armF: [100, 120], armB: [80, 125], tri: null, drop: true, head: [-1, 5], eyes: 'dim', mouth: true, cape: 0.8, legs: 0, stars: true, still: true },
  hurt:       { a: -28, aD: -108, armF: [-70, -30], armB: [150, 110], tri: { by: 'F', ang: -80, grip: 8 }, mouth: true, eyes: 'flare', cape: 1.1, legs: 1.5 },
  thrustTell: { a: -10, aD: -96, armF: [168, 112], armB: [-6, -2], tri: { by: 'F', ang: AIM, grip: 3 }, eyes: 'flare', cape: 0.62, legs: 1.2, glint: true, sight: true },
  thrust:     { a: 14, aD: -76, armF: [AIM, AIM], armB: [168, 120], tri: { by: 'F', ang: AIM, grip: 14 }, eyes: 'flare', cape: 1.25, legs: 0.3, lunge: true },
  recover:    { a: 6, aD: -84, armF: [70, 82], armB: [60, 76], tri: { by: 'F', ang: 62, grip: 8 }, head: [0, 3], mouth: true, cape: 0.9, legs: 0.5 },
  recoil:     { a: -40, aD: -112, armF: [-64, -18], armB: [156, 104], tri: { by: 'F', ang: -72, grip: 6 }, mouth: true, eyes: 'flare', cape: 1.2, legs: 1.6, sparks: true },
  sweepTell:  { a: 20, aD: -66, cy: 15, cyD: 12, armF: [128, 140], armB: [-30, 10], tri: { by: 'F', ang: 164, grip: 6 }, eyes: 'flare', cape: 0.7, legs: 0.6, glint: true },
  sweep:      { a: -6, aD: -92, armF: [38, 8], armB: [190, 150], tri: { by: 'F', ang: 4, grip: 10 }, eyes: 'flare', cape: 1.2, legs: 0.3, arc: true },
  hurlTell:   { a: -30, aD: -104, armF: [-132, -26], armB: [AIM, AIM], tri: { by: 'F', ang: -18, grip: 11 }, eyes: 'flare', cape: 0.7, legs: 1, glint: true, red: true },
  hurl:       { a: 16, aD: -72, armF: [AIM, AIM], armB: [170, 140], tri: null, open: 'F', eyes: 'flare', cape: 1.25, legs: 0.2, lunge: true },
  bare:       { a: 4, aD: -80, armF: [24, 34], armB: [40, 60], tri: null, open: 'both', head: [1, 2], cape: 0.95, legs: 1 },
  recallTell: { a: -6, aD: -90, armF: [TIP, TIP], armB: [100, 110], tri: null, open: 'F', eyes: 'flare', cape: 0.9, legs: 0.7, palm: true },
  recall:     { a: -22, aD: -102, armF: [-10, 160], armB: [120, 100], tri: null, fist: 'F', eyes: 'flare', cape: 1.2, legs: 1, pull: true },
  decreeTell: { a: -62, aD: -94, armF: [-82, -100], armB: [-98, -80], tri: { by: 'F', ang: -90, grip: 16 }, eyes: 'flare', cape: 1, legs: 0.5, rays: true },
  decree:     { a: -44, aD: -82, cyD: 17, cy: 17, armF: [66, 84], armB: [74, 88], tri: { by: 'F', ang: -90, grip: 30 }, eyes: 'flare', cape: 1.3, legs: 0.2, ring: true },
  heave:      { a: 70, aD: -30, cy: 15, cyD: 13, armF: [-76, -92], armB: [-66, -84], tri: null, drop: true, head: [0, 6], mouth: true, eyes: 'flare', cape: 0.6, legs: 0.3, strain: true },
  pinned:     { a: 85, aD: -20, cy: 13, cyD: 11, armF: [-62, -86], armB: [-52, -78], tri: null, drop: true, head: [0, 7], eyes: 'dim', crown: 3, cape: 0.5, legs: 0, stars: true, still: true },
  curse:      { a: -52, aD: -118, armF: [-132, -168], armB: [140, 176], tri: null, drop: true, head: [-4, -1], mouth: true, eyes: 'curse', cape: 1.3, legs: 1.2, cursing: true },
  graspTell:  { a: 28, aD: -62, armF: [92, 96], armB: [86, 92], tri: { by: 'B', ang: 150, grip: 10 }, head: [0, 4], eyes: 'curse', cape: 0.8, legs: 0.5, greenHands: true },
  grasp:      { a: 44, aD: -50, cy: 15, cyD: 13, armF: [96, 100], armB: [94, 98], tri: { by: 'B', ang: 150, grip: 10 }, head: [1, 5], eyes: 'curse', cape: 1.1, legs: 0.3, greenHands: true, fistDown: true },
  leechTell:  { a: -34, aD: -108, armF: [150, 120], armB: [160, 130], tri: { by: 'B', ang: 120, grip: 10 }, head: [-3, -2], mouth: 'wide', eyes: 'curse', cape: 0.9, legs: 0.8, throat: true },
  leech:      { a: 8, aD: -78, armF: [60, 70], armB: [40, 70], tri: { by: 'B', ang: 120, grip: 10 }, head: [5, 1], mouth: 'wide', eyes: 'curse', cape: 1.2, legs: 0.4, throat: true },
  prongTell:  { a: -16, aD: -90, armF: [-50, -40], armB: [-44, -36], tri: { by: 'F', ang: -44, grip: 14, split: true }, eyes: 'curse', cape: 0.9, legs: 0.7, ghost: true },
  shellTell:  { a: 24, aD: -64, cy: 17, cyD: 14, armF: [-20, 160], armB: [-30, 150], tri: null, head: [-1, 3], eyes: 'flare', cape: 0.6, legs: 0.2, growShell: true },
};
/* the BODY of each pose (claude/sea4): [bow, sq, curl, tlen, rv] - bow = chest+head bent off the hips (deg, + forward), sq = chest length (coil < 1 < stretch), curl = tail curl (- under the belly, + arched over the back), tlen = tail length, rv = chest depth */
export const K2_BODY = {
  idle: [0, 1, -8, 1, 1], sleep: [20, 0.95, -60, 0.9, 1], wake: [-6, 1, -20, 1, 1], beached: [18, 1, -40, 0.9, 1], open: [40, 0.9, -80, 0.8, 1.05], hurt: [-34, 1.05, 40, 1.1, 1],
  thrustTell: [-24, 0.82, -120, 0.9, 1.1], thrust: [10, 1.22, 0, 1.2, 0.82], recover: [24, 0.95, -30, 0.9, 1], recoil: [-38, 1.05, 50, 1.1, 1],
  sweepTell: [34, 0.8, -100, 0.85, 1.15], sweep: [-6, 1.2, 6, 1.2, 0.8], hurlTell: [-32, 1, 70, 1.1, 1], hurl: [24, 1.18, -20, 1.15, 0.85],
  bare: [4, 1, -10, 1, 1], recallTell: [-16, 1.06, 25, 1.05, 1], recall: [-26, 1.1, -55, 1, 0.95], decreeTell: [-4, 1.14, 0, 1.15, 0.9], decree: [30, 0.95, -70, 0.9, 1.05],
  heave: [12, 0.9, -30, 0.8, 1.1], pinned: [40, 0.85, -50, 0.8, 1.1], curse: [-44, 1.05, 60, 1.1, 1], graspTell: [48, 0.9, -90, 0.85, 1.1], grasp: [60, 0.9, -100, 0.8, 1.1],
  leechTell: [-46, 1.1, 40, 1, 0.95], leech: [32, 1.1, -10, 1.05, 0.95], prongTell: [-14, 1.08, 30, 1.05, 1], shellTell: [54, 0.7, -150, 0.8, 1.15] };
/* the move modes -> pose keys (one place; the lint walks this against K2_TELLS) */
export const K2_MODE_POSE = { sleep: 'sleep', wake: 'wake', recover: 'recover', recoil: 'recoil', thrustTell: 'thrustTell', thrust: 'thrust', sweepTell: 'sweepTell', sweep: 'sweep', hurlTell: 'hurlTell', hurl: 'hurl',
  recallTell: 'recallTell', recall: 'recall', decreeTell: 'decreeTell', decree: 'decree', heave: 'heave', pinned: 'pinned', curse: 'curse', graspTell: 'graspTell', grasp: 'grasp', leechTell: 'leechTell', leech: 'leech', prongTell: 'prongTell', shellTell: 'shellTell' };
/* how long each timed mode runs (progress p = how much of it is gone); the hands hand these in from K2 so a number change there moves the pose with it */
export const poseOf = (mode, o) => {
  if (K2_MODE_POSE[mode]) return K2_MODE_POSE[mode];
  if (o.hurtT > 0 || o.flash > 0) return 'hurt';
  if (o.open > 0) return 'open';
  if (o.trOut) return 'bare';
  if (o.dry && o.k < 0.35) return 'beached';
  return 'idle';
};

/* ---------- the drawer ---------- */
let g_, X_, Y_, F_, TINT_ = 0;
export const setCtx = (g, x, y) => { g_ = g; X_ = R(x); Y_ = R(y); F_ = 1; TINT_ = 0; };
const rc = (dx, dy, w, h, c, a = 1) => { if (a !== 1) g_.globalAlpha = a; g_.fillStyle = TINT_ > 0 ? mixC(c, '#ffffff', TINT_) : c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - R(w), Y_ + R(dy), R(w), R(h)); if (a !== 1) g_.globalAlpha = 1; };
const dot = (dx, dy, c, a) => rc(dx, dy, 1, 1, c, a);
function ln(x0, y0, x1, y1, c, th = 1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) { const dx = x0 + (x1 - x0) * i / n, dy = y0 + (y1 - y0) * i / n; for (let a = 0; a < th; a++) for (let b = 0; b < th; b++) dot(dx - (th >> 1) + a, dy - (th >> 1) + b, c); } }
const ang = (deg, len) => [Math.cos(deg * D2R) * len, Math.sin(deg * D2R) * len];

export function drawKing2(g, x, y, f, o = {}, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; o = { aim: 0, trAng: 0, ...o };
  const key = o.pose || poseOf(o.mode, o), Pz = K2_POSE_SET[key] || K2_POSE_SET.idle, dry = !!o.dry, cursed = !!o.cursed, kk = clamp(o.k || 0), tm = time;
  const cur = cursed || key === 'curse' && kk > 0.45; const greyK = key === 'curse' ? kk : cursed ? 1 : 0;
  TINT_ = o.flashT > 0 ? 0.5 : 0;
  const SK = cursed ? K2P.curse.skin : K2P.skin, PL = cursed ? K2P.curse.plate : K2P.plate;
  const sk = i => (greyK > 0 && !cursed ? mixC(K2P.skin[i], K2P.curse.skin[i], greyK) : SK[i]), pl = i => (greyK > 0 && !cursed ? mixC(K2P.plate[i], K2P.curse.plate[i], greyK) : PL[i]);
  /* the body's axis and centre */
  const tilt = (o.tilt || 0) * 0.6; let A = ((dry ? Pz.aD : Pz.a) ?? Pz.a ?? 0) + (dry || key !== 'idle' ? 0 : tilt * 50);
  const stroke = (!Pz.still && !dry && (key === 'idle' || key === 'recover')) ? Math.sin(tm * 6 + (o.seed || 0)) : 0;
  const walk = dry && key === 'idle' && Math.abs(o.vx || 0) > 6 ? Math.sin(tm * 9) : 0;
  const breath = Pz.still ? 0 : Math.sin(tm * 2.4) * 0.8;
  const cyBase = dry ? (Pz.cyD ?? Pz.cy ?? 20) : (Pz.cy ?? 19);
  const CX = (key === 'thrust' || key === 'hurl' || key === 'decree') ? 3 : (key === 'thrustTell' || key === 'hurlTell') ? -3 : 0, CY = -cyBase + breath + (dry ? Math.abs(walk) * -1 : 0), a = A * D2R, ca = Math.cos(a), sa = Math.sin(a);
  const Pt = (u, v) => [CX + u * ca - v * sa, CY + u * sa + v * ca];
  const oval = (u0, v0, ru, rv, col, al) => { const [cx, cy] = Pt(u0, v0), r = Math.max(ru, rv) + 1;
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const px = i, py = j, uu = px * ca + py * sa, vv = -px * sa + py * ca; if ((uu / ru) ** 2 + (vv / rv) ** 2 <= 1) dot(R(cx + i), R(cy + j), col, al); } };
  const arm = (sh, [a1, a2], c1, c2, th = 2) => { const aa = v => (v === AIM ? o.aim : v === TIP ? o.trAng : v), e1 = ang(aa(a1), 8), e2 = ang(aa(a2), 7), el = [sh[0] + e1[0], sh[1] + e1[1]], ha = [el[0] + e2[0], el[1] + e2[1]];
    ln(sh[0], sh[1], el[0], el[1], K2P.iron[0], th + 2); ln(el[0], el[1], ha[0], ha[1], K2P.iron[0], th + 2); ln(sh[0], sh[1], el[0], el[1], c1, th); ln(el[0], el[1], ha[0], ha[1], c2, th); return ha; };
  /* the colour set */
  const gl = key === 'curse' ? (kk > 0.4 ? K2P.curse.eyes : K2P.lamp[0]) : cursed ? K2P.curse.eyes : K2P.lamp[0];
  const eyeC = Pz.eyes === 'dim' ? K2P.dim : Pz.eyes === 'flare' ? (cursed ? '#d4f4a0' : K2P.lamp[1]) : Pz.eyes === 'curse' ? K2P.curse.eyes : Pz.eyes === 'dim' ? K2P.dim : gl;
  const eyes = key === 'wake' ? (kk > 0.4 ? K2P.lamp[1] : K2P.dim) : eyeC;

  /* ---- THE SILHOUETTE PASS (claude/sea4): four masses, each outlined dark so they read apart: HEAD + CROWN, CHEST (pauldrons, gold belt), the ARMS, and the TAIL (wet) / LEGS (dry); the CAPE is one flat shape BEHIND them (2 values + a hem).
     K2_BODY[pose] = [bow, sq, curl, tlen, rv]: bow = the chest + head bent off the hips (deg, + = bowed forward), sq = chest length (coil < 1 < stretch), curl = the tail's curl (- under the belly, + arched over the back), tlen, rv = chest depth. ---- */
  const BD = K2_BODY[key] || K2_BODY.idle, bow = BD[0] + (key === 'idle' ? stroke * 3 : 0), sq = BD[1], rvS = BD[4], aC = (A + bow) * D2R, cc = Math.cos(aC), sc = Math.sin(aC), OLC = K2P.iron[0];
  const PC = (u, v) => [CX + u * cc - v * sc, CY + u * sc + v * cc];
  const ovalC = (u0, v0, ru, rv, col, al) => { const [cx, cy] = PC(u0, v0), r = Math.max(ru, rv) + 1;
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const uu = i * cc + j * sc, vv = -i * sc + j * cc; if ((uu / ru) ** 2 + (vv / rv) ** 2 <= 1) dot(R(cx + i), R(cy + j), col, al); } };
  const olC = (u0, v0, ru, rv, col) => { ovalC(u0, v0, ru + 1, rv + 1, OLC); ovalC(u0, v0, ru, rv, col); }, olH = (u0, v0, ru, rv, col) => { oval(u0, v0, ru + 1, rv + 1, OLC); oval(u0, v0, ru, rv, col); };
  const cRu = 10 * sq, cRv = 8 * rvS, shU = 3 + cRu * 0.55, FLOORY = -2;
  /* ---- THE CAPE: one flat shape behind the body (a dry cape never goes under the floor line) ---- */
  { const cl = 24 * (Pz.cape ?? 1) * (cursed ? 0.9 : 1) * (dry ? 0.8 : 1), ph = tm * 3 + (o.seed || 0), top = [], bot = [];
    for (let u = 8; u >= -cl; u -= 1) { const t = (8 - u) / 32, wv = Math.sin(u * 0.3 + ph) * 2.2 * t * (Pz.still ? 0.3 : 1); let a1 = Pt(u, -7 - t * 4 + wv), b1 = Pt(u, 6 + t * 7 + wv); if (cursed && ((u * 7) | 0) % 6 === 0) b1 = Pt(u, 3 + t * 5 + wv);
      if (dry) { a1 = [a1[0], Math.min(a1[1], FLOORY)]; b1 = [b1[0], Math.min(b1[1], FLOORY)]; } top.push(a1); bot.push(b1); }
    const col = (p, q, c) => ln(p[0], p[1], q[0], q[1], c, 2);
    top.forEach((p, i) => col([p[0], p[1] - 1], [bot[i][0], bot[i][1] + 1], OLC)); top.forEach((p, i) => col(p, bot[i], K2P.mail[1]));
    top.forEach((p, i) => { if (i > 5) { const q = bot[i], k = 0.55; col([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k], q, K2P.mail[0]); } }); }
  /* ---- THE BACK ARM (dark green, behind the chest) ---- */
  const shB = PC(shU - 1, 4), shF = PC(shU, -3);
  const handB = arm(shB, Pz.armB, K2P.plate[0], K2P.plate[1], 3); rc(handB[0] - 2, handB[1] - 2, 5, 5, OLC); rc(handB[0] - 1, handB[1] - 1, 3, 3, pl(1));
  /* ---- THE TAIL (wet) / THE LEGS (dry) ---- */
  if (!dry) { const N = 11, seg = 3.3 * BD[3], sway = (Pz.still ? 0.25 : 1) * (Pz.legs ?? 1), pts = []; let [px, py] = Pt(-8, 1), dg = A + 180;
    for (let i = 0; i < N; i++) { dg += BD[2] / N * (1 + i / N) * 0.9 + Math.sin(tm * 6 - i * 0.55 + (o.seed || 0)) * 4.2 * sway * (0.3 + i / N) + (key === 'idle' ? stroke * 1.5 : 0); const [dx, dy] = ang(dg, seg); px += dx; py += dy; pts.push([px, py, 8 - i * 0.58]); }
    let q0 = Pt(-8, 1); pts.forEach(p => { ln(q0[0], q0[1], p[0], p[1], OLC, Math.max(3, R(p[2]) + 2)); q0 = p; }); q0 = Pt(-8, 1); pts.forEach(p => { ln(q0[0], q0[1], p[0], p[1], K2P.plate[1], Math.max(1, R(p[2]))); q0 = p; });
    q0 = Pt(-8, 0); pts.forEach((p, i) => { if (i < N - 2) { ln(q0[0], q0[1] - 1, p[0], p[1] - 1, K2P.plate[2], 1); } q0 = p; });
    const e = pts[N - 1], e0 = pts[N - 2], da = Math.atan2(e[1] - e0[1], e[0] - e0[0]) / D2R;
    for (const s of [-1, 1]) { const [fx, fy] = ang(da + s * 38, 8); ln(e[0], e[1], e[0] + fx, e[1] + fy, OLC, 4); } for (const s of [-1, 1]) { const [fx, fy] = ang(da + s * 38, 8); ln(e[0], e[1], e[0] + fx, e[1] + fy, K2P.plate[2], 2); dot(e[0] + fx, e[1] + fy, K2P.weed[2]); } }
  else for (const s of [-1, 1]) { const kick = walk * s * 3, lo = (Pz.cyD ?? 20) < 14, hip = Pt(-6, s * 3), foot = [hip[0] + s * 4 + kick + (lo ? s * 3 : 0), 0], mid = [(hip[0] + foot[0]) / 2 + 4 + (lo ? 3 : 0), (hip[1] + foot[1]) / 2 - 1];
    ln(hip[0], hip[1], mid[0], mid[1], OLC, 6); ln(mid[0], mid[1], foot[0], foot[1], OLC, 5); rc(foot[0] - 3, -3, 8, 4, OLC);
    ln(hip[0], hip[1], mid[0], mid[1], K2P.plate[1], 4); ln(mid[0], mid[1], foot[0], foot[1], K2P.iron[2], 3); rc(foot[0] - 2, -2, 6, 2, K2P.iron[1]); dot(mid[0], mid[1], K2P.gold[2]); }
  /* ---- THE CHEST: hips, chest plate, pauldrons, belt ---- */
  olH(-5, 0, 7, 6.2, pl(1));
  olC(3, 0, cRu, cRv, pl(2)); ovalC(4, -cRv * 0.4, cRu * 0.6, cRv * 0.25, pl(3)); ovalC(0, cRv * 0.45, cRu * 0.6, cRv * 0.22, pl(1));
  { const s0 = PC(-5, 0), s1 = PC(cRu * 0.9, 0); ln(s0[0], s0[1], s1[0], s1[1], pl(1)); const b0 = Pt(-6, -6), b1 = Pt(-6, 6); ln(b0[0], b0[1], b1[0], b1[1], K2P.gold[1], 2); const b2 = Pt(-6, 0); dot(b2[0], b2[1], K2P.gold[3]); }
  olC(shU, -cRv + 2.5, 4.4, 3.6, pl(3)); ovalC(shU + 0.5, -cRv + 1.5, 2.4, 1.4, pl(4));
  if (cursed || greyK > 0.5) for (const [u, v] of [[0, -3], [6, 2], [-4, 2]]) { const q = PC(u, v); dot(q[0], q[1], K2P.curse.plate[0]); dot(q[0] + 1, q[1] + 1, K2P.curse.plate[0]); }   /* the cracks in the plate */
  if (Pz.growShell || o.shell || o.shellOpenT > 0) drawShell(PC, kk, key, o, tm);
  /* ---- THE HEAD: big, round, outlined; two lamps, a weed beard, the crown standing up off it. Its own frame: swimming it faces along the body, standing (dry) the frame turns 90 deg so the face looks FORWARD and the crown is on top ---- */
  { const hd = Pz.head || [0, 0], hu = 3 + cRu + 5.5 + hd[0] + (BD[1] > 1.1 ? 1.5 : 0), hv = -1 + hd[1], wide = Pz.mouth === 'wide', hc = PC(hu, hv), aH = aC + (dry ? Math.PI / 2 : 0), ch = Math.cos(aH), sh_ = Math.sin(aH);
    const PH = (u, v) => [hc[0] + u * ch - v * sh_, hc[1] + u * sh_ + v * ch];
    const ovalH = (u0, v0, ru, rv, col, al) => { const [cx, cy] = PH(u0, v0), r = Math.max(ru, rv) + 1;
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const uu = i * ch + j * sh_, vv = -i * sh_ + j * ch; if ((uu / ru) ** 2 + (vv / rv) ** 2 <= 1) dot(R(cx + i), R(cy + j), col, al); } };
    ovalH(0, 0, 8, 8, OLC); ovalH(0, 0, 7, 7, sk(2)); ovalH(1, -3, 4.4, 1.8, sk(3)); ovalH(-1, 3.5, 4, 1.8, sk(0));
    const e1 = PH(4, -1), e2 = PH(4, 3); dot(e1[0], e1[1], eyes); dot(e2[0], e2[1], eyes); if (eyes === K2P.lamp[1] || eyes === '#d4f4a0') { dot(e1[0] - 1, e1[1], eyes, 0.4); dot(e2[0] - 1, e2[1], eyes, 0.4); }
    if (Pz.mouth) { const m = PH(5, 4); rc(m[0], m[1], wide ? 3 : 2, wide ? 3 : 1, K2P.mouth); if (wide) { rc(m[0] + 1, m[1] + 1, 1, 1, K2P.curse.eyes); } }
    { const wv = Math.sin(tm * 2.4 + 1) * 1.4 * (Pz.still ? 0.3 : 1), b0 = PH(5, 5), b1 = PH(-2, 8), b2 = PH(-8, 11 + wv), b3 = PH(-10, 13 + wv);
      ln(b0[0], b0[1], b1[0], b1[1], K2P.beard[1], 3); ln(b1[0], b1[1], b2[0], b2[1], K2P.beard[1], 2); ln(b2[0], b2[1], b3[0], b3[1], K2P.beard[0]); }
    const cr = (Pz.crown || 0) + (key === 'curse' ? kk * 4 : cursed ? 2 : 0);
    { const b0 = PH(-6 + cr, -6 - cr * 0.5), b1 = PH(6 + cr, -5 - cr * 0.5); ln(b0[0], b0[1] - 1, b1[0], b1[1] - 1, OLC, 4); ln(b0[0], b0[1], b1[0], b1[1], K2P.gold[1], 2); }
    for (let k = 0; k < 5; k++) { const b = PH(-5 + k * 2.5 + cr, -6 - cr * 0.5), t = PH(-4 + k * 2.5 + cr, -12 - cr); ln(b[0], b[1], t[0], t[1], k % 2 ? K2P.gold[2] : K2P.gold[3], 2); dot(t[0], t[1] - 1, K2P.gold[3]); }
    if (cursed || (key === 'curse' && kk > 0.3)) { const t = PH(1 + cr, -14 - cr); for (let i = 0; i < 4; i++) dot(t[0] + Math.sin(tm * 14 + i * 2) * 1.5, t[1] - i * 2, K2P.curse.flame[i % 3], 0.9); }
    if (Pz.throat) { const m = PH(5, 4); rc(m[0] - 1, m[1] - 1, 5, 5, K2P.curse.flame[0]); rc(m[0], m[1], 3, 3, K2P.curse.flame[1]); }
    if (Pz.rays && !o.bodyOnly) { const c = PH(0, -10); const n = 7; for (let i = 0; i < n; i++) { const dg = -160 + i * (140 / (n - 1)), L = 6 + kk * 14, [dx, dy] = ang(dg, L), [sx, sy] = ang(dg, 5); ln(c[0] + sx, c[1] + sy, c[0] + dx, c[1] + dy, i % 2 ? K2P.gold[3] : K2P.gold[2], 1); } } }
  /* ---- THE FRONT ARM, the TRIDENT, the effects: over all of it ---- */
  const aimA = o.aim;
  const hF = arm(shF, Pz.armF.map(v => (v === AIM ? aimA : v === TIP ? o.trAng : v)).map((v, i) => (key === 'idle' ? v + stroke * (i ? 8 : 24) : v)), K2P.iron[1], K2P.iron[2], 3);
  const open = Pz.open, fist = Pz.fist;
  rc(hF[0] - 2, hF[1] - 2, 4, 4, K2P.iron[3]); dot(hF[0] - 1, hF[1] - 2, K2P.iron[4]);
  if (open === 'F' || open === 'both') { const d = ang(Pz.armF[1] === AIM ? aimA : Pz.armF[1] === TIP ? o.trAng : Pz.armF[1], 4); for (let i = -2; i <= 2; i += 2) dot(hF[0] + d[0] + (i * -d[1] / 4), hF[1] + d[1] + (i * d[0] / 4), K2P.iron[4]); }
  if (fist === 'F') rc(hF[0] - 3, hF[1] - 3, 6, 6, K2P.iron[3]);
  if (Pz.palm) { const pr = 4 + 2 * Math.sin(tm * 14); for (let i = 0; i < 12; i++) { const t = i / 12 * Math.PI * 2; dot(hF[0] + Math.cos(t) * pr + 2, hF[1] + Math.sin(t) * pr, K2P.hot, 0.9); } }
  if (Pz.greenHands) for (const h of [hF, handB]) { rc(h[0] - 3, h[1] - 2, 6, 6, K2P.curse.flame[0], 0.8); rc(h[0] - 2, h[1] - 1, 4, 4, K2P.curse.flame[1], 0.9); dot(h[0], h[1] + 1, K2P.curse.flame[2]); for (let i = 0; i < 3; i++) dot(h[0] - 2 + i * 2, h[1] + 4 + ((tm * 12 + i) % 4), K2P.curse.flame[1], 0.8); }
  /* the trident */
  if (Pz.tri && !o.bodyOnly) { const T = Pz.tri, holder = T.by === 'B' ? handB : hF, tdeg = T.ang === AIM ? aimA : T.ang; drawTrident(holder[0], holder[1], tdeg, T.grip, { cursed, split: T.split ? 0.4 + 0.6 * kk : 0, glint: Pz.glint, red: Pz.red, tm }); }
  /* the effects of the move */
  if (!o.bodyOnly) {
  if (Pz.sight) { const [dx, dy] = ang(aimA, 60); for (let i = 1; i < 6; i++) dot(hF[0] + dx * i / 5 + 24 * Math.cos(aimA * D2R), hF[1] + dy * i / 5 + 24 * Math.sin(aimA * D2R), K2P.hot, 0.3 + 0.4 * ((tm * 16 + i) % 2)); }
  if (Pz.lunge) { for (let i = 0; i < 5; i++) { const [dx, dy] = ang(aimA + 180, 12 + i * 5); ln(hF[0] + dx - 4, hF[1] + dy - 4 + (i - 2) * 3, hF[0] + dx * 1.7 - 4, hF[1] + dy * 1.7 - 4 + (i - 2) * 3, K2P.lamp[1], 1); } }
  if (Pz.arc) { for (let i = 0; i < 26; i++) { const t = i / 25, dg = lerp(-70, 24, t), r = 36 + t * 4, [dx, dy] = ang(dg, r); const q = Pt(0, 0); rc(q[0] + dx + 6, -6 + dy * 0.34 + 6, 2, 2, t > 0.6 ? K2P.white : K2P.iron[3], 0.35 + t * 0.55); } }
  if (Pz.ring) for (let i = 0; i < 2; i++) { const w = 20 + i * 14 + 10 * ((tm * 5) % 1); for (let s = -1; s <= 1; s += 2) rc(s * w, -1 - i, 3, 2, K2P.gold[3], 0.9 - i * 0.35); rc(-w, -1, w * 2, 1, K2P.gold[2], 0.18); }
  if (Pz.pull) for (let i = 0; i < 4; i++) { const [dx, dy] = ang(o.trAng ?? 0, 10 + i * 7); ln(hF[0] + dx, hF[1] + dy, hF[0] + dx * 0.8, hF[1] + dy * 0.8, K2P.hot, 1); }
  if (Pz.stars || Pz.strain) for (let i = 0; i < 3; i++) { const q = Pt(24 + i * 3, -14 + i * 6); dot(q[0] + Math.sin(tm * 10 + i * 2) * 3, q[1] - ((tm * 9 + i * 2) % 5), i % 2 ? K2P.gold[3] : K2P.gold[2]); }
  if (Pz.sparks) for (let i = 0; i < 4; i++) dot(14 + i * 4, -30 + ((tm * 13 + i * 3) % 7), K2P.spark);
  if (Pz.cursing) for (let i = 0; i < 9; i++) dot(-20 + i * 5 + Math.sin(tm * 7 + i) * 2, -44 - ((tm * 22 + i * 6) % 34) * kk, K2P.curse.flame[i % 3], 0.5 + 0.4 * kk);
  if (key === 'decreeTell' || key === 'decree') { /* the crown's light */ rc(-6, -48, 12, 1, K2P.gold[2], 0.25 + 0.25 * kk); }
  }
  TINT_ = 0; return { hand: hF };
}

/* THE TRIDENT: a shaft with gold bands, a socket, three tines (the middle long, the sides barbed), a butt-cap. (hx, hy) = the gripping hand, tdeg = the shaft's direction (the tines lead), grip = how far the butt is behind the hand. */
export function drawTrident(hx_, hy_, tdeg, grip = 10, o = {}) {
  const [dx, dy] = ang(tdeg, 1), len = 38, [nx, ny] = [-dy, dx], bx = hx_ - dx * grip, by = hy_ - dy * grip, tx = bx + dx * len, ty = by + dy * len, C = o.cursed;
  const shaft = C ? K2P.curse.plate[2] : K2P.iron[2], band = C ? K2P.curse.flame[1] : K2P.gold[2], tine = C ? K2P.curse.flame[2] : K2P.iron[4], tine2 = C ? K2P.curse.flame[1] : K2P.iron[3];
  ln(bx, by, tx, ty, K2P.iron[0], 2); ln(bx, by - 0.5, tx, ty - 0.5, shaft, 1);
  for (const q of [0.15, 0.5, 0.82]) rc(bx + dx * len * q - 1, by + dy * len * q - 1, 2, 2, band);
  rc(bx - 1, by - 1, 3, 3, K2P.gold[1]);
  const sp = o.split ? 2 + o.split * 8 : 0, lead = 10;
  ln(tx, ty, tx + dx * lead, ty + dy * lead, tine, 1); dot(tx + dx * (lead + 1), ty + dy * (lead + 1), K2P.white);
  for (const s of [-1, 1]) { const ox = tx + nx * (4 + sp * 0.6) * s, oy = ty + ny * (4 + sp * 0.6) * s; ln(tx + nx * 1.5 * s, ty + ny * 1.5 * s, ox, oy, tine2, 1); ln(ox, oy, ox + dx * (lead - 2) + nx * sp * 0.5 * s, oy + dy * (lead - 2) + ny * sp * 0.5 * s, tine, 1); dot(ox - dx * 2, oy - dy * 2, tine2); }
  rc(tx - 1, ty - 1, 3, 3, K2P.gold[1]);
  if (o.glint && Math.sin((o.tm || 0) * 16) > -0.2) { const gx = tx + dx * (lead + 1), gy = ty + dy * (lead + 1), gc = o.red ? K2P.red : K2P.white; rc(gx - 2, gy, 5, 1, gc); rc(gx, gy - 2, 1, 5, gc); }
  if (o.split) for (const s of [-1, 0, 1]) for (let q = 1; q <= 5; q++) { const ex = tx + dx * (lead + q * 3) + nx * s * (3 + sp * (0.4 + q * 0.12)), ey = ty + dy * (lead + q * 3) + ny * s * (3 + sp * (0.4 + q * 0.12)); dot(ex, ey, K2P.curse.flame[q % 2 ? 1 : 2], 0.75 - q * 0.1); }
}

/* THE BONE SHELL: coral and bone closing over him. kk = how far (shellTell); once on (o.shell) it is whole; o.shellOpenT > 0 = split open (gold, shards) */
function drawShell(Pt, kk, key, o, tm) {
  const K = key === 'shellTell' ? kk : 1, split = o.shellOpenT > 0, plates = [[8, -8, 8, 4], [8, 8, 8, 4], [-2, -9, 9, 3], [-2, 9, 9, 3], [14, 0, 6, 5], [-10, 0, 8, 4]];
  plates.forEach(([u, v, ru, rv], i) => { if (i / plates.length > K) return; const q = Pt(u, v + (split ? (v > 0 ? 6 : -6) : 0)), c = split ? K2P.bone : (i % 2 ? K2P.coral : K2P.bone);
    for (let j = -ru; j <= ru; j += 1) for (let k = -rv; k <= rv; k += 1) if ((j / ru) ** 2 + (k / rv) ** 2 <= 1) dot(q[0] + j, q[1] + k, c[((j + k) & 3) === 0 ? 3 : 2 - ((j > 0) | 0)]);
    dot(q[0] - 1, q[1] - rv, c[3]); dot(q[0] + 2, q[1] - rv - 1, c[3]); });
  if (K > 0.6) { for (let i = 0; i < 6; i++) { const q = Pt(12 - i * 4, -10 - (i % 2) * 2); ln(q[0], q[1], q[0] + (i % 2 ? 1 : -1), q[1] - 4 - (i % 3), K2P.coral[2], 1); } }
  if (split) for (let i = 0; i < 6; i++) { const q = Pt(8 + i * 3, -14 + ((tm * 5 + i * 4) % 22)); dot(q[0] + i - 3, q[1], K2P.gold[3]); dot(q[0] + i - 3, q[1] + 1, K2P.bone[3]); }
}

/* HIS FALL (the dead king, k 0..1 over ~1.6 s, then he lies): to his knees, the crown rolls off, the trident drops, he goes down on his side, the lamps die. */
export function drawDeadKing2(g, x, y, f, k, time = 0, o = {}) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; TINT_ = 0; const kn = clamp(k / 0.45), lie = clamp((k - 0.45) / 0.55), cu = !!o.cursed, SK = cu ? K2P.curse.skin : K2P.skin, PL = cu ? K2P.curse.plate : K2P.plate;
  const lowY = lerp(0, 8, kn) + lerp(0, 4, lie);
  /* the trident drops and lies */
  { const tx = lerp(14, 22, lie), ty = -2 - lerp(26, 0, kn), tdeg = lerp(-70, 4, kn); drawTrident(tx - lerp(10, 8, kn), ty + 10, lie > 0.2 ? 4 : tdeg, 10, { cursed: cu }); }
  /* the body: kneeling, then on its side */
  if (lie < 0.5) { const bx = lerp(0, 4, lie), sh = lowY;
    rc(bx - 6, -14 + sh, 13, 12, PL[2]); rc(bx - 5, -14 + sh, 6, 3, PL[3]); rc(bx - 6, -4 + sh, 13, 2, K2P.gold[1]);
    rc(bx - 10, -12 + sh, 5, 11, K2P.mail[1]); rc(bx - 14, -6 + sh, 6, 8, K2P.mail[0], 0.8);
    rc(bx - 5, -8 + sh + 8 - 1, 4, 4 - Math.min(3, sh >> 1), K2P.iron[1]); rc(bx + 1, -8 + sh + 7, 5, 3, K2P.iron[2]);
    const hy = -24 + sh * 1.3 + lie * 8; rc(bx - 3, hy, 9, 9, SK[2]); rc(bx - 3, hy, 9, 2, SK[3]); rc(bx - 1, hy + 4 + lie * 2, 2, 1, lie < 0.3 ? K2P.dim : '#1a2e2a'); rc(bx + 3, hy + 4 + lie * 2, 2, 1, lie < 0.3 ? K2P.dim : '#1a2e2a'); rc(bx - 3, hy + 9, 6, 6 + lie * 4, K2P.beard[1]);
    rc(bx + lerp(1, 22, clamp(kn * 1.2)) - 3, hy - 3 + lerp(0, 28 - sh, clamp(kn * 1.2)), 8, 2, K2P.gold[2]); rc(bx + lerp(1, 22, clamp(kn * 1.2)) - 2, hy - 5 + lerp(0, 28 - sh, clamp(kn * 1.2)), 6, 2, K2P.gold[3]);   /* the crown rolling */
  } else { /* on his side, the cape spread, one arm out */
    rc(-16, -10, 32, 9, PL[2]); rc(-16, -10, 32, 2, PL[3]); rc(-16, -3, 32, 2, PL[1]); rc(-22, -8, 8, 7, K2P.mail[1]); rc(-30, -5, 12, 5, K2P.mail[0]);
    rc(-4, -9, 4, 8, K2P.gold[1]); rc(16, -10, 9, 9, SK[2]); rc(16, -10, 9, 2, SK[3]); rc(19, -6, 2, 1, '#1a2e2a'); rc(15, -2, 12, 3, K2P.beard[1]); rc(12, -3, 10, 3, K2P.iron[2]);
    for (let i = 0; i < 4; i++) rc(-24 + i * 6, -2 + (i & 1), 2, 1, K2P.weed[1]);
    rc(28, -2, 5, 2, K2P.gold[2]); rc(29, -3, 3, 1, K2P.gold[3]); }
  if (lie < 0.9) for (let i = 0; i < 3; i++) dot(10 + i * 5 - lie * 6, -28 - ((time * 8 + i * 5) % 9), K2P.lamp[0], 0.55 * (1 - lie));   /* the last of the lamps' light rising */
  F_ = 1; TINT_ = 0;
}
