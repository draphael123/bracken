// champion_art.js - THE ADMIRAL'S CHAMPION, GREYBOX (claude/flotilla2). ROUGH SHAPES ONLY: the art lane (scratch/brief-flotilla2.md B) replaces this file with
// the hand-drawn sheet - P1 BOARDING GREATSWORD + P2 ANCHOR ON ITS CHAIN, every move its own windup + release pose (B16). The pose keys below are the contract:
//   walk / recover / sleep / wake / comboTell (the blade drawn back over the shoulder) / combo (swung across, a crescent) / comboRec (down in front, leaning)
//   slamTell (two hands, the blade high over the helm, back arched) / slam (struck down) / stuck (OPEN: the blade buried in the deck, both hands on the grip, hauling)
//   slamRec / thrustTell (crouched, the point drawn back at the hip) / thrust (stretched full length) / thrustRec / leapTell (deep crouch, the blade low) / leap (in the air,
//   the blade over the head) / landRec (landed, one knee, cracks) / flat (OPEN: on his back, the helm rolled, the blade loose) / tearTell (hauling the anchor off the rail)
//   sweepTell (the anchor wound back behind him on its chain) / sweep (the chain at full stretch round him) / sweepRec / hookTell (the anchor whirled over the helm) / hook (the arm thrown)
//   hookRec / tiltTell (the anchor two-handed over the helm) / tilt (struck down) / stuckA (OPEN: the anchor bitten into the deck) / tiltRec / dead.
// He is a HUGE salt-crusted plate knight: barrel breastplate, broad pauldrons, a closed sallet with a crest of salt, sea-green surcoat in rags, barnacled greaves.
// Pure drawing on a 2d context g at (x, y) = his feet on screen; f = facing (+1 right). o = { mode, p (windup progress 0..1), flash, anchor, ward, open }.
const R = Math.round;
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const line = (g, x0, y0, x1, y1, c, w = 2) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke(); g.lineWidth = 1; };
const PAL = { plate0: '#2a3038', plate1: '#4c5864', plate2: '#7a8a96', plate3: '#aebcc6', salt: '#e8eee8', salt2: '#c8d4cc', coat0: '#1e3a36', coat1: '#2e5a52', coat2: '#4a7a6c',
  blade: '#d8e2e8', bladeD: '#8a9aa6', grip: '#5a3a24', iron: '#3a3a40', iron2: '#5c5c66', rust: '#8a4a2a', slit: '#060808', eye: '#ffcf6a' };

