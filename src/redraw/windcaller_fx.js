// windcaller_fx.js - THE WINDCALLER 4 ART PASS (claude/windcaller4art): everything drawn on his summit and the Gale Stair that is not a tile.
// DRAW ONLY. Nothing here reads or writes a game number: the callers pass what is on screen (a position, a clock, a flag) and get pixels.
//   drawAttacks(g, e, cx, cy, time, K)  his hurl's wall of wind, the dust devil, the downdraft ring and column, the gale blades, the HIGH/LOW plaques over his head
//   drawPit(g, A, cx, cy, time)         the summit's pit: a dark throat, the wind rising out of it, wisps over the rim
//   drawGaleVent(g, pr, cx, cy, time)   the stone vent of a gale updraft (the stair's two and the summit's two): sill, mouth, the column of air, the lifted dust
//   drawFlag(g, pr, cx, cy, time, on, wd, tl)  a stone-cairn flagpole with a bone staff and a ragged red banner that the told gust lifts
//   drawTorPost(g, p, cx, cy, L)        a wind-carved stone pillar under a summit ledge (the east ledge's break off when it falls)
//   drawRoostChime(g, x, y, time, lit)  a bone chime hung under a ledge where he stands
const R = Math.round;
const GR = { g0: '#1a1d26', g1: '#2e333f', g2: '#555c6b', g3: '#6e7686', g4: '#8d96a7', g5: '#a3abb9', q: '#d4dae4', lichen: '#9aa44a', lichenD: '#6e7a34', moss: '#4a6a3a', bone: '#d8d2bc', boneD: '#a89c80', red: '#c9463d', redD: '#7a2a24' };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };

