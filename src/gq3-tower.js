/* src/gq3-tower.js - THE BURNING TOWER and THE TOWER TOP, REBUILT (claude/gq3, Daniel 11-09 15:45; scratch/lane-reports/gq3-plan.md items 6 + 7). The level half: called LAST by highcrownThree
   (src/highcrown2.js), after the Queen's Stair, on the FINAL columns. The burning-HALL climb (rafters, roof slates, stack javelins, two hall portals) is RETIRED; her flee portal stays open in the
   hall (L.gqEscape.portal) and takes you to THE FOOT OF THE BURNING TOWER, a vertical shaft under the tower-top deck: five storeys of 12 rows (timber floors), a ladder through each floor's
   stairwell (the gaps alternate west / east), then the hatch in the deck floor. The tower's rules (burning floors behind you, falling beams, her portal hops and shard volley) are the hands'
   (src/gqueen-hands.js); the foes are laid here: S1 soldier + javelin, S2 shield + an archer on a ledge, S3 a Geomancer, S4 two castle hounds, S5 a heavy at the hatch.
   THE TOWER TOP (phase two) is 60 columns now (776-836): WEST + EAST PARAPET WALKS (one-way stone, 9 cols each) with a two-step stair up each, a central BELL CUPOLA (4 solid cols, a one-way
   frame over it) in place of the lone chimney, FOUR ROOF BAYS A-D on the deck (they burn, told), and FIVE PORTAL RINGS (deck W / E, both parapets, the cupola top). */
import { SH_HALL, G4 } from './gq4l.js';
const d = SH_HALL;   /* (claude/gq4l) the Queen's hall, her escape and the tower top slide east whole (+96 with GQ4L_SHIPS; 0 off) */
/* (claude/gq4l, GQ4L_SHIPS) THE BURNING TOWER 5 -> 7 STOREYS, then THE OUTSIDE: storeys 5-7 (k 4-6) burn (hurting tapestries, told by sparks; a red-hot ceiling); storey 7's east wall is blown out (THE BREACH, rows 51-55);
   the final stretch is ~36 rows up the tower's outer face in the open (OUT: a pocket of sky, cols 904-931, rows 22-55): FLIGHT 1 east, stone CORBELS west, the broken HOARDING east (charred boards crumble
   1.0 s after you stand, a creak first: the catch ledge is the corbel beam under it - never a death fall), FLIGHT 2 west, FLIGHT 3 east, then the top landing and a ladder up through a mouth in the deck floor
   (the parapet stair) onto the tower top. The tower body grows DOWN: nothing above row 20 moves. OFF: master's five storeys and the hatch. */
const FL = G4 ? [128, 116, 104, 92, 80, 68, 56] : [81, 69, 57, 45, 33];
const LAD = G4 ? [1, 2, 3, 4, 5, 6].map(k => [(k % 2 ? 784 : 803) + d, FL[k] - 1, FL[k - 1] - 1]) : [[(784 + d), 68, 80], [(803 + d), 56, 68], [(784 + d), 44, 56], [(803 + d), 32, 44]];
const GAP = G4 ? [1, 2, 3, 4, 5, 6].map(k => k % 2 ? [783 + d, 785 + d] : [802 + d, 804 + d]) : [[(783 + d), (785 + d)], [(802 + d), (804 + d)], [(783 + d), (785 + d)], [(802 + d), (804 + d)]];
const row0 = k => FL[k] - 1;   /* storey k's standing row */
const FOES_G4 = [['soldier', 795 + d, row0(0)], ['javelin', 798 + d, row0(0)], ['shield', 794 + d, row0(1)], ['archer', 789 + d, FL[1] - 4], ['gobgeo', 796 + d, row0(2)], ['hound', 790 + d, row0(3)], ['hound', 797 + d, row0(3)],
  ['gobknight', 796 + d, row0(4)], ['firemage', 799 + d, row0(5)], ['soldier', 790 + d, row0(5)], ['heavy', 794 + d, row0(6)]];
