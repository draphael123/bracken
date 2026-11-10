// src/redraw/ty_art.js - THE TOURNEY's ART (claude/tourneyart; the greybox's rects are gone). Pixel art drawn in code on px.js, no files:
//   1 THE BARDED CHARGER (hero's bay in blue and white, the Champion's ivory in blue and gold plate, the horse archer's unarmoured grey) in a stand, walk x4, gallop x4
//     and rear frame each, baked once (outlined) and flipped for facing left; and THE MOUNTED HERO's seat: the caparison patch, saddle flap and stirrup boot laid over the hero's
//     own legs so he sits the horse (drawRiderOver), and the lance (couched / lowering / upright / tired) with its vamplate and fluttering pennon (drawLance).
//   2 THE CHAMPION: the great-helmed rider (baked torso, steel arm, kite shield with the GOLD BOSS), mounted on the ivory charger, and on foot (flail ball and chain, shield,
//     horn); his squire; THE HORSE ARCHER (rider + recurve bow, drawn / loosed, mounted and on foot).
//   3 THE SET DRESSING: pavilions and tents, the pie stall, the stable loft, the royal box, the crow's nest, hurdles, rings on posts, straw targets, quintains (shield, sandbag arm),
//     the tilt rail, the lists fence, the crowd on the stand's tiers, heraldic banner standards.
// Everything here is rect-based (fillRect) so tools/ty-art-sheet.mjs renders it in plain node (tools/node-canvas.mjs, no browser).
import { canvas, rect, line, ellipse, circle, fillPoly, flipX, outline, shade, mulberry } from '../px.js';

const R = Math.round;
export const PAL = { steel: '#c8ccd4', steelD: '#8a919c', steelDD: '#5a606c', gold: '#ffd36b', goldD: '#c8962e', blue: '#2a4ab0', blueD: '#1a2e78', blueL: '#4a6ad8', cream: '#f3ecd8', creamD: '#cfc4a8', red: '#d84a4a', redD: '#8a2a2a', ink: '#1b1626', purple: '#6a3a8a', purpleD: '#4a2468', wood: '#8a6a4a', woodD: '#5a3a2a', hay: '#d8b858', hayD: '#a8862e', green: '#4a7a3a', greenD: '#2e5226' };
const P = PAL;
/* a two-pixel-wide line (px.line only thickens downward) */
const tline = (g, x0, y0, x1, y1, c, w = 2) => { for (let k = 0; k < w; k++) line(g, x0 + k, y0, x1 + k, y1, c, 1); };
const cache = new Map(); const memo = (key, fn) => { let v = cache.get(key); if (!v) { v = fn(); cache.set(key, v); } return v; };
const flipped = c => { const f = flipX(c); return f; };

