// src/mirage-kit.js - MIRAGES as level DATA (claude/desertkit 11-05; scratch/plan-desert-1105.md 3c). Pure: no DOM, no main.js.
// Proved by tools/mirage-kit.mjs; the level API is docs/desertkit.md.
//
// THE RULE is src/desert-rules.js's: a mirage is something shimmering that is not there - a ledge, a door, an oasis, a wagon. It fades as you come to it
// (MIRAGE.far 150 -> MIRAGE.near 60 px) and it is NEVER footing (an ent, not a tile: reachcore and moveBody never see it). A REAL thing never shimmers;
// a mirage always does - the tell a player who is looking reads before he walks to it. Until today nothing used it (0 hits in main.js). This kit adds:
//   * kinds: 'ledge' (a fake bridge / step), 'door' (a doorway painted on the haze: walk through it, nothing), 'oasis', 'wagon', 'shade' (a fake shade -
//     it does not cool: sun-kit never reads it); each a tile box;
//   * THE TELL: the shimmer grows as the nearest seat comes within `far` and the thing fades by `near` (co-op: the shared screen fades it for whoever is
//     nearest; it comes back when everyone walks away - a mirage, not a switch);
//   * ONLY IN THE SUN: at night / indoors / in a sandstorm gust there is no mirage (alpha 0) - the sun makes them (sun-kit profiles);
//   * 'seen' bookkeeping (a seat came inside `near` once) for the tutorial line ('A MIRAGE - IT SHIMMERS') said once a level;
//   * THE SHADE STALKER'S LOOK (the plan's SUN-SHADE STALKER, lategame2 SHADE counter, wired by the 11-06 mirage/SHADE lane): stalkerLook() - nearly
//     invisible in the glare, plain in shade, a 0.4 s shimmer before it commits (its told windup);
//   * lintMirages: a mirage is a TRICK, NEVER A TRAP - under a ledge / oasis the fall lands on footing within FALL.rows rows with no spikes, and it can be
//     climbed out of; a real decoy ('real: true') never shimmers; the box is on the map.
//
// L.mirages = [{ id, kind, box: [x0, y0, x1, y1] tiles, far?, near?, real? }]
//   const M = mirageInit(L)                       -> { list: [{ def, px, alpha, shimmer, seen }] }
//   mirageStep(M, dt, { seats, time, profile, gust }) -> events [{ id, ev: 'seen' }]; each entry's alpha (0..1) and shimmer (px) for the draw
//   mirageSolid()                                 -> false, always (the contract: nothing in the kit is ever footing)
//   stalkerLook(exposure, commitT)                -> { alpha, shimmer }
//   lintMirages(L, tileAt)                        -> [] or the problems
import { MIRAGE } from './desert-rules.js';

export const TS = 16;
export const MIRAGEKIT = {
  kinds: ['ledge', 'door', 'oasis', 'wagon', 'shade'],
  shimmerMax: 2,        /* px of sideways waver at the tell's height (desert-rules MIRAGE.shimmer is 1: a little stronger so it reads on a moving screen) */
  fall: { rows: 4 },    /* the lint: the fall under a mirage lands within this many rows */
  stalker: { glare: 0.08, shade: 1, sun: 0.25, commit: 0.4, commitShimmer: 3 },
  noSun: ['night', 'interior'],
};
const pxBox = b => [b[0] * TS, b[1] * TS, (b[2] + 1) * TS, (b[3] + 1) * TS];

