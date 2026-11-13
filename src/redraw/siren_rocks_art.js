// siren_rocks_art.js - SIREN ROCKS' LEVEL KIT (claude/srart, 2026-11-12), on the Reef's palette (wet blue-black rock, pearl, kelp, bone, tarred timber only where it IS the wreck).
// Pure drawing, fillRect only. The greybox rectangles of src/siren-rocks-hands.js are replaced by these:
//   drawStone      the SINGING STONE, five states: idle (dark basalt, a faint pearl vein) / hum (the tell: the vein lights from the foot up, notes gather) / song (the vein white-hot, a halo, rings)
//                  / struck (a shatter flash: shards leaving it) / silenced (a cracked stump, grey vein, a trickle of dust) / regrow (the stump humming back: a new pearl shoot). It is a GADGET:
//                  a gold chip on the cap while a blow would matter (the Queen sings).
//   drawSong       THE SONG STREAK, the reusable PULL visual: ribbons that curl IN to a point (skin 'song': pearl-violet ribbons with note ticks) or OUT from it (skin 'gust': pale air curls, for
//                  the whale's exhale). A tell shows short faint ribbons, a bite long bright ones.
//   drawBlowhole / drawRaft (pumice) / drawBell (the tide bell, a ship's bell on a bracket) / drawWreck (mast, crow's nest, rigging, ribs of the hold) / drawDressing (kelp ropes, barnacles, bone, pearl
//   glints on the rock lips) / SR_SKIN (the A3 dial in the Reef's pearl-and-iron case: src/redraw/sea_dial.js takes it as a plain object).
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp } from './sr_draw.js';
const R = Math.round, TS = 16;
export const SRK = {
  out: '#090c10', rock: ['#12141c', '#1b2428', '#2c313d', '#3a4c5a'], rockHi: '#4a5a6e', pearl: ['#96689f', '#c295d0', '#c9bde6', '#f0e8ff'], glow: '#c295d0', white: '#f6fbfc',
  kelp: ['#1d4224', '#3c5624', '#5d7d36', '#86a648'], bone: ['#a89c84', '#d8c894', '#e8e2c8'], barn: ['#6a6259', '#a8a392', '#cfc9bd'],
  pum: ['#8d8370', '#b4bcaa', '#d6d2c2', '#ece8d6'], tar: ['#120f0d', '#241e19', '#3a3228', '#5a4a3c'], brass: ['#5c4527', '#8a6a28', '#c8a24a', '#e8c24c'], foam: ['#dff7ee', '#9fd6c8', '#6fb8bc'],
};
/* the A3 dial in the reef's case (pearl + iron, the teal sea) - pass as the `skin` argument of sea_dial.js drawDial / drawHud / drawLever */
export const SR_SKIN = { name: 'pearl', case: ['#1b1528', '#342c4a', '#64406e', '#96689f', '#c9bde6'], glass: '#06121a', glassHi: '#1a3438', water: ['#275e6c', '#3f8c96', '#6fb8bc'], lip: '#dff7ee', pip: '#ffd36b', arrowIn: '#ff6b6b', arrowOut: '#9fd6c8',
  knob: '#c8a24a', arm: '#c9bde6', plate: ['#12141c', '#2c313d', '#4a5a6e'] };
const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };
let g_, ox_ = 0, oy_ = 0;
const rect = (x, y, w, h, c, a = 1) => { if (a !== 1) g_.globalAlpha = a; g_.fillStyle = c; g_.fillRect(R(ox_ + x), R(oy_ + y), R(w), R(h)); if (a !== 1) g_.globalAlpha = 1; };
const FLM = (L, oc = SRK.out, a = 1) => flush(L, (dx, dy, w, h, c, al) => rect(dx, dy, w, h, c, al * a), oc);
function at(g, x, y) { g_ = g; ox_ = R(x); oy_ = R(y); }

