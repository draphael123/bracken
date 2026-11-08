// src/beam-path.js - THE BEAM PATH: a light you can SEE before it does anything (claude/colossus4, 11-05; plan-desert-1105 section 3a: built ONCE here, then the
// King's Pyramid mirror room + P1, the Sun Temple, the Fallen Sun Priest and the Desert Priest's beam preview draw with it). Pure geometry + one canvas painter
// (it takes the 2D context it draws on: no DOM, no main.js; proved by tools/beam-path.mjs).
//
// THE RULE IT SERVES (Daniel 10-14, Colossus 4: "all the mirrors activated but nothing happens for a while"): a light is drawn the whole way - source ->
// each mirror -> WHERE IT LANDS. Landing ON a target is an EVENT the same frame (edge(): the instant crack); landing short is drawn short, with a marker at
// where the target WILL be ('HE COMES TO THE LIGHT') - never a silent wait.
//
//   path(points)                     -> { pts: [[x, y]...], len, land: [x, y] }        free-angle (px): the Colossus's sun and braziers
//   fromSegs(segs, TS)               -> [path...]                                       light.js / sun-puzzle tile segments as px polylines (joined where they meet)
//   clip(p, box)                     -> { path, hit: bool, at: [x, y] | null }           cut a path where it first enters a box [l, t, r, b]: the light stops ON him
//   at(p, k)                         -> [x, y]                                           the point k (0..1) along a path (the glints, the travelling head)
//   edge(mem, key, on)               -> true on the frame `on` turns true (the instant), false otherwise
//   drawBeam(g, p, cx, cy, time, o)  paints it: o = { kind: 'sun' | 'dawn' | 'fire' | 'priest' | 'lance', lit (solid) | preview (dotted), ring (landing ring), a (alpha) }
//   drawMarker(g, x, y, cx, cy, time, o) the told marker on the floor where the light waits (o.word drawn with o.text(word, x, y, col, align, size))
export const BEAM = {
  col: { sun: ['255,246,200', '#fffbe0'], dawn: ['255,228,150', '#fff6c8'], fire: ['255,170,80', '#ffe0b0'], priest: ['220,210,255', '#f4f0ff'], lance: ['255,236,170', '#fffbe0'] },
  glow: 6, core: 1.5, glints: 3, glintV: 0.7, dot: 6,
};
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
export function path(points) {
  const pts = points.filter(p => p && isFinite(p[0]) && isFinite(p[1])).map(p => [p[0], p[1]]);
  let len = 0; for (let i = 1; i < pts.length; i++) len += dist(pts[i - 1], pts[i]);
  return { pts, len, land: pts.length ? pts[pts.length - 1] : null };
}
/* light.js segments ({ x0, y0, x1, y1, dir } tiles) as px polylines through the tile centres; a segment that starts where the last ended continues it */
export function fromSegs(segs, TS = 16) {
  const out = []; let cur = null;
  const c = v => v * TS + TS / 2;
  for (const s of segs || []) {
    const a = [c(s.x0), c(s.y0)], b = [c(s.x1), c(s.y1)];
    if (cur && Math.abs(cur[cur.length - 1][0] - a[0]) < 0.5 && Math.abs(cur[cur.length - 1][1] - a[1]) < 0.5) cur.push(b);
    else { cur = [a, b]; out.push(cur); }
  }
  return out.map(path);
}
/* where a segment a->b first enters box [l, t, r, b] (Liang-Barsky), as a fraction 0..1, or null */
function enter(a, b, [l, t, r, bt]) {
  const dx = b[0] - a[0], dy = b[1] - a[1]; let u0 = 0, u1 = 1;
  for (const [p, q] of [[-dx, a[0] - l], [dx, r - a[0]], [-dy, a[1] - t], [dy, bt - a[1]]]) {
    if (p === 0) { if (q < 0) return null; continue; }
    const u = q / p; if (p < 0) { if (u > u1) return null; if (u > u0) u0 = u; } else { if (u < u0) return null; if (u < u1) u1 = u; }
  }
  return u0;
}
export function clip(p, box) {
  for (let i = 1; i < p.pts.length; i++) {
    const a = p.pts[i - 1], b = p.pts[i], u = enter(a, b, box);
    if (u != null) { const pt = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; return { path: path([...p.pts.slice(0, i), pt]), hit: true, at: pt }; }
  }
  return { path: p, hit: false, at: null };
}
export function at(p, k) {
  if (!p.pts.length) return null; if (p.pts.length === 1 || p.len <= 0) return p.pts[0].slice();
  let want = Math.max(0, Math.min(1, k)) * p.len;
  for (let i = 1; i < p.pts.length; i++) { const d = dist(p.pts[i - 1], p.pts[i]); if (want <= d || i === p.pts.length - 1) { const f = d ? Math.min(1, want / d) : 0; return [p.pts[i - 1][0] + (p.pts[i][0] - p.pts[i - 1][0]) * f, p.pts[i - 1][1] + (p.pts[i][1] - p.pts[i - 1][1]) * f]; } want -= d; }
  return p.land.slice();
}
export function edge(mem, key, on) { const was = !!mem[key]; mem[key] = !!on; return !!on && !was; }

