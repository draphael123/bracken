// deacon_art.js - THE DEACON, drawn (claude/church2art; the greybox was src/deacon-hands.js's rectangles). The church's lamplighter: a tall gaunt cleric in a lamp-black cassock, a short
// grey-white surplice with a lace hem, an oxblood stole with gilt ends, a brass-buckled cord with a snuffer-bell and a ring of keys at the hip, and a LONG BRASS POLE - a snuffer hook one
// end (the chain he throws comes off it), a little lamp-cup with a pilot flame the other. His face is pale and hollowed, lit orange from the pole's flame.
// THE SHEET (B16: every move its own windup + release pose, never a shared frame): guard (the pole crosswise HIGH), walk A / B, sweepTell (drawn back over the shoulder, the hook end up
// behind him) / sweep (swung low across the floor, crouched in the lunge), hookTell (the chain coiled, the pole drawn back level at the hip) / hook (the pole and the chain thrown out) /
// hookPull (hauling), jabTell (hauled in: one hand, the pole drawn back to the hip, the chain slack) / jab (the hook stabbed out short, one-handed, the lit cup trailing), arcTell (turned over, the flame end up behind him, the back arched)
// / arc (the pole dragged along the floor, the flame white and low, kneeling in the stroke), kindleTell (raised to a lamp, on his toes) / kindleWalk (carried upright), grope (OPEN: stooped,
// the lamp-cup dead and smoking, one hand out feeling), reel, hurt, recover, sleep (tending: head bowed, the pole planted, hands folded on it), wake, dead (the body he leaves: kneeling
// over the planted pole, the cup cold).
// Pure drawing; every pose is BAKED once (a 1 px dark outline so the silhouette reads at game size, like the Crusader), the flame, the chain and the fx are laid live over it.
// Pose canvas: W x H with the feet's centre at (AX, AY); a left-facing pose is the same canvas mirrored.
import { canvas, rect, px, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
const R = Math.round;
export const W = 104, H = 96, AX = 52, AY = 90;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const COL = {
  k: '#2a2234', kHi: '#443a56', kLo: '#16121e', kDeep: '#0e0b14',
  w: '#ece4d2', wHi: '#fffaf0', wLo: '#b8b0a0', wDeep: '#8c8576',
  r: '#923034', rHi: '#c24a44', rLo: '#5a1a22', g: '#d8b040', gHi: '#fff0a8', gLo: '#8a6a1c',
  b: '#c9a040', bHi: '#f4dc80', bLo: '#7a5c1c', bDeep: '#4a3610',
  s: '#c8a07e', sHi: '#ead0b0', sLo: '#8a6248', sDeep: '#5e4030',
  boot: '#0e0b14', flameO: '#ff9a3c', flameY: '#ffd36b', flameW: '#fff6c8', ember: '#7a2a1a',
};
/* ---------- THE POSES (lx forward +, ly up +, from the centre of his feet). cr: rows lost to a crouch; lean: the top of him forward; head: [dx, dy] and a bow (head down px) ---------- */
export const POSES = {
  guard:     { lean: 1, cr: 0, head: [0, 0], feet: [-3, 4], pole: { c: [7, 45], a: 0.08, lead: 'hook', h: [-9, 7] } },
  walkA:     { lean: 2, cr: 0, head: [1, 0], feet: [-6, 7], pole: { c: [7, 45], a: 0.08, lead: 'hook', h: [-9, 7] }, sway: 1 },
  walkB:     { lean: 2, cr: 0, head: [1, 1], feet: [-1, 2], pole: { c: [7, 44], a: 0.12, lead: 'hook', h: [-9, 7] }, sway: -1 },
  sweepTell: { lean: -4, cr: 1, head: [-1, 0], feet: [-6, 4], pole: { c: [-8, 50], a: -2.4, lead: 'hook', h: [-14, -2] }, arch: 1 },
  sweep:     { lean: 9, cr: 7, head: [3, -2], feet: [-9, 9], pole: { c: [26, 9], a: 0.12, lead: 'hook', h: [-24, -10] } },
  hookTell:  { lean: -4, cr: 2, head: [-1, 0], feet: [-6, 3], pole: { c: [-1, 22], a: -0.1, lead: 'hook', h: [-12, -2] }, coil: 1 },
  hook:      { lean: 8, cr: 3, head: [3, -1], feet: [-8, 8], pole: { c: [24, 26], a: 0.04, lead: 'hook', h: [-26, -12] } },
  hookPull:  { lean: -5, cr: 2, head: [-2, 0], feet: [-8, 5], pole: { c: [16, 28], a: -0.05, lead: 'hook', h: [-18, -4] } },
  jabTell:   { lean: -5, cr: 2, head: [-1, 0], feet: [-7, 3], pole: { c: [-6, 27], a: 0.0, lead: 'hook', h: [-14, -4] }, oneHand: 1 },
  jab:       { lean: 9, cr: 3, head: [3, -1], feet: [-8, 9], pole: { c: [22, 30], a: 0.02, lead: 'hook', h: [-24, -10] }, oneHand: 1 },
  arcTell:   { lean: -5, cr: 0, head: [-2, 1], feet: [-6, 3], pole: { c: [-4, 44], a: -2.0, lead: 'flame', h: [-12, 2] }, arch: 2, holy: 1 },
  arc:       { lean: 11, cr: 8, head: [5, -3], feet: [-10, 8], pole: { c: [24, 9], a: 0.28, lead: 'flame', h: [-24, -10] }, holy: 1 },
  kindleTell:{ lean: 3, cr: 0, head: [1, 1], feet: [-3, 4], tiptoe: 2, pole: { c: [16, 52], a: -1.15, lead: 'flame', h: [-10, 4] } },
  kindleWalk:{ lean: 1, cr: 0, head: [1, 0], feet: [-4, 5], pole: { c: [9, 38], a: -1.5, lead: 'flame', h: [-8, 6] }, sway: 1 },
  grope:     { lean: 7, cr: 5, head: [5, -5], feet: [-6, 6], dead: 1, pole: { c: [17, 12], a: 0.75, lead: 'hook', h: [4, 18] }, free: [16, 26] },
  reel:      { lean: -8, cr: 0, head: [-3, 1], feet: [-7, 1], pole: { c: [-2, 32], a: -0.7, lead: 'hook', h: [-12, 2] }, hand: [-1, 22], hurtFace: 1 },
  hurt:      { lean: -4, cr: 1, head: [-2, 0], feet: [-5, 3], pole: { c: [4, 42], a: 0.35, lead: 'hook', h: [-9, 6] }, hurtFace: 1 },
  recover:   { lean: 0, cr: 3, head: [1, -1], feet: [-4, 4], pole: { c: [10, 22], a: 0.3, lead: 'hook', h: [-12, 2] } },
  sleep:     { lean: 0, cr: 0, head: [2, -4], feet: [-3, 3], pole: { c: [11, 30], a: -1.5707, lead: 'flame', h: [2, 8] }, bow: 1 },
  wake:      { lean: 1, cr: 0, head: [2, -1], feet: [-3, 4], pole: { c: [10, 33], a: -1.3, lead: 'flame', h: [-2, 8] } },
  dead:      { lean: 9, cr: 15, head: [5, -6], feet: [-3, 3], dead: 1, kneel: 1, pole: { c: [13, 30], a: -1.5707, lead: 'flame', h: [6, 14] } },
};
/* the mode (+ its clock) -> a pose key */
export function poseKey(e, time) {
  const m = e.mode, wb = Math.floor(((e.anim || 0) * 5) % 2) === 0;
  switch (m) {
    case 'sweepTell': return 'sweepTell'; case 'sweep': return 'sweep';
    case 'hookTell': return 'hookTell'; case 'hook': return e.modeT > 0.12 ? 'hook' : 'hookPull';
    case 'jabTell': return 'jabTell'; case 'jab': return 'jab';
    case 'arcTell': return 'arcTell'; case 'arc': return 'arc';
    case 'kindleTell': return 'kindleTell'; case 'kindleWalk': return wb ? 'kindleWalk' : 'walkB';
    case 'grope': return 'grope'; case 'reel': return 'reel'; case 'recover': return 'recover';
    case 'sleep': case 'away': return 'sleep'; case 'wake': return e.modeT > 0.7 ? 'sleep' : 'wake';
    case 'walk': return wb ? 'walkA' : 'walkB';
  }
  return (e.hurtT || 0) > 0.1 ? 'hurt' : 'guard';
}
/* ---------- the body ---------- */
const lerp = (a, b, t) => a + (b - a) * t;
const hwOf = t => (t < 0.12 ? lerp(5, 4.5, t / 0.12) : t < 0.45 ? lerp(4.5, 3.6, (t - 0.12) / 0.33) : lerp(3.6, 7, (t - 0.45) / 0.55));
function body(g, P, ox, oy) {
  const N = 30 - P.cr, lean = P.lean, sw = P.sway || 0, kneel = !!P.kneel, arch = P.arch || 0;
  const X = lx => AX + lx, Y = ly => AY - ly;
  const shear = t => R(lean * Math.pow(1 - t, 1.25)) - (arch ? R(arch * Math.sin(t * Math.PI) * 0.8) : 0);
  const top = 30 - P.cr + (P.tiptoe || 0);   /* the shoulder line's height */
  /* BOOTS peeking from the hem (a kneeling man has none) */
  if (!kneel) { const tp = P.tiptoe || 0; for (const fx of P.feet) { rect(g, X(fx) - 2, Y(1 + tp), 5, 2, COL.boot); rect(g, X(fx) + 2, Y(1 + tp) + 1, 2, 1, COL.boot); rect(g, X(fx) - 1, Y(1 + tp), 2, 1, '#2a2434'); } }
  const rows = [];
  for (let r = 0; r < N; r++) {
    const t = N > 1 ? r / (N - 1) : 0, y = Y(top - r) ; const cx = shear(t) + (t > 0.7 ? sw * R((t - 0.7) * 5) : 0) + (kneel ? 0 : 0);
    let hw = hwOf(t); if (kneel) hw = lerp(4.6, 8.4, Math.pow(t, 0.8));
    const l = X(cx - hw) | 0, rr = X(cx + hw) | 0, wd = Math.max(2, rr - l);
    rows.push({ r, t, y, l: R(X(cx - hw)), rr: R(X(cx + hw)), cx: X(cx) });
    rect(g, R(X(cx - hw)), y, wd, 1, COL.k);
  }
  /* shading: a lit front edge (the pole's flame), a dark back, vertical folds below the cord */
  for (const q of rows) { const wdt = q.rr - q.l;
    px(g, q.rr - 1, q.y, q.t < 0.9 ? COL.kHi : COL.kHi); if (wdt > 6) px(g, q.rr - 2, q.y, '#362d46');
    rect(g, q.l, q.y, 1, 1, COL.kLo); if (wdt > 7) px(g, q.l + 1, q.y, COL.kLo);
    if (q.t > 0.5) { const f1 = q.cx - 3 - R((q.t - 0.5) * 3), f2 = q.cx + 2 + R((q.t - 0.5) * 3); if ((q.r + 1) % 5 !== 0) { px(g, f1, q.y, COL.kLo); px(g, f2, q.y, '#201a2a'); } }
  }
  /* the shoulder yoke: a lighter cape line across */
  { const q0 = rows[0], q1 = rows[1]; if (q0 && q1) { rect(g, q0.l, q0.y, q0.rr - q0.l, 1, COL.kHi); rect(g, q1.l, q1.y, 2, 1, COL.kHi); } }
  /* THE SURPLICE: waist to knee, a lace hem, a light front and a grey back */
  const s0 = Math.floor(N * 0.46), s1 = Math.floor(N * 0.8);
  for (let r = s0; r <= s1 && r < N; r++) { const q = rows[r], hwid = Math.max(2, (q.rr - q.l) + 1), l = q.l - 1;
    const hemRow = r >= s1 - 1; rect(g, l, q.y, hwid, 1, COL.w);
    rect(g, l, q.y, 2, 1, COL.wLo); rect(g, q.rr - 1, q.y, 2, 1, COL.wHi); if (!hemRow) { px(g, q.cx - 2, q.y, COL.wLo); px(g, q.cx + 2, q.y, COL.wDeep); if (r % 3 === 0) px(g, q.cx + 1, q.y, COL.wHi); }
    if (hemRow) for (let x = l; x < l + hwid; x++) if ((x + r) % 2 === 0) px(g, x, q.y, r === s1 ? COL.wHi : COL.wLo);
    if (r === s1) for (let x = l + 1; x < l + hwid; x += 2) px(g, x, q.y + 1, COL.wLo);   /* the lace scallops */
  }
  rect(g, rows[s0].l - 1, rows[s0].y, rows[s0].rr - rows[s0].l + 2, 1, COL.wDeep);
  /* THE STOLE: oxblood, gilt edged, down the middle from the neck to the knee, a fringed gilt end */
  const st0 = 1, st1 = Math.min(N - 3, s1 + 2);
  for (let r = st0; r <= st1; r++) { const q = rows[r], x = q.cx - 1 + (r > 12 ? 0 : 0), end = r > st1 - 5;
    rect(g, x, q.y, end ? 4 : 3, 1, COL.r); px(g, x, q.y, COL.rLo); if (r % 3 !== 1) { px(g, x + (end ? 3 : 2), q.y, COL.g); px(g, x, q.y, COL.gLo); } else px(g, x + 1, q.y, COL.rHi);
    if (end) { px(g, x + 1, q.y, r % 2 ? COL.g : COL.gHi); px(g, x + 2, q.y, COL.g); } }
  { const q = rows[st1]; for (let i = 0; i < 4; i++) px(g, q.cx - 1 + i, q.y + 1, i & 1 ? COL.g : COL.gLo); }
  /* THE CORD: brass, a buckle at the front, a snuffer-bell and a key ring on the left hip */
  const cr = Math.floor(N * 0.44); if (cr < N) { const q = rows[cr]; rect(g, q.l, q.y, q.rr - q.l, 1, COL.bLo); rect(g, q.l + 1, q.y, q.rr - q.l - 2, 1, COL.b); rect(g, q.rr - 4, q.y - 1, 3, 3, COL.bHi); px(g, q.rr - 3, q.y, COL.bDeep);
    const hx = q.l + 1; if (!kneel) { px(g, hx, q.y + 1, COL.bLo); px(g, hx, q.y + 2, COL.b); rect(g, hx - 1, q.y + 3, 3, 2, COL.b); px(g, hx - 1, q.y + 4, COL.bLo); px(g, hx + 1, q.y + 4, COL.bLo); px(g, hx, q.y + 5, COL.bDeep);   /* the snuffer-bell */
      px(g, hx + 3, q.y + 1, COL.b); px(g, hx + 4, q.y + 2, COL.bHi); px(g, hx + 3, q.y + 3, COL.b); px(g, hx + 2, q.y + 2, COL.bLo); } }
  /* A KNEELING MAN's robe pools on the floor */
  if (kneel) { const q = rows[N - 1]; rect(g, q.l - 3, q.y + 1, q.rr - q.l + 7, 2, COL.k); rect(g, q.l - 3, q.y + 1, q.rr - q.l + 7, 1, COL.kHi); rect(g, q.l - 1, q.y + 1, 8, 2, COL.w); for (let x = q.l - 1; x < q.l + 7; x += 2) px(g, x, q.y + 3, COL.wLo); }
  return { rows, top, N };
}
/* ---------- the head: a gaunt profile facing right, a black skullcap-hood pushed back, a clerical band; (cx, by) the head's feet-centre and the base y of the chin */
const HEAD = [
  '....aaaaa...',
  '..aaKKKKKa..',
  '.aKKkkkkKKa.',
  '.aKkkkkkkKKa',
  '.aKkkSSSSSsa',
  '.aKkSSSSSSsa',
  '.aKkSSdSSSSsa',
  '..aKSSSSSSSa',
  '..aKSSSSSSa.',
  '...aSSsSSsa.',
  '...aaSSsssa.',
  '....aSSsa...',
];
function head(g, hx, hy, P, lit) {
  const pal = { a: '#14101a', K: COL.kHi, k: COL.k, S: COL.s, s: COL.sLo, d: COL.kDeep };
  const rows = HEAD.map(r => r.padEnd(13, '.'));
  for (let y = 0; y < rows.length; y++) for (let x = 0; x < 13; x++) { const c = rows[y][x]; if (c === '.') continue; px(g, hx + x, hy + y, pal[c] || COL.s); }
  /* the face: the brow's shadow, a hollow socket with an ember in it, a long nose, a thin mouth, the cheek's hollow */
  const hurtF = P.hurtFace;
  rect(g, hx + 5, hy + 5, 5, 1, COL.sLo);                                   /* the brow */
  rect(g, hx + 7, hy + 6, 3, 2, COL.sDeep); px(g, hx + 8, hy + 6, P.dead ? '#3a2a22' : COL.flameY); px(g, hx + 9, hy + 6, P.dead ? '#2a1e18' : COL.flameO);   /* the eye, an ember */
  px(g, hx + 11, hy + 7, COL.s); px(g, hx + 12, hy + 8, COL.sLo); px(g, hx + 11, hy + 8, COL.sHi);   /* the nose */
  px(g, hx + 5, hy + 8, COL.sLo); px(g, hx + 6, hy + 9, COL.sLo);              /* the cheek's hollow */
  rect(g, hx + 8, hy + 9, hurtF ? 3 : 3, hurtF ? 2 : 1, COL.sDeep);            /* the mouth (open when he is struck) */
  if (lit) { for (let y = 5; y < 10; y++) px(g, hx + 10, hy + y, COL.sHi); px(g, hx + 9, hy + 4, COL.sHi); }   /* the pole's flame lights the front of his face */
  /* the band: white at the collar */
  rect(g, hx + 5, hy + 11, 5, 1, COL.w); px(g, hx + 5, hy + 11, COL.wLo);
}
/* ---------- the arms: a sleeve in two segments to a hand, a white cuff ---------- */
function ik(sx, sy, hx, hy, l1, l2, down = 1) {
  const dx = hx - sx, dy = hy - sy; let d = Math.hypot(dx, dy); const reach = l1 + l2 - 0.5; if (d > reach) { const k = reach / d; hx = sx + dx * k; hy = sy + dy * k; d = reach; }
  if (d < 1) d = 1; const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), mx = sx + (dx / d) * a, my = sy + (dy / d) * a;
  const ex = mx + (-dy / d) * h * down, ey = my + (dx / d) * h * down; return [ex, ey, hx, hy]; }