/* THE SINGING STONE. (x, feet) = the foot centre on screen. st = { state: 'idle'|'hum'|'song'|'silent'|'regrow', glow 0..1, struck 0..1 (just shattered), arena, chip } */
export function drawStone(g, x, feet, st = {}, t = 0) {
  at(g, x, feet); const gl = clamp(st.glow || 0), state = st.state || 'idle', sing = state === 'song' || gl > 0.7, hum = state === 'hum' || (gl > 0.2 && !sing);
  if (state === 'silent' || state === 'regrow') {
    const L = new Layer(); poly(L, [[-6, 0], [-5, -6], [-2, -9], [1, -7], [3, -10], [6, -6], [6, 0]], SRK.rock[2]); poly(L, [[-6, 0], [-5, -6], [-2, -9], [0, -4], [0, 0]], SRK.rock[1]);
    for (let i = 0; i < 4; i++) pset(L, -3 + i * 2, -3 - (i & 1), SRK.rockHi); pset(L, 1, -8, SRK.pearl[0]); pset(L, 2, -7, SRK.pearl[0]); pset(L, -1, -5, SRK.pearl[0]);
    if (state === 'regrow') { const k = 0.5 + 0.5 * Math.sin(t * 14); for (let j = 0; j < 4; j++) pset(L, 0, -11 - j, k > 0.5 ? SRK.pearl[3] : SRK.pearl[1]); pset(L, -1, -11, SRK.pearl[2]); pset(L, 1, -12, SRK.pearl[2]); }
    FLM(L);
    for (let i = 0; i < 3; i++) rect(-4 + i * 4 + Math.sin(t * 2 + i) * 1.5, -11 - ((t * 7 + i * 3) % 7), 1, 1, SRK.rockHi, 0.55);   /* dust off the stump */
    if (state === 'regrow') { rect(-9, -13 + Math.sin(t * 9), 1, 2, SRK.glow, 0.7); rect(8, -12 + Math.cos(t * 9), 1, 2, SRK.glow, 0.7); }
    return; }
  if (gl > 0.05) { for (let r = 0; r < 3; r++) { const rr = 10 + r * 5 + gl * 6 + Math.sin(t * 8 + r) * 1.5 * gl; for (let d = 0; d < 360; d += 24) rect(Math.cos(d * Math.PI / 180) * rr, -13 + Math.sin(d * Math.PI / 180) * rr * 0.9, 1, 1, r & 1 ? SRK.pearl[3] : SRK.glow, 0.5 * gl * (1 - r * 0.28)); } }
  /* the standing stone: a tapering basalt column with a shoulder, three facets, a cap */
  const L = new Layer(); poly(L, [[-7, 0], [-6, -12], [-5, -20], [-2, -24], [3, -23], [5, -19], [6, -11], [7, 0]], SRK.rock[1]);
  poly(L, [[-6, 0], [-5, -12], [-4, -20], [-2, -23], [-1, -22], [-1, 0]], SRK.rock[2]); poly(L, [[2, 0], [3, -10], [4, -19], [2, -22], [3, -10], [6, 0]], SRK.rock[0]);
  for (const [dx, dy] of [[-4, -14], [-3, -9], [-4, -4], [-2, -19]]) pset(L, dx, dy, SRK.rockHi);
  /* a foot of wet weed and barnacles */
  for (const dx of [-5, -3, 3, 5]) { pset(L, dx, -1, SRK.kelp[1]); pset(L, dx, -2, SRK.kelp[2]); } pset(L, 0, -1, SRK.barn[2]); pset(L, 1, -1, SRK.barn[1]);
  FLM(L);
  /* the pearl vein: a zigzag up the face; it fills from the foot as it hums, white-hot when it sings */
  const vein = [[0, -3], [1, -6], [0, -9], [-1, -12], [0, -15], [1, -18], [0, -21]], lit = sing ? 7 : hum ? Math.ceil(7 * Math.max(gl, 0.3) * (0.6 + 0.4 * Math.sin(t * 10))) : 2;
  vein.forEach(([dx, dy], i) => { const on = i < lit; const c = on ? (sing ? SRK.pearl[3] : SRK.pearl[2]) : SRK.pearl[0]; rect(dx - 1 + (i & 1), dy, 2, 3, c); if (on && sing) { rect(dx - 2 + (i & 1), dy + 1, 1, 1, SRK.glow, 0.8); rect(dx + 2 + (i & 1), dy + 1, 1, 1, SRK.glow, 0.8); } });
  /* a pearl set in the cap */
  rect(-1, -23, 2, 2, sing ? SRK.white : SRK.pearl[2]); rect(-1, -23, 1, 1, SRK.white);
  if (hum) for (let i = 0; i < 4; i++) { const a = t * 3 + i * 1.57, r = 16 - ((t * 10 + i * 4) % 10); rect(Math.cos(a) * r, -13 + Math.sin(a) * r * 0.7, 1, 1, SRK.pearl[3], 0.8); }   /* the notes gather */
  if (sing) for (let i = 0; i < 3; i++) { const nx = -10 + i * 10 + Math.sin(t * 4 + i) * 2, ny = -26 - ((t * 16 + i * 8) % 16); rect(nx, ny, 2, 2, SRK.pearl[3], 0.9); rect(nx + 1, ny - 4, 1, 4, SRK.pearl[3], 0.9); }
  if ((st.struck || 0) > 0.02) { const k = st.struck; for (let i = 0; i < 8; i++) { const a = i * 0.78 + 0.3, r = (1 - k) * 22 + 3; rect(Math.cos(a) * r - 1, -12 + Math.sin(a) * r - (1 - k) * 8, 3, 3, i & 1 ? SRK.rock[2] : SRK.pearl[3], k); } rect(-8, -20, 16, 16, SRK.white, 0.5 * k); }
  if (st.chip && Math.sin(t * 6) > 0) { rect(-1, -31, 3, 3, SRK.brass[3]); rect(0, -30, 1, 1, SRK.white); }   /* strike me while she sings */
}

