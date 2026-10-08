// scree-relief.js - THE SCREE PATH's GROUND AND ITS OVERHANGS (claude/scree2; the level-quality gate, docs/LEVEL-QUALITY.md, and the design standard's
// A2/A4/B14). Applied last, on FINAL columns (after the rework and the rockslide chase).
//   THE OVERHANGS ON THE ROAD: the Ram Lord's opening is the level's own verb, so it is TAUGHT on the road before him (B14: the key is taught first; A4: teach
//     -> test -> remix -> exam): a loose overhang on a dry-stone prop over the cairn field's ram pen (TAUGHT, a sign at the prop, nothing that can hurt you),
//     over the terraces' troll (TESTED, throwers on the crest over you), over the gorge bank's elite troll (REMIXED: the section's exam), over the quarry's
//     chute (the quarry exam) - then the two in his fold. Knock the prop while something stands in its line (the prop glints) and the cliff buries it.
//   THE GROUND: the foothills were long level runs (70% of the walked route, the gate's limit is 60%) with one height (26% of the width offered a second;
//     the gate asks 40%). Knolls in the pastures and the hamlet green (two rows up and down), and the drovers' high ledges over them, the hamlet's roof road,
//     ledges over the windmill rise's approach, the gorge bank, the plateau and the gully - stone ledges, the hill's own.
export const OVERHANGS = [   // [prop column, feet row, side (the way its line runs from the prop)]
  [250, 13, 1],   // TEACH: the cairn field's ram pen (the goats at 251/254)
  [134, 15, 1],   // TEST: the terraces' troll (140)
  [499, 18, 1],   // REMIX: the gorge bank's elite troll (505) - the section's exam
  [543, 8, 1],    // the quarry exam: the chute's goat and thrower
];
export const TEACH_SIGN = [247, 13, 'A DRY-STONE PROP HOLDS THAT OVERHANG UP. KNOCK IT OUT WHEN SOMETHING STANDS UNDER IT.'];
/* [x0, x1, top row] solid relief: knolls of two rows (the route climbs two and comes down two) */
export const KNOLLS = [[23, 24, 19], [25, 28, 18], [29, 29, 19], [46, 47, 19], [48, 51, 18], [52, 52, 19], [91, 92, 19], [93, 96, 18], [97, 97, 19]];
/* [x, row, len] stone ledges: the second height */
export const LEDGES = [
  [19, 15, 4], [25, 15, 4], [31, 15, 3], [42, 15, 4], [48, 15, 4], [54, 15, 3],                        // the drovers' ledges over the pasture knolls
  [66, 15, 3], [74, 15, 4], [80, 15, 3], [90, 15, 4], [96, 15, 3], [102, 15, 3],                       // the hamlet's roof road
  [204, 11, 3], [210, 11, 3], [216, 11, 4], [222, 11, 3],                                               // over the windmill rise's approach
  [306, 14, 3], [312, 14, 3], [322, 14, 3],                                                             // over the rockslide's first runs
  [370, 18, 2], [373, 16, 4], [379, 16, 4],                                                             // the boulder field's shelf
  [491, 17, 2], [494, 15, 4], [500, 15, 4], [506, 15, 3], [511, 15, 3],                                 // the gorge bank
  [526, 6, 3], [531, 6, 3], [536, 6, 3], [570, 6, 3], [575, 6, 3], [580, 5, 3],                        // the plateau and the gully
];
/* THE QUARRYMEN'S LIFTS (a stone cage on a rope - the derrick's own): up the crag wall from the gorge bank to the plateau, and up the quarry face from the floor
   to the high stagings; the ropeway's lift is the first. [column, low top row, high top row] */
export const LIFTS = [[521, 20, 9], [561, 9, 4]];
export function reliefScree(R, T) {
  const W = R.W, set = (x, y, t) => { if (x >= 0 && x < W && y >= 0 && y < R.H) R.grid[y * W + x] = t; }, at = (x, y) => R.grid[y * W + x];
  for (const [x0, x1, top] of KNOLLS) for (let x = x0; x <= x1; x++) for (let y = top; y < R.H; y++) set(x, y, T.SOLID);
  for (const [x, row, len] of LEDGES) for (let i = 0; i < len; i++) if (at(x + i, row) === T.AIR) set(x + i, row, T.ONEWAY);
  /* the ents standing where a knoll rose sit on its top now */
  for (const e of R.ents) { const k = KNOLLS.find(([x0, x1]) => e.x >= x0 && e.x <= x1); if (k && e.y >= k[2]) e.y = k[2] - 1; }
  for (const [x, y, side] of OVERHANGS) R.ents.push({ t: 'overhang', x, y, side });
  for (const [x, lo, hi] of LIFTS) R.moversExtra.push({ kind: 'lift', x: x * 16, y: (lo - 1) * 16, y0: (lo - 1) * 16, y1: (hi - 1) * 16, w: 32, h: 8, speed: 30, quarry: true });
  /* the hamlet's chimney silver stays OFF the road: the roof road now runs at its old ledge, so it sits a hop higher */
  for (const e of R.ents) if (e.t === 'silver' && e.x === 85 && e.y === 14) { e.y = 11; set(85, 12, T.ONEWAY); set(86, 12, T.ONEWAY); }
  R.ents.push({ t: 'sign', x: TEACH_SIGN[0], y: TEACH_SIGN[1], text: TEACH_SIGN[2] });
  /* THE LOOSE ROCK, by place (the rule's state: tools/rule-state.mjs reads L.looseRock as places, main.js only asks that it is there) */
  const loose = []; for (let y = 0; y < R.H; y++) for (let x = 0; x < W; x++) if (at(x, y) === T.SHELF) { const g = loose.find(q => q.y === y && x - q.x1 <= 2); if (g) g.x1 = x; else loose.push({ x0: x, x1: x, y }); }
  R.looseRock = loose.length ? loose.map(q => ({ x0: q.x0 * 16, x1: (q.x1 + 1) * 16, y: q.y })) : true;   /* (in px, like every rule array the tools read) */
  return R;
}