function arm(g, sx, sy, hx, hy, back, down = 1) {
  const [ex, ey, fx, fy] = ik(sx, sy, hx, hy, 8, 8, ex_dir(sx, sy, hx, hy, down)); const dark = back ? '#1c1626' : COL.k, hi = back ? '#2a2234' : COL.kHi;
  line(g, sx, sy, ex, ey, dark, 3); line(g, sx, sy, ex, ey - 0, hi, 1); line(g, ex, ey, fx, fy, dark, 3); line(g, ex, ey - 1, fx, fy - 1, hi, 1);
  rect(g, R(fx) - 1, R(fy) - 1, 3, 3, COL.w); px(g, R(fx) - 1, R(fy) + 1, COL.wLo);   /* the cuff */
  rect(g, R(fx), R(fy) - 1, 2, 2, back ? COL.sLo : COL.s);                          /* the hand */
  return [fx, fy]; }
const ex_dir = (sx, sy, hx, hy, d) => d;
/* ---------- the pole ---------- */
export const HALF = 28;
export function poleEnds(P, p) { const c = Math.cos(p.a), s = Math.sin(p.a), cx = AX + p.c[0], cy = AY - p.c[1];
  const at = u => [cx + u * c, cy + u * s]; const f = p.lead === 'flame' ? 1 : -1; return { at, flame: at(f * HALF), hook: at(-f * HALF), dir: p.lead === 'flame' ? 1 : -1, c, s }; }