/* THE SONG STREAK: fs = a pull-field row { f: { ring | box, at, dir, kind }, s 0..1, ph } (src/pull-field.js). skin 'song' (curl IN to f.at / the ring's eye) | 'gust' (curl OUT, pale) | any { in: bool, a, b, c, tick }.
   A tell: short, faint, few. A bite: long, bright, a head spark at the leading end. (the whale's gusts: drawSong(g, fs, cx, cy, t, VW, 'gust')) */
export const SONG_SKINS = { song: { inward: true, c: ['#c295d0', '#c9bde6', '#f0e8ff'], tick: true }, gust: { inward: false, c: ['#9fd6c8', '#dff7ee', '#f6fbfc'], tick: false } };
export function drawSong(g, fs, cx, cy, t, VW, skin = 'song') {
  const F = fs.f, S = typeof skin === 'string' ? SONG_SKINS[skin] || SONG_SKINS.song : skin, tell = fs.ph === 'tell', s = fs.s; if ((s <= 0.02 && !tell) || fs.still) return;
  let ex, ey, x0, y0, x1, y1;
  if (F.ring) { const [rx, ry, rr] = F.ring; ex = rx * TS + 8; ey = ry * TS + 8; x0 = ex - rr * TS; x1 = ex + rr * TS; y0 = ey - rr * TS; y1 = ey + rr * TS; }
  else { [x0, y0, x1, y1] = F.box; x0 *= TS; y0 *= TS; x1 = (x1 + 1) * TS; y1 = (y1 + 1) * TS; const at = F.at || [x1 / TS - 1, y0 / TS]; ex = at[0] * TS + 8; ey = at[1] * TS + 8; }
  if (x1 - cx < 0 || x0 - cx > VW) return;
  const rad = F.ring ? F.ring[2] * TS : Math.max(24, Math.min(110, Math.max(ex - x0, x1 - ex, 30)));
  const n = tell ? 6 : 10 + R(s * 6), a = tell ? 0.4 : 0.55 + 0.45 * s, ink = tell ? 0 : s, len = tell ? 5 : 9 + R(ink * 8);
  for (let i = 0; i < n; i++) {
    const h1 = hash(i, 7), per = 1.7 + (h1 % 6) * 0.15, u = (t / per + (h1 % 100) / 100) % 1, th0 = (h1 % 628) / 100, sw = 1.5 + (h1 % 3) * 0.3, vy = F.ring ? 0.7 : 0.5;
    for (let j = 0; j < len; j++) {
      const k = clamp((S.inward ? u : 1 - u) - j * 0.014 * (S.inward ? 1 : -1)), r = rad * (S.inward ? 1 - k : k) * 0.95 + 3, th = th0 + (S.inward ? k : -k) * sw;
      const X = ex + Math.cos(th) * r - cx, Y = ey + Math.sin(th) * r * vy - cy; if (X < -2 || X > VW + 2) continue;
      g.globalAlpha = a * Math.sin(u * Math.PI) * (1 - j / (len + 2)); g.fillStyle = j === 0 ? S.c[2] : j < 4 ? S.c[1] : S.c[0]; g.fillRect(R(X), R(Y), j < 3 ? 2 : 1, 1);
      if (S.tick && !tell && j === 0 && (h1 & 3) === 0) { g.fillStyle = S.c[2]; g.fillRect(R(X) + 1, R(Y) - 3, 1, 3); g.fillRect(R(X), R(Y) - 1, 1, 1); }
    }
  }
  g.globalAlpha = 1;
}
const at2 = g => { g_ = g; };