/* ============================================================ 1. THE HORSE */
const HORSE = {
  hero: { c: '#9a6238', d: '#6a3e22', l: '#c08452', m: '#2a1a14', sock: null, cloth: P.blue, clothD: P.blueD, trim: P.cream, gem: P.gold, bard: 'light', plume: P.red },
  champ: { c: '#ece6d6', d: '#b8b09c', l: '#ffffff', m: '#d8d0bc', sock: null, cloth: P.blue, clothD: P.blueD, trim: P.gold, gem: P.gold, bard: 'full', plume: P.gold },
  archer: { c: '#9aa0a8', d: '#62686f', l: '#c4c9cf', m: '#3a3e44', sock: '#3a3e44', cloth: '#2a8a6a', clothD: '#1c6048', trim: P.cream, gem: null, bard: 'none' },
};
const CW = 48, CH = 34, GY = 32;   /* the cell: feet on row 31, centre column 21 (the horse faces right) */
const HX = 21;
function legSet(mode, k) {
  const ph = k / 4;   /* the four legs: [hipX, hipY, far?, fore?, phase offset] */
  const base = [[12, 23, 1, 0, 0.5], [26, 23, 1, 1, 0], [11, 23, 0, 0, 0], [27, 23, 0, 1, 0.5]];
  return base.map(([hx, hy, far, fore, off]) => {
    if (mode === 'stand') return { hx, hy, far, fore, s: far ? -0.3 : 0.2, l: 0 };
    if (mode === 'rear') return fore ? { hx, hy, far, fore, s: far ? 1.2 : 0.8, l: 1, fold: 1 } : { hx, hy, far, fore, s: far ? -0.5 : -0.2, l: 0 };
    const p = ph + (mode === 'gallop' ? (fore ? 0 : 0.3) + (far ? 0.08 : 0) : off), a = Math.cos(p * Math.PI * 2), l = Math.max(0, Math.sin(p * Math.PI * 2));
    return { hx, hy, far, fore, s: a * (mode === 'gallop' ? 1.5 : 0.9), l: l * (mode === 'gallop' ? 0.9 : 0.6) };
  });
}
function drawHorseCell(g, spec, mode, k) {
  const gallop = mode === 'gallop', rear = mode === 'rear', bob = gallop ? (k % 2 ? 0 : -1) : mode === 'walk' ? (k % 2 ? 0 : 0) : 0, rise = rear ? 7 : 0, legs = legSet(mode, k);
  const leg = (L, col) => { const SW = gallop ? 6 : 4, fx = R(L.hx + L.s * SW), fy = R(GY - 1 - L.l * (gallop ? 4 : 3) - (L.fold ? 9 : 0)), kx = R((L.hx + fx) / 2 + (L.fore ? 1.5 : -1.5) * (L.l > 0.2 || L.fold ? 1 : 0.3)), ky = R((L.hy + bob - rise * (L.fore ? 1 : 0) + fy) / 2);
    const hy = L.hy + bob - (L.fore ? rise : 0); tline(g, L.hx, hy, kx, ky, col, 2); tline(g, kx, ky, fx, fy - 1, col, 2); rect(g, fx, fy - 1, 3, 2, '#2a2024'); if (spec.sock) rect(g, fx, fy - 3, 2, 2, spec.sock); };
  for (const L of legs) if (L.far) leg(L, spec.d);
  /* the tail and the quarters, the body, the chest */
  const tailLift = gallop ? 3 : 0; tline(g, 9, 17 + bob, 6, 20 + bob - tailLift, spec.m, 2); tline(g, 6, 20 + bob - tailLift, 4, 27 + bob - tailLift * 2, spec.m, 2);
  ellipse(g, 19, 20 + bob, 11, 5.2, spec.d); ellipse(g, 19, 19 + bob, 11, 4.5, spec.c); ellipse(g, 12, 19 + bob, 5, 5.2, spec.c); ellipse(g, 27, 18 + bob - rise * 0.3, 5, 5, spec.c); ellipse(g, 18, 16 + bob, 8, 1.5, spec.l);
  /* the neck (up and forward), the mane along its back, the head */
  const nx = 27, ny = 15 + bob - rise * 0.5, hx = 35, hy = 6 + bob - rise;
  tline(g, nx, ny, hx - 1, hy + 3, spec.c, 4); tline(g, nx + 1, ny + 3, hx, hy + 6, spec.c, 3); tline(g, nx - 1, ny - 1, hx - 3, hy, spec.m, 3); tline(g, nx - 2, ny + 1, hx - 4, hy + 2, spec.m, 2);
  fillPoly(g, [[hx - 3, hy - 1], [hx + 1, hy - 1], [hx + 7, hy + 5], [hx + 7, hy + 8], [hx + 4, hy + 8], [hx - 2, hy + 4]], spec.c);
  rect(g, hx - 2, hy - 3, 2, 3, spec.d); rect(g, hx + 5, hy + 5, 2, 2, spec.d); rect(g, hx + 1, hy + 1, 2, 2, '#ffffff'); rect(g, hx + 2, hy + 1, 1, 2, '#1a1210');   /* ear, nose, eye */
  /* the near legs over the body */
  for (const L of legs) if (!L.far) leg(L, spec.c);
  /* THE BARDING */
  const cy0 = 15 + bob, cl = spec.cloth;
  if (spec.bard !== 'none') {
    const hem = spec.bard === 'full' ? 27 : 24;
    rect(g, 10, cy0, 18, hem - 15 + bob, cl); for (let x = 10; x < 28; x += 3) rect(g, x, hem + bob, 2, 2, cl);   /* the caparison, a scalloped hem */
    rect(g, 10, cy0, 18, 2, spec.trim); rect(g, 10, hem - 1 + bob, 18, 1, spec.trim); rect(g, 10, cy0 + 2, 18, 1, spec.clothD);
    for (let x = 12; x < 28; x += 6) rect(g, x, cy0 + 3, 1, hem - 18, spec.clothD);
    if (spec.gem) { fillPoly(g, [[19, cy0 + 4], [22, cy0 + 7], [19, cy0 + 10], [16, cy0 + 7]], spec.gem); rect(g, 19, cy0 + 6, 1, 2, spec.clothD); }
    rect(g, 16, cy0 - 2, 8, 3, '#5a3a22'); rect(g, 16, cy0 - 3, 8, 1, '#8a5a32'); rect(g, 22, cy0 - 4, 2, 3, '#5a3a22');   /* the saddle: a pad and the cantle */
    /* the peytral on the chest and the chanfron on the face, the crinet down the neck */
    ellipse(g, 29, 20 + bob - rise * 0.3, 3, 4.5, spec.bard === 'full' ? P.steel : cl); rect(g, 28, 17 + bob - rise * 0.3, 2, 6, spec.trim); if (spec.bard === 'full') rect(g, 29, 19 + bob - rise * 0.3, 2, 2, P.goldD);
    line(g, hx - 1, hy, hx + 6, hy + 6, spec.bard === 'full' ? P.steel : P.steelD, 1); rect(g, hx + 1, hy + 2, 5, 2, spec.bard === 'full' ? P.steel : P.steelD); rect(g, hx + 3, hy - 3, 1, 3, P.gold);
    rect(g, hx - 3, hy - 4, 2, 3, spec.plume); rect(g, hx - 4, hy - 6, 2, 3, spec.plume);
    if (spec.bard === 'full') { for (let i = 0; i < 3; i++) rect(g, nx + 1 + i * 2, ny - 3 - i * 2 + 1, 3, 2, P.steel); rect(g, 6, cy0 + 1, 4, 5, P.steel); rect(g, 6, cy0 + 5, 4, 1, P.goldD); for (let x = 10; x < 28; x += 3) rect(g, x, hem + 2 + bob, 1, 2, P.gold); }
    else for (let i = 0; i < 2; i++) rect(g, nx + 2 + i * 2, ny - 2 - i * 2, 2, 2, P.steelD);
  } else { rect(g, 14, cy0 - 1, 12, 4, spec.cloth); rect(g, 14, cy0 - 1, 12, 1, spec.trim); rect(g, 17, cy0 - 2, 6, 1, '#5a3a22'); rect(g, hx + 2, hy + 2, 3, 1, '#5a3a22'); }   /* the archer's horse: a saddle blanket and a bridle */
  if (rear) { /* a hoof flash */ rect(g, 36, 5, 1, 1, P.cream); }
}
/* the horse sprite set: { R: {stand, walk:[4], gallop:[4], rear}, L: {...}, ax, ay } - feet-centre anchor (ax = 21, ay = 31) */
export function horseSet(kind) {
  return memo('horse:' + kind, () => {
    const spec = HORSE[kind] || HORSE.hero, one = (mode, k) => { const [c, g] = canvas(CW, CH); drawHorseCell(g, spec, mode, k); return outline(c); };
    const R_ = { stand: one('stand', 0), walk: [0, 1, 2, 3].map(k => one('walk', k)), gallop: [0, 1, 2, 3].map(k => one('gallop', k)), rear: one('rear', 0) };
    const L_ = { stand: flipped(R_.stand), walk: R_.walk.map(flipped), gallop: R_.gallop.map(flipped), rear: flipped(R_.rear) };
    return { R: R_, L: L_, ax: HX, ay: 31, w: CW, h: CH };
  });
}
/* draw a horse with its feet at (x, y), facing f; v = pace in px/s; mode 'rear' for a balk / wheel */
export function drawHorse(g, kind, x, y, f, v, time, mode) {
  const S = horseSet(kind), set = f < 0 ? S.L : S.R, a = Math.abs(v || 0);
  let im, ax = S.ax; if (f < 0) ax = S.w - 1 - S.ax;
  if (mode === 'rear') im = set.rear; else if (a < 18) im = set.stand; else if (a <= 150) im = set.walk[Math.floor(time * (6 + a / 18)) & 3]; else im = set.gallop[Math.floor(time * (11 + a / 40)) & 3];
  g.drawImage(im, R(x) - ax, R(y) - S.ay);
}
/* THE HERO'S SEAT: the cloth patch, saddle flap and a stirrup boot over the hero's own legs (drawn after him) */
export function drawRiderOver(g, kind, x, y, f, v, time) {
  const S = HORSE[kind] || HORSE.hero, a = Math.abs(v || 0), bob = a > 150 ? (Math.floor(time * (11 + a / 40)) & 1 ? 0 : -1) : 0, X = R(x) - 7, Y = R(y) - 17 + bob;
  rect(g, X, Y, 14, 10, S.cloth); rect(g, X, Y, 14, 1, S.trim); rect(g, X, Y + 9, 14, 1, S.trim); for (let i = 0; i < 14; i += 3) rect(g, X + i, Y + 10, 2, 1, S.cloth);
  rect(g, X + 2, Y + 1, 1, 8, S.clothD); rect(g, X + 11, Y + 1, 1, 8, S.clothD);
  rect(g, R(x) - 4, Y + 1, 8, 2, '#5a3a22'); rect(g, R(x) - 4, Y + 1, 8, 1, '#8a5a32');   /* the saddle flap */
  const bx = R(x) + (f > 0 ? 1 : -4); rect(g, bx, Y + 3, 3, 8, '#5a4636'); rect(g, bx + (f > 0 ? 1 : -1), Y + 10, 4, 2, '#2a2024'); rect(g, bx - 1, Y + 11, 6, 1, P.steelD);   /* the boot, the stirrup iron */
}