/* ---------------------------------------------------------------- HIS ATTACKS */
export function drawAttacks(g, e, cx, cy, time, K) {
  const W = e.wc; if (!W) return; const fl = K.fl;
  for (const h of W.hurls) { const x = h.x - cx, d = h.dir, H = K.hurlH;   /* THE GUST HURL: a bowed wall of wind, streaks trailing, dust and grit kicked up along the floor behind it */
    for (let r = 0; r < H; r++) { const bow = Math.round(Math.sin((r + 1) / (H + 1) * Math.PI) * 5); g.globalAlpha = 0.55; g.fillStyle = '#eef6f8'; g.fillRect(R(x + d * bow - (d < 0 ? 1 : 0)), fl - 1 - r, 2, 1); g.globalAlpha = 0.22; g.fillStyle = '#bfe6f5'; g.fillRect(R(x + d * bow - d * 3 - (d < 0 ? 4 : 0)), fl - 1 - r, 4, 1); }
    for (let k = 0; k < 16; k++) { const len = 8 + (k * 7) % 20, yy = fl - 2 - (k * 5) % (H - 2), back = 4 + ((k * 13 + time * 260) % 34); g.globalAlpha = Math.max(0.1, 0.7 - back / 50); g.fillStyle = k % 3 ? '#eef6f8' : '#d8cfb8'; g.fillRect(R(x - d * back - (d > 0 ? len : 0)), yy, len, 1); }
    for (let k = 0; k < 9; k++) { const back = 6 + ((k * 17 + time * 190) % 46), lift = Math.abs(Math.sin(time * 9 + k * 2)) * 6; g.globalAlpha = 0.6; g.fillStyle = k % 2 ? '#a89a7c' : '#d8cfb8'; g.fillRect(R(x - d * back), R(fl - 2 - lift), 2, 2); }
    g.globalAlpha = 0.28; g.fillStyle = '#c9b894'; g.fillRect(R(x - d * 22 - (d > 0 ? 18 : 0)), fl - 4, 18, 4); g.globalAlpha = 1; }
  for (const v of W.devils) { const x = v.x - cx, N = 9;   /* THE DUST DEVIL: a funnel wide at the top, turning, pebbles and heather riding it, a ring of dust where it meets the ground */
    g.globalAlpha = 0.3; g.fillStyle = '#c9b894'; g.beginPath(); g.ellipse(x, fl - 1, 14, 3, 0, 0, 7); g.fill();
    for (let k = 0; k < N; k++) { const r = 3 + k * 1.5, y = fl - 3 - k * 5.5, sw = Math.sin(time * 9 + k * 0.7) * (1 + k * 0.25), a0 = time * (11 - k * 0.5) + k * 1.3;
      g.lineWidth = k > 5 ? 2 : 1; g.strokeStyle = k < 3 ? '#c9b894' : k < 6 ? '#e8dcc0' : '#f4f8f0'; g.globalAlpha = 0.85;
      g.beginPath(); g.ellipse(x + sw, y, r, 2 + k * 0.2, 0, a0, a0 + 4.2); g.stroke(); g.globalAlpha = 0.4; g.beginPath(); g.ellipse(x + sw, y, r, 2 + k * 0.2, 0, a0 + 3.4, a0 + 6.2); g.stroke(); }
    g.lineWidth = 1; g.globalAlpha = 1;
    for (let k = 0; k < 7; k++) { const a = time * 12 + k * 0.9, kk = (k * 5 + Math.floor(time * 6)) % N, r = 3 + kk * 1.5 + 2; g.fillStyle = k % 3 === 0 ? '#8a5a96' : k % 3 === 1 ? '#7a6a4c' : '#e8dcc0'; g.fillRect(R(x + Math.cos(a) * r), R(fl - 3 - kk * 5.5 + Math.sin(a) * 2), 2, k % 3 === 2 ? 1 : 2); } }
  for (const q of W.drafts) { const x = q.x - cx, y = q.y - cy, Rr = K.draftR;
    if (!q.hit) { const k = 1 - Math.max(0, q.t) / K.draftTell, pulse = 0.5 + 0.4 * Math.sin(time * 14);   /* THE DOWNDRAFT TELL: a red ring on your spot, dust drawn in and spun round it, a column of falling chevrons faint above */
      g.globalAlpha = pulse; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, Rr, 4, 0, 0, 7); g.stroke(); g.setLineDash([3, 3]); g.beginPath(); g.ellipse(x, y - 1, Rr + 4, 5.5, 0, 0, 7); g.stroke(); g.setLineDash([]);
      g.strokeStyle = '#e8dcc0'; g.beginPath(); g.ellipse(x, y - 1, Rr * (1 - k * 0.6), 3, 0, 0, 7); g.stroke();
      for (let i = 0; i < 8; i++) { const a = time * 5 + i * 0.785, rr = Rr * (1.15 - ((time * 0.8 + i * 0.13) % 1) * 0.9); g.globalAlpha = 0.6; g.fillStyle = '#d8cfb8'; g.fillRect(R(x + Math.cos(a) * rr), R(y - 2 + Math.sin(a) * rr * 0.2), 2, 1); }
      g.globalAlpha = 0.15 + 0.25 * k; g.fillStyle = '#eef6f8'; for (let i = 0; i < 3; i++) { const yy = y - 70 + ((time * 70 + i * 24) % 70); for (const dx of [-5, 5]) { g.fillRect(R(x + dx - 1), R(yy), 1, 1); g.fillRect(R(x + dx), R(yy + 1), 1, 1); g.fillRect(R(x + dx + 1), R(yy), 1, 1); } }
      g.globalAlpha = 1; }
    else { g.globalAlpha = 0.45; g.fillStyle = '#bfe6f5'; g.fillRect(R(x - Rr), R(y - 90), Rr * 2, 90); g.globalAlpha = 0.75; g.fillStyle = '#eef6f8';   /* THE SLAM: the column, its streaks, a bright cap and a burst ring on the floor */
      for (let k = 0; k < 12; k++) g.fillRect(R(x - Rr + 1 + (k * 37) % (2 * Rr - 2)), R(y - 92 + (k * 23 + time * 420) % 92), 1, 9);
      g.globalAlpha = 0.9; g.fillRect(R(x - Rr), R(y - 3), Rr * 2, 3); g.strokeStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y - 1, Rr + 4, 4, 0, 0, 7); g.stroke(); g.globalAlpha = 1; } }
  for (const b of W.blades) { if (b.delay > 0) continue; const x = R(b.x - cx), y = R((b.kind === 'high' ? b.gy - 20 : b.gy - 5) - cy), d = b.dir;   /* A GALE BLADE: a crescent of white wind with a blue edge and a streak behind it */
    for (let k = 1; k <= 3; k++) { g.globalAlpha = 0.5 - k * 0.12; g.fillStyle = '#bfe6f5'; g.fillRect(x - d * (6 + k * 5) - (d > 0 ? 8 : 0), y - 2 + k % 2, 8, 1); g.fillRect(x - d * (4 + k * 5) - (d > 0 ? 6 : 0), y + 2 - k % 2, 6, 1); }
    g.globalAlpha = 1; g.lineWidth = 2; g.strokeStyle = '#f4faff'; g.beginPath(); g.arc(x - d * 4, y, 7, -Math.PI / 2.4, Math.PI / 2.4, d < 0); g.stroke();
    g.lineWidth = 1; g.strokeStyle = '#7fc4e6'; g.beginPath(); g.arc(x - d * 6, y, 6, -Math.PI / 2.6, Math.PI / 2.6, d < 0); g.stroke(); g.globalAlpha = 1; }
  if (e.mode === 'bladeTell' && e.bladeSeq) e.bladeSeq.forEach((s, i) => { const x = R(e.x - cx) - 14 + i * 12, y = R(e.y - cy) - e.h - 46, hi = s === 'high';   /* HIGH / LOW over his head: a little window, the crescent in its upper or lower half (gold: duck it, green: jump it) */
    g.fillStyle = '#10141e'; g.fillRect(x - 4, y - 1, 9, 13); g.fillStyle = hi ? '#ffd36b' : '#8fd160'; g.fillRect(x - 5, y - 2, 11, 1); g.fillRect(x - 5, y + 12, 11, 1); g.fillRect(x - 5, y - 2, 1, 15); g.fillRect(x + 5, y - 2, 1, 15);
    const cy2 = hi ? y + 2 : y + 8; g.fillRect(x - 3, cy2, 7, 1); g.fillRect(x - 2, cy2 + 1, 5, 1); g.fillRect(x - 3, cy2 - 1, 2, 1); g.fillRect(x + 2, cy2 - 1, 2, 1);
    g.globalAlpha = 0.45; g.fillRect(x - 3, hi ? y + 8 : y + 2, 7, 1); g.globalAlpha = 1; });
}