export const TW = {
  DECK: { x0: (776 + d), x1: (836 + d), floor: 20 },                                   // wall column to wall column; the deck floor is row 20 (stand 19)
  SHAFT: [(782 + d), (805 + d)], FLOORS: FL,                         // interior columns; the floor tile row of storeys 0..4 (stand = row - 1)
  LADDERS: LAD,   // [column, top row, bottom row]: the ladder through floor 1..4's stairwell
  GAPS: GAP,
  HATCH: { cols: [(792 + d), (793 + d)], ladder: [(792 + d), 19, 32] },
  PARAPETS: { w: [(778 + d), (786 + d)], e: [(826 + d), (834 + d)], row: 16, stepW: [(787 + d), (788 + d)], stepE: [(824 + d), (825 + d)], stepRow: 18 },
  CUPOLA: { x0: (804 + d), x1: (807 + d), solid: [17, 19], frame: [(803 + d), (808 + d), 14] },
  BAYS: [[(779 + d), (784 + d)], [(795 + d), (800 + d)], [(811 + d), (816 + d)], [(827 + d), (832 + d)]],                  // A, B, C, D: floor spans (cols) that burn, one at a time
  RINGS: [{ id: 'dw', x: (782 + d), y: 19 }, { id: 'de', x: (830 + d), y: 19 }, { id: 'pw', x: (782 + d), y: 15 }, { id: 'pe', x: (830 + d), y: 15 }, { id: 'cu', x: (806 + d), y: 13 },
    { id: 'dm', x: (799 + d), y: 19, noStorm: true }, { id: 'dn', x: (811 + d), y: 19, noStorm: true }],   /* (gq3fix) two MID-DECK rings (blink exits only - the portal storm still lights the five): on a 60-column deck split by the cupola, the two end rings were 380 px from a hero in the middle, so a blink's 1.2 s opening was never in a blade's reach */
  FOLLOW: { shrine: [(795 + d), 19], begin: (800 + d) },                               // the roof shrine at the hatch top; the fight begins when you walk past col 800
  FOES: G4 ? FOES_G4 : [['soldier', (795 + d), 80], ['javelin', (798 + d), 80], ['shield', (794 + d), 68], ['archer', (789 + d), 65], ['gobgeo', (796 + d), 56], ['hound', (790 + d), 44], ['hound', (797 + d), 44], ['heavy', (796 + d), 32]],
  BURN: G4 ? [4, 5, 6] : [],                                                // storeys 5-7 burn (hurting tapestries, red ceiling, beams every 5-7 s)
  TAPS: G4 ? [4, 5, 6].flatMap(k => [{ k, x: 789 + d, per: 3.6, ph: k * 0.7 }, { k, x: 797 + d, per: 3.9, ph: k * 0.7 + 1.6 }]) : [],   /* tapestries (cols): flare 1.2 s of every `per` s, sparks 1.0 s before */
  OUT: null,
};
if (G4) {   /* the outside stretch's data, in the final columns (the pocket is cols 904-931 = 808-835 + 96), rows 22-55 over a solid floor at row 56; rows are TILE rows (a platform at tile row r is stood on at r - 1) */
  const o = 808 + d;
  TW.OUT = { x0: o, x1: o + 27, top: 22, floor: 56, mouth: [834 + d, 835 + d], mouthLadder: 835 + d, breach: [806 + d, 807 + d, 51, 55],
    flights: [   /* ONEWAY steps 2 cols wide, one row each: { first step's left col, its tile row, steps, direction } */
      { id: 'f1', x: o + 6, row: 55, n: 8, dir: 1 }, { id: 'f2', x: o + 18, row: 36, n: 6, dir: -1 }, { id: 'f3', x: o + 8, row: 29, n: 6, dir: 1 }],
    landings: [[o + 22, o + 27, 47], [o, o + 7, 30], [o + 20, o + 27, 23]],      /* the east landing, the west landing, the TOP landing (the ladder to the deck is at the mouth) */
    corbels: [[o + 17, o + 19, 45], [o + 12, o + 14, 43], [o + 7, o + 9, 41]], catch: [o, o + 9, 39],   /* stone corbels west, then the catch beam under the hoarding */
    hoard: { row: 37, x0: o + 2, x1: o + 21, seg: 2 },
    spire: [o + 25, o + 27, 52, 55],                                              /* the neighbouring spire: the archer's perch (stand row 51) */
    perches: [[o + 24, 47], [o + 3, 39], [o + 3, 30], [o + 24, 23]],              /* where the Queen stands to watch (x col, tile row of the floor) */
    foes: [['archer', o + 26, 51], ['javelin', o + 18, 44], ['javelin', o + 13, 42], ['gobknight', o + 24, 22]] };
}

