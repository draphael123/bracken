/* src/queen-stair.js - HIGHCROWN's NEW SECTION: THE QUEEN'S STAIR (claude/gq3, Daniel 11-09 "the Princess dies ringing her bell, the Queen has barred her doors"; scratch/lane-reports/gq3-plan.md item 3).
   Called LAST by highcrownThree (src/highcrown2.js, after gobgeoLay): insertColumns(R, 652, 64) opens 64 columns between the Princess's stair door (the tower's east port, 648) and her terrace;
   her door shrine (653 -> 717), her hall, her flee portal, the burning tower and the tower top all slide east whole. The new columns are carved here, in the FINAL numbering (652-715).
   The Princess's bell answered from the Great Hall: the Queen dropped her outer portcullis. UP AND OVER - the hall's west tower, then a gallery over her door guard.
     B1 BARRED DOORS  652-667  stone flights up the gatehouse face (stand rows 19 -> 11), the dropped portcullis (col 663 rows 14-19) under the first landing. A soldier and a javelin, awake.
     B2 WIND STAIR    668-685  the landings 11 / 7 / 4 on the hall's west tower, told headwind gusts. A shield-bearer on the second landing, an ARCHER on the catwalk over it, a GEOMANCER on the top
                               landing behind a GEODE GRILLE (col 681): send his rock back and the grille shatters into a 4-row LADDER (the shortcut); else the catwalk past the archer (the long way).
     B3 GEODE STORE   685-703  the court mages' store at the tower top: a 12-col SHAFT (689-700) under three hanging GEODE COUNTERWEIGHTS (691 / 695 / 699). A Geomancer on the far ledge (702, 8). Every rock
                               you send back crosses the shaft and meets the FIRST weight left in its path (src/gobgeo-hands.js: a rocklock of kind 'weight'): it drops, its PIVOT SLAB swings level (a
                               3-col bridge at row 9). Three returns = the bridge. A fall = the store floor (row 19), the ladder (689) back up: time, never death. If he dies the unhit weights drop after 4 s.
                               SECRET: the Princess's trinket hoard in an alcove under the near ledge (coins + a mend; no relic).
     B4 GALLERY       704-715  out onto the hall's roof gallery (stand 11) over the terrace; a MURDER HOLE (#7) in its floor over her door guard (a heavy, a soldier, a javelin); the ladder at 712 down.
   The shrine at 650 (the Princess's checkpoint ends here) and her door shrine (717) bracket it: banquet shrine (524) -> 650 ~126 route tiles, 650 -> 717 ~95. */
