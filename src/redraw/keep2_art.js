// keep2_art.js - UNDERWATER KEEP 2's PIECES (claude/k2art, 2026-11-12): everything src/keep-floods-hands.js drew in greybox rectangles, in the keep's own palette (verdigris iron, teal-green plate, drowned stone).
// Pure drawing on a 2d context, fillRect only, screen coordinates (the hands subtract the camera).
//   drawFloodgate    the FLOODGATE FRAME at a chamber's wall: two banded iron posts (green-gone at the waterline), a lintel with a winch drum and chain, guide slots, a raised sluice plate (flooded: raised, a gap you
//                    swim through) or a lowered one (drained: plate down on the sill), weed from the lintel, a lamp that reads the chamber's water (teal = flooded, amber = dry)
//   drawPortcullis   THE DECREE GATE: a column of black iron bars with spiked feet, three crossbars with rivets, two chains going up into the stone; `k` = how far down; `pin` = it is on him (gold lit rivets)
//   drawGateHint     the gate column's reads, drawn nicely: the decree's red warning chevrons / the gold "work a lever NOW" chevrons (the existing rect washes stay under them)
//   drawTridentFlight / drawTridentStuck   the thrown trident in the air (spin-free, tines first, a wake) and stuck in the stone (quivering, a gold ring while it is out), and the call-back line
//   drawProng        a CURSED PRONG: a ghost-green trident head, a trail
//   drawGrasp        THE DROWNED GRASP: told = red cracks in the floor; live = grey-green hands and forearms up out of the silt, fingers hooked
//   drawLeechLine    the curse's tendril: a green line that sags between his open mouth and your chest, knotted
//   drawDressing     flooded-room DRESSING on the live Keep's palette: weed and chains hung from the ceiling, silt on the floor, drifting motes, bubbles; only inside the chambers and the throne room
import { drawTrident, setCtx } from './drowned_king2_art.js';
const R = Math.round;
export const K2A = {
  vd: ['#0a1c18', '#16403a', '#2a6e5e', '#3f8f7d', '#78c8b0'], iron: ['#0a0e12', '#1c222a', '#3a4452', '#6e7e8e', '#aab2bc'], gold: ['#5a4412', '#a07e22', '#e0bc44', '#fff0a8'], stone: ['#1a2a2c', '#2a3e40', '#3a5254', '#56666e'],
  weed: ['#0e2a1c', '#1e5a38', '#3e8a60', '#6aaa7a'], silt: ['#2a3a38', '#3e504c', '#566a64'], curse: ['#0c2018', '#2a5a30', '#8fd160', '#d4f4a0'], red: '#ff6b6b', hot: '#ffd36b', lamp: ['#7ff0e0', '#dffffa'], amber: ['#7a4a14', '#ffb45c', '#fff0b0'],
};
const rect = (g, x, y, w, h, c, a = 1) => { if (a !== 1) g.globalAlpha = a; g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); if (a !== 1) g.globalAlpha = 1; };
const ln = (g, x0, y0, x1, y1, c, th = 1, a = 1) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); if (a !== 1) g.globalAlpha = a; g.fillStyle = c; for (let i = 0; i <= n; i++) g.fillRect(R(x0 + (x1 - x0) * i / n), R(y0 + (y1 - y0) * i / n), th, th); if (a !== 1) g.globalAlpha = 1; };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };

