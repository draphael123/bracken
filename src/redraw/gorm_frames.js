// src/redraw/gorm_frames.js - KING GORM's NEW POSES, baked (claude/gorm2art, Sonnet art pass). HIS LOOK STAYS: the same green jowls and tusks, crown, fur-trimmed red robe and belt as src/chars.js bakeKingBig, drawn with
// the same primitives and palette - what is new is every windup and release having ITS OWN frame (B16) instead of a shared frame with boxes over it:
//   STANDING (up2): sweepTell sweep | limbTell | clubHiTell clubHi | clubLoTell clubLo | logTell log | quakeTell quakeAir quake | shakeTell shake | downed | stung | hornTellUp hornUp | grabTellUp grabUp | walkClub | throneSleep throneWake
//   SEATED on the litter (seat2): chargeTell charge | grabTell grab | hornTell horn | fleeTell fleeCarried
// and THE BEARERS (four goblins of the court under the litter's poles: lift, walk, run). Each club / limb / horn is baked IN the frame; where a flame belongs the bake writes TIPS[name] = [[x, y], ...] (px from
// the sprite's anchor: x from the centre line, y up from the feet, facing right) so the pose code can set fire to it without a hand-measured number. Everything bakes once, on first use.
import { canvas, rect, line, circle, outline, flipX, whiten } from '../px.js';

const SK = '#6faa4a', SKD = '#3f6e2c', SKL = '#8fd160', RB = '#c9463d', RBD = '#8f2f28', RBL = '#e07060', FUR = '#e8dcc0', GLD = '#ffd36b', GLD2 = '#a07a1c', EYE = '#f3f0d2', BELT = '#3a2e22', TOOTH = '#fff6e0', WOOD = '#5c3a1d', OUT = '#1b1626';
const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
export const TIPS = {};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };

/* ---------- the body, as bakeKingBig draws it, with the parts a pose moves ---------- */
function head(g, x, y, mouth, eyes) {   /* 30 wide, 22 tall; mouth 0 shut / 1 shout / 2 gritted / 3 horn-pout; eyes 0 open / 'shut' / 'x' / 'wide' */
  rect(g, x + 3, y, 24, 6, SK); rect(g, x, y + 4, 30, 14, SK); rect(g, x - 4, y + 8, 38, 11, SK); rect(g, x - 2, y + 18, 34, 4, SKD); rect(g, x + 1, y + 21, 28, 3, SK); rect(g, x + 3, y + 23, 24, 1, SKD);
  rect(g, x + 1, y + 5, 3, 5, SKD); rect(g, x + 26, y + 5, 3, 5, SKD); rect(g, x - 3, y + 3, 5, 7, SK); rect(g, x + 28, y + 3, 5, 7, SK);
  rect(g, x + 3, y + 2, 10, 1, SKL); rect(g, x - 2, y + 4, 2, 3, SKL);   /* the light on the brow */
  if (eyes === 'shut') { rect(g, x + 6, y + 9, 6, 1, OUT); rect(g, x + 18, y + 9, 6, 1, OUT); rect(g, x + 6, y + 10, 6, 1, SKD); rect(g, x + 18, y + 10, 6, 1, SKD); }
  else if (eyes === 'x') { for (const ex of [x + 7, x + 19]) { line(g, ex, y + 7, ex + 4, y + 11, OUT, 1); line(g, ex + 4, y + 7, ex, y + 11, OUT, 1); } }
  else { rect(g, x + 6, y + 7, 6, eyes === 'wide' ? 6 : 5, EYE); rect(g, x + 18, y + 7, 6, eyes === 'wide' ? 6 : 5, EYE); rect(g, x + 9, y + 8, 2, 3, OUT); rect(g, x + 21, y + 8, 2, 3, OUT); }
  rect(g, x + 5, y + (eyes === 'wide' ? 4 : 6), 8, 1, SKD); rect(g, x + 17, y + (eyes === 'wide' ? 4 : 6), 8, 1, SKD);
  rect(g, x + 13, y + 11, 4, 3, SKD);
  if (mouth === 1) { rect(g, x + 8, y + 15, 14, 6, RBD); rect(g, x + 9, y + 15, 2, 2, TOOTH); rect(g, x + 19, y + 15, 2, 2, TOOTH); rect(g, x + 13, y + 19, 4, 2, RBL); }
  else if (mouth === 3) { rect(g, x + 11, y + 14, 8, 6, RBD); rect(g, x + 12, y + 15, 6, 4, '#2a0e0a'); rect(g, x + 7, y + 15, 2, 3, TOOTH); rect(g, x + 21, y + 15, 2, 3, TOOTH); rect(g, x - 1, y + 12, 5, 6, SKL); rect(g, x + 26, y + 12, 5, 6, SKL); }   /* cheeks blown out */
  else { rect(g, x + 8, y + 16, 14, 1, SKD); rect(g, x + 7, y + 15, 2, 3, TOOTH); rect(g, x + 21, y + 15, 2, 3, TOOTH); if (mouth === 2) rect(g, x + 10, y + 16, 10, 2, TOOTH); }
}
function crown(g, x, y, askew) {
  if (askew) { x += askew; y += 2; }
  rect(g, x, y + 3, 26, 5, GLD); rect(g, x, y + 7, 26, 1, GLD2); for (let i = 0; i < 5; i++) { rect(g, x + 1 + i * 6, y, 2, 4, GLD); px(g, x + 1 + i * 6, y, '#fff6e0'); }
  rect(g, x + 4, y + 4, 2, 2, RB); rect(g, x + 12, y + 4, 2, 2, '#5aa0e0'); rect(g, x + 20, y + 4, 2, 2, RB);
}
/* an arm from the shoulder (x, y) by (dx, dy): a red sleeve with a dark seam and a gold cuff, and a hand: 'fist' | 'grip' (a bigger fist) | 'open' | 'claw' (fingers spread) | 'flat' */
function arm(g, x, y, dx, dy, hand) {
  line(g, x, y, x + dx, y + dy, RB, 7); line(g, x, y, x + dx, y + dy, RBD, 2); line(g, x + 1, y - 1, x + dx + 1, y + dy - 1, RBL, 1);
  const fx = x + dx, fy = y + dy; rect(g, fx - 4, fy - 4, 9, 9, GLD2); rect(g, fx - 4, fy - 4, 9, 2, GLD);   /* the gold cuff */
  const s = hand === 'grip' ? 6 : 5;
  if (hand === 'claw') { rect(g, fx - 5, fy - 5, 12, 11, SK); rect(g, fx - 5, fy + 4, 12, 2, SKD); for (let k = 0; k < 4; k++) { rect(g, fx + 7, fy - 5 + k * 3, 4, 2, SK); rect(g, fx + 10, fy - 5 + k * 3, 1, 2, TOOTH); } }
  else if (hand === 'open') { rect(g, fx - 4, fy - 4, 9, 9, SK); rect(g, fx - 4, fy + 3, 9, 2, SKD); rect(g, fx + 4, fy - 5, 4, 2, SK); rect(g, fx + 4, fy - 1, 4, 2, SK); rect(g, fx + 4, fy + 3, 4, 2, SK); }
  else { rect(g, fx - s + 1, fy - s + 1, s * 2 - 1, s * 2 - 1, SK); rect(g, fx - s + 1, fy + s - 2, s * 2 - 1, 2, SKD); for (let k = 0; k < 3; k++) rect(g, fx - s + 2 + k * 3, fy - 1, 1, 3, SKD); rect(g, fx - s + 1, fy - s + 1, s * 2 - 1, 1, SKL); }
}
function boots(g, x, y, apart, liftL = 0, liftR = 0) { rect(g, x, y - liftL, 14, 8, SKD); rect(g, x, y + 6 - liftL, 15, 2, OUT); rect(g, x + 1, y - liftL, 12, 1, SK); rect(g, x + apart, y - liftR, 14, 8, SKD); rect(g, x + apart, y + 6 - liftR, 15, 2, OUT); rect(g, x + apart + 1, y - liftR, 12, 1, SK); }
function robe(g, x, y, w, h) {
  rect(g, x, y, w, h, RB); rect(g, x - 4, y + 8, w + 8, h - 14, RB); rect(g, x - 2, y + 9, 6, h - 18, RBL); rect(g, x - 4, y + h - 8, w + 8, 2, RBD); rect(g, x + 2, y + 2, w - 4, 3, RBL); rect(g, x, y + h - 4, w, 4, RBD);
  rect(g, x - 2, y, w + 4, 4, FUR); for (let i = 0; i < w; i += 5) px(g, x + i, y + 1, '#c8bca0');
  rect(g, x + 6, y + Math.floor(h / 2), w - 12, 4, BELT); rect(g, x + Math.floor(w / 2) - 3, y + Math.floor(h / 2) - 1, 6, 6, GLD); rect(g, x + Math.floor(w / 2) - 1, y + Math.floor(h / 2) + 1, 2, 2, GLD2);
}

