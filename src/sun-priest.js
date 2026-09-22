// src/sun-priest.js — THE SUN PRIEST's kit as logic, on src/light.js (pure: no DOM, no main.js). Design: docs/sun-priest-design.md.
// Proved by tools/sun-priest.mjs. Not wired in: the class batch hangs this on the hero contract (HEROES / TBR in main.js).
//
// HE FIGHTS WITH THE LIGHT IN THE ROOM.
//   RADIANCE   a 0..1 bar: fills standing in a lit tile (the sun, any beam - his own too - a consecrated patch, a lamp), drains in the
//              dark. His blows and beam are x0.75 empty .. x1.15 full.
//   THE BEAM   (hold X) a real light SOURCE from his tile along the row (UP: the column). It lights the dark, powers sun-doors and
//              plates, and the rooms' mirrors turn it. It burns the dead hard and the living a little.
//   CONSECRATE (tap C) a 3-tile patch of sunlight on the floor for 6 s: mends him, burns the dead on it, lights it. A third of the bar.
//   THE FLARE  (hold C) stops every wind-up within 3 tiles. Half the bar. Never the same foe twice in 8 s (no locking a boss).
//   SUNRISE    (full bar + C) 6 s of the whole screen in the light: everything visible, his beam burning double.
//   SUNFALL    (the plunge) a 2-tile ring of light where he lands, a patch for 2 s.
// THE ONE HARD RULE: his light is not the SUN. Doors, plates, sight, burning: everything answers to his beam; THE SKELETON KING's
// opening answers only to the sun. `lights(...)` returns both traces: give kingStep `sun`, never `all`.
import { trace, litBox, LIGHT } from './light.js';

export const PRIEST = {
  hp: 85,
  rad: { fill: 1 / 6, drain: 1 / 20, lo: 0.75, hi: 1.15 },
  beam: { plant: 20, dead: 22, living: 6 },
  consecrate: { cost: 1 / 3, half: 1, t: 6, mend: 4, burn: 12 },                 // half: tiles either side of the middle one (3 tiles)
  flare: { cost: 0.5, r: 3 * 16, lock: 8, dazzle: 0.8 },
  sunrise: { t: 6, beamMult: 2 },
  sunfall: { half: 1, t: 2 },
};
const key = (x, y) => x + ',' + y;
export function newPriest(x, y) { return { x, y, w: 10, h: 14, hp: PRIEST.hp, rad: 0, face: 1, beam: null, patches: [], locks: new Map(), sunrise: 0, clock: 0 }; }
export const tileOf = P => ({ x: Math.floor(P.x / 16), y: Math.floor((P.y - 1) / 16) });
export const radMult = P => PRIEST.rad.lo + (PRIEST.rad.hi - PRIEST.rad.lo) * P.rad;

// ---- the light he makes ----
export function beamOn(P, up = false) { P.beam = { dir: up ? 'N' : (P.face > 0 ? 'E' : 'W') }; return P.beam; }
export const beamOff = P => { P.beam = null; };
export function priestSources(P) { if (!P.beam) return []; const t = tileOf(P); return [{ x: t.x, y: t.y, dir: P.beam.dir, kind: 'priest' }]; }
function patchAt(P, half, t, kind) { const c = tileOf(P); P.patches.push({ x0: c.x - half, x1: c.x + half, y: c.y, t, kind }); }
export function consecrate(P) { const C = PRIEST.consecrate; if (P.rad < C.cost - 1e-9) return false; P.rad -= C.cost; patchAt(P, C.half, C.t, 'consecrate'); return true; }
export function sunfall(P) { patchAt(P, PRIEST.sunfall.half, PRIEST.sunfall.t, 'sunfall'); }
export function sunrise(P) { if (P.rad < 1 - 1e-9) return false; P.rad = 0; P.sunrise = PRIEST.sunrise.t; return true; }
/* EVERYTHING LIT. sun: the room's own sources (windows, shafts, the capstone). Returns { sun, all }: `sun` is the sun alone (what the
   Skeleton King answers to); `all` adds his beam, his patches, and (in SUNRISE) every tile, and is what doors, sight and burning use. */
