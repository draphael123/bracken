// conductor_art.js - THE CONDUCTOR's ART (claude/gtart): the boss's poses (idle/sleep, wake, walk, lantern swing wind-up + release, ticket punch wind-up + release, TUNNEL AHEAD whistle,
// THROWN, the brake opening lying down, refusing, rise, glide, fuse), the FIREBOX he fuses with in phase two (door, furnace face, jet, burning hand), the emergency brake handle with its
// pressure gauge, the punched holes, the uncoupling's pin, and his death (a coat of tickets coming apart). Rect-only so tools/gtart-sheet.mjs renders it in Node.
// drawConductor(g, ex, ey, pose, o): feet at (ex, ey), facing right then mirrored by o.face.  POSE is src/conductor-hands.js's table (the lantern / punch hand points, lean, mouth, eyes).
import { glow } from './gt_art.js';
const R = Math.round;
const rect = (g, x, y, w, h, col) => { if (w <= 0 || h <= 0) return; g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const disc = (g, cx, cy, r, col) => { g.fillStyle = col; for (let dy = -r; dy <= r; dy++) { const h = Math.floor(Math.sqrt(r * r - dy * dy + 0.5)); g.fillRect(R(cx - h), R(cy + dy), h * 2 + 1, 1); } };
export const CC = { coat: '#2a3050', coatL: '#3e4874', coatD: '#181c32', gold: '#e0b840', goldD: '#8a6a20', bone: '#dce4f2', boneD: '#a8b4cc', cap: '#1a1e34', capL: '#2e3458', out: '#0e1020',
  lamp: '#fff0c4', lampG: '#9effd0', red: '#ff4a3a', brass: '#d0aa4a', steel: '#c8ccd8', steelD: '#6a7088', ticket: '#f0e0b0', ticketD: '#c8a860' };

/* a line of 1-px steps between two points (arms, the lantern's handle) */
function line(g, x0, y0, x1, y1, col, th = 2) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) rect(g, x0 + (x1 - x0) * i / n - th / 2, y0 + (y1 - y0) * i / n - th / 2, th, th, col); }
/* rows sheared by `lean` px over the height: a leaning torso without a rotate */
function lean(g, x, y, w, h, col, lp) { for (let r = 0; r < h; r++) rect(g, x + lp * (1 - r / h), y + r, w, 1, col); }