/* THE BLOWHOLE: ph 'quiet' | 'boom' | 'spout'. (x, feet) = the mouth on screen; rise = the column height in px (the hands' own timing); t = clock */
export function drawBlowhole(g, x, feet, ph, t, rise = 0) {
  at(g, x, feet); const L = new Layer();
  poly(L, [[-9, 0], [-7, -3], [-4, -4], [4, -4], [7, -3], [9, 0]], SRK.rock[2]); poly(L, [[-9, 0], [-7, -3], [-4, -4], [0, -4], [0, 0]], SRK.rock[3]); FLM(L);
  rect(-5, -4, 10, 2, '#06121a'); rect(-5, -4, 10, 1, SRK.rock[0]);           /* the throat */
  for (const dx of [-8, 7]) { rect(dx, -3, 1, 2, SRK.kelp[2]); rect(dx + (dx < 0 ? -1 : 1), -2, 1, 1, SRK.kelp[1]); }
  if (ph === 'boom') { const w = 3 + (Math.sin(t * 30) > 0 ? 1 : 0); rect(-w, -7 - (Math.sin(t * 22) > 0 ? 1 : 0), w * 2, 3, SRK.foam[0], 0.7); rect(-w + 1, -9, w * 2 - 2, 2, SRK.foam[1], 0.5); for (const dx of [-8, 8]) rect(dx, -4 - Math.abs(Math.sin(t * 40)) * 3, 1, 1, SRK.foam[0], 0.8); }
  if (ph === 'spout') { const h = Math.max(6, R(rise)); rect(-5, -4 - h, 10, h, SRK.foam[1], 0.55); rect(-3, -4 - h, 6, h, SRK.foam[0], 0.7); rect(-6 + (Math.sin(t * 25) > 0 ? 1 : 0), -4 - h - 3, 12, 3, SRK.foam[0], 0.8);
    for (let i = 0; i < 6; i++) rect(-7 + i * 3, -6 - ((t * 120 + i * 17) % h), 1, 2, SRK.white, 0.8); }
}

/* A PUMICE RAFT: (x, y) = top-left on screen, w px. A raft of grey pumice cobbles lashed with kelp rope, a pale lit top, a wet dark underside. */
export function drawRaft(g, x, y, w, t = 0) {
  at(g, x, y); const L = new Layer(); w = R(w);
  for (let i = 0; i < w; i += 6) { const hh = hash(i, 3), rw = Math.min(7, w - i), top = hh & 1; ell(L, i + rw / 2, 3 + top * 0.6, rw / 2 + 0.8, 3.2, SRK.pum); }
  for (let i = 3; i < w - 3; i += 5) { pset(L, i, 4, SRK.pum[0]); pset(L, i + 1, 2, SRK.pum[3]); }
  FLM(L); for (const dx of [w * 0.28, w * 0.7]) { rect(dx, 0, 1, 7, SRK.kelp[1]); rect(dx - 1, 3, 3, 1, SRK.kelp[2]); }    /* the kelp lashing */
  rect(0, 7, w, 1, SRK.foam[2], 0.45 + 0.2 * Math.sin(t * 3)); for (let i = 2; i < w - 2; i += 7) rect(i + Math.sin(t * 2 + i) * 1.5, 8, 3, 1, SRK.foam[0], 0.5);
}