/* THE FLOODGATE FRAME: (x, y) = the centre column's x and the TOP of the sump; h = how far down the frame runs (to the sea bed). o = { k: the chamber's water 0..1, side: -1 left wall / +1 right wall, t } */
export function drawFloodgate(g, x, y, h, o = {}) {
  x = R(x); y = R(y); const k = o.k ?? 1, t = o.t || 0, wet = k > 0.5, hh = Math.max(24, R(h));
  for (const dx of [-7, 5]) {                                                                                         /* the two posts: banded iron, green at the foot */
    rect(g, x + dx, y, 3, hh, K2A.iron[1]); rect(g, x + dx, y, 1, hh, K2A.iron[3]); rect(g, x + dx + 2, y, 1, hh, K2A.iron[0]);
    for (let q = 6; q < hh; q += 9) { rect(g, x + dx - 1, y + q, 5, 2, K2A.iron[2]); rect(g, x + dx - 1, y + q, 5, 1, K2A.iron[4]); }
    const g0 = Math.max(0, hh - 22); for (let q = g0; q < hh; q++) rect(g, x + dx, y + q, 3, 1, K2A.vd[(q + dx) & 1 ? 2 : 3], 0.35 + 0.35 * (q - g0) / 22); }
  rect(g, x - 9, y - 6, 18, 5, K2A.iron[1]); rect(g, x - 9, y - 6, 18, 1, K2A.iron[4]); rect(g, x - 9, y - 2, 18, 1, K2A.iron[0]);        /* the lintel */
  for (const dx of [-7, -2, 3, 7]) rect(g, x + dx, y - 5, 2, 2, K2A.vd[3]);                                                          /* verdigris rivets */
  rect(g, x - 4, y - 14, 9, 8, K2A.iron[2]); rect(g, x - 4, y - 14, 9, 1, K2A.iron[4]); rect(g, x - 3, y - 12, 7, 4, K2A.iron[0]);     /* the winch drum on it, wound with chain */
  for (let q = 0; q < 3; q++) rect(g, x - 3 + q * 3, y - 12, 1, 4, K2A.iron[3]);
  rect(g, x - 1, y - 6, 1, 4, K2A.iron[3]);                                                                                       /* the chain to the plate */
  /* the sluice plate: flooded = raised into the lintel (an open sill: swim through); drained = lowered to the sill (shut) */
  const plateY = wet ? y - 1 : y + hh - 13;
  rect(g, x - 5, plateY, 10, 12, K2A.iron[0]); rect(g, x - 4, plateY + 1, 8, 10, K2A.vd[1]); rect(g, x - 4, plateY + 1, 8, 1, K2A.vd[3]);
  for (let q = 0; q < 3; q++) rect(g, x - 3, plateY + 3 + q * 3, 6, 1, K2A.vd[0]);
  if (!wet) { rect(g, x - 1, y + 1, 1, hh - 14, K2A.iron[3], 0.9); }
  /* weed hung from the lintel, a lamp that reads the water */
  for (let i = 0; i < 3; i++) { const wx = x - 7 + i * 7, len = 8 + (hash(x, i) % 8); for (let q = 0; q < len; q++) rect(g, wx + R(Math.sin(t * 1.6 + i + q * 0.35) * (q / 5)), y - 1 + q, 1, 1, K2A.weed[q > len - 3 ? 3 : q & 1 ? 1 : 2]); }
  const lc = wet ? K2A.lamp[0] : K2A.amber[1]; rect(g, x + 6, y - 11, 4, 4, K2A.iron[0]); rect(g, x + 7, y - 10, 2, 2, lc); rect(g, x + 7, y - 10, 1, 1, wet ? K2A.lamp[1] : K2A.amber[2]);
  rect(g, x + 5, y - 12, 6, 6, lc, 0.1 + 0.06 * Math.sin(t * 3));
}

/* THE DECREE GATE: one 16-px column; yTop..yBot = the rows it covers (screen y), k 0..1 = how far down it is (1 = shut). */
export function drawPortcullis(g, x, yTop, yBot, o = {}) {
  x = R(x); const k = o.k ?? 1, t = o.t || 0, hh = R((yBot - yTop) * k), y1 = R(yTop) + hh, pin = !!o.pin;
  if (hh <= 2) return;
  for (let b = -7; b <= 6; b += 3) { rect(g, x + b, yTop, 2, hh, K2A.iron[0]); rect(g, x + b, yTop, 1, hh, K2A.iron[3]); rect(g, x + b + 1, yTop, 1, hh, K2A.iron[1]);
    for (let q = 0; q < 6; q++) rect(g, x + b + (q < 2 ? 0 : 0), y1 + q - 1, q < 3 ? 2 : 1, 1, K2A.iron[q < 2 ? 4 : 3]);                      /* the spiked foot (a point under every bar) */
    rect(g, x + b, y1 + 3, 1, 3, K2A.iron[4]); }
  for (let q = 10; q < hh; q += 28) { rect(g, x - 8, yTop + q, 16, 3, K2A.iron[1]); rect(g, x - 8, yTop + q, 16, 1, K2A.iron[4]); rect(g, x - 8, yTop + q + 2, 16, 1, K2A.iron[0]);
    for (const dx of [-6, 0, 5]) rect(g, x + dx, yTop + q, 2, 2, pin ? K2A.hot : K2A.vd[3]); }
  for (const dx of [-6, 5]) for (let q = 0; q < Math.min(hh, 40); q += 3) { rect(g, x + dx, yTop + q, 2, 2, q % 6 ? K2A.iron[3] : K2A.iron[1]); }                  /* the chains up into the stone */
  if (pin) rect(g, x - 9, yTop, 18, hh + 4, K2A.hot, 0.1 + 0.08 * Math.sin(t * 10));
  for (let i = 0; i < 4; i++) rect(g, x - 6 + i * 4, y1 + 6 + ((t * 20 + i * 5) % 9), 1, 1, K2A.lamp[0], 0.6);                                  /* water running off the feet */
}

