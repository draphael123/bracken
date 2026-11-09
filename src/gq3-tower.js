/* src/gq3-tower.js - THE BURNING TOWER and THE TOWER TOP, REBUILT (claude/gq3, Daniel 11-09 15:45; scratch/lane-reports/gq3-plan.md items 6 + 7). The level half: called LAST by highcrownThree
   (src/highcrown2.js), after the Queen's Stair, on the FINAL columns. The burning-HALL climb (rafters, roof slates, stack javelins, two hall portals) is RETIRED; her flee portal stays open in the
   hall (L.gqEscape.portal) and takes you to THE FOOT OF THE BURNING TOWER, a vertical shaft under the tower-top deck: five storeys of 12 rows (timber floors), a ladder through each floor's
   stairwell (the gaps alternate west / east), then the hatch in the deck floor. The tower's rules (burning floors behind you, falling beams, her portal hops and shard volley) are the hands'
   (src/gqueen-hands.js); the foes are laid here: S1 soldier + javelin, S2 shield + an archer on a ledge, S3 a Geomancer, S4 two castle hounds, S5 a heavy at the hatch.
   THE TOWER TOP (phase two) is 60 columns now (776-836): WEST + EAST PARAPET WALKS (one-way stone, 9 cols each) with a two-step stair up each, a central BELL CUPOLA (4 solid cols, a one-way
   frame over it) in place of the lone chimney, FOUR ROOF BAYS A-D on the deck (they burn, told), and FIVE PORTAL RINGS (deck W / E, both parapets, the cupola top). */
