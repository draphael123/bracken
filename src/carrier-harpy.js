// src/carrier-harpy.js - THE CARRIER HARPY, a SHARED FOE MODULE (claude/harpypass, 2026-11-05; Daniel 11-02 21:49: "HARPY-CARRY sections: concept OK but unclear/awkward (now a
// harpy must fall / be hit before it carries you). NEW FOE: a PERCHED CARRIER HARPY - visibly hanging out, you JUMP ON IT and it FLIES YOU ACROSS (no damage needed); reusable in
// other levels"). THE ROOKERY is her first home (every CATCH A RIDE there is hers now: src/rookery-hands.js); she knows nothing about the rookery - a level gives her a PERCH (the
// cell she sits on, e.hx/e.hy) and a FLIGHT (the points her body flies through, from her perch to where she sets you down) and calls carryStep(e, dt) every frame.
//
// WHAT SHE IS: a big, slow, tame-ish crag harpy who SITS ON HER PERCH (wings folded, head turning, a gold saddle-glint on her back when a hero is near) by a gap or a face no jump
//   crosses. She never attacks and never needs knocking down.
//   perch    she sits. A hero who LANDS ON HER BACK (falling onto her: boards()) - or presses UP beside her (grabs(), the same as the old talon grab) - is aboard.
//   carry    she flies her fixed flight (the dotted feather trail the level draws FIRST, from her perch to a landing ring) at CARRY.v px/s (CARRY.minT..maxT s in all) with the
//            hero standing on her back (riderAt). JUMP lets go (a normal hop, full air control). A wind shoves her off line (e.cOff, it springs back: CARRY.spring).
//   home     at the ring she sets him down (on his feet) and flies her flight back, empty, CARRY.homeK x faster, and sits again (CARRY.rest s before she takes another).
// She cannot be ridden by two at once (co-op: the second waits for her to come home). A hard blow startles her (she flaps up a beat and settles: CARRY.startle s) but she never
// dies of it (a level may still spawn another if something kills her outright).
// API: CARRY, CARRY_SAY, newCarrier(o), boards(e, h), grabs(e, h), board(e, pts), carryStep(e, dt) -> 'landed' on the frame she reaches the ring, riderAt(e), along(pts, k).
export const CARRY = { v: 104, minT: 1.5, maxT: 3.6, under: 9, reach: 15, top: 18, homeK: 1.35, rest: 0.6, bob: 1.5, spring: 3, startle: 0.6, near: 40 };
export const CARRY_SAY = { perch: 'A CARRIER HARPY: JUMP ON HER BACK', aboard: 'SHE FLIES YOU ACROSS: JUMP LETS GO', set: 'SHE SETS YOU DOWN', letGo: 'YOU LET GO', knocked: 'KNOCKED OFF HER BACK' };
export function newCarrier(o = {}) { return { cMode: 'perch', cT: 0, cRest: 0, cOff: [0, 0], cPts: null, cN: { rides: 0, set: 0, letGo: 0, knocked: 0, home: 0, startled: 0 }, ...o }; }
/* a point along a polyline, k 0..1: [x, y, total length] */
export function along(pts, k) { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let t = k * tot; for (let i = 1; i < pts.length; i++) { if (t <= L[i - 1] || i === pts.length - 1) { const q = L[i - 1] ? Math.min(1, t / L[i - 1]) : 1; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q, tot]; } t -= L[i - 1]; }
  return [pts[pts.length - 1][0], pts[pts.length - 1][1], tot]; }
const ready = e => e.cMode === 'perch' && !(e.cRest > 0) && !(e.cStartle > 0);
/* a hero FALLING ONTO HER BACK (h: { x, y (feet), vy, ground }) */
export const boards = (e, h) => ready(e) && !h.ground && (h.vy || 0) >= 0 && Math.abs(h.x - e.x) < CARRY.reach && h.y >= e.y - CARRY.top && h.y <= e.y + 4;
/* a hero beside her pressing UP (or GRAB) */
export const grabs = (e, h) => ready(e) && Math.abs(h.x - e.x) < CARRY.reach + 6 && h.y - e.y > -CARRY.top && h.y - e.y < 22;
/* where the rider's feet stand: on her back */
export const riderAt = e => [e.x, e.y - CARRY.under];
/* aboard: pts = her flight (her body's points, her perch first) */
export function board(e, pts) { e.cMode = 'carry'; e.cT = 0; e.cPts = pts; e.cOff = [0, 0]; const tot = along(pts, 1)[2]; e.cTT = Math.max(CARRY.minT, Math.min(CARRY.maxT, tot / CARRY.v)); e.cN.rides++; }
export function carryStep(e, dt) {
  e.anim = e.anim || 0; e.cRest = Math.max(0, (e.cRest || 0) - dt); e.cStartle = Math.max(0, (e.cStartle || 0) - dt);
  const o = e.cOff || (e.cOff = [0, 0]); o[0] -= o[0] * Math.min(1, dt * CARRY.spring); o[1] -= o[1] * Math.min(1, dt * CARRY.spring);
  if (e.cMode === 'carry') { e.cT += dt; const k = Math.min(1, e.cT / e.cTT), [x, y] = along(e.cPts, k); e.face = Math.sign(x - e.x) || e.face; e.x = x + o[0]; e.y = y + o[1]; e.mode = 'carry';
    if (k >= 1) { e.cMode = 'home'; e.cT = 0; e.cN.set++; return 'landed'; } return null; }
  if (e.cMode === 'home') { e.cT += dt; const k = Math.min(1, e.cT / (e.cTT / CARRY.homeK)), [x, y] = along(e.cPts, 1 - k); e.face = Math.sign(x - e.x) || e.face; e.x = x + o[0]; e.y = y + o[1]; e.mode = 'fly';
    if (k >= 1) { e.cMode = 'perch'; e.cRest = CARRY.rest; e.cN.home++; e.x = e.hx; e.y = e.hy; } return null; }
  /* perch: she sits (a hard blow: she flaps up a beat and settles) */
  if (e.stagger > 0 && !(e.cStartle > 0)) { e.cStartle = CARRY.startle; e.cN.startled++; e.stagger = 0; }
  e.mode = e.cStartle > 0 ? 'fly' : 'perch'; e.x = e.hx + o[0]; e.y = e.hy - (e.cStartle > 0 ? 8 * Math.sin(Math.PI * e.cStartle / CARRY.startle) : Math.abs(Math.sin(e.anim * 1.4)) * CARRY.bob) + o[1];
  return null;
}
