// src/light.js — SUNLIGHT AS A MECHANIC: beams down shafts, mirrors that turn them, and light that burns the dead. Pure (no DOM,
// no main.js); proved by tools/light.mjs. Used by THE SUN TEMPLE (4b: the sun moves), THE KING'S PYRAMID (7: mirrors carry the
// light up the black pyramid) and THE SKELETON KING (his opening is a beam turned onto him). docs/desert-arc-brief.md.
//
// THE MODEL, in whole tiles so it is exact and readable: a beam runs along a row or a column. It starts at a SOURCE (a sun shaft
// or a window: { x, y, dir }), steps tile by tile, stops at anything opaque, turns 90 degrees at a MIRROR ('/' or '\', which the
// player turns by striking it), lights every tile it passes, and powers any RECEIVER it reaches (a sun-door, a sun-lamp).
// Tiles within LIGHT.glow of a lit tile are visible in the dark; everything else in a dark level is black.
//   trace(tileAt, sources, mirrors, receivers, opts) -> { segs, lit: Set('x,y'), hit: Set(receiver index), steps }
//   litAt(res, x, y) / litBox(res, box) -> is this tile / any tile of this pixel box in the light
//   burn(res, body, dt) -> damage for an undead body standing in light this frame
//   solve(tileAt, sources, mirrors, receivers) -> the fewest mirror turns that light every receiver, or null if none do
export const LIGHT = { glow: 1, burnDps: 18, maxSteps: 4000 };
export const DIRS = { E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1] };
/* a '/' mirror sends a beam going E up (N), N to E, W down (S), S to W; a '\' mirror sends E down (S), S to E, W up (N), N to W */
const TURN = { '/': { E: 'N', N: 'E', W: 'S', S: 'W' }, '\\': { E: 'S', S: 'E', W: 'N', N: 'W' } };
export const reflect = (state, dir) => (TURN[state] || {})[dir] || dir;
export const turnMirror = m => { m.state = m.state === '/' ? '\\' : '/'; return m; };
const key = (x, y) => x + ',' + y;
/* opaque: anything you cannot see through. Rock, crates, walls, and a slope (it is rock under its surface). One-way ledges, rungs,
   planks and webs let light through (it is the dark that matters, not the boards). */
export function makeOpaque(T, isSlope = () => false) {
  const O = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE]);
  return t => O.has(t) || isSlope(t);
}
export function trace(tileAt, sources, mirrors, receivers = [], { opaque, W = 1e9, H = 1e9 } = {}) {
  const mAt = new Map(mirrors.map(m => [key(m.x, m.y), m])), rAt = new Map(receivers.map((r, i) => [key(r.x, r.y), i]));
  const lit = new Set(), hit = new Set(), segs = [], seen = new Set(); let steps = 0;
  for (const s of sources) {
    if (s.off) continue;
    let x = s.x, y = s.y, dir = s.dir, sx = x, sy = y;
    lit.add(key(x, y));
    for (;;) {
      if (++steps > LIGHT.maxSteps) break;
      const st = x + ',' + y + ',' + dir; if (seen.has(st)) break; seen.add(st);   // a beam that comes round to where it has been, going the same way, is a loop: stop
      const [dx, dy] = DIRS[dir]; const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || opaque(tileAt(nx, ny))) { segs.push({ x0: sx, y0: sy, x1: x, y1: y, dir }); break; }
      x = nx; y = ny; lit.add(key(x, y));
      if (rAt.has(key(x, y))) { hit.add(rAt.get(key(x, y))); segs.push({ x0: sx, y0: sy, x1: x, y1: y, dir }); break; }   // a receiver takes the light
      const m = mAt.get(key(x, y));
      if (m) { const nd = reflect(m.state, dir); if (nd !== dir) { segs.push({ x0: sx, y0: sy, x1: x, y1: y, dir }); dir = nd; sx = x; sy = y; } }
    }
  }
  return { segs, lit, hit, steps };
}
export const litAt = (res, x, y) => res.lit.has(key(x, y));
export function litBox(res, [l, r, t, b]) { for (let ty = Math.floor(t / 16); ty <= Math.floor((b - 0.01) / 16); ty++) for (let tx = Math.floor(l / 16); tx <= Math.floor((r - 0.01) / 16); tx++) if (res.lit.has(key(tx, ty))) return true; return false; }
/* THE DARK: what can be seen. A tile is visible if it is lit or within LIGHT.glow of a lit tile (or near a carried light) */
export function visible(res, x, y, carried = []) {
  for (let dy = -LIGHT.glow; dy <= LIGHT.glow; dy++) for (let dx = -LIGHT.glow; dx <= LIGHT.glow; dx++) if (res.lit.has(key(x + dx, y + dy))) return true;
  return carried.some(c => Math.abs(c.x - x) <= c.r && Math.abs(c.y - y) <= c.r);
}
/* SUNLIGHT BURNS THE DEAD: an undead body in a lit tile takes this much this frame (and anything else, nothing) */
export const burn = (res, body, dt) => body.undead && litBox(res, [body.x - body.w / 2, body.x + body.w / 2, body.y - body.h, body.y]) ? LIGHT.burnDps * dt : 0;
/* THE PUZZLE CHECK: try every setting of the turnable mirrors (up to 2^14) and return the one that lights every receiver with the
   fewest turns from where they stand; null if none does. The level tool uses it to prove a room CAN be solved, and that it is
   not solved already. */
export function solve(tileAt, sources, mirrors, receivers, opts) {
  const turnable = mirrors.filter(m => m.turnable !== false); if (turnable.length > 14) throw new Error('solve: too many mirrors');
  const start = turnable.map(m => m.state); let best = null;
  for (let mask = 0; mask < (1 << turnable.length); mask++) {
    turnable.forEach((m, i) => { m.state = (mask >> i) & 1 ? (start[i] === '/' ? '\\' : '/') : start[i]; });
    const r = trace(tileAt, sources, mirrors, receivers, opts);
    if (r.hit.size === receivers.length) { const turns = [...Array(turnable.length).keys()].filter(i => (mask >> i) & 1).length; if (!best || turns < best.turns) best = { turns, mask }; }
  }
  turnable.forEach((m, i) => { m.state = start[i]; });
  return best && { turns: best.turns, turn: turnable.filter((_, i) => (best.mask >> i) & 1).map(m => [m.x, m.y]) };
}
/* THE SUN TEMPLE's moving sun: a row of windows along a wall, the sun coming through one after another over the level's clock.
   Returns the source for this moment (or null at night). */
export function templeSun(windows, clock, dayLen) { const k = clock / dayLen; if (k < 0 || k >= 1) return null; const i = Math.min(windows.length - 1, Math.floor(k * windows.length)); return { ...windows[i] }; }
