// src/pyro-art.js - THE PYROMANCER KIT'S ART PASS (claude/pyroarttune, Daniel 10-30 20:50-20:52 kit; the kit lane's greybox is scratch/lane-reports/pyrokit.md 'Art needed').
// Hard-pixel sprites drawn in code on the pyromancer's own palette (src/chars.js PYRO_PAL: robe #b8462e, glow #ffb040, brass #ffd36b) and baked ONCE, lazily, to small canvases.
// ART ONLY: nothing here reads a timer, a box or a number the kit uses - the kit calls in with positions, steps and the clock, this module draws.
//   FLAME WARD   dome(): the bloom (radius grows over the first 0.08 s), the white-hot PARRY beat (spokes), the orange shell with licks, the red guttering end.
//                fx 'parry' (starburst + ring), 'block' (a ring with sparks on the side the blow came from), 'spark' (the contact burn's pop).
//   FIREBALL     held(): the ball on the staff, 3 sizes, a swell as the next step nears, the READY pulse + orbiting embers; ball(): the 3 sizes in flight with a tail;
//                fx 'blast' (the big one going off, 5 frames).
//   STOKE        stoke(): a flame crown on the staff head that grows with the bar, a halo and two circling sparks.
//   BURN MARK    brand(): the small flame brand over a marked foe (two frames), outlined so it reads on fire and on snow alike.
//   CONFLAGRATION fx 'erupt' (a flame column up a marked foe, three sizes: small / mini / boss) and fx 'word' (the pixel-font banner CONFLAGRATION).
const C = { out: '#1a0a04', dk: '#3a1408', rd: '#d8481c', or: '#ff6b2c', am: '#ff9a5c', yl: '#ffd36b', cr: '#fff6c8', wh: '#ffffff', sm: '#4a4038' };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const memo = new Map(); const once = (k, f) => { if (!memo.has(k)) memo.set(k, f()); return memo.get(k); };
const hash = n => { n = Math.imul(n ^ 61, 0x9e3779b1); n ^= n >>> 15; n = Math.imul(n, 0x85ebca6b); n ^= n >>> 13; return (n >>> 0) / 4294967296; };
const px = (g, x, y, col, a = 1) => { g.globalAlpha = a; g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); g.globalAlpha = 1; };
const disc = (g, cx, cy, r, col, a = 1) => { g.globalAlpha = a; g.fillStyle = col; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y + 0.25)); g.fillRect(cx - w, cy + y, 2 * w + 1, 1); } g.globalAlpha = 1; };
const ringPx = (g, cx, cy, r, col, a = 1, skip = null) => { g.globalAlpha = a; g.fillStyle = col; const n = Math.max(12, Math.ceil(r * 6.3)); let lx = 1e9, ly = 1e9;
  for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2; if (skip && skip(an, i)) continue; const x = cx + Math.round(Math.cos(an) * r), y = cy + Math.round(Math.sin(an) * r); if (x === lx && y === ly) continue; lx = x; ly = y; g.fillRect(x, y, 1, 1); } g.globalAlpha = 1; };
const blit = (g, s, x, y, flip) => { if (!s) return; if (flip) { g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(-1, 1); g.drawImage(s, -(s.ox + 1), -s.oy); g.restore(); } else g.drawImage(s, Math.round(x) - s.ox, Math.round(y) - s.oy); };
const mk = (w, h, ox, oy) => { const [c, g] = cv(w, h); c.ox = ox; c.oy = oy; return [c, g]; };

