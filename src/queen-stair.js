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
import { G4, SH_STAIR, SHIFT } from './gq4l.js';
const a = SH_STAIR, b = SH_STAIR + SHIFT.stair;   /* (claude/gq4l) columns B1-B3 slide `a` (the battlements' +60), B4 `b` (+36 more: B3b the ARMOURY LANDING 16 cols, B3c the ROOF LEADS 20 cols sit between them); OFF: both 0 */
export const QS = {
  AT: 652 + a, ADD: 64 + SHIFT.stair, SHRINE: [650 + a, 19],
  STEPS: [[654 + a, 656 + a, 17], [657 + a, 658 + a, 15], [659 + a, 660 + a, 13]],   // [x0, x1, stand row]: solid stone flights up the gatehouse face
  L1: [661 + a, 667 + a, 11], PORTCULLIS: { col: 663 + a, y0: 14, y1: 19 },
  STEP2: [668 + a, 669 + a, 9], L2: [670 + a, 681 + a, 7], ARCHER: { x0: 670 + a, x1: 673 + a, row: 6 }, CATWALK: { x0: 674 + a, x1: 680 + a, row: 6 }, LADDER1: { col: 681 + a, net: [4, 5], grille: [6, 7] },
  LT: [682 + a, 684 + a, 4], LADDER2: { col: 685 + a, y0: 5, y1: 8 }, SPOTS: [[686 + a, 8], [687 + a, 8], [688 + a, 8]],
  SHAFT: [689 + a, 700 + a], RETURN: { col: 689 + a, y0: 8, y1: 19 }, FLOOR: 19, SLABS: [[690 + a, 692 + a], [694 + a, 696 + a], [698 + a, 700 + a]], SLAB_ROW: 9, WEIGHTS: [691 + a, 695 + a, 699 + a], FAR: [701 + a, 703 + a, 8], ALCOVE: [686 + a, 688 + a, 17, 19],
  GALLERY: { x0: 704 + b, x1: 715 + b, row: 12, ladder: 712 + b }, HOLE: [708 + b, 13],
  /* (gq4l) B3b THE ARMOURY LANDING (16 cols, a + 61 ... a + 76): two stone flights down to a landing between racks of royal arms (stone niches); B3c THE ROOF LEADS (20 cols): up onto an open lead roof over the hall, gusts, a grated chimney stack */
  B3B: G4 ? { x0: 704 + a, x1: 719 + a, f1: [704 + a, 705 + a, 9], f2: [706 + a, 707 + a, 10], land: [708 + a, 715 + a, 11], up1: [716 + a, 717 + a, 10], up2: [718 + a, 719 + a, 9], niches: [709 + a, 712 + a, 714 + a] } : null,
  B3C: G4 ? { x0: 720 + a, x1: 739 + a, row: 8, stack: [728 + a, 730 + a, 6, 8], top: 5, hearth: 729 + a } : null,
  FOES: { b1: [['soldier', 665 + a, 11], ['javelin', 667 + a, 11]], b2: [['shield', 675 + a, 7], ['archer', 671 + a, 5], ['gobgeo', 683 + a, 4]], b3: [['gobgeo', 702 + a, 8]], b4: [['heavy', 707 + b, 19], ['soldier', 710 + b, 19], ['javelin', 714 + b, 19]] },
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
  air((652 + a), (660 + a), 0, 19);
  for (const [a, b, st] of B.STEPS) block(a, b, st + 1, 19);
  const [l0, l1, ls] = B.L1; air(l0, (663 + a), 0, ls); air((664 + a), l1, 2, ls);
  air((661 + a), (662 + a), 14, 19); air((664 + a), l1, 14, 19);                                   // the gate's passage behind the portcullis, sealed (it is her door)
  fill(B.PORTCULLIS.col, B.PORTCULLIS.col, B.PORTCULLIS.y0, B.PORTCULLIS.y1, T.PORT);
  ent('check', B.SHRINE[0], B.SHRINE[1]);
  ent('sign', (652 + a), 19, { text: 'SHE HAS BARRED HER DOORS. UP AND OVER.' });
  for (const [t, x, y] of B.FOES.b1) ent(t, x, y, { face: -1, awake: true });
  ent('torch', (653 + a), 19); ent('torch', (662 + a), 11); coins([(655 + a), 16], [(658 + a), 14], [(661 + a), 10]);

  // ---- B2: the wind stair up the hall's west tower ----
  const [s0, s1, ss] = B.STEP2; air(s0, s1, 2, ss);
  const [m0, m1, ms] = B.L2; air(m0, m1, 2, ms);
  plat(B.ARCHER.x0, B.ARCHER.row, B.ARCHER.x1 - B.ARCHER.x0 + 1); plat(B.CATWALK.x0, B.CATWALK.row, B.CATWALK.x1 - B.CATWALK.x0 + 1);
  const La = B.LADDER1; rungs(La.col, La.net[0], La.net[1]); fill(La.col, La.col, La.grille[0], La.grille[1], T.PORT);   // the grille over the ladder's foot: a rock sent back shatters it into the ladder
  const [t0, t1, ts] = B.LT; air(t0, t1, 2, ts);
  air(B.LADDER2.col, B.LADDER2.col, 2, 4); rungs(B.LADDER2.col, B.LADDER2.y0, B.LADDER2.y1);
  for (const [x, st] of B.SPOTS) air(x, x, 2, st);
  for (const x of [(670 + a), (673 + a), (674 + a), (680 + a)]) sup({ x, y: B.ARCHER.row, bottom: B.ARCHER.row + 2, top: 2, kind: 'hcchain' });
  for (const [t, x, y] of B.FOES.b2) { const o = { face: -1 }; if (t === 'gobgeo') Object.assign(o, { seal: 'qs-grille', leash: 5, sight: 300 }); ent(t, x, y, o); }
  R.rocklocks.push({ id: 'qs-grille', kind: 'seal', x: La.col, y: 5, box: [La.col, La.col, 3, 7], cells: [[La.col, La.grille[0], La.grille[1], 'net']], seal: 'qs-grille' });
  ent('sign', (672 + a), 7, { text: 'SEND HIS ROCK BACK AT THE GEOMANCER: THE GRILLE BREAKS INTO A LADDER. OR GO ROUND.' });
  ent('torch', (669 + a), 9); ent('torch', (678 + a), 7); coins([(672 + a), 5], [(676 + a), 5], [(679 + a), 5], [(683 + a), 3]);
  (R.gusts = R.gusts || []).push({ x0: (664 + a) * TS, x1: (684 + a) * TS, y0: 2 * TS, y1: 12 * TS, dir: -1, period: 5.5, on: 1.6, phase: 1, told: true });   // headwind gusts on the wind stair, told

  // ---- B3: the court mages' geode store ----
  const [h0, h1] = B.SHAFT; air(h0, h1, 2, B.FLOOR); rungs(B.RETURN.col, B.RETURN.y0, B.RETURN.y1);
  const [f0, f1, fs] = B.FAR; air(f0, f1, 2, fs);
  air(B.ALCOVE[0], B.ALCOVE[1], B.ALCOVE[2], B.ALCOVE[3]); coins([(686 + a), 18], [(687 + a), 18], [(688 + a), 18], [(687 + a), 19]); ent('mend', (686 + a), 19);
  ent('gobgeo', B.FOES.b3[0][1], B.FOES.b3[0][2], { face: -1, seal: 'qs-store', leash: 6, sight: 340 });
  B.WEIGHTS.forEach((wc, i) => {
    const [a, b] = B.SLABS[i];
    R.rocklocks.push({ id: 'qs-w' + i, kind: 'weight', x: wc, y: 5, box: [wc, wc, 5, 9], lay: [[a, b, B.SLAB_ROW]], seal: 'qs-store' });
    R.reachSpans.push([a, b, B.SLAB_ROW]);
  });
  ent('sign', (686 + a), 8, { text: 'HIS ROCK, SENT BACK, DROPS THE FIRST WEIGHT: A SLAB SWINGS LEVEL. THREE MAKE A BRIDGE.' });
  ent('torch', (687 + a), 4); ent('torch', (703 + a), 8); coins([(691 + a), 8], [(695 + a), 8], [(699 + a), 8]);

  // ---- (gq4l) B3b THE ARMOURY LANDING + B3c THE ROOF LEADS (the 36 columns the stair gained: between the geode store's far ledge and the gallery over her door) ----
  if (G4) {
    const K = B.B3B, C = B.B3C;
    air(K.x0, K.x1, 2, 19);
    for (const [x0, x1, st] of [K.f1, K.f2, K.land, K.up1, K.up2]) block(x0, x1, st + 1, 19);          // two stone flights down to a landing, two short steps up out of it: all solid stone
    for (const x of K.niches) { ent('torch', x, 10); R.hcDeco.push({ k: 'armrack', x, y: 11 }); }       // racks of royal arms in stone niches (no timber)
    ent('hedgeknight', K.land[0] + 2, 11, { face: -1, cnSkin: 'gobknight' }); ent('shield', K.land[0] + 5, 11, { face: -1 }); ent('hedgeknight', K.land[1] - 1, 11, { face: -1, cnSkin: 'gobknight' });
    ent('sign', K.x0, 8, { text: 'HER KNIGHTS: ONE MARK ROUND THE SIDE. ROLL IT OR TAKE THE BEAT.' });
    coins([K.land[0] + 1, 10], [K.land[0] + 4, 10], [K.land[1] - 3, 10]);
    air(C.x0, C.x1, 0, C.row); block(C.x0, C.x1, C.row + 1, 19);                                          // the open lead roof over the hall (stand row 8, sky above)
    block(C.stack[0], C.stack[1], C.stack[2], C.stack[3]);                                                // ONE chimney stack: three rows high, a jump (a hearth behind a grate)
    R.hcDeco.push({ k: 'chimney', x0: C.stack[0], x1: C.stack[1], y: C.stack[2] });
    ent('gobmage', C.hearth, C.top, { face: -1, cnSkin: 'firemage' });                                    // the fire mage on the stack: his fire hurts (told); the hearth under him is grated and only smokes
    ent('stiltwalker', C.x0 + 4, C.row, { face: -1, beat: 3 }); ent('stiltwalker', C.x1 - 5, C.row, { face: -1, beat: 3 });
    ent('sign', C.x0, C.row, { text: 'THE ROOF LEADS. THE GRATED HEARTH STAYS IN. THE MAGE FIRE DOES NOT.' });
    ent('torch', C.x0 + 2, C.row); ent('torch', C.x1 - 2, C.row); coins([C.x0 + 8, C.row], [C.x0 + 12, C.row - 1], [C.x1 - 2, C.row]);
    (R.gusts = R.gusts || []).push({ x0: C.x0 * TS, x1: (C.x1 + 1) * TS, y0: 0, y1: (C.row + 1) * TS, dir: -1, period: 5.0, on: 1.6, phase: 2, told: true });
    R.hcDeco.push({ k: 'corbel', x: K.land[0], y: 12 + 7 / 16, n: 2 });
  }

  // ---- B4: the gallery over her door ----
  const G = B.GALLERY; air((704 + b), (715 + b), 2, 19);
  plat(G.x0, G.row, G.ladder - G.x0); plat(G.ladder + 1, G.row, G.x1 - G.ladder); rungs(G.ladder, G.row, 19);
  ent('murderhole', B.HOLE[0], B.HOLE[1], { n: 7 });                              // MURDER HOLE #7: a slot in the gallery floor over her door guard (the stone drops thirteen rows... onto the heavy)
  for (const x of [G.x0, G.x1]) sup({ x, y: G.row, bottom: 20, kind: 'hcpier' });
  for (const x of [(706 + b), (710 + b), (714 + b)]) R.hcDeco.push({ k: 'corbel', x, y: G.row + 7 / 16, n: 1 });
  for (const [t, x, y] of B.FOES.b4) ent(t, x, y, { face: -1 });
  ent('sign', (705 + b), 11, { text: 'STRIKE THE SLOT: THE STONE DROPS ON HER DOOR GUARD. THEN THE LADDER.' });
  ent('torch', (706 + b), 11); ent('torch', (714 + b), 11); coins([(708 + b), 10], [(712 + b), 10]);

  // ---- the section's look: stone tower, an interior store, no garrison sprinkling, snow ----
  R.masonry.push([(661 + a), (703 + a), 0, 19]); if (G4) R.masonry.push([B.B3B.x0, B.B3B.x1, 0, 19]); R.interiors.push([(685 + a), (703 + a), 2, 19, 'gq3store']); R.calm.push([(652 + a), (715 + b), 0, 19]);
  R.hcQueenStair = true;
  return R;
}
