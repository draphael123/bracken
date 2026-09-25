// src/whirlpools.js — THE KEEP'S WHIRLPOOLS (Daniel, 2026-09-25; docs/briefs/keep-rework-2.md).
// "Each drags you toward its centre and burns air faster while you are in its pull. Entering its area SHOWS ITS SWITCH (a sluice
// lever in a wall niche just outside the pull); strike the lever and the whirlpool winds down and stays off."
//   L.whirlpools  [{ x, y, r, lever: [lx, ly] }]   in tiles: the eye, the reach of the pull, and the lever's tile (in a niche)
// Told three ways (C1/C4) before it has you: the swirl itself (rings turning, a dark eye), drag lines streaming into the eye from
// the edge of its reach, and a sound while you are in it; and the lever's niche LIGHTS the moment you are in the pull, so the
// answer is shown by the problem. A lever struck stays struck THROUGH A DEATH: main.js keeps it in `marks` ('whirl:x,y').
// Pure: no DOM and no main.js. main.js hands in its pieces (io) and draws with drawWhirlpools. tools/whirlpools.mjs proves it.
export const WHIRL = { pull: 64, drain: 2.2, windDown: 1.2, niche: 2 };
const TS = 16;
export const eyeOf = w => ({ x: w.x * TS + 8, y: w.y * TS + 8 });
export const leverOf = w => ({ x: w.lever[0] * TS + 8, y: (w.lever[1] + 1) * TS });   /* its foot: the bottom of its tile */
export const whirlKey = w => 'whirl:' + w.x + ',' + w.y;

/* at load and on every respawn: a lever already struck (in `off`, main.js's marks) keeps its whirlpool still */
export function whirlInit(L, off) {
  for (const w of L.whirlpools || []) { const done = !!(off && off.has(whirlKey(w))); Object.assign(w, { off: done, k: done ? 0 : 1, lit: done, spin: 0, inT: 0, acc: [0, 0] }); }
  return L.whirlpools || [];
}
/* the one you are in, if any: { w, d, k } with k the depth into its pull, 0 at the edge and 1 at the eye */
export function whirlAt(L, x, y) {
  for (const w of L.whirlpools || []) { if (w.k <= 0) continue; const e = eyeOf(w), d = Math.hypot(x - e.x, y - e.y), R = w.r * TS; if (d < R) return { w, d, k: 1 - d / R }; }
  return null;
}
/* THE LEVER TAKES A BLOW: hb is the hero's attack box {l, r, t, b}. Returns the whirlpool it stopped, or null */
export function strikeLever(L, hb) {
  if (!hb) return null;
  for (const w of L.whirlpools || []) { if (w.off) continue; const q = leverOf(w);
    if (hb.l < q.x + 10 && hb.r > q.x - 10 && hb.t < q.y && hb.b > q.y - 22) { w.off = true; w.lit = true; return w; } }
  return null;
}
/* ONE STEP. io: { swim (bool), inAir(x, y), move(dx, dy), emit(part), breathMax } - returns events [{ t: 'enter'|'leave'|'still', w }] */
export function updateWhirlpools(L, P, dt, io) {
  const out = []; if (!L.whirlpools) return out;
  const cy = P.y - 12, at = !P.dead && io.swim ? whirlAt(L, P.x, cy) : null;
  for (const w of L.whirlpools) {
    w.spin += dt * (0.4 + 2.4 * w.k);
    if (w.off && w.k > 0) { w.k = Math.max(0, w.k - dt / WHIRL.windDown); if (w.k === 0) out.push({ t: 'still', w }); }
    const inside = at && at.w === w;
    if (inside && !w.inT) { out.push({ t: 'enter', w }); w.lit = true; }
    if (!inside && w.inT) out.push({ t: 'leave', w });
    w.inT = inside ? w.inT + dt : 0;
  }
  P.whirled = 0;
  if (at && !io.inAir(P.x, P.y - 8)) {
    const { w, d, k } = at, e = eyeOf(w), s = w.k;
    P.whirled = k * s;
    P.breath = Math.max(0, (P.breath ?? io.breathMax) - dt * WHIRL.drain * (0.4 + 0.6 * k) * s);
    /* THE DRAG: toward the eye, and round it - a swimmer caught at the edge is carried in a spiral, not simply sucked in */
    const pull = WHIRL.pull * (0.35 + 0.65 * k) * s * (P.block || P.aegis ? 0.55 : 1), dx = (e.x - P.x) / (d || 1), dy = (e.y - cy) / (d || 1);
    if (d > 5) { w.acc[0] += (dx * 0.8 - dy * 0.6) * pull * dt; w.acc[1] += (dy * 0.8 + dx * 0.6) * pull * dt; }
    const sx = Math.trunc(w.acc[0]), sy = Math.trunc(w.acc[1]);
    if (sx || sy) { w.acc[0] -= sx; w.acc[1] -= sy; io.move(sx, sy); }
    if (Math.random() < dt * 14) { const bx = P.x + (Math.random() - 0.5) * 8, by = cy - 4, dd = Math.hypot(e.x - bx, e.y - by) || 1;
      io.emit({ x: bx, y: by, vx: (e.x - bx) / dd * 70, vy: (e.y - by) / dd * 70, life: Math.min(0.8, dd / 70), max: 0.8, col: '#e8f4f0', size: 1, grav: 0 }); }
  }
  return out;
}