/* ---------------------------------------------------------------- THE PIT */
export function drawPit(g, A, cx, cy, time) {
  if (!A || !A.pit) return; const x0 = A.pit[0] * 16 - cx, w = (A.pit[1] - A.pit[0] + 1) * 16, top = R(A.floor - cy), depth = 48;
  if (x0 > 330 || x0 + w < -10) return;
  for (let r = 0; r < depth; r++) { g.globalAlpha = 0.18 + 0.42 * (r / depth); g.fillStyle = '#0e1018'; g.fillRect(x0 + 1, top + r, w - 2, 1); }   /* the throat darkens with depth */
  g.globalAlpha = 0.35; g.fillStyle = '#8a5a96'; g.fillRect(x0 + 1, top + depth - 4, w - 2, 3);
  for (let k = 0; k < 11; k++) { const sx = x0 + 4 + (k * 37) % (w - 8), t = (time * 70 + k * 41) % (depth + 34), yy = top + depth - 2 - t, fade = t > depth ? 1 - (t - depth) / 34 : 1;
    g.globalAlpha = 0.95 * fade; g.fillStyle = k % 3 ? '#ffffff' : '#bfe6f5'; g.fillRect(R(sx + Math.sin(time * 5 + k) * 1.5), R(yy), 2, 6 + (k % 3) * 2); }
  g.globalAlpha = 0.6; g.fillStyle = '#e8dcc0'; for (let k = 0; k < 4; k++) { const t = (time * 40 + k * 23) % 50; g.fillRect(R(x0 + 6 + (k * 11) % (w - 12) + Math.sin(time * 3 + k) * 4), R(top - 2 - t * 0.4), 2, 1); }   /* grit lifted over the rim */
  g.globalAlpha = 1;
}

