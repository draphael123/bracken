// high_lines_art.js - THE HIGH LINES' MACHINERY, hand-drawn (claude/hlart, 2026-11-05). Replaces the greybox of src/line-kit.js drawLines / drawRider (a 1-px stroke, grey squares) with the ropeway crew's
// own gear: hand-winch machines, hemp haul-ropes and steel glide cables, anchor plates and guy rods, points boards, the strike-posts, the hopper and its stone, the counterweight's ballast and cage under a
// head sheave, THE GONDOLA (an iron frame, a patched canvas roof, a lantern), the gust streaks, the rider's grip - and the dressing: THE LEE HUT (dry stone, an iron roof), the LEE ROCKS.
// Mountain, rope, iron, stone: no timber. Every piece reads from its state: the winch drum turns while it hauls, the rope twists upward; a line about to part SHAKES and frays at the snap point; a parted line
// hangs in two frayed halves; the cab's hangers go slack when it falls; the weight pair's sheave turns with them; a gust is a streak, told as a faint shiver.
//   drawLines(g, kit, cx, cy, VW, VH, time, riders)     riders: [{ id, x, haul, sway }] (who hangs on what: the winch turns for them)
//   drawGrip(g, kit, r, cx, cy, time)                    the rider's grip over his hands
//   dress(decor, L, at, T)                               the Lee Hut and the lee rocks (static sprites)
import { canvas, rect } from '../px.js';
import { lineY, platforms, LK } from '../line-kit.js';

const R = Math.round, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
export const HP = {
  iron: ['#0e1014', '#1c2026', '#2c323a', '#444c58', '#68727e', '#98a2ae', '#c8d0d8'], hemp: ['#14100a', '#2a2216', '#463a24', '#6c5c38', '#a08c58', '#c8b27c'], steel: ['#3a4254', '#6a768a', '#aab4c6', '#e4eaf2'],
  canvas: ['#3a2a18', '#6a4a2a', '#98703c', '#c49a58'], stone: ['#1c2028', '#2c323c', '#414a58', '#5a6676', '#7a8798', '#a0aebe'], rime: ['#a8bccc', '#dce8f2', '#ffffff'], lamp: ['#6a3a12', '#c0701c', '#ffb23c', '#fff0b0'],
  ochre: ['#6a4a10', '#b07a1c', '#d8a030', '#f0c860'], rust: ['#3a1c10', '#6a3418', '#a0501e'], wind: '#e8f0f8', turf: ['#2a3224', '#4a5a3c'],
};
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), Math.max(1, R(w)), Math.max(1, R(h))); };
const dot = (g, x, y, c) => rc(g, x, y, 1, 1, c);
function ln(g, x0, y0, x1, y1, c, th = 1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); g.fillStyle = c; for (let i = 0; i <= n; i++) g.fillRect(R(lerp(x0, x1, i / n)), R(lerp(y0, y1, i / n)), th, th); }