/* the sword's line: from the hands (hx, hy) at angle a (radians, 0 = along f), len px */
function blade(g, hx, hy, a, f, len = 46) {
  const ex = hx + Math.cos(a) * len * f, ey = hy + Math.sin(a) * len;
  line(g, hx, hy, ex, ey, PAL.bladeD, 5); line(g, hx, hy, ex, ey, PAL.blade, 3);
  const cx = hx + Math.cos(a) * 6 * f, cy = hy + Math.sin(a) * 6;
  line(g, cx - Math.sin(a) * 6 * f, cy + Math.cos(a) * 6, cx + Math.sin(a) * 6 * f, cy - Math.cos(a) * 6, PAL.iron2, 3);   /* the cross-guard */
  line(g, hx, hy, hx - Math.cos(a) * 9 * f, hy - Math.sin(a) * 9, PAL.grip, 3);   /* the long grip, two hands */
}
/* the anchor: a stock, a shank and two flukes, at (ax, ay), its shank pointing along angle a */
export function drawAnchor(g, ax, ay, a = Math.PI / 2, s = 1) {
  const ux = Math.cos(a), uy = Math.sin(a), L = 22 * s, tx = ax - ux * L, ty = ay - uy * L;
  line(g, tx, ty, ax, ay, PAL.iron, 5 * s); line(g, tx, ty, ax, ay, PAL.iron2, 2 * s);
  line(g, tx - uy * 8 * s, ty + ux * 8 * s, tx + uy * 8 * s, ty - ux * 8 * s, PAL.iron, 4 * s);   /* the stock */
  line(g, ax, ay, ax - uy * 11 * s - ux * 6 * s, ay + ux * 11 * s - uy * 6 * s, PAL.iron, 4 * s); line(g, ax, ay, ax + uy * 11 * s - ux * 6 * s, ay - ux * 11 * s - uy * 6 * s, PAL.iron, 4 * s);   /* the flukes */
  rc(g, ax - 2, ay - 2, 4, 4, PAL.rust);
}
/* the chain from the hand to the anchor */
export function drawChain(g, x0, y0, x1, y1, time, taut = false) {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 5)), sag = taut ? 0 : 6;
  for (let i = 0; i <= n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag; rc(g, x - 1, y - 1, 3, 3, i % 2 ? PAL.iron2 : PAL.iron); }
}
export function drawChampion(g, x, y, f, o, time) {
  const m = o.mode || 'walk', p = Math.max(0, Math.min(1, o.p || 0)), fl = o.flash;
  const W = 30, H = 62; let dy = 0, lean = 0, crouch = 0;
  if (m === 'walk') dy = R(Math.sin(time * 6) * 1);
  if (m === 'comboTell') lean = -3 * p; if (m === 'combo') lean = 4; if (m === 'thrustTell' || m === 'leapTell') crouch = R(8 * p); if (m === 'thrust') { lean = 8; crouch = 4; }
  if (m === 'landRec') crouch = 8; if (m === 'slamTell' || m === 'tiltTell') lean = -3; if (m === 'slam' || m === 'tilt' || m === 'stuck' || m === 'stuckA') { lean = 6; crouch = 6; }
  if (m === 'flat') return drawFlat(g, x, y, f, o, time);
  const top = y - H + crouch + dy, bx = x + lean * f;
  /* legs: greaves, barnacled */
  rc(g, x - 11, top + 42, 9, 20 - crouch, PAL.plate1); rc(g, x + 2, top + 42, 9, 20 - crouch, PAL.plate1);
  rc(g, x - 11, y - 4, 10, 4, PAL.plate0); rc(g, x + 2, y - 4, 10, 4, PAL.plate0);
  rc(g, x - 9, top + 50, 2, 2, PAL.salt2); rc(g, x + 6, top + 53, 2, 2, PAL.salt2);
  /* the surcoat in rags, sea-green */
  rc(g, bx - 14, top + 30, 28, 16, PAL.coat1); for (let i = 0; i < 6; i++) rc(g, bx - 14 + i * 5, top + 44, 3, 3 + (i * 7) % 5, PAL.coat0);
  /* the barrel breastplate, salt in its seams */
  rc(g, bx - 15, top + 12, 30, 22, PAL.plate1); rc(g, bx - 13, top + 13, 26, 4, PAL.plate2); rc(g, bx - 4 * f - 2, top + 16, 6, 14, PAL.plate2); rc(g, bx - 15, top + 30, 30, 3, PAL.plate0);
  for (let i = 0; i < 7; i++) rc(g, bx - 13 + ((i * 11) % 26), top + 15 + ((i * 5) % 16), 2, 1, PAL.salt);
  /* the pauldrons: broad, round */
  rc(g, bx - 20, top + 10, 11, 9, PAL.plate2); rc(g, bx + 9, top + 10, 11, 9, PAL.plate2); rc(g, bx - 20, top + 10, 11, 2, PAL.plate3); rc(g, bx + 9, top + 10, 11, 2, PAL.plate3);
  rc(g, bx - 18, top + 11, 3, 1, PAL.salt); rc(g, bx + 13, top + 11, 4, 1, PAL.salt);
  /* the closed sallet, a crest of salt, the eye slit */
  rc(g, bx - 8, top - 2, 16, 14, PAL.plate2); rc(g, bx - 8, top + 10, 16, 3, PAL.plate1); rc(g, bx - 3, top - 6, 6, 5, PAL.salt); rc(g, bx - 1, top - 9, 3, 4, PAL.salt2);
  rc(g, bx + (f > 0 ? -1 : -7), top + 4, 8, 2, PAL.slit); if (/Tell$/.test(m)) rc(g, bx + (f > 0 ? 3 : -5), top + 4, 2, 2, PAL.eye);
  /* the weapon, by pose */
  const hx = bx + 10 * f, hy = top + 26;
  if (!o.anchor) {
    let a = 0.9;   /* at rest: the point down and forward */
    if (m === 'comboTell') a = -2.3 + p * 0.3; else if (m === 'combo') a = 0.15; else if (m === 'comboRec') a = 1.1;
    else if (m === 'slamTell') a = -1.6 - p * 0.5; else if (m === 'slam' || m === 'slamRec') a = 0.9; else if (m === 'stuck') a = 1.35;
    else if (m === 'thrustTell') a = 0.1 + Math.PI; else if (m === 'thrust') a = 0.02; else if (m === 'thrustRec') a = 0.3;
    else if (m === 'leapTell') a = 1.2; else if (m === 'leap') a = -1.7; else if (m === 'landRec') a = 1.3; else if (m === 'tearTell') a = 1.45;
    const shx = m === 'slamTell' || m === 'leap' ? bx + 2 * f : m === 'thrustTell' ? bx - 6 * f : hx, shy = m === 'slamTell' || m === 'leap' ? top + 6 : hy;
    line(g, bx + 6 * f, top + 16, shx, shy, PAL.plate1, 5);   /* the arms to the grip */
    blade(g, shx, shy, a, f, m === 'stuck' ? 34 : 48);
    if (m === 'stuck') { rc(g, shx + Math.cos(a) * 34 * f - 6, y - 2, 12, 2, PAL.rust); }
  } else {
    /* PHASE TWO: the anchor on its chain */
    let ax = hx + 10 * f, ay = y - 6, aa = Math.PI / 2;
    if (m === 'sweepTell') { ax = bx - (20 + 10 * p) * f; ay = top + 34; aa = Math.PI; }
    else if (m === 'sweep') { ax = bx + 4 * f; ay = top + 30; aa = Math.PI; }   /* (the anchor itself is drawn on its pass by the hands: S.sweep.x) */
    else if (m === 'hookTell') { const u = time * 12; ax = bx + Math.cos(u) * 18; ay = top - 10 + Math.sin(u) * 6; aa = u; }
    else if (m === 'tiltTell') { ax = bx; ay = top - 14 - 6 * p; aa = -Math.PI / 2; }
    else if (m === 'tilt' || m === 'stuckA' || m === 'tiltRec') { ax = bx + 30 * f; ay = y - 4; aa = Math.PI / 2; }
    else if (m === 'tearTell') { ax = bx + (14 + 10 * p) * f; ay = top + 30 - 10 * p; aa = Math.PI / 2 + 0.4 * f; }
    if (m !== 'hook' && m !== 'sweep') { drawChain(g, hx, hy, ax, ay, time, m === 'sweep' || m === 'tilt'); drawAnchor(g, ax, ay, aa, 1.1); }
    line(g, bx + 6 * f, top + 16, hx, hy, PAL.plate1, 5);
    if (m === 'stuckA') rc(g, ax - 10, y - 2, 20, 2, PAL.rust);
  }
  if (fl) { g.globalAlpha = 0.45; rc(g, bx - 16, top, 32, H - crouch, '#ffffff'); g.globalAlpha = 1; }
}
function drawFlat(g, x, y, f, o, time) {
  /* KNOCKED FLAT: on his back along the deck, the helm rolled back, the blade (or the anchor) loose beside him */
  rc(g, x - 30, y - 12, 60, 12, PAL.plate1); rc(g, x - 30, y - 12, 60, 3, PAL.plate2); rc(g, x + 22 * -f, y - 16, 14, 14, PAL.plate2); rc(g, x + 26 * -f, y - 18, 6, 3, PAL.salt);
  rc(g, x - 8, y - 14, 18, 4, PAL.coat1); for (let i = 0; i < 6; i++) rc(g, x - 26 + i * 9, y - 11, 2, 1, PAL.salt);
  if (!o.anchor) blade(g, x + 18 * f, y - 4, 0.05, f, 44); else drawAnchor(g, x + 40 * f, y - 6, Math.PI / 2, 1.1);
  const k = Math.floor(time * 3) % 3; rc(g, x - 4 + k * 6, y - 26 - k * 2, 3, 3, '#ffd36b');   /* stars */
}
/* THE DEATH: he goes down on his knees and over, and lies on the deck */
export function drawDeadChampion(g, x, y, f, k, time, anchor) { drawFlat(g, x, y, f, { anchor }, 0); g.globalAlpha = Math.max(0, 1 - k) * 0.5; rc(g, x - 30, y - 30, 60, 30, '#e8eee8'); g.globalAlpha = 1; }
/* THE LASHING's lines over the gap, and the tilt read on a heeling deck */
export function drawLashing(g, x0, x1, y, time, apart) {
  const sag = apart ? 2 : 6; for (const dy of [-4, -10]) { const n = Math.max(2, Math.round((x1 - x0) / 4)); for (let i = 0; i <= n; i++) { const u = i / n; rc(g, x0 + (x1 - x0) * u, y + dy + Math.sin(u * Math.PI) * sag, 2, 2, apart ? '#e8c070' : '#c9b27c'); } }
}
export function drawTilt(g, x0, x1, y, dir, k, time) {
  g.globalAlpha = 0.5; const n = Math.round((x1 - x0) / 24); for (let i = 0; i < n; i++) { const ax = x0 + 12 + i * 24, s = Math.floor(time * 6 + i) % 2; rc(g, ax, y - 3, 10, 2, s ? '#ffd36b' : '#ff9a5c'); rc(g, ax + (dir > 0 ? 10 : -2), y - 5, 2, 6, s ? '#ffd36b' : '#ff9a5c'); } g.globalAlpha = 1;
}
/* the slam's red mark on the deck while it is told */
export function drawSlamMark(g, x, y, w, k, time) { g.globalAlpha = 0.35 + 0.4 * k; rc(g, R(x - w / 2), y - 2, R(w), 2, Math.floor(time * 8) % 2 ? '#ff6b6b' : '#ffd36b'); g.globalAlpha = 1; }
/* the leap's mark where he lands */
export function drawLeapMark(g, x, y, r, k, time) { g.strokeStyle = Math.floor(time * 8) % 2 ? '#ff6b6b' : '#ffd36b'; g.globalAlpha = 0.5 + 0.4 * k; g.beginPath(); g.ellipse(R(x), y - 2, r, 4, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
