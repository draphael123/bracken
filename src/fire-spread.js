// fire-spread.js — THE BURNING VILLAGE's fire (batch 5, 2026-09-21). Daniel's rule: ONLY THE PYROMANCER'S FIRES SPREAD -
// his, and the ones his burning goblins carry. The village's own fire (the thatch alight behind the street, the bonfires in
// the yards) is authored dressing and hazard, and it never creeps: it is not in this grid at all.
//
// The grid is the village's burnable ground: one cell per floor tile of thatch, timber or hay (L.burn, [x0, x1, row] spans,
// `row` being the air row a flame stands in over its floor). A cell goes
//     UNLIT -> CATCHING (embers, a warning: FIRE.CATCH s) -> ALIGHT (it hurts, it lights the street) -> BURNT (black, safe)
// and an ALIGHT cell passes itself on to its neighbours once, FIRE.SPREAD s after it caught. Nothing becomes CATCHING
// except through ignite() from a SPREADER, or through a neighbour that was itself lit that way, so every flame in the grid
// traces back to him. Water (a trough, the well) sets a catching or burning cell back to UNLIT: douse().
//
// THE SQUARE is different: its cells are held by his HEAT (squareHeat), not by the clock. A patch catches as his bar
// passes its mark and goes out when he vents - his heat is both his damage and the floor the player has left. Square
// cells neither spread nor burn out.
//
// Pure logic, no drawing: main.js puts a `fires` entry under each ALIGHT cell (so the fire hurts, lights and draws like
// every other flame in the game) and tools/burning-village.mjs drives this module directly.
export const FIRE = { CATCH: 1.2, SPREAD: 2.4, BURN: 9 };
export const UNLIT = 0, CATCHING = 1, ALIGHT = 2, BURNT = 3;
export const SPREADERS = new Set(['pyromancer', 'burngob']);

export function fireGrid(L) {
  const cells = [], at = new Map();
  for (const [x0, x1, row, o] of L.burn || []) for (let x = x0; x <= x1; x++) {
    if (at.has(x + ',' + row)) continue;
    const c = { x, y: row, s: UNLIT, t: 0, src: null, spread: false, square: !!(o && o.square), thr: 0 };
    cells.push(c); at.set(x + ',' + row, c); }
  /* THE SQUARE's marks: patches of four, spread over the bar from 25 to 95 in a shuffled order, so it does not burn from one
     end */
  const sq = cells.filter(c => c.square);
  const patches = []; for (let i = 0; i < sq.length; i += 4) patches.push(sq.slice(i, i + 4));
  const order = patches.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % 11) - ((b * 7 + 3) % 11));
  /* and HALF the patches never burn at all: the floor goes in holes, and at the top of his bar half of it is still there to
     stand on. (Seven in ten burning left three islands of four tiles against the firedrop and the vent: the pilot lost 24 of 24) */
  const burns = Math.ceil(order.length * 0.5);
  order.forEach((p, k) => { const thr = k < burns ? Math.round(30 + 65 * k / Math.max(1, burns - 1)) : 999; for (const c of patches[p]) c.thr = thr; });
  return { cells, at, get: (x, y) => at.get(x + ',' + y) || null };
}
/* only a spreader starts a fire in the grid */
export function ignite(G, x, y, src) {
  if (!G || !SPREADERS.has(src)) return false;
  const c = G.get(x, y); if (!c || c.square || c.s !== UNLIT) return false;
  c.s = CATCHING; c.t = 0; c.src = src; c.spread = false; return true;
}
/* the nearest cell to a tile a creature stands over (its feet are in `row`, or a row either side on a stair) */
export function cellNear(G, x, y) { if (!G) return null; for (const dy of [0, -1, 1]) { const c = G.get(x, y + dy); if (c) return c; } return null; }
export function stepFire(G, dt) {
  if (!G) return;
  const lit = [];
  for (const c of G.cells) {
    if (c.s === UNLIT || c.s === BURNT) continue;
    c.t += dt;
    if (c.s === CATCHING && c.t >= FIRE.CATCH) { c.s = ALIGHT; c.t = 0; continue; }
    if (c.s !== ALIGHT || c.square) continue;
    if (!c.spread && c.t >= FIRE.SPREAD) { c.spread = true; lit.push(c); }
    if (c.t >= FIRE.BURN) { c.s = BURNT; c.t = 0; }
  }
  /* passed on after the loop, so a fire that caught this frame does not run the length of the street in one step */
  for (const c of lit) for (const [dx, dy] of [[-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const n = G.get(c.x + dx, c.y + dy); if (n && !n.square && n.s === UNLIT) { n.s = CATCHING; n.t = 0; n.src = c.src; n.spread = false; } }
}
/* WATER: every catching or burning cell within r tiles (and two rows) goes back to UNLIT. A burnt cell stays burnt */
export function douse(G, x, y, r) {
  if (!G) return 0; let n = 0;
  for (const c of G.cells) if (!c.square && (c.s === CATCHING || c.s === ALIGHT) && Math.abs(c.x - x) <= r && Math.abs(c.y - y) <= 2) { c.s = UNLIT; c.t = 0; c.spread = false; n++; }
  return n;
}
/* THE SQUARE follows his bar: a patch catches once his heat is past its mark, and goes out when the heat falls five under it.
   A patch a bucket has QUENCHED (quench, below) stays out for its seconds whatever the bar says: dt runs them down. */
export function squareHeat(G, heat, dt = 0) {
  if (!G) return;
  for (const c of G.cells) { if (!c.square) continue;
    if (c.outT > 0) { c.outT = Math.max(0, c.outT - dt); c.s = UNLIT; c.t = 0; continue; }
    if (heat >= c.thr && c.s === UNLIT) { c.s = CATCHING; c.t = 0; c.src = 'pyromancer'; }
    else if (heat < c.thr - 5 && c.s !== UNLIT) { c.s = UNLIT; c.t = 0; } }
}
/* THE BUCKET ON HIS SQUARE (docs/briefs/burning-village-rework.md §4): every square cell within r tiles of the water goes out and
   is held out for secs, even while his heat stands over its mark. The rest of the grid is douse()'s. */
export const QUENCH = { secs: 8 };
export function quench(G, x, y, r, secs = QUENCH.secs) {
  if (!G) return 0; let n = 0;
  for (const c of G.cells) if (c.square && Math.abs(c.x - x) <= r && Math.abs(c.y - y) <= 2) { if (c.s !== UNLIT) n++; c.s = UNLIT; c.t = 0; c.outT = secs; }
  return n;
}
export const burning = c => c && (c.s === ALIGHT);
export const count = (G, s) => G ? G.cells.filter(c => c.s === s).length : 0;