/* ---------- what he holds ---------- */
function sceptre(g, x0, y0, x1, y1, big) {   /* the royal sceptre: a gilded shaft with a collar and an orb */
  line(g, x0, y0, x1, y1, WOOD, 3); line(g, x0, y0 - 1, x1, y1 - 1, '#8a5a32', 1);
  const dx = x1 - x0, dy = y1 - y0, n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
  for (const t of [n * 0.55, n * 0.62]) rect(g, x0 + ux * t - 2, y0 + uy * t - 2, 4, 4, GLD);
  const r = big ? 5 : 4; circle(g, x1, y1, r, GLD2); circle(g, x1 - 0.5, y1 - 0.5, r - 1, GLD); circle(g, x1, y1, 2, RB); px(g, x1 - 1, y1 - 2, '#fff6e0');
  for (let k = -1; k <= 1; k++) rect(g, x1 + uy * 0 + k * 3 - 0, y1 - r - 2, 1, 2, GLD);
}
/* the burning club: a limb of oak, thick at the head, bark ridged and charred, embers in the cracks; the flame itself is the pose code's (TIPS) */
function club(g, x0, y0, x1, y1, name, extra) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)), dx = (x1 - x0) / n, dy = (y1 - y0) / n;
  for (let i = 0; i <= n; i++) { const t = i / n, w = 3 + t * 5, x = x0 + dx * i, y = y0 + dy * i, nx = -dy, ny = dx;
    for (let o = -w / 2; o <= w / 2; o++) { const cx = x + nx * o, cy = y + ny * o, edge = Math.abs(o) > w / 2 - 1, hot = t > 0.65 && ((i * 7 + o * 3) & 7) < 2;
      rect(g, cx, cy, 2, 2, edge ? '#1a0e08' : hot ? '#e0601a' : t > 0.7 ? (o < 0 ? '#3a2018' : '#241210') : (o < 0 ? '#6a4424' : '#3a2214')); } }
  circle(g, x1, y1, 5, '#2a1410'); circle(g, x1 - 1, y1 - 1, 3, '#3e2218'); px(g, x1 + 1, y1 + 1, '#e0601a'); px(g, x1 - 2, y1, '#ff9a3c');
  for (let k = 0; k < 4; k++) rect(g, x0 + dx * n * (0.35 + k * 0.14) - 1, y0 + dy * n * (0.35 + k * 0.14) + 2, 3, 1, '#1a0e08');   /* knots */
  TIPS[name] = [[x1, y1 - 4], [x0 + dx * n * 0.8, y0 + dy * n * 0.8 - 2]].concat(extra || []);
}
function horn(g, x0, y0, x1, y1) {   /* the royal hunting horn: a curved ivory horn, gold-banded, a flared bell */
  const n = 14;
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 4, w = 3 + t * t * 6;
    rect(g, x - w / 2, y - w / 2, w, w, FUR); rect(g, x - w / 2, y - w / 2, w, 1, '#fffbe8'); rect(g, x - w / 2, y + w / 2 - 1, w, 1, '#b8a888'); }
  for (const t of [0.12, 0.55, 0.92]) { const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 4, w = 3 + t * t * 6; rect(g, x - 1, y - w / 2 - 1, 3, w + 2, GLD); rect(g, x - 1, y - w / 2 - 1, 1, w + 2, '#fff0a8'); }
  circle(g, x1 + 1, y1, 3, '#2a1410');
  rect(g, x0 - 2, y0 + 1, 2, 5, '#a83a2a'); rect(g, x0 - 2, y0 + 5, 2, 4, '#a83a2a');   /* a red tassel off the mouthpiece */
}
function limb(g, x0, y0, x1, y1) {   /* the limb he tears off his oak: long, forked, leaves at one end, a white splintered break at the other */
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)), dx = (x1 - x0) / n, dy = (y1 - y0) / n;
  for (let i = 0; i <= n; i++) { const t = i / n, w = 7 - t * 3, x = x0 + dx * i, y = y0 + dy * i + Math.sin(t * 5) * 1.5;
    rect(g, x - 1, y - w / 2, 3, w, i % 5 ? '#3a2214' : '#241210'); rect(g, x - 1, y - w / 2, 3, 1, '#6a4424'); if (t < 0.5 && (i & 3) === 0) px(g, x, y + w / 2 - 1, '#e0601a'); }
  for (const [t, up] of [[0.3, -1], [0.55, 1]]) { const bx = x0 + dx * n * t, by = y0 + dy * n * t; line(g, bx, by, bx + 8 * (dx > 0 ? 1 : -1), by + up * 9, '#3a2214', 2); for (let k = 0; k < 4; k++) rect(g, bx + 6 * (dx > 0 ? 1 : -1) - 3 + k * 2, by + up * 9 - 2 + (k % 2), 4, 3, k % 2 ? '#c9463d' : '#7a2a1a'); }
  for (let k = 0; k < 7; k++) { rect(g, x0 - 8 + (k * 3) % 14, y0 - 6 + ((k * 5) % 9), 5, 4, k % 3 ? '#a83a2a' : '#e07a30'); }   /* leaves, some already lit */
  for (let k = 0; k < 5; k++) rect(g, x1 + 1 + k, y1 - 4 + (k % 2) * 3, 2, 3, k % 2 ? '#fff6e0' : '#d9c9a0');   /* the splintered break */
  TIPS.limbTell = [[x0 - 2, y0 - 6], [x0 + 12, y0 - 4], [x1 - 2, y1 - 3]];
}