/* ---------------------------------------------------------------- THE GALE UPDRAFT VENT */
export function drawGaleVent(g, pr, cx, cy, time) {
  const x = R(pr.x - cx), y = R(pr.y - cy), hw = pr.w || 12, top = y - pr.h, on = pr.active, warm = !on && pr.warm;
  g.globalAlpha = on ? 0.16 : warm ? (Math.floor(time * 10) % 2 ? 0.14 : 0.05) : 0.04; g.fillStyle = '#eefaff'; g.fillRect(x - hw, top, hw * 2, pr.h);   /* the column of air */
  g.globalAlpha = on ? 0.85 : warm ? 0.5 : 0.28; g.fillStyle = '#eefaff'; for (let xx = x - hw; xx < x + hw; xx += 4) g.fillRect(xx, top - 1, 2, 1);   /* the top of the lift, dashed */
  if (on || warm) { const n = on ? 9 : 4;   /* spiral streams, a seed of dust and a feather riding them */
    for (let k = 0; k < n; k++) { const sp = on ? 170 : 40, t = (time * sp + k * pr.h / n) % pr.h, yy = y - 5 - t, xx = x + Math.sin(t * 0.09 + k * 1.9) * (hw - 3);
      g.globalAlpha = on ? 0.75 * (1 - t / pr.h * 0.6) : 0.35; g.fillStyle = '#ffffff'; g.fillRect(R(xx), R(yy), 1, on ? 9 : 4); g.fillRect(R(xx) + (k % 2 ? 1 : -1), R(yy) + 2, 1, on ? 5 : 2); }
    if (on) for (let k = 0; k < 4; k++) { const t = (time * 120 + k * 37) % pr.h, yy = y - 8 - t, xx = x + Math.cos(t * 0.07 + k * 2.4) * (hw - 4); g.globalAlpha = 0.9; g.fillStyle = k % 2 ? '#d8cfb8' : '#8a7a5a'; g.fillRect(R(xx), R(yy), 2, k % 2 ? 1 : 2); if (k === 0) { g.fillStyle = '#e8dcc0'; g.fillRect(R(xx) + 2, R(yy) - 1, 3, 1); } } }
  g.globalAlpha = 1;
  /* the sill: a carved block of the summit's granite with the mouth sunk in it, two wind-curl grooves, a lit lip */
  g.fillStyle = GR.g0; g.fillRect(x - 13, y - 4, 26, 4); g.fillStyle = GR.g2; g.fillRect(x - 12, y - 6, 24, 3); g.fillStyle = GR.g4; g.fillRect(x - 12, y - 6, 24, 1); g.fillStyle = GR.g1; g.fillRect(x - 12, y - 3, 24, 1);
  g.fillStyle = on ? '#cfe8f4' : warm ? '#7a8aa0' : '#10131b'; g.fillRect(x - 7, y - 7, 14, 2); g.fillStyle = '#0a0c12'; g.fillRect(x - 6, y - 6, 12, 1);
  for (const dx of [-10, 9]) { g.fillStyle = GR.g1; g.fillRect(x + dx, y - 5, 2, 1); g.fillRect(x + dx + (dx < 0 ? 1 : -1), y - 4, 1, 1); }
  g.fillStyle = GR.lichen; g.fillRect(x - 11, y - 7, 2, 1); g.fillStyle = GR.lichenD; g.fillRect(x - 10, y - 8, 1, 1); g.fillStyle = GR.q; g.fillRect(x + 6, y - 5, 1, 1);
  if (!on) { g.fillStyle = '#a8b84a'; for (let k = 0; k < 3; k++) { const gx = x - 4 + k * 4; g.fillRect(gx, y - 9 + (warm ? Math.round(Math.sin(time * 14 + k)) : 0), 1, 2); } }   /* grass blades in the mouth, stirring when it warms */
}