/* ---------------------------------------------------------------- THE FLAME WARD */
export const DOME_RADII = [10, 14, 18, 20, 22];
export function domeSprite(R, style, ph) {   /* style: 'beat' (the parry beat: white-hot, with spokes), 'hold' (the orange shell), 'fade' (red, guttering, gaps in the rim) */
  return once('d' + R + style + ph, () => {
    const S = 2 * R + 11, c0 = R + 5, [c, g] = mk(S, S, c0, c0), beat = style === 'beat', fade = style === 'fade';
    const body = beat ? C.yl : fade ? C.rd : C.am, rim = beat ? C.wh : fade ? C.or : C.yl, edge = beat ? C.cr : fade ? C.rd : C.or, aB = beat ? 0.46 : fade ? 0.2 : 0.32, thick = beat ? 2 : 1;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = x - c0, dy = y - c0, d = Math.hypot(dx, dy); if (d > R - 0.5) continue; const k = d / R;
      g.globalAlpha = aB * (0.4 + 0.6 * k * k + (beat ? 0.2 : 0)); g.fillStyle = body; g.fillRect(x, y, 1, 1);                       /* a shell: thin in the middle, strong at the rim */
      if (k < 0.55 && ((x + y) & 1) === 0) { g.globalAlpha = aB * 0.9 * (1 - k); g.fillStyle = C.cr; g.fillRect(x, y, 1, 1); }          /* the hot middle, dithered */
      const an = Math.atan2(dy, dx);
      if (k > 0.55 && k < 0.88 && Math.sin(an * 3 + ph * 1.57 + k * 6) > 0.55 && ((x + y) & 1) === 0) { g.globalAlpha = 0.55; g.fillStyle = fade ? C.or : C.am; g.fillRect(x, y, 1, 1); }   /* flame turning inside the shell */
    }
    g.globalAlpha = 1;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = x - c0, dy = y - c0, d = Math.hypot(dx, dy); if (d > R + 0.5 || d <= R - thick - 0.5 + 1) continue;
      const an = Math.atan2(dy, dx), b = Math.floor((an + Math.PI) / (Math.PI * 2) * 24);
      if (fade && hash(b * 7 + ph * 31 + R) > 0.62) continue;                                                                           /* the rim gutters: gaps */
      px(g, x, y, d > R - 0.5 ? rim : (beat ? C.cr : edge));
    }
    const N = Math.ceil(R * 3.4);
    for (let i = 0; i < N; i++) { const an = i / N * Math.PI * 2, h = hash(i * 13 + ph * 101 + R * 7), len = beat ? 0 : Math.floor(h * (fade ? 2.2 : 3.9));
      for (let k = 1; k <= len; k++) px(g, c0 + Math.round(Math.cos(an) * (R + k)), c0 + Math.round(Math.sin(an) * (R + k)), k === len ? (fade ? C.rd : C.or) : (fade ? C.or : C.am)); }
    if (beat) for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, L = i % 2 ? 2 : 5; for (let k = 1; k <= L; k++) px(g, c0 + Math.round(Math.cos(an) * (R + k)), c0 + Math.round(Math.sin(an) * (R + k)), k > L - 2 ? C.yl : C.wh); }
    return c;
  });
}
/* the dome, drawn: t = seconds into the ward, K = {perfect, t} */
export function dome(g, x, y, t, K, now) {
  const R = t < 0.02 ? 10 : t < 0.04 ? 14 : t < 0.06 ? 18 : t < 0.08 ? 20 : 22, style = t <= K.perfect ? 'beat' : t >= K.t * 0.72 ? 'fade' : 'hold';
  blit(g, domeSprite(R, style, Math.floor(now * 14) % 4), x, y, false);
}

/* ---------------------------------------------------------------- BALLS */
const BALL_R = [0, 3, 5, 8, 10, 13], BALL_TAIL = [0, 5, 9, 15, 18, 22];   /* (claude/pyrocontrols) five sizes */
export function ballSprite(size, f, tail) {   /* the ball moving RIGHT (tail to the left); no tail: the held ball, centred */
  return once('b' + size + '_' + f + (tail ? 't' : ''), () => {
    const r = BALL_R[size], T = tail ? BALL_TAIL[size] : 0, W = T + 2 * r + 8, H = 2 * r + 10, bx = T + r + 4, by = H >> 1, [c, g] = mk(W, H, bx, by);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {                                                                           /* the body: hot at the middle, orange at the skin */
      const d = Math.hypot(x - bx, y - by); if (d > r + 1.2) continue; const k = d / r;
      if (d > r + 0.3) { px(g, x, y, C.rd, 0.7); continue; }
      px(g, x, y, k < 0.28 ? (size >= 4 ? C.wh : C.cr) : k < 0.55 ? (size >= 2 ? C.cr : C.yl) : k < 0.8 ? C.am : C.or); }
    if (size >= 2) for (let i = 0; i < size + 1; i++) { const an = -Math.PI / 2 + (hash(i * 5 + f * 17 + size) - 0.5) * 2.2, h = 1 + Math.floor(hash(i * 3 + f * 11) * (size >= 3 ? 4 : 3));
      for (let k = 1; k <= h; k++) px(g, bx + Math.round(Math.cos(an) * (r + k - 1)), by + Math.round(Math.sin(an) * (r + k - 1)), k === h ? C.or : C.am); }   /* tongues off the crown */
    if (tail) { for (let k = 1; k <= T; k++) { const hh = r * Math.pow(1 - k / (T + 1), 1.05) * (0.85 + 0.3 * hash(k * 7 + f * 29 + size)), x = bx - r + 1 - k;
        for (let y = -Math.ceil(hh); y <= Math.ceil(hh); y++) { const u = Math.abs(y) / Math.max(0.5, hh); if (u > 1) continue; if (k > T * 0.45 && ((x + y) & 1)) continue;
          px(g, x, by + y, u < 0.35 ? C.yl : u < 0.7 ? C.am : C.or, 1 - k / (T + 2) * 0.5); } }
      for (let i = 0; i < size; i++) px(g, bx - r - 2 - Math.floor(hash(i * 9 + f * 3) * T), by + Math.round((hash(i * 4 + f * 7) - 0.5) * r * 1.6), i % 2 ? C.yl : C.or); }   /* sparks off the tail */
    return c;
  });
}
/* a ball in flight: size 1 / 2 / 3, vx its heading */
export function ball(g, x, y, size, vx, now) { blit(g, ballSprite(size, Math.floor(now * 14) % 2, true), x, y, vx < 0); }
/* THE BALL ON THE STAFF: step 1-3, prog 0-1 toward the next step (0 at step 3). It swells before it grows, and at 3 it is READY: a white pulse, rings, embers circling. */
export function held(g, x, y, step, prog, now) {
  if (step < 1) return; const r = BALL_R[step], f = Math.floor(now * 12) % 2;
  disc(g, x, y, r + 3, C.am, 0.14 + 0.1 * prog);
  blit(g, ballSprite(step, f, false), x, y, false);
  if (step < 5 && prog > 0.55) ringPx(g, x, y, r + 2, C.yl, 0.2 + 0.7 * (prog - 0.55) / 0.45);                                       /* the swell: the next size is coming */
  if (step === 3 || step === 4) ringPx(g, x, y, r + 3, step === 4 ? C.cr : C.yl, 0.35 + 0.2 * (step - 3));   /* loaded, not yet ready */
  if (step === 5) { const pu = Math.floor(now * 10) % 2; ringPx(g, x, y, r + 3 + pu, C.cr, 0.75 - 0.3 * pu); ringPx(g, x, y, r + 6 + pu * 2, C.yl, 0.3); disc(g, x, y, r - 3, C.wh, 0.35 * pu); }
  for (let i = 0; i < step; i++) { const an = now * 7 + i * Math.PI * 2 / step; px(g, x + Math.cos(an) * (r + 4), y + Math.sin(an) * (r + 3), i % 2 ? C.yl : C.am); }
}

