// src/carry-throw.js - A TOLD THROW (claude/underwell2, Daniel 10-06: "TORCHES = PICK UP + THROW"). The small, self-contained half of carrying a
// thing and throwing it that every level can share: WHERE IT WILL GO before you let go. It knows nothing about torches, oil or levels - it is
// the aim (three heights, picked by UP / DOWN / neither, the way the hero faces), the arc stepped against the tiles, and the picture of that arc
// with a ring where it lands. The thing itself stays the caller's (src/underwell-hands.js's torch is the first; scratch/brief-throw.md's
// game-wide THROW lane is meant to reuse this file for a carried partner, a staggered foe, a bucket or a pot).
//
// THE API (all pure but the two draw helpers, which take a 2D context):
//   KINDS[kind]                          a kind's numbers: aims { low, mid, high } as { vx, vy } px/s (vy < 0 is up), g px/s^2, r (its own half-size
//                                        for hitting walls), ring (the landing ring's radius), dots (how many dots the told arc shows)
//   addKind(kind, def)                   a lane adds its own kind (a row, not a second system)
//   aimOf(kind, face, keys)              -> { vx, vy, aim }   UP held = 'high' (a lob), DOWN held = 'low' (a short toss), neither = 'mid'
//   launchOf(kind, P, keys)              -> { vx, vy }        what main.js's throwCarry wants from a carried thing's `launch(P)` hook
//   predictArc(kind, x, y, v, solidAt, o) -> { pts: [[x, y], ...], land: { x, y, t, wall } | null }
//                                        steps the arc at o.dt (1/60) for o.maxT (2.2 s) from the hand (x, y) at v ({ vx, vy }); solidAt(px, py, falling)
//                                        answers whether a point is inside something the thing stops on (a falling thing may stop on a ledge top).
//                                        o.stopAt(px, py) may end it early on a target (a foe, a nest) - land.hit is then its answer
//   stepArc(o, dt, g)                    one step of a flying thing { x, y, vx, vy } (the same integration predictArc uses, so the told arc IS the flight)
//   drawArc(g2d, arc, cx, cy, time, col) the told arc (dots that march toward the landing) and a pulsing landing ring - drawn OVER the dark pass
//   drawRing(g2d, x, y, r, time, col)    the ring alone
// THE RULE IT KEEPS: the arc you are shown is the arc it flies (tools/underwell.mjs: a thrown torch lands within a tile of the ring, every hero).
export const KINDS = {
  torch: { aims: { low: { vx: 100, vy: -110 }, mid: { vx: 170, vy: -175 }, high: { vx: 125, vy: -285 } }, g: 600, r: 3, ring: 9, dots: 14 },
  /* (claude/burnvillage2) THE BURNING VILLAGE's water: its mid aim is the throw it always had (src/throwables.js THROW_KIND: the bucket flat and fast,
     the jug a lob), UP lobs over a fire to the one behind it, DOWN tosses it short at your feet. g is THROW_KIND's own, so the arc told is the arc flown */
  bucket: { aims: { low: { vx: 120, vy: -40 }, mid: { vx: 210, vy: -70 }, high: { vx: 150, vy: -240 } }, g: 520, r: 4, ring: 12, dots: 14 },
  jug: { aims: { low: { vx: 110, vy: -90 }, mid: { vx: 190, vy: -150 }, high: { vx: 140, vy: -285 } }, g: 600, r: 3, ring: 9, dots: 14 },
};
export const addKind = (kind, def) => { KINDS[kind] = def; return def; };
export function aimOf(kind, face, keys) {
  const k = KINDS[kind] || KINDS.torch, aim = keys && keys.up ? 'high' : keys && keys.down ? 'low' : 'mid', a = k.aims[aim];
  return { vx: (face || 1) * a.vx, vy: a.vy, aim };
}
export const launchOf = (kind, P, keys) => { const a = aimOf(kind, P.face || 1, keys); return { vx: a.vx, vy: a.vy }; };
export function stepArc(o, dt, g) { o.vy += g * dt; o.x += o.vx * dt; o.y += o.vy * dt; return o; }
export function predictArc(kind, x, y, v, solidAt, o = {}) {
  const k = KINDS[kind] || KINDS.torch, dt = o.dt || 1 / 60, maxT = o.maxT || 2.2, q = { x, y, vx: v.vx, vy: v.vy }, pts = [[x, y]];
  for (let t = dt; t <= maxT; t += dt) {
    const px = q.x, py = q.y; stepArc(q, dt, k.g);
    if (o.stopAt) { const hit = o.stopAt(q.x, q.y); if (hit) { pts.push([q.x, q.y]); return { pts, land: { x: q.x, y: q.y, t, wall: false, hit } }; } }
    if (solidAt(q.x + Math.sign(q.vx) * k.r, py, false) && !solidAt(px, py, false)) { pts.push([px, py]); return { pts, land: { x: px, y: py, t, wall: true } }; }   /* a wall: it stops against it and drops */
    if (q.vy < 0 && solidAt(q.x, q.y - k.r, false)) { q.vy = 0; }                                                                                                  /* a ceiling: it stops rising */
    if (q.vy >= 0 && solidAt(q.x, q.y + k.r, true)) { pts.push([q.x, q.y]); return { pts, land: { x: q.x, y: q.y, t, wall: false } }; }
    pts.push([q.x, q.y]);
  }
  return { pts, land: null };
}
export function drawRing(g, x, y, r, time, col) {
  const p = 0.5 + 0.5 * Math.sin(time * 7), R = Math.round;
  g.save(); g.globalAlpha = 0.55 + 0.35 * p; g.strokeStyle = col; g.lineWidth = 1;
  g.beginPath(); g.ellipse(R(x) + 0.5, R(y) - 1.5, r + p * 2, (r + p * 2) * 0.38, 0, 0, Math.PI * 2); g.stroke();
  g.globalAlpha = 0.3 + 0.3 * p; g.fillStyle = col; g.fillRect(R(x) - 1, R(y) - 3, 2, 2); g.restore();
}
export function drawArc(g, arc, cx, cy, time, col) {
  if (!arc || !arc.pts || arc.pts.length < 2) return; const k = KINDS.torch, n = arc.pts.length, R = Math.round;
  const step = Math.max(1, Math.floor(n / (k.dots || 14))), off = Math.floor((time * 10) % step);
  g.save(); g.fillStyle = col;
  for (let i = step + off; i < n - 1; i += step) { const [x, y] = arc.pts[i]; g.globalAlpha = 0.35 + 0.5 * (i / n); g.fillRect(R(x - cx) - 1, R(y - cy) - 1, 2, 2); }
  g.restore();
  if (arc.land) drawRing(g, arc.land.x - cx, arc.land.y - cy + (arc.land.wall ? 0 : 3), k.ring, time, col);
}
