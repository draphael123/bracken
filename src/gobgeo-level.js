// src/gobgeo-level.js - THE GOBLIN GEOMANCER IN HIGHCROWN (claude/gobgeo, Daniel 11-08 11:54). Called LAST by highcrownThree (src/highcrown2.js), on the built level's
// FINAL columns; it inserts no columns (the level's length and flow stay HCPLAN's), it only lays his rooms into the ones that are there.
// THE LADDER (each step adds one thing; the Queen's parry-back verb, rehearsed):
//   1 TEACH     THE CAPTAINS HALL, west (431-447): a barred gate across the hall at 441 with a GEODE SEAL on it, and ONE Geomancer behind it (448). He can reach you
//               through the bars and you cannot reach him: parry his rock (or strike it) and it flies back and SHATTERS THE SEAL. Nothing else on your side.
//   2 SHIELD    THE CAPTAINS HALL, middle: his SHIELD-BEARER (a shield goblin, 455; the shield wall plants itself between you and a shooter) in front of a second
//               Geomancer (458), the javelineer on the middle balcony over them. A rock sent back meets the shield first: KNOCKED ASIDE.
//   3 LAMP      THE CAPTAINS HALL, east: a third Geomancer on a ledge at the far end (476-478, row 14), the hall's third chandelier between him and the floor, the hall's
//               heavy under it. A rock sent back up at him meets the chandelier: it falls on whoever is under it.
//   4 SECRET    THE BATTLEMENTS, TOWER 1: a Geomancer on its roof behind the west merlon lobs down onto the walk. A rock sent back up at him meets the tower's
//               west face first - and THE OLD STONE there gives: a hidden chamber in the tower (coins and a mend), reached by stone steps on piers.
//   5 COMBINED  THE BATTLEMENTS, WALL 2 east + TOWER 2 (the last walk before the Princess's tower and the Queen): a Geomancer on tower 2's roof, the shield-bearer and
//               the heavy holding the walk, the tower's archer and its guardroom wave - and a GATE BELL hung on the tower's west face over its arch. A rock sent back
//               up at him rings it: the guards run to it, and the arch's gate drops on them (src/bell-gate.js, Stormhold's bell-gate: the Queen's bell-and-grate, small).
// R.rocklocks: [{ id, kind: 'seal' | 'crack', x, y (its centre tile), box [x0, x1, y0, y1] (tiles a sent-back rock must cross), cells [[col, y0, y1]] (opened when smashed), seal (the
// Geomancer bound to it: the seal fails on its own if he is dead - never a soft-lock) }]. src/gobgeo-hands.js reads them.
import { G4 } from './gq4l.js';
export const GOBGEO = {
  CAPT: 431,
  TEACH: { gate: 441, rows: [10, 19], seal: 18, geo: 448 },
  SHIELD: { guard: 455, geo: 458 },
  LAMP: { lamp: 471, ledge: [476, 478], row: 14, net: 476, geo: 478, heavy: 470 },
  T1: { face: 557, box: [7, 13], open: [11, 13], room: [558, 560, 10, 13], ledge: [555, 556, 14], steps: [[549, 550, 18], [552, 553, 15]], geo: 559 },
  T2: { bell: 601, bellRow: 14, gate: 602, gy: [15, 21], geo: 604, shield: 588, heavy: 594 },
  /* (claude/gq4l, GQ4L_SHIPS) THE EARLY SIGHTINGS, before the Captains Hall teach: no seal, no column inserted, the teach stays the first REQUIRED use. E1 the road's crag over the second bend; E2 the chapel's choir loft over the nave. */
  E1: { geo: 86, row: 53, sign: [84, 63] },
  E2: { geo: 366, row: 13, soldier: 369, sign: [360, 19] },
};