function pole(g, p, P) {
  const E = poleEnds(P, p), c = E.c, s = E.s, [ax, ay] = E.at(-HALF), [bx, by] = E.at(HALF);
  line(g, ax, ay + 1, bx, by + 1, COL.bLo, 1); line(g, ax, ay, bx, by, COL.b, 1); line(g, ax, ay - 1, bx, by - 1, COL.bHi, 1);
  for (const u of [-HALF + 6, -6, 6, HALF - 6]) { const [qx, qy] = E.at(u); rect(g, R(qx) - 1, R(qy) - 1, 3, 3, COL.bHi); px(g, R(qx), R(qy) + 1, COL.bDeep); }   /* the collars */
  const rot = (u, v) => [R(AX + p.c[0] + u * c - v * s), R(AY - p.c[1] + u * s + v * c)];
  /* the hook end (the snuffer): a J at the tip, a little bell-cone hooked back */
  { const sg = E.dir === 1 ? -1 : 1, hu = sg * HALF;    /* hook sits at the end that is NOT the flame */
    const pts = [[0, 0], [sg * 2, 0], [sg * 3, 1], [sg * 3, 3], [sg * 2, 5], [sg * 0, 6], [sg * -1, 5], [sg * -1, 4]];
    for (const [u, v] of pts) { const [qx, qy] = rot(hu + u, v); rect(g, qx, qy, 2, 2, COL.bHi); } for (const [u, v] of pts.slice(2, 6)) { const [qx, qy] = rot(hu + u, v); px(g, qx + 1, qy + 1, COL.bLo); } }
  /* the lamp-cup (the flame end): a little brass bowl with a rim; a pilot flame is laid over it live */
  { const sg = E.dir === 1 ? 1 : -1, fu = sg * HALF;
    for (let du = 0; du < 5; du++) { const w = du < 2 ? 1 : du < 4 ? 2 : 3; for (let dv = -w; dv <= w; dv++) { const [qx, qy] = rot(fu + sg * (du - 1), dv); px(g, qx, qy, du === 4 ? COL.bHi : dv < 0 ? COL.bHi : dv > 0 ? COL.bLo : COL.b); } }
    const [rx, ry] = rot(fu + sg * 4, 0); rect(g, rx - 1, ry - 1, 3, 3, P.dead ? '#3a2e22' : COL.ember); if (!P.dead) px(g, rx, ry - 1, COL.flameO); }
}
/* ---------- bake a pose ---------- */
export function bakePose(key) {
  return once('pose' + key, () => {
    const P = POSES[key]; const [c, g] = canvas(W, H), E = poleEnds(P, P.pole);
    const bd = body(g, P);
    const top = bd.top, shearTop = R(P.lean), sx0 = AX + shearTop; const shY = AY - top;
    const pl = P.pole, hands = p => { const [x, y] = E.at(p); return [x, y]; };
    /* the back arm (behind the body) first: it was drawn after the body would hide it - so redraw order: back arm, then re-lay the body? the arm is drawn BEFORE by a small trick: draw into the same canvas, behind via 'destination-over' */
    const bk = canvas(W, H); const gb = bk[1];
    const handB = P.free ? [AX + P.free[0], AY - P.free[1]] : P.hand ? [AX + P.hand[0], AY - P.hand[1]] : hands(pl.h[0]);
    const handF = hands(pl.h[1]);
    arm(gb, sx0 - 3, shY + 2, handB[0], handB[1], true, 1);
    const og = g.globalCompositeOperation; g.globalCompositeOperation = 'destination-over'; g.drawImage(bk[0], 0, 0); g.globalCompositeOperation = og;
    /* the head */
    const hx = AX + shearTop + P.head[0] - 6 + (P.bow ? 2 : 0), hy = shY - 10 - P.head[1] * -1 + 0 - (P.cr > 10 ? 0 : 0) + (P.head[1] < 0 ? -P.head[1] : -P.head[1]) * 0;
    head(g, hx, shY - 11 - P.head[1] + (P.head[1] < 0 ? 0 : 0), P, !P.dead && !P.holy);
    pole(g, pl, P);
    arm(g, sx0 + 3, shY + 2, handF[0], handF[1], false, 1);
    if (!P.oneHand) { /* the rear hand on the pole */ }
    outline(c, '#14101a');
    const f = poleEnds(P, pl).flame, h = poleEnds(P, pl).hook;
    return { c, cL: flipX(c), cW: whiten(c), cWL: flipX(whiten(c)), flame: P.dead ? null : [f[0], f[1]], hook: [h[0], h[1]], P, ends: E };
  });
}
/* ---------- the live parts ---------- */
const flameCol = (holy, k) => holy ? (k === 0 ? COL.flameW : k === 1 ? '#fffbe8' : COL.flameY) : (k === 0 ? COL.flameY : k === 1 ? COL.flameO : '#e0602c');
export function drawFlame(g, x, y, size, time, holy = false, seed = 0) {
  const n = Math.sin(time * 13 + seed) + Math.sin(time * 8.3 + seed * 1.7), h = Math.max(2, R(size + n * size * 0.22)), w = Math.max(2, R(size * 0.55));
  for (let i = 0; i < h; i++) { const k = i / h, ww = Math.max(1, R(w * (1 - Math.pow(k, 1.4)))), lean = R(Math.sin(time * 9 + seed + i * 0.4) * k * 1.4); const col = k < 0.3 ? flameCol(holy, 0) : k < 0.62 ? flameCol(holy, 1) : flameCol(holy, 2);
    rect(g, R(x) - (ww >> 1) + lean, R(y) - i, ww, 1, col); }
  px(g, R(x), R(y) + 0, COL.flameW);
}
/* the pose a Deacon in this mode wears, its flame and where the live parts go; (x, y) his feet on screen; f his facing */
export function drawDeacon(g, e, x, y, f, time, flash) {
  const key = e.pose || poseKey(e, time), B = bakePose(key); f = f < 0 ? -1 : 1;
  const spr = f === 1 ? (flash ? B.cW : B.c) : (flash ? B.cWL : B.cL);
  const bob = key === 'walkA' || key === 'walkB' ? 0 : key === 'guard' ? R(Math.sin(time * 2.2 + (e.x || 0)) * 0.5) : 0;
  g.drawImage(spr, R(x) - (f === 1 ? AX : W - AX), R(y) - AY + bob);
  const at = p => [R(x) + f * (p[0] - AX), R(y) - AY + p[1] + bob];
  const holy = !!B.P.holy;
  if (B.flame && !flash) { const [fx, fy] = at(B.flame); const big = e.mode === 'arc' ? 8 : e.mode === 'arcTell' ? 9 : e.mode === 'kindleTell' ? 8 : 6;
    drawFlame(g, fx, fy - 2, big, time, holy, (e.x || 0) * 0.1);
    if (e.mode === 'kindleTell') for (let i = 0; i < 6; i++) { const t = (time * 1.4 + i / 6) % 1; g.globalAlpha = 0.9 * (1 - t); px(g, fx - 6 + ((i * 7) % 13), fy - 6 - R(t * 20), i & 1 ? COL.flameY : COL.flameW); g.globalAlpha = 1; } }
  else if (B.P.dead && !flash && key === 'grope') { const [fx, fy] = at(B.ends ? B.ends.at((B.P.pole.lead === 'flame' ? 1 : -1) * HALF) : [0, 0]); for (let i = 0; i < 3; i++) { const t = (time * 0.9 + i / 3) % 1; g.globalAlpha = 0.5 * (1 - t); px(g, fx + R(Math.sin(t * 7 + i) * 2), fy - 3 - R(t * 14), '#9a9ab0'); g.globalAlpha = 1; } }   /* the cup, dead, smokes */
  return { key, at, B };
}
/* THE SNUFFER CHAIN: thrown from the hook's tip out to (tx, ty); `taut` when it has caught. Links alternate brass and dark; the hook rides the end */
export function drawChain(g, x0, y0, x1, y1, time, taut) {
  const n = Math.max(2, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 3)), sag = taut ? 0 : 6;
  let lx = x0, ly = y0;
  for (let i = 1; i <= n; i++) { const t = i / n, xx = x0 + (x1 - x0) * t, yy = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag + (taut ? 0 : Math.sin(time * 18 + i) * 1);
    rect(g, R(xx), R(yy), 2, 1, i & 1 ? COL.bHi : COL.bLo); rect(g, R(xx), R(yy) + 1, 1, 1, COL.bDeep); lx = xx; ly = yy; }
  rect(g, R(x1) - 1, R(y1) - 2, 3, 5, COL.bHi); px(g, R(x1) + 1, R(y1) + 3, COL.bHi); px(g, R(x1), R(y1) + 4, COL.bHi); px(g, R(x1) - 1, R(y1) + 3, COL.bLo);   /* the hook */
}
/* THE FLAME ARC's holy fire: the patch's tongues on the floor (shared look with the troughs: white-gold, a cherry bed) */
export function drawArcPatch(g, x, floorY, k, time, seed = 0) {
  const w = 8, n = Math.sin(time * 11 + seed * 0.7) + Math.sin(time * 6 + seed * 1.3);
  g.globalAlpha = Math.min(1, 0.4 + k * 0.7);
  rect(g, R(x) - w / 2, R(floorY) - 2, w, 2, '#7a2a1a'); rect(g, R(x) - w / 2 + 1, R(floorY) - 2, w - 2, 1, '#ff9a3c');
  for (let i = 0; i < 3; i++) { const h = R((6 + 6 * k) + 3 * Math.sin(time * 10 + seed + i * 2.1) + n), xx = R(x) - 3 + i * 3; rect(g, xx, R(floorY) - 2 - h, 2, h, i === 1 ? COL.flameW : COL.flameY); rect(g, xx, R(floorY) - 2 - Math.max(1, h >> 1), 2, Math.max(1, h >> 1), COL.flameW); px(g, xx, R(floorY) - 3 - h, COL.flameO); }
  g.globalAlpha = 1;
}
/* HIS LIGHT BAR: a brass-framed gauge with a lamp's flame at its head; five tick marks; down-flash and up-flash colours come from the hands */
export function drawLightBar(g, x, by, k, mode, time) {
  const w = 36, l = R(x) - w / 2;
  rect(g, l - 7, by - 4, 8, 9, COL.bDeep); rect(g, l - 6, by - 3, 6, 7, '#1b1626'); px(g, l - 4, by + 2, COL.b); rect(g, l - 5, by + 2, 4, 2, COL.b); rect(g, l - 3, by + 3, 1, 1, COL.bLo);
  if (k > 0.04) drawFlame(g, l - 3, by + 1, 3 + R(k * 3), time, false, 1);
  rect(g, l - 1, by - 2, w + 2, 6, COL.bDeep); rect(g, l, by - 1, w, 4, '#1b1626'); rect(g, l - 1, by - 2, w + 2, 1, COL.bLo);
  const fill = R(w * Math.max(0, Math.min(1, k))); const col = mode === 'down' ? '#8a6a30' : mode === 'up' ? COL.flameW : COL.flameY;
  rect(g, l, by, fill, 2, col); rect(g, l, by, fill, 1, mode === 'up' ? '#ffffff' : COL.gHi); if (fill > 0) rect(g, l, by + 2, fill, 1, COL.flameO);
  for (let i = 1; i < 5; i++) { rect(g, l + R(w * i / 5), by - 1, 1, 4, COL.bDeep); }
}
/* THE BESTIARY CARD: the guard, its pole's flame flickering through two bakes (the card cycles frames, so two quiet ones and a lifted pole between) */
export function bakeCard(canvasFn, flipXfn, whitenFn) {
  const keys = ['guard', 'walkA', 'guard', 'walkB'];
  const fr = keys.map((k, i) => { const B = bakePose(k); const [c, g] = canvasFn(88, 70); g.drawImage(B.c, -8, -24);
    if (B.flame) drawFlame(g, B.flame[0] - 8, B.flame[1] - 24 - 2, 6, i * 0.31, false, 0); return c; });
  return { R: fr, L: fr.map(flipXfn), white: { R: fr.map(whitenFn), L: fr.map(c => flipXfn(whitenFn(c))) }, ax: AX - 8, ay: AY - 24, w: 14, h: 40 };
}
export function sheetItems() { return Object.keys(POSES).map(k => bakePose(k).c); }