export function drawConductor(g, ex, ey, pose, o) {
  const { face = -1, time = 0, flash = 0, mode } = o, f = face >= 0 ? 1 : -1, p = pose, X = v => ex + v * f, W = (v, w) => (f > 0 ? ex + v : ex - v - w);
  const R_ = (v, y, w, h, col) => rect(g, W(v, w), ey + y, w, h, col);
  const a = p.burn ? 0.55 + 0.4 * Math.sin(time * 20) : 1; g.globalAlpha = a;
  const fl = flash > 0;
  const c0 = fl ? '#ffffff' : CC.coat, c1 = fl ? '#e8ecff' : CC.coatL, bone = fl ? '#ffffff' : CC.bone;
  if (p.flat) {                                                                                                                 /* THE BRAKE OPENING: laid out on the boards, dazed - cap off, lantern rolled away, stars wheeling */
    R_(-18, -9, 32, 9, c0); R_(-18, -9, 32, 2, c1); R_(-18, -2, 32, 2, CC.coatD); for (let k = 0; k < 4; k++) R_(-10 + k * 6, -7, 2, 2, CC.gold);
    R_(14, -11, 10, 10, bone); R_(16, -8, 2, 2, '#0a0610'); R_(20, -8, 2, 2, '#0a0610'); R_(17, -4, 5, 1, '#0a0610'); R_(-4, -12, 2, 3, CC.goldD);
    R_(-26, -7, 9, 7, CC.cap); R_(-26, -7, 9, 1, CC.capL); R_(-30, -3, 5, 3, CC.brass); R_(-29, -2, 3, 1, CC.lampG);
    for (let k = 0; k < 3; k++) { const an = time * 4 + k * 2.1; rect(g, X(19 + Math.cos(an) * 9) - 1, ey - 22 + Math.sin(an) * 3, 3, 3, k % 2 ? '#ffd36b' : '#fff0c4'); } g.globalAlpha = 1; return; }
  const sway = p.float ? Math.sin(time * 4) * 1.5 : 0, lx = p.lean;
  /* legs and boots (striped trousers), two strides when walking */
  const step = mode === 'walk' ? Math.sin(time * 9) * 2 : 0;
  R_(-5 + step, -11, 4, 11, '#20244a'); R_(1 - step, -11, 4, 11, '#20244a'); R_(-6 + step, -2, 6, 2, CC.out); R_(1 - step, -2, 6, 2, CC.out); R_(-4 + step, -11, 1, 9, '#3a4278');
  /* the long coat: skirts that hang from the waist, brass buttons double-breasted, gold piping, a watch chain across the chest */
  lean(g, W(-7, 14) + lx * f * 0.1, ey - 32 + sway, 14, 22, c0, lx * f * 0.5);
  R_(-7 + lx * 0.15, -32 + sway, 14, 3, c1); R_(-7 + lx * 0.1, -12, 14, 1, CC.gold); R_(-8 + lx * 0.05, -11, 3, 8, c0); R_(5 + lx * 0.05, -11, 3, 8, c0);    /* the tails */
  for (let k = 0; k < 3; k++) { R_(-3 + lx * 0.3, -28 + k * 5 + sway, 2, 2, CC.gold); R_(2 + lx * 0.3, -28 + k * 5 + sway, 2, 2, CC.gold); }
  R_(-5 + lx * 0.3, -29 + sway, 9, 1, CC.goldD); R_(1 + lx * 0.3, -26 + sway, 4, 1, CC.gold); R_(-6, -31 + sway, 4, 2, CC.coatD);
  /* the head: a skull under a peaked cap, one gold wheel-badge, sockets by the pose's eyes */
  const hx = lx * 0.55, hy = -42 + sway;
  R_(-4 + hx, hy, 9, 10, bone); R_(-4 + hx, hy + 8, 9, 2, CC.boneD); R_(-2 + hx, hy + 9, 5, 2, bone); R_(-1 + hx, hy + 10, 1, 1, '#0a0610'); R_(1 + hx, hy + 10, 1, 1, '#0a0610');
  R_(-5 + hx, hy - 4, 11, 4, CC.cap); R_(-5 + hx, hy - 4, 11, 1, CC.capL); R_(0 + hx, hy - 1, 9, 2, CC.cap); R_(1 + hx, hy - 3, 3, 2, CC.gold); R_(2 + hx, hy - 3, 1, 1, '#fff0c4');
  const ec = p.eyes === 'red' ? CC.red : p.eyes === 'bulge' ? '#ffffff' : p.eyes === 'open' ? CC.lampG : '#4a5068';
  if (p.eyes === 'shut') { R_(-2 + hx, hy + 4, 3, 1, ec); R_(2 + hx, hy + 4, 3, 1, ec); } else { R_(-2 + hx, hy + 3, 3, p.eyes === 'bulge' ? 4 : 3, '#0a0610'); R_(2 + hx, hy + 3, 3, p.eyes === 'bulge' ? 4 : 3, '#0a0610'); R_(-1 + hx, hy + 4, 2, 2, ec); R_(3 + hx, hy + 4, 2, 2, ec); if (p.eyes === 'red') { glow(g, X(hx + 0), ey + hy + 5, 8, CC.red, 0.3, 2); } }
  if (p.mouth !== 'shut') { const mh = p.mouth === 'wide' ? 4 : 2; R_(-1 + hx, hy + 7, 4, mh, '#0a0610'); if (p.mouth === 'wide') { R_(-1 + hx, hy + 7, 1, 1, bone); R_(2 + hx, hy + 7, 1, 1, bone); } }
  if (p.cup) { R_(5 + hx, hy + 6, 6, 3, CC.brass); R_(10 + hx, hy + 5, 2, 5, CC.goldD); R_(6 + hx, hy + 6, 4, 1, '#fff0c4');                                      /* the whistle at his teeth, steam from it */
    for (let k = 0; k < 3; k++) { g.globalAlpha = 0.5 - k * 0.15; rect(g, X(14 + hx + k * 5), ey + hy + 3 - ((time * 20 + k * 6) % 8), 4, 3, '#dceaf8'); } g.globalAlpha = a; }
  /* the arms: the lantern hand and the punch hand, each a line from its shoulder */
  const sh = [X(-5 + lx * 0.3), ey - 28 + sway], sh2 = [X(5 + lx * 0.3), ey - 28 + sway];
  const lh = [X(p.lan[0]), ey + p.lan[1]], ph = [X(p.pun[0]), ey + p.pun[1]];
  line(g, sh[0], sh[1], lh[0], lh[1], c0, 3); line(g, sh2[0], sh2[1], ph[0], ph[1], c0, 3); rect(g, lh[0] - 1, lh[1] - 1, 3, 3, bone); rect(g, ph[0] - 1, ph[1] - 1, 3, 3, bone);
  /* THE LANTERN: a brass storm lantern, its glass pale green; a swing's wind-up throws the light behind him, the release a long arc */
  const lamBright = mode === 'swing' ? 0.45 : mode === 'swingTell' ? 0.36 : 0.22; rect(g, lh[0] - 3, lh[1] - 2, 7, 9, CC.brass); rect(g, lh[0] - 2, lh[1] - 1, 5, 7, CC.lamp); rect(g, lh[0] - 1, lh[1], 3, 4, CC.lampG); rect(g, lh[0] - 4, lh[1] - 3, 9, 2, CC.goldD); rect(g, lh[0] - 1, lh[1] - 7, 3, 4, CC.goldD);
  glow(g, lh[0], lh[1] + 2, mode === 'swing' ? 22 : 14, CC.lampG, lamBright, 3);
  if (mode === 'swing') { for (let k = 1; k <= 4; k++) { g.globalAlpha = 0.5 - k * 0.1; rect(g, lh[0] - f * (k * 6 + 4), lh[1] - 2 + k, 5, 7, CC.lampG); } g.globalAlpha = a; }
  /* THE TICKET PUNCH: steel jaws on a brass handle; wound up it clacks open and shut, released it is closed on the air */
  const open = p.clack ? ((time * 8) % 2 < 1 ? 5 : 1) : mode === 'punch' ? 0 : 3;
  rect(g, ph[0] - 2, ph[1] - 2, 5, 5, CC.brass); line(g, ph[0], ph[1], ph[0] + f * 5, ph[1] - open, CC.steel, 2); line(g, ph[0], ph[1], ph[0] + f * 5, ph[1] + open, CC.steel, 2); rect(g, ph[0] + f * 5, ph[1] - 1, 2, 2, CC.steelD);
  if (mode === 'punch') { rect(g, ph[0] + f * 8, ph[1] - 1, 4, 3, CC.ticket); rect(g, ph[0] + f * 9, ph[1], 2, 1, CC.red); for (let k = 0; k < 4; k++) rect(g, ph[0] + f * (11 + k * 3), ph[1] - 4 + k * 3, 2, 2, CC.ticket); }
  if (mode === 'punchTell') { rect(g, ph[0] + f * 3, ph[1] + 4, 3, 3, CC.ticket); rect(g, ph[0] + f * 3, ph[1] + 5, 1, 1, CC.red); }
  if (p.tumble) for (let k = 0; k < 3; k++) { const an = time * 7 + k * 2; rect(g, X(Math.cos(an) * 14), ey - 46 + Math.sin(an) * 4, 3, 3, k % 2 ? '#ffd36b' : '#fff0c4'); }   /* THROWN: tumbling, stars about his head */
  g.globalAlpha = 1;
}