/* THE GATE'S READS: red warning chevrons while he decrees (down the column), gold chevrons over it while he is under it (work a lever NOW) */
export function drawGateHint(g, x, yTop, yBot, mode, t) {
  x = R(x); const c = mode === 'decree' ? K2A.red : K2A.hot, n = Math.max(1, R((yBot - yTop) / 18));
  for (let i = 0; i < n; i++) { const yy = yTop + ((i * 18 + (mode === 'decree' ? t * 30 : -t * 24)) % (yBot - yTop)); const a = 0.35 + 0.35 * Math.sin(t * 14 + i);
    for (let q = 0; q < 5; q++) { rect(g, x - 5 + q, yy + (mode === 'decree' ? q : 4 - q), 1, 1, c, a); rect(g, x + 5 - q, yy + (mode === 'decree' ? q : 4 - q), 1, 1, c, a); } }
}

/* THE TRIDENT IN THE AIR: (x, y) = its centre, vx/vy its velocity (it flies tines first). */
export function drawTridentFlight(g, x, y, vx, vy, t) {
  const deg = Math.atan2(vy, vx || 0.001) * 180 / Math.PI, [dx, dy] = [Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180)];
  for (let i = 1; i <= 6; i++) rect(g, x - dx * (18 + i * 5), y - dy * (18 + i * 5), 2, 1, K2A.lamp[1], 0.5 - i * 0.07);                      /* the wake */
  drawTrident2(g, x, y, deg, 19, { tm: t, glint: true });
}
/* stuck in the stone: it hangs where it stopped, a little askew, quivering, a gold ring while he is bare-handed; the call-back line is drawn by the caller */
export function drawTridentStuck(g, x, y, vx, vy, t, o = {}) {
  const deg = Math.atan2(vy, vx || 0.001) * 180 / Math.PI + Math.sin(t * 34) * (o.fresh ? 3 : 0.6);
  drawTrident2(g, x, y, deg, 19, { tm: t });
  if (o.ring) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; rect(g, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 1, 1, K2A.hot, 0.8); }
}
/* the king's trident, standalone: setCtx points the king file's drawing state at g with (x, y) as the origin */
export function drawTrident2(g, x, y, deg, grip, o = {}) { setCtx(g, x, y); drawTrident(0, 0, deg, grip, o); }

export function drawProng(g, x, y, vx, vy, t) {
  const deg = Math.atan2(vy, vx || 0.001) * 180 / Math.PI, a = deg * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
  for (let i = 1; i <= 5; i++) rect(g, x - dx * i * 4, y - dy * i * 4, 2, 2, K2A.curse[1], 0.6 - i * 0.1);
  for (const s of [-1, 0, 1]) ln(g, x - dx * 4 - dy * s * 3, y - dy * 4 + dx * s * 3, x + dx * 6 - dy * s * 3, y + dy * 6 + dx * s * 3, s ? K2A.curse[2] : K2A.curse[3], 1);
  rect(g, x - 1, y - 1, 3, 3, K2A.curse[2], 0.55 + 0.25 * Math.sin(t * 20));
}

/* THE DROWNED GRASP over G = { x0, x1, live } on the floor row `floor`: told = red cracks; live = hands up out of the silt */
export function drawGrasp(g, x0, x1, floor, live, t) {
  if (!live) { for (let x = x0 + 4; x < x1; x += 7) { const a = 0.4 + 0.3 * Math.sin(t * 18 + x); rect(g, x, floor - 2, 5, 1, K2A.red, a); rect(g, x + 2, floor - 3, 1, 1, K2A.red, a); rect(g, x + 1, floor - 1, 3, 1, K2A.red, a * 0.7); }
    rect(g, x0, floor - 1, x1 - x0, 1, K2A.red, 0.2 + 0.15 * Math.sin(t * 18)); return; }
  for (let x = x0 + 5; x < x1 - 2; x += 9) { const hgt = 12 + (hash(x, 3) % 8) + 3 * Math.sin(t * 9 + x), sway = Math.sin(t * 7 + x * 0.3) * 1.5;
    rect(g, x - 2, floor - 3, 7, 3, K2A.silt[1]); rect(g, x - 3, floor - 2, 9, 2, K2A.silt[2]);                           /* the silt it comes up through */
    for (let q = 0; q < hgt; q++) { const yy = floor - 3 - q, w = q < 3 ? 3 : 2; rect(g, x + R(sway * q / hgt), yy, w, 1, q % 4 ? K2A.curse[1] : K2A.curse[0]); rect(g, x + R(sway * q / hgt), yy, 1, 1, K2A.curse[2]); }
    for (const f of [-2, 0, 2]) { const tx = x + R(sway) + f, ty = floor - 3 - hgt; rect(g, tx, ty - 3, 1, 3, K2A.curse[3]); rect(g, tx + (f > 0 ? 1 : f < 0 ? -1 : 0), ty - 4, 1, 1, K2A.curse[2]); } }                /* the hooked fingers */
}