/* ---------------------------------------------------------------- FLAMES (the stoke crown, the eruption column) */
function flameShape(g, w, h, f, ox, oy, o = {}) {   /* one tongue: tip up, widest low, swaying; colour by distance from the axis. (ox, oy) = the bottom middle */
  for (let y = 0; y < h; y++) { const t = y / Math.max(1, h - 1), lim = Math.pow(t, 0.72) * Math.sqrt(1 - Math.pow(Math.max(0, (t - 0.74) / 0.26), 2)), hw = (w / 2) * Math.min(1, lim * 1.18) * (o.wob ? 0.85 + 0.3 * hash(y * 5 + f * 31 + (o.seed || 0)) : 1);
    const sway = Math.round(Math.sin(f * Math.PI / 2 + t * 2.6 + (o.seed || 0)) * (1 - t) * (o.sway ?? 1.4));
    for (let x = -Math.floor(hw); x <= Math.floor(hw); x++) { const u = Math.abs(x) / Math.max(0.6, hw); if (o.fade && ((x + y + f) & 1) && hash(y * 9 + x * 3 + f) < o.fade) continue;
      const col = u < 0.28 && t > 0.4 ? (o.hot ? C.wh : C.cr) : u < 0.6 ? C.yl : u < 0.86 ? C.am : (t < 0.3 ? C.rd : C.or); px(g, ox + x + sway, oy - (h - 1) + y, col); } }
}
export function flameSprite(w, h, f, seed) { return once('f' + w + 'x' + h + '_' + f + '_' + (seed || 0), () => { const [c, g] = mk(w + 6, h + 2, (w + 6) >> 1, h + 1); flameShape(g, w, h, f, (w + 6) >> 1, h, { seed }); return c; }); }
/* THE STOKE: (x, y) = the staff head. The crown grows with the bar (heat 0-100). */
export function stoke(g, x, y, heat, now) {
  const i = heat < 35 ? 0 : heat < 70 ? 1 : 2, f = Math.floor(now * 11) % 4, w = [5, 7, 9][i], h = [8, 12, 17][i], r = 4 + i * 2 + Math.round(Math.sin(now * 8) * 0.6);
  disc(g, x, y - 3 - i * 2, r + 3, C.or, 0.12); disc(g, x, y - 3 - i * 2, r, C.am, 0.18);
  blit(g, flameSprite(w, h, f, 0), x, y - 1, false);
  for (let k = 0; k < 2 + i; k++) { const an = now * 5 + k * Math.PI * 2 / (2 + i), rr = 6 + i * 2; px(g, x + Math.cos(an) * rr, y - 5 - i * 2 + Math.sin(an) * rr * 0.6, k % 2 ? C.yl : C.cr); }
}

/* ---------------------------------------------------------------- THE BURN MARK (the small flame brand over a marked foe) */
const BRAND = [[
  '...o...', '..oro..', '..orro.', '.oorao.', '.orayo.', 'oraayro', 'orayyao', 'orayyao', '.oraao.', '..ooo..'],
 ['...o...', '..oro..', '.orro..', '.oarro.', '.oyaro.', 'oryaaro', 'oayyaro', 'oayyaro', '.oaaro.', '..ooo..']];
const BRAND_COL = { o: C.dk, r: C.rd, a: C.am, y: C.yl };
export function brandSprite(f, hot) { return once('m' + f + (hot ? 'h' : ''), () => { const [c, g] = mk(7, 10, 3, 9); BRAND[f].forEach((row, y) => { for (let x = 0; x < 7; x++) { const k = row[x]; if (k !== '.') px(g, x, y, hot && k !== 'o' ? (k === 'y' ? C.wh : C.cr) : BRAND_COL[k]); } }); return c; }); }
/* (x, y) = just above the foe's head; left = seconds the mark has to live */
export function brand(g, x, y, now, left) { if (left < 1.5 && Math.floor(now * 8) % 2) return; const f = Math.floor(now * 6) % 2;
  blit(g, brandSprite(f, left < 1.5), x, y, false); if (left > 1.5) px(g, x - 3 + Math.floor(now * 9) % 7, y - 11 - (Math.floor(now * 9) % 3), C.yl, 0.8); }