/* ================= PHASE TWO: THE FIREBOX ================= */
/* the furnace door he is fused with: a round brass-ringed mouth in the backhead (centre ex, ey = the deck), glow 0 idle .. 2 about to fire; hand = the burning hand's reach to the left */
export function drawFirebox(g, ex, ey, o) {
  const { glow: gl = 0, hand = 0, time = 0, mouth = 'wide', chuff } = o, cy = ey - 20, fk = Math.sin(time * 14);
  glow(g, ex - 14, cy, 40 + gl * 12, '#ff6a2a', 0.2 + gl * 0.12, 3);
  rect(g, ex - 18, cy - 17, 22, 34, '#1a1620'); rect(g, ex - 16, cy - 15, 18, 30, CC.goldD); rect(g, ex - 14, cy - 13, 14, 26, '#0a0608');                       /* the door frame and its black throat */
  const fire = gl > 1 ? '#fff1a0' : gl ? '#ff9a3c' : '#c0401a';
  rect(g, ex - 13, cy - 12, 12, 24, '#4a1208'); for (let k = 0; k < 5; k++) { const hh = 10 + ((k * 7 + (time * 8 | 0) * 3) % 9) + (gl ? 4 : 0); rect(g, ex - 13 + k * 2.5, cy + 12 - hh, 3, hh, k % 2 ? fire : '#ff6a2a'); rect(g, ex - 12 + k * 2.5, cy + 12 - hh + 3, 1, hh - 5, '#ffe9a0'); }   /* the fire's tongues */
  rect(g, ex - 12, cy - 9 + fk * 0.5, 4, 5, '#0a0608'); rect(g, ex - 6, cy - 9 + fk * 0.5, 4, 5, '#0a0608'); rect(g, ex - 11, cy - 8, 2, 3, '#ffe9a0'); rect(g, ex - 5, cy - 8, 2, 3, '#ffe9a0');   /* HIS EYES in the flames */
  rect(g, ex - 11, cy - 7, 1, 1, '#ffffff'); rect(g, ex - 5, cy - 7, 1, 1, '#ffffff'); rect(g, ex - 12, cy - 5, 2, 1, '#2a0a04'); rect(g, ex - 7, cy - 5, 2, 1, '#2a0a04');
  rect(g, ex - 11, cy - 1, 8, mouth === 'wide' ? 7 : mouth === 'open' ? 4 : 2, '#0a0608'); if (mouth === 'wide') for (let k = 0; k < 4; k++) { rect(g, ex - 11 + k * 2, cy - 1, 1, 2, '#dce4f2'); rect(g, ex - 10 + k * 2, cy + 5, 1, 1, '#dce4f2'); }
  rect(g, ex - 18, cy - 17, 22, 2, CC.gold); rect(g, ex - 18, cy + 15, 22, 2, CC.goldD); for (const [dx, dy] of [[-17, -14], [1, -14], [-17, 12], [1, 12]]) rect(g, ex + dx, cy + dy, 2, 2, '#fff0c4');
  rect(g, ex - 2, cy - 4, 6, 5, '#46465e'); rect(g, ex - 2, cy - 4, 6, 1, '#8c8caa');                                                                                       /* the latch */
  if (hand > 0) { const L = hand + 6;                                                                                                                                       /* THE BURNING HAND: a glove of coals reaching out of the door along the deck, claws spread */
    for (let k = 0; k < L; k += 3) { rect(g, ex - 20 - k, cy + 3 + Math.sin(k + time * 12) * 1.5, 4, 5, k % 2 ? '#ff6a2a' : '#c0401a'); rect(g, ex - 20 - k, cy + 3 + Math.sin(k + time * 12) * 1.5, 4, 1, '#ffd36b'); }
    const hx = ex - 20 - L; rect(g, hx - 6, cy, 8, 12, '#2a1a14'); for (let k = 0; k < 4; k++) { rect(g, hx - 10, cy + 1 + k * 3, 6, 2, k % 2 ? '#ff9a3c' : '#c0401a'); rect(g, hx - 11, cy + 1 + k * 3, 2, 1, '#ffe9a0'); } glow(g, hx - 4, cy + 6, 16, '#ff6a2a', 0.3, 2); }
}
export function drawJet(g, x0, x1, y, h, time, hot) {                                                                                                                         /* THE FIREBOX JET: a low sheet of flame, told by gl, tongues leaning back from the door */
  const w = x1 - x0; g.globalAlpha = 0.5; rect(g, x0, y - h, w, h, '#c0401a'); g.globalAlpha = 0.9;
  for (let k = 0; k < w; k += 6) { const hh = h - 4 + Math.sin(time * 18 + k * 0.7) * 5 - (k / w) * h * 0.4; rect(g, x0 + k, y - hh, 5, hh, k % 12 ? '#ff9a3c' : '#ff6a2a'); rect(g, x0 + k + 1, y - hh * 0.7, 3, hh * 0.7, '#ffd36b'); rect(g, x0 + k + 2, y - hh * 0.4, 1, hh * 0.4, '#fff8d0'); }
  g.globalAlpha = 1; glow(g, x0 + w / 2, y - h / 2, w / 2, '#ff9a3c', 0.18, 2);
}