/* THE CURSE'S LEECH: a tendril from (x0, y0) to (x1, y1), sagging in the middle, a knot at the far end */
export function drawLeechLine(g, x0, y0, x1, y1, t) {
  const n = 18; let px = x0, py = y0;
  for (let i = 1; i <= n; i++) { const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * (6 + 2 * Math.sin(t * 9)); ln(g, px, py, x, y, i % 3 ? K2A.curse[1] : K2A.curse[2], 2); rect(g, x, y - 1, 1, 1, K2A.curse[3], 0.8); px = x; py = y; }
  rect(g, x1 - 2, y1 - 2, 5, 5, K2A.curse[0]); rect(g, x1 - 1, y1 - 1, 3, 3, K2A.curse[2]); rect(g, x1, y1, 1, 1, K2A.curse[3]);
}

/* FLOODED-ROOM DRESSING: x0..x1 in world px, ceilY / floorY world px; (cx, cy) the camera. Weed + chains from the ceiling, silt along the floor, motes + bubbles. Everything keyed to world x (it never swims as the camera moves). */
export function drawDressing(g, cx, cy, VW, x0, x1, ceilY, floorY, t, o = {}) {
  const a = Math.max(x0, cx - 8), b = Math.min(x1, cx + VW + 8); if (b <= a) return; const dens = o.dens ?? 40;
  for (let wx = Math.ceil(a / dens) * dens; wx < b; wx += dens) { const h = hash(wx, 7), x = wx + (h % 13) - 6, len = 10 + (h >> 4) % 22, kind = (h >> 9) % 5;
    if (kind === 0) { /* a hanging chain with a hook */ for (let q = 0; q < len; q += 3) { rect(g, x - cx, ceilY + q - cy, 2, 2, q % 6 ? K2A.iron[3] : K2A.iron[1]); } rect(g, x - cx - 1, ceilY + len - cy, 4, 1, K2A.iron[2]); rect(g, x - cx + 2, ceilY + len - cy, 1, 3, K2A.iron[2]); }
    else { for (let q = 0; q < len; q++) { const sw = Math.sin(t * 1.4 + wx * 0.1 + q * 0.3) * (q / 6); rect(g, x + R(sw) - cx, ceilY + q - cy, 1 + ((q & 3) === 0 ? 1 : 0), 1, q > len - 4 ? K2A.weed[3] : q & 1 ? K2A.weed[1] : K2A.weed[2]); }
      if (kind === 1) for (let q = 2; q < len; q += 5) rect(g, x - 2 + R(Math.sin(t * 1.4 + wx * 0.1 + q * 0.3) * (q / 6)) - cx, ceilY + q - cy, 2, 1, K2A.weed[2]); } }
  for (let wx = Math.ceil(a / 24) * 24; wx < b; wx += 24) { const h = hash(wx, 11), w = 10 + (h % 14), x = wx + (h >> 5) % 9;                               /* silt drifts on the floor with the odd bone and link of chain in it */
    for (let i = 0; i < w; i++) { const hh = 1 + R(Math.sin(i / w * Math.PI) * 2); rect(g, x + i - cx, floorY - hh - cy, 1, hh, i & 1 ? K2A.silt[1] : K2A.silt[2]); }
    if ((h >> 11) % 3 === 0) { rect(g, x + 3 - cx, floorY - 4 - cy, 4, 1, K2A.iron[3]); rect(g, x + 4 - cx, floorY - 3 - cy, 1, 2, K2A.iron[2]); } else if ((h >> 11) % 3 === 1) { rect(g, x + 2 - cx, floorY - 3 - cy, 5, 1, '#d8ccb0'); rect(g, x + 1 - cx, floorY - 4 - cy, 2, 1, '#f2ead4'); } }
  for (let i = 0; i < 14; i++) { const mx = a + ((hash(i, 5) % 1000) / 1000) * (b - a), my = ceilY + 6 + ((hash(i, 9) % 1000) / 1000) * (floorY - ceilY - 12), drift = (t * (4 + i % 4) + i * 37) % 24;
    rect(g, mx + Math.sin(t * 0.6 + i) * 6 - cx, my - drift * 0.25 - cy, 1, 1, K2A.lamp[0], 0.25); }
  for (let i = 0; i < 4; i++) { const bx = a + ((hash(i, 21) % 1000) / 1000) * (b - a), by = floorY - ((t * 14 + i * 53) % (floorY - ceilY)); rect(g, bx + Math.sin(t * 3 + i) * 2 - cx, by - cy, 2, 2, K2A.lamp[1], 0.4); rect(g, bx + Math.sin(t * 3 + i) * 2 - cx, by - cy, 1, 1, '#ffffff', 0.5); }
}