/* ---------------------------------------------------------------- LIVING BOMB: THE PIPS (claude/pyrokit2) - three small flames over a foe's head, lit one by one; on the third they flash white (the fuse) */
const PIP_LIT = ['..o..', '.ora.', 'orayo', 'orayo', '.ooo.'], PIP_OFF = ['.....', '..o..', '.o.o.', '..o..', '.....'];
function pipSprite(kind) { return once('pip' + kind, () => { const [c, g] = mk(5, 5, 2, 5); const rows = kind === 'off' ? PIP_OFF : PIP_LIT;
  rows.forEach((row, y) => { for (let x = 0; x < 5; x++) { const k = row[x]; if (k === '.') continue; px(g, x, y, kind === 'off' ? C.dk : kind === 'hot' ? (k === 'y' ? C.wh : k === 'o' ? C.rd : C.cr) : k === 'o' ? C.dk : k === 'r' ? C.rd : k === 'a' ? C.am : C.yl, kind === 'off' ? 0.55 : 1); } }); return c; }); }
/* (x, y) = just above the foe's head; n = pips lit (0-3); hot = the fuse is burning; left = seconds the stacks have to live (they gutter in the last 1.2 s) */
export function pips(g, x, y, n, now, hot, left = 9) { if (left < 1.2 && Math.floor(now * 9) % 2) return;
  for (let i = 0; i < 3; i++) { const lit = i < n, bob = lit ? Math.round(Math.sin(now * 8 + i * 1.7)) : 0; blit(g, pipSprite(!lit ? 'off' : hot ? 'hot' : 'on'), x - 6 + i * 6, y + bob, false); }
  if (hot) disc(g, x, y - 3, 8, C.cr, 0.18 + 0.14 * (Math.floor(now * 24) % 2)); }
/* ---------------------------------------------------------------- METEOR FALL: THE RING (the tell) and THE METEOR */
function ellipsePx(g, cx, cy, rx, ry, col, a = 1, skip = null) { g.globalAlpha = a; g.fillStyle = col; const n = Math.max(16, Math.ceil(rx * 6.3)); let lx = 1e9, ly = 1e9;
  for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2; if (skip && skip(an, i)) continue; const x = cx + Math.round(Math.cos(an) * rx), y = cy + Math.round(Math.sin(an) * ry); if (x === lx && y === ly) continue; lx = x; ly = y; g.fillRect(x, y, 1, 1); } g.globalAlpha = 1; }
/* the red ring on the ground where it will land: a flattened ring pulsing red, a gold ring closing in (p = 0..1 of the tell), tick marks up from the rim */
export function meteorRing(g, x, y, R, p, now) { const ry = Math.max(5, Math.round(R * 0.3)), pulse = Math.floor(now * 9) % 2;
  ellipsePx(g, x, y, R, ry, pulse ? C.rd : C.or, 0.95); ellipsePx(g, x, y, R - 1, ry - 1, C.rd, 0.55); ellipsePx(g, x, y, R + 1, ry + 1, C.dk, 0.5);
  const q = Math.max(0.12, 1 - p); ellipsePx(g, x, y, Math.round(R * q), Math.max(2, Math.round(ry * q)), p > 0.7 ? C.cr : C.yl, 0.95);
  for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + 0.39, tx = x + Math.round(Math.cos(an) * R), ty = y + Math.round(Math.sin(an) * ry); for (let k = 1; k <= 3 + Math.round(p * 5); k++) px(g, tx, ty - k, k > 4 ? C.am : C.rd, 1 - k * 0.1); } }
/* the rock itself, falling from the upper right: dark core, fire skin, a long tail up behind it */
export function meteorBody(g, x, y, now) { for (let i = 1; i <= 22; i++) { const a = 1 - i / 24; px(g, x + i * 1.5 + Math.round(Math.sin(now * 20 + i) * 1), y - i * 2.8, i < 8 ? C.yl : i < 15 ? C.or : C.rd, a); px(g, x + i * 1.5 + 1, y - i * 2.8, i < 6 ? C.cr : C.rd, a * 0.7); }
  disc(g, x, y, 10, C.or, 0.25); disc(g, x, y, 7, C.dk); disc(g, x, y, 6, C.rd); disc(g, x - 1, y - 1, 4, C.or); disc(g, x - 1, y - 1, 2, C.yl); px(g, x - 2, y - 2, C.cr);
  for (let k = 0; k < 6; k++) px(g, x + Math.round((hash(k + Math.floor(now * 14)) - 0.3) * 18), y + Math.round((hash(k * 5 + Math.floor(now * 14)) - 0.5) * 14), k % 2 ? C.yl : C.am); }

/* ---------------------------------------------------------------- EFFECTS: parry star, block ring, contact spark, blast, eruption, word */
const FX = [];
export const fxClear = () => { FX.length = 0; };
export function fx(type, x, y, now, o = {}) { if (FX.length > 48) FX.shift(); FX.push({ type, x, y, t0: now, ...o, life: { parry: 0.32, block: 0.24, spark: 0.18, blast: 0.44, erupt: 0.52, word: 1.15, pop: 0.22, land: 0.5, fizzle: 0.55, bigblast: 0.62 }[type] || 0.3 }); }