/* ================= THE EMERGENCY BRAKE: a handle in each car, its gauge, its charge ================= */
export function drawBrake(g, bx, by, press, time, live) {
  const charged = press >= 1; rect(g, bx - 8, by + 3, 16, 5, '#14121c'); rect(g, bx - 8, by + 3, 16, 1, '#686886'); rect(g, bx - 3, by - 8, 6, 12, '#28283c'); rect(g, bx - 3, by - 8, 6, 1, '#686886');
  for (let k = 0; k < 11; k++) rect(g, bx - 1 + (k > 6 ? 0 : 0), by - 8 - k, 3, 1, k % 3 ? CC.red : '#a8281c'); disc(g, bx + 1, by - 21, 3, charged ? '#ff6a4a' : '#a8281c'); rect(g, bx, by - 23, 1, 1, '#ffd0c8');   /* the red handle and its knob */
  rect(g, bx - 4, by - 7, 8, 1, '#80642a');
  const gy = by - 36; disc(g, bx, gy, 8, '#80642a'); disc(g, bx, gy, 6, CC.bone); for (let k = 0; k < 8; k++) { const an = -2.4 + k * 0.48; rect(g, bx + Math.cos(an) * 5.5, gy + Math.sin(an) * 5.5, 1, 1, k > 5 ? '#ff4a3a' : '#46465e'); }   /* the dial: red in the last arc */
  const an = -2.4 + press * 3.36; line(g, bx, gy, bx + Math.cos(an) * 5, gy + Math.sin(an) * 5, '#14121c', 1); rect(g, bx, gy, 1, 1, '#14121c');
  rect(g, bx - 10, gy + 12, 20, 3, '#14121c'); rect(g, bx - 9, gy + 13, Math.max(0, R(18 * press)), 1, charged ? '#8fd160' : '#c8a040');
  if (charged) { glow(g, bx + 1, by - 20, 14, '#8fd160', 0.28 + 0.12 * Math.sin(time * 8), 2); const ar = (time * 6 | 0) % 2; rect(g, bx - 1, gy - 14 - ar, 3, 5, '#8fd160'); rect(g, bx - 3, gy - 10 - ar, 7, 1, '#8fd160'); rect(g, bx - 2, gy - 9 - ar, 5, 1, '#8fd160'); rect(g, bx - 1, gy - 8 - ar, 3, 1, '#8fd160'); }   /* READY: it glows and an arrow bobs over the gauge */
}
/* THE PUNCHED HOLES: told as a ticket-punch ring on the boards (a red dash going round it); gone as a black, bent-edged hole */
export function drawHoleTell(g, x, y, TS, time) { const k = (time * 10) % 2 < 1; rect(g, x, y - 1, TS, 3, k ? '#ff4a2a' : '#ff9a5c'); rect(g, x + 2, y + 2, TS - 4, 1, 'rgba(255,90,40,0.5)'); for (const [dx, dy] of [[1, 3], [TS - 3, 3], [TS / 2 - 1, 5]]) rect(g, x + dx, y + dy, 2, 2, k ? '#ffd36b' : '#fff0c4'); }
export function drawHoleOpen(g, x, y, TS) { rect(g, x, y, TS, TS, 'rgba(2,2,8,0.88)'); rect(g, x + 1, y, TS - 2, 2, '#0a0a14'); for (let k = 0; k < TS; k += 3) rect(g, x + k, y + 2, 2, 2 + (k % 2), '#46465e'); rect(g, x, y, 1, TS, '#34344a'); rect(g, x + TS - 1, y, 1, TS, '#34344a'); rect(g, x + 4, y + 7, 3, 2, CC.ticket); }
export function drawUncouple(g, x, y, tell, time) { rect(g, x - 1, y - 30, 3, 30, tell ? CC.red : '#ffd36b'); if (tell) { const k = (time * 12) % 2 < 1; glow(g, x, y - 10, 22, CC.red, k ? 0.3 : 0.15, 2); rect(g, x - 5, y - 36, 11, 3, k ? '#ff9a5c' : '#ff4a2a'); for (let i = 0; i < 4; i++) rect(g, x - 6 + i * 4, y - 3 - (i % 2) * 2, 3, 3, '#ffd36b'); } }