/* ---------- the pieces ---------- */
/* an anchor plate bolted to the rock (or a pylon) with an eye, a thimble and a turnbuckle; s = which way the rope leaves (+1 right, -1 left) */
function anchor(g, x, y, s) {
  rc(g, x - 4, y - 6, 8, 12, HP.iron[2]); rc(g, x - 4, y - 6, 8, 1, HP.iron[5]); rc(g, x - 4, y + 5, 8, 1, HP.iron[0]); rc(g, x - 4, y - 6, 1, 12, HP.iron[4]);   /* the plate */
  dot(g, x - 3, y - 4, HP.iron[6]); dot(g, x + 2, y - 4, HP.iron[1]); dot(g, x - 3, y + 3, HP.iron[6]); dot(g, x + 2, y + 3, HP.iron[1]);                                  /* its bolts */
  rc(g, x + s * 2, y - 2, 4, 4, HP.iron[3]); rc(g, x + s * 3, y - 1, 2, 2, HP.iron[0]);                                                                                   /* the eye and thimble */
  rc(g, x + s * 5, y - 1, 5, 2, HP.iron[4]); dot(g, x + s * 7, y - 1, HP.iron[6]);                                                                                         /* the turnbuckle */
}
/* THE WINCH MACHINE at a grip-winch's high end: an iron frame, a rope drum, a crank wheel with handspikes, the ratchet pawl. ph = the drum's turn; hauling = it is turning */
function winchMachine(g, x, y, s, ph, hauling) {
  rc(g, x - 11, y - 3, 22, 4, HP.iron[2]); rc(g, x - 11, y - 3, 22, 1, HP.iron[5]);                                                                                         /* the bedplate, bolted down */
  rc(g, x - 9, y - 18, 3, 15, HP.iron[3]); rc(g, x + 6, y - 18, 3, 15, HP.iron[1]); rc(g, x - 9, y - 18, 1, 15, HP.iron[5]);                                              /* the two cheek-plates */
  rc(g, x - 6, y - 15, 12, 9, HP.hemp[2]); rc(g, x - 6, y - 15, 12, 1, HP.hemp[4]); rc(g, x - 6, y - 7, 12, 1, HP.hemp[0]);                                                /* the drum with its coiled rope */
  for (let k = 0; k < 6; k++) { const q = (k * 2 + (hauling ? Math.floor(ph * 6) : 0)) % 12; dot(g, x - 6 + q, y - 13, HP.hemp[1]); dot(g, x - 6 + ((q + 6) % 12), y - 10, HP.hemp[1]); }   /* the strands crawl round while it hauls */
  rc(g, x - 1, y - 12, 3, 3, HP.iron[4]);                                                                                                                                   /* the axle cap */
  const a = ph * 6.283, cxw = x + s * 11, cyw = y - 10; for (let k = 0; k < 4; k++) { const aa = a + k * Math.PI / 2; ln(g, cxw, cyw, cxw + Math.cos(aa) * 7, cyw + Math.sin(aa) * 7, HP.iron[k ? 3 : 5]); dot(g, cxw + Math.cos(aa) * 8, cyw + Math.sin(aa) * 8, HP.ochre[2]); }   /* the crank wheel's handspikes */
  rc(g, cxw - 1, cyw - 1, 3, 3, HP.iron[6]);
  rc(g, x - 4, y - 21, 6, 3, HP.iron[1]); rc(g, x - 1, y - 20, 4, 2, HP.iron[5]); dot(g, x + 2, y - 18, HP.iron[0]);                                                          /* the ratchet pawl, set in its teeth */
}
/* a turn-sheave block at a winch's low end */
function sheave(g, x, y, ph) { rc(g, x - 5, y - 5, 10, 10, HP.iron[1]); rc(g, x - 4, y - 4, 8, 8, HP.iron[3]); rc(g, x - 4, y - 4, 8, 1, HP.iron[5]); const a = ph * 6.283; ln(g, x, y, x + Math.cos(a) * 3, y + Math.sin(a) * 3, HP.iron[0]); ln(g, x, y, x - Math.cos(a) * 3, y - Math.sin(a) * 3, HP.iron[0]); dot(g, x, y, HP.iron[6]); rc(g, x - 1, y + 5, 2, 3, HP.iron[2]); }
/* a glide cable's buffer stop: an iron block on a spring */
function stopBlock(g, x, y, s) { rc(g, x + s * 1, y - 5, 5, 10, HP.iron[2]); rc(g, x + s * 1, y - 5, 5, 1, HP.iron[5]); for (let k = 0; k < 4; k++) rc(g, x - s * (1 + k * 2), y - 2 + (k & 1), 2, 1, HP.iron[4]); rc(g, x - s * 8, y - 4, 2, 8, HP.iron[3]); }
/* THE POINTS BOARD: an iron stanchion clamped to the rope, an ochre board, a black arrow toward the branch */
function pointsBoard(g, x, y, s, now) { rc(g, x - 1, y - 14, 2, 14, HP.iron[3]); rc(g, x - 1, y - 14, 1, 14, HP.iron[5]); rc(g, x - 3, y - 2, 6, 3, HP.iron[2]); rc(g, x - 3, y - 2, 6, 1, HP.iron[5]);   /* stanchion + the clamp on the rope */
  rc(g, x - 8, y - 24, 16, 11, HP.iron[0]); rc(g, x - 7, y - 23, 14, 9, HP.ochre[2]); rc(g, x - 7, y - 23, 14, 2, HP.ochre[3]); rc(g, x - 7, y - 16, 14, 2, HP.ochre[1]);          /* the board in its frame */
  for (let k = 0; k < 5; k++) rc(g, x - 4 + (s > 0 ? k : 4 - k) , y - 19 + (k > 2 ? k - 2 : 2 - k) * 0, 1, 1, HP.iron[0]);
  rc(g, x - 5, y - 19, 9, 1, HP.iron[0]); if (s > 0) { rc(g, x + 2, y - 21, 1, 5, HP.iron[0]); rc(g, x + 3, y - 20, 1, 3, HP.iron[0]); rc(g, x + 4, y - 19, 1, 1, HP.iron[0]); } else { rc(g, x - 3, y - 21, 1, 5, HP.iron[0]); rc(g, x - 4, y - 20, 1, 3, HP.iron[0]); rc(g, x - 5, y - 19, 1, 1, HP.iron[0]); }   /* the arrow head */
}