function starSprite(f) { return once('s' + f, () => {
  const S = 71, c0 = 35, [c, g] = mk(S, S, c0, c0), R = [6, 14, 22, 28, 32][f], cols = [C.wh, C.cr, C.yl, C.am, C.or][f];
  if (f < 2) disc(g, c0, c0, 8 - f * 3, C.cr, 0.8 - f * 0.3);
  ringPx(g, c0, c0, R, cols, f < 4 ? 1 : 0.6); if (f > 0 && f < 4) ringPx(g, c0, c0, R - 2, C.cr, 0.5);
  for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, long = i % 2 === 0, a0 = R * 0.35, a1 = R * (long ? 0.95 : 0.65);
    for (let r = a0; r <= a1; r++) { const x = c0 + Math.round(Math.cos(an) * r), y = c0 + Math.round(Math.sin(an) * r); px(g, x, y, f < 2 ? C.wh : C.yl); if (f < 2 && long) px(g, x + (i === 2 || i === 6 ? 1 : 0), y + (i === 0 || i === 4 ? 1 : 0), C.cr); } }
  return c; }); }
function blockSprite(f) { return once('k' + f, () => {   /* the blow came from the RIGHT: the arc and the sparks are on the right */
  const S = 61, c0 = 30, [c, g] = mk(S, S, c0, c0), R = [20, 23, 26, 29][f], col = [C.yl, C.am, C.or, C.rd][f];
  ringPx(g, c0, c0, R - 2, C.or, 0.45 - f * 0.08);
  ringPx(g, c0, c0, R, col, 1 - f * 0.12, (an) => Math.abs(Math.atan2(Math.sin(an), Math.cos(an))) > 1.0 && f > 1);
  for (let t = -0.8; t <= 0.8; t += 0.05) { const an = t; for (let k = 0; k < (f < 2 ? 2 : 1); k++) px(g, c0 + Math.round(Math.cos(an) * (R + k)), c0 + Math.round(Math.sin(an) * (R + k)), f < 2 ? C.cr : C.yl); }
  for (let i = 0; i < 7; i++) { const an = (i / 6 - 0.5) * 1.5, d = R + 1 + f * 3 + Math.floor(hash(i * 7 + f) * 4); px(g, c0 + Math.round(Math.cos(an) * d), c0 + Math.round(Math.sin(an) * d), i % 2 ? C.yl : C.cr); if (f < 3) px(g, c0 + Math.round(Math.cos(an) * (d - 1)), c0 + Math.round(Math.sin(an) * (d - 1)), C.am); }
  return c; }); }
function sparkSprite(f) { return once('p' + f, () => {
  const [c, g] = mk(17, 17, 8, 8), L = [3, 5, 6][f];
  if (f === 0) disc(g, 8, 8, 2, C.cr, 1);
  for (let k = 1; k <= L; k++) { const col = k > L - 2 ? (f === 2 ? C.or : C.am) : C.yl; px(g, 8 + k, 8, col); px(g, 8 - k, 8, col); px(g, 8, 8 + k, col); px(g, 8, 8 - k, col); }
  if (f === 1) for (const [a, b] of [[1, 1], [-1, 1], [1, -1], [-1, -1], [2, 2], [-2, -2], [2, -2], [-2, 2]]) px(g, 8 + a, 8 + b, Math.abs(a) > 1 ? C.am : C.yl);
  if (f === 2) for (let i = 0; i < 7; i++) px(g, 8 + Math.round((hash(i * 3) - 0.5) * 14), 8 + Math.round((hash(i * 5) - 0.5) * 14), i % 2 ? C.or : C.yl);
  if (f < 2) px(g, 8, 8, C.wh);
  return c; }); }
function blastSprite(f) { return once('x' + f, () => {
  const S = 81, c0 = 40, [c, g] = mk(S, S, c0, c0);
  if (f === 0) { disc(g, c0, c0, 11, C.cr, 0.9); disc(g, c0, c0, 7, C.wh, 1); ringPx(g, c0, c0, 13, C.yl, 1); ringPx(g, c0, c0, 15, C.am, 0.6); }
  if (f === 1) { disc(g, c0, c0, 17, C.am, 0.45); disc(g, c0, c0, 12, C.yl, 0.55); disc(g, c0, c0, 6, C.cr, 0.8); ringPx(g, c0, c0, 22, C.or, 1); ringPx(g, c0, c0, 21, C.yl, 0.8);
    for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6 + 0.2; for (let r = 18; r < 28 + (i % 2) * 4; r++) px(g, c0 + Math.round(Math.cos(an) * r), c0 + Math.round(Math.sin(an) * r), r > 26 ? C.or : C.yl); } }
  if (f === 2) { disc(g, c0, c0, 24, C.am, 0.22); ringPx(g, c0, c0, 30, C.yl, 1); ringPx(g, c0, c0, 29, C.am, 1); ringPx(g, c0, c0, 28, C.or, 0.8); ringPx(g, c0, c0, 31, C.or, 0.7);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const d = Math.hypot(x - c0, y - c0); if (d < 26 && d > 12 && ((x + y) & 1) === 0 && hash(x * 31 + y) < 0.35) px(g, x, y, C.yl, 0.8); }
    for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8 + 0.1, h = 2 + Math.floor(hash(i) * 4); for (let k = 0; k < h; k++) px(g, c0 + Math.round(Math.cos(an) * (32 + k)), c0 + Math.round(Math.sin(an) * (32 + k)), k === h - 1 ? C.rd : C.or); } }
  if (f === 3) { ringPx(g, c0, c0, 35, C.or, 1); ringPx(g, c0, c0, 34, C.rd, 0.9); ringPx(g, c0, c0, 33, C.am, 0.4);
    for (let i = 0; i < 18; i++) px(g, c0 + Math.round((hash(i * 3) - 0.5) * 56), c0 + Math.round((hash(i * 7 + 1) - 0.5) * 50) - 6, i % 3 ? C.am : C.yl);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const d = Math.hypot(x - c0, y - c0); if (d < 30 && ((x * 3 + y * 5) % 7) === 0 && hash(x + y * 97) < 0.5) px(g, x, y, C.sm, 0.6); } }
  if (f === 4) { ringPx(g, c0, c0, 37, C.rd, 0.5); ringPx(g, c0, c0, 36, C.dk, 0.5);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const d = Math.hypot(x - c0, y - c0 + 4); if (d < 32 && ((x + y * 2) % 5) === 0 && hash(x * 13 + y * 57) < 0.55) px(g, x, y, C.sm, 0.45); }
    for (let i = 0; i < 8; i++) px(g, c0 + Math.round((hash(i * 11) - 0.5) * 50), c0 - 8 - Math.round(hash(i * 5) * 22), C.or, 0.8); }
  return c; }); }
