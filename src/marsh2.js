/* src/marsh2.js - MARSH WOOD, THE TARGETED FIXES (claude/marsh2; scratch/brief-first2.md 2, review-first2.md MARSH WOOD, audit-polish-1018.md Act I bar).
   Applied to the BUILT marsh (src/level.js marshWood, FINAL columns, before the review/garrison passes), so every number here is a column you can find on the map.
   1. THE SLUICE HOUSE (the channel's THIRD use, and its one REQUIRED drain): the drowned village is two basins now, a timber DAM between them. The planks
      over the far basin have rotted away: climb the sluice house on the dam, break its gate (three blows, the level's verb), and the far basin drains to a
      MUD ROUTE under the huts' stilts - a gar and an eel come up in it, the roof archer shoots down into it - and a stair of boards climbs out to the
      checkpoint plank. (Swimming the deep basin is possible and costs what deep water costs - THE CHANNEL IS DEEP.) The ferry (pay or drain) and the grove
      (raft or drain) stay choices; this one is the drain you must make.
   2. A SECOND HEIGHT ALONG THE ROAD (level-quality bands: >= 5 route bands, >= 40% of the width with footing at two heights): the marsh folk live on
      STILTS - a landing jetty at the bank (where the Wood's ferry will put you down: brief-transition-woodmarsh-1018.md), lookouts up rope ladders over
      the archers' stilts and the island, the boardwalk the shallows sign always promised ("KEEP TO THE PLANKS"), a heron hide over the gar hole, high
      boards over the river's second half, a hut walk on the reed island and the grove bank. Every board stands on a drawn pile (src/forest-supports.js
      'marsh': reed bundles under tufts, bog-oak stilts under boards) - solid-islands 0.
   3. THE MILLER'S LOFT: the court's silver moved up the sluice house (a second secret off the route; the King's court kept none). */
