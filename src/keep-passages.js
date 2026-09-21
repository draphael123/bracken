// src/keep-passages.js — THE KEEP'S NARROWS: two hazards that only mean something in a tight place, and the passages
// that put them together (Daniel, 2026-09-20: "narrow passages with air-draining hazards, poison hazards, and more
// visual / environment diversity"; the audit: the Keep's mechanics came one per corridor, never combined).
//   L.siphons  { x, y }  a drain set in the stone. Inside SIPHON.r of its mouth it takes your air on top of the water's
//                        own drain, harder the closer you are, and pulls you in. Bubbles spiral into it all the time, and
//                        the ones you breathe out go to it too, so you can see the pull from across the passage.
//   L.blight   [x0, x1, y0, y1]  tiles of dead, green water lying on a floor. Feet in it: the caverns' poison (P.venomT).
// Neither is ever air, and none sits on an air box (tools/keep-passages.mjs checks both).
export const SIPHON = { r: 56, drain: 3.2, pull: 42 };
const TS = 16;
const mouth = s => ({ x: s.x * TS + 8, y: s.y * TS + 8 });

export function siphonNear(L, x, y) {
  for (const s of L.siphons || []) { const m = mouth(s), d = Math.hypot(x - m.x, y - m.y); if (d < SIPHON.r) return { s, m, d, k: 1 - d / SIPHON.r }; }
  return null;
}
export function inBlight(L, x, feet) {
  const tx = Math.floor(x / TS), ty = Math.floor((feet - 1) / TS);
  return (L.blight || []).some(([x0, x1, y0, y1]) => tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1);
}

/* io: { breathMax, inAir(x,y), move(dx,dy), emit(part), poison() } - main.js hands in its own pieces */
export function updateKeepPassages(L, P, dt, time, io) {
  if (!L.siphons && !L.blight) return;
  const st = L._kp || (L._kp = { ax: 0, ay: 0 });
  if (P.dead || !P.swim) { st.ax = st.ay = 0; P.siphoned = 0; return; }
  const cy = P.y - 12, hit = siphonNear(L, P.x, cy);
  P.siphoned = 0;
  if (hit && !io.inAir(P.x, P.y - 8)) {
    const { m, d, k } = hit;
    P.siphoned = k;
    P.breath = Math.max(0, (P.breath ?? io.breathMax) - dt * SIPHON.drain * (0.35 + 0.65 * k));
    const pull = SIPHON.pull * (0.4 + 0.6 * k) * (P.block || P.aegis ? 0.5 : 1);
    if (d > 6) { st.ax += (m.x - P.x) / d * pull * dt; st.ay += (m.y - cy) / d * pull * dt; }
    const sx = Math.trunc(st.ax), sy = Math.trunc(st.ay);
    if (sx || sy) { st.ax -= sx; st.ay -= sy; io.move(sx, sy); }
    /* the air coming out of you goes to it, not up */
    if (Math.random() < dt * (8 + 16 * k)) { const bx = P.x + (Math.random() - 0.5) * 8, by = cy - 4, dd = Math.hypot(m.x - bx, m.y - by) || 1, sp = 50 + 60 * k;
      io.emit({ x: bx, y: by, vx: (m.x - bx) / dd * sp, vy: (m.y - by) / dd * sp, life: Math.min(0.9, dd / sp), max: 0.9, col: '#e8f4f0', size: 1, grav: 0 }); }
  } else { st.ax = st.ay = 0; }
  if (inBlight(L, P.x, P.y)) io.poison();
}