export const QS = {
  AT: 652, ADD: 64, SHRINE: [650, 19],
  STEPS: [[654, 656, 17], [657, 658, 15], [659, 660, 13]],   // [x0, x1, stand row]: solid stone flights up the gatehouse face
  L1: [661, 667, 11], PORTCULLIS: { col: 663, y0: 14, y1: 19 },
  STEP2: [668, 669, 9], L2: [670, 681, 7], ARCHER: { x0: 670, x1: 673, row: 6 }, CATWALK: { x0: 674, x1: 680, row: 6 }, LADDER1: { col: 681, net: [4, 5], grille: [6, 7] },
  LT: [682, 684, 4], LADDER2: { col: 685, y0: 5, y1: 8 }, SPOTS: [[686, 8], [687, 8], [688, 8]],
  SHAFT: [689, 700], RETURN: { col: 689, y0: 8, y1: 19 }, FLOOR: 19, SLABS: [[690, 692], [694, 696], [698, 700]], SLAB_ROW: 9, WEIGHTS: [691, 695, 699], FAR: [701, 703, 8], ALCOVE: [686, 688, 17, 19],
  GALLERY: { x0: 704, x1: 715, row: 12, ladder: 712 }, HOLE: [708, 13],
  FOES: { b1: [['soldier', 665, 11], ['javelin', 667, 11]], b2: [['shield', 675, 7], ['archer', 671, 5], ['gobgeo', 683, 4]], b3: [['gobgeo', 702, 8]], b4: [['heavy', 707, 19], ['soldier', 710, 19], ['javelin', 714, 19]] },
};
export function queenStairLay(R, { T, TS, insertColumns }) {
  if (!insertColumns) return R;
  const B = QS; insertColumns(R, B.AT, B.ADD);
  const W = R.W, H = R.H, g = R.grid;
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y * W + x] = v; };
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR), block = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.SOLID);
  const plat = (x, y, n) => fill(x, x + n - 1, y, y, T.ONEWAY), rungs = (x, y0, y1) => fill(x, x, y0, y1, T.NET);
  const ent = (t, x, y, o = {}) => R.ents.push({ t, x, y, ...o });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const sup = o => (R.routeSupports || (R.routeSupports = [])).push(o);
  R.rocklocks = R.rocklocks || []; R.reachSpans = R.reachSpans || []; R.hcDeco = R.hcDeco || []; R.masonry = R.masonry || []; R.interiors = R.interiors || []; R.calm = R.calm || [];

  // ---- B1: the courtyard in front of the barred doors, and the stone flights up its face ----
  air(652, 660, 0, 19);
  for (const [a, b, st] of B.STEPS) block(a, b, st + 1, 19);
  const [l0, l1, ls] = B.L1; air(l0, 663, 0, ls); air(664, l1, 2, ls);
  air(661, 662, 14, 19); air(664, l1, 14, 19);                                   // the gate's passage behind the portcullis, sealed (it is her door)
  fill(B.PORTCULLIS.col, B.PORTCULLIS.col, B.PORTCULLIS.y0, B.PORTCULLIS.y1, T.PORT);
  ent('check', B.SHRINE[0], B.SHRINE[1]);
  ent('sign', 652, 19, { text: 'SHE HAS BARRED HER DOORS. UP AND OVER.' });
  for (const [t, x, y] of B.FOES.b1) ent(t, x, y, { face: -1, awake: true });
  ent('torch', 653, 19); ent('torch', 662, 11); coins([655, 16], [658, 14], [661, 10]);

  // ---- B2: the wind stair up the hall's west tower ----
  const [s0, s1, ss] = B.STEP2; air(s0, s1, 2, ss);
  const [m0, m1, ms] = B.L2; air(m0, m1, 2, ms);
  plat(B.ARCHER.x0, B.ARCHER.row, B.ARCHER.x1 - B.ARCHER.x0 + 1); plat(B.CATWALK.x0, B.CATWALK.row, B.CATWALK.x1 - B.CATWALK.x0 + 1);
  const La = B.LADDER1; rungs(La.col, La.net[0], La.net[1]); fill(La.col, La.col, La.grille[0], La.grille[1], T.PORT);   // the grille over the ladder's foot: a rock sent back shatters it into the ladder
  const [t0, t1, ts] = B.LT; air(t0, t1, 2, ts);
  air(B.LADDER2.col, B.LADDER2.col, 2, 4); rungs(B.LADDER2.col, B.LADDER2.y0, B.LADDER2.y1);
  for (const [x, st] of B.SPOTS) air(x, x, 2, st);
  for (const x of [670, 673, 674, 680]) sup({ x, y: B.ARCHER.row, bottom: B.ARCHER.row + 2, top: 2, kind: 'hcchain' });
  for (const [t, x, y] of B.FOES.b2) { const o = { face: -1 }; if (t === 'gobgeo') Object.assign(o, { seal: 'qs-grille', leash: 5, sight: 300 }); ent(t, x, y, o); }
  R.rocklocks.push({ id: 'qs-grille', kind: 'seal', x: La.col, y: 5, box: [La.col, La.col, 3, 7], cells: [[La.col, La.grille[0], La.grille[1], 'net']], seal: 'qs-grille' });
  ent('sign', 672, 7, { text: 'SEND HIS ROCK BACK AT THE GEOMANCER: THE GRILLE BREAKS INTO A LADDER. OR GO ROUND.' });
  ent('torch', 669, 9); ent('torch', 678, 7); coins([672, 5], [676, 5], [679, 5], [683, 3]);
  (R.gusts = R.gusts || []).push({ x0: 664 * TS, x1: 684 * TS, y0: 2 * TS, y1: 12 * TS, dir: -1, period: 5.5, on: 1.6, phase: 1, told: true });   // headwind gusts on the wind stair, told

  // ---- B3: the court mages' geode store ----
  const [h0, h1] = B.SHAFT; air(h0, h1, 2, B.FLOOR); rungs(B.RETURN.col, B.RETURN.y0, B.RETURN.y1);
  const [f0, f1, fs] = B.FAR; air(f0, f1, 2, fs);
  air(B.ALCOVE[0], B.ALCOVE[1], B.ALCOVE[2], B.ALCOVE[3]); coins([686, 18], [687, 18], [688, 18], [687, 19]); ent('mend', 686, 19);
  ent('gobgeo', B.FOES.b3[0][1], B.FOES.b3[0][2], { face: -1, seal: 'qs-store', leash: 6, sight: 340 });
  B.WEIGHTS.forEach((wc, i) => {
    const [a, b] = B.SLABS[i];
    R.rocklocks.push({ id: 'qs-w' + i, kind: 'weight', x: wc, y: 5, box: [wc, wc, 5, 9], lay: [[a, b, B.SLAB_ROW]], seal: 'qs-store' });
    R.reachSpans.push([a, b, B.SLAB_ROW]);
  });
  ent('sign', 686, 8, { text: 'HIS ROCK, SENT BACK, DROPS THE FIRST WEIGHT: A SLAB SWINGS LEVEL. THREE MAKE A BRIDGE.' });
  ent('torch', 687, 4); ent('torch', 703, 8); coins([691, 8], [695, 8], [699, 8]);

  // ---- B4: the gallery over her door ----
  const G = B.GALLERY; air(704, 715, 2, 19);
  plat(G.x0, G.row, G.ladder - G.x0); plat(G.ladder + 1, G.row, G.x1 - G.ladder); rungs(G.ladder, G.row, 19);
  ent('murderhole', B.HOLE[0], B.HOLE[1], { n: 7 });                              // MURDER HOLE #7: a slot in the gallery floor over her door guard (the stone drops thirteen rows... onto the heavy)
  for (const x of [G.x0, G.x1]) sup({ x, y: G.row, bottom: 20, kind: 'hcpier' });
  for (const x of [706, 710, 714]) R.hcDeco.push({ k: 'corbel', x, y: G.row + 7 / 16, n: 1 });
  for (const [t, x, y] of B.FOES.b4) ent(t, x, y, { face: -1 });
  ent('sign', 705, 11, { text: 'STRIKE THE SLOT: THE STONE DROPS ON HER DOOR GUARD. THEN THE LADDER.' });
  ent('torch', 706, 11); ent('torch', 714, 11); coins([708, 10], [712, 10]);

  // ---- the section's look: stone tower, an interior store, no garrison sprinkling, snow ----
  R.masonry.push([661, 703, 0, 19]); R.interiors.push([685, 703, 2, 19, 'gq3store']); R.calm.push([652, 715, 0, 19]);
  R.hcQueenStair = true;
  return R;
}
