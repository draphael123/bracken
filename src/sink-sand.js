// src/sink-sand.js - SINKING SAND as level DATA, for every body (claude/desertkit 11-05; scratch/plan-desert-1105.md 3e). Pure: no DOM, no main.js.
// Proved by tools/sink-sand.mjs; the level API is docs/desertkit.md.
//
// NOT A NEW QUICKSAND. A hero in a pit runs src/quicksand.js's qsStep exactly (held, sinks to chest-deep and never under, JUMP AND KEEP JUMPING heaves
// you out; it never kills, never drowns; the player's clock - qsGameStep). Today main.js reads L.quicksand for the heroes only and the foes just stop at
// its edge (cvGround). This kit adds:
//   * DUNE SAND (mode 'dune': THE GREAT DUNE's "stop and you sink"): you run over it as footing; slow under STOP.keep of the run for STOP.grace s and it
//     takes you - from then on it is a pit (the same verb gets you out). Told: the sand ripples round your feet from the first slow frame (stopRipple);
//   * FOES in the sand: a walker that steps in is HELD (it cannot walk; it can still strike - a held foe is not a stunned one, B-rules), sinks on its
//     own weight, and climbs out after FOE.out s (heavy x2) on the side it faces; SAND KIN (scorpions, the Dune Worm, the sand grasper, skiff riders,
//     anything flying) never sink: they are the desert's own;
//   * every SEAT its own depth (b.qsDepth, quicksand.js's own field) - co-op safe; the dead are let go;
//   * lintSinkSand: depth never over a body, a jump out lands on footing on both sides, no spikes in reach, every patch on the map.
//
// L.sinkSand = [{ id, x0, x1, y, mode: 'pit' | 'dune' }]  tiles: x0..x1 inclusive, y = the surface row (AIR in the grid, rock under it).
//   const K = sinkInit(L)                      -> { patches: [{ def, q }] } (q in quicksand.js's px shape { x0, x1, y })
//   sinkAt(K, x, y)                            -> the patch under the feet at (x, y), or null
//   sinkHero(b, K, dt, input, speed?)          -> { held, depth, out, footing, ripple }  input = { move, jumpPress }; speed = Game speed (player's clock)
//   sinkFoe(e, K, dt, o?)                      -> { held, depth, out }   o.heavy, o.kin (or e.sandKin / SAND_KIN by e.t)
//   sinkBodies(K, heroes, foes, dt, io)        -> runs both for every body; io.input(b) -> { move, jumpPress }
//   lintSinkSand(L, tileAt)                    -> [] or the problems
import { QS, qsStep } from './quicksand.js';

export const TS = 16;
export const STOP = { keep: 0.45, grace: 0.35 };   /* DUNE SAND: under 45% of the run (92 px/s) for 0.35 s and it takes you */
export const FOE = { sink: 0.8, out: 2.4, heavyOut: 2, lift: -230 };   /* foes sink at 0.8 of QS.sink; climb out after 2.4 s (heavy x2) */
export const SAND_KIN = new Set(['scorpion', 'dunescorp', 'duneworm', 'sandgrasper', 'skiff', 'skiffbandit', 'vulture', 'hawk', 'bat', 'wisp', 'wyrmling', 'djinn']);
export const RUN = 92;

