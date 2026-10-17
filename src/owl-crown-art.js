// src/owl-crown-art.js - THE OWL REEVE 3's ART PASS (claude/owl3art, Daniel 10-15): the drawing that went with her wing beat, her pellets and her lamps, in
// one place so main.js only calls it. DRAW ONLY: nothing here reads or writes a number the fight uses (the only state is the pellet scuffs, a cosmetic list).
//   drawDrops(g, A, cx, cy, time, TS, warn)   THE DROP's two breaks in the crown boards: the void with the village far below, the broken planks, the rope ends
//   drawWind(g, o)                            the wing beat's wind: needles, leaves and dust on the air, the drops' lips taking it
//   drawMark / drawPellet / drawBurst         the bone pellet: the talon-scored mark on the boards, the pellet in the air, the burst and what it leaves
//   lampFx(g, px, py, time, o)                the floor lamp's gutter (tongue, sparks) and its smoking wick (the ember and the rising smoke)
const R = Math.round;
const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), w, h); };

/* ---------- THE DROP ---------- */
const EARTH = ['#2c1a10', '#4a2f1c', '#6a4a2e', '#8a6640'], PLANK = { top: '#d6ae72', mid: '#9a7444', low: '#33210f', nail: '#d9d4c2' };
function plank(g, x, y, len, dir, thick, seed) {   /* a board's broken end jutting out over the void: dir +1 grows to the right, -1 to the left; the tip is splintered */
  for (let i = 0; i < len; i++) { const xx = dir > 0 ? x + i : x - i - 1, tooth = i >= len - 5 ? (hh(seed + i) < 0.6 ? 1 + ((i - len + 5) >> 1) : 0) : 0, th = thick - tooth;
    if (th <= 0) continue; rect(g, PLANK.top, xx, y, 1, 1); if (th > 1) rect(g, PLANK.mid, xx, y + 1, 1, th - 1); if (th > 2) rect(g, PLANK.low, xx, y + th - 1, 1, 1); }
  rect(g, PLANK.nail, dir > 0 ? x + 2 : x - 3, y + 1, 1, 1);   /* the nail that held it */
}
function rope(g, x, y, len, sway, seed) {   /* a hemp rope's cut end: twisted, hanging, the last of it frayed to three loose strands */
  for (let j = 0; j < len; j++) { const xx = x + Math.round(sway * (j / len) * (j / len)); rect(g, '#2a1c0c', xx - 1, y + j, 1, 1); rect(g, (j >> 1) & 1 ? '#e0c68a' : '#9a7e48', xx, y + j, 2, 1); rect(g, '#2a1c0c', xx + 2, y + j, 1, 1); }
  const ex = x + Math.round(sway), ey = y + len;
  rect(g, '#e0c68a', ex - 1, ey, 1, 4); rect(g, '#9a7e48', ex + 1, ey, 1, 3); rect(g, '#f0dca0', ex + 2, ey, 1, 5); rect(g, '#9a7e48', ex, ey + 4, 1, 1);
}
export function drawDrops(g, A, cx, cy, time, TS, warn) {
  if (!A || !A.drops) return;
  const VW = g.canvas.width, VH = g.canvas.height;
  A.drops.forEach(([t0, t1], di) => {
    const X0 = t0 * TS - cx, W = (t1 - t0 + 1) * TS, Y0 = A.floor - cy, H = 4 * TS;
    if (X0 > VW + 8 || X0 + W < -8 || Y0 > VH || Y0 + H + 60 < 0) return;
    const ox = R(X0), oy = R(Y0);
    /* THE VOID: the night under the crown, the sky at the top of it going down to black, and a shaft of dark running on below the boards */
    g.save(); g.beginPath(); g.rect(ox, oy, W, H); g.clip();
    const gr = g.createLinearGradient(0, oy, 0, oy + H); gr.addColorStop(0, '#3c2c5a'); gr.addColorStop(0.5, '#1c1436'); gr.addColorStop(1, '#0c0818');
    g.fillStyle = gr; g.fillRect(ox, oy, W, H);
    /* THE VILLAGE FAR BELOW: a haze band, a few roofs, and the pin-lights of its windows and lantern strings, drifting a little as you move (it is far) */
    const par = (cx * 0.12 + di * 37) % 80;
    g.globalAlpha = 0.6; rect(g, '#5a4478', ox, oy + H - 14, W, 14); g.globalAlpha = 0.4; rect(g, '#7a6498', ox, oy + H - 8, W, 8); g.globalAlpha = 1;
    { const sh = Math.round(Math.sin(cx * 0.02 + di) * 2); [[2, 8], [12, 6], [20, 9], [31, 7], [40, 6]].forEach(([hx, hw], i) => { const x = ox + hx + sh, base = oy + H - 1, bh = 4 + (i % 2), ph = (hw + 2) >> 1;
      rect(g, '#150e28', x, base - bh, hw, bh); for (let r = 0; r < ph; r++) rect(g, '#150e28', x - 1 + r, base - bh - 1 - r, hw + 2 - 2 * r, 1);
      if (i !== 3) rect(g, '#ffd36b', x + 2, base - bh + 1, 1, 1); if (i % 2 === 0) rect(g, '#ffb070', x + hw - 3, base - bh + 2, 1, 1); });
      g.globalAlpha = 0.5; rect(g, '#7a6498', ox, oy + H - 3, W, 3); g.globalAlpha = 1; }
    for (let i = 0; i < 11; i++) { const lx = ox + ((i * 23 + 5 - par * 1.4 + 240) % 60) - 6, ly = oy + H - 20 + ((i * 7) % 16), tw = 0.55 + 0.45 * Math.sin(time * (1.5 + (i % 3) * 0.7) + i * 2.1);
      g.globalAlpha = 0.95 * tw; rect(g, i % 3 ? '#ffd36b' : '#ffb070', lx, ly, 1, 1); g.globalAlpha = 1; }
    /* the updraft: pale motes climbing out of the dark */
    for (let i = 0; i < 6; i++) { const u = (time * 0.35 + i / 6 + di * 0.13) % 1; g.globalAlpha = 0.3 * Math.sin(u * Math.PI); rect(g, '#cdbfe0', ox + 4 + ((i * 29) % (W - 8)) + Math.sin(u * 9 + i) * 2, oy + H - u * (H - 4), 1, 1); } g.globalAlpha = 1;
    /* the broken earth's two jagged walls, the way the boards tore */
    for (let j = 0; j < H; j += 1) { const a = 2 + Math.floor(hh(j * 3.1 + di) * 4) + (j % 9 < 2 ? 1 : 0), b = 2 + Math.floor(hh(j * 5.3 + di + 9) * 4) + (j % 7 < 2 ? 1 : 0);
      const shade = j < 4 ? 3 : j % 6 === 0 ? 1 : 2; rect(g, EARTH[shade], ox, oy + j, a, 1); rect(g, EARTH[0], ox + a, oy + j, 1, 1); rect(g, EARTH[shade === 3 ? 2 : shade], ox + W - b, oy + j, b, 1); rect(g, EARTH[0], ox + W - b - 1, oy + j, 1, 1); }
    g.restore();
    /* THE SHAFT: the dark goes on under the boards, thinning, so the break is deep and not a notch (the village's own lamps stay under it) */
    const sg = g.createLinearGradient(0, oy + H, 0, oy + H + 56); sg.addColorStop(0, 'rgba(5,3,12,0.62)'); sg.addColorStop(1, 'rgba(5,3,12,0)'); g.fillStyle = sg; g.fillRect(ox + 3, oy + H, W - 6, 56);
    /* ROOTS and rope under the lips: the boards were lashed to something */
    for (const [rx, rl] of [[ox + 5, 11], [ox + 9, 7], [ox + W - 7, 13], [ox + W - 11, 6]]) { for (let j = 0; j < rl; j++) rect(g, j % 3 ? '#2c1a10' : '#4a2f1c', rx + (j > 6 ? 1 : 0), oy + H - 3 + j, 1, 1); }
    /* THE BOARDS' BROKEN ENDS: planks that stood out past the earth, splintered at the tips, one hanging from its nail */
    const sw = Math.sin(time * 1.7 + di * 2) * 1.6;
    plank(g, ox, oy, 15, 1, 6, 11 + di); plank(g, ox, oy + 7, 8, 1, 4, 21 + di);
    plank(g, ox + W, oy, 16, -1, 6, 31 + di); plank(g, ox + W, oy + 7, 7, -1, 4, 41 + di);
    for (let j = 0; j < 15; j++) { const xx = ox + 3 + Math.round(sw * (j / 15)), w = j > 11 && hh(j + di) < 0.6 ? 2 : 3; rect(g, j % 4 === 3 ? PLANK.low : PLANK.mid, xx, oy + 10 + j, w, 1); rect(g, PLANK.top, xx, oy + 10 + j, 1, 1); }   /* hangs by one nail from the left lip */
    rect(g, PLANK.nail, ox + 3, oy + 9, 1, 1);
    rope(g, ox + 17, oy + 5, 21, sw * 2, 5 + di); rope(g, ox + W - 20, oy + 5, 14, -sw * 1.5, 9 + di);
    /* THE CHALK: the village's own warning, three ticks on the boards short of each lip - and when the wing beat is on them they burn */
    const ch = 0.45 + 0.4 * warn * (0.5 + 0.5 * Math.sin(time * 14));
    for (let k = 0; k < 3; k++) { g.globalAlpha = ch; rect(g, warn > 0 ? '#ffb070' : '#e8dcc0', ox - 6 - k * 4, oy + 1, 2, 3); rect(g, warn > 0 ? '#ffb070' : '#e8dcc0', ox + W + 4 + k * 4, oy + 1, 2, 3); } g.globalAlpha = 1;
  });
}