export const TW = {
  DECK: { x0: 776, x1: 836, floor: 20 },                                   // wall column to wall column; the deck floor is row 20 (stand 19)
  SHAFT: [782, 805], FLOORS: [81, 69, 57, 45, 33],                         // interior columns; the floor tile row of storeys 0..4 (stand = row - 1)
  LADDERS: [[784, 68, 80], [803, 56, 68], [784, 44, 56], [803, 32, 44]],   // [column, top row, bottom row]: the ladder through floor 1..4's stairwell
  GAPS: [[783, 785], [802, 804], [783, 785], [802, 804]],
  HATCH: { cols: [792, 793], ladder: [792, 19, 32] },
  PARAPETS: { w: [778, 786], e: [826, 834], row: 16, stepW: [787, 788], stepE: [824, 825], stepRow: 18 },
  CUPOLA: { x0: 804, x1: 807, solid: [17, 19], frame: [803, 808, 14] },
  BAYS: [[779, 784], [795, 800], [811, 816], [827, 832]],                  // A, B, C, D: floor spans (cols) that burn, one at a time
  RINGS: [{ id: 'dw', x: 782, y: 19 }, { id: 'de', x: 830, y: 19 }, { id: 'pw', x: 782, y: 15 }, { id: 'pe', x: 830, y: 15 }, { id: 'cu', x: 806, y: 13 }],
  FOLLOW: { shrine: [795, 19], begin: 800 },                               // the roof shrine at the hatch top; the fight begins when you walk past col 800
  FOES: [['soldier', 795, 80], ['javelin', 798, 80], ['shield', 794, 68], ['archer', 789, 65], ['gobgeo', 796, 56], ['hound', 790, 44], ['hound', 797, 44], ['heavy', 796, 32]],
};
export function towerLay(R, { T, TS }) {
  const D = TW.DECK, A = R.arenaRoof; if (!A) return R;
  // ---- grow the island east: 60 columns, wall to wall (the old deck was 48) ----
  const W0 = R.W, add = (D.x1 + 5) - W0, W2 = W0 + Math.max(0, add), H = R.H;
  if (add > 0) { const g2 = new Uint8Array(W2 * H).fill(T.SOLID); for (let y = 0; y < H; y++) g2.set(R.grid.subarray(y * W0, y * W0 + W0), y * W2); R.grid = g2; R.W = W2; }
  const W = R.W, g = R.grid;
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y * W + x] = v; };
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR), block = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.SOLID);
  const plat = (x0, x1, y) => fill(x0, x1, y, y, T.ONEWAY), rungs = (x, y0, y1) => fill(x, x, y0, y1, T.NET);
  const ent = (t, x, y, o = {}) => R.ents.push({ t, x, y, ...o });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  // the old deck's dressing goes (the chimney stack, the old hatches' guards); the sprinkler's loose foe on it too
  R.ents = R.ents.filter(e => !(e.x >= D.x0 && e.x <= D.x1 + 4 && e.y <= 21 && (e.t === 'heavy' || e.t === 'soldier' || e.t === 'javelin' || e.t === 'archer' || e.t === 'deco' || e.t === 'torch' || e.t === 'sign')));
  // ---- the deck: nineteen rows of sky over a floor at row 20, wall to wall ----
  air(D.x0, D.x1, 1, 19); block(D.x0, D.x0, 17, 19); block(D.x1, D.x1, 17, 19); block(D.x0, D.x1, 20, 21);
  // ---- THE PARAPET WALKS (one-way stone, a two-step stair up each) ----
  const P = TW.PARAPETS; plat(P.w[0], P.w[1], P.row); plat(P.e[0], P.e[1], P.row); plat(P.stepW[0], P.stepW[1], P.stepRow); plat(P.stepE[0], P.stepE[1], P.stepRow);
  (R.routeSupports = R.routeSupports || []).push({ x: P.w[0], y: P.row, bottom: 20, kind: 'hcpier' }, { x: P.w[1], y: P.row, bottom: 20, kind: 'hcpier' }, { x: P.e[0], y: P.row, bottom: 20, kind: 'hcpier' }, { x: P.e[1], y: P.row, bottom: 20, kind: 'hcpier' });
  // ---- THE BELL CUPOLA (replaces the chimney): solid rows 17-19, a one-way frame over it ----
  const C = TW.CUPOLA; block(C.x0, C.x1, C.solid[0], C.solid[1]); plat(C.frame[0], C.frame[1], C.frame[2]);
  R.routeSupports.push({ x: C.frame[0], y: C.frame[2], bottom: 17, kind: 'hcpier' }, { x: C.frame[1], y: C.frame[2], bottom: 17, kind: 'hcpier' });
  // ---- THE HATCH and THE BURNING TOWER: a shaft under the deck, five timber storeys, a ladder through each stairwell ----
  const [s0, s1] = TW.SHAFT, F = TW.FLOORS;
  air(TW.HATCH.cols[0], TW.HATCH.cols[1], 20, 21);
  air(s0, s1, 22, F[0] - 1);
  for (let k = 1; k < F.length; k++) { fill(s0, s1, F[k], F[k], T.PLANK); const [a, b] = TW.GAPS[k - 1]; air(a, b, F[k], F[k]); }
  for (const [c, y0, y1] of TW.LADDERS) rungs(c, y0, y1);
  rungs(TW.HATCH.ladder[0], TW.HATCH.ladder[1], TW.HATCH.ladder[2]);
  // the archer's ledge in storey 1 (one-way, three rows over its floor) and a foothold for the Geomancer's storey
  plat(787, 792, 66); (R.routeSupports).push({ x: 787, y: 66, bottom: 69, kind: 'hcpier' }, { x: 792, y: 66, bottom: 69, kind: 'hcpier' });
  for (const [t, x, y] of TW.FOES) { const o = { face: -1 }; if (t === 'gobgeo') Object.assign(o, { leash: 8, sight: 300 }); ent(t, x, y, o); }
  for (const k of [0, 1, 2, 3, 4]) { ent('torch', s0 + 3, F[k] - 1); ent('torch', s1 - 3, F[k] - 1); }
  coins([790, 79], [800, 79], [800, 67], [790, 55], [800, 43], [790, 31], [800, 31]);
  // ---- the shrine on the deck beside the hatch top, her sign ----
  ent('check', TW.FOLLOW.shrine[0], TW.FOLLOW.shrine[1]);
  ent('torch', 790, 19); ent('torch', 822, 19); ent('deco', 800, 19, { kind: 'banner', v: 1 }); ent('deco', 812, 19, { kind: 'banner', v: 0 });
  // ---- the arena (phase two) ----
  Object.assign(A, { x0: D.x0 * TS, x1: D.x1 * TS, floor: D.floor * TS, wallL: D.x0 - 1, wallR: D.x1 + 1, exit: { x: TW.FOLLOW.begin, y: 19 }, hatches: [], stack: [C.x0, C.x1], poles: [790, 822], tower: TW, noWall: true });
  // ---- the escape table (the burning-hall climb is retired: no rafters, no roof slates, no hall portals) ----
  const Ar = R.arena, hallPortal = { x: 748, y: 19 };   /* on the hall floor in front of the dais steps */
  R.gqEscape = { tiers: [], supports: [], hallPortals: [], slates: null, throwers: [], tower: TW, start: { x: 790, y: F[0] - 1 }, check: { x: TW.FOLLOW.shrine[0], y: TW.FOLLOW.shrine[1] }, portal: hallPortal,
    route: [[hallPortal.x, 19], [784, 80], [784, 68], [803, 56], [784, 44], [803, 32], [792, 20], [TW.FOLLOW.shrine[0], 19]] };
  (R.masonry = R.masonry || []).push([s0 - 1, s1 + 1, 22, F[0]]); (R.interiors = R.interiors || []).push([s0, s1, 22, F[0] - 1, 'hcguard']);
  (R.calm = R.calm || []).push([s0 - 2, s1 + 2, 22, 82], [D.x0, D.x1, 0, 19]);
  ent('sign', hallPortal.x - 3, 19, { text: 'SHE HAS GONE THROUGH HER PORTAL AND THE TOWER IS ON FIRE. FOLLOW HER UP.' });
  ent('sign', 786, 80, { text: 'THE FLOORS BEHIND YOU CATCH. UP THE LADDERS, AND MIND THE BEAMS.' });
  R.gq3Tower = true;
  return R;
}