/* ---------- THE PAINTER ---------- */
const R = Math.round;
export function drawBeam(g, p, cx, cy, time, o = {}) {
  if (!p || p.pts.length < 2) return;
  const [rgb, core] = BEAM.col[o.kind] || BEAM.col.sun, a0 = o.a == null ? 1 : o.a, sc = q => [R(q[0] - cx) + 0.5, R(q[1] - cy) + 0.5];
  const line = () => { g.beginPath(); const s = sc(p.pts[0]); g.moveTo(s[0], s[1]); for (let i = 1; i < p.pts.length; i++) { const q = sc(p.pts[i]); g.lineTo(q[0], q[1]); } g.stroke(); };
  g.save(); g.globalCompositeOperation = 'lighter';
  if (o.preview) {   /* a PROMISE: a dotted line of light, crawling the way the light will go */
    const n = Math.max(2, R(p.len / BEAM.dot)), off = (time * 2) % 1; g.fillStyle = 'rgba(' + rgb + ',' + (0.7 * a0).toFixed(2) + ')';
    for (let i = 0; i < n; i++) { const q = at(p, (i + off) / n); g.fillRect(R(q[0] - cx) - 1, R(q[1] - cy) - 1, 2, 2); }
  } else {
    g.strokeStyle = 'rgba(' + rgb + ',' + (0.28 * a0).toFixed(2) + ')'; g.lineWidth = BEAM.glow + Math.sin(time * 9) * 0.8; line();
    g.strokeStyle = core; g.globalAlpha = a0; g.lineWidth = BEAM.core; line(); g.globalAlpha = 1;
    for (let i = 0; i < BEAM.glints; i++) { const q = at(p, (time * BEAM.glintV + i / BEAM.glints) % 1); g.fillStyle = core; g.fillRect(R(q[0] - cx) - 1, R(q[1] - cy) - 1, 3, 3); }   /* light running along it: the way it goes */
  }
  if (o.ring && p.land) { const q = sc(p.land), r = 5 + 2 * Math.sin(time * 8); g.strokeStyle = 'rgba(' + rgb + ',' + (0.85 * a0).toFixed(2) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(q[0], q[1], r, 0, Math.PI * 2); g.stroke(); g.fillStyle = core; g.fillRect(q[0] - 1.5, q[1] - 1.5, 3, 3); }
  g.restore();
}
/* the floor marker where a light waits for him: a gold disc on the glass, a chevron over it pointing down, and the word (blinking gold/white) */
export function drawMarker(g, x, y, cx, cy, time, o = {}) {
  const sx = R(x - cx), sy = R(y - cy), bob = R(Math.sin(time * 6) * 2), col = Math.floor(time * 4) % 2 ? '#ffd36b' : '#fff6c8';
  g.save(); g.globalAlpha = 0.55 + 0.25 * Math.sin(time * 5); g.fillStyle = '#ffd36b'; g.fillRect(sx - 12, sy - 2, 24, 2); g.fillRect(sx - 8, sy - 3, 16, 1); g.globalAlpha = 1;
  g.fillStyle = col; for (let i = 0; i < 4; i++) g.fillRect(sx - 3 + i, sy - 20 + bob + i, 7 - 2 * i, 1);
  g.restore();
  if (o.word && o.text) o.text(o.word, sx, sy - 30 + bob, col, 'center', 6);
}
