// src/tower-collapse.js — FAILING STONE, THE FALLING TOWER's own rule (docs/briefs/falling-tower-rework.md §2).
// "THE TOWER IS FALLING: STONE THAT CRACKS COUNTS DOWN, AND THEN IT GOES."
//
// A failing section is a run of floor tiles, L.crumbles: { x0, x1, row, rows = 1, count = 3, chain?, gap?, opens?, kind? }.
//   TOLD BEFORE IT IS TOUCHED  its tiles wear cracks and trickle dust always (the drawing is main.js's; crackMarks() is the shape)
//   WEIGHT STARTS IT           a hero standing on it starts its count; the count is drawn over it (3, 2, 1) and cracks on every second
//   THEN IT GOES               the tiles become air
//   IT COMES BACK              BACK seconds after it fell, never into anybody standing in its tiles, and at once on a respawn (B4)
//   A CHAIN IS A FAILING STAIR every section sharing a `chain` id is one stair: weight on any of them starts the lowest whole one,
//                              and each one that goes starts the next on `gap` seconds - the stair fails from the bottom up
//   `opens`                    the section IS the way on (the Orrery's gallery floor): src/reachcore.js drops through it
// Pure: no DOM, no main.js. The caller hands in `change(x, y, how)` ('fall' | 'restore') and gets events back. Proved by
// tools/tower-collapse.mjs.
export const CRUMBLE = { count: 3, gap: 1.1, back: 4 };

export function crumbleInit(L) {
  for (const c of L.crumbles || []) Object.assign(c, { rows: c.rows || 1, count: c.count || CRUMBLE.count, st: 'whole', t: 0, downT: 0, gone: false, heavy: false });
  return L.crumbles || [];
}
/* who is standing on it: a body is { x, y (feet), ground } in pixels. Feet on the section's top row, inside its span */
export const standsOn = (c, b) => !!b && b.ground !== false && Math.abs(b.y - c.row * 16) < 3 && b.x > c.x0 * 16 - 4 && b.x < (c.x1 + 1) * 16 + 4;
export const crumbleAt = (L, b) => (L.crumbles || []).find(c => c.st !== 'down' && !c.gone && standsOn(c, b)) || null;
const inTiles = (c, b) => !!b && b.x > c.x0 * 16 - 6 && b.x < (c.x1 + 1) * 16 + 6 && b.y > c.row * 16 - 2 && b.y - 14 < (c.row + c.rows) * 16;
/* START ONE COUNTING. `t` overrides its count (the Sexton's toll counts shorter in his second phase). Already counting: left as it is */
export function crumbleStart(c, t) { if (!c || c.gone || c.st !== 'whole') return false; c.st = 'count'; c.t = t ?? c.count; c.shown = Math.ceil(c.t); return true; }
/* BREAK ONE NOW (a charge onto counting planks): it does not wait for its count */
export function crumbleBreak(c) { if (!c || c.gone || c.st === 'down') return false; c.st = 'count'; c.t = 0; c.heavy = true; return true; }
function chainStart(L, c) { const ch = (L.crumbles || []).filter(q => q.chain === c.chain && !q.gone).sort((a, b) => b.row - a.row);
  const first = ch.find(q => q.st === 'whole'); if (first && !ch.some(q => q.st === 'count')) crumbleStart(first); }
/* ONE STEP. bodies: the heroes (the ones whose weight counts). Returns events: { t: 'start' | 'tick' | 'fall' | 'back', c, n? } */
export function crumbleStep(L, bodies, dt, change) {
  const out = [], ev = (t, c, o) => out.push({ t, c, ...(o || {}) });
  for (const c of L.crumbles || []) {
    if (c.gone) continue;
    if (c.st === 'whole') { if (bodies.some(b => standsOn(c, b))) { if (c.chain) chainStart(L, c); else crumbleStart(c); } if (c.st === 'count') ev('start', c); continue; }
    if (c.st === 'count') { c.t -= dt; const n = Math.max(0, Math.ceil(c.t)); if (n < c.shown) { c.shown = n; if (n > 0) ev('tick', c, { n }); }
      if (c.t > 0) continue;
      c.st = 'down'; c.downT = 0; for (let y = c.row; y < c.row + c.rows; y++) for (let x = c.x0; x <= c.x1; x++) change(x, y, 'fall');
      ev('fall', c, { heavy: c.heavy }); c.heavy = false;
      if (c.chain) { const next = (L.crumbles || []).filter(q => q.chain === c.chain && !q.gone && q.st === 'whole' && q.row < c.row).sort((a, b) => b.row - a.row)[0]; if (next) crumbleStart(next, next.gap ?? CRUMBLE.gap); }
      continue; }
    if (c.st === 'down') { c.downT += dt; if (c.downT < CRUMBLE.back || bodies.some(b => inTiles(c, b)) || (c.blockers && c.blockers().some(b => inTiles(c, b)))) continue;
      for (let y = c.row; y < c.row + c.rows; y++) for (let x = c.x0; x <= c.x1; x++) change(x, y, 'restore');
      c.st = 'whole'; c.t = 0; c.downT = 0; ev('back', c); }
  }
  return out;
}
/* A RESPAWN PUTS EVERY SECTION BACK (the tiles are the caller's to restore: towerAscentReset puts the whole tower back from grid0) */
export function crumbleReset(L) { for (const c of L.crumbles || []) Object.assign(c, { st: 'whole', t: 0, downT: 0, gone: false, heavy: false }); }
/* A WHOLE FLOOR THAT FELL takes its sections with it: they are not to grow back into a floor that is not there */
export function crumbleGone(L, top, bot) { for (const c of L.crumbles || []) if (c.row >= top && c.row < bot) c.gone = true; }
/* THE CRACKS, as tile-local strokes [x0, y0, x1, y1] on a 16x16 tile - a seeded fork that differs tile to tile */
export function crackMarks(tx, ty) {
  const s = ((tx * 73856093) ^ (ty * 19349663)) >>> 0, a = 3 + (s % 9), b = 2 + ((s >> 4) % 5), c = 4 + ((s >> 8) % 8);
  return [[a, 0, a + 1, b], [a + 1, b, c, b + 3], [a + 1, b, a - 2, b + 4], [c, b + 3, c + 2, 7]];
}
