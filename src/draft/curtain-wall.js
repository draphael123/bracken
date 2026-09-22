// src/draft/curtain-wall.js — THE CURTAIN WALL, a DRAFT section for Stormhold (brief .claude/briefs/stormhold-extension.md,
// agreed with Daniel 2026-09-22). NOT WIRED: a build session splices it into stormhold() in level.js with grow() at SEAM.
// tools/curtain-wall.mjs splices it into the real Stormhold build and measures it (reach, density, checkpoints, the climb).
//
// Stormhold's rows fix the shape: rows 0-18 are the houses' insides (L.indoorRow 18: the camera never shows them from the
// street), the street stands on row 30 (you stand in 29), and the gorge under the Long Bridge runs down to row 45. So the
// climb the brief asks for (~20 rows up the OUTSIDE of the wall) starts at the FOOT of the wall, in the gorge:
//   c 0-14    THE SALLY STAIR   off the Halls' swaying span, down four ledges to the gorge floor (row 44)
//   c 12-43   THE WALL'S FOOT   the gorge floor under the curtain wall: rubble, the first rod's reach, hounds and sprigs
//   c 44-69   THE CLIMB         21 rows up the wall face: sills and free ledges three rows apart, a CHAIN HOIST (a rising
//                               slab) in the middle; MURDER HOLES drop stones down the face on a clock (told, `!`, guard them)
//   c 70-105  THE WALL-WALK     the top of the wall (you stand in row 22): LIGHTNING RODS on the merlons (told, red cross: a
//                               bolt strikes everything within two tiles - lure goblins under them), a GUST pushing you back
//                               toward the climb's edge, and at its end THE GATE SERJEANT's stretch, his gate shut (mini)
//   c 106-111 THE BRIDGE GATE   down two ledges to the street and the old approach to the bone gate and the Long Bridge
// Columns are LOCAL (c 0 = SEAM). Nothing here is a death: a fall off the climb lands on the gorge floor, and the sally stair
// goes back up.
export const CURTAIN = {
  SEAM: 276,            // stormhold(): after the Halls' swaying span (piers 274-275), before the approach to the bone gate
  N: 112,               // columns it adds: Stormhold 430 -> 542. EVERY hand-placed x >= SEAM in ELITES/REVIEW/tools shifts by N
  STREET: 29, FOOT: 43, WALK: 22,   // standing rows: the street, the gorge floor, the wall-walk
  WALL: [70, 105],       // the curtain wall's body (solid from the walk's floor, row 23, down)
  CLIMB: [[62, 65, 41], [66, 69, 38], [63, 65, 35], [66, 69, 32], [66, 69, 26]],   // [c0, c1, tile row] sills and ledges
  HOIST: [63, 32, 6],    // [c, tile row at the bottom, rise]: the chain hoist from the 4th sill up to the 5th
  RODS: [75, 81],        // lightning rods on the wall-walk (local c)
  MURDER: [67, 64],      // murder holes over the face (local c): stones fall from the wall top down these columns
  GUST: [72, 87],        // the wall-walk gust, pushing WEST (back toward the climb)
  SERJEANT: { x0: 88, x1: 104, gate: 105, wallL: 87 },
};