const AX = 88, AYU = 100, W_UP = 176, H_UP = 100, OX = 56, OY = 36;
const AXS = 64, AYS = 64, W_SE = 128, H_SE = 64, SOX = 22, SOY = 16;
const standing = (name, fn) => { const [c, g] = canvas(W_UP, H_UP); g.translate(OX, OY); fn(g, 20); const k = outline(c, OUT); if (TIPS[name]) TIPS[name] = TIPS[name].map(([x, y]) => [x + OX - AX, y + OY - AYU]); return k; };
const seated = (name, fn) => { const [c, g] = canvas(W_SE, H_SE); g.translate(SOX, SOY); fn(g); const k = outline(c, OUT); if (TIPS[name]) TIPS[name] = TIPS[name].map(([x, y]) => [x + SOX - AXS, y + SOY - AYS]); return k; };
const stand = (g, by, o = {}) => {   /* the standing body with its parts */
  const h = o.robeH || 36, kneel = o.kneel;
  if (o.behind) o.behind(g);
  if (kneel) { rect(g, 6, 52, 18, 10, SKD); rect(g, 40, 52, 18, 10, SKD); rect(g, 6, 60, 52, 2, OUT); rect(g, 7, 52, 16, 1, SK); rect(g, 41, 52, 16, 1, SK); }
  else if (o.boots) boots(g, o.boots[0], o.boots[1], o.boots[2], o.boots[3] || 0, o.boots[4] || 0); else boots(g, 9, by + 36, o.apart || 32);
  robe(g, -2 + (o.lean || 0), by, 68, h);
  if (o.armL) arm(g, 2 + (o.lean || 0), by + 6, ...o.armL);
  if (o.armR) arm(g, 62 + (o.lean || 0), by + 6, ...o.armR);
  if (o.mid) o.mid(g);
  const hx = 17 + (o.hx || 0), hy = by - 20 + (o.hy || 0);
  head(g, hx, hy, o.mouth || 0, o.eyes || 0); crown(g, hx + 2, hy - 4, o.askew);
  if (o.front) o.front(g);
};