/* ============================================================ the lance */
/* a lance from grip (x0, y0) along angle ang (rad, up from level) facing f: spiral-striped, vamplate at the grip, steel head, a fluttering pennon */
export function drawLance(g, x0, y0, ang, len, f, o = {}) {
  const c1 = o.c1 || P.red, c2 = o.c2 || P.cream, ca = Math.cos(ang) * f, sa = -Math.sin(ang), n = Math.round(len);
  for (let i = 0; i < n; i++) { const x = R(x0 + ca * i), y = R(y0 + sa * i); rect(g, x, y, 2, 2, (Math.floor(i / 4) & 1) ? c2 : c1); }
  const tx = R(x0 + ca * n), ty = R(y0 + sa * n), hx = R(x0 + ca * (n + 4)), hy = R(y0 + sa * (n + 4));
  tline(g, tx, ty, hx, hy, o.hot ? P.gold : P.steel, 2); rect(g, hx, hy, 2, 2, o.hot ? P.cream : P.steelD);
  const vx = R(x0 + ca * 3), vy = R(y0 + sa * 3); fillPoly(g, [[vx - 3 * f, vy - 3], [vx + 1 * f, vy + 1], [vx - 3 * f, vy + 5]], P.steelD); rect(g, vx - 1, vy, 2, 2, P.gold);   /* the vamplate: a steel cone with a gold stud */
  if (o.pennon !== false) { const px = R(x0 + ca * (n - 8)), py = R(y0 + sa * (n - 8)), fl = Math.sin((o.time || 0) * 14) * 1.5; fillPoly(g, [[px, py], [px - f * (8 + fl), py + 2 + fl * 0.4], [px - f * 11, py + 4], [px - f * (8 + fl), py + 5 + fl * 0.4], [px, py + 4]], o.pen || c1); rect(g, px - f * 3, py + 1, 2, 2, c2); }
}

/* ============================================================ 2. THE CHAMPION, HIS SQUIRE, THE HORSE ARCHER */
function bakeTorso(kind) {   /* the great-helmed rider, facing right, anchored at the hip centre (col 10, bottom row) */
  const [c, g] = canvas(22, 40), cx = 10, by = 37, steel = P.steel;
  const champ = kind === 'champ', tab = champ ? P.blue : '#4a7a3a', trim = champ ? P.gold : P.cream;
  rect(g, cx - 5, by - 14, 11, 14, tab); rect(g, cx - 6, by - 15, 13, 4, steel); rect(g, cx - 5, by - 11, 11, 1, P.steelDD);   /* tabard, the breastplate's skirt */
  for (let i = 0; i < 9; i++) rect(g, cx - 4 + i, by - 13 + Math.floor(i * 0.9), 2, 2, trim);                                  /* the gold bend */
  rect(g, cx - 5, by - 2, 11, 2, P.goldD); rect(g, cx - 1, by - 3, 3, 3, P.gold);                                              /* belt and buckle */
  ellipse(g, cx - 5, by - 16, 3.2, 3, steel); ellipse(g, cx + 5, by - 16, 3.2, 3, P.steelD); rect(g, cx - 7, by - 15, 3, 1, P.steelDD);   /* pauldrons */
  rect(g, cx - 3, by - 20, 7, 4, P.steelD);                                                                                     /* gorget */
  rect(g, cx - 4, by - 31, 9, 11, steel); rect(g, cx - 5, by - 29, 11, 7, steel); rect(g, cx - 3, by - 32, 7, 2, steel); rect(g, cx - 5, by - 24, 11, 1, P.steelD);   /* the great helm */
  rect(g, cx - 1, by - 29, 6, 1, '#101018'); rect(g, cx + 1, by - 27, 4, 1, '#101018'); rect(g, cx + 1, by - 25, 1, 1, '#101018'); rect(g, cx + 3, by - 25, 1, 1, '#101018');   /* the visor slit and the breaths */
  rect(g, cx - 4, by - 31, 2, 7, P.steelD); rect(g, cx + 3, by - 31, 2, 3, '#ffffff');                                          /* the helm's shade and light */
  if (champ) { rect(g, cx - 1, by - 33, 3, 2, P.gold); rect(g, cx, by - 31, 1, 4, P.goldD); }                                   /* the gold cross on its crown */
  /* the plume streaming back */
  const pl = champ ? P.red : '#e8b04a'; rect(g, cx - 2, by - 35, 3, 3, pl); rect(g, cx - 5, by - 36, 4, 3, pl); rect(g, cx - 8, by - 35, 4, 3, shade(pl, -0.25)); rect(g, cx - 10, by - 33, 3, 3, shade(pl, -0.25));
  return outline(c);
}
function bakeLegs(kind, k) {   /* on foot: greaves and sabatons, anchored at the feet (col 10, bottom row), 7 rows tall */
  const [c, g] = canvas(22, 9), steel = P.steel; const a = k === 1 ? 2 : k === 2 ? -2 : 0;
  rect(g, 5 - Math.max(0, -a), 0, 4, 6, steel); rect(g, 12 + Math.max(0, a), 0, 4, 6, P.steelD); rect(g, 4 - Math.max(0, -a), 6, 7, 2, P.steelDD); rect(g, 12 + Math.max(0, a), 6, 7, 2, P.steelDD); rect(g, 5, 2, 4, 1, P.goldD);
  return outline(c);
}
const shieldSet = () => memo('shield', () => { const [c, g] = canvas(16, 24); fillPoly(g, [[1, 1], [14, 1], [14, 12], [8, 22], [1, 12]].map(([x, y]) => [x + 0.5, y + 0.5]), P.blue); rect(g, 1, 1, 13, 2, P.steel); rect(g, 7, 3, 2, 17, P.gold); rect(g, 2, 8, 12, 2, P.gold); rect(g, 2, 3, 2, 8, P.blueL);
  rect(g, 6, 7, 4, 4, P.goldD); rect(g, 7, 8, 2, 2, P.cream); return outline(c); });