export function drawKeepPassages(g, L, cx, cy, time, VW, VH) {
  if (!L.siphons && !L.blight) return;
  // THE BLIGHT: a green murk lying on the floor, its top edge moving, motes rising out of it and falling back
  for (const [x0, x1, y0, y1] of L.blight || []) {
    const l = x0 * TS - cx, r = (x1 + 1) * TS - cx, t = y0 * TS - cy, b = (y1 + 1) * TS - cy;
    if (r < -8 || l > VW + 8 || b < -8 || t > VH + 8) continue;
    g.globalAlpha = 0.34; g.fillStyle = '#3c6a18'; g.fillRect(Math.round(l), Math.round(t + 3), Math.round(r - l), Math.round(b - t - 3));
    g.globalAlpha = 0.5; g.fillStyle = '#7fb83a';
    for (let x = Math.max(l, -4); x < Math.min(r, VW + 4); x += 3) { const wy = t + 2 + Math.sin((x + cx) * 0.21 + time * 2.3) * 1.6; g.fillRect(Math.round(x), Math.round(wy), 3, 2); }
    const n = Math.round((x1 - x0 + 1) * 0.9);
    for (let i = 0; i < n; i++) { const ph = (time * 0.45 + i * 0.618) % 1, mx = l + ((i * 37.3) % (r - l)), my = t - 10 * Math.sin(ph * Math.PI) + 4;
      g.globalAlpha = 0.7 * Math.sin(ph * Math.PI); g.fillStyle = i % 2 ? '#a6e04a' : '#5c8a24'; g.fillRect(Math.round(mx), Math.round(my), 2, 2); }
    g.globalAlpha = 1;
  }
  // THE SIPHONS: an iron mouth in the stone, a dark whirl round it, and bubbles spiralling in from the edge of its reach
  for (const s of L.siphons || []) {
    const m = mouth(s), x = m.x - cx, y = m.y - cy;
    if (x < -70 || x > VW + 70 || y < -70 || y > VH + 70) continue;
    g.globalAlpha = 0.22; g.fillStyle = '#06101a';
    g.beginPath(); g.arc(x, y, SIPHON.r * 0.72, 0, 7); g.fill();
    g.globalAlpha = 0.42; g.strokeStyle = '#9fd8e8'; g.lineWidth = 1;
    for (let k = 0; k < 3; k++) { const a0 = time * 2.4 + k * 2.09; g.beginPath(); g.arc(x, y, 10 + k * 9, a0, a0 + 1.4); g.stroke(); }
    g.globalAlpha = 1;
    g.fillStyle = '#10181a'; g.fillRect(Math.round(x - 7), Math.round(y - 7), 14, 14);
    g.fillStyle = '#5a6270'; g.fillRect(Math.round(x - 8), Math.round(y - 8), 16, 2); g.fillRect(Math.round(x - 8), Math.round(y + 6), 16, 2); g.fillRect(Math.round(x - 8), Math.round(y - 8), 2, 16); g.fillRect(Math.round(x + 6), Math.round(y - 8), 2, 16);
    const sp = time * 5 + s.x;
    for (let k = 0; k < 2; k++) { const a = sp + k * Math.PI / 2; g.fillStyle = '#8a919c'; g.fillRect(Math.round(x + Math.cos(a) * 4) - 1, Math.round(y + Math.sin(a) * 4) - 1, 2, 2); g.fillRect(Math.round(x - Math.cos(a) * 4) - 1, Math.round(y - Math.sin(a) * 4) - 1, 2, 2); }
    /* each bubble drawn with a tail of two fainter ones BEHIND it on its own spiral, so the eye reads which way it goes */
    const n = 24;
    for (let i = 0; i < n; i++) for (let tr = 2; tr >= 0; tr--) { const ph = Math.max(0, (time * 0.7 + i / n) % 1 - tr * 0.035), rr = SIPHON.r * (1 - ph) + 5, a = i * 2.39996 + ph * 5.5;
      const bx = x + Math.cos(a) * rr, by = y + Math.sin(a) * rr, z = tr ? 1 : i % 3 === 0 ? 3 : 2;
      g.globalAlpha = (0.45 + 0.55 * ph) * (tr ? 0.4 / tr : 1); g.fillStyle = tr ? '#9fd8e8' : i % 3 ? '#eefaff' : '#bfe6f5'; g.fillRect(Math.round(bx - z / 2), Math.round(by - z / 2), z, z); }
    g.globalAlpha = 1;
  }
}

/* THE NARROWS: 160 tiles between the Bell Approach and the inner keep, all rock until carved. Two places.
   THE SIPHON GALLERIES - a low mouth under a siphon, a shaft UP against a falling current past a second, a corridor
     over three poison grates with one air bell in its roof, a shaft DOWN, and a low run over blighted water with a
     siphon in its floor that pulls you down into it.
   THE BLIGHTED CISTERN - a tall drowned tank with the dead water standing in it, three ledges to stand out of it (air,
     a clam, a poison grate), and a low exit against a current between a ceiling siphon and a floor one. */