/* the rope itself: hemp (winch), steel (glide), hemp (free) */
function rope(g, z, X0, Y0, X1, Y1, time, hauling, shake) {
  const n = Math.max(2, Math.abs(X1 - X0)), hemp = z.kind !== 'glide', phase = hauling ? time * 40 : z.run > 0 ? time * 30 : 0;
  for (let i = 0; i <= n; i++) { const t = i / n, x = R(lerp(X0, X1, t)), y = R(lerp(Y0, Y1, t) + (shake ? Math.sin(time * 70 + i * 0.7) * 1 : 0));
    if (hemp) { const twist = ((i + (z.dir > 0 ? 1 : -1) * R(phase)) % 5 + 5) % 5; g.fillStyle = twist < 2 ? HP.hemp[4] : HP.hemp[3]; g.fillRect(x, y, 1, 1); g.fillStyle = twist < 2 ? HP.hemp[2] : HP.hemp[1]; g.fillRect(x, y + 1, 1, 1);
      if (z.kind === 'winch') { g.fillStyle = HP.hemp[0]; g.fillRect(x, y + 2, 1, 1); } }
    else { g.fillStyle = HP.steel[(i % 23 === 0) ? 3 : 2]; g.fillRect(x, y, 1, 1); g.fillStyle = HP.steel[0]; g.fillRect(x, y + 1, 1, 1); } }
}
/* a line that is parting: strands lifting off the rope at the snap point */
function fray(g, x, y, time) { for (let k = 0; k < 6; k++) { const o = ((Math.floor(time * 24) + k * 3) % 5) - 2; dot(g, x - 3 + k * 1.2, y - 2 - (k % 3) + o * 0.5, HP.hemp[5]); dot(g, x - 2 + k, y + 2 + (k % 2), HP.hemp[4]); } }
/* a parted line: each half hangs from its anchor in a slack, frayed curve */
function parted(g, X0, Y0, X1, Y1, time) {
  for (const [ax, ay, s] of [[X0, Y0, X1 > X0 ? 1 : -1], [X1, Y1, X1 > X0 ? -1 : 1]]) {
    for (let i = 0; i <= 34; i++) { const t = i / 34, x = ax + s * (6 + t * 10 * (1 + Math.sin(time * 2 + ax) * 0.1)), y = ay + t * t * 40 + t * 6; g.fillStyle = HP.hemp[3]; g.fillRect(R(x), R(y), 1, 1); g.fillStyle = HP.hemp[1]; g.fillRect(R(x), R(y) + 1, 1, 1); }
    for (let k = 0; k < 4; k++) dot(g, ax + s * (16 + k - 1), ay + 46 + (k & 1) * 2, HP.hemp[5]);                                                                          /* the frayed end */
  }
}
const windOn = w => (w.grace > 0 ? { blow: false, told: w.grace <= w.told } : { blow: w.t < w.on, told: w.t >= w.period - w.told });