/* THE TIDE BELL: (x, feet) on screen; swing 0..1 (ringing). A ship's bell on a whalebone bracket, the stern post under it. */
export function drawBell(g, x, feet, swing = 0, t = 0) {
  at(g, x, feet); const sw = R(Math.sin(t * 18) * 3 * swing), L = new Layer();
  cap(L, 0, 0, 0, -24, 1.4, 1.2, SRK.bone); cap(L, 0, -24, 9, -24, 1.1, 1.1, SRK.bone); cap(L, 0, -8, 5, -14, 1, 1, SRK.bone); FLM(L);
  rect(8 + sw * 0.3, -23, 1, 2, SRK.tar[3]);
  const B = new Layer(); poly(B, [[5 + sw, -20], [13 + sw, -20], [15 + sw, -13], [3 + sw, -13]], SRK.brass); poly(B, [[5 + sw, -20], [8 + sw, -20], [7 + sw, -13], [3 + sw, -13]], SRK.brass[3]); pset(B, 9 + sw, -12, SRK.brass[1]); FLM(B);
  rect(7 + sw, -18, 1, 4, SRK.white, 0.8); rect(8 + sw * 1.5, -12, 2, 2, SRK.brass[3]);
  for (let i = 0; i < 4; i++) rect(1 + i * 3, 0, 2, 1, SRK.kelp[1 + (i & 1)]);        /* weed round the post */
  if (swing > 0.1) { for (const s of [-1, 1]) rect(9 + s * 11, -17, 3, 1, SRK.brass[3], 0.7 * swing); rect(9, -28, 1, 3, SRK.brass[3], 0.7 * swing); }
}

/* THE WRECK: the mast, the crow's nest and the rigging (columns: mast col 224, rows 13..26, nest row 12, cols 222..226; the hold cols 216..236, rows 29..33). cx, cy = camera. */
export function drawWreck(g, cx, cy, t, VW) {
  const mx = 224 * TS + 8 - cx; if (mx < -90 || mx > VW + 90) return; at(g, mx, 27 * TS - cy);
  const top = -(27 - 12) * TS - 6, L = new Layer();
  cap(L, 0, 0, 0, top, 3.2, 2.4, SRK.tar);                                                           /* the mast, tarred, banded in rope */
  for (let y = -10; y > top; y -= 36) { pset(L, -2, y, SRK.bone[1]); pset(L, -1, y, SRK.bone[1]); pset(L, 0, y, SRK.bone[1]); pset(L, 1, y, SRK.bone[1]); pset(L, 2, y, SRK.bone[1]); }
  cap(L, -22, top + 52, 22, top + 52, 1.4, 1.4, SRK.tar);                                            /* a yard, its sail long gone */
  FLM(L);
  const N = new Layer(); poly(N, [[-14, top + 2], [14, top + 2], [11, top - 8], [-11, top - 8]], SRK.tar); for (let x = -9; x <= 9; x += 6) pset(N, x, top - 4, SRK.tar[0]); cap(N, -14, top + 2, 14, top + 2, 1.2, 1.2, SRK.brass); FLM(N);
  for (const s of [-1, 1]) { line_(g, s * 22, top + 52, s * 54, 2, SRK.tar[2]); line_(g, s * 11, top - 6, s * 22, top + 52, SRK.tar[2], 1); }   /* the stays */
  for (let i = 0; i < 6; i++) { const wx = -18 + i * 7, sag = Math.sin(t * 1.4 + i) * 1.5; rect(wx, top + 52 + 2, 1, 7 + (i & 1) * 3 + sag, SRK.kelp[1 + (i & 1)]); }   /* weed hung on the yard */
  rect(-1, top - 12, 3, 1, SRK.bone[2]); rect(0, top - 14, 1, 3, SRK.bone[2]); rect(1, top - 13, 4, 2, SRK.bone[1]);   /* a bone-white pennant stump */
  /* the ribs of her hold, on the back wall behind the hatch */
  for (let c = 217; c < 236; c += 3) { const rx = c * TS + 8 - cx, ry = 29 * TS - cy; if (rx < -20 || rx > VW + 20) continue; at(g, rx, ry); const R2 = new Layer();
    cap(R2, 0, 0, 3, 24, 2, 1.6, SRK.tar, {}); cap(R2, 3, 24, 1, 54, 1.6, 1.2, SRK.tar); FLM(R2, SRK.out, 0.8); rect(0, 18 + (c & 3), 2, 1, SRK.kelp[2]); rect(1, 33, 3, 1, SRK.barn[1]); }
}
function line_(g, x0, y0, x1, y1, c, th = 1) { const n = Math.max(1, R(Math.hypot(x1 - x0, y1 - y0))); g.fillStyle = c; for (let i = 0; i <= n; i += 2) g.fillRect(R(ox_ + x0 + (x1 - x0) * i / n), R(oy_ + y0 + (y1 - y0) * i / n), th, th); }

