// tools/ambush-reach.mjs — EVERY FOE AN AMBUSH MAKES YOU KILL CAN BE REACHED FROM WHERE IT SHUTS YOU IN.
//
// "The ambush is unwinnable: its elite spawns behind a wall where the hero cannot reach him." (Daniel, 2026-09-24, THE
// SEALED CRYPT on THE UNBURIED FIELD: the husk that leads it stood east of the chapel's palisade, the hero was locked in
// west of it, and a room only opens when its captain is down - RULES Q3.) Fix the rule, not the row: this asks it of
// every room in the game.
//
// A room is rebuilt the way src/main.js shuts it (ambushWall/ambushShut: each wall column's own floor, up to AMB.up rows
// of AIR above it, a one-way sill shut too), and the hero is put where the lock catches him: on his feet at the trigger
// column (A.trigger, or wallL + 3 - updateAmbush), on the side the level comes in from. The fill is src/reachcore.js,
// the one reach model (RULES O), with the rides on, as tools/elites.mjs asks it.
// TWO TILES ARE ROCK HERE THAT THE MODEL WALKS THROUGH: a PORT (the gate itself - tools/elites.mjs makes its gate SOLID for
// the same reason) and a PALISADE. The model's walk only stops at SOLID, so it strolled through the chapel's stake wall; a
// stake wall stands until fire or a blast takes it, and a room is not winnable on the strength of a barrel you might not
// light. ICE is a wall to the hero too. Nothing else changes: crates, soft ground and webs are still broken through.
// The ones the room REQUIRES are the ones whose death opens it: the captain (the wave's elite; Q3 - the others flee when
// he falls). A flyer is left out - it comes to you, and ambushPen holds it inside the room over its floor.
//   node tools/ambush-reach.mjs            every level
//   node tools/ambush-reach.mjs unburied   only those
// FAILS when a required foe stands outside the room's walls, or where the sealed room's fill does not come within a tile.
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const AMB = { up: 10, down: 6 };   /* src/main.js AMB: a gate is ten rows at most, and finds its floor within six */
const AMB_FLY = new Set(['wasp', 'crow', 'bat', 'harpy', 'kite', 'drone', 'petrel', 'gull']);   /* src/main.js AMB_FLY */
const THRU = new Set([T.ONEWAY, T.RAIL, T.PLANK]);   /* src/main.js AMB_THRU: a floor you drop through is no sill */
const WALLS = new Set([T.PALISADE, T.PORT, T.ICE]);
const want = (process.argv[2] || '').split(',').filter(Boolean);
let bad = 0, rooms = 0;
for (const lv of LEVELS) {
  if ((lv.hidden && !lv.secret) || lv.id === 'custom' || (want.length && !want.includes(lv.id))) continue;
  const L = lv.build(); if (!(L.ambushes || []).length) continue;
  const W = L.W, H = L.H, out = [];
  for (const A of L.ambushes) { rooms++;
    const grid = L.grid.slice(), at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : grid[y * W + x];
    for (let i = 0; i < grid.length; i++) if (WALLS.has(grid[i])) grid[i] = T.SOLID;
    /* the gates, exactly as ambushWall lays them over the room's own floor */
    for (const col of [A.wallL, A.wallR]) {
      let bot = A.row; while (bot > A.row - 4 && at(col, bot) !== T.AIR) bot--;
      while (bot < A.row + AMB.down && at(col, bot + 1) === T.AIR) bot++;
      let top = bot; while (top > bot - AMB.up + 1 && top > 0 && at(col, top - 1) === T.AIR) top--;
      for (let y = top; y <= bot; y++) if (at(col, y) === T.AIR) grid[y * W + col] = T.SOLID;
      if (THRU.has(at(col, bot + 1))) grid[(bot + 1) * W + col] = T.SOLID;
    }
    /* where the lock catches him: the trigger column from the side the level arrives at it */
    const fromLeft = L.START.x < A.wallL, x0 = A.trigger !== undefined ? A.trigger : A.wallL + 3, sx = fromLeft ? Math.ceil(x0) : A.wallR - 2;
    const R = floodReach({ ...L, grid, START: { x: sx, y: A.y0 !== undefined ? A.y0 : A.row - 1 } }, T, { rides: true });
    const near = (x, y) => { for (let dy = -2; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (R.seen.has((x + dx) + ',' + (y + dy))) return true; return false; };
    const lead = A.waves.flat().filter(f => f[3] && f[3].elite);
    if (!lead.length) out.push(A.name + ': no captain, so nothing the room can be cleared by');
    for (const [t, x, y] of lead) {
      const row = y === undefined || y === null ? A.row : y, tag = A.name + ': its captain ' + t + '@' + x + ',' + row;
      if (x <= A.wallL || x >= A.wallR) { out.push(tag + ' stands outside its own walls (' + A.wallL + '-' + A.wallR + ')'); continue; }
      if (AMB_FLY.has(t)) continue;
      if (!near(x, row)) out.push(tag + ' cannot be reached from the lock at ' + sx + ' (the hero is shut in ' + (fromLeft ? 'west' : 'east') + ' of it)');
    }
  }
  if (out.length) bad++;
  console.log((out.length ? 'FAIL ' : ' ok  ') + lv.id.padEnd(12) + L.ambushes.map(A => A.name).join(', ') + (out.length ? '\n       ' + out.join('\n       ') : ''));
}
console.log('\n' + rooms + ' ambush rooms. ' + (bad ? bad + ' level(s) shut the hero in with a captain he cannot reach.' : 'every captain can be reached from where the room shuts.'));
process.exit(bad ? 1 : 0);