export function buildKeepNarrows(K, T, N, ent) {
  const D = K.deep, set = (x, y, t) => { K.grid[y * K.W + x] = t; }, box = (a, b, c, d, t) => { for (let y = c; y <= d; y++) for (let x = a; x <= b; x++) set(x, y, t); };
  const air = (a, b, c, d) => { K.airRooms.push([a, b, c, d]); D.pockets.push([a, b, c, d]); };
  K.siphons = K.siphons || []; K.blight = K.blight || []; K.gasVents = K.gasVents || [];
  const siphon = (x, y) => K.siphons.push({ x, y }), grate = (x, y, phase) => K.gasVents.push({ x, y, phase, period: 3.4, hitT: 0 });
  // THE SIPHON GALLERIES
  box(400, 422, 50, 55, T.AIR); siphon(411, 49);
  box(418, 423, 33, 55, T.AIR); D.currents.push({ x0: 418, x1: 423, y0: 33, y1: 49, fx: 0, fy: 70, kind: 'stream' }); siphon(417, 43);
  box(418, 452, 33, 38, T.AIR); box(431, 434, 30, 32, T.AIR); air(431, 434, 30, 33);
  grate(426, 39, 0); grate(440, 39, 1.2); grate(446, 39, 2.3);
  box(448, 453, 33, 56, T.AIR); D.vents.push({ x: 450, y: 56, h: 4, hot: false, drain: false });
  box(448, 479, 51, 56, T.AIR); K.blight.push([456, 479, 55, 56]); siphon(467, 57);
  // THE BLIGHTED CISTERN
  box(480, 522, 28, 58, T.AIR); K.blight.push([480, 485, 55, 58], [491, 501, 55, 58], [507, 513, 55, 58], [519, 522, 55, 58]);
  box(486, 490, 50, 58, T.SOLID); D.vents.push({ x: 488, y: 49, h: 5, hot: false, drain: false });
  box(502, 506, 44, 58, T.SOLID); D.clams.push({ x: 504, y: 43 });
  box(514, 518, 50, 58, T.SOLID); grate(516, 50, 0.8);
  D.kelp.push({ x: 496, y: 58, h: 13 }, { x: 510, y: 58, h: 10 }); D.bulbs.push({ x: 510, y: 48 });
  box(523, 556, 50, 55, T.AIR); D.currents.push({ x0: 523, x1: 550, y0: 50, y1: 55, fx: -80, fy: 0, kind: 'stream' });
  siphon(532, 49); siphon(546, 56); box(538, 541, 47, 49, T.AIR); air(538, 541, 47, 50);
  box(551, 556, 50, 58, T.AIR); box(N - 3, N + 3, 52, 58, T.AIR);
  // what lives in it
  for (const [t, x, y] of [['eel', 405, 53], ['puffer', 420, 40], ['eel', 437, 35], ['angler', 450, 45], ['jelly', 460, 52], ['puffer', 472, 52],
    ['merrowspear', 488, 49], ['eel', 495, 38], ['angler', 511, 32], ['merrowcaller', 516, 49], ['jelly', 530, 52], ['eel', 548, 53], ['merrowbrute', 553, 58]]) ent(t, x, y, { face: -1 });
  ent('check', 403, 55); ent('check', 488, 49);
  ent('sign', 402, 55, { text: 'THE SIPHON GALLERIES. DRAINS DRINK YOUR AIR. FOLLOW THE BUBBLES TO SEE THEM.' });
  ent('sign', 482, 54, { text: 'THE BLIGHTED CISTERN. THE DEAD WATER POISONS. STAND ON THE STONES.' });
  for (const [x, y] of [[410, 53], [428, 34], [444, 34], [462, 52], [498, 36], [525, 52], [552, 55]]) ent('coin', x, y);
  // and what it looks like: iron and coral and weed in bare rock, not the halls' statues and coursed stone
  D.banners.push({ x: 402, y: 50 }, { x: 436, y: 33 }, { x: 444, y: 33 });
  D.props.push({ k: 'coral', x: 489, y: 49, v: 2 }, { k: 'coral', x: 505, y: 43, v: 1 }, { k: 'coral', x: 470, y: 56, v: 0 }, { k: 'coral', x: 552, y: 58, v: 2 }, { k: 'brazier', x: 517, y: 49 });
  D.fish.push({ x: 500, y: 36, n: 5, col: '#a6c878' });
  return [['THE SIPHON GALLERIES', 400, 479, [30, 50, 90], 0.2], ['THE BLIGHTED CISTERN', 480, N - 1, [110, 170, 40], 0.16]];
}
