// gt_art.js - THE GHOST TRAIN's ART (claude/gtart): the night streaming past, every car's interior and iron, lamps and their light, the ghost passengers and dead firemen, the tunnel mouth
// and the low bridge, couplings, the points, the ride's facade, the stack's sparks. Rect-only (fillRect + globalAlpha), so tools/gtart-sheet.mjs renders it in Node with no browser.
// Pure: everything it needs comes in as arguments (the hands own all state). Called only while L.ghostTrain (flag on).
import { GP } from './gt_tiles.js';

const R = Math.round, TS = 16;
const rect = (g, x, y, w, h, col) => { if (w <= 0 || h <= 0) return; g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* a soft round glow from stacked scanline spans (no arcs: node-renderable) */
export function glow(g, cx, cy, r, col, a, rings = 3) {
  for (let k = 0; k < rings; k++) { const rr = r * (1 - k / rings * 0.7), al = a * (0.35 + k * 0.4) / rings; g.globalAlpha = al; g.fillStyle = col;
    for (let dy = -rr; dy <= rr; dy += 3) { const half = Math.sqrt(Math.max(0, rr * rr - dy * dy)); g.fillRect(R(cx - half), R(cy + dy), R(half * 2), 3); } }
  g.globalAlpha = 1;
}
const disc = (g, cx, cy, r, col) => { g.fillStyle = col; for (let dy = -r; dy <= r; dy++) { const h = Math.floor(Math.sqrt(r * r - dy * dy + 0.5)); g.fillRect(R(cx - h), R(cy + dy), h * 2 + 1, 1); } };

/* THE SKY SECTIONS: [top, bottom, glow] by section (0 siding .. 5 front cars) */
export const SKY = [['#14102a', '#3a2850', '#e8b0ff'], ['#0a1030', '#1c2a50', '#9ec4ff'], ['#0a1432', '#1a3040', '#9ee8d8'], ['#060a1e', '#101a38', '#7a9ae0'], ['#120e1e', '#3a2030', '#ff9a5c'], ['#160a1e', '#3a1428', '#ff6a4a']];
const mixc = (a, b, k) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)), A = p(a), B = p(b); return '#' + A.map((v, i) => R(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
export function secIndex(tx, secs) { for (let i = secs.length - 1; i >= 0; i--) if (tx >= secs[i][1]) return i; return 0; }

/* ================= THE NIGHT BEHIND: sky, moon, the hexed fields' far ridge, the fair's wheel, wisps, fog ================= */
export function drawSky(g, cx, VW, VH, horizon, time, sec, mix = 0) {
  const a = SKY[sec] || SKY[1], b = SKY[Math.min(5, sec + 1)], top = mixc(a[0], b[0], mix), bot = mixc(a[1], b[1], mix), gl = mixc(a[2], b[2], mix), H = Math.max(40, horizon);
  const N = 14; for (let i = 0; i < N; i++) rect(g, 0, Math.floor(H * i / N), VW, Math.ceil(H / N) + 1, mixc(top, bot, i / (N - 1)));
  for (let i = 0; i < 46; i++) { const h = hash(i, 7), x = h % VW, y = (h >>> 9) % Math.max(10, R(H * 0.62)), tw = Math.sin(time * 2 + i) > 0.6; if (!tw || i % 2) rect(g, x, y, 1, 1, i % 5 ? '#aab8e0' : '#ffffff'); }
  const mx = R(VW * 0.8), my = 38; glow(g, mx, my, 34, gl, 0.14); disc(g, mx, my, 11, '#e6eefc'); disc(g, mx - 3, my - 2, 9, '#f6faff'); rect(g, mx + 2, my + 3, 3, 2, '#c4d0e6'); rect(g, mx - 5, my - 3, 2, 2, '#c4d0e6');   /* the moon */
  const fx = (cx * 0.04 + time * 14) % 600;
  /* the far ridge of the hexed fields: low swells, a dead windmill, the fair's wheel and its dwindling lights (where the ride came from) */
  const ridge = (par, hh, col, off) => { const sc = ((cx * par + time * par * 40) % 4096); for (let x = 0; x < VW; x += 4) { const wx = x + sc, hgt = hh + Math.sin(wx / 53 + off) * hh * 0.35 + Math.sin(wx / 17 + off * 2) * 2.5; rect(g, x, H - hgt, 4, hgt + 2, col); } };
  ridge(0.12, 30, mixc(bot, '#0a0c1c', 0.45), 1);
  { const wx = R(VW * 0.28 - ((cx * 0.12 + time * 4.8) % (VW + 200)) + (VW + 200)) % (VW + 200) - 60, wy = H - 28;   /* the fair's wheel, a long way back */
    for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4 + time * 0.15, ex = R(wx + Math.cos(an) * 20), ey = R(wy - 22 + Math.sin(an) * 20); rect(g, ex, ey, 2, 2, k % 2 ? '#ffd890' : '#ff9ac0'); rect(g, R(wx + (ex - wx) / 2), R(wy - 22 + (ey - wy + 22) / 2), 1, 1, '#2a2640'); } rect(g, wx - 1, wy - 22, 3, 24, '#201c34'); rect(g, wx - 5, wy + 2, 11, 2, '#201c34'); }
  ridge(0.2, 20, mixc(bot, '#06081a', 0.7), 2.7);
  for (let i = 0; i < 6; i++) { const wx = ((hash(i, 3) % 900) - (cx * 0.2 + time * 8) % 900 + 900 * 3) % 900 - 40; if (wx > VW + 20) continue;   /* scarecrows on their posts, a crow on one */
    rect(g, wx, H - 14, 1, 14, '#0c0a18'); rect(g, wx - 5, H - 11, 11, 1, '#0c0a18'); rect(g, wx - 1, H - 17, 3, 3, '#0c0a18'); if (i % 2) rect(g, wx + 3, H - 13, 2, 2, '#0c0a18'); }
  for (let i = 0; i < 5; i++) { const t = time * 0.35 + i * 1.7, wx = (hash(i, 5) % VW + Math.sin(t) * 24 - (cx * 0.3 + time * 20) % VW + VW * 3) % VW, wy = H - 12 - ((hash(i, 6) % 30)) + Math.sin(t * 1.3) * 5;   /* will-o'-wisps over the furrows */
    glow(g, wx, wy, 7, '#7ee8c0', 0.28, 2); rect(g, wx, wy, 2, 2, '#d8fff0'); }
  ridge(0.32, 13, '#05060f', 4.1);
  for (let i = 0; i < 4; i++) { const fxp = ((i * 211 - (cx * 0.2 + time * 22)) % 900 + 900) % 900 - 100; g.globalAlpha = 0.16; rect(g, fxp, H - 40 + i * 6, 190, 8, mixc(gl, '#ffffff', 0.3)); rect(g, fxp + 30, H - 46 + i * 6, 120, 5, mixc(gl, '#ffffff', 0.3)); g.globalAlpha = 1; }   /* ground fog */
  rect(g, 0, H, VW, 4000, '#05060f');   /* the dark embankment under the horizon, behind the cars */
  if (sec === 3) { for (let x = 0; x < VW; x += 6) { const wx = x + (cx * 0.5 + time * 70) % 4000, hh = 70 + (hash(R(wx / 6), 2) % 36) + Math.sin(wx / 31) * 8; rect(g, x, H - hh, 6, hh, '#07080e'); if (hash(R(wx / 6), 9) % 9 === 0) rect(g, x + 2, H - hh + 2, 1, 14 + hash(R(wx / 6), 4) % 20, '#14182a'); } }   /* THE CUTTING: the clay walls and their dangling roots */
}

/* ================= THE TRACK: ballast, rails, sleepers and poles flying back ================= */
export function drawGround(g, groundY, VW, VH, time, sp, cx, glowCol) {
  rect(g, 0, groundY, VW, VH - groundY, '#120f1c'); rect(g, 0, groundY, VW, 3, '#2a2440');
  const off = (time * sp * 0.5) % 28;
  for (let k = -1; k < VW / 28 + 2; k++) { const x = R(k * 28 - off); rect(g, x, groundY + 5, 14, 4, '#241c30'); rect(g, x, groundY + 5, 14, 1, '#3c3050'); rect(g, x + 2, groundY + 9, 10, 2, '#0a0814'); }   /* sleepers, from above and slightly down */
  rect(g, 0, groundY + 3, VW, 2, '#6a6a86'); rect(g, 0, groundY + 3, VW, 1, '#b8b8d4'); rect(g, 0, groundY + 11, VW, 2, '#4a4a64');   /* the two rails: the near one catching the lamps */
  for (let k = 0; k < VW / 8; k++) { const x = (hash(k, 1) % VW), y = groundY + 14 + hash(k, 2) % Math.max(4, VH - groundY - 16); rect(g, ((x - (time * sp * 0.9) % VW) + VW * 2) % VW, y, 6 + hash(k, 3) % 12, 1, '#201a2c'); }   /* ballast streaks */
  for (let k = 0, o2 = (time * sp * 0.45) % 150; k < VW / 150 + 2; k++) { const x = R(k * 150 - o2), px_ = x, top = groundY - 78;   /* telegraph poles: crossarm, glass insulators, a dead lamp that is not dead */
    rect(g, px_, top, 3, 78, '#241e32'); rect(g, px_ + 1, top, 1, 78, '#382e4a'); rect(g, px_ - 9, top + 6, 21, 2, '#241e32'); rect(g, px_ - 9, top + 14, 21, 2, '#241e32');
    for (const dx of [-8, -3, 5, 10]) { rect(g, px_ + dx, top + 3, 2, 3, '#7ae8c8'); rect(g, px_ + dx, top + 11, 2, 3, '#7ae8c8'); }
    rect(g, px_ - 1, top - 5, 5, 5, '#fff0c4'); glow(g, px_ + 1, top - 2, 14, '#fff0c4', 0.18, 2);
    for (let w = 0; w < 150; w += 6) rect(g, px_ + 10 + w, top + 5 + Math.round(Math.sin(w / 150 * Math.PI) * 6), 6, 1, '#1c1628'); }
  for (let k = 0, o3 = (time * sp * 0.9) % 70; k < VW / 70 + 2; k++) { const x = R(k * 70 - o3); rect(g, x, groundY - 16, 3, 16, '#1a1426'); rect(g, x - 3, groundY - 13, 12, 2, '#1a1426'); }   /* fence posts, near, very fast */
}

/* ================= WHEELS: a bogie, two spoked wheels under a car end, drawn over the chassis ================= */
export function drawBogie(g, bx, groundY, time) {
  const wy = groundY - 9, ph = Math.floor(time * 18) % 4;
  rect(g, bx - 17, wy - 8, 34, 4, '#1a1a28'); rect(g, bx - 17, wy - 8, 34, 1, '#46465e');                              /* the bogie frame */
  for (const dx of [-9, 9]) { disc(g, bx + dx, wy, 8, '#2a2a3c'); disc(g, bx + dx, wy, 6, '#46465e'); disc(g, bx + dx, wy, 4, '#1a1a28'); disc(g, bx + dx, wy, 1, '#9a9ab6');
    if (ph % 2) { rect(g, bx + dx - 5, wy, 11, 1, '#8c8caa'); rect(g, bx + dx, wy - 5, 1, 11, '#8c8caa'); } else { for (const [a, b] of [[-3, -3], [3, 3], [-3, 3], [3, -3]]) rect(g, bx + dx + a, wy + b, 1, 1, '#8c8caa'); rect(g, bx + dx - 4, wy - 4, 1, 1, '#8c8caa'); rect(g, bx + dx + 4, wy + 4, 1, 1, '#8c8caa'); }
    rect(g, bx + dx - 8, wy + 8, 17, 1, '#6a6a86'); }
  rect(g, bx - 3, wy - 3, 7, 6, '#26263a'); rect(g, bx - 3, wy - 3, 7, 1, '#686886');
}

/* ================= LAMPS: the pale light, and what carries it ================= */
export function drawLamp(g, lx, ly, o) {
  const { on, flick, r, time, kind, oilFrac = 1 } = o, lit = on && !(flick && (time * 14) % 2 < 1);
  if (kind === 'chand') {                                                                                                  /* the dining car's chandelier: a brass hoop, crystal drops, five flames */
    rect(g, lx, ly - 22, 1, 12, '#6a5a3a'); rect(g, lx - 7, ly - 10, 15, 2, '#d0aa4a'); rect(g, lx - 7, ly - 10, 15, 1, '#f0d078'); rect(g, lx - 5, ly - 8, 11, 2, '#80642a');
    for (let i = -3; i <= 3; i += 3) { rect(g, lx + i, ly - 6, 1, 3 + (i === 0 ? 2 : 0), '#bcd4ee'); rect(g, lx + i - 1, ly - 3 + (i === 0 ? 2 : 0), 3, 2, '#dceaf8'); }
    for (let i = -6; i <= 6; i += 3) { rect(g, lx + i, ly - 13, 2, 3, lit ? '#fff0c4' : '#3a3444'); if (lit) rect(g, lx + i, ly - 15 + (Math.sin(time * 9 + i) > 0 ? 0 : 1), 1, 2, '#ffd36b'); }
    if (lit) glow(g, lx, ly - 6, r * 0.78, '#fff0c4', 0.2); return; }
  rect(g, lx, ly - 14, 1, 8, '#4a4258'); rect(g, lx - 3, ly - 6, 7, 2, '#80642a'); rect(g, lx - 3, ly - 6, 7, 1, '#d0aa4a');     /* the cap and the chain */
  rect(g, lx - 3, ly - 4, 7, 7, lit ? '#fff0c4' : '#2a2838'); rect(g, lx - 4, ly - 4, 1, 7, '#4a4258'); rect(g, lx + 4, ly - 4, 1, 7, '#4a4258'); rect(g, lx - 3, ly + 3, 7, 2, '#80642a');   /* the glass chimney */
  if (lit) { const fl = Math.sin(time * 11 + lx) > 0.4 ? 1 : 0; rect(g, lx - 1, ly - 3 + fl, 3, 4 - fl, '#ffd36b'); rect(g, lx, ly - 3 + fl, 1, 2, '#ffffff'); glow(g, lx, ly - 1, r * 0.72, '#fff0c4', 0.22, 3);
    if (kind === 'oil' && oilFrac < 0.3) { g.globalAlpha = 0.5; rect(g, lx - 3, ly - 4, 7, 7, '#2a2838'); g.globalAlpha = 1; } }
  else { rect(g, lx - 1, ly - 2, 3, 4, '#3a3444'); if (kind === 'oil' || kind === 'gas') rect(g, lx, ly - 7 - ((time * 3) % 4), 1, 2, 'rgba(160,160,180,0.35)'); }   /* a cold wick's last thread of smoke */
}
/* a pool of lamp-light on the floor (an ellipse of spans) */
export function lightPool(g, lx, floorY, r, a) { g.fillStyle = '#fff0c4'; for (let k = 0; k < 4; k++) { g.globalAlpha = a * (0.4 + k * 0.2); const w = r * (1.5 - k * 0.3); g.fillRect(R(lx - w / 2), floorY - 2 - k, R(w), 1); } g.globalAlpha = 1; }

/* ================= THE DEAD: ghost passengers and firemen ================= */
const COATS = [['#6a6a9a', '#9aa0c8'], ['#5a4a6a', '#8a78a0'], ['#4a5a6a', '#7a92a8'], ['#6a5a52', '#a08a7a']];
export function drawGhostArt(g, ex, ey, o) {
  const { asleep, mode, face = 1, stoker, seat, time, hx = 0, anim = 0 } = o, f = face >= 0 ? 1 : -1, st = hash(R(hx), 1) % 4, [c0, c1] = stoker ? ['#4a3a34', '#8a6a58'] : COATS[st];
  const A = asleep ? 0.5 : 0.9, wob = Math.sin(time * 3 + hx) * 1.2, mx = x => ex + x * f;
  const body = (x, y, w, h, col, al = A) => { g.globalAlpha = al; rect(g, f > 0 ? ex + x : ex - x - w, ey + y, w, h, col); };
  const bob = asleep ? wob * 0.5 : wob;
  if (seat && asleep) {                                                                                                     /* a diner, asleep over a plate: head down on folded arms */
    body(-5, -12 + bob, 10, 10, c0); body(-5, -12 + bob, 10, 2, c1); body(-6, -6, 12, 3, '#d8e0ec', 0.55); body(-3, -17 + bob, 8, 6, '#c8d4e8'); body(-3, -13 + bob, 8, 3, c0);
    body(-2, -10 + bob, 2, 1, '#5a6078'); body(2, -10 + bob, 2, 1, '#5a6078'); g.globalAlpha = 1; for (let k = 0; k < 2; k++) rect(g, mx(5 + k * 3), ey - 18 - ((time * 6 + k * 3) % 8), 2, 2, 'rgba(188,230,245,0.6)'); return; }
  const lean = asleep ? 3 : mode === 'graspTell' ? -2 : mode === 'grasp' ? 4 : 1;
  /* the wisp of a hem: the dead have no feet, only a tatter that streams back */
  for (let i = 0; i < 5; i++) { const w = 2, tx = -5 + i * 2, len = 3 + ((i + (time * 5 | 0)) % 3) + (asleep ? 0 : 2); body(tx - (asleep ? 0 : 1) - lean * 0.2, -4 + Math.sin(time * 5 + i) * 0.6, w, len, c0, A * (0.8 - i * 0.08)); }
  body(-5 - lean * 0.3, -17 + bob, 10, 14, c0); body(-5 - lean * 0.3, -17 + bob, 3, 14, c1, A * 0.7); body(-1 - lean * 0.3, -16 + bob, 1, 12, '#cdd8ee', A * 0.5);   /* the coat, its lapel */
  for (let k = 0; k < 3; k++) body(0 - lean * 0.3, -14 + k * 4 + bob, 1, 1, '#d0aa4a', A);
  if (stoker) { body(-5, -10 + bob, 10, 1, '#1a1018', A); body(-1, -17 + bob, 1, 14, '#6a4030', A * 0.8); body(-5, -17 + bob, 10, 2, '#2a2430', A); }          /* braces, a soot line */
  const hy = -26 + bob + (asleep ? 3 : 0), hxo = lean * 0.5;
  body(-3 + hxo, hy, 8, 8, stoker ? '#8a7a74' : '#cdd8ee'); body(-3 + hxo, hy + 6, 8, 2, stoker ? '#3a3030' : '#aab8d4');                                                       /* the face and the jaw's shadow */
  if (stoker) { body(-4 + hxo, hy - 2, 10, 3, '#2a2430', A); body(1 + hxo, hy - 3, 6, 1, '#1a1620', A); }                                                                       /* a flat cap */
  else if (st === 0) { body(-4 + hxo, hy - 7, 8, 7, '#16141e', A); body(-5 + hxo, hy - 1, 11, 2, '#16141e', A); body(-4 + hxo, hy - 3, 8, 1, '#80642a', A); }                /* a top hat with a band */
  else if (st === 1) { body(-4 + hxo, hy - 3, 8, 3, '#241a2c', A); body(-5 + hxo, hy - 1, 11, 1, '#241a2c', A); }                                                               /* a bowler */
  else if (st === 2) { body(-4 + hxo, hy - 3, 9, 4, '#7a4a8a', A); body(-4 + hxo, hy + 1, 9, 5, '#6a3a7a', A * 0.5); body(-1 + hxo, hy - 5, 3, 2, '#e0a0c0', A); }            /* a bonnet and a veil */
  else { body(-4 + hxo, hy - 2, 9, 3, '#d8d8e8', A); body(-4 + hxo, hy + 1, 2, 5, '#d8d8e8', A * 0.8); }                                                                        /* a nightcap and a long tail */
  g.globalAlpha = 1;
  if (asleep) { rect(g, mx(hxo - 1), ey + hy + 3, 2, 1, '#4a5068'); rect(g, mx(hxo + 3), ey + hy + 3, 2, 1, '#4a5068'); for (let k = 0; k < 2; k++) rect(g, mx(7 + k * 3), ey - 28 - ((time * 5 + k * 4) % 9), 2, 2, 'rgba(188,230,245,0.65)'); return; }  /* eyes shut, a z of breath */
  const ec = stoker ? '#ff8a3c' : '#9effd0'; glow(g, mx(hxo + 1), ey + hy + 4, 7, ec, 0.34, 2);                              /* AWAKE: two hollow sockets burning */
  rect(g, mx(hxo - 1), ey + hy + 3, 2, 3, ec); rect(g, mx(hxo + 3), ey + hy + 3, 2, 3, ec); rect(g, mx(hxo - 1), ey + hy + 3, 1, 1, '#ffffff'); rect(g, mx(hxo + 3), ey + hy + 3, 1, 1, '#ffffff'); rect(g, mx(hxo), ey + hy + 6, 3, 2, '#08060c');
  if (stoker) { glow(g, mx(0), ey - 10, 10, '#ff6a2a', 0.22, 2); }
  const reach = mode === 'grasp' ? 16 : mode === 'graspTell' ? 3 : 7, up = mode === 'graspTell' ? -6 : 0, hand = stoker ? '#c8a890' : '#e8ecff';
  for (const dy of [0, 4]) { rect(g, mx(3), ey - 17 + dy + up + bob, reach, 2, c1); rect(g, mx(3 + reach - 3), ey - 18 + dy + up + bob, 4, 4, hand); if (mode === 'grasp') { rect(g, mx(3 + reach + 1), ey - 19 + dy + up + bob, 3, 1, hand); rect(g, mx(3 + reach + 1), ey - 16 + dy + up + bob, 3, 1, hand); } }
  if (mode === 'graspTell') glow(g, mx(10), ey - 18 + up, 9, '#e8ecff', 0.3, 2);
}

/* ================= THE CARS ================= */
const WALLS = { van: ['#262634', '#34344a'], coach: ['#242c3a', '#32405a'], dining: ['#2a2036', '#40304e'], sleeper: ['#1a2436', '#28384e'], well: ['#201c2c', '#302a42'], coal: ['#16141e', '#22202e'], tender: ['#1e1e2c', '#2e2e42'], engine: ['#1a1a28', '#2c2c40'] };
/* the night in a window, with the poles and fences going by (u = world x of the pane, so each window shows a different slice) */
function windowPane(g, x, y, w, h, time, sp, u) {
  rect(g, x - 1, y - 1, w + 2, h + 2, '#80642a'); rect(g, x - 1, y - 1, w + 2, 1, '#d0aa4a'); rect(g, x, y, w, h, '#0c1028'); rect(g, x, y, w, 3, '#141a3c'); rect(g, x, y + h - 3, w, 3, '#06081a');
  const ph = (time * sp * 0.9 + u) % (w + 24); rect(g, x + w - ph + 8, y, 2, h, '#1a1426'); const ph2 = (time * sp * 0.5 + u * 1.7) % (w + 40); rect(g, x + w - ph2, y + 2, 1, h - 4, '#2a2640');
  rect(g, x + 2, y + 2, 1, 1, '#9cb4d2'); rect(g, x + w - 4, y + 3, 1, 1, '#cfe0f2'); g.globalAlpha = 0.18; rect(g, x + 1, y + 1, 3, h - 2, '#dceaf8'); rect(g, x + w - 3, y + 1, 1, h - 2, '#dceaf8'); g.globalAlpha = 1;
}
const seatRow = (g, X, Y, x0, x1, floorY, col, back) => { for (let tx = x0; tx < x1; tx += 3) { const sx = X(tx * TS + 2); rect(g, sx, floorY - 26, 3, 24, back); rect(g, sx, floorY - 26, 3, 1, '#7a5a8a'); rect(g, sx + 3, floorY - 10, 8, 8, col); rect(g, sx + 3, floorY - 10, 8, 1, back); rect(g, sx + 4, floorY - 2, 1, 2, '#1a1626'); rect(g, sx + 9, floorY - 2, 1, 2, '#1a1626'); } };
/* a closed car's interior wall, windows, furniture and the roof fittings above it (rows 12.. are tiles: this is what stands behind and on top) */
export function drawCarInterior(g, c, X, Y, time, sp, opt = {}) {
  const b0 = c.body ? c.body[0] : c.x0, kind = c.kind, [w0, w1] = WALLS[kind] || WALLS.van, floorY = Y(18 * TS), topY = Y(13 * TS), roofY = Y(12 * TS);
  const xa = X((b0 + 1) * TS), xb = X(c.x1 * TS), W = xb - xa; if (xb < -40 || xa > opt.VW + 40) return;
  rect(g, xa, topY, W, floorY - topY, w0);
  for (let tx = b0 + 1; tx < c.x1; tx++) { const sx = X(tx * TS); rect(g, sx, topY + 4, 1, floorY - topY - 4, w1); }                                      /* wall panelling: pilasters every tile */
  rect(g, xa, topY + 3, W, 1, GP.brassD); rect(g, xa, floorY - 14, W, 1, '#16101c'); rect(g, xa, floorY - 13, W, 5, w1); rect(g, xa, floorY - 8, W, 1, '#16101c');     /* picture rail, dado */
  const dining = kind === 'dining', every = kind === 'sleeper' ? 6 : 4;
  for (let tx = b0 + 2; tx < c.x1 - 2; tx += every) { const wx = X(tx * TS + 2); if (dining && tx > 99 && tx < 114) { rect(g, wx, Y(10 * TS + 4), 24, 36, '#80642a'); for (let k = 0; k < 4; k++) rect(g, wx + 1 + k * 6, Y(10 * TS + 5), 5, 34, ['#3a5a9a', '#9a3a6a', '#3a9a7a', '#c8a040'][k]); g.globalAlpha = 0.25; rect(g, wx, Y(11 * TS), 24, 30, '#fff0c4'); g.globalAlpha = 1; } else windowPane(g, wx, topY + 12, 22, 22, time, sp, tx * 31);
    if (kind !== 'van') { rect(g, wx - 4, topY + 8, 3, 30, '#4a2a5a'); rect(g, wx + 24, topY + 8, 3, 30, '#4a2a5a'); rect(g, wx - 4, topY + 8, 3, 1, '#7a4a8a'); } }              /* curtains held back */
  if (kind === 'coach') { seatRow(g, X, Y, b0 + 1, c.x1 - 1, floorY, c.name === 'FIRST CLASS' ? '#7a2a4a' : '#3a3a5a', c.name === 'FIRST CLASS' ? '#5a1a3a' : '#2a2a44'); }
  else if (kind === 'sleeper') { for (let tx = b0 + 1; tx < c.x1 - 1; tx += 9) { const sx = X(tx * TS + 4); rect(g, sx, topY + 2, 3, floorY - topY - 2, '#0c1018'); } rect(g, xa, floorY - 20, W, 1, '#0c1018'); }
  else if (kind === 'van') { const dx = X((c.x0 + 9) * TS); rect(g, dx, floorY - 22, 26, 3, '#46465e'); rect(g, dx + 2, floorY - 19, 3, 17, '#2a2a3a'); rect(g, dx + 21, floorY - 19, 3, 17, '#2a2a3a'); rect(g, dx + 3, floorY - 30, 8, 8, '#d8e0ec'); rect(g, dx + 14, floorY - 27, 6, 5, '#ffd36b');   /* the guard's desk, a ledger, a hand lamp */
    for (let i = 0; i < 3; i++) rect(g, X((c.x0 + 13) * TS) + i * 3, floorY - 8 - i * 3, 12, 8 + i * 3, ['#3a2a2a', '#2a3a3a', '#3a2a4a'][i]); }   /* mailbags and crates against the end wall */
  else if (dining) { for (const tx of [101, 103, 106, 110, 112]) { const sx = X(tx * TS + 8); rect(g, sx - 1, Y(17 * TS + 4), 2, 12, '#46465e'); rect(g, sx - 6, Y(17 * TS + 14), 12, 2, '#46465e'); } }  /* table pedestals */
  /* the roof's own fittings, above the tiles: ventilators and the lamp roses, a gas pipe */
  for (let tx = b0 + 3; tx < c.x1 - 2; tx += 5) { const vx = X(tx * TS + 3); rect(g, vx, roofY - 5, 10, 4, '#2a3648'); rect(g, vx, roofY - 5, 10, 1, '#6a7a96'); rect(g, vx + 2, roofY - 8, 6, 3, '#1c2230'); rect(g, vx + 3, roofY - 9, 4, 1, '#5a6c8e'); }
  rect(g, xa - TS, roofY - 2, 3, 2, '#1c2230');
  if (kind === 'van' && c.body && c.body[0] > c.x0) { const bx = X(c.x0 * TS), bw = (c.body[0] - c.x0) * TS;                                                                 /* the rear balcony: its brass rail and a signal lamp */
    rect(g, bx, floorY - 26, bw, 2, GP.brass); rect(g, bx, floorY - 26, bw, 1, GP.brassL); for (let x = 0; x < bw; x += 6) rect(g, bx + x, floorY - 24, 1, 22, GP.brassD); rect(g, bx + bw - 2, floorY - 60, 2, 36, '#1c1c2a'); rect(g, bx + bw - 6, floorY - 64, 8, 6, '#ff4a2a'); glow(g, bx + bw - 2, floorY - 61, 14, '#ff4a2a', 0.2, 2); }
}
/* the open cars' backs: the well, the coal trucks' tub wall, the tender's tank, the cab and its gauges */
export function drawOpenBack(g, c, X, Y, time, sp, VW) {
  const kind = c.kind, floorY = Y(18 * TS), xa = X(c.x0 * TS), xb = X((c.x1 + 1) * TS); if (xb < -40 || xa > VW + 40) return;
  if (kind === 'well') { for (const tx of [23, 30]) { rect(g, X(tx * TS), floorY, 2, 5 * TS, '#0a0a12'); }                                                                    /* the well wagon: a pit slung between the bogies, its walls riveted iron */
    rect(g, X(23 * TS), floorY, 8 * TS, 4 * TS, '#0c0a14'); for (let k = 0; k < 4; k++) rect(g, X(23 * TS), floorY + k * 16 + 8, 8 * TS, 1, '#1c1a2a'); }
  else if (kind === 'coal') { rect(g, xa + TS, Y(14 * TS), xb - xa - 2 * TS, 4 * TS, '#0e0c14'); for (let k = 0; k < 3; k++) rect(g, xa + TS, Y(14 * TS) + 14 + k * 16, xb - xa - 2 * TS, 1, '#201c2a'); }
  else if (kind === 'tender') { rect(g, xa, Y(10 * TS), xb - xa, 8 * TS, '#1c1c2c'); rect(g, xa, Y(10 * TS), xb - xa, 2, '#686886'); for (let k = 0; k < 7; k++) rect(g, xa + k * 28 + 6, Y(10 * TS) + 3, 1, 8 * TS - 4, '#2a2a40');
    rect(g, xa + 20, Y(10 * TS) - 5, 26, 5, '#46465e'); rect(g, xa + 24, Y(10 * TS) - 8, 18, 3, '#686886'); rect(g, xa + 70, Y(13 * TS), 40, 18, '#80642a'); rect(g, xa + 72, Y(13 * TS) + 2, 36, 14, '#2a1a10'); rect(g, xa + 76, Y(13 * TS) + 6, 28, 2, '#d0aa4a'); }   /* water-tank rivets, a filler lid, a brass number plate */
  else if (kind === 'engine') { const cabx = X(242 * TS), cabw = 8 * TS; rect(g, cabx, Y(11 * TS), cabw, 7 * TS, '#14121c'); rect(g, cabx, Y(11 * TS), cabw, 1, '#2c2c40');
    for (const [gx, gy] of [[18, 22], [44, 18], [70, 26]]) { rect(g, cabx + gx - 8, Y(11 * TS) + gy - 8, 16, 16, '#80642a'); rect(g, cabx + gx - 6, Y(11 * TS) + gy - 6, 12, 12, '#dceaf8'); rect(g, cabx + gx, Y(11 * TS) + gy - 5, 1, 6, '#ff4a2a'); rect(g, cabx + gx - 6, Y(11 * TS) + gy - 6, 12, 1, '#ffffff'); }   /* the pressure gauges */
    for (const px_ of [8, 56, 96]) rect(g, cabx + px_, Y(11 * TS) + 34, 3, 44, '#46465e'); rect(g, cabx + 6, Y(11 * TS) + 66, 90, 3, '#46465e');
    const dx = X(249 * TS - 9), dy = floorY - 20; glow(g, dx - 8, dy, 34, '#ff6a2a', 0.14 + 0.04 * Math.sin(time * 5), 3);                                                      /* the firebox door in the backhead, idle: a low fire behind brass */
    rect(g, dx - 11, dy - 17, 22, 34, '#1a1620'); rect(g, dx - 9, dy - 15, 18, 30, '#8a6a20'); rect(g, dx - 7, dy - 13, 14, 26, '#0a0608'); rect(g, dx - 6, dy - 12, 12, 24, '#4a1208');
    for (let k = 0; k < 4; k++) { const hh = 5 + ((k * 5 + (time * 6 | 0) * 3) % 6); rect(g, dx - 6 + k * 3, dy + 12 - hh, 3, hh, k % 2 ? '#ff9a3c' : '#c0401a'); }
    rect(g, dx - 11, dy - 17, 22, 2, '#e0b840'); rect(g, dx - 11, dy + 15, 22, 2, '#8a6a20'); rect(g, dx + 3, dy - 3, 6, 5, '#46465e'); rect(g, dx + 3, dy - 3, 6, 1, '#8c8caa');
    rect(g, X(238 * TS), Y(10 * TS), 4 * TS, 8 * TS, '#0a0a12'); }
}
/* A WHOLE CAR as a faded shape, rolling away behind a cut */
export function drawCarGhost(g, x0, x1, y, h, a, time) { g.globalAlpha = a; rect(g, x0, y, x1 - x0, h, '#3c3c58'); rect(g, x0, y, x1 - x0, 6, '#8aa0c0'); for (let x = x0 + 12; x < x1 - 20; x += 40) rect(g, x, y + 22, 22, 20, '#10142c'); g.globalAlpha = a * 0.7; rect(g, x0 + 20, y + h - 4, 16, 8, '#2a2a3c'); rect(g, x1 - 36, y + h - 4, 16, 8, '#2a2a3c'); g.globalAlpha = 1; }

/* ================= FITTINGS: couplings, buffers, gangway, points, hatches, props ================= */
export function drawBuffers(g, X, Y, car, VW) {
  const floorY = Y(18 * TS); for (const [ex, dir] of [[car.x0 * TS, -1], [(car.x1 + 1) * TS, 1]]) { const sx = X(ex); if (sx < -20 || sx > VW + 20) continue; const bx = dir < 0 ? sx - 5 : sx + 1;
    rect(g, bx, floorY - 8, 4, 6, '#46465e'); rect(g, dir < 0 ? bx - 2 : bx + 4, floorY - 9, 2, 8, '#8c8caa'); rect(g, dir < 0 ? bx - 2 : bx + 4, floorY - 9, 2, 1, '#cfd0e8'); } }
export function drawCoupling(g, X, Y, cp, time, live) {
  const floorY = Y(18 * TS), gx0 = X(cp.g0 * TS), gw = (cp.g1 - cp.g0 + 1) * TS;
  rect(g, gx0, floorY - 38, 1, 36, '#14121c'); rect(g, gx0 + gw - 1, floorY - 38, 1, 36, '#14121c');                                             /* the gangway's bellows: black leather folds */
  for (let k = 0; k < 6; k++) { rect(g, gx0 + 1, floorY - 36 + k * 6, gw - 2, 2, k % 2 ? '#1e1a28' : '#2c2638'); }
  for (let x = gx0 + 3; x < gx0 + gw - 6; x += 5) rect(g, x, floorY + 3 + (x & 1), 3, 2, '#7a7a96');                                               /* the chain's links, slung low */
  rect(g, gx0 + 2, floorY + 5, gw - 4, 2, '#5a5a76'); rect(g, gx0 + gw / 2 - 3, floorY + 4, 6, 5, '#46465e');
  const px_ = X(cp.pinX), py = Y(cp.pinY);                                                                                                     /* THE PIN: a brass pin with a ring head, glinting so it reads as the thing to strike */
  rect(g, px_ - 1, py - 4, 3, 12, cp.arena ? '#8c8caa' : GP.brass); rect(g, px_ - 1, py - 4, 1, 12, cp.arena ? '#cfd0e8' : GP.brassL); rect(g, px_ - 3, py - 8, 7, 2, GP.brassD); rect(g, px_ - 2, py - 10, 5, 2, cp.arena ? '#8c8caa' : GP.brass); rect(g, px_ - 1, py - 10, 3, 1, '#14121c');
  if (live && !cp.arena && (time * 3) % 1 < 0.4) rect(g, px_ + 2, py - 9, 1, 1, '#ffffff');
}
export function drawPoints(g, p, X, Y, time) {
  const px_ = X(p.x), py = Y(p.y), br = p.set === 'branch', lean = br ? 6 : -6;
  rect(g, px_ - 6, py - 4, 12, 4, '#2a2a3c'); rect(g, px_ - 6, py - 4, 12, 1, '#8c8caa'); rect(g, px_ - 1, py - 22, 3, 18, '#46465e');                           /* a ground frame and the stand */
  for (let k = 0; k < 14; k++) rect(g, px_ + Math.round(lean * k / 14), py - 4 - k, 2, 1, GP.brass);                                                  /* the lever, thrown one way */
  disc(g, px_ + lean, py - 19, 3, '#a8321c'); rect(g, px_ + lean - 1, py - 21, 1, 1, '#ff9a8a');                                                    /* the weighted ball */
  const col = br ? '#7ee87a' : '#ff5a3a'; rect(g, px_ + 6, py - 32, 2, 12, '#46465e'); rect(g, px_ + 2, py - 40, 10, 8, '#14121c'); rect(g, px_ + 3, py - 39, 8, 6, col); glow(g, px_ + 7, py - 36, 12, col, 0.25, 2);   /* the target lamp: red STRAIGHT, green BRANCH */
  rect(g, px_ - 20, py - 2, 14, 1, '#6a6a86'); rect(g, px_ + 6, py - 2, 14, 1, '#6a6a86');
}
export function drawHatch(g, x0, x1, X, Y) { const sx = X(x0 * TS), w = (x1 - x0 + 1) * TS, ry = Y(12 * TS); rect(g, sx - 2, ry - 4, w + 4, 4, '#46465e'); rect(g, sx - 2, ry - 4, w + 4, 1, '#8c8caa'); rect(g, sx, ry, w, 16, '#06081a'); for (let y = ry + 2; y < ry + 16; y += 4) rect(g, sx + w / 2 - 5, y, 10, 1, '#80642a'); rect(g, sx + w / 2 - 5, ry, 1, 16, '#80642a'); rect(g, sx + w / 2 + 4, ry, 1, 16, '#80642a'); }
export function drawProp(g, pr, X, Y, time) {
  const wellY = Y(21 * TS);
  if (pr.kind === 'facade') {                                                                                                                 /* THE RIDE'S PAINTED FACADE: a gabled plum front, a skull above its black door, bulbs on every cornice, pennants */
    const fx = X(pr.x * TS - 36), fw = 7 * TS, top = Y(5 * TS), bot = wellY + 2;
    rect(g, fx, top + 16, fw, bot - top - 16, '#2e1a3a'); rect(g, fx, top + 16, fw, 2, GP.brass); for (let k = 0; k < 7; k++) rect(g, fx + k * 16, top + 18, 1, bot - top - 18, '#3e2650');
    for (let k = 0; k < 8; k++) rect(g, fx + 2 + k * 14, top + 8 - Math.min(k, 7 - k) * 2, 12, 12 + Math.min(k, 7 - k) * 2, k % 2 ? '#6a2a4a' : '#8a3a5a'); rect(g, fx, top + 20, fw, 1, GP.brassD);   /* the scalloped valance */
    const sx = fx + fw / 2; rect(g, sx - 10, top + 30, 20, 20, '#dce4f2'); rect(g, sx - 12, top + 34, 24, 12, '#dce4f2'); rect(g, sx - 7, top + 36, 5, 6, '#0a0612'); rect(g, sx + 3, top + 36, 5, 6, '#0a0612'); rect(g, sx - 2, top + 44, 4, 3, '#0a0612'); for (let k = -6; k <= 6; k += 3) rect(g, sx + k, top + 50, 2, 4, '#dce4f2');
    const ey = (time * 3 | 0) % 7 === 0; if (!ey) { glow(g, sx - 5, top + 39, 9, '#ff3a3a', 0.35, 2); glow(g, sx + 5, top + 39, 9, '#ff3a3a', 0.35, 2); rect(g, sx - 6, top + 38, 2, 2, '#ff6a6a'); rect(g, sx + 4, top + 38, 2, 2, '#ff6a6a'); }
    rect(g, sx - 14, bot - 44, 28, 44, '#0a0612'); rect(g, sx - 12, bot - 54, 24, 10, '#0a0612'); rect(g, sx - 14, bot - 44, 1, 44, GP.brassD); rect(g, sx + 13, bot - 44, 1, 44, GP.brassD);                   /* the dark doorway */
    for (let k = 0; k < 14; k++) { const bx = fx + 4 + k * 8, by = top + 66 + Math.sin(k) * 0; if (by < bot - 10) rect(g, bx, top + 62, 2, 2, (k + (time * 4 | 0)) % 3 ? '#fff0c4' : '#3a3444'); }
    for (const dx of [8, fw - 12]) { rect(g, fx + dx, top - 12, 1, 28, '#46465e'); rect(g, fx + dx + 1, top - 12, 10, 6, '#a8321c'); rect(g, fx + dx + 1, top - 6, 7, 3, '#7a2418'); } }
  else if (pr.kind === 'ridecar') {                                                                                                           /* a ride car: a low plum coach with a skull bumper and bulbs, empty, waiting */
    const rx = X(pr.x * TS - 12), ry = wellY - 2; rect(g, rx, ry - 14, 28, 12, '#6a2a4a'); rect(g, rx, ry - 14, 28, 2, GP.brass); rect(g, rx + 2, ry - 20, 12, 7, '#4a1a38'); rect(g, rx + 3, ry - 19, 10, 2, '#7a3a5a');
    rect(g, rx + 22, ry - 12, 8, 10, '#dce4f2'); rect(g, rx + 24, ry - 10, 2, 3, '#0a0612'); rect(g, rx + 27, ry - 10, 2, 3, '#0a0612'); rect(g, rx - 3, ry - 6, 4, 4, '#46465e');
    disc(g, rx + 6, ry, 3, '#1a1a28'); disc(g, rx + 22, ry, 3, '#1a1a28'); rect(g, rx + 5, ry - 17, 2, 2, '#fff0c4'); rect(g, rx + 9, ry - 17, 2, 2, '#fff0c4'); }
}

/* ================= THE MOTION'S TELLS ================= */
/* the tunnel: its mouth (a brick arch face on the leading edge, black inside) over the span a..b (screen px), lintel at lintelY; the train's roof is at roofY */
export function drawTunnel(g, a, b, lintelY, VH, time, heading = -1) {
  g.globalAlpha = 0.5; rect(g, a, lintelY + 6, b - a, VH - lintelY - 6, '#04040a'); g.globalAlpha = 1;   /* (the black behind the cars is drawn by the hands' back pass; here only a dimming over what is in the tunnel) */
  for (let y = 0; y < lintelY + 6; y += 6) for (let x = a - (y / 6 & 1) * 6; x < b; x += 12) { const k = hash(x >> 2, y), c2 = ['#2a2230', '#342a3a', '#241c2a', '#3c3042'][k % 4]; rect(g, Math.max(a, x), y, Math.min(11, b - Math.max(a, x)), 5, c2); }   /* the brick wall hanging down over the roofs */
  rect(g, a, lintelY, b - a, 6, '#16121c'); rect(g, a, lintelY + 4, b - a, 2, '#5a4a62'); rect(g, a, lintelY, b - a, 1, '#6a5a72');
  for (let x = a + 8; x < b - 8; x += 28) rect(g, x, lintelY + 6, 1, 6 + hash(x, 1) % 5, '#7ab0c0');                                                                // damp drips along the lintel
  rect(g, a, 0, 3, lintelY + 6, '#7a6a82'); rect(g, b - 3, 0, 3, lintelY + 6, '#7a6a82');                                                                            /* the voussoir edges lit */
  for (let i = 0; i < 5; i++) { const sx = a + ((hash(i, 8) + R(time * 160)) % Math.max(10, b - a)); rect(g, sx, lintelY + 14 + hash(i, 4) % 40, 14, 1, 'rgba(200,210,230,0.18)'); }   /* smoke and wind streaks inside */
}
export function drawBridge(g, a, w, y, time) {                                                                                                  /* a low iron girder bridge, riveted truss, a pale lamp on it */
  const x = R(a), ww = Math.max(24, R(w)), top = y;
  rect(g, x, top, ww, 3, '#46465e'); rect(g, x, top, ww, 1, '#9a9ab8'); rect(g, x, top + 11, ww, 3, '#34344a'); rect(g, x, top + 13, ww, 1, '#14121c');
  for (let k = 0; k < ww; k += 12) { for (let j = 0; j < 8; j++) { rect(g, x + k + j, top + 3 + j, 2, 1, '#2e2e42'); rect(g, x + k + 12 - j, top + 3 + j, 2, 1, '#2e2e42'); } rect(g, x + k, top + 3, 2, 8, '#46465e'); rect(g, x + k, top + 4, 1, 1, '#cfd0e8'); }
  rect(g, x - 3, top - 12, 5, 26, '#34344a'); rect(g, x + ww - 2, top - 12, 5, 26, '#34344a'); rect(g, x - 3, top - 12, 5, 1, '#8c8caa'); rect(g, x + ww - 2, top - 12, 5, 1, '#8c8caa');
  rect(g, x + ww / 2 - 2, top + 14, 5, 4, '#fff0c4'); glow(g, x + ww / 2, top + 16, 12, '#fff0c4', 0.2, 2);
}
export function warnSignal(g, VW, VH, k, time, kind) {                                                                                       /* the told tunnel/bridge: red edge, chevrons, a signal lamp at the top right */
  const on = (time * 8) % 2 < 1; rect(g, VW - 10, 0, 10, VH, 'rgba(255,90,60,' + (0.14 + 0.32 * Math.max(0, k)).toFixed(2) + ')');
  for (let i = 0; i < 3; i++) { const cx = VW - 28 - i * 10 - ((time * 40) % 10), cy = 40; if (cx < VW - 70 || cx > VW - 14) continue; for (let j = 0; j < 7; j++) { rect(g, cx + Math.abs(j - 3), cy - 3 + j, 2, 1, on ? '#ff5a3a' : '#ff9a5c'); } }
  rect(g, VW - 18, 8, 3, 26, '#2a2a3c'); rect(g, VW - 26, 4, 18, 10, '#14121c'); rect(g, VW - 24, 6, 6, 6, on ? '#ff3a2a' : '#5a1a14'); rect(g, VW - 16, 6, 6, 6, on ? '#5a1a14' : '#ff3a2a'); if (on) glow(g, VW - 21, 9, 12, '#ff3a2a', 0.25, 2);
}
export function gustStreaks(g, VW, y0, y1, time, a = 0.5) { for (let i = 0; i < 16; i++) { const h = hash(i, 11), y = y0 + h % Math.max(10, y1 - y0), sp = 500 + (h % 200), x = VW - ((time * sp + h) % (VW + 160)) + 80; g.globalAlpha = a * (0.4 + (h % 4) / 8); rect(g, x, y, 30 + h % 40, 1, '#dce4f2'); } g.globalAlpha = 1; }
export function darkSpan(g, x, y, w, h, a) { g.globalAlpha = a; rect(g, x, y, w, h, '#04040e'); g.globalAlpha = 1; }

/* ================= THE STACK: sparks, embers, smoke ================= */
export function drawEmberMark(g, mx, my, k, hot, tell, time) {
  if (!hot) { const kk = clamp(1 - Math.max(0, k - 0.3) / tell, 0, 1); rect(g, mx - 7, my - 1, 14, 2, 'rgba(255,90,60,' + (0.3 + 0.5 * kk).toFixed(2) + ')'); rect(g, mx - 5, my - 2, 10, 1, 'rgba(255,200,120,' + (0.2 + 0.4 * kk).toFixed(2) + ')');
    const ey = my - 44 + 38 * kk; rect(g, mx - 1, ey, 3, 3, '#ffd36b'); rect(g, mx, ey - 3, 1, 3, 'rgba(255,154,60,0.7)'); rect(g, mx - 1, ey + 3, 1, 2, 'rgba(255,90,40,0.5)'); }
  else { glow(g, mx, my - 3, 11, '#ff9a3c', 0.35, 2); rect(g, mx - 4, my - 6, 8, 6, '#ff9a3c'); rect(g, mx - 2, my - 5, 4, 4, '#ffe08a'); rect(g, mx - 1, my - 4, 2, 2, '#ffffff'); }
}
export function stackSmoke(g, sx, sy, time) { for (let i = 0; i < 6; i++) { const t = (time * 0.7 + i / 6) % 1, x = sx - t * 150, y = sy - t * 30 - 6; g.globalAlpha = 0.45 * (1 - t); rect(g, x, y, 10 + t * 22, 8 + t * 14, '#8a8aa4'); g.globalAlpha = 0.25 * (1 - t); rect(g, x + 2, y + 2, 6 + t * 14, 4 + t * 8, '#cfd0e8'); } g.globalAlpha = 1; }