export function drawWhirlpools(g, L, cx, cy, time, VW, VH) {
  for (const w of L.whirlpools || []) {
    const e = eyeOf(w), x = e.x - cx, y = e.y - cy, R = w.r * TS, s = w.k;
    if (x < -R - 40 || x > VW + R + 40 || y < -R - 40 || y > VH + R + 40) continue;
    /* THE LEVER'S NICHE: a dark arch in the wall, a bronze sluice lever in it; lit gold once you have been in the pull, green when struck */
    { const q = { x: w.lever[0] * TS + 8 - cx, y: (w.lever[1] + 1) * TS - cy };
      g.fillStyle = '#0b1418'; g.fillRect(Math.round(q.x - 9), Math.round(q.y - 26), 18, 26); g.fillRect(Math.round(q.x - 7), Math.round(q.y - 29), 14, 3);
      g.fillStyle = '#3a4a50'; g.fillRect(Math.round(q.x - 10), Math.round(q.y - 27), 1, 27); g.fillRect(Math.round(q.x + 9), Math.round(q.y - 27), 1, 27); g.fillRect(Math.round(q.x - 7), Math.round(q.y - 30), 14, 1);
      if (w.lit) { const glow = w.off ? '#8fd160' : '#ffd36b', k2 = w.off ? 0.18 : 0.28 + 0.14 * Math.sin(time * 6);
        g.globalAlpha = k2; g.fillStyle = glow; g.beginPath(); g.arc(q.x, q.y - 12, 20, 0, 7); g.fill(); g.globalAlpha = 1;
        g.fillStyle = glow; g.fillRect(Math.round(q.x - 8), Math.round(q.y - 26), 16, 1); }
      const a = w.off ? 0.9 : -0.9, hx = q.x, hy = q.y - 6;   /* the lever: thrown down when struck */
      g.fillStyle = '#5a4a2a'; g.fillRect(Math.round(hx - 4), Math.round(hy), 8, 5);
      g.strokeStyle = '#b08a3a'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.sin(a) * 12, hy - Math.cos(a) * 12); g.stroke();
      g.fillStyle = '#e0c060'; g.fillRect(Math.round(hx + Math.sin(a) * 12) - 2, Math.round(hy - Math.cos(a) * 12) - 2, 4, 4);
      if (w.lit && !w.off) { g.globalAlpha = 0.6 + 0.4 * Math.sin(time * 8); g.fillStyle = '#ffd36b'; g.fillRect(Math.round(q.x - 1), Math.round(q.y - 40), 2, 6); g.fillRect(Math.round(q.x - 1), Math.round(q.y - 32), 2, 2); g.globalAlpha = 1; } }
    if (s <= 0.01) { g.globalAlpha = 0.25; g.strokeStyle = '#6a8a90'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 5, 0, 7); g.stroke(); g.globalAlpha = 1; continue; }   /* still water, and the iron ring of its drain */
    /* THE EYE: dark, and the water heaped round it */
    g.globalAlpha = 0.28 * s; g.fillStyle = '#05101a'; g.beginPath(); g.arc(x, y, R * 0.55, 0, 7); g.fill();
    g.globalAlpha = 0.5 * s; g.fillStyle = '#020608'; g.beginPath(); g.arc(x, y, 6 + 3 * s, 0, 7); g.fill();
    /* THE SWIRL: rings of broken arc turning round it, faster near the eye */
    g.lineWidth = 1;
    for (let k = 0; k < 5; k++) { const rr = 10 + k * (R - 10) / 4.5, a0 = w.spin * (2.2 - k * 0.3) + k * 1.3;
      g.globalAlpha = (0.55 - k * 0.07) * s; g.strokeStyle = k % 2 ? '#9fd8e8' : '#e8f4f0';
      for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(x, y, rr, a0 + j * 2.09, a0 + j * 2.09 + 1.1); g.stroke(); } }
    /* THE DRAG LINES: streaks drawn in from the edge of its reach, each curling as it goes - the pull, shown */
    for (let i = 0; i < 14; i++) { const ph = (time * 0.8 + i / 14) % 1, rr = R * (1 - ph), a = i * 0.449 * 7 + ph * 3.2 + w.spin * 0.3;
      const bx = x + Math.cos(a) * rr, by = y + Math.sin(a) * rr, tx = x + Math.cos(a - 0.35) * (rr + 8), ty = y + Math.sin(a - 0.35) * (rr + 8);
      g.globalAlpha = (0.2 + 0.5 * ph) * s; g.strokeStyle = '#dff4fa'; g.beginPath(); g.moveTo(tx, ty); g.lineTo(bx, by); g.stroke(); }
    g.globalAlpha = 0.18 * s; g.strokeStyle = '#9fd8e8'; g.setLineDash([2, 4]); g.beginPath(); g.arc(x, y, R, 0, 7); g.stroke(); g.setLineDash([]);   /* where its reach ends */
    g.globalAlpha = 1;
  }
}