/* ================= DEATH: his coat comes apart into tickets, the cap rolls ================= */
export function drawCorpse(g, ex, ey, t, o = {}) {
  const k = Math.min(1, t / 2.4), fall = Math.min(1, t * 3);
  g.globalAlpha = 1 - k * 0.85; const w = 30 - R(fall * 4), cy = ey - 4 + R((1 - fall) * -22);
  rect(g, ex - 16, cy - 6, w, 7, CC.coat); rect(g, ex - 16, cy - 6, w, 2, CC.coatL); for (let i = 0; i < 4; i++) rect(g, ex - 10 + i * 6, cy - 5, 2, 2, CC.gold);
  rect(g, ex + 14, cy - 8, 9, 9, CC.bone); rect(g, ex + 16, cy - 5, 2, 2, '#0a0610'); rect(g, ex + 20, cy - 5, 2, 2, '#0a0610');
  rect(g, ex + 24 + R(k * 12), cy + 1, 9, 3, CC.cap); rect(g, ex + 24 + R(k * 12), cy + 1, 9, 1, CC.capL);
  g.globalAlpha = 1;
  for (let i = 0; i < 26; i++) { const h = ((i * 2654435761) >>> 0), ang = (h % 100) / 100 * Math.PI, sp = 20 + (h >>> 8) % 50, tx = ex - 14 + (h >>> 3) % 30 + Math.cos(ang) * sp * t * 0.9 * (i % 2 ? 1 : -1), ty = cy - 4 - Math.sin(ang) * sp * t + 30 * t * t, fl = Math.floor(t * 6 + i) % 2;
    g.globalAlpha = Math.max(0, 1 - k * 1.1); rect(g, tx, ty, fl ? 4 : 2, fl ? 2 : 4, i % 3 ? CC.ticket : CC.ticketD); if (i % 5 === 0) rect(g, tx + 1, ty, 1, 1, CC.red); }
  g.globalAlpha = 1; if (k < 0.6) glow(g, ex, cy - 6, 30, CC.lampG, 0.15 * (1 - k), 2);
}