const ERUPT_V = [{ w: 18, h: 30 }, { w: 28, h: 46 }, { w: 44, h: 72 }];
function eruptSprite(v, f) { return once('e' + v + '_' + f, () => {
  const { w, h } = ERUPT_V[v], W = w + 14, H = h + 8, cx = W >> 1, [c, g] = mk(W, H, cx, H - 3), p = f / 5;
  const hh = Math.max(4, Math.round(h * (f < 4 ? 0.4 + 0.6 * Math.sin(Math.min(1, (f + 1) / 4) * Math.PI / 2) : f === 4 ? 0.85 : 0.55))), ww = Math.round(w * (f < 3 ? 0.7 + f * 0.15 : 1 - (f - 3) * 0.12));
  ringPx(g, cx, H - 4, Math.round(w * 0.45 + f * 2), f < 3 ? C.yl : C.or, 1 - p * 0.6, (an) => Math.sin(an) < -0.2);                         /* the ground flash under it */
  ringPx(g, cx, H - 4, Math.round(w * 0.3 + f), C.cr, f < 2 ? 0.8 : 0.4, (an) => Math.sin(an) < -0.2);
  for (const [off, sc, seed] of [[0, 1, 1], [-Math.round(w * 0.28), 0.62, 2], [Math.round(w * 0.28), 0.7, 3]]) flameShape(g, Math.max(5, Math.round(ww * (off ? 0.5 : 1))), Math.round(hh * sc), f, cx + off, H - 4, { seed, wob: true, sway: 2.2, hot: f < 3, fade: f >= 4 ? 0.55 : f === 3 ? 0.25 : 0 });
  for (let i = 0; i < 6 + v * 3; i++) px(g, cx + Math.round((hash(i * 5 + f * 3) - 0.5) * w * 1.1), H - 4 - Math.round(hash(i * 7 + f) * (hh + 10)), i % 3 ? C.yl : C.cr, 1 - p * 0.5);   /* sparks climbing */
  return c; }); }
/* THE WORD: a 5x7 pixel face, a fire gradient down the letters, a dark outline and a drop. Built from the string so a second word can use it. */
const GLYPH = {
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'], O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], N: ['#...#', '##..#', '##..#', '#.#.#', '#..##', '#..##', '#...#'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'], L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'], A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'], R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'], T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'], E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'], B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'] };
export function wordSprite(txt) { return once('w' + txt, () => {
  const n = txt.length, W = n * 6 - 1 + 4, H = 7 + 4, [c, g] = mk(W, H, W >> 1, H - 1), G = [C.wh, C.cr, C.yl, C.yl, C.am, C.or, C.rd];
  for (let i = 0; i < n; i++) { const gl = GLYPH[txt[i]]; if (!gl) continue; for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) if (gl[y][x] === '#') {
    const X = 2 + i * 6 + x, Y = 2 + y; for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [1, -1], [-1, 1], [0, 2]]) px(g, X + a, Y + b, C.dk); } }
  for (let i = 0; i < n; i++) { const gl = GLYPH[txt[i]]; if (!gl) continue; for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) if (gl[y][x] === '#') px(g, 2 + i * 6 + x, 2 + y, G[y]); }
  return c; }); }