/* ---------------------------------------------------------------- FLAGS */
export function drawFlag(g, pr, cx, cy, time, on, wd, tl) {
  const x = R(pr.x - cx), y = R(pr.y - cy); wd = wd || 1;
  g.fillStyle = GR.g0; g.fillRect(x - 5, y - 4, 10, 4); g.fillStyle = GR.g2; g.fillRect(x - 4, y - 5, 8, 3); g.fillStyle = GR.g4; g.fillRect(x - 4, y - 5, 5, 1); g.fillStyle = GR.g3; g.fillRect(x - 3, y - 8, 6, 3); g.fillStyle = GR.g5; g.fillRect(x - 3, y - 8, 3, 1); g.fillStyle = GR.g1; g.fillRect(x + 1, y - 7, 2, 2);   /* the cairn the staff is wedged in */
  g.fillStyle = GR.lichen; g.fillRect(x - 4, y - 4, 1, 1); g.fillStyle = GR.q; g.fillRect(x + 2, y - 5, 1, 1);
  g.fillStyle = GR.bone; g.fillRect(x - 1, y - 32, 2, 25); g.fillStyle = GR.boneD; g.fillRect(x, y - 32, 1, 25); g.fillStyle = GR.bone; g.fillRect(x - 2, y - 33, 4, 2); g.fillStyle = '#fff8e0'; g.fillRect(x - 1, y - 34, 2, 1);   /* a bleached bone staff with a knuckle head */
  g.fillStyle = '#8a5a32'; g.fillRect(x - 1, y - 28, 2, 1); g.fillRect(x - 1, y - 24, 2, 1);   /* hide cord */
  const len = on ? 13 : tl >= 0 ? 5 + R(8 * tl) : 6, sp = on ? 14 : tl >= 0 ? 6 + 8 * tl : 3, amp = on ? 1.8 : tl >= 0 ? 0.6 + tl : 0.5;
  for (let k = 0; k < len; k++) { const dy = R(Math.sin(time * sp + k * 0.8 + pr.ph) * amp * (0.4 + k / len)) + (on ? 0 : R(k * 0.5)), hgt = k > len - 4 ? 3 : 7 - Math.floor(k / 3), notch = k > len - 3 && (k % 2 === 0);
    if (notch) continue; g.fillStyle = k % 4 === 0 ? GR.redD : GR.red; g.fillRect(x + wd * (k + 1) - (wd < 0 ? 1 : 0), y - 31 + dy, 1, hgt); if (k > 1 && k < len - 3) { g.fillStyle = '#e07a6c'; g.fillRect(x + wd * (k + 1) - (wd < 0 ? 1 : 0), y - 31 + dy, 1, 1); } }
  if (len > 6) { g.fillStyle = GR.bone; g.fillRect(x + wd * 3 - (wd < 0 ? 1 : 0), y - 29 + R(Math.sin(time * sp + 2.4 + pr.ph) * amp * 0.6), 2, 2); }   /* a tusk mark on the cloth */
}