export function sinkInit(L) {
  return { patches: (L.sinkSand || []).map(def => ({ def, mode: def.mode || 'pit', q: { x0: def.x0 * TS, x1: (def.x1 + 1) * TS, y: def.y * TS } })) };
}
export function sinkAt(K, x, y) {
  for (const p of K.patches) if (x >= p.q.x0 && x <= p.q.x1 && y >= p.q.y - 0.5 && y <= p.q.y + QS.maxDepth + 2) return p;
  return null;
}
/* A HERO (any seat): a pit is quicksand.js as it is; dune sand is footing while you keep moving */
export function sinkHero(b, K, dt, input = {}, speed = 1) {
  const p = sinkAt(K, b.x, b.y), rdt = dt / (speed > 0 ? speed : 1);   /* the player's clock (quicksand.js, Daniel 09-24 decision A) */
  if (!p) { b.qsDepth = 0; b.duneSlow = 0; return { held: false, depth: 0, out: false, footing: false, ripple: 0 }; }
  if (p.mode === 'dune' && !(b.qsDepth > 0)) {
    const slow = Math.abs(b.vx || 0) < STOP.keep * RUN;
    b.duneSlow = slow ? (b.duneSlow || 0) + rdt : 0;
    if (b.duneSlow < STOP.grace || (b.vy || 0) < 0) {   /* running (or jumping off it): it is footing */
      if ((b.vy || 0) >= 0) { b.y = p.q.y; b.vy = 0; }
      return { held: false, depth: 0, out: false, footing: true, ripple: slow ? b.duneSlow / STOP.grace : 0 };
    }
    b.qsDepth = 0.5;   /* it has you: from here it is a pit */
  }
  const r = qsStep(b, p.q, rdt, input);
  if (r.out) b.duneSlow = 0;
  return { ...r, footing: false, ripple: r.held ? 1 : 0 };
}
const kinOf = (e, o) => o.kin ?? (e.sandKin || SAND_KIN.has(e.t) || e.flying);
/* A FOE: held (no walk), sinking on its weight to QS.maxDepth, out after FOE.out s on the side it faces. Never killed by it. */
export function sinkFoe(e, K, dt, o = {}) {
  if (!e || e.alive === false || kinOf(e, o)) { if (e) e.qsDepth = 0; return { held: false, depth: 0, out: false }; }
  const p = sinkAt(K, e.x, e.y);
  if (!p) { e.qsDepth = 0; e.sandT = 0; return { held: false, depth: 0, out: false }; }
  if (p.mode === 'dune' && !(e.qsDepth > 0) && Math.abs(e.vx || 0) >= STOP.keep * RUN) { e.y = p.q.y; return { held: false, depth: 0, out: false }; }
  const heavy = o.heavy ?? !!e.heavy;
  e.sandT = (e.sandT || 0) + dt;
  if (e.sandT >= FOE.out * (heavy ? FOE.heavyOut : 1)) {   /* it hauls itself out, the way it faces */
    const face = Math.sign(e.face || e.dir || 1) || 1; e.x = face > 0 ? p.q.x1 + 6 : p.q.x0 - 6; e.y = p.q.y; e.vy = FOE.lift; e.qsDepth = 0; e.sandT = 0;
    return { held: false, depth: 0, out: true };
  }
  const d = Math.min(QS.maxDepth, (e.qsDepth || 0) + QS.sink * FOE.sink * (heavy ? 1.4 : 1) * dt);
  e.qsDepth = d; e.y = p.q.y + d; e.vx = 0; e.vy = 0; e.sandHeld = true;
  return { held: true, depth: d, out: false };
}
export function sinkBodies(K, heroes, foes, dt, io = {}) {
  const res = new Map();
  for (const b of heroes) { if (b.dead) { b.qsDepth = 0; continue; } res.set(b, sinkHero(b, K, dt, io.input ? io.input(b) : {}, io.speed || 1)); }
  for (const e of foes || []) { const r = sinkFoe(e, K, dt, io.foe ? io.foe(e) : {}); if (!r.held) e.sandHeld = false; res.set(e, r); }
  return res;
}
/* THE LEVEL CHECK: a body is never under (maxDepth < a hero's height), the jump out lands on footing each side, no spikes beside, on the map */
export function lintSinkSand(L, tileAt, o = {}) {
  const bad = [], W = L.w || L.W || 1e9, H = L.h || L.H || 1e9, ids = new Set(), solid = o.solid || (t => t === 1), spike = o.spike || (t => t === 3), air = o.air || (t => t === 0);
  const standable = o.standable || (t => t === 1 || t === 2);
  if (QS.maxDepth >= 14) bad.push('QS.maxDepth ' + QS.maxDepth + ' would put a hero under');
  for (const d of L.sinkSand || []) {
    const id = d.id || '?'; if (!d.id || ids.has(d.id)) bad.push('sink patch needs a unique id: ' + id); ids.add(d.id);
    if (!['pit', 'dune'].includes(d.mode || 'pit')) bad.push(id + ': mode ' + d.mode);
    if (d.x0 > d.x1 || d.x0 < 1 || d.x1 >= W - 1 || d.y < 1 || d.y >= H - 1) { bad.push(id + ': off the map'); continue; }
    if (!tileAt) continue;
    for (let x = d.x0; x <= d.x1; x++) { if (!air(tileAt(x, d.y))) bad.push(id + ': surface tile ' + x + ' is not air'); if (!solid(tileAt(x, d.y + 1))) bad.push(id + ': no rock under ' + x); }
    for (const x of [d.x0 - 1, d.x1 + 1]) { let ok = false; for (let y = d.y - 1; y <= d.y + 1; y++) if (standable(tileAt(x, y)) && !solid(tileAt(x, y - 1))) ok = true;
      if (!ok) bad.push(id + ': no footing to jump out onto at ' + x); }
    for (let x = d.x0 - 3; x <= d.x1 + 3; x++) for (let y = d.y - 2; y <= d.y + 1; y++) if (spike(tileAt(x, y))) bad.push(id + ': spikes in reach at ' + x + ',' + y);
  }
  return bad;
}