export function drawFx(g, cx, cy, now, flashes = true) {
  for (let i = FX.length - 1; i >= 0; i--) {
    const f = FX[i], age = now - f.t0; if (age < -0.05 || age >= f.life) { FX.splice(i, 1); continue; }
    const x = f.x - cx, y = f.y - cy, p = Math.max(0, age) / f.life;
    if (f.type === 'parry') blit(g, starSprite(Math.min(4, Math.floor(p * 5))), x, y, false);
    else if (f.type === 'block') blit(g, blockSprite(Math.min(3, Math.floor(p * 4))), x, y, f.dir < 0);
    else if (f.type === 'spark' || f.type === 'pop') blit(g, sparkSprite(Math.min(2, Math.floor(p * 3))), x, y, false);
    else if (f.type === 'blast') blit(g, blastSprite(Math.min(4, Math.floor(p * 5))), x, y, false);
    else if (f.type === 'land') { const fi = Math.min(5, Math.floor(p * 6)); blit(g, blastSprite(Math.min(4, Math.floor(p * 5))), x, y - 6, false); blit(g, eruptSprite(0, fi), x - 14, y + 2, false); blit(g, eruptSprite(0, fi), x + 14, y + 2, false); }   /* PHOENIX RISE's landing: the burst, a flame column off each side */
    else if (f.type === 'fizzle') fizzleDraw(g, x, y, p);
    else if (f.type === 'bigblast') { const s = blastSprite(Math.min(4, Math.floor(p * 5))), sc = f.sc || 1.9; g.drawImage(s, Math.round(x - s.ox * sc), Math.round(y - s.oy * sc), Math.round(s.width * sc), Math.round(s.height * sc)); }
    else if (f.type === 'erupt') blit(g, eruptSprite(f.v || 0, Math.min(5, Math.floor(p * 6))), x, y, false);
    else if (f.type === 'word') { const s = wordSprite(f.txt), rise = Math.round(Math.min(1, age / 0.5) * 10), jit = age < 0.12 && flashes ? (Math.floor(age * 60) % 2 ? 1 : -1) : 0;
      g.globalAlpha = p > 0.78 ? 1 - (p - 0.78) / 0.22 : 1; blit(g, s, x + jit, y - rise, false); g.globalAlpha = 1; }
  }
}
/* WHERE THE POSES HOLD THE STAFF HEAD, from the player's feet (x is mirrored by face): chars.js holdStand/holdWalk staff tip (25, 3), stoke (21, 4); a frame's row r is world P.y - 20 + r */
export const TIP = { hold: [9, -17], stoke: [5, -16] };

/* ---------------------------------------------------------------- BOSS 2 POSES AND MARKS (claude/pyroboss2art) - the Pyromancer's second fight; art only */
/* FIZZLE (a blow or water mid-charge): the held ball sputters, a pale smoke ring, the last sparks fall. p 0-1 over the fx life. */
function fizzleDraw(g, x, y, p) {
  const r = Math.round(10 * (1 - p) + 2); if (p < 0.4) disc(g, x, y, r, p < 0.2 ? C.yl : C.rd, 0.8 - p);
  for (let i = 0; i < 7; i++) { const a = hash(i * 7) * Math.PI * 2, d = 4 + p * (8 + hash(i * 3) * 8); px(g, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7 + p * p * 16, i % 2 ? C.or : C.yl, 1 - p); }
  for (let k = 0; k < 4; k++) { const pp = Math.min(1, p * 1.4 - k * 0.1); if (pp <= 0) continue; disc(g, x - 4 + k * 3, y - 4 - pp * 16, 2 + (k & 1), C.sm, 0.5 * (1 - pp)); }
}
/* PHOENIX RISE: the TELL is a crouch in a rising column (two tongues up either side, the red ring on the floor widening, embers climbing); the DASH is a burning
   streak - wing-shaped flame swept back off both shoulders and a tail of flame along the floor, short and long tongues alternating. face = his heading. */
