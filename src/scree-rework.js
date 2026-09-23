// scree-rework.js — THE SCREE PATH REWORK (2026-09-23; KICKOFF 4$a, Daniel approved it 2026-09-22).
// MEASURED: tools/curve.mjs put the Scree Path at INDEX 86 straight after Kingswood's 118 - a 32-point collapse where threat.js
// calls anything past -8 one - with 2.9 foes a screen (the tutorial wood's density) and ZERO hazard tiles, on a mountain whose
// whole premise is loose rock. The level already OWNED the machinery - sliding scree, a rockslide, rockfalls, and the shelf that
// snaps under a standing weight - and never lived with any of it. This makes it live with them, in the places it already has:
//   THE TERRACES     rock goblins up on the crest ledges, a sapper on the top step: the road is under fire from above
//   THE WINDMILL RISE and THE CAIRN FIELD  a lookout and a sapper; the gully's floor is broken stone, so a fall into its
//                    back-drag wind costs you something
//   THE SCREE SLOPE  THE GROUND GOES: the dry stepping ledges over the scree are LOOSE ROCK (the snapping shelf, in stone) -
//                    stand still on one and it drops you onto the scree; and the scree carries you over each step's lip onto
//                    a bed of BROKEN STONE unless you brace or jump. Goats charge down it; a rock goblin rides a loose ledge
//   THE CRAG WALL and THE GLASS QUARRY  a thrower at the top of the climb; a lookout on the stagings
// Applied to the finished level (after every grow), so no coordinate in screePath() moves. Proved by tools/scree-rework.mjs.
export const SCREE = {
  LOOSE: [280, 312, 10, 17],                                   // where a hanging ledge becomes loose rock
  STEPS: [[289, 15], [302, 16], [313, 17], [327, 18]],         // [first column, standing row] of each scree step a slide ends on (302: an old stepping ledge sits on 301's lip)
  GULLY: [238, 243, 17],
  ROCKFALL: [[118, 4, 2.7], [196, 4, 2.3], [274, 4, 2.5]],     // more rock off the cliff over the low road
  FOES: [
    ['rockgoblin', 135, 11], ['rockgoblin', 146, 11], ['javelin', 140, 9], ['sapper', 158, 13], ['sprig', 124, 17],   // THE TERRACES
    ['sentry', 104, 19],                                                                                                // the hamlet's end
    ['rockgoblin', 212, 13], ['sentry', 200, 13], ['sapper', 252, 13],                                                   // the rise, the cairns
    ['rockgoblin', 284, 12], ['goat', 296, 15], ['goat', 309, 16], ['shield', 316, 17],                                   // THE SCREE SLOPE
    ['rockgoblin', 431, 8], ['sentry', 466, 4],                                                                          // the wall, the quarry
  ],
};
export function reworkScree(R, T) {
  const W = R.W, at = (x, y) => R.grid[y * W + x], set = (x, y, t) => { R.grid[y * W + x] = t; };
  /* THE GROUND GOES: a hanging ledge over the scree (a one-way tile with air under it) is loose rock now */
  const [x0, x1, y0, y1] = SCREE.LOOSE; let loose = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (at(x, y) === T.ONEWAY && at(x, y + 1) === T.AIR) { set(x, y, T.SHELF); loose++; }
  /* BROKEN STONE where the scree puts you down, and on the gully's floor */
  let spikes = 0;
  for (const [x, row] of SCREE.STEPS) for (const dx of [0, 1]) if (at(x + dx, row) === T.AIR && at(x + dx, row + 1) === T.SOLID) { set(x + dx, row, T.SPIKE); spikes++; }
  for (let x = SCREE.GULLY[0]; x <= SCREE.GULLY[1]; x++) if (at(x, SCREE.GULLY[2]) === T.AIR && at(x, SCREE.GULLY[2] + 1) === T.SOLID) { set(x, SCREE.GULLY[2], T.SPIKE); spikes++; }
  for (const [x, y, every] of SCREE.ROCKFALL) R.ents.push({ t: 'rockfall', x, y, every });
  for (const [t, x, y] of SCREE.FOES) R.ents.push({ t, x, y, face: -1, rework: true });
  R.looseRock = true;   /* the snapping shelf is drawn as stone here, not fungus (main.js) */
  R.screeRework = { loose, spikes };
  return R;
}