/* ---------------------------------------------------------------- THE LEDGE PILLARS */
export function drawTorPost(g, p, cx, cy, L) {
  const x = R(p.x * 16 + 8 - cx), y = R(p.y * 16 + 6 - cy), bot = R(p.bottom * 16 - cy), fell = p.east && L && L.galeFell;
  if (x < -10 || x > g.canvas.width + 10) return;
  const top = fell ? bot - 10 - (hash(p.x, 3) % 9) : y;
  if (top >= bot) return;
  for (let yy = top; yy < bot; yy++) { const band = Math.floor((yy - top + hash(p.x, 1) % 7) / 7) % 3, w = 4 + ((yy - top) > 6 && (bot - yy) > 6 ? 0 : 1), tone = band === 0 ? GR.g3 : band === 1 ? GR.g2 : '#4a505e';
    g.fillStyle = GR.g0; g.fillRect(x - w - 1, yy, 1, 1); g.fillRect(x + w, yy, 1, 1); g.fillStyle = tone; g.fillRect(x - w, yy, w * 2, 1); g.fillStyle = GR.g4; g.fillRect(x - w, yy, 2, 1); g.fillStyle = GR.g1; g.fillRect(x + w - 2, yy, 2, 1); if ((yy - top + hash(p.x, 1) % 7) % 7 === 0) { g.fillStyle = GR.g0; g.fillRect(x - w, yy, w * 2, 1); } }
  const sc = hash(p.x, 9) % 3; for (let k = 0; k < 2; k++) { const yy = top + 8 + ((k * 23 + sc * 11) % Math.max(4, bot - top - 16)); g.fillStyle = GR.g1; g.fillRect(x - 2 + k, yy, 4, 2); g.fillStyle = GR.g0; g.fillRect(x - 1 + k, yy + 1, 3, 1); }   /* two scoured hollows the wind has cut */
  if (!fell) { g.fillStyle = GR.g0; g.fillRect(x - 8, top, 16, 1); g.fillStyle = GR.g3; g.fillRect(x - 7, top + 1, 14, 3); g.fillStyle = GR.g4; g.fillRect(x - 7, top + 1, 14, 1); g.fillStyle = GR.g0; g.fillRect(x - 7, top + 4, 14, 1); g.fillStyle = GR.g1; g.fillRect(x - 6, top + 5, 12, 1); }   /* the bracket under the ledge: it takes the weight */
  else { g.fillStyle = GR.g0; g.fillRect(x - 2, top, 2, 1); g.fillRect(x + 1, top - 1, 2, 1); for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? GR.g2 : GR.g3; g.fillRect(x - 9 + k * 5 + (hash(p.x, k) % 3), bot - 3 + (k % 2), 3, 3); } }
  g.fillStyle = GR.g0; g.fillRect(x - 7, bot - 3, 14, 3); g.fillStyle = GR.g2; g.fillRect(x - 6, bot - 4, 12, 3); g.fillStyle = GR.g4; g.fillRect(x - 6, bot - 4, 12, 1);   /* the plinth on the floor */
  g.fillStyle = GR.lichen; g.fillRect(x - 5, bot - 6, 2, 1); g.fillRect(x + 2, bot - 5, 1, 1); g.fillStyle = GR.lichenD; g.fillRect(x - 4, bot - 7, 1, 1); g.fillStyle = GR.moss; g.fillRect(x - 6, bot - 3, 3, 1);
}

/* ---------------------------------------------------------------- A CHIME UNDER A LEDGE */
export function drawRoostChime(g, x, y, time, lit) {
  g.fillStyle = lit ? '#b9f0ff' : '#6d8a94'; g.fillRect(x - 5, y + 1, 10, 1);
  for (let k = 0; k < 3; k++) { const sw = R(Math.sin(time * 3 + k * 1.7) * 1.5), bx = x - 4 + k * 4, len = 5 + k % 2 * 3;
    g.fillStyle = '#8a5a32'; g.fillRect(bx + 1, y + 2, 1, 2); g.fillStyle = GR.bone; g.fillRect(bx + sw, y + 4, 2, len); g.fillStyle = GR.boneD; g.fillRect(bx + sw + 1, y + 4, 1, len);
    if (lit) { g.globalAlpha = 0.5; g.fillStyle = '#b9f0ff'; g.fillRect(bx + sw - 1, y + 4, 4, len); g.globalAlpha = 1; } }
}