export function lights(tileAt, sunSources, mirrors, receivers, opts, P) {
  const sun = trace(tileAt, sunSources, mirrors, receivers, opts);
  const mine = trace(tileAt, [...sunSources, ...priestSources(P)], mirrors, receivers, opts);
  for (const p of P.patches) for (let x = p.x0; x <= p.x1; x++) mine.lit.add(key(x, p.y));
  if (P.sunrise > 0) mine.everywhere = true;
  return { sun, all: mine };
}
export const lit = (res, box) => !!res.everywhere || litBox(res, box);
export const bodyBox = b => [b.x - b.w / 2, b.x + b.w / 2, b.y - b.h, b.y];

// ---- each frame ----
/* RADIANCE and the timers. `res` is lights(...).all. Returns what happened to him (mended). */
export function stepPriest(P, res, dt) {
  const inLight = lit(res, bodyBox(P));
  P.rad = Math.max(0, Math.min(1, P.rad + (inLight ? PRIEST.rad.fill : -PRIEST.rad.drain) * dt));
  const onPatch = P.patches.some(p => { const t = tileOf(P); return t.y === p.y && t.x >= p.x0 && t.x <= p.x1; });
  const mend = (onPatch || P.sunrise > 0) ? PRIEST.consecrate.mend * dt : 0; P.hp = Math.min(PRIEST.hp, P.hp + mend);
  for (const p of P.patches) p.t -= dt; P.patches = P.patches.filter(p => p.t > 0);
  P.sunrise = Math.max(0, P.sunrise - dt); P.clock += dt;
  return { inLight, mend };
}
/* his BEAM on a body this frame: is the body in the beam's own light, and how much does it take */
export function beamDamage(P, tileAt, mirrors, opts, body, dt) {
  if (!P.beam) return 0;
  const r = trace(tileAt, priestSources(P), mirrors, [], opts); if (!litBox(r, bodyBox(body))) return 0;
  return (body.undead ? PRIEST.beam.dead : PRIEST.beam.living) * radMult(P) * (P.sunrise > 0 ? PRIEST.sunrise.beamMult : 1) * dt;
}
/* a CONSECRATED patch (or sunfall) burns the dead standing on it */
export function patchBurn(P, body, dt) {
  if (!body.undead) return 0; const bx0 = Math.floor((body.x - body.w / 2) / 16), bx1 = Math.floor((body.x + body.w / 2 - 0.01) / 16), by = Math.floor((body.y - 1) / 16);
  return P.patches.some(p => p.y === by && bx1 >= p.x0 && bx0 <= p.x1) ? PRIEST.consecrate.burn * dt : 0;
}
/* THE FLARE: cancel every wind-up within reach. foes: [{ id, x, y, winding: bool }]; cancel(foe) is called for each one stopped.
   A foe stopped in the last 8 s is not stopped again (it sees it coming). */
export function flare(P, foes, cancel) {
  const F = PRIEST.flare; if (P.rad < F.cost - 1e-9) return null; P.rad -= F.cost; const stopped = [];
  for (const f of foes) { if (!f.winding || Math.abs(f.x - P.x) > F.r || Math.abs((f.y ?? P.y) - P.y) > F.r) continue;
    const last = P.locks.get(f.id); if (last !== undefined && P.clock - last < F.lock) continue;
    P.locks.set(f.id, P.clock); cancel(f); stopped.push(f.id); }
  return stopped;
}
/* THE SKELETON KING and his beam: the beam CHIPS him (through his armour) and never opens him. The wiring the build must copy. */
export function kingBeam(K, P, tileAt, mirrors, opts, dt, kingHurt, kingBox) {
  if (!P.beam) return 0; const r = trace(tileAt, priestSources(P), mirrors, [], opts); const [l, rr, t, b] = kingBox(K);
  if (!litBox(r, [l, rr, t, b])) return 0;
  return kingHurt(K, PRIEST.beam.dead * radMult(P) * (P.sunrise > 0 ? PRIEST.sunrise.beamMult : 1) * dt);
}
export { LIGHT };