function bakeUp() {
  const A = [], put = (name, fn) => { A.push([name, standing(name, fn)]); };
  /* THE SCEPTRE SWEEP: tell - the sceptre raised high and back, his weight on his heels; release - the arm out level, the sceptre flat, his mouth open */
  put('sweepTell', (g, by) => stand(g, by, { lean: -2, hx: -2, mouth: 2, armL: [-12, 4, 'fist'], armR: [4, -28, 'fist'], front: g => sceptre(g, 66, by - 22, 52, by - 62, true) }));
  put('sweep', (g, by) => stand(g, by, { lean: 3, hx: 3, mouth: 1, armL: [-10, 10, 'fist'], armR: [26, -4, 'fist'], front: g => { sceptre(g, 74, by + 2, 112, by - 2, true); rect(g, 100, by + 10, 8, 1, '#ffd36b'); } }));
  /* THE BURNING LIMB: both fists up round a limb of his oak, torn off, still burning */
  put('limbTell', (g, by) => stand(g, by, { hy: -1, mouth: 2, armL: [8, -26, 'grip'], armR: [-6, -26, 'grip'], front: g => limb(g, -6, by - 22, 72, by - 34) }));
  /* BURNING BRANCH HIGH: tell - the club cocked behind his head; release - level at the head, swung across */
  put('clubHiTell', (g, by) => stand(g, by, { lean: -2, hx: -1, mouth: 2, armL: [-12, 8, 'fist'], armR: [-4, -22, 'grip'], front: g => club(g, 58, by - 16, 28, by - 66, 'clubHiTell') }));
  put('clubHi', (g, by) => stand(g, by, { lean: 3, hx: 4, mouth: 1, armL: [-12, 8, 'fist'], armR: [24, -4, 'grip'], front: g => club(g, 88, by + 2, 118, by - 8, 'clubHi') }));
  /* BURNING BRANCH LOW: tell - he drops his shoulder, the club dragged back at his heel; release - swept along the ground */
  put('clubLoTell', (g, by) => stand(g, by, { lean: -2, hy: 3, hx: 2, mouth: 2, armL: [-12, 6, 'fist'], armR: [-10, 18, 'grip'], front: g => club(g, 50, by + 28, 10, by + 38, 'clubLoTell') }));
  put('clubLo', (g, by) => stand(g, by, { lean: 3, hy: 3, hx: 4, mouth: 1, armL: [-12, 6, 'fist'], armR: [24, 14, 'grip'], front: g => club(g, 88, by + 30, 118, by + 40, 'clubLo') }));
  /* LOG ROLL: tell - one boot cocked back on a standing leg; release - the kick, the boot out front */
  put('logTell', (g, by) => stand(g, by, { hx: 1, mouth: 2, boots: [9, by + 36, 36, 0, 12], armL: [-12, -8, 'fist'], armR: [12, -12, 'fist'] }));
  put('log', (g, by) => stand(g, by, { lean: -3, hx: -3, mouth: 1, boots: [6, by + 36, 36, 0, 0], armL: [-12, -12, 'fist'], armR: [8, -16, 'fist'], mid: g => { rect(g, 50, by + 28, 22, 9, RBD); rect(g, 70, by + 26, 16, 9, SKD); rect(g, 72, by + 26, 13, 1, SK); rect(g, 70, by + 33, 17, 2, OUT); rect(g, 88, by + 24, 3, 1, FUR); rect(g, 92, by + 30, 4, 1, FUR); } }));
  /* BELLY QUAKE: tell - he crouches, fists to the ground; air - arms flung up, boots tucked; release - the flop, spread flat */
  put('quakeTell', (g, by) => stand(g, by + 8, { robeH: 30, hy: 3, mouth: 2, boots: [9, 56, 40, 0, 0], armL: [-6, 22, 'grip'], armR: [8, 22, 'grip'] }));
  put('quakeAir', (g, by) => stand(g, by - 14, { mouth: 1, eyes: 'wide', boots: [12, by + 20, 30, 0, 0], armL: [-12, -26, 'claw'], armR: [14, -26, 'claw'] }));
  put('quake', (g, by) => stand(g, by + 14, { robeH: 24, lean: 0, hy: 4, mouth: 1, eyes: 'shut', boots: [-10, by + 36, 64, 0, 0], armL: [-24, 10, 'flat'], armR: [26, 10, 'flat'] }));
  /* CANOPY SHAKE: tell - the fist drawn back; release - the fist into the oak */
  put('shakeTell', (g, by) => stand(g, by, { lean: -2, hx: -2, mouth: 2, armL: [-10, 8, 'fist'], armR: [-16, -4, 'grip'] }));
  put('shake', (g, by) => stand(g, by, { lean: 4, hx: 4, mouth: 1, armL: [-12, 8, 'fist'], armR: [32, 0, 'grip'], front: g => { rect(g, 94, by - 4, 3, 1, '#ffd36b'); rect(g, 98, by + 2, 4, 1, '#ffd36b'); rect(g, 94, by + 8, 3, 1, '#ffd36b'); } }));
  /* DOWNED / STUNG */
  put('downed', (g, by) => stand(g, by + 12, { kneel: true, robeH: 24, hy: 7, hx: 2, eyes: 'x', mouth: 0, askew: 5, armL: [-14, 18, 'open'], armR: [18, 20, 'open'] }));
  put('stung', (g, by) => stand(g, by, { hy: 1, eyes: 'shut', mouth: 1, armL: [14, -24, 'fist'], armR: [-14, -24, 'fist'], front: g => { for (let k = 0; k < 9; k++) rect(g, 20 + ((k * 11) % 24), by - 18 + ((k * 7) % 14), 2, 2, k % 2 ? RB : '#e0b040'); } }));
  /* HUNTING HORN afoot: tell - the horn lifted; release - at his lips */
  put('hornTellUp', (g, by) => stand(g, by, { mouth: 3, lean: -1, armL: [-10, 14, 'fist'], armR: [0, -14, 'fist'], front: g => horn(g, 62, by - 12, 84, by - 26) }));
  put('hornUp', (g, by) => stand(g, by, { mouth: 3, hx: -2, hy: -1, lean: -2, armL: [-10, 14, 'fist'], armR: [-10, -16, 'fist'], front: g => horn(g, 48, by - 8, 92, by - 24) }));
  /* GRAB-AND-HURL afoot: tell - the arm drawn back, claws; release - the lunge */
  put('grabTellUp', (g, by) => stand(g, by, { lean: -2, hx: -2, mouth: 2, armL: [10, 6, 'fist'], armR: [-14, 2, 'claw'] }));
  put('grabUp', (g, by) => stand(g, by, { lean: 4, hx: 5, mouth: 1, armL: [-10, 8, 'fist'], armR: [34, 6, 'claw'] }));
  /* WALKING with the burning club on his shoulder (the glade) */
  put('walkClub', (g, by) => stand(g, by, { apart: 36, armL: [-4, 16, 'fist'], armR: [-2, -6, 'grip'], front: g => club(g, 60, by - 4, 36, by - 56, 'walkClub') }));
  /* ON HIS STUMP: asleep (slumped, the crown slipped) and waking (head up, a fist at his eye) */
  put('throneSleep', (g, by) => stand(g, by + 4, { kneel: true, robeH: 28, hy: 8, hx: 1, eyes: 'shut', mouth: 0, askew: 4, armL: [-4, 14, 'fist'], armR: [4, 14, 'fist'], front: g => sceptre(g, 8, by + 36, 60, by + 40) }));
  put('throneWake', (g, by) => stand(g, by + 4, { kneel: true, robeH: 28, hy: 0, mouth: 1, armL: [-4, 14, 'fist'], armR: [-12, -18, 'fist'], front: g => sceptre(g, 8, by + 36, 60, by + 40) }));
  return A;
}
function bakeSeat() {
  const A = [], put = (name, fn) => { A.push([name, seated(name, fn)]); };
  const body = (g, o = {}) => { boots(g, 16, 40, 26); robe(g, 4, 17, 64, 27); if (o.armL) arm(g, 4, 24, ...o.armL); if (o.armR) arm(g, 66, 24, ...o.armR); head(g, 21 + (o.hx || 0), 0 + (o.hy || 0), o.mouth || 0, o.eyes || 0); crown(g, 23 + (o.hx || 0), -4 + (o.hy || 0), o.askew); if (o.front) o.front(g); };
  put('chargeTell', g => body(g, { hx: 4, hy: 2, mouth: 2, armL: [-8, -8, 'fist'], armR: [8, 2, 'grip'], front: g => sceptre(g, 74, 28, 100, 24, true) }));
  put('charge', g => body(g, { hx: 6, hy: 3, mouth: 1, armL: [-10, -10, 'fist'], armR: [14, 0, 'grip'], front: g => sceptre(g, 82, 26, 106, 20, true) }));
  put('grabTell', g => body(g, { hx: -1, mouth: 2, armL: [-6, 10, 'fist'], armR: [-4, -14, 'claw'] }));
  put('grab', g => body(g, { hx: 3, mouth: 1, armL: [-6, 10, 'fist'], armR: [20, 6, 'claw'] }));
  put('hornTell', g => body(g, { mouth: 3, armL: [-6, 10, 'fist'], armR: [4, -14, 'fist'], front: g => horn(g, 70, 8, 94, -6) }));
  put('horn', g => body(g, { mouth: 3, hx: -1, armL: [-6, 10, 'fist'], armR: [-8, -16, 'fist'], front: g => horn(g, 52, 14, 96, -2) }));
  put('fleeTell', g => body(g, { hy: -1, eyes: 'wide', mouth: 1, askew: -4, armL: [-10, -16, 'open'], armR: [10, -18, 'open'] }));
  put('fleeCarried', g => body(g, { hx: -2, hy: 1, eyes: 'wide', mouth: 2, askew: 5, armL: [4, 12, 'fist'], armR: [6, 8, 'grip'], front: g => { sceptre(g, 70, 36, 84, 12); rect(g, 15, 4, 1, 3, '#9fd0ff'); rect(g, 52, 3, 1, 3, '#9fd0ff'); } }));
  return A;
}
function toSet(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
export const UP = once('up', () => { const A = bakeUp(), idx = {}; A.forEach(([n], i) => { idx[n] = i; }); return { set: toSet(A.map(a => a[1]), AX, AYU, 90, 90), idx }; });
export const SEAT = once('seat', () => { const A = bakeSeat(), idx = {}; A.forEach(([n], i) => { idx[n] = i; }); return { set: toSet(A.map(a => a[1]), AXS, AYS, 90, 60), idx }; });
export const upFrame = n => UP.idx[n], seatFrame = n => SEAT.idx[n];

/* ---------- THE BEARERS: four goblins of the court, a pole on the shoulder: 0 stand, 1-2 walk, 3-4 run, 5 crouch-lift ---------- */
export const BEARER = once('bearer', () => {
  const fr = [], mk = (leg, lean, crouch) => { const [c, g] = canvas(18, 26); g.translate(2, 2 + (crouch ? 3 : 0));
    const gbody = '#3f6e2c', gl = '#6faa4a', tun = '#3f6e2c', tunL = '#5a9a3a', hel = '#7a7a86', helL = '#b8bcc8';
    /* legs */ rect(g, 4 + leg[0], 16, 3, 7 - (crouch ? 3 : 0), '#2a1a10'); rect(g, 8 + leg[1], 16, 3, 7 - (crouch ? 3 : 0), '#2a1a10'); rect(g, 3 + leg[0], 22 - (crouch ? 3 : 0), 5, 2, '#1e1208'); rect(g, 7 + leg[1], 22 - (crouch ? 3 : 0), 5, 2, '#1e1208');
    /* tunic with the court's crest */ rect(g, 3 + lean, 8, 10, 9, tun); rect(g, 3 + lean, 8, 3, 9, tunL); rect(g, 3 + lean, 14, 10, 1, '#c9b27c'); rect(g, 7 + lean, 10, 2, 3, '#e0b040');
    /* head: a goblin under a kettle helm */ rect(g, 4 + lean, 1, 8, 7, gl); rect(g, 3 + lean, 3, 2, 3, gl); rect(g, 11 + lean, 3, 2, 3, gl); rect(g, 4 + lean, 0, 8, 3, hel); rect(g, 4 + lean, 0, 8, 1, helL); rect(g, 6 + lean, 4, 1, 2, '#1a0e08'); rect(g, 10 + lean, 4, 1, 2, '#1a0e08'); rect(g, 6 + lean, 6, 4, 1, gbody);
    /* the pole across his shoulder: a worn staff, a hand up on it */ rect(g, -2, 6, 22, 3, '#2a1a10'); rect(g, -2, 6, 22, 1, '#8a5a32'); rect(g, 11 + lean, 6, 3, 4, gl);
    return outline(c, OUT); };
  fr.push(mk([0, 0], 0, false), mk([-1, 1], 0, false), mk([1, -1], 0, false), mk([-2, 2], 1, false), mk([2, -2], 1, false), mk([0, 0], 0, true));
  return toSet(fr, 9, 26, 12, 24);
});
