// src/fallen-pillar.js - A FALLEN PILLAR NEVER TRAPS ANYONE (claude/undercrown3; Daniel 11-04 15:32: "FALLEN PILLARS TRAP PLAYER + BOSS - you get
// stuck under/behind them, or the Buried Prince does, and you just wait around. FIX: every fallen pillar is traversable - heroes can go OVER (hop up,
// one-way top) or UNDER (crawl/slide gap) it, and THE BOSS can too (told vault/hop over or duck under) UNLESS he is STUNNED").
// PURE: no DOM, no main.js globals - node tools fly the game's own collision (src/slopes.js) over what this file builds.
//
// What a slab of THE UNDERCROWN does when it comes down (src/undercrown-slabs.js decides WHERE; this file decides what it IS once it is down):
//   DOWN FLAT ON A FLOOR  (it was a wall across the gallery) it comes to rest on its own rubble ONE ROW UP: a SHELF. Every course of it is a
//                         one-way top (hop onto it from anywhere; a jump from under it comes up through it), and the row under it is a CRAWL GAP
//                         (16 px: every hero stands 14, ducked 8 - src/duck.js). Nothing walks INTO it: a one-way course has no sides.
//   DOWN FLAT OVER A GAP  (the bridge) as it was - it rests on both banks - but its TOP course is one-way, so it is hopped onto from a bank below it.
//   SWUNG DOWN (a ramp)   the slope tiles stay (it is walked up), but a body UNDER the ramp's surface reads it as air: the wedge under it is never a
//                         ceiling or a wall, so it is walked out of at either end, and DOWN + JUMP on it drops through (like a board).
// THE BURIED PRINCE crosses the same pillars (princeCross): a told HOP onto a shelf (he walks its top and steps off the far end), a told DUCK under a
// ramp (he goes through it bent double). A pinned, reeling or scorched Prince does NOT move (princeStays): that is the opening, not a trap.
// THE WATCHDOG (stuckStep): anyone who wants to move, is not held, and has not moved for STUCK_T seconds is stuck - the lab counts it and the game
// lets him through (the failsafe is a ghost step, never a teleport).
import { T, TS } from './level.js';
import { flatFor, supportBelow } from './undercrown-slabs.js';
import { isSlope, surfaceY } from './slopes.js';

export const FALLEN = {
  GAP: 1,            // rows of crawl gap under a shelf
  HOP_TELL: 0.28,    // s: the Prince's crouch before the hop (pose + sound: told)
  HOP_VY: -360,      // his hop: a 60 px-tall body onto a three-row shelf (apex 65 px)
  HOP_VX: 70,
  DUCK_TELL: 0.22,   // s: bent double before he goes under a ramp
  DUCK_VX: 38,       // px/s: under a ramp he goes slowly (he is open the whole time - a slow cross, not a dodge)
  LOOK: 22,          // px ahead of his leading edge he reads for a pillar
  STUCK_T: 2,        // s without progress (wanting to move, not held) = stuck (Daniel: "no dead time")
  GHOST_T: 0.6,      // s of the failsafe's ghost step
};

/* THE FLAT DROP, REST: what a slab that came down flat leaves. Same landing as flatFor; a floor landing becomes a SHELF on a crawl gap.
   tileAt must read the slab's own course as air (the caller has cleared it). Returns { cells: [[x, y, t]], row, land, deep, kind } or null. */
export function restFor(tileAt, slab) {
  const f = flatFor(tileAt, slab); if (!f) return null;
  let floorAll = true;
  for (let x = slab.x0; x <= slab.x1; x++) if (supportBelow(tileAt, x, slab.row, 60) !== f.land) { floorAll = false; break; }
  if (!floorAll) return { ...f, kind: 'bridge', cells: f.cells.map(([x, y, t]) => [x, y, y === f.row ? T.ONEWAY : t]) };
  const top = f.land - FALLEN.GAP - f.deep, cells = [];
  for (let y = top; y < f.land - FALLEN.GAP; y++) for (let x = slab.x0; x <= slab.x1; x++) {
    if (tileAt(x, y) !== T.AIR) return { ...f, kind: 'bridge', cells: f.cells.map(([cx, cy, t]) => [cx, cy, cy === f.row ? T.ONEWAY : t]) };   /* (no room for the gap: it lies as it falls, top course one-way) */
    cells.push([x, y, T.ONEWAY]); }
  return { cells, row: top, land: f.land, deep: f.deep, kind: 'shelf', gapRow: f.land - 1 };
}

/* A BODY'S VIEW OF THE FALLEN CELLS. cells: Map(index -> kind) of every cell a fallen slab put down (W = the level's width in tiles).
   o.drop: DOWN + JUMP or the RUNNING SLIDE (a ramp drops you through as a board does; the slide goes in under its foot); o.ghost: the Prince mid-duck (or the failsafe): fallen cells are air to him. */