export function phoenixTell(g, x, y, p, now) {   /* (x, y) = his feet; p 0-1 through the tell */
  const f = Math.floor(now * 11) % 4, w = Math.round(7 + 5 * p), h = Math.round(14 + 22 * p);
  ringPx(g, x, y - 1, Math.round(10 + 10 * p), C.rd, 0.9, an => Math.sin(an) < 0);
  blit(g, flameSprite(w, h, f, 1), x - 10, y, false); blit(g, flameSprite(w, h, f + 1, 2), x + 10, y, false);
  disc(g, x, y - 12, 12 + Math.round(5 * p), C.am, 0.1 + 0.12 * p);
  for (let i = 0; i < 4 + Math.round(6 * p); i++) { const k = (now * 1.6 + hash(i * 5)) % 1; px(g, x + (hash(i * 9) - 0.5) * 28, y - 2 - k * (30 + 14 * p), i % 3 ? C.yl : C.cr, 1 - k); }
}
export function phoenixDash(g, x, y, face, now) {   /* (x, y) = his feet, in the dash */
  const f = Math.floor(now * 16) % 4, d = face || 1;
  disc(g, x, y - 16, 16, C.or, 0.16); disc(g, x, y - 16, 11, C.am, 0.2);
  for (let k = 0; k < 3; k++) { const L = 18 + k * 9; for (let i = 1; i <= L; i++) { const t = i / L, hh = Math.max(0, Math.round((4.5 - k) * (1 - t) * (0.8 + 0.4 * hash(i * 3 + f * 17 + k)))), X = x - d * (6 + i), Y = y - 24 + k * 8 + Math.round(Math.sin(i * 0.5 + f) * 1.2);
    for (let j = -hh; j <= hh; j++) { if (t > 0.5 && ((i + j) & 1)) continue; px(g, X, Y + j, Math.abs(j) < hh * 0.4 ? C.cr : Math.abs(j) < hh * 0.75 ? C.yl : (t < 0.4 ? C.am : C.or), 1 - t * 0.7); } } }   /* three streaks off the shoulders and the back: the wings */
  for (let i = 1; i < 26; i++) { const t = i / 26; px(g, x - d * (4 + i), y - 1 - ((i + f) % 3), t < 0.5 ? C.yl : C.or, 1 - t); }   /* the tail along the floor */
  for (let i = 0; i < 6; i++) px(g, x - d * (8 + hash(i * 3 + f) * 30), y - 28 + hash(i * 5 + f) * 26, i % 2 ? C.yl : C.or);
}
/* THE BOSS WINDED (a bucket while he stokes): gasping steam off the chest and shoulders, grey-blue puffs, water running off the robe, a hiss ring at the feet. */
export function windedSteam(g, x, y, now) {   /* (x, y) = his feet */
  for (let q = 0; q < 5; q++) { const k = (now * 0.9 + q / 5) % 1, X = x - 10 + q * 5 + Math.sin(now * 3 + q * 2) * 2; disc(g, Math.round(X), Math.round(y - 14 - k * 26), 2 + (q & 1) + (k > 0.5 ? 1 : 0), '#d8dce4', 0.7 * (1 - k)); }
  for (let q = 0; q < 4; q++) { const k = (now * 1.3 + q * 0.27) % 1; px(g, x - 9 + q * 6, y - 30 + k * 28, '#9ad0ff', 1 - k * 0.6); px(g, x - 9 + q * 6, y - 29 + k * 28, '#bfe6f5', 1 - k * 0.6); }
  ringPx(g, x, y - 1, 12 + Math.round((now * 6) % 3), '#9ad0ff', 0.4, an => Math.sin(an) < 0);
}
/* CONFLAGRATION told: the staff held UP with a pillar of flame standing on it (grows to the sky) - over the existing crown. */
export function conflagPillar(g, x, y, p, now) {   /* (x, y) = the staff head */
  const f = Math.floor(now * 13) % 4, h = Math.round(26 + 18 * p), w = Math.round(8 + 4 * p);
  blit(g, flameSprite(w, h, f, 3), x, y - 8, false); disc(g, x, y - 20, 12 + Math.round(6 * p), C.cr, 0.1 + 0.15 * p);
  ringPx(g, x, y - 14, 10 + Math.round((now * 14) % 4), C.wh, 0.5 * p + 0.2);
}
/* A BURN MARK on the floor: a charred oval with glowing cracks, the ember seams brightening toward white as the mark nears its end or the eruption is told;
   a drift of ember pixels; the brand over it is brand() above. left = seconds to live (16 max), tell = CONFLAGRATION told (0-1 pulse, or -1 for off). */
export function scorch(g, x, y, left, tell, now, seed = 0) {
  const W = 11, ph = Math.floor(now * 3);
  g.globalAlpha = 0.6; g.fillStyle = C.out; g.fillRect(x - W, y - 2, W * 2 + 1, 2); g.fillRect(x - W + 2, y - 3, W * 2 - 3, 1); g.fillRect(x - W + 2, y, W * 2 - 3, 1); g.globalAlpha = 1;   /* the char */
  const hot = tell >= 0 ? (tell > 0.5 ? C.wh : C.yl) : left < 2 ? C.am : C.or;
  for (let i = -W + 2; i <= W - 2; i++) { const hh = hash(i * 3 + seed * 11); if (hh > 0.55 || (((i + ph) & 1) && tell < 0)) continue; px(g, x + i, y - 1 - (hh > 0.3 ? 1 : 0), i & 1 ? hot : C.rd, tell >= 0 ? 0.9 : 0.5 + 0.3 * Math.sin(now * 4 + i)); }   /* the glowing cracks */
  for (let i = 0; i < 3; i++) { const k = (now * 0.8 + hash(i * 7 + seed)) % 1; px(g, x - 7 + hash(i * 13 + seed) * 14, y - 3 - k * 10, C.yl, 1 - k); }
  if (tell >= 0) for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + now * 3; px(g, x + Math.cos(a) * (W + 2), y - 1 + Math.sin(a) * 3, C.cr, 0.5 + 0.5 * tell); }
}
/* THE RED RING on the floor where a big charged ball will land: a dashed ellipse of radius R, ticks that chase round it, a darker ground wash inside. */
export function landRing(g, X, Y, R, now) {
  const pul = 0.5 + 0.5 * Math.sin(now * 14), ry = Math.max(3, Math.round(R * 0.18));
  g.globalAlpha = 0.14; g.fillStyle = C.rd; g.beginPath(); g.ellipse(X, Y - 1, R, ry, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  const n = Math.max(16, Math.round(R * 0.8)), ph = Math.floor(now * 12);
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if ((i + ph) % 3 === 0) continue; px(g, X + Math.cos(a) * R, Y - 1 + Math.sin(a) * ry, i % 6 === ph % 6 ? C.yl : C.or, 0.55 + 0.4 * pul); }
  for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) { px(g, X + Math.cos(a) * (R - 3), Y - 1 + Math.sin(a) * (ry - 1), C.cr); px(g, X + Math.cos(a) * (R - 5), Y - 1 + Math.sin(a) * Math.max(1, ry - 2), C.yl); }
  px(g, X, Y - 1, C.cr, 0.6 + 0.4 * pul); px(g, X - 1, Y - 1, C.or, 0.5); px(g, X + 1, Y - 1, C.or, 0.5);
}
export { disc as _disc, ringPx as _ringPx, px as _px, hash as _hash };