/* (claude/gq4l) THE BREACH and THE OUTSIDE STRETCH (greybox): a pocket of sky on the tower's outer face, three exterior flights, stone corbels, a crumbling hoarding over a catch beam, a mouth in the deck floor with a ladder. */
function gq4Outside(R, TW, { T, TS, fill, air, block, plat, rungs, ent, coins }) {
  const O = TW.OUT, F = TW.FLOORS, D = TW.DECK, top = F[F.length - 1];
  air(O.breach[0], O.breach[1], O.breach[2], O.breach[3]);                                   // storey 7's east wall blown out: THE BREACH
  air(O.x0, O.x1, O.top, O.floor - 1);                                                       // the open air on the outer face
  for (const [a, b, row] of O.landings) fill(a, b, row, row, T.ONEWAY);
  for (const f of O.flights) for (let i = 0; i < f.n; i++) { const x = f.x + f.dir * 2 * i; fill(x, x + 1, f.row - i, f.row - i, T.ONEWAY); }
  for (const [a, b, row] of O.corbels) fill(a, b, row, row, T.ONEWAY);
  fill(O.catch[0], O.catch[1], O.catch[2], O.catch[2], T.ONEWAY);
  fill(O.hoard.x0, O.hoard.x1, O.hoard.row, O.hoard.row, T.ONEWAY);                          // the hoarding's boards (they crumble: src/gqueen-hands.js, tower climb)
  block(O.spire[0], O.spire[1], O.spire[2], O.spire[3]);                                     // the neighbouring spire
  air(O.mouth[0], O.mouth[1], D.floor, D.floor + 1); rungs(O.mouthLadder, 19, 22);          // the parapet stair: a mouth in the deck floor, a ladder up onto the tower top
  R.routeSupports = R.routeSupports || [];
  for (const [a, b, row] of O.corbels) R.hcDeco = (R.hcDeco || []).concat([{ k: 'corbel', x: a, y: row + 7 / 16, n: 2 }]);
  for (const [t, x, y] of O.foes) { if (t === 'gobknight') ent('hedgeknight', x, y, { face: -1, cnSkin: 'gobknight' }); else ent(t, x, y, { face: -1 }); }
  ent('torch', O.x0 + 2, 55); ent('torch', O.x1 - 1, 22);
  ent('sign', O.x0 + 1, 55, { text: 'THE BREACH. CLIMB THE OUTSIDE: THE BOARDS CRUMBLE, THE WIND PUSHES.' });
  ent('sign', O.x0 + 22, 46, { text: 'HER BOULDERS: STRIKE ONE AND IT FLIES BACK UP.' });
  coins([O.x0 + 8, 53], [O.x0 + 22, 45], [O.x0 + 14, 41], [O.x0 + 8, 36], [O.x0 + 16, 27]);
  (R.gusts = R.gusts || []).push({ x0: O.x0 * TS, x1: (O.x1 + 1) * TS, y0: O.top * TS, y1: O.floor * TS, dir: -1, period: 5.5, on: 1.6, phase: 0.5, told: true });
  (R.interiors = R.interiors || []);
}
export function towerLay(R, { T, TS }) {
  const D = TW.DECK, A = R.arenaRoof; if (!A) return R;
  // ---- grow the island east: 60 columns, wall to wall (the old deck was 48) ----
  const W0 = R.W, add = (D.x1 + 5) - W0, W2 = W0 + Math.max(0, add), H0 = R.H, H = G4 ? Math.max(H0, TW.FLOORS[0] + 5) : H0;   /* (gq4l) the tower body grows DOWN: seven storeys under the outside stretch */
  if (add > 0 || H > H0) { const g2 = new Uint8Array(W2 * H).fill(T.SOLID); for (let y = 0; y < H0; y++) g2.set(R.grid.subarray(y * W0, y * W0 + W0), y * W2);
    for (let y = H0; y < H; y++) for (let x = 0; x < Math.min(W0, D.x0 - 2); x++) g2[y * W2 + x] = R.grid[(H0 - 1) * W0 + x];   /* (gq4l) the new rows under the old world keep its bottom row (a pit stays a pit to the void); only the tower's own columns are rock */
    R.grid = g2; R.W = W2; R.H = H; }
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
  const shaftTop = G4 ? F[F.length - 1] - 11 : 22;
  if (!G4) air(TW.HATCH.cols[0], TW.HATCH.cols[1], 20, 21);   /* (gq4l) ON: no hatch - the way onto the tower top is the outside stretch's parapet stair */
  air(s0, s1, shaftTop, F[0] - 1);
  for (let k = 1; k < F.length; k++) { fill(s0, s1, F[k], F[k], T.PLANK); const [a, b] = TW.GAPS[k - 1]; air(a, b, F[k], F[k]); }
  for (const [c, y0, y1] of TW.LADDERS) rungs(c, y0, y1);
  if (!G4) rungs(TW.HATCH.ladder[0], TW.HATCH.ladder[1], TW.HATCH.ladder[2]);
  // the archer's ledge in storey 1 (one-way, three rows over its floor) and a foothold for the Geomancer's storey
  const lr = G4 ? F[1] - 3 : 66; plat((787 + d), (792 + d), lr); (R.routeSupports).push({ x: (787 + d), y: lr, bottom: lr + 3, kind: 'hcpier' }, { x: (792 + d), y: lr, bottom: lr + 3, kind: 'hcpier' });
  for (const [t, x, y] of TW.FOES) { const o = { face: -1 }; if (t === 'gobgeo') Object.assign(o, { leash: 8, sight: 300 });
    if (t === 'gobknight') ent('hedgeknight', x, y, { ...o, cnSkin: 'gobknight' }); else if (t === 'firemage') ent('gobmage', x, y, { ...o, cnSkin: 'firemage' }); else ent(t, x, y, o); }
  for (let k = 0; k < F.length; k++) { ent('torch', s0 + 3, F[k] - 1); ent('torch', s1 - 3, F[k] - 1); }
  if (G4) for (let k = 0; k < F.length; k++) coins([790 + d, F[k] - 2], [800 + d, F[k] - 2]);
  else coins([(790 + d), 79], [(800 + d), 79], [(800 + d), 67], [(790 + d), 55], [(800 + d), 43], [(790 + d), 31], [(800 + d), 31]);
  if (G4) gq4Outside(R, TW, { T, TS, fill, air, block, plat, rungs, ent, coins });
  // ---- the shrine on the deck beside the hatch top, her sign ----
  ent('check', TW.FOLLOW.shrine[0], TW.FOLLOW.shrine[1]);
  ent('torch', (790 + d), 19); ent('torch', (822 + d), 19); ent('deco', (800 + d), 19, { kind: 'banner', v: 1 }); ent('deco', (812 + d), 19, { kind: 'banner', v: 0 });
  // ---- the arena (phase two) ----
  Object.assign(A, { x0: D.x0 * TS, x1: D.x1 * TS, floor: D.floor * TS, wallL: D.x0 - 1, wallR: D.x1 + 1, exit: { x: TW.FOLLOW.begin, y: 19 }, hatches: [], stack: [C.x0, C.x1], poles: [(790 + d), (822 + d)], tower: TW, noWall: true });
  // ---- the escape table (the burning-hall climb is retired: no rafters, no roof slates, no hall portals) ----
  const Ar = R.arena, hallPortal = { x: (748 + d), y: 19 };   /* on the hall floor in front of the dais steps */
  R.gqEscape = { tiers: [], supports: [], hallPortals: [], slates: null, throwers: [], tower: TW, start: { x: (790 + d), y: F[0] - 1 }, check: { x: TW.FOLLOW.shrine[0], y: TW.FOLLOW.shrine[1] }, portal: hallPortal,
    route: G4 ? [[hallPortal.x, 19]].concat(TW.LADDERS.flatMap(([c, y0, y1]) => [[c, y1], [c, y0]]), [[TW.OUT.x0 + 2, 55], [TW.OUT.x0 + 24, 46], [TW.OUT.x0 + 3, 38], [TW.OUT.x0 + 3, 29], [TW.OUT.x0 + 24, 22], [TW.OUT.mouthLadder, 19], [TW.FOLLOW.shrine[0], 19]])
      : [[hallPortal.x, 19], [(784 + d), 80], [(784 + d), 68], [(803 + d), 56], [(784 + d), 44], [(803 + d), 32], [(792 + d), 20], [TW.FOLLOW.shrine[0], 19]] };
  (R.masonry = R.masonry || []).push([s0 - 1, s1 + 1, shaftTop, F[0]]); (R.interiors = R.interiors || []).push([s0, s1, shaftTop, F[0] - 1, 'gq3shaft']);
  (R.calm = R.calm || []).push([s0 - 2, s1 + 2, 22, G4 ? F[0] + 2 : 82], [D.x0, D.x1, 0, 19]);
  ent('sign', hallPortal.x - 3, 19, { text: 'SHE HAS GONE THROUGH HER PORTAL AND THE TOWER IS ON FIRE. FOLLOW HER UP.' });
  ent('sign', (786 + d), G4 ? F[0] - 1 : 80, { text: G4 ? 'THE UPPER STOREYS BURN. MIND THE BEAMS AND THE HANGINGS.' : 'THE FLOORS BEHIND YOU CATCH. UP THE LADDERS, AND MIND THE BEAMS.' });
  R.ents = R.ents.filter(e => !(e.t === 'sign' && /THE FIRE HAS TAKEN HER HALL/.test(e.text || '')));   /* the burning-hall climb's sign goes with it */
  R.gq3Tower = true;
  return R;
}