const flailBall = () => memo('flail', () => { const [c, g] = canvas(13, 13); circle(g, 6.5, 6.5, 4.5, '#4a4a54'); circle(g, 5.5, 5.5, 2, '#7a7a86'); for (const [x, y] of [[6, 0], [6, 11], [0, 6], [11, 6], [2, 2], [10, 2], [2, 10], [10, 10]]) rect(g, x, y, 2, 2, P.steel); return outline(c); });
const hornSpr = () => memo('horn', () => { const [c, g] = canvas(10, 8); line(g, 1, 6, 7, 2, P.gold, 2); rect(g, 7, 0, 3, 5, P.goldD); rect(g, 8, 1, 1, 3, '#2a2024'); return outline(c); });
/* the whole Champion. e: { x, y, face, vx, mode, lanceDown }; POSE = the hands file's table; (cx, cy) camera. Feet at (e.x, e.y) */
export function drawChampion(g, e, cx, cy, time, POSE) {
  const m = e.mode === 'pass' && e.lanceDown ? 'passDown' : e.mode, p = POSE[m] || POSE.walk, f = e.face || 1, ex = R(e.x - cx), ey = R(e.y - cy);
  if (p.flat) { drawFallen(g, ex, ey, f); return; }
  const up = p.mounted ? 14 : 0, lean = p.lean * f, by = ey - up, hip = by - 6, tors = memo('chT', () => ({ R: bakeTorso('champ') })), tr = tors.R;
  if (p.mounted) { drawHorse(g, 'champ', ex, ey, f, e.vx || 0, time, m === 'wheel' ? 'rear' : null); }
  else { const lk = Math.abs(e.vx || 0) > 20 ? 1 + (Math.floor(time * 8) & 1) : 0, lg = memo('chL' + lk, () => ({ R: bakeLegs('champ', lk) })).R; g.drawImage(f < 0 ? flipped(lg) : lg, ex - 10, ey - 8); }
  const tx = ex + lean * 0.3 + (f < 0 ? 1 : 0); g.drawImage(f < 0 ? memo('chTL', () => flipped(tr)) : tr, R(tx) - 10, hip - 37);
  if (p.mounted) { rect(g, ex - 2 * f - 2, hip, 5, 10, P.steel); rect(g, ex - 2 * f - 2, hip + 9, 7, 2, P.steelDD); rect(g, ex + 2 * f, hip + 10, 3, 1, P.gold); }   /* the greave hangs over the barding, a spur */
  const sx = ex + p.shield[0] * f, sy = by + p.shield[1], sh = shieldSet(); g.drawImage(f < 0 ? memo('shL', () => flipped(sh)) : sh, R(sx) - 8, R(sy) - 12);
  const glint = p.boss ? 0.5 + 0.5 * Math.sin(time * 30) : 0; if (glint > 0.1) { g.globalAlpha = glint; rect(g, R(sx) - 3, R(sy) - 4, 6, 6, '#fff3b0'); g.globalAlpha = 1; }   /* THE GOLD BOSS glints: the told lance */
  const hx = R(ex + p.hand[0] * f), hy = R(by + p.hand[1]), shx = R(tx + 3 * f), shy = hip - 21;
  tline(g, shx, shy, hx, hy, P.steelD, 2); rect(g, hx - 1, hy - 1, 3, 3, P.steel); rect(g, hx, hy, 1, 1, P.goldD);                                                  /* the sword arm */
  if (p.lance >= 0) drawLance(g, hx, hy, p.lance * Math.PI / 2, 46, f, { c1: P.blue, c2: P.gold, hot: p.lance === 0, time, pen: P.red });
  else if (p.stub) { rect(g, hx, hy - 1, 10 * f, 3, '#8a7a5a'); rect(g, hx + 10 * f, hy - 2, 2 * f, 5, '#5a4a32'); }                                                      /* a lance's splintered butt */
  if (p.flail) { const fx = R(ex + p.flail[0] * f), fy = R(by + p.flail[1]), n = 7; for (let i = 1; i < n; i++) rect(g, R(hx + (fx - hx) * i / n), R(hy + (fy - hy) * i / n) + (i & 1), 2, 2, i & 1 ? P.steelD : P.steelDD);
    const b = flailBall(); g.drawImage(b, fx - 6, fy - 6); }
  if (p.horn) g.drawImage(f < 0 ? flipped(hornSpr()) : hornSpr(), R(ex + 6 * f) - 5, by - 36);
}
function drawFallen(g, ex, ey, f) {   /* UNHORSED: a heap of plate, the helm rolled off, the shield beside, the lance snapped */
  rect(g, ex - 16, ey - 9, 30, 9, P.steel); rect(g, ex - 16, ey - 3, 30, 3, P.steelD); rect(g, ex - 6, ey - 7, 12, 4, P.blue); rect(g, ex - 2, ey - 6, 4, 2, P.gold);
  rect(g, ex + f * 13 - 3, ey - 11, 8, 9, P.steel); rect(g, ex + f * 13, ey - 8, 5, 1, '#101018'); rect(g, ex + f * 14, ey - 15, 2, 5, P.red);
  rect(g, ex - f * 14, ey - 4, 2, 4, P.steelDD); rect(g, ex - f * 20, ey - 2, 8, 2, '#d8c8a0'); rect(g, ex - f * 20, ey - 2, 2, 2, P.red);
}
/* THE SQUIRE: runs a new lance out of the pavilion. q: { x, st, face }; feet at (qx, qy) */
export function drawSquire(g, qx, qy, f, st, time) {
  const run = st === 'run' || st === 'wait', k = run ? (Math.floor(time * 9) & 1) : 0, fy = qy;
  rect(g, qx - 3, fy - 4, 2, 4 + (k ? -1 : 0), '#4a3a2a'); rect(g, qx + 1, fy - 4, 2, 4 + (k ? 0 : -1), '#4a3a2a'); rect(g, qx - 4, fy - 10, 8, 7, P.goldD); rect(g, qx - 4, fy - 10, 8, 2, P.gold); rect(g, qx - 1, fy - 9, 2, 6, P.blue);
  rect(g, qx - 3, fy - 15, 6, 5, '#e0b090'); rect(g, qx - 4, fy - 16, 8, 3, P.blueD); rect(g, qx + (f > 0 ? 1 : -3), fy - 13, 2, 1, '#1a1210');
  if (st === 'run' || st === 'wait') { drawLance(g, qx - f * 2, fy - 11, 0.03, 36, f, { c1: P.blue, c2: P.gold, pen: P.gold, time }); rect(g, qx + f * 3, fy - 11, 3, 2, '#e0b090'); }
  else if (st !== 'gone' && st !== 'groom') rect(g, qx - f * 8, fy - 2, 18, 2, '#d8c8a0');   /* the dropped lance */
}
/* THE HORSE ARCHER: e = { x, y, face, aim, mode, mounted }, feet at (e.x, e.y); mode 'drawTell' / 'footTell' = the string drawn; 'down' = unhorsed on the ground */
function bakeArcherTorso(foot) {
  const [c, g] = canvas(20, 26), cx = 9, by = 24, cloth = '#2a8a6a', clothD = '#1c6048';
  rect(g, cx - 4, by - 11, 9, 11, cloth); rect(g, cx - 4, by - 4, 9, 1, '#e0c070'); rect(g, cx - 4, by - 11, 9, 2, clothD); for (let i = 0; i < 4; i++) rect(g, cx - 3 + i * 2, by - 8, 1, 3, clothD);   /* a scaled jerkin */
  rect(g, cx - 3, by - 17, 7, 6, '#e0b090'); rect(g, cx - 4, by - 18, 9, 3, '#e8e0c0'); rect(g, cx - 5, by - 17, 2, 4, '#e8e0c0'); rect(g, cx + 1, by - 16, 3, 1, '#1a1210');   /* a turban and a face */
  rect(g, cx - 6, by - 8, 3, 8, '#7a5a3a'); rect(g, cx - 6, by - 11, 2, 4, P.steelD);    /* the quiver on his back */
  return outline(c);
}
export function drawArcher(g, e, cx, cy, time, horseFacing) {
  const ex = R(e.x - cx), ey = R(e.y - cy), f = e.face || 1, a = e.aim || f, drawn = /Tell$/.test(e.mode);
  if (e.mode === 'down') { rect(g, ex - 9, ey - 6, 18, 6, '#2a8a6a'); rect(g, ex - 9, ey - 6, 18, 1, P.cream); rect(g, ex + 7 * a, ey - 8, 6, 5, '#e8e0c0'); rect(g, ex - 12 * a, ey - 3, 2, 3, '#7a5a3a'); return; }
  const mt = e.mounted, T = memo('arT', () => ({ R: bakeArcherTorso() })).R, by = mt ? ey - 20 : ey - 6;
  if (mt) drawHorse(g, 'archer', ex, ey, f, e.vx || 0, time, null); else { rect(g, ex - 4, ey - 7, 3, 7, '#4a3a2a'); rect(g, ex + 1, ey - 7, 3, 7, '#4a3a2a'); rect(g, ex - 5, ey - 1, 5, 1, '#2a2024'); rect(g, ex + 1, ey - 1, 5, 1, '#2a2024'); }
  g.drawImage(a < 0 ? memo('arTL', () => flipped(T)) : T, ex - (a < 0 ? 10 : 9), by - 23);
  if (mt) { rect(g, ex - 2, by - 1, 4, 8, '#2a8a6a'); rect(g, ex - 1, by + 6, 4, 2, '#2a2024'); }
  /* the bow: a recurve held out toward the aim, the string drawn back to the cheek when told */
  const bx = ex + a * 8, bY = by - 9, k = drawn ? 1 : 0;
  line(g, bx, bY - 9, bx + a * 2, bY - 3, '#8a5a32', 1); line(g, bx + a * 2, bY - 3, bx + a * 2, bY + 3, '#6a4228', 1); line(g, bx + a * 2, bY + 3, bx, bY + 9, '#8a5a32', 1); rect(g, bx + a * 2 - 1, bY - 1, 2, 3, '#e8e0c0');
  const sx = drawn ? ex + a * 1 : bx; line(g, bx, bY - 9, sx, bY, '#e8e0c0', 1); line(g, sx, bY, bx, bY + 9, '#e8e0c0', 1);
  tline(g, ex + a * 2, by - 14, bx + a * 2, bY, '#2a8a6a', 2); if (drawn) { rect(g, sx + (a > 0 ? 0 : -4), bY, 5, 1, '#c8c0a0'); rect(g, ex + a * 1, bY - 1, 2, 3, '#e0b090'); }
}
export function drawArrow(g, ax, ay, vx, vy) { const k = Math.atan2(vy, vx), c = Math.cos(k), s = Math.sin(k); line(g, ax - c * 7, ay - s * 7, ax + c * 3, ay + s * 3, '#d8c8a0', 1); rect(g, ax + c * 3 - 1, ay + s * 3 - 1, 3, 3, P.steel); line(g, ax - c * 7, ay - s * 7 - 1, ax - c * 5, ay - s * 5 - 1, P.red, 1); line(g, ax - c * 7, ay - s * 7 + 1, ax - c * 5, ay - s * 5 + 1, P.red, 1); }