export function fallenView(ta, W, cells, b, o = {}) {
  if (!cells || !cells.size) return ta;
  return (tx, ty) => {
    const t = ta(tx, ty);
    if (!cells.has(ty * W + tx)) return t;
    if (o.ghost) return T.AIR;
    if (isSlope(t)) {
      if (o.drop) return T.AIR;
      const x = Math.max(tx * TS, Math.min((tx + 1) * TS, b.x));
      if (b.y > surfaceY(t, tx, ty, x) + 1) return T.AIR;   /* UNDER THE RAMP: no ceiling, no wall */
    }
    return t;
  };
}

/* THE PILLARS ON THE FLOOR, as spans the Prince reads: [{ id, kind ('shelf'|'ramp'|'bridge'), l, r (px), top (px: the shelf's top / the ramp's
   high edge), hi (+1: the ramp's high end is its right end) }] from the slab run-time records (state 'flat' | 'ramp') */
export function pillarSpans(slabs) {
  const out = [];
  for (const s of slabs) {
    if (s.state === 'flat' && s.flat) out.push({ id: s.id, kind: s.flat.kind || 'wall', l: s.x0 * TS, r: (s.x1 + 1) * TS, top: s.flat.row * TS, land: s.flat.land * TS });
    else if (s.state === 'ramp' && s.ramp) { const [ax] = s.ramp.top, [bx, by] = s.ramp.foot; out.push({ id: s.id, kind: 'ramp', l: Math.min(ax, bx), r: Math.max(ax, bx), top: s.ramp.top[1], land: by, hi: ax > bx ? 1 : -1 }); }
  }
  return out;
}

/* HELD: a Prince who must stay where he is (the opening), never crossing */
const HELD = new Set(['buried', 'reel', 'scorched', 'sleep', 'wake', 'sunk', 'heaveTell', 'hop', 'hopTell', 'duck', 'duckTell', 'lightTell']);
export const princeStays = e => e.mode === 'buried' || e.mode === 'reel' || e.mode === 'scorched' || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'sunk' || (e.stagger > 0);

/* WHICH PILLAR IS IN HIS WAY: the nearest span whose near edge is within LOOK px of his leading edge, the way he wants to go, with his feet on
   the floor it stands on (he does not cross what he is standing on top of) */
export function pillarAhead(spans, e, dir) {
  if (!dir) return null;
  const lead = e.x + dir * e.w / 2; let best = null, bd = Infinity;
  for (const p of spans) {
    if (Math.abs(e.y - p.land) > 6) continue;   /* (on top of a shelf, or up a ramp: not in his way) */
    const near = dir > 0 ? p.l : p.r, d = (near - lead) * dir;
    if (d < -2 || d > FALLEN.LOOK) continue;
    if (e.x > p.l && e.x < p.r) continue;      /* (already inside its span: under a ramp he is already ducking) */
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

/* ROOM OVER A SHELF for a body h px tall standing on its top, along its whole span (a hanging wall over the tomb floor is no room for him) */
const solidT = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT || t === T.ICE || t === T.WEB;
export function roomOver(ta, p, h, w = 24) {   /* (w: he stays on its top until his far edge leaves it - a wall a body-width past its end counts) */
  const y0 = Math.floor((p.top - h) / TS), y1 = Math.floor((p.top - 1) / TS);
  for (let x = Math.floor((p.l - w) / TS); x <= Math.floor((p.r + w - 1) / TS); x++) for (let y = y0; y <= y1; y++) if (solidT(ta(x, y))) return false;
  return true;
}
/* HOW HE CROSSES IT: 'hop' onto a shelf or a bridge (its top is one-way: he lands on it, walks it, steps off) when there is room over it for him,
   'duck' under a ramp - or through a shelf with no room over it, bent double (a one-way course has no sides); null when he is held
   (stunned/pinned/reeling stays put) or there is nothing in the way. ta (optional): the tiles, for the room over a shelf */
export function princeCross(e, spans, dir, ta = null) {
  if (HELD.has(e.mode) || princeStays(e)) return null;
  const p = pillarAhead(spans, e, dir); if (!p) return null;
  const hop = p.kind !== 'ramp' && (!ta || roomOver(ta, p, e.h + 4, e.w + 2));
  return { how: hop ? 'hop' : 'duck', pillar: p, dir };
}

/* THE WATCHDOG. w: { x, t } kept per body. Returns true while he is stuck: wants to move, is not held, and has moved under 2 px in STUCK_T s */
export function stuckStep(w, body, dt, wants, held) {
  if (!wants || held) { w.t = 0; w.x = body.x; return false; }
  if (w.x === undefined || Math.abs(body.x - w.x) > 2) { w.x = body.x; w.t = 0; return false; }
  w.t += dt; return w.t > FALLEN.STUCK_T;
}