/* ---------- THE KIT, DRAWN ---------- */
export function drawLines(g, kit, cx, cy, VW, VH, time, riders = []) {
  const hauled = id => riders.find(r => r.id === id);
  for (const z of kit.list) {
    if (z.xb < cx - 60 || z.xa > cx + VW + 60) continue;
    const X0 = R(z.x0 - cx), Y0 = R(z.y0 - cy), X1 = R(z.x1 - cx), Y1 = R(z.y1 - cy);
    if (Math.min(Y0, Y1) > VH + 70 || Math.max(Y0, Y1) < -70) continue;
    const hi = z.y0 <= z.y1 ? 0 : 1, hx = hi ? X1 : X0, hy = hi ? Y1 : Y0, lx = hi ? X0 : X1, ly = hi ? Y0 : Y1, rider = hauled(z.id), ph = rider ? (rider.haul || 0) + time * 0.9 : (z.run > 0 ? time * 1.4 : 0);
    if (z.cut > 0) { parted(g, X0, Y0, X1, Y1, time); anchor(g, X0, Y0, X1 > X0 ? 1 : -1); anchor(g, X1, Y1, X1 > X0 ? -1 : 1); continue; }
    rope(g, z, X0, Y0, X1, Y1, time, !!rider || z.run > 0, z.tell > 0);
    if (z.snapX != null && z.tell > 0) fray(g, R(z.snapX - cx), R(lineY(z, z.snapX) - cy), time);
    if (z.kind === 'winch') { anchor(g, lx, ly, hx > lx ? 1 : -1); winchMachine(g, hx - (hx > lx ? 12 : -12), hy + 2, hx > lx ? -1 : 1, ph, !!rider || z.run > 0); rc(g, hx - (hx > lx ? 4 : -4) - 1, hy - 1, 6, 3, HP.iron[3]); }
    else { anchor(g, X0, Y0, X1 > X0 ? 1 : -1); anchor(g, X1, Y1, X1 > X0 ? -1 : 1); if (z.kind === 'glide') { stopBlock(g, X0, Y0, X1 > X0 ? 1 : -1); stopBlock(g, X1, Y1, X1 > X0 ? -1 : 1); } else { sheave(g, hx, hy - 2, ph); } }
    if (z.kind === 'winch') sheave(g, lx, ly + 1, ph);
    for (const p of z.points) { const x = R(p.at - cx), y = R(lineY(z, p.at) - cy), tz = kit.lines[p.to], s = tz ? (tz.xa + tz.xb) / 2 > p.at ? 1 : -1 : 1; pointsBoard(g, x, y, s, false); }
  }
  /* the strike-posts: the hopper and any post-driven winch; the lever swings when struck */
  for (const p of kit.posts) { const x = R(p.x - cx), y = R(p.y - cy); if (x < -30 || x > VW + 30) continue;
    if (p.kind === 'hopper') hopper(g, x, y + 12, p, kit, time); else if (p.kind === 'winch') post(g, x, y + 12, p, time); else post(g, x, y + 12, p, time); }
  /* the moving floors: THE GONDOLA's cab and the counterweight pair */
  for (const pl of platforms(kit)) { if (pl.cab) cab(g, pl, kit, cx, cy, time); }
  for (const W of kit.weights) weightPair(g, W, kit, cx, cy, time);
  /* the wind */
  for (const w of kit.winds) { const s = windOn(w); if (!s.blow && !s.told) continue; const bw = w.B.r - w.B.l, bh = w.B.b - w.B.t;
    for (let i = 0; i < (s.blow ? 16 : 5); i++) { const sp = 150 + (i % 4) * 40, x = R(w.B.l + (((i * 53 + time * sp * w.dir) % bw) + bw) % bw - cx), y = R(w.B.t + (i * 37 + (i >> 2) * 11) % bh - cy), l = s.blow ? 12 + (i % 3) * 7 : 5;
      if (x < -30 || x > VW + 30 || y < -4 || y > VH + 4) continue; g.globalAlpha = s.blow ? 0.55 : 0.18 + 0.12 * Math.sin(time * 14 + i);
      for (let k = 0; k < l; k++) { g.globalAlpha *= 0.93; g.fillStyle = k < 2 ? '#ffffff' : HP.wind; g.fillRect(x - w.dir * k, y + (k > l - 4 ? 1 : 0), 1, 1); } }
    g.globalAlpha = 1; }
}
function post(g, x, y, p, time) {
  rc(g, x - 3, y - 22, 6, 22, HP.iron[2]); rc(g, x - 3, y - 22, 1, 22, HP.iron[5]); rc(g, x + 2, y - 22, 1, 22, HP.iron[0]); rc(g, x - 5, y - 2, 10, 3, HP.iron[3]);                  /* the iron post, bolted to the deck */
  rc(g, x - 5, y - 21, 10, 2, HP.iron[4]); const sw = p.swing > 0 ? 6 : 0; rc(g, x - 7 + sw, y - 14, 14, 3, HP.ochre[2]); rc(g, x - 7 + sw, y - 14, 14, 1, HP.ochre[3]); dot(g, x - 7 + sw, y - 12, HP.ochre[0]);   /* the struck plate that swings */
  rc(g, x - 1, y - 9, 3, 4, HP.iron[1]); for (let k = 0; k < 3; k++) dot(g, x - 1 + k, y - 9, HP.iron[5]);
}
function hopper(g, x, y, p, kit, time) {
  rc(g, x - 3, y - 12, 6, 12, HP.iron[2]); rc(g, x - 3, y - 12, 1, 12, HP.iron[4]); rc(g, x - 5, y - 2, 10, 3, HP.iron[3]);                                                   /* the post */
  rc(g, x - 9, y - 30, 18, 3, HP.iron[3]); for (let q = 0; q < 5; q++) rc(g, x - 9 + q, y - 27 + q, 18 - q * 2, 1, HP.iron[1 + (q & 1)]);                                       /* the bin: a banded funnel */
  rc(g, x - 9, y - 30, 18, 1, HP.iron[5]); rc(g, x - 8, y - 29, 16, 1, HP.stone[2]);
  rc(g, x - 5, y - 33, 10, 4, HP.stone[3]); rc(g, x - 5, y - 33, 10, 1, HP.stone[5]); rc(g, x - 4, y - 31, 4, 1, HP.stone[1]);                                                  /* the STONE in the bin */
  rc(g, x - 2, y - 24, 4, 14, HP.iron[1]); const sw = p.swing > 0 ? 1 : 0; rc(g, x - 2 + sw * 4, y - 12, 8, 2, HP.iron[4]); dot(g, x + 6 + sw * 4, y - 12, HP.ochre[2]);                /* the chute gate and its lever */
  if (p.swing > 0) { for (let k = 0; k < 3; k++) rc(g, x - 1, y - 10 + k * 3 + ((time * 40) | 0) % 3, 2, 2, HP.stone[3]); }
}
/* THE GONDOLA: an iron frame, a patched canvas roof, a lantern, hangers up to a two-wheel carriage on the cable */
function cab(g, pl, kit, cx, cy, time) {
  const c = pl.cab, x = R(pl.x0 - cx), w = R(pl.x1 - pl.x0), y = R(pl.top - cy), hookY = R(c.hookY - cy), mid = x + (w >> 1), slack = c.st === 'fall';
  if (x > 400 || x + w < -20) return;
  const creak = c.told ? ((Math.floor(time * 40) & 1) ? 1 : -1) : 0;
  /* the carriage and the hangers */
  rc(g, mid - 6, hookY - 4 + creak, 12, 3, HP.iron[3]); rc(g, mid - 5, hookY - 7 + creak, 4, 3, HP.iron[4]); rc(g, mid + 1, hookY - 7 + creak, 4, 3, HP.iron[4]); dot(g, mid - 4, hookY - 6 + creak, HP.iron[6]); dot(g, mid + 2, hookY - 6 + creak, HP.iron[6]);
  const roofY = y - 30;
  for (const s of [-1, 1]) ln(g, mid + s * 1, hookY - 1 + creak, mid + s * (slack ? 12 : 17), roofY - 2, HP.iron[3 + (s > 0 ? 0 : 1)]);                                           /* two hanger rods to the roof (kinked when the cab falls) */
  /* roof: patched ochre canvas on iron hoops */
  for (let i = 0; i < w; i++) { const k = (i - w / 2) / (w / 2), up = Math.round((1 - k * k) * 6); rc(g, x + i, roofY + 6 - up, 1, 4 + up * 0, HP.canvas[2]); if ((i & 7) === 0) rc(g, x + i, roofY + 6 - up, 1, 4, HP.canvas[1]); rc(g, x + i, roofY + 6 - up, 1, 1, HP.canvas[3]); }
  rc(g, x + 8, roofY + 5, 8, 4, HP.canvas[3]); rc(g, x + 8, roofY + 5, 8, 1, HP.canvas[2]); rc(g, x + w - 18, roofY + 6, 7, 3, HP.canvas[1]); rc(g, x - 1, roofY + 10, w + 2, 2, HP.iron[2]); rc(g, x - 1, roofY + 10, w + 2, 1, HP.iron[5]);   /* the patches and the eave rail */
  /* frame: corner posts, a mid rail, a floor of iron plate, a bench, a lantern */
  for (const px of [x, x + w - 3, x + (w >> 1) - 1]) { rc(g, px, roofY + 11, 3, y - roofY - 10, HP.iron[2]); rc(g, px, roofY + 11, 1, y - roofY - 10, HP.iron[5]); }
  for (let k = 0; k < 2; k++) { const ry = roofY + 18 + k * 8; rc(g, x, ry, w, 2, HP.iron[3]); rc(g, x, ry, w, 1, HP.iron[5]); }
  rc(g, x + 4, y - 12, w - 8, 2, HP.iron[4]); rc(g, x + 5, y - 10, 2, 8, HP.iron[1]); rc(g, x + w - 8, y - 10, 2, 8, HP.iron[1]);                                                 /* a bench */
  rc(g, x - 2, y, w + 4, 4, HP.iron[2]); rc(g, x - 2, y, w + 4, 1, HP.iron[6]); rc(g, x - 2, y + 3, w + 4, 1, HP.iron[0]); for (let k = 3; k < w; k += 8) dot(g, x + k, y + 1, HP.iron[1]);   /* the floor plate with its rivets */
  rc(g, mid - 3, roofY + 12, 6, 7, HP.iron[1]); rc(g, mid - 2, roofY + 13, 4, 5, HP.lamp[1]); rc(g, mid - 1, roofY + 14, 2, 3, HP.lamp[3]);                                                     /* the lantern */
  if (c.st === 'rest' || c.st === 'dock') { g.globalAlpha = 0.10; rc(g, x - 4, roofY + 8, w + 8, y - roofY, HP.lamp[2]); g.globalAlpha = 1; }
}
/* THE COUNTERWEIGHT: a head frame and a great sheave at the top, a rope to each carriage; the cage (iron bars, a canvas top, a floor) and the ballast block (stacked stone and iron plate) */
function weightPair(g, W, kit, cx, cy, time) {
  const D = W.d, ax0 = D.a.x0 * 16, ax1 = (D.a.x1 + 1) * 16, bx0 = D.b.x0 * 16, bx1 = (D.b.x1 + 1) * 16, topY = Math.min(D.a.top, D.b.top) * 16 - 26;
  if (bx1 - cx < -20 || ax0 - cx > 400) return;
  const mid = (ax0 + ax1 + bx0 + bx1) / 4, sx = R(mid - cx), sy = R(topY - cy);
  rc(g, R(16 - cx), sy - 6, R(Math.max(ax1, bx1) - 16 + 10), 4, HP.iron[2]); rc(g, R(16 - cx), sy - 6, R(Math.max(ax1, bx1) - 16 + 10), 1, HP.iron[5]);                                  /* the head beam, out from the cliff */
  for (let k = 0; k < Math.max(ax1, bx1) - 16; k += 12) { ln(g, R(16 - cx) + k, sy - 2, R(16 - cx) + k + 6, sy - 6, HP.iron[3]); }
  rc(g, R(16 - cx), sy - 12, 6, 24, HP.iron[3]); rc(g, R(16 - cx), sy - 12, 6, 1, HP.iron[5]); dot(g, R(16 - cx) + 2, sy - 8, HP.iron[6]); dot(g, R(16 - cx) + 2, sy + 4, HP.iron[6]);        /* the wall plate */
  const ph = W.k * 5; for (let yy = -13; yy <= 13; yy++) { const hw2 = Math.round(Math.sqrt(169 - yy * yy)); rc(g, sx - hw2, sy + yy, hw2 * 2 + 1, 1, HP.iron[1]); }   /* the sheave disc */
  for (let a = 0; a < 6.3; a += 0.1) rc(g, sx + Math.cos(a) * 13, sy + Math.sin(a) * 13, 1, 1, HP.iron[4]);
  for (let k = 0; k < 6; k++) { const a = ph + k * Math.PI / 3; ln(g, sx, sy, sx + Math.cos(a) * 12, sy + Math.sin(a) * 12, k % 2 ? HP.iron[3] : HP.iron[5]); }
  rc(g, sx - 2, sy - 2, 4, 4, HP.iron[6]); rc(g, sx - 1, sy - 1, 2, 2, HP.iron[0]);
  for (const pl of platforms(kit)) { if (pl.weight !== W) continue; const x0 = R(pl.x0 - cx), x1 = R(pl.x1 - cx), top = R(pl.top - cy), w = x1 - x0, m = (x0 + x1) >> 1, side = pl.side;
    const ropeX = side === 'A' ? m : m; for (let y = sy + 14; y < top - (side === 'A' ? 22 : 36); y++) { dot(g, ropeX, y, HP.hemp[(y >> 1) & 1 ? 4 : 3]); dot(g, ropeX + 1, y, HP.hemp[1]); }
    if (side === 'B') {                                                                                                                                                       /* THE CAGE: an iron-barred lift with a canvas top */
      rc(g, x0 - 1, top, w + 2, 4, HP.iron[2]); rc(g, x0 - 1, top, w + 2, 1, HP.iron[6]); rc(g, x0 - 1, top + 3, w + 2, 1, HP.iron[0]); for (let k = 3; k < w; k += 8) dot(g, x0 + k, top + 1, HP.iron[1]);
      for (let x = x0; x <= x1 - 2; x += 6) { rc(g, x, top - 36, 2, 36, HP.iron[3]); rc(g, x, top - 36, 1, 36, HP.iron[5]); } rc(g, x1 - 2, top - 36, 2, 36, HP.iron[3]);
      rc(g, x0 - 1, top - 38, w + 2, 4, HP.canvas[2]); rc(g, x0 - 1, top - 38, w + 2, 1, HP.canvas[3]); rc(g, x0 + 4, top - 36, 9, 2, HP.canvas[1]); rc(g, x0 - 1, top - 20, w + 2, 2, HP.iron[3]);
      rc(g, m - 3, top - 41, 6, 4, HP.iron[3]); rc(g, m - 3, top - 41, 6, 1, HP.iron[6]); }
    else {                                                                                                                                                                     /* THE BALLAST: stacked stone in an iron carriage; the stones the hopper has dropped */
      rc(g, x0 - 1, top, w + 2, 5, HP.iron[2]); rc(g, x0 - 1, top, w + 2, 1, HP.iron[5]); rc(g, x0 - 1, top + 4, w + 2, 1, HP.iron[0]); const stones = 3 + Math.min(6, Math.round(W.k * 4 + (W.stones || 0)));
      for (let k = 0; k < stones; k++) { const sx0 = x0 + 1 + (k % 3) * Math.max(8, Math.floor((w - 2) / 3)), sy0 = top - 9 - ((k / 3) | 0) * 9; rc(g, sx0, sy0, Math.max(8, Math.floor((w - 2) / 3)) - 1, 9, HP.stone[2 + (k & 1)]); rc(g, sx0, sy0, Math.max(8, Math.floor((w - 2) / 3)) - 1, 2, HP.stone[5]); rc(g, sx0, sy0 + 8, Math.max(8, Math.floor((w - 2) / 3)) - 1, 1, HP.stone[0]); dot(g, sx0 + 3, sy0 + 4, HP.stone[1]); }
      rc(g, m - 3, top - 9 - Math.ceil(stones / 3) * 9, 6, 4, HP.iron[3]); }
  }
}
/* the rider's grip over his hands: a winch's crank-loop and clutch, a glide's two-wheel trolley with a swinging strap */
export function drawGrip(g, kit, r, cx, cy, time) {
  const z = kit.lines[r.id]; if (!z) return; const x = R(r.x - cx), y = R(lineY(z, r.x) - cy), sw = R(r.sway || 0);
  if (z.kind === 'winch') {
    rc(g, x - 4, y - 4, 9, 6, HP.iron[2]); rc(g, x - 4, y - 4, 9, 1, HP.iron[5]); dot(g, x - 3, y - 2, HP.iron[6]); dot(g, x + 3, y - 2, HP.iron[1]); rc(g, x - 2, y + 2, 5, 1, HP.iron[0]);                      /* the clutch clamped on the haul-rope: its ratchet sits behind the stroke */
    const st = (r.haul || 0) > 0 || (r.buf || 0) > 0 ? 2 : 0; ln(g, x, y + 2, x + sw * 0.5, y + 6 + st, HP.hemp[3]); rc(g, x + sw * 0.5 - 3, y + 6 + st, 7, 2, HP.iron[4]); dot(g, x + sw * 0.5 - 3, y + 6 + st, HP.ochre[2]); dot(g, x + sw * 0.5 + 3, y + 6 + st, HP.ochre[2]);   /* the hand-bar on a loop of line */
  } else {
    rc(g, x - 6, y - 5, 13, 3, HP.iron[3]); rc(g, x - 6, y - 5, 13, 1, HP.iron[5]); rc(g, x - 5, y - 8, 4, 3, HP.iron[4]); rc(g, x + 2, y - 8, 4, 3, HP.iron[4]); dot(g, x - 4, y - 7, HP.iron[6]); dot(g, x + 3, y - 7, HP.iron[6]);   /* the trolley on the cable */
    ln(g, x, y - 2, x + sw * 0.7, y + 5, HP.hemp[3]); ln(g, x + 1, y - 2, x + 1 + sw * 0.7, y + 5, HP.hemp[1]); rc(g, x + sw * 0.7 - 3, y + 5, 7, 2, HP.iron[4]);                                                       /* the strap and its bar */
    if (z.kind === 'glide') { const k = Math.floor(time * 30) & 1; dot(g, x - 7, y - 1 + k, HP.steel[3]); dot(g, x - 9, y + k, HP.steel[2]); }                                                             /* a spark off the cable */
  }
}