/* paint the section into a painter P ({ set, block, plat, ent }) whose columns start at X (the seam, after grow()) */
export function layCurtainWall(P, X, T) {
  const C = CURTAIN, { set, block, plat, ent } = P, c = n => X + n, TS = 16;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  block(c(0), c(C.N - 1), 0, 18);                                    // the indoor band, as the rest of the level has it
  air(c(0), c(C.N - 1), 19, 45);
  // THE SALLY STAIR: a pier to land on off the span, then down four ledges
  block(c(0), c(1), C.STREET + 1, 45);
  for (const [a, row] of [[3, 33], [6, 36], [9, 39], [12, 42]]) plat(c(a), row, 3);
  // THE WALL'S FOOT: the gorge floor, with rubble on it
  block(c(12), c(C.WALL[0] - 1), C.FOOT + 1, 45);
  block(c(22), c(24), C.FOOT - 1, C.FOOT); block(c(33), c(34), C.FOOT, C.FOOT);
  // THE CURTAIN WALL, its face climbed by sills and ledges three rows apart, and the hoist
  block(c(C.WALL[0]), c(C.WALL[1]), C.WALK + 1, 45);
  for (const [a, b, row] of C.CLIMB) plat(c(a), row, b - a + 1);
  { const [hx, hr, rise] = C.HOIST; air(c(hx), c(hx + 2), hr, hr); ent('mover', c(hx), hr, { len: 3, vert: true, rise, period: 4.8, stone: true, hoist: true }); }
  // THE BRIDGE GATE stair, down to the street
  plat(c(106), C.WALK + 4, 3); plat(c(109), C.STREET, 3);
  block(c(C.N - 1), c(C.N - 1), C.STREET + 1, 45);                   // the street picks up again at the seam's far side
  // THE SERJEANT'S GATE: a portcullis on the wall-walk's last column; he holds it (mini)
  for (let y = C.WALK - 3; y <= C.WALK; y++) set(c(C.SERJEANT.gate), y, T.PORT);
  ent('gateserjeant', c(98), C.WALK, { face: -1, mini: true });
  // the loose weather and the old stone
  for (const r of C.RODS) ent('rod', c(r), C.WALK, { period: 4.2, tell: 1.2, reach: 2 });
  for (const m of C.MURDER) ent('murderhole', c(m), C.WALK + 1, { period: 3.4, tell: 0.8 });
  // checkpoints, signs, a silver in the first rod's lee (it takes one of the level's three: move the one at 288,25)
  ent('check', c(16), C.FOOT); ent('check', c(73), C.WALK); ent('check', c(110), C.STREET);
  ent('sign', c(2), C.STREET, { text: 'THE WAY TO THE BRIDGE IS OVER THE CURTAIN WALL. DOWN, THEN UP ITS FACE.' });
  ent('sign', c(46), C.FOOT, { text: 'THE WALL. STONES COME DOWN THE MURDER HOLES: GUARD, OR WAIT FOR THE GAP.' });
  ent('sign', c(71), C.WALK, { text: 'THE RODS DRAW THE STORM. WHEN ONE CRACKLES, GET CLEAR - OR LEAVE A GOBLIN UNDER IT.' });
  ent('silver', c(78), C.WALK - 2); plat(c(77), C.WALK - 1, 3);
  // the goblins on it (the build session's GARRISON row adds more; these are the placed ones)
  const foe = (t, n, row, o) => ent(t, c(n), row, Object.assign({ face: -1 }, o || {}));
  foe('sprig', 18, C.FOOT); foe('hound', 28, C.FOOT); foe('sapper', 38, C.FOOT); foe('shield', 52, C.FOOT);
  foe('archer', 68, 37, { fire: true }); foe('harpy', 56, 34); foe('harpy', 58, 27); foe('archer', 67, 25);
  foe('stormshaman', 79, C.WALK); foe('pike', 84, C.WALK); foe('sprig', 108, C.WALK + 3);
  return { gusts: [{ x0: c(C.GUST[0]) * TS, x1: c(C.GUST[1]) * TS, y0: (C.WALK - 4) * TS, y1: (C.WALK + 1) * TS, dir: -1, period: 5, on: 2 }],
    mini: { x0: c(C.SERJEANT.x0) * TS, x1: (c(C.SERJEANT.x1) + 1) * TS, floor: (C.WALK + 1) * TS, y0: (C.WALK - 6) * TS, y1: (C.WALK + 2) * TS,
      trigger: c(C.SERJEANT.x0 + 3) * TS, wallL: c(C.SERJEANT.wallL), gate: c(C.SERJEANT.gate), boss: 'gateserjeant', name: 'THE GATE SERJEANT' } };
}