export function mirageInit(L) { return { list: (L.mirages || []).map(def => ({ def, px: pxBox(def.box), alpha: 1, shimmer: 0, seen: false })) }; }
/* the distance from a seat to a box (0 inside it) */
const distTo = (z, x, y) => Math.hypot(Math.max(z[0] - x, 0, x - z[2]), Math.max(z[1] - y, 0, y - z[3]));
export function mirageStep(M, dt, { seats = [], time = 0, profile = 'open', gust = false } = {}) {
  const ev = [], sun = !MIRAGEKIT.noSun.includes(profile) && !gust, live = seats.filter(p => p && !p.dead);
  for (const m of M.list) {
    if (m.def.real) { m.alpha = 1; m.shimmer = 0; continue; }   /* a REAL thing never shimmers */
    if (!sun) { m.alpha = 0; m.shimmer = 0; continue; }
    const far = m.def.far ?? MIRAGE.far, near = m.def.near ?? MIRAGE.near;
    const d = live.length ? Math.min(...live.map(p => distTo(m.px, p.x, p.y - 7))) : Infinity;
    m.alpha = d >= far ? 1 : d <= near ? 0 : (d - near) / (far - near);
    const tell = d >= far ? 0.35 : 0.35 + 0.65 * (1 - m.alpha);   /* always a little shimmer (the read from afar), stronger as you come */
    m.shimmer = Math.sin(time * 9 + m.px[0] * 0.05) * MIRAGEKIT.shimmerMax * tell;
    if (!m.seen && d <= near) { m.seen = true; ev.push({ id: m.def.id, ev: 'seen', kind: m.def.kind }); }
  }
  return ev;
}
export const mirageSolid = () => false;
/* THE SHADE STALKER: in the glare (open sun) a faint outline, plain in shade, partly in plain sun; it SHIMMERS for commit s before it strikes */
export function stalkerLook(exposure, commitT = 0) {
  const S = MIRAGEKIT.stalker, base = exposure === 'shade' || exposure === 'none' || exposure === 'water' ? S.shade : exposure === 'hot' ? S.glare : S.sun;
  const c = commitT > 0 ? Math.min(1, commitT / S.commit) : 0;
  return { alpha: Math.max(base, c * 0.6), shimmer: c > 0 ? S.commitShimmer * (1 - c * 0.5) : 0, telling: c > 0 };
}
/* THE LEVEL CHECK: a trick, never a trap */
export function lintMirages(L, tileAt, o = {}) {
  const bad = [], W = L.w || L.W || 1e9, H = L.h || L.H || 1e9, ids = new Set(), standable = o.standable || (t => t === 1 || t === 2), solid = o.solid || (t => t === 1), spike = o.spike || (t => t === 3);
  for (const d of L.mirages || []) {
    const id = d.id || '?', b = d.box; if (!d.id || ids.has(d.id)) bad.push('mirage needs a unique id: ' + id); ids.add(d.id);
    if (!MIRAGEKIT.kinds.includes(d.kind)) bad.push(id + ': kind ' + d.kind);
    if (!Array.isArray(b) || b.length !== 4 || b[0] > b[2] || b[1] > b[3] || b[0] < 0 || b[1] < 0 || b[2] >= W || b[3] >= H) { bad.push(id + ': box off the map'); continue; }
    if (d.real && (d.far || d.near)) bad.push(id + ': a real thing has no shimmer numbers');
    if ((d.near ?? MIRAGE.near) >= (d.far ?? MIRAGE.far)) bad.push(id + ': near must be under far');
    if (!tileAt || d.real) continue;
    if (d.kind === 'ledge' || d.kind === 'oasis') for (let x = b[0]; x <= b[2]; x++) {   /* walk off it: where do you land? */
      let land = -1; for (let y = b[3] + 1; y <= Math.min(H - 1, b[3] + MIRAGEKIT.fall.rows + 1); y++) { const t = tileAt(x, y); if (spike(t)) { bad.push(id + ': spikes under it at ' + x + ',' + y); break; } if (standable(t)) { land = y; break; } }
      if (land < 0) bad.push(id + ': the fall under ' + x + ' does not land within ' + MIRAGEKIT.fall.rows + ' rows');
      else if (land - b[3] - 1 > 3) bad.push(id + ': a fall at ' + x + ' too deep to climb out');
    }
    if (d.kind === 'door') { let walk = false; for (let y = b[1]; y <= b[3]; y++) if (!solid(tileAt(b[0], y))) walk = true; if (!walk) bad.push(id + ': a mirage door set in rock (it must be walked through)'); }
  }
  return bad;
}