/* ---------- THE WING BEAT'S WIND ---------- */
/* o: { e, A, cx, cy, time, tell, k, d, xa, xb, reach, TS, text } - the owl, the arena, the camera, the windup's progress k (0..1; 1 in the gust), her side, the span it runs, how far it has reached */
export function drawWind(g, o) {
  const { e, A, cx, cy, time, tell, k, d, xa, reach, TS } = o, fl = A.floor, n = tell ? 14 + R(34 * k) : 80;
  /* the gather: curved pale strokes sweeping off her wings the way she will blow */
  if (tell) for (let i = 0; i < 6; i++) { const u = (time * 1.6 + i / 6) % 1, sx = R(e.x - cx) - d * (6 + u * 26), sy = R(e.y - cy) - 24 + i * 7 - u * 5; g.globalAlpha = (1 - u) * (0.2 + 0.5 * k); rect(g, '#d6e0e6', sx, sy, 5 + R(5 * k), 1); } g.globalAlpha = 1;
  for (let i = 0; i < n; i++) {
    const sp = tell ? 70 + (i * 29) % 70 : 290 + (i * 37) % 170, yy = fl - 2 - (i * 53) % 88 - Math.sin(time * 3 + i) * 2, t = ((i * 97 + time * sp) % (reach + 30)), x = R(xa + d * t - cx), y = R(yy - cy), kind = i % 7;
    g.globalAlpha = (tell ? 0.3 + 0.5 * k : 0.85) * (t > reach ? 0 : 1);
    if (kind < 3) { /* a needle: the dead pine's, a pale tip and a dark body, tilted with the blow */ const dy = (i % 3) - 1; rect(g, '#4d5a2e', x, y, 4 * d, 1); rect(g, '#a9b57a', x + 4 * d, y + (dy > 0 ? 0 : 0), 1, 1); if (dy) rect(g, '#4d5a2e', x + 2 * d, y + dy, 2 * d, 1); }
    else if (kind < 5) { /* a leaf, turning */ const f = Math.floor(time * 11 + i) & 1; rect(g, i % 2 ? '#b0622e' : '#d79a42', x, y, f ? 3 : 2, f ? 2 : 3); rect(g, '#6e3f1e', x + (f ? 2 : 0), y + (f ? 0 : 2), 1, 1); }
    else if (kind === 5) rect(g, '#e8dcc0', x - (d > 0 ? 8 : 0), y, 8 + (i % 5), 1);   /* a streak of dust */
    else { rect(g, '#cdbfa0', x, y, 2, 1); rect(g, '#8a7a5a', x + d, y + 1, 1, 1); }   /* grit, low */
  }
  g.globalAlpha = 1;
  /* THE LIPS: the drop it blows toward takes the debris over its edge - a fall of needles and leaves into the dark - and its chalk burns (drawDrops) */
  if (A.drops) for (const [x0, x1] of A.drops) if (((x0 * TS - e.x) * d > 0) || tell) { const lipX = d > 0 ? x0 * TS : (x1 + 1) * TS; if ((lipX - e.x) * d <= 0) continue;
    const xs = R(lipX - cx), y = R(fl - cy), q = tell ? 0.4 + 0.6 * k : 1;
    for (let i = 0; i < 9; i++) { const u = (time * (1.1 + (i % 3) * 0.3) + i * 0.37) % 1, px = xs + d * (u * 22) , py = y + u * u * 34 - 3 + (i % 3);
      g.globalAlpha = (1 - u) * 0.9 * q; rect(g, i % 3 ? (i % 2 ? '#d79a42' : '#a9b57a') : '#e8dcc0', px, py, i % 3 ? 2 : 1, i % 3 ? 1 : 2); } g.globalAlpha = 1;
    const xm = R(((x0 + x1 + 1) * TS / 2) - cx); if (o.text) o.text('THE DROP', xm, y - 22, '#ff9a5c', 'center', 6); }
}