/* ---------- DRESSING: the Lee Hut, the lee rocks ---------- */
const sm = new Map(); const spr = (k, w, h, fn) => { if (!sm.has(k)) { const [c, g] = canvas(w, h); fn(g); sm.set(k, c); } return sm.get(k); };
/* THE LEE HUT (dry stone, an iron roof, a lit door, a chimney) 104 x 60: stands on the landing at its row */
export const LEE_HUT = () => spr('hut', 104, 62, g => {
  for (let y = 18; y < 62; y++) for (let x = 6; x < 100; x++) { const course = ((y - 18) / 7) | 0, off = (course & 1) * 9, bx = ((x + off) / 18) | 0, blk = (bx * 7 + course * 13) % 5; const joint = ((x + off) % 18 === 0) || ((y - 18) % 7 === 0);
    rc(g, x, y, 1, 1, joint ? HP.stone[0] : HP.stone[1 + (blk % 3) + (x < 14 ? 1 : 0) - (x > 90 ? 1 : 0)]); }
  rc(g, 6, 18, 94, 2, HP.stone[4]); rc(g, 6, 18, 1, 44, HP.stone[4]);
  for (let k = 0; k < 7; k++) { const y = 4 + k * 2; rc(g, 0 + k * 0, y + 8 - k, 104, 2, k < 1 ? HP.iron[5] : HP.iron[2 + (k & 1)]); }                                                    /* the iron roof: corrugated rows */
  for (let x = 0; x < 104; x += 4) { rc(g, x, 6, 1, 14, HP.iron[1]); rc(g, x + 1, 6, 1, 14, HP.iron[4]); }
  rc(g, 0, 18, 104, 2, HP.iron[0]); rc(g, 0, 16, 104, 2, HP.iron[3]); for (let x = 3; x < 104; x += 11) dot(g, x, 17, HP.iron[6]);
  for (let x = 4; x < 100; x += 3) if ((x * 7) % 5 < 3) rc(g, x, 3 + ((x * 3) % 3), 2, 2, HP.rime[1 + (x % 2)]);                                                                     /* rime on the roof ridge */
  rc(g, 76, -0, 10, 8, HP.stone[3]); rc(g, 76, 0, 10, 2, HP.stone[5]); rc(g, 77, 8, 8, 2, HP.iron[1]);                                                                              /* chimney (clipped into the sprite top) */
  rc(g, 40, 30, 18, 32, HP.iron[0]); rc(g, 41, 31, 16, 31, HP.lamp[0]); rc(g, 43, 33, 12, 29, HP.lamp[1]); rc(g, 45, 35, 8, 27, HP.lamp[2]); rc(g, 47, 38, 4, 24, HP.lamp[3]);               /* the door, lit from within */
  rc(g, 38, 28, 22, 3, HP.stone[5]); rc(g, 38, 28, 22, 1, HP.stone[5]);                                                                                                               /* the lintel stone */
  rc(g, 14, 32, 10, 9, HP.iron[0]); rc(g, 15, 33, 8, 7, HP.lamp[1]); rc(g, 17, 34, 4, 5, HP.lamp[3]); rc(g, 18, 33, 1, 7, HP.iron[1]); rc(g, 14, 41, 10, 2, HP.stone[5]);                    /* a window */
  rc(g, 74, 32, 10, 9, HP.iron[0]); rc(g, 75, 33, 8, 7, HP.lamp[1]); rc(g, 77, 34, 4, 5, HP.lamp[3]); rc(g, 78, 33, 1, 7, HP.iron[1]); rc(g, 74, 41, 10, 2, HP.stone[5]);
  rc(g, 62, 36, 8, 2, HP.iron[3]); rc(g, 62, 38, 1, 8, HP.iron[3]); rc(g, 69, 38, 1, 8, HP.iron[3]);                                                                                   /* a lantern bracket by the door... */
  rc(g, 63, 44, 6, 8, HP.iron[1]); rc(g, 64, 45, 4, 6, HP.lamp[2]); rc(g, 65, 46, 2, 3, HP.lamp[3]);
  rc(g, 2, 50, 6, 12, HP.stone[3]); rc(g, 2, 50, 6, 1, HP.stone[5]); rc(g, 96, 52, 8, 10, HP.stone[2]); rc(g, 96, 52, 8, 1, HP.stone[5]);                                              /* buttress stones */
});
/* A LEE ROCK: a granite boulder with a flat lit shoulder and rime, big enough to shelter behind: 3 variants */
export const LEE_ROCK = v => spr('lee' + v, 40 + v * 8, 30 + v * 4, g => {
  const W = 40 + v * 8, H = 30 + v * 4;
  for (let y = 0; y < H; y++) { const k = y / H, hw = Math.round(Math.sqrt(1 - Math.pow(1 - k, 2.2)) * (W / 2 - 1) + 1); for (let x = W / 2 - hw; x < W / 2 + hw; x++) { const lit = x < W / 2 - hw * 0.15, bed = (y >> 2), bt = ((bed * 5 + v) % 3) - 1;
    rc(g, x, y, 1, 1, HP.stone[clamp(2 + (lit ? 1 : 0) + bt + ((x * 7 + y * 3) % 11 === 0 ? 1 : 0) - (k > 0.8 ? 1 : 0), 0, 5)]); } }
  for (let x = 4; x < W - 4; x++) { const h = 2 + ((x * 5 + v) % 4); if ((x * 3 + v) % 4 < 3) rc(g, x, Math.round(H * (1 - Math.sqrt(Math.max(0, 1 - Math.pow((x - W / 2) / (W / 2), 2)))) ), 1, 2, HP.rime[(x & 1) + 1]); }
  rc(g, 0, H - 2, W, 2, HP.stone[0]);
});
export function dress(decor, L, at, T) {
  const add = (c, x, y) => decor.push({ k: 'hldress', x: R(x), y: R(y), c, bg: true, sway: 0 });
  /* THE LEE HUT: on its landing (index 14: cols 68-78, row 134), the door toward the checkpoint */
  const hut = (L.landings || [])[14]; if (hut) add(LEE_HUT(), (hut[0] + 0.25) * 16, hut[1] * 16 - 61);
  /* THE LEE ROCKS: on the lee landings of the gorge (boxes of lineKit.lee) - a boulder at the wall end of each, 2 for the long ones */
  let v = 0; for (const b of (L.lineKit && L.lineKit.lee) || []) for (const land of L.landings || []) { if (land[1] < b[1] || land[1] > b[3] || land[0] < b[0] || land[2] > b[2] || (land[2] - land[0]) < 6) continue;
    const wallL = land[0] <= 3; const rk = LEE_ROCK(v++ % 3); add(rk, (wallL ? land[0] : land[2] + 1) * 16 + (wallL ? 6 : -6 - rk.width), land[1] * 16 - rk.height + 3);
    if (land[2] - land[0] > 14) { const rk2 = LEE_ROCK(v++ % 3); add(rk2, (wallL ? land[2] - 7 : land[0] + 2) * 16, land[1] * 16 - rk2.height + 3); } }
}