/* ============================================================ 3. THE SET DRESSING (screen coords: x, y already minus the camera) */
const stripe = (g, x, y, w, h, c1, c2, step = 4) => { for (let i = 0; i < w; i += step) rect(g, x + i, y, Math.min(step, w - i), h, (i / step) & 1 ? c2 : c1); };
const scallops = (g, x, y, w, c1, c2, step = 4, d = 3) => { for (let i = 0; i < w; i += step) { const c = (i / step) & 1 ? c2 : c1; rect(g, x + i, y, step, d - 1, c); rect(g, x + i + 1, y + d - 1, step - 2, 1, c); } };
const pennant = (g, px, py, f, col, time, ph = 0, L = 9) => { rect(g, px, py - 1, 1, 12, P.woodD); const fl = Math.sin(time * 5 + ph) * 1.5; fillPoly(g, [[px + 1, py], [px + f * L + fl, py + 3 + fl * 0.3], [px + 1, py + 6]].map(([x, y]) => [x + (f < 0 ? -1 : 0), y]), col); rect(g, px - 1, py - 3, 3, 3, P.gold); };
/* a PAVILION / tent whose roof shelf is at screen y `top`, from X0 over Wd, standing on gY */
export function drawPavilion(g, X0, top, Wd, gY, col, time, grand) {
  const c2 = P.cream, mid = X0 + Wd / 2, H = Math.max(8, gY - top);
  const peak = grand ? 18 : 12; fillPoly(g, [[X0 - 3, top + 1], [mid, top - peak], [X0 + Wd + 3, top + 1]], col);   /* the roof's ridge behind whoever stands on the shelf */
  for (let i = 0; i < Wd + 6; i += 6) fillPoly(g, [[X0 - 3 + i, top + 1], [mid, top - peak], [X0 - 3 + i + 3, top + 1]], c2);
  rect(g, X0 - 3, top, Wd + 6, 3, shade(col, -0.2)); scallops(g, X0 - 1, top + 3, Wd + 2, col, c2, 4, 4);
  stripe(g, X0, top + 7, Wd, H - 7, col, c2, 6); rect(g, X0, top + 7, Wd, 1, shade(col, -0.3)); rect(g, X0, top + 7, 2, H - 7, shade(col, -0.25)); rect(g, X0 + Wd - 2, top + 7, 2, H - 7, shade(col, -0.25));
  const dw = Math.min(14, Wd - 8), dx = R(mid - dw / 2), dh = Math.min(26, H - 9);
  rect(g, dx, gY - dh, dw, dh, '#2a1e2a'); rect(g, dx + 1, gY - dh - 1, dw - 2, 1, '#2a1e2a'); fillPoly(g, [[dx, gY - dh], [dx + 4, gY - dh], [dx, gY - 2]], col); fillPoly(g, [[dx + dw, gY - dh], [dx + dw - 4, gY - dh], [dx + dw, gY - 2]], col);   /* the doorway, its curtains tied back */
  rect(g, dx + 3, gY - 3, 1, 3, P.gold); rect(g, dx + dw - 4, gY - 3, 1, 3, P.gold);
  rect(g, R(mid) - 1, top - peak - 8, 2, 8, P.woodD); rect(g, R(mid) - 2, top - peak - 10, 4, 3, P.gold); pennant(g, R(mid) + 1, top - peak - 12, 1, grand ? P.gold : P.red, time, mid * 0.07, grand ? 12 : 9);
}
export function drawStall(g, X0, top, Wd, gY, time) {
  rect(g, X0 + 2, top + 4, 2, gY - top - 4, P.woodD); rect(g, X0 + Wd - 4, top + 4, 2, gY - top - 4, P.woodD);
  stripe(g, X0 - 2, top, Wd + 4, 5, P.red, P.cream, 5); scallops(g, X0 - 2, top + 5, Wd + 4, P.red, P.cream, 5, 4);
  rect(g, X0 + 2, gY - 14, Wd - 4, 3, P.wood); rect(g, X0 + 2, gY - 11, Wd - 4, 11, P.woodD); rect(g, X0 + 2, gY - 11, Wd - 4, 1, P.wood);
  for (let i = 0; i < 4; i++) { const pxx = X0 + 8 + i * 9; ellipse(g, pxx, gY - 17, 4, 2.4, '#d8a458'); ellipse(g, pxx, gY - 18, 3, 1.4, '#f0cc84'); rect(g, pxx - 1, gY - 19, 1, 1, P.red); }   /* the pies */
  rect(g, X0 + Wd / 2 - 1, top + 9, 1, 4, P.woodD); rect(g, X0 + Wd / 2 - 5, top + 12, 11, 6, P.cream); rect(g, X0 + Wd / 2 - 3, top + 14, 7, 2, P.redD);   /* the hanging sign: a pie */
}
export function drawLoft(g, X0, top, Wd, gY, time) {   /* THE STABLE LOFT: the deck is the shelf; below it the stalls, a hay stack */
  rect(g, X0, top, Wd, 5, P.wood); rect(g, X0, top + 4, Wd, 1, P.woodD); stripe(g, X0, top + 5, Wd, 3, P.red, P.cream, 8);
  for (let x = X0 + 2; x < X0 + Wd; x += 40) { rect(g, x, top + 8, 4, gY - top - 8, P.cream); rect(g, x, top + 8, 4, 1, P.red); for (let y = top + 12; y < gY - 3; y += 8) rect(g, x, y, 4, 1, P.creamD); }
  for (let x = X0 + 6; x + 36 <= X0 + Wd; x += 40) { rect(g, x + 4, top + 14, 30, gY - top - 14, '#3a2a28'); rect(g, x + 8, top + 18, 18, 14, P.hayD); rect(g, x + 8, top + 18, 18, 3, P.hay); for (let i = 0; i < 5; i++) rect(g, x + 10 + i * 3, top + 22 + (i & 1) * 3, 1, 5, P.hay); }
  rect(g, X0 + Wd - 24, top - 7, 18, 7, P.hayD); rect(g, X0 + Wd - 24, top - 7, 18, 2, P.hay); for (let i = 0; i < 6; i++) rect(g, X0 + Wd - 22 + i * 3, top - 5 + (i & 1) * 2, 1, 3, P.hay);   /* a hay stack up on the deck */
  pennant(g, X0 + 2, top - 18, 1, P.red, time, 1);
}
export function drawRoyalBox(g, X0, top, Wd, gY, time) {
  rect(g, X0, top, Wd, 4, P.goldD); rect(g, X0, top, Wd, 1, P.gold); rect(g, X0, top + 4, Wd, 20, P.purple); scallops(g, X0, top + 24, Wd, P.purple, P.purpleD, 4, 4);
  for (let x = X0 + 4; x < X0 + Wd; x += 12) { rect(g, x, top + 5, 1, 17, P.purpleD); rect(g, x + 4, top + 7, 5, 5, P.gold); rect(g, x + 5, top + 8, 3, 3, P.purpleD); }   /* gilded crests on the drape */
  for (let x = X0 + 2; x < X0 + Wd; x += 4) rect(g, x, top + 28, 1, 3, P.gold);   /* the fringe */
  for (const px of [X0 + 1, X0 + Wd - 3]) { rect(g, px, top - 34, 2, 34, P.woodD); rect(g, px - 1, top - 36, 4, 3, P.gold); }
  rect(g, X0 + 1, top - 30, Wd - 2, 3, P.purpleD); scallops(g, X0 + 1, top - 27, Wd - 2, P.purple, P.gold, 5, 5);   /* the canopy over the box */
  pennant(g, X0 + 2, top - 48, 1, P.gold, time, 2, 11);
}
export function drawNest(g, X0, top, Wd, gY, time) {   /* THE CROW'S NEST: a hooped barrel ring round the pole's top */
  rect(g, X0, top, Wd, 9, P.wood); for (let x = X0 + 2; x < X0 + Wd; x += 4) rect(g, x, top, 1, 9, P.woodD); rect(g, X0, top + 1, Wd, 1, P.steelD); rect(g, X0, top + 6, Wd, 1, P.steelD);
  rect(g, X0 - 1, top - 1, Wd + 2, 2, P.woodD); pennant(g, X0 + Wd - 3, top - 22, -1, P.red, time, 3, 11); rect(g, X0 + Wd - 4, top - 13, 2, 13, P.woodD);
}
export function drawBanner(g, x, top, gY, col, time, ph) {   /* a standard: a pole, a crossbar, a swallow-tailed heraldic banner swaying */
  const sw = Math.round(Math.sin(time * 1.6 + ph) * 1.2), c2 = col === P.red ? P.cream : P.gold;
  rect(g, x, top, 2, gY - top, P.woodD); rect(g, x - 1, top - 3, 4, 3, P.gold); rect(g, x - 6, top + 1, 14, 2, P.goldD);
  rect(g, x - 5 + sw, top + 3, 12, 22, col); rect(g, x - 5 + sw, top + 3, 12, 2, c2); for (let i = 0; i < 3; i++) rect(g, x - 5 + sw + i * 5, top + 25, 2, 4 - i, col); rect(g, x - 5 + sw + 5, top + 25, 2, 6, col);
  fillPoly(g, [[x + 1 + sw, top + 8], [x + 5 + sw, top + 14], [x + 1 + sw, top + 20], [x - 3 + sw, top + 14]], c2); rect(g, x + sw, top + 13, 2, 2, col);
}
export function drawHurdle(g, x, y) {   /* y = ground; a brush hurdle: painted rails, gorse on top */
  rect(g, x + 1, y - 22, 3, 22, P.cream); rect(g, x + 12, y - 22, 3, 22, P.cream); rect(g, x + 1, y - 22, 3, 2, P.red); rect(g, x + 12, y - 22, 3, 2, P.red);
  stripe(g, x, y - 17, 16, 3, P.red, P.cream, 4); stripe(g, x, y - 9, 16, 3, P.cream, P.red, 4);
  for (let i = 0; i < 16; i += 2) { rect(g, x + i, y - 24 - ((i * 7) % 4), 2, 4 + ((i * 7) % 4), (i & 2) ? P.green : P.greenD); } rect(g, x + 4, y - 27, 1, 1, '#e8d84a'); rect(g, x + 10, y - 26, 1, 1, '#e8d84a');
}
export function drawRing(g, x, y, gY, taken, time) {   /* a post with a gibbet arm and the ring on its hook */
  rect(g, x - 11, y - 5, 3, gY - y + 5, P.cream); for (let yy = y; yy < gY - 2; yy += 6) rect(g, x - 11, yy, 3, 2, P.red); rect(g, x - 12, y - 7, 5, 3, P.gold);
  rect(g, x - 11, y - 5, 10, 2, P.woodD); rect(g, x - 2, y - 4, 1, 3, P.steelD);
  if (!taken) { for (let yy = -5; yy <= 5; yy++) for (let xx = -5; xx <= 5; xx++) { const d = Math.hypot(xx + 0.5, yy + 0.5); if (d <= 4.6 && d >= 2.8) rect(g, x + xx, y + yy, 1, 1, d < 3.6 ? P.gold : P.goldD); }
    if (((time * 3) | 0) % 5 === 0) rect(g, x + 3, y - 4, 1, 1, '#ffffff'); }
  else rect(g, x - 2, y - 2, 1, 2, P.goldD);
}
export function drawTarget(g, x, y, gY, done) {   /* a straw dummy target on a post */
  rect(g, x - 1, y + 8, 3, gY - y - 8, P.woodD); rect(g, x - 5, gY - 3, 11, 3, P.woodD);
  if (done) { for (const [dx, dy, w] of [[-7, 14, 4], [3, 18, 5], [-3, 20, 3], [5, 11, 3]]) { rect(g, x + dx, y + dy, w, 1, P.hay); rect(g, x + dx + 1, y + dy + 1, w - 1, 1, P.hayD); } return; }
  circle(g, x, y + 1, 8, P.hayD); circle(g, x, y, 7.5, P.hay); circle(g, x, y, 5.5, P.red); circle(g, x, y, 3.6, P.cream); circle(g, x, y, 1.8, P.red);
  for (let a = 0; a < 5; a++) rect(g, x - 7 + a * 3, y - 8 - (a & 1), 1, 2, P.hay);
}
/* a QUINTAIN: q = { face }, (qx, qy) its foot/top as the greybox had them; k = { st: 'idle'|'tell'|'sweep' } */
export function drawQuintain(g, qx, qy, face, st, time) {
  const f = face || -1, a = st && st !== 'idle' ? (st === 'tell' ? time * 6 : time * 18) : 0;
  stripe(g, qx - 2, qy - 38, 4, 38, P.cream, P.red, 4); rect(g, qx - 3, qy - 40, 6, 3, P.gold); rect(g, qx - 3, qy - 2, 6, 2, P.woodD);
  const sh = shieldSet(); const sx = qx + f * 8 - 6; g.drawImage(f < 0 ? memo('shL', () => flipped(sh)) : sh, sx, qy - 33, 12, 18);   /* the shield you strike: scaled down 3/4 by drawImage */
  rect(g, qx + (f > 0 ? 2 : -9), qy - 24, 7, 2, P.woodD);
  const ax = R(Math.cos(a) * 26 * -f), kk = st === 'sweep';
  rect(g, Math.min(qx, qx + ax), qy - 34, Math.abs(ax) + 1, 2, P.wood); rect(g, Math.min(qx, qx + ax), qy - 34, Math.abs(ax) + 1, 1, P.hay);
  const bx = qx + ax; rect(g, bx, qy - 33, 1, 3, P.steelD); rect(g, bx - 4, qy - 31, 9, 10, kk ? '#b86a4a' : P.hayD); rect(g, bx - 4, qy - 31, 9, 2, kk ? '#d89070' : P.hay); rect(g, bx - 2, qy - 28, 5, 1, P.woodD); rect(g, bx - 3, qy - 22, 7, 1, '#6a4a2a');   /* the sandbag */
}
export function drawRailBarrier(g, x0, x1, y, time) {   /* THE TILT RAIL: a painted barrier, posts with gold finials, a blue swag between */
  stripe(g, x0, y, x1 - x0, 4, P.red, P.cream, 8); rect(g, x0, y + 4, x1 - x0, 1, P.redD); rect(g, x0, y, x1 - x0, 1, '#ffffff');
  for (let x = x0 + 6; x < x1; x += 48) { rect(g, x, y - 2, 3, 36, P.cream); rect(g, x, y - 3, 3, 1, P.gold); rect(g, x - 1, y - 5, 5, 3, P.gold); for (let yy = y + 4; yy < y + 32; yy += 6) rect(g, x, yy, 3, 1, P.creamD);
    if (x + 48 < x1) { for (let i = 0; i < 44; i++) rect(g, x + 3 + i, y + 5 + Math.round(Math.sin(i / 44 * Math.PI) * 4), 1, 2, P.blue); } }
}
export function drawListFence(g, x0, x1, gY, camLeft) {   /* THE LISTS FENCE along the ground behind the horses: white posts, red and white rails */
  const s = Math.max(x0, camLeft - 8), start = x0 + 24 * Math.floor((s - x0) / 24);
  for (let i = Math.max(0, Math.floor((s - x0) / 8)); x0 + i * 8 < x1 && x0 + i * 8 < camLeft + 700; i++) { rect(g, x0 + i * 8, gY - 11, 8, 2, i & 1 ? P.red : P.cream); rect(g, x0 + i * 8, gY - 5, 8, 2, i & 1 ? P.cream : P.red); }
  for (let x = start; x < x1; x += 24) { if (x < x0) continue; rect(g, x, gY - 14, 3, 14, P.cream); rect(g, x, gY - 15, 3, 1, P.gold); }
}
/* THE CROWD on a stand tier: tier surface at screen y `top`, from X0 over Wd; two frames (arms down / cheering) per tier, alternating */
export function drawCrowd(g, X0, top, Wd, id, time) {
  const key = 'crowd:' + id + ':' + Wd; const fr = memo(key, () => [0, 1].map(v => { const [c, cg] = canvas(Wd, 18), rnd = mulberry(id * 977 + 5), cols = [P.red, P.blue, P.gold, '#2a8a6a', P.cream, P.purple, '#d87a2a'], skin = ['#e0b090', '#c89070', '#f0c8a8', '#8a5a3a'];
    for (let x = 1; x + 6 <= Wd - 1; x += 6 + ((rnd() * 2) | 0)) { const col = cols[(rnd() * cols.length) | 0], sk = skin[(rnd() * skin.length) | 0], cheer = rnd() < 0.5 ? v : 0, hh = 3 + ((rnd() * 3) | 0);
      rect(cg, x, 18 - 8 - hh + 3, 5, 5 + hh - 3, col); rect(cg, x + 1, 18 - 12 - hh + 3, 3, 3, sk); rect(cg, x + 1, 18 - 13 - hh + 3, 3, 1, ((rnd() * 4) | 0) ? '#3a2a20' : '#8a5a2a');
      if (cheer) { rect(cg, x - 1, 18 - 14 - hh + 3, 1, 4, sk); rect(cg, x + 5, 18 - 14 - hh + 3, 1, 4, sk); } }
    rect(cg, 0, 17, Wd, 1, P.woodD); return c; }));
  g.drawImage(fr[((time * 2.2 + id * 0.37) | 0) & 1], R(X0), R(top) - 17);
}
/* the stand's fascia under a tier (blue and cream cloth) */
export function drawStandFace(g, X0, top, Wd, h) { stripe(g, X0, top + 4, Wd, h, P.blueD, P.blue, 12); rect(g, X0, top + 4, Wd, 1, P.gold); scallops(g, X0, top + 4 + h, Wd, P.blueD, P.blue, 6, 3); }