/* THE DRESSING: kelp tufts hung off a rock lip, barnacle clusters on its face, a bone, a pearl glint - on every rock-top tile in view. isSolid(tx, ty) = the level; row range 18..38. Deterministic per tile. */
export function drawDressing(g, cx, cy, t, VW, VH, isSolid, W = 410) {
  g_ = g; ox_ = 0; oy_ = 0; const tx0 = Math.max(0, Math.floor(cx / TS) - 1), tx1 = Math.min(W - 1, Math.ceil((cx + VW) / TS) + 1), ty0 = Math.max(10, Math.floor(cy / TS) - 1), ty1 = Math.min(39, Math.ceil((cy + VH) / TS) + 1);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    if (!isSolid(tx, ty)) continue; const h = hash(tx, ty), x = tx * TS - cx, y = ty * TS - cy, top = !isSolid(tx, ty - 1), below = !isSolid(tx, ty + 1), left = !isSolid(tx - 1, ty), right = !isSolid(tx + 1, ty);
    if (top) { if (h % 5 === 0) { const hh = 4 + (h >> 4) % 4; for (let k = 0; k < 3; k++) { rect(x + 3 + k * 4, y - 2 - (k & 1), 1, hh - (k & 1) * 2, SRK.kelp[1 + (k & 1)]); rect(x + 4 + k * 4, y - 1, 1, 2, SRK.kelp[2]); } }   /* a tuft of weed on the lip */
      if (h % 7 === 1) { rect(x + 5, y - 2, 2, 2, SRK.barn[2]); rect(x + 8, y - 1, 2, 1, SRK.barn[1]); rect(x + 6, y - 3, 1, 1, SRK.barn[2]); }
      if (h % 23 === 2) { rect(x + 4, y - 2, 6, 1, SRK.bone[1]); rect(x + 3, y - 3, 2, 2, SRK.bone[2]); rect(x + 9, y - 3, 2, 2, SRK.bone[2]); }                                     /* a bone on the rock */
      if (h % 13 === 3) { const k = (Math.sin(t * 3 + tx) + 1) / 2; rect(x + 7, y + 1, 1, 1, SRK.pearl[3], 0.4 + 0.5 * k); } }
    if (below && h % 4 === 1) { for (let k = 0; k < 3; k++) rect(x + 3 + k * 4 + (h & 1), y + TS, 1, 2 + ((h >> 3) + k) % 4, SRK.kelp[k & 1 ? 1 : 0]); }       /* weed hanging off an overhang */
    if ((left || right) && h % 6 === 2) { const wx = left ? x : x + TS - 2; rect(wx, y + 4 + (h >> 5) % 6, 2, 2, SRK.barn[1]); rect(wx + (left ? -1 : 1), y + 5 + (h >> 5) % 6, 1, 1, SRK.barn[2]); }
    if (h % 17 === 4 && !top) { rect(x + 3 + (h >> 6) % 8, y + 3 + (h >> 9) % 8, 1, 3, SRK.pearl[0]); rect(x + 4 + (h >> 6) % 8, y + 4 + (h >> 9) % 8, 1, 1, SRK.pearl[2]); }  /* a pearl vein in the face */
  }
}
