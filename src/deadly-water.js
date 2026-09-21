// deadly-water.js — WATER THAT KILLS HAS TO SAY SO (2026-09-21). Daniel, of the Falling Tower's cistern: "We need some kind of
// indication that this poison water is a one hit kill, most poison water isn't." Every other harmful pool in the game can be
// swum or stepped out of (it costs health per tick); a pool you cannot climb out of from its bed is a death, so it is drawn as
// one (drawDeadly in main.js: black-green water, bones in it, skull posts on the banks, THIS WATER KILLS on first sight) and it
// kills on entry instead of over five helpless seconds. The rule is checked, not hoped for: tools/deadly-water.mjs fails when
// a pool's `deadly` flag and its geometry disagree.
const RISE = 3;   // the knight's jump, in rows (reachcore JUMP_UP)
/* does this harmful pool TRAP whoever goes in: some water column whose bed is more than a jump below every footing near it
   that stands clear of the water? Swim pools never trap (up swims, jump climbs out). */
export function poolTraps(L, p, T) {
  if (!p.harm || p.swim || p.dry) return false;
  const W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H) ? T.SOLID : L.grid[y * W + x];
  const foot = t => t !== T.AIR && t !== T.SPIKE;
  const surf = Math.floor(p.y / 16), x0 = Math.ceil(p.x0 / 16), x1 = Math.floor(p.x1 / 16) - 1;
  /* each water column: its bed, and whether a jump from it reaches footing clear of the water */
  const col = [];
  for (let x = x0; x <= x1; x++) {
    if (at(x, surf) !== T.AIR) { col.push(null); continue; }  // a stone standing in it, not water
    let bed = surf; while (bed < L.H && at(x, bed) === T.AIR) bed++;
    let out = false;
    /* standing on the bed (row bed-1), a jump lands on a top up to RISE rows higher: a footing tile in rows bed-1 .. bed-RISE,
       with air over it, whose top is not under the water (a tile in the surface row stands a few pixels proud of it) */
    for (let dx = -3; dx <= 3 && !out; dx++) for (let fy = bed - 1; fy >= bed - RISE; fy--) {
      if (fy <= surf && foot(at(x + dx, fy)) && at(x + dx, fy - 1) === T.AIR) { out = true; break; } }
    col.push({ bed, out });
  }
  /* AND YOU CAN WALK THE BOTTOM: a run of columns whose beds step by a row at most is one floor (the poison hurts on the way,
     it does not hold you). It traps only if some such run has no way out anywhere along it - the cistern's pits between stones */
  for (let i = 0; i < col.length;) { if (!col[i]) { i++; continue; }
    let j = i, out = col[i].out; while (j + 1 < col.length && col[j + 1] && Math.abs(col[j + 1].bed - col[j].bed) <= 1) { j++; out = out || col[j].out; }
    if (!out) return true; i = j + 1; }
  return false;
}