export const SLUICE_HOUSE = { dam: [347, 349], gate: [347, 10], ladder: 349, basinA: [325, 347], basinB: [350, 370], bed: 25, drainTo: 24, loft: [340, 7] };
export const STILTS = [   /* [x0, x1, row, how] - the plank row; you stand one row above it. how: a 'net' column to climb, or 'step' (reachable by a jump) */
  [5, 23, 19, 'step'], [57, 70, 11, 'net:57'], [112, 129, 16, 'step'], [132, 137, 15, 'step'], [150, 158, 15, 'step'],
  [261, 271, 15, 'step'], [293, 300, 15, 'step'], [378, 388, 14, 'step'], [429, 443, 15, 'step'], [226, 236, 15, 'step'],
];
export function applyMarsh2(M, T, TS) {
  const W = M.W, H = M.H, g = M.grid, set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y * W + x] = v; }, at = (x, y) => g[y * W + x];
  const block = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); };
  const ent = (t, x, y, o = {}) => M.ents.push({ t, x, y, ...o });
  const S = SLUICE_HOUSE;
  /* ---- 1. THE SLUICE HOUSE ---- */
  const pA = M.pools.find(p => p.x0 === S.basinA[0] * TS); if (!pA) throw new Error('marsh2: the village pool is not where it was');
  pA.x1 = S.basinA[1] * TS;                                                       /* basin A: the near half, still the plank crossing in fog */
  block(S.dam[0], S.dam[1], 18, H - 1);                                             /* the dam: timber and clay, its top a walk at the bank's height */
  block(S.basinB[0], S.basinB[1] - 1, S.bed, H - 1); block(S.basinB[1], S.basinB[1], 18, H - 1);   /* the far basin's bed, and its east bank */
  M.pools.push({ x0: S.basinB[0] * TS, x1: S.basinB[1] * TS, y: 19 * TS, shallow: false, depth: 0, bottom: S.bed * TS, sluiceHouse: true });   /* deep until the gate goes */
  for (let x = S.basinB[0]; x < S.basinB[1] - 3; x++) for (let y = 14; y <= 17; y++) if (at(x, y) === T.PLANK || at(x, y) === T.REED || at(x, y) === T.ONEWAY) set(x, y, T.AIR);   /* the far boards have rotted away */
  for (let y = S.gate[1] + 1; y <= 17; y++) set(S.ladder, y, T.NET);                /* the sluice house's ladder, up the dam's east face */
  for (let x = S.gate[0] - 1; x <= S.gate[0] + 1; x++) set(x, S.gate[1] + 1, T.PLANK);   /* the gate deck */
  ent('sluice', S.gate[0], S.gate[1], { pool: S.basinB[0], to: S.drainTo, sluiceHouse: true });
  for (let x = S.loft[0]; x <= S.loft[0] + 3; x++) set(x, S.loft[1] + 1, T.PLANK);   /* the miller's loft: a hop up and back off the gate deck */
  M.ents = M.ents.filter(e => !(e.t === 'silver' && M.arena && e.x * TS >= M.arena.x0 && e.x * TS <= M.arena.x1));   /* the court's silver ... */
  ent('silver', S.loft[0], S.loft[1]);                                              /* ... is the miller's now */
  /* the way out of the mud: boards stepping up to the checkpoint plank */
  for (const [x0, len, y] of [[363, 2, 22], [365, 2, 20]]) for (let i = 0; i < len; i++) set(x0 + i, y, T.PLANK);
  ent('spit', 91, 15, { face: -1 });   /* the stilts' first spitter, where its sign (moved off the archers' tile at 58) says it is */
  ent('sign', 346, 17, { text: 'THE SLUICE HOUSE. NO BOARDS BEYOND: BREAK ITS GATE UP TOP AND THE BASIN DRAINS.' });
  /* what the mud gives up, once the water is gone */
  ent('gar', 356, S.drainTo, { face: -1, ifDrained: S.basinB[0] }); ent('eel', 361, S.drainTo, { leap: true, ifDrained: S.basinB[0] }); ent('hopper', 359, S.drainTo, { face: -1, color: 'yellow', ifDrained: S.basinB[0] });
  M.calm = (M.calm || []).concat([[S.loft[0] - 1, S.basinB[1], 5, 26], [44, 57, 12, 22], [79, 84, 12, 16], [309, 314, 12, 17], [424, 430, 12, 17]]);   /* (and the landings the walk showed foes standing on: the island's edge, the river's lip, the grove's bank) */
  M.routeVia = (M.routeVia || []).concat([[S.gate[0], S.gate[1]], [358, S.drainTo]]);   /* ... and down through the mud: before the drain the stair out is under deep water */              /* the route goes up to the gate: the far basin is only walked once it is drained */
  /* ---- 2. THE STILTS ---- */
  const moveCoins = () => { for (const e of M.ents) if (e.t === 'coin') while (e.y > 0 && at(e.x, e.y) !== T.AIR) e.y--; };   /* a coin a new board was laid through sits on the board */
  for (const [x0, x1, y, how] of STILTS) {
    for (let x = x0; x <= x1; x++) if (at(x, y) === T.AIR) set(x, y, T.PLANK);
    if (how.startsWith('net:')) { const nx = +how.slice(4); let b = y + 1; while (b < H && at(nx, b) === T.AIR) { set(nx, b, T.NET); b++; } }
  }
  moveCoins();
  /* the shallows boardwalk has a rope rail on posts, as the river's stages do (the sign there always said KEEP TO THE PLANKS) */
  M.ropes = (M.ropes || []).concat([{ x0: 112 * TS, y0: 16 * TS - 11, x1: 130 * TS, y1: 16 * TS - 11, posts: [[112 * TS + 4, 16 * TS - 9, 18 * TS], [121 * TS + 8, 16 * TS - 9, 19 * TS + 3], [129 * TS + 12, 16 * TS - 9, 18 * TS]] }]);
  M.calm = M.calm.concat(STILTS.map(([x0, x1, y]) => [x0, x1, y - 4, y - 1]));     /* the walks stay quiet: the road's fights are the road's */
  M.marsh2Kit = true;   /* (claude/marsh2art) the art pass's switch: src/redraw/marsh2_art.js reads the dam, bed and walks off these columns */
  return M;
}