export function gobgeoLay(R, { T, TS }) {
  const B = GOBGEO, W = R.W, H = R.H, g = R.grid;
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y * W + x] = v; };
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const ent = (t, x, y, o = {}) => R.ents.push({ t, x, y, ...o });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  R.rocklocks = R.rocklocks || [];
  R.reachDoors = R.reachDoors || [];
  R.routeSupports = R.routeSupports || [];
  R.hcDeco = R.hcDeco || [];

  // ============ THE CAPTAINS HALL ============
  const capSign = R.ents.find(e => e.t === 'sign' && /CAPTAINS HALL/.test(e.text || ''));
  if (capSign) capSign.text = 'THE CAPTAINS HALL, AND HER GEOMANCERS. THEIR ROCKS GO BACK THE WAY THEY CAME.';
  /* 1 TEACH: the barred gate and its seal; one Geomancer behind it */
  const Tg = B.TEACH;
  for (let y = Tg.rows[0]; y <= Tg.rows[1]; y++) set(Tg.gate, y, T.PORT);
  R.rocklocks.push({ id: 'gg-teach', kind: 'seal', x: Tg.gate, y: Tg.seal, box: [Tg.gate, Tg.gate, Tg.rows[0], Tg.rows[1]], cells: [[Tg.gate, Tg.rows[0], Tg.rows[1]]], seal: 'gg-teach' });
  R.reachDoors.push({ x0: Tg.gate, x1: Tg.gate, y0: Tg.rows[0], y1: Tg.rows[1] });   /* every hero has a parry: the seal opens to all nine (src/reachcore.js) */
  ent('gobgeo', Tg.geo, 19, { face: -1, seal: 'gg-teach' });
  ent('sign', 438, 19, { text: 'STONE BREAKS THE SEAL. PARRY HIS ROCK, OR STRIKE IT, AND IT FLIES BACK THROUGH THE BARS.' });
  /* 2 SHIELD: the hall's heavy gives his post to the shield-bearer; a second Geomancer behind him */
  const S = B.SHIELD;
  R.ents = R.ents.filter(e => !(e.t === 'heavy' && e.x === 454 && e.y === 19));
  ent('shield', S.guard, 19, { face: -1 }); ent('gobgeo', S.geo, 19, { face: -1 });
  ent('sign', 451, 19, { text: 'HIS SHIELD-BEARER STANDS IN FRONT OF HIM. A ROCK SENT BACK KNOCKS A SHIELD ASIDE.' });
  /* 3 LAMP: the heavy under the third chandelier; a third Geomancer on a ledge at the far end (a net up its west end, hung on a chain) */
  const Lp = B.LAMP;
  ent('heavy', Lp.heavy, 19, { face: -1 });
  for (let x = Lp.ledge[0]; x <= Lp.ledge[1]; x++) if (at(x, Lp.row) === T.AIR) set(x, Lp.row, T.ONEWAY);
  for (let y = Lp.row; y <= 19; y++) if (at(Lp.net, y) === T.AIR || at(Lp.net, y) === T.ONEWAY) set(Lp.net, y, T.NET);
  R.routeSupports.push({ x: Lp.ledge[1], y: Lp.row, bottom: Lp.row + 2, top: 10, kind: 'hcchain' });
  ent('gobgeo', Lp.geo, Lp.row - 1, { face: -1, leash: 8, sight: 340 });   /* he watches the whole hall from his ledge: you can send his rock home from beyond the chandelier's own reach (it falls by itself within 100 px) */
  ent('sign', 464, 19, { text: 'SEND HIS ROCK UP INTO THE CHANDELIER AND IT FALLS ON WHOEVER STANDS UNDER IT.' });
  coins([477, Lp.row - 1]);

  // ============ THE BATTLEMENTS, TOWER 1: THE OLD STONE (a secret) ============
  const T1 = B.T1;
  for (let y = T1.room[2]; y <= T1.room[3]; y++) for (let x = T1.room[0]; x <= T1.room[1]; x++) set(x, y, T.AIR);     /* the chamber in the tower's body (sealed) */
  (R.interiors || (R.interiors = [])).push([T1.room[0], T1.room[1], T1.room[2], T1.room[3], 'hcguard']);   /* the chamber reads as a room, not as wall */
  R.rocklocks.push({ id: 'gg-secret', kind: 'crack', x: T1.face, y: 10, box: [T1.face, T1.face, T1.box[0], T1.box[1]], cells: [[T1.face, T1.open[0], T1.open[1]]] });
  R.reachDoors.push({ x0: T1.face, x1: T1.face, y0: T1.open[0], y1: T1.open[1] });
  for (let x = T1.ledge[0]; x <= T1.ledge[1]; x++) set(x, T1.ledge[2], T.ONEWAY);
  R.hcDeco.push({ k: 'corbel', x: T1.ledge[0], y: T1.ledge[2] + 7 / 16, n: 2 });
  for (const [a, b, row] of T1.steps) { for (let x = a; x <= b; x++) set(x, row, T.ONEWAY); for (const x of [a, b]) R.routeSupports.push({ x, y: row, bottom: 22, kind: 'hcpier' }); }
  ent('gobgeo', T1.geo, 6, { face: -1, perch: true, leash: 16 });
  coins([558, 13], [559, 12], [560, 13]); ent('mend', 559, 13);

  // ============ THE LAST WALK: WALL 2 EAST AND TOWER 2 (the combined room) ============
  const T2 = B.T2;
  R.ents = R.ents.filter(e => !((e.t === 'pike' && e.x === T2.shield) || (e.t === 'heavy' && e.x === T2.heavy)) || e.y !== 21);
  ent('shield', T2.shield, 21, { face: -1, answers: 'gg-t2' }); ent('heavy', T2.heavy, 21, { face: -1, answers: 'gg-t2' });
  ent('gatebell', T2.bell, T2.bellRow, { hold: 3 /* (GQ5FIX 11-12: 6 -> 3 s the dropped grate stays down) */, id: 'gg-t2', gate: T2.gate, gy0: T2.gy[0], gy1: T2.gy[1] });
  ent('gobgeo', T2.geo, 6, { face: -1, perch: true, leash: 16 });
  ent('sign', 586, 21, { text: 'HIS ROCK RINGS THE TOWER BELL: THE GUARDS RUN UNDER ITS GATE, AND IT DROPS ON THEM.' });
  if (G4) {   // ============ (claude/gq4l) THE EARLY SIGHTINGS: E1 THE ROAD'S CRAG, E2 THE CHAPEL LOFT (optional, gentle: a rock goes back, he is hurt, nothing is sealed) ============
    const E1 = B.E1, E2 = B.E2;
    ent('gobgeo', E1.geo, E1.row, { face: -1, perch: true, early: true, leash: 8, sight: 300 });
    ent('sign', E1.sign[0], E1.sign[1], { text: 'HIS ROCK GOES BACK THE WAY IT CAME. STRIKE IT OR PARRY IT.' });
    ent('gobgeo', E2.geo, E2.row, { face: -1, perch: true, early: true, leash: 6, sight: 300 }); ent('soldier', E2.soldier, 19, { face: -1 });
    ent('sign', E2.sign[0], E2.sign[1], { text: 'A GEOMANCER IN THE CHOIR LOFT. HIS ROCK GOES BACK THE WAY IT CAME.' });
  }
  return R;
}