/* ---------- THE BONE PELLET ---------- */
export function drawMark(g, x, y, r, time, i, urge, rot) {   /* the mark on the boards: soot, a ring of talon scratches turning faster as it comes, and the pellet's own outline */
  const k = 0.5 + 0.5 * Math.sin(time * (12 + 10 * urge) + i);
  g.globalAlpha = 0.34 + 0.2 * k; g.fillStyle = '#240a0c'; g.beginPath(); g.ellipse(x, y, r, 3, 0, 0, 7); g.fill();
  g.globalAlpha = 0.5 + 0.4 * k; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, r, 3.5, 0, 0, 7); g.stroke();
  const n = 8, ph = rot * 2.4; g.fillStyle = '#ffb0a0';
  for (let a = 0; a < n; a++) { const th = ph + a * Math.PI * 2 / n; rect(g, '#ffb0a0', x + Math.cos(th) * (r - 3), y + Math.sin(th) * 2.2 - 1, 3, 1); }   /* the scratches: three px dashes riding the ring */
  g.globalAlpha = 0.6 + 0.4 * k; rect(g, '#ff6b6b', x - 4, y, 9, 1); rect(g, '#ff6b6b', x, y - 3, 1, 7);
  rect(g, '#e8e0cc', x - 2, y - 1, 5, 3); rect(g, '#a8997a', x - 1, y, 3, 1); g.globalAlpha = 1;   /* the bone-white pellet laid out where it will fall */
}
export function drawPellet(g, x, y, time, k, fl, cyOff) {   /* the pellet in the air: tumbling, with a fading trail and its shadow on the boards */
  const sh = 0.2 + 0.4 * k; g.globalAlpha = sh; g.fillStyle = '#05030c'; g.beginPath(); g.ellipse(x, fl - 1, 3 + 3 * k, 1.2, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  const f = Math.floor(time * 14) & 1;
  rect(g, '#3a3026', x - 3, y - 2 + (f ? 0 : 1), 7, 5 - (f ? 0 : 1)); rect(g, '#e8e0cc', x - 2, y - 1 + (f ? 0 : 1), 5, 3); rect(g, '#a8997a', x - 2 + f, y + (f ? 0 : 1), 2, 1);
  rect(g, '#fffbea', f ? x + 3 : x - 4, y - 3 + f, 1, 2); rect(g, '#fffbea', f ? x - 4 : x + 3, y + 2, 1, 1);   /* two splinters of bone sticking out */
}
export function drawPelletTrail(g, pts) { pts.forEach(([x, y], i) => { g.globalAlpha = 0.35 - i * 0.1; rect(g, '#cfc3a6', x - 1, y - 1, 2, 2); }); g.globalAlpha = 1; }
const burstAt = new WeakMap(), scuffs = [];
export function drawBurst(g, p, x, fl, cx, cy, time) {   /* a pellet landing: the ring, the splinters, the dust, and (kept on the boards a while) the powder and the shards left in them */
  let t0 = burstAt.get(p); if (t0 === undefined || time < t0) { t0 = time; burstAt.set(p, t0); scuffs.push({ x, t0 }); } const u = time - t0, sx = R(x - cx), y = R(fl - cy) - 1;
  if (u > 0.5) return;
  const q = u / 0.5; g.globalAlpha = (1 - q) * 0.8; g.strokeStyle = '#e8e0cc'; g.lineWidth = 1; g.beginPath(); g.ellipse(sx, y, 6 + q * 20, 1.5 + q * 3, 0, 0, 7); g.stroke();
  g.globalAlpha = (1 - q) * 0.35; g.fillStyle = '#cfc3a6'; g.beginPath(); g.ellipse(sx, y - 2 - q * 4, 5 + q * 8, 3 + q * 5, 0, 0, 7); g.fill();
  for (let i = 0; i < 9; i++) { const a = -0.15 - i * 0.33, v = 40 + (i * 13) % 34, px = sx + Math.cos(a) * v * u * (i % 2 ? 1 : -1), py = y - 1 + Math.sin(a) * v * 1.2 * u + 120 * u * u; g.globalAlpha = 1 - q; rect(g, i % 3 ? '#e8e0cc' : '#a8997a', px, py, (i % 3) ? 1 : 2, (i % 3) ? 2 : 1); }
  g.globalAlpha = 1;
}
export function drawScuffs(g, fl, cx, cy, time) {   /* what the pellets left on the boards */
  for (let i = scuffs.length - 1; i >= 0; i--) { const s = scuffs[i], u = time - s.t0; if (u < 0 || u > 2.4) { scuffs.splice(i, 1); continue; }
    const x = R(s.x - cx), y = R(fl - cy) - 1, f = u < 1.4 ? 1 : 1 - (u - 1.4);
    g.globalAlpha = 0.4 * f; g.fillStyle = '#cfc3a6'; g.beginPath(); g.ellipse(x, y, 11, 1.8, 0, 0, 7); g.fill(); g.globalAlpha = f;
    for (let k = 0; k < 4; k++) rect(g, k % 2 ? '#e8e0cc' : '#a8997a', x - 7 + k * 5, y - 2 - (k % 2), 1, 2 + (k % 2));   /* shards stood in the boards */
    g.globalAlpha = 1; }
}

/* ---------- THE LAMP ---------- */
export function lampFx(g, px, py, time, o) {   /* (px, py): the lamp's glass, screen coords. o: { lit, gut (the last of its burn, 0..1 left), cool (s left smoking), coolMax } */
  if (o.lit && o.gut !== undefined && o.gut < 1) { /* THE GUTTER: the flame jumps and sinks, throwing sparks, the oil spitting - ever lower as it goes */
    const low = Math.max(0.15, o.gut), j = Math.floor(time * 30) % 5, hgt = Math.max(1, R((1 + j % 3 + (j === 4 ? 2 : 0)) * low * 2));
    rect(g, '#ffd36b', px - 1, py - hgt, 2, hgt); rect(g, '#fff6c8', px, py - hgt, 1, Math.max(1, hgt - 1));
    for (let i = 0; i < 3; i++) { const u = (time * 2.6 + i / 3) % 1; g.globalAlpha = (1 - u) * 0.9; rect(g, i % 2 ? '#ffb040' : '#fff2c0', px + Math.sin(u * 8 + i * 2) * (3 + i), py - 5 - u * 13, 1, 1); } g.globalAlpha = 1; }
  if (!o.lit && o.cool > 0) { /* THE SMOKING WICK: a dull ember on the black wick, and the smoke going up from it, thinning as the wick cools */
    const c = Math.max(0, Math.min(1, o.cool / (o.coolMax || 2.5))), e = 0.5 + 0.5 * Math.sin(time * 9);
    g.globalAlpha = 0.25 + 0.6 * c * e; rect(g, '#ff6a2a', px - 1, py - 1, 2, 2); g.globalAlpha = 0.9 * c; rect(g, '#ffb070', px, py - 1, 1, 1);
    for (let i = 0; i < 7; i++) { const u = (time * 0.6 + i / 7) % 1, sz = u < 0.3 ? 1 : u < 0.65 ? 2 : 3, x = px + Math.sin(u * 7 + i * 1.7) * (2 + u * 3) + u * 3, y = py - 6 - u * 30;
      g.globalAlpha = Math.min(0.95, (1 - u) * 1.1 * (0.45 + c)); rect(g, '#2a2234', x - (sz >> 1) - 1, y - 1, sz + 2, sz + 2); rect(g, u < 0.5 ? '#cfc6d8' : '#9a90a6', x - (sz >> 1), y, sz, sz); } g.globalAlpha = 1; }
}
